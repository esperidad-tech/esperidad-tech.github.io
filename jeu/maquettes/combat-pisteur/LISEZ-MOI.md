# Le combat du Pisteur — version 13 (26 novembre 2026) : TERMINÉ (« c'est validé ») — une vraie musique d'action dès qu'on est repéré

Enquête 10, combat final : pendant que ses amis occupent Grosbec dans la grande salle, **le Pisteur est passé par-derrière** et
s'occupe de sa garde (les golems), dans l'arrière-salle. Rien n'est branché dans le jeu, rien n'est en ligne sur le site : c'est une
page à part, comme les combats du Barde, du Sage et de l'Alchimiste.
La page publiée (version 11 depuis le 26 novembre, 14 h 40) : https://claude.ai/artifact/DRTHz5bppgsstd5ameTnba (un nouveau canevas ; l'ancien, https://claude.ai/artifact/GmvcxCF5gC89M9tmnCVyGU, garde la version 8).

## Version 13 : une vraie musique d'action (26 novembre, 15 h 27)
Bible §17.58. Dans `src/son.js` : `musique` (la fonction `tic`) lance le combat dès que `nVoient>0` hors de l'ombre (ou le colosse enragé) ; `musPlanifier`, partie « le combat » : la grille `GR` (quatre accords), `GALOP` (la basse), `RIFF` (l'accroche des cordes). Les sources sont sur GitHub (branche `brumeval-sources`).

## Version 12 : quand la musique de combat se lance (26 novembre, 15 h 11)
Bible §17.57. Dans `src/son.js`, `musique` (la fonction `tic`) : `M.tChaud` = le dernier instant où un golem en colère voyait le Pisteur hors de l'ombre (ou où le colosse était enragé) ; le combat tient cinq secondes. La musique de combat elle-même : `musPlanifier`, la partie « le combat ». `python3 tests/sons.py regler musique` ne règle que la musique.

## Version 11 : les dernières retouches du son ; le combat est terminé (26 novembre, 14 h 40)
Romain, 14 h 04 : Bible §17.52 (« c'est validé. On peut dire qu'on a terminé »). Tout est dans `src/son.js` :
- **la musique** : `musDebut` (le bourdon, et deux « couches » : `M.mys` le mystère, `M.act` le combat), `musBascule` (le fondu de l'une à l'autre, appelé quand le Pisteur entre ou sort de l'ombre), `musPlanifier` (ce qui sonne : les deux suivent la même mesure ; on ne fabrique que celle qu'on entend) ; leurs niveaux : `NIV.musique`, `NIV.musAction` ;
- **la dague du donjon** : `O` (les morceaux recopiés de `jeu/donjon/essai/sons/bruitages.js`), `plaque`, `S.swish1` à `S.swish3` (quand on appuie), `S.dague1` à `S.dague3` (quand la lame touche, `blesserG` dans `golems.js`) ;
- `S.acheve` (le golem qui éclate), `S.colosseArrive`, `S.gColosse1` à `S.gColosse5`, `S.pasColosse`, `S.porteOuvre`, `S.porteFerme`, `S.porteClaque` ; dans `majSon` : le portail (suivi de `porte[]`), le colosse (ses pas suivent sa marche), l'assourdissement dans l'ombre (`LP_OMBRE`) ;
- **le réglage des niveaux** : `python3 tests/sons.py regler` (trois passes, environ dix minutes), puis `python3 construire.py` et `python3 tests/sons.py` (« SOUCIS 0 »).

## Version 10 : le son et la musique (26 novembre, 11 h 40)
Commande de Romain (10 h 55) : Bible §17.47. **Personne n'a écouté** (Claude mesure, il n'entend pas).
- **`src/son.js`** (réécrit) : tous les sons et la musique, fabriqués par le moteur de l'Atelier des sons du jeu (`jeu/donjon/essai/sons/moteur.js`, que `construire.py` embarque avant le jeu). Un son = une ligne (`S.nom = …`). `son(nom)` : au milieu ; `son(nom, golem)` ou `son(nom, x, y)` : à cet endroit (le volume suit la distance au Pisteur). `SORTE` : les cinq sortes de sons (patrouille, coup, zone, signal, moi) avec leur rayon et leur résonance. `majSon` : les bruits qui viennent tout seuls (patrouille, flair, aboiements, pas du colosse, la boule). `musDebut`, `musPlanifier`, `musique(true / false)` : la musique.
- **`NIV` (dans `son.js`) ne se touche pas à la main** : `python3 tests/sons.py regler` mesure chaque son et écrit son niveau ; puis `python3 construire.py` et `python3 tests/sons.py` pour vérifier (il doit finir par « SOUCIS 0 »). Les niveaux voulus : `CIBLE` et `A_PART` en tête de `tests/sons.py`. `python3 tests/sons.py wav` écrit les sons dans `tests/sons-wav/` pour les écouter.
- **`tests/sons-jeu.py [vague] [secondes] [cache]`** : le vrai jeu en temps réel, la liste de ce qui a sonné, les sons ratés.
- **Les accroches dans le jeu** : `majGolems` pose `sonSrc` (le golem dont c'est le tour) ; `majPerception` joue « repéré » ; `debutFouille` « il cherche » ; `facher` → `sonColere` ; `crier` ; chaque début de zone rouge a son `son('z…')` ; `lancerGroupe` (les renforts) ; `demarrer`, `victoire`, `defaite` (la musique) ; `boucle` appelle `majSon`.

**Où on en est.** Romain a joué la version 8 dans la nuit du 25 au 26 novembre : **« je me suis beaucoup amusé à ce petit jeu. Je
pense qu'on va pouvoir le valider. »** Les règles ne bougent donc plus, sauf une demande : **les renforts** (dès qu'une bande est
tombée, la suivante arrive). Puis : **« il va falloir s'attaquer au chantier musique, son, et refaire les graphismes »** ; les
golems lui vont, **c'est la salle qui fait maquette**. Après un essai raté avec une IA d'images, il a écrit à 1 h 26 : **« essaie de
me faire un truc vraiment très joli, avec un gros travail, prends ton temps. Fais-moi rêver. »** **La version 9 est construite ici.
Pas encore vue par Romain.** Tout le détail : Bible §17.42 à §17.46 (dans `bible-section-17.md`).

**La version 9 en cinq points** :
1. **La salle est rendue en volume** (`decor3d/`, à lire : `decor3d/LISEZ-MOI.md`). Blender, piloté par des scripts, construit
   l'arrière-salle, l'éclaire, et la « photographie » exactement sous l'angle du jeu : une seule perspective pour tout, de vraies
   ombres, des dégradés partout, puis un trait sombre autour de chaque pièce (la charte du jeu). Le jeu recopie ces images
   (`src/decor.js`, fabriqué par `decor3d/paquet.py` ; `src/salle.js`). **Les obstacles sont à la même place** (`OBS0`).
2. **Grosbec n'est plus là** (ni lui, ni ses cris, ni sa statue, ni son estrade) : deux grandes portes de bois, et entre elles
   une réserve (étagère, coffre, sacs). La statue renversée est devenue trois tonneaux couchés. Son modèle n'est plus embarqué
   dans la page.
3. **Les renforts** (`src/vagues.js`) : dès qu'UNE bande est entièrement tombée, la suivante de la réserve arrive (les groupes
   « apres » de `VAGUES`), dans toutes les vagues. Avant chaque bande : **le cor** (`son('renfort')`), **l'œil rouge de sa porte
   s'allume**, et elle sort **deux secondes après** (`DELAI_RENFORT`) par la porte qui s'ouvre. Vague 8 : le colosse arrive dès que
   la meute ou les béliers sont tombés.
4. **Les portes vivent** (`alerte`, `porte`, `Salle.dessinerPorte`) : deux images par porte, fondues par-dessus le fond.
5. **Les flammes sont redessinées** (`flamme` dans `src/dessin.js`), et de la poussière flotte dans les rayons de lune.

**Pour refaire la page** : `python3 construire.py` (il lit `src/decor.js`, 1,4 Mo : ne pas l'ouvrir dans un éditeur). **La page pèse maintenant 2,1 Mo** (0,7 Mo en version 8) : c'est le poids des images de la salle. Pour refaire
le décor : `decor3d/LISEZ-MOI.md`.

**Les essais** (version 10 : plus `tests/sons.py` et `tests/sons-jeu.py`) : `tests/scenes.py` a une scène de plus, `renforts` (30 scènes ; `mortier` et `belierFou` dépendent du hasard,
en version 8 aussi : les relancer seules si elles échouent). `/home/claude/outils/vues9.py` n'est pas rangé ici : pour des captures, `tests/vues.py` et `tests/galerie.py`.

## La version 8 (25 novembre 2026, 23 h 20) : la reprise à une vague, le réparateur, les cartes dorées, plus rien à lire

*(Tout ce qui suit décrit la version 8. Il reste vrai pour la version 9, sauf le décor, Grosbec, et l'arrivée des bandes : voir au-dessus.)*

Enquête 10, combat final : pendant que ses amis occupent Grosbec, le Pisteur s'occupe de sa garde (les golems). Rien n'est branché dans le
jeu, rien n'est en ligne sur le site : c'est une page à part, comme les combats du Barde, du Sage et de l'Alchimiste.
La page publiée : https://claude.ai/artifact/GmvcxCF5gC89M9tmnCVyGU (le canevas « Le combat du Pisteur »).

**Où on en est.** Version 6 : « vachement mieux ». Version 7 (les colères) : **« là ça devient intéressant grâce aux enrages »,
« le jeu est bien calibré »**, mais « au stage 7, c'est trop frustrant de tout recommencer ». Romain a décidé dix points à la voix
(`decisions-orales-22h.md`), puis écrit à 22 h 18 : **« Vas-y, tu as mon go pour faire cette liste et tu peux mettre en ligne. »**
À 22 h 42, pendant la construction : **« Enlève-moi tous les tutos, tous les textes qui expliquent »**, juste « une sorte d'extrait »
avant de jouer, sans texte. **La version 8 est construite ici. Pas encore jouée par Romain.**
Ce qui a changé, les choix de Claude à valider et les mesures : Bible §17.36 à §17.41 (dans `bible-section-17.md`).

**La version 8 en huit points** (tous les chiffres sont dans `REG`, en tête de `src/pisteur.js`) :
1. **Plus rien à lire.** Plus de page d'explication, plus de conteur, plus de bouton 🔊, plus de mots de refus. Avant de jouer :
   **un extrait** (`EXTRAITS` dans `src/ecrans.js`) : le vrai jeu se joue tout seul, trois scènes en boucle, sans un mot ni un son,
   un doigt blanc sur les boutons ; le bouton jaune est là dès le début. Un bouton refusé **tremble**, et celui qui débloque la
   situation (le bouton d'ombre, presque toujours) **clignote**. Restent : le nom sous chaque bouton, « Vague 3 / 8 », les petits
   mots de bande dessinée (« Paré ! », « Raté ! », « BANG ! »), les cris de Grosbec, les menus.
2. **À terre, on choisit sa vague** (`sauves`, `choisirVague`) : une tuile jaune par vague commencée, avec la vie, les bandages et
   les cartes qu'on avait en la commençant ; le rond jaune sur celle où on est tombé. Aussi dans la pause.
3. **Les rôdeurs** : sur la piste ils vont à 3,6 (la course du Pisteur à découvert) ; frappés ou face à lui, ils se battent ; des
   meutes de trois au plus.
4. **La ruée** (`ruer`) : un golem blessé sans être tué, tout son groupe se rue sur le Pisteur pendant 2,5 s. Pas les autres groupes.
5. **Le mortier déchaîné** (`dechainer`, `mortierDechaine`) : dès qu'il VOIT le Pisteur, il ne s'arrête plus jamais ; il vise s'il le
   voit, sinon il bombarde à l'aveugle. Ses obus ne blessent, chez les golems, que celui qui est assommé ou endormi.
6. **L'ombre revient après trois secondes D'AFFILÉE sans être vu** (le compte repart de zéro au moindre regard).
7. **Le réparateur** (`GT.repare`, `reparer`, modèle `src/modeles/golems-pisteur.js`) : 30 points de vie, aucun dégât ; il rend 30
   points toutes les 3 secondes à un blessé de son groupe ; penché, il ne voit rien.
8. **Trois cartes dorées** (`jouerCarte`, `cibleCarte`), en haut à droite, une seule fois chacune, dans l'ombre, **un simple appui** :
   la flèche qui endort (pas le colosse), le sifflet (le groupe part voir ailleurs 16 s), la cape d'ombre (10 s). Une petite marque
   dorée au-dessus d'un golem montre ce que la flèche et le sifflet toucheraient.
Et **huit vagues refaites, 47 golems** (`VAGUES`) : la 1 est douce (un rôdeur, puis deux : c'est là qu'on apprend), les nœuds
commencent à la 3.

Ce qui reste de la version 7 : les quatre boutons, les colères (la meute qui flaire, le garde collé, le bélier fou, la boule, le
fantôme, le colosse), cinq bandages de 20 points, la vie qui ne remonte pas, le regard long à découvert, les groupes soudés.
Les idées écartées (à ne pas reproposer) : `decisions-orales-22h.md`, `decisions-orales-coleres.md`, `decisions-orales-apres-midi.md`.
Le son des golems, le décor : plus tard (demande de Romain).

## Fabriquer la page
`python3 construire.py` → `combat-pisteur.html` (un seul fichier, environ 680 Ko). Il lit le moteur des héros en volume dans
`jeu/heros-vues/src` (hv-base, hv-tete, hv-cheveux, hv-corps, hv-pantin, hv-poses, hv-positions, hv-donjon).

## Ce qui est où (`src/`)
- `page.html` : la page, **les quatre boutons et leurs huit dessins**, les trois cartes dorées, les écrans (la barre de préparation et
  l'extrait, la pause, la fin, le dessin « tourne le téléphone »). Plus aucun texte d'aide.
- `base.js` : les mesures (1 pas = 46 points ; profondeur tassée à 66 % ; hauteurs entières : les personnages sont debout).
- `son.js` : les sons fabriqués par la page (aucun fichier de son ; jamais écoutés par Claude).
- `monde.js` : la salle (26 × 18 pas), ses obstacles, les chemins (une grille de demi-pas), `vue()` (qui voit qui), `rayon()`.
- **`pisteur.js`** : **`REG`, tous les chiffres du combat au même endroit** ((R) = fixé par Romain, (C) = point de départ de Claude) ;
  l'état ; le Pisteur : les quatre boutons (dague en trois rangs / embuscade ; rien / coup qui assomme ; saut / saut
  d'ombre ; ombre / bandage), la piste qu'il laisse (`piste`), la chaîne du colosse (`P.etat==='chaine'`), un seul geste à la fois avec un appui gardé en mémoire (`appui`, `P.tampon`), le saut qui passe devant tout,
  l'ombre (`entrerOmbre`, `sortirOmbre`), le bandage (`debutBandage`, `bandagePerdu`, `finBandage`), la barre de vie et le saignement
  (`blesserP`), les trois cartes (`jouerCarte`, `cibleCarte`, `P.cibles`).
- **`golems.js`** : ce que chaque golem voit et sait (`voitBrut`, `margeEcran`, `majPerception` : à découvert il voit à 10 pas devant
  lui s'il est à l'écran du joueur, dans l'ombre seulement l'éventail court dessiné au sol ; `g.su` = le dernier endroit où lui **ou son
  groupe** a vu ou entendu quelque chose ; `g.grp` = son groupe), le bruit (`crier`, `avertir`, `tuer` : tué d'un coup, seuls ceux qui
  le regardaient s'activent), la ronde (un vrai trajet, des pauses, le regard à gauche et à droite ; le premier marche au pas du plus
  lent), la poursuite en groupe (`chasseSansVue` : au pas du plus lent, le javelot derrière son garde) et la fouille, le regard qui
  tourne en douceur (`g.reg` rattrape `g.regC`), `porteeRegard` (où un regard s'arrête), **les colères** (`facher` : qui se fâche et
  quand ; `colereDe` ; `flairer`, `suivreMeute`, `coller` et `gardeDe`, `mortierAveugle`, `errer`, `rouler` et `rebond`, `fantome`,
  `debutZoneColosse` et la chaîne dans `iaColosse`), le rouge (`dansZone` : cercle, cône, demi-disque, anneau, croix, bande ; `fuirRouge`,
  `frapperZone` : il blesse tout le monde), et les huit golems (`iaChien`, `iaJavelot`, `iaDalle`, `iaFaucheur`, `iaMortier`, `iaBelier`,
  `iaCuirasse`, `iaColosse`, `iaRepare`) : chacun sa façon de bouger, son coup de base, son coup spécial. **Version 8** : `ruer`,
  `dechainer` / `mortierDechaine` / `cibleObusOk`, `endormir`, `siffler` / `leurrer`, `reparer`.
- **`vagues.js`** : les javelots (ils volent vraiment), les obus ; les 8 vagues (47 golems, `VAGUES`, `ROUTES` : une ligne « m » = un
  groupe soudé, le premier de la liste marche devant) ; les particules.
- `sprites.js` : `PS` = le Pisteur en volume cuit sous 8 angles (24 poses, et les mêmes en silhouette violette pour l'ombre) ; `GS` = les
  golems cuits à la demande (`GS.ombre` : la copie teintée).
- `salle.js` : la salle peinte une fois ; **`Salle.fondO` : la même, sombre et bleu-violet, pour le monde de l'ombre** ; les obstacles.
- `dessin.js` : chaque image (les deux mondes, le long regard en lueur à découvert (`dessinerRegard`), les éventails courts de l'ombre,
  les zones rouges, les têtes de mort, la barre de vie et les cinq bandages, l'anneau vert du bandage, l'interface ; pour les colères :
  les traces de pas, la boule, le fantôme, la chaîne, l'étoile rouge au-dessus d'un golem en colère, le bouclier du javelot couvert).
- `ecrans.js` : les doigts, les touches, les boutons (`majBoutons`, `majRecharges`, `refuser`), les cartes (`majCartesUI`), les écrans
  (`choisirVague`), **l'extrait** (`EXTRAITS`, `lancerExtrait`, `pasExtrait`, `finExtrait` ; `poserScene` sert aussi aux essais), la
  boucle, `window.__pt` pour les essais.
- `modeles/` : copies NON modifiées des modèles du combat du Barde (outils, golems, grosbec) et du cuirassé de l'Alchimiste ;
  `golems-pisteur.js` : le réparateur (nouveau, dessiné avec les mêmes outils).
- Quel modèle pour quel golem : trotteur = rôdeur (« le chien ») ; danseur = javelot ; lanceur = mortier ; fonceur = bélier ; bouclier =
  porte-dalle ; soldat = faucheur ; cuirasse = cuirassé ; gros = colosse.

## Les essais (`tests/`, Python + Playwright ; ils ouvrent `combat-pisteur.html`, captures dans `/tmp/p5`)
- `scenes.py` (+ `scenes.js`) : **les règles rejouées à pas fixes**, 29 sur 29 : celles de la version 7 (la dague, l'embuscade, chaque
  rouge évité à pied, les colères…), et pour la version 8 : `flair` (3,6 sur la piste), `mortier`, `ombre3s`, `chienFrappe` (la ruée),
  `reparateur`, `carteFleche`, `carteSifflet`, `carteCape`, `reprise`, `vagues`.
- `robot.js` : un joueur automatique, à pas fixes. **Il ne joue pas les cartes et ne connaît pas les nouvelles combinaisons** : ses
  mesures disent si une vague se finit sans carte, pas si elle est bien réglée. `lot.py bon|moyen|mal N [vague=N] [une]`,
  `parvague.sh` (chaque vague jouée seule).
- `gestes.py` : les vrais gestes au doigt, 36 sur 36 : l'extrait et le bouton jaune, **rien à lire** (jamais plus de trois mots
  d'affilée à l'écran), les refus qui tremblent, les cartes en simple appui, le bandage, la pause, le choix de la vague, la victoire.
  `extrait.py` : l'extrait regardé en vrai temps (ses trois scènes font ce qu'elles montrent). `fumee.py` : la page démarre sans erreur.
  `essai.py fichier.js` : un essai à la main dans la page.
- `galerie.py` : une capture de chaque coup et de chaque état. `vues.py` : l'explication, les regards, l'ombre, le bandage.
  `partie-vue.py [inv]` : une partie entière dessinée pour de vrai, avec captures.
- `vitesse.py` : images par seconde, processeur ralenti 4 ou 6 fois, sans carte graphique.
- Adresses d'essai : `?extrait=non` (pas d'extrait), `?finesse=0…3` (bloque la finesse), `?sexe=m&cheveux=brun&yeux=marron&peau=p3` (un autre Pisteur).
- `window.__pt.scene([x,y,angle],[{t:'chien',x,y,fa,immobile:1,grp:2},…])` pose une scène d'essai ; `__pt.figer(true)` puis
  `__pt.pas(n,1/60)` avancent le jeu à la main.

## Les anciennes versions
`anciennes-maquettes/` : les trois maquettes de la nuit du 24 au 25 novembre, et `version-4/` (la page refusée, ses règles, ses essais).
**Les versions 5, 6 et 7 n'ont jamais été rangées sur GitHub** (la conversation qui les a construites ne pouvait pas y écrire) : leurs
sources n'existent que dans les anciennes versions du canevas. La version 8 part de la 7, retrouvée à l'identique dans le canevas.
L'arc et la dague circulaire sont dans `plus-tard/`. `outils/` : `rustine.py` et `sansdire.py` (les petits outils de cette version).
