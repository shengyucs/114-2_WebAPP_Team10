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
              label="Input Node"
              description="Defines a base stat value"
              headerBg="bg-blue-500"
              borderColor="border-blue-200 hover:border-blue-400"
            />
            <ToolboxItem
              type="output"
              label="Output Node"
              description="Displays the final result"
              headerBg="bg-emerald-500"
              borderColor="border-emerald-200 hover:border-emerald-400"
            />
            <ToolboxItem
              type="operator"
              label="Operator Node"
              description="Applies +, −, ×, or ÷ to inputs"
              headerBg="bg-amber-500"
              borderColor="border-amber-200 hover:border-amber-400"
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
