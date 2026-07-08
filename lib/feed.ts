// View-model puro del feed "Crónica del período" — merge cronológico de votaciones,
// sesiones de agenda y movimientos de bloque, más el parseo/serialización de los
// filtros persistidos en el hash de la URL.
//
// TODO acá es función pura y testeable sin DOM: el useMemo del controlador solo hace
// glue. PROHIBIDO llamar a applyPeriod() desde este módulo o desde el feed: esa
// función MUTA Dref.current.deps[].indice in-place y compartir esa mutación entre el
// toggle global del hemiciclo y el filtro del feed produciría estados cruzados. El
// filtro de período del feed es una ventana de fechas LOCAL (constantes espejo de
// lib/compute.ts applyPeriod, líneas 154-156).
import type { CtxFile, Linea, Movimiento, Periodo, Votacion } from "@/lib/types";
import type { AgendaData, SesionCitada, SesionReciente } from "@/lib/agenda";

// ---- ventana de período (espejo de compute.ts, NO llamar applyPeriod) ----
const EXT_HASTA = "2026-02-28";
const ORD_DESDE = "2026-03-01";
const enPeriodo = (fecha: string, per: Periodo): boolean =>
  per === "todo" || (per === "ext" ? fecha <= EXT_HASTA : fecha >= ORD_DESDE);

// ---- recencia: NUEVO = fecha dentro de las 96 h previas al corte de datos ----
// Derivado de datos, determinístico e igual para todos los visitantes (sin localStorage).
const RECIENTE_DIAS = 4;
export function esNuevo(fecha: string, corte: string): boolean {
  const d = Date.parse(fecha + "T00:00:00Z");
  const c = Date.parse(corte + "T00:00:00Z");
  if (Number.isNaN(d) || Number.isNaN(c)) return false;
  const dias = (c - d) / 86400000;
  return dias >= 0 && dias <= RECIENTE_DIAS;
}

// ---- fechas de movimientos: "24 jun 2026" / "dic 2025" / "dic 2025 → jul 2026" ----
const MES_ABBR: Record<string, string> = {
  ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
  jul: "07", ago: "08", sep: "09", set: "09", oct: "10", nov: "11", dic: "12",
};

// Convierte la fecha libre de un movimiento a ISO ordenable. En rangos ("dic 2025 →
// jul 2026") toma el extremo MÁS RECIENTE (el movimiento se consolidó ahí). Sin día
// explícito se asume 01 (precisión de mes). null si no se puede parsear: ese
// movimiento no entra al feed (sigue visible en la vista Movimientos).
export function fechaMovIso(fecha: string): string | null {
  const tokens = [...fecha.toLowerCase().matchAll(/(?:(\d{1,2})\s+)?([a-záéíóú]{3,4})\.?\s+(\d{4})/g)]
    .map((m) => {
      const mes = MES_ABBR[m[2].slice(0, 3)];
      if (!mes) return null;
      return `${m[3]}-${mes}-${m[1] ? String(+m[1]).padStart(2, "0") : "01"}`;
    })
    .filter((x): x is string => x != null);
  if (!tokens.length) {
    const iso = fecha.match(/\d{4}-\d{2}-\d{2}/);
    return iso ? iso[0] : null;
  }
  return tokens.sort().at(-1)!;
}

// ---- distritos: slug de URL sin acentos ----
export function slugDistrito(d: string): string {
  return d
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---- filtros del feed persistidos en el hash ----
export type FeedTipo = "vot" | "ses" | "mov";
const TIPOS_TODOS: FeedTipo[] = ["vot", "ses", "mov"];

export interface FeedParams {
  per: Periodo; // espejo de S.periodo (el chip global gobierna también el feed)
  tipos: FeedTipo[]; // qué clases de item muestra el feed
  bloc: string; // clave de bloque ("" = todos); en la URL va en minúscula
  dist: string; // slug de distrito ("" = todos); solo afecta gráficos por distrito
}

export const FEED_DEFAULTS: FeedParams = { per: "todo", tipos: TIPOS_TODOS, bloc: "", dist: "" };

// Parseo tolerante: valores desconocidos caen al default en silencio (forward-compat —
// una URL nueva abierta por una UI vieja no debe romper nada, y viceversa).
export function parseFeedParams(query: string): FeedParams {
  const q = new URLSearchParams(query || "");
  const per = q.get("per");
  const tiposRaw = (q.get("feed") || "").split(",").filter((t): t is FeedTipo => (TIPOS_TODOS as string[]).includes(t));
  return {
    per: per === "ext" || per === "ord" ? per : "todo",
    tipos: tiposRaw.length ? tiposRaw : TIPOS_TODOS,
    bloc: (q.get("bloc") || "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
    dist: (q.get("dist") || "").toLowerCase().replace(/[^a-z0-9-]/g, ""),
  };
}

// Serializa SOLO los no-defaults → URLs limpias ("" si todo es default).
export function serializeFeedParams(p: FeedParams): string {
  const q = new URLSearchParams();
  if (p.per !== "todo") q.set("per", p.per);
  if (p.tipos.length && p.tipos.length < TIPOS_TODOS.length) q.set("feed", p.tipos.join(","));
  if (p.bloc) q.set("bloc", p.bloc.toLowerCase());
  if (p.dist) q.set("dist", p.dist);
  const s = q.toString();
  return s ? "?" + s : "";
}

// ---- countdown honesto: días entre hoy y una fecha citada (nunca predice nada) ----
export function countdownLabel(fechaIso: string, hoyIso: string, hora?: string): string {
  const d = Date.parse(fechaIso + "T00:00:00Z");
  const h = Date.parse(hoyIso + "T00:00:00Z");
  if (Number.isNaN(d) || Number.isNaN(h)) return "";
  const dias = Math.round((d - h) / 86400000);
  if (dias < 0) return "";
  if (dias === 0) return hora ? `hoy · ${hora}` : "hoy";
  if (dias === 1) return "mañana";
  return `en ${dias} días`;
}

// ---- items del feed (unión discriminada) ----
export interface FeedVotItem {
  kind: "votacion";
  fecha: string;
  idx: number; // índice en D.votaciones (para navegar a #/votacion)
  vot: Votacion;
  nuevo: boolean;
  lineaBloc?: Linea; // posición del bloque filtrado, si hay filtro de bloque
}
export interface FeedSesionFuturaItem {
  kind: "sesion-futura";
  fecha: string;
  sesion: SesionCitada;
}
export interface FeedSesionRecienteItem {
  kind: "sesion-reciente";
  fecha: string;
  sesion: SesionReciente; // solo no_efectuada / fracasada / curaduría pendiente
  nuevo: boolean;
}
export interface FeedMovItem {
  kind: "movimiento";
  fecha: string; // ISO ordenable (parseada)
  fechaLabel: string; // la fecha textual original
  mov: Movimiento;
  nuevo: boolean;
}
export type FeedItem = FeedVotItem | FeedSesionFuturaItem | FeedSesionRecienteItem | FeedMovItem;

export interface Feed {
  futuros: FeedSesionFuturaItem[]; // ascendente (lo más próximo primero)
  pasados: FeedItem[]; // descendente (lo más reciente primero) — convención live-blog
}

/**
 * Construye el feed. Reglas:
 * - Dedupe: una sesión efectuada CON votaciones curadas no genera item propio — las
 *   votaciones son el registro. Sí son noticia: no_efectuada, fracasada, y efectuada
 *   con curaduría pendiente ("ocurrió, votaciones en curaduría").
 * - Filtro de bloque: anota cada votación con la línea del bloque (lineaBloc) y
 *   restringe movimientos a los que involucran a ese bloque. No excluye votaciones:
 *   una votación involucra a toda la Cámara.
 * - Filtro de período: ventana local de fechas (ver header). Con per=ext no hay
 *   futuros (la ventana es histórica).
 */
export function buildFeed(
  D: { votaciones: Votacion[]; ctx: CtxFile },
  agenda: AgendaData,
  params: FeedParams,
  corte: string
): Feed {
  const { per, tipos, bloc } = params;
  const quiere = (t: FeedTipo) => tipos.includes(t);

  const futuros: FeedSesionFuturaItem[] = quiere("ses")
    ? agenda.proximas
        .filter((s) => enPeriodo(s.fecha, per))
        .map((s): FeedSesionFuturaItem => ({ kind: "sesion-futura", fecha: s.fecha, sesion: s }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];

  const pasados: FeedItem[] = [];

  if (quiere("vot")) {
    D.votaciones.forEach((v, idx) => {
      if (!enPeriodo(v.fecha, per)) return;
      pasados.push({
        kind: "votacion",
        fecha: v.fecha,
        idx,
        vot: v,
        nuevo: esNuevo(v.fecha, corte),
        ...(bloc && { lineaBloc: v.lineas[bloc] ?? null }),
      });
    });
  }

  if (quiere("ses")) {
    for (const s of agenda.recientes) {
      if (!enPeriodo(s.fecha, per)) continue;
      const esNoticia = s.estado !== "efectuada" || (s.curaduria === "pendiente" && !s.votacionIds?.length);
      if (!esNoticia) continue; // efectuada con votaciones curadas: las votaciones son el registro
      pasados.push({ kind: "sesion-reciente", fecha: s.fecha, sesion: s, nuevo: esNuevo(s.fecha, corte) });
    }
  }

  if (quiere("mov")) {
    for (const mov of D.ctx.movimientos) {
      const iso = fechaMovIso(mov.fecha);
      if (!iso || !enPeriodo(iso, per)) continue;
      if (bloc && mov.from !== bloc && mov.to !== bloc) continue;
      pasados.push({ kind: "movimiento", fecha: iso, fechaLabel: mov.fecha, mov, nuevo: esNuevo(iso, corte) });
    }
  }

  // desc por fecha; a igual fecha las votaciones van antes que sesiones y movimientos
  const peso = (i: FeedItem) => (i.kind === "votacion" ? 0 : i.kind === "sesion-reciente" ? 1 : 2);
  pasados.sort((a, b) => b.fecha.localeCompare(a.fecha) || peso(a) - peso(b));

  return { futuros, pasados };
}
