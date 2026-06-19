
const FAV_KEY = "mpbp440_favorites";
function getFavorites(){
  try{return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");}
  catch(e){return [];}
}
function saveFavorites(favs){
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}
function addArtistFavorite(name, role){
  const favs = getFavorites();
  const key = "Artiste:" + name;
  if(!favs.find(f => f.key === key)){
    favs.unshift({key,type:"Artiste",title:name,meta:role,created_at:new Date().toISOString()});
  }
  saveFavorites(favs);
  alert(name + " ajouté aux favoris.");
}
