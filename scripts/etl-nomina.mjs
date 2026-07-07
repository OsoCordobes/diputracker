// ETL de nómina — sincroniza diputados/bloques/interbloques con las fuentes oficiales HCDN.
//
// Fuente primaria: la nómina HTML oficial (server-side, sin JS) que incluye foto, distrito,
// bloque, mandato y fechas de inicio/fin de cada banca:
//   https://www.diputados.gov.ar/diputados/
// Chequeo cruzado: conteos por bloque de https://www.hcdn.gob.ar/diputados/diputados-por-bloque.html
//
// Principios: nunca se inventa nada; si la fuente no cierra (no hay 257 filas, bloque
// desconocido sin resolución, etc.) el script ABORTA sin tocar los datos y deja registro.
// Los cambios de bloque y las altas/bajas se registran en ctx.movimientos citando la fuente.
import fs from "node:fs";
import path from "node:path";
import { appendLog, DATA, decodeEntities, fetchText, readJson, ROOT, todayIso, writeJsonCompact } from "./etl-lib.mjs";

const NOMINA_URL = "https://www.diputados.gov.ar/diputados/";
const BLOQUES_URL = "https://www.hcdn.gob.ar/diputados/diputados-por-bloque.html";
const FOTOS_BASE = "https://parlamentaria.hcdn.gob.ar/image/";
const FOTOS_SUFIJO = "_small.png";

const DIP_FILE = path.join(DATA, "diputados.json");
const CTX_FILE = path.join(DATA, "contexto.json");
const SEED_DIR = path.join(ROOT, "data", "seed");

// Distritos canónicos (forma de presentación usada por el dataset)
const DISTRITOS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];
const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
const distritoCanon = new Map(DISTRITOS.map((d) => [norm(d), d]));
// alias oficiales que difieren de la forma canónica
distritoCanon.set("CIUDAD AUTONOMA DE BUENOS AIRES", "CABA");
distritoCanon.set("CIUDAD DE BUENOS AIRES", "CABA");
distritoCanon.set("C.A.B.A.", "CABA");
distritoCanon.set("CAPITAL FEDERAL", "CABA");
distritoCanon.set("TIERRA DEL FUEGO, ANTARTIDA E ISLAS DEL ATLANTICO SUR", "Tierra del Fuego");

function isoFromDdMmYyyy(s) {
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// ---------- parseo de la nómina oficial ----------
function parseNomina(html) {
  const rows = [];
  // cada fila: <tr> ... <img src="https://parlamentaria.hcdn.gob.ar/image/<id>_small.png" ...>
  //            <a href="/diputados/<slug>/">Apellido, Nombre</a> ... columnas de texto
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = trRe.exec(html))) {
    const tr = m[1];
    const nameM = tr.match(/<a[^>]*href="\/diputados\/[^"]*"[^>]*>([^<]+)<\/a>/);
    if (!nameM) continue; // header u otras filas
    const a = decodeEntities(nameM[1]);
    const fotoM = tr.match(/parlamentaria\.hcdn\.gob\.ar\/image\/([A-Za-z0-9_]+)_small\.png/);
    const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((t) =>
      decodeEntities(t[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
    );
    // columnas: [foto, diputado, distrito, bloque, mandato, inicia, finaliza, nacimiento]
    if (tds.length < 7) continue;
    const distritoRaw = tds[2] ?? "";
    const bloqueRaw = tds[3] ?? "";
    const mandato = (tds[4] || "").match(/\d{4}-\d{4}/)?.[0] ?? null;
    const inicia = isoFromDdMmYyyy(tds[5] || "");
    rows.push({
      a,
      distritoRaw,
      bloqueRaw,
      mandato,
      inicia,
      foto: fotoM ? fotoM[1] : "silueta",
    });
  }
  return rows;
}

function parseBloqueCounts(html) {
  // acordeones: <button ...>NOMBRE DEL BLOQUE <algo> (N)</button> — el conteo aparece junto al nombre
  const counts = new Map();
  const re = /accordion[^>]*>[\s\S]*?<button[^>]*>([\s\S]*?)<\/button>/g;
  let m;
  while ((m = re.exec(html))) {
    const txt = decodeEntities(m[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    const cm = txt.match(/^(.*?)[\s(]+(\d+)\)?\s*$/);
    if (cm) counts.set(norm(cm[1]), parseInt(cm[2], 10));
  }
  return counts;
}

// ---------- main ----------
const run = { script: "etl-nomina", cambios: [], errores: [], aborted: false };

try {
  const dip = readJson(DIP_FILE);
  const ctx = readJson(CTX_FILE);
  const html = await fetchText(NOMINA_URL);
  const rows = parseNomina(html);

  if (rows.length !== 257) {
    throw new Error(`la nómina oficial devolvió ${rows.length} filas (se esperaban 257) — no se modifica nada`);
  }

  // mapa de bloques por nombre normalizado
  const blocByName = new Map(dip.bloques.map((b) => [norm(b.nombre), b.k]));
  // alias: el listado usa "UCR - UNIÓN CÍVICA RADICAL" o "UNIÓN CÍVICA RADICAL" según la página
  for (const b of dip.bloques) {
    const parts = b.nombre.split(" - ");
    for (const p of parts) blocByName.set(norm(p), b.k);
  }
  // alias oficiales con el nombre expandido del frente
  blocByName.set(norm("PTS-FRENTE DE IZQUIERDA Y DE TRABAJADORES UNIDAD"), "PTSFIT");
  blocByName.set(norm("PARTIDO OBRERO EN EL FRENTE DE IZQUIERDA Y DE TRABAJADORES-UNIDAD"), "POFIT");
  blocByName.set(norm("MOVIMIENTO DE INTEGRACION Y DESARROLLO"), "MID");

  const unknownBlocs = new Set();
  const parsed = rows.map((r) => {
    const d = distritoCanon.get(norm(r.distritoRaw));
    const b = blocByName.get(norm(r.bloqueRaw));
    if (!d) throw new Error(`distrito no reconocido: "${r.distritoRaw}" (${r.a})`);
    if (!b) unknownBlocs.add(r.bloqueRaw);
    return { ...r, d, b };
  });

  if (unknownBlocs.size) {
    // Un bloque nuevo es un hecho real que hay que incorporar, pero exige curaduría
    // (color, nombre corto, presidencia). Se registra y se aborta sin inventar nada.
    throw new Error(
      `bloques nuevos no mapeados: ${[...unknownBlocs].join(" | ")} — requiere curaduría (agregar a bloques[] con corto/chip/presidencia)`
    );
  }

  const today = todayIso();
  // Matching insensible a tildes/mayúsculas: el listado oficial a veces omite acentos
  // ("Barbara" por "Bárbara"). El nombre acentuado del dataset se conserva.
  const byName = new Map(dip.diputados.map((d) => [norm(d.a), d]));
  const seen = new Set();
  let maxId = Math.max(...dip.diputados.map((d) => d.id));
  const periodStart = (mandato) => (mandato ? `${mandato.slice(0, 4)}-12-10` : null);

  for (const r of parsed) {
    const cur = byName.get(norm(r.a));
    seen.add(norm(r.a));
    if (!cur) {
      // ALTA de banca
      const nuevo = {
        id: ++maxId,
        a: r.a,
        d: r.d,
        b: r.b,
        m: r.mandato || "",
        f: r.foto,
      };
      if (r.inicia && periodStart(r.mandato) && r.inicia > periodStart(r.mandato)) nuevo.i = r.inicia;
      dip.diputados.push(nuevo);
      ctx.movimientos.push({
        fecha: today,
        a: r.a,
        to: r.b,
        alta: true,
        nota: `Alta de banca por ${r.d} (${dip.bloques.find((b) => b.k === r.b).nombre}); sin votaciones registradas en este set.`,
        fuente: `HCDN, nómina oficial (${today})`,
      });
      run.cambios.push(`ALTA: ${r.a} (${r.b}, ${r.d})`);
      continue;
    }
    // cambio de bloque
    if (cur.b !== r.b) {
      const fromB = dip.bloques.find((b) => b.k === cur.b)?.nombre || cur.b;
      const toB = dip.bloques.find((b) => b.k === r.b)?.nombre || r.b;
      ctx.movimientos.push({
        fecha: today,
        a: r.a,
        from: cur.b,
        to: r.b,
        nota: `Pasó de ${fromB} a ${toB}, según el listado oficial de la HCDN.`,
        fuente: `HCDN, nómina oficial (${today})`,
      });
      run.cambios.push(`BLOQUE: ${r.a} ${cur.b} → ${r.b}`);
      cur.b = r.b;
    }
    // actualizaciones silenciosas de campos oficiales (foto, mandato, distrito, inicia)
    if (r.foto !== "silueta" && cur.f !== r.foto) {
      if (cur.f === "silueta") run.cambios.push(`FOTO nueva: ${r.a}`);
      cur.f = r.foto;
    }
    if (r.mandato && cur.m !== r.mandato) {
      run.cambios.push(`MANDATO: ${r.a} ${cur.m} → ${r.mandato}`);
      cur.m = r.mandato;
    }
    if (r.d !== cur.d) {
      run.cambios.push(`DISTRITO: ${r.a} ${cur.d} → ${r.d}`);
      cur.d = r.d;
    }
    const ps = periodStart(r.mandato);
    if (r.inicia && ps && r.inicia > ps && cur.i !== r.inicia) {
      run.cambios.push(`INICIA: ${r.a} ${cur.i || "—"} → ${r.inicia}`);
      cur.i = r.inicia;
    }
  }

  // BAJAS
  const bajas = dip.diputados.filter((d) => !seen.has(norm(d.a)));
  for (const d of bajas) {
    ctx.movimientos.push({
      fecha: today,
      a: d.a,
      from: d.b,
      nota: `Dejó de figurar en la nómina oficial (baja de la banca por ${d.d}).`,
      fuente: `HCDN, nómina oficial (${today})`,
    });
    run.cambios.push(`BAJA: ${d.a} (${d.b}, ${d.d})`);
  }
  dip.diputados = dip.diputados.filter((d) => seen.has(norm(d.a)));

  // chequeo cruzado contra el listado por bloque
  try {
    const bloquesHtml = await fetchText(BLOQUES_URL);
    const counts = parseBloqueCounts(bloquesHtml);
    for (const b of dip.bloques) {
      const oficial = counts.get(norm(b.nombre)) ?? counts.get(norm(b.nombre.split(" - ").pop()));
      const local = dip.diputados.filter((d) => d.b === b.k).length;
      if (oficial != null && oficial !== local) {
        run.errores.push(`conteo ${b.k}: oficial=${oficial} local=${local}`);
      }
    }
  } catch (e) {
    run.errores.push("chequeo por bloque no disponible: " + e.message);
  }
  if (run.errores.some((e) => e.startsWith("conteo "))) {
    throw new Error("los conteos por bloque no cierran contra el listado oficial — no se modifica nada: " + run.errores.join("; "));
  }

  if (run.cambios.length) {
    dip.meta.consultado = today;
    dip.meta.fotosBase = FOTOS_BASE;
    dip.meta.fotosSufijo = FOTOS_SUFIJO;
    writeJsonCompact(DIP_FILE, dip);
    writeJsonCompact(CTX_FILE, ctx);
    writeJsonCompact(path.join(SEED_DIR, "diputados.json"), dip);
    writeJsonCompact(path.join(SEED_DIR, "contexto.json"), ctx);
    console.log(`✓ nómina actualizada — ${run.cambios.length} cambio(s):`);
    run.cambios.forEach((c) => console.log("  · " + c));
  } else {
    console.log("✓ nómina sin cambios respecto de la fuente oficial");
  }
} catch (e) {
  run.aborted = true;
  run.errores.push(e.message);
  console.error("✗ etl-nomina abortó sin modificar datos: " + e.message);
}

appendLog(run);
// El fallo del ETL no debe romper el workflow (el sitio sigue sirviendo los datos validados
// existentes); la validación posterior garantiza que nada inválido se commitee.
process.exit(0);
