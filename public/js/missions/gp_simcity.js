// GP - Gestión Comercial | Estilo SIMCITY
// Grid de zonas con demanda de un recurso (color); el jugador selecciona
// el recurso activo y hace click en la celda que lo demanda.
class MissionGP extends MissionBase {
  start() {
    this.resources = [{c:COLORS.azul,n:"Flota"},{c:COLORS.verde,n:"Bodega"},{c:COLORS.amarillo,n:"Ruta"}];
    this.selected = 0;
    this.cols = 5; this.rows = 3;
    this.cellW = this.api.width / this.cols; this.cellH = 260 / this.rows;
    this.cells = [];
    for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) this.cells.push({r,c,demand:null,timer:0});
    this.spawnTimer = 0;
    this.api.controls(this.resources.map((res,i)=>`<button id="res_${i}" style="background:${res.c};color:white;">${res.n}</button>`).join(""));
    this.resources.forEach((res,i)=>this.api.onControl(`res_${i}`, ()=>{ this.selected = i; }));
  }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const free = this.cells.filter(c=>!c.demand);
      if (free.length) { const cell = free[randInt(0,free.length-1)]; cell.demand = randInt(0,2); cell.timer = 4.5; }
      this.spawnTimer = 0.5;
    }
    for (const cell of this.cells) {
      if (cell.demand !== null) { cell.timer -= dt; if (cell.timer <= 0) cell.demand = null; }
    }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Selecciona el recurso y haz click en la celda que lo pide", this.api.width/2, 20, {align:"center", size:13});
    for (const cell of this.cells) {
      const x = cell.c*this.cellW, y = 40 + cell.r*this.cellH;
      drawFlatRect(ctx, x+4, y+4, this.cellW-8, this.cellH-8, COLORS.blanco, 6);
      ctx.strokeStyle = COLORS.grisMedio; ctx.strokeRect(x+4,y+4,this.cellW-8,this.cellH-8);
      if (cell.demand !== null) {
        const res = this.resources[cell.demand];
        drawFlatCircle(ctx, x+this.cellW/2, y+this.cellH/2, 18, res.c);
      }
    }
    drawText(ctx, "Recurso activo:", 10, 340, {size:12});
    drawFlatCircle(ctx, 140, 336, 10, this.resources[this.selected].c);
  }
  onClick(x, y) {
    if (y < 40 || y > 40 + this.rows*this.cellH) return;
    const c = Math.floor(x/this.cellW), r = Math.floor((y-40)/this.cellH);
    const cell = this.cells.find(k=>k.r===r&&k.c===c);
    if (!cell || cell.demand === null) return;
    if (cell.demand === this.selected) this.api.addScore(25); else this.api.addScore(0);
    cell.demand = null;
  }
}
