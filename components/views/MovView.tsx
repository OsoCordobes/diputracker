"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function MovView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "980px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Recomposición de bloques</div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0" }}>Bloques, interbloques y movimientos</h1>

      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", margin: "30px 0 12px" }}>Interbloques oficiales</div>
      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {V.interCards.map((i: any, idx: number) => (
          <div key={idx} style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.01em" }}>{i.nombre}</div>
              <div className="dt-num" style={{ fontSize: "22px", fontWeight: 500 }}>{i.total}</div>
            </div>
            <div style={{ fontSize: "12px", color: "#8A857A", marginTop: "2px" }}>Preside: {i.pres}</div>
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginTop: "12px" }}>
              {i.chips.map((b: any, j: number) => (
                <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #E2DDD2", borderRadius: "20px", padding: "3px 10px", fontSize: "11.5px", color: "#57534E" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: b.chip }}></span>{b.short} <span className="dt-num" style={{ color: "#A8A296" }}>{b.count}</span></span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "11.5px", color: "#A8A296", marginTop: "10px" }}>{V.interbloquesFuenteNota}</div>

      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", margin: "36px 0 12px" }}>Movimientos registrados</div>
      <div style={{ borderLeft: "1.5px solid #E2DDD2" }}>
        {V.movFull.map((c: any, i: number) => (
          <div key={i} style={{ position: "relative", padding: "0 0 24px 28px" }}>
            <span style={{ position: "absolute", left: "-6px", top: "5px", width: "11px", height: "11px", borderRadius: "50%", background: "#1C1A17", border: "2px solid #FAFAF9" }}></span>
            <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296", letterSpacing: "0.03em" }}>{c.fecha}</div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "12px", padding: "15px 18px", marginTop: "7px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{c.titulo}</div>
              <div style={{ fontSize: "12.5px", color: "#57534E", marginTop: "5px", lineHeight: 1.5 }}>{c.nota}</div>
              <div className="dt-num" style={{ fontSize: "11px", color: "#A8A296", marginTop: "8px" }}>{c.fuente}</div>
            </div>
          </div>
        ))}
      </div>

      <div onClick={V.goPatrimonio} className="hov-dark" style={{ marginTop: "14px", background: "#1C1A17", color: "#FAFAF9", borderRadius: "14px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", cursor: "pointer", flexWrap: "wrap", transition: "background .2s" }}>
        <div>
          <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDBA74" }}>Dieta y patrimonio</div>
          <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "5px" }}>Dieta, régimen de DDJJ y guía de consulta oficial</div>
        </div>
        <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#FDBA74", whiteSpace: "nowrap" }}>Abrir Patrimonio →</span>
      </div>
    </div>
  );
}
