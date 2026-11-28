# Combat du Barde en 3D (phase 1 de l'enquête 10, refaite en 3D)

**En ligne, hors du jeu** : https://claude.ai/artifact/1tBtSsyA66eRcizBJN1bae (version `1795846222-e307`, 28 novembre, 7 h 25).
Go de Romain (6 h 58, par écrit) : « Choisis la marche que tu veux, celle qui t'arrange. Et par contre, il faut bien caler les pas
sur le rythme. Vas-y, commence à faire le chantier. »

## Ce que montre ce premier essai

La salle peinte (le parvis devant le temple, `origine/salle-barde/` de l'essai 3D), le Barde 3D de dos qui attend, et les golems
d'Elyra qui sortent de la porte de cristal, descendent les cinq marches et viennent vers lui ; un golem toutes les quatre temps,
en boucle. Bouton jaune ▶ (le son ne part qu'après un toucher), puis le tempo des quatre chansons du jeu (100, 112, 124, 136).
**Rien du jeu n'est encore branché** (pas de notes, pas de coups, pas de Grosbec).

- **Les pas sur le rythme** : chaque pied se pose **exactement sur un temps**. Le film de la marche est déformé pas par pas : entre
  deux temps, il va d'une pose de pied à la suivante (`mesurerPas` trouve quand chaque pied se pose et de combien le corps avance ;
  une pose manquée est bouchée au milieu). Le corps avance d'un pas entier par pas : les pieds posés ne glissent pas. Comme dans
  le jeu, le rôdeur et le bélier font un pas à chaque temps, les autres un temps sur deux. Un choc sourd à chaque pas.
- **Les marches** (bibliothèque Higgsfield, 8 crédits chacune, 40 en tout) : « Slow_Orc_Walk » (n° 119) pour le faucheur, le
  porte-dalle, le colosse et le bélier ; « Monster_Walk » (n° 112) pour le rôdeur. Faites par « 3d_rigging » sur chaque modèle,
  puis recalées sur leur propre squelette (`essai-3d/outils/recaler.mjs`), gardées sans maillage :
  `essai-3d/origine/golems/glb/<nom>-marche.glb`.
- **La caméra** (`outils/camera_barde.py`) : calée sur le losange et les rangées de dalles du parvis : f = 5497 px sur l'image
  debout (champ vertical 27,5°), penchée de 34,5°, à 20,6 m (1 unité = 1 m). Le palier de la porte : 0,9 m. Couché, la même
  caméra sur l'image agrandie (f × 1536 / 2688).
- **Les tailles** (celles du jeu en 2D, un peu plus grandes ; le parvis ne fait qu'environ 6 m de large en bas) : Barde 1,5 m ;
  rôdeur 1 m, bélier 1,3 m, porte-dalle 1,45 m, faucheur 1,6 m, colosse 2,15 m. Avec leurs vraies tailles de modèle (1,6 à 3 m),
  ils remplissaient le parvis.
- **La faux et la dalle** : objets rigides rattachés à la main (`tenir`), réglés dans la pose de départ ; la prise se trouve
  toute seule (le milieu des sommets du bas de l'objet).
- **La lumière** : la lune, la porte de cristal, quatre braseros ; une ombre douce sous chacun.
- **Les modèles** : allégés pour le téléphone par `essai-3d/outils/alleger.mjs` (textures WebP 512, sommets quantifiés) : environ
  2 Mo chacun ; la page fait 19 Mo en tout.

## Refaire la page

```
cd jeu/maquettes/essai-3d/outils && npm install
for n in rodeur faucheur porte-dalle colosse belier faux dalle; do node alleger.mjs ../origine/golems/glb/$n-base.glb /tmp/legers/$n.glb 512; done
cp ../origine/golems/glb/*-marche.glb /tmp/legers/
../../combat-barde-3d/outils/construire.sh /tmp/legers
python3 ../../combat-barde-3d/outils/photo.py ../../combat-barde-3d/site /tmp/photo.png        # une photo, cinq golems placés
```
`construire.sh` refait `site/` : le moteur (`src/main.js` → `site/combat3d.js`), les deux images de la salle, les modèles en
`.json` (la page Claude ne sert pas les `.glb`), le Barde de l'essai 3D (`essai-3d/site/barde.json`).

## Pas fait, la suite

- Brancher le vrai jeu du Barde (`combat-barde/src/jeu.js`, gelé dans sa façon de jouer) : ses positions 2D posées sur le sol
  3D, les vagues de golems, les notes, Grosbec (l'armure 3D de l'essai), les coups.
- Les autres mouvements des golems (attaque, coup reçu, mort), à choisir avec Romain sur les aperçus (8 crédits chacun).
- Le tourbillon et le frondeur (sans squelette) : à animer par le code.
- Le Barde qui bat la mesure (aujourd'hui, son attente de l'essai).
- Pas vérifié sur un vrai téléphone (19 Mo à charger).
