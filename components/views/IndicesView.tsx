"use client";
import type { DTVals } from "@/components/DipuTracker";

export default function IndicesView({ V }: { V: DTVals }) {
  return (
    <div className="dt-view" style={{ maxWidth: "1180px", margin: "0 auto", padding: "42px 28px 70px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B45309" }}>Índices y metodología</div>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "32px", letterSpacing: "-0.015em", margin: "8px 0 0", maxWidth: "860px" }}>Cinco lecturas de la misma Cámara</h1>
      <p style={{ fontSize: "15px", color: "#78736A", lineHeight: 1.55, margin: "8px 0 0", maxWidth: "760px" }}>Cada índice responde una pregunta distinta con los mismos datos oficiales. Cada uno se presenta con qué mide, cómo se calcula y qué no permite afirmar.</p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
        <div style={{ display: "inline-flex", background: "#F0EDE6", border: "1px solid #E2DDD2", borderRadius: "10px", padding: "3px" }}>
          <button onClick={V.tabAli} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.tabAliBg, color: V.tabAliFg, boxShadow: V.tabAliSh, transition: "all .2s" }}>Alineamiento</button>
          <button onClick={V.tabDis} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.tabDisBg, color: V.tabDisFg, boxShadow: V.tabDisSh, transition: "all .2s" }}>Disciplina de bloque</button>
          <button onClick={V.tabPow} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.tabPowBg, color: V.tabPowFg, boxShadow: V.tabPowSh, transition: "all .2s" }}>Poder de bisagra</button>
          <button onClick={V.tabRup} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.tabRupBg, color: V.tabRupFg, boxShadow: V.tabRupSh, transition: "all .2s" }}>Disidencias</button>
          <button onClick={V.tabTer} style={{ border: "none", borderRadius: "7px", padding: "8px 15px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", background: V.tabTerBg, color: V.tabTerFg, boxShadow: V.tabTerSh, transition: "all .2s" }}>Territorio</button>
        </div>
      </div>

      <div className="dt-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "14px", overflow: "hidden", marginTop: "18px" }}>
        <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309", marginBottom: "7px" }}>Qué mide</div>
          <div style={{ fontSize: "13px", lineHeight: 1.55, color: "#3A3733" }}>{V.ixQue}</div>
        </div>
        <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "7px" }}>Cómo se calcula</div>
          <div style={{ fontSize: "13px", lineHeight: 1.55, color: "#57534E" }}>{V.ixComo}</div>
        </div>
        <div style={{ background: "#FFFDF7", padding: "16px 20px" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A", marginBottom: "7px" }}>Qué no permite afirmar</div>
          <div style={{ fontSize: "13px", lineHeight: 1.55, color: "#57534E" }}>{V.ixLim}</div>
        </div>
      </div>

      {/* TAB ALINEAMIENTO */}
      {V.tabIsAli && (
        <>
          <div className="dt-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginTop: "22px" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "16px 20px" }}>
              <div className="dt-num" style={{ fontSize: "30px", fontWeight: 500 }}>{V.ixProm}</div>
              <div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>media de la Cámara <span style={{ color: "#B0AB9F" }}>(bancas con índice)</span></div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}><span className="dt-num" style={{ fontSize: "30px", fontWeight: 500 }}>{V.ixCob}</span><span className="dt-num" style={{ fontSize: "14px", color: "#A8A296" }}>/ 257</span></div>
              <div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>bancas con índice computable</div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "16px 20px" }}>
              <div className="dt-num" style={{ fontSize: "30px", fontWeight: 500 }}>{V.ixExcN}</div>
              <div style={{ fontSize: "12px", color: "#78736A", marginTop: "2px" }}>bancas con registro individual documentado</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "22px" }}>
            <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", border: "1px solid #E0DBD0", borderRadius: "9px", padding: "8px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A296" strokeWidth="2.2"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.5" y2="16.5"></line></svg>
              <input value={V.ixQ} onChange={V.onIxQ} placeholder="Filtrar por nombre o distrito…" style={{ border: "none", outline: "none", background: "none", fontFamily: "inherit", fontSize: "13px", width: "100%", color: "#1C1A17" }} />
            </div>
            <select value={V.ixBloc} onChange={V.onIxBloc} style={{ border: "1px solid #E0DBD0", borderRadius: "9px", padding: "9px 11px", fontFamily: "inherit", fontSize: "12.5px", background: "#FFFFFF", color: "#1C1A17" }}>
              {V.ixBlocOptions.map((o: any, i: number) => (<option key={i} value={o.value}>{o.label}</option>))}
            </select>
            <div style={{ display: "inline-flex", background: "#F0EDE6", border: "1px solid #E2DDD2", borderRadius: "9px", padding: "2px" }}>
              <button onClick={V.ixSortDesc} style={{ border: "none", borderRadius: "7px", padding: "7px 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: V.ixSDescBg, color: V.ixSDescFg, transition: "all .2s" }}>Mayor alineamiento</button>
              <button onClick={V.ixSortAsc} style={{ border: "none", borderRadius: "7px", padding: "7px 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: V.ixSAscBg, color: V.ixSAscFg, transition: "all .2s" }}>Menor alineamiento</button>
              <button onClick={V.ixSortAz} style={{ border: "none", borderRadius: "7px", padding: "7px 12px", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: V.ixSAzBg, color: V.ixSAzFg, transition: "all .2s" }}>A–Z</button>
            </div>
            <button onClick={V.downloadCsv} title="Descarga el dataset completo: las 257 bancas con índice, bloque, mandato y registros individuales" className="hov-dark" style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#1C1A17", color: "#FAFAF9", border: "none", borderRadius: "9px", padding: "9px 14px", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "background .2s" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"></path><path d="M6 11l6 6 6-6"></path><path d="M4 21h16"></path></svg>{V.csvLabel}</button>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", marginTop: "14px", overflowX: "auto" }}>
            <div className="dt-minw" style={{ display: "grid", gridTemplateColumns: "44px 40px minmax(0,1fr) 150px 200px 56px 96px", gap: "12px", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid #EFEBE3", background: "#FBF9F4", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A958A" }}>
              <span>#</span><span></span><span>Diputado</span><span>Bloque</span><span>Índice de alineamiento</span><span style={{ textAlign: "right" }}>0–100</span><span style={{ textAlign: "right" }}>Base</span>
            </div>
            {V.ixRows.map((r: any, i: number) => (
              <div key={i} onClick={r.onClick} className="dt-row dt-minw hov-row" style={{ display: "grid", gridTemplateColumns: "44px 40px minmax(0,1fr) 150px 200px 56px 96px", gap: "12px", alignItems: "center", padding: "9px 18px", borderBottom: "1px solid #F2EFE9", cursor: "pointer", animationDelay: r.delay }}>
                <span className="dt-num" style={{ fontSize: "11.5px", color: "#B0AB9F" }}>{r.rank}</span>
                <div className="dt-num" style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#FFFFFF", background: `${r.swatch} center/cover`, backgroundImage: r.fotoCss }}>{r.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><span style={{ fontSize: "13.5px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.nombre}</span>{r.hasExc && (<span title="Disidencia o ausencia con registro individual" style={{ width: "13px", height: "13px", borderRadius: "50%", border: "1.6px solid #1C1A17", flexShrink: 0 }}></span>)}</div>
                  <div style={{ fontSize: "11.5px", color: "#8A857A" }}>{r.distrito}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#57534E", minWidth: 0 }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: r.chip }}></span><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.blocShort}</span></span>
                <div style={{ position: "relative", height: "9px", borderRadius: "5px", background: "#F0EDE6", overflow: "hidden" }}>
                  <div className="dt-bar" style={{ position: "absolute", inset: "0 auto 0 0", width: r.barW, borderRadius: "5px", background: r.barColor, animationDelay: r.delay }}></div>
                </div>
                <span className="dt-num" style={{ fontSize: "14px", fontWeight: 600, textAlign: "right", color: r.idxColor }}>{r.indice}</span>
                <span className="dt-num" style={{ fontSize: "10.5px", color: "#A8A296", textAlign: "right" }}>{r.base}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 18px", flexWrap: "wrap" }}>
              <span className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>{V.ixCount}</span>
              <span style={{ fontSize: "11.5px", color: "#A8A296" }}>Las bancas sin índice (asunción posterior o sin línea documentada) se ubican al final. Cada fila abre la ficha del diputado.</span>
            </div>
          </div>
        </>
      )}

      {/* TAB DISCIPLINA */}
      {V.tabIsDis && (
        <>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px", marginTop: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Línea unificada por bloque · período seleccionado en el panel</div>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>bloques de 3+ bancas</div>
            </div>
            <div style={{ fontSize: "13.5px", color: "#78736A", lineHeight: 1.5, maxWidth: "730px", marginBottom: "18px" }}>Porcentaje de votaciones en las que el bloque llegó con una posición única documentada, sobre las que tuvo posición documentada. <span style={{ color: "#57534E" }}>Dividido</span> = el bloque se partió; <span style={{ color: "#57534E" }}>s/d</span> = sin línea documentada (no computa).</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {V.ixDisRows.map((p: any, i: number) => (
                <div key={i} className="dt-row dt-rgrid" style={{ display: "grid", gridTemplateColumns: "170px 1fr 210px", gap: "16px", alignItems: "center", animationDelay: p.delay }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: p.chip }}></span><div style={{ minWidth: 0 }}><div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div><div className="dt-num" style={{ fontSize: "10.5px", color: "#A8A296" }}>{p.count}</div></div></div>
                  <div style={{ position: "relative", height: "11px", borderRadius: "4px", background: "#F0EDE6", overflow: "hidden" }}>
                    <div className="dt-bar" style={{ position: "absolute", inset: "0 auto 0 0", width: p.barW, background: p.barColor, animationDelay: p.delay }}></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", justifyContent: "flex-end" }}>
                    <span className="dt-num" style={{ fontSize: "15px", fontWeight: 600, color: p.pctColor }}>{p.pct}</span>
                    <span className="dt-num" style={{ fontSize: "11px", color: "#8A857A" }}>{p.detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.5, marginTop: "16px", borderTop: "1px solid #F2EFE9", paddingTop: "12px" }}>Bloques de 1–2 bancas quedan fuera: su “disciplina” es trivial. La cohesión fina (índice de Rice, voto por voto) se habilita con el voto nominal completo.</div>
          </div>
        </>
      )}

      {/* TAB PODER */}
      {V.tabIsPow && (
        <>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px", marginTop: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Poder de bisagra por bloque · índice de Banzhaf</div>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>umbral 129</div>
            </div>
            <div style={{ fontSize: "13.5px", color: "#78736A", lineHeight: 1.5, maxWidth: "730px", marginBottom: "16px" }}><span style={{ color: "#B45309", fontWeight: 600 }}>Terracota</span> = pesa más que su tamaño; <span style={{ color: "#0F766E", fontWeight: 600 }}>verde</span> = pesa menos. La barra blanca es su participación de bancas, para comparar.</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginBottom: "12px", fontSize: "11px", color: "#57534E" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", height: "9px", borderRadius: "2px", background: "#1C1A17" }}></span>Poder</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", height: "9px", borderRadius: "2px", background: "#FFFFFF", border: "1.4px solid #C9C4BA" }}></span>Bancas</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {V.ixPowerRows.map((p: any, i: number) => (
                <div key={i} className="dt-row dt-rgrid" style={{ display: "grid", gridTemplateColumns: "158px 1fr 122px", gap: "16px", alignItems: "center", animationDelay: p.delay }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}><span style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: p.chip }}></span><span style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</span></div>
                  <div>
                    <div className="dt-bar" style={{ height: "11px", borderRadius: "3px", background: p.barColor, width: p.barW, animationDelay: p.delay }}></div>
                    <div style={{ height: "11px", borderRadius: "3px", background: "#FFFFFF", border: "1.4px solid #C9C4BA", width: p.seatW, marginTop: "4px" }}></div>
                  </div>
                  <div style={{ textAlign: "right" }}><span className="dt-num" style={{ fontSize: "15px", fontWeight: 600 }}>{p.power}</span><div className="dt-num" style={{ fontSize: "11px", color: p.ratioColor, marginTop: "1px" }}>{p.ratio} / banca</div></div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "16px", borderTop: "1px solid #F2EFE9", paddingTop: "12px", flexWrap: "wrap" }}>
              <span className="dt-num" style={{ fontSize: "10.5px", color: "#B0AB9F" }}>Enumeración exacta de coaliciones sobre los 20 bloques reales · supuesto: coaliciones equiprobables</span>
              <button onClick={V.goSimulador} style={{ background: "none", border: "none", color: "#1C1A17", fontFamily: "inherit", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>Ver en el simulador →</button>
            </div>
          </div>
        </>
      )}

      {/* TAB RUPTURAS */}
      {V.tabIsRup && (
        <>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px", marginTop: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Disidencias y ausencias documentadas</div>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>{V.ixRupCount}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#EFEBE3", border: "1px solid #EFEBE3", borderRadius: "12px", overflow: "hidden" }}>
              {V.ixRupList.map((t: any, i: number) => (
                <div key={i} onClick={t.onClick} className="dt-row hov-row" style={{ display: "flex", alignItems: "center", gap: "13px", padding: "12px 16px", background: "#FFFFFF", cursor: "pointer", animationDelay: t.delay }}>
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
            <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.5, marginTop: "12px" }}>Cada registro cita su acta o cobertura en la vista de la votación. En el hemiciclo, modo <strong style={{ color: "#57534E" }}>Disidencias</strong>: las bancas con anillo.</div>
          </div>
        </>
      )}

      {/* TAB TERRITORIO */}
      {V.tabIsTer && (
        <>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E3DB", borderRadius: "14px", padding: "20px 22px", marginTop: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B45309" }}>Delegaciones por distrito · nómina oficial</div>
              <div className="dt-num" style={{ fontSize: "12px", color: "#A8A296" }}>{V.terCount}</div>
            </div>
            <div style={{ fontSize: "13.5px", color: "#78736A", lineHeight: 1.5, maxWidth: "730px", marginBottom: "16px" }}>La barra es la composición por bloque de cada delegación; el número, su alineamiento promedio (0 oposición → 100 oficialismo). Cada fila abre la delegación banca por banca.</div>
            <div className="dt-xwrap" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {V.terRows.map((t: any, i: number) => (
                <div key={i} onClick={t.onClick} className="dt-row dt-minw2 hov-row" style={{ display: "grid", gridTemplateColumns: "190px 1fr 92px 168px", gap: "16px", alignItems: "center", padding: "9px 10px", borderRadius: "9px", cursor: "pointer", animationDelay: t.delay, transition: "background .15s" }}>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: "13.5px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.nombre}</div><div className="dt-num" style={{ fontSize: "10.5px", color: "#A8A296" }}>{t.count}</div></div>
                  <div style={{ display: "flex", height: "14px", borderRadius: "4px", overflow: "hidden", border: "1px solid #EFEBE3" }}>
                    {t.segs.map((s: any, j: number) => (<div key={j} title={s.tip} style={{ width: s.w, background: s.chip, opacity: 0.92 }}></div>))}
                  </div>
                  <div style={{ textAlign: "right" }}><span className="dt-num" style={{ fontSize: "13.5px", fontWeight: 600, color: "#B45309" }}>{t.ren}</span><div className="dt-num" style={{ fontSize: "9.5px", color: "#A8A296", letterSpacing: "0.04em" }}>en juego 2027</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", justifyContent: "flex-end" }}>
                    <span style={{ width: "11px", height: "11px", borderRadius: "50%", flexShrink: 0, background: t.promSw, border: "1px solid rgba(28,26,23,0.18)" }}></span>
                    <span className="dt-num" style={{ fontSize: "15px", fontWeight: 600, minWidth: "28px", textAlign: "right" }}>{t.prom}</span>
                    <span className="dt-num" style={{ fontSize: "10px", color: "#A8A296", minWidth: "52px" }}>{t.promNote}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11.5px", color: "#A8A296", lineHeight: 1.5, marginTop: "14px", borderTop: "1px solid #F2EFE9", paddingTop: "12px" }}>Las 257 bancas se eligen por distrito en proporción a la población; Buenos Aires concentra más de un cuarto de la Cámara. El promedio distrital puede ocultar dispersión: en delegaciones chicas, una sola banca altera de forma notable el valor. <strong style={{ color: "#57534E" }}>“En juego 2027”</strong> = mandatos 2023–2027 según la nómina oficial, que vencen el 9-dic-2027 y se renuevan en las legislativas de ese año.</div>
          </div>
        </>
      )}

      <div style={{ marginTop: "26px", background: "#1C1A17", color: "#FAFAF9", borderRadius: "16px", padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FDBA74" }}>Lo que se habilita con el voto nominal completo</div>
          <span className="dt-num" style={{ fontSize: "10.5px", color: "#9A958A" }}>dataset oficial: votaciones_nominales · datos.hcdn.gob.ar</span>
        </div>
        <div className="dt-g4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "22px", marginTop: "16px" }}>
          <div><div style={{ fontSize: "13.5px", fontWeight: 600 }}>Mapa de posiciones</div><div style={{ fontSize: "12px", color: "#C9C4BA", lineHeight: 1.5, marginTop: "4px" }}>Cada banca ubicada en 2D por similitud de votos — la técnica de DW-NOMINATE aplicada a la Cámara argentina.</div></div>
          <div><div style={{ fontSize: "13.5px", fontWeight: 600 }}>Cohesión de Rice</div><div style={{ fontSize: "12px", color: "#C9C4BA", lineHeight: 1.5, marginTop: "4px" }}>Disciplina real voto a voto dentro de cada bloque, y detección estadística de quiebres.</div></div>
          <div><div style={{ fontSize: "13.5px", fontWeight: 600 }}>Asistencia por banca</div><div style={{ fontSize: "12px", color: "#C9C4BA", lineHeight: 1.5, marginTop: "4px" }}>Presencias y ausencias de cada diputado en cada votación, con su serie histórica.</div></div>
          <div><div style={{ fontSize: "13.5px", fontWeight: 600 }}>Histórico por gobierno</div><div style={{ fontSize: "12px", color: "#C9C4BA", lineHeight: 1.5, marginTop: "4px" }}>El mismo panel para las eras Fernández y Macri, cada una con su composición real.</div></div>
        </div>
      </div>
    </div>
  );
}
