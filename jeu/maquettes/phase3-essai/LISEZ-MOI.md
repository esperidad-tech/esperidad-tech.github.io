# La phase 3, maquette — version 4 (27 novembre 2026, 2 h 43) : EN LIGNE (page Claude), PAS ENCORE JOUÉE PAR ROMAIN

Contre Grosbec de lumière (enquête 10). D'après les décisions de Romain à la voix : **Bible § 18.16** (la phase 3 refaite),
§ 18.17 (la v2), § 18.18 (la v3 : tout l'écran, une seule bulle), **§ 18.19 (la v4 : ce qui a été décidé à la voix après la v3,
et ce qui est construit)**. Go de Romain (27 novembre, 2 h 03) : « vas-y, fais-moi la version définitive […] tu mets le paquet
sur les effets […] je veux que Grosbec il ait vraiment des animations […] qu'il soit un peu en 3D, qu'il se tourne, qu'il bouge,
qu'il fasse des réactions […] Tu as mon go et tu peux mettre en ligne. » La version 1 est rangée telle quelle dans `v1/`.

**La page : https://claude.ai/artifact/HDzYniCakK9XCYZf9coGD3** (la même adresse depuis la v1 ; identifiant
`83629beb-4388-4f59-975a-59a2302d03b6` ; version 4 : `1795743788-31b5`, en ligne le 27 novembre à 2 h 43 ; la v3 était
`1795739558-67f5`). Rien sur le site.

**Ce qui change en version 4** :
- **Les règles** (décidées à la voix) : l'endroit sûr est annoncé **6 s** avant la frappe (au lieu de 4) ; **plus d'éléments** :
  chaque héros n'a qu'**une attaque**, la sienne ; **la faiblesse est la même pour toute l'équipe** : une partie de Grosbec ;
  **sur une seule tablette, cette partie bouge** (elle tremble, se fendille de lumière blanche et dorée, crache des étincelles) ;
  celui qui la voit la crie à tous ; **une attaque sur la mauvaise partie rebondit et revient sur celui qui l'a lancée : 15**
  (un éclair fait 10 ; le bouclier arrête le rebond). À droite, **trois boutons** : l'attaque (la tête de mon héros), le soin,
  le saut ; à gauche, le pouce et le bouclier au-dessus.
- **Grosbec en volume** (`src/grosbec.js`) : un géant d'énergie rouge et or, comme l'armure du combat du Pisteur — un squelette
  dans l'espace (il se tourne, se penche, plie les genoux ; les coudes et les genoux se placent tout seuls), un corps de lumière
  (les bords brillent, le dedans est rouge et transparent, l'énergie coule dans les membres), des épaules de lumière couronnées
  de flammes, une crinière de flammes, des yeux de feu blanc, le cœur qui bat, deux anneaux d'énergie qui tournent autour de
  lui (une moitié derrière son corps, une moitié devant), une cape de lumière, des éclairs qui le parcourent, des braises qui
  montent, des flammes sous les pieds, son reflet dans le sol. **Un geste pour chaque chose** : il respire, flotte, suit mon
  héros de la tête ; il lance ses éclairs d'un coup de main ; il prépare la grosse zone (il s'élève, ouvre les bras, serre une
  boule d'énergie, l'abat sur le sol) ; il pointe le visé de la méga attaque (seulement chez celui qui prévient) ; il tambourine
  à la fin du premier combat ; il encaisse un coup juste **différemment selon la partie** (la tête part en arrière, il se plie
  en deux, le bras touché est rejeté, la jambe touchée plie) ; il chasse un sort qui rebondit d'un revers de main, **et il rit** ;
  il titube quand ma barre tombe à zéro ; à la fin, il se cambre et se défait en lumière.
- **Les effets** (`src/effets.js`, `src/dessin.js`) : l'attaque de chaque héros (la flèche de lumière du Pisteur, la fiole qui
  tourne de l'Alchimiste, les ondes et les notes du Barde, la rune du Sage), sa charge (un cercle de runes au sol, la lumière qui
  vient dans les mains), l'éclat quand ça porte (étincelles, morceaux d'énergie, onde, l'écran qui tremble, la barre qui
  tremble), le bouclier d'or en hexagones quand ça rebondit, le retour sur le héros ; les éclairs en zigzag avec leurs
  branches ; pendant l'annonce de la grosse zone, **des veines rouges courent sur tout le sol** (rien ne dit où se mettre) ; à la
  frappe, **le sol jaillit en flammes partout sauf à l'endroit sûr**, en partant de ses pieds ; le rayon de la méga attaque ;
  la bulle d'hexagones du bouclier ; le soin ; le saut.
- **La qualité baisse toute seule** si l'appareil n'arrive pas à suivre (moins fin, Grosbec repeint moins souvent, sans reflet,
  moins d'étincelles) : 3 niveaux.

## Comment on joue
- **Téléphone couché** (ou tablette). La salle vue d'en haut, en biais, sur tout l'écran ; Grosbec au fond ; la lanterne à
  gauche, la statue cassée à droite, la fontaine devant.
- **Avant de jouer** : son héros ; **👤🤖🤖🤖 seul** (trois robots) ou **📱📱📱📱 à quatre** (le même numéro, puis le gros
  bouton jaune GO tous ensemble) ; ▶.
- **À gauche** : le pouce (où on veut sur la moitié gauche) fait courir ; **juste au-dessus, le gros 🛡️ bouclier**.
- **Toucher une partie de Grosbec** la vise (un réticule blanc qui tourne) ; mon attaque part vers elle.
- **À droite** : la grosse **attaque** (3 s sur place), le **soin** ✚ (2 s, +50) à sa gauche, le **saut** ⤴ au-dessus. Bouger
  coupe l'attaque ou le soin ; les éclairs, non.
- **La partie faible** : sur MA tablette, quand c'est à moi de la crier, elle bouge sur Grosbec pendant 6 s. **En mode seul**,
  la toucher la vise **et la crie** aux robots. Ce qu'un robot me crie s'affiche écrit dans une bulle (« Bras gauche ! »).
- **Une seule bulle à la fois** (v3) : celle de mon villageois en images (l'endroit sûr ; le bouclier pour un ami) ou, en mode
  seul, ce qu'un robot me crie. L'endroit sûr passe avant tout et reste jusqu'à la frappe. En mode seul : l'endroit sûr se crie
  en touchant la bulle ; la méga attaque d'un ami, en touchant son portrait (il clignote) ou la bulle.
- **En haut à gauche, le groupe** (portraits, ma vie, les cases des symboles) ; **en haut à droite** ↺ On reprend, ⏸ réglages.

## Le déroulé
1. **Le premier combat** : seulement les éclairs, très forts ; pas de bouclier ; une minute, puis Grosbec tambourine et en 10 s
   tout le monde tombe.
2. **Le film d'Odette** (8 s, sans un mot). Puis **le gros bouton jaune GO**, tous ensemble.
3. **Le deuxième combat** : d'abord la partie faible, à 30 s les grosses zones, à 60 s les méga attaques ; ça se resserre en
   3 min 30, puis ça accélère doucement (jamais deux zones annoncées en même temps : au moins 7 s entre deux). Ma barre à zéro :
   mon symbole en grand, mon attaque grise, je tiens en soutien ; les quatre cases justes : Grosbec se défait en lumière, puis ✨.

## Le menu ⏸ (gardé d'une partie à l'autre)
Les éclairs du deuxième combat (0, 5, **10**, 15, 20 par éclair, un toutes les 2 s) ; ceux du premier (20, **30**, 40) ;
le bouclier revient après **10**, 15 ou 20 s ; la vie de Grosbec (≈ 3, **≈ 6**, ≈ 9 min : 22, **45**, 65 coups justes) ; mes
robots (**attentifs**, un peu distraits, distraits, dans la lune) ; commencer par **le 1er combat**, le 2e, ou le 2e au plus
dur (3 min 30) ; les sons.

## Ce qu'il y a ici
- `phase3.html` : la maquette en un seul fichier (l'`index.html` de la page Claude), fabriquée par `python3 construire.py`.
- `src/regles.js` : **toutes les règles, sans dessin** (tourne dans node). Tous les chiffres dans `REG`, marqués (R) Romain ou
  (C) Claude. `suite(partie)` : la suite partagée des 20 minutes (la faiblesse commune, les zones, les méga attaques, et qui
  montre quoi : chacun autant, la méga attaque jamais chez le visé) ; aucun `Math.random` dedans. `partMontree`, `relayerPart`
  (v4). Les robots du mode seul. « On reprend ».
- `src/pilote.js` : un pilote automatique pour mon héros (les essais seulement ; `window.__pilote`). Il ne tape que quand il
  connaît la partie faible, l'oublie dès que ça rebondit, tente au hasard au bout de 10 s.
- `src/grosbec.js` : **Grosbec en volume** (le squelette, la pose, les gestes, le corps de lumière, peint dans sa propre toile).
- `src/effets.js` : les étincelles, les ondes, les notes, les éclats, l'écran qui tremble.
- `src/dessin.js` : la salle (peinte une fois), le décor, les héros et leurs attaques, les éclairs, la grosse zone, le rayon,
  la bulle, le haut de l'écran, le film.
- `src/ecrans.js` : le départ, le pouce, les quatre boutons, le groupe et le code, le gros bouton jaune, la pause, la fin, les
  sons, **la qualité qui baisse toute seule** ; l'horloge des quatre tablettes. `window.__p3` pour les essais.
- `tests/regles.js` : `node tests/regles.js verif` (75 778 vérifications, 0 souci ; en v4 : une seule info par faiblesse, la
  partie et l'endroit sûr pour tous, 6 s d'annonce, jamais deux zones en même temps, l'attaque juste, le rebond qui revient (15)
  et que le bouclier arrête, la partie faible jamais dans une bulle, la toucher la crie aux robots) ;
  `node tests/regles.js parties=8 robots=0.95 pilote=bon|moyen` (des parties entières en mode seul).
- `tests/gestes.py` : la mise en page sur cinq écrans couchés ; les vrais gestes (dont : toucher la partie qui bouge la vise et
  la crie ; la méga attaque d'un ami relayée par son portrait ; Grosbec qui tombe avant l'écran de fin) ; quatre tablettes
  imitées : **45 vérifications sur 45**.
- `tests/voir.py` (captures dans `/tmp/p3v4` : le tambour, le film, la partie faible, un coup juste, un rebond, l'annonce et la
  frappe de la zone, la méga attaque, la charge, l'attaque en vol ; grand iPhone, iPhone, tablette) ;
  `tests/vitesse.py` (images par seconde, sans ralenti puis sur un téléphone ralenti 4 fois).
- `v1/` : la version 1 (Bible § 18.13), telle quelle.

## Les mesures (version 4)
- **Mode seul** (vie « ≈ 6 min » = 45 coups justes) : pilote « bon », robots attentifs : **8 sur 8, en 5 min 35** en moyenne ;
  robots à 90 % : 8 sur 8, 6 min 10 ; pilote « moyen » : 8 sur 8, 7 min 25. Le pilote ne devine pas comme un enfant.
- **Quatre tablettes imitées** : chaque info sur une seule tablette ; elles restent calées (moins de 1,2 s avec les appuis à la main).
- **Vitesse** (navigateur sans carte graphique, le pire cas) : 47 à 60 images par seconde sans ralenti ; sur un téléphone ralenti
  4 fois, la qualité descend toute seule et ça remonte à 20 à 36. **Pas vérifié sur un vrai appareil** : un iPhone dessine avec
  sa carte graphique, ce devrait être bien plus fluide ; une vieille tablette, à voir.

## Pour remettre la page en ligne après un changement
`python3 construire.py`, puis publier `phase3.html` comme `index.html` de la page Claude
`83629beb-4388-4f59-975a-59a2302d03b6` (outil `publish_files`, avec la dernière version comme `base_version`).
