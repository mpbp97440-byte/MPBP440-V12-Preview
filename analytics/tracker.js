/* MPBP440 Analytics Tracker — V5.4 */
(function(){
  const NS = "mpbp440-official";
  const LOCAL_TOTAL = "mpbp440_local_pageviews";
  const LOCAL_UNIQUE = "mpbp440_unique_visitor_id";
  const LOCAL_INSTALL = "mpbp440_pwa_install_count";

  function slugPath(path){
    let p = (path || "/MPBP440-V12-Preview/").replace(/^\//,"").replace(/\/$/,"");
    if(!p) p = "home";
    return p.replace(/[^a-zA-Z0-9]+/g,"_").toLowerCase();
  }

  function localHit(){
    const total = parseInt(localStorage.getItem(LOCAL_TOTAL) || "0", 10) + 1;
    localStorage.setItem(LOCAL_TOTAL, String(total));
    if(!localStorage.getItem(LOCAL_UNIQUE)){
      localStorage.setItem(LOCAL_UNIQUE, "v_" + Date.now() + "_" + Math.random().toString(36).slice(2));
    }
  }

  async function countApiHit(key){
    try{
      await fetch("https://api.countapi.xyz/hit/" + NS + "/MPBP440-V12-Preview/" + encodeURIComponent(key), {cache:"no-store", mode:"cors"});
    }catch(e){}
  }

  async function track(){
    localHit();
    const pathKey = "page_" + slugPath(location.pathname);
    countApiHit("total_views");
    countApiHit(pathKey);

    const device = /android|iphone|ipad|ipod/i.test(navigator.userAgent) ? "mobile" : "desktop";
    countApiHit("device_" + device);

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if(isStandalone) countApiHit("pwa_open");
  }

  window.addEventListener("appinstalled", () => {
    const n = parseInt(localStorage.getItem(LOCAL_INSTALL) || "0", 10) + 1;
    localStorage.setItem(LOCAL_INSTALL, String(n));
    countApiHit("pwa_installs");
  });

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", track);
  }else{
    track();
  }
})();
