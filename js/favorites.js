/* MPBP440 Favorites — V5.5 */
const MPBP_FAVORITES_KEY = "mpbp440_user_favorites";

function mpbpGetFavorites(){
  try{return JSON.parse(localStorage.getItem(MPBP_FAVORITES_KEY) || "[]");}
  catch(e){return [];}
}
function mpbpSaveFavorites(favs){
  localStorage.setItem(MPBP_FAVORITES_KEY, JSON.stringify(favs));
}
function mpbpAddFavorite(type, title, meta, url){
  const favs = mpbpGetFavorites();
  const key = `${type}:${title}`;
  if(!favs.find(f => f.key === key)){
    favs.unshift({key,type,title,meta:meta||"",url:url||location.href,created_at:new Date().toISOString()});
    mpbpSaveFavorites(favs);
  }
}
function mpbpRemoveFavorite(key){
  mpbpSaveFavorites(mpbpGetFavorites().filter(f => f.key !== key));
}
function mpbpToggleFavorite(type, title, meta, url){
  const key = `${type}:${title}`;
  const favs = mpbpGetFavorites();
  if(favs.find(f => f.key === key)){
    mpbpSaveFavorites(favs.filter(f => f.key !== key));
  }else{
    favs.unshift({key,type,title,meta:meta||"",url:url||location.href,created_at:new Date().toISOString()});
    mpbpSaveFavorites(favs);
  }
}
window.mpbpGetFavorites = mpbpGetFavorites;
window.mpbpAddFavorite = mpbpAddFavorite;
window.mpbpRemoveFavorite = mpbpRemoveFavorite;
window.mpbpToggleFavorite = mpbpToggleFavorite;
