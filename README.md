# DipuTracker

**La Cámara de Diputados de la Nación Argentina, banca por banca.**

🔗 **En vivo: [diputracker.vercel.app](https://diputracker.vercel.app)**

Índice de alineamiento con el gobierno nacional, poder de bisagra (Banzhaf), disidencias
documentadas y simulador de mayorías sobre las **257 bancas reales** de la HCDN.
Proyecto ciudadano independiente, sin afiliación con la HCDN ni con fuerza política alguna.

## Principios

1. **Solo datos reales.** Nada se inventa ni se estima sin fuente. Cada votación cita su acta
   o cobertura de prensa; cada cifra lleva su fuente y fecha de consulta.
2. **Datos abiertos y auditables.** Los datasets viven en este repo
   ([`public/data/`](public/data/)), documentados campo por campo en el
   [**diccionario de datos**](docs/DATASET.md), y se sirven como API pública con CORS.
   Cada actualización queda registrada en el historial de git — cualquiera puede auditar
   qué cambió, cuándo y por qué.
3. **Metodología explícita.** Cada índice publica qué mide, cómo se calcula y qué **no**
   permite afirmar (sección *Índices* de la app).

## Datos abiertos

Los tres datasets se sirven como API pública con CORS abierto y están documentados en el
[**diccionario de datos** (`docs/DATASET.md`)](docs/DATASET.md) — estructura campo por campo,
códigos de posición, metodología y guía de consumo:

```
https://diputracker.vercel.app/data/diputados.json
https://diputracker.vercel.app/data/votaciones.json
https://diputracker.vercel.app/data/contexto.json
```

## Fuentes

| Dato | Fuente oficial |
|---|---|
| Nómina, bloques, interbloques, fotos | [HCDN — diputados.gov.ar](https://www.diputados.gov.ar/diputados/) |
| Actas de votación | [votaciones.hcdn.gob.ar](https://votaciones.hcdn.gob.ar) |
| Datos abiertos (voto nominal) | [datos.hcdn.gob.ar](https://datos.hcdn.gob.ar) |
| Declaraciones juradas | [Oficina Anticorrupción](https://www2.jus.gov.ar/consultaddjj/Home/Busqueda) |
| Posiciones de bloque por votación | Actas + prensa parlamentaria (fuentes citadas en cada votación) |

La información de la HCDN es de dominio público; se cita la fuente.

## Metodología del índice (versión provisional)

El índice de alineamiento es el porcentaje de posiciones coincidentes con la del gobierno
sobre las votaciones computables de cada banca. Mientras no estén cargadas las actas
nominales completas (dataset `votaciones_nominales` de datos.hcdn.gob.ar):

- Cada diputado toma la **posición mayoritaria documentada de su bloque**.
- Si el bloque votó dividido o no hay línea documentada, esa votación **no computa**.
- Los votos y ausencias individuales con registro documental **pisan** la línea de bloque.
- La **ausencia** es categoría propia: no computa como apoyo ni rechazo.
  La **abstención** sí integra el denominador.
- Los diputados que asumieron después de una votación no la computan. Si la asunción
  coincide con la fecha de la sesión, la votación computa (caso verificado contra el acta:
  la jura ocurre al inicio de la sesión).

## Verificación

El dataset completo fue verificado el 2026-07-07 mediante contraste multi-fuente:
cada votación contra sus fuentes citadas más cobertura independiente
(HCDN Prensa, Chequeado, Parlamentario, Infobae, Ámbito, La Nación, Letra P), y la
nómina de 257 diputados contra el listado oficial vivo de la HCDN (coincidencia exacta:
nombres, bloques, distritos, mandatos y fotos). Las discrepancias encontradas se
corrigieron citando la evidencia en el historial de commits.

Las votaciones del 24-jun-2026 (Súper RIGI y acuerdo con holdouts) se incorporaron tras
un barrido de 4 ángulos independientes sobre el período 21-may → 7-jul (prensa oficial,
prensa especializada, medios grandes y búsqueda inversa de ausencia de sesiones) más
verificación adversarial: fue la única sesión con votaciones del recinto en ese lapso,
confirmada por el listado oficial de sesiones del Período 144. Además, una suite de
tests de regresión pinnea el índice de cada caso borde con aritmética verificada a mano
(`npm test`, corre en CI).

## Actualización automática

Los datos se refrescan mediante rutinas programadas (GitHub Actions) que consultan las
fuentes oficiales, validan invariantes (257 bancas, ids únicos, bloques válidos, sumas de
votos) y solo commitean si la validación pasa. Cada corrida deja registro en
[`data/etl-log.json`](data/etl-log.json).

## Stack

- [Next.js](https://nextjs.org) (App Router) + React — frontend
- Datos versionados en el repo (JSON) — sin base de datos: el historial de git es la auditoría
- GitHub Actions — rutinas de actualización
- Vercel — hosting

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm run etl:nomina   # refresca la nómina desde las fuentes oficiales
npm run etl:votaciones # chequea nuevas actas / dataset nominal
```

## Documentación

- [`docs/ESTADO.md`](docs/ESTADO.md) — estado del proyecto de un vistazo.
- [`docs/DATASET.md`](docs/DATASET.md) — diccionario de datos y guía de la API.
- [`docs/MANTENIMIENTO.md`](docs/MANTENIMIENTO.md) — runbook: cómo curar una votación nueva y operar el proyecto.
- [`docs/DESIGN.md`](docs/DESIGN.md) — diseño canónico versionado y su changelog (v5: live post).

## Cómo citar

> "DipuTracker, con datos oficiales de la HCDN (jul-2026)"

## Licencia

Código: [MIT](LICENSE). Datos: dominio público (HCDN), se solicita citar la fuente.
