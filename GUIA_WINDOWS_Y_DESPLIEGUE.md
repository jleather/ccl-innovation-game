# Guía: Probar en Windows 11 Pro y publicar online gratis

---

## PARTE 1 — Probarlo en tu PC con Windows 11 Pro

### Paso 1: Instalar Node.js
1. Ve a https://nodejs.org
2. Descarga la versión **LTS** (botón grande, recomendada para la mayoría).
3. Ejecuta el instalador `.msi` descargado → Siguiente → Siguiente → Instalar
   (deja todas las opciones por defecto, incluida "Add to PATH").
4. Reinicia el computador (o al menos cierra y abre cualquier terminal).

### Paso 2: Verificar la instalación
1. Abre el menú Inicio → escribe `PowerShell` → Enter.
2. Escribe:
   ```powershell
   node -v
   npm -v
   ```
   Si ambos comandos muestran un número de versión, quedó instalado correctamente.

### Paso 3: Descomprimir el proyecto
1. Descarga el archivo `ccl-innovation-game.zip` que te compartí.
2. Click derecho sobre el zip → **Extraer todo...** → elige una carpeta fácil de
   encontrar, por ejemplo `C:\Users\TuUsuario\Documents\ccl-game`.

### Paso 4: Instalar dependencias y arrancar el servidor
1. En PowerShell, navega a la carpeta descomprimida (ajusta la ruta a la tuya):
   ```powershell
   cd C:\Users\TuUsuario\Documents\ccl-game\ccl-game
   ```
2. Instala las dependencias (solo se hace una vez):
   ```powershell
   npm install
   ```
3. Arranca el servidor:
   ```powershell
   npm start
   ```
4. Deberías ver en la terminal:
   ```
   CCL Innovation Game escuchando en puerto 3000
   ```
   **Deja esa ventana de PowerShell abierta** — si la cierras, el servidor se apaga.

### Paso 5: Jugar
1. Abre tu navegador (Chrome/Edge) en: **http://localhost:3000**
2. Para simular varios jugadores desde tu mismo PC, abre esa misma URL en varias
   pestañas o ventanas.
3. Para entrar como Administrador, click en "Soy Administrador" y usa el código:
   ```
   CCL-ADMIN-2026
   ```

### Paso 6 (opcional): Probarlo desde otros celulares/PC de tu misma red WiFi
1. En PowerShell (sin cerrar el servidor), abre otra ventana y ejecuta:
   ```powershell
   ipconfig
   ```
2. Busca tu "Dirección IPv4" (algo como `192.168.1.25`).
3. Desde otro celular conectado a la **misma red WiFi**, abre en su navegador:
   ```
   http://192.168.1.25:3000
   ```
   (reemplaza por tu IP real). Esto NO funciona fuera de tu red local — para
   que funcione desde cualquier lugar necesitas la Parte 2 (servidor online).

### Solución de problemas comunes en Windows
- **"npm no se reconoce como comando"** → Node.js no quedó en el PATH. Reinstala
  Node.js marcando la opción "Add to PATH", o reinicia el PC.
- **"Puerto 3000 ya está en uso"** → cierra otra terminal que tenga el servidor
  corriendo, o cambia el puerto: `$env:PORT=3001; npm start` y entra a
  `http://localhost:3001`.
- **El antivirus/firewall de Windows pregunta si permitir Node.js** → dale
  "Permitir acceso" (necesario para que otros dispositivos de tu red se conecten).

---

## PARTE 2 — Publicarlo online gratis (para que cualquiera entre desde su celular)

La forma más simple y gratuita es **Render.com**. Necesitas una cuenta de GitHub
(gratis) para subir el código, y una cuenta de Render (gratis, sin tarjeta).

### Paso 1: Crear cuenta en GitHub
1. Ve a https://github.com y crea una cuenta si no tienes.

### Paso 2: Subir el proyecto a GitHub (usando el navegador, sin comandos)
1. En GitHub, click en el **+** arriba a la derecha → **New repository**.
2. Nombre: `ccl-innovation-game` → márcalo como **Public** o **Private** (ambos
   funcionan con Render) → **Create repository**.
3. En la página del repo vacío, click en **"uploading an existing file"**.
4. Arrastra **todo el contenido** de la carpeta `ccl-game` (no la carpeta zip,
   sino los archivos de adentro: `server.js`, `package.json`, `public/`, etc.)
5. Abajo, click **Commit changes**.

### Paso 3: Crear cuenta en Render y desplegar
1. Ve a https://render.com → **Get Started** → regístrate (puedes usar tu
   cuenta de GitHub para entrar más rápido).
2. En el Dashboard, click **New +** → **Web Service**.
3. Conecta tu cuenta de GitHub si te lo pide, y selecciona el repositorio
   `ccl-innovation-game` que subiste.
4. Configura:
   - **Name**: `ccl-innovation-game` (o el que quieras)
   - **Region**: la más cercana (Oregon US o Frankfurt EU suelen ser rápidas desde Colombia)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
5. Click **Create Web Service**.
6. Espera 2-4 minutos mientras Render instala y arranca tu servidor (verás los
   logs en pantalla, similar a lo que viste en PowerShell).
7. Cuando termine, arriba verás una URL pública tipo:
   ```
   https://ccl-innovation-game.onrender.com
   ```
   Esa es la URL que compartes con los 60 jugadores y el administrador.

### Nota importante sobre el plan gratuito de Render
El plan Free "duerme" el servidor tras ~15 minutos sin uso, y tarda unos 30-50
segundos en "despertar" la primera vez que alguien entra después de estar
inactivo. Para el día del evento, simplemente abre tú la URL 5 minutos antes de
que lleguen los jugadores para que esté despierto y responda al instante.

### Alternativa: Railway.app
Mismo proceso (conectar GitHub → Deploy), con un flujo casi idéntico. Útil si
Render te da problemas o prefieres otra opción gratuita.

---

## Resumen rápido
| Objetivo | Qué usar |
|---|---|
| Probarlo tú solo en tu PC | `npm install` + `npm start` → `localhost:3000` |
| Probarlo con celulares en tu misma oficina/WiFi | tu IP local (`ipconfig`) + puerto 3000 |
| Que cualquiera entre desde internet, el día del evento | Desplegar en Render.com (gratis) |
