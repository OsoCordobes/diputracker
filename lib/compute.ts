// Núcleo de cómputo — port fiel de la lógica del prototipo de diseño (design/DipuTracker-Publicable.dc.html).
// Cualquier cambio acá debe mantener paridad numérica exacta con el prototipo.
import type {
  Bloque,
  CtxFile,
  Dep,
  DipFile,
  DTData,
  Geo,
  Linea,
  Periodo,
  PosExc,
  PowerRow,
  Slot,
  Votacion,
  VotFile,
  VoteSrc,
} from "./types";

// ---------- layout del hemiciclo (257 bancas, 12 filas) ----------
export function layout(n: number): Geo {
  const rows = 12,
    innerF = 0.5,
    W = 1000,
    H = 532,
    cx = 500,
    cy = 512,
    Rout = 470;
  const radii: number[] = [];
  for (let i = 0; i < rows; i++) radii.push(innerF + ((1 - innerF) * i) / (rows - 1));
  const sum = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.max(8, Math.round((n * r) / sum)));
  let diff = n - counts.reduce((a, b) => a + b, 0);
  let ri = rows - 1;
  while (diff !== 0) {
    counts[ri] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    ri--;
    if (ri < 0) ri = rows - 1;
  }
  const slots: Slot[] = [];
  counts.forEach((cnt, r) => {
    const rad = radii[r] * Rout;
    const pad = 0.045;
    for (let i = 0; i < cnt; i++) {
      const t = cnt === 1 ? 0.5 : i / (cnt - 1);
      const a = Math.PI * (1 - pad) - t * Math.PI * (1 - 2 * pad);
      slots.push({ x: cx + rad * Math.cos(a), y: cy - rad * Math.sin(a), a });
    }
  });
  slots.sort((p, q) => q.a - p.a);
  const mk = (thr: number) => {
    const k = n - thr;
    const a = (slots[k - 1].a + slots[k].a) / 2;
    return {
      a,
      x1: cx + (innerF * Rout - 8) * Math.cos(a),
      y1: cy - (innerF * Rout - 8) * Math.sin(a),
      x2: cx + (Rout + 16) * Math.cos(a),
      y2: cy - (Rout + 16) * Math.sin(a),
    };
  };
  return { W, H, cx, cy, slots, m129: mk(129), m172: mk(172) };
}

// ---------- índice de poder de Banzhaf (enumeración exacta vía DP) ----------
export function banzhaf(bl: { k: string; size: number }[], thr: number): PowerRow[] {
  const N = bl.length,
    TOTAL = bl.reduce((a, b) => a + b.size, 0);
  const swings = new Array(N).fill(0);
  for (let i = 0; i < N; i++) {
    const size = bl[i].size;
    const dp = new Array(TOTAL + 1).fill(0);
    dp[0] = 1;
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const w = bl[j].size;
      for (let s = TOTAL; s >= w; s--) dp[s] += dp[s - w];
    }
    let cnt = 0;
    const lo = Math.max(0, thr - size),
      hi = thr - 1;
    for (let s = lo; s <= hi; s++) cnt += dp[s];
    swings[i] = cnt;
  }
  const tot = swings.reduce((a, b) => a + b, 0) || 1;
  return bl.map((b, i) => {
    const powerPct = (100 * swings[i]) / tot;
    const seatPct = (100 * b.size) / TOTAL;
    return { k: b.k, size: b.size, power: powerPct, seatPct, ratio: seatPct > 0 ? powerPct / seatPct : 0 };
  });
}

// ---------- procesamiento de datos crudos ----------
export function processData(dip: DipFile, vot: VotFile, ctx: CtxFile): DTData {
  const blocMap: Record<string, Bloque> = {};
  dip.bloques.forEach((b) => (blocMap[b.k] = b));
  const inter: DTData["inter"] = {};
  ctx.interbloques.lista.forEach((ib) => ib.bloques.forEach((k) => (inter[k] = ib)));
  const votaciones = vot.votaciones;
  const fb = dip.meta.fotosBase,
    fs = dip.meta.fotosSufijo;

  const deps = dip.diputados.map((d) => ({ ...d })) as Dep[];
  deps.forEach((d) => {
    const b = blocMap[d.b];
    d.blocName = b.nombre;
    d.blocShort = b.corto;
    d.chip = b.chip;
    d.inter = inter[d.b] ? inter[d.b].nombre : null;
    d.foto = d.f === "silueta" ? null : fb + d.f + fs;
    d.votes = votaciones.map((v) => {
      if (d.i && d.i > v.fecha) return { v: null, src: "pre" as VoteSrc };
      const exc = v.excepciones.find((e) => e.a === d.a);
      if (exc) return { v: exc.v, src: "exc" as VoteSrc, nota: exc.nota };
      const line = v.lineas[d.b];
      if (line === "AF" || line === "NEG" || line === "ABS") return { v: line, src: "linea" as VoteSrc };
      if (line === "DIV") return { v: null, src: "div" as VoteSrc };
      return { v: null, src: "nd" as VoteSrc };
    });
  });

  const geo = layout(deps.length);

  const bl = dip.bloques.map((b) => ({ k: b.k, size: deps.filter((d) => d.b === b.k).length }));
  const power = banzhaf(bl, 129);
  const pmap: Record<string, PowerRow> = {};
  power.forEach((p) => (pmap[p.k] = p));
  const maxRatio = Math.max(...power.map((p) => p.ratio));

  const byId: Record<number, Dep> = {};
  deps.forEach((d) => (byId[d.id] = d));

  const data: DTData = {
    deps,
    byId,
    bloques: dip.bloques,
    blocMap,
    votaciones,
    ctx,
    geo,
    inter,
    metaDip: dip.meta,
    metaVot: vot.meta,
    power: { list: power, map: pmap, maxRatio },
    blocIdx: {},
  };
  applyPeriod(data, "todo");
  return data;
}

export function periodIdxs(votaciones: Votacion[], p: Periodo): number[] {
  const idxs: number[] = [];
  votaciones.forEach((v, i) => {
    if (p === "ext" && v.fecha > "2026-02-28") return;
    if (p === "ord" && v.fecha < "2026-03-01") return;
    idxs.push(i);
  });
  return idxs;
}

export function applyPeriod(D: DTData, p: Periodo): number[] {
  const P = periodIdxs(D.votaciones, p || "todo");
  const V = D.votaciones;
  D.deps.forEach((d) => {
    let counted = 0,
      pro = 0;
    const evo: (number | null)[] = [];
    P.forEach((i) => {
      const x = d.votes[i];
      if (x.v === "AF" || x.v === "NEG" || x.v === "ABS") {
        counted++;
        if (x.v === V[i].gov) pro++;
      }
      evo.push(counted ? Math.round((100 * pro) / counted) : null);
    });
    d.counted = counted;
    d.indice = counted ? Math.round((100 * pro) / counted) : null;
    d.evo = evo;
    d.hasExc = P.some((i) => d.votes[i].src === "exc");
  });
  const blocIdx: Record<string, number> = {};
  D.bloques.forEach((b) => {
    const ms = D.deps.filter((d) => d.b === b.k && d.indice != null);
    blocIdx[b.k] = ms.length ? Math.round(ms.reduce((a, d) => a + (d.indice as number), 0) / ms.length) : -1;
  });
  D.blocIdx = blocIdx;
  const geo = D.geo;
  const byI = D.deps.slice().sort((a, b) => {
    const ai = a.indice == null ? 999 : a.indice,
      bi = b.indice == null ? 999 : b.indice;
    return ai - bi || a.b.localeCompare(b.b) || a.a.localeCompare(b.a);
  });
  byI.forEach((d, k) => (d.posI = geo.slots[k]));
  const byB = D.deps.slice().sort((a, b) => {
    const ai = blocIdx[a.b] < 0 ? 50 : blocIdx[a.b],
      bi = blocIdx[b.b] < 0 ? 50 : blocIdx[b.b];
    return (
      ai - bi ||
      a.b.localeCompare(b.b) ||
      (a.indice == null ? 999 : a.indice) - (b.indice == null ? 999 : b.indice) ||
      a.a.localeCompare(b.a)
    );
  });
  byB.forEach((d, k) => (d.posB = geo.slots[k]));
  return P;
}

// ---------- colores y helpers visuales ----------
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16),
    pb = parseInt(b.slice(1), 16);
  const c = (sh: number) => Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * t);
  return "rgb(" + c(16) + "," + c(8) + "," + c(0) + ")";
}

const RAMP_DEFAULT: [number, string][] = [
  [0, "#0F766E"],
  [0.17, "#14B8A6"],
  [0.34, "#5EEAD4"],
  [0.5, "#E7E5E4"],
  [0.66, "#FDBA74"],
  [0.83, "#F59E0B"],
  [1, "#B45309"],
];
const RAMP_DALTONICO: [number, string][] = [
  [0, "#1D4ED8"],
  [0.25, "#60A5FA"],
  [0.5, "#E7E5E4"],
  [0.75, "#F59E0B"],
  [1, "#92400E"],
];

export function ramp(t: number, daltonico = false): string {
  const st = daltonico ? RAMP_DALTONICO : RAMP_DEFAULT;
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < st.length; i++) {
    if (t <= st[i][0]) {
      const a = st[i - 1],
        b = st[i];
      return mix(a[1], b[1], (t - a[0]) / (b[0] - a[0]));
    }
  }
  return st[st.length - 1][1];
}

export function rampPower(t: number): string {
  t = Math.max(0, Math.min(1, t));
  const st: [number, string][] = [
    [0, "#EAE6DD"],
    [0.5, "#EDB482"],
    [1, "#B45309"],
  ];
  for (let i = 1; i < st.length; i++) {
    if (t <= st[i][0]) {
      const a = st[i - 1],
        b = st[i];
      return mix(a[1], b[1], (t - a[0]) / (b[0] - a[0]));
    }
  }
  return st[st.length - 1][1];
}

export function label(v: number): string {
  if (v >= 80) return "Alineamiento alto con el oficialismo";
  if (v >= 60) return "Alineamiento moderado con el oficialismo";
  if (v >= 41) return "Posición mixta";
  if (v >= 21) return "Oposición moderada";
  return "Oposición firme";
}

export function initials(n: string): string {
  const parts = n.split(",")[0].trim().split(" ").filter(Boolean);
  return (parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : (n.split(",")[1] || " ").trim()[0] || "");
}

export function displayName(a: string): string {
  const p = a.split(",");
  return p.length > 1 ? p[1].trim() + " " + p[0].trim() : a;
}

export function fdate(iso: string): string {
  const M = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const p = iso.split("-");
  return parseInt(p[2], 10) + " " + M[parseInt(p[1], 10) - 1] + " " + p[0];
}

export interface VoteViewStyle {
  label: string;
  bg: string;
  border: string;
  fg: string;
  sw: string;
}

export function voteView(val: PosExc | Linea | null, src?: VoteSrc): VoteViewStyle {
  if (val === "AF") return { label: "Afirmativo", bg: "#EAF3EE", border: "#BFE0CC", fg: "#2F6F4E", sw: "#2F6F4E" };
  if (val === "NEG") return { label: "Negativo", bg: "#F7E9E6", border: "#E5C4BD", fg: "#9B3022", sw: "#9B3022" };
  if (val === "ABS") return { label: "Abstención", bg: "#F2EFE9", border: "#DED8CC", fg: "#6B665C", sw: "#B8B2A6" };
  if (val === "AUS") return { label: "Ausente", bg: "#FFFFFF", border: "#1C1A17", fg: "#1C1A17", sw: "#FFFFFF" };
  if (src === "pre") return { label: "No era diputado", bg: "#FBFAF7", border: "#EFEBE3", fg: "#B0AB9F", sw: "#F0EDE6" };
  if (src === "div")
    return {
      label: "Bloque dividido",
      bg: "#FBFAF7",
      border: "#EFEBE3",
      fg: "#8A857A",
      sw: "repeating-linear-gradient(45deg,#E7E3DB 0 2px,#F7F5F0 2px 4px)",
    };
  return {
    label: "Sin línea doc.",
    bg: "#FBFAF7",
    border: "#EFEBE3",
    fg: "#B0AB9F",
    sw: "repeating-linear-gradient(45deg,#E7E3DB 0 2px,#F7F5F0 2px 4px)",
  };
}

export function srcView(src: VoteSrc): { label: string; tip: string } {
  if (src === "exc") return { label: "registro", tip: "Voto o ausencia individual documentada en actas/prensa" };
  if (src === "linea") return { label: "línea bloque", tip: "Posición mayoritaria documentada del bloque" };
  if (src === "div") return { label: "s/dato", tip: "El bloque votó dividido; sin voto nominal individual todavía" };
  if (src === "pre") return { label: "no asumido", tip: "Asumió después de esta votación" };
  return { label: "s/dato", tip: "Sin línea de bloque documentada para esta votación" };
}

export const PER_LABEL: Record<Periodo, string> = {
  todo: "dic-2025 → may-2026",
  ext: "extraordinarias dic-2025/feb-2026",
  ord: "ordinarias abr/may-2026",
};
