import { defineConfig, devices } from "@playwright/test";

// Smoke E2E: bootea el build de producción y verifica que la app renderiza de verdad.
// La app es una SPA autocontenida (sirve JSON estático del mismo origen), así que el
// test es determinista: sin red externa, sin auth, sin timing races más allá de la hidratación.
const PORT = 3100;

// Entornos con Chromium preinstalado en otra versión (p. ej. contenedores gestionados)
// pueden apuntar a su binario con PW_CHROMIUM_PATH; sin la variable no cambia nada.
const executablePath = process.env.PW_CHROMIUM_PATH;
const launchOptions = executablePath ? { executablePath } : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], launchOptions } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
