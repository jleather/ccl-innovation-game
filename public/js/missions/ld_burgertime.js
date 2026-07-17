// LD - Logística de CD | Estilo BURGERTIME
// El jugador se mueve entre carriles (cintas). Cajas aparecen arriba de un
// carril; si el jugador está en ese carril y presiona "Empujar" a tiempo,
// la caja avanza a la zona de despacho.
class MissionLD extends MissionBase {
  start() {
    this.lanes=3; this.laneY = [90,170,250];
    this.playerLane = 1; this.boxes=[]; this.spawnTimer=0;
    this.api.controls(`<button id="up">▲</button><button id="push">📦 Empujar</button><button id="down">▼</button>`);
    this.api.onControl("up", ()=>this.playerLane=Math.max(0,this.playerLane-1));
    this.api.onControl("down", ()=>this.playerLane=Math.min(this.lanes-1,this.playerLane+1));
    this.api.onControl("push", ()=>this.push());
  }
  push() {
    const b = this.boxes.find(b=>b.lane===this.playerLane && !b.dead && Math.abs(b.x-100)<40);
    if (b) { b.dead=true; this.api.addScore(30); }
  }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) { this.boxes.push({lane:randInt(0,this.lanes-1), x:this.api.width, dead:false}); this.spawnTimer=1.1; }
    for (const b of this.boxes) { if(!b.dead){ b.x -= 55*dt; if (b.x<-20) { b.dead=true; this.api.addScore(0); } } }
    this.boxes = this.boxes.filter(b=>!b.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Muévete al carril de la caja y presiona Empujar cerca de la zona (línea azul)", this.api.width/2, 20, {align:"center", size:12});
    for (const y of this.laneY) { drawFlatRect(ctx,0,y-16,this.api.width,32,COLORS.gris,0); }
    drawFlatRect(ctx, 96, 60, 4, 220, COLORS.azul, 2);
    for (const b of this.boxes) drawFlatRect(ctx, b.x-16, this.laneY[b.lane]-14, 32, 28, COLORS.amarillo, 5);
    drawFlatRect(ctx, 60, this.laneY[this.playerLane]-16, 24, 32, COLORS.azulOscuro, 6);
  }
}
