PATCH V5.7.2 — Admin Sécurisé Pro

À uploader/remplacer :
- index.html
- robots.txt
- admin-pro/index.html
- admin-440-mpbp-corp/index.html
- admin-440-mpbp-corp/admin.css
- admin-440-mpbp-corp/auth.js
- admin-440-mpbp-corp/admin-pro.js

Nouvelle URL : https://www.mpbp440.com/admin-440-mpbp-corp/

IMPORTANT AVANT UPLOAD :
Ouvrir admin-440-mpbp-corp/auth.js avec Bloc-notes ou Notepad++ et modifier :
const ADMIN_USER = "mpbp440";
const ADMIN_PASS = "CHANGE_ME_AFTER_FIRST_LOGIN";

Fonctions : session 24 h, tentatives restantes, verrouillage 15 min après 5 erreurs, noindex, journal local, bouton afficher/masquer.
