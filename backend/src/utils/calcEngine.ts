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
 * Calculates results for every node in the graph.
 * Returns a map of { nodeId → computed output value }.
 *
 * Rules:
 * - Input node: output = node.value (if isPercentage, output = 1 + value/100)
 * - Output node: output = sum of all upstream node values
 * - Operator node: output = A [op] B using handle-based inputs (default 0)
 * - The Zero Rule: any missing/disconnected input = 0
 */
export function calculate(graph: GraphState): Record<string, number> {
  const { nodes, edges } = graph;

  if (nodes.length === 0) return {};

  const sorted = topologicalSort(nodes, edges);

  // Build lookup maps
  const nodeMap = new Map<string, NodeData>(nodes.map((n) => [n.id, n]));
  // incomingEdges[targetId] = list of edges pointing to that node
  const incomingEdges = new Map<string, EdgeData[]>();
  for (const node of nodes) incomingEdges.set(node.id, []);
  for (const edge of edges) {
    incomingEdges.get(edge.target)?.push(edge);
  }

  const results: Record<string, number> = {};

  for (const id of sorted) {
    const node = nodeMap.get(id)!;
    const incoming = incomingEdges.get(id) ?? [];

    if (node.type === 'input') {
      const raw = node.value ?? 0;
      results[id] = node.isPercentage ? 1 + raw / 100 : raw;
    } else if (node.type === 'output') {
      // Sum all upstream values
      results[id] = incoming.reduce(
        (sum, edge) => sum + (results[edge.source] ?? 0),
        0,
      );
    } else if (node.type === 'operator') {
      const edgeA = incoming.find((e) => e.targetHandle === 'a');
      const edgeB = incoming.find((e) => e.targetHandle === 'b');
      const A = edgeA ? (results[edgeA.source] ?? 0) : 0;
      const B = edgeB ? (results[edgeB.source] ?? 0) : 0;

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
        case '>':
          results[id] = A > B ? 1 : 0;
          break;
        case '<':
          results[id] = A < B ? 1 : 0;
          break;
        case '==':
          results[id] = A === B ? 1 : 0;
          break;
        default:
          results[id] = 0;
      }
    } else if (node.type === 'conditional') {
      // Reads from handles 'cond', 't', 'f'; missing connections default to 0
      const edgeCond = incoming.find((e) => e.targetHandle === 'cond');
      const edgeT = incoming.find((e) => e.targetHandle === 't');
      const edgeF = incoming.find((e) => e.targetHandle === 'f');
      const cond = edgeCond ? (results[edgeCond.source] ?? 0) : 0;
      const tVal = edgeT ? (results[edgeT.source] ?? 0) : 0;
      const fVal = edgeF ? (results[edgeF.source] ?? 0) : 0;
      results[id] = cond !== 0 ? tVal : fVal;
    }
  }

  return results;
}
