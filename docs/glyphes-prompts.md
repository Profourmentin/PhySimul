# Catalogue de prompts — vignettes illustrées des simulations

Ce fichier sert à produire, avec un générateur d'images par IA, des **illustrations de remplacement** des glyphes SVG de l'accueil. Il est facultatif : le site fonctionne très bien avec les glyphes (`shared/glyphs.js`). Il est utile si l'on veut des vignettes plus riches, ou pour les simulations à venir.

## Principe

1. Choisir un générateur, coller le **prompt de base** puis la **scène** de la simulation, et le **prompt négatif** s'il existe.
2. Exporter en **WebP, 1000 × 600 px** (rapport 5:3, c'est le format de la vignette), moins de 60 Ko.
3. Déposer le fichier dans `assets/vignettes/<id>.webp` (et `<id>-sombre.webp` pour le mode sombre, facultatif).
4. Ajouter dans l'entrée du catalogue : `"image": "assets/vignettes/<id>.webp"` (et `"image_dark": …`). Le glyphe reste en secours si l'image ne charge pas.
5. Relire la vignette avec la grille « Contrôle » ci-dessous, puis ouvrir la pull request. `python3 tools/check.py` vérifie que le fichier existe.

## Prompt de base (à coller avant chaque scène)

```
Flat vector illustration in the style of a clean scientific textbook diagram, minimalist, thick rounded line strokes of uniform width, simple solid shapes, no gradients, no shadows, no 3D, no text, no letters, no numbers, no labels, no logos, no watermark, single centered subject with generous margins, landscape 5:3 format, subtle graph-paper grid in the background
```

À la suite : `Palette: <couleur du thème> lines and shapes, amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: <scène>.`

## Prompt négatif (si le générateur l'accepte)

```
text, letters, numbers, equations, captions, labels, watermark, signature, logo, photorealistic, 3D render, gradient, drop shadow, glow, blur, clutter, people, faces, hands, cartoon characters, extra objects, border, frame
```

## Palettes par thème

| Thème | Couleurs à donner au générateur |
|---|---|
| Constitution et transformations de la matière | teal #0E7566 on pale mint #DDF0EC ; accent ambre #B56F00 |
| Mouvement et interactions | blue #1B5E8C on pale blue #DCEAF4 ; accent ambre #B56F00 |
| L'énergie : conversions et transferts | dark orange #A65F00 on pale cream #FBEBCB ; accent ambre #B56F00 |
| Ondes et signaux | violet #6244A0 on pale lilac #E9E2F5 ; accent ambre #B56F00 |

**Variante sombre** (facultative) : même dessin, fond bleu nuit très foncé (#0B1117), traits en tons clairs du thème (vert d'eau, bleu ciel, ambre vif, lavande). Les valeurs exactes sont dans `index.html` (variables `--t-*` et `--tb-*`).

## Exigences communes (didactique et accessibilité)

- **Aucun texte dans l'image** : le titre de la carte porte le sens, et les IA écrivent mal (fautes, symboles inventés). Le `alt` est vide, l'image est décorative.
- **La couleur ne porte pas seule le sens** : une flèche reste une flèche, même en niveaux de gris.
- **Une couleur = une grandeur** : l'ambre est réservé aux grandeurs mesurées ou représentées par une flèche (vecteurs, rayons, courbes de mesure).
- **Respecter les conventions du programme** : vecteurs représentés par des flèches, symboles normalisés des composants électriques, rayons lumineux fléchés. Une illustration fausse en physique est plus nocive qu'une illustration absente.
- **Lisible en petit** : la vignette s'affiche à environ 300 px de large. Peu d'éléments, traits épais.
- **Droits** : vérifier les conditions d'usage du générateur (usage dans un site public, éducatif) et ne pas demander « dans le style de » un illustrateur ou une marque (ni PhET, ni un manuel).

## Fiabilité attendue

- **A** : sujet simple, une IA le réussit en général. Relire quand même.
- **B** : un détail est capital (nombre d'éléments, sens d'une flèche, symbole) et l'IA se trompe souvent. Générer 4 variantes, choisir, vérifier le détail avec la colonne « Contrôle ».
- **C** : schéma dont la justesse est mesurable (rayons, angles). **Garder le glyphe SVG**, qui est calculé.

## Contrôle d'une vignette avant publication

1. Le détail physique de la colonne « Contrôle » est-il exact ?
2. Aucun texte, chiffre ni lettre parasite ?
3. Lisible à 300 px de large ? En niveaux de gris ?
4. Cohérente avec les autres vignettes du même thème (même épaisseur de trait, mêmes couleurs) ?

## Les 18 vignettes du catalogue actuel

### Banc d'optique photovoltaïque

- Thème : L'énergie : conversions et transferts · glyphe actuel : `bench` · fiabilité : **B**
- Contrôle : Vérifier que la cellule est bien inclinée (c'est l'angle d'incidence qui est étudié).
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: side view of a graduated optical bench rail with evenly spaced tick marks; on the left a lamp casting a soft cone of light to the right; on the right a small flat photovoltaic cell on a stand, tilted at an angle to the light cone.
```

### Lentilles : foyers et construction d'images

- Thème : Ondes et signaux · glyphe actuel : `lens` · fiabilité : **C**
- À ne pas générer. Schéma de rayons : garder le SVG, un générateur n'a aucune garantie de tracer les trois rayons correctement.

### Titrage colorimétrique

- Thème : Constitution et transformations de la matière · glyphe actuel : `titration` · fiabilité : **A**
- Contrôle : Le virage de couleur est le sujet : la couleur rose peut être l'accent du dessin.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a graduated burette clamped on a stand above a conical flask, a single drop falling from the burette tip, the liquid in the flask is pale pink (accent colour), no hand.
```

### Combustion et énergie de liaison

- Thème : L'énergie : conversions et transferts · glyphe actuel : `reaction` · fiabilité : **B**
- Contrôle : Éviter la flamme réaliste : rester sur un trait simple.
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a small clean flame on a laboratory burner, next to a simplified energy-level diagram: a hill-shaped curve going down to a lower level, drawn in the same line style, with a downward arrow.
```

### Équilibrer une réaction d'oxydoréduction

- Thème : Constitution et transformations de la matière · glyphe actuel : `redox` · fiabilité : **A**
- Contrôle : Trois points exactement sont un détail que les IA respectent mal : vérifier.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: two round beakers side by side, a curved arrow above them going from the left one to the right one, carrying three small dots (electrons).
```

### Description d'un mouvement

- Thème : Mouvement et interactions · glyphe actuel : `cycloid` · fiabilité : **B**
- Contrôle : La cycloïde est difficile pour une IA : sinon garder le SVG.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a wheel rolling on a flat line, and the path traced by one point on its rim shown as a dashed series of arches, a small arrow tangent to the path at the point.
```

### Dissolution et dilution

- Thème : Constitution et transformations de la matière · glyphe actuel : `flask` · fiabilité : **A**
- Contrôle : La fiole jaugée (col long, un seul trait de jauge) est souvent confondue avec un erlenmeyer : vérifier.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a volumetric flask with a long narrow neck and a single gauge line on the neck, filled with transparent liquid, a few small square crystals dissolving at the bottom.
```

### Principe d'inertie

- Thème : Mouvement et interactions · glyphe actuel : `chrono-droite` · fiabilité : **A**
- Contrôle : Vérifier que l'espacement est régulier : c'est tout le propos.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a row of seven evenly spaced identical dots along a horizontal dashed line (chronophotograph of a puck sliding), and above it one horizontal arrow pointing right.
```

### Interaction gravitationnelle

- Thème : Mouvement et interactions · glyphe actuel : `orbit` · fiabilité : **A**
- Contrôle : Flèche dirigée vers l'astre attracteur.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a large round star on the left, a small satellite on a dashed elliptical orbit, a straight arrow from the satellite toward the star.
```

### Énergie d'un pendule

- Thème : L'énergie : conversions et transferts · glyphe actuel : `pendulum` · fiabilité : **A**
- Contrôle : Pas de fil de couleur, pas d'horloge.
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a pendulum: a straight rod from a fixed pivot at top right to a heavy round bob, the bob lifted to the left, a dashed vertical line through the pivot and a dashed arc showing the swing.
```

### Réfraction de la lumière

- Thème : Ondes et signaux · glyphe actuel : `refraction` · fiabilité : **B**
- Contrôle : Le rayon doit se rapprocher de la normale : vérifier le sens (milieu plus réfringent).
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a flat horizontal interface between two media, the lower medium tinted; a dashed vertical normal line; a straight ray coming from the upper left hitting the interface and continuing bent toward the normal in the lower medium.
```

### Spectres lumineux

- Thème : Ondes et signaux · glyphe actuel : `spectrum` · fiabilité : **A**
- Contrôle : Pas de dégradé continu : des raies fines.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a dark rectangular window with thin vertical coloured emission lines (violet, blue, cyan, green, yellow, red) of different positions.
```

### Loi d'Ohm

- Thème : Ondes et signaux · glyphe actuel : `circuit` · fiabilité : **B**
- Contrôle : Respecter les symboles normalisés (générateur, conducteur ohmique).
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a simple electric circuit drawn as a rectangle: a battery symbol on the left side, a resistor zigzag on top, and a small dot at the bottom marking the current.
```

### Loi des gaz parfaits : P·V = constante

- Thème : Mouvement et interactions · glyphe actuel : `gas` · fiabilité : **A**
- Contrôle : Seringue horizontale, piston à droite.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a transparent syringe lying horizontally, a plunger on the right, small dots moving inside with short motion tick marks, a thin line to a pressure sensor.
```

### Décroissance radioactive et datation au carbone 14

- Thème : Constitution et transformations de la matière · glyphe actuel : `decay` · fiabilité : **B**
- Contrôle : Les paliers de demi-vie doivent être réguliers : sinon SVG.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a round-cornered die showing three pips on the left, and on the right a curve decreasing exponentially from a vertical axis, with two dashed amber steps marking successive halvings.
```

### Structure électronique : mission stabilité

- Thème : Constitution et transformations de la matière · glyphe actuel : `atom` · fiabilité : **B**
- Contrôle : Compter les électrons : 2 puis 7 plus la place vide.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a nucleus dot at the center, two concentric dashed electron shells, small dots as electrons (two on the inner shell, seven on the outer shell) and one empty dashed circle for the missing eighth electron, a small arrow pointing to it.
```

### Construire un vecteur vitesse

- Thème : Mouvement et interactions · glyphe actuel : `velocity` · fiabilité : **B**
- Contrôle : La flèche doit être parallèle à la corde.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: nine dots along a dashed parabola (chronophotograph of a thrown ball), a dashed chord joining the dots before and after a highlighted dot, and an arrow starting at the highlighted dot parallel to the chord.
```

### Signaux sonores périodiques

- Thème : Ondes et signaux · glyphe actuel : `signal` · fiabilité : **A**
- Contrôle : La période = un motif complet, pas plus.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a sinusoidal wave across the frame with a dashed horizontal axis and, below, a horizontal bracket spanning exactly one period.
```

## Simulations du backlog (`claude/backlog-simulations-2026-11-07.md`)

Noms de glyphes réservés pour ces simulations : à dessiner en SVG (`shared/glyphs.js`) ou à remplacer par une image au moment de la mise en ligne.

### Référentiel et trajectoire

- Thème : Mouvement et interactions · nom de glyphe réservé : `referentiel` · fiabilité : **B**
- Contrôle : Deux trajectoires différentes du même objet.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a person-free scene: a toy train with a ball suspended inside, and beside it a fixed platform, with two different dashed trajectories of the ball drawn side by side (straight vertical vs curved).
```

### Réfraction (Snell-Descartes)

- Thème : Ondes et signaux · nom de glyphe réservé : `snell` · fiabilité : **C**
- À ne pas générer. Schéma d'angles : à dessiner en SVG pour la précision.

### Équilibrer une équation / réactif limitant

- Thème : Constitution et transformations de la matière · glyphe actuel : `equilibre` · fiabilité : **A**
- Contrôle : Sphères uniquement, pas de formules. Compter : 4 petites et 4 grosses sphères de chaque côté de la flèche.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: on the left, two pairs of small hollow spheres and two pairs of larger solid spheres; one arrow in the middle; on the right, two bent water-molecule models (one large solid sphere touching two small hollow spheres) and one pair of larger solid spheres left over. Same number of small spheres (4) and large spheres (4) on both sides.
```

### Interaction gravitationnelle et poids

- Thème : Mouvement et interactions · nom de glyphe réservé : `poids` · fiabilité : **A**
- Contrôle : Flèche du poids vers le centre.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a round planet with a small block resting on its surface and a downward arrow from the block toward the planet centre.
```

### Actions réciproques et bilan des forces

- Thème : Mouvement et interactions · nom de glyphe réservé : `forces` · fiabilité : **B**
- Contrôle : Deux flèches opposées de même longueur.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: two touching boxes, with two equal and opposite arrows at the contact point.
```

### Mesures et incertitudes

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `mesures` · fiabilité : **B**
- Contrôle : Barres d'erreur symétriques.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a ruler with a measured object and a horizontal error bar bracket at the reading, plus three scattered dots with small error bars.
```

### Dosage par étalonnage

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `etalonnage` · fiabilité : **A**
- Contrôle : Cinq teintes croissantes de la même couleur.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a row of five test tubes with increasing colour intensity (same hue, five tints) and a rising straight line above them.
```

### Capteur résistif et courbe d'étalonnage

- Thème : L'énergie : conversions et transferts · nom de glyphe réservé : `capteur` · fiabilité : **B**
- Contrôle : Courbe monotone (par exemple une thermistance) ; à ajuster selon le capteur retenu.
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a small sensor chip with two leads connected to a calibration curve falling from left to right.
```

### Énergie mécanique

- Thème : L'énergie : conversions et transferts · nom de glyphe réservé : `energie-meca` · fiabilité : **B**
- Contrôle : Barres empilées de même hauteur totale.
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a ball on a hill-shaped track at three positions, with stacked bars of two tones above each ball.
```

### Tableau d'avancement

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `avancement` · fiabilité : **B**
- Contrôle : Pas de chiffres : seulement des sphères.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a table-like grid of three rows made of molecule spheres, with the reactant spheres decreasing and the product spheres increasing row by row.
```

### Ondes mécaniques progressives

- Thème : Ondes et signaux · nom de glyphe réservé : `onde-meca` · fiabilité : **A**
- Contrôle : Perturbation transversale, une seule bosse.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a rope held horizontally with a single pulse travelling along it, a small arrow showing the direction, a dot on the rope moving vertically.
```

### Source réelle de tension / effet Joule

- Thème : L'énergie : conversions et transferts · nom de glyphe réservé : `joule` · fiabilité : **A**
- Contrôle : Lignes ondulées de chaleur au-dessus du résistor.
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a battery with a resistor, small wavy lines rising from the resistor (heat), a thermometer-free scene.
```

### Couleurs (synthèses additive et soustractive)

- Thème : Ondes et signaux · nom de glyphe réservé : `couleurs` · fiabilité : **A**
- Contrôle : Exception à la charte : cette vignette utilise rouge, vert et bleu (synthèse additive) ; le centre doit être blanc.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: three overlapping circles in a Venn arrangement showing additive colour mixing, with the central overlap pure white.
```

### Variation du vecteur vitesse et somme des forces

- Thème : Mouvement et interactions · nom de glyphe réservé : `dv-forces` · fiabilité : **B**
- Contrôle : Trois flèches de couleurs distinctes.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a ball on a curved dashed path, with a velocity arrow at two successive points and a small arrow showing their difference, plus a force arrow.
```

### Statique des fluides

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `fluides` · fiabilité : **A**
- Contrôle : Flèches de plus en plus longues avec la profondeur.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a tall transparent container of liquid with a small submerged pressure sensor, arrows of increasing length pointing inward with depth.
```

### Champs et loi de Coulomb

- Thème : Mouvement et interactions · nom de glyphe réservé : `coulomb` · fiabilité : **A**
- Contrôle : Les symboles plus/moins sont des signes, pas du texte.
```
Palette: blue #1B5E8C on pale blue #DCEAF4; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: two round charged spheres, one with a plus sign symbol (a plus drawn as two crossing lines), and the other with a minus (one line), and arrows between them.
```

### Vitesse du son

- Thème : Ondes et signaux · nom de glyphe réservé : `vitesse-son` · fiabilité : **B**
- Contrôle : Pas de chiffres sur l'horloge.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a speaker on the left emitting concentric arcs, a microphone on the right, a dashed line between them with a stopwatch-like round clock.
```

### Changement d'état et énergie

- Thème : L'énergie : conversions et transferts · nom de glyphe réservé : `etat` · fiabilité : **A**
- Contrôle : Deux paliers.
```
Palette: dark orange #A65F00 on pale cream #FBEBCB; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a heating curve with two flat plateaus, a small ice cube at the left and a water droplet at the right, a flame below.
```

### Réactions nucléaires (isotopes)

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `nucleaire` · fiabilité : **B**
- Contrôle : Deux tons de sphères (protons/neutrons).
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a heavy nucleus made of tightly packed two-tone spheres splitting into two smaller clusters with a small arrow.
```

### Mole et quantité de matière

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `mole` · fiabilité : **A**
- Contrôle : Une balance, des grains, pas de chiffres.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a balance with a pile of grains on one pan and a small flask on the other.
```

### Chromatographie sur couche mince

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `ccm` · fiabilité : **A**
- Contrôle : Trois taches à des hauteurs différentes.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a rectangular plate with three vertical spots of different heights and colours above a baseline, with a dashed line at the solvent front.
```

### Niveau d'intensité sonore

- Thème : Ondes et signaux · nom de glyphe réservé : `niveau-sonore` · fiabilité : **B**
- Contrôle : Cadran sans graduations numériques.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a sound-level meter with a needle on a semicircular scale and a speaker emitting arcs.
```

### Modèle de l'œil

- Thème : Ondes et signaux · nom de glyphe réservé : `oeil` · fiabilité : **B**
- Contrôle : Rayons convergents sur la rétine : vérifier.
```
Palette: violet #6244A0 on pale lilac #E9E2F5; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a side-view schematic of an eye: cornea, lens and retina, with two rays converging to a point on the retina.
```

### Géométrie et polarité (Lewis)

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `lewis` · fiabilité : **B**
- Contrôle : Molécule coudée.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a bent three-atom molecule (water-like) with a small arrow pointing from the middle atom to the side atoms.
```

### Loi de Beer-Lambert

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `beer-lambert` · fiabilité : **B**
- Contrôle : Faisceau plus faible à la sortie.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a light beam passing through a rectangular cuvette with coloured liquid, the beam dimmer on the exit side.
```

### Dissolution d'un solide ionique / solubilité / extraction

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `solubilite` · fiabilité : **B**
- Contrôle : Deux tons de points (ions +/−).
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a beaker with water and an ionic crystal cluster dissolving, small dots of two tones drifting away.
```

### Niveaux d'énergie et photon

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `niveaux` · fiabilité : **B**
- Contrôle : Flèches ondulées = photons.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a vertical ladder of four horizontal energy levels, a wavy arrow arriving and a wavy arrow leaving between two levels, a small dot on the upper level.
```

### Groupes caractéristiques et spectre infrarouge

- Thème : Constitution et transformations de la matière · nom de glyphe réservé : `infrarouge` · fiabilité : **B**
- Contrôle : Un seul pic marqué.
```
Palette: teal #0E7566 on pale mint #DDF0EC; amber #B56F00 only for measured quantities (arrows, rays, curves). Scene: a small molecule drawn with a highlighted group, and an infrared spectrum curve with one strong downward peak.
```

