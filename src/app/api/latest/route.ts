// © 2026 Riadh MNASRI
import { NextResponse, type NextRequest } from "next/server";
import { isCategoryId } from "@/data/categories";
import { fetchCategoryItems, normalizeTitle } from "@/lib/rss";
import type { LatestItem } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const categories = [...new Set((params.get("cats") ?? "").split(","))];
  const locale = params.get("locale") === "en" ? "en" : "fr";

  if (!categories.every(isCategoryId)) {
    return NextResponse.json({ error: "unknown category" }, { status: 400 });
  }

  const batches = await Promise.all(
    categories.map(async (category) =>
      (await fetchCategoryItems(category, locale)).map((item) => ({ ...item, category })),
    ),
  );
  const seen = new Set<string>();
  const items: LatestItem[] = [];

  for (const item of batches.flat().sort((a, b) =>
    (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0) ||
    Number(Boolean(b.excerpt)) - Number(Boolean(a.excerpt)),
  )) {
    if (item.foreign || !item.publishedAt) continue;
    const title = normalizeTitle(item.title);
    if (seen.has(title) || seen.has(item.url)) continue;
    seen.add(title);
    seen.add(item.url);
    items.push({
      title: item.title,
      url: item.url,
      source: item.source,
      publishedAt: item.publishedAt,
      excerpt: item.excerpt,
      category: item.category,
    });
    if (items.length === 12) break;
  }

  return NextResponse.json({ items }, {
    headers: { "Cache-Control": items.length ? "public, s-maxage=60" : "no-store" },
  });
}
