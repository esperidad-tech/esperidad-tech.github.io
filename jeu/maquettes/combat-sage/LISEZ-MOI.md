# Combat final — le Sage contre Grosbec (jusqu'à la version 15 : « contre le cœur de l'armure ») : maquettes de test

Maquette jouable (pas le vrai jeu, rien n'est construit dans Brumeval) : https://claude.ai/artifact/S3UzmZhUvPFUscZeZs6DTy — **version 20** (en ligne le 25 novembre, 19 h 27) : **le temps corrigé (le chronomètre suit le combat, le ralenti dure 2 secondes par rune), les runes comme avant, Grosbec qui attaque en rouge, quatre golems à part (porte-dalle, mortier, porteur de bombe, bélier qui défonce les murs)** (go de Romain, 19 h 05) — voir « La version 20 ». **Pas encore vue par Romain.** Avant, la **version 19** (17 h 27) : **un essai demandé par Romain (16 h 56) : plus de codes, le Sage tient 10 minutes et Grosbec crie « Assez ! Ça suffit ! » ; l'encre ne se gagne plus qu'au bâton ; le trait n'abat plus d'un coup un golem sonné ; 14 builds (dix pour le bâton, un par rune)** — voir « La version 19 ». **Jouée par Romain à 18 h 56 : « extrêmement facile », « on s'amuse pas parce qu'en fait, on fait rien » ; et un défaut trouvé par Claude : le chronomètre avance à vitesse normale pendant que le combat est au ralenti quand on grave — voir « Ce que Romain en a dit », en tête de « La version 19 ». Corrigé en version 20.** Avant, la version 18 (16 h 10) : l'encre rare, le bâton plus fort, plus de pages — voir « La version 18 ». Depuis la version 17 (15 h 04) : **le Sage n'a plus que deux amis à protéger, le Barde et l'Alchimiste ; le Pisteur est enlevé** — voir « La version 17 ». Les dessins sont ceux de la version 16 (24 novembre, 23 h 25) : la grande salle de Grosbec vue de haut, Grosbec dans son armure à la place du cœur, ses golems (ceux du combat du Barde), les amis de dos qui tirent sur lui — voir « La version 16 » ; Romain n'a rien dit de ces dessins, il a seulement demandé la version 17. Les quatre runes, les combos et les sons sont ceux de la version 15 (19 h 21), que Romain avait jugée finie (19 h 16 : « le jeu, pour moi, il est fini ») ; le 25 novembre il a rouvert le réglage (trop de gravure).
- Dans ce document, « le cœur » (versions 9 à 15) = **Grosbec** depuis la version 16 ; « soldats » = golems ; « lanceurs » et « pierres » = frondeurs et braises.
- **Où est le code** (Romain, 19 h 44 : « Publie-la sur GitHub ») : **branche `brumeval-sources`, dossier `jeu/maquettes/combat-sage/`** (ce document y est en `LISEZ-MOI.md`). Rien n'est en ligne sur le site : la maquette se joue à l'adresse ci-dessus.
  - `combat-sage.html` : la page toute faite (un seul fichier : règles, dessins, sons) = la version 20 en ligne, à l'identique.
  - `python3 construire.py` la refabrique, en trois temps :
    1. `v16/assembler.py` refait `render16.js` (les dessins) à partir de `render15.js` (gardé pour les effets des runes et des combos, les pouvoirs des amis, le Sage, l'affichage) et des morceaux neufs de `v16/` : `salle.js` (la salle), `grosbec.js` (Grosbec, ses gestes, les tirs des amis sur lui), `golems.js` (les golems), `herosdos.js` et `heros.js` (les amis de dos), `sprites.js` (les images préparées), `entete.js` ;
    2. `ui7.html` (la page, ses boutons, l'aide-mémoire) reçoit les retouches des versions 8 à 20 : `construire.py`, puis `build12_part.py`, `build14_part.py`, `build16_part.py` (les mots, la finesse automatique, la ligne de mesures), `build17_part.py` (les textes pour deux amis), `build18_part.py` (les textes sur l'encre rare et le bâton), `build19_part.py` (le chronomètre, les textes, la fin de Grosbec, la fenêtre des cartes, les dessins des nouveaux builds), `build20_part.py` (le rouge, les golems nouveaux, le Sage sonné, les textes) ;
    3. on y colle `logic20.js` (**fabriqué à la chaîne : `v19/regles.py` fait `logic19.js` à partir de `logic18.js`, puis `v20/regles.py` fait `logic20.js` à partir de `logic19.js`** ; pour changer une règle, retoucher le bon `regles.py`, jamais `logic19.js` ni `logic20.js` ; tous les réglages de la version 20 sont en tête de `v20/regles.py`) (les règles : `window.G`, utilisable aussi dans Node), `sound14.js` (les sons et la partition, `SON`) et **les modèles du combat du Barde** : `barde/outils.js`, `barde/golems.js`, `barde/grosbec.js` (copies de sa **version 9**, non modifiées), retouchés au passage par `modeles_barde.py` (golems cuits plus petits et sans leur ombre ; Grosbec regardé de plus haut et cuit plus petit).
  - `node test-regles.js` : 98 vérifications des règles et des builds. `node robot.js games=8 think=1 modes=combos at=600 extra=8 build=orage:3` : le robot (`at=600` = partir à 10 minutes, `extra` = cartes au hasard en plus, `build` = combos donnés au départ, `modes=cercle` = il court en rond autour des amis ; depuis la version 18 : `'cfg={"shardEvery":5}'` pour essayer un réglage sans toucher aux règles, `sobre=1` = il ne grave que pour un groupe de 4 golems ou plus, `logic=./autre.js` pour d'autres règles ; il dit combien de parties il gagne, quand il tombe, les runes, l'encre, les pages, et quand arrivent ses builds ; `pick=hasard` = il prend ses cartes au hasard au lieu de viser un build ; depuis la version 20 il esquive le rouge, va chercher le mortier et passe derrière les porte-dalle ; `modes=campeur` = il campe entre ses amis sans graver ni esquiver, `modes=runner` = il bouge et esquive mais ne grave jamais, `naif=1` = il n'esquive pas, `face=1` = il ne contourne pas les porte-dalle, `seed=40` = d'autres parties). **`economie.js` n'a pas été adapté à la version 20** (il tourne encore sur `logic19.js`). `node joueur-immobile.js parties=6 graver=1` : le joueur qui ne fait rien (`graver` = la part du temps où le jeu reste en mode graver) ; il doit perdre vite. `node economie.js games=16` : un robot qu'on ne peut pas battre joue 12 minutes sans les codes en visant les combos ; il dit quand tombent les pages et quand arrivent les combos.
  - Avec le navigateur (Playwright) : `python3 partie-entiere.py` (version 20 : l'explication, le rouge et les golems nouveaux, puis une partie courte jusqu'à « Assez ! » sur un téléphone imité), `photos-salle.py` et `photos-moments.py` (les photos de la salle, des golems qui arrivent, de Grosbec touché, de la victoire), `vitesse.py` (les images par seconde sur quatre appareils imités), `cuisson.py` (les images préparées d'avance), `photos-combos.py` (les 10 combos ; pas relancé depuis la version 15). `photos-salle.py`, `photos-moments.py`, `vitesse.py` et `cuisson.py` datent de la version 16 et n'ont pas été relancés en version 17 (`photos-moments.py` tape encore le code du Pisteur : à adapter). Les photos vont dans `/tmp`.
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
- **25 novembre, 15 h 47** (en réponse à « le début est un peu plus facile, je le laisse ou je le durcis ? ») : « Moi, je pense que tu devrais mettre **plus de livres**. **Ne pas changer la difficulté**, mais mettre plus de livres. Pour qu'on arrive plus facilement au **méga combo**. » (Les livres = les pages du grimoire.)
- **15 h 49** : « Ce que j'aimerais aussi, c'est faire en sorte que **l'attaque de base, elle soit plus importante**. Enfin, tu vois, que **les dessins soient un petit peu moins présents**. Parce que là […] **on fait que graver tout le temps, tout le temps, tout le temps**. S'il pourrait y avoir **moins d'encre à ramasser**, on devrait **réfléchir un petit peu plus**. Mais on augmente un petit peu l'arrivée des livres pour que l'attaque de base elle soit plus facile. En fait, j'aimerais plus que ça soit **le placement qui soit important**. **Le gravé est important pour les gros groupes.** Quand ils sont vraiment nombreux, là, le gravé, c'est important. Mais quand ils arrivent un peu entre les vagues, là, **le placement… et choisir les bons combos**, je pense que c'est important. Après, **on va peut-être pas trop passer de temps sur ce jeu-là**, mais bon. » → version 18.
- **19 h 05** (Claude avait proposé : corriger le temps, les runes comme avant, Grosbec qui attaque en rouge, et des golems à part — porte-dalle, mortier, bélier qui casse les murs, porteur de bombe, voleur de page, tambour ; plus tard, les amis qui valsent et une salle plus grande) : « **Vas-y, go, juste mets pas le voleur. J'aime pas trop l'idée de voleur. Et le tambour, je suis pas sûr** parce que les golems arrivent très vite déjà à la fin […] Mais déjà, **si on part sur le principe qu'il faut un petit peu éviter des choses, ça peut être déjà intéressant**, je trouve. Par contre, **reste le problème du côté un peu trop facile, où je restais au centre et je détruisais tout le monde. Est-ce que tu penses que ça va le régler ?** Bon, enfin, en tout cas, on peut déjà essayer comme ça. Allez, vas-y, je te donne mon go et tu peux mettre en ligne. » → version 20. (Romain n'a pas répondu à deux questions : sa première partie était-elle restée en mode graver ? l'encre de la version 18 ou de la 17 ? Claude a pris l'encre rare de la 18.)
- **18 h 56** (après deux parties de la version 19) : « extrêmement facile », « on s'amuse pas parce qu'en fait, on fait rien » — ses mots sont en tête de « La version 19 ».
- **16 h 33** : « Ce qu'on peut faire peut-être, c'est que quand on fait le trait de lumière, **ça les tue pas automatiquement quand ils sont étourdis**, et **quand on tue avec une rune, ça fait pas apparaître d'encre**. Après […] tu peux tenter **un build avec le trait, un build avec le V, un build avec l'escargot, un build avec l'arc de cercle**, et après tu mets **plein de builds avec les attaques de base. Tu mets au moins 10 builds différents avec l'attaque de base, qui deviennent vraiment très très forts.** […] Non, **le but, c'est de tenir 10 minutes** […] Et **au début, que ça soit vraiment, pendant pas mal de temps, que ça soit facile grâce aux auto-attaques**. Le souci, c'est qu'est-ce qui se passe si le Barde, il est bloqué sur […] le Guitar Hero […] Du coup, le Sage meurt. Et si le Sage meurt, comment on fait ? »
- **16 h 42** : « c'est peut-être un peu trop compliqué, du coup, **je propose qu'on laisse tomber l'idée que les autres passent des codes. Tant pis pour cette idée. Et le Sage, il doit tenir 10 minutes. À 10 minutes, Grosbec, il dit ça suffit.** » Puis il cherche : un code « j'ai perdu » qui changerait le combat d'après ? Grosbec plus fort si quelqu'un a perdu ? « Mais […] **si l'équipe déjà est pas douée, ça va renforcer encore plus la difficulté. Je sais pas trop comment faire.** »
- **16 h 48** (Claude avait proposé : 10 minutes pour les quatre, de 0 à 3 étoiles, des étoiles qui ne donnent que du bon) : « **je suis pas fan de l'idée** […] pour le Pisteur, ça peut être long, le temps qu'il prenne en main son donjon. […] c'est l'enquête 10, **je vais faire en sorte que […] ce genre de jeu, ils l'aient déjà eu. Donc, ils connaissent. Comme ça, ils seront pas perdus. Oui, c'est peut-être ça la solution.** »
- **16 h 53** : « C'est compliqué pour le Sage parce que imagine **il a pris un mauvais build** […] Le Pisteur, lui, il peut refaire juste le stage en cours. L'Alchimiste, c'est un peu comme le Sage. S'il meurt alors que Grosbec avait presque plus de vie, faut tout qu'il recommence. […] tu pourras toujours lui redonner 2 minutes, il va toujours perdre. » (Claude avait proposé que le Sage se relève avec 2 minutes de plus à tenir ; puis des étapes de 2 min 30 et une carte offerte à chaque chute.)
- **16 h 56** : « **Bon non, on va faire juste un essai. On cale le chronomètre sur 10 minutes. Et à 10 minutes, Grosbec il dit assez, ça suffit. Et tu cales tous les nouveaux combos avec les nouvelles règles et on voit ce que ça donne. Fais ces modifs et mets en ligne.** » → version 19.
- **25 novembre, 14 h 52** : « J'aimerais que tu fasses un petit changement. J'aimerais que **le Sage, il ait que deux personnes à protéger, juste le Barde et l'Alchimiste**. Juste, j'aimerais que tu **enlèves le Pisteur**. » Puis : « Fais cette modification et mets-le en ligne. » → version 17. (Dans la nuit, le Pisteur a reçu son propre combat, contre la garde de Grosbec : Bible §17.)
- Rappel : Pisteur = combat classique + combos ; Barde = rythme + Guitar Hero ; Alchimiste = façon Magicka.

## La version 20 (25 novembre, 19 h 27) — le temps corrigé, les runes comme avant, le rouge de Grosbec, quatre golems à part
**Le go de Romain (19 h 05)** : « Vas-y, go, juste mets pas le voleur. […] le tambour, je suis pas sûr […] si on part sur le principe qu'il faut un petit peu éviter des choses, ça peut être déjà intéressant […] reste le problème du côté un peu trop facile, où je restais au centre et je détruisais tout le monde. Est-ce que tu penses que ça va le régler ? »

**La réponse de Claude à sa question** : esquiver ne suffit pas si on peut esquiver sans quitter le centre. D'où deux règles ajoutées par Claude (pas demandées, à valider) : **le rouge blesse aussi les amis**, et **la dalle du porte-dalle arrête les orbes qui arrivent de face** (donc celles qu'on tire depuis le centre).

### Ce qui change
- **Le temps (le défaut de la version 19)** : le chronomètre, les vies des golems, les côtés des vagues et la colère suivent **le temps du combat** (`s.t`), plus la vraie horloge. **Le ralenti dure 2 secondes au plus par rune** (`slowMax`) : après, le temps reprend même si on reste en mode graver ; une rune gravée le relance. Rester en mode graver ne rapporte plus rien.
- **Les runes comme avant** [Romain, 18 h 56 : « la gestion des runes était quand même plus rigolote. Je pense qu'il faut revenir comme avant »] : **le trait fait de nouveau éclater d'un coup un golem sonné** ; **un golem détruit par une rune lâche de nouveau de l'encre**. L'encre est celle de la version 18 (choix de Claude, Romain n'a pas tranché) : un petit golem sur huit, un gros toujours un, et une rune qui détruit trois golems ou plus fait tomber un éclat de plus par golem. Le chronomètre de 10 minutes et les 14 builds restent [« j'aime bien le timer de 10 minutes »].
- **Le rouge de Grosbec** : à partir de 50 secondes, Grosbec attaque le Sage (toutes les 24 secondes pendant les trois premières minutes, puis toutes les 15, toutes les 10 quand il est en colère). Trois coups, tirés au hasard :
  - **le poing** : un grand rond rouge (les golems qui y survivent sont sonnés) ;
  - **le balayage** : une bande rouge qui traverse toute la salle, en large ou en long ;
  - **la pluie de braises** : cinq petits ronds rouges autour du Sage.
  - **Le rouge suit le Sage un instant (en pointillés), puis se fige (trait plein), se remplit, et ça tombe.** Dedans : **le Sage est sonné 2 secondes** (il ne tire plus, ne grave plus, marche au ralenti) **et lâche toute son encre**, qui retombe en éclats autour de lui ; **les golems prennent cher** (de plus en plus au fil des minutes : on peut attirer le coup sur la foule) ; **les amis perdent de la protection** (2 pour le poing et le balayage, 1 par braise). Grosbec tend le bras et crie (« PRENDS ÇA ! », « HORS DE MA VUE ! », « BRÛLE ! »).
- **Quatre golems à part** (un mot d'explication s'affiche la première fois qu'on en voit un) :
  - **le porte-dalle** (dès 1 min 10, un golem sur dix) : sa dalle **arrête les orbes qui arrivent de face**. Il faut passer sur le côté ou derrière, ou le chasser avec une rune (V, escargot, un choc : la dalle tombe). La dalle casse toute seule après **8 orbes arrêtées**. Le dessin est celui du combat du Barde (avec et sans dalle).
  - **le mortier** (dès 1 min 40 ; un seul à la fois, deux après 5 minutes, trois pendant la colère) : il s'installe **loin du centre, hors de portée du bâton quand on est près des amis**, et tire sur le Sage toutes les 4,5 secondes (un rond rouge, comme le reste du rouge). Il faut aller le chercher. Il lâche toujours un éclat d'encre. Dessin : un gros frondeur, un rond rouge à ses pieds.
  - **le porteur de bombe** (dès 2 min 30, 7 golems sur cent, rapide) : **il saute en mourant** : tout ce qui est autour prend (les autres bombes sautent à leur tour), le Sage est sonné s'il est trop près, les amis perdent 2. S'il arrive sur un ami, il saute dessus. Dessin : un rôdeur, sa bombe sur le dos.
  - **le bélier** (il existait déjà : le gros qui lâche des pages) : **il défonce les murs** et fonce droit dessus au lieu de les contourner. C'est la fin de la forteresse de murs.
- **Pas fait** : le voleur de page (Romain : « j'aime pas trop »), le tambour (« pas sûr »), les amis que Grosbec envoie valser, la salle plus grande (gardés pour après, si ça manque encore).
- Sur l'écran d'explication : une cinquième image, « 5. Le rouge ». Dans l'aide-mémoire : « Le rouge de Grosbec » et « Les golems à part ».

### Mesuré au robot (réglages retenus ; 8 parties par ligne, 24 pour la première)
| Le robot… | Il gagne | Il tient (médiane) |
|---|---|---|
| joue tout : il esquive, grave, va chercher le mortier, contourne les porte-dalle | **10 parties sur 24** | 8 min 50 (11 de ses 14 défaites sont après 6 minutes) |
| **campe entre ses amis**, sans graver ni esquiver | **0 sur 8** | **1 min 57** |
| grave mais n'esquive pas le rouge | 0 sur 8 | 3 min 50 (sonné 9 fois, 17 de protection perdus par le rouge) |
| bouge et esquive, mais ne grave jamais | 2 sur 8 | 3 min 48 |
| ne fait rien du tout (`joueur-immobile.js`), en mode graver ou pas | 0 sur 6 | 1 min 55 |

- Ce qui coûte le plus au robot qui joue tout : **les bombes** (12 à 16 de protection par partie), loin devant le rouge (5 à 7).
- Pour arriver là, il a fallu adoucir la fin : les deux vies de plus arrivent toutes les **50 secondes** après 5 minutes (25 en version 19).
- **Le robot ne dit toujours pas si c'est amusant**, et il joue mal les runes (une toutes les 3 secondes, sans le ralenti). Cette fois il y a au moins un robot qui campe et un joueur immobile : les deux perdent vite.

### Vérifié
- 98 vérifications des règles (27 pour la version 20 : le ralenti de 2 secondes, le chronomètre au ralenti, le trait, l'encre, le rouge qui suit puis se fige, le Sage sonné et son encre, les amis touchés, le balayage, la dalle de face et de dos, la dalle qui casse, le V qui la fait tomber, le mortier, la bombe et sa chaîne, le bélier et le mur).
- Dans le navigateur : l'explication, une scène avec le rouge et les golems nouveaux (photos regardées), une partie courte jouée jusqu'à « Assez ! » sur un téléphone imité : aucune erreur, 60 images par seconde (machine de test).

### Pas vérifié
- Si c'est amusant, et si c'est jouable pour un enfant de 11 ans : le début est-il trop sec ? (Le robot qui n'esquive pas tombe à 3 min 50.)
- Un vrai iPhone ; la vitesse d'affichage dans une grosse scène (non remesurée) ; les sons (les nouveaux effets rejouent d'anciens sons, jamais écoutés).
- Le mot de Grosbec quand il frappe est un peu pâle sur l'arche du fond.

### Choix de Claude, à valider par Romain
- **Le rouge blesse les amis** (pas demandé : ajouté pour que camper au centre coûte) ; les chiffres (2 pour le poing et le balayage, 1 par braise, 1 pour l'obus).
- **Le Sage sonné lâche toute son encre** (elle reste par terre, on la reramasse) ; 2 secondes ; il marche au ralenti.
- La dalle qui casse après 8 orbes ; le mortier hors de portée depuis le centre ; la bombe à −2.
- L'encre rare de la version 18 plutôt que celle de la 17.
- Le ralenti à 2 secondes par rune ; Grosbec moins pressé pendant les trois premières minutes.
- Les trois mots de Grosbec.

## La version 19 (25 novembre, 17 h 27) — un essai : 10 minutes sans codes, les nouvelles règles des runes, 14 builds
**Le go de Romain (16 h 56)** : « on va faire juste un essai. On cale le chronomètre sur 10 minutes. Et à 10 minutes, Grosbec il dit assez, ça suffit. Et tu cales tous les nouveaux combos avec les nouvelles règles et on voit ce que ça donne. »

### Ce que Romain en a dit (25 novembre, 18 h 56), et le défaut trouvé — CORRIGÉ EN VERSION 20
**Romain, après deux parties** : « c'est devenu vraiment **extrêmement facile**. […] La première, **je restais au centre et je touchais à rien. Je suis même parti me faire à manger, je suis revenu, la partie était gagnée.** La deuxième […] **je dessinais des murs pendant toute la partie, juste en entourant les 2 héros à protéger** […] je bougeais pas […] absolument aucune difficulté. **Je crois que la gestion des runes était quand même plus rigolote. Je pense qu'il faut revenir comme avant. J'aime bien le timer de 10 minutes à tenir.** […] L'Alchimiste […] c'est un peu facile […] mais au moins, **il s'amuse parce qu'il y a plein de choix**. Là […] **on s'amuse pas parce qu'en fait, on fait rien. On peut rester immobile et rien faire.** […] Il y a des jeux comme ça où tu te balades dans la map avec plein de monstres qui arrivent et tu dois choisir et améliorer tes sorts […] Mais **la map elle est grande, tu peux te déplacer. Et puis il y a des monstres un peu particuliers. Là on est pauvre au niveau du bestiaire** […] **Il n'y a pas de trucs à esquiver, il n'y a pas de zone à esquiver.** Les deux, là, **ils sont posés au centre de la carte et ils bougent pas. Trouve-moi des idées pour améliorer ce jeu.** »

**Le défaut trouvé par Claude en cherchant pourquoi (une faute de la version 19)** :
- Quand on est en mode « graver », **le combat tourne au ralenti** (14 fois plus lent, `slow: 0.07`), mais **le chronomètre de 10 minutes avance à vitesse normale** (`s.realT`, dans `step`). Plus on reste en mode graver, moins on se bat. Et un mur, qui dure quelques secondes de combat, dure alors très longtemps.
- **Mesuré** (`node joueur-immobile.js`) : un joueur immobile qui ne touche à rien **perd en 1 min 20 à 3 min 30** (20 parties sur 20, à trois endroits : entre les amis, juste au-dessus, à sa place de départ) ; le même, si le jeu reste en mode graver tout le temps, **gagne 3 parties sur 4** avec **42 secondes de vrai combat** en 10 minutes. En mode graver 60 ou 80 % du temps sans rien faire : il perd.
- **Le robot ne grave jamais au ralenti** (`G.step(s, dt, false)`) : ses chiffres (14 sur 24) décrivent un jeu que le joueur ne joue pas. À refaire : un robot qui passe par le ralenti, et **le joueur immobile doit perdre vite dans tous les cas**.
- Le défaut est plus ancien que la version 19 : depuis la version 9, les codes des amis arrivaient à l'heure de la vraie horloge pendant que le combat ralentissait. C'est peut-être une des raisons pour lesquelles « graver tout le temps » marchait si bien.
- **Pas sûr** : que la première partie de Romain (« je touchais à rien ») était bien restée en mode graver. Question posée à Romain.

**Proposé par Claude à 19 h (rien de décidé)** : (1) le chronomètre ne compte que le temps du combat, et le ralenti dure 2 secondes au plus par rune ; (2) les runes comme avant (le trait fait éclater les sonnés, une rune qui détruit redonne de l'encre) en gardant le chronomètre et les builds ; (3) Grosbec attaque le Sage : des zones rouges à esquiver, qui blessent aussi les golems ; (4) des golems qui demandent chacun autre chose : le porte-dalle (bouclier devant), le mortier (reste loin, vise le Sage), le bélier qui casse les murs, le porteur de bombe, le voleur de page, le tambour ; (5) les amis ne restent plus plantés : Grosbec en envoie un valser dans un coin, il faut courir le protéger ; (6) une salle plus grande : pas tout de suite (avis de Claude).

### Ce qui est décidé, et ce qui ne l'est pas (la discussion de 16 h 33 à 16 h 56)
- **Décidé par Romain** : **plus de codes passés d'un joueur à l'autre pendant le combat** (« tant pis pour cette idée ») ; **le Sage tient 10 minutes**, puis Grosbec dit « ça suffit » et **la première étape est finie** ; pour que personne ne soit perdu à l'enquête 10, **chaque genre de jeu du combat final aura déjà été joué dans les enquêtes d'avant** (« c'est peut-être ça la solution »).
- **Pas décidé** : ce qui se passe quand un héros perd son combat (ici, le Sage dont la protection tombe à zéro **perd et recommence ses 10 minutes**, comme avant) ; comment le résultat de la première étape passe au combat d'après. Romain ne veut pas d'un Grosbec plus fort quand quelqu'un a perdu (« si l'équipe déjà est pas douée, ça va renforcer encore plus la difficulté »).
- **Propositions de Claude non retenues** : 10 minutes pile pour les quatre héros avec de 0 à 3 étoiles (« pas fan » : le combat du Pisteur peut être long) ; le Sage qui se relève avec 2 minutes de plus (« il va toujours perdre » avec un mauvais build) ; des étapes de 2 min 30 avec une carte offerte à chaque chute (« bon non, on va faire juste un essai »).

### Ce qui change
- **Plus de codes** : plus de bouton « Taper un code », plus d'ami qui vient aider (les pouvoirs du Barde et de l'Alchimiste n'existent plus dans ce combat). En haut à gauche : **le chronomètre**, « Tiens encore 7:32 », et sa barre. **À 10 minutes, Grosbec lève les bras : « ASSEZ ! ÇA SUFFIT ! »**, les golems disparaissent, écran « Tu as tenu 10 minutes ! » avec la liste des builds. Il n'est plus pris dans le cristal et son casque ne se fend plus : il n'est pas battu, il en a assez.
- **L'encre ne se gagne plus qu'au bâton** [Romain : « quand on tue avec une rune, ça fait pas apparaître d'encre »] : un golem détruit par une rune ne lâche rien — le trait, le feu du trait, le mur, les boulets, la tornade. Au bâton (les orbes et tous les builds du bâton) : **un petit golem sur quatre** lâche un éclat, **un gros toujours un**. Le remboursement des groupes (version 18) disparaît.
- **Le trait n'abat plus d'un coup un golem sonné** [Romain : « ça les tue pas automatiquement »] : il lui enlève **la moitié de sa vie (au moins 4)** et le golem n'est plus sonné ; ses éclats font pareil aux sonnés voisins. Les petits éclatent encore, les gros non. (Le chiffre est un choix de Claude.)
- **Le bâton fait 2 dégâts par orbe** (avant : 1) : le début se joue au bâton [Romain : « au début […] facile grâce aux auto-attaques »].
- **Le grimoire aide à finir un build** : chaque page propose au moins une carte qui fait avancer un build commencé, et chaque carte dit ce qu'elle prépare (« Avec « Double orbe » : Orbes explosives »).
- **Les pages** : vite au début (il faut 1, 1, 2, 2, 3, 3 gros), puis un gros de plus à chaque page (4, 5, 6…). Environ 25 pages en 10 minutes pour le robot.
- **La colère de Grosbec** : à 7 min 30 (« ÉCRASEZ-LES ! ») et à 9 minutes ; il n'y a plus de fureur après 15 minutes, puisque le combat s'arrête à 10.
- **Enlevés** : l'orage, le sanctuaire, le scribe fou, la rune miroir (le scribe et le miroir étaient des builds « graver tout le temps ») ; la carte Rune piège ; la limite de 4 sorts (il n'en reste que cinq, et elle pouvait bloquer un build).

### Les 14 builds (une carte dorée à 3 niveaux ; elle sort quand on a ses deux cartes, dont une au niveau 2 ; ils se cumulent)
**Dix builds du bâton** [Romain : « au moins 10 builds différents avec l'attaque de base, qui deviennent vraiment très très forts »] :

| Build | Ses deux cartes | Niveau 1 | Niveau 2 | Niveau 3 |
|---|---|---|---|---|
| 🌠 Pluie d'étoiles | double orbe + tir rapide | 12 étoiles autour du Sage toutes les 5 s | toutes les 3 s, elles rebondissent sur les bords | une étoile qui détruit un golem éclate en 3 |
| 🎱 Ricochet (nouveau) | double orbe + orbe perçant | l'orbe rebondit sur 2 golems de plus | 4 rebonds, +1 dégât à chaque rebond | 8 rebonds, l'orbe se dédouble au premier |
| 💥 Orbes explosives (nouveau) | double orbe + orbe lourd | l'orbe explose : 1 dégât autour | plus grand, 2 dégâts, souffle les golems | 3 dégâts ; un golem détruit par l'explosion explose à son tour |
| 🔦 Le rayon (nouveau) | tir rapide + orbe perçant | toutes les 3 s, un rayon traverse la salle (3 dégâts) | toutes les 2 s, plus large (4) | toutes les 1,2 s (5), des deux côtés |
| 🔥 Orbes de braise (nouveau) | orbe lourd + tir rapide | l'orbe met le feu | le feu brûle plus fort et saute de golem en golem | un golem qui meurt en brûlant explose |
| ❄️ Orbes de givre (nouveau) | orbe lourd + orbe perçant | l'orbe ralentit | au 3e coup le golem gèle 2 s ; gelé, il prend double | un golem gelé qui casse gèle ses voisins |
| ⚡ Bâton de foudre (nouveau) | lumière en chaîne + tir rapide | un tir sur 4 est un éclair sur 4 golems | un sur 3, 6 golems, le premier est sonné | un sur 2, 8 golems, plus fort |
| 🛡️ Orbes gardiennes (nouveau) | pages volantes + double orbe | 3 orbes tournent tout près du Sage, frappent et arrêtent les braises | 5 orbes, elles repoussent | 8 orbes, toutes les 4 s elles partent en étoile |
| 🌟 La comète | pas léger + orbe perçant | comme avant (la traînée) | comme avant | la traînée explose : sonnés, et les sonnés perdent la moitié de leur vie |
| 🦉 Parlement des chouettes | chouette + orbe lourd | comme avant | comme avant | comme avant |

**Un build par rune** [Romain : « un build avec le trait, un build avec le V, un build avec l'escargot, un build avec l'arc de cercle »] :

| Build | Sa rune | Ses deux cartes | Ce qui change |
|---|---|---|---|
| 🌋 Volcan | le trait | trait brûlant + trait large (avant : + mur d'épines) | il ne touche plus au mur |
| 🎳 Golems-boulets | le V | V tonnerre + grand encrier (avant : + mur solide) | comme avant |
| 🌀 Tornade | l'escargot | pages volantes + aimant | comme avant |
| 🏰 Rempart (nouveau) | l'arc de cercle | mur d'épines + mur solide | N1 : le mur dure 2 s de plus et met le feu ; N2 : il rejette les golems en arrière, sonnés ; N3 : il explose en disparaissant |

Les dessins : les orbes gardiennes (des orbes bleu clair autour du Sage), les golems gelés (un glaçon, « gelé ! »), les orbes orange (braise) ou bleu clair (givre), l'explosion d'une orbe (un anneau doré), le rayon (le trait de lumière, à travers toute la salle). Les sons des nouveaux effets sont des sons qui existaient déjà.

### La courbe du combat (réglée au robot ; chiffres = choix de Claude)
- **Un début doux** : moins de golems au départ, les colosses n'arrivent qu'après 2 minutes, les grosses vagues de deux côtés à 3 min 30 (trois à 7 minutes).
- **Ça monte pour de bon après 5 minutes** : jusqu'à un golem de plus par seconde, et deux vies de plus toutes les 25 secondes (six pour les gros).
- **Le robot** (il vise un build ; 24 parties) : il **gagne 14 parties sur 24**. Il ne tombe presque jamais avant 6 minutes (2 parties) ; **6 de ses 10 défaites sont dans les deux dernières minutes**. Premier build à 2 min 04, premier build au niveau 3 à 2 min 56, 25 pages, 15 niveaux de builds à la fin. Il grave 7,6 runes par minute.
- **Le robot qui prend ses cartes au hasard** (16 parties) : il gagne 3 fois ; il tombe surtout entre 6 et 10 minutes, sans aucun build au niveau 3. Bien choisir ses cartes compte donc beaucoup.
- Ce réglage a demandé plusieurs essais : avec des pages qui tombent encore plus vite (30 en 10 minutes), le robot gagnait 17 parties sur 20 et le combat n'avait plus d'enjeu ; avec un début plus calme mais peu de pages, il tombait vers 3 minutes, faute de gros à détruire.

### Vérifié
- 79 vérifications des règles (dont une par build nouveau, le chronomètre, l'encre, le trait). Une partie courte jouée jusqu'à « Assez ! » dans le navigateur, sur un téléphone imité : aucune erreur. Photos regardées : l'explication, les builds en action (givre, gardiennes, braise, rayon), la fenêtre des cartes, la fin.

### Pas vérifié
- **Si c'est amusant** : le robot ne sent pas le jeu. Un robot qui gagne 14 fois sur 24 ne dit pas ce que fera un joueur.
- Chaque niveau de chaque build n'a pas été regardé à l'écran un par un (les règles sont vérifiées, pas tous les dessins). Les effets cumulés de cinq ou six builds à la fois n'ont pas été mesurés en vitesse d'affichage.
- Les sons : toujours jamais écoutés par Claude ; les nouveaux effets rejouent d'anciens sons.
- Un vrai iPhone.

### Choix de Claude, à valider par Romain
- Le trait sur un golem sonné : la moitié de sa vie, au moins 4, et il n'est plus sonné.
- Quelles deux cartes ouvrent quel build ; ce que fait chaque niveau ; ce qui a été enlevé (orage, sanctuaire, scribe fou, miroir, rune piège).
- L'orbe de base à 2 dégâts ; un petit golem sur quatre pour l'encre ; le rythme des pages ; la colère à 7 min 30 et 9 minutes ; toute la courbe.
- Quand la protection tombe à zéro, le Sage perd et recommence ses 10 minutes : Romain trouvait ça « embêtant » (16 h 42) mais n'a retenu aucune autre règle pour l'essai.

## La version 18 (25 novembre, 16 h 10) — l'encre rare, le bâton plus fort, plus de pages
**Demandes de Romain (15 h 47 et 15 h 49)** : plus de livres pour arriver plus vite au méga combo ; l'attaque de base plus importante ; moins d'encre à ramasser (« on fait que graver tout le temps ») ; la place du Sage qui compte ; la gravure pour les gros groupes ; ne pas toucher à la difficulté.

### Ce qui change (trois réglages ; les chiffres sont des choix de Claude)
- **L'encre est rare** : **un petit golem sur huit** lâche un éclat d'encre (avant : chacun) ; **un bélier ou un colosse en lâche toujours un** (avant : 2 et 3). Ce qui reste comme avant : **une rune qui détruit trois golems ou plus fait tomber un éclat de plus par golem** (à partir du troisième) — graver sur un gros groupe se rembourse, graver sur deux golems coûte. Les cartes Moisson d'encre et Grand encrier, et le combo du Scribe fou (l'encre remonte toute seule), deviennent le choix de celui qui veut graver beaucoup.
- **Le bâton compte plus** : il tire toutes les **0,42 seconde** (avant : 0,55, soit un tiers de tirs en plus), et **son orbe traverse un golem de plus** : bien placé dans l'axe d'une file, on en touche deux à chaque tir. La carte Orbe perçant s'ajoute (3 golems, 5, puis toute la file).
- **Plus de pages** : il faut **1, 2, 3, 4, 5… gros** pour la page suivante (avant : 1, 2, 4, 5, 7, 8…).
- Les textes suivent : l'explication (étapes 1 et 2), l'aide-mémoire (« L'encre est rare »), la carte Orbe perçant.
- **Les golems ne sont pas touchés** (vies, nombre, vitesse, vagues, colère), ni les runes, ni les combos, ni les sons.

### Mesuré au robot
- **Les pages et les combos** (un robot qu'on ne peut pas battre, qui vise les combos, 12 minutes sans les codes ; médianes) :

| | Version 17 | Version 18 |
|---|---|---|
| Pages ramassées à 4, 8 et 12 minutes | 7, 14, 21 | 9, 17, 25 |
| Premier combo | 4 min 25 | 3 min 16 |
| Premier combo au niveau 3 | 5 min 15 | 4 min 13 |
| Deuxième combo au niveau 3 | 8 min 37 | 7 min 04 |

- **L'encre** : **52 éclats tombés par minute avant, 20 maintenant**. De quoi graver une rune toutes les 6 secondes au mieux, au lieu d'une toutes les 2 secondes.
- **La difficulté : c'est plus facile qu'avant.** Même robot, mêmes golems : sans les codes, il tient environ **3 min 20** au lieu de 2 min 30 ; avec des amis qui finissent à 8 minutes, il gagne **15 parties sur 72 (une sur cinq)** contre 5 sur 72 (une sur quatorze). Un bâton plus fort et plus de pages, c'est forcément plus facile ; l'encre rare ne compense qu'en partie.
- **Limites** : le robot grave environ 10 runes par minute dans les deux versions. Il n'a jamais gravé « tout le temps » comme un joueur ; en version 18, il dépense presque toute l'encre qui tombe. Il ne peut pas dire si le jeu est plus agréable.
- 68 vérifications des règles (5 nouvelles : un petit golem sur huit, les gros, le remboursement d'un groupe, l'orbe qui traverse deux golems, la cadence du bâton). Une partie entière jouée avec le vrai clavier des codes, sans erreur. La vitesse d'affichage n'a pas été remesurée.

### À valider par Romain
- **Les trois chiffres.** Si on grave encore trop : un petit golem sur dix, ou un remboursement des groupes plus petit. Si c'est trop sec : un sur cinq.
- **Plus facile qu'avant** : à laisser, ou durcir un peu les golems ? (Romain a dit de ne pas toucher à la difficulté : rien n'a été durci.)
- À 16 h 01, une première version 18 a été en ligne neuf minutes avec une encre un peu moins rare (un petit golem sur cinq, deux éclats pour un colosse) ; remplacée à 16 h 10.

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
- **Pages** : la 1re au 1er gros détruit, puis au bout de 2, 4, 5, 7, 8… gros (avant : 3, 5, 7… ; **version 18 : 2, 3, 4, 5…**). Le robot en ramasse environ 1,7 par minute (1,3 en version 10).
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
  - **le bâton** (bleu clair) : **Double orbe** (2, 3 puis 4 orbes) ; **Orbe lourd** (2, 3 puis 4 dégâts) ; **Tir rapide** (×1,25, ×1,5, ×2) ; **Orbe perçant** (traverse 2, 4 golems, puis toute la file ; version 18 : 3, 5, toute la file, parce que l'orbe de base en traverse déjà 2) ;
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
- **Les quatre runes** (encre à prix fixe, 12 au plus, 8 au départ, un éclat par soldat détruit — **version 18 : un petit golem sur huit seulement**) : **trait — la lumière (2)** : 2 de dégâts, un soldat sonné éclate et ses éclats font éclater les autres sonnés ; **V — la chasse (2)** : tout ce qui est dans le V est chassé par l'ouverture, refusé au-delà de 95° ; **escargot — la repousse (la moitié de la jauge)** : tout le monde au loin, sans dégâts ; **arc de cercle — le mur (2)** : un mur courbe exactement comme le tracé, 3 secondes, qui ralentit et renvoie les pierres.
- **Reconnaissance des tracés** : 94 % de bonnes lectures sur des tracés tremblés.
- **Les chocs** : un soldat projeté qui cogne un autre soldat, un mur, un ami ou le bord est sonné 3 secondes.
- **Les soldats** (au début) : cogneur (3 vies), coureur (1, rapide), brute (7), costaud (16, frappe pour 2), lanceur (2, de loin).
- **Le bâton du Sage** (sans carte) : une orbe de lumière (1 dégât) un peu moins de deux fois par seconde vers le golem le plus proche (**version 18 : 2,4 fois par seconde, et l'orbe traverse deux golems**).
- **Les codes** : l'ami vient aider (protection +3). Protection 20, +1 toutes les 10 secondes.

## Les codes en vrai : ce qui serait à régler (avis de Claude)
- Les tablettes ne se parlent pas : le code passe à la voix, comme les autres codes du jeu. Le Sage les connaît d'avance et vérifie ce qu'on tape.
- Le combat du Sage finit en même temps que celui des autres ; il ne peut pas tenir au-delà de 15 minutes (voulu par Romain) — la fureur du cœur après 15 minutes le garantit.
- Si le Sage perd : il recommence, et les amis qui ont déjà gagné lui redisent leur code.

## Questions encore ouvertes
- Un golem qui danse (partition du Barde) doit-il compter comme sonné (donc éclater au trait) ? Aujourd'hui : non.
- La dague du Pisteur, « 2 coups » : la question ne se pose plus ici (le Pisteur est enlevé en version 17).
- **Version 17 : le Pisteur doit-il quand même crier un code au Sage ?** Réglé le 25 novembre à 16 h 42 : **plus aucun code** pendant le combat.
- **Version 18 : c'est plus facile qu'avant** (voir « La version 18 ») : la question ne se pose plus, toute la courbe a été refaite en version 19.
- **Version 19 : que se passe-t-il quand le Sage perd ?** Aujourd'hui il recommence ses 10 minutes. Et comment le résultat de la première étape passe-t-il au combat d'après ? Pas décidé (voir « La version 19 »).
- **Version 19** : les choix de Claude à valider (les paires de cartes des builds, la courbe) ; le trait à moitié de vie est annulé en version 20.
- **Version 20** : les choix de Claude à valider (voir « La version 20 »), surtout **le rouge qui blesse les amis** et **le Sage qui lâche son encre**. Et la suite gardée en réserve : les amis que Grosbec envoie valser, une salle plus grande.
- Version 16 : les choix de Claude à valider (voir « La version 16 »), surtout la vue (sol vu de haut, personnages debout) et les golems du fond qui passent par les portes.
- Dans le vrai jeu : les codes de cette maquette sont des codes d'essai (Alchimiste ⭐ 🔥 💧, Barde 🔑 💧 🍃 — celui du Barde est bien celui que son combat donne à la fin, Bible §16.9 ; celui de l'Alchimiste est à accorder avec son combat ; jusqu'à la version 16 il y avait aussi Pisteur 🔥 🌙 ⭐).

## Les versions précédentes
- **Version 1** (tour par tour, 7 runes) : une poussée suffisait. **Version 2** (Into the Breach) : un jeu d'énigmes. **Version 3** (temps réel, coûts fixes 2-3-3) : déséquilibrée. **Version 4** (encre à la longueur du tracé) : frustrante. **Version 5** : escargot trop facile, mur mal fait. **Version 6** : mur remplacé par l'arc de cercle. **Version 7** (règles des runes d'aujourd'hui) : « le jeu est pas mal ». **Version 8** (dessins, plein écran) : « un peu trop facile ». **Version 9** (ça durcit, pouvoirs des amis, 3 codes = gagné) : « beaucoup plus dur ». **Version 10** (les pages, 16 cartes) : « j'aime beaucoup ». **Version 11** (20 cartes, 8 combos, clavier) : combos « pas assez jouissifs », et pas de sons. **Version 12** (10 combos, colère du cœur, sons) : musique « petite maison dans la prairie », pas une musique de combat. **Version 13** (musique de combat) : il demande des curseurs de volume. **Version 14** (curseurs de volume) : il demande de renforcer les combos faibles. **Version 15** (tornade, comète, boulets renforcés) : « le jeu, pour moi, il est fini ». **Version 16** (la salle, Grosbec et ses golems du combat du Barde, vus de haut) : Romain n'a rien dit des dessins ; il demande d'enlever le Pisteur. **Version 17** (deux amis à protéger, le Barde et l'Alchimiste ; deux codes) : Romain demande plus de livres, un bâton qui compte plus, moins d'encre (« on fait que graver tout le temps »). **Version 18** (encre rare, bâton plus fort, plus de pages) : Romain propose deux règles (le trait ne tue plus les sonnés, pas d'encre pour une rune), dix builds du bâton et un par rune, 10 minutes sans codes. **Version 19** (cet essai) : « extrêmement facile », « on fait rien » ; Romain veut revenir aux runes d'avant, garder le chronomètre, et demande des idées (bestiaire, zones à esquiver, amis qui ne bougent pas) ; défaut du chronomètre trouvé. **Version 20** (le temps corrigé, les runes comme avant, le rouge de Grosbec, quatre golems à part) : pas encore vue par Romain.
