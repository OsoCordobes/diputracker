"use client";
import type { DTVals } from "@/components/DipuTracker";
import { C } from "@/lib/tokens";

// Barra de filtros global del live post. Regla de capturabilidad: todo filtro activo
// se materializa como chip VISIBLE con ✕ — un dropdown cerrado nunca es el único
// rastro de un filtro en un screenshot. El estado vive en la URL (#/panel?per=…).
const pill = (activo: boolean) =>
  ({
    fontSize: "12px",
    background: activo ? C.ink : C.surface,
    color: activo ? C.paper : C.body,
    border: `1px solid ${activo ? C.ink : C.borderInput}`,
    borderRadius: "20px",
    padding: "5px 13px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .2s",
    whiteSpace: "nowrap" as const,
  }) as const;

const label = {
  fontSize: "10.5px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: C.faint,
  whiteSpace: "nowrap" as const,
};

export default function FilterBar({ V }: { V: DTVals }) {
  return (
    <div
      style={{
        position: "sticky",
        top: "62px",
        zIndex: 50,
        background: "rgba(250,250,249,0.92)",
        backdropFilter: "saturate(140%) blur(8px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "10px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px 14px", flexWrap: "wrap" }}>
        {/* período (gobierna todo: hemiciclo, feed, índices) */}
        <span style={label}>Período</span>
        <button onClick={V.perTodo} aria-pressed={V.perTodoBg === "#1C1A17"} className="dt-num" style={pill(V.perTodoBg === "#1C1A17")}>
          Todo · {V.perTodoCount}
        </button>
        <button onClick={V.perExt} aria-pressed={V.perExtBg === "#1C1A17"} className="dt-num" style={pill(V.perExtBg === "#1C1A17")}>
          Extraord. · {V.perExtCount}
        </button>
        <button onClick={V.perOrd} aria-pressed={V.perOrdBg === "#1C1A17"} className="dt-num" style={pill(V.perOrdBg === "#1C1A17")}>
          Ordinarias · {V.perOrdCount}
        </button>

        <span style={{ width: "1px", height: "20px", background: C.borderChip }}></span>

        {/* bloque: 6 grandes visibles + selector que materializa el elegido */}
        <span style={label}>Bloque</span>
        {V.feedBlocChips.map((b: { k: string; corto: string; chip: string; sel: boolean }) => (
          <button
            key={b.k}
            onClick={() => V.feedSetBloc(b.sel ? "" : b.k)}
            aria-pressed={b.sel}
            style={{ ...pill(b.sel), display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: b.chip, flexShrink: 0 }}></span>
            {b.corto}
            {b.sel && <span aria-hidden="true">✕</span>}
          </button>
        ))}
        <select
          value={V.feedBloc}
          onChange={(e) => V.feedSetBloc(e.target.value)}
          aria-label="Más bloques"
          style={{
            border: `1px solid ${C.borderInput}`,
            borderRadius: "20px",
            padding: "5px 9px",
            fontFamily: "inherit",
            fontSize: "12px",
            background: C.surface,
            color: C.muted,
            maxWidth: "110px",
          }}
        >
          <option value="">+ más</option>
          {V.feedBlocOptions.map((o: { value: string; label: string }) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <span style={{ width: "1px", height: "20px", background: C.borderChip }}></span>

        {/* tipo de item del feed */}
        <span style={label}>Feed</span>
        {[
          ["vot", "Votaciones"],
          ["ses", "Sesiones"],
          ["mov", "Movimientos"],
        ].map(([t, lab]) => {
          const activo = V.feedTipos.includes(t);
          return (
            <button key={t} onClick={() => V.feedToggleTipo(t)} aria-pressed={activo} style={pill(activo)}>
              {activo ? "✓ " : ""}
              {lab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
