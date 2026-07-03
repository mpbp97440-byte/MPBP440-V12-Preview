const ADMIN_USER = "sparet";
const ADMIN_PASS = "docslam@mpbp83340";

const SESSION_KEY = "mpbp440_admin_session_v8";
const LOCK_KEY = "mpbp440_admin_lock_v8";
const FAIL_KEY = "mpbp440_admin_fail_v8";
const LOG_KEY = "mpbp440_admin_login_log_v8";
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

function now(){ return Date.now(); }
function getFail(){ return parseInt(localStorage.getItem(FAIL_KEY) || "0", 10); }
function lockUntil(){ return parseInt(localStorage.getItem(LOCK_KEY) || "0", 10); }
function isLocked(){ const t = lockUntil(); return t && now() < t; }
function formatRemain(ms){ return Math.ceil(ms / 60000) + " minute(s)"; }
function setMsg(txt){ const el = document.getElementById("loginMsg"); if(el) el.textContent = txt; }
function setAttempts(){
  const el = document.getElementById("attemptsMsg");
  if(!el) return;
  el.textContent = "Tentatives restantes : " + Math.max(0, MAX_FAILS - getFail()) + "/" + MAX_FAILS;
}
function addLog(type){
  let logs = [];
  try{ logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }catch(e){}
  logs.unshift({type, date:new Date().toISOString(), userAgent:navigator.userAgent, page:location.href});
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0,30)));
}
function getSession(){
  try{ return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch(e){ return null; }
}
function togglePassword(){
  const pass = document.getElementById("adminPass");
  if(pass) pass.type = pass.type === "password" ? "text" : "password";
}
function showHelp(){
  alert("Accès réservé MPBP440. La connexion est locale au navigateur et ne contacte aucun serveur.");
}
function clearLockLocal(){
  if(!confirm("Réinitialiser uniquement le verrou local de ce navigateur ?")) return;
  localStorage.removeItem(LOCK_KEY);
  localStorage.removeItem(FAIL_KEY);
  setMsg("Verrou local réinitialisé.");
  setAttempts();
}
function activateAdmin(){
  const login = document.getElementById("loginBox");
  const admin = document.getElementById("adminBox");
  if(login) login.style.display = "none";
  if(admin) admin.style.display = "block";
  const session = getSession();
  const info = document.getElementById("sessionInfo");
  if(info && session) info.textContent = "Session active jusqu'à " + new Date(session.expire).toLocaleString();
  document.dispatchEvent(new CustomEvent("mpbp-admin-ready"));
}
function checkSession(){
  const session = getSession();
  if(session && session.expire > now()){
    activateAdmin();
    return;
  }
  localStorage.removeItem(SESSION_KEY);
  setAttempts();
  const locked = lockUntil();
  if(locked && now() < locked) setMsg("Accès verrouillé encore " + formatRemain(locked - now()) + ".");
}
function loginAdmin(){
  if(isLocked()){
    setMsg("Accès temporairement verrouillé encore " + formatRemain(lockUntil() - now()) + ".");
    setAttempts();
    return;
  }
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value;
  if(user === ADMIN_USER && pass === ADMIN_PASS){
    const remember = document.getElementById("rememberAdmin").checked;
    const expire = now() + (remember ? 24*60*60*1000 : 60*60*1000);
    localStorage.setItem(SESSION_KEY, JSON.stringify({expire, user}));
    localStorage.removeItem(FAIL_KEY);
    localStorage.removeItem(LOCK_KEY);
    addLog("success");
    activateAdmin();
    return;
  }
  const fail = getFail() + 1;
  localStorage.setItem(FAIL_KEY, String(fail));
  addLog("failed");
  if(fail >= MAX_FAILS){
    localStorage.setItem(LOCK_KEY, String(now() + LOCK_MINUTES*60*1000));
    setMsg("Trop de tentatives. Verrouillage " + LOCK_MINUTES + " minutes.");
  }else{
    setMsg("Identifiant ou mot de passe incorrect.");
  }
  setAttempts();
}
function logoutAdmin(){
  localStorage.removeItem(SESSION_KEY);
  addLog("logout");
  location.reload();
}
document.addEventListener("DOMContentLoaded", checkSession);
