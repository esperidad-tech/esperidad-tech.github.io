# Le moteur du donjon complet — cahier des charges

> Écrit le 10 novembre 2026 (12 h 20). Il dit COMMENT assembler le donjon jouable à partir de tout ce qui existe déjà.
> Les règles du jeu sont dans `CONCEPTION-DONJON.md` (qui fait foi après la Bible §12.51) ; la vitesse et la mémoire dans `RAPIDITE.md` ; les monstres dans `anim/betes/CONTRAT.md`.
> Les règles de Romain sont dans `PASSATION.md` : à relire avant d'écrire le moindre écran.

## 1. Ce qu'on livre

Trois pages, dans un dossier (et non plus un seul gros fichier : sur iPhone, Safari ferme une page qui prend trop de mémoire) :

| Page | Pour qui | Adresse en ligne |
|---|---|---|
| `index.html` | la tablette du **Pisteur** : tout le donjon s'y joue | `brumeval/donjon/` |
| `sage.html` | la tablette du **Sage** : plan, encre invisible, pages blanches | `brumeval/donjon/sage.html` |
| `alchimiste.html` | la tablette de l'**Alchimiste** : recettes, chaudron | `brumeval/donjon/alchimiste.html` |

- Les sources du moteur vont dans `jeu/donjon/moteur/` ; `construire.py` fabrique `jeu/donjon/moteur/sortie/` (les trois pages, `a/` pour les scripts chargés à la demande, `i/` pour les images).
- **Chargement à la demande** : la page de départ ne charge que le nécessaire (carte, sac, héros). Le décor et les monstres d'une salle se chargent pendant l'écran de passage vers cette salle, et sont **libérés en la quittant** (images, toiles vidées, tampons de son).
- La salle d'essai (`brumeval/donjon-essai.html`) reste en ligne telle quelle tant que Romain n'a pas validé le donjon complet.

## 2. Les pièces qui existent (ne pas les refaire)

| Pièce | Où | À savoir |
|---|---|---|
| La salle d'essai (rats) | `essai/src/` (jeu.js, effets.js, acteurs.js, son.js, jeu.css), `essai/construire.py`, `test-jeu.py`, `perf-tablette.py` | Le point de départ : tout ce que Romain a validé y est (sac, combat, refus en deux mots, curseurs de volume, critique localisé, fuite, « On fait le point »). |
| Les héros animés | `anim/heros/` → `HerosAnime` | Nouvelles armes et réactions : voir le compte rendu dans la Bible §12.51 et l'en-tête du module. |
| Le rat d'égout | `anim/rat/` → `RatAnime` | API d'avant le contrat : à envelopper pour qu'il réponde comme les autres (`BETES.rat`). |
| Les 9 autres monstres | `anim/betes/<id>/` → `BETES[id]` | ratcuir, araignee, petitearaignee, chauvesouris, feufollet, tetard, roirats, gardien, bourbe. Chaque dossier a une démo qui montre tout. |
| La cuisson | `anim/cuire.js` | Transforme les pièces en petites images que la carte graphique déplace. Les héros et le rat y passent déjà. |
| Les décors de combat | `decors/` → `DECORS`, `AMBIANCE`, `webp/<id>.webp` | canaux, toiles, atelier, ossuaire, bassin, egouts, crypte (+ celui des rats dans l'essai). `DECORS.MARGELLE` pour Bourbe. |
| Les salles sans combat | `scenes/` → `SCENES`, `OBJETS`, `png/<id>.png` | 13 salles. Les PNG sont à convertir en WebP à la construction. |
| La carte | `carte.js` → `CARTE_DONJON` | La géométrie unique, les liens, la brume, les notes du plan. |
| Les codes | `donjon-codes.js` → `DONJON_CODES` | Ne jamais changer un code : les pages du Sage et de l'Alchimiste les connaissent. |
| Les pages compagnes | `donjon-sage.html`, `donjon-alchimiste.html` (sources `pages/`) | À recopier dans la sortie sous `sage.html` et `alchimiste.html`. |
| Les sons | `essai/sons/` (moteur, bruitages, bestiaire, donjon, musiques, musiques-donjon), `essai/src/son.js` | Table `CHOIX` = les versions validées par Romain. |

## 3. Le découpage du moteur

Quatre morceaux, avec des frontières nettes pour pouvoir les construire et les tester séparément.

### 3.1 Les règles (`moteur/src/regles.js` et `moteur/src/donnees.js`) — aucun affichage

- **Tout le calcul du jeu est là, et seulement là** : points de vie, dégâts, états, points faibles, tours, cibles des monstres, objets, soins, pièges, sauvegardes. Pas de DOM, pas de son, pas de minuterie.
- Il tourne aussi bien dans la page que dans Node : c'est ce qui permet de **simuler des milliers de combats** pour régler la difficulté, et de tester les règles sans navigateur.
- Le hasard passe par un générateur à graine (`Regles.alea(graine)`), pour rejouer un combat à l'identique.
- `donnees.js` contient les tableaux : monstres, salles, objets, recettes, lignes du Grand Livre.
- **Le contrat avec l'affichage** : chaque action renvoie une **liste d'évènements** que l'affichage joue dans l'ordre. L'affichage ne décide jamais d'un résultat.

```js
var partie = Regles.nouvellePartie(graine);            // l'état complet (voir 3.5)
var c = Regles.combat(partie, 'canaux');               // un combat dans une salle
c.gestes('pisteur');                                   // les gestes permis maintenant, avec leurs cibles permises
c.refus('pisteur', geste, cible);                      // null, ou la raison en deux mots (« Trop loin ! »)
var ev = c.jouer('pisteur', {geste:'fleche', cible:m}); // -> [{t:'tir', ...}, {t:'touche', ...}, {t:'degats', n:60, critique:true}, {t:'mort', mode:'explose'}, ...]
var ev2 = c.tourMonstres();                            // quand les trois héros ont joué
c.fini();                                              // null | 'victoire' | 'defaite'
Regles.fuir(partie);                                   // recharge la dernière sauvegarde (le Grand Livre garde tout)
```

- La liste complète des types d'évènements est écrite en tête de `regles.js`, avec un exemple pour chacun. Exemples : `tir`, `potion`, `touche` (bête, type de coup), `etat` (bête ou héros, nom, on), `special` (bête, nom), `degats` (cible, n, critique), `soin`, `rebond`, `ouvert`, `ferme`, `mort` (mode `fuit` | `explose` | `meurt`), `arrive` (une bête entre), `vise` (un monstre choisit sa cible), `attaque` (bête, nom, cibles), `avale`, `recrache`, `tombe` (héros au sol), `releve`, `livre` (une ligne du Grand Livre apprise), `fin`.

### 3.2 Le combat à l'écran (`moteur/src/combat-*.js`)

- Il reprend l'écran de combat de la salle d'essai, et **joue les évènements** des règles : animations des héros et des bêtes, chiffres, mots, sons, badges qui suivent la bête (`ancre`).
- Une seule entrée : `Combat.lancer(partie, salleId)` → une Promise qui rend `'victoire'`, `'fuite'` ou `'defaite'`.
- Chaque bête passe par un **adaptateur** qui cache les différences entre modules (le rat d'avant le contrat ; les `touche()` qui posent déjà un état tout seuls ; `entrer()` à appeler juste après `creer()` ; les restes qui doivent demeurer au sol jusqu'à la sortie de la salle).
- Les bêtes sont **cuites** (`cuire.js`) pendant l'écran de passage, comme les héros. Pour chaque monstre, on compare des captures « cuit » et « pas cuit » : le rendu doit être le même à l'œil.
- **Le critique reste localisé autour de la bête** (Romain, 9 novembre, 16 h 37) : fumée noire, morceaux qui éclatent sur les côtés cachés par la fumée, gros « CRITIQUE ! », petit tremblement, rien de plein écran. Le critique refait du rat est le modèle ; l'`exploser()` de chaque bête est aligné dessus.
- Pas de bandeau de texte en haut. Les refus s'affichent en deux mots au-dessus de celui qu'on a touché.
- Le Grand Livre s'ouvre par son bouton, comme dans l'essai : il montre, par monstre rencontré, les lignes que le Sage a apprises en étudiant.

### 3.3 L'exploration (`moteur/src/explo-*.js`)

- **La carte** : grande, qu'on fait glisser ; la brume partout sauf ce qu'on a vu ; la boussole ; le pion des trois héros. On avance en touchant un départ de couloir ou une salle voisine déjà vue. Aux embranchements, on ne sait pas où ça mène : c'est le plan du Sage qui aide.
- **L'écran de passage** entre la carte et une salle : court, sombre, le nom de la salle. C'est là qu'on charge, qu'on décode et qu'on cuit.
- **Les salles sans combat** (`SCENES` + `OBJETS`) : on touche ce qui brille. Un bouton jaune « Repartir » ramène à la carte.
  - Un objet ordinaire s'envole vers le héros qui le porte (2 places par héros ; si c'est plein, on choisit lequel laisser).
  - Un **objet à code** (fleur de givre, herbes lumineuses, page déchirée, page blanche) affiche le code à donner, avec le nom du destinataire, et reste consultable dans « 🎒 Objets » tant qu'on veut.
  - Un **coffre à choix** : les deux objets brillent, on en prend un, l'autre reste là pour toujours.
- **Les lieux particuliers** :
  - *Le tas d'os* (cul-de-sac éboulé) : la première fouille réveille un rat qui mord le Pisteur (−10) et détale ; la deuxième fouille donne **la page blanche** (code `page:blanche`). C'est la seule page blanche à trouver : celle dessinée dans la bibliothèque n'est pas posée.
  - *Le crâne secret* : invisible, sauf si le Sage a révélé l'encre invisible sur son plan. Comme les tablettes ne se parlent pas, c'est le joueur du Pisteur qui touche l'endroit du mur que le Sage lui décrit : le crâne s'allume, le mur glisse, le passage vers le feu de camp s'ouvre sur la carte.
  - *Le couloir aux dalles* : une explication en images et un bouton jaune, puis on traverse en choisissant une dalle à chaque rangée. Une dalle sombre déclenche le piège : −15 à toute l'équipe, et on recule d'une rangée. Rien à l'écran ne dit quelle couleur est sûre : c'est écrit sur le plan du Sage.
  - *Les trois portes* : œil → l'ossuaire ; gueule → la fausse crypte ; lune → retour à la cave aux toiles.
  - *La fausse crypte* : le combat (2 chauves-souris) d'abord, puis le sarcophage s'ouvre : l'amulette de vie.
  - *Les égouts tournants* : un rat errant (combat court), puis on ressort aux canaux.
  - *Le feu de camp* : rend la moitié des PV max à chacun, une seule fois entre deux combats. On y refait le sac et on y tape les codes de recette.
  - *La porte aux quatre signes* : la scène de Moustache, puis le code `porte:odette` pour le Sage.
  - *La dernière salle* : Léo. Le code `leo:attrape` pour le Barde, puis l'écran de fin.
- **Les boutons de la carte** : « 📜 Un code » (les codes `sauve:*` et `recette:*`, pavé des 12 symboles comme dans le jeu), « 🎒 Objets », « 📖 Grand Livre », les deux curseurs de volume.

### 3.4 Les sauvegardes

- **La sauvegarde de départ** est créée au fond du puits.
- Taper un code `sauve:N` (hors combat seulement) enregistre tout l'état : lieu, PV, objets, sac, recettes, salles faites, brume, codes déjà utilisés. Chaque code ne marche qu'une fois.
- **Fuir, ou tomber tous les trois**, recharge la dernière sauvegarde. Le Grand Livre garde ce qu'il a appris. L'écran « On fait le point » le dit clairement avant de repartir.
- **Recharger la page** n'est pas une fuite : hors combat, on reprend exactement où on était ; en plein combat, on revient à l'entrée de la salle, avec l'état d'avant le combat. (Sur iPhone, la page peut se recharger toute seule : on ne punit pas ça.)
- Tout est dans `localStorage`, avec `try/catch`. Un bouton discret « Recommencer la descente », avec confirmation.

### 3.5 L'état de la partie (fixé ici pour que tous les morceaux s'entendent)

```js
partie = {
  v: 1, graine: 12345,
  lieu: 'puits',                    // id de CARTE_DONJON
  vus: {puits: 1},                  // la brume levée
  faits: {},                        // combats gagnés, objets pris, coffres ouverts, pièges passés… (ex. 'combat:rats', 'objet:sacoche', 'coffre:reserve')
  heros: { pisteur: {pv, pvMax, sol: false, objets: []}, alchimiste: {...}, sage: {...} },
  recettes: ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'],   // connues ; 'givre' et 'baumelum' s'ajoutent par code
  sac: [],                          // 3 recettes choisies (4 avec la sacoche)
  livre: {},                        // par monstre : les lignes apprises — N'EST PAS touché par une fuite
  codes: {},                        // les codes déjà tapés
  or: 0, repos: false,              // le feu de camp a déjà servi depuis le dernier combat
  sauvegarde: null                  // la copie de l'état au dernier code de sauvegarde (sans `livre`)
}
```

## 4. Les règles à mettre en données

`CONCEPTION-DONJON.md` §3 à §6 donne les chiffres de départ. Ce qui suit précise ce qui manquait. **Les chiffres finaux sortent de la simulation** (§6) et sont reportés dans `CONCEPTION-DONJON.md`.

- **Les gestes des héros** (un geste par héros et par tour, dans l'ordre qu'on veut) :
  - *Pisteur* : flèche (toute cible), dague (seulement la bête de devant, plus forte), flèche trempée dans une potion du sac qui s'y prête. Ses carquois : argent ou lourd (§6 de la conception).
  - *Alchimiste* : une potion du sac ; la louche, qui est **le bruit** (geste gratuit) ; les herbes (soin 20).
  - *Sage* : la rune de lumière ; le bouclier (deux héros avec le bâton de chêne) ; étudier une bête (une ligne de plus dans le Grand Livre). Avec le cristal de lune, la lumière touche toute la salle.
  - *Un héros avalé par Bourbe* n'a qu'un geste : « Chatouiller ».
- **La recette Acide** est connue dès le départ, avec les six de l'essai. Le sac n'en prend que trois : c'est là qu'on réfléchit.
- **Ce qui s'ouvre se referme** à la fin du tour des monstres, sauf :
  - ce qui est **cassé** reste cassé jusqu'à la fin du combat (le casque et l'armure du rat cuirassé, la plaque du Gardien) : le premier tour est le plus dur ;
  - **Bourbe sur le dos** le reste jusqu'à la fin du tour suivant, puisque son combo demande trois gestes.
- **Bourbe**, précisément :
  - dans l'eau (immunisé) → *lumière* : sur la berge pour 2 tours → *feu* : sec → *nuage* : sur le dos, ouvert ;
  - *givre* : le bassin gèle pour 3 tours, il ne peut plus plonger et compte comme « sur la berge » ;
  - sans feu : s'il passe 2 tours entiers sur la berge, il sèche tout seul ;
  - sans nuage : le héros avalé qui chatouille le fait rire, recracher, et rouler sur le dos ;
  - pièges : *nuage* avant d'être sec → il gonfle (saut double au prochain tour) ; *bruit* → il plonge, revient au tour suivant avec 2 têtards de plus (sauf si le bassin est gelé : il se cogne) ;
  - ses attaques : la langue (avale un héros, qui ne joue plus que « Chatouiller ») ou le saut (15 à tous), en alternance, et jamais la langue s'il a déjà quelqu'un dans le ventre.
- **Le Grand Livre** : chaque étude du Sage apprend une ligne sur la bête visée, dans cet ordre : ce qui l'ouvre ; le piège à éviter ; l'autre chemin ; le chemin sans potion. Les textes viennent des fiches (`bestiaire/betes/*.js`, champs `livre` et `combo`), racontés, sans jamais donner la réponse mot pour mot quand un indice suffit.
- **Les critiques, la rage, la brûlure, le critique surprise** : comme la conception §3.

## 5. Ce que Romain exige partout

- Boutons « aller / lancer / valider » **jaunes à texte noir**. Avant un mini-jeu : une explication **en images** et un bouton jaune.
- **Tout texte de plus de 3 mots a son bouton 🔊.** Jamais de lecture toute seule.
- Les textes sont **racontés** (un conteur, phrases courtes, un peu d'humour), jamais « Touche… ». Ce qu'il faut toucher **bouge et porte le rond jaune**.
- Pas de minuteur. Pas trop d'indices. Aucune réponse trahie par le texte.
- **Fluide, même sur une vieille tablette** (`RAPIDITE.md`, R1 à R9), et **pas de mémoire gaspillée** : aucun calque de plus de 4 096 px réels, les effets plein écran sont interdits, les toiles sont vidées après usage, les sons restent sous 25 Mo.
- **Les sons** : ceux que Romain a validés (`CHOIX`). Pour les sons pas encore validés (monstres, objets, salles, musiques des nouvelles salles), on joue **la version A, provisoire**, dans une table à part (`PROVISOIRE`) : quand Romain envoie ses choix de l'Atelier, on ne change que cette table.
- Paysage seulement ; en portrait, le message « tourne la tablette » de l'essai.

## 6. La difficulté (à prouver par la simulation)

`moteur/equilibre.js` (Node) joue chaque salle, puis le donjon entier, des milliers de fois avec quatre équipes :

| Équipe | Comment elle joue | Ce qu'on veut |
|---|---|---|
| **Maligne** | étudie, ouvre les points faibles dans l'ordre, soigne quand il faut, sauvegarde avant les grandes portes | elle **gagne** le donjon (plus de 85 % des fois), avec des moments chauds |
| **Sans le Sage** | même chose, mais n'étudie jamais et ne connaît pas les combos | elle **perd** contre le Gardien, le Roi des rats et Bourbe (moins de 5 % de victoires) |
| **Tape sans réfléchir** | flèche, dague, louche, sans jamais ouvrir | elle **perd dès la salle 2** (les canaux) |
| **Au hasard** | gestes permis tirés au hasard | elle perd presque toujours après les rats |

- La salle des rats reste l'apprentissage : les chiffres de l'essai ne bougent pas.
- **Le soin infini ne suffit pas** : à partir de la salle 2, ce que les monstres enlèvent par tour dépasse ce qu'un soin rend par tour.
- Le rapport de simulation (un tableau par salle : tours, PV restants, victoires) est rangé dans `moteur/equilibre.md` et résumé dans la Bible.

## 7. Les tests et les mesures

- `moteur/test-regles.js` (Node) : chaque combo de chaque monstre, chaque piège, les objets, les sauvegardes, la fuite, les codes.
- `moteur/test-donjon.py` (Playwright) : une descente entière jouée par un robot, de l'entrée à Léo ; les trois pages ; chaque code ; le rechargement en plein combat ; aucun texte de plus de 3 mots sans 🔊 ; aucune lecture toute seule ; cibles d'au moins 44 px ; aucune erreur JavaScript.
- `moteur/perf.py` : images par seconde avec le processeur ralenti ×4 et ×6 dans chaque salle de combat (au repos et pendant chaque attaque) ; en émulation iPhone (844 × 390, densité 3) : le plus grand calque, la mémoire au pire moment, la mémoire après avoir quitté la salle (elle doit redescendre).
- Playwright se lance toujours par `flock /tmp/brumeval-pw.lock python3 …` : la machine n'a que 2 processeurs.
- À la fin, **un agent neuf**, qui n'a pas construit le moteur, joue le donjon et cherche ce qui cloche.

## 8. L'ordre de construction

1. **Les règles et la simulation** (3.1, §4, §6) : rien d'autre n'est nécessaire pour commencer.
2. En même temps, une fois les héros, le critique et la carte terminés : **le combat à l'écran** (3.2) et **l'exploration** (3.3, 3.4).
3. **L'assemblage** : `construire.py`, le chargement à la demande, les tests, les mesures, les sons provisoires.
4. **Le contrôle par un agent neuf**, les corrections, la mise en ligne, la Bible et les passations.

## 9. Ce qui est construit (en ligne depuis le 10 novembre, 15 h 43)

Le donjon se joue du sac de départ jusqu'à Léo. Tout est dans `moteur/`.

### 9.1 Les fichiers

| Fichier | Rôle |
|---|---|
| `src/donnees.js`, `src/regles.js` | Les règles, sans affichage (§3.1). Mode d'emploi : `REGLES.md`. |
| `src/noyau.js` | `DJ` : les petits outils communs (voix par bouton 🔊, sons, musique, images, chargement à la demande, cadre 960 × 540, fenêtres, un seul écouteur de touches, curseurs de volume, fioles des 9 recettes, la partie gardée dans `localStorage`). |
| `src/betes.js` | `DJ.Betes` : l'adaptateur des 10 monstres (le rat d'avant le contrat et les 9 `BETES[id]`) : places dans la salle, sons, `touche`, `special`, `attaquer`, `exploser`, `accorder` (retire de l'écran un état que les règles n'ont plus). |
| `src/combat.js` | `DJ.Combat.lancer(partie, salle)` → `'victoire'`, `'fuite'` ou `'defaite'`. L'écran de la salle d'essai, qui **joue les listes d'évènements** des règles et se recale sur `c.etat()` après chaque liste. |
| `src/explo.js` | `DJ.Explo` : le sac, la carte et sa brume, les salles sans combat, les codes, les sauvegardes, le feu de camp, la fin. |
| `src/demarrage.js` | Le départ (reprise de la partie gardée) et les adresses d'essai. |
| `src/donjon.css`, `src/page.html` | L'habillage propre au donjon ; la page. |
| `construire.py` | Fabrique `sortie/` : `index.html` (1,1 Mo), `sage.html`, `alchimiste.html`, `a/` (un script par monstre, chargé à l'entrée de sa salle), `i/` (30 images). 5 Mo en tout. `sortie/` n'est pas dans Git. |

### 9.2 Les adresses d'essai

- `index.html?nouveau=1` : une partie neuve (sinon on reprend la partie gardée).
- `index.html?sanscombat=1` : les combats sont tenus pour gagnés ; pour visiter toutes les salles.
- `index.html?combat=<salle>&sac=feu,huile,baume&objets=pisteur:fleches-argent,sage:cristal-lune&graine=7&livre=3` : un combat tout seul (`rats`, `canaux`, `egouts`, `toiles`, `atelier`, `crypte`, `ossuaire`, `bassin`), avec le Grand Livre déjà lu jusqu'à la ligne 3.
- `&vitesse=3` : tout va trois fois plus vite (pour les tests).

### 9.3 Les tests

Playwright toujours sous le verrou : `flock /tmp/brumeval-pw.lock python3 …`. Refaire `python3 construire.py` avant.

| Test | Ce qu'il vérifie |
|---|---|
| `node test-regles.js` | Les règles : 324 vérifications. |
| `test-combat.py` | Les 8 salles de combat, jouées au hasard par l'écran pendant 3 tours : l'écran dit ce que disent les règles, la fuite, « On fait le point », les 🔊. 71 vérifications. |
| `test-donjon.py` | La visite de toutes les salles sans combat (objets, codes, coffres, tas d'os, crâne, dalles, portes, amulette, feu de camp, sac refait, Moustache, Léo, écran de fin), la page rechargée en route et en plein combat, un vrai combat depuis la carte, la fuite. 58 vérifications. |
| `test-descente.py` | **La vraie descente par l'écran** : l'équipe « maligne » de la simulation (ses choix sont collés dans la page) joue tout le donjon, chaque combat geste après geste, avec les salles, les codes et les sauvegardes ; si elle tombe, elle repart de sa sauvegarde. C'est le test le plus proche d'une vraie partie. Le 10 novembre (graine 7) : les 7 combats gagnés du premier coup (rats 4 tours, canaux 3, toiles 4, atelier 4, crypte 2, ossuaire 6, bassin 7), 82 gestes, l'écran d'accord avec les règles après chaque geste ; pareil avec la graine 11 (79 gestes). `--graine N` change les dés, `--vitesse N` la vitesse. |
| `../test-sage.py`, `../test-alchimiste.py`, `../test-carte.py` | Les pages du Sage (146 vérifications) et de l'Alchimiste (156), la carte (71). |
| `perf.py` | Images par seconde, processeur ralenti ×4, dans chaque salle (repos, gestes, tour des monstres) ; mémoire en émulation iPhone. |

**Les mesures du 10 novembre** (`perf.py`, processeur ralenti ×4, images par seconde à l'écran). La machine de test était lente ce jour-là : la salle d'essai validée par Romain (`essai/perf-tablette.py`), mesurée juste après, sert de repère. Les objectifs de `RAPIDITE.md` (55 au repos, 45 en action) ne sont donc pas lisibles sur ces chiffres : ce qui compte, c'est l'écart avec le repère.

| Salle | Repos (début / tour 2) | Gestes des héros | Tour des monstres |
|---|---|---|---|
| *Repère : la salle d'essai (rats)* | *32 / 36* | *30 à 33 (nuage : 26)* | *46 à 51* |
| rats | 34 / 50 | 32 à 40 | 49 |
| canaux | 33 / 39 | 29 à 32 | 36 |
| toiles | 35 / 39 | 31 à 33 (nuage : 26) | 39 |
| atelier | 34 / 34 | 30 à 33 | 40 |
| crypte | 41 / 51 | 36 à 40 | 48 |
| ossuaire | 30 / 32 | 24 à 27 | 32 |
| bassin | 32 / 38 | 30 à 34 | 38 |

- Toutes les salles sont au niveau de la salle des rats, sauf **l'ossuaire, un peu plus lourd** (le Roi des rats et deux feux follets) : c'est la première salle à alléger si une vraie tablette rame (cuire le Roi des rats).
- Au repos, le fil principal travaille encore un peu dans toutes les salles (recalcul de style, calques), salle d'essai comprise : c'est une piste d'allègement commune.
- **Mémoire, en émulation iPhone** (844 × 390, densité 3), pendant les mêmes gestes : le plus grand calque animé fait 2 080 px dans toutes les salles (limite : 4 096), aucune toile (canvas) gardée.

### 9.4 Les écarts avec ce cahier des charges

- **Les 9 monstres ne sont pas « cuits »** (§3.2) : leurs modules tournent tels quels. À cuire seulement si une salle rame sur une vraie tablette.
- **La carte est en plein écran** (elle déborde du cadre 960 × 540), avec ses boutons posés dessus.
- (Fait le 10 novembre au soir : la musique par zone et les longues musiques des grands combats, voir §9.6.)
- **Les sons pas encore validés** jouent leur version A (`DJ.sonsProvisoires`).
- **Le critique des 9 monstres** n'est pas encore aligné sur celui du rat (on attend l'avis de Romain sur le critique recalé).
- **Pas de contrôle par un agent neuf** (§7) : les aides ont été coupées le 10 à 12 h 06. `test-descente.py` le remplace en partie.
- (Fait le 10 novembre au soir : un objet reposé reste dans la salle, voir §9.5.)
- **L'explication des dalles** est faite avec des émojis, pas avec des dessins.

### 9.5 Après le premier essai de Romain (10 novembre, 16 h 33)

Le détail de ses retours est dans la Bible §12.51. Ce que ça change dans le moteur :

- **`combat.js`, `cleDe`** : le geste d'un héros ouvre toujours son propre bloc d'évènements, même quand il vise une bête. Sans ça, le héros ne s'anime pas. `test-combat.py` le vérifie (« le héros s'anime à chaque geste »).
- **`carte.js`** : toutes les toiles d'une vue passent par `toile()` et sont vidées par `detruire()` (36 Mo par passage sur la carte restaient en mémoire). Les mesures de `perf.py` ne voyaient pas cette fuite : elles lancent un combat tout seul, sans passer par la carte. **À faire : mesurer aussi la mémoire après un trajet carte → salle → carte → combat.**
- **Le filet de sécurité du critique** (`noyau.js`) : `DJ.temoinCritique('debut' | 'impact' | 'explosion' | 'fumee' | 'bete' | false)`, `DJ.verifierTemoin()` au démarrage, `DJ.plantages()`, `SALLE.critLeger`. La version du jeu (`DJ.VERSION`, l'heure de fabrication) et le compteur sont en bas de « 🎒 Objets ».
- **La défaite** : `fuite(auto)` attend, fait se relever les trois héros avec `relever({sonne:true, retard})`, puis « Fuite ! ». « On fait le point » est réduit à « où l'on repart ».
- **L'équipement** (`explo.js`) : `majPlaque(h)` (deux cases au-dessus du héros), `etiquetteObjet(id)` (le nom au toucher), `echange(x)` et `toucherPlaque(id, heros)` (mains pleines : on touche la case qu'on repose), `reposer(id, heros)` et `poserAuSol(id)` (l'objet reposé reste dans la salle ; `SCENES.portable(id, x)` donne son dessin), `coffreLibre(e, d)` (le coffre de la réserve : deux objets ordinaires), `aPlace(id)` (rond jaune seulement si quelqu'un a une place).
- **Les règles** : le Pisteur part avec `fleches-normales` (une de ses deux places) ; la réserve a deux objets ordinaires (plus de « coffre à choix ») ; `_carquois(m)` choisit le carquois fait pour la bête ; un objet reposé ailleurs ne réapparaît plus dans sa salle d'origine. `test-regles.js` : 329 vérifications. Le lutrin de la bibliothèque est encore un coffre à choix.
- **Les sons** : `pasCouloir` C et D dans l'Atelier, niveau des pas à −27 (`niveaux.py`, `CIBLE_PAS`) ; `REFAITS` dans `noyau.js` dit quelle version provisoire jouer quand Romain a refusé les premières.

### 9.6 La musique du donjon et le critique mesuré (10 novembre, 18 h 57)

Romain : « la musique est très redondante, la boucle est trop petite ». Ce qui a changé :

- **`essai/src/son.js`** (partagé avec la salle d'essai, qui garde `'explo'` et `'combat'`) :
  - `Son.musique('salle:<zone>')` : le fond commun `donjon` + la couleur de la zone (`puits`, `canaux`, `toiles`, `atelier`, `ossuaire`) ; `'grand:<gardien|roi|boss>'` : une longue musique ; `'repos'` (musique du repos + feu qui crépite) ; `'fin'` ;
  - d'une musique à l'autre, **ce qui joue déjà n'est pas coupé** (le fond `donjon` ne s'arrête jamais entre deux zones) ;
  - `Son.musiqueDesQuePrete(nom)` : on ne change que lorsque la nouvelle musique est fabriquée (l'ambiance continue en attendant) ; `Son.preparer(nom)` : fabriquer d'avance, sans jouer ;
  - `Son.combat(true | false)` : dit qu'un combat commence ou finit (les bruitages lourds sont fabriqués, puis libérés). Avant, c'était la musique `'combat'` qui le disait ;
  - `BOUCLE` : la longueur de chaque boucle. Réglages lus dans la page : `window.DJ_BOUCLES` (le puits dure 48 s dans le donjon, 12 s dans la salle d'essai), `DJ_MUSIQUES_GARDEES` (ce qu'on garde en mémoire : seulement `donjon`), `DJ_MUSIQUES_DEPART`. Une musique qui s'arrête est libérée 4 s après.
- **`moteur/src/noyau.js`** : `DJ.zone(lieu)`, `DJ.musiqueLieu(lieu)` (carte et salles), `DJ.preparerGrand(salle)` (appelé par la carte quand un grand combat est au bout d'un couloir), `DJ.musiqueCombat(salle)`, `DJ.musiqueApresCombat(salle)`. `DJ.sonsProvisoires()` donne la version A aux musiques que Romain n'a pas encore choisies.
- **Les longues musiques** : `essai/sons/musiques-donjon.js` (`partie(n, pas, nb)` découpe en parties ; `gardienA` 116 s, `roiA` 91 s, `bossA` 83 s, `bossB` 76 s, `bossC` 77 s). Les mesurer sur toute leur durée : `verifier.py M:gardienA --musiques --sans-planche --duree 120`.
- **Mémoire du son** : 7 Mo dans une salle ordinaire (fond + couleur), 9 à 11 Mo dans un grand combat, plus 2 à 6 Mo de bruitages lourds pendant un combat. Fabrication d'une longue musique : 4 à 8 s sur la machine de mesure.
- **`test-descente.py`** vérifie à chaque écran que la musique demandée est celle de l'endroit, et que toutes ont été demandées.
- **Le critique** : `DJ.mesurerCritique()` (dans `combat.js`, autour de `Fx.critique`) compte les images en retard ; `DJ.critLent()`, `DJ.critMesure()` ; clés `brumeval-donjon-critique-lent` et `-mesure`. `SALLE.critLeger` est mis si la page s'est fermée en plein critique **ou** si un critique a ramé. Le reflet animé du mot « CRITIQUE ! » est retiré (`essai/src/jeu.css`).

### 9.7 Le soir du 10 novembre : exploration sans ronds jaunes, étude par code, toutes les potions, choix des flèches

Les décisions de Romain sont dans la Bible §12.51 (« Deuxième série de retours »). Le détail des règles : `moteur/REGLES.md` §11. Ce que ça change dans le moteur :

- **L'étude** : `Regles.grandLivre` rend le journal (`{monstre, nom, rang, etudie, code}`) ; `combat.js` : `boutonLivre()` (« Journal », classe `a-lire` tant qu'un code n'a pas été vu), `grandLivre(partie)` (la fenêtre : un code par monstre étudié, `.ligne.etude[data-etude]`). Plus aucune énigme dans le donjon.
- **La tablette du Sage** (`pages/sage.js`) : `scene('etude:<m>')` → `pageMonstre(m, nouveau)` : depuis le 11 novembre, **le journal d'un aventurier** (le croquis du monstre et son récit, `D.LIVRE` ; plus de devinettes ni de titres : `CARNET-EXPLORATEUR.md`) ; `scene('carnet:aventurier')` : le carnet ramassé à l'entrée du donjon entre dans le Grand Livre (« 📓 Le vieux carnet », la liste des pages décollées). `pages/assembler.py` ajoute `moteur/src/donnees.js` à la page. Les croquis : `pages/portraits/<id>.webp` (fabriqués par `pages/croquis/seuls.py` puis `croquis.py`), copiés par `construire.py` dans `sortie/i/portrait-<id>.webp`.
- **Les potions** : `explo.js` : `ecranDepart()` remplace l'écran du sac (il ne sert plus qu'au départ : les potions, le bouton jaune) ; plus de « Refaire le sac » au feu de camp, plus d'écran après une fuite. `demarrage.js` : `&potions=` (ou l'ancien `&sac=`).
- **La bande du combat** (`combat.js`, `bande()`) : `carte(g)` pour les gestes de toujours ; `petite(g)` pour les potions et les carquois (`.carte.mini`, noms courts `petit` dans `donnees.js`), dans `.b-petites` (5 colonnes de 84 px). Le titre de la section devient ce que fait la carte choisie (`.b-lbl.dit`). `test-combat.py` vérifie que tout tient dans la bande.
- **L'équipement** (`explo.js`, `majPlaque`) : les carquois spéciaux en petites cases à part (`.pl-case.carq`), puis les deux places.
- **Adresses d'essai** : `?combat=toiles&potions=toutes&objets=pisteur:fleches-argent,pisteur:fleches-lourdes` (toutes les potions, les deux carquois) ; `?nouveau=1&potions=feu,huile,baume` (un Alchimiste à qui il manque des potions).
- **Tests** : `test-regles.js` 359 ; `test-combat.py` 95 (les 8 salles avec toutes les potions et les deux carquois, plus « l'étude » et « les potions et les flèches ») ; `test-donjon.py` et `test-descente.py` : voir la Bible ; `../test-sage.py --vite` 194.
- **Pas remis d'aplomb** : `equilibre.js` tourne (le sac y veut dire « les potions que l'Alchimiste a su créer »), mais `equilibre.md` n'est pas réécrit et 2 cibles sont manquées. Les §3 à §8 de ce cahier des charges parlent encore du sac de 3 recettes : c'est l'ancien dessin.

### 9.8 Le 11 novembre : le carnet de l'aventurier, la rune de l'œil, les coups préparés

Décisions de Romain : Bible §12.51 (« Les sorts du Sage en combat »). Détail des règles : `moteur/REGLES.md` §12.

- **Plus d'étude ni de journal dans le donjon** : le geste « Étudier », le bouton « Journal » (combat, carte, salles) et la fenêtre des codes d'étude sont retirés (`combat.js`, `explo.js`). Le §9.7 « L'étude » décrit donc l'ancien dessin. Le carnet de l'aventurier (objet `carnet` au fond du puits, code `carnet:aventurier`) ouvre toutes les pages sur la tablette du Sage.
- **La rune de l'œil** : carte `oeil` du Sage ; `combat.js` montre au-dessus des monstres la proie et les dégâts (`ligneVise`, `majBadges`), seulement quand `etat().vu` le permet.
- **Les coups préparés** (Gardien, Roi des rats, Bourbe) : état `prepare` (pastille, rond rouge), évènement `prepare` (le mot « Gros coup bientôt ! »), attaque `gros` (secousse plus forte), animation empruntée (`anim`).
- **Le bouclier à 75 %**, **l'huile qui libère un ami entoilé**.
- **Adresses d'essai** : `?combat=atelier&potions=toutes` (le Gardien : poing, élan, marteau) ; `?combat=ossuaire&potions=toutes` ; `?combat=bassin&potions=toutes` ; `?combat=toiles&potions=toutes` (la toile, puis l'huile sur l'ami).
- **Tests** : `test-regles.js` 365 ; `test-combat.py` 108 (`oeil(nav)` dans l'atelier, `huile(nav)` dans la cave aux toiles, `potions(nav)`, les 8 salles) ; `test-descente.py` joue avec la stratégie de `equilibre.js` (l'œil un tour sur deux).
- **La simulation** : `node equilibre.js 600` — 3 cibles manquées (les moments chauds de l'équipe parfaite ; deux cibles de l'équipe qui tape, à cause du bouclier à 75 %). `equilibre.md` n'est toujours pas réécrit, et son texte parle encore du sac et de l'étude : à refaire quand la difficulté sera réglée avec Romain.

### 9.9 Le 11 novembre après-midi : le durcissement (la dague, l'arc, la colère)

Décisions de Romain : Bible §12.51 (« Le durcissement du donjon »). Détail des règles : `moteur/REGLES.md` §13.

- **Le critique** dépend de l'arme et du monstre : `combat.critiqueDe(m, arme, bonus)`, `hauteur:true` dans `D.MONSTRES`, le petit critique (`petit:true`).
- **La colère** : `colere:{si}` dans `D.MONSTRES`, `_colere`, l'état `colere`, l'évènement `colere`, `reactions.colere` (la phase 2 de Bourbe).
- **Le rat mord à 13.** Rien d'autre n'a bougé dans les dégâts.
- **Adresses d'essai** : `?combat=rats&potions=toutes` (l'huile ou la lumière, puis la dague sur celui de devant) ; `?combat=canaux&potions=toutes` (le rat à la dague, les chauves-souris à l'arc) ; `?combat=atelier&potions=toutes` (le rat cuirassé d'abord, puis le Gardien, en colère à mi-vie) ; `?combat=ossuaire&potions=toutes` (le Roi des rats se fâche quand ses feux follets sont tombés) ; `?combat=bassin&potions=toutes` (Bourbe plonge à mi-vie).
- **La simulation** : `node equilibre.js 600` — 3 cibles manquées, sur des cas qui n'existent pas dans le jeu d'aujourd'hui (l'atelier et l'ossuaire sans la bonne potion ; l'équipe qui tape aux canaux). Les mesures faites pour doser sont dans la Bible. `equilibre.md` n'est toujours pas réécrit.
- **Tests** : `test-regles.js` 389 ; `test-donjon.py` (le combat de la visite se gagne à la dague) ; `perf.py` (le gros critique de la salle des rats se mesure à la dague).

