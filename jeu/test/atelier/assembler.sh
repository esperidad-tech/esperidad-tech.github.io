#!/bin/sh
# Assemble les morceaux de l'atelier.
# Par défaut dans le dossier de travail (scratchpad/atelier-dev/atelier.js) : src/atelier.js reste la version publiée.
# « sh assembler.sh src » : dans src/atelier.js (seulement après le feu vert du coordinateur ; copier aussi atelier-dev/atelier.css).
ICI=$(dirname "$0")
if [ "$1" = "src" ]; then OUT="$ICI/../../src/atelier.js"; else OUT="$ICI/../../../atelier-dev/atelier.js"; fi
cat "$ICI"/parts/*.js > "$OUT"
node -e "new Function(require('fs').readFileSync('$OUT','utf8'))" && echo "atelier.js OK ($(wc -l < "$OUT") lignes) -> $OUT"
