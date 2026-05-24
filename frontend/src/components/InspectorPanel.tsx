import type React from 'react';
import { useStore } from '../store/useStore';
import SectionHeader from './ui/SectionHeader';

// key-based remount ensures the input shows fresh value when selection changes
const NumInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}> = ({ label, value, onChange, min }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </span>
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => {
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
      }}
      className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
    />
  </label>
);

const InspectorPanel: React.FC = () => {
  const nodes = useStore((s) => s.nodes);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const patchNode = useStore((s) => s.patchNode);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-slate-300 rounded-sm" />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select a node on the canvas to inspect its properties.
        </p>
      </div>
    );
  }

  const { data } = node;
  const width = (node.style?.width as number | undefined) ?? 180;
  const height = (node.style?.height as number | undefined) ?? 90;
  const isBuff = node.type === 'buff';
  const isOperator = node.type === 'operator';

  const OPERATORS: {
    value: '+' | '-' | '*' | '/';
    symbol: string;
    label: string;
  }[] = [
    { value: '+', symbol: '+', label: 'Add' },
    { value: '-', symbol: '−', label: 'Subtract' },
    { value: '*', symbol: '×', label: 'Multiply' },
    { value: '/', symbol: '÷', label: 'Divide' },
  ];

  return (
    <div className="flex flex-col gap-5 py-3">
      {/* Operation — only for operator nodes */}
      {isOperator && (
        <section className="px-4">
          <SectionHeader title="Operation" />
          <div className="grid grid-cols-4 gap-1.5">
            {OPERATORS.map((op) => (
              <button
                key={op.value}
                title={op.label}
                onClick={() =>
                  patchNode(node.id, { data: { operator: op.value } })
                }
                className={`
                  py-2 rounded-md border-2 text-lg font-bold transition-all duration-100
                  ${
                    (data.operator ?? '+') === op.value
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-amber-400 hover:text-amber-500'
                  }
                `}
              >
                {op.symbol}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Identification */}
      <section className="px-4">
        <SectionHeader title="Identification" />
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Label
          </span>
          <input
            type="text"
            value={data.label ?? ''}
            onChange={(e) =>
              patchNode(node.id, { data: { label: e.target.value } })
            }
            placeholder="Optional"
            className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
        </label>
      </section>

      {/* Value */}
      <section className="px-4">
        <SectionHeader title="Value" />
        <div className="flex flex-col gap-3">
          <NumInput
            label="Value"
            value={data.value}
            onChange={(v) => patchNode(node.id, { data: { value: v } })}
          />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isPercentage}
              onChange={(e) =>
                patchNode(node.id, { data: { isPercentage: e.target.checked } })
              }
              className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
            />
            <span className="text-sm text-slate-600">Is Percentage (%)</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Zone
            </span>
            <input
              type="text"
              value={data.multiplierZone}
              onChange={(e) =>
                patchNode(node.id, { data: { multiplierZone: e.target.value } })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </label>
        </div>
      </section>

      {/* Timeline — only for buff nodes */}
      {isBuff && (
        <section className="px-4">
          <SectionHeader title="Timeline" />
          <div className="grid grid-cols-2 gap-3">
            <NumInput
              label="Start (s)"
              value={data.startTime ?? 0}
              min={0}
              onChange={(v) => patchNode(node.id, { data: { startTime: v } })}
            />
            <NumInput
              label="End (s)"
              value={data.endTime ?? 0}
              min={0}
              onChange={(v) => patchNode(node.id, { data: { endTime: v } })}
            />
          </div>
        </section>
      )}

      {/* Position */}
      <section className="px-4">
        <SectionHeader title="Position" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput
            label="X"
            value={node.position.x}
            onChange={(v) =>
              patchNode(node.id, { position: { x: v, y: node.position.y } })
            }
          />
          <NumInput
            label="Y"
            value={node.position.y}
            onChange={(v) =>
              patchNode(node.id, { position: { x: node.position.x, y: v } })
            }
          />
        </div>
      </section>

      {/* Size */}
      <section className="px-4">
        <SectionHeader title="Size" />
        <div className="grid grid-cols-2 gap-3">
          <NumInput
            label="Width"
            value={width}
            min={60}
            onChange={(v) =>
              patchNode(node.id, { style: { width: Math.max(60, v) } })
            }
          />
          <NumInput
            label="Height"
            value={height}
            min={40}
            onChange={(v) =>
              patchNode(node.id, { style: { height: Math.max(40, v) } })
            }
          />
        </div>
      </section>
    </div>
  );
};

export default InspectorPanel;
