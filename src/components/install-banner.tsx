// © 2026 Riadh MNASRI
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Share, X } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void> };
const DISMISS_KEY = "lessentiel-install-dismissed";

export function InstallBanner() {
  const t = useTranslations("install");
  const [mode, setMode] = useState<"ios" | "android" | null>(null);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (standalone || Date.now() - dismissed < 7 * 86400_000) return;

    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos) timer = setTimeout(() => setMode("ios"), 2500);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  if (!mode) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMode(null);
  }

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-30 px-4">
      <div className="sheet-in mx-auto flex max-w-md items-start gap-3 rounded-3xl border border-border/70 bg-surface/95 p-4 shadow-2xl backdrop-blur-xl">
        <span className="serif flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-xl font-bold text-accent-foreground">
          E
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("title")}</p>
          <p className="mt-0.5 text-sm leading-snug text-foreground-muted">
            {mode === "ios" ? (
              <>
                {t("iosBefore")}{" "}
                <Share className="inline h-4 w-4 -translate-y-px text-accent" aria-label="Share" />{" "}
                {t("iosAfter")}
              </>
            ) : (
              t("android")
            )}
          </p>
          {mode === "android" && promptEvent && (
            <button
              type="button"
              onClick={async () => {
                await promptEvent.prompt();
                setMode(null);
              }}
              className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground active:scale-95"
            >
              {t("button")}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground-muted active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
