## 16. L'enquête 10, le combat final — le combat du Barde contre Grosbec, et les modèles de la ville d'en bas (maquette, 24 novembre, version 11) — HORS DU JEU, RIEN EN LIGNE SUR LE SITE, PAS ENCORE SUR GITHUB

**Où on en est** : c'est une **maquette de test**, pas le vrai jeu. Rien n'est construit dans Brumeval. Elle se joue ici : https://claude.ai/artifact/5vCVNgJnhYV3aRgUY2ttT1 (version 11, en ligne depuis le 24 novembre, 23 h 59). Tout le détail, version par version, est dans le document du projet `claude/maquette-combat-du-barde.md`.

**⚠️ Pas encore sur GitHub ni sur le site.** La conversation qui a fait les versions 8 à 11 n'a pas eu le droit d'écrire dans le dépôt (refusé deux fois). Romain a demandé (19 h 12) que ce soit **mis en ligne pour l'enquête 10, pour ne pas le perdre** : c'est à faire par la prochaine conversation qui a GitHub (voir PASSATION.md, paragraphe du 24 novembre au soir). En attendant, **toutes les sources sont rangées avec la maquette** (fichiers `sources/…` du canevas : `list_files` puis `read_file` ; les fichiers Python y portent un `.txt` en plus à la fin du nom, à enlever ; `sources/LISEZ-MOI.md` dit quoi est quoi).

### 16.1 Ce que Romain a dit
**24 nov., 19 h 12 (version 8, « le jeu est bien, maintenant l'esthétique »)** : la ville sous terre en fond, des structures « un peu atlantes », très détaillé, de jolis effets de lumière ; le maire dans une **armure magnifique**, très grand, qui émet de la lumière, **épaulières en forme de lanterne**, **casque à bec qui fait peur**, animé en volume, un gros travail d'animation (**ce modèle sera repris**) ; des **golems** : yeux rouges, énergie rouge dans la poitrine, veines rouges, grands pieds, **un pas par battement de musique** ; Grosbec = le mélange de Raban et d'Elyra (du rouge et de la lumière) ; un sol en perspective ; aux refrains, des **spots intégrés dans l'image** ; **jamais sous 25 images par seconde**, même sur une vieille tablette.

**24 nov., 21 h 01 (version 9, après avoir vu la version 8)** :
- **L'armure de Grosbec : « vraiment magnifique ».** → On n'y touche plus.
- **Le décor : « pas terrible ».** Plus d'effets de lumière ; **le fond un peu flou** ; « il me faut de la 3D, de la perspective, des effets d'éclairage, qu'on ait l'impression que c'est un peu en 3D » ; **la salle et le sol dans le style des textures de Grosbec et du Barde**.
- **Les golems : « elles sont pas bien… des petites bestioles toutes mignonnes, on n'a même pas envie de leur faire mal ».** Il veut des golems **effrayants, agressifs**, **un peu mécaniques**, **moitié roche, moitié métal**, « un peu comme son armure », de **grosses** créatures, avec **des jambes terrifiantes**, qui avancent **un pas après l'autre, en rythme**.
- **Leur arrivée** : plus d'éclairs magiques. Ils viennent **par des portes** ; ils peuvent aussi venir de l'extérieur ou **d'en haut : sauter et tomber**.
- **Grosbec** dit **« Allez, allez ! »**, il pousse **des gémissements, des cris sombres** (comme dans le combat de l'Alchimiste), et son armure fait **des bruits métalliques** quand il bouge. **En fond**, pour ne pas gêner la musique.
- **Le Barde : de dos, en volume** (les héros du jeu), **un peu plus grand**, avec sa guitare ; **un clavier dans le dos** aux actes I et II (il ne s'en sert pas) ; **à partir de l'acte III, il prend le synthé** et met sa guitare dans le dos.
- **Le métronome : à enlever.**
- **21 h 21** : « son petit chapeau avec une plume, je trouvais ça joli. Tu le mettras aussi pour sa tenue de combat. »

**24 nov., 22 h 25 (version 10)** : « arrivé à l'acte 3, mon iPhone il rame et ça bloque tout, ça saccade […] à chaque fois […] il va falloir que tu trouves le problème » ; et : dès le début, **Grosbec et le Barde bougent leur corps en rythme** (le Barde tape du pied et bouge la tête ; Grosbec aussi) ; **au refrain, on accentue et on ajoute d'autres mouvements** ; « le Barde pourrait même faire une petite danse, mais toujours en rythme ».

**24 nov., 23 h 23 (version 11)** : « l'acte 4, c'est pareil, ça rame aussi, comme l'acte 3 avant. Fais la même vérification […] sur tous les actes » ; et, **au dernier acte, à chaque refrain, et au petit moment de la fin : une danse complètement folle**, « une danse de techno où il balance sa tête de droite à gauche […] il baisse la tête et il lève la main, il joue de la main au rythme […] et pareil pour le maire […] c'est pas juste un petit déhanché, ils sont à fond ».

### 16.2 Le décor : la grande salle (version 9)
Une salle **vue en perspective** : tout fuit vers le même point, loin au-dessus de l'écran. Peinte **une seule fois**, puis recopiée.
- **Le mur du fond** : de grandes pierres bleu nuit, des bandeaux et des frises de bronze à liseré d'or.
- **La grande arche**, derrière Grosbec, ouverte sur **la ville d'en bas, au loin, FLOUE** (elle est peinte toute petite puis agrandie : c'est ça qui la rend floue, comme sur une photo). Trois rangs de tours dans la brume, leurs fenêtres allumées, des cascades de lumière, le grand cristal du plafond. Sa lueur baigne le mur. Cinq cristaux sur l'arc.
- **Deux fenêtres hautes**, au-dessus des portes, ouvertes sur la même ville floue.
- **Deux portes de bronze**, à gauche et à droite de Grosbec, une lanterne au-dessus de chacune. Une lueur rouge filtre entre leurs vantaux : c'est par là que sortent les golems.
- **Les murs de côté**, qui viennent vers nous, avec leur galerie sombre (les golems en sautent) et une colonne ronde cerclée de bronze à chaque coin.
- **Le sol** : de grandes dalles **polies**, en perspective, avec des losanges de bronze incrustés, des fêlures, du grain. **Il reflète la lumière** : une grande nappe claire sous l'arche, le reflet de la ville tout droit jusqu'au Barde, la lueur dorée des lanternes devant chaque porte.
- **L'allée de bronze**, de l'estrade de Grosbec à la rosace du Barde, bordée de deux **rigoles d'or** qui battent avec la musique. La rosace du Barde est éclairée comme par un projecteur.
- **Des rayons de lumière** tombent de l'arche ; l'ombre gagne sur les bords et vers nous.

Couleurs : pierre bleu nuit, bronze et or (comme l'armure), lumière turquoise (Elyra) et dorée (les lanternes), rouge (Raban) seulement derrière les portes, sur Grosbec et sur ses golems.

### 16.3 Grosbec en armure — le modèle à reprendre (validé par Romain : « vraiment magnifique »)
**À quoi il ressemble.** Très grand : il occupe tout le haut de l'écran. Une armure de bronze sombre et d'or, **chargée d'énergie** :
- **quatre Lanternes d'Or** allumées : une dans la poitrine, **une sur chaque épaule** (les épaulières sont de vraies lanternes, avec un toit, des montants et un verre), une à la ceinture ;
- un **casque** : un masque sombre, deux **fentes de braise** pour les yeux, un sourcil d'or en V, un **grand bec crochu**, et une **crête de lames de bronze** en travers ;
- l'**écharpe rouge du maire** à la ceinture, et une **grande cape rouge** ;
- des gravures, des rivets, des plaques qui se chevauchent sur le ventre, les cuisses, les bras et les jambes.

**Comment il est fait (c'est ça qui se reprend).** Il est **décrit en volume**, comme les héros : chaque pièce de l'armure est une forme ronde sur laquelle on enroule une image peinte une fois. Quand il tourne, **l'image glisse autour de la pièce** : la lanterne de la poitrine part sur le côté, le bec passe de face à profil, un bras passe devant l'autre. Il a un squelette (bassin, buste, tête, deux bras, deux jambes) ; ce qui est près de nous est un peu plus gros. Ce n'est **pas** une image retournée ou écrasée (règle de Romain du 18 novembre).

**Ses gestes** :
- **Il envoie ses golems** (version 9) : il se tourne d'un côté, arme le bras, puis **tend le bras vers nous** : « Allez, allez ! ». Plus d'éclair. Le geste commence **un temps avant**, et les portes s'entrouvrent à ce moment-là.
- **La décharge de lumière** : il ramène les deux mains devant la poitrine, une boule de lumière grossit, il la pousse vers le Barde.
- **Touché** (la Vague lui renvoie sa décharge) : il part en arrière, la tête de côté, les bras écartés ; le casque se fend un peu plus à chaque fois (cinq fissures au plus).
- **« SILENCE ! »** : les deux bras levés, il tape du pied, la lanterne de la poitrine flambe.
- **Pendant la relance** : bras croisés, il tape du pied en rythme.
- **Le tube** : il se bouche les oreilles, puis il a mal à la tête. Le casque reste sur sa tête.
- **Sursaut** à chaque son de la fête.
- **Il bat la mesure** (version 10), pendant tout le combat : la tête hoche, les genoux plient, les épaules balancent d'un côté puis de l'autre, un pied se lève et retombe pile sur le temps. **Au méga refrain, bien plus fort** : il tourne la tête d'un côté à l'autre et pompe des deux poings. Pour que ça se lise, il est redessiné 8 à 15 fois par seconde au repos (avant : 4 à 10).
- **Au dernier acte, à chaque méga refrain, il danse à fond, malgré lui** (version 11) : la tête baissée qui part d'un côté puis de l'autre, **un poing levé bien haut qui pompe à chaque temps** (il change de bras tous les quatre temps), l'autre poing qui cogne en bas, les genoux qui plient fort, les épaules qui roulent, la cape qui claque. Pendant le tube de la fin, il garde les mains sur les oreilles puis sur la tête (choix de Claude : la musique l'a battu).

**Sa voix et son armure (version 9)**, fabriquées par la page, **en fond** :
- **sa voix**, sombre et rauque, étouffée par le casque : deux coups brefs (« al-lez ! ») quand il envoie ses golems ; un grognement quand il prépare sa décharge ; une plainte quand il est touché ; un long cri qui descend pour « SILENCE ! » ;
- **son armure** : un grincement puis un « clang » sourd à chaque geste ; un gros coup de métal quand il est touché ;
- les mots affichés, une fois sur deux : « Allez, allez ! », « Écrasez-le ! », « Allez ! Plus vite ! », « Faites-le taire ! », « Allez, allez, allez ! ».

**Pour le reprendre ailleurs** (`src/grosbec.js`, objet `Gros`) : `Gros.construire(finesse, taille)`, `Gros.jouer(geste, quand, côté, durée d'un temps)`, `Gros.rafraichir(maintenant, état, images par seconde)`, `Gros.dessiner(toile, x, y)`, `Gros.point('mainG' | 'mainD' | 'tete' | 'lanG' | 'lanD' | 'coeur')`. Il a besoin de `src/outils.js`. Sa voix : `Son.I.grosVoix`, `Son.I.grosMetal` (`src/son.js`).

### 16.4 Le bestiaire : les sept golems de Grosbec (refaits en version 9)
**Ce qu'ils ont tous** : de la **roche sombre** taillée à facettes ; du **fer** et du **bronze à liseré d'or**, avec des rivets (comme l'armure de Grosbec) ; des **pattes de machine** (une cuisse de bronze et son piston, un gros boulon au genou avec une pointe, un tibia de fer avec un ergot, **un pied à trois griffes**) ; des **pointes**, des **dents de fer** ; des **yeux en fente de braise**, penchés vers le nez ; des **fissures rouges** dans la roche ; un **fourneau rouge derrière une grille** dans la poitrine (le feu de Raban).

| Le golem | À quoi il ressemble | Ce qu'il fait |
|---|---|---|
| **Le rôdeur** | une gueule de piège à loups, une échine de pointes, deux crocs, sur deux pattes | rapide, fragile (1 coup) |
| **Le lancier** | un soldat de roche et de bronze, un heaume à crête, des épaulières à pointe, une grande faux de fer | avance un temps sur deux (2 coups) |
| **Le porte-dalle** | trapu, un heaume à fente et deux cornes, derrière une grande dalle bardée de bronze et de pointes, gravée d'un signe d'or | les notes rebondissent sur sa dalle ; repoussé, il la lâche (dessous : le fourneau, les griffes) |
| **Le tourbillon** | un œil unique à pupille en fente, dans une cage de bronze, sur deux échasses, quatre grandes lames | tourne un temps sur deux : la note passe à côté |
| **Le colosse** | une chaudière de roche cerclée de bronze, deux cheminées qui fument, un masque de fer à grandes cornes, des poings à pointes | lent, ne recule presque pas, cogne très fort (5 coups) |
| **Le frondeur** | un canon de bronze sur des pattes de crabe, un masque à dents | reste au fond et crache des éclats de braise ; la Vague les renvoie |
| **Le bélier** | une bête de roche à tête de fer, deux cornes enroulées, une échine de lames | gratte le sol, puis fonce ; Stop le fige |

**Ils marchent avec la musique, un pas après l'autre.** Quatre images par pas : le pied **tape le sol pile sur le temps** (le corps s'écrase, un nuage de poussière), il est debout, l'autre patte se lève, elle est en l'air prête à taper. Un temps = un pas ; le genou plie vraiment.
**Sous trois angles** (tourné à gauche, de face, tourné à droite) : il se tourne vers le Barde. Plus il est près, plus il est grand. Depuis la version 10, **le golem tourné à gauche est le reflet exact du golem tourné à droite** (ils sont symétriques, et c'est l'autre pied qui tape) : un tiers d'images en moins. Ce n'est pas une image écrasée ; pour un personnage qui n'est pas symétrique (un héros, Grosbec), ça reste interdit.
**Comment ils arrivent (version 9)** : par **les deux portes de bronze** du fond (les vantaux s'écartent, le rouge des forges, une nappe de lumière rouge sur le sol, le golem sort de la lueur), ou **d'en haut** : ils **sautent des galeries** de côté et retombent sur les dalles (une ombre qui grandit, un choc, l'écran tremble un peu).
**Autres états** : il arme, il frappe ; le bélier gratte et charge ; le tourbillon tourne ; **figé** par le Stop, il est pris dans un cristal bleu.
**Fichier** : `src/golems.js`, objet `Golems` (`Golems.dessiner(toile, type, x, y, taille, état)` ; chaque image est peinte une fois puis gardée).

### 16.5 Le Barde, de dos, en volume (version 9)
- C'est **le héros du jeu** (le moteur des héros en volume, `jeu/heros-vues/src`, repris tel quel de la maquette du combat de l'Alchimiste : `src/heros-vues.js`), rôle Barde, **tenue de combat** rubis, **vu de dos** (il regarde Grosbec). **Un peu plus grand** qu'avant.
- **Son chapeau à plume** (Romain, 21 h 21) : un bord large, une calotte ronde rubis, un galon d'or, une grande plume blanche.
- **Actes I et II** : le **luth** en main (on voit sa caisse et son manche dépasser sur sa gauche), et le **clavier dans le dos**, en travers, les touches vers nous.
- **À partir de l'acte III** : il joue du **synthé** (« Le Barde empoigne son synthé ! »), et le **luth est dans son dos**.
- **Il bouge en rythme** (version 10) : il **bat la mesure** (la tête hoche, les genoux plient un peu, la pointe de son pied droit se lève et retombe sur le temps) ; au **méga refrain et à la fête de la fin, il danse** sur deux temps (les hanches passent d'un côté à l'autre, les épaules à l'inverse, la tête penche, le pied libre se lève et retombe sur le temps, le manche se lève à chaque temps). Ces deux boucles suivent **le temps de la musique**, pas l'horloge : l'image choisie dépend d'où on en est dans le temps. Quand la musique est coupée, il ne bouge plus.
- **La danse folle** (version 11), **aux méga refrains du dernier acte et pendant tout le tube de la fin** : sur deux temps, la tête baissée qui part d'un côté puis de l'autre, **le poing droit levé bien haut qui pompe à chaque temps**, les genoux qui plient fort, les hanches et les épaules qui se tordent, les pieds qui tapent l'un après l'autre ; sa main gauche garde le manche. Pendant qu'il danse (petite danse ou danse folle), ses boutons ne coupent plus la danse.
- **Ses gestes**, un par bouton : Note (un coup de médiator), Repousse (le manche levé, le grand accord), Stop (la main levée : le point d'orgue), Vague (le bras balaie) ; il prend un coup (le geste du donjon).
- **Comment c'est fait** : le dessin en volume coûte cher, alors chaque image de chaque geste est dessinée **une fois**, en arrière-plan pendant qu'on lit les règles, puis recopiée (comme l'Alchimiste de son combat). Le chapeau, la sangle et les deux instruments sont dessinés à part et **suivent ses os** (la tête, le bassin, les épaules, le poignet). Fichier : `src/barde.js`, objet `Barde`.
- **Plus de métronome** (Romain, 21 h 01). Le temps se lit sur les pas des golems, la rosace d'or sous le Barde et les rigoles du sol.

### 16.6 La lumière (les règles de ce jeu)
- **La lumière vient du décor**, jamais de nulle part : la ville derrière l'arche, les cristaux de l'arc, les lanternes des portes, les cristaux des colonnes, les lanternes de Grosbec, les fourneaux des golems, le rouge derrière les portes.
- **Le sol est poli : il reflète** ces lumières.
- **Tout bat avec la musique** : les rigoles d'or, les cristaux, les lanternes.
- **Aux refrains (méga refrain et tube)** : les **spots partent des cristaux de l'arche**. Chaque spot pose une **flaque de couleur sur les dalles** (dessinée **sous** les personnages) et un **faisceau** qui descend du cristal (dessiné **par-dessus**).
- **Les confettis tombent du plafond.**

### 16.7 La vitesse — règle : jamais sous 25 images par seconde
**Comment c'est tenu** :
- **Tout est peint une fois, puis recopié** : le décor entier, chaque image de chaque golem, les pièces de Grosbec, chaque image du Barde.
- **Grosbec** est redessiné seulement 10 à 20 fois par seconde quand il bouge, 4 à 10 fois quand il est au repos.
- **Pas de grands voiles de lumière** par-dessus l'écran : de petites lueurs, des traits, des triangles pleins.
- **Les images des golems** (version 10) : au plus 174 pour tout le jeu, toutes préparées d'avance (au chargement, pendant la relance, au début de l'acte), gardées jusqu'au bout, jamais repeintes ; une toile qu'on jette est vidée tout de suite (Safari garde longtemps la mémoire d'une toile jetée) ; une baisse d'un cran ne les repeint pas.
- **Un réglage automatique en quatre niveaux** (3 = le plus fin, 0 = le plus léger) : pendant le jeu, la page compte ses images. Sous 36 images par seconde pendant deux secondes (ou sous 24 une seule fois), elle dessine un peu moins fin et enlève des effets. Elle s'en souvient ; une fois sur quatre, elle retente un cran plus fin. Un appareil faible (deux cœurs, ou peu de mémoire) commence au niveau 1. Chaque niveau a un plafond de finesse (une grande tablette ne dessine pas une image énorme).

**L'iPhone de Romain qui ramait à l'acte III (22 h 25, version 9)** — **pas reproduit** sur les machines de test (pas de vrai iPhone). Ce qui a été trouvé et corrigé en version 10 : (1) **la réserve d'images de golems était trop petite** (260 places, alors que les golems, leurs trois angles et tous leurs états pouvaient en demander jusqu'à 300 environ à partir de l'acte III) : des images encore utiles pouvaient être jetées puis repeintes, de plus en plus souvent — **trouvé en comptant, pas vu avec le robot** (il tue trop vite pour faire apparaître tous les états) ; (2) Safari ne rend pas tout de suite la mémoire d'une toile jetée : la mémoire montait ; (3) une baisse de niveau repeignait toutes les images des golems en plein combat, ce qui pouvait faire baisser encore. Corrigé : 174 images au plus (plus d'images à part pour un golem figé : un seul cristal par sorte, posé par-dessus ; le reflet pour l'angle de gauche ; des toiles un peu moins fines), 340 places, toiles vidées quand on les jette, images gardées quand le niveau baisse, pas de baisse pendant qu'on prépare les images, la mémoire des cordes pincées rendue entre deux chansons, et **l'image de chaque pose du Barde lâchée dès qu'elle est recopiée** (la leçon des plantages du donjon sur iPhone, §13.104 : Safari garde longtemps une image qu'on ne vide pas). C'est la même famille de panne que celle du donjon : **la mémoire du téléphone**. **Version 11 (23 h 23 : « l'acte 4, ça rame aussi, comme l'acte 3 avant »)** — toujours **pas reproduit** ici. Ce qui a été vérifié, acte par acte : la vitesse (tableau ci-dessous : 52 à 60 images par seconde aux quatre actes sur un téléphone ralenti 4 fois) ; la mémoire de la page pendant une partie entière (`tests/memoire.py` : stable, de 354 à 384 Mo, le JavaScript autour de 15 Mo, 60 images par seconde jusqu'au bout) ; la fabrication du son (`tests/profil-actes.py` : les méga refrains occupent 25 à 60 % du temps réel sur la machine de test — c'est l'acte II le plus lourd, pas le III ni le IV). **L'indice qui reste : la panne suit le nombre d'images gardées** (plus de 200 à l'acte III en version 9 ; 174 à l'acte IV en version 10) : Safari supporte mal des centaines de petites toiles séparées. Corrigé en version 11 : **toutes les images d'une sorte de golem sont peintes dans une seule grande toile** (7 planches au lieu de 174 toiles), **toutes les images du Barde dans une seule** (1 au lieu de 71) ; les images du Barde se préparent doucement pendant le combat (une de temps en temps), vite pendant les règles et la pause ; pas de baisse de niveau pendant ce temps. **Ce n'est pas une certitude** : seule la ligne du menu Pause, lue sur l'iPhone au moment où ça rame, dira si c'est le dessin (peu d'images par seconde, des baisses) ou autre chose (60 images par seconde affichées alors que ça saccade : ce serait le son).

**Si ça rame encore** : le menu Pause affiche une ligne de chiffres (« Si ça rame, lis-moi ça : niveau…, images par seconde…, baisses…, images de golems…, acte…, écran… ») à lire à Claude.

**Mesuré, version 10** (images par seconde ; navigateur sans carte graphique, processeur ralenti, acte IV lancé directement, réglage automatique) :

| Appareil simulé | Combat | Méga refrain | Pire seconde | Niveau |
|---|---|---|---|---|
| Téléphone (390 × 844, écran fin), ralenti 4 fois | 60 | 60 | 59 | 1 |
| Vieille tablette (768 × 1024, écran simple), ralentie 4 fois | 57 | 58 | 53 | 1 |
| Grande tablette (800 × 1280), **ralentie 6 fois** | 32 | 41 | 8 | 0 (après une baisse) |

**Mesuré, version 11, acte par acte** (téléphone ralenti 4 fois, on lance l'acte tout de suite, sans lire les règles : les images du Barde se préparent en même temps) :

| Acte | Combat | Méga refrain | Pire seconde | Baisses |
|---|---|---|---|---|
| I | 52 | 60 | 49 | 0 |
| II | 53 | 60 | 46 | 0 |
| III | 58 | 60 | 54 | 0 |
| IV | 56 | 60 | 53 | 0 |

Vieille tablette ralentie 4 fois, acte IV : 45 au combat, 60 au méga refrain, pire seconde 34.

La dernière ligne est le pire cas de ce test : on saute tout droit à l'acte IV, donc les 174 images se peignent d'un coup, sur une machine ralentie 6 fois (une seconde à 8 images) ; ensuite elle tient 50. Dans une vraie partie, elles se préparent petit à petit. Acte III puis acte IV joués 70 secondes chacun : 58 à 61 images par seconde, aucune image repeinte.

**Pas vérifié : une vraie tablette.** Ces chiffres viennent d'un ordinateur ralenti exprès, pas d'un vrai appareil. La page pèse 666 Ko (dont 320 Ko pour le moteur des héros en volume).

### 16.8 Choix de Claude, à valider par Romain
- Le mot **« golems »** à la place d'« automates » ; les noms (le rôdeur remplace « le caillou » ; les six autres noms n'ont pas changé).
- **Le chapeau du Barde est rubis**, assorti à sa tunique (dans l'ancien dessin, il était violet, comme l'ancien costume).
- **Qui passe par où** : les golems du fond (et les frondeurs) sortent par les portes ; ceux des côtés sautent des galeries.
- La voix de Grosbec est un son fabriqué (pas des mots enregistrés) : « al-lez » se devine, les mots sont écrits à l'écran.
- L'explication du début (les petites images des règles) montre encore l'ancien dessin du Barde.
- Les règles du combat, la musique et la fête de la fin n'ont pas changé (versions 2 à 7).

### 16.9 Le lien avec les autres combats de l'enquête 10
- **Le combat du Sage (§15.5)** : Romain a dit (24 nov., 19 h 16) que ses golems et son sol seraient peut-être à refaire « selon les graphismes du jeu du Barde ». Ce sont ceux de cette section : `src/golems.js` (le bestiaire), `src/decor.js` (la salle, le sol), `src/outils.js`.
- **Le même Grosbec** (`src/grosbec.js`) est prévu pour être repris partout où on le revoit.
- Le code que le Barde donne au Sage à la fin (🔑 💧 🍃, « la clé · la goutte · la feuille ») n'a pas changé.
