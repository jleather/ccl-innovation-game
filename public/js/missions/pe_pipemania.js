// PE - Planeación Estratégica | Estilo PIPE MANIA
// Una secuencia de tuberías se resalta una por una avanzando; el jugador debe
// hacer click en la tubería resaltada antes de que el flujo la alcance.
class MissionPE extends MissionBase {
  start() {
    this.cols = 8; this.cellSize = this.api.width / this.cols;
    this.pipes = Array.from({length:this.cols},(_, i)=>({i, open:false}));
    this.activeIndex = 0;
    this.flowX = 0;
    this.flowSpeed = 70;
    this.leaks = 0;
  }
  update(dt) {
    this.flowX += this.flowSpeed * dt;
    const activeX = this.activeIndex * this.cellSize + this.cellSize/2;
    if (this.flowX > activeX + this.cellSize/2) {
      if (!this.pipes[this.activeIndex].open) { this.leaks++; this.api.addScore(0); }
      this.activeIndex++;
      if (this.activeIndex >= this.cols) { this.activeIndex = 0; this.flowX = 0; this.pipes.forEach(p=>p.open=false); this.flowSpeed = Math.min(this.flowSpeed+5, 160); }
    }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Click en la tubería resaltada antes de que llegue el flujo", this.api.width/2, 20, {align:"center", size:13});
    const y = 160, h = 60;
    for (const p of this.pipes) {
      const x = p.i*this.cellSize;
      const isActive = p.i === this.activeIndex;
      drawFlatRect(ctx, x+4, y, this.cellSize-8, h, p.open ? COLORS.verde : (isActive ? COLORS.amarillo : COLORS.grisMedio), 6);
    }
    drawFlatRect(ctx, Math.min(this.flowX,this.api.width), y-10, 6, h+20, COLORS.azul, 2);
    drawText(ctx, `Fugas: ${this.leaks}`, 10, 260, {size:13, color: COLORS.error});
  }
  onClick(x, y) {
    const c = Math.floor(x / this.cellSize);
    if (c === this.activeIndex) { this.pipes[c].open = true; this.api.addScore(20); }
  }
}
