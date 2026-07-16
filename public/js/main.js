const socket = io();

// ---- Referencias DOM ----
const scenes = {
  registro: document.getElementById("scene-registro"),
  lobby: document.getElementById("scene-lobby"),
  admin: document.getElementById("scene-admin"),
  match: document.getElementById("scene-match"),
  ranking: document.getElementById("scene-ranking")
};
function showScene(name) { Object.values(scenes).forEach(s=>s.classList.add("hidden")); scenes[name].classList.remove("hidden"); }

let isAdmin = false;
let myScore = 0;
let selectedMissionCode = null;

// ---- ESCENA REGISTRO ----
document.getElementById("btnShowAdmin").onclick = () => document.getElementById("adminLoginBox").classList.remove("hidden");
document.getElementById("btnJoin").onclick = () => {
  const alias = document.getElementById("aliasInput").value;
  if (!alias.trim()) { showError("Escribe un alias para continuar."); return; }
  socket.emit("player:join", alias);
};
document.getElementById("btnAdminJoin").onclick = () => {
  const code = document.getElementById("adminCodeInput").value;
  socket.emit("admin:join", code);
};
function showError(msg) { document.getElementById("errorMsg").textContent = msg; setTimeout(()=>document.getElementById("errorMsg").textContent="",3500); }

socket.on("error:message", showError);

socket.on("registered", (data) => {
  isAdmin = data.isAdmin;
  if (isAdmin) showScene("admin"); else showScene("lobby");
});

// ---- ESCENA ADMIN: construir grid de misiones ----
socket.on("admin:missions", (missions) => {
  const worlds = { DIRECCIONALES: [], APOYO: [], MISIONALES: [] };
  Object.values(missions).forEach(m => worlds[m.mundo].push(m));
  const worldNames = { DIRECCIONALES: "Procesos Direccionales", APOYO: "Procesos de Apoyo", MISIONALES: "Procesos Misionales" };
  let html = "";
  for (const w of Object.keys(worlds)) {
    html += `<div class="world-block"><div class="world-title">${worldNames[w]}</div><div class="mission-grid">`;
    for (const m of worlds[w]) {
      html += `<div class="mission-card" data-code="${m.codigo}">
        <div class="mcode">${m.codigo} · ${m.nombre}</div>
        <div class="mref">🎮 ${m.refClasico}</div>
      </div>`;
    }
    html += `</div></div>`;
  }
  document.getElementById("missionWorlds").innerHTML = html;
  document.querySelectorAll(".mission-card").forEach(card => {
    card.onclick = () => {
      document.querySelectorAll(".mission-card").forEach(c=>c.classList.remove("selected"));
      card.classList.add("selected");
      selectedMissionCode = card.dataset.code;
      socket.emit("admin:selectMission", selectedMissionCode);
    };
  });
});

document.getElementById("btnStartMatch").onclick = () => socket.emit("admin:start");
document.getElementById("btnForceEnd").onclick = () => socket.emit("admin:forceEnd");

// ---- ESTADO GENERAL (lobby / contadores) ----
socket.on("state:update", (state) => {
  document.getElementById("lobbyCount").textContent = state.playerCount;
  document.getElementById("adminCount").textContent = state.playerCount + " jugadores";
  if (!isAdmin) {
    const grid = document.getElementById("lobbyPlayers");
    grid.innerHTML = state.players.map(p => `<div class="player-chip">${escapeHtml(p.alias)}</div>`).join("");
  }
  // Si el estado global vuelve a LOBBY y no soy admin, regreso al lobby
  if (state.state === "LOBBY" && !isAdmin && !scenes.registro.classList.contains("hidden") === false) {
    if (!scenes.lobby.classList.contains("hidden") === false && document.getElementById("aliasInput")) {
      // no-op guard
    }
  }
});

function escapeHtml(s) { const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }

// ---- INICIO DE PARTIDA ----
let activeMission = null;
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let lastTime = 0;
let rafId = null;
let matchEndsAt = 0;

const missionApi = {
  width: canvas.width, height: canvas.height,
  addScore: (points) => socket.emit("player:score", points),
  controls: (html) => { document.getElementById("missionControls").innerHTML = html; },
  onControl: (id, handler) => { const el = document.getElementById(id); if (el) el.onclick = handler; }
};

socket.on("match:start", ({ mission, endsAt }) => {
  showScene("match");
  matchEndsAt = endsAt;
  myScore = 0;
  document.getElementById("hudMission").textContent = `${mission} · ${MISSIONS_INFO[mission].nombre} (${MISSIONS_INFO[mission].ref})`;
  document.getElementById("hudScore").textContent = "0 pts";
  document.getElementById("hudMultiplier").textContent = "x1.0";
  document.getElementById("missionControls").innerHTML = "";

  const MissionClass = MISSION_CLASSES[mission];
  activeMission = new MissionClass(ctx, missionApi);
  activeMission.start();

  if (rafId) cancelAnimationFrame(rafId);
  lastTime = performance.now();
  loop();
});

function loop() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (activeMission) {
    activeMission.update(dt);
    activeMission.render(ctx);
  }

  const remaining = Math.max(0, matchEndsAt - Date.now());
  const mm = String(Math.floor(remaining/60000)).padStart(2,"0");
  const ss = String(Math.floor((remaining%60000)/1000)).padStart(2,"0");
  document.getElementById("hudTimer").textContent = `${mm}:${ss}`;

  rafId = requestAnimationFrame(loop);
}

canvas.addEventListener("click", (e) => {
  if (!activeMission || !activeMission.onClick) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  activeMission.onClick(x, y);
});
canvas.addEventListener("mousemove", (e) => {
  if (!activeMission || !activeMission.onMouseMove) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  activeMission.onMouseMove(x, y);
});
window.addEventListener("keydown", (e) => { if (activeMission && activeMission.onKey) activeMission.onKey(e.key, true); });
window.addEventListener("keyup", (e) => { if (activeMission && activeMission.onKey) activeMission.onKey(e.key, false); });

socket.on("score:update", ({ score }) => { myScore = score; document.getElementById("hudScore").textContent = `${score} pts`; });
socket.on("multiplier:update", ({ multiplier }) => { document.getElementById("hudMultiplier").textContent = `x${multiplier.toFixed(1)}`; });

// ---- POPUP DE PREGUNTAS ----
socket.on("question:popup", ({ question, options, correctIndex }) => {
  document.getElementById("questionText").textContent = question;
  const optsDiv = document.getElementById("questionOptions");
  optsDiv.innerHTML = "";
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      document.getElementById("questionOverlay").classList.add("hidden");
      socket.emit("player:answer", i === correctIndex);
    };
    optsDiv.appendChild(btn);
  });
  document.getElementById("questionOverlay").classList.remove("hidden");
});

// ---- FIN DE PARTIDA / RANKING ----
socket.on("match:end", ({ ranking }) => {
  if (rafId) cancelAnimationFrame(rafId);
  if (activeMission && activeMission.destroy) activeMission.destroy();
  activeMission = null;
  showScene("ranking");
  const list = document.getElementById("rankingList");
  list.innerHTML = ranking.map((p, i) => {
    const cls = i===0?"top1":i===1?"top2":i===2?"top3":"";
    return `<div class="rank-row ${cls}"><span><span class="rank-pos">#${i+1}</span>${escapeHtml(p.alias)}</span><span>${p.score} pts</span></div>`;
  }).join("");
});
