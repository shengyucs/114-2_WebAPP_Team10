import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';

const SetNode: React.FC<NodeProps<FlowNodeData>> = ({ id, data, selected }) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const key = data.variableKey ?? '';

  const handleStyle = {
    background: '#f97316',
    width: 14,
    height: 14,
    border: '2px solid white',
    boxShadow: '0 0 0 1px #f97316',
  };

  return (
    <div
      className={`
        relative group
        w-full h-full rounded-lg border-2 border-orange-400 bg-white
        flex flex-col
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Header */}
      <div className="bg-orange-500 px-3 py-1 flex items-center justify-between shrink-0 rounded-t-[6px]">
        <span className="text-white text-[9px] font-bold tracking-[0.15em] truncate max-w-[100px]">
          {data.label?.trim() || 'SET'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Delete node"
          className="nodrag opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/20 transition-all duration-150"
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
      </div>

      {/* Body */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-3 py-1 gap-0.5 min-h-0 rounded-b-lg">
        {/* V — value handle: Set fires when this is non-NaN */}
        <Handle
          id="value"
          type="target"
          position={Position.Left}
          style={{ ...handleStyle, top: '50%' }}
        />

        <span className="text-[10px] text-orange-600 font-semibold truncate max-w-full select-none">
          {key || <span className="italic text-slate-400">no key</span>}
        </span>
        <span className="text-[10px] text-slate-400 select-none">write</span>
      </div>
    </div>
  );
};

export default SetNode;
