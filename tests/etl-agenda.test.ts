// Tests del ETL de agenda parlamentaria, contra fixtures reales congelados:
//  - tests/fixtures/sesiones-hcdn.html         (listado de sesiones, 2026-07-07)
//  - tests/fixtures/plan-de-labor-hcdn.html    (Plan de Labor, 2026-07-08)
//  - tests/fixtures/agenda-comisiones-hcdn.html (agenda de comisiones, 2026-07-08)
// Sin red y sin reloj: si el HTML oficial cambia de forma, los parsers LANZAN y el
// ETL no escribe nada — CI sigue verde y el error queda en data/etl-log.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  parseSesionesDetalladas,
  parsePlanDeLabor,
  parseAgendaComisiones,
  fechaCastellanoIso,
  construirProximas,
  construirRecientes,
} from "../scripts/etl-agenda-parse.mjs";

const fixture = (f: string) => fs.readFileSync(path.join(__dirname, "fixtures", f), "utf8");
const SESIONES = fixture("sesiones-hcdn.html");
const PLAN = fixture("plan-de-labor-hcdn.html");
const COMISIONES = fixture("agenda-comisiones-hcdn.html");

// ---------- parseSesionesDetalladas ----------

const detalladas = parseSesionesDetalladas(SESIONES);

test("extrae sesiones con id, fecha ISO y estado desde los anchors", () => {
  assert.ok(detalladas.length > 100, "el listado histórico tiene muchas sesiones");
  for (const s of detalladas) {
    assert.match(String(s.idSesion), /^\d+$/);
    assert.match(s.fecha, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(["citada", "efectuada", "no_efectuada", "fracasada"].includes(s.estado));
  }
});

test("clasifica los estados reales conocidos del fixture", () => {
  const porId = new Map(detalladas.map((s) => [s.idSesion, s]));
  // 24/06 efectuada (5° Reunión)
  assert.equal(porId.get(3583)?.estado, "efectuada");
  assert.equal(porId.get(3583)?.fecha, "2026-06-24");
  // 20/05 CITADA - NO EFECTUADA
  assert.equal(porId.get(3581)?.estado, "no_efectuada");
  assert.equal(porId.get(3581)?.fecha, "2026-05-20");
  // 15/10/2025 CITADA - FRACASADA (dos reuniones)
  assert.equal(porId.get(3570)?.estado, "fracasada");
  assert.equal(porId.get(3569)?.estado, "fracasada");
});

test("NO extrae la fecha del header 'PERIODO 144 (01/03/2026 - 28/02/2027)'", () => {
  // la razón de anclar a <a href="sesion.html?id=…">: el texto plano contiene fechas
  // que no son sesiones y en ventana futura serían sesiones fantasma
  assert.ok(!detalladas.some((s) => s.fecha === "2027-02-28"), "extrajo la fecha del header PERIODO");
});

test("una citación futura sintética se clasifica como 'citada'", () => {
  const conFutura =
    SESIONES +
    '<a href="sesion.html?id=9999&numVid=0&reunion=null&periodo=144" target=_blank> Sesión Ordinaria Especial CITADA - (16/07/2026)</a>';
  const s = parseSesionesDetalladas(conFutura).find((x) => x.idSesion === 9999);
  assert.deepEqual(s, { fecha: "2026-07-16", titulo: "Sesión Ordinaria Especial CITADA", estado: "citada", idSesion: 9999 });
});

test("HTML no trivial sin anchors de sesión → lanza (forma cambió), nunca datos parciales", () => {
  assert.throws(() => parseSesionesDetalladas("<html><body>" + "relleno ".repeat(500) + "</body></html>"));
});

// ---------- parsePlanDeLabor ----------

const plan = parsePlanDeLabor(PLAN);

test("extrae links absolutos al temario oficial por idSesion", () => {
  assert.ok(plan.length > 10, "el Plan de Labor lista muchas sesiones");
  const s3583 = plan.find((p) => p.idSesion === 3583);
  assert.ok(s3583, "falta la sesión 3583 en el Plan de Labor");
  assert.equal(s3583!.temarioU, "https://www.diputados.gov.ar/secparl/dclp/procesar.html?id_sesion=3583&tipo=temario");
  assert.equal(s3583!.fecha, "2026-06-24");
});

test("Plan de Labor con forma desconocida → lanza", () => {
  assert.throws(() => parsePlanDeLabor("<html><body>" + "relleno ".repeat(500) + "</body></html>"));
});

// ---------- parseAgendaComisiones ----------

test("fechaCastellanoIso convierte fechas del formato oficial", () => {
  assert.equal(fechaCastellanoIso("martes 14 de julio del 2026"), "2026-07-14");
  assert.equal(fechaCastellanoIso("lunes 3 de agosto de 2026"), "2026-08-03");
  assert.equal(fechaCastellanoIso("sin fecha acá"), null);
});

const reuniones = parseAgendaComisiones(COMISIONES);

test("extrae las reuniones reales del fixture con campos verbatim", () => {
  assert.equal(reuniones.length, 2);
  const [r1, r2] = reuniones;
  assert.equal(r1.fecha, "2026-07-14");
  assert.equal(r1.hora, "11:00");
  assert.match(r1.comision, /BICAMERAL PERMANENTE DE SEGUIMIENTO Y CONTROL DEL MINISTERIO PUBLICO/);
  assert.match(r1.lugar || "", /Sala 6/);
  assert.match(r1.temas || "", /Procurador general/);
  assert.match(r1.citacionU || "", /^https:\/\/parlamentaria\.hcdn\.gob\.ar\/.+\.pdf$/);
  assert.equal(r2.hora, "16:00");
  assert.match(r2.comision, /INTELIGENCIA/);
});

test("página válida sin tabla de reuniones → [] (vacío honesto de receso)", () => {
  const vacia = '<html><head><title>Agenda Parlamentaria</title></head><body>' + "relleno ".repeat(300) + "</body></html>";
  assert.deepEqual(parseAgendaComisiones(vacia), []);
});

test("HTML basura sin marcadores de página → lanza", () => {
  assert.throws(() => parseAgendaComisiones("<html><body>" + "hola ".repeat(500) + "</body></html>"));
});

// ---------- ciclo de vida próximas / recientes ----------

const FUENTE = "https://www.diputados.gov.ar/sesiones/";
const HOY = "2026-07-08";

test("construirProximas: solo citadas futuras en ventana, con temario y curaduría preservada", () => {
  const sesiones = [
    { fecha: "2026-07-16", titulo: "Sesión Especial", estado: "citada", idSesion: 9001 },
    { fecha: "2026-10-01", titulo: "Muy lejana", estado: "citada", idSesion: 9002 }, // fuera de ventana 60d
    { fecha: "2026-07-01", titulo: "Citada vencida sin desenlace", estado: "citada", idSesion: 9003 }, // pasada
    { fecha: "2026-06-24", titulo: "Efectuada", estado: "efectuada", idSesion: 3583 },
  ];
  const previas = [
    { idSesion: 9001, temas: [{ titulo: "Presupuesto 2027", fuentes: [{ n: "HCDN", u: "https://x" }] }] },
  ];
  const plan = [{ idSesion: 9001, temarioU: "https://www.diputados.gov.ar/secparl/dclp/procesar.html?id_sesion=9001&tipo=temario" }];
  const prox = construirProximas(sesiones as any, { hoy: HOY, ventanaDias: 60, fuenteU: FUENTE, planDeLabor: plan as any, previas });
  assert.equal(prox.length, 1);
  assert.equal(prox[0].idSesion, 9001);
  assert.equal(prox[0].estado, "citada");
  assert.ok(prox[0].temarioU!.includes("id_sesion=9001"));
  assert.equal(prox[0].temas[0].titulo, "Presupuesto 2027", "el ETL jamás borra temas curados");
});

test("construirRecientes: desenlaces confirmados, cruce de votaciones exacto primero y +1 día después", () => {
  const sesiones = [
    { fecha: "2026-06-24", titulo: "5° Reunión", estado: "efectuada", idSesion: 3583 },
    { fecha: "2026-06-23", titulo: "4° Reunión - Expresiones en Minoría", estado: "efectuada", idSesion: 3582 },
    { fecha: "2026-05-20", titulo: "Sesión CITADA - NO EFECTUADA", estado: "no_efectuada", idSesion: 3581 },
    { fecha: "2026-07-01", titulo: "Citada vencida", estado: "citada", idSesion: 9003 }, // sin desenlace: no entra
    { fecha: "2026-01-01", titulo: "Vieja", estado: "efectuada", idSesion: 100 }, // > 60 días: no entra
  ];
  const votaciones = [
    { id: "super-rigi", fecha: "2026-06-24" },
    { id: "holdouts-conciliacion", fecha: "2026-06-24" },
  ];
  const rec = construirRecientes(sesiones as any, { hoy: HOY, dias: 60, fuenteU: FUENTE, votaciones, pendientesFechas: [] });
  assert.deepEqual(rec.map((r) => r.idSesion), [3583, 3582, 3581], "orden descendente por fecha, solo desenlaces en ventana");
  // el 24-jun (match exacto) reclama ambas votaciones; el 23-jun NO se las roba por +1 día
  assert.deepEqual(rec[0].votacionIds, ["super-rigi", "holdouts-conciliacion"]);
  assert.equal(rec[1].votacionIds, undefined);
  assert.equal(rec[2].estado, "no_efectuada");
  assert.equal(rec[2].votacionIds, undefined, "sin quórum no hay votaciones");
});

test("construirRecientes: sesión efectuada sin votación y en pendientes.json → curaduria pendiente", () => {
  const sesiones = [{ fecha: "2026-07-02", titulo: "Sesión nueva", estado: "efectuada", idSesion: 9100 }];
  const rec = construirRecientes(sesiones as any, { hoy: HOY, dias: 60, fuenteU: FUENTE, votaciones: [], pendientesFechas: ["2026-07-02"] });
  assert.equal(rec[0].curaduria, "pendiente");
});
