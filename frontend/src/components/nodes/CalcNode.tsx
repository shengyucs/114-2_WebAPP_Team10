import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useStore, type FlowNodeData } from '../../store/useStore';
import type { NodeData } from '../../../../shared/types';

const NODE_STYLES = {
  input: {
    border: 'border-blue-400',
    header: 'bg-blue-500',
    handleColor: '#3b82f6',
    typeLabel: 'CONSTANT',
  },
  output: {
    border: 'border-emerald-400',
    header: 'bg-emerald-500',
    handleColor: '#10b981',
    typeLabel: 'RESULT',
  },
} as const;

const CalcNode: React.FC<NodeProps<FlowNodeData>> = ({
  id,
  data,
  selected,
  type,
}) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const patchNode = useStore((s) => s.patchNode);
  const calcResult = useStore((s) => s.results[id]);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(() => String(data.value));

  const handleSave = () => {
    const val = parseFloat(editValue);
    const committed = isNaN(val) ? 0 : val;
    patchNode(id, { data: { value: committed } });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(String(data.value));
      setIsEditing(false);
    }
  };

  const nodeType = (type as NodeData['type']) ?? 'input';
  const style =
    NODE_STYLES[nodeType as keyof typeof NODE_STYLES] ?? NODE_STYLES.input;
  const isOutput = nodeType === 'output';

  const handleStyle = {
    background: style.handleColor,
    width: 14,
    height: 14,
    border: '2px solid white',
    boxShadow: '0 0 0 1px ' + style.handleColor,
  };

  // Output nodes display the backend-calculated result
  const displayValue = isOutput ? (calcResult ?? 0) : data.value;

  return (
    <div
      className={`
        relative group
        w-full h-full rounded-lg border-2 ${style.border} bg-white
        flex flex-col
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Header — delete button lives here, away from handles */}
      <div
        className={`${style.header} px-3 py-1 flex items-center justify-between shrink-0 rounded-t-[6px]`}
      >
        <span
          className="text-white text-[9px] font-bold tracking-[0.15em] truncate max-w-[100px]"
          title={data.label?.trim() || style.typeLabel}
        >
          {data.label?.trim() ? data.label.trim() : style.typeLabel}
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

      {/* Body — handles are placed here to center ports vertically relative to this section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-3 py-1 gap-1.5 min-h-0 rounded-b-lg">
        {/* Left target handle — hidden for CONSTANT nodes (output-only; no incoming connections) */}
        {isOutput && (
          <Handle type="target" position={Position.Left} style={handleStyle} />
        )}

        {!isOutput && isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            onFocus={(e) => e.target.select()}
            className="nodrag w-24 text-center font-bold text-base text-slate-800 border border-blue-300 rounded focus:outline-none focus:border-blue-500 py-0.5 bg-blue-50/50"
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            onDoubleClick={() => {
              if (!isOutput) {
                setEditValue(String(data.value));
                setIsEditing(true);
              }
            }}
            className={`font-bold leading-tight select-none ${
              isOutput
                ? 'text-lg text-emerald-600'
                : 'text-base text-slate-800 hover:text-blue-600 cursor-pointer'
            }`}
            title={isOutput ? undefined : 'Double click to edit'}
          >
            {isOutput
              ? Number.isInteger(displayValue)
                ? displayValue
                : displayValue.toFixed(4).replace(/\.?0+$/, '')
              : displayValue}
            {data.isPercentage ? '%' : ''}
          </p>
        )}

        {/* Right source handle */}
        <Handle type="source" position={Position.Right} style={handleStyle} />
      </div>
    </div>
  );
};

export default CalcNode;
