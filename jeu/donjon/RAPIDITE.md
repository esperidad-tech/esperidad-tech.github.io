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
| Vignette du critique | une toile à la taille de la scène (1,5 × de densité au plus), redessinée 1 s en tout, puis vidée. (Essai raté : une image de 2 400 px agrandie ×6 — fluide, mais elle faisait fermer le jeu sur iPhone : voir R9.) |
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

**R9 — La mémoire (iPhone : un onglet qui dépasse est fermé net, « ça quitte le jeu »).** Romain, 9 novembre, 15 h 13 :
le critique fermait le jeu. Cause : la vignette était une image de 2 400 px agrandie jusqu'à ×6 → un calque de
31 000 × 31 000 px réels (densité 3). Règles :
- **aucun calque de plus de 4 096 px de côté en pixels réels**, en comptant la densité de l'écran (3 sur iPhone) ET la plus
  grande échelle de son animation et de celles de ses parents (un élément de 640 px dans un parent qui arrive à ×3,4 :
  640 × 3,4 × 3 ≈ 6 500 px). Un effet plein écran ne s'agrandit pas : il se redessine (une toile à la taille de la scène)
  ou il est fait de morceaux plus petits ;
- **un effet plein écran = au plus la taille de la scène, à 1,5 × de densité au plus** (une toile de 960 × 540 à 1,5 ≈ 5 Mo) ;
  une grande image (1 920 × 1 080) se pose en fond d'un cadre à la taille de la scène, pas en élément qui déborde ;
- **toute toile (canvas) est vidée dès qu'elle a servi** (`cv.width = cv.height = 0`) : Safari compte toutes les toiles
  vivantes, même celles qui attendent d'être jetées ;
- une petite image de dégradé (halo) qui vit dans un parent agrandi : sur son propre calque (`will-change: transform`),
  la carte graphique l'étire sans repeindre un grand calque ;
- la vérification : Playwright en émulation iPhone (844 × 390, `device_scale_factor` 3, mobile, tactile), pendant le
  critique : la liste des calques (CDP `LayerTree`, taille × échelle des parents × 3 : aucun > 4 096 px), les toiles
  vivantes (somme largeur × hauteur × 4), les sons pré-calculés (somme des AudioBuffer).
  Mesuré le 9 novembre : avant, un calque de 31 186 px de côté et 37 Mo de toiles jamais vidées ; après, le plus grand
  calque fait 3 167 px (les rayons, une image de 1 024 px étirée), 0 toile vivante hors cuisson (18 Mo au plus pendant).
  Les sons pré-calculés de `son.js` pèsent ~80 Mo en combat (70 AudioBuffer) : à surveiller par l'atelier des sons.

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

## 4 bis. Le 15 novembre : un combat en temps réel (Léo) — ce qu'on a appris de plus

Romain : « ça rame de partout », « ça fait que quitter sur l'iPhone ». Les règles R1 à R9 supposaient qu'au repos le fil principal dort. **Dans un combat en temps réel, il ne dort jamais** (une boucle par image fait avancer le combat). Alors :

**R10 — En temps réel, rien ne tourne en boucle.** Chaque animation en cours (même jouée par la carte graphique) est recalculée par le fil principal à chaque image qu'il fabrique, et un personnage dont une seule pièce bouge reste découpé en plusieurs calques (de la mémoire). Mesuré en pause, ×6 : 30 images/s avec les animations d'attente des trois héros, 49 sans. Un combat en temps réel pose `SALLE.tempsReel` et `SALLE.tissusFiges` : héros et monstres immobiles entre deux gestes.
**R11 — Ne jamais réécrire un grand morceau de page pendant le jeu** (`innerHTML` d'une rangée d'icônes, d'un panneau) : le construire une fois, puis ne changer que des classes et de petits textes.
**R12 — Aucun effet plein écran « vivant »** : ni `filter` sur un décor, ni `mix-blend-mode` sur un calque qui couvre la salle (toute la salle est alors recomposée à part, à chaque image). Un décor plus clair = une image plus claire, faite à la construction.
**R13 — Ne pas mesurer avec une boucle par image.** `DJ.mesurerCritique` réveillait le fil principal à chaque image du critique : la mesure faisait ramer ce qu'elle mesurait. Mesurer du dehors (`perf-leo.py`, `perf.py`).
**R14 — Une pièce déplacée par le JavaScript n'est écrite que si elle a bougé pour de bon** (un tiers de point, un quart de degré) : au repos, un personnage qui respire ne coûte presque plus rien.
**R15 — Aucun filtre animé sur un personnage entier** (15 novembre, 13 h 54 : « la rafale de coups, ça fait ramer extrêmement le téléphone »). Le coup reçu par un héros animait `filter:brightness() drop-shadow()` sur tout le héros (`H._flash`) : la tablette devait l'aplatir et le refaire à chaque image, et chaque coup en rajoutait un par-dessus. Un éclat, une lueur, un halo = un élément posé une fois, dont seule l'opacité (ou la taille) bouge.
**R16 — Les sons d'un combat en temps réel sont fabriqués à l'avance** (`Son.preparerBruits`) : fabriquer un son en direct coûte au fil principal (jusqu'à 0,2 s d'un coup sur l'ordinateur d'essai non ralenti), au pire moment. On les prépare pendant un écran calme (le passage, une cinématique), phase par phase ; un son pas prêt est fabriqué en direct.
**R17 — La secousse d'écran bouge toute la scène : rarement, brièvement, jamais deux à la fois** (`Fx.tremble` ; en temps réel : 0,3 s au plus, une pause après). Et toutes les images d'une animation de `transform` ont **la même forme** (les mêmes fonctions, dans le même ordre : jamais « none » au bout d'une liste « translate rotate ») : sinon Safari ne la confie pas à la carte graphique.
**R18 — Un effet qui revient très vite ne fabrique rien** (seize coups en six secondes) : le même élément, posé une fois, qu'on déplace et qu'on rallume ; pas de particules, pas de secousse, un son un coup sur deux.
**Essayé, à ne pas refaire sans mesure sur un vrai appareil** : peindre un personnage sur une toile (canvas) à chaque image — deux fois plus lent, sur la machine d'essai, que ses pièces sur leurs calques.
**Les outils** : `moteur/perf-leo.py` (les images par seconde du fil principal, où part son temps, les fonctions les plus chères, avec ou sans le son), `moteur/memoire.py` (émulation iPhone : le nombre de calques et leur poids).
**Ce qui reste cher** : fabriquer les sons en direct (un quart du temps du fil principal en combat) ; les gestes des héros (une cinquantaine de pièces animées chacun).

**R19 — Aucun filtre, aucun fondu, aucun masque sur un effet de sort** (15 novembre, 19 h 28 : « il y a encore des sorts qui font des sautes de FPS » ; 21 h 14 : « ça bug et ça quitte »). `filter` (drop-shadow, blur, brightness), `mix-blend-mode`, `clip-path` sur un élément qui bouge : un iPhone refait le calcul à chaque image, élément par élément — et un sort en crée vingt ou trente. On en a compté de 57 à 65 sortes par phase. **Une lueur se dessine** : la même forme, plus grande et presque transparente, sous la vraie (`lueurForme`, `lueurTrait`, `lueurRonde` dans `anim/heros/src/f-moteur.js`), ou un rond en dégradé (`tache`, `l-reactions.js`) ; un éclat = un voile dont on ne change que l'opacité. Pour vérifier : `test-leo.py` (`SEUL=filet`) relève tout ce qui est filtré pendant que les trois héros lancent leurs sorts.

**R20 — Rien ne se fabrique pendant un combat en temps réel.** Ni un son (la liste `BRUITS` de `leo.js` doit être complète : `sautes-leo.py` nomme chaque son encore fait en direct), ni une musique, ni le lot de « bruitages lourds » des combats ordinaires. Fabriquer UN son occupe le fil de l'écran jusqu'à 0,4 s sur une machine lente. Le combat attend que tout soit prêt (`sonsPrets`), avec une limite pour ne jamais rester bloqué.

**R21 — Mesurer sort par sort, pas en moyenne** : `python3 moteur/sautes-leo.py <phase> [--froid]`. Sur l'ordinateur d'essai (pas de carte graphique), l'écart entre deux images est bruité par le dessin lui-même : regarder aussi les **longues tâches** du fil de l'écran, et ne comparer que deux mesures faites à la suite.

## 4 ter. Le 19 novembre : le critique qui tue, sans attente (Romain, 10 h 48 : « dès qu'il a mis le coup de dague, tout de suite l'animation se fait […] il grossit pas, il explose direct […] et fais attention aux FPS »)

Avant, l'explosion était précédée d'un temps suspendu et d'un gonflement (0,4 à 1 s) : le travail de fabrication (les
volutes, les morceaux, les copies de pièces) se cachait dedans. Maintenant la bête éclate **à l'instant du coup**. Donc :

**R22 — À l'instant du coup, on ne fabrique que ce qui se voit tout de suite.** Plus de longue animation préparée « pour
plus tard » (le gonflement du rat : seize poses sur six pièces — son retrait fait passer le travail du rat de 75 à 46 ms au
ralenti ×4). Ce qui peut attendre un quart de seconde (les restes au sol, les filets de fumée) part avec un `setTimeout`.
**R23 — Une fumée courte n'a pas de traîne.** La courbe d'avant (`cubic-bezier(.12,.75,.3,1)` sur 3 s) laissait la fumée
presque invisible pendant ses deux dernières secondes : des calques translucides animés pour rien, et le combat qui
attendait. La courbe du 19 novembre (`cubic-bezier(.3,.5,.6,1)` sur 0,9 s) : aussi noire qu'avant pendant le premier
tiers de seconde (elle cache la bête qui disparaît), puis partie.
**R24 — Le combat reprend quand la fumée est partie, pas avant** : on ne lance pas le geste suivant par-dessus une
explosion (deux gros effets à la fois).

**Les mesures** : `moteur/cout-critique.py` (le travail à l'instant du coup, bête par bête, ×4 : 38 à 75 ms ; la première
image d'après : 94 à 235 ms au ralenti ×4, soit 25 à 60 ms sur un appareil normal) ; `moteur/perf.py rats crypte toiles`
(les images par seconde pendant le geste du Pisteur : pareilles qu'avant, à la mesure près — 28,6 → 30,6, 31,5 → 30,6,
27,5 → 26,7 —, et l'effet dure 1 s au lieu de 3 à 6) ; `moteur/filmer-critique.py` (le film, image par image).
**Ce qui reste cher** : les neuf bêtes autres que le rat dessinent encore leur fumée en SVG (un calque repeint par le fil
principal à chaque image — §1, point 1) ; seul le rat a des volutes « cuites ». Les passer en images cuites reste à faire
(« aligner le critique des 9 autres monstres sur celui du rat »).

## 5. Ce qui reste à faire

- **Le critique et le nuage** restent sous l'objectif (≈ 31-41 images/s « écran »), surtout à cause du compositeur simulé
  sur la machine de test (30 volutes translucides qui se superposent ; le zoom de toute la scène). À vérifier sur l'iPhone
  de Romain avant de toucher au dessin (moins de volutes, plus grandes = un autre rendu : à décider avec lui).
- Le texte « CRITIQUE ! » : son reflet doré est un `background-position` animé (repeint 0,9 s). Le remplacer par un reflet
  en image qui glisse demanderait de retoucher l'effet : à faire avec l'accord de Romain.
- Le nombre de calques (~380) vient de l'ordre d'empilement des pièces (une pièce animée entre deux dessins fixes oblige
  à couper). Les prochains modules doivent limiter les pièces animées au repos (R6).
- Mesurer sur un vrai iPhone / iPad (Safari) : la même page, sans rien changer, à l'œil et avec l'outil de Safari.
