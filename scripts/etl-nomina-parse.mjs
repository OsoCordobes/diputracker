// Funciones puras del parser de la nómina oficial de la HCDN.
// Extraídas de etl-nomina.mjs para que puedan testearse contra un fixture HTML sin
// disparar el pipeline de escritura. No tienen efectos secundarios ni tocan la red.
import { decodeEntities } from "./etl-lib.mjs";

// Distritos canónicos (forma de presentación usada por el dataset)
export const DISTRITOS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

// Normaliza para comparar: sin tildes, mayúsculas, espacios colapsados.
export const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim();

export const distritoCanon = new Map(DISTRITOS.map((d) => [norm(d), d]));
// alias oficiales que difieren de la forma canónica
distritoCanon.set("CIUDAD AUTONOMA DE BUENOS AIRES", "CABA");
distritoCanon.set("CIUDAD DE BUENOS AIRES", "CABA");
distritoCanon.set("C.A.B.A.", "CABA");
distritoCanon.set("CAPITAL FEDERAL", "CABA");
distritoCanon.set("TIERRA DEL FUEGO, ANTARTIDA E ISLAS DEL ATLANTICO SUR", "Tierra del Fuego");

export function isoFromDdMmYyyy(s) {
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// ---------- parseo de la nómina oficial ----------
export function parseNomina(html) {
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

export function parseBloqueCounts(html) {
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

// Alias oficiales de bloques con nombre expandido (frentes de izquierda, MID).
export function blocAliases(blocByName) {
  blocByName.set(norm("PTS-FRENTE DE IZQUIERDA Y DE TRABAJADORES UNIDAD"), "PTSFIT");
  blocByName.set(norm("PARTIDO OBRERO EN EL FRENTE DE IZQUIERDA Y DE TRABAJADORES-UNIDAD"), "POFIT");
  blocByName.set(norm("MOVIMIENTO DE INTEGRACION Y DESARROLLO"), "MID");
  return blocByName;
}
