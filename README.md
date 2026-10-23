# PhySimul

Projet de page web hébergeant des simulations interactives pour la physique-chimie.

Chaque simulation est un fichier HTML autonome. La page d'accueil (`index.html`) affiche un catalogue avec recherche, filtres par thème, niveau et type.

## Structure

```
index.html        page d'accueil et catalogue
sims/             une simulation = un fichier HTML autonome
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
- `glyph` (vignette) : `bench`, `chrono`, `chrono-droite`, `refraction`, `spectrum`, `beaker`, `gas`, `circuit`, `orbit`, `pendulum`

## Hébergement

Le site est statique. Il peut être publié avec GitHub Pages : Settings, Pages, Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
