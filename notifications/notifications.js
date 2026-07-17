async function loadJson(url,fallback){try{const r=await fetch(url,{cache:"no-store"});return await r.json()}catch(e){return fallback}}
function card(n){
  return `<article><p class="sup">${n.type||n.category||"info"}</p><h3>${n.title}</h3><p>${n.text||""}</p>${n.url?`<a class="btn ghost" href="${n.url}">Ouvrir</a>`:""}</article>`;
}
async function loadNotifications(){
  const official = await loadJson("/MPBP440-V12-Preview/data/notifications.json?v=6.2",[]);
  const news = await loadJson("/MPBP440-V12-Preview/data/news-feed.json?v=6.2",[]);
  const local = mpbpGetLocalNotifications();

  officialNotifications.innerHTML = official.length ? official.map(card).join("") : "<p>Aucune annonce officielle.</p>";
  localNotifications.innerHTML = local.length ? local.map(card).join("") : "<p>Aucune notification locale pour le moment.</p>";
  newsFeed.innerHTML = news.length ? news.map(card).join("") : "<p>Aucune actualité pour le moment.</p>";
}
function markRead(){
  mpbpMarkNotificationsRead();
  loadNotifications();
}
async function askNotificationPermission(){
  if(!("Notification" in window)){
    alert("Les notifications push ne sont pas disponibles sur ce navigateur.");
    return;
  }
  const result = await Notification.requestPermission();
  if(result === "granted"){
    mpbpAddLocalNotification("push","Notifications préparées","Votre appareil accepte les notifications MPBP440. L’activation serveur viendra dans une version future.");
    new Notification("MPBP440", {body:"Notifications préparées pour les prochaines versions."});
  }else{
    mpbpAddLocalNotification("push","Notifications non activées","Vous pourrez les réactiver plus tard depuis votre navigateur.");
  }
  loadNotifications();
}
document.addEventListener("DOMContentLoaded", loadNotifications);
