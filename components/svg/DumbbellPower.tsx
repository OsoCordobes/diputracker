"use client";
import type { DumbbellRow } from "@/lib/charts";
import { C } from "@/lib/tokens";

// Dumbbell de poder de bisagra: por bloque, % de bancas (dot hueco) vs % de poder
// Banzhaf (dot relleno). La BRECHA entre los dos puntos es el mensaje: quién pesa
// más de lo que mide y quién menos. Ordenado por ratio (poder por banca) desc.
export default function DumbbellPower({ rows }: { rows: DumbbellRow[] }) {
  const W = 980;
  const PAD_L = 128;
  const PAD_R = 96;
  const ROW_H = 26;
  const TOP = 22;
  const AXIS_H = 26;
  const plotW = W - PAD_L - PAD_R;
  const maxV = Math.max(...rows.map((r) => Math.max(r.powerPct, r.seatPct))) * 1.06;
  const x = (v: number) => PAD_L + (plotW * v) / maxV;
  const H = TOP + rows.length * ROW_H + AXIS_H;
  const fmt1 = (n: number) => n.toFixed(1).replace(".", ",");

  const ejes = [0, 10, 20, 30, 40].filter((v) => v <= maxV);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={`Poder de bisagra vs bancas: ${rows.length} bloques, índice de Banzhaf`}
      >
        {ejes.map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={TOP - 8} x2={x(v)} y2={H - AXIS_H + 2} stroke={C.borderSoft} strokeWidth={1} />
            <text x={x(v)} y={H - 8} textAnchor="middle" fontSize={10.5} fill={C.ghost} className="dt-num">
              {v}%
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = TOP + i * ROW_H + ROW_H / 2;
          const xSeat = x(r.seatPct);
          const xPow = x(r.powerPct);
          return (
            <g key={r.k}>
              <circle cx={PAD_L - 118} cy={y - 3.5} r={4} fill={r.chip} transform="translate(4,0)" />
              <text x={PAD_L - 104} y={y} textAnchor="start" fontSize={11.5} fontWeight={600} fill={C.inkSoft}>
                {r.corto.length > 14 ? r.corto.slice(0, 13) + "…" : r.corto}
              </text>
              <line x1={xSeat} y1={y - 3.5} x2={xPow} y2={y - 3.5} stroke={r.color} strokeWidth={2.4} opacity={0.75} />
              {/* bancas: hueco (mismo vocabulario que la leyenda del panel de poder) */}
              <circle cx={xSeat} cy={y - 3.5} r={5} fill="#FFFFFF" stroke="#C9C4BA" strokeWidth={1.6}>
                <title>{`${r.nombre} · ${fmt1(r.seatPct)}% de las bancas`}</title>
              </circle>
              {/* poder: relleno, color según ratio */}
              <circle cx={xPow} cy={y - 3.5} r={5} fill={r.color}>
                <title>{`${r.nombre} · ${fmt1(r.powerPct)}% del poder de decisión (Banzhaf)`}</title>
              </circle>
              <text x={W - 10} y={y} textAnchor="end" fontSize={11} fill={r.color} className="dt-num" fontWeight={600}>
                {r.ratio.toFixed(2).replace(".", ",")}× / banca
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px", fontSize: "11px", color: C.body }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FFFFFF", border: "1.6px solid #C9C4BA" }}></span>% de bancas
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: C.ink }}></span>% de poder (Banzhaf)
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: C.accent, fontWeight: 600 }}>terracota</span> pesa más que su tamaño ·{" "}
          <span style={{ color: C.rampNeg, fontWeight: 600 }}>verde</span> pesa menos
        </span>
      </div>
    </div>
  );
}
