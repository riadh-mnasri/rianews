// © 2026 Riadh MNASRI
import { Cpu, Globe, Landmark, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import type { CategoryId } from "@/data/categories";

export const CATEGORY_META: Record<CategoryId, { icon: LucideIcon; color: string }> = {
  ia: { icon: Sparkles, color: "var(--cat-ia)" },
  tech: { icon: Cpu, color: "var(--cat-tech)" },
  politique: { icon: Landmark, color: "var(--cat-politique)" },
  actu: { icon: Globe, color: "var(--cat-actu)" },
  eco: { icon: TrendingUp, color: "var(--cat-eco)" },
};
