# Simulabo v2 (bêta)

Branche `v2-beta`. Elle ne modifie aucune des simulations existantes de `sims/` : la v2 ajoute une couche autour (accueil, pages, composant) et une simulation pilote.

## Ce que contient la bêta

| Élément | Fichiers | Remarques |
|---|---|---|
| **Accueil par parcours** | `index.html`, bloc JSON `parcours-data` | Niveau (Seconde, Première) puis chapitres du programme, simulations dans l'ordre proposé. Recherche, filtres, catalogue conservés. |
| **Refonte visuelle** | `shared/site.css`, `shared/tokens.css` | Feuille de style des pages du site ; jetons de design uniques, partagés avec les simulations. Contribution déplacée vers la page À propos. |
| **Prédire · Observer · Expliquer** | `shared/simulabo.js` (`Simulabo.poe`), `shared/simulabo.css` (section 15) | Composant du socle, version 1.1.0 (ajouts seulement). |
| **Simulation pilote** | `sims/periode-frequence.html` | Oscilloscope virtuel (Seconde, Ondes et signaux). Première simulation à utiliser le composant. |
| **Pages À propos, accessibilité, licence** | `a-propos/*.html` | Contenus rédigés honnêtement ; les points à décider par l'auteur sont marqués « À compléter ». |
| **Contrôles** | `tools/check.py` | Nouveaux contrôles : `parcours-data`, liens internes cassés des pages du site, présence de `site.css` et `tokens.css`. |

## Pour voir la bêta

Depuis la racine du dépôt, sur la branche `v2-beta` :

```
python3 -m http.server 8000
```

puis ouvrir `http://localhost:8000/`. Les pages portent `noindex` et un bandeau « Version 2 · bêta ».

## Décisions à prendre avant de fusionner

1. **Licence** : aucun fichier de licence dans le dépôt. La page `a-propos/licence.html` présente des options (CC BY-SA ou CC BY-NC-SA pour les contenus, MIT pour le code) sans en choisir une. Ajouter ensuite un fichier `LICENSE`.
2. **Auteur et contact** : trois champs « À compléter » dans `a-propos/`.
3. **Rattachements au programme** : l'ordre et le rangement des parcours sont des propositions, d'après l'audit du 28/10. Points signalés dans la page :
   - `banc-optique-photovoltaique` et `energie-pendule` sont rangés en « Activités d'approfondissement » (Seconde) faute de chapitre précis ;
   - `description-mouvement` est annoncé « Première spé » dans le catalogue alors que « Décrire un mouvement » est un thème de Seconde : le niveau est à confirmer ;
   - `decroissance-radioactive-carbone-14` est rangé sous « Enseignement scientifique : une longue histoire de la matière » : à confirmer avec le programme.
4. **Pilote P·O·E** : le rattachement de « Période et fréquence d'un signal » au programme de Seconde (Ondes et signaux, signal sonore périodique) est à confirmer avec le BO ; les textes de retour (messages sur les mauvaises prédictions) sont à relire par un enseignant.
5. **Couleurs de thème unifiées** : `--t-matiere`, etc. prennent les valeurs de l'accueil (vert d'eau, bleu, ambre, violet). Seule la pastille du `kicker` des simulations migrées change de teinte.

## Ce qui n'est pas fait

- Les simulations existantes ne sont pas migrées ni touchées ; celles qui restent hors socle gardent leurs avertissements.
- Le composant P·O·E n'est utilisé que par le pilote : il n'a pas été testé avec des élèves.
- Pas de mode hors ligne complet (service worker), pas de fiches élèves imprimables, pas de parcours « enseignant ».
- L'espace enseignant garde sa feuille de style : seul son lien de navigation vers À propos reste à ajouter.
- Accessibilité : contrôles automatiques et tests Playwright seulement ; pas de test au lecteur d'écran ni avec des élèves.

## Fusionner

1. Régler les points ci-dessus, relire `a-propos/`.
2. Retirer le bandeau bêta et `noindex` de `index.html` et de `a-propos/*.html`.
3. `python3 tools/check.py` : zéro erreur.
4. Fusionner la pull request, vérifier le site publié.
