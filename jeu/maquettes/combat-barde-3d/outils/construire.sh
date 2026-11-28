#!/bin/sh
# construire.sh <dossier des .glb allégés> : refait site/ (le moteur, les images de la salle, les modèles et les mouvements en .json)
set -e
ICI=$(cd "$(dirname "$0")/.." && pwd); E=$ICI/../essai-3d; G=$1
cd $E/outils && NODE_PATH=$E/outils/node_modules npx esbuild $ICI/src/main.js --bundle --minify --outfile=$ICI/site/combat3d.js
cp $ICI/index.html $ICI/site/
# la salle : le temple de Romain (debout), et la salle large dont le milieu est exactement l'image debout
python3 -c "
from PIL import Image
Image.open('$E/origine/salle-barde/temple-romain/debout-9x16.jpg').resize((1440, 2560), Image.LANCZOS).save('$ICI/site/fond.jpg', quality=84)
Image.open('$E/origine/salle-barde/temple-romain/large-16x9.jpg').resize((2866, 1612), Image.LANCZOS).save('$ICI/site/fond-large.jpg', quality=82)"
for n in rodeur faucheur porte-dalle colosse belier dalle faux; do python3 $E/outils/englb.py $G/$n.glb $ICI/site/$n.json; done
# les mouvements des golems (sans maillage) : la marche, le coup reçu, l'attaque (le bélier : sa charge), la mort
rm -f $ICI/site/*-coup.json $ICI/site/*-attaque.json $ICI/site/*-charge.json $ICI/site/*-mort.json
for f in $E/origine/golems/glb/*-marche.glb $E/origine/golems/glb/*-coup.glb $E/origine/golems/glb/*-attaque.glb $E/origine/golems/glb/*-charge.glb $E/origine/golems/glb/*-mort.glb; do
  [ -f "$f" ] && python3 $E/outils/englb.py $f $ICI/site/$(basename $f .glb).json; done
cp $E/site/barde.json $ICI/site/barde.json
cp $E/site/armure.json $ICI/site/grosbec.json      # (Grosbec : son modèle actuel, en attendant celui en pièces rigides)
ls -la $ICI/site | awk '{s+=$5} END {print "total", s/1e6, "Mo"}'
