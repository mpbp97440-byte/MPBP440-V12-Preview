/* MPBP440 V6.4.1 — Fix public admin visibility */
(function(){
  function hideAdminLinks(){
    document.querySelectorAll('a[href*="admin-pro"],a[href*="admin-440-mpbp-corp"],[href*="admin-pro"],[href*="admin-440-mpbp-corp"]').forEach(el=>{
      el.remove();
    });
    document.querySelectorAll("a,button,li,div,span").forEach(el=>{
      const t=(el.textContent||"").trim().toLowerCase();
      if(t==="admin pro" || t==="admin" || t.includes("admin pro")){
        el.remove();
      }
    });
  }
  function injectAdminHideCss(){
    if(document.getElementById("mpbp-admin-hide-css")) return;
    const s=document.createElement("style");
    s.id="mpbp-admin-hide-css";
    s.textContent='a[href*="admin-pro"],a[href*="admin-440-mpbp-corp"],[href*="admin-pro"],[href*="admin-440-mpbp-corp"]{display:none!important;visibility:hidden!important;pointer-events:none!important}';
    document.head.appendChild(s);
  }
  document.addEventListener("DOMContentLoaded",()=>{
    injectAdminHideCss();
    hideAdminLinks();
    setTimeout(hideAdminLinks,500);
    setTimeout(hideAdminLinks,1500);
    new MutationObserver(hideAdminLinks).observe(document.body,{childList:true,subtree:true});
  });
})();
