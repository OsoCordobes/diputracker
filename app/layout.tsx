import type { Metadata } from "next";
import { Libre_Franklin, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const franklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='#1C1A17'/><circle cx='32' cy='42' r='18' fill='#FDBA74'/><circle cx='32' cy='42' r='8' fill='#1C1A17'/><rect x='8' y='42' width='48' height='16' fill='#1C1A17'/></svg>"
  );

const TITLE = "DipuTracker — la Cámara de Diputados, banca por banca";
const DESCRIPTION =
  "Índice de alineamiento con el gobierno, poder de bisagra, disidencias y simulador de mayorías sobre las 257 bancas reales de la HCDN. Datos oficiales, fuentes citadas, dataset abierto.";
const SITE_URL = "https://diputracker.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: { icon: FAVICON },
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "DipuTracker",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#1C1A17",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "DipuTracker — Cámara de Diputados de la Nación Argentina, banca por banca",
  description:
    "Nómina oficial de los 257 diputados, bloques, interbloques y posiciones de bloque documentadas en las votaciones del período, con fuentes citadas. Datos de dominio público (HCDN).",
  url: SITE_URL,
  license: "https://www.diputados.gov.ar/diputados/",
  creator: { "@type": "Organization", name: "DipuTracker", url: SITE_URL },
  distribution: [
    { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: SITE_URL + "/data/diputados.json" },
    { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: SITE_URL + "/data/votaciones.json" },
    { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: SITE_URL + "/data/contexto.json" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${franklin.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href="https://parlamentaria.hcdn.gob.ar" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body style={{ fontFamily: "var(--font-sans), -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
