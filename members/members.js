function loadMemberForm(){
  const p = mpbpGetMember();
  pseudo.value = p.pseudo || "";
  avatar.value = p.avatar || "";
  favoriteArtist.value = p.favoriteArtist || "";
  favoriteStyle.value = p.favoriteStyle || "";
}
function saveMemberForm(){
  mpbpSaveMember({
    pseudo:pseudo.value,
    avatar:avatar.value || "🎵",
    favoriteArtist:favoriteArtist.value,
    favoriteStyle:favoriteStyle.value
  });
  saveStatus.textContent = "Compte membre enregistré sur cet appareil.";
  renderMember();
}
function quickFav(type,title,meta,url){
  mpbpToggleMemberFavorite(type,title,meta,url);
  renderMember();
}
function renderMember(){
  const p = mpbpGetMember();
  const favs = mpbpGetMemberFavorites();
  const hist = mpbpGetMemberHistory();
  const notifs = mpbpGetLocalNotifications();

  profileName.textContent = p.pseudo || "Invité";
  profileAvatar.textContent = p.avatar || "🎵";
  favCount.textContent = favs.length;
  historyCount.textContent = hist.length;
  notifCount.textContent = notifs.length;

  favoritesList.innerHTML = favs.length ? favs.map(f => `<article><p class="sup">${f.type}</p><h3>${f.title}</h3><p>${f.meta||""}</p>${f.url?`<a class="btn ghost" href="${f.url}">Ouvrir</a>`:""}<button class="btn ghost" onclick="quickFav('${f.type.replace(/'/MPBP440-V12-Preview/g,"\\'")}','${f.title.replace(/'/MPBP440-V12-Preview/g,"\\'")}','${(f.meta||"").replace(/'/MPBP440-V12-Preview/g,"\\'")}','${(f.url||"").replace(/'/MPBP440-V12-Preview/g,"\\'")}')">Retirer</button></article>`).join("") : "<p>Aucun favori pour le moment.</p>";

  historyList.innerHTML = hist.length ? hist.slice(0,12).map(h => `<article><p class="sup">${h.type||"page"}</p><h3>${h.title}</h3><p>${new Date(h.date).toLocaleString()}</p><a class="btn ghost" href="${h.url}">Revoir</a></article>`).join("") : "<p>Aucun historique pour le moment.</p>";
}
function resetMember(){
  if(!confirm("Réinitialiser votre compte local MPBP440 ?")) return;
  ["mpbp440_member_profile_v62","mpbp440_member_favorites_v62","mpbp440_member_history_v62","mpbp440_member_notifications_v62"].forEach(k=>localStorage.removeItem(k));
  location.reload();
}
document.addEventListener("DOMContentLoaded", () => {
  loadMemberForm();
  renderMember();
});
