# Audit du site au regard de la démarche scientifique (APP · ANA · RÉA · VAL · COM)

Annexe de `docs/specs/methode-scientifique.md`. Date : 16 novembre 2026. Périmètre : les 19 animations disponibles sur la branche principale, leurs fiches enseignant, le catalogue, le modèle de fiche et la branche v2-beta.

**Méthode et limite.** Lecture structurelle : titres, consignes, tâches, retours affichés et fiches enseignant, relus un à un. Aucun passage en classe : les niveaux sont des **propositions à discuter**, pas des mesures.

Légende : **●** la compétence est exercée par l'élève dans une tâche identifiable ; **◐** présente mais guidée, partielle ou implicite ; **○** absente ou non vérifiable dans la page.

## 1. Constats d'ensemble

1. **Le site parle deux langages.** Les fiches enseignant listent les cinq compétences du programme (5 fiches sur 7 fiches d'animation, hors modèle, ont une ligne « Compétences mobilisées » ; les fiches `datation-radioactive` et `equation-reactif-limitant` n'en ont pas), tandis que les pages élèves et le déroulé des fiches utilisent « Prédire, Observer, Expliquer » et des variantes (Explorer, Mesurer, Conclure, Transférer, Modéliser, Comparer…), avec **dix verbes d'étape différents** selon les fiches (Prédire, Observer, Expliquer, Explorer, Mesurer, Calculer, Modéliser, Comparer, Conclure, Transférer).
2. **COM est le grand absent.** Bilan : 1 animations sur 19 le travaillent pleinement, 8 partiellement, 10 pas du tout. La seule vraie production de l'élève est le « carnet de fouille » de `datation-radioactive`.
3. **APP est rarement travaillée.** Seules 2 animations demandent à l'élève de s'approprier la situation ; ailleurs, la page propose directement des curseurs. L'élève n'énonce presque jamais la problématique.
4. **VAL est forte là où le bruit de mesure et une référence existent** (loi d'Ohm, gaz parfaits, champs, titrage, signaux, vitesse du son) et faible quand tout est calculé (lentilles, combustion, oxydoréduction).
5. **ANA est bien servie par la prédiction**, mais la prévision est rarement **relue** ensuite : le retour est un message « prédiction juste / à corriger », pas une confrontation chiffrée avec l'incertitude.
6. **L'ordre est souvent imposé** (missions verrouillées, étapes numérotées), alors que le programme précise que l'ordre de présentation des compétences ne préjuge pas de l'ordre de mobilisation.
7. **Excellents points d'appui à généraliser** : les niveaux d'autonomie de `vitesse-son`, le bruit global et son interrupteur « Modèle théorique », la tolérance liée au bruit de `champs-cuve-pesanteur`, le carnet copiable de `datation-radioactive`, les liens de situation partageables.

## 2. Grille de couverture par animation

| Animation | Niveau | Type | APP | ANA | RÉA | VAL | COM | Remarque |
|---|---|---|:-:|:-:|:-:|:-:|:-:|---|
| `banc-optique-photovoltaique` | Seconde | Simulation | ○ | ○ | ● | ◐ | ○ | Mesures bruitées et tableau ; aucune prévision ni conclusion demandée. |
| `lentilles-foyers-images` | Seconde | Simulation | ◐ | ○ | ◐ | ○ | ○ | Construction d'images ; pas de prévision, pas d'écart à juger. |
| `dissolution-dilution` | Seconde | Simulation | ● | ● | ● | ◐ | ○ | Protocole à ordonner, matériel à choisir, manipulation réaliste ; tolérance de 1 %, pas de jugement d'incertitude. |
| `principe-inertie` | Seconde | Simulation | ○ | ◐ | ● | ◐ | ◐ | Chronophotographie à mesurer, comparaison avec et sans frottements ; document élève imprimable. |
| `description-mouvement` | Seconde | Simulation | ◐ | ● | ◐ | ◐ | ○ | Prévoir la trajectoire puis regarder ; cours interactif plus qu'investigation. |
| `spectres-lumineux` | Seconde | Simulation | ◐ | ◐ | ◐ | ◐ | ○ | Identification d'un gaz par comparaison aux spectres de référence ; pas de bruit instrumental ni de conclusion rédigée. |
| `signaux-sonores-periodiques` | Seconde | Simulation | ◐ | ● | ● | ● | ○ | Prévoir puis mesurer la période ; lecture sur plusieurs motifs pour réduire l'incertitude. |
| `loi-ohm` | Seconde | Simulation | ◐ | ◐ | ● | ● | ◐ | Mesures bruitées, modèle linéaire à confronter ; « Ma réponse » à justifier ; prévision faite hors page. |
| `structure-electronique-mission-stabilite` | Seconde | Jeu | ◐ | ● | ◐ | ◐ | ◐ | « Prédis puis vérifie » en boucle, « Explique » ; contexte de mission. |
| `construction-vecteur-vitesse` | Seconde | Exerciseur | ◐ | ◐ | ● | ◐ | ◐ | Construction et vérification ; copie de la trace et du lien de l'exercice. |
| `equilibrer-une-equation-reactif-limitant` | Seconde | Simulation | ◐ | ● | ● | ◐ | ○ | Prédire puis faire réagir ; pas de production écrite. |
| `vitesse-propagation-son` | Seconde | Simulation | ● | ● | ● | ● | ◐ | Mesure historique (APP), protocole, deux méthodes, comparaison à une valeur de référence, trois niveaux d'autonomie. Meilleure couverture du site. |
| `equilibrer-oxydoreduction` | Première spé | Exerciseur | ○ | ○ | ● | ◐ | ○ | Exerciseur d'écriture d'équations : RÉA et validation d'étape. |
| `combustion-energie-liaison` | Première spé | Simulation | ○ | ◐ | ◐ | ○ | ○ | Modèle d'énergies de liaison manipulé ; peu d'écart ou de confrontation. |
| `titrage-colorimetrique` | Première spé | Simulation | ◐ | ◐ | ● | ● | ○ | Manipulation réaliste, incertitude-type, comparaison à la valeur de référence, sources d'erreur. |
| `tableau-d-avancement` | Première spé | Simulation | ◐ | ● | ● | ◐ | ◐ | Prévoir le réactif limitant, calculer x_max ; conclusion « totale ou non ». |
| `gaz-parfaits-mariotte` | Première spé | Simulation | ◐ | ◐ | ● | ● | ◐ | Mesures bruitées, P × V constant « aux incertitudes près » ; défi de calcul. |
| `champs-cuve-pesanteur` | Première spé | Simulation | ◐ | ● | ● | ● | ◐ | Prédictions relues, tolérance liée au bruit, conclusions de mission ; sept missions. |
| `decroissance-radioactive-carbone-14` | Première | Simulation | ◐ | ● | ● | ◐ | ● | Prédire, observer, mesurer la demi-vie, dater ; seul « carnet de fouille » copiable du site. |
| **Total ●** | | | 2 | 9 | 14 | 6 | 1 | |
| **Total ◐** | | | 13 | 7 | 5 | 11 | 8 | |
| **Total ○** | | | 4 | 3 | 0 | 2 | 10 | |

## 3. Audit des éléments transversaux

| Élément | Constat | Décision |
|---|---|---|
| Étiquettes sur les pages élèves | `tableau-avancement`, `signaux-periodiques`, `vecteur-vitesse`, `datation-radioactive` affichent « Prédire / Observer / Expliquer » comme noms d'étapes | Remplacées par des puces de compétence (PR de la spécification) |
| Fiches enseignant | Colonne « Démarche » avec des vocabulaires disparates ; la ligne « Compétences mobilisées » est un paragraphe sans lien avec les tâches | Colonne « Compétence » avec codes ; grille de couverture dans le modèle de fiche |
| Modèle de fiche | Propose « Prédire, Observer, Mesurer, Expliquer, Transférer » en exemple | Corrigé pour guider vers APP / ANA / RÉA / VAL / COM |
| Catalogue | Aucune information sur les compétences | Champ `competences` (phase 1, non fait) |
| Composant bêta `Simulabo.poe` (v2-beta, PR #30) | Séquence P·O·E à trois temps, prédiction avec degré de certitude | À rebaptiser et élargir (section 6.4 de la spécification) ; non modifié ici car la branche n'est pas fusionnée |
| Page « À propos » (v2-beta) | Présente « La démarche Prédire, Observer, Expliquer » | À réécrire avec les cinq compétences (idem) |
| Socle (`docs/socle.md`) | Parle de « moment de prédiction avant l'expérience » dans la règle de pédagogie | Reformulé en termes de compétences, avec renvoi à la spécification |
| Bruit de mesure | Déjà un levier fort pour VAL, mais aucune tâche ne demande de s'en servir explicitement | À exploiter dans les tâches VAL (spécification, section 5, règle 3) |

## 4. Priorités de travail sur les animations

Classement selon l'écart entre ce que fait l'animation et la couverture minimale (au moins trois compétences dont ANA ou VAL, plus une trace COM).

**Priorité 1 : ajouter une trace COM et une étape APP à des animations déjà solides en RÉA/VAL**
- `loi-ohm`, `gaz-parfaits-mariotte`, `titrage-colorimetrique`, `signaux-sonores-periodiques`, `banc-optique-photovoltaique` : ajouter un carnet de mesures copiable et une conclusion argumentée (COM), et une problématique à reformuler (APP).

**Priorité 2 : ajouter ANA et VAL là où l'animation se limite à manipuler**
- `lentilles-foyers-images` (prévoir la position de l'image avant de construire, confronter à la relation de conjugaison), `combustion-energie-liaison` (prévoir le signe du bilan énergétique, comparer à une valeur tabulée), `banc-optique-photovoltaique` (prévoir l'allure de P en fonction de la distance).

**Priorité 3 : alléger les parcours verrouillés et relire les prévisions**
- `datation-radioactive` et `champs-cuve-pesanteur` : autoriser le retour en arrière entre ANA, RÉA et VAL ; relire chaque prévision dans une tâche VAL chiffrée.

**Priorité 4 : exerciseurs**
- `equilibrer-oxydoreduction`, `construction-vecteur-vitesse` : déclarer la couverture partielle dans la fiche et indiquer l'activité qui la complète (problème ouvert, compte rendu oral).

**Modèle à généraliser** : `vitesse-propagation-son` (APP historique, protocole, deux méthodes, comparaison à la référence, niveaux d'autonomie).
