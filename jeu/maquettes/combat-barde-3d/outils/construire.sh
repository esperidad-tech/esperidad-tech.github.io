#!/bin/sh
# construire.sh <dossier des .glb allégés> : refait site/ (le moteur, les images de la salle, les modèles en .json)
set -e
ICI=$(cd "$(dirname "$0")/.." && pwd); E=$ICI/../essai-3d; G=$1
cd $E/outils && NODE_PATH=$E/outils/node_modules npx esbuild $ICI/src/main.js --bundle --minify --outfile=$ICI/site/combat3d.js
cp $ICI/index.html $ICI/site/
python3 -c "
from PIL import Image
Image.open('$E/origine/salle-barde/parvis-9x16-choisie.jpg').save('$ICI/site/fond.jpg', quality=84)
Image.open('$E/origine/salle-barde/parvis-16x9-agrandie.jpg').resize((2064, 1152)).save('$ICI/site/fond-large.jpg', quality=82)"
for n in rodeur faucheur porte-dalle colosse belier dalle faux; do python3 $E/outils/englb.py $G/$n.glb $ICI/site/$n.json; done
for n in rodeur faucheur porte-dalle colosse belier; do python3 $E/outils/englb.py $G/$n-marche.glb $ICI/site/$n-marche.json; done
cp $E/site/barde.json $ICI/site/barde.json
ls -la $ICI/site
