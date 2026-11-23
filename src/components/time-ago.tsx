// © 2026 Riadh MNASRI
"use client";

import { useTranslations } from "next-intl";

export function useTimeAgo() {
  const t = useTranslations("time");
  return (iso: string | null) => {
    if (!iso) return null;
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const min = Math.floor(diff / 60000);
    if (min < 2) return t("justNow");
    if (min < 60) return t("minutes", { n: min });
    const h = Math.floor(min / 60);
    if (h < 24) return t("hours", { n: h });
    return t("days", { n: Math.floor(h / 24) });
  };
}
