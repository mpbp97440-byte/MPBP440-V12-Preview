async function loadData(){
  const res = await fetch("data.json");
  const data = await res.json();

  document.getElementById("year").textContent = new Date().getFullYear();

  const linksHtml = (links = {}) => Object.entries(links)
    .map(([name,url]) => url ? `<a href="${url}" target="_blank" rel="noopener">${name}</a>` : "")
    .join("");

  const f = data.featured;
  const featuredCard = document.getElementById("featuredCard");
  if (featuredCard && f) {
    featuredCard.innerHTML = `
      <img src="${f.cover}" alt="${f.title}">
      <div>
        <span class="status-pill">${f.status || "Sortie officielle"}</span>
        <h3>${f.title}</h3>
        <p class="eyebrow">${f.date || ""}</p>
        <p>${f.description || ""}</p>
        <div class="platforms">${linksHtml(f.links || data.socials)}</div>
      </div>
    `;
  }

  const upcomingGrid = document.getElementById("upcomingGrid");
  if (upcomingGrid && data.upcoming) {
    upcomingGrid.innerHTML = data.upcoming.map((item,i) => `
      <article class="time-card">
        <img src="${item.cover}" alt="${item.title}">
        <div class="time-body">
          <p class="eyebrow">Étape ${i+1}</p>
          <h3>${item.title}</h3>
          <p><strong>${item.date || ""}</strong></p>
          <p>${item.description || ""}</p>
        </div>
      </article>
    `).join("");
  }

  const eventsGrid = document.getElementById("eventsGrid");
  if (eventsGrid && data.events) {
    eventsGrid.innerHTML = data.events.map(event => `
      <article class="event-card glass">
        <img src="${event.cover}" alt="${event.title}">
        <div class="event-body">
          <p class="eyebrow">${event.date || ""}${event.time ? " • " + event.time : ""}</p>
          <h3>${event.title}</h3>
          <p><strong>${event.place || ""}</strong></p>
          <p>${event.description || ""}</p>
          <a class="btn primary" href="${event.url || "#"}" target="_blank" rel="noopener">${event.buttonText || "Voir l’évènement"}</a>
        </div>
      </article>
    `).join("");
  }

  const tracks = document.getElementById("tracks");
  if (tracks && data.tracks) {
    tracks.innerHTML = data.tracks.map(track => `
      <article class="card">
        <img src="${track.cover}" alt="${track.title}">
        <div class="card-body">
          ${track.year ? `<p class="eyebrow">${track.year}</p>` : ""}
          <h3>${track.title}</h3>
          <p>${track.description || ""}</p>
          <div class="platforms">${linksHtml(track.links || data.socials)}</div>
        </div>
      </article>
    `).join("");
  }

  const videoList = document.getElementById("videoList");
  if (videoList && data.videos) {
    videoList.innerHTML = data.videos.map(video => `
      <div>
        <div class="video-frame">
          <iframe src="https://www.youtube.com/embed/${video.youtubeId}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <div class="platforms"><a href="${video.url}" target="_blank" rel="noopener">${video.title}</a></div>
      </div>
    `).join("");
  }

  const officialLinks = document.getElementById("officialLinks");
  if (officialLinks && data.socials) {
    officialLinks.innerHTML = Object.entries(data.socials)
      .map(([name,url]) => `<a class="link-card" href="${url}" target="_blank" rel="noopener">${name}</a>`)
      .join("");
  }
}

document.getElementById("menuBtn")?.addEventListener("click",()=>document.getElementById("navlinks").classList.toggle("open"));

window.addEventListener("scroll",()=>{
  const btn = document.getElementById("topBtn");
  if(btn) btn.style.display = window.scrollY > 520 ? "block" : "none";
});

document.getElementById("topBtn")?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

loadData();
