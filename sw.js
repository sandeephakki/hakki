// Hakki hub — service worker. Cache-first for the app shell, network-first
// for the Blogger feed script (blog.js appends it directly, not via SW,
// so nothing to special-case here). Single-page app now — one HTML shell,
// hash routing handles the rest. Bump CACHE on every deploy.
const CACHE = 'hakki-in-v6';
const SHELL = [
  './', 'index.html',
  'css/theme.css', 'js/env-config.js', 'js/app.js', 'js/router.js', 'js/blog.js', 'js/readme.js', 'js/apps-auto.js', 'js/speaking-auto.js',
  'manifest.json', 'icon-192.png', 'icon-512.png',
  'assets/hakki_bird.svg', 'assets/icons/avatar.jpg',
  'assets/icons/apple-touch-icon.png', 'assets/icons/favicon-16.png',
  'assets/icons/favicon-32.png', 'assets/icons/favicon-48.png',
  'assets/icons/spendna-icon.png', 'assets/icons/studin-icon.png',
  'assets/speaking/seminar-1.jpg', 'assets/speaking/seminar-2.jpg', 'assets/speaking/seminar-3.jpg',
  'assets/speaking/seminar-4.jpg', 'assets/speaking/seminar-5.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // never intercept the Blogger feed / QR API calls
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => cached))
  );
});
