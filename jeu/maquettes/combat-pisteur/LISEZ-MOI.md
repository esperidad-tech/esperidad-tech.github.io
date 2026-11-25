# Le combat du Pisteur — version 4 (25 novembre 2026) : le vrai mini-jeu, hors du jeu Brumeval pour l'instant

> **⚠️ 25 novembre, 15 h : la version 4 a été jouée et refusée par Romain (« ça marche pas »).** Ces sources sont le point de
> départ de la suite, pas un jeu fini. **Le nouveau système de jeu à construire** est dans `bible-section-17.md`, §17.10 à §17.21
> (quatre boutons qui changent dans l'ombre, un bouton d'ombre, une barre de vie, des golems chiffrés, plus de regard de Grosbec).
> Ce qui se garde et ce qui se jette : §17.19 ; l'ordre de construction : §17.21 et l'entrée du 25 novembre, 15 h, de `PASSATION.md`.
> La discussion orale de l'après-midi et les idées écartées : `decisions-orales-apres-midi.md`.

Enquête 10, combat final : pendant que ses amis occupent Grosbec, le Pisteur s'occupe de sa garde (les golems). Rien n'est branché dans le
jeu, rien n'est en ligne sur le site : c'est une page à part, comme les combats du Barde, du Sage et de l'Alchimiste.

## Fabriquer la page
`python3 construire.py` → `combat-pisteur.html` (un seul fichier, environ 630 Ko ; c'est la page publiée dans le canevas
https://claude.ai/artifact/GmvcxCF5gC89M9tmnCVyGU). Il lit le moteur des héros en volume dans `jeu/heros-vues/src` (hv-base, hv-tete,
hv-cheveux, hv-corps, hv-pantin, hv-poses, hv-positions, hv-donjon). Les essais ouvrent `/home/claude/pisteur4/index.html` : changer ce
chemin dans `tests/*.py` (ou copier `combat-pisteur.html` à cet endroit).
Tout le détail du jeu : Bible §17. Ce que Romain a dit à l'oral : `decisions-orales.md`. Les trois maquettes d'avant (refusées ou
dépassées) : `anciennes-maquettes/`.

## Ce qui est où (`src/`)
- `page.html` : la page, les trois boutons, les écrans (explication, cartes, pause, fin, « tourne le téléphone »).
- `base.js` : les mesures (1 pas = 46 points ; profondeur tassée à 66 % ; hauteurs entières : les personnages sont debout).
- `son.js` : les sons fabriqués par la page (aucun fichier de son ; jamais écoutés par Claude).
- `monde.js` : la salle (26 × 18 pas), ses obstacles (`haut` : on ne saute pas par-dessus, et ça arrête le regard de Grosbec), les chemins
  (une grille de demi-pas), `vue()` (qui voit qui), les cachettes, les points de ronde.
- `cartes.js` : les 33 améliorations (4 familles), les 20 cartes dorées (deux faces : caché / à découvert), le tirage de trois cartes.
- `regles1.js` : le Pisteur (dague, arc, bond ; caché : coup d'assassin, tir visé, saut d'ombre).
- `regles2.js` : voir et être vu (`garde` : calme / alerte / recherche), Grosbec le stratège (ses ordres, son regard), les huit golems.
- `regles3.js` : les projectiles, l'onde, les vagues (8), le choix des cartes, les particules.
- `sprites.js` : `PS` = le Pisteur en volume (le moteur `HV` du jeu) cuit sous 8 angles en planches ; `GS` = les golems cuits à la demande.
- `salle.js` : la salle peinte une fois (sol, murs, estrade, ombres, lumière des torches, des vasques et de la lune), les obstacles cuits à part.
- `dessin.js` : chaque image (fond, regard de Grosbec, champs de vision, tri par profondeur, effets, interface).
- `ecrans.js` : les doigts, les touches, les écrans, la boucle, la cuisson pendant l'explication, `window.__pt` pour les essais.
- `modeles/` : copies NON modifiées de `jeu/maquettes/combat-alchimiste/modeles/` (outils, golems, grosbec = les modèles du combat du
  Barde) et de `golems-alchimiste.js` (le cuirassé). `construire.py` « ouvre » le bestiaire comme `construire-combat.py` de l'Alchimiste.
- Quel modèle pour quel golem : trotteur = rôdeur ; danseur (le tourbillon) = javelot (son javelot est dessiné à part) ; lanceur (le frondeur)
  = mortier ; fonceur = bélier ; bouclier = porte-dalle ; soldat (le lancier à la faux) = faucheur ; cuirasse = cuirassé ; gros = colosse.

## Les essais (`tests/`, Python + Playwright)
- `robot.js` : un joueur automatique (caché : saut d'ombre, assassinat, tir visé ; repéré : il esquive le rouge et se bat ; contre un
  cuirassé il va se cacher). `window.__robotMal = true` : maladroit ; `__robotBrute = true` : ne se cache jamais exprès.
- `partie.py [inv] [dur] [mal] [brute]` : une partie entière, avec des captures. `gestes.py` : vrais gestes au doigt et écrans.
- `vitesse.py`, `profil.py` : images par seconde, processeur ralenti 4 ou 6 fois, sans carte graphique. `salle.py` : la salle entière en image.
- `fumee.py` : la page se charge et démarre sans erreur. `cuisson.py` : le coût d'une image du Pisteur.
- Adresses d'essai : `?finesse=0…2` (bloque la finesse), `?sexe=m&cheveux=brun&yeux=marron&peau=p3` (un autre Pisteur).
