"use client";
import type { DTVals } from "@/components/DipuTracker";

// Barra de navegación inferior para móvil (≤920px; en desktop display:none por CSS).
// Reemplaza a las tabs del top nav, que a ese ancho no entran en una fila.

const IC = {
  panel: <path d="M4 19a8 8 0 0 1 16 0M8.5 19a3.5 3.5 0 0 1 7 0" />,
  indices: <path d="M5 20V10M12 20V4M19 20v-7" />,
  votaciones: <path d="M5 12l4 4L19 6M5 19h14" />,
  patrimonio: <path d="M12 3v18M7 7.5C7 5.5 9 5 12 5s5 .5 5 2.5-2 2.5-5 2.5-5 .5-5 2.5 2 2.5 5 2.5 5-.5 5-2.5" />,
  simulador: <path d="M4 8h10M18 8h2M4 16h2M10 16h10M14 5.5v5M8 13.5v5" />,
};

function Item({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "3px", minHeight: "48px", background: "none", border: "none", cursor: "pointer",
        fontFamily: "inherit", padding: "4px 0", borderRadius: "10px",
        color: active ? "#1C1A17" : "#8A857A",
      }}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.9} strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, letterSpacing: "0.02em" }}>{label}</span>
    </button>
  );
}

export default function BottomNav({ V }: { V: DTVals }) {
  return (
    <nav className="dt-bottomnav" aria-label="Secciones">
      <Item label="Panel" icon={IC.panel} active={V.navActive === "home"} onClick={V.goHome} />
      <Item label="Índices" icon={IC.indices} active={V.navActive === "indices"} onClick={V.goIndices} />
      <Item label="Votaciones" icon={IC.votaciones} active={V.navActive === "votacion"} onClick={V.goVotacion} />
      <Item label="Patrimonio" icon={IC.patrimonio} active={V.navActive === "patrimonio"} onClick={V.goPatrimonio} />
      <Item label="Simulador" icon={IC.simulador} active={V.navActive === "simulador"} onClick={V.goSimulador} />
    </nav>
  );
}
