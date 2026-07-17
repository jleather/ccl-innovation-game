// GA - Gestión Ambiental | CLON FIEL de Q*BERT
// Pirámide isométrica real de cubos. El operario CCL salta en diagonal entre
// cubos (↙ ↘ ↖ ↗) para "limpiarlos" (cambian de color). Hay que esquivar
// una bola de residuos que rueda por la pirámide.
class MissionGA extends MissionBase {
  start() {
    this.rows = 6; // filas de la pirámide (0 = arriba)
    this.dx = 34; this.dy = 30;
    this.originX = this.api.width/2; this.originY = 40;

    this.clean = {};
    for (let r=0;r<this.rows;r++) for (let c=0;c<=r;c++) this.clean[`${r},${c}`] = false;

    this.player = { row:0, col:0, jumping:false, jumpT:0, fromX:0, fromY:0, toX:0, toY:0 };
    const p0 = this.cubeTop(0,0);
    this.player.x = p0.x; this.player.y = p0.y;
    this.clean["0,0"] = true;

    this.hazard = { row:0, col:0, active:false, timer:2 };

    this.api.controls(`<button id="ul">↖</button><button id="ur">↗</button><button id="dl">↙</button><button id="dr">↘</button>`);
    this.api.onControl("ul", ()=>this.tryJump(-1,-1));
    this.api.onControl("ur", ()=>this.tryJump(-1,0));
    this.api.onControl("dl", ()=>this.tryJump(1,0));
    this.api.onControl("dr", ()=>this.tryJump(1,1));
  }

  cubeTop(row, col) {
    const x = this.originX + (col - row/2) * this.dx * 2;
    const y = this.originY + row * this.dy;
    return { x, y };
  }

  valid(row, col) { return row>=0 && row<this.rows && col>=0 && col<=row; }

  tryJump(dRow, colOffsetForRow) {
    if (this.player.jumping) return;
    const nr = this.player.row + dRow;
    const nc = dRow>0 ? this.player.col + colOffsetForRow : this.player.col + colOffsetForRow;
    if (!this.valid(nr, nc)) { this.fallOff(); return; }
    const from = this.cubeTop(this.player.row, this.player.col);
    const to = this.cubeTop(nr, nc);
    this.player.jumping = true; this.player.jumpT = 0.28;
    this.player.fromX = from.x; this.player.fromY = from.y;
    this.player.toX = to.x; this.player.toY = to.y;
    this.player.row = nr; this.player.col = nc;
  }

  fallOff() {
    this.api.addScore(0);
    this.player.row = 0; this.player.col = 0; this.player.jumping = false;
    const p0 = this.cubeTop(0,0); this.player.x = p0.x; this.player.y = p0.y;
  }

  update(dt) {
    if (this.player.jumping) {
      this.player.jumpT -= dt;
      const t = 1 - Math.max(0, this.player.jumpT) / 0.28;
      this.player.x = this.player.fromX + (this.player.toX - this.player.fromX) * t;
      this.player.y = this.player.fromY + (this.player.toY - this.player.fromY) * t;
      if (this.player.jumpT <= 0) {
        this.player.jumping = false;
        const key = `${this.player.row},${this.player.col}`;
        if (!this.clean[key]) { this.clean[key] = true; this.api.addScore(15); }
        if (Object.values(this.clean).every(v=>v)) {
          this.api.addScore(120);
          for (const k in this.clean) this.clean[k] = false;
          this.clean["0,0"] = true;
        }
        if (this.hazard.active && this.hazard.row===this.player.row && this.hazard.col===this.player.col) {
          this.fallOff();
        }
      }
    }

    // bola de residuos que rueda por la pirámide
    this.hazard.timer -= dt;
    if (this.hazard.timer <= 0) {
      if (!this.hazard.active) { this.hazard.active = true; this.hazard.row = 0; this.hazard.col = 0; }
      else {
        const goRight = Math.random() > 0.5;
        const nr = this.hazard.row + 1, nc = this.hazard.col + (goRight?1:0);
        if (this.valid(nr, nc)) { this.hazard.row = nr; this.hazard.col = nc; }
        else { this.hazard.active = false; }
        if (this.hazard.row===this.player.row && this.hazard.col===this.player.col && !this.player.jumping) this.fallOff();
      }
      this.hazard.timer = 0.8;
    }
  }

  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height, COLORS.gris);
    drawText(ctx, "Salta en diagonal (↙↘↖↗) para limpiar todos los cubos · evita la bola gris", this.api.width/2, 14, {align:"center", size:11});

    for (let r=0;r<this.rows;r++) {
      for (let c=0;c<=r;c++) {
        const top = this.cubeTop(r,c);
        const isClean = this.clean[`${r},${c}`];
        this.drawCube(ctx, top.x, top.y, isClean ? COLORS.verde : COLORS.azul);
      }
    }

    if (this.hazard.active) {
      const hp = this.cubeTop(this.hazard.row, this.hazard.col);
      drawFlatCircle(ctx, hp.x, hp.y+6, 10, COLORS.grisOscuro);
    }

    drawWorker(ctx, this.player.x, this.player.y + 18, { scale:0.55, facing:1, helmetColor: COLORS.amarillo, pose:"stand" });
  }

  drawCube(ctx, cx, cy, color) {
    const w = this.dx, h = this.dy*0.9;
    // cara superior (rombo)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy-h*0.5); ctx.lineTo(cx+w, cy); ctx.lineTo(cx, cy+h*0.5); ctx.lineTo(cx-w, cy);
    ctx.closePath(); ctx.fill();
    // cara izquierda (más oscura)
    ctx.fillStyle = COLORS.azulOscuro;
    ctx.beginPath();
    ctx.moveTo(cx-w, cy); ctx.lineTo(cx, cy+h*0.5); ctx.lineTo(cx, cy+h*0.5+14); ctx.lineTo(cx-w, cy+14);
    ctx.closePath(); ctx.fill();
    // cara derecha (tono medio)
    ctx.fillStyle = COLORS.grisOscuro;
    ctx.beginPath();
    ctx.moveTo(cx+w, cy); ctx.lineTo(cx, cy+h*0.5); ctx.lineTo(cx, cy+h*0.5+14); ctx.lineTo(cx+w, cy+14);
    ctx.closePath(); ctx.fill();
  }
}
