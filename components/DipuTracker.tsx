"use client";
// Controlador central de DipuTracker — port fiel del componente del prototipo
// (design/DipuTracker-Publicable.dc.html). Toda la lógica de estado, routing por hash
// y cómputo de valores de presentación vive acá; las vistas son funciones puras de V.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CtxFile, DipFile, DTData, ITab, Mode, Periodo, SimPos, View, VotFile } from "@/lib/types";
import { type AgendaData, type AgendaFile, AGENDA_VACIA, normalizeAgenda } from "@/lib/agenda";
import { buildFeed, type FeedTipo, parseFeedParams, serializeFeedParams } from "@/lib/feed";
import {
  applyPeriod,
  displayName,
  fdate,
  initials as initialsOf,
  label as labelOf,
  PER_LABEL,
  processData,
  ramp,
  srcView,
  voteView,
} from "@/lib/compute";
import { shareCardDep, shareCardVot } from "@/lib/share-cards";
import { prepDumbbell, prepStrip, prepTiles } from "@/lib/charts";
import { downloadCsv } from "@/lib/csv";
import { useFailedPhotos } from "@/lib/useFailedPhotos";
import CountUp from "@/components/CountUp";
import Hemicycle from "@/components/svg/Hemicycle";
import MiniHemi from "@/components/svg/MiniHemi";
import Sparkline from "@/components/svg/Sparkline";
import SimHemi from "@/components/svg/SimHemi";

import TopChrome from "@/components/views/TopChrome";
import HomeView from "@/components/views/HomeView";
import VotacionView from "@/components/views/VotacionView";
import ComparadorView from "@/components/views/ComparadorView";
import MovView from "@/components/views/MovView";
import SimuladorView from "@/components/views/SimuladorView";
import IndicesView from "@/components/views/IndicesView";
import PatrimonioView from "@/components/views/PatrimonioView";
import FooterView from "@/components/views/FooterView";
import FichaDrawer from "@/components/views/FichaDrawer";
import SearchModal from "@/components/views/SearchModal";

// Props de apariencia (en el prototipo eran props editables del design system)
const FOTOS_EN_LISTAS = true;
const MODO_DALTONICO = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DTVals = Record<string, any>;

interface State {
  view: View;
  mode: Mode;
  loading: boolean;
  loadError: boolean;
  periodo: Periodo;
  searchSel: number;
  fichaId: number | null;
  searchOpen: boolean;
  compareMode: boolean;
  query: string;
  hoverId: number | null;
  selLaw: number;
  vQuery: string;
  filterBloc: string;
  page: number;
  compare: number[];
  copied: string | false;
  sim: Record<string, SimPos>;
  iTab: ITab;
  ixQ: string;
  ixBloc: string;
  ixSort: "desc" | "asc" | "az";
  csvDone: boolean;
  feed: { tipos: FeedTipo[]; bloc: string; dist: string };
}

const PAGE_SIZE = 30;

export default function DipuTracker() {
  const [S, setSFull] = useState<State>({
    view: "home",
    mode: "indice",
    loading: true,
    loadError: false,
    periodo: "todo",
    searchSel: 0,
    fichaId: null,
    searchOpen: false,
    compareMode: false,
    query: "",
    hoverId: null,
    selLaw: 0,
    vQuery: "",
    filterBloc: "",
    page: 0,
    compare: [],
    copied: false,
    sim: {},
    iTab: "ali",
    ixQ: "",
    ixBloc: "",
    ixSort: "desc",
    csvDone: false,
    feed: { tipos: ["vot", "ses", "mov"], bloc: "", dist: "" },
  });
  const setS = useCallback((patch: Partial<State> | ((s: State) => Partial<State>)) => {
    setSFull((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
  }, []);

  const Dref = useRef<DTData | null>(null);
  const agendaRef = useRef<AgendaData>(AGENDA_VACIA);
  const Pref = useRef<number[]>([]);
  const silentRef = useRef(false);
  const lastResRef = useRef<DTData["deps"]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [, forceTick] = useState(0);
  const bump = () => forceTick((t) => t + 1);

  const stateRef = useRef(S);
  stateRef.current = S;

  // Fotos oficiales que no cargan → se muestran las iniciales en vez de un disco vacío.
  const photoUrls = useMemo(
    () => (Dref.current ? Dref.current.deps.map((d) => d.foto).filter((f): f is string => !!f) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [S.loading]
  );
  const failedPhotos = useFailedPhotos(photoUrls);

  // ---------- helpers con estado ----------
  const setHash = useCallback((h: string) => {
    silentRef.current = true;
    if ("#" + h !== location.hash) location.hash = h;
  }, []);

  const applyHash = useCallback(() => {
    const D = Dref.current;
    if (!D) return;
    const h = (location.hash || "").replace(/^#\/?/, "");
    // query-in-hash (#/panel?per=ord&bloc=lla): el path se separa ANTES del split por
    // segmentos, así las rutas existentes (que nunca llevan "?") se parsean idéntico
    const [path, query = ""] = h.split("?");
    const p = path.split("/");
    if (p[0] === "diputado" && p[1] != null) {
      const id = parseInt(p[1], 10);
      if (D.byId[id]) {
        setS({ fichaId: id });
        return;
      }
    }
    if (p[0] === "votacion" && p[1]) {
      const i = D.votaciones.findIndex((v) => v.id === p[1]);
      if (i >= 0) {
        setS({ view: "votacion", selLaw: i, fichaId: null });
        return;
      }
    }
    if (p[0] === "indices") {
      const map: Record<string, ITab> = { alineamiento: "ali", disciplina: "dis", poder: "pow", rupturas: "rup", territorio: "ter" };
      setS({ view: "indices", iTab: map[p[1]] || "ali", fichaId: null });
      return;
    }
    if (p[0] === "patrimonio") {
      setS({ view: "patrimonio", fichaId: null });
      return;
    }
    if (p[0] === "comparador") {
      const st: Partial<State> = { view: "comparador", fichaId: null };
      if (p[1]) {
        const ids = p[1]
          .split(",")
          .map((x) => parseInt(x, 10))
          .filter((x) => D.byId[x] != null)
          .slice(0, 3);
        if (ids.length) st.compare = ids;
      }
      setS(st);
      return;
    }
    if (p[0] === "movimientos") {
      setS({ view: "mov", fichaId: null });
      return;
    }
    if (p[0] === "simulador") {
      setS({ view: "simulador", fichaId: null });
      return;
    }
    if (p[0] === "panel" || p[0] === "") {
      // filtros del feed desde la URL (#/panel?per=ord&bloc=lla&feed=vot,ses)
      const fp = parseFeedParams(query);
      const bloc = D.blocMap[fp.bloc] ? fp.bloc : ""; // validación final contra bloques reales
      if (fp.per !== stateRef.current.periodo) Pref.current = applyPeriod(D, fp.per);
      setS({ view: "home", fichaId: null, periodo: fp.per, feed: { tipos: fp.tipos, bloc, dist: fp.dist } });
    }
  }, [setS]);

  // hash del panel con los filtros vigentes serializados (URLs limpias: solo no-defaults)
  const panelHash = useCallback((over: Partial<State["feed"] & { per: Periodo }> = {}) => {
    const st = stateRef.current;
    return (
      "/panel" +
      serializeFeedParams({
        per: over.per ?? st.periodo,
        tipos: over.tipos ?? st.feed.tipos,
        bloc: over.bloc ?? st.feed.bloc,
        dist: over.dist ?? st.feed.dist,
      })
    );
  }, []);

  // ---------- carga de datos ----------
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/data/diputados.json").then((r) => r.json() as Promise<DipFile>),
      fetch("/data/votaciones.json").then((r) => r.json() as Promise<VotFile>),
      fetch("/data/contexto.json").then((r) => r.json() as Promise<CtxFile>),
      // agenda.json es el único dataset OPCIONAL: si falta (deploy de UI antes que el de
      // datos), si el 404 de Vercel devuelve HTML, o si viene malformado, la app funciona
      // igual con agenda vacía. Triple tolerancia: r.ok cubre el 404, el catch cubre red
      // y JSON inválido. loadError queda reservado a los 3 datasets críticos.
      fetch("/data/agenda.json")
        .then((r) => (r.ok ? (r.json() as Promise<AgendaFile>) : null))
        .catch((): AgendaFile | null => null),
    ])
      .then(([dip, vot, ctx, agendaRaw]) => {
        if (!alive) return;
        Dref.current = processData(dip, vot, ctx);
        agendaRef.current = normalizeAgenda(agendaRaw, new Date().toISOString().slice(0, 10));
        Pref.current = applyPeriod(Dref.current, "todo");
        setS({ loading: false });
        setTimeout(() => applyHash(), 0);
      })
      .catch(() => alive && setS({ loading: false, loadError: true }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- teclado + hashchange ----------
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const st = stateRef.current;
      if (ev.key === "Escape") {
        if (st.searchOpen) setS({ searchOpen: false });
        else if (st.fichaId != null) closeFicha();
      }
      if (st.searchOpen && lastResRef.current.length) {
        if (ev.key === "ArrowDown") {
          ev.preventDefault();
          setS((s) => ({ searchSel: Math.min(lastResRef.current.length - 1, s.searchSel + 1) }));
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          setS((s) => ({ searchSel: Math.max(0, s.searchSel - 1) }));
        } else if (ev.key === "Enter") {
          ev.preventDefault();
          const d = lastResRef.current[Math.min(st.searchSel, lastResRef.current.length - 1)];
          if (d) pickSearch(d.id);
        }
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setS({ searchOpen: true, compareMode: false, query: "", searchSel: 0 });
      }
    };
    const onHash = () => {
      if (!silentRef.current) {
        applyHash();
        if (!/^#\/?diputado/.test(location.hash)) window.scrollTo(0, 0);
      }
      silentRef.current = false;
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- navegación ----------
  const setView = (v: View, hash: string) => {
    setS({ view: v, fichaId: null });
    setHash(hash);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };
  const openFicha = (id: number) => {
    setS({ fichaId: id, copied: false });
    setHash("/diputado/" + id);
  };
  const compHash = (list: number[]) => "/comparador" + (list && list.length ? "/" + list.join(",") : "");
  const closeFicha = () => {
    const st = stateRef.current;
    const D = Dref.current;
    setS({ fichaId: null });
    setHash(
      st.view === "votacion" && D
        ? "/votacion/" + D.votaciones[st.selLaw].id
        : st.view === "comparador"
          ? compHash(st.compare)
          : ({ mov: "/movimientos", simulador: "/simulador", indices: "/indices", patrimonio: "/patrimonio" } as Record<string, string>)[st.view] ||
            panelHash() // preserva los filtros del feed al cerrar la ficha
    );
  };
  const addToCompare = (id: number): number[] => {
    const cur = stateRef.current.compare;
    if (cur.indexOf(id) >= 0 || cur.length >= 3) return cur;
    const n = cur.concat([id]);
    setS({ compare: n });
    return n;
  };
  const pickSearch = (id: number) => {
    const st = stateRef.current;
    if (st.compareMode) {
      const n = addToCompare(id);
      setS({ searchOpen: false, view: "comparador" });
      setHash(compHash(n));
      window.scrollTo(0, 0);
    } else {
      setS({ searchOpen: false });
      openFicha(id);
    }
  };
  const setPeriodo = (p: Periodo) => {
    const D = Dref.current;
    if (!D || stateRef.current.periodo === p) return;
    Pref.current = applyPeriod(D, p);
    setS({ periodo: p });
  };
  const flash = (key: string, val: string, ms = 2400) => {
    setS({ copied: val });
    clearTimeout(timersRef.current[key]);
    timersRef.current[key] = setTimeout(() => setS({ copied: false }), ms);
  };

  // ---------- cómputo de V (port de renderVals) ----------
  const V: DTVals = useMemo(() => {
    const num = (to: number) => <CountUp to={to} />;
    const fotoCss = (d: DTData["deps"][number]) =>
      FOTOS_EN_LISTAS && d.foto && !failedPhotos.has(d.foto) ? `url('${d.foto}')` : "none";
    const iniOf = (d: DTData["deps"][number]) => (fotoCss(d) === "none" ? initialsOf(d.a) : "");
    const swatch = (v: number | null) => (v == null ? "#C9C4BA" : ramp(v / 100, MODO_DALTONICO));
    const rampD = (t: number) => ramp(t, MODO_DALTONICO);

    const out: DTVals = {
      loading: S.loading,
      loadError: S.loadError,
      ready: !S.loading && !S.loadError,
      isHome: S.view === "home",
      isVotacion: S.view === "votacion",
      isComparador: S.view === "comparador",
      isMov: S.view === "mov",
      isSimulador: S.view === "simulador",
      isIndices: S.view === "indices",
      isPatrimonio: S.view === "patrimonio",
      goHome: () => setView("home", panelHash()),
      goVotacion: () => setView("votacion", "/votacion/" + (Dref.current ? Dref.current.votaciones[S.selLaw].id : "")),
      goComparador: () => setView("comparador", "/comparador"),
      goMov: () => setView("mov", "/movimientos"),
      goSimulador: () => setView("simulador", "/simulador"),
      goIndices: () => setView("indices", "/indices"),
      goPatrimonio: () => setView("patrimonio", "/patrimonio"),
      openSearch: () => setS({ searchOpen: true, compareMode: false, query: "", searchSel: 0 }),
      openSearchCompare: () => setS({ searchOpen: true, compareMode: true, query: "", searchSel: 0 }),
      closeSearch: () => setS({ searchOpen: false }),
      stop: (e: React.MouseEvent) => e.stopPropagation(),
      searchOpen: S.searchOpen,
      compareMode: S.compareMode,
      query: S.query,
      fichaOpen: false,
      ramp: rampD,
      swatch,
      num,
      fotoCss,
      iniOf,
    };
    const navBg = (v: View) => (S.view === v ? "#1C1A17" : "transparent");
    const navFg = (v: View) => (S.view === v ? "#FAFAF9" : "#57534E");
    out.navHomeBg = navBg("home");
    out.navHomeFg = navFg("home");
    out.navVotBg = navBg("votacion");
    out.navVotFg = navFg("votacion");
    out.navIdxBg = navBg("indices");
    out.navIdxFg = navFg("indices");
    out.navPatBg = navBg("patrimonio");
    out.navPatFg = navFg("patrimonio");
    out.navSimBg = navBg("simulador");
    out.navSimFg = navFg("simulador");

    const D = Dref.current;
    if (!D) return out;
    const P = Pref.current || [];

    // corte de datos (derivado del dataset, no hardcodeado)
    const corteIsoStr = dataCorte(D);
    const corte = corteIsoStr; // ISO — las tarjetas y el CSV lo usan crudo
    out.corte = fdate(corteIsoStr);
    out.corteIso = corteIsoStr;
    out.nVots = D.votaciones.length;
    const WORDS = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"];
    out.nVotsWord = WORDS[D.votaciones.length] || String(D.votaciones.length);
    out.nomConsultado = fdate(D.metaDip.consultado);
    out.perTodoCount = D.votaciones.length;
    out.perExtCount = D.votaciones.filter((v) => v.fecha <= "2026-02-28").length;
    out.perOrdCount = D.votaciones.filter((v) => v.fecha >= "2026-03-01").length;

    const perBg = (k: Periodo) => (S.periodo === k ? "#1C1A17" : "#FFFFFF");
    const perFg = (k: Periodo) => (S.periodo === k ? "#FAFAF9" : "#57534E");
    const perBd = (k: Periodo) => (S.periodo === k ? "#1C1A17" : "#E0DBD0");
    const cambiarPeriodo = (p: Periodo) => {
      setPeriodo(p);
      // el período vive también en la URL cuando estamos en el panel (link compartible)
      if (stateRef.current.view === "home") setHash(panelHash({ per: p }));
    };
    out.perTodo = () => cambiarPeriodo("todo");
    out.perExt = () => cambiarPeriodo("ext");
    out.perOrd = () => cambiarPeriodo("ord");
    out.perTodoBg = perBg("todo");
    out.perTodoFg = perFg("todo");
    out.perTodoBorder = perBd("todo");
    out.perExtBg = perBg("ext");
    out.perExtFg = perFg("ext");
    out.perExtBorder = perBd("ext");
    out.perOrdBg = perBg("ord");
    out.perOrdFg = perFg("ord");
    out.perOrdBorder = perBd("ord");

    // modos del hemiciclo
    out.modeIsDisidencia = S.mode === "disidencia";
    out.modeIsPoder = S.mode === "poder";
    const mBg = (m: Mode) => (S.mode === m ? "#FFFFFF" : "transparent");
    const mFg = (m: Mode) => (S.mode === m ? "#1C1A17" : "#78736A");
    const mSh = (m: Mode) => (S.mode === m ? "0 1px 2px rgba(28,26,23,.12)" : "none");
    out.setIndice = () => setS({ mode: "indice" });
    out.setBloque = () => setS({ mode: "bloque" });
    out.setInter = () => setS({ mode: "inter" });
    out.setPoder = () => setS({ mode: "poder" });
    out.setDisidencia = () => setS({ mode: "disidencia" });
    out.modeIndiceBg = mBg("indice");
    out.modeIndiceFg = mFg("indice");
    out.modeIndiceSh = mSh("indice");
    out.modeBloqueBg = mBg("bloque");
    out.modeBloqueFg = mFg("bloque");
    out.modeBloqueSh = mSh("bloque");
    out.modeInterBg = mBg("inter");
    out.modeInterFg = mFg("inter");
    out.modeInterSh = mSh("inter");
    out.modePoderBg = mBg("poder");
    out.modePoderFg = mFg("poder");
    out.modePoderSh = mSh("poder");
    out.modeDisBg = mBg("disidencia");
    out.modeDisFg = mFg("disidencia");
    out.modeDisSh = mSh("disidencia");
    out.modeHint =
      S.mode === "indice"
        ? "Las bancas se ordenan de la oposición firme (izquierda) al oficialismo (derecha) según el índice provisional. Las grises no tienen datos todavía."
        : S.mode === "bloque"
          ? "Bancas agrupadas por bloque en el espectro de alineamiento, con la identidad de cada bloque oficial."
          : S.mode === "inter"
            ? "Los dos interbloques oficiales — Fuerza del Cambio (PRO + UCR + MID + aliados) y Unidos (Provincias Unidas + Encuentro Federal) — coloreados sobre el resto de la Cámara."
            : S.mode === "poder"
              ? "Cada banca se pinta por el poder de bisagra de su bloque (Banzhaf) por banca: cuanto más intensa, más decisivo es su voto respecto de su tamaño. Los bloques provinciales se encienden pese a ser chicos."
              : "Bancas coloreadas por conducta; con anillo, las que rompieron con su bloque o cuya ausencia tuvo lectura política en este set de votaciones.";
    out.legendTitle =
      S.mode === "bloque"
        ? "Bloques oficiales"
        : S.mode === "inter"
          ? "Interbloques oficiales"
          : S.mode === "poder"
            ? "Poder de decisión por banca"
            : "Escala del índice provisional";
    out.legendIsRamp = S.mode === "indice" || S.mode === "disidencia";
    out.legendIsChips = S.mode === "bloque" || S.mode === "inter";
    out.legendIsPower = S.mode === "poder";

    if (S.mode === "poder") {
      const maxP = Math.max(...D.power.list.map((p) => p.power));
      const fmt1 = (x: number) => x.toFixed(1).replace(".", ",");
      out.powerRows = D.power.list
        .slice()
        .sort((a, b) => b.power - a.power)
        .map((p) => {
          const b = D.blocMap[p.k];
          return {
            nombre: b.nombre,
            chip: b.chip,
            count: p.size + (p.size === 1 ? " banca" : " bancas"),
            power: fmt1(p.power) + "%",
            ratio: p.ratio.toFixed(2).replace(".", ",") + "×",
            barW: ((100 * p.power) / maxP).toFixed(1) + "%",
            seatW: ((100 * p.seatPct) / maxP).toFixed(1) + "%",
            ratioColor: p.ratio >= 1.15 ? "#B45309" : p.ratio <= 0.9 ? "#0F766E" : "#78736A",
            barColor: p.ratio >= 1.15 ? "#B45309" : "#1C1A17",
          };
        });
    }
    if (S.mode === "bloque") {
      out.legendChips = D.bloques
        .filter((b) => D.deps.filter((d) => d.b === b.k).length >= 2)
        .map((b) => ({ short: b.corto, chip: b.chip, count: D.deps.filter((d) => d.b === b.k).length }));
    } else if (S.mode === "inter") {
      out.legendChips = [
        { short: "La Libertad Avanza", chip: "#7C3AED", count: D.deps.filter((d) => d.b === "LLA").length },
        { short: "Unión por la Patria", chip: "#38BDF8", count: D.deps.filter((d) => d.b === "UXP").length },
      ]
        .concat(
          D.ctx.interbloques.lista.map((ib) => ({
            short: "Interbloque " + ib.nombre,
            chip: ib.chip,
            count: ib.bloques.reduce((a, k) => a + D.deps.filter((d) => d.b === k).length, 0),
          }))
        )
        .concat([
          {
            short: "Sin interbloque",
            chip: "#B8B2A6",
            count: D.deps.filter((d) => d.b !== "LLA" && d.b !== "UXP" && !D.inter[d.b]).length,
          },
        ]);
    }

    out.hemicycle = (
      <Hemicycle
        D={D}
        mode={S.mode}
        hoverId={S.hoverId}
        daltonico={MODO_DALTONICO}
        failedPhotos={failedPhotos}
        onHover={(id) => setS({ hoverId: id })}
        onOpen={(id) => openFicha(id)}
      />
    );

    // disidencias
    const disDeps = D.deps.filter((d) => d.hasExc);
    out.disCount = disDeps.length + " bancas con registro individual";
    out.disList = disDeps.map((d) => {
      const i = d.votes.findIndex((x) => x.src === "exc");
      const x = d.votes[i];
      const vv = voteView(x.v, x.src);
      return {
        nombre: displayName(d.a),
        initials: iniOf(d),
        swatch: swatch(d.indice),
        fotoCss: fotoCss(d),
        chip: d.chip,
        blocShort: d.blocShort,
        tag: x.nota,
        voteLabel: vv.label,
        dirColor: x.v === "AF" ? "#B45309" : x.v === "NEG" ? "#0F766E" : "#78736A",
        votShort: D.votaciones[i].corto,
        onClick: () => openFicha(d.id),
      };
    });

    // composición
    const sortedComp = D.bloques
      .map((b) => ({ b, count: D.deps.filter((d) => d.b === b.k).length }))
      .sort((a, c) => c.count - a.count);
    out.blocComp = sortedComp.map((x) => ({
      short: x.b.corto,
      count: x.count,
      chip: x.b.chip,
      w: ((100 * x.count) / 257).toFixed(3) + "%",
      tip: x.b.nombre + " · " + x.count + " bancas",
    }));

    // votaciones (home)
    out.votesHome = D.votaciones.map((v, i) => ({
      corto: v.corto,
      fecha: fdate(v.fecha),
      govLabel: v.govLabel,
      perLabel: v.fecha >= "2026-03-01" ? "ORDINARIAS" : "EXTRAORD.",
      resLabel: v.resultado === "aprobada" ? "Aprobada" : "Rechazada",
      resColor: v.resultado === "aprobada" ? "#2F6F4E" : "#9B3022",
      af: v.af,
      neg: v.neg,
      abs: v.abs,
      sv: 257 - v.af - v.neg - v.abs,
      afW: (100 * v.af) / 257 + "%",
      negW: (100 * v.neg) / 257 + "%",
      absW: (100 * v.abs) / 257 + "%",
      onOpen: () => {
        setS({ view: "votacion", selLaw: i, page: 0 });
        setHash("/votacion/" + v.id);
        window.scrollTo(0, 0);
      },
    }));

    // movimientos (home)
    out.movHome = D.ctx.movimientos.map((m) => ({
      fecha: m.fecha,
      titulo: m.a ? displayName(m.a) + (m.alta ? " — alta de banca" : " — cambio de bloque") : "Recomposición de bloques",
      nota: m.nota,
    }));

    // ---- FEED (crónica del período) + AHORA (glue mínimo: el cómputo vive en lib/feed.ts) ----
    out.feed = buildFeed(D, agendaRef.current, { per: S.periodo, tipos: S.feed.tipos, bloc: S.feed.bloc, dist: S.feed.dist }, corte);
    // "verificado hoy hh:mm" solo si la corrida fue HOY en hora argentina; si no, la fecha real
    out.verificadoHm = null;
    if (agendaRef.current.consultado) {
      const ts = new Date(agendaRef.current.consultado);
      const art = (o: Intl.DateTimeFormatOptions) => ts.toLocaleString("es-AR", { ...o, timeZone: "America/Argentina/Buenos_Aires" });
      const hm = art({ hour: "2-digit", minute: "2-digit", hour12: false });
      const fechaArt = ts.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
      const hoyArt = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
      out.verificadoHm = (fechaArt === hoyArt ? "hoy" : fdate(fechaArt)) + " · " + hm;
    }
    out.agendaFuenteU = agendaRef.current.fuentes[0]?.u || "https://www.diputados.gov.ar/sesiones/";
    const ultimaVot = D.votaciones[D.votaciones.length - 1];
    out.ahoraUltima = ultimaVot
      ? {
          fecha: fdate(ultimaVot.fecha),
          corto: ultimaVot.corto,
          resultado: ultimaVot.resultado,
          totales: ultimaVot.af + "-" + ultimaVot.neg + "-" + ultimaVot.abs,
          onOpen: () => {
            setS({ view: "votacion", selLaw: D.votaciones.length - 1, fichaId: null });
            setHash("/votacion/" + ultimaVot.id);
            window.scrollTo(0, 0);
          },
        }
      : null;
    out.ahoraProxima = agendaRef.current.proximas[0] || null;
    out.feedTipos = S.feed.tipos;
    out.feedBloc = S.feed.bloc;
    out.feedBlocLabel = S.feed.bloc ? D.blocMap[S.feed.bloc]?.corto || "" : "";
    out.feedBlocInfo = D.blocMap;
    const setFeed = (patch: Partial<State["feed"]>) => {
      const next = { ...stateRef.current.feed, ...patch };
      setS({ feed: next });
      setHash("/panel" + serializeFeedParams({ per: stateRef.current.periodo, ...next }));
    };
    out.feedSetBloc = (k: string) => setFeed({ bloc: D.blocMap[k] ? k : "" });
    out.feedToggleTipo = (t: FeedTipo) => {
      const cur = stateRef.current.feed.tipos;
      const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
      if (next.length) setFeed({ tipos: next }); // siempre queda al menos un tipo activo
    };
    const blocSizes = new Map<string, number>();
    D.deps.forEach((d) => blocSizes.set(d.b, (blocSizes.get(d.b) || 0) + 1));
    const blocsTop = D.bloques
      .slice()
      .sort((a, b) => (blocSizes.get(b.k) || 0) - (blocSizes.get(a.k) || 0))
      .slice(0, 6);
    if (S.feed.bloc && !blocsTop.some((b) => b.k === S.feed.bloc) && D.blocMap[S.feed.bloc]) blocsTop.push(D.blocMap[S.feed.bloc]);
    out.feedBlocChips = blocsTop.map((b) => ({ k: b.k, corto: b.corto, chip: b.chip, sel: S.feed.bloc === b.k }));
    out.feedBlocOptions = D.bloques.map((b) => ({ value: b.k, label: b.corto }));
    out.feedOpenVot = (i: number) => {
      setS({ view: "votacion", selLaw: i, fichaId: null });
      setHash("/votacion/" + D.votaciones[i].id);
      window.scrollTo(0, 0);
    };
    // strip plot condensado de la home (⑧ Cinco lecturas) — respeta el filtro de bloque
    out.stripHome = prepStrip(D.deps, { bloc: S.feed.bloc });
    out.homeChartChips = [PER_LABEL[S.periodo]].concat(S.feed.bloc && D.blocMap[S.feed.bloc] ? [D.blocMap[S.feed.bloc].corto] : []);
    out.daltonico = MODO_DALTONICO;
    out.stripOpen = (id: number) => openFicha(id);

    // comparador teaser
    const findByName = (n: string) => D.deps.find((d) => d.a === n);
    const teaserDefaults = [findByName("Menem, Martín"), findByName("Grabois, Juan"), findByName("Schiaretti, Juan")]
      .filter(Boolean)
      .map((d) => d!.id);
    const teaserIds = S.compare.length ? S.compare : teaserDefaults;
    out.compareTeaser = teaserIds.slice(0, 3).map((id) => {
      const d = D.byId[id];
      return {
        initials: iniOf(d),
        nombre: displayName(d.a),
        indice: d.indice == null ? "—" : d.indice,
        swatch: swatch(d.indice),
        fotoCss: fotoCss(d),
        onClick: () => openFicha(d.id),
      };
    });

    // ---- VOTACIÓN ----
    if (S.view === "votacion") {
      const v = D.votaciones[S.selLaw];
      out.selLawTitle = v.titulo;
      out.selLawDate = fdate(v.fecha);
      out.selLawGov = v.govLabel;
      out.selLawSesion = v.sesion;
      out.selResLabel = v.resultado === "aprobada" ? "Aprobada" : "Rechazada";
      out.selResColor = v.resultado === "aprobada" ? "#2F6F4E" : "#9B3022";
      out.selResBorder = v.resultado === "aprobada" ? "#BFE0CC" : "#E5C4BD";
      out.tAf = num(v.af);
      out.tNeg = num(v.neg);
      out.tAbs = num(v.abs);
      out.tSv = num(257 - v.af - v.neg - v.abs);
      out.miniHemi = <MiniHemi D={D} selLaw={S.selLaw} />;
      const assigned = D.deps.filter((d) => d.votes[S.selLaw].v != null).length;
      out.coverage = "Posición asignada en " + assigned + " de 257 bancas · totales según acta oficial";
      out.shareVotLabel = S.copied === "imgv" ? "✓ tarjeta descargada" : "Descargar tarjeta del resultado (PNG)";
      out.shareVotCard = () => {
        shareCardVot(v, fdate(corte));
        flash("imgv", "imgv");
      };
      out.lawChips = D.votaciones.map((vv, i) => ({
        corto: vv.corto,
        onPick: () => {
          setS({ selLaw: i, page: 0 });
          setHash("/votacion/" + vv.id);
        },
        bg: i === S.selLaw ? "#1C1A17" : "#FFFFFF",
        fg: i === S.selLaw ? "#FAFAF9" : "#57534E",
        border: i === S.selLaw ? "#1C1A17" : "#E0DBD0",
        weight: i === S.selLaw ? 600 : 500,
      }));
      out.hasExc = v.excepciones.length > 0;
      out.excList = v.excepciones.map((x) => {
        const d = D.deps.find((dd) => dd.a === x.a);
        const vv = voteView(x.v, "exc");
        return {
          nombre: displayName(x.a),
          nota: x.nota,
          label: vv.label,
          fg: vv.fg,
          bg: vv.bg,
          border: vv.border,
          onClick: () => d && openFicha(d.id),
        };
      });
      out.selNotas = v.notas.map((t) => ({ t }));
      out.selFuentes = v.fuentes;
      out.blocRows = D.bloques
        .map((b) => {
          const line = v.lineas[b.k];
          const count = D.deps.filter((d) => d.b === b.k).length;
          let lbl: string, fg: string, bg: string, border: string;
          if (line === "AF" || line === "NEG" || line === "ABS") {
            const vv = voteView(line);
            lbl = vv.label;
            fg = vv.fg;
            bg = vv.bg;
            border = vv.border;
          } else if (line === "DIV") {
            lbl = "Dividido";
            fg = "#8A857A";
            bg = "#FBFAF7";
            border = "#DED8CC";
          } else {
            lbl = "Sin línea doc.";
            fg = "#B0AB9F";
            bg = "#FBFAF7";
            border = "#EFEBE3";
          }
          const excB = v.excepciones.filter((x) => {
            const d = D.deps.find((dd) => dd.a === x.a);
            return d && d.b === b.k;
          });
          return {
            nombre: b.nombre,
            chip: b.chip,
            count: count + (count === 1 ? " banca" : " bancas"),
            label: lbl,
            fg,
            bg,
            border,
            hasNota: excB.length > 0,
            nota: excB.length ? excB.length + (excB.length === 1 ? " registro individual" : " registros individuales") : "",
          };
        })
        .sort((a, c) => parseInt(c.count) - parseInt(a.count));
      out.blocOptions = [{ value: "", label: "Todos los bloques" }].concat(D.bloques.map((b) => ({ value: b.k, label: b.corto })));
      out.filterBloc = S.filterBloc;
      out.vQuery = S.vQuery;
      out.onFilterBloc = (e: React.ChangeEvent<HTMLSelectElement>) => setS({ filterBloc: e.target.value, page: 0 });
      out.onVQuery = (e: React.ChangeEvent<HTMLInputElement>) => setS({ vQuery: e.target.value, page: 0 });
      let filtered = D.deps.filter(
        (d) => (!S.filterBloc || d.b === S.filterBloc) && (!S.vQuery || d.a.toLowerCase().indexOf(S.vQuery.toLowerCase()) >= 0)
      );
      filtered = filtered.slice().sort((a, b) => a.a.localeCompare(b.a));
      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(S.page, pages - 1);
      const slice = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      out.votRows = slice.map((d) => {
        const x = d.votes[S.selLaw];
        const vv = voteView(x.v, x.src);
        const sv = srcView(x.src);
        return {
          nombre: displayName(d.a),
          blocShort: d.blocShort,
          distrito: d.d,
          initials: iniOf(d),
          swatch: swatch(d.indice),
          fotoCss: fotoCss(d),
          voteLabel: vv.label,
          voteBg: vv.bg,
          voteBorder: vv.border,
          voteFg: vv.fg,
          srcLabel: sv.label,
          srcTip: sv.tip,
          onClick: () => openFicha(d.id),
        };
      });
      out.votCountLabel = total
        ? "Mostrando " + (page * PAGE_SIZE + 1) + "–" + Math.min(total, page * PAGE_SIZE + PAGE_SIZE) + " de " + total
        : "0 resultados";
      out.prevPage = () => setS((s) => ({ page: Math.max(0, s.page - 1) }));
      out.nextPage = () => setS((s) => ({ page: Math.min(pages - 1, s.page + 1) }));
    }

    // ---- COMPARADOR ----
    if (S.view === "comparador") {
      out.compareEmpty = S.compare.length === 0;
      out.compareHas = S.compare.length > 0;
      out.canAddCompare = S.compare.length > 0 && S.compare.length < 3;
      out.compareCols = "repeat(" + Math.min(3, S.compare.length + (S.compare.length < 3 ? 1 : 0)) + ", 1fr)";
      out.compareCards = S.compare.map((id) => {
        const d = D.byId[id];
        return {
          initials: iniOf(d),
          nombre: displayName(d.a),
          blocName: d.blocName,
          distrito: d.d,
          chip: d.chip,
          fotoCss: fotoCss(d),
          indice: d.indice == null ? "—" : d.indice,
          swatch: swatch(d.indice),
          indiceNota: d.counted ? "sobre " + d.counted + " votaciones" : "sin datos",
          label: d.indice == null ? "Sin votaciones computables" : labelOf(d.indice),
          onRemove: () => {
            const n = stateRef.current.compare.filter((x) => x !== id);
            setS({ compare: n });
            setHash(compHash(n));
          },
          onOpen: () => openFicha(d.id),
          votes: D.votaciones.map((vv, i) => {
            const x = d.votes[i];
            const w = voteView(x.v, x.src);
            return { corto: vv.corto, label: w.label, sw: w.sw, border: w.border, fg: w.fg };
          }),
        };
      });
      out.compareLinkLabel = S.copied === "cmp" ? "✓ link copiado" : "copiar link de esta comparación";
      out.copyCompareLink = () => {
        const u = location.href.split("#")[0] + "#" + compHash(S.compare);
        if (navigator.clipboard) navigator.clipboard.writeText(u);
        flash("cmp", "cmp");
      };
    }

    // ---- MOVIMIENTOS ----
    if (S.view === "mov") {
      out.interCards = D.ctx.interbloques.lista.map((ib) => ({
        nombre: "Interbloque " + ib.nombre,
        pres: displayName(ib.pres),
        total: ib.bloques.reduce((a, k) => a + D.deps.filter((d) => d.b === k).length, 0),
        chips: ib.bloques.map((k) => {
          const b = D.blocMap[k];
          return { short: b.corto, chip: b.chip, count: D.deps.filter((d) => d.b === k).length };
        }),
      }));
      out.movFull = D.ctx.movimientos.map((m) => ({
        fecha: m.fecha,
        titulo: m.a ? displayName(m.a) + (m.alta ? " — alta de banca" : " — cambio de bloque") : "Recomposición de bloques dic-2025 → jul-2026",
        nota: m.nota,
        fuente: "Fuente: " + m.fuente,
      }));
      out.dietaMonto = D.ctx.dieta.monto;
      out.dietaExtra = D.ctx.dieta.extra;
      out.dietaNeto = D.ctx.dieta.neto;
      out.dietaNota = D.ctx.dieta.nota;
      out.dietaFuente = D.ctx.dieta.fuente;
      out.dietaFecha = D.ctx.dieta.fecha;
      out.ddjjNota = D.ctx.ddjj.nota;
    }
    out.dietaU = D.ctx.dieta.u;
    out.ddjjU = D.ctx.ddjj.u;
    out.interbloquesFuenteNota =
      "Fuente: listado oficial de interbloques de la HCDN, consultado el " +
      fdate(D.metaDip.consultado) +
      ". El resto de los bloques no integra interbloques.";

    out.csvLabel = S.csvDone ? "✓ descargado" : "Descargar CSV";
    out.csvLabelFooter = S.csvDone ? "✓ dataset descargado" : "Dataset completo (CSV) ↓";
    out.downloadCsv = () => {
      downloadCsv(D, P, S.periodo, dataCorte(D));
      setS({ csvDone: true });
      clearTimeout(timersRef.current.csv);
      timersRef.current.csv = setTimeout(() => setS({ csvDone: false }), 2600);
    };
    out.patDietaMonto = D.ctx.dieta.monto;
    out.patDietaExtra = D.ctx.dieta.extra;
    out.patDietaNeto = D.ctx.dieta.neto;
    out.patDietaNota = D.ctx.dieta.nota;
    out.patDietaFuente = D.ctx.dieta.fuente;
    out.patDietaFecha = D.ctx.dieta.fecha;
    out.patDietaU = D.ctx.dieta.u;

    // ---- ÍNDICES ----
    if (S.view === "indices") {
      const tb = (m: ITab) => (S.iTab === m ? "#FFFFFF" : "transparent");
      const tf = (m: ITab) => (S.iTab === m ? "#1C1A17" : "#78736A");
      const tsh = (m: ITab) => (S.iTab === m ? "0 1px 2px rgba(28,26,23,.12)" : "none");
      const setTab = (t: ITab, slug: string) => () => {
        setS({ iTab: t });
        setHash("/indices/" + slug);
      };
      out.tabAli = setTab("ali", "alineamiento");
      out.tabDis = setTab("dis", "disciplina");
      out.tabPow = setTab("pow", "poder");
      out.tabRup = setTab("rup", "rupturas");
      out.tabTer = setTab("ter", "territorio");
      out.tabAliBg = tb("ali");
      out.tabAliFg = tf("ali");
      out.tabAliSh = tsh("ali");
      out.tabDisBg = tb("dis");
      out.tabDisFg = tf("dis");
      out.tabDisSh = tsh("dis");
      out.tabPowBg = tb("pow");
      out.tabPowFg = tf("pow");
      out.tabPowSh = tsh("pow");
      out.tabRupBg = tb("rup");
      out.tabRupFg = tf("rup");
      out.tabRupSh = tsh("rup");
      out.tabTerBg = tb("ter");
      out.tabTerFg = tf("ter");
      out.tabTerSh = tsh("ter");
      out.tabIsAli = S.iTab === "ali";
      out.tabIsDis = S.iTab === "dis";
      out.tabIsPow = S.iTab === "pow";
      out.tabIsRup = S.iTab === "rup";
      out.tabIsTer = S.iTab === "ter";

      const EXPL: Record<ITab, { que: string; como: string; lim: string }> = {
        ali: {
          que: "El porcentaje de posiciones a favor del gobierno nacional sobre las votaciones que computan para cada banca: 100 acompañó siempre, 0 nunca. Es conducta, no afiliación.",
          como:
            "Las votaciones del período seleccionado en el panel — hoy hasta once: extraordinarias dic–feb y ordinarias abr–jun 2026. Cada banca toma la posición documentada de su bloque; los votos y ausencias individuales con registro la pisan. La ausencia no computa en el denominador; la abstención sí.",
          lim: "Es provisional a nivel bloque: sin voto nominal completo, una banca hereda la línea mayoritaria. Si el bloque votó dividido o sin línea documentada, esa votación no computa. Tampoco mide presencia ni trabajo en comisiones.",
        },
        dis: {
          que: "Qué tan seguido cada bloque llega al recinto con una única posición. Un bloque que vota en paquete negocia en paquete; uno que se parte se negocia banca por banca.",
          como:
            "Sobre las votaciones del período seleccionado: porcentaje de líneas unificadas (afirmativo, negativo o abstención) sobre el total de posiciones documentadas del bloque. Lo no documentado queda fuera del cálculo, marcado como s/d.",
          lim: "Lee líneas de bloque, no votos persona por persona: la cohesión fina (índice de Rice) y la detección estadística de quiebres se habilitan con el voto nominal completo.",
        },
        pow: {
          que: "Con qué frecuencia un bloque es decisivo para llegar a 129: en cuántas coaliciones posibles su entrada o salida cambia el resultado. Es poder de negociación, no tamaño.",
          como:
            "Índice de Banzhaf por enumeración exacta sobre los 20 bloques reales y el umbral de mayoría simple (129). Se compara contra su participación de bancas: 1,30× significa que pesa 30% más que su tamaño.",
          lim: "Asume coaliciones equiprobables, y la política no lo es: la afinidad hace unas alianzas más probables que otras. Leelo como potencial de bisagra, no como probabilidad.",
        },
        rup: {
          que: "Las bancas que rompieron con la línea de su bloque o cuya ausencia tuvo lectura política en este set: el material del que se hacen las notas.",
          como:
            "Cada registro sale de las actas y de la cobertura parlamentaria citada en la votación correspondiente. Se aplica por encima de la línea de bloque y marca la banca en la ficha y en el hemiciclo.",
          lim: "Es un registro documental, no estadístico: pueden existir rupturas sin registro público. La detección automática sobre voto nominal (quiebres direccionales) llega con las actas.",
        },
        ter: {
          que: "Cómo se reparte cada delegación provincial entre bloques, qué tan alineada llega al recinto y cuántas de sus bancas se renuevan en las legislativas de 2027.",
          como:
            "Bancas por distrito según la nómina oficial. La barra es la composición por bloque; el número, el promedio de alineamiento de sus bancas computables. “En juego 2027” cuenta los mandatos 2023–2027 de la nómina.",
          lim: "Un promedio esconde dispersión: una delegación en 50 puede ser dos mitades opuestas. En delegaciones chicas, una sola banca mueve mucho el número. Por eso cada fila abre el detalle banca por banca.",
        },
      };
      const ex = EXPL[S.iTab];
      out.ixQue = ex.que;
      out.ixComo = ex.como;
      out.ixLim = ex.lim;
      // chips de filtros aplicados para las cards capturables de los gráficos
      out.chartChips = [PER_LABEL[S.periodo]].concat(S.ixBloc && S.iTab === "ali" ? [D.blocMap[S.ixBloc]?.corto || S.ixBloc] : []);
      out.daltonico = MODO_DALTONICO;

      if (S.iTab === "ali") {
        // gráfico: strip plot de las bancas (respeta el filtro de bloque de la tab)
        out.stripData = prepStrip(D.deps, { bloc: S.ixBloc });
        out.stripOpen = (id: number) => openFicha(id);
        const withIdx = D.deps.filter((d) => d.indice != null);
        out.ixProm = num(Math.round(withIdx.reduce((a, d) => a + (d.indice as number), 0) / withIdx.length));
        out.ixCob = num(withIdx.length);
        out.ixExcN = num(D.deps.filter((d) => d.hasExc).length);
        out.ixBlocOptions = [{ value: "", label: "Todos los bloques" }].concat(D.bloques.map((b) => ({ value: b.k, label: b.corto })));
        out.ixQ = S.ixQ;
        out.ixBloc = S.ixBloc;
        out.onIxQ = (e2: React.ChangeEvent<HTMLInputElement>) => setS({ ixQ: e2.target.value });
        out.onIxBloc = (e2: React.ChangeEvent<HTMLSelectElement>) => setS({ ixBloc: e2.target.value });
        const sBg = (m: string) => (S.ixSort === m ? "#FFFFFF" : "transparent");
        const sFg = (m: string) => (S.ixSort === m ? "#1C1A17" : "#78736A");
        out.ixSortDesc = () => setS({ ixSort: "desc" });
        out.ixSortAsc = () => setS({ ixSort: "asc" });
        out.ixSortAz = () => setS({ ixSort: "az" });
        out.ixSDescBg = sBg("desc");
        out.ixSDescFg = sFg("desc");
        out.ixSAscBg = sBg("asc");
        out.ixSAscFg = sFg("asc");
        out.ixSAzBg = sBg("az");
        out.ixSAzFg = sFg("az");
        const q2 = S.ixQ.trim().toLowerCase();
        let list = D.deps.filter(
          (d) => (!S.ixBloc || d.b === S.ixBloc) && (!q2 || d.a.toLowerCase().indexOf(q2) >= 0 || d.d.toLowerCase().indexOf(q2) >= 0)
        );
        const cmp = {
          desc: (a: (typeof D.deps)[number], b: (typeof D.deps)[number]) =>
            (b.indice == null ? -1 : b.indice) - (a.indice == null ? -1 : a.indice) || a.a.localeCompare(b.a),
          asc: (a: (typeof D.deps)[number], b: (typeof D.deps)[number]) =>
            (a.indice == null ? 999 : a.indice) - (b.indice == null ? 999 : b.indice) || a.a.localeCompare(b.a),
          az: (a: (typeof D.deps)[number], b: (typeof D.deps)[number]) => a.a.localeCompare(b.a),
        }[S.ixSort];
        list = list.slice().sort(cmp);
        out.ixRows = list.map((d, i) => ({
          rank: String(i + 1),
          nombre: displayName(d.a),
          distrito: d.d,
          blocShort: d.blocShort,
          chip: d.chip,
          initials: iniOf(d),
          swatch: swatch(d.indice),
          fotoCss: fotoCss(d),
          hasExc: d.hasExc,
          barW: d.indice == null ? "0%" : Math.max(2, d.indice) + "%",
          barColor: d.indice == null ? "#E7E3DB" : rampD(d.indice / 100),
          indice: d.indice == null ? "—" : String(d.indice),
          idxColor: d.indice == null ? "#B0AB9F" : "#1C1A17",
          base: d.indice == null ? (d.i ? "no asumido" : "s/ línea") : d.counted + " de " + P.length + " vot.",
          delay: Math.min(i, 22) * 16 + "ms",
          onClick: () => openFicha(d.id),
        }));
        out.ixCount = list.length + (list.length === 1 ? " banca" : " bancas");
      }

      if (S.iTab === "dis") {
        const rows = D.bloques
          .map((b) => {
            const size = D.deps.filter((d) => d.b === b.k).length;
            if (size < 3) return null;
            let uni = 0,
              div = 0,
              nd = 0;
            P.forEach((vi) => {
              const l = D.votaciones[vi].lineas[b.k];
              if (l === "AF" || l === "NEG" || l === "ABS") uni++;
              else if (l === "DIV") div++;
              else nd++;
            });
            const doc = uni + div;
            return { b, size, uni, div, nd, doc, pct: doc ? Math.round((100 * uni) / doc) : null };
          })
          .filter((r): r is NonNullable<typeof r> => Boolean(r))
          .sort((a, c) => (c.pct == null ? -1 : c.pct) - (a.pct == null ? -1 : a.pct) || c.size - a.size);
        out.ixDisRows = rows.map((r, i) => {
          const col = r.pct == null ? "#B0AB9F" : r.pct === 100 ? "#1C1A17" : r.pct >= 50 ? "#B45309" : "#9B3022";
          return {
            nombre: r.b.nombre,
            chip: r.b.chip,
            count: r.size + " bancas",
            barW: r.pct == null ? "0%" : Math.max(2, r.pct) + "%",
            barColor: col,
            pctColor: col,
            pct: r.pct == null ? "s/d" : r.pct + "%",
            detail: r.uni + " unificadas · " + r.div + " divididas" + (r.nd ? " · " + r.nd + " s/d" : ""),
            delay: i * 30 + "ms",
          };
        });
      }

      if (S.iTab === "pow") {
        // gráfico: dumbbell poder vs bancas
        out.dumbbellRows = prepDumbbell(D.power.list, D.blocMap);
        const maxP = Math.max(...D.power.list.map((p) => p.power));
        const fmt1 = (x: number) => x.toFixed(1).replace(".", ",");
        out.ixPowerRows = D.power.list
          .slice()
          .sort((a, b) => b.power - a.power)
          .map((p, i) => {
            const b = D.blocMap[p.k];
            return {
              nombre: b.nombre,
              chip: b.chip,
              power: fmt1(p.power) + "%",
              ratio: p.ratio.toFixed(2).replace(".", ",") + "×",
              barW: ((100 * p.power) / maxP).toFixed(1) + "%",
              seatW: ((100 * p.seatPct) / maxP).toFixed(1) + "%",
              ratioColor: p.ratio >= 1.15 ? "#B45309" : p.ratio <= 0.9 ? "#0F766E" : "#78736A",
              barColor: p.ratio >= 1.15 ? "#B45309" : "#1C1A17",
              delay: i * 26 + "ms",
            };
          });
      }

      if (S.iTab === "rup") {
        const rupDeps = D.deps.filter((d) => d.hasExc);
        out.ixRupCount = rupDeps.length + (rupDeps.length === 1 ? " registro" : " registros");
        out.ixRupList = rupDeps.map((d, ii) => {
          const i = d.votes.findIndex((x) => x.src === "exc");
          const x = d.votes[i];
          const vv = voteView(x.v, x.src);
          return {
            nombre: displayName(d.a),
            initials: iniOf(d),
            swatch: swatch(d.indice),
            fotoCss: fotoCss(d),
            chip: d.chip,
            blocShort: d.blocShort,
            tag: x.nota,
            voteLabel: vv.label,
            dirColor: x.v === "AF" ? "#B45309" : x.v === "NEG" ? "#0F766E" : "#78736A",
            votShort: D.votaciones[i].corto,
            delay: ii * 30 + "ms",
            onClick: () => openFicha(d.id),
          };
        });
      }

      if (S.iTab === "ter") {
        // gráfico: mapa de mosaico de los 24 distritos
        out.tileData = prepTiles(D.deps);
        out.tileOpen = (name: string) => {
          setS({ iTab: "ali", ixQ: name, ixBloc: "" });
          setHash("/indices/alineamiento");
        };
        const dm: Record<string, DTData["deps"]> = {};
        D.deps.forEach((d) => {
          (dm[d.d] = dm[d.d] || []).push(d);
        });
        const rows = Object.keys(dm)
          .map((name) => {
            const ds = dm[name];
            const byB: Record<string, number> = {};
            ds.forEach((d) => {
              byB[d.b] = (byB[d.b] || 0) + 1;
            });
            const segs = Object.keys(byB)
              .map((k) => ({ k, count: byB[k] }))
              .sort((a, c) => c.count - a.count || a.k.localeCompare(c.k));
            const withI = ds.filter((d) => d.indice != null);
            const prom = withI.length ? Math.round(withI.reduce((a, d) => a + (d.indice as number), 0) / withI.length) : null;
            const ren = ds.filter((d) => (d.m || "").slice(-4) === "2027").length;
            return { name, ds, segs, prom, withI, ren };
          })
          .sort((a, c) => c.ds.length - a.ds.length || a.name.localeCompare(c.name));
        out.terRows = rows.map((r, i) => ({
          nombre: r.name,
          count: r.ds.length + (r.ds.length === 1 ? " banca" : " bancas"),
          segs: r.segs.map((s) => {
            const b = D.blocMap[s.k];
            return { w: ((100 * s.count) / r.ds.length).toFixed(2) + "%", chip: b.chip, tip: b.corto + " · " + s.count };
          }),
          prom: r.prom == null ? "—" : String(r.prom),
          promSw: r.prom == null ? "#C9C4BA" : rampD(r.prom / 100),
          promNote: r.prom == null ? "s/d" : r.withI.length + " comp.",
          ren: String(r.ren),
          delay: Math.min(i, 20) * 22 + "ms",
          onClick: () => {
            setS({ iTab: "ali", ixQ: r.name, ixBloc: "" });
            setHash("/indices/alineamiento");
          },
        }));
        const ren27 = D.deps.filter((d) => (d.m || "").slice(-4) === "2027").length;
        out.terCount = rows.length + " distritos · 257 bancas · " + ren27 + " en juego en 2027";
      }
    }

    // ---- FICHA ----
    if (S.fichaId != null && D.byId[S.fichaId]) {
      const d = D.byId[S.fichaId];
      out.fichaOpen = true;
      const fHasFoto = !!d.foto && !failedPhotos.has(d.foto);
      out.fNombre = displayName(d.a);
      out.fInitials = fHasFoto ? "" : initialsOf(d.a);
      out.fSwatch = swatch(d.indice);
      out.fFotoCss = fHasFoto ? `url('${d.foto}')` : "none";
      out.fBloc = d.blocName;
      out.fChip = d.chip;
      out.fDistrito = d.d;
      out.fMandato = d.m;
      out.fHasInter = !!d.inter;
      out.fInter = d.inter || "";
      out.fRecien = !!d.i && d.i >= "2026-01-01";
      out.fInicia = d.i ? fdate(d.i) : "";
      out.fHasRole = !!d.r;
      out.fRole = d.r || "";
      out.fHasIndice = d.indice != null;
      out.fNoIndice = d.indice == null;
      out.fNoIndiceWhy = d.i ? "asumió el " + fdate(d.i) + ", después de las votaciones de este set." : "sin línea de bloque documentada.";
      if (d.indice != null) {
        out.fIndice = num(d.indice);
        out.fIndicePos = d.indice + "%";
        out.fLabel = labelOf(d.indice);
        out.fCounted = "sobre " + d.counted + " de " + P.length + " votaciones";
        out.fSpark = <Sparkline D={D} d={d} P={P} daltonico={MODO_DALTONICO} />;
      }
      out.fVotes = D.votaciones.map((vv, i) => {
        const x = d.votes[i];
        const w = voteView(x.v, x.src);
        const sv = srcView(x.src);
        return {
          corto: vv.corto,
          label: w.label,
          sw: w.sw,
          border: w.border,
          fg: w.fg,
          srcLabel: sv.label,
          hasNota: !!x.nota,
          nota: x.nota || "",
          onOpen: () => {
            setS({ view: "votacion", selLaw: i, fichaId: null, page: 0 });
            setHash("/votacion/" + vv.id);
            window.scrollTo(0, 0);
          },
        };
      });
      out.fDieta = D.ctx.dieta.monto;
      const mov = D.ctx.movimientos.find((m) => m.a === d.a && !m.alta);
      out.fHasHistory = !!mov || !!(d.i && d.i >= "2026-01-01");
      out.fNoHistory = !out.fHasHistory;
      if (mov) {
        out.fHistFecha = mov.fecha;
        out.fHistText = mov.nota;
      } else if (d.i && d.i >= "2026-01-01") {
        out.fHistFecha = fdate(d.i);
        out.fHistText = "Asumió la banca. Sin cambios de bloque registrados.";
      }
      out.closeFicha = () => closeFicha();
      out.copyLabel = S.copied === "link" ? "✓ copiado" : "copiar link";
      out.citaLabel = S.copied === "cita" ? "✓ copiada" : "copiar cita";
      out.copyLink = () => {
        const u = location.href.split("#")[0] + "#/diputado/" + d.id;
        if (navigator.clipboard) navigator.clipboard.writeText(u);
        setS({ copied: "link" });
      };
      out.copyCita = () => {
        const txt =
          displayName(d.a) +
          " (" +
          d.blocShort +
          ", " +
          d.d +
          ")" +
          (d.indice != null
            ? ": índice de alineamiento con el gobierno " + d.indice + "/100 sobre " + d.counted + " votaciones computables (" + PER_LABEL[S.periodo] + ")"
            : ": sin votaciones computables en el período") +
          ". Fuente: DipuTracker, con datos oficiales de la HCDN.";
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        setS({ copied: "cita" });
      };
      out.shareLabel = S.copied === "img" ? "✓ imagen" : "imagen ↓";
      out.shareCard = () => {
        shareCardDep(d, S.periodo, fdate(corte), MODO_DALTONICO);
        flash("img", "img");
      };
      out.addToCompareFromFicha = () => {
        const n = addToCompare(d.id);
        setS({ fichaId: null, view: "comparador" });
        setHash(compHash(n));
        window.scrollTo(0, 0);
      };
    }

    // ---- SIMULADOR ----
    if (S.view === "simulador") {
      const t: Record<SimPos, number> = { AF: 0, NEG: 0, ABS: 0, AUS: 0 };
      D.bloques.forEach((b) => {
        const v = S.sim[b.k] || "ABS";
        t[v] += D.deps.filter((d) => d.b === b.k).length;
      });
      out.simHemi = <SimHemi D={D} sim={S.sim} />;
      out.simAf = num(t.AF);
      out.simNeg = num(t.NEG);
      out.simAbs = num(t.ABS);
      out.simAus = num(t.AUS);
      out.simAfW = (100 * t.AF) / 257 + "%";
      out.simNegW = (100 * t.NEG) / 257 + "%";
      out.simAbsW = (100 * (t.ABS + t.AUS)) / 257 + "%";
      out.sim129Left = (100 * 129) / 257 + "%";
      out.sim172Left = (100 * 172) / 257 + "%";
      const r129 = t.AF >= 129,
        r172 = t.AF >= 172;
      out.simVerdict = r172 ? "Alcanza los dos tercios" : r129 ? "Mayoría simple asegurada" : "No llega a la mayoría";
      out.simVerdictSub = r172
        ? "172 · supera por " + (t.AF - 172)
        : r129
          ? "129 · sobran " + (t.AF - 129) + " · faltan " + Math.max(0, 172 - t.AF) + " para dos tercios"
          : "faltan " + (129 - t.AF) + " para 129";
      out.simVerdictColor = r129 ? "#2F6F4E" : "#9B3022";
      out.simVerdictBg = r129 ? "#EAF3EE" : "#F7E9E6";
      out.simVerdictBorder = r129 ? "#BFE0CC" : "#E5C4BD";
      const setSim = (k: string, v: SimPos) =>
        setS((s) => {
          const n = { ...s.sim };
          n[k] = v;
          return { sim: n };
        });
      out.simRows = D.bloques
        .map((b) => {
          const size = D.deps.filter((d) => d.b === b.k).length;
          const cur = S.sim[b.k] || "ABS";
          const afOther = t.AF - (cur === "AF" ? size : 0);
          const pivotal = afOther < 129 && afOther + size >= 129;
          return {
            nombre: b.nombre,
            chip: b.chip,
            count: size + (size === 1 ? " banca" : " bancas"),
            pivotal,
            afBg: cur === "AF" ? "#2F6F4E" : "#FFFFFF",
            afFg: cur === "AF" ? "#FFFFFF" : "#8A857A",
            negBg: cur === "NEG" ? "#9B3022" : "#FFFFFF",
            negFg: cur === "NEG" ? "#FFFFFF" : "#8A857A",
            absBg: cur === "ABS" ? "#8A857A" : "#FFFFFF",
            absFg: cur === "ABS" ? "#FFFFFF" : "#8A857A",
            ausBg: cur === "AUS" ? "#1C1A17" : "#FFFFFF",
            ausFg: cur === "AUS" ? "#FFFFFF" : "#8A857A",
            setAf: () => setSim(b.k, "AF"),
            setNeg: () => setSim(b.k, "NEG"),
            setAbs: () => setSim(b.k, "ABS"),
            setAus: () => setSim(b.k, "AUS"),
          };
        })
        .sort((a, c) => parseInt(c.count) - parseInt(a.count));
      out.simPivotCount = out.simRows.filter((r: { pivotal: boolean }) => r.pivotal).length;
      out.simReset = () => setS({ sim: {} });
      out.simGov = () => {
        const s: Record<string, SimPos> = {};
        ["LLA", "PRO", "UCR", "MID", "IF", "PYT", "IND", "EC"].forEach((k) => (s[k] = "AF"));
        setS({ sim: s });
      };
      out.simLaboral = () => {
        const v = D.votaciones.find((x) => x.id === "modernizacion-laboral");
        if (!v) return;
        const s: Record<string, SimPos> = {};
        D.bloques.forEach((b) => {
          const l = v.lineas[b.k];
          s[b.k] = l === "AF" || l === "NEG" || l === "ABS" ? l : "ABS";
        });
        setS({ sim: s });
      };
    }

    // ---- BÚSQUEDA ----
    out.onQuery = (e: React.ChangeEvent<HTMLInputElement>) => setS({ query: e.target.value, searchSel: 0 });
    const q = S.query.trim().toLowerCase();
    let res = q
      ? D.deps.filter(
          (d) =>
            d.a.toLowerCase().indexOf(q) >= 0 ||
            d.d.toLowerCase().indexOf(q) >= 0 ||
            d.blocName.toLowerCase().indexOf(q) >= 0 ||
            d.blocShort.toLowerCase().indexOf(q) >= 0
        )
      : D.deps.slice().sort((a, b) => a.a.localeCompare(b.a));
    const resTotal = res.length;
    res = res.slice(0, 40);
    lastResRef.current = res;
    const selI = Math.min(S.searchSel, Math.max(0, res.length - 1));
    out.hasResults = resTotal > 0;
    out.noResults = resTotal === 0;
    out.searchResults = res.map((d, i2) => ({
      nombre: displayName(d.a),
      blocName: d.blocShort,
      distrito: d.d,
      initials: iniOf(d),
      swatch: swatch(d.indice),
      fotoCss: fotoCss(d),
      indice: d.indice == null ? "—" : d.indice,
      idxColor: d.indice == null ? "#B0AB9F" : rampD(d.indice / 100),
      selBg: i2 === selI ? "#F4F1EB" : "transparent",
      onClick: () => pickSearch(d.id),
    }));
    out.searchCount = resTotal + (resTotal === 1 ? " diputado" : " diputados") + (resTotal > 40 ? " · mostrando 40" : "");

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S, failedPhotos]);

  void bump;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF9" }}>
      <TopChrome V={V} />
      {V.ready && (
        <>
          {V.isHome && <HomeView V={V} />}
          {V.isVotacion && <VotacionView V={V} />}
          {V.isComparador && <ComparadorView V={V} />}
          {V.isMov && <MovView V={V} />}
          {V.isSimulador && <SimuladorView V={V} />}
          {V.isIndices && <IndicesView V={V} />}
          {V.isPatrimonio && <PatrimonioView V={V} />}
          <FooterView V={V} />
          {V.fichaOpen && <FichaDrawer V={V} />}
          {V.searchOpen && <SearchModal V={V} />}
        </>
      )}
    </div>
  );
}

// corte de datos: la fecha "consultado" más reciente de los datasets (la mantiene el ETL)
function dataCorte(D: DTData): string {
  const metas = [D.metaDip?.consultado, D.metaVot?.consultado].filter(Boolean) as string[];
  metas.sort();
  return metas[metas.length - 1] || "2026-07-07";
}
