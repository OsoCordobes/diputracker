// Tests de la detección de sesiones nuevas del ETL de votaciones, contra un fixture real
// del listado oficial de sesiones de la HCDN (tests/fixtures/sesiones-hcdn.html, 2026-07-07).
// Verifica que el ETL, usando la fuente viva, detecta correctamente qué sesiones ya están
// cubiertas y cuáles quedan pendientes de curaduría — sin depender del host caído.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseSesiones, uncoveredSessions } from "../scripts/etl-votaciones-parse.mjs";

const HTML = fs.readFileSync(path.join(__dirname, "fixtures", "sesiones-hcdn.html"), "utf8");
const sesiones = parseSesiones(HTML);

// fechas de voto realmente cargadas en el dataset
const vot = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "data", "votaciones.json"), "utf8"));
const loadedDates: string[] = [...new Set(vot.votaciones.map((v: { fecha: string }) => v.fecha))].sort() as string[];

test("parseSesiones extrae fechas ISO ordenadas y únicas", () => {
  assert.ok(sesiones.length > 100, "el archivo histórico tiene muchas sesiones");
  assert.deepEqual(sesiones, [...sesiones].sort(), "ordenadas");
  assert.equal(sesiones.length, new Set(sesiones).size, "únicas");
  for (const s of sesiones) assert.match(s, /^\d{4}-\d{2}-\d{2}$/);
});

test("el listado contiene las sesiones reales del período actual", () => {
  // fechas de inicio de sesión conocidas del período (una antes de cada voto de madrugada)
  for (const f of ["2026-02-12", "2026-04-08", "2026-05-20", "2026-06-23", "2026-06-24"]) {
    assert.ok(sesiones.includes(f), `falta la sesión ${f} en el listado`);
  }
});

test("con los datos al 24-jun, NO hay sesiones nuevas sin cubrir hasta el 7-jul", () => {
  const nuevas = uncoveredSessions(sesiones, loadedDates, { after: "2026-06-24", until: "2026-07-07" });
  assert.deepEqual(nuevas, [], "no debería detectar nada nuevo: " + nuevas.join(", "));
});

test("la sesión fallida del 23-jun no se flaggea (cubierta por el voto del 24 a ±1 día)", () => {
  // simulando un dataset que solo llega hasta el 20-may, el 23 y 24-jun deben aparecer;
  // con el dataset real (que llega al 24-jun) el 23-jun queda cubierto por tolerancia.
  const hasta20may = loadedDates.filter((d) => d <= "2026-05-20");
  const nuevasDesde20may = uncoveredSessions(sesiones, hasta20may, { after: "2026-05-20", until: "2026-07-07" });
  assert.ok(nuevasDesde20may.includes("2026-06-24"), "debería detectar la sesión del 24-jun");
  // 23-jun está a 1 día del 24: si el 24 estuviera cargado no se flaggearía; acá no está, así que puede aparecer
  const nuevasReal = uncoveredSessions(sesiones, loadedDates, { after: "2026-06-22", until: "2026-07-07" });
  assert.ok(!nuevasReal.includes("2026-06-23"), "el 23-jun queda cubierto por el voto del 24 (±1 día)");
});

test("detecta una sesión hipotética futura no cargada", () => {
  const conFutura = parseSesiones(HTML + " 02/07/2026 ");
  const nuevas = uncoveredSessions(conFutura, loadedDates, { after: "2026-06-24", until: "2026-07-07" });
  assert.deepEqual(nuevas, ["2026-07-02"], "debería flaggear una sesión del 2-jul no cargada");
});

test("las fechas futuras (posteriores a 'until') se ignoran", () => {
  // el listado incluye una fecha preparatoria de 2027; nunca debe flaggearse hoy
  const nuevas = uncoveredSessions(sesiones, loadedDates, { after: "2026-06-24", until: "2026-07-07" });
  assert.ok(!nuevas.some((n) => n >= "2027-01-01"), "no debe flaggear fechas de 2027");
});
