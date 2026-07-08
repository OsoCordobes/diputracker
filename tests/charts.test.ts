// Tests de la preparación de datos de los gráficos v5 (lib/charts.ts) contra los
// datos REALES del repo: si el dataset cambia de forma, esto avisa antes que la UI.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { prepStrip, prepDumbbell, prepTiles, colorRatio, STRIP_CARRILES } from "../lib/charts";
import { TILE_POS, TILE_COLS, TILE_ROWS } from "../lib/tilemap-ar";
import { processData } from "../lib/compute";
import type { CtxFile, DipFile, VotFile } from "../lib/types";

const DATA = path.join(__dirname, "..", "public", "data");
const leer = (f: string) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const D = processData(leer("diputados.json") as DipFile, leer("votaciones.json") as VotFile, leer("contexto.json") as CtxFile);

test("tilemap: exactamente los 24 distritos oficiales, sin colisiones de celda", () => {
  assert.equal(Object.keys(TILE_POS).length, 24);
  const celdas = new Set(Object.values(TILE_POS).map((p) => p.col + "," + p.row));
  assert.equal(celdas.size, 24, "dos distritos comparten celda");
  for (const p of Object.values(TILE_POS)) {
    assert.ok(p.col >= 0 && p.col < TILE_COLS && p.row >= 0 && p.row < TILE_ROWS);
  }
});

test("prepTiles: cubre las 257 bancas y no inventa promedios", () => {
  const tiles = prepTiles(D.deps);
  assert.equal(tiles.length, 24);
  assert.equal(tiles.reduce((a, t) => a + t.bancas, 0), 257);
  for (const t of tiles) {
    assert.ok(t.bancas > 0, `distrito sin bancas: ${t.distrito} (¿nombre desalineado con diputados.json?)`);
    if (t.prom != null) {
      assert.ok(t.computables > 0, "promedio sin computables");
      assert.ok(t.prom >= 0 && t.prom <= 100);
    }
  }
});

test("prepStrip: bancas con índice + sinIndice suman el total; apilado determinístico", () => {
  const s = prepStrip(D.deps);
  assert.equal(s.dots.length + s.sinIndice, 257);
  assert.ok(s.dots.length > 200, "la mayoría de las bancas tienen índice");
  for (const dot of s.dots) {
    assert.ok(dot.carril >= 0 && dot.carril < STRIP_CARRILES);
    assert.ok(dot.carrilBloc >= 0 && dot.carrilBloc < 3);
    assert.ok(Math.abs(dot.spread) <= 20 && Math.abs(dot.spreadBloc) <= 40, "spread acotado");
    assert.ok(dot.indice >= 0 && dot.indice <= 100);
  }
  // determinismo: dos corridas idénticas producen exactamente lo mismo
  assert.deepEqual(prepStrip(D.deps), s);
  // sin colisiones exactas dentro de un mismo índice: (carril, spread) únicos por grupo
  const porIndice = new Map<number, Set<string>>();
  for (const dot of s.dots) {
    const set = porIndice.get(dot.indice) || new Set();
    const pos = dot.carril + "|" + dot.spread;
    assert.ok(!set.has(pos), `colisión exacta en índice ${dot.indice}: ${pos}`);
    set.add(pos);
    porIndice.set(dot.indice, set);
  }
  assert.equal(s.medianas.length, 4, "marca la mediana de los 4 bloques grandes");
  for (const b of s.bloques) assert.ok(b.n >= 3, "small multiples solo con 3+ bancas");
  const medianas = s.bloques.map((b) => b.mediana);
  assert.deepEqual(medianas, [...medianas].sort((a, b) => b - a), "bloques ordenados por mediana desc");
});

test("prepStrip con filtro de bloque y distrito", () => {
  const lla = prepStrip(D.deps, { bloc: "LLA" });
  assert.ok(lla.dots.length > 0 && lla.dots.every((d) => d.blocShort === D.blocMap["LLA"].corto));
  const cba = prepStrip(D.deps, { dist: "Córdoba" });
  assert.ok(cba.dots.length > 0 && cba.dots.every((d) => d.distrito === "Córdoba"));
});

test("prepDumbbell: 20 bloques ordenados por ratio, colores por umbral existente", () => {
  const rows = prepDumbbell(D.power.list, D.blocMap);
  assert.equal(rows.length, D.power.list.length);
  const ratios = rows.map((r) => r.ratio);
  assert.deepEqual(ratios, [...ratios].sort((a, b) => b - a));
  for (const r of rows) {
    assert.equal(r.color, colorRatio(r.ratio));
    assert.ok(r.powerPct >= 0 && r.seatPct > 0);
  }
  assert.equal(colorRatio(1.2), "#B45309");
  assert.equal(colorRatio(0.8), "#0F766E");
  assert.equal(colorRatio(1.0), "#78736A");
});
