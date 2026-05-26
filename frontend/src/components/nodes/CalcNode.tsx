import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { FlowNodeData } from '../../store/useStore';
import type { NodeData } from '../../../../shared/types';

const NODE_STYLES = {
  input: {
    border: 'border-blue-400',
    header: 'bg-blue-500',
    handleColor: '#3b82f6',
    typeLabel: 'INPUT',
  },
  output: {
    border: 'border-emerald-400',
    header: 'bg-emerald-500',
    handleColor: '#10b981',
    typeLabel: 'OUTPUT',
  },
} as const;

const CalcNode: React.FC<NodeProps<FlowNodeData>> = ({
  data,
  selected,
  type,
}) => {
  const nodeType = (type as NodeData['type']) ?? 'input';
  const style = NODE_STYLES[nodeType] ?? NODE_STYLES.input;
  const handleStyle = {
    background: style.handleColor,
    width: 10,
    height: 10,
    border: '2px solid white',
    boxShadow: '0 0 0 1px ' + style.handleColor,
  };

  return (
    <div
      className={`
        w-full h-full rounded-lg border-2 ${style.border} bg-white
        flex flex-col overflow-hidden
        transition-shadow duration-150
        ${
          selected
            ? 'shadow-[0_0_0_2px_#2563eb,0_4px_20px_rgba(37,99,235,0.25)]'
            : 'shadow-md hover:shadow-lg'
        }
      `}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {/* Header */}
      <div
        className={`${style.header} px-3 py-1 flex items-center justify-between shrink-0`}
      >
        <span className="text-white text-[9px] font-bold tracking-[0.2em]">
          {style.typeLabel}
        </span>
        {data.isPercentage && (
          <span className="text-white/70 text-[10px] font-semibold">%</span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-1 gap-0.5 min-h-0">
        {data.label ? (
          <p className="text-[10px] text-slate-500 truncate w-full text-center leading-none">
            {data.label}
          </p>
        ) : null}
        <p className="text-base font-bold text-slate-800 leading-none">
          {data.value}
          {data.isPercentage ? '%' : ''}
        </p>
        <p className="text-[9px] text-slate-300 truncate leading-none">
          {data.multiplierZone || 'default'}
        </p>
      </div>

      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};

export default CalcNode;
