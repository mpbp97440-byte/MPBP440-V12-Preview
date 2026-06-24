let allTracks = [];

function safeText(value){
  return String(value || "");
}

function linksHtml(links={}){
  return Object.entries(links).map(([n,u]) => u ? `<a href="${u}" target="_blank" rel="noopener">${n}</a>` : "").join("");
}

async function loadData(){
  try{
    const data = await fetch("data.json?v=3.2.17-verif-complete", {cache:"no-store"}).then(r=>r.json());

    const f = data.featured;
    const featuredCard = document.getElementById("featuredCard");
    if(f && featuredCard){
      featuredCard.innerHTML = `
        <img src="${f.cover}" alt="${f.title}">
        <div>
          <span class="status-pill">${f.status || "Sortie officielle"}</span>
          <h3>${f.title}</h3>
          <p class="sup">${f.date || ""}</p>
          <p>${f.description || ""}</p>
          <div class="platforms">${linksHtml(f.links || data.socials || {})}</div>
        </div>`;
    }

    const upcomingGrid = document.getElementById("upcomingGrid");
    if(upcomingGrid){
      upcomingGrid.innerHTML = (data.upcoming || []).map((x,i)=>`
        <article class="time-card">
          <img src="${x.cover}" alt="${x.title}">
          <div class="time-body">
            <p class="sup">${x.artist || "MPBP 440"} • Étape ${i+1}</p>
            <h3>${x.title}</h3>
            <p><strong>${x.date || ""}</strong></p>
            <p>${x.description || ""}</p>
          </div>
        </article>`).join("");
    }

    const eventsGrid = document.getElementById("eventsGrid");
    if(eventsGrid){
      eventsGrid.innerHTML = (data.events || []).map(e=>`
        <article class="event-card panel">
          <img src="${e.cover}" alt="${e.title}">
          <div>
            <p class="sup">${e.date || ""}${e.time ? " • " + e.time : ""}</p>
            <h3>${e.title}</h3>
            <p><strong>${e.place || ""}</strong></p>
            <p>${e.description || ""}</p>
            <a class="btn primary" href="${e.url || "#"}">${e.buttonText || "Voir l’évènement"}</a>
          </div>
        </article>`).join("");
    }

    allTracks = (data.tracks || []).map(t => ({...t, links: t.links || data.socials || {}}));
    renderTracks(allTracks);

    const videoList = document.getElementById("videoList");
    if(videoList){
      videoList.innerHTML = (data.videos || []).map(v=>`
        <div>
          <div class="video-frame">
            <iframe src="https://www.youtube.com/embed/${v.youtubeId}" title="${v.title}" allowfullscreen></iframe>
          </div>
          <div class="platforms"><a href="${v.url}" target="_blank" rel="noopener">${v.title}</a></div>
        </div>`).join("");
    }

    const galleryGrid = document.getElementById("galleryGrid");
    if(galleryGrid && data.gallery){
      galleryGrid.innerHTML = data.gallery.map(item => `
        <article class="galleryCard">
          <img src="${item.image}" alt="${item.title}">
          <div class="galleryInfo"><h3>${item.title}</h3><p>${item.description || ""}</p></div>
        </article>`).join("");
    }

    const officialLinks = document.getElementById("officialLinks");
    if(officialLinks){
      officialLinks.innerHTML = Object.entries(data.socials || {}).map(([n,u])=>`<a class="link-card" href="${u}" target="_blank" rel="noopener">${n}</a>`).join("");
    }

    const searchInput = document.getElementById("searchInput");
    if(searchInput){
      searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = allTracks.filter(t =>
          safeText(t.title).toLowerCase().includes(q) ||
          safeText(t.artist).toLowerCase().includes(q) ||
          safeText(t.description).toLowerCase().includes(q)
        );
        renderTracks(filtered);
      });
    }
  }catch(err){
    console.warn("Chargement data.json impossible, affichage statique conservé.", err);
  }
}

function renderTracks(tracks){
  const tracksEl = document.getElementById("tracks");
  if(!tracksEl) return;
  tracksEl.innerHTML = tracks.map(t=>`
    <article class="card">
      <img src="${t.cover}" alt="${t.title}">
      <div class="card-body">
        ${t.year ? `<p class="sup">${t.artist ? t.artist + " • " : ""}${t.year}</p>` : ""}
        <h3>${t.title}</h3>
        <p>${t.description || ""}</p>
        <div class="platforms">${linksHtml(t.links || {})}</div>
      </div>
    </article>`).join("");
}

function setupAllMiniCountdowns(){
  document.querySelectorAll(".miniCountdown[data-date], .countdown[data-date]").forEach(box => {
    const target = new Date(box.dataset.date).getTime();
    const values = box.querySelectorAll("strong");
    function tick(){
      if(!target || isNaN(target)) return;
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000); diff %= 60000;
      const s = Math.floor(diff / 1000);
      [d,h,m,s].forEach((v,i)=>{ if(values[i]) values[i].textContent = String(v).padStart(2,"0"); });
    }
    tick();
    setInterval(tick, 1000);
  });
}

document.getElementById("menuBtn")?.addEventListener("click",()=>document.getElementById("navlinks").classList.toggle("open"));
window.addEventListener("scroll",()=>{const b=document.getElementById("topBtn"); if(b)b.style.display=scrollY>500?"block":"none"});
document.getElementById("topBtn")?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

document.addEventListener("DOMContentLoaded", () => {
  setupAllMiniCountdowns();
  loadData();
});


// V3.2.9 — MPBP440 Media Center controls
function initMPBPTVControls(){
  const player = document.getElementById("mpbpTvPlayer");
  document.querySelectorAll("#mpbpTvList button[data-yt]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-yt");
      if(player && id){ player.src = "https://www.youtube.com/embed/" + id; }
    });
  });
}

async function loadLiveStatus(){
  try{
    const res = await fetch("live_status.json?v=" + Date.now(), {cache:"no-store"});
    if(!res.ok) return;
    const live = await res.json();
    const card = document.getElementById("livePortalCard");
    const badge = document.getElementById("liveBadge");
    const title = document.getElementById("liveTitle");
    const text = document.getElementById("liveText");
    const button = document.getElementById("liveButton");
    if(!card || !badge || !title || !text || !button) return;
    if(live.is_live){
      card.classList.add("is-live");
      badge.textContent = "🔴 EN DIRECT MAINTENANT";
      title.textContent = live.title || "Live TikTok MPBP440";
      text.textContent = live.message_live || "Le live officiel est en cours.";
      button.textContent = "Rejoindre le live TikTok";
      button.href = live.url || live.fallback_url || "https://www.tiktok.com/@simonsparet";
    }else{
      card.classList.remove("is-live");
      badge.textContent = "🔴 LIVE / ÉVÈNEMENT";
      title.textContent = live.title || "Live TikTok — Fête de la musique";
      text.innerHTML = "<strong>21/06/2026 • 21h00</strong><br>Présentation des nouveautés Sparetdee Simon et Juste Une Plume.";
      button.textContent = "Voir le TikTok officiel";
      button.href = live.fallback_url || live.url || "https://www.tiktok.com/@simonsparet";
    }
  }catch(e){ console.warn("Statut live indisponible", e); }
}

document.addEventListener("DOMContentLoaded", ()=>{
  initMPBPTVControls();
  loadLiveStatus();
  setInterval(loadLiveStatus, 30000);
});

// V6.4.6 public cleanup
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll('a[href*="admin-pro"],a[href*="admin-440-mpbp-corp"],[href*="admin-pro"],[href*="admin-440-mpbp-corp"]').forEach(el=>el.remove());
});


// MPBP440 V6.4.7 — navigation et clics stabilisés
(function(){
  function cleanText(s){return String(s||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
  function fixMenu(){
    const btn=document.getElementById("menuBtn");
    const nav=document.getElementById("mainNav")||document.querySelector(".topbar nav");
    if(btn&&nav&&!btn.dataset.v647){
      btn.dataset.v647="1";
      btn.addEventListener("click",()=>nav.classList.toggle("open"));
      nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
    }
  }
  function normalizeLinks(){
    const routes=[
      {keys:["accueil"],url:"/#home"},
      {keys:["label"],url:"/#label"},
      {keys:["sortie"],url:"/#sortie"},
      {keys:["a venir","à venir"],url:"/#avenir"},
      {keys:["evenements","événements","evenement","évènement"],url:"/#events"},
      {keys:["morceaux","music hub"],url:"/#morceaux"},
      {keys:["mpbp tv"],url:"/mpbp-tv/index.html"},
      {keys:["radio"],url:"/#radio"},
      {keys:["actus","actualites","actualités"],url:"/#actus"},
      {keys:["artistes"],url:"/#artistes"},
      {keys:["recherche"],url:"/#morceaux"},
      {keys:["clips"],url:"/#clips"},
      {keys:["galerie"],url:"/#galerie"},
      {keys:["liens"],url:"/#liens"},
      {keys:["application"],url:"/#application"},
      {keys:["mon espace","espace"],url:"/members/index.html"},
      {keys:["telechargements","téléchargements"],url:"/telechargements/index.html"}
    ];
    document.querySelectorAll(".topbar nav a,#mainNav a").forEach(a=>{
      const t=cleanText(a.textContent);
      for(const r of routes){if(r.keys.some(k=>t===cleanText(k))){a.setAttribute("href",r.url);break;}}
    });
    const tv=Array.from(document.querySelectorAll(".topbar nav a,#mainNav a")).filter(a=>cleanText(a.textContent)==="mpbp tv");
    tv.forEach((a,i)=>{a.href="/mpbp-tv/index.html";if(i>0)a.remove();});
  }
  function cleanPublicText(){
    const badPatterns=[/git/i,/assets/i,/mp4/i,/zone/i,/chemin/i,/compress/i,/html/i,/dev/i,/technique/i];
    document.querySelectorAll("p,div,article,section,li").forEach(el=>{
      if(el.children.length>8)return;
      const txt=el.textContent||"";
      if(badPatterns.filter(rx=>rx.test(txt)).length>=2)el.innerHTML="<p>Des contenus exclusifs seront ajoutés progressivement dans cet espace officiel MPBP440.</p>";
    });
  }
  function removeAdmin(){document.querySelectorAll('a[href*="admin-pro"],a[href*="admin-440-mpbp-corp"],[href*="admin-pro"],[href*="admin-440-mpbp-corp"]').forEach(el=>el.remove());}
  function fixBrokenImages(){document.querySelectorAll("img").forEach(img=>{if(!img.dataset.v647){img.dataset.v647="1";img.addEventListener("error",function(){this.src="/assets/brand/mpbp440-official-logo.jpg";});}});}
  function apply(){fixMenu();normalizeLinks();cleanPublicText();removeAdmin();fixBrokenImages();}
  document.addEventListener("DOMContentLoaded",()=>{apply();setTimeout(apply,500);setTimeout(apply,1500);});
})();
