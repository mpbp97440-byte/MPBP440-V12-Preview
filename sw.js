/* MPBP440 Service Worker — V6.3.2 */
const MPBP_CACHE="mpbp440-pwa-v6-3-2";
const CORE_ASSETS=[
 "/","/index.html","/offline.html","/manifest.webmanifest",
 "/refonte/refonte.css","/refonte/refonte.js",
 "/assets/artists/sparetdee-simon-profile.webp",
 "/assets/artists/juste-une-plume-profile.webp",
 "/data/artists.json"
];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(MPBP_CACHE).then(cache=>cache.addAll(CORE_ASSETS).catch(()=>{})))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==MPBP_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(fetch(event.request,{cache:"no-store"}).then(res=>{const copy=res.clone();caches.open(MPBP_CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});return res}).catch(()=>caches.match(event.request).then(c=>c||caches.match("/offline.html"))))});
