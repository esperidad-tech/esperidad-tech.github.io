#!/bin/bash
# Vérification rapide avant une mise en ligne (règle de Romain du 4 novembre : vite en ligne, les grosses vérifications plus tard).
# Usage : rapide.sh <dossier-de-build>   → construit, logique des enquêtes, une partie complète de l'enquête 1 à 4 tablettes.
S=$(cd "$(dirname "$0")" && pwd)
D=${1:-$S/d-rapide}
cd $S/jeu || exit 1
BRUMEVAL_DIST=$D python3 build.py 2>&1 | tail -2
echo "--- verif.js"; node tools/verif.js 1 2 3 2>&1 | tail -1
export BRUMEVAL_DIST=$D
T=tools/partie1.py; [ -f tools/tuto.py ] && T=tools/tuto.py
echo "--- $T"; timeout 900 python3 $S/lent-outil.py $T 2>&1 | grep -E "ERREURS|ÉCHECS|PAGEERROR|Traceback" | head -8
