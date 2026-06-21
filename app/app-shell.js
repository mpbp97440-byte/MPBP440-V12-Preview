/* MPBP440 V6.0.3 — App Shell safe
   Désactive la barre native sur mobile/iPhone pour éviter l'écran noir.
*/
(function(){
  const nav = [
    ["🏠","Accueil","/"],
    ["🎵","Music","/music/index.html"],
    ["🔴","Live","/live/index.html"],
    ["🖼️","Galerie","/galerie/index.html"],
    ["👤","Espace","/mon-espace/index.html"]
  ];

  function isMobileLike(){
    return window.innerWidth < 900 || /iphone|ipad|ipod|android/i.test(navigator.userAgent);
  }

  function removeShell(){
    document.querySelectorAll(".mpbp-native-shell,.mpbp-mini-player").forEach(el => el.remove());
    document.body.style.paddingBottom = "0px";
  }

  function createShell(){
    if(isMobileLike()){
      removeShell();
      return;
    }

    if(document.querySelector(".mpbp-native-shell")) return;

    const bar = document.createElement("nav");
    bar.className = "mpbp-native-shell";
    const current = location.pathname;

    bar.innerHTML = nav.map(([icon,label,url]) => {
      const active = (url === "/" && current === "/") || (url !== "/" && current.startsWith(url.replace("index.html","")));
      return `<a class="${active ? "active" : ""}" href="${url}"><span>${icon}</span>${label}</a>`;
    }).join("");

    document.body.appendChild(bar);
  }

  function toast(title, text, buttonText, cb){
    if(isMobileLike()) return;
    const old = document.querySelector(".mpbp-app-toast");
    if(old) old.remove();

    const el = document.createElement("div");
    el.className = "mpbp-app-toast";
    el.innerHTML = `<strong>${title}</strong><span>${text}</span>${buttonText ? `<button>${buttonText}</button>` : ""}`;
    document.body.appendChild(el);

    if(buttonText) el.querySelector("button").onclick = () => { if(cb) cb(); el.remove(); };
    setTimeout(()=>{ if(document.body.contains(el)) el.remove(); }, 9000);
  }

  function registerSW(){
    if(!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(reg => {
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if(!nw) return;
        nw.addEventListener("statechange", () => {
          if(nw.state === "installed" && navigator.serviceWorker.controller){
            toast("Mise à jour disponible", "Une nouvelle version de MPBP440 est prête.", "Actualiser", () => location.reload());
          }
        });
      });
    }).catch(()=>{});
  }

  function onlineStatus(){
    window.addEventListener("offline", () => toast("Mode hors connexion", "MPBP440 continue en mode cache partiel.", "OK"));
    window.addEventListener("online", () => toast("Connexion rétablie", "Les contenus peuvent être mis à jour.", "OK"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("mpbp-app-ready");
    createShell();
    registerSW();
    onlineStatus();
  });

  window.addEventListener("resize", () => {
    if(isMobileLike()) removeShell();
  });
})();
