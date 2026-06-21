/* MPBP440 Service Worker — V6.1.1 Dashboard Home */
const MPBP_CACHE = "mpbp440-pwa-v6-1-1";
const CORE_ASSETS = [
  "/","/index.html","/offline.html","/manifest.webmanifest",
  "/dashboard/","/dashboard/index.html","/dashboard/dashboard.css","/dashboard/dashboard.js",
  "/data/dashboard-app.json","/app/offline-manager.js",
  "/application/index.html","/music/index.html","/live/index.html","/galerie/index.html","/mon-espace/index.html"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(MPBP_CACHE).then(cache => cache.addAll(CORE_ASSETS).catch(()=>{})));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== MPBP_CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("message", event => {
  if(event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request,{cache:"no-store"}).then(res => {
      const copy=res.clone();
      caches.open(MPBP_CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(event.request).then(c=>c||caches.match("/offline.html")))
  );
});