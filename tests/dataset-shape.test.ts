// Guarda de forma del dataset: mantiene honesto al diccionario de datos (docs/DATASET.md).
// Si la estructura real de los JSON deja de coincidir con lo documentado, este test falla
// y obliga a actualizar el diccionario — un dato abierto mal documentado no es reutilizable.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const DATA = path.join(__dirname, "..", "public", "data");
const dip = JSON.parse(fs.readFileSync(path.join(DATA, "diputados.json"), "utf8"));
const vot = JSON.parse(fs.readFileSync(path.join(DATA, "votaciones.json"), "utf8"));
const ctx = JSON.parse(fs.readFileSync(path.join(DATA, "contexto.json"), "utf8"));

const keys = (o: object) => Object.keys(o).sort();

test("diputados.json: forma documentada", () => {
  assert.deepEqual(keys(dip), ["bloques", "diputados", "meta"]);
  assert.deepEqual(keys(dip.bloques[0]), ["chip", "corto", "k", "nombre", "pres"]);
  // los campos requeridos de cada banca
  for (const d of dip.diputados) {
    for (const req of ["id", "a", "d", "b", "m", "f"]) assert.ok(req in d, `falta ${req} en ${d.a}`);
    for (const k of Object.keys(d)) assert.ok(["id", "a", "d", "b", "m", "f", "r", "i"].includes(k), `campo no documentado: ${k}`);
    assert.match(d.f, /^([A-Za-z0-9_]+|silueta)$/);
  }
});

test("votaciones.json: forma documentada y dominios de valores", () => {
  const POS = new Set(["AF", "NEG", "ABS", "DIV", null]);
  const EXC = new Set(["AF", "NEG", "ABS", "AUS"]);
  for (const v of vot.votaciones) {
    assert.deepEqual(keys(v), ["abs", "af", "corto", "excepciones", "fecha", "fuentes", "gov", "govLabel", "id", "lineas", "neg", "notas", "resultado", "sesion", "titulo"]);
    assert.ok(["aprobada", "rechazada"].includes(v.resultado), `resultado inválido: ${v.id}`);
    assert.ok(["AF", "NEG"].includes(v.gov), `gov inválido: ${v.id}`);
    assert.equal(Object.keys(v.lineas).length, 20, `lineas no cubre 20 bloques: ${v.id}`);
    for (const l of Object.values(v.lineas)) assert.ok(POS.has(l as string | null), `posición inválida en ${v.id}: ${l}`);
    for (const e of v.excepciones) {
      assert.deepEqual(keys(e), ["a", "nota", "v"]);
      assert.ok(EXC.has(e.v), `excepción v inválida en ${v.id}: ${e.v}`);
    }
    for (const f of v.fuentes) assert.deepEqual(keys(f), ["n", "u"]);
    assert.ok(257 - v.af - v.neg - v.abs >= 0, `sin voto negativo: ${v.id}`);
  }
});

test("contexto.json: forma documentada", () => {
  assert.deepEqual(keys(ctx), ["autoridades", "ddjj", "dieta", "fuentesGenerales", "interbloques", "movimientos"]);
  for (const req of ["monto", "extra", "neto", "fecha", "fuente", "u", "nota"]) assert.ok(req in ctx.dieta, `dieta sin ${req}`);
  for (const ib of ctx.interbloques.lista) assert.deepEqual(keys(ib), ["bloques", "chip", "nombre", "pres"]);
  for (const m of ctx.movimientos) {
    for (const k of Object.keys(m)) assert.ok(["fecha", "a", "from", "to", "alta", "delta", "nota", "fuente"].includes(k), `movimiento con campo no documentado: ${k}`);
  }
});

test("integridad referencial entre datasets", () => {
  const blocKeys = new Set(dip.bloques.map((b: { k: string }) => b.k));
  const names = new Set(dip.diputados.map((d: { a: string }) => d.a));
  for (const d of dip.diputados) assert.ok(blocKeys.has(d.b), `bloque inexistente: ${d.a} → ${d.b}`);
  for (const v of vot.votaciones) {
    for (const k of Object.keys(v.lineas)) assert.ok(blocKeys.has(k), `lineas con bloque inexistente: ${v.id} → ${k}`);
    for (const e of v.excepciones) assert.ok(names.has(e.a), `excepción con diputado inexistente: ${v.id} → ${e.a}`);
  }
  for (const ib of ctx.interbloques.lista) for (const k of ib.bloques) assert.ok(blocKeys.has(k), `interbloque con bloque inexistente: ${ib.nombre} → ${k}`);
  for (const m of ctx.movimientos) if (m.a) assert.ok(names.has(m.a), `movimiento con diputado inexistente: ${m.a}`);
});
