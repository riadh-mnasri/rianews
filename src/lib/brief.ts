// © 2026 Riadh MNASRI
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { CategoryId } from "@/data/categories";
import { fetchCategoryItems } from "@/lib/rss";
import type { Brief, RawItem, Story } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_BRIEF_MODEL || "claude-opus-5-5";
const MAX_ITEMS_FOR_AI = 45;
const STORIES_PER_BRIEF = 6;

const TOPIC_LABEL: Record<CategoryId, { fr: string; en: string }> = {
  ia: { fr: "intelligence artificielle", en: "artificial intelligence" },
  tech: { fr: "technologie et numérique", en: "technology" },
  politique: { fr: "politique française", en: "politics" },
  actu: { fr: "actualité générale (France et monde)", en: "general news (world)" },
  eco: { fr: "économie, entreprises et marchés", en: "economy, business and markets" },
};

const BriefSchema = z.object({
  intro: z.string(),
  stories: z.array(
    z.object({
      title: z.string(),
      essentiel: z.string(),
      pourquoi: z.string(),
      a_placer: z.string(),
      item_numbers: z.array(z.number().int()),
    }),
  ),
});

function buildPrompt(items: RawItem[], category: CategoryId, locale: "fr" | "en"): string {
  const list = items
    .map((item, i) => {
      const excerpt = item.excerpt ? `\n   ${item.excerpt}` : "";
      return `${i + 1}. [${item.source}] ${item.title}${excerpt}`;
    })
    .join("\n");
  const language = locale === "fr" ? "français" : "anglais";

  return `Tu rédiges « RiaNews », un brief d'actualité lu sur mobile par quelqu'un de pressé qui veut être au courant et pouvoir en parler autour de lui.

Rubrique : ${TOPIC_LABEL[category][locale]}.

Dépêches des dernières 48 heures (numérotées) :
${list}

Consignes :
- Choisis les ${STORIES_PER_BRIEF} sujets les plus importants ou les plus marquants. Regroupe les dépêches qui parlent du même sujet en un seul.
- Écarte les contenus promotionnels, bons plans, tests produits et sujets anecdotiques sans portée.
- Classe-les du plus important au moins important.
- Pour chaque sujet :
  - title : titre court et clair, 8 à 12 mots, sans clickbait.
  - essentiel : 2 phrases maximum (40 mots au plus) qui disent ce qui s'est passé, avec les chiffres ou les noms clés.
  - pourquoi : 1 phrase qui explique pourquoi ça compte.
  - a_placer : 1 phrase courte à placer dans une conversation (un chiffre frappant, une mise en perspective, un contexte peu connu). Ton naturel, pas de formule toute faite.
  - item_numbers : les numéros des dépêches utilisées.
- intro : une phrase qui résume la tendance de la rubrique aujourd'hui.
- N'invente rien : appuie-toi uniquement sur les dépêches fournies. Si une info est incertaine, reste prudent dans la formulation.
- Rédige en ${language}, phrases simples, ton neutre et vivant.`;
}

function rawBrief(items: RawItem[], category: CategoryId, locale: string): Brief {
  const stories: Story[] = items.slice(0, 10).map((item, i) => ({
    id: `${category}-raw-${i}`,
    title: item.title,
    essentiel: item.excerpt ?? "",
    pourquoi: null,
    aPlacer: null,
    sources: [{ label: item.source, url: item.url }],
    publishedAt: item.publishedAt,
  }));
  return {
    category,
    locale,
    mode: "raw",
    intro: null,
    stories,
    generatedAt: new Date().toISOString(),
  };
}

async function aiBrief(
  items: RawItem[],
  category: CategoryId,
  locale: "fr" | "en",
): Promise<Brief | null> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(BriefSchema) },
    messages: [{ role: "user", content: buildPrompt(items, category, locale) }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return null;
  const parsed = response.parsed_output;

  const stories: Story[] = parsed.stories.slice(0, STORIES_PER_BRIEF).map((s, i) => {
    const used = s.item_numbers
      .map((n) => items[n - 1])
      .filter((item): item is RawItem => Boolean(item));
    const seen = new Set<string>();
    const sources = used
      .filter((item) => (seen.has(item.source) ? false : (seen.add(item.source), true)))
      .slice(0, 3)
      .map((item) => ({ label: item.source, url: item.url }));
    const dates = used
      .map((item) => item.publishedAt)
      .filter((d): d is string => Boolean(d))
      .sort()
      .reverse();
    return {
      id: `${category}-${i}-${s.title.slice(0, 24)}`,
      title: s.title,
      essentiel: s.essentiel,
      pourquoi: s.pourquoi || null,
      aPlacer: s.a_placer || null,
      sources,
      publishedAt: dates[0] ?? null,
    };
  });

  return {
    category,
    locale,
    mode: "ai",
    intro: parsed.intro || null,
    stories,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateBrief(category: CategoryId, locale: "fr" | "en"): Promise<Brief> {
  const items = await fetchCategoryItems(category, locale);
  if (items.length === 0 || !process.env.ANTHROPIC_API_KEY) {
    return rawBrief(items, category, locale);
  }
  try {
    const brief = await aiBrief(items.slice(0, MAX_ITEMS_FOR_AI), category, locale);
    return brief ?? rawBrief(items, category, locale);
  } catch (error) {
    console.error(`[brief] ${category}/${locale}:`, error instanceof Error ? error.message : error);
    return rawBrief(items, category, locale);
  }
}
