const { MISSIONS, QUESTIONS_BANK } = require("./data/missions");

const MATCH_DURATION_MS = 5 * 60 * 1000; // 5 minutos
const MAX_PLAYERS = 60;
const ADMIN_CODE = "CCL-ADMIN-2026"; // código simple de acceso al panel admin

// Estado único de sala (una partida global activa a la vez, como pide el spec)
function createRoom() {
  return {
    state: "LOBBY", // LOBBY | MISION_SELECCIONADA | EN_PARTIDA | RANKING
    players: new Map(), // socketId -> { alias, score, multiplier }
    adminSocketId: null,
    currentMission: null,
    matchEndsAt: null,
    matchTimer: null,
    questionTimer: null
  };
}

class GameManager {
  constructor(io) {
    this.io = io;
    this.room = createRoom();
  }

  publicState() {
    const r = this.room;
    return {
      state: r.state,
      players: Array.from(r.players.values()).map(p => ({ alias: p.alias, score: p.score })),
      playerCount: r.players.size,
      currentMission: r.currentMission,
      matchEndsAt: r.matchEndsAt
    };
  }

  broadcastState() {
    this.io.emit("state:update", this.publicState());
  }

  // ---- Registro ----
  registerPlayer(socket, alias) {
    const r = this.room;
    if (r.players.size >= MAX_PLAYERS) {
      socket.emit("error:message", "La sala está llena (máximo 60 jugadores).");
      return;
    }
    const cleanAlias = String(alias || "Jugador").trim().slice(0, 20) || "Jugador";
    r.players.set(socket.id, { alias: cleanAlias, score: 0, multiplier: 1 });
    socket.emit("registered", { alias: cleanAlias, isAdmin: false });
    this.broadcastState();
  }

  registerAdmin(socket, code) {
    if (code !== ADMIN_CODE) {
      socket.emit("error:message", "Código de administrador incorrecto.");
      return;
    }
    this.room.adminSocketId = socket.id;
    socket.emit("registered", { alias: "Administrador", isAdmin: true });
    socket.emit("admin:missions", MISSIONS);
    this.broadcastState();
  }

  isAdmin(socketId) {
    return this.room.adminSocketId === socketId;
  }

  // ---- Flujo controlado por Admin ----
  selectMission(socket, missionCode) {
    if (!this.isAdmin(socket.id)) return;
    if (!MISSIONS[missionCode]) return;
    this.room.currentMission = missionCode;
    this.room.state = "MISION_SELECCIONADA";
    this.broadcastState();
  }

  startMatch(socket) {
    if (!this.isAdmin(socket.id)) return;
    const r = this.room;
    if (!r.currentMission) return;

    // reset scores
    for (const p of r.players.values()) { p.score = 0; p.multiplier = 1; }

    r.state = "EN_PARTIDA";
    r.matchEndsAt = Date.now() + MATCH_DURATION_MS;
    this.broadcastState();
    this.io.emit("match:start", { mission: r.currentMission, endsAt: r.matchEndsAt, duration: MATCH_DURATION_MS });

    if (r.matchTimer) clearTimeout(r.matchTimer);
    r.matchTimer = setTimeout(() => this.endMatch(), MATCH_DURATION_MS);

    this.scheduleQuestionPopups();
  }

  scheduleQuestionPopups() {
    const r = this.room;
    if (r.questionTimer) clearTimeout(r.questionTimer);
    const bank = QUESTIONS_BANK[r.currentMission] || [];
    if (bank.length === 0) return;

    const fire = () => {
      if (r.state !== "EN_PARTIDA") return;
      const remaining = r.matchEndsAt - Date.now();
      if (remaining < 15000) return; // no lanzar preguntas casi al final
      const q = bank[Math.floor(Math.random() * bank.length)];
      this.io.emit("question:popup", { question: q.q, options: q.opts, correctIndex: q.correct });
      r.questionTimer = setTimeout(fire, 25000 + Math.random() * 20000);
    };
    r.questionTimer = setTimeout(fire, 12000 + Math.random() * 8000);
  }

  answerQuestion(socket, isCorrect) {
    const r = this.room;
    const p = r.players.get(socket.id);
    if (!p || r.state !== "EN_PARTIDA") return;
    p.multiplier = isCorrect ? Math.min(p.multiplier + 0.5, 3) : Math.max(1, p.multiplier - 0.25);
    socket.emit("multiplier:update", { multiplier: p.multiplier });
  }

  addScore(socket, points) {
    const r = this.room;
    const p = r.players.get(socket.id);
    if (!p || r.state !== "EN_PARTIDA") return;
    const safePoints = Math.max(0, Math.min(1000, Number(points) || 0)); // anti-cheat básico
    p.score += Math.round(safePoints * p.multiplier);
    socket.emit("score:update", { score: p.score });
  }

  endMatch() {
    const r = this.room;
    if (r.matchTimer) clearTimeout(r.matchTimer);
    if (r.questionTimer) clearTimeout(r.questionTimer);
    r.state = "RANKING";
    const ranking = Array.from(r.players.values())
      .map(p => ({ alias: p.alias, score: p.score }))
      .sort((a, b) => b.score - a.score);
    this.io.emit("match:end", { ranking, mission: r.currentMission });
    this.broadcastState();

    setTimeout(() => {
      r.state = "LOBBY";
      r.currentMission = null;
      r.matchEndsAt = null;
      this.broadcastState();
    }, 15000);
  }

  forceEndMatch(socket) {
    if (!this.isAdmin(socket.id)) return;
    this.endMatch();
  }

  disconnect(socket) {
    const r = this.room;
    r.players.delete(socket.id);
    if (r.adminSocketId === socket.id) r.adminSocketId = null;
    this.broadcastState();
  }
}

module.exports = { GameManager, MAX_PLAYERS, MATCH_DURATION_MS };
