// Preparación de datos pura para los gráficos de índices (v5). Regla dura: este módulo
// solo AGREGA/reorganiza campos ya computados por lib/compute.ts (d.indice, power,
// hasExc) — jamás recalcula un índice. Las bancas con indice === null se manejan
// explícitas (no se inventan en ningún bin ni promedio).
import type { Bloque, Dep, PowerRow } from "@/lib/types";
import { TILE_POS, type TilePos } from "@/lib/tilemap-ar";

// ---------- Strip plot de alineamiento (257 bancas) ----------

export const STRIP_CARRILES = 9;

export interface StripDot {
  id: number;
  nombre: string; // "Apellido, Nombre"
  indice: number; // 0-100 (los null van aparte)
  carril: number; // carril vertical en modo cámara completa (0..8)
  spread: number; // desplazamiento horizontal firmado (columnas) para grupos grandes
  carrilBloc: number; // carril vertical en modo por-bloque (0..2)
  spreadBloc: number; // desplazamiento horizontal firmado en modo por-bloque
  chip: string;
  blocShort: string;
  distrito: string;
  hasExc: boolean;
}

export interface StripBloque {
  k: string;
  corto: string;
  chip: string;
  mediana: number;
  n: number; // bancas con índice
  dots: StripDot[];
}

export interface StripData {
  dots: StripDot[]; // todas las bancas con índice
  sinIndice: number; // cuántas quedan fuera (se informan, no se ocultan)
  medianas: { k: string; corto: string; chip: string; mediana: number }[]; // bloques grandes, para marcas
  bloques: StripBloque[]; // small multiples (3+ bancas con índice), orden por mediana desc
}

const mediana = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

export function prepStrip(deps: Dep[], opts: { bloc?: string; dist?: string; medianasTop?: number } = {}): StripData {
  const { bloc = "", dist = "", medianasTop = 4 } = opts;
  const visibles = deps.filter((d) => (!bloc || d.b === bloc) && (!dist || d.d === dist));
  const dots: StripDot[] = [];
  const porBloque = new Map<string, { corto: string; chip: string; dots: StripDot[] }>();
  let sinIndice = 0;
  for (const d of visibles) {
    if (d.indice == null) {
      sinIndice++;
      continue;
    }
    const dot: StripDot = {
      id: d.id,
      nombre: d.a,
      indice: d.indice,
      carril: d.id % STRIP_CARRILES,
      spread: 0,
      carrilBloc: d.id % 3,
      spreadBloc: 0,
      chip: d.chip,
      blocShort: d.blocShort,
      distrito: d.d,
      hasExc: d.hasExc,
    };
    dots.push(dot);
    const g = porBloque.get(d.b) || { corto: d.blocShort, chip: d.chip, dots: [] };
    g.dots.push(dot);
    porBloque.set(d.b, g);
  }

  // Apilado determinístico: las bancas con el MISMO índice colapsarían en un punto
  // (90 bancas de un bloque en 100 se verían como 9). Dentro de cada grupo de igual
  // índice se llenan carriles secuenciales y, agotados, columnas laterales firmadas
  // (0, +1, -1, +2, …) — la masa se VE, sin simulación ni aleatoriedad.
  const columna = (col: number) => (col === 0 ? 0 : col % 2 ? (col + 1) / 2 : -(col / 2));
  const apilar = (grupo: StripDot[], carriles: number, set: (d: StripDot, carril: number, spread: number) => void) => {
    if (grupo.length < 2) return; // los índices únicos conservan su jitter id%carriles
    grupo.sort((a, b) => a.id - b.id);
    grupo.forEach((d, i) => set(d, i % carriles, columna(Math.floor(i / carriles))));
  };
  const porIndice = new Map<number, StripDot[]>();
  for (const d of dots) porIndice.set(d.indice, [...(porIndice.get(d.indice) || []), d]);
  for (const grupo of porIndice.values()) apilar(grupo, STRIP_CARRILES, (d, c, s) => ((d.carril = c), (d.spread = s)));
  for (const { dots: ds } of porBloque.values()) {
    const porIdx = new Map<number, StripDot[]>();
    for (const d of ds) porIdx.set(d.indice, [...(porIdx.get(d.indice) || []), d]);
    for (const grupo of porIdx.values()) apilar(grupo, 3, (d, c, s) => ((d.carrilBloc = c), (d.spreadBloc = s)));
  }
  const bloques: StripBloque[] = [...porBloque.entries()]
    .filter(([, g]) => g.dots.length >= 3)
    .map(([k, g]) => ({ k, corto: g.corto, chip: g.chip, mediana: mediana(g.dots.map((x) => x.indice)), n: g.dots.length, dots: g.dots }))
    .sort((a, b) => b.mediana - a.mediana || b.n - a.n);

  const medianas = [...bloques]
    .sort((a, b) => b.n - a.n)
    .slice(0, medianasTop)
    .map((b) => ({ k: b.k, corto: b.corto, chip: b.chip, mediana: b.mediana }));

  return { dots, sinIndice, medianas, bloques };
}

// ---------- Dumbbell de poder (Banzhaf vs bancas) ----------

export interface DumbbellRow {
  k: string;
  nombre: string;
  corto: string;
  chip: string;
  powerPct: number; // % de poder Banzhaf
  seatPct: number; // % de bancas
  ratio: number;
  color: string; // terracota pesa más / teal pesa menos / neutro (umbrales existentes)
}

// Umbrales idénticos a los del panel de poder del prototipo (DipuTracker.tsx)
export function colorRatio(ratio: number): string {
  return ratio >= 1.15 ? "#B45309" : ratio <= 0.9 ? "#0F766E" : "#78736A";
}

export function prepDumbbell(power: PowerRow[], blocMap: Record<string, Bloque>): DumbbellRow[] {
  return power
    .slice()
    .sort((a, b) => b.ratio - a.ratio || b.power - a.power)
    .map((p) => ({
      k: p.k,
      nombre: blocMap[p.k].nombre,
      corto: blocMap[p.k].corto,
      chip: blocMap[p.k].chip,
      powerPct: p.power,
      seatPct: p.seatPct,
      ratio: p.ratio,
      color: colorRatio(p.ratio),
    }));
}

// ---------- Mapa de mosaico de Argentina (24 distritos) ----------

export interface TileDatum extends TilePos {
  distrito: string;
  bancas: number;
  prom: number | null; // promedio distrital del índice (null si ninguna banca computa)
  computables: number;
  en2027: number; // bancas cuyo mandato vence en 2027
}

export function prepTiles(deps: Dep[]): TileDatum[] {
  const porDistrito = new Map<string, Dep[]>();
  for (const d of deps) {
    const arr = porDistrito.get(d.d) || [];
    arr.push(d);
    porDistrito.set(d.d, arr);
  }
  return Object.entries(TILE_POS).map(([distrito, pos]) => {
    const ds = porDistrito.get(distrito) || [];
    const conI = ds.filter((d) => d.indice != null);
    return {
      distrito,
      ...pos,
      bancas: ds.length,
      prom: conI.length ? Math.round(conI.reduce((a, d) => a + (d.indice as number), 0) / conI.length) : null,
      computables: conI.length,
      en2027: ds.filter((d) => (d.m || "").slice(-4) === "2027").length,
    };
  });
}
