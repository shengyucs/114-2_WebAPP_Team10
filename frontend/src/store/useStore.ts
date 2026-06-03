import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import type { CSSProperties } from 'react';

import type { GraphState, NodeData } from '../../../shared/types';
import { wouldIntroduceCycle } from '../utils/cycleDetection';

// Data stored inside each ReactFlow node (excludes id & type, which live on the node wrapper)
export type FlowNodeData = Omit<NodeData, 'id' | 'type'>;

interface NodePatch {
  data?: Partial<FlowNodeData>;
  position?: { x: number; y: number };
  style?: CSSProperties;
}

interface StoreState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  results: Record<string, number>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setResults: (results: Record<string, number>) => void;
  addNode: (type: NodeData['type']) => void;
  deleteNode: (id: string) => void;
  patchNode: (id: string, patch: NodePatch) => void;
  getGraphState: () => GraphState;
  layoutNodes: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  results: {},

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    if (wouldIntroduceCycle(nodes, edges, connection)) return;
    set({ edges: addEdge(connection, edges) });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setResults: (results) => set({ results }),

  addNode: (type) => {
    const id = crypto.randomUUID();
    const count = get().nodes.length;
    const col = count % 4;
    const row = Math.floor(count / 4);
    const newNode: Node<FlowNodeData> = {
      id,
      type,
      position: { x: 80 + col * 220, y: 80 + row * 140 },
      data: {
        label: '',
        value: 0,
        isPercentage: false,
        ...(type === 'operator' ? { operator: '+' as const } : {}),
      },
      style: {
        width: type === 'operator' ? 56 : type === 'conditional' ? 70 : 140,
        height: type === 'operator' ? 56 : type === 'conditional' ? 90 : 75,
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  patchNode: (id, patch) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id !== id) return n;
        const updated = { ...n };
        if (patch.position !== undefined) updated.position = patch.position;
        if (patch.style !== undefined)
          updated.style = { ...n.style, ...patch.style };
        if (patch.data !== undefined)
          updated.data = { ...n.data, ...patch.data };
        return updated;
      }),
    });
  },

  layoutNodes: () => {
    const { nodes, edges } = get();

    // Build parent lookup: for each node, collect the IDs of its source (parent) nodes
    const parents = new Map<string, string[]>();
    // Build child lookup: for each node, collect the IDs of its target (child) nodes
    const children = new Map<string, string[]>();

    for (const node of nodes) {
      parents.set(node.id, []);
      children.set(node.id, []);
    }
    for (const edge of edges) {
      parents.get(edge.target)?.push(edge.source);
      children.get(edge.source)?.push(edge.target);
    }

    // Memoized recursive helper: longest path (topological depth) from any root
    const memo = new Map<string, number>();
    const getLevel = (nodeId: string): number => {
      if (memo.has(nodeId)) return memo.get(nodeId)!;
      const nodeParents = parents.get(nodeId) ?? [];
      const level =
        nodeParents.length === 0
          ? 0
          : Math.max(...nodeParents.map((p) => getLevel(p) + 1));
      memo.set(nodeId, level);
      return level;
    };

    // Resolve levels for all nodes and group them into columns
    const levelGroups = new Map<number, string[]>();
    for (const node of nodes) {
      const level = getLevel(node.id);
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(node.id);
    }

    // Crossing minimization using a simple 2-pass Barycenter heuristic
    const maxLevel = Math.max(...Array.from(levelGroups.keys()), 0);
    const rowIndexes = new Map<string, number>();

    // Initial assignment of row indexes based on their topological group ordering
    for (let l = 0; l <= maxLevel; l++) {
      const group = levelGroups.get(l) ?? [];
      group.forEach((id, index) => {
        rowIndexes.set(id, index);
      });
    }

    // Pass 1: Forward Pass (Level 1 to maxLevel) - align with parents
    for (let l = 1; l <= maxLevel; l++) {
      const group = levelGroups.get(l) ?? [];
      const barycenters = group.map((nodeId) => {
        const nodeParents = parents.get(nodeId) ?? [];
        const assignedParents = nodeParents.filter((pId) =>
          rowIndexes.has(pId),
        );

        const score =
          assignedParents.length > 0
            ? assignedParents.reduce((s, pId) => s + rowIndexes.get(pId)!, 0) /
              assignedParents.length
            : group.indexOf(nodeId);

        return { nodeId, score };
      });

      barycenters.sort((a, b) => a.score - b.score);
      const sortedGroup = barycenters.map((b) => b.nodeId);
      levelGroups.set(l, sortedGroup);

      // Re-assign row indexes for this level
      sortedGroup.forEach((id, index) => {
        rowIndexes.set(id, index);
      });
    }

    // Pass 2: Backward Pass (maxLevel - 1 down to 0) - align with children
    for (let l = maxLevel - 1; l >= 0; l--) {
      const group = levelGroups.get(l) ?? [];
      const barycenters = group.map((nodeId) => {
        const nodeChildren = children.get(nodeId) ?? [];
        const assignedChildren = nodeChildren.filter((cId) =>
          rowIndexes.has(cId),
        );

        const score =
          assignedChildren.length > 0
            ? assignedChildren.reduce((s, cId) => s + rowIndexes.get(cId)!, 0) /
              assignedChildren.length
            : group.indexOf(nodeId);

        return { nodeId, score };
      });

      barycenters.sort((a, b) => a.score - b.score);
      const sortedGroup = barycenters.map((b) => b.nodeId);
      levelGroups.set(l, sortedGroup);

      // Re-assign row indexes for this level
      sortedGroup.forEach((id, index) => {
        rowIndexes.set(id, index);
      });
    }

    // Find the maximum number of nodes in any column to center columns vertically
    let maxNodesInCol = 0;
    for (let l = 0; l <= maxLevel; l++) {
      const count = levelGroups.get(l)?.length ?? 0;
      if (count > maxNodesInCol) {
        maxNodesInCol = count;
      }
    }

    // Assign grid positions with vertical centering
    const updatedNodes = nodes.map((node) => {
      const level = getLevel(node.id);
      const group = levelGroups.get(level)!;
      const rowIndex = group.indexOf(node.id);

      // Vertical centering offset
      const offset = (maxNodesInCol - group.length) * 70;

      return {
        ...node,
        position: {
          x: level * 260 + 80,
          y: rowIndex * 140 + 80 + offset,
        },
      };
    });

    set({ nodes: updatedNodes });
  },

  getGraphState: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as NodeData['type'],
        ...n.data,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined,
      })),
    };
  },
}));
