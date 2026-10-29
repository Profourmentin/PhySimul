# PhySimul

Projet de page web hébergeant des simulations interactives pour la physique-chimie.

Chaque simulation est un fichier HTML autonome. La page d'accueil (`index.html`) affiche un catalogue avec recherche, filtres par thème, niveau et type.

## Structure

```
index.html                    page d'accueil et catalogue
sims/                         une simulation = un fichier HTML autonome
enseignants/index.html        espace enseignant : liste des fiches d'activités
enseignants/enseignants.css   styles communs de l'espace (aucune ressource externe)
enseignants/fiches/           une fiche enseignant = un fichier HTML
README.md
```

## Ajouter une simulation

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
