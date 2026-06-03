import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import type { Node, Connection } from 'reactflow';
import { wouldIntroduceCycle } from '../utils/cycleDetection';
import LZString from 'lz-string';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import { useGoogleStore } from '../store/useGoogleStore';
import { GoogleDriveService } from '../services/googleDrive';
import CalcNode from './nodes/CalcNode';
import OperatorNode from './nodes/OperatorNode';
import ConditionalNode from './nodes/ConditionalNode';
import SaveDialog from './features/SaveDialog';
import LoadDialog from './features/LoadDialog';
import type { GraphState } from '../../../shared/types';
import type { FlowNodeData } from '../store/useStore';

const nodeTypes = {
  input: CalcNode,
  output: CalcNode,
  operator: OperatorNode,
  conditional: ConditionalNode,
};

const Canvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    setNodes,
    setEdges,
    getGraphState,
  } = useStore();

  const { isConnected, userInfo, disconnect, connect } = useGoogleStore();
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  /** Maps a GraphState to ReactFlow nodes/edges and populates the canvas store. */
  const applyGraphState = useCallback(
    (state: GraphState) => {
      const flowNodes: Node<FlowNodeData>[] = state.nodes.map(
        (nodeData, index) => {
          const col = index % 4;
          const row = Math.floor(index / 4);
          const { id, type, label, value, isPercentage, operator } = nodeData;
          return {
            id,
            type,
            position: { x: 80 + col * 220, y: 80 + row * 140 },
            data: {
              label: label ?? '',
              value,
              isPercentage,
              ...(operator !== undefined ? { operator } : {}),
            },
            style: {
              width:
                type === 'operator' ? 56 : type === 'conditional' ? 70 : 140,
              height:
                type === 'operator' ? 56 : type === 'conditional' ? 90 : 75,
            },
          };
        },
      );

      const flowEdges = state.edges.map((edgeData) => ({
        id: `e-${edgeData.source}-${edgeData.target}-${edgeData.targetHandle ?? ''}`,
        source: edgeData.source,
        target: edgeData.target,
        sourceHandle: edgeData.sourceHandle,
        targetHandle: edgeData.targetHandle,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    },
    [setNodes, setEdges],
  );

  // On mount: handle URL hash routes for shared graphs
  useEffect(() => {
    const hash = window.location.hash;
    const LZ_PREFIX = '#/s/';
    const DRIVE_PREFIX = '#/drive/';

    const clearHash = () =>
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );

    if (hash.startsWith(LZ_PREFIX)) {
      // LZ-string compressed share link
      const encoded = hash.slice(LZ_PREFIX.length);
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return;

      let state: GraphState;
      try {
        state = JSON.parse(json) as GraphState;
      } catch {
        return;
      }

      applyGraphState(state);
      clearHash();
    } else if (hash.startsWith(DRIVE_PREFIX)) {
      // Public Google Drive share link — fetch anonymously (no auth token)
      const fileId = hash.slice(DRIVE_PREFIX.length);
      if (!fileId) return;

      const driveService = new GoogleDriveService();
      driveService
        .downloadPublicFile(fileId)
        .then((state) => {
          applyGraphState(state);
          clearHash();
        })
        .catch((err: unknown) => {
          console.error('Failed to load public Drive graph:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Compresses the current graph state and copies a share URL to the clipboard. */
  const handleShare = useCallback(() => {
    const state = getGraphState();
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(state),
    );
    const url = `${window.location.origin}${window.location.pathname}#/s/${compressed}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [getGraphState]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  /** Blocks a connection in the UI if it would introduce a cycle in the DAG. */
  const checkIsValidConnection = useCallback(
    (connection: Connection) => !wouldIntroduceCycle(nodes, edges, connection),
    [nodes, edges],
  );

  return (
    <div className="flex-1 relative bg-bg-secondary flex flex-col overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        isValidConnection={checkIsValidConnection}
        deleteKeyCode="Delete"
        connectionRadius={30}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        minZoom={0.2}
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-color)"
        />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'input') return '#3b82f6';
            if (n.type === 'output') return '#10b981';
            if (n.type === 'operator') return '#f59e0b';
            if (n.type === 'conditional') return '#8b5cf6';
            return '#d1d9e6';
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#dbeafe';
            if (n.type === 'output') return '#d1fae5';
            if (n.type === 'operator') return '#fef3c7';
            if (n.type === 'conditional') return '#ede9fe';
            return '#fff';
          }}
          maskColor="rgba(240, 244, 248, 0.6)"
          nodeBorderRadius={8}
        />

        {/* Clean, low-key Floating Cloud Panel integrated natively into ReactFlow top-right corner */}
        <Panel position="top-right" className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 p-1.5 rounded-xl shadow-md select-none">
              {/* User profile picture or custom initials */}
              {userInfo?.picture ? (
                <img
                  src={userInfo.picture}
                  referrerPolicy="no-referrer"
                  alt=""
                  className="w-7 h-7 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 uppercase">
                  {userInfo?.name?.charAt(0) || 'U'}
                </div>
              )}

              <button
                onClick={() => setIsSaveOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all duration-150"
              >
                Save
              </button>

              <button
                onClick={() => setIsLoadOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-all duration-150"
              >
                Load
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-all duration-150"
              >
                {shareCopied ? 'Copied!' : 'Share'}
              </button>

              <button
                onClick={disconnect}
                title="Disconnect Account"
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Share button — available without login */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm hover:bg-slate-50 border border-slate-200 rounded-xl shadow-md transition-all duration-150 hover:-translate-y-[1px]"
              >
                {shareCopied ? 'Copied!' : 'Share'}
              </button>

              {/* Minimalist Google Drive Trigger Button with Cloud SVG, NO custom google logo */}
              <button
                onClick={() => connect()}
                className="group flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm hover:bg-slate-50 border border-slate-200 rounded-xl shadow-md transition-all duration-150 hover:-translate-y-[1px]"
              >
                <svg
                  className="w-4 h-4 text-slate-500 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
                Connect Google Drive
              </button>
            </div>
          )}
        </Panel>
      </ReactFlow>

      {/* Save Modal Dialog */}
      {isSaveOpen && <SaveDialog onClose={() => setIsSaveOpen(false)} />}

      {/* Load Modal Dialog */}
      {isLoadOpen && <LoadDialog onClose={() => setIsLoadOpen(false)} />}
    </div>
  );
};

export default Canvas;
