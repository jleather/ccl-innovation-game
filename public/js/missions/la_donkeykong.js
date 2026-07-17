// LA - Logística de Acondicionamiento | CLON FIEL de DONKEY KONG
// Plataformas en zig-zag conectadas por escaleras reales; barriles ruedan
// nivel a nivel en zig-zag como en el arcade original. Personaje: operario CCL.
class MissionLA extends MissionBase {
  start() {
    // niveles de arriba (meta) hacia abajo (inicio) — y = altura en pantalla
    this.levels = [ {y:60}, {y:150}, {y:240}, {y:330} ]; // 0=arriba(meta) .. 3=abajo(inicio)
    // escaleras: conectan nivel N con N-1 en una posición X fija (zig-zag clásico)
    this.ladders = [
      { betweenLevels: [3,2], x: 560 },
      { betweenLevels: [2,1], x: 110 },
      { betweenLevels: [1,0], x: 560 }
    ];
    // dirección de rodado de un barril en cada nivel y el X donde cae al siguiente
    this.rollRules = [
      { level:0, dir: 1,  dropX: 560, nextLevel:1 },
      { level:1, dir:-1,  dropX: 110, nextLevel:2 },
      { level:2, dir: 1,  dropX: 560, nextLevel:3 },
      { level:3, dir:-1,  dropX: -20, nextLevel:null }
    ];
    this.player = { level:3, x:60, facing:1, jumping:false, jumpT:0, moving:false };
    this.barrels = [];
    this.spawnTimer = 1.5;
    this.wave = 1;
    this.spawnInterval = 2.4;

    this.api.controls(`<button id="l">◀</button><button id="up">⬆ Subir</button><button id="jump">⤴ Saltar</button><button id="down">⬇ Bajar</button><button id="r">▶</button>`);
    this.api.onControl("l", ()=>this.move(-1));
    this.api.onControl("r", ()=>this.move(1));
    this.api.onControl("up", ()=>this.climb(-1));
    this.api.onControl("down", ()=>this.climb(1));
    this.api.onControl("jump", ()=>this.jump());
  }

  ladderAt(levelA, levelB) {
    return this.ladders.find(l => (l.betweenLevels[0]===levelA && l.betweenLevels[1]===levelB) || (l.betweenLevels[0]===levelB && l.betweenLevels[1]===levelA));
  }

  move(d) {
    if (this.player.jumping) return;
    this.player.facing = d;
    this.player.x = Math.max(25, Math.min(675, this.player.x + d*26));
    this.player.moving = true;
    setTimeout(()=>this.player.moving=false, 150);
  }

  climb(dir) {
    // dir -1 = subir (a nivel con índice menor), dir +1 = bajar (índice mayor)
    if (this.player.jumping) return;
    const targetLevel = this.player.level + dir;
    if (targetLevel < 0 || targetLevel > 3) return;
    const ladder = this.ladderAt(this.player.level, targetLevel);
    if (!ladder) return;
    if (Math.abs(this.player.x - ladder.x) > 22) return; // debe estar cerca de la escalera
    this.player.x = ladder.x;
    this.player.level = targetLevel;
    if (dir === -1) {
      this.api.addScore(10);
      if (targetLevel === 0) this.reachTop();
    }
  }

  jump() {
    if (this.player.jumping) return;
    this.player.jumping = true; this.player.jumpT = 0.45;
    // bono si había un barril cerca al momento de saltar (salto evasivo exitoso)
    const nearBarrel = this.barrels.find(b => b.level===this.player.level && Math.abs(b.x-this.player.x) < 60);
    if (nearBarrel) this.api.addScore(15);
  }

  reachTop() {
    this.api.addScore(150);
    this.wave++;
    this.spawnInterval = Math.max(1.1, this.spawnInterval - 0.25);
    this.player.level = 3; this.player.x = 60;
    this.barrels = [];
  }

  hitByBarrel() {
    this.api.addScore(0);
    this.player.level = 3; this.player.x = 60; this.player.jumping = false;
  }

  update(dt) {
    if (this.player.jumping) { this.player.jumpT -= dt; if (this.player.jumpT<=0) this.player.jumping=false; }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.barrels.push({ level:0, x:65, });
      this.spawnTimer = this.spawnInterval;
    }

    for (const b of this.barrels) {
      const rule = this.rollRules[b.level];
      b.x += rule.dir * 95 * dt;
      if (rule.nextLevel !== null) {
        if ((rule.dir>0 && b.x >= rule.dropX) || (rule.dir<0 && b.x <= rule.dropX)) {
          b.level = rule.nextLevel;
        }
      }
    }
    this.barrels = this.barrels.filter(b => b.x > -30 && b.x < 730);

    if (!this.player.jumping) {
      for (const b of this.barrels) {
        if (b.level === this.player.level && Math.abs(b.x - this.player.x) < 20) { this.hitByBarrel(); break; }
      }
    }
  }

  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height, COLORS.gris);
    drawText(ctx, `Oleada ${this.wave} · sube por las escaleras y salta los barriles`, this.api.width/2, 16, {align:"center", size:12});

    // plataformas
    for (const lvl of this.levels) drawFlatRect(ctx, 15, lvl.y, this.api.width-30, 8, COLORS.azulOscuro, 2);

    // escaleras
    for (const ladder of this.ladders) {
      const [a,b] = ladder.betweenLevels;
      const yTop = this.levels[Math.min(a,b)].y;
      const yBot = this.levels[Math.max(a,b)].y;
      for (let yy=yTop; yy<yBot; yy+=10) drawFlatRect(ctx, ladder.x-10, yy, 20, 4, COLORS.amarillo, 1);
      drawFlatRect(ctx, ladder.x-10, yTop, 3, yBot-yTop, "#8a6d1a", 0);
      drawFlatRect(ctx, ladder.x+7, yTop, 3, yBot-yTop, "#8a6d1a", 0);
    }

    // meta (pallet de carga arriba)
    drawFlatRect(ctx, this.api.width-70, this.levels[0].y-26, 40, 26, COLORS.verde, 4);
    drawText(ctx, "META", this.api.width-50, this.levels[0].y-10, {align:"center", size:9, color:COLORS.blanco});

    // barriles
    for (const b of this.barrels) drawFlatCircle(ctx, b.x, this.levels[b.level].y-10, 11, "#8a4a1e");

    // jugador (operario CCL)
    const py = this.levels[this.player.level].y - (this.player.jumping ? 34 : 0);
    drawWorker(ctx, this.player.x, py, { scale: 0.85, facing: this.player.facing, helmetColor: COLORS.amarillo, pose: this.player.moving ? "walk" : "stand" });
  }

  onKey(key, down) {
    if (!down) return;
    if (key==="ArrowLeft") this.move(-1);
    if (key==="ArrowRight") this.move(1);
    if (key==="ArrowUp") this.climb(-1);
    if (key==="ArrowDown") this.climb(1);
    if (key===" ") this.jump();
  }
}
