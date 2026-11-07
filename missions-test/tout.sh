#!/bin/bash
# Lance toute la batterie, l'un après l'autre (machine chargée)
export BRUMEVAL_DIST=/tmp/claude-0/-home-claude/665077da-ba1e-55f5-95f5-bf914c1f5a85/scratchpad/d-contenu
ICI=/tmp/claude-0/-home-claude/665077da-ba1e-55f5-95f5-bf914c1f5a85/scratchpad
cd $ICI/jeu
unset BRUMEVAL_FIGE
for f in src/*.js tools/verif.js; do node --check $f 2>/dev/null || echo "SYNTAX $f"; done > $ICI/missions-test/r-syntaxe.log
node tools/verif.js > $ICI/missions-test/r-verif.log 2>&1
python3 build.py > $ICI/missions-test/r-build.log 2>&1
cd $ICI/missions-test
for t in liege missions tableau; do timeout 900 python3 ../lent-outil.py $t.py > r-$t.log 2>&1; echo "$t fini $(date +%H:%M)"; done
cd $ICI/jeu
for t in partie1 systemes transition; do timeout 1200 python3 ../lent-outil.py tools/$t.py > $ICI/missions-test/r-$t.log 2>&1; echo "$t fini $(date +%H:%M)"; done
for n in 2 3; do timeout 1500 python3 ../lent-outil.py tools/bot.py $n > $ICI/missions-test/r-bot$n.log 2>&1; echo "bot$n fini $(date +%H:%M)"; done
echo TOUT FINI
