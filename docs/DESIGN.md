# Diseño canónico — DipuTracker

El diseño de DipuTracker es **versionado**: cada evolución deliberada queda registrada acá.
Dos reglas separadas, con destinos distintos:

- **Paridad numérica** (`lib/compute.ts`): intocable, para siempre. Cualquier cambio ahí
  debe mantener paridad exacta con el prototipo original — los pins de
  [`tests/compute.test.ts`](../tests/compute.test.ts) lo verifican.
- **Paridad visual**: el prototipo `design/DipuTracker-Publicable.dc.html` (v1, gitignored)
  fue la base "pixel-perfect" del port inicial. Desde la v5, el diseño canónico **es el
  código en producción** más este changelog. El pin del orden editorial de la home vive en
  [`e2e/home-order.spec.ts`](../e2e/home-order.spec.ts): un reordenamiento solo puede
  ocurrir a propósito, actualizando ese archivo.

## Sistema visual (constantes desde v1)

- **Tipografía**: Libre Franklin (UI) · Source Serif 4 (títulos) · IBM Plex Mono (números,
  `.dt-num`, tabular). Autohospedadas vía `next/font`.
- **Paleta cálida**: fondo `#FAFAF9`, tinta `#1C1A17`, acento terracota `#B45309`,
  semántica de voto AF `#2F6F4E` / NEG `#9B3022` / ABS `#B8B2A6`, rampa diverging
  teal `#0F766E` ↔ terracota `#B45309` (única fuente: `ramp()` en `lib/compute.ts`).
  Desde v5, los valores canónicos viven tokenizados en [`lib/tokens.ts`](../lib/tokens.ts)
  (objeto TS congelado — los estilos del proyecto son 100% inline por la CSP).
- **Formas**: cards radius 14–16px, chips/pills 20px, sombras suaves.
- **Gráficos**: SVG bespoke, sin librerías. Cifras clave siempre impresas (nunca solo
  en tooltip); leyendas dentro del encuadre.

## Reglas duras de la v5 (capturabilidad y honestidad)

1. **Cero datos inventados**: el futuro solo muestra lo que la fuente oficial publica
   (citaciones, temario, estado). Jamás predicciones, barras ni colores de resultado
   sobre algo que no ocurrió. Futuro = borde dashed + dot hueco + neutro.
2. **Modo captura implícito** (sin botón de export): toda card capturable usa
   [`CardFrame`](../components/views/ui/CardFrame.tsx) — filtros aplicados como chips
   VISIBLES dentro de la card, y `diputracker.vercel.app · datos oficiales HCDN ·
   corte {fecha}` en el pie de CADA card.
3. **Honestidad temporal**: "verificado hoy hh:mm" solo si la corrida del ETL fue hoy
   en hora argentina; el marco temporal del sitio es ART (el "hoy" del recinto).
   El badge NUEVO se deriva de datos (96 h del corte), nunca de localStorage.
4. **Toda vista filtrada es un link**: los filtros del panel viven en el hash
   (`#/panel?per=ord&bloc=lla&feed=vot,ses`); solo se serializan no-defaults.

## Changelog

### v5 — jul-2026 · "Live post"

- Home reordenada como crónica en curso: hero recortado → **AHORA** (última sesión /
  próxima citación con countdown / frescura de datos) → **FilterBar** global sticky →
  hemiciclo (intacto; composición por bloque fusionada al pie de su card) → **Crónica
  del período** (feed cronológico unificado: votaciones + sesiones citadas/fracasadas +
  movimientos, divisor HOY pulsante, estado vacío honesto) → **Cinco lecturas** (strip
  plot condensado + mini-cards) → herramientas → método.
- Nuevo dataset [`agenda.json`](DATASET.md#agendajson): sesiones citadas a futuro,
  desenlaces recientes y reuniones de comisión, desde fuentes oficiales.
- Un gráfico por índice, SVG bespoke: **StripPlot** (257 bancas, apilado determinístico),
  **RecordStrip** (líneas por bloque, cronológico), **DumbbellPower** (poder vs bancas),
  **BreakMatrix** (rupturas banca × votación), **TileMapAr** (mosaico de 24 distritos).
- Filtro de bloque atenúa el hemiciclo (`highlightSet`, bancas al 15%).
- Grid del período y timeline de movimientos absorbidos por la crónica; teaser del
  comparador demotado a la banda de herramientas.

### v1–v4 — dic-2025 → jul-2026

Port pixel-perfect del prototipo Claude Design (`design/DipuTracker-Publicable.dc.html`):
hemiciclo interactivo de 257 bancas con 5 modos, vistas de votación/índices/comparador/
simulador/movimientos/patrimonio, ficha con sparkline, búsqueda ⌘K, tarjetas PNG
compartibles y CSV. v2–v4: fotos oficiales con fallback a iniciales, SEO/OG, seguridad
(CSP), accesibilidad (roving tabindex, reduced-motion).
