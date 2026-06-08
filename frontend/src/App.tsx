import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ToolboxItem from './components/ToolboxItem';
import InspectorPanel from './components/InspectorPanel';
import { initWebSocket, destroyWebSocket } from './services/websocket';

function App() {
  useEffect(() => {
    initWebSocket();
    return () => destroyWebSocket();
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-bg-secondary p-1">
      <div className="flex flex-1 h-full relative overflow-hidden bg-bg-secondary gap-1">
        {/* Left — Toolbox */}
        <Sidebar title="Toolbox" position="left">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
              Node Templates
            </p>
            <ToolboxItem
              type="input"
              label="Constant"
              headerBg="bg-blue-500"
              borderColor="border-blue-200 hover:border-blue-400"
            />
            <ToolboxItem
              type="output"
              label="Result"
              headerBg="bg-emerald-500"
              borderColor="border-emerald-200 hover:border-emerald-400"
            />
            <ToolboxItem
              type="operator"
              label="Operator"
              headerBg="bg-amber-500"
              borderColor="border-amber-200 hover:border-amber-400"
            />
            <ToolboxItem
              type="conditional"
              label="Conditional"
              headerBg="bg-violet-500"
              borderColor="border-violet-200 hover:border-violet-400"
            />
            <div className="h-px bg-slate-200 my-1" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
              Flow Control
            </p>
            <ToolboxItem
              type="ifelse"
              label="IfElse"
              headerBg="bg-red-500"
              borderColor="border-red-200 hover:border-red-400"
            />
            <div className="h-px bg-slate-200 my-1" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
              Variables
            </p>
            <ToolboxItem
              type="define"
              label="Define"
              headerBg="bg-yellow-400"
              borderColor="border-yellow-200 hover:border-yellow-400"
            />
            <ToolboxItem
              type="get"
              label="Get"
              headerBg="bg-teal-500"
              borderColor="border-teal-200 hover:border-teal-400"
            />
            <ToolboxItem
              type="set"
              label="Set"
              headerBg="bg-orange-500"
              borderColor="border-orange-200 hover:border-orange-400"
            />
          </div>
        </Sidebar>

        {/* Center — Canvas */}
        <Canvas />

        {/* Right — Inspector */}
        <Sidebar title="Inspector" position="right">
          <InspectorPanel />
        </Sidebar>
      </div>
    </div>
  );
}

export default App;
