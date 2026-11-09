# Les monstres animés du donjon : le contrat commun

Tous les monstres du donjon (sauf le rat d'égout, déjà fait dans `anim/rat/rat-anime.js`, qui sera adapté) suivent ce contrat, pour que le moteur les pilote tous de la même façon. La conception du donjon est dans `jeu/donjon/CONCEPTION-DONJON.md` (§3 règles, §5 monstres, §10 images).

## 1. Le fichier

- Chaque monstre a son dossier : `jeu/donjon/anim/betes/<id>/` avec trois fichiers :
  - `<id>-anime.js` : le module ;
  - `demo.html` : une page d'essai ;
  - `filmer.py` : une vidéo et une planche d'images pour vérifier.
- Le module est **autonome**. Il n'a aucune dépendance et injecte son propre CSS, avec un préfixe unique (`.bt-<id>-…`), pour ne jamais gêner les autres modules ni le jeu.
- Il s'enregistre ainsi :

```js
window.BETES = window.BETES || {};
BETES['<id>'] = { info: {...}, creer: function(conteneur, options){ ... return acteur; } };
```

- Le dessin reprend fidèlement la fiche du bestiaire validée par Romain (`jeu/donjon/bestiaire/betes/NN-<id>.js`, image `bestiaire/fiches/<id>.png`) : mêmes formes, mêmes couleurs, même lumière. Il est découpé en **pièces articulées**, comme le rat (`<g>` avec pivot ramené à (0,0), animées avec la Web Animations API).
- Le style est celui du jeu :
  - contour `#24182e` de 3 px ;
  - dégradés éclairés d'en haut à droite ;
  - halo et lueurs ;
  - grain.
- Le module **ne joue aucun son** : le moteur s'en charge, grâce aux rappels (`onImpact`, etc.).

## 2. `info`

```js
info: {
  id: 'ratcuir', nom: 'Rat cuirassé', rang: 'normal' | 'elite' | 'boss',
  cadre: {w: 220, h: 150},     // proportions du dessin (le conteneur aura ces proportions)
  sol: 0.86,                   // hauteur des pieds dans le cadre (0 = haut, 1 = bas) ; pour une bête qui vole : sa hauteur de vol
  vole: false,
  places: 1                    // 1 = une place de monstre normal, 2 = élite, 3 = toute la zone (boss)
}
```

La scène fait 960 × 540, et la zone de combat 960 × 372. Les héros sont à gauche, les monstres à droite, entre x = 480 et x = 960, avec le sol vers y = 340 :
- une place normale a environ 210 px de large (le cadre du rat fait 202 × 126) ;
- un élite a environ 320 px de large, et jusqu'à 300 px de haut ;
- le boss prend toute la zone des monstres : 490 × 340 environ.

Le SVG remplit le conteneur (`preserveAspectRatio="xMidYMax meet"`), et la bête regarde à gauche, vers les héros.

## 3. L'acteur renvoyé par `creer(conteneur, options)`

Les actions ponctuelles renvoient une **Promise**, résolue quand l'animation est finie et que la bête est revenue à son attente :

| Méthode | Ce qu'elle fait |
|---|---|
| `entrer()` | arrive (en courant, en volant, en descendant de son fil, en sortant de l'eau…) |
| `attaquer(nom, o)` | une attaque. `o.onImpact()` est appelé au moment du coup ; `o.scene` (un élément qui couvre la scène) et `o.vers` (le point visé, en coordonnées écran `{x, y}`) servent aux attaques à distance (toile, langue, saut). Sans `nom`, c'est l'attaque de base. |
| `touche(type)` | la réaction à un coup. Les types : `fleche`, `fleche-argent`, `fleche-lourde`, `dague`, `feu`, `lumiere`, `louche`, `colle`, `huile`, `nuage`, `givre`, `acide`, `bruit`, `bouclier` (il frappe un bouclier de runes), et `rebond` (il est immunisé : le coup rebondit, ça fait des étincelles, ça ne lui fait rien, et il nargue). |
| `special(nom)` | les moments propres à chaque bête (liste dans la demande du monstre) |
| `tousser()` | il tousse 3 fois dans le nuage, clairement, lentement |
| `fuir()` | la mort sans critique : il s'enfuit, terrorisé, et sort de l'écran (ou s'effondre, pour une machine ou un esprit) |
| `mourir()` | même chose que `fuir()` pour les bêtes qui ne fuient pas (le Gardien s'effondre, le feu follet s'éteint, Bourbe coule) |
| `exploser(scene)` | la mort par un critique : **violente et explosive**. Le corps éclate en brume noire, avec des éclats et une onde de choc, et il reste au sol des **cendres et des os** (des morceaux de métal pour une machine). C'est le moment le plus fort du jeu ; il dure environ 1,5 à 2 s, et les restes demeurent. |

Les états se cumulent et durent jusqu'à ce qu'on les enlève :
- `attendre()` : la boucle d'attente (respire, menace, bave ; jamais immobile) ;
- `etat(nom, on)` : les noms communs sont `enrage` (yeux rouges, tremble), `brule` (des flammes qui restent), `colle` (il se débat), `ebloui` (des étoiles qui tournent, une patte sur les yeux), `gele`, `ouvert` (son **point faible ouvert** se voit bien : il brille, il palpite), `dos` (retourné), `cible` (on le vise : il se tend, discrètement), plus les états propres à chaque bête ;
- `etatCourant()` renvoie une copie des états ;
- `arreter()` coupe toutes les boucles.

Pour les ancres :
- `ancre(nom)` renvoie le point **en coordonnées écran** (`{x, y}`, avec `getBoundingClientRect` d'un petit repère caché dans la pièce qui bouge) ;
- les noms : `tete`, `pointfaible`, `centre`, `bouche`, `pieds`, `haut` (le dessus de la bête, pour poser l'icône de cible et les badges) ;
- le moteur appelle `ancre` à chaque image pendant les animations, pour que l'icône de cible, les badges et les chiffres de dégâts **suivent la bête** (demande de Romain).

## 4. Ce que Romain attend des animations

- Ses mots : « Les animations sont importantes », « fais-toi plaisir, vas-y franco ».
- **Chaque réaction se lit d'un coup d'œil, pour un enfant de 11 ans**. Il y a une anticipation, le coup, puis le retour. Chaque pouvoir a une réaction différente :
  - la lumière fait des étoiles, et une patte se lève sur les yeux ;
  - le nuage fait tousser 3 fois ;
  - la colle fait se débattre ;
  - l'huile fait glisser et se retourner (sans fausse 3D) ;
  - le feu laisse des flammes et la douleur reste.
- L'attente donne de la vie et de la menace : respiration, regard, bave, petits gestes au hasard.
- La mort n'est **jamais trop rapide**. Le critique est une **explosion**, pas un flash blanc.
- Le module tourne sur une tablette :
  - pas de filtre animé sur de grandes surfaces (les flous sont précalculés, ou ce sont des dégradés) ;
  - pas plus d'environ 80 éléments animés à la fois ;
  - toutes les boucles s'arrêtent avec `arreter()`.

## 4 bis. La rapidité (exigence de Romain, 9 novembre, 10 h 48 : « ça rame même sur mon iPhone »)

Ces règles sont strictes. Le détail, avec la mesure, viendra dans `jeu/donjon/RAPIDITE.md`.

1. **Aucun filtre** sur la bête, ses pièces ou ses effets :
   - pas de filtre SVG (feTurbulence, feGaussianBlur, feDropShadow…), ni CSS (filter, drop-shadow, blur) ;
   - pas de mix-blend-mode, ni de box-shadow animée ;
   - pas de grain ; les halos et les flous deviennent des dégradés radiaux.
2. **Les animations ne touchent que `transform` et `opacity`.** Jamais de fill, stroke, d, points, r ou d'attributs SVG animés.
3. **Les états visuels sont des variantes dessinées d'avance**, qu'on montre ou qu'on cache. On ne change pas de couleur à la volée.
4. **Chaque pièce `<g data-j>` garde un contenu fixe**, pour qu'on puisse la « cuire » en image bitmap animée par la carte graphique.
5. **Les particules** sont simples, sans filtre, au plus environ 25 à la fois, et retirées à la fin.
6. **La mesure** se fait avec le processeur ralenti ×6 (CDP `Emulation.setCPUThrottlingRate`), sur une page mobile 1024 × 768 avec `device_scale_factor` 2 :
   - au moins 50 images par seconde à l'attente ;
   - au moins 40 pendant les actions.

## 5. La vérification

- `demo.html` montre la bête à sa vraie taille, sur un fond sombre de 960 × 540, avec trois héros figés à gauche (un simple rectangle suffit). Il y a un bouton par méthode et par type de coup, et un bouton « Tout jouer ».
- `filmer.py` (Playwright Python) fait deux choses :
  - une vidéo `<id>-demo.mp4` (ffmpeg libx264 `-preset veryfast`, yuv420p) ;
  - une planche `<id>-planche.png` : une douzaine de poses clés en grille, chacune légendée.
- **La machine n'a que 2 processeurs** : chaque lancement de Playwright passe par `flock /tmp/brumeval-pw.lock python3 …`, pour qu'un seul navigateur tourne à la fois. Pour les captures de contrôle : `device_scale_factor` 1.
- On ne touche à **aucun fichier hors de son dossier**, et on ne fait ni commit ni push : Claude (le chef de chantier) s'en occupe.
