"use client";
import type { DTData, Dep } from "@/lib/types";
import { ramp } from "@/lib/compute";

// Evolución del índice votación a votación (ficha del diputado).
export default function Sparkline({ D, d, P, daltonico }: { D: DTData; d: Dep; P: number[]; daltonico: boolean }) {
  const W = 380,
    H = 64,
    padX = 6,
    padY = 10;
  const n = P.length;
  const pts: { i: number; v: number }[] = [];
  d.evo.forEach((v, i) => {
    if (v != null) pts.push({ i, v });
  });
  const x = (i: number) => padX + (W - 2 * padX) * (n === 1 ? 0.5 : i / (n - 1));
  const y = (v: number) => H - padY - (H - 2 * padY) * (v / 100);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Evolución del índice">
      <line x1={padX} y1={y(50)} x2={W - padX} y2={y(50)} stroke="#EFEBE3" strokeWidth={1} strokeDasharray="3 3" />
      {pts.length > 1 && (
        <polyline
          points={pts.map((p) => x(p.i).toFixed(1) + "," + y(p.v).toFixed(1)).join(" ")}
          fill="none"
          stroke="#1C1A17"
          strokeWidth={1.6}
        />
      )}
      {P.map((vi, i) => {
        const p = pts.find((q) => q.i === i);
        const xv = d.votes[vi];
        return (
          <g key={i}>
            {p ? (
              <circle cx={x(i)} cy={y(p.v)} r={3.4} fill={ramp(p.v / 100, daltonico)} stroke="#1C1A17" strokeWidth={xv.src === "exc" ? 1.6 : 0.8} />
            ) : (
              <circle cx={x(i)} cy={y(50)} r={2.2} fill="#FFFFFF" stroke="#C9C4BA" strokeWidth={1} strokeDasharray="1.5 1.5" />
            )}
            <title>{D.votaciones[vi].corto}</title>
          </g>
        );
      })}
    </svg>
  );
}
