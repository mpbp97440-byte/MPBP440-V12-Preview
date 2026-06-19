const MPBP_CACHE = 'mpbp440-v4-0';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data/artists.json',
  './data/news.json',
  './data/featured.json'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(MPBP_CACHE).then(cache => cache.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== MPBP_CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
