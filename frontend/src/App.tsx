import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';

function App() {
  return (
    <div className="flex flex-col flex-1 w-full h-full bg-bg-secondary p-1">
      <div className="flex flex-1 h-full relative overflow-hidden bg-bg-secondary gap-1">
        <Sidebar title="Toolbox" position="left">
          <div className="px-2 py-4">
            <p className="text-sm font-medium text-text-secondary/70 italic px-2">
              Node templates will appear here.
            </p>
          </div>
        </Sidebar>

        <Canvas />

        <Sidebar title="Inspector" position="right">
          <div className="px-2 py-4">
            <p className="text-sm font-medium text-text-secondary/70 italic px-2">
              Select a node to view properties.
            </p>
          </div>
        </Sidebar>
      </div>
    </div>
  );
}

export default App;
