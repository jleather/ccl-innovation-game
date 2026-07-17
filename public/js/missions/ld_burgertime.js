// LD - Logística de CD | CLON FIEL de BURGERTIME
// El operario camina sobre plataformas conectadas por escaleras. Al caminar
// COMPLETO sobre una caja, esta cae al nivel de abajo. Bajar todas las cajas
// de una columna hasta la zona de despacho (fondo) = puntos. Hay que evitar
// al "inspector" (obstáculo) que patrulla las plataformas.
class MissionLD extends MissionBase {
  start() {
    this.levels = [ {y:60}, {y:150}, {y:240}, {y:330} ]; // 0 arriba .. 3 abajo (despacho)
    this.ladderXs = [150, 400, 550]; // escaleras disponibles en cada tramo (mismas X en todos los niveles)

    this.player = { level:0, x:150, facing:1, moving:false };
    this.enemy = { level:1, x:500, dir:-1 };

    // cajas: cada una vive en un nivel/columna y se debe empujar hacia abajo caminando sobre ella
    this.boxes = [];
    const cols = [150, 250, 400, 500];
    for (const c of cols) this.boxes.push({ x:c, level:0, pushed:false, walkProgress:0 });
    this.deliveredCount = 0;

    this.api.controls(`<button id="l">◀</button><button id="up">⬆</button><button id="down">⬇</button><button id="r">▶</button>`);
    this.api.onControl("l", ()=>this.move(-1));
    this.api.onControl("r", ()=>this.move(1));
    this.api.onControl("up", ()=>this.climb(-1));
    this.api.onControl("down", ()=>this.climb(1));
  }

  nearestLadderX() { return this.ladderXs.reduce((a,b)=>Math.abs(b-this.player.x)<Math.abs(a-this.player.x)?b:a); }

  move(d) {
    this.player.facing = d;
    this.player.x = Math.max(25, Math.min(675, this.player.x + d*22));
    this.player.moving = true;
    setTimeout(()=>this.player.moving=false, 150);
    this.checkWalkOverBox();
  }

  climb(dir) {
    const target = this.player.level + dir;
    if (target < 0 || target > 3) return;
    const lx = this.nearestLadderX();
    if (Math.abs(this.player.x - lx) > 22) return;
    this.player.level = target;
  }

  checkWalkOverBox() {
    for (const box of this.boxes) {
      if (box.pushed) continue;
      if (box.level !== this.player.level) continue;
      if (Math.abs(box.x - this.player.x) < 28) {
        box.walkProgress += 1;
        if (box.walkProgress > 6) { // caminó lo suficiente encima -> cae
          box.pushed = true;
          setTimeout(() => {
            if (box.level < 3) { box.level += 1; box.pushed = false; box.walkProgress = 0; }
            else { this.deliveredCount++; this.api.addScore(40); this.respawnBox(box); }
          }, 260);
        }
      } else {
        box.walkProgress = Math.max(0, box.walkProgress - 1);
      }
    }
  }

  respawnBox(box) {
    box.level = 0; box.pushed = false; box.walkProgress = 0;
    box.x = [150,250,400,500][randInt(0,3)];
  }

  update(dt) {
    // el inspector patrulla su plataforma y cambia de nivel ocasionalmente
    this.enemy.x += this.enemy.dir * 55 * dt;
    if (this.enemy.x < 40 || this.enemy.x > 660) { this.enemy.dir *= -1; }
    this._enemyLevelTimer = (this._enemyLevelTimer||3) - dt;
    if (this._enemyLevelTimer <= 0) {
      this.enemy.level = Math.max(0, Math.min(3, this.enemy.level + (Math.random()>0.5?1:-1)));
      this._enemyLevelTimer = 3 + Math.random()*2;
    }

    if (this.enemy.level === this.player.level && Math.abs(this.enemy.x - this.player.x) < 22) {
      this.api.addScore(0);
      this.player.level = 0; this.player.x = 150; // el inspector te regresa al inicio
    }
  }

  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height, COLORS.gris);
    drawText(ctx, "Camina sobre las cajas para bajarlas de nivel · evita al inspector (gris)", this.api.width/2, 16, {align:"center", size:12});

    for (const lvl of this.levels) drawFlatRect(ctx, 15, lvl.y, this.api.width-30, 8, COLORS.azulOscuro, 2);
    for (const lx of this.ladderXs) {
      for (let yy=this.levels[0].y; yy<this.levels[3].y; yy+=10) drawFlatRect(ctx, lx-9, yy, 18, 4, COLORS.amarillo, 1);
    }
    drawFlatRect(ctx, 15, this.levels[3].y+8, this.api.width-30, 14, COLORS.verde, 3);
    drawText(ctx, "ZONA DE DESPACHO", this.api.width/2, this.levels[3].y+19, {align:"center", size:10, color:COLORS.blanco});

    for (const box of this.boxes) {
      const y = this.levels[box.level].y - 16;
      drawFlatRect(ctx, box.x-14, y, 28, 16, COLORS.amarillo, 3);
    }

    drawFlatRect(ctx, this.enemy.x-11, this.levels[this.enemy.level].y-18, 22, 18, COLORS.grisOscuro, 4);
    drawText(ctx, "!", this.enemy.x, this.levels[this.enemy.level].y-5, {align:"center", size:12, color:COLORS.blanco});

    drawWorker(ctx, this.player.x, this.levels[this.player.level].y, { scale:0.85, facing:this.player.facing, helmetColor: COLORS.blanco, pose: this.player.moving?"walk":"stand" });

    drawText(ctx, `Entregadas: ${this.deliveredCount}`, 20, this.api.height-6, {size:11});
  }

  onKey(key, down) {
    if (!down) return;
    if (key==="ArrowLeft") this.move(-1);
    if (key==="ArrowRight") this.move(1);
    if (key==="ArrowUp") this.climb(-1);
    if (key==="ArrowDown") this.climb(1);
  }
}
