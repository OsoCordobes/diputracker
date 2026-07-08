import { test, expect } from "@playwright/test";

// La agenda es el único dataset OPCIONAL: el deploy de UI y el de datos pueden divergir.
// Estos tests fijan el contrato para siempre: la app renderiza COMPLETA con agenda
// ausente (404), corrupta (HTML de error) o vacía. Si alguna vez el fetch de agenda
// puede tirar la app en blanco, esto falla en CI antes de llegar a producción.

const esperarHemiciclo = async (page: import("@playwright/test").Page) => {
  await expect(page.locator(".dt-seat")).toHaveCount(257, { timeout: 30_000 });
};

test("agenda.json 404 → la app renderiza igual", async ({ page }) => {
  await page.route("**/data/agenda.json", (route) =>
    route.fulfill({ status: 404, contentType: "text/html", body: "<html><body>404 Not Found</body></html>" })
  );
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
});

test("agenda.json corrupta (HTML en vez de JSON) → la app renderiza igual", async ({ page }) => {
  await page.route("**/data/agenda.json", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><html><body>error page</body></html>" })
  );
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
});

test("agenda.json con estructura basura → la app renderiza igual", async ({ page }) => {
  await page.route("**/data/agenda.json", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ proximas: "no", meta: 42 }) })
  );
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
});

test("agenda.json vacía (sin sesiones citadas) → la app renderiza igual", async ({ page }) => {
  await page.route("**/data/agenda.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        meta: { nota: "", ventanaDias: 60, consultado: "2026-07-08T01:00:00Z", fuentes: [] },
        proximas: [],
        recientes: [],
        comisiones: [],
      }),
    })
  );
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
});

test("sin agenda no hay errores de consola", async ({ page }) => {
  const errores: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errores.push(msg.text());
  });
  page.on("pageerror", (err) => errores.push(String(err)));
  await page.route("**/data/agenda.json", (route) => route.abort("failed"));
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
  await page.waitForTimeout(500);
  const reales = errores.filter((e) => !/favicon|DevTools|Download the React|agenda\.json|ERR_FAILED|Failed to fetch/i.test(e));
  expect(reales, "errores de consola: " + reales.join(" | ")).toEqual([]);
});
