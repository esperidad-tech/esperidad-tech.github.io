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
(identifiant `1aa48eb1-9b62-479d-b64a-5d4f2246ab88`, version `1795800990-04e9`). Pour republier : `publish_files` des fichiers
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

## Ce qui n'est pas fait

- L'armure de Grosbec n'est pas en 3D (la création de son image de référence a été bloquée
  pendant l'essai ; il faut le « go » de Romain pour la faire, ≈ 40 crédits). Les notes
  partent vers le centre du cercle, là où l'armure se tiendra.
- Le fond (`out/essai3d/`, `site/fond.jpg`, `site/prof.png`) se refait avec `essai3d.py`.
- La vitesse sur un vrai téléphone n'est pas mesurée.
