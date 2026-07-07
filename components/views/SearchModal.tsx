"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function SearchModal({ V }: { V: DTVals }) {
  if (!V.searchOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(28,26,23,0.34)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 20px 20px" }} onClick={V.closeSearch}>
      <div onClick={V.stop} className="dt-pop" style={{ width: "min(620px,100%)", background: "#FAFAF9", border: "1px solid #E7E3DB", borderRadius: "16px", boxShadow: "0 30px 80px -30px rgba(28,26,23,0.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #E7E3DB" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8A296" strokeWidth="2.2"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.5" y2="16.5"></line></svg>
          <input autoFocus value={V.query} onChange={V.onQuery} placeholder="Buscar por nombre, distrito o bloque" style={{ border: "none", outline: "none", background: "none", fontFamily: "inherit", fontSize: "17px", width: "100%", color: "#1C1A17" }} />
          {V.compareMode && (<span style={{ fontSize: "11px", fontWeight: 600, color: "#B45309", border: "1px solid #F0D9B8", background: "#FFF6EA", borderRadius: "20px", padding: "3px 10px", whiteSpace: "nowrap" }}>+ comparador</span>)}
        </div>
        <div className="dt-scroll" style={{ maxHeight: "420px", overflowY: "auto" }}>
          {V.hasResults && (<>
            {V.searchResults.map((r: any, i: number) => (
              <div key={i} onClick={r.onClick} className="hov-row-sel" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid #F2EFE9", background: r.selBg }}>
                <div className="dt-num" style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#FFFFFF", background: `${r.swatch} center/cover`, backgroundImage: r.fotoCss }}>{r.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ fontSize: "12px", color: "#8A857A" }}>{r.blocName} · {r.distrito}</div>
                </div>
                <span className="dt-num" style={{ fontSize: "15px", fontWeight: 500, color: r.idxColor }}>{r.indice}</span>
              </div>
            ))}
          </>)}
          {V.noResults && (
            <div style={{ padding: "46px 20px", textAlign: "center", color: "#A8A296", fontSize: "14px" }}>Sin resultados.</div>
          )}
        </div>
        <div style={{ padding: "10px 20px", borderTop: "1px solid #E7E3DB", fontSize: "11.5px", color: "#A8A296", display: "flex", justifyContent: "space-between" }}>
          <span>{V.searchCount}</span><span>↑↓ navegar · Enter abrir · Esc cerrar</span>
        </div>
      </div>
    </div>
  );
}
