// AllSorted prototype — minimal service worker
// Caches the app shell so the installed app works offline as a fallback.
// Network-first: every load fetches the latest from GitHub Pages first and
// refreshes the cache with it, so pushes show up immediately without needing
// to bump this name, clear site data, or reinstall. Cache is only used when
// the network is unavailable (offline).
const CACHE_NAME = 'allsorted-proto-v2';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './data/recipes.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './favicon-32.png',
  './favicon-48.png',
  './prototype-logo.svg',
  './header-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try to fetch the latest from the network and refresh
// the cache with whatever comes back. Only fall back to the cache (and finally
// to the cached index.html for navigations) when the network is unreachable —
// i.e. offline. This is what makes "push to GitHub Pages → shows up on phone"
// work without any extra steps.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Subresources (app.js, recipes.js, images…) are fetched with cache: 'reload' so the
  // network request bypasses the browser HTTP cache entirely — edits always show up on
  // reload with no manual cache-busting. Navigation requests can't be reconstructed, so
  // those pass through unchanged (the browser revalidates the document on reload anyway).
  const req = event.request.mode === 'navigate'
    ? event.request
    : new Request(event.request, { cache: 'reload' });

  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
