"use client";
import { useEffect, useRef } from "react";
import type { DTVals } from "@/components/DipuTracker";

function trapTab(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== "Tab") return;
  const focusables = [...e.currentTarget.querySelectorAll<HTMLElement>('button, input, a[href], [tabindex="0"]')];
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export default function FichaDrawer({ V }: { V: DTVals }) {
  const drawerRef = useRef<HTMLDivElement>(null);
  // Opener capturado en el primer render, antes de que el drawer robe el foco.
  const openerRef = useRef<HTMLElement | null>(typeof document !== "undefined" ? (document.activeElement as HTMLElement) : null);
  useEffect(() => {
    if (V.fichaOpen) drawerRef.current?.focus();
  }, [V.fichaOpen, V.fNombre]);
  // Al cerrar el drawer, el foco vuelve al elemento que lo abrió (banca, fila, resultado).
  useEffect(() => {
    const opener = openerRef.current;
    return () => opener?.focus?.();
  }, []);
  return (
    <>
      {V.fichaOpen && (
        <>
          <div className="dt-fade" style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(28,26,23,0.32)", backdropFilter: "blur(2px)" }} onClick={V.closeFicha}></div>
          <div ref={drawerRef} onKeyDown={trapTab} role="dialog" aria-modal="true" aria-label={"Ficha del diputado " + V.fNombre} tabIndex={-1} className="dt-scroll dt-drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 81, width: "min(480px,100vw)", background: "#FAFAF9", borderLeft: "1px solid #E7E3DB", boxShadow: "-30px 0 60px -30px rgba(28,26,23,0.3)", overflowY: "auto", outline: "none" }}>
            <div style={{ position: "sticky", top: 0, background: "rgba(250,250,249,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid #E7E3DB", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A958A" }}>Ficha del diputado</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button onClick={V.shareCard} aria-live="polite" title="Descargar tarjeta PNG lista para redes o una nota" className="dt-num" style={{ background: "#1C1A17", border: "none", borderRadius: "8px", height: "30px", padding: "0 12px", cursor: "pointer", color: "#FAFAF9", fontSize: "11.5px" }}>{V.shareLabel}</button>
                <button onClick={V.copyCita} aria-live="polite" title="Copiar resumen citable para una nota" className="dt-num" style={{ background: "#F0EDE6", border: "none", borderRadius: "8px", height: "30px", padding: "0 12px", cursor: "pointer", color: "#57534E", fontSize: "11.5px" }}>{V.citaLabel}</button>
                <button onClick={V.copyLink} aria-live="polite" title="Copiar link directo" className="dt-num" style={{ background: "#F0EDE6", border: "none", borderRadius: "8px", height: "30px", padding: "0 12px", cursor: "pointer", color: "#57534E", fontSize: "11.5px" }}>{V.copyLabel}</button>
                <button onClick={V.closeFicha} style={{ background: "#F0EDE6", border: "none", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer", color: "#57534E", fontSize: "15px" }}>✕</button>
              </div>
            </div>
            <div style={{ padding: "24px 26px 50px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div className="dt-num" style={{ width: "74px", height: "74px", borderRadius: "14px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "23px", color: "#FFFFFF", background: `${V.fSwatch} center/cover`, backgroundImage: V.fFotoCss, border: "1px solid #E7E3DB" }}>{V.fInitials}</div>
                <div style={{ flex: 1 }}>
                  {V.fHasRole && (<div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>{V.fRole}</div>)}
                  <h2 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "24px", lineHeight: 1.1, margin: "3px 0 0" }}>{V.fNombre}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #E2DDD2", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", color: "#57534E" }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", background: V.fChip }}></span>{V.fBloc}</span>
                    <span style={{ fontSize: "12.5px", color: "#8A857A" }}>{V.fDistrito}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px", flexWrap: "wrap" }}>
                    <span className="dt-num" style={{ fontSize: "11px", color: "#78736A", border: "1px solid #E7E3DB", background: "#FFFFFF", borderRadius: "20px", padding: "2px 10px" }}>mandato {V.fMandato}</span>
                    {V.fHasInter && (<span style={{ fontSize: "11px", color: "#78736A", border: "1px solid #E7E3DB", background: "#FFFFFF", borderRadius: "20px", padding: "2px 10px" }}>interbloque {V.fInter}</span>)}
                    {V.fRecien && (<span style={{ fontSize: "11px", fontWeight: 600, color: "#B45309", border: "1px solid #F0D9B8", background: "#FFF6EA", borderRadius: "20px", padding: "2px 10px" }}>asumió {V.fInicia}</span>)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "22px", background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A" }}>Índice de alineamiento</div>
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", color: "#B45309", border: "1px solid #F0D9B8", background: "#FFF6EA", borderRadius: "20px", padding: "2px 8px" }}>PROVISIONAL</span>
                </div>
                {V.fHasIndice && (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "8px" }}>
                      <span className="dt-num" style={{ fontSize: "40px", fontWeight: 500, lineHeight: 1 }}>{V.fIndice}</span>
                      <span className="dt-num" style={{ fontSize: "14px", color: "#A8A296" }}>/ 100</span>
                      <span className="dt-num" style={{ fontSize: "11.5px", color: "#A8A296", marginLeft: "auto" }}>{V.fCounted}</span>
                    </div>
                    <div style={{ height: "11px", borderRadius: "6px", marginTop: "12px", background: "linear-gradient(90deg,#0F766E,#14B8A6,#5EEAD4,#E7E5E4,#FDBA74,#F59E0B,#B45309)", position: "relative" }}>
                      <span style={{ position: "absolute", top: "-3px", left: V.fIndicePos, width: "5px", height: "17px", borderRadius: "3px", background: "#1C1A17", border: "2px solid #FFFFFF", transform: "translateX(-50%)" }}></span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "11px" }}>{V.fLabel}</div>
                    <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F2EFE9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958A" }}>Evolución votación a votación</span>
                      </div>
                      {V.fSpark}
                    </div>
                  </>
                )}
                {V.fNoIndice && (
                  <div style={{ fontSize: "13.5px", color: "#78736A", marginTop: "10px", lineHeight: 1.5 }}>Sin votaciones computables en este conjunto — {V.fNoIndiceWhy}</div>
                )}
              </div>

              <div style={{ marginTop: "18px" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "10px" }}>Posición en las {V.nVotsWord} votaciones</div>
                <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "12px", overflow: "hidden" }}>
                  {V.fVotes.map((v: any, i: number) => (
                    <div key={i} onClick={v.onOpen} className="hov-row" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "11px 15px", borderBottom: "1px solid #F2EFE9", cursor: "pointer" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "4px", flexShrink: 0, background: v.sw, border: `1px solid ${v.border}` }}></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", lineHeight: 1.25, color: "#3A3733" }}>{v.corto}</div>
                        {v.hasNota && (<div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px", lineHeight: 1.35 }}>{v.nota}</div>)}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "11.5px", fontWeight: 600, color: v.fg, whiteSpace: "nowrap" }}>{v.label}</div>
                        <div className="dt-num" style={{ fontSize: "9.5px", color: "#B0AB9F", marginTop: "1px" }}>{v.srcLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "11.5px", color: "#A8A296", marginTop: "8px", lineHeight: 1.45, display: "flex", gap: "7px" }}><span style={{ color: "#B45309" }}>●</span> “Línea de bloque” = posición mayoritaria documentada del bloque; “registro” = voto o ausencia individual documentada.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "12px", overflow: "hidden", marginTop: "18px" }}>
                <div style={{ background: "#FFFFFF", padding: "14px 16px" }}><div className="dt-num" style={{ fontSize: "17px", fontWeight: 500 }}>{V.fDieta}</div><div style={{ fontSize: "11.5px", color: "#9A958A", marginTop: "2px" }}>Dieta mensual <a href={V.dietaU} target="_blank" rel="noopener noreferrer" style={{ color: "#B45309", textDecoration: "none" }}>(fuente ↗)</a></div></div>
                <div style={{ background: "#FFFFFF", padding: "14px 16px" }}><a href="https://www2.jus.gov.ar/consultaddjj/Home/Busqueda" target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", fontWeight: 600, color: "#B45309", textDecoration: "none" }}>Buscar su DDJJ ↗</a><div style={{ fontSize: "11.5px", color: "#9A958A", marginTop: "2px" }}>patrimonio declarado · búsqueda por apellido en la OA · <a href="#/patrimonio" style={{ color: "#B45309", textDecoration: "none" }}>cómo funciona</a></div></div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "10px" }}>Historial de bloque</div>
                {V.fHasHistory && (
                  <div style={{ borderLeft: "1.5px solid #E2DDD2" }}>
                    <div style={{ position: "relative", padding: "0 0 6px 20px" }}>
                      <span style={{ position: "absolute", left: "-5px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", background: "#1C1A17", border: "2px solid #FAFAF9" }}></span>
                      <div className="dt-num" style={{ fontSize: "11px", color: "#A8A296" }}>{V.fHistFecha}</div>
                      <div style={{ fontSize: "12.5px", color: "#57534E", marginTop: "1px", lineHeight: 1.45 }}>{V.fHistText}</div>
                    </div>
                  </div>
                )}
                {V.fNoHistory && (
                  <div style={{ fontSize: "12.5px", color: "#A8A296" }}>Sin cambios de bloque registrados en el período.</div>
                )}
              </div>

              <button onClick={V.addToCompareFromFicha} style={{ marginTop: "20px", width: "100%", background: "#1C1A17", color: "#FAFAF9", border: "none", borderRadius: "10px", padding: "12px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>Agregar al comparador</button>
              <div className="dt-num" style={{ fontSize: "10.5px", color: "#B0AB9F", marginTop: "12px", textAlign: "center" }}>Fuente: HCDN, nómina oficial · foto oficial de la Cámara</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
