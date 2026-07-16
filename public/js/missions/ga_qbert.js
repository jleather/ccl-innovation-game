// GA - Gestión Ambiental | Estilo Q*BERT
// Grid de superficies; el jugador salta a celdas ADYACENTES a su posición
// para "limpiarlas" (cambian de color). Limpiar todas da bonus.
class MissionGA extends MissionBase {
  start() {
    this.cols=6; this.rows=5; this.cellSize=this.api.width/this.cols;
    this.clean = Array.from({length:this.rows},()=>Array(this.cols).fill(false));
    this.pos = {r:0,c:0}; this.clean[0][0]=true;
  }
  update(dt) {}
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Click en una celda ADYACENTE a tu posición (⬤) para limpiarla", this.api.width/2, 20, {align:"center", size:13});
    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
      const x=c*this.cellSize, y=40+r*this.cellSize;
      const adj = this.isAdjacent(r,c);
      drawFlatRect(ctx, x+4,y+4,this.cellSize-8,this.cellSize-8, this.clean[r][c]?COLORS.verde:(adj?COLORS.amarillo:COLORS.grisMedio), 6);
      if (this.pos.r===r && this.pos.c===c) drawFlatCircle(ctx, x+this.cellSize/2, y+this.cellSize/2, 12, COLORS.azulOscuro);
    }
  }
  isAdjacent(r,c) { const dr=Math.abs(r-this.pos.r), dc=Math.abs(c-this.pos.c); return (dr+dc===1); }
  onClick(x,y) {
    if (y<40) return;
    const c=Math.floor(x/this.cellSize), r=Math.floor((y-40)/this.cellSize);
    if (r<0||r>=this.rows||c<0||c>=this.cols) return;
    if (!this.isAdjacent(r,c)) return;
    this.pos = {r,c};
    if (!this.clean[r][c]) { this.clean[r][c]=true; this.api.addScore(20); }
    if (this.clean.every(row=>row.every(v=>v))) { this.api.addScore(100); this.clean = this.clean.map(row=>row.map(()=>false)); this.clean[this.pos.r][this.pos.c]=true; }
  }
}
