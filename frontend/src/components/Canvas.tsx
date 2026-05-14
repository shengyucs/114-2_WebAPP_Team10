import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import Timeline from './Timeline';

const Canvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();

  return (
    <div className="flex-1 relative bg-bg-secondary flex flex-col overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
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
            if (n.type === 'output') return '#ef4444';
            if (n.type === 'buff') return '#8b5cf6';
            return '#d1d9e6';
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#3b82f6';
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
