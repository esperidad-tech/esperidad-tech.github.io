#!/bin/bash
# Les quatre films des héros, du montage à la copie avec le son (compter 12 minutes) :   bash tourner-heros.sh [pisteur alchimiste barde sage]
# 1. les bruits, tirés du montage ; 2. les images (deux moitiés à la fois), puis la vidéo ; 3. la bande-son et la copie à regarder.
cd "$(dirname "$0")"; FILMS="${@:-pisteur alchimiste barde sage}"
python3 sons-heros.py || exit 1
for f in $FILMS; do
  rm -rf /tmp/heros-images/$f
  python3 filmer-heros.py $f --part 1/2 > /tmp/pub/film-$f-1.log 2>&1 & python3 filmer-heros.py $f --part 2/2 > /tmp/pub/film-$f-2.log 2>&1 & wait
  python3 filmer-heros.py $f --monter || exit 1
done
cd ../cine && python3 bande-son.py $(for f in $FILMS; do echo -n "heros${f^} "; done)
