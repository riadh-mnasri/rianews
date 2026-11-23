// © 2026 Riadh MNASRI
"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { CATEGORY_META } from "@/data/category-meta";

export function InterestPicker({
  value,
  onChange,
}: {
  value: CategoryId[];
  onChange: (next: CategoryId[]) => void;
}) {
  const tc = useTranslations("categories");
  const th = useTranslations("categoryHints");

  return (
    <div className="divide-y divide-border border-y border-border">
      {CATEGORY_IDS.map((id) => {
        const active = value.includes(id);
        const meta = CATEGORY_META[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== id) : [...value, id])}
            className="flex w-full items-center gap-4 py-4 text-left transition-opacity active:opacity-70"
          >
            <meta.icon
              className="h-5 w-5 shrink-0 transition-opacity"
              style={{ color: meta.color, opacity: active ? 1 : 0.4 }}
              strokeWidth={1.75}
            />
            <span className={`min-w-0 flex-1 transition-opacity ${active ? "" : "opacity-55"}`}>
              <span className="serif block text-[1.2rem] leading-tight font-semibold">{tc(id)}</span>
              <span className="block text-[0.85rem] text-foreground-muted">{th(id)}</span>
            </span>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center border-[1.5px] transition-colors"
              style={
                active
                  ? { background: "var(--foreground)", borderColor: "var(--foreground)", color: "var(--background)" }
                  : { borderColor: "var(--border)" }
              }
            >
              {active && <Check className="h-4 w-4" strokeWidth={2.5} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
