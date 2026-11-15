#!/bin/bash
# tourner.sh [films…] : filme les cinématiques l'une après l'autre (sous le verrou des robots), puis les range dans sortie/
cd "$(dirname "$0")"
for f in ${@:-a12 b23 finLeo finMaire}; do
  flock /tmp/brumeval-pw.lock python3 filmer.py $f || exit 1
done
