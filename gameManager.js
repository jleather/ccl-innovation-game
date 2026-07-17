const { MISSIONS, QUESTIONS_BANK } = require("./data/missions");

const DEFAULT_DURATION_MS = 5 * 60 * 1000;
const MIN_DURATION_MIN = 1;
const MAX_DURATION_MIN = 15;
const MAX_PLAYERS = 60;
const ADMIN_CODE = "CCL-ADMIN-2026"; // código simple de acceso al panel admin
const TIME_BONUS_MS = 10000;    // respuesta correcta: +10s al reloj global
const TIME_PENALTY_MS = 10000;  // respuesta incorrecta: -10s al reloj global
const MIN_REMAINING_MS = 5000;  // el reloj nunca baja de 5s por una penalización
const POINTS_BONUS = 15;        // respuesta correcta: +15 puntos
const POINTS_PENALTY = 10;      // respuesta incorrecta: -10 puntos

function createRoom() {
  return {
    state: "LOBBY", // LOBBY | MISION_SELECCIONADA | EN_PARTIDA | RANKING
    players: new Map(), // socketId -> { alias, score, multiplier, askedIndices, questionTimer }
    adminSocketId: null,
    currentMission: null,
    matchEndsAt: null,
    matchInterval: null
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    r.players.set(socket.id, { alias: cleanAlias, score: 0, multiplier: 1, askedIndices: new Set(), questionTimer: null });
    socket.emit("registered", { alias: cleanAlias, isAdmin: false });
    this.broadcastState();
    // si se une a mitad de partida, también entra al ciclo de preguntas individuales
    if (r.state === "EN_PARTIDA") this.scheduleQuestionForPlayer(socket.id);
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

  startMatch(socket, durationMinutes) {
    if (!this.isAdmin(socket.id)) return;
    const r = this.room;
    if (!r.currentMission) return;

    const mins = Math.max(MIN_DURATION_MIN, Math.min(MAX_DURATION_MIN, Number(durationMinutes) || (DEFAULT_DURATION_MS / 60000)));
    const durationMs = mins * 60 * 1000;

    for (const [id, p] of r.players.entries()) {
      p.score = 0; p.multiplier = 1;
      this.clearPlayerTimer(p);
      p.askedIndices = new Set();
    }

    r.state = "EN_PARTIDA";
    r.matchEndsAt = Date.now() + durationMs;
    this.broadcastState();
    this.io.emit("match:start", { mission: r.currentMission, endsAt: r.matchEndsAt, duration: durationMs });

    if (r.matchInterval) clearInterval(r.matchInterval);
    r.matchInterval = setInterval(() => {
      if (r.adminSocketId) {
        const live = Array.from(r.players.values())
          .map(p => ({ alias: p.alias, score: p.score }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 12);
        this.io.to(r.adminSocketId).emit("admin:liveScores", live);
      }
      if (Date.now() >= r.matchEndsAt) {
        clearInterval(r.matchInterval);
        this.endMatch();
      }
    }, 800);

    // cada jugador tiene su PROPIO ciclo de preguntas, independiente de los demás
    for (const id of r.players.keys()) this.scheduleQuestionForPlayer(id);
  }

  clearPlayerTimer(p) {
    if (p && p.questionTimer) { clearTimeout(p.questionTimer); p.questionTimer = null; }
  }

  scheduleQuestionForPlayer(socketId) {
    const r = this.room;
    const p = r.players.get(socketId);
    if (!p) return;
    const bank = QUESTIONS_BANK[r.currentMission] || [];
    if (bank.length === 0) return;
    this.clearPlayerTimer(p);

    const fire = () => {
      if (r.state !== "EN_PARTIDA") return;
      const stillPlayer = r.players.get(socketId);
      if (!stillPlayer) return; // se desconectó
      const remaining = r.matchEndsAt - Date.now();
      if (remaining < 12000) return; // no lanzar preguntas casi al final

      let available = bank.map((_, i) => i).filter(i => !stillPlayer.askedIndices.has(i));
      if (available.length === 0) { stillPlayer.askedIndices.clear(); available = bank.map((_, i) => i); }
      const idx = available[Math.floor(Math.random() * available.length)];
      stillPlayer.askedIndices.add(idx);
      const q = bank[idx];

      // orden de opciones aleatorio en cada envío, para que la correcta no sea siempre la misma posición
      const order = shuffle(q.opts.map((_, i) => i));
      const shuffledOptions = order.map(i => q.opts[i]);
      const newCorrectIndex = order.indexOf(q.correct);

      // se envía SOLO a este jugador (io.to del room propio del socket) — ni otros jugadores ni el admin lo ven
      this.io.to(socketId).emit("question:popup", { question: q.q, options: shuffledOptions, correctIndex: newCorrectIndex });

      stillPlayer.questionTimer = setTimeout(fire, 22000 + Math.random() * 16000);
    };
    p.questionTimer = setTimeout(fire, 9000 + Math.random() * 8000);
  }

  adjustGlobalTime(deltaMs) {
    const r = this.room;
    if (r.state !== "EN_PARTIDA") return;
    r.matchEndsAt += deltaMs;
    const minEndsAt = Date.now() + MIN_REMAINING_MS;
    if (r.matchEndsAt < minEndsAt) r.matchEndsAt = minEndsAt;
    this.io.emit("match:timeAdjust", { endsAt: r.matchEndsAt, delta: deltaMs });
  }

  answerQuestion(socket, isCorrect) {
    const r = this.room;
    const p = r.players.get(socket.id);
    if (!p || r.state !== "EN_PARTIDA") return;

    if (isCorrect) {
      p.multiplier = Math.min(p.multiplier + 0.5, 3);
      p.score += POINTS_BONUS;
      this.adjustGlobalTime(TIME_BONUS_MS);
    } else {
      p.multiplier = Math.max(1, p.multiplier - 0.25);
      p.score = Math.max(0, p.score - POINTS_PENALTY);
      this.adjustGlobalTime(-TIME_PENALTY_MS);
    }
    socket.emit("multiplier:update", { multiplier: p.multiplier });
    socket.emit("score:update", { score: p.score });
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
    if (r.matchInterval) clearInterval(r.matchInterval);
    for (const p of r.players.values()) this.clearPlayerTimer(p);
    r.state = "RANKING";
    const ranking = Array.from(r.players.values())
      .map(p => ({ alias: p.alias, score: p.score }))
      .sort((a, b) => b.score - a.score);
    // el ranking llega a TODOS, incluido el administrador
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
    if (this.room.state !== "EN_PARTIDA") return;
    this.endMatch();
  }

  disconnect(socket) {
    const r = this.room;
    const p = r.players.get(socket.id);
    this.clearPlayerTimer(p);
    r.players.delete(socket.id);
    if (r.adminSocketId === socket.id) r.adminSocketId = null;
    this.broadcastState();
  }
}

module.exports = { GameManager, MAX_PLAYERS };
