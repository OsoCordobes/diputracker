"use client";
import type { DTData, Mode } from "@/lib/types";
import { displayName, ramp, rampPower } from "@/lib/compute";

interface Props {
  D: DTData;
  mode: Mode;
  hoverId: number | null;
  daltonico: boolean;
  onHover: (id: number | null) => void;
  onOpen: (id: number) => void;
}

export default function Hemicycle({ D, mode, hoverId, daltonico, onHover, onOpen }: Props) {
  const g = D.geo;
  const interColor = (d: DTData["deps"][number]) => {
    if (d.b === "LLA") return "#7C3AED";
    if (d.b === "UXP") return "#38BDF8";
    const ib = D.inter[d.b];
    if (ib) return ib.chip;
    return "#B8B2A6";
  };

  const markers: [DTData["geo"]["m129"], string][] = [
    [g.m129, "129 · mayoría simple"],
    [g.m172, "172 · dos tercios"],
  ];

  const hov = hoverId != null ? D.byId[hoverId] : null;
  const hovPos = hov ? (mode === "indice" ? hov.posI : hov.posB) : null;
  const tw = 250;

  return (
    <svg
      viewBox={`0 0 ${g.W} ${g.H}`}
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      role="img"
      aria-label="Hemiciclo de 257 bancas reales"
    >
      {markers.map((mm, i) => {
        const m = mm[0];
        return (
          <g key={"m" + i}>
            <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#1C1A17" strokeWidth={1.3} strokeDasharray="4 4" opacity={0.55} />
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
      {D.deps.map((d) => {
        const pos = mode === "indice" ? d.posI : d.posB;
        let fill: string;
        if (mode === "bloque") fill = d.chip;
        else if (mode === "inter") fill = interColor(d);
        else if (mode === "poder") {
          const p = D.power.map[d.b];
          fill = rampPower(D.power.maxRatio ? p.ratio / D.power.maxRatio : 0);
        } else fill = d.indice == null ? "#D8D3C8" : ramp(d.indice / 100, daltonico);
        const isHov = hoverId === d.id;
        const flag = mode === "disidencia" && d.hasExc;
        return (
          <g
            key={d.id}
            className="dt-seatg"
            transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})`}
            style={{ transition: "transform 700ms cubic-bezier(.4,0,.2,1)", animationDelay: ((d.id * 7) % 430) + "ms" }}
          >
            {flag && <circle r={12.5} fill="none" stroke="#1C1A17" strokeWidth={1.5} opacity={0.85} />}
            <circle
              className="dt-seat"
              r={isHov ? 8.4 : flag ? 7.6 : 7}
              fill={fill}
              stroke={isHov || flag ? "#1C1A17" : "#FFFFFF"}
              strokeWidth={isHov ? 2 : flag ? 2.2 : 1}
              tabIndex={0}
              role="button"
              aria-label={
                "Diputado " + displayName(d.a) + ", bloque " + d.blocName + (d.indice != null ? ", índice " + d.indice : ", sin datos")
              }
              style={{ cursor: "pointer", transition: "fill 700ms cubic-bezier(.4,0,.2,1), r 150ms, stroke 150ms", outline: "none" }}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(d.id)}
              onBlur={() => onHover(null)}
              onClick={() => onOpen(d.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  onOpen(d.id);
                }
              }}
            />
          </g>
        );
      })}
      {hov && hovPos && (
        <foreignObject
          x={hovPos.x > g.cx ? hovPos.x - tw - 12 : hovPos.x + 12}
          y={Math.max(8, hovPos.y - 74)}
          width={tw}
          height={96}
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          <div
            style={{
              background: "#1C1A17",
              color: "#FAFAF9",
              borderRadius: "10px",
              padding: "10px 12px",
              fontFamily: "var(--font-sans), sans-serif",
              boxShadow: "0 14px 30px -12px rgba(0,0,0,.5)",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                flexShrink: 0,
                background: (hov.foto ? `url('${hov.foto}') center/cover, ` : "") + "#3A3733",
              }}
            />
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 600, lineHeight: 1.15 }}>{displayName(hov.a)}</div>
              <div style={{ fontSize: "11px", color: "#C9C4BA", marginTop: "2px" }}>{hov.blocShort + " · " + hov.d}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: hov.indice == null ? "#C9C4BA" : ramp(hov.indice / 100, daltonico),
                  }}
                >
                  {hov.indice == null ? "—" : String(hov.indice)}
                </span>
                <span style={{ fontSize: "10px", color: "#9A958A" }}>
                  {hov.indice == null ? "sin datos" : "índice provisional"}
                </span>
              </div>
            </div>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
