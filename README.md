# Cartas Pokémon 3D (React + Vite)

Aplicación de cartas temática Pokémon con visor 3D, búsqueda con sugerencias, filtros por estado y animaciones de captura tipo Pokémon GO. Los datos se obtienen de PokeAPI y se guardan estados en localStorage.

## Características principales

- Catálogo en cuadrícula con cartas flip (anverso/reverso) y acciones al pie.
- Estados por carta: Disponible / Invocado / Capturado, con badge y chip de ID.
- Acciones: Invocar, Atrapar, Desinvocar, Desatrapar.
	- Los botones están a la misma altura (parte inferior) en ambas caras y se ajustan al tamaño del texto (por ejemplo, “Desinvocar”).
- Búsqueda por nombre o ID con sugerencias y botón de limpiar.
- Filtros segmentados (Todos / Invocados / Capturados) y contador de elementos mostrados.
- Header fijo con modo compacto al hacer scroll (histeresis para evitar parpadeos).
- Detalle del Pokémon en modal con etiquetas de estadísticas en español (PS, Ataque, Def. Esp., etc.).
- Visor 3D con Three.js:
	- OrbitControls (rotación y zoom), impostor 3D (billboard), sombra suave.
	- Modo captura con Pokéball procedural, anillo de puntería, lanzamiento en arco, sacudidas y probabilidad de captura basada en tipo/peso/stats.
	- Sonidos Web Audio API: invocar, lanzar, capturar y fallar.
- Cargador animado (GSAP) mientras inicializa el visor.
- Persistencia (localStorage) de IDs invocados/capturados entre sesiones.
- Comentarios del código y UI en español. Descripción de especies prioriza español desde PokeAPI.

## Tecnologías

- React 18 + Vite 5
- Three.js (OrbitControls, RoomEnvironment)
- GSAP (animaciones)
- PokeAPI: https://pokeapi.co/

## Estructura del proyecto

```
index.html
package.json
vite.config.js
public/
src/
	App.jsx
	main.jsx
	components/
		Card.jsx
		Card.css
		DetailModal.jsx
		Header.jsx
		Loader.jsx
		Loader.css
		PokeballMark.jsx
		Viewer3D.jsx
	hooks/
		usePokemon.js
		usePokemonNames.js
	services/
		pokeApi.js
	styles/
		gallery.css
		theme.css
	utils/
		pokemonColors.js
		storage.js
```

Referencias clave:
- `src/components/Header.jsx`: header con contadores, búsqueda, filtros y modo compacto.
- `src/components/Card.jsx` + `Card.css`: carta con flip 3D, acciones inferior y layout responsivo.
- `src/components/DetailModal.jsx`: modal de detalles con estadísticas en español y sprites.
- `src/components/Viewer3D.jsx`: visor 3D, captura y sonidos.
- `src/hooks/usePokemon.js`: carga, paginación y búsqueda (exacta y parcial con caché de nombres).
- `src/services/pokeApi.js`: normalización y descripción de especies priorizando español.
- `src/utils/storage.js`: persistencia simple en localStorage.

## Scripts

- `npm run dev` — entorno de desarrollo
- `npm run build` — build de producción
- `npm run preview` — sirve la build de producción

### Cómo ejecutar

```powershell
npm install
npm run dev
```

Para compilar y previsualizar producción:

```powershell
npm run build
npm run preview
```

## Accesibilidad y UX

- Navegación con teclado: Enter/Espacio abre detalles desde la carta; Escape cierra el modal.
- Roles y atributos ARIA en header, buscador, listas y modales.
- Transiciones suaves y modo compacto sin parpadeos en el header.

## Detalles de implementación relevantes

- Búsqueda con debounce y abortado de requests para evitar carreras.
- Sugerencias con prefetch de nombres una sola vez.
- Layout de acciones inferior estable con grid+flex para mantener la base de la carta alineada.
- Labels de estadísticas traducidos a español.
- Limpieza de recursos Three.js (dispose, PMREM, observers) al desmontar el visor.

## Notas de licencia

- Sprites desde PokeAPI (assets públicos). Escena 3D generada con Three.js.
- Estilos de carta inspirados y reimplementados sin copiar assets propietarios.

