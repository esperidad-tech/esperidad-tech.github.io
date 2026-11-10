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
