// normalizeAgenda es la frontera de tolerancia entre el deploy de UI y el de datos:
// cualquier entrada (404 → null, JSON basura, secciones ausentes, fechas vencidas)
// debe producir una AgendaData válida sin lanzar jamás.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { normalizeAgenda, AGENDA_VACIA } from "../lib/agenda";

const HOY = "2026-07-08";

test("null / undefined / basura → agenda vacía, nunca crash", () => {
  assert.deepEqual(normalizeAgenda(null, HOY), AGENDA_VACIA);
  assert.deepEqual(normalizeAgenda(undefined, HOY), AGENDA_VACIA);
  assert.deepEqual(normalizeAgenda("html de un 404" as never, HOY), AGENDA_VACIA);
  assert.deepEqual(normalizeAgenda(42 as never, HOY), AGENDA_VACIA);
  assert.deepEqual(normalizeAgenda({} as never, HOY).proximas, []);
  assert.deepEqual(normalizeAgenda({ proximas: "no-array" } as never, HOY).proximas, []);
});

test("una 'próxima' con fecha vencida se excluye aunque el ETL no haya podado", () => {
  const raw = {
    meta: { consultado: "2026-07-08T01:00:00Z" },
    proximas: [
      { fecha: "2026-07-01", titulo: "Vencida", estado: "citada", idSesion: 1, fuenteU: "https://x.gob.ar", temas: [] },
      { fecha: "2026-07-16", titulo: "Futura", estado: "citada", idSesion: 2, fuenteU: "https://x.gob.ar", temas: [] },
    ],
  };
  const a = normalizeAgenda(raw as never, HOY);
  assert.equal(a.proximas.length, 1);
  assert.equal(a.proximas[0].idSesion, 2);
});

test("items sin fuente https o sin fecha válida se descartan", () => {
  const raw = {
    proximas: [
      { fecha: "2026-07-16", titulo: "Sin fuente", estado: "citada", idSesion: 1, fuenteU: "http://inseguro", temas: [] },
      { fecha: "16/07/2026", titulo: "Fecha no ISO", estado: "citada", idSesion: 2, fuenteU: "https://x.gob.ar", temas: [] },
    ],
    recientes: [{ fecha: "2026-06-24", titulo: "OK", estado: "efectuada", idSesion: 3, fuenteU: "https://x.gob.ar" }],
    comisiones: [{ fecha: "2026-07-14", comision: "X" }], // nombre demasiado corto
  };
  const a = normalizeAgenda(raw as never, HOY);
  assert.equal(a.proximas.length, 0);
  assert.equal(a.recientes.length, 1);
  assert.equal(a.comisiones.length, 0);
});

test("el agenda.json real del repo normaliza sin pérdidas", () => {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "data", "agenda.json"), "utf8"));
  const a = normalizeAgenda(raw, HOY);
  assert.equal(a.recientes.length, raw.recientes.length);
  assert.equal(a.comisiones.length, raw.comisiones.length);
  assert.ok(a.consultado, "meta.consultado presente");
  assert.equal(a.fuentes.length, 3);
});

test("ordena: próximas asc, recientes desc, comisiones por fecha+hora", () => {
  const raw = {
    proximas: [
      { fecha: "2026-08-01", titulo: "B", estado: "citada", idSesion: 2, fuenteU: "https://x.gob.ar", temas: [] },
      { fecha: "2026-07-16", titulo: "A", estado: "citada", idSesion: 1, fuenteU: "https://x.gob.ar", temas: [] },
    ],
    recientes: [
      { fecha: "2026-05-20", titulo: "vieja", estado: "no_efectuada", idSesion: 3, fuenteU: "https://x.gob.ar" },
      { fecha: "2026-06-24", titulo: "nueva", estado: "efectuada", idSesion: 4, fuenteU: "https://x.gob.ar" },
    ],
  };
  const a = normalizeAgenda(raw as never, HOY);
  assert.deepEqual(a.proximas.map((p) => p.idSesion), [1, 2]);
  assert.deepEqual(a.recientes.map((r) => r.idSesion), [4, 3]);
});
