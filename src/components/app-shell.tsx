// © 2026 Riadh MNASRI
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Newspaper, RefreshCw, Settings2, WifiOff } from "lucide-react";
import type { CategoryId } from "@/data/categories";
import { CATEGORY_META } from "@/data/category-meta";
import { useBriefs, type BriefState } from "@/lib/brief-store";
import { applyPrefsToDocument, usePrefs } from "@/lib/prefs-store";
import { StoryCard, StorySkeleton } from "@/components/story-card";
import { SettingsSheet } from "@/components/settings-sheet";
import { Onboarding } from "@/components/onboarding";
import { InstallBanner } from "@/components/install-banner";
import { Logo } from "@/components/logo";
import { LocaleToggle, ThemeToggle } from "@/components/header-toggles";
import { useTimeAgo } from "@/components/time-ago";
import { useClientValue, useOnline } from "@/lib/client-values";

type Tab = "home" | CategoryId;

const iconBtn =
  "flex size-11 items-center justify-center text-foreground-muted transition-colors hover:text-foreground active:scale-90";

function useEdition() {
  const t = useTranslations("home");
  const hour = useClientValue(() => new Date().getHours(), 9);
  if (hour < 12) return t("editionMorning");
  if (hour < 18) return t("editionAfternoon");
  return t("editionEvening");
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
    <div className="rise flex flex-col items-center border-y border-border px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-foreground-muted" strokeWidth={1.5} />
      <p className="serif mt-4 text-[1.25em] font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-xs text-[0.85em] text-foreground-muted">{text}</p>}
      {action}
    </div>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="mt-5 bg-foreground px-5 py-2.5 text-[0.8em] font-semibold text-background transition-opacity hover:opacity-85 active:scale-95"
    />
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
          action={<PrimaryButton onClick={onRetry}>{t("retry")}</PrimaryButton>}
        />
      );
    }
    return (
      <div>
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
    <div>
      {brief.intro && (
        <p className="serif mb-4 text-[1.08em] leading-snug text-foreground-muted italic text-pretty">
          {brief.intro}
        </p>
      )}
      {stories.map((story, i) => (
        <StoryCard key={story.id} story={story} headingLevel={limit ? 3 : 2} id={i === 0 && limit ? `story-${category}` : undefined} />
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
  const edition = useEdition();
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

  const interests = prefs.interests;
  const { states, refresh } = useBriefs(interests, locale);
  const tabs: Tab[] = useMemo(() => ["home", ...interests], [interests]);
  const activeTab: Tab = tabs.includes(tab) ? tab : "home";

  useEffect(() => {
    applyPrefsToDocument(prefs);
  }, [prefs]);

  function goTo(next: Tab) {
    setTab(next);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
    const strip = tabsRef.current;
    const button = strip?.querySelector<HTMLElement>(`[data-tab="${next}"]`);
    if (strip && button) {
      const left = button.getBoundingClientRect().left - strip.getBoundingClientRect().left;
      strip.scrollTo({ left: strip.scrollLeft + left - (strip.clientWidth - button.offsetWidth) / 2, behavior });
    }
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

  const storyCount = (activeTab === "home" ? interests : [activeTab]).reduce(
    (n, c) => n + Math.min(states[c]?.brief?.stories.length ?? 0, activeTab === "home" ? 3 : 99),
    0,
  );
  const minutes = Math.max(1, Math.round((storyCount * 75) / 230));

  return (
    <div className="relative min-h-dvh">
      {!prefs.onboarded && <Onboarding />}

      <header className="contents md:sticky md:top-0 md:z-20 md:block md:bg-background">
        <div className="pt-safe">
          <div className="page-gutter mx-auto flex max-w-[72rem] items-center justify-between py-2 md:pt-5 md:pb-3">
            <Logo />
            <div className="-mr-2 flex items-center">
              <LocaleToggle />
              <ThemeToggle />
              <button type="button" onClick={refresh} aria-label={t("refresh")} className={iconBtn}>
                <RefreshCw className={`h-[1.05rem] w-[1.05rem] ${anyLoading ? "animate-spin" : ""}`} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
        <nav aria-label={t("sections")} className="sticky top-[env(safe-area-inset-top,0px)] z-20 border-y border-border bg-background shadow-sm md:static">
          <div className="page-gutter mx-auto flex max-w-[72rem] items-stretch">
            <div ref={tabsRef} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto py-1.5 md:gap-2">
              {tabs.map((id) => {
                const active = id === activeTab;
                const color = id === "home" ? "var(--foreground)" : CATEGORY_META[id].color;
                return (
                  <button
                    key={id}
                    data-tab={id}
                    aria-current={active ? "true" : undefined}
                    type="button"
                    onClick={() => goTo(id)}
                    className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-offset-[-3px] ${
                      active ? "bg-surface-muted text-foreground" : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <span style={active ? { color } : undefined}>{id === "home" ? t("all") : tc(id)}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t("settings")}
              className="ml-2 flex w-11 shrink-0 items-center justify-center border-l border-border text-foreground-muted hover:text-foreground"
            >
              <span aria-hidden="true" className="text-base font-semibold md:hidden">Aa</span>
              <Settings2 aria-hidden="true" className="hidden size-5 md:block" strokeWidth={1.75} />
            </button>
          </div>
        </nav>
      </header>

      <main className="page-gutter reading edition-content mx-auto max-w-[72rem] pt-4 md:pt-10">
        {offline && (
          <p className="mb-5 flex items-center gap-2 border-y border-border py-2.5 text-[0.75em] text-foreground-muted">
            <WifiOff className="h-4 w-4 shrink-0" strokeWidth={1.75} /> {t("offline")}
          </p>
        )}

        <div className="edition-banner mb-5 rounded-2xl px-4 py-5 md:mb-8 md:px-12 md:py-14">
          <div className="relative max-w-2xl">
            <p className="kicker text-[#f1c995] first-letter:uppercase">
              {today}
              {today && activeTab === "home" && <span> · {edition}</span>}
            </p>
            <h1 className="serif mt-2 text-[1.65em] leading-[1.06] font-semibold tracking-[-0.035em] text-balance md:text-[3em]">
              {activeTab === "home" ? t("homeTitle") : tc(activeTab)}
            </h1>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.72em] text-[#d8dce5] empty:hidden">
              {storyCount > 0 && <span>{t("readingTime", { minutes })}</span>}
              {lastUpdate && <span>{t("updated", { time: timeAgo(lastUpdate) ?? "" })}</span>}
            </p>
          </div>
        </div>
        {rawMode && <p className="mb-6 text-[0.7em] text-foreground-muted">{t("rawMode")}</p>}

        {interests.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={t("noInterestTitle")}
            text={t("noInterestText")}
            action={<PrimaryButton onClick={() => setSettingsOpen(true)}>{t("chooseInterests")}</PrimaryButton>}
          />
        ) : activeTab === "home" ? (
          <div className="space-y-9 md:space-y-12">
            {topThree.length > 0 && (
              <section className="rise rounded-xl border border-border bg-surface px-4 pt-4 pb-2 md:px-7 md:pt-6">
                <h2 className="kicker text-foreground">{t("topThree")}</h2>
                <ol className="mt-3 grid divide-y divide-border md:auto-cols-fr md:grid-flow-col md:divide-x md:divide-y-0">
                  {topThree.map(({ category, story }) => (
                    <li key={category} className="md:px-5 md:first:pl-0 md:last:pr-0">
                      <button
                        type="button"
                        onClick={() => {
                          const article = document.getElementById(`story-${category}`);
                          article?.focus({ preventScroll: true });
                          article?.scrollIntoView({ block: "start" });
                        }}
                        className="group flex h-full w-full items-start justify-between gap-3 py-3 text-left"
                      >
                        <span className="min-w-0">
                          <span className="kicker block" style={{ color: CATEGORY_META[category].color, fontSize: "0.65em" }}>
                            {tc(category)}
                          </span>
                          <span className="serif mt-0.5 block text-[1.08em] leading-tight font-semibold decoration-1 underline-offset-4 group-hover:underline">
                            {story.title}
                          </span>
                        </span>
                        <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-foreground-muted group-hover:text-accent" />
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mx-auto max-w-[47rem] space-y-9 md:space-y-12">
              {interests.map((category) => {
                const meta = CATEGORY_META[category];
                return (
                  <section key={category}>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="kicker shrink-0" style={{ color: meta.color, fontSize: "0.78em" }}>
                        {tc(category)}
                      </h2>
                      <span className="h-px flex-1" style={{ background: meta.color, opacity: 0.45 }} />
                    </div>
                    <CategoryFeed category={category} state={states[category]} limit={3} onRetry={refresh} />
                    <button
                      type="button"
                      onClick={() => goTo(category)}
                      className="mt-1 flex min-h-11 items-center gap-1.5 text-[0.75em] font-semibold text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {t("seeMore")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[47rem]">
            <CategoryFeed key={activeTab} category={activeTab} state={states[activeTab]} onRetry={refresh} />
          </div>
        )}

        <footer className="mt-16 border-t border-border pt-6 text-[0.68em] leading-relaxed text-foreground-muted">
          <p>{tf("disclaimer")}</p>
          <p className="mt-2">© {new Date().getFullYear()} Riadh MNASRI</p>
        </footer>
        {prefs.onboarded && !settingsOpen && <InstallBanner />}
      </main>

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
