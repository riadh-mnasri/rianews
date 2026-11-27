// © 2026 Riadh MNASRI
"use client";

import { useEffect, useRef } from "react";
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
    <div className="flex border border-border p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2.5 text-[0.9rem] font-semibold transition-colors ${
            o.value === value ? "bg-foreground text-background" : "text-foreground-muted hover:text-foreground"
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("title")}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-foreground backdrop:bg-transparent"
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={close}
        className="fade-in absolute inset-0 bg-[#1c1a17]/45"
      />
      <div className="sheet-in absolute inset-x-0 bottom-0 mx-auto max-h-[90dvh] max-w-xl overflow-y-auto rounded-t-xl border-t-[3px] border-rule bg-background shadow-[0_-12px_40px_rgb(0_0_0/0.18)]">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-6 pt-3 pb-3">
          <h2 className="serif pt-2 text-[1.7rem] font-semibold">{t("title")}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="mt-2 -mr-2 flex size-11 items-center justify-center text-foreground-muted transition-colors hover:text-foreground active:scale-90"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="pb-safe space-y-7 px-6 pt-2">
          <section>
            <h3 className="kicker mb-3 text-foreground-muted" style={{ fontSize: "0.72rem" }}>{t("textSize")}</h3>
            <div className="border border-border bg-surface p-4">
              <p className="reading-copy" style={{ fontSize: TEXT_SIZES[prefs.textSize] }}>
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
                  className="h-11 min-w-0 flex-1 cursor-pointer accent-[var(--accent)]"
                  aria-label={t("textSize")}
                />
                <span className="serif text-2xl font-semibold">A</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="kicker mb-3 text-foreground-muted" style={{ fontSize: "0.72rem" }}>{t("interests")}</h3>
            <InterestPicker value={prefs.interests} onChange={(interests) => setPrefs({ interests })} />
          </section>

          <section>
            <h3 className="kicker mb-3 text-foreground-muted" style={{ fontSize: "0.72rem" }}>{t("theme")}</h3>
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
            <h3 className="kicker mb-3 text-foreground-muted" style={{ fontSize: "0.72rem" }}>{t("language")}</h3>
            <Segmented
              value={locale}
              onChange={(next) => router.replace(pathname, { locale: next })}
              options={routing.locales.map((l) => ({ value: l, label: l === "fr" ? "Français" : "English" }))}
            />
          </section>
        </div>
      </div>
    </dialog>
  );
}
