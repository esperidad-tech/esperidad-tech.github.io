# Le donjon du puits — la difficulté, prouvée par la simulation

> Écrit par `node equilibre.js 2000 --md` avec les règles de `src/regles.js` et les chiffres de `src/donnees.js`.
> 2000 parties par ligne. Ne pas corriger ce fichier à la main : changer un chiffre dans `donnees.js`, puis relancer.

## Les chiffres retenus

Les PV sont ceux des fiches du bestiaire. Les chiffres du rat d'égout et des héros sont ceux de la salle d'essai : ils n'ont pas bougé.

| Monstre | Rang | PV | Attaque |
|---|---|---|---|
| Rat d'égout | normal | 40 | morsure 8 (2 fois si « enrage ») |
| Rat cuirassé | normal | 70 | coup-de-tete 18 (+6 si « rougeoie ») |
| Chauve-souris de la brume | normal | 25 | pique 30 (2 fois si « folle ») |
| Feu follet | normal | 30 | brulure 18 sur 2 héros |
| Araignée des caves | normal | 60 | morsure 18 ; toile : le héros passe son tour |
| Petite araignée | normal | 15 | morsure 6 |
| Têtard du puits | normal | 15 | morsure 8 |
| Le Roi des rats | elite | 220 | grouillement 16 sur chaque héros ; charge 30 |
| Le Gardien de rouille | elite | 280 | poing 40 sur le héros de devant (+10 si « rougeoie ») (doublé si « enrage ») |
| Bourbe, le crapaud du puits | boss | 1000 | langue 30, et il avale ; saut 28 sur chaque héros (doublé si « gonfle ») |

Héros : Pisteur 120 PV, Alchimiste 100, Sage 90. Herbes +20, Baume +40, Baume lumineux +15 à chacun, Cœur vaillant : relève avec 40, feu de camp : la moitié des PV max. Bouclier de runes : la moitié des coups. Critique : 60 / 75 (flèche / dague) sur un monstre normal, 110 / 140 sur un élite, 300 / 380 sur le boss.

## Les équipes

- **Maligne** : le Sage étudie ce qu'il ne connaît pas, les deux autres se servent tout de suite de ce qu'il lit ; elle ouvre les points faibles dans l'ordre, soigne quand un ami va tomber, protège celui qui est visé, sauvegarde avant les trois grandes portes. Sac : Fumigène, Acide, Baume (puis Feu, Fumigène, Baume au feu de camp) ; flèches lourdes ; bâton de chêne.
- **Sans le Sage** : elle joue aussi bien (soins, boucliers, elle tire sur tout ce qui est ouvert), mais n'étudie jamais et ne connaît aucun combo.
- **Tape sans réfléchir** : flèche ou dague sur la bête de devant, coup de louche, bouclier sur le Pisteur.
- **Au hasard** : des gestes permis tirés au hasard.
- **À tâtons** (en plus, pour vérifier que « sans le Sage » tient vraiment) : comme « sans le Sage », mais elle essaie sur chaque bête les pouvoirs qu'elle n'a jamais essayés, et retient ce qui a ouvert ou renforcé.

## 1. Salle par salle (on arrive à pleins PV)

« Tours » et « PV restants » : la moyenne des combats gagnés (les trois héros ont 310 PV en tout). « Tombe au tour » : la moyenne des combats perdus. « Ni l'un ni l'autre » : l'équipe tient debout à force de soins et de boucliers, mais ne peut rien faire au monstre : il ne lui reste qu'à fuir. Toutes les équipes ont ici le sac et les objets de la maligne (c'est le cas le plus favorable pour elles). L'équipe maligne arrive en ayant lu une ligne sur chaque bête déjà croisée dans les salles d'avant, rien sur les nouvelles.

### La salle des rats — Rat d'égout, Rat d'égout, Rat d'égout

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 4,0 | 293 | — | — |
| Sans le Sage | 100,0 % | 19,6 | 287 | — | — |
| Tape sans réfléchir | 12,9 % | 12,1 | 108 | 12,5 | — |
| Tape, avec le feu au lieu de la louche | 100,0 % | 13,1 | 180 | — | — |
| Au hasard | 29,2 % | 11,7 | 186 | 12,3 | 0,1 % |
| Sans le Sage, à tâtons | 100,0 % | 3,0 | 275 | — | — |

### Les canaux de la ville d'avant — Rat d'égout, Chauve-souris de la brume, Chauve-souris de la brume

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 3,0 | 256 | — | — |
| Sans le Sage | 100,0 % | 21,2 | 264 | — | — |
| Tape sans réfléchir | 15,9 % | 5,3 | 159 | 6,7 | — |
| Tape, avec le feu au lieu de la louche | 12,0 % | 7,7 | 94 | 8,2 | — |
| Au hasard | 4,2 % | 6,6 | 168 | 5,6 | — |
| Sans le Sage, à tâtons | 75,0 % | 4,1 | 200 | 8,4 | 0,5 % |

### La cave aux toiles — Araignée des caves, Feu follet, Feu follet

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 4,3 | 228 | — | — |
| Sans le Sage | 100,0 % | 11,7 | 287 | — | — |
| Tape sans réfléchir | 21,4 % | 4,5 | 140 | 5,9 | — |
| Tape, avec le feu au lieu de la louche | 20,1 % | 4,5 | 146 | 5,9 | — |
| Au hasard | 16,6 % | 9,1 | 164 | 6,9 | 0,6 % |
| Sans le Sage, à tâtons | 99,6 % | 4,2 | 171 | 10,3 | — |

### L'atelier des Fondateurs — Rat cuirassé, Le Gardien de rouille

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 5,0 | 232 | — | — |
| Sans le Sage | 0,0 % | — | — | — | 100,0 % |
| Tape sans réfléchir | 0,0 % | — | — | 11,4 | — |
| Tape, avec le feu au lieu de la louche | 0,0 % | — | — | 14,0 | — |
| Au hasard | 0,3 % | 5,0 | 196 | 8,5 | — |
| Sans le Sage, à tâtons | 20,4 % | 4,5 | 229 | — | 79,7 % |

### L'ossuaire — Le Roi des rats, Feu follet, Feu follet

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 4,0 | 224 | — | — |
| Sans le Sage | 0,0 % | — | — | — | 100,0 % |
| Tape sans réfléchir | 2,8 % | 5,0 | 41 | 4,0 | — |
| Tape, avec le feu au lieu de la louche | 0,0 % | — | — | 4,1 | — |
| Au hasard | 0,2 % | 15,3 | 101 | 4,9 | 0,5 % |
| Sans le Sage, à tâtons | 5,0 % | 11,2 | 82 | 11,3 | 12,7 % |

### Le grand bassin — Têtard du puits, Têtard du puits, Bourbe, le crapaud du puits

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 6,7 | 219 | — | — |
| Sans le Sage | 0,0 % | — | — | — | 100,0 % |
| Tape sans réfléchir | 0,0 % | — | — | 6,0 | — |
| Tape, avec le feu au lieu de la louche | 0,0 % | — | — | 8,8 | — |
| Au hasard | 0,1 % | 6,5 | 162 | 6,1 | — |
| Sans le Sage, à tâtons | 0,0 % | — | — | 7,9 | 15,3 % |

### Les égouts tournants — Rat d'égout

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 1,0 | 310 | — | — |
| Sans le Sage | 100,0 % | 6,5 | 300 | — | — |
| Tape sans réfléchir | 100,0 % | 6,2 | 251 | — | — |
| Tape, avec le feu au lieu de la louche | 100,0 % | 4,4 | 291 | — | — |
| Au hasard | 100,0 % | 4,0 | 286 | — | — |
| Sans le Sage, à tâtons | 100,0 % | 1,0 | 310 | — | — |

### La fausse crypte — Chauve-souris de la brume, Chauve-souris de la brume

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 2,0 | 295 | — | — |
| Sans le Sage | 100,0 % | 8,9 | 268 | — | — |
| Tape sans réfléchir | 98,1 % | 3,6 | 240 | 12,3 | — |
| Tape, avec le feu au lieu de la louche | 99,5 % | 5,9 | 168 | 11,1 | — |
| Au hasard | 17,8 % | 4,9 | 173 | 5,5 | — |
| Sans le Sage, à tâtons | 98,8 % | 3,7 | 216 | 13,5 | — |

## 2. Le soin infini ne suffit pas

Le plus gros soin d'un geste : 45 PV (Baume 40 ; Baume lumineux 3 × 15 ; Herbes 20). Ce que les monstres d'une salle enlèvent par tour, à pleine force et sans piège :

| Salle | Les monstres | Par tour | Plus que le soin ? |
|---|---|---|---|
| La salle des rats | Rat d'égout 8 + Rat d'égout 8 + Rat d'égout 8 | 24 | l'apprentissage |
| Les canaux de la ville d'avant | Rat d'égout 8 + Chauve-souris de la brume 30 + Chauve-souris de la brume 30 | 68 | oui |
| La cave aux toiles | Araignée des caves 9 + Feu follet 36 + Feu follet 36 | 81 | oui |
| L'atelier des Fondateurs | Rat cuirassé 18 + Le Gardien de rouille 40 | 58 | oui |
| L'ossuaire | Le Roi des rats 48 + Feu follet 36 + Feu follet 36 | 120 | oui |
| Le grand bassin | Têtard du puits 8 + Têtard du puits 8 + Bourbe, le crapaud du puits 57 | 73 | oui |

## 3. Avec les « mauvaises » potions : il reste toujours une sortie, plus difficile

L'équipe maligne, le Grand Livre déjà lu en entier (elle est déjà venue), à pleins PV, sans flèches spéciales ni bâton. Trois sacs : le bon ; « Huile, Colle, Cœur vaillant » (aucune des potions attendues, et pas de Baume) ; « Baume, Cœur vaillant, Huile » (que du soin). Aux canaux, aucune potion n'est nécessaire (le bruit et la lumière sont des gestes) : ils ne sont pas dans ce tableau.

| Salle | Le bon sac | Huile, Colle, Cœur | Baume, Cœur, Huile |
|---|---|---|---|
| La cave aux toiles | 100,0 % · 3,2 tours · 288 PV | 100,0 % · 4,5 tours · 233 PV | 100,0 % · 4,5 tours · 248 PV |
| L'atelier des Fondateurs | 100,0 % · 4,0 tours · 232 PV | 34,9 % · 13,1 tours · 146 PV | 100,0 % · 7,4 tours · 249 PV |
| L'ossuaire | 100,0 % · 6,0 tours · 261 PV | 95,4 % · 5,0 tours · 114 PV | 100,0 % · 4,9 tours · 145 PV |
| Le grand bassin | 100,0 % · 5,6 tours · 196 PV | 100,0 % · 10,2 tours · 171 PV | 100,0 % · 10,2 tours · 220 PV |

## 4. Le donjon entier

Le chemin long, du fond du puits à Léo. Les PV ne reviennent pas entre les salles ; le feu de camp rend la moitié des PV max, une fois entre deux combats. « D'une traite » : sans tomber une seule fois. Une défaite recharge la dernière sauvegarde (le Grand Livre garde ce qu'il a lu) et l'équipe réessaie.

| Équipe | D'une traite | Avec 1 rechargement au plus | Avec 2 au plus | Défaites par descente | Un héros dans le rouge | Un héros au sol |
|---|---|---|---|---|---|---|
| Maligne (lourdes, bâton, passage secret) | 100,0 % | 100,0 % | 100,0 % | 0,00 | 98 % | 0 % |
| … avec la sacoche (Feu en plus, puis Cœur vaillant) | 100,0 % | 100,0 % | 100,0 % | 0,00 | 98 % | 0 % |
| … avec les flèches d'argent | 100,0 % | 100,0 % | 100,0 % | 0,00 | 98 % | 0 % |
| … sans le passage secret (un seul feu de camp) | 99,5 % | 100,0 % | 100,0 % | 0,01 | 100 % | 1 % |
| … avec le cristal de lune au lieu du bâton | 100,0 % | 100,0 % | 100,0 % | 0,00 | 99 % | 0 % |
| … qui passe par la fausse crypte (l'amulette) | 100,0 % | 100,0 % | 100,0 % | 0,00 | 90 % | 0 % |
| … sans aucune sauvegarde | 100,0 % | 100,0 % | 100,0 % | 0,00 | 98 % | 0 % |
| … qui garde le sac de la salle des rats (Feu, Huile, Baume) jusqu'au feu de camp | 46,2 % | 84,8 % | 95,3 % | 0,75 | 100 % | 57 % |
| Distraite : un geste sur dix joué au hasard | 69,3 % | 94,7 % | 99,3 % | 0,37 | 99 % | 32 % |
| Très distraite : un geste sur quatre joué au hasard | 13,7 % | 41,4 % | 66,0 % | 2,08 | 100 % | 88 % |

« Un héros dans le rouge » : au moins une fois dans la descente, un héros a fini un tour avec un quart de ses PV ou moins (ou au sol). C'est ce qu'on appelle ici un moment chaud. Les deux dernières lignes montrent ce que coûtent les étourderies : c'est plus près d'une vraie famille que le robot du haut.

### L'équipe maligne, salle après salle

| Salle | PV en entrant | Gagnée du premier coup | Tours | PV en sortant |
|---|---|---|---|---|
| La salle des rats | 310 | 100,0 % | 4,0 | 293 |
| Les canaux de la ville d'avant | 293 | 100,0 % | 3,0 | 239 |
| La cave aux toiles | 239 | 100,0 % | 4,3 | 189 |
| L'atelier des Fondateurs | 296 | 100,0 % | 5,1 | 227 |
| L'ossuaire | 227 | 100,0 % | 5,1 | 180 |
| Le grand bassin | 292 | 100,0 % | 6,8 | 203 |

### Les autres équipes dans le donjon (sans sauvegarde, sans le plan du Sage)

| Équipe | passe salle des rats | passe canaux de la ville d'avant | passe cave aux toiles | passe atelier des Fondateurs | passe ossuaire | passe grand bassin |
|---|---|---|---|---|---|---|
| Sans le Sage | 100,0 % | 100,0 % | 100,0 % | 0,0 % | 0,0 % | 0,0 % |
| Tape sans réfléchir | 11,0 % | 0,1 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| Tape, avec le feu au lieu de la louche | 100,0 % | 9,0 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| Au hasard | 71,8 % | 2,6 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| À tâtons | 100,0 % | 77,4 % | 59,5 % | 12,5 % | 0,8 % | 0,0 % |

## 5. Les cibles (MOTEUR-DONJON.md §6)

- ✅ soin : Les canaux de la ville d'avant enlève 68 par tour, plus que le plus gros soin (45)
- ✅ soin : La cave aux toiles enlève 81 par tour, plus que le plus gros soin (45)
- ✅ soin : L'atelier des Fondateurs enlève 58 par tour, plus que le plus gros soin (45)
- ✅ soin : L'ossuaire enlève 120 par tour, plus que le plus gros soin (45)
- ✅ soin : Le grand bassin enlève 73 par tour, plus que le plus gros soin (45)
- ✅ sortie sans la bonne potion : La cave aux toiles reste faisable (100,0 % et 100,0 %)
- ✅ sortie sans la bonne potion : La cave aux toiles est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ✅ sortie sans la bonne potion : L'atelier des Fondateurs reste faisable (34,9 % et 100,0 %)
- ✅ sortie sans la bonne potion : L'atelier des Fondateurs est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ✅ sortie sans la bonne potion : L'ossuaire reste faisable (95,4 % et 100,0 %)
- ✅ sortie sans la bonne potion : L'ossuaire est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ✅ sortie sans la bonne potion : Le grand bassin reste faisable (100,0 % et 100,0 %)
- ✅ sortie sans la bonne potion : Le grand bassin est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ✅ maligne : elle gagne le donjon d'une traite plus de 85 % des fois (100,0 %)
- ✅ maligne : avec des moments chauds (un héros dans le rouge dans 98 % des descentes)
- ✅ maligne : Les canaux de la ville d'avant gagnée en 3 ou 4 tours (3,0 tours, 100,0 %)
- ✅ maligne : La cave aux toiles gagnée en 3 ou 4 tours (4,3 tours, 100,0 %)
- ✅ maligne : L'atelier des Fondateurs est faisable à pleins PV (100,0 %)
- ✅ sans le Sage : elle ne bat pas L'atelier des Fondateurs (0,0 % de victoires)
- ✅ maligne : L'ossuaire est faisable à pleins PV (100,0 %)
- ✅ sans le Sage : elle ne bat pas L'ossuaire (0,0 % de victoires)
- ✅ maligne : Le grand bassin est faisable à pleins PV (100,0 %)
- ✅ sans le Sage : elle ne bat pas Le grand bassin (0,0 % de victoires)
- ✅ sans le Sage : personne n'arrive chez Léo (0,0 %)
- ✅ à tâtons (sans le Sage, en essayant tout) : personne n'arrive chez Léo non plus (0,0 %)
- ✅ tape sans réfléchir : elle perd dès la salle 2 (0,1 % passent les canaux)
- ✅ tape, avec le feu au lieu de la louche : elle passe les rats, puis tombe aux canaux (9,0 % les passent, 0,0 % passent la cave)
- ✅ tape sans réfléchir : même à pleins PV, les canaux la font tomber en 5 à 7 tours (6,7 tours ; 15,9 % de victoires)
- ✅ au hasard : elle perd presque toujours après les rats (2,6 % passent les canaux, 0,0 % la cave)
- ✅ la salle des rats reste l'apprentissage : la maligne la gagne toujours (100,0 %, en 4,0 tours)
- ✅ les équipes simulées ne tentent aucun geste refusé (0)

**Toutes les cibles sont tenues.**

## 6. Ce qu'il faut en retenir

- **La salle des rats n'a pas bougé** : mêmes règles, mêmes chiffres que l'essai (`test-regles.js` rejoue 3 000 parties des deux côtés et compare tout).
- **Dès les canaux, il faut réfléchir.** Taper sans ouvrir les points faibles, c'est tomber en 6 ou 7 tours ; l'équipe qui étudie gagne en 3 ou 4 tours.
- **Bien joué, on ne perd pas par malchance** : l'équipe maligne (un robot qui ne se trompe jamais) arrive chez Léo 100 fois sur 100 sans tomber, mais presque toujours avec un héros dans le rouge à un moment (98 % des descentes). Sans le passage secret (un seul feu de camp) : 99,5 %.
- **Une vraie famille se trompera, et là ça pique** : avec un geste sur dix joué au hasard, 69 % des descentes réussissent d'une traite (95 % avec un rechargement au plus) ; avec un geste sur quatre, 14 % seulement, et 2,1 défaites par descente en moyenne. Les pages blanches du Sage servent donc vraiment. Si c'est trop dur (ou pas assez) à l'essai, les chiffres à bouger d'abord sont les dégâts des attaques dans `donnees.js` (le Gardien, les feux follets, les chauves-souris, le saut de Bourbe).
- **Sans les connaissances du Sage, les élites et le boss ne se battent pas** : 0 victoire contre le Gardien, le Roi des rats et Bourbe. Une équipe très prudente (soins et boucliers) traverse lentement les trois premières salles (une vingtaine de tours aux canaux), tient debout devant le Gardien… et ne peut rien lui faire.
- **À tâtons**, en essayant tout et en retenant ce qu'on voit, on tombe parfois sur le combo du Gardien (20 % à pleins PV) ou du Roi des rats (5 %), jamais sur celui de Bourbe, et personne n'arrive au bout (0,0 %). Les pièges font leur travail.
- **Toujours une sortie** : avec un mauvais sac, chaque salle reste faisable par un chemin plus long ou plus coûteux (tableau 3). Le plus dur : le Gardien sans Acide, sans Givre et sans Baume (35 %). Et **le choix du sac compte** : la même équipe maligne qui garde le sac de la salle des rats (Feu, Huile, Baume) doit lire le Grand Livre jusqu'aux chemins sans potion, les combats durent deux à quatre fois plus longtemps, et elle ne réussit d'une traite que 46 fois sur 100 (85 avec un rechargement au plus).

### Ce que la simulation ne dit pas

- Le robot comprend les énigmes du Grand Livre du premier coup. De vrais joueurs devront parfois relire, ou étudier une deuxième fois.
- Le robot ne triche pas avec le soin : il n'attend pas, devant un dernier monstre faible, que le Baume ait remis tout le monde à neuf. Des joueurs patients peuvent le faire (c'est long). Rien dans les règles ne l'interdit aujourd'hui.
- Les équipes « sans le Sage », « tape » et « au hasard » ont ici le sac idéal. Avec un sac pris au hasard, elles font encore moins bien.

