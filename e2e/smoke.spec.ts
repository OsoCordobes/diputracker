import { test, expect } from "@playwright/test";

// Smoke: la app debe renderizar de verdad, no solo compilar. Cada aserción cubre una
// clase de regresión de runtime (import roto, crash de hidratación, vista que tira).

test("el panel renderiza el hemiciclo con las 257 bancas", async ({ page }) => {
  await page.goto("/#/panel");
  await expect(page.locator(".dt-seat")).toHaveCount(257, { timeout: 30_000 });
  // el strip de datos muestra el conteo (dinámico) de votaciones reales
  await expect(page.getByText(/votaciones reales/)).toBeVisible();
  // el hemiciclo es accesible
  await expect(page.locator('svg[aria-label*="Hemiciclo"]')).toBeVisible();
});

test("la búsqueda ⌘K abre y lista diputados", async ({ page }) => {
  await page.goto("/#/panel");
  await page.locator(".dt-seat").first().waitFor({ timeout: 30_000 });
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Buscar diputado" });
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder(/Buscar por nombre/).fill("Menem");
  await expect(dialog.getByText(/Martín Menem/)).toBeVisible();
});

test("la ficha del diputado abre con su índice", async ({ page }) => {
  await page.goto("/#/diputado/0");
  const ficha = page.getByRole("dialog", { name: /Ficha del diputado/ });
  await expect(ficha).toBeVisible({ timeout: 30_000 });
  await expect(ficha.getByText(/Índice de alineamiento/)).toBeVisible();
});

test("las vistas principales renderizan su encabezado", async ({ page }) => {
  const vistas: [string, RegExp][] = [
    ["/#/votacion/super-rigi", /Súper RIGI/],
    ["/#/indices", /Cinco lecturas de la misma Cámara/],
    ["/#/simulador", /Simulación de votación/],
    ["/#/patrimonio", /Dieta, patrimonio y declaraciones juradas/],
    ["/#/movimientos", /Bloques, interbloques y movimientos/],
    ["/#/comparador", /Comparar diputados/],
  ];
  for (const [hash, heading] of vistas) {
    await page.goto(hash);
    await expect(page.getByText(heading).first()).toBeVisible({ timeout: 30_000 });
  }
});

test("no hay errores de consola ni de CSP al cargar", async ({ page }) => {
  const errores: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errores.push(msg.text());
  });
  page.on("pageerror", (err) => errores.push(String(err)));
  await page.goto("/#/panel");
  await page.locator(".dt-seat").first().waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1000);
  // ignorar el ruido esperable (favicon, devtools); fallar ante errores reales de runtime/CSP
  const reales = errores.filter((e) => !/favicon|DevTools|Download the React/i.test(e));
  expect(reales, "errores de consola: " + reales.join(" | ")).toEqual([]);
});
