"use client";
import { useEffect, useState } from "react";
import type { DTVals } from "@/components/DipuTracker";
import { countdownLabel } from "@/lib/feed";
import { fdate } from "@/lib/compute";
import Badge from "@/components/views/ui/Badge";
import { C, SHADOW_CARD } from "@/lib/tokens";

// "AHORA — Estado del recinto": la card protagonista del live post. Tres celdas:
// última sesión con votaciones, próxima citación (countdown honesto o vacío honesto)
// y frescura de los datos. Todo derivado de datos — nada especulativo.
export default function AhoraCard({ V }: { V: DTVals }) {
  // tick de 60 s SOLO mientras la card está montada: refresca el countdown sin red
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  // marco temporal ART: el "hoy" del recinto, no el del navegador
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  const u = V.ahoraUltima;
  const p = V.ahoraProxima;

  const celda = { padding: "16px 20px", minWidth: 0 } as const;
  const kicker = {
    fontSize: "10.5px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: C.faint,
    marginBottom: "7px",
  };

  return (
    <div
      className="dt-g3"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "1px",
        background: C.borderSoft,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: SHADOW_CARD,
      }}
    >
      {/* ÚLTIMA SESIÓN */}
      <div style={{ ...celda, background: C.surface, cursor: u ? "pointer" : "default" }} onClick={u?.onOpen} className={u ? "hov-row" : undefined}>
        <div style={kicker}>Última sesión con votaciones</div>
        {u ? (
          <>
            <div className="dt-num" style={{ fontSize: "12px", color: C.ghost }}>
              {u.fecha}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "3px", lineHeight: 1.3 }}>{u.corto}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
              <Badge kind={u.resultado === "aprobada" ? "aprobada" : "rechazada"} />
              <span className="dt-num" style={{ fontSize: "12px", color: C.body }}>
                {u.totales}
              </span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: "13px", color: C.ghost }}>—</div>
        )}
      </div>

      {/* PRÓXIMA CITACIÓN */}
      <div style={{ ...celda, background: p ? C.cream : C.surface }}>
        <div style={kicker}>Próxima citación</div>
        {p ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Badge kind="citada" />
              <span className="dt-num" style={{ fontSize: "12px", color: C.ghost }}>
                {fdate(p.fecha)}
              </span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "5px", lineHeight: 1.3 }}>{p.titulo.replace(/\s*CITADA\s*$/i, "")}</div>
            <div className="dt-num" style={{ fontSize: "13px", fontWeight: 600, color: C.accent, marginTop: "5px" }}>
              ⏳ {countdownLabel(p.fecha, hoy)}
            </div>
            {p.temas.length > 0 && (
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "4px" }}>
                {p.temas.length} tema{p.temas.length === 1 ? "" : "s"} en el Plan de Labor
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: "15px", fontWeight: 600, color: C.ghost, marginTop: "2px" }}>—</div>
            <div style={{ fontSize: "12.5px", color: C.muted, lineHeight: 1.45, marginTop: "4px" }}>
              Sin convocatoria publicada al corte. Se revisa la fuente oficial 2×/día.
            </div>
          </>
        )}
      </div>

      {/* DATOS */}
      <div style={{ ...celda, background: C.surface }}>
        <div style={kicker}>Datos</div>
        {V.verificadoHm ? (
          <div style={{ fontSize: "13px", color: C.inkSoft, fontWeight: 600 }}>
            <span style={{ color: C.voteAf }}>✓</span> verificados <span className="dt-num">{V.verificadoHm}</span>
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: C.inkSoft, fontWeight: 600 }}>
            <span style={{ color: C.voteAf }}>✓</span> corte {V.corte}
          </div>
        )}
        <div className="dt-num" style={{ fontSize: "12px", color: C.body, marginTop: "5px" }}>
          {V.nVots} votaciones · 257 bancas · 20 bloques
        </div>
        <div style={{ fontSize: "11.5px", color: C.ghost, marginTop: "5px", lineHeight: 1.45 }}>
          Sincronización automática contra fuentes oficiales HCDN, 2 veces por día.
        </div>
      </div>
    </div>
  );
}
