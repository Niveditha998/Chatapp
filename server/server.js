const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '..', 'app')));

// In-memory storage
const messageHistory = [];
const usersInRoom = {}; // { roomName: [username1, username2] }

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('join', (username, room = 'General') => {
    socket.username = username;
    socket.room = room;
    socket.join(room);

    // Add user
    if (!usersInRoom[room]) usersInRoom[room] = [];
    usersInRoom[room].push(username);

    // Emit online users
    io.to(room).emit('users', usersInRoom[room]);

    // Welcome message
    const welcomeMsg = {
      id: uuidv4(),
      user: 'System',
      text: `${username} has joined the room`,
      time: new Date().toISOString(),
      parentId: null,
      replies: [],
      room
    };
    messageHistory.push(welcomeMsg);
    io.to(room).emit('message', welcomeMsg);

    // Send message history
    const roomHistory = messageHistory.filter(msg => msg.room === room || !msg.room);
    socket.emit('messageHistory', roomHistory);
  });

  // Chat message
  socket.on('chatMessage', (text) => {
    const msg = {
      id: uuidv4(),
      user: socket.username || 'Anonymous',
      text,
      time: new Date().toISOString(),
      parentId: null,
      replies: [],
      room: socket.room
    };
    messageHistory.push(msg);
    io.to(socket.room).emit('message', msg);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const room = socket.room;
    const username = socket.username;

    if (room && usersInRoom[room]) {
      usersInRoom[room] = usersInRoom[room].filter(u => u !== username);
      io.to(room).emit('users', usersInRoom[room]);

      const leaveMsg = {
        id: uuidv4(),
        user: 'System',
        text: `${username} left the room`,
        time: new Date().toISOString(),
        parentId: null,
        replies: [],
        room
      };
      messageHistory.push(leaveMsg);
      io.to(room).emit('message', leaveMsg);
    }

    console.log('User disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
