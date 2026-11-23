// © 2026 Riadh MNASRI
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Info, Newspaper, RefreshCw, Settings2, WifiOff } from "lucide-react";
import type { CategoryId } from "@/data/categories";
import { CATEGORY_META } from "@/data/category-meta";
import { useBriefs, type BriefState } from "@/lib/brief-store";
import { applyPrefsToDocument, usePrefs } from "@/lib/prefs-store";
import { StoryCard, StorySkeleton } from "@/components/story-card";
import { SettingsSheet } from "@/components/settings-sheet";
import { Onboarding } from "@/components/onboarding";
import { InstallBanner } from "@/components/install-banner";
import { Logo } from "@/components/logo";
import { useTimeAgo } from "@/components/time-ago";
import { useClientValue, useOnline } from "@/lib/client-values";

type Tab = "home" | CategoryId;

function useGreeting() {
  const t = useTranslations("home");
  const hour = useClientValue(() => new Date().getHours(), 9);
  if (hour < 12) return t("greetingMorning");
  if (hour < 18) return t("greetingAfternoon");
  return t("greetingEvening");
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof Newspaper;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rise flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
        <Icon className="h-7 w-7" />
      </span>
      <p className="serif mt-4 text-[1.2em] font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-[0.9em] text-foreground-muted">{text}</p>
      {action}
    </div>
  );
}

function CategoryFeed({
  category,
  state,
  limit,
  onRetry,
}: {
  category: CategoryId;
  state: BriefState | undefined;
  limit?: number;
  onRetry: () => void;
}) {
  const t = useTranslations("home");
  const brief = state?.brief;

  if (!brief) {
    if (state?.error) {
      return (
        <EmptyState
          icon={WifiOff}
          title={t("loadError")}
          text=""
          action={
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground active:scale-95"
            >
              {t("retry")}
            </button>
          }
        />
      );
    }
    return (
      <div className="space-y-4">
        {Array.from({ length: limit ?? 3 }, (_, i) => (
          <StorySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (brief.stories.length === 0) {
    return <EmptyState icon={Newspaper} title={t("emptyTitle")} text={t("emptyText")} />;
  }

  const stories = limit ? brief.stories.slice(0, limit) : brief.stories;
  return (
    <div className="space-y-4">
      {brief.intro && (
        <p className="serif px-1 text-[1.05em] italic leading-snug text-foreground-muted text-pretty">
          {brief.intro}
        </p>
      )}
      {stories.map((story, i) => (
        <StoryCard key={story.id} story={story} category={category} index={i} />
      ))}
    </div>
  );
}

export function AppShell() {
  const t = useTranslations("home");
  const tc = useTranslations("categories");
  const tf = useTranslations("footer");
  const locale = useLocale();
  const prefs = usePrefs();
  const greeting = useGreeting();
  const timeAgo = useTimeAgo();
  const [tab, setTab] = useState<Tab>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const offline = !useOnline();
  const today = useClientValue(
    () =>
      new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    "",
  );
  const tabsRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const interests = prefs.interests;
  const { states, refresh } = useBriefs(interests, locale);
  const tabs: Tab[] = useMemo(() => ["home", ...interests], [interests]);
  const activeTab: Tab = tabs.includes(tab) ? tab : "home";

  useEffect(() => {
    applyPrefsToDocument(prefs);
  }, [prefs]);

  function goTo(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const el = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${next}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const i = tabs.indexOf(activeTab);
    const next = tabs[i + (dx < 0 ? 1 : -1)];
    if (next) goTo(next);
  }

  const loadedStates = interests.map((c) => states[c]).filter(Boolean) as BriefState[];
  const anyLoading = loadedStates.some((s) => s.loading);
  const rawMode = loadedStates.some((s) => s.brief?.mode === "raw" && s.brief.stories.length > 0);
  const lastUpdate = loadedStates
    .map((s) => s.brief?.generatedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .pop();

  const topThree = interests
    .flatMap((c) => {
      const s = states[c]?.brief?.stories[0];
      return s ? [{ category: c, story: s }] : [];
    })
    .slice(0, 3);

  const storyCount = interests.reduce(
    (n, c) => n + Math.min(states[c]?.brief?.stories.length ?? 0, activeTab === "home" ? 3 : 99),
    0,
  );
  const minutes = Math.max(1, Math.round((storyCount * 70) / 230));

  return (
    <div className="paper relative min-h-dvh">
      {!prefs.onboarded && <Onboarding />}

      <header className="pt-safe sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Logo />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={refresh}
              aria-label={t("refresh")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-muted transition-all hover:bg-surface-muted hover:text-foreground active:scale-90"
            >
              <RefreshCw className={`h-[1.15rem] w-[1.15rem] ${anyLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t("settings")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-muted transition-all hover:bg-surface-muted hover:text-foreground active:scale-90"
            >
              <Settings2 className="h-[1.15rem] w-[1.15rem]" />
            </button>
          </div>
        </div>
        <div ref={tabsRef} className="no-scrollbar mx-auto flex max-w-2xl gap-2 overflow-x-auto px-5 pb-3">
          {tabs.map((id) => {
            const active = id === activeTab;
            const meta = id === "home" ? null : CATEGORY_META[id];
            return (
              <button
                key={id}
                data-tab={id}
                type="button"
                onClick={() => goTo(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-all active:scale-95 ${
                  active
                    ? "bg-foreground text-background shadow-card"
                    : "bg-surface-muted/70 text-foreground-muted hover:text-foreground"
                }`}
              >
                {meta && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: active ? "currentColor" : meta.color }}
                  />
                )}
                {id === "home" ? t("all") : tc(id)}
              </button>
            );
          })}
        </div>
      </header>

      <main
        className="reading relative z-10 mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-5"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={onTouchEnd}
      >
        {offline && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-surface-muted px-4 py-3 text-[0.8em] text-foreground-muted">
            <WifiOff className="h-4 w-4 shrink-0" /> {t("offline")}
          </div>
        )}

        <div className="mb-6 px-1">
          <p className="text-[0.75em] font-semibold uppercase tracking-[0.12em] text-accent first-letter:uppercase">
            {today}
          </p>
          <h1 className="serif mt-1 text-[1.75em] font-semibold leading-tight tracking-tight">
            {activeTab === "home" ? `${greeting}.` : tc(activeTab)}
          </h1>
          <p className="mt-1 text-[0.85em] text-foreground-muted">
            {activeTab === "home" ? `${t("subtitle")} ` : ""}
            {storyCount > 0 && t("readingTime", { minutes })}
            {lastUpdate && <> · {t("updated", { time: timeAgo(lastUpdate) ?? "" })}</>}
          </p>
        </div>

        {rawMode && (
          <div className="mb-5 flex gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 text-[0.78em] leading-snug text-foreground-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            {t("rawMode")}
          </div>
        )}

        {interests.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={t("noInterestTitle")}
            text={t("noInterestText")}
            action={
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground active:scale-95"
              >
                {t("chooseInterests")}
              </button>
            }
          />
        ) : activeTab === "home" ? (
          <div className="space-y-10">
            {topThree.length > 0 && (
              <section className="rise rounded-3xl bg-foreground p-5 text-background shadow-card sm:p-6">
                <h2 className="text-[0.72em] font-bold uppercase tracking-[0.12em] opacity-70">{t("topThree")}</h2>
                <ol className="mt-3 space-y-4">
                  {topThree.map(({ category, story }, i) => (
                    <li key={story.id}>
                      <button type="button" onClick={() => goTo(category)} className="flex w-full gap-3.5 text-left">
                        <span className="serif text-[1.6em] font-semibold leading-none text-accent">{i + 1}</span>
                        <span>
                          <span className="block text-[0.72em] font-semibold uppercase tracking-[0.08em] opacity-60">
                            {tc(category)}
                          </span>
                          <span className="serif mt-0.5 block text-[1.08em] font-medium leading-snug">{story.title}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {interests.map((category) => {
              const meta = CATEGORY_META[category];
              return (
                <section key={category}>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-2 text-[0.8em] font-bold uppercase tracking-[0.1em]" style={{ color: meta.color }}>
                      <meta.icon className="h-4 w-4" strokeWidth={2.5} />
                      {tc(category)}
                    </h2>
                    <button
                      type="button"
                      onClick={() => goTo(category)}
                      className="flex items-center gap-0.5 text-[0.78em] font-semibold text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {t("seeMore")} <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <CategoryFeed category={category} state={states[category]} limit={3} onRetry={refresh} />
                </section>
              );
            })}
          </div>
        ) : (
          <CategoryFeed key={activeTab} category={activeTab} state={states[activeTab]} onRetry={refresh} />
        )}

        <footer className="mt-14 border-t border-border pt-6 text-center text-[0.72em] leading-relaxed text-foreground-muted">
          <p>{tf("disclaimer")}</p>
          <p className="mt-2">© {new Date().getFullYear()} Riadh MNASRI · {tf("madeBy")}</p>
        </footer>
      </main>

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
      {prefs.onboarded && !settingsOpen && <InstallBanner />}
    </div>
  );
}
