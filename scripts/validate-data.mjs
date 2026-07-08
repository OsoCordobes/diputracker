// Validador de invariantes de los datasets de DipuTracker.
// Corre en CI y al final de cada ETL: si algo no cierra, el commit de datos NO se hace.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const DATA = path.join(ROOT, "public", "data");

const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

const dip = JSON.parse(fs.readFileSync(path.join(DATA, "diputados.json"), "utf8"));
const vot = JSON.parse(fs.readFileSync(path.join(DATA, "votaciones.json"), "utf8"));
const ctx = JSON.parse(fs.readFileSync(path.join(DATA, "contexto.json"), "utf8"));

// ---- diputados ----
check(Array.isArray(dip.diputados) && dip.diputados.length === 257, `diputados: se esperan 257, hay ${dip.diputados?.length}`);
check(Array.isArray(dip.bloques) && dip.bloques.length >= 15, `bloques: cantidad sospechosa (${dip.bloques?.length})`);
const blocKeys = new Set(dip.bloques.map((b) => b.k));
const ids = new Set();
const DISTRITOS = new Set([
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
]);
for (const d of dip.diputados) {
  check(Number.isInteger(d.id), `diputado sin id: ${d.a}`);
  check(!ids.has(d.id), `id duplicado: ${d.id}`);
  ids.add(d.id);
  check(typeof d.a === "string" && d.a.includes(","), `nombre inválido: "${d.a}"`);
  check(blocKeys.has(d.b), `bloque desconocido "${d.b}" para ${d.a}`);
  check(DISTRITOS.has(d.d), `distrito desconocido "${d.d}" para ${d.a}`);
  check(/^\d{4}-\d{4}$/.test(d.m), `mandato inválido "${d.m}" para ${d.a}`);
  check(d.f === "silueta" || /^[A-Za-z0-9_]+$/.test(d.f), `id de foto inválido para ${d.a}: "${d.f}"`);
  if (d.i) check(/^\d{4}-\d{2}-\d{2}$/.test(d.i), `fecha de asunción inválida "${d.i}" para ${d.a}`);
}
// Los ids son estables por persona (permalinks #/diputado/<id>): únicos y no negativos,
// no necesariamente contiguos — las altas usan max+1 y las bajas dejan huecos.
for (const id of ids) check(Number.isInteger(id) && id >= 0, `id inválido: ${id}`);
check(dip.meta?.fotosBase === "https://parlamentaria.hcdn.gob.ar/image/", "meta.fotosBase no es el host oficial de fotos de la HCDN");
check(/^\d{4}-\d{2}-\d{2}$/.test(dip.meta?.consultado || ""), "meta.consultado inválido");

// ---- votaciones ----
const POS = new Set(["AF", "NEG", "ABS", "DIV", null]);
const vids = new Set();
check(Array.isArray(vot.votaciones) && vot.votaciones.length >= 9, `votaciones: menos de 9 (${vot.votaciones?.length})`);
const byName = new Map(dip.diputados.map((d) => [d.a, d]));
for (const v of vot.votaciones) {
  check(!vids.has(v.id), `votación duplicada: ${v.id}`);
  vids.add(v.id);
  check(/^\d{4}-\d{2}-\d{2}$/.test(v.fecha), `fecha inválida en ${v.id}`);
  check(["aprobada", "rechazada"].includes(v.resultado), `resultado inválido en ${v.id}`);
  check(Number.isInteger(v.af) && Number.isInteger(v.neg) && Number.isInteger(v.abs), `totales inválidos en ${v.id}`);
  check(v.af + v.neg + v.abs <= 257, `totales exceden 257 en ${v.id}`);
  check(v.af >= 0 && v.neg >= 0 && v.abs >= 0, `totales negativos en ${v.id}`);
  check(["AF", "NEG"].includes(v.gov), `gov inválido en ${v.id}`);
  // coherencia resultado vs totales (mayoría simple de los presentes que votan)
  if (v.resultado === "aprobada") check(v.af > v.neg, `${v.id}: aprobada pero af<=neg (${v.af} vs ${v.neg})`);
  if (v.resultado === "rechazada") check(v.af <= v.neg, `${v.id}: rechazada pero af>neg (${v.af} vs ${v.neg})`);
  check(Object.keys(v.lineas).length === dip.bloques.length, `${v.id}: lineas no cubre todos los bloques`);
  for (const [k, val] of Object.entries(v.lineas)) {
    check(blocKeys.has(k), `${v.id}: bloque desconocido en lineas: ${k}`);
    check(POS.has(val), `${v.id}: posición inválida ${val} para ${k}`);
  }
  for (const e of v.excepciones) {
    check(byName.has(e.a), `${v.id}: excepción de diputado desconocido "${e.a}"`);
    check(["AF", "NEG", "ABS", "AUS"].includes(e.v), `${v.id}: excepción con voto inválido ${e.v}`);
    check(typeof e.nota === "string" && e.nota.length > 4, `${v.id}: excepción sin nota`);
    // Un registro individual no puede ser anterior a la asunción del diputado:
    // si esto falla, o la fecha "i" está mal o la excepción apunta a la persona equivocada.
    const dep = byName.get(e.a);
    if (dep?.i) check(dep.i <= v.fecha, `${v.id}: excepción de "${e.a}" pero asumió ${dep.i}, después de la votación (${v.fecha})`);
  }
  check(Array.isArray(v.fuentes) && v.fuentes.length >= 1, `${v.id}: sin fuentes citadas`);
  for (const f of v.fuentes) check(/^https:\/\/[^\s"]+$/.test(f.u || ""), `${v.id}: fuente sin URL https válida: ${f.u}`);
}
// orden cronológico
const fechas = vot.votaciones.map((v) => v.fecha);
check(
  JSON.stringify(fechas) === JSON.stringify([...fechas].sort()),
  "votaciones fuera de orden cronológico"
);

// ---- contexto ----
for (const ib of ctx.interbloques.lista) {
  for (const b of ib.bloques) check(blocKeys.has(b), `interbloque ${ib.nombre}: bloque desconocido ${b}`);
}
for (const m of ctx.movimientos) {
  if (m.a) check(byName.has(m.a), `movimiento con diputado desconocido: ${m.a}`);
  check(typeof m.fuente === "string" && m.fuente.length > 2, `movimiento sin fuente: ${m.nota?.slice(0, 40)}`);
}
check(/^https:\/\//.test(ctx.dieta?.u || ""), "dieta sin fuente URL https");
check(/^https:\/\//.test(ctx.ddjj?.u || ""), "ddjj sin URL oficial https");

// ---- agenda ----
// Principio: cero comparaciones contra el reloj de pared — toda coherencia temporal se
// valida contra meta.consultado del propio archivo, así el validador es determinista
// (la frescura la garantiza el cron, no el validador). El array vacío es VÁLIDO: que no
// haya sesiones citadas es el estado honesto más común del Congreso.
const agenda = JSON.parse(fs.readFileSync(path.join(DATA, "agenda.json"), "utf8"));
const ISO_DT = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?([+-]\d{2}:\d{2})?)?$/;
const ISO_D = /^\d{4}-\d{2}-\d{2}$/;
const HTTPS = /^https:\/\/[^\s"]+$/;
const soloClaves = (obj, permitidas, ctxMsg) => {
  for (const k of Object.keys(obj)) check(permitidas.includes(k), `${ctxMsg}: campo no permitido "${k}"`);
};

check(ISO_DT.test(agenda.meta?.consultado || ""), "agenda: meta.consultado inválido");
const corteAgenda = (agenda.meta?.consultado || "").slice(0, 10);
check(Number.isInteger(agenda.meta?.ventanaDias) && agenda.meta.ventanaDias >= 1 && agenda.meta.ventanaDias <= 120, "agenda: ventanaDias fuera de rango");
check(Array.isArray(agenda.meta?.fuentes) && agenda.meta.fuentes.length >= 1, "agenda: sin fuentes en meta");
for (const f of agenda.meta.fuentes) {
  soloClaves(f, ["n", "u", "consultado", "ok"], "agenda.meta.fuentes");
  check(HTTPS.test(f.u || ""), `agenda: fuente sin URL https: ${f.n}`);
  check(ISO_DT.test(f.consultado || ""), `agenda: fuente sin consultado ISO: ${f.n}`);
  check(typeof f.ok === "boolean", `agenda: fuente sin flag ok: ${f.n}`);
}

const addDaysIso = (iso, n) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

check(Array.isArray(agenda.proximas), "agenda: proximas no es array");
const idsProx = new Set();
let prevProx = "";
for (const p of agenda.proximas) {
  // whitelist anti-predicción: cualquier campo de resultado/estimación es ilegal por construcción
  soloClaves(p, ["fecha", "titulo", "estado", "idSesion", "fuenteU", "temarioU", "temas"], `agenda.proximas ${p.fecha}`);
  check(ISO_D.test(p.fecha || ""), `agenda: próxima con fecha inválida: ${p.fecha}`);
  check(p.fecha >= corteAgenda, `agenda: "citada" con fecha pasada (${p.fecha} < corte ${corteAgenda}) — debió transicionar`);
  check(p.fecha <= addDaysIso(corteAgenda, agenda.meta.ventanaDias), `agenda: próxima fuera de ventana: ${p.fecha}`);
  check(p.estado === "citada", `agenda: próxima con estado ilegal "${p.estado}" (a futuro solo existe "citada")`);
  check(Number.isInteger(p.idSesion) && p.idSesion > 0, `agenda: próxima sin idSesion: ${p.fecha}`);
  check(!idsProx.has(p.idSesion), `agenda: idSesion duplicado en próximas: ${p.idSesion}`);
  idsProx.add(p.idSesion);
  check(typeof p.titulo === "string" && p.titulo.length > 3, `agenda: próxima sin título: ${p.fecha}`);
  check(HTTPS.test(p.fuenteU || ""), `agenda: próxima sin fuenteU https: ${p.fecha}`);
  if (p.temarioU != null) check(HTTPS.test(p.temarioU), `agenda: temarioU inválido: ${p.fecha}`);
  check(Array.isArray(p.temas), `agenda: próxima sin array temas: ${p.fecha}`);
  for (const t of p.temas) {
    soloClaves(t, ["titulo", "expediente", "estadoTramite", "fuentes"], `agenda.temas de ${p.fecha}`);
    check(typeof t.titulo === "string" && t.titulo.length > 4, `agenda: tema sin título en ${p.fecha}`);
    check(Array.isArray(t.fuentes) && t.fuentes.length >= 1, `agenda: tema sin fuentes en ${p.fecha} (curaduría exige fuente)`);
    for (const tf of t.fuentes) check(HTTPS.test(tf.u || ""), `agenda: tema con fuente no https en ${p.fecha}`);
    if (t.expediente != null) check(/^\d{1,4}-[A-Z]{1,3}-\d{4}$/.test(t.expediente), `agenda: expediente inválido "${t.expediente}" en ${p.fecha}`);
  }
  check(p.fecha >= prevProx, "agenda: próximas fuera de orden ascendente");
  prevProx = p.fecha;
}

check(Array.isArray(agenda.recientes), "agenda: recientes no es array");
let prevRec = "9999-12-31";
for (const r of agenda.recientes) {
  soloClaves(r, ["fecha", "titulo", "estado", "idSesion", "votacionIds", "curaduria", "fuenteU"], `agenda.recientes ${r.fecha}`);
  check(ISO_D.test(r.fecha || ""), `agenda: reciente con fecha inválida: ${r.fecha}`);
  check(r.fecha <= corteAgenda, `agenda: reciente en el futuro: ${r.fecha}`);
  check(r.fecha >= addDaysIso(corteAgenda, -90), `agenda: reciente demasiado vieja: ${r.fecha}`);
  check(["efectuada", "no_efectuada", "fracasada"].includes(r.estado), `agenda: reciente con estado inválido "${r.estado}"`);
  if (r.votacionIds != null) {
    check(r.estado === "efectuada", `agenda: votacionIds en sesión no efectuada: ${r.fecha}`);
    for (const vid of r.votacionIds) check(vids.has(vid), `agenda: votacionId inexistente: ${vid}`);
  }
  if (r.curaduria != null) {
    check(r.curaduria === "pendiente", `agenda: curaduria inválida "${r.curaduria}"`);
    check(r.estado === "efectuada", `agenda: curaduria pendiente en sesión no efectuada: ${r.fecha}`);
  }
  check(HTTPS.test(r.fuenteU || ""), `agenda: reciente sin fuenteU https: ${r.fecha}`);
  check(r.fecha <= prevRec, "agenda: recientes fuera de orden descendente");
  prevRec = r.fecha;
}

check(Array.isArray(agenda.comisiones), "agenda: comisiones no es array");
for (const c of agenda.comisiones) {
  soloClaves(c, ["fecha", "hora", "comision", "lugar", "temas", "citacionU"], `agenda.comisiones ${c.fecha}`);
  check(ISO_D.test(c.fecha || ""), `agenda: comisión con fecha inválida: ${c.fecha}`);
  check(c.fecha >= corteAgenda, `agenda: reunión de comisión en el pasado: ${c.fecha}`);
  if (c.hora != null) check(/^\d{1,2}:\d{2}$/.test(c.hora), `agenda: hora inválida "${c.hora}"`);
  check(typeof c.comision === "string" && c.comision.length > 3, `agenda: comisión sin nombre: ${c.fecha}`);
  if (c.citacionU != null) check(HTTPS.test(c.citacionU), `agenda: citacionU inválida: ${c.fecha}`);
}

// public/data y data/seed deben ser idénticos (regla del runbook, igual que los demás datasets)
const seedAgenda = fs.readFileSync(path.join(ROOT, "data", "seed", "agenda.json"), "utf8");
check(seedAgenda === fs.readFileSync(path.join(DATA, "agenda.json"), "utf8"), "agenda: public/data y data/seed difieren");

if (errors.length) {
  console.error(`✗ VALIDACIÓN FALLÓ — ${errors.length} problema(s):`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log(
  `✓ datos válidos: ${dip.diputados.length} diputados, ${dip.bloques.length} bloques, ${vot.votaciones.length} votaciones, ${ctx.movimientos.length} movimientos, agenda ${agenda.proximas.length}/${agenda.recientes.length}/${agenda.comisiones.length} (próximas/recientes/comisiones)`
);
