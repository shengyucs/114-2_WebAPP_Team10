import React, { useEffect, useState } from 'react';
import { useGoogleStore } from '../../store/useGoogleStore';

interface LoadDialogProps {
  onClose: () => void;
}

export default function LoadDialog({ onClose }: LoadDialogProps) {
  const {
    cloudFiles,
    fetchCloudFiles,
    loadCloudGraph,
    deleteCloudGraph,
    isLoading,
  } = useGoogleStore();
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCloudFiles();
  }, [fetchCloudFiles]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelect = async (id: string) => {
    setError('');
    try {
      await loadCloudGraph(id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load graph.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering loadCloudGraph
    if (
      !confirm(
        'Are you sure you want to delete this calculation from the cloud?',
      )
    ) {
      return;
    }
    setError('');
    try {
      await deleteCloudGraph(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete graph.');
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
    } catch {
      return isoStr;
    }
  };

  const cleanName = (filename: string) => {
    return filename.endsWith('.calc') ? filename.slice(0, -5) : filename;
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 animate-fadeIn">
      {/* Glassmorphic Panel Frame */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Technical Corner Ornaments */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-blue-500/60 pointer-events-none"></div>
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-blue-500/60 pointer-events-none"></div>
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-blue-500/60 pointer-events-none"></div>
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-blue-500/60 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase font-mono">
              Load Graph from Cloud
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
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

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-1.5 font-mono flex-shrink-0">
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* File List Area */}
        <div className="mt-4 overflow-y-auto flex-1 pr-1 flex flex-col gap-2">
          {isLoading && cloudFiles.length === 0 ? (
            /* Skeleton Loading Wave Preloaders */
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50/40 animate-pulse"
              >
                <div className="flex flex-col gap-2 w-2/3">
                  <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="h-7 w-12 bg-slate-200 rounded-lg"></div>
              </div>
            ))
          ) : cloudFiles.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
              <svg
                className="w-10 h-10 text-slate-300 mb-2 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                />
              </svg>
              <p className="text-xs font-bold text-slate-500 font-mono">
                No calculations found in cloud
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Save your current graph to Google Drive to begin.
              </p>
            </div>
          ) : (
            /* Actual File List */
            cloudFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleSelect(file.id)}
                className="group w-full p-3.5 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 active:bg-blue-50/50 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {cleanName(file.name)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Saved: {formatDate(file.createdTime)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleDelete(e, file.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4.5 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
