import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';

const GetNode: React.FC<NodeProps<FlowNodeData>> = ({ id, data, selected }) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const results = useStore((s) => s.results);
  const key = data.variableKey ?? '';
  const calcValue = results[id];
  const displayValue =
    calcValue !== undefined && !isNaN(calcValue)
      ? Number.isInteger(calcValue)
        ? calcValue
        : calcValue.toFixed(4).replace(/\.?0+$/, '')
      : '—';

  const handleStyle = {
    background: '#14b8a6',
    width: 14,
    height: 14,
    border: '2px solid white',
    boxShadow: '0 0 0 1px #14b8a6',
  };

  return (
    <div
      className={`
        relative group
        w-full h-full rounded-lg border-2 border-teal-400 bg-white
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
      <div className="bg-teal-500 px-3 py-1 flex items-center justify-between shrink-0 rounded-t-[6px]">
        <span className="text-white text-[9px] font-bold tracking-[0.15em] truncate max-w-[100px]">
          {data.label?.trim() || 'GET'}
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
        {/* Left trigger handle */}
        <Handle
          id="trigger"
          type="target"
          position={Position.Left}
          style={handleStyle}
        />

        <span className="text-[10px] text-teal-600 font-semibold truncate max-w-full select-none">
          {key || <span className="italic text-slate-400">no key</span>}
        </span>
        <span className="font-bold text-base text-slate-800 leading-tight select-none">
          {displayValue}
        </span>

        {/* Right source handle */}
        <Handle type="source" position={Position.Right} style={handleStyle} />
      </div>
    </div>
  );
};

export default GetNode;
