## 17. L'enquête 10, le combat final — le combat du Pisteur contre la garde de Grosbec (25 novembre) — LA VERSION 4 A ÉTÉ JOUÉE ET REFUSÉE PAR ROMAIN (« ça marche pas ») ; UN NOUVEAU SYSTÈME DE JEU EST DÉCIDÉ (§17.11 à §17.21, 25 novembre, 15 h) : À CONSTRUIRE ; HORS DU JEU

> **⚠️ À lire d'abord (25 novembre, 15 h).** La version 4 décrite de §17.2 à §17.9 a été **jouée et refusée par Romain** le 25 novembre à midi (§17.10). **Un nouveau système de jeu a été décidé à la voix l'après-midi : il est écrit de §17.11 à §17.21, et c'est lui qui fait foi.** Il n'est **pas construit** : Romain lance la construction dans une autre conversation (§17.21). **Restent valables** : la salle, sa lumière et les dessins (§17.2, sauf la ligne « L'écran »), la règle de vitesse (§17.7). **Sont remplacés** : voir et être vu (§17.3), le regard de Grosbec (§17.4), les golems et leurs chiffres (§17.5). **Les cartes (§17.6) seront réécrites plus tard.** La page en ligne est toujours la version 4.

**La page jouable (toujours la version 4, refusée)** : https://claude.ai/artifact/GmvcxCF5gC89M9tmnCVyGU (la même adresse que les maquettes 1 à 3, qui restent dans l'historique du canevas). **Les sources** : `jeu/maquettes/combat-pisteur/` (`LISEZ-MOI.md` dit quoi est quoi ; `python3 construire.py ../../heros-vues/src` refait `index.html`). **Rien n'est branché dans le jeu, rien n'est en ligne sur le site** : l'enquête 10 n'existe pas encore dans le jeu, et les trois autres combats (Sage §15, Barde §16, Alchimiste) sont eux aussi des pages à part. **Tout ce qui a été dit à l'oral** est gardé dans deux documents du projet : la nuit, `claude/combat-pisteur-decisions-orales-25-novembre.md` (copie : `jeu/maquettes/combat-pisteur/decisions-orales.md`) ; l'après-midi, `claude/combat-pisteur-decisions-orales-25-novembre-apres-midi.md` (copie : `jeu/maquettes/combat-pisteur/decisions-orales-apres-midi.md`).

### 17.1 Ce que Romain a dit (nuit du 24 au 25 novembre)
- Il manque le jeu du Pisteur ; il le sent au corps à corps ; **le premier combat n'est pas contre Grosbec mais contre ses sbires**.
- Maquette 1 (une foule, façon Batman Arkham) : « pas dingue ». Maquette 2 (un duel, façon Infinity Blade) : « un peu inintéressant ». Maquette 3 (l'arène vue de haut, façon **Hades et Brawl Stars**, formes simples) : **« c'est pas mal »**.
- Puis, à la voix : **la cachette** (« c'est un pisteur, il peut rester dans l'ombre […] surgir, faire l'assassin et repartir »), **les murs qui cachent** (pas des petites zones d'ombre : on voit toute la salle), **les champs de vision** affichés quand on est caché, **les boutons qui changent d'effet** quand on est caché (comme Valeera dans Heroes of the Storm), **Grosbec le stratège** qui pilote ses golems à distance, crie ses ordres et cherche du regard (« l'œil de Sauron », qui sert de minuteur caché), **le faucheur** et **le cuirassé**, l'onde du colosse qui **s'arrête aux murs**, le **brouillard léger**, les **cartes** (4 familles d'effets comme les dieux de Hades, des cartes dorées à deux faces gagnées avec les pages des carnets de l'ancêtre des enquêtes 4 à 9, toutes passives : jamais plus de trois boutons), **10 minutes, 15 au grand maximum**, des **noms standards** (le moteur resservira).
- **6 h 31, écrit : « on passe pas par la phase maquette. Tu peux commencer à fabriquer le mini-jeu »**, avec de la qualité (perspective, textures, éclairage : des zones éclairées et d'autres moins, animation façon Hades), **jamais sous 24 images par seconde sur une vieille tablette**, en s'inspirant du Pisteur en volume et de Grosbec ; « tu as mon go et après tu peux mettre en ligne ».

### 17.2 Ce qu'on voit (version 4 — toujours valable, sauf la ligne « L'écran » : une barre de vie et quatre boutons, §17.12 et §17.14)
- **La grande salle de Grosbec vue de haut, en biais** (26 × 18 pas ; la profondeur tassée à 66 %, les hauteurs entières : les personnages sont dessinés debout). Peinte une fois (`salle.js`) : de grandes dalles avec leur grain, leurs fissures et leurs taches, le grand tapis rouge, la rosace au bec incrustée, le mur du fond en blocs, l'arche ouverte sur **la ville la nuit** et ses rideaux, **deux portes de bronze** (leurs battants s'ouvrent quand un golem entre), deux bannières, **l'estrade de Grosbec** et ses marches. **La lumière est cuite dans l'image** : quatre torches au mur, deux lampes sur les côtés, **quatre vasques de feu en haut des piliers** (des flaques chaudes autour), **deux nappes bleues de lune** en travers du sol, la lueur rouge devant Grosbec, des coins sombres, l'ombre portée de chaque obstacle.
- **Les obstacles** (cuits à part, mêmes matières que les golems : `roc`, `plaque` du bestiaire) : 4 grands piliers et 2 grands pans de mur en ruine (**hauts** : on ne saute pas par-dessus, ils arrêtent le regard de Grosbec et l'onde du colosse ; ils deviennent transparents quand le Pisteur passe derrière) ; une statue de Grosbec renversée, deux murets, deux tas de gravats, un chariot de minerai, deux caisses, la dalle plantée (**bas** : le bond passe par-dessus).
- **Le Pisteur** : **le pantin en volume du jeu** (`jeu/heros-vues/src`, la Pisteuse rousse par défaut ; `?sexe=…&cheveux=…&yeux=…&peau=…` pour un autre), cuit en planches sous **8 angles**, 21 poses : en garde, la course (8 images), la course accroupie quand il est caché (4), à pas de loup, deux coups de dague, le saut et le coup planté, l'arc bandé, la flèche lâchée, à terre. Jamais d'image retournée.
- **Les golems** : les modèles du combat du Barde (§16.4) et le cuirassé de l'Alchimiste, non modifiés, cuits à la demande sous trois angles avec leur pas en quatre images : **rôdeur** (trotteur), **javelot** (le « tourbillon » ; son javelot est dessiné à part), **mortier** (le frondeur), **bélier**, **porte-dalle**, **faucheur** (le lancier à la faux), **cuirassé** (acier poli), **colosse**.
- **Grosbec** : le modèle en armure validé (§16.3), debout sur son estrade ; il lance le bras à chaque ordre, il gronde à chaque vague perdue.
- **L'écran** : en haut à gauche les cœurs, « Vague 3 / 8 », « ◐ Caché » (violet) ou « ◉ Repéré » (rouge), les icônes des cartes ; le conteur en haut au milieu (🔊) ; ⏸ ; le pouce à gauche (un joystick qui apparaît sous le doigt) ; à droite **trois boutons : dague, arc, bond**.

### 17.3 Voir et être vu (`regles2.js`) — VERSION 4, REMPLACÉ PAR §17.12 ET §17.13
- **Trois états de la garde** : *calme* (elle ne sait pas où est le Pisteur), *alerte* (elle le voit), *recherche* (elle vient de le perdre).
- **Un golem ne voit le Pisteur que s'il a une ligne directe** : tous les obstacles l'arrêtent. Tant que la garde n'est pas en alerte, il ne voit que **dans son champ de vision** (un éventail devant lui, 5,5 à 8 pas, coupé par les murs), plus tout ce qui est à moins d'un pas et demi.
- **Caché, les champs de vision s'affichent au sol** (pâles) ; quand le Pisteur est dedans, l'éventail devient **orange** et se remplit (environ une demi-seconde, plus vite de près) : plein, c'est **« ! »**, toute la garde sait où il est. À découvert, les éventails disparaissent.
- **En alerte**, il suffit qu'aucun golem n'ait de ligne directe pendant **1,1 seconde** pour qu'ils le perdent : **« ? »**, ils vont là où ils l'ont vu en dernier, puis fouillent les cachettes voisines ; au bout de 11 secondes ils reprennent leurs rondes.
- **Le brouillard léger** : un golem caché derrière un pilier ou un grand pan de mur n'est plus qu'une silhouette pâle avec un « ? », là où on l'a vu en dernier.
- **Caché, les trois boutons passent au violet** :
  - **dague → coup d'assassin** (à moins de 2,5 pas d'un golem) : le Pisteur se pose dans son dos ; **les rôdeurs, le javelot et le mortier tombent d'un coup** ; les gros perdent **40 % de leur vie**, sont sonnés 2 s et prennent double dégâts de dague pendant 4 s ; **le cuirassé perd une plaque sur trois**. Ensuite 1,4 s avant le prochain coup d'assassin, et les golems à moins de 6,5 pas viennent voir. **S'il y a un témoin (un golem qui a une ligne directe), c'est l'alerte ; sinon « Ni vu ni connu »**, et le regard de Grosbec accélère ;
  - **arc → tir visé** : on garde le doigt (0,75 s, le temps ralentit), une ligne de visée et une cible sur le point faible, on lâche : une flèche **silencieuse** (4 dégâts), qui **cloue le golem 2 s** ; puis 2,2 s de recharge. Lâché trop tôt : une petite flèche silencieuse. À découvert, l'arc tire **en rafale** de petites flèches ;
  - **bond → saut d'ombre** : le Pisteur ressort dans le dos du golem le plus proche (à moins de 5 pas) ; ensuite 3 s de course rapide et un bond gratuit ; 4 s avant le prochain saut d'ombre.

### 17.4 Grosbec le stratège — VERSION 4 ; LE REGARD EST SUPPRIMÉ, LES ORDRES SONT À REVOIR (§17.18)
- **Son regard** : un faisceau rouge qui part de l'estrade et balaie la salle ; **seuls les piliers et les grands pans de mur l'arrêtent**. S'il reste 0,4 s sur le Pisteur caché : « Là ! Je le vois ! », alerte. **Il va de plus en plus vite et s'élargit pendant la vague**, et chaque assassinat discret l'accélère de 30 %.
- **Chaque vague a un plan** (les rôles des golems : `ronde` en meute, `embuscade` derrière un obstacle, `escorte` derrière le porte-dalle, `garde` d'un poste, `barrage`, `appat`). **Ses ordres**, criés et **écrits en rouge au milieu de l'écran** (« GROSBEC ORDONNE »), avec des fils rouges vers les golems :
  - **« Rôdeurs ! En patrouille ! »** : un rôdeur assassiné alors que d'autres attendaient en embuscade ;
  - **« Restez groupés ! »** : au deuxième assassinat (à partir de la vague 3) : tout le monde marche ensemble ;
  - **« Débusquez-le ! »** : après environ 16 secondes de cachette dans la vague : les mortiers bombardent les cachettes, les autres fouillent près de l'endroit où il est vraiment ;
  - **« Tous sur lui ! »** : quand la vague dure trop (80 à 120 s selon la vague) ou quand il ne reste qu'un golem depuis 9 s : **plus moyen de se cacher**, il faut finir à découvert. C'est le minuteur caché.

### 17.5 Les golems — VERSION 4, REMPLACÉ PAR §17.15 À §17.17
Tous préviennent **en rouge au sol** avant de frapper ; deux attaquent en même temps au plus.
- **Rôdeur** (3 de vie) : en meute, celui de derrière bondit (flèche rouge). **Javelot** (5) : vise (ligne rouge), lance, va rechercher son javelot ou vient à mains nues ; le Pisteur peut ramasser le javelot (deux javelots cassent une dalle) ; un javelot abattu laisse tomber le sien. **Bélier** (11) : gratte, charge, s'écrase (« BANG ! ») ou carambole. **Mortier** (5) : trois obus par-dessus tout. **Porte-dalle** (10) : protège les tireurs, sa dalle arrête tout de face (un arc doré au sol montre de quel côté) ; seul, il la plante : un mur de plus. **Faucheur** (9) : un grand balayage en demi-cercle (2 cœurs), puis une seconde sans défense. **Cuirassé** (3 plaques) : rien ne le blesse (« Tching ! ») sauf le coup d'assassin, trois fois ; un coup d'estoc. **Colosse** (38) : son onde part en cercle et **se brise sur les piliers et les grands pans de mur** (« À l'abri ! »), sinon on bondit.
- **8 vagues**, 85 golems en tout, trois groupes par vague : La meute ; Le javelot et la dalle ; Le bélier garde le passage (un rôdeur en appât) ; Le faucheur ; Le cuirassé ; La batterie (trois mortiers) ; La grande meute ; Le colosse.

### 17.6 Les cartes (`cartes.js`) — VERSION 4, À RÉÉCRIRE PLUS TARD (§17.18)
- **Entre deux vagues, une carte parmi trois** (chacune avec son 🔊, un bouton jaune « Prendre », +1 cœur). **33 améliorations en quatre familles** : la marque (l'arc), le saignement (la dague), la poussée (le bond), l'ombre (la cachette), plus Cœur de chêne. **20 cartes dorées à deux faces** (« Caché : … / À découvert : … ») : une carte dorée n'est proposée que si le Pisteur a **ses deux améliorations** et **sa page des carnets** ; une seule par arme (dague, arc, bond, cape). Une amélioration qui complète une paire le dit (« Avec « Tourbillon » : la carte dorée « Danse des lames » »). La liste complète et les vingt façons de jouer : le document des décisions orales.
- **Les pages des carnets** (enquêtes 4 à 9) n'existent pas encore : **toutes comptent comme trouvées** ; le menu Pause a un bouton pour essayer sans.
- Toutes les cartes sont écrites dans les règles ; **elles n'ont pas été vérifiées une par une** (des parties entières de robots, sans erreur).

### 17.7 La vitesse — règle : jamais sous 24 images par seconde
- Tout est cuit pendant l'écran d'explication (la salle, Grosbec, les 80 premières images du Pisteur ; le reste et les golems ensuite, doucement). La page **mesure l'appareil au départ** (`mesurerAppareil`) et choisit la finesse de l'image (0, 1 ou 2) ; elle la baisse encore si les images par seconde passent sous 33. Le fond n'est recopié que là où on le voit ; un appareil lent n'a pas les halos des flammes.
- Mesuré sans carte graphique : téléphone ralenti 4 fois : 46 images par seconde (pire seconde 37) ; tablette ralentie 4 fois : 49 (pire 31) ; tablette ralentie 6 fois : 35 (pire 24). Attente avant « En garde ! » : 4 s ici, 12 à 18 s sur un appareil très lent. **Pas vérifié sur un vrai iPhone ni une vraie tablette** : le menu Pause affiche une ligne « Mesures (version 4) : … » à faire lire par Romain si ça rame.

### 17.8 Choix de Claude, à valider par Romain — VERSION 4 (les deux premières lignes tiennent toujours ; le reste est remplacé)
- La Pisteuse rousse par défaut ; les personnages debout sur un sol vu de haut ; pas de capuche.
- Quel modèle pour quel golem (le « tourbillon » fait le javelot ; le frondeur fait le mortier).
- Tous les chiffres (vies, champs de vision, délais, vitesse du regard, moments des ordres, attentes entre deux coups d'assassin et deux sauts d'ombre).
- Les obstacles bas cachent aussi le Pisteur des golems (pas du regard de Grosbec).
- Les golems qui viennent voir après un assassinat ; les huit vagues et leurs plans ; les textes du conteur.
- Les pages des carnets toutes « trouvées » en attendant les enquêtes 4 à 9.

### 17.9 Pas fait — VERSION 4 (toujours vrai)
- Aucune musique ; les sons n'ont jamais été écoutés par un humain ; Grosbec n'a pas sa voix du combat du Barde.
- Les tactiques « le bélier aligné sur la sortie de la cachette » et « le faucheur qui pousse vers le cuirassé » sont réduites à des postes fixes.
- Le lien avec les trois autres combats (les codes échangés, la durée commune) : seul le code de fin 🔥 🌙 ⭐ est là.
- Brancher dans le jeu : quand l'enquête 10 existera.

### 17.10 L'avis de Romain sur la version 4 (25 novembre, 12 h 16 et 12 h 28) : « ça marche pas »
- **12 h 16, écrit** : « On n'a pas du tout la sensation d'être caché. On a la sensation de ne jamais être caché. » Les icônes ne changent pas, la vue ne change pas : il veut **comme Valeera dans Heroes of the Storm** (le héros dans les ombres, **la couleur de l'écran qui change**, des icônes qui **changent de forme**). « Tout va trop vite » (les personnages, les chiens ; « quand on fait des sauts, on traverse la salle en 2 secondes »). « On sent pas du tout l'assassin. Dès qu'on a attaqué quelqu'un, il y a tout le monde qui nous court après. Même s'ils nous voient pas, ils savent où on est. » « Il faut faire 4 fois le tour de la salle pour de nouveau être un peu caché. »
- **12 h 28, écrit** : le regard de Grosbec « voit à travers les murs » : « il n'y a quasiment pas de cachette […] le faisceau rouge, il sert à rien ». « Il faut faire un style de combat exactement comme dans Heroes of the Storm. Il faudrait un bouton pour se cacher dans les ombres. Un bouton qui réapparaît au bout de 2 secondes, ou 3 secondes. » Il se demande s'il ne change pas trop le jeu (« on n'est plus du tout dans l'action »).
- **À la voix, ensuite** : « quand on est au corps à corps, on n'a que la dague » ; « les combats ne sont pas intéressants » ; « tes zones rouges servent à rien parce qu'elles sont impossibles à éviter » ; les golems tournent par à-coups, « on n'a pas de mouvement fluide ».
- **Les erreurs de Claude dans la version 4** (dans les règles, pas seulement à l'affichage) : dès qu'un golem voyait le Pisteur, tous savaient où il était à chaque instant ; pour redevenir caché il fallait qu'aucun golem n'ait de ligne directe pendant 1,1 s à 17 pas à la ronde, sans tenir compte de l'endroit où ils regardaient ; un témoin comptait même le dos tourné ; après chaque assassinat les voisins marchaient droit sur le Pisteur ; il était remarqué en une demi-seconde ; les vitesses venaient d'un jeu de bagarre ; le regard de Grosbec n'était arrêté que par les quatre piliers et les deux grands pans de mur ; les zones rouges prévenaient entre une demi-seconde et une seconde et suivaient le Pisteur presque jusqu'au bout ; le contact d'un chien et sa morsure arrivaient en même temps ; caché, seuls une fine bande violette et le tour des boutons le disaient. Le robot maladroit n'avait passé que 94 secondes caché sur 445 : le chiffre était là, Claude n'en a pas tiré la conclusion.

### 17.11 La nouvelle direction (décidée à la voix le 25 novembre, entre 12 h 30 et 14 h 45) — À CONSTRUIRE, RIEN N'EST FAIT
**Comment lire la suite** : **(R)** = dit ou validé par Romain. **(C)** = proposé par Claude pendant la discussion, Romain n'a pas dit non : c'est le point de départ, à vérifier à l'essai. Ce qui n'a pas été tranché est rassemblé en §17.20. Le fil de la discussion et les idées écartées (à ne pas reproposer) : `claude/combat-pisteur-decisions-orales-25-novembre-apres-midi.md`.

- **Un jeu d'action où l'ombre est un pouvoir**, comme Valeera dans Heroes of the Storm ; **pas un jeu d'infiltration** comme Commandos (une seule salle, des vagues, dix minutes, les trois autres héros en pleine bagarre). (R) : « On va plus s'inspirer de Heroes of the Storm », puis « il faut arrêter de copier trop sur Heroes » : **pas de points de combo, pas de barre d'énergie**.
- **Frapper, disparaître, revenir** : c'est ça, la sensation d'assassin. **Bien joué, un combat ne coûte aucun point de vie** ; mal joué, il coûte cher, sans tuer d'un coup. (R)
- **D'abord observer** : « il y a d'abord une phase où il faut observer le terrain, voir qui est la plus grande menace, et agir en conséquence ». (R)
- **Des golems moins nombreux et plus solides**, chacun avec ses coups à lui ; **chaque groupe est simple tout seul, c'est le mélange qui fait la difficulté**. (R)
- **Des rouges qu'on a le temps d'éviter**, et qui **blessent tout le monde**, golems compris. (R)
- **Tout est ralenti** par rapport à la version 4. (R)
- **Le faisceau de Grosbec est supprimé** (Romain : « le faisceau rouge, il sert à rien » ; Claude a proposé de l'enlever, il n'a pas dit non).

### 17.12 Les quatre boutons du Pisteur (huit visages)
À droite de l'écran, **quatre boutons** (R ; la règle « pas plus de trois boutons » de la nuit est levée). **Dans l'ombre, chaque bouton change de dessin et d'effet** (pas seulement de couleur).

| Bouton | À découvert | Dans l'ombre |
|---|---|---|
| 1 | **Dague** : un seul golem, trois rangs | **Embuscade** : le gros coup, celui de la tête de mort |
| 2 | **Dague circulaire** (le « tourbillon ») : tous les golems autour | **Coup qui assomme** |
| 3 | **Saut** | **Saut d'ombre** |
| 4 | **Ombre** (gris tant qu'un golem voit le Pisteur) | **Arc** |

- **Plus d'arc à découvert** (R : « on devrait laisser tomber l'arc quand on n'est pas camouflé » ; il permettait de reculer en tirant sans jamais s'engager). Contre le mortier et le javelot, il faut aller les chercher.
- **Écartés** : les points de combo ; un bouton « interrompre » (R : « on oublie le côté interrompre ») ; un cinquième bouton.

**La dague** (R)
- La meilleure arme contre **un seul** golem. **Trois rangs** : quand un coup touche, **le dessin du bouton change** ; le troisième coup est le gros. **10, puis 10, puis 20 : 40 points par série.**
- **La série dure 2 secondes** : 0,6 s, 0,6 s, puis 0,8 s (Romain a demandé de la ralentir). **La lame part dès qu'on appuie** ; la lenteur est dans le retour du bras (C).
- La série **retombe au rang 1** si un coup rate ou si on attend plus de 2 secondes (C).
- **En sortant de l'ombre, la dague est toujours au rang 1**, quelle que soit l'ouverture (R : l'embuscade ne fait pas passer au rang 2).
- La dague ne ralentit pas : Romain avait d'abord imaginé le ralentissement sur la dague, puis l'a mis sur la dague circulaire.

**La dague circulaire** (R)
- Elle frappe **tous les golems autour** du Pisteur : **15 à chacun**. Plus forte qu'un coup de dague ; mais sur un golem seul, la série de dague reste meilleure.
- **Recharge : 4 secondes.**
- Elle **ralentit de 40 %** ceux qu'elle touche. **Le ralentissement raccourcit tout ce qui bouge**, la course comme les bonds (R : un recul de 100 n'en fait plus que 60).
- **On peut se déplacer pendant le geste** (R).

**Le saut** (R)
- L'esquive, et la porte de sortie : il passe **par-dessus les murs bas**, ce qui fait perdre le Pisteur de vue.
- Il porte à **3 pas** (C : la distance du recul du javelot, pour qu'un saut le rattrape).
- **Il répond toujours tout de suite**, même en plein coup de dague.
- Le dépenser pour attaquer est un pari : on ne l'a plus pour esquiver. Il a donc un temps de recharge (pas chiffré, §17.20).

**Le bouton d'ombre** (R)
- **Gris tant qu'un golem voit le Pisteur.** Il s'allume dès que plus aucun golem ne le voit (derrière un mur, après un saut). Règle de base : **on n'entre pas dans l'ombre au milieu des golems** ; une carte dorée pourra le permettre (« la bombe fumigène »).
- Il **revient 2 à 3 secondes** après la sortie de l'ombre (Romain, 12 h 28).
- Une fois dans l'ombre, ce bouton devient **l'arc**.

**L'embuscade** (R)
- **30 points.** Elle fait sortir de l'ombre.
- **La tête de mort** : dans l'ombre, une petite tête de mort s'affiche au-dessus de chaque golem que l'embuscade tuerait d'un coup, c'est-à-dire **à 30 points de vie ou moins**. Elle s'affiche aussitôt quand on repasse dans l'ombre en plein combat : c'est la raison d'y retourner (cogner un gros à découvert, disparaître, l'achever).

**Le coup qui assomme** (R)
- **Aucun dégât. Le golem est sonné 2 secondes, la même durée pour tous les golems** (R : « j'aime pas l'idée qu'on change les chiffres du sort »).
- Un golem sonné **ne peut prévenir personne**, ne bouge pas, ne sort pas d'un rouge.
- Il fait sortir de l'ombre, dague au rang 1.
- **L'embuscade fait mal, assommer achète du temps** : pendant les 2 secondes, on place **une série de dague complète (40) et pas un coup de plus** (à régler pour que ce soit vrai).

**Le saut d'ombre** (C, repris de la version 4)
- Il pose le Pisteur **dans le dos du golem le plus proche**.

**L'arc** (R : « dans l'ombre, un arc, mais qu'on puisse prendre le temps de tirer de loin »)
- On garde le doigt sur le bouton : le Pisteur s'arrête et bande l'arc, **une ligne fine montre où ira la flèche**, on vise au pouce gauche, on lâche. Plus on tient, plus la flèche porte loin et fort (C).

**Un seul geste à la fois, un appui gardé en mémoire** (R)
- Pas de temps de recharge commun à tous les boutons. Mais **un seul geste d'attaque à la fois** : si on appuie sur un autre bouton pendant un coup, **le jeu garde cet appui en mémoire** et le joue dès que le geste en cours est fini.
- Il ne garde **qu'un appui, le dernier** (C).
- **Le saut passe devant tout** : il part tout de suite, coupe le coup en cours et annule le geste en attente, qui n'est pas dépensé.

### 17.13 L'ombre : ce qui change à l'écran, ce que voient et entendent les golems
**À l'écran, deux mondes qu'on ne peut pas confondre** (R : « quand on passe dans l'ombre, tu changes un peu tout, tu changes la carte »)
- **Toute la salle change de couleur** (C : une deuxième image de la salle, sombre et bleu-violet, cuite d'avance pour ne rien coûter en vitesse), **le Pisteur devient une silhouette sombre**, les quatre boutons changent de dessin, les regards des golems se dessinent au sol, les têtes de mort apparaissent.

**Dans l'ombre, les golems voient beaucoup moins** (R : « ils nous détectent moins » ; l'idée est de « se faufiler entre les gens »)
- Le regard d'un golem est **un éventail court devant lui** (C : 3 pas environ), **dessiné au sol quand le Pisteur est dans l'ombre**. On arrive dans leur dos. La règle tient en une phrase : **ne passe pas devant leurs yeux**.
- **Pas de rond autour du corps pour l'instant** (R : « on va essayer d'abord sans le rond, juste la vision » ; le rond tout autour, comme pour Evelynn dans League of Legends, reste une idée de secours).
- Entré dans l'éventail, le Pisteur n'est pas repéré tout de suite : **une demi-seconde d'hésitation**, le temps de reculer (C). Repéré, il sort de l'ombre (C).

**Un regard qui tourne en douceur** (R)
- Le regard d'un golem est une valeur à part, **qui rattrape la direction de son corps à vitesse limitée** (environ une demi-seconde pour un quart de tour). **C'est l'éventail dessiné qui fait foi** : ce qu'on voit à l'écran est exactement ce que le golem voit.
- Les corps restent dessinés sous **8 angles** ; dans un virage à 90 degrés, le corps passe par son dessin à 45 degrés. **16 angles : seulement si les corps gênent encore après ça** (deux fois plus d'images en mémoire : à mesurer sur vieille tablette d'abord).
- **Les rondes suivent un vrai trajet** : ils marchent, s'arrêtent, regardent à gauche, à droite, repartent ; plus de changement de direction au hasard (C).

**Ce qu'un golem sait** (R)
- **Chaque golem ne connaît que le dernier endroit où lui a vu le Pisteur.** Les golems ne se passent plus l'information sans rien voir.
- **Un mur fait perdre la vue.** Le golem **contourne le mur pour aller voir derrière** ; s'il ne trouve personne, **il reste là et cherche autour de lui** quelques secondes, puis reprend sa ronde.
- **L'échappée type** (R) : ça tourne mal, on saute par-dessus un mur, on passe dans l'ombre, on s'éloigne. Le chien qui poursuivait vient voir derrière le mur et reste planté là : il tourne le dos, c'est une occasion d'embuscade.
- Les golems blessés **ne récupèrent pas leurs points de vie** quand le Pisteur disparaît (R).

**Le bruit : « comme dans la réalité »** (R)
- **Un golem touché qui n'est pas mort crie** : ceux qui sont à côté sont avertis.
- **Un golem tué d'un coup ne prévient personne.** Les autres ne réagissent pas, **sauf ceux qui avaient la vue sur lui** : ceux-là s'activent et se mettent à chercher.
- **Un golem sonné ne peut pas crier.**
- **« Avoir la vue »** = regarder dans cette direction, sans mur entre les deux ; un golem qui tourne le dos à trois pas ne voit rien.
- **« Avertis »** = ils savent **d'où vient le bruit, pas où est le Pisteur** : ils vont à cet endroit et cherchent. S'il a déjà filé, ils ne trouvent personne.

### 17.14 La vie du Pisteur (R)
- **Une barre de 100 points de vie**, plus de cœurs (il la faut pour le saignement).
- **Aucun soin pendant une vague** ; **la barre est pleine au début de la vague suivante**.
- Les gros coups des golems font 30 à 40 : **deux encaissés, on est en danger ; trois, on est à terre**.
- **Les mauvais enchaînements existent** (« on peut avoir des mauvais combos ») : pas de protection après avoir été sonné. À la place, chaque gros coup a son temps de recharge (le javelot ne relance pas tout de suite) : une erreur coûte cher, deux d'affilée tuent.
- **Être plaqué ou sonné doit rester court** : « il faut pas que le personnage meure juste à cause de ça ».

### 17.15 Les règles communes à tous les golems (R)
- **Chaque golem a trois choses** : une façon de bouger, **un coup de base**, **un coup spécial**. **Le coup de base n'a jamais de rouge ; le rouge est pour le coup spécial.** Deux exceptions voulues : le mortier (un seul coup) et le cuirassé (son armure).
- **Arrivé au contact, un golem ne frappe pas tout de suite** : un petit temps où on le voit se ramasser (une demi-seconde pour la morsure d'un chien), « juste le temps de pouvoir partir ».
- **Plus un golem est gros, plus il met de temps à réagir** : les chiens et le javelot réagissent dans l'instant ; le faucheur et le porte-dalle en six ou sept dixièmes de seconde ; le colosse encore plus lentement. Ça dit aussi par qui commencer.
- **Ils courent à peu près aussi vite que le Pisteur, un peu moins** : on les rattrape, et on peut les semer.
- **Le rouge fait mal à tout le monde** : un coup spécial blesse tous les golems qui sont dans sa zone. **Les golems voient le rouge et en sortent** : les rapides (chiens, javelot) presque toujours ; les lents (cuirassé, mortier, porte-dalle) pas toujours. **Un golem ralenti par la dague circulaire, ou sonné, n'en sort pas à temps** : c'est le geste du joueur (le rouge apparaît, il lance la dague circulaire sur ceux qui sont dedans, et lui sort, puisqu'il peut bouger en frappant). Attirer un gros dans la mêlée ne doit pas suffire à nettoyer la salle.
- **Un rouge doit pouvoir s'éviter** : il dure une bonne seconde, il se fige avant le coup, et **il ne commence jamais pendant que le Pisteur ne peut pas bouger** (en l'air après un coup de tête, ralenti par une charge) (C).

### 17.16 Les huit golems
Les dessins sont ceux de la version 4 (§17.2). Les chiffres de vie de la version 4 (3, 5, 11…) ne valent plus. **Les chiffres que Romain a fixés lui-même** : le javelot à 50 de vie et son lancer à 40 ; le bélier à 80, son coup de tête à 8, sa charge à 40, son demi-tour en 1,5 s ; le cuirassé à 10 par coup ; l'embuscade à 30 ; le coup qui assomme à 0 dégât ; le ralentissement de 40 % ; la charge du porte-dalle (90 % pendant 0,5 s) et ses 2 secondes d'étoiles ; la demi-seconde sonné par un javelot. **Les autres ont été proposés par Claude et acceptés** (« c'est pas mal », « validé ») : faciles à bouger à l'essai.

| Golem | Vie | Sa façon de bouger | Coup de base (sans rouge) | Coup spécial (rouge) |
|---|---|---|---|---|
| **Chien** (le rôdeur), par 3 ou 4 | **30** | un petit bond pour charger | **la morsure** : 3 tout de suite, puis un saignement de 2 par seconde pendant 4 s (11 en tout) | **le plaquage** : une longue flèche rouge ; touché, le Pisteur est cloué au sol |
| **Javelot** | **50** | **un recul d'un bond**, dans l'instant | un coup de pique, faible | **le lancer** : un trait rouge fin ; **40**, et sonné 0,5 s |
| **Porte-dalle** | pas fixée | **une charge** qui ralentit le Pisteur de 90 % pendant 0,5 s | un coup de patte : **5** | **il lève sa dalle** : un cercle rouge autour de lui ; **sonné 2 s** |
| **Faucheur** | **80** | **la volte** : un petit bond en pivotant, il retombe face au Pisteur | un petit coup de faux devant lui : **8** | **le grand fauchage** : un demi-cercle rouge devant lui ; **30** |
| **Mortier** | **30** | il marche lentement | aucun | **le tir en cloche**, par-dessus les murs : un rond rouge au sol |
| **Bélier** | **80** | rien de spécial ; **demi-tour lent** (1,5 s) | **le coup de tête**, rapide : **8**, et il envoie le Pisteur à 4 ou 5 pas | **la charge** : une longue bande rouge ; **40** |
| **Cuirassé** | **90** | il marche sur le Pisteur, sans jamais courir | un coup lent : **10** | aucun : son arme, c'est son armure |
| **Colosse** | **150** | il marche, c'est tout | un coup de poing lent : **12** | **l'onde**, à 180 degrés devant lui ; **40** |

**Le chien** (R)
- La morsure : chaque nouvelle morsure ajoute son propre saignement. **Le saignement dure son temps, que le chien soit vivant ou mort** (R : « il dure un temps donné, point »).
- Le plaquage : la flèche rouge est **longue** (elle dure), on peut l'esquiver. Plaqué, le Pisteur ne bouge plus et prend toutes les morsures : la punition est lourde mais **courte** (C : 1,5 s). Un chien qui rate son plaquage reste étalé une seconde (C).

**Le javelot** (R)
- Son but : rester loin. Il recule en gardant le Pisteur dans sa ligne de vue ; il ne s'arrête que pour armer son tir (C).
- Le recul : **3 pas**, hors de portée de dague (C) ; pas plus d'une fois toutes les 6 secondes (C) ; il se fait **du côté où le porte-dalle n'est pas**, pour ne pas tirer sur lui ; **ralenti de 40 %, il ne fait plus que 60 % de la distance** et le javelot reste à portée de dague.
- Le lancer : **1 seconde pour armer**, puis **le javelot vole vraiment** (on le voit partir de sa main et traverser la salle) ; le trait rouge se fige quand il lâche. Plus on est loin, plus on a de temps. **Un mur l'arrête.** Il lance **aussitôt après son recul**. **5 secondes entre deux lancers** (C).

**Le porte-dalle** (R)
- Il protège le javelot. **Sa charge ne s'évite pas** si on est à portée (une grande portée) : c'est la distance, ou un mur, qui protège. Elle sert à coller le Pisteur, pas à le blesser.
- **Il ne lève sa dalle qu'une fois la charge finie**, et le cercle rouge dure **une bonne seconde** : il reste toujours une demi-seconde de vraie liberté pour sortir du cercle (C). « Il faut pas essayer de rester à côté de la dalle. »
- Si le Pisteur sort du cercle à temps, la dalle reste plantée au sol et le porte-dalle se retrouve à mains nues (dit une fois pendant la discussion, R : « ce serait ça la stratégie » ; pas rediscuté ensuite).
- Il tourne la tête vers son javelot toutes les trois secondes environ : on ouvre quand il vient de regarder ailleurs (C).

**Le faucheur** (R)
- Dangereux devant, vulnérable derrière. **Attaqué dans le dos, il ne réagit pas dans l'instant** (six ou sept dixièmes : le temps d'un coup de dague), puis **volte** : il retombe face au Pisteur, à 2 pas, et lance **aussitôt** le grand fauchage. La volte ne fait aucun dégât ; elle se recharge en 5 secondes (C).
- Le grand fauchage : un demi-cercle rouge de 3 pas pendant **1 seconde** (il suit le Pisteur la première moitié, puis se fige). **À pied, on ne peut en sortir que vers l'extérieur** (le bord est à un pas derrière soi ; attention quand on a le dos au mur). **Au saut, on traverse** et on retombe dans son dos.
- Après son coup, **il met presque une seconde à ramener sa faux** : esquiver donne son tour au joueur.
- Le coup de base : environ un par seconde quand on reste devant lui.

**Le mortier** (R)
- Le seul qui n'a qu'un coup. Le rond rouge reste **1,5 seconde** là où était le Pisteur : il faut rester en mouvement, un mur ne protège pas.
- **L'embuscade le tue net.** Toute sa difficulté est d'arriver jusqu'à lui : **il est toujours bien gardé, jamais seul**.

**Le bélier** (R)
- « Celui qui t'envoie valser. » **Devant lui**, le coup de tête part en moins d'une demi-seconde ; le Pisteur vole à 4 ou 5 pas (au milieu des chiens, dans la ligne du javelot, ou derrière un mur) et **reprend la main dès qu'il retombe**, sans être sonné.
- **Derrière lui**, on est tranquille une seconde et demie, le temps de son demi-tour. La règle : **ne jamais rester devant**.
- La charge : la bande rouge dure **1 seconde** et **ne démarre que quand le Pisteur est retombé** ; il fonce tout droit sans pouvoir tourner. S'il rate et percute un mur, il reste sonné 2 secondes (C).

**Le cuirassé** (R)
- **À découvert, la dague et la dague circulaire ne lui font rien** : on entend « ting ting ting », des étincelles, et sa barre de vie ne bouge pas. Le joueur comprend tout seul qu'il faut trouver autre chose.
- Ce qui le blesse : **l'embuscade** (trois embuscades), ou **les rouges des autres golems** : le lancer du javelot, la charge du bélier, l'obus du mortier, le grand fauchage, l'onde. Pas les morsures des chiens.
- Il n'est pas dangereux tout seul : il prend de la place et cogne pendant que les autres tirent. Il donne une raison de garder un bélier vivant.

**Le colosse** (R)
- **Un seul à la fois, en fin de vague.**
- L'onde : **un grand demi-disque rouge devant lui pendant 1,5 seconde**, arrêtée par les murs ; **le rouge ne se dessine pas derrière les murs**, on voit les poches où on est à l'abri (C). Trois sorties : derrière un mur, dans son dos, hors de portée. (Avant : une onde tout autour, que seul un mur évitait.)
- Le plus lent à réagir : depuis l'ombre, l'embuscade et deux coups de dague avant qu'il bouge.

### 17.17 Les combats qui ont servi à régler les chiffres
**La meute, trois ou quatre chiens** (R)
- **Bien joué** : on arrive dans l'ombre, par-derrière ; embuscade sur un chien (30 : mort) ; dague circulaire tout de suite (les autres tombent à 15 et sont ralentis) ; saut pour sortir du combat ; on se recache ; on revient, dague circulaire (elle est rechargée) : tous morts. **Zéro dégât.**
- **Mal joué** : ouvrir à la dague circulaire sans ressortir. Quatre chiens à 15, aucun mort, quatre morsures : **44 points**, « plus d'un tiers de ta vie ».

**Le duo javelot et porte-dalle** (R)
- Leur jeu : le porte-dalle charge et colle le Pisteur, puis l'assomme s'il reste ; le javelot recule d'un bond et lance aussitôt. Chacun sauve l'autre.
- **Ouvrir à l'embuscade sur le javelot** : 30, il lui reste 20, il crie et recule ; le porte-dalle se retourne et charge. Il faut éviter à la fois le trait du javelot (on ne peut pas courir vers lui : le trait part de lui) et le cercle de la dalle : on se décale, on perd du temps. Pour le finir : le saut (3 pas) et deux coups de dague ; mais on n'a plus le saut pour la dalle.
- **Ouvrir en assommant le javelot** : la série de dague (40) pendant ses 2 secondes ; **il se réveille avec 10 points**, recule et appelle (R : « je voulais laisser une chance au javelot de s'en sortir » ; et marteler le bouton ne doit pas suffire à le tuer). Pour le finir : le saut et un coup de dague.
- Deux parades malignes (C) : se placer pour que le porte-dalle soit entre soi et le javelot ; ralentir le javelot à la dague circulaire avant de le frapper.
- **Le mauvais enchaînement** : un javelot (40 et sonné 0,5 s), donc on ne sort pas du cercle, la dalle assomme 2 secondes ; au réveil, le javelot suivant n'est pas encore armé : on a perdu à peu près la moitié de sa vie, mais on rejoue.
- **Avec des chiens à côté**, « il vaut mieux se barrer » : on tue d'abord les chiens, en silence.

**Le faucheur** (R)
- Premier tour : embuscade (30) et un coup de dague (10) avant qu'il réagisse : il est à 40. Il fait sa volte et fauche ; on esquive. Deuxième tour, dans son dos : la série complète (40). Mort en deux tours.
- En ouvrant par le coup qui assomme : 40 aussi. Égalité : assommer n'est pas toujours le meilleur choix.
- Le meilleur coup : garder son saut pour traverser le fauchage et retomber dans son dos, sa volte vient de servir.

**Le bélier** (R) : embuscade (30) et deux coups de dague pendant son demi-tour (20) : il lui reste 30, le seuil de la tête de mort. Si on arrive à disparaître, on l'achève d'un coup ; sinon il faut une deuxième fenêtre dans son dos.

**Le cuirassé** (R) : par exemple une embuscade (30), une charge de bélier détournée sur lui (40), il lui reste 20 : la tête de mort s'allume, on l'achève depuis l'ombre.

### 17.18 Les vagues, Grosbec, les cartes
- **Autour de 40 golems** au lieu de 85 (R : moins nombreux, plus solides). **10 minutes visées, 15 au grand maximum** : inchangé.
- **L'ordre des premières vagues** (C) : la vague 1, les chiens seuls ; la vague 2, le duo seul ; la vague 3, le duo avec des chiens pas loin. Le reste est à écrire (le nombre de vagues n'a pas été redit).
- **Grosbec** reste le stratège qui compose les groupes (le mortier jamais seul). Son faisceau est supprimé. Ses ordres criés et ses plans de vague (§17.4) n'ont pas été rediscutés.
- **Les cartes** (§17.6) : **d'abord la bagarre de base, sans aucune carte** ; les cartes ne se réécrivent qu'une fois la bagarre validée par Romain (C ; Romain : « peut-être qu'on va tout modifier »). Les quatre familles tiennent. **Sautent** : tout ce qui parle d'alerte, de témoins, du regard de Grosbec, de l'arc à découvert, des cœurs. **À inventer** : autour des trois rangs de la dague, de la tête de mort, du saignement. Une carte dorée toute trouvée : **entrer dans l'ombre en plein combat** (la bombe fumigène de Valeera). D'autres idées tirées de ses talents : le document des décisions orales de l'après-midi.

### 17.19 Ce qui reste de la version 4, ce qui est jeté
- **Reste** : la salle, sa lumière et ses obstacles (`salle.js`, `monde.js` : les murs, les chemins, « qui voit qui ») ; le Pisteur cuit sous 8 angles (`sprites.js`) ; les golems et Grosbec ; la mesure de l'appareil et **la règle des 24 images par seconde** (§17.7) ; la page, les menus, les sons.
- **Jeté** : la garde « calme / alerte / recherche » partagée par tous, les témoins, les golems qui viennent voir après un assassinat ; le regard de Grosbec ; les cœurs ; l'arc à découvert ; les vies et les vitesses ; les 8 vagues de 85 golems ; le javelot qui va rechercher son javelot (pas rediscuté).
- **À réécrire plus tard** : les cartes ; l'écran d'explication en images.
- **Des poses du Pisteur manquent** : la dague circulaire, le coup qui assomme, le troisième coup de dague avec son élan, plaqué au sol, sonné.

### 17.20 Ce qui n'a pas été tranché (avec le point de départ proposé par Claude)
1. **La vie du porte-dalle** : proposé 80, comme le faucheur et le bélier.
2. **Des dégâts** : le coup de pique du javelot (proposé 5) ; l'obus du mortier (proposé 30) ; le plaquage lui-même (proposé 0 : ce sont les morsures qui coûtent) ; la flèche tirée depuis l'ombre.
3. **L'arc dans l'ombre** : est-ce que tirer fait sortir de l'ombre ? Proposé : la règle du bruit (cible tuée net : non ; cible blessée : elle crie, ceux d'à côté viennent voir d'où ça vient).
4. **La durée de l'ombre** : proposé 8 secondes au plus le matin, pas rediscuté. Sans le faisceau de Grosbec, plus rien n'oblige à sortir de l'ombre : il faut une limite ou une pression (une durée, ou une vague qui finit par se regrouper).
5. **La recharge du coup qui assomme** : Claude proposait une douzaine de secondes ; Romain a préféré lui enlever ses dégâts. À voir à l'essai s'il faut les deux.
6. **Les temps de recharge du saut, du saut d'ombre, de la charge du porte-dalle** ; **la durée du ralentissement** de la dague circulaire (proposé 1,5 s) ; la portée de la charge du porte-dalle.
7. **Tomber à zéro** : proposé de recommencer seulement la vague en cours, barre pleine (question posée, pas de réponse).
8. **Les vitesses** : proposé le matin 3,6 pas par seconde pour le Pisteur (2,8 dans l'ombre) au lieu de 5,4 ; les golems un peu moins vite que lui.
9. **Le regard des golems à découvert** (portée, largeur) : point de départ, celui de la version 4.
10. **Les murs bas** cachent-ils le Pisteur des golems ? Oui dans la version 4 (un choix de Claude), et l'échappée de Romain (« on saute par-dessus un mur ») le suppose.
11. **Les vagues** : leur nombre, leur contenu, les ordres de Grosbec.
12. **Les cartes** : tout est à reprendre après la bagarre de base.

### 17.21 L'ordre de construction
- Romain, 14 h 48, écrit : « Ok, mets à jour la Bible sur tout ce qu'on vient de dire. Et je vais faire avec une autre conversation la construction. » **La construction se fait dans une autre conversation, quand il la lance.**
- **D'abord la bagarre de base, sans aucune carte** (C) : les quatre boutons et leurs huit visages, l'ombre et ses deux mondes, ce que voient et entendent les golems, la barre de vie, puis les golems un par un avec leurs trois coups.
- **À mesurer avec des robots avant de rendre la main à Romain** (Claude ne peut pas sentir le jeu, il peut le mesurer) : les combats de §17.17 donnent bien les comptes annoncés (la meute sans un point de dégât avec le bon enchaînement, 44 points avec le mauvais) ; chaque rouge s'évite pour un joueur qui réagit en une demi-seconde ; le temps pour disparaître après avoir été vu (2 à 3 secondes, pas quatre tours de salle) ; la part du temps passée dans l'ombre ; la durée d'une partie ; et toujours **jamais sous 24 images par seconde** sur une vieille tablette.
