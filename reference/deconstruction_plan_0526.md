# Deconstruction Plan: Safe Removal of Buff & Timeline Features

This specialized implementation plan outlines the exact, step-by-step file modifications and deletions required to **safely strip out the Buff nodes, Timeline features, and associated time-based states (`currentTime`)** from the frontend codebase.

Completing this cleanup first (Phase 0) ensures that the repository remains clean, compile-safe, and perfectly set up for the implementation of the core DAG calculator engine.

---

## Proposed Changes (File Deconstruction Workflow)

### Component 1: Shared Types Definition

#### [MODIFY] [types.ts](file:///d:/GitHub/114-2_WebAPP_Team10/shared/types.ts)

- Remove the `'buff'` string literal from the `type` union in `NodeData`.
- Delete optional `startTime` and `endTime` properties.
- **Reference Code Blocks**:

```diff
 export interface NodeData {
   id: string;
-  type: 'input' | 'output' | 'buff' | 'operator';
+  type: 'input' | 'output' | 'operator';
   label?: string; // Optional display name
   multiplierZone: string; // Identifier for the calculation zone
   value: number; // Numeric stat value
   isPercentage: boolean; // True if value is a percentage
-  startTime?: number; // Active start time for buffs
-  endTime?: number; // Active end time for buffs
   operator?: '+' | '-' | '*' | '/'; // Only for operator nodes
 }
```

---

### Component 2: Global State Cleanup

#### [MODIFY] [useStore.ts](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/store/useStore.ts)

- Remove `currentTime` property and `setCurrentTime` action from `StoreState` interface and store initializer.
- **Reference Code Blocks**:

```diff
 interface StoreState {
   nodes: Node<FlowNodeData>[];
   edges: Edge[];
-  currentTime: number;
   selectedNodeId: string | null;
   onNodesChange: OnNodesChange;
   onEdgesChange: OnEdgesChange;
   onConnect: (connection: Connection) => void;
   setNodes: (nodes: Node<FlowNodeData>[]) => void;
   setEdges: (edges: Edge[]) => void;
-  setCurrentTime: (time: number) => void;
   setSelectedNodeId: (id: string | null) => void;
   addNode: (type: NodeData['type']) => void;
   patchNode: (id: string, patch: NodePatch) => void;
   getGraphState: () => GraphState;
 }

 export const useStore = create<StoreState>((set, get) => ({
   nodes: [],
   edges: [],
-  currentTime: 0,
   selectedNodeId: null,
   ...
   setNodes: (nodes) => set({ nodes }),
   setEdges: (edges) => set({ edges }),
-  setCurrentTime: (time) => set({ currentTime: time }),
   setSelectedNodeId: (id) => set({ selectedNodeId: id }),
```

---

### Component 3: Component Deletions & Style Cleanup

#### [DELETE] [Timeline.tsx](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/components/Timeline.tsx)

- Completely delete this component file from the filesystem.

#### [MODIFY] [index.css](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/index.css)

- Remove the unused CSS variable `--timeline-height` from root properties.

```diff
 :root {
-  --timeline-height: 80px;
   ...
 }
```

---

### Component 4: App Layout & Toolbox

#### [MODIFY] [App.tsx](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/App.tsx)

- Remove the `ToolboxItem` for "Buff Node" in the left Sidebar column.
- **Reference Code Blocks** (Lines 23-29):

```diff
             <ToolboxItem
               type="input"
               label="Input Node"
               description="Defines a base stat value"
               headerBg="bg-blue-500"
               borderColor="border-blue-200 hover:border-blue-400"
             />
-            <ToolboxItem
-              type="buff"
-              label="Buff Node"
-              description="Adds a time-based modifier"
-              headerBg="bg-purple-500"
-              borderColor="border-purple-200 hover:border-purple-400"
-            />
             <ToolboxItem
               type="output"
               label="Output Node"
```

---

### Component 5: Canvas & MiniMap Adjustments

#### [MODIFY] [Canvas.tsx](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/components/Canvas.tsx)

- Remove the `Timeline` component import and render statement.
- Remove `buff` node type mapping from `nodeTypes`.
- Clean up MiniMap stroke and color properties that styled `buff` nodes.
- **Reference Code Blocks**:

```diff
-import Timeline from './Timeline';
...
 const nodeTypes = {
   input: CalcNode,
   output: CalcNode,
-  buff: CalcNode,
   operator: OperatorNode,
 };
...
         <MiniMap
           nodeStrokeColor={(n) => {
             if (n.type === 'input') return '#3b82f6';
             if (n.type === 'output') return '#10b981';
-            if (n.type === 'buff') return '#8b5cf6';
             if (n.type === 'operator') return '#f59e0b';
             return '#d1d9e6';
           }}
           nodeColor={(n) => {
             if (n.type === 'input') return '#dbeafe';
             if (n.type === 'output') return '#d1fae5';
-            if (n.type === 'buff') return '#ede9fe';
             if (n.type === 'operator') return '#fef3c7';
             return '#fff';
           }}
...
-      <Timeline />
```

---

### Component 6: Node Render Adjustments

#### [MODIFY] [CalcNode.tsx](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/components/nodes/CalcNode.tsx)

- Remove the `buff` style configurations and type mappings from `NODE_STYLES` helper.
- **Reference Code Blocks** (Lines 20-25):

```diff
   output: {
     border: 'border-emerald-400',
     header: 'bg-emerald-500',
     handleColor: '#10b981',
     typeLabel: 'OUTPUT',
   },
-  buff: {
-    border: 'border-purple-400',
-    header: 'bg-purple-500',
-    handleColor: '#8b5cf6',
-    typeLabel: 'BUFF',
-  },
 } as const;
```

---

### Component 7: Inspector Property Panel Cleanup

#### [MODIFY] [InspectorPanel.tsx](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/components/InspectorPanel.tsx)

- Remove the `isBuff` flag calculation.
- Completely remove the conditional rendering block of the "Timeline" inputs section.
- **Reference Code Blocks**:

```diff
   const { data } = node;
   const width = (node.style?.width as number | undefined) ?? 180;
   const height = (node.style?.height as number | undefined) ?? 90;
-  const isBuff = node.type === 'buff';
   const isOperator = node.type === 'operator';
...
-      {/* Timeline — only for buff nodes */}
-      {isBuff && (
-        <section className="px-4">
-          <SectionHeader title="Timeline" />
-          <div className="grid grid-cols-2 gap-3">
-            <NumInput
-              label="Start (s)"
-              value={data.startTime ?? 0}
-              min={0}
-              onChange={(v) => patchNode(node.id, { data: { startTime: v } })}
-            />
-            <NumInput
-              label="End (s)"
-              value={data.endTime ?? 0}
-              min={0}
-              onChange={(v) => patchNode(node.id, { data: { endTime: v } })}
-            />
-          </div>
-        </section>
-      )}
```

---

### Component 8: Jest / Vitest Layout Test Adjustment

#### [MODIFY] [App.test.tsx](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/App.test.tsx)

- Delete the layout unit test that expects the `Timeline` to render, avoiding compilation/testing failure.
- **Reference Code Blocks** (Lines 38-41):

```diff
-  it('renders the Timeline', () => {
-    render(<App />);
-    expect(screen.getByText(/Timeline Controller/i)).toBeInTheDocument();
-  });
```

---

## Verification Plan for Phase 0

1. **Compilation Validation**: Ensure the React application compiles perfectly with `npm run build` or `npm run dev` after all modifications, with zero TypeScript warnings or import faults.
2. **Test Suite Integrity**: Execute `npm run test` or `npx vitest run` in the frontend directory. The test suite should pass 100% cleanly without missing timeline errors.
3. **Canvas Verification**: Drag Input, Output, and Operator nodes onto the grid, connect them, and confirm the Sidebar toolbox contains only these three node templates.
