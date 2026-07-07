"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function ComparadorView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "1180px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Comparador</div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0" }}>Comparar diputados</h1>
      <p style={{ fontSize: "15px", color: "#78736A", margin: "8px 0 0" }}>Hasta tres bancas lado a lado. Los diputados se agregan desde el buscador.</p>
      {V.compareEmpty && (
        <>
          <div style={{ marginTop: "30px", border: "1px dashed #D8D3C8", borderRadius: "14px", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "15px", color: "#8A857A" }}>Aún no hay diputados seleccionados para comparar.</div>
            <button onClick={V.openSearchCompare} style={{ marginTop: "16px", background: "#1C1A17", color: "#FAFAF9", border: "none", borderRadius: "10px", padding: "12px 22px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>+ Agregar diputado</button>
          </div>
        </>
      )}
      {V.compareHas && (
        <>
          <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: V.compareCols, gap: "16px", marginTop: "26px", alignItems: "start" }}>
            {V.compareCards.map((c: any, i: number) => (
              <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="dt-num" style={{ width: "52px", height: "52px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "#FFFFFF", background: `${c.swatch} center/cover`, backgroundImage: c.fotoCss }}>{c.initials}</div>
                  <button onClick={c.onRemove} style={{ background: "none", border: "none", color: "#B0AB9F", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>✕</button>
                </div>
                <div onClick={c.onOpen} style={{ fontSize: "16px", fontWeight: 600, marginTop: "12px", lineHeight: 1.2, cursor: "pointer" }}>{c.nombre}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: "12px", color: "#57534E", flexWrap: "wrap" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: c.chip }}></span>{c.blocName} · {c.distrito}</div>
                <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span className="dt-num" style={{ fontSize: "34px", fontWeight: 500 }}>{c.indice}</span>
                  <span style={{ fontSize: "11px", color: "#A8A296" }}>{c.indiceNota}</span>
                </div>
                <div style={{ fontSize: "12.5px", color: "#78736A", marginTop: "3px" }}>{c.label}</div>
                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #F2EFE9" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "8px" }}>Posición en cada votación</div>
                  {c.votes.map((vv: any, j: number) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                      <span style={{ width: "13px", height: "13px", borderRadius: "3px", flexShrink: 0, background: vv.sw, border: `1px solid ${vv.border}` }}></span>
                      <span style={{ fontSize: "12px", color: "#57534E", flex: 1, lineHeight: 1.15 }}>{vv.corto}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: vv.fg }}>{vv.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {V.canAddCompare && (
              <>
                <button onClick={V.openSearchCompare} style={{ background: "#FBF9F4", border: "1px dashed #D8D3C8", borderRadius: "14px", padding: "30px 16px", fontFamily: "inherit", fontSize: "14px", color: "#8A857A", cursor: "pointer", minHeight: "120px" }}>+ Agregar</button>
              </>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
            <button onClick={V.copyCompareLink} title="Esta comparación tiene URL propia: copiala y compartila" className="dt-num" style={{ background: "#F0EDE6", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", color: "#57534E", fontSize: "11.5px" }}>{V.compareLinkLabel}</button>
          </div>
        </>
      )}
    </div>
  );
}
