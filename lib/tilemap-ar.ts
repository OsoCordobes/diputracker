// Disposición geográfica aproximada de los 24 distritos electorales en una grilla de
// tiles (estándar editorial NPR/FT para pocas unidades). Coordenadas fijas: col crece
// hacia el este, row hacia el sur. Los nombres son EXACTAMENTE los de diputados.json
// (validados por scripts/validate-data.mjs).
export interface TilePos {
  col: number;
  row: number;
  sigla: string;
}

export const TILE_COLS = 5;
export const TILE_ROWS = 9;

export const TILE_POS: Record<string, TilePos> = {
  // NOA / NEA
  Jujuy: { col: 1, row: 0, sigla: "JUJ" },
  Salta: { col: 2, row: 0, sigla: "SAL" },
  Formosa: { col: 3, row: 0, sigla: "FOR" },
  Catamarca: { col: 1, row: 1, sigla: "CAT" },
  Tucumán: { col: 2, row: 1, sigla: "TUC" },
  Chaco: { col: 3, row: 1, sigla: "CHA" },
  Misiones: { col: 4, row: 1, sigla: "MIS" },
  "La Rioja": { col: 1, row: 2, sigla: "LRJ" },
  "Santiago del Estero": { col: 2, row: 2, sigla: "SDE" },
  Corrientes: { col: 4, row: 2, sigla: "CTS" },
  // Centro / Cuyo
  "San Juan": { col: 0, row: 3, sigla: "SJN" },
  Córdoba: { col: 2, row: 3, sigla: "CBA" },
  "Santa Fe": { col: 3, row: 3, sigla: "SFE" },
  "Entre Ríos": { col: 4, row: 3, sigla: "ERS" },
  Mendoza: { col: 0, row: 4, sigla: "MZA" },
  "San Luis": { col: 1, row: 4, sigla: "SLS" },
  "La Pampa": { col: 2, row: 4, sigla: "LPA" },
  "Buenos Aires": { col: 3, row: 4, sigla: "PBA" },
  CABA: { col: 4, row: 4, sigla: "CABA" },
  // Patagonia
  Neuquén: { col: 1, row: 5, sigla: "NQN" },
  "Río Negro": { col: 2, row: 5, sigla: "RNG" },
  Chubut: { col: 2, row: 6, sigla: "CHU" },
  "Santa Cruz": { col: 2, row: 7, sigla: "SCZ" },
  "Tierra del Fuego": { col: 3, row: 8, sigla: "TDF" },
};
