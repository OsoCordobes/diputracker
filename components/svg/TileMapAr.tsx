"use client";
import { ramp } from "@/lib/compute";
import type { TileDatum } from "@/lib/charts";
import { TILE_COLS, TILE_ROWS } from "@/lib/tilemap-ar";
import { C } from "@/lib/tokens";

// Mapa de mosaico de Argentina: 24 distritos en disposición geográfica aproximada.
// Relleno = promedio distrital del índice sobre la rampa diverging; número = bancas.
// Advertencia metodológica impresa: el promedio esconde dispersión (por eso cada
// tile abre el detalle banca por banca).
const TILE = 74;
const GAP = 7;

export default function TileMapAr({
  tiles,
  daltonico = false,
  onDistrito,
}: {
  tiles: TileDatum[];
  daltonico?: boolean;
  onDistrito?: (distrito: string) => void;
}) {
  const W = TILE_COLS * (TILE + GAP) - GAP;
  const H = TILE_ROWS * (TILE + GAP) - GAP;

  return (
    <div style={{ display: "flex", gap: "26px", flexWrap: "wrap", alignItems: "flex-start" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "min(380px, 100%)", height: "auto", display: "block", flexShrink: 0 }}
        role="img"
        aria-label="Mapa de mosaico: alineamiento promedio por distrito, 24 jurisdicciones"
      >
        {tiles.map((t) => {
          const x0 = t.col * (TILE + GAP);
          const y0 = t.row * (TILE + GAP);
          const fill = t.prom == null ? "#EFEBE3" : ramp(t.prom / 100, daltonico);
          // texto claro sobre extremos saturados de la rampa, tinta sobre el centro claro
          const oscuro = t.prom != null && (t.prom <= 22 || t.prom >= 78);
          const fg = oscuro ? "#FFFFFF" : C.ink;
          const fgSoft = oscuro ? "rgba(255,255,255,0.8)" : C.muted;
          return (
            <g
              key={t.distrito}
              onClick={() => onDistrito?.(t.distrito)}
              style={{ cursor: onDistrito ? "pointer" : "default" }}
            >
              <rect x={x0} y={y0} width={TILE} height={TILE} rx={9} fill={fill} stroke="rgba(28,26,23,0.14)" strokeWidth={1} />
              <text x={x0 + 7} y={y0 + 15} fontSize={9.5} fontWeight={700} fill={fgSoft} letterSpacing="0.04em">
                {t.sigla}
              </text>
              <text x={x0 + 7} y={y0 + 42} fontSize={22} fontWeight={600} fill={fg} className="dt-num">
                {t.bancas}
              </text>
              <text x={x0 + 7} y={y0 + 55} fontSize={7.5} fill={fgSoft}>
                bancas · prom {t.prom == null ? "s/d" : t.prom}
              </text>
              {t.en2027 > 0 && (
                <text x={x0 + 7} y={y0 + 66} fontSize={7.5} fill={fgSoft} className="dt-num">
                  {t.en2027} en juego 2027
                </text>
              )}
              <title>{`${t.distrito} · ${t.bancas} bancas · promedio ${t.prom == null ? "s/d" : t.prom} (${t.computables} computables) · ${t.en2027} vencen en 2027`}</title>
            </g>
          );
        })}
      </svg>
      <div style={{ flex: 1, minWidth: "220px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11.5px", color: C.rampNeg, fontWeight: 600 }}>Oposición</span>
          <span
            style={{
              width: "150px",
              height: "10px",
              borderRadius: "6px",
              border: `1px solid ${C.borderChip}`,
              background: "linear-gradient(90deg,#0F766E,#14B8A6,#5EEAD4,#E7E5E4,#FDBA74,#F59E0B,#B45309)",
            }}
          ></span>
          <span style={{ fontSize: "11.5px", color: C.rampPos, fontWeight: 600 }}>Oficialismo</span>
          <span className="dt-num" style={{ fontSize: "10.5px", color: C.ghost }}>
            0 → 100 · promedio distrital
          </span>
        </div>
        <p style={{ fontSize: "12.5px", color: C.muted, lineHeight: 1.55, margin: "12px 0 0", maxWidth: "340px" }}>
          El promedio distrital <strong>esconde dispersión</strong>: una delegación en 50 puede ser dos mitades opuestas.
          Tocá un distrito para abrir el detalle banca por banca. La disposición es geográfica aproximada.
        </p>
      </div>
    </div>
  );
}
