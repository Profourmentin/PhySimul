# La gamme Verrerie : une seule façon de dessiner le matériel de chimie

Les simulations de chimie montrent de la verrerie : burette, fiole jaugée, erlenmeyer, réfrigérant. Avant la gamme, chaque simulation la redessinait à la main, avec ses propres traits, ses propres couleurs et, en thème sombre, parfois un gris sur gris presque invisible. La gamme `shared/verrerie.js` dessine chaque pièce une seule fois, en SVG, pour les thèmes clair et sombre. **C'est la référence visuelle (« bible visuelle ») de toute simulation de chimie.**

Galerie interactive : [`docs/verrerie.html`](verrerie.html). On y règle les niveaux, les solutions, le volume versé.

## Utiliser la gamme

```html
<script src="../shared/verrerie.js"></script>
```

Aucune feuille de style à ajouter : les couleurs et les classes de dessin sont injectées au premier appel, limitées aux éléments `svg.verrerie`.

| Besoin | Appel | Résultat |
|---|---|---|
| Une pièce seule (icône, schéma) | `Verrerie.svg("becher", { niveau: .5, solution: "cuivre" })` | Chaîne `<svg>` autonome avec son `aria-label` |
| Une vignette de menu | `Verrerie.svg("pipetteJaugee", { decoratif: true })` | Même dessin, sans étiquette (`aria-hidden`) : le texte voisin porte le sens |
| Une pièce dans une scène | `Verrerie.g("burette", { volume: 3.2 }, x, y)` | Groupe `<g>` à insérer dans un `<svg class="verrerie">` ; `(x, y)` est le centre de la base |
| Un montage complet | `Verrerie.montage("titrage", { volume: 8.4, legendes: true })` | `<svg>` du montage |
| Les listes | `Verrerie.familles()`, `.pieces()`, `.montages()`, `.solutions()`, `.nom(id)`, `.options(id)` | Pour construire un menu ou une liste de matériel |

Une scène de simulation (paillasse, fond, étiquettes propres à la tâche) est un `<svg class="verrerie" viewBox="…">` dans la page, qui assemble les pièces avec `Verrerie.g`. Les couleurs du fond, des textes et des chiffres viennent du socle (`--bg`, `--ink`, `--muted`) ; celles du matériel viennent des variables `--v-*`.

## Les règles de dessin

1. **Un seul trait** : épaisseur 2,5, extrémités arrondies, ni dégradé ni ombre portée. Le verre est un aplat bleuté translucide avec un reflet blanc. Le liquide est un aplat avec un ménisque concave.
2. **Origine à la base** : chaque pièce est dessinée avec l'origine au centre de sa base, les `y` négatifs vers le haut. On pose un bécher, une burette ou un ballon par leur point d'appui.
3. **Graduations lisibles** : petits traits, grands traits tous les 5 ou 10. Le trait de jauge est rouge et c'est le seul élément de cette couleur. Les chiffres n'apparaissent que sur la burette.
4. **Aucune couleur dans les formes** : tout passe par des variables `--v-*` définies dans `shared/verrerie.js`, avec les mêmes noms en clair et en sombre. `tools/check.py` le vérifie.
5. **Légender sans redessiner** : une pièce se montre nue dans la simulation et légendée dans la fiche ou le bilan. Les légendes (traits horizontaux, texte aligné, convention des schémas de TP) sont ajoutées par le montage, jamais dessinées dans la pièce.
6. **Proportions schématiques** : burette et pipettes sont raccourcies, les rapports entre pièces d'une même famille sont conservés. Ce n'est pas un plan à l'échelle.

## Les pièces

L'identifiant (colonne de gauche) est celui qu'on passe à `Verrerie.svg` et `Verrerie.g`. Les niveaux et fronts vont de 0 à 1.

| Identifiant | Pièce | Options |
|---|---|---|
| `eprouvette` | Éprouvette graduée | `niveau`, `solution` |
| `fiole` | Fiole jaugée | `niveau`, `solution`, `bouchon` |
| `pipetteJaugee` | Pipette jaugée | `niveau`, `solution`, `traits` (1 ou 2) |
| `pipetteGraduee` | Pipette graduée | `niveau`, `solution` |
| `propipette` | Propipette (valves A, S, E) | aucune |
| `burette` | Burette graduée 0 à 25 mL | `volume` (mL lu), `solution` |
| `balance` | Balance | `lecture` (texte affiché) |
| `thermometre` | Thermomètre | `temperature` (0 à 110 °C) |
| `electrode` | Électrode de pH | aucune |
| `becher` | Bécher | `niveau`, `solution` |
| `erlenmeyer` | Erlenmeyer | `niveau`, `solution` |
| `tubeEssai` | Tube à essais | `niveau`, `solution` |
| `verreMontre` | Verre de montre | `solide` |
| `entonnoir` | Entonnoir | `filtre`, `niveau`, `solution` |
| `pissette` | Pissette | aucune |
| `spatule` | Spatule | aucune |
| `ballon` | Ballon à col rodé | `niveau`, `solution` |
| `refrigerant` | Réfrigérant à boules (eau entrée en bas, sortie en haut) | aucune |
| `ampoule` | Ampoule à décanter | `haut`, `bas`, `solutionHaut`, `solutionBas` |
| `cuveCCM` | Cuve et plaque de CCM | `front`, `taches`, `solution` |
| `fioleVide` | Fiole à vide | `niveau`, `solution` |
| `buchner` | Entonnoir Büchner, joint et papier filtre | `solide`, `niveau`, `solution` |
| `agitateur` | Agitateur magnétique | `actif` |
| `barreau` | Barreau aimanté | aucune (utilisé par les montages) |
| `chauffeBallon` | Chauffe-ballon | `actif` |
| `supportElevateur` | Support élévateur | aucune |
| `statif` | Statif | `hauteur`, `base` |
| `pince` | Noix et pince | `distance`, `y`, `pas` |

## Les solutions

Sept teintes, passées dans l'option `solution` : `eau`, `cuivre` (bleu), `permanganate` (violet), `fer` (orangé : ions fer III, dichromate), `jaune`, `vert` (indicateurs colorés) et `organique` (phase organique). Chaque teinte a un aplat translucide (`--v-<nom>`) et un trait plus soutenu (`--v-<nom>-t`) pour que le niveau reste lisible quand la couleur est pâle.

La couleur ne porte jamais seule l'information : la consigne ou la légende nomme la solution.

## Les montages

| Montage | Appel | Options |
|---|---|---|
| Titrage direct | `Verrerie.montage("titrage", {…})` | `volume` (mL lu), `solutionBurette`, `solution`, `niveau`, `agite`, `legendes` |
| Chauffage à reflux | `Verrerie.montage("reflux", {…})` | `solution`, `niveau`, `chauffe`, `legendes` |
| Filtration sous vide | `Verrerie.montage("filtration", {…})` | `solide`, `niveau`, `niveauFiole`, `solution`, `legendes` |

Un montage est un point de départ : une simulation qui veut animer une pièce (faire descendre le liquide de la burette, faire bouillir le ballon) assemble ses propres pièces avec `Verrerie.g` et garde le montage de référence pour les schémas légendés.

## Accessibilité

- Chaque `<svg>` porte `role="img"` et un `aria-label` en français (nom de la pièce ou description du montage). `alt` le remplace quand la scène a besoin d'une description plus précise : dire ce qui est visible **et** ce qu'on peut régler.
- Une vignette dans un menu est décorative (`decoratif: true`) : le libellé voisin porte le sens.
- Contrastes des traits (seuil de 3:1 pour un élément graphique) mesurés sur le fond de page : verre 6,97:1 en clair et 8,76:1 en sombre ; métal 4,72:1 et 7,93:1. Les aplats de liquide ne portent pas de texte et leur trait est plus soutenu.
- Les pièces ne sont pas interactives par elles-mêmes. Une pièce que l'élève choisit ou manipule est enveloppée dans un vrai `button` ou un élément avec `tabindex`, comme n'importe quel autre contrôle du socle.

## Ajouter une pièce

1. Dessiner dans `shared/verrerie.js`, dans `P`, une fonction `P.nom = function (o) { … }` qui renvoie `{ g, w, h, x0 }` (largeur, hauteur au-dessus de l'origine, abscisse gauche ; `bas` si la pièce descend sous l'origine). Utiliser les classes existantes (`go`, `gf`, `gr`, `gt`, `gj`, `gm`, `gp`…) et les briques `liquide`, `verre`, `trait`, `reflet`, `graduations`.
2. Déclarer son nom français dans `NOMS`, sa famille dans `FAMILLES` et ses options dans `OPTIONS`.
3. Ajouter une ligne au tableau ci-dessus et à la galerie (`docs/verrerie.html`, tableau `REG`).
4. `python3 tools/check.py` : aucune couleur codée dans les formes, toutes les variables définies en clair et en sombre, toutes les pièces documentées.
5. Regarder la pièce en clair et en sombre, à 390 px et à 1100 px, avant la pull request.

Une nouvelle teinte de solution ajoute deux variables (`--v-<nom>` et `--v-<nom>-t`) dans `CLAIR` **et** `SOMBRE`, et une ligne dans `SOLUTIONS`.

## Simulations à migrer vers la gamme

Une simulation à la fois, une pull request par simulation, avec le skill `migrer-simulation-socle` : la physique et la pédagogie ne changent pas, seules les images du matériel sont remplacées, et les valeurs affichées restent identiques avant et après.

| Priorité | Simulation | Ce qui est dessiné à la main aujourd'hui | Pièces de la gamme | Point d'attention |
|---|---|---|---|---|
| 1 | `sims/titrage.html` | Scène `#scene` (560 × 620) : statif, burette, erlenmeyer, agitateur ; pipette jaugée avec propipette (80 × 250) ; pictogrammes du choix du matériel (`ICONS`, 46 × 58) ; loupe sur le ménisque (250 × 200) | montage `titrage`, `pipetteJaugee`, `propipette`, `fiole`, `becher`, `eprouvette`, `balance`, `entonnoir`, `thermometre`, `pissette` | Le volume versé reste calculé par le modèle ; la loupe de lecture du ménisque doit être redessinée avec les mêmes graduations |
| 1 | `sims/dissolution-dilution.html` | Scène (560 × 400, deux variantes `diss` et `dil`) : fiole jaugée, béchers, pipette ; loupe sur le ménisque ; choix du matériel de la phase 2 | `fiole`, `becher`, `pipetteJaugee`, `pipetteGraduee`, `propipette`, `eprouvette`, `balance`, `entonnoir`, `pissette`, `spatule`, `thermometre`, `erlenmeyer`, `agitateur` | La phase « Choisir le matériel » compare des objets : chaque pictogramme garde un libellé (la couleur ne suffit pas) |
| 1 | `sims/synthese-savon.html` | Scène de reflux (440 × 520) et scènes d'étape (360 × 260) : trois éprouvettes graduées, ballon chauffé, bécher d'eau salée, filtration sous vide, tube à essais avec mousse, pesée | montage `reflux`, `eprouvette`, `ballon`, `becher`, montage `filtration`, `tubeEssai`, `balance` | Les pictogrammes de danger ne sont pas de la verrerie et restent tels quels ; le montage à reflux est celui que les élèves doivent légender |
| 2 | `shared/glyphs.js` : `flask`, `titration`, `reflux` | Trois vignettes d'accueil (200 × 120) | Silhouettes de `fiole`, `burette` + `erlenmeyer`, `refrigerant` + `ballon` | Les glyphes suivent leurs propres règles (`docs/glyphes.md` : sans texte, couleurs du thème) ; on reprend les silhouettes, pas les pièces |
| 3 | Toute nouvelle simulation de chimie | | | Prendre la verrerie dans la gamme ; ajouter la pièce manquante à la gamme dans une pull request distincte |

**État vis-à-vis du socle** (relevé de `python3 tools/check.py`) : `titrage` et `dissolution-dilution` n'utilisent pas encore `shared/simulabo.css`, alors que `synthese-savon` est déjà sur le socle. Pour les deux premières, la migration vers le socle (skill `migrer-simulation-socle`) précède celle vers la gamme, ou les deux sont faites dans l'ordre au sein de deux pull requests successives ; pour `synthese-savon`, seule la gamme est à appliquer.

Hors périmètre : les simulations de chimie abstraites (`equation-reactif-limitant`, `tableau-avancement`, `oxydoreduction`, `combustion`, `polarite-liaisons-molecules`, `lewis-geometrie`, `structure-electronique`, `cristaux-maille`) ne montrent pas de verrerie ; `gaz-parfaits` dessine une seringue dans un canvas, qui pourrait devenir une pièce `seringue` si la simulation est reprise ; les fiches enseignant ne contiennent pas de schéma de verrerie.

## Limites connues

- Les conventions de schéma (légendes horizontales, jauge rouge) sont les usages courants des manuels et des TP, pas un texte officiel. Ce que les programmes demandent (BO spécial n° 1 du 22 janvier 2019) est de savoir schématiser et légender un dispositif, choisir la verrerie adaptée, réaliser un titrage, un reflux, une filtration, une extraction : les montages de la gamme couvrent ces gestes mais ne remplacent pas les schémas normalisés de la fiche de TP.
- Les proportions sont schématiques : on ne mesure rien sur un dessin de la gamme.
- Contraste mesuré sur les traits du verre et du métal, pas sur chaque teinte de liquide.
- Les lecteurs d'écran n'ont pas été testés sur les étiquettes des pièces.
- Pas encore de loupe de lecture du ménisque ni de pièces animées (écoulement, ébullition) : à ajouter avec la migration du titrage et de la dissolution.
