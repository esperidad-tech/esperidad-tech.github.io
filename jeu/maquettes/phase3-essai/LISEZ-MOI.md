# La phase 3, maquette rapide — version 3 (27 novembre 2026, 1 h 32) : EN LIGNE (page Claude), PAS ENCORE JOUÉE PAR ROMAIN

Contre Grosbec de lumière (enquête 10). D'après les décisions de Romain à la voix : **Bible § 18.16** ; la version 2 et les
choix de Claude : **Bible § 18.17** ; **les corrections de la version 3 : Bible § 18.18** (Romain, après avoir essayé la v2 :
« Vas-y, fais la correction. », 27 novembre, 1 h 12). La version 1 (vue de face, cartes à crier ; § 18.13, jugée « un peu
nulle ») est rangée telle quelle dans `v1/`.

**La page : https://claude.ai/artifact/HDzYniCakK9XCYZf9coGD3** (la même adresse depuis la v1 ; identifiant
`83629beb-4388-4f59-975a-59a2302d03b6` ; version 3 : `1795739558-67f5`, en ligne le 27 novembre à 1 h 32 ; la v2 était
`1795737107-084c`). Rien sur le site.

**Ce qui change en version 3** (ce que Romain a demandé après la v2) : le combat prend **tout l'écran** du téléphone couché
(le mur et le sol vont d'un bord à l'autre) ; **une seule bulle à la fois**, et seulement ce qui me concerne ; **un seul
endroit sûr annoncé à la fois** ; **à gauche** le pouce qui court avec **le bouclier juste au-dessus** ; **à droite** les trois
sorts, le soin et le saut.

Une maquette pour **juger le jeu, pas les images** : des formes simples, quelques petits sons (« tchac » quand ça porte,
« ping » quand ça rebondit, « boum » pour une zone, la fanfare du symbole).

## Comment on joue
- **Téléphone couché** (ou tablette). La salle vue d'en haut, en biais, **sur tout l'écran** ; Grosbec de lumière au fond ; la
  lanterne à gauche, la statue cassée à droite, la fontaine devant.
- **Avant de jouer** : son héros ; **👤🤖🤖🤖 seul** (trois robots, pour essayer sans quatre tablettes) ou **📱📱📱📱 à quatre**
  (tout le monde tape le même numéro, puis le gros bouton jaune GO **tous ensemble**, après « 3, 2, 1 ») ; ▶.
- **À gauche** : **le pouce** se pose où il veut sur la moitié gauche (un rond pâle en bas à gauche montre la place) : le héros
  court. **Juste au-dessus, le gros 🛡️ bouclier.** **Toucher une partie de Grosbec** la vise (un trait blanc autour) ; tous les
  sorts partent vers elle.
- **À droite, sous le pouce** : 🔥 ❄️ 🧪 **les trois sorts** en arc près du coin (3 s sur place) ; un cran plus loin, ✚ **le
  soin** (2 s, +50) et ⤴ **le saut**. Bouger coupe un sort ; les éclairs, non.
- **En haut à gauche, le groupe** : mon portrait et ma vie, puis mes trois amis ; à côté de chacun, **la case de son symbole**.
  Toucher le portrait d'un ami ouvre la petite fenêtre des symboles (à la fin).
- **En haut à droite** : ↺ **On reprend** (puis le gros bouton jaune, tous ensemble), ⏸ les réglages.
- **Une seule bulle à la fois** (v3). Ce que **mon** villageois montre (en images) : une bulle au-dessus de lui. En mode seul,
  ce qu'un robot me crie s'affiche **écrit**, dans une bulle au-dessus de lui (« La fontaine ! », « Feu ! », « Bras gauche ! »,
  « Bouclier, vite ! », et son symbole à la fin). **L'ordre** : l'endroit sûr passe avant tout (il coupe la bulle en cours, qui
  reviendra) et reste jusqu'à la frappe, jamais après ; puis le bouclier ; puis ce que je dois crier à un ami ; puis ce qu'on me
  crie ; chaque bulle reste au moins 1,8 à 2,2 s avant de laisser la place. Un élément ou une partie qu'un robot me crie attend
  son tour tant qu'il est encore vrai (12 s au plus). La bulle ne passe jamais sous un bouton.
- **Mode seul, crier** : ce que montre **la bulle de mon villageois**, je le « crie » en **touchant le portrait de l'ami** (il
  clignote en jaune) ou **la bulle** elle-même ; l'endroit sûr, en touchant la bulle. Seulement ce que la bulle montre.
  Trop tard, et l'ami peut tomber.

## Le déroulé
1. **Le premier combat** : seulement les éclairs, très forts ; ni acide ni bouclier ; une minute, puis Grosbec tambourine et en
   10 s tout le monde tombe.
2. **Le film d'Odette** (8 s, sans un mot) : Odette et quatre villageois arrivent, les pierres brillent, les héros se relèvent,
   l'acide apparaît. Puis **le gros bouton jaune GO**, tous ensemble.
3. **Le deuxième combat** : d'abord la faiblesse (le sort et la partie), à 30 s les grosses zones, à 60 s les méga attaques ;
   ça se resserre en 3 min 30, puis ça accélère doucement, sans fin. Ma barre à zéro : mon symbole en grand, mes sorts gris,
   je tiens en soutien ; les quatre cases justes : ✨.

## Le menu ⏸ (gardé d'une partie à l'autre)
Les éclairs du deuxième combat (0, 5, **10**, 15, 20 par éclair, un toutes les 2 s) ; ceux du premier (20, **30**, 40) ;
le bouclier revient après **10**, 15 ou 20 s ; la vie de Grosbec (≈ 3, **≈ 6**, ≈ 9 min) ; mes robots (**attentifs**, un peu
distraits, distraits, dans la lune) ; commencer par **le 1er combat**, le 2e, ou le 2e au plus dur (3 min 30) ; les sons.
À quatre tablettes, le combat continue pendant le menu (les tablettes doivent rester calées).

## Ce qu'il y a ici
- `phase3.html` : la maquette en un seul fichier (l'`index.html` de la page Claude), fabriquée par `python3 construire.py`.
- `src/regles.js` : **toutes les règles, sans dessin** (tourne dans node). Tous les chiffres dans `REG`, marqués (R) Romain ou
  (C) Claude ; les réglages du menu dans `DEFAUT`. `suite(partie)` : la suite partagée des 20 minutes du deuxième combat
  (les faiblesses, les zones, les méga attaques, et qui montre quoi : jamais à soi-même, l'élément et la partie chez deux
  joueurs différents, chacun autant) ; aucun `Math.random` dedans. Les robots du mode seul. « On reprend ».
- `src/pilote.js` : un pilote automatique pour mon héros (les essais seulement ; `window.__pilote`).
- `src/dessin.js` : la vue en biais, en formes simples (Grosbec d'énergie, ses six parties, le décor, les bulles, le film).
- `src/ecrans.js` : le départ, le pouce, les boutons, le groupe et le code, le gros bouton jaune, la pause, la fin, les sons ;
  **l'horloge** : le temps suit l'heure depuis le dernier appui commun (pas le nombre d'images), pour que les quatre tablettes
  restent calées. `window.__p3` pour les essais.
- `tests/regles.js` : `node tests/regles.js verif` (101 355 vérifications, 0 souci ; en v3 en plus : une seule bulle, l'endroit
  sûr à l'écran moins de 2,2 s après l'annonce et jamais après la frappe, relayer seulement la bulle, la victoire quand ma barre
  tombe après les trois symboles des amis) ;
  `node tests/regles.js parties=8 robots=0.9 pilote=bon|moyen` (des parties entières en mode seul).
- `tests/gestes.py` : **la mise en page sur cinq écrans couchés** (grand iPhone 932×430, iPhone 852×393, petit iPhone 667×375,
  deux tablettes : le bouclier à gauche, le reste à droite, tout dans l'écran, rien ne se chevauche, aucun endroit sûr sous un
  bouton, le sol au bord du bas) ; puis les vrais gestes dans la page (le départ, le premier combat, le film, le bouton jaune, le
  pouce, viser, un sort coupé, le bouclier, une seule bulle, relayer une info, une zone ratée en noir et blanc, On reprend, le
  symbole, la fenêtre, la fin) ; puis **quatre tablettes imitées**, même numéro, GO à la main : 42 vérifications sur 42.
- `tests/voir.py` (captures dans `/tmp/p3v3` : grand iPhone, iPhone, tablette ; une bulle de chaque sorte) ;
  `tests/vitesse.py` (images par seconde sur un téléphone ralenti 4 fois).
- `v1/` : la version 1 (Bible § 18.13), telle quelle.

## Les mesures (version 3)
- **Mode seul, pilote « bon », robots attentifs (95 %)** : gagné 8 fois sur 8, en **5 min 40** en moyenne ; robots à 90 % :
  8 sur 8, 7 min 50 ; pilote « moyen », robots attentifs : 6 sur 8, 9 min 50. (En v2 : 6 sur 8 en 5 min 50 ; 7 sur 8 en
  6 min 30 ; 3 sur 8 en 8 min — mesures faites sur 8 parties : ça bouge de 2 d'un essai à l'autre.) Le pilote ne sait pas
  lever le bouclier « au cas où » ni deviner : un enfant fera autrement. La vie de Grosbec « ≈ 6 min » = 30 sorts justes.
- **Quatre tablettes imitées** : 0,52 s d'écart au plus entre elles pendant 38 s (appuis à la main, l'un après l'autre) ;
  chaque info sur une seule tablette ; jamais chez celui qu'elle concerne.
- **La salle** : sur un grand iPhone couché (932×430), elle fait 750 px de large sur 932 (le mur et le sol continuent jusqu'aux
  bords), le sol touche le bas, la tête de Grosbec est à 30 px du haut ; en v2 elle faisait 450 px (calcul refait avec la
  mise en page de la v2) : tout est environ 1,5 fois plus grand. Sur tablette,
  il reste du mur vide au-dessus de Grosbec.
- **Vitesse** : 30 à 50 images par seconde sur un téléphone ralenti 4 fois (navigateur sans carte graphique ; en v2 : 45 à 57 —
  l'écran dessiné est plus grand). **Pas vérifié sur un vrai appareil.**

## Pour remettre la page en ligne après un changement
`python3 construire.py`, puis publier `phase3.html` comme `index.html` de la page Claude
`83629beb-4388-4f59-975a-59a2302d03b6` (outil `publish_files`, avec la dernière version comme `base_version`).
