# Runbook de mantenimiento — DipuTracker

Guía operativa para mantener DipuTracker con el tiempo. Pensada para que **cualquiera**
—no solo quien lo creó— pueda curar datos nuevos y operar el proyecto sin romper nada.

La regla de oro es una sola: **solo datos reales, con fuente. Ante la duda, no se carga.**
La credibilidad de una herramienta cívica se destruye con un solo dato inventado.

---

## 0. Puesta en marcha local

```bash
npm install
npm run dev          # http://localhost:3000
npm run validate     # valida invariantes de los datos
npm test             # 26 tests unitarios (motor + ETL + forma de datos)
npm run e2e          # 5 tests E2E (que la app renderiza) — requiere: npx playwright install chromium
```

Antes de commitear datos, **siempre**: `npm run validate && npm test`.

---

## 1. Cargar una votación nueva (el caso más común)

Cuando la Cámara vota algo nuevo, el ETL lo detecta y lo deja en `data/pendientes.json`
(ver §3). Curarla es un trabajo **manual y documentado** — nunca automático.

### Paso a paso

1. **Reunir fuentes.** Buscá el resultado en: el acta oficial
   ([votaciones.hcdn.gob.ar](https://votaciones.hcdn.gob.ar) cuando esté disponible), la
   nota de prensa de la HCDN, y al menos **dos medios independientes** con el desglose por
   bloque (Parlamentario, Infobae, Ámbito, La Nación, Chequeado suelen publicar el
   "uno por uno"). Nunca cargues con una sola fuente.

2. **Agregar el objeto** al array `votaciones` en **`public/data/votaciones.json`**
   _y_ en **`data/seed/votaciones.json`** (deben quedar idénticos), en orden cronológico.
   Plantilla (basada en una votación real):

   ```jsonc
   {
     "id": "slug-corto-unico",                 // p. ej. "reforma-laboral-2"
     "corto": "Título breve para tarjetas",
     "titulo": "Título completo del asunto votado",
     "fecha": "2026-08-15",                     // ISO, fecha de la VOTACIÓN (no de la sesión si difieren)
     "sesion": "Ordinarias — sesión especial",
     "resultado": "aprobada",                   // "aprobada" | "rechazada"
     "af": 140, "neg": 98, "abs": 4,            // totales del acta; sin voto = 257 - af - neg - abs
     "gov": "AF",                               // "AF" o "NEG": qué posición = acompañar al gobierno
     "govLabel": "Afirmativo = acompaña al gobierno",
     "lineas": {                                // posición documentada de CADA uno de los 20 bloques
       "LLA": "AF", "UXP": "NEG", "PU": "DIV", "PRO": "AF", "IF": "AF",
       "UCR": "AF", "EC": "NEG", "IND": "AF", "CC": null, "EF": "NEG",
       "MID": "AF", "POFIT": "NEG", "PYT": "AF", "PTSFIT": "NEG", "ABA": null,
       "COH": null, "DC": "NEG", "LN": null, "PSC": null, "PSL": null
     },
     "excepciones": [                           // votos/ausencias individuales que rompen la línea
       { "a": "Apellido, Nombre", "v": "AF", "nota": "Contexto y, si hay, cita. Debe existir en la nómina." }
     ],
     "notas": ["Contexto editorial, aritmética, quién habló."],
     "fuentes": [{ "n": "Nombre del medio", "u": "https://url-que-carga-200" }]
   }
   ```

3. **Códigos de posición** (ver [DATASET.md](DATASET.md) para el detalle):
   - `lineas`: `"AF"` / `"NEG"` / `"ABS"` computan; `"DIV"` (bloque dividido) y `null`
     (sin línea documentada) **no computan**.
   - `excepciones[].v`: además de `AF/NEG/ABS`, existe `"AUS"` (ausencia con lectura
     política; no computa). Una excepción **pisa** la línea de bloque.
   - **Si no sabés cómo votó un bloque, poné `null`.** No lo adivines. `null` es honesto;
     un dato inventado no.

4. **Actualizar el corte**: poné `meta.consultado` de `votaciones.json` en la fecha de hoy (ISO).

5. **Validar y testear**:
   ```bash
   npm run validate    # chequea totales, referencias, fuentes https, orden cronológico…
   npm test            # los tests de forma y de integridad referencial deben pasar
   ```
   Si `validate` falla, **arreglá el dato, no el validador**. El validador es la red de seguridad.

6. **Actualizar los tests de anclaje** si corresponde. `tests/compute.test.ts` fija índices
   de casos borde (Grabois, Matzkin, etc.); con una votación nueva esos valores cambian.
   Recalculá a mano desde las fuentes y actualizá los pins (el test es doble verificación
   del motor, no al revés).

7. **Quitar la fecha de `data/pendientes.json`** una vez curada.

8. **Commit y push.** Vercel redeploya solo; el índice se recalcula en el cliente.

---

## 2. Casos menos frecuentes

### Bloque o distrito nuevo
Si el ETL de nómina aborta con `"bloques nuevos no mapeados"`, es porque apareció un bloque
que no está en el catálogo. Hay que **curarlo a mano**: agregar el objeto a `bloques[]` en
`diputados.json` y `data/seed/diputados.json` con `k` (clave), `nombre`, `corto`, `chip`
(color hex) y `pres` (presidente). Luego, si el nombre oficial difiere, agregar el alias en
`scripts/etl-nomina-parse.mjs` (`blocAliases` o `distritoCanon`). Los aliases del FIT/MID ya
están de ejemplo.

### Diputado que cambia de bloque, asume o deja la banca
Lo maneja el **ETL de nómina automáticamente**: detecta el cambio contra el listado oficial
vivo, actualiza la nómina y registra el movimiento en `contexto.movimientos` citando la fuente.
No requiere acción manual.

---

## 3. Cómo funciona la actualización automática

`.github/workflows/data-refresh.yml` corre **2×/día**:

1. `scripts/etl-nomina.mjs` — sincroniza la nómina contra
   [diputados.gov.ar](https://www.diputados.gov.ar/diputados/) (257 filas, con chequeo
   cruzado de conteos por bloque). Aborta sin tocar nada si algo no cierra.
2. `scripts/etl-votaciones.mjs` — detecta sesiones nuevas contra el **listado oficial vivo**
   (`diputados.gov.ar/sesiones`, con tolerancia ±1 día porque el listado usa fecha de inicio
   de sesión y el voto cae en la madrugada). Las que no están cubiertas → `data/pendientes.json`.
3. `scripts/etl-agenda.mjs` — sincroniza `agenda.json`: sesiones **CITADAS a futuro** y
   desenlaces recientes del mismo listado, links al temario del **Plan de Labor**
   (`/secparl/dclp/plan_de_labor/plt.html`) y reuniones de la **agenda de comisiones**
   (`/comisiones/agenda/`). Si un parser detecta que el HTML cambió de forma, LANZA y no
   escribe (los datos previos quedan; el error va al log).
4. `scripts/validate-data.mjs` — valida invariantes (incluida la agenda: una "citada" con
   fecha pasada es ilegal, el array vacío es VÁLIDO). **Si falla, no se commitea nada.**
5. Commit + push solo si hubo cambios → Vercel redeploya.

### Curar los temas del Plan de Labor (agenda)

Cuando aparece una **sesión citada**, el ETL publica fecha, título y (si existe) el link al
temario oficial. El contenido del temario es un documento embebido **no parseable**: los
`temas[]` se curan a mano, igual que las votaciones — título textual del documento oficial,
`expediente`/`estadoTramite` solo si la fuente los publica, y **siempre** con `fuentes[]`.
Editar `public/data/agenda.json` **y** `data/seed/agenda.json` (idénticos), correr
`npm run validate && npm test`, commitear. El ETL preserva los temas curados mientras la
sesión siga citada; al pasar la fecha, el propio listado dicta la transición
(efectuada / no efectuada / fracasada) y la curaduría sigue por `pendientes.json`.

**Señal operativa**: si `data/etl-log.json` acumula errores de `etl-agenda` en varias
corridas seguidas ("forma desconocida…"), el HTML oficial cambió → recapturar el fixture
(`tests/fixtures/plan-de-labor-hcdn.html` / `agenda-comisiones-hcdn.html` /
`sesiones-hcdn.html`) y ajustar el parser en `scripts/etl-agenda-parse.mjs` con sus tests.

### Si una fuente muere
El ETL está diseñado para degradar con gracia: prueba fuentes en orden (primaria viva,
espejos, host histórico) y registra cuál respondió en `data/etl-log.json`. Si **todas**
fallan, la corrida no rompe el workflow (el sitio sigue sirviendo los datos válidos
existentes) y queda el error en el log. Revisá `data/etl-log.json` para diagnosticar.

---

## 4. El gran pendiente: índice provisional → nominal

Hoy el índice es **provisional a nivel bloque** (cada banca hereda la línea de su bloque,
con las disidencias individuales documentadas por encima). El upgrade a **voto nominal
individual** —el santo grial— requiere:

- El acta nominal de cada votación desde [votaciones.hcdn.gob.ar](https://votaciones.hcdn.gob.ar)
  (hoy caído por mantenimiento) **o** el dataset `votaciones_nominales` de
  [datos.hcdn.gob.ar](https://datos.hcdn.gob.ar) (hoy corta en el período 137, ~2020).

El ETL vigila ambas fuentes 2×/día (campo `nominalDisponible` en `data/etl-log.json`).
Cuando estén disponibles, el trabajo es: cargar el voto individual de cada banca (en vez de
la línea de bloque), lo que convierte el índice de provisional en definitivo y habilita las
funciones que el diseño ya contempla (mapa de posiciones, cohesión de Rice, asistencia por
banca, histórico por gobierno). El motor (`lib/compute.ts`) ya soporta excepciones
individuales; cargar el nominal completo es cargarlas todas.

---

## 5. Checklist antes de cualquier commit de datos

- [ ] Cada cifra tiene su fuente citada, y las URLs cargan (https, 200).
- [ ] `public/data/*.json` y `data/seed/*.json` quedaron idénticos.
- [ ] `npm run validate` pasa.
- [ ] `npm test` pasa (actualicé los pins de anclaje si cambió el set de votaciones).
- [ ] Ante cualquier dato que no pude confirmar con dos fuentes: lo dejé en `null`, no lo inventé.
