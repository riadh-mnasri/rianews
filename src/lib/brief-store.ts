// © 2026 Riadh MNASRI
"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { CategoryId } from "@/data/categories";
import type { Brief } from "@/lib/types";

export type BriefState = {
  brief: Brief | null;
  loading: boolean;
  error: boolean;
};

// Store des derniers briefs reçus, persistés en localStorage pour une lecture
// instantanée à l'ouverture et hors ligne.
const memory = new Map<string, Brief | null>();
const listeners = new Set<() => void>();
let version = 0;

const storageKey = (key: string) => `rianews-brief-${key}`;

function getSaved(key: string): Brief | null {
  if (!memory.has(key)) {
    try {
      const raw = window.localStorage.getItem(storageKey(key));
      memory.set(key, raw ? (JSON.parse(raw) as Brief) : null);
    } catch {
      memory.set(key, null);
    }
  }
  return memory.get(key) ?? null;
}

function save(key: string, brief: Brief) {
  memory.set(key, brief);
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(brief));
  } catch {}
  version++;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type Status = { nonce: number; error: boolean };

export function useBriefs(categories: CategoryId[], locale: string) {
  const hydrated = useSyncExternalStore(subscribe, () => version + 1, () => 0) > 0;
  const [nonce, setNonce] = useState(0);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const catsKey = categories.join(",");

  useEffect(() => {
    let cancelled = false;
    const cats = catsKey ? catsKey.split(",") : [];
    for (const cat of cats) {
      const key = `${locale}-${cat}`;
      fetch(`/api/brief?cat=${cat}&locale=${locale}`, { cache: nonce ? "reload" : "default" })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<Brief>;
        })
        .then((brief) => {
          if (cancelled) return;
          save(key, brief);
          setStatus((prev) => ({ ...prev, [key]: { nonce, error: false } }));
        })
        .catch(() => {
          if (!cancelled) setStatus((prev) => ({ ...prev, [key]: { nonce, error: true } }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [catsKey, locale, nonce]);

  const states: Partial<Record<CategoryId, BriefState>> = {};
  for (const cat of categories) {
    const key = `${locale}-${cat}`;
    const s = status[key];
    const done = s?.nonce === nonce;
    states[cat] = {
      brief: hydrated ? getSaved(key) : null,
      loading: !done,
      error: done && s.error,
    };
  }

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  return { states, refresh };
}
