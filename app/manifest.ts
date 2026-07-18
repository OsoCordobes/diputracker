import type { MetadataRoute } from "next";

// PWA "light": manifest + iconos para Add to Home Screen (sin service worker —
// la app ya es liviana y los datos se actualizan 2×/día, no hace falta offline).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DipuTracker — la Cámara de Diputados, banca por banca",
    short_name: "DipuTracker",
    description:
      "Índice de alineamiento, poder de bisagra y simulador de mayorías sobre las 257 bancas reales de la HCDN. Datos oficiales, fuentes citadas.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#1C1A17",
    lang: "es-AR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
