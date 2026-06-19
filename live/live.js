
const PREF_KEY = "mpbp440_notification_prefs";

async function loadJson(url, fallback){
  try{ const r = await fetch(url,{cache:"no-store"}); return await r.json(); }
  catch(e){ return fallback; }
}

async function loadLiveCenter(){
  const status = await loadJson("../data/live_status.json?v=5.1", {is_live:false});
  const events = await loadJson("../data/live_events.json?v=5.1", []);

  const hero = document.getElementById("liveHero");
  const msg = document.getElementById("liveMessage");
  const btn = document.getElementById("liveButton");

  if(status.is_live){
    hero.classList.add("is-live");
    msg.textContent = status.message_live || "🔴 En direct maintenant";
    btn.textContent = "Rejoindre le live maintenant";
    btn.href = status.url || status.fallback_url || "#";
  }else{
    hero.classList.remove("is-live");
    msg.textContent = status.message_offline || "Prochain live annoncé prochainement";
    btn.textContent = "Voir le TikTok officiel";
    btn.href = status.fallback_url || status.url || "#";
  }

  const next = events[0] || {};
  document.getElementById("nextLiveTitle").textContent = next.title || "Prochain live MPBP440";
  document.getElementById("nextLiveDescription").textContent = next.description || "Les prochains directs seront annoncés ici.";

  const dateIso = next.date && next.time ? `${next.date}T${next.time}:00+02:00` : "";
  const countdown = document.getElementById("liveCountdown");
  countdown.dataset.date = dateIso;

  const list = document.getElementById("liveEventsList");
  list.innerHTML = events.length ? events.map(ev => `
    <article class="event-card">
      <p class="sup">${ev.platform || "Live"} • ${ev.status || ""}</p>
      <h3>${ev.title || ""}</h3>
      <p>${ev.artist || ""} ${ev.date || ""} ${ev.time || ""}</p>
      <p>${ev.description || ""}</p>
      ${ev.url ? `<a class="btn ghost" href="${ev.url}" target="_blank" rel="noopener">Ouvrir</a>` : ""}
    </article>
  `).join("") : "<p>Aucun live annoncé pour le moment.</p>";

  tickCountdown();
  setInterval(tickCountdown,1000);
}

function tickCountdown(){
  const box = document.getElementById("liveCountdown");
  const date = box?.dataset.date;
  if(!date) return;
  const target = new Date(date).getTime();
  const diff = target - Date.now();
  const nums = box.querySelectorAll("strong");
  if(diff <= 0){ nums.forEach(n => n.textContent = "00"); return; }
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff/3600000)%24;
  const m = Math.floor(diff/60000)%60;
  const s = Math.floor(diff/1000)%60;
  [d,h,m,s].forEach((v,i)=> nums[i].textContent = String(v).padStart(2,"0"));
}

function saveNotificationPrefs(){
  const prefs = Array.from(document.querySelectorAll(".notify-grid input:checked")).map(x=>x.value);
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  document.getElementById("notifyStatus").textContent = "Préférences enregistrées sur cet appareil.";
}

function loadPrefs(){
  const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "[]");
  document.querySelectorAll(".notify-grid input").forEach(input => input.checked = prefs.includes(input.value));
}

document.addEventListener("DOMContentLoaded", () => {
  loadPrefs();
  loadLiveCenter();
});
