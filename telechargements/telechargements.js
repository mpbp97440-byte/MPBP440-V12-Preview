async function loadChangelog(){
  const box=document.getElementById("changelog");
  if(!box)return;
  try{
    const r=await fetch("/MPBP440-V12-Preview/data/app-version.json?v=5.6",{cache:"no-store"});
    const data=await r.json();
    box.innerHTML=(data.changelog||[]).map(x=>`<article><h3>${x.version}</h3><p>${x.date}</p><p>${x.text}</p></article>`).join("");
  }catch(e){
    box.innerHTML="<p>Journal des mises à jour bientôt disponible.</p>";
  }
}
document.addEventListener("DOMContentLoaded",loadChangelog);
