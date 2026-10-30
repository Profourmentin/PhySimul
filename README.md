# PhySimul

Projet de page web hébergeant des simulations interactives pour la physique-chimie.

Chaque simulation est un fichier HTML autonome. La page d'accueil (`index.html`) affiche un catalogue avec recherche, filtres par thème, niveau et type.

## Structure

```
index.html                    page d'accueil et catalogue
sims/                         une simulation = un fichier HTML autonome
shared/simulabo.css           socle CSS commun (jetons, composants, clair/sombre)
shared/simulabo.js            socle JavaScript commun (curseurs, afficheurs, tableau de mesures…)
templates/simulation.html     gabarit d'une nouvelle simulation
tools/new-sim.py              crée une simulation et l'inscrit au catalogue
tools/check.py                contrôle de cohérence du site
docs/socle.md                 mode d'emploi du socle et règles de charte
enseignants/index.html        espace enseignant : liste des fiches d'activités
enseignants/enseignants.css   styles communs de l'espace (aucune ressource externe)
enseignants/fiches/           une fiche enseignant = un fichier HTML
README.md
```

## Ajouter une simulation

### Méthode recommandée : le socle

```
python3 tools/new-sim.py     # crée sims/<nom>.html depuis le gabarit et l'inscrit au catalogue
python3 tools/check.py       # contrôle avant la pull request
```

Le gabarit s'appuie sur `shared/simulabo.css` et `shared/simulabo.js` : même identité visuelle, thème clair/sombre, accessibilité de base, tableau de mesures, défi numérique. Mode d'emploi complet : [`docs/socle.md`](docs/socle.md).

### Méthode manuelle (simulation autonome)

1. Déposer le fichier dans `sims/`, par exemple `sims/refraction.html`.
2. Dans `index.html`, ajouter une entrée à la liste JSON `catalogue-data` :

```json
{
  "id": "refraction-lumiere",
  "titre": "Réfraction de la lumière",
  "resume": "Une phrase qui donne envie d'ouvrir la simulation.",
  "theme": "ondes",
  "niveau": "Seconde",
  "type": "Simulation",
  "duree": 15,
  "notions": ["Snell-Descartes", "indice de réfraction"],
  "statut": "dispo",
  "url": "sims/refraction.html",
  "date": "2026-11-05",
  "glyph": "refraction"
}
```

3. Ouvrir une pull request. Une fois fusionnée sur `main`, le site est mis à jour.

### Valeurs possibles

- `theme` : `matiere`, `mouvement`, `energie`, `ondes`
- `statut` : `dispo` (fiche cliquable) ou `prepa` (fiche « en préparation », sans lien)
- `glyph` (vignette) : `bench`, `chrono`, `chrono-droite`, `refraction`, `spectrum`, `beaker`, `titration`, `gas`, `circuit`, `orbit`, `pendulum`, `reaction`

## Contrôle automatique

`python3 tools/check.py` vérifie le catalogue (champs, doublons, fichiers présents, vignettes), la liste de l'espace enseignant, et la charte de chaque simulation. Les simulations qui utilisent le socle sont contrôlées strictement ; les plus anciennes ne produisent que des avertissements (polices externes, sans thème sombre, etc.), à traiter simulation par simulation.

Pour lancer ce contrôle à chaque pull request, copier `tools/github-actions-check.yml` vers `.github/workflows/check.yml` (à faire par le propriétaire du dépôt).

## Hébergement

Le site est statique. Il peut être publié avec GitHub Pages : Settings, Pages, Source « Deploy from a branch », branche `main`, dossier `/ (root)`.

## Espace enseignant

L'espace `enseignants/` regroupe des fiches d'activités : programme visé, déroulé, réponses attendues (repliées), difficultés fréquentes, accessibilité, limites et prolongements, sources. Chaque fiche s'imprime ou s'enregistre en PDF.

Les fiches sont publiques, corrections comprises : l'espace n'est pas protégé par un mot de passe.

### Ajouter une fiche

1. Copier `enseignants/fiches/modele-fiche.html` en `enseignants/fiches/<identifiant>.html` et le remplir (les consignes sont en commentaire en tête du fichier). Marquer « À vérifier » tout ce qui ne l'est pas.
2. Dans `index.html`, ajouter le champ `"fiche": "enseignants/fiches/<identifiant>.html"` à l'entrée du catalogue : un lien « Fiche enseignant » apparaît sur la carte.
3. Dans `enseignants/index.html`, renseigner `"fiche": "fiches/<identifiant>.html"` (avec `resume`, `programme` et `duree_txt`) pour la simulation dans la liste `fiches-data`.
4. Ouvrir une pull request.
