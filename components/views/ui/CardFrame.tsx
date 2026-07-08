"use client";
import type { ReactNode } from "react";
import { C, R, SHADOW_CARD } from "@/lib/tokens";

// Marco estándar de toda card "capturable" (modo captura implícito, sin botón export):
//  1. los filtros APLICADOS se imprimen como chips DENTRO de la card — un dropdown
//     cerrado no cuenta como rastro del filtro en un screenshot;
//  2. fuente + fecha de corte en el pie de CADA card, no solo en el footer de página;
//  3. ninguna cifra clave debe vivir solo en un tooltip (responsabilidad del contenido).
// El encuadre a mano debe salir limpio a cualquier ancho >= 360px.
export default function CardFrame({
  kicker,
  title,
  chips = [],
  meta,
  corte,
  children,
}: {
  kicker?: string;
  title: string;
  chips?: string[]; // filtros aplicados, legibles en la captura
  meta?: string; // texto mono arriba a la derecha (ej: "257 bancas")
  corte: string; // fecha de corte visible en el pie
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: `${R.card}px`,
        padding: "20px 22px 14px",
        boxShadow: SHADOW_CARD,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
        <div>
          {kicker && (
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent }}>
              {kicker}
            </div>
          )}
          <div style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em", marginTop: kicker ? "3px" : 0 }}>{title}</div>
        </div>
        {meta && (
          <div className="dt-num" style={{ fontSize: "12px", color: C.ghost, whiteSpace: "nowrap" }}>
            {meta}
          </div>
        )}
      </div>
      {chips.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
          {chips.map((c, i) => (
            <span
              key={i}
              className="dt-num"
              style={{
                fontSize: "11px",
                color: C.body,
                background: C.chipBg,
                border: `1px solid ${C.borderChip}`,
                borderRadius: "20px",
                padding: "2px 10px",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
      <div style={{ marginTop: "14px" }}>{children}</div>
      <div
        className="dt-num"
        style={{
          marginTop: "14px",
          paddingTop: "10px",
          borderTop: `1px solid ${C.borderSoft}`,
          fontSize: "10.5px",
          color: C.ghost,
          letterSpacing: "0.02em",
        }}
      >
        diputracker.vercel.app · datos oficiales HCDN · corte {corte}
      </div>
    </div>
  );
}
