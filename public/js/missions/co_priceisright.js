// CO - Compras | Estilo THE PRICE IS RIGHT
// Un marcador oscila 0-100; el jugador detiene el dial (click) lo más cerca
// posible del presupuesto objetivo, sin pasarse.
class MissionCO extends MissionBase {
  start() { this.newRound(); this.marker=0; this.dir=1; this.speed=50; this.locked=false; this.lockTimer=0; }
  newRound() { this.target = randInt(20,90); this.locked=false; this.marker=0; this.dir=1; }
  update(dt) {
    if (this.locked) { this.lockTimer -= dt; if (this.lockTimer<=0) this.newRound(); return; }
    this.marker += this.dir*this.speed*dt;
    if (this.marker>=100) { this.marker=100; this.dir=-1; }
    if (this.marker<=0) { this.marker=0; this.dir=1; }
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, `Presupuesto objetivo: $${this.target}`, this.api.width/2, 30, {align:"center", size:16});
    drawText(ctx, "Detén el dial (click en el botón) sin pasarte", this.api.width/2, 55, {align:"center", size:12});
    const barX=60, barW=this.api.width-120, barY=150;
    drawFlatRect(ctx, barX, barY, barW, 30, COLORS.gris, 6);
    const tx = barX + (this.target/100)*barW;
    drawFlatRect(ctx, tx-2, barY-6, 4, 42, COLORS.verdeOscuro, 2);
    const mx = barX + (this.marker/100)*barW;
    drawFlatCircle(ctx, mx, barY+15, 12, this.locked? (this.marker<=this.target?COLORS.verde:COLORS.error) : COLORS.azul);
    if (this.locked) {
      const diff = this.target-this.marker;
      const msg = diff<0 ? "¡Te pasaste!" : `Diferencia: ${diff.toFixed(0)}`;
      drawText(ctx, msg, this.api.width/2, 220, {align:"center", size:14});
    }
  }
  onClick() {
    if (this.locked) return;
    this.locked = true; this.lockTimer = 1.4;
    const diff = this.target - this.marker;
    if (diff < 0) this.api.addScore(0);
    else this.api.addScore(Math.max(0, 40 - diff));
  }
}
