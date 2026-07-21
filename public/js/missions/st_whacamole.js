// ST - Seguridad y Salud en el Trabajo | Estilo WHAC-A-MOLE
// Riesgos aparecen en huecos aleatorios; el jugador debe neutralizarlos (click) rápido.
class MissionST extends MissionBase {
  start() {
    this.cols=4; this.rows=3; this.cellSize=this.api.width/this.cols;
    this.holes = []; for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) this.holes.push({r,c,active:false,timer:0});
    this.spawnTimer=0;
  }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) {
      const free = this.holes.filter(h=>!h.active);
      if (free.length) { const h = free[randInt(0,free.length-1)]; h.active=true; h.timer=1.2; }
      this.spawnTimer=0.5;
    }
    for (const h of this.holes) { if (h.active) { h.timer-=dt; if (h.timer<=0) h.active=false; } }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Neutraliza (click) los riesgos ⚠ apenas aparezcan", this.api.width/2, 20, {align:"center", size:13});
    for (const h of this.holes) {
      const x=h.c*this.cellSize, y=40+h.r*90;
      drawFlatCircle(ctx, x+this.cellSize/2, y+45, 35, COLORS.grisMedio);
      if (h.active) { drawFlatCircle(ctx, x+this.cellSize/2, y+45, 26, COLORS.error); drawText(ctx,"⚠",x+this.cellSize/2,y+52,{align:"center",color:COLORS.blanco,size:20}); }
    }
  }
  onClick(x,y) {
    for (const h of this.holes) {
      if (!h.active) continue;
      const cx=h.c*this.cellSize+this.cellSize/2, cy=40+h.r*90+45;
      if (Math.hypot(x-cx,y-cy)<32) { h.active=false; this.api.addScore(20); }
    }
  }
}
