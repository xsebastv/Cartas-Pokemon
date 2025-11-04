# Pokémon Cards 3D (React + Vite)

Juego de Cartas Anime con Visualización 3D (temática Pokémon). Carga Pokémon desde la PokeAPI, permite “invocar” y visualizar un modelo 3D impostor (Three.js) y “atrapar” en un flujo tipo Pokémon GO con sonidos.

## Cómo corre y se evalúa (rubrica)

1) Interfaz principal (20%)
- Grid de cartas con imagen, nombre y estado (Disponible / Invocado / Capturado).
- Buscador (por nombre/ID) con sugerencias.

2) Visualización al seleccionar (25%)
- Botón “Invocar” abre un visor 3D con OrbitControls (rotar y zoom).
- Se ve tarjeta mínima superpuesta (mini-ficha) + el modelo impostor 3D del Pokémon (planos cruzados) y sombra.

3) Integración con API (15%)
- PokeAPI para lista y detalles (incluye species para descripción). Prefetch de nombres para autocompletar.

4) Funcionalidades y bonos (20%)
- “Invocar” cambia el estado e invoca el visor.
- “Atrapar” ejecuta una animación (lanzamiento, abrir/cerrar, sacudidas) con probabilidad de éxito.
- Sonidos con Web Audio API (invocar, lanzar, capturar, fallar).

5) Código y organización (10%)
- React + Vite, componentes separados (Card, Viewer3D, DetailModal, Loader), hooks y servicios.
- Comentarios en puntos clave (Viewer3D) y limpieza de recursos (dispose, ResizeObserver).

6) Presentación y diseño (10%)
- Tema inspirado en Pokémon, UI limpia y legible. Modal de detalles con imagen grande alineada a la izquierda y datos a la derecha.

Bonus (hasta +20%)
- Anillo tipo GO, probabilidad por tipo/peso/stats, banner de “¡Capturado!”, chip de tarjeta dentro del visor, autocompletado.

## Tecnologías
- React + Vite
- Three.js (OrbitControls)
- GSAP (animaciones)
- PokeAPI: https://pokeapi.co/

## Scripts
- `npm run dev` — entorno de desarrollo
- `npm run build` — build de producción
- `npm run preview` — sirve la build localmente

## Organización del código
- `src/App.jsx`: orquesta búsqueda, lista, estados y abre visor/detalle.
- `src/components/Card.jsx`: carta con acciones Invocar/Atrapar y badge de estado.
- `src/components/Viewer3D.jsx`: escena Three.js, impostor 3D y captura.
- `src/components/DetailModal.jsx`: detalles con imagen grande a la izquierda.
- `src/services/pokeApi.js`: llamadas a PokeAPI y normalización.
- `src/styles/*`: tema y estilos.

## Notas de Licencia
- Sprites desde PokeAPI (assets públicos). Escena 3D generada con Three.js.
- Estilos de carta inspirados y reimplementados sin copiar assets propietarios.

