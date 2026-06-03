import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculate } from './utils/calcEngine.js';
import type { GraphState } from '../../shared/types.js';

dotenv.config();

// ES module equivalents for __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.send('Backend is running');
});

io.on('connection', (socket) => {
  console.log(`[socket] client connected: ${socket.id}`);

  socket.on('update_graph', (payload: { graph: GraphState }) => {
    try {
      const results = calculate(payload.graph);
      socket.emit('calc_result', results);
    } catch (err) {
      console.error('[calcEngine] error:', err);
      socket.emit('calc_error', { message: (err as Error).message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
  });
});

// Serve compiled frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const FRONTEND_BUILD_PATH =
    process.env.FRONTEND_BUILD_PATH ??
    path.join(__dirname, '../../../../frontend/dist');

  // Serve static files (JS, CSS, images, etc.) from the frontend build directory
  app.use(express.static(FRONTEND_BUILD_PATH));

  // Fallback: send index.html for any unmatched route so React SPA client routing works
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_BUILD_PATH, 'index.html'));
  });
}

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
