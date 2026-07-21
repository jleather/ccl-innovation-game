// SE - Seguridad | Estilo SPACE INVADERS (formación real en movimiento lateral + descenso)
class MissionSE extends MissionBase {
  start() {
    this.cannonX = this.api.width/2;
    this.bullets = [];
    this.formation = [];
    this.formationDir = 1; this.formationSpeed = 40; this.formationOffsetX = 0;
    for (let r=0;r<3;r++) for (let c=0;c<7;c++) this.formation.push({col:c,row:r,baseY:40+r*36,alive:true});
    this.wave = 1;
    this.api.controls(`<button id="l">◀</button><button id="fire">🔫 Disparar</button><button id="r">▶</button>`);
    this.api.onControl("l", ()=>this.cannonX=Math.max(20,this.cannonX-40));
    this.api.onControl("r", ()=>this.cannonX=Math.min(this.api.width-20,this.cannonX+40));
    this.api.onControl("fire", ()=>this.fire());
  }
  fire() { this.bullets.push({x:this.cannonX,y:this.api.height-40,speed:280}); }
  cellX(c) { return 50 + c*80 + this.formationOffsetX; }
  update(dt) {
    // movimiento de formación tipo Space Invaders: barrido lateral + descenso al tocar el borde
    this.formationOffsetX += this.formationDir * this.formationSpeed * dt;
    const alive = this.formation.filter(e=>e.alive);
    if (alive.length) {
      const leftEdge = Math.min(...alive.map(e=>this.cellX(e.col)));
      const rightEdge = Math.max(...alive.map(e=>this.cellX(e.col)));
      if (rightEdge > this.api.width-40 || leftEdge < 20) {
        this.formationDir *= -1;
        for (const e of alive) e.baseY += 18; // desciende como en el original
        this.formationSpeed = Math.min(this.formationSpeed + 4, 140);
      }
    }
    for (const b of this.bullets) b.y -= b.speed*dt;
    this.bullets = this.bullets.filter(b=>b.y>0);

    for (const e of this.formation) {
      if (!e.alive) continue;
      if (e.baseY > this.api.height-50) { e.alive=false; this.api.addScore(0); }
    }
    for (const e of this.formation) {
      if (!e.alive) continue;
      const ex = this.cellX(e.col), ey = e.baseY;
      for (const b of this.bullets) {
        if (Math.abs(ex-b.x)<18 && Math.abs(ey-b.y)<16) { e.alive=false; b.y=-999; this.api.addScore(20); }
      }
    }
    if (this.formation.every(e=>!e.alive)) {
      this.wave++; this.api.addScore(100);
      this.formation = [];
      for (let r=0;r<3;r++) for (let c=0;c<7;c++) this.formation.push({col:c,row:r,baseY:40+r*36,alive:true});
      this.formationOffsetX = 0; this.formationSpeed = 40 + this.wave*8;
    }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, `Oleada ${this.wave} · mueve y dispara a la formación`, this.api.width/2, 20, {align:"center", size:13});
    ctx.strokeStyle = COLORS.error; ctx.beginPath(); ctx.moveTo(0,this.api.height-40); ctx.lineTo(this.api.width,this.api.height-40); ctx.stroke();
    drawFlatRect(ctx, this.cannonX-16, this.api.height-36, 32, 20, COLORS.azul, 4);
    for (const b of this.bullets) drawFlatRect(ctx, b.x-2, b.y-8, 4, 12, COLORS.azulOscuro, 2);
    for (const e of this.formation) { if (!e.alive) continue; const ex=this.cellX(e.col); drawFlatRect(ctx, ex-14, e.baseY-14, 28, 28, COLORS.error, 5); }
  }
  onKey(key,down) { if(!down) return; if(key==="ArrowLeft") this.cannonX=Math.max(20,this.cannonX-30); if(key==="ArrowRight") this.cannonX=Math.min(this.api.width-20,this.cannonX+30); if(key===" ") this.fire(); }
}
