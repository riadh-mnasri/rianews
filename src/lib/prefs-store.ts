// © 2026 Riadh MNASRI
"use client";

import { useSyncExternalStore } from "react";
import { CATEGORY_IDS, isCategoryId, type CategoryId } from "@/data/categories";

export type ThemePref = "light" | "dark" | "system";

export type Prefs = {
  interests: CategoryId[];
  textSize: number; // index dans TEXT_SIZES
  theme: ThemePref;
  onboarded: boolean;
};

export const TEXT_SIZES = [17, 19, 21, 23, 26];
const STORAGE_KEY = "lessentiel-prefs";
const EVENT = "lessentiel-prefs-change";

const DEFAULT_PREFS: Prefs = {
  interests: [...CATEGORY_IDS],
  textSize: 1,
  theme: "system",
  onboarded: false,
};

let cache: Prefs | null = null;

function read(): Prefs {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
    cache = {
      ...DEFAULT_PREFS,
      ...parsed,
      interests: Array.isArray(parsed.interests)
        ? parsed.interests.filter(isCategoryId)
        : DEFAULT_PREFS.interests,
    };
  } catch {
    cache = DEFAULT_PREFS;
  }
  return cache;
}

export function applyPrefsToDocument(prefs: Prefs) {
  const root = document.documentElement;
  const dark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.style.setProperty("--reading-size", `${TEXT_SIZES[prefs.textSize] ?? 19}px`);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#15120e" : "#f8f4ec");
}

export function setPrefs(update: Partial<Prefs>) {
  const next = { ...read(), ...update };
  // Garde l'ordre canonique des rubriques.
  next.interests = CATEGORY_IDS.filter((id) => next.interests.includes(id));
  cache = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyPrefsToDocument(next);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMedia = () => {
    applyPrefsToDocument(read());
    callback();
  };
  media.addEventListener("change", onMedia);
  return () => {
    window.removeEventListener(EVENT, callback);
    media.removeEventListener("change", onMedia);
  };
}

const SERVER_PREFS: Prefs = { ...DEFAULT_PREFS, onboarded: true };

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, read, () => SERVER_PREFS);
}

// Script inline exécuté avant l'hydratation pour éviter le flash de thème et de taille.
export const PREFS_INIT_SCRIPT = `
(function () {
  try {
    var p = JSON.parse(localStorage.getItem("${STORAGE_KEY}") || "{}");
    var sizes = ${JSON.stringify(TEXT_SIZES)};
    var t = p.theme || "system";
    var dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
    var s = sizes[p.textSize == null ? 1 : p.textSize] || 19;
    document.documentElement.style.setProperty("--reading-size", s + "px");
  } catch (e) {}
})();
`;
