"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function PatrimonioView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "1180px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Transparencia patrimonial</div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0", maxWidth: "860px" }}>Dieta, patrimonio y declaraciones juradas</h1>
      <p style={{ fontSize: "15px", color: "#78736A", lineHeight: 1.55, margin: "8px 0 0", maxWidth: "760px" }}>La dieta que fija la presidencia de la Cámara y el régimen de declaraciones juradas de la Ley de Ética Pública. Sin estimaciones propias: cada cifra con su fuente y la guía oficial para consultar la DDJJ de cualquier banca.</p>

      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "16px", marginTop: "26px", alignItems: "start" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "22px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Dieta mensual</div>
          <div className="dt-num" style={{ fontSize: "38px", fontWeight: 500, letterSpacing: "-0.01em", marginTop: "10px" }}>{V.patDietaMonto}</div>
          <div style={{ fontSize: "13.5px", color: "#57534E", marginTop: "4px" }}>{V.patDietaExtra}</div>
          <div className="dt-num" style={{ display: "inline-block", fontSize: "12px", color: "#57534E", background: "#F0EDE6", borderRadius: "20px", padding: "4px 12px", marginTop: "10px" }}>{V.patDietaNeto}</div>
          <div style={{ fontSize: "13px", color: "#78736A", lineHeight: 1.55, marginTop: "14px" }}>{V.patDietaNota}</div>
          <div style={{ borderTop: "1px solid #F2EFE9", marginTop: "16px", paddingTop: "14px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "6px" }}>Ausencias y dieta</div>
            <div style={{ fontSize: "13px", color: "#57534E", lineHeight: 1.55 }}>El reglamento de la Cámara establece que el diputado que se ausenta <strong>sin licencia</strong> pierde el derecho a la dieta por el tiempo que dure la ausencia (art. 20), y que las licencias se conceden con o sin goce de dieta (art. 17).</div>
            <a href="https://www.congreso.gob.ar/reglamentoDiputados.pdf" target="_blank" rel="noopener noreferrer" className="dt-num" style={{ display: "inline-block", fontSize: "11px", color: "#B45309", textDecoration: "none", borderBottom: "1px solid #F0D9B8", marginTop: "8px" }}>Reglamento HCDN — arts. 17–20 ↗</a>
          </div>
          <a href={V.patDietaU} target="_blank" rel="noopener noreferrer" className="dt-num" style={{ display: "inline-block", fontSize: "11px", color: "#B45309", textDecoration: "none", borderBottom: "1px solid #F0D9B8", marginTop: "14px" }}>{V.patDietaFuente} · {V.patDietaFecha} ↗</a>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Declaración Jurada Patrimonial Integral</div>
            <span className="dt-num" style={{ fontSize: "10.5px", color: "#A8A296" }}>Ley 25.188 · Ley 26.857</span>
          </div>
          <div style={{ fontSize: "13.5px", color: "#57534E", lineHeight: 1.55, marginTop: "10px" }}>Cada diputado declara bajo juramento su patrimonio ante la Secretaría Administrativa de la Cámara, en tres momentos:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: "14px", borderLeft: "1.5px solid #E2DDD2" }}>
            <div style={{ position: "relative", padding: "0 0 14px 20px" }}><span style={{ position: "absolute", left: "-5px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", background: "#B45309", border: "2px solid #FFFFFF" }}></span><div style={{ fontSize: "13px", fontWeight: 600 }}>Alta — al asumir</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "1px" }}>dentro de los 30 días hábiles de iniciar el mandato</div></div>
            <div style={{ position: "relative", padding: "0 0 14px 20px" }}><span style={{ position: "absolute", left: "-5px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", background: "#1C1A17", border: "2px solid #FFFFFF" }}></span><div style={{ fontSize: "13px", fontWeight: 600 }}>Actualización anual</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "1px" }}>cada año, a mitad de año, mientras dure la función</div></div>
            <div style={{ position: "relative", padding: "0 0 2px 20px" }}><span style={{ position: "absolute", left: "-5px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", background: "#1C1A17", border: "2px solid #FFFFFF" }}></span><div style={{ fontSize: "13px", fontWeight: 600 }}>Baja — al dejar la banca</div><div style={{ fontSize: "12px", color: "#78736A", marginTop: "1px" }}>dentro de los 30 días hábiles del cese</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "10px", overflow: "hidden", marginTop: "16px" }}>
            <div style={{ background: "#FFFFFF", padding: "13px 15px" }}><div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0F766E", marginBottom: "5px" }}>Parte pública</div><div style={{ fontSize: "12.5px", color: "#57534E", lineHeight: 1.5 }}>Bienes, ingresos y actividades. Consulta libre y gratuita para cualquier persona (Ley 26.857 y Ley 27.275).</div></div>
            <div style={{ background: "#FFFDF7", padding: "13px 15px" }}><div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958A", marginBottom: "5px" }}>Anexo reservado</div><div style={{ fontSize: "12.5px", color: "#57534E", lineHeight: 1.5 }}>Datos sensibles (domicilios, cuentas). Solo se entrega a requerimiento de autoridad judicial.</div></div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "14px", background: "#FFF6EA", border: "1px solid #F0D9B8", borderRadius: "10px", padding: "11px 14px" }}>
            <span style={{ color: "#B45309", fontWeight: 700, fontSize: "13px", lineHeight: 1.4 }}>§</span>
            <div style={{ fontSize: "12.5px", color: "#57534E", lineHeight: 1.5 }}>No presentarla o falsear datos es <strong>delito</strong>: 15 días a 2 años de prisión e inhabilitación especial perpetua (art. 268 (3) del Código Penal).</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "22px 24px", marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Cómo consultar la DDJJ de un diputado</div>
          <span style={{ fontSize: "11.5px", color: "#A8A296" }}>trámite administrado por la Oficina Anticorrupción</span>
        </div>
        <div className="dt-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "22px", marginTop: "16px" }}>
          <div style={{ display: "flex", gap: "12px" }}><span className="dt-num" style={{ fontSize: "15px", color: "#B45309", flexShrink: 0 }}>1</span><div style={{ fontSize: "13px", color: "#3A3733", lineHeight: 1.55 }}>Ingresar al <strong>buscador de DDJJ</strong> de la Oficina Anticorrupción y buscar por apellido.</div></div>
          <div style={{ display: "flex", gap: "12px" }}><span className="dt-num" style={{ fontSize: "15px", color: "#B45309", flexShrink: 0 }}>2</span><div style={{ fontSize: "13px", color: "#3A3733", lineHeight: 1.55 }}>Completar la solicitud de la <strong>parte pública</strong>: solo requiere identificarse e indicar el propósito de la consulta.</div></div>
          <div style={{ display: "flex", gap: "12px" }}><span className="dt-num" style={{ fontSize: "15px", color: "#B45309", flexShrink: 0 }}>3</span><div style={{ fontSize: "13px", color: "#3A3733", lineHeight: 1.55 }}>La OA informa el resultado del trámite y <strong>remite la DDJJ pública</strong> solicitada.</div></div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
          <a href="https://www2.jus.gov.ar/consultaddjj/Home/Busqueda" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1C1A17", color: "#FAFAF9", borderRadius: "10px", padding: "11px 18px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Buscador de DDJJ — OA ↗</a>
          <a href="https://www.hcdn.gob.ar/institucional/transparencia/declaraciones_juradas/index.html" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFFFFF", color: "#1C1A17", border: "1px solid #E0DBD0", borderRadius: "10px", padding: "11px 18px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Presentaciones en la HCDN ↗</a>
          <a href="https://www.argentina.gob.ar/servicio/consultar-declaraciones-juradas-de-funcionarios-publicos" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFFFFF", color: "#1C1A17", border: "1px solid #E0DBD0", borderRadius: "10px", padding: "11px 18px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Guía oficial del trámite ↗</a>
        </div>
        <div style={{ fontSize: "12px", color: "#A8A296", lineHeight: 1.55, marginTop: "14px" }}>Esta aplicación no publica montos patrimoniales por diputado: el sistema oficial entrega cada DDJJ a pedido y no como base de datos abierta. Cada ficha enlaza directamente el procedimiento oficial correspondiente.</div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "18px", alignItems: "center" }}>
        <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958A" }}>Marco legal</span>
        <span className="dt-num" style={{ fontSize: "11.5px", border: "1px solid #E2DDD2", background: "#FFFFFF", borderRadius: "20px", padding: "4px 12px", color: "#57534E" }}>Ley 25.188 — Ética Pública</span>
        <span className="dt-num" style={{ fontSize: "11.5px", border: "1px solid #E2DDD2", background: "#FFFFFF", borderRadius: "20px", padding: "4px 12px", color: "#57534E" }}>Ley 26.857 — carácter público de las DDJJ</span>
        <span className="dt-num" style={{ fontSize: "11.5px", border: "1px solid #E2DDD2", background: "#FFFFFF", borderRadius: "20px", padding: "4px 12px", color: "#57534E" }}>Ley 27.275 — acceso a la información</span>
        <span className="dt-num" style={{ fontSize: "11.5px", border: "1px solid #E2DDD2", background: "#FFFFFF", borderRadius: "20px", padding: "4px 12px", color: "#57534E" }}>Disp. Adm. HCDN 099/2017</span>
      </div>
    </div>
  );
}
