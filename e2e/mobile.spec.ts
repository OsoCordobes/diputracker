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

test("tap en el hemiciclo abre la peek card y de ahí la ficha", async ({ page }) => {
  await page.goto("/#/panel");
  await ready(page);
  // tap en el centro del arco: el hit-testing magnético resuelve la banca más cercana.
  // (click, no touchscreen.tap: el CDP no sintetiza el click post-tap que sí emite
  // un browser táctil real; el handler de la app escucha click, como corresponde)
  const svg = page.locator('svg[aria-label*="Hemiciclo"]');
  const box = (await svg.boundingBox())!;
  await svg.click({ position: { x: box.width / 2, y: box.height * 0.45 } });
  const peek = page.getByTestId("dt-peek");
  await expect(peek).toBeVisible();
  await peek.getByRole("button", { name: /Ver ficha/ }).click();
  await expect(page.getByRole("dialog", { name: /Ficha del diputado/ })).toBeVisible();
});

test("la ficha abre como sheet y cierra con ✕ y con el backdrop", async ({ page }) => {
  await page.goto("/#/diputado/1");
  const ficha = page.getByRole("dialog", { name: /Ficha del diputado/ });
  await expect(ficha).toBeVisible({ timeout: 15_000 });
  await ficha.getByRole("button", { name: "Cerrar ficha" }).click();
  await expect(ficha).toBeHidden();
  // reabrir y cerrar tocando el backdrop
  await page.goto("/#/diputado/2");
  await expect(page.getByRole("dialog", { name: /Ficha del diputado/ })).toBeVisible();
  await page.mouse.click(10, 60); // esquina superior: fuera del sheet, sobre el backdrop
  await expect(page.getByRole("dialog", { name: /Ficha del diputado/ })).toBeHidden();
});

test("la bottom nav navega entre secciones", async ({ page }) => {
  await page.goto("/#/panel");
  await ready(page);
  const nav = page.locator(".dt-bottomnav");
  await expect(nav).toBeVisible();
  await nav.getByRole("button", { name: "Índices" }).tap();
  await expect(page.getByText(/Cinco lecturas de la misma Cámara/)).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe("#/indices");
  await nav.getByRole("button", { name: "Simulador" }).tap();
  await expect(page.getByText(/Simulación de votación/).first()).toBeVisible();
});
