/* MPBP440 Service Worker — V6.4.1 */
const MPBP_CACHE="mpbp440-pwa-v6-4-1";
const CORE_ASSETS=["/","/index.html","/dashboard/","/music/index.html","/music/music-hub.js","/data/music-catalog-v64.json","/data/dashboard-app.json","/refonte/refonte.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(MPBP_CACHE).then(c=>c.addAll(CORE_ASSETS).catch(()=>{})))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==MPBP_CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{let cp=r.clone();caches.open(MPBP_CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(c=>c||caches.match("/offline.html"))))});