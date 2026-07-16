// SF - SARLAFT | Estilo WHERE'S WALDO
// Grid de operaciones idénticas + 1 anomalía; encuéntrala y haz click antes del timer.
class MissionSF extends MissionBase {
  start() { this.cols=8; this.rows=5; this.cellSize=this.api.width/this.cols; this.newRound(); this.roundTimer=6; }
  newRound() {
    this.total = this.cols*this.rows;
    this.anomaly = randInt(0,this.total-1);
    this.roundTimer = 6;
  }
  update(dt) { this.roundTimer -= dt; if (this.roundTimer<=0) this.newRound(); }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Encuentra la operación distinta (anomalía)", this.api.width/2, 20, {align:"center", size:13});
    for (let i=0;i<this.total;i++) {
      const c = i%this.cols, r = Math.floor(i/this.cols);
      const x = c*this.cellSize+6, y = 40+r*this.cellSize*0.9+6;
      const isAnomaly = i===this.anomaly;
      drawFlatRect(ctx, x, y, this.cellSize-12, this.cellSize*0.8, isAnomaly?COLORS.amarillo:COLORS.azul, 4);
      drawText(ctx, isAnomaly?"⚠":"✔", x+(this.cellSize-12)/2, y+22, {align:"center", color:COLORS.blanco, size:14});
    }
    drawText(ctx, `Tiempo ronda: ${this.roundTimer.toFixed(1)}s`, 10, this.api.height-10, {size:12});
  }
  onClick(x,y) {
    const c = Math.floor(x/this.cellSize), r = Math.floor((y-40)/(this.cellSize*0.9));
    const idx = r*this.cols+c;
    if (idx===this.anomaly) { this.api.addScore(35); this.newRound(); }
    else this.api.addScore(0);
  }
}
