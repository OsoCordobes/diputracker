"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function TopChrome({ V }: { V: DTVals }) {
  return (
    <>
      {/* ===================== REAL DATA STRIP ===================== */}
      <div style={{ background: "#1C1A17", color: "#D8D3C8", fontSize: "11.5px", letterSpacing: "0.02em", padding: "7px 28px", textAlign: "center" }}>
        <span style={{ color: "#FDBA74", fontWeight: 600 }}>DATOS OFICIALES HCDN</span> · 257 bancas · {V.nVots} votaciones reales: extraordinarias dic-2025→feb-2026 + ordinarias abr→jun 2026 · índice provisional a nivel bloque, con registros individuales documentados{V.verificadoHm ? <> · <span style={{ color: "#8FD4A8" }}>●</span> verificado {V.verificadoHm} · 2×/día</> : null} · <a href="#/indices" style={{ color: "#FDBA74", textDecoration: "none", borderBottom: "1px solid rgba(253,186,116,0.45)" }}>metodología</a>
      </div>

      {/* ===================== TOP NAV ===================== */}
      <div style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(250,250,249,0.86)", backdropFilter: "saturate(140%) blur(10px)", borderBottom: "1px solid #E7E3DB" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "8px 28px", minHeight: "62px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 24px" }}>
          <div onClick={V.goHome} style={{ display: "flex", alignItems: "baseline", gap: "9px", cursor: "pointer", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "20px", letterSpacing: "-0.01em" }}>DipuTracker</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A958A", fontWeight: 600, paddingTop: "2px" }}>HCDN · 257 bancas</span>
          </div>
          <div style={{ display: "flex", gap: "4px", marginLeft: "6px" }}>
            <button onClick={V.goHome} style={{ background: V.navHomeBg, color: V.navHomeFg, border: "none", borderRadius: "7px", padding: "7px 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, cursor: "pointer", letterSpacing: "0.01em" }}>Panel</button>
            <button onClick={V.goIndices} style={{ background: V.navIdxBg, color: V.navIdxFg, border: "none", borderRadius: "7px", padding: "7px 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>Índices</button>
            <button onClick={V.goVotacion} style={{ background: V.navVotBg, color: V.navVotFg, border: "none", borderRadius: "7px", padding: "7px 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>Votaciones</button>
            <button onClick={V.goPatrimonio} style={{ background: V.navPatBg, color: V.navPatFg, border: "none", borderRadius: "7px", padding: "7px 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>Patrimonio</button>
            <button onClick={V.goSimulador} style={{ background: V.navSimBg, color: V.navSimFg, border: "none", borderRadius: "7px", padding: "7px 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>Simulador</button>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={V.openSearch} className="hov-border" style={{ display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF", border: "1px solid #E0DBD0", borderRadius: "8px", padding: "8px 13px", cursor: "pointer", color: "#8A857A", fontFamily: "inherit", fontSize: "13px", minWidth: 0, textAlign: "left" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8A296" strokeWidth="2.2"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.5" y2="16.5"></line></svg>
              <span className="dt-searchlabel" style={{ flex: 1, whiteSpace: "nowrap" }}>Buscar por nombre, distrito o bloque</span>
              <span className="dt-num" style={{ fontSize: "11px", border: "1px solid #E0DBD0", borderRadius: "4px", padding: "1px 5px", color: "#B0AB9F" }}>⌘K</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== LOADING / ERROR ===================== */}
      {V.loading && (
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "54px 28px" }}>
          <div style={{ height: "120px", borderRadius: "14px", background: "linear-gradient(100deg,#F4F1EB 30%,#FBF9F4 50%,#F4F1EB 70%)", backgroundSize: "1400px 100%", animation: "dtShimmer 1.4s infinite linear" }}></div>
          <div style={{ height: "420px", marginTop: "20px", borderRadius: "14px", background: "linear-gradient(100deg,#F4F1EB 30%,#FBF9F4 50%,#F4F1EB 70%)", backgroundSize: "1400px 100%", animation: "dtShimmer 1.4s infinite linear" }}></div>
          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "13px", color: "#A8A296" }}>Cargando datos oficiales de la HCDN…</div>
        </div>
      )}
      {V.loadError && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>No se pudieron cargar los datos.</div>
          <div style={{ fontSize: "13.5px", color: "#78736A", marginTop: "8px" }}>Verifique que exista la carpeta <span className="dt-num">data/</span> con diputados.json, votaciones.json y contexto.json.</div>
        </div>
      )}
    </>
  );
}
