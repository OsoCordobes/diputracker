"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function VotacionView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "1180px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Votación · acta real</div>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", color: V.selResColor, textTransform: "uppercase", border: `1px solid ${V.selResBorder}`, borderRadius: "20px", padding: "2px 10px" }}>{V.selResLabel}</span>
      </div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0", maxWidth: "860px" }}>{V.selLawTitle}</h1>
      <div className="dt-num" style={{ fontSize: "13px", color: "#A8A296", marginTop: "6px" }}>{V.selLawDate} · {V.selLawSesion} · {V.selLawGov}</div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "22px" }}>
        {V.lawChips.map((l: any, i: number) => (
          <button key={i} onClick={l.onPick} style={{ border: `1px solid ${l.border}`, background: l.bg, color: l.fg, borderRadius: "9px", padding: "8px 13px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: l.weight, cursor: "pointer", maxWidth: "240px", textAlign: "left", lineHeight: 1.25 }}>{l.corto}</button>
        ))}
      </div>

      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "30px", marginTop: "30px", alignItems: "start" }}>
        <div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ background: "#FFFFFF", padding: "14px 16px" }}><div className="dt-num" style={{ fontSize: "30px", fontWeight: 500, color: "#2F6F4E" }}>{V.tAf}</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>Afirmativos</div></div>
              <div style={{ background: "#FFFFFF", padding: "14px 16px" }}><div className="dt-num" style={{ fontSize: "30px", fontWeight: 500, color: "#9B3022" }}>{V.tNeg}</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>Negativos</div></div>
              <div style={{ background: "#FFFFFF", padding: "14px 16px" }}><div className="dt-num" style={{ fontSize: "30px", fontWeight: 500, color: "#8A857A" }}>{V.tAbs}</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>Abstenciones</div></div>
              <div style={{ background: "#FFFFFF", padding: "14px 16px" }}><div className="dt-num" style={{ fontSize: "30px", fontWeight: 500, color: "#8A857A" }}>{V.tSv}</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>Sin voto / ausentes</div></div>
            </div>
            <div style={{ marginTop: "18px" }}>{V.miniHemi}</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px", fontSize: "11.5px", color: "#57534E" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#2F6F4E" }}></span>Afirmativo</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#9B3022" }}></span>Negativo</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#B8B2A6" }}></span>Abstención</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#FFFFFF", border: "1px dashed #1C1A17" }}></span>Ausencia doc.</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "repeating-linear-gradient(45deg,#E7E3DB 0 2px,#F7F5F0 2px 4px)", border: "1px solid #E2DDD2" }}></span>Sin posición asignable</span>
            </div>
            <div className="dt-num" style={{ textAlign: "center", fontSize: "11px", color: "#A8A296", marginTop: "10px" }}>{V.coverage}</div>
            <button onClick={V.shareVotCard} className="hov-dark" style={{ marginTop: "14px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#1C1A17", color: "#FAFAF9", border: "none", borderRadius: "9px", padding: "10px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", transition: "background .2s" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"></path><path d="M6 11l6 6 6-6"></path><path d="M4 21h16"></path></svg>{V.shareVotLabel}</button>
          </div>

          {V.hasExc && (
            <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "18px 20px", marginTop: "16px" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309", marginBottom: "10px" }}>Registros individuales</div>
              {V.excList.map((x: any, i: number) => (
                <div key={i} onClick={x.onClick} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid #F2EFE9", cursor: "pointer" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: x.fg, border: `1px solid ${x.border}`, background: x.bg, borderRadius: "20px", padding: "2px 9px", whiteSpace: "nowrap", flexShrink: 0, marginTop: "1px" }}>{x.label}</span>
                  <span style={{ fontSize: "12.5px", lineHeight: 1.4, color: "#3A3733" }}><strong>{x.nombre}</strong> <span style={{ color: "#78736A" }}>— {x.nota}</span></span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "18px 20px", marginTop: "16px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "8px" }}>Contexto y fuentes</div>
            {V.selNotas.map((n: any, i: number) => (
              <div key={i} style={{ fontSize: "12.5px", color: "#57534E", lineHeight: 1.5, padding: "4px 0", display: "flex", gap: "8px" }}><span style={{ color: "#B45309" }}>·</span><span>{n.t}</span></div>
            ))}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
              {V.selFuentes.map((f: any, i: number) => (
                <a key={i} href={f.u} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11.5px", color: "#B45309", textDecoration: "none", border: "1px solid #F0D9B8", background: "#FFF9F0", borderRadius: "20px", padding: "3px 11px" }}>{f.n} ↗</a>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "10px" }}>Posición por bloque</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "12px", overflow: "hidden" }}>
            {V.blocRows.map((b: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#FFFFFF" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: b.chip }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{b.nombre}</div>
                  {b.hasNota && (<div style={{ fontSize: "11.5px", color: "#8A857A", marginTop: "1px" }}>{b.nota}</div>)}
                </div>
                <span className="dt-num" style={{ fontSize: "11.5px", color: "#A8A296" }}>{b.count}</span>
                <span style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${b.border}`, background: b.bg, borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 600, color: b.fg, minWidth: "96px", justifyContent: "center" }}>{b.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "22px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", flex: 1 }}>Bancas · posición asignada</div>
            <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "1px solid #E0DBD0", borderRadius: "9px", padding: "7px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A296" strokeWidth="2.2"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.5" y2="16.5"></line></svg>
              <input value={V.vQuery} onChange={V.onVQuery} placeholder="Filtrar por nombre…" style={{ border: "none", outline: "none", background: "none", fontFamily: "inherit", fontSize: "13px", width: "100%", color: "#1C1A17" }} />
            </div>
            <select value={V.filterBloc} onChange={V.onFilterBloc} style={{ border: "1px solid #E0DBD0", borderRadius: "9px", padding: "8px 11px", fontFamily: "inherit", fontSize: "12.5px", background: "#FFFFFF", color: "#1C1A17" }}>
              {V.blocOptions.map((o: any, i: number) => (<option key={i} value={o.value}>{o.label}</option>))}
            </select>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "12px", marginTop: "12px", overflow: "hidden" }}>
            {V.votRows.map((r: any, i: number) => (
              <div key={i} onClick={r.onClick} className="hov-row" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderBottom: "1px solid #F2EFE9", cursor: "pointer" }}>
                <div className="dt-num" style={{ width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#FFFFFF", background: `${r.swatch} center/cover`, backgroundImage: r.fotoCss }}>{r.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.nombre}</div>
                  <div style={{ fontSize: "11.5px", color: "#8A857A" }}>{r.blocShort} · {r.distrito}</div>
                </div>
                <span title={r.srcTip} className="dt-num" style={{ fontSize: "10px", color: "#A8A296", border: "1px dashed #E0DBD0", borderRadius: "4px", padding: "1px 6px", flexShrink: 0 }}>{r.srcLabel}</span>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: `1px solid ${r.voteBorder}`, background: r.voteBg, borderRadius: "20px", padding: "3px 11px", minWidth: "92px", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: r.voteFg }}>{r.voteLabel}</span>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>{V.votCountLabel}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={V.prevPage} style={{ border: "1px solid #E0DBD0", background: "#FFFFFF", borderRadius: "8px", padding: "6px 12px", fontFamily: "inherit", fontSize: "12.5px", cursor: "pointer", color: "#57534E" }}>Anterior</button>
                <button onClick={V.nextPage} style={{ border: "1px solid #E0DBD0", background: "#FFFFFF", borderRadius: "8px", padding: "6px 12px", fontFamily: "inherit", fontSize: "12.5px", cursor: "pointer", color: "#57534E" }}>Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
