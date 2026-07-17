// CA - Cargo | Estilo TETRIS DE EMPAQUE (bin-packing, distinto al TC)
// Aparece una pieza rectangular; el jugador hace click en la celda superior-
// izquierda del contenedor donde quiere ubicarla. Si cabe, se coloca y suma.
class MissionCA extends MissionBase {
  start() {
    this.cols=8; this.rows=6; this.cellSize=42;
    this.offsetX=(this.api.width-this.cols*this.cellSize)/2; this.offsetY=60;
    this.grid = Array.from({length:this.rows},()=>Array(this.cols).fill(false));
    this.shapes = [[2,1],[1,2],[2,2],[3,1],[1,1]];
    this.newPiece(); this.pieceTimer=8;
  }
  newPiece() { const s=this.shapes[randInt(0,this.shapes.length-1)]; this.piece={w:s[0],h:s[1]}; this.pieceTimer=8; }
  fits(r,c) {
    if (r+this.piece.h>this.rows || c+this.piece.w>this.cols) return false;
    for (let rr=r; rr<r+this.piece.h; rr++) for (let cc=c; cc<c+this.piece.w; cc++) if (this.grid[rr][cc]) return false;
    return true;
  }
  update(dt) {
    this.pieceTimer -= dt;
    if (this.pieceTimer<=0) { this.api.addScore(0); this.newPiece(); }
    if (this.grid.every(row=>row.every(v=>v))) { this.grid = this.grid.map(row=>row.map(()=>false)); this.api.addScore(80); }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, `Coloca la pieza (${this.piece.w}x${this.piece.h}) — click esquina sup-izq · ${this.pieceTimer.toFixed(1)}s`, this.api.width/2, 20, {align:"center", size:12});
    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
      const x=this.offsetX+c*this.cellSize, y=this.offsetY+r*this.cellSize;
      drawFlatRect(ctx,x+1,y+1,this.cellSize-2,this.cellSize-2, this.grid[r][c]?COLORS.azul:COLORS.blanco, 3);
    }
  }
  onClick(x,y) {
    const c = Math.floor((x-this.offsetX)/this.cellSize), r = Math.floor((y-this.offsetY)/this.cellSize);
    if (r<0||c<0||r>=this.rows||c>=this.cols) return;
    if (this.fits(r,c)) {
      for (let rr=r; rr<r+this.piece.h; rr++) for (let cc=c; cc<c+this.piece.w; cc++) this.grid[rr][cc]=true;
      this.api.addScore(this.piece.w*this.piece.h*8);
      this.newPiece();
    }
  }
}
