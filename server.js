const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { GameManager } = require("./gameManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

const gameManager = new GameManager(io);

io.on("connection", (socket) => {
  socket.emit("state:update", gameManager.publicState());

  socket.on("player:join", (alias) => gameManager.registerPlayer(socket, alias));
  socket.on("admin:join", (code) => gameManager.registerAdmin(socket, code));

  socket.on("admin:selectMission", (missionCode) => gameManager.selectMission(socket, missionCode));
  socket.on("admin:start", (durationMinutes) => gameManager.startMatch(socket, durationMinutes));
  socket.on("admin:forceEnd", () => gameManager.forceEndMatch(socket));

  socket.on("player:score", (points) => gameManager.addScore(socket, points));
  socket.on("player:answer", (isCorrect) => gameManager.answerQuestion(socket, isCorrect));

  socket.on("disconnect", () => gameManager.disconnect(socket));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CCL Innovation Game escuchando en puerto ${PORT}`);
});
