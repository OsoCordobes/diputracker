"use client";
import type { BreakRow } from "@/lib/charts";
import { displayName } from "@/lib/compute";
import { C } from "@/lib/tokens";

// Matriz banca × votación de rupturas: convierte la lista de disidencias en un patrón.
// Fondo tenue = línea del bloque de esa banca en esa votación; anillo ink (el mismo
// símbolo del hemiciclo en modo Disidencias) = la banca se apartó; ✕ = ausencia con
// lectura política. La leyenda va IMPRESA con los nombres de las votaciones numeradas
// (una captura debe ser autosuficiente, sin tooltips).
const CELL = 20;
const GAP = 4;

export default function BreakMatrix({ rows, votCortos, onOpen }: { rows: BreakRow[]; votCortos: string[]; onOpen?: (id: number) => void }) {
  const n = votCortos.length;
  const PAD_L = 190;
  const ROW_H = CELL + 8;
  const TOP = 22;
  const W = Math.max(700, PAD_L + n * (CELL + GAP) + 16);
  const H = TOP + rows.length * ROW_H + 6;

  const tinte = (l: string | null) => (l === "AF" ? "rgba(47,111,78,0.18)" : l === "NEG" ? "rgba(155,48,34,0.16)" : l === "ABS" ? "rgba(184,178,166,0.28)" : "#FBFAF7");

  return (
    <div style={{ overflowX: "auto" }} className="dt-scroll">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", minWidth: "660px", height: "auto", display: "block" }}
        role="img"
        aria-label={`Matriz de rupturas: ${rows.length} bancas con registro individual por ${n} votaciones`}
      >
        {/* números de columna (leyenda impresa abajo) */}
        {votCortos.map((_, ci) => (
          <text key={ci} x={PAD_L + ci * (CELL + GAP) + CELL / 2} y={TOP - 8} textAnchor="middle" fontSize={9.5} fill={C.ghost} className="dt-num">
            {ci + 1}
          </text>
        ))}
        {rows.map((r, ri) => {
          const y = TOP + ri * ROW_H;
          return (
            <g key={r.id} onClick={() => onOpen?.(r.id)} style={{ cursor: onOpen ? "pointer" : "default" }}>
              <circle cx={8} cy={y + CELL / 2} r={4} fill={r.chip} />
              <text x={18} y={y + CELL / 2 + 3.5} fontSize={11.5} fontWeight={600} fill={C.inkSoft}>
                {displayName(r.nombre).length > 22 ? displayName(r.nombre).slice(0, 21) + "…" : displayName(r.nombre)}
              </text>
              {r.celdas.map((cel, ci) => {
                const x = PAD_L + ci * (CELL + GAP);
                return (
                  <g key={ci}>
                    <rect x={x} y={y} width={CELL} height={CELL} rx={4} fill={tinte(cel.linea)} stroke={C.borderSoft} strokeWidth={0.8} />
                    {cel.ruptura && cel.v !== "AUS" && (
                      <circle cx={x + CELL / 2} cy={y + CELL / 2} r={5.5} fill="none" stroke={C.ink} strokeWidth={1.8} />
                    )}
                    {cel.ruptura && cel.v === "AUS" && (
                      <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.soft}>
                        ✕
                      </text>
                    )}
                    <title>{`${displayName(r.nombre)} · ${votCortos[ci]} · ${
                      cel.ruptura
                        ? cel.v === "AUS"
                          ? "ausencia con lectura política"
                          : "ruptura documentada (" + cel.v + ")"
                        : "línea de su bloque" + (cel.linea ? " (" + cel.linea + ")" : ": sin línea")
                    }`}</title>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      {/* leyenda impresa: símbolos + votaciones numeradas */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "10px", fontSize: "11px", color: C.body }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "13px", height: "13px", borderRadius: "50%", border: `1.8px solid ${C.ink}` }}></span>ruptura documentada
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontWeight: 700, color: C.soft }}>✕</span> ausencia con lectura política
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "13px", height: "13px", borderRadius: "3px", background: "rgba(47,111,78,0.18)", border: `1px solid ${C.borderSoft}` }}></span>fondo: línea del bloque
        </span>
      </div>
      <div className="dt-num" style={{ marginTop: "8px", fontSize: "10.5px", color: C.ghost, lineHeight: 1.7 }}>
        {votCortos.map((c, i) => (
          <span key={i} style={{ marginRight: "12px", whiteSpace: "nowrap", display: "inline-block" }}>
            {i + 1} · {c}
          </span>
        ))}
      </div>
    </div>
  );
}
