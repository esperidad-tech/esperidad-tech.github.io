#!/bin/sh
# Assemble la maquette du labo (../labo.html) à partir des morceaux de ce dossier
cd "$(dirname "$0")"
cat 00-head.html 10-base.js 20-chat.js 30-donnees.js 40-dessins.js 50-scene.js 60-loupe.js 70-micro.js 80-chaudron.js 90-main.js 99-foot.html > ../labo.html
cat 10-base.js 20-chat.js 30-donnees.js 40-dessins.js 50-scene.js 60-loupe.js 70-micro.js 80-chaudron.js 90-main.js > /tmp/labo-verif.js && node --check /tmp/labo-verif.js && echo SYNTAXE_OK
