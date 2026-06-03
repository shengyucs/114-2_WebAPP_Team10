import React from 'react';
import { useStore } from '../store/useStore';
import type { NodeData } from '../../../shared/types';

interface ToolboxItemProps {
  type: NodeData['type'];
  label: string;
  description: string;
  headerBg: string;
  borderColor: string;
}

const ToolboxItem: React.FC<ToolboxItemProps> = ({
  type,
  label,
  description,
  headerBg,
  borderColor,
}) => {
  const addNode = useStore((s) => s.addNode);

  return (
    <button
      onClick={() => addNode(type)}
      className={`
        w-full text-left px-3 py-2.5 rounded-lg border-2 ${borderColor}
        bg-white hover:bg-slate-50 transition-all duration-150
        active:scale-95 group cursor-pointer
      `}
    >
      <div className="flex items-center gap-3">
        {/* Mini node icon */}
        <div
          className={`w-8 h-8 rounded-md ${headerBg} flex items-center justify-center shrink-0 shadow-sm`}
        >
          <span className="text-white text-[9px] font-bold tracking-widest">
            {type === 'input'
              ? 'CO'
              : type === 'output'
                ? 'RE'
                : type.slice(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 leading-tight">
            {label}
          </p>
          <p className="text-xs text-slate-400 leading-tight mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ToolboxItem;
