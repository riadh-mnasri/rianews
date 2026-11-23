// © 2026 Riadh MNASRI

export const CATEGORY_IDS = ["ia", "tech", "politique", "actu", "eco"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Feed = { url: string; label: string };

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

const gnews = (path: string, locale: "fr" | "en") =>
  locale === "fr"
    ? `https://news.google.com/rss/${path}${path.includes("?") ? "&" : "?"}hl=fr&gl=FR&ceid=FR:fr`
    : `https://news.google.com/rss/${path}${path.includes("?") ? "&" : "?"}hl=en-US&gl=US&ceid=US:en`;

export const FEEDS: Record<"fr" | "en", Record<CategoryId, Feed[]>> = {
  fr: {
    ia: [
      { url: gnews("search?q=intelligence+artificielle+when:2d", "fr"), label: "Google Actualités" },
      { url: "https://www.actuia.com/feed/", label: "ActuIA" },
      { url: "https://www.lemonde.fr/pixels/rss_full.xml", label: "Le Monde Pixels" },
      { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", label: "The Verge" },
    ],
    tech: [
      { url: gnews("headlines/section/topic/TECHNOLOGY", "fr"), label: "Google Actualités" },
      { url: "https://www.numerama.com/feed/", label: "Numerama" },
      { url: "https://www.frandroid.com/feed", label: "Frandroid" },
      { url: "https://www.01net.com/feed/", label: "01net" },
      { url: "https://www.francetvinfo.fr/internet.rss", label: "franceinfo" },
    ],
    politique: [
      { url: "https://www.lemonde.fr/politique/rss_full.xml", label: "Le Monde" },
      { url: "https://www.francetvinfo.fr/politique.rss", label: "franceinfo" },
      { url: "https://www.lefigaro.fr/rss/figaro_politique.xml", label: "Le Figaro" },
      { url: gnews("headlines/section/topic/NATION", "fr"), label: "Google Actualités" },
    ],
    actu: [
      { url: "https://www.lemonde.fr/rss/une.xml", label: "Le Monde" },
      { url: "https://www.francetvinfo.fr/titres.rss", label: "franceinfo" },
      { url: "https://www.lemonde.fr/international/rss_full.xml", label: "Le Monde International" },
      { url: "https://www.liberation.fr/arc/outboundfeeds/rss-all/collection/accueil-une/?outputType=xml", label: "Libération" },
      { url: gnews("", "fr"), label: "Google Actualités" },
    ],
    eco: [
      { url: "https://www.lemonde.fr/economie/rss_full.xml", label: "Le Monde" },
      { url: "https://www.francetvinfo.fr/economie.rss", label: "franceinfo" },
      { url: "https://www.lefigaro.fr/rss/figaro_economie.xml", label: "Le Figaro" },
      { url: gnews("headlines/section/topic/BUSINESS", "fr"), label: "Google Actualités" },
    ],
  },
  en: {
    ia: [
      { url: gnews("search?q=artificial+intelligence+when:2d", "en"), label: "Google News" },
      { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", label: "The Verge" },
      { url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", label: "MIT Tech Review" },
    ],
    tech: [
      { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", label: "BBC" },
      { url: "https://feeds.arstechnica.com/arstechnica/index", label: "Ars Technica" },
      { url: "https://www.theverge.com/rss/index.xml", label: "The Verge" },
      { url: gnews("headlines/section/topic/TECHNOLOGY", "en"), label: "Google News" },
    ],
    politique: [
      { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", label: "BBC" },
      { url: gnews("headlines/section/topic/POLITICS", "en"), label: "Google News" },
    ],
    actu: [
      { url: "https://feeds.bbci.co.uk/news/rss.xml", label: "BBC" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", label: "BBC World" },
      { url: gnews("", "en"), label: "Google News" },
    ],
    eco: [
      { url: "https://feeds.bbci.co.uk/news/business/rss.xml", label: "BBC" },
      { url: gnews("headlines/section/topic/BUSINESS", "en"), label: "Google News" },
    ],
  },
};
