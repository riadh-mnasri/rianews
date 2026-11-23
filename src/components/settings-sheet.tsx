// © 2026 Riadh MNASRI
"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { InterestPicker } from "@/components/interest-picker";
import { setPrefs, TEXT_SIZES, usePrefs, type ThemePref } from "@/lib/prefs-store";

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-2xl bg-surface-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-xl py-2.5 text-[0.95rem] font-semibold transition-all ${
            o.value === value ? "bg-surface text-foreground shadow-card" : "text-foreground-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const t = useTranslations("settings");
  const prefs = usePrefs();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={t("title")}>
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="fade-in absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div className="sheet-in absolute inset-x-0 bottom-0 mx-auto max-h-[90dvh] max-w-xl overflow-y-auto rounded-t-[2rem] border border-border/70 bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-6 pt-3 pb-3">
          <span className="absolute top-2 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-border" />
          <h2 className="serif pt-3 text-2xl font-semibold">{t("title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted transition-transform active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="pb-safe space-y-7 px-6 pt-2">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">{t("textSize")}</h3>
            <div className="rounded-2xl bg-surface p-4 shadow-card">
              <p className="serif leading-snug" style={{ fontSize: TEXT_SIZES[prefs.textSize] }}>
                {t("preview")}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="serif text-sm font-semibold">A</span>
                <input
                  type="range"
                  min={0}
                  max={TEXT_SIZES.length - 1}
                  step={1}
                  value={prefs.textSize}
                  onChange={(e) => setPrefs({ textSize: Number(e.target.value) })}
                  className="h-2 flex-1 cursor-pointer accent-[var(--accent)]"
                  aria-label={t("textSize")}
                />
                <span className="serif text-2xl font-semibold">A</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">{t("interests")}</h3>
            <InterestPicker value={prefs.interests} onChange={(interests) => setPrefs({ interests })} />
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">{t("theme")}</h3>
            <Segmented<ThemePref>
              value={prefs.theme}
              onChange={(theme) => setPrefs({ theme })}
              options={[
                { value: "light", label: t("light") },
                { value: "system", label: t("system") },
                { value: "dark", label: t("dark") },
              ]}
            />
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">{t("language")}</h3>
            <Segmented
              value={locale}
              onChange={(next) => router.replace(pathname, { locale: next })}
              options={routing.locales.map((l) => ({ value: l, label: l === "fr" ? "Français" : "English" }))}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
