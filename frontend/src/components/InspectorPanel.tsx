import React, { useState } from 'react';
import type { Node } from 'reactflow';
import { useStore } from '../store/useStore';
import type { FlowNodeData } from '../store/useStore';
import SectionHeader from './ui/SectionHeader';

// Maps internal node type to its human-readable display name
const NODE_TYPE_LABELS: Record<string, string> = {
  input: 'Constant',
  output: 'Result',
  operator: 'Operator',
  conditional: 'Conditional',
};

/** Returns the display label for a node, falling back to "Unnamed <Type>". */
function getNodeLabel(node: Node<FlowNodeData>): string {
  if (node.data.label?.trim()) return node.data.label.trim();
  return `Unnamed ${NODE_TYPE_LABELS[node.type ?? ''] ?? 'Node'}`;
}

/** Formats a numeric value for compact display — trims trailing zeros. */
function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(4).replace(/\.?0+$/, '');
}

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

/** Clickable chip that selects and navigates to another node in the graph. */
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

/** Single row in a port-detail table: port label + connected node (or disconnected state). */
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
  const patchNode = useStore((s) => s.patchNode);
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
  const isOutput = node.type === 'output';
  const isOperator = node.type === 'operator';
  const isConditional = node.type === 'conditional';
  const isReadOnly = isOutput || isOperator || isConditional;
  const calcResult = results[node.id] ?? 0;

  // Partition edges by direction relative to the selected node
  const incomingEdges = edges.filter((e) => e.target === node.id);
  const outgoingEdges = edges.filter((e) => e.source === node.id);

  const incomingNodes = incomingEdges
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter((n): n is Node<FlowNodeData> => n !== undefined);

  const outgoingNodes = outgoingEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is Node<FlowNodeData> => n !== undefined);

  /** Finds the source node wired to a specific named input handle. */
  const getSourceForHandle = (
    handle: string,
  ): Node<FlowNodeData> | undefined => {
    const edge = incomingEdges.find((e) => e.targetHandle === handle);
    if (!edge) return undefined;
    return nodes.find((n) => n.id === edge.source);
  };

  /** Returns the resolved value (computed or raw) of the node on a named input handle. */
  const getValueForHandle = (handle: string): number => {
    const src = getSourceForHandle(handle);
    if (!src) return 0;
    return results[src.id] ?? src.data.value ?? 0;
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
            /* Calculated result display for output / operator / conditional */
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

      {/* Input port detail breakdown for Operator nodes (A and B) */}
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

      {/* Input port detail breakdown for Conditional nodes (Cond, Then, Else) */}
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

      {/* Incoming connections — shown for non-operator/conditional nodes */}
      {!isOperator && !isConditional && incomingNodes.length > 0 && (
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

      {/* Outgoing connections — shown for all node types */}
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
