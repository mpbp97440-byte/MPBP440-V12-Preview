
let galleryItems = [];
let currentFilter = "Tous";

async function loadGallery(){
  const grid = document.getElementById("galleryGrid");
  if(!grid) return;
  try{
    const r = await fetch("../data/gallery.json?v=4.5",{cache:"no-store"});
    galleryItems = await r.json();
    renderGallery();
  }catch(e){
    grid.innerHTML = "<p>La galerie sera disponible prochainement.</p>";
  }
}

function renderGallery(){
  const grid = document.getElementById("galleryGrid");
  const list = currentFilter === "Tous"
    ? galleryItems
    : galleryItems.filter(x =>
        (x.artist || "") === currentFilter ||
        (x.type || "") === currentFilter
      );

  grid.innerHTML = list.length ? list.map((item, i) => `
    <article class="gallery-card" onclick="openLightbox(${galleryItems.indexOf(item)})">
      <img src="../${item.image}" alt="${item.title || ""}">
      <div>
        <p class="sup">${item.type || "Visuel"} • ${item.artist || "MPBP440"}</p>
        <h3>${item.title || ""}</h3>
        <p>${item.description || ""}</p>
      </div>
    </article>
  `).join("") : "<p>Aucun visuel pour ce filtre.</p>";
}

function openLightbox(index){
  const item = galleryItems[index];
  if(!item) return;
  document.getElementById("lightboxImg").src = "../" + item.image;
  document.getElementById("lightboxTitle").textContent = item.title || "";
  document.getElementById("lightboxText").textContent = item.description || "";
  document.getElementById("lightbox").hidden = false;
}

function closeLightbox(){
  document.getElementById("lightbox").hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      renderGallery();
    });
  });
  loadGallery();
});
