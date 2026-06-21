/* MPBP440 V6.0.3 — Mini Player safe
   Désactivé sur mobile/iPhone pour éviter les zones vides.
*/
(function(){
  function isMobileLike(){
    return window.innerWidth < 900 || /iphone|ipad|ipod|android/i.test(navigator.userAgent);
  }

  function renderPlayer(){
    if(isMobileLike()){
      document.querySelectorAll(".mpbp-mini-player").forEach(el => el.remove());
      return;
    }

    let el = document.querySelector(".mpbp-mini-player");
    if(!el){
      el = document.createElement("div");
      el.className = "mpbp-mini-player";
      document.body.appendChild(el);
    }

    el.innerHTML = `
      <div class="mpbp-player-icon">🎵</div>
      <a href="/music/index.html">
        <div class="mpbp-player-title">MPBP440 Radio</div>
        <div class="mpbp-player-sub">Portail musical officiel</div>
      </a>
      <div class="mpbp-player-controls"><button title="Ouvrir">▶</button></div>
    `;
    el.querySelector("button").onclick = () => { location.href = "/music/index.html"; };
  }

  document.addEventListener("DOMContentLoaded", renderPlayer);
  window.addEventListener("resize", renderPlayer);
})();
