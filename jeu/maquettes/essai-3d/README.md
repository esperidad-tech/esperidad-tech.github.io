# Essai en vraie 3D — le Barde sur la place de nuit, le Pisteur dans la salle de l'armure (27 novembre)

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
(identifiant `1aa48eb1-9b62-479d-b64a-5d4f2246ab88`, version `1795837340-bbec` depuis l'armure refaite (bec), son attente Idle 02 et « Grosbec parle », 28 novembre 4 h 43). Pour republier : `publish_files` des fichiers
de `site/` (index.html, essai3d.js, fond.jpg, prof.png, *.json dont `armure.json` et `armure-parle.json`, et le dossier `nuit/` : fond.jpg, crev.jpg, crev-a.png, pilier-g.png, pilier-d.png, feu.jpg, arrivee.png, vague.mp4, vague.webm, et `nuit/cr/` : c, m, e, k de 00 à 19), `base_version` = la version en ligne. Les fichiers doivent être copiés sous `/home/claude` (l'outil refuse `/tmp`).
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

**Retouche du saut (27 novembre, en ligne à 21 h 15, version `1795810551-64cd` ; Romain à la voix : « juste après la fin du saut, il y a un petit arrêt, c'est bizarre » ; go écrit 21 h 13 : « Vas-y, fais la modif »)** :
la fin du film du saut (la réception sur place, 0,1 s ×1,2) le laissait immobile. Maintenant, **dès que ses pieds
touchent le sol, le pouce reprend la main** (`avancerSaut()` rend « en l'air » ; `avancerHeros()` reprend aussitôt) et la
réception est fondue dans la course en 0,1 s (`SAUT.sortie` = 0,70, `SAUT.fin` = 0,82). Pouce poussé : il court tout de
suite (5,1 pas/s en l'air, puis 4) ; pouce lâché : **un petit pas d'élan** (`SAUT.elan` = 2,5 pas/s, qui retombe en
0,2 s), puis il s'arrête. Il avance aussi **dès l'appel** (`SAUT.air[0]` = 0 : plus de petit arrêt au départ).
Mesuré image par image (`outils/essai_atterrir.py`) et vu (`outils/essai_atterrir2.py`, `captures/atterrissage.png`).

## Le Pisteur (27 novembre, en ligne à 21 h 54, version `1795812886-6397` ; go de Romain à 21 h 21 : « Ok, vas-y, tu peux t'y mettre »)

Ce que Romain a dit à la voix (vers 21 h 15) : faire les autres héros comme le Barde, en commençant par **le
Pisteur** ; « sa course différente » (la course rapide, RunFast, choisie plus tôt), « peut-être des sauts
différents », « les sorts, évidemment, c'est pas les mêmes » ; « il faut que ça soit logique : le Pisteur, c'est le plus
agile ; les autres sont un peu moins agiles » ; « je te laisse faire ». Et : « fais gaffe, le Pisteur doit sauter
par-dessus des murs, sur la phase 1 » (donc pas une roulade).

**La page commence par un choix** (deux boutons jaunes : « 🎵 Le Barde », « 🗡️ Le Pisteur ») ; « ↺ héros » en haut à
droite revient au choix. `index.html` charge `essai3d.js` après le choix, avec les mouvements du héros
(`MOUVEMENTS`) ; `src/main.js` sait lequel par `window.QUI` (`PIST`).

**Le modèle** (Higgsfield, 42 crédits) : la Pisteuse rousse du jeu (les héros en volume, `jeu/heros-vues`, rendue en
trois vues : `origine/pisteur-ref-3vues.png`) → une feuille de personnage 3D dans le style du Barde (Nano Banana 2.1,
deux essais, 4 crédits ; `origine/pisteur-image-a.jpg`, `-b.jpg`) → les trois vues découpées (`origine/pisteur-vues/`)
→ Meshy « multi image to 3D », texturé, articulé, posé en A, 1,5 m, avec son mouvement de garde (38 crédits) :
`origine/pisteur-base.glb` (**ne pas jeter** : les mouvements se refont depuis lui). Pas d'arc à la main (le combat du
Pisteur n'en a plus, § 17) ; le carquois au dos et la dague au fourreau sont dans le modèle.

**Ses mouvements** (bibliothèque Higgsfield, 8 crédits chacun, 72 crédits) : garde `Idle_5` (n° 245 : prête à bondir,
genoux pliés) ; marche `Casual_Walk` (30) ; **course `RunFast` (16)** ; **à pas de loup dans l'ombre
`Cautious_Crouch_Walk_Forward_inplace` (616)** ; **à l'affût dans l'ombre `CrouchLookAroundBow` (258)** (accroupie,
elle regarde autour) ; **le saut `Unarmed_Vault` (428)** : un bond genoux repliés, une main vers l'obstacle, les pieds
montent à 0,86 m — il passe un muret ; **la dague** : 1er temps `Right_Hand_Sword_Slash` (219, un revers), 2e temps
`Thrust_Slash` (240, le début : un grand pas et un coup d'estoc), 3e temps `Charged_Upward_Slash` (221, l'élan puis un
grand coup de bas en haut) ; **le coup qui assomme `Spartan_Kick` (206)** : un coup de pied haut. Les mouvements qui
avancent tout seuls (saut, coups, affût) sont remis sur place (`surplace_glb.py … fixe`) : c'est le jeu qui fait avancer.
Mesuré avec `outils/coups.py` (la main, les pieds, le bassin, image par image) : course 4,2 m/s aux pieds → **4,4 pas/s** ;
pas de loup 1,22 m/s → **1 à 1,8 pas/s** selon le pouce ; marche 0,59 m/s.

**Ses gestes** (`src/main.js`, partie « LE PISTEUR ») :
- **La dague en trois temps** (bouton 🗡️, le gros ; touche J) : le coup suivant ne vient **que si le précédent a
  touché** (le chiffre sur le bouton : 1, 2, 3 ; au 3e, l'icône change) ; le 3e est plus fort. Chaque coup ne joue
  que le morceau utile du film, accéléré (`COUPS` : début, impact, fin) : 0,6 à 0,85 s. Près du mannequin, il se tourne
  vers lui et fait un pas vers lui avant de frapper (« le bras entraîne le corps »). **La dague apparaît dans sa main**
  (faite par programme, accrochée à l'os de la main) et laisse **une traînée** de lumière. Un appui pendant un coup est
  gardé pour après (« comme Valeera »).
- **Le coup qui assomme** (💫 ; touche K) : le coup de pied ; s'il touche, **des étoiles tournent** au-dessus de la tête
  du mannequin pendant 2 s.
- **L'ombre** (🌑 ; touche L) : il devient **une silhouette sombre et violette**, à moitié transparente, **accroupi** ;
  il avance à pas de loup ; **l'écran se teinte de violet** sur les bords, **les boutons deviennent violets**, la dague
  devient 💀 **l'embuscade** (le grand coup, plus rapide, des éclats violets). **Frapper fait sortir de l'ombre**, et il
  faut **3 s** avant de pouvoir y retourner (le bouton se remplit d'ombre). Appuyer encore sur 🌑 en sort aussi.
- **Le saut** (💨 ; espace) : 3 pas, **recharge 3 s** (comme le Pisteur, § 18.14) ; **il passe par-dessus les murets**
  (s'il retomberait dessus, il saute un peu plus loin) mais pas à travers les murs, l'armure, les lanternes ;
  il retombe sans bruit (un peu de poussière) et repart aussitôt, comme le Barde.
- **Pour essayer** : **un mannequin d'entraînement** (un poteau, un corps de paille, une tête de toile, une barre
  pour les bras) au milieu de la salle, qui bascule sous les coups (un ressort), s'éclaire, lâche des éclats ; **deux
  murets de pierre** (de vrais volumes, éclairés par les brasiers, qui le cachent quand il passe derrière). Ils
  n'existent que pour le Pisteur.
- Vérifié image par image (`outils/essai_pisteur.py`, `essai_pisteur2.py`, `captures/pisteur-*.png`), en film
  (`outils/film.py pisteur`, `captures/film-pisteur.mp4`), et sous WebKit, le moteur de l'iPhone, avec la règle de
  sécurité du téléphone (`outils/essai_webkit_p.py`, `captures/webkit-choix-pisteur-barde.png`). Les outils du Barde
  choisissent maintenant « le Barde » sur le premier écran (`choisir('barde')`).
- **Pas fait** : les bandages (3 s dans l'ombre, § 17) ; la marche est celle du Barde ; pas de vrais golems ; la
  caméra qui suit le héros (demandée par Romain, pour plus tard) ; l'Alchimiste et le Sage.
- Crédits : **114 pour le Pisteur** (les deux images 4, le modèle 38, neuf mouvements 72) ; **217 en tout** pour l'essai.

## La place de nuit, pour le Barde (27 novembre, en ligne à 22 h 40, version `1795815581-a175` ; go de Romain à 22 h 16 : « Voilà, je t'ai fait toutes les images. Essaye de faire un truc bien »)

Romain a peint (Higgsfield) **une place de ville souterraine, la nuit** : un grand dallage, deux lanternes sur pied,
des massifs de cristaux violets et bleu-vert, des escaliers, et au fond **le temple et sa porte blanche** (Elyra y
retient la prison de cristal de Raban, d'après ce qu'il a dit à la voix). Il a fait plusieurs versions de la même
image, exactement alignées : vide, avec les lanternes (et un petit Barde peint au milieu), avec des crevasses
(trois sortes), avec des cristaux qui tombent, en feu, de jour. **Le Barde joue maintenant sur cette place** ; le
Pisteur garde la salle de l'armure (ses murets, son mannequin).

- **Le fond** : l'image avec les lanternes (`origine/nuit/place-lanternes.jpg`), le Barde peint effacé (remplacé
  par la place vide au même endroit, à la même lumière). Réduite à 4096 px de large (`site/nuit/fond.jpg`) : les
  téléphones n'acceptent pas toujours plus grand.
- **La caméra 3D est celle de la peinture** (`outils/salle-nuit/camera.py`) : un appareil photo penché de 16°, à
  11,8 m de haut, calé sur les lignes du dallage (où elles se rejoignent à l'horizon) et sur les colonnes (comment
  elles penchent) ; **la hauteur vient du Barde que Romain a peint** (147 pixels pour 1,55 pas). Vérification : les
  deux lanternes tombent à la même distance, symétriques (x −8,1 et +8,5, à 23,7 m), et la place fait à peu près
  un carré (20 × 19 pas). Le Barde 3D posé à la place du Barde peint a la même taille.
- **Les deux lanternes sont de vrais obstacles** : leur contour est découpé (l'outil libre rembg, modèle isnet ;
  `origine/nuit/pg_masque.png`, `pd_masque2.png`) ; une plaque debout à leur place montre exactement les pixels de
  la peinture et **cache le héros quand il passe derrière**. On ne traverse pas leur socle.
- **Les lumières** : un ciel bleu sombre ; **la porte blanche du temple dans le dos** (elle dessine le bord du
  héros) ; **les deux lanternes**, chaudes, qui vacillent un peu, et qui font **sa vraie ombre** sur le dallage
  (seulement près d'elles) ; **les cristaux** des massifs (violet, bleu-vert) qui le colorent quand il passe à côté.
- **La caméra suit le héros** (demandé par Romain à la voix) : elle montre un morceau de la peinture et le déplace
  doucement. **L'armure reste toujours à l'image** (Romain) : quand le héros descend vers nous, la caméra recule un
  peu. Elle ne sort pas de la peinture sur les côtés ; en bas, au bord, un fondu vers le noir.
- **La place de l'armure** : en haut des marches, devant la porte (un cercle doré, en attendant l'armure). Les
  notes y volent (plus vite qu'avant : c'est plus loin).
- **Les crevasses** (l'image aux deux crevasses lumineuses, `origine/nuit/place-crevasses.jpg`) : le bouton
  **⚡ Fissures** (ou la touche F). **Le sol tremble**, les deux crevasses **partent du haut des marches et filent
  vers nous** en 1,3 s, de la poussière grise jaillit le long ; ensuite **elles restent** (Romain : une seule fois,
  pour tout le combat). Leur fond violet et bleu-vert pulse, et quatre lumières au fond éclairent le héros par en
  dessous quand il passe au-dessus. **On ne marche pas dessus** (on s'arrête au bord) : **il faut sauter** (💨). Si
  la crevasse est trop large pour 3 pas, il saute juste assez loin pour passer. S'il était dessus quand elles
  s'ouvrent, il est poussé au bord. Les cases du sol (0,2 pas) : `site/nuit/nuit.json` (rangé dans `essai3d.js`).
- **Refaire** : `cd outils/salle-nuit && python3 generer.py` (le fond, les crevasses, les lanternes, les cases,
  les repères), puis reconstruire `essai3d.js`.
- Vérifié image par image (`outils/essai_nuit.py`, `essai_nuit2.py`, `captures/nuit-*.png`) et sous WebKit avec la
  règle de sécurité du téléphone (`captures/webkit-nuit-et-pisteur.png` : le Barde sur la place, le Pisteur dans
  l'ancienne salle).
- **Limites** : la peinture n'est pas tout à fait d'aplomb au fond (les marches et la porte ne collent pas tout à
  fait à la caméra) : la place de l'armure est une estimation. **Le héros est assez petit sur un téléphone** (il
  fait environ un huitième de la hauteur de l'écran) parce que l'armure doit rester à l'image : à Romain de dire.
  **Les crevasses vont du temple jusqu'au bord devant** : on ne peut pas les contourner, seulement sauter.
- **Pas fait** : Grosbec et son armure (Romain : sa forme va peut-être changer), ses sorts et ses attaques ; les
  autres images (cristaux qui tombent, feu, jour) ne sont pas utilisées. **Aucun crédit Higgsfield dépensé** pour
  cette étape (les images sont celles de Romain).

## La vague de flammes et les cristaux, première version (27 novembre, en ligne à 23 h 50, version `1795819812-04f2` ; go de Romain à 23 h 34 : « Ok, vas-y. ») — remplacée

**Jugée « très moche » par Romain** (cristaux « collés », fissures « horribles », mur de flammes en copies côte à côte,
rouge « dégueulasse », éclatement laid) : cristaux 3D, fissures, rouge et mur de flammes ont été retirés et refaits
avec ses images et ses vidéos (section suivante). Ce qui reste de cette version : le saut, l'abri en cône, les mots.

Décidé à la voix juste avant (Bible § 18.21, fin). **La place de nuit, c'est la phase 2** : au premier tiers, des
cristaux tombent et on se cache derrière pour échapper à la vague de flammes de l'armure ; les crevasses, c'est le
troisième tiers (pas la phase 3).

- **Le saut près des crevasses** (Romain) : il ne retombe **jamais** dans une crevasse. Assez près du bord, le saut
  s'allonge (jusqu'à 1,5 pas de plus) et il passe ; trop loin, il se raccourcit et il retombe au bord de son côté (un
  saut raté ; tout contre le bord, il saute sur place). `longueurSaut()` ; vérifié par `outils/essai_nuit3.py`.
- **Le bouton 🔥 Vague** (ou la touche V) lance le premier tiers :
  1. **Trois anneaux** de couleur au sol, au hasard (jamais sur le héros, loin des lanternes, écartés), puis **trois
     cristaux 3D tombent du plafond** et se plantent : violet, turquoise, vert. **Faits par Higgsfield** (Romain :
     « tu devrais prendre les cristaux en 3D faits par Higgsfield ») d'après **ses cristaux peints**
     (`origine/nuit/place-cristaux.jpg`), découpés, **redressés** (Romain : ils tombent du plafond, penchés « ça fait
     bizarre »), 3 m de haut, éclairés en vrai, qui font leur ombre et cachent le héros. À l'impact : le sol tremble,
     de la poussière, un éclair de leur couleur, et **la fissure de sa peinture** (Romain : « récupérer les fissures,
     c'est sympa ») : le sol de son image « déplié » vu de dessus avec la caméra, les traits sombres gardés
     (`outils/salle-nuit/cristaux.py`, `site/nuit/fissure.png`). Sous un cristal qui tombe : touché, repoussé.
  2. **L'armure se charge 2 s** en haut des marches (lueur rouge, le sol gronde).
  3. **La vague** : un mur de flammes (une vidéo Higgsfield de 5 s sur fond noir, bouclée sans raccord,
     `site/nuit/flammes.mp4` / `.webm` ; le noir devient transparent) part du haut des marches et déferle vers nous à
     6 pas/s ; trois vraies lumières orange avancent avec lui ; devant lui, le sol rougeoie. **Derrière lui, la place
     brûle avec la peinture en feu de Romain** (`site/nuit/feu.jpg`, son image « en feu ») **pendant 3 s**, puis la
     nuit revient. **Derrière chaque cristal (5 pas, de l'autre côté de l'armure), une bande reste intacte : l'abri** ;
     le mur de flammes s'ouvre aussi derrière lui. Le héros : « À l'abri ! » ou « Touché ! » (et un voile rouge) ;
     marcher dans le feu touche aussi. Pas de vie dans l'essai : juste le mot.
  4. **Les cristaux rougissent** pendant ces 3 s (Romain), tremblent, puis **éclatent** : le modèle est découpé en
     14 morceaux (des paquets de triangles voisins) qui partent, tournent, retombent et s'effacent, avec des
     étincelles et un éclair. Fait dans le code : une vidéo d'explosion Higgsfield serait plate et ne collerait ni à
     l'angle ni à la place du cristal.
- **Si la vidéo ne défile pas** sur un appareil, des flammes dessinées prennent le relais d'elles-mêmes (moins
  belles). La vidéo est lue d'un bloc et passée au lecteur par une adresse `blob:` (l'iPhone exige sinon un serveur
  qui sert les vidéos par morceaux). **Pas vérifié sur un vrai iPhone** : le WebKit des essais ne fait pas avancer les
  vidéos (c'est ce qui a montré le relais : `captures/webkit-vague-flammes-dessinees.png`).
- Vérifié image par image (`outils/essai_vague.py`, `essai_vague2.py`, `captures/vague-*.png`) et sous WebKit
  (`outils/essai_webkit_vague.py`).
- **Crédits Higgsfield : 125** (trois cristaux 3D à 30, la vidéo à 35), annoncés à Romain avant de lancer.
- **Pas fait** : l'armure elle-même (toujours le cercle doré) ; les deuxième et troisième tiers enchaînés (les
  crevasses restent sur leur bouton d'essai) ; des points de vie.

## Les cristaux et la vague de Romain (28 novembre, en ligne à 2 h 10, version `1795828292-dfad` ; go de Romain à 1 h 38 : « Vas-y. »)

Décidé à la voix : **« toi tu peins, moi je découpe »**. Romain a peint **5 paires d'images** de la place de nuit
(les mêmes cristaux en couleur, puis en rouge), **5 vidéos d'éclatement** (une par paire, faite d'après l'image
rouge) et **la vidéo de la vague** (faite d'après la place : la boule de feu à la porte du temple, puis l'anneau de
feu qui fend la place et la lave). Tout est gardé dans `origine/nuit/romain/`. Rien n'est plus fait par moi à l'œil :
plus de cristaux 3D, de fissures dessinées, de rouge ajouté ni de mur de flammes.

- **Le recalage** : chaque image et chaque image de vidéo est posée exactement sur la peinture de la place
  (`cv2.findTransformECC`, en ne regardant que les pixels qui n'ont pas changé ; à moins d'un pixel près).
  `outils/salle-nuit/cristaux_peints.py`.
- **20 endroits** : les cristaux debout et assez grands de ses 5 images (`spots.py`, avec une liste de ceux qu'on
  écarte : couchés, trop petits, collés à une lanterne ou à un bac). Pour chacun (`decoupes.py`) : un morceau de son
  image en couleur et en rouge (`site/nuit/cr/cNN.jpg`), le corps du cristal détouré (rembg) et le sol qu'il a changé
  (ses fissures, sa lueur) (`mNN.png`), son pied sur la place, sa hauteur. `site/nuit/cristaux.json`.
- **La chute** : 3 endroits tirés au hasard (bien écartés, jamais sur le héros ni dans une crevasse ouverte). Le
  cristal découpé de sa peinture tombe du plafond (une plaque debout à son pied qui montre ses pixels : le héros
  passe derrière, comme les lanternes) et se plante ; à l'impact ses fissures et sa lueur apparaissent, le sol tremble.
  Sous un cristal qui tombe : touché, repoussé.
- **La vague** : sa vidéo, recalée image par image (`vague.py` ; lignes 250 à 1870 de la peinture, à moitié de taille,
  `site/nuit/vague.mp4` / `.webm`), remplace la place 2,7 s après le début. Elle s'arrête sur sa dernière image (la
  lave, qui vacille un peu), la place brûle jusqu'à 6,4 s, puis la nuit revient en 1 s. Les lanternes disparaissent
  dans sa vidéo : les nôtres restent (ce sont des plaques au-dessus).
- **Quand le feu arrive** à chaque endroit : une carte tirée de sa vidéo (`arrivee.py`, `site/nuit/arrivee.png`) :
  l'anneau de flammes ou la lave, **pas la lueur de la boule de feu sur les dalles au début** (sinon le milieu de la
  place brûlait dès 0,4 s). Au milieu de la place : 1,7 s après la boule de feu ; en bas : environ 3 s.
- **L'abri** : derrière chaque cristal, vu de la porte du temple, un cône où la vidéo ne s'affiche pas (on voit la
  place de nuit) ; le héros dedans : « À l'abri ! », ailleurs dans le feu : « Touché ! » (une fois par seconde, voile
  rouge). Le cristal protège jusqu'à ce que le feu s'éteigne.
- **Le rouge** monte du pied en fondu (pas de ligne nette) de son image en couleur à son image rouge, depuis le moment
  où le feu atteint le cristal jusqu'à 1 s avant la fin du feu.
- **L'éclatement** : sa vidéo d'éclatement de la bonne paire, recalée image par image, seulement autour de ce cristal
  (`atlas.py` : 30 images à 10 par seconde, de 1 s avant l'éclatement à 2 s après, `eNN.jpg` ; une ellipse douce qui
  n'attrape pas les cristaux voisins, `masque_eclat.py`, `kNN.png`). Elle part 1 s avant la fin du feu : le cristal
  éclate quand le feu s'éteint. Chargée seulement pour les cristaux tirés, quand ils tombent.
- **Sans halo** : de ses morceaux d'image (les fissures, l'éclatement), le jeu ne montre que ce qui diffère de la place
  nue ; le reste est transparent et le feu passe dessous (sinon une tache de dallage sombre restait autour).
- **Couleurs de la vidéo** : elle est lue telle quelle et convertie dans le calcul de l'image (sinon, selon le
  navigateur, elle sortait délavée, toute la place voilée de blanc).
- **Si la vidéo ne défile pas** (le WebKit des essais, peut-être certains iPhone), ou tant qu'elle n'a pas démarré : la
  lave de sa dernière image (`site/nuit/feu.jpg`) se pose selon la carte d'arrivée. Pas d'anneau, mais pas de trou.
- Vérifié image par image (`outils/essai_vague3.py`, `essai_touche.py`, `captures/cristaux-peints-*.jpg`) et sous
  WebKit en temps réel (`outils/essai_webkit_vague3.py`, `captures/webkit-cristaux-peints-lave.jpg`).
- **Aucun crédit Higgsfield** (tout est de Romain). Poids : 18 Mo d'images de cristaux (3 Mo chargés au début, le
  reste quand un cristal tombe), 2,5 Mo de vidéo.
- **Limites dites à Romain** : l'abri se voit comme une ombre sombre sur la lave ; la fumée rose de l'éclatement est
  grosse et cache un instant le héros ; sur iPhone, si la vidéo ne démarre pas, la lave arrive d'un coup sans l'anneau.
- **Pas fait** : l'armure elle-même (toujours le cercle doré) ; les deuxième et troisième tiers enchaînés ; des points
  de vie.

## L'armure de Grosbec en 3D, au pied des marches (28 novembre, en ligne à 4 h 12, version `1795835524-6ca1` ; go de Romain à 4 h 05 : « vas-y, go alors, au travail »)

- **Le modèle** : 3 propositions en image (Nano Banana 2.1, 6 crédits, `origine/armure/proposition*.jpg`, d'après l'armure du
  combat du Barde rendue par `combat-barde/src/grosbec.js`) ; Romain a choisi **la plus massive** ; dans le dos, **la prise du
  rayon** (anneau de bronze au cœur doré) et **la trappe à verrous** ; la planche trois-quarts / face / dos (3 essais, 6 crédits ;
  `origine/armure/planche-massive.jpg`, vues découpées `vue-*.png`) ; Meshy multi-image, texturé (PBR, lueurs), articulé, posé en
  A, 3 m, avec le mouvement `Idle` (n° 0) : **38 crédits**, `origine/armure-base.glb` (16 Mo, **ne pas jeter**). Allégé par
  `outils.mjs base` (textures WebP 1024) : `origine/glb/armure.glb` (3,8 Mo) → `site/armure.json` (5,1 Mo).
- **Revue avant de le poser** : `outils/revue-armure/` (une petite page à part avec la caméra de la peinture ;
  `captures/armure-3m-ou-4m50.jpg`). Romain : **3 m** ; puis, à la voix, **au pied des marches** plutôt qu'en haut (il frappera le
  sol plat, il est plus près donc plus gros sur le téléphone, le rayon descend du temple jusque dans son dos).
- **Dans l'essai** (`src/main.js`, bloc « L'ARMURE DE GROSBEC, EN 3D ») : `ARM` = (10,78 ; −1,9), le losange du palier au pied des
  marches (le haut des marches était (10,86 ; −5,97 ; z 2)) ; 3,1 pas de haut ; tournée vers les héros.
  - **Son mouvement d'attente** ralenti (×0,6) ; l'`Idle` de la bibliothèque tourne tout le corps et regarde partout : la torsion
    du bassin autour de la verticale est enlevée, celle de la tête gardée au tiers (il respire, il reste face aux héros).
  - **Ses trois lanternes** (les épaules, la poitrine) : une vraie lampe dans chacune (3,5 et 4,5 d'intensité, 2,6 à 2,8 pas),
    placée sur la pose de repos puis qui suit ses os (`LeftShoulder`, `RightShoulder`, `Spine02`), qui vacille un peu, et un halo ;
    l'or un peu baissé (couleur ×0,8, lueurs ×0,7) pour qu'il ne paraisse pas collé ; **une lueur chaude sur les dalles** à ses
    pieds (la place est peinte : ses lampes ne l'éclairent pas d'elles-mêmes).
  - **Son ombre** : une lumière qui ne sert qu'à elle (intensité 0), depuis le temple dans son dos, assez haute (environ 38°) :
    l'ombre s'étire de 4 pas vers nous ; sa carte d'ombre ne couvre que les abords de l'armure (le héros n'en a une que tout près).
  - **Le rayon doré d'Elyra** : de la porte du temple à la prise dans son dos (un cœur et un halo, de la lumière qui coule vers
    lui ; l'armure le cache en partie), un éclat à la porte.
  - **Plus de cristal sur lui ni juste devant** (à moins de 3,6 pas) ; le feu de la vague et les cônes d'abri partent de lui.
- Vérifié : `outils/essai_armure.py` (`captures/armure-depart.jpg`, `armure-pied-des-marches.jpg`), la vague avec lui
  (`essai_vague3.py`), WebKit avec la règle de sécurité du téléphone (`essai_webkit_armure.py`, `captures/webkit-armure.jpg`).
- **Pas fait** : ses mouvements (le coup de poing au sol, le lancer de la vague, le coup reçu : à choisir avec Romain, 8 crédits
  chacun) ; les sorts du Barde touchent sa poitrine (ARM.zc = 2) mais il ne réagit pas encore.

### Refaite le même soir (en ligne à 4 h 43, version `1795837340-bbec` ; go de Romain à 4 h 20 : « Allez, vas-y, tu peux y aller »)

Romain, à la voix : **le bec est « tout de travers »** ; **ses pieds glissent** (« on a l'impression qu'il fait du moonwalk »).
- **Le bec** : la première fois, la vue de côté était de trois-quarts ; un **vrai profil** (Nano Banana 2.1, 2 essais, 4 crédits ;
  `origine/armure/vue-profil.png`), puis Meshy avec **4 vues** (face, profil, dos, trois-quarts) et **la symétrie forcée** :
  38 crédits. `origine/armure-base.glb` est le nouveau (l'ancien : `origine/armure/armure-base-v1-bec-de-travers.glb`) ;
  comparaison des têtes : `captures/armure-tetes-v1-v2.jpg` (en haut l'ancien, en bas le nouveau).
- **Son attente : `Idle_02`** (n° 11, choisie par Romain sur l'aperçu), fabriquée avec le modèle, ralentie (×0,7). Elle le
  tourne d'environ 25° d'un bloc : le modèle entier est tourné d'autant en sens inverse (pas de torsion du bassin : plus rien ne
  glisse). Romain : elle a les bras « comme s'il tenait quelque chose » : **chaque bras redescend de 40 % vers le bas** à chaque
  image (calculé dans le code, sauf quand il parle).
- **Il parle : `Stand_Talking_Angry`** (n° 311, 8 crédits, fait par « 3d_rigging » sur le nouveau modèle ; on n'en garde que le
  mouvement : `origine/glb/armure-parle.glb` → `site/armure-parle.json`). Son film dure 21 s : on garde les 6 premières, au ralenti
  (×0,55 : environ 11 s, de grands gestes lourds), sans son déplacement ; le bouton d'essai **« 🗣 Grosbec »** le lance (fondu
  depuis l'attente, puis retour). Pour plus tard : quand Grosbec parle entre les tiers.
- Vérifié : `essai_armure.py` (`captures/armure-v2-pied-des-marches.jpg`, `armure-parle.jpg`), WebKit (`essai_webkit_armure.py`).
- **Crédits de l'armure en tout** : 6 + 6 + 38 + 4 + 38 + 8 = **100**.

## Ce qui n'est pas fait

- L'armure de Grosbec n'est pas en 3D (la création de son image de référence a été bloquée
  pendant l'essai ; il faut le « go » de Romain pour la faire, ≈ 40 crédits). Les notes
  partent vers le centre du cercle, là où l'armure se tiendra.
- Le fond (`out/essai3d/`, `site/fond.jpg`, `site/prof.png`) se refait avec `essai3d.py`.
- La vitesse sur un vrai téléphone n'est pas mesurée.
- Le bouclier de la phase 3 (3 s, recharge 10 s) : évoqué à la voix, Romain n'a pas répondu : pas fait.
- L'ennemi de la phase 3 a changé dans une autre conversation : plus tard (Romain : « on va s'occuper d'abord de Grosbec et de la phase 2 »).
