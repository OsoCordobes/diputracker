import { test, expect } from "@playwright/test";

// Arnés de regresión de rutas hash. Los permalinks compartidos (prensa, redes) son el
// activo más valioso de la app: cada ruta debe (a) renderizar su contenido distintivo,
// (b) conservar el hash exactamente como llegó — sin reescrituras al cargar.

const esperarDatos = async (page: import("@playwright/test").Page) => {
  await page.locator(".dt-seat, .dt-view").first().waitFor({ timeout: 30_000 });
};

test.describe("deep links: renderizan y no reescriben el hash", () => {
  const casos: [string, (page: import("@playwright/test").Page) => Promise<void>][] = [
    [
      "#/panel",
      async (page) => {
        await expect(page.getByRole("heading", { name: "Índice de alineamiento con el gobierno nacional" })).toBeVisible();
        await expect(page.locator(".dt-seat")).toHaveCount(257);
      },
    ],
    [
      "#/votacion/super-rigi",
      async (page) => {
        await expect(page.getByText(/Súper RIGI/).first()).toBeVisible();
      },
    ],
    [
      "#/diputado/0",
      async (page) => {
        await expect(page.getByRole("dialog", { name: /Ficha del diputado/ })).toBeVisible();
      },
    ],
    [
      "#/indices/alineamiento",
      async (page) => {
        await expect(page.getByRole("heading", { name: "Cinco lecturas de la misma Cámara" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Alineamiento", exact: true, pressed: true })).toBeVisible();
        await expect(page.locator('svg[aria-label*="Alineamiento por banca"]')).toBeVisible();
      },
    ],
    [
      "#/indices/disciplina",
      async (page) => {
        await expect(page.getByRole("button", { name: "Disciplina de bloque", exact: true, pressed: true })).toBeVisible();
        await expect(page.locator('svg[aria-label*="Registro de líneas por bloque"]')).toBeVisible();
      },
    ],
    [
      "#/indices/poder",
      async (page) => {
        await expect(page.getByRole("button", { name: "Poder de bisagra", exact: true, pressed: true })).toBeVisible();
        await expect(page.locator('svg[aria-label*="Poder de bisagra vs bancas"]')).toBeVisible();
      },
    ],
    [
      "#/indices/rupturas",
      async (page) => {
        await expect(page.getByRole("button", { name: "Disidencias", exact: true, pressed: true })).toBeVisible();
        await expect(page.locator('svg[aria-label*="Matriz de rupturas"]')).toBeVisible();
      },
    ],
    [
      "#/indices/territorio",
      async (page) => {
        await expect(page.getByRole("button", { name: "Territorio", exact: true, pressed: true })).toBeVisible();
        await expect(page.locator('svg[aria-label*="Mapa de mosaico"]')).toBeVisible();
      },
    ],
    [
      "#/comparador/0,1",
      async (page) => {
        await expect(page.getByText(/Comparar diputados|Comparación directa/).first()).toBeVisible();
      },
    ],
    [
      "#/simulador",
      async (page) => {
        await expect(page.getByText(/Simulación de votación/).first()).toBeVisible();
      },
    ],
    [
      "#/movimientos",
      async (page) => {
        await expect(page.getByText(/Bloques, interbloques y movimientos/).first()).toBeVisible();
      },
    ],
    [
      "#/patrimonio",
      async (page) => {
        await expect(page.getByText(/Dieta, patrimonio y declaraciones juradas/).first()).toBeVisible();
      },
    ],
  ];

  for (const [hash, verificar] of casos) {
    test(`${hash} renderiza y conserva el hash`, async ({ page }) => {
      await page.goto("/" + hash);
      await esperarDatos(page);
      await verificar(page);
      // el hash llega intacto: nada lo reescribe durante la carga
      expect(await page.evaluate(() => location.hash)).toBe(hash);
    });
  }
});

test("round-trip: la navegación por UI produce el hash esperado", async ({ page }) => {
  await page.goto("/#/panel");
  await page.locator(".dt-seat").first().waitFor({ timeout: 30_000 });

  const nav: [string, string | RegExp][] = [
    ["Índices", "#/indices"],
    ["Simulador", "#/simulador"],
    ["Patrimonio", "#/patrimonio"],
    ["Votaciones", /^#\/votacion\/.+/],
    ["Panel", "#/panel"],
  ];
  for (const [boton, esperado] of nav) {
    await page.getByRole("button", { name: boton, exact: true }).click();
    const hash = await page.evaluate(() => location.hash);
    if (typeof esperado === "string") expect(hash).toBe(esperado);
    else expect(hash).toMatch(esperado);
  }
});
