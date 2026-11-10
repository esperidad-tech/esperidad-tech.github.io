#!/bin/sh
# Assemble la maquette du labo (version 6) : lancer depuis ce dossier.  sh build.sh
# Le résultat va dans ../labo.html (le fichier publié sur https://claude.ai/artifact/MS6e32QYkUZA6gdjsBaYqK).
P="10-base.js 15-sons.js 20-chat.js 30-donnees.js 40-dessins.js 50-scene.js 60-loupe.js 70-micro.js 80-test.js 90-main.js"
cat 00-head.html $P 99-foot.html > ../labo.html
cat $P > /tmp/labo-verif.js
node --check /tmp/labo-verif.js && echo SYNTAXE_OK && wc -c ../labo.html
