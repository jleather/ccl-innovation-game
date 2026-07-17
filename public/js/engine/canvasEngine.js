// Motor base para todas las misiones.
// Cada misión extiende MissionBase e implementa: start(), update(dt), render(ctx), destroy()
// y opcionalmente onClick(x,y), onKey(key,down).
//
// api provee:
//   api.addScore(points)          -> reporta puntaje al servidor (se multiplica allá)
//   api.width / api.height        -> tamaño del canvas
//   api.controls(html)            -> inyecta botones táctiles bajo el canvas (para móvil)
//   api.onControl(id, handler)    -> asocia click de un botón inyectado

const COLORS = {
  azul: "#1B4F9C",
  azulOscuro: "#0E3266",
  verde: "#2FA84F",
  verdeOscuro: "#1E7A38",
  gris: "#E9ECEF",
  grisMedio: "#B0B8C1",
  grisOscuro: "#495057",
  blanco: "#FFFFFF",
  error: "#D64545",
  amarillo: "#F2B705"
};

class MissionBase {
  constructor(ctx, api) {
    this.ctx = ctx;
    this.api = api;
  }
  start() {}
  update(dt) {}
  render(ctx) {}
  destroy() {}
  onClick(x, y) {}
  onKey(key, down) {}
}

// --- Helpers de dibujo estilo "2D vector plano infográfico" ---
function drawFlatRect(ctx, x, y, w, h, color, radius = 6) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, radius);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

function drawFlatCircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(ctx, text, x, y, { size = 14, color = COLORS.azulOscuro, align = "left", weight = "700" } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Segoe UI, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function clearCanvas(ctx, w, h, bg = COLORS.gris) {
  drawFlatRect(ctx, 0, 0, w, h, bg, 0);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
