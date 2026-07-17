// IN - Inventarios | Estilo GALAGA
// Códigos de barra se mueven en formación; el jugador dispara (click en el canvas)
// un haz vertical desde abajo hacia la columna donde hizo click.
class MissionIN extends MissionBase {
  start() {
    this.enemies = [];
    for (let r=0;r<3;r++) for (let c=0;c<6;c++) this.enemies.push({x:60+c*90, y:50+r*45, alive:true, baseX:60+c*90});
    this.formationT=0; this.beams=[];
  }
  update(dt) {
    this.formationT += dt;
    const offset = Math.sin(this.formationT)*40;
    for (const e of this.enemies) e.x = e.baseX + offset;
    for (const b of this.beams) b.life -= dt;
    this.beams = this.beams.filter(b=>b.life>0);
    for (const b of this.beams) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (Math.abs(e.x-b.x)<24 && e.y>0) { e.alive=false; this.api.addScore(20); b.life=0; }
      }
    }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Click en la pantalla para escanear (disparar) hacia arriba", this.api.width/2, 20, {align:"center", size:13});
    for (const e of this.enemies) if (e.alive) { drawFlatRect(ctx, e.x-16, e.y-10, 32, 20, COLORS.azul, 3); drawText(ctx,"▮▯▮",e.x,e.y+5,{align:"center",size:10,color:COLORS.blanco}); }
    for (const b of this.beams) drawFlatRect(ctx, b.x-2, 0, 4, this.api.height, COLORS.verde, 0);
    if (this.enemies.every(e=>!e.alive)) drawText(ctx, "¡Todos escaneados! +150", this.api.width/2, 200, {align:"center", size:16});
  }
  onClick(x,y) {
    this.beams.push({x, life:0.15});
    if (this.enemies.every(e=>!e.alive)) { this.api.addScore(150); this.enemies.forEach(e=>e.alive=true); }
  }
}
