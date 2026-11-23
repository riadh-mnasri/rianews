// © 2026 Riadh MNASRI

// Pictogramme de l'app : un « R » serif crème sur fond rouge presse.
export function IconArt({ size, padding = 0 }: { size: number; padding?: number }) {
  const inner = size - padding * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#9e3b2a",
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#f8f1e6",
          fontFamily: "Newsreader, Georgia, serif",
          fontWeight: 700,
          fontSize: inner * 0.62,
          lineHeight: 1,
        }}
      >
        <span style={{ marginTop: -inner * 0.04 }}>R</span>
        <div
          style={{
            width: inner * 0.34,
            height: Math.max(2, inner * 0.035),
            background: "#f8f1e6",
            opacity: 0.85,
            borderRadius: 99,
            marginTop: -inner * 0.13,
          }}
        />
      </div>
    </div>
  );
}
