const { io } = require("socket.io-client");
const admin = io("http://localhost:3000");
const p1 = io("http://localhost:3000");
const p2 = io("http://localhost:3000");

admin.on("connect", () => admin.emit("admin:join", "CCL-ADMIN-2026"));
admin.on("admin:missions", () => {
  admin.emit("admin:selectMission", "SF");
  setTimeout(() => admin.emit("admin:start", 1), 300);
});
admin.on("question:popup", () => console.log("!! BUG: el ADMIN recibió una pregunta (no debería) !!"));
admin.on("match:end", (d) => console.log("ADMIN recibió match:end con ranking de", d.ranking.length, "jugadores -> OK, el admin SÍ ve el ranking final"));

p1.on("connect", () => p1.emit("player:join", "Jugador1"));
p2.on("connect", () => p2.emit("player:join", "Jugador2"));

let p1GotQuestion = false, p2GotQuestion = false;
const correctPositions = [];

p1.on("question:popup", (q) => {
  p1GotQuestion = true;
  correctPositions.push(q.correctIndex);
  console.log("P1 recibió pregunta (correctIndex=" + q.correctIndex + "):", q.question.slice(0,40));
  p1.emit("player:answer", false); // responde MAL a propósito
});
p2.on("question:popup", () => { p2GotQuestion = true; }); // P2 no debería recibir la MISMA pregunta al mismo tiempo necesariamente

p1.on("score:update", (d) => console.log("P1 score:update ->", d.score));

let started = false;
p1.on("state:update", (s) => {
  if (s.state === "EN_PARTIDA" && !started) { started = true; p1.emit("player:score", 20); }
});

setTimeout(() => {
  console.log("=== RESULTADOS ===");
  console.log("P1 recibió pregunta individual:", p1GotQuestion);
  console.log("Posiciones de respuesta correcta observadas:", correctPositions);
}, 15000);

setTimeout(() => process.exit(0), 22000);
