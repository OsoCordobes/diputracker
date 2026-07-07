"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function SimuladorView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "1180px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Simulador de mayorías</div>
        <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", color: "#0F766E", background: "#EDF6F0", border: "1px solid #BFE0D0", borderRadius: "20px", padding: "3px 10px" }}>datos reales · composición HCDN</span>
      </div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0", maxWidth: "820px" }}>Simulación de votación, bloque por bloque</h1>
      <p style={{ fontSize: "15px", color: "#78736A", lineHeight: 1.55, margin: "8px 0 0", maxWidth: "720px" }}>Se asigna a cada bloque una posición —afirmativo, negativo, abstención o ausencia— y el hemiciclo indica en vivo si el oficialismo alcanza los <strong>129</strong> votos (mayoría simple) o los <strong>172</strong> (dos tercios). Las 257 bancas corresponden a la composición real.</p>

      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "22px", alignItems: "start" }}>
        <div>
          <div style={{ background: V.simVerdictBg, border: `1px solid ${V.simVerdictBorder}`, borderRadius: "14px", padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "19px", fontWeight: 700, color: V.simVerdictColor, letterSpacing: "-0.01em" }}>{V.simVerdict}</div>
                <div className="dt-num" style={{ fontSize: "12.5px", color: "#57534E", marginTop: "3px" }}>{V.simVerdictSub}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}><div className="dt-num" style={{ fontSize: "34px", fontWeight: 600, color: V.simVerdictColor, lineHeight: 1 }}>{V.simAf}</div><div style={{ fontSize: "11px", color: "#78736A" }}>a favor</div></div>
            </div>
            <div style={{ position: "relative", height: "22px", borderRadius: "6px", background: "#F0EDE6", marginTop: "18px", overflow: "visible" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "6px", overflow: "hidden", display: "flex" }}>
                <div style={{ width: V.simAfW, background: "#2F6F4E" }}></div>
                <div style={{ width: V.simAbsW, background: "#E7E3DB" }}></div>
                <div style={{ width: V.simNegW, background: "#9B3022" }}></div>
              </div>
              <div style={{ position: "absolute", left: V.sim129Left, top: "-5px", bottom: "-5px", borderLeft: "2px dashed #1C1A17" }}></div>
              <div style={{ position: "absolute", left: V.sim172Left, top: "-5px", bottom: "-5px", borderLeft: "2px dashed #8A857A" }}></div>
            </div>
            <div style={{ position: "relative", height: "14px", marginTop: "3px" }}>
              <span className="dt-num" style={{ position: "absolute", left: V.sim129Left, transform: "translateX(-50%)", fontSize: "10px", color: "#1C1A17" }}>129</span>
              <span className="dt-num" style={{ position: "absolute", left: V.sim172Left, transform: "translateX(-50%)", fontSize: "10px", color: "#8A857A" }}>172</span>
            </div>
            <div className="dt-num" style={{ display: "flex", gap: "14px", marginTop: "8px", fontSize: "11.5px", color: "#57534E", flexWrap: "wrap" }}>
              <span><span style={{ color: "#2F6F4E", fontWeight: 600 }}>{V.simAf}</span> afirm.</span>
              <span><span style={{ color: "#9B3022", fontWeight: 600 }}>{V.simNeg}</span> neg.</span>
              <span><span style={{ color: "#8A857A", fontWeight: 600 }}>{V.simAbs}</span> abst.</span>
              <span><span style={{ color: "#8A857A", fontWeight: 600 }}>{V.simAus}</span> ausentes</span>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "18px", marginTop: "12px" }}>
            <div>{V.simHemi}</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px", fontSize: "11.5px", color: "#57534E" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#2F6F4E" }}></span>A favor</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#9B3022" }}></span>En contra</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#C4BEB2" }}></span>Abstención</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#FFFFFF", border: "1px dashed #1C1A17" }}></span>Ausente</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
            <button onClick={V.simLaboral} style={{ border: "1px solid #E0DBD0", background: "#FFFFFF", borderRadius: "9px", padding: "8px 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", color: "#1C1A17" }}>Reforma laboral (feb-2026)</button>
            <button onClick={V.simGov} style={{ border: "1px solid #E0DBD0", background: "#FFFFFF", borderRadius: "9px", padding: "8px 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", color: "#1C1A17" }}>Oficialismo + aliados</button>
            <button onClick={V.simReset} style={{ border: "1px solid #E0DBD0", background: "#FFFFFF", borderRadius: "9px", padding: "8px 13px", fontFamily: "inherit", fontSize: "12.5px", cursor: "pointer", color: "#57534E" }}>Reiniciar</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A" }}>Asignar posición por bloque</div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600 }}>{V.simPivotCount} bloque(s) pivote</div>
          </div>
          <div className="dt-scroll" style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "12px", overflow: "hidden", maxHeight: "520px", overflowY: "auto" }}>
            {V.simRows.map((r: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", background: "#FFFFFF" }}>
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: r.chip }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><span style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.nombre}</span>{r.pivotal && (<span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em", color: "#B45309", background: "#FFF6EA", border: "1px solid #F0D9B8", borderRadius: "4px", padding: "1px 5px", whiteSpace: "nowrap" }}>PIVOTE</span>)}</div>
                  <div className="dt-num" style={{ fontSize: "11px", color: "#A8A296" }}>{r.count}</div>
                </div>
                <div style={{ display: "flex", gap: "2px", background: "#F0EDE6", borderRadius: "7px", padding: "2px", flexShrink: 0 }}>
                  <button onClick={r.setAf} aria-pressed={r.afBg !== "#FFFFFF"} title="A favor" style={{ border: "none", borderRadius: "5px", width: "30px", height: "26px", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontWeight: 600, background: r.afBg, color: r.afFg }}>AF</button>
                  <button onClick={r.setNeg} aria-pressed={r.negBg !== "#FFFFFF"} title="En contra" style={{ border: "none", borderRadius: "5px", width: "30px", height: "26px", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontWeight: 600, background: r.negBg, color: r.negFg }}>NG</button>
                  <button onClick={r.setAbs} aria-pressed={r.absBg !== "#FFFFFF"} title="Abstención" style={{ border: "none", borderRadius: "5px", width: "30px", height: "26px", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontWeight: 600, background: r.absBg, color: r.absFg }}>AB</button>
                  <button onClick={r.setAus} aria-pressed={r.ausBg !== "#FFFFFF"} title="Ausente" style={{ border: "none", borderRadius: "5px", width: "30px", height: "26px", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontWeight: 600, background: r.ausBg, color: r.ausFg }}>AU</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.5, marginTop: "12px", display: "flex", gap: "7px" }}><span style={{ color: "#B45309" }}>●</span> <span><strong style={{ color: "#57534E" }}>Pivote</strong> = con los votos actuales, este bloque puede por sí solo cruzar (o sostener) el umbral de 129. El simulador opera a nivel de bloque; el voto nominal individual se incorpora con las actas.</span></div>
        </div>
      </div>
    </div>
  );
}
