import React, { useState, useEffect, useRef } from 'react';
import { useGoogleStore } from '../../store/useGoogleStore';

interface SaveDialogProps {
  onClose: () => void;
}

export default function SaveDialog({ onClose }: SaveDialogProps) {
  const { saveCurrentGraph, isLoading } = useGoogleStore();
  const [filename, setFilename] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `graph_${yyyy}${mm}${dd}_${hh}${min}`;
  });
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input safely on mount
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      setError('Filename cannot be empty');
      return;
    }

    setError('');
    try {
      await saveCurrentGraph(filename.trim());
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to save graph to cloud',
      );
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 animate-fadeIn">
      {/* Glassmorphic Panel Frame */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-6 overflow-hidden">
        {/* Technical Corner Ornaments */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-blue-500/60 pointer-events-none"></div>
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-blue-500/60 pointer-events-none"></div>
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-blue-500/60 pointer-events-none"></div>
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-blue-500/60 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase font-mono">
              Save Graph to Cloud
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Calculation File Name
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isLoading}
                placeholder="my_epic_build"
                className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none shadow-inner focus:shadow-md focus:shadow-blue-500/5 transition-all duration-200"
              />
              <span className="absolute right-3.5 text-[10px] font-bold text-slate-400 font-mono select-none">
                .calc
              </span>
            </div>
            {error && (
              <span className="text-[10px] font-semibold text-red-500 pl-1 mt-1 font-mono flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 rounded-xl shadow-lg shadow-blue-500/20 active:shadow-none transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving Draft...
                </>
              ) : (
                'Confirm Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
