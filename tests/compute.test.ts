// Tests de regresión del motor del índice.
// Los valores pinneados provienen de la auditoría numérica independiente del 2026-07-07
// (reimplementación desde la metodología publicada: 0 divergencias en 257 bancas × 3 períodos).
// Si un refactor cambia cualquiera de estos números, este suite lo hace explícito.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  applyPeriod,
  banzhaf,
  displayName,
  fdate,
  initials,
  layout,
  processData,
  ramp,
  voteView,
} from "../lib/compute";
import type { CtxFile, DipFile, VotFile } from "../lib/types";

const DATA = path.join(__dirname, "..", "public", "data");
const dip = JSON.parse(fs.readFileSync(path.join(DATA, "diputados.json"), "utf8")) as DipFile;
const vot = JSON.parse(fs.readFileSync(path.join(DATA, "votaciones.json"), "utf8")) as VotFile;
const ctx = JSON.parse(fs.readFileSync(path.join(DATA, "contexto.json"), "utf8")) as CtxFile;

const D = processData(dip, vot, ctx);

// Medias de la Cámara pinneadas del motor (los anclajes individuales de abajo,
// derivados a mano desde las fuentes, son la verificación independiente).
const MEDIA_TODO = 56;
const MEDIA_ORD = 59;
const byName = (a: string) => {
  const d = D.deps.find((x) => x.a === a);
  assert.ok(d, `diputado no encontrado: ${a}`);
  return d!;
};

test("layout: 257 bancas → 257 posiciones y marcadores de mayoría", () => {
  const g = layout(257);
  assert.equal(g.slots.length, 257);
  assert.ok(Number.isFinite(g.m129.x1) && Number.isFinite(g.m172.x2));
  // los slots están ordenados de izquierda (ángulo mayor) a derecha
  for (let i = 1; i < g.slots.length; i++) assert.ok(g.slots[i].a <= g.slots[i - 1].a);
});

test("banzhaf: los porcentajes de poder suman 100 y el tamaño manda entre iguales", () => {
  const real = D.bloques.map((b) => ({ k: b.k, size: D.deps.filter((d) => d.b === b.k).length }));
  const power = banzhaf(real, 129);
  const total = power.reduce((a, p) => a + p.power, 0);
  assert.ok(Math.abs(total - 100) < 1e-9, `poder total = ${total}`);
  // bloques del mismo tamaño → mismo poder
  const bySize = new Map<number, number[]>();
  power.forEach((p) => bySize.set(p.size, [...(bySize.get(p.size) || []), p.power]));
  for (const [size, powers] of bySize) {
    for (const pw of powers) assert.ok(Math.abs(pw - powers[0]) < 1e-9, `poder desigual entre bloques de ${size}`);
  }
  // LLA (el bloque más grande) tiene el mayor poder
  const max = power.reduce((a, p) => (p.power > a.power ? p : a));
  assert.equal(max.k, "LLA");
});

test("ramp: extremos y centro de la escala", () => {
  assert.equal(ramp(0), "rgb(15,118,110)"); // #0F766E oposición firme
  assert.equal(ramp(1), "rgb(180,83,9)"); // #B45309 oficialismo
  assert.equal(ramp(0.5), "rgb(231,229,228)"); // #E7E5E4 centro
});

test("helpers de presentación", () => {
  assert.equal(displayName("Menem, Martín"), "Martín Menem");
  assert.equal(initials("Benegas Lynch, Bertie"), "BL");
  assert.equal(fdate("2026-05-20"), "20 may 2026");
  assert.equal(voteView("AF").label, "Afirmativo");
  assert.equal(voteView(null, "div").label, "Bloque dividido");
  assert.equal(voteView(null, "pre").label, "No era diputado");
});

test("dataset: composición base", () => {
  assert.equal(D.deps.length, 257);
  assert.equal(D.bloques.length, 20);
  assert.equal(D.votaciones.length, 11);
  for (const d of D.deps) {
    assert.ok(d.indice === null || (d.indice >= 0 && d.indice <= 100), `índice fuera de rango: ${d.a}`);
    assert.equal(d.votes.length, D.votaciones.length);
  }
});

test("período completo (11 votaciones): partida doble contra aritmética manual", () => {
  applyPeriod(D, "todo");
  assert.equal(byName("Grabois, Juan").indice, 0); // 0/11: UxP NEG en todas las computables
  assert.equal(byName("Grabois, Juan").counted, 11);
  assert.equal(byName("Bornoroni, Gabriel").indice, 100); // LLA 11/11
  assert.equal(byName("Andino, Cristian").indice, 18); // 2/11: disidencias AF en mercosur y glaciares
  // 1/10 = 10: mercosur-ue es DIV para UxP y Chica no tiene registro ahí (no computa);
  // su única disidencia AF es glaciares.
  assert.equal(byName("Chica, Jorge").indice, 10);
  const schiaretti = byName("Schiaretti, Juan");
  assert.equal(schiaretti.counted, 4); // penal, mercosur, laboral + holdouts (PU=AF); rigi es DIV
  assert.equal(schiaretti.indice, 75); // 3/4
  const matzkin = byName("Matzkin, Martín");
  assert.equal(matzkin.counted, 2); // juró el 24-jun al inicio de la sesión: computan rigi y holdouts
  assert.equal(matzkin.indice, 100); // línea LLA en ambas
  assert.equal(byName("Zago, Oscar").indice, 86); // 6/7: AUS no computa, ABS sí; MID AF en las dos de junio
  assert.equal(byName("Falcone, Eduardo").indice, 86);
  assert.equal(byName("Schneider, Darío").indice, 83); // 5/6 con abstención en la general
  assert.equal(byName("Lousteau, Martín").indice, 43); // 3/7: NEG documentado en el rigi pisa el DIV de PU

  const conIndice = D.deps.filter((d) => d.indice != null);
  assert.equal(conIndice.length, 257); // con junio, todas las bancas computan al menos una
  const media = Math.round(conIndice.reduce((a, d) => a + (d.indice as number), 0) / conIndice.length);
  assert.equal(media, MEDIA_TODO);
  assert.equal(D.deps.filter((d) => d.hasExc).length, 19); // 15 + Lousteau, Juliano, Arrieta, Capozzi
});

test("períodos parciales: medias y registros", () => {
  applyPeriod(D, "ext");
  const ext = D.deps.filter((d) => d.indice != null);
  assert.equal(Math.round(ext.reduce((a, d) => a + (d.indice as number), 0) / ext.length), 56); // sin cambios: junio es ordinarias
  assert.equal(D.deps.filter((d) => d.hasExc).length, 14);

  applyPeriod(D, "ord");
  const ord = D.deps.filter((d) => d.indice != null);
  assert.equal(Math.round(ord.reduce((a, d) => a + (d.indice as number), 0) / ord.length), MEDIA_ORD);
  assert.equal(D.deps.filter((d) => d.hasExc).length, 9); // 5 de glaciares + 4 del rigi

  applyPeriod(D, "todo"); // restaurar
});

test("las excepciones pisan la línea de bloque", () => {
  applyPeriod(D, "todo");
  const iGlaciares = D.votaciones.findIndex((v) => v.id === "glaciares-reforma");
  const andino = byName("Andino, Cristian");
  assert.equal(andino.votes[iGlaciares].v, "AF");
  assert.equal(andino.votes[iGlaciares].src, "exc");
  // el resto de UxP no computa glaciares... no: UXP=NEG es línea, sí computa
  const kirchner = byName("Kirchner, Máximo Carlos");
  assert.equal(kirchner.votes[iGlaciares].v, "NEG");
  assert.equal(kirchner.votes[iGlaciares].src, "linea");
  // PU=DIV: no computa para sus miembros sin excepción
  const scaglia = byName("Scaglia, Gisela");
  assert.equal(scaglia.votes[iGlaciares].v, null);
  assert.equal(scaglia.votes[iGlaciares].src, "div");
});
