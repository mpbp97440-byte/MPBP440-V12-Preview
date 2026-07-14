# Audit UX MPBP440 - structure accueil 202607

## Problèmes constatés

- L'entrée de menu `Actus` menait vers un bloc placeholder alors que les données `data/news.json` et `data/notifications.json` contiennent déjà de vraies annonces.
- Les nouveautés importantes existaient à plusieurs endroits, mais la page d'accueil ne proposait pas une lecture éditoriale claire des actualités récentes.
- MPBP TV fonctionne, mais les lecteurs vidéo exclusifs étaient placés dans des cartes avec effets visuels denses. Sur mobile ou desktop, cela pouvait donner l'impression que les contrôles natifs étaient difficiles à atteindre.
- La page d'accueil reste riche et longue : les utilisateurs ont besoin de repères rapides pour choisir entre sorties, à venir, clips, artistes, événements et actualités.

## Structure actuelle résumée

1. Hero MPBP440
2. Cartes de focus
3. Label
4. Sorties officielles
5. Prochaine sortie / compte à rebours
6. À venir
7. Événements
8. Aperçu Music Hub
9. Artistes
10. Clips / MPBP TV
11. Radio
12. Actualités
13. Journal notifications
14. Galerie
15. Liens, application, espace, téléchargements

## Structure recommandée

1. Hero / identité MPBP440
2. À la une / nouveautés importantes
3. Sorties disponibles
4. À venir / comptes à rebours
5. MPBP TV / clips exclusifs
6. Artistes
7. Événements
8. Actualités / Journal
9. Galerie
10. Radio, liens, application, espace et téléchargements

## Corrections appliquées maintenant

- Remplacement du placeholder `Actus` par une vraie section `Actualités MPBP440`.
- Rendu dynamique des actualités depuis `data/news.json`, avec date, type, titre, résumé et CTA.
- Correction des textes cassés de l'annonce et de la notification `J’existe`.
- Amélioration non destructive des lecteurs MPBP TV : vidéo non recouverte, événements pointeur garantis, actions séparées, bouton plein écran.
- Ajout d'un bloc `Accès direct` sous les priorités d'accueil pour guider vers sorties, à venir, clips, artistes, actualités et événements.
- Mise à jour du cache PWA et du cache-busting pour forcer le rafraîchissement.

## Recommandations pour une refonte future

- Ajouter un bloc `Accès direct` juste sous le hero : Sorties disponibles, À venir, Clips exclusifs, Artistes, Actualités, Événements.
- Fusionner visuellement `Actualités` et `Journal` ou clarifier leur rôle : `Actualités` pour le public, `Notifications` pour les nouveautés rapides.
- Remonter MPBP TV avant les artistes si le clip exclusif est la priorité de campagne.
- Garder les événements passés hors des sections `À venir`, mais autoriser leur présence éditoriale dans les actualités si le contexte reste utile.
- Harmoniser tous les titres avec accents : Makéda Muse, J’existe, Actualités, Événements.

## Plan Figma recommandé

- Home desktop 1440px : hero, focus nouveautés, sorties, clips, artistes, actus.
- Home mobile 390px : menu court, CTA empilés, cartes compactes, aucun débordement horizontal.
- Page artiste : hero, dernières sorties, clip principal, liens officiels.
- MPBP TV : lecteur principal, clips exclusifs, clips officiels, partage.
- Actualités / Journal : grille éditoriale, filtres type sortie/clip/event/artiste.
- Design system noir/or : boutons, cards, tags, countdowns, navigation, lecteur vidéo, états hover/focus.
