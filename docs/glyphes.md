# Les glyphes : une vignette par simulation

Chaque carte de l'accueil montre une petite scène dessinée en SVG, le **glyphe**. Tous les glyphes sont dans `shared/glyphs.js`. Le catalogue (`index.html`) ne contient que le **nom** du glyphe (champ `glyph`).

## Principe de conception

Une vignette est le **premier contact** de l'élève ou du collègue avec la simulation. Elle doit donc :

1. **montrer ce que l'on manipule ou observe** dans la simulation (une lentille et ses rayons, un pendule, une seringue), pas un décor générique ;
2. **être exacte en physique** : un vecteur est une flèche, un rayon est fléché, un nombre d'électrons est le bon ;
3. **rester lisible à 300 px de large** : peu d'éléments, trait épais, aucun texte ;
4. **être unique** : deux simulations ne partagent pas le même dessin (le contrôle le signale).

Les glyphes sont décoratifs (`aria-hidden`) : le titre de la carte porte le sens. Les schémas normalisés du programme (BO spécial n° 1 du 22 janvier 2019) restent ceux des simulations elles-mêmes ; la vignette n'est pas un support de cours.

## Les glyphes actuels

| Glyphe | Ce qu'il représente | Simulation |
|---|---|---|
| `bench` | Banc d'optique, source, cellule inclinée | Banc d'optique photovoltaïque |
| `lens` | Lentille convergente, foyers, trois rayons, image renversée | Lentilles : foyers et construction d'images |
| `titration` | Burette, goutte, erlenmeyer | Titrage colorimétrique |
| `reaction` | Profil d'énergie d'une réaction | Combustion et énergie de liaison |
| `redox` | Transfert d'électrons d'un réducteur à un oxydant | Équilibrer une réaction d'oxydoréduction |
| `cycloid` | Roue qui roule, trajectoire d'un point, vecteur vitesse | Description d'un mouvement |
| `flask` | Fiole jaugée et cristaux qui se dissolvent | Dissolution et dilution |
| `chrono-droite` | Positions régulières d'un mobile, vitesse constante | Principe d'inertie |
| `orbit` | Astre, satellite, force d'attraction | Interaction gravitationnelle |
| `pendulum` | Pendule écarté de sa position d'équilibre | Énergie d'un pendule |
| `refraction` | Interface, normale, rayon dévié | Réfraction de la lumière |
| `spectrum` | Raies d'émission | Spectres lumineux |
| `circuit` | Générateur et conducteur ohmique | Loi d'Ohm |
| `gas` | Seringue, piston, molécules | Loi des gaz parfaits |
| `decay` | Dé, courbe exponentielle, demi-vies | Décroissance radioactive |
| `atom` | Couches électroniques, place du huitième électron | Structure électronique |
| `velocity` | Chronophotographie, corde, vecteur vitesse | Construire un vecteur vitesse |
| `signal` | Signal périodique et sa période | Signaux sonores périodiques |
| `balance` | Balance à deux plateaux, mêmes atomes de chaque côté | Équilibrer une équation, réactif limitant |
| `champ` | Deux plaques, équipotentielles pointillées, lignes de champ, sonde | Cartographier un champ : de la cuve à la pesanteur |
| `graph` | Graphe de mesures (**repli** pour un nom inconnu) | — |
| `chrono`, `beaker` | Anciens noms génériques, **à ne plus utiliser** | — |

## Ajouter un glyphe

1. Dans `shared/glyphs.js`, ajouter `add("nom", function () { var s = ""; … return s; });`.
2. Dessiner dans le repère **200 × 120** avec les seules classes du site : `s` (structure, couleur du thème), `dash` (pointillé), `f` (plein), `v` (grandeur mesurée, ambre), `water` (remplissage léger), `beam`, `sun`. Aucune couleur écrite en dur : le mode sombre et les thèmes en dépendent.
3. Ne dessiner **aucun texte**.
4. Donner ce nom au champ `glyph` de l'entrée du catalogue (`new-sim.py --glyph nom`).
5. `python3 tools/check.py` : erreur si le nom n'existe pas, avertissement s'il est déjà utilisé.
6. Regarder la vignette en clair et en sombre avant la pull request.

## Remplacer un glyphe par une illustration

Si l'on préfère une illustration (produite par IA ou par un graphiste), ajouter à l'entrée du catalogue :

```json
"image": "assets/vignettes/titrage.webp",
"image_dark": "assets/vignettes/titrage-sombre.webp"
```

`image_dark` est facultatif. L'image remplace le glyphe ; si le fichier ne charge pas, le glyphe reste affiché. Format : WebP, 1000 × 600 px, moins de 60 Ko. Les prompts prêts à l'emploi sont dans `docs/glyphes-prompts.md`. **Garder le glyphe SVG** pour les schémas dont la justesse se mesure (rayons, angles).
