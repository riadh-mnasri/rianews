// © 2026 Riadh MNASRI
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MessageCircle, Share2 } from "lucide-react";
import type { CategoryId } from "@/data/categories";
import { CATEGORY_META } from "@/data/category-meta";
import type { Story } from "@/lib/types";
import { useTimeAgo } from "@/components/time-ago";

export function StoryCard({
  story,
  category,
  index,
  showCategory = false,
}: {
  story: Story;
  category: CategoryId;
  index: number;
  showCategory?: boolean;
}) {
  const t = useTranslations("home");
  const tc = useTranslations("categories");
  const timeAgo = useTimeAgo();
  const [copied, setCopied] = useState(false);
  const meta = CATEGORY_META[category];
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
      className="rise relative rounded-3xl border border-border/70 bg-surface p-5 shadow-card sm:p-6"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="flex items-center gap-2 text-[0.8125rem] font-medium text-foreground-muted">
        {showCategory ? (
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: meta.color }}>
            <meta.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {tc(category)}
          </span>
        ) : (
          <span
            className="serif flex h-6 w-6 items-center justify-center rounded-full text-[0.8125rem] font-bold"
            style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 14%, transparent)` }}
          >
            {index + 1}
          </span>
        )}
        {when && (
          <>
            <span aria-hidden>·</span>
            <span>{when}</span>
          </>
        )}
      </div>

      <h3 className="serif mt-2.5 text-[1.32em] font-semibold leading-[1.22] tracking-[-0.01em] text-balance">
        {story.title}
      </h3>

      {story.essentiel && (
        <p className="serif mt-2.5 text-[1em] leading-[1.6] text-foreground/90 text-pretty">
          {story.essentiel}
        </p>
      )}

      {story.pourquoi && (
        <div className="mt-4 border-l-[3px] pl-3.5" style={{ borderColor: meta.color }}>
          <p className="text-[0.68em] font-bold uppercase tracking-[0.08em] text-foreground-muted">
            {t("why")}
          </p>
          <p className="serif mt-0.5 text-[0.95em] leading-[1.55] text-foreground/85">{story.pourquoi}</p>
        </div>
      )}

      {story.aPlacer && (
        <div className="mt-4 flex gap-3 rounded-2xl bg-accent-soft px-4 py-3">
          <MessageCircle className="mt-[0.2em] h-[1.05em] w-[1.05em] shrink-0 text-accent" strokeWidth={2.25} />
          <div>
            <p className="text-[0.68em] font-bold uppercase tracking-[0.08em] text-accent">{t("toDrop")}</p>
            <p className="serif mt-0.5 text-[0.95em] italic leading-[1.5]">{story.aPlacer}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-foreground-muted">
          {story.sources.map((source, i) => (
            <span key={source.url} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>·</span>}
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="truncate underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:text-accent"
              >
                {source.label}
              </a>
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={share}
          aria-label={t("share")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-muted transition-all hover:bg-surface-muted hover:text-foreground active:scale-90"
        >
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Share2 className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}

export function StorySkeleton() {
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-4 h-6 w-11/12" />
      <div className="skeleton mt-2 h-6 w-2/3" />
      <div className="skeleton mt-4 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-10/12" />
      <div className="skeleton mt-5 h-14 w-full rounded-2xl" />
    </div>
  );
}
