/* MPBP440 Profile Manager — V5.5 */
const MPBP_PROFILE_KEY = "mpbp440_user_profile";
const MPBP_HISTORY_KEY = "mpbp440_user_history";
const MPBP_NOTIF_PREF_KEY = "mpbp440_notification_prefs";

function mpbpGetProfile(){
  try{return JSON.parse(localStorage.getItem(MPBP_PROFILE_KEY) || "{}");}
  catch(e){return {};}
}
function mpbpSaveProfile(profile){
  localStorage.setItem(MPBP_PROFILE_KEY, JSON.stringify(profile));
}
function mpbpAddHistory(title, url){
  let hist = [];
  try{hist = JSON.parse(localStorage.getItem(MPBP_HISTORY_KEY) || "[]");}catch(e){}
  hist = hist.filter(h => h.url !== url);
  hist.unshift({title:title || document.title, url:url || location.href, date:new Date().toISOString()});
  localStorage.setItem(MPBP_HISTORY_KEY, JSON.stringify(hist.slice(0,50)));
}
function mpbpGetHistory(){
  try{return JSON.parse(localStorage.getItem(MPBP_HISTORY_KEY) || "[]");}
  catch(e){return [];}
}
function mpbpGetNotifPrefs(){
  try{return JSON.parse(localStorage.getItem(MPBP_NOTIF_PREF_KEY) || "[]");}
  catch(e){return [];}
}
function mpbpSaveNotifPrefs(prefs){
  localStorage.setItem(MPBP_NOTIF_PREF_KEY, JSON.stringify(prefs));
}
document.addEventListener("DOMContentLoaded", () => {
  mpbpAddHistory(document.title, location.href);
});
window.mpbpGetProfile = mpbpGetProfile;
window.mpbpSaveProfile = mpbpSaveProfile;
window.mpbpGetHistory = mpbpGetHistory;
window.mpbpGetNotifPrefs = mpbpGetNotifPrefs;
window.mpbpSaveNotifPrefs = mpbpSaveNotifPrefs;
