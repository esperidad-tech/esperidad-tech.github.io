#!/bin/bash
export BRUMEVAL_DIST=/tmp/claude-0/-home-claude/665077da-ba1e-55f5-95f5-bf914c1f5a85/scratchpad/d-contenu
export BRUMEVAL_FIGE="atelier.js,atelier.css"
ICI=/tmp/claude-0/-home-claude/665077da-ba1e-55f5-95f5-bf914c1f5a85/scratchpad
cd $ICI/jeu
for f in src/*.js tools/verif.js; do node --check $f 2>/dev/null || echo "SYNTAX $f"; done
node tools/verif.js > $ICI/missions-test/r-verif.log 2>&1; tail -1 $ICI/missions-test/r-verif.log
python3 build.py 2>&1 | grep -E "index.html|figée"
cd $ICI/missions-test
for t in essais missions liege tableau; do timeout 900 python3 ../lent-outil.py $t.py > r-$t.log 2>&1; echo "== $t $(grep -c '^  OK' r-$t.log) OK"; grep -E "✗✗|ÉCHECS|ERREURS|in <module>|Error" r-$t.log | head -8; done
cd $ICI/jeu
for t in partie1 systemes transition; do timeout 1200 python3 ../lent-outil.py tools/$t.py > $ICI/missions-test/r-$t.log 2>&1; echo "== $t"; grep -E "ÉCHEC|ERREURS|in <module>|Error" $ICI/missions-test/r-$t.log | head -5; done
for n in 2 3; do timeout 1500 python3 ../lent-outil.py tools/bot.py $n > $ICI/missions-test/r-bot$n.log 2>&1; echo "== bot$n"; tail -4 $ICI/missions-test/r-bot$n.log; done
echo TOUT FINI
