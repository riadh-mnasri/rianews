// © 2026 Riadh MNASRI
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Check, ChevronDown, Share } from "lucide-react";
import type { Story } from "@/lib/types";
import { useTimeAgo } from "@/components/time-ago";

export function StoryCard({
  story,
  headingLevel,
  id,
}: {
  story: Story;
  headingLevel: 2 | 3;
  id?: string;
}) {
  const t = useTranslations("home");
  const timeAgo = useTimeAgo();
  const [copied, setCopied] = useState(false);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const when = timeAgo(story.publishedAt);
  const summary = story.essentiel.trim();
  const linkOnly = !summary && !story.pourquoi?.trim() && !story.aPlacer?.trim();

  async function share() {
    const url = story.sources[0]?.url;
    const text = summary ? `${story.title}\n\n${summary}` : story.title;
    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <article
      id={id}
      tabIndex={id ? -1 : undefined}
      className="article-copy scroll-mt-[calc(4.25rem+env(safe-area-inset-top,0px))] border-t border-border py-6 first:border-t-0 first:pt-2 md:scroll-mt-[calc(9rem+env(safe-area-inset-top,0px))] md:py-8"
    >
      {when && story.publishedAt && (
        <p className="mb-2 text-sm font-medium text-foreground-muted"><time dateTime={story.publishedAt}>{when}</time></p>
      )}

      <Heading className="serif text-[1.34em] leading-[1.15] font-semibold tracking-[-0.015em] text-pretty">
        {story.title}
      </Heading>

      {summary && (
        <p className="serif hyphens mt-3 text-[1em] leading-[1.58] text-pretty">{summary}</p>
      )}

      {(story.pourquoi || story.aPlacer) && (
        <details className="group mt-3 rounded-lg bg-surface-muted px-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown aria-hidden="true" className="size-4 group-open:rotate-180" />
            {t("moreContext")}
          </summary>
          <div className="space-y-3 pb-4">
            {story.pourquoi && (
              <div>
                <p className="text-sm font-semibold">{t("why")}</p>
                <p className="serif hyphens mt-1 leading-relaxed">{story.pourquoi}</p>
              </div>
            )}
            {story.aPlacer && (
              <div>
                <p className="text-sm font-semibold">{t("context")}</p>
                <p className="serif hyphens mt-1 leading-relaxed">{story.aPlacer}</p>
              </div>
            )}
          </div>
        </details>
      )}

      <div className="mt-4 flex items-start justify-between gap-3">
        <ul aria-label={t("sources")} className="flex min-w-0 flex-wrap gap-x-3 text-[0.75em] text-foreground-muted">
          {story.sources.map((source) => (
            <li key={source.url} className="min-w-0">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className={linkOnly
                  ? "inline-flex min-h-11 items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 font-semibold text-foreground hover:bg-accent-soft"
                  : "flex min-h-11 items-center py-1 underline decoration-current decoration-1 underline-offset-[3px] hover:text-foreground"}
              >
                {linkOnly ? t("readAtSource", { source: source.label }) : source.label}
                {linkOnly && <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={share}
          aria-label={copied ? t("copied") : t("share")}
          className="-mr-2 flex size-11 shrink-0 items-center justify-center text-foreground-muted transition-colors hover:text-foreground active:scale-90"
        >
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Share className="h-4 w-4" strokeWidth={1.75} />}
        </button>
      </div>
    </article>
  );
}

export function StorySkeleton() {
  return (
    <div className="border-t border-border py-7 first:border-t-0 first:pt-2">
      <div className="skeleton h-4 w-20" />
      <div className="skeleton mt-4 h-6 w-11/12" />
      <div className="skeleton mt-2 h-6 w-3/5" />
      <div className="skeleton mt-5 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-2/3" />
    </div>
  );
}
