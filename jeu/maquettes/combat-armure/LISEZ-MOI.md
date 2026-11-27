# La phase 2 de l'enquête 10 : les trois de devant contre l'armure de Grosbec (la vraie version, chantier 5)

Le combat du Barde, du Sage ou de l'Alchimiste contre l'armure de Grosbec, d'après la Bible (§ 18.14 : toutes les règles décidées
avec Romain à la voix ; § 18.19 : cette version). Il part de la maquette v2 (`jeu/maquettes/phase2-devant/`, § 18.15) et des
retours de Romain du 27 novembre (0 h 41).

**En ligne** : https://esperidad-tech.github.io/brumeval/combat-armure.html (dans la salle des jeux, « ⚔️ Combat final (enquête 10) »,
case 🛡️ « L'armure de Grosbec »). Le Pisteur y fait toujours semblant (un bouton 🏹, ou un minuteur dans le menu) : son vrai jeu de
la phase 2, c'est le chantier 6.

## Ce qui a changé depuis la maquette v2 (les retours de Romain)
- **La salle en plein écran**, comme le Pisteur : la caméra suit le héros, les boutons sont posés par-dessus la salle (plus de bandes
  noires sur les côtés). La salle est plus grande : 18 pas sur 10,5 (la v2 : 14 sur 10). Sur un téléphone, toute la largeur se voit ;
  sur une tablette, toute la salle.
- **Les colonnes sont devenues des rochers qui tombent du plafond, à hauteur d'homme** (1,2 pas de large, 1,15 de haut) : on se
  cache derrière, ils arrêtent les sorts, mais on voit ce qu'il y a derrière.
- **L'abri derrière un rocher** est exactement ce que le dessin montre (le dessin du feu se sert de la même fonction que les règles).
- **On vise un réparateur en le touchant n'importe où sur son corps**, même à moitié caché ; un petit œil rouge reste au-dessus de lui.
- **Le rayon de la lanterne soigne de plus en plus fort** : 5 points par seconde, puis 5 de plus à chaque seconde où on ne le coupe
  pas, jusqu'à 45 (200 points s'il n'est jamais coupé). Quand on le coupe, sa force ne monte plus.
- **Quand le héros est mort, pas de rayon** : il n'en part pas, et celui qui brillait s'éteint.
- **Pendant le rayon, la main se resserre** (12° entre deux doigts au lieu de 30°) et **aucun doigt ne tombe sur le rayon**.

## Ce qui est fait en vrai (le « travail professionnel » demandé)
- **La salle rendue en volume** avec Blender, comme la salle du Pisteur (`decor3d/`, voir plus bas) : un fond de pierre, la grande
  niche de l'armure (ses tuyaux, l'anneau du drainage), deux murs en biais avec les portes des réparateurs, les deux lanternes (la dorée,
  la rouge) et leurs rigoles d'or creusées dans le sol jusqu'au cercle de bronze de l'armure, quatre brasiers. Les six rochers sont
  rendus à part (quatre rochers cassés, deux blocs de voûte) : le jeu les pose où ils tombent.
- **L'armure** : le modèle de Grosbec du combat du Barde (`src/modeles/grosbec.js`, deux lignes ajoutées : sa pose du moment, sa
  teinte). Chaque coup a son geste, qui EST l'annonce : le poing abattu du côté qui va exploser, les deux poings au ciel puis le pied
  qui frappe (le plafond), le corps penché en arrière et la poitrine qui rougit (la vague), le bras tendu vers une porte (les
  réparateurs), la main glacée ou brûlante levée (deuxième tiers), les deux mains à plat sur le sol (la danse). Deuxième tiers : le
  ventre ouvert et ses tuyaux qui brillent. Troisième tiers : l'armure éteinte, une aura d'énergie, la main d'énergie rouge et dorée.
- **Le héros** : le pantin en volume du jeu (`jeu/heros-vues`), cuit sous huit angles (garde, course, sort qu'on prépare, sort qui
  part, soin, saut, orbe portée, coup, à terre). Le Barde garde son chapeau à plume et son luth (repris du combat du Barde), le Sage
  son bâton à cristal, l'Alchimiste ses fioles.
- **Les six sorts** : le Barde, une note glacée et une note de feu (plus grosse), chacune suivie des cinq lignes d'une portée ;
  l'Alchimiste, une fiole de glace et une fiole de feu avec sa flamme (un cocktail Molotov, qui éclabousse l'armure de feu) ; le Sage,
  un trait bleu, et la rune de feu qui se dessine pendant les 3 s puis part en roue de feu. Les impacts : éclats de glace, explosion,
  fumée ; le givre ou le feu restent collés un moment sur le rocher qui a arrêté le sort.
- **Les annonces façon World of Warcraft** : les ombres qui grandissent (et des graviers qui tombent), les fissures dorées et la
  frontière de la moitié qui va exploser, le feu qui couve aux pieds de l'armure, les abris cernés de bleu, la vague de feu qui roule,
  le givre et la pierre brûlante qui grandissent depuis nos pieds, les lignes d'énergie des doigts, la trace du rayon au sol, les
  anneaux de la danse (l'anneau sûr cerné de bleu), les fentes qui s'ouvrent en crevasses, la coque, la bulle d'or et le symbole.
- **Les sons** (`src/son.js`, avec le moteur de l'Atelier des sons) : un son pour chaque sort (le luth du Barde, le verre de
  l'Alchimiste, le cristal du Sage), chaque coup du boss a son annonce (on peut jouer à l'oreille) ; une musique grave qui se resserre
  à chaque tiers, sous la bulle, pendant la danse et la vague. **Aucun son n'a été écouté par un humain.**

## Les fichiers
- `combat-armure.html` : la page, en un seul fichier (`python3 construire.py` la refait).
- `src/regles.js` : toutes les règles (elles tournent aussi dans node) ; les chiffres sont dans `REG`, en haut.
- `src/base.js` (les mesures, l'écran, la caméra), `src/heros.js` (le héros cuit), `src/golems-cuits.js` (les réparateurs),
  `src/armure.js` (l'armure et ses gestes), `src/vfx.js` (les particules et les sorts), `src/son.js`, `src/dessin.js` (une image),
  `src/ecrans.js` (le pouce, les boutons, les menus, la boucle), `src/page.html`, `src/decor.js` (fabriqué par `decor3d/paquet.py`).
- `src/modeles/` : les modèles repris des autres combats (outils, golems, réparateur, Grosbec).
- `decor3d/` : la salle en Blender. `pip install bpy`, puis `python3 rendu.py essai 0.25 16` (un aperçu), `python3 final.py 1.0 96`
  (le vrai rendu : 11 minutes sur deux cœurs), `python3 paquet.py out/final ../src/decor.js`, puis `cd .. && python3 construire.py`.
  **Les mesures de la salle (`salle.py`) sont celles des règles (`REG`) : ne pas en changer une sans l'autre.**
- `tests/` : `node tests/regles.js` (64 scènes), `node tests/robot.js` (un robot qui joue des parties entières),
  `python3 tests/partie.py` (des parties entières dans la vraie page, puis la vitesse sur un téléphone ralenti 4 fois),
  `python3 tests/gestes.py` (au doigt), `python3 tests/scenes.py [role] [scène…]` (des photos de chaque coup et de chaque sort),
  `python3 tests/vitesse.py [tiers] [secondes] [finesse]`, `python3 tests/voir-modeles.py [role]` (l'armure et le héros sous ses huit angles).

## Le menu Pause (pour régler)
Le saut (0,5, 1,5 ou 3 s), l'accélération sous la bulle (2 ou 4 minutes), le faux Pisteur (au bouton, 15, 30, 60 s), la vie de chaque
tiers (400 pour essayer vite, ou 1000), le ralenti du code (3, 5, 8 s), le son, les boutons qui clignotent ; « Essais » pour sauter à un
tiers ou au symbole.

## Les mesures (27 novembre)
Règles : 64 sur 64. Gestes au doigt : 12 sur 12. Le robot (« bon ») finit une partie en 10 à 13 minutes à 1000 points par tiers, en
4 minutes à 400 ; deux parties entières dans la vraie page sans erreur, tous les coups vus. Vitesse sur un téléphone ralenti 4 fois :
la page baisse toute seule la finesse de l'image quand ça rame ; une fois baissée, de 24 à 60 images par seconde (le troisième tiers
est le plus lourd). **Pas vérifié sur un vrai téléphone, une vraie tablette, ni avec des enfants.**
