import type { Node, Edge, Connection } from 'reactflow';

/**
 * Determines whether adding a new connection would introduce a cycle in the DAG.
 *
 * Strategy: A cycle forms when the proposed target node can already reach the
 * proposed source node through existing edges. We verify this with an iterative
 * DFS starting from `target`. If `source` is discovered, the new edge would close
 * a loop and must be rejected.
 */
export function wouldIntroduceCycle(
  nodes: Node[],
  edges: Edge[],
  connection: Connection,
): boolean {
  const { source, target } = connection;

  if (source === null || target === null) return false;

  // A node connecting to itself is always a cycle.
  if (source === target) return true;

  // Build an adjacency list from the current edge set.
  const adjacency = new Map<string, Set<string>>();
  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    adjacency.get(edge.source)!.add(edge.target);
  }

  // Iterative DFS from `target` — check if `source` is reachable.
  const visited = new Set<string>();
  const stack: string[] = [target];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === source) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }
  }

  return false;
}
