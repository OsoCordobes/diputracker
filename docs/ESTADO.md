# Estado del proyecto — DipuTracker

_Resumen del estado al 8-jul-2026 (v5). Para el detalle técnico de los datos, ver
[DATASET.md](DATASET.md); para el diseño canónico y su changelog, [DESIGN.md](DESIGN.md);
para arrancar, ver el [README](../README.md)._

## En una línea

DipuTracker está **en producción y sano**: [diputracker.vercel.app](https://diputracker.vercel.app),
con datos oficiales de la HCDN verificados hasta la última sesión, pipeline de actualización
automática, y una batería de tests que cubre desde la aritmética del índice hasta que la
página no quede en blanco.

## Qué hace

Las 257 bancas reales de la Cámara de Diputados, con:

- **Home "live post"** (v5): estado del recinto AHORA (última sesión, próxima citación con
  countdown, frescura de datos), **crónica cronológica** del período (votaciones + sesiones
  citadas/fracasadas + movimientos, divisor HOY) y filtros compartibles que viven en la URL.
- **Agenda parlamentaria** desde fuentes oficiales (`agenda.json`): sesiones citadas a
  futuro, temario del Plan de Labor (curado con fuentes) y reuniones de comisión.
  **Cero predicciones**: se muestra qué está citado, jamás cómo va a salir.
- **Un gráfico por índice** (SVG bespoke, "capturable" con filtros visibles y fuente+corte
  en el pie): strip plot de 257 bancas, tira de registro por bloque, dumbbell de Banzhaf,
  matriz de rupturas y mapa de mosaico de 24 distritos.
- **Índice de alineamiento** con el gobierno (provisional a nivel bloque, con disidencias documentadas).
- **Poder de bisagra** (índice de Banzhaf) por bloque.
- **Simulador de mayorías** sobre la composición real.
- **Comparador** de hasta tres diputados.
- **Bloques, interbloques y movimientos**; **patrimonio y dieta** con guía oficial de DDJJ.
- Búsqueda ⌘K, fichas con tarjetas compartibles, y el **dataset abierto** descargable (CSV/JSON).

## Datos (la línea roja: solo datos reales, con fuente)

- **11 votaciones** del período (dic-2025 → jun-2026), cada una con acta oficial + prensa citada.
  La última: sesión del 24-jun-2026 (Súper RIGI 130-106-7, acuerdo con holdouts 139-97-0).
- **Nómina de 257** verificada contra el listado oficial vivo de la HCDN (coincidencia exacta).
- Todo el dataset verificado con contraste multi-fuente; las discrepancias halladas se
  corrigieron citando la evidencia (ver historial de git).

## Infraestructura

| Pieza | Estado |
|---|---|
| Frontend | Next.js (App Router); diseño canónico v5 versionado en [DESIGN.md](DESIGN.md) (base: prototipo Claude Design; paridad numérica intacta) |
| Hosting | Vercel, auto-deploy en cada push a `main` |
| Datos | versionados en el repo (`public/data/`, 4 datasets), servidos como API pública con CORS |
| Actualización | GitHub Actions 2×/día → ETL (nómina + votaciones + agenda) → validación → commit → redeploy |
| Detección de sesiones | listado oficial vivo (`diputados.gov.ar/sesiones`), tolerancia ±1 día; citaciones futuras y comisiones vía `etl-agenda` |
| Tests | 92 en total: 64 unitarios (motor + ETL + agenda + feed + charts + forma de datos) + 28 E2E (rutas, feed, orden editorial, render) |
| CI | build + validación + tests + smoke E2E en cada commit |
| Seguridad | CSP, anti-clickjacking, headers; sin secretos en el repo |
| SEO | Open Graph, Twitter Card, JSON-LD Dataset, sitemap, robots, 404 propia |
| Accesibilidad | teclado (roving tabindex en el hemiciclo), focus trap, aria, reduced-motion |

## Lo que falta (bloqueado por afuera, no por el código)

- **Índice definitivo (voto nominal individual)**: hoy el índice es *provisional a nivel bloque*.
  El upgrade a nominal requiere el dataset `votaciones_nominales` de datos.hcdn.gob.ar, que
  **corta en 2020**, y la plataforma `votaciones.hcdn.gob.ar`, **caída por mantenimiento**.
  El ETL vigila ambas fuentes 2×/día y avisará cuando estén disponibles.

## Cómo seguir cuando aparezca una sesión nueva

El ETL la detecta y la registra en `data/pendientes.json` para curaduría. Cargar las
posiciones documentadas con fuentes (mismo formato que las 11 votaciones existentes),
correr `npm run validate` y `npm test`, commitear. El resto es automático.
