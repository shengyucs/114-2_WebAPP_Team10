import type { GraphState, NodeData, EdgeData } from '../../../shared/types.js';

export class CircularDependencyError extends Error {
  constructor() {
    super('CircularDependencyError: graph contains a cycle');
    this.name = 'CircularDependencyError';
  }
}

/**
 * Executes Kahn's topological sort on the graph.
 * Throws CircularDependencyError if a cycle is detected.
 */
function topologicalSort(nodes: NodeData[], edges: EdgeData[]): string[] {
  const inDegree = new Map<string, number>();
  const adjOut = new Map<string, string[]>(); // source → [targets]

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjOut.set(node.id, []);
  }

  for (const edge of edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    adjOut.get(edge.source)?.push(edge.target);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjOut.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodes.length) {
    throw new CircularDependencyError();
  }

  return sorted;
}

/**
 * Resolves the output value of a source edge.
 * IfElse nodes store per-handle results as `nodeId:handleId`.
 * All other nodes store a single result as `nodeId`.
 */
function resolveSource(
  edge: EdgeData,
  results: Record<string, number>,
): number {
  if (edge.sourceHandle) {
    const handleKey = `${edge.source}:${edge.sourceHandle}`;
    if (handleKey in results) return results[handleKey];
  }
  return results[edge.source] ?? 0;
}

export interface CalcResult {
  results: Record<string, number>;
  variableUpdates: Record<string, number>;
}

/**
 * Calculates results for every node in the graph.
 *
 * Returns:
 * - results: map of nodeId (or nodeId:handleId for IfElse) → computed value
 * - variableUpdates: map of variableKey → new value for Set nodes that executed
 *
 * Flow control (IfElse):
 * - Active path output = 1; inactive path output = NaN (blocked sentinel)
 * - NaN propagates through arithmetic automatically (JavaScript behavior)
 * - Output nodes treat NaN inputs as 0 to avoid polluting sums
 * - Set nodes skip the update when their input value is NaN
 *
 * The Zero Rule: any missing/disconnected input defaults to 0.
 */
export function calculate(graph: GraphState): CalcResult {
  const { nodes, edges } = graph;
  const variables = graph.variables ?? {};

  if (nodes.length === 0) return { results: {}, variableUpdates: {} };

  const sorted = topologicalSort(nodes, edges);

  const nodeMap = new Map<string, NodeData>(nodes.map((n) => [n.id, n]));
  const incomingEdges = new Map<string, EdgeData[]>();
  for (const node of nodes) incomingEdges.set(node.id, []);
  for (const edge of edges) {
    incomingEdges.get(edge.target)?.push(edge);
  }

  const results: Record<string, number> = {};
  const variableUpdates: Record<string, number> = {};

  for (const id of sorted) {
    const node = nodeMap.get(id)!;
    const incoming = incomingEdges.get(id) ?? [];

    if (node.type === 'input') {
      const triggerEdge = incoming.find((e) => e.targetHandle === 'trigger');
      if (triggerEdge) {
        const triggerVal = resolveSource(triggerEdge, results);
        if (isNaN(triggerVal)) {
          results[id] = NaN;
          continue;
        }
      }
      const raw = node.value ?? 0;
      results[id] = node.isPercentage ? 1 + raw / 100 : raw;
    } else if (node.type === 'output') {
      // Sum all upstream values; treat NaN as 0 to avoid polluting the result
      results[id] = incoming.reduce((sum, edge) => {
        const v = resolveSource(edge, results);
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
    } else if (node.type === 'operator') {
      const edgeA = incoming.find((e) => e.targetHandle === 'a');
      const edgeB = incoming.find((e) => e.targetHandle === 'b');
      const A = edgeA ? resolveSource(edgeA, results) : 0;
      const B = edgeB ? resolveSource(edgeB, results) : 0;

      // NaN propagates naturally through all arithmetic (JS behavior)
      switch (node.operator) {
        case '+':
          results[id] = A + B;
          break;
        case '-':
          results[id] = A - B;
          break;
        case '*':
          results[id] = A * B;
          break;
        case '/':
          if (B === 0) {
            console.warn(
              `[calcEngine] Division by zero at node ${id}, returning 0`,
            );
            results[id] = 0;
          } else {
            results[id] = A / B;
          }
          break;
        case 'max':
          results[id] = Math.max(A, B);
          break;
        case 'min':
          results[id] = Math.min(A, B);
          break;
        default:
          results[id] = 0;
      }
    } else if (node.type === 'conditional') {
      const edgeCond = incoming.find((e) => e.targetHandle === 'cond');
      const edgeT = incoming.find((e) => e.targetHandle === 't');
      const edgeF = incoming.find((e) => e.targetHandle === 'f');
      const cond = edgeCond ? resolveSource(edgeCond, results) : 0;
      const tVal = edgeT ? resolveSource(edgeT, results) : 0;
      const fVal = edgeF ? resolveSource(edgeF, results) : 0;
      results[id] = cond !== 0 ? tVal : fVal;
    } else if (node.type === 'ifelse') {
      const edgeA = incoming.find((e) => e.targetHandle === 'a');
      const edgeB = incoming.find((e) => e.targetHandle === 'b');
      const A = edgeA ? resolveSource(edgeA, results) : 0;
      const B = edgeB ? resolveSource(edgeB, results) : 0;

      let conditionMet: boolean;
      switch (node.condition) {
        case '>':
          conditionMet = A > B;
          break;
        case '<':
          conditionMet = A < B;
          break;
        case '=':
          conditionMet = A === B;
          break;
        case '>=':
          conditionMet = A >= B;
          break;
        case '<=':
          conditionMet = A <= B;
          break;
        case '!=':
          conditionMet = A !== B;
          break;
        default:
          conditionMet = false;
      }

      // Active path = 1, inactive path = NaN (blocked sentinel)
      results[`${id}:true`] = conditionMet ? 1 : NaN;
      results[`${id}:false`] = conditionMet ? NaN : 1;
    } else if (node.type === 'define') {
      const key = node.variableKey ?? '';
      results[id] = key in variables ? variables[key] : (node.value ?? 0);
    } else if (node.type === 'get') {
      const triggerEdge = incoming.find((e) => e.targetHandle === 'trigger');
      if (triggerEdge) {
        const triggerVal = resolveSource(triggerEdge, results);
        if (isNaN(triggerVal)) {
          results[id] = NaN;
          continue;
        }
      }
      const key = node.variableKey ?? '';
      results[id] = key in variables ? variables[key] : 0;
    } else if (node.type === 'set') {
      const valueEdge = incoming.find((e) => e.targetHandle === 'value');
      if (!valueEdge) {
        results[id] = 0;
        continue;
      }
      const value = resolveSource(valueEdge, results);
      const key = node.variableKey ?? '';
      if (key && !isNaN(value)) {
        variableUpdates[key] = value;
      }
      results[id] = 0;
    }
  }

  return { results, variableUpdates };
}
