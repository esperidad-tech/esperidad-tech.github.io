#!/bin/bash
# deployer.sh <jeu index.html> <salle.html> "message de commit"
#   (en plus, si on veut : BRUMEVAL_ETABLI=<dossier construit>/etabli.html → la page d'essai de l'établi des plantes)
set -e
S=$(cd "$(dirname "$0")/.." && pwd)
REPO=${REPO:-/home/claude/esperidad-tech.github.io}
# Nouvelle session : donner ses lignes d'attribution sans toucher à ce fichier :
#   BRUMEVAL_COAUTEUR="Claude … <noreply@anthropic.com>" BRUMEVAL_SESSION="https://claude.ai/code/session_…" bash deploy/deployer.sh …
# (sans ces variables : les lignes écrites plus bas, à remplacer par celles de la session en cours).
# GARDE-FOU (17 novembre) : plusieurs conversations travaillent sur les mêmes sources. Si la branche brumeval-sources de GitHub a des
# commits que ce dossier n'a pas, le jeu qu'on s'apprête à mettre en ligne a été construit SANS eux : il effacerait le travail des autres
# (c'est arrivé : la mise en ligne 7c7f2e6 a retiré dix minutes l'album de Mimi). On s'arrête ; il faut : git pull, reconstruire, retester.
# (BRUMEVAL_SANS_GARDE=1 pour passer outre, en connaissance de cause.)
if [ -z "$BRUMEVAL_SANS_GARDE" ]; then
  git -C "$S" fetch -q origin brumeval-sources 2>/dev/null || true
  MANQUE=$(git -C "$S" log --oneline HEAD..origin/brumeval-sources 2>/dev/null | head -5)
  if [ -n "$MANQUE" ]; then
    echo "ARRÊT : GitHub (brumeval-sources) a des commits que ce dossier n'a pas. Le jeu construit ici ne les contient pas :"; echo "$MANQUE"
    echo "→ git pull --no-rebase --no-edit origin brumeval-sources, puis reconstruire, retester, et relancer."; exit 3
  fi
fi
D=$REPO/brumeval
V=$(date -u +%Y%m%d-%H%M)
cp "$1" $D/index.html
{ printf '<!doctype html>\n<html lang="fr">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'; cat "$2"; } > $D/salle.html
sed "s/__VERSION__/$V/" $S/deploy/sw-modele.js > $D/sw.js
for f in manifest.webmanifest favicon.svg icon-192.png icon-512.png apple-touch-icon.png; do cp $S/jeu/dist/$f $D/$f; done
# L'établi des plantes tout seul (la maquette, pour l'essayer sans lancer une enquête) : BRUMEVAL_ETABLI=<dossier construit>/etabli.html
# → https://esperidad-tech.github.io/brumeval/etabli-essai.html
if [ -n "$BRUMEVAL_ETABLI" ] && [ -f "$BRUMEVAL_ETABLI" ]; then
  { printf '<!doctype html>\n<html lang="fr">\n<meta charset="utf-8">\n'; cat "$BRUMEVAL_ETABLI"; } > $D/etabli-essai.html
fi
cd $REPO
[ -f brumeval/etabli-essai.html ] && git add brumeval/etabli-essai.html
git add brumeval/index.html brumeval/salle.html brumeval/sw.js brumeval/manifest.webmanifest brumeval/favicon.svg brumeval/icon-192.png brumeval/icon-512.png brumeval/apple-touch-icon.png
git commit -q -m "$3

Co-Authored-By: ${BRUMEVAL_COAUTEUR:-Claude Opus 5.5 <noreply@anthropic.com>}
Claude-Session: ${BRUMEVAL_SESSION:-https://claude.ai/code/session_014tBbPMCeTaHG7Zn5Kx8hhW}"
git push -q origin HEAD:main
git log --oneline -1
echo "version $V"
