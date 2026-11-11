# Archive — la première version de la Bible (chapitres 0 à 11, 2 novembre 2026)

**Ce fichier n'est plus à jour : il ne fait pas foi.** Il garde les chapitres 0 à 11 de `jeu/DESIGN-saison1.md` tels qu'ils étaient le 11 novembre,
quand Romain a demandé de faire le ménage (« Enlève tous les trucs obsolètes », 11 novembre, 8 h 11). Ils décrivent le jeu imaginé le 2 novembre :
le Corbeau, la grille de déduction, les coffres, les points d'action, les anciens talents et la boutique d'alors, l'ancienne enquête 2
(« Les lettres du Corbeau ») et l'ancienne enquête 3 (« Les feux du moulin », encore dans `src/e3.js`). Beaucoup a changé depuis :
ce qui fait foi, c'est la Bible elle-même (son chapitre 0 « Le jeu aujourd'hui », puis les chapitres 12 et 13).
Un renvoi « § 1 » à « § 11 » dans la Bible se lit ici.

---

# Les Enquêteurs de Brumeval — Saison 1

## Document de design, à valider avant de coder

Ce document s'ajoute à la bible du jeu. Les enquêtes, les données et la bible n'ont pas été modifiées. Dans le moteur, une seule chose a changé depuis la première version : Romain a figé le niveau des mini-jeux. Une fois le document validé, on s'en servira comme plan de construction.

**Deuxième version (2 novembre, au soir).** Elle intègre les décisions de Romain après sa première lecture. Elles sont résumées au chapitre 0 et listées au chapitre 11.

Trois mots reviennent tout au long du document :

- **Décidé** : c'est un choix de Romain. On ne le rediscute pas, on le met en œuvre.
- **Proposition** : c'est ma façon de le mettre en œuvre, avec des chiffres. Elle est à valider.
- **À trancher** : c'est une vraie question, que Romain doit décider. Toutes sont regroupées au chapitre 11.

Une notion sert partout : l'**indice clé de voûte**. C'est un indice sans lequel l'enquête n'a plus une seule solution. Si le mini-jeu qui le donne est raté pour de bon, l'équipe ne peut plus être sûre de la réponse.

---

## 0. En une page

Romain a relu la première version et tranché la plupart des questions. Ses décisions sont intégrées dans tout le document. Le chapitre 11 ne garde que ce qui reste ouvert.

- **Les mini-jeux sont durs dès l'enquête 1**, à leur niveau validé (presque toujours 10). **Ce niveau ne monte plus** d'une enquête à l'autre : c'est déjà fait dans le moteur. Seuls le matériel, les talents et les potions le baissent.
- **Les enquêtes deviennent plus dures.** L'enquête 1 reste simple. L'enquête 2 ajoute des menteurs, des fausses pistes et des indices à combiner. L'enquête 3 ajoute une troisième question : « QUI l'aide à porter les sacs ? » (c'est Basile). Les questions « POURQUOI » arrivent à partir de l'enquête 4.
- **Le filet de sécurité s'efface.** Un mini-jeu raté donne toujours un indice partiel à l'enquête 1, un indice plus flou à l'enquête 2, et un indice seulement pour les clés de voûte à l'enquête 3. Ensuite, plus rien.
- **3 cœurs d'accusation au début.** Je propose de passer à 2 cœurs à partir de l'enquête 6 (§ 2.1).
- **Zéro cœur, c'est la défaite** : toute l'équipe recommence à la création des personnages. « Abandonner » compte aussi comme une défaite. Tout repart à zéro, y compris la décoration de l'atelier et la garde-robe du Pisteur (décision du 3 novembre : « si on perd, c'est la fin de tout »). Chacun peut seulement reprendre la même apparence.
- **Les filets de secours :**
  - l'Élixir du Cœur vaillant rend un cœur au Sage. Il ne demande plus d'ingrédient rare, et sa recette est dans le Grand Livre dès l'enquête 3 ;
  - le Sage a trois pouvoirs pour aider ses équipiers, avec **un seul échange de code** : « Souffler », « Encore une fois ! » et « La Page des Fondateurs ». **La Page des Fondateurs est un joker très rare : une seule fois dans toute la saison, le Sage donne à un équipier le résultat d'un mini-jeu raté, comme s'il l'avait gagné.**
- **On achète et on revend quand on veut**, même au milieu d'une enquête. On revend à moitié prix.
- **Des chaînes entre les rôles** sont écrites dans les scénarios :
  - le fuyard attrapé par le Pisteur, puis démasqué par le Barde ;
  - les vieux plans du Sage, et les coffres que le Pisteur trouve au bout des passages secrets ;
  - les ingrédients rares ;
  - le grand ménage du labo ;
  - le bon mélange comme outil d'enquête ;
  - les nouvelles recettes qui arrivent par les autres rôles ;
  - les dépositions ;
  - la grille qui confirme un indice.
- **Le bon mélange est obligatoire dès l'enquête 3.** Si l'équipe n'a pas trouvé le coffret de teintures, Mélusine prête le sien.
- **L'enquête 3 est moins punitive** : 45 réponses possibles au lieu de 128. Même si un mini-jeu clé de voûte est raté pour de bon, l'équipe garde assez d'essais pour survivre, à condition d'avoir préparé l'élixir.
- **Une enquête tient dans une soirée.** Mes estimations (§ 1.4), à vérifier au chronomètre lors de la première partie :
  - 45 à 55 minutes pour l'enquête 1 ;
  - 55 à 70 minutes pour l'enquête 2 ;
  - 60 à 75 minutes pour l'enquête 3.
- **L'Alchimiste a moins à faire** : 3 mini-jeux obligatoires à l'enquête 2, 4 à l'enquête 3 (5 avec l'élixir). Le reste est facultatif.
- **La vérification** : les enquêtes 2 et 3 repassent tous les tests de mon programme de brouillon. Il y a une seule solution, chaque rôle est indispensable, et aucun joueur seul ne trouve le coupable.

---

## 1. La courbe de difficulté

### 1.1 Les mini-jeux : durs dès le début, et ils ne bougent plus (Décidé)

Chaque mini-jeu garde **le même niveau pour toute la saison** : celui que Romain a validé dans la salle d'entraînement. Le moteur le fait déjà.

| Mini-jeu | Niveau, de l'enquête 1 à la fin de la saison |
|---|---|
| 13 jeux (piste, cachette, bulles, différences, double, ménage, chaudron, mensonge, ragots, mots perdus, alphabet, plans, runes) | 10 |
| Tir à l'arc, Course-poursuite, Le bon mélange | 8 |
| La grille de déduction | 7 |
| Les dépositions (nouveau) | à régler dans la salle, puis figé de la même façon |

Seuls le matériel, les talents et les potions baissent ce niveau. Chacun enlève en général un à trois crans, ou ajoute une aide : une erreur permise, une zone plus large, plus de temps, un indice. L'enfant sent vraiment l'effet de son premier arc ou de ses premières bottes.

### 1.2 Les enquêtes : de plus en plus dures (Décidé)

| | Enquête 1 | Enquête 2 | Enquête 3 | Enquêtes 4 et 5 (prévu) |
|---|---|---|---|---|
| Questions à l'accusation | QUI + OÙ | QUI + OÙ | QUI + OÙ + QUI L'AIDE | QUI + OÙ + POURQUOI |
| Suspects (QUI) | 6 | 8 | 5 | 6 à 8 |
| Réponses possibles en tout | 24 | 32 | 45 | 50 à 100 |
| Faits qui servent à trouver | 7, liens directs | 9, à combiner | 10, dont 3 chemins de secours | |
| Habitants qui mentent | 0 | 4 | 4 | 5 et plus |
| Fausses pistes fortes | 2 | 5 | 5 | |
| Chaînes de codes entre plusieurs écrans | 3 | 5 | 5 | |
| Mini-jeux obligatoires pour toute l'équipe | 5 | 10 | 11 | |
| Moments de la journée | 3 | 4 | 4 | 4 |

À l'enquête 3, il y a moins de suspects qu'à l'enquête 2, mais trois questions au lieu de deux : 45 réponses possibles contre 32. La difficulté vient de la troisième question et des indices à croiser, pas du nombre de suspects.

### 1.3 Le filet qui s'efface (Décidé, chiffres en Proposition)

| | Enquête 1 | Enquête 2 | Enquête 3 | Enquêtes 4 et 5 | Enquêtes 6 à 9 |
|---|---|---|---|---|---|
| Un mini-jeu raté donne un indice partiel ? | Toujours, assez précis | Toujours, plus flou | Seulement pour les indices clés de voûte | Jamais | Jamais |
| On peut le rejouer ? | Oui, autant qu'on veut (1 action à chaque fois) | Oui, une fois de plus (1 action) | Oui, une fois de plus (1 action) | Non, un seul essai | Non |
| Pouvoirs de secours du Sage (§ 2.4) | Disponibles, rarement utiles | 1 « Souffler » et 1 « Encore une fois » | Pareil | Pareil | Pareil |
| La Page des Fondateurs | Une seule fois dans toute la saison (Décidé) | | | | |
| Cœurs d'accusation | 3 | 3 | 3 | 3 | 2 à partir de l'enquête 6 (Proposition) |

**Proposition, règle pour écrire les enquêtes à partir de l'enquête 4 :** pas plus de 3 indices clés de voûte par enquête, répartis sur 3 rôles différents. Une mauvaise soirée d'un seul joueur ne coule pas l'équipe. Une mauvaise soirée de toute l'équipe, si. C'est l'effet que Romain veut.

### 1.4 Une enquête, une soirée (Proposition)

Romain veut des soirées d'environ une heure à une heure et quart. Je n'ai pas de mesure d'une vraie partie, donc j'utilise un modèle simple, à vérifier au chronomètre lors de la première soirée :

- **l'ouverture** (la lettre, les missions, se répartir) : 5 minutes ;
- **chaque moment** : environ 4 minutes pour se parler, se dicter les codes et passer au moment suivant, plus le temps du joueur le plus chargé. Pour ce joueur, on compte environ 3 minutes par mini-jeu (consigne, démo, partie, résultat) et 1 minute par action simple ;
- **l'accusation et la fin** : 8 à 10 minutes ;
- on ajoute une marge pour les mini-jeux ratés qu'on rejoue, et pour une ou deux missions bonus.

| | Enquête 1 | Enquête 2 | Enquête 3 |
|---|---|---|---|
| Moments | 3 | 4 | 4 |
| Mini-jeux obligatoires pour toute l'équipe | 5 | 10 | 11 |
| Joueur le plus chargé, à chaque moment | 5 à 6 minutes | 4 à 7 minutes | 4 à 6 minutes |
| Calcul sans les ratés ni les bonus | environ 41 minutes | environ 53 minutes | environ 52 minutes |
| **Estimation pour une vraie soirée** | **45 à 55 minutes** | **55 à 70 minutes** | **60 à 75 minutes** |

Le détail moment par moment est dans chaque enquête.

**Les règles que je propose pour tenir dans la soirée (enquêtes 1 à 3) :**

- au plus 4 mini-jeux obligatoires par joueur ;
- au plus 2 mini-jeux pour un même joueur dans un même moment ;
- tout le reste (coffres, ingrédients rares, missions bonus, écoutes) est **facultatif**, et marqué comme tel ;
- si la première soirée dépasse 75 minutes, on enlève d'abord du facultatif, jamais un indice.

---

## 2. Échec, cœurs et mort des héros

### 2.1 Les cœurs d'accusation

Aujourd'hui, le Sage a trois essais. Après trois erreurs, le jeu donne la réponse, puis 70 points d'expérience et 20 pièces d'or, et la saison continue.

**Nouvelle règle (Décidé) :**

- Le Sage a **3 cœurs** au début de chaque enquête.
- Une accusation fausse fait perdre un cœur. On garde la petite phrase qui existe déjà : « Une partie de votre accusation est juste » ou « Rien n'est juste ». Avec trois questions à l'enquête 3, elle devient un vrai indice.
- **Zéro cœur, c'est la défaite** (§ 2.2).
- Ce qui protège un cœur existe déjà et reste comme avant :
  - le talent Runes de protection : une fausse accusation ne compte pas, une fois par enquête ;
  - le talent Stratège et la Boule de cristal : deux innocents sont rayés ;
  - et il y a désormais l'Élixir du Cœur vaillant (§ 2.3).

**Proposition : 3 cœurs pour les enquêtes 1 à 5, puis 2 cœurs à partir de l'enquête 6.** Romain a dit « à partir de l'enquête 7, ou même avant ». Je propose l'enquête 6, et pas plus tôt, pour trois raisons :

- **Les enquêtes 4 et 5 font déjà un grand pas** : plus d'indice partiel, un seul essai par mini-jeu, et les premières questions « POURQUOI ». Enlever un cœur en même temps, ce serait monter deux marches d'un coup.
- **À l'enquête 6, les héros sont mieux armés.** Ils sont autour du niveau 6 et ont plusieurs talents. L'Élixir du Cœur vaillant est connu depuis longtemps. La boutique propose déjà la Boule de cristal, qui raye deux innocents.
- **Avec 2 cœurs, l'élixir devient précieux** : il fait passer l'équipe de 2 à 3 essais.

L'étude d'équilibrage dira si c'est le bon moment. Ce sera peut-être l'enquête 5.

### 2.2 La défaite : tout recommencer (Décidé)

Quand le dernier cœur tombe :

1. **Sur l'écran du Sage**, deux ou trois images de fin perdue. Par exemple, pour l'enquête 2 : « Minuit sonne… La Grande Voix se tait. Au matin, la trappe est vide : le Corbeau a emporté la carte des souterrains. » Ensuite, pour toutes les enquêtes : « La brume entre dans le village et efface vos souvenirs… D'autres enquêteurs viendront. »
2. **Le Sage dit le code de la défaite** (3 symboles). Les trois autres le tapent et voient la même fin sur leur écran. Les tablettes ne sont pas reliées : c'est le seul moyen de prévenir tout le monde.
3. **Le Livre des Légendes.** Chaque écran inscrit son héros dans un petit mémorial gardé sur la tablette : son prénom, son rôle, son niveau, l'enquête atteinte et la date. On le voit depuis l'accueil.
4. **Le héros est effacé** : niveau, or, talents, objets, recettes, ingrédients, potions, outils de saison et calepin. L'équipe recommence à la création des personnages, puis à l'enquête 1.

**Ce qui reste après une défaite (Décidé)** :

- le Livre des Légendes ;
- ~~la décoration de l'atelier~~ : plus gardée depuis le 3 novembre. Tout repart à zéro, atelier et garde-robe du Pisteur compris ;
- un bouton **« Reprendre la même apparence »** à la création, pour chaque joueur.

**Les règles autour de la défaite :**

- **« Abandonner l'enquête » compte comme une défaite (Décidé).** Sinon, une équipe qui hésite avant d'accuser abandonne, rejoue et connaît déjà les indices. Le bouton « Retour au village (l'enquête est gardée) » reste, pour s'arrêter un soir et reprendre plus tard.
- **Proposition :** un avertissement clair avant la première enquête : « Si le Sage se trompe trop de fois, toute l'équipe perd ses héros. »
- La sauvegarde de secours (copier-coller) permettrait de tricher. On la laisse : c'est un jeu de famille, et c'est aux parents de voir.

### 2.3 L'Élixir du Cœur vaillant (potion de l'Alchimiste)

| | |
|---|---|
| Effet | Le Sage regagne 1 cœur d'accusation, sans jamais dépasser 3. |
| Limite | Une seule par enquête. |
| Qui la boit | Le Sage, depuis l'écran d'accusation : « Boire l'élixir ». |
| Recette (Proposition) | 2 miel, 1 pensée sauvage, 1 eau ; à la fin, la potion reste dans la zone ROUGE du chaudron. **Plus d'ingrédient rare.** |
| D'où vient la recette | À l'enquête 2, Iris la raconte au Barde (code de recette pour l'Alchimiste). À partir de l'enquête 3, elle est aussi dans le Grand Livre du Sage : c'est une recette secrète, qu'il lit à voix haute, comme l'encre révélatrice. |
| On peut la préparer à l'avance | L'Alchimiste garde ses potions d'une enquête à l'autre : elle peut préparer l'élixir à l'enquête 2 et le donner à l'enquête 3. |
| Comment elle circule | L'Alchimiste la prépare au chaudron, puis donne son code au Sage, qui la garde dans son sac. |

**Pourquoi plus d'ingrédient rare :** Romain veut que l'élixir soit vraiment disponible à l'enquête 3. Avec de la poussière de lune, il dépendait d'un coffre facultatif. Il reste difficile à obtenir : il faut une action, une partie de chaudron à la zone rouge, et une fiole. Il n'est **jamais nécessaire** pour résoudre une enquête. C'est une assurance qu'on prépare à l'avance.

### 2.4 Les pouvoirs de secours du Sage

Le Sage est le chef d'enquête : c'est lui qui rattrape les équipiers qui ont raté. Ces trois pouvoirs n'ont pas besoin de talent, tous les Sages les ont.

| Pouvoir | Ce qu'il fait | Combien de fois |
|---|---|---|
| **Souffler** | L'équipier reçoit l'indice partiel d'un mini-jeu raté, même dans les enquêtes où les indices partiels ont disparu. | 1 fois par enquête |
| **Encore une fois !** | L'équipier rejoue un mini-jeu raté, sans dépenser d'action, même quand la règle dit « un seul essai ». Il marche aussi pour le grand ménage du labo. | 1 fois par enquête |
| **La Page des Fondateurs** | **C'est un joker très rare : une seule fois dans toute la saison, le Sage donne à un équipier le résultat d'un mini-jeu raté, comme s'il l'avait gagné** (avec l'objet et le code s'il y en a). | 1 fois par saison (Décidé) |

**Les pouvoirs que l'on gagne en plus** (Proposition, avec des talents et objets qui existent déjà) :

- le talent Inspiration donne +1 « Encore une fois ! » par enquête, en plus de l'action donnée ;
- l'objet Bannière de l'équipe donne aussi +1 « Encore une fois ! » par enquête ;
- l'ensemble Archiviste donne +1 « Souffler » par enquête.

**Comment le code circule : un seul échange (Décidé).** Les tablettes ne sont pas reliées.

1. Un équipier dit au Sage : « J'ai raté la farine renversée ! »
2. Le Sage ouvre la page « Pouvoirs de secours » de son Grand Livre. Il choisit un pouvoir et l'équipier : « Encore une fois ! », pour le Pisteur. Son écran montre un code à 3 symboles, et retire une utilisation du pouvoir.
3. L'équipier tape le code. Son écran affiche la liste de ses mini-jeux ratés dans cette enquête. Il touche celui qu'il veut rattraper, et l'effet s'applique.

Quelques détails pour que ce soit simple et sans triche :

- **Si l'équipier n'a encore rien raté**, le pouvoir l'attend dans son sac jusqu'à la fin de l'enquête. Le Sage peut donc donner un « Encore une fois ! » *avant* une course-poursuite difficile.
- **Chaque code est propre à un pouvoir et à un rôle**, et une tablette n'accepte un code qu'une fois par enquête. Le Pisteur ne peut pas réutiliser le code donné au Barde.
- **Le Sage utilise ses pouvoirs pour lui-même** directement, sans code.
- Ces pouvoirs ne marchent pas sur les missions bonus, qui restent à un seul essai.

### 2.5 Acheter et revendre (Décidé)

- **La boutique est ouverte à tout moment**, même au milieu d'une enquête. On passe par « Retour au village (l'enquête est gardée) », on achète, puis on reprend l'enquête là où on l'avait laissée. L'objet sert tout de suite.
- **On revend aussi à tout moment**, à **la moitié du prix, arrondie en dessous**. Un objet à 35 pièces se revend 17 pièces ; un objet à 260 pièces, 130.
- Revendre un objet casse son ensemble : le bonus caché disparaît. On peut racheter l'objet au prix plein.
- Les talents ne se revendent pas : ils restent « pour toujours », comme aujourd'hui.
- **Ce que ça permet, et c'est très bien :** acheter un objet pour une seule scène, puis le revendre. Par exemple, une Lanterne sourde pour un lieu sombre. C'est comme le louer pour la moitié de son prix. Ce n'est pas une triche : ça coûte de l'or, et c'est un vrai choix.

---

## 3. Les systèmes de la saison

### 3.1 Les coffres des passages secrets

**La chaîne (Décidé) :**

1. Le Sage joue à « Superposer les plans » sur une page de vieux plans de son Grand Livre (1 action).
2. S'il gagne, un passage secret apparaît. Il donne au Pisteur un code de passage.
3. Le Pisteur tape le code. Un nouveau lieu souterrain s'ouvre sur sa carte : la crypte, le vieux tunnel du moulin, le tunnel du Chêne, le tunnel du puits. Il va l'explorer (1 action).
4. Au fond du passage, il trouve un coffre.

**Comment on ouvre un coffre (Proposition).** Chaque coffre a une raison d'être difficile :

- *posé de l'autre côté d'un trou* : le Pisteur tire une flèche avec une corde dans son anneau (Tir à l'arc) ;
- *fermé par une serrure de runes* : le Pisteur dit le code de la serrure au Sage, le Sage joue à « Assembler les runes », puis rend un code de combinaison au Pisteur ;
- *gardé par une ronde* (plus tard) : le Pisteur joue à « Se cacher ».

**Ce qu'il y a dedans (Proposition) :**

- Un coffre contient quelque chose pour au moins deux rôles, au plus une chose par rôle. Chaque chose est un code que le Pisteur dicte au bon équipier.
- On y trouve :
  - pour le Sage, un parchemin (une nouvelle page du Grand Livre, une recette à transmettre, une page en alphabet secret) ;
  - pour l'Alchimiste, des ingrédients rares ou un outil ;
  - pour le Barde, un objet à montrer aux habitants ;
  - pour le Pisteur, des pièces d'or anciennes ;
  - parfois, un indice nouveau.
- **Un coffre ne donne jamais la solution à lui tout seul.** Aux enquêtes 2 et 3, les coffres sont facultatifs : ils apportent des outils et des graines d'histoire. À partir de l'enquête 4, un coffre pourra contenir un indice clé de voûte. Rater les plans, la flèche ou les runes pourra alors coûter cher.
- Les outils trouvés dans un coffre (le coffret de teintures, le grand bocal) sont gardés **toute la saison**, et perdus en cas de défaite.

### 3.2 Les ingrédients rares

**La chaîne (Décidé) :**

1. Un équipier donne un code de lieu rare à l'Alchimiste :
   - le Pisteur repère une plante rare ;
   - ou un habitant parle d'une chose étrange au Barde.
2. L'Alchimiste tape le code. Un **coin de cueillette rare** s'ouvre sur sa carte.
3. Elle y va (1 action) et joue aux **7 différences**, dans le décor de ce lieu.
4. Si elle gagne, elle cueille **1 à 3 ingrédients rares, au hasard**. Si elle perd, elle ne cueille rien, et elle pourra réessayer à un autre moment (1 action à chaque fois, une fois par moment et par lieu).

**Les quatre ingrédients rares (Proposition) :**

| Ingrédient | Où | Décor des 7 différences | Qui donne le code | Enquête |
|---|---|---|---|---|
| Racine du Vieux Chêne (existe déjà) | sous le Vieux Chêne | la forêt aux baies | le Pisteur | 1 |
| Champignon d'ombre, violet (nouveau) | la cave de la taverne | la cave aux champignons | le Barde (Margot) | 2 |
| Épi d'argent (nouveau) | derrière le moulin | le moulin | le Barde (Iris) | 3 |
| Poussière de lune (existe déjà) | au fond du vieux puits | le puits | le Pisteur | 4 |

Les quatre décors existent déjà dans le jeu des 7 différences.

**Combien on cueille (Proposition) :** 1 ingrédient une fois sur deux, 2 un peu plus d'une fois sur trois, 3 une fois sur sept. Le Sac d'herboriste en ajoute 1. La potion Main verte en donne toujours 3.

**Les potions rares ne sont JAMAIS nécessaires pour résoudre une enquête (Décidé) :**

| Potion | Pour qui | Effet | Recette | D'où vient la recette |
|---|---|---|---|---|
| Main verte | l'Alchimiste elle-même | sa prochaine cueillette rare donne 3 à coup sûr | 1 épi d'argent, 2 trèfle ; zone verte | un parchemin du coffre du vieux tunnel (enquête 3) |
| Œil de lynx | l'Alchimiste elle-même | ses prochaines 7 différences sont plus faciles : 1 indice de plus et 20 secondes de plus | 1 champignon d'ombre, 1 menthe, 1 eau ; zone bleue | une page de grimoire du coffre, déchiffrée par le Sage (enquête 3) |
| (plus tard) Pas de velours | le Pisteur | Se cacher devient bien plus facile | 1 racine, 1 brume | enquête 4 |

La Racine du Vieux Chêne demande toujours le Mortier de pierre pour être broyée. C'est déjà la règle aujourd'hui.

L'Élixir du Cœur vaillant n'est plus dans ce tableau : il ne demande plus d'ingrédient rare, pour être toujours possible à préparer (§ 2.3).

### 3.3 Le grand ménage du labo (les bestioles)

**Quand (Proposition) :**

- Au plus une fois par enquête, à partir de l'enquête 2.
- Les bestioles arrivent au début de la **nuit**. Si l'Alchimiste a rapporté un ingrédient rare qui « amène des bestioles » (des cloportes avec les champignons d'ombre, des charançons avec les épis d'argent), elles arrivent plus tôt : dès le moment suivant.
- C'est un événement : il ne coûte pas d'action. Il s'ouvre la prochaine fois que l'Alchimiste regarde son atelier, et elle doit le jouer tout de suite.

**Ce qu'on risque (Décidé, chiffres en Proposition) :**

- Si elle gagne, rien n'est mangé.
- Si elle perd, les bestioles mangent **2 ingrédients**, en commençant par les plus exposés :
  1. ce qui est encore **dans le panier** (pas rangé) ;
  2. puis ce qui est dans les **sacs en toile** ;
  3. puis dans les **caisses et les tonneaux** (ouverts) ;
  4. puis dans les **tiroirs fermés** (commode, casier).
- Ce qui est **dans le verre fermé** n'est **jamais** mangé : les bocaux, les fioles d'ingrédients et le grand bocal des fondateurs.

**Un problème à régler (Proposition).** Aujourd'hui, l'atelier interdit de mettre une chose sèche dans un bocal. Il le dit même à l'enfant : « Dans un bocal fermé, les baies pourriraient ! » Seuls les liquides (eau, brume, miel) vont dans le verre. Avec la règle de Romain, les liquides sont donc toujours protégés, et les choses sèches jamais. Pour que bien ranger compte, je propose deux choses :

1. L'**ordre de perte** ci-dessus : ranger tout de suite, et ranger les choses précieuses dans des tiroirs fermés plutôt que dans un sac, protège déjà beaucoup.
2. **Le grand bocal des fondateurs**, trouvé dans le coffre de l'enquête 3. C'est un bocal magique « où rien ne pourrit » : il accepte aussi les choses sèches, et il protège tout ce qu'il contient. C'est l'endroit idéal pour les ingrédients rares. Et c'est une vraie récompense pour une enfant qui aime aménager son espace.

### 3.4 Le bon mélange devient un outil d'enquête (Décidé)

« Le bon mélange » n'est **pas** une façon de cuire une potion. Il sert à **reproduire la couleur exacte** d'une teinture, d'une encre ou d'une trace de peinture, pour savoir d'où elle vient.

**Comment on le débloque :**

1. Le Sage superpose les plans du clocher et trouve la crypte (enquête 2).
2. Le Pisteur explore la crypte. Dans le coffre, il trouve deux choses : **le coffret de teintures**, avec un code pour l'Alchimiste, et **le nuancier des fondateurs**, avec un code pour le Sage.
3. Pour toute la saison :
   - l'Alchimiste a une nouvelle action, « Analyser la couleur », sur les objets qui ont une teinte (1 action, mini-jeu Le bon mélange) ;
   - le Sage a une nouvelle page, le nuancier : une liste de teintures avec leurs proportions et qui s'en sert.

**Obligatoire dès l'enquête 3 (Décidé).** Le coffre de la crypte est facultatif. Une équipe peut donc arriver à l'enquête 3 sans coffret : une équipe neuve après une défaite, ou une équipe qui a raté les plans ou la flèche. L'enquête 3 donne alors un chemin garanti. **Mélusine**, la couturière, devenue l'alliée des héros, prête sa boîte de teintures au Barde, qui en donne le code à l'Alchimiste. Elle donne aussi son **carnet de couleurs** pour le Sage : chaque couleur qu'elle a cousue au village, avec sa recette. Le nuancier des fondateurs, lui, servira à l'enquête 4 (et un coffre de l'enquête 4 le donnera à ceux qui ne l'ont pas).

**Comment on s'en sert (une chaîne Alchimiste et Sage) :**

1. L'Alchimiste reproduit la couleur du fil. Si elle gagne, son écran dit : « Ta teinture : 3 trèfles, 1 pensée, 1 poussière de lune. »
2. Elle le dit à voix haute. Le Sage cherche cette recette dans le carnet de Mélusine : « Vert perroquet : je ne l'ai jamais cousu ! C'est une couleur de voyage. »
3. Si elle perd : « La couleur n'est pas la bonne. » Elle peut réessayer à un autre moment (1 action).

C'est le même plaisir que la comparaison des points sur les i de l'enquête 2. Les deux écrans ne disent rien tout seuls.

**Dans la saison :** à l'enquête 2, on le découvre (et la mission bonus « La confiture de Gaspard » s'y entraîne). **À l'enquête 3, c'est un indice clé de voûte** : la couleur d'un fil vert innocente Silas et Iris. À partir de l'enquête 4, c'est une source d'indices régulière.

### 3.5 Les nouvelles recettes (Décidé)

Toutes les recettes nouvelles viennent **d'un autre rôle**, par un code de recette donné à l'Alchimiste. Elle garde la recette dans son grimoire toute la saison, et la perd en cas de défaite.

| Recette | Source | Enquête |
|---|---|---|
| Encre révélatrice | le Grand Livre du Sage (recette secrète, lue à voix haute) | 1, déjà en place |
| Élixir du Cœur vaillant | Iris la raconte au Barde ; à partir de l'enquête 3, elle est aussi dans le Grand Livre du Sage | 2 et 3 |
| Main verte | un parchemin dans le coffre du vieux tunnel | 3 |
| Œil de lynx | une page de grimoire du même coffre, écrite en alphabet secret : le Sage doit la déchiffrer | 3 |

Les trois sortes de sources demandées sont là : une page de grimoire déchiffrée par le Sage, Iris qui parle au Barde, un parchemin dans un coffre.

### 3.6 La course-poursuite et le témoin qui a peur (Décidé)

1. Le Pisteur voit quelqu'un qui s'enfuit et le poursuit (Course-poursuite).
2. S'il gagne, il l'attrape. Le fuyard dit toujours la même phrase : **« Je ne suis pas coupable, j'ai eu peur, je me suis enfui, mais je n'ai rien fait ! »**
3. Le fuyard est un **témoin** ou un **complice**, **jamais le coupable**.
4. Le Pisteur reçoit un code pour le Barde : « Donne son code au Barde : lui saura le faire parler. »
5. Le Barde tape le code. Une nouvelle question s'ouvre chez cet habitant. Le témoin y répond par un mensonge, parce qu'il a peur.
6. Le Barde joue à « Repérer le mensonge » (le bouton Démasquer). S'il gagne, la vérité apparaît : c'est l'indice.

| Enquête | Fuyard | Ce qu'il est | Ce qu'il apprend au Barde |
|---|---|---|---|
| 2 | Tim, sur les toits | témoin | la silhouette en cape est entrée dans une maison de la rue des Lanternes |
| 3 | Basile, au bord de la rivière | complice | il porte les sacs de terre pour un homme qui creuse et qui sent la réglisse |

À l'enquête 1, il n'y a pas encore de chaîne : le Barde ne peut démasquer personne avant l'enquête 2. Le Pisteur poursuit pourtant déjà quelqu'un : Pirate, le chien de Tim.

### 3.7 Les dépositions (nouveau jeu du Barde)

**Inspiration :** « Petits Meurtres et Faits Divers ». Plusieurs habitants racontent **la même soirée**. Les innocents racontent les mêmes détails, chacun avec ses mots. La version du menteur ne colle pas.

**Comment ça se joue (Proposition) :**

- La scène se passe dans un lieu et à un moment précis, par exemple la taverne le soir. Elle coûte 1 action.
- Chaque témoin a une carte avec son portrait et 3 à 5 phrases courtes. Chaque phrase a une petite icône (temps qu'il fait, cloche, qui on a vu, bruit, heure) et un bouton pour l'écouter.
- **But :** toucher la ou les phrases qui contredisent les autres, puis désigner le menteur.
- **Ce qui rend le jeu plus dur :**
  - plus de témoins et plus de phrases ;
  - des différences *innocentes* qui ne sont pas des mensonges (« vers 9 heures » et « un peu après 9 heures », c'est pareil) ;
  - deux contradictions au lieu d'une ;
  - des cœurs limités.
- **Pas de minuteur.** Romain n'aime pas les minuteurs, et le jeu demande de lire et de réfléchir.
- **Si on gagne :** le carnet note **les détails que tous les innocents partagent** (c'est souvent l'indice le plus utile) et **le nom du menteur**. Le Barde peut ensuite démasquer ce menteur pour savoir pourquoi il ment.
- **Le menteur n'est pas forcément le coupable.** À l'enquête 2, c'est Fortuné, qui ment pour mieux vendre. À l'enquête 3, c'est Iris, qui a peur d'être accusée.
- **Les aides possibles :** le talent Mémoire du conteur (une contradiction entourée), le Carnet de ragots, le Pendule de vérité.

**Le contenu d'une scène, pour le programmeur :** un titre, et une liste de témoins. Chaque témoin a un habitant et des phrases. Chaque phrase a un texte, un sujet (« météo », « cloche »…) et une valeur. Les innocents ont les mêmes valeurs. Le menteur a une valeur différente sur un ou deux sujets.

### 3.8 La grille qui confirme (Décidé)

Quand on la gagne, « La grille de déduction » **confirme un indice douteux sans donner la solution**. Par exemple, à l'enquête 3 : Victor jure que Margot n'a pas quitté son comptoir de la nuit, mais Victor est parti à minuit. La grille du Sage, construite à partir des témoignages, confirme que Margot servait encore la soupe quand on entendait les coups sous le moulin. Ce n'est qu'avec cette confirmation que Margot est vraiment hors de cause.

Le contenu de la grille est une énigme fixe : solution unique, et chaque indice nécessaire. On la vérifie avec le solveur qui existe déjà dans le jeu. On peut lui ajouter des contre-indices (« ni… ni… », « si… alors… »), comme Romain l'a demandé.

### 3.9 Ce que chaque mini-jeu « veut dire » dans l'histoire

Chaque mini-jeu doit avoir une raison logique (Décidé). Voici celles que je propose, et que les enquêtes suivent.

| Rôle | Mini-jeu | Ce qu'il veut dire dans l'histoire |
|---|---|---|
| Pisteur | Suivre la piste | Lire des empreintes fraîches avant qu'elles s'effacent (vent, boue, farine). |
| Pisteur | Course-poursuite | Rattraper quelqu'un ou quelque chose qui s'enfuit : chien, témoin, complice. |
| Pisteur | Se cacher | Guetter une scène sans être vu, pendant qu'une lanterne fait sa ronde. |
| Pisteur | Tir à l'arc | Atteindre ce qu'on ne peut pas toucher : une corde, un anneau de coffre, un ballon, une girouette. |
| Alchimiste | Le chaudron | Préparer une potion : encre, lumière, élixir, antidote. |
| Alchimiste | Le double | **Analyser un objet par comparaison** : trouver vite le signe que l'objet partage avec un échantillon. Fil, poils, morceau de cape, mécanisme d'un piège. |
| Alchimiste | Les bulles magiques | **Analyser une odeur ou une poudre** : le réactif fait des bulles de couleur dans un ordre, et il faut les refaire pour lire le résultat. Plus tard, rendre la mémoire. |
| Alchimiste | Les 7 différences | Cueillir un ingrédient rare caché dans un décor. |
| Alchimiste | Le grand ménage du labo | Défendre son atelier contre les bestioles. |
| Alchimiste | Le bon mélange | Reproduire la couleur exacte d'une teinture, d'une encre ou d'une peinture. |
| Barde | Repérer le mensonge | Démasquer un habitant qui ment, en le faisant répéter. |
| Barde | Les dépositions | Comparer plusieurs récits de la même soirée. |
| Barde | Les mots perdus | Écouter en cachette une conversation trop lointaine ou trop bruyante. |
| Barde | Les ragots | Trier le vrai du faux à la taverne (surtout en mission bonus). |
| Sage | L'alphabet secret | Déchiffrer un message ou une page écrite en code. |
| Sage | Superposer les plans | Trouver ce qui a disparu des plans d'aujourd'hui : caves, tunnels, cachettes. |
| Sage | La grille | Confirmer un témoignage douteux. |
| Sage | Assembler les runes | Ouvrir une serrure ou un sceau des fondateurs, réparer une horloge ou une carte déchirée. |

---

## 4. Tableau enquête × mini-jeu (enquêtes 1 à 5)

Comment lire le tableau :

- **E** : le mini-jeu sert dans l'enquête elle-même ;
- **(CV)** : c'est un indice clé de voûte ;
- **F** : facultatif (coffre, ingrédient rare, chemin de secours) ;
- **B** : mission bonus.

Les enquêtes 4 et 5 sont prévues (chapitre 8), pas encore écrites.

| Mini-jeu | Enquête 1 | Enquête 2 | Enquête 3 | Enquête 4 (prévu) | Enquête 5 (prévu) |
|---|---|---|---|---|---|
| **Suivre la piste** | E : traces du massif, à la mairie | E : traces devant la porte de la mairie · B : le lapin | E (CV) : traces dans la farine, mais l'indice partiel suffit | E : pas dans les tunnels | E : pas des endormis |
| **Course-poursuite** | E : Pirate le chien | E : Tim sur les toits (témoin) | E : Basile au pont (complice) | E : un témoin dans les tunnels | B |
| **Se cacher** | — | E : guetter le Corbeau à la mairie | E : guetter au moulin la nuit | E : rondes de Silas sous terre | E |
| **Tir à l'arc** | B : le ballon du clocher | F : le coffre de la crypte | B : la girouette du moulin | E : couper la corde d'un piège | B |
| **Le chaudron** | E : encre révélatrice | E (CV) : encre pour la lettre blanche · F : invisibilité, élixir | E : potion de lumière · F : élixir | E | E : l'antidote |
| **Le double** | E : analyse du fil et des poils | F : analyse du morceau de cape | B : le jeu de cartes du colporteur | E : mécanisme du piège | E |
| **Les bulles magiques** | B : les fournées de Gaspard | E (CV) : odeurs de la lettre | E : poussière grise | F | E : rendre la mémoire |
| **Les 7 différences** | F : racine du Chêne | F : champignons de la cave | F : épis d'argent · B : les bouquets d'Iris | F : poussière de lune | F |
| **Le grand ménage** | — | E (événement) | E (événement) | E | E |
| **Le bon mélange** | — | B : la confiture de Gaspard (et le coffret est trouvé) | E (CV) : la couleur du fil vert | E : peinture des flèches | E : couleur de l'acide |
| **Repérer le mensonge** | — (pas avant l'enquête 2) | E : Tim · F : Mélusine, Fortuné, Victor | E : Basile · F : Iris, Silas, Fortuné · B : concours | E : Silas | E |
| **Les dépositions** | — | E : la soirée d'avant-hier | E : la nuit dernière | E | E (piège : ils ont oublié) |
| **Les mots perdus** | B : la chanson de la fête | E : l'écoute au lavoir | — | E : voix sous la place | E : souvenirs en morceaux |
| **Les ragots** | B | B | B | B | B |
| **L'alphabet secret** | — | E (CV) : la lettre secrète | F : page de grimoire · B : la devise | F | E |
| **Superposer les plans** | — | F : la crypte | E : plans du moulin | E : la croix sous la place | F |
| **La grille** | — | B : le casse-tête du maire | E (CV) : qui était où à minuit | E | E |
| **Assembler les runes** | B : l'horloge de la mairie | — | F : la serrure du coffre | E : Sceau de la Pisteuse | E : Sceau de l'Alchimiste |

**Les deux règles demandées sont respectées :**

- **À la fin de l'enquête 3, chaque rôle a joué au moins 3 de ses mini-jeux.** Il suffit de compter le chemin obligatoire, sans le facultatif ni les bonus :
  - Pisteur 3 sur 4 (piste, poursuite, cachette) ;
  - Alchimiste 5 sur 6 (chaudron, double, bulles, ménage, bon mélange) ;
  - Barde 3 sur 4 (mensonge, dépositions, mots perdus) ;
  - Sage 3 sur 4 (alphabet, plans, grille).
  Avec le facultatif et les bonus, chaque rôle a joué tous ses mini-jeux dès l'enquête 3 : le coffre de la crypte, la serrure de runes, les cueillettes rares, les ragots.
- **À la fin de l'enquête 5, les 18 mini-jeux ont tous été joués.** Les enquêtes 4 et 5 continuent de les varier.

---

## 5. Enquête 1 — La Lanterne d'Or (facile)

**Ce qui change :** presque rien dans l'histoire, puisque la famille l'a adorée. On ajoute deux raisons de jouer : le chien Pirate à poursuivre, et les analyses par « Le double ». On ajoute aussi une racine rare facultative, pour faire découvrir la cueillette rare. La logique est la même qu'aujourd'hui : le vérificateur actuel la valide déjà.

**Moments :** matin, après-midi, soir (2 actions par joueur et par moment). **Durée estimée :** 45 à 55 minutes.

**La soirée, moment par moment (estimation) :**

| Moment | Pisteur | Alchimiste | Barde | Sage | Le plus chargé |
|---|---|---|---|---|---|
| Matin | mairie : traces, fenêtre, gouttière ; place | cueillir les baies ; encre (chaudron), avec la recette lue par le Sage | Basile (ses grosses bottes) ; Odette | registre ; recettes | le Pisteur ou l'Alchimiste, environ 5 min |
| Après-midi | forêt : le chien (poursuite), les chemins ; Vieux Chêne | analyse du fil (double) ; racine rare (facultatif) | Gaspard (l'affiche) ; Mélusine | page blanche (avec l'encre) ; bonus horloge | l'Alchimiste, environ 6 min |
| Soir | bonus du ballon | analyse des poils (double) ; bonus des fournées | Victor ; bonus | accusation | l'Alchimiste, environ 6 min |

Le calcul donne environ 41 minutes. Avec les ratés et les bonus, on arrive à 45 à 55 minutes.

### La lettre d'ouverture (inchangée)

> Chers enquêteurs, c'est une catastrophe ! Cette nuit, quelqu'un a pris la Lanterne d'Or dans mon bureau, à la mairie. Ce soir, c'est la Fête des Lanternes : sans elle, aucune lanterne du village ne pourra s'allumer ! Trouvez QUI l'a prise, et OÙ elle se trouve, avant ce soir.
> — Monsieur Grosbec, maire de Brumeval

### La solution

- **QUI :** Tim, le petit ramoneur, qui voulait retrouver son chien Pirate.
- **OÙ :** au Vieux Chêne.
- **Suspects :** Gaspard, Basile, Victor, Mélusine, Odette, Tim. **Lieux :** le moulin, le puits, le Vieux Chêne, les toits du village.

### Les sources d'indices

**Le Pisteur**

- **Mairie, le massif de fleurs**, mini-jeu *Suivre la piste*, **fait exprès pour ce lieu depuis le 10 novembre (§ 12.53)** : au départ, les grosses bottes du jardinier et les petites traces s'entremêlent, puis chacune part de son côté ; **les petites finissent dans la forêt : la ville s'arrête, on voit le début de la forêt** (Romain, 10 novembre, 20 h 44, § 12.55). « Dans le massif, deux sortes de traces se mêlent. De grosses bottes, sèches et craquelées : elles datent d'hier. Et des petites, toutes fraîches, de 3 carreaux : elles datent de cette nuit ! Les petites t'ont mené jusqu'à la forêt… Là-dedans, il y a plein de chemins : sans plan, on s'y perd ! » *Prouve*, avec les pieds du registre du Sage : ce n'est ni Gaspard, ni Basile, ni Victor (5 carreaux).
- **Mairie, la fenêtre** : « La fenêtre a été ouverte depuis dehors. Accrochés à la poignée : des poils ! Qui a bien pu laisser ça ? » (depuis le 10 novembre : plus de « fil de laine rouge », § 12.53). Code des poils pour l'Alchimiste (l'identifiant `fil` et son code gelé restent).
- **Mairie, la gouttière** : « La gouttière est tordue : quelqu'un est descendu du toit en s'y accrochant. Quelqu'un de léger et agile, sinon elle aurait cassé ! » *Prouve*, avec la canne d'Odette : ce n'est pas Odette.
- **Place, la fontaine** : des traces de pattes de chien toutes mouillées. *(Met sur la piste du chien.)*
- **Place, le panneau** : « PERDU : PIRATE, petit chien noir et blanc. Prévenez Tim, 7, rue des Lanternes. » Code de l'affiche pour le Barde.
- **Boulangerie, le sol** : Gaspard a de très grands pieds.
- **Boulangerie, le four** : de la suie autour du four. *Fausse piste.*
- **Forêt.** Elle est fermée tant que le Pisteur n'a pas le plan que le Sage révèle (depuis le 10 novembre, lui seul : Basile ne dessine plus le chemin, § 12.52).
  - **Le carrefour** : trois chemins, vers le moulin, le puits et le Vieux Chêne.
  - **Le chemin du moulin** : « La boue est toute lisse : personne n'est passé. » *Prouve* : pas au moulin.
  - **Le chemin du puits** : « Sur le chemin du Puits, rien que de grosses traces de sabots : un sanglier est passé par là, c'est tout. » (plus de « aucune trace d'enfant », qui donnait la réponse : Romain, 10 novembre) *Prouve* : pas au puits.
  - **Le chemin du Vieux Chêne** : « Il fait bien trop noir pour voir des traces… »
  - **Nouveau : le petit chien**, mini-jeu *Course-poursuite* : « Un petit chien noir et blanc file entre les arbres ! Tu cours derrière lui… Il plonge sous un buisson épineux et t'échappe, mais une touffe de poils reste accrochée aux épines ! » Code des poils pour l'Alchimiste. *Pourquoi ce mini-jeu :* Pirate a peur et court. On ne l'attrape pas, mais on récupère ses poils.
- **Vieux Chêne, les racines** : « Un courant d'air froid te souffle sur les mains… comme si le sol respirait. » *(Graine pour l'enquête 4.)*
- **Nouveau, Vieux Chêne, une racine qui brille** : « Entre deux grosses racines, une petite racine dorée brille dans le noir. L'Alchimiste saurait la cueillir, elle ! » Code de lieu rare pour l'Alchimiste. *Facultatif.*
- **Le puits et le moulin** : rien de nouveau. Ils confirment ce que disent les chemins.
- **Partout** : « Ce qui pousse ici », à dire à l'Alchimiste.

**L'Alchimiste**

- **Encre révélatrice**, mini-jeu *Le chaudron*. La recette est secrète : le Sage la lit à voix haute, avec l'ordre et les quantités. Code de la potion pour le Sage, qui en a besoin pour la page blanche.
- **Analyse des poils de la fenêtre** (depuis le 10 novembre : plus de mini-jeu, le résultat tombe tout de suite dans le labo, § 12.53) : « Sous ta loupe, surprise : ce ne sont pas des poils de bête ! Ce sont des brins de laine tricotée à la main… un morceau d'écharpe. Ils sont couverts de SUIE noire, comme dans les cheminées. » *Prouve*, avec l'écharpe intacte de Mélusine (Barde) : ce n'est pas Mélusine.
- **Analyse de la touffe de poils de la forêt** (sans mini-jeu depuis le 10 novembre) : « Sous ta loupe : des poils de chien, noirs et blancs. Coincée dedans : une petite feuille de CHÊNE ! » *Prouve* : ni au moulin, ni au puits.
- **Analyse de la plume**, sans mini-jeu : « Une plume de corbeau. Elle sent… la lavande ! » *(Graine pour l'enquête 2.)*
- **Nouveau : cueillette rare**, si le Pisteur a donné le code. Mini-jeu *Les 7 différences*, décor « la forêt aux baies » : 1 à 3 racines du Vieux Chêne. *Facultatif.* Elle les garde pour plus tard.
- **Cueillettes** (sans changement) : eau (place, lavoir), miel et menthe (potager), baies (lisière), lavande et pensées (herboristerie), brume (lavoir, le matin), champignons lumineux (forêt, le soir), trèfle (clairière).

**Le Barde** (questions inchangées)

- **Gaspard** : « Dans mon fournil, toute la nuit ! » Si on lui montre l'affiche du chien : « Hier soir, Tim cherchait Pirate en pleurant. Je lui ai dit : les chiens perdus filent souvent dans la forêt. »
- **Mélusine** : « Je dormais. » « J'ai tricoté des écharpes rouges pour la moitié du village. » « Mon écharpe ? Pas un trou, pas un fil qui dépasse ! » *Ce dernier point prouve, avec le fil :* ce n'est pas Mélusine.
- **Basile** : a planté des fleurs devant la mairie hier avec ses grosses bottes ; à 6 heures du soir, la fenêtre était fermée. ~~Il dessine le chemin de la forêt~~ : depuis le 10 novembre (§ 12.52), « on s'y perd, même moi ! Il paraît que le Grand Livre du Sage cache un vieux plan », sans code.
- **Odette** :
  - la lumière de la boulangerie est restée allumée ;
  - « À minuit, une petite silhouette a sauté de toit en toit, jusqu'à la mairie. Plus tard, j'ai vu une lumière dorée filer vers la forêt » (*prouve* : la Lanterne n'est pas restée sur les toits ; phrase changée le 11 novembre, §12.55 : avant, la silhouette partait vers la forêt de toit en toit, avec la lumière dorée) ;
  - « Avec ma canne, je ne grimpe plus » ;
  - elle donne la **plume noire** rapportée par son chat (code pour l'Alchimiste).
- **Victor** : « À l'aube, un petit chien noir et blanc courait vers la forêt. »
- **Le voisin de Tim** : « Il part souvent très tôt pour ramoner. » *(Pas une preuve.)*
- **Le maire** : la Lanterne était dans son bureau ; « Mes gants ? J'ai toujours froid aux mains. » *(Graine.)*
- **Margot** : « Cette nuit, Gaspard a encore fait du pain. »

**Le Sage**

- **Les habitants** : adresses, notes, pieds en carreaux.
- **Les recettes** : l'encre révélatrice, à lire à l'Alchimiste.
- **La page blanche** (il faut l'encre) : le plan de la forêt apparaît. Code du plan pour le Pisteur.
- **Les fondateurs** : « Une vieille chanson dit qu'ils étaient cinq… »
- **Pouvoirs de secours** : disponibles, mais rarement utiles ici.

### Les faits (inchangés, validés par le vérificateur actuel)

| N° | Ce qu'il faut réunir | Ce que ça prouve |
|---|---|---|
| 1 | Pisteur : traces du massif + Sage : registre (pieds) | ni Gaspard, ni Basile, ni Victor |
| 2 | Pisteur : fil de la fenêtre + Alchimiste : analyse du fil + Barde : l'écharpe de Mélusine | pas Mélusine |
| 3 | Pisteur : la gouttière + (Barde : la canne d'Odette **ou** Sage : registre) | pas Odette |
| 4 | Barde : Odette a vu la silhouette filer vers la forêt | pas sur les toits |
| 5 | Pisteur : chemin du moulin | pas au moulin |
| 6 | Pisteur : chemin du puits | pas au puits |
| 7 | Pisteur : la poursuite du chien (les poils) + Alchimiste : analyse des poils | ni au moulin, ni au puits |

Les liens sont directs, et un seul fait suffit souvent à rayer quelqu'un. C'est voulu pour un tutoriel.

### Fausses pistes

- la suie du four de Gaspard ;
- les grosses traces de Basile ;
- Victor, qui a vu le chien ;
- les écharpes rouges de Mélusine ;
- Odette, qui ne dort jamais ;
- les ragots (« la Lanterne est au fond du puits »).

Personne ne ment dans cette enquête.

### Si un mini-jeu est raté (enquête 1 : toujours un indice partiel, et on peut toujours rejouer)

| Mini-jeu | Ce qu'on reçoit | Rejouer |
|---|---|---|
| Suivre la piste (le massif) | « Les traces se brouillent… Tu as juste vu qu'il y en avait des grosses et des petites. » | Oui, en revenant (1 action) |
| Course-poursuite (le chien) | « Le chien est bien trop rapide : il disparaît entre les arbres. Il était noir et blanc. » | Oui, au moment suivant |
| Le chaudron (l'encre) | Les ingrédients sont perdus ; la fiole casse, sauf avec les fioles renforcées. Le plan de Basile reste un autre chemin vers la forêt. | Oui, avec de nouveaux ingrédients |
| ~~Le double (le fil)~~ | Plus de mini-jeu pour les analyses depuis le 10 novembre (§ 12.53) : elles ne se ratent plus | — |
| ~~Le double (les poils)~~ | Pareil | — |
| Les 7 différences (la racine) | Rien de cueilli | Oui, à un autre moment |

### Missions bonus (inchangées, 15 pièces d'or chacune, un seul essai)

- **Pisteur :** le ballon du clocher (Tir à l'arc).
- **Alchimiste :** les fournées de Gaspard (Les bulles magiques).
- **Barde :** les ragots de la taverne ; la chanson de la fête (Les mots perdus).
- **Sage :** l'horloge de la mairie (Assembler les runes).

### La fin (refaite le 4 novembre après-midi : plus de Corbeau, plus de « fer noir »)

1. Toute l'équipe court jusqu'au Vieux Chêne. Sous ses grosses racines, une lumière dorée brille dans le noir… C'est la Lanterne d'Or !
2. Juste à côté, Tim dort en boule, avec son chien Pirate blotti dans ses bras.
3. Tim se réveille en sursaut : « Pardon ! Pirate s'était perdu dans la forêt, et il faisait si noir… J'ai pris la lanterne juste pour le retrouver. Je voulais la rapporter avant la fête ! »
4. Entre les racines, un courant d'air froid souffle doucement, comme si le sol respirait…
5. Le maire arrive en courant. Il serre la Lanterne contre lui, très fort.
6. Le soir venu, la Lanterne d'Or allume toutes les lanternes de Brumeval. Devant tout le village, le maire vous remercie : « Quelle équipe ! J'aurai d'autres missions pour vous. »
7. Pendant la fête, tout le monde ne parle que de cet énorme trou sous le Vieux Chêne. D'où vient-il ? Personne au village ne le sait… ni d'où sort ce courant d'air froid.
8. Le maire, lui, retourne au Vieux Chêne. Il regarde longtemps le trou, sans rien dire. Le lendemain, il y fait poser de grosses planches : « C'est bien trop dangereux, que personne ne s'en approche ! »

**Le calepin** garde : le courant d'air froid, l'énorme trou dont personne ne sait d'où il vient, les grosses planches que le maire a fait poser dessus, la grande plume noire qui sent la lavande, les gants du maire.

**Deux graines pour la nouvelle enquête 2** (§ 12.10, sans rien dévoiler) : quand Gaspard le remonte du trou, Tim a « l'autre main bien fermée au fond de sa poche » ; Odette, en donnant la plume : « Moi qui ne dors presque jamais, je vois tout ce qui se passe au village… ».

**Si l'équipe perd :** « Le soir tombe… Sans la Lanterne d'Or, la fête est annulée. Le maire vous regarde, déçu : « Je me suis trompé sur vous. » La brume entre dans le village et efface vos souvenirs… »

**Mots sensibles (inchangés) :** tim, suie, ramon, petite main, ronfle.

---

## 6. Enquête 2 — Les lettres du Corbeau (plus dure)

**Ce qui change :**

- **Quatre menteurs** : Mélusine, Fortuné, Victor et Tim.
- **La lettre trouvée à la mairie est blanche.** Il faut l'encre de l'Alchimiste, la clé des archives (que le Barde obtient d'Anselme), puis l'alphabet du Sage. Et seul le Barde sait ce qu'est « la Grande Voix ».
- **Tim devient le témoin** que le Pisteur attrape sur les toits.
- **Le Pisteur guette le Corbeau en se cachant** au lieu de le poursuivre : c'est elle la coupable, donc on ne l'attrape pas.
- **Premières dépositions** à la taverne.
- **L'écoute au lavoir devient obligatoire, et n'a plus besoin de potion.** Le Barde se cache derrière les draps qui sèchent ; la potion d'invisibilité devient facultative. Le Barde joue ainsi 3 mini-jeux obligatoires.
- **Premier coffre** dans la crypte, avec le coffret de teintures (facultatif).
- **Premiers ingrédients rares par le Barde**, et **premier grand ménage**.
- **L'Alchimiste n'a que 3 mini-jeux obligatoires** : l'encre (chaudron), l'analyse de la lettre (bulles) et le grand ménage. Tout le reste est facultatif : l'analyse de la cape, la cave aux champignons, l'élixir, la potion d'invisibilité, la confiture de Gaspard.
- **La ruelle des Brumes et la craie bleue disparaissent.** Elles demandaient une potion de lumière de plus, pour un simple appui.
- **Margot habite maintenant au 1, rue des Lanternes.** C'est un simple détail d'histoire, expliqué sous le registre.
- On retire ce qui donnait la réponse trop vite :
  - les bonbons au miel ;
  - la date d'arrivée de Fortuné donnée par Victor et par Margot. Elle est maintenant à découvrir dans les dépositions.

**Moments :** matin, après-midi, soir, nuit. **Durée estimée :** 55 à 70 minutes.

### La lettre d'ouverture

> Chers enquêteurs, grâce à vous, la Fête des Lanternes a été magnifique ! Mais un nouveau malheur frappe Brumeval. Depuis trois nuits, des lettres signées d'une plume noire sont glissées sous les portes. Ce matin, sous la porte de la mairie, j'ai trouvé une lettre toute blanche… avec juste une plume dessinée en bas. Le Corbeau se moque de nous ! Trouvez QUI glisse ces lettres… et OÙ le Corbeau va frapper !
> — Monsieur Grosbec, maire de Brumeval

### La solution

- **QUI :** Mélusine, la couturière, couverte de dettes et payée par l'homme masqué.
- **OÙ :** au clocher, à la Grande Voix.
- **Suspects :** Mélusine, Odette, Iris, Margot, Fortuné, Victor, Anselme, Gaspard. **Lieux :** le clocher, le lavoir, la mairie, le puits.

**Le registre du Sage :**

| Habitant | Maison | Pieds | Note |
|---|---|---|---|
| Mélusine | 4, rue des Lanternes | 3 | couturière |
| Odette | 2, rue des Lanternes | 3 | marche avec une canne |
| Iris | 4, rue du Four | 4 | cultive la lavande |
| Margot | **1, rue des Lanternes** (nouveau) | 4 | tient la taverne du Chaudron fêlé |
| Fortuné | une chambre à la taverne | 4 | colporteur, arrivé il y a peu |
| Victor | 6, rue des Lanternes | 5 | facteur |
| Anselme | la petite maison du clocher | 5 | très mal au genou |
| Gaspard | 1, rue du Four | 5 | boulanger |

**Pourquoi Margot habite rue des Lanternes, en une phrase :** quand Tim dit que la silhouette est entrée dans une maison de cette rue, Margot reste suspecte, et c'est l'Alchimiste, avec l'odeur de lavande de la lettre, qui l'innocente. Sans ce petit détail, l'Alchimiste ne servirait à rien pour trouver la coupable.

### Les sources d'indices

**Le Pisteur**

- **Mairie, devant la porte** (matin, après-midi, soir), mini-jeu *Suivre la piste* : « Dans la boue, des petites traces de pas toutes fraîches. Elles mesurent 3 ou 4 carreaux, pas plus. Elles partent vers la ruelle des Brumes. » *Prouve*, avec le registre : ce n'est ni Victor, ni Anselme, ni Gaspard.
- **Mairie, la boîte aux lettres** : « Les lettres du Corbeau n'ont pas de timbre : on les glisse sous les portes, la nuit. »
- **Mairie la nuit, guetter dans l'ombre**, mini-jeu *Se cacher* : « La silhouette en cape lève sa lanterne et regarde partout… Tu restes caché. Elle glisse une lettre sous la porte, puis file : elle est petite et très rapide, elle saute par-dessus les bancs ! Sa cape s'accroche au banc : il t'en reste un morceau, avec une plume cousue dessus. » *Prouve*, avec le registre : ce n'est ni Odette (canne), ni Anselme (genou). Code du morceau de cape pour l'Alchimiste. *Pourquoi ce mini-jeu :* la lanterne du Corbeau fait la ronde, comme celle d'un garde.
- **Place, quelqu'un sur les toits** (matin, après-midi), mini-jeu *Course-poursuite* : « Là-haut, sur les toits, une petite silhouette t'observe… Elle s'enfuit ! Tu sautes de toit en toit et tu l'attrapes par le col : c'est Tim, le petit ramoneur ! Il tremble : « Je ne suis pas coupable, j'ai eu peur, je me suis enfui, mais je n'ai rien fait ! » Donne son code au Barde : lui saura le faire parler. » Code du témoin Tim pour le Barde.
- **Clocher, les cloches** : « Tout en haut, trois cloches. Sur la plus grosse, une petite trappe fermée par un cadenas tout neuf. » *(Appui.)*
- **Puits, la grille** : « Toute rouillée, pleine de toiles d'araignée : personne ne l'a ouverte depuis des années. » *Prouve* : pas au puits.
- **Lavoir, le banc** : deux tasses de tisane à la lavande encore tièdes. *Fausse piste.*
- **Herboristerie** : Iris fait des sachets de lavande pour parfumer les tissus. *(Marqué « ne compte pas seul ».)*
- **Nouveau : la crypte du clocher** (après le code de passage du Sage) : « Un escalier humide descend sous le clocher… Au fond de la crypte, un vieux coffre est posé sur une corniche, de l'autre côté d'un trou noir. » Mini-jeu *Tir à l'arc* : « Tire une flèche avec une corde dans l'anneau du coffre, pour le tirer jusqu'à toi ! » Plus loin : « Un tas de pierres bouche le tunnel, vers le centre du village. » *(Graine pour la salle du Cœur.)* Le coffre est décrit plus bas.

**L'Alchimiste**

- **Encre révélatrice**, mini-jeu *Le chaudron* (indice clé de voûte). Code pour le Sage, pour la lettre blanche de la mairie. La recette est dans son grimoire depuis l'enquête 1, et aussi dans le Grand Livre du Sage (utile pour une équipe neuve après une défaite).
- **Analyse de la lettre du Corbeau** (le Sage lui en prête une par code), mini-jeu *Les bulles magiques* (indice clé de voûte). « Le réactif fait une bulle de couleur pour chaque odeur : retiens leur ordre et refais-le. » Résultat : « Le papier est épais : c'est le même que celui des affiches de la mairie ! Il sent fort la lavande. Dans un coin, une trace de poudre bleue. » *Prouve*, avec les lettres du Sage et la liste d'Iris : ce n'est ni Margot, ni Gaspard, ni Fortuné, ni Anselme. Le papier de la mairie est une graine.
- **Nouveau : le grand ménage du labo** (événement, au début de la nuit, ou plus tôt si elle a rapporté des champignons d'ombre : « Des cloportes ont suivi tes champignons jusqu'à ton atelier ! »).
- **Facultatif :**
  - **l'analyse du morceau de cape**, mini-jeu *Le double* : « Une plume de corbeau cousue sur un tissu noir, avec des points minuscules et parfaits. Elle sent la lavande. » Avec Savante ou la Loupe dorée, un détail : « Seule une vraie couturière sait coudre comme ça. » *(Appui.)*
  - **la cave de la taverne** (code du Barde, par Margot). Mini-jeu *Les 7 différences*, décor « la cave » : 1 à 3 champignons d'ombre ;
  - **l'Élixir du Cœur vaillant**, si Iris a donné la recette (2 miel, 1 pensée, 1 eau) : pour le Sage, à l'enquête 2 ou à garder pour l'enquête 3 ;
  - **la potion d'invisibilité**, qui rend l'écoute du Barde plus facile (une aide dans Les mots perdus) ;
  - **le coffret de teintures** (dans le coffre), pour la mission bonus de la confiture et pour l'enquête 3.

**Elle joue 3 mini-jeux obligatoires** (l'encre, la lettre, le ménage), et jusqu'à 7 si elle fait tout le facultatif.

**Le Barde**

- **Iris** (herboristerie le matin et le soir, place l'après-midi) :
  - « Où étiez-vous la nuit dernière ? » : « Dans ma cuisine, à préparer mes sachets de lavande. »
  - « Qui vous achète de la lavande ? » : « Odette, pour ses chats. Victor, pour ses chaussettes, hi hi ! Et Mélusine, chaque semaine, pour ses tissus. Personne d'autre. » Ce fait sert au n° 3.
  - « Avez-vous vu quelque chose ? » : « Hier soir, deux personnes chuchotaient au lavoir. »
  - **Nouveau :** « Une potion pour donner du courage ? » : « Ma grand-mère faisait l'Élixir du Cœur vaillant : deux cuillères de miel, une pensée sauvage et un peu d'eau, bien chaud. » Code de recette pour l'Alchimiste.
- **Victor** (poste, place, taverne, maison) :
  - « Avez-vous distribué ces lettres ? » : « Jamais de la vie ! Elles n'ont pas de timbre. »
  - **Nouveau :** « Vous écrivez des lettres, vous aussi ? » : « Moi ? Jamais ! » *(Il ment.)* La vérité : « Bon… j'écris des poèmes en cachette. Mais pas de lettres de Corbeau, juré ! » *Fausse piste avec mensonge.*
- **Anselme** (clocher, taverne le soir) :
  - « J'ai perdu une clé du clocher la semaine dernière. »
  - « Ma plus grosse cloche, tout le village l'appelle la Grande Voix. » Ce fait sert pour le OÙ.
  - Il donne **la vieille clé des archives**, avec un code pour le Sage.
- **Mélusine** (atelier, place le soir, maison la nuit). Trois mensonges, que le Barde peut démasquer :
  - « Je dormais. » La vérité : « J'étais dehors. Mais je ne dirai pas pourquoi ! »
  - « De la lavande ? Jamais ! » La vérité : « J'en achète chaque semaine pour mes tissus. »
  - « Ma boutique marche très bien. » La vérité : « J'ai beaucoup de dettes… »
  - Toutes ces réponses sont marquées « ne comptent pas seules ».
- **Fortuné** (place, taverne) :
  - « Ma bague ? De l'or véritable ! » *(Il ment.)* La vérité : « Du cuivre peint. »
  - « Des plumes noires ? Oui, un gros paquet, à quelqu'un qui cachait son visage sous un capuchon. » *(Fausse piste : on ne sait plus si c'est une dame.)*
  - **Nouveau :** « Depuis quand êtes-vous à Brumeval ? » : « Oh, depuis une bonne semaine ! » *(Il ment.)* La vérité : « Bon… je suis arrivé avant-hier. Je dis ça pour que les gens me fassent confiance et m'achètent plus ! » C'est un *deuxième chemin* vers le fait n° 2.
- **Odette** :
  - « Ma lettre sentait la lavande, comme mes chats ! » *(Fausse piste.)*
  - « Une silhouette en cape courait vite, vite… pas comme moi avec ma canne ! »
  - « Chez les Grosbec, personne n'a jamais eu de don. » *(Graine.)*
- **Margot** (taverne) :
  - « Fortuné ? Il a une chambre. Il ronfle comme un sanglier ! » *(Elle ne donne plus la date d'arrivée.)*
  - « Depuis ces lettres, tout le monde rentre tôt. »
  - **Nouveau :** « Quelles nouvelles ? » : « Il pousse des champignons tout bizarres dans ma cave, violets, qui brillent dans le noir. Brr ! » Code de lieu rare pour l'Alchimiste.
- **Gaspard** : « Ma lettre a parfumé mes croissants aux fleurs. Beurk ! » ; « Au fournil, comme toujours. »
- **Tim** (place le matin et l'après-midi, chez lui au 7, rue des Lanternes, le soir et la nuit) :
  - « Salut les enquêteurs ! Pirate et moi, on vous doit un service. »
  - **Nouveau, ouvert par le code du Pisteur :** « Que faisais-tu sur les toits ? » : « Rien ! Je dormais, je n'ai rien vu du tout ! » *(Il ment.)* La vérité, après Démasquer : « Bon… j'étais sur les toits, comme souvent. La nuit dernière, j'ai vu la silhouette en cape glisser une lettre sous la porte de la mairie. Puis elle a filé dans la rue des Lanternes et elle est entrée dans une des maisons. Laquelle ? Je ne sais pas : la brume était trop épaisse. » *Prouve*, avec les adresses du registre : ce n'est ni Iris, ni Gaspard, ni Fortuné, ni Anselme.
- **Nouveau : les dépositions** (taverne, le soir), « La soirée d'avant-hier » :
  - **Margot** : « Il pleuvait à verse. Le colporteur est arrivé tout trempé et m'a pris une chambre. Anselme est venu après ses neuf coups de cloche. »
  - **Victor** : « Il pleuvait tellement que mes lettres étaient mouillées ! J'ai vu arriver la charrette du colporteur. Et la veille, on avait déjà trouvé une lettre du Corbeau sous une porte. »
  - **Anselme** : « J'ai sonné neuf coups, puis j'ai couru à la taverne sous la pluie. Un inconnu est arrivé avec une charrette, ce soir-là. »
  - **Fortuné** *(menteur)* : « Avant-hier ? Moi, j'étais déjà au village depuis une semaine ! Il faisait un temps magnifique, on voyait toutes les étoiles. »
  - Si on gagne, le carnet note : « Fortuné a menti : il est arrivé AVANT-HIER soir, sous la pluie. La première lettre du Corbeau, c'était la nuit d'avant : ce n'est donc pas lui qui a commencé. » *Prouve :* pas Fortuné.
- **L'écoute au lavoir** (le soir), mini-jeu *Les mots perdus*. Obligatoire. Elle n'a plus besoin de potion : « Cache-toi derrière les draps qui sèchent, et tends l'oreille ! » La potion d'invisibilité, Ombre ou le Cornet la rendent plus facile. Le texte est inchangé : « Ce soir, tu iras chercher la carte toute seule… Et mes dettes ? … Plus de rendez-vous au lavoir… » *Prouve :* pas au lavoir.

**Le Sage**

- **Les habitants** (le registre ci-dessus).
- **Les lettres du Corbeau** : trois lettres, les points sur les i sont des petits ronds. Il prête une lettre à l'Alchimiste par code.
- **Le Livre d'or** (1 action, à la mairie) : les i en petit rond sont ceux de Fortuné, Mélusine, Odette et Margot. Iris, Anselme et Gaspard font un point, Victor un petit trait.
- **Nouveau : la lettre de la mairie** : « Une lettre toute blanche, avec une plume dessinée en bas. De l'encre invisible ? » Avec l'encre de l'Alchimiste : « Des symboles apparaissent ! Il faut l'alphabet des fondateurs. »
- **Les archives scellées** (il faut la clé d'Anselme) : l'alphabet des fondateurs s'ouvre.
- **La lettre secrète**, mini-jeu *L'alphabet secret* (indice clé de voûte). Il faut à la fois les archives **et** la lettre révélée. « Le message dit : MINUIT À LA GRANDE VOIX. Mais qu'est-ce que la Grande Voix ? » Seul le Barde le sait, par Anselme.
- **Nouveau : les vieux plans du clocher**, mini-jeu *Superposer les plans* : « Sur le vieux plan, un escalier descend sous le clocher : l'escalier de la crypte ! Il n'existe plus sur les plans d'aujourd'hui. » Code de passage pour le Pisteur.
- **Nouveau : le nuancier des fondateurs** (code du coffre, facultatif). La page reste dans le Grand Livre toute la saison ; elle servira à l'enquête 4.
- **La carte des fondateurs** : la légende de la carte des passages secrets.
- **Les recettes** : l'encre révélatrice.
- **Pouvoirs de secours.**

### Le coffre de la crypte (facultatif, s'ouvre avec le Tir à l'arc)

| Pour | Ce qu'il y a | À quoi ça sert |
|---|---|---|
| Le Sage | le nuancier des fondateurs | les teintures anciennes, pour toute la saison (il sert à l'enquête 4) |
| L'Alchimiste | le coffret de teintures, et 2 poussières de lune | débloque l'analyse des couleurs dès maintenant (à l'enquête 3, plus besoin de demander à Mélusine) ; la poussière sert plus tard |
| Le Barde | la partition des fondateurs | si on la montre à Anselme : « Les fondateurs la chantaient pour ouvrir les portes, dit-on… » (graine pour l'enquête 6, la berceuse) |
| Le Pisteur | 15 pièces d'or anciennes | de l'or pour lui |

### Les faits (vérifiés par mon programme de brouillon)

| N° | Ce qu'il faut réunir | Ce que ça prouve |
|---|---|---|
| 1 | Pisteur : traces devant la porte + Sage : registre (pieds) | ni Victor, ni Anselme, ni Gaspard |
| 2 | Barde : les dépositions **ou** Fortuné démasqué | pas Fortuné (arrivé après la première lettre) |
| 3 | Sage : les lettres + Alchimiste : analyse de la lettre (lavande) + Barde : la liste d'Iris | ni Margot, ni Gaspard, ni Fortuné, ni Anselme |
| 4 | Sage : les lettres + le Livre d'or (points sur les i) | ni Iris, ni Gaspard, ni Anselme, ni Victor |
| 5 | Pisteur : Tim attrapé + Barde : Tim démasqué + Sage : registre (adresses) | ni Iris, ni Gaspard, ni Fortuné, ni Anselme |
| 6 | Pisteur : le Corbeau guetté (petit, rapide) + Sage : registre (canne, genou) | ni Odette, ni Anselme |
| 7 | Sage : la lettre secrète (avec l'encre de l'Alchimiste et la clé d'Anselme) + Barde : la Grande Voix | ni le lavoir, ni la mairie, ni le puits |
| 8 | Barde : l'écoute au lavoir | pas le lavoir |
| 9 | Pisteur : la grille du puits | pas le puits |

**Résultat :** avec toute l'équipe, il ne reste que Mélusine au clocher. Voici ce qui reste quand un rôle manque :

- sans le Pisteur : Mélusine ou Odette ;
- sans l'Alchimiste : 4 réponses possibles (Mélusine ou Margot, au clocher ou à la mairie) ;
- sans le Barde : 9 réponses ;
- sans le Sage : 14.

Chaque rôle est donc indispensable. Aucun joueur seul ne trouve la coupable : le Sage seul garde 4 suspects, les autres 7 ou 8.

### La soirée, moment par moment (estimation)

| Moment | Pisteur | Alchimiste | Barde | Sage | Le plus chargé |
|---|---|---|---|---|---|
| Matin | mairie : traces ; place : Tim (poursuite) | cueillir les baies ; cueillir l'eau | Anselme (la clé, la Grande Voix) ; Iris | lettres et Livre d'or ; plans du clocher (facultatif) | le Pisteur, environ 7 min |
| Après-midi | puits ; clocher (ou la crypte, facultatif) | encre (chaudron) ; lettre (bulles) | Tim, puis Démasquer ; Mélusine | archives ; lettre révélée | l'Alchimiste, environ 6 min |
| Soir | bonus, ou le coffre de la crypte (facultatif) | cave, élixir ou cape (tous facultatifs) | dépositions ; écoute au lavoir | lettre secrète (alphabet) | le Barde, environ 7 min |
| Nuit | guet devant la mairie (cachette) | grand ménage | Fortuné, puis Démasquer (facultatif) | pouvoirs de secours | le Pisteur, environ 4 min |

Le calcul donne environ 53 minutes. Avec les ratés, les nouveaux essais et un ou deux bonus, on arrive à **55 à 70 minutes**.

### Fausses pistes et mensonges

- **Fortuné** a vendu des plumes noires, ment sur sa bague et ment sur son arrivée. Le menteur des dépositions n'est pas le coupable.
- **Victor** livre le courrier, achète de la lavande et ment (ses poèmes).
- **Odette** : sa lettre sentait la lavande, elle achète de la lavande, ses i ont des ronds.
- **Margot** : ses i ont des ronds, et elle habite la même rue que Mélusine.
- **Iris** fabrique la lavande et a vu les chuchotements au lavoir.
- **Le lavoir** : les tasses de tisane, le rendez-vous secret.
- **La mairie** : la lettre glissée sous sa porte.
- **Le puits** : un ragot.

### Si un mini-jeu est raté (enquête 2 : indice partiel plus flou, un seul nouvel essai)

| Mini-jeu | Ce qu'on reçoit | Peut-on encore résoudre ? |
|---|---|---|
| Suivre la piste (la porte) | « Les traces se mélangent dans la boue… Elles partent vers la ruelle des Brumes. » (sans la taille) | Oui avec le nouvel essai ; sinon Victor reste en jeu (le fait n° 4 le raye quand même) |
| Se cacher (le Corbeau) | « La lanterne t'a presque trouvé ! Tu as juste vu une cape noire filer en sautant par-dessus les bancs. » | **Oui** : le partiel suffit pour le fait n° 6. Seul le morceau de cape est perdu. |
| Course-poursuite (Tim) | « Il est bien trop rapide… Tu as vu une casquette et une écharpe rouge disparaître derrière une cheminée. » | Oui, avec le nouvel essai ; sinon les faits n° 3 et n° 4 rayent les mêmes suspects |
| Tir à l'arc (le coffre) | « La flèche rebondit sur la pierre… Le coffre est toujours là-bas. » | Ne change rien à l'enquête |
| Le chaudron (l'encre) (CV) | Ingrédients perdus | Il faut recommencer, sinon la lettre secrète reste illisible et le OÙ n'est plus sûr |
| Les bulles (la lettre) (CV) | « Le papier est épais… et il sent une fleur. Laquelle ? Les bulles ont éclaté trop vite. » | Nouvel essai ; sinon Margot reste en jeu |
| Le double (cape, facultatif) | « Du tissu noir… Tu n'as pas eu le temps de comparer. » | Ne change rien (simple appui) |
| Les 7 différences (la cave) | Rien de cueilli | Ne change rien |
| Le grand ménage | 2 ingrédients mangés | Ne change rien à l'enquête, mais ça coûte des ingrédients |
| Repérer le mensonge | « Raté… Tu pourras réessayer à un autre moment. » (déjà dans le moteur) | Oui, à un autre moment |
| Les dépositions | « Tu n'as pas trouvé qui ment… Tu te souviens seulement qu'il pleuvait à verse avant-hier. » | Oui : démasquer Fortuné est un deuxième chemin |
| Les mots perdus (le lavoir) | « Tu as seulement compris les mots dettes et carte. » (déjà écrit) | Oui (le fait n° 7 suffit) |
| L'alphabet secret (CV) | « Tu as pu lire quelques mots : MINUIT… GRANDE… Le reste est trop abîmé. » | **Oui** : avec la Grande Voix d'Anselme, le partiel suffit |
| Superposer les plans | « Les plans ne coïncident pas… » | Ne change rien (pas de coffre) |

### Missions bonus (15 pièces d'or chacune, un seul essai)

- **Pisteur :** le voleur de carottes (Suivre la piste), à la lisière.
- **Alchimiste :** la confiture de Gaspard (Le bon mélange). On retrouve la couleur exacte de la confiture : c'est le même geste que l'analyse des couleurs. Cette mission s'ouvre même sans le coffret.
- **Barde :** les ragots de la taverne.
- **Sage :** le casse-tête du maire (La grille). Il confirme que le facteur n'apporte que du courrier timbré.

### La fin

1. À minuit, toute l'équipe se cache en haut du clocher, près de la Grande Voix. Les marches grincent… Une silhouette en cape noire couverte de plumes ouvre la petite trappe de la cloche.
2. « Pas si vite ! » Vous sortez de votre cachette. La capuche tombe : c'est Mélusine, la couturière !
3. Mélusine éclate en sanglots : « Pardon ! J'avais tant de dettes… Un homme masqué m'a promis de tout payer si je glissais ses lettres sous les portes et si je lui rapportais la carte cachée dans la cloche. J'ai cousu sa cape avec les plumes du colporteur. Je n'ai jamais vu son visage… mais il porte une bague en argent à tête de corbeau. »
4. *(nouveau)* Perché sur une poutre, Tim sourit jusqu'aux oreilles : « Je vous l'avais dit, qu'elle était entrée rue des Lanternes ! »
5. Dans la trappe, un vieux parchemin : la carte des souterrains de Brumeval ! Sous le village, des tunnels partout… et une grande croix rouge, juste sous la place.
6. Le maire arrive, tout essoufflé : « Bravo ! Donnez-moi cette carte, je vais la mettre en sécurité à la mairie. » Vous la lui remettez.
7. Il promet d'aider Mélusine à payer ses dettes, si elle aide les enquêteurs. Elle promet de vous coudre de vraies capes !
8. Mais au moment de partir, un grand battement d'ailes résonne là-haut. Sur la cloche, quelqu'un a épinglé un mot :
9. **« Merci pour la carte, petits enquêteurs. Le Corbeau »**

**Le calepin** garde :

- la lettre secrète était écrite sur le papier épais de la mairie ;
- la bague en argent à tête de corbeau ;
- « Chez les Grosbec, personne n'a jamais eu de don » ;
- la carte des souterrains remise au maire ;
- « Minuit à la Grande Voix » ;
- le mot du Corbeau ;
- *nouveau :* « Un tas de pierres bouche le tunnel de la crypte, vers le centre du village. »

**Si l'équipe perd :** « Minuit sonne… La Grande Voix se tait. Au matin, la trappe est vide : le Corbeau a emporté la carte des souterrains. La brume entre dans le village et efface vos souvenirs… »

**Mots sensibles :** mélusine, coud, couture, tissu, dette, grande voix. **Ajouter « couturi »** : aujourd'hui, le mot « couture » ne repère pas « couturière ».

---

## 7. Enquête 3 — Les feux du moulin (plus dure, mais on doit pouvoir y survivre)

> ⚠️ **Remplacé par le §13 « Enquête 3 — La lettre d'Odette »** (6 novembre 2026). Gardé seulement en archive : ne plus suivre ce chapitre.

**Ce qui change par rapport à la première version de ce document** (pour tenir en une soirée et ne pas effacer la famille) :

- **45 réponses possibles au lieu de 128** :
  - 5 suspects pour QUI : Fortuné, Farinel, Silas, Iris, Margot ;
  - 3 lieux pour OÙ : sous les meules, derrière la roue, sous le pont ;
  - 3 choix pour QUI L'AIDE : Basile, Silas, Farinel.
  Gaspard, Victor et Basile restent dans l'histoire, mais ne sont plus suspects du vol. La grange disparaît des lieux.
- **Le bon mélange devient obligatoire (Décidé).** C'est la couleur d'un fil vert qui innocente Silas et Iris. Si l'équipe n'a pas trouvé le coffret de teintures à l'enquête 2, Mélusine prête le sien.
- **On retire plusieurs étapes, pour gagner du temps** :
  - l'analyse de l'éclat de verre (elle faisait double emploi avec la couleur) ;
  - la charrette de farine de Margot ;
  - les trous de la clairière.
- **Le coffre du vieux tunnel reste, mais il est entièrement facultatif** : on l'ouvre seulement s'il reste du temps et des actions.
- **L'Élixir du Cœur vaillant est dans le Grand Livre du Sage** : l'Alchimiste peut toujours le préparer pendant l'enquête.
- **« QUI l'aide ? » reste la troisième question (Décidé).** Les questions « POURQUOI » viendront à partir de l'enquête 4.

**Moments :** matin, après-midi, soir, nuit. **Durée estimée :** 60 à 75 minutes.

### La lettre d'ouverture

> Chers enquêteurs, depuis trois nuits, des lumières vertes dansent au vieux moulin, et chaque matin, un sac de farine a disparu ! Gaspard accuse le meunier, le meunier jure qu'il n'y est pour rien, et tout le village se dispute. Gaspard dit aussi que ces sacs sont bien trop lourds pour une seule personne… J'ai embauché un garde champêtre, Silas, mais il ne voit rien. Trouvez QUI vole la farine, OÙ, dans le moulin, il cache son secret… et QUI l'aide à porter les sacs !
> — Monsieur Grosbec, maire de Brumeval

### La solution

- **QUI :** Fortuné, le colporteur. Il creuse sous le moulin avec une fausse carte au trésor, vendue par « un homme masqué à la voix grave ».
- **OÙ :** sous les meules.
- **QUI L'AIDE :** Basile, le jardinier, payé en graines de citrouille géante.
- **L'histoire, en clair :** chaque nuit, Fortuné vide un sac de farine (une partie se renverse par terre), le remplit de la terre de son trou, et Basile va jeter la terre dans la rivière, sous le pont. En se glissant sous le plancher, Fortuné a laissé un fil de son gilet vert perroquet sur une écharde.
- **Suspects :** Fortuné, Farinel, Silas, Iris, Margot.
- **Lieux :** sous les meules, derrière la roue, sous le pont.
- **Pour l'aide :** Basile, Silas, Farinel.

**Le registre du Sage :**

| Habitant | Maison | Pieds | Note |
|---|---|---|---|
| Fortuné | une chambre à la taverne | 4 | colporteur, arrivé la semaine dernière |
| Farinel | le moulin | 5 | meunier, gros sabots |
| Silas | 1, ruelle des Brumes | 4 | nouveau garde, embauché par le maire cette semaine |
| Iris | 4, rue du Four | 4 | cueille certaines plantes la nuit |
| Margot | 1, rue des Lanternes | 4 | la taverne ferme à 1 heure du matin |
| Basile | 3, ruelle des Brumes | 5 | son potager est en face du moulin, de l'autre côté de la rivière |

### Les sources d'indices

**Le Pisteur**

- **Moulin, la farine renversée** (matin, après-midi, soir), mini-jeu *Suivre la piste* : « Dans la farine renversée : des empreintes de bottes à clous, de 4 carreaux. Ce ne sont pas celles du meunier : ses gros sabots font 5 carreaux. » *Prouve*, avec le registre : ce n'est pas Farinel.
- **Moulin, une écharde du plancher** : « Un fil vert accroché à une écharde, tout près des meules. Quelqu'un est passé par là en se baissant. » Code du fil pour l'Alchimiste.
- **Moulin, les meules** : « Autour des meules, le plancher est couvert d'une poussière grise… pas blanche comme la farine ! » Code pour l'Alchimiste.
- **Moulin la nuit, se cacher et guetter**, mini-jeu *Se cacher*. Il faut de la lumière : la potion de lumière de l'Alchimiste, la Lanterne sourde ou Vision de nuit. « Tu te caches entre deux sacs… Une lumière verte entre dans le moulin, traverse la grande salle… puis disparaît d'un coup, comme si elle s'enfonçait dans le sol. Dehors, une lanterne ROUGE passe devant la fenêtre… et ne s'arrête pas. » *Prouve :* pas sous le pont (c'est dans le moulin). La lanterne rouge est une graine sur Silas.
- **Pont, sous le pont** (tous les moments) : « Des tas de terre grise jetés dans la rivière, et des sacs de farine vides, tout mouillés. Dans la boue, de GROSSES empreintes de 5 carreaux vont du moulin jusqu'au pont… et reviennent. » *Prouve*, avec le registre : le porteur n'est pas Silas (4 carreaux).
- **Pont le soir et la nuit, quelqu'un au bord de l'eau**, mini-jeu *Course-poursuite* : « Une grande silhouette vide un sac dans la rivière… Elle te voit et s'enfuit dans le brouillard ! Tu cours, tu sautes les flaques… et tu l'attrapes par sa salopette : c'est Basile, le jardinier ! Il est tout rouge : « Je ne suis pas coupable, j'ai eu peur, je me suis enfui, mais je n'ai rien fait ! » Donne son code au Barde. » Code du témoin Basile pour le Barde.
- **Facultatif : le vieux tunnel sous le pont** (après le code de passage du Sage) : « Sous l'arche du pont, derrière les ronces, une vieille porte de bois ! Le tunnel est plein de toiles d'araignée : personne n'est passé ici depuis des centaines d'années. Au bout, un éboulement… et au-dessus de ta tête, toc… toc… : quelqu'un creuse, juste au-dessus, sous le moulin ! Contre le mur, un coffre fermé par une serrure de runes. » *Prouve :* pas sous le pont. C'est un deuxième chemin, à côté du guet de nuit. Code de la serrure pour le Sage.

**L'Alchimiste**

- **Potion de lumière**, mini-jeu *Le chaudron*. Pour le Pisteur, la nuit au moulin.
- **Analyse de la poussière**, mini-jeu *Les bulles magiques* : « Ce n'est pas de la farine : c'est de la terre et de la pierre broyée, comme quand on creuse très profond. Il y en a beaucoup trop pour venir de dehors. » *Prouve*, avec les meules du Pisteur : pas derrière la roue.
- **Analyse de la couleur du fil**, mini-jeu *Le bon mélange* (indice clé de voûte). Il faut le coffret de teintures : celui du coffre de l'enquête 2, ou la boîte que Mélusine prête. « Ta teinture : 3 trèfles, 1 pensée, 1 poussière de lune. » Elle le dit au Sage, qui cherche dans le carnet de Mélusine. *Prouve :* ni Silas, ni Iris.
- **Le grand ménage du labo** (événement, au début de la nuit).
- **Facultatif :**
  - l'**Élixir du Cœur vaillant** (Le chaudron ; recette lue par le Sage). Je le recommande, mais il reste facultatif ;
  - les **épis d'argent** derrière le moulin (Les 7 différences, décor du moulin), sur le code d'Iris. Les charançons cachés dans les épis font venir le grand ménage plus tôt ;
  - les recettes **Main verte** et **Œil de lynx**, et le **grand bocal des fondateurs**, dans le coffre.

**Elle joue 4 mini-jeux obligatoires** (chaudron, bulles, bon mélange, ménage), et 5 avec l'élixir.

**Le Barde**

- **Farinel** (moulin ; taverne le soir) :
  - « Trois sacs en trois nuits ! Et je n'y suis pour rien ! Je dors comme une souche. »
  - « Ma grosse meule fait un drôle de bruit depuis trois jours. Boum, boum… comme si elle tournait au-dessus d'un trou ! Mais la roue, elle, tourne comme une horloge. » Ce fait sert pour le OÙ.
- **Mélusine** (nouveau ; dans son atelier, au 4, rue des Lanternes) : « Mélusine, vous connaissez les teintures ? » : « Toutes ! Tenez, voici mon carnet de couleurs : chaque couleur que j'ai cousue au village, avec sa recette. Et si votre Alchimiste n'a pas de quoi faire des teintures, prenez ma boîte, je vous la prête. » Deux codes : le carnet pour le Sage, et la boîte de teintures pour l'Alchimiste. Elle n'en a pas besoin si elle a déjà le coffret.
- **Silas** (mairie, place, pont le soir, moulin la nuit) :
  - « Silas Sec, nouveau garde. Le maire m'a embauché. Je surveille TOUT. »
  - « Ma lanterne de garde est rouge, réglementaire. Je ne m'en sépare jamais. »
  - « Les lumières ? Rien à signaler. Circulez. » *(Il ment.)* La vérité : « Bon… si, j'ai vu une lumière verte. Mais le maire m'a dit de ne pas m'en occuper. Il a dit que ça le regardait. » *Graine, et fausse piste pour l'aide.*
- **Fortuné** (place le matin et l'après-midi, taverne le soir ; **la nuit, on ne sait pas où il est**) :
  - « Je dormais à la taverne. » *(Il ment.)* La vérité : « Bon… je suis sorti. Je cherchais… des champignons. Oui, voilà ! »
  - « Que vendez-vous ? » : « Des lanternes de voyage au verre vert, des pastilles à la réglisse, des chapeaux… et des pastilles pour changer de voix ! J'en ai vendu une boîte à un monsieur masqué. » *(Marqué « ne compte pas seul ».)*
  - « Rien acheté ! » *(Il ment.)* La vérité : « Une vieille carte, à un homme masqué à la voix toute grave. »
- **Victor** (poste, place, taverne le soir ; il n'est plus suspect) :
  - « À la taverne jusqu'à minuit. »
  - « Margot n'a pas quitté son comptoir de toute la nuit, je te le jure ! » *Douteux : Victor est parti à minuit.* Il faut la grille du Sage pour le confirmer.
- **Margot** (taverne) :
  - « Qui est passé hier soir ? » : « Victor jusqu'à minuit. Basile, pour une soupe : il est reparti vers le pont, bizarre ! Et Iris, vers dix heures, avant d'aller cueillir. » Basile vers le pont est une piste pour l'aide.
  - « Qui loge chez vous ? » : « Le colporteur. Il paie bien, c'est tout ce que je sais. » *(Marqué « ne compte pas ».)*
- **Iris** (herboristerie ; taverne le soir), facultatif : « Où étiez-vous la nuit dernière ? » : « À la clairière, à cueillir des champignons lumineux. » *(Elle ment.)* La vérité : « D'accord… j'étais derrière le moulin, à cueillir des épis d'argent, une plante très rare qui pousse près des vieilles meules. J'ai vu une lumière verte entrer dans le moulin… et j'ai eu peur qu'on m'accuse. » Code de lieu rare pour l'Alchimiste.
- **Basile** (potager ; taverne le soir ; chez lui la nuit) :
  - « Les lumières ? Je me couche avec les poules ! » *(Il ment.)* La vérité : « Bon… je sors la nuit. Mais je ne dirai pas pourquoi ! » *(Marqué « sortir la nuit ne prouve rien ».)*
  - **Ouvert par le code du Pisteur :** « Que faisais-tu au bord de l'eau ? » : « Je… je promenais mon cochon ! » *(Il ment.)* La vérité, après Démasquer : « Bon, d'accord… Je porte des sacs de terre du moulin jusqu'au pont, et je les vide dans la rivière. Un homme me paie en graines de citrouille géante. Il reste au fond de son trou : je ne vois jamais son visage. Mais il suce tout le temps des pastilles à la réglisse. » *Prouve :* c'est lui le porteur, ni Silas, ni Farinel. La réglisse est une piste vers Fortuné.
- **Les dépositions** (taverne, le soir), « La nuit dernière » :
  - **Margot** : « Vers minuit, on a entendu des coups sourds, BOUM… BOUM…, du côté du moulin. Il y avait un brouillard épais sur la rivière. »
  - **Victor** : « En rentrant à minuit, j'ai entendu les coups, et le meunier qui ronflait si fort qu'on l'entendait jusqu'au pont ! »
  - **Gaspard** : « De mon fournil, j'ai vu le garde passer devant le moulin avec sa lanterne rouge, à minuit pile. Il ne s'est même pas arrêté. Et quel brouillard ! »
  - **Iris** *(menteuse)* : « J'étais à la clairière, loin du moulin. Il n'y avait pas un brin de brouillard, et je n'ai rien entendu du tout. »
  - Si on gagne, le carnet note : « Iris a menti sur la nuit dernière. Tout le monde a entendu des coups sourds vers minuit… et le meunier ronfler jusqu'au pont : il dormait. Le garde est passé devant le moulin à minuit, sans s'arrêter. » *Prouve :* Farinel n'est pas le porteur. Le garde est une graine.

**Le Sage**

- **Les habitants** (le registre ci-dessus).
- **Les vieux plans du moulin**, mini-jeu *Superposer les plans* : « Sur le vieux plan, deux choses ont disparu des plans d'aujourd'hui : une cave sous les meules, avec un escalier, et un vieux tunnel sous l'arche du pont. Sous la roue : rien du tout. » *Prouve*, avec la meule qui sonne creux (Farinel) : pas derrière la roue. Code de passage du tunnel pour le Pisteur (facultatif).
- **« Où était chacun à minuit ? »**, mini-jeu *La grille* (indice clé de voûte). Il y a 4 personnes (Margot, Victor, Gaspard, Silas), 4 lieux (la taverne, la rue des Lanternes, le fournil, le moulin) et 4 objets tenus en main (une louche, une sacoche, une pelle à pain, une lanterne rouge). La solution :
  - Margot, à la taverne, avec la louche ;
  - Victor, dans la rue des Lanternes, avec sa sacoche ;
  - Gaspard, au fournil, avec la pelle à pain ;
  - Silas, au moulin, avec la lanterne rouge.
  Les indices sont à écrire et à vérifier avec le solveur, comme le casse-tête du maire. Si on gagne : « C'est confirmé : à minuit, Margot servait la soupe à la taverne, et elle a fermé à 1 heure. Elle n'a pas pu aller au moulin. Et autre chose : à minuit, Silas était AU MOULIN… alors que son rapport dit « rien à signaler ». » *Prouve*, avec la parole de Victor : ce n'est pas Margot.
- **Nouveau : le carnet de couleurs de Mélusine** (code du Barde) : « Vert sapin (2 trèfles, 1 baie) : le képi de Silas, le garde. Vert pomme (2 trèfles, 1 pensée) : le tablier d'Iris. Vert perroquet (3 trèfles, 1 pensée, 1 poussière de lune) : je ne l'ai jamais cousu ! Ce n'est pas une couleur de Brumeval, c'est une couleur de voyage. » Le Sage compare avec la teinture que l'Alchimiste lui dicte.
- **Le rapport du garde** (1 action, à la mairie) : « 22 heures : la taverne est pleine. 23 heures : Iris Lavandin cueille à la clairière, avec sa lanterne jaune. Minuit : rien à signaler au moulin. 1 heure : tout le monde dort. » *Fausse piste :* ce rapport est faux, et la grille le montre.
- **Les recettes** : l'Élixir du Cœur vaillant, à lire à l'Alchimiste.
- **Facultatif :** la serrure du coffre (*Assembler les runes*), puis la page de grimoire (*L'alphabet secret*), qui donne la recette de l'Œil de lynx.
- **Pouvoirs de secours.**

### Le coffre du vieux tunnel (entièrement facultatif, serrure de runes)

| Pour | Ce qu'il y a | À quoi ça sert |
|---|---|---|
| Le Sage | une page de grimoire en alphabet secret, et un parchemin | la page, une fois déchiffrée, donne l'Œil de lynx ; le parchemin donne la Main verte |
| L'Alchimiste | le grand bocal des fondateurs, et 2 racines séchées du Vieux Chêne | protège des bestioles ; des ingrédients rares |
| Le Barde | le registre des gardiens de la trappe : « Depuis trois cents ans, la clé de la trappe du moulin est gardée par… la famille Grosbec. » | graine pour l'enquête 8 |
| Le Pisteur | 20 pièces d'or anciennes | de l'or pour lui |

### Les faits (re-vérifiés par mon programme de brouillon)

| N° | Ce qu'il faut réunir | Ce que ça prouve |
|---|---|---|
| **QUI vole la farine ?** | | |
| 1 | Pisteur : traces dans la farine + Sage : registre (pieds) | pas Farinel |
| 2 | Pisteur : le fil vert + Alchimiste : couleur du fil + Sage : carnet de Mélusine (donné par le Barde) | ni Silas, ni Iris |
| 3 | Barde : la parole de Victor + Sage : la grille qui confirme | pas Margot |
| **OÙ se cache son secret ?** | | |
| 4 | Pisteur : le guet de nuit (avec la lumière de l'Alchimiste) | pas sous le pont |
| 5 | Pisteur : le vieux tunnel, ouvert par les plans du Sage *(chemin de secours)* | pas sous le pont |
| 6 | Sage : les vieux plans + Barde : la meule qui sonne creux | pas derrière la roue |
| 7 | Pisteur : la poussière des meules + Alchimiste : analyse de la poussière *(chemin de secours)* | pas derrière la roue |
| **QUI l'aide à porter les sacs ?** | | |
| 8 | Pisteur : Basile attrapé + Barde : Basile démasqué | ni Silas, ni Farinel |
| 9 | Pisteur : grosses empreintes sous le pont + Sage : registre (pieds) | pas Silas |
| 10 | Barde : les dépositions (le meunier ronflait) *(avec le fait n° 9, chemin de secours du n° 8)* | pas Farinel |

**Résultat :** avec toute l'équipe, il ne reste que Fortuné, sous les meules, aidé par Basile. Voici ce qui reste quand un rôle manque :

- sans le Pisteur : 16 réponses possibles ;
- sans l'Alchimiste : 3 ;
- sans le Barde : 8 ;
- sans le Sage : 5.

Chaque rôle est donc indispensable. Aucun joueur seul ne réduit les suspects : chacun garde les 5.

**On doit pouvoir survivre à l'enquête 3.** Il y a trois indices clés de voûte, sur trois rôles différents :

- **les traces dans la farine (Pisteur)** : l'indice partiel (« ce ne sont pas des sabots ») suffit à innocenter Farinel. Dans les faits, ce n'est plus un danger ;
- **la couleur du fil (Alchimiste)** : si elle est ratée pour de bon, il reste Fortuné, Silas ou Iris. C'est 3 réponses, une fois le OÙ et l'aide trouvés, pour 3 cœurs (4 avec l'élixir) ;
- **la grille (Sage)** : si elle est ratée pour de bon, il reste Fortuné ou Margot. C'est 2 réponses.

Si la couleur et la grille sont ratées toutes les deux, il reste 4 réponses, pour 3 cœurs plus l'élixir. L'équipe survit encore, de justesse. Avant d'en arriver là, il y a un nouvel essai pour chaque mini-jeu, et les pouvoirs du Sage. Rater des mini-jeux ne suffit donc pas à perdre l'enquête 3 : il faut aussi se tromper de raisonnement sur le OÙ ou sur l'aide. La phrase « Une partie de votre accusation est juste » aide à s'en rendre compte.

### La soirée, moment par moment (estimation)

| Moment | Pisteur | Alchimiste | Barde | Sage | Le plus chargé |
|---|---|---|---|---|---|
| Matin | moulin : traces, fil, meules ; pont : empreintes | cueillir le miel et les pensées ; cueillir les champignons | Farinel ; Mélusine (deux codes) | registre ; plans | le Pisteur, environ 5 min |
| Après-midi | libre : tunnel facultatif ou bonus | poussière (bulles) ; couleur du fil (bon mélange) | Victor ; Silas | grille ; carnet (comparer avec l'Alchimiste) | l'Alchimiste, environ 6 min |
| Soir | poursuite au pont | lumière (chaudron) ; élixir (chaudron, facultatif) | dépositions ; Iris (facultatif) | rapport ; serrure du coffre (facultatif) | l'Alchimiste, environ 6 min |
| Nuit | guet au moulin (cachette) | grand ménage | Basile, puis Démasquer | pouvoirs de secours | le Barde, environ 4 min |

Le calcul donne environ 52 minutes. Avec les ratés, les nouveaux essais et un ou deux bonus, on arrive à **60 à 75 minutes**.

### Fausses pistes et mensonges

- **Farinel** : accusé par Gaspard et par les ragots.
- **Silas** : il ment, sa lanterne est au moulin à minuit, son rapport est faux. C'est la fausse piste la plus forte, pour le QUI comme pour l'aide.
- **Iris** : elle ment sur sa nuit, sort la nuit, a des pieds de 4 carreaux, et un ragot parle de sa « lanterne magique ».
- **Margot** : un alibi douteux, un ragot sur ses crêpes, des pieds de 4 carreaux.
- **Basile** : il a l'air coupable, mais il n'est que le porteur.
- **Le pont** : le tunnel, la terre grise. **La roue** : un ragot de barque.

**Quatre menteurs :** Fortuné (deux mensonges), Silas, Iris (aussi dans les dépositions), Basile (deux mensonges).

### Si un mini-jeu est raté (enquête 3 : indice partiel seulement pour les clés de voûte, un seul nouvel essai)

| Mini-jeu | Ce qu'on reçoit | Peut-on encore résoudre ? |
|---|---|---|
| Suivre la piste (la farine) (CV) | « Le vent a soufflé la farine… Tu as juste vu des marques de clous : ce ne sont pas des sabots. » | **Oui** : le partiel suffit à innocenter Farinel |
| Le bon mélange (le fil) (CV) | « C'est un vert… mais lequel ? Tu n'as pas trouvé la bonne nuance. » | Avec le nouvel essai ou un pouvoir du Sage ; sinon il reste Silas et Iris, et l'équipe a assez de cœurs pour survivre (voir plus haut) |
| La grille (CV) | Rien. Le Sage peut rejouer une fois, ou utiliser ses propres pouvoirs. | Sinon il reste Margot, et l'équipe a assez de cœurs pour survivre |
| Se cacher (la nuit) | Rien | Oui, si le tunnel a été exploré ; sinon le pont reste possible |
| Course-poursuite (Basile) | Rien | Oui : les empreintes et les dépositions donnent aussi l'aide |
| Les bulles (la poussière) | Rien | Oui : les plans et la meule rayent aussi la roue |
| Le chaudron (la lumière) | Ingrédients perdus | Oui : la Lanterne sourde (à acheter à tout moment) ou Vision de nuit marchent aussi, et le tunnel raye le pont |
| Superposer les plans | Rien | Oui, par la poussière ; mais on perd le tunnel et le coffre |
| Les dépositions | Rien | Oui : la poursuite donne l'aide |
| Repérer le mensonge (Basile) | Raté, on réessaie à un autre moment | Il faut le réussir avant la fin de la nuit ; sinon les empreintes et les dépositions suffisent |
| Runes, alphabet, 7 différences | Rien | Ne change rien (facultatif) |
| Le grand ménage | 2 ingrédients mangés | Ne change rien à l'enquête |

### Missions bonus (20 pièces d'or chacune, un seul essai, facultatives)

- **Pisteur :** « La girouette du moulin » (Tir à l'arc). La girouette est coincée : tire dans la goupille.
- **Alchimiste :** « Les bouquets d'Iris » (Les 7 différences, décor de l'herboristerie) ; « Le jeu de cartes du colporteur » (Le double, sur la place).
- **Barde :** « Les ragots de la taverne » ; « Le concours de menteurs » (Repérer le mensonge).
- **Sage :** « La devise des fondateurs » (L'alphabet secret).

### La fin

1. Au petit matin, toute l'équipe descend dans le moulin. Vous poussez les grosses meules… Dessous, une trappe ! Et tout au fond, des bruits de pelle.
2. « Sortez de là ! » Une tête couverte de poussière grise apparaît, avec un chapeau à plume tout cabossé, et un gilet vert perroquet tout déchiré : c'est Fortuné, le colporteur !
3. Fortuné bafouille : « Je voulais juste trouver le trésor ! Un homme masqué m'a vendu cette carte. Il avait une voix toute grave… et pour cause : la veille, je lui avais vendu mes pastilles pour changer de voix ! »
4. Basile baisse la tête, tout rouge : « Et moi, je portais les sacs de terre jusqu'au pont… Il m'avait promis des graines de citrouille géante. Je voulais tant gagner le concours ! »
5. « Je vidais un sac de farine, je le remplissais de terre, et Basile allait la jeter sous le pont, explique Fortuné. Je comptais tout rembourser ! »
6. La carte au trésor est fausse : il n'y a pas de trésor. Mais au fond du trou, vous découvrez un vieux tunnel de pierre… et une grosse pierre gravée de quatre symboles : un œil, un chaudron, une lyre et une étoile. Au milieu, un cinquième creux, vide, en forme de plume.
7. Silas, le garde champêtre, arrive en courant, suivi du maire, tout sourire. Le maire vous félicite, fait refermer la trappe… et garde la clé dans sa poche. « C'est plus prudent. »
8. Fortuné rend la farine au meunier, Basile replante ses carottes, et Gaspard reçoit des pastilles à la menthe pour se faire pardonner. Tout le village fait la paix.
9. En repartant, vous croisez Silas qui écrit quelque chose dans un petit carnet noir. Quand il vous voit, il le referme d'un coup sec…

**Le calepin** garde :

- les pastilles pour changer de voix ;
- la pierre aux quatre symboles ;
- la clé de la trappe gardée par le maire ;
- « À minuit, Silas était au moulin, mais son rapport dit « rien à signaler » » (confirmé par la grille) ;
- « Silas : le maire m'a dit de ne pas m'occuper des lumières » ;
- Silas, embauché par le maire ;
- si le coffre a été ouvert : « Depuis 300 ans, la famille Grosbec garde la clé de la trappe du moulin. »

**Si l'équipe perd :** « Au matin, le trou sous les meules est vide : le voleur a filé avec sa pelle. Le village se dispute encore, et le maire vous renvoie chez vous. La brume monte de la rivière et efface vos souvenirs… »

**Mots sensibles :** fortuné, colporteur, pastille, pelle, trésor, verre vert, sous le plancher, cave, réglisse. Avec trois questions, je propose d'étendre la règle à **toutes les réponses**, pas seulement au coupable. On ajoute alors basile, citrouille et « porte des sacs ». Les textes du Pisteur et du Barde qui nomment Basile font partie de faits prévus : ils restent permis. Le carnet de Mélusine parle d'une « couleur de voyage » sans nommer personne, et le Sage ne sait pas, tout seul, de quel vert est le fil.

---

## 8. Enquêtes 4, 5… et 10

Elles ne sont pas encore écrites. Voici ce qui est prévu, d'après la bible et les décisions de Romain, pour que le tableau du chapitre 4 tienne.

**Ce qui change à partir de l'enquête 4 :**

- **Plus d'indice partiel**, un seul essai par mini-jeu (sauf les pouvoirs du Sage).
- **La troisième question devient souvent un « POURQUOI » (Décidé)** : on cherche QUI, OÙ et POURQUOI. Les choix du POURQUOI doivent dépendre d'indices différents de ceux du OÙ. Sinon, comme je l'avais remarqué pour l'enquête 3, les deux réponses tombent ensemble.
- **Entre 50 et 100 réponses possibles**, avec 3 cœurs jusqu'à l'enquête 5, puis 2 cœurs à partir de l'enquête 6 (Proposition, § 2.1).
- **Toujours une soirée par enquête**, avec le même budget qu'au § 1.4.

**Nouveau (Décidé, 3 novembre) : la fin de l'enquête 3 démasque le maire.**
- Après les trois bonnes réponses, le Sage a une quatrième question : « QUI est le Corbeau ? » (Grosbec, Silas, Fortuné). Elle ne coûte aucun cœur ; la réponse est gardée (`P.corbeau`). Silas est arrivé cette semaine alors que le Corbeau veille depuis l'enquête 1 ; Fortuné a été trompé par l'homme masqué.
- La fin est la même sur toutes les tablettes : le soir même, le maire retire ses gants, la bague à tête de corbeau apparaît, « Gardes, arrêtez-les ! ». Dernière image : le héros de la tablette au cachot de la mairie, avec les trois autres enquêteurs en ombres, et le mot du Corbeau.
- **Proposition pour l'enquête 4 (pas encore validée)** : elle commence au cachot, chacun s'évade avec son rôle (le Pisteur vole les clés, le Barde endort ou convainc le garde, l'Alchimiste ronge un barreau, le Sage trouve le passage), et il faut les codes des quatre pour la dernière porte. Ensuite, le maire a disparu sous terre. Pour la suite de la saison : un complice caché par enquête (ensorcelé par la brume plutôt que méchant), et la course aux quatre sceaux pour la pierre du moulin.

**Enquête 4 — Les bruits sous la place.** Silas pose des pièges dans les tunnels. C'est le Pisteur qui est en vedette. On y trouve le Sceau de la Pisteuse, que le maire veut « pour le musée de la mairie ».

- **Exemple de POURQUOI :** « POURQUOI pose-t-il des pièges ? ». Les choix : pour attraper un voleur, pour faire peur au village, pour garder les tunnels secrets, pour protéger le sceau.
- **Le courant d'air froid** de l'enquête 1 est compris : c'est l'entrée du tunnel du Chêne. C'est le premier grand « Relier » du calepin.
- **Le Sage** superpose les plans du village (la croix sous la place, la cachette sous la mairie).
- **Le Pisteur** :
  - suit les pas dans les tunnels, à la lanterne ;
  - se cache pendant les rondes de Silas ;
  - coupe la corde d'un piège avec une flèche ;
  - poursuit un témoin dans les tunnels.
- **L'Alchimiste** :
  - analyse le mécanisme d'un piège (Le double) ;
  - reproduit la peinture rouge des flèches tracées sur les murs, qui est celle des volets de la mairie (Le bon mélange). Elle a besoin du nuancier des fondateurs : si l'équipe ne l'a pas trouvé à l'enquête 2, un coffre de l'enquête 4 le donne ;
  - cueille la poussière de lune au fond du puits, sur un code du Pisteur.
- **Le Barde** :
  - écoute les voix sous la place, à travers une grille (Les mots perdus) ;
  - démasque Silas ;
  - fait des dépositions sur la place.
- **Le Sceau de la Pisteuse** s'ouvre avec Assembler les runes.
- **Un coffre peut contenir un indice clé de voûte.**
- **Attention :** Silas a été une fausse piste très forte à l'enquête 3, et les enfants vont le soupçonner tout de suite. Le QUI de l'enquête 4 doit donc lui donner un alibi solide à faire tomber. La difficulté peut aussi venir surtout du POURQUOI.

**Enquête 5 — La fièvre de brume.** Des villageois s'endorment et oublient. Silas ronge un sceau avec un acide. C'est l'Alchimiste qui est en vedette. On y trouve le Sceau de l'Alchimiste, qui s'ouvre avec l'antidote.

- **Exemple de POURQUOI :** « POURQUOI les villageois s'endorment-ils ? ». Les choix : une potion dans l'eau du puits, la brume du lavoir, les vapeurs de l'acide qui ronge le sceau, une maladie.
- **L'Alchimiste** :
  - prépare l'antidote (Le chaudron) ;
  - rend la mémoire aux endormis (Les bulles magiques) ;
  - reconnaît l'acide à sa couleur (Le bon mélange) ;
  - compare les traces d'acide (Le double).
- **Le Barde** :
  - récupère les souvenirs en morceaux (Les mots perdus) ;
  - fait des dépositions avec un piège : ceux qui ont oublié se contredisent sans mentir. Il faut repérer celui qui ment *vraiment*.
- **Le Pisteur** suit les pas des endormis.
- **Le Sage** remplit une grille et ouvre le sceau avec les runes.

**Enquêtes 6 à 9** : la berceuse et le Sceau de la Barde, la bibliothèque et le Sceau du Sage, le masque qui tombe, la brume qui se lève. Trois questions, avec 2 cœurs (Proposition). Aucun indice partiel, un seul essai par mini-jeu.

**Enquête 10, le grand final (à concevoir à part, pas maintenant).** Elle se joue après les enquêtes 4 à 9 :

- une bataille finale, avec des attaques spéciales pour chaque héros ;
- l'Alchimiste distribue ses potions pendant le combat ;
- les héros touchés sont « mis sur la touche », jamais morts ;
- le méchant, Monsieur Grosbec, est vaincu mais s'échappe dans la brume. Cela ouvre les enquêtes 11 à 20.

Le moteur devra prévoir des mini-jeux nouveaux, et un état « sur la touche » qui n'a rien à voir avec la défaite.

**La carte du Pisteur, à partir de l'enquête 4 (Proposition, pas encore construite).** « Lui, c'est vraiment le gars qui s'occupe des cartes. » Depuis l'enquête 1, il est le seul à avoir la carte des sous-sols (« 🏘️ Village / 🕳️ Sous-sols », dans l'onglet Carte et sur le mur de sa cabane). Elle se remplit quand il explore, et elle reste toute la saison. Fouiller sous terre ne lui coûte aucune action : chaque passage trouvé lui donne de quoi chercher plus. Trois idées pour la suite, toutes visibles **seulement sur sa carte** :

- **Les grilles d'écoute.** Sous certaines rues, une grille donne sur un tunnel. En bas, il entend une conversation (un court texte, ou Les mots perdus). Il la note, et son code passe au Barde, qui s'en sert pour faire avouer quelqu'un. C'est le Barde qui interroge, le Pisteur qui écoute.
- **La surveillance de nuit.** Certains moments, des rues sont gardées (Silas et sa lanterne). Elles s'affichent en rouge sur sa carte, et les lieux au bout sont fermés pour lui. Pour y aller, deux façons : traverser en se cachant (le mini-jeu Se cacher), ou passer par les sous-sols s'il connaît un tunnel. Les autres rôles ne voient rien : c'est lui qui doit leur dire « n'y allez pas ce soir ».
- **La filature.** À chaque moment, des traces fraîches relient deux lieux (une flèche de pas sur sa carte). Il peut les suivre pour savoir où est allé quelqu'un. Les traces changent d'un moment à l'autre : il faut regarder au bon moment, et le dire à l'équipe.

Les données sont déjà prêtes (`src/souterrains.js`) :

- `lieux` : les lieux souterrains ; un lieu d'enquête peut aussi porter `souterrain:true` ;
- `elements` : salles, mystères, entrées et passages, avec l'enquête où ils se découvrent et leurs conditions ;
- `ecoute` : les grilles ;
- `surveillance` et `traces` : par enquête et par moment.

Pour les brancher, il faudra une couche de plus sur sa carte, et une règle dans le moteur pour les rues gardées (un `verrou` par moment).

---

## 9. Ce qu'il faut construire ou changer (en mots simples)

Dans l'ordre où on en aura besoin. **Déjà fait par Romain :** le niveau figé des mini-jeux (tir, poursuite, mélange et grille ne montent plus).

**Pour rejouer l'enquête 1 avec les nouvelles règles**

1. **Les cœurs et la défaite.** Les 3 cœurs du Sage, un code de défaite que les autres tapent, la fin perdue, le Livre des Légendes et l'effacement des héros. Tout est effacé, décoration de l'atelier comprise (décision du 3 novembre) ; on propose seulement « Reprendre la même apparence ». « Abandonner » devient une défaite. Un avertissement avant la première enquête. Plus tard, le passage à 2 cœurs, selon le numéro de l'enquête.
2. **Les pouvoirs de secours du Sage, avec un seul code.** Le Sage choisit le pouvoir et l'équipier, et son écran donne un code. L'équipier tape le code, puis choisit lui-même quel mini-jeu raté rattraper. Le pouvoir attend dans son sac s'il n'a encore rien raté. On compte les utilisations : par enquête, et pour la saison pour la Page des Fondateurs.
3. **Le filet qui s'efface.** Chaque enquête dit si un mini-jeu raté donne un indice partiel (toujours, seulement les clés de voûte, ou jamais) et combien de fois on peut rejouer. Chaque point de mini-jeu a son texte d'indice partiel.
4. **La boutique à tout moment**, même pendant une enquête, et la revente à moitié prix.
5. **Les nouvelles raisons de jouer de l'enquête 1** : la poursuite du chien, et les analyses avec « Le double ».

**Pour l'enquête 2**

6. **Le nouveau jeu « Les dépositions »**, fait comme les autres mini-jeux, avec une démo, un niveau réglé dans la salle, puis figé.
7. **La mémoire de la saison.** Les recettes apprises, les outils (coffret, bocal), les pages trouvées (nuancier), et la Page des Fondateurs déjà utilisée. Tout cela est gardé d'une enquête à l'autre, et effacé en cas de défaite, comme la décoration de l'atelier et la garde-robe du Pisteur.
8. **Les nouveaux codes :**
   - recette (ajoute une recette au grimoire) ;
   - lieu rare (ouvre un coin de cueillette rare) ;
   - outil ;
   - or (pour le Pisteur) ;
   - pouvoir du Sage ;
   - défaite.
9. **Les coffres.** Un point du Pisteur qui donne plusieurs codes à la fois, un pour chaque rôle, avec ou sans serrure (flèche, runes).
10. **La carte des souterrains.** Montrer un lieu souterrain sur la carte une fois qu'on a son code de passage. Aujourd'hui, la carte cache toujours les souterrains.
11. **La cueillette rare**, avec les 7 différences dans le bon décor et le tirage de 1 à 3. Les deux nouveaux ingrédients rares (champignon d'ombre, épi d'argent), et leurs dessins.
12. **Les nouvelles potions.** L'Élixir du Cœur vaillant, fait d'ingrédients communs : le Sage le boit à l'accusation. La Main verte et l'Œil de lynx : l'Alchimiste doit pouvoir boire ses propres potions.
13. **Le grand ménage pour de vrai.** Quand il arrive, ce qu'on perd et dans quel ordre, ce qui est protégé, et le grand bocal qui accepte les choses sèches.
14. **Les conditions « ET ».** Aujourd'hui, une page s'ouvre si *l'une* de ses conditions est remplie. La lettre secrète a besoin des archives **et** de la lettre révélée.

**Pour l'enquête 3**

15. **L'analyse des couleurs**, obligatoire dès l'enquête 3. C'est une action de l'Alchimiste, avec Le bon mélange, sur les objets qui ont une teinte. La recette trouvée s'affiche, pour qu'elle la dise au Sage. Il faut aussi :
    - la page « carnet de couleurs » du Sage ;
    - Mélusine, qui donne au Barde deux codes : le carnet pour le Sage, et sa boîte de teintures pour l'Alchimiste si elle n'a pas le coffret.
16. **La troisième question à l'accusation,** avec les portraits des habitants comme pour le QUI.
17. **Facultatif : la serrure de runes à distance.** Le Pisteur passe un code au Sage, le Sage joue aux runes, puis rend un code au Pisteur.

**Pour le vérificateur** (le petit programme qui teste les enquêtes)

18. Il doit connaître les nouvelles sortes d'indices : dépositions, coffres, couleurs, témoins, conditions « ET », troisième question.
19. **Les objets de saison** (coffret, nuancier) ne sont pas garantis. Un indice qui en dépend doit toujours avoir un chemin garanti dans l'enquête elle-même, comme Mélusine à l'enquête 3.
20. **Une liste des indices clés de voûte**, comme celle de mon brouillon, avec un avertissement s'il y en a plus de 3, ou plus d'un par rôle. Avec en plus un calcul de survie : combien de réponses restent si une clé de voûte est ratée pour de bon, comparé au nombre de cœurs plus l'élixir.
21. **Les mots sensibles pour toutes les réponses,** pas seulement pour le coupable. Et corriger « couture », qui ne repère pas « couturière ».
22. **Un compte des mini-jeux obligatoires par joueur**, pour respecter le budget d'une soirée (§ 1.4).

**Les textes**

23. Mettre à jour les ragots et les phrases ajoutées au mensonge pour les enquêtes 2 et 3. Par exemple, ajouter « Basile rêve de gagner le concours de la plus grosse citrouille » (vrai, enquête 3). Et ajouter, à partir de l'enquête 4, « Basile portait les sacs de terre pour le colporteur ».

---

## 10. Faisabilité avec le moteur actuel

J'ai lu le moteur, les données, les trois enquêtes et le vérificateur. En résumé : **une bonne partie existe déjà.** Le gros du travail, ce sont la défaite et la mémoire de la saison, les pouvoirs du Sage, le nouveau jeu des dépositions, les coffres et la cueillette rare.

| Ce dont on a besoin | Ce qui existe déjà | Ce qu'il faut ajouter |
|---|---|---|
| Le niveau des mini-jeux | **Fait** : le réglage « fixe » de `MJ.CALIBRAGE` garde le tir, la poursuite, le mélange et la grille à leur niveau validé ; les autres restent à 10. | Rien. |
| La troisième question (QUI L'AIDE) | Le moteur et le vérificateur savent déjà gérer une troisième question, appelée `quoi`. | Dans la fenêtre d'accusation, afficher des portraits quand les choix sont des habitants. |
| Le témoin qui donne un code au Barde | Un point peut donner un code (`donne`), un code peut être destiné au Barde (`infos` avec `pour:'barde'`), une question peut demander un code (`besoin`), et un habitant peut mentir puis avouer (`ment`, `vrai`, Démasquer dès l'enquête 2). | Rien : c'est seulement du contenu. Mélusine et son carnet, à l'enquête 3, marchent de la même façon. |
| Le passage secret qui s'ouvre avec un code | Un lieu peut être fermé par un code (`verrou`). Les cartes des plans existent : le clocher avec sa crypte, le moulin avec la cave sous les meules et le vieux tunnel. | Afficher les lieux souterrains sur la carte (aujourd'hui toujours cachés). |
| Les coffres | Un point donne aujourd'hui un seul code. | Un point qui donne plusieurs codes, pour plusieurs rôles. |
| L'indice partiel | Les points ont déjà `rate` et `rateNote` ; les pages ont `rate`. | L'ajouter aux analyses. Ajouter la règle par enquête : partiel ou non, combien d'essais, un seul essai à partir de l'enquête 4. L'option « un seul essai » existe déjà pour les bonus (`essaiUnique`). |
| La grille qui confirme | La grille sait déjà afficher un texte de confirmation (`confirme` et `note`). Ses dimensions sont au choix : lieux, objets, moments. Une page peut lancer un mini-jeu. | Rien de plus. |
| La cueillette rare | Les 7 différences ont déjà les décors (cave, forêt aux baies, moulin, puits) et savent afficher l'ingrédient à cueillir. | L'action de cueillette rare, le tirage de 1 à 3, les deux nouveaux ingrédients et leurs dessins. |
| Le grand ménage | Le jeu existe. L'atelier sait déjà retirer des ingrédients, le panier d'abord. | Le déclenchement, l'ordre de perte par rangement, la protection du verre, le grand bocal. **Attention :** aujourd'hui, l'atelier refuse les choses sèches dans le verre et l'explique à l'enfant (§ 3.3). |
| Le bon mélange pour l'enquête | Le jeu accepte déjà une recette imposée (`params.recette`). | L'action « Analyser la couleur », la page du carnet ou du nuancier, le coffret de saison. |
| Les nouvelles potions | Les potions ont un effet sur les mini-jeux et un code automatique. L'Alchimiste garde déjà ses potions d'une enquête à l'autre. | Un effet « +1 cœur », la possibilité de boire à l'accusation, et l'Alchimiste qui boit ses propres potions. |
| Les codes | Les codes à 3 symboles sont tirés de la même façon sur toutes les tablettes, avec 720 codes possibles par enquête. Une enquête en utilise aujourd'hui une vingtaine, et le code « une action en plus » du Sage existe déjà. | Avec un seul échange, les pouvoirs du Sage ne demandent qu'une dizaine de codes par enquête (3 pouvoirs × 3 équipiers). On reste vers 60 codes, très loin de 720. |
| La boutique, la revente, la défaite, la saison | Le jeu sauvegarde déjà le héros, l'atelier et le calepin. La boutique est déjà accessible depuis le village, et le bouton « Retour au village » garde l'enquête. | La revente, le code de défaite, le Livre des Légendes, la mémoire de saison, l'effacement complet après une défaite (atelier compris). |
| Les conditions « ET » | Les conditions d'aujourd'hui sont des « OU ». Le vérificateur sait pourtant déjà combiner des conditions « ET » en interne. | Ajouter une forme « toutes ces conditions », ou enchaîner les pages. |
| Les dépositions | Rien. | Un nouveau mini-jeu complet, et un type de scène dans l'enquête (comme les écoutes). |

**Comment j'ai vérifié.** J'ai recopié les faits des enquêtes 2 et 3 réécrites dans un petit programme de brouillon. Il est rangé à part, hors du dossier du jeu, dans `scratchpad/design-check/check.js`. Il applique les mêmes règles que `tools/verif.js` :

- une seule solution avec toute l'équipe ;
- au moins deux réponses possibles quand on retire un rôle ;
- combien de suspects garde chaque joueur seul ;
- et en plus, la liste des mini-jeux clés de voûte.

Résultats après les décisions de Romain :

- **Enquête 2** : une seule solution. Les faits sont les mêmes ; seule l'écoute au lavoir n'a plus besoin de potion. Sans le Pisteur, il reste 2 réponses ; sans l'Alchimiste, 4 ; sans le Barde, 9 ; sans le Sage, 14. Aucun joueur seul ne descend sous 4 suspects.
- **Enquête 3** (nouvelle version, 45 réponses) : une seule solution. Sans le Pisteur, il reste 16 réponses ; sans l'Alchimiste, 3 ; sans le Barde, 8 ; sans le Sage, 5. Chaque joueur seul garde les 5 suspects. Il y a 3 clés de voûte, sur 3 rôles différents.
- **Enquête 1** garde ses faits actuels, que `tools/verif.js` valide déjà.

Il faudra bien sûr refaire tourner le vrai vérificateur quand les enquêtes seront codées.

---

## 11. Décisions prises, questions ouvertes et réserves

### Ce que Romain a décidé (2 novembre)

1. **La Page des Fondateurs** : une seule fois dans toute la saison. C'est un joker très rare du Sage, qui donne à un équipier le résultat d'un mini-jeu raté comme s'il l'avait gagné.
2. **Après une défaite**, tout repart à zéro, décoration de l'atelier et garde-robe comprises (changé le 3 novembre) ; chacun peut seulement reprendre la même apparence.
3. **« Abandonner » compte comme une défaite.**
4. **Le niveau des mini-jeux est figé** pour toute la saison ; seul l'équipement le baisse. C'est déjà fait dans le moteur.
5. **L'enquête 3 garde « QUI l'aide ? »**, et c'est Basile. Les « POURQUOI » arrivent à partir de l'enquête 4.
6. **Le grand ménage** arrive une fois par enquête à partir de l'enquête 2. Si c'est raté, 2 ingrédients sont mangés.
7. **On achète et on revend quand on veut**, même pendant une enquête. On revend à moitié prix.
8. **Margot habite au 1, rue des Lanternes** : c'est un simple détail d'histoire. Quand Tim dit que la silhouette est entrée dans une maison de cette rue, Margot reste suspecte. C'est alors l'Alchimiste, avec l'odeur de lavande de la lettre, qui l'innocente. Sans ce détail, l'Alchimiste ne servirait à rien pour trouver la coupable de l'enquête 2.
9. **Le coffret de teintures est obligatoire dès l'enquête 3.**
10. **Les nouvelles exigences :**
    - on doit pouvoir survivre à l'enquête 3 ;
    - une enquête tient en une soirée de 60 à 75 minutes ;
    - les pouvoirs du Sage se font avec un seul échange de code ;
    - l'Alchimiste a moins à faire à l'enquête 2.

### Ce que Romain a décidé (3 novembre) : chacun son métier

11. **Le Barde est l'informateur des habitants.** Seul son Carnet a les visages des habitants. Le Sage pilote avec son Grand Livre, le Pisteur est « le mec de l'action » : son Carnet est un fil d'aventure. L'Alchimiste n'a pas de visages non plus.
12. **Ce que les autres apprennent sur un habitant va au Barde, par un code.**
    - Exemples : une analyse qui innocente quelqu'un, un fait du registre, une écriture du Livre d'or, des traces de la taille d'un pied.
    - L'écran du rôle qui trouve dit : « Donne ce code au Barde : il le notera sur Margot. »
    - Quand le Barde le tape, c'est écrit dans le visage de l'habitant, avec 🔊 et « 📨 du Sage » (ou de l'Alchimiste, du Pisteur).
    - Celui qui trouve garde aussi l'info dans ses notes.
    - Seulement les faits qui comptent, regroupés quand ils arrivent au même endroit : 3 à 6 codes par enquête (enquête 1 : 3, enquête 2 : 4, enquête 3 : 4).
    - Un code n'en dit jamais plus que l'indice d'origine : le vérificateur le contrôle.
    - Dans les prochaines enquêtes, chaque fait sur un habitant trouvé par un autre rôle prévoit son code « pour le Barde ».

### Une idée pour plus tard (pas construite)

- **Le Sage qui dirige les missions des autres.** Romain imagine que le Sage, chef d'enquête, puisse plus tard donner lui-même des missions à ses équipiers (« Pisteur, va voir le moulin ! »), avec une page de son Grand Livre. C'est à étudier après la première saison : ça renforcerait son rôle de pilote, mais il ne faut pas qu'il fasse jouer les autres à leur place.

### Ce qui reste ouvert

1. **Le passage à 2 cœurs.** Je propose l'enquête 6 (§ 2.1) : les enquêtes 4 et 5 font déjà un grand pas, et il ne faut pas monter deux marches d'un coup. L'étude d'équilibrage dira si l'enquête 5 est possible.
2. **Un élixir sans ingrédient rare** (2 miel, 1 pensée, 1 eau, zone rouge), pour qu'il soit vraiment disponible à l'enquête 3. Ça convient ?
3. **Les coupes de l'enquête 3**, pour tenir dans la soirée et descendre à 45 réponses :
   - Gaspard, Victor et Basile ne sont plus suspects du vol ;
   - la grange disparaît ;
   - l'analyse de l'éclat et la charrette de Margot sont retirées ;
   - le coffre devient entièrement facultatif.
   Ça convient ?
4. **Mélusine qui prête sa boîte de teintures** et son carnet de couleurs à l'enquête 3, quand l'équipe n'a pas trouvé le coffret à l'enquête 2. Ça convient ?
5. **Les durées** du § 1.4 sont des estimations. Il faudra chronométrer la première soirée, puis ajuster le facultatif.

### Mes réserves, franchement

- **La mort des héros reste possible**, et c'est voulu. À l'enquête 3, rater des mini-jeux ne suffit plus pour perdre, si l'équipe a préparé l'élixir. Mais une équipe qui se trompe de raisonnement sur le OÙ ou sur l'aide peut encore perdre. La première défaite sera un vrai moment pour les enfants : l'avertissement avant l'enquête 1, et l'atelier d'Alicia qui reste, aideront.
- **Les durées ne sont pas mesurées.** Le modèle compte 3 minutes par mini-jeu. Le chaudron validé dure au moins 2 minutes de préparation à lui seul, et les enfants parlent beaucoup (tant mieux). Si la première soirée dépasse, on coupe d'abord le facultatif.
- **Les dépositions** demandent de lire 4 cartes de 3 ou 4 phrases. Avec des icônes et la lecture à voix haute, ça passe à 8 ans. Sans, non.
- **Le bon mélange devient une clé de voûte à l'enquête 3.** Il est réglé au niveau 8, et c'est Alicia qui le joue. Si elle le rate, il y a un nouvel essai, les pouvoirs du Sage et assez de cœurs. Mais il faudra la voir jouer ce mini-jeu avant de valider.
- **Un seul code pour les pouvoirs du Sage**, c'est plus simple. En contrepartie, le Sage ne voit plus sur son écran quel mini-jeu exact a été raté : il doit le demander à voix haute. C'est plutôt bien pour un jeu où l'on se parle.

