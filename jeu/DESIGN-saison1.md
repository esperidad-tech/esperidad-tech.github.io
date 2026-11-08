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
| Matin | mairie : traces, fenêtre, gouttière ; place | cueillir les baies ; encre (chaudron), avec la recette lue par le Sage | Basile (le chemin de la forêt) ; Odette | registre ; recettes | le Pisteur ou l'Alchimiste, environ 5 min |
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

- **Mairie, le massif de fleurs**, mini-jeu *Suivre la piste* : « Il y a deux sortes de traces. Des grosses, sèches et craquelées : elles datent d'hier. Et des petites, toutes fraîches : elles datent de cette nuit ! Les petites mesurent 3 carreaux. » *Prouve*, avec les pieds du registre du Sage : ce n'est ni Gaspard, ni Basile, ni Victor (5 carreaux).
- **Mairie, la fenêtre** : « La fenêtre a été ouverte depuis dehors. Accroché au loquet : un fil de laine rouge ! » Code du fil pour l'Alchimiste.
- **Mairie, la gouttière** : « La gouttière est tordue : quelqu'un est descendu du toit en s'y accrochant. Quelqu'un de léger et agile, sinon elle aurait cassé ! » *Prouve*, avec la canne d'Odette : ce n'est pas Odette.
- **Place, la fontaine** : des traces de pattes de chien toutes mouillées. *(Met sur la piste du chien.)*
- **Place, le panneau** : « PERDU : PIRATE, petit chien noir et blanc. Prévenez Tim, 7, rue des Lanternes. » Code de l'affiche pour le Barde.
- **Boulangerie, le sol** : Gaspard a de très grands pieds.
- **Boulangerie, le four** : de la suie autour du four. *Fausse piste.*
- **Forêt.** Elle est fermée tant que le Pisteur n'a pas un plan : celui que le Sage révèle, ou le chemin dessiné par Basile.
  - **Le carrefour** : trois chemins, vers le moulin, le puits et le Vieux Chêne.
  - **Le chemin du moulin** : « La boue est toute lisse : personne n'est passé. » *Prouve* : pas au moulin.
  - **Le chemin du puits** : « De grosses traces de sabots : un sanglier ! Aucune trace d'enfant. » *Prouve* : pas au puits.
  - **Le chemin du Vieux Chêne** : « Il fait bien trop noir pour voir des traces… »
  - **Nouveau : le petit chien**, mini-jeu *Course-poursuite* : « Un petit chien noir et blanc file entre les arbres ! Tu cours derrière lui… Il plonge sous un buisson épineux et t'échappe, mais une touffe de poils reste accrochée aux épines ! » Code des poils pour l'Alchimiste. *Pourquoi ce mini-jeu :* Pirate a peur et court. On ne l'attrape pas, mais on récupère ses poils.
- **Vieux Chêne, les racines** : « Un courant d'air froid te souffle sur les mains… comme si le sol respirait. » *(Graine pour l'enquête 4.)*
- **Nouveau, Vieux Chêne, une racine qui brille** : « Entre deux grosses racines, une petite racine dorée brille dans le noir. L'Alchimiste saurait la cueillir, elle ! » Code de lieu rare pour l'Alchimiste. *Facultatif.*
- **Le puits et le moulin** : rien de nouveau. Ils confirment ce que disent les chemins.
- **Partout** : « Ce qui pousse ici », à dire à l'Alchimiste.

**L'Alchimiste**

- **Encre révélatrice**, mini-jeu *Le chaudron*. La recette est secrète : le Sage la lit à voix haute, avec l'ordre et les quantités. Code de la potion pour le Sage, qui en a besoin pour la page blanche.
- **Nouveau : analyse du fil**, mini-jeu *Le double* (« Sous la loupe, compare le fil avec tes échantillons : trouve vite le signe commun ! ») : « C'est de la laine rouge tricotée à la main : un morceau d'écharpe ! Elle est couverte de SUIE noire, comme dans les cheminées. » *Prouve*, avec l'écharpe intacte de Mélusine (Barde) : ce n'est pas Mélusine.
- **Nouveau : analyse des poils**, mini-jeu *Le double* : « Des poils de chien, noirs et blancs. Coincée dedans : une petite feuille de CHÊNE ! » *Prouve* : ni au moulin, ni au puits.
- **Analyse de la plume**, sans mini-jeu : « Une plume de corbeau. Elle sent… la lavande ! » *(Graine pour l'enquête 2.)*
- **Nouveau : cueillette rare**, si le Pisteur a donné le code. Mini-jeu *Les 7 différences*, décor « la forêt aux baies » : 1 à 3 racines du Vieux Chêne. *Facultatif.* Elle les garde pour plus tard.
- **Cueillettes** (sans changement) : eau (place, lavoir), miel et menthe (potager), baies (lisière), lavande et pensées (herboristerie), brume (lavoir, le matin), champignons lumineux (forêt, le soir), trèfle (clairière).

**Le Barde** (questions inchangées)

- **Gaspard** : « Dans mon fournil, toute la nuit ! » Si on lui montre l'affiche du chien : « Hier soir, Tim cherchait Pirate en pleurant. Je lui ai dit : les chiens perdus filent souvent dans la forêt. »
- **Mélusine** : « Je dormais. » « J'ai tricoté des écharpes rouges pour la moitié du village. » « Mon écharpe ? Pas un trou, pas un fil qui dépasse ! » *Ce dernier point prouve, avec le fil :* ce n'est pas Mélusine.
- **Basile** : a planté des fleurs devant la mairie hier avec ses grosses bottes ; à 6 heures du soir, la fenêtre était fermée ; il **dessine le chemin de la forêt**, avec un code pour le Pisteur.
- **Odette** :
  - la lumière de la boulangerie est restée allumée ;
  - « À minuit, une petite silhouette a sauté de toit en toit, avec une lumière dorée, vers la forêt » (*prouve* : la Lanterne n'est pas restée sur les toits) ;
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
| Le double (le fil) | « De la laine rouge, tricotée à la main… couverte d'une poussière noire. Laquelle ? » | Oui (1 action) |
| Le double (les poils) | « Des poils de chien noirs et blancs, avec un petit bout de feuille. Quel arbre ? » | Oui (1 action) |
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

## 12. Décisions de la nuit du 3 au 4 novembre (appel vocal avec Romain) — à construire

### 12.1 La difficulté (déjà en place, sauf l'enquête 1)
- Mode « Qui joue ce héros ? » : enfant / adulte (création, étape 2, et Réglages).
- **Enquête 1 = tutoriel : tous les mini-jeux au niveau 1, pour tout le monde, adultes compris** (« Se cacher » au niveau 3 si jamais il y apparaît).
- Enfant : enquête n → niveau n (« Se cacher » : n + 2), plafonné à 10.
- Adulte : enquête 2 → niveau 5, puis ça monte jusqu'au niveau 10 à l'enquête 10.
- L'équipement et les talents baissent ensuite d'un cran (mods.facile).
- **La règle des cœurs, absolument partout** (Romain, 4 novembre, 11 h 29) : le nombre de cœurs affichés = le nombre d'erreurs encore permises. Plus de cœur ne veut pas dire perdu : la prochaine erreur fait perdre (message « Plus de cœur : attention, la prochaine erreur fait perdre ! »). Mini-jeux : même nombre d'erreurs permises qu'avant, seul l'affichage change (sauf le chaudron du niveau 1 : 3 cœurs). Accusation du Sage : 2 cœurs affichés, il peut se tromper 2 fois, la 3e erreur fait perdre (comme avant).
- **Le chaudron** (Romain, 4 novembre, 11 h 26 → 12 h 22) : le bois chauffe, touiller refroidit (avec de l'inertie) ; trop chaud, ça explose ; trop froid, ça gèle (perdu). En haut, la carte de la recette (pastille de couleur, icône, nom, nombre, puis 🧪). La frise : des carrés gris qui traversent une zone centrale (60 % de la largeur) ; un carré qui y entre s'allume dans sa couleur (jamais deux à la fois) et on touche la boîte (sans couleur, étiquette papier) qui correspond d'après la recette. Mauvaise boîte, boîte touchée sans carré allumé, ou carré sorti par la gauche (« Trop tard ! ») : une erreur, −1 cœur (toujours 3 cœurs, à tous les niveaux — Romain, 13 h 20). Au niveau 1, le carré attend dans la zone ; il traverse la zone en 8,2 s au niveau 2 jusqu'à 2 s au niveau 10. **On ne verse que si la température est dans le vert** (13 h 06) : hors du vert, les pots sont grisés avec un 🌡️, la bande verte de la jauge pulse doucement, et toucher un pot ne verse rien (bulle « Remets le chaudron dans le vert ! », pas de cœur perdu) ; le carré continue d'avancer (au niveau 1, il attend). Pendant les ingrédients, pas de zone jaune sur la jauge ; à la fin (🧪), la zone de la potion apparaît : 60 s pour l'atteindre et remplir la fiole au niveau 1, 20 s au niveau 10 (compte à rebours calme), zone normale au niveau 1, moitié au niveau 10 ; il faut y tenir 2,5 s pour remplir la fiole, à tous les niveaux (13 h 20) ; temps écoulé : « La potion n'a pas pris ». Parties 10 s plus courtes qu'à midi, même vitesse de défilement. Enquête 1 : on peut recommencer sans fin, les ingrédients versés sont rendus.

### 12.2 L'enquête 1 en « pilote automatique » (tutoriel), pour les quatre rôles
- L'enquête 1 suit pas à pas **la trame parfaite** : chaque joueur fait la bonne action au bon moment, dans le bon ordre ; le jeu ne laisse pas d'autre chemin.
- Sur la carte, **un seul lieu ouvert à la fois** pour chaque rôle (comme le Pisteur aujourd'hui), celui de l'étape en cours.
- Quand un joueur doit attendre l'info d'un autre, un message clair : « Attends l'indice du Sage : le plan de la forêt », « Attends le code du fil (Pisteur) »…
- Tout le monde a toujours quelque chose à faire, et on comprend que l'équipe avance en se passant les infos.
- Le Sage joue au moins un mini-jeu sur le chemin principal : la page blanche, quand l'encre arrive, se révèle avec **Les runes** (proposé à Romain, à confirmer).
- Les missions bonus restent possibles, mais après le chemin principal du moment (ou au moment prévu par la trame).
- **Précision de 4 h 10 : tout est forcé, avec des ronds lumineux.** À chaque pas, un anneau doré qui pulse (avec « Nouveau ! ») montre où cliquer : l'icône de l'onglet Carte, le seul lieu ouvert, le bon point ; pour l'Alchimiste, l'onglet Atelier quand les baies apparaissent, puis dans l'atelier les baies devant la porte, le rangement, le grimoire, le chaudron… ; pour le Sage, chaque page du Grand Livre jusqu'à la page de l'accusation. Le reste est hors de portée. **Seule exception : le choix de l'accusation** (on guide jusqu'au bouton, jamais vers la réponse).
- **Le choix du talent est forcé, au début de l'enquête 2** (précision de 4 h 11) : chaque héros a atteint le niveau 2 à la fin de l'enquête 1 ; au début de l'enquête 2, tout est bloqué, un rond lumineux montre le petit portrait en haut à gauche, puis le bouton des talents, puis les deux choix du niveau 2 (sans conseiller l'un ou l'autre). Ensuite, l'enquête 2 est libre.
- **Avant le jeu, le strict nécessaire** (précision de 4 h 19) : accueil sans boutons en bas ; création sans « Suivant » à l'étape du rôle (toucher un rôle passe à la suite), « OK » à l'étape de l'apparence, puis le prénom ; village de la première enquête avec seulement le bouton « Enquête 1 : La Lanterne d'Or » ; lettre de l'enquête 1 avec seulement la lettre du maire et « Commencer l'enquête ». Puis, dans le jeu, tout est grisé sauf le rond jaune sur ce qu'il faut toucher. (Patch prêt : `scratchpad/patchs/accueil.py`, appliqué à l'intégration.)
- **L'enquête 2 du Barde est entièrement refaite** avec ses nouveaux mécanismes, et elle doit être juste et intéressante avec l'un comme l'autre de ses talents du niveau 2.

### 12.3 Mimi, le chat de l'Alchimiste
- **Barre de bonheur** : on touche Mimi → une petite barre de bonheur apparaît au-dessus de lui. Elle monte quand on le nourrit, le caresse, joue avec lui.
- **Chatière** dans la porte de l'atelier, qui bascule quand il passe.
- **Utile à l'enquête** : quand la barre est bien pleine, de temps en temps (au plus une fois par moment), il sort par la chatière et revient avec un ingrédient dans la gueule (parfois un rare). Pendant une potion, il peut dresser les oreilles quand on met le bon ingrédient (petit coup de pouce, jamais la réponse).
- **Animations** : une petite souris traverse de temps en temps, Mimi se tapit, remue les fesses et bondit dessus ; quand on fait glisser le doigt, il le suit et essaie de l'attraper ; **une dizaine de mouvements** différents quand on joue (bondir, rouler sur le dos, galipette, taper de la patte, se cacher puis surgir, courir en rond, s'étirer, sauter en l'air…), jamais deux fois pareil.
- **Garde-robe de Mimi** : colliers, nœuds, clochette, petits chapeaux, en couleurs ; on l'habille en le touchant, comme le Pisteur. **On gagne un accessoire seulement quand l'Alchimiste réussit un de SES mini-jeux** (la première fois pour chaque mini-jeu, parfois un rare et brillant).

### 12.4 Le Barde : plus de mini-jeux à part, tout dans les interrogatoires
- **Face à une seule personne** : l'épreuve du mensonge se fait pendant qu'elle parle (plus de bouton « lancer le mini-jeu »).
- **Plusieurs personnes dans la même pièce** : chacune raconte sa version (les dépositions), et il faut trouver ce qui ne colle pas — directement, sans écran de mini-jeu à part.
- **Écouter de loin** (derrière une porte, au coin d'une rue) : il entend une **phrase à trous**. C'est dans son **carnet** qu'il replace les mots, à partir d'une liste de mots possibles, **avec des mots pièges qui marchent aussi dans la phrase**. **On ne lui dit jamais si c'est juste** : c'est à lui et à l'équipe de juger.
- **Les mimiques des menteurs** : un villageois (pendant un interrogatoire) ou un autre joueur (code) lui révèle « Quand Fortuné ment, il se gratte le nez ». Ensuite, ce geste se voit **clairement** (bien marqué, il dure un peu) quand ce villageois ment. Sans le secret, les signes discrets habituels.
- **Questions à choix** : deux ou trois questions par conversation ; la bonne fait parler davantage ; une maladroite **vexe** le villageois : « J'ai plus trop envie de parler, repasse ce soir » → le Barde perd une action et doit revenir au moment suivant. Au dernier moment de la journée, le villageois accepte de reparler au moment suivant… qui n'existe pas : il reparle tout de suite contre une action, ou le Sage donne une action de sa réserve. **Jamais d'indice indispensable perdu pour de bon.**

### 12.5 Les talents du Barde (nouvel arbre)
- **Niveau 2** : *Tendre l'oreille* — devant un bâtiment, « Entrer discrètement et tendre l'oreille » : il surprend un bout de conversation (phrase à trous dans le carnet) avant d'interroger. Gratuit (pas d'action), **2 fois par enquête** (+1 avec un objet de la boutique). Avant le niveau 2, il ne peut pas du tout écouter aux portes. **ou** *Exige la vérité* — un bouton **à la fin de chaque interrogatoire**, toujours le même (il ne trahit rien) : s'il l'utilise, tous les mensonges de cette conversation deviennent la vérité, bien visibles ; s'il n'y en avait aucun, « J'ai tout dit vrai ». **2 fois par enquête**.
- **Niveau 4** : *Charmeur* — ses mauvaises questions ne vexent plus jamais personne. **ou** *Physionomiste* — au début de chaque enquête, il connaît d'office la mimique de mensonge d'un villageois (au hasard parmi les suspects).
- **Niveau 6** : *Lancer une rumeur* (avec le Pisteur) — une fois par enquête, il lance à la taverne une fausse rumeur sur un lieu de son choix (« Demain, les gardes fouillent le lavoir ») ; au moment suivant, le Pisteur surveille ce lieu en cachette : personne ne vient → ce lieu est écarté ; une silhouette encapuchonnée arrive en courant → c'est le bon lieu (une chance sur 4 à 6). **ou** *Hydromel des confidences* (avec l'Alchimiste) — l'Alchimiste peut fabriquer une recette difficile, l'Hydromel, qu'il passe au Barde par un code ; une fois par enquête, le Barde l'offre à un villageois pendant un interrogatoire, qui **innocente un suspect**. Jamais la solution directement.
- **Niveau 8** : *Intuition* — une fois par enquête, un bouton : parmi tous ses interrogatoires, un mensonge qu'il n'avait pas repéré est signalé au hasard ; s'il les a tous trouvés : « Plus aucun mensonge ». **ou** *Recoupement* — une fois par enquête, il choisit deux phrases de son carnet, dites par deux villageois différents : le carnet dit si elles peuvent être vraies toutes les deux, ou si l'une des deux est forcément un mensonge.
- **Niveau 10** : *Réseau d'informateurs* — à chaque moment, un enfant du village lui glisse une info vraie sur un suspect (« Basile est allé au lavoir ce matin »). **ou** *Plaidoirie* (aide le Sage) — une fois par enquête, si le Sage accuse le mauvais coupable, le Barde plaide : l'accusé prouve son innocence, et le Sage ne perd pas de cœur.
- Règle : aucun talent ne dépend d'un autre talent qu'il n'aurait peut-être pas choisi.

### 12.6 Ce qui a été construit pour le Barde (nuit du 4 novembre)
Tout est dans `src/barde.js` et `src/barde.css` (plus quelques petits crochets dans le moteur, le carnet et les données).
- **L'interrogatoire parle** : on touche une question, le villageois répond avec son visage (bouche, mimiques), le texte s'écrit. Dès l'enquête 2 : **🤥 Il ment !** sous la bulle et sur chaque réponse ; juste → la vérité s'affiche en vert ; faux → « Moi, mentir ?! » (deux fausses accusations sur le même villageois, et il ne se laisse plus démasquer de l'enquête). **🔁 Répète** : il redit sa réponse (une fois par moment, plus avec les aides). Les 7 signes sont rappelés en bas (« 📖 Les 7 signes du menteur »). Enquête 1 : pas de 🤥 (personne ne ment).
- **Questions à choix** : 2 façons de demander (gentille / maladroite). La maladroite vexe : « J'ai plus trop envie de parler, repasse ce soir », la conversation s'arrête, la mauvaise façon est barrée ensuite. S'il n'y a plus de moment où le revoir : « 🙏 Demander pardon · 1 action » (ou une action de la réserve du Sage). Enquête 2 : Iris, Anselme, Fortuné, le maire, Tim ; enquête 3 : Farinel, Victor, Margot, Basile.
- **Mimiques** : chaque villageois a son tic (un des 7 signes). Sans le secret, un signe discret au hasard ; avec le secret, *son* geste, net et long, et « 🤫 Quand Tim ment, il mordille sa lèvre du bas » dans la conversation et dans son visage du Carnet. Secrets : Tim (code du Pisteur), Fortuné (Margot), Victor (en écoutant sur la place) à l'enquête 2 ; Basile (code du Pisteur), Iris (Margot), Silas (au pont) à l'enquête 3. Mélusine garde le sien.
- **Dépositions** : une scène de groupe dans la feuille (« 🗣️ Les interroger tous ensemble · 1 action ») : les cartes des témoins, des phrases qu'on colorie (🟢 pareil, 🔴 bizarre), « 🤥 C'est lui qui ment » ; deux essais ; la relecture reste dans le Carnet.
- **Phrases à trous** : « 👂 Ce que j'ai entendu », dans le Carnet. Chaque trou montre ses lettres en traits (et la première lettre à l'enquête 1) ; la liste mélange les bons mots et des pièges qui vont aussi dans la phrase. **On ne dit jamais si c'est juste.** L'écoute du lavoir (enquête 2) en est une ; la chanson de la fête (enquête 1, mission bonus) aussi : là seulement, on la chante à Margot une fois, et elle dit si c'est sa chanson (+15 or).
- **Talents** : les dix, branchés. Tendre l'oreille : des bribes écrites pour les enquêtes 2 et 3 (`E.bribes` : mairie, taverne, clocher, place ; moulin, taverne, pont). Exige la vérité : le bouton en bas de chaque interrogatoire. Rumeur : code pour le Pisteur, qui guette au moment suivant (« 🫥 Te cacher et guetter »). Hydromel : la recette passe à l'Alchimiste par un code (2 miel, 1 lavande, 1 pensée, 1 eau, dans l'arc-en-ciel), la potion revient au Barde ; offerte, elle fait innocenter un suspect (`E.alibis`). Plaidoirie : un code pour le Sage ; à sa première fausse accusation d'un innocent, pas de cœur perdu. Le **Cornet acoustique** (boutique, palier 2) donne une écoute aux portes de plus. Les vieilles sauvegardes : chaque ancien talent devient le nouveau du même niveau (Ombre → Tendre l'oreille, Conteur → Exige la vérité…).
- **L'enquête 2 refaite pour le Barde** (§ 6 gardé : Mélusine au clocher, Mélusine pas trop désignée, la mairie écartée par le maire) et juste avec l'un ou l'autre talent du niveau 2 : le vérificateur (`tools/verif.js`) la rejoue avec Tendre l'oreille puis avec Exige la vérité (au mieux de leurs 2 usages) : toujours une seule solution, jamais trop facile sans un rôle, survivable après chaque échec, et chaque talent ouvre un vrai chemin (bribes de la mairie, de la taverne, du clocher ; vérités de Tim et de Fortuné).
- **Laissé de côté** : les ragots restent une mission bonus à part ; les répliques en plus de l'ancien « Démasquer » ne servent plus ; aux niveaux hauts, les dépositions ne demandent pas encore de toucher la phrase fausse.

### 12.7 Le tutoriel de l'enquête 1 tel qu'il est construit (nuit du 4 novembre)

> **Mise à jour du 4 novembre, 17 h : l'enquête 1 n'a plus de points d'action** (détails dans les lignes « Fait » du § 12.8). Ce qui suit décrit le tutoriel construit la nuit ; trois choses ont changé depuis :
> 1. Plus rien ne se compte : les « (1 action) » de la trame et les « actions par moment » ne donnent plus que l'ordre des étapes ; le Sage n'a ni réserve ni page « 💡 Donner une action ». Hors guidage, un lieu, une cueillette ou un villageois ne donne qu'une chose par moment.
> 2. Les missions bonus ne sont proposées que **pendant une attente** (un code pas encore là, le moment suivant, la fin), une seule fois chacune : par exemple les ragots de la taverne, pendant que le Barde attend le registre, tout au début.
> 3. Les attentes nomment le rôle qui donne le code (« ⏳ Attends le Pisteur : il va te donner le code du fil… ») ; un moment fini : « ✅ Tu as tout fait pour ce matin. Attends le code de l'après-midi : c'est le Sage qui te le donne. »
>
> Le reste est inchangé : un seul lieu ouvert, les ronds dorés, le chemin des clics, « ⏭️ Passer », l'accusation libre. La fin ne parle plus du Corbeau (§ 5).

**Le principe.** Chaque rôle a sa liste d'étapes (`E.etapes` de `e1.js`, les mêmes que « 🎯 Mes missions »). L'étape en cours est la première pas encore faite. Pour elle, `src/tuto.js` connaît le **chemin des clics** (par exemple, pour le Pisteur : onglet 🗺️ Carte → la mairie sur la carte → « 🔍 Explorer » → le massif de fleurs). La chose suivante à toucher a un **rond doré qui pulse** (« 👆 Ici ! ») ; tout le reste est **grisé** et répond « Pas maintenant ! … ». Sous le bandeau du haut, **une phrase courte avec 🔊** dit le but de l'étape, puis ce qu'il faut toucher. Le mécanisme est générique : pour corriger un trajet, on change l'étape dans `e1.js` (lieu, points, habitant, page, moment prévu, ce qu'elle attend) ou la fonction `pasEtape` de `tuto.js`.

- **Un seul lieu ouvert** sur la carte, pour les quatre rôles : celui de l'étape en cours (ou celui de la mission bonus quand la trame laisse une action libre). Les lieux déjà vus restent dessinés, grisés. Un lieu qui attend un code a son cadenas. La carte glisse toute seule jusqu'au lieu de l'étape, qui surgit avec « Nouveau ! ».
- **Dans un lieu**, seul le bon point (Pisteur, Sage) ou le bon habitant (Barde) se touche ; l'Alchimiste ne peut chercher des ingrédients qu'à l'étape de la cueillette.
- **Les messages d'attente** : quand l'étape attend le code d'un équipier, le bandeau (et la ligne de la mission, dans le Carnet) dit qui le donne : « ⏳ Attends le code du fil : c'est le Pisteur qui le trouve à la mairie. » Le rond se pose sur 🔢 Code. Le message disparaît quand le code est tapé.
- **Toujours permis** : 🔊, ✕, le menu ☰, lire son Carnet, taper un code dans 🔢 Code (un équipier peut le donner à tout moment), cocher le tableau d'enquête du Sage, tourner les pages du Grand Livre.
- **La seule exception** : le choix final de l'accusation. Le rond va jusqu'au bouton « ⚖️ Accuser », jamais sur un suspect ni sur un lieu.
- **Moment par moment** : une étape qui coûte une action (ou à cocher, ou une page du Grand Livre) attend le moment prévu. Quand ses étapes du moment sont faites, le joueur lit « ✅ Fini pour le matin ! Attends le code de l'après-midi » ; le Sage lit « Demande à l'équipe : tout le monde a fini ? Alors donne le code de l'après-midi », et le rond le mène à la page ⏭️ puis à « Passer ».
- **Les missions bonus** n'apparaissent que là où la trame laisse une action libre (pendant une attente, ou une fois les étapes du moment faites, et s'il reste plus d'actions que la trame n'en demande encore). Le ballon du Pisteur passe au soir (après-midi et soir), les fournées de l'Alchimiste aussi (matin, après-midi, soir).
- **Si un équipier n'y arrive pas** (course-poursuite ratée deux fois, encre ratée), un bouton « ⏭️ Passer » apparaît au moment suivant, pour ne jamais rester bloqué.
- **La chanson du Barde** (mission bonus à trous, `barde.js`) : « Tenter » à la taverne, puis « D'accord » ouvre le Carnet ; le rond se pose sur un trou vide (jamais sur un mot), puis sur « Chanter » quand tout est placé. Pendant qu'un habitant parle (sa bulle s'écrit), le rond attend la fin de la phrase.
- **Toute la trame faite** : les onglets redeviennent libres (Cabane, Carnet, Carte…), la carte montre tout le village (après la mission bonus du soir, s'il reste une action pour elle) ; le rond reste sur 🔢 Code pour le code de la fin.

**La trame parfaite** (actions par moment : Pisteur 2, Alchimiste 3, Barde 2, Sage 2 ; 🔢 = un code passé à un équipier ; 🎮 = un mini-jeu, tous au niveau 1)

| Moment | 🏹 Pisteur | ⚗️ Alchimiste | 🎻 Barde | 📖 Sage |
|---|---|---|---|---|
| **Matin** | 🏛️ Mairie (1 action) : 🎮 *Suivre la piste* au massif ; la fenêtre → 🔢 fil **→ Alchimiste** ; la gouttière · ⛲ Place (1 action) : la fontaine ; le panneau → 🔢 affiche **→ Barde** | 📦 l'atelier (ouvrir un carton, installer un meuble : gratuit) · 🫐 Lisière : 3 baies (1 action) · 🧪 🎮 *Le chaudron* : l'encre, avec la recette que lit le Sage (1 action) → 🔢 encre **→ Sage** · 🧶 ⏳ le fil du Pisteur, 🎮 *Le double* (1 action) → 🔢 écharpe **→ Barde** | ⏳ le registre du Sage → 🏠 noter la maison d'Odette (gratuit) · 👵 Odette, au 2, rue des Lanternes (1 action) → 🔢 plume **→ Alchimiste** · 🥕 Basile, au potager (1 action) → 🔢 chemin de la forêt **→ Pisteur** | 👥 lit « Les habitants » → 🔢 registre **→ Barde** · 🧪 lit la recette de l'encre à l'Alchimiste · 🔭 Mairie : le balcon (1 action) · ✨ bonus : l'horloge (runes, 1 action) · passe à l'après-midi |
| **Après-midi** | 🍞 Boulangerie (1 action) : le sol → 🔢 grands pieds **→ Barde** ; le four · 🌲 Forêt (⏳ le plan : Basile ou le Sage ; 1 action) : le carrefour, les trois chemins, 🐕 🎮 *Course-poursuite* → 🔢 poils **→ Alchimiste** | ⏳ les poils du Pisteur ; en attendant ✨ bonus : les fournées (bulles, 1 action) · 🐾 🎮 *Le double* : les poils (1 action) → « une feuille de chêne », à dire au Pisteur | 🧵 Mélusine, sur la place (1 action) · 🐶 ⏳ l'affiche du Pisteur → Gaspard, à la boulangerie (1 action) | ❔ ⏳ l'encre de l'Alchimiste → la page blanche, 🎮 *Les runes* → 🔢 plan de la forêt **→ Pisteur** · passe au soir |
| **Soir** | 🌳 le Vieux Chêne (1 action) : les racines · 📜 raconte tout au Sage · ✨ bonus : le ballon (tir, 1 action) | 🪶 ⏳ la plume du Barde : l'analyse (1 action) · 📜 raconte au Sage · (✨ les fournées, si pas faites) | 🧔 Victor, à la taverne (1 action) · 📜 raconte au Sage · ✨ bonus : la chanson (1 action) | 📋 écoute l'équipe, barre les innocents dans le tableau · ⚖️ accuse (sans aide) |

**Qui attend qui** (jamais tout un moment) : le Barde attend le registre du Sage (une minute, au tout début) ; l'Alchimiste attend le fil (le Pisteur le trouve à sa première action) ; le Sage attend l'encre (il a l'horloge pendant ce temps) ; le Pisteur attend le plan (Basile le donne dès le matin) ; le Barde attend l'affiche (trouvée le matin) ; l'Alchimiste attend les poils (elle a les fournées pendant ce temps) ; la plume, trouvée le matin, sert le soir. Le bot du tutoriel (`tools/tuto.py`) vérifie que chaque rôle fait au moins une étape à chaque moment.

**Le Sage et les runes** : quand l'encre arrive, toucher la page blanche lance *Les runes* (la carte à reconstituer, niveau 1). Réussi : le plan de la forêt apparaît, avec son code. Raté une fois : la dernière chance tout de suite. Raté deux fois : le dessin reste à moitié effacé, mais assez pour entrer dans la forêt, et le code est donné quand même (l'indice partiel suffit).

**L'enquête 2 commence par le talent** : l'enquête 1 donne 130 points d'expérience, et le niveau 2 commence à 120 : tout le monde y arrive (vérifié par le bot). Au début de l'enquête 2, tout est bloqué tant que le talent du niveau 2 n'est pas choisi : rond sur le portrait du bandeau, puis sur 🌳 (l'arbre des talents), puis sur les deux talents du niveau 2 (sans en conseiller un). Ensuite, l'enquête 2 est libre.

**L'atelier** (autre module) : `tuto.js` appelle `Atelier.guider(cible)` s'il existe, dans l'ordre de la trame : 'carton' (installer l'atelier), puis, pour l'encre, 'cueillette' → 'rangement' (pour chaque ingrédient posé devant la porte) → 'grimoire' → 'chaudron' → 'potion' (le flacon) ; pour une analyse, 'paillasse' ; null ailleurs. Il enchaîne la cible suivante quand l'atelier envoie `atelier:guide-fait`. Le bouton du moteur dans le panneau ouvert (« Analyser », « Donner ») a le rond de `tuto.js`. Quand un panneau de l'atelier est ouvert par-dessus la pièce, le rond de l'atelier est dessous : c'est `tuto.js` qui en pose un dans le panneau (« Ta cueillette » : le meuble de la liste ; le gros plan d'un meuble : une case qui convient, ou ✕ si ce meuble n'est pas pour cet ingrédient, 💧 ou 🍃), et un panneau d'avant qui cache la suite a le rond sur son ✕. Sans `Atelier.guider`, `tuto.js` entoure lui-même ce qu'il reconnaît dans la pièce (un carton, les tas devant la porte, le grimoire, le chaudron, le flacon, la table d'analyse), sans griser l'intérieur de l'atelier. Vérifié par `tools/tuto-atelier.py` (avec un `Atelier.guider` de remplacement).

**Ce qui reste à voir avec Romain** : le Vieux Chêne est le seul bout de chemin ouvert le soir (« là où il faisait trop noir ») : c'est guider vers le OÙ, assumé pour un tutoriel ; le Pisteur pouvait choisir avant. La lecture de « Les habitants » se valide avec « ✔ C'est fait » (on ne peut pas savoir si le Sage a vraiment lu à voix haute).

### 12.8 Chantier en discussion (4 novembre, midi) — RIEN DE CONSTRUIT, attendre le « go » de Romain

- **Créneaux horaires à la place des points d'action** (10 h 39, 11 h 59) : plus de limite d'actions ; ce qu'on peut faire dépend du moment (matin, après-midi, soir, nuit), des habitudes des villageois, la nuit pour la discrétion. Quand un joueur a tout fait dans son créneau, il demande le code du moment suivant au Sage ; le Sage le donne à celui qui en a besoin en premier (chaque tablette avance séparément). Proposé : un message « Tu as tout fait ce matin, demande au Sage… ». À refaire : l'emploi du temps des enquêtes 1 à 3, la page « Donner une action » du Sage, les talents et objets qui donnent des actions, le coût du Barde vexé (→ revenir au créneau suivant), le tutoriel, verif.js.
- **L'Alchimiste** (12 h 45) : il connaît son village et sait où tout se trouve (le Pisteur ne lui donne plus d'informations) ; des ingrédients qui ne se cueillent qu'à certains moments (matin, au soleil = après-midi, nuit) ; chaque coin ne se cueille qu'une fois (« il n'y en a plus »). Proposé : un panier limité (≈ 6 places) pour qu'il y ait de vrais choix ; Mimi rapporte un ingrédient manqué (une fois par enquête) comme filet de sécurité.
- **Codes d'ingrédients** (12 h 49) : le Pisteur trouve parfois un ingrédient rare, le Barde en reçoit un quand il pose les bonnes questions ; ils le passent à l'Alchimiste par un code. Garde-fous proposés : chaque code ne marche qu'une fois sur la tablette de l'Alchimiste ; 1 ou 2 par rôle et par enquête ; un ingrédient indispensable à l'histoire ne dépend jamais d'un seul code.
- **Potions plus ou moins difficiles** (12 h 40) : ⭐ 2 ingrédients, zone de fin verte ; ⭐⭐ 3 ingrédients ; ⭐⭐⭐ 4 ingrédients ou recette secrète du Grand Livre. Le niveau règle la vitesse ; la potion règle la longueur et la zone de fin. Les potions obligatoires de l'histoire restent ⭐ ou ⭐⭐. **Romain (13 h 38)** : pour les potions très difficiles, mettre ensemble trèfle, menthe et ortie (trois verts qui se ressemblent) pour embrouiller.
- **La Lanterne d'Or** (Romain, 14 h 21, pour la conception, pas encore de texte de jeu) : un objet magique puissant ; tout le monde croit que son pouvoir se limite à allumer les lanternes du village (place de la fontaine), mais elle a un pouvoir bien plus grand que personne ne soupçonne (à découvrir dans les archives) : c'est pour ça que le maire y tient absolument. Pas d'objet caché ni déguisé (le « fer noir sous l'or » est supprimé de la fin, du calepin et des ragots).
- **Fait (4 novembre après-midi), enquête 1 seulement** : plus de points d'action (`sansActions:true` dans `e1.js` ; tous les tests passent par `M.sansActions()`, `M.peutAgir()`, `M.depenser()`, `M.coutTxt()` de `moteur-base.js` : ni pastilles, ni « · 1 action », ni page « 💡 Donner une action » ni réserve du Sage ; le Barde vexé revient au moment suivant, et au dernier moment le pardon ne coûte rien). Ce qui limite : le tutoriel, inchangé ; hors guidage, un lieu, une cueillette ou un villageois ne donne qu'une chose par moment (« ✅ Rien de plus ici pour ce moment. »). Les enquêtes 2 et 3 comptent leurs actions comme avant ; `verif.js` ne calcule pas de budget pour une enquête `sansActions`.
- **Fait (4 novembre après-midi), le tutoriel de l'enquête 1** : chaque attente nomme le rôle qui donne le code (« ⏳ Attends le Pisteur : il va te donner le code du fil… ») ; un moment fini : « ✅ Tu as tout fait pour ce matin. Attends le code de l'après-midi : c'est le Sage qui te le donne. » (le Sage : « … tout le monde a fini ? Alors donne le code de l'après-midi. ») ; les missions bonus ne sont proposées que pendant une attente, une seule fois chacune.
- **Fait (4 novembre après-midi), plus de Corbeau dans l'enquête 1** : la fin se termine sur l'énorme trou du Vieux Chêne et le maire qui le fait couvrir de grosses planches (§ 5) ; la plume d'Odette est « une grande plume noire qui sent la lavande », un mystère ; le petit corbeau dessiné dans un coin de l'horloge de la mairie (mission bonus du Sage) est devenu un croissant de lune. Le maire reste discret : il serre la Lanterne contre lui, il ne quitte jamais ses gants.
- **Fait (4 novembre, 17 h), enquête 1 « nickel »** : deux graines discrètes pour la nouvelle enquête 2 (§ 12.10) : quand Gaspard remonte Tim du trou, Tim a « l'autre main bien fermée au fond de sa poche » (l'objet ramassé au fond du trou) ; Odette, en donnant la plume : « Moi qui ne dors presque jamais, je vois tout ce qui se passe au village… ». Les vieilles sauvegardes sont réparées au chargement (`M.reparerE1`, `moteur-base.js`) : le calepin d'une enquête 1 déjà finie perd « LE CORBEAU VEILLE » et « du fer noir », gagne le trou 🕳️ et les planches 🪵, et la « plume de corbeau » devient « grande plume noire » dans les notes du carnet de l'enquête 1. Les bancs d'essai qui supposaient des actions ou la réserve du Sage dans l'enquête 1 la testent maintenant sans actions (la réserve est testée dans l'enquête 2).

### 12.9 Le scénario de la saison, en cours de réécriture (Romain, 4 novembre, 14 h 13 → 14 h 36) — RIEN DE CONSTRUIT
**Décidé par Romain :**
- **Plus de Corbeau.** Le maire est le méchant, mais il reste discret : il se sert des quatre enquêteurs pour arriver à ses fins. L'enquête 1 est gardée (Tim tombe dans le trou par accident, le maire a besoin de la Lanterne et fait appel aux enquêteurs) ; les enquêtes 2 et 3 seront réécrites ; le scénario doit tenir jusqu'à l'enquête 9, l'enquête 10 sera un grand combat. Le maire reste « le meilleur candidat », mais un autre personnage n'est pas exclu.
- **La Lanterne d'Or** : un objet magique puissant ; tout le monde croit qu'elle sert seulement à allumer les lanternes de la place de la fontaine ; elle a en fait un pouvoir bien plus grand, que personne ne soupçonne (à découvrir dans les archives). C'est pour ça que le maire y tient absolument. Pas d'objet caché ou déguisé.
- **Tout se passe dans le sous-sol.** Brumeval a été construit par-dessus une ville extrêmement ancienne, sans doute exprès pour qu'on l'oublie, parce que le pouvoir de la pierre est trop grand. On ne sait rien de tout ça tant qu'on n'est pas allé explorer le sous-sol.
- **La pierre de Brumeval** (ou pierre ancestrale) : une pierre de protection qui entoure le village de brume (ou une sorte de dôme), contre quelque chose de dehors (à décider). Elle ne donne aucun pouvoir aux héros. Si quelqu'un s'en empare pour lui seul : les voiles de brume se dissipent, quelque chose dehors pourrait arriver, et lui aurait un pouvoir immense. C'est ce que veut le maire.
- **Le conseil ancestral des cinq** : on n'atteint la pierre que si les cinq sont réunis, physiquement. Les quatre enquêteurs et le maire en font partie, **par le sang** : chaque héros descend de la lignée ancestrale de son rôle (Pisteurs, Alchimistes, Bardes, Sages), quel que soit le nom que le joueur lui a donné. Dans leur sang coule quelque chose de ceux qui ont construit la pierre.
- **Les héros n'ont pas de pouvoirs** : les talents sont des savoir-faire, pas des pouvoirs paranormaux. La magie est dans les objets (lanterne, potions).
- **Enquête 2** : le maire fait diversion (il crée lui-même une affaire : un vol, un accident, un pont détruit… à choisir) pendant qu'il fait couvrir et reboucher le trou. Odette, une commère qui ne dort jamais, va voir sur place, surprend le maire en train de faire quelque chose qu'elle n'aurait pas dû voir, et se fait capturer et enfermer dans les sous-sols. Les enquêteurs font l'enquête officielle, mais entendent partout des rumeurs : Odette a disparu, le trou a été rebouché si vite, qu'y avait-il dedans ? Tim a vu quelque chose d'étrange dans le trou (comme une porte avec des runes) mais a dit au maire qu'il n'avait rien vu, par peur : le Barde peut le faire parler. À la fin, l'enquête paraît bidon, et l'équipe décide d'aller voir ce qui se passe autour du trou.
- **Enquête 3** : près du trou, le maire a fait sceller toute l'entrée ; il faut du matériel pour creuser. Le maire vient dire « attention, c'est dangereux », il ne doit pas en dire trop : il est en danger, les quatre pourraient découvrir son secret. Il élabore un plan pour qu'on ne découvre rien (à trouver).
**Propositions de Claude (pas validées) :** diversion de l'enquête 2 = le pont de la rivière saboté (le coupable est un ouvrier payé par le maire) ; plan du maire à l'enquête 3 = un faux coupable (Silas, avec de faux indices : le châle d'Odette, une fausse lettre « je suis partie chez ma sœur » qui sent la lavande comme la plume de l'enquête 1), démonté par les rôles (taille des pieds pour le Pisteur, faux témoin pour le Barde, écriture pour le Sage, odeur pour l'Alchimiste), puis Moustache, le chat d'Odette, mène à une grille au pied du chêne → l'entrée du sous-sol. Odette reste enfermée mais en bonne santé (pas de peur inutile pour des enfants de 8 ans). Démasquer le maire tard (enquête 8, « Le masque qui tombe »), sinon plus personne n'ouvre les sceaux pour lui ; les quatre sceaux des enquêtes 4 à 7 deviennent les serrures de la pierre.

### 12.10 Nouvelle enquête 2 — « La rivière rouge » (titre provisoire) — validée par Romain le 4 novembre à 15 h 09, RIEN DE CONSTRUIT
- **En secret, avant l'enquête** : le maire fait condamner le trou du Vieux Chêne avec de gros rochers (par ses ouvriers). Odette, commère qui ne dort jamais, va voir la nuit, surprend le maire, et se fait enfermer dans les sous-sols (en bonne santé). Pour que personne n'approche du chêne, le maire passe par un complice en cape noire (endetté, identité découverte bien plus tard ; peut-être l'apprenti du meunier) qui paie le charretier pour teindre la rivière en rouge. Le colorant vient des coquelicots du champ de l'herboriste, fabriqué dans des alambics, dans une petite pièce cachée sous le moulin. Un fumigène rouge (même colorant) est installé près du chêne.
- **Affaire officielle (accusation du Sage)** : QUI = le charretier ; OÙ = la pièce cachée sous le moulin ; POURQUOI = quelqu'un l'a payé. Choix du POURQUOI : 🌸 pour faire joli (son mensonge, que le maire répète : le piège) / 🪙 quelqu'un l'a payé (vrai) / 🧵 pour teindre des tissus et les vendre (éliminé par l'Alchimiste : ce rouge part à l'eau) / 😜 pour faire une farce (éliminé : « Lui, une farce ? Il n'a jamais ri de sa vie ! »). Faux suspects : Mélusine la couturière (teintures, alibi), le meunier et son apprenti (l'atelier est sous leur moulin, alibis). Le charretier n'est pas endetté (pour ne pas le confondre avec l'homme masqué). On ne parle jamais de « diversion », ni des gants du maire.
- **Deux pistes indépendantes pour le POURQUOI** : le Barde démasque le charretier (« un homme en cape noire m'a donné une bourse d'or, je ne sais pas qui c'était ») ; Gaspard le boulanger : « il m'a payé avec une pièce d'or toute neuve, lui qui n'a jamais un sou ! ».
- **Alchimiste** : analyse l'eau de la rivière (colorant de coquelicot, qui part à l'eau) ; en cueillant, découvre le champ de coquelicots rasé (« c'est bizarre ») ; l'herboriste confirme : c'est elle qui l'avait planté, quelqu'un a tout ramassé ; analyse la fumée rouge : même colorant (mystère de fond).
- **Pisteur** : suit les traces de roues de charrette du champ jusqu'au moulin et découvre la petite pièce aux alambics (une plume noire qui sent la lavande y traîne : piste gardée pour plus tard, inutile pour résoudre) ; la nuit, il passe le garde (Se cacher) : gros rochers traînés dans l'herbe, le pot du fumigène, et la canne d'Odette.
- **Barde** : le charretier (mensonge) ; le garde du carrefour (honnête, il obéit : on ne peut pas le démasquer, il ne laisse passer personne) ; Tim (il a vu dans le trou une porte avec des runes, mais a dit au maire qu'il n'avait rien vu, par peur) ; il rassemble le village pour aller voir au chêne → la fumée rouge, et le maire : « Reculez, ce sont des vapeurs toxiques ! ».
- **Sage** : codes des moments, accusation ; sa part d'indices est à étoffer (proposition : un vieux plan du moulin dans les archives, avec une pièce sans porte, qui aide le Pisteur à trouver l'atelier caché).
- **Fond (hors accusation)** : partout des rumeurs (Odette a disparu, le trou rebouché si vite, qu'y avait-il dedans ?), le chemin du chêne condamné et gardé, la fumée rouge, les rochers, la canne, la porte à runes.
- **Fin** : le maire met le charretier en prison et clôt l'affaire trop vite (« Payé ? Par qui ? Bah, peu importe, l'affaire est close ! ») ; le village s'inquiète toujours pour Odette ; l'équipe décide d'aller voir ce qu'il y a derrière les rochers → enquête 3.
- **À décider** : le nom du charretier, l'emploi du temps par moments (créneaux), les mini-jeux de chaque étape, la part du Sage.
- **Mini-jeux (Romain, 15 h 24)** : toujours à peu près les mêmes mini-jeux, adaptés à la situation. Pisteur : tir à l'arc, se cacher (se faufiler), poursuite, suivre la piste. Alchimiste : 7 différences et le double (analyses), le bon mélange (couleurs), les bulles, le chaudron, le ménage du labo. Barde : interrogatoires (mensonge, questions qui s'ouvrent au fil de l'enquête, se faire « rembarrer » s'il pose mal ses questions). Sage : il fait aussi le « constructeur » (réparer des choses). **La grille de déduction est à enlever** (trop compliquée et trop longue ; la déduction se fait naturellement dans l'enquête). Pour l'enquête 2 : suivre la piste adapté aux traces de charrette (deux traits + les pieds de celui qui la pousse, d'autres charrettes et d'autres pieds pour embrouiller) ; course-poursuite avec Tim au Vieux Chêne (il a peur) → une fois attrapé, le Pisteur envoie un code au Barde qui l'interroge ; le Sage trouve un parchemin avec un chemin détourné qui mène le Pisteur au chêne ; plus de fausses pistes (le tavernier, l'herboriste, la couturière) et des rumeurs farfelues (Odette mangée par un ours…). Le rassemblement du village : Barde ou Sage, à décider.
- **L'objet de Tim (Romain, 15 h 30)** : au fond du trou (enquête 1), Tim a ramassé un objet qu'il a caché à tout le monde. À l'enquête 2, il le donne (une rune / une pierre gravée cassée, ou un parchemin) : le Sage doit d'abord la réparer (Assembler les runes), puis la déchiffrer (L'alphabet secret) — deux mini-jeux du Sage. Proposition de Claude : chaîne Pisteur (attrape Tim) → Barde (le fait parler, reçoit l'objet) → code → Sage ; le morceau vient de la porte à runes ; message court et mystérieux qui ne dévoile pas tout (par ex. « SOUS LA BRUME DORT LA VILLE D'AVANT ») ; fait partie du mystère de fond, pas de l'accusation.
- **Distribution des personnages et des mensonges (proposition de Claude, 15 h 34, à valider)** — le Barde doit faire le tri entre les mensonges qui comptent et ceux qui cachent des histoires parallèles :
  - Mensonges qui comptent : le charretier (Bastien Roulier, nouveau : « pour faire joli » → payé par une cape noire) ; Tim (« je n'ai rien vu » → la porte à runes, la pierre cassée).
  - Mensonge parallèle qui cache un vrai indice : Victor le facteur (« j'étais à l'heure » → il était en retard, a coupé par le chemin du moulin et a vu à l'aube une charrette pleine de fleurs rouges).
  - Mensonges parallèles qui innocentent : Margot (« aucun tonneau n'a disparu » → un tonneau est tombé dans la rivière il y a huit jours, d'où la rumeur du vin ; l'eau n'était pas rouge) ; Mélusine et Fortuné, qui mentent tous les deux (« je tisse tout moi-même » / « je n'ai rien vendu à Mélusine ») → elle lui achète ses tissus en cachette, et cette nuit-là elle était chez lui (alibi ; Les dépositions à deux).
  - Mensonges parallèles qui sèment des graines : Farinel le meunier couvre son apprenti (« il ne sort jamais la nuit » → il sort la nuit, « pour voir une amoureuse ») ; Basile (« je n'ai pas arrosé avec l'eau de la rivière » → ses choux sont devenus roses ; il donne l'heure : hier soir l'eau était normale).
  - Honnêtes : Gaspard (la pièce d'or), Iris Lavandin (son champ rasé), Silas le garde champêtre (le garde du carrefour : il obéit aux ordres), Anselme le sonneur (un peu sourd : il faut bien choisir ses questions ; il a vu de la lumière au moulin la nuit).
  - Le maire ne ment jamais : il dit seulement des choses vraies (« il y a eu un éboulement ») et cache le reste ; le détecteur ne réagit pas. Plus tard : « il n'a jamais menti, il n'a juste pas tout dit ».
  - Les mots perdus : la nuit, au lavoir, deux ouvriers : « … tout bouché avant l'aube… on nous a bien payés… personne ne doit approcher… » (sans nommer le maire). Rassemblement : convaincre trois villageois avec le bon argument.
  - Attention : Iris s'appelle Lavandin ; la plume qui sent la lavande pourra plus tard la faire soupçonner (fausse piste possible, ou à éviter).
- **Précisions de Romain (15 h 53)** : l'enquête 2 est une enquête « on trouve le coupable » (pas par élimination) ; sans points d'action, le Barde peut interroger tout le monde. Le charretier doit avoir un nom rigolo lié à son métier. **Mélusine** : mini-enquête parallèle — elle achète en cachette à Fortuné du tissu de mauvaise qualité (pour économiser) au lieu de le fabriquer ; il déteint, et l'eau du **lavoir** est devenue toute rose (rien à voir avec la rivière). **Clairière** : seul le Pisteur peut l'innocenter (on y a cueilli, on n'y a rien fabriqué) ; un pistage qu'on finit forcément par réussir suffit. **Vieux Chêne** : fausse piste possible « la fumée rouge a coloré l'eau ». **Taverne** : un tonneau est tombé dans la rivière pendant un transport, la semaine dernière, et l'eau ne s'est pas colorée ; mensonge de Margot, fausse piste. Atelier de couture, herboristerie, potager, poste, clocher : lieux innocentés. **Maison d'Odette** : plusieurs habitants disent qu'ils ne l'ont pas vue ce matin (d'habitude si), ne savent pas où elle est, et demandent au Barde d'aller voir ; quand on ouvre, un chat sort, Odette n'est pas là : très étrange (accroche de l'enquête 3). **Maison de Bastien** : le Pisteur n'y trouve rien (fausse piste / impasse). **POURQUOI « farce »** : quelqu'un dit qu'il n'aime pas les farces, avec le mot « farce », pour faire le lien tout de suite.
- **Proposition de Claude (15 h 53)** : la chaîne pour trouver le charretier (Victor le reconnaît à sa roue qui grince, Gaspard et la pièce d'or, interrogatoire en trois niveaux), les choix du OÙ (moulin ✅, lavoir, Vieux Chêne, pont, clairière), et deux ajustements : pas d'analyse de la fumée dans l'enquête 2 (la rivière était déjà rouge le matin, la fumée n'apparaît que plus tard) ; le pistage des charrettes se recommence jusqu'à la réussite.
- **Romain (16 h 04)** : l'Alchimiste reste moins précis (« c'est un colorant qui part à l'eau », sans dire lequel), pour garder les fausses pistes ouvertes ; **Anselme et Basile sont retirés** de l'enquête 2 ; Victor a coupé par la clairière et a vu **Bastien avec une charrette pleine de fleurs** (il donne le QUI, pas le lieu) ; le Sage doit récupérer le vieux plan du moulin (un témoin du Barde dit que la mairie garde les plans de toutes les maisons) ; **problème à éviter : le Barde ne doit pas résoudre l'enquête tout seul**.
- **Répartition proposée par Claude (16 h 04)** : QUI = Barde (Victor) ; OÙ = Alchimiste (le champ rasé) → Pisteur (traces de la clairière jusqu'au moulin, qui s'arrêtent contre un mur) + Barde (Victor : « les plans de toutes les maisons sont à la mairie ») → Sage (répare le plan déchiré du moulin : une pièce sans porte) → Pisteur (trouve la porte cachée, les alambics, une bourse de cuir noir avec une pièce d'or au fond) → Alchimiste (même colorant que la rivière) ; POURQUOI = Barde (Bastien en trois niveaux) mais le 3e niveau ne s'ouvre qu'avec le code de la bourse trouvée par le Pisteur ; la pièce de Gaspard reste un indice. « Teindre des tissus » éliminé : ni tissu ni bassine dans la pièce cachée. Le Vieux Chêne éliminé par Mélusine (l'eau du lavoir… et la rivière étaient déjà rouges à l'aube, la fumée n'apparaît que l'après-midi).
- **Romain (16 h 09), remplace le QUI par Victor** : c'est **la pièce d'or qui trahit Bastien**. Le Barde interroge tout le monde ; Gaspard dit que Bastien l'a payé avec une pièce d'or toute neuve, c'est bizarre. Le Pisteur trouve la pièce aux alambics (sans Bastien : on ne sait toujours pas qui), avec une bourse et une pièce d'or toute neuve → on peut incriminer Bastien. Proposition de Claude : l'Alchimiste compare les deux pièces (Le double : le même petit poinçon) ; avant la preuve, Bastien ne lâche rien (« j'ai fait des économies ») ; Victor ne donne plus le QUI (il a vu une charrette pleine de fleurs, trop sombre pour voir qui) mais garde l'info des plans de la mairie.
- **Chaîne validée par Romain (16 h 15)** : (1) le Barde, en interrogeant tout le monde, apprend de Gaspard que Bastien l'a payé avec une pièce d'or toute neuve (bizarre) ; (2) Victor : il a vu une charrette partir du champ de coquelicots ; (3) le Pisteur suit les traces jusqu'au moulin, elles disparaissent, il ne trouve rien (on peut croire que ce n'est pas le moulin) ; (4) un autre personnage dit qu'on peut chercher dans la bibliothèque des plans de la ville → code au Sage ; (5) le Sage a plusieurs cartes à assembler, l'une est déchirée, celle du moulin : petit jeu de réparation → un passage secret dans le moulin → code au Pisteur ; (6) le Pisteur trouve les alambics et une bourse ; (7) l'Alchimiste confirme que c'est bien le colorant ; (8) le Barde fait le lien entre la bourse et la pièce toute neuve → Bastien ; (9) Bastien ne dit pas la vérité : le Barde la lui fait dire (détecteur de mensonge, talent, ou potion de vérité) → il a été payé. La comparaison des pièces par l'Alchimiste n'est pas obligatoire.
- **Propositions de Claude (16 h 15)** : c'est Farinel qui parle de la bibliothèque des plans (« mon moulin a été bâti par mon arrière-grand-père, ses plans doivent y être ») ; les traces s'arrêtent sur les pavés de la cour du moulin ; trois façons de faire parler Bastien, quel que soit le talent : le détecteur 🤥 de base (si raté, il se ferme jusqu'au moment suivant), « J'exige la vérité » (talent), la potion de vérité (préparée par l'Alchimiste : du travail pour lui) ; filet de sécurité : même sans aveu, la pièce toute neuve d'un charretier sans le sou suffit à répondre « payé ». Attention à ne pas faire deux fois Assembler les runes (plan déchiré + pierre de Tim) : plan = réparer puis superposer, pierre = alphabet seul, ou l'inverse.
- **L'interrogatoire de Bastien (Romain, 16 h 19)** : 1re fois (avant la preuve) : « J'ai dormi chez moi, je n'ai rien fait, je me suis levé tard » (mensonge) ; démasqué : « C'est vrai, je me promenais dans la forêt » et rien de plus. Quand le Pisteur trouve la bourse, son code va au Barde, qui réinterroge Bastien avec la pièce : « Oui, j'avoue, c'est moi, mais c'était juste pour faire joli » — encore un mensonge ; démasqué : il a été payé (cape noire). Propositions de Claude : après « la forêt », le détecteur montre qu'il cache encore quelque chose mais il se ferme (« Je n'ai rien d'autre à dire ») tant qu'il n'y a pas de preuve ; Silas peut contredire la promenade (« personne n'est passé par le carrefour cette nuit ») ; sa mimique de menteur (il se gratte l'oreille) peut être révélée par Gaspard ou Margot.
- **Ne pas rater l'histoire de fond (Romain, 16 h 24)** : la crainte est que l'équipe résolve vite l'affaire de Bastien et laisse tomber le reste (Odette, le trou, Tim…), « une catastrophe ». Idée de Romain : jouer avec les moments, le matin on ne peut pas interroger tout le monde ni beaucoup avancer l'affaire, on avance plutôt sur l'histoire de fond, ce qui donne envie d'en savoir plus. Proposition de Claude : (1) le rythme par moments (matin = surtout le fond, l'affaire s'ouvre l'après-midi, nuit = le Pisteur au chêne) ; (2) des indices de l'affaire donnés au milieu des scènes de fond ; (3) l'accusation ne s'ouvre qu'à la fin de la nuit et après trois scènes de fond (maison d'Odette, la pierre de Tim, la nuit au chêne), avec un message clair de ce qui reste à éclaircir ; (4) la fin raconte de toute façon le fond.
- **Romain (16 h 28)** : « je me promenais dans la forêt » n'est pas vraiment un mensonge (la clairière est dans la forêt) : le détecteur ne peut pas le trouver (Claude retire sa proposition de faire contredire la promenade par Silas). **Margot révèle comment plusieurs personnes mentent** (pas seulement Bastien, pour qu'il ne soit pas tout de suite dans la ligne de mire). **Nouvelle activité du Barde sur son tableau de liège** : des étiquettes animées de mensonges (« se gratte l'oreille »…), qu'il relie par un fil rouge au bon personnage ; à chaque interrogatoire, il regarde son tableau pour savoir comment la personne ment, et détecte le mensonge. Proposition de Claude : pas de validation (comme les phrases à trous) ; quelqu'un d'autre révèle la mimique de Margot ; mimiques simples et bien lisibles (oreille, nez, clignement, regard ailleurs, ruban, moustache), montrées par une petite icône animée près du portrait ; les personnages font aussi des gestes neutres pour que la mimique ne suffise pas sans le tableau.
- **Les moments de l'enquête 2 (Romain, 16 h 33)** : seulement trois moments, **matin, après-midi, nuit** (pas de soir). Ne pas tout mettre la nuit. Le Pisteur va au chêne **le matin** et y voit toute la trame de fond ; **l'après-midi, le rassemblement au chêne**. Proposition de Claude pour la répartition :
  - 🌅 Matin (le fond se découvre) : Odette introuvable, sa maison, le chat ; Silas et le chemin condamné ; le Sage superpose un vieux parchemin (chemin des bûcherons) pour donner au Pisteur un détour ; le Pisteur, caché, voit les ouvriers finir de poser les rochers et l'un d'eux installer un pot (le futur fumigène), trouve la canne d'Odette et surprend Tim → poursuite → code au Barde (Tim ment : « rien vu ») ; l'Alchimiste analyse la rivière (colorant qui part à l'eau), le lavoir rose ; Gaspard trop occupé.
  - ☀️ Après-midi (l'affaire s'ouvre) : Gaspard (Odette n'est pas venue + la pièce d'or), le champ rasé, Victor (la charrette partie du champ), les traces jusqu'au moulin perdues sur les pavés, Margot et ses mimiques (tableau de liège), Mélusine et Fortuné ; Farinel et la bibliothèque des plans → le Sage répare le plan du moulin ; le rassemblement au chêne, la fumée rouge, le maire et ses « vapeurs toxiques » (le Pisteur sait que c'est le pot du matin).
  - 🌙 Nuit (les secrets) : le Pisteur entre au moulin par le passage (il voit une silhouette sortir du moulin : l'apprenti, graine) → alambics + bourse ; l'Alchimiste analyse l'alambic (+ potion de vérité si besoin) ; le Barde confronte Bastien chez lui, entend deux ouvriers au lavoir (mots perdus), et Tim avoue la porte à runes et donne sa pierre → le Sage la déchiffre (alphabet). Accusation au petit matin.
  - Question ouverte : l'enquête 1 utilise matin, après-midi, soir (la fête est le soir) ; la passer aussi à la nuit ?
- **Romain (16 h 36)** : plus de mini-jeu à part pour le Barde : **chaque interrogatoire est le mini-jeu du mensonge**, avec des personnages tous animés (animations naturelles), et les mimiques se voient sur le visage (pas d'accessoire comme « essuie son comptoir ») ; on peut créer une mimique exprès pour un personnage (Margot : elle baisse les yeux et lève les sourcils). (C'est déjà le cas dans barde.js depuis la nuit du 4 novembre : visage parlant du mini-jeu, 7 signes de menteur, 20 mimiques honnêtes, un tic par villageois, TIC dans barde.js.) Proposition de Claude pour l'enquête 2 : un signe différent pour chaque menteur — Bastien : nouveau signe « ses oreilles deviennent toutes rouges » ; Margot : nouveau signe « baisse les yeux et lève les sourcils » ; Tim : mordille sa lèvre ; Victor : se mord la lèvre très vite ; Mélusine : le haut du front rosit (au lieu de mordille, doublon avec Tim) ; Fortuné : yeux de côté + sourire de travers ; Farinel : double clignement (au lieu de mordille) ; le maire (sourire forcé) ne ment jamais dans l'enquête 2. Corriger « Bastien se gratte l'oreille » en « ses oreilles rougissent » dans ce qui précède.
- **Romain (16 h 41)** : l'après-midi, Gaspard révèle la mimique de Margot (elle baisse les yeux et lève les sourcils). La nuit, au moulin, le Pisteur se cache quand l'apprenti sort : mini-jeu Se cacher. **Tim avoue la porte à runes plus tôt** (pas la nuit). Proposition de Claude : Tim avoue l'après-midi (le Barde le démasque avec le code de la poursuite du matin), donne sa pierre, et sa porte à runes devient un des arguments du rassemblement ; le Sage déchiffre la pierre l'après-midi ou la nuit. La scène des deux ouvriers au lavoir (phrases à trous) est à garder ou à retirer selon Romain.
- **Vérification « dans le désordre » (Claude, 16 h 43, demandée par Romain)** — problèmes trouvés et corrections proposées :
  1. Les tablettes ne sont pas reliées : une scène « pour tout le monde » (rassemblement, fumée) n'existe que sur une tablette ; les autres la reçoivent par un code, sous forme de récit.
  2. Chronologie : Victor voit la charrette partir du champ « à l'aube » alors que la rivière est déjà rouge à l'aube → le champ a été rasé AVANT-HIER, le colorant fabriqué au moulin, versé cette nuit ; Victor : « avant-hier à l'aube » ; Bastien : « je me suis promené dans la forêt avant-hier » (vrai, la clairière est dans la forêt, le détecteur ne réagit pas).
  3. Si Silas garde le carrefour, personne n'atteint la clairière (Victor, l'Alchimiste, la charrette) → Silas ne garde que la branche vers le Vieux Chêne (sur la carte, le chêne est à gauche du carrefour, la clairière à droite, près du moulin).
  4. Pourquoi une bourse au moulin ? → plutôt une pièce d'or toute neuve tombée sous l'alambic (Bastien y a compté son argent).
  5. Le Pisteur peut arriver au chêne à un autre moment : textes selon le moment et selon que le rassemblement a eu lieu (ouvriers ou pas, pot froid / allumé / éteint, Tim seulement le jour).
  6. Rythme imposé par des raisons du village : la brume du matin cache les traces de la clairière, Gaspard au four, Victor en tournée, Bastien en livraison ; le passage du moulin ne s'utilise que la nuit (le moulin est plein de monde le jour).
  7. Deux chemins pour chaque passage obligé : la pièce cachée (plan du Sage OU voir la silhouette sortir d'une porte cachée la nuit) ; Tim (code de la poursuite OU son tic) ; le rassemblement (3 arguments parmi 4-5) ; passer Silas (détour du Sage OU Se cacher).
  8. Répliques valables dans n'importe quel ordre ; objets qui disent d'eux-mêmes à qui ils sont (la canne gravée de chats → Odette).
  9. Silhouette au moulin + Farinel qui couvre son apprenti → les enfants soupçonneront l'apprenti tout de suite ; si on le garde pour bien plus tard : silhouette encapuchonnée (la cape noire), et peut-être pas le mensonge de Farinel dans l'enquête 2.
  10. Verrou de l'accusation à mettre à jour : maison d'Odette, le Pisteur au chêne (la canne), la pierre de Tim, et après la nuit.
  11. Moments par joueur : la nuit, le Barde attend la pièce du Pisteur pour confronter Bastien → la scène des ouvriers au lavoir lui donne quelque chose à faire pendant ce temps (raison de la garder).
- **L'ordre des interrogatoires du Barde (Romain, 16 h 46)** : selon qui il voit en premier, le Barde obtient plus de questions possibles chez les autres ; certains ne veulent pas être interrogés deux fois dans le même moment. Proposition de Claude : (1) questions débloquées par ce qu'on sait (existe) ; (2) une seule visite par moment pour Bastien, Tim, Victor, Iris, Farinel, Mélusine ; visites libres pour Gaspard, Margot, Silas, le maire, Fortuné ; (3) exception : revenir avec du nouveau qui le concerne rouvre la porte (« Tu as du nouveau ? Bon, je t'écoute ») ; un villageois vexé reste fermé jusqu'au moment suivant ; (4) Farinel aussi joignable la nuit (il vit au moulin, réveillé et grognon) ; (5) rassemblement possible aussi la nuit en secours. Ordre logique : Gaspard (tic de Margot, pièce d'or) → Margot (tonneau, puis les tics de Victor, Bastien, Tim, Mélusine, Fortuné, Farinel) → Victor (la charrette) → Tim (avec le code de la poursuite ou son tic) → Farinel (avec le code des traces) → Bastien (tour 1 avec son tic ; tour 2 la nuit, avec la pièce du moulin et celle de Gaspard) ; Mélusine (avec le code du lavoir rose) → Fortuné.
- **Simulation (scratchpad/simu-barde-e2.py, Barde qui visite au hasard)** : sans la règle « du nouveau rouvre la porte », l'aveu de Bastien n'arrive que dans 48 % des parties ; avec, 84 % (joueur moyen) / 68 % (joueur maladroit) ; Tim ~100 % ; rassemblement 94 % / 84 % ; POURQUOI trouvable (aveu ou déduction par les deux pièces) 90 % / 84 % ; Farinel seulement de jour → plan du moulin dans 70 % des parties seulement. Conclusion : l'ordre change surtout la vitesse, pas la réussite ; la difficulté est dans le repérage des mensonges et le piège « pour faire joli ».

### 12.11 ENQUÊTE 2 « LA RIVIÈRE ROUGE » — SPÉCIFICATION FINALE À CONSTRUIRE (Romain, 4 novembre, 16 h 56 : « finalise tout ça le plus vite possible »)
Cette section remplace et résume tous les points de §12.10 (en cas de contradiction, c'est elle qui fait foi). C'est la première enquête après le tutoriel : elle doit rester abordable.

**Réglages** : `sansActions:true` (comme l'enquête 1) ; trois moments : **matin, après-midi, nuit** ; accusation au petit matin, après la nuit. Le Sage a 2 cœurs (3 essais). Choix forcé du talent du niveau 2 au début (inchangé).

**Ce qui s'est passé en secret (pour l'écriture, jamais dit tel quel)**
- Avant-hier avant l'aube, Bastien Roulebosse (le charretier, nouveau personnage, nom à confirmer par Romain), payé par un homme en cape noire à capuchon (complice du maire, endetté, identité découverte bien plus tard), rase le champ de coquelicots qu'Iris avait planté à la clairière aux lièvres et emporte les fleurs en charrette vers le moulin. Victor (en retard, il coupait par la clairière) voit une charrette partir du champ, trop sombre pour voir qui. Silas, en tournée, a vu une charrette passer vers la clairière sans faire attention à qui.
- Dans une pièce cachée du moulin (oubliée depuis l'arrière-grand-père de Farinel), Bastien fabrique un concentré avec des alambics pendant deux nuits ; la nuit dernière, il le verse dans la rivière (le moulin est au bord de l'eau) : à l'aube, la rivière est rouge. Il y a compté son or et a perdu une pièce toute neuve sous l'alambic.
- Pendant ce temps, des ouvriers du maire bouchent le trou du Vieux Chêne avec de gros rochers ; ils finissent ce matin. Odette (commère, ne dort presque jamais) est allée voir cette nuit, a surpris ce qu'il ne fallait pas, et a été enfermée dans les sous-sols (en bonne santé). Sa canne (sept chats gravés sur la poignée) est restée près des rochers. Le maire a fait fermer le chemin du chêne (« éboulement dangereux ») et posté Silas à la branche qui y mène ; un ouvrier installe près du chêne un pot de fumigène rouge (poudre noire achetée à Fortuné par la cape noire).
- Tim a vu au fond du trou (enquête 1) une porte avec des runes et y a ramassé une pierre gravée ; il a dit au maire qu'il n'avait rien vu, par peur.

**Ouverture** : lettre du maire (« La rivière est devenue toute rouge ! Trouvez QUI a fait ça, OÙ, et POURQUOI ») + l'affiche « Par ordre du maire, le chemin du Vieux Chêne est fermé : éboulement dangereux ».

**Accusation du Sage** : QUI = Bastien ✅ / Mélusine / Margot / Iris / Farinel. OÙ = le moulin ✅ / le lavoir / le Vieux Chêne / le pont / la clairière. POURQUOI = 🪙 quelqu'un l'a payé ✅ / 🌸 pour faire joli (le piège) / 🧵 pour teindre des tissus / 😜 pour faire une farce. **Verrou** : on ne peut accuser qu'après la nuit du Sage et quand on a vu la maison d'Odette, la canne d'Odette, et la pierre de Tim ; sinon un message dit exactement ce qui reste (« Il reste des mystères à éclaircir avant d'accuser : … »).

**Règles du Barde (tous les interrogatoires sont le mini-jeu du mensonge, visages animés)**
- Les questions se débloquent avec ce qu'on sait (indices, codes reçus).
- Une seule visite par moment pour Bastien, Tim, Victor, Iris, Farinel, Mélusine (« Encore toi ? Reviens plus tard ! ») ; **revenir avec du nouveau qui le concerne rouvre la porte** (« Tu as du nouveau ? Bon, je t'écoute ») ; un villageois vexé reste fermé jusqu'au moment suivant. Visites libres : Gaspard, Margot, Silas, le maire, Fortuné.
- **Signes des menteurs** (un différent par menteur ; nouveaux signes à créer dans le moteur des visages) : Bastien = ses oreilles deviennent toutes rouges (nouveau) ; Margot = baisse les yeux et lève les sourcils (nouveau) ; Tim = mordille sa lèvre ; Victor = se mord la lèvre très vite ; Mélusine = le haut du front rosit ; Fortuné = yeux de côté + sourire de travers ; Farinel = double clignement. Le maire ne ment jamais (il dit des choses vraies et tait le reste).
- **Le tableau de liège** : quand un villageois révèle un signe, le Barde reçoit une étiquette animée (le signe), qu'il épingle et relie par un fil rouge à une photo ; pas de validation (comme les phrases à trous). Les visages font aussi des gestes neutres.
- **Qui révèle quoi** : Gaspard → le signe de Margot ; Margot (une fois son mensonge du tonneau démasqué) → les signes de Bastien, Victor, Tim, Mélusine, Fortuné, Farinel (Bastien noyé dans la liste).

**Les villageois** (moments où on les trouve)
- 🛒 **Bastien** (après-midi sur la place ; nuit chez lui) : tour 1 « J'ai dormi chez moi ces jours-ci, je me suis levé tard, rien fait » 🤥 → « Bon… je me suis promené dans la forêt avant-hier » (vrai : le détecteur ne réagit pas) et il se ferme. Tour 2 (avec le code de la pièce trouvée par le Pisteur ET l'histoire de Gaspard) : « D'accord, c'est moi ! Mais c'était juste pour faire joli » 🤥 → « Un homme en cape noire m'a payé. Je ne sais pas qui c'était. » Trois façons de le faire parler : le détecteur de base, « J'exige la vérité » (talent), la potion de vérité (Alchimiste). Sa maison : la charrette lavée, ça sent le savon (impasse).
- 🧒 **Tim** (matin caché au chêne, après-midi place, nuit chez lui) : « Je n'ai rien vu dans le trou ! » 🤥 (débloqué par le code de la poursuite OU son signe) → la porte à runes + il donne la pierre (code pour le Sage). Il avoue dès l'après-midi.
- ✉️ **Victor** (après-midi et nuit ; matin en tournée) : « Moi ? Toujours à l'heure pour ma tournée ! » 🤥 → « Avant-hier j'étais en retard, j'ai coupé par la clairière… j'ai vu une charrette partir du champ de coquelicots, trop sombre pour voir qui. »
- 👨‍🍳 **Gaspard** (matin : « Revenez cet après-midi, c'est le coup de feu ! » ; après-midi, nuit au four) : « Odette n'est pas venue chercher son pain… Et autre chose de bizarre : Bastien m'a payé avec une pièce d'or toute neuve, lui qui n'a jamais un sou ! » ; le signe de Margot.
- 🍺 **Margot** (après-midi, nuit) : « Aucun tonneau n'a disparu ! » 🤥 → « Un tonneau est tombé dans la rivière pendant un transport, la semaine dernière… et l'eau n'est pas devenue rouge. » Puis les signes des autres. « Bastien ? Une farce ? Il déteste les farces ! » (élimine le POURQUOI farce).
- 🧵 **Mélusine** (matin au lavoir, après-midi à l'atelier) : Odette ne vient plus au lavoir ; « À l'aube, la rivière était déjà rouge » (élimine la fumée du chêne, qui n'apparaît que l'après-midi) ; « Je tisse tous mes tissus moi-même ! » 🤥 (débloqué par le code du lavoir rose de l'Alchimiste) → elle achète à Fortuné du tissu pas cher qui déteint : c'est lui qui a rendu l'eau du lavoir toute rose (mini-enquête parallèle).
- 🤠 **Fortuné** (après-midi seulement, il arrive avec sa carriole) : « Je n'ai rien vendu à Mélusine » 🤥 → il confirme ; et « avant-hier, un homme en cape noire m'a acheté de la poudre noire » (mystère de fond).
- 🌾 **Farinel** (matin, après-midi, et la nuit — réveillé, grognon) : rien de bizarre au moulin (vrai, il ne sait rien) ; avec le code des traces perdues du Pisteur : « Mon moulin a été bâti par mon arrière-grand-père, ses plans doivent être à la bibliothèque des plans » → code pour le Sage. (Pas de mensonge sur l'apprenti dans l'enquête 2.)
- 🌿 **Iris** (matin, après-midi) : « On a rasé mon champ de coquelicots, avant-hier ! » ; très en colère : une question mal posée la vexe.
- 🛡️ **Silas** (partout, à la branche du chêne) : « Ordre du maire : personne ne va au Vieux Chêne. » Il laisse passer partout ailleurs. « Avant-hier, une charrette est passée vers la clairière, je n'ai pas fait attention à qui. » Honnête.
- 🎩 **Le maire** (mairie) : « Sans doute une mauvaise farce. Le chemin du chêne ? Un éboulement, c'est dangereux. » Il ne ment jamais.
- 👵 **Maison d'Odette** : la porte s'ouvre, un chat jaillit, le lit n'est pas défait, Odette n'est pas là (scène valable quel que soit l'ordre).

**Le rassemblement** (Barde, après-midi, ou la nuit en secours) : convaincre trois villageois parmi Gaspard, Mélusine, Victor, Margot, Iris, chacun avec le bon argument parmi trois (Odette a disparu, la canne trouvée, la porte à runes de Tim, les rochers) ; mauvais argument = vexé. Scène : tout le monde au chêne, un ouvrier caché allume le pot, fumée rouge, le maire : « Reculez, ce sont des vapeurs toxiques ! ». Le Barde donne un code aux autres, qui voient la scène en récit court (petite animation ou texte).
- **Nuit, au lavoir** (Barde, pendant qu'il attend la pièce du Pisteur) : caché, il entend deux ouvriers (ceux qui ont posé les rochers) se laver les mains pleines de terre : phrases à trous « … on a tout bouché avant l'aube… on nous a bien payés… personne ne doit approcher du chêne… ».

**Pisteur**
- Matin : la branche du chêne est gardée par Silas → le détour du Sage (code) OU Se cacher pour passer. Au chêne (textes selon le moment) : le matin, les ouvriers finissent de poser les rochers et l'un installe un pot ; il trouve la canne d'Odette (sept chats gravés) ; il surprend Tim → Course-poursuite → code « Tim » pour le Barde. L'après-midi : rochers posés, pot en place (ou éteint après le rassemblement), Tim parfois. La nuit : pas de Tim, pot froid.
- Après-midi (la brume du matin cachait la clairière) : au champ rasé, Suivre la piste en version charrette (deux traits de roues + les pieds de celui qui pousse ; pour embrouiller : une brouette à une roue, la carriole plus large de Fortuné) → les traces mènent au moulin et se perdent sur les pavés de la cour ; le jour, le moulin est plein de monde, il ne trouve rien. Code « traces perdues » pour le Barde.
- Nuit : au moulin, avec le code du plan du Sage, il trouve le passage ; en secours, il se cache (Se cacher) et voit une silhouette à capuchon sortir d'une porte cachée. Dans la pièce : alambics, reste de colorant rouge (code pour l'Alchimiste), une pièce d'or toute neuve sous l'alambic (code pour le Barde), ni tissu ni bassine.

**Alchimiste**
- Matin : eau de la rivière au pont (mini-jeu d'analyse) → « un colorant qui part à l'eau » (sans dire lequel) ; eau du lavoir → « un rose de tissu qui déteint » (code pour le Barde, Mélusine).
- Après-midi : en cueillant à la clairière, le champ rasé « c'est bizarre » (code pour le Barde/Iris) ; il peut préparer une potion de vérité pour le Barde.
- Nuit : reste de l'alambic (code du Pisteur) → Le bon mélange : le même rouge que la rivière (le OÙ est prouvé).

**Sage**
- Matin : page « Les vieux chemins » du Grand Livre → Superposer les plans → le détour des bûcherons (code pour le Pisteur).
- Après-midi ou nuit : code de Farinel (Barde) → page « La bibliothèque des plans » : plusieurs plans, celui du moulin est déchiré → Assembler les runes → un passage secret (code pour le Pisteur).
- La pierre de Tim (code du Barde) → L'alphabet secret → « SOUS LA BRUME DORT LA VILLE D'AVANT » (proposition, Romain n'a pas encore choisi).
- Codes des moments (chacun avance quand il a fini) ; l'accusation.

**Fin** : le maire met Bastien en prison et clôt l'affaire trop vite (« Payé ? Par qui ? Bah, peu importe, l'affaire est close ! ») ; le village s'inquiète toujours pour Odette ; un de ses chats est assis devant les rochers ; l'équipe décide d'aller voir ce qu'il y a derrière → « À suivre… ». Si l'équipe perd : la rivière reste rouge, le maire déçu, la brume efface les souvenirs (comme l'enquête 1). Ragots de l'enquête 2 : drôles (un ours a emporté Odette pour qu'elle lui tricote un pull, les poissons ont rougi de honte, le meunier a renversé sa confiture de fraises), plus aucun ragot du Corbeau.

**L'enquête 3 actuelle** suit l'ancienne histoire (le Corbeau) : elle n'est plus cohérente après la nouvelle enquête 2 → la marquer « en cours d'écriture » (pas jouable) jusqu'à sa réécriture.

### 12.12 Enquête 3 — en discussion (Romain, 4 novembre, 17 h 06 → 17 h 21) — RIEN DE CONSTRUIT
> ⚠️ **Remplacé par le §13** (6 novembre 2026) : beaucoup de ces idées ont changé (la chanson d'Odette, la potion de lumière, l'accusation au petit matin…). Archive seulement.
- Romain (17 h 15) : à la fin de l'enquête 2, tout accuse le maire (trou bouché, fumigène, Odette disparue près du trou) : c'est logique qu'on le soupçonne ; on pourrait même imaginer qu'Odette est morte. Claude : accepter le soupçon (« on sait que c'est lui, mais on ne peut pas le prouver » jusqu'à l'enquête 8) ; ne jamais écrire « morte » ; si la peur sert, la faire retomber dans la même enquête.
- **Idée de Romain (17 h 21)** : l'enquête 3 commence par le maire qui dit avoir reçu une lettre d'Odette : elle est en vie, tout va bien, et il a une nouvelle mission pour l'équipe (encore une diversion). Tout le village est rassuré (personne ne pense que le maire est méchant), sauf l'équipe, qui a un gros doute. Dans la lettre, Odette cherche partout sa canne : si quelqu'un la trouve, qu'il la rapporte chez elle en attendant son retour. En parallèle de la nouvelle affaire du maire, l'histoire principale continue : le chat d'Odette gratte à une grille → un nouveau chemin souterrain que le Pisteur peut explorer, avec plein de choses à découvrir.
- Propositions de Claude : la lettre est fausse (le Sage compare avec la vraie écriture d'Odette ; l'Alchimiste : elle sent la lavande, comme les plumes ; Victor : elle n'est pas passée par la poste) — le maire ne ment pas (« j'ai reçu cette lettre »), donc la démasquer ne l'accuse pas ; la canne est un piège pour récupérer la preuve : si on la rapporte, elle disparaît dans la nuit ; si on la garde, quelqu'un en cape tente de la voler la nuit (Se cacher) — les deux chemins donnent des indices ; idée d'affaire officielle : « les sept chats d'Odette ont disparu dans le village » (le maire veut les faire enfermer « pour leur sécurité » parce qu'ils grattent à la grille et attirent l'attention) → en les cherchant, l'équipe trouve la grille : le plan du maire se retourne contre lui ; autre idée : retrouver un registre des fondateurs disparu des archives, que le maire récupère ensuite « pour le mettre en sécurité » (il en avait besoin). Éviter que l'enquête 3 répète l'enquête 2 (diversion + fond) : l'affaire officielle plus courte, l'exploration souterraine plus grande. Technique : la canne trouvée à l'enquête 2 doit passer dans l'enquête 3.
- **Romain (17 h 27)** : le maire se fiche des chats ; mais les chats font jaser (« elle est partie sans ses chats », ils viennent mendier à manger chez les autres, « quelle tête en l'air, cette Odette ! ») : 2-3 petits dialogues. Peut-être un seul chat disparu, qui, grâce au Pisteur, mène à l'entrée d'un souterrain. **L'affaire bidon du maire se résout assez vite**, et on se concentre sur l'histoire principale. Propositions de Claude : un des ragots porte un indice (Mélusine : « Odette n'aurait JAMAIS laissé ses chats ! ») ; Moustache disparu, le Pisteur suit ses traces de pattes jusqu'au vieux puits, dont la grille rouillée existe déjà dans l'enquête 1 (« Personne ne l'a ouverte depuis des années ») et sous lequel la carte a déjà le tunnel du puits ; l'accusation du Sage porte sur l'histoire principale (OÙ est Odette, QUI l'a emmenée : l'homme en cape noire, POURQUOI : elle a vu ce qu'elle ne devait pas voir), sans proposer le maire parmi les choix ; affaire bidon courte, au choix : préparer la fête du retour d'Odette (ironique) ou une toute petite affaire d'un matin.
- **La fête du retour d'Odette (Romain, 17 h 36)** : l'affaire bidon du maire = organiser une fête. Alchimiste : un mini-jeu exprès de création de gâteau (pièce montée…), avec une note pour le plus beau gâteau. Barde : un budget du maire pour acheter des fleurs, marchander malin avec plusieurs personnages pour rester dans le budget. Sage : un puzzle difficile (niveau 10) pour reconstituer un tableau en l'honneur d'Odette. Pisteur : à trouver. Propositions de Claude : Pisteur = Tir à l'arc pour accrocher les guirlandes et lampions en haut du mât (flèche + ficelle par-dessus les branches), ou Course-poursuite pour rattraper l'oie du festin échappée de chez Gaspard ; réutiliser les moteurs existants quand c'est possible (le marchandage dans les dialogues à choix du Barde avec un compteur de budget ; le tableau = Assembler les runes avec une peinture d'Odette et ses chats ; le gâteau = nouveau mini-jeu « suis la commande de Gaspard » noté en étoiles) ; la fête a lieu la nuit sur la place, tout le village y est, Silas aussi : c'est la couverture idéale pour que l'équipe file au puits sans être vue (la diversion du maire se retourne contre lui).
- **Mini-jeux de la fête (Romain, 17 h 41, validé)** :
  - Alchimiste : créer le mini-jeu du gâteau, mais de façon réutilisable : on garde le système et on change le gâteau par un autre objet plus tard (un élément d'enquête) — « tu ne codes pas ce mini-jeu pour rien ». (Claude : un moteur générique « assembler selon une commande » : une fiche modèle, des pièces à choisir et à empiler/placer, une note en étoiles ; habillages possibles plus tard : réparer une lanterne, monter une clé, un mécanisme…)
  - Pisteur, Course-poursuite : même système, mais en ville au lieu de la forêt (décor de rues), et on poursuit une oie vue de dos : pattes, ailes, long cou, toute blanche.
  - Pisteur, Tir à l'arc : même système, décor de fête ; à chaque tir, une banderole de petits drapeaux de couleur part avec la flèche ; il vise des cibles ; s'il réussit, à la fin les banderoles sont accrochées pour la fête.
  - À construire après la version jouable de l'enquête 2 (variantes visibles d'abord dans la salle de test).
- **Histoire principale de l'enquête 3, la lettre (Romain, 17 h 46)** : le maire garde la lettre et ne veut pas la donner : le Barde doit trouver les arguments pour l'obtenir, ou le Pisteur va la chercher ; elle passe au Sage, qui l'analyse et envoie le Barde chercher chez Odette un écrit de sa main ; tout va à l'Alchimiste, qui en déduit que ce n'est pas Odette qui l'a écrite → fin du doute, tout est faux. L'après-midi, le Pisteur suit le chat ; le Barde interroge tout le monde (« mais je ne sais pas trop pourquoi »). Propositions de Claude pour faire avancer : le Barde cherche QUI a déposé la lettre (Victor : pas passée par la poste ; Tim, sur les toits à l'aube : une silhouette à capuchon l'a glissée sous la porte de la mairie puis a filé vers le vieux puits — même endroit que le chat) et apprend qu'Odette n'a pas de sœur ; l'Alchimiste prépare une potion qui ronge la rouille pour ouvrir la grille du puits (+ potion de lumière pour le tunnel) ; le Sage retrouve dans la bibliothèque des plans que le puits rejoint de vieux tunnels ; la nuit, pendant la fête, l'équipe descend : le Pisteur suit Moustache sous terre (ruban d'Odette, murs gravés de la ville d'avant, une grande porte scellée à quatre symboles), le Barde entend Odette chanter sa chanson préférée derrière la porte (phrases à trous : elle dit où elle est), le Sage relie le tunnel du puits et celui du chêne sur sa carte ; la canne : rapportée → disparue au matin ; gardée → tentative de vol la nuit ; au petit matin, accusation (OÙ / QUI / POURQUOI sur Odette) ; fin : on l'entend mais la porte est scellée → enquête 4 : ouvrir le premier sceau pour la sauver ; le maire annonce encore qu'Odette « reviendra la semaine prochaine ».
- **Romain (17 h 52)** : que le Barde n'ait qu'un choix clair : aller directement à la maison d'Odette (peut-être pour déposer la canne) ; là, un chat s'enfuit et laisse des traces ; le Barde donne le code au Pisteur, qui sait ainsi qu'il y a quelque chose à chercher. Proposition de Claude : une seule visite qui fait tout — le Barde dépose la canne (comme le demande la lettre) et prend le carnet des sept chats (l'écriture d'Odette, pour le Sage et l'Alchimiste) ; Moustache file en laissant des traces de pattes (lait renversé ou farine) → code au Pisteur ; plus de choix « garder ou rendre la canne » : déposée, elle a disparu au matin et le voisin a vu une silhouette à capuchon entrer chez Odette dans la nuit.
- **Qui a écrit la lettre ? (Romain, 18 h 02)** : analyser plusieurs écritures, avec une variante des 7 différences : le cadre du bas montre l'écriture de la lettre, le cadre du haut les écritures trouvées par le Barde et le Pisteur ; l'Alchimiste en déduit qui a écrit la lettre. Propositions de Claude : la plume est **Mélusine** (déjà à court d'argent dans l'enquête 2, elle a accepté l'or d'un homme en cape qui lui a dicté la lettre ; elle avoue en pleurant, et ajoute qu'il avait la voix étouffée et sentait la lavande) ; échantillons : étiquettes de tissus de Mélusine, carnet de tournée de Victor, étiquettes de pots d'Iris (qui s'appelle Lavandin : fausse piste avec l'odeur de lavande), ardoise de Margot, ardoise de prix de Fortuné, et l'affiche du maire de l'enquête 2 (ce n'est pas son écriture : il est malin) ; le mini-jeu cherche des ressemblances (3 formes de lettres particulières) plutôt que des différences ; l'accusation de l'enquête 3 = QUI a écrit la lettre + OÙ est Odette (pas de POURQUOI, pour ne pas répéter « payé » de l'enquête 2). Le moteur sait déjà dessiner des écritures différentes (M.ecriture).
- **Chercher l'homme de main (Romain, 18 h 07)** : à l'enquête 3, le Barde, en interrogeant tout le monde, doit arriver à trouver plus ou moins qui c'est. Plusieurs villageois en ont assez des questions (« Encore vous ? Ça fait beaucoup de questions ces derniers jours… Revenez ce soir, là je suis occupé ») ; le soir, ils répondent, sauf un, qui est parti en laissant des traces de pas que le Pisteur suit. Propositions de Claude : le soir = la fête, le Barde y interroge les villageois, et remarque qu'un seul manque à la fête ; ses traces partent de chez Odette (il est venu prendre la canne : le voisin, resté chez lui, a vu un capuchon) et mènent au vieux puits ; sous terre, le Pisteur doit se cacher de lui, il s'enfuit dans les tunnels sans montrer son visage : soupçon fort, pas de preuve (la preuve viendra bien plus tard) ; c'est l'apprenti du meunier, à présenter d'une ligne dès l'enquête 2 (Farinel : « mon apprenti est encore parti livrer la farine ») ; nom proposé : Léo Mouture ; ses pieds (registre) collent aux traces.
- **Double jeu de pistes (Romain, 18 h 09)** : d'abord, depuis chez l'homme de main, une piste qui montre qu'il va chez Odette ; ensuite, une deuxième piste de chez Odette jusqu'à l'entrée d'un souterrain, peut-être une nouvelle entrée. Propositions de Claude : il habite au moulin (l'apprenti, Léo Mouture — une ligne ajoutée dans l'enquête 2 : « Mon apprenti, Léo ? Encore parti livrer la farine ») ; la nouvelle entrée = la crypte du clocher (elle existe déjà sur la carte des sous-sols) ; Moustache, le matin, mène déjà le Pisteur à la crypte, fermée le jour (le sonneur la ferme à clé), et la nuit la porte est entrouverte parce que l'homme de main l'a utilisée ; la grille du puits est gardée pour plus tard ; l'Alchimiste prépare une potion de lumière plutôt qu'une potion contre la rouille ; attention à la charge du Pisteur dans l'enquête 3 (deux jeux de fête, la piste du chat, la double piste, se cacher sous terre) : laisser la lettre au Barde seul.
- **Romain (18 h 15)** : beaucoup de petits mini-jeux pour le Pisteur, ce n'est pas grave (ils sont courts et sympas) : on lui laisse tout, y compris d'aller chercher la lettre à la mairie (deux chemins pour la lettre : les arguments du Barde ou le Pisteur qui se cache).
- **La lettre, deux chemins (Romain, 18 h 17)** : les arguments du Barde pour obtenir la lettre du maire doivent être très compliqués (beaucoup de choix, très peu de chances de réussir) ; le Pisteur, lui, réussit forcément (il suffit de réussir son mini-jeu). Si le Barde réussit, il est tout content ; s'il échoue, ce n'est pas grave ; si les deux réussissent, les deux sont contents. Proposition de Claude : trois choix d'arguments à la suite, 4 ou 5 possibilités chacun, un seul chemin gagnant (environ 1 chance sur 60 au hasard) ; un indice discret pour les malins (Margot : « Le maire ne supporte pas qu'on puisse croire qu'il cache quelque chose ») ; un échec = le maire le congédie jusqu'au moment suivant ; le Pisteur se cache dans la mairie (Se cacher), à recommencer jusqu'à la réussite ; les deux chemins donnent le même objet (le code ne compte qu'une fois).
- **Les arguments se récoltent (Romain, 18 h 19)** : aller directement chercher la lettre = environ 1 chance sur 60 ; si le Barde parle à droite à gauche et pose des questions sur le maire, il récupère des arguments et on redescend à environ 1 chance sur 3 ou 5. Proposition de Claude : 3 étapes ; étape 1 (4 choix), indice clair de Gaspard (« il adore qu'on le félicite pour ses fêtes ») ; étape 2 (4 choix), indice clair de Margot (« il ne supporte pas qu'on croie qu'il cache quelque chose ») ; étape 3 (3 choix), seulement un indice vague de Victor (« il range tout dans son grand coffre et déteste prêter ses papiers » → bon choix : promettre de la rapporter avant la fête) ; sans indice ≈ 1/48, un indice ≈ 1/12, deux indices ≈ 1/3 ; les indices sont dits à mots couverts (il faut faire le lien) ; une nouvelle question « Et le maire, il est comment ? » chez plusieurs villageois.
- **Dialogues de l'énigme de la lettre (écrits par Claude, Romain lui laisse faire, 18 h 20)** — le maire a lu la lettre à tout le village le matin et la garde dans son coffre.
  - Indices (nouvelle question « Et le maire, il est comment ? ») : **Gaspard** : « Le maire ? Il est très fier de ses fêtes. Rien ne lui fait plus plaisir qu'un compliment là-dessus. » — **Margot** : « Ce qu'il déteste par-dessus tout, c'est qu'on raconte qu'il cache des choses. Une fois, j'ai dit en riant qu'il avait un coffre secret… il est devenu tout rouge et il m'a tout montré pour prouver le contraire ! » — **Victor** : « Il range tous ses papiers dans son grand coffre, et il les compte chaque soir avant d'aller dormir. »
  - Étape 1, ouvrir la discussion : ✅ « Bonjour Monsieur le maire, quelle fête magnifique vous préparez pour Odette ! » (« Ah, n'est-ce pas ? Les lampions, le gâteau… Que puis-je pour vous ? ») / « Bonjour, je viens vous poser quelques questions. » (« Encore des questions ? J'ai une fête à préparer. ») / « Monsieur le maire, c'est urgent, il faut parler de la lettre ! » (« Urgent ? Mais tout va bien, Odette va bien. Au revoir. ») / « Vous avez l'air bien fatigué, Monsieur le maire. » (« Fatigué, moi ? Pas du tout ! Bonne journée. »).
  - Étape 2, la demande : « Je pourrais lire la lettre d'Odette ? » (« Je l'ai lue à tout le village ce matin, vous l'avez entendue comme tout le monde. ») / « Donnez-moi cette lettre, je crois qu'elle est fausse ! » (« Fausse ?! Comment osez-vous ! Sortez ! » → vexé) / ✅ « Vous savez, les gens commencent à se demander pourquoi vous gardez cette lettre pour vous… » (« Pour moi ? Mais je ne cache rien du tout, voyons ! ») / « Odette est mon amie, j'aimerais garder sa lettre en souvenir. » (« Une lettre arrivée à la mairie reste à la mairie. »).
  - Étape 3, le convaincre : ✅ « Je vous la rapporte avant la fête de ce soir, promis. » (« Hmm… Bon. Mais avant la fête, c'est bien compris ? » → il donne la lettre : code pour le Sage) / « Je peux la recopier ici, devant vous ? » (piège : « Mais bien sûr, recopiez donc ! » → le Barde repart avec une copie de SA propre écriture, inutile ; le Sage : « C'est ton écriture à toi, ça ! ») / « Je vous offre un bouquet pour votre fête, en échange ? » (« Me soudoyer ? Avec des fleurs ? Allons donc. »).
  - Un mauvais choix (sauf « Fausse ?! », qui vexe) : le maire le congédie poliment jusqu'au moment suivant. Chances : sans indice ≈ 1/48 ; avec Gaspard et Margot ≈ 1/3 ; avec les trois ≈ presque sûr si l'enfant fait le lien. Le maire ne ment jamais (si on lui demande d'où vient la lettre : « Je l'ai trouvée sous ma porte ce matin. »).
- **Dialogues de l'énigme de la lettre, VERSION 2 (remplace la précédente ; Romain, 18 h 23 : « c'est trop évident, même sans aller parler aux autres »)** — tous les choix sont polis et plausibles ; seul l'indice permet de trouver le bon. Mauvais choix : « Bien, bien… J'ai beaucoup à faire. Revenez plus tard. » (fermé jusqu'au moment suivant, même réplique partout pour ne rien trahir).
  - Indices : Gaspard « Le maire ? Il est très fier de ses fêtes. C'est ce qui lui fait le plus plaisir au monde. » ; Margot « Ce qu'il déteste par-dessus tout, c'est qu'on raconte qu'il cache des choses. » ; Victor « Il compte tous ses papiers chaque soir, avant d'aller dormir. » ; leurre (Fortuné, qui MENT, avec son signe) « Le maire ? Il adore qu'on lui parle de son chapeau neuf ! » (vérité, si démasqué : « Bon… c'est surtout moi qui voudrais lui vendre un chapeau. »).
  - Étape 1 (4 compliments) : ✅ « Quelle belle fête vous préparez pour Odette ! » / « Quel beau discours vous avez fait ce matin ! » / « Votre mairie est vraiment très bien rangée ! » / « Votre chapeau neuf vous va très bien ! ». Bonne réponse : « Ah, n'est-ce pas ? Les lampions, le gâteau, les fleurs… Que puis-je pour vous ? »
  - Étape 2 (4 demandes) : « Les enfants du village voudraient voir l'écriture d'Odette, pour être rassurés. » / « Je voudrais recopier ses mots dans mon carnet, pour les chanter à la fête. » / ✅ « Certains disent que vous gardez cette lettre pour vous… Moi, je suis sûr que c'est faux ! » / « Odette est ma grande amie, j'aimerais lire ses mots moi-même. ». Bonne réponse : « Pour moi ?! Mais bien sûr que c'est faux, je n'ai rien à cacher, moi ! »
  - Étape 3 (4 promesses) : ✅ « Je vous la rapporte avant ce soir, promis. » / « Je vous la rapporte demain matin, à la première heure. » / « Le Sage la rangera précieusement dans son Grand Livre. » / piège « Je peux la recopier ici, devant vous ? » (« Mais bien sûr, recopiez donc ! » → copie de la main du Barde, inutile ; le Sage : « C'est ton écriture à toi, ça ! »). Bonne réponse : « Hmm… Bon. Mais avant ce soir, c'est bien compris ? » → il donne la lettre.
  - Chances : sans indice 1/64 ; Gaspard + Margot ≈ 1/4 (reste « ce soir » ou « demain matin ») ; les trois indices : sûr si l'enfant fait le lien ; croire Fortuné fait rater l'étape 1.

### 12.13 Principe pour toute la saison : les énigmes de dialogue du Barde (Romain, 4 novembre, 18 h 27)
- Romain : « C'est exactement ce genre de petit truc que j'aimerais que tu mettes plus souvent. C'est le genre de truc que le Barde adore. » On pourra créer des systèmes à plusieurs choix, plusieurs réponses, plusieurs étapes : des dialogues complexes, il aime beaucoup.
- Règles : tous les choix polis et plausibles ; le bon choix ne se devine qu'avec des indices récoltés ailleurs, dits à mots couverts ; une même réplique neutre pour tous les mauvais choix ; des indices leurres donnés par des menteurs (à démasquer) ; plusieurs étapes à la suite ; parfois un « piège » logique (le maire accepte la copie parce qu'elle ne lui fait rien) ; toujours un autre chemin pour ne jamais bloquer l'équipe (ex. le Pisteur pour la lettre).
- À mettre au moins une fois par enquête à partir de l'enquête 2, plus difficile au fil de la saison.

### 12.14 Codes gelés (4 novembre, 19 h 20)
- Bug signalé par Romain (19 h 14) : à l'enquête 1, le code donné par l'Alchimiste après l'analyse du fil ne marchait pas sur la tablette du Barde. Cause : les codes d'une enquête dépendaient aussi des codes de passage des enquêtes voisines ; la réécriture de l'enquête 2 a changé le code du fil (« cloche-lune-flamme » → « cloche-étoile-chat ») ; deux tablettes de versions différentes ne se comprenaient plus.
- Correction : src/codes-fixes.js gèle tous les codes des enquêtes 1 et 2 (identiques à la version de 18 h 13) ; une enquête non gelée évite les codes de l'enquête gelée d'avant ; la version du jeu est affichée en bas des Réglages et dans le message « Ce code ne marche pas ». **Quand une enquête est terminée (l'enquête 3 réécrite, etc.), ajouter ses codes au gel.**

### 12.15 Tout simplifier (Romain, 4 novembre, 20 h 41 → 20 h 49) — fait
- **Le village entre deux enquêtes** : le héros en grand (nom, rôle, niveau, pièces d'or) ; sous son image, deux boutons dorés qui clignotent, 🛒 Boutique et ⭐ Talent (quand un talent est à choisir) ; le bouton de l'enquête suivante pour tout le monde ; le menu ☰ tout en haut. Plus de « Nouveau talent à choisir », plus de Mon héros / Calepin / Comment jouer / Réglages / Changer de joueur / Menu en bas (tout est dans le menu ☰). **Plus de code pour entrer dans l'enquête suivante** : chacun touche le bouton sur sa tablette (à la fin de l'histoire aussi).
- **Le menu ☰** : Mon héros et Calepin ajoutés en haut ; en bas, « 🏠 Revenir aux projets de Romain » (https://esperidad-tech.github.io/).
- **La lettre du début, pour toutes les enquêtes** : seulement la lettre du maire, l'affiche s'il y en a une, et « Commencer l'enquête ». Plus de mission, de règles ni de code (la mission est en haut du Carnet).
- **À faire plus tard (Romain, 20 h 43)** : à chaque fin d'enquête, pendant la lecture du texte, sous chaque diapositive, une illustration faite avec le moteur du jeu (une petite animation, ou juste une image) qui montre ce qui se passe (par exemple Tim qui raconte, à la fin de l'enquête 1). Un peu à chaque enquête.

### 12.16 Règle pour tout le jeu : les boutons pour aller quelque part (Romain, 4 novembre, 21 h 22)
- **Dès qu'il y a un bouton pour aller quelque part ou lancer quelque chose (Préparer, ouvrir le grimoire, C'est parti, Commencer, Enquête N…), c'est un bouton JAUNE avec le texte en NOIR**, partout : atelier, mini-jeux, Grand Livre, village. Les boutons secondaires (Retour, Fermer, Plus tard) restent sombres.

### 12.17 Tutoriel de l'enquête 1 : l'encre révélatrice et le chaudron (Romain, 21 h 22) — À FAIRE
- Grimoire de l'Alchimiste : la recette secrète (« demande au Sage de te la lire ») garde son principe : les « ? » ouvrent un petit menu avec tous les ingrédients ; le Sage dit la recette à voix haute ; l'Alchimiste choisit les ingrédients dans l'ordre. Dans le tutoriel : à l'ouverture du grimoire, la potion utile (l'encre révélatrice) est tout en haut (pas besoin de faire défiler), et des ronds lumineux obligent à toucher les « ? » pour remplir la recette.
- Ensuite, on quitte le grimoire, on va au chaudron ; le bouton « Préparer » est jaune, texte noir.
- Dans le mini-jeu, au tutoriel, le bouton « C'est parti » clignote.
- **Niveau 1 seulement (enquête 1)** : dans la frise, les ingrédients arrivent gris avec un « ? » ; dès qu'ils entrent dans la zone jaune, tout s'éclaire, le carré prend sa couleur ET l'icône de l'ingrédient apparaît (la goutte d'eau…). À la fin, quand il faut viser la zone de température (rouge), la frise se vide et une grosse flèche rouge montre la zone à atteindre sur la jauge. Dès l'enquête 2, toutes ces aides disparaissent (carrés gris → couleur seule, sans icône ni flèche).
- Inchangé : « Remets le chaudron dans le vert » (c'est bien comme ça).
- **Construit (4 novembre au soir)** : boutons « aller / lancer » jaunes texte noir par une règle commune (`.b-aller` dans base.css, même doré que `.b-dore` ; le `.btn` de base a maintenant le texte noir ; dans l'atelier : Préparer, Analyser, Donner). Grimoire : chaque « ? » d'une recette secrète ouvre le menu des 12 ingrédients, juste en dessous ; le bon remplit la case (icône, nom, quantité), un autre fait trembler le bouton (« demande au Sage », rien de perdu) ; toutes remplies, la recette est connue au chaudron (`etat.dictees`). Au tutoriel : l'encre en haut, le rond lumineux sur le prochain « ? » ; le guidage « grimoire » de l'atelier n'est fait qu'une fois la recette complète ; puis ✕, le chaudron, le rond sur « Préparer ». « C'est parti » clignote au tutoriel (enquête 1). Chaudron niveau 1 : « ? » sur les carrés gris, l'icône dans la zone, et à la fin la frise vide et la grosse flèche rouge vers la zone de la jauge.

### 12.18 Enquête 2, retours de la partie test (Romain, 4 novembre, 22 h 25 → 22 h 41) — en cours
- Les arguments à choix ne doivent jamais dévoiler un fait que le joueur ne connaît pas encore.
- Interface du Barde (tous les interrogatoires) : en haut, seulement le grand visage animé (plus de bouton « Il ment ! » ni de bulle) ; chaque question est une boîte repliable (▸ fermée au début, ▾ ouverte) qui montre la réponse avec « Répète » et « Mensonge ? » ; plus de bloc « Les 7 signes du menteur » ; les réponses déjà dites prennent peu de place.
- Le Barde apprend des signes de menteurs dès le matin (au moins trois) ; celui de Bastien reste dans la liste de Margot l'après-midi.
- Gaspard parle d'Odette dès le matin (« d'habitude, c'est ma toute première cliente… quelqu'un devrait aller voir chez elle ; Mélusine va s'inquiéter, c'est elle qui lui a offert sa canne aux sept chats »).
- Potion de vérité : bouton jaune ; donnée avant les questions ; le villageois accepte toujours (« Oh, c'est pour moi ? C'est très gentil ! ») ; ensuite il dit toujours la vérité : s'il devait mentir, il dit le mensonge puis « Non, attends… je me suis trompé ! » et la vérité, marquée « Mensonge (potion de vérité) » ; **une seule potion de vérité par enquête** (un seul personnage).
- **Le rassemblement passe au Sage**, seulement la nuit, et seulement s'il a reçu les codes des étapes importantes (canne, Tim, rochers, maison d'Odette) ; sinon pas de rassemblement, l'enquête reste gagnable.
- En discussion (Romain) : enlever le talent « Potionniste » (deux doses) ; « l'Alchimiste ne fera qu'une seule potion par enquête ». Claude propose : remplacer Potionniste par « Nez fin » (sentir les odeurs sur les objets analysés, lien avec la lavande) ; une seule potion PUISSANTE par enquête (vérité, Cœur vaillant…), les potions simples sans limite.
- Enquête 2 : sur la carte, l'eau du lavoir est rose et luit doucement, comme la rivière rouge (Romain, 22 h 49 ; carte.js dessinLavoir, option lavoir:'rose' passée par carte-jeu.js quand E.riviereRouge ou E.lavoirRose).
- **Romain (23 h 20)** : « c'est très bien » ; talents (Potionniste / Nez fin) et objets de la boutique : **on verra plus tard**. Filets de sécurité « vexé la nuit » ajoutés : Margot raconte aussi la pièce d'or de Bastien la nuit ; Tim vexé la nuit lâche quand même sa pierre. « Deux questions sur trois » : à refaire dans une passe à part (revoir d'abord les questions de chaque villageois). Pisteur (23 h 11-23 h 14) : une explication et un bouton jaune avant chaque mini-jeu (toutes les enquêtes) ; textes de résultat clairs et dans l'histoire ; passer Silas en force = Se cacher au niveau 10 (vêtement rare si réussi) ; le pot noir du chêne donne un échantillon à analyser pour l'Alchimiste (poudre noire + colorant rouge : une fumée rouge).
- **Le moulin la nuit (Romain, 23 h 31 → 23 h 36)** : les points se dévoilent à la suite (pas la pièce cachée ni « sous l'alambic » d'emblée). **La silhouette qui sort du moulin, c'est Bastien** (seau qui sent le colorant, porte laissée entrouverte). Le Pisteur choisit : A) entrer par la porte → la pièce cachée, puis sous l'alambic la pièce d'or (« Qui, au village, en a eu une récemment ? ») ; B) suivre Bastien → près du vieux pont, une silhouette à capuchon lui donne une bourse (« Voilà le reste. Et pas un mot à personne ! ») → code « paiement » (Barde : ouvre le dernier tour de Bastien ; Sage : preuve du POURQUOI). Le choix compte sans bloquer (avec le plan du Sage, on peut encore entrer après B). La silhouette à capuchon (le vrai payeur, futur Léo) n'est jamais reconnaissable.
- **Correction (Romain, 23 h 39), remplace la ligne précédente** : la silhouette est un homme dont on ne voit pas le visage (c'est Bastien, mais on ne le sait pas). Choix : entrer (pièce cachée + pièce d'or) ou le suivre (réussi : il entre chez Bastien → code pour le Barde et le Sage, qui ouvre aussi le dernier tour de Bastien ; raté : on perd sa trace). La porte reste entrouverte jusqu'au matin : après l'avoir suivi, on peut encore entrer. Plus de scène de bourse au pont.
- **Version FINALE du moulin la nuit (Romain, 23 h 58)** : l'homme qui sort est l'homme en cape noire (le payeur, futur Léo), jamais reconnaissable. Points : Te cacher et guetter → la pièce cachée (ou directement avec le plan du Sage) → sous l'alambic (la pièce d'or). Après avoir guetté : « Suivre l'homme en cape » = Suivre la piste au niveau 10 ; réussi → il entre dans la crypte du clocher et referme la grille à clé (la piste s'arrête) + farine sur le bord de sa cape (indice discret vers l'apprenti meunier) + vêtement rare ; c'est l'avant-goût de l'enquête 3 (la crypte du clocher comme entrée des souterrains).
- (Romain, 00 h 00) Indice de la farine sur la cape : retiré (dans l'enquête 2, il désignerait à tort Farinel, suspect du QUI).

### 12.19 Décisions de minuit (5 novembre)
- **Enquête 3** : titre **« La lettre d'Odette »**. La crypte connue dès l'enquête 2, ce n'est pas grave. L'enquête 3 chargée, ce n'est pas grave. Léo très exposé : voulu.
- **Enquête 2, pistage raté de l'homme en cape** : on donne quand même une direction : « Tu as perdu sa trace… mais il partait vers le sud-ouest, du côté du clocher. » (on peut supposer l'église sans en être sûr).
- **Carte (gros chantier, Romain, 00 h 14)** : à partir de l'enquête 2, plus de ronds jaunes d'aide sur la carte, seulement la position des personnages (une petite icône là où chacun se trouve). Dès l'enquête 1, un petit rond avec le visage de l'habitant sur chaque maison (à qui elle appartient) : on supprime le mécanisme où l'on apprend les adresses par le Sage. Quand un habitant est chez lui : son visage sur la maison ET la petite icône de présence. Les deux plaques « Rue des Lanternes » tournées à 90° et posées le long de la rue, alignées comme « Ruelle des Brumes » et « Rue du Four ». Le Sage garde le registre des habitants, avec une description bien faite de chacun (métier, adresse, taille des chaussures).
- **Enquête 2, le moulin la nuit (Romain, 00 h 27)** : sans le code du Sage (le plan du moulin réparé, `info:passage`), le Pisteur n'a ni « La pièce cachée » ni « Sous l'alambic ». Avec le code, seulement « La pièce cachée » ; une fois entré, « Sous l'alambic » apparaît. « Te cacher et guetter » donne seulement le choix de suivre l'homme en cape (piste de niveau 10, très difficile) : on ne peut plus entrer par la porte qu'il a laissée ouverte.
- **Construit (5 novembre, nuit)** : carte-jeu.js fait une image ronde du visage de chaque villageois (Persos.pnj recadré) ; carte.js la pose sur le toit de sa maison (E.registre[id].maison), pour tous les rôles dès l'enquête 1. Toucher une maison : le Barde frappe tout de suite (personne : « Odette n'est pas chez elle en ce moment. », sans rien dépenser) ; les autres voient qui habite là. Plus de « Qui habite ici ? » ni de notes sur la carte ; au tutoriel, le rond du Barde se pose tout de suite sur le visage d'Odette, sur sa maison. Dès l'enquête 2 (`aides:false`) : plus d'anneau jaune ni d'étiquette dorée, plus de marqueurs ✨ des missions bonus ni des habitants du Barde ; tous les lieux se touchent (rien : « Rien de spécial ici pour l'instant. ») ; la présence de chaque villageois (petit visage cerclé de bleu, posé à côté de l'étiquette du lieu ; chez lui, une pastille sur son rond). Restent : les cadenas, les entrées des souterrains (seulement pour le rôle qui y va), les ingrédients notés par l'Alchimiste. Plaques de la rue des Lanternes : verticales, sur la chaussée (un peu plus petites : 19,5 au lieu de 23, il n'y a pas plus de place entre les étiquettes), l'étiquette « Carrefour » remontée de 10. Registre de l'enquête 2 : une adresse pour Margot (la taverne) et Farinel (le moulin), des phrases plus parlantes. Moulin la nuit : comme ci-dessus ; le plan du moulin raté deux fois donne quand même le code (indice partiel), sinon l'enquête n'était plus soluble. Le pistage raté : « Tu as perdu sa trace… mais il partait vers le sud-ouest, du côté du clocher. »
- **Construit (Romain, 01 h 20)** : un personnage qu'on ne connaît pas = qui n'est pas dans le registre de l'enquête. Sa maison (donnees.js, `D.PNJ[id].domicile` : où chacun habite d'une enquête à l'autre) montre un rond « ? » ; une maison sans habitant, rien ; dès l'enquête 2, sa présence est un « ? » aussi (sans nom). Le maire est ajouté au registre de l'enquête 2 (il signe chaque lettre : on le connaît). Le code du registre (`info:registre`) est supprimé partout (il reste gelé dans codes-fixes.js, inutilisé : tapé sur une vieille tablette, « Ce code ne marche pas ») ; le Sage lit toujours « Les habitants » à voix haute, avec les phrases qui servent d'indices (Tim : « il ne confie ses secrets qu'à ceux qui promettent de ne rien répéter »). Au tutoriel, la première étape du Barde devient une astuce (les numéros des étapes suivantes ne bougent pas).
- **Carte, ajouts (Romain, 01 h 20)** : un personnage inconnu (pas dans le registre de l'enquête) a un petit « ? » à la place de son visage, sur sa maison comme sur l'icône de présence. Le code du registre des habitants (`info:registre`) est supprimé partout (Grand Livre, étapes, tutoriel) : il ne sert plus à rien avec les visages sur les maisons. Le Sage garde le registre à lire (métier, adresse, pointure, une ligne sur chacun). Le code reste dans la table gelée, inutilisé.
- **En attente (Romain, 01 h 15)** : rendre le Sage et l'Alchimiste plus utiles dans l'enquête 2. Proposé : Alchimiste 1 le papier blanc du moulin (encre révélatrice → « 10 pièces d'or, comme promis », une cloche dessinée), Alchimiste 2 des potions pour le Pisteur (rapidité : piste de l'homme en cape niveau 10 → 7 ; invisibilité : Silas plus facile), Alchimiste 3 remonter la rivière ; Sage 1 la fumée rouge = une diversion (page « Les feux et les fumées »), Sage 2 les roues du village (deux possibilités : Bastien ou Farinel). Pas encore choisi. « Deux questions sur trois » pour le Barde : pas lancé non plus.
- **Romain (01 h 26)** : il n'aime pas les propositions ci-dessus pour le Sage et l'Alchimiste (papier blanc, potions pour le Pisteur, rivière, fumée-diversion, roues) : **abandonnées**. La question « rendre le Sage et l'Alchimiste plus utiles dans l'enquête 2 » reste ouverte.
- **Retours de test (Romain, 01 h 30), prochain chantier après la carte** :
  - **Le tableau des chemins secrets du Pisteur** : le « tableau des sous-sols » du chevalet de la cabane devient « Les chemins secrets ». Le Pisteur doit avoir plein de chemins secrets, en surface et dans les sous-sols ; chaque enquête en ajoute. Le chemin des bûcherons (`info:detour`) est **pour le Pisteur seulement** (plus « pour toute l'équipe »). Quand le Pisteur tape le code : on l'envoie directement sur son tableau, le chemin apparaît d'un coup (animé), avec un petit rond jaune qu'il doit toucher pour y aller (c'est la première fois qu'il utilise ce tableau : un vrai guidage).
  - **L'accusation** : Romain, à la nuit, ne savait pas comment accuser (« Pas encore ! Toute l'équipe n'a pas fini d'enquêter »). Le message doit dire quoi faire : s'il manque le petit matin, le dire avec le bouton « 🌅 Le petit matin » (jaune) ; s'il manque une preuve, un message court qui dit qu'il manque une preuve sur la tablette du Sage. Le code de la canne d'Odette va **au Sage** (aujourd'hui « au Sage ou au Barde » : donné au Barde, il bloque l'accusation et le rassemblement du Sage, car les codes sont par tablette).
  - **Le rassemblement du village** (page du Sage) : Romain n'a pas compris comment ça marche. À rendre clair (l'étape du Sage doit dire quelles preuves rassembler).
  - **Le maire ne ment jamais** : « Un éboulement » (sa réponse, et l'affiche) est un mensonge. Proposé : le maire « C'est très dangereux là-bas, mon petit. Je ne peux pas t'en dire plus. » ; l'affiche « Le chemin du Vieux Chêne est fermé : danger ! » ; Silas garde « éboulement » (il le croit).
  - En attente de Romain : la question de Fortuné sur Victor (« il adore les contes ») ne sert à rien dans l'enquête 2 : ajouter une question à 3 choix pour Victor, ou l'enlever ? Seulement deux questions à 3 choix dans l'enquête 2 (Tim, Iris) alors qu'il en voulait plus souvent.
- **Décisions de Romain (01 h 36)** :
  - **Plus de verrou sur l'accusation, plus de « petit matin »** : le Sage accuse quand il veut, même s'il manque des choses (« on oublie toutes les requêtes »). On supprime `verrouAccusation`, le bouton « 🌅 Le petit matin » et les textes « on accuse au petit matin ».
  - **Le grand rassemblement a lieu quoi qu'il arrive, chaque nuit de l'enquête 2** : quand le Sage passe à la nuit, le jeu l'emmène directement sur la page « Rassembler le village », avec un bouton jaune obligatoire. Plus besoin de preuves. Ensuite, la scène animée et le code du récit pour les autres.
  - **Le maire ne ment plus** : « C'est très dangereux là-bas, mon petit. Je ne peux pas t'en dire plus. » ; l'affiche « Le chemin du Vieux Chêne est fermé : danger ! » ; Silas garde « éboulement ».
  - **Victor** : on laisse tomber (rien à changer).
- **Mis en ligne le 5 novembre, 01 h 41 (commit 8fbcd34)** : le chantier carte (§12.19, ajouts de 01 h 20) et le moulin la nuit. Filet ajouté : Farinel vexé la nuit donne quand même les plans du moulin si le Barde a les traces (`vexeDonne` avec `info`, barde.js et verif.js).
- **Construit (décisions de 01 h 30 → 01 h 36)** :
  - **Les chemins secrets** : le tableau du chevalet de la cabane s'appelle « 🗺️ Les chemins secrets » (titre, bulle, aide de la cabane, message « C'est sur ton tableau des chemins secrets, dans ta cabane »). Il montre les passages des sous-sols (souterrains.js, inchangés) ET les chemins secrets en surface, déclarés par chaque enquête : `E.chemins = [{id, nom, ic, code, vers, pts, etiquette}]` (e2.js : le chemin des bûcherons, `info:detour` ; il quitte le carrefour par le chemin libre de la clairière (572 × 232), fait le tour de la forêt par le nord et arrive au Vieux Chêne par derrière, loin de Silas). Un chemin découvert est gardé toute la saison (`M.S.sousSols.chemins`, `pris`). Son code est pour le Pisteur SEUL (moteur-base.js l'ôte des codes de lieu de toute l'équipe ; un autre rôle reçoit « Ce code est pour le Pisteur ») ; tapé par le Pisteur (carte-jeu.js, `M.codeChemin`), il l'emmène tout droit à son tableau (cabane.js, `UI.cbVersCarte`) : le chemin se trace (1,4 s), le tableau zoome dessus, un rond jaune palpite à son départ avec « 👆 Touche ici ! » et, la première fois, une bulle (🔊, jamais lue toute seule ; cachée dans un cadre très bas). Le toucher : sa tête marche le long du chemin, puis le Vieux Chêne s'ouvre (le verrou de Silas accepte le code). Ensuite le chemin reste ; le retoucher y ramène. verif.js vérifie les chemins (code pour le Pisteur seul, jamais « pour toute l'équipe », lieu d'arrivée, tracé).
  - **L'accusation libre** : plus de `verrouAccusation`, de « 🌅 Le petit matin » ni de « Pas encore ! » (regles.js, livre.js) ; le Sage accuse quand il veut, une erreur garde ses conséquences. Les fins « Au petit matin, vous racontez tout au maire » restent.
  - **Le rassemblement, chaque nuit, sans preuves** : la page n'a plus de besoin ; `obligatoire:true` (livre.js) : quand le Sage passe à la nuit, son Grand Livre s'ouvre sur « 📣 Rassembler le village » (gros bouton jaune qui palpite), et il y revient chaque fois qu'il rouvre son livre tant que ce n'est pas fait (jamais pendant qu'il le lit : pas de piège). Nouveau texte d'avant : « La nuit tombe sur Brumeval. Tout le village se demande ce qui se passe au Vieux Chêne, que le maire a fermé… ».
  - **Le maire ne ment plus** : sa réponse « C'est très dangereux là-bas, mon petit. Je ne peux pas t'en dire plus. Que personne n'y aille ! » ; l'affiche (lettre et panneau de la place) « Le chemin du Vieux Chêne est fermé : danger ! » ; Silas garde « éboulement ». À décider : dans la scène du rassemblement, le maire crie « Ce sont des vapeurs toxiques ! » alors que l'Alchimiste prouve que c'est un fumigène (un mensonge, ou une erreur de sa part ?). → Réglé au § 12.20.

### 12.20 Décisions du matin (Romain, 5 novembre, 8 h 59 → 9 h 23) — construit
- **Le rassemblement (enquête 2) : le maire ne ment toujours pas.** Le maire arrive avec Silas, le garde. C'est **Silas** qui crie : « Ce sont des vapeurs toxiques ! Elles montent des sous-sols ! » (il le croit, comme l'« éboulement ») ; le maire dit seulement : « Reculez ! Ne respirez pas ça ! La zone est condamnée. Rentrez chez vous ! ». L'analyse de l'Alchimiste (« ce n'étaient pas des vapeurs toxiques : quelqu'un a voulu vous faire peur ») reste. Le calepin : « Devant la fumée rouge du Vieux Chêne, Silas a crié : « Vapeurs toxiques ! » Le maire a fait condamner la zone. » Les vieilles sauvegardes sont remises à jour au chargement (calepin et note du carnet, `moteur-base.js`, `E2_VIEUX`).
- **L'animation du rassemblement** : plus de petits ronds avec un visage, des **personnages en entier** (jambes, pieds, bras, mains ; le tablier qui descend sur la jupe ou le pantalon ; la chope de Margot dans sa main). Nouveau dans le moteur des personnages : `Persos.pnj(id, {pied:true})`, réutilisable pour toutes les illustrations (fins d'enquête…). Le Sage : son héros en entier sur sa tablette, un Sage ordinaire sur les autres. Silas arrive derrière le maire ; bulles l'une après l'autre (Silas « Vapeurs toxiques ! », puis le maire « Reculez ! »). **La fumée, une fois partie, ne s'arrête plus jamais** (même quand la scène recommence) ; le grand PFFFT revient à chaque tour.
- **Le Barde n'a plus le mini-jeu des ragots** (« ça sert à rien, je le trouve pourri ») : retiré des enquêtes 1, 2 (et de l'ancienne 3), donc du tutoriel ; retiré de la salle de test ; le carnet de ragots n'est plus vendu (gardé pour les sauvegardes qui l'ont déjà). Conséquence : le Barde gagne 15 pièces d'or de moins par enquête (missions bonus) ; à revoir avec la boutique.
- **Règle pour toutes les enquêtes (1 à 10 et au-delà) : la carte montre en permanence où est chacun**, à chaque moment (matin, après-midi, nuit), **pareil pour tous les rôles**. Pour tous les personnages qui comptent dans l'enquête (ceux de `E.pnj` et du registre) :
  - **chez lui** : le rond avec son visage sur sa maison, et au-dessus **un petit triangle jaune qui flotte** (il monte et descend doucement) ; pas de deuxième icône. Sa boutique compte comme sa maison (Gaspard à la boulangerie, Victor à la poste, Iris à l'herboristerie, Mélusine à la couture).
  - **ailleurs** : le rond de sa maison est **grisé**, et son visage, **cerclé de jaune avec le triangle qui flotte au-dessus**, est posé là où il est (à côté de l'étiquette du lieu ; sur le lieu lui-même s'il n'a pas d'étiquette, comme la ruelle, ou s'il n'est pas encore découvert dans le tutoriel).
  - quelqu'un qu'on ne connaît pas (pas dans le registre) : un « ? » à la place du visage (inchangé). Le maire est toujours connu (il signe chaque lettre).
  - on ne sait pas où il est : seulement le rond grisé (Odette, enfermée, à l'enquête 2).
  - **Exceptions** (Romain les donne) : **Tim à l'enquête 1** n'est montré nulle part, et sa maison reste normale (ni grise, ni triangle) : sinon ce serait la solution (`E.carteSecret`, e1.js). **Tim le matin de l'enquête 2** (il se cache au Vieux Chêne, le Pisteur l'y surprend) : pas montré, pour garder la surprise ; sa maison est grisée (il est sorti, sans dire où). Jamais de fausse position sur la carte : si quelqu'un doit rester secret, on ne le montre pas.
  - Eau : bleue partout, sauf à l'enquête 2 (rivière rouge, lavoir rose).
  - **Où il est, quand on ne peut pas lui parler** : `E.pnj[id].carte[moment]` (le lieu) et `E.pnj[id].occupe[moment]` (ce que voit le Barde en arrivant, sans rien dépenser). Le rythme de l'enquête ne change pas : on le voit, on ne peut pas l'interroger. Enquête 2 : Bastien part livrer (lisière, matin), Victor fait sa tournée (ruelle, matin), la taverne est fermée (Margot, matin), le colporteur arrive par le pont (matin) et dort dans sa carriole (lisière, nuit), Mélusine et Iris dorment (nuit), la mairie est fermée (nuit). **Chaque nouvelle enquête doit donner une place à chacun à chaque moment.**
  - Le tutoriel de l'enquête 1 : le visage du villageois à qui parler remplace l'ancien marqueur avec son nom ; un visage ne se touche que si son lieu est ouvert à cette étape.
- Tim, le matin de l'enquête 2 : caché (Romain, 9 h 30 : « il faut pas que ça gâche la surprise »), voir les exceptions ci-dessus.

### 12.21 Les petites animations sous les textes de fin (Romain, 5 novembre, 9 h 37) — construit pour l'enquête 1
- Sous chaque texte de fin qu'on fait défiler, une petite scène animée, dans le style de la scène du rassemblement : un décor dessiné, des personnages en entier, des boucles de quelques secondes, aucun son ni lecture automatique. Le héros de la tablette est le vrai héros du joueur ; les autres rôles sont des héros ordinaires.
- Technique : `E.fin.illus` = une scène par texte, dans l'ordre de `E.fin.slides` ; les scènes sont dans `illus-fin.js` et `illus-fin.css` (préfixe `.sf-`), réutilisables pour les autres enquêtes (décors : le Vieux Chêne, la place des Lanternes, la coupe sous la terre ; la Lanterne d'Or, Pirate). Un appareil qui demande moins de mouvement voit chaque scène figée sur son moment le plus parlant.
- Enquête 1, les 8 scènes : (1) l'équipe court au Vieux Chêne, Gaspard avec une lanterne, la lueur dorée au fond du trou ; (2) Gaspard descend par la corde et remonte Tim avec la Lanterne, Pirate jaillit du buisson et lui saute dans les bras (un cœur) ; (3) Tim pleure de joie, « Pardon ! », Pirate saute autour de lui ; (4) en coupe sous la terre : le trou descend jusqu'à un vieux passage voûté, le courant d'air froid remonte en volutes et fait s'envoler une feuille ; (5) le maire arrive en courant, prend la Lanterne et la serre contre lui ; (6) le soir, les lampions de la place s'allument un à un, « Quelle équipe ! » ; (7) pendant la fête, les villageois se demandent d'où vient le trou (bulles l'une après l'autre) ; (8) la nuit, le maire regarde le trou en silence (« … ») ; le jour se lève, trois grosses planches tombent sur le trou, « C'est bien trop dangereux ! ».
- À faire : la même chose pour l'enquête 2 (et les suivantes), quand Romain le demandera.

### 12.22 Règle pour tout le jeu : la carte répond dans une bulle, pas dans une fenêtre (Romain, 5 novembre, 10 h 07) — construit
- Toucher un lieu, une maison ou un visage sur la carte (l'onglet Carte) ouvre **une bulle posée sur la carte**, juste à côté de ce qu'on a touché, avec une petite pointe : pas de fond noir, la carte reste visible et touchable autour. **Toucher ailleurs sur la carte la remplace aussitôt ; toucher dans le vide la ferme** (✕ aussi). Elle suit la carte quand on la fait glisser ou qu'on zoome ; elle se cache si ce qu'on a touché sort de l'écran.
- **Version validée par Romain (10 h 44, après trois aperçus)** : plus de cadre du tout. Chaque chose est **sa propre petite pastille** posée sur la carte (le bleu du jeu, un contour foncé, toute ronde, une ombre) ; entre les pastilles, on touche la carte. Les boutons sont des pastilles **jaunes, texte noir** ; le ✕ est une petite pastille jaune. Les pastilles **arrivent l'une après l'autre en rebondissant** (seulement quand la bulle s'ouvre).
- Seulement l'essentiel : pas le nom du lieu (il est déjà sur la carte), pas de 🔊, pas de phrase d'aide ni de décor, pas de métier. Barde : une pastille par villageois (visage, nom, « 💬 Parler » ; toute la pastille se touche) ; un villageois occupé : son visage et une phrase courte (« 😴 Elle dort à poings fermés. »). Pisteur : « 🔍 Explorer », puis une pastille par chose à fouiller. Alchimiste : « 📝 Noter », « 🧺 Chercher », « 🧪 Remplir un flacon ». Mission bonus : « ✨ Mission bonus · Tenter » (le nom et l'histoire de la mission sont dans la fenêtre du mini-jeu). Maison : une pastille avec le visage et la phrase (« Odette n'est pas chez elle en ce moment. »). Un lieu vide : « Rien de spécial ici pour l'instant. ». Fouiller, cueillir… reste dans la même bulle.
- Les textes longs des boutons ont une partie `.b-long` cachée dans la bulle (ils restent entiers ailleurs). Les phrases des villageois occupés (`occupe`) doivent rester courtes.
- **Retouches (Romain, 11 h 08 → 11 h 09)** : les pastilles ne sont plus coupées sur les bords quand elles rebondissent (le cadre invisible a une marge de 16 px) ; **un petit « pop » doux par pastille** quand elles arrivent, chacun un peu plus haut (`M.son('pastilles', n)`, moteur-base.js), à la place du bruit de page ; **ouvrir, changer ou fermer une bulle ne redessine plus la page** (seulement la bulle, `rendreLeger`) : la carte garde ses animations, plus de saute d'image. Fouiller, cueillir, parler… (ce qui change le jeu) redessine toujours la page.
- Restent en plein écran : les conversations du Barde, les découvertes, les mini-jeux, les codes, l'accusation (il faut s'y concentrer). La carte murale de la cabane du Pisteur garde ses fenêtres pour l'instant.
- Technique : `UI.modal.bulle` et `UI.modal.ancre` (moteur-actions.js : `bulleDe`, `placerBulle`) ; la bulle reste dans `#voile` (classe `b-voile-bulle`), le tutoriel y retrouve ses boutons.

### 12.23 Règle pour tout le jeu : un mini-jeu se met en pause (Romain, 5 novembre, 11 h 21) — construit
- **Tous les mini-jeux, tous les rôles, tout le temps** : un bouton ⏸️ dans l'en-tête de chaque mini-jeu (à côté de 🔊). Exemple voulu par Romain : un équipier demande de taper un code pendant qu'on joue.
- En pause, **tout est figé** là où on en était (rien n'avance, le temps ne compte pas : on ne peut pas tricher en mettant en pause quand ça va mal) et le mini-jeu disparaît : on retrouve la carte, les onglets, le carnet, les codes.
- **Un rappel reste en bas de l'écran** sur tous les écrans, au-dessus des onglets : l'icône du mini-jeu, « Mini-jeu en pause — Il faut le finir ! » et un bouton jaune « ▶️ Reprendre ». Il pulse doucement.
- Pendant la pause, on peut **regarder et parler** : carte et bulles, carnet, Grand Livre, tableau, taper un code reçu, montrer un code (potion, action du Sage…), les réglages. Tout ce qui **fait avancer l'enquête attend** (explorer, parler, cueillir, analyser, fabriquer, un autre mini-jeu, passer au moment suivant, accuser, finir l'enquête) : une petite fenêtre « Un mini-jeu est en pause — Il faut d'abord finir ton mini-jeu » avec « ▶️ Reprendre le mini-jeu » et « Plus tard ». Un code de moment ou de fin tapé pendant la pause attend aussi (on le retape après).
- « ▶️ Reprendre » ramène à l'écran où l'on jouait, puis **« 3, 2, 1 »** en grand avant que ça reparte (seulement en pleine partie ; sur l'écran d'accueil du mini-jeu ou sur le résultat, ça reprend tout de suite).
- L'Alchimiste : le chaudron de l'atelier se met **tout seul en pause quand on change d'onglet** (avant, il était abandonné). Revenu dans l'atelier, le chaudron est là, assombri, « ⏸️ En pause ».
- Au tutoriel (E1), le bandeau dit « Ton mini-jeu est en pause : touche « ▶️ Reprendre » pour le finir » et le rond jaune montre le bouton.
- Technique : `mj-temps.js` (`window.MJT`) ; `build.py` enveloppe chaque `mj-*.js` pour que ses minuteurs, ses images (`requestAnimationFrame`), `Date.now` et `performance.now` passent par MJT, qu'on fige ; les animations CSS du mini-jeu sont figées aussi (`getAnimations`). `MJ.lancer(…, {surPause})` ajoute ⏸️ et renvoie `{pause, reprendre, enPause}` ; le moteur : `M.mjPause`, `M.reprendreMJ`, `M.rappelPause`, `LIBRE_EN_PAUSE` (moteur-actions.js). Un nouveau fichier de mini-jeu doit s'appeler `mj-….js` pour être figé ; une nouvelle action « qui ne fait que regarder » doit être ajoutée à `LIBRE_EN_PAUSE`, sinon elle attend la fin du mini-jeu.
- (Fermer ou recharger la page pendant un mini-jeu, en pause ou pas : il compte comme raté, voir la retouche ci-dessous.)
- Retouches (Romain, 12 h 31) : quitter l'appli (la fermer, recharger la page) pendant un mini-jeu le fait compter comme **raté** au retour (`P.mjOuvert`, `M.rateQuitte` : l'action qui l'a lancé est rejouée sans rien redépenser, et le mini-jeu rend « raté ») ; l'appli qui passe derrière (une autre appli, l'écran qui s'éteint) **met le mini-jeu en pause**. Le bouton ⏹ des mini-jeux est enlevé (le ⏹ du jeu apparaît pendant la lecture).

### 12.24 Retours de la partie test (Romain, 5 novembre, 12 h 31) — construit
**Général**
- Un robot de la carte (`tools/bot-carte.py`) touche tout ce qui se touche sur la carte, pour les 4 rôles, à chaque moment des enquêtes 1 et 2, puis chaque bouton de chaque bulle, et mesure les bulles (pastille coupée, texte qui sort, bulle qui sort de l'écran ou qui défile, 🔊). Il a trouvé : les lieux fermés (le Vieux Chêne de l'E2, la forêt de l'E1) débordaient de partout, et chaque pastille faisait 44 px de haut (une classe au même nom que les ronds des potions). Corrigé pour toutes les bulles.
- Sur la carte, **les villageois qui jouent un rôle dans l'enquête ont leur visage** (Silas le garde, Fortuné à l'E2), plus seulement ceux du registre ; jamais « le voisin ». Leur maison montre leur visage aussi.
- 🎯 Mes missions, dans le Carnet de tous les rôles : **repliables** (le titre est un bouton ; replié, on voit « 3 / 7 ✅ ») ; une nouvelle mission les rouvre.
**Sage**
- 📣 La page « Rassembler le village » **n'existe pas avant la nuit** (une page à moment, `p.moments`, n'est pas dans le livre avant son moment) ; en passant à la nuit, le Grand Livre s'ouvre dessus.
**Alchimiste**
- La bulle d'un lieu : plus de pastilles d'ingrédients ni de « 📝 Noter » (le rond qui flotte sur la carte suffit). Déjà cherché à ce moment : « ✅ Déjà récolté », et le rond des ingrédients se grise. Rien à cueillir ici à ce moment : « 🍂 Rien à trouver » tout de suite, sans « Chercher » ; il faut du matériel : « 🔒 Il te faut : … ».
- E2 : le champ tout rasé de la clairière se découvre **dès le matin**.
- L'atelier : **un toucher sur la cueillette range tout** (étiquette, puis là où il y en a, puis une case vide) ; ce qui ne trouve pas de place reste devant la porte.
- Le chaudron : un ingrédient oublié ne compte plus comme versé (on pouvait tout laisser passer et réussir la potion vide). Il **revient**, la frise repart de lui (ceux déjà versés restent), un peu plus vite (jusqu'à 1,7 fois) pour que la partie ne dure pas plus longtemps ; chaque oubli coûte un cœur.
- Le chat (atelier.js) : de temps en temps il **passe dans l'autre pièce** par l'arche (« Mimi va faire un tour dans la chambre »), et revient 22 à 48 s plus tard ; jamais pendant le tutoriel, une préparation, un glisser, une fenêtre ouverte (`peutPasser`). Avec un **arbre à chat** dans sa pièce : il **grimpe** plateau par plateau et s'installe en haut, **tape la boule** qui se balance, **griffe** un poteau (marques et copeaux) ; moins de mouvement demandé : une pose seulement. Le toucher montre sa barre de bonheur (❤️, 🎀) : elle a maintenant un **✕** pour la fermer tout de suite. (Fréquences : `PASSAGE` et `chatAgir`.) À confirmer avec Romain : « l'enlever » = fermer la barre (fait), ou ranger le chat ?
**Barde**
- 👂 **Écouter aux portes** (talent « Tendre l'oreille ») : sur la carte, partout où quelqu'un se trouve (bâtiment, maison : « Écouter aux portes » ; dehors : « Écouter en douce »), **tout le temps, gratuit**, plus de limite par enquête, **plus de phrase à trous**. Le texte s'écrit lettre après lettre dans une bulle posée sur la carte (toucher la bulle : tout d'un coup), puis il est **gardé dans le Carnet, sur la page de la personne** (« 👂 Entendu aux portes »). Les bribes de l'enquête (vrais indices, signes de menteurs) passent avant ; sinon, chacun a une petite phrase à chaque moment (`E.portes[pnj][moment]`, e2.js) : ce qu'il pense de l'enquête, en rapport avec son métier, sans rien dévoiler de plus que prévu.
- « Encore toi ? Reviens plus tard » seulement **après au moins une question posée** pendant ce moment ; ouvrir la conversation et repartir sans rien demander laisse la porte ouverte.
- E2 : **la taverne est ouverte dès le matin** (Margot confie les signes des menteurs quand on l'a démasquée).
- Un villageois **fâché** (ou « Encore toi ? ») : son rond et son triangle sont **rouges** sur la carte ; le toucher montre seulement son visage et « Reviens plus tard », cerclés de rouge.
- À décider avec Romain : les scènes « Écouter en cachette » de l'enquête (les ouvriers au lavoir, la nuit) gardent leur phrase à trous.

### 12.25 Retours de 13 h 19 (Romain, 5 novembre) — construit
**Pour tous les mini-jeux : plus jamais de deuxième essai** (sauf l'enquête 1)
- Enquête 1 (le tutoriel) : un mini-jeu raté se retente **autant qu'on veut** (« 🔁 Réessayer »). Dès l'enquête 2 : **un seul essai**, partout : plus de « 🔁 Réessayer (dernière chance) », plus de « ✨ Deuxième chance » dans les mini-jeux, un seul essai pour démasquer chaque menteur. Un indice qui ne doit pas bloquer l'enquête garde `ouvrePartiel` : le raté le donne à moitié (le champ de coquelicots, les vieux chemins, le plan du moulin). (`M.MAX_ESSAIS`, essais.js ; `P.chances` et l'effet `chance` de l'équipement ne servent plus : à revoir avec la boutique.)
**Barde**
- La pastille rouge de la carte porte le nom : « Grosbec : reviens plus tard » (fâché, ou « Encore toi ? »), et maintenant aussi **« Iris : rien de plus à dire »** quand il n'y a plus rien de nouveau à lui demander (toutes ses questions ouvertes posées, pas de mensonge à démasquer, pas d'hydromel à offrir) ; jamais de « Parler » ni de « Continuer » à côté.
- E2, dès le matin : Gaspard « Margot dit toujours la vérité ? », et **Victor** (dans la ruelle, sa tournée) avec son mensonge. Mélusine (« Qui raconte des histoires ? », au lavoir) et Iris (« Vous connaissez bien Mélusine ? ») l'étaient déjà.
- Le bac du tableau de liège est rangé en **dossiers qu'on déroule** : 🤥 Mensonges, 👥 Habitants, 📍 Lieux, 🎒 Objets ; un seul ouvert à la fois ; une étiquette de signe toute neuve ouvre les Mensonges.
**Pisteur**
- Plus de « 🌿 Ce qui pousse ici » : il ne renseigne plus l'Alchimiste.
- E2 : le lavoir et la rivière finissent par « Dis à l'Alchimiste de venir voir ! » ; la maison d'Odette (pour tous sauf le Barde) : « Odette n'est pas chez elle… C'est bizarre ! Dis au Barde de venir voir. » (`E.absentTexte`).
- Le Carnet : « 📜 Mon fil d'aventure » **repliable, fermé au départ**.
- La nuit au moulin sans le plan du Sage : seulement « Te cacher et guetter », et le texte ne parle pas du plan (déjà le cas : vérifié). Suivre l'homme en cape et trouver la pièce d'or sous l'alambic ne donnent **plus de code** (il le raconte à l'oral). La question du Barde à Bastien devient « On t'a vu payer avec une pièce d'or toute neuve ! » et demande seulement le ragot de Gaspard (ou celui du fournil, ou de Margot la nuit) (Romain, 13 h 47).
- Le tableau des chemins secrets note **les choses bizarres** qu'il a vues (souterrains.js, des « mystères ») : 🪨 le trou bouché du Vieux Chêne, 🚪 la porte cachée du moulin, 🗝️ la crypte du clocher ; avec le chemin des bûcherons (quand il a son code) et, gardés de l'enquête 1, le dessous du Vieux Chêne et le fond du puits.
- (13 h 56) Le Vieux Chêne fermé, à l'E2 : pour tout le monde, seulement « Silas, le garde, ne laisse passer personne vers le Vieux Chêne. » ; le conseil (le Grand Livre, passer derrière son dos) et « ce qui marcherait » restent pour le Pisteur seul (`verrou.tPour`, `verrou.besoinPour`).
- (14 h 12) Les dossiers du bac du liège sont sur **une seule ligne**, qu'on fait défiler de droite à gauche.

### 12.26 Le Carnet allégé (Romain, 5 novembre, 14 h 15) — construit
- **Les archives sont au Sage** : la lettre du maire, les onglets « 📖 Enquête 1 / 🔍 Enquête 2 » (les enquêtes passées) et le calepin des enquêtes passées ne sont plus que dans le Carnet du Sage (et le « 📔 Calepin » du menu ☰, au Sage seulement).
- **Le Carnet du Barde** : seulement 🎯 Mes missions et 👥 Les habitants. Les habitants se replient comme les missions (même cadre), **fermés au départ**, avec leur nombre à droite. Plus de « 🎻 Mes talents », de « 👂 Ce que j'ai entendu », de « 📝 Mes indices » ni de « Ce que l'équipe m'a donné ». (Seule exception : la chanson d'une mission bonus en cours, la phrase à trous de la fête de l'enquête 1, reste au-dessus des habitants, sinon elle ne se jouerait nulle part.)
- Du coup, la scène « Écouter en cachette » des ouvriers au lavoir (E2, la nuit) n'est plus une phrase à trous : leurs mots sont dits tout de suite, et notés.
- À prévoir : les talents du Barde des niveaux suivants (intuition, recoupement, plaidoirie, la recette de l'hydromel) avaient leurs boutons dans « Mes talents » : il leur faudra une autre place quand on y arrivera.

### 12.27 Le liège du Barde : la fiche « ? » et le dossier « Autre » (Romain, 5 novembre, 14 h 18) — construit
- **👥 Habitants** : une fiche **« ? » (Quelqu'un)** en plus, pour quelqu'un dont on ne connaît pas encore le nom (l'homme en cape…). Elle se pose, se colore (innocent / à surveiller / suspect) et se relie comme les autres.
- **🏷️ Autre**, 5ᵉ dossier : des **mots-clés** de l'enquête (petit logo + mot, papier de fiche), tirés des dialogues, pour que le Barde s'amuse à faire des liens. Chacun n'arrive dans le bac **que quand le Barde l'a appris** (`E.liege.mots[].si`, les mêmes conditions que les questions) : rien n'est dévoilé.
- Enquête 2 (21 mots) : rivière rouge, chemin interdit, Odette disparue (dès le début) ; ordre du maire, éboulement, canne aux sept chats, avant l'aube, lavoir rose, champ rasé, rouge de coquelicot, charrette, pièce d'or neuve, cape noire, poudre noire, tissus qui déteignent, tonneau de vin, vieilles légendes, porte aux runes, gros rochers, vieux plans du moulin, sieste de Farinel. **Pas de Léo** (il servira à l'enquête 3) ni de crypte (dite à l'oral).
- Enquête 1 (13 mots) : Lanterne d'Or (dès le début), fenêtre de la mairie, six heures du soir, minuit, silhouette sur les toits, lumière dorée, lumière du fournil, écharpes rouges, Pirate le chien, gants gris, grosses bottes, grands pieds, canne d'Odette.

### 12.28 Le Carnet de tous, la lettre et les archives dans le Grand Livre (Romain, 5 novembre, 14 h 26) — construit
- **Le Carnet, pour tout le monde** : 🎯 **Mes missions** (repliées au départ, elles ne se déplient plus toutes seules) puis 🔢 **Les codes donnés** (même cadre, repliés, avec leur nombre). Le **Barde** a en plus 👥 **Les habitants**. Plus rien d'autre : plus d'indices, plus de fil d'aventure (Pisteur), plus de « ce que l'équipe m'a donné », plus d'onglets des enquêtes passées, de lettre ni de calepin. Seule exception : la chanson d'une mission bonus du Barde en cours (enquête 1), sinon elle ne se jouerait nulle part.
- **Les codes donnés** : chaque code que la tablette a eu à dire (objets et renseignements trouvés, potions données ; pour le Sage, les codes des moments et de la fin), avec « Pour le Barde 🎻 »… Un rappel si un équipier a oublié de taper un code.
- **Le Grand Livre du Sage** : deux pages en plus. **✉️ La lettre du maire** (juste après le tableau d'enquête, avec l'affiche de l'enquête 2) et **🗄️ Les archives** (après les objets magiques), à partir de l'enquête 2.
- **Les archives** : un dossier par enquête passée (le dernier déplié), et dedans des parties qui se déplient (cadres des missions) : 📜 Ce qui s'est passé, ⭐ Les grands moments, 🔑 À retenir pour la suite, 👥 Ce qu'on sait des habitants. Tout est **général** (les quatre héros confondus), écrit dans `E.archive` (e1.js). **Règle** : quand l'histoire ajoute quelque chose qui servira plus tard, l'écrire dans l'`archive` de son enquête ; l'archive de l'enquête 2 sera écrite pour l'enquête 3.

### 12.29 Vérification du tutoriel (enquête 1) après les changements du 5 novembre (Romain, 14 h 59 → 15 h 10) — construit
- **Les ronds jaunes** : le robot du tutoriel (`tools/tuto.py`, 4 tablettes) a été instrumenté : à chaque toucher, le rond, ce qu'il y a dessous et la phrase du bandeau. Sur ~200 touchers, le rond tombe toujours sur la bonne chose (les ronds des onglets du bas et des coins du livre dépassent un peu de l'écran : normal). Les quatre tablettes vont au bout, Tim au Vieux Chêne du premier coup.
- **Corrigé** : à la fin d'une conversation du Barde, le rond allait sur « 📌 Mon tableau » (il l'emmenait au liège sans rien dire, et le bouton était à moitié sous le bord de l'écran) : maintenant « Tu as posé toutes tes questions : touche ✕ pour fermer. »
- **Corrigé** : la mission du Pisteur parlait encore de son « fil d'aventure, dans le Carnet » ; les découvertes disaient « 📒 Noté dans ton carnet » à tout le monde (seul le Barde a encore ses notes, sur les visages) ; le bandeau de la cueillette disait de ranger soi-même (les ingrédients se rangent tout seuls).
- **Le Grand Livre du Sage, les deux façons de changer de page (15 h)** : une page proche, le rond va sur le **coin corné** (« Touche le coin corné qui brille, en bas : il tourne la page ») ; une page loin (3 pages ou plus), sur le **numéro en bas** (« il montre toutes les pages du livre d'un coup ! »), puis sur la page dans la liste. Dans l'enquête 1 : les coins pour la lettre, les habitants et les recettes ; la liste pour les codes des moments, la page blanche, le tableau et l'accusation.

### 12.30 La bibliothèque des plans (Romain, 5 novembre, 15 h 05) — construit
- Le dessin du haut : de **vieux livres sur une étagère** (reliures, bandes dorées, une pile couchée et un plan roulé), plus des bâtons de couleur. Le logo de la page : 📚 (plus l'équerre).
- **Les vieux chemins** ne sont plus une page à part : ils sont **dans la bibliothèque des plans**, dès le début ; le plan du moulin y arrive avec le code de Farinel.
- Chaque plan est un **menu qui se déplie** (cadres des missions, fermé au départ, ✅ quand il est fait). Dès qu'il y a un plan, plus le texte « Ici sont rangés tous les vieux plans… » (il reste seulement quand la bibliothèque est vide, à l'enquête 1).

### 12.31 Les cartons de l'Alchimiste se vident dans le 📦 (Romain, 5 novembre, 15 h 10) — construit
- Le grimoire, le chaudron et la table d'analyse sont déjà dans l'atelier. **Toucher un carton le vide d'un coup** : chaque objet **vole jusqu'au carton de rangement 📦** du coin, et son compteur monte à chaque arrivée ; la pièce reste rangée. Seul le chat, qui ne se range pas, s'installe tout de suite.
- On **touche le 📦 pour installer les objets un par un** (« Touche un objet pour l'installer dans la pièce, un par un »).
- Tutoriel (enquête 1) : le rond sur un carton, puis le 📦 qui brille (« ✨ Touche ! »), puis, dans le 📦, un meuble de rangement qui brille ; il s'installe, la mission « installe un meuble pour ranger tes ingrédients » est faite. Un meuble sorti du 📦 sans ses cases les retrouve (bug ancien corrigé).

### 12.32 Écouter aux portes : les longs dialogues (Romain, 5 novembre, 15 h 34) — construit
- **Le bug** : à la taverne, la nuit, Margot (avec un client) puis Victor : tout s'écrivait dans la même bulle, qui grandissait jusqu'à déborder, puis **sautait** de sous la taverne au haut de la carte quand Victor commençait (la bulle était redessinée et replacée) ; le texte de Margot et du client était sous le seul nom « Margot ».
- **La solution (pour toutes les enquêtes)** : la bulle montre **une réplique à la fois** : un visage (ou l'emoji de quelqu'un qui n'est pas un habitant, avec son nom : « Un client », « L'apprenti »), un nom, le texte qui s'écrit. Elle garde **sa place et sa taille** : le texte est dans une boîte fixe, qui défile s'il est long. Toucher la bulle : tout le texte d'un coup, puis « ▶ Suite » (2 / 5…), puis « ✔ C'est tout » (la bulle se ferme). Une seule réplique : comme avant, sans compteur. Le Carnet garde tout, comme avant.
- **Règle pour écrire** : une réplique par personne (`E.bribes[].phrases`, avec `nom` pour quelqu'un qui n'est pas un habitant), des phrases « aux portes » courtes (`E.portes`) : 200 signes au plus. `tools/verif.js` le vérifie (⚠ si plus long).

### 12.33 L'atelier : le chat, le voyage des ingrédients, le message par-dessus (Romain, 5 novembre, 15 h 58) — construit
- **Plus de chat dans le mini-jeu du chaudron** (sa petite tête « Mimi », qui dressait les oreilles au bon ingrédient).
- **Le rangement automatique se voit** : un par un, lentement (1,5 s chacun), chaque ingrédient s'envole de son tas devant la porte jusqu'au meuble où il se range ; la vue glisse jusqu'au meuble ; à l'arrivée, le meuble tressaille, « +3 🫐 » et des étincelles. Ensuite seulement : « Tout est rangé ! ».
- **Tutoriel** : pendant le voyage et le message, plus rien ne brille (le bandeau dit « Regarde bien où vont tes ingrédients : c'est là qu'ils sont rangés ! ») ; le rond doré passe au grimoire après (`Atelier.rangeEnCours`). Avant, le rond du grimoire s'allumait tout de suite, la vue partait vers lui, et la surbrillance passait par-dessus le message.

- **Le premier meuble de rangement, de face (Romain, 16 h 27)** : le tout premier rangement installé (au début du tutoriel) se pose sur le mur du fond, de face, pour qu'on le voie bien ; les suivants vont encore de préférence de profil, contre les murs de côté.

### 12.34 Le tutoriel de l'Alchimiste, suite (Romain, 5 novembre, 16 h 28 → 16 h 32) — construit
- **Les rangements de face** : les fioles d'ingrédients du départ sont **au-dessus de la porte**, le premier meuble de rangement **à gauche de la fenêtre**, tous deux de face (plus de profil sur les murs de côté) : on voit bien où vont les ingrédients.
- **« La recette est complète ! »** (le grimoire, sous la dictée du Sage) : pendant ce message, rien ne brille (le bandeau : « Bravo, la recette est complète ! Lis bien le message. ») ; ensuite le rond va sur le ✕ du grimoire, puis le chaudron. **Règle générale du tutoriel** : un message (celui de l'atelier, « Mission validée ! ») passe toujours au-dessus de la surbrillance : un rond qui le toucherait attend qu'il parte.
- **Le chaudron (niveau 1, le tutoriel)** : quand il ne reste qu'une bûche, une **grosse flèche rouge** arrive en rebondissant au-dessus du tas de bois et se balance ; dès 2 bûches, elle repart en douceur. Toucher le tas de bois dans le chaudron ne dit plus « Pas maintenant ! » (le tutoriel laisse le mini-jeu tranquille).
- **Les mini-jeux du tutoriel commencent par « 3, 2, 1 »** (lentement) : le jeu est dessiné mais figé, le temps de comprendre ; aussi à « 🔁 Recommencer ».
- **Les missions bonus de l'enquête 1 se retentent à l'infini** (une exception : c'est le tutoriel) : « 🔁 Recommencer » dans le mini-jeu ; et après « Continuer », la mission reste là (« Ici, pour t'entraîner, tu peux la retenter quand tu veux »). Dans les autres enquêtes : un seul essai, comme avant.

### 12.35 La carte ne saute plus, les écritures par-dessus tout (Romain, 5 novembre, 17 h 01 et 17 h 08) — construit
- **La carte ne saute plus** quand on touche un bouton entouré de jaune : tant qu'on reste sur l'onglet Carte, un nouvel affichage ne refait plus la carte, il change seulement ce qui a bougé (`M.carteInchangee()` dans carte-jeu.js, `garderCarte()` dans moteur-actions.js : l'en-tête et les onglets sont refaits, la carte reste la même). La vraie cause du « saut » : deux animations portaient le même nom (`b-bulle`, celle des bulles du chaudron écrasait celle de la bulle de la carte), la bulle sautait de 26 px et clignotait à chaque affichage ; elle s'appelle maintenant `b-bulle-arrive` et ne joue qu'à l'arrivée d'une nouvelle bulle.
- **Sur la carte, les écritures sont au-dessus de tout** (« Nouveau ! », le nom du lieu, « Ici ! ») : les cercles, les surbrillances et les ronds du tutoriel passent dessous (ordre des couches dans carte.js).
- **Plus de grand cercle bleu en pointillés** autour des lieux (il recouvrait le Vieux Chêne) ; les maisons gardent le leur.
- **Le rond jaune du tutoriel** entoure le nom du lieu ET son « Nouveau ! » ensemble (`rectCible` dans tuto.js), au lieu de passer par-dessus.

### 12.36 La course-poursuite du Pisteur, refaite (Romain, 5 novembre, 17 h 05) — construit
Romain : « on ne sait pas quand il faut sauter un obstacle ou l'éviter, ni quand il faut se baisser ; les animations ne sont pas fluides ; les dessins ne sont pas jolis ».
- **Trois familles d'obstacles, une forme chacune** (le geste se lit sur la forme) :
  - **à sauter** : bas et couchés en travers du couloir, plus bas que les genoux — barrière basse peinte, tronc couché, sacs de farine, chien endormi (forêt : tronc couché, bouleau couché, muret de pierres moussues, tronc creux avec un lapin) ;
  - **à se baisser** : une barre à hauteur de tête tenue par deux poteaux ou deux arbres, avec un grand vide dessous où l'on voit le chemin — linge sur sa corde, poutre avec l'enseigne du boulanger (forêt : arbre tombé coincé entre deux troncs, grosse branche basse avec un écureuil) ;
  - **à éviter** (changer de couloir) : plus hauts que le coureur et pleins jusqu'au sol — pile de caisses, pile de tonneaux, meule de foin, charrette chargée, étal, gros rocher, vache qui traverse, meule du moulin qui roule (forêt : rocher moussu, grand arbre avec une chouette, roncier, tas de rochers, vieux tronc cassé, tas de bûches, cerf qui traverse, rondin qui roule).
  Les anciens obstacles trompeurs sont partis : la poule et le hérisson (petits, on croyait pouvoir sauter), la flaque (plate, on ne la voyait pas), les lianes qui pendaient (on aurait dit un mur), les caisses plus basses que le coureur.
- **Le tutoriel du geste** (niveaux 1 à 3, donc l'enquête 1) : les trois premières vagues montrent chaque geste une fois, un peu plus lentement (un obstacle à éviter dans ton couloir, une rangée à sauter, une rangée sous laquelle se baisser). Une **bulle** au-dessus du coureur dit quoi faire (jaune « ⤒ Saute ! », bleue « ⤓ Baisse-toi ! », orange « ◀ À gauche ! » / « À droite ▶ ») et l'obstacle de ton couloir est **entouré au sol** de la même couleur, deux fois par famille (une fois aux niveaux 3-4). « Bravo ! » quand c'est réussi. La bulle sert aussi à l'aide (équipement) comme avant.
- **Le coureur** est un vrai personnage vu de dos : capuche, petite cape qui ondule, carquois et flèches, ceinture et bourse, bottes ; il court (jambes et bras qui balancent, semelles qu'on voit), saute (genoux repliés, bras en l'air, la cape se soulève), **se baisse en douceur** (il s'accroupit, la tête rentre dans les épaules), se penche quand il change de couloir et s'écrase un peu en retombant. La silhouette qui fuit est le même personnage, en sombre, à grande cape. Le petit chien est dessiné de dos : tête noire, oreilles qui volent, collier rouge et médaille, queue qui frétille, coussinets roses quand il galope.
- **Plus fluide** : la foulée avance avec la vitesse (avant, elle sautait quand on ralentissait après un choc), plus de filtre lumineux sur ce qui bouge (c'est ce qui saccadait sur tablette), et ce qui est près est toujours dessiné par-dessus ce qui est loin (avant, un obstacle lointain pouvait passer devant un proche, ou devant le fuyard).
- La règle ne change pas (pas, rattrapage, raccourcis, niveaux) ; l'écran d'accueil montre le nouveau coureur et les nouveaux obstacles ; sa phrase : « Saute, baisse-toi, évite : attrape le chien ! ».

### 12.37 Le liège du Barde gardé ; la carte et ses fenêtres sans saut ; le « Ici ! » en bas (Romain, 5 novembre, 18 h 15) — construit
- **Le tableau de liège du Barde ne se vide plus entre deux enquêtes** : les photos épinglées, leurs étiquettes (innocent, à surveiller, suspect) et les fils rouges restent exactement comme ils étaient. Chaque changement est recopié dans la sauvegarde (`S.liege`, liege.js) et une nouvelle enquête repart de là (`M.liegeGarde`, appelé par `nouvelleEnquete`). Le bac du bas, lui, change avec l'enquête. Une photo d'une enquête d'avant (un mot-clé, un objet, un lieu de l'enquête 1) se dessine toujours : son nom est retrouvé dans l'enquête où elle est née.
- **Plusieurs fenêtres à la suite** (un lieu → « Le sol » → « D'accord » → « Le four »…) : le fond sombre reste en place, la carte ne se rallume plus entre deux fenêtres ; seule la fenêtre change (elle se fond à la place, sans remonter du bas). La même fenêtre redessinée ne bouge plus du tout et garde son défilement (`rendreModal`, moteur-actions.js ; `.b-feuille-suite`, `.b-feuille-meme`, moteur.css). C'était la vraie cause du « ça fait sauter la carte » à chaque bouton : le fond noir et la fenêtre étaient refaits à chaque fois, avec leur animation d'arrivée.
- **Le bandeau du haut et les onglets** ne sont plus refaits à chaque toucher quand rien n'y a changé (`garderCarte`).
- **Le rond jaune du tutoriel** : il suit sa cible à chaque image (avant : par à-coups, quatre fois par seconde) ; il n'arrive qu'une fois la cible posée (une pastille qui rebondit en entrant) et apparaît en douceur ; sur la carte, il garde la même taille autour du nom et de son « ✨ Nouveau ! » qui se balance (la pancarte est prise au repos). **Son « 👆 Ici ! » est en dessous** de la cible, pour tous les personnages ; s'il n'y a pas la place en bas : au-dessus pour un onglet du bas, et ailleurs pas de « Ici ! » du tout (le rond suffit, il ne cache rien).
- **Ce qui ne se touche pas encore** (les autres propositions d'un lieu, pendant le tutoriel) se voit bien : juste un peu terni (avant : à moitié transparent).

### 12.38 Plus de « Ici ! » ; la carte immobile ; la poursuite en vraie perspective (Romain, 5 novembre, 19 h 31 et 19 h 39) — construit
- **Le « 👆 Ici ! » du tutoriel est supprimé partout** (et l'écriteau « 👆 Touche ici ! » du tableau des chemins secrets, le « ✨ Touche ! » du 📦 de l'atelier ; le rond de l'atelier ne porte plus d'écriteau). Il reste **le rond jaune**, avec **la même animation partout** : il pulse (il grossit un peu et brille plus fort) et une onde part de lui toutes les 1,3 s. Il apparaît directement à sa place, en fondu, une fois la cible posée ; il suit la cible image par image.
  (La mise en ligne de 19 h 17 avait envoyé une version plus ancienne que celle testée, avec un rond qui arrivait en glissant depuis le coin de l'écran : corrigé ; on vérifie maintenant ce qui part en ligne.)
- **La carte ne bouge plus quand la phrase du tutoriel change de longueur** : sur l'onglet Carte, la carte passe sous la rangée du tutoriel du bandeau du haut (`--h-bandeau`, `.b-contenu-carte`) ; le bandeau ne rapetisse plus d'une étape à l'autre (`bandeauStable`, tuto.js). C'était la cause des petits sauts sur les écrans plus étroits : la phrase passait d'une à deux lignes, tout l'écran descendait, la carte se recalait.
- **Le cadre de la carte change de hauteur** (barre du navigateur, bandeau) : même zoom, et la carte reste où elle est à l'écran (`ajuster`, carte.js).
- **Poursuite** : le fuyard suit vraiment la perspective (sa taille = celle de la route à sa distance ; avant, un minimum le gardait presque aussi grand au loin) ; sa distance ondule un peu en courant ; tout près, le petit chien reste petit. Le chien galope mieux (le corps rebondit, s'écrase et s'étire, roule ; les pattes arrière lancent plus haut ; les oreilles volent en retard ; la queue frétille) ; la silhouette rebondit plus, bat des bras, sa grande cape doublée de violet s'évase et flotte avec la foulée ; un petit nuage de poussière à chaque pas. Le coureur penche moins dans les virages, et le petit tremblement contre le bord du chemin ne le fait plus retomber au sol (il était fait en CSS et écrasait sa position).
- **« Plus de cœur »** (tous les mini-jeux) : le message est en haut, juste sous la rangée des cœurs, plus petit et 3 s au lieu de 4 (avant : au milieu, il cachait les obstacles).

### 12.39 Le coureur décalé, le « 3, 2, 1 », la fenêtre « Raté » sous la pause, l'onde partout (Romain, 5 novembre, 20 h 16) — construit
- **Le coureur de la poursuite était décalé de son ombre dans le jeu** (pas dans la salle des mini-jeux) : son dessin portait la classe `pt`, déjà prise par les petits points du « ı » (moteur.css, `.pt{position:absolute;left:50%;transform:translateX(-50%)}`), qui le poussait de côté. Le pantin s'appelle maintenant `pant` ; même chose pour les points de la trajectoire de la démo du tir (`rg-pt`). Vérifié dans le jeu lui-même (écran d'accueil du mini-jeu, « 3, 2, 1 », course) : le coureur est sur son ombre.
- **Pendant le « 3, 2, 1 » du tutoriel**, la poursuite et les traces dessinent leur première image tout de suite (avant, le chien et un arbre attendaient dans le coin en haut à gauche, la forêt des traces était noire).
- **« Réessayer » après un raté, puis ⏸️** : la fenêtre « Raté… » restait ouverte derrière le mini-jeu, avec le rond du tutoriel dessus. Toute fenêtre encore ouverte se ferme quand un mini-jeu part (`lancer`, moteur-actions.js).
- **L'onde du rond jaune partout dans le tutoriel** : le rond du tutoriel, le rond de l'atelier, le 📦 et le meuble à installer (plus d'écriteau « Touche ! »), les gros boutons dorés qui brillent (`.b-guide` : « Enquête… », « Commencer l'enquête », Boutique, Talent) : la même pulsation (1,3 s) et la même onde. Le point d'un lieu n'a plus son propre cadre fixe sous le rond.

### 12.40 Les écrans fixes, le 🤥 qui part en fumée, la nuit de l'E2, le cadre jaune unique, la salle sur le GitHub (Romain, 5 novembre, 21 h 46) — construit
- **« Enquête N » (la lettre du maire), « Enquête résolue » et le village : plein écran verrouillé**, sur tous les téléphones et toutes les tablettes : la page ne défile plus et ne glisse plus (`html.b-fixe`, `.b-ecran-fixe`). La grande image du héros rapetisse d'abord (le paysage — montagnes, collines, herbe — continue maintenant de chaque côté, `decor` dans persos.js : plus jamais de bord coupé) ; s'il manque encore de la place, tout se serre pas à pas (`--serre`, de 1 à 0,6 : textes, marges, boutons ; `M.ecranFixe`, moteur-actions.js). Dernier filet : si même serré ça ne tient pas, on peut défiler plutôt que de perdre un bouton (`b-deborde`). Debout : le titre, le héros, ses boutons, l'enquête suivante l'un sous l'autre ; couché (téléphone, tablette, ordinateur) : le héros à gauche sur toute la hauteur, le reste à droite. La lettre : le portrait du maire flotte à droite du texte, le 🔊 dans le coin ; téléphone couché : la lettre à gauche, l'affiche et le bouton à droite. Vérifié sur 12 tailles d'écran (de l'iPhone SE au grand écran, debout et couché) : `scratchpad/titres.py`.
- **Le Barde, enquête 2** : Bastien aux portes le matin finit par « Ne t'inquiète pas, tu n'as rien à craindre » ; le maire « soupire derrière sa porte : « Une rivière rouge… Les gens ont peur. Voilà qui va les occuper : au moins, ils ont l'esprit ailleurs. » » ; Mélusine « frotte son linge dans le lavoir tout rose, en soupirant : « J'aurais dû m'en douter… Quel escroc ! » ». La question à Bastien « On t'a vu payer avec une pièce d'or toute neuve ! » n'existe que **le soir** (`moments:['nuit']`). Les oreilles de Bastien qui mentent : un fondu de couleur discret, sans traits (persos.js).
- **🤥 Mensonge ? seulement juste après la réponse** (« trop simple pour détecter les mensonges ») : le bouton n'est que sous la dernière réponse du villageois (`P.derniere`, barde.js) ; dès qu'on pose une autre question, il part en fumée (petits nuages qui montent, `.bd-fumee`) avec un tout petit souffle (`M.son('fumee')`). « 🔁 Répète » redonne la chance sur la réponse répétée. Une réponse ratée n'est pas perdue pour l'enquête : « J'exige la vérité », la potion de vérité, et les filets de sécurité déjà là (Tim la nuit…).
- **La nuit de l'E2** : Victor, à la taverne, ne parle plus (« 😴 Victor est trop fatigué pour parler », en rouge sur la carte) ; ceux qui dorment ou ne sont pas disponibles la nuit (Victor, Mélusine, Fortuné, Iris, le maire) : plus d'« Écouter aux portes » (B.porteIci ; leurs phrases de nuit sont retirées de `E.portes`).
- **Un seul cadre jaune, le rond animé du tutoriel, partout** (« plus qu'une seule version, la version animée ») : les gros boutons qui brillent (village, lettre, fin, Grand Livre : `.b-guide`), les talents à choisir (avant : un halo bleu), le rond de l'atelier, ses « ? » et ses meubles ont exactement le rond du tutoriel : l'anneau à 7 px qui pulse et l'onde qui part de lui. Quand le rond du tutoriel est déjà dessus, il n'y en a qu'un (`.tu-vise`). Au début de l'E2, le talent forcé a le rond jusqu'au bout : portrait, arbre, les deux talents, puis « ⭐ Je prends ce talent » (avant : rien sur ce bouton). L'onde des « ? » de l'atelier partait de travers (`transform` écrasé par l'animation) : corrigé.
- **La salle des mini-jeux sur l'écran d'accueil du GitHub** (une nouvelle icône, « Brumeval : la salle des mini-jeux ») : tous les jeux du Pisteur, de l'Alchimiste et du Sage, niveaux 1 à 10 ; plus de jeux du Barde, plus de case « Avec des aides » ; en haut, « ← Les projets de Romain » et « 🏮 Jouer à Brumeval ».
- **La poursuite de Tim (E2, Vieux Chêne)** : niveau 5 pour un adulte, 2 pour un enfant (moins avec l'équipement). Un seul essai dans l'E2 : raté, Tim s'enfuit (« une petite casquette disparaît entre les arbres ») et le point se ferme ; l'enquête n'est pas bloquée : la question du Barde « Que faisais-tu près du Vieux Chêne ? » s'ouvre aussi avec le secret de Margot (« ce petit Tim traîne près du Vieux Chêne »), et la nuit Tim lâche sa pierre de toute façon.
- ~~Proposition (pas construite) : 30 % de lecture en moins pour le Barde~~ → **faite le 7 novembre (§12.50, −34 %)**.

### 12.41 Le bandeau du tutoriel réduit, les phrases raccourcies, plus aucun rond jaune immobile (Romain, 5 novembre, 23 h 06 – 23 h 09) — construit
- **Le bandeau du tutoriel** (en haut) **garde toujours la même petite hauteur : deux lignes** (avant : il gardait la hauteur de son plus long message, et restait grand tout le temps — c'était pour que la carte ne saute plus, mais la carte passe maintenant sous le bandeau). Les phrases se suivent sur la même ligne, en petit ; un message un peu plus long s'écrit un peu plus petit (jusqu'à 86 %, `bandeauStable`, tuto.js) ; un cadre fin. Le haut de l'écran est aussi un peu plus serré (portrait 44 px).
- **Des phrases plus courtes** : chaque étape de l'enquête 1 (`court`, e1.js) et chaque attente (`attendT` : « Attends le code du fil : le Pisteur te le donne → 🔢 Code. ») ; les messages de fin de moment, de mission bonus (« ✨ Bonus : « … » (de l'or !) »), d'accusation, de talent.
- **La phrase « 👆 » ne dit plus que ce que le rond jaune ne montre pas** (« on voit bien qu'il faut appuyer sur le clocher ») : plus de « Touche « 🔔 Clocher » sur la carte », « Touche 🗺️ Carte, en bas », « Touche « 🔍 Explorer » », « Touche « D'accord » »… Restent : « Pose tes questions une par une », « Un seul essai ! », « Quand c'est fait, touche ✔ », « Dis ce code à toute l'équipe », « Le choix, c'est à vous ! », et quelques mots dans l'atelier (« Suis la recette que le Sage te lit »…).
- **L'onglet Code tient dans l'écran** même sur un petit téléphone : les cases et les touches suivent la hauteur de l'écran.
- **Plus aucun rond jaune immobile** (vérifié par un robot qui joue tout le tutoriel des 4 rôles et repère chaque cadre jaune à l'écran) : les ronds de la carte autour des lieux déjà ouverts palpitent comme les autres (avant : un anneau immobile, à moitié transparent) ; le cadre de l'analyse qui attend (atelier) et le « prochain moment » du Grand Livre respirent au rythme du rond ; les talents à choisir n'ont plus de bord jaune immobile sous le rond.

### 12.42 Le tutoriel raconté ; plus de cadre quand il ne sert à rien ; le bouton à toucher bouge lui-même (Romain, 5 novembre, 23 h 32 et 23 h 35) — construit
- **Le bandeau raconte l'histoire, en phrases courtes, comme un conteur d'enquête** (heroic fantasy, Sherlock Holmes) — plus jamais d'explication de ce qu'il faut toucher : « c'est du visuel ; tout ce qu'il me faut, c'est du narratif et les boutons animés ». Chaque étape de l'enquête 1 a son `histoire` (e1.js), par exemple Pisteur : « Des traces de pas toutes fraîches, au pied de la mairie… Suis-les, enquêteur ! », « Un détail cloche, à la fenêtre de la mairie… Approche, et ouvre l'œil ! », « Cette gouttière est toute tordue… Et si le voleur était passé par là ? », « Ça sent le bon pain chaud… Les traces mènent-elles chez Gaspard ? » ; Alchimiste : « Bienvenue dans ton atelier ! Il sent encore la poussière… Déballe tes trésors. ».
- **Les attentes sont racontées** et nomment toujours qui apporte l'indice (« Le Pisteur fouille la mairie… Il va sûrement te rapporter un indice ! », « Les traces filent vers la forêt… Le Barde ou le Sage va t'en trouver le plan. », « L'Alchimiste prépare l'encre… Ça bouillonne, ça fume, patience ! ») ; la fin d'un moment aussi, avec un peu d'humour sur le Sage (« Quelle matinée ! Le Sage a le code de l'après-midi… dès qu'il aura fini de lisser sa barbe. », « Le soleil se couche sur Brumeval… Le Sage a le code du soir… s'il retrouve ses lunettes. ») ; les missions bonus (« ✨ Un enfant pleure : son ballon est coincé tout en haut du clocher ! ») ; la fin (« Bravo ! Aide le Sage : qui a pris la Lanterne d'Or, et où est-elle ? », sans « tape le code »).
- **Plus de cadre du tout quand il ne sert à rien** : une étape sans `histoire` (la forêt du Pisteur : le carrefour, les chemins, le chien, le Vieux Chêne) n'a pas de bandeau (`R.sansBandeau`, tuto.js) ; il revient pour l'histoire, les attentes, « Raconte au Sage » (avec ✔), la fin du moment, la fin.
- **Le bouton à toucher bouge lui-même**, en plus du rond jaune : il grossit doucement au rythme du rond (`.tu-respire`, propriété CSS `scale` : elle s'ajoute à sa place, ne la remplace pas ; pas les dessins de la carte, qui ont déjà leur rond qui palpite). Le rond garde la taille du bouton au repos (`rectCible`). Les tests qui cliquent un bouton guidé le font avec `force=True` (sinon Playwright attend qu'il ne bouge plus).
- **À faire ensuite (prochain chantier, demandé)** : refaire le tir à l'arc du ballon du clocher (même moteur ; un clocher et un ballon à décrocher au lieu de la lanterne ; un archer plus beau ; un tir plus clair). **À décider par Romain** : les pièces d'or des missions bonus de l'E1 (15 aujourd'hui ; « une pièce plutôt » ?).

### 12.43 Les mini-jeux en plein écran verrouillé (Romain, 6 novembre, 0 h 14 et 0 h 40) — construit
- **Douze mini-jeux ne défilent plus jamais**, même sur un téléphone couché : Suivre la piste, Course-poursuite, Se cacher, Tir à l'arc, Bulles magiques, Le bon mélange, Les différences, Le double, Le grand ménage du labo, Le chaudron, Superposer les plans, Assembler les runes (`MJ.PLEIN_ECRAN`, mj-core.js : la classe `mj-fixe` sur le jeu et sur sa fenêtre, `#mj-plein` du jeu ou `#sl-plein` de la salle ; plus de hauteur minimale de 520 px pour eux). Ce qui dépasse encore (leur écran d'accueil sur un téléphone couché) se serre tout seul (`MJ.ajusterHauteur` : un zoom sur la zone qui déborde, jusqu'à 50 % ; dans le jeu lui-même seulement pour les bulles, le mélange et le double, où l'on touche des boutons). Superposer les plans : les commandes plus serrées sur un écran bas.
- **Les autres peuvent encore défiler** (choix de Romain) : le mensonge et les mots du Barde, l'alphabet, la grille et les dépositions.
- Vérifié sur 4 tailles (iPhone SE debout, téléphone couché 844×390 et 667×375, tablette couchée) : `scratchpad/mj-plein-ck.py`.

### 12.44 Trois mini-jeux du Pisteur refaits, avec leurs variantes (Romain, 6 novembre, 2 h 34) — construit la nuit du 6 novembre
Demande de Romain : « J'ai besoin de variantes. » La charte graphique qu'il aime : **l'atelier de l'Alchimiste et la course-poursuite** (contours sombres épais, couleurs chaudes, volumes doux, lumière). « Je te laisse tourner la nuit : je veux que ce soit fluide et très sympathique à jouer. » Les règles et la difficulté de chaque jeu ne changent pas (mêmes réglages par niveau), sauf ce qui est dit ici.
- **Suivre la piste : en ville, vu du ciel** (`params.decor = 'ville'`, mj-pisteur-alchi.js : `villeDefs`, `zonesVille`, `tuileVille`, `departVille`, `ARRIVEES_VILLE`). Enquête 1 (le massif de la mairie, e1.js) : la piste part du massif de fleurs piétiné, devant les marches et le toit de la mairie. Le sol est en pavés ; les haies deviennent des étals du marché sous leurs auvents rayés, l'eau un canal bordé de pierres, les dalles celles de la place, la clôture un muret couvert de lierre, les rochers des bornes et des jardinières ; tout le long des bords, deux rangées de toits (tuiles, ardoises, cheminées qui fument) ; là où aucune piste ne passe, des pâtés de maisons, des jardins, des arbres, des réverbères, des bancs, des tonneaux, une fontaine. Les arrivées : trappe de cave, tonneau, appentis, puits, botte de paille, porche.
- **Se cacher, refait** (nouveau fichier `mj-cachette.js` + `mj-cachette.css`, qui remplace l'ancien `cachette`) :
  - **plusieurs pièces** : 2 pièces de 3 rangées (2 rangées aux niveaux 1-2) ; chacune a sa porte ; on entre dans la suivante par le bas, son nom s'affiche ; la première est un peu plus calme. Le sablier compte toutes les pièces (le temps par rangée de l'ancien jeu, + 8 s par pièce). Gardes par pièce : 1 aux niveaux 1-2, 2 ensuite (la première pièce en a un de moins à partir du niveau 6) ; on court un peu plus vite (les pièces sont plus grandes). Réglé au robot (`jeu/test/mj-refaits/robot-cachette.py`) pour être à peu près aussi dur que l'ancien jeu : niveau 10 (Silas, E2) 3 parties sur 4 gagnées, comme l'ancien ; niveau 5, 3 sur 4 (l'ancien 4 sur 4, mais plus court). Un essai à 3 pièces rendait le niveau 10 bien plus dur : abandonné ;
  - **trois décors** : `ville` (par défaut ; la nuit : la ruelle, la place du marché, la cour au linge qui sèche), `foret` (enquête 2, passer derrière Silas ; en fin de journée : la clairière, le ruisseau, le sous-bois ; Silas et les gardes champêtres regardent, sans lanterne), `moulin` (enquête 2, la nuit au moulin : la cour et sa grande roue, la salle des meules, le grenier) ;
  - **des personnages vus du ciel qui marchent vraiment** : pieds, bras qui balancent, cape qui flotte, un visage sous la capuche ; caché, le Pisteur se tasse, ses yeux dépassent et il regarde le garde le plus proche ; les gardes ont chacun leur chapeau (tricorne, képi et moustache de Silas, casquette des ouvriers) et leur lanterne tendue la nuit, avec « ! » et « ? » dans une bulle. Le même Pisteur marche maintenant dans « Suivre la piste » (`MJ.DESSUS`) ;
  - **les pièges** : ce qui fait du bruit quand on passe dessus (flaque, feuilles, seau, brindilles, boue, planche qui grince, farine : « Atchoum ! ») ; un animal qui dort et se réveille si on passe tout près (le chat, le lapin, l'oie du moulin) ; au niveau 5 et plus, un fil à clochettes : le franchir alerte tous les gardes de la pièce (il y a toujours un chemin sans le franchir). Ce qui avance : la charrette et son âne (ville, cour du moulin), une nappe de brume qui dérive dans la forêt ;
  - la nuit, le décor et le Pisteur caché sont dans l'ombre ; le Pisteur qui court et les gardes restent bien visibles ; un petit cercle « tu es ici » sous le Pisteur caché.
- **Tir à l'arc, refait** (nouveau fichier `mj-tir.js` + `mj-tir.css`, qui remplace l'ancien `tir` ; le moteur ne change pas) :
  - **le décor** : la place de Brumeval en fin d'après-midi (ciel chaud, nuages qui passent, maisons à colombages, volets, jardinières, cheminées qui fument au vent), **le clocher** (l'horloge, la Grosse Marie dans son arche, la flèche d'ardoise, le coq de la girouette qui suit le vent) ;
  - **l'archer refait** : de profil, il se penche en arrière quand il vise haut, tend le bras de l'arc dans l'axe de la flèche, tire la corde jusqu'à la joue, sourit quand il touche, fait « oh » quand il rate ; sa cape flotte au vent. La flèche part de sa main (`corpsArcher`) ;
  - **trois versions** (`params.decor`) : `clocher` (par défaut, enquête 1, « Le ballon du clocher ») : le ballon rouge d'un enfant est noué à la corniche du clocher, il faut **couper la ficelle** (la toucher le fait rebondir : « Boïng ! ») ; il redescend en planant jusqu'à l'enfant, qui saute de joie ; `cerfvolant` (enquête 2) : le cerf-volant coincé au clocher bat au vent, même principe ; `banderoles` (enquête 3, la mission de fête du Pisteur) : chaque flèche emporte une banderole de petits drapeaux qui se déroule derrière elle ; elle s'accroche à l'anneau touché, puis son autre bout file en haut du mât de la fête ; une flèche tirée à fond qui traverse deux anneaux les relie par la même banderole ; un anneau est au bout de la perche de Basile, en haut de son échelle ; une banderole ratée tombe par terre ; à la fin, tout s'illumine : « Ça, c'est de la décoration ! ». Les autres cibles (mêmes mouvements que l'ancien jeu) : des lampions qui se balancent, des cibles de paille qui gardent la flèche, des ballons de baudruche qui volent en huit (pop !) ; dans les banderoles : anneaux, enseignes qui se balancent, crochets ;
  - **les pièges d'oiseaux** : des pigeons traversent (la flèche les effleure : ils s'envolent, la flèche tombe ; aucun oiseau n'est blessé) ; dès le niveau 2, **un pigeon vient se poser sur une cible** : tant qu'il est là, on ne peut pas la toucher (« Le pigeon ! Attends qu'il parte… ») ; des drapeaux qui battent au vent devant les cibles remplacent les branches.
- **La salle des mini-jeux** montre les variantes : Suivre la piste en ville, Se cacher la forêt et le moulin, Tir à l'arc le cerf-volant et les banderoles. Dans le jeu : le massif (E1) en ville, le ballon (E1) au clocher, Silas (E2) dans la forêt, la nuit au moulin (E2) au moulin, le cerf-volant (E2).
- Ce que ça ne change pas : aucun code (E1 et E2 identiques, vérifié), les niveaux de chaque enquête, les résultats renvoyés au moteur.
- Pistes laissées de côté (à proposer à Romain) : « Suivre l'homme en cape » (E2, la nuit) traverse le village : il pourrait passer en ville, la nuit ; la page « Le point sur les mini-jeux » n'a pas encore les images des nouvelles versions.

### 12.45 Les retours de Romain sur les trois mini-jeux refaits (6 novembre, 9 h 02) — construit le 6 novembre au matin
Romain a joué aux versions du §12.44 (mises en ligne à 8 h 18) : « c'est bien les décors », « l'animation est jolie, les personnages sont jolis ». Ses demandes, et ce qui a été fait (« je te laisse faire ») :
- **Suivre la piste en ville : on passe SOUS les étals et les maisons.** En ville, chaque « haie » devient soit des étals, soit une **rangée de maisons à arcades** (les « couverts » d'une bastide : piliers, ombre, enseignes ; nouveau type de zone `maison`, 72 à 118 de profondeur) ; presque chaque partie en a au moins une. Les étals sont **petits, grands ou très grands** (une grande tente rayée sur toute la profondeur, avec son mât et son fanion). Étals et maisons sont dessinés **par-dessus le Pisteur** (couche `mja-couverts`) : il **disparaît dessous**, et son cercle de vision s'efface ; dessous, il n'y a aucune trace et **la piste file tout droit** (la règle ne change pas : une piste ne tourne jamais dans une zone). La phrase d'accueil le dit : « Suis les traces : sous les toits, tout droit ! » ; la démo montre le Pisteur passer sous une rangée d'étals.
- **Se cacher : plusieurs styles d'ennemis, et on ne peut plus rester caché trop longtemps.**
  - **le garde** (comme avant : un cône devant lui) ;
  - **le veilleur à la grosse lanterne** (niveau 3 et plus ; manteau, chapeau rond, moustache blanche) : sa lanterne portée sur le côté **éclaire devant et derrière** lui (un cône devant, un plus court derrière) ;
  - **le porteur de torche** (niveau 5 et plus ; la torche levée, qui crépite) : **un grand cercle de lumière tout autour** de lui ;
  - (le veilleur et le porteur de torche marchent sans jamais changer d'avis : leur lumière est grande, on doit pouvoir la prévoir) ;
  - **le chien** (niveau 4 : dans la dernière pièce ; niveau 6 et plus : dans chaque pièce) : un brave chien roux à collier rouge qui trotte, le museau au sol. Il ne voit presque rien (seulement le Pisteur qui court tout près de son museau), mais **il a du flair** : quand on reste trop longtemps dans la même cachette (9 s au niveau 4, 7,5 s au niveau 9), **des petites ondes d'odeur** montent de la cachette, puis le chien **la sent** (« Snif ? Snif ! », oreilles dressées), trotte jusqu'à elle et **la renifle** (un rond jaune se remplit, environ 3 s) : si le Pisteur est encore dedans, il **aboie** (« Ouaf ! Ouaf ! », une erreur) et la cachette est **dévoilée** pendant 7 s (traces de pattes, rond rouge : on ne peut plus y aller) ; s'il reste encore, il ré-aboie toutes les 2,6 s. S'il est parti à temps : « Personne ? », le chien repart. Pendant qu'il renifle, il a le nez dans la cachette : on peut s'enfuir. La démo le montre quand le niveau a un chien ;
  - **le niveau 10** (Silas) : **3 pièces** (au lieu de 2), **on court un peu moins vite** (−10 %), et avec le chien de chaque pièce il y a **deux fois plus de monde** qu'avant. Essai : 3 gens + le chien par pièce → le robot ne gagnait plus jamais ; retenu : 2 gens + le chien par pièce, et **une erreur permise** à partir du niveau 6 (avant : aucune à partir du niveau 9 ; l'aboiement en coûte une). Robot (`jeu/test/mj-refaits/robot-cachette.py`, qui s'enfuit quand le chien arrive) : niveau 10 forêt 4 parties sur 6 (avant 3 sur 4), niveau 5 moulin 3 sur 4, niveau 7 ville 2 sur 4.
- **Tir à l'arc** :
  - **le ballon et le cerf-volant : seulement la ficelle.** Une flèche dans le ballon le fait **éclater** (« Pof ! »), dans le cerf-volant le **déchire** (il tombe en tournoyant) : **la partie est perdue** (« Il fallait viser la ficelle, pas le ballon ! »), l'enfant est triste. Au niveau 9, le deuxième ballon (ou cerf-volant) est noué à l'autre coin de la corniche (avant, il était au même endroit que le premier). La phrase d'accueil : « Coupe la ficelle, pas le ballon ! ». (Avis de Claude donné à Romain : perdre d'un coup peut faire rager à 8 ans ; si c'est trop dur : « un cœur en moins ».)
  - **le vent change de sens toutes les 3,5 à 6 s** (au hasard), avec **une transition d'une seconde et demie** : les drapeaux retombent le long du mât, puis repartent de l'autre côté ; la girouette passe de profil, la manche à air retombe puis se regonfle. Le programme du vent est tiré au début de la partie (`Vent` : `SAUTS`), donc prévisible par la visée. Il pousse les flèches **15 % moins fort** qu'avant, et **les petits points de visée en tiennent compte** (avant, seulement avec l'aide). Même aux niveaux 1-2 (où il ne pousse pas les flèches), le décor bouge avec lui ;
  - **les drapeaux** ne balaient plus devant les cibles : ils sont sur **des mâts** (sur la pente du toit de la maison à colombages ; au coin de la corniche du clocher, niveau 8 et plus), et **flottent du côté où souffle le vent** (le tissu ondule, plus fort au bout) ; pendant la transition, il y a la place de tirer à côté. Une flèche dans un drapeau retombe (« Dans le drapeau ! ») ;
  - **les corbeaux grognons** (sourcils froncés, œil jaune, une houppe ; jamais méchants pour de vrai) : ils **se posent sur les cibles** (à la place des pigeons) ; une flèche les chasse (« Croâ ! Ouste, le corbeau ! ») mais retombe. **Les cibles qui volent en huit sont des corbeaux** à chasser (« Croâ ! Va-t'en ! », ils perdent une plume et s'enfuient à tire-d'aile) : à la place des ballons de baudruche, pour ne pas mélanger avec le ballon qu'il ne faut pas toucher ;
  - **les oiseaux qui traversent** (niveau 5 et plus) : des pigeons, **en courbe**, qui battent des ailes puis planent ; **au niveau 9 et plus, de grosses tourterelles** (collier noir, grandes ailes, plus lentes). Une flèche qui les touche rebondit : l'oiseau sursaute (plumes, « Rrou ! », « Rrouhou ! ») et continue sa route ;
  - **les banderoles : la guirlande reste accrochée à l'arc.** La première flèche l'emmène de l'arc au premier anneau ; elle reste tendue entre l'anneau et l'arc (elle suit la main quand on vise). Chaque flèche suivante emmène son bout libre jusqu'à l'anneau suivant (il va tout droit du dernier anneau à la flèche), puis il revient à l'arc comme un élastique. Une flèche ratée : le bout revient à l'arc. **Quand tous les anneaux sont touchés, elle se détache de l'arc** (« Elle se détache ! ») et son bout file en haut du mât de la fête, puis tout s'illumine. **Niveau 5 et plus : des anneaux noués au bout des drapeaux** (à la place de Basile), qui bougent avec le vent ; les transitions sont lentes, on a le temps de viser.
- Vérifié : rapide.sh (verif.js « Tout est bon », tuto.py sans échec), partie2.py sans échec, codes E1/E2/E3 identiques, les 7 versions lancées dans le jeu à 400 et 1180 de large sans erreur ; robots de tir (`robot-tir.py`, qui évite le ballon) : niveau 9 clocher 4 sur 4, banderoles niveau 7 2 sur 3, cerf-volant niveau 6 3 sur 3.

### 12.46 Deuxième retour de Romain (6 novembre, 10 h 50) — construit le 6 novembre, mis en ligne à 12 h 26
- **Suivre la piste en ville : validé** (« c'est très bien, on garde comme ça »).
- **Se cacher** (remplace ce que le §12.45 disait du chien) :
  - **le chien, en trois temps bien visibles** : au bout de **3 s dans la même cachette** (**2 s au niveau 10**), s'il est assez près (190 ; **au niveau 10, de n'importe où**), il s'arrête et **renifle museau levé** (petites bouffées devant sa truffe, « Snif ? Snif ? », 1,3 s), puis **« Waf ! Waf ! »**, puis il **court** jusqu'à la cachette et la **fouille** (3 s, un rond jaune se remplit). Si le Pisteur y est encore : il aboie (une erreur), la cachette est dévoilée 7 s, il ré-aboie toutes les 4 s si l'on reste. Pendant qu'il court et qu'il fouille, il ne pense qu'à la cachette : on peut s'enfuir à côté de lui. **À l'entrée d'une pièce, pas d'odeur** (on doit pouvoir y attendre le bon moment). La démo montre les trois temps ;
  - **les villageois, sans vision** (1 par pièce à partir du niveau 4) : **en forêt, la cueilleuse** (robe rouge, chapeau de paille, panier) va **seulement aux buissons à baies rouges** (jamais aux rochers), et cueille (ses mains vont chercher les baies, qui volent jusqu'au panier) ; **en ville et au moulin, le porteur** soulève une caisse, un tonneau, une botte de paille, un sac de farine ou la brouette (« Hop ! ») et **va la reposer ailleurs dans la pièce** (toujours sans couper le chemin de la porte) ; tant qu'il la porte, ce n'est plus une cachette. Ils travaillent **aussi longtemps que le chien fouille** (un rond orangé) : si le Pisteur est dedans à la fin, ils le trouvent (« Oh ! Coucou, toi ! », une erreur, cachette dévoilée). Ils choisissent souvent la cachette du Pisteur. S'il manque de buissons à baies ou de caisses dans une pièce, quelques cachettes sont changées ;
  - **le nouveau piège : la pie bavarde**, perchée au bord de la pièce (une pièce sur deux, toujours la dernière, niveau 3 et plus) : elle tourne la tête (petit regard en pointillé violet) ; si l'on court dedans, elle crie « Kra ! Kra ! » et **tous les gardes de la pièce accourent** vers ce coin (pas une erreur en soi) ;
  - **le niveau 10** : un garde de plus dans la dernière pièce (3 pièces en tout). Essais au robot : 3 gardes dans chaque pièce, avec le chien à 2 s et 2 villageois → 0 partie sur 6 ; retenu : 2 gardes par pièce + 1 dans la dernière, 1 villageois par pièce, la pie dans une pièce sur deux, lumières un peu moins longues (140 au lieu de 156 au niveau 9), gardes un peu moins imprévisibles, **deux erreurs permises aux niveaux 9 et plus** (trois façons de se faire prendre : gardes, chien, villageois), sablier +25 % (+10 % dès le niveau 4). Robot : **niveau 10 forêt 2 parties sur 6** (avant 4 sur 6 : c'est plus dur, comme demandé), niveau 6 ville 3 sur 3.
- **Tir à l'arc** (« pas encore validé : il faut que ce soit plus clair et intéressant ») :
  - **plus de drapeaux** (ni d'anneaux au bout des drapeaux) ;
  - **la jauge de puissance** : une barre à gauche de l'archer qui se remplit du bas vers le haut quand on tire la corde, **verte (« Faible »), jaune (« Moyen »), orange (« Fort »), puis dorée avec l'éclair qui pulse (« À fond ! »)** ; le rond autour de l'arc prend les mêmes couleurs ; la démo la montre ;
  - **la ligne de visée** : de gros points blancs bordés de sombre, **plus longue à tous les niveaux** (1,25 s au niveau 1, 0,46 s au niveau 9, au lieu de 1,15 et 0,13), qui suit le vent. **Sur la longueur montrée (c'est la petite aide à la visée)**, elle dit ce qui va arriver : **dorée** si la flèche va dans une cible (la cible s'entoure, une étoile au point d'arrivée), **rouge** si elle va dans un obstacle, une tourterelle, le ballon ou par terre (une croix ; l'obstacle ou le ballon s'entoure de rouge) ;
  - **ce qu'il faut toucher brille en doré** (un rond doré en pointillé qui tourne) ; **pour le ballon et le cerf-volant, c'est la ficelle qui brille, avec des ciseaux** ; « Vise ce qui brille en doré ! » au début ; phrases d'accueil : « Coupe la ficelle dorée, pas le ballon ! », « Touche tous les anneaux dorés ! » ;
  - **les corbeaux = à chasser** : noirs, grognons, entourés d'or ; un corbeau posé sur une cible se chasse **sans perdre de flèche** (« Croâ ! Ouste ! (flèche rendue) ») ; **les oiseaux de passage sont des tourterelles blanches, sans rond doré** : ce ne sont pas des cibles (« Rrouhou ! Pas les tourterelles ! ») ;
  - **les obstacles solides** (bois ou fer, contour sombre ; une flèche s'y plante, « Toc ! », même tirée à fond — elle ne transperce que les cibles) : fixes — **le plancher du peintre** pendu sous le toit, **l'enseigne du forgeron** sur sa potence au clocher, **la branche du platane** devant le clocher ; qui bougent (niveau 6 et plus) — **le seau de la poulie** qui monte et descend, **le linge** (deux draps au vent, on tire entre), **la pancarte** qui se balance. 1 fixe à partir du niveau 3, 2 au niveau 9, + 1 qui bouge à partir du niveau 6 (l'enseigne, la pancarte et le linge ne vont jamais ensemble). **Réglés au robot** (`jeu/test/mj-refaits/obstacles-tir.py` : la part des tirs qui atteignent une cible et que l'obstacle arrête) : chacun en arrête 6 à 20 %, trois ensemble 15 à 25 %. Une première version (échafaudage sur poteaux, linge et branche devant l'archer) en arrêtait jusqu'à 60 % : refaite. Le balcon (trop bas, n'arrêtait rien) a été retiré ;
  - **les anneaux, enseignes et crochets : une zone de touche plus grande** (au moins 17 au lieu de 11 à 19 ; 13 pour les crochets au lieu de 7) ;
  - robots : niveau 9 clocher 4 sur 4, banderoles niveau 6 3 sur 3 (le robot vise parfaitement : il vérifie qu'on peut gagner, pas la difficulté pour un enfant).

### 12.47 Troisième retour de Romain (6 novembre, 12 h 49) — construit le 6 novembre, mis en ligne à 13 h 49
- **Se cacher** (« super ») — remplace ce que le §12.46 disait de la pie et du chien au niveau 10 :
  - **la pie bavarde est retirée** (son code reste, éteint) ;
  - **le chien ne sent plus de n'importe où au niveau 10** : seulement s'il est assez près (230 au niveau 10, 190 avant). Romain : « quand on est loin du chien, il ne renifle pas, c'est pas si mal » ;
  - **le rôdeur (niveau 10, dans chaque pièce)** : grande cape violette, chapeau rond, une lanterne-boule bleutée au bout d'un bâton ; il va **d'un point à un autre, tirés au hasard dans toute la pièce** (pas dans l'eau du ruisseau : il passe par le gué), en tournant doucement (des trajets en courbes), s'arrête un instant, repart ; **une zone ronde bleu-violet autour de lui** (56) : si l'on court dedans, il voit. Caché, on ne risque rien (comme pour la torche). Son chemin est tiré d'avance : l'aide (cercles verts/rouges) et le robot prévoient ce qu'il fera vraiment. La démo le montre au niveau 10 (il fait une boucle en bas à droite, le Pisteur court quand il est loin) ;
  - **le cercle de la torche se voit bien** : un bord sombre et large sous un bord jaune plus épais, et un intérieur plus coloré ;
  - robot niveau 10 : ville 1 partie sur 3, forêt 1 sur 3 (avant : 2 sur 6) — même difficulté qu'avant, avec plus de monde (le rôdeur) et un chien qui ne sent que de près.
- **Tir à l'arc** (« encore un petit peu trop compliqué », pas encore validé) :
  - **les cibles sont réparties partout** (avant : toutes au même endroit) et **changent de place à chaque partie** : en haut, au-dessus de l'archer, en bas (on tire à l'horizontale), à droite. On tire au sort parmi des places fixes, le plus loin possible les unes des autres, jamais sur un obstacle, et le corbeau loin du ballon. Chaque cible est accrochée à quelque chose : **lampions** à un bras de fer (mur de la maison, corniche du clocher, lampadaire, tout bas) ; **cibles** pendues à un clou sur le clocher, ou au bout d'un poteau planté sur un toit (il plie un peu) ; **corbeaux** qui volent en huit à quatre endroits (au-dessus de l'archer, en bas à droite…) ;
  - **le ballon et le cerf-volant coincés ailleurs** (tirés au sort) : aux deux coins de la corniche du clocher, en haut du lampadaire, à la cheminée, au volet d'une fenêtre au-dessus de l'archer (penché, pour que la flèche croise la ficelle) ;
  - **rien de trop haut, surtout à droite** : mesuré, une flèche ne monte pas dans le coin en haut à droite sans tirer à fond ; toutes les places s'atteignent sans tirer à fond ;
  - **banderoles : tous les anneaux sont tenus au bout d'une perche** par quelqu'un, et la perche bouge un peu : **la dame à la fenêtre** (au-dessus de l'archer : toujours là), **le couvreur** assis sur le toit, **le sonneur** dans l'arche du clocher, **Basile** sur son échelle, **un enfant** sur la place (anneau tout bas), **le marchand** à sa fenêtre. L'anneau est noué au bout, ou pend au bout d'une ficelle, ou décrit un huit (le porteur agite sa perche). Le crochet est devenu **un petit anneau** ;
  - **le seau descend vraiment jusqu'en bas** (il se pose sur les pavés) : sa potence sort du mur du clocher (aux banderoles, du mât de la fête). L'enfant qui attend son ballon est maintenant devant la porte du clocher ;
  - **la pancarte qui se balançait est retirée** ; le plancher du peintre pend maintenant sous la corniche du clocher ; aux banderoles, le linge est entre la maison et le clocher (il cachait l'anneau de la dame), et le platane peut y être aussi. Mesure (`obstacles-tir.py`, refait pour les cibles qui changent de place) : les obstacles n'arrêtent plus que 1 à 5 % des tirs qui atteignent une cible ; dans une partie sur trente, une cible était gênée aux deux tiers ;
  - **niveaux 9 et 10 : un corbeau de moins** (remplacé par une cible fixe) ; les corbeaux se posent un peu moins souvent aux grands niveaux ;
  - **les tourterelles** passent partout dans le ciel ; **on peut les toucher : elles perdent des plumes et s'envolent pour de bon** (jamais blessées ; « Rrouhou ! Elle s'envole ! ») ; la suivante attend un peu. La flèche est perdue ;
  - **la flèche tirée à fond traverse une seule chose** (une cible, ou une tourterelle) **et s'arrête dans la suivante : 2 au plus** ; la ligne de visée le montre ;
  - **l'arc ne tremble plus que tiré à fond, au bout d'1,5 s** (niveau 4 et plus) ; on relâche un peu la corde, et la visée redevient normale (avant : il tremblait au bout d'un moment, à toutes les puissances) ;
  - robots niveau 10 : clocher 3 sur 3, cerf-volant 3 sur 3, banderoles 3 sur 3 ; banderoles niveau 5 5 sur 6.

### 12.48 Tir à l'arc : nouvelles règles et zone des cibles (Romain, 6 novembre, 14 h 30 et photo de 14 h 57) — construit le 6 novembre, mis en ligne à 15 h 37
Remplace ce que les §12.44 à §12.47 disaient du tir quand c'est contraire. Pas encore validé par Romain.
- **La zone des cibles** (photo entourée en rouge) : tout ce qu'on doit toucher est dans le ciel et sur les toits, à droite d'une courbe qui descend du haut de l'écran vers la maison à colombages, et au-dessus d'une ligne qui va du toit de cette maison jusqu'au flanc droit du clocher (mesuré : x > 92, y < 232 + 0,35 × (x − 107)). **Rien en haut à gauche, au-dessus de l'archer**, et rien en bas (fenêtres, lampadaire, porte du clocher). Aux banderoles, toutes les perches tendent leur anneau dans cette zone (la dame tend la sienne vers la droite).
- **Plus de cœurs : seulement des flèches.** Une flèche qui finit par terre (ratée, ou qui a touché un oiseau ou un corbeau posé, qui s'envolent) reste sur les pavés. **Quand le carquois est vide, un bouton jaune « Ramasser les flèches (n) »** les rend toutes, avec un bandeau doré (🔊). **Perdues** : celles plantées dans le décor (« trop haut ») et celles qui sortent de l'écran (sur les côtés ou par le haut, selon ce que l'appareil montre). Plus aucune flèche nulle part : perdu. Toucher le ballon ou le cerf-volant fait toujours perdre. Réserve : 4 flèches au niveau 1, 3 au niveau 3, 2 aux niveaux 6 à 10.
- **La difficulté, c'est la longueur de la ficelle** : × 1,8 au niveau 1, × 1,45 au niveau 4, × 1,15 au niveau 7, × 0,9 au niveau 10 (le ballon reste dans l'écran) ; la zone de touche de la ficelle va de 10 à 6,5. **Ballons et cerfs-volants noués le plus haut possible sur les toits** : aux deux coins de la corniche du clocher, en haut du pignon, à la cheminée de la maison à colombages, sur le toit de la maison de droite. Plus haut (le beffroi) : mesuré, presque aucun tir n'y arrive, même à fond. **Niveau 10 : 3 ballons ou cerfs-volants** (avec un corbeau et un lampion). Ils penchent du côté du vent, en retard (voir plus bas).
- **Les décors qui gênent sont entre l'archer et les cibles** : fixes — le plancher du peintre (sous le toit de la maison à colombages), l'enseigne du forgeron ; qui bougent — **le seau** (sa potence sort du coin entre les deux maisons de gauche, il descend jusqu'aux pavés), **le linge** (entre la maison de gauche et la maison à colombages), **la branche du platane** (le platane pousse derrière l'archer, sa branche avance au-dessus de lui et se plie avec le vent), **Basile qui traverse la place avec sa grande échelle** (penchée à 50 degrés, il entre par la droite, marche jusqu'au milieu, se retourne, repart, sort, revient ; toujours au même pas ; seule l'échelle arrête les flèches, elles passent devant lui ; aux banderoles, c'est un autre villageois). **Niveaux 1 et 2 : 1 décor qui bouge ; niveaux 3 à 8 : 1 fixe + 1 qui bouge ; niveaux 9 et 10 : 1 fixe + 2 qui bougent.** Le seau, le linge et l'échafaudage ne vont pas ensemble quand ils se touchent ; aux banderoles, pas de platane (il cacherait le haut du mât).
- **Une cible trop cachée est refusée** au tirage : la part des tirs (toutes forces, tous angles) qui l'atteignent sans toucher un décor fixe, la branche ou le linge doit dépasser 30 %. Mesure (`obstacles-tir.py`, à fond compris, la ficelle visée près du nœud) : chaque décor arrête 8 à 25 % des tirs, le linge un peu plus ; trois ensemble, 40 à 60 %.
- **Le vent se voit** : des feuilles traversent l'écran du côté d'où il souffle, **tout de suite** ; quand il tourne, elles ralentissent et repartent dans l'autre sens. **La branche, le linge et le cerf-volant ne suivent que 1,4 s plus tard** : on voit le vent changer, puis le décor se retourner, on peut prévoir. Pas de feuilles quand il n'y a pas de vent (niveaux 1 et 2).
- **Moins d'oiseaux** ; **le gros oiseau est un goéland** (blanc, ailes grises au bout noir, bec jaune), qui passe lentement (19 à 24 s pour traverser), de temps en temps (toutes les 12 à 17 s), dès le niveau 7. Touché : « Kiaou ! », il s'envole pour de bon, la flèche tombe.
- **La super flèche expliquée** : la jauge dit « Super flèche ×2 » ; sur la ligne de visée, **un « 1 » là où elle traverse, un « 2 » là où elle s'arrête** ; la première fois qu'on tire à fond, un bandeau : « Super flèche : elle traverse une chose, puis s'arrête dans la suivante. 2 d'un coup ! » ; l'animation d'accueil la montre traverser un corbeau (« 1 ») puis couper la ficelle (« 2 »). La consigne le dit aussi, avec la règle des flèches perdues et ramassées.
- Robots (ils ramassent les flèches ; ils visent la ficelle près du nœud) : niveau 10 clocher 2 sur 3, cerf-volant 3 sur 3, banderoles 3 sur 3 ; niveau 1 cerf-volant 3 sur 3, niveau 3 clocher 5 sur 5, niveau 6 banderoles 3 sur 3.
- **Retouches (Romain, 15 h 51, mises en ligne à 15 h 58)** : **la branche du platane se courbe deux fois plus loin vers la gauche** (et un peu plus haut) quand le vent souffle de droite à gauche, pour moins gêner ; vers la droite, elle ne change pas (« j'aime bien comment il se courbe à droite »). **Le plancher du peintre monte et descend** sur ses deux cordes (environ 60 de haut en bas, un aller-retour en 11 s, toujours au même rythme), jusqu'au-dessus du lampadaire ; il compte toujours parmi les décors « fixes » du tirage, donc au niveau 10 il peut y avoir 3 décors qui bougent.
- **Deuxième retouche (Romain, 16 h 14 et 16 h 16, mise en ligne à 16 h 32)** — remplace ce qui précède sur les décors :
  - **les décors qui gênent ne sont plus que trois : le seau, l'échafaudage et le grand arbre.** Le linge (« impossible : on ne peut pas faire passer la flèche »), l'enseigne du forgeron et Basile à l'échelle sont retirés (leur code reste, éteint) ;
  - **le seau et l'échafaudage sont chacun sur le clocher ou sur la maison à colombages, tirés au sort, jamais les deux sur le même bâtiment.** Le seau : sa potence sort du mur du clocher juste sous la corniche, ou du coin entre les deux maisons de gauche (aux banderoles, du mât) ; l'échafaudage : sous la corniche du clocher (ses cordes passent de chaque côté de l'horloge), ou sous le toit de la maison à colombages, côté gauche. **Les deux vont du plus haut possible jusqu'à la rue** et remontent, au même rythme (un aller-retour en 10,5 s) ; **quand les deux sont là, ils alternent** : l'un est en haut quand l'autre est en bas. Quand l'échafaudage descend devant la porte du clocher, l'enfant qui attend son ballon se met plus à gauche ;
  - **combien** : niveaux 1 à 3, le seau ou l'échafaudage ; niveaux 4 à 8, l'un des deux et le grand arbre ; **niveaux 9 et 10, le seau, l'échafaudage et le grand arbre** (aux banderoles, pas d'arbre) ;
  - **le grand arbre** : quand le vent souffle de gauche à droite, sa branche avance au-dessus de l'archer et gêne ; **quand il souffle de droite à gauche, elle se retourne complètement de l'autre côté du tronc et ne gêne plus du tout** (avec le retard du décor, 1,4 s après les feuilles). Une flèche dans le feuillage est perdue ;
  - « que ce soit possible d'y arriver » : une cible trop cachée par l'arbre est refusée au tirage ; le seau et l'échafaudage bougent tout le temps, il y a toujours un moment où le chemin est libre. Robots niveau 10 : 12 parties sur 12 (clocher, cerf-volant, banderoles) ; niveau 2 cerf-volant et niveau 5 clocher : 3 sur 3 chacun.
- **Troisième retouche (Romain, 16 h 43 ; envoyée à 16 h 55, en ligne à 18 h 18 : la publication de GitHub était bloquée)** — remplace ce qui précède sur l'arbre et le rythme :
  - **l'arbre reste en 2D et se balance** (« tu le fais tourner en 3D ») : tout l'arbre se penche autour du pied de son tronc, le tronc se courbe (plus en haut qu'en bas), le feuillage tourne d'un bloc. Vent vers la droite : il penche un peu à droite, sa grosse branche au-dessus de l'archer, il gêne ; vent vers la gauche : il se penche de 34 degrés vers la gauche, hors du chemin des flèches (on le voit encore au bord d'un téléphone). Toujours 1,4 s après les feuilles. Une flèche dans le feuillage s'y plante et est perdue ;
  - **le seau et l'échafaudage à des vitesses lentes et aléatoires** : chaque descente et chaque montée a sa propre durée (seau 5 à 9,5 s, échafaudage 4,5 à 8,5 s), avec un petit arrêt en haut et en bas (0,4 à 1,5 s) ; quand les deux sont là, l'un part d'en haut et l'autre d'en bas, puis chacun va à son rythme. Le programme est tiré au départ (comme le vent) : la visée et le robot savent où ils seront. Robots niveau 10 : 9 sur 9.

### 12.49 Les joueurs changent : un jeu « niveau 13 ans », dès 10 ans (Romain, 7 novembre, 14 h 17)
**Décision de Romain.** Le jeu n'est plus fait pour les jumeaux de 8 ans : il est pour **sa fille et ses cousins, 11 ans, bientôt 12** (avec Romain, Siham et sa sœur). Il sera annoncé **« à partir de 10 ans »**, mais on peut le faire **« niveau 13 ans »** : pas trop effrayant, **un peu de frayeur permise**, et **pas obligé de faire des trucs pour enfants**.
- **Remplace partout la règle « les enfants ont 8 ans : rien d'effrayant, des phrases courtes, des répliques drôles »** (consignes du projet, §12 et §13, notes de l'E3, PASSATION-E3). Ce qui parle de « 8 ans » dans la Bible (par exemple les dépositions au §9, le bon mélange joué par Alicia, la note « rien d'effrayant pour des enfants de 8 ans » de `E3-dialogues-et-trame.md`) est **à relire avec ce nouveau public** ; ces passages restent comme trace de ce qui était pensé avant.
- **Ce qui ne change pas** : les règles de Romain sur l'écran (boutons jaunes, 🔊 jamais automatique, textes d'aide racontés, pas de « Touche … », pas trop d'indices, pas de réponse trahie, pas de points d'action, minuteurs rares), les codes gelés de l'E1 et de l'E2.
- **Ce que ça pourrait changer (à discuter, rien n'est décidé ni construit)** : l'E3 et la suite peuvent avoir plus de mystère et un peu de peur (le donjon, la crypte, le maire à la bague de corbeau) ; les dialogues peuvent être moins « enfantins » ; les niveaux des mini-jeux réglés pour des 8 ans (tutoriels très guidés, leçons du geste) peuvent devenir plus exigeants ; le tutoriel de l'E1 peut aller plus vite.
- **Tranché le 7 novembre (§12.50)** : la coupe de lecture du Barde reste nécessaire (Romain : « même pour un adulte » ; le problème est la quantité, pas la difficulté des mots), elle est faite dans l'E2. Les 10 ans et plus jouent en mode « adulte » : la création et les Réglages demandent maintenant « Moins de 10 ans / 10 ans et plus ».

### 12.50 Le Barde lit un tiers de moins, et l'E2 prête pour l'E3 (Romain, 7 novembre, 14 h 36 : « vas-y, fais tout ça ») — construit, en ligne
**Le constat (compté dans `e2.js`)** : le Barde lisait environ 2 200 mots dans l'E2 (sans les saluts redits à chaque visite) : les réponses des villageois pour presque la moitié, les phrases aux portes pour un cinquième ; deux réponses sur trois dépassaient 25 mots. Après la réécriture : **environ 1 450 mots (−34 %)**, et les saluts ne sont plus dits qu'une fois. Les plafonds seuls ne donnaient que −25 % : il a fallu réécrire serré.

**Les règles, pour l'E2 et pour toutes les enquêtes suivantes (E3 comprise)** :
- une réponse = **2 phrases courtes au plus** ; une vérité (démasquée) = **25 à 30 mots au plus**, en gardant tous les faits utiles (on coupe l'émotion et ce que la carte montre déjà, comme les adresses) ;
- aux portes (Tendre l'oreille) : **une seule phrase, 15 mots au plus** ;
- **les signes des menteurs ne se lisent plus, ils s'épinglent** : le villageois dit « Je connais son truc : je te l'épingle », et **l'étiquette du liège porte le nom** (« Yeux baissés · 🤥 Margot ») au lieu de « signe » (`liege.js`, `aQui` : l'enquête en cours d'abord, sinon celle où l'étiquette est née). Relier au fil rouge devient du rangement, plus une devinette ; le Barde regarde son tableau pendant les interrogatoires (le bouton « 📌 Mon tableau » existe déjà) ;
- **le salut n'est dit qu'à la première visite** (`E.salutUneFois`, e2.js ; `salut` / `cleSalut` / `preparer`, barde.js ; clé `P.vus['salut:<pnj>:*']`) ; un salut de moment (`saluts.nuit`…) à la première visite de ce moment ; ensuite, rien sous le nom (le visage et les questions). « Occupé » n'est pas un salut : il se redit.

**Exemples avant / après (montrés à Romain)** :
- Margot, les secrets des menteurs (93 → 27 mots) : avant, « Quand Victor ment, il se mord la lèvre, très vite. Quand Tim ment… » pour six villageois ; après, « Ha ! Tu m'as bien eue… Tiens, mes secrets de tavernière : je te les épingle. Et surveille le petit Tim : il traîne au Vieux Chêne, ces jours-ci. » (la phrase sur Tim est un filet de sécurité : elle ouvre sa question).
- Gaspard, « Quelles nouvelles ? » (57 → 21) : « Odette, ma toute première cliente, n'est pas venue ce matin. Ça ne lui ressemble pas… Quelqu'un devrait aller voir chez elle ! »
- Tim, sa vérité (64 → 33) : « Au fond du trou, il y a une porte couverte de runes. J'y ai ramassé cette pierre : donne-la à ton Sage. Et ce matin, des ouvriers ont bouché le trou avec de gros rochers ! »
- Bastien aux portes (28 → 12) : « Allez, bois, Cocotte ! Tu n'as rien à craindre de cette eau rouge… »
- La phrase d'Iris (§13.10) raccourcie, l'astuce gardée mot pour mot : « Grrr… Les gens achètent mes bouquets sans même les sentir ! Celui qui prendra la peine de sentir mes fleurs, je lui ferai une réduction, foi d'Iris ! »

**Les autres retouches de l'E2 (à cause de l'E3)** :
- **La question de Fortuné sur Victor est retirée** (« il adore les contes de fées » : un leurre pour un dialogue qui n'existait plus). Le mot-clé « Vieilles légendes » du liège ne vient plus que de Gaspard ; `tools/partie2.py` adapté.
- **L'archive de l'E2 est écrite** (`E.archive`, e2.js), pour le Grand Livre du Sage à partir de l'E3 (§12.28) : rien de plus que ce que toute équipe apprend ou que la fin raconte (ni la crypte, ni le pot noir).
- **La poursuite de Tim : niveau 4 au plus** (avant : 5 pour un adulte ; 2 pour un moins de 10 ans, inchangé). Nouveau champ d'un point : `mjNiveauMax` (moteur-actions.js `options.niveauMax`, mj-core.js `MJ.reglages(…, {max})`). L'oie du festin de l'E3 (même moteur) se réglera à sa construction.
- **Les 10 ans et plus en mode « adulte »** : « Qui va jouer ? » propose « 🧒 Moins de 10 ans » / « 🧑 10 ans et plus » (création et Réglages, moteur-ecrans.js ; mêmes valeurs `enfant` / `adulte`). Une tablette déjà créée en « enfant » se change dans ☰ → Réglages.
- **Décidé, rien à construire dans l'E2** : pas de questions à choix en plus dans l'E2 (ça rajoute de la lecture ; l'E3 en a quatre grandes) ; on ne touche pas au Sage et à l'Alchimiste de l'E2 ; l'or des missions bonus se décidera avec la boutique ; **la canne d'Odette : c'est l'E3 qui la met d'office dans le sac du Barde** (depuis que le Sage accuse quand il veut, une équipe peut finir l'E2 sans l'avoir trouvée).

Vérifié : `verif.js` « Tout est bon », `tuto.py` sans échec, `partie2.py` (exiger et tendre) sans échec, codes E1/E2/E3 identiques, un essai Playwright (le salut une seule fois, l'étiquette « 🤥 Margot », Tim au niveau 4, l'archive). Mis en ligne le 7 novembre à 14 h 57 (commit 9d58dd3, version 20261107-1357).

### 12.51 iPhone : « Accès facile » dans la course-poursuite ; talents, objets et potions à refaire (Romain, 8 novembre, 10 h 06)
**Le bug (construit, en ligne)** : sur iPhone, dans la course-poursuite, glisser le doigt vers le bas pour se baisser, jusqu'au bord de l'écran, déclenche « Accès facile » (tout l'écran descend à mi-hauteur) : on ne peut plus jouer. **Une page web ne peut pas désactiver cette fonction de l'iPhone.** Ce qui est fait : sur iPhone et iPad (`html.mj-ios`, mj-core.js), les mini-jeux en plein écran verrouillé gardent **une bande vide de 44 px au-dessus du bord du bas** (en plus de la barre de l'iPhone ; mj-core.css), pour que le doigt n'arrive jamais au bord ; la course-poursuite refuse aussi tout geste du navigateur pendant le glissé (`touchmove` avec `preventDefault`, mj-pisteur-alchi.js). Les autres appareils ne changent pas. **La solution sûre, sur l'iPhone lui-même** : Réglages → Accessibilité → Toucher → Accès facile, désactivé. Vérifié : rapide.sh vert, partie2.py sans échec, codes E1/E2/E3 identiques, la poursuite à la taille d'un iPhone 13 (bande en bas, se baisser marche) et d'un Android (inchangée). Mis en ligne le 8 novembre (commit 935b106, version 20261108-0916).

**Les décisions de Romain sur l'enquête 3 (§13.11)** : le Livre d'or de la fête, **oui** ; les cueillettes de l'Alchimiste, **oui** ; le coup d'œil du Pisteur au clocher, il ne voyait pas ce que c'était (réexpliqué, en attente) ; la recette qui ronge la rouille, à faire **avec toutes les potions** ; la page de la porte des Fondateurs, pas encore de réponse.

**Le prochain chantier de conception (Romain : « ça, c'est aussi un truc qu'on peut faire maintenant »)** :
- **refaire tous les talents du Pisteur, de l'Alchimiste et du Sage** (ceux de `donnees.js` datent d'avant les décisions des 3-5 novembre : plusieurs parlent d'actions en plus, de la grille de déduction retirée, du Corbeau) ;
- **refaire les objets de la boutique du Pisteur, de l'Alchimiste et du Sage**. **Le Barde, lui, est complet** : ses talents (§12.5) et ses objets, conçus avec l'enquête 3 (**§13.9** : 8 objets de 70 à 115 pièces, et la vieille clé rouillée à 320). Ses objets **ne sont pas encore dans le jeu** : la boutique montre encore les 20 anciens (`donnees.js`) ; il reste seulement à les construire. (Correction du 8 novembre, 10 h 49 : Claude avait d'abord dit à tort que les objets du Barde étaient à refaire, en ne regardant que `donnees.js`.) Vérifié le 8 novembre : presque aucun « accès » donné par un ancien objet n'est utilisé par les enquêtes 1 et 2 ;
- **créer toutes les potions** de l'Alchimiste, celles du donjon de l'enquête 3 comprises (lumière, soin, fumigène, poudre éclairante, rapidité, invisibilité…) et celle qui ronge la rouille ; aujourd'hui, 10 recettes existent (`D.POTIONS`, `D.RECETTES`), aucune n'a d'effet dans un donjon.
**Le modèle à suivre pour les trois autres rôles = celui du Barde (§13.9)** : des objets qui changent la façon de jouer le rôle (pas seulement « un mini-jeu plus facile »), un texte de boutique d'une phrase, des prix de 70 à 115 pièces pour les objets courants (le plus utile est le plus cher), un objet rare et très cher lié à l'histoire, et l'or compté pour qu'on en achète environ un toutes les deux enquêtes.
**Aussi construit le 8 novembre, 10 h 42 → 10 h 55 (bug du chaudron, niveau 10)** : quand on se trompait, la phrase d'erreur (« Trop tard ! Le carré est sorti de la zone. ») se posait sur la rangée des caisses d'ingrédients et empêchait de verser le suivant. Maintenant, elle s'affiche toujours **en haut de la scène, sous les caisses, à gauche de la jauge** (mj-chaudron.js `montrerOups` ; la flèche montre la caisse touchée, pas de flèche pour un carré oublié, `.sans-fleche`) ; « Plus de cœur » s'y met aussi, à sa place (`U.plusDeCoeur(el, {sous, aGauche})`, mj-core.js), jamais sur la recette ; les deux s'effacent avant l'écran du résultat. Vérifié (iPhone 13, iPad mini, niveau 10 : aucun message sur les caisses ni la recette ; rapide.sh, partie2.py, codes identiques) ; en ligne (commit 1938976, version 20261108-0955).
**Le donjon d'abord (Romain, 8 novembre, 11 h 17 : « il faut qu'on travaille ce fameux donjon… commencer juste par faire des images »).** La méthode proposée pour ne pas perdre de temps sur de mauvaises pistes : (1) des **images fixes** de trois directions très différentes **du même moment**, dessinées avec les vrais héros du jeu (ce qu'il voit est ce qu'on peut construire) ; Romain choisit ou mélange ; (2) 3 ou 4 images de plus dans la direction choisie (exploration, piège, combat, la porte aux quatre signes) ; (3) **une seule salle cliquable**, sans vraies règles, à essayer à plusieurs sur une tablette (le tour par tour sur un seul écran est-il agréable ?) ; (4) seulement ensuite la fiche des règles (salles, animaux, potions, talents) et la construction. À chaque étape, Romain dit « j'aime / j'aime pas, et pourquoi » avant de passer à la suivante. **Étape 1 faite** (`jeu/donjon/maquettes/` : `maquettes.js`, `rendre.py`, `donjon-A/B/C.png`), le moment montré : la salle 2, deux rats géants, la torche aux deux tiers, au tour de l'Alchimiste :
- **A « Le couloir »** (façon Darkest Dungeon, tablette couchée) : vue de côté, les trois héros en file face aux monstres, la torche du Pisteur éclaire, le noir autour ; anneau doré sous le héros qui joue ; ses actions en gros boutons jaunes en bas ; la phrase du conteur en bulle.
- **B « La coupe »** (tablette debout) : le sous-sol vu en tranche sous le village en fête ; les salles déjà vues éclairées, ce qu'on ne connaît pas dans le noir (des yeux qui brillent) ; en bas, le conteur et les choix (« le souffle glacé » / « l'odeur de crapaud ») que le Sage tranche avec son plan ; les combats se feraient en zoomant dans la salle.
- **C « Les cartes »** (tablette debout) : le combat comme un jeu de société ; cartes des monstres en haut (force en losanges, ce qu'ils vont faire : « va mordre la Sage »), cartes des héros au milieu (cœurs, celui qui joue se soulève), les actions du héros en grandes cartes en bas.
**Romain a choisi la direction A, façon Darkest Dungeon** (8 novembre, après avoir regardé des images du vrai jeu) et a demandé : des héros **légèrement de profil, en position d'attaque** (pas de face) ; **un vrai décor** (pas une couleur unie) ; **un vignettage sombre** ; **sous les personnages, une grande bande noire** qui montre **toutes les potions possibles, selon le héros qui joue**. **Fait le 8 novembre, 11 h 45** (`jeu/donjon/maquettes/combat.js`, `rendre2.py`, `combat-pisteur/alchimiste/sage.png`, tablette couchée 960 × 540) : le même combat (la crypte, salle 2 sur 3, deux rats et une araignée) vu aux trois tours.
- **Les héros, dessinés à la main pour le donjon** (de trois quarts, dans le style du jeu) : la Pisteuse tend son arc, l'Alchimiste lève une fiole de feu, la Sage tient le livre ouvert et fait briller une rune. Ce ne sont pas encore les héros personnalisés (`Persos`) : il faudra des poses pour chaque sexe, coiffure et peau, ou se limiter à quelques variantes.
- **Le décor** : arches, escalier qui s'enfonce, piliers gravés de runes cyan (la ville d'avant), torche murale, chaînes, racines, toiles, flaque, brume ; vignettage noir. En haut : le nom de la salle, la jauge de la torche, « 🗺️ Le plan : chez le Sage », la phrase du conteur avec 🔊. Anneau doré et flèche sur le héros qui joue, les deux autres assombris ; cœurs sous les héros, barres rouges sous les monstres.
- **La bande noire** : à gauche, le portrait du héros qui joue (nom, niveau, cœurs, place : devant / au milieu / derrière) ; au milieu, **ses 3 gestes** (Pisteur : Flèche, Tir visé, Changer de place ; Alchimiste : Lancer une fiole, Herbes, Changer de place ; Sage : Rune de lumière, Bouclier de runes, Changer de place) ; à droite, **le sac de l'Alchimiste, partagé** : 8 potions proposées, avec leur nombre (Fiole de feu « brûle un monstre », Fumigène « les monstres ratent », Acide « ronge la rouille », Lumière « ravive la torche », Baume « rend un cœur », Cœur vaillant « relève un ami », Rapidité « rejoue aussitôt », Invisibilité « plus visé un tour »). Les potions **à lancer** (feu, fumigène, acide) sont grisées avec un 🔒 pour le Pisteur et le Sage (« lui seul sait lancer ») ; les autres, tout le monde peut les boire. Une potion épuisée (×0) est grisée.
- **Tout cela est une proposition à valider**, pas une décision : les gestes, les 8 potions, le sac partagé, les potions à lancer réservées à l'Alchimiste.
**Retour de Romain sur ces images (8 novembre, 11 h 58), et ce qui est décidé :**
- **La tenue de combat** : au moment d'aller dans la crypte, dans l'histoire, chacun enfile une tenue de combat. C'est ce qui fait le raccord entre le héros de chaque joueur et le héros du donjon. Mise en image par Claude : une tenue par rôle, **avec capuche** (Pisteur : capuche verte, gilet de cuir cousu, brassards, dague ; Alchimiste : capuche violette, lunettes d'alchimiste relevées, tablier de cuir roussi, bandoulière de fioles, gants ; Sage : capuche et manteau bleus brodés d'or et de runes, pèlerine, lunettes s'il en porte). La capuche cache la coiffure : il ne reste à reprendre du héros du joueur que **la couleur de peau, de cheveux et d'yeux, et fille / garçon** (cils ; queue de cheval de la Pisteuse, tresses de la Sage), ce qui se dessine facilement. Vérifié en image (`combat2-autres.png` : d'autres joueurs, filles et garçons échangés).
- **Plus de torche** (Romain : « je n'ai pas envie de trop copier ») : la jauge et la potion « Lumière » disparaissent. La lumière vient d'une grille au plafond (la lune), des runes et de champignons qui luisent. Rien ne presse plus les joueurs : c'est voulu (pas de minuteur).
- **Plus de détails** dans le décor et sur les héros (dégradés, grain, coutures, rivets) : fait. Décor : rayon de lune et poussière, pierre des quatre signes au-dessus de l'arche (l'œil, le chaudron, la lyre, l'étoile), vieille bannière déchirée, niche avec une urne, des bougies et un vieux crâne, mousse, fissures, racines, chaînes, toiles, deux yeux rouges au fond d'une arche, pièces et os par terre.
- **Peu de choses à gérer au premier donjon** : chaque héros a **2 gestes** et **des cases « ? »** (des talents à découvrir plus tard) ; **2 objets chacun** au début (2 ou 3 au plus, davantage plus tard), avec une case « plus tard » fermée. « Changer de place » est retiré.
- **Proposition de Claude, à valider** : gestes (Pisteur : Flèche, Coup de dague ; Alchimiste : Herbes, Coup de louche ; Sage : Rune de lumière, Bouclier de runes) ; objets (Pisteur : Flèches de feu ×2, Baume ×1 ; Alchimiste : Fiole de feu ×2, Fumigène ×1 ; Sage : Baume ×1, Cœur vaillant ×1).
- **Les codes avant le donjon (en discussion)** : Romain propose plusieurs codes (tenue, potions, armes) ou un seul grand code pour tout. Avis de Claude : un seul grand code pour toute l'équipe est impossible (le donjon se joue sur la tablette du Pisteur, et aucune tablette ne connaît les héros des autres) ; un code par chose, c'est trop. **Proposé : un code par joueur**, affiché sur sa tablette quand il enfile sa tenue (son allure + ses 2 objets ; pour l'Alchimiste, aussi les potions qu'elle donne aux autres) ; le Pisteur tape les 2 codes (Alchimiste, Sage) sur son écran « Descendre », puis un écran montre les trois héros en tenue pour que chacun vérifie. Environ 6 symboles par code (l'allure tient en 3 symboles sur 12). C'est un code de plus que prévu (le sac de l'Alchimiste, §13.6 point 7, qui passe de « jusqu'à 19 potions » à « 2 objets par héros »).
- Images : `jeu/donjon/maquettes/combat2.js`, `rendre3.py` → `combat2-pisteur/alchimiste/sage/autres.png` (8 novembre, 12 h 10).
**En attente de Romain** : son avis sur ces images ; le code par joueur ; qui choisit les 2 objets de chacun (proposé : l'Alchimiste répartit ses potions sur sa tablette). Ensuite, l'étape 2 (3-4 images : un couloir avec une curiosité, un piège, le plan sur la tablette du Sage, la porte aux quatre signes).
Ce qui est déjà décidé et s'applique : 5 talents aux niveaux 2, 4, 6, 8 et 10, deux choix à chaque fois, chacun utile plusieurs fois par mission, aucun ne dépendant d'un choix précédent ; une vingtaine d'objets par rôle (chacun ne voit que les siens), certains très puissants et chers, 4 ou 5 achetables sur toute l'aventure, des combinaisons objets / talents à découvrir ; équipement visible sur le héros ; épreuve finale (E10) où tous utilisent talents et objets. **Rien n'est conçu ni construit avant le go de Romain.**

## 13. Enquête 3 — La lettre d'Odette

### 13.1 L'histoire, pour nous (jamais montrée telle quelle aux joueurs)

- **À l'aube**, le maire réunit le village sur la place et lit une lettre « d'Odette » :

  > Mon cher Monsieur le maire, ne vous faites pas de souci pour moi : je suis partie quelques jours chez ma sœur, de l'autre côté de la forêt. Je vais très bien et je reviendrai la semaine prochaine. Je ne retrouve plus ma canne : si quelqu'un la trouve, qu'il la rapporte chez moi, au 2, rue des Lanternes. Je vous embrasse tous. Odette.

  Ravi, il annonce une grande fête cette nuit sur la place, jusqu'à minuit. Tout le village est rassuré, sauf l'équipe : la canne d'Odette a été trouvée près des rochers du Vieux Chêne (enquête 2).
- **La lettre est fausse.** C'est **Mélusine** qui l'a écrite. Elle n'a plus un sou depuis l'enquête 2 ; un homme en cape noire, à la voix étouffée, qui sentait la lavande, lui a donné de l'or et lui a dicté la lettre mot pour mot. Elle ne sait pas où est Odette et s'en veut énormément.
- **Odette est vivante**, enfermée sous le clocher, derrière la grande porte aux quatre signes, dans le grand complexe souterrain. Moustache, son chat à six doigts, la retrouve toujours.
- **Léo Mouture**, l'apprenti du meunier, lui passe le pain et la soupe par une petite trappe, tous les soirs. L'homme en cape l'a payé en or ; Léo est terrifié. Il n'a pas de clé de la porte.
- **L'homme en cape est le maire, Monsieur Grosbec** : il porte une bague à tête de corbeau. **Il ne ment jamais** : il dit seulement « J'ai reçu cette lettre ». Il veut tout le village sur la place jusqu'à minuit.
- **La fin**, la même pour tous : à minuit, la Grosse Marie sonne la fin de la fête ; le maire descend dans la crypte avec Silas et deux gardes, retire ses gants, la bague à tête de corbeau apparaît : « Vous êtes allés trop loin. Beaucoup trop loin. Gardes ! Enfermez-les ! » Les héros finissent au cachot de la mairie ; une plume noire se pose devant la grille. **L'enquête 4 commence là.** Silas a l'air aussi surpris que les héros (ça prépare son alibi pour l'enquête 4). Rien d'effrayant pour des enfants de 8 ans : personne n'est blessé, Odette va bien.

### 13.2 La journée en trois moments

- **Le matin — les préparatifs.** Le maire lit la lettre « d'Odette » et annonce la fête de cette nuit. L'écran des missions donne à chacun sa mission de fête. Le Barde fait son marché aux fleurs. En passant, les villageois du matin sèment les premiers doutes et les indices sur le maire.
- **L'après-midi — l'enquête.** On rend les missions au maire. Le Barde obtient la lettre (grand dialogue du maire). Le Sage et l'Alchimiste prouvent qu'elle est fausse et remontent jusqu'à Mélusine, qui avoue. Le Pisteur suit Moustache et trouve deux pistes : la crypte du clocher et le vieux puits. Tout le monde se prépare pour la nuit.
- **La nuit — l'aventure.** Tout le village est à la fête sur la place : c'est la couverture. On prend la clé d'Anselme, ou on passe par le puits. Le donjon, à trois. Le grand complexe sous le clocher, la porte scellée, Moustache qui gratte et la voix d'Odette derrière. Léo, coincé dans la dernière salle, puis interrogé. L'accusation. Puis le maire surgit et enferme tout le monde.

**Durée visée : environ 1 h 15** (Romain, 6 novembre, 1 h 34) : l'ouverture 4 minutes, le matin 19, l'après-midi 20, la nuit 30. Recalculé après les derniers changements : environ 1 h 18. L'après-midi monte à 25 minutes à cause de l'Alchimiste, dont les potions sont comptées 2,5 minutes chacune sans avoir été mesurées ; le Barde seul y tient en 22 minutes. La nuit dure 27 minutes par le clocher et 32 par le puits. (Hypothèses : lecture à 150 mots par minute, 10 secondes par question choisie, 30 secondes par étape de grand dialogue, durées des mini-jeux mesurées dans `tools/proba-minijeux.json`, 3 minutes de discussion par moment.)

### 13.3 Ce que fait chaque rôle

| Rôle | Le matin | L'après-midi | La nuit |
| --- | --- | --- | --- |
| Barde | Le maire apparaît et donne l'argent ; le marché aux fleurs (Fortuné, puis Iris et Basile). Les villageois du matin : premiers doutes, indices pour le maire, Repérer le mensonge (Margot, Victor, Fortuné, Tim). | Rend les fleurs au maire. Grand dialogue du maire : la lettre (code pour le Sage). La maison d'Odette : il dépose la canne, prend le carnet d'Odette, Moustache file (code pour le Pisteur). Fait avouer Mélusine. Récolte les indices pour Anselme et pour Léo. Écoutes. | Grand dialogue d'Anselme au clocher, au début de la nuit, avant qu'il sonne l'ouverture de la fête. Quelques mots à la fête. Le grand dialogue de Léo, dans la crypte, dès que l'équipe l'a coincé (code « Léo attrapé » du Pisteur). |
| Pisteur | Ses deux jeux de fête : les banderoles (Tir à l'arc) et l'oie échappée de chez Gaspard (Course-poursuite en ville). | Les traces de Moustache (Suivre la piste) : des traces de chats partout, il faut trouver celles à six doigts. Elles mènent à deux endroits : sous la porte de la crypte, fermée à clé, et à la vieille grille rouillée du puits. Il peut aussi aller chercher la lettre en se cachant dans la mairie (Se cacher), si le Barde rate le maire. | Décroche la clé d'Anselme pendant qu'il sonne (Se cacher), ou ouvre la grille du puits avec la potion. Tape le sac de l'Alchimiste pendant le grand dialogue d'Anselme. Mène le donjon (court : 8 à 10 minutes ; long : environ 15). Devant la porte scellée, Moustache gratte et une voix répond (code pour le Sage). Dans la dernière salle, Léo est coincé (code « Léo attrapé » pour le Barde). |
| Alchimiste | Le gâteau de la fête, d'après la commande de Gaspard (assembler selon une commande, noté en étoiles). | Compare les écritures : la lettre, le carnet d'Odette et le Livre d'or de la fête (mini-jeu des ressemblances) : c'est l'écriture de Mélusine. La lettre sent la lavande (mais tout le village a les sachets d'Iris). Prépare les potions du donjon (lumière, soin, fumigène…) et, pour la piste du puits, la potion qui ronge la rouille. | Compose son sac pendant le grand dialogue d'Anselme et le donne au Pisteur (code à 6 symboles, puis écran de vérification). Joue son héros dans le donjon, avec ses potions. |
| Sage | Le tableau d'Odette et de ses chats (Assembler les runes, niveau 10). Reçoit les premiers doutes (Victor : pas de timbre ; Tim : le capuchon vers le clocher). | Reçoit la lettre et le carnet : ce n'est pas l'écriture d'Odette. Prend le Livre d'or de la fête à la mairie, pour l'Alchimiste. Lit le carnet : Moustache a six doigts (code pour le Pisteur). Dans ses archives : le parchemin des souterrains du puits, à déchiffrer (L'alphabet secret), et une page sur la porte des Fondateurs aux quatre signes. | Guide le donjon avec le plan : le Pisteur ne voit que les embranchements, le Sage dit le chemin à voix haute. Joue son héros (incantations, Grand Livre, bouclier de runes). Reçoit « Odette est derrière la porte » (code du Pisteur). Accuse, puis répond à la question du Corbeau. |

### 13.4 Les deux pistes du Pisteur, et le donjon

- **La piste du clocher.** Les traces à six doigts s'arrêtent sous la porte de la crypte, fermée à clé. La clé ne quitte jamais la ceinture d'Anselme le jour ; quand il sonne, il l'accroche au clou près de la corde. La nuit, si le Barde réussit le grand dialogue d'Anselme (environ une chance sur deux avec les indices), il l'aide à sonner l'ouverture de la fête, et le Pisteur décroche la clé. Donjon court : 3 salles, puis la porte et Léo, 8 à 10 minutes en tout.
- **La piste du puits.** Les traces s'arrêtent aussi à la vieille grille rouillée du puits : Moustache passe entre les barreaux. Il faut la potion de l'Alchimiste qui ronge la rouille et le parchemin déchiffré par le Sage. Donjon long, en labyrinthe : 6 salles, puis la porte et Léo, environ 15 minutes.
- L'après-midi, l'équipe peut préparer les deux, sans savoir laquelle marchera. Les deux arrivent au même endroit : le grand complexe sous le clocher.

**Le donjon** (nouveau moteur, réutilisable dans les enquêtes suivantes ; la fiche complète reste à écrire) :

- Façon Darkest Dungeon : vue de côté, les trois héros en file (Pisteur, Alchimiste, Sage), des salles reliées par des couloirs, ~~une torche qui baisse~~ (retirée par Romain le 8 novembre : §12.51), des combats au tour par tour, des animaux (rats géants, chauves-souris, araignée des caves, gros crapaud du puits) et des pièges.
- Tout se joue sur la tablette du Pisteur : chacun touche l'écran à son tour (« À toi, Alchimiste ! »). Le plan reste sur la tablette du Sage. Aucun code pendant les combats.
- Le sac de l'Alchimiste : un seul code, à 6 symboles, composé et tapé pendant le grand dialogue d'Anselme (sur l'écran « Descendre » du Pisteur), puis un écran qui montre le sac reçu pour vérifier.
- Personne ne meurt : un héros tombé est « sonné ». Si les trois le sont, ils remontent à l'entrée et recommencent. L'enquête n'est jamais bloquée.
- Au bout : le grand complexe. L'avant-dernière salle : la porte scellée aux quatre signes ; Moustache gratte et miaule, une voix étouffée répond « Moustache ? Mon gros gris, c'est toi ? » (code du Pisteur pour le Sage). La dernière salle : Léo, avec sa lanterne et son panier ; il est coincé, pas de poursuite. On le remonte dans la crypte, et son grand dialogue commence tout de suite, sans les 4 questions.
- Plus tard : une liaison entre tablettes (Wi-Fi ou son), à tester dans la salle de test. Les codes restent toujours en secours.

### 13.5 L'accusation et la fin

- **QUI a écrit la fausse lettre ?** Mélusine (choix : Mélusine, Margot, Iris, Victor, Fortuné).
- **OÙ est Odette ?** Sous le clocher, derrière la porte aux quatre signes (choix : sous le clocher, au fond du puits, au moulin, au Vieux Chêne).
- **Question bonus, sans cœur : QUI est le Corbeau ?** (Grosbec, Silas, Fortuné).
- **La fin, la même pour tous :** à minuit, quand la Grosse Marie sonne la fin de la fête, le maire surgit dans la crypte, retire ses gants, la bague à tête de corbeau apparaît : « Gardes, enfermez-les ! » Les héros finissent au cachot de la mairie : l'enquête 4 commence là. Ce que Léo a avoué change seulement quelques répliques et un bonus.

Le grand dialogue de Léo a quatre fins (aucune étape réussie, une, deux, les trois). Elles changent seulement quelques répliques de la scène finale et un bonus de 10 pièces d'or pour le Barde (aveu complet). L'enquête n'est jamais bloquée : dans tous les cas, on passe à l'accusation.

### 13.6 Ce qu'il faut construire de nouveau

1. **L'écran des missions du maire**, juste après la lettre, pour tous : le gâteau (Alchimiste), le tableau d'Odette (Sage), les banderoles et l'oie (Pisteur), les fleurs (Barde). Les missions restent ouvertes jusqu'à la fin de l'après-midi, où chacun rend la sienne au maire contre de l'or.
2. **Le marché aux fleurs du Barde**, au tout début du matin (détail complet en §13.6 bis ci-dessous).
3. **Les grands dialogues à étapes** : le maire (l'après-midi, la lettre, 3 étapes), Anselme (la nuit, au clocher, la clé de la crypte : 4 questions puis 3 étapes, environ une chance sur deux avec les indices), Léo (la nuit, dans la crypte : pas de questions, 3 étapes, 4 fins). Les indices (« rubans ») se récoltent chez les autres villageois. Règles en §13.8.
4. **Exige la vérité et la potion de vérité dans un grand dialogue** : elles démasquent les mensonges des questions (et le mensonge d'entrée de Léo), jamais les étapes. Pour les étapes, il faut gagner la confiance du personnage.
5. **Les villageois « occupés »** : touchés, ils lancent une petite phrase drôle (une deuxième s'il revient). Ça ne compte pas comme une visite. Le matin : Mélusine, Iris, Anselme, Farinel, Silas, Basile (Iris et Basile vendent quand même leurs fleurs). L'après-midi : Gaspard, Victor, Iris (seulement « Je voudrais des fleurs pour la fête », s'il reste de l'argent) et le voisin d'Odette.
6. **Les écoutes de Tendre l'oreille** pour les trois moments : à deux quand deux villageois sont proches, sinon une phrase dite tout seul. Certaines donnent un vrai indice, d'autres font juste rire.
7. **Le sac de l'Alchimiste** *(à revoir, 8 novembre, §12.51 : 2 objets par héros au début, et un code par joueur proposé)* : elle choisit ce qu'elle emporte dans ses potions (jusqu'à 19 potions, de 8 sortes au plus) ; son écran affiche **un seul code à 6 symboles**. Le Pisteur le tape sur son écran « Descendre » (ou choisit « Descendre sans potions »), puis un écran montre le sac reçu et l'Alchimiste vérifie. Ces codes ne marchent que sur cet écran. Pour ne faire attendre personne, le sac se compose et se tape **pendant le grand dialogue d'Anselme**.
8. **Le donjon** (§13.4). Pas de code pendant les combats : tout se joue sur la tablette du Pisteur, chacun touche l'écran à son tour. Le plan reste sur la tablette du Sage, qui dit le chemin à voix haute.
9. **Les mini-jeux nouveaux ou en variante** (d'abord visibles dans la salle de test, comme décidé le 4 novembre) :
   - Assembler selon une commande (nouveau moteur réutilisable, noté en étoiles) : le gâteau à sept étages de Gaspard ;
   - Tir à l'arc, décor de fête : une banderole de petits drapeaux part avec chaque flèche ;
   - Course-poursuite en ville : l'oie du festin, vue de dos ;
   - Suivre la piste, version traces de chats : trouver les traces à six doigts au milieu de celles des sept chats ;
   - Les ressemblances (variante des 7 différences) : les écritures du village comparées à la lettre ;
   - Assembler les runes, version tableau, niveau 10 : le tableau d'Odette et de ses chats ;
   - et les mini-jeux existants : Repérer le mensonge (Barde), Se cacher (mairie, clocher), Le chaudron (potions du donjon, potion qui ronge la rouille), Les bulles magiques (l'odeur de la lettre), L'alphabet secret (le parchemin des souterrains).
10. **La Lanterne du veilleur** (objet du Barde) : son dialogue de nuit chez le voisin d'Odette.

#### 13.6 bis Le marché aux fleurs du Barde (consignes de construction)

1. L'écran des missions du maire s'affiche pour tout le monde, avec le bouton « Commencer l'enquête 3 ». Les autres rôles commencent leur journée ; leur mission (gâteau, tableau, banderoles et oie) reste ouverte jusqu'à la fin de l'après-midi.
2. Sur la tablette du Barde, 2 ou 3 secondes après, le maire arrive en plein écran comme si on l'avait touché : il donne 10 pièces et demande au moins 10 bouquets pour la fête. Cette apparition ne compte pas comme une visite (pas de « Encore vous ? » ensuite).
3. Deux compteurs apparaissent sur la carte du Barde : l'argent (10) et les bouquets (0 sur 10).
4. La carte reste ouverte, mais Iris et Basile ne sont pas encore affichés. Fortuné porte une bulle 🌸.
5. Avec Tendre l'oreille, toucher Fortuné joue d'abord la scène de Silas avec Fortuné (le chapeau du maire, puis la pendule vendue deux fois plus cher), puis le marchandage.
6. Le marchandage de Fortuné se fait en 3 étapes, texte complet plus haut. Il coûte toujours au moins 2 pièces. Les 4 bouquets en papier comptent pour 0 : ils se déchirent chez le premier vrai fleuriste. La lanterne peut être gratuite, à 1 pièce ou à 2 pièces selon le chemin, ou ne pas être obtenue. Pas de bouton « il ment ». Si le Barde revient se plaindre : « ni reprise ni échangée ».
7. Il faut créer une image spéciale pour l'étape 2 : Fortuné penché sur sa carriole, la bâche soulevée, des bouquets en papier, et une vieille lanterne de cuivre cabossée qui dépasse et brille. Aucun texte ne la décrit.
8. Pendant le marchandage de Fortuné, Iris et Basile apparaissent discrètement sur la carte.
9. Le matin, Iris et Basile ne font que vendre : leur dialogue commence directement par les 4 façons de marchander. Ensuite, ils redeviennent occupés, et leurs questions d'enquête restent pour l'après-midi. L'après-midi, s'il reste de l'argent, « Je voudrais des fleurs pour la fête » est une de leurs questions, au prix déjà obtenu ; Iris, occupée par ses couronnes, n'a plus que celle-là.
10. Un vendeur fâché ne vend plus rien de la journée.
11. L'après-midi, quand le Barde rend sa mission, le maire compte les bouquets et réagit selon le nombre (tableau plus haut). Si le Barde a la lanterne, il ajoute 5 pièces d'or et fait son lapsus (« Une lanterne… comme celle que… Euh. »). Les compteurs disparaissent ensuite.
12. Récompense : 10 pièces d'or pour 10 ou 11 bouquets, 5 pour 9, rien en dessous, et 5 de plus pour la lanterne. Au maximum, 15 pièces d'or.

### 13.7 Tous les codes de l'enquête 3

Le détail (où et comment chaque code s'obtient) est dans `E3-actions-des-roles.md` et `E3-dialogues-et-trame.md`. Les codes de « Mission de fête » se rendent au maire l'après-midi ; « Le code de la nuit » est donné par le Sage, comme à chaque moment.

#### Le matin

| De | Code | Pour | Note |
| --- | --- | --- | --- |
| Barde | La lettre n'est pas passée par la poste | Sage | Victor |
| Barde | Le capuchon vers le clocher | Pisteur, Sage | Tim, démasqué |
| Pisteur | Mission de fête (1 sur 2) | tout le monde | rendue au maire l'après-midi |
| Pisteur | Mission de fête (2 sur 2) | tout le monde | rendue au maire l'après-midi |
| Alchimiste | Mission de fête | tout le monde | rendue au maire l'après-midi |
| Sage | Mission de fête | tout le monde | rendue au maire l'après-midi |
| Sage | Les écritures du village | Alchimiste | pour comparer avec la lettre |

#### L'après-midi

| De | Code | Pour | Note |
| --- | --- | --- | --- |
| Barde | La lettre d'Odette | Sage, Alchimiste | le grand dialogue du maire |
| Barde | Le carnet d'Odette | Sage, Alchimiste | chez Odette |
| Barde | Les traces de Moustache | Pisteur | chez Odette |
| Barde | L'aveu de Mélusine | Sage |  |
| Pisteur | La lettre d'Odette | Sage, Alchimiste |  |
| Pisteur | La crypte est fermée | Barde | il faut la clé d'Anselme |
| Pisteur | La grille du puits | Alchimiste, Sage | une potion pour la rouille, et les archives des souterrains |
| Alchimiste | L'écriture de Mélusine | Barde, Sage | chez Mélusine, le Barde peut lui dire « C'est votre écriture » |
| Alchimiste | La potion qui ronge la rouille | Pisteur | à donner la nuit, au puits |
| Sage | Moustache a six doigts | Pisteur | pour reconnaître ses traces |
| Sage | La recette qui ronge la rouille | Alchimiste |  |
| Sage | Le code de la nuit | tout le monde |  |

#### La nuit

| De | Code | Pour | Note |
| --- | --- | --- | --- |
| Barde | La clé est au clou | Pisteur | le grand dialogue d'Anselme |
| Barde | Ce que Léo a avoué, à voix haute | Sage |  |
| Pisteur | Odette est derrière la porte | Sage | pour OÙ est Odette, à l'accusation |
| Pisteur | Léo attrapé | Barde | ouvre le grand dialogue de Léo |
| Alchimiste | Le sac (6 symboles) | Pisteur | tapé pendant le grand dialogue d'Anselme, puis vérifié |

### 13.8 Les règles de tous les dialogues à étapes (enquête 3 et suivantes)

- Chaque réplique du personnage se termine par une relance commune, pour que les 4 choix suivants aient du sens quelle que soit la réponse d'avant.
- Une réponse qui fait rester à la même étape disparaît une fois choisie.
- Les « Notes pour nous » entre parenthèses ne s'affichent jamais dans le jeu.
- Le Barde vouvoie les adultes ; Fortuné, lui, tutoie le Barde.
- Grand dialogue du maire, étape 2 : la bonne réponse se termine maintenant par « Tenez, la voilà, votre lettre… Mais vous me la rendez quand, hein ? », pour amener les promesses de l'étape 3.

### 13.9 Les talents et les objets du Barde à l'enquête 3

**Les talents (niveau 2, il en choisit un)**

| Talent | Ce qu'il fait |
| --- | --- |
| Tendre l'oreille | Il écoute aux portes autant qu'il veut. Tout le monde y dit des petites phrases, pas toujours importantes ; certaines écoutes, elles, comptent vraiment. |
| Exige la vérité | Deux fois par enquête, à la fin d'un interrogatoire, tous les mensonges du villageois deviennent vrais. |

Les autres talents (Charmeur, Physionomiste, Lancer une rumeur, Hydromel, Intuition, Recoupement, Réseau, Plaidoirie) sont mis de côté jusqu'à l'enquête 3.

**Les objets** (prix revus à la baisse le 5 novembre : prendre ceux-ci, pas les anciens)

| Objet | Ce qu'il fait | Combien de fois | Prix | Texte de la boutique |
| --- | --- | --- | --- | --- |
| Lanterne du veilleur | La nuit, un villageois endormi t'ouvre sa porte et te confie un gros indice | 1 fois par enquête | 115 | « La nuit, on t'ouvre même quand tout le monde dort. » (1 fois par enquête) |
| Carte de visite | Un villageois accepte une deuxième visite au même moment : tu peux lui poser ses 4 questions | 1 fois par enquête | 110 | « Sonne une deuxième fois : on te rouvre la porte. » (1 fois par enquête) |
| Boussole des confidences | Montre à qui parler en premier | À chaque moment | 105 | « Elle montre qui a le plus à dire. » (matin, après-midi et nuit) |
| Lettre de recommandation | Avant de poser une question, tu vois si elle sert à l'enquête ou à l'histoire | 4 fois par enquête | 100 | « Elle te dit quelles questions valent la peine. » (4 fois par enquête) |
| Fleur de patience | Une question de plus avant que le villageois s'impatiente | 2 fois par enquête | 90 | « Offre-la : on t'écoute un peu plus longtemps. » (2 fois par enquête) |
| Chapeau de politesse | Un mauvais choix ne ferme pas la porte : « Pardon, je reformule… » | 1 fois par enquête | 85 | « Une maladresse ? Un coup de chapeau, et on oublie. » (1 fois par enquête) |
| Bonbons au miel | Un villageois vexé te reparle tout de suite | 1 fois par enquête | 80 | « Même les plus fâchés fondent pour un bonbon. » (1 fois par enquête) |
| Carnet à rubans | Quand quelqu'un dit une chose utile à l'enquête, un ruban s'affiche | Toujours | 70 | « Un ruban marque ce qui compte. » (toujours actif) |
| La vieille clé rouillée | Apparaît dès le dialogue avec Fortuné ; ce qu'elle ouvre est à décider | Une seule | 320 | « Une vieille clé couverte de runes, trouvée au-delà de la brume. Personne ne sait ce qu'elle ouvre. » |

**L'or du Barde** : au maximum 65 pièces après l'enquête 1 (rien à acheter) et 115 après l'enquête 2 (un seul objet), depuis que les ragots de la taverne sont retirés. Sans les missions bonus, il ne reste que les objets les moins chers. Les prix suivent ce que vaut chaque objet : la Lanterne, qui donne un gros indice, est la plus chère. Ensuite, environ un objet toutes les deux enquêtes.

**Ce que les objets changent aux dialogues** :

- **Boussole** : le matin, elle montre **Victor** (l'indice le plus difficile, l'étape 3 du maire, et les deux preuves que la lettre est fausse) ; l'après-midi, **Basile** (il donne la clé du dialogue d'Anselme) ; la nuit, Anselme (le grand dialogue de la clé de la crypte).
- **Bonbons, Fleur, Chapeau, Carnet** : pas de nouveau dialogue.
- **Carte de visite** : pas de nouveau dialogue, mais on peut poser les 4 questions d'un villageois.
- **Lettre de recommandation** : l'étiquette Enquête ou Histoire s'affiche sur 4 questions, avant de les poser.
- **Lanterne du veilleur** : le seul objet qui crée un dialogue. La nuit, une fois par enquête : un gros indice, chez le voisin d'Odette (voir « La nuit du Barde »).

### 13.10 Le seul changement dans l'enquête 2 (déjà en ligne) — fait le 6 novembre (la phrase dans `e2.js`, et la note du Carnet avec `noteSalut`, barde.js)

- La phrase d'accueil d'Iris devient : « Grrr… Pardon. Mes plantes, mes fleurs, mes arbres : c'est toute ma vie, tu sais. Et les gens qui achètent mes bouquets sans même les sentir… ça me rend folle ! Celui qui prendra la peine de sentir mes fleurs, je lui ferai une réduction, foi d'Iris ! » (raccourcie le 7 novembre, l'astuce gardée mot pour mot, et dite à la première visite seulement : §12.50)
- Si le jeu le permet, cette phrase s'inscrit aussi dans les notes du Barde : « Iris fait une réduction à qui prend la peine de sentir ses fleurs. »
- Ne toucher à aucun code gelé.

### 13.11 Ce qui reste à concevoir avant de construire

- La fiche complète du donjon : les salles, les animaux, les pièges, les actions de chaque héros, le chemin court (3 salles, 8 à 10 minutes) et le long (6 salles en labyrinthe, environ 15 minutes), la porte aux quatre signes et Léo dans la dernière salle.
- Le tableau « qui prouve quoi » : chaque preuve de QUI et de OÙ, qui la trouve, et le test (sans un des rôles, l'accusation n'est plus sûre).
- Les talents du Pisteur, de l'Alchimiste et du Sage, sur le modèle de ceux du Barde. → **élargi le 8 novembre (§12.51)** : les talents de ces trois rôles, les objets de la boutique des quatre rôles, et toutes les potions (celles du donjon comprises).

Propositions de Claude que Romain n'a pas encore validées (marquées « proposé, à valider » dans `E3-actions-des-roles.md`) :
- le Livre d'or de la fête : le matin, tout le village écrit un mot pour Odette, ce qui donne d'un coup tous les échantillons d'écriture à l'Alchimiste ; → **validé par Romain le 8 novembre (10 h 06)** ;
- le coup d'œil du Pisteur au clocher, le matin (facultatif) ; → Romain (8 novembre) ne voyait pas ce que c'était : réexpliqué (avis de Claude : non) ; **en attente** ;
- les cueillettes de l'Alchimiste pour la nuit ; → **validé le 8 novembre** ;
- la recette qui ronge la rouille, trouvée par le Sage dans le Grand Livre ; → Romain (8 novembre) : **pas tranchée seule**, elle se fera avec **toutes les potions** (il faut créer toutes les potions du donjon : §12.51) ;
- la page de la porte des Fondateurs dans les archives du Sage (les quatre signes = les quatre rôles, comme la légende des Cinq familles) ; → **en attente** (pas encore de réponse) ;
- la canne d'Odette donnée au Barde dès le début de l'enquête 3, pour qu'il puisse la déposer chez elle. → **Décidé le 7 novembre (§12.50)** : l'E3 la met d'office dans le sac du Barde (une équipe peut finir l'E2 sans l'avoir trouvée).

Points d'équilibre repérés :
- Le Barde lit environ 5 fois plus que les autres (environ 3 100 mots contre 600 à 700 pour chaque autre rôle, soit 20 minutes de lecture contre 4 à 5).
- L'après-midi, le Pisteur et le Sage ont peu à faire (idée non retenue pour l'instant : passer l'oie du festin à l'après-midi).
- Le temps des potions de l'Alchimiste l'après-midi reste à mesurer (compté 2,5 minutes par potion).

### 13.12 Journal des décisions (5 et 6 novembre 2026)

Résumé dans les mots de Romain quand c'est possible (il dicte à la voix : c'est le sens qui compte).

- **5 novembre au soir — le marché aux fleurs.** Il se joue au tout début du matin. Juste après l'écran du discours, le maire apparaît en plein écran sur la tablette du Barde ; seul Fortuné se touche d'abord ; Iris et Basile apparaissent discrètement pendant son marchandage. Les fleurs sont remises au maire l'après-midi, quand le Barde rend sa mission. Toutes les possibilités ont été calculées ; 9 bouquets sont acceptés, avec une remarque de « mauvais négociateur ».
- **5 novembre au soir — le dialogue de Fortuné.** Pas de parenthèse qui trahit la bonne réponse ; au moins 3 ou 4 vrais choix à chaque étape ; la variante proposée par Claude est gardée.
- **5 novembre au soir — l'astuce d'Iris** (« je fais une réduction à qui sent mes fleurs ») se dit clairement dans l'enquête 2.
- **5 novembre — Mélusine** a écrit la lettre ; elle avoue l'après-midi, quand le Barde lui présente le code de l'écriture trouvé par l'Alchimiste.
- **5 novembre, vers 22 h — la nuit.** La fête a lieu la nuit (les préparatifs le matin). Anselme est gardé : vieux, dur d'oreille, il ne s'occupe pas de Léo. L'entrée par le puits passe par l'Alchimiste (la potion qui ronge la rouille). Moustache laisse ses traces au milieu de celles de beaucoup de chats. Le Sage trouve ses accès dans le Grand Livre et les bibliothèques.
- **5 novembre, vers 22 h 20 — le donjon**, idée de Romain : façon Darkest Dungeon, une équipe de trois (Pisteur, Alchimiste, Sage), des pièges, des animaux ; le Sage connaît le chemin ; un système réutilisable.
- **5 novembre, 22 h 30 → 22 h 50 — les codes.** Les tablettes ne se relient pas pour l'instant (une liaison Wi-Fi ou par le son sera testée plus tard dans la salle de test ; les codes restent toujours en secours). Taper un code par action serait trop lent : le sac de l'Alchimiste passe en un seul code à 6 symboles, sur un écran spécial, au moment de descendre, puis un écran de vérification.
- **6 novembre, 0 h 05 — la trame.** Le matin, les préparatifs et la mission du maire ; l'après-midi, toute l'enquête sur la lettre, et la tension qui monte pour la nuit ; la nuit, la clé d'Anselme ou le puits, les potions, les runes, le donjon, le grand complexe, Léo et son grand dialogue à plusieurs fins. Dans tous les cas, le maire enferme tout le monde.
- **6 novembre, 0 h 32.** Plus de tension l'après-midi. Le Pisteur trouve deux pistes (la crypte du clocher et le puits). Le grand dialogue d'Anselme passe la nuit.
- **6 novembre, 0 h 44 → 0 h 58 — les documents.** Le document du Barde est gardé et complété ; une page du même style pour les trois autres rôles (schémas clairs, tiroirs repliables) ; les deux réunies en une seule page à onglets, avec un onglet Barde.
- **6 novembre, 1 h 34 — la durée.** 1 h 15, « c'est nickel ».
- **6 novembre, 1 h 36 — pour tenir en 1 h 15.** Gaspard, Victor, Iris et le voisin d'Odette sont occupés l'après-midi (Iris vend encore ses fleurs). La lueur du puits (Victor) et le « minuit pile » (Gaspard) deviennent des écoutes. Le sac se compose pendant Anselme. Léo devient la dernière salle du donjon : plus de poursuite, et son grand dialogue commence tout de suite, sans ses 4 questions. Anselme garde ses 4 questions.
- **6 novembre, 1 h 36 — la chanson d'Odette est supprimée** (Romain : « J'aime pas trop cette histoire de chant »). À la place, dans l'avant-dernière salle du donjon, Moustache gratte la porte aux quatre signes ; derrière, une voix étouffée : « Moustache ? Mon gros gris, c'est toi ? » Le Pisteur donne au Sage le code « Odette est derrière la porte ». Tim, les écoutes et l'aveu de Léo parlent de miaulements, plus de chanson.
- **6 novembre, 1 h 40 — un indice gardé** (proposé par Claude, à confirmer) : Victor, occupé, dit en passant que le maire « n'a même pas écrit ses invitations lui-même : il dit qu'il a une écriture de patte de mouche ». C'est le seul indice que le maire fait écrire les autres.

### 13.13 Ce que la conversation qui construit a décidé avec Romain depuis (5 novembre, 17 h → 6 novembre, 1 h), à appliquer à l'enquête 3
Ajouté le 6 novembre à 2 h, en intégrant ce chapitre. Le détail est dans les §12.35 à §12.43 ; ici, seulement ce qui touche l'enquête 3.
- **Le 🤥 « Mensonge ? » du Barde n'est plus que sous la dernière réponse** : dès qu'on pose une autre question, il part en fumée ; « 🔁 Répète » redonne la chance (§12.40). Ça vaut pour tous les villageois de l'E3 (Margot, Victor, Fortuné, Tim…) : un mensonge se démasque tout de suite, ou par Exige la vérité, la potion de vérité, ou un filet de sécurité.
- **Écouter aux portes** : la nuit, plus rien chez ceux qui dorment ou ne sont pas disponibles (§12.40) ; une réplique par personne, 200 signes au plus (§12.32). Un villageois indisponible est « occupé » : en rouge sur la carte, avec sa petite phrase (comme Victor, la nuit de l'E2). La Lanterne du veilleur reste la seule façon de parler à un villageois endormi.
- **Le Barde lit trop** : Romain (5 novembre, 21 h 46) a demandé de réduire d'au moins 30 % ce que le Barde lit. **Fait dans l'E2 le 7 novembre (§12.50, −34 %)** : réponses de 2 phrases au plus, vérités de 25 à 30 mots, une seule phrase de 15 mots au plus aux portes, signes des menteurs épinglés (l'étiquette du liège porte le nom), salut seulement à la première visite (`E.salutUneFois`). **L'E3 (environ 3 100 mots pour le Barde, 5 fois plus que chaque autre rôle) doit suivre les mêmes règles dès l'écriture** : ses dialogues sont à réécrire avant de construire.
- **Les textes d'aide sont racontés, jamais « Touche … »** (§12.41, §12.42) : des phrases courtes, comme un conteur d'enquête (heroic fantasy, un peu d'humour) ; le bouton à toucher bouge lui-même et porte le rond jaune animé, partout le même (§12.40). Pas de bandeau quand il ne sert à rien. Règle pour toute nouvelle aide de l'E3 : l'écran des missions du maire, l'écran « Descendre », le sac, le donjon.
- **Les écrans en plein écran fixe** (§12.40) : la lettre (« Enquête N »), « Enquête résolue », le village ne défilent plus. L'écran des missions du maire et la lettre « d'Odette » de l'E3 doivent tenir de la même façon (`.b-ecran-fixe`, `M.ecranFixe`).
- **Les mini-jeux en plein écran verrouillé** (§12.43, `MJ.PLEIN_ECRAN`) : rien ne défile. Chaque mini-jeu nouveau ou en variante de l'E3 (assembler selon une commande, les ressemblances, le tir des banderoles, la poursuite en ville, les traces de chats, le tableau des runes, et le donjon) entre dans cette liste. Seuls le mensonge, les mots, l'alphabet, la grille et les dépositions peuvent défiler.
- **Le tir à l'arc est refait** (Romain, 5 novembre, 23 h 32, puis le go le 6 novembre à 2 h 34 ; **construit**, §12.44) : même moteur, le clocher et le ballon, le cerf-volant, un archer refait. **Les banderoles de l'E3 existent déjà** dans ce nouveau tir (`params:{decor:'banderoles'}` ; depuis le §12.45, la guirlande reste accrochée à l'arc jusqu'au dernier anneau) : il reste à les brancher sur la mission de fête du Pisteur quand on construira l'E3. Se cacher est refait aussi (plusieurs pièces, pièges ; la mairie et le clocher de l'E3 pourront prendre le décor `ville`).
- **Les pièces d'or des missions bonus** (15 à l'E1) : Romain trouve que c'est beaucoup (« une pièce plutôt ? ») ; **à décider**. Si ça baisse, les comptes d'or du §13.9 (65 pièces après l'E1, 115 après l'E2) changent, et les prix de la boutique avec.
- **La poursuite de Tim (E2)** : niveau 5 pour un adulte, 2 pour un enfant, un seul essai ; Romain l'a trouvée difficile. **Baissée à 4 au plus le 7 novembre** (`mjNiveauMax:4`, §12.50). Ça compte pour l'oie du festin (même moteur) : à régler à sa construction.
- **La salle des mini-jeux est en ligne** : https://esperidad-tech.github.io/brumeval/salle.html (une tuile sur la page d'accueil du GitHub), sans les jeux du Barde ni la case « aides » ; la page de tous les mini-jeux et de leurs 10 niveaux : https://esperidad-tech.github.io/brumeval/mini-jeux.html. Les nouveaux mini-jeux de l'E3 s'y montrent d'abord, comme décidé le 4 novembre.
- **Le tableau de liège du Barde est gardé d'une enquête à l'autre** (§12.37) : les photos et les étiquettes de l'E3 s'ajoutent à celles de l'E2.
- **Pour construire** : la façon de faire (chemins absolus, vérifier ce qui part en ligne, un test à la fois, les codes gelés) est dans `PASSATION.md`, à la racine des sources.

