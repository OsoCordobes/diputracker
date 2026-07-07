// ETL de votaciones — vigilante de nuevas actas y del dataset nominal.
//
// Principio: este script NUNCA inventa datos. Las posiciones de bloque de cada votación
// son contenido curado con fuentes citadas; lo que se automatiza es la DETECCIÓN:
//  1. ¿Aparecieron actas nuevas en votaciones.hcdn.gob.ar posteriores a la última cargada?
//     → se registran en data/pendientes.json para curaduría (con link al acta).
//  2. ¿El dataset `votaciones_nominales` de datos.hcdn.gob.ar ya cubre el período dic-2025+?
//     → se registra en el log: es el disparador para pasar del índice provisional al nominal.
import fs from "node:fs";
import path from "node:path";
import { appendLog, DATA, fetchJson, fetchText, readJson, ROOT } from "./etl-lib.mjs";

const PENDIENTES = path.join(ROOT, "data", "pendientes.json");

const vot = readJson(path.join(DATA, "votaciones.json"));
const lastLoaded = vot.votaciones.map((v) => v.fecha).sort().at(-1);

const result = { script: "etl-votaciones", nuevasActas: 0, nominalDisponible: false, errores: [] };

// ---- 1. actas nuevas en la plataforma de votaciones ----
try {
  // La plataforma expone las votaciones por año en HTML; buscamos filas con fechas
  // posteriores a la última votación cargada.
  const year = new Date().getFullYear();
  const html = await fetchText(`https://votaciones.hcdn.gob.ar/votaciones/${year}`);
  // fechas en formato dd/mm/yyyy dentro de la tabla de actas
  const fechas = [...html.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)]
    .map((m) => `${m[3]}-${m[2]}-${m[1]}`)
    .filter((f) => f > lastLoaded);
  const unicas = [...new Set(fechas)].sort();
  if (unicas.length) {
    let pend = [];
    try {
      pend = readJson(PENDIENTES);
    } catch {
      /* primera corrida */
    }
    const conocidas = new Set(pend.map((p) => p.fecha));
    for (const f of unicas) {
      if (!conocidas.has(f)) {
        pend.push({
          fecha: f,
          detectado: new Date().toISOString(),
          fuente: `https://votaciones.hcdn.gob.ar/votaciones/${year}`,
          estado: "pendiente de curaduría",
          nota: "Sesión con votaciones posteriores al último corte. Revisar actas y cargar posiciones documentadas con fuentes.",
        });
      }
    }
    fs.mkdirSync(path.dirname(PENDIENTES), { recursive: true });
    fs.writeFileSync(PENDIENTES, JSON.stringify(pend, null, 1));
    result.nuevasActas = unicas.length;
  }
} catch (e) {
  result.errores.push("votaciones.hcdn.gob.ar: " + e.message);
}

// ---- 2. dataset nominal en datos abiertos (CKAN) ----
try {
  const pkg = await fetchJson(
    "https://datos.hcdn.gob.ar/api/3/action/package_show?id=" + encodeURIComponent("votaciones-nominales")
  ).catch(async () => {
    // nombre alternativo del dataset
    const list = await fetchJson("https://datos.hcdn.gob.ar/api/3/action/package_list");
    const name = (list.result || []).find((n) => /votacion/i.test(n));
    if (!name) throw new Error("dataset de votaciones no encontrado en CKAN");
    return fetchJson("https://datos.hcdn.gob.ar/api/3/action/package_show?id=" + name);
  });
  const resources = pkg?.result?.resources || [];
  const covers2026 = resources.some(
    (r) => /202[56]/.test(r.name || "") || /202[56]/.test(r.description || "") || (r.last_modified || "") >= "2025-12-10"
  );
  result.nominalDisponible = covers2026;
  result.nominalRecursos = resources.length;
} catch (e) {
  result.errores.push("datos.hcdn.gob.ar: " + e.message);
}

appendLog(result);
console.log(JSON.stringify(result, null, 2));
// Los errores de red de fuentes externas no rompen la corrida (quedan en el log);
// la validación de invariantes corre después e impide cualquier commit inválido.
