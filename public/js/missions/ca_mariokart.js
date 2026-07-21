// CA - Cargo | CLON FIEL de MARIO KART 64 (cámara detrás del kart, pseudo-3D real)
// Estilo propio (no usa personajes de Nintendo): karts de carga CCL identificados
// por color y alias. Hasta 60 participantes sincronizados en vivo por WebSocket.
// El administrador elige la pista antes de iniciar (selva / bodega).

const TRACK_SEGMENT_LEN = 200;
const TRACKS = {
  selva: {
    nombre: "Circuito Selva",
    sky: ["#8FD3F4", "#C9F2C0"],
    grass: ["#3C9A40", "#348A38"],
    road: "#565A5E",
    rumble: ["#D64545", "#F4F4F4"],
    plan: [
      { n: 40, curve: 0 },
      { n: 30, curve: 2.2 },
      { n: 25, curve: 0 },
      { n: 35, curve: -2.6 },
      { n: 20, curve: 0 },
      { n: 22, curve: 3.2 },
      { n: 30, curve: 0 },
      { n: 26, curve: -3.0 },
      { n: 40, curve: 0 }
    ],
    decor: (ctx, w, h, offset) => {
      ctx.fillStyle = "#2E7D32";
      for (let i=0;i<6;i++) {
        const x = ((i*160 + offset*0.3) % (w+160)) - 80;
        drawFlatRect(ctx, x, h*0.42, 6, 40, "#6D4C1E", 0);
        ctx.beginPath(); ctx.ellipse(x+3, h*0.40, 22, 12, 0, 0, Math.PI*2); ctx.fill();
      }
      drawFlatRect(ctx, w*0.62, h*0.30, 90, 40, "#B0B8C1", 2);
      drawFlatRect(ctx, w*0.66, h*0.20, 10, 20, "#8a8f96", 0);
      drawFlatRect(ctx, w*0.74, h*0.16, 10, 24, "#8a8f96", 0);
    }
  },
  bodega: {
    nombre: "Circuito Bodega CCL",
    sky: ["#B9C6D6", "#E7ECF1"],
    grass: ["#C9BE9C", "#BDB18C"],
    road: "#4A4E52",
    rumble: ["#1B4F9C", "#F4F4F4"],
    plan: [
      { n: 35, curve: 0 },
      { n: 28, curve: -3.4 },
      { n: 22, curve: 0 },
      { n: 30, curve: 3.0 },
      { n: 30, curve: 0 },
      { n: 24, curve: -2.0 },
      { n: 24, curve: 2.0 },
      { n: 35, curve: 0 }
    ],
    decor: (ctx, w, h, offset) => {
      ctx.fillStyle = "#7A8288";
      for (let i=0;i<5;i++) {
        const x = ((i*180 + offset*0.3) % (w+180)) - 90;
        drawFlatRect(ctx, x, h*0.30, 70, 55, "#9AA2AA", 2);
        drawFlatRect(ctx, x+8, h*0.34, 54, 8, "#1B4F9C", 0);
      }
    }
  }
};

function buildSegments(trackKey) {
  const t = TRACKS[trackKey] || TRACKS.selva;
  const segs = [];
  for (const section of t.plan) {
    for (let i=0;i<section.n;i++) segs.push({ curve: section.curve });
  }
  return { theme: t, segments: segs, length: segs.length * TRACK_SEGMENT_LEN };
}

class MissionCA extends MissionBase {
  start() {
    const trackKey = (this.api.selectedTrack) || "selva";
    const built = buildSegments(trackKey);
    this.theme = built.theme;
    this.segments = built.segments;
    this.trackLength = built.length;

    this.player = { z: 0, x: 0, speed: 0, lap: 1, finished: false, place: 1 };
    this.maxSpeed = 340; this.accel = 220; this.braking = 260; this.offRoadMaxSpeed = 140;
    this.keys = { left:false, right:false, accel:true };
    this.totalLaps = 3;
    this.remoteRacers = [];
    this.raceClock = 0;
    this.finishedAt = null;

    this.api.controls(`<button id="left">◀</button><button id="boost">🚀 Acelerar</button><button id="right">▶</button>`);
    this.bindHoldButtons();

    this.lastEmit = 0;
    this._onSnapshot = (racers) => { this.remoteRacers = racers.filter(r => r.alias !== this._myAlias); };
    if (this.api.onRaceSnapshot) this.api.onRaceSnapshot(this._onSnapshot);
    this._myAlias = this.api.myAlias || null;
  }

  bindHoldButtons() {
    const l = document.getElementById("left"), r = document.getElementById("right"), b = document.getElementById("boost");
    if (l) { l.onpointerdown = ()=>this.keys.left=true; l.onpointerup = ()=>this.keys.left=false; l.onpointerleave=()=>this.keys.left=false; }
    if (r) { r.onpointerdown = ()=>this.keys.right=true; r.onpointerup = ()=>this.keys.right=false; r.onpointerleave=()=>this.keys.right=false; }
    if (b) { b.onpointerdown = ()=>this.keys.accel=true; b.onpointerup = ()=>this.keys.accel=false; b.onpointerleave=()=>this.keys.accel=false; }
  }

  onKey(key, down) {
    if (key==="ArrowLeft") this.keys.left = down;
    if (key==="ArrowRight") this.keys.right = down;
    if (key==="ArrowUp") this.keys.accel = down;
  }

  update(dt) {
    if (this.player.finished) { this.raceClock += dt; return; }
    this.raceClock += dt;

    const onRoad = Math.abs(this.player.x) < 1.0;
    const cap = onRoad ? this.maxSpeed : this.offRoadMaxSpeed;
    if (this.keys.accel !== false) this.player.speed = Math.min(cap, this.player.speed + this.accel*dt);
    else this.player.speed = Math.max(0, this.player.speed - this.braking*dt);
    if (!onRoad) this.player.speed = Math.min(this.player.speed, cap);

    const steerRate = 1.6 * dt * (0.4 + this.player.speed/this.maxSpeed);
    if (this.keys.left) this.player.x -= steerRate;
    if (this.keys.right) this.player.x += steerRate;
    this.player.x = Math.max(-2.2, Math.min(2.2, this.player.x));

    const segIdx = Math.floor(this.player.z / TRACK_SEGMENT_LEN) % this.segments.length;
    const curve = this.segments[segIdx].curve;
    this.player.x -= curve * 0.0016 * (this.player.speed/this.maxSpeed);

    this.player.z += this.player.speed * dt;
    if (this.player.z >= this.trackLength) {
      this.player.z -= this.trackLength;
      this.player.lap++;
      if (this.player.lap > this.totalLaps) {
        this.player.finished = true;
        this.finishedAt = this.raceClock;
        const place = this.player.place || 1;
        const bonus = place===1?200:place===2?150:place===3?100:60;
        this.api.addScore(bonus);
      } else {
        this.api.addScore(30);
      }
    }

    this.lastEmit += dt;
    if (this.lastEmit > 0.1) {
      this.lastEmit = 0;
      const progress = this.player.z / this.trackLength;
      if (this.api.sendRaceUpdate) this.api.sendRaceUpdate({ progress, lap: this.player.lap, lateral: this.player.x, finished: this.player.finished });
    }

    const myTotal = this.player.lap + this.player.z/this.trackLength;
    let ahead = 0;
    for (const rr of this.remoteRacers) {
      const rTotal = rr.lap + rr.progress;
      if (rTotal > myTotal) ahead++;
    }
    this.player.place = ahead + 1;
  }

  project(camX, camZ, worldX, worldZ, width, height, roadW) {
    const dz = worldZ - camZ;
    if (dz < 1) return null;
    const scale = 300 / dz;
    const screenX = width/2 + scale * (worldX - camX) * width/2;
    const screenY = height*0.58 - scale * height * 0.20;
    const screenW = scale * roadW * width/2;
    return { x: screenX, y: screenY, w: screenW, scale };
  }

  render(ctx) {
    const w = this.api.width, h = this.api.height;
    const theme = this.theme;

    const skyGrad = ctx.createLinearGradient(0,0,0,h*0.5);
    skyGrad.addColorStop(0, theme.sky[0]); skyGrad.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = skyGrad; ctx.fillRect(0,0,w,h*0.5);
    theme.decor(ctx, w, h, this.player.z);

    const baseSeg = Math.floor(this.player.z / TRACK_SEGMENT_LEN);
    const camX = this.player.x * 900;
    const N = this.segments.length;

    ctx.fillStyle = theme.grass[0]; ctx.fillRect(0, h*0.5, w, h*0.5);

    const drawDistance = 90;
    for (let n = drawDistance; n >= 1; n--) {
      const segIdx = (baseSeg + n) % N;
      const segZ0 = (baseSeg + n) * TRACK_SEGMENT_LEN;
      const segZ1 = segZ0 + TRACK_SEGMENT_LEN;
      let accX = 0;
      for (let k=0;k<n;k++) accX += this.segments[(baseSeg+k)%N].curve * 1.1;

      const p0 = this.project(camX, this.player.z, accX*40, segZ0, w, h, 900);
      const accX2 = accX + this.segments[segIdx].curve*1.1;
      const p1 = this.project(camX, this.player.z, accX2*40, segZ1, w, h, 900);
      if (!p0 || !p1) continue;

      const grassColor = theme.grass[segIdx % 2];
      const rumbleColor = theme.rumble[segIdx % 2];
      const isFinish = segIdx === 0;

      ctx.fillStyle = grassColor;
      ctx.fillRect(0, Math.min(p1.y,h), w, Math.max(2, p0.y - p1.y));

      this.drawStrip(ctx, p0, p1, p0.w*1.12, p1.w*1.12, rumbleColor);
      this.drawStrip(ctx, p0, p1, p0.w, p1.w, isFinish ? this.checker(segIdx) : theme.road);
    }

    const others = this.remoteRacers.slice();
    for (const rr of others) {
      const rZ = (rr.lap + rr.progress) * this.trackLength;
      const myZ = this.player.lap * this.trackLength + this.player.z;
      const dz = rZ - myZ;
      const wrapped = ((dz % this.trackLength) + this.trackLength * 1.5) % this.trackLength - this.trackLength * 0.5;
      if (wrapped > 5 && wrapped < drawDistance*TRACK_SEGMENT_LEN) {
        const worldZ = this.player.z + wrapped;
        const p = this.project(camX, this.player.z, rr.lateral*900, worldZ, w, h, 900);
        if (p && p.scale > 0.02) this.drawKart(ctx, p.x, p.y, Math.max(10, 40*p.scale), rr.color, rr.alias, false);
      }
    }

    this.drawKart(ctx, w/2 + this.player.x*40, h*0.82, 46, "#1B4F9C", "Tú", true);

    this.drawHud(ctx, w, h);
  }

  drawStrip(ctx, p0, p1, w0, w1, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p0.x - w0, p0.y);
    ctx.lineTo(p0.x + w0, p0.y);
    ctx.lineTo(p1.x + w1, p1.y);
    ctx.lineTo(p1.x - w1, p1.y);
    ctx.closePath();
    ctx.fill();
  }

  checker(segIdx) { return segIdx % 2 === 0 ? "#1a1a1a" : "#f4f4f4"; }

  drawKart(ctx, x, y, size, color, label, isLocal) {
    drawFlatRect(ctx, x-size*0.35, y-size*0.55, size*0.7, size*0.4, color, size*0.1);
    drawFlatCircle(ctx, x-size*0.28, y-size*0.18, size*0.14, "#222");
    drawFlatCircle(ctx, x+size*0.28, y-size*0.18, size*0.14, "#222");
    drawWorker(ctx, x, y-size*0.5, { scale: size/78, facing:1, helmetColor: isLocal?COLORS.amarillo:COLORS.blanco, pose:"stand" });
    if (!isLocal) drawText(ctx, label, x, y-size*0.95, { align:"center", size:Math.max(8,size*0.24), color: COLORS.azulOscuro });
  }

  drawHud(ctx, w, h) {
    drawFlatRect(ctx, 10, 10, 130, 30, "rgba(0,0,0,0.55)", 6);
    drawText(ctx, `LAP ${Math.min(this.player.lap,this.totalLaps)}/${this.totalLaps}`, 20, 31, { color: COLORS.blanco, size:15, align:"left" });

    const mm = Math.floor(this.raceClock/60), ss = (this.raceClock%60).toFixed(1);
    drawFlatRect(ctx, w-160, 10, 150, 30, "rgba(0,0,0,0.55)", 6);
    drawText(ctx, `TIME ${String(mm).padStart(2,"0")}:${String(ss).padStart(4,"0")}`, w-150, 31, { color: COLORS.amarillo, size:14, align:"left" });

    const place = this.player.place;
    const suffix = place===1?"st":place===2?"nd":place===3?"rd":"th";
    drawText(ctx, `${place}${suffix}`, 22, h-14, { size:30, color: COLORS.amarillo, align:"left", weight:"800" });

    const ranking = [{ alias:"Tú", color:"#1B4F9C", place:this.player.place }]
      .concat(this.remoteRacers.map(r=>({alias:r.alias, color:r.color, place:r.place})))
      .sort((a,b)=>a.place-b.place).slice(0,8);
    ranking.forEach((r, i) => {
      const y = 50 + i*26;
      drawFlatRect(ctx, 10, y, 118, 22, "rgba(255,255,255,0.85)", 4);
      drawFlatCircle(ctx, 24, y+11, 8, r.color);
      drawText(ctx, `${r.place}. ${r.alias}`, 38, y+15, { size:11, color: COLORS.azulOscuro });
    });

    if (this.player.finished) {
      drawFlatRect(ctx, w/2-120, h/2-30, 240, 60, "rgba(0,0,0,0.75)", 8);
      drawText(ctx, "¡CARRERA TERMINADA!", w/2, h/2+6, { align:"center", size:16, color: COLORS.blanco });
    }
  }

  destroy() {
    if (this.api.offRaceSnapshot && this._onSnapshot) this.api.offRaceSnapshot(this._onSnapshot);
  }
}
