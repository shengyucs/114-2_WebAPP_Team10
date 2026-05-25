import { useState } from 'react';
import { useGoogleStore } from '../store/useGoogleStore';
import SaveDialog from './features/SaveDialog';
import LoadDialog from './features/LoadDialog';

export default function Header() {
  const { isConnected, userInfo, disconnect, connect } = useGoogleStore();
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(false);

  return (
    <header className="relative w-full h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-30 select-none">
      {/* Corner Technical Ornaments */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-blue-500/60 pointer-events-none"></div>
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-blue-500/60 pointer-events-none"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-blue-500/60 pointer-events-none"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-blue-500/60 pointer-events-none"></div>

      {/* Left Area: Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-slate-800 tracking-wide font-sans flex items-center gap-2">
            STATUS NODE CALCULATOR
            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono border border-blue-100 font-semibold tracking-normal">
              v1.2 // core
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase font-mono">
            RPG Theorycrafting engine
          </p>
        </div>
      </div>

      {/* Right Area: Connection Status */}
      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-3">
            {/* Profile Avatar / Info */}
            <div className="group relative flex items-center gap-2.5 pl-3 border-l border-slate-200">
              {userInfo?.picture ? (
                <img
                  src={userInfo.picture}
                  referrerPolicy="no-referrer"
                  alt={userInfo.name}
                  className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 shadow-sm uppercase">
                  {userInfo?.name.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {userInfo?.name || 'RPG Crafter'}
                </span>
                <span className="text-[9px] text-slate-400 leading-none font-mono">
                  {userInfo?.email || 'crafter@local'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setIsSaveOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-500/10 transition-all duration-200 hover:-translate-y-[1px]"
              >
                <svg
                  className="w-4 h-4"
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
                Save
              </button>

              <button
                onClick={() => setIsLoadOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-all duration-200 hover:-translate-y-[1px]"
              >
                <svg
                  className="w-4 h-4 text-slate-500"
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
                Load
              </button>

              <button
                onClick={disconnect}
                title="Disconnect Account"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors duration-150"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Clean Google Connect Button with low-key Cloud Icon, NO custom Google Logo */
          <button
            onClick={() => connect()}
            className="group flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-[1px]"
          >
            <svg
              className="w-4.5 h-4.5 text-slate-500 transition-transform duration-300 group-hover:scale-110"
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
        )}
      </div>

      {/* Save Modal Dialog */}
      {isSaveOpen && <SaveDialog onClose={() => setIsSaveOpen(false)} />}

      {/* Load Modal Dialog */}
      {isLoadOpen && <LoadDialog onClose={() => setIsLoadOpen(false)} />}
    </header>
  );
}
