/* MPBP440 Member System — V6.2 */
const MPBP_MEMBER_KEY = "mpbp440_member_profile_v62";
const MPBP_MEMBER_FAVS_KEY = "mpbp440_member_favorites_v62";
const MPBP_MEMBER_HISTORY_KEY = "mpbp440_member_history_v62";
const MPBP_MEMBER_NOTIF_KEY = "mpbp440_member_notifications_v62";

function mpbpGetMember(){
  try{return JSON.parse(localStorage.getItem(MPBP_MEMBER_KEY) || "{}");}
  catch(e){return {};}
}
function mpbpSaveMember(profile){
  localStorage.setItem(MPBP_MEMBER_KEY, JSON.stringify({...profile, updated_at:new Date().toISOString()}));
}
function mpbpGetMemberFavorites(){
  try{return JSON.parse(localStorage.getItem(MPBP_MEMBER_FAVS_KEY) || "[]");}
  catch(e){return [];}
}
function mpbpSaveMemberFavorites(favs){
  localStorage.setItem(MPBP_MEMBER_FAVS_KEY, JSON.stringify(favs));
}
function mpbpToggleMemberFavorite(type,title,meta,url){
  const key = `${type}:${title}`;
  let favs = mpbpGetMemberFavorites();
  if(favs.find(f => f.key === key)){
    favs = favs.filter(f => f.key !== key);
  }else{
    favs.unshift({key,type,title,meta:meta||"",url:url||location.href,created_at:new Date().toISOString()});
  }
  mpbpSaveMemberFavorites(favs);
}
function mpbpAddMemberHistory(title,url,type){
  let hist = [];
  try{hist = JSON.parse(localStorage.getItem(MPBP_MEMBER_HISTORY_KEY) || "[]");}catch(e){}
  const finalUrl = url || location.href;
  hist = hist.filter(h => h.url !== finalUrl);
  hist.unshift({title:title||document.title,url:finalUrl,type:type||"page",date:new Date().toISOString()});
  localStorage.setItem(MPBP_MEMBER_HISTORY_KEY, JSON.stringify(hist.slice(0,80)));
}
function mpbpGetMemberHistory(){
  try{return JSON.parse(localStorage.getItem(MPBP_MEMBER_HISTORY_KEY) || "[]");}
  catch(e){return [];}
}
function mpbpGetLocalNotifications(){
  try{return JSON.parse(localStorage.getItem(MPBP_MEMBER_NOTIF_KEY) || "[]");}
  catch(e){return [];}
}
function mpbpAddLocalNotification(type,title,text){
  const list = mpbpGetLocalNotifications();
  list.unshift({type,title,text,date:new Date().toISOString(),read:false});
  localStorage.setItem(MPBP_MEMBER_NOTIF_KEY, JSON.stringify(list.slice(0,80)));
}
function mpbpMarkNotificationsRead(){
  const list = mpbpGetLocalNotifications().map(n => ({...n, read:true}));
  localStorage.setItem(MPBP_MEMBER_NOTIF_KEY, JSON.stringify(list));
}
document.addEventListener("DOMContentLoaded", () => {
  mpbpAddMemberHistory(document.title, location.href, "page");
});
window.mpbpGetMember = mpbpGetMember;
window.mpbpSaveMember = mpbpSaveMember;
window.mpbpGetMemberFavorites = mpbpGetMemberFavorites;
window.mpbpToggleMemberFavorite = mpbpToggleMemberFavorite;
window.mpbpAddMemberHistory = mpbpAddMemberHistory;
window.mpbpGetMemberHistory = mpbpGetMemberHistory;
window.mpbpAddLocalNotification = mpbpAddLocalNotification;
window.mpbpGetLocalNotifications = mpbpGetLocalNotifications;
window.mpbpMarkNotificationsRead = mpbpMarkNotificationsRead;
