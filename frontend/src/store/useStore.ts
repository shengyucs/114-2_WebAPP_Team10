import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';

// We will use the shared types for the node data
import type { GraphState, NodeData } from '../../../../shared/types';

interface StoreState {
  nodes: Node[];
  edges: Edge[];
  currentTime: number;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setCurrentTime: (time: number) => void;
  getGraphState: () => GraphState;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  currentTime: 0,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setCurrentTime: (time) => set({ currentTime: time }),

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
      })),
    };
  },
}));
