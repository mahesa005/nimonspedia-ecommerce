import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import auctionRoutes from './routes/auctionRoutes';
import userRoutes from './routes/userRoutes';
import auctionSocket from './sockets/auctionSocket';

import { adminLoginController } from './controllers/adminAuthController';
import { adminMeHandler } from './controllers/adminMeController';
import { requireAdmin } from './middleware/requireAdmin';
import { requireSocketAuth } from './middleware/requireSession';
import chatRoutes from './routes/chatRoutes';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

app.set('io', io)

// Typed Route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    service: 'Nimonspedia Node.js (TypeScript)', 
    status: 'active', 
    timestamp: new Date() 
  });
});

// Admin Authentication Routes
// Accessible via Nginx proxy at /api/node/admin/...
// or directly at localhost:3000/admin/...
app.post('/admin/login', adminLoginController);
app.get('/admin/me', requireAdmin, adminMeHandler);

// Auction API Routes
app.use('/auctions', auctionRoutes);
app.use('', userRoutes);
app.use('/chats', chatRoutes);

// Websocket Middleware
io.use(requireSocketAuth);

// WebSocket Logic
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);
  const user = socket.data.user; 
  console.log(`User connected: ${user.name} (ID: ${user.user_id})`);
  
  auctionSocket(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Node.js (TS) Server running on port ${PORT}`);
});