# Le donjon du puits — la difficulté, prouvée par la simulation

> Écrit par `node equilibre.js 400 --md` avec les règles de `src/regles.js` et les chiffres de `src/donnees.js`.
> 400 parties par ligne. Ne pas corriger ce fichier à la main : changer un chiffre dans `donnees.js`, puis relancer.

## Les chiffres retenus

Les PV sont ceux des fiches du bestiaire. Les chiffres du rat d'égout et des héros sont ceux de la salle d'essai : ils n'ont pas bougé.

| Monstre | Rang | PV | Attaque |
|---|---|---|---|
| Rat d'égout | normal | 40 | morsure 13 (2 fois si « enrage ») |
| Rat cuirassé | normal | 70 | coup-de-tete 18 (+6 si « rougeoie ») |
| Chauve-souris de la brume | normal | 25 | pique 30 (2 fois si « folle ») |
| Feu follet | normal | 30 | brulure 18 sur 2 héros |
| Araignée des caves | normal | 60 | morsure 18 ; toile : le héros passe son tour |
| Petite araignée | normal | 15 | morsure 6 |
| Têtard du puits | normal | 15 | morsure 8 |
| Le Roi des rats | elite | 220 | grouillement 16 sur chaque héros (doublé si « colere ») ; ruee 70 (+20 si « colere ») ; charge 30 |
| Le Gardien de rouille | elite | 280 | poing 40 sur le héros de devant (+10 si « rougeoie ») (doublé si « enrage », « colere ») ; marteau 85 (+10 si « rougeoie ») (+15 si « colere ») |
| Bourbe, le crapaud du puits | boss | 1000 | langue 30, et il avale ; saut 28 sur chaque héros (doublé si « gonfle ») ; ecrasement 80 (+20 si « colere ») |

Héros : Pisteur 120 PV, Alchimiste 100, Sage 90. Herbes +10, Baume +40, Baume lumineux +15 à chacun, Cœur vaillant : relève avec 40, feu de camp : la moitié des PV max. Bouclier de runes : la moitié des coups. Critique : 60 / 80 (flèche / dague) sur un monstre normal, 110 / 140 sur un élite, 300 / 380 sur le boss.

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
| Maligne | 100,0 % | 3,0 | 286 | — | — |
| Sans le Sage | 100,0 % | 16,8 | 302 | — | — |
| Tape sans réfléchir | 0,0 % | — | — | 8,3 | — |
| Tape, avec le feu au lieu de la louche | 100,0 % | 10,4 | 174 | — | — |
| Au hasard | 27,0 % | 12,0 | 127 | 8,7 | — |
| Sans le Sage, à tâtons | 100,0 % | 3,6 | 236 | — | — |

### Les canaux de la ville d'avant — Rat d'égout, Chauve-souris de la brume, Chauve-souris de la brume

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 3,0 | 263 | — | — |
| Sans le Sage | 100,0 % | 16,1 | 293 | — | — |
| Tape sans réfléchir | 13,3 % | 7,9 | 85 | 8,2 | — |
| Tape, avec le feu au lieu de la louche | 72,5 % | 8,2 | 109 | 10,8 | — |
| Au hasard | 10,0 % | 7,7 | 125 | 5,9 | — |
| Sans le Sage, à tâtons | 79,8 % | 4,2 | 167 | 7,0 | — |

### La cave aux toiles — Araignée des caves, Feu follet, Feu follet

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 3,9 | 267 | — | — |
| Sans le Sage | 100,0 % | 12,8 | 294 | — | — |
| Tape sans réfléchir | 42,3 % | 4,4 | 172 | 6,8 | — |
| Tape, avec le feu au lieu de la louche | 5,5 % | 6,3 | 63 | 6,4 | — |
| Au hasard | 17,5 % | 9,5 | 154 | 7,5 | — |
| Sans le Sage, à tâtons | 98,0 % | 4,7 | 141 | 7,8 | — |

### L'atelier des Fondateurs — Rat cuirassé, Le Gardien de rouille

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 5,7 | 261 | — | — |
| Sans le Sage | 0,0 % | — | — | — | 100,0 % |
| Tape sans réfléchir | 0,0 % | — | — | 13,8 | — |
| Tape, avec le feu au lieu de la louche | 0,0 % | — | — | 12,3 | — |
| Au hasard | 0,0 % | — | — | 8,2 | — |
| Sans le Sage, à tâtons | 9,8 % | 5,4 | 186 | 12,8 | 80,0 % |

### L'ossuaire — Le Roi des rats, Feu follet, Feu follet

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 4,0 | 240 | — | — |
| Sans le Sage | 0,0 % | — | — | — | 100,0 % |
| Tape sans réfléchir | 0,0 % | — | — | 5,6 | — |
| Tape, avec le feu au lieu de la louche | 0,0 % | — | — | 5,9 | — |
| Au hasard | 0,0 % | — | — | 6,1 | — |
| Sans le Sage, à tâtons | 4,5 % | 8,6 | 96 | 13,2 | 5,8 % |

### Le grand bassin — Têtard du puits, Têtard du puits, Bourbe, le crapaud du puits

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 6,2 | 218 | — | — |
| Sans le Sage | 0,0 % | — | — | — | 100,0 % |
| Tape sans réfléchir | 0,0 % | — | — | — | 100,0 % |
| Tape, avec le feu au lieu de la louche | 0,0 % | — | — | 14,4 | 37,0 % |
| Au hasard | 0,0 % | — | — | 10,0 | 1,0 % |
| Sans le Sage, à tâtons | 0,0 % | — | — | 17,6 | 57,5 % |

### Les égouts tournants — Rat d'égout

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 1,0 | 310 | — | — |
| Sans le Sage | 100,0 % | 4,8 | 301 | — | — |
| Tape sans réfléchir | 100,0 % | 6,7 | 223 | — | — |
| Tape, avec le feu au lieu de la louche | 100,0 % | 3,7 | 289 | — | — |
| Au hasard | 100,0 % | 3,9 | 284 | — | — |
| Sans le Sage, à tâtons | 100,0 % | 1,0 | 310 | — | — |

### La fausse crypte — Chauve-souris de la brume, Chauve-souris de la brume

| Équipe | Victoires | Tours | PV restants | Tombe au tour | Ni l'un ni l'autre après 40 tours |
|---|---|---|---|---|---|
| Maligne | 100,0 % | 2,0 | 280 | — | — |
| Sans le Sage | 100,0 % | 6,9 | 292 | — | — |
| Tape sans réfléchir | 99,5 % | 3,4 | 256 | 7,5 | — |
| Tape, avec le feu au lieu de la louche | 100,0 % | 4,7 | 220 | — | — |
| Au hasard | 51,0 % | 6,1 | 154 | 7,1 | — |
| Sans le Sage, à tâtons | 97,8 % | 3,4 | 202 | 10,9 | — |

## 2. Le soin infini ne suffit pas

Le plus gros soin d'un geste : 45 PV (Baume 40 ; Baume lumineux 3 × 15 ; Herbes 10). Ce que les monstres d'une salle enlèvent par tour, à pleine force et sans piège :

| Salle | Les monstres | Par tour | Plus que le soin ? |
|---|---|---|---|
| La salle des rats | Rat d'égout 13 + Rat d'égout 13 + Rat d'égout 13 | 39 | l'apprentissage |
| Les canaux de la ville d'avant | Rat d'égout 13 + Chauve-souris de la brume 30 + Chauve-souris de la brume 30 | 73 | oui |
| La cave aux toiles | Araignée des caves 9 + Feu follet 36 + Feu follet 36 | 81 | oui |
| L'atelier des Fondateurs | Rat cuirassé 18 + Le Gardien de rouille 55 | 73 | oui |
| L'ossuaire | Le Roi des rats 55 + Feu follet 36 + Feu follet 36 | 127 | oui |
| Le grand bassin | Têtard du puits 8 + Têtard du puits 8 + Bourbe, le crapaud du puits 65 | 81 | oui |

## 3. Avec les « mauvaises » potions : il reste toujours une sortie, plus difficile

L'équipe maligne, le Grand Livre déjà lu en entier (elle est déjà venue), à pleins PV, sans flèches spéciales ni bâton. Trois sacs : le bon ; « Huile, Colle, Cœur vaillant » (aucune des potions attendues, et pas de Baume) ; « Baume, Cœur vaillant, Huile » (que du soin). Aux canaux, aucune potion n'est nécessaire (le bruit et la lumière sont des gestes) : ils ne sont pas dans ce tableau.

| Salle | Le bon sac | Huile, Colle, Cœur | Baume, Cœur, Huile |
|---|---|---|---|
| La cave aux toiles | 100,0 % · 3,9 tours · 267 PV | 100,0 % · 4,8 tours · 187 PV | 100,0 % · 4,8 tours · 207 PV |
| L'atelier des Fondateurs | 100,0 % · 6,0 tours · 238 PV | 23,3 % · 18,6 tours · 149 PV | 37,3 % · 18,9 tours · 177 PV |
| L'ossuaire | 100,0 % · 4,0 tours · 215 PV | 67,0 % · 6,0 tours · 62 PV | 100,0 % · 5,9 tours · 86 PV |
| Le grand bassin | 100,0 % · 6,2 tours · 190 PV | 0,0 % · 0,0 tours · 0 PV | 0,0 % · 0,0 tours · 0 PV |

## 4. Le donjon entier

Le chemin long, du fond du puits à Léo. Les PV ne reviennent pas entre les salles ; le feu de camp rend la moitié des PV max, une fois entre deux combats. « D'une traite » : sans tomber une seule fois. Une défaite recharge la dernière sauvegarde (le Grand Livre garde ce qu'il a lu) et l'équipe réessaie.

| Équipe | D'une traite | Avec 1 rechargement au plus | Avec 2 au plus | Défaites par descente | Un héros dans le rouge | Un héros au sol |
|---|---|---|---|---|---|---|
| Maligne (lourdes, bâton) | 92,8 % | 95,0 % | 96,5 % | 0,24 | 100 % | 86 % |
| … avec la sacoche (Feu en plus, puis Cœur vaillant) | 92,8 % | 95,0 % | 96,5 % | 0,24 | 100 % | 86 % |
| … avec les flèches d'argent | 89,5 % | 94,8 % | 97,5 % | 0,20 | 100 % | 50 % |
| … qui n'a pas cueilli la fleur de givre (pas de Givre contre Bourbe) | 0,0 % | 0,0 % | 0,0 % | 7,00 | 100 % | 86 % |
| … avec le cristal de lune au lieu du bâton | 92,8 % | 95,0 % | 96,5 % | 0,24 | 100 % | 86 % |
| … qui passe par la fausse crypte (l'amulette) | 85,3 % | 91,5 % | 92,3 % | 0,52 | 100 % | 89 % |
| … sans aucune sauvegarde | 92,8 % | 92,8 % | 92,8 % | 0,07 | 100 % | 86 % |
| … qui garde le sac de la salle des rats (Feu, Huile, Baume) jusqu'au feu de camp | 44,5 % | 61,3 % | 68,0 % | 2,33 | 100 % | 58 % |
| Distraite : un geste sur dix joué au hasard | 57,8 % | 77,0 % | 81,3 % | 1,32 | 100 % | 91 % |
| Très distraite : un geste sur quatre joué au hasard | 18,0 % | 30,0 % | 40,5 % | 3,77 | 100 % | 98 % |

« Un héros dans le rouge » : au moins une fois dans la descente, un héros a fini un tour avec un quart de ses PV ou moins (ou au sol). C'est ce qu'on appelle ici un moment chaud. Les deux dernières lignes montrent ce que coûtent les étourderies : c'est plus près d'une vraie famille que le robot du haut.

### L'équipe maligne, salle après salle

| Salle | PV en entrant | Gagnée du premier coup | Tours | PV en sortant |
|---|---|---|---|---|
| La salle des rats | 310 | 100,0 % | 3,0 | 286 |
| Les canaux de la ville d'avant | 286 | 100,0 % | 3,0 | 239 |
| La cave aux toiles | 239 | 100,0 % | 3,9 | 205 |
| L'atelier des Fondateurs | 205 | 100,0 % | 3,4 | 156 |
| L'ossuaire | 156 | 92,8 % | 4,1 | 87 |
| Le grand bassin | 236 | 100,0 % | 6,2 | 173 |

### Les autres équipes dans le donjon (sans sauvegarde, sans le plan du Sage)

| Équipe | passe salle des rats | passe canaux de la ville d'avant | passe cave aux toiles | passe atelier des Fondateurs | passe ossuaire | passe grand bassin |
|---|---|---|---|---|---|---|
| Sans le Sage | 100,0 % | 100,0 % | 100,0 % | 0,0 % | 0,0 % | 0,0 % |
| Tape sans réfléchir | 0,0 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| Tape, avec le feu au lieu de la louche | 100,0 % | 14,0 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| Au hasard | 20,8 % | 0,3 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| À tâtons | 98,5 % | 47,0 % | 7,3 % | 0,0 % | 0,0 % | 0,0 % |

## 5. Les cibles (MOTEUR-DONJON.md §6)

- ✅ soin : Les canaux de la ville d'avant enlève 73 par tour, plus que le plus gros soin (45)
- ✅ soin : La cave aux toiles enlève 81 par tour, plus que le plus gros soin (45)
- ✅ soin : L'atelier des Fondateurs enlève 73 par tour, plus que le plus gros soin (45)
- ✅ soin : L'ossuaire enlève 127 par tour, plus que le plus gros soin (45)
- ✅ soin : Le grand bassin enlève 81 par tour, plus que le plus gros soin (45)
- ✅ sortie sans la bonne potion : La cave aux toiles reste faisable (100,0 % et 100,0 %)
- ✅ sortie sans la bonne potion : La cave aux toiles est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ❌ sortie sans la bonne potion : L'atelier des Fondateurs reste faisable (23,3 % et 37,3 %)
- ✅ sortie sans la bonne potion : L'atelier des Fondateurs est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ✅ sortie sans la bonne potion : L'ossuaire reste faisable (67,0 % et 100,0 %)
- ✅ sortie sans la bonne potion : L'ossuaire est plus difficile qu'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)
- ✅ sans le Givre, Bourbe ne se bat pas (voulu : lui seul le sort de l'eau) : 0,0 % et 0,0 %
- ✅ maligne : elle gagne le donjon d'une traite plus de 85 % des fois (92,8 %)
- ✅ maligne : avec des moments chauds (un héros dans le rouge dans 100 % des descentes)
- ✅ maligne : Les canaux de la ville d'avant gagnée en 3 ou 4 tours (3,0 tours, 100,0 %)
- ✅ maligne : La cave aux toiles gagnée en 3 ou 4 tours (3,9 tours, 100,0 %)
- ✅ maligne : L'atelier des Fondateurs est faisable à pleins PV (100,0 %)
- ✅ sans le Sage : elle ne bat pas L'atelier des Fondateurs (0,0 % de victoires)
- ✅ maligne : L'ossuaire est faisable à pleins PV (100,0 %)
- ✅ sans le Sage : elle ne bat pas L'ossuaire (0,0 % de victoires)
- ✅ maligne : Le grand bassin est faisable à pleins PV (100,0 %)
- ✅ sans le Sage : elle ne bat pas Le grand bassin (0,0 % de victoires)
- ✅ sans le Sage : personne n'arrive chez Léo (0,0 %)
- ✅ à tâtons (sans le Sage, en essayant tout) : personne n'arrive chez Léo non plus (0,0 %)
- ✅ tape sans réfléchir : elle perd dès la salle 2 (0,0 % passent les canaux)
- ✅ tape, avec le feu au lieu de la louche : elle passe les rats, puis tombe aux canaux (14,0 % les passent, 0,0 % passent la cave)
- ❌ tape sans réfléchir : même à pleins PV, les canaux la font tomber en 5 à 7 tours (8,2 tours ; 13,3 % de victoires)
- ✅ au hasard : elle perd presque toujours après les rats (0,3 % passent les canaux, 0,0 % la cave)
- ✅ la salle des rats reste l'apprentissage : la maligne la gagne toujours (100,0 %, en 3,0 tours)
- ✅ les équipes simulées ne tentent aucun geste refusé (0)

**2 cible(s) manquée(s).**

## 6. Ce qu'il faut en retenir

- **La salle des rats n'a pas bougé** : mêmes règles, mêmes chiffres que l'essai (`test-regles.js` rejoue 3 000 parties des deux côtés et compare tout).
- **Dès les canaux, il faut réfléchir.** Taper sans ouvrir les points faibles, c'est tomber en 8 ou 9 tours ; l'équipe qui étudie gagne en 3 ou 4 tours.
- **Bien joué, on ne perd pas par malchance** : l'équipe maligne (un robot qui ne se trompe jamais) arrive chez Léo 93 fois sur 100 sans tomber, mais presque toujours avec un héros dans le rouge à un moment (100 % des descentes). **Le Givre est obligatoire contre Bourbe** (depuis le 11 novembre, lui seul le sort de l'eau) : l'équipe qui n'a pas cueilli la fleur de givre arrive au bout 0,0 fois sur 100.
- **Une vraie famille se trompera, et là ça pique** : avec un geste sur dix joué au hasard, 58 % des descentes réussissent d'une traite (77 % avec un rechargement au plus) ; avec un geste sur quatre, 18 % seulement, et 3,8 défaites par descente en moyenne. Les pages blanches du Sage servent donc vraiment. Si c'est trop dur (ou pas assez) à l'essai, les chiffres à bouger d'abord sont les dégâts des attaques dans `donnees.js` (le Gardien, les feux follets, les chauves-souris, le saut de Bourbe).
- **Sans les connaissances du Sage, les élites et le boss ne se battent pas** : 0 victoire contre le Gardien, le Roi des rats et Bourbe. Une équipe très prudente (soins et boucliers) traverse lentement les trois premières salles (une vingtaine de tours aux canaux), tient debout devant le Gardien… et ne peut rien lui faire.
- **À tâtons**, en essayant tout et en retenant ce qu'on voit, on tombe parfois sur le combo du Gardien (10 % à pleins PV) ou du Roi des rats (5 %), jamais sur celui de Bourbe, et personne n'arrive au bout (0,0 %). Les pièges font leur travail.
- **Presque toujours une sortie** : avec un mauvais sac, chaque salle reste faisable par un chemin plus long ou plus coûteux (tableau 3), **sauf le grand bassin : sans le Givre, Bourbe ne sort pas de l'eau**. Le plus dur : le Gardien sans Acide, sans Givre et sans Baume (23 %). Et **le choix du sac compte** : la même équipe maligne qui garde le sac de la salle des rats (Feu, Huile, Baume) doit lire le Grand Livre jusqu'aux chemins sans potion, les combats durent deux à quatre fois plus longtemps, et elle ne réussit d'une traite que 45 fois sur 100 (61 avec un rechargement au plus).

### Ce que la simulation ne dit pas

- Le robot comprend les énigmes du Grand Livre du premier coup. De vrais joueurs devront parfois relire, ou étudier une deuxième fois.
- Le robot ne triche pas avec le soin : il n'attend pas, devant un dernier monstre faible, que le Baume ait remis tout le monde à neuf. Des joueurs patients peuvent le faire (c'est long). Rien dans les règles ne l'interdit aujourd'hui.
- Les équipes « sans le Sage », « tape » et « au hasard » ont ici le sac idéal. Avec un sac pris au hasard, elles font encore moins bien.

