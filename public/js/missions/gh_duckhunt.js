// GH - Gestión Humana | Estilo DUCK HUNT
// Perfiles "vuelan" en arco por la pantalla. Solo se debe disparar (click)
// a los que cumplen el requisito mostrado (marcados con check verde).
class MissionGH extends MissionBase {
  start() { this.ducks = []; this.spawnTimer = 0; }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) {
      const fromLeft = Math.random()>0.5;
      const qualified = Math.random()>0.4;
      this.ducks.push({x: fromLeft?-20:this.api.width+20, y: 250, vx:(fromLeft?1:-1)*(60+Math.random()*40), t:0, qualified, dead:false});
      this.spawnTimer = 0.9;
    }
    for (const d of this.ducks) { if(d.dead) continue; d.t+=dt; d.x += d.vx*dt; d.y = 250 - Math.sin(d.t*2)*80; if (d.x<-40||d.x>this.api.width+40) d.dead=true; }
    this.ducks = this.ducks.filter(d=>!d.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Dispara SOLO a los perfiles calificados (✓ verde)", this.api.width/2, 20, {align:"center", size:13});
    for (const d of this.ducks) {
      drawFlatRect(ctx, d.x-18, d.y-18, 36, 36, d.qualified?COLORS.verde:COLORS.grisOscuro, 8);
      drawText(ctx, d.qualified?"✓":"✕", d.x, d.y+5, {align:"center", color:COLORS.blanco, size:16});
    }
  }
  onClick(x,y) {
    for (const d of this.ducks) {
      if (d.dead) continue;
      if (Math.abs(x-d.x)<28 && Math.abs(y-d.y)<28) { this.api.addScore(d.qualified?25:0); d.dead=true; }
    }
  }
}
