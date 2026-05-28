import { io, type Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

let socket: Socket | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;

function emitGraph() {
  if (!socket?.connected) return;
  const graph = useStore.getState().getGraphState();
  socket.emit('update_graph', { graph });
}

export function initWebSocket() {
  if (socket) return; // already initialised

  socket = io(BACKEND_URL, { autoConnect: true });

  socket.on('connect', () => {
    console.log('[ws] connected');
    emitGraph(); // sync immediately on (re)connect
  });

  socket.on('disconnect', () => {
    console.log('[ws] disconnected');
  });

  socket.on('calc_result', (results: Record<string, number>) => {
    useStore.getState().setResults(results);
  });

  socket.on('calc_error', (err: { message: string }) => {
    console.error('[ws] calc_error:', err.message);
  });

  // Re-emit graph with 100ms debounce whenever nodes or edges change
  unsubscribe = useStore.subscribe((state, prev) => {
    if (state.nodes !== prev.nodes || state.edges !== prev.edges) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(emitGraph, 100);
    }
  });
}

export function destroyWebSocket() {
  unsubscribe?.();
  unsubscribe = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  socket?.disconnect();
  socket = null;
}
