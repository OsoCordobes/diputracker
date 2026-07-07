// ETL de votaciones — vigilante de nuevas sesiones y del dataset nominal.
//
// Principio: este script NUNCA inventa datos. Las posiciones de bloque de cada votación
// son contenido curado con fuentes citadas; lo que se automatiza es la DETECCIÓN:
//  1. ¿Hubo sesiones posteriores al último voto cargado que aún no están en el dataset?
//     → se registran en data/pendientes.json para curaduría.
//  2. ¿El dataset `votaciones_nominales` de datos.hcdn.gob.ar ya cubre el período dic-2025+?
//     → se registra en el log: es el disparador para pasar del índice provisional al nominal.
import fs from "node:fs";
import path from "node:path";
import { appendLog, DATA, fetchJson, fetchText, readJson, ROOT, todayIso } from "./etl-lib.mjs";
import { parseSesiones, uncoveredSessions } from "./etl-votaciones-parse.mjs";

const PENDIENTES = path.join(ROOT, "data", "pendientes.json");

const vot = readJson(path.join(DATA, "votaciones.json"));
const loadedDates = vot.votaciones.map((v) => v.fecha).sort();
const lastLoaded = loadedDates.at(-1);

const result = { script: "etl-votaciones", nuevasSesiones: 0, nominalDisponible: false, errores: [] };

// ---- 1. sesiones nuevas según el listado oficial de la HCDN ----
// Fuente primaria: el listado oficial de sesiones (vivo y autoritativo). La plataforma
// votaciones.hcdn.gob.ar sufre caídas prolongadas, así que se usa como respaldo.
try {
  const SOURCES = [
    "https://www.diputados.gov.ar/sesiones/",
    "https://www.hcdn.gob.ar/sesiones/",
    `https://votaciones.hcdn.gob.ar/votaciones/${new Date().getFullYear()}`,
  ];
  let html = null;
  for (const url of SOURCES) {
    try {
      html = await fetchText(url, { retries: 2, timeoutMs: 45000 });
      result.fuenteSesiones = url;
      break;
    } catch (e) {
      result.errores.push(url + ": " + e.message);
    }
  }
  if (html == null) throw new Error("ninguna fuente de sesiones respondió");

  // Sesiones no cubiertas: posteriores al último voto y sin una votación cargada a ±1 día
  // (el listado usa la fecha de inicio de sesión; el voto suele caer en la madrugada siguiente).
  const nuevas = uncoveredSessions(parseSesiones(html), loadedDates, { after: lastLoaded, until: todayIso() });

  if (nuevas.length) {
    let pend = [];
    try {
      pend = readJson(PENDIENTES);
    } catch {
      /* primera corrida */
    }
    const conocidas = new Set(pend.map((p) => p.fecha));
    for (const f of nuevas) {
      if (!conocidas.has(f)) {
        pend.push({
          fecha: f,
          detectado: todayIso(),
          fuente: result.fuenteSesiones,
          estado: "pendiente de curaduría",
          nota: "Sesión posterior al último voto cargado. Verificar si tuvo votaciones nominales y, de haberlas, cargar las posiciones documentadas con fuentes.",
        });
      }
    }
    fs.mkdirSync(path.dirname(PENDIENTES), { recursive: true });
    fs.writeFileSync(PENDIENTES, JSON.stringify(pend, null, 1));
    result.nuevasSesiones = nuevas.length;
    result.fechasNuevas = nuevas;
  }
} catch (e) {
  result.errores.push("listado de sesiones: " + e.message);
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
