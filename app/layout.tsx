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

export const metadata: Metadata = {
  title: "DipuTracker — la Cámara de Diputados, banca por banca",
  description:
    "Índice de alineamiento con el gobierno, poder de bisagra, disidencias y simulador de mayorías sobre las 257 bancas reales de la HCDN. Datos oficiales, fuentes citadas, dataset abierto.",
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${franklin.variable} ${serif.variable} ${mono.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
