"use client";
import type { DTVals } from "@/components/DipuTracker";

const REPO_URL = "https://github.com/OsoCordobes/diputracker";

const card: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px" };
const kicker: React.CSSProperties = { fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", margin: "36px 0 12px" };
const body: React.CSSProperties = { fontSize: "13.5px", color: "#57534E", lineHeight: 1.65 };

export default function ComoSeHizoView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "980px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Transparencia del proyecto</div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0" }}>Cómo se hizo DipuTracker</h1>
      <p style={{ ...body, fontSize: "15px", maxWidth: "640px", marginTop: "14px" }}>
        DipuTracker es un proyecto ciudadano independiente hecho desde Córdoba por una persona
        trabajando codo a codo con inteligencia artificial. Esta página cuenta exactamente qué
        hizo la IA, qué no hace nunca, y cómo cualquiera puede auditar el resultado.
      </p>

      <div style={kicker}>Humano + IA</div>
      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={card}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Construido en colaboración con Claude</div>
          <p style={{ ...body, marginTop: "8px" }}>
            El diseño, el código y la infraestructura de datos se desarrollaron en colaboración
            con <strong>Claude (Fable 5)</strong>, el modelo de IA de Anthropic: desde el motor de
            cálculo del índice y el poder de bisagra hasta el hemiciclo interactivo y esta misma página.
          </p>
        </div>
        <div style={card}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Curaduría verificada con agentes</div>
          <p style={{ ...body, marginTop: "8px" }}>
            Cada votación del dataset fue contrastada por agentes de IA contra múltiples fuentes
            independientes — actas oficiales de la HCDN más cobertura de prensa (Chequeado,
            Parlamentario, Infobae, Ámbito, La Nación, Letra P) — y las discrepancias se
            corrigieron citando la evidencia en el historial público de cambios.
          </p>
        </div>
      </div>

      <div style={kicker}>La línea roja: la IA no inventa datos</div>
      <div style={{ ...card, background: "#1C1A17", border: "none", color: "#FAFAF9" }}>
        <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDBA74" }}>Principio del proyecto</div>
        <div style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "19px", fontWeight: 600, marginTop: "8px", lineHeight: 1.4 }}>
          Solo datos reales, con fuente. Nada se estima ni se completa con IA.
        </div>
        <p style={{ fontSize: "13px", color: "#C9C4BA", lineHeight: 1.65, marginTop: "10px", marginBottom: 0 }}>
          Los modelos de lenguaje pueden equivocarse; por eso acá ningún dato sale de un modelo.
          Cada cifra proviene de una fuente oficial o periodística citada, cada votación enlaza su
          acta, y un validador automático rechaza cualquier actualización que no cierre: 257 bancas
          exactas, identificadores únicos, bloques válidos, sumas de votos consistentes y fuentes
          obligatorias. Si algo no tiene fuente, no computa — la metodología publica qué mide y qué no.
        </p>
      </div>

      <div style={kicker}>Pipeline autónomo, registro público</div>
      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={card}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Actualización automática 2×/día</div>
          <p style={{ ...body, marginTop: "8px" }}>
            Rutinas programadas consultan las fuentes oficiales de la HCDN dos veces por día,
            detectan sesiones nuevas y cambios de nómina, validan los invariantes y solo publican
            si todo cierra. Las votaciones nuevas siempre pasan por curaduría humana antes de
            computar en el índice.
          </p>
        </div>
        <div style={card}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>Auditable por cualquiera</div>
          <p style={{ ...body, marginTop: "8px" }}>
            El código es abierto (MIT) y los datasets viven versionados en el repositorio: cada
            actualización queda registrada — qué cambió, cuándo y con qué fuente. Los {V.nVots ?? ""}
            {" "}registros de votación y la nómina completa se sirven como API pública de datos
            abiertos, documentada campo por campo.
          </p>
        </div>
      </div>

      <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "36px" }}>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hov-dark" style={{ background: "#1C1A17", color: "#FAFAF9", borderRadius: "14px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", textDecoration: "none", flexWrap: "wrap", transition: "background .2s" }}>
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDBA74" }}>Código y datos</div>
            <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "5px" }}>Repositorio público con todo el historial</div>
          </div>
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#FDBA74", whiteSpace: "nowrap" }}>Abrir en GitHub ↗</span>
        </a>
        <div onClick={V.goIndices} className="hov-dark" style={{ background: "#1C1A17", color: "#FAFAF9", borderRadius: "14px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", cursor: "pointer", flexWrap: "wrap", transition: "background .2s" }}>
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FDBA74" }}>Metodología</div>
            <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "5px" }}>Qué mide cada índice — y qué no permite afirmar</div>
          </div>
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#FDBA74", whiteSpace: "nowrap" }}>Ver los índices →</span>
        </div>
      </div>

      <div style={{ fontSize: "11.5px", color: "#A8A296", marginTop: "14px" }}>
        Datos al {V.corte} · proyecto sin afiliación con la HCDN ni con fuerza política alguna.
      </div>
    </div>
  );
}
