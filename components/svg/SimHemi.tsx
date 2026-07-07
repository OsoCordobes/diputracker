"use client";
import type { DTData, SimPos } from "@/lib/types";

// Hemiciclo del simulador: bancas coloreadas por la posición asignada a su bloque.
export default function SimHemi({ D, sim }: { D: DTData; sim: Record<string, SimPos> }) {
  const g = D.geo;
  const prio: Record<SimPos, number> = { NEG: 0, ABS: 1, AUS: 2, AF: 3 };
  const seats: { v: SimPos }[] = [];
  D.deps.forEach((d) => seats.push({ v: sim[d.b] || "ABS" }));
  seats.sort((a, b) => prio[a.v] - prio[b.v]);

  const markers: [DTData["geo"]["m129"], string][] = [
    [g.m129, "129"],
    [g.m172, "172"],
  ];

  return (
    <svg
      viewBox={`0 0 ${g.W} ${g.H}`}
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      role="img"
      aria-label="Simulación de votación en el hemiciclo"
    >
      {markers.map((mm, i) => {
        const m = mm[0];
        return (
          <g key={"m" + i}>
            <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#1C1A17" strokeWidth={1.4} strokeDasharray="4 4" opacity={0.6} />
            <text
              x={m.x2 + (m.a > Math.PI / 2 ? -4 : 4)}
              y={m.y2 - 7}
              fill="#1C1A17"
              fontSize={13}
              fontFamily="var(--font-mono), monospace"
              fontWeight={500}
              textAnchor={m.a > Math.PI / 2 ? "end" : "start"}
            >
              {mm[1]}
            </text>
          </g>
        );
      })}
      {seats.map((s, k) => {
        const pos = g.slots[k];
        let fill = "#C4BEB2",
          stroke = "#FFFFFF",
          dash: string | undefined;
        if (s.v === "AF") fill = "#2F6F4E";
        else if (s.v === "NEG") fill = "#9B3022";
        else if (s.v === "AUS") {
          fill = "#FFFFFF";
          stroke = "#1C1A17";
          dash = "2.5 2";
        }
        return (
          <circle
            key={k}
            className="dt-seatg"
            cx={pos.x}
            cy={pos.y}
            r={7}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={dash}
            style={{ transition: "fill .45s ease", animationDelay: ((k * 5) % 380) + "ms" }}
          />
        );
      })}
    </svg>
  );
}
