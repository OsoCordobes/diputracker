// Tarjetas PNG compartibles (canvas 1200×630) — port fiel del prototipo.
import type { Dep, Periodo, Votacion } from "./types";
import { displayName, fdate, label, mix, ramp } from "./compute";

function dl(cv: HTMLCanvasElement, name: string) {
  cv.toBlob((b) => {
    if (!b) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
}

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function rampGrad(c: CanvasRenderingContext2D, x0: number, x1: number, y: number, daltonico: boolean) {
  const g = c.createLinearGradient(x0, y, x1, y);
  for (let i = 0; i <= 24; i++) g.addColorStop(i / 24, ramp(i / 24, daltonico));
  return g;
}

function cardBase(c: CanvasRenderingContext2D, W: number, H: number, sub: string, corte: string) {
  c.fillStyle = "#FAFAF9";
  c.fillRect(0, 0, W, H);
  c.fillStyle = "#1C1A17";
  c.fillRect(0, 0, W, 10);
  c.fillStyle = "#1C1A17";
  c.font = '600 36px "Source Serif 4", Georgia, serif';
  c.textBaseline = "alphabetic";
  c.fillText("DipuTracker", 64, 96);
  c.font = '600 15px "Libre Franklin", Arial, sans-serif';
  c.fillStyle = "#9A958A";
  c.fillText(sub, 64, 124);
  c.font = '500 15px "IBM Plex Mono", monospace';
  c.fillStyle = "#A8A296";
  c.textAlign = "right";
  c.fillText("datos oficiales HCDN · corte " + corte, W - 64, 96);
  c.textAlign = "left";
  c.strokeStyle = "#E7E3DB";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(64, 148);
  c.lineTo(W - 64, 148);
  c.stroke();
  c.font = '400 15px "IBM Plex Mono", monospace';
  c.fillStyle = "#A8A296";
  c.fillText("Metodología y fuentes citadas en la app · la información de la HCDN es de dominio público", 64, H - 44);
}

function wrapText(c: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  words.forEach((w) => {
    const t = cur ? cur + " " + w : w;
    if (c.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
}

const PER_CARD: Record<Periodo, string> = {
  todo: "período dic-2025 → may-2026",
  ext: "extraordinarias dic-2025 → feb-2026",
  ord: "ordinarias abr → may 2026",
};

export function shareCardDep(d: Dep, periodo: Periodo, corte: string, daltonico = false) {
  const W = 1200,
    H = 630,
    cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d");
  if (!c) return;
  cardBase(c, W, H, "ÍNDICE DE ALINEAMIENTO CON EL GOBIERNO · CÁMARA DE DIPUTADOS · 257 BANCAS", corte);
  c.fillStyle = "#1C1A17";
  c.font = '600 58px "Source Serif 4", Georgia, serif';
  let nm = displayName(d.a);
  while (c.measureText(nm).width > 760 && nm.length > 4) nm = nm.slice(0, -2);
  c.fillText(nm, 64, 254);
  c.beginPath();
  c.arc(74, 296, 9, 0, Math.PI * 2);
  c.fillStyle = d.chip;
  c.fill();
  c.font = '500 24px "Libre Franklin", Arial, sans-serif';
  c.fillStyle = "#57534E";
  c.fillText(d.blocName + " · " + d.d + " · mandato " + d.m, 96, 305);
  const has = d.indice != null;
  c.textAlign = "right";
  c.fillStyle = has ? ramp((d.indice as number) / 100, daltonico) : "#C9C4BA";
  c.font = '500 172px "IBM Plex Mono", monospace';
  c.fillText(has ? String(d.indice) : "—", W - 64, 310);
  c.font = '500 17px "IBM Plex Mono", monospace';
  c.fillStyle = "#A8A296";
  c.fillText(has ? "/ 100 · sobre " + d.counted + " votaciones computables" : "sin votaciones computables", W - 64, 344);
  c.textAlign = "left";
  const bx = 64,
    bw = W - 128,
    by = 424,
    bh = 20;
  rr(c, bx, by, bw, bh, 10);
  c.fillStyle = rampGrad(c, bx, bx + bw, by, daltonico);
  c.fill();
  c.strokeStyle = "#E2DDD2";
  c.stroke();
  if (has) {
    const mx = bx + (bw * (d.indice as number)) / 100;
    rr(c, mx - 4, by - 7, 8, bh + 14, 4);
    c.fillStyle = "#1C1A17";
    c.fill();
    c.strokeStyle = "#FFFFFF";
    c.lineWidth = 2;
    c.stroke();
    c.lineWidth = 1;
  }
  c.font = '600 19px "Libre Franklin", Arial, sans-serif';
  c.fillStyle = "#0F766E";
  c.fillText("Oposición firme · 0", bx, by + 52);
  c.textAlign = "right";
  c.fillStyle = "#B45309";
  c.fillText("Oficialismo · 100", bx + bw, by + 52);
  c.textAlign = "left";
  c.fillStyle = "#1C1A17";
  c.font = '600 27px "Libre Franklin", Arial, sans-serif';
  c.fillText(has ? label(d.indice as number) : "Sin línea de bloque computable en el período", 64, 540);
  c.font = '400 17px "IBM Plex Mono", monospace';
  c.fillStyle = "#78736A";
  c.fillText(PER_CARD[periodo] + (d.hasExc ? " · con registro individual documentado" : ""), 64, 568);
  dl(cv, "diputracker_" + d.a.split(",")[0].toLowerCase().replace(/[^a-záéíóúüñ]/gi, "") + ".png");
}

export function shareCardVot(v: Votacion, corte: string) {
  const W = 1200,
    H = 630,
    cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d");
  if (!c) return;
  cardBase(c, W, H, "VOTACIÓN · " + fdate(v.fecha).toUpperCase() + " · " + v.sesion.toUpperCase(), corte);
  c.fillStyle = "#1C1A17";
  c.font = '600 46px "Source Serif 4", Georgia, serif';
  const lines = wrapText(c, v.titulo, W - 128).slice(0, 2);
  lines.forEach((l, i) => c.fillText(l, 64, 236 + i * 58));
  const ok = v.resultado === "aprobada";
  c.font = '700 22px "Libre Franklin", Arial, sans-serif';
  c.fillStyle = ok ? "#2F6F4E" : "#9B3022";
  c.fillText((ok ? "APROBADA" : "RECHAZADA") + "  ·  " + v.govLabel, 64, 236 + lines.length * 58 + 16);
  const sv = 257 - v.af - v.neg - v.abs;
  const bx = 64,
    bw = W - 128,
    by = 424,
    bh = 30;
  rr(c, bx, by, bw, bh, 8);
  c.save();
  c.clip();
  let xx = bx;
  (
    [
      [v.af, "#2F6F4E"],
      [v.neg, "#9B3022"],
      [v.abs, "#B8B2A6"],
      [sv, "#EDEAE2"],
    ] as [number, string][]
  ).forEach((seg) => {
    const w = (bw * seg[0]) / 257;
    c.fillStyle = seg[1];
    c.fillRect(xx, by, w, bh);
    xx += w;
  });
  c.restore();
  const m129 = bx + (bw * 129) / 257;
  c.strokeStyle = "#1C1A17";
  c.setLineDash([5, 4]);
  c.beginPath();
  c.moveTo(m129, by - 12);
  c.lineTo(m129, by + bh + 12);
  c.stroke();
  c.setLineDash([]);
  c.font = '500 15px "IBM Plex Mono", monospace';
  c.fillStyle = "#1C1A17";
  c.fillText("129 · mayoría", m129 + 8, by - 18);
  c.font = '500 26px "IBM Plex Mono", monospace';
  let nx = 64;
  (
    [
      [v.af + " afirmativos", "#2F6F4E"],
      [v.neg + " negativos", "#9B3022"],
      [v.abs + " abstenciones", "#6B665C"],
      [sv + " sin voto", "#A8A296"],
    ] as [string, string][]
  ).forEach((t) => {
    c.fillStyle = t[1];
    c.fillText(t[0], nx, by + 86);
    nx += c.measureText(t[0]).width + 40;
  });
  dl(cv, "diputracker_" + v.id + ".png");
}

export { mix };
