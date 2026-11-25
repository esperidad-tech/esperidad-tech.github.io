#!/bin/bash
# chaque vague jouée seule (vie pleine, cinq bandages), plusieurs fois : bash parvague.sh "1 2 3 4" 4 [bon|moyen|mal]
for v in $1; do echo "=== vague $v"; timeout 900 python3 lot.py ${3:-bon} $2 vague=$v une sec=420 2>&1 | grep -v "^      ombre" ; done
