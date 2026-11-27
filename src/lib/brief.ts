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
const EXCERPT_PRIORITY_MS = 6 * 60 * 60 * 1000;

const TOPIC_LABEL: Record<CategoryId, { fr: string; en: string }> = {
  ia: { fr: "intelligence artificielle", en: "artificial intelligence" },
  tech: { fr: "technologie et numérique", en: "technology" },
  politique: { fr: "politique française", en: "politics" },
  actu: { fr: "actualité générale (France et monde)", en: "general news (world)" },
  eco: { fr: "économie, entreprises et marchés", en: "economy, business and markets" },
  bourse: { fr: "bourse et marchés cotés", en: "stock markets and listed companies" },
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
      const date = item.publishedAt ?? "date inconnue";
      return `${i + 1}. [${item.source} · ${date}] ${item.title}${excerpt}`;
    })
    .join("\n");
  const language = locale === "fr" ? "français" : "anglais";
  const marketInstructions = category === "bourse"
    ? `
- Privilégie les mouvements significatifs des indices, les résultats et perspectives d'entreprises cotées, ainsi que les nouvelles importantes sur les ETF.
- Pour les chiffres de marché, précise l'indice ou le titre et la période quand ils sont indiqués. Distingue résultats, prévisions et commentaires.
- Explique le contexte et les facteurs à surveiller. Écarte les recommandations d'achat ou de vente, les objectifs de cours et les promesses de rendement.`
    : "";

  return `Tu rédiges « RiaNews », un brief d'actualité lu sur mobile par quelqu'un de pressé qui veut être au courant et pouvoir en parler autour de lui.

Rubrique : ${TOPIC_LABEL[category][locale]}.
Date et heure de l’édition : ${new Date().toISOString()}.

Dépêches des dernières 48 heures (numérotées) :
${list}

Consignes :
- Choisis jusqu’à ${STORIES_PER_BRIEF} sujets qui correspondent directement à la rubrique et apportent un fait nouveau. Regroupe les dépêches qui couvrent le même événement et couvre des sujets différents quand les sources le permettent.
- Privilégie les annonces, faits confirmés et développements des dernières 24 heures. Pour un événement déjà connu, explique ce qui vient de changer. Garde un sujet plus ancien seulement s’il reste important et n’a pas été dépassé par une nouvelle dépêche.
- Une date de publication récente ne suffit pas : écarte les guides intemporels, rétrospectives et tribunes sans fait d’actualité. Si les dépêches ne contiennent pas assez de faits pour un résumé, propose moins de sujets.
- Écarte les contenus promotionnels, bons plans, tests produits et sujets anecdotiques sans portée.
- Classe-les du plus important au moins important.
- Pour chaque sujet :
  - title : titre court et clair, 8 à 12 mots, sans clickbait.
  - essentiel : 2 à 3 phrases (60 mots au plus) qui précisent le fait nouveau, qui est concerné et les chiffres clés disponibles.
  - pourquoi : 1 phrase qui explique pourquoi ça compte.
  - a_placer : 1 phrase sur la prochaine étape si elle est documentée, ou un élément de contexte qui aide à comprendre le fait nouveau. Laisse vide si les sources ne donnent aucun détail supplémentaire.
  - item_numbers : les numéros des dépêches utilisées.
- intro : une phrase qui résume la tendance de la rubrique aujourd'hui.
- N'invente rien : appuie-toi uniquement sur les dépêches fournies. Si une info est incertaine, reste prudent dans la formulation.${marketInstructions}
- Rédige en ${language}, phrases simples, ton neutre et vivant.`;
}

function rawBrief(items: RawItem[], category: CategoryId, locale: string): Brief {
  const localItems = items.filter((item) => !item.foreign);
  // À fraîcheur comparable, un article avec un extrait est plus utile à lire.
  const ranked = localItems.map((item) => {
    const published = item.publishedAt ? Date.parse(item.publishedAt) : 0;
    return { item, score: (published || 0) + (item.excerpt ? EXCERPT_PRIORITY_MS : 0) };
  }).sort((a, b) => b.score - a.score);
  const stories: Story[] = ranked.slice(0, 10).map(({ item }, i) => ({
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
  if (parsed.stories.length === 0) return null;

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
