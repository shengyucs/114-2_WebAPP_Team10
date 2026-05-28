import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';

const OPERATOR_SYMBOLS: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

const baseHandleStyle = {
  background: '#f59e0b',
  width: 14,
  height: 14,
  border: '2px solid white',
  boxShadow: '0 0 0 1px #f59e0b',
};

const OperatorNode: React.FC<NodeProps<FlowNodeData>> = ({
  id,
  data,
  selected,
}) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const symbol = OPERATOR_SYMBOLS[(data.operator as string) ?? '+'] ?? '+';

  return (
    <div
      className={`
        relative group
        w-full h-full rounded-lg border-2 border-amber-400 bg-white
        flex flex-col overflow-hidden
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Input A handle - top-left */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '38%' }}
      />
      {/* Input B handle - bottom-left */}
      <Handle
        id="b"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '72%' }}
      />

      {/* Header - delete button lives here, away from handles */}
      <div className="bg-amber-500 px-3 py-1 flex items-center justify-between shrink-0">
        <span className="text-white text-[9px] font-bold tracking-[0.2em]">
          OPERATOR
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

      {/* Body: A/B labels on left, symbol on right */}
      <div className="flex-1 flex items-stretch min-h-0">
        <div className="flex flex-col justify-around pl-4 pr-2 border-r border-slate-100">
          <span className="text-[10px] font-black text-slate-400 leading-none">
            A
          </span>
          <span className="text-[10px] font-black text-slate-400 leading-none">
            B
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-2xl font-bold text-amber-500 leading-none select-none">
            {symbol}
          </span>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...baseHandleStyle, top: '50%' }}
      />
    </div>
  );
};

export default OperatorNode;
