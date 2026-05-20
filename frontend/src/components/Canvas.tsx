import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import type { NodeSelectionChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import Timeline from './Timeline';
import CalcNode from './nodes/CalcNode';

const nodeTypes = {
  input: CalcNode,
  output: CalcNode,
  buff: CalcNode,
};

const Canvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
  } = useStore();

  // Sync ReactFlow selection state → our store
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      const selectionChange = changes.find(
        (c): c is NodeSelectionChange => c.type === 'select',
      );
      if (selectionChange) {
        setSelectedNodeId(selectionChange.selected ? selectionChange.id : null);
      }
    },
    [onNodesChange, setSelectedNodeId],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="flex-1 relative bg-bg-secondary flex flex-col overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        minZoom={0.2}
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-color)"
        />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'input') return '#3b82f6';
            if (n.type === 'output') return '#10b981';
            if (n.type === 'buff') return '#8b5cf6';
            return '#d1d9e6';
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#dbeafe';
            if (n.type === 'output') return '#d1fae5';
            if (n.type === 'buff') return '#ede9fe';
            return '#fff';
          }}
          maskColor="rgba(240, 244, 248, 0.6)"
          nodeBorderRadius={8}
        />
      </ReactFlow>
      <Timeline />
    </div>
  );
};

export default Canvas;
