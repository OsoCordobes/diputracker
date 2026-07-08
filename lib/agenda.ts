// Tipos y normalización defensiva de agenda.json (agenda parlamentaria).
//
// La agenda es el único dataset OPCIONAL de la app: el deploy de UI y el de datos
// pueden divergir (UI nueva + agenda.json ausente, o un 404 de Vercel que devuelve
// HTML). Por eso todo pasa por normalizeAgenda(): entrada desconocida → estructura
// válida con defaults vacíos, jamás un crash. La app funciona completa sin agenda.

export interface TemaAgenda {
  titulo: string;
  expediente?: string;
  estadoTramite?: string;
  fuentes: { n: string; u: string }[];
}

export interface SesionCitada {
  fecha: string; // ISO, >= hoy
  titulo: string;
  estado: "citada";
  idSesion: number;
  fuenteU: string;
  temarioU?: string;
  temas: TemaAgenda[];
}

export interface SesionReciente {
  fecha: string; // ISO, <= hoy
  titulo: string;
  estado: "efectuada" | "no_efectuada" | "fracasada";
  idSesion: number;
  votacionIds?: string[];
  curaduria?: "pendiente";
  fuenteU: string;
}

export interface ReunionComision {
  fecha: string;
  hora?: string;
  comision: string;
  lugar?: string;
  temas?: string;
  citacionU?: string;
}

export interface FuenteAgenda {
  n: string;
  u: string;
  consultado: string;
  ok: boolean;
}

// La forma cruda del JSON servido (puede faltar entera o venir malformada).
export interface AgendaFile {
  meta?: { nota?: string; ventanaDias?: number; consultado?: string; fuentes?: FuenteAgenda[] };
  proximas?: SesionCitada[];
  recientes?: SesionReciente[];
  comisiones?: ReunionComision[];
}

// Forma normalizada que consume la UI: siempre completa, siempre válida.
export interface AgendaData {
  consultado: string | null; // ISO con hora, o null si no hay agenda
  fuentes: FuenteAgenda[];
  proximas: SesionCitada[];
  recientes: SesionReciente[];
  comisiones: ReunionComision[];
}

export const AGENDA_VACIA: AgendaData = { consultado: null, fuentes: [], proximas: [], recientes: [], comisiones: [] };

const ISO_D = /^\d{4}-\d{2}-\d{2}$/;
const esFechaIso = (s: unknown): s is string => typeof s === "string" && ISO_D.test(s);
const esHttps = (s: unknown): s is string => typeof s === "string" && s.startsWith("https://");

/**
 * Normaliza la agenda cruda a una estructura segura. Reglas:
 * - null / malformado / secciones ausentes → vacío (la UI degrada con gracia).
 * - Una "próxima" con fecha vencida se EXCLUYE aunque el ETL no haya podado:
 *   la UI jamás muestra como futura una sesión pasada.
 * - Items sin fecha válida o sin fuente se descartan (cero datos inventados:
 *   sin fuente citable no se muestra).
 * @param hoy fecha ISO de referencia (inyectable para tests)
 */
export function normalizeAgenda(raw: AgendaFile | null | undefined, hoy: string): AgendaData {
  if (!raw || typeof raw !== "object") return AGENDA_VACIA;
  try {
    const consultado = typeof raw.meta?.consultado === "string" ? raw.meta.consultado : null;
    const fuentes = Array.isArray(raw.meta?.fuentes)
      ? raw.meta.fuentes.filter((f) => f && typeof f.n === "string" && esHttps(f.u))
      : [];

    const proximas = (Array.isArray(raw.proximas) ? raw.proximas : [])
      .filter(
        (p) =>
          p &&
          esFechaIso(p.fecha) &&
          p.fecha >= hoy &&
          p.estado === "citada" &&
          typeof p.titulo === "string" &&
          esHttps(p.fuenteU)
      )
      .map((p) => ({ ...p, temas: Array.isArray(p.temas) ? p.temas.filter((t) => t && typeof t.titulo === "string") : [] }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const recientes = (Array.isArray(raw.recientes) ? raw.recientes : [])
      .filter(
        (r) =>
          r &&
          esFechaIso(r.fecha) &&
          r.fecha <= hoy &&
          ["efectuada", "no_efectuada", "fracasada"].includes(r.estado) &&
          typeof r.titulo === "string" &&
          esHttps(r.fuenteU)
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    const comisiones = (Array.isArray(raw.comisiones) ? raw.comisiones : [])
      .filter((c) => c && esFechaIso(c.fecha) && c.fecha >= hoy && typeof c.comision === "string" && c.comision.length > 3)
      .sort((a, b) => (a.fecha + (a.hora || "")).localeCompare(b.fecha + (b.hora || "")));

    return { consultado, fuentes, proximas, recientes, comisiones };
  } catch {
    return AGENDA_VACIA;
  }
}
