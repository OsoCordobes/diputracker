// Red de seguridad del ETL de nómina, que corre 2×/día sin supervisión.
// Testea el parser puro contra un fixture HTML REAL de la nómina oficial de la HCDN
// (tests/fixtures/nomina-hcdn.html, capturado el 2026-07-07). Si HCDN cambia la
// estructura de su tabla, estos tests fallan y avisan antes de que el pipeline
// procese datos corruptos en silencio.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseNomina, norm, distritoCanon, isoFromDdMmYyyy, blocAliases } from "../scripts/etl-nomina-parse.mjs";

interface Row {
  a: string;
  distritoRaw: string;
  bloqueRaw: string;
  mandato: string | null;
  inicia: string | null;
  foto: string;
}

const HTML = fs.readFileSync(path.join(__dirname, "fixtures", "nomina-hcdn.html"), "utf8");
const rows: Row[] = parseNomina(HTML);

// bloques del dataset (para verificar que cada bloque de la nómina se resuelve)
const dip = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "public", "data", "diputados.json"), "utf8")
);

test("parseNomina extrae exactamente 257 bancas del HTML oficial", () => {
  assert.equal(rows.length, 257);
});

test("cada fila tiene nombre 'Apellido, Nombre', distrito, bloque y mandato válidos", () => {
  for (const r of rows) {
    assert.ok(r.a.includes(","), `nombre sin coma: "${r.a}"`);
    assert.ok(r.distritoRaw.length > 0, `distrito vacío: ${r.a}`);
    assert.ok(r.bloqueRaw.length > 0, `bloque vacío: ${r.a}`);
    assert.ok(r.mandato && /^\d{4}-\d{4}$/.test(r.mandato), `mandato inválido "${r.mandato}": ${r.a}`);
  }
});

test("todos los distritos de la nómina se resuelven a la forma canónica", () => {
  const desconocidos = new Set<string>();
  for (const r of rows) if (!distritoCanon.get(norm(r.distritoRaw))) desconocidos.add(r.distritoRaw);
  assert.deepEqual([...desconocidos], [], "distritos no mapeados: " + [...desconocidos].join(", "));
});

test("todos los bloques de la nómina se resuelven contra el dataset (con alias)", () => {
  const blocByName = new Map<string, string>(dip.bloques.map((b: { nombre: string; k: string }) => [norm(b.nombre), b.k]));
  for (const b of dip.bloques) for (const p of b.nombre.split(" - ")) blocByName.set(norm(p), b.k);
  blocAliases(blocByName);
  const desconocidos = new Set<string>();
  for (const r of rows) if (!blocByName.get(norm(r.bloqueRaw))) desconocidos.add(r.bloqueRaw);
  assert.deepEqual([...desconocidos], [], "bloques no mapeados: " + [...desconocidos].join(", "));
});

test("los ids de foto tienen el formato esperado o son 'silueta'", () => {
  for (const r of rows) {
    assert.ok(r.foto === "silueta" || /^[A-Za-z0-9_]+$/.test(r.foto), `foto inválida "${r.foto}": ${r.a}`);
  }
  // la nómina oficial de hoy trae foto para todas las bancas
  const sinFoto = rows.filter((r) => r.foto === "silueta");
  assert.ok(sinFoto.length <= 3, `demasiadas siluetas (${sinFoto.length}) — ¿cambió el host de fotos?`);
});

test("los conteos por bloque coinciden con la composición del dataset", () => {
  const blocByName = new Map<string, string>(dip.bloques.map((b: { nombre: string; k: string }) => [norm(b.nombre), b.k]));
  for (const b of dip.bloques) for (const p of b.nombre.split(" - ")) blocByName.set(norm(p), b.k);
  blocAliases(blocByName);
  const nominaCount: Record<string, number> = {};
  for (const r of rows) {
    const k = blocByName.get(norm(r.bloqueRaw))!;
    nominaCount[k] = (nominaCount[k] || 0) + 1;
  }
  for (const b of dip.bloques) {
    const dataset = dip.diputados.filter((d: { b: string }) => d.b === b.k).length;
    assert.equal(nominaCount[b.k] || 0, dataset, `conteo ${b.k}: nómina=${nominaCount[b.k] || 0} dataset=${dataset}`);
  }
});

test("isoFromDdMmYyyy convierte fechas y tolera basura", () => {
  assert.equal(isoFromDdMmYyyy("10/12/2023"), "2023-12-10");
  assert.equal(isoFromDdMmYyyy("sin fecha"), null);
  assert.equal(isoFromDdMmYyyy(""), null);
});

test("norm es insensible a tildes y mayúsculas", () => {
  assert.equal(norm("Córdoba"), norm("CORDOBA"));
  assert.equal(norm("Bárbara"), norm("BARBARA"));
  assert.equal(norm("  Tierra   del  Fuego "), "TIERRA DEL FUEGO");
});
