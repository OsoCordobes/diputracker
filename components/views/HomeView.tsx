"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function HomeView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view">

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "48px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B45309" }}>Cámara de Diputados de la Nación</div>
          <div className="dt-num" style={{ fontSize: "11px", color: "#B0AB9F", letterSpacing: "0.04em" }}>nómina oficial · corte {V.corte}</div>
        </div>
        <h1 className="dt-h1" style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "46px", lineHeight: 1.04, letterSpacing: "-0.02em", margin: "14px 0 0", maxWidth: "880px" }}>Índice de alineamiento con el gobierno nacional</h1>
        <p style={{ fontSize: "18px", lineHeight: 1.5, color: "#57534E", maxWidth: "720px", margin: "16px 0 0" }}>Las 257 bancas reales, coloreadas por su acompañamiento al oficialismo en las {V.nVotsWord} votaciones decisivas del período — extraordinarias dic–feb y ordinarias abr–jun 2026. No es color de partido: es comportamiento registrado — hoy medido por la posición documentada de cada bloque, con las disidencias individuales que dejaron registro.</p>
        <div className="dt-chipscroll" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "18px", alignItems: "center" }}>
          <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958A" }}>Período computado</span>
          <button onClick={V.perTodo} aria-pressed={V.perTodoBg === "#1C1A17"} className="dt-num" style={{ fontSize: "12px", background: V.perTodoBg, color: V.perTodoFg, border: `1px solid ${V.perTodoBorder}`, borderRadius: "20px", padding: "5px 13px", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", whiteSpace: "nowrap" }}>Todo · dic 2025 → jun 2026 · {V.perTodoCount}</button>
          <button onClick={V.perExt} aria-pressed={V.perExtBg === "#1C1A17"} className="dt-num" style={{ fontSize: "12px", background: V.perExtBg, color: V.perExtFg, border: `1px solid ${V.perExtBorder}`, borderRadius: "20px", padding: "5px 13px", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", whiteSpace: "nowrap" }}>Extraordinarias · {V.perExtCount}</button>
          <button onClick={V.perOrd} aria-pressed={V.perOrdBg === "#1C1A17"} className="dt-num" style={{ fontSize: "12px", background: V.perOrdBg, color: V.perOrdFg, border: `1px solid ${V.perOrdBorder}`, borderRadius: "20px", padding: "5px 13px", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", whiteSpace: "nowrap" }}>Ordinarias 2026 · {V.perOrdCount}</button>
          <span className="dt-num dt-hidem" title="Se habilita al cargar las actas CSV del dataset votaciones_nominales" style={{ fontSize: "12px", border: "1px dashed #D8D3C8", color: "#B0AB9F", borderRadius: "20px", padding: "5px 13px", cursor: "not-allowed" }}>Fernández · 2019–23</span>
          <span className="dt-num dt-hidem" title="Se habilita al cargar las actas CSV del dataset votaciones_nominales" style={{ fontSize: "12px", border: "1px dashed #D8D3C8", color: "#B0AB9F", borderRadius: "20px", padding: "5px 13px", cursor: "not-allowed" }}>Macri · 2015–19</span>
        </div>
      </div>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "26px 28px 0", display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
        <div className="dt-chipscroll" style={{ display: "inline-flex", background: "#F0EDE6", border: "1px solid #E2DDD2", borderRadius: "10px", padding: "3px" }}>
          <button onClick={V.setIndice} aria-pressed={V.modeIndiceBg !== "transparent"} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.modeIndiceBg, color: V.modeIndiceFg, boxShadow: V.modeIndiceSh, transition: "all .2s" }}>Por índice</button>
          <button onClick={V.setBloque} aria-pressed={V.modeBloqueBg !== "transparent"} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.modeBloqueBg, color: V.modeBloqueFg, boxShadow: V.modeBloqueSh, transition: "all .2s" }}>Por bloque</button>
          <button onClick={V.setInter} aria-pressed={V.modeInterBg !== "transparent"} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.modeInterBg, color: V.modeInterFg, boxShadow: V.modeInterSh, transition: "all .2s" }}>Interbloques</button>
          <button onClick={V.setPoder} aria-pressed={V.modePoderBg !== "transparent"} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.modePoderBg, color: V.modePoderFg, boxShadow: V.modePoderSh, transition: "all .2s" }}>Poder</button>
          <button onClick={V.setDisidencia} aria-pressed={V.modeDisBg !== "transparent"} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.modeDisBg, color: V.modeDisFg, boxShadow: V.modeDisSh, transition: "all .2s" }}>Disidencias</button>
        </div>
        <div style={{ fontSize: "13.5px", color: "#78736A", lineHeight: 1.4, maxWidth: "430px" }}>{V.modeHint}</div>
      </div>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "14px 28px 0" }}>
        <div style={{ position: "relative", background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "16px", padding: "26px 30px 22px", boxShadow: "0 1px 2px rgba(28,26,23,0.03),0 14px 38px -28px rgba(28,26,23,0.22)" }}>
          <div style={{ position: "relative" }}>{V.hemicycle}</div>
          {V.peekOpen && (
            <div className="dt-pop" data-testid="dt-peek" style={{ display: "flex", alignItems: "center", gap: "12px", background: "#1C1A17", color: "#FAFAF9", borderRadius: "12px", padding: "12px 14px", marginTop: "14px", boxShadow: "0 14px 30px -12px rgba(0,0,0,.4)" }}>
              <div className="dt-num" style={{ width: "44px", height: "44px", borderRadius: "9px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#FFFFFF", background: `${V.peek.swatch} center/cover`, backgroundImage: V.peek.fotoCss }}>{V.peek.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{V.peek.nombre}</div>
                <div style={{ fontSize: "11.5px", color: "#C9C4BA", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{V.peek.blocDistrito}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
                  <span className="dt-num" style={{ fontSize: "17px", fontWeight: 500, color: V.peek.idxColor }}>{V.peek.indice}</span>
                  <span style={{ fontSize: "10px", color: "#9A958A" }}>{V.peek.indiceNota}</span>
                </div>
              </div>
              <button onClick={V.peek.verFicha} style={{ flexShrink: 0, background: "#FDBA74", color: "#1C1A17", border: "none", borderRadius: "9px", padding: "0 16px", minHeight: "44px", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Ver ficha →</button>
              <button onClick={V.peek.cerrar} aria-label="Cerrar" style={{ flexShrink: 0, background: "none", border: "none", color: "#9A958A", width: "34px", minHeight: "44px", fontSize: "16px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", flexWrap: "wrap", marginTop: "6px", borderTop: "1px solid #F0EDE6", paddingTop: "18px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "8px" }}>{V.legendTitle}</div>
              {V.legendIsRamp && (
                <div style={{ display: "flex", alignItems: "center", gap: "11px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12.5px", color: "#0F766E", fontWeight: 600 }}>Oposición firme</span>
                  <span style={{ width: "280px", maxWidth: "40vw", height: "13px", borderRadius: "7px", border: "1px solid #E2DDD2", background: "linear-gradient(90deg,#0F766E,#14B8A6,#5EEAD4,#E7E5E4,#FDBA74,#F59E0B,#B45309)" }}></span>
                  <span style={{ fontSize: "12.5px", color: "#B45309", fontWeight: 600 }}>Oficialismo</span>
                  <span className="dt-num" style={{ fontSize: "11.5px", color: "#B0AB9F" }}>0 → 100</span>
                  {V.modeIsDisidencia && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "4px", fontSize: "12px", color: "#57534E" }}><span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "1.6px solid #1C1A17" }}></span>ruptura documentada</span>
                  )}
                </div>
              )}
              {V.legendIsChips && (
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", maxWidth: "640px" }}>
                  {V.legendChips.map((b: any, i: number) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #E2DDD2", borderRadius: "20px", padding: "3px 9px 3px 7px", fontSize: "11.5px", color: "#57534E" }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: b.chip }}></span>{b.short} <span className="dt-num" style={{ color: "#A8A296" }}>{b.count}</span>
                    </span>
                  ))}
                </div>
              )}
              {V.legendIsPower && (
                <div style={{ display: "flex", alignItems: "center", gap: "11px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12.5px", color: "#A8A296", fontWeight: 600 }}>Menos decisivo</span>
                  <span style={{ width: "210px", maxWidth: "32vw", height: "13px", borderRadius: "7px", border: "1px solid #E2DDD2", background: "linear-gradient(90deg,#EAE6DD,#EDB482,#B45309)" }}></span>
                  <span style={{ fontSize: "12.5px", color: "#B45309", fontWeight: 600 }}>Más decisivo por banca</span>
                  <span className="dt-num" style={{ fontSize: "11.5px", color: "#B0AB9F" }}>Banzhaf · 129</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#A8A296", textAlign: "right", lineHeight: 1.5, maxWidth: "250px" }}>Índice provisional a nivel bloque; las bancas con registro individual (rupturas, ausencias con lectura política) se calculan aparte.</div>
          </div>
        </div>

        {/* disidencias panel */}
        {V.modeIsDisidencia && (
          <div style={{ marginTop: "22px", background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Disidencias y ausencias documentadas</div>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>{V.disCount}</div>
            </div>
            <div style={{ fontSize: "13.5px", color: "#78736A", lineHeight: 1.5, maxWidth: "720px", marginBottom: "14px" }}>Diputados que en este conjunto de votaciones se apartaron de la línea de su bloque o cuya ausencia tuvo lectura política, según las actas y la cobertura parlamentaria. La detección estadística de quiebres (cohesión de Rice + análisis direccional) se habilita al cargar el voto nominal completo.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "12px", overflow: "hidden" }}>
              {V.disList.map((t: any, i: number) => (
                <div key={i} onClick={t.onClick} className="hov-row" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", background: "#FFFFFF", cursor: "pointer" }}>
                  <div className="dt-num" style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#FFFFFF", background: `${t.swatch} center/cover`, backgroundImage: t.fotoCss }}>{t.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}><span style={{ fontSize: "14px", fontWeight: 600 }}>{t.nombre}</span><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "#8A857A" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.chip }}></span>{t.blocShort}</span></div>
                    <div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>{t.tag}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="dt-num" style={{ fontSize: "12.5px", fontWeight: 600, color: t.dirColor }}>{t.voteLabel}</div>
                    <div className="dt-num" style={{ fontSize: "11px", color: "#A8A296", marginTop: "1px" }}>{t.votShort}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* poder ranking panel */}
        {V.modeIsPoder && (
          <div style={{ marginTop: "22px", background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Poder de bisagra por bloque · índice de Banzhaf</div>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>umbral 129</div>
            </div>
            <div style={{ fontSize: "13.5px", color: "#78736A", lineHeight: 1.5, maxWidth: "730px", marginBottom: "16px" }}>La fracción de coaliciones posibles en las que el bloque es decisivo. Comparado con su participación de bancas: <span style={{ color: "#B45309", fontWeight: 600 }}>terracota</span> = pesa más que su tamaño; <span style={{ color: "#0F766E", fontWeight: 600 }}>verde</span> = pesa menos. Calculado sobre la composición real.</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginBottom: "12px", fontSize: "11px", color: "#57534E" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", height: "9px", borderRadius: "2px", background: "#1C1A17" }}></span>Poder</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", height: "9px", borderRadius: "2px", background: "#FFFFFF", border: "1.4px solid #C9C4BA" }}></span>Bancas</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {V.powerRows.map((p: any, i: number) => (
                <div key={i} className="dt-rgrid" style={{ display: "grid", gridTemplateColumns: "158px 1fr 122px", gap: "16px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: p.chip }}></span><span style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</span></div>
                  <div>
                    <div style={{ height: "11px", borderRadius: "3px", background: p.barColor, width: p.barW }}></div>
                    <div style={{ height: "11px", borderRadius: "3px", background: "#FFFFFF", border: "1.4px solid #C9C4BA", width: p.seatW, marginTop: "4px" }}></div>
                  </div>
                  <div style={{ textAlign: "right" }}><span className="dt-num" style={{ fontSize: "15px", fontWeight: 600 }}>{p.power}</span><div className="dt-num" style={{ fontSize: "11px", color: p.ratioColor, marginTop: "1px" }}>{p.ratio} / banca</div></div>
                </div>
              ))}
            </div>
            <div className="dt-num" style={{ fontSize: "10.5px", color: "#B0AB9F", marginTop: "14px" }}>Índice de poder de Banzhaf · enumeración exacta de coaliciones sobre los 20 bloques reales. Supuesto: coaliciones equiprobables.</div>
          </div>
        )}

        {/* composición */}
        <div style={{ marginTop: "22px", background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "11px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A" }}>Composición por bloque — oficial</div>
            <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>257 bancas</div>
          </div>
          <div style={{ display: "flex", height: "26px", borderRadius: "6px", overflow: "hidden", border: "1px solid #EFEBE3" }}>
            {V.blocComp.map((b: any, i: number) => (
              <div key={i} title={b.tip} style={{ width: b.w, background: b.chip, opacity: 0.92 }}></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "11px" }}>
            {V.blocComp.map((b: any, i: number) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#57534E" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: b.chip }}></span>{b.short} <span className="dt-num" style={{ color: "#A8A296" }}>{b.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* VOTACIONES */}
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "58px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid #E7E3DB", paddingBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Insumos del índice — actas reales</div>
            <h2 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "30px", letterSpacing: "-0.015em", margin: "6px 0 0" }}>Las {V.nVotsWord} votaciones del período</h2>
          </div>
          <button onClick={V.goVotacion} style={{ background: "none", border: "none", color: "#1C1A17", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>Abrir vista de votación →</button>
        </div>
        <div className="dt-g2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1px", background: "#E7E3DB", border: "1px solid #E7E3DB", borderRadius: "14px", overflow: "hidden", marginTop: "20px" }}>
          {V.votesHome.map((v: any, i: number) => (
            <div key={i} onClick={v.onOpen} className="hov-row" style={{ background: "#FFFFFF", padding: "20px 22px", cursor: "pointer", transition: "background .15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                <div style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em", maxWidth: "72%" }}>{v.corto}</div>
                <div style={{ textAlign: "right", flexShrink: 0 }}><div className="dt-num" style={{ fontSize: "11.5px", color: "#A8A296", whiteSpace: "nowrap" }}>{v.fecha}</div><div className="dt-num" style={{ fontSize: "9px", letterSpacing: "0.08em", color: "#B0AB9F", marginTop: "3px" }}>{v.perLabel}</div></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", color: v.resColor, textTransform: "uppercase" }}>{v.resLabel}</span>
                <span style={{ fontSize: "12px", color: "#8A857A" }}>{v.govLabel}</span>
              </div>
              <div style={{ display: "flex", height: "9px", borderRadius: "5px", overflow: "hidden", marginTop: "13px", background: "#F0EDE6" }}>
                <div style={{ width: v.afW, background: "#2F6F4E" }}></div>
                <div style={{ width: v.negW, background: "#9B3022" }}></div>
                <div style={{ width: v.absW, background: "#B8B2A6" }}></div>
              </div>
              <div className="dt-num" style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "12px", color: "#57534E" }}>
                <span><span style={{ color: "#2F6F4E", fontWeight: 600 }}>{v.af}</span> afirm.</span>
                <span><span style={{ color: "#9B3022", fontWeight: 600 }}>{v.neg}</span> neg.</span>
                <span><span style={{ color: "#8A857A", fontWeight: 600 }}>{v.abs}</span> abst.</span>
                <span><span style={{ color: "#8A857A", fontWeight: 600 }}>{v.sv}</span> sin voto</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOVIMIENTOS + COMPARADOR teaser */}
      <div className="dt-g2" style={{ maxWidth: "1180px", margin: "0 auto", padding: "58px 28px 0", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "34px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid #E7E3DB", paddingBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Recomposición de bloques</div>
              <h2 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "26px", letterSpacing: "-0.015em", margin: "6px 0 0" }}>Movimientos registrados</h2>
            </div>
          </div>
          <div style={{ borderLeft: "1.5px solid #E2DDD2", margin: "20px 0 0" }}>
            {V.movHome.map((c: any, i: number) => (
              <div key={i} style={{ position: "relative", padding: "0 0 20px 24px" }}>
                <span style={{ position: "absolute", left: "-5px", top: "4px", width: "9px", height: "9px", borderRadius: "50%", background: "#1C1A17", border: "2px solid #FAFAF9" }}></span>
                <div className="dt-num" style={{ fontSize: "11.5px", color: "#A8A296", letterSpacing: "0.03em" }}>{c.fecha}</div>
                <div style={{ fontSize: "14.5px", fontWeight: 600, marginTop: "2px" }}>{c.titulo}</div>
                <div style={{ fontSize: "12.5px", color: "#57534E", marginTop: "4px", lineHeight: 1.45, maxWidth: "460px" }}>{c.nota}</div>
              </div>
            ))}
          </div>
          <button onClick={V.goMov} style={{ background: "none", border: "none", color: "#1C1A17", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>Ver bloques, interbloques y movimientos →</button>
        </div>
        <div>
          <div style={{ borderBottom: "1px solid #E7E3DB", paddingBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Comparación directa</div>
            <h2 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "26px", letterSpacing: "-0.015em", margin: "6px 0 0" }}>Comparar diputados</h2>
          </div>
          <p style={{ fontSize: "14px", color: "#78736A", lineHeight: 1.55, margin: "16px 0 0" }}>Hasta tres bancas reales lado a lado: índice provisional, posición en cada votación y ficha oficial.</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
            {V.compareTeaser.map((t: any, i: number) => (
              <div key={i} onClick={t.onClick} className="hov-row" style={{ flex: 1, border: "1px solid #E7E3DB", borderRadius: "12px", padding: "14px", textAlign: "center", background: "#FFFFFF", cursor: "pointer" }}>
                <div className="dt-num" style={{ width: "44px", height: "44px", borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 500, color: "#FFFFFF", background: `${t.swatch} center/cover`, backgroundImage: t.fotoCss }}>{t.initials}</div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, marginTop: "9px", lineHeight: 1.2 }}>{t.nombre}</div>
                <div className="dt-num" style={{ fontSize: "22px", fontWeight: 500, marginTop: "6px" }}>{t.indice}</div>
              </div>
            ))}
          </div>
          <button onClick={V.goComparador} style={{ marginTop: "16px", width: "100%", background: "#1C1A17", color: "#FAFAF9", border: "none", borderRadius: "10px", padding: "12px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Abrir comparador →</button>
        </div>
      </div>

      {/* METHOD */}
      <div style={{ maxWidth: "1180px", margin: "64px auto 0", padding: "0 28px 70px" }}>
        <div className="dt-g2" style={{ borderTop: "1px solid #E7E3DB", paddingTop: "22px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "40px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9A958A" }}>Cómo se calcula (versión provisional)</div>
            <a href="#/indices" style={{ float: "right", fontSize: "12.5px", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #F0D9B8" }}>metodología completa →</a>
            <p style={{ fontSize: "13.5px", color: "#57534E", lineHeight: 1.6, margin: "10px 0 0", maxWidth: "560px" }}>El índice es el porcentaje de posiciones coincidentes con la del gobierno sobre las votaciones computables de cada banca. Mientras no estén cargadas las actas nominales, a cada diputado se le asigna la <strong>posición mayoritaria documentada de su bloque</strong>; cuando el bloque votó dividido o no hay línea documentada, esa votación <strong>no computa</strong>. Las disidencias individuales y las ausencias con lectura política registradas por las actas y la prensa parlamentaria se aplican por encima de la línea de bloque. La <strong>ausencia es categoría propia</strong>: no computa como apoyo ni rechazo. La abstención sí integra el denominador. Los diputados que asumieron después de una votación no la computan.</p>
          </div>
          <div style={{ fontSize: "12px", color: "#A8A296", lineHeight: 1.7, borderLeft: "1px solid #E7E3DB", paddingLeft: "20px" }}>
            Fuente: HCDN — <a href="https://www.diputados.gov.ar/diputados/" target="_blank" rel="noopener noreferrer" style={{ color: "#B45309", textDecoration: "none", borderBottom: "1px solid #F0D9B8" }}>nómina y bloques oficiales</a> · <a href="https://votaciones.hcdn.gob.ar" target="_blank" rel="noopener noreferrer" style={{ color: "#B45309", textDecoration: "none", borderBottom: "1px solid #F0D9B8" }}>plataforma de votaciones</a> · posiciones de bloque según actas y prensa parlamentaria (fuentes citadas en cada votación). La información de la HCDN es de dominio público; se cita la fuente.
          </div>
        </div>
      </div>
    </div>
  );
}
