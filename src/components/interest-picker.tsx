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
    <div className="grid gap-2.5">
      {CATEGORY_IDS.map((id) => {
        const active = value.includes(id);
        const meta = CATEGORY_META[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== id) : [...value, id])}
            className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
              active ? "border-transparent bg-surface shadow-card" : "border-border bg-transparent opacity-70"
            }`}
            style={active ? { boxShadow: `inset 0 0 0 2px ${meta.color}` } : undefined}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 13%, transparent)` }}
            >
              <meta.icon className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.05rem] font-semibold">{tc(id)}</span>
              <span className="block text-sm text-foreground-muted">{th(id)}</span>
            </span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                active ? "border-transparent text-white" : "border-border"
              }`}
              style={active ? { background: meta.color } : undefined}
            >
              {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
