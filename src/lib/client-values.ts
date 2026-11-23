// © 2026 Riadh MNASRI
"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Valeur calculée uniquement côté navigateur (heure locale, etc.), `fallback` au rendu serveur. */
export function useClientValue<T extends string | number | boolean>(compute: () => T, fallback: T): T {
  return useSyncExternalStore(noop, compute, () => fallback);
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}
