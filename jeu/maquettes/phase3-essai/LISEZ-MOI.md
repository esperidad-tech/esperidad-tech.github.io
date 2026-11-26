# La phase 3, maquette rapide — version 2 (27 novembre 2026, nuit) : EN LIGNE (page Claude), PAS ENCORE JOUÉE PAR ROMAIN

Contre Grosbec de lumière (enquête 10). D'après les décisions de Romain à la voix : **Bible § 18.16** ; ce qui est construit et
les choix de Claude : **Bible § 18.17**. Go de Romain (27 novembre, 0 h 25) : « Ok, vas-y, mets à jour la Bible et fais la
maquette. Tu as mon go et tu peux mettre en ligne. » La version 1 (vue de face, cartes à crier ; § 18.13, jugée « un peu
nulle ») est rangée telle quelle dans `v1/`.

**La page : https://claude.ai/artifact/HDzYniCakK9XCYZf9coGD3** (la même adresse que la v1 ; identifiant
`83629beb-4388-4f59-975a-59a2302d03b6` ; version 2 : `1795737107-084c`, en ligne le 27 novembre à 0 h 51). Rien sur le site.

Une maquette pour **juger le jeu, pas les images** : des formes simples, quelques petits sons (« tchac » quand ça porte,
« ping » quand ça rebondit, « boum » pour une zone, la fanfare du symbole).

## Comment on joue
- **Téléphone couché** (ou tablette). La salle vue d'en haut, en biais ; Grosbec de lumière au fond ; la lanterne à gauche, la
  statue cassée à droite, la fontaine devant.
- **Avant de jouer** : son héros ; **👤🤖🤖🤖 seul** (trois robots, pour essayer sans quatre tablettes) ou **📱📱📱📱 à quatre**
  (tout le monde tape le même numéro, puis le gros bouton jaune GO **tous ensemble**, après « 3, 2, 1 ») ; ▶.
- **Le pouce gauche** se pose où il veut sur la moitié gauche : le héros court. **Toucher une partie de Grosbec** la vise (un
  trait blanc autour) ; tous les sorts partent vers elle.
- **Les six boutons, sous le pouce droit** : le gros 🛡️ **bouclier** au milieu ; autour, 🔥 ❄️ 🧪 **les trois sorts** (3 s sur
  place) ; plus loin, ✚ **le soin** (2 s, +50) et ⤴ **le saut**. Bouger coupe un sort ; les éclairs, non.
- **En haut à gauche, le groupe** : mon portrait et ma vie, puis mes trois amis ; à côté de chacun, **la case de son symbole**.
  Toucher le portrait d'un ami ouvre la petite fenêtre des symboles (à la fin).
- **En haut à droite** : ↺ **On reprend** (puis le gros bouton jaune, tous ensemble), ⏸ les réglages.
- **Mode seul** : ce que mes robots me crient s'affiche **écrit**, dans une bulle au-dessus d'eux (« La fontaine ! », « Feu ! »,
  « Bras gauche ! », « Bouclier, vite ! », et leur symbole à la fin). Ce que **mon** villageois montre (en images), je le
  « crie » en **touchant le portrait de l'ami** (il clignote en jaune quand il y a quelque chose pour lui) ou **la bulle**
  elle-même ; l'endroit sûr, en touchant la bulle du villageois. Trop tard, et l'ami peut tomber.

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
- `tests/regles.js` : `node tests/regles.js verif` (100 909 vérifications, 0 souci) ;
  `node tests/regles.js parties=8 robots=0.9 pilote=bon|moyen` (des parties entières en mode seul).
- `tests/gestes.py` : les vrais gestes dans la page (le départ, le premier combat, le film, le bouton jaune, le pouce, viser,
  un sort coupé, le bouclier, relayer une info, une zone ratée en noir et blanc, On reprend, le symbole, la fenêtre, la fin) ;
  puis **quatre tablettes imitées** (téléphone, deux tablettes, un autre téléphone), même numéro, GO à la main : 31 vérifications sur 31.
- `tests/voir.py` (captures, mode seul, pilote) ; `tests/vitesse.py` (images par seconde sur un téléphone ralenti 4 fois).
- `v1/` : la version 1 (Bible § 18.13), telle quelle.

## Les mesures (version 2)
- **Mode seul, pilote « bon », robots attentifs (95 %)** : gagné 6 fois sur 8, en **5 min 50** en moyenne ; robots à 90 % :
  7 sur 8, 6 min 30 ; pilote « moyen » et robots à 90 % : 3 sur 8, 8 min. Le pilote ne sait pas lever le bouclier « au cas
  où » ni deviner : un enfant fera autrement. La vie de Grosbec « ≈ 6 min » = 30 sorts justes.
- **Quatre tablettes imitées** : 0,65 s d'écart au plus entre elles pendant 38 s (avec des appuis faits à la main, l'un après
  l'autre) ; chaque info sur une seule tablette ; jamais chez celui qu'elle concerne.
- **Vitesse** : 45 à 57 images par seconde sur un téléphone ralenti 4 fois (navigateur sans carte graphique). **Pas vérifié sur
  un vrai appareil.**

## Pour remettre la page en ligne après un changement
`python3 construire.py`, puis publier `phase3.html` comme `index.html` de la page Claude
`83629beb-4388-4f59-975a-59a2302d03b6` (outil `publish_files`, avec la dernière version comme `base_version`).
