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
(identifiant `1aa48eb1-9b62-479d-b64a-5d4f2246ab88`, version `1795793296-4e6c`). Pour republier : `publish_files` des fichiers
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

## Ce qui n'est pas fait

- L'armure de Grosbec n'est pas en 3D (la création de son image de référence a été bloquée
  pendant l'essai ; il faut le « go » de Romain pour la faire, ≈ 40 crédits). Les notes
  partent vers le centre du cercle, là où l'armure se tiendra.
- Le fond (`out/essai3d/`, `site/fond.jpg`, `site/prof.png`) se refait avec `essai3d.py`.
- La vitesse sur un vrai téléphone n'est pas mesurée.
