import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { FlowNodeData } from '../../store/useStore';

const OPERATOR_SYMBOLS: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

const baseHandleStyle = {
  background: '#f59e0b',
  width: 10,
  height: 10,
  border: '2px solid white',
  boxShadow: '0 0 0 1px #f59e0b',
};

const OperatorNode: React.FC<NodeProps<FlowNodeData>> = ({
  data,
  selected,
}) => {
  const symbol = OPERATOR_SYMBOLS[(data.operator as string) ?? '+'] ?? '+';

  return (
    <div
      className={`
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
      {/* Input A — top-left handle */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '38%' }}
      />
      {/* Input B — bottom-left handle */}
      <Handle
        id="b"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '72%' }}
      />

      {/* Header */}
      <div className="bg-amber-500 px-3 py-1 flex items-center justify-between shrink-0">
        <span className="text-white text-[9px] font-bold tracking-[0.2em]">
          OPERATOR
        </span>
        {data.label ? (
          <span className="text-white/70 text-[9px] truncate max-w-[80px]">
            {data.label}
          </span>
        ) : null}
      </div>

      {/* Body: A/B labels on left, symbol on right */}
      <div className="flex-1 flex items-stretch min-h-0">
        {/* A / B row labels — visually aligned with the two handles */}
        <div className="flex flex-col justify-around pl-4 pr-2 border-r border-slate-100">
          <span className="text-[10px] font-black text-slate-400 leading-none">
            A
          </span>
          <span className="text-[10px] font-black text-slate-400 leading-none">
            B
          </span>
        </div>

        {/* Operator symbol */}
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
