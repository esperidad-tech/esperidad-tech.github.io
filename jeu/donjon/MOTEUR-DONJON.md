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
  - *Le crâne secret* (**ENLEVÉ le 11 novembre au soir, §9.11** : plus de crâne, plus de raccourci vers le feu de camp) : invisible, sauf si le Sage a révélé l'encre invisible sur son plan. Comme les tablettes ne se parlent pas, c'est le joueur du Pisteur qui touche l'endroit du mur que le Sage lui décrit : le crâne s'allume, le mur glisse, le passage vers le feu de camp s'ouvre sur la carte.
  - *Le couloir aux dalles* : (**depuis le 11 novembre au soir : plus d'explication ni de bouton jaune, on marche tout de suite**) une explication en images et un bouton jaune, puis on traverse en choisissant une dalle à chaque rangée. Une dalle sombre déclenche le piège : −15 à toute l'équipe, et on recule d'une rangée. Rien à l'écran ne dit quelle couleur est sûre : c'est écrit sur le plan du Sage.
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
  - (**REMPLACÉ le 11 novembre au soir, §9.11** : seul le *givre* le sort de l'eau — il saute sur la glace ; la lumière ne fait plus rien ; « sur la berge » se lit « sur la glace » ; sa colère brise la glace)
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
| `test-objets.py` | **Le vérificateur des objets à toucher** (11 novembre) : de vrais touchers au doigt sur chaque chose à toucher de 14 salles, à cinq endroits de sa zone ; le doigt doit arriver dessus (pas sur un héros, une plaque, une bulle). 35 vérifications. |
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

### 9.10 Le 11 novembre en fin d'après-midi : les armes à choisir, la sauvegarde sur la carte, le vérificateur des objets

Demandes de Romain : Bible §12.51 (« Les armes à choisir… »). Détail des règles : `moteur/REGLES.md` §14.

- **La bande du combat** (`combat.js`, `bande()`) : `.b-sec.b-armes` à gauche (fond d'acier, titre « ⚔️ … »), `.b-sec.b-combos` à droite.
  - Pisteur et Alchimiste : à gauche les gestes qui sont des armes (`estArme` : `f:<carquois>` ou un geste qui a un nom d'arme `D.GESTES[id].arme`), en grandes cartes `data-act="geste"` ; à droite les petites cartes (`petite(g)` : les potions, et les herbes de l'Alchimiste).
  - Sage : à gauche ses bâtons (`batons()` : `baton`, puis les armes qu'il porte), en cartes **`data-act="arme" data-id="baton|cristal-lune|baton-chene"`** — `choisirArme(id)` prend le bâton en main sans jouer le tour (`E.baton`, gardé dans `partie.heros.sage.baton`, relu par `batonGarde()` au combat suivant), `tenirBaton()` montre ce bâton-là sur le héros (`HerosAnime.equiper`). À droite ses quatre sorts : la carte d'un sort joue `a:<bâton>` quand le bâton en main le change (`D.OBJETS[bâton].carte.base`), avec le petit dessin du bâton (`.c-avec`) ; sinon le sort simple.
  - `DJ.Combat.etat().baton` : le bâton en main (pour les tests). Dans les tests, le Sage prend d'abord le bâton qu'il faut quand la carte du geste n'est pas dans la bande (`carte(pg, g)` dans `test-combat.py`).
  - Dans le ventre de Bourbe : une seule section, « Dans le ventre ! », avec la carte « Chatouiller ».
- **La rune d'appel à l'écran** : `case 'appel'` puis `avancer(a)` — le groupe des monstres est remis en place d'après la nouvelle file (un glissement en `transform`, puis `left`, les zones à toucher, les barres de vie).
- **La carte** (`explo.js`) : le bouton `#b-sauver` (`data-act="sauver"`, classe `rappel` = point rouge quand `aSauver()` : un combat gagné depuis la dernière sauvegarde) ouvre `fenetrePave('sauve')`.
- **Les objets à toucher** : `#scene .perso.heros, #scene .perso.heros *{pointer-events:none}` (les héros ne prennent plus le doigt dans les salles) ; `colonneDalles()` fait passer dessus les deux dalles du pas en cours.
- **`test-objets.py`** : le vérificateur. De vrais touchers au doigt (`touchscreen.tap`, pas `click()` — les autres tests cliquent « par programme » et ne voyaient donc pas un objet caché), cinq points par zone `.ob-zone`, 14 salles, le coffre de la réserve ouvert pour de bon, un témoin avec l'ancien réglage. À lancer avant chaque mise en ligne qui touche aux salles.
- **Adresses d'essai** : `?combat=atelier&potions=toutes&objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-argent,pisteur:fleches-lourdes` (les trois bandes complètes ; la rune d'appel sur le Gardien) ; `?combat=toiles&…` (la rune d'appel éteinte : tout pend ou vole).
- **Tests** : `test-regles.js` 413 ; `test-combat.py` 135 ; `test-donjon.py` 91 ; `test-objets.py` 35 ; `../test-sage.py` 206 ; `test-descente.py` 21.

### 9.11 Le 11 novembre au soir : les retouches après l'essai de Romain (19 h 21 à 20 h 54)

Demandes de Romain : Bible §12.51 (« Les retouches du soir du 11 novembre »). Détail des règles : `moteur/REGLES.md` §15.

- **Les étiquettes au-dessus des monstres** (`combat.js`) : `majBadges` n'écrit plus qu'UNE ligne de l'œil (`b.vise`, ce tour-ci). Pour Bourbe, une pastille dit où il est : `💧 dans l'eau` (classe `e-eau`), `🧊 sur la glace`. `poserBadges` garde les étiquettes dans l'écran (largeur mesurée une seule fois par contenu : `e._w`, remis à zéro quand le contenu change).
- **Le bouclier** : `H.sage.bouclier(fx, …, {pct})` — l'étiquette lit `D.CHIFFRES.bouclier` (« −75 % »). Une garde de 6 s autour de l'animation des dômes (`Promise.race`) : si elle ne finit pas, le tour continue.
- **`accorderHeros()`** (fin de `jouer()`) : recale l'écran sur les règles — un héros `sol` est couché, un héros debout est relevé.
- **Bourbe à l'écran** (`anim/betes/bourbe/bourbe-anime.js`) : `_immerge()` (ni `sous`, ni `dos`, ni `gele`) → pose enfoncée et penchée (`FOND`, `PENCHE`, `RECUL`), mains cachées (`_majMains`) ; la langue le fait sortir la gueule (`LEVE`) ; `changerEtat('gele', true)` dans l'eau → `_surLaGlace()` (le bond, la glace qui se fêle) ; quand il jaillit pour écraser (`surgit`), `special remonter` et `etat sous off` ne sont plus joués à part (il ne remonte plus deux fois). Son cadre (`betes.js`, `cadre('bourbe')`) : `{x:512, y:50, w:470, h:326}` (reculé de 42 px, 4 % plus petit, mêmes pieds). Barre de vie : `.pv.boss` (plus grande, son nom au-dessus). `A.cible` vise sa tête quand il est dans l'eau.
- **La rune d'appel à l'écran** (`anim/heros/src/k-sage.js`, `H._appel`) : un anneau violet se referme sur le monstre, un fil de lumière revient vers le bâton ; plus d'éclair lancé.
- **Les salles** (`explo.js`) : plus de fenêtre avant les dalles (`explicationDalles` enlevée ; `S.pret = true` tout de suite) ; `sceneChat` — « Un gros chat gris gratte au bas de la grande porte. Miaou ! » et deux `son('miaou')` ; le code `porte:odette` s'appelle « Un chat gratte à la porte » (`donjon-codes.js`) ; les pas sur la carte : `son('pasHeros', 1.1, 2, 1.5)`.
- **Le tas d'os** (`scenes/objets.js`, `Tas.fouiller`) : après la morsure, le tas se remet en place et redevient touchable (`fouille = false`, `actif(true)`).
- **Les fenêtres** : `.parchemin .boutons` (donjon) et `.fen .rangee` (tablettes) gardent l'onde du rond jaune dans leur cadre (`overflow:hidden`, marges négatives) : plus de barre de défilement qui clignote.
- **La tablette du Sage** (`pages/sage.js`, `pages/sage-plan.js`) : la fenêtre du code `porte:odette` joue `PG.son('miaou')` ; le plan ne marque plus « Odette » ; plus rien sur le crâne.
- **Les sons** (`essai/src/son.js`) : `B.pasHeros(duree, n, aigu)`, `B.miaou(aigu)`, `bruitage({un:1})` (un seul pas du Gardien : `gardienPasA/B` lisent `P.un`). Atelier des sons : « Pas (carte) » (`s_pasCarte`), « Le chat » (`s_miaou`).
- **Les filets contre les plantages** (`noyau.js`) : `DJ.temoinCharge(salle)` posé au lancement d'un combat et retiré quand l'entrée est jouée ; `DJ.plantagesCharge()` ; `DJ.allegeImages()` (1, puis 0,66 après un plantage au chargement, 0,5 après deux) multiplie la taille des images cuites (`cuireHeros`, `cuireRat`). Le critique le plus simple pour TOUS les monstres dès `DJ.plantages() >= 1`. La dernière ligne de « 🎒 Objets » : version, plantages, images allégées, dernière mesure d'un critique.
- **`?nouveau=1`** : enlevé de la barre d'adresse dès le départ (`history.replaceState`) — sinon chaque rechargement de la page recommençait le donjon.
- **Adresses d'essai** : `?combat=bassin&potions=toutes&graine=5` (Bourbe : givre, feu, fumigène) ; `?combat=crypte&potions=toutes` (la dague éteinte : « Trop haut ! »).
- **Tests** : `test-regles.js` 436 ; `test-combat.py` 135 sur la version de 20 h 58 (une attente du test corrigée depuis), puis la cave aux toiles et le grand bassin repassés sur la version finale : 51 ; `test-donjon.py` 89 (`J.touche(id)` : un vrai doigt sur un objet) ; `test-objets.py` 35 ; `../test-sage.py` 210 ; `../test-carte.py` 72 ; `test-descente.py` 21.

### 9.12 Le 12 novembre : le donjon branché dans l'enquête 3 (étape 6 de la Bible §13.14)

**Romain a validé le donjon le 12 novembre à 1 h 11** (« L'essai du donjon est terminé, c'est validé »). Le branchement ne change **rien au donjon joué tout seul** (`…/donjon/` sans rien dans l'adresse) : `test-enquete.py`, partie 5, le vérifie. Fait par la conversation qui construit l'enquête 3 ; le détail côté enquête : Bible §13.20, `jeu/src/descente.js`.

- **L'adresse** : l'enquête ouvre `index.html?enquete=3&jeton=<jeton>&potions=feu,huile,…&entree=crypte|puits` (le Pisteur), `sage.html?enquete=3&jeton=…` et `alchimiste.html?enquete=3&jeton=…`.
  - **Le jeton** : un par descente. Un jeton nouveau = une partie neuve (`explo.js`, `demarrer` : la partie gardée d'un autre jeton est laissée de côté ; `pages/commun.js`, `jetonNeuf` : la mémoire de la page du Sage ou de l'Alchimiste repart de zéro, clé `brumeval-donjon-jeton:<page>`) ; le même jeton : on reprend. L'enquête ne croit que la partie qui porte son jeton.
  - **Les potions** : celles que l'Alchimiste a vraiment préparées sur son établi (une à sept). Une potion finie plus tard rejoint le sac à la descente suivante (même jeton). L'écran du sac le dit : « Dans le sac de l'Alchimiste : deux fioles… Il en manque ? Il peut encore en faire, là-haut. »
  - **L'entrée** : `partie.entree` = `crypte` ou `puits`. Le donjon est le même ; seuls changent le titre de la carte (« Sous le clocher » / « Sous le puits ») et la première phrase du fond du puits.
- **Dans la partie** (`partie.enquete`, `partie.jeton`, `partie.entree`) :
  - un bouton **« 🏘️ L'enquête »** sur la carte (la partie est gardée, on revient quand on veut) ; sur les pages du Sage et de l'Alchimiste, un petit bouton 🏘️ en haut à gauche (`pages/commun.js`, `boutonEnquete`) ;
  - **deux codes du Barde** sur le pavé « 📜 Un code » (`donnees.js`, `D.CODES` ; `regles.js`, `code`) : **`grosse:marie`** (toute la vie des trois héros revient, ceux qui étaient au sol se relèvent ; une seule fois) et **`maire:retenu`** ;
  - **avant la dernière salle**, sans le code du maire : la fenêtre « Avant d'entrer » (`explo.js`, `fenetreMaire` : taper le code, ou « On y va quand même ») ;
  - **sans le code du maire, Léo s'enfuit** : la dernière salle donne `leo:enfui` à la place de `leo:attrape` (`regles.js`, `leoEnfui`, `donneDe` ; `D.LIEUX.leo.sansMaire`) ; la scène et l'écran de fin le disent ;
  - à la fin : **« Remonter au village ➜ »** à la place de « Recommencer la descente ».
- **Les codes partagés** ont les mêmes symboles des deux côtés (`donjon-codes.js` et `jeu/src/codes-fixes.js`, enquête 3) : `porte:odette`, `leo:attrape`, `leo:enfui`, `grosse:marie`, `maire:retenu`. Les autres codes du donjon sont réservés dans l'enquête (aucun code de l'enquête ne tombe dessus). `node jeu/tools/e3-donjon-codes.js` vérifie que les deux fichiers disent la même chose. **Ne pas changer les symboles d'un code du donjon sans changer `codes-fixes.js`.**
- **Ce que l'enquête relit** (au retour, dans la mémoire de la tablette) : `brumeval-donjon-partie` (`faits['code:porte:odette']`, `faits.fin`, `faits['code:leo:enfui']`) et `brumeval-donjon-sage` (`codes['porte:odette']`). **Ne pas renommer ces clés sans changer `jeu/src/descente.js`.**
- **Adresses d'essai** : `index.html?sanscombat=1&enquete=3&jeton=essai&potions=feu,huile&entree=crypte`.
- **Tests** : `node test-regles.js` (436, inchangé : les règles de l'enquête ne s'appliquent que si `partie.enquete`) ; **`test-enquete.py`** (nouveau, 36 vérifications : la descente lancée par l'enquête, « Recommencer la descente » qui reste dans l'enquête, les deux codes du Barde, Léo enfui ou attrapé, et le donjon tout seul qui ne change pas) ; côté enquête, `jeu/tools/e3-descente.py` (le vrai aller-retour avec le donjon construit) et `jeu/tools/partie3.py` (une partie complète à quatre tablettes).
- **« ↺ Recommencer la descente »** (dans « 🎒 Objets »), pendant une descente de l'enquête : la partie neuve garde son jeton, son entrée et les potions du sac (pas les recettes apprises en route) — `explo.js`, `recommencer-oui`.
- **En ligne le 12 novembre à 2 h 37** (commit a5740d4 du site, avec le jeu : 17c2052, version 20261112-0136), après tous les tests du donjon : `test-regles.js` 436, `test-combat.py` 137, `test-donjon.py` 89, `test-objets.py` 35, `../test-sage.py --vite` 210, `../test-alchimiste.py` 156, `../test-carte.py` 72, `test-descente.py` 21, `test-enquete.py` 36.
- **Pas fait** : « Jouer sans internet » ne garde pas encore les fichiers du donjon (il faut l'avoir ouvert une fois en ligne) ; Mimi dans le donjon.

### 9.13 Le 13 novembre : après le test de Romain en famille (Bible §13.32 et §13.34)

Romain a joué l'enquête 3 avec sa famille, donjon compris, et a dicté ses corrections (13 h 55). Pour le donjon :

- **La dague ne touche que le premier monstre au sol** (`regles.js`, `P.aPortee` = `[devantSol()]`). Avant, elle atteignait aussi une chauve-souris tombée en deuxième position. Conséquence : derrière ses têtards, Bourbe sur le dos n'est plus à portée de dague ; la rune d'appel du Sage l'amène devant (ou l'arc). `test-regles.js` : 441 ; `equilibre.js` : l'équipe maligne gagne toujours 93 fois sur 100.
- **Le feu follet caché est à moitié transparent** (`betes.js`, `A.voile` : opacité .42 tant qu'il n'est ni visible, ni accroché, ni ouvert).
- **Le plan du Sage** (`carte.js`, `PLAN`) : « L'entrée » à la place de « Le fond du puits » ; la note codée dit « LA RUNE DORT DANS LA GALERIE » (23 signes). Romain : « enlever les indices (puits, crypte) ».
- **L'allure des trois héros vient de l'enquête** (`src/allure.js`, nouveau) : `index.html?…&look=p:f.p1.roux.vert,s:m.p6.blond,a:f.p2.rose` — une lettre par héros, « f » ou « m », la peau, les cheveux, et les yeux quand on les connaît (seulement ceux du Pisteur). `DJ.poserLook` (`noyau.js`) change `DJ.LOOK` avant la cuisson des héros ; la partie garde `partie.look` (on le retrouve en redescendant, et « Recommencer la descente » le remet dans l'adresse).
  - **Les petites têtes de l'écran** (les photos `i/heros-*.png`, à l'allure d'origine) sont refaites au départ : `HerosAnime.photo(role, lk)` (`anim/heros/src/z-fin.js`, puis `sh anim/heros/build.sh`) rend le dessin du héros au repos en image ; `DJ.poserLook` en fait trois règles CSS (`#dj-css-heros-look`). Le bâton du Sage est enlevé de sa photo (au repos, son cristal lui cache le visage). En attendant qu'elles soient prêtes (une fraction de seconde), on voit les têtes d'origine.
  - Sans `look=` (le donjon joué tout seul, les tests) : rien ne change.
- **`tenue.html`** (nouveau ; `src/tenue.html`, assemblé par `construire.py`) : une toute petite page sans texte ni bouton ni son, qui montre un héros ou les trois, animés, à l'allure donnée (`tenue.html?h=sage,alchimiste,pisteur&look=…`). Le jeu la montre dans un cadre, dans la fenêtre « Il est temps d'enfiler notre tenue de combat ! » (`jeu/src/descente.js`, `E.donjon.tenue`). 309 Ko (les héros animés).
- **La page du Sage « dans le jeu »** (`pages/sage.js`, `pages/commun.js` : `PAGE.dansJeu`, `PAGE.auJeu`) : avec `sage.html?…&dans=jeu&codes=rune:lumiere,page:dechiree,…&nouveau=<code>`, la page est montrée dans un cadre par-dessus le Grand Livre du Sage. Il n'y a plus ni « Grand Livre », ni « Un code », ni « ↺ », ni 🏘️ : seulement la grille, le zoom, la rune, et **« Refermer »** (un message au jeu : `{donjonPlan:1, type:'fermer'}`). Les codes viennent du jeu (`codes=`) ; `nouveau=` joue la petite scène du code qui vient d'arriver (la rune apparaît ; le coin se recolle). La page ouverte toute seule (`sage.html`) marche comme avant : c'est elle que `test-sage.py` essaie.
- **La page de l'Alchimiste** : `alchimiste.html?…&recu=plante:lumiere` reçoit la plante toute seule (le code a été tapé dans le jeu). La fleur de givre ne passe plus par cette page : elle se prépare sur l'établi du jeu (`jeu/src/plantes-donnees.js`, `PLUS`).
- **Le code du givre** (`recette:givre`) est donné par l'établi du jeu ; le Pisteur le tape toujours sur le pavé du donjon.
- **Pas fait** : les feux follets (« leur sort principal ×4 quand ils se dévoilent d'eux-mêmes » : à éclaircir avec Romain ; la flèche de lune fait déjà 10 sur un feu follet caché, et un critique seulement s'il est dévoilé) ; la fin du donjon ; ce que le bruit de la grille change.
- **Tests** : `test-regles.js` 441, `test-combat.py` 137, `test-sage.py` 210, `test-carte.py` 72, `test-enquete.py` 36 ; le vrai aller-retour avec l'enquête (l'allure, les têtes, la tenue, le plan dans le jeu, le code du givre) : `jeu/tools/e3-descente.py`.

### 9.14 Le 13 novembre au soir : Léo, le boss final en temps réel, et la fin du donjon (Bible §13.33 et §13.35)

- **Nouveaux fichiers** (dans `moteur/src/`, tous dans la liste `COEUR` de `construire.py`) : `leo-regles.js` (les règles, sans affichage, en temps réel), `leo-anime.js` (le pantin de Léo en SVG : trois tenues, ses armes, ses poses — `LeoAnime.creer`), `leo.js` (l'écran : `DJ.Leo.preparer()`, `DJ.Leo.lancer(partie, {phase, vite})` → `'victoire'` ou `'quitte'`). Les sons : `essai/sons/leo.js` (28 sons, une version chacun, **à valider par Romain dans l'Atelier des sons**). Hors de la page : `leo-sim.js` (la simulation des trois joueurs), `test-leo.js`, `test-leo.py`.
- **L'écran de Léo** reprend le squelette et les styles du combat (`#combat.leo`, `#persos`, `#hud`, `#bande`) mais **rien de `combat.js`** : une boucle d'images fait avancer les règles (`c.avancer(dt)`) et joue leurs évènements ; **l'affichage ne décide de rien**. En bas : les trois héros (toujours là, avec leur vie, leurs états et une petite jauge « occupé »), puis les cartes de celui qu'on a choisi. Une carte à une seule cible part toute seule. Les cartes répondent dès que le doigt se pose (`pointerdown`).
- **Ce qui est gardé** : `partie.faits['leo:vu']` (la première entrée a été vue), `partie.faits['leo:phase']` (2, 3 : la phase où l'on reprend ; 4 : battu). Une défaite : « Réessayer » relance la même phase ; « Retour à la carte » garde les phases gagnées.
- **L'exploration** (`explo.js`) : `arriver('leo')` → `devantLeo()` (dans l'enquête : la fenêtre du code pour le Barde, une fois) → `lancerLeo()` → `Regles.bossBattu` → `finDonjon()` (« Bravo ! Vous avez résolu l'enquête n° 3. Place aux accusations ! », le code pour le Sage). `?sanscombat=1` tient Léo pour battu. `?combat=leo&phase=2&vu=1&leovite=2` : le combat tout seul, pour les essais.
- **L'adresse d'essai de Léo** (`donjon/?leo=1|2|3`, ou la longue `donjon/?combat=leo&phase=1|2|3&objets=…&potions=toutes`) : **depuis le 15 novembre (§9.19), un essai ne garde plus rien dans l'appareil** (`DJ.essai`). Avant, elle écrivait par-dessus la descente en cours (`DJ.garder` à chaque phase), qui était perdue : ce piège est levé.
- **Les trois retouches de l'exploration** : le premier lieu s'appelle « L'entrée des souterrains » et la carte « Les souterrains » ; **plus de bandeau d'explications** (`conte()` garde la phrase pour les tests, mais ne l'affiche plus, sauf à l'écran des potions du départ) ; **la sauvegarde obligatoire** (`doitSauver()` : deux salles de monstres battues et aucune page de sauvegarde écrite → plus de chemin sur la carte, le bouton « Sauvegarder » porte le rond jaune).
- **Les tests** : `test-regles.js` (453), `test-leo.js` (112), `test-leo.py` (31), `test-donjon.py` (92, avec la sauvegarde obligatoire), `test-enquete.py` (33), `test-descente.py` (la vraie descente : la sauvegarde obligatoire, puis le combat de Léo qui s'ouvre au bout).

### 9.15 Le 14 novembre : le combat de Léo après le premier essai de Romain (Bible §13.37)

- **L'écran (`leo.js`)** : en bas, **une seule rangée d'icônes** (`bande()` lit `E.c.barre()`), un cadre par héros à sa couleur (`.lb-g.g-sage|alchimiste|pisteur`), deux lignes d'icônes par cadre ; **plus d'onglets de héros, plus de cible** : `toucherIcone(h, id)` → `agir(h, id)` (les règles choisissent). Le cadre d'un héros pris (au sol, attrapé, étourdi) est estompé, avec son mot ; la barre orange du bas du cadre montre le temps de son geste. Les barres de vie restent sur la scène (`#pv-<héros>`).
- **La rune de l'œil** : `#leo-suite`, aux pieds de Léo, tout en bas de la salle — l'attaque qui vient en grand (`.grand`, `.cours` quand il la prépare), les deux suivantes en petit (`suite(Z)` dans `maj`).
- **La lumière qui l'arrête** : l'évènement `coupe` avec `par:'lune'`, ou `ebloui` (« Ébloui ! »).
- **Le dessin (`leo-anime.js`)** : **la cape suit le buste** (`P._cape` refait son tracé à chaque image : ses coins du haut tournent avec les épaules, l'ourlet traîne) ; deux poses neuves, `pret` et `pretB` (prêt à charger : le buste en avant, une jambe derrière qui racle le sol — `racler()` dans `leo.js`, tout le temps de l'élan de la charge).
- **Reste à faire, avec Romain (les dessins)** : les armes de Léo en plus détaillé, « avec un peu de perspective » (la meule de paille surtout) — des images à lui montrer avant de publier.

### 9.16 Le 14 novembre au soir : le nouveau Léo de la phase 2 (Bible §13.40)

- **Le dessin et le pantin (`moteur/src/leo-corps.js`, `window.LeoCorps`)** : Léo est découpé en **pièces** (`DESSINS` : cuisses, tibias, bottes, bassin, sac à rats, buste, tête, cheveux, neuf visages `v-…`, bras, avant-bras, poings et mains ouvertes, la tunique, les manches, la capuche, la faux, la gourde, son bouchon, le sifflet, le rat), chacune dessinée en SVG **dans sa pose de repos** (bras pendants, jambes droites, mesures d'un cadre de 300 × 340, les pieds en 150, 330), avec les dégradés `DEFS`. `LeoCorps.preparer()` les **cuit en images** (`Cuire.image`, une fois pour toutes les copies, pendant l'écran de passage : `DJ.Leo.preparer`) ; sans cuisson, chaque pièce garde son SVG (les dégradés sont alors posés une fois dans la page, `#lc-defs`). Chaque pièce est un `<div class="lc-p">` (`will-change: transform`) qu'on ne fait que **déplacer et tourner** : `transform: matrix(…)`, écrit seulement s'il a changé.
- **Le squelette (`SQ`) et les poses** : à chaque `poser(pose)`, `_os` calcule les matrices des os — la racine (`x`, `y`, `r`), le bassin (`bas`, `bassin`), le buste (`torse`, et sa respiration `souffle`), la tête (`tete`), les bras (`bAv`/`bAr` = [épaule, coude, poignet], ou `mAv`/`mAr` = où mettre le poignet : **cinématique inverse**, le coude se plie tout seul), les jambes (`pAv`/`pAr` = où poser la cheville : **les pieds restent plantés**, le genou se plie tout seul ; `jAv`/`jAr` pour une jambe en l'air). Ses affaires : `fa` (l'angle de la faux par rapport au buste ; elle ne tourne pas avec le poignet), `fg` (à quelle hauteur du manche il la tient), `deux` (la main de derrière tient la poignée du milieu de la faux), `ga` / `gp` (la gourde : son angle, tenue par le goulot ou par le fond), `ra` (le rat tenu par la queue). Les poses se mélangent (`LeoCorps.melange`) ; `vers(pose, ms)` glisse d'une pose à l'autre (les cinématiques). Ce qui se voit : `visage(v)`, `objet('faux', 'dos'|'main'|null)`, `objet('gourde', 'ceinture'|'main'|null)`, `objet('bouchon', true|false)`, `objet('sifflet', 'cou'|'main')`, `objet('rat', 'main'|null)`, `main('Av'|'Ar', 'poing'|'ouvert')`, `devantAr(on)` (le bras de derrière passe devant le buste), `habits({capuche, tunique, cape})` (la cape est un petit îlot SVG redessiné à chaque image, qui suit les épaules). `point(os, x, y)` : un point d'un os.
- **La façade (`leo-anime.js`)** : `LeoAnime.creer` rend maintenant un objet qui contient **l'ancien pantin** (phases 1 et 3, inchangé, rebaptisé `Ancien`) et **le nouveau** (`.corps`) ; `tenue(2)` montre le nouveau, `tenue(1|3)` l'ancien ; `nouveau()`, `scene(os, x, y)` (un point du nouveau Léo, dans la scène), `ancre(nom)` (aussi `'bouche'`).
- **La phase 2 à l'écran (`moteur/src/leo-p2.js`, `window.LeoP2`)** : `leo.js` crée `E.p2 = LeoP2.creer({leo, fx, sol, persos, Fx, bruit, son, hCx, hPt, LX, SOL})`. En phase 2, en plein combat, **`boucle` n'appelle plus `E.leo.avancer` : `E.p2.image(dt, E.c)` calcule la pose d'après l'état des règles** (`c.leo.etape`, `att`, `tl`, `fin` : l'avancement `k` de l'étape, sur l'horloge de Léo) — `PISTES[att][prise|elan|retour]` = des poses clés `[[k, pose, courbe], …]` ; `repos` : il souffle, se balance, serre les poings ; `sonne` ; `sol` (il a glissé). Par-dessus (`plus`) : le raclement de la charge et son départ (les 0,24 dernière seconde), les glous, les petits tremblements d'effort. Les **repères** (`reperes`) : à tel `k`, une seule fois — le sifflet passe dans sa main, la faux sort du dos, le bouchon saute, le rat sort du sac, les sons et les effets. `VISAGES[att][etape]` : son visage. Les évènements des règles (`impact`, `coupe`, `glisse`, `debout`, `brule`, `soin-leo`, les dégâts sur Léo) passent par `E.p2.evenement` (`leo()`, `leoEtat()`, `un()`). Les effets qui le suivent (`suivre` : la lueur du poing, le reflet de la lame, la potion qui coule, le halo, les flammes, les étoiles) sont mis à jour à chaque image ; `vider()` enlève tout (nouvelle phase, défaite, fin). `icone(att)` : les dessins de la rune de l'œil (`#leo-suite`).
- **La cinématique 1 → 2** : `E.p2.cine12({pause, titre, ramasser, saute, bande, nom})` (`bande(false)` retire la classe `ouvert` de `#combat` : la barre des sorts descend). Les effets y ont leur propre petite boucle (le combat est arrêté).
- **Les effets** : `donjon.css`, classes `.lp-…` (seulement `transform` et `opacity` animés ; les particules par `Fx.particule`).
- **Pour faire une planche de poses** (comme pendant la construction) : une page qui charge `anim/cuire.js`, `leo-corps.js`, `leo-p2.js`, puis `LeoCorps.creer(div).poser(LeoP2.pose('faux', 'elan', .7))`. Pour filmer une attaque dans le vrai combat : `?combat=leo&vu=1&phase=2&leovite=.25` (le combat 4 fois plus lent), et forcer la prochaine attaque : `c.leo.k = LeoRegles.L.ORDRE[2].indexOf('gourde') - 1; c.leo.fin = c.leo.tl + .1; c.leo.etape = 'repos'` (`c = DJ.Leo._E().c`).
- **Les tests** : `moteur/test-leo.py`, parties 10 et 11.

### 9.17 Le 15 novembre : la fluidité du combat de Léo, et ses retouches (Bible §13.41)

- **Le mode « temps réel »** : `SALLE.tempsReel` et `SALLE.tissusFiges`, posés par `leo.js` (`lancer`) et retirés par `terminer`. Lus par `anim/heros/heros-anime.js` (`H._idleOn` : aucune boucle d'attente, classe `ha-tr` qui coupe les animations CSS des tissus ; `H._actif` : les tissus ne sont plus recalculés), `anim/rat/rat-anime.js` et `anim/betes/ratcuir/ratcuir-anime.js` (`_lancerBoucles` : seulement la posture d'un rat ébloui ou sur le dos ; `_planifier` : plus de petits événements). **Tout nouveau combat en temps réel doit poser ces deux drapeaux**, et tout nouveau monstre qui y entre doit les lire.
- **Pourquoi** : dans un combat en temps réel, la page refait une image du fil principal à chaque instant ; chaque animation en boucle est alors recalculée à chaque image (même celles que la carte graphique joue seule), et une seule pièce animée oblige à garder le personnage en plusieurs calques. Mesuré, en pause, processeur ×6 : 30 images/s avec les animations d'attente des héros, 49 sans, 57 sans les héros.
- **La rangée d'icônes** (`bande()`, `E.cases`) : construite une fois par phase ; `C.l` = les cases (`el`, `us` pour l'usure, `la`, `permis`, `reste`), `C.h` = les trois cadres ; la classe `vide` = une icône qui a fini de servir (elle garde sa case). `E.cases = null` la fait reconstruire (début de phase).
- **`maj()`** : `mem(sel)` garde les éléments cherchés (plus de `querySelector` à chaque image).
- **Plus de filtre** : `scene-leo-clair.webp` (fabriqué par `construire.py`, fonction `clair`) ; `#leo-lueur` sans `mix-blend-mode` ; `LeoCorps` : `teinter(nom)` et `flash(couleur, ms)` (l'élément `.lc-teinte`, une lueur) — la façade `LeoAnime` ne met plus de filtre sur le nouveau Léo.
- **`LeoCorps._ecrire`** : une pièce n'est réécrite que si sa matrice a assez changé (`q.w`) ; l'ombre n'est réécrite qu'au demi-point.
- **La toile (canvas), éteinte** : `LeoCorps.avecToile = true` peint tout Léo sur une toile de la taille de la salle (`_choisirToile`, `_peindre`) au lieu de déplacer ses pièces. Deux fois plus lent sur la machine d'essai (sans carte graphique). Habillé (la cinématique), il reste toujours en pièces.
- **L'annonce** (`leo-p2.js` : `ANNONCES`, `annoncer`) : `.lp-annonce`, sa jauge suit l'horloge de Léo ; **la cible du saut** (`cibleSaut`, `finCibleSaut`, `.lp-cible-saut`) ; le saut : `PISTES.saut`, `SAUT_X`.
- **Les règles** (`leo-regles.js`) : `L.ORDRE[2]` sans `poing` ; `L.ATTAQUES.saut` (prise .8, élan 1.5) ; `L.BARRE[2].pisteur` avec `p:acide` ; la rune → `vise:'salle'`, tous les rats ; `L.ARMES.*.infini` (pas de `reste` sur la carte, pas d'évènement `arme`) ; le fléau sur un rat → `{t:'rat', quoi:'meurt', par:'fleau'}` (l'écran le fait fuir), `L.MOTS.fuit`.
- **Le critique** (`noyau.js`) : `SALLE.critLeger = true` pour tous ; `DJ.mesurerCritique` ne fait plus rien (l'ancienne : `DJ.mesurerCritiqueVrai`).
- **Les robots de mesure** : `python3 perf-leo.py [phase] [--taux 6] [--sans-son] [--repos] [--profil] [--js "…"]` (images par seconde du fil principal, où part le temps, les fonctions les plus chères) ; `python3 memoire.py` (émulation iPhone : les calques et leur poids, les images, les toiles). Toujours sous `flock /tmp/brumeval-pw.lock`.

### 9.18 Le 15 novembre : la phase 3 de Léo refaite (Bible §13.42)

- **`LeoAnime` : `NOUVEAU = {2, 3}`** — la phase 3 passe par le nouveau pantin ; `tenue(3)` appelle `corps.forme(3)` et retire la faux et la gourde. L'ancien pantin (`Ancien`) ne sert plus qu'à la phase 1.
- **`LeoCorps.forme(3)`** : `ech` .98, le buste ×1,07 (`_os`), les pièces à peau recuites en couleurs « potion » (`CUIT3`, `aDeLaPeau`, `potion()` : un simple remplacement de couleurs dans le SVG avant la cuisson), les pièces `potion:true` montrées (`p3-torse`, `p3-tete` — cachée pour les visages `ko` et `boit` —, `p3-bras*`, `p3-avant*`), les pièces `plaie:n` montrées selon `etat.plaies` (`C.plaies(n)`). Pour ajouter un détail à Léo sous potion : une pièce `P['p3-…'] = {os, boite, potion:true, svg}` et son nom dans `ORDRE`.
- **`leo.js`** : `p2()` est vrai en phase 2 ET 3 (le nom est resté) ; le contexte de `LeoP2` a `soulever(h, on)` et `balancer([h1, h2])` (les héros de « il attrape ») ; `cine23`.
- **`leo-p2.js`** : `p3(X)` (la forme 3), `G3` / `pose3` (sa posture voûtée), `PISTES.poing3 / rafale / hurlement / attrape / souffle` (la charge est celle de la phase 2), `RAFALE_COUPS`, les effets `aspire`, `ondesCri`, `braise`, `jetDeFlammes`, `fumeeBouche`, `coupRafale`, `entaille`, `mare`, `gouttes` ; `changer` et `vider` ne remettent plus la faux ni la gourde sur lui en forme 3.
- **Les flammes** : `jetDeFlammes` pose quinze `<img class="lp-flam">` (l'image `flamme.png`, `SALLE.img('flamme')`) animées d'un coup (WAAPI, `transform` et `opacity`), en boucle le temps du souffle, puis retirées. Rien à chaque image.
- **Les règles** : `L.BRULE.duree = Infinity` (éteinte dans `_soin`), `L.ARMES.gourde.infini`, `L.DUREES.gourde`, `L.ATTAQUES.poing3`.
- **Essais** : `…/index.html?combat=leo&phase=3&vu=1&objets=…&potions=toutes` ; dans la console, `DJ.Leo._E().c.leo.k = LeoRegles.L.ORDRE[3].indexOf('souffle')` fait venir une attaque ; `DJ.Leo._E().leo.corps.plaies(3)` montre les entailles.

### 9.19 Le 15 novembre : l'adresse courte pour essayer Léo, et l'essai qui ne garde rien (Bible §13.43)

- **`demarrage.js`** : `?leo=N` est un raccourci de `?combat=leo&phase=N&vu=1&objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes` (chaque morceau peut être redonné dans l'adresse : `&objets=…`, `&potions=…`, `&vu=0` pour la cinématique d'entrée, `&graine=7`, `&leovite=3`).
- **`DJ.essai`** : mis par `essaiLeo` et `essaiCombat` ; `DJ.garder` (noyau.js) ne fait alors rien. `window.PARTIE` reste la partie de l'essai, en mémoire (les tests la lisent là). Le jeu normal (`DJ.Explo.demarrer`) ne met jamais `DJ.essai`.
- **L'écran de fin de l'essai de Léo** (`#essai-fin`) : « Rejouer ↻ » (`essai-encore` : recharge la page) et `.essai-phases` : « Phase 1 / 2 / 3 » (`essai-phase-N` : va à `?leo=N`).
- **Le test** : `test-leo.py`, section 13 (`test_adresse`) ; `SEUL=adresse python3 test-leo.py` ne lance qu'elle (une minute au lieu de cinq).

### 9.20 Le 15 novembre : les cinématiques de Léo en vrais petits films (Bible §13.45)

- **Les films** sont fabriqués à part (`jeu/cine/`, voir la Bible) et mis en ligne dans `brumeval/cine/` du site ; le donjon les lit en `../cine/<nom>.mp4`. **`CINE_INFOS`** (`jeu/cine/sortie/cine-infos.js`, embarqué par `construire.py`, groupe « cinématiques », avec `jeu/src/cine-lecteur.js`) : la durée, les sons à l'heure, les sous-titres de chaque film.
- **`leo.js`** : `film(nom, o)` (le lecteur, les bruitages par `DJ.bruit`, le 🔊 par `DJ.lire`) ; `prechargerFilms(n)` (appelé par `lancer`, avant `E.cine = true` : télécharge d'avance les films des phases qui restent) ; **`cine12`, `cine23` et `victoire` jouent le film d'abord** ; s'il répond `'echec'` (pas de film, pas d'internet, vidéo illisible), l'ancienne scène dessinée en direct. Après `b23` : `E.leo.tenue(3)`, le Pisteur ramasse la faux et la gourde. `victoire` : « Passer » seulement si `faits['leo:finVu']` ; après le film, `terminer('victoire')` (les cinq bulles de l'aveu ne sont plus montrées : les phrases sont dans le film).
- **Les sons** : `essai/sons/cine.js` (20 sons « cine… », section « Léo › Cinématiques » de l'Atelier), embarqués dans le donjon comme les autres (`DJ.sonsProvisoires`).
- **Essayer un film à part** : dans la console, `CineLecteur.essai = '<adresse d'une vidéo>'` force la vidéo du prochain film ; `CineLecteur.essai = ''` fait échouer le prochain film (l'ancienne scène).
- **Le test** : `moteur/test-cine.py` (les trois films du combat, les sous-titres, le 🔊, « Passer », sans film ; et la bande-son, servie comme sur le site par un petit serveur).
- **16 h 57 : la bande-son** (Bible §13.45, « Le son des films, deuxième tour ») : chaque film a sa bande-son mélangée d'avance (`../cine/<nom>.mp3` : les bruitages et la musique). `film()` la donne au lecteur (`piste`, si `CINE_INFOS[nom].piste`), avec le contexte audio du donjon (`SALLE.Son.contexte()`, nouveau dans `essai/src/son.js`) et le volume des bruitages ; **la musique du donjon se tait pendant le film** (`SALLE.Son.sourdine(true)`, nouveau ; `false` après). `prechargerFilms` télécharge aussi les bandes-son. Sans bande-son : les bruitages un par un (`DJ.bruit`), comme avant. Le contexte n'existe qu'après le premier toucher (`SALLE.Son.demarrer`) : un robot doit l'appeler.

### 9.21 Le 15 novembre (13 h 54) : la phase 3 qui ne pardonne pas, la fluidité de la rafale et des flammes (Bible §13.46)

- **Les règles** (`leo-regles.js`) : deux étapes nouvelles de Léo — `coups` (la rafale : `P._rafale` frappe un coup toutes les `pas` secondes de SON horloge ; évènements `{t:'leo', quoi:'coups'}` au début, `{quoi:'coup', k, n}` à chaque coup, `{t:'pare', k, n}` quand le bouclier jaune pare) et `porte` (« il attrape » : `{quoi:'porte', heros, autre}` quand il l'empoigne, puis `P._frappeAvec` : `{quoi:'frappe-avec', pris, autre, mortel}`). `A.mortel:{3:true}` (la charge), `A.perce` (le cri passe les boucliers), `A.marteau` (en phase 3 le marteau ne coupe que ça), `L.ARMES.marteau.phases:[2, 3]`, `S.pare` (les coups parés par le bouclier en place). La photo (`etat()`) a `leo.coup`, `leo.porte`, et `vise.mortel / perce`.
- **`leo-joueurs3.js`** : `node leo-joueurs3.js` — deux robots de la phase 3 (« bon », avec un temps de réaction ; « spam »). `test-leo.js` les rejoue.
- **L'animation** (`leo-p2.js`) : `PISTES.rafale.coups` (fabriquée par `pisteCoups()` : un direct par coup des règles), `PISTES.attrape.porte` ; `x:'cible2'` dans une pose = devant le second héros (`X.cibleX2`) ; `porter(X, h)` (le héros suit la main de Léo à chaque image : `sc(X, 'mainAv', 197, 246)`), `lacher`, `valdingue`, `frappeAvec` ; l'annonce continue pendant `coups` et `porte` (`annoncer`). L'écran prête `ctx.slot(h)` (la boîte d'un héros).
- **Les sons à l'avance** : `leo.js` → `BRUITS` (une liste commune, une par phase), `sonsPhase(n)` (appelée par `preparer(phase ou partie)`, `demarrerPhase`, et avant chaque cinématique) ; `son.js` → `preparerBruits(ids, {seuls:true})`, `oublierBruits()`, `bruitsPrets()`, `bruitsEnCours()`, `bruitsListe()` ; rangés dans `PRE.fixe` (à part des bruitages lourds d'un combat ordinaire).
- **Les héros** : `anim/heros/src/` est la source (`sh anim/heros/build.sh` fabrique `heros-anime.js`) ; `H._flash` sans filtre ; le geste du bouclier jaune ×1,5.
- **Mesurer une attaque** : `python3 perf-leo.py 3 --attaque rafale` (Léo ne fait plus que celle-là ; les images par seconde moment par moment) ; `DOSSIER=<un donjon construit> python3 perf-leo.py 3` pour comparer deux versions **au même moment** (la machine d'essai change de vitesse d'une heure à l'autre).

### 9.22 Le 15 novembre : la phase 1 sur le nouveau Léo (Bible §13.47)

- **`leo-anime.js`** : `NOUVEAU = {1, 2, 3}` ; `tenue(1)` = `corps.forme(2)` + `corps.habits({capuche, tunique, cape})`. **`leo.js`** : `p2()` est vrai dans les trois phases (les gestes de Léo viennent toujours de `leo-p2.js`) ; `leo()`, `leoImpact`, `JEU`, `racler` et `Ancien` ne servent plus (à retirer).
- **`leo-corps.js`** : une arme = une pièce `{os:'arme', arme:'<nom>'}` (repère : la main ; le manche descend), montrée par `C.arme(nom)` ; sa matrice `M.arme = enMain(0, 14, p.aa, T(0, -p.ag))`. Pour en ajouter une : la pièce, son nom dans `ORDRE`, et c'est tout. Sous la tunique, `torse`, `bras*`, `avant*` sont cachés (`_maj`).
- **`leo-p2.js`** : `PISTES.<attaque>.tient` et `.farine` (le crochet), l'étape `noirci` (après le BOUM) = la pose « sonné » ; `ANNONCES_SUITE.tient`. **Rien ne doit monter au-dessus de la tête de Léo** (le haut de l'écran est couvert).
- **Regarder une attaque** : `…/donjon/?leo=1`, puis dans la console `DJ.Leo._E().c.leo.k = LeoRegles.L.ORDRE[1].indexOf('marteau') - 1`.
- **17 h 26, l'ordre de la phase 3** (Bible §13.46, retouche) : `L.ORDRE[3] = ['poing3', 'rafale', 'charge', 'hurlement', 'attrape', 'charge', 'souffle']` — **une attaque peut revenir deux fois dans un tour** (rien ne suppose le contraire : `_leoChoisir`, `_suite`, l'œil) ; les essais qui sautent à une attaque prennent la première (`indexOf`).
- **20 h 27, l'entrée en film** (Bible §13.45) : `cineEntree` joue d'abord le film `entree` (`film('entree', {passer:false})`), l'ancienne entrée dessinée en direct s'il n'arrive pas ; `preparer(partie)` le télécharge (`prechargerFilm`, une fonction à part de `prechargerFilms`) quand `leo:vu` n'est pas encore là.
- **18 h 29 et 18 h 33** (Bible §13.46, retouche) : **la musique** — `leo.js` → `musiquePhase(n)` (`grand:leo1|2|3` par `musiqueDesQuePrete`), appelée par `demarrerPhase` et par `finPhase` AVANT la cinématique ; `victoire` → `DJ.musiqueApresCombat('leo')` ; `construire` ne joue plus de musique (seulement `Son.combat(true)`) ; les musiques : `MUSIQUES.leo1A/2A/3A` (`essai/sons/musiques-donjon.js`), leurs boucles dans `BOUCLE` (`essai/src/son.js`), leurs niveaux dans `niveaux.json`. **Le marteau** : `P._touche` (coup `'marteau'`) coupe un geste seulement s'il porte `marteau:true` (`saut`, `gourde`, `hurlement`) ; sinon `L.MOTS.resiste` pendant un geste, `L.MOTS.cri` en phase 3. **Le souffle** : la brûlure se pose sur tout héros encore debout après le coup, même si le bouclier jaune l'a paré (`_leoImpact`, avant le test `passe`).

### 9.23 Le 15 novembre au soir : les à-coups des sorts, le témoin du combat (Bible §13.50 ; `RAPIDITE.md` R19 à R21)

- **Les effets des héros** (`anim/heros/src/`, puis `sh anim/heros/build.sh`) : plus de `filter`, de `mix-blend-mode` ni de `clip-path` sur un effet ; les lueurs dessinées (`lueurForme(d, couleur)`, `lueurTrait(d, couleur, épaisseur)`, `lueurRonde(couleur, rayon)`, dans un SVG ; `tache(c, c2)` pour un élément HTML) ; `combien(n)` = le nombre d'étincelles (un tiers de moins en temps réel, la moitié si `SALLE.leger`) ; en temps réel, `H._dome` dessine ses hexagones dans le dôme, immobiles, et l'éclat est `.ha-dome-eclat` (opacité).
- **Les sons** (`essai/src/son.js`) : `Son.preparerBruits(['id', 'id:B', …])` (« id:B » = cette version exactement) ; `Son.preparerMusique(nom)` fabrique une musique sans y passer et sans attendre le premier toucher ; `Son.combat(true)` ne fabrique plus le lot « bruitages » si `SALLE.tempsReel`. **`leo.js`** : `BRUITS` (la liste complète, par phase), `fabricationFinie()`, `sonsPrets(max)` (appelé par `preparer`, `demarrerPhase`, `finPhase`).
- **Le témoin** (`noyau.js`) : `DJ.temoinLeo(texte | false)`, `DJ.plantagesLeo()`, `DJ.plantageLeoOu()`, `DJ.ligneVersion()` ; posé par `noter(ev)` dans `leo.js` (une ou deux écritures par seconde), effacé par `terminer` et par `pagehide` ; `DJ.verifierTemoin()` compte et allume `SALLE.leger`. Pour remettre un appareil à zéro (console) : `['brumeval-donjon-plantages-leo', 'brumeval-donjon-plantage-leo-ou'].forEach(function(k){ localStorage.removeItem(k); })`.
- **L'adresse d'essai** : `adressePhase(n)` réécrit `?leo=<n>` quand une phase est gagnée (`DJ.essai` seulement).
- **Les robots** : `sautes-leo.py <phase> [--fois 2] [--froid] [--seul <mot>]` (`DOSSIER=<un donjon construit>` pour comparer) ; `test-leo.py`, section 16 (`SEUL=filet`).
