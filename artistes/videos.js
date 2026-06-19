
function ytId(url){
  if(!url) return "";
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : "";
}
async function loadArtistVideos(){
  const box = document.getElementById("artistVideos");
  const artistName = document.body.dataset.artist || "";
  if(!box) return;
  try{
    const r = await fetch("../data/videos.json?v=4.4",{cache:"no-store"});
    const data = await r.json();
    const list = data.filter(v => (v.artist||"").toLowerCase() === artistName.toLowerCase());

    box.innerHTML = list.length ? list.map(v => {
      const id = ytId(v.youtube);
      const thumb = id
        ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        : "";
      return `
      <article class="video-card">
        ${thumb
          ? `<img src="${thumb}" alt="${v.title}">`
          : `<div class="video-placeholder">🎬</div>`}
        <div>
          <p class="sup">Clip officiel</p>
          <h3>${v.title || ""}</h3>
          <p>${v.description || ""}</p>
          ${v.youtube
            ? `<a class="btn ghost small" href="${v.youtube}" target="_blank" rel="noopener">Voir la vidéo</a>`
            : `<span class="btn ghost small">Bientôt disponible</span>`}
        </div>
      </article>`;
    }).join("") : "<p>Aucun clip disponible pour le moment.</p>";
  }catch(e){
    box.innerHTML = "<p>Les vidéos seront disponibles prochainement.</p>";
  }
}
document.addEventListener("DOMContentLoaded", loadArtistVideos);
