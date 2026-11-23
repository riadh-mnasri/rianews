// © 2026 Riadh MNASRI
"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { setPrefs, usePrefs } from "@/lib/prefs-store";

function subscribeScheme(cb: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", cb);
  return () => media.removeEventListener("change", cb);
}

function useIsDark(): boolean {
  const prefs = usePrefs();
  const systemDark = useSyncExternalStore(
    subscribeScheme,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
  return prefs.theme === "dark" || (prefs.theme === "system" && systemDark);
}

const btn =
  "flex h-9 items-center justify-center rounded-full text-foreground-muted transition-all hover:bg-surface-muted hover:text-foreground active:scale-90";

export function ThemeToggle() {
  const t = useTranslations("home");
  const dark = useIsDark();
  return (
    <button
      type="button"
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      aria-label={dark ? t("lightMode") : t("darkMode")}
      className={`${btn} w-9`}
    >
      {dark ? <Sun className="h-[1.1rem] w-[1.1rem]" /> : <Moon className="h-[1.1rem] w-[1.1rem]" />}
    </button>
  );
}

export function LocaleToggle() {
  const t = useTranslations("home");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "fr" ? "en" : "fr";
  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      aria-label={t("switchLanguage")}
      className={`${btn} gap-0.5 px-2 text-[0.8rem] font-bold tracking-wide`}
    >
      <span className="text-foreground">{locale.toUpperCase()}</span>
      <span className="opacity-40">/</span>
      <span>{next.toUpperCase()}</span>
    </button>
  );
}
