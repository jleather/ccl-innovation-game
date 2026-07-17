# Solución: "Cannot find module './data/missions'" en Render

## Qué significa este error
Render sí encontró y arrancó tu proyecto, pero cuando `server.js` intenta cargar
`gameManager.js`, y este a su vez intenta cargar `./data/missions.js`, el archivo
no existe en tu repositorio de GitHub.

**Causa casi segura**: al subir archivos arrastrándolos en el navegador de
GitHub, la carpeta `data/` (con `missions.js` adentro) no se subió completa.
Es un problema común del "uploading an existing file" cuando se arrastran
carpetas anidadas.

---

## Paso 1: Verificar qué hay realmente en tu repositorio
1. Ve a tu repo: `https://github.com/jleather/ccl-innovation-game`
2. Deberías ver en la raíz estos archivos y carpetas:
   ```
   server.js
   gameManager.js
   package.json
   package-lock.json   (puede o no estar)
   data/
   public/
   ```
3. Haz click en la carpeta `data/`. **Si no aparece esa carpeta, o aparece
   vacía, ese es el problema.**

---

## Paso 2: Subir el archivo faltante directamente desde GitHub (rápido)
Si `data/` no existe o está vacía:

1. En la página principal de tu repo, click en **Add file** → **Create new file**.
2. En el nombre del archivo escribe exactamente: `data/missions.js`
   (al escribir la barra `/`, GitHub crea automáticamente la carpeta `data`).
3. Abre el archivo `missions.js` que tienes en tu carpeta local descomprimida
   (`ccl-game/data/missions.js`) con el Bloc de Notas, copia **todo** su
   contenido, y pégalo en el editor de GitHub.
4. Baja hasta el final de la página → **Commit changes**.
5. Render detecta el cambio automáticamente y vuelve a desplegar solo (verás
   un nuevo deploy iniciar en el dashboard de Render en 1-2 minutos). Si no
   arranca solo, en Render click **Manual Deploy** → **Deploy latest commit**.

---

## Paso 3 (recomendado): Revisar TODA la estructura, no solo `data/`
Con el drag-and-drop del navegador es fácil perder otras carpetas también.
Verifica que también existan y tengan contenido:
```
public/index.html
public/css/style.css
public/js/main.js
public/js/missionRegistry.js
public/js/engine/canvasEngine.js
public/js/missions/   ← debe tener 19 archivos .js
```
Si falta algo más, repite el Paso 2 con la ruta correspondiente
(ej: `public/js/missions/gi_lemmings.js`), o mejor usa el Paso 4.

---

## Paso 4: Forma más confiable — GitHub Desktop (evita este problema de raíz)
El drag-and-drop del navegador falla con carpetas anidadas. GitHub Desktop
sube TODO tal cual está en tu disco, sin perder nada.

1. Descarga GitHub Desktop: https://desktop.github.com (instalador para Windows)
2. Ábrelo, inicia sesión con tu cuenta de GitHub.
3. **File → Clone repository** → pestaña "URL" → pega:
   ```
   https://github.com/jleather/ccl-innovation-game
   ```
   → elige una carpeta local (ej: `C:\Users\TuUsuario\Documents\ccl-repo`) → Clone.
4. Abre esa carpeta en el Explorador de Windows (ahora está vacía o casi vacía).
5. Copia y pega **todo el contenido** de tu carpeta `ccl-game` (la que
   descomprimiste del zip) dentro de esa carpeta clonada — reemplaza si pregunta.
6. Vuelve a GitHub Desktop: verás en la izquierda la lista de archivos nuevos
   detectados (deberían aparecer decenas: `data/missions.js`, los 19 de
   `public/js/missions/`, etc.)
7. Abajo a la izquierda, escribe un mensaje como "Subir proyecto completo" →
   **Commit to main** → **Push origin** (botón arriba).
8. Render redetecta el push y despliega automáticamente en 1-2 minutos.

---

## Paso 5: Confirmar que funcionó
1. En Render, entra a la pestaña **Logs** de tu servicio.
2. Deberías ver, sin errores debajo:
   ```
   CCL Innovation Game escuchando en puerto 3000
   ```
3. Abre la URL pública que te da Render (arriba del dashboard, tipo
   `https://ccl-innovation-game.onrender.com`) — debería cargar la pantalla
   de Registro del juego.

---

## Recomendación para el futuro
Usa siempre **GitHub Desktop** (Paso 4) para subir o actualizar el proyecto,
en vez de arrastrar archivos en el navegador. Es más confiable con carpetas
anidadas y además te deja ver exactamente qué archivos se van a subir antes
de confirmarlo.
