// © 2026 Riadh MNASRI
import { ChartCandlestick, Cpu, Globe, Landmark, Smartphone, TrendingUp, type LucideIcon } from "lucide-react";
import type { CategoryId } from "@/data/categories";

export const CATEGORY_META: Record<CategoryId, { icon: LucideIcon; color: string }> = {
  ia: { icon: Cpu, color: "var(--cat-ia)" },
  tech: { icon: Smartphone, color: "var(--cat-tech)" },
  politique: { icon: Landmark, color: "var(--cat-politique)" },
  actu: { icon: Globe, color: "var(--cat-actu)" },
  eco: { icon: TrendingUp, color: "var(--cat-eco)" },
  bourse: { icon: ChartCandlestick, color: "var(--cat-bourse)" },
};
