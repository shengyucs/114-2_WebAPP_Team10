import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';

const CONDITION_SYMBOLS: Record<string, string> = {
  '>': '>',
  '<': '<',
  '=': '=',
  '>=': '≥',
  '<=': '≤',
  '!=': '≠',
};

const baseHandleStyle = {
  background: '#ef4444',
  width: 14,
  height: 14,
  border: '2px solid white',
  boxShadow: '0 0 0 1px #ef4444',
};

const IfElseNode: React.FC<NodeProps<FlowNodeData>> = ({
  id,
  data,
  selected,
}) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const condition = (data.condition as string) ?? '>';
  const symbol = CONDITION_SYMBOLS[condition] ?? '>';

  return (
    <div
      className={`
        relative group
        w-full h-full rounded-xl border-2 border-red-400 bg-white
        flex flex-col items-center justify-center
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Input A handle — top-left */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '30%' }}
      />
      {/* Input B handle — bottom-left */}
      <Handle
        id="b"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '70%' }}
      />

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title="Delete node"
        className="nodrag absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded-full bg-white border border-red-300 text-red-700/60 hover:text-white hover:bg-red-400 shadow-sm transition-all duration-150"
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

      {/* Center: condition symbol + labels */}
      <div className="flex flex-col items-center gap-0.5 px-1">
        <span className="text-[9px] font-bold text-red-300 tracking-widest uppercase select-none">
          IF
        </span>
        <span className="text-xl font-bold text-red-500 leading-none select-none">
          {symbol}
        </span>
      </div>

      {/* True output handle — top-right */}
      <Handle
        id="true"
        type="source"
        position={Position.Right}
        style={{
          ...baseHandleStyle,
          top: '30%',
          background: '#22c55e',
          boxShadow: '0 0 0 1px #22c55e',
        }}
      />
      {/* False output handle — bottom-right */}
      <Handle
        id="false"
        type="source"
        position={Position.Right}
        style={{
          ...baseHandleStyle,
          top: '70%',
          background: '#ef4444',
          boxShadow: '0 0 0 1px #ef4444',
        }}
      />

      {/* True / False labels */}
      <div className="absolute right-4 top-[22%] text-[8px] font-bold text-green-500 select-none">
        T
      </div>
      <div className="absolute right-4 bottom-[20%] text-[8px] font-bold text-red-400 select-none">
        F
      </div>
    </div>
  );
};

export default IfElseNode;
