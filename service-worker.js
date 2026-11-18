/* HVAC PT Companion offline support. Keep root and Android builds separate. */
const CACHE_NAME = 'bcshinstudio-ptcompanion-offline-2026-11-v2';
const CACHE_PREFIX = 'bcshinstudio-ptcompanion-offline-';
const OFFLINE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./data/refrigerants.json",
  "./data/sources.json",
  "./data/R12.csv",
  "./data/R123.csv",
  "./data/R1233zdE.csv",
  "./data/R1234yf.csv",
  "./data/R1234zeE.csv",
  "./data/R125.csv",
  "./data/R134a.csv",
  "./data/R143a.csv",
  "./data/R152a.csv",
  "./data/R170.csv",
  "./data/R22.csv",
  "./data/R227ea.csv",
  "./data/R23.csv",
  "./data/R236fa.csv",
  "./data/R245fa.csv",
  "./data/R290.csv",
  "./data/R32.csv",
  "./data/R404A.csv",
  "./data/R407A.csv",
  "./data/R407C.csv",
  "./data/R407F.csv",
  "./data/R410A.csv",
  "./data/R422D.csv",
  "./data/R448A.csv",
  "./data/R449A.csv",
  "./data/R452A.csv",
  "./data/R454B.csv",
  "./data/R454C.csv",
  "./data/R502.csv",
  "./data/R507A.csv",
  "./data/R513A.csv",
  "./data/R600a.csv",
  "./data/R717.csv",
  "./data/R744.csv",
  "./assets/pressure-gauge.svg",
  "./assets/refrigerant.svg",
  "./assets/saturation.svg",
  "./assets/snowflake.svg",
  "./assets/thermometer.svg",
  "./icons/pt-192.png",
  "./icons/pt-512.png",
  "./icons/apple-touch-icon.png"
];
const SCOPE_URL = new URL(self.registration.scope);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Atomic installation: a missing file prevents a falsely successful offline install.
    await cache.addAll(OFFLINE_FILES.map(file => new Request(new URL(file, SCOPE_URL), {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
                           .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Do not interfere with other GitHub Pages projects or external links.
  if (request.method !== 'GET' || url.origin !== SCOPE_URL.origin ||
      !url.pathname.startsWith(SCOPE_URL.pathname)) return;

  if (request.mode === 'navigate') {
    // Fresh website when online; cached page when offline.
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(new URL('./', SCOPE_URL), response.clone());
        }
        return response;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request, {ignoreSearch: true})
                    || await cache.match(new URL('./', SCOPE_URL));
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  // Includes JSON/CSV fetched with {cache:'no-store'} by app.js:
  // the service worker can still serve its own Cache Storage responses.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, {ignoreSearch:true});
    if (cached) return cached;
    return fetch(request);
  })());
});
