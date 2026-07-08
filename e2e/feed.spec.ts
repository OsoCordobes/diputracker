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

// ---- el feed en sí: contenido, filtros en el hash, deep-links ----

const agendaConProxima = () => {
  const en8dias = new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10);
  return {
    meta: {
      nota: "",
      ventanaDias: 60,
      consultado: new Date().toISOString(),
      fuentes: [{ n: "HCDN — Listado de sesiones", u: "https://www.diputados.gov.ar/sesiones/", consultado: new Date().toISOString(), ok: true }],
    },
    proximas: [
      {
        fecha: en8dias,
        titulo: "Sesión Ordinaria Especial CITADA",
        estado: "citada",
        idSesion: 9999,
        fuenteU: "https://www.diputados.gov.ar/sesiones/",
        temarioU: "https://www.diputados.gov.ar/secparl/dclp/procesar.html?id_sesion=9999&tipo=temario",
        temas: [
          { titulo: "Presupuesto 2027 — dictamen de mayoría", fuentes: [{ n: "HCDN Plan de Labor", u: "https://www.diputados.gov.ar/x" }] },
        ],
      },
    ],
    recientes: [],
    comisiones: [],
  };
};

test("el feed muestra la sesión citada futura con temario y sin colores de resultado", async ({ page }) => {
  await page.route("**/data/agenda.json", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(agendaConProxima()) })
  );
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
  await expect(page.getByText("CITADA").first()).toBeVisible();
  await expect(page.getByText(/Presupuesto 2027/)).toBeVisible();
  await expect(page.getByText(/El temario puede cambiar. No se predicen resultados./)).toBeVisible();
  // la card AHORA muestra el countdown honesto
  await expect(page.getByText(/en 8 días|en 7 días/).first()).toBeVisible();
});

test("estado vacío honesto cuando no hay citaciones", async ({ page }) => {
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
  await expect(page.getByText("Sin sesiones citadas").first()).toBeVisible();
  await expect(page.getByText(/se revisa 2 veces por día|Se revisa la fuente oficial/).first()).toBeVisible();
});

test("los filtros del feed escriben el hash (link compartible)", async ({ page }) => {
  await page.goto("/#/panel");
  await esperarHemiciclo(page);
  // filtrar por bloque LLA
  await page.getByRole("button", { name: /LLA/ }).first().click();
  expect(await page.evaluate(() => location.hash)).toContain("bloc=lla");
  // apagar movimientos
  await page.getByRole("button", { name: /Movimientos/, exact: false }).first().click();
  expect(await page.evaluate(() => location.hash)).toContain("feed=vot%2Cses");
  // período ordinarias también viaja en el hash
  await page.getByRole("button", { name: /Ordinarias/ }).first().click();
  expect(await page.evaluate(() => location.hash)).toContain("per=ord");
});

test("deep-link con filtros pre-aplica el estado", async ({ page }) => {
  await page.goto("/#/panel?per=ext&bloc=lla&feed=vot,ses");
  await esperarHemiciclo(page);
  await expect(page.getByRole("button", { name: /Extraord/ }).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /LLA/ }).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /Movimientos/ }).first()).toHaveAttribute("aria-pressed", "false");
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
