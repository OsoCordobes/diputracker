// Funciones puras del ETL de agenda parlamentaria. Sin I/O: reciben HTML/objetos y
// devuelven datos o LANZAN si la fuente cambió de forma (el caller decide no escribir).
//
// Principio del proyecto: cero datos inventados. Estas funciones solo extraen lo que
// las fuentes oficiales publican — fechas de citación, estados textuales, links al
// temario, reuniones de comisión. Jamás predicciones ni estados que la HCDN no publica.
//
// A diferencia de parseSesiones() (etl-votaciones-parse.mjs), acá el parseo se ancla a
// los <a href="sesion.html?id=…"> y NO al texto plano: el HTML del listado contiene
// fechas sueltas que no son sesiones (p. ej. el header "PERIODO 144 (01/03/2026 -
// 28/02/2027)") y en una ventana FUTURA eso generaría sesiones fantasma.
import { decodeEntities } from "./etl-lib.mjs";

const MIN_HTML = 1024; // por debajo de esto no es una página real de la HCDN

function fechaValida(dd, mm, yyyy) {
  const d = +dd, m = +mm, y = +yyyy;
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100;
}

function stripTags(s) {
  return decodeEntities(s.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// 1. Listado de sesiones con estado (https://www.diputados.gov.ar/sesiones/)
//    Anchors reales observados (tests/fixtures/sesiones-hcdn.html):
//      "5° Reunión - 4° Sesión Ordinaria Especial - (24/06/2026)"            → efectuada
//      " Sesión Ordinaria Especial CITADA - NO EFECTUADA - (20/05/2026)"     → no_efectuada
//      "17° Reunión - … CITADA - FRACASADA - (15/10/2025)"                   → fracasada
//      "Sesión … CITADA - (dd/mm/yyyy)" (sin desenlace)                      → citada
// ---------------------------------------------------------------------------
/**
 * @param {string} html
 * @returns {{ fecha: string, titulo: string, estado: "citada"|"efectuada"|"no_efectuada"|"fracasada", idSesion: number }[]}
 */
export function parseSesionesDetalladas(html) {
  const out = [];
  const re = /<a[^>]+href="(?:[^"]*\/)?sesion\.html\?id=(\d+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(re)) {
    const idSesion = parseInt(m[1], 10);
    const label = stripTags(m[2]);
    const f = label.match(/\((\d{2})\/(\d{2})\/(\d{4})\)/);
    if (!f || !fechaValida(f[1], f[2], f[3])) continue; // anchor sin fecha real: no es una sesión
    const fecha = `${f[3]}-${f[2]}-${f[1]}`;
    let estado = "efectuada";
    if (/CITADA\s*-\s*NO\s+EFECTUADA/i.test(label)) estado = "no_efectuada";
    else if (/CITADA\s*-\s*FRACASADA/i.test(label)) estado = "fracasada";
    else if (/\bCITADA\b/i.test(label)) estado = "citada";
    const titulo = label.replace(/\s*-?\s*\(\d{2}\/\d{2}\/\d{4}\)\s*$/, "").trim();
    out.push({ fecha, titulo, estado, idSesion });
  }
  if (!out.length && html.length > MIN_HTML) {
    throw new Error("forma desconocida del listado de sesiones: ningún anchor sesion.html?id= con fecha");
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2. Plan de Labor (plt.html): solo el LINK al temario oficial por sesión.
//    El temario en sí es un documento embebido (no HTML parseable): su contenido
//    se cura a mano con fuentes, igual que las votaciones.
// ---------------------------------------------------------------------------
/**
 * @param {string} html
 * @returns {{ idSesion: number, fecha: string|null, temarioU: string }[]}
 */
export function parsePlanDeLabor(html) {
  const out = [];
  const re = /<a[^>]+href="([^"]*procesar\.html\?id_sesion=(\d+)(?:&|&amp;|&#38;)tipo=temario[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(re)) {
    const idSesion = parseInt(m[2], 10);
    const label = stripTags(m[3]);
    const f = label.match(/\((\d{2})\/(\d{2})\/(\d{4})\)/);
    const fecha = f && fechaValida(f[1], f[2], f[3]) ? `${f[3]}-${f[2]}-${f[1]}` : null;
    const href = m[1].replace(/&amp;|&#38;/g, "&");
    const temarioU = href.startsWith("http") ? href : "https://www.diputados.gov.ar" + href;
    out.push({ idSesion, fecha, temarioU });
  }
  if (!out.length && html.length > MIN_HTML) {
    throw new Error("forma desconocida del Plan de Labor: ningún link a temario");
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Agenda de comisiones (/comisiones/agenda/): reuniones próximas con fecha,
//    hora, sala, comisión y temas VERBATIM de la citación oficial.
// ---------------------------------------------------------------------------
const MESES = {
  enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
  julio: "07", agosto: "08", septiembre: "09", setiembre: "09", octubre: "10",
  noviembre: "11", diciembre: "12",
};

// "martes 14 de julio del 2026" → "2026-07-14" (null si no matchea)
export function fechaCastellanoIso(texto) {
  const m = texto.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+del?\s+(\d{4})/);
  if (!m || !MESES[m[2]]) return null;
  return `${m[3]}-${MESES[m[2]]}-${String(+m[1]).padStart(2, "0")}`;
}

/**
 * @param {string} html
 * @returns {{ fecha: string, hora?: string, comision: string, lugar?: string, temas?: string, citacionU?: string }[]}
 */
export function parseAgendaComisiones(html) {
  if (html.length < MIN_HTML) throw new Error("agenda de comisiones: HTML demasiado corto");
  // marcador estructural de la página (independiente de que haya reuniones o no)
  const esLaPagina = /agendaComisiones|data-recursos-tipo="agenda"|Agenda\s+Parlamentaria/i.test(html);
  if (!esLaPagina) throw new Error("forma desconocida de la agenda de comisiones: sin marcadores de página");

  const tabla = html.match(/<table[^>]*id="agendaComisiones"[\s\S]*?<\/table>/i);
  if (!tabla) return []; // página válida sin tabla: receso / sin reuniones publicadas

  const out = [];
  // cada <thead> abre un día; las filas <tr><td…><td…> debajo pertenecen a ese día
  const bloques = tabla[0].split(/<thead>/i).slice(1);
  for (const bloque of bloques) {
    const th = bloque.match(/<th[^>]*>([\s\S]*?)<\/th>/i);
    const fecha = th ? fechaCastellanoIso(stripTags(th[1])) : null;
    if (!fecha) continue;
    for (const fila of bloque.matchAll(/<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)) {
      const td1 = fila[1];
      // comentarios HTML fuera ANTES de buscar anchors (hay <a> comentados en la fuente)
      const td2 = fila[2].replace(/<!--[\s\S]*?-->/g, "");
      const hora = td1.match(/<strong>\s*(\d{1,2}:\d{2})\s*<\/strong>/)?.[1];
      const lugar = stripTags(td1.replace(/<strong>[\s\S]*?<\/strong>/, "")) || undefined;
      const comision = stripTags(td2.match(/<a[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/a>/i)?.[1] || "");
      if (!comision) continue; // fila sin comisión identificable: no se inventa
      const citacionU = td2.match(/href="(https?:\/\/[^"]+)"[^>]*>\s*ver\s+citaci/i)?.[1];
      // temas: el td2 sin el anchor de la comisión ni el link "ver citación", verbatim
      const temas = stripTags(
        td2
          .replace(/<a[^>]*>\s*<strong>[\s\S]*?<\/strong>\s*<\/a>/i, "")
          .replace(/<a[^>]*>[\s\S]*?ver\s+citaci[\s\S]*?<\/a>/i, "")
      ) || undefined;
      out.push({ fecha, ...(hora && { hora }), comision, ...(lugar && { lugar }), ...(temas && { temas }), ...(citacionU && { citacionU }) });
    }
  }
  // había días publicados pero ninguna fila parseable → la forma cambió: no escribir
  if (bloques.length && !out.length) {
    throw new Error("forma desconocida de la agenda de comisiones: días sin reuniones parseables");
  }
  out.sort((a, b) => (a.fecha + (a.hora || "")).localeCompare(b.fecha + (b.hora || "")));
  return out;
}

// ---------------------------------------------------------------------------
// 4. Ciclo de vida próximas/recientes — puro, dirigido por la fuente.
// ---------------------------------------------------------------------------
function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Sesiones citadas a futuro dentro de la ventana. Preserva temas[] curados y agrega
 * temarioU del Plan de Labor. La fuente manda: lo que no figura como CITADA con fecha
 * >= hoy, no es "próxima".
 * @param {{fecha:string,titulo:string,estado:string,idSesion:number}[]} sesiones
 * @param {{hoy:string, ventanaDias?:number, fuenteU:string, planDeLabor?:{idSesion:number,temarioU:string}[], previas?:any[]}} opts
 */
export function construirProximas(sesiones, { hoy, ventanaDias = 60, fuenteU, planDeLabor = [], previas = [] }) {
  const temarios = new Map(planDeLabor.map((p) => [p.idSesion, p.temarioU]));
  const curadas = new Map(previas.map((p) => [p.idSesion, p.temas]));
  return sesiones
    .filter((s) => s.estado === "citada" && s.fecha >= hoy && s.fecha <= addDays(hoy, ventanaDias))
    .map((s) => {
      const temarioU = temarios.get(s.idSesion);
      const temas = curadas.get(s.idSesion) || []; // el ETL jamás borra curaduría
      return {
        fecha: s.fecha,
        titulo: s.titulo,
        estado: "citada",
        idSesion: s.idSesion,
        fuenteU,
        ...(temarioU && { temarioU }),
        temas,
      };
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/**
 * Desenlaces recientes (≤ dias hacia atrás) del mismo listado. Solo estados que la
 * fuente confirma (efectuada / no_efectuada / fracasada); una "citada" con fecha
 * pasada sin desenlace publicado no entra a ningún lado.
 * Cruces: votaciones del dataset por fecha exacta primero y +1 día para las no
 * reclamadas (la votación cae en la madrugada siguiente al inicio de sesión);
 * pendientes.json marca curaduría pendiente.
 * @param {{fecha:string,titulo:string,estado:string,idSesion:number}[]} sesiones
 * @param {{hoy:string, dias?:number, fuenteU:string, votaciones?:{id:string,fecha:string}[], pendientesFechas?:string[]}} opts
 */
export function construirRecientes(sesiones, { hoy, dias = 60, fuenteU, votaciones = [], pendientesFechas = [] }) {
  const desde = addDays(hoy, -dias);
  const recientes = sesiones
    .filter((s) => s.estado !== "citada" && s.fecha <= hoy && s.fecha >= desde)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // asignación de votaciones: exacta primero, +1 día solo para las no reclamadas
  const reclamadas = new Set();
  const porSesion = new Map(recientes.map((s) => [s.idSesion, []]));
  for (const paso of [0, 1]) {
    for (const s of recientes) {
      if (s.estado !== "efectuada") continue;
      for (const v of votaciones) {
        if (reclamadas.has(v.id)) continue;
        if (v.fecha === (paso === 0 ? s.fecha : addDays(s.fecha, 1))) {
          porSesion.get(s.idSesion).push(v.id);
          reclamadas.add(v.id);
        }
      }
    }
  }

  const pend = new Set(pendientesFechas);
  return recientes.map((s) => {
    const ids = porSesion.get(s.idSesion) || [];
    const esPendiente = s.estado === "efectuada" && !ids.length && pend.has(s.fecha);
    return {
      fecha: s.fecha,
      titulo: s.titulo,
      estado: s.estado,
      idSesion: s.idSesion,
      ...(ids.length && { votacionIds: ids }),
      ...(esPendiente && { curaduria: "pendiente" }),
      fuenteU,
    };
  });
}
