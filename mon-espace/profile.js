function loadProfileForm(){
  const p = mpbpGetProfile();
  document.getElementById("pseudo").value = p.pseudo || "";
  document.getElementById("avatar").value = p.avatar || "";
  document.getElementById("favoriteArtist").value = p.favoriteArtist || "";
  document.getElementById("favoriteStyle").value = p.favoriteStyle || "";
}
function saveProfileForm(){
  const profile = {
    pseudo: document.getElementById("pseudo").value,
    avatar: document.getElementById("avatar").value || "🎵",
    favoriteArtist: document.getElementById("favoriteArtist").value,
    favoriteStyle: document.getElementById("favoriteStyle").value,
    updated_at: new Date().toISOString()
  };
  mpbpSaveProfile(profile);
  document.getElementById("profileStatus").textContent = "Profil enregistré sur cet appareil.";
  renderSpace();
}
function saveNotifPrefsForm(){
  const prefs = Array.from(document.querySelectorAll(".notify-grid input:checked")).map(x=>x.value);
  mpbpSaveNotifPrefs(prefs);
  renderSpace();
}
function renderSpace(){
  const p = mpbpGetProfile();
  const favs = mpbpGetFavorites();
  const hist = mpbpGetHistory();
  const prefs = mpbpGetNotifPrefs();

  document.getElementById("profileName").textContent = p.pseudo || "Invité";
  document.getElementById("profileAvatar").textContent = p.avatar || "🎵";
  document.getElementById("favCount").textContent = favs.length;
  document.getElementById("historyCount").textContent = hist.length;
  document.getElementById("notifCount").textContent = prefs.length;

  document.querySelectorAll(".notify-grid input").forEach(input => input.checked = prefs.includes(input.value));

  const favBox = document.getElementById("favoritesList");
  favBox.innerHTML = favs.length ? favs.map(f => `<article><p class="sup">${f.type}</p><h3>${f.title}</h3><p>${f.meta||""}</p>${f.url?`<a class="btn ghost" href="${f.url}">Ouvrir</a>`:""}<button class="btn ghost" onclick="mpbpRemoveFavorite('${f.key.replace(/'/g,"\\'")}'); renderSpace();">Retirer</button></article>`).join("") : "<p>Aucun favori pour le moment.</p>";

  const histBox = document.getElementById("historyList");
  histBox.innerHTML = hist.length ? hist.slice(0,12).map(h => `<article><h3>${h.title}</h3><p>${new Date(h.date).toLocaleString()}</p><a class="btn ghost" href="${h.url}">Revoir</a></article>`).join("") : "<p>Aucun historique pour le moment.</p>";
}
function resetLocalSpace(){
  if(!confirm("Réinitialiser votre espace local MPBP440 ?")) return;
  ["mpbp440_user_profile","mpbp440_user_favorites","mpbp440_user_history","mpbp440_notification_prefs","mpbp440_music_favorites"].forEach(k => localStorage.removeItem(k));
  location.reload();
}
document.addEventListener("DOMContentLoaded", () => {
  loadProfileForm();
  renderSpace();
});
