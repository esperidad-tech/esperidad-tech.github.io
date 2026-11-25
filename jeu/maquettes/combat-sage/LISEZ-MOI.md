# Combat final — le Sage contre Grosbec (jusqu'à la version 15 : « contre le cœur de l'armure ») : maquettes de test

Maquette jouable (pas le vrai jeu, rien n'est construit dans Brumeval) : https://claude.ai/artifact/S3UzmZhUvPFUscZeZs6DTy — **version 17** (en ligne le 25 novembre, 15 h 04) : **le Sage n'a plus que deux amis à protéger, le Barde et l'Alchimiste ; le Pisteur est enlevé** (demande de Romain, 25 nov., 14 h 52) — voir « La version 17 ». Le reste est la version 16 (24 novembre, 23 h 25) : la grande salle de Grosbec vue de haut, Grosbec dans son armure à la place du cœur, ses golems (ceux du combat du Barde), les amis de dos qui tirent sur lui — voir « La version 16 » ; Romain n'a rien dit de ces dessins, il a seulement demandé la version 17. Les runes, les combos et les sons sont ceux de la version 15 (19 h 21), que Romain avait jugée finie (19 h 16 : « le jeu, pour moi, il est fini »).
- Dans ce document, « le cœur » (versions 9 à 15) = **Grosbec** depuis la version 16 ; « soldats » = golems ; « lanceurs » et « pierres » = frondeurs et braises.
- **Où est le code** (Romain, 19 h 44 : « Publie-la sur GitHub ») : **branche `brumeval-sources`, dossier `jeu/maquettes/combat-sage/`** (ce document y est en `LISEZ-MOI.md`). Rien n'est en ligne sur le site : la maquette se joue à l'adresse ci-dessus.
  - `combat-sage.html` : la page toute faite (un seul fichier : règles, dessins, sons) = la version 17 en ligne, à l'identique.
  - `python3 construire.py` la refabrique, en trois temps :
    1. `v16/assembler.py` refait `render16.js` (les dessins) à partir de `render15.js` (gardé pour les effets des runes et des combos, les pouvoirs des amis, le Sage, l'affichage) et des morceaux neufs de `v16/` : `salle.js` (la salle), `grosbec.js` (Grosbec, ses gestes, les tirs des amis sur lui), `golems.js` (les golems), `herosdos.js` et `heros.js` (les amis de dos), `sprites.js` (les images préparées), `entete.js` ;
    2. `ui7.html` (la page, ses boutons, l'aide-mémoire) reçoit les retouches des versions 8 à 17 : `construire.py`, puis `build12_part.py`, `build14_part.py`, `build16_part.py` (les mots, la finesse automatique, la ligne de mesures), `build17_part.py` (les textes pour deux amis) ;
    3. on y colle `logic17.js` (les règles : `window.G`, utilisable aussi dans Node), `sound14.js` (les sons et la partition, `SON`) et **les modèles du combat du Barde** : `barde/outils.js`, `barde/golems.js`, `barde/grosbec.js` (copies de sa **version 9**, non modifiées), retouchés au passage par `modeles_barde.py` (golems cuits plus petits et sans leur ombre ; Grosbec regardé de plus haut et cuit plus petit).
  - `node test-regles.js` : 63 vérifications des règles et des combos. `node robot.js games=8 think=1 modes=combos at=600 extra=8 build=orage:3` : le robot (`at=600` = partir à 10 minutes, `extra` = cartes au hasard en plus, `build` = combos donnés au départ, `modes=cercle` = il court en rond autour des amis).
  - Avec le navigateur (Playwright) : `python3 partie-entiere.py` (les photos de la version 17, puis une partie jouée jusqu'au bout avec le vrai clavier des codes : l'ancien code du Pisteur refusé, les deux codes), `photos-salle.py` et `photos-moments.py` (les photos de la salle, des golems qui arrivent, de Grosbec touché, de la victoire), `vitesse.py` (les images par seconde sur quatre appareils imités), `cuisson.py` (les images préparées d'avance), `photos-combos.py` (les 10 combos ; pas relancé depuis la version 15). `photos-salle.py`, `photos-moments.py`, `vitesse.py` et `cuisson.py` datent de la version 16 et n'ont pas été relancés en version 17 (`photos-moments.py` tape encore le code du Pisteur : à adapter). Les photos vont dans `/tmp`.
  - Bible : §15 (court résumé et renvoi ici) ; §16 pour le combat du Barde, d'où viennent Grosbec, les golems et la salle.
- Sur l'écran d'explication, **« Pour l'essai, tes amis finissent leur combat vers : 4 min / 8 min / 12 min »** (8 par défaut) : le dernier ami gagne à ce moment-là, l'autre un peu après la moitié (55 %, à ±10 %), dans un ordre tiré au hasard à chaque partie (jusqu'à la version 16, avec trois amis : la moitié, les trois quarts, la fin). Leur code s'affiche alors en haut ; on le tape avec « Taper un code » ; l'ami vient aider avec son pouvoir.
- **Au clavier** (ordinateur) : Entrée ou Espace pour graver / revenir ; 1, 2, 3 pour choisir une carte.
- Avec `#rapide` au bout de l'adresse, les codes arrivent après 10 et 20 secondes ; avec `#plein`, la page s'ouvre en plein écran (`#rapide-plein` pour les deux). Ces raccourcis d'adresse n'ont pas été vérifiés dans la page Claude.
- Les anciens fichiers de travail (versions 1 à 14) ne servent plus : tout ce qu'il faut est sur GitHub (voir « Où est le code »). La partition de la musique est écrite en notes dans `sound14.js`, partie par partie.

## Ce que Romain a dit (23-25 novembre)
- 23 nov., 22 h 29 : façon Into the Breach (protéger les trois autres héros). Pinceau d'Okami refusé comme coup spécial.
- 23 h 39 (version 1) : « pas fun du tout ». 24 nov., 0 h 44 (version 2) : « c'est un jeu d'énigmes » ; il veut du temps réel pour le Sage.
- 0 h 57 : il propose un mélange de Vampire Survivors et du pinceau d'Okami ; 1 h 01 : « fais-moi une maquette ».
- 1 h 40 (version 3) : cercle qui gèle trop facile, trait pas assez cher, tourbillon qui repousse inutile ; plus de combos ; et les codes des autres joueurs à taper en temps réel (fait dans la version 4).
- 2 h 34 (version 4) : n'aime pas l'encre à la longueur du tracé (frustrant) ; plus d'ennemis, des ennemis plus solides, de grosses vagues d'un côté ; une rune de mur ; l'escargot qui repousse très loin, sans dégâts ; les ennemis qui se cognent sonnés 3 secondes, que le trait fait exploser ; une poussée en V.
- 2 h 55 (version 5) : l'escargot trop facile → il coûte **la moitié de l'encre** ; le V **chasse par l'ouverture tout ce qui est à l'intérieur**, coûte **2** ; le mur mal fait, et pas une forme fermée.
- 3 h 24 : le V ne doit pas dépasser **90°** (et non 45°).
- 3 h 42 (version 6) : le mur devient **un arc de cercle**, **exactement de la forme du tracé** ; **il ralentit tous les ennemis qui s'en approchent** ; **les projectiles qui le touchent retournent d'où ils viennent et font des dégâts** ; **enlever le zigzag**.
- 4 h 04 (version 7) : « le jeu est pas mal ». Il demande les dessins et les animations : **qu'on voie bien les créatures avancer pas par pas**.
- 10 h 33 : « Fais-moi une version plein écran. »
- 11 h 22 (après la version 8) : le jeu est **un peu trop facile**. Il demande : **toutes les 2 minutes, +1 vie** aux golems, **pour les gros +2 vies chaque minute** ; **dès qu'on a les 3 codes, le jeu s'arrête** ; **l'Alchimiste** libéré lance des potions toutes les 2 secondes environ (grandes flaques : boue qui colle, lianes qui bloquent, feu), « exactement comme dans le mini-jeu, mais en version aléatoire » ; **le Pisteur** lance des salves de flèches et **saute à la dague sur l'ennemi trop proche : 2 dégâts d'un coup** ; **le Barde** envoie des partitions qui font **faire demi-tour** ou **danser** (« il y a plusieurs types ») ; **toutes les 3 minutes, la horde arrive d'un côté de plus** ; **à 15 minutes, ingagnable** ; **après 10 minutes, deux fois plus de tireurs**.
- 12 h 47 (après la version 9) : « c'est quand même beaucoup plus dur » ; pour tenir **10 minutes**, il faut **des petits bonus** : tuer des gros fait apparaître **une fenêtre de choix**, comme dans Vampire Survivors. « Fais-moi des propositions. »
- 15 h 00 : « Vas-y, tu peux construire tout ça. Je préfère peut-être **la page à ramasser**. » ; toutes les cartes.
- 15 h 36 (après la version 10) : « J'aime beaucoup ce que tu as fait. » Il demande **d'autres combos pour le choix du build**, **un peu plus de pages**, **un peu plus de vies**, des combos pour **tenir longtemps** (les mini-jeux des autres peuvent être longs si l'équipe a du mal). « Fais-moi tes propositions. Et on va pouvoir **commencer à mettre du son** aussi. »
- 16 h 04 : « **La chouette, c'était bien.** » Il veut que **les codes des autres joueurs, une fois tapés, fassent venir le joueur ici pour aider** (c'est le cas depuis la version 9). Il rappelle les pouvoirs : le Barde fait de la musique « **qui repousse, ou qui tire**, ou des trucs comme ça » ; l'Alchimiste des flaques et des lianes « comme l'autre mini-jeu » ; le Pisteur des flèches et des sauts à la dague, « **à chaque coup de dague, c'est 2 coups** » (compris : 2 dégâts, comme avant — à faire confirmer). **Bogue** : sur ordinateur, il grave avec Entrée, et **après avoir pris une page, Entrée ne marchait plus**. « **Allez, vas-y, go.** » (pour la version 11 proposée à 15 h 36).
- **17 h 01** (après la version 11) : les combos des pages « **pas assez jouissifs et pas assez forts** » ; il veut **10 combos, 10 façons de jouer**, rigolos et foufous, de plus en plus « pétés » quand on les cumule, mais **les ennemis doivent finir par reprendre le dessus** ; et **les sons** : une musique 8 bits « un peu beat », avec une vraie mélodie travaillée qui ne se répète pas toutes les 2 secondes, des sons doux et pas trop forts (le jeu du Barde est basé sur la musique). Détails dans la version 12 ci-dessous.
- **18 h 16** (après la version 12) : « La musique, ça va pas » : c'est « une petite musique tranquille, dans **la petite maison dans la prairie** », alors qu'« on est **en combat** ». Il veut **une musique de combat, version 8 bits**, « avec des **petits sons un peu spéciaux, sympas** », une **mélodie de combat**, et **une mélodie qui dure longtemps, qui ne se répète pas**. → version 13.
- **18 h 53** (après la version 13) : « Mets-moi **un curseur pour la musique, un curseur de volume**. » Et : « **parle-moi de toutes les combos à partir de 10 minutes, les combos pétés** pour chaque type de combo… parle-moi de ce que tu as fait, parce que **j'ai pas envie de jouer 10 000 fois** ». → version 14 (les curseurs) et « Les combos à 10 minutes » ci-dessous.
- **19 h 16** : « Ok, vas-y, **renforce les combos**, comme tu m'as proposé. » Il prépare **les graphismes dans une autre discussion, sur le jeu du Barde** : « ça se trouve, tu devras **changer les modèles des golems. Et aussi le modèle du sol.** Mais c'est pas sûr, on va voir. » Et : « **le jeu, pour moi, il est fini.** » → version 15.
- **22 h 22** (il a vu les images du combat du Barde, faites par une autre conversation) : « Tu peux **remplacer tous les golems** par […] **le nouveau genre de golem**. Et tu peux **remplacer le cœur qui est en haut par l'armure du corbeau** là, **l'armure de Grosbec**. Mais par contre, tu me fais **une version vue de haut**, mais tu fais en sorte que **ça prenne pas de ressources**. » « Il faudrait que **les trois personnages au centre, ils soient tournés vers Grosbec. Et que de temps en temps ils envoient des flèches, des éclairs et des potions sur Grosbec.** » « Pour la salle, tu reprends **les textures de la salle** et tu les adaptes. Enfin, en gros, tu adaptes tout par rapport au jeu du Barde. Et tu me fais une version, bien sûr, vue de haut, **bien moins travaillée forcément et surtout très économe en énergie. Faut surtout pas que ça rame ce mini-jeu.** Mais **il faut qu'on reconnaisse la salle, Grosbec, il faut qu'on reconnaisse les golems.** […] Et la salle, il faut que ça soit **la même, mais vue de haut**. »
- **22 h 25** : « Tu peux faire ça et me mettre en ligne. » → version 16.
- **25 novembre, 14 h 52** : « J'aimerais que tu fasses un petit changement. J'aimerais que **le Sage, il ait que deux personnes à protéger, juste le Barde et l'Alchimiste**. Juste, j'aimerais que tu **enlèves le Pisteur**. » Puis : « Fais cette modification et mets-le en ligne. » → version 17. (Dans la nuit, le Pisteur a reçu son propre combat, contre la garde de Grosbec : Bible §17.)
- Rappel : Pisteur = combat classique + combos ; Barde = rythme + Guitar Hero ; Alchimiste = façon Magicka.

## La version 17 (25 novembre, 15 h 04) — deux amis à protéger, plus de Pisteur
**Demande de Romain (14 h 52)** : « que le Sage, il ait que deux personnes à protéger, juste le Barde et l'Alchimiste […] que tu enlèves le Pisteur ».

### Ce qui change
- **Au milieu de la salle : deux amis**, côte à côte sur la rosace, le Barde à gauche, l'Alchimiste à droite.
- **Le Pisteur est enlevé partout** (lecture de Claude, la plus stricte — voir la question plus bas) : il n'est plus au milieu, **il n'a plus de code**, son pouvoir (les salves de flèches, la dague) n'existe plus dans ce combat. Son ancien code d'essai 🔥 🌙 ⭐ est refusé (« Ce code ne marche pas »).
- **Deux codes** : au premier, l'ami vient aider (protection +3) ; **au deuxième, c'est gagné**. Donc **un seul ami vient aider par partie** — le Barde ou l'Alchimiste, selon l'ordre tiré au hasard (avant : deux amis sur trois).
- **« Pour l'essai »** : le dernier ami gagne au temps choisi (4, 8 ou 12 minutes), l'autre un peu après la moitié.
- Le casque de Grosbec se fend autant qu'avant, en deux fois au lieu de trois.
- Les textes suivent : l'explication (« Tes deux amis, le Barde et l'Alchimiste… », « Les deux codes : c'est gagné »), l'image « 4. Les codes » (le Barde et son code 🔑 💧 🍃), l'aide-mémoire, la jauge « Amis vainqueurs : 0 sur 2 », l'écran de fin, la ligne « Mesures (version 17) ».
- **Rien d'autre ne change** : la salle, Grosbec, les golems, les runes, les pages, les 10 combos, les vies, les vagues, la colère, les sons.

### Vérifié
- **63 vérifications des règles** passent (7 nouvelles : deux amis, pas de Pisteur, l'ancien code refusé, le premier code ne fait pas gagner, le deuxième oui, les deux moments des codes, les golems frappent bien les deux amis).
- **Une partie jouée jusqu'au bout avec le vrai clavier des codes**, sur un téléphone imité en plein écran : l'ancien code du Pisteur est refusé, le Barde vient aider, le deuxième code fait gagner, l'écran de fin arrive (« Tes deux amis ont gagné… »). Aucune erreur de page. Photos regardées : l'explication, la fenêtre, le téléphone.
- **La difficulté, au robot** (48 parties à chaque fois) :
  - sans jamais arriver aux codes, il tient **2 min 35** (médiane) avec deux amis, contre **2 min 04** avec trois : **le début est un peu plus facile** (deux amis côte à côte se couvrent mieux que trois en triangle) ;
  - avec des amis qui finissent à 4 minutes, il **gagne 17 parties sur 48**, contre 19 avec trois amis : pareil. (Il y a un ami de moins pour aider à la fin, et un +3 de protection en moins : ça compense.)
- La vitesse n'a pas été remesurée (il y a un personnage de moins à dessiner, rien d'autre).

### Questions pour Romain
- **Le Pisteur doit-il quand même crier un code au Sage à la fin de son propre combat ?** Aujourd'hui non : le Sage gagne dès que le Barde et l'Alchimiste ont gagné, même si le Pisteur se bat encore contre la garde. L'autre lecture possible : le Pisteur n'est plus à protéger, mais son code compte toujours (trois codes pour gagner). Le combat du Pisteur garde pour l'instant un code de fin 🔥 🌙 ⭐ (Bible §17.9) que plus aucun combat n'attend.
- Le début un peu plus facile : à laisser, ou à durcir un peu ?

## La version 16 (24 novembre, 23 h 25) — la salle, Grosbec et ses golems, vus de haut
**Seuls les dessins changent** (et quelques mots). Les règles, les runes, les pages, les 10 combos, les vies, les vagues, les codes, la musique et les bruitages sont ceux de la version 15. Tout vient du combat du Barde (Bible §16) : ses modèles sont repris tels quels, puis regardés d'un autre endroit.

### Ce qu'on voit
- **La salle** = la grande salle du combat du Barde, **regardée de haut** : le sol en grandes dalles polies bleu nuit, leurs losanges de bronze, **l'allée de bronze et ses deux rigoles d'or** qui va de l'estrade de Grosbec à la rosace des amis, les reflets de lumière. En haut de l'écran, **le mur du fond** : les pierres bleu nuit, **la grande arche ouverte sur la ville d'en bas, floue**, ses cristaux, **les deux portes de bronze** ouvertes sur le rouge des forges, les lanternes, les frises. Sur les côtés et en bas : **les galeries sombres** et leurs piliers. La salle est peinte une seule fois, puis recopiée ; seules les lanternes et les portes ont une petite lueur qui bat.
- **Grosbec, dans son armure, à la place du cœur** : debout sur son estrade, en haut au milieu. C'est **le même modèle** que dans le combat du Barde (`barde/grosbec.js`, celui que Romain a trouvé « vraiment magnifique »), regardé d'un peu plus haut. Seize poses sont peintes d'avance ; à chaque image du jeu, on en recopie une seule.
  - Il tourne la tête de temps en temps.
  - **Il envoie ses golems** à chaque grosse vague : il se tourne du bon côté et tend le bras ; un mot s'affiche (« Allez, allez ! », « Écrasez-les ! », « Allez ! Plus vite ! », « Attrapez-les ! »).
  - **Il encaisse** quand un code d'ami est tapé : il part en arrière, bras écartés, des étincelles ; son casque est un peu plus fendu à chaque ami vainqueur.
  - **Sa colère** (12 et 14 minutes) : les deux bras levés, « ASSEZ ! », ses lanternes virent au rouge.
  - **À la victoire** : il est pris dans le cristal, casque fendu.
- **Les golems** = ceux du combat du Barde (`barde/golems.js`, Bible §16.4) :

| Dans les règles | Devient | Ce qu'il fait ici |
|---|---|---|
| le cogneur (3 vies) | **le lancier** (heaume à crête, grande faux) | le golem de base |
| le coureur (1 vie) | **le rôdeur** (gueule de piège à loups) | rapide, fragile |
| la brute (7 vies) | **le bélier** (tête de fer, cornes enroulées) | gros : lâche une page |
| le costaud (16 vies) | **le colosse** (chaudière, deux cheminées, grandes cornes) | très gros, frappe pour 2 : lâche une page |
| le lanceur (2 vies) | **le frondeur** (canon de bronze sur des pattes de crabe) | reste loin et crache des braises |

  - Ils **marchent pas à pas** (quatre images par pas), **se tournent** vers là où ils vont (trois angles), **arment et frappent**. Projetés, ils tournent en l'air ; sonnés, ils penchent sous des étoiles ; touchés, ils s'éclairent.
  - **Ceux du fond sortent par les deux portes de bronze** (avant : de tout le bord du haut). **Ceux des côtés et du bas sautent des galeries** et retombent sur les dalles.
  - Les « cuirassés » de la fureur portent un casque et une plaque de fer par-dessus.
  - Deux golems du Barde ne servent pas ici : le porte-dalle et le tourbillon.
- **Les trois amis, de dos, tournés vers Grosbec** (version 17 : plus que deux, sans le Pisteur) : le Pisteur (cape verte, carquois, arc), l'Alchimiste (en violet, sa sacoche, une fiole levée), le Barde (en rubis, son luth, son chapeau rubis à plume blanche, comme dans son combat). **De temps en temps, ils tirent sur Grosbec** : une flèche, une fiole qui fait une cloche, un éclair de musique. **C'est du décor** : ça ne change rien au combat. Un ami venu aider le Sage tire moins souvent sur Grosbec (il est occupé avec les golems).
- **Les mots** : « Le Sage contre Grosbec », « La colère de Grosbec », « FUREUR de Grosbec », « golems », « frondeurs », « braises ».
- **Une ligne de chiffres** sur l'écran de pause et sur l'écran de fin (« Mesures (version 16) : 60 images par seconde, pire seconde 57 · finesse 61 %… ») : si ça rame sur un vrai appareil, Romain peut la lire à Claude. (Idée reprise du combat du Barde.)

### Pour que ça ne rame pas [Romain : « surtout très économe en énergie. Faut surtout pas que ça rame »]
- **Tout est peint une fois, puis recopié** : la salle (une image), Grosbec (16 poses), les golems (150 images au plus : 5 golems × 3 angles × 10 poses ; la réserve a 260 places, donc aucune n'est jamais jetée). **Tout est préparé pendant qu'on lit l'explication** (moins d'une seconde) ; **rien n'est repeint en plein combat**. Un golem à l'écran = deux images recopiées (son ombre, lui).
- **La finesse automatique** : la page ne dessine jamais plus de 1,7 million de points. Pendant le jeu, elle compte ses images : **sous 25 images par seconde pendant 1,4 seconde, elle dessine un peu moins fin** (quatre crans, jusqu'à 42 %). Elle s'en souvient pour la fois suivante, et retente alors un cran plus fin. Un appareil faible (deux cœurs, ou peu de mémoire) part à 61 %. Avec `?finesse=1` au bout de l'adresse, la finesse est bloquée (pour les photos).
- **Les leçons du combat du Barde** (Bible §16.7, l'iPhone de Romain qui ramait) sont appliquées : les images préparées gardent leur taille quand la finesse baisse (rien à repeindre) ; une image qu'on jette est vidée tout de suite (Safari garde longtemps la mémoire d'une image jetée) ; une image pendant laquelle on a préparé un dessin ne compte pas comme une image lente.
- **Les autres économies** : les étincelles sont de petits carrés (320 au plus) ; les textes sont écrits une fois dans une petite image ; dix grandes lueurs au plus par image ; les éclairs sont simplifiés quand il y a plus de 36 golems.
- **Mesuré** (images par seconde : moyenne, puis pire seconde ; navigateur **sans carte graphique**, processeur ralenti exprès, finesse automatique) :

| Appareil imité | Un moment ordinaire (25 golems, sans combo) | Une scène très lourde (70 golems, quatre combos au maximum) |
|---|---|---|
| Téléphone 390 × 844 (écran fin), ralenti 4 fois | 55, pire 43 | 26, pire 18 |
| Tablette 1024 × 768 (écran fin), ralentie 4 fois | 46, pire 39 | 22, pire 16 |
| Vieille tablette 768 × 1024, ralentie 4 fois | 56, pire 52 | 29, pire 21 |
| Grande tablette 800 × 1280, ralentie 6 fois | 30, pire 22 | 15, pire 12 |

  **La version 15, dans la même scène très lourde : 5 à 11 images par seconde.** La version 16 est donc deux à trois fois plus rapide que l'ancienne, avec des dessins plus riches. Mais **la scène très lourde reste sous les 25 images par seconde** sur une machine ralentie 4 fois : c'est la fin d'une longue partie avec plusieurs combos au maximum.
- **Pas vérifié : un vrai iPhone, une vraie tablette.** Ces chiffres viennent d'un ordinateur ralenti exprès. Le combat du Barde ramait sur l'iPhone de Romain à l'acte III (22 h 25) sans que ça se voie sur ces machines-là.

### Vérifié
- Les 56 vérifications des règles passent. Une partie jouée jusqu'au bout avec le vrai clavier des codes : les trois amis viennent, Grosbec est pris dans le cristal, l'écran « L'armure tombe ! » arrive. Aucune erreur de page.
- **Le combat n'est pas plus dur ni plus facile** : le robot, sans les codes, tient 2 min 06 avec les anciennes règles et 2 min 28 avec les nouvelles (médiane de 24 parties chacune ; d'une partie à l'autre il va de 1 min 20 à 8 minutes, donc l'écart ne veut rien dire).
- Photos regardées : fenêtre, plein écran, téléphone, tablette ; les golems qui sortent des portes et sautent des galeries ; Grosbec qui envoie, qui encaisse, en colère, dans le cristal.

### Choix de Claude, à valider par Romain
- **« Vue de haut »** : le sol est vu de haut, mais **les personnages restent debout** (comme avant). Vraiment à la verticale, on ne verrait que des crêtes de casque et des épaules : on ne reconnaîtrait ni Grosbec ni les golems.
- **Quel golem remplace lequel** (le tableau ci-dessus).
- **Les golems du fond arrivent en deux files, par les portes.** Le robot ne voit pas de différence de difficulté.
- **Les tirs des amis sur Grosbec ne font rien** (décor).
- Les mots de Grosbec ; « ASSEZ ! » pour sa colère (dans le combat du Barde, c'est « SILENCE ! »).
- **Les amis sont dessinés simplement, de dos** : ce ne sont pas les héros « en volume » du jeu (trop lourd pour ce mini-jeu, et ils sont petits à l'écran).
- **Grosbec n'a ni voix ni bruits d'armure** ici (il en a dans le combat du Barde) : les sons n'ont pas été touchés.
- **Dans la petite fenêtre, sur un téléphone, les jauges cachent les deux portes.** En plein écran (bouton jaune « Commencer en plein écran »), elles passent au-dessus de la salle.
- À la victoire, le message se pose sous l'estrade, comme les autres (avant, il descendait sur le Sage).

### Pas vérifié
- Un vrai iPhone, une vraie tablette (voir plus haut).
- Les sons : inchangés, et toujours jamais écoutés par Claude.
- Les 10 combos n'ont pas été repris en photo un par un avec les nouveaux dessins (`photos-combos.py`) ; leurs effets n'ont pas été modifiés.
- Les modèles du Barde sont ceux de sa **version 9**. Sa version 10 (23 h) a encore allégé ses golems (le golem tourné à gauche est le reflet de celui de droite) : pas repris ici, ce n'est pas nécessaire (150 images, moins d'une seconde de préparation).

## La version 12 (24 novembre, 17 h 38)
### Ce que Romain a demandé (17 h 01)
- « Les combos… par les pages, je les trouve **pas assez jouissifs et pas assez forts**. » Il veut des combos **plus rigolos, plus foufous**, à partir de ceux d'avant ; « c'est pas grave, des fois si c'est un peu fort, après si c'est fun, c'est cool ».
- « **10 façons différentes de jouer, avec 10 combos** qui deviennent jouissifs. **Plus on les cumule, plus ils deviennent complètement pétés.** Mais **à un moment donné, il faut que les ennemis reprennent le dessus**. » On joue les combos plutôt que les dégâts.
- « Tu m'as pas fait les sons. » Il veut **une musique 8 bits un peu beat**, **avec une vraie mélodie, travaillée, qui ne se répète pas toutes les 2 secondes**, et des **sons doux, pas trop forts** : tout le monde joue en même temps, et **le jeu du Barde est basé sur la musique**, donc il ne faut pas que ce soit trop prenant.
- (Avant, il voulait écouter les sons sur une page à part avant de les mettre ; cette fois il demande de les mettre directement.)

### La règle des combos
- Une carte dorée « Combo ! » sort quand on a ses deux cartes, **dont une au niveau 2** (avant : 3). Elle sort à coup sûr en première place (deux cartes dorées si plusieurs combos sont prêts).
- **Chaque combo a 3 niveaux** : ses niveaux 2 et 3 ressortent ensuite en cartes dorées (étoiles ★★☆ sur la carte). Les combos ne comptent pas dans les 4 sorts.
- Ils se cumulent entre eux : par exemple la rune miroir recopie le trait brûlant du volcan (huit coulées de lave en étoile), l'écho du scribe fou relance la tornade, etc.

### Les 10 combos (chiffres = choix de Claude, à régler en jouant)
1. 🎳 **Golems-boulets** (V tonnerre + mur solide) — N1 : les golems chassés par le V deviennent des boulets, rebondissent sur les bords, les murs et les amis, et renversent tout ce qu'ils touchent (« STRIKE ! » à 5 renversés) ; N2 : les renversés deviennent boulets à leur tour (12 au plus par V) ; N3 : chaque boulet explose à la fin de sa course (3 dégâts autour).
2. ⛈️ **Orage** (rune piège + lumière en chaîne) — N1 : un golem qui éclate fait tomber la foudre sur 3 golems autour (sonnés) ; N2 : la foudre fait éclater les golems déjà sonnés, en chaîne (25 coups par rune) ; N3 : toutes les 6 secondes, un orage tombe tout seul sur 5 golems.
3. 🌋 **Volcan** (trait brûlant + mur d'épines) — N1 : le feu brûle deux fois plus fort et saute de golem en golem ; le mur dure 2 secondes de plus et met le feu ; N2 : un golem qui meurt en brûlant explose en boule de feu (3 dégâts, enflamme les voisins) ; N3 : les golems en feu courent partout en paniquant (« !! ») au lieu d'attaquer, et le trait laisse une coulée de lave plus large et plus longue.
4. 🌠 **Pluie d'étoiles** (double orbe + tir rapide) — N1 : 12 étoiles autour du Sage toutes les 5 secondes ; N2 : toutes les 3 secondes, et elles rebondissent sur les bords ; N3 : une étoile qui détruit un golem éclate en 3 étoiles.
5. 🌟 **La comète** (pas léger + orbe perçant) — N1 : le Sage court plus vite et laisse une traînée d'étoiles qui brûle (2 dégâts ; 3 et plus large en version 15, et elle arrête les pierres) ; N2 : en courant, il projette les golems qu'il touche (version 15 : la traînée sonne et renvoie les pierres) ; N3 : la traînée explose derrière lui et sonne les golems (version 15 : les sonnés éclatent).
6. 🐙 **Le scribe fou** (grand encrier + moisson d'encre) — N1 : les runes coûtent 1 encre de moins, l'encre remonte toute seule (1 toutes les 2 secondes) ; N2 : combo ×4 avec une rune → **FRÉNÉSIE**, 6 secondes d'encre gratuite ; N3 : chaque rune a un **écho** (elle se relance toute seule une demi-seconde après), et la frénésie arrive dès ×3.
7. 🌀 **Tornade de pages** (pages volantes + aimant) — N1 : les pages s'envolent en spirale jusqu'au bord, puis reviennent ; N2 : l'escargot devient une tornade qui aspire les golems pendant 1,6 seconde puis les recrache au loin ; N3 : elle dure 3 secondes, se promène vers la foule (sans marcher sur les amis) et déchiquette les golems.
8. 🏛️ **Sanctuaire** (sceau de garde + bouclier) — N1 : quand un bouclier casse, le sceau sonne tous les golems du cercle ; N2 : toutes les 8 secondes, le sceau pulse et projette les golems du cercle au loin ; N3 : l'onde fait d'abord éclater les golems sonnés.
9. 🦉 **Parlement des chouettes** (chouette + orbe lourd) — N1 : une 2e chouette, chaque coup de bec lance un éclair sur 3 golems ; N2 : quatre chouettes ; N3 : les chouettes attrapent les golems et les jettent sur le plus gros groupe.
10. 🌗 **Rune miroir** (trait large + grand encrier) — N1 : chaque rune est recopiée gratuitement de l'autre côté des amis ; N2 : trois copies (en face et à un quart de tour) ; N3 : **mandala**, sept copies tout autour.

### La colère du cœur (pour que les ennemis reprennent le dessus)
- **À 12 minutes** : le cœur se met en colère (golems +60 % plus nombreux, +15 % plus rapides) ; **à 14 minutes** : fou de rage (encore plus) ; les bords de la place rougissent et battent, une case « 💢 » le dit.
- **Après 15 minutes, la fureur** : toutes les 30 secondes, les golems ont 3 vies de plus, arrivent plus nombreux et plus vite, et **de plus en plus sont cuirassés** (casque et plaque de fer) : on ne peut plus les sonner ni les faire éclater (un éclatement leur fait 3 dégâts), ni en faire des boulets, ni les aspirer.
- Mesuré au robot : avec **quatre combos au niveau 3** (étoiles, orage, chouettes, miroir), il tenait jusqu'à 25 minutes sans la fureur ; avec, il tombe entre **19 et 22 minutes**. Une partie normale finit bien avant.

### Les sons (version 12)
- Tout est fabriqué par le navigateur (aucun fichier). **Depuis la version 14** : un bouton **🎚️** en haut à droite, à côté de 📜, ouvre un petit volet avec **deux curseurs : 🎶 Musique et 🔔 Bruitages**, de « coupé » à 200 % (100 % = le réglage doux d'origine). Le jeu continue pendant ce temps ; toucher ailleurs referme le volet ; le réglage est gardé d'une partie à l'autre ; le bouton devient 🔇 si tout est coupé. (Version 12-13 : deux boutons 🎶 et 🔔 qui coupaient seulement.) Ce ne sont pas des boutons 🔊 : ils ne lisent aucun texte.
- **La musique (version 13, musique de combat)** : 8 bits, **150 battements par minute**, en ré mineur « harmonique » (le do dièse qui fait la tension des musiques de combat). La première musique (version 12, tranquille, 112 battements) a été refusée par Romain.
  - **Dès le début** : une mélodie, une basse qui pousse en octaves, une batterie rock. Une intro de 4 mesures où la batterie s'ajoute pièce par pièce, avec une montée de souffle et une montée de notes.
  - **Les parties** (8 mesures chacune, ≈ 13 secondes) : le thème du combat, sa réponse, la charge (en majeur, notes syncopées), l'appel-réponse très rapide, **la pause qui fait peur** (longues notes qui vibrent sur des arpèges), le thème en fort (basse qui galope, batterie qui tape, deuxième voix), **une marche en sol mineur**, la charge et l'appel-réponse en fort, la réponse. **Un tour ≈ 2 min 20.**
  - **Elle ne se répète pas** : à chaque tour, toute la musique **change de tonalité** (ré, puis mi, si et mi bémol mineur) et le timbre de la mélodie change ; **il faut plus de 9 minutes** avant de réentendre exactement la même chose.
  - **Les petits sons spéciaux** : notes qui glissent d'en dessous, notes tenues qui vibrent, notes qui tombent d'une octave à la fin d'une phrase, notes qui bégaient, roulement de toms à la fin de chaque partie, petit « piou » laser à l'entrée des parties fortes, cymbale, écho.
  - **Elle grossit avec le combat** : à 2 côtés, les arpèges rapides ; à 3 côtés, la deuxième voix dans les parties fortes et la cymbale ; à 4 côtés, deuxième voix partout et charleston en doubles croches ; avec la colère du cœur, elle accélère un peu (jusqu'à +12 %).
  - Elle se tait doucement en pause et s'arrête à la fin (petite musique de victoire ou de défaite).
  - Vérifié à la machine : chaque mesure a le bon nombre de notes, et les notes longues ou sur les temps forts vont avec les accords (quelques notes de passage voulues). Volume réglé comme avant (environ −32 dB, voir « Doux »).
- **Les bruitages** : golem touché, sonné (« boing »), qui s'écroule ; éclatement de cristal **qui monte la gamme quand les éclatements s'enchaînent** ; chaque rune ; ramasser l'encre ; page, cartes, carte dorée ; les amis (flèches, dague, fioles et flaques, partitions du Barde) ; ami touché ; clavier des codes (bon / mauvais) ; alerte de grosse vague ; et un son par combo (foudre, tonnerre, boule de feu, strike, tornade, onde du sceau, frénésie, colère du cœur…). Pendant qu'on grave, le temps ralentit et **le son devient étouffé**.
- **Doux** : Claude ne peut pas écouter ; les niveaux sont réglés à la mesure (enregistrement hors ligne). Musique de combat seule (version 13) : environ −32 dB en moyenne (−31 dans les parties fortes) ; combat ordinaire sans musique : −37 à −44 dB ; les deux ensemble : −31 dB ; un gros combo : −30 dB ; jamais plus fort que −12 dB en crête. C'est plutôt bas : on monte le volume de la tablette si besoin. Un même bruit ne revient pas plus vite qu'un certain rythme, et pas plus de 10 bruits par image, pour que les gros combos ne fassent pas une bouillie.
- À faire écouter par Romain : si la musique gêne le Barde, on peut la baisser encore ou la couper pour le Sage seulement.
- Hors maquette : dans le vrai jeu, il faudra des boutons 🔊 sur les textes des cartes.

### Ce que dit le robot (version 12)
- Le début de partie ne change pas (le robot tient 1 min 40 à 4 min sans les codes, comme en version 11).
- Un seul combo au niveau 3, robot lent (une rune toutes les 3 s) : orage, étoiles, chouettes, miroir → 6 à 11 minutes ; tornade, sanctuaire → 4 à 9 minutes ; boulets, comète, volcan, scribe → 2 à 8 minutes (ces quatre-là demandent de bouger et de graver vite : le robot joue mal avec). Robot rapide (une rune par seconde) : boulets et scribe fou tiennent souvent jusqu'à 16 minutes.

## Les combos à 10 minutes (mesuré le 24 novembre, 18 h 55)
- **Photos** : chaque combo au niveau 3, à 10 minutes de combat, dans une foule de golems à 10 minutes (9 à 36 vies) : orage « 29 d'un coup », rune miroir « 59 touchés », tornade « 22 aspirés », boulets « STRIKE ! ». Image envoyée à Romain dans la conversation (`combos-a-10-minutes.png`).
- **Le test du robot** : on le fait partir directement à 10 minutes (4 côtés de vagues, lanceurs doublés, vies de 10 minutes), avec le combo au niveau 3, ses deux cartes au niveau 2 et 8 niveaux de cartes au hasard (à peu près ce qu'on a ramassé en 10 minutes), sans aucun ami venu aider, robot rapide (une rune par seconde). On regarde combien de temps il tient **après 10:00** (médiane sur 8 parties) :
  - sans combo : **12 secondes** (la vague des 4 côtés le balaie) ;
  - **orage 5 min 17**, **rune miroir 6 min 09**, **volcan 5 min 42** (très variable : de 22 s à 7 min 40) → les trois plus forts ;
  - scribe fou 1 min 47, chouettes 1 min 36, pluie d'étoiles 1 min 34, sanctuaire 1 min 34, golems-boulets 1 min 16 → moyens ;
  - **tornade 44 s**, **comète 39 s** → trop faibles (en partie parce que le robot les joue mal : la tornade demande de garder la moitié de l'encre, la comète de courir dans la foule).
  - Deux combos : **volcan + miroir 7 min 53** (le plus fort : 8 coulées de lave en étoile), orage + chouettes 5 min 44, boulets + orage 5 min 40, tornade + scribe 1 min 09 (très variable). Trois combos (étoiles, orage, chouettes) : 6 min 13. La fureur du cœur finit toujours par gagner.
  - Les morts tombent souvent juste après une grosse vague (toutes les 28 s, 4 côtés à la fois).
- **Avis de Claude** : les 10 « façons de jouer » ne se valaient pas. Proposé à 18 h 55, **go de Romain à 19 h 16**, fait en **version 15** (19 h 21), sans affaiblir les forts :
  - **Tornade** : avec ce combo, l'escargot ne coûte plus que **4** d'encre ; les golems recrachés arrivent **sonnés** (un trait les fait éclater) ; au niveau 3, elle fait 2 dégâts toutes les 0,4 s sur un peu plus large. Robot à 10 min : 44 s → **1 min 05** ; avec l'orage : **5 min 29**.
  - **Comète** : traînée plus large (et qui dure 1,8 s), **3 dégâts** ; elle **arrête les pierres** (niveau 1) puis **les renvoie** (niveau 2) ; au niveau 2 elle **sonne** les golems qui la touchent, et le Sage sonne ceux qu'il percute ; au niveau 3, ses explosions (plus grandes) **font éclater les golems sonnés**. Robot à 10 min : 39 s → **1 min 15** (3 parties sur 8 entre 3 min 46 et 6 min ; elle dépend beaucoup de la façon de jouer : courir autour des amis et dans la foule, puis tracer des traits).
  - **Golems-boulets** : avec ce combo, **le V ne coûte plus que 1** ; les boulets roulent plus longtemps, rebondissent 4 fois, renversent pour 2 dégâts, jusqu'à 20 boulets en chaîne ; au niveau 3, l'explosion est plus grande (4 dégâts). Robot à 10 min : 1 min 16 → **1 min 42** (3 parties sur 8 au-delà de 5 min).
  - Le début de partie ne change pas (robot sans code : 1 min 32 à 3 min 26). Tests : 56 vérifications passent.
  - Restent devant : orage, miroir, volcan. Tornade et comète sont maintenant dans le groupe du milieu, mais demandent de bien les jouer.

## La version 11 (24 novembre, 16 h 08)
### Pages et vies
- **Pages** : la 1re au 1er gros détruit, puis au bout de 2, 4, 5, 7, 8… gros (avant : 3, 5, 7…). Le robot en ramasse environ 1,7 par minute (1,3 en version 10).
- **Vies** : petits golems +1 toutes les **90 secondes** (avant : 2 minutes) ; gros inchangés (+2 chaque minute). Cogneur / coureur / brute / costaud / lanceur : au début 3/1/7/16/2 ; 5 min 6/4/17/26/5 ; 10 min 9/7/27/36/8 ; 15 min 13/11/37/46/12 (en version 12, la fureur ajoute ensuite 3 vies toutes les 30 secondes).
### Quatre cartes simples de plus (20 en tout)
- **Mur solide** (rune) : le mur dure 4, 5 puis 6 secondes. **Trait large** (rune) : le trait touche plus large (40, 52, 64 au lieu de 28). **Pas léger** (cadeau) : le Sage court plus vite (+20 %, +40 %, +60 %). **Moisson d'encre** (cadeau) : les gros lâchent 1, 2 puis 3 éclats d'encre de plus.
### Les 8 combos de la version 11 (remplacés en version 12)
- Orbes foudroyantes, pluie d'étoiles, encre vive, mur de feu, orage, sanctuaire, grimoire tourbillon, chouettes d'orage : un seul niveau chacun, débloqués avec une carte au niveau 3. Romain les a trouvés « pas assez jouissifs ». La pluie d'étoiles, l'orage, le sanctuaire et les chouettes sont devenus des combos à 3 niveaux ; les autres ont été fondus dans les nouveaux (tornade, volcan, scribe fou).
### Le Barde
- Une **troisième partition**, au hasard avec les deux autres : **repousse** (notes orange) — les golems touchés sont projetés loin des amis, donc sonnés s'ils cognent un autre golem, un mur ou le bord. La question « un golem qui danse compte-t-il comme sonné ? » reste sans réponse : il ne l'est pas.
### Le clavier (bogue de 16 h 04 réparé)
- **Entrée et Espace gravent / reviennent toujours**, quel que soit le bouton touché avant ; aucun bouton ne garde la main après un clic. Dans la fenêtre des cartes, **1, 2, 3** choisissent une carte (Entrée y est ignorée).
### Ce que disait le robot (version 11)
- Sans code : il tient 1 min 40 à 4 min 30 ; amis vers 8 minutes : 1 partie gagnée sur 8. Les vies en plus des petits golems pèsent surtout au début. Si Romain trouve le début trop dur : repasser à 2 minutes, ou ne faire monter les vies qu'à partir de 3 minutes.

## Les pages du grimoire (version 10, 24 novembre, 15 h 09)
- **Les gros golems** (brute moussue, costaud blanc), détruits par le Sage ou par un ami, **lâchent une page dorée** sous une colonne de lumière ; une case sous l'encre dit « 📄 encore 3 gros ». Le Sage la touche (pas pendant qu'on grave).
- **La fenêtre** « Une page du grimoire ! — Choisis un pouvoir. Le combat attend. » : le combat s'arrête, **3 cartes tirées au hasard** (image, famille en couleur, nom, niveau, une phrase) ; sur téléphone, l'une sous l'autre.
- Les pouvoirs pris s'affichent en petites cases sous l'encre (un point par niveau ; bord doré pour les combos).
- **Limites** : 4 nouveaux sorts au plus ; chaque carte monte jusqu'au niveau 3 ; la carte « Protection » n'apparaît que si la protection est sous 16, ou s'il ne reste pas assez d'autres cartes.
- Pas de bouton 🔊 sur les cartes (comme le reste de la maquette) ; il en faudra dans le vrai jeu.
- **Les 16 premières cartes** (chiffres = choix de Claude, à régler en jouant) :
  - **le bâton** (bleu clair) : **Double orbe** (2, 3 puis 4 orbes) ; **Orbe lourd** (2, 3 puis 4 dégâts) ; **Tir rapide** (×1,25, ×1,5, ×2) ; **Orbe perçant** (traverse 2, 4 golems, puis toute la file) ;
  - **les runes** (jaune) : **Grand encrier** (14, 16, 18 d'encre, et l'encrier se remplit) ; **Trait brûlant** (ligne de feu 2, 3, 4 secondes) ; **Mur d'épines** (1, 2, 3 dégâts par seconde aux golems collés) ; **V tonnerre** (chassés par le V : sonnés 1,5, 2,5, 3,5 secondes) ;
  - **les nouveaux sorts** (violet) : **Pages volantes** (2, 3, 4 pages autour du Sage, 2 dégâts par passage) ; **Sceau de garde** (cercle doré autour des amis, 130 / 160 / 190, 1 dégât toutes les 1 / 0,8 / 0,6 s) ; **Rune piège** (toutes les 5 / 4 / 3 s, sonne les golems autour du plus proche des amis) ; **Lumière en chaîne** (toutes les 3 / 2,6 / 2,2 s, 3 / 5 / 7 golems, 2 dégâts) ; **Bouclier de cristal** (un coup encaissé par ami, revient en 20 / 15 / 10 s) ; **La chouette du Sage** (fond sur le lanceur le plus proche : 3 / 5 / 8 dégâts ; validée par Romain le 24 nov. à 16 h 04) ;
  - **les cadeaux** (vert) : **Aimant** ; **Protection** (+5).

## Ce qui durcit (version 9, 24 novembre, 11 h 34 ; vies retouchées en version 11, colère du cœur en version 12)
- **Les vies** (prises par le golem quand il arrive) : voir la version 11.
- **Les grosses vagues** (toutes les 28 secondes) : d'un côté au début, de 2 côtés à 3 min, de 3 à 6 min, des 4 côtés à 9 min ; chaque côté reçoit une vague entière. Jusqu'à 75 golems à la fois (plus pendant la fureur). Vers 9 min 15, la première vague des 4 côtés fait tomber beaucoup de parties du robot.
- **Après 10 minutes** : chaque lanceur arrive avec un deuxième lanceur à côté.
- **À 12, 14 et après 15 minutes** : la colère du cœur (voir la version 12).
- À noter (avis de Claude) : avec 30 à 40 vies, un gros ne se tue presque plus à coups de traits. Ce qui marche encore, c'est **l'éclatement** : un golem sonné qu'un trait touche éclate d'un coup, quelles que soient ses vies (sauf les cuirassés de la fureur).
- **Les trois codes = gagné** (version 17 : **deux codes**, sans le Pisteur) : au 3e code, les golems s'écroulent, le cœur est enfermé dans le cristal, « L'armure tombe ! », puis l'écran de victoire. Le troisième ami ne vient donc jamais aider (l'ordre change à chaque partie). Un cercle tracé ne fait plus rien.
- **Les pouvoirs des amis libérés** (chiffres = choix de Claude) :
  - **le Pisteur** (enlevé en version 17) : salve de 4 flèches en éventail toutes les 2,6 secondes (2 dégâts chacune) ; un golem à moins de 70 de lui : il lui saute dessus à la dague, 2 dégâts, puis revient (une fois toutes les 1,2 seconde) ;
  - **l'Alchimiste** : une fiole toutes les 2 secondes là où les golems sont le plus serrés ; grande flaque (85 de rayon, 5 secondes) au hasard : boue (5 fois moins vite), lianes (ne bougent plus, ne frappent plus), feu (1 vie par seconde pendant 4 secondes, passe aux voisins) ;
  - **le Barde** : une partition toutes les 2,5 secondes, qui touche tous les golems qu'elle frôle : demi-tour (bleu), danse (rose) ou, depuis la version 11, repousse (orange).
- L'heure du combat s'affiche, petite, dans la case de la protection : **pour l'essai** (à enlever dans le vrai jeu si Romain ne la veut pas).
- Le dessin est limité à 2,2 millions de points sur les grands écrans ; sur l'ordinateur de test (sans carte graphique), le dessin prend 3 à 5 ms par image, même avec les combos.

## Le plein écran (24 novembre, 10 h 37 — choix de Claude, à valider)
- Le bouton jaune « Commencer en plein écran », ou le petit bouton à quatre coins en haut à droite ; le même bouton, ou Échap, fait sortir.
- **La place reste carrée** ; sur les côtés, le sol continue dans l'ombre, avec une bordure de pierres au bord de la place. Les jauges et les boutons passent dans les bords.
- **L'aide-mémoire** (runes, pages, les 10 combos, la colère du cœur, pouvoirs des amis, ce qui durcit, codes des amis, Pause, Nouvelle partie) devient un volet, ouvert par le bouton 📜 ; le jeu attend tant qu'il est ouvert.
- **Limite** : si la page Claude ne laisse pas passer en vrai plein écran, la barre du navigateur reste visible.

## Les dessins des versions 8 à 15 (remplacés en version 16 pour la salle, le cœur, les golems et les trois amis ; les effets des runes et des combos, et le Sage, sont gardés)
- **Vue de trois quarts** : tout le monde est dessiné debout ; là où on voit le golem, c'est là qu'on le touche.
- **Les golems** (pierre et éléments naturels, éclat de cristal rouge dans la poitrine) : **cogneur** (pierre grise), **coureur** (jambes de cristal rouge), **brute** (moussu), **costaud** (pierres blanches et racines), **lanceur** (grès, lève une pierre). En version 12 : **cuirassé** (casque à crête rouge et plaque de fer).
- **La marche pas à pas**, les coups, sonné (étoiles), projeté (il tourne), touché (blanc), détruit (il s'écroule en cailloux). En version 12 : boulet (traînée dorée), tornade (entonnoir violet plein de pages), traînée de la comète, coulée de lave, foudre du ciel, onde du sceau, golems en panique (« !! »), bords rouges de la colère, case « FRÉNÉSIE ».
- **Les héros** : le Sage en bleu et or, le Pisteur et son arc, l'Alchimiste et sa fiole, le Barde au chapeau violet et son tambourin.
- Le style est fait pour essayer : dans le vrai jeu, les héros sont « en volume » (style validé), il faudra redessiner dans ce style.
- **Pas de bouton 🔊** : c'est une maquette pour essayer, pas le vrai jeu. Les sons (musique et bruitages) existent depuis la version 12.

## Les règles des runes (version 7, toujours valables)
- **Les quatre runes** (encre à prix fixe, 12 au plus, 8 au départ, un éclat par soldat détruit) : **trait — la lumière (2)** : 2 de dégâts, un soldat sonné éclate et ses éclats font éclater les autres sonnés ; **V — la chasse (2)** : tout ce qui est dans le V est chassé par l'ouverture, refusé au-delà de 95° ; **escargot — la repousse (la moitié de la jauge)** : tout le monde au loin, sans dégâts ; **arc de cercle — le mur (2)** : un mur courbe exactement comme le tracé, 3 secondes, qui ralentit et renvoie les pierres.
- **Reconnaissance des tracés** : 94 % de bonnes lectures sur des tracés tremblés.
- **Les chocs** : un soldat projeté qui cogne un autre soldat, un mur, un ami ou le bord est sonné 3 secondes.
- **Les soldats** (au début) : cogneur (3 vies), coureur (1, rapide), brute (7), costaud (16, frappe pour 2), lanceur (2, de loin).
- **Le bâton du Sage** (sans carte) : une orbe de lumière (1 dégât) un peu moins de deux fois par seconde vers le golem le plus proche.
- **Les codes** : l'ami vient aider (protection +3). Protection 20, +1 toutes les 10 secondes.

## Les codes en vrai : ce qui serait à régler (avis de Claude)
- Les tablettes ne se parlent pas : le code passe à la voix, comme les autres codes du jeu. Le Sage les connaît d'avance et vérifie ce qu'on tape.
- Le combat du Sage finit en même temps que celui des autres ; il ne peut pas tenir au-delà de 15 minutes (voulu par Romain) — la fureur du cœur après 15 minutes le garantit.
- Si le Sage perd : il recommence, et les amis qui ont déjà gagné lui redisent leur code.

## Questions encore ouvertes
- Un golem qui danse (partition du Barde) doit-il compter comme sonné (donc éclater au trait) ? Aujourd'hui : non.
- La dague du Pisteur, « 2 coups » : la question ne se pose plus ici (le Pisteur est enlevé en version 17).
- **Version 17 : le Pisteur doit-il quand même crier un code au Sage (trois codes pour gagner) ?** Aujourd'hui non (voir « La version 17 »).
- Version 16 : les choix de Claude à valider (voir « La version 16 »), surtout la vue (sol vu de haut, personnages debout) et les golems du fond qui passent par les portes.
- Dans le vrai jeu : les codes de cette maquette sont des codes d'essai (Alchimiste ⭐ 🔥 💧, Barde 🔑 💧 🍃 — celui du Barde est bien celui que son combat donne à la fin, Bible §16.9 ; celui de l'Alchimiste est à accorder avec son combat ; jusqu'à la version 16 il y avait aussi Pisteur 🔥 🌙 ⭐).

## Les versions précédentes
- **Version 1** (tour par tour, 7 runes) : une poussée suffisait. **Version 2** (Into the Breach) : un jeu d'énigmes. **Version 3** (temps réel, coûts fixes 2-3-3) : déséquilibrée. **Version 4** (encre à la longueur du tracé) : frustrante. **Version 5** : escargot trop facile, mur mal fait. **Version 6** : mur remplacé par l'arc de cercle. **Version 7** (règles des runes d'aujourd'hui) : « le jeu est pas mal ». **Version 8** (dessins, plein écran) : « un peu trop facile ». **Version 9** (ça durcit, pouvoirs des amis, 3 codes = gagné) : « beaucoup plus dur ». **Version 10** (les pages, 16 cartes) : « j'aime beaucoup ». **Version 11** (20 cartes, 8 combos, clavier) : combos « pas assez jouissifs », et pas de sons. **Version 12** (10 combos, colère du cœur, sons) : musique « petite maison dans la prairie », pas une musique de combat. **Version 13** (musique de combat) : il demande des curseurs de volume. **Version 14** (curseurs de volume) : il demande de renforcer les combos faibles. **Version 15** (tornade, comète, boulets renforcés) : « le jeu, pour moi, il est fini ». **Version 16** (la salle, Grosbec et ses golems du combat du Barde, vus de haut) : Romain n'a rien dit des dessins ; il demande d'enlever le Pisteur. **Version 17** (deux amis à protéger, le Barde et l'Alchimiste ; deux codes) : pas encore vue par Romain.
