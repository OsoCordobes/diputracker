import { test, expect, type Page } from "@playwright/test";

// E2E móvil (viewport iPhone 13, touch). Complementa el smoke de escritorio:
// acá se verifica que la app sea usable con el dedo y que ninguna vista
// desborde horizontalmente el viewport del teléfono.

async function ready(page: Page) {
  await expect(page.locator(".dt-seat").first()).toBeVisible({ timeout: 15_000 });
}

test("ninguna vista desborda horizontalmente el viewport", async ({ page }) => {
  const rutas = [
    "/#/panel",
    "/#/votacion/super-rigi",
    "/#/indices",
    "/#/indices/territorio",
    "/#/simulador",
    "/#/patrimonio",
    "/#/movimientos",
    "/#/comparador",
    "/#/como-se-hizo",
  ];
  await page.goto("/");
  await ready(page);
  for (const ruta of rutas) {
    await page.goto(ruta);
    await page.waitForTimeout(600); // hidratación + animaciones de entrada
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `overflow horizontal en ${ruta}`).toBeLessThanOrEqual(1);
    // overflow-x:clip esconde el scroll lateral pero no hace alcanzable el contenido:
    // ningún elemento puede exceder el viewport salvo dentro de un contenedor scrolleable.
    const cortados = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const enScroller = (el: Element) => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          if (/(auto|scroll)/.test(getComputedStyle(n).overflowX)) return true;
        }
        return false;
      };
      const bad: string[] = [];
      document.querySelectorAll("body *").forEach((el) => {
        if (el.closest("svg")) return; // el SVG escala por viewBox
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1 && !enScroller(el)) {
          bad.push(`${el.tagName}.${String(el.className).slice(0, 40)} right=${Math.round(r.right)}`);
        }
      });
      return bad.slice(0, 8);
    });
    expect(cortados, `contenido cortado/inalcanzable en ${ruta}`).toEqual([]);
  }
});
