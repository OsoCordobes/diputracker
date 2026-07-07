"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function FooterView({ V }: { V: DTVals }) {
  return (
    <div style={{ borderTop: "1px solid #E7E3DB", background: "#F5F3ED" }}>
      <div className="dt-g3" style={{ maxWidth: "1180px", margin: "0 auto", padding: "30px 28px 12px", display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "36px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}><span style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "17px" }}>DipuTracker</span><span style={{ fontSize: "9.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A958A", fontWeight: 600 }}>HCDN · 257 bancas</span></div>
          <div style={{ fontSize: "12.5px", color: "#78736A", lineHeight: 1.6, marginTop: "8px", maxWidth: "320px" }}>Registro del comportamiento legislativo, el peso relativo y el patrimonio declarado de cada banca de la Cámara de Diputados. Proyecto ciudadano independiente, sin afiliación con la HCDN ni con fuerza política alguna.</div>
          <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.6, marginTop: "10px" }}>La información de la HCDN es de dominio público y puede ser utilizada libremente citando la fuente.</div>
          <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.6, marginTop: "8px" }}>Cómo citar: <span style={{ color: "#78736A" }}>“DipuTracker, con datos oficiales de la HCDN (jul-2026)”</span></div>
          <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.6, marginTop: "4px" }}>Datos de esta app, abiertos: <a href="/data/diputados.json" target="_blank" rel="noopener noreferrer" className="dt-num" style={{ fontSize: "11px", textDecoration: "none", borderBottom: "1px solid #EDE7DA" }}>diputados.json</a> · <a href="/data/votaciones.json" target="_blank" rel="noopener noreferrer" className="dt-num" style={{ fontSize: "11px", textDecoration: "none", borderBottom: "1px solid #EDE7DA" }}>votaciones.json</a> · <a href="/data/contexto.json" target="_blank" rel="noopener noreferrer" className="dt-num" style={{ fontSize: "11px", textDecoration: "none", borderBottom: "1px solid #EDE7DA" }}>contexto.json</a></div>
        </div>
        <div>
          <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "10px" }}>Fuentes oficiales</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "12.5px" }}>
            <a href="https://www.diputados.gov.ar/diputados/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", borderBottom: "1px solid #EDE7DA", width: "fit-content" }}>Nómina y bloques — HCDN ↗</a>
            <a href="https://votaciones.hcdn.gob.ar" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", borderBottom: "1px solid #EDE7DA", width: "fit-content" }}>Actas de votación — HCDN ↗</a>
            <a href="https://datos.hcdn.gob.ar" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", borderBottom: "1px solid #EDE7DA", width: "fit-content" }}>Datos abiertos — HCDN ↗</a>
            <a href="https://www2.jus.gov.ar/consultaddjj/Home/Busqueda" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", borderBottom: "1px solid #EDE7DA", width: "fit-content" }}>DDJJ — Oficina Anticorrupción ↗</a>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "10px" }}>Explorar</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "12.5px" }}>
            <a href="#/indices" style={{ textDecoration: "none", color: "#57534E", width: "fit-content" }}>Índices y metodología</a>
            <a href="#/patrimonio" style={{ textDecoration: "none", color: "#57534E", width: "fit-content" }}>Patrimonio y dieta</a>
            <a href="#/simulador" style={{ textDecoration: "none", color: "#57534E", width: "fit-content" }}>Simulador de mayorías</a>
            <a href="#/comparador" style={{ textDecoration: "none", color: "#57534E", width: "fit-content" }}>Comparador de diputados</a>
            <a href="#/movimientos" style={{ textDecoration: "none", color: "#57534E", width: "fit-content" }}>Bloques y movimientos</a>
            <button onClick={V.downloadCsv} aria-live="polite" style={{ background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: "12.5px", color: "#B45309", cursor: "pointer", textAlign: "left", width: "fit-content", fontWeight: 600 }}>{V.csvLabelFooter}</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "14px 28px 26px", display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", borderTop: "1px solid #EDE9DF", marginTop: "16px" }}>
        <span className="dt-num" style={{ fontSize: "11px", color: "#A8A296" }}>Actualizado: {V.corte} · {V.nVots} votaciones computadas · próximo corte con el voto nominal completo</span>
        <span className="dt-num" style={{ fontSize: "11px", color: "#A8A296" }}>v4 · datos oficiales · fuentes citadas</span>
      </div>
    </div>
  );
}
