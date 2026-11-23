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
  "flex h-9 w-9 items-center justify-center text-foreground-muted transition-colors hover:text-foreground active:scale-90";

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

  const storyCount = (activeTab === "home" ? interests : [activeTab]).reduce(
    (n, c) => n + Math.min(states[c]?.brief?.stories.length ?? 0, activeTab === "home" ? 3 : 99),
    0,
  );
  const minutes = Math.max(1, Math.round((storyCount * 75) / 230));

  return (
    <div className="relative min-h-dvh">
      {!prefs.onboarded && <Onboarding />}

      <header className="pt-safe sticky top-0 z-20 bg-background">
        <div className="masthead-rule mx-auto flex max-w-[46rem] lg:max-w-[50rem] items-center justify-between px-5 pt-3 pb-2.5 md:pt-5 md:pb-3">
          <Logo />
          <div className="-mr-2 flex items-center">
            <LocaleToggle />
            <ThemeToggle />
            <button type="button" onClick={refresh} aria-label={t("refresh")} className={iconBtn}>
              <RefreshCw className={`h-[1.05rem] w-[1.05rem] ${anyLoading ? "animate-spin" : ""}`} strokeWidth={1.75} />
            </button>
            <button type="button" onClick={() => setSettingsOpen(true)} aria-label={t("settings")} className={iconBtn}>
              <Settings2 className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <nav className="border-b border-border">
          <div ref={tabsRef} className="no-scrollbar mx-auto flex max-w-[46rem] lg:max-w-[50rem] gap-6 overflow-x-auto px-5">
            {tabs.map((id) => {
              const active = id === activeTab;
              const color = id === "home" ? "var(--foreground)" : CATEGORY_META[id].color;
              return (
                <button
                  key={id}
                  data-tab={id}
                  type="button"
                  onClick={() => goTo(id)}
                  className={`relative shrink-0 py-3 text-[0.8rem] font-semibold md:text-[0.9rem] tracking-[0.06em] uppercase transition-colors ${
                    active ? "text-foreground" : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {id === "home" ? t("all") : tc(id)}
                  <span
                    className={`absolute inset-x-0 -bottom-px h-[3px] transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                    style={{ background: color }}
                  />
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main
        className="reading mx-auto max-w-[46rem] lg:max-w-[50rem] px-5 pt-7 pb-16 md:pt-10"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={onTouchEnd}
      >
        {offline && (
          <p className="mb-5 flex items-center gap-2 border-y border-border py-2.5 text-[0.75em] text-foreground-muted">
            <WifiOff className="h-4 w-4 shrink-0" strokeWidth={1.75} /> {t("offline")}
          </p>
        )}

        <div className="mb-7">
          <p className="kicker text-foreground-muted first-letter:uppercase">
            {today}
            {today && activeTab === "home" && <span className="text-accent"> · {edition}</span>}
          </p>
          <h1 className="serif mt-2 text-[2.1em] leading-[1.05] font-semibold tracking-[-0.02em]">
            {activeTab === "home" ? t("homeTitle") : tc(activeTab)}
          </h1>
          <p className="mt-2 text-[0.75em] text-foreground-muted">
            {storyCount > 0 && t("readingTime", { minutes })}
            {lastUpdate && <> · {t("updated", { time: timeAgo(lastUpdate) ?? "" })}</>}
            {rawMode && <span className="block pt-1 opacity-80">{t("rawMode")}</span>}
          </p>
        </div>

        {interests.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={t("noInterestTitle")}
            text={t("noInterestText")}
            action={<PrimaryButton onClick={() => setSettingsOpen(true)}>{t("chooseInterests")}</PrimaryButton>}
          />
        ) : activeTab === "home" ? (
          <div className="space-y-12">
            {topThree.length > 0 && (
              <section className="rise border-t-[3px] border-rule bg-surface-muted/60 px-5 pt-4 pb-5 dark:bg-surface">
                <h2 className="kicker text-foreground">{t("topThree")}</h2>
                <ol className="mt-3 divide-y divide-border">
                  {topThree.map(({ category, story }, i) => (
                    <li key={story.id}>
                      <button
                        type="button"
                        onClick={() => goTo(category)}
                        className="group flex w-full gap-4 py-3 text-left"
                      >
                        <span className="serif text-[1.5em] leading-none font-medium text-accent tabular-nums">{i + 1}</span>
                        <span className="min-w-0">
                          <span className="kicker block" style={{ color: CATEGORY_META[category].color, fontSize: "0.62em" }}>
                            {tc(category)}
                          </span>
                          <span className="serif mt-0.5 block text-[1.06em] leading-snug font-medium decoration-1 underline-offset-4 group-hover:underline">
                            {story.title}
                          </span>
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
                    className="mt-1 flex items-center gap-1.5 text-[0.75em] font-semibold text-foreground-muted transition-colors hover:text-foreground"
                  >
                    {t("seeMore")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </section>
              );
            })}
          </div>
        ) : (
          <CategoryFeed key={activeTab} category={activeTab} state={states[activeTab]} onRetry={refresh} />
        )}

        <footer className="mt-16 border-t border-border pt-6 text-[0.68em] leading-relaxed text-foreground-muted">
          <p>{tf("disclaimer")}</p>
          <p className="mt-2">© {new Date().getFullYear()} Riadh MNASRI</p>
        </footer>
      </main>

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
      {prefs.onboarded && !settingsOpen && <InstallBanner />}
    </div>
  );
}
