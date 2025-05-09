import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory storage
const messages = [];
const onlineUsers = new Map(); // userId -> username
const friendships = new Map(); // userId -> Set of friend userIds
const privateMessages = new Map(); // roomId -> messages

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username;
  
  console.log(`User connected: ${username} (${userId})`);
  
  // Add user to online users
  onlineUsers.set(userId, username);
  
  // Send initial data
  socket.emit('initialMessages', messages);
  socket.emit('friends', Array.from(friendships.get(userId) || []));
  
  // Broadcast online users
  io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, name]) => ({
    id,
    username: name
  })));
  
  // Handle friend requests
  socket.on('searchUser', (searchTerm, callback) => {
    const users = Array.from(onlineUsers.entries())
      .filter(([id, name]) => 
        name.toLowerCase().includes(searchTerm.toLowerCase()) && id !== userId
      )
      .map(([id, name]) => ({ id, username: name }));
    callback(users);
  });

  socket.on('addFriend', (friendId) => {
    if (!friendships.has(userId)) {
      friendships.set(userId, new Set());
    }
    if (!friendships.has(friendId)) {
      friendships.set(friendId, new Set());
    }
    
    friendships.get(userId).add(friendId);
    friendships.get(friendId).add(userId);
    
    // Notify both users
    socket.emit('friends', Array.from(friendships.get(userId)));
    io.to(friendId).emit('friends', Array.from(friendships.get(friendId)));
  });

  // Handle private messages
  socket.on('privateMessage', (data) => {
    const { recipientId, content } = data;
    const roomId = [userId, recipientId].sort().join('-');
    
    if (!privateMessages.has(roomId)) {
      privateMessages.set(roomId, []);
    }
    
    const message = {
      id: Date.now().toString(),
      sender: username,
      senderId: userId,
      content,
      timestamp: Date.now(),
      roomId
    };
    
    privateMessages.get(roomId).push(message);
    
    // Send to both users
    socket.emit('privateMessage', message);
    io.to(recipientId).emit('privateMessage', message);
  });

  socket.on('getPrivateMessages', (friendId, callback) => {
    const roomId = [userId, friendId].sort().join('-');
    callback(privateMessages.get(roomId) || []);
  });
  
  // Handle group messages
  socket.on('message', (message) => {
    console.log(`Message from ${message.sender}: ${message.content}`);
    messages.push(message);
    io.emit('message', message);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username} (${userId})`);
    onlineUsers.delete(userId);
    io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, name]) => ({
      id,
      username: name
    })));
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});