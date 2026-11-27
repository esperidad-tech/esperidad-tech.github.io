# Essai en vraie 3D — le Barde dans la salle de l'armure (27 novembre)

Pourquoi : Romain trouve les combats « bricolés » sur grand écran (fond flou, héros en image
plate qui ne prend pas la lumière, trop peu de poses). Cet essai teste une autre façon de faire,
à la manière des vieux Resident Evil / Final Fantasy VII :

- le décor reste une **grande image calculée dans Blender** (`combat-armure/decor3d/essai3d.py`,
  échelle 1,5 : 2580 × 1668, une fois et demie plus fin que le jeu), avec en plus **sa profondeur**
  (à quelle distance est chaque point) ;
- le héros est un **vrai personnage 3D articulé**, éclairé en direct par les braseros, les
  lanternes, la fente de lumière, et qui passe **derrière** les choses du décor grâce à la
  profondeur ;
- la caméra du navigateur est exactement celle de Blender (vue de biais, même angle).

Rien de tout ça n'est dans le jeu. C'est un essai, à montrer à Romain, sans « go » pour la suite.

**En ligne (page Claude, hors du jeu)** : https://claude.ai/artifact/4HpT1KZxu5ZvcuDkELP7rP
(identifiant `1aa48eb1-9b62-479d-b64a-5d4f2246ab88`, version `1795806399-5c74`). Pour republier : `publish_files` des fichiers
de `site/` (index.html, essai3d.js, fond.jpg, prof.png, *.json), `base_version` = la version en ligne.
**Piège de la page Claude** (vu par Romain : un ⚠ à la place du jeu) : elle ne sert pas les `.glb`, et
elle interdit à la page de « télécharger » une adresse `data:` (fetch). Un glTF avec ses données en
`data:` ne se charge donc pas. Solution : chaque `.glb` est rangé tel quel en base64 dans un `.json`
(`outils/englb.py`) ; la page le lit avec `fetch` (ses propres fichiers sont permis), le décode et le
donne à `GLTFLoader.parse` ; les images du modèle passent par `<img>` (adresse `blob:`, permise), grâce
au petit greffon `images_par_img` de `src/main.js`. Les `.glb` sont gardés dans `origine/glb/`.
Pour vérifier avant de publier : `python3 serveur_csp.py <dossier> 8766` (un serveur qui imite ces
règles) puis `python3 voir_csp.py`.

## Comment le Barde 3D a été fait (Higgsfield, environ 71 crédits)

1. Une image propre du Barde en trois vues (face, profil, dos) avec Nano Banana 2 (4 crédits) :
   `origine/barde-image-a.png`, `origine/barde-image-b.png`, découpe : `origine/vues.png`.
   Modèle de départ : le Barde du jeu, `origine/barde-ref.png`.
2. Image → modèle 3D texturé et articulé (Meshy « multi image to 3D », 35 crédits) :
   `origine/barde-base.glb` (12 Mo, l'original : **ne pas jeter**, il coûte des crédits).
   Les quatre sorties « squelette + mouvement » telles que Higgsfield les rend : à refaire depuis
   `barde-base.glb` si besoin (elles ont toutes les mêmes noms d'os).
3. Quatre mouvements pris dans la bibliothèque d'animations (8 crédits chacun) :
   repos (0 Idle), course (14 Run_02), sort de feu (125 Charged_Spell_Cast),
   sort de glace (132 mage_soell_cast_3).
4. `outils/outils.mjs base` : textures en WebP 1024 → `origine/glb/barde.glb` (2,3 Mo, avec le repos).
   `outils/outils.mjs anim` : on ne garde que le mouvement → `origine/glb/anim-*.glb` (quelques ko).
   `outils/englb.py` : chacun en `.json` pour la page (`site/`).

Attention au modèle Meshy : l'« Armature » est à l'échelle 0,01 (os en centimètres) ; le
personnage fait déjà 1,5 m. On le grossit juste à 1,55 pas, sans le mesurer.

## Refaire la page

```
cd outils && npm install
python3 ../../combat-armure/decor3d/essai3d.py 1.5 64   # le fond, les deux lanternes, leurs profondeurs (≈ 20 min sur deux cœurs)
python3 composer.py ../../combat-armure/decor3d/out/essai3d /tmp/compo   # fond + lanternes → compo.png, compo_prof.png
python3 empaqueter.py /tmp/compo.png /tmp/compo_prof.png ../site         # → fond.jpg + prof.png
npx esbuild ../src/main.js --bundle --format=iife --minify --outfile=../site/essai3d.js
cp ../src/index.html ../site/
```

Attention à l'échelle de Blender : 1 = l'image du jeu (1720 × 1112). 2 fait quatre fois plus de
points, 3 neuf fois plus : c'est très long sur deux cœurs.

`prof.png` : la profondeur sur 16 bits rangée dans le rouge (poids fort) et le vert (poids
faible), de 90 à 150 unités de Blender. Le fond l'écrit dans le tampon de profondeur
(`gl_FragDepth`), le héros 3D est donc caché par ce qui est devant lui. **Piège** : le fond doit
garder `depthTest: true` avec `depthFunc: AlwaysDepth` ; sans test, WebGL n'écrit pas du tout la
profondeur (le héros passait alors devant les lanternes). Les lueurs du décor (brasiers, lanternes)
sont dessinées sans test ; la lueur d'une note sur le sol est un carré posé à plat (un sprite debout
était coupé en deux par le sol). Les lumières des sorts sont prises dans une réserve de cinq lumières
éteintes : en ajouter une en plein jeu fait recalculer tous les dessins (un à-coup).

`voir.py`, `voir2.py`, `voir3.py` : photos d'écran automatiques (navigateur sans écran, servir
`site/` sur le port 8765) : vue d'ensemble et sort ; le héros de près dans les quatre directions ;
le héros derrière et devant les lanternes.

## Le luth (27 novembre, 17 h ; go de Romain à 16 h 45 : « commence par refaire le Barde comme on a dit »)

Décidé à la voix avec Romain : le luth **sur le dos quand il court**, **en main pour jouer** ; on **garde le Barde
de Higgsfield** (repos et course) ; le luth est **découpé du modèle** (aucun crédit) ; les deux gestes de sort de
Higgsfield sont remplacés par un geste fait par programme.

**La découpe** (`outils/luth/`, à lancer depuis `/tmp/luth` : `mkdir /tmp/luth && cp outils/luth/*.py /tmp/luth/`) :
1. `prof_dos.py <barde-base.glb>` : la profondeur du Barde vu de dos (Blender, par rayons) ;
2. `classer2.py` : la face du luth est une région lisse séparée du dos par des bords nets ; un triangle est
   « luth » s'il est dans cette région (élargie de 3 points) et à plus de 6 mm au-dessus du dos deviné
   (le dos sous le luth est deviné en lissant depuis le tour) ;
3. `chirurgie.py <barde.glb> <sortie.glb>` : enlève le luth du corps, **bouche les trous** (le grand trou du dos
   suit la courbe du dos devinée ; ses sommets prennent les os et poids du bord le plus proche, et **une seule
   couleur : celle de la chemise**, prise au milieu d'un triangle du dos — au bord des îlots de la texture, les
   couleurs sont mélangées) ; les petits morceaux qui ne tenaient qu'au luth (le bout du manche) passent au luth ;
   le luth devient un objet **à part, rigide**, nœud `luth` à la racine de la scène, dans le repère du modèle ;
4. `elaguer.mjs` puis `englb.py` → `origine/glb/barde-luth.glb`, `site/barde.json`.
`vues2.py` : photos du corps sans luth et du luth seul (`captures/dos-sans-luth.png`).

**Le geste** (`src/main.js`, « le luth ») : tout se calcule dans le repère du modèle (glTF : y en haut, il regarde
vers +z, sa gauche vers +x).
- Au chargement, le luth est accroché à l'os `Spine` (il suit le haut du dos en courant).
- Pendant un sort : la main droite monte par-dessus l'épaule droite attraper le manche (0,25 s), le luth passe
  par-dessus l'épaule et vient devant le ventre (0,4 s), la main gauche prend le manche, la main droite glisse
  sur les cordes et gratte (4,5 allers-retours par seconde) ; de petites notes montent, une lueur grandit dans
  le luth ; **la note part du trou du luth à la fin du sort** (glace 1,5 s, feu 3 s, comme le jeu).
- Il garde le luth 0,9 s (pour enchaîner un autre sort sans le ressortir), puis le range ; s'il court, il le
  range en courant.
- Les bras sont guidés par la main (deux os, le coude tiré vers un côté choisi) ; le squelette n'a **pas d'os
  dans les doigts** : les doigts restent figés.
- **Piège** : le « repos » de Higgsfield fait tourner tout le corps (le bassin va de +8° à -80°) ; `redresser()`
  enlève cette rotation autour de la verticale (sinon il joue de profil).
- Pour les essais : `window.__pilote = true` puis `__essai.avancer(s)` fait avancer le temps du jeu pas à pas ;
  `window.__face = true` le tourne vers nous ; `window.__zoom` rapproche la caméra. `voir5.py` / `voir6.py`
  (le sort image par image, de face ou de dos), `voir7.py` (courir, lancer, repartir). Captures dans `captures/`.

## La main gauche et la marche (27 novembre, 17 h 55 ; Romain : « la main qui tient le manche, elle est complètement à côté » ; go 17 h 46)

**La main** : le bras était guidé par le **poignet** (l'origine de l'os de la main), pas par la paume : la main
flottait à côté du manche. Maintenant on vise la **paume** (7,5 cm plus loin le long de la main) et on **tourne
la main** (`orienter()`) : doigts = axe y de l'os ; paume = +x de l'os pour la main gauche, -x pour la droite
(au repos, les paumes regardent les cuisses, les pouces vers l'avant). Main gauche derrière le manche, paume
contre lui, doigts qui passent par-dessus ; main droite devant les cordes, paume vers elles, doigts vers le bas.
`voir8.py` : la main sous cinq angles (`captures/mains.png`).

**La marche** : « Casual_Walk » (n° 30) de la bibliothèque, 8 crédits (3d_rigging sur `barde-base.glb` déposé
chez Higgsfield, hauteur 1,5 m ; squelette presque identique, à quelques millimètres près) →
`origine/glb/anim-marche.glb`, `site/anim-marche.json`. `outils/pas.py` mesure la vitesse des pieds au sol :
marche 0,58 m/s, un cycle (deux pas) = 1,4 s (le film en contient trois) ; course 3,29 m/s, cycle 0,733 s.
Dans `src/main.js` (`locomotion()`) : vitesse = 3,6 × la poussée du pouce ; en dessous de 1 pas/s il marche,
au-dessus de 2 il court, entre les deux les deux mouvements se mêlent ; ils avancent **au même pas** (une
« phase » commune, le pied gauche posé au même moment) et à la vitesse réelle : les pieds ne glissent pas.
Au clavier : Maj + flèches = marcher. `voir9.py` : marche, entre-deux, course (`captures/allures.png`).

## La charge, la marche accélérée, le demi-tour, la main qui lance (27 novembre, 18 h 40 ; go 18 h 06)

Romain (à la voix) : la course « flotte », ce n'est plus la même ; il veut une vraie course (il a choisi **la charge**,
« Standard_Forward_Charge » n° 510), seulement le pouce au bord, toujours à son vrai rythme ; la marche (un peu
accélérée) pour le reste ; **un demi-tour** quand il court à fond et repart d'un coup dans l'autre sens ; et quand la
note part, **la main droite se tend vers la cible**. (Pour plus tard, ses choix : course rapide « RunFast » pour le
Pisteur, sprint penché « Lean_Forward_Sprint » pour l'Alchimiste, « Run_03 » peut-être pour le Sage.)

**Pourquoi ça flottait (deux erreurs de Claude)** :
1. Le « repos » était chargé deux fois (dans `barde.json` et dans `anim-garde.json`) : le second remplaçait le
   premier dans `actions`, mais le premier continuait de jouer **à plein poids**, en douce ; marche et course
   n'étaient appliquées qu'à moitié (pieds qui bougent à peine). Corrigé : l'ancien est arrêté, et `anim-garde.json`
   n'est plus chargé. `outils/compare.py` compare la pose du jeu et celle calculée depuis le fichier.
2. La vitesse valait 3,6 × la poussée au carré (le pouce à moitié : 4 fois moins vite), alors que le geste suivait
   3,6 × la poussée. Corrigé.

**Les allures** (`avancerHeros()`, `locomotion()`) : pouce de 15 % à 85 % : la marche, de 0,6 à 1 pas/s (le film de
1 à 1,7 fois sa vitesse) ; pouce au bord (85 %, on garde la course jusqu'à 75 %) : **la charge, 4 pas/s, à son
rythme** (3,95 m/s mesurés) ; la vitesse monte et descend vite (10 et 14 pas/s²) ; les jambes ne descendent jamais
sous 0,8 fois (marche) ou 0,85 fois (course) leur rythme : **jamais de ralenti**.
La charge et le virage de la bibliothèque **avancent tout seuls** (le bassin part devant) : `outils/surplace_glb.py`
les remet sur place (la charge : on retire 4,02 m/s ; le virage : le bassin gelé **à sa place de repos** — au début,
gelé à sa première image, il était décalé d'un mètre).

**Le demi-tour** (« Run_Sharp_Turn_Right » n° 581) : seulement en pleine course (plus de 3,2 pas/s) quand le pouce
part à plus de 140° ; on joue le morceau 0,35 → 1,2 s du film à 1,3 fois (0,65 s) ; il freine, pivote et repart ;
le pivot du film n'est que d'environ 90° : c'est le jeu qui tourne le corps d'un demi-tour (vers sa droite), le
bassin du film est redressé (`redresser()`), la vitesse suit celle mesurée dans le film. Pendant ces 0,65 s, le
pouce ne répond pas.

**La main qui lance** : quand la note part, la main droite quitte les cordes, se tend vers l'avant (vers la cible),
paume en avant (0,12 s pour monter, tenue jusqu'à 0,3 s, retour à 0,55 s), puis il range son luth.

**Vérifié autrement que sur des images fixes** : `outils/glisse.py` mesure, image par image, la vitesse des orteils
quand le pied est posé (elle doit être presque nulle) : marche 0,08 à 0,14 pas/s, course 0,2 pas/s (avant : 0,65,
et 1,8 dans la version que Romain a vue) ; `outils/film.py` fait de petits films en temps du jeu exact
(`captures/film-barde.mp4` : marche, course, demi-tour, sort).

## Le flamenco, le sort coupé, le dérapage, la note et sa portée (27 novembre, 20 h 05 ; go 19 h 38)

Romain (à la voix) : la course ne flotte plus (« très très bien ») ; mais la main qui lance ne se voit pas ; il veut
**un geste façon flamenco** (gratté très vite, « ta ta tan », et hop la main part) ; **pousser le pouce pendant le
sort doit le couper** (on doit pouvoir fuir) ; **le demi-tour ne doit pas faire perdre de temps**, et on avait
l'impression qu'il allait tomber ; et **le projectile doit être une note avec une traînée de lignes de partition**
(son image : `origine/reference/effet-note-romain.png`), penchée vers la caméra pour qu'on la reconnaisse.

- **Le sort coupé** (`annulerSort()`) : le pouce poussé pendant le sort : plus de sort, pas de note, il part tout de
  suite et range son luth en courant.
- **Le flamenco** : dans les 0,42 dernières secondes du sort, le grattage passe de 4,5 à 12,5 allers-retours par
  seconde et devient plus ample ; à la note, la main droite part **grand** (sur le côté, vers le haut, vers la cible :
  épaule + (-0,2 ; 0,17 ; 0,24) dans le repère du modèle), en 0,07 s, tenue jusqu'à 0,2 s, revenue à 0,38 s ;
  **un éclair** (lueur + lumière) sur la main (`eclairMain()`).
- **Le dérapage** remplace le virage de la bibliothèque (plus utilisé ; `origine/glb/anim-virage*.glb` gardés) :
  en pleine course, le pouce à plus de 140° : il part **tout de suite** dans l'autre sens (sa vitesse tombe à 65 %
  puis remonte en un instant) ; le corps pivote en 0,22 s, **penché vers où il repart** (le groupe `incline`, au-dessus
  de `barde`), et un peu de poussière ; le pouce répond tout de suite.
- **La note** : une croche brillante avec un bord foncé (pour qu'on reconnaisse sa forme, `texNoteBrillante`),
  bleue (glace) ou orange (feu), toujours face à la caméra ; derrière elle, **un ruban de cinq lignes de portée** qui
  ondule (`ruban()`), toujours de face (les lignes s'écartent perpendiculairement au trajet ET au regard de la
  caméra), qui s'efface vers la queue ; de petites notes posées sur la portée (et des flocons pour la glace)
  restent derrière et s'éteignent (`notePortee()`).
- Vérifié en films (`outils/film.py derapage | annule | jeu | tout`) : `captures/derapage.png`, `note-glace.png`,
  `note-feu.png`, `sort-coupe.png` ; les pieds ne glissent toujours pas (`glisse.py` : marche 0,1, course 0,18 pas/s).

## La note corrigée, le soin, le saut, l'acide (27 novembre, en ligne à 21 h 00, version `1795809626-1986` ; go de Romain à 20 h 42 : « Ok, vas-y, occupe-toi du barde »)

Ce que Romain avait dit à la voix (après 20 h 10) : la note est « décalée », « pas dans l'axe », et « les lignes de la
partition, elles sont devant elle » ; la faire un peu plus grande ; **le soin** : il gratte son luth **2 s**, puis
« des notes un peu partout qui brillent autour du personnage », **vertes** (il se soigne lui-même) ; **le saut** :
un vrai saut, **3 pas**, recharge **1,5 s** ; **l'acide** : une note verte « avec des petites gouttes qui tombent »,
d'un **jaune-vert qui pique** (pour ne pas la confondre avec le vert doux du soin ; Romain : « Ouais »).

- **La note** (`partir()`) : le centre du dessin est maintenant **la tête ronde de la note** (`n.center`), posée pile
  sur la ligne du milieu de la portée ; plus de petit tremblement en hauteur (il décalait la note de la portée) ;
  **la note est toujours dessinée par-dessus les lignes** (`renderOrder` : portée 2, halo 3, note 4) ; la portée part
  **de la tête de la note** (son premier point suit toujours la note, `ruban()`), sans vague contre elle.
  **Plus grande** : glace 1,2 (avant 0,95), acide 1,2, **feu 1,45** (la Bible : « une note de feu plus grosse »).
- **L'acide** (`SORTS.acide`, bouton 🧪, touche 3) : note jaune-vert à bord vert foncé, portée jaune-vert ; **des
  gouttes tombent de la note** (une toutes les 0,05 à 0,1 s, `goutte()`), et **grésillent** en touchant le sol : une
  petite flaque qui luit et s'éteint, deux bouffées de fumée qui montent en grossissant, trois bulles qui sautent
  (`gresille()`) ; à l'arrivée, l'acide **éclabousse** (14 gouttes). Temps de lancement : **1,5 s**, choisi par
  Claude en attendant que Romain décide (la Bible ne dit rien de l'acide du Barde).
- **Le soin** (`DUREE.soin` = 2 s, bouton 💚, touche 4) : il sort son luth et gratte 2 s **sans se tourner vers
  l'armure** (petites notes vertes qui sortent du luth, lueur verte dans la caisse) ; le flamenco de la fin, puis la
  main droite part **vers le ciel** (au lieu de vers la cible) ; alors `soigner()` : **24 notes vert doux**
  s'allument tout autour de lui (en 1 s, de ses pieds au-dessus de sa tête), tournent doucement, montent, scintillent
  et s'éteignent ; un rond de lumière verte s'élargit sous lui, une lueur verte l'entoure, une vraie lumière verte
  l'éclaire 1,5 s. Elles le suivent s'il repart. Pas de chiffre « +50 » : il n'y a pas de vie dans l'essai.
- **Le saut** (bouton 💨, touche espace ; `sauter()`, `avancerSaut()`) : un **vrai saut** Higgsfield, choisi parmi
  les sauts de la bibliothèque : **Jump_Over_Obstacle_2_inplace** (n° 642, 8 crédits ; un bond en avant genoux
  repliés, qui part et retombe en courant ; le « Regular_Jump » est un saut vertical, accroupi, trop lent ; les
  autres font des saltos). Le film dure 0,9 s ; il est joué **×1,2** (0,75 s) ; il quitte le sol à 0,08 s du film et
  retombe à 0,70 s : **le jeu le fait avancer de 3 pas pendant qu'il est en l'air** (vers où pousse le pouce, sinon
  devant lui). Il s'arrête au bord d'un mur, de l'armure ou d'une lanterne (« on ne saute pas par-dessus les
  colonnes »). **La recharge : 1,5 s** depuis le moment où on touche le bouton ; le bouton se remplit d'ombre et se
  vide pendant la recharge. Un saut coupe le sort en cours. À l'atterrissage : de la poussière, **9 petites notes
  dorées qui rebondissent** autour de ses pieds, un éclair doré au sol. Pouce toujours poussé : il repart en courant
  sans s'arrêter. Mesuré : 3 pas en une demi-seconde environ, les pieds montent jusqu’à 0,72 pas du sol.
- **Les cinq boutons** (à droite) : 🔥 feu (le gros), ❄️ glace à sa gauche, 🧪 acide au-dessus, 💚 soin au-dessus
  du feu, 💨 saut tout à gauche de la rangée. Ce n'est pas encore l'interface du combat du Pisteur.
- Fichiers : `origine/glb/anim-saut.glb` (le mouvement seul), `site/anim-saut.json` (le même en base64) ;
  vérifié avec `outils/essai_sorts.py` (sous la règle de sécurité du téléphone) et `outils/film.py nouveaux`
  (`captures/film-nouveaux.mp4`, `captures/note-centree.png`, `soin.png`, `saut.png`, `acide.png`).
- Crédits : 8 de plus (le saut) : **103 en tout** pour l'essai.

## Ce qui n'est pas fait

- L'armure de Grosbec n'est pas en 3D (la création de son image de référence a été bloquée
  pendant l'essai ; il faut le « go » de Romain pour la faire, ≈ 40 crédits). Les notes
  partent vers le centre du cercle, là où l'armure se tiendra.
- Le fond (`out/essai3d/`, `site/fond.jpg`, `site/prof.png`) se refait avec `essai3d.py`.
- La vitesse sur un vrai téléphone n'est pas mesurée.
- Le bouclier de la phase 3 (3 s, recharge 10 s) : évoqué à la voix, Romain n'a pas répondu : pas fait.
- L'ennemi de la phase 3 a changé dans une autre conversation : plus tard (Romain : « on va s'occuper d'abord de Grosbec et de la phase 2 »).
