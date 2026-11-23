// © 2026 Riadh MNASRI
import { NextResponse, type NextRequest } from "next/server";
import { isCategoryId } from "@/data/categories";
import { getCachedBrief } from "@/lib/cached";

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("cat") ?? "";
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "fr";
  if (!isCategoryId(category)) {
    return NextResponse.json({ error: "unknown category" }, { status: 400 });
  }
  const brief = await getCachedBrief(category, locale);
  return NextResponse.json(brief, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
  });
}
