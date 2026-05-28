import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import SectionHeader from './ui/SectionHeader';

// Shows empty string when value is 0 so users don't have to clear "0" first.
// Commits to store on blur; placeholder="0" shows the implied default.
// key={node.id + label} in parent ensures remount when a different node is selected.
const NumInput: React.FC<{
  label: string;
  value: number;
  onChange?: (v: number) => void;
  min?: number;
  readOnly?: boolean;
}> = ({ label, value, onChange, min, readOnly = false }) => {
  const [raw, setRaw] = useState(() => (value === 0 ? '' : String(value)));

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <input
        type="number"
        min={min}
        value={raw}
        readOnly={readOnly}
        placeholder="0"
        onChange={(e) => {
          if (readOnly) return;
          setRaw(e.target.value);
          const n = parseFloat(e.target.value);
          if (!isNaN(n)) onChange?.(n);
        }}
        onBlur={() => {
          if (readOnly) return;
          const n = parseFloat(raw);
          const committed = isNaN(n) ? 0 : n;
          onChange?.(committed);
          setRaw(committed === 0 ? '' : String(committed));
        }}
        className={`w-full px-2.5 py-1.5 text-sm border rounded-md transition-colors ${
          readOnly
            ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
            : 'border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white'
        }`}
      />
    </label>
  );
};

const InspectorPanel: React.FC = () => {
  const nodes = useStore((s) => s.nodes);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const results = useStore((s) => s.results);
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
  const isOutput = node.type === 'output';
  const isOperator = node.type === 'operator';
  const isReadOnly = isOutput || isOperator;
  const calcResult = results[node.id] ?? 0;

  return (
    <div key={node.id} className="flex flex-col gap-5 py-3">
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

      {/* Operator selector — only for operator nodes */}
      {isOperator && (
        <section className="px-4">
          <SectionHeader title="Operation" />
          <div className="grid grid-cols-4 gap-1.5">
            {(['+', '-', '*', '/'] as const).map((op) => (
              <button
                key={op}
                onClick={() => patchNode(node.id, { data: { operator: op } })}
                className={`py-1.5 text-sm font-bold rounded-md border transition-colors ${
                  data.operator === op
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                }`}
              >
                {op === '*' ? '×' : op === '/' ? '÷' : op}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Value */}
      <section className="px-4">
        <SectionHeader title="Value" />
        <div className="flex flex-col gap-3">
          {isReadOnly ? (
            /* Calculated result display for output/operator */
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Calculated Result
              </span>
              <div className="w-full px-2.5 py-2 text-sm font-bold border border-emerald-200 rounded-md bg-emerald-50 text-emerald-700">
                {Number.isInteger(calcResult)
                  ? calcResult
                  : calcResult.toFixed(4).replace(/\.?0+$/, '')}
              </div>
            </div>
          ) : (
            <>
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
                    patchNode(node.id, {
                      data: { isPercentage: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  Is Percentage (%)
                </span>
              </label>
            </>
          )}
        </div>
      </section>

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
