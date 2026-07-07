import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px" }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B45309" }}>
          DipuTracker
        </div>
        <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 600, fontSize: "46px", letterSpacing: "-0.02em", margin: "14px 0 0", color: "#1C1A17" }}>
          Página no encontrada
        </h1>
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: "#78736A", margin: "14px 0 0" }}>
          La banca que buscás no está en este recinto. El panel completo, con las 257 bancas reales, sigue en su lugar.
        </p>
        <Link
          href="/"
          style={{ display: "inline-block", marginTop: "24px", background: "#1C1A17", color: "#FAFAF9", borderRadius: "10px", padding: "12px 22px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
        >
          Volver al panel →
        </Link>
      </div>
    </div>
  );
}
