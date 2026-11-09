# La rapidité du donjon — règles pour TOUS les modules (bêtes, héros, décors, effets)

Romain, 9 novembre, 10 h 48 : « Même sur mon iPhone… ça rame. Optimise à mort, sans sacrifier la qualité de l'animation. »
Ce fichier dit **où partait le temps**, **ce qui a été fait** dans la salle d'essai (`essai/`), et **les règles** que chaque
nouveau module doit suivre. Il complète `anim/betes/CONTRAT.md` (section 4 bis).

---

## 1. Où partait le temps (mesuré, processeur ralenti ×4 et ×6)

Un navigateur fait chaque image en deux endroits :
- le **fil principal** (le processeur) : le JavaScript, le calcul des styles, la mise en page, la *peinture* (dessiner les
  formes en pixels), puis l'envoi des calques à la carte graphique ;
- le **compositeur** (la carte graphique) : il pose les calques déjà peints, en les déplaçant / tournant / estompant.
  Une animation de `transform` ou d'`opacity` sur un élément HTML se joue **ici seulement**, sans le fil principal.

Avant : les héros et les rats étaient de grands SVG dont on animait les `<g>`. Chaque image, le fil principal recalculait
le style, la mise en page SVG et **repeignait tout le personnage**, filtres compris (grain, flous, ombres). Au repos, avec
3 héros + 3 rats, il ne tenait que 12 à 15 images/s (×4), 7 à 9 pendant le critique. Tout ce qui bougeait bougeait à ce rythme.

Ce qu'on a appris en chemin (à ne pas refaire) :
1. **Un `<g>` SVG animé = tout le SVG repeint à chaque image** (Chrome comme Safari). Le pire des cas.
2. **Les filtres vivants** (SVG ou CSS `filter`, `drop-shadow`, `blur`) sont recalculés à chaque image.
3. **Chaque image du fil principal coûte en proportion du nombre d'animations en cours et du nombre de calques** : le
   navigateur recalcule le style de *tous* les éléments animés (même ceux que la carte graphique joue seule) et renvoie
   tous les calques. Avec ~170 animations et ~380 calques, une image du fil principal coûte ~20 ms au ralenti ×4.
   D'où la règle d'or : **au repos, presque aucune image du fil principal**.
4. **Lire après avoir écrit** (`getComputedStyle`, `getBoundingClientRect`, `getAnimations()`, après un `style.… =`,
   un `animate()` ou un `cancel()`) force un recalcul complet. Dans une boucle sur 30 pièces : 30 recalculs.
5. Certaines animations **ne peuvent pas** être jouées par la carte graphique et réveillent le fil principal à chaque image :
   `composite: 'add'`, `background-position`, tout ce qui n'est pas `transform` / `opacity`, une boîte de 0 × 0 px
   (Chrome la juge « sans effet visible »), un élément sous un `mask-image` ou un `clip-path` qui bouge (la carte doit
   redessiner une surface cachée + le masque à chaque image).

## 2. Ce qui a été fait dans la salle d'essai

| quoi | comment |
|---|---|
| Héros et rats | **cuits** au chargement par `anim/cuire.js` : chaque pièce articulée devient un `<div>` (même hiérarchie, même pivot, mêmes `data-*` / class), le dessin fixe devient de petites images PNG (filtres cuits dedans une fois), les tissus / cordes / fioles restent de petits îlots SVG. La cuisson se fait **pendant l'écran du sac** (`cuire()` dans `jeu.js`, ~1 à 2 s). |
| Héros au repos | « **endormis** » : pas de boucle `requestAnimationFrame`. Le vent dans les capes est une animation CSS des îlots ; la simulation des tissus ne tourne que pendant leurs propres gestes (+1,2 s). |
| Halo « choisi » | une silhouette lumineuse cuite (pas de `drop-shadow` vivant), montrée seulement quand le héros est choisi. Seuls les petits îlots des capes gardent une lueur fixe (peinte une fois, puis déplacée). |
| Petits gestes des rats | sur une couche à part, en `replace` (jouable par la carte graphique) ; `add` seulement s'ils se chevauchent. |
| Badges au-dessus des rats | ne suivent un rat **que pendant qu'il bouge** (événement `bete-bouge` envoyé par le module), et seulement ce rat ; lecture de toutes les positions d'abord, écriture ensuite. |
| Particules, vols (fiole, flèche) | trajectoire calculée **une fois** puis jouée en animation (`Fx.particule`, `vol`) : plus de boucle par image. |
| Vignette du critique | une texture (image) mise à l'échelle, au lieu d'un dégradé repeint. |
| Rayons et étoile du critique | **cuits en images** (canvas) pendant l'écran du sac, au lieu d'un dégradé conique masqué et d'un `clip-path` (identiques à l'œil). Grandes images d'effets décodées d'avance. |
| Moments « figer » des rats / héros | lecture de toutes les pièces d'abord, puis tout couper / écrire (plus de recalcul par pièce). |
| Bandeau du conteur en haut | retiré pendant le combat (demande de Romain) ; deux petites barres de volume à la place. |

## 3. Les règles (pour chaque nouveau module, décor ou effet)

**R1 — Cuire.** Toute bête / tout héros respectant `anim/betes/CONTRAT.md` passe par `anim/cuire.js` :
```js
var modele = await Cuire.cuire(svg, {ilot: '[data-souple]', res: 1.6, lueur: {couleur: '#ffe2a0'}}); // une fois
var copie  = modele.cloner(conteneur);   // {racine, vue, defs} : chercher les pièces dans copie.vue
Cuire.point(el, x, y);  Cuire.ctm(el);   // au lieu de getCTM()
Cuire.ilot(parent, '<circle …/>');       // un petit effet SVG à la volée, qu'on anime en transform / opacity
```
Le module expose `preparer(o)` (Promise) et garde la voie SVG d'origine quand la cuisson n'a pas eu lieu.
La préparation se lance **pendant un écran calme** (le sac, une carte, une histoire), jamais au début d'un combat.
Résolution : `res = clamp(0,8 ; 2,6 ; largeur à l'écran en px / unités du dessin × échelle × devicePixelRatio × 1,25)`.

**R2 — Seulement `transform` et `opacity`.** Ni filtre, ni `mask-image`, ni `clip-path`, ni `box-shadow`,
ni `background-position`, ni attribut SVG animé. Un dégradé compliqué, un halo, une ombre douce : **une image** faite une
fois (canvas → `toBlob`, ou `Cuire.image`), qu'on déplace et qu'on estompe.

**R3 — Au repos, le fil principal dort.** Aucune boucle `requestAnimationFrame` permanente. Une boucle par image ne tourne
que pendant une action, et s'arrête seule (comme les badges : `bete-bouge` + un délai de grâce). Les respirations et le
vent sont des animations en boucle jouées par la carte graphique.

**R4 — Lire d'abord, écrire ensuite.** Dans toute boucle par image ou sur plusieurs pièces : une phase de lecture
(toutes les positions, tous les `getComputedStyle`), puis une phase d'écriture. Ne pas appeler `getAnimations()` dans
un geste qui revient souvent : garder soi-même la liste de ses animations.

**R5 — Des animations jouables par la carte graphique.** `composite: 'replace'` (pour « ajouter » un geste, une couche
`<div>` à part) ; jamais une boîte de 0 × 0 px animée (`.cu` fait 1 px) ; pas de `steps()` pour imiter une boucle JS.

**R6 — Peu d'animations en même temps, peu de calques.** Chaque animation en cours et chaque calque coûtent à **chaque**
image du fil principal. Pas de boucle d'attente « pour rien » ; une boucle sur la pièce parente plutôt que sur chaque
enfant ; une variante cachée arrête ses animations. `will-change` seulement sur quelques éléments (trop de calques
forcés : mémoire, et sur iPhone des morceaux qui disparaissent).

**R7 — Les effets.** Particules : simples, sans filtre, ~25 au plus, trajectoire précalculée, retirées à la fin.
Les grandes images d'effets sont décodées d'avance (`img.decode()`) pendant un écran calme.

**R8 — La mesure.** `essai/perf-tablette.py` (toujours sous `flock /tmp/brumeval-pw.lock`) : page mobile 1024 × 768,
`device_scale_factor` 2, processeur ralenti ×4 et ×6, 12 phases (attente, potions, critique, flèche, tour des rats, nuage…).
- « **écran** » = les images vraiment affichées (ce que l'œil voit des animations jouées par la carte graphique) ;
- « **fil principal** » = ses images par seconde (au repos, le moins possible) et sa plus longue tâche ;
- `--raf` = le pire cas (une boucle qui forcerait le fil principal à chaque image) ; `--captures DOS` = des captures aux
  mêmes instants pour comparer la qualité à l'œil.
Attention : sur la machine de test (sans carte graphique, 2 processeurs partagés), le compositeur est **simulé par le
processeur** et sature pendant les gros effets (nuage, critique) : le chiffre « écran » y est pessimiste. Un iPhone ou un
iPad fait ce travail sur sa carte graphique.
Objectifs : ≥ 55 images/s au repos et ≥ 45 pendant les actions au ralenti ×4 ; pas d'image > 50 ms hors chargement.

## 4. Les chiffres (salle d'essai, 9 novembre)

Images par seconde de ce que l'œil voit bouger (entre parenthèses : la pire attente entre deux images, en ms).
Avant, tout était repeint par le fil principal : son rythme était celui de l'animation. Après, c'est le compositeur.

| phase | avant ×4 | après ×4 | avant ×6 | après ×6 |
|---|---|---|---|---|
| attente (3 héros + 3 rats) | 14,5 (200) | 52,0 (50) | 12,7 (217) | 51,5 (57) |
| potion d'huile | 12,3 (200) | 50,0 (50) | 11,2 (267) | 44,7 (64) |
| critique (explosion) | 8,3 (350) | 33,3 (99) | 7,1 (433) | 32,8 (87) |
| le Sage étudie | 15,2 (167) | 47,9 (59) | 11,6 (183) | 51,3 (44) |
| tour des rats | 17,3 (167) | 59,2 (37) | 15,0 (150) | 58,7 (38) |
| attente avec cendres | 18,8 (117) | 55,2 (48) | 16,2 (200) | 55,5 (54) |
| flèche | 17,9 (133) | 48,3 (41) | 13,5 (183) | 49,9 (50) |
| potion de feu | 15,2 (217) | 51,7 (43) | 9,4 (333) | 51,4 (47) |
| second tour des rats | 14,0 (167) | 55,4 (44) | 9,8 (250) | 55,5 (50) |
| attente, un rat brûle | 14,8 (167) | 50,7 (48) | 10,8 (200) | 53,9 (54) |
| nuage du fumigène | 10,9 (200) | 30,9 (114) | 10,1 (250) | 40,6 (88) |

L'entrée dans la salle (construction de la scène) a une tâche de ~0,3 s au ralenti ×4 : c'est le « chargement ».

## 5. Ce qui reste à faire

- **Le critique et le nuage** restent sous l'objectif (≈ 31-41 images/s « écran »), surtout à cause du compositeur simulé
  sur la machine de test (30 volutes translucides qui se superposent ; le zoom de toute la scène). À vérifier sur l'iPhone
  de Romain avant de toucher au dessin (moins de volutes, plus grandes = un autre rendu : à décider avec lui).
- Le texte « CRITIQUE ! » : son reflet doré est un `background-position` animé (repeint 0,9 s). Le remplacer par un reflet
  en image qui glisse demanderait de retoucher l'effet : à faire avec l'accord de Romain.
- Le nombre de calques (~380) vient de l'ordre d'empilement des pièces (une pièce animée entre deux dessins fixes oblige
  à couper). Les prochains modules doivent limiter les pièces animées au repos (R6).
- Mesurer sur un vrai iPhone / iPad (Safari) : la même page, sans rien changer, à l'œil et avec l'outil de Safari.
