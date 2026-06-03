import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';

const OPERATOR_SYMBOLS: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  max: 'MAX',
  min: 'MIN',
  '>': '>',
  '<': '<',
  '==': '==',
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

  // Use smaller text for multi-character symbols (MAX, MIN, ==) to fit the circle
  const symbolClass =
    symbol.length > 1
      ? 'text-[10px] font-black text-amber-500 leading-none select-none'
      : 'text-xl font-bold text-amber-500 leading-none select-none';

  return (
    <div
      className={`
        relative group
        w-full h-full rounded-full border-2 border-amber-400 bg-white
        flex items-center justify-center
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Input A handle at 30% from top on the left */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '30%' }}
      />
      {/* Input B handle at 70% from top on the left */}
      <Handle
        id="b"
        type="target"
        position={Position.Left}
        style={{ ...baseHandleStyle, top: '70%' }}
      />

      {/* Delete button — appears on hover, anchored to top-right of circle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title="Delete node"
        className="nodrag absolute top-0 right-0 opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded-full text-amber-700/60 hover:text-white hover:bg-amber-400 transition-all duration-150"
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

      {/* Operator symbol centered in the circle */}
      <span className={symbolClass}>{symbol}</span>

      {/* Output handle at 50% on the right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...baseHandleStyle, top: '50%' }}
      />
    </div>
  );
};

export default OperatorNode;
