/* MPBP440 Auth Admin — V5.7.2
IMPORTANT : changez ces deux lignes avant upload.
*/
const ADMIN_USER = "sparet";
const ADMIN_PASS = "docslam@mpbp83340";

const SESSION_KEY = "mpbp440_admin_session_v572";
const LOCK_KEY = "mpbp440_admin_lock_v572";
const FAIL_KEY = "mpbp440_admin_fail_v572";
const LOG_KEY = "mpbp440_admin_login_log_v572";
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

function now(){ return Date.now(); }
function getFail(){ return parseInt(localStorage.getItem(FAIL_KEY) || "0", 10); }
function setMsg(txt){ const el=document.getElementById("loginMsg"); if(el) el.textContent=txt; }
function setAttempts(){
  const el=document.getElementById("attemptsMsg");
  if(!el) return;
  const fail = getFail();
  const left = Math.max(0, MAX_FAILS - fail);
  el.textContent = "Tentatives restantes : " + left + "/" + MAX_FAILS;
}
function lockUntil(){
  return parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
}
function isLocked(){
  const t = lockUntil();
  return t && now() < t;
}
function formatRemain(ms){
  const min = Math.ceil(ms / 60000);
  return min + " minute(s)";
}
function addLog(type){
  let logs = [];
  try{ logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }catch(e){}
  logs.unshift({
    type,
    date: new Date().toISOString(),
    userAgent: navigator.userAgent,
    page: location.href
  });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 30)));
}
function togglePassword(){
  const pass = document.getElementById("adminPass");
  if(!pass) return;
  pass.type = pass.type === "password" ? "text" : "password";
}
function showHelp(){
  alert("Accès réservé MPBP440. Si vous êtes l’administrateur, utilisez l’identifiant et le mot de passe définis dans auth.js.");
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

  const s = getSession();
  const info = document.getElementById("sessionInfo");
  if(info && s) info.textContent = "Session active jusqu’à " + new Date(s.expire).toLocaleString();
}
function getSession(){
  try{ return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch(e){ return null; }
}
function checkSession(){
  const s = getSession();
  if(s && s.expire > now()){
    activateAdmin();
  }else{
    localStorage.removeItem(SESSION_KEY);
    setAttempts();
    const t = lockUntil();
    if(t && now() < t){
      setMsg("Accès verrouillé encore " + formatRemain(t - now()) + ".");
    }
  }
}
function loginAdmin(){
  if(isLocked()){
    setMsg("Accès temporairement verrouillé encore " + formatRemain(lockUntil() - now()) + ".");
    setAttempts();
    return;
  }

  const u = document.getElementById("adminUser").value.trim();
  const p = document.getElementById("adminPass").value;

  if(u === ADMIN_USER && p === ADMIN_PASS){
    const remember = document.getElementById("rememberAdmin").checked;
    const expire = now() + (remember ? 24*60*60*1000 : 60*60*1000);
    localStorage.setItem(SESSION_KEY, JSON.stringify({expire, user:u}));
    localStorage.removeItem(FAIL_KEY);
    localStorage.removeItem(LOCK_KEY);
    addLog("success");
    activateAdmin();
    return;
  }

  let fail = getFail() + 1;
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
