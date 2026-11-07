#!/bin/sh
# Assemble les morceaux en un seul fichier source.
cd "$(dirname "$0")"
cat parts/00-outils.js parts/10-traces.js parts/11-poursuite.js parts/12-cachette.js parts/13-tir.js parts/20-rythme.js parts/21-bulles.js parts/22-melange.js parts/23-temperature.js parts/24-loupe.js > ../../src/mj-pisteur-alchi.js
node --check ../../src/mj-pisteur-alchi.js && echo OK
