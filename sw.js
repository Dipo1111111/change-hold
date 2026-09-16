const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./assets/fonts/fonts.css",
  "./assets/fonts/archivo-latin.woff2",
  "./assets/fonts/caveat-latin.woff2",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./js/db.js",
  "./js/state.js",
  "./js/ui.js",
  "./js/setup.js",
  "./js/dashboard.js",
  "./js/log.js",
  "./js/shop.js",
  "./js/oneoff.js",
  "./js/manage.js",
  "./js/geo.js",
  "./js/app.js"
];

const CACHE = "changehold-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      });
    }).catch(() => caches.match("./index.html"))
  );
});