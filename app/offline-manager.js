/* MPBP440 V6.1.1 — Offline Manager */
(function(){
  const ESSENTIALS = [
    "/MPBP440-V12-Preview/", "/MPBP440-V12-Preview/index.html", "/MPBP440-V12-Preview/dashboard/", "/MPBP440-V12-Preview/dashboard/index.html",
    "/MPBP440-V12-Preview/application/index.html", "/MPBP440-V12-Preview/music/index.html", "/MPBP440-V12-Preview/live/index.html",
    "/MPBP440-V12-Preview/galerie/index.html", "/MPBP440-V12-Preview/mon-espace/index.html", "/MPBP440-V12-Preview/telechargements/index.html"
  ];
  window.mpbpCacheEssentials = async function(){
    if(!("caches" in window)) return false;
    const cache = await caches.open("mpbp440-user-cache-v6-1-1");
    await cache.addAll(ESSENTIALS).catch(()=>{});
    return true;
  };
})();