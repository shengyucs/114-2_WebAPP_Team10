import React, { useState } from 'react';
import type { Node } from 'reactflow';
import { useStore } from '../store/useStore';
import type { FlowNodeData } from '../store/useStore';
import SectionHeader from './ui/SectionHeader';

const NODE_TYPE_LABELS: Record<string, string> = {
  input: 'Constant',
  output: 'Result',
  operator: 'Operator',
  conditional: 'Conditional',
  ifelse: 'IfElse',
  define: 'Define',
  get: 'Get',
  set: 'Set',
};

function getNodeLabel(node: Node<FlowNodeData>): string {
  if (node.data.label?.trim()) return node.data.label.trim();
  return `Unnamed ${NODE_TYPE_LABELS[node.type ?? ''] ?? 'Node'}`;
}

function formatValue(v: number): string {
  if (v == null || isNaN(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(4).replace(/\.?0+$/, '');
}

const NumInput: React.FC<{
  label: string;
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}> = ({ label, value, onChange, readOnly = false }) => {
  const [raw, setRaw] = useState(() => (value === 0 ? '' : String(value)));

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <input
        type="number"
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

const NodeLink: React.FC<{
  node: Node<FlowNodeData>;
  value: number;
  onNavigate: (id: string) => void;
}> = ({ node, value, onNavigate }) => (
  <button
    onClick={() => onNavigate(node.id)}
    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
  >
    <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700 truncate mr-2">
      {getNodeLabel(node)}
    </span>
    <span className="text-xs font-bold text-emerald-600 shrink-0">
      {formatValue(value)}
    </span>
  </button>
);

const PortRow: React.FC<{
  portLabel: string;
  connectedNode: Node<FlowNodeData> | undefined;
  value: number;
  onNavigate: (id: string) => void;
}> = ({ portLabel, connectedNode, value, onNavigate }) => (
  <div className="flex items-center gap-2 px-3 py-2">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10 shrink-0">
      {portLabel}
    </span>
    {connectedNode ? (
      <button
        onClick={() => onNavigate(connectedNode.id)}
        className="flex-1 flex items-center justify-between px-2 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors group min-w-0"
      >
        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700 truncate mr-1">
          {getNodeLabel(connectedNode)}
        </span>
        <span className="text-xs font-bold text-emerald-600 shrink-0">
          {formatValue(value)}
        </span>
      </button>
    ) : (
      <div className="flex-1 flex items-center justify-between px-2 py-1 rounded-md border border-dashed border-slate-200 bg-white">
        <span className="text-xs text-slate-300 italic">[Disconnected]</span>
        <span className="text-xs font-bold text-slate-300">0</span>
      </div>
    )}
  </div>
);

const InspectorPanel: React.FC = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const results = useStore((s) => s.results);
  const variables = useStore((s) => s.variables);
  const patchNode = useStore((s) => s.patchNode);
  const applyVariableUpdates = useStore((s) => s.applyVariableUpdates);
  const setSelectedNodeId = useStore((s) => s.setSelectedNodeId);

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
  const isInput = node.type === 'input';
  const isOutput = node.type === 'output';
  const isOperator = node.type === 'operator';
  const isConditional = node.type === 'conditional';
  const isIfElse = node.type === 'ifelse';
  const isDefine = node.type === 'define';
  const isGet = node.type === 'get';
  const isSet = node.type === 'set';
  const isVariableNode = isDefine || isGet || isSet;

  // Whether the Value section shows a read-only computed result
  const isReadOnly =
    isOutput || isOperator || isConditional || isIfElse || isGet || isSet;

  const calcResult = results[node.id] ?? 0;

  const incomingEdges = edges.filter((e) => e.target === node.id);
  const outgoingEdges = edges.filter((e) => e.source === node.id);

  const incomingNodes = incomingEdges
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter((n): n is Node<FlowNodeData> => n !== undefined);

  const outgoingNodes = outgoingEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is Node<FlowNodeData> => n !== undefined);

  const getSourceForHandle = (
    handle: string,
  ): Node<FlowNodeData> | undefined => {
    const edge = incomingEdges.find((e) => e.targetHandle === handle);
    if (!edge) return undefined;
    return nodes.find((n) => n.id === edge.source);
  };

  /** Resolves the value of the node on a named input handle, respecting IfElse per-handle results. */
  const getValueForHandle = (handle: string): number => {
    const edge = incomingEdges.find((e) => e.targetHandle === handle);
    if (!edge) return 0;
    if (edge.sourceHandle) {
      const handleKey = `${edge.source}:${edge.sourceHandle}`;
      if (handleKey in results) return results[handleKey];
    }
    return results[edge.source] ?? 0;
  };

  // All Define node keys available in the current graph
  const defineKeys = nodes
    .filter((n) => n.type === 'define' && n.data.variableKey)
    .map((n) => n.data.variableKey as string);

  // IfElse condition result for display
  const ifelseTrue = results[`${node.id}:true`];
  const ifelseFalse = results[`${node.id}:false`];
  const ifelseActive =
    ifelseTrue !== undefined
      ? !isNaN(ifelseTrue)
        ? 'true'
        : !isNaN(ifelseFalse)
          ? 'false'
          : undefined
      : undefined;

  const CONDITION_SYMBOLS: Record<string, string> = {
    '>': '>',
    '<': '<',
    '=': '=',
    '>=': '≥',
    '<=': '≤',
    '!=': '≠',
  };

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

      {/* Operator selector — math only (+, -, *, /, max, min) */}
      {isOperator && (
        <section className="px-4">
          <SectionHeader title="Operation" />
          <div className="grid grid-cols-3 gap-1.5">
            {(['+', '-', '*', '/', 'max', 'min'] as const).map((op) => {
              let label = op as string;
              if (op === '*') label = '×';
              else if (op === '/') label = '÷';
              else if (op === '-') label = '−';
              else if (op === 'max') label = 'MAX';
              else if (op === 'min') label = 'MIN';
              return (
                <button
                  key={op}
                  onClick={() => patchNode(node.id, { data: { operator: op } })}
                  className={`py-1.5 font-bold rounded-md border transition-colors ${
                    label.length > 1 ? 'text-[10px]' : 'text-xs'
                  } ${
                    data.operator === op
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* IfElse condition selector */}
      {isIfElse && (
        <section className="px-4">
          <SectionHeader title="Condition" />
          <div className="grid grid-cols-3 gap-1.5">
            {(['>', '<', '>=', '<=', '=', '!='] as const).map((cond) => (
              <button
                key={cond}
                onClick={() =>
                  patchNode(node.id, { data: { condition: cond } })
                }
                className={`py-1.5 font-bold rounded-md border transition-colors text-sm ${
                  data.condition === cond
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:bg-slate-50'
                }`}
              >
                {CONDITION_SYMBOLS[cond]}
              </button>
            ))}
          </div>
          {ifelseActive !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Path
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  ifelseActive === 'true'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {ifelseActive === 'true' ? 'TRUE ✓' : 'FALSE ✓'}
              </span>
            </div>
          )}
        </section>
      )}

      {/* Define node: key + value editing */}
      {isDefine && (
        <section className="px-4">
          <SectionHeader title="Variable" />
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Key
              </span>
              <input
                type="text"
                value={data.variableKey ?? ''}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const oldKey = data.variableKey ?? '';
                  patchNode(node.id, { data: { variableKey: newKey } });
                  // Migrate variable value to new key
                  if (newKey && newKey !== oldKey) {
                    const val =
                      oldKey in variables
                        ? variables[oldKey]
                        : (data.value ?? 0);
                    applyVariableUpdates({ [newKey]: val });
                  }
                }}
                placeholder="e.g. experience"
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-yellow-400 focus:bg-white transition-colors font-mono"
              />
            </label>
            <NumInput
              label="Initial Value"
              value={data.value ?? 0}
              onChange={(v) => {
                const key = data.variableKey ?? '';
                patchNode(node.id, { data: { value: v } });
                if (key) applyVariableUpdates({ [key]: v });
              }}
            />
            {data.variableKey && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Current Runtime Value
                </span>
                <div className="w-full px-2.5 py-2 text-sm font-bold border border-yellow-200 rounded-md bg-yellow-50 text-yellow-700">
                  {formatValue(
                    data.variableKey in variables
                      ? variables[data.variableKey]
                      : (data.value ?? 0),
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Get / Set node: key dropdown */}
      {(isGet || isSet) && (
        <section className="px-4">
          <SectionHeader title="Variable" />
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Key
            </span>
            {defineKeys.length > 0 ? (
              <select
                value={data.variableKey ?? ''}
                onChange={(e) =>
                  patchNode(node.id, { data: { variableKey: e.target.value } })
                }
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              >
                <option value="">— select key —</option>
                {defineKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-2.5 py-1.5 text-sm border border-dashed border-slate-200 rounded-md bg-slate-50 text-slate-400 italic">
                No Define nodes in graph
              </div>
            )}
          </label>
          {isGet && data.variableKey && (
            <div className="mt-2 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Value
              </span>
              <div className="w-full px-2.5 py-2 text-sm font-bold border border-teal-200 rounded-md bg-teal-50 text-teal-700">
                {formatValue(calcResult)}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Value section — only for input/output/operator/conditional */}
      {!isVariableNode && !isIfElse && (
        <section className="px-4">
          <SectionHeader title="Value" />
          <div className="flex flex-col gap-3">
            {isReadOnly ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Calculated Result
                </span>
                <div className="w-full px-2.5 py-2 text-sm font-bold border border-emerald-200 rounded-md bg-emerald-50 text-emerald-700">
                  {formatValue(calcResult)}
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
      )}

      {/* IfElse input ports (A, B) */}
      {isIfElse && (
        <section className="px-4">
          <SectionHeader title="Input Ports" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
            <PortRow
              portLabel="A"
              connectedNode={getSourceForHandle('a')}
              value={getValueForHandle('a')}
              onNavigate={setSelectedNodeId}
            />
            <PortRow
              portLabel="B"
              connectedNode={getSourceForHandle('b')}
              value={getValueForHandle('b')}
              onNavigate={setSelectedNodeId}
            />
          </div>
        </section>
      )}

      {/* Operator input ports (A, B) */}
      {isOperator && (
        <section className="px-4">
          <SectionHeader title="Input Ports" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
            <PortRow
              portLabel="A"
              connectedNode={getSourceForHandle('a')}
              value={getValueForHandle('a')}
              onNavigate={setSelectedNodeId}
            />
            <PortRow
              portLabel="B"
              connectedNode={getSourceForHandle('b')}
              value={getValueForHandle('b')}
              onNavigate={setSelectedNodeId}
            />
          </div>
        </section>
      )}

      {/* Conditional input ports */}
      {isConditional && (
        <section className="px-4">
          <SectionHeader title="Input Ports" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
            <PortRow
              portLabel="Cond"
              connectedNode={getSourceForHandle('cond')}
              value={getValueForHandle('cond')}
              onNavigate={setSelectedNodeId}
            />
            <PortRow
              portLabel="Then"
              connectedNode={getSourceForHandle('t')}
              value={getValueForHandle('t')}
              onNavigate={setSelectedNodeId}
            />
            <PortRow
              portLabel="Else"
              connectedNode={getSourceForHandle('f')}
              value={getValueForHandle('f')}
              onNavigate={setSelectedNodeId}
            />
          </div>
        </section>
      )}

      {/* Get node: trigger port */}
      {isGet && (
        <section className="px-4">
          <SectionHeader title="Input Ports" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <PortRow
              portLabel="Trig"
              connectedNode={getSourceForHandle('trigger')}
              value={getValueForHandle('trigger')}
              onNavigate={setSelectedNodeId}
            />
          </div>
        </section>
      )}

      {/* Constant node: trigger port */}
      {isInput && (
        <section className="px-4">
          <SectionHeader title="Input Ports" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <PortRow
              portLabel="Trig"
              connectedNode={getSourceForHandle('trigger')}
              value={getValueForHandle('trigger')}
              onNavigate={setSelectedNodeId}
            />
          </div>
        </section>
      )}

      {/* Set node: trigger + value ports */}
      {isSet && (
        <section className="px-4">
          <SectionHeader title="Input Ports" />
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
            <PortRow
              portLabel="Trig"
              connectedNode={getSourceForHandle('trigger')}
              value={getValueForHandle('trigger')}
              onNavigate={setSelectedNodeId}
            />
            <PortRow
              portLabel="Val"
              connectedNode={getSourceForHandle('value')}
              value={getValueForHandle('value')}
              onNavigate={setSelectedNodeId}
            />
          </div>
        </section>
      )}

      {/* Incoming connections — shown for non-port-detail nodes */}
      {!isInput &&
        !isOperator &&
        !isConditional &&
        !isIfElse &&
        !isGet &&
        !isSet &&
        incomingNodes.length > 0 && (
          <section className="px-4">
            <SectionHeader title="Incoming Connections" />
            <div className="flex flex-col gap-1.5">
              {incomingNodes.map((n) => (
                <NodeLink
                  key={n.id}
                  node={n}
                  value={results[n.id] ?? n.data.value ?? 0}
                  onNavigate={setSelectedNodeId}
                />
              ))}
            </div>
          </section>
        )}

      {/* Outgoing connections */}
      {outgoingNodes.length > 0 && (
        <section className="px-4">
          <SectionHeader title="Outgoing Connections" />
          <div className="flex flex-col gap-1.5">
            {outgoingNodes.map((n) => (
              <NodeLink
                key={n.id}
                node={n}
                value={results[n.id] ?? n.data.value ?? 0}
                onNavigate={setSelectedNodeId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default InspectorPanel;
