# Les héros « en volume » — le chantier ouvert le 23 novembre (Bible §13.91)

**Où on en est (23 novembre, 11 h) : un premier personnage, la Pisteuse (fille, queue de cheval, tenue en couleur), tourne sur elle-même et prend des poses. C'EST UN ESSAI HORS DU JEU : rien n'est branché dans `build.py`, rien n'est en ligne, `persos.js` n'est pas touché. Romain doit le voir et dire si c'est la bonne direction avant qu'on aille plus loin.**

## Ce que Romain a demandé
- 23 novembre, 9 h 58 (après avoir refusé une tête tournée collée sur le héros de face, le pantin du donjon et la vraie 3D) : « Je préfère vraiment que tu fasses comme avec Mimi le chat. Mais il faut que ça soit plus joli. Et peut-être qu'il y ait plus de transition entre le moment où elle est tournée à 90 degrés et le moment où elle est de face. »
- 23 novembre, 10 h 02 (le go) : « on va faire le chantier de refonte des personnages […] qu'on puisse le tourner à droite, à gauche avec des dessins refaits […] animés comme Mimi, où ils peuvent se tourner de 3 quarts […] rajouter encore plus de poses pour que ça fasse vraiment une transition jolie […] qu'on n'ait pas des coupes bizarres […] dès qu'un personnage est terminé et que tu le fais un peu bouger avec des poses, tu me montres. »
- Sa règle du 18 novembre tient toujours : **jamais de fausse 3D** (une image retournée ou écrasée).

## L'idée
Comme Mimi (`jeu/src/mimi-vues.js`) : le héros n'est pas une série de dessins faits à part, c'est **un seul pantin décrit en volume, dont le dessin est recalculé pour l'angle voulu**. Donc autant de vues qu'on veut entre la face et le profil (le film en montre une quinzaine par quart de tour), toutes cohérentes, et ce qui n'est que d'un côté (l'arc dans SA main droite, le carquois sur SON épaule gauche, le baudrier en travers) reste de son côté quand elle se tourne.

- **Un volume = une pile de « coupes »** (`hv-base.js`) : à chaque hauteur, la tranche vue de dessus (demi-largeur `a`, l'endroit le plus large `zm`, l'épaisseur devant `cf`, derrière `cb`, la rondeur `pf` / `pb`). On regarde à l'horizontale ; le héros tourne de `psi`. Le contour d'un volume = à chaque hauteur son bord gauche et son bord droit (`bords`, `contour`) : c'est exact, sans maillage ni 3D.
- **Ce qui est dessiné sur un volume** (les yeux, la frange, la boucle de ceinture…) est donné **comme on le voit de face** (les tracés de `persos.js`), puis posé sur le volume (`leve`) : en tournant, il glisse, se resserre, passe derrière le bord. `coupeBord` coupe proprement un tracé fermé au bord ; `morceaux` un trait ouvert.
- **La triche du dessinateur** (`vue().w`) : de face et de trois quarts la tête est « carrée » (un visage large et plat : l'œil du fond garde de la place) ; de profil elle redevient ronde (l'œil s'enroule sur le côté). On passe de l'un à l'autre en douceur ; ça ne se voit ni de face ni de profil.
- **La ligne du profil** (`T_MIL` dans `hv-tete.js`) : le front, le creux entre les yeux, le nez, les lèvres, le menton. Elle ne compte que quand elle dépasse du contour (le nez sort vers 60°).
- **Les cheveux** (`hv-cheveux.js`) : un volume autour de la tête (`COIFFE`) ; une coiffure = sa `zone` (la ligne des cheveux autour de la tête), sa `frange` (le tracé de face), ses `meches` libres et sa `queue` de cheval (des points dans l'espace), ses `fils`. Deux masses par vue : celle de derrière (avant le visage) et celle de devant (la calotte qu'on voit + la frange + les mèches).
- **Le corps** (`hv-corps.js`) : le buste est un volume ; le bas de la tunique, la ceinture sont des anneaux vus d'un peu au-dessus ; les bras et les jambes sont des os dans l'espace (on dit où poser le poignet ou la cheville, `ik3` place le coude et le genou), dessinés en « gélules » comme Mimi.
- **Le pantin** (`hv-pantin.js`) : `HV.dessin(h, P)` (une image), `HV.monter(hote, h)` → `.vers(angle)` (la tête part la première, le corps suit, la queue de cheval et la jupe traînent), `.pose(nom)` (`repos`, `hanche`, `coucou`, `tir`), sa petite vie (elle respire, cligne des yeux, bouge un peu). 30 dessins par seconde au plus.

## Les fichiers
- `src/hv-base.js`, `hv-tete.js`, `hv-cheveux.js`, `hv-corps.js`, `hv-pantin.js` : le moteur (`window.HerosVues`). Aucune dépendance (les couleurs de `persos.js` y sont recopiées).
- `essai/demo.html` : la page d'essai (on la fait tourner au doigt, boutons des vues et des poses). `python3 construire.py` → `sortie/pisteuse-se-tourne.html` (un seul fichier, celui qui est publié en canevas) ; `sortie/` n'est pas dans Git.
- `essai/tetes.html#0,45,90/300`, `essai/planche.html#0,45,90/250`, `essai/poses.html#tir:0,coucou:-20/300` : des planches pour regarder (angles / taille).
- `essai/planche-romain.html` : la planche envoyée à Romain. `essai/film.html` + `python3 essai/filmer.py sortie.mp4` : le film (21 s, image par image dans Chromium, puis `ffmpeg`).

## Ce qui a été montré à Romain (23 novembre, 11 h)
- la page d'essai : https://claude.ai/artifact/Xc46TS5qmRis4ofSURCdRn
- le film `pisteuse-se-tourne.mp4` et la planche `planche-pisteuse.png` (dans la conversation).

## Ce qui n'est PAS fait (dit à Romain)
- **Un seul héros** : la Pisteuse fille, queue de cheval. Pas les garçons (leur visage, `visageM`), pas les âges (enfant, âgé), pas les trois autres rôles (leurs habits : manteau de l'Alchimiste, pourpoint du Barde, robe du Sage), pas les 31 autres coiffures, ni les barbes, les chapeaux, la garde-robe du Pisteur (`garderobe.js`), les objets, les villageois.
- **Rien dans le jeu** : `Persos.heros(h, {vue:'tete'|'buste'|'pied'})` est appelé partout (création, portraits, Carnet, cabane, descente, donjon : `heros-anime.js` a ses propres pantins). Il faudra décider écran par écran.
- **La vitesse n'est pas mesurée** sur une vieille tablette : chaque image refait tout le dessin (`innerHTML`). Si ça rame : garder en mémoire les dessins par angle (« cuire », comme au donjon), ou n'écrire que ce qui change (comme Mimi, `data-m`).
- **Petits défauts connus** : le bras du fond change de couche vers 16° (un trait apparaît d'un coup) ; vers 75° la mèche du milieu de la frange devient une barre fine ; les mains sont des moufles (un pouce seulement) ; pas de hochement de tête (seulement tourner et pencher) ; une seule expression (le sourire) ; de dos c'est simple (pas de couture, la nuque est nue).
- Les décisions du matin restent à prendre (`claude/maj-23-novembre-heros.md` dans le projet) : seize coiffures par sexe, la fin des niveaux, talents et objets, le code du visage à huit coiffures, etc.

## Pour continuer (dans l'ordre proposé, après l'avis de Romain)
1. Ses retouches sur la Pisteuse (le visage de trois quarts, les mains, ce qu'il trouve « pas joli »).
2. Le garçon (même corps, sa tête : `visageM`, ses yeux, une première coupe), puis les trois autres rôles (un volume par vêtement).
3. Les coiffures : chacune = `zone` + `frange` (son tracé de face existe déjà dans `persos.js`) + `meches` / `queue`. Compter une vraie séance.
4. Les poses de chaque rôle (Romain en veut plusieurs pour le Pisteur : furtif, chasseur, combattant).
5. Le brancher dans le jeu, écran par écran, après mesure sur tablette.
