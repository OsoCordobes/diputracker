// ETL de agenda parlamentaria — sesiones citadas a futuro, desenlaces recientes y
// reuniones de comisión, desde las fuentes oficiales de la HCDN.
//
// Principio: este script NUNCA inventa datos. Publica solo lo que las fuentes
// oficiales publican: fecha y estado de citaciones, link al temario del Plan de
// Labor, reuniones de comisión con su texto verbatim. Los `temas[]` del temario
// son contenido CURADO A MANO con fuentes (el documento oficial no es parseable):
// este script los preserva, jamás los escribe ni los borra.
//
// Disciplina de escritura (como etl-nomina.mjs): si una fuente no cierra, se
// conserva lo previo y el error queda en el log; la validación posterior es el
// gate del commit. process.exit(0) siempre: los errores de red no rompen el cron.
import path from "node:path";
import { appendLog, DATA, fetchText, readJson, ROOT, todayIso, writeJsonCompact } from "./etl-lib.mjs";
import {
  construirProximas,
  construirRecientes,
  parseAgendaComisiones,
  parsePlanDeLabor,
  parseSesionesDetalladas,
} from "./etl-agenda-parse.mjs";

const AGENDA_PUB = path.join(DATA, "agenda.json");
const AGENDA_SEED = path.join(ROOT, "data", "seed", "agenda.json");
const PENDIENTES = path.join(ROOT, "data", "pendientes.json");

const FUENTES = {
  sesiones: ["https://www.diputados.gov.ar/sesiones/", "https://www.hcdn.gob.ar/sesiones/"],
  plan: ["https://www.diputados.gov.ar/secparl/dclp/plan_de_labor/plt.html"],
  comisiones: ["https://www.diputados.gov.ar/comisiones/agenda/"],
};
const VENTANA_DIAS = 60;

const hoy = todayIso();
const ahora = new Date().toISOString();
const result = { script: "etl-agenda", proximas: 0, recientes: 0, comisiones: 0, temariosDetectados: 0, errores: [] };

// estado previo (si no existe, arrancamos de un esqueleto vacío honesto)
let previa = null;
try {
  previa = readJson(AGENDA_PUB);
} catch {
  /* primera corrida */
}

async function fetchFirst(urls) {
  let lastErr;
  for (const url of urls) {
    try {
      return { html: await fetchText(url, { retries: 2, timeoutMs: 45000 }), url };
    } catch (e) {
      lastErr = e;
      result.errores.push(url + ": " + e.message);
    }
  }
  throw lastErr || new Error("sin fuentes");
}

// ---- 1. listado de sesiones (citadas futuras + desenlaces recientes) ----
let sesiones = null;
let fuenteSesiones = FUENTES.sesiones[0];
let okSesiones = false;
try {
  const r = await fetchFirst(FUENTES.sesiones);
  sesiones = parseSesionesDetalladas(r.html);
  fuenteSesiones = r.url;
  okSesiones = true;
} catch (e) {
  result.errores.push("listado de sesiones: " + e.message);
}

// ---- 2. Plan de Labor (solo links al temario oficial) ----
let plan = [];
let okPlan = false;
try {
  const r = await fetchFirst(FUENTES.plan);
  plan = parsePlanDeLabor(r.html);
  okPlan = true;
  result.temariosDetectados = plan.length;
} catch (e) {
  result.errores.push("plan de labor: " + e.message);
}

// ---- 3. agenda de comisiones ----
let comisiones = null;
let okComisiones = false;
try {
  const r = await fetchFirst(FUENTES.comisiones);
  comisiones = parseAgendaComisiones(r.html).filter((c) => c.fecha >= hoy);
  okComisiones = true;
} catch (e) {
  result.errores.push("agenda de comisiones: " + e.message);
}

// ---- armado del dataset ----
let votaciones = [];
try {
  votaciones = readJson(path.join(DATA, "votaciones.json")).votaciones.map((v) => ({ id: v.id, fecha: v.fecha }));
} catch (e) {
  result.errores.push("votaciones.json: " + e.message);
}
let pendientesFechas = [];
try {
  pendientesFechas = readJson(PENDIENTES).map((p) => p.fecha);
} catch {
  /* sin pendientes */
}

let proximas, recientes;
if (okSesiones) {
  proximas = construirProximas(sesiones, {
    hoy,
    ventanaDias: VENTANA_DIAS,
    fuenteU: fuenteSesiones,
    planDeLabor: okPlan ? plan : [],
    previas: previa?.proximas || [],
  });
  recientes = construirRecientes(sesiones, { hoy, dias: VENTANA_DIAS, fuenteU: fuenteSesiones, votaciones, pendientesFechas });
} else {
  // fuente caída: se conserva lo previo, pero las citadas vencidas salen de próximas
  // igualmente (ya no son "próximas" — eso es tautológico, no inventado)
  proximas = (previa?.proximas || []).filter((p) => p.fecha >= hoy);
  recientes = previa?.recientes || [];
}
const comisionesOut = okComisiones ? comisiones : (previa?.comisiones || []).filter((c) => c.fecha >= hoy);

const fuenteMeta = (n, urls, ok) => ({
  n,
  u: urls[0],
  consultado: ok ? ahora : previa?.meta?.fuentes?.find((f) => f.n === n)?.consultado || ahora,
  ok,
});

const agenda = {
  meta: {
    nota:
      "Agenda parlamentaria HCDN: convocatorias y temarios PUBLICADOS por fuentes oficiales. Nunca predicciones de resultado ni posiciones anticipadas. Los temas del Plan de Labor son curados a mano desde el documento oficial, con fuentes.",
    ventanaDias: VENTANA_DIAS,
    consultado: ahora,
    fuentes: [
      fuenteMeta("HCDN — Listado de sesiones", FUENTES.sesiones, okSesiones),
      fuenteMeta("HCDN — Plan de Labor (Temario)", FUENTES.plan, okPlan),
      fuenteMeta("HCDN — Agenda de comisiones", FUENTES.comisiones, okComisiones),
    ],
  },
  proximas,
  recientes,
  comisiones: comisionesOut,
};

result.proximas = proximas.length;
result.recientes = recientes.length;
result.comisiones = comisionesOut.length;

// ---- anti-churn: escribir solo ante cambios reales o a lo sumo un bump diario ----
const sinFrescura = (a) => JSON.stringify({ ...a, meta: { ...a.meta, consultado: 0, fuentes: a.meta.fuentes.map((f) => ({ ...f, consultado: 0 })) } });
const sinCambios = previa && sinFrescura(previa) === sinFrescura(agenda);
const yaBumpeadoHoy = previa?.meta?.consultado?.slice(0, 10) === hoy;
if (sinCambios && yaBumpeadoHoy) {
  result.nota = "sin cambios; sin escritura";
} else {
  writeJsonCompact(AGENDA_PUB, agenda);
  writeJsonCompact(AGENDA_SEED, agenda);
  result.nota = sinCambios ? "bump diario de verificación" : "datos actualizados";
}

appendLog(result);
console.log(JSON.stringify(result, null, 2));
// Los errores de red de fuentes externas no rompen la corrida (quedan en el log);
// la validación de invariantes corre después e impide cualquier commit inválido.
