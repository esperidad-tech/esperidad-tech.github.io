# Brumeval — l'équilibrage en chiffres

> **Archive (11 novembre) : ce document n'est plus à jour.** Il compte des points d'action, la réserve du Sage et les anciens talents et objets, qui n'existent plus. Son programme est rangé à côté (`jeu/archives/equilibre-ancien.js`, il ne tourne plus avec les données d'aujourd'hui). La Bible fait foi.

*Actions, réserve du Sage, difficulté automatique, progression. Calculs du 2 novembre 2026.*

Ce document répond à tes cinq questions. Les calculs sont faits par un petit programme, `tools/equilibre.js`, qui lit les vraies données du jeu (`src/donnees.js`, `src/e1.js`, `src/e2.js`, `src/e3.js`, le calibrage des mini-jeux) et **simule des milliers de parties**. Il ne modifie rien dans le jeu.

**Pour le relancer** (par exemple quand les enquêtes 1 à 3 seront réécrites), depuis le dossier du jeu :

```
node tools/equilibre.js
```

Ça prend environ 5 minutes et affiche tous les tableaux. `node tools/equilibre.js --vite` va plus vite, avec des chiffres un peu moins précis.

> **Attention, une chose avant tout.** Les chances de réussir chaque mini-jeu sont des **suppositions** (fichier `tools/proba-minijeux.json`). Je suis parti de ton avis : « bien » au niveau 10, ce qui veut dire qu'un adulte moyen réussit environ 6 fois sur 10. Pour les enfants de 8 ans, j'ai supposé moins, sauf pour Naïm dans les jeux d'action. Tous les chiffres de ce document dépendent de ces suppositions. Il faudra les corriger avec de vraies parties : c'est le rôle du journal de statistiques (chapitre 7).

---

## En bref : les 10 choses à retenir

1. **Il n'y a pas trop peu d'actions : elles arrivent toutes au même moment.** Le matin, le Barde voudrait une action de plus dans 100 % des parties, l'Alchimiste dans 83 à 91 %. La nuit, presque personne. C'est un problème de rythme plus que de quantité.
2. **Alchimiste : 3 actions par moment.** C'est le rôle le plus serré : cueillir, ranger, cuire et analyser. Dans l'enquête 2 actuelle, elle doit renoncer à quelque chose d'important dans **34 à 37 % des parties** (enfants, famille). Avec 3 actions, c'est 12 %. Et l'enquête 2 réécrite lui en demande deux fois plus.
3. **Pisteur, Barde et Sage : 2 actions.** Trois actions pour tout le monde, c'est trop : le Sage n'aurait rien à faire avec la moitié de ses actions, et les soirées s'allongent.
4. **La réserve du Sage : 3 actions par enquête** (4 si l'équipe n'a que des enfants), à donner par code. Au plus 1 don par équipier et par moment. Elle est vidée entièrement dans **plus de la moitié des parties** pour les enfants et la famille (37 à 85 % selon l'enquête) : il faut vraiment choisir à qui donner. Une réserve de 5 ou 6 ne manque presque jamais, et il n'y a plus rien à discuter.
5. **Plus d'actions ne fait presque pas gagner plus.** Ce qui fait perdre, ce sont les mini-jeux ratés et les erreurs à l'accusation. À l'enquête 1, une équipe de 4 enfants perd **13 %** du temps. Avec 3 actions pour tous, elle perd encore 10 %. En baissant seulement de 2 crans le niveau de ses mini-jeux, elle perd 5,5 %. Avec toute la difficulté automatique proposée, elle ne perd plus que **1 %**. Et à partir de l'enquête 4, le document de design prévoit un seul essai par mini-jeu : une action en plus ne permet même plus de rejouer.
6. **La difficulté automatique** joue d'abord sur le **niveau des mini-jeux** :
   - équipe d'enfants : −2 crans au début, puis −1 quand l'équipement monte ;
   - équipe mixte : −1 cran pour les enfants ;
   - équipe d'adultes : +1 cran, mais pas à l'enquête 1.
   Elle ajoute un peu d'actions et de réserve pour les enfants, et l'indice partiel dure plus longtemps pour eux. Le jeu sait qui joue grâce à une question à la création du héros, plus un réglage « l'équipe de ce soir ».
7. **Avec les seuils d'expérience actuels, on n'atteint jamais le niveau 10.** On est niveau 7 au début de l'enquête 9 et niveau 8 à la fin de la saison : les talents de niveau 10 ne servent jamais. Je propose des seuils où **niveau = numéro de l'enquête**, comme le dit la Bible (« une enquête par niveau »).
8. **Certains objets rendent des mini-jeux presque gratuits.** Suivre la piste devient facile dès l'enquête 3 avec trois objets à moins de 45 pièces. Avec tout le matériel :
   - suivre la piste, se cacher, le tir et le mensonge tombent au niveau 1 ;
   - la course-poursuite et les runes se gagnent sans jouer (Course du loup, Couronne de runes).
   À l'opposé, les jeux d'observation de l'Alchimiste (7 différences, Le double, Le grand ménage) restent durs toute la saison. Il y a une liste précise de chiffres à baisser au chapitre 6.
9. **Les enquêtes 2 et 3 actuelles sont trop faciles** pour des adultes : environ 100 % de victoires, ce qui confirme ce que vous avez ressenti. **L'enquête 1 est la plus risquée pour des enfants** : tout repose sur un seul mini-jeu, les traces du massif, sans autre chemin.
10. **Avec la mort des héros, la règle d'écriture la plus importante** est la suivante : **une clé de voûte ratée doit laisser au plus 2 possibilités**. Si elle en laisse 4, la famille ne finit la saison sans recommencer que 6 fois sur 10 avec les règles du document (61 %), et 3 fois sur 4 avec mes propositions (75 %). Si elle en laisse 2, on est à 99 %. Et le passage à **2 cœurs** se fait au plus tôt à l'enquête 6, avec un Élixir facile à préparer (chapitre 5.3).

---

## 1. Les actions : ce qu'il faut, ce qu'on a (question 1)

### 1.1 Ce que demande chaque enquête actuelle, par rôle

On compte une action pour visiter un lieu, parler à quelqu'un, cueillir, cuire, analyser, ouvrir une page qui coûte une action, écouter ou tenter une mission bonus. Ce tableau compte les actions **sans les ratés**. Les ratés viennent avec la simulation, au point suivant.

| Enquête (actions disponibles par rôle) | Rôle | Minimum pour résoudre | Tous les indices | Tout voir (avec les missions bonus) | + nouveautés de la saison (estimation) |
|---|---|---|---|---|---|
| **E1** (2 × 3 = **6**) | Pisteur | 2 | 2 | 8 (+5 repérages de plantes) | 9 |
| | Alchimiste | 1 | 2 | 7 | 10 |
| | Barde | 3 | 3 | 11 | 11 |
| | Sage | 0 | 0 | 2 | 3 |
| **E2** (2 × 4 = **8**) | Pisteur | 1 | 2 | 7 (+5 repérages) | 8 |
| | Alchimiste | 1 | 4 | 10 | 13 |
| | Barde | 2 | 5 | 12 | 12 |
| | Sage | 2 | 2 | 3 | 4 |
| **E3** (2 × 4 = **8**) | Pisteur | 1 | 3 | 6 (+7 repérages) | 7 |
| | Alchimiste | 1 | 5 | 6 | 9 |
| | Barde | 3 | 3 | 10 | 10 |
| | Sage | 2 | 2 | 3 | 4 |

Ce qu'on voit :

- **Le minimum pour résoudre est tout petit** (0 à 3 actions par rôle). Les indices sont redondants, et c'est pour ça que l'enquête 2 était trop facile.
- **« Tout voir » dépasse les actions du Barde et de l'Alchimiste.** C'est bien : il faut choisir.
- **Le Sage a très peu à faire avec ses actions** : 0 à 2 sur 6 ou 8. Le reste de son rôle (lire, donner les codes, accuser) ne coûte pas d'action. C'est pour ça que la réserve à donner lui va bien.
- « Nouveautés de la saison » ajoute mon estimation de ce que le document de design apporte en actions facultatives :
  - Alchimiste : 3 (cueillette rare, Élixir, analyse des couleurs) ;
  - Pisteur : 1 (coffre) ;
  - Sage : 1 (plans du passage secret).
- **L'enquête 2 réécrite** (document de design) demande beaucoup plus à l'Alchimiste. En comptant à la main :
  - l'encre, indice clé de voûte : 2 à 3 cueillettes et 1 cuisson ;
  - les analyses : la lettre (clé de voûte), la cape, la craie, chacune avec un mini-jeu et parfois un nouvel essai ;
  - deux potions facultatives : 4 à 6 actions ;
  - la cave rare, l'Élixir et la mission bonus.

  Cela fait **14 à 18 actions souhaitées pour 8 disponibles**. Le document le dit lui-même : « jusqu'à 7 mini-jeux » pour elle.

### 1.2 Ce qui se passe vraiment (simulation)

Chaque ligne résume 1 500 parties simulées. Le tableau donne :

- **Frustré** : la part des parties où ce rôle a dû renoncer *pour de bon* à quelque chose d'important (un indice ou un prérequis), faute d'action ;
- **Inutilisées** : en moyenne, les actions sans rien d'intéressant à faire.

**Règle actuelle : 2 actions pour tous**

| Enquête | Équipe | Frustré : Pisteur · Alchimiste · Barde · Sage | Actions inutilisées du Sage (sur 6 ou 8) |
|---|---|---|---|
| E1 | 4 enfants | 21 % · 29 % · 3 % · 0 % | 2,6 |
| E1 | famille | 6 % · 21 % · 0 % · 0 % | 2,9 |
| E1 | 4 adultes moyens | 3 % · 10 % · 0 % · 0 % | 2,9 |
| E2 | 4 enfants | 5 % · **37 %** · 12 % · 0 % | 3,5 |
| E2 | famille | 2 % · **34 %** · 7 % · 0 % | 3,8 |
| E2 | 4 adultes moyens | 0 % · 7 % · 5 % · 0 % | 3,8 |
| E3 | 4 enfants | 5 % · 0 % · 0 % · 10 % | 2,2 |
| E3 | famille | 2 % · 0 % · 0 % · 0 % | 3,5 |

« Famille » veut dire : Naïm au Pisteur, Alicia à l'Alchimiste, Siham au Barde, toi au Sage. C'est une supposition (seule Alicia à l'Alchimiste est sûre) ; tu peux la changer en haut de `tools/equilibre.js`.

**Le moment qui coince, c'est le matin.** Voici l'enquête 2, règle actuelle, pour la famille. Chaque case donne les actions utiles en moyenne, et entre parenthèses la part des parties où le joueur aurait voulu une action de plus :

| Rôle | Matin | Après-midi | Soir | Nuit |
|---|---|---|---|---|
| Pisteur | 1,7 (29 %) | 0,5 (3 %) | 1,0 (4 %) | 0,5 (2 %) |
| Alchimiste | 1,6 (**83 %**) | 1,4 (43 %) | 0,6 (8 %) | 1,0 (34 %) |
| Barde | 1,8 (**100 %**) | 1,8 (31 %) | 0,6 (10 %) | 0,0 (0 %) |
| Sage | 1,7 (26 %) | 0,3 (1 %) | 0,0 (0 %) | 0,0 (0 %) |

Au début, tout le village est ouvert, et tout le monde veut tout faire tout de suite. À partir du soir, il reste peu à faire.

### 1.3 Les règles d'actions comparées

Toujours pour la famille et les enfants. Les colonnes donnent la part des parties où au moins un rôle est frustré (environ), la chance de perdre et la durée estimée.

| Règle | E1 enfants | E1 famille | E2 enfants | E2 famille | Durée E2 |
|---|---|---|---|---|---|
| Actuelle : 2 pour tous | 46 % · perdu 13 % | 26 % · 4 % | 47 % · 1 % | 40 % · 0 % | 40-43 min |
| Alchimiste 3, les autres 2 | 32 % · 12 % | 10 % · 4 % | 23 % · 1 % | 15 % · 0 % | 41-44 min |
| 3 pour tous | 6 % · 10 % | 1 % · 4 % | 15 % · 0 % | 13 % · 0 % | 46-47 min |
| 2 pour tous + réserve de 1 par moment | 15 % · 11 % | 5 % · 2 % | 28 % · 0 % | 17 % · 0 % | 41-44 min |
| **Proposé : Alchimiste 3, les autres 2, + réserve de 3 ou 4** | **7 % · 12 %** | **1 % · 3 %** | **12 % · 1 %** | **5 % · 0 %** | 42-45 min |

(Les durées sont une estimation grossière, à partir de la durée de chaque mini-jeu et d'un temps pour se parler à chaque moment. Le document de design compte 1 h 30 à 2 h pour l'enquête 3 réécrite, plus riche. Le temps est une vraie contrainte avec 4 soirées pour 10 enquêtes.)

### 1.4 Ma recommandation (actions par moment)

| Rôle | Actions par moment | Pourquoi |
|---|---|---|
| **Alchimiste** | **3** | C'est le seul rôle frustré dans plus d'une partie sur trois (enquête 2). Son travail est fait de petits pas qui s'enchaînent : cueillir à deux endroits, cuire, puis analyser ce que les autres apportent. Les ingrédients ne poussent qu'à certains moments (la brume le matin ou la nuit). Et la saison lui ajoute la cueillette rare (une action à chaque essai) et des analyses avec mini-jeu. |
| Pisteur | 2 | Il est occupé mais rarement bloqué. Ce qui le gêne, ce sont les ratés des traces, et la réserve du Sage règle ça. |
| Barde | 2 | Il est très demandé le matin, mais tranquille ensuite. C'est exactement le cas où la réserve sert : un don le matin. |
| Sage | 2 | Il n'en utilise que 0 à 2 aujourd'hui. Mais l'enquête 7 le met en vedette, et les plans et les runes de la saison lui coûtent des actions. Je ne descends pas à 1 : à l'enquête 3, un Sage enfant à 1 action est frustré une partie sur sept. |

**Ce que dit le document de design depuis :** une enquête doit tenir en 60 à 75 minutes, et « l'Alchimiste a moins à faire à l'enquête 2 ». Si l'enquête 2 réécrite lui demande vraiment moins, relance l'outil une fois l'enquête codée. Le test est simple : si l'Alchimiste reste frustrée dans moins de 15 % des parties avec 2 actions, on peut garder 2 actions pour elle, et la réserve du Sage suffit.

**Ce qu'il faut savoir sur le temps.** Avec 3 actions dont des mini-jeux longs (le chaudron dure au moins 2 minutes), c'est souvent l'Alchimiste qui fera attendre les autres à la fin d'un moment. Si ça se voit en vrai, il y a une autre solution : **2 actions + 1 cueillette gratuite par moment** (cueillir est rapide et sans mini-jeu). Il faudrait alors changer le talent Herboriste, qui donne aujourd'hui une cueillette gratuite par enquête.

**Pourquoi pas 3 pour tout le monde :**

- le Sage aurait 5,6 à 6 actions inutilisées sur 9 ;
- le Barde en perdrait une bonne partie en curiosité ;
- la soirée s'allonge de 3 à 7 minutes par enquête ;
- on perd la tension « on ne peut pas tout faire, il faut choisir ensemble », qui est le cœur du jeu (Bible).

---

## 2. La réserve d'actions du Sage (question 2)

J'ai essayé une réserve de 0 à 6 actions par enquête, avec Alchimiste 3 et les autres 2. Chaque case se lit ainsi : part des parties où quelqu'un est frustré · chance de perdre · actions données en moyenne · **part des parties où la réserve est vidée**. Quand la réserve est vidée, il a fallu choisir à qui donner.

| Enquête, équipe | 0 | 2 | **3** | 4 | 6 |
|---|---|---|---|---|---|
| E1 enfants | 34 % · 11 % | 14 % · 12 % · 1,9 · 93 % | **7 % · 9 % · 2,6 · 70 %** | 4 % · 13 % · 2,9 · 24 % | 2 % · 11 % · 3,0 · 1 % |
| E1 famille | 11 % · 4 % | 2 % · 3 % · 2,0 · 95 % | **1 % · 3 % · 2,6 · 73 %** | 1 % · 2 % · 2,8 · 6 % | 0 % · 1 % · 2,8 · 0 % |
| E2 enfants | 23 % · 1 % | 24 % · 0 % · 2,0 · 99 % | **18 % · 0 % · 2,8 · 85 %** | 13 % · 0 % · 3,4 · 53 % | 8 % · 1 % · 3,6 · 6 % |
| E2 famille | 15 % · 0 % | 13 % · 0 % · 2,0 · 98 % | **8 % · 0 % · 2,5 · 55 %** | 7 % · 0 % · 2,7 · 18 % | 6 % · 0 % · 2,7 · 1 % |
| E3 enfants | 13 % · 0 % | 12 % · 0 % · 2,0 · 96 % | **9 % · 1 % · 2,7 · 73 %** | 6 % · 0 % · 3,0 · 40 % | 3 % · 0 % · 3,3 · 6 % |
| E3 famille | 1 % · 0 % | 1 % · 0 % · 1,7 · 72 % | **0 % · 0 % · 2,1 · 37 %** | 0 % · 0 % · 2,2 · 8 % | 0 % · 0 % · 2,3 · 0 % |

**Recommandation :**

- **Taille : 3 actions par enquête**, et 4 pour une équipe de 4 enfants. Avec 3, la réserve fait vraiment baisser la frustration (de 34 % à 7 % pour des enfants à l'enquête 1). Elle est vidée dans 70 à 85 % des parties aux enquêtes 1 et 2 pour les enfants, et dans 37 à 73 % ailleurs : la question « à qui on la donne ? » se pose très souvent. Avec 2, elle se vide toujours, mais il reste beaucoup de frustration. À partir de 5, elle ne manque presque plus, et il n'y a plus rien à discuter.
- **Par enquête, pas par moment.** La demande arrive surtout le matin, souvent chez deux joueurs à la fois (le Barde et l'Alchimiste). Une réserve « 1 par moment » est trop petite le matin et se perd la nuit. Une réserve par enquête laisse aussi le Sage décider de garder une action pour la nuit : c'est un vrai choix de chef.
- **Au plus 1 don par équipier et par moment.** Le Sage peut donner les 3 au même joueur, mais seulement sur 3 moments différents, et pendant ce temps les autres n'en ont pas : c'est ce que tu voulais pour obliger à discuter.
- **Seulement pour les équipiers**, pas pour lui-même : sinon c'est juste une 3e action pour le Sage.
- **Pourquoi pas « le Sage donne ses propres actions » ?** Je l'ai simulé. À l'enquête 1, ça marche, parce que le Sage n'a rien à faire. Aux enquêtes 2 et 3, il ne donne que 0,1 à 0,7 action, parce que **le matin, quand tout le monde en manque, il est lui-même occupé** (Livre d'or, archives). Une réserve à part marche mieux.
- **Comment la donner sans tablettes reliées :**
  1. Sur la tablette du Sage : « Donner une action », puis il choisit le rôle.
  2. Le code n'est valable **que pour ce rôle** et **une seule fois** (par exemple « action pour le Pisteur n° 2 »).
  3. La tablette du Sage compte ce qui reste.

  Aujourd'hui, le code « une action en plus » (talent Inspiration, Cor du rassemblement) est accepté par **les 4 tablettes** : il donne en fait jusqu'à 4 actions au lieu d'une (voir le chapitre 6).
- **Talents et objets qui y touchent :**
  - Inspiration et Cor du rassemblement : chacun +1 action dans la réserve ;
  - l'ensemble Chef : +2 à la réserve.

  Aujourd'hui, l'ensemble Chef donne +1 action par moment au Sage lui-même, qui n'en a pas besoin. La Bible disait « pour toute l'équipe », ce qui serait trop fort : 16 actions par enquête.

---

## 3. La difficulté automatique selon qui joue (question 3)

### 3.1 Comment le jeu sait qui joue

Les tablettes ne sont pas reliées, il faut donc que chaque tablette le sache toute seule :

1. **À la création du héros**, on ajoute une question : « Qui va jouer avec ce héros ? 🧒 Un enfant · 🧑 Un adulte ». Elle est **séparée de l'âge du personnage** : tu peux jouer un vieux Sage tout en étant un adulte, et Naïm peut jouer un héros adulte.
2. **À l'écran « Nouvelle enquête »**, une petite ligne « L'équipe de ce soir », avec 4 pastilles (enfant ou adulte), **déjà remplies comme la dernière fois**. On ne la touche que si l'équipe change. La même réponse sur les 4 tablettes donne la composition : 4 enfants, mixte, ou 4 adultes.
3. **Rester discret.** L'écran d'un mini-jeu affiche aujourd'hui « Difficulté 10 → 8 » quand un objet aide. Le décalage automatique doit être appliqué **avant**, pour que l'écran montre simplement « Difficulté 8 ». Il ne doit pas non plus apparaître dans « Ce qui t'aide ».

### 3.2 Les règles proposées

| | Équipe de 4 enfants | Équipe mixte | Équipe de 4 adultes |
|---|---|---|---|
| Niveau des mini-jeux d'un **enfant** | −2 crans (enquêtes 1 à 3), −1,5 (4 et 5), −1 (6 à 9) | −1 cran (1 à 3), −0,5 (4 et 5), 0 ensuite | — |
| Niveau des mini-jeux d'un **adulte** | — | 0 | **+1 cran**, sauf à l'enquête 1 (tutoriel) |
| Actions | +1 par moment pour tous | comme d'habitude | comme d'habitude |
| Réserve du Sage | 4 | 3 | 3 |
| Cœurs d'accusation | 3 | 3 | 3 |
| Indice partiel quand un mini-jeu est raté | une fois sur deux jusqu'à l'enquête 3, puis une fois sur quatre (le document n'en donne plus à partir de l'enquête 4) | comme les enfants | comme dans le document |

**Pourquoi le coup de pouce des enfants diminue :** l'équipement prend le relais. Sans cette baisse, une équipe d'enfants réussirait les traces à 96-98 % à partir de l'enquête 6 : ce serait gratuit, alors que tu veux que les mini-jeux restent un peu durs à l'enquête 9.

**Pourquoi je garde 3 cœurs pour tout le monde :** c'est la règle simple du document, et c'est le meilleur filet contre les mauvaises soirées (voir le chapitre 5).

### 3.3 L'effet, dans les simulations (enquêtes actuelles)

| Enquête | Équipe | Règle actuelle : perdu | Proposé (actions + réserve) : perdu | Proposé + difficulté automatique : perdu | Gagné du 1er coup (dernier cas) |
|---|---|---|---|---|---|
| E1 | 4 enfants | **13 %** | 12 % | **1 %** | 84 % |
| E1 | famille | 4 % | 3 % | **0 %** | 96 % |
| E1 | 4 adultes moyens | 2 % | 2 % | 4 % (+1 cran) | 84 % |
| E1 | 4 adultes forts | 0 % | 0 % | 1 % | 97 % |
| E2 et E3 | toutes | 0-1 % | 0-1 % | 0 % | 86-99 % |

**Plus d'actions n'est pas le bon levier pour gagner.** Les actions servent surtout à ne pas être frustré et à profiter du contenu facultatif. Ce qui fait gagner :

- le **niveau des mini-jeux** ;
- les **chemins de secours** (un 2e indice pour le même suspect) ;
- les **cœurs** ;
- les **pouvoirs du Sage**.

À l'enquête 1, des enfants perdent 13 % du temps. Avec 3 actions pour tous, c'est 10 %. Avec −2 crans seulement, c'est 5,5 % : la chance d'avoir les traces du massif passe de 60 % à 83 %. Avec toute la difficulté automatique (−2 crans, +1 action, réserve de 4, indice partiel), c'est 1 %.

C'est encore plus vrai à partir de l'enquête 4 : le document prévoit **un seul essai** par mini-jeu. Une action en plus ne permet donc plus de rejouer une clé de voûte ratée.

**Le +1 cran des adultes a un prix.** À l'enquête 1, 4 adultes moyens perdent 4 % au lieu de 2 %. C'est pour ça que je ne l'applique pas à l'enquête 1. Sur la saison, avec les pouvoirs du Sage, ça reste faible (chapitre 5).

---

## 4. La progression des enquêtes 1 à 9 (question 4)

### 4.1 Expérience et niveaux

Une enquête gagnée rapporte 130 points d'expérience : 100, plus 2 par note du carnet, plafonné à 30, presque toujours atteint.

| Début de l'enquête | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| XP | 0 | 130 | 260 | 390 | 520 | 650 | 780 | 910 | 1040 | 1170 |
| Niveau, seuils actuels | 1 | 2 | 3 | 4 | 5 | 5 | 6 | 7 | **7** | **8** |
| Niveau, seuils proposés | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | **10** |

Avec les seuils actuels, on n'a jamais le talent de niveau 10, et celui de niveau 8 arrive seulement pour le final. Les paliers de la boutique tombent aussi plus tard que prévu : le palier 4 (niveau 7) n'arrive qu'à l'enquête 8.

**Seuils proposés :** `0, 120, 250, 380, 510, 640, 770, 900, 1030, 1160`. Avec 130 points par enquête, on a toujours le niveau de l'enquête, un peu d'avance comprise. Même avec une enquête perdue à 70 points, on garde le bon niveau.

### 4.2 Or et achats

Une enquête gagnée sans erreur rapporte 50 pièces. Les missions bonus en rapportent 15 à 20, avec un seul essai, donc environ 8 à 11 pour un adulte et 4 à 8 pour un enfant. Cela fait **55 à 65 pièces par enquête**, soit 450 à 520 pièces avant l'enquête 9. C'est d'accord avec la Bible (« 600 à 700 sur 10 enquêtes », « 4 ou 5 objets »), mais **deux fois moins** que ce que donne le mode test (120 par enquête).

Les achats « raisonnables » que j'ai simulés sont les objets qui aident d'abord les mini-jeux du rôle, achetés dans l'ordre. Voici l'équipement au début de l'enquête 9, pour un adulte moyen, avec les seuils actuels :

| Rôle | Talents | Objets |
|---|---|---|
| Pisteur | Pistage, Réflexes de chat, Camouflage | Lanterne sourde, Gants, Bottes souples, Arc court, Cape de rôdeur, Bottes de vent, Carquois |
| Alchimiste | Potionniste, Main sûre, Poudre à empreintes | Thermomètre, Fioles renforcées, Herbier, Sac d'herboriste, Alambic, Lunettes, Chaudron de cuivre |
| Barde | Conteur, Oreille absolue, Ragots de taverne | Clochette, Carnet de ragots, Luth, Bonbons, Pendule, Cornet, Carillon, Miroir de vérité (**ensemble Vérité complet**) |
| Sage | Stratège, Déchiffreur, Tableau des indices | Loupe de lecture, Plume, Lunettes, Sablier, Pierre-runes, Clé des archives, Bannière, Chapeau étoilé |

### 4.3 Chance de réussir chaque mini-jeu au fil de la saison

Les chiffres sont calculés avec l'équipement ci-dessus, **avec le plafond au niveau validé** (déjà dans le moteur), sans potion ni deuxième chance.

Comment lire une case : le niveau effectif de l'adulte moyen, puis la chance de réussir pour enfant / Naïm / adulte moyen / adulte fort. Chacun a son propre équipement : les enfants gagnent un peu moins d'or. ⚠️ veut dire presque gratuit (niveau 4 ou moins, ou 90 % et plus pour un adulte moyen).

| Mini-jeu | Enquête 1 | Enquête 3 | Enquête 5 | Enquête 7 | Enquête 9 |
|---|---|---|---|---|---|
| Suivre la piste | 10 → 31/52/58/77 | 6,2 → 71/86/88/95 | 6,2 → 71/86/88/95 | 5,4 → 78/90/91/96 ⚠️ | 2,8 → 78/90/97/99 ⚠️ |
| Course-poursuite | 8 → 31/52/58/77 | 8 → 31/52/58/77 | 7 → 41/63/68/84 | 6 → 52/73/77/89 | 6 → 52/73/77/89 |
| Se cacher | 10 → 31/52/58/77 | 9 → 41/63/68/84 | 7 → 63/81/84/93 | 5 → 81/91/93/97 ⚠️ | 5 → 81/91/93/97 ⚠️ |
| Tir à l'arc | 8 → 31/52/58/77 | 8 → 31/52/58/77 | 6 → 52/73/77/89 | 6 → 52/73/77/94 | 4,5 → 68/84/87/94 |
| Le chaudron | 10 → 27/39/58/77 | 8 → 48/61/77/89 | 7 → 59/71/84/93 | 7 → 59/71/84/93 | 6 → 69/80/89/95 |
| Les bulles | 10 → 34/44/58/77 | 10 → 34/44/58/77 | 9 → 44/56/68/84 | 9 → 44/56/68/84 | 8 → 56/66/77/89 |
| Le bon mélange | 8 → 27/39/58/77 | 8 → 27/39/58/77 | 7 → 37/50/68/84 | 7 → 37/50/68/84 | 6 → 48/61/77/89 |
| Les 7 différences | 10 → 34/47/58/77 | 10 → 34/47/58/77 | 10 → 34/47/58/77 | 9,3 → 41/54/65/82 | 9,3 → 41/54/65/82 |
| Le double | 10 → 41/47/58/77 | 10 → 41/47/58/77 | 10 → 41/47/58/77 | 9,3 → 49/54/65/82 | 9,3 → 49/54/65/82 |
| Le grand ménage | 10 → 34/47/58/77 | 10 → 34/47/58/77 | 10 → 34/47/58/77 | 9,3 → 41/54/65/82 | 9,3 → 41/54/65/82 |
| Repérer le mensonge | 10 → 34/47/58/77 | 9,4 → 40/53/64/82 | 7,1 → 51/76/83/93 | 7,1 → 65/76/83/93 | 1,6 → 65/76/98/99 ⚠️ |
| Les ragots | 10 → 19/27/58/77 | 8,8 → 29/39/70/85 | 8,8 → 29/39/70/85 | 8 → 37/48/77/89 | 8 → 37/48/77/89 |
| Les mots perdus | 10 → 19/27/58/77 | 9,5 → 19/27/63/81 | 9,5 → 23/32/63/81 | 8,5 → 23/32/73/87 | 8,5 → 32/42/73/87 |
| L'alphabet secret | 10 → 19/27/58/77 | 9,6 → 22/31/62/80 | 8,1 → 36/47/76/89 | 8,1 → 36/47/76/89 | 8,1 → 36/47/76/89 |
| Superposer les plans | 10 → 21/31/58/77 | 8,2 → 37/50/76/88 | 7,9 → 40/54/78/90 | 7,9 → 40/54/78/90 | 7,9 → 40/54/78/90 |
| La grille | 7 → 21/31/58/77 | 6,6 → 24/35/62/80 | 6,3 → 26/38/65/82 | 5,5 → 34/47/73/87 | 5,1 → 34/47/76/89 |
| Assembler les runes | 10 → 21/31/58/77 | 10 → 21/31/58/77 | 8,9 → 30/42/69/85 | 8,9 → 30/42/69/85 | 8,9 → 30/42/69/85 |

**Le plafond est déjà dans le moteur** depuis le 2 novembre (calibrage « fixe », décision n° 4 du document de design), et c'est une bonne chose. Sans lui :

- le tir, la course-poursuite et le mélange montaient au niveau 10 dès l'enquête 3, et le tir tombait à 36 % pour un adulte, juste au moment où l'enfant achète son premier arc ;
- la grille montait au niveau 10 à l'enquête 4 et tombait à 33 % à l'enquête 5.

**Ce qui va bien :** la plupart des jeux passent d'environ 58 % à 75-90 % pour un adulte moyen à l'enquête 9. Ils sont plus faciles, mais on peut encore rater. Les jeux de lecture restent durs pour les enfants (ragots, mots perdus, alphabet : 32 à 37 % à l'enquête 9). C'est normal à 8 ans, et c'est le Sage ou un adulte qui les joue souvent.

**Ce qui va mal :**

- **Suivre la piste** est facile dès l'enquête 3 (88 %), avec trois objets à 35-40 pièces et le talent Pistage.
- **Se cacher** est presque gratuit à l'enquête 7.
- **Repérer le mensonge** est presque gratuit à l'enquête 9, dès que l'ensemble Vérité est complet avec Oreille absolue : il ne reste qu'une sorte de signe à surveiller, et les signes durent plus longtemps.
- **Les jeux d'observation de l'Alchimiste** (7 différences, Le double, Le grand ménage) n'ont presque aucune aide : 2 objets à peine. Ils restent à 41-49 % pour Alicia à l'enquête 9. C'est dur pour une enfant, alors que Le double sert d'analyse clé de voûte. Il faut un peu d'aide (voir le chapitre 6).

### 4.4 Quand on empile tout ce qui aide (pire cas, enquête 9)

| Mini-jeu | Niveau au pire | Enfant / adulte moyen | Verdict | Ce qui s'empile |
|---|---|---|---|---|
| Suivre la piste | 1 | 96 % / 99 % | presque gratuit ⚠️ | Pistage, Compagnon ; lanternes, gants, 3 paires de bottes, ensemble Lune |
| Course-poursuite | 1 | 91 % / 97 % | **gratuit** (Course du loup : 2 réussites sans jouer) | Réflexes ; Bottes de vent, Bracelets, Bottes des Fondateurs ; potion de rapidité |
| Se cacher | 1 | 96 % / 99 % | presque gratuit ⚠️ | Réflexes, Camouflage ; Cape, Masque, ensemble Ombre ; potion d'invisibilité (facile 3) |
| Tir à l'arc | 1 | 91 % / 97 % | presque gratuit ⚠️ | Réflexes, Tir précis ; 4 arcs et carquois (Arc d'argent : facile 3) |
| Le chaudron | 4,5 | 82 % / 94 % | presque gratuit ⚠️ | Main sûre ; Thermomètre, Chaudron de cuivre |
| Repérer le mensonge | 1 | 97 % / 99 % | presque gratuit ⚠️ | Oreille absolue, Mémoire ; ensemble Vérité (facile 3) ; potion de vérité (facile 3) |
| Superposer les plans | 4,4 | 77 % / 95 % | presque gratuit ⚠️ | Cartographe (le calque se colle tout seul) ; Lunettes ; potion de clarté |
| Assembler les runes | 5,1 | 70 % / 93 % | **gratuit** (Couronne de runes : 9 réussites sans jouer) | Déchiffreur ; Pierre-runes, Bâton de cristal ; potion de clarté |
| Bulles, 7 différences, Le double, Le grand ménage, ragots, mots perdus, grille | 8 à 9,3 (grille 4,7) | 41-56 % / 65-79 % | restent durs | très peu d'aides |

Ce pire cas coûte souvent très cher : 250 à 680 pièces pour les jeux du Pisteur, le chaudron et les runes, soit à peu près tout l'or d'une saison. Mais trois pièges sont accessibles :

- les **plans**, presque gratuits pour seulement 85 pièces avec le talent Cartographe ;

- l'**ensemble Vérité** (265 pièces), qu'un Barde atteint vers l'enquête 9 ;
- les **pouvoirs « réussir sans jouer »** (Course du loup, Couronne de runes, Athanor), qui suppriment le mini-jeu.

Les chiffres à changer sont au chapitre 6.

---

## 5. La chance de résoudre chaque enquête (question 5)

### 5.1 Les enquêtes actuelles (e1.js, e2.js, e3.js), règles d'aujourd'hui

« Une seule solution » = l'équipe a tous les indices qu'il faut. « Gagné » = avec les 3 essais d'accusation et le message « une partie est juste ».

| Enquête | Équipe | Une seule solution à la fin | Gagné du 1er coup | Gagné | **Perdu** |
|---|---|---|---|---|---|
| E1 | 4 enfants | 51 % | 52 % | 87 % | **13 %** |
| E1 | famille | 82 % | 84 % | 96 % | 4 % |
| E1 | 4 adultes moyens | 90 % | 90 % | 98 % | 2 % |
| E1 | 4 adultes forts | 98 % | 98 % | 99,7 % | 0 % |
| E2 | 4 enfants | 87 % | 77 % | 99 % | 1 % |
| E2 | famille / adultes | 100 % | 95-99 % | 100 % | 0 % |
| E3 | 4 enfants | 91 % | 80 % | 99,9 % | 0 % |
| E3 | famille / adultes | 99-100 % | 95-99 % | 100 % | 0 % |

**Les goulots d'étranglement**, c'est-à-dire la chance d'obtenir un indice, pour les enfants puis pour la famille :

- **E1, fait n° 1 (traces du massif) : 60 % / 85 %.** C'est le seul chemin pour rayer Gaspard, Basile et Victor : s'il est raté, il reste 4 suspects. L'enquête 1 réécrite ajoute un indice partiel et des essais illimités : c'est indispensable avec la mort des héros.
- **E2, fait n° 5 (guetter devant la mairie, poursuite) : 47 % / 74 %.** Mais d'autres faits couvrent, sauf pour Odette.
- **E2, fait n° 8 (écoute au lavoir) : 3 % / 15 %.** Il faut une potion d'invisibilité cuite à temps (la brume ne se cueille que le matin ou la nuit) **et** réussir les mots perdus en un seul essai. Heureusement, ce fait n'est pas indispensable.
- **E3, fait n° 5 (guetter au moulin la nuit) : 38 % / 62 %.** Il n'y a qu'une nuit, donc un seul essai. Les plans du Sage couvrent.

Note : la simulation ne raisonne que par élimination, comme le vérificateur. De vrais joueurs devinent aussi avec les indices « positifs » (Tim, la suie, le chien…). Les vraies chances sont donc un peu meilleures, surtout à l'enquête 1.

### 5.2 La saison entière avec les règles du document de design (mort des héros)

J'ai résumé chaque enquête par ses **clés de voûte**. Pour les enquêtes 1 à 3, ce sont celles du document. Pour les enquêtes 4 à 9, j'applique sa règle : 3 clés sur 3 rôles, un seul essai, pas d'indice partiel. Le Sage utilise « Encore une fois » et « Souffler » une fois chacun par enquête. L'accusation se fait avec 3 cœurs. La Page des Fondateurs et l'Élixir ne sont pas comptés : ce sont des marges en plus.

**Le résultat dépend surtout d'une chose : combien de possibilités laisse une clé ratée.**

| Chance de finir les enquêtes 1 à 9 sans tout recommencer | Une clé ratée laisse **2** possibilités | Une clé ratée laisse **4** possibilités |
|---|---|---|
| 4 enfants, règles du document | 94 % | **24 %** |
| 4 enfants, document **sans** les pouvoirs du Sage | 78 % | (encore moins) |
| 4 enfants, document + difficulté automatique | **99,7 %** | **81 %** |
| Famille, règles du document | 99 % | **61 %** |
| Famille, document + difficulté automatique | 99,8 % | **75 %** |
| 4 adultes moyens, règles du document | 99,9 % | 80 % |
| 4 adultes moyens, document + difficulté automatique (+1 cran) | 99,6 % | **65 %** |
| 4 adultes forts, document / + difficulté automatique | 100 % / 100 % | 96 % / 91 % |

**Le +1 cran des adultes coûte cher si les clés de voûte sont mal écrites :** sur toute la saison, 4 adultes moyens passent de 80 % à 65 % dans le cas « 4 possibilités ». Si vous jouez souvent à 4 adultes, n'activez ce +1 que si les enquêtes respectent la règle des 2 possibilités, ou mettez-le seulement sur les mini-jeux facultatifs (missions bonus, coffres, cueillettes rares).

**Le guide d'écriture des enquêtes 4 à 9.** Voici la chance de perdre UNE enquête de niveau 9, avec un seul essai par mini-jeu, les pouvoirs du Sage et les règles proposées :

| | 2 clés | 3 clés | 4 clés | 6 clés |
|---|---|---|---|---|
| Famille, une clé ratée laisse 2 possibilités | 0 % | 0 % | 0 % | 1 % |
| Famille, … 3 possibilités | 0 % | 1 % | 2 % | 7 % |
| Famille, … 4 possibilités | 5 % | 8 % | 9 % | 21 % |
| 4 enfants, … 2 possibilités | 0 % | 0 % | 1 % | 3 % |
| 4 enfants, … 4 possibilités | 3 % | 12 % | 17 % | 28 % |

**Règles d'écriture que je recommande :**

1. Au plus **3 clés de voûte** par enquête, sur 3 rôles différents. C'est la règle du document, et elle est bonne.
2. **Une clé ratée doit laisser au plus 2 possibilités.** C'est la règle la plus importante. Par exemple : « c'est Margot ou Mélusine ». Pas : « on ne peut plus rayer 3 suspects ».
3. Si un indice raye beaucoup de monde d'un coup (comme les traces de l'enquête 1, qui rayent 3 suspects), il lui faut un **chemin de secours**.
4. **Répartir les indices sur la journée**, avec des choses qui n'arrivent que l'après-midi, le soir ou la nuit. Ça casse le bouchon du matin (chapitre 1).
5. Une potion qui sert de clé de voûte demande des ingrédients **en double**. Un raté au chaudron fait perdre les ingrédients, et certains ne se cueillent qu'à un moment précis.

### 5.3 Passer à 2 cœurs : à l'enquête 5 ou 6 ? (question ouverte du document)

Chance de finir la saison sans recommencer, avec la difficulté automatique. « + élixir » veut dire que l'Alchimiste tente l'Élixir du Cœur vaillant à chaque enquête : si son chaudron réussit, le Sage a un cœur de plus.

| Équipe | 3 cœurs partout | 2 dès E6 | 2 dès E5 | 2 dès E6 + élixir | 2 dès E5 + élixir |
|---|---|---|---|---|---|
| *Une clé ratée laisse 2 possibilités* | | | | | |
| 4 enfants | 99,7 % | 97 % | 95 % | 99 % | 98 % |
| Famille | 99,8 % | 98 % | 97 % | 99 % | 99 % |
| 4 adultes moyens | 99,6 % | 97 % | 94 % | 99 % | 98 % |
| *Une clé ratée laisse 4 possibilités* | | | | | |
| 4 enfants | 81 % | 74 % | 70 % | 79 % | 78 % |
| Famille | 75 % | 67 % | 63 % | 72 % | 70 % |
| 4 adultes moyens | 65 % | 55 % | 50 % | 62 % | 61 % |

**Ma réponse :** passer à 2 cœurs **à l'enquête 6, pas avant**, et seulement si l'Élixir est facile à avoir. C'est la question ouverte n° 2 du document : un élixir **sans ingrédient rare**, et je dis oui. Avec l'élixir, on retrouve presque la sécurité de 3 cœurs. Sans lui, et avec des clés de voûte mal écrites, la famille perd 8 points de chance de finir la saison (de 75 % à 67 %).

L'enquête 5 est la plus risquée de la projection. C'est l'enquête de l'Alchimiste : chaudron, mots perdus et grille comme clés de voûte, avec 37 à 54 % de réussite pour des enfants ou des adultes moyens sur les deux dernières. Enlever un cœur à ce moment-là, c'est cumuler deux marches.

---

## 6. Les chiffres à changer (liste, rien n'est appliqué)

### A. Actions et réserve

1. **Actions par moment** (`M.actionsMax`, dans `moteur-base.js`) : Alchimiste 3, Pisteur 2, Barde 2, Sage 2. On garde le bonus des objets et talents, et on ajoute +1 pour tous dans une équipe de 4 enfants.
2. **Réserve du Sage** (nouveau) : 3 actions par enquête, 4 pour une équipe de 4 enfants. Au plus 1 don par équipier et par moment. Le code n'est valable que pour le rôle choisi et une seule fois. On le donne depuis le menu ou le Grand Livre du Sage.
3. **Corriger le code « une action en plus »** (talent Inspiration, Cor du rassemblement). Il est destiné à « tous », donc chacune des 4 tablettes peut le taper une fois : il donne jusqu'à 4 actions au lieu d'une. Il faut le faire passer par la réserve (+1 réserve chacun).
4. **Ensemble Chef** : remplacer « +1 action par moment pour toi » par « +2 à la réserve ».
5. **Rejouer un mini-jeu raté dans un lieu** (`A.point`, dans `moteur-actions.js`). Aujourd'hui, si on rate, on peut **rejouer tout de suite, gratuitement, autant qu'on veut**, tant qu'on n'a pas quitté le lieu, alors que le texte dit « Reviens plus tard ». Il faut appliquer la règle du document : un nouvel essai coûte 1 action, le nombre d'essais dépend de l'enquête, et à partir de l'enquête 4 il n'y a qu'un essai.
6. **Les pages du Sage avec un mini-jeu et sans action** (la lettre secrète de l'enquête 2) se rejouent aussi gratuitement à l'infini. Il faut leur donner la même règle.

### B. Niveau des mini-jeux

7. **Plafond au niveau validé : déjà fait** (`fixe:true` dans `MJ.CALIBRAGE`, `mj-core.js`). Le tir, la poursuite et le mélange restent au niveau 8, et la grille au niveau 7, toute la saison. L'outil suit le moteur.
8. **Difficulté automatique.** Attention : avec `fixe`, `MJ.reglages` ne regarde plus le niveau envoyé par le moteur. Le décalage ne peut donc plus passer par `M.decalage` (qui renvoie toujours 2) : il faut un réglage à part, ajouté **après** le calcul du niveau de base, et avant « facile ». C'est le décalage du tableau du chapitre 3.2, selon la tranche d'âge du joueur, la composition de l'équipe et le numéro de l'enquête. L'écran doit afficher le résultat comme niveau de départ, pour que ça reste discret.
9. **Un plancher pour que rien ne soit gratuit** : au plus 3 crans de « facile » cumulés par jeu, et une zone de réussite au plus ×1,5 en tout. C'est la façon la plus simple de garantir « jamais gratuit à l'enquête 9 », même avec des combinaisons qu'on n'a pas prévues.
10. **Le jeu « ordre »** (remettre une conversation dans l'ordre) n'a pas de calibrage. S'il revient dans une enquête, il faut le régler dans la salle. Sinon, il montera tout seul jusqu'au niveau 11 à l'enquête 9.

### C. Objets et talents (dans `donnees.js`)

| Jeu | À changer | Pourquoi |
|---|---|---|
| Suivre la piste | Lanterne de lune : zone ×1,5 → ×1,3. Ensemble Rôdeur de lune : enlever le « zone ×1,2 », garder « toutes les traces visibles ». | Facile dès l'enquête 3, gratuit en empilant |
| Se cacher | Masque d'ombre facile 2 → 1. Ensemble Ombre facile 2 → 1. Camouflage facile 2 → 1. Potion d'invisibilité (pour se cacher) facile 3 → 2. Fumigène facile 2 → 1. | 6 sources de « facile » s'empilent jusqu'au niveau 1 |
| Tir à l'arc | Arc d'argent facile 3 → 2. Tir précis facile 2 → 1, plus une zone ×1,2. | Niveau 1 en empilant |
| Course-poursuite | Bottes des Fondateurs facile 3 → 2. **Course du loup** : au lieu de « réussir sans jouer, 2 fois », « une erreur pardonnée à chaque poursuite ». | Gagner sans jouer supprime le jeu |
| Repérer le mensonge | Ensemble Vérité : facile 3 → 1 (garder « les signes durent plus longtemps »). Miroir : 2 signes en moins → 1. Oreille absolue : 2 → 1. Potion de vérité : facile 3 → 2. Ne jamais retirer plus de 3 sortes de signes. | Gratuit à l'enquête 9 avec les achats normaux |
| Assembler les runes | **Couronne de runes** : au lieu de « 9 réussites sans jouer », « un sceau s'ouvre sans mini-jeu, une fois par enquête ». | Supprime le jeu des runes |
| Le chaudron | **Athanor** : au lieu d'« une potion réussie d'office à chaque moment », « une fois par enquête ». À noter : l'Athanor n'est même pas branché dans le nouvel atelier. | Supprime le chaudron |
| Superposer les plans | Cartographe : au lieu de « le calque se colle tout seul », « l'échelle est déjà bonne ». Potion de clarté : zone ×1,4 → ×1,2 pour les plans. | Presque gratuit en empilant |
| Le double, les 7 différences, le grand ménage | **Aider un peu plus** : les Lunettes d'alchimiste passent à 2 indices pour Le double. L'Œil de lynx du document va dans le bon sens. On peut aussi ajouter un petit objet du palier 1, une loupe de poche (1 indice au Double). | Restent à 41-49 % pour une enfant à l'enquête 9, alors que Le double est une clé de voûte |

### D. Progression et économie

11. **Seuils d'XP** (`D.SEUILS`) : `[0, 120, 250, 380, 510, 640, 770, 900, 1030, 1160]`. Le niveau devient le numéro de l'enquête, et le talent de niveau 10 arrive pour le final.
12. **Mode test** : donner 60 pièces par enquête passée au lieu de 120, pour tester avec l'or qu'on aura vraiment.
13. La Bible dit que vendre une potion coûte une action ; aujourd'hui c'est gratuit. À décider.

### E. Le vérificateur

14. Le « Budget (actions utiles / disponibles) » de `tools/verif.js` ne compte que la première source de chaque fait. Il oublie les potions, les cueillettes et les ratés. `tools/equilibre.js` le remplace pour cette question.

---

## 7. Ce qu'on ne peut pas savoir sans jouer, et le journal de statistiques

### 7.1 Ce qui est supposé (et peut tout changer)

| Supposition | Valeur prise | Où la changer |
|---|---|---|
| Chance de réussir chaque mini-jeu, pour chaque type de joueur | Adulte moyen : 58 % au niveau validé. Enfant : 16 à 41 %. Naïm : 27 à 52 %. Adulte fort : 77 %. Chaque cran en plus multiplie les chances de rater par 1,57. | `tools/proba-minijeux.json` (profils, pente) |
| Ce que vaut chaque aide, en crans | « facile » = 1 cran (c'est le moteur). Zone ×1,25 ≈ 1 cran. Un indice ≈ 0,4 à 1,2 cran selon le jeu. Les signes durent plus longtemps ≈ 1,5 cran, etc. | `tools/proba-minijeux.json` (mods). `node tools/equilibre.js --reglages` montre ce que chaque objet change vraiment dans les réglages du jeu. |
| Erreur de raisonnement à l'accusation | Enfants 15 %, famille et adultes 4 %, adultes forts 1 % | `tools/proba-minijeux.json` (raisonnement) |
| Actions « perdues » par curiosité | Enfant 30 %, Naïm 20 %, adulte 12 %, adulte fort 5 % | `tools/proba-minijeux.json` (efficacité) |
| Durée des actions et des mini-jeux | Chaudron 2,5 min, grille 6 min, parler 1,5 min… | `tools/proba-minijeux.json` (durées) |
| Qui joue quoi dans la famille | Naïm Pisteur, Alicia Alchimiste, Siham Barde, Romain Sage | en haut de `tools/equilibre.js` |
| Clés de voûte des enquêtes 4 à 9 | 3 par enquête, un mini-jeu chacune, 2 possibilités si ratée | en haut de `tools/equilibre.js` (projection) |
| Les joueurs simulés | Ils raisonnent seulement par élimination et jouent « raisonnablement » | — |

La plus grosse inconnue, ce sont **les enfants** : 8 ans, lecture, Naïm qui est très fort. Après 2 ou 3 soirées avec le journal ci-dessous, on pourra remplacer les suppositions par de vrais chiffres.

### 7.2 Le journal de statistiques (cahier des charges, pas encore codé)

**But :** garder sur chaque tablette, sans connexion, ce qui s'est passé dans chaque mini-jeu et dans chaque enquête. Ensuite, on recolle tout et on recalibre les chances de réussite.

**Où :**

- une clé à part dans la mémoire de la tablette, `brumeval-stats`, **séparée des héros**. Elle doit survivre à « Effacer ce héros » et à la défaite ;
- au plus 3 000 lignes (environ 300 Ko) : quand c'est plein, les plus anciennes s'effacent.

**Une ligne par mini-jeu joué** (y compris dans la salle des mini-jeux, marquée « salle ») :

| Donnée | Exemple | Pourquoi |
|---|---|---|
| quand | 2026-11-08 20:41 | trier les soirées |
| version du jeu | date de construction | savoir avec quels réglages on jouait |
| tablette | un code tiré au hasard une fois | recoller les 4 tablettes sans prénom |
| rôle du héros | pisteur | |
| tranche d'âge du joueur | enfant / adulte (choisie à la création) | le cœur du recalibrage |
| composition de l'équipe | 2 enfants + 2 adultes | vérifier la difficulté automatique |
| enquête, moment | 2, soir | |
| où | point « mairie:guet », page, analyse, écoute, mission bonus, cuisson, démasquer, coffre, cueillette rare, salle | séparer « indice » et « bonus » |
| type de mini-jeu | cachette | |
| niveau de base, décalage automatique, niveau effectif | 10, −1, 8 | |
| aides | ids des talents, objets et potion utilisés, et les mods obtenus (`{facile:1, zone:1,25}`) | mesurer ce que vaut chaque objet |
| résultat | réussi oui/non, score, erreurs | |
| deuxième chance utilisée | oui/non | |
| essai unique | oui/non | |
| réussi sans jouer | oui/non, et par quoi | repérer les pouvoirs trop forts |
| pouvoir du Sage | aucun / Encore une fois / Souffler / Page | |
| durée | en secondes | mesurer la longueur des soirées |
| abandonné | oui/non (🏳️ ou fermé) | un jeu trop dur, ou trop long |

**Une ligne par enquête terminée :**

- gagnée ou perdue, cœurs perdus, pouvoirs du Sage utilisés, Élixir bu ;
- faits obtenus (les mêmes noms que dans `faits`), donc les indices ratés ;
- **actions par moment** : utilisées, et restées en trop au passage du moment ;
- réserve donnée (à qui, à quel moment) ;
- durée totale et durée de chaque moment ;
- or gagné, missions bonus réussies ou ratées.

**Dans les Réglages :**

- « 📊 **Copier mes statistiques** » : copie le texte (comme « Copier ma sauvegarde », avec une zone de texte de secours) et affiche « 312 mini-jeux, 4 enquêtes ».
- « Effacer les statistiques » (avec une confirmation).

**Format du texte copié :** `{"jeu":"brumeval-stats","v":1,"tablette":"k7f2","lignes":[…]}`, avec des noms courts pour que ça reste petit.

**Pour recalibrer :**

1. On colle les 4 textes dans un fichier.
2. Pour chaque tranche d'âge, chaque jeu et chaque niveau effectif, on compte les réussites.
3. On ajuste le « niveau où l'on réussit une fois sur deux » de chaque profil dans `tools/proba-minijeux.json`.

Il faut environ 20 parties par case pour une précision d'environ ± 10 points. La salle des mini-jeux est le moyen le plus rapide d'en avoir. On pourra ajouter plus tard à `equilibre.js` une option `--stats` qui fait ce calcul toute seule.

**Vie privée :** tout reste sur la tablette, aucun prénom, seulement le rôle et « enfant / adulte ».
