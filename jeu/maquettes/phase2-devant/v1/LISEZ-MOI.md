# Maquette rapide de la phase 2 — les trois de devant contre l'armure (enquête 10)

> **⚠️ Cette version 1 est dépassée** : le 26 novembre au soir, Romain a refait la phase 2 à la voix (Bible § 18.14). La version 2 est dans le dossier au-dessus (`../LISEZ-MOI.md`, Bible § 18.15). Ici, tout est resté tel quel ; pour la reconstruire : `python3 construire.py` dans ce dossier.

**Chantier 3 du § 18.11 de la Bible** (go de Romain le 26 novembre, 19 h 49 : « On prend le chantier 3 du § 18.11 »).
**Ce qui a été construit, et les choix de Claude : Bible § 18.12.**

Une maquette pour **juger le système de combat**, pas les images : des ronds, des rectangles, des couleurs franches, aucun son, pas de fausse 3D. Le Pisteur n'est pas là : la maquette fait semblant.

- **La page** : https://claude.ai/artifact/JqMqmHTrbpStj8Y2Wrx61b (identifiant `906be6d8-fd34-478f-9b45-30a028166e5e`, version 1 : `1795720300-e5d3`, en ligne le 26 novembre à 20 h 11).
- **Pas dans la salle des jeux du site** (Romain ne l'a pas demandé). Pour l'y mettre : copier `phase2-devant.html` dans `brumeval/` de la branche `main`, ajouter une case dans `jeu/src/salle.js` (section « ⚔️ Combat final (enquête 10) »), reconstruire la salle (voir `PASSATION.md`, entrée du 26 novembre, 19 h 45). La page sait déjà afficher « ← La salle des jeux » dans sa pause quand l'adresse finit par `?depuis=salle`.

## Comment on joue

- **Téléphone debout** (couché, la page demande de le tourner) ; **sur tablette, le jeu est au centre** et on peut poser le doigt sur les bandes vides des côtés.
- **Le héros suit le mouvement du doigt**, où qu'on le pose sur l'écran (pas besoin de toucher le héros : le doigt ne le cache pas). Le mouvement est un peu agrandi (×1,5).
- **Les boutons, en bas** : 🧪 la potion (illimitée : rester immobile 2,5 s, toute la vie revient ; bouger ou prendre un coup la coupe) ; ✋ couper le gros coup (12 s de recharge, en camembert) ; 🔥 et ❄️ les remèdes (forme 2 seulement) ; 💥 taper (seulement dans la façon « Bouton »).
- **Sous la bulle** : le gros bouton jaune aux trois cases ouvre la fenêtre du code ; le rond vert 🏹 en haut à droite = « le Pisteur a crié son code » (pour faire semblant).
- **Sur ordinateur** : flèches ou ZQSD, Espace pour taper, 1 potion, 2 couper, 3 feu, 4 glace, Entrée le code, P le Pisteur, Échap la pause.

## Le menu Pause (les réglages, gardés d'une partie à l'autre)

- **Comment on fait mal à l'armure** (§ 18.10, point 5, pas tranché) : **Immobile** (le héros tape tout seul après 0,3 s sans bouger) ; **Bouton** (un bouton 💥 à garder appuyé, deux doigts : un qui bouge, un qui tape) ; **Point faible** (le héros tape tout le temps, mais seuls les coups sous le rond jaune font mal ; il s'ouvre 5 s, bouge, se ferme 1,8 s, se rouvre ailleurs ; ×1,5).
- **Le Pisteur crie son code** : au bouton 🏹 seulement, ou tout seul 10, 25 (de base) ou 45 s après le symbole.
- **Vitesse des attaques** : lente (×0,8), normale, rapide (×1,25).
- **Le symbole, après…** 15, 25 (de base) ou 33 % de la vie de l'armure enlevés à chaque forme.
- **Durée du ralenti** pendant qu'on tape le code : 3, 5 (de base) ou 8 s.
- **Les boutons qui clignotent** (le rond jaune quand c'est le moment) : oui / non.
- **Essais** : aller tout de suite à la forme 1, 2 ou 3, ou au symbole.

## Ce qu'il y a ici

- `phase2-devant.html` : la maquette en un seul fichier (c'est l'`index.html` de la page Claude).
- `construire.py` : fabrique `phase2-devant.html` à partir de `src/` (`python3 construire.py`).
- `src/regles.js` : **toutes les règles, sans dessin** (tourne aussi dans node). **Tous les chiffres sont dans `REG`, en haut**, avec (R) = décidé par Romain, (C) = point de départ de Claude.
- `src/dessin.js` : le dessin en formes simples.
- `src/ecrans.js` : la mise en page, le doigt, les boutons, les menus, la boucle ; `window.__p2` pour les essais (`fige` arrête le temps pour les captures).
- `src/page.html` : la page et ses styles.
- `tests/regles.js` : `node tests/regles.js` — **30 scènes** (le poing, le souffle, le gros coup coupé ou pas, les réparateurs, le symbole, la bulle, la danse, le code, le Pisteur au minuteur, les remèdes, les charges, le bouclier, les deux morts, la potion, la fin). 30 sur 30.
- `tests/robot.js` (+ `tests/robot-coeur.js`, le cerveau) : `node tests/robot.js facon=immobile|bouton|faible niveau=bon|moyen parties=6 pisteur=25` — un robot joue des parties entières.
- `tests/partie.py` : le même robot joue **dans la vraie page** (règles, dessin et boutons à chaque image), une partie par façon de taper, puis 25 s en vrai sur un téléphone ralenti 4 fois.
- `tests/gestes.py` : **les vrais gestes au doigt** (écran tactile simulé) : glisser, deux doigts à la fois, la potion, couper, le code tapé touche par touche, la mort sous la bulle. 13 sur 13.
- `tests/voir.py` : des captures de chaque scène, sur iPhone et sur iPad.

Il faut Python, Playwright et Chrome (`/usr/bin/google-chrome`) pour les essais `.py`.

## Les mesures (26 novembre, version 1)

- **Le robot** (il réagit 0,35 à 0,6 s après l'annonce, Pisteur à 25 s) : une partie entière en **3 à 3,7 minutes**, toutes façons de taper ; à peu près 30 s de vrai combat par forme, plus l'attente du Pisteur. Un enfant mettra sans doute deux fois plus de temps au combat. La façon « Point faible » est la plus lente (≈ 10 % de plus).
- **Dans la vraie page** : trois parties entières, aucune erreur, l'écran de fin s'affiche ; toutes les attaques et toutes les phases vues.
- **Vitesse** : 54 images par seconde en moyenne, 37 au pire, sur un téléphone ralenti 4 fois. **Pas vérifié sur un vrai appareil.**

## Pour remettre la page en ligne après un changement

`python3 construire.py`, puis publier `phase2-devant.html` comme `index.html` de la page Claude `906be6d8-fd34-478f-9b45-30a028166e5e` (outil `publish_files`, avec la dernière version comme `base_version`).
