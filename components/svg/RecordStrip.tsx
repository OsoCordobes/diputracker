"use client";
import type { RecordRow } from "@/lib/charts";
import { C } from "@/lib/tokens";

// Tira de registro por bloque ("form guide"): una casilla por votación computable, en
// orden cronológico. Verde = línea afirmativa unificada, rojo = negativa, gris =
// abstención, partida en diagonal = el bloque se DIVIDIÓ (salta a la vista cuándo),
// contorno vacío = sin línea documentada. La barra de porcentaje dice "cuánto"; la
// tira dice "cuándo y en qué votación".
const CELL = 16;
const GAP = 3;

export default function RecordStrip({ rows, votCortos, onVotacion }: { rows: RecordRow[]; votCortos: string[]; onVotacion?: (idx: number) => void }) {
  const n = votCortos.length;
  const PAD_L = 168;
  const PAD_R = 64;
  const ROW_H = CELL + 10;
  const TOP = 8;
  const W = Math.max(720, PAD_L + n * (CELL + GAP) + PAD_R);
  const H = TOP + rows.length * ROW_H + 6;

  const fillDe = (l: string | null) => (l === "AF" ? C.voteAf : l === "NEG" ? C.voteNeg : l === "ABS" ? C.voteAbs : "none");

  return (
    <div style={{ overflowX: "auto" }} className="dt-scroll">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", minWidth: "680px", height: "auto", display: "block" }}
        role="img"
        aria-label={`Registro de líneas por bloque: ${rows.length} bloques por ${n} votaciones`}
      >
        {rows.map((r, ri) => {
          const y = TOP + ri * ROW_H;
          return (
            <g key={r.k}>
              <circle cx={8} cy={y + CELL / 2} r={4} fill={r.chip} />
              <text x={18} y={y + CELL / 2 + 3.5} fontSize={11.5} fontWeight={600} fill={C.inkSoft}>
                {r.corto.length > 18 ? r.corto.slice(0, 17) + "…" : r.corto}
              </text>
              {r.celdas.map((l, ci) => {
                const x = PAD_L + ci * (CELL + GAP);
                return (
                  <g key={ci} onClick={() => onVotacion?.(ci)} style={{ cursor: onVotacion ? "pointer" : "default" }}>
                    {l === "DIV" ? (
                      <>
                        {/* casilla partida en diagonal: el bloque se dividió */}
                        <path d={`M${x},${y} h${CELL} v${CELL} z`} fill={C.voteAf} opacity={0.75} />
                        <path d={`M${x},${y} v${CELL} h${CELL} z`} fill={C.voteNeg} opacity={0.75} />
                        <rect x={x} y={y} width={CELL} height={CELL} rx={3} fill="none" stroke={C.ink} strokeWidth={0.8} />
                      </>
                    ) : (
                      <rect
                        x={x}
                        y={y}
                        width={CELL}
                        height={CELL}
                        rx={3}
                        fill={l ? fillDe(l) : "#FFFFFF"}
                        stroke={l ? "rgba(28,26,23,0.18)" : C.borderChip}
                        strokeWidth={l ? 0.6 : 1.2}
                        strokeDasharray={l ? undefined : "2.5 2"}
                        opacity={l ? 0.92 : 1}
                      />
                    )}
                    <title>{`${r.corto} · ${votCortos[ci]} · ${l === "AF" ? "línea afirmativa" : l === "NEG" ? "línea negativa" : l === "ABS" ? "abstención" : l === "DIV" ? "bloque dividido" : "sin línea documentada"}`}</title>
                  </g>
                );
              })}
              <text x={W - 10} y={y + CELL / 2 + 4} textAnchor="end" fontSize={12.5} fontWeight={600} fill={r.pct == null ? C.ghostest : r.pct === 100 ? C.ink : r.pct >= 50 ? C.accent : C.voteNeg} className="dt-num">
                {r.pct == null ? "s/d" : r.pct + "%"}
              </text>
            </g>
          );
        })}
      </svg>
      {/* leyenda impresa (capturable) */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "10px", fontSize: "11px", color: C.body }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "3px", background: C.voteAf }}></span>afirmativa
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "3px", background: C.voteNeg }}></span>negativa
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "3px", background: C.voteAbs }}></span>abstención
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "3px", background: `linear-gradient(135deg, ${C.voteAf} 50%, ${C.voteNeg} 50%)` }}></span>dividido
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "11px", height: "11px", borderRadius: "3px", background: "#FFF", border: `1.2px dashed ${C.borderChip}` }}></span>s/d
        </span>
        <span className="dt-num" style={{ color: C.ghost }}>columnas en orden cronológico · cada casilla abre la votación</span>
      </div>
    </div>
  );
}
