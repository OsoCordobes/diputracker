"use client";
import type { DTData, Dep } from "@/lib/types";
import { voteView } from "@/lib/compute";

// Acompañamiento votación a votación (ficha del diputado): un marcador por votación,
// en orden cronológico. Arriba = coincidió con la posición del gobierno; abajo = se
// opuso; al medio = abstención, ausencia o votación que no computa. El color es el del
// voto emitido (la misma convención de toda la app); el anillo marca registro individual.
//
// Reemplaza al promedio acumulado del índice: con el índice a nivel bloque, 218 de las
// 257 fichas daban una línea perfectamente plana — un gráfico que no comunicaba nada.
export default function Sparkline({ D, d, P }: { D: DTData; d: Dep; P: number[]; daltonico?: boolean }) {
  const W = 380,
    H = 64;
  const padL = 74, // espacio para las etiquetas de banda
    padR = 10;
  const yTop = 14,
    yMid = H / 2,
    yBot = H - 14;
  const n = P.length;
  const x = (i: number) => padL + (W - padL - padR) * (n === 1 ? 0.5 : i / (n - 1));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Posición en cada votación, en orden cronológico: arriba acompañó la posición del gobierno, abajo se opuso, al medio abstención o ausencia."
    >
      <line x1={padL - 6} y1={yTop} x2={W - padR} y2={yTop} stroke="#EFEBE3" strokeWidth={1} strokeDasharray="3 3" />
      <line x1={padL - 6} y1={yBot} x2={W - padR} y2={yBot} stroke="#EFEBE3" strokeWidth={1} strokeDasharray="3 3" />
      <text x={0} y={yTop + 3} fontSize={9} fontFamily="var(--font-mono), monospace" letterSpacing="0.06em" fill="#A8A296">
        ACOMPAÑÓ
      </text>
      <text x={0} y={yBot + 3} fontSize={9} fontFamily="var(--font-mono), monospace" letterSpacing="0.06em" fill="#9B3022" opacity={0.7}>
        SE OPUSO
      </text>
      {P.map((vi, i) => {
        const xv = d.votes[vi];
        const vv = voteView(xv.v, xv.src);
        const computa = xv.v === "AF" || xv.v === "NEG";
        const coincide = computa && xv.v === D.votaciones[vi].gov;
        const cy = computa ? (coincide ? yTop : yBot) : yMid;
        const esExc = xv.src === "exc";
        const nota = computa ? (coincide ? " — acompañó" : " — se opuso") : "";
        return (
          <g key={i}>
            {xv.v == null ? (
              <circle cx={x(i)} cy={yMid} r={2.2} fill="#FFFFFF" stroke="#C9C4BA" strokeWidth={1} strokeDasharray="1.5 1.5" />
            ) : xv.v === "AUS" ? (
              <circle cx={x(i)} cy={yMid} r={3.8} fill="#FFFFFF" stroke="#1C1A17" strokeWidth={esExc ? 1.6 : 1} strokeDasharray="2 1.6" />
            ) : (
              <circle cx={x(i)} cy={cy} r={3.8} fill={vv.sw} stroke="#1C1A17" strokeWidth={esExc ? 1.6 : 0.5} strokeOpacity={esExc ? 1 : 0.35} />
            )}
            <title>{D.votaciones[vi].corto + " · " + vv.label + nota + (esExc ? " (registro individual)" : "")}</title>
          </g>
        );
      })}
    </svg>
  );
}
