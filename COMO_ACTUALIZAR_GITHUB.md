# Cómo actualizar los archivos en GitHub (y que Render los tome automáticamente)

Tienes 2 formas. La recomendada es la primera si ya instalaste GitHub Desktop
(como sugería la guía anterior); la segunda funciona siempre, sin instalar nada.

---

## Opción A — Con GitHub Desktop (recomendada, más confiable)

### Paso 1: Descomprimir el nuevo zip
1. Descarga el nuevo `ccl-innovation-game.zip` que te acabo de compartir.
2. Extrae todo el contenido a una carpeta temporal, por ejemplo:
   `C:\Users\TuUsuario\Downloads\ccl-game-nuevo`

### Paso 2: Reemplazar los archivos en tu carpeta clonada
1. Abre GitHub Desktop.
2. Si ya tenías clonado el repo antes, busca esa carpeta local. Si no la
   tienes a la mano, en GitHub Desktop: **File → Clone repository** →
   selecciona tu repo `ccl-innovation-game` → elige carpeta → **Clone**.
3. Abre esa carpeta clonada en el Explorador de Windows.
4. **Selecciona todo** el contenido (Ctrl+A) y bórralo (excepto la carpeta
   oculta `.git`, que normalmente no se ve — no la toques si aparece).
5. Copia y pega **todo el contenido** de `ccl-game-nuevo` (la carpeta que
   descomprimiste en el Paso 1) dentro de la carpeta clonada. Reemplaza si
   pregunta.

### Paso 3: Subir los cambios (commit + push)
1. Vuelve a GitHub Desktop. En la columna izquierda verás la lista de
   archivos que cambiaron, se agregaron o se borraron (decenas de líneas).
2. Abajo a la izquierda, escribe un mensaje de commit, por ejemplo:
   `Actualizar: duración configurable, preguntas aleatorias, feedback de puntaje`
3. Click **Commit to main**.
4. Click **Push origin** (arriba a la derecha).

### Paso 4: Confirmar que Render se actualizó
1. Ve a tu dashboard de Render → tu servicio.
2. En 1-2 minutos debería iniciar un nuevo deploy automáticamente (Render
   está "escuchando" cambios en tu repo de GitHub).
3. Revisa la pestaña **Logs** → deberías ver de nuevo:
   ```
   CCL Innovation Game escuchando en puerto 3000
   ```
4. Refresca la URL pública de tu juego — ya deberían estar los cambios.

---

## Opción B — Directamente desde el navegador (sin instalar nada)

Más lenta si son muchos archivos, pero sirve si no quieres usar GitHub Desktop.

### Paso 1: Borrar los archivos viejos en GitHub
1. Ve a tu repositorio en GitHub.
2. Entra a cada archivo que vas a reemplazar (por ejemplo `gameManager.js`,
   `data/missions.js`, `public/js/main.js`, `public/js/missions/tc_tetris.js`,
   `public/js/missions/se_spaceinvaders.js`, `public/index.html`,
   `public/css/style.css`, `server.js`) y usa el ícono de basurero (🗑) →
   **Commit changes** para borrarlo.

### Paso 2: Subir los archivos nuevos
1. En la raíz del repo (o dentro de la subcarpeta correspondiente), click
   **Add file → Upload files**.
2. Arrastra el archivo actualizado correspondiente desde tu carpeta
   descomprimida.
3. **Commit changes**.
4. Repite para cada archivo que cambió (ver la lista más abajo).

### Paso 3: Render se redespliega solo
Igual que en la Opción A, Paso 4 — espera 1-2 minutos y revisa los Logs.

---

## Archivos que cambiaron en esta actualización
Si usas la Opción B (subida manual), estos son los que necesitas reemplazar
o agregar — el resto no cambió:

```
server.js
gameManager.js
data/missions.js
public/index.html
public/css/style.css
public/js/main.js
public/js/missions/tc_tetris.js
public/js/missions/se_spaceinvaders.js
public/js/missions/gi_lemmings.js
public/js/missions/gh_duckhunt.js
public/js/missions/jr_operationwolf.js
public/js/missions/gf_paperboy.js
public/js/missions/st_whacamole.js
public/js/missions/in_galaga.js
```

---

## Recomendación
Si vas a seguir actualizando este proyecto varias veces (probable, mientras
seguimos ajustando misiones), vale la pena invertir 5 minutos en dejar
GitHub Desktop configurado — cada actualización futura queda en solo 3
clicks: reemplazar archivos → Commit → Push.

Lo más simple de todo, si prefieres evitar comparar archivo por archivo: en
la Opción A, el Paso 2 (borrar todo y volver a pegar la carpeta completa)
funciona siempre bien, aunque no sepas exactamente cuáles archivos cambiaron.
