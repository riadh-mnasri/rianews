// © 2026 Riadh MNASRI

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`serif flex items-center justify-center rounded-[0.7rem] bg-accent font-bold text-accent-foreground shadow-card ${
          big ? "h-12 w-12 text-[1.7rem]" : "h-9 w-9 text-[1.3rem]"
        }`}
      >
        R
      </span>
      <span className={`serif font-semibold tracking-tight ${big ? "text-[1.7rem]" : "text-[1.3rem]"}`}>
        Ria<span className="text-accent">News</span>
      </span>
    </span>
  );
}
