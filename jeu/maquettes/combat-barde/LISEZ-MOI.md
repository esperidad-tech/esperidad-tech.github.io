# Maquette « Combat du Barde contre Grosbec » (enquête 10) — les sources

Maquette de test, pas le vrai jeu. Elle se joue ici : https://claude.ai/artifact/5vCVNgJnhYV3aRgUY2ttT1
Version 11 (nuit du 24 au 25 novembre) : les images regroupées en planches (l'iPhone qui rame à l'acte IV), la danse folle du dernier acte. Version 10 (24 novembre, 22 h 58) : le souci de l'acte III sur iPhone, Grosbec et le Barde bougent en rythme. Version 9 (21 h 46) : les golems refaits, la grande salle, le Barde de dos en volume, les portes, la voix de Grosbec.

## Ce qu'il y a ici
- `combat-barde.html` : la maquette, en un seul fichier (c'est aussi l'`index.html` du canevas).
- `construire.py` : fabrique `combat-barde.html` à partir de `src/` (`python3 construire.py`).
- `src/page.html` : la page, les écrans, les styles.
- `src/son.js` : les instruments (tout le son est fabriqué par la page).
- `src/musique.js` : les quatre chansons et le tube de la fin.
- `src/outils.js` : les outils de dessin (toiles peintes une fois, lueurs).
- `src/decor.js` : la grande salle (l'arche et la ville floue, les portes, le sol poli), et la lumière (rigoles, portes qui s'ouvrent, spots, faisceaux).
- `src/golems.js` : le bestiaire, sept golems de roche et de métal.
- `src/grosbec.js` : Grosbec en armure, en volume, et ses gestes. **Le modèle à reprendre.**
- `src/heros-vues.js` : le moteur des héros en volume du jeu (`jeu/heros-vues/src`), repris tel quel de la maquette du combat de l'Alchimiste.
- `src/barde.js` : le Barde de dos (le héros en volume, cuit image par image), son chapeau à plume, son luth et son synthé.
- `src/dessins.js` : les icônes ; l'ancien dessin du Barde (il ne sert plus qu'aux petites images des règles).
- `src/jeu.js` : les règles, l'affichage, le réglage automatique de la vitesse.
- `tests/` : les robots (il faut Python, Playwright et Chrome). Les plus utiles :
  `perf.py` (images par seconde, appareil ralenti, sans carte graphique), `partie.py` (une partie entière),
  `fin4.py` (la fin), `fete7.py` (la fête), `menus.py`, `scene8.py` et `foule8.py` (des captures),
  `voir9.py` (la planche des golems), `barde9.py` (le Barde en gros plan), `voir-grosbec.py`, `souvenir8.py` (la mémoire du niveau de dessin).
- `maquette-combat-du-barde.md` : toute l'histoire de la maquette, version par version (c'est le document du projet).
- `bible-section-16.md` : la section 16 de la Bible (les modèles, la lumière, la vitesse).

**Sur le canevas, les fichiers Python s'appellent `….py.txt`** (le canevas ne sert pas les `.py`) : enlever le `.txt` en les rangeant.

## À faire par une conversation qui a GitHub
1. Ranger tout ce dossier dans `jeu/maquettes/combat-barde/` de la branche `brumeval-sources`.
2. Porter la section 16 dans la Bible de GitHub.
3. Mettre la maquette en ligne sur le site pour l'enquête 10 (demandé par Romain le 24 novembre : « de sorte qu'on ne le perde pas »).

## Pour les mesures
- `?qualite=0` à `?qualite=3` à la fin de l'adresse : force un niveau de dessin (3 = le plus fin).
- `?sans=gros,lum,golems` : enlève un morceau du dessin.
