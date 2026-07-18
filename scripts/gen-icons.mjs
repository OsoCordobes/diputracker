// Genera los iconos PWA/apple-touch rasterizando el favicon SVG de app/layout.tsx
// con el Chromium de Playwright (ya presente como devDependency). Los PNG se
// commitean; este script solo hace falta si cambia el diseño del icono.
//
//   node scripts/gen-icons.mjs
//   (con Chromium propio: PW_CHROMIUM_PATH=/ruta/a/chrome node scripts/gen-icons.mjs)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const ICON_SVG = (pad) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${-pad} ${-pad} ${64 + 2 * pad} ${64 + 2 * pad}'>` +
  (pad ? `<rect x='${-pad}' y='${-pad}' width='${64 + 2 * pad}' height='${64 + 2 * pad}' fill='#1C1A17'/>` : "") +
  "<rect width='64' height='64' rx='14' fill='#1C1A17'/>" +
  "<circle cx='32' cy='42' r='18' fill='#FDBA74'/>" +
  "<circle cx='32' cy='42' r='8' fill='#1C1A17'/>" +
  // altura 22 (no 16 como el favicon): a 512px la viruta del círculo bajo el corte se nota
  "<rect x='8' y='42' width='48' height='22' fill='#1C1A17'/></svg>";

const targets = [
  { path: "public/icons/icon-192.png", size: 192, pad: 0 },
  { path: "public/icons/icon-512.png", size: 512, pad: 0 },
  // maskable: la zona segura es el 80% central — 20% extra de fondo alrededor
  { path: "public/icons/icon-maskable-512.png", size: 512, pad: 13 },
  { path: "app/apple-icon.png", size: 180, pad: 0 },
];

mkdirSync("public/icons", { recursive: true });
const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}
);
const page = await browser.newPage();
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<body style="margin:0"><img src="data:image/svg+xml,${encodeURIComponent(ICON_SVG(t.pad))}" width="${t.size}" height="${t.size}" style="display:block"></body>`
  );
  await page.screenshot({ path: t.path, omitBackground: true });
  console.log("✓", t.path);
}
await browser.close();
