// LA - Logística de Acondicionamiento | Estilo DONKEY KONG
// Barriles ruedan por plataformas en zig-zag; el jugador (fijo en X) debe
// saltar (click/botón) justo cuando el barril pasa por su plataforma.
class MissionLA extends MissionBase {
  start() {
    this.platforms = [280,210,140,70];
    this.playerPlatform = 0; this.playerX = 60;
    this.jumping=false; this.jumpT=0;
    this.barrels=[]; this.spawnTimer=0;
    this.climbBonus=0;
    this.api.controls(`<button id="jump">⤴ Saltar</button><button id="climb">⬆ Subir nivel</button>`);
    this.api.onControl("jump", ()=>this.jump());
    this.api.onControl("climb", ()=>this.climb());
  }
  jump() { if (!this.jumping) { this.jumping=true; this.jumpT=0.4; } }
  climb() { if (this.playerPlatform < this.platforms.length-1) { this.playerPlatform++; this.api.addScore(15); } }
  update(dt) {
    if (this.jumping) { this.jumpT -= dt; if (this.jumpT<=0) this.jumping=false; }
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) { this.barrels.push({platform:this.platforms.length-1, x:this.api.width-40, dead:false}); this.spawnTimer=1.6; }
    for (const b of this.barrels) {
      if (b.dead) continue;
      b.x -= 70*dt;
      if (b.x < 20) { b.platform--; b.x = this.api.width-40; if (b.platform<0) b.dead=true; }
      if (b.platform===this.playerPlatform && Math.abs(b.x-this.playerX)<22) {
        if (this.jumping) { this.api.addScore(25); } else { this.api.addScore(0); this.playerPlatform=0; }
        b.dead = true;
      }
    }
    this.barrels = this.barrels.filter(b=>!b.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Salta cuando el barril llegue a tu plataforma, o sube de nivel", this.api.width/2, 20, {align:"center", size:12});
    this.platforms.forEach((y,i)=>drawFlatRect(ctx, 10, y, this.api.width-20, 8, COLORS.grisOscuro, 2));
    for (const b of this.barrels) drawFlatCircle(ctx, b.x, this.platforms[b.platform]-10, 12, COLORS.error);
    const py = this.platforms[this.playerPlatform] - (this.jumping?34:14);
    drawFlatRect(ctx, this.playerX-12, py-16, 24, 28, COLORS.verde, 5);
  }
  onKey(key,down) { if(!down) return; if (key===" ") this.jump(); }
}
