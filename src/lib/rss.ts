// © 2026 Riadh MNASRI
import Parser from "rss-parser";
import { FEEDS, type CategoryId, type Feed } from "@/data/categories";
import type { RawItem } from "@/lib/types";

const parser = new Parser();
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const PER_FEED = 25;

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cleanExcerpt(value: string | undefined, title: string): string | null {
  if (!value) return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < 40 || normalizeTitle(text) === normalizeTitle(title)) return null;
  return text.length > 320 ? `${text.slice(0, 317).trimEnd()}…` : text;
}

async function fetchFeed({ url, label, foreign }: Feed): Promise<RawItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RiaNews/1.0)" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const feed = await parser.parseString(await res.text());
    const isGoogle = url.includes("news.google.com");

    return (feed.items ?? []).slice(0, PER_FEED).flatMap((item) => {
      if (!item.title?.trim() || !item.link || !/^https?:\/\//i.test(item.link)) return [];
      let title = item.title.trim();
      let source = label;
      if (isGoogle) {
        // Les titres Google Actualités se terminent par « - Nom du média ».
        const cut = title.lastIndexOf(" - ");
        if (cut > 20) {
          source = title.slice(cut + 3).trim();
          title = title.slice(0, cut).trim();
        }
      }
      return [
        {
          title,
          url: item.link,
          source,
          publishedAt: item.isoDate && Number.isFinite(Date.parse(item.isoDate)) ? item.isoDate : null,
          excerpt: isGoogle ? null : cleanExcerpt(item.contentSnippet, title) ?? cleanExcerpt(item.summary, title),
          foreign,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function fetchCategoryItems(
  category: CategoryId,
  locale: "fr" | "en",
): Promise<RawItem[]> {
  const feeds = FEEDS[locale][category];
  const batches = await Promise.all(feeds.map(fetchFeed));
  const now = Date.now();
  const unique = new Map<string, RawItem>();

  for (const item of batches.flat()) {
    if (item.publishedAt) {
      const age = now - new Date(item.publishedAt).getTime();
      if (age > MAX_AGE_MS || age < -3600_000) continue;
    }
    const key = normalizeTitle(item.title).slice(0, 60);
    const existing = unique.get(key);
    if (!existing || (!item.foreign && (existing.foreign || (!existing.excerpt && item.excerpt)))) {
      unique.set(key, item);
    }
  }

  return [...unique.values()]
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });
}
