// GF - Gestión Financiera | Estilo PAPERBOY
// Facturas caen por carriles; las verdes (válidas) se deben entregar (click),
// las rojas (con error) NO se deben tocar.
class MissionGF extends MissionBase {
  start() {
    this.lanes = 4; this.laneW = this.api.width/this.lanes;
    this.invoices = []; this.spawnTimer = 0;
  }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer<=0) {
      const lane = randInt(0,this.lanes-1);
      const valid = Math.random() > 0.35;
      this.invoices.push({lane, y:-20, valid, speed:80+Math.random()*40, dead:false});
      this.spawnTimer = 0.7;
    }
    for (const inv of this.invoices) { if(!inv.dead){ inv.y += inv.speed*dt; if (inv.y>this.api.height+20) inv.dead=true; } }
    this.invoices = this.invoices.filter(i=>!i.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Entrega (click) las facturas VERDES · evita las ROJAS", this.api.width/2, 20, {align:"center", size:13});
    for (let i=0;i<this.lanes;i++) { ctx.strokeStyle=COLORS.grisMedio; ctx.beginPath(); ctx.moveTo(i*this.laneW,30); ctx.lineTo(i*this.laneW,this.api.height); ctx.stroke(); }
    for (const inv of this.invoices) {
      const x = inv.lane*this.laneW + this.laneW/2;
      drawFlatRect(ctx, x-16, inv.y-10, 32, 24, inv.valid?COLORS.verde:COLORS.error, 4);
    }
  }
  onClick(x,y) {
    for (const inv of this.invoices) {
      if (inv.dead) continue;
      const cx = inv.lane*this.laneW+this.laneW/2;
      if (Math.abs(x-cx)<20 && Math.abs(y-inv.y)<20) {
        this.api.addScore(inv.valid ? 20 : 0);
        inv.dead = true;
      }
    }
  }
}
