const socket = io();

// ---- Referencias DOM ----
const scenes = {
  registro: document.getElementById("scene-registro"),
  lobby: document.getElementById("scene-lobby"),
  admin: document.getElementById("scene-admin"),
  adminLive: document.getElementById("scene-admin-live"),
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

document.getElementById("btnStartMatch").onclick = () => {
  const minutes = Number(document.getElementById("durationInput").value) || 5;
  socket.emit("admin:start", minutes);
};
document.getElementById("btnForceEndLive").onclick = () => socket.emit("admin:forceEnd");

// ---- ESTADO GENERAL (lobby / contadores) ----
socket.on("state:update", (state) => {
  document.getElementById("lobbyCount").textContent = state.playerCount;
  document.getElementById("adminCount").textContent = state.playerCount + " jugadores";
  if (!isAdmin) {
    const grid = document.getElementById("lobbyPlayers");
    grid.innerHTML = state.players.map(p => `<div class="player-chip">${escapeHtml(p.alias)}</div>`).join("");
  }
  if (isAdmin && state.state === "LOBBY") {
    showScene("admin");
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
let adminTimerInterval = null;

// ---- Retroalimentación visual de puntaje ----
function showScoreFeedback(points) {
  const wrap = document.getElementById("gameCanvasWrap");
  const el = document.createElement("div");
  el.className = "score-feedback";
  const cx = canvas.offsetLeft + canvas.width/2 + (Math.random()*100-50);
  const cy = canvas.offsetTop + canvas.height/2 + (Math.random()*60-30);
  el.style.left = cx + "px";
  el.style.top = cy + "px";
  if (points > 0) { el.textContent = `+${Math.round(points)}`; el.style.color = "#2FA84F"; }
  else { el.textContent = "✗"; el.style.color = "#D64545"; }
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 900);
}

function showTimeFeedback(deltaMs) {
  const hud = document.getElementById("hud");
  const el = document.createElement("div");
  el.className = "time-feedback";
  const secs = Math.round(deltaMs/1000);
  el.textContent = secs > 0 ? `+${secs}s ⏱` : `${secs}s ⏱`;
  el.style.color = secs > 0 ? "#EAF7EC" : "#FFD9D9";
  hud.appendChild(el);
  setTimeout(()=>el.remove(), 1150);
}

const missionApi = {
  width: canvas.width, height: canvas.height,
  addScore: (points) => {
    socket.emit("player:score", points);
    showScoreFeedback(points);
  },
  controls: (html) => { document.getElementById("missionControls").innerHTML = html; },
  onControl: (id, handler) => { const el = document.getElementById(id); if (el) el.onclick = handler; }
};

socket.on("match:start", ({ mission, endsAt }) => {
  matchEndsAt = endsAt;

  if (isAdmin) {
    showScene("adminLive");
    document.getElementById("adminLiveMission").textContent = `${mission} · ${MISSIONS_INFO[mission].nombre} (${MISSIONS_INFO[mission].ref})`;
    if (adminTimerInterval) clearInterval(adminTimerInterval);
    adminTimerInterval = setInterval(updateAdminTimer, 400);
    updateAdminTimer();
    return;
  }

  showScene("match");
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

function updateAdminTimer() {
  const remaining = Math.max(0, matchEndsAt - Date.now());
  const mm = String(Math.floor(remaining/60000)).padStart(2,"0");
  const ss = String(Math.floor((remaining%60000)/1000)).padStart(2,"0");
  document.getElementById("adminLiveTimer").textContent = `${mm}:${ss}`;
}

socket.on("admin:liveScores", (scores) => {
  const list = document.getElementById("adminLiveScores");
  if (!list) return;
  list.innerHTML = scores.map((p,i) => {
    const cls = i===0?"top1":i===1?"top2":i===2?"top3":"";
    return `<div class="rank-row ${cls}"><span><span class="rank-pos">#${i+1}</span>${escapeHtml(p.alias)}</span><span>${p.score} pts</span></div>`;
  }).join("") || "<p class='subtitle'>Aún no hay puntajes...</p>";
});

socket.on("match:timeAdjust", ({ endsAt, delta }) => {
  matchEndsAt = endsAt;
  if (!isAdmin) showTimeFeedback(delta);
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

socket.on("score:update", ({ score }) => { myScore = score; const el = document.getElementById("hudScore"); if (el) el.textContent = `${score} pts`; });
socket.on("multiplier:update", ({ multiplier }) => { const el = document.getElementById("hudMultiplier"); if (el) el.textContent = `x${multiplier.toFixed(1)}`; });

// ---- POPUP DE PREGUNTAS ----
socket.on("question:popup", ({ question, options, correctIndex }) => {
  document.getElementById("questionText").textContent = question;
  const optsDiv = document.getElementById("questionOptions");
  optsDiv.innerHTML = "";
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      const correct = i === correctIndex;
      btn.style.borderColor = correct ? "#2FA84F" : "#D64545";
      btn.style.background = correct ? "#EAF7EC" : "#FBEAEA";
      Array.from(optsDiv.children).forEach(b => b.disabled = true);
      socket.emit("player:answer", correct);
      setTimeout(() => document.getElementById("questionOverlay").classList.add("hidden"), 500);
    };
    optsDiv.appendChild(btn);
  });
  document.getElementById("questionOverlay").classList.remove("hidden");
});

// ---- FIN DE PARTIDA / RANKING ----
socket.on("match:end", ({ ranking }) => {
  if (rafId) cancelAnimationFrame(rafId);
  if (adminTimerInterval) clearInterval(adminTimerInterval);
  document.getElementById("questionOverlay").classList.add("hidden");
  if (activeMission && activeMission.destroy) activeMission.destroy();
  activeMission = null;
  showScene("ranking");
  const list = document.getElementById("rankingList");
  list.innerHTML = ranking.map((p, i) => {
    const cls = i===0?"top1":i===1?"top2":i===2?"top3":"";
    return `<div class="rank-row ${cls}"><span><span class="rank-pos">#${i+1}</span>${escapeHtml(p.alias)}</span><span>${p.score} pts</span></div>`;
  }).join("");
});
