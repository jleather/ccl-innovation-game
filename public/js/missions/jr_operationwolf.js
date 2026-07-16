// JR - Jurídica | Estilo OPERATION WOLF
// Contratos avanzan de derecha a izq; los válidos deben "sellarse" (click),
// los inválidos deben dejarse pasar sin tocar.
class MissionJR extends MissionBase {
  start() { this.contracts=[]; this.spawnTimer=0; }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) {
      const y = 60+randInt(0,4)*55;
      const valid = Math.random()>0.4;
      this.contracts.push({x:this.api.width+40,y,valid,speed:70+Math.random()*40,dead:false});
      this.spawnTimer = 0.65;
    }
    for (const c of this.contracts) { if(!c.dead){ c.x-=c.speed*dt; if (c.x<-40) c.dead=true; } }
    this.contracts = this.contracts.filter(c=>!c.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Sella (click) SOLO los contratos válidos (verdes)", this.api.width/2, 20, {align:"center", size:13});
    for (const c of this.contracts) {
      drawFlatRect(ctx, c.x-30, c.y-16, 60, 32, c.valid?COLORS.verde:COLORS.error, 5);
      drawText(ctx, "📄", c.x, c.y+5, {align:"center", size:14});
    }
  }
  onClick(x,y) {
    for (const c of this.contracts) {
      if (c.dead) continue;
      if (Math.abs(x-c.x)<32 && Math.abs(y-c.y)<18) { this.api.addScore(c.valid?25:0); c.dead=true; }
    }
  }
}
