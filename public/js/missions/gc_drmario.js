// GC - Gestión de Calidad | Estilo DR. MARIO
// Cápsulas de colores caen; el jugador las mueve lateralmente. Al aterrizar,
// si 3+ del mismo color quedan en línea (fila/columna), se eliminan (score).
class MissionGC extends MissionBase {
  start() {
    this.cols = 7; this.rows = 8;
    this.cellSize = 42;
    this.offsetX = (this.api.width - this.cols*this.cellSize)/2;
    this.grid = Array.from({length:this.rows},()=>Array(this.cols).fill(null));
    this.colors = [COLORS.error, COLORS.azul, COLORS.amarillo];
    this.spawnCapsule();
    this.fallTimer = 0;
    this.api.controls(`<button id="left">◀</button><button id="right">▶</button><button id="down">▼</button>`);
    this.api.onControl("left", ()=>this.move(-1));
    this.api.onControl("right", ()=>this.move(1));
    this.api.onControl("down", ()=>{ this.fallTimer = 999; });
  }
  spawnCapsule() { this.cur = { col: Math.floor(this.cols/2), row: 0, color: this.colors[randInt(0,2)] }; }
  move(d) {
    const nc = this.cur.col + d;
    if (nc>=0 && nc<this.cols && !this.grid[this.cur.row][nc]) this.cur.col = nc;
  }
  update(dt) {
    this.fallTimer += dt;
    if (this.fallTimer > 0.5) {
      this.fallTimer = 0;
      const nr = this.cur.row+1;
      if (nr<this.rows && !this.grid[nr][this.cur.col]) this.cur.row = nr;
      else { this.grid[this.cur.row][this.cur.col] = this.cur.color; this.clearMatches(); this.spawnCapsule(); }
    }
  }
  clearMatches() {
    let cleared = 0;
    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols-2;c++) {
      const v = this.grid[r][c];
      if (v && this.grid[r][c+1]===v && this.grid[r][c+2]===v) { this.grid[r][c]=this.grid[r][c+1]=this.grid[r][c+2]=null; cleared+=3; }
    }
    for (let c=0;c<this.cols;c++) for (let r=0;r<this.rows-2;r++) {
      const v = this.grid[r][c];
      if (v && this.grid[r+1][c]===v && this.grid[r+2][c]===v) { this.grid[r][c]=this.grid[r+1][c]=this.grid[r+2][c]=null; cleared+=3; }
    }
    if (cleared>0) this.api.addScore(cleared*15);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
      const x = this.offsetX+c*this.cellSize, y = 30+r*this.cellSize;
      drawFlatRect(ctx, x+2, y+2, this.cellSize-4, this.cellSize-4, COLORS.blanco, 4);
      if (this.grid[r][c]) drawFlatCircle(ctx, x+this.cellSize/2, y+this.cellSize/2, 16, this.grid[r][c]);
    }
    drawFlatCircle(ctx, this.offsetX+this.cur.col*this.cellSize+this.cellSize/2, 30+this.cur.row*this.cellSize+this.cellSize/2, 16, this.cur.color);
  }
  onKey(key, down) { if (!down) return; if (key==="ArrowLeft") this.move(-1); if (key==="ArrowRight") this.move(1); if (key==="ArrowDown") this.fallTimer=999; }
}
