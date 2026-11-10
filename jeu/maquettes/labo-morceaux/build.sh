#!/bin/sh
# La maquette du labo (version 8) = le labo du jeu, tout seul. Ses morceaux sont maintenant dans le jeu : jeu/src/labo/
# (c'est la source ; ici, il ne reste que les anciennes versions, v4 à v7, en archive).
#   sh build.sh      → ../labo.html (le fichier publié sur https://claude.ai/artifact/MS6e32QYkUZA6gdjsBaYqK)
# (build.py du jeu fabrique la même page dans dist/labo.html, et la range dans le jeu : window.LABO_HTML.)
cd "$(dirname "$0")"
S=../../src/labo
P="$S/10-base.js $S/15-sons.js $S/20-chat.js $S/30-donnees.js $S/40-dessins.js $S/50-scene.js $S/60-loupe.js $S/70-micro.js $S/80-test.js $S/90-main.js"
cat $S/00-head.html $P $S/99-foot.html > ../labo.html
cat $P > /tmp/labo-verif.js
node --check /tmp/labo-verif.js && echo SYNTAXE_OK && wc -c ../labo.html
