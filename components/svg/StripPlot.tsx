"use client";
import { useState } from "react";
import { ramp } from "@/lib/compute";
import { displayName } from "@/lib/compute";
import type { StripData } from "@/lib/charts";
import { C } from "@/lib/tokens";

// Strip plot de alineamiento: las bancas con índice como puntos sobre el eje 0-100,
// coloreadas con la rampa diverging. La distribución ES el mensaje (polarización,
// huecos, bloques compactos vs dispersos) — lo que el ranking en tabla no muestra.
// Jitter determinístico por carriles (id % 9): estable entre renders, sin simulación.
// Dos modos: cámara completa (una franja) o small multiples por bloque.
export default function StripPlot({
  data,
  daltonico = false,
  onOpen,
}: {
  data: StripData;
  daltonico?: boolean;
  onOpen?: (id: number) => void;
}) {
  const [porBloque, setPorBloque] = useState(false);

  const W = 980;
  const PAD_L = porBloque ? 118 : 16;
  const PAD_R = 16;
  const plotW = W - PAD_L - PAD_R;
  const x = (v: number) => PAD_L + (plotW * v) / 100;

  const LANE_H = 13;
  const AXIS_H = 26;
  const TOP = 30; // espacio para las etiquetas de mediana

  const filas = porBloque ? data.bloques : null;
  const bandH = porBloque ? 26 : LANE_H * 9;
  const H = porBloque ? TOP + (filas!.length * (bandH + 8) - 8) + AXIS_H : TOP + bandH + AXIS_H;

  const ejes = [0, 25, 50, 75, 100];

  return (
    <div>
      {/* toggle de modos (mismo patrón visual que el segmented control del hemiciclo) */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <div style={{ display: "inline-flex", background: C.chipBg, border: `1px solid ${C.borderChip}`, borderRadius: "10px", padding: "3px" }}>
          {[
            ["Cámara completa", false],
            ["Por bloque", true],
          ].map(([lab, val]) => (
            <button
              key={String(val)}
              onClick={() => setPorBloque(val as boolean)}
              aria-pressed={porBloque === val}
              style={{
                border: "none",
                borderRadius: "7px",
                padding: "6px 12px",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: porBloque === val ? "#FFFFFF" : "transparent",
                color: porBloque === val ? C.ink : C.muted,
                boxShadow: porBloque === val ? "0 1px 2px rgba(28,26,23,0.12)" : "none",
                transition: "all .2s",
              }}
            >
              {lab as string}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={`Alineamiento por banca: ${data.dots.length} bancas con índice sobre el eje 0 a 100`}
      >
        {/* gridlines + eje */}
        {ejes.map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={TOP - 6} x2={x(v)} y2={H - AXIS_H + 4} stroke={C.borderSoft} strokeWidth={1} />
            <text x={x(v)} y={H - 8} textAnchor="middle" fontSize={10.5} fill={C.ghost} className="dt-num">
              {v}
            </text>
          </g>
        ))}
        <text x={PAD_L} y={H - 8} textAnchor="start" fontSize={9.5} fill={C.ghostest} dy={-13} className="dt-num">
          ← oposición
        </text>
        <text x={W - PAD_R} y={H - 8} textAnchor="end" fontSize={9.5} fill={C.ghostest} dy={-13} className="dt-num">
          oficialismo →
        </text>

        {!porBloque && (
          <g>
            {/* marcas de mediana de los bloques grandes (etiquetas alternadas para no chocar) */}
            {data.medianas.map((m, i) => (
              <g key={m.k}>
                <line x1={x(m.mediana)} y1={TOP - 4} x2={x(m.mediana)} y2={TOP + bandH + 2} stroke={C.ink} strokeWidth={1.2} strokeDasharray="3 2" opacity={0.55} />
                <text
                  x={x(m.mediana)}
                  y={i % 2 ? TOP - 18 : TOP - 7}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill={C.body}
                >
                  {m.corto} · {m.mediana}
                </text>
              </g>
            ))}
            {data.dots.map((d) => (
              <circle
                key={d.id}
                cx={Math.max(PAD_L + 5, Math.min(W - PAD_R - 5, x(d.indice) + d.spread * 8))}
                cy={TOP + 7 + d.carril * LANE_H}
                r={4.4}
                fill={ramp(d.indice / 100, daltonico)}
                stroke={d.hasExc ? C.ink : "rgba(28,26,23,0.25)"}
                strokeWidth={d.hasExc ? 1.5 : 0.6}
                style={{ cursor: onOpen ? "pointer" : "default" }}
                onClick={() => onOpen?.(d.id)}
              >
                <title>{`${displayName(d.nombre)} · ${d.blocShort} · ${d.distrito} · índice ${d.indice}`}</title>
              </circle>
            ))}
          </g>
        )}

        {porBloque &&
          filas!.map((b, fi) => {
            const y0 = TOP + fi * (bandH + 8);
            return (
              <g key={b.k}>
                <text x={PAD_L - 10} y={y0 + bandH / 2 + 3.5} textAnchor="end" fontSize={11.5} fontWeight={600} fill={C.inkSoft}>
                  {b.corto}
                </text>
                <text x={PAD_L - 10} y={y0 + bandH / 2 + 15} textAnchor="end" fontSize={9} fill={C.ghost} className="dt-num">
                  {b.n}
                </text>
                <rect x={PAD_L} y={y0} width={plotW} height={bandH} fill={fi % 2 ? "transparent" : "#FBFAF7"} rx={4} />
                {/* tick de mediana */}
                <line x1={x(b.mediana)} y1={y0 - 2} x2={x(b.mediana)} y2={y0 + bandH + 2} stroke={C.ink} strokeWidth={1.4} opacity={0.7} />
                {b.dots.map((d) => (
                  <circle
                    key={d.id}
                    cx={Math.max(PAD_L + 4, Math.min(W - PAD_R - 4, x(d.indice) + d.spreadBloc * 7))}
                    cy={y0 + 6 + d.carrilBloc * 7}
                    r={3.6}
                    fill={ramp(d.indice / 100, daltonico)}
                    stroke={d.hasExc ? C.ink : "rgba(28,26,23,0.25)"}
                    strokeWidth={d.hasExc ? 1.4 : 0.5}
                    style={{ cursor: onOpen ? "pointer" : "default" }}
                    onClick={() => onOpen?.(d.id)}
                  >
                    <title>{`${displayName(d.nombre)} · ${d.blocShort} · ${d.distrito} · índice ${d.indice}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
      </svg>

      {/* leyenda impresa (capturable): rampa + anillo de ruptura + bancas sin índice */}
      <div style={{ display: "flex", alignItems: "center", gap: "11px", flexWrap: "wrap", marginTop: "10px" }}>
        <span style={{ fontSize: "11.5px", color: C.rampNeg, fontWeight: 600 }}>Oposición firme</span>
        <span
          style={{
            width: "180px",
            maxWidth: "30vw",
            height: "10px",
            borderRadius: "6px",
            border: `1px solid ${C.borderChip}`,
            background: "linear-gradient(90deg,#0F766E,#14B8A6,#5EEAD4,#E7E5E4,#FDBA74,#F59E0B,#B45309)",
          }}
        ></span>
        <span style={{ fontSize: "11.5px", color: C.rampPos, fontWeight: 600 }}>Oficialismo</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: C.body }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "50%", border: `1.6px solid ${C.ink}`, background: "#E7E5E4" }}></span>
          registro individual
        </span>
        {data.sinIndice > 0 && (
          <span className="dt-num" style={{ fontSize: "11px", color: C.ghost }}>
            {data.sinIndice} banca{data.sinIndice === 1 ? "" : "s"} sin índice (no se grafican, no se inventan)
          </span>
        )}
      </div>
    </div>
  );
}
