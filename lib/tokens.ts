// Tokens de diseño de DipuTracker — la paleta y métricas de facto del diseño canónico,
// centralizadas para los componentes nuevos (v5). Los componentes existentes migran
// oportunísticamente cuando se los toca; los valores son EXACTAMENTE los del prototipo
// (paridad visual), así que importar un token nunca cambia un pixel.
//
// Nota: objeto TS congelado y no CSS vars, a propósito — los estilos del proyecto son
// 100% inline (CSP style-src 'unsafe-inline') y un import tipado da autocomplete y
// refactor mecánico sin tocar globals.css ni la CSP.
//
// La rampa diverging del índice NO vive acá: ramp() de lib/compute.ts sigue siendo la
// única fuente (paridad numérica del prototipo).

export const C = Object.freeze({
  // fondos
  paper: "#FAFAF9", // fondo de la app
  surface: "#FFFFFF", // cards
  cream: "#FFFDF7", // paneles suaves (advertencias metodológicas, futuro)
  chipBg: "#F0EDE6", // segmented controls / chips neutros
  footer: "#F5F3ED",

  // tinta (escala cálida)
  ink: "#1C1A17",
  inkSoft: "#3A3733",
  body: "#57534E",
  muted: "#78736A",
  soft: "#8A857A",
  faint: "#9A958A",
  ghost: "#A8A296",
  ghostest: "#B0AB9F",

  // acento
  accent: "#B45309", // terracota
  accentSoft: "#FDBA74", // naranja claro sobre oscuro
  accentHover: "#8A3D06",

  // bordes
  border: "#E7E3DB",
  borderSoft: "#EFEBE3",
  borderInput: "#E0DBD0",
  borderChip: "#E2DDD2",
  borderDashed: "#D8D3C8", // el "futuro no consumado" (chips deshabilitados, citaciones)

  // semántica de voto (idéntica a lib/compute.ts colorFor)
  voteAf: "#2F6F4E",
  voteNeg: "#9B3022",
  voteAbs: "#B8B2A6",

  // extremos de la rampa diverging (solo para leyendas; la rampa real es ramp())
  rampNeg: "#0F766E",
  rampPos: "#B45309",
});

export const R = Object.freeze({
  card: 16,
  panel: 14,
  row: 12,
  control: 9,
  chip: 7,
  pill: 20,
});

export const SHADOW_CARD = "0 1px 2px rgba(28,26,23,0.03),0 14px 38px -28px rgba(28,26,23,0.22)";

// Helpers tipográficos — objetos de estilo listos para spread en style={{...}}
import type { CSSProperties } from "react";

export const T = Object.freeze({
  // eyebrow terracota de sección
  kicker: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: C.accent,
  } as CSSProperties,
  // eyebrow gris (secciones secundarias)
  kickerMuted: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.faint,
  } as CSSProperties,
  // título serif de sección
  h2: {
    fontFamily: "var(--font-serif), Georgia, serif",
    fontWeight: 600,
    fontSize: "30px",
    letterSpacing: "-0.015em",
    margin: 0,
  } as CSSProperties,
  // metadata mono (fechas, conteos, cortes)
  monoMeta: {
    fontSize: "11.5px",
    color: C.ghost,
    letterSpacing: "0.03em",
  } as CSSProperties,
});
