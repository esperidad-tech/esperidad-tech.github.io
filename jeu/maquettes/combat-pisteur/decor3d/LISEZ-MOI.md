# Le décor du combat du Pisteur, construit en volume (version 9, 26 novembre 2026)

La salle du combat n'est plus dessinée par le jeu. Elle est **construite en trois dimensions** avec Blender (piloté par ces scripts
Python, sans ouvrir le logiciel), éclairée par de vraies lumières, puis **« photographiée » exactement sous l'angle du jeu**. Le jeu
ne fait que recopier ces images (`../src/decor.js`, lu par `../src/salle.js`).

Pourquoi : Romain trouvait la salle « en mode maquette » (colonnes et murets mal dessinés, perspective fausse, pas assez de détails,
des aplats). Une IA d'images a été essayée et abandonnée (hors charte, puis « plat », puis plus d'abonnement). Avec une seule
caméra, tout est forcément dans la même perspective ; avec de vraies lumières, les ombres et les dégradés viennent tout seuls.

## Refaire les images
```
pip install bpy                      # Blender 5.3 comme module Python (Python 3.13) ; numpy et Pillow aussi
python3 textures.py                  # peint les deux tapis et la bannière → tex/
python3 rendu.py essai 0.5 40 aide   # un essai à demi-taille (3 minutes sur deux cœurs) → out/essai.png
python3 post.py out/essai out/essai-v.png        # … avec les contours, le halo, les couleurs
python3 final.py 1.0 96              # les rendus finis (une heure environ sur deux cœurs) → out/final/
python3 paquet.py out/final ../src/decor.js      # range tout dans un seul fichier pour le jeu
cd .. && python3 construire.py       # refait la page
```
`python3 final.py 0.5 32` fait la même chose en petit (6 minutes) dans `out/essai_final/` : pratique pour vérifier avant le grand rendu.
`final.py 1.0 96 obs` (ou `fond`, ou `portes`) ne refait qu'une partie. `out/` et `tex/` ne sont pas rangés sur GitHub (ils se refont).

## Les fichiers
- `base.py` : la caméra (**exactement `px` et `py` du jeu** : le sol écrasé à 0,66, les hauteurs à pleine taille — pour ça le monde
  est étiré en hauteur, `ZS`), les matières (pierre, bois, métal, braises, images), les formes (boîte biseautée, planche, forme
  tournée, caillou…). `G(x, y, z)` : un point donné dans les mesures du jeu. Chaque pièce reçoit un numéro (`pass_index`) : c'est
  lui qui sert à tracer les contours ; les rivets prennent le numéro de la pièce qui les porte, toutes les dalles du sol ont le même.
- `formes2.py` : le prisme (un contour vu de face, étiré en profondeur), l'anneau, le tissu, le disque, la bannière.
- `salle.py` : **la salle**. `OBS0` (les mêmes obstacles que `src/monde.js`, dans le même ordre : **ne pas changer leur place sans
  changer le jeu**), le sol, le mur du fond et ses deux portes (`porte`, `battant`), les murs de côté, la réserve, les piliers, les
  pans de mur, les murets, les caisses, les tonneaux, le chariot, les gravats, les torches, les lanternes, les bannières, les
  râteliers, les chaînes, les tapis, les cailloux, **la lumière** (`REG` : toutes les puissances ; `lumieres`, `lune`).
  Les collections : `fond`, `obs_00` … `obs_13` (un obstacle chacune), `porteA` (battants fermés), `porteC` (ouverts),
  `signal_off` / `signal_on` (l'œil des portes éteint / allumé, avec la lumière du couloir).
- `textures.py` : les images peintes (le long tapis, le tapis rond, la bannière).
- `rendu.py` : les réglages du rendu (Cycles), l'état des portes (`etat`), **les deux passes d'aide** (une couleur par pièce, la
  profondeur) qui servent à tracer les contours.
- `post.py` : après le rendu : **les contours** (épais sur les silhouettes, fins entre deux pièces), le halo des feux, les couleurs,
  les bords assombris, le noir autour de la salle.
- `final.py` : le fond (sans les obstacles, mais avec leurs ombres), les portes dans leurs deux états (l'œil allumé, la porte
  ouverte : rendues à part, recollées dans le fond avant la finition, puis découpées), et **chaque obstacle seul** (les autres
  restent là pour leurs ombres, mais la caméra ne les voit pas).
- `paquet.py` : fabrique `../src/decor.js` : le fond (JPEG), les obstacles sur une planche (un JPEG pour les couleurs, un PNG pour
  les découpes : ça passe sur toutes les tablettes), les quatre images de portes, les places des flammes.

## Ce que le jeu en fait (`../src/salle.js`, `../src/dessin.js`)
- `Salle.preparer` décode les images, les met une fois à la taille de l'écran, fabrique la salle « dans l'ombre » (teintée).
- Chaque obstacle de `OBS0` a son numéro (`o.i`) : c'est celui de son image. La dalle plantée par le porte-dalle est encore peinte
  par le jeu.
- Les flammes (les quatre vasques, les quatre torches) et la poussière des rayons de lune sont dessinées par le jeu, par-dessus.
- Les portes : `alerte[i]` (l'œil allumé) et `porte[i]` (ouverte) fondent les deux images par-dessus le fond.

## Pour changer quelque chose
- **La lumière** : `REG` en tête de `salle.py`. `python3 rendu.py essai 0.25 24` donne un aperçu en 30 secondes.
- **Un obstacle** : sa fonction dans `salle.py`, puis `python3 final.py 1.0 96 obs` et `paquet.py`.
- **La place d'un obstacle** : `OBS0` ici ET `OBS0` dans `src/monde.js` (les règles du jeu s'en servent), puis tout rendre.
