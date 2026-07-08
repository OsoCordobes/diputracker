// Tests del view-model puro del feed (lib/feed.ts): merge cronológico, dedupe,
// filtros, recencia y round-trip de los parámetros del hash.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFeed,
  esNuevo,
  fechaMovIso,
  FEED_DEFAULTS,
  parseFeedParams,
  serializeFeedParams,
  slugDistrito,
} from "../lib/feed";
import type { AgendaData } from "../lib/agenda";
import type { CtxFile, Votacion } from "../lib/types";

const CORTE = "2026-07-08";

const vot = (id: string, fecha: string, lineas: Record<string, unknown> = {}): Votacion =>
  ({ id, corto: id, titulo: id, fecha, sesion: "", resultado: "aprobada", af: 130, neg: 100, abs: 5, gov: "AF", govLabel: "", lineas, excepciones: [], notas: [], fuentes: [{ n: "x", u: "https://x" }] }) as unknown as Votacion;

const ctxCon = (movimientos: unknown[]): CtxFile => ({ movimientos }) as unknown as CtxFile;

const agendaCon = (partes: Partial<AgendaData>): AgendaData => ({
  consultado: "2026-07-08T01:00:00Z",
  fuentes: [],
  proximas: [],
  recientes: [],
  comisiones: [],
  ...partes,
});

const sesionFutura = (fecha: string, idSesion = 1) => ({
  fecha,
  titulo: "Sesión Especial",
  estado: "citada" as const,
  idSesion,
  fuenteU: "https://www.diputados.gov.ar/sesiones/",
  temas: [],
});

test("fechaMovIso parsea los formatos reales de contexto.json", () => {
  assert.equal(fechaMovIso("24 jun 2026"), "2026-06-24");
  assert.equal(fechaMovIso("dic 2025"), "2025-12-01");
  assert.equal(fechaMovIso("dic 2025 → jul 2026"), "2026-07-01", "rango: toma el extremo más reciente");
  assert.equal(fechaMovIso("2026-03-15"), "2026-03-15");
  assert.equal(fechaMovIso("sin fecha"), null);
});

test("esNuevo: dentro de las 96 h previas al corte, nunca en el futuro del corte", () => {
  assert.equal(esNuevo("2026-07-08", CORTE), true);
  assert.equal(esNuevo("2026-07-04", CORTE), true);
  assert.equal(esNuevo("2026-07-03", CORTE), false);
  assert.equal(esNuevo("2026-07-09", CORTE), false, "fecha posterior al corte no es 'nuevo'");
});

test("slugDistrito genera slugs de URL estables", () => {
  assert.equal(slugDistrito("Córdoba"), "cordoba");
  assert.equal(slugDistrito("Santiago del Estero"), "santiago-del-estero");
  assert.equal(slugDistrito("CABA"), "caba");
  assert.equal(slugDistrito("Tierra del Fuego"), "tierra-del-fuego");
});

test("round-trip parse ↔ serialize; defaults → cadena vacía (URL limpia)", () => {
  assert.equal(serializeFeedParams(FEED_DEFAULTS), "");
  const p = { per: "ord" as const, tipos: ["vot", "ses"] as ("vot" | "ses")[], bloc: "LLA", dist: "cordoba" };
  const s = serializeFeedParams(p as never);
  assert.equal(s, "?per=ord&feed=vot%2Cses&bloc=lla&dist=cordoba");
  assert.deepEqual(parseFeedParams(s.slice(1)), p);
});

test("parseFeedParams: valores basura caen al default en silencio (forward-compat)", () => {
  const p = parseFeedParams("per=queseyo&feed=x,y&bloc=<script>&dist=CÓRDOBA!!");
  assert.equal(p.per, "todo");
  assert.deepEqual(p.tipos, ["vot", "ses", "mov"]);
  assert.equal(p.bloc, "SCRIPT", "sanea a alfanumérico mayúscula (validación final contra blocKeys en el consumidor)");
  assert.equal(p.dist, "crdoba");
});

test("buildFeed: futuros ascendentes, pasados descendentes, votaciones primero a igual fecha", () => {
  const D = {
    votaciones: [vot("vieja", "2026-05-20"), vot("nueva", "2026-06-24")],
    ctx: ctxCon([{ fecha: "24 jun 2026", a: "X", to: "LLA", alta: true, nota: "n", fuente: "f" }]),
  };
  const agenda = agendaCon({ proximas: [sesionFutura("2026-08-01", 2), sesionFutura("2026-07-16", 1)] });
  const feed = buildFeed(D, agenda, FEED_DEFAULTS, CORTE);
  assert.deepEqual(feed.futuros.map((f) => f.sesion.idSesion), [1, 2], "próxima más cercana primero");
  assert.equal(feed.pasados[0].kind, "votacion");
  assert.equal((feed.pasados[0] as { vot: Votacion }).vot.id, "nueva");
  assert.equal(feed.pasados[1].kind, "movimiento", "a igual fecha la votación va antes que el movimiento");
});

test("buildFeed dedupe: sesión efectuada con votaciones curadas NO genera item; fracasada y pendiente sí", () => {
  const D = { votaciones: [vot("v1", "2026-06-24")], ctx: ctxCon([]) };
  const agenda = agendaCon({
    recientes: [
      { fecha: "2026-06-24", titulo: "Con votos", estado: "efectuada", idSesion: 1, votacionIds: ["v1"], fuenteU: "https://x" },
      { fecha: "2026-05-20", titulo: "Fracasó", estado: "fracasada", idSesion: 2, fuenteU: "https://x" },
      { fecha: "2026-07-02", titulo: "En curaduría", estado: "efectuada", idSesion: 3, curaduria: "pendiente", fuenteU: "https://x" },
    ],
  });
  const feed = buildFeed(D, agenda, FEED_DEFAULTS, CORTE);
  const sesiones = feed.pasados.filter((i) => i.kind === "sesion-reciente");
  assert.deepEqual(sesiones.map((s) => (s as { sesion: { idSesion: number } }).sesion.idSesion), [3, 2]);
});

test("buildFeed: filtro de período es ventana local (per=ext excluye futuros y ordinarias)", () => {
  const D = { votaciones: [vot("ext1", "2026-02-12"), vot("ord1", "2026-05-20")], ctx: ctxCon([]) };
  const agenda = agendaCon({ proximas: [sesionFutura("2026-07-16")] });
  const ext = buildFeed(D, agenda, { ...FEED_DEFAULTS, per: "ext" }, CORTE);
  assert.equal(ext.futuros.length, 0, "ventana histórica: sin futuros");
  assert.deepEqual(ext.pasados.map((i) => (i as { vot: Votacion }).vot.id), ["ext1"]);
  const ord = buildFeed(D, agenda, { ...FEED_DEFAULTS, per: "ord" }, CORTE);
  assert.equal(ord.futuros.length, 1, "las citadas de julio caen en la ventana ordinaria");
  assert.deepEqual(ord.pasados.map((i) => (i as { vot: Votacion }).vot.id), ["ord1"]);
});

test("buildFeed: filtro de bloque anota votaciones y restringe movimientos", () => {
  const D = {
    votaciones: [vot("v1", "2026-06-24", { LLA: "AF", UXP: "NEG" })],
    ctx: ctxCon([
      { fecha: "24 jun 2026", a: "A", to: "LLA", alta: true, nota: "n", fuente: "f" },
      { fecha: "20 may 2026", a: "B", from: "UXP", to: "PU", nota: "n", fuente: "f" },
    ]),
  };
  const feed = buildFeed(D, agendaCon({}), { ...FEED_DEFAULTS, bloc: "LLA" }, CORTE);
  const v = feed.pasados.find((i) => i.kind === "votacion") as { lineaBloc?: string };
  assert.equal(v.lineaBloc, "AF", "anota la línea del bloque filtrado");
  const movs = feed.pasados.filter((i) => i.kind === "movimiento");
  assert.equal(movs.length, 1, "solo los movimientos que involucran al bloque");
});

test("buildFeed: filtro de tipos excluye clases enteras", () => {
  const D = { votaciones: [vot("v1", "2026-06-24")], ctx: ctxCon([{ fecha: "24 jun 2026", to: "LLA", nota: "n", fuente: "f" }]) };
  const agenda = agendaCon({ proximas: [sesionFutura("2026-07-16")] });
  const solo = buildFeed(D, agenda, { ...FEED_DEFAULTS, tipos: ["vot"] }, CORTE);
  assert.equal(solo.futuros.length, 0);
  assert.ok(solo.pasados.every((i) => i.kind === "votacion"));
});

test("buildFeed con agenda vacía y datos reales del repo no lanza", () => {
  // humo con las formas reales
  const fs = require("node:fs");
  const path = require("node:path");
  const votReal = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "data", "votaciones.json"), "utf8"));
  const ctxReal = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "data", "contexto.json"), "utf8"));
  const feed = buildFeed({ votaciones: votReal.votaciones, ctx: ctxReal }, agendaCon({}), FEED_DEFAULTS, CORTE);
  assert.equal(feed.pasados.filter((i) => i.kind === "votacion").length, votReal.votaciones.length);
  assert.ok(feed.pasados.filter((i) => i.kind === "movimiento").length >= 2);
});
