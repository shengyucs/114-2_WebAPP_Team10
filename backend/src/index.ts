import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { calculate } from './utils/calcEngine.js';
import type { GraphState } from '../../../shared/types.js';

dotenv.config();

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

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
