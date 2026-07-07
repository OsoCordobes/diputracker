// Funciones puras para detectar sesiones nuevas desde el listado oficial de la HCDN
// (https://www.diputados.gov.ar/sesiones/). Fuente viva y autoritativa, usada como
// primaria porque votaciones.hcdn.gob.ar sufre caídas prolongadas.
//
// Ojo con el desfase de un día: el listado usa la fecha de INICIO de la sesión
// (p. ej. 23-jun) mientras que la votación suele caer en la madrugada del día
// siguiente (24-jun). Por eso la cobertura se compara con tolerancia de ±1 día.

// Extrae todas las fechas de sesión (ISO, únicas, ordenadas) del HTML del listado.
/**
 * @param {string} html
 * @returns {string[]}
 */
export function parseSesiones(html) {
  const fechas = [...html.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)].map((m) => `${m[3]}-${m[2]}-${m[1]}`);
  return [...new Set(fechas)].sort();
}

function diffDays(a, b) {
  const da = Date.parse(a + "T00:00:00Z");
  const db = Date.parse(b + "T00:00:00Z");
  return Math.abs(Math.round((da - db) / 86400000));
}

// Sesiones del listado que NO están cubiertas por ninguna votación cargada, dentro de la
// ventana (after, until]. "cubierta" = hay una votación cargada a ±toleranceDays de la sesión.
// Devuelve las fechas de sesión candidatas a curaduría (ISO, ordenadas).
/**
 * @param {string[]} sessionDates
 * @param {string[]} loadedDates
 * @param {{ after?: string, until?: string, toleranceDays?: number }} [opts]
 * @returns {string[]}
 */
export function uncoveredSessions(sessionDates, loadedDates, { after, until, toleranceDays = 1 } = {}) {
  return sessionDates
    .filter((s) => (!after || s > after) && (!until || s <= until))
    .filter((s) => !loadedDates.some((l) => diffDays(s, l) <= toleranceDays))
    .sort();
}
