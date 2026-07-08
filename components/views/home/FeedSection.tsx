"use client";
import type { DTVals } from "@/components/DipuTracker";
import type { FeedItem, FeedSesionFuturaItem } from "@/lib/feed";
import { countdownLabel } from "@/lib/feed";
import { fdate, displayName } from "@/lib/compute";
import Badge from "@/components/views/ui/Badge";
import { C } from "@/lib/tokens";

// La "Crónica del período": feed cronológico unificado. Futuro citado arriba (dashed,
// dot hueco — el vocabulario del futuro no consumado), divisor HOY con dot pulsante,
// pasado en cronología inversa agrupado por día (convención live-blog).
// REGLA DURA: los items futuros jamás llevan barras, porcentajes ni colores de
// resultado — solo lo que la fuente oficial publica.

// El marco temporal del sitio es la hora argentina (el "hoy" del recinto, no el del
// navegador de quien mira desde otra zona horaria).
const TZ_AR = "America/Argentina/Buenos_Aires";
const hoyLocalIso = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ_AR }); // YYYY-MM-DD ART

const diaHeader = (iso: string) => {
  const d = new Date(iso + "T12:00:00Z");
  return d
    .toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
    .replace(/\./g, "")
    .toUpperCase();
};

const hoyLargo = () => new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ_AR });

function Rail({ children, hueco = false, pulse = false }: { children: React.ReactNode; hueco?: boolean; pulse?: boolean }) {
  return (
    <div style={{ position: "relative", padding: "0 0 22px 26px" }}>
      <span
        className={pulse ? "dt-pulse" : undefined}
        style={{
          position: "absolute",
          left: "-5.5px",
          top: "5px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: hueco ? C.paper : C.ink,
          border: hueco ? `1.8px dashed ${C.ghostest}` : `2px solid ${C.paper}`,
          ...(pulse && { background: C.accent, border: `2px solid ${C.paper}` }),
        }}
      ></span>
      {children}
    </div>
  );
}

export default function FeedSection({ V }: { V: DTVals }) {
  const hoy = hoyLocalIso();
  const futuros: FeedSesionFuturaItem[] = V.feed.futuros;
  const pasados: FeedItem[] = V.feed.pasados;

  // futuro: el más lejano arriba, el más cercano pegado al divisor HOY
  const futurosDesc = futuros.slice().reverse();

  // pasado agrupado por día (ya viene en orden desc)
  const grupos: { fecha: string; items: FeedItem[] }[] = [];
  for (const item of pasados) {
    const g = grupos[grupos.length - 1];
    if (g && g.fecha === item.fecha) g.items.push(item);
    else grupos.push({ fecha: item.fecha, items: [item] });
  }

  return (
    <section aria-label="Crónica del período">
      <div style={{ borderLeft: `1.5px solid ${C.borderChip}`, marginTop: "22px" }}>
        {/* ---- FUTURO CITADO ---- */}
        {futurosDesc.map((f) => (
          <Rail key={f.sesion.idSesion} hueco>
            <div
              style={{
                border: `1.5px dashed ${C.borderDashed}`,
                background: C.cream,
                borderRadius: "14px",
                padding: "16px 18px",
                maxWidth: "720px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <Badge kind="citada" />
                <span style={{ fontSize: "15px", fontWeight: 600 }}>{f.sesion.titulo.replace(/\s*CITADA\s*$/i, "")}</span>
                <span className="dt-num" style={{ fontSize: "12px", color: C.ghost }}>
                  {fdate(f.fecha)}
                </span>
                <span className="dt-num" style={{ fontSize: "12px", fontWeight: 600, color: C.accent, marginLeft: "auto" }}>
                  ⏳ {countdownLabel(f.fecha, hoy)}
                </span>
              </div>
              {f.sesion.temas.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.faint }}>
                    Plan de Labor · {f.sesion.temas.length} tema{f.sesion.temas.length === 1 ? "" : "s"}
                  </div>
                  {f.sesion.temas.slice(0, 3).map((t, i) => (
                    <div key={i} style={{ fontSize: "13px", color: C.body, marginTop: "5px", lineHeight: 1.45 }}>
                      · {t.titulo}
                      {t.estadoTramite && <span style={{ color: C.ghost }}> — {t.estadoTramite}</span>}
                      {t.expediente && (
                        <span className="dt-num" style={{ fontSize: "11px", color: C.ghost }}>
                          {" "}
                          (exp. {t.expediente})
                        </span>
                      )}
                    </div>
                  ))}
                  {f.sesion.temas.length > 3 && (
                    <div style={{ fontSize: "12px", color: C.ghost, marginTop: "4px" }}>+{f.sesion.temas.length - 3} temas más</div>
                  )}
                </div>
              )}
              {f.sesion.temas.length === 0 && (
                <div style={{ fontSize: "12.5px", color: C.muted, marginTop: "8px" }}>
                  {f.sesion.temarioU ? "Temario oficial publicado — en curaduría." : "Temario aún no publicado en el Plan de Labor."}
                </div>
              )}
              <div style={{ display: "flex", gap: "14px", alignItems: "baseline", flexWrap: "wrap", marginTop: "10px" }}>
                <a
                  href={f.sesion.temarioU || f.sesion.fuenteU}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #F0D9B8" }}
                >
                  {f.sesion.temarioU ? "temario oficial ↗" : "fuente: citación oficial HCDN ↗"}
                </a>
                <span style={{ fontSize: "11px", color: C.ghostest }}>El temario puede cambiar. No se predicen resultados.</span>
              </div>
            </div>
          </Rail>
        ))}

        {/* ---- estado vacío honesto ---- */}
        {futurosDesc.length === 0 && (
          <Rail hueco>
            <div
              style={{
                border: `1.5px dashed ${C.borderDashed}`,
                background: C.cream,
                borderRadius: "14px",
                padding: "16px 18px",
                maxWidth: "720px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Sin sesiones citadas</div>
              <div style={{ fontSize: "12.5px", color: C.muted, lineHeight: 1.5, marginTop: "5px", maxWidth: "560px" }}>
                La Cámara no tiene convocatorias publicadas al corte del {V.corte}. Cuando aparezca una citación en el listado
                oficial, va a estar acá — la fuente se revisa 2 veces por día.
              </div>
              <a
                href={V.agendaFuenteU}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", fontSize: "12px", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #F0D9B8", marginTop: "8px" }}
              >
                fuente: listado oficial de sesiones ↗
              </a>
            </div>
          </Rail>
        )}

        {/* ---- divisor HOY ---- */}
        <Rail pulse>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              className="dt-num"
              style={{
                background: C.ink,
                color: C.paper,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                borderRadius: "20px",
                padding: "4px 13px",
                textTransform: "uppercase",
              }}
            >
              HOY · {hoyLargo()}
            </span>
            <span style={{ flex: 1, height: "1px", background: C.border }}></span>
          </div>
          {V.verificadoHm && (
            <div className="dt-num" style={{ fontSize: "11px", color: C.ghost, marginTop: "8px" }}>
              ✓ datos verificados contra HCDN · {V.verificadoHm} · se revisa 2×/día
            </div>
          )}
        </Rail>

        {/* ---- PASADO (cronología inversa, agrupado por día) ---- */}
        {grupos.map((g) => (
          <div key={g.fecha}>
            <Rail>
              <div className="dt-num" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: C.faint, paddingTop: "1px" }}>
                {diaHeader(g.fecha)}
              </div>
            </Rail>
            {g.items.map((item, i) => (
              <Rail key={g.fecha + "-" + i} hueco={false}>
                {item.kind === "votacion" && (
                  <div
                    onClick={() => V.feedOpenVot(item.idx)}
                    className="hov-row"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: "14px",
                      padding: "16px 18px",
                      cursor: "pointer",
                      maxWidth: "720px",
                      transition: "background .15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <Badge kind={item.vot.resultado === "aprobada" ? "aprobada" : "rechazada"} />
                      <span style={{ fontSize: "15.5px", fontWeight: 600, letterSpacing: "-0.01em" }}>{item.vot.corto}</span>
                      {item.nuevo && <Badge kind="nuevo" />}
                      <span className="dt-num" style={{ fontSize: "11.5px", color: C.ghost, marginLeft: "auto" }}>
                        {item.vot.fecha >= "2026-03-01" ? "ORDINARIAS" : "EXTRAORD."}
                      </span>
                    </div>
                    <div style={{ fontSize: "12.5px", color: C.soft, marginTop: "4px" }}>{item.vot.govLabel}</div>
                    <div style={{ display: "flex", height: "9px", borderRadius: "5px", overflow: "hidden", marginTop: "11px", background: C.chipBg }}>
                      <div style={{ width: (100 * item.vot.af) / 257 + "%", background: C.voteAf }}></div>
                      <div style={{ width: (100 * item.vot.neg) / 257 + "%", background: C.voteNeg }}></div>
                      <div style={{ width: (100 * item.vot.abs) / 257 + "%", background: C.voteAbs }}></div>
                    </div>
                    <div className="dt-num" style={{ display: "flex", gap: "16px", marginTop: "9px", fontSize: "12px", color: C.body, flexWrap: "wrap" }}>
                      <span>
                        <span style={{ color: C.voteAf, fontWeight: 600 }}>{item.vot.af}</span> afirm.
                      </span>
                      <span>
                        <span style={{ color: C.voteNeg, fontWeight: 600 }}>{item.vot.neg}</span> neg.
                      </span>
                      <span>
                        <span style={{ color: C.soft, fontWeight: 600 }}>{item.vot.abs}</span> abst.
                      </span>
                      <span>
                        <span style={{ color: C.soft, fontWeight: 600 }}>{257 - item.vot.af - item.vot.neg - item.vot.abs}</span> sin voto
                      </span>
                      {item.lineaBloc !== undefined && V.feedBlocLabel && (
                        <span style={{ marginLeft: "auto", color: C.muted }}>
                          {V.feedBlocLabel}:{" "}
                          <span style={{ fontWeight: 600, color: item.lineaBloc === "AF" ? C.voteAf : item.lineaBloc === "NEG" ? C.voteNeg : C.soft }}>
                            {item.lineaBloc === "AF" ? "afirmativo" : item.lineaBloc === "NEG" ? "negativo" : item.lineaBloc === "ABS" ? "abstención" : item.lineaBloc === "DIV" ? "dividido" : "sin línea"}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {item.kind === "sesion-reciente" && (
                  <div style={{ maxWidth: "720px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <Badge kind={item.sesion.estado === "fracasada" ? "fracasada" : item.sesion.estado === "no_efectuada" ? "no_efectuada" : "citada"} label={item.sesion.estado === "efectuada" ? "EN CURADURÍA" : undefined} />
                      <span style={{ fontSize: "14.5px", fontWeight: 600 }}>{item.sesion.titulo}</span>
                      {item.nuevo && <Badge kind="nuevo" />}
                    </div>
                    <div style={{ fontSize: "12.5px", color: C.muted, marginTop: "4px", lineHeight: 1.45 }}>
                      {item.sesion.estado === "fracasada"
                        ? "La sesión fracasó según el listado oficial (sin quórum no hay votaciones nominales)."
                        : item.sesion.estado === "no_efectuada"
                          ? "La sesión citada no se efectuó, según el listado oficial."
                          : "La sesión ocurrió; sus votaciones están en curaduría con fuentes."}{" "}
                      <a href={item.sesion.fuenteU} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", textDecoration: "none", borderBottom: "1px solid #F0D9B8" }}>
                        fuente ↗
                      </a>
                    </div>
                  </div>
                )}

                {item.kind === "movimiento" && (
                  <div style={{ maxWidth: "720px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>
                        {item.mov.a ? displayName(item.mov.a) + (item.mov.alta ? " — alta de banca" : " — cambio de bloque") : "Recomposición de bloques"}
                      </span>
                      {item.nuevo && <Badge kind="nuevo" />}
                      {(item.mov.from || item.mov.to) && V.feedBlocInfo && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: C.body }}>
                          {item.mov.from && V.feedBlocInfo[item.mov.from] && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: V.feedBlocInfo[item.mov.from].chip }}></span>
                              {V.feedBlocInfo[item.mov.from].corto}
                            </span>
                          )}
                          {item.mov.from && item.mov.to && <span style={{ color: C.ghost }}>→</span>}
                          {item.mov.to && V.feedBlocInfo[item.mov.to] && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: V.feedBlocInfo[item.mov.to].chip }}></span>
                              {V.feedBlocInfo[item.mov.to].corto}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12.5px", color: C.body, marginTop: "3px", lineHeight: 1.45, maxWidth: "560px" }}>{item.mov.nota}</div>
                    <div className="dt-num" style={{ fontSize: "10.5px", color: C.ghostest, marginTop: "3px" }}>
                      {item.fechaLabel} · fuente: {item.mov.fuente}
                    </div>
                  </div>
                )}
              </Rail>
            ))}
          </div>
        ))}
      </div>

      <div className="dt-num" style={{ fontSize: "10.5px", color: C.ghost, marginTop: "4px", paddingLeft: "26px" }}>
        diputracker.vercel.app · datos oficiales HCDN · corte {V.corte}
      </div>
    </section>
  );
}
