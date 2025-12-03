require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// --- HTTP Routes ---
// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Nimonspedia Node.js Microservice', 
    status: 'active', 
    timestamp: new Date() 
  });
});

// Feature Routes here
// Example: app.use('/api/node/admin', require('./routes/adminRoutes'));


// WebSocket Setup (Socket.io)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: '/socket.io'
});

// WebSocket Logic
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Call socket handlers here
  // Example: require('./sockets/chatSocket')(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Node.js Server running on port ${PORT}`);
});