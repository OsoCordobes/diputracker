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

if (errors.length) {
  console.error(`✗ VALIDACIÓN FALLÓ — ${errors.length} problema(s):`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log(
  `✓ datos válidos: ${dip.diputados.length} diputados, ${dip.bloques.length} bloques, ${vot.votaciones.length} votaciones, ${ctx.movimientos.length} movimientos`
);
