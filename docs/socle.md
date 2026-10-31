# Le socle Simulabo : créer une simulation sans repartir de zéro

Le socle garantit que toutes les simulations ont la même identité, la même ergonomie et les mêmes règles d'accessibilité, et il évite de recopier à chaque fois les mêmes centaines de lignes de CSS et de JavaScript.

| Élément | Rôle |
|---|---|
| `shared/simulabo.css` | Jetons de design (couleurs clair/sombre, typographie système), mise en page, boutons, onglets, curseurs, afficheurs, zone d'observation, tableau de mesures, impression |
| `shared/simulabo.js` | Briques JavaScript : `Simulabo.slider`, `readout`, `tabs`, `observe`, `canvas`, `loop`, `measureTable`, `defi`, `shareState`, `fmt` |
| `templates/simulation.html` | Gabarit complet et fonctionnel, qui sert de point de départ |
| `tools/new-sim.py` | Crée la simulation depuis le gabarit et l'inscrit au catalogue |
| `tools/check.py` | Contrôle de cohérence (catalogue, fichiers, charte, accessibilité mécanique) |
| `tools/github-actions-check.yml` | Lance le contrôle à chaque pull request (à installer par le propriétaire du dépôt) |

## Créer une simulation en 5 étapes

1. **Lancer** `python3 tools/new-sim.py` (mode interactif) ou donner les options : `--titre`, `--theme`, `--niveau`, `--resume`, `--duree`, `--notions`, `--glyph`.
2. **Ouvrir** `sims/<nom>.html` : le gabarit contient une démonstration (signal sinusoïdal). Garder l'en-tête, la zone d'observation, le pied de page ; remplacer le bloc entre `DÉMO` et `FIN DE LA DÉMO`.
3. **Composer** l'interface avec les briques (voir ci-dessous) et dessiner la scène dans le canvas.
4. **Contrôler** : `python3 tools/check.py`. Zéro erreur est la condition de fusion.
5. **Ouvrir la pull request.** Si la simulation est destinée aux élèves en autonomie, préparer la fiche enseignant (voir le README, « Ajouter une fiche »).

## Les briques JavaScript

Toutes sont dans l'objet global `Simulabo` (variable locale conseillée : `var S = Simulabo;`).

| Brique | Exemple | Ce qu'elle apporte |
|---|---|---|
| `slider` | `S.slider("#hote", {label:"Distance", unit:"m", min:0, max:10, step:.1, value:5, digits:1, onInput:fn})` | Curseur étiqueté, valeur affichée en français, `aria-valuetext` avec l'unité |
| `readout` | `var r = S.readout("#hote", {label:"Puissance", unit:"W", digits:2}); r.set(3.14)` | Afficheur de type LCD, lisible par un lecteur d'écran |
| `tabs` | `S.tabs("#groupe", fn, "valeur")` | Choix unique entre situations (boutons `.tab` avec `data-mode`) |
| `observe` | `S.observe("#obs", "ok", "<b>Bien vu.</b> …")` | Retour textuel annoncé (`aria-live`), 4 tons : `ok`, `warn`, `info`, `bad` |
| `canvas` | `S.canvas("#cv", {width:1000, height:400, draw:fn})` | Canvas net sur écran Retina, repère logique fixe, redessiné si le thème change |
| `loop` | `var b = S.loop(function(dt){…}); b.start()` | Animation en pause quand l'onglet est masqué ; `dt` plafonné |
| `measureTable` | `S.measureTable("#hote", {columns:[…]})` puis `t.add({…})` | Tableau de mesures avec export CSV directement lisible dans un tableur français |
| `defi` | `S.defi("#hote", {question:"…", answer:200, tolerance:.02, hint:"…", explain:"…"})` | Question numérique avec indice et retour qui oriente (virgule ou point acceptés) |
| `shareState` | `S.shareState({A:2, T:4})` | Lien qui conserve les réglages (`#A=3&T=2`) : l'enseignant partage une situation précise. Rien n'est envoyé à un serveur |
| `fmt`, `sig`, `parseNum` | `S.fmt(-3.14159, 2)` donne `−3,14` | Affichage français et chiffres significatifs |

Le détail des paramètres est en commentaire en tête de chaque fonction dans `shared/simulabo.js`.

## Règles de charte (ce que le contrôle vérifie, ce qu'il ne peut pas vérifier)

Vérifié automatiquement pour toute simulation qui utilise le socle :

- `lang="fr"`, `meta viewport`, un titre, **un seul `h1`**, un élément `<main>` ;
- **aucune ressource externe** (polices, CDN, images distantes) : le site fonctionne hors ligne et ne transmet aucune donnée d'élève à un tiers ;
- lien de retour vers le catalogue ;
- chaque `canvas` a un `aria-label`, chaque image un `alt` ;
- pas de marque `{{…}}` ni de bloc `DÉMO` laissé du gabarit.

À vérifier à la main (aucun outil ne le fait à votre place) :

- **Parcours au clavier** : tout est atteignable avec `Tab`, le focus est visible, aucune action n'exige la souris ou un geste précis.
- **L'information ne passe pas seulement par la couleur** : ajouter un mot, une icône ou un motif.
- **Cibles tactiles** d'au moins 44 px (déjà le cas des boutons du socle).
- **Texte alternatif utile** : le `aria-label` d'un canvas décrit ce que l'on voit et ce que l'on peut régler, pas « graphique ».
- **Conformité au programme** : vérifier les notions, les notations et le vocabulaire contre le programme officiel du niveau visé (BO spécial n° 1 du 22 janvier 2019 pour le lycée général et technologique) et marquer « À vérifier » ce qui ne l'est pas dans la fiche enseignant.
- **Pédagogie** : une simulation n'enseigne rien seule. Prévoir une consigne d'observation, un moment de prédiction avant l'expérience, et au moins une question qui oblige à interpréter (c'est le rôle du `defi` et de la zone d'observation).

## Conventions communes

- **Une couleur = une grandeur** sur tout le site (variables `--c-force`, `--c-vitesse`, `--c-position`, `--c-energie`, `--c-temps`).
- **Une couleur de thème** par domaine du programme (`--t-matiere`, `--t-mouvement`, `--t-energie`, `--t-ondes`), reprise par la pastille du `kicker`.
- **Nombres à la française** : virgule décimale, vrai signe moins, espace fine avant l'unité.
- **Symboles et unités jamais en majuscules forcées** : `text-transform: uppercase` transformerait « mV » en « MV » (mégavolt) ou « Hz » en « HZ ». Le socle ne l'applique donc ni aux libellés des afficheurs ni aux en-têtes de tableau.
- **Polices hébergées sur le site** (`shared/fonts/`, licence SIL OFL 1.1) : Barlow Semi Condensed pour les titres, IBM Plex Sans pour le texte, IBM Plex Mono pour les valeurs. Aucun appel à Google Fonts ni à un CDN : pas de transmission de l'adresse IP des élèves, utilisable hors ligne. Les polices sont déclarées dans `shared/fonts.css`, chargé automatiquement par `simulabo.css`. Une simulation hors socle ajoute simplement `<link rel="stylesheet" href="../shared/fonts.css">`. Poids disponibles : Barlow 500, 600, 700 ; Plex Sans 400 à 600 ; Plex Mono 400, 500, 600. Un autre poids est remplacé par le plus proche : ne pas en demander d'autres sans ajouter le fichier.
- **Couleurs propres à une simulation** : variable locale dans le `<style>` de la page, définie en clair et en sombre, jamais redéfinition des jetons du socle.

## Faire évoluer le socle

Le socle est partagé : toute modification touche toutes les simulations qui l'utilisent. Règles :

1. Ne jamais renommer ni supprimer une variable CSS ou une fonction existante sans migrer les simulations concernées dans la même pull request.
2. Ajouter plutôt que modifier : une nouvelle variable, une nouvelle fonction.
3. Mettre à jour le numéro `version` de `shared/simulabo.js` et cette page.
4. Ouvrir chaque simulation concernée dans un navigateur (clair et sombre) avant de fusionner.

## Migrer une simulation existante

Les onze premières simulations ont leur propre CSS et JavaScript. Elles continuent de fonctionner et le contrôle les signale par des avertissements, sans bloquer. Pour en migrer une :

1. remplacer son bloc `:root { … }` et les composants communs par `<link rel="stylesheet" href="../shared/simulabo.css">` (garder dans le `<style>` seulement ce qui lui est propre) ;
2. supprimer les liens vers Google Fonts (déjà fait pour les simulations existantes : elles chargent `shared/fonts.css`) ;
3. ajouter le lien de retour, le `lang="fr"`, les `aria-label` des canvas ;
4. comparer avant et après sur téléphone, en clair et en sombre.

Une simulation à la fois, une pull request par simulation.
