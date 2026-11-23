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
        background: "#c8371d",
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
          color: "#fff8f0",
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
            background: "#fff8f0",
            opacity: 0.85,
            borderRadius: 99,
            marginTop: -inner * 0.13,
          }}
        />
      </div>
    </div>
  );
}
