#!/bin/sh
# mouvement.sh <nom> <mouvement> <url> : télécharge, recale sur le squelette du golem, garde le mouvement seul
set -e
S=/tmp/claude-0/-home-claude/adfe1f54-7125-553d-8916-ca9cd1938246/scratchpad; E=$S/repo/jeu/maquettes/essai-3d
N=$1; M=$2; U=$3
curl -s -o $S/mouvements/brut/$N-$M.glb "$U"
cd $E/outils
node recaler.mjs $S/mouvements/brut/$N-$M.glb $E/origine/golems/glb/$N-base.glb $S/mouvements/$N-$M-recale.glb
node outils.mjs anim $S/mouvements/$N-$M-recale.glb $E/origine/golems/glb/$N-$M.glb
ls -la $E/origine/golems/glb/$N-$M.glb
