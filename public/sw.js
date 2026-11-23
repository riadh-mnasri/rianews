// © 2026 Riadh MNASRI
// Service worker minimal : rend l'app installable et lisible hors ligne
// (dernière version des pages et des briefs gardée en cache).
const CACHE = "rianews-v1";
const SHELL = ["/fr", "/en"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

function fallbackPage(url) {
  const lang = url.pathname.startsWith("/en") ? "/en" : url.pathname.startsWith("/fr") ? "/fr" : null;
  if (lang) return lang;
  return (self.navigator?.language || "fr").startsWith("fr") ? "/fr" : "/en";
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Fichiers statiques versionnés : cache d'abord.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Pages et API : réseau d'abord, cache en secours.
  if (request.mode === "navigate" || url.pathname.startsWith("/api/brief")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (hit) =>
              hit ||
              (request.mode === "navigate"
                ? caches.match(fallbackPage(url))
                : new Response("{}", { status: 503, headers: { "Content-Type": "application/json" } })),
          ),
        ),
    );
  }
});
