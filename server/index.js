import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import WebSocket from "ws";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your frontend domain
    methods: ["GET", "POST"]
  }
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

// In-memory storage for messages and users
// In a real app, you would use a database
const messages = [];
const onlineUsers = new Map(); // userId -> username

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username;
  
  console.log(`User connected: ${username} (${userId})`);
  
  // Add user to online users
  onlineUsers.set(userId, username);
  
  // Send initial data to the connected client
  socket.emit('initialMessages', messages);
  
  // Broadcast updated online users list to all clients
  io.emit('onlineUsers', Array.from(onlineUsers.values()));
  
  // Handle messages
  socket.on('message', (message) => {
    console.log(`Message from ${message.sender}: ${message.content}`);
    messages.push(message);
    io.emit('message', message);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username} (${userId})`);
    onlineUsers.delete(userId);
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});