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

const AUTOSAVE_KEY = 'rpg_calc_autosave';

interface AutosaveData {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
}

/** Returns true only when localStorage is accessible (guards against SSR and test environments). */
const isLocalStorageAvailable = (): boolean =>
  typeof window !== 'undefined' && window.localStorage != null;

/** Reads persisted graph state from localStorage. Falls back to empty arrays on any error. */
const loadAutosave = (): AutosaveData => {
  if (!isLocalStorageAvailable()) return { nodes: [], edges: [] };
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return { nodes: [], edges: [] };
    return JSON.parse(raw) as AutosaveData;
  } catch {
    return { nodes: [], edges: [] };
  }
};

/** Writes the current nodes and edges to localStorage. Silently ignores quota or access errors. */
const saveAutosave = (nodes: Node<FlowNodeData>[], edges: Edge[]): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ nodes, edges }));
  } catch {
    // Ignore storage quota exceeded or permission errors
  }
};

const rawSave = loadAutosave();
// Migrate old Set nodes that were saved with height 75 before the dual-handle redesign
const savedState = {
  ...rawSave,
  nodes: rawSave.nodes.map((n) =>
    n.type === 'set' && (n.style as { height?: number })?.height === 75
      ? { ...n, style: { ...n.style, height: 90 } }
      : n,
  ),
};

/** Seeds variables from Define nodes' data.value for any key not already present. */
const seedDefineVariables = (
  nodes: Node<FlowNodeData>[],
  base: Record<string, number> = {},
): Record<string, number> => {
  const result = { ...base };
  for (const node of nodes) {
    if (
      node.type === 'define' &&
      node.data.variableKey &&
      !(node.data.variableKey in result)
    ) {
      result[node.data.variableKey] = node.data.value ?? 0;
    }
  }
  return result;
};

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
  variables: Record<string, number>;
  pendingVariableUpdates: Record<string, number>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setResults: (results: Record<string, number>) => void;
  applyVariableUpdates: (updates: Record<string, number>) => void;
  setPendingVariableUpdates: (updates: Record<string, number>) => void;
  clearPendingVariableUpdates: () => void;
  addNode: (type: NodeData['type']) => void;
  deleteNode: (id: string) => void;
  patchNode: (id: string, patch: NodePatch) => void;
  getGraphState: () => GraphState;
  layoutNodes: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: savedState.nodes,
  edges: savedState.edges,
  selectedNodeId: null,
  results: {},
  variables: seedDefineVariables(savedState.nodes),
  pendingVariableUpdates: {},

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

  applyVariableUpdates: (updates) => {
    // Merge variable updates without triggering a WebSocket re-emit
    // (called from Run button or inspector Define-key edits, not from auto-calc)
    set({ variables: { ...get().variables, ...updates } });
  },

  setPendingVariableUpdates: (updates) => {
    set({ pendingVariableUpdates: updates });
  },

  clearPendingVariableUpdates: () => {
    set({ pendingVariableUpdates: {} });
  },

  addNode: (type) => {
    const id = crypto.randomUUID();
    const count = get().nodes.length;
    const col = count % 4;
    const row = Math.floor(count / 4);

    const isSmall = type === 'operator';
    const isMedium = type === 'conditional' || type === 'ifelse';

    const newNode: Node<FlowNodeData> = {
      id,
      type,
      position: { x: 80 + col * 220, y: 80 + row * 140 },
      data: {
        label: '',
        value: 0,
        isPercentage: false,
        ...(type === 'operator' ? { operator: '+' as const } : {}),
        ...(type === 'ifelse' ? { condition: '>' as const } : {}),
        ...(type === 'define' || type === 'get' || type === 'set'
          ? { variableKey: '' }
          : {}),
      },
      style: {
        width: isSmall ? 56 : isMedium ? 80 : 140,
        // Set node is 90px tall to accommodate two left handles (trigger + value)
        height: isSmall ? 56 : isMedium || type === 'set' ? 90 : 75,
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  deleteNode: (id) => {
    const { nodes, variables } = get();
    const deletedNode = nodes.find((n) => n.id === id);

    // If deleting a Define node, remove its key from variables if no other Define uses it
    let updatedVariables = variables;
    if (deletedNode?.type === 'define') {
      const key = deletedNode.data.variableKey ?? '';
      const otherDefineWithSameKey = nodes.some(
        (n) => n.id !== id && n.type === 'define' && n.data.variableKey === key,
      );
      if (key && !otherDefineWithSameKey) {
        const next = { ...variables };
        delete next[key];
        updatedVariables = next;
      }
    }

    set({
      nodes: nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      variables: updatedVariables,
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

    // Helper: Determine node height based on its type
    const getNodeHeight = (type: string): number => {
      if (type === 'operator') return 56;
      if (type === 'conditional' || type === 'ifelse' || type === 'set')
        return 90;
      return 75;
    };

    // Helper: Determine handle relative offset ratio based on node type and handleId
    const getHandleRatio = (
      type: string,
      handleId: string | undefined,
      isSource: boolean,
    ): number => {
      if (type === 'ifelse') {
        if (isSource) {
          if (handleId === 'true') return 0.3;
          if (handleId === 'false') return 0.7;
        } else {
          if (handleId === 'a') return 0.3;
          if (handleId === 'b') return 0.7;
        }
        return 0.5;
      }
      if (isSource) return 0.5;

      if (type === 'operator') {
        if (handleId === 'a') return 0.3;
        if (handleId === 'b') return 0.7;
        return 0.5;
      }
      if (type === 'conditional') {
        if (handleId === 'cond') return 0.2;
        if (handleId === 't') return 0.5;
        if (handleId === 'f') return 0.8;
        return 0.5;
      }
      if (type === 'get') {
        if (handleId === 'trigger') return 0.5;
        return 0.5;
      }
      if (type === 'set') {
        if (handleId === 'trigger') return 0.3;
        if (handleId === 'value') return 0.7;
        return 0.5;
      }
      return 0.5;
    };

    // Helper: Calculate absolute handle Y position
    const getAbsoluteHandleY = (
      nodeY: number,
      type: string,
      handleId: string | undefined,
      isSource: boolean,
    ): number => {
      const height = getNodeHeight(type);
      const ratio = getHandleRatio(type, handleId, isSource);
      return nodeY + height * ratio;
    };

    // Helper to find the node definition by ID
    const findNodeData = (id: string) => {
      return nodes.find((n) => n.id === id);
    };

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

    // Pass 1: Forward Pass (Level 1 to maxLevel) - align with parent output handle y-positions
    for (let l = 1; l <= maxLevel; l++) {
      const group = levelGroups.get(l) ?? [];
      const barycenters = group.map((nodeId) => {
        // Find edges entering this node
        const incomingEdges = edges.filter((e) => e.target === nodeId);
        const activeEdges = incomingEdges.filter((e) =>
          rowIndexes.has(e.source),
        );

        const score =
          activeEdges.length > 0
            ? activeEdges.reduce((sum, e) => {
                const parentRowIndex = rowIndexes.get(e.source)!;
                const parentNode = findNodeData(e.source);
                const parentType = parentNode?.type ?? 'input';
                const parentY = parentRowIndex * 140 + 80;

                // Get absolute Y of the parent's source handle
                const sourceHandleY = getAbsoluteHandleY(
                  parentY,
                  parentType,
                  e.sourceHandle ?? undefined,
                  true,
                );
                return sum + sourceHandleY;
              }, 0) / activeEdges.length
            : group.indexOf(nodeId) * 140 + 80;

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

    // Pass 2: Backward Pass (maxLevel - 1 down to 0) - align with child input handle y-positions
    for (let l = maxLevel - 1; l >= 0; l--) {
      const group = levelGroups.get(l) ?? [];
      const barycenters = group.map((nodeId) => {
        // Find edges leaving this node
        const outgoingEdges = edges.filter((e) => e.source === nodeId);
        const activeEdges = outgoingEdges.filter((e) =>
          rowIndexes.has(e.target),
        );

        const score =
          activeEdges.length > 0
            ? activeEdges.reduce((sum, e) => {
                const childRowIndex = rowIndexes.get(e.target)!;
                const childNode = findNodeData(e.target);
                const childType = childNode?.type ?? 'output';
                const childY = childRowIndex * 140 + 80;

                // Get absolute Y of the child's target handle
                const targetHandleY = getAbsoluteHandleY(
                  childY,
                  childType,
                  e.targetHandle ?? undefined,
                  false,
                );
                return sum + targetHandleY;
              }, 0) / activeEdges.length
            : group.indexOf(nodeId) * 140 + 80;

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
    const { nodes, edges, variables } = get();
    // Seed any Define-node keys not yet set in runtime variables so Get nodes
    // always see the correct initial value instead of falling back to 0
    const effectiveVariables = seedDefineVariables(nodes, variables);
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
      variables: effectiveVariables,
    };
  },
}));

// Persist only when nodes or edges change by reference, skipping unrelated state updates
// (e.g. selectedNodeId changes or calculation results) to avoid unnecessary serialization.
useStore.subscribe((state, prevState) => {
  if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
    saveAutosave(state.nodes, state.edges);
  }
});
