# Maquette rapide de la phase 2 — les trois de devant contre l'armure (enquête 10)

**Version 2 (26 novembre, nuit)** : d'après les décisions de Romain à la voix, **Bible § 18.14** ; ce qui est construit et les choix de Claude : **Bible § 18.15**.
Go de Romain : « Vas-y, go pour faire la maquette » (26 novembre, 23 h 21). La version 1 (téléphone debout, vue de face, danse sous la bulle : § 18.12) est rangée dans `v1/`.

Une maquette pour **juger le système de combat**, pas les images : des ronds, des rectangles, des couleurs franches, **aucun son**. **Le Pisteur n'est pas là** : un faux Pisteur crie son code (au bouton 🏹, ou tout seul après un temps réglable).

- **La page** : https://claude.ai/artifact/JqMqmHTrbpStj8Y2Wrx61b (la même adresse que la v1 ; identifiant `906be6d8-fd34-478f-9b45-30a028166e5e` ; version 2 : `1795732992-8911`, en ligne le 26 novembre à 23 h 43).
- **Pas dans la salle des jeux du site** (Romain ne l'a pas demandé). Pour l'y mettre : copier `phase2-devant.html` dans `brumeval/` de la branche `main` et ajouter une case dans `jeu/src/salle.js` (section « ⚔️ Combat final (enquête 10) ») ; la pause sait afficher « ← La salle des jeux » avec `?depuis=salle`.

## Comment on joue (comme le combat du Pisteur)

- **Téléphone couché.** La salle vue d'en haut, en biais ; l'armure au fond. Sur tablette, la salle au centre, les pouces sur les côtés.
- **Le pouce gauche** se pose où il veut sur la moitié gauche de l'écran : le héros court (3,6 pas par seconde).
- **Les quatre boutons, à la place de ceux du Pisteur** : le gros bouton ❄️ = **le javelot de glace** (1,5 s, 10 points) ; 🔥 = **la boule de feu** (3 s, 50 points) ; ✚ = **le soin** (2 s, +50 ; à la place du bandage) ; ⤴ = **le saut** (3 pas ; à la place du saut du Pisteur ; il part dans la direction du pouce).
- **Lancer, c'est rester sur place** : on ne commence pas un sort en courant (le bouton tremble), et bouger le coupe. Un gros coup le coupe aussi ; les flammes, la pierre brûlante et le rayon, non. Le cercle autour du héros, et le bouton lui-même, se remplissent pendant qu'on lance.
- **Viser** : les sorts partent tout seuls vers l'armure. **Toucher un réparateur** le prend pour cible (un cercle jaune sous lui).
- **Les colonnes arrêtent les sorts** (le feu ou le givre reste collé sur la pierre).
- **Les barres, avec des chiffres** : ma vie en haut à gauche (verte, orange de 70 à 61, rouge à 60 et moins) ; celle de l'armure en haut au milieu (dorée sous la bulle), avec les trois tiers en petits ronds.
- **La bulle** : quand le tiers n'a plus de vie, mon symbole s'affiche en grand puis se range sous ma barre ; le gros bouton jaune aux trois cases ouvre la fenêtre du code (ralenti) ; le cri du faux Pisteur s'affiche à gauche, sous mon symbole.
- **Sur ordinateur** : flèches ou ZQSD ; 1 glace, 2 feu, 3 soin, Espace le saut, Entrée le code, P le Pisteur, Échap la pause ; clic sur un réparateur.

## Le menu Pause (gardé d'une partie à l'autre)

- **Le saut revient après** 0,5, 1,5 (de base) ou 3 s.
- **Sous la bulle, de 4 s à 2 s en** 2 ou 4 minutes (de base).
- **Le Pisteur crie son code** : au bouton 🏹, ou après 15, 30 (de base) ou 60 s.
- **La vie de chaque tiers** : 400 (pour essayer vite) ou 1000 (la vraie).
- **Le ralenti pour taper le code** : 3, 5 (de base) ou 8 s.
- **Les boutons qui clignotent** : le soin quand la barre est rouge, le bouton du code quand le Pisteur a crié.
- **Essais** : aller tout de suite au tiers 1, 2 ou 3, ou au symbole.

## Ce qu'il y a ici

- `phase2-devant.html` : la maquette en un seul fichier (l'`index.html` de la page Claude), fabriquée par `python3 construire.py` à partir de `src/`.
- `src/regles.js` : **toutes les règles, sans dessin** (tourne dans node). **Tous les chiffres sont dans `REG`, en haut**, marqués (R) Romain ou (C) Claude ; les réglages du menu dans `DEFAUT`.
- `src/dessin.js` : la vue en biais, en formes simples. `src/ecrans.js` : le pouce, les boutons, les menus, la boucle (`window.__p2` pour les essais ; `fige` arrête le temps ; `window.__pilote` laisse un robot tenir la manette). `src/page.html` : la page et ses styles.
- `tests/regles.js` : `node tests/regles.js` — **55 scènes** (les sorts, les coups qui coupent ou pas, les colonnes, la vague et ses abris, le tirage, les réparateurs, les mains, les orbes, les doigts, le rayon, la coque, la danse, les crevasses et le saut, la mort, la bulle, le code, la fin). 55 sur 55.
- `tests/robot.js` + `tests/robot-coeur.js` : `node tests/robot.js niveau=bon|moyen parties=4 pisteur=30 vie=1000` — un robot joue des parties entières.
- `tests/partie.py` : le même robot **dans la vraie page** (règles, dessin, boutons) ; puis les trois tiers en vrai sur un téléphone ralenti 4 fois.
- `tests/gestes.py` : **les vrais gestes au doigt**, téléphone couché (le pouce, deux doigts avec le saut, un sort, le soin, toucher un réparateur, le code, la mort). 12 sur 12.
- `tests/voir.py` : des captures de chaque scène, téléphone couché et tablette.
- `v1/` : la version 1 (Bible § 18.12), telle quelle.

Il faut Python, Playwright et Chrome (`/usr/bin/google-chrome`) pour les essais `.py`.

## Les mesures (version 2)

- **Le robot « bon »** (il réagit 0,35 s après l'annonce), 1000 points par tiers, Pisteur à 30 s : **une partie en 10 à 13 minutes** ; à peu près 3 minutes de combat par tiers, le troisième le plus long (2,5 à 5,5 minutes) ; 1 à 7 morts. Avec 400 points par tiers : **3 minutes**. Un enfant mettra plus longtemps. Le robot reçoit surtout les doigts, les flammes et le rayon.
- **Dans la vraie page** : deux parties entières, aucune erreur, toutes les attaques vues, l'écran de fin s'affiche.
- **Vitesse** : 60 images par seconde sur un téléphone ralenti 4 fois, dans les trois tiers. **Pas vérifié sur un vrai appareil.**

## Pour remettre la page en ligne après un changement

`python3 construire.py`, puis publier `phase2-devant.html` comme `index.html` de la page Claude `906be6d8-fd34-478f-9b45-30a028166e5e` (outil `publish_files`, avec la dernière version comme `base_version`).
