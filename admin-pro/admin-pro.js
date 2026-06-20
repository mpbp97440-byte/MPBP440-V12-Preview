/* MPBP440 Admin Pro — V5.7 */
let mediaBlob = null;
let mediaName = "";
let mediaPath = "";

let drafts = {
  releases: [],
  artists: [],
  videos: [],
  gallery: [],
  live_events: [],
  app_version: { version:"5.7", app_version:"1.2", changelog:[] }
};

function slugify(t){
  return (t || "media").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80) || "media";
}
function loadDrafts(){
  const saved = localStorage.getItem("mpbp_admin_pro_drafts");
  if(saved){ try{ drafts = JSON.parse(saved); }catch(e){} }
  render();
}
function saveDrafts(){
  localStorage.setItem("mpbp_admin_pro_drafts", JSON.stringify(drafts));
  render();
}
function render(){
  document.getElementById("draftPreview").textContent = JSON.stringify(drafts,null,2);
}
function prepareMedia(){
  const file = document.getElementById("mediaFile").files[0];
  const title = document.getElementById("mediaTitle").value || (file ? file.name : "media");
  const folder = document.getElementById("mediaFolder").value;
  if(!file){ alert("Choisis une image."); return; }
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  mediaName = slugify(title) + "." + ext;
  mediaPath = folder + "/" + mediaName;
  mediaBlob = file;
  document.getElementById("mediaPath").textContent = mediaPath;
  const img = document.getElementById("mediaPreview");
  img.src = URL.createObjectURL(file);
}
function downloadPreparedMedia(){
  if(!mediaBlob){ alert("Prépare d'abord une image."); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(mediaBlob);
  a.download = mediaName;
  a.click();
}
function useMediaFor(id){
  if(!mediaPath){ alert("Prépare d'abord une image."); return; }
  document.getElementById(id).value = mediaPath;
}
function frDate(iso){
  if(!iso) return "";
  const [y,m,d]=iso.split("-");
  return `${d}/${m}/${y}`;
}
function addRelease(){
  const iso = document.getElementById("releaseIsoDate").value;
  drafts.releases.unshift({
    artist: releaseArtist.value, title: releaseTitle.value, type: releaseType.value || "Single",
    date: frDate(iso), isoDate: iso, cover: releaseCover.value, description: releaseDescription.value,
    links:{spotify:releaseSpotify.value, apple:releaseApple.value, deezer:releaseDeezer.value, youtube:releaseYoutube.value, amazon:releaseAmazon.value},
    status: iso ? "À venir" : "Disponible"
  });
  saveDrafts();
}
function slugName(n){return slugify(n)}
function addArtist(){
  drafts.artists.unshift({
    slug: slugName(artistName.value), name: artistName.value, role: artistRole.value,
    image: artistImage.value, page: "artistes/" + slugName(artistName.value) + ".html", bio: artistBio.value,
    links:{spotify:artistSpotify.value, apple:artistApple.value, deezer:artistDeezer.value, youtube:artistYoutube.value}
  });
  saveDrafts();
}
function ytId(url){
  try{
    const u=new URL(url);
    if(u.hostname.includes("youtu.be")) return u.pathname.replace("/","");
    return u.searchParams.get("v") || "";
  }catch(e){return "";}
}
function addVideo(){
  drafts.videos.unshift({artist:videoArtist.value,title:videoTitle.value,youtube:videoYoutube.value,youtubeId:ytId(videoYoutube.value),description:videoDescription.value});
  saveDrafts();
}
function addGallery(){
  drafts.gallery.unshift({artist:galleryArtist.value,title:galleryTitle.value,type:galleryType.value,image:galleryImage.value,description:galleryDescription.value});
  saveDrafts();
}
function addLiveEvent(){
  drafts.live_events.unshift({title:liveTitle.value,artist:liveArtist.value,date:liveDate.value,time:liveTime.value,platform:livePlatform.value,url:liveUrl.value,status:"À venir",description:liveDescription.value});
  saveDrafts();
}
function addChangelog(){
  if(!drafts.app_version.changelog) drafts.app_version.changelog = [];
  drafts.app_version.changelog.unshift({version:changeVersion.value,date:changeDate.value,text:changeText.value});
  saveDrafts();
}
function fileNameFor(type){
  return ({releases:"releases.json",artists:"artists.json",videos:"videos.json",gallery:"gallery.json",live_events:"live_events.json",app_version:"app-version.json"})[type];
}
function downloadJson(type){
  const data = drafts[type];
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=fileNameFor(type);
  a.click();
}
function downloadAllJson(){
  ["releases","artists","videos","gallery","live_events","app_version"].forEach((t,i)=>setTimeout(()=>downloadJson(t),i*250));
}
function resetDrafts(){
  if(!confirm("Réinitialiser les brouillons Admin Pro ?")) return;
  localStorage.removeItem("mpbp_admin_pro_drafts");
  location.reload();
}
document.addEventListener("DOMContentLoaded", loadDrafts);
