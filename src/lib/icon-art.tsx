// © 2026 Riadh MNASRI

export function IconArt({ size, padding = 0 }: { size: number; padding?: number }) {
  const inner = size - padding * 2;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111a2b",
        backgroundImage: "linear-gradient(145deg, #293f5d 0%, #111a2b 76%)",
      }}
    >
      {size >= 128 && padding <= size * 0.1 && (
        <div
          style={{
            position: "absolute",
            top: size * 0.085,
            right: size * 0.085,
            bottom: size * 0.085,
            left: size * 0.085,
            border: `${size * 0.005}px solid #b18e64`,
            borderRadius: size * 0.12,
          }}
        />
      )}
      <svg width={inner * 0.56} height={inner * 0.66} viewBox="0 0 84 100" aria-hidden="true">
        <path
          fill="#fff6e8"
          d="M8 8h34c19 0 29 9 29 23 0 12-8 20-20 23l16 22c4 5 7 7 12 7v5H58L36 56h-8v19c0 6 3 8 10 8v5H8v-5c7 0 9-2 9-8V21c0-6-2-8-9-8V8zm20 6v36h11c13 0 20-7 20-19 0-11-7-17-20-17H28z"
        />
        <path fill="#f1c995" d="M10 96h66v3H10z" />
      </svg>
    </div>
  );
}
