"use client";
import { C } from "@/lib/tokens";

// Badge de estado del feed y la agenda. Vocabulario cerrado a lo que las fuentes
// publican + el derivado "nuevo" (recencia calculada de datos, nunca de localStorage).
// El futuro no consumado (citada) es SIEMPRE outline dashed neutro: jamás un color
// de resultado sobre algo que todavía no pasó.
export type BadgeKind = "citada" | "aprobada" | "rechazada" | "fracasada" | "no_efectuada" | "nuevo";

const STYLES: Record<BadgeKind, { bg: string; fg: string; border: string; dashed?: boolean; label: string }> = {
  citada: { bg: "transparent", fg: C.accent, border: C.accent, dashed: true, label: "CITADA" },
  aprobada: { bg: "transparent", fg: C.voteAf, border: "transparent", label: "APROBADA" },
  rechazada: { bg: "transparent", fg: C.voteNeg, border: "transparent", label: "RECHAZADA" },
  fracasada: { bg: "transparent", fg: C.body, border: C.borderChip, label: "FRACASADA" },
  no_efectuada: { bg: "transparent", fg: C.body, border: C.borderChip, label: "NO EFECTUADA" },
  nuevo: { bg: C.accent, fg: "#FFFFFF", border: C.accent, label: "NUEVO" },
};

export default function Badge({ kind, label }: { kind: BadgeKind; label?: string }) {
  const s = STYLES[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "10.5px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: s.fg,
        background: s.bg,
        border: s.border === "transparent" ? "none" : `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
        borderRadius: "20px",
        padding: s.border === "transparent" ? "0" : "2px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {label || s.label}
    </span>
  );
}
