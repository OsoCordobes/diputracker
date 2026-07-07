import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "parlamentaria.hcdn.gob.ar", pathname: "/image/**" },
    ],
  },
};

export default nextConfig;
