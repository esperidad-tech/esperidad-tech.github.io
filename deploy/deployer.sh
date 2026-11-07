#!/bin/bash
# deployer.sh <jeu index.html> <salle.html> "message de commit"
set -e
S=$(cd "$(dirname "$0")/.." && pwd)
REPO=${REPO:-/home/claude/esperidad-tech.github.io}
# Nouvelle session : remplacer la ligne Claude-Session du commit par celle de la session en cours.
D=$REPO/brumeval
V=$(date -u +%Y%m%d-%H%M)
cp "$1" $D/index.html
{ printf '<!doctype html>\n<html lang="fr">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'; cat "$2"; } > $D/salle.html
sed "s/__VERSION__/$V/" $S/deploy/sw-modele.js > $D/sw.js
for f in manifest.webmanifest favicon.svg icon-192.png icon-512.png apple-touch-icon.png; do cp $S/jeu/dist/$f $D/$f; done
cd $REPO
git add brumeval/index.html brumeval/salle.html brumeval/sw.js brumeval/manifest.webmanifest brumeval/favicon.svg brumeval/icon-192.png brumeval/icon-512.png brumeval/apple-touch-icon.png
git commit -q -m "$3

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014tBbPJ6zZ7JSXBsjydr8a9"
git push -q origin HEAD:main
git log --oneline -1
echo "version $V"
