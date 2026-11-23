// © 2026 Riadh MNASRI
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { InterestPicker } from "@/components/interest-picker";
import { setPrefs } from "@/lib/prefs-store";
import { Logo } from "@/components/logo";

export function Onboarding() {
  const t = useTranslations("onboarding");
  const [interests, setInterests] = useState<CategoryId[]>([...CATEGORY_IDS]);

  return (
    <div className="fade-in fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="pt-safe mx-auto flex min-h-full max-w-md flex-col px-6 pb-8">
        <div className="pt-10">
          <Logo size="lg" />
        </div>
        <h1 className="serif mt-8 text-[2rem] font-semibold leading-tight tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-foreground-muted">{t("text")}</p>
        <div className="mt-7">
          <InterestPicker value={interests} onChange={setInterests} />
        </div>
        <div className="pb-safe mt-auto pt-8">
          <button
            type="button"
            disabled={interests.length === 0}
            onClick={() => setPrefs({ interests, onboarded: true })}
            className="w-full rounded-2xl bg-accent py-4 text-[1.05rem] font-semibold text-accent-foreground shadow-card transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {interests.length === 0 ? t("pickOne") : t("start")}
          </button>
        </div>
      </div>
    </div>
  );
}
