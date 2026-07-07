import type { NextConfig } from "next";

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
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
