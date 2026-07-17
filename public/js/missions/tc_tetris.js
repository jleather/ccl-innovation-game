// TC - Tecnología | Estilo TETRIS clásico (piezas simplificadas)
class MissionTC extends MissionBase {
  start() {
    this.cols=8; this.rows=10; this.cellSize=32;
    this.offsetX=(this.api.width-this.cols*this.cellSize)/2;
    this.grid = Array.from({length:this.rows},()=>Array(this.cols).fill(null));
    this.shapes = [
      {cells:[[0,0],[0,1],[0,2],[0,3]], color:COLORS.azul},   // línea
      {cells:[[0,0],[1,0],[0,1],[1,1]], color:COLORS.amarillo}, // cuadro
      {cells:[[0,0],[0,1],[0,2],[1,2]], color:COLORS.verde}   // L
    ];
    this.spawn(); this.fallTimer=0;
    this.api.controls(`<button id="l">◀</button><button id="rot">⟳ Rotar</button><button id="r">▶</button><button id="d">▼</button>`);
    this.api.onControl("l",()=>this.move(-1));
    this.api.onControl("r",()=>this.move(1));
    this.api.onControl("d",()=>this.fallTimer=999);
    this.api.onControl("rot",()=>this.rotate());
  }
  spawn() {
    const s = this.shapes[randInt(0,this.shapes.length-1)];
    this.piece = {cells:s.cells.map(c=>({x:c[0]+3,y:c[1]})), color:s.color};
  }
  canPlace(cells) { return cells.every(c=>c.x>=0&&c.x<this.cols&&c.y<this.rows&&(c.y<0||!this.grid[c.y][c.x])); }
  move(d) { const n=this.piece.cells.map(c=>({x:c.x+d,y:c.y})); if (this.canPlace(n)) this.piece.cells=n; }
  rotate() {
    // rotación 90° alrededor del primer bloque de la pieza (rotación clásica de Tetris)
    const pivot = this.piece.cells[0];
    const rotated = this.piece.cells.map(c => {
      const relX = c.x - pivot.x, relY = c.y - pivot.y;
      return { x: pivot.x - relY, y: pivot.y + relX };
    });
    if (this.canPlace(rotated)) this.piece.cells = rotated;
  }
  update(dt) {
    this.fallTimer+=dt;
    if (this.fallTimer>0.55) {
      this.fallTimer=0;
      const n=this.piece.cells.map(c=>({x:c.x,y:c.y+1}));
      if (this.canPlace(n)) this.piece.cells=n;
      else {
        for (const c of this.piece.cells) if (c.y>=0) this.grid[c.y][c.x]=this.piece.color;
        this.clearLines(); this.spawn();
      }
    }
  }
  clearLines() {
    let cleared=0;
    for (let r=this.rows-1;r>=0;r--) {
      if (this.grid[r].every(v=>v)) { this.grid.splice(r,1); this.grid.unshift(Array(this.cols).fill(null)); cleared++; r++; }
    }
    if (cleared>0) this.api.addScore(cleared*50);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
      const x=this.offsetX+c*this.cellSize, y=20+r*this.cellSize;
      drawFlatRect(ctx,x+1,y+1,this.cellSize-2,this.cellSize-2, this.grid[r][c]||COLORS.blanco, 3);
    }
    for (const c of this.piece.cells) if (c.y>=0) drawFlatRect(ctx, this.offsetX+c.x*this.cellSize+1, 20+c.y*this.cellSize+1, this.cellSize-2, this.cellSize-2, this.piece.color, 3);
  }
  onKey(key,down) { if(!down) return; if(key==="ArrowLeft") this.move(-1); if(key==="ArrowRight") this.move(1); if(key==="ArrowDown") this.fallTimer=999; if(key==="ArrowUp") this.rotate(); }
}
