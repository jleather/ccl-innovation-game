// GI - Gestión de Innovación | Estilo LEMMINGS
// Ideas caminan de izq a derecha; el jugador debe hacerlas "caer" en el bin
// de categoría correcta haciendo click justo cuando pasan por encima de él.
class MissionGI extends MissionBase {
  start() {
    this.ideas = [];
    this.spawnTimer = 0;
    this.bins = [
      { x: 60, w: 120, color: COLORS.azul, label: "PROCESO" },
      { x: 290, w: 120, color: COLORS.verde, label: "PRODUCTO" },
      { x: 520, w: 120, color: COLORS.amarillo, label: "MODELO" }
    ];
  }
  spawnIdea() {
    const bin = this.bins[randInt(0, this.bins.length - 1)];
    this.ideas.push({ x: -20, y: 60, color: bin.color, targetBin: bin, speed: 40 + Math.random() * 30, dead: false });
  }
  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) { this.spawnIdea(); this.spawnTimer = 1.1; }
    for (const idea of this.ideas) {
      if (idea.dead) continue;
      idea.x += idea.speed * dt;
      if (idea.x > this.api.width + 20) idea.dead = true; // se perdió
    }
    this.ideas = this.ideas.filter(i => !i.dead);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, "Haz click en la idea cuando esté SOBRE su bin correcto", this.api.width/2, 20, {align:"center", size:13});
    for (const bin of this.bins) {
      drawFlatRect(ctx, bin.x, 300, bin.w, 90, bin.color, 8);
      drawText(ctx, bin.label, bin.x + bin.w/2, 350, {align:"center", color: COLORS.blanco, size: 12});
    }
    for (const idea of this.ideas) {
      drawFlatCircle(ctx, idea.x, 200, 16, idea.color);
      drawText(ctx, "💡", idea.x, 205, {align:"center", size:16});
    }
  }
  onClick(x, y) {
    for (const idea of this.ideas) {
      if (idea.dead) continue;
      const dx = idea.x - x, dy = 200 - y;
      if (Math.sqrt(dx*dx+dy*dy) < 24) {
        const bin = idea.targetBin;
        if (x >= bin.x && x <= bin.x + bin.w) { this.api.addScore(30); }
        else { this.api.addScore(0); }
        idea.dead = true;
      }
    }
  }
}
