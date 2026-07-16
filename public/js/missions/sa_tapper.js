// SA - Servicios Administrativos | Estilo TAPPER
// Varias tareas se deslizan por carriles hacia el jugador; hay que "atenderlas"
// (click en el carril correcto) antes de que se acumulen.
class MissionSA extends MissionBase {
  start() {
    this.lanes=4; this.laneH = 240/this.lanes;
    this.tasks=[]; this.spawnTimer=0;
    this.api.controls(Array.from({length:this.lanes},(_,i)=>`<button id="lane_${i}">Carril ${i+1}</button>`).join(""));
    for (let i=0;i<this.lanes;i++) this.api.onControl(`lane_${i}`, ()=>this.serve(i));
  }
  serve(lane) {
    const t = this.tasks.find(t=>t.lane===lane && !t.dead && t.x < this.api.width-60);
    if (t) { t.dead=true; this.api.addScore(20); }
  }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) { this.tasks.push({lane:randInt(0,this.lanes-1), x:0, speed:60+Math.random()*30, dead:false}); this.spawnTimer=0.8; }
    for (const t of this.tasks) { if(!t.dead){ t.x += t.speed*dt; if (t.x>this.api.width) { t.dead=true; this.api.addScore(0); } } }
    this.tasks = this.tasks.filter(t=>!t.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Atiende (botón del carril) antes de que la tarea se salga", this.api.width/2, 20, {align:"center", size:13});
    for (let i=0;i<this.lanes;i++) { const y=40+i*this.laneH; drawFlatRect(ctx,0,y,this.api.width,this.laneH-6,COLORS.gris,0); }
    for (const t of this.tasks) { const y=40+t.lane*this.laneH+this.laneH/2-14; drawFlatRect(ctx,t.x,y,50,28,COLORS.azul,5); }
  }
}
