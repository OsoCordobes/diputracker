# Estado del proyecto — DipuTracker

_Resumen del estado al 7-jul-2026. Para el detalle técnico de los datos, ver
[DATASET.md](DATASET.md); para arrancar, ver el [README](../README.md)._

## En una línea

DipuTracker está **en producción y sano**: [diputracker.vercel.app](https://diputracker.vercel.app),
con datos oficiales de la HCDN verificados hasta la última sesión, pipeline de actualización
automática, y una batería de tests que cubre desde la aritmética del índice hasta que la
página no quede en blanco.

## Qué hace

Las 257 bancas reales de la Cámara de Diputados, con:

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
| Frontend | Next.js (App Router), pixel-perfect al diseño de Claude Design |
| Hosting | Vercel, auto-deploy en cada push a `main` |
| Datos | versionados en el repo (`public/data/`), servidos como API pública con CORS |
| Actualización | GitHub Actions 2×/día → ETL → validación → commit → redeploy |
| Detección de sesiones | listado oficial vivo (`diputados.gov.ar/sesiones`), tolerancia ±1 día |
| Tests | 31 en total: 26 unitarios (motor + ETL + forma de datos) + 5 E2E (render) |
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
