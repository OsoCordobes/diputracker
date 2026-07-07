"use client";
import type { DTData } from "@/lib/types";

// Mini-hemiciclo de la vista Votación: 257 bancas en 9 filas, ordenadas AF → NEG → ABS → AUS → sin dato.
export default function MiniHemi({ D, selLaw }: { D: DTData; selLaw: number }) {
  const W = 380,
    H = 200,
    cx = 190,
    cy = 192,
    Rout = 178,
    innerF = 0.5,
    rows = 9;
  const radii: number[] = [];
  for (let i = 0; i < rows; i++) radii.push(innerF + ((1 - innerF) * i) / (rows - 1));
  const sum = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.max(6, Math.round((257 * r) / sum)));
  let diff = 257 - counts.reduce((a, b) => a + b, 0);
  let ri = rows - 1;
  while (diff !== 0) {
    counts[ri] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    ri--;
    if (ri < 0) ri = rows - 1;
  }
  const slots: { x: number; y: number; a: number }[] = [];
  counts.forEach((cnt, r) => {
    const rad = radii[r] * Rout;
    const pad = 0.05;
    for (let i = 0; i < cnt; i++) {
      const t = cnt === 1 ? 0.5 : i / (cnt - 1);
      const a = Math.PI * (1 - pad) - t * Math.PI * (1 - 2 * pad);
      slots.push({ x: cx + rad * Math.cos(a), y: cy - rad * Math.sin(a), a });
    }
  });
  slots.sort((p, q) => q.a - p.a);

  const order: Record<string, number> = { AF: 0, NEG: 1, ABS: 2, AUS: 3, X: 4 };
  const val = (d: DTData["deps"][number]) => d.votes[selLaw].v || "X";
  const sorted = D.deps.slice().sort((a, b) => order[val(a)] - order[val(b)]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Mini-hemiciclo por posición asignada">
      {sorted.map((d, k) => {
        const s = slots[k];
        const v = val(d);
        let fill = "#EDEAE2",
          stroke = "#E2DDD2",
          dash: string | undefined,
          sw = 0.6;
        if (v === "AF") {
          fill = "#2F6F4E";
          stroke = "#FFFFFF";
        } else if (v === "NEG") {
          fill = "#9B3022";
          stroke = "#FFFFFF";
        } else if (v === "ABS") {
          fill = "#B8B2A6";
          stroke = "#FFFFFF";
        } else if (v === "AUS") {
          fill = "#FFFFFF";
          stroke = "#1C1A17";
          dash = "2 1.5";
          sw = 0.9;
        }
        return (
          <circle
            key={d.id}
            className="dt-seatg"
            cx={s.x}
            cy={s.y}
            r={4.3}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeDasharray={dash}
            style={{
              transition: "cx .55s cubic-bezier(.4,0,.2,1), cy .55s cubic-bezier(.4,0,.2,1), fill .4s",
              animationDelay: ((k * 3) % 300) + "ms",
            }}
          />
        );
      })}
    </svg>
  );
}
