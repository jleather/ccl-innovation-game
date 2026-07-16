// SE - Seguridad | Estilo SPACE INVADERS
class MissionSE extends MissionBase {
  start() {
    this.cannonX = this.api.width/2;
    this.bullets = []; this.enemies = [];
    this.spawnTimer = 0;
    this.api.controls(`<button id="l">◀</button><button id="fire">🔫 Disparar</button><button id="r">▶</button>`);
    this.api.onControl("l", ()=>this.cannonX=Math.max(20,this.cannonX-40));
    this.api.onControl("r", ()=>this.cannonX=Math.min(this.api.width-20,this.cannonX+40));
    this.api.onControl("fire", ()=>this.fire());
  }
  fire() { this.bullets.push({x:this.cannonX,y:this.api.height-40,speed:260}); }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) { this.enemies.push({x:randInt(30,this.api.width-30),y:0,speed:22+Math.random()*15,dead:false}); this.spawnTimer=0.8; }
    for (const b of this.bullets) b.y -= b.speed*dt;
    this.bullets = this.bullets.filter(b=>b.y>0);
    for (const e of this.enemies) { if(!e.dead){ e.y += e.speed*dt; if (e.y > this.api.height-40) { e.dead=true; this.api.addScore(0); } } }
    for (const e of this.enemies) { if (e.dead) continue; for (const b of this.bullets) { if (Math.abs(e.x-b.x)<16 && Math.abs(e.y-b.y)<16) { e.dead=true; b.y=-999; this.api.addScore(20); } } }
    this.enemies = this.enemies.filter(e=>!e.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Defiende el perímetro: mueve y dispara a las amenazas", this.api.width/2, 20, {align:"center", size:13});
    ctx.strokeStyle = COLORS.error; ctx.beginPath(); ctx.moveTo(0,this.api.height-40); ctx.lineTo(this.api.width,this.api.height-40); ctx.stroke();
    drawFlatRect(ctx, this.cannonX-16, this.api.height-36, 32, 20, COLORS.azul, 4);
    for (const b of this.bullets) drawFlatRect(ctx, b.x-2, b.y-8, 4, 12, COLORS.azulOscuro, 2);
    for (const e of this.enemies) drawFlatRect(ctx, e.x-14, e.y-14, 28, 28, COLORS.error, 5);
  }
  onKey(key,down) { if(!down) return; if(key==="ArrowLeft") this.cannonX=Math.max(20,this.cannonX-30); if(key==="ArrowRight") this.cannonX=Math.min(this.api.width-20,this.cannonX+30); if(key===" ") this.fire(); }
}
