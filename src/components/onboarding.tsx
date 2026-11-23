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
        <div className="masthead-rule pt-10 pb-3">
          <Logo size="lg" />
        </div>
        <h1 className="serif mt-8 text-[2.1rem] leading-tight font-semibold tracking-[-0.02em]">{t("title")}</h1>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-foreground-muted">{t("text")}</p>
        <div className="mt-7">
          <InterestPicker value={interests} onChange={setInterests} />
        </div>
        <div className="pb-safe mt-auto pt-8">
          <button
            type="button"
            disabled={interests.length === 0}
            onClick={() => setPrefs({ interests, onboarded: true })}
            className="w-full bg-foreground py-4 text-[1.02rem] font-semibold text-background transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-35"
          >
            {interests.length === 0 ? t("pickOne") : t("start")}
          </button>
        </div>
      </div>
    </div>
  );
}
