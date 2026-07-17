const { io } = require("socket.io-client");
const admin = io("http://localhost:3000");
const p1 = io("http://localhost:3000");

admin.on("connect", () => admin.emit("admin:join", "CCL-ADMIN-2026"));
admin.on("admin:missions", () => {
  admin.emit("admin:selectMission", "SF");
  setTimeout(() => admin.emit("admin:start", 1), 300);
});
admin.on("match:end", (d) => console.log("✔ ADMIN recibió match:end. Ranking:", JSON.stringify(d.ranking), "| Misión:", d.mission));
admin.on("admin:liveScores", (s) => console.log("admin liveScores tick:", JSON.stringify(s)));

p1.on("connect", () => p1.emit("player:join", "Jugador1"));
let started = false;
p1.on("state:update", (s) => { if (s.state === "EN_PARTIDA" && !started) { started = true; p1.emit("player:score", 50); } });

setTimeout(() => { admin.emit("admin:forceEnd"); }, 1500); // el admin finaliza manualmente
setTimeout(() => process.exit(0), 4000);
