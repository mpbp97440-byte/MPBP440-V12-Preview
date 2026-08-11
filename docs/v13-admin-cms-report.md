# MPBP440 Back Office V2 / CMS autonome

## Architecture

Le back-office existant reste l'unique interface privée. Les modifications
restent dans un brouillon et sont prévisualisées dans le navigateur. Elles ne
modifient les fichiers publics qu'après confirmation de **Publier sur le site**.

1. `cms_save_draft` enregistre le brouillon de l'administrateur dans Supabase.
2. `admin-media-upload` vérifie le JWT et le rôle, puis importe les médias dans
   le bucket Storage `mpbp440-media`.
3. `admin-publish-site` valide les JSON autorisés, crée les blobs, l'arbre et un
   unique commit GitHub, puis avance `main` sans commit partiel.
4. GitHub Pages est déclenché par le push. La fonction retourne le SHA au
   back-office.

## Sécurité

- Aucun token GitHub, service role, mot de passe ou session n'est écrit dans le
  HTML, le JavaScript public ou le stockage navigateur.
- Les Edge Functions vérifient le JWT, `admin_users.role = 'admin'` et
  `admin_users.is_active = true` avant toute opération sensible.
- Les chemins GitHub sont limités à la liste blanche des données publiques.
- Le bucket est public en lecture pour les médias du site, mais l'écriture est
  réservée à un administrateur actif.
- Les brouillons et l'historique de publication sont protégés par RLS.

## Données et contenus liés

`content_registry` remplace la liste figée des clips dans les fonctions de
vues, likes et commentaires. La publication enregistre automatiquement les
nouveaux clips; leurs compteurs et commentaires fonctionnent donc sans une
nouvelle migration SQL. MPBP TV relit aussi `data.json`, ce qui affiche les
clips publiés par le CMS sans modifier manuellement le script.

Les sorties à venir continuent de synchroniser `countdowns.json` depuis leur
date. Les morceaux et clips portent l'artiste/les artistes dans une seule
donnée; les pages publiques peuvent donc les relier sans doublon éditorial.

## Fichiers et déploiement Supabase requis

- Migration : `supabase/migrations/20260811000100_admin_cms_v2.sql`
- Fonctions : `admin-media-upload`, `admin-publish-site`
- Secrets Edge Function à définir côté Supabase seulement :
  - `GITHUB_ADMIN_TOKEN` : PAT fine-grained limité au dépôt, Contents read/write
  - `GITHUB_ADMIN_REPOSITORY` : optionnel, valeur par défaut du dépôt MPBP440
  - `CMS_ALLOWED_ORIGIN` : `https://www.mpbp440.com`

Commandes d'exploitation, à exécuter dans un environnement authentifié
Supabase (les secrets ne sont jamais placés dans ce dépôt) :

```text
supabase db push --linked
supabase functions deploy admin-media-upload
supabase functions deploy admin-publish-site
supabase secrets set GITHUB_ADMIN_TOKEN=... CMS_ALLOWED_ORIGIN=https://www.mpbp440.com
```

## Vérifications prévues

- Anonyme : refus des fonctions CMS, pas d'écriture Storage.
- Authentifié non-admin : refus des fonctions et RPC CMS.
- Admin actif : brouillon, import d'image/MP4 valide, publication atomique et
  SHA retourné.
- Média : PNG/JPG/WEBP/MP4 uniquement, 500 Mo maximum.
- Clip : source HTTPS ou URL YouTube valide, identifiant sûr, registre
  d'engagement créé automatiquement.

La branche V13 est volontairement séparée de `main` jusqu'à validation visuelle
et déploiement contrôlé des migrations/fonctions.
