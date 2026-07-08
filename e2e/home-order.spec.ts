import { test, expect } from "@playwright/test";

// Pin deliberado del orden editorial de la home. Si este test falla, alguien reordenó
// las secciones: eso solo puede ocurrir a propósito (actualizando esta lista), nunca
// por accidente. El diff de este archivo documenta cada cambio de jerarquía.

const ORDEN = [
  "Índice de alineamiento con el gobierno nacional", // hero
  "Período computado", // chips de período
  "Composición por bloque — oficial", // franja de composición
  "votaciones del período", // grilla/feed de votaciones
  "Movimientos registrados", // movimientos de bloque
  "Comparar diputados", // teaser comparador
  "Cómo se calcula", // método
];

test("la home presenta sus secciones en el orden editorial pinneado", async ({ page }) => {
  await page.goto("/#/panel");
  await page.locator(".dt-seat").first().waitFor({ timeout: 30_000 });

  // textContent (no innerText): los headers usan text-transform:uppercase por CSS
  const texto = (await page.locator(".dt-view").first().evaluate((el) => el.textContent)) || "";
  let cursor = -1;
  for (const seccion of ORDEN) {
    const idx = texto.indexOf(seccion);
    expect(idx, `sección "${seccion}" ausente de la home`).toBeGreaterThan(-1);
    expect(idx, `sección "${seccion}" fuera de orden`).toBeGreaterThan(cursor);
    cursor = idx;
  }

  // el hemiciclo (ícono del sitio) está presente y por encima del fold editorial
  await expect(page.locator('svg[aria-label*="Hemiciclo"]')).toBeVisible();
});
