#!/bin/sh
# assemble heros-anime.js à partir des morceaux de src/
cd "$(dirname "$0")"
cat src/a-base.js src/b-pisteur.js src/c-*.js src/d-*.js src/e-souples.js src/f-moteur.js src/g-heros.js src/h-communs.js src/i-pisteur.js src/j-*.js src/k-*.js src/z-fin.js 2>/dev/null > heros-anime.js
node --check heros-anime.js && echo OK $(wc -l < heros-anime.js) lignes
