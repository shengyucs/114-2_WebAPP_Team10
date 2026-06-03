import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';

const baseHandleStyle = {
  background: '#8b5cf6',
  width: 14,
  height: 14,
  border: '2px solid white',
  boxShadow: '0 0 0 1px #8b5cf6',
};

const ConditionalNode: React.FC<NodeProps<FlowNodeData>> = ({
  id,
  selected,
}) => {
  const deleteNode = useStore((s) => s.deleteNode);

  return (
    // No overflow-hidden so handles render as full circles outside the card boundary
    <div
      className={`
        relative group
        w-full h-full rounded-xl border-2 border-violet-400 bg-white
        flex items-center justify-center
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Condition input handle — receives the boolean/comparison result */}
      <Handle
        id="cond"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '20%' }}
      />
      {/* True-branch input handle */}
      <Handle
        id="t"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '50%' }}
      />
      {/* False-branch input handle */}
      <Handle
        id="f"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '80%' }}
      />

      {/* Delete button — visible on hover, anchored to top-right corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title="Delete node"
        className="nodrag absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded-full bg-white border border-violet-300 text-violet-700/60 hover:text-white hover:bg-violet-400 shadow-sm transition-all duration-150"
      >
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* If-Else indicator centered in the card */}
      <span className="text-2xl font-bold text-violet-500 select-none">?</span>

      {/* Single output handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...baseHandleStyle, top: '50%' }}
      />
    </div>
  );
};

export default ConditionalNode;
