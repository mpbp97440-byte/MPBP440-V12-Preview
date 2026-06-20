/* MPBP440 Analytics Dashboard — V5.4 */
const NS = "mpbp440-official";
const trackedPages = [
  ["Accueil", "/"],
  ["Application", "/application/index.html"],
  ["Music Hub", "/music/index.html"],
  ["Live Center", "/live/index.html"],
  ["Galerie", "/galerie/index.html"],
  ["Sparetdee Simon", "/artistes/sparetdee-simon.html"],
  ["Juste Une Plume", "/artistes/juste-une-plume.html"]
];

function slugPath(path){
  let p = (path || "/").replace(/^\//,"").replace(/\/$/,"");
  if(!p) p = "home";
  return p.replace(/[^a-zA-Z0-9]+/g,"_").toLowerCase();
}
async function getCount(key){
  try{
    const r = await fetch("https://api.countapi.xyz/get/" + NS + "/" + encodeURIComponent(key), {cache:"no-store", mode:"cors"});
    if(!r.ok) throw new Error("count api unavailable");
    const data = await r.json();
    return data.value || 0;
  }catch(e){
    return null;
  }
}
function set(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value === null ? "--" : value;
}
async function loadStats(){
  const total = await getCount("total_views");
  const pwaOpen = await getCount("pwa_open");
  const pwaInstalls = await getCount("pwa_installs");
  const desktop = await getCount("device_desktop");
  const mobile = await getCount("device_mobile");

  set("totalViews", total);
  set("pwaOpens", pwaOpen);
  set("pwaInstalls", pwaInstalls);
  set("desktopViews", desktop);
  set("mobileViews", mobile);
  set("localViews", localStorage.getItem("mpbp440_local_pageviews") || "0");

  const box = document.getElementById("pagesStats");
  const rows = [];
  for(const [label,path] of trackedPages){
    const count = await getCount("page_" + slugPath(path));
    rows.push({label,path,count});
  }
  box.innerHTML = rows.map(r => `<article><div><h3>${r.label}</h3><p>${r.path}</p></div><strong>${r.count === null ? "--" : r.count}</strong></article>`).join("");

  const status = document.getElementById("analyticsStatus");
  if(total === null){
    status.textContent = "Mode local actif : le service compteur global ne répond pas pour le moment. Le site continue de fonctionner.";
  }else{
    status.textContent = "Mode global actif : les compteurs sont partagés entre tous les visiteurs, avec sauvegarde locale en complément.";
  }
}
document.addEventListener("DOMContentLoaded", loadStats);
