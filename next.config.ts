import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP acorde al diseño real de DipuTracker:
//  - style-src 'unsafe-inline': el diseño es 100% estilos inline (fidelidad pixel-perfect).
//  - img-src: fotos oficiales de la HCDN + favicon/tarjetas data-URI + blobs (CSV/PNG).
//  - font-src 'self': next/font/google auto-hospeda las tipografías (no hay pedidos externos).
//  - connect-src 'self': la app solo pide /data/*.json del mismo origen.
//  - frame-ancestors 'none' (anti-clickjacking), base-uri/form-action 'self', object-src 'none'.
// En dev se habilitan 'unsafe-eval' y el websocket de HMR; en producción no.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://parlamentaria.hcdn.gob.ar data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "parlamentaria.hcdn.gob.ar", pathname: "/image/**" },
    ],
  },
  async headers() {
    return [
      {
        // Los datasets cambian como mucho 2x/día: caché corta en el navegador,
        // 1h en el edge con revalidación en background (el deploy invalida el edge).
        source: "/data/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
