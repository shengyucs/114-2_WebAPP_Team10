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

  socket.on(
    'calc_result',
    (payload: {
      results: Record<string, number | null>;
      variableUpdates: Record<string, number>;
    }) => {
      const store = useStore.getState();

      // JSON cannot represent NaN — it becomes null. Restore null→NaN so that
      // downstream formatValue and isNaN checks work correctly.
      const results: Record<string, number> = {};
      for (const [k, v] of Object.entries(payload.results)) {
        results[k] = v === null ? NaN : v;
      }
      store.setResults(results);

      // Store variable updates as pending — they are NOT applied automatically.
      // The user must click "Run" to advance the simulation state.
      store.setPendingVariableUpdates(payload.variableUpdates);
    },
  );

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

/**
 * Applies any pending variable updates (from Set nodes in the last calculation)
 * and triggers one fresh calculation with the updated variable state.
 * This is the only way Set node effects are committed — prevents infinite loops
 * from auto-recalculation accumulating variable state on every graph edit.
 */
export function runStep() {
  const store = useStore.getState();
  const pending = store.pendingVariableUpdates;
  if (Object.keys(pending).length > 0) {
    store.applyVariableUpdates(pending);
    store.clearPendingVariableUpdates();
  }
  emitGraph();
}

export function destroyWebSocket() {
  unsubscribe?.();
  unsubscribe = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  socket?.disconnect();
  socket = null;
}
