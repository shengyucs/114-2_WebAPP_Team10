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
        width: type === 'operator' ? 56 : 180,
        height: type === 'operator' ? 56 : 90,
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
