// Export del dataset completo en CSV — port fiel del prototipo.
import type { DTData, Periodo } from "./types";
import { PER_LABEL } from "./compute";

export function downloadCsv(D: DTData, P: number[], periodo: Periodo, corte: string) {
  const esc = (x: unknown) => '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"';
  const rows: unknown[][] = [
    [
      "apellido_nombre",
      "distrito",
      "bloque",
      "indice_alineamiento_0_100",
      "votaciones_computadas_de_" + P.length,
      "mandato",
      "registro_individual_documentado",
      "cargo",
    ],
  ];
  D.deps
    .slice()
    .sort((a, b) => a.a.localeCompare(b.a))
    .forEach((d) => {
      rows.push([d.a, d.d, D.blocMap[d.b].nombre, d.indice == null ? "" : d.indice, d.counted || 0, d.m || "", d.hasExc ? "si" : "no", d.r || ""]);
    });
  const meta =
    "# DipuTracker — índice de alineamiento provisional (línea de bloque + registros individuales documentados)\n# Fuentes: HCDN diputados.gov.ar · actas votaciones.hcdn.gob.ar · corte " +
    corte +
    " · período: " +
    PER_LABEL[periodo] +
    "\n# La información de la HCDN es de dominio público; se solicita citar la fuente. Metodología: sección Índices.\n";
  const csv = meta + rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(['﻿' + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "diputracker_hcdn_2026-07.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
