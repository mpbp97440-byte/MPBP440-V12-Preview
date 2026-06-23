/* MPBP440 V6.3.2 — Profils artistes corrigés */
(function(){
  function hideOldDoubleSortie(){
    const badWords = ["double sortie","double sorti"];
    document.querySelectorAll("section, article, .card, .release, .countdown, div").forEach(el => {
      if(el.closest(".mpbp-v631-root")) return;
      const text = (el.textContent || "").toLowerCase();
      if(badWords.some(w => text.includes(w))){
        el.classList.add("mpbp-v631-hidden-old");
      }
    });
  }

  function createRefonte(){
    document.querySelectorAll(".mpbp-v631-root").forEach(el => el.remove());

    const root = document.createElement("div");
    root.className = "mpbp-v631-root";
    root.innerHTML = `
      <section class="mpbp-v631-hero">
        <div class="mpbp-v631-top">
          <div class="mpbp-v631-logo-card">
            <img src="/assets/brand/mpbp440-official-logo.webp?v=6.3.2" alt="Logo officiel MPBP440">
          </div>
          <div class="mpbp-v631-title">
            <p>Portail musical officiel</p>
            <h1>MPBP 440 Corp.</h1>
            <strong>Label indépendant — Sparetdee Simon • Juste Une Plume</strong>
            <div class="mpbp-v631-artists">
              <a class="mpbp-v631-artist-card" href="/artistes/sparetdee-simon.html">
                <img src="/assets/artists/sparetdee-simon-profile.webp?v=6.3.2" alt="Sparetdee Simon">
                <div><h3>Sparetdee Simon</h3><p>Rap conscient • Roots • Vibration</p></div>
              </a>
              <a class="mpbp-v631-artist-card" href="/artistes/juste-une-plume.html">
                <img src="/assets/artists/juste-une-plume-profile.webp?v=6.3.2" alt="Juste Une Plume">
                <div><h3>Juste Une Plume</h3><p>Écriture • émotion • plume symbolique</p></div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="mpbp-v631-section">
        <p>Comptes à rebours officiels</p>
        <h2>Prochaines sorties</h2>
        <div class="mpbp-v631-grid">
          <article class="mpbp-v631-card">
            <img src="/assets/covers/reves-et-cauchemards.webp?v=6.3.2" alt="Rêves et Cauchemards">
            <div class="mpbp-v631-content">
              <h3>Rêves et Cauchemards</h3>
              <p>Sparetdee Simon — sortie officielle prévue le <strong>24/06/2026</strong>.</p>
              <a class="mpbp-v631-btn" href="/music/index.html">Voir dans Music Hub</a>
            </div>
          </article>
          <article class="mpbp-v631-card">
            <div class="mpbp-v631-content">
              <h3>Le Système</h3>
              <p>Sparetdee Simon — sortie officielle prévue le <strong>27/06/2026</strong>.</p>
              <a class="mpbp-v631-btn ghost" href="/music/index.html">Voir la sortie</a>
            </div>
          </article>
        </div>
      </section>

      <section class="mpbp-v631-section">
        <p>Bibliothèque officielle</p>
        <h2>Titres disponibles</h2>
        <div class="mpbp-v631-grid">
          <article class="mpbp-v631-card">
            <img src="/assets/covers/je-vous-pousse-tous.webp?v=6.3.2" alt="Je Vous Pousse Tous">
            <div class="mpbp-v631-content">
              <h3>Je Vous Pousse Tous</h3>
              <p>Disponible sur toutes les plateformes.</p>
              <a class="mpbp-v631-btn" href="/artistes/sparetdee-simon.html">Page artiste</a>
            </div>
          </article>
          <article class="mpbp-v631-card">
            <img src="/assets/covers/l-argent.webp?v=6.3.2" alt="L’Argent">
            <div class="mpbp-v631-content">
              <h3>L’Argent</h3>
              <p>Disponible sur toutes les plateformes.</p>
              <a class="mpbp-v631-btn" href="/artistes/sparetdee-simon.html">Page artiste</a>
            </div>
          </article>
        </div>
      </section>
    `;

    const main = document.querySelector("main");
    const header = document.querySelector("header");

    if(main){
      main.insertBefore(root, main.firstChild);
    }else if(header && header.parentNode){
      header.insertAdjacentElement("afterend", root);
    }else{
      document.body.insertBefore(root, document.body.firstChild);
    }

    hideOldDoubleSortie();
  }

  document.addEventListener("DOMContentLoaded", () => {
    createRefonte();
    hideOldDoubleSortie();
    setTimeout(hideOldDoubleSortie, 500);
    setTimeout(hideOldDoubleSortie, 1500);
  });
})();
