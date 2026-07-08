# Diccionario de datos — DipuTracker

Este documento describe los datasets abiertos de DipuTracker campo por campo, para que
cualquier persona pueda reutilizarlos con confianza. Los datos provienen de fuentes
oficiales de la HCDN y son de dominio público; se solicita **citar la fuente**.

- **Dónde**: [`public/data/`](../public/data/) en este repo, y servidos en producción como
  API pública (ver [§ Consumir la API](#consumir-la-api)).
- **Formato**: JSON (UTF-8), minificado. La forma es estable; los cambios de estructura
  se anuncian en el historial de git.
- **Actualización**: rutinas automáticas 2×/día contra las fuentes oficiales
  (ver [§ Actualización y trazabilidad](#actualización-y-trazabilidad)).

Índice: [diputados.json](#diputadosjson) · [votaciones.json](#votacionesjson) ·
[contexto.json](#contextojson) · [agenda.json](#agendajson) ·
[Códigos de posición](#códigos-de-posición) ·
[Metodología del índice](#metodología-del-índice-de-alineamiento) ·
[Consumir la API](#consumir-la-api) · [Cómo citar](#cómo-citar)

---

## `diputados.json`

Nómina oficial de las 257 bancas, más el catálogo de bloques.

```jsonc
{
  "meta": {
    "fuente": "HCDN — diputados.gov.ar (Nómina Actual y Diputados por Bloque, listados oficiales)",
    "consultado": "2026-07-07",          // fecha ISO del último corte de la nómina
    "fotosBase": "https://parlamentaria.hcdn.gob.ar/image/",
    "fotosSufijo": "_small.png",
    "nota": "La información del sitio de la HCDN es de dominio público; se solicita citar la fuente."
  },
  "bloques": [ /* … */ ],
  "diputados": [ /* … */ ]
}
```

### `bloques[]` — catálogo de bloques (20)

| Campo    | Tipo   | Descripción                                                        |
|----------|--------|--------------------------------------------------------------------|
| `k`      | string | Clave corta única del bloque (p. ej. `LLA`, `UXP`, `PU`). Se usa como referencia en `diputados[].b` y en `votaciones[].lineas`. |
| `nombre` | string | Nombre oficial completo (p. ej. `"La Libertad Avanza"`).           |
| `corto`  | string | Nombre abreviado para la UI (p. ej. `"UxP"`, `"Prov. Unidas"`).    |
| `chip`   | string | Color identitario del bloque en formato hex (`#RRGGBB`).           |
| `pres`   | string | Presidente/a del bloque, formato `"Apellido, Nombre"`.             |

### `diputados[]` — las 257 bancas

| Campo | Tipo    | Req. | Descripción                                                                 |
|-------|---------|------|-----------------------------------------------------------------------------|
| `id`  | number  | sí   | Identificador **estable** de la banca. Se usa en permalinks (`#/diputado/<id>`). No es necesariamente contiguo: las altas usan `max+1` y las bajas dejan huecos. |
| `a`   | string  | sí   | Nombre, formato `"Apellido, Nombre"` (así lo publica la HCDN).               |
| `d`   | string  | sí   | Distrito (provincia o `CABA`). Una de las 24 jurisdicciones.                 |
| `b`   | string  | sí   | Clave del bloque al que pertenece (referencia a `bloques[].k`).             |
| `m`   | string  | sí   | Mandato, formato `"AAAA-AAAA"` (p. ej. `"2023-2027"`).                       |
| `f`   | string  | sí   | Identificador de la foto oficial, o `"silueta"` si no hay foto. La URL completa es `fotosBase + f + fotosSufijo`. |
| `r`   | string  | no   | Rol/cargo, presente solo si tiene uno (p. ej. `"Presidente de la Cámara"`, `"Presidente de bloque"`). |
| `i`   | string  | no   | Fecha ISO de asunción, presente **solo** si asumió después del inicio del período (banca de reemplazo). Las votaciones anteriores a esta fecha no se le computan. |

---

## `votaciones.json`

Las votaciones del período con su resultado y las posiciones documentadas por bloque.

```jsonc
{
  "meta": {
    "periodo": "Cámara actual — desde el 10-dic-2025 · extraordinarias + ordinarias 2026",
    "nivel": "bloque",                   // el índice es provisional a nivel bloque (ver metodología)
    "nota": "Posiciones mayoritarias de bloque documentadas en actas y prensa parlamentaria…",
    "consultado": "2026-07-07"
  },
  "votaciones": [ /* … */ ]
}
```

### `votaciones[]`

| Campo       | Tipo             | Descripción                                                                 |
|-------------|------------------|-----------------------------------------------------------------------------|
| `id`        | string           | Identificador único de la votación (slug, p. ej. `"mercosur-ue"`). Se usa en permalinks (`#/votacion/<id>`). |
| `corto`     | string           | Título breve para tarjetas y listas.                                        |
| `titulo`    | string           | Título completo del asunto votado.                                          |
| `fecha`     | string           | Fecha ISO de la sesión (`AAAA-MM-DD`).                                       |
| `sesion`    | string           | Tipo de sesión (p. ej. `"Extraordinarias"`, `"Ordinarias — sesión especial"`). |
| `resultado` | enum             | `"aprobada"` o `"rechazada"`.                                               |
| `af`        | number           | Total de votos afirmativos según el acta oficial.                           |
| `neg`       | number           | Total de votos negativos.                                                   |
| `abs`       | number           | Total de abstenciones. (Ausentes/sin voto = `257 − af − neg − abs`.)        |
| `gov`       | enum             | Qué posición representa "acompañar al gobierno" en esta votación: `"AF"` o `"NEG"`. El índice de alineamiento cuenta las coincidencias con este valor. |
| `govLabel`  | string           | Texto legible de lo anterior (p. ej. `"Afirmativo = acompaña al gobierno"`). |
| `lineas`    | object           | Mapa `clave_de_bloque → posición`. Cubre los 20 bloques. Ver [Códigos de posición](#códigos-de-posición). |
| `excepciones` | array          | Registros individuales que se apartan de la línea de bloque (ver abajo).     |
| `notas`     | string[]         | Notas de contexto editorial (aritmética, quién habló, etc.).                |
| `fuentes`   | array            | `[{ "n": nombre, "u": url }]` — fuentes citadas (actas oficiales + prensa). |

### `votaciones[].excepciones[]`

Un voto o ausencia individual **documentado** que se aparta de la línea mayoritaria del
bloque. Se aplica **por encima** de la línea de bloque al computar el índice.

| Campo  | Tipo   | Descripción                                                          |
|--------|--------|----------------------------------------------------------------------|
| `a`    | string | Nombre del diputado (coincide exactamente con `diputados[].a`).       |
| `v`    | enum   | Sentido del voto individual: `"AF"`, `"NEG"`, `"ABS"` o `"AUS"` (ausente). |
| `nota` | string | Descripción con contexto y, cuando corresponde, cita.                |

Ejemplo real:

```json
{ "a": "Schneider, Darío", "v": "ABS",
  "nota": "Abstención que sorprendió al oficialismo: ingresó por la boleta LLA–Frigerio en Entre Ríos." }
```

---

## `contexto.json`

Interbloques, autoridades, dieta, guía de DDJJ, movimientos de bloque y fuentes generales.

| Campo             | Tipo   | Descripción                                                                 |
|-------------------|--------|-----------------------------------------------------------------------------|
| `interbloques`    | object | `{ fuente, lista: [{ nombre, pres, bloques: string[], chip }] }`. `bloques` referencia claves de `bloques[].k`. |
| `autoridades`     | array  | `[{ rol, a }]` — autoridades de la Cámara.                                  |
| `dieta`           | object | `{ monto, extra, neto, fecha, fuente, u, nota }` — la dieta mensual con su fuente. Cifras textuales de la fuente, no estimaciones propias. |
| `ddjj`            | object | `{ nota, u }` — guía para consultar la Declaración Jurada Patrimonial en la Oficina Anticorrupción (no se publican montos). |
| `movimientos`     | array  | Cambios de bloque, altas y bajas (ver abajo).                              |
| `fuentesGenerales`| array  | `[{ n, u }]` — fuentes oficiales de nivel general.                          |

### `contexto.json → movimientos[]`

| Campo   | Tipo    | Descripción                                                              |
|---------|---------|--------------------------------------------------------------------------|
| `fecha` | string  | Fecha del movimiento (libre: ISO o legible, p. ej. `"dic 2025"`).        |
| `a`     | string  | Diputado involucrado (si aplica). Ausente en movimientos agregados.      |
| `from`  | string  | Clave del bloque de origen (en cambios de bloque y bajas).               |
| `to`    | string  | Clave del bloque de destino (en cambios de bloque y altas).              |
| `alta`  | boolean | `true` si es un alta de banca.                                           |
| `delta` | boolean | `true` si es un movimiento agregado (recomposición de varios bloques).   |
| `nota`  | string  | Descripción del movimiento.                                             |
| `fuente`| string  | Fuente citada.                                                          |

---

## `agenda.json`

Agenda parlamentaria: sesiones **citadas a futuro**, desenlaces recientes del listado
oficial y reuniones de comisión próximas. Regla dura del dataset: solo se publica lo que
las fuentes oficiales publican — fecha y estado de citación, link al temario, texto
verbatim de las citaciones. **Nunca predicciones de resultado ni posiciones anticipadas.**

```jsonc
{
  "meta": {
    "nota": "…",
    "ventanaDias": 60,                       // horizonte hacia adelante
    "consultado": "2026-07-08T01:05:20Z",    // última corrida (ISO con hora)
    "fuentes": [ { "n": "…", "u": "https://…", "consultado": "…", "ok": true } ]  // frescura POR FUENTE
  },
  "proximas": [ /* … */ ],     // [] es el estado común y honesto (sin citaciones publicadas)
  "recientes": [ /* … */ ],
  "comisiones": [ /* … */ ]
}
```

### `proximas[]` — sesiones de Cámara citadas a futuro

| Campo      | Tipo   | Req. | Descripción                                                       |
|------------|--------|------|--------------------------------------------------------------------|
| `fecha`    | string | sí   | Fecha ISO de la citación (siempre ≥ fecha de corte).               |
| `titulo`   | string | sí   | Texto del listado oficial (p. ej. `"Sesión Ordinaria Especial CITADA"`). |
| `estado`   | string | sí   | Siempre `"citada"` — el único hecho que la fuente publica a futuro. |
| `idSesion` | number | sí   | Id estable del listado oficial (`sesion.html?id=N`).               |
| `fuenteU`  | string | sí   | URL de la fuente (listado de sesiones HCDN).                       |
| `temarioU` | string | no   | Link al temario oficial del Plan de Labor, si está publicado.      |
| `temas`    | array  | sí   | Temas del Plan de Labor, **curados a mano** con fuentes (el documento oficial no es parseable). `[]` si no está publicado o aún no se curó. Cada tema: `{ titulo, expediente?, estadoTramite?, fuentes[] }`. |

### `recientes[]` — desenlaces de los últimos ≤60 días

| Campo         | Tipo   | Req. | Descripción                                                     |
|---------------|--------|------|------------------------------------------------------------------|
| `fecha`       | string | sí   | Fecha ISO de la sesión.                                         |
| `titulo`      | string | sí   | Texto del listado oficial.                                      |
| `estado`      | string | sí   | `"efectuada"` \| `"no_efectuada"` \| `"fracasada"` — textual de la fuente. |
| `idSesion`    | number | sí   | Id del listado oficial.                                         |
| `votacionIds` | array  | no   | Ids de `votaciones[].id` producidas por esa sesión (cruce por fecha exacta, +1 día para no reclamadas — el voto cae en la madrugada siguiente). |
| `curaduria`   | string | no   | `"pendiente"` si la sesión efectuada figura en la cola de curaduría y aún no tiene votación cargada. |
| `fuenteU`     | string | sí   | URL de la fuente.                                               |

### `comisiones[]` — reuniones de comisión próximas

| Campo       | Tipo   | Req. | Descripción                                            |
|-------------|--------|------|--------------------------------------------------------|
| `fecha`     | string | sí   | Fecha ISO de la reunión.                               |
| `hora`      | string | no   | `"HH:MM"` si la citación la publica.                   |
| `comision`  | string | sí   | Nombre oficial de la comisión, verbatim.               |
| `lugar`     | string | no   | Sala/edificio, verbatim.                               |
| `temas`     | string | no   | Resumen textual de la citación, verbatim (jamás resumido por el ETL). |
| `citacionU` | string | no   | Link a la citación oficial (PDF).                      |

**Ciclo de vida**: una citación entra a `proximas` cuando el listado oficial la publica;
pasada la fecha, el propio listado dicta la transición a `recientes` (`efectuada` /
`no_efectuada` / `fracasada`). Una "citada" vencida sin desenlace publicado simplemente
sale de `proximas` — no se le inventa destino. Los `temas[]` curados nunca los borra el
ETL mientras la sesión siga citada.

---

## Códigos de posición

En `votaciones[].lineas` (posición **del bloque**):

| Valor  | Significado                        | ¿Computa en el índice? |
|--------|------------------------------------|------------------------|
| `"AF"` | Línea afirmativa del bloque        | Sí                     |
| `"NEG"`| Línea negativa del bloque          | Sí                     |
| `"ABS"`| Línea de abstención del bloque     | Sí (integra el denominador; nunca coincide con `gov`) |
| `"DIV"`| El bloque votó **dividido**        | No — sin voto nominal no se puede asignar a cada banca |
| `null` | Sin línea documentada              | No                     |

En `votaciones[].excepciones[].v` (posición **individual**), además de `AF`/`NEG`/`ABS`:

| Valor   | Significado                                        | ¿Computa? |
|---------|----------------------------------------------------|-----------|
| `"AUS"` | Ausencia individual con lectura política documentada | No (categoría propia: no cuenta como apoyo ni rechazo) |

---

## Metodología del índice de alineamiento

El índice (0–100) es el **porcentaje de posiciones coincidentes con la del gobierno**
(`gov`) sobre las votaciones **computables** de cada banca. Es **provisional a nivel
bloque**: mientras no estén cargadas las actas nominales completas (dataset
`votaciones_nominales` de datos.hcdn.gob.ar):

1. Cada diputado toma la posición documentada de su bloque (`lineas[su bloque]`).
2. Una `excepcion` con su nombre **pisa** la línea de bloque.
3. `DIV` y `null` **no computan** para nadie de ese bloque.
4. La **ausencia** (`AUS`) es categoría propia: no computa. La **abstención** (`ABS`) sí
   integra el denominador (y nunca coincide con `gov`).
5. Un diputado con `i` (asunción posterior) **no computa** las votaciones anteriores a esa
   fecha. Si `i` coincide con la fecha de la sesión, la votación **sí** computa (jura al inicio).

`índice = round(100 × posiciones_pro_gobierno / votaciones_computables)`; `null` si no hay
computables. La implementación de referencia está en [`lib/compute.ts`](../lib/compute.ts)
y está cubierta por [tests de regresión](../tests/compute.test.ts).

---

## Consumir la API

Los cuatro archivos se sirven como endpoints públicos con **CORS abierto**:

```
https://diputracker.vercel.app/data/diputados.json
https://diputracker.vercel.app/data/votaciones.json
https://diputracker.vercel.app/data/contexto.json
https://diputracker.vercel.app/data/agenda.json
```

- **CORS**: `Access-Control-Allow-Origin: *` — se pueden consumir desde el navegador.
- **Caché**: `max-age=300` (navegador) / `s-maxage=3600` (edge) con `stale-while-revalidate`.
  Los datos cambian como mucho 2×/día; no hace falta pedirlos más seguido.
- **Estabilidad**: la forma de los objetos es estable; cambios se registran en git.

Ejemplo — índice de un bloque desde otra app:

```js
const { diputados } = await (await fetch("https://diputracker.vercel.app/data/diputados.json")).json();
const llaCount = diputados.filter(d => d.b === "LLA").length;
```

También hay un **CSV** descargable con el índice calculado de las 257 bancas desde la
sección *Índices* de la app (botón "Descargar CSV").

---

## Actualización y trazabilidad

- Rutinas automáticas (GitHub Actions) refrescan la nómina y vigilan nuevas actas 2×/día,
  validan invariantes y solo commitean si la validación pasa.
- Cada corrida deja registro en [`data/etl-log.json`](../data/etl-log.json).
- El historial de git es la auditoría: cada cambio de dato queda registrado con su fecha
  y su motivo.

---

## Cómo citar

> "DipuTracker, con datos oficiales de la HCDN (jul-2026)"

Fuentes primarias: [HCDN — nómina y bloques](https://www.diputados.gov.ar/diputados/) ·
[actas de votación](https://votaciones.hcdn.gob.ar) ·
[datos abiertos](https://datos.hcdn.gob.ar). La información de la HCDN es de dominio
público y puede usarse libremente citando la fuente.
