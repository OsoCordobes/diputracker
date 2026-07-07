import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DipuTracker — la Cámara de Diputados, banca por banca";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Tarjeta OG con la identidad del sitio: hemiciclo estilizado sobre fondo tinta.
export default function OgImage() {
  const seats: { x: number; y: number; c: string }[] = [];
  const cx = 600,
    cy = 560,
    rows = 6;
  const RAMP = ["#0F766E", "#14B8A6", "#5EEAD4", "#E7E5E4", "#FDBA74", "#F59E0B", "#B45309"];
  for (let r = 0; r < rows; r++) {
    const rad = 170 + r * 38;
    const count = 16 + r * 4;
    for (let i = 0; i < count; i++) {
      const a = Math.PI * (1 - 0.06) - (i / (count - 1)) * Math.PI * (1 - 0.12);
      const t = 1 - (i / (count - 1));
      seats.push({
        x: cx + rad * Math.cos(a),
        y: cy - rad * Math.sin(a),
        c: RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))],
      });
    }
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#1C1A17",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {seats.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x - 9,
              top: s.y - 9,
              width: 18,
              height: 18,
              borderRadius: 9,
              background: s.c,
              opacity: 0.92,
            }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", padding: "72px 80px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div style={{ fontSize: 84, fontWeight: 600, color: "#FAFAF9" }}>DipuTracker</div>
            <div style={{ fontSize: 22, color: "#9A958A", letterSpacing: 4, textTransform: "uppercase" }}>
              HCDN · 257 bancas
            </div>
          </div>
          <div style={{ fontSize: 32, color: "#C9C4BA", marginTop: 18, maxWidth: 900, lineHeight: 1.35 }}>
            La Cámara de Diputados, banca por banca — índice de alineamiento, poder de bisagra y simulador de mayorías.
          </div>
          <div style={{ fontSize: 22, color: "#FDBA74", marginTop: 26 }}>
            datos oficiales · fuentes citadas · dataset abierto
          </div>
        </div>
      </div>
    ),
    size
  );
}
