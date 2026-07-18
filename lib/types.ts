// Formas de datos — espejo exacto de los JSON abiertos en /public/data
export type Pos = "AF" | "NEG" | "ABS";
export type PosExc = Pos | "AUS";
export type Linea = Pos | "DIV" | null;

export interface Bloque {
  k: string;
  nombre: string;
  corto: string;
  chip: string;
  pres: string;
}

export interface DiputadoRaw {
  id: number;
  a: string; // "Apellido, Nombre"
  d: string; // distrito
  b: string; // clave de bloque
  m: string; // mandato "2023-2027"
  f: string; // id de foto oficial o "silueta"
  r?: string; // rol/cargo
  i?: string; // fecha de asunción posterior al inicio del período (ISO)
}

export interface DipFile {
  meta: {
    fuente: string;
    consultado: string;
    fotosBase: string;
    fotosSufijo: string;
    nota: string;
  };
  bloques: Bloque[];
  diputados: DiputadoRaw[];
}

export interface Excepcion {
  a: string;
  v: PosExc;
  nota: string;
}

export interface Fuente {
  n: string;
  u: string;
}

export interface Votacion {
  id: string;
  corto: string;
  titulo: string;
  fecha: string; // ISO
  sesion: string;
  resultado: "aprobada" | "rechazada";
  af: number;
  neg: number;
  abs: number;
  gov: Pos;
  govLabel: string;
  lineas: Record<string, Linea>;
  excepciones: Excepcion[];
  notas: string[];
  fuentes: Fuente[];
}

export interface VotFile {
  meta: { periodo: string; nivel: string; nota: string; consultado: string };
  votaciones: Votacion[];
}

export interface Interbloque {
  nombre: string;
  pres: string;
  bloques: string[];
  chip: string;
}

export interface Movimiento {
  fecha: string;
  a?: string;
  from?: string;
  to?: string;
  alta?: boolean;
  delta?: boolean;
  nota: string;
  fuente: string;
}

export interface CtxFile {
  interbloques: { fuente: string; lista: Interbloque[] };
  autoridades: { rol: string; a: string }[];
  dieta: {
    monto: string;
    extra: string;
    neto: string;
    fecha: string;
    fuente: string;
    u: string;
    nota: string;
  };
  ddjj: { nota: string; u: string };
  movimientos: Movimiento[];
  fuentesGenerales: Fuente[];
}

// ---- derivados ----
export type VoteSrc = "exc" | "linea" | "div" | "nd" | "pre";

export interface DepVote {
  v: PosExc | null;
  src: VoteSrc;
  nota?: string;
}

export interface Dep extends DiputadoRaw {
  blocName: string;
  blocShort: string;
  chip: string;
  inter: string | null;
  foto: string | null;
  votes: DepVote[];
  counted: number;
  indice: number | null;
  evo: (number | null)[];
  hasExc: boolean;
  posI: Slot;
  posB: Slot;
}

export interface Slot {
  x: number;
  y: number;
  a: number;
}

export interface Marker {
  a: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Geo {
  W: number;
  H: number;
  cx: number;
  cy: number;
  slots: Slot[];
  m129: Marker;
  m172: Marker;
}

export interface PowerRow {
  k: string;
  size: number;
  power: number;
  seatPct: number;
  ratio: number;
}

export interface DTData {
  deps: Dep[];
  byId: Record<number, Dep>;
  bloques: Bloque[];
  blocMap: Record<string, Bloque>;
  votaciones: Votacion[];
  ctx: CtxFile;
  geo: Geo;
  inter: Record<string, Interbloque>;
  metaDip: DipFile["meta"];
  metaVot: VotFile["meta"];
  power: { list: PowerRow[]; map: Record<string, PowerRow>; maxRatio: number };
  blocIdx: Record<string, number>;
}

export type Periodo = "todo" | "ext" | "ord";
export type Mode = "indice" | "bloque" | "inter" | "poder" | "disidencia";
export type View =
  | "home"
  | "votacion"
  | "comparador"
  | "mov"
  | "simulador"
  | "indices"
  | "patrimonio"
  | "comoSeHizo";
export type ITab = "ali" | "dis" | "pow" | "rup" | "ter";
export type SimPos = "AF" | "NEG" | "ABS" | "AUS";
