const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static(path.join(__dirname, "..", "app")));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.emit("message", `👋 Welcome to ${room}, your ID: ${socket.id}`);
    socket.to(room).emit("message", `📢 ${socket.id} joined ${room}`);
  });

  socket.on("roomMessage", ({ room, msg }) => {
    io.to(room).emit("message", `${socket.id}: ${msg}`);
  });

  socket.on("privateMessage", ({ to, msg }) => {
    io.to(to).emit("message", `🔒 Private from ${socket.id}: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
