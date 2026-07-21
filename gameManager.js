const { MISSIONS, QUESTIONS_BANK } = require("./data/missions");

const DEFAULT_DURATION_MS = 5 * 60 * 1000;
const MIN_DURATION_MIN = 1;
const MAX_DURATION_MIN = 15;
const MAX_PLAYERS = 60;
const ADMIN_CODE = "CCL-ADMIN-2026";
const TIME_BONUS_MS = 10000;
const TIME_PENALTY_MS = 10000;
const MIN_REMAINING_MS = 5000;
const POINTS_BONUS = 15;
const POINTS_PENALTY = 10;

const RACE_GRID_SIZE = 30;             // participantes garantizados en pista (reales + bots)
const RACE_SNAPSHOT_MS = 150;          // frecuencia de sincronización de posiciones
const VALID_TRACKS = ["selva", "bodega"];
const KART_COLORS = ["#D64545","#1B4F9C","#2FA84F","#F2B705","#8E44AD","#E67E22","#16A085","#C0392B","#2C3E50","#27AE60","#D35400","#2980B9","#7F8C8D","#F39C12","#9B59B6"];
const BOT_NAME_A = ["Piloto","Camión","Motor","Turbo","Rueda","Ruta","Carga","Flota","Chofer","Motorista"];
const BOT_NAME_B = ["Veloz","CCL","Express","Rápido","Certero","Ágil","Fuerte","Directo","Preciso","Constante"];

function createRoom() {
  return {
    state: "LOBBY",
    players: new Map(), // socketId -> { alias, score, multiplier, askedIndices, questionTimer }
    adminSocketId: null,
    currentMission: null,
    matchEndsAt: null,
    matchInterval: null,
    caTrack: "selva",
    raceBots: [],
    raceInterval: null,
    playerColors: new Map(),
    playerRace: new Map() // socketId -> { progress, lap, lateral, finished }
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

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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
      matchEndsAt: r.matchEndsAt,
      selectedTrack: r.caTrack
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
    if (r.state === "EN_PARTIDA") {
      this.scheduleQuestionForPlayer(socket.id);
      if (r.currentMission === "CA") this.addPlayerToRace(socket.id);
    }
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

  selectTrack(socket, trackKey) {
    if (!this.isAdmin(socket.id)) return;
    if (!VALID_TRACKS.includes(trackKey)) return;
    this.room.caTrack = trackKey;
    this.broadcastState();
  }

  generateBotName(i) {
    const a = BOT_NAME_A[randInt(0, BOT_NAME_A.length - 1)];
    const b = BOT_NAME_B[randInt(0, BOT_NAME_B.length - 1)];
    return `${a} ${b} ${i + 1}`;
  }

  addPlayerToRace(socketId) {
    const r = this.room;
    const usedColors = new Set(r.playerColors.values());
    const color = KART_COLORS.find(c => !usedColors.has(c)) || KART_COLORS[randInt(0, KART_COLORS.length - 1)];
    r.playerColors.set(socketId, color);
    r.playerRace.set(socketId, { progress: 0, lap: 1, lateral: 0, finished: false });
  }

  setupRace() {
    const r = this.room;
    r.playerColors = new Map();
    r.playerRace = new Map();
    for (const id of r.players.keys()) this.addPlayerToRace(id);

    const need = Math.max(0, RACE_GRID_SIZE - r.players.size);
    r.raceBots = [];
    let colorIdx = r.playerColors.size;
    for (let i = 0; i < need; i++) {
      r.raceBots.push({
        alias: this.generateBotName(i),
        color: KART_COLORS[colorIdx % KART_COLORS.length],
        progress: Math.random() * 0.15,
        lap: 1,
        speed: 0.09 + Math.random() * 0.05, // fracción de vuelta por segundo
        phase: Math.random() * 10
      });
      colorIdx++;
    }

    if (r.raceInterval) clearInterval(r.raceInterval);
    r.raceInterval = setInterval(() => this.raceTick(), RACE_SNAPSHOT_MS);
  }

  raceTick() {
    const r = this.room;
    if (r.state !== "EN_PARTIDA" || r.currentMission !== "CA") {
      if (r.raceInterval) { clearInterval(r.raceInterval); r.raceInterval = null; }
      return;
    }
    const dt = RACE_SNAPSHOT_MS / 1000;
    for (const bot of r.raceBots) {
      bot.progress += bot.speed * dt;
      if (bot.progress >= 1) { bot.progress -= 1; bot.lap += 1; }
      bot.lateral = Math.sin(Date.now() / 900 + bot.phase) * 0.7;
    }

    const entries = [];
    for (const [id, race] of r.playerRace.entries()) {
      const p = r.players.get(id);
      if (!p) continue;
      entries.push({ alias: p.alias, color: r.playerColors.get(id) || "#1B4F9C", progress: race.progress, lap: race.lap, lateral: race.lateral, finished: race.finished });
    }
    for (const bot of r.raceBots) entries.push({ alias: bot.alias, color: bot.color, progress: bot.progress, lap: bot.lap, lateral: bot.lateral, finished: false });

    entries.sort((a, b) => (b.lap + b.progress) - (a.lap + a.progress));
    entries.forEach((e, i) => e.place = i + 1);

    this.io.emit("race:snapshot", entries);
  }

  raceUpdate(socket, data) {
    const r = this.room;
    if (r.state !== "EN_PARTIDA" || r.currentMission !== "CA") return;
    if (!r.playerRace.has(socket.id)) return;
    r.playerRace.set(socket.id, {
      progress: Math.max(0, Math.min(1, Number(data && data.progress) || 0)),
      lap: Math.max(1, Number(data && data.lap) || 1),
      lateral: Math.max(-3, Math.min(3, Number(data && data.lateral) || 0)),
      finished: !!(data && data.finished)
    });
  }

  startMatch(socket, durationMinutes) {
    if (!this.isAdmin(socket.id)) return;
    const r = this.room;
    if (!r.currentMission) return;

    const mins = Math.max(MIN_DURATION_MIN, Math.min(MAX_DURATION_MIN, Number(durationMinutes) || (DEFAULT_DURATION_MS / 60000)));
    const durationMs = mins * 60 * 1000;

    for (const p of r.players.values()) {
      p.score = 0; p.multiplier = 1;
      this.clearPlayerTimer(p);
      p.askedIndices = new Set();
    }

    r.state = "EN_PARTIDA";
    r.matchEndsAt = Date.now() + durationMs;

    const payload = { mission: r.currentMission, endsAt: r.matchEndsAt, duration: durationMs };
    if (r.currentMission === "CA") {
      this.setupRace();
      payload.trackKey = r.caTrack;
    }

    this.broadcastState();
    this.io.emit("match:start", payload);

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
      if (!stillPlayer) return;
      const remaining = r.matchEndsAt - Date.now();
      if (remaining < 12000) return;

      let available = bank.map((_, i) => i).filter(i => !stillPlayer.askedIndices.has(i));
      if (available.length === 0) { stillPlayer.askedIndices.clear(); available = bank.map((_, i) => i); }
      const idx = available[Math.floor(Math.random() * available.length)];
      stillPlayer.askedIndices.add(idx);
      const q = bank[idx];

      const order = shuffle(q.opts.map((_, i) => i));
      const shuffledOptions = order.map(i => q.opts[i]);
      const newCorrectIndex = order.indexOf(q.correct);

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
    const safePoints = Math.max(0, Math.min(1000, Number(points) || 0));
    p.score += Math.round(safePoints * p.multiplier);
    socket.emit("score:update", { score: p.score });
  }

  endMatch() {
    const r = this.room;
    if (r.matchInterval) clearInterval(r.matchInterval);
    if (r.raceInterval) { clearInterval(r.raceInterval); r.raceInterval = null; }
    for (const p of r.players.values()) this.clearPlayerTimer(p);
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
    if (this.room.state !== "EN_PARTIDA") return;
    this.endMatch();
  }

  disconnect(socket) {
    const r = this.room;
    const p = r.players.get(socket.id);
    this.clearPlayerTimer(p);
    r.players.delete(socket.id);
    r.playerColors.delete(socket.id);
    r.playerRace.delete(socket.id);
    if (r.adminSocketId === socket.id) r.adminSocketId = null;
    this.broadcastState();
  }
}

module.exports = { GameManager, MAX_PLAYERS };
