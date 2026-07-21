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

// Personaje compartido: operario CCL — overol azul, casco (blanco o amarillo) con siglas "CCL".
// x,y = posición de los pies. scale = tamaño relativo. facing = 1 (derecha) o -1 (izquierda).
// helmetColor por defecto amarillo (más visible sobre fondos claros); puede pasarse COLORS.blanco.
function drawWorker(ctx, x, y, { scale = 1, facing = 1, helmetColor = COLORS.amarillo, pose = "stand" } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  const s = scale;

  // piernas (dos tonos de azul para dar volumen)
  const legOffset = pose === "walk" ? 4 * s : 0;
  drawFlatRect(ctx, -8*s - legOffset, -22*s, 6*s, 22*s, COLORS.azulOscuro, 2*s);
  drawFlatRect(ctx, 2*s + legOffset, -22*s, 6*s, 22*s, COLORS.azul, 2*s);

  // botas
  drawFlatRect(ctx, -9*s - legOffset, -3*s, 8*s, 5*s, COLORS.grisOscuro, 2*s);
  drawFlatRect(ctx, 1*s + legOffset, -3*s, 8*s, 5*s, COLORS.grisOscuro, 2*s);

  // torso / overol azul
  drawFlatRect(ctx, -10*s, -40*s, 20*s, 20*s, COLORS.azul, 4*s);
  // tirantes del overol
  drawFlatRect(ctx, -7*s, -46*s, 3*s, 8*s, COLORS.azulOscuro, 1*s);
  drawFlatRect(ctx, 4*s, -46*s, 3*s, 8*s, COLORS.azulOscuro, 1*s);

  // brazos
  const armSwing = pose === "walk" ? 6*s : 2*s;
  drawFlatRect(ctx, -14*s, -38*s + armSwing, 5*s, 16*s, COLORS.azulOscuro, 2*s);
  drawFlatRect(ctx, 9*s, -38*s - armSwing + 8*s, 5*s, 16*s, COLORS.azul, 2*s);

  // cabeza (tono piel neutro simple)
  drawFlatCircle(ctx, 0, -46*s, 8*s, "#E8B893");

  // casco con siglas CCL
  ctx.fillStyle = helmetColor;
  ctx.beginPath();
  ctx.arc(0, -50*s, 9.5*s, Math.PI, 0);
  ctx.fill();
  drawFlatRect(ctx, -10*s, -50*s, 20*s, 3.5*s, helmetColor, 1*s);
  ctx.fillStyle = COLORS.azulOscuro;
  ctx.font = `${Math.max(6, 6.5*s)}px Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.save();
  ctx.scale(facing, 1); // texto siempre legible sin importar la orientación
  ctx.fillText("CCL", 0, -54*s);
  ctx.restore();

  ctx.restore();
}
