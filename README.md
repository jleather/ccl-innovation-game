# CCL Innovation Game 🎮
Juego multijugador online — Día Mundial de la Creatividad y la Innovación

## ¿Qué incluye?
- Backend: Node.js + Express + Socket.io (soporta 60 jugadores + 1 admin en tiempo real)
- Frontend: HTML5 Canvas + JS vanilla, estilo 2D vector plano corporativo (azul/verde/gris)
- 19 misiones jugables, cada una con mecánica distinta inspirada en un clásico arcade:

| Código | Proceso | Referencia clásica |
|---|---|---|
| GI | Gestión de Innovación | Lemmings |
| GP | Gestión Comercial | SimCity |
| PE | Planeación Estratégica | Pipe Mania |
| GC | Gestión de Calidad | Dr. Mario |
| GF | Gestión Financiera | Paperboy |
| GH | Gestión Humana | Duck Hunt |
| SF | SARLAFT | Where's Waldo? |
| JR | Jurídica | Operation Wolf |
| TC | Tecnología | Tetris |
| SE | Seguridad | Space Invaders |
| GA | Gestión Ambiental | Q*bert |
| ST | Seguridad y Salud en el Trabajo | Whac-A-Mole |
| CO | Compras | The Price is Right |
| SA | Servicios Administrativos | Tapper |
| SC | Servicio al Cliente | Pong |
| LD | Logística de CD | BurgerTime |
| CA | Cargo | Tetris (empaque) |
| IN | Inventarios | Galaga |
| LA | Logística de Acondicionamiento | Donkey Kong |

## Probarlo en tu computador (local)
```bash
npm install
npm start
```
Abre `http://localhost:3000` en varias pestañas para simular varios jugadores.
Para entrar como administrador usa el código: `CCL-ADMIN-2026`
(puedes cambiarlo en `gameManager.js`, constante `ADMIN_CODE`).

## Ponerlo "online" (para que la gente juegue desde su celular/PC)
Este proyecto es un servidor Node.js real, así que necesitas desplegarlo en un
hosting. Las opciones más rápidas y gratuitas:

### Opción A: Render.com (recomendada, gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a https://render.com → New → Web Service → conecta tu repo.
3. Build Command: `npm install` — Start Command: `npm start`
4. Render te da una URL pública (ej: `https://ccl-game.onrender.com`) — compártela.

### Opción B: Railway.app
1. https://railway.app → New Project → Deploy from GitHub repo.
2. Railway detecta Node.js automáticamente y te da una URL pública.

### Opción C: Tu propio servidor / VPN corporativa
```bash
npm install
PORT=3000 npm start
```
y expón el puerto 3000 en tu red o servidor.

## Flujo de uso el día del evento
1. El Administrador entra con el código admin y queda en el Panel Admin.
2. Los jugadores entran con su alias y quedan en el Lobby esperando.
3. El Admin selecciona una misión del panel (organizadas por los 3 mundos).
4. El Admin presiona "Iniciar Misión" → todos entran sincronizados a la partida (5 min).
5. Durante la partida aparecen popups con preguntas sobre el proceso — responder
   bien sube el multiplicador de puntaje (hasta x3).
6. Al terminar el tiempo (o si el Admin presiona "Terminar Partida"), se muestra
   el Ranking Final y after 15s todos vuelven automáticamente al Lobby, listos
   para que el Admin lance la siguiente misión.

## Estructura del proyecto
```
ccl-game/
├── server.js              # servidor Express + Socket.io
├── gameManager.js          # lógica de salas, temporizador, flujo del admin
├── data/missions.js        # catálogo de 19 misiones + banco de preguntas
└── public/
    ├── index.html           # las 5 escenas del flujo
    ├── css/style.css         # Style Token corporativo
    └── js/
        ├── main.js                # orquestador: sockets + escenas + game loop
        ├── missionRegistry.js     # mapa código -> clase de misión
        ├── engine/canvasEngine.js # motor base + helpers de dibujo
        └── missions/*.js          # las 19 mecánicas de juego
```

## Personalizar / extender
- Agregar preguntas: edita `data/missions.js` → `QUESTIONS_BANK`.
- Cambiar duración de partida: `gameManager.js` → `MATCH_DURATION_MS`.
- Cambiar límite de jugadores: `gameManager.js` → `MAX_PLAYERS`.
- Ajustar colores del Style Token: `public/css/style.css` → variables `:root`.
- Cada misión es una clase independiente en `public/js/missions/`; para crear
  una nueva, copia el patrón de `MissionBase` (start/update/render/onClick).
