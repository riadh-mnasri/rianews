// © 2026 Riadh MNASRI
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Share } from "lucide-react";
import type { CategoryId } from "@/data/categories";
import { CATEGORY_META } from "@/data/category-meta";
import type { Story } from "@/lib/types";
import { useTimeAgo } from "@/components/time-ago";

export function StoryCard({
  story,
  category,
  index,
}: {
  story: Story;
  category: CategoryId;
  index: number;
}) {
  const t = useTranslations("home");
  const timeAgo = useTimeAgo();
  const [copied, setCopied] = useState(false);
  const color = CATEGORY_META[category].color;
  const when = timeAgo(story.publishedAt);

  async function share() {
    const url = story.sources[0]?.url;
    const text = `${story.title}\n\n${story.essentiel}`;
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
      className="rise article-copy border-t border-border py-7 first:border-t-0 first:pt-2"
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
    >
      <div className="flex items-baseline gap-3">
        <span className="serif text-[1.9em] leading-none font-medium tabular-nums" style={{ color }}>
          {index + 1}
        </span>
        {when && <span className="kicker text-foreground-muted">{when}</span>}
      </div>

      <h3 className="serif mt-2 text-[1.4em] leading-[1.18] font-semibold tracking-[-0.012em] text-balance">
        {story.title}
      </h3>

      {story.essentiel && (
        <p className="serif hyphens mt-3 text-[1em] leading-[1.68] text-pretty">{story.essentiel}</p>
      )}

      {story.pourquoi && (
        <p className="serif hyphens mt-3 text-[0.94em] leading-[1.65] text-foreground-muted">
          <span className="kicker mr-1.5 text-foreground" style={{ fontSize: "0.74em" }}>
            {t("why")}.
          </span>
          {story.pourquoi}
        </p>
      )}

      {story.aPlacer && (
        <figure className="mt-5 border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>
          <figcaption className="kicker text-accent" style={{ fontSize: "0.66em" }}>
            {t("toDrop")}
          </figcaption>
          <blockquote className="serif mt-1 text-[1.02em] leading-[1.5] italic">
            « {story.aPlacer} »
          </blockquote>
        </figure>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="min-w-0 leading-relaxed text-[0.76em] text-foreground-muted">
          {story.sources.map((source, i) => (
            <span key={source.url}>
              {i > 0 && <span className="mx-1.5 opacity-50">/</span>}
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-border decoration-1 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-current"
              >
                {source.label}
              </a>
            </span>
          ))}
        </p>
        <button
          type="button"
          onClick={share}
          aria-label={t("share")}
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
      <div className="skeleton h-7 w-7" />
      <div className="skeleton mt-4 h-6 w-11/12" />
      <div className="skeleton mt-2 h-6 w-3/5" />
      <div className="skeleton mt-5 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-2/3" />
    </div>
  );
}
