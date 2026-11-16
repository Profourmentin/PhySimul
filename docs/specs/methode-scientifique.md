# Spécification : la démarche scientifique à la française dans les parcours de simulation

| | |
|---|---|
| Statut | Proposition, à valider par Mathieu avant généralisation |
| Date | 16 novembre 2026 |
| Remplace | la séquence **P·O·E** (Prédire, Observer, Expliquer) |
| Par | les cinq compétences **APP · ANA · RÉA · VAL · COM** |
| Documents liés | `docs/specs/audit-methode-scientifique.md` (audit de l'existant), `docs/socle.md`, `enseignants/fiches/modele-fiche.html` |

## 1. Pourquoi changer

**P·O·E** (Predict, Observe, Explain) est une séquence d'origine anglo-saxonne, utile pour faire émerger des conceptions initiales. Elle ne décrit pas ce que les programmes français demandent aux élèves :

- elle n'a **aucune place pour s'approprier** une situation (problématique, schéma, recherche d'information) ;
- elle confond **réaliser** (mesurer, calculer, mettre en œuvre un protocole) et **observer** ;
- elle réduit **valider** à « expliquer » : or le programme demande d'identifier des sources d'erreur, d'estimer une incertitude, de comparer à une valeur de référence, de confronter un modèle aux résultats ;
- elle ignore **communiquer** : aucune production de l'élève n'est attendue, ni à l'écrit ni à l'oral ;
- c'est une **suite d'étapes**, alors que le programme précise que l'ordre de présentation des compétences « ne préjuge en rien de celui dans lequel les compétences sont mobilisées ».

Les fiches enseignant du site citent déjà les cinq compétences (« Compétences mobilisées : s'approprier, analyser et raisonner… »), mais la page élève, elle, ne montre que « Prédire, Observer, Expliquer ». Le site parle donc deux langages. Cette spécification les unifie sur celui du programme.

## 2. Référentiel officiel

Source : programme de physique-chimie de la classe de Seconde générale et technologique et de la classe de Première, enseignement de spécialité (BO spécial n° 1 du 22 janvier 2019), préambule, « Les compétences travaillées dans le cadre de la démarche scientifique ». Les deux textes présentent le même tableau (vérifié sur les deux annexes). Les capacités ci-dessous sont des **exemples** : le programme précise qu'ils ne forment pas un cadre rigide.

| Code | Compétence | Exemples de capacités associées (texte du programme) |
|---|---|---|
| **APP** | S'approprier | Énoncer une problématique. Rechercher et organiser l'information en lien avec la problématique étudiée. Représenter la situation par un schéma. |
| **ANA** | Analyser / Raisonner | Formuler des hypothèses. Proposer une stratégie de résolution. Planifier des tâches. Évaluer des ordres de grandeur. Choisir un modèle ou des lois pertinentes. Choisir, élaborer, justifier un protocole. **Faire des prévisions à l'aide d'un modèle.** Procéder à des analogies. |
| **RÉA** | Réaliser | Mettre en œuvre les étapes d'une démarche. Utiliser un modèle. Effectuer des procédures courantes (calculs, représentations, collectes de données, etc.). Mettre en œuvre un protocole expérimental en respectant les règles de sécurité. |
| **VAL** | Valider | Faire preuve d'esprit critique, procéder à des tests de vraisemblance. Identifier des sources d'erreur, estimer une incertitude, comparer à une valeur de référence. Confronter un modèle à des résultats expérimentaux. Proposer d'éventuelles améliorations de la démarche ou du modèle. |
| **COM** | Communiquer (à l'écrit comme à l'oral) | Présenter une démarche de manière argumentée, synthétique et cohérente. Utiliser un vocabulaire adapté et choisir des modes de représentation appropriés. Échanger entre pairs. |

Autres passages du programme sur lesquels s'appuie ce document :

- « Le niveau de maîtrise de ces compétences dépend de l'autonomie et de l'initiative requises » : fonde les **niveaux d'autonomie** (section 5).
- Le programme met « particulièrement en avant la pratique expérimentale et l'activité de modélisation » : fonde la place du **modèle** en ANA, RÉA et VAL.
- Rubrique « Mesure et incertitudes » : « Expliquer qualitativement la signification d'une incertitude-type et l'évaluer par une approche statistique » : fonde le rôle du **bruit de mesure** (`shared/bruit.js`) en VAL.

Remarque d'usage : les abréviations APP, ANA, RÉA, VAL, COM ne figurent pas dans le programme. Ce sont celles que les enseignants emploient couramment dans les grilles de TP. Le site les utilise comme **codes courts à côté du nom complet**, jamais seuls dans l'interface élève.

## 3. Principes

1. **Une compétence n'est pas une étape.** Une animation n'impose pas APP → ANA → RÉA → VAL → COM. Un parcours peut boucler (RÉA puis VAL qui renvoie à ANA : « mon modèle ne colle pas, je change d'hypothèse »). Le site **étiquette** les tâches avec des compétences, il ne les enchaîne pas de force.
2. **La prédiction est conservée, mais rangée en ANA.** Elle est un moyen d'*analyser* : formuler une hypothèse, faire une prévision à l'aide d'un modèle. On garde donc le moment « avant de manipuler, je prévois » (conceptions initiales, engagement de l'élève), et on lui donne un nom du programme.
3. **Valider, c'est confronter.** Une tâche VAL met l'élève devant un écart (mesure contre modèle, mesure contre valeur de référence, prévision contre résultat) et lui demande de le juger, pas seulement de lire « juste » ou « faux ».
4. **Communiquer, c'est produire.** Une tâche COM aboutit à une trace de l'élève (phrase argumentée, schéma, tableau, graphique légendé, carnet copiable), pas à un clic sur une réponse.
5. **Honnêteté de l'étiquette.** On n'affiche une compétence que si l'élève l'exerce vraiment dans la tâche. Une animation qui ne travaille pas COM ne prétend pas le faire ; la fiche enseignant dit comment le compléter hors page (voir section 6).
6. **Autonomie progressive.** Mêmes compétences, aide variable : niveau guidé, intermédiaire, autonome (modèle : `vitesse-son.html`, « Choisis ton niveau d'autonomie »).
7. **Pas de couleur par compétence.** Sur le site, une couleur désigne une grandeur physique (`docs/socle.md`). Les puces de compétence sont neutres, avec le code **et** le nom en texte.

## 4. Les cinq compétences dans une animation

Pour chaque compétence : ce que fait l'élève, ce que l'animation doit fournir, la trace attendue.

### APP : s'approprier
- **L'élève** : lit la situation, énonce la question à résoudre, repère les grandeurs utiles, passe de l'énoncé au schéma.
- **L'animation fournit** : une situation contextualisée (document, mesure historique, expérience filmée ou simulée), un schéma ou un montage à lire, une consigne qui pose la **problématique** sous forme de question ; au niveau autonome, l'élève la reformule.
- **Trace** : la question reformulée, la liste des grandeurs connues et cherchées, un schéma légendé.
- **À éviter** : un énoncé qu'il suffit de survoler avant de cliquer sur « Commencer ».

### ANA : analyser, raisonner
- **L'élève** : formule une hypothèse, prévoit ce que donnera le modèle (ancien « Prédire »), choisit une loi ou un modèle, élabore ou justifie un protocole, évalue un ordre de grandeur, raisonne par analogie.
- **L'animation fournit** : une prédiction **engageante** (choix argumenté, valeur ou allure chiffrée, degré de certitude) *avant* la manipulation ; un choix de matériel ou de méthode ; un retour qui oriente sans dire « faux » (voir fiche `champs-cuve-pesanteur`).
- **Trace** : la prévision, datée, conservée pour être relue en VAL.
- **À éviter** : une prédiction à trois options dont une est absurde ; une prédiction qui n'est jamais relue ensuite.

### RÉA : réaliser
- **L'élève** : règle, manipule, mesure, relève, calcule, trace, applique un protocole en respectant les règles de sécurité.
- **L'animation fournit** : un geste réaliste (instruments avec leurs lectures bruitées, verrerie, protocole à ordonner), un tableau de mesures, des représentations à construire par l'élève.
- **Trace** : le tableau de mesures, la courbe, le calcul posé.
- **À éviter** : un calcul fait à la place de l'élève ; une mesure exacte alors qu'un instrument réel ne l'est pas.

### VAL : valider
- **L'élève** : compare à une valeur de référence, confronte le modèle aux mesures, repère des sources d'erreur, estime une incertitude, teste la vraisemblance d'un résultat, propose une amélioration.
- **L'animation fournit** : le **bruit de mesure** par défaut (interrupteur « Modèle théorique » pour isoler le modèle), une valeur ou un modèle de comparaison, un écart à interpréter, une question du type « ce résultat est-il plausible, pourquoi ? » ; la prévision de l'étape ANA à relire.
- **Trace** : un jugement argumenté (« l'écart de 3 % reste compatible avec l'incertitude de lecture parce que… »).
- **À éviter** : un verdict binaire « Bravo / Raté » ; une tolérance de correction plus étroite que le bruit (règle 3 du socle).

### COM : communiquer
- **L'élève** : présente sa démarche et son résultat de façon argumentée, synthétique, cohérente, avec un vocabulaire et des représentations adaptés ; échange avec ses pairs.
- **L'animation fournit** : une production à rédiger ou à compléter (phrase de conclusion, légende de graphique, compte rendu structuré), un **carnet copiable** (modèle : « Copier mon carnet » dans `datation-radioactive.html`), un lien partageable qui rouvre la même situation (modèle : « Copier le lien de cette situation »), une consigne d'échange entre pairs en classe.
- **Trace** : le carnet, la conclusion rédigée, la version imprimée.
- **À éviter** : un « bilan » que l'élève ne fait que lire.

## 5. Parcours

Un **parcours** est la façon dont une animation (ou une série d'animations) organise les compétences. Trois formes sont admises ; la fiche enseignant déclare celle qui s'applique.

| Forme | Description | Exemple |
|---|---|---|
| **Guidé** | Tâches ordonnées, chacune étiquetée ; déblocage progressif possible | `datation-radioactive`, `champs-cuve-pesanteur` |
| **En boucle** | Les mêmes outils sont accessibles en permanence ; l'élève passe de RÉA à VAL puis revient à ANA ; la consigne de l'enseignant structure | `gaz-parfaits`, `loi-ohm` |
| **Autonomie à niveaux** | Un même objectif, trois niveaux d'aide : *guidé* (étapes et rappels), *intermédiaire*, *autonome* (problématique et protocole à construire) | `vitesse-son` |

Règles de conception d'un parcours :

1. **Couverture minimale.** Une « Simulation » ou un « Jeu » travaille **au moins trois compétences**, dont **ANA ou VAL**. Un « Exerciseur » (entraînement à une procédure) peut ne travailler que RÉA et VAL ; il le déclare, et la fiche indique l'activité qui le complète.
2. **La prévision est relue.** Toute tâche ANA de prévision est reprise dans une tâche VAL (« tu avais prévu…, tu mesures… »).
3. **Le bruit sert VAL.** Toute grandeur mesurée est bruitée (`shared/bruit.js`) et au moins une tâche demande d'en tirer parti : estimer l'incertitude, juger un écart.
4. **Une trace par parcours.** Au moins une tâche COM produit une trace exportable (copie, lien ou impression).
5. **Interdiction de la porte « Valider mon choix » seule.** Un bouton de validation n'est pas la compétence VAL : il vérifie une réponse. Il est donc étiqueté RÉA ou ANA selon ce qu'il contrôle.

## 6. Mise en œuvre sur le site

### 6.1 Page élève : la puce de compétence
Une puce neutre, en tête de tâche :

```html
<span class="comp" data-comp="ana"><abbr title="Analyser / Raisonner">ANA</abbr> · Prévoir</span>
```

- `data-comp` ∈ `app`, `ana`, `rea`, `val`, `com`.
- Le texte après le code est un **verbe d'action** adressé à l'élève (Prévoir, Mesurer, Comparer, Conclure…), pas un nom d'étape.
- Une tâche peut porter deux puces (RÉA puis VAL), jamais plus.
- Style : `shared/simulabo.css`, section 16 « Puces de compétence ».

### 6.2 Fiche enseignant
- Le tableau du déroulé a une colonne **Compétence** (à la place de « Démarche ») qui indique les codes de chaque tâche.
- Le bloc **« Compétences mobilisées »** devient une **grille de couverture** : pour chaque compétence, la tâche qui la travaille ou, à défaut, la proposition d'activité hors page (APP : faire lire le document ; COM : demander la conclusion à l'oral).
- Le modèle `enseignants/fiches/modele-fiche.html` impose cette structure.

### 6.3 Catalogue (étape suivante, non faite dans ce document)
Champ optionnel `competences` dans `catalogue-data` : `["APP","ANA","RÉA","VAL","COM"]`, sous-ensemble réellement travaillé. Usages : badge sur la carte, filtre « Compétence » de la page catalogue, vérification par `tools/check.py` (avertissement si une « Simulation » en déclare moins de trois).

### 6.4 Chantier v2-beta (PR #30, brouillon)
La bêta contient un composant `Simulabo.poe` (prédiction avec degré de certitude), son CSS (`.poe*`), le badge `P·O·E` des cartes, la page « À propos » (« La démarche Prédire, Observer, Expliquer ») et le pilote `periode-frequence`. À reprendre :

| Élément | Devient |
|---|---|
| `Simulabo.poe(host, options)` | `Simulabo.prevoir(host, options)` : composant de prévision **ANA**, avec relecture automatique en VAL |
| CSS `.poe*` | `.prevoir*`, ou intégration à la section 16 des puces |
| Drapeau catalogue `poe` | `competences` (6.3) |
| Badge `P·O·E` | liste de puces de compétence |
| Page « À propos » | « La démarche scientifique : s'approprier, analyser, réaliser, valider, communiquer » |
| Pilote `periode-frequence` | pilote de la nouvelle méthode (APP à ajouter, COM à ajouter) |

Le **degré de certitude** de la bêta est une bonne idée à garder : il nourrit VAL (« j'étais sûr de moi et je me suis trompé : qu'est-ce que cela m'apprend ? »).

## 7. Correspondance ancien / nouveau

| Ancien (P·O·E et variantes du site) | Nouveau |
|---|---|
| Prédire, Hypothèse, Prédiction | **ANA** (formuler une hypothèse, faire une prévision à l'aide d'un modèle) |
| Observer, Explorer, Expérience, Mesurer, Calculer | **RÉA** (collectes de données, procédures courantes, utiliser un modèle) |
| Modéliser | **ANA** (choisir un modèle) puis **RÉA** (l'utiliser) |
| Expliquer, Comparer, Conclure (quand l'élève confronte) | **VAL** |
| Expliquer, Conclure (quand l'élève rédige) | **COM** |
| Transférer | **ANA** (analogie, nouvelle stratégie) avec **RÉA** et **VAL** |
| (rien) | **APP** : à créer dans la plupart des animations |

## 8. Critères d'acceptation d'une animation

Une animation respecte cette spécification quand :

- [ ] chaque tâche porte une puce de compétence (une ou deux) ;
- [ ] la fiche enseignant a la colonne Compétence et la grille de couverture ;
- [ ] la couverture minimale est atteinte (section 5, règle 1) ou la dérogation est écrite ;
- [ ] la prévision est relue en VAL, le bruit est exploité en VAL ;
- [ ] une trace COM est exportable ;
- [ ] aucune puce ne promet une compétence que la tâche ne fait pas exercer ;
- [ ] les mots « Prédire / Observer / Expliquer » n'apparaissent plus comme noms d'étapes (le verbe « prédire » reste libre dans une consigne).

## 9. Feuille de route

| Phase | Contenu | État |
|---|---|---|
| 0 | Cette spécification, l'audit, les puces `.comp`, le modèle de fiche, le renommage des étiquettes P·O·E dans les pages et fiches existantes | **Fait dans la PR de ce document** |
| 1 | Champ `competences` dans le catalogue, badge, filtre, contrôle par `tools/check.py` | À faire |
| 2 | Combler les trous APP et COM des animations « Simulation » (priorités dans l'audit) | À faire |
| 3 | Composant `Simulabo.prevoir` et trace d'élève commune (carnet exportable) | À faire |
| 4 | Reprise de la v2-beta (6.4) | À faire |

## 10. Limites de ce document

- L'audit est une **lecture structurelle** (titres, tâches, textes de consigne, fiches). Il n'a pas été confronté à un passage en classe : les niveaux de couverture sont à discuter.
- Les codes à cinq lettres sont une convention d'usage, pas un texte officiel.
- Le tableau des compétences a été vérifié dans les programmes de physique-chimie de Seconde et de Première spécialité. Les programmes de Terminale et d'**enseignement scientifique** (concerné par `datation-radioactive`) n'ont pas été relus : leur texte est à vérifier avant d'y appliquer la grille.
- Les codes de compétence attribués aux tâches des fiches enseignant existantes sont une **proposition** de l'audit, à relire.

## Sources

- Programme de physique-chimie de la classe de Seconde générale et technologique, BO spécial n° 1 du 22 janvier 2019 : https://cache.media.education.gouv.fr/file/SP1-MEN-22-1-2019/98/9/spe634_annexe_1062989.pdf
- Programme de physique-chimie de la classe de Première, enseignement de spécialité, BO spécial n° 1 du 22 janvier 2019 : https://cache.media.education.gouv.fr/file/SP1-MEN-22-1-2019/43/2/spe635_annexe_1063432.pdf
