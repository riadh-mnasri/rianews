// © 2026 Riadh MNASRI
import { unstable_cache } from "next/cache";
import type { CategoryId } from "@/data/categories";
import { generateBrief } from "@/lib/brief";

// Un brief par rubrique et par langue, régénéré au plus toutes les heures.
export const getCachedBrief = unstable_cache(
  async (category: CategoryId, locale: "fr" | "en") => generateBrief(category, locale),
  ["lessentiel-brief-v1"],
  { revalidate: 3600 },
);
