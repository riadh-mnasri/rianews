// © 2026 Riadh MNASRI

// Titre du journal : un logotype typographique, sans pictogramme.
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={`serif leading-none font-bold tracking-[-0.025em] ${
        size === "lg" ? "text-[2.6rem]" : "text-[1.6rem] md:text-[2.1rem]"
      }`}
    >
      Ria<span className="font-medium italic text-accent">News</span>
    </span>
  );
}
