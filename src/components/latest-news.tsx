// © 2026 Riadh MNASRI
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { LatestItem } from "@/lib/types";
import { useTimeAgo } from "@/components/time-ago";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const PREVIEW_COUNT = 3;

type Feed = {
  visible: LatestItem[] | null;
  pending: LatestItem[] | null;
  error: boolean;
};

export function LatestNews({ categories, refreshCount }: { categories: string; refreshCount: number }) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tc = useTranslations("categories");
  const timeAgo = useTimeAgo();
  const [feed, setFeed] = useState<Feed>({ visible: null, pending: null, error: false });

  useEffect(() => {
    const controller = new AbortController();
    let loading = false;

    async function check() {
      if (loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
        const params = new URLSearchParams({ cats: categories, locale });
        const response = await fetch(`/api/latest?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(String(response.status));
        const { items } = await response.json() as { items: LatestItem[] };
        if (controller.signal.aborted) return;
        setFeed((current) => {
          if (!current.visible?.length) return { visible: items, pending: null, error: false };
          const visibleUrls = new Set(current.visible.map((item) => item.url));
          const latestPublication = Date.parse(current.visible[0].publishedAt);
          const hasNewItems = items.some((item) =>
            Date.parse(item.publishedAt) >= latestPublication && !visibleUrls.has(item.url),
          );
          return { ...current, pending: hasNewItems ? items : current.pending, error: false };
        });
      } catch {
        if (!controller.signal.aborted) setFeed((current) => ({ ...current, error: true }));
      } finally {
        loading = false;
      }
    }

    void check();
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("online", check);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("online", check);
    };
  }, [categories, locale, refreshCount]);

  function renderItem(item: LatestItem) {
    return (
      <li key={item.url} className="border-t border-border py-4 md:py-5">
        <p className="mb-1 flex flex-wrap items-baseline gap-x-2 text-sm text-foreground-muted">
          <span className="font-semibold">{tc(item.category)}</span>
          <span>{item.source}</span>
          <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
        </p>
        <a href={item.url} target="_blank" rel="noreferrer"
          className="serif flex min-h-11 items-center justify-between gap-3 text-[1.13em] leading-snug font-semibold text-pretty hover:underline">
          {item.title}
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
        </a>
        {item.excerpt && <p className="reading-copy mt-1">{item.excerpt}</p>}
      </li>
    );
  }

  return (
    <section aria-labelledby="latest-heading" className="reading-column rounded-xl border border-border bg-surface px-4 pt-4 pb-2 md:px-6">
      <h2 id="latest-heading" className="serif text-[1.35em] leading-snug font-semibold">{t("latestTitle")}</h2>
      <div className="mb-3 flex items-center">
        <button type="button" disabled={!feed.pending} onClick={() => {
          setFeed((current) => current.pending
            ? { ...current, visible: current.pending, pending: null }
            : current);
        }} className="min-h-11 text-sm font-semibold text-accent hover:underline disabled:hidden">
          {t("latestShowNew")}
        </button>
        <span role="status" className="sr-only">{feed.pending ? t("latestShowNew") : ""}</span>
      </div>
      {feed.error && <p role="status" className="border-t border-border py-4 text-sm text-foreground-muted">{t("latestError")}</p>}
      {!feed.error && !feed.visible && <p role="status" className="border-t border-border py-4 text-sm text-foreground-muted">{t("latestLoading")}</p>}
      {!feed.error && feed.visible?.length === 0 && <p className="border-t border-border py-4 text-sm text-foreground-muted">{t("latestEmpty")}</p>}
      {!!feed.visible?.length && <ul>{feed.visible.slice(0, PREVIEW_COUNT).map(renderItem)}</ul>}
      {(feed.visible?.length ?? 0) > PREVIEW_COUNT && (
        <details className="group border-t border-border">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown aria-hidden="true" className="size-4 group-open:rotate-180" /> {t("latestMore")}
          </summary>
          <ul>{feed.visible?.slice(PREVIEW_COUNT).map(renderItem)}</ul>
        </details>
      )}
    </section>
  );
}
