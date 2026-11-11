# Les règles du donjon — mode d'emploi pour l'affichage et l'exploration

> Écrit le 10 novembre 2026. Pour les agents qui construisent le combat à l'écran (`combat-*.js`) et l'exploration (`explo-*.js`).
> Les règles sont dans `src/regles.js` (le calcul) et `src/donnees.js` (les tableaux). **L'affichage ne décide jamais d'un résultat** : il appelle une action, reçoit une liste d'évènements, et les joue dans l'ordre.
> La liste complète des évènements, avec un exemple de chacun, est **en tête de `src/regles.js`** : c'est elle qui fait foi. `node test-regles.js` vérifie que chaque type décrit est envoyé, et rien d'autre.

## 1. Les fichiers

| Fichier | Rôle |
|---|---|
| `src/donnees.js` | Les tableaux : héros, gestes, recettes, objets, monstres (avec leurs réactions), salles, lieux, dalles, codes, Grand Livre, refus. Dans la page : `window.DonjonDonnees`. À charger **avant** `regles.js`. |
| `src/regles.js` | Tout le calcul. Dans la page : `window.Regles`. Dans Node : `require('./src/regles.js')`. `Regles.D` = les données. |
| `test-regles.js` | `node test-regles.js` : plus de 300 vérifications (la salle des rats identique à l'essai, chaque combo, chaque piège, objets, sauvegardes, le contrat des évènements, les noms des modules animés…). |
| `equilibre.js` | `node equilibre.js [parties] [--md]` : la simulation de difficulté ; `--md` réécrit `equilibre.md`. |
| `equilibre.md` | Le rapport de difficulté (ne pas le corriger à la main). |

Aucune dépendance. Pas de DOM, pas de son, pas de minuterie. Le hasard est à graine : la même partie, les mêmes gestes, le même résultat.

## 2. La partie

```js
var partie = Regles.nouvellePartie(graine);   // l'état de MOTEUR-DONJON.md §3.5, tel quel, avec la sauvegarde de départ (au fond du puits)
```

Les champs sont ceux du cahier des charges (`v, graine, lieu, vus, faits, heros, recettes, sac, livre, codes, or, repos, sauvegarde`). Quelques précisions :

- **Un champ en plus : `fuites`** (`{canaux: 2}`) : le nombre de fuites ou de défaites par salle. Comme `livre`, il n'est pas touché par une fuite et n'est pas dans la sauvegarde.
- **`graine`** change à chaque tirage (c'est l'état du hasard). **`livre[monstre]`** est le nombre de lignes apprises (0 = rencontré, page encore blanche).
- **`vus`** : les règles y mettent les lieux où on entre. L'exploration peut y ajouter ses propres clés (couloirs découverts) : elles sont sauvegardées et rechargées avec le reste.
- **`faits`** : les clés que les règles écrivent :

| Clé | Sens |
|---|---|
| `combat:<salle>` | ce combat est gagné (`rats`, `canaux`, `egouts`, `toiles`, `atelier`, `crypte`, `ossuaire`, `bassin`) |
| `objet:<id>` | cet objet est pris (aussi pour les objets à code : `objet:fleur-givre`…) |
| `pose:<id>` = lieu | cet objet a été laissé dans ce lieu (on peut l'y reprendre) |
| `coffre:<lieu>` = id | le choix fait dans ce coffre (`reserve`, `bibliotheque`) |
| `os` = 1 ou 2 | les fouilles du tas d'os |
| `secret` | le crâne a été touché : le passage `eboulis` ↔ `camp` est ouvert |
| `dalles` = 0…5 | où on en est dans le couloir aux dalles ; `piege:dalles` : il est passé pour toujours |
| `code:<id>` | un code a été montré (`porte:odette`, `leo:attrape`) |
| `sac:ouvert` | on peut refaire le sac (au départ, et après une fuite ; il se ferme en entrant dans une salle de combat) |
| `amulette:utilisee` | l'amulette a servi |
| `fin` | Léo est trouvé |

**Recharger la page n'est pas une fuite** : garder `Regles.exporter(partie)` dans le `localStorage` (après chaque action hors combat, et après chaque `livre`), relire avec `Regles.importer(texte)` (rend `null` si le texte est abîmé). Pendant un combat, `partie` n'est pas modifiée (sauf `livre` et `graine`) : si la page se recharge, on retrouve l'état d'avant le combat, avec `partie.lieu` = la salle et pas de `combat:<salle>` dans `faits` → relancer le combat.

## 3. Le combat

```js
var c = Regles.combat(partie, 'canaux');      // le tour 1 est déjà commencé, les bêtes ont choisi leur proie
jouerLesEvenements(c.entree());               // debut, arrive × n, tour, vise × n
// le tour des héros : dans l'ordre que les joueurs veulent, un geste chacun
c.gestes('pisteur');                          // ses gestes : [{geste, nom, vise, permis, mot, cibles, max}]
c.refus('pisteur', 'dague', 'b3');            // null, ou « Trop loin ! »
var ev = c.jouer('pisteur', {geste:'fleche', cible:'b2'});   // une liste d'évènements (un refus : [{t:'refus', heros, geste, mot}])
if(!c.fini() && c.aJouer().length === 0) ev = c.tourMonstres();   // quand plus personne ne peut jouer : les monstres, puis le tour suivant
c.fini();                                     // null | 'victoire' | 'defaite'
c.fuir();                                     // le bouton « Fuite ! » (après la question « Fuir la salle ? ») : recharge la sauvegarde
```

- **`c.aJouer()`** : les héros qui peuvent encore faire un geste ce tour-ci. Un héros au sol, déjà passé, pris dans la toile ou sans aucun geste possible n'y est pas. Quand la liste est vide (et que le combat n'est pas fini), **c'est à l'affichage d'appeler `c.tourMonstres()`**. L'appeler trop tôt rend `[{t:'refus', mot:'Pas encore !'}]`.
- **`c.tourMonstres()`** rend, dans l'ordre : les attaques des monstres (de devant à derrière), la fin du tour (ce qui se referme, les états qui s'en vont, les boucliers qui s'éteignent), puis soit `fin`, soit le tour suivant (`tour`, les `vise`, les `passe`).
- **La victoire** écrit dans `partie` : les PV restants, `faits['combat:<salle>']`, `repos = false`. Un héros au sol se relève avec 1 PV. **La défaite ne touche à rien** : montrer « On fait le point », puis appeler `Regles.fuir(partie)` (ou `c.fuir()`).
- **Après une victoire**, rappeler `Regles.entrer(partie, partie.lieu)` : il dit ce qu'il y a maintenant dans la salle (le sarcophage de la fausse crypte, la boucle des égouts).
- **`c.etat()`** : une photo complète (héros, bêtes, états, proies, tour) pour afficher ou réafficher. `c.h`, `c.b`, `c.tour` sont lisibles aussi (ne pas les modifier).
- **Le bouton 📖** : `Regles.grandLivre(partie)` (il marche aussi en plein combat ; une ligne apprise y est tout de suite).
- **Ce que la bête montre (`vise`) peut être démenti par son `attaque`** : un héros visé qui est tombé entre-temps est remplacé par le plus exposé encore debout ; Bourbe gonflé pendant le tour saute au lieu de tirer la langue. C'est l'évènement `attaque` qui dit vrai.
- Les ids : les héros `'pisteur'`, `'alchimiste'`, `'sage'` ; les bêtes `'b1'`, `'b2'`… dans l'ordre d'arrivée. `position` 0 = **devant** (côté héros).

### Les gestes

`geste` est un id ; `vise` dit ce qu'il faut toucher ; `cible` est un id (ou un tableau de deux héros pour le bouclier avec le bâton de chêne).

| Héros | `geste` | `vise` | Cibles permises |
|---|---|---|---|
| Sage | `etudier` | `bete` | toute bête vivante |
| Sage | `rune` | `bete` (ou `salle` avec le cristal de lune : pas de cible) | les bêtes qu'on peut viser |
| Sage | `bouclier` | `heros` | un ami debout (`max` = 2 avec le bâton de chêne) |
| Alchimiste | `louche` | `salle` (pas de cible) | — |
| Alchimiste | `herbes` | `heros` | un ami debout |
| Alchimiste | `p:<recette>` du sac | `bete`, `salle` (Fumigène), `heros` (Baume), `sol` (Cœur vaillant : un ami au sol), `equipe` (Baume lumineux) | selon la recette |
| Pisteur | `fleche` | `bete` | les bêtes qu'on peut viser |
| Pisteur | `dague` | `devant` | la bête de devant, et celles qui sont **tombées devant** : la chauve-souris au sol, l'araignée sur le dos, Bourbe sur le dos (pas le rat : comme dans l'essai, seul celui de devant) |
| Pisteur | `p:<recette>` | `bete` | seulement feu, huile, colle, acide, givre (les autres : `permis:false`, « Impossible ! ») |
| un héros avalé | `chatouiller` | `salle` | — (c'est son seul geste) |

`c.gestes(h)` rend **tous** les gestes du héros, y compris ceux qu'il ne peut pas faire maintenant (`permis:false`, avec `mot` : la raison en deux mots, à afficher sur la carte grisée). Il rend `[]` pour un héros au sol, qui a déjà joué ou qui est pris dans la toile.

Les refus (`c.refus`, ou l'évènement `refus`) : « Au sol ! », « Déjà joué », « Trop loin ! », « Encore debout », « Impossible ! », « Personne au sol », « Entoilé ! », « Avalé ! », « Trop haut ! » (l'araignée remontée), « Sous l'eau ! » (Bourbe a plongé), « Pas emporté », « Un seul geste », « Qui viser ? », « C'est fini », « Pas encore ! ». Ils sont dans `D.MOTS`.

## 4. Jouer les évènements : les héros (`HerosAnime`)

| Évènement | Ce que fait l'affichage |
|---|---|
| `tir {bete, fleche, rebond}` | `pisteur.tirer(scene, to, type, {rebond})`. `fleche` : `normale`, `argent`, `lourde`, `feu`, `huile`, `colle`, `givre`, `acide` (les mêmes noms que le module). `rebond:true` : la flèche ricoche. Viser `ancre('pointfaible')` si la bête est ouverte, sinon `ancre('centre')`. |
| `dague {bete}` | `pisteur.dague(scene, to)` |
| `potion {recette, bete}` | `alchimiste.preparer(recette)` puis `alchimiste.lancer(scene, to, recette)` (pour une recette sans nom dans le module : la couleur `D.RECETTES[recette].coul`). Avec `heros2` : sur un ami. Avec `salle:true` : le nuage, au milieu des bêtes. Avec `equipe:true` : sur les trois héros. |
| `louche {bete}` | `alchimiste.louche(scene)` (il tape sur sa marmite). `bete` : celle de devant, qui reçoit le coup (`touche louche` ou `rebond` suit) ; puis un `touche bruit` par bête. |
| `herbes {heros2}` | `alchimiste.herbes(scene, to)` |
| `rune {bete}` | `sage.sort(scene, to)` ; avec `salle:true` : `sage.eclairSalle(scene, {cibles})` (toutes les bêtes vivantes) |
| `pose-bouclier {cibles}` | `sage.bouclier(scene, conteneur ou [c1, c2])` : garder le ou les dômes. Ensuite, `degats {heros, bouclier:true, absorbe}` → `dome.absorber(absorbe)` ; `etat {heros, nom:'bouclier', on:false}` → `dome.retirer()`. (Le `etat {heros, nom:'bouclier', on:true}` qui suit `pose-bouclier` ne demande rien de plus : il sert au badge « 🛡️ −50 % · 1 tour ».) |
| `etudie {bete}` | `sage.etudier()` ; le `livre` qui suit : la page qui vole vers le bouton du Grand Livre (`rien:true` : il relit, rien de neuf). |
| `chatouille {heros, bete}` | le héros est dans le ventre de Bourbe, on ne le voit pas : rien à animer de son côté (`HerosAnime` n'a pas de geste pour ça). C'est la réaction de Bourbe qui se voit : le `special chatouille` ou `special recrache` qui suit. |
| `degats {heros, n, pv, brut, bouclier, absorbe, bete, attaque}` | le chiffre −n sur le héros, sa barre à `pv` ; `heros.touche(type)` avec `'froid'` (attaque `brulure`), `'grouillement'`, `'poing'`, sinon `heros.touche()`. À jouer au moment de l'impact de l'`attaque` qui précède. |
| `tombe {heros}` | `heros.tomber()` |
| `releve {heros, pv, par}` | `heros.relever()` ; `par:'amulette'` → `heros.relever({amulette:true})` et l'amulette disparaît de ses objets |
| `soin {heros, n, pv, par}` | le chiffre +n (vert) ; `par` : `herbes`, `baume`, `baumelum`, `repos` |
| `etat {heros, nom:'entoile', on}` | `heros.entoile(true / false)` |
| `pare {heros, bete, quoi}` | le bouclier arrête la `toile` ou la `langue` : la montrer qui glisse sur le dôme |
| `avale {bete, heros}` | `heros.avale()` (au `onImpact` / `onAvale` de la langue de Bourbe) ; `bourbe.etat('avale', true)` |
| `recrache {bete, heros}` | `heros.recrache(scene, depuis)` avec `depuis = bourbe.ancre('bouche')` ; `bourbe.etat('avale', false)` |
| `passe {heros, mot}` | au début du tour : ce héros ne jouera pas (le montrer grisé, « Entoilé ! ») |

Les objets portés : au début du combat (`debut.heros[h].objets`), appeler `heros.equiper(D.OBJETS[id].equipe)` pour chacun.

## 5. Jouer les évènements : les bêtes (`BETES[module]`)

`debut.betes[i].module` est l'id du module (`rat` : `RatAnime`, à envelopper ; les autres : `BETES[module]`).

| Évènement | Ce que fait l'adaptateur de la bête |
|---|---|
| `arrive {bete, par, de}` | `creer(conteneur)` puis `entrer()`. `par:'debut'` : l'entrée normale. `par:'eclosion'` : une petite araignée sort d'un œuf (voir l'araignée). `par:'plongeon'` : un têtard saute hors du bassin. `bete.position` : sa place dans la file (0 = devant ; les nouvelles se mettent devant, les autres reculent). |
| `vise {bete, attaque, cibles}` | l'icône au-dessus de la bête (`ancre('haut')`) : la tête du ou des héros visés. `attaque` permet de changer l'icône (une toile, une langue). Pas de `vise` pour une bête : elle ne prépare rien ce tour-ci. |
| `touche {bete, coup}` | `acteur.touche(coup)`. **Sauf** `critique:true` : ne pas appeler `touche`, c'est le critique (ci-dessous). `piege:true` : ça le renforce (un son, un mot rouge). |
| `rebond {bete, coup}` | `acteur.touche('rebond', {arme})` : il est immunisé, il nargue. Mot volant : « Ça rebondit ! ». |
| `special {bete, nom}` | `acteur.special(nom, o)`. **Attention** : plusieurs modules lancent déjà ce moment tout seuls dans `touche(coup)` (tableaux ci-dessous, colonne « déjà fait par `touche` ») : dans ce cas, ne pas le rappeler. |
| `etat {bete, nom, on, tours}` | `acteur.etat(nom, on)`. Si `touche` l'a déjà posé (`acteur.etatCourant()[nom]`), ne rien refaire. `tours` sert aux badges (« 1 tour », « jusqu'à la fin »). |
| `ouvert {bete, par, tours}` / `ferme {bete}` | `acteur.etat('ouvert', true / false)` : le point faible brille et palpite. |
| `degats {bete, n, pv, critique, surprise, cause}` | le chiffre −n à `ancre('pointfaible')` (ouvert) ou `ancre('centre')`, la barre à `pv`. `critique:true` : le gros « CRITIQUE ! » localisé autour de la bête ; si un `mort {mode:'explose'}` suit, c'est `exploser(scene)`, sinon `touche(coup)` en plus fort. `surprise:true` : le critique surprise (une chance sur 8), même mise en scène. |
| `gagne {bete, n, pv, pvMax}` | sa barre grandit (le feu follet) |
| `mot {bete, texte}` | deux mots volants au-dessus de la bête |
| `brulure {bete, n, pv}` | il brûle encore : `acteur.touche('brulure')` (ratcuir, araignee, petitearaignee, roirats, gardien) ou `touche('feu')` pour les autres ; chiffre « −4 🔥 » |
| `saute {bete, nom}` | il n'attaque pas, à cause de l'état `nom` (`colle`, `gele`, `tournis`, `noeud`, `dos`, `sous`) : un petit mot (« rhââ ! ») |
| `attaque {bete, nom, cibles, fois}` | `acteur.attaquer(nom, {scene, vers, onImpact})` ; `vers` : le ou les points des héros de `cibles`. Les `degats {heros}`, `tombe`, `pare`, `avale`, `etat {heros}` qui suivent se jouent aux impacts, dans l'ordre. `fois:2` : deux coups (deux `degats`). |
| `mort {bete, mode}` | `fuit` → `acteur.fuir()` ; `meurt` → `acteur.mourir()` ; `explose` → `acteur.exploser(scene)` (le critique mortel : les restes demeurent). `cause:'chef'` : les têtards détalent quand Bourbe est battu. |

**L'ordre dans une liste** : le geste du héros d'abord (`tir`, `potion`…), puis pour chaque bête touchée : `touche` (ou `rebond`), ses `special`, ses `etat`, son `ouvert`, ses `mot`, ses `degats`, sa `mort`.

**Les règles font foi sur les états.** Plusieurs modules posent un état tout seuls dans `touche(coup)`. Après chaque `touche`, l'adaptateur compare `acteur.etatCourant()` avec ce que les règles ont annoncé (les `etat` de la liste, ou `c.etat().betes[i].etats`) : un état que le module a posé sans que les règles l'annoncent s'enlève aussitôt (`acteur.etat(nom, false)`). Exemples : la colle ou le givre sur un élite (« Trop fort ! »), le nuage sur une araignée déjà sur le dos.

### Le rat d'égout (`RatAnime`, l'ancienne API)

40 PV, morsure 8. Ses règles sont celles de la salle d'essai, **sans rien changer**.

| Ce qui arrive | Évènements | `RatAnime` |
|---|---|---|
| lumière | `touche lumiere`, `etat ebloui` (1), `ouvert` | rien pour `touche` (comme dans l'essai), `ebloui(true)`, `cible(true)` |
| huile | `touche huile`, `etat dos` (1), `ouvert` | rien pour `touche`, `retourner(true)`, `cible(true)` |
| bruit (la louche) — **piège** | `touche bruit`, `etat enrage` (fin) | `enrager()` (yeux rouges) : il mordra 2 fois |
| feu | `touche feu`, `etat brule` (fin), `degats` 5 (30 ouvert) | `bruler(true)`, `touche()` |
| colle | `touche colle`, `etat colle` (1) | `coller(true)` ; il ne mord pas ce tour-ci |
| nuage | `touche nuage` | `tousser()` |
| flèche, dague, louche, acide | `touche`, `degats` 3, 4, 2 (10 ouvert), 5 (25 ouvert) | `touche()` |
| givre | `touche givre`, `etat gele` (1) | pas d'état « gelé » dans `RatAnime` : à dessiner par l'adaptateur (il ne mord pas ce tour-ci) |
| `ferme`, `etat … on:false` | | `cible(false)`, `ebloui(false)`, `retourner(false)`, `coller(false)` |
| `attaque morsure` | | `mordre({onImpact})` (une fois par `degats`) |
| `mort` | | `fuit` → `fuir()` ; `explose` → `exploser(scene)` |

### Le rat cuirassé (`ratcuir`)

70 PV, `coup-de-tete` 18. Fermé, il ne craint presque rien (flèche 1, dague 2, louche 1). L'armure tombée, il est **ouvert jusqu'à la fin du combat**.

| Ce qui arrive | Évènements | Déjà fait par `touche` ? |
|---|---|---|
| acide, avec l'armure (chemin normal) | `touche acide`, `special armure-tombe`, `etat nu` (fin), `ouvert` (fin) | oui : `touche('acide')` lance `armure-tombe` |
| givre, avec l'armure (autre chemin) | `touche givre`, `special armure-eclate`, `etat nu` (fin), `ouvert` (fin) | oui |
| louche, 1er coup (il est devant) | `touche louche`, `special tournis`, `etat tournis` (2) — il ne frappe pas tant qu'il a le tournis | oui |
| louche, 2e coup pendant le tournis | `touche louche`, `special casque-tombe`, `etat tournis on:false`, `etat sans-casque` (fin) | oui |
| lumière, sans casque (chemin sans potion) | `touche lumiere`, `etat ebloui` (1), `ouvert` (1) | oui (`ebloui`) |
| lumière, avec le casque | `touche lumiere`, `mot` « Ça glisse ! » | — |
| feu, avec l'armure — **piège** | `touche feu` (piege), `etat rougeoie` (fin), `mot` : ses coups font +6 | oui (`rougeoie`) |
| feu, sans armure | `touche feu`, `etat brule`, `degats` 30 | oui (`brule`) |
| acide ou givre, sans armure | `touche`, `degats` 25 / `etat gele` (1) | `gele` : oui |
| colle, huile, nuage | `etat colle` (1) / `mot` / rien | `colle` : oui |

Si l'acide ou le givre fait tomber une armure rougie : `etat rougeoie on:false` est envoyé avant `nu`.

### La chauve-souris (`chauvesouris`)

25 PV, `pique` 30 (2 fois si elle est folle). Les règles n'envoient pas de `special` pour elle.

| Ce qui arrive | Évènements | Déjà fait par `touche` ? |
|---|---|---|
| bruit (chemin normal) | `touche bruit`, `etat au-sol` (1), `ouvert` (1) | oui (`au-sol`) |
| colle (autre chemin) | `touche colle`, `etat colle` (1), `etat au-sol` (1), `ouvert` (1) — collée, elle n'attaque pas | oui |
| lumière — **piège** | `touche lumiere` (piege), `etat folle` (fin), `mot` | oui (`folle`) |
| elle attaque alors qu'elle est tombée | `etat au-sol on:false`, `ferme`, puis `attaque pique` | `etat('au-sol', false)` = elle se renvole |
| `attaque pique`, `fois:2` | deux `degats` | `attaquer('pique', {vers:[p1, p2], onImpact})` |

Tombée, elle est **à portée de dague** même si elle n'est pas devant.

### Le feu follet (`feufollet`)

30 PV, `brulure` 18 sur 2 héros. Fermé : flèche et dague 1, louche et feu 0.

| Ce qui arrive | Évènements | Déjà fait par `touche` ? |
|---|---|---|
| nuage (chemin normal) | `touche nuage`, `etat visible` (1), `ouvert` (1) | oui (`visible`) |
| son attaque tombe sur un bouclier (sans potion) | après les `degats` : `touche bouclier`, `special accroche`, `etat accroche` (2), `etat visible` (2), `ouvert` (2) : ouvert pendant tout le tour suivant | oui : `touche('bouclier')` lance `accroche` |
| lumière — **piège** | `touche lumiere` (piege), `special grandit`, `etat grand` (fin), `gagne` +30, `mot` | oui : `touche('lumiere')` lance `grandit` |
| flèche d'argent, fermé | `touche fleche-argent`, `degats` 10 | |
| feu, fermé | `touche feu`, `mot` « Même pas chaud » | |
| `attaque brulure` | `cibles` : 2 héros | `attaquer('brulure', {vers:[p1, p2], onImpact})` |
| battu sans critique | `mort meurt` | `mourir()` (il s'éteint) |

### L'araignée des caves (`araignee`) et la petite araignée (`petitearaignee`)

Araignée : 60 PV. Elle alterne `toile` (le héros visé passe son prochain tour ; `etat {heros, entoile}`) et `morsure` 18, en commençant par la toile.

| Ce qui arrive | Évènements | Déjà fait par `touche` ? |
|---|---|---|
| lumière (chemin normal) | `touche lumiere`, `etat dos` (1), `ouvert` (1) | oui (`dos`) |
| huile (autre chemin) | `touche huile`, `etat dos` (1), `ouvert` (1) | oui |
| feu, la première fois — **piège** | `touche feu` (piege), `etat oeufs-brulent` (fin), `special eclosion`, 2 × `arrive {par:'eclosion', de}`, `mot` | `oeufs-brulent` : oui. `eclosion` : **non**, à appeler : `special('eclosion', {vers})` rend les deux points où tombent les œufs ; y créer les deux `petitearaignee` et lancer leur `entrer()`. |
| feu, ensuite | `touche feu`, `etat brule`, `degats` | |
| nuage — **piège** | `touche nuage` (piege), `etat haut` (1), `mot` : on ne peut plus la viser ce tour-ci (`cache:true` dans `c.etat()`) | oui (`haut`) |
| elle attaque alors qu'elle est sur le dos | `etat dos on:false`, `ferme`, puis `attaque` | `etat('dos', false)` |
| `attaque toile` | `etat {heros, entoile, on:true}`, ou `pare` si le héros a un bouclier | `attaquer('toile', {scene, vers, onImpact})` ; retirer la toile quand `etat {heros, entoile, on:false}` arrive |

Petite araignée : 15 PV, `morsure` 6. Elle s'ouvre comme sa mère (lumière : `ebloui` ; huile : `dos`). L'étudier, c'est lire la page de l'araignée.

### Le têtard (`tetard`)

15 PV, `morsure` 8. Pas de point faible : **n'importe quel coup qui fait des dégâts le renvoie à l'eau** (`degats` 15, `mort fuit`). Les règles n'envoient aucun `special` (le `plouf` est à la discrétion de l'affichage).

### Le Roi des rats (`roirats`, élite)

220 PV, `grouillement` 16 sur chaque héros debout. Immunisé tant qu'il est fermé.

| Ce qui arrive | Évènements | Déjà fait par `touche` ? |
|---|---|---|
| nuage (étape 1) | `touche nuage`, `etat noeud` (2) : tant que le nœud est tendu, ils n'attaquent pas (`saute noeud`) | oui (`noeud`) |
| bruit, le nœud tendu (étape 2) | `touche bruit`, `special tirent`, `etat noeud on:false`, `ouvert` (1) | oui : `touche('bruit')` lance `tirent` |
| colle, le nœud tendu (autre chemin) | `touche colle`, `special roi-colle`, `etat noeud on:false`, `etat colle` (2), `ouvert` (2) | oui |
| après leur attaque | `etat etale` (`tours:'geste'`) : jusqu'au **premier geste** des héros du tour suivant | le module pose `etale` lui-même après `attaquer('grouillement')` |
| bruit en premier geste, la masse étalée (sans potion) | `touche bruit`, `special panique`, `etat etale on:false`, `ouvert` (1) | oui |
| un autre geste d'abord | (à la fin de ce geste) `etat etale on:false` | `etat('etale', false)` |
| bruit, ni nœud ni étalé — **piège** | `touche bruit` (piege), `special charge`, `attaque {nom:'charge', riposte:true, cibles:['alchimiste']}`, `degats` 30, `mot` | oui : `touche('bruit', {vers})` lance `charge` vers `vers` (le point de l'Alchimiste) ; l'évènement `attaque … riposte:true` ne relance rien, il annonce les `degats` |
| lumière — **piège** | `touche lumiere` (piege), `ferme` (s'il était ouvert), `etat boule` (2), `mot` : en boule, tout rebondit (`rebond`), mais ils attaquent | oui (`boule`) ; l'enlever au `etat boule on:false` |
| colle sans le nœud | `touche colle`, `mot` « Trop nombreux ! » | le module pose `colle` : l'enlever (`etat('colle', false)`) |

Le coup de louche lui-même (`touche louche`) rebondit sur lui s'il est fermé (`rebond louche`) : c'est le **bruit** qui agit.

### Le Gardien de rouille (`gardien`, élite)

280 PV, `poing` 40 sur le héros de devant (le Pisteur, puis l'Alchimiste, puis le Sage). Immunisé tant qu'il est fermé. Ouvert, il frappe quand même.

| Ce qui arrive | Évènements | Déjà fait par `touche` ? |
|---|---|---|
| acide, la plaque fermée (étape 1) | `touche acide`, `special plaque-tombe`, `etat plaque-ouverte` (fin) | oui |
| givre, la plaque fermée (autre chemin) | `touche givre`, `special plaque-eclate`, `etat sans-plaque` (fin) | oui |
| lumière, la plaque tombée, éclatée ou entrouverte (étape 2) | `touche lumiere`, `etat ebloui` (1), `ouvert` (1) | oui (`ebloui`) |
| lumière, la plaque fermée — **piège** | `touche lumiere` (piege), `etat enrage` (2), `mot` : ses coups sont doublés ce tour-ci et le suivant | oui (`enrage`) ; l'enlever au `etat enrage on:false` |
| son poing tombe sur un bouclier (sans potion) | après les `degats` : `touche bouclier`, `special entrouvert`, `etat plaque-entrouverte` (2) | oui |
| feu, fermé — **piège** | `touche feu` (piege), `etat rougeoie` (fin), `mot` : +10 par coup | oui |
| feu, acide, louche, ouvert | `touche`, `degats` 30 / 25 / 10 (le feu : `etat brule`) | |
| colle, givre (plaque déjà tombée) | `touche`, `mot` « Trop fort ! » | le module pose `colle` / `gele` : l'enlever |
| flèche lourde, fermé | `tir {fleche:'lourde', rebond:true}`, `rebond fleche-lourde` | `touche('rebond', {arme:'fleche'})` (ou la grosse bosse de `fleche-lourde`, sans dégât) |
| battu sans critique | `mort meurt` | `mourir()` (il s'effondre) |

### Bourbe (`bourbe`, boss)

1 000 PV. Il alterne `langue` 30 (il avale le héros visé) et `saut` 28 sur chaque héros, en commençant par la langue. Le ventre plein, ou gonflé, il saute. Immunisé sauf sur le dos. **`touche` ne pose aucun état pour lui : tout est à faire d'après les évènements.**

| Ce qui arrive | Évènements | À appeler |
|---|---|---|
| lumière, dans l'eau (étape 1) | `touche lumiere`, `etat berge` (2) | `etat('berge', true)` |
| feu, sur la berge (étape 2) | `touche feu`, `etat sec` (fin), `mot` | `etat('sec', true)` |
| nuage, sec (étape 3) | `touche nuage`, `etat dos` (2), `ouvert` (2) : sur le dos, il n'attaque pas (`saute dos`) | `etat('dos', true)`, `etat('ouvert', true)` |
| fin du tour suivant | `etat dos`, `etat berge`, `etat sec` avec `on:false`, et `ferme` (dans cet ordre ou un autre) | il se retourne et replonge |
| sans feu : 2 fins de tour hors de l'eau | `etat sec {seul:true}` (et `berge` prolongé d'un tour) | `etat('sec', true)` |
| la berge finit sans nuage | `etat berge on:false`, `etat sec on:false` | il replonge |
| `attaque langue` | `degats`, puis `avale {heros}` (ou `pare` si bouclier ; ni l'un ni l'autre si le héros tombe) | `attaquer('langue', {vers, onImpact, onAvale})`, `etat('avale', true)` |
| le héros avalé chatouille, Bourbe sec (sans nuage) | `chatouille`, `touche chatouille`, `special chatouille`, `etat dos` (2), `ouvert` (2), `recrache` | `special('chatouille')` (il rit, recrache, roule sur le dos) |
| le héros avalé chatouille, Bourbe mouillé | `chatouille`, `touche chatouille`, `special recrache`, `recrache` | `special('recrache', {onImpact})` |
| nuage, pas sec — **piège** | `touche nuage` (piege), `etat gonfle` (fin), `mot` : son prochain coup est un saut, doublé ; `etat gonfle on:false` après ce saut | `etat('gonfle', true)` |
| bruit — **piège** | `touche bruit` (piege), `special plonger`, `etat berge / sec on:false`, `etat sous` (1), `mot` ; au tour des monstres : `saute sous` ; à la fin du tour : `etat sous on:false`, `special remonter`, 2 × `arrive {par:'plongeon'}`, `attaque {nom:'saut', retour:true}` et ses `degats` | `special('plonger')`, puis `special('remonter')`, les têtards, `attaquer('saut')` |
| givre | `touche givre`, `etat gele` (3), `mot` : il compte comme sur la berge, et au bruit il se cogne (`mot`, pas de plongeon) | `etat('gele', true)` |
| feu, acide, louche, sur le dos | `degats` 30 / 25 / 10 (le feu : `etat brule`) | |
| battu | `mort`, `recrache` s'il avait quelqu'un, puis `mort {mode:'fuit', cause:'chef'}` pour chaque têtard | `mourir()` ou `exploser(scene)` |

Sous l'eau, on ne peut pas le viser (« Sous l'eau ! »). Sur le dos, il est à portée de dague malgré les têtards devant.

## 6. Hors combat (l'exploration)

Chaque action rend une liste d'évènements. Un refus : `[{t:'refus', mot}]`. Aucune de ces actions ne marche pendant un combat (« Pas en combat ! »).

| Action | Ce qu'elle fait | Évènements |
|---|---|---|
| `Regles.entrer(partie, lieu)` | on arrive dans un lieu (id de `carte.js`). **Les règles ne vérifient pas le chemin** : c'est `CARTE_DONJON` qui dit où mènent les couloirs. | `lieu`, puis `combat {salle}` (un combat à lancer), ou `scene {contenu}` ; `code-objet` (porte4, leo) ; `boucle` (égouts) ; `fin-donjon` (leo) |
| `Regles.contenu(partie[, lieu])` | ce qu'il y a à faire dans un lieu, maintenant : `{lieu, nom, combat, gagne, objets:[ids à prendre], coffre:{options, pris}, tas:{fouilles, reste}, crane:{ouvert}, dalles:{pas, sur, passe}, portes:{oeil, gueule, lune}, repos:{permis}, code:{id, pour}, boucle, fin}` | — |
| `Regles.bloque(partie, lieu)` | ce qui empêche de **traverser** un lieu : `'combat'`, `'dalles'` ou `null`. Le passage secret : `partie.faits.secret`. | — |
| `Regles.prendre(partie, objet[, heros[, laisser]])` | toucher un objet du lieu. `heros` : seulement pour l'amulette (qui la porte ?). Si le héros a déjà 2 objets : `plein` ; rappeler avec `laisser` = l'objet qu'il pose (il reste dans la salle). | `objet` ; ou `or` (la bourse) ; ou `code-objet` (fleur de givre, herbes, page déchirée) ; `plein` ; `laisse` |
| `Regles.choisir(partie, objet[, laisser])` | le coffre à choix du lieu (réserve : `fleches-argent` ou `fleches-lourdes` ; bibliothèque : `cristal-lune` ou `baton-chene`). L'autre reste là pour toujours. | `objet`, `coffre {pris, reste}` |
| `Regles.fouiller(partie)` | le tas d'os (`eboulis`) : 1re fois, un rat mord le Pisteur (−10) ; 2e fois, la page blanche ; ensuite rien. | `fouille {n, trouve}`, `degats`, `code-objet` (`page:blanche`) |
| `Regles.crane(partie)` | le joueur a touché l'endroit du mur que le Sage lui a décrit : le passage vers le feu de camp s'ouvre. | `passage {de, vers}` |
| `Regles.dalle(partie, 'fond' ou 'devant')` | un pas dans le couloir aux dalles (6 pas). La dalle claire : on avance. La dalle sombre : −15 à chacun, on recule d'une rangée. | `dalle {pas, cote, sure, element}`, `piege`, `degats` × 3, `recule` ; `traverse` au bout |
| `Regles.porte(partie, 'oeil', 'gueule' ou 'lune')` | la salle aux trois portes : où mène la porte. | `porte {signe, vers}` |
| `Regles.repos(partie)` | le feu de camp : +la moitié des PV max à chacun, une fois entre deux combats. | `repos`, `soin` × 3 |
| `Regles.code(partie, id)` | un code tapé sur le pavé : `sauve:1` à `sauve:4`, `recette:givre`, `recette:baumelum`. L'id vient de `DONJON_CODES.lire(symboles, 'pisteur')`. Une seule fois chacun. | `sauvegarde`, ou `recette` ; refus « Code inconnu », « Code usé » |
| `Regles.refaireSac(partie, [recettes])` | le sac : `Regles.placesSac(partie)` recettes au plus (3, ou 4 avec la sacoche), parmi `partie.recettes`. Permis quand `Regles.sacPermis(partie)` : au départ, au feu de camp, après une fuite. | `sac {sac, places, plein}` ; refus « Sac fermé », « Sac trop plein », « Recette inconnue » |
| `Regles.objets(partie)` | pour « 🎒 Objets » : `{heros:{pisteur:[…]…}, codes:[{objet, code, pour}], or, recettes, sac, places}` | — |
| `Regles.grandLivre(partie)` | pour « 📖 Grand Livre » : `[{monstre, nom, rang, lignes:[textes], sur}]`, un par monstre rencontré | — |
| `Regles.fuir(partie[, salle])` | recharge la dernière sauvegarde ; `livre` et `fuites` restent ; le sac se rouvre. | `recharge {lieu, salle, fuites}`, et `livre {cause:'fuites'}` à la 2e fuite au même endroit |

- **Les objets à code** (`code-objet`) : afficher `DONJON_CODES.emojis(code)` et le nom du destinataire (`pour`). Ils restent dans `Regles.objets(partie).codes`.
- **Le couloir aux dalles** : `D.DALLES` (`pas: 6`). Les dalles de `scenes.js` s'appellent `dalle-<6 + pas>-<0 | 1>` (0 = celle du fond, 1 = celle de devant) : l'évènement `dalle` donne cet id dans `element`. Rien à l'écran ne doit dire laquelle est sûre.
- **Un piège hors combat ne fait jamais tomber** : il reste toujours 1 PV.
- **La fausse crypte** : `contenu.objets` est vide tant que le combat n'est pas gagné ; ensuite `['amulette']`.
- **Les égouts** : un rat errant, une seule fois ; ensuite `scene` et `boucle {vers:'canaux'}`.

## 7. Les règles en bref

- Héros : Pisteur 120 PV, Alchimiste 100, Sage 90. Les monstres visent le Pisteur 6 fois sur 10, l'Alchimiste 2,5, le Sage 1,5.
- Point faible **fermé** : un monstre normal prend flèche 3, dague 4, louche 2, feu 5 (et il brûle : −4 par tour jusqu'à la fin), acide 5. Les élites et le boss : 0, « Ça rebondit ! ».
- Point faible **ouvert** : le Pisteur fait un critique (flèche / dague) : 60 / 75 sur un normal, 110 / 140 sur un élite, 300 / 380 sur le boss. Une flèche trempée sur une bête ouverte : critique aussi (la potion ne s'applique pas). Les autres : louche 10, acide 25, feu 30.
- Critique surprise : 1 chance sur 8, flèche simple (pas trempée), monstre normal fermé.
- Ce qui s'ouvre se referme à la fin du tour des monstres, sauf ce qui est cassé (armure du rat cuirassé : ouvert jusqu'à la fin), et ce qui dure deux tours (feu follet accroché, roi collé, Bourbe sur le dos).
- Soins : Herbes 20, Baume 40, Baume lumineux 15 à chacun, Cœur vaillant relève avec 40, feu de camp +50 % des PV max. Bouclier : la moitié des coups (arrondie au-dessus), un tour ; il arrête la toile et la langue.
- Objets : flèches d'argent (feu follet, chauve-souris : 10 même fermé, critique × 1,5) ; flèches lourdes (rat cuirassé : 12 même fermé ; rat cuirassé et Gardien : critique × 1,5) ; cristal de lune (la rune touche toute la salle) ; bâton de chêne (bouclier sur deux héros) ; sacoche (4e recette) ; amulette (une fois : celui qui tombe se relève avec 30).
- Les chiffres des monstres : `equilibre.md` (tableau du haut) et `CONCEPTION-DONJON.md` §5.

## 8. Décisions prises

Là où la conception était floue ou se contredisait, tranché au plus simple pour un enfant de 11 ans.

1. **La salle des rats est intacte** : mêmes règles, mêmes chiffres, même ordre des tirages au hasard que `essai/src/jeu.js` (prouvé par `test-regles.js` sur 3 000 parties). Seule différence visible : un critique affiche maintenant ses dégâts (60 à la flèche, 75 à la dague) au lieu des PV qui restaient au rat. Le résultat est le même : le rat explose.
2. **La dague** atteint la bête de devant **et celles que le bestiaire fait « tomber devant »** : la chauve-souris au sol, l'araignée sur le dos, et Bourbe sur le dos. Pas de notion de « en l'air » en plus. Pour le rat, rien ne change : seul celui de devant.
3. **La louche** : le coup sur la bête de devant (2, ou 10 si elle est ouverte, comme dans l'essai), puis **le bruit dans toute la salle**. Sur un élite fermé, le coup rebondit, mais le bruit agit.
4. **Un monstre ouvert attaque quand même** (comme le rat de l'essai). La chauve-souris tombée se renvole et l'araignée se remet d'aplomb juste avant d'attaquer. Seul Bourbe, sur le dos pour deux tours, n'attaque pas. Ce qui empêche d'attaquer : la colle et le givre (monstres normaux), le tournis, le nœud tendu, sous l'eau.
5. **La colle et le givre ne retiennent pas un élite ni le boss** (« Trop fort ! »), en dehors de leurs combos. Sinon, coller le Gardien à chaque tour suffirait.
6. **Les flèches spéciales ne percent pas l'immunité d'un élite.** La conception disait « flèches lourdes : 12 même fermé » sur le Gardien : une équipe qui se soigne l'aurait grignoté sans jamais ouvrir son cœur (vérifié à la simulation : 100 % de victoires sans le Sage). Fermé, il reste immunisé ; leur avantage contre lui, c'est le critique × 1,5 (165 au lieu de 110).
7. **Les élites et le boss ne prennent feu que s'ils sont ouverts** (sinon la brûlure passerait l'immunité).
8. **Le Baume lumineux soigne 15 à chacun** (la conception disait 30) : à 30, un seul geste rendait 90 PV, plus que ce qu'enlèvent la plupart des salles.
9. **Rat cuirassé** : le tournis dure jusqu'à la fin du tour suivant (il ne frappe pas) ; le deuxième coup de louche doit arriver pendant le tournis.
10. **Feu follet** : il ne grandit qu'une fois. Accroché à un bouclier, il est ouvert jusqu'à la fin du tour suivant, et continue de cracher ses flammes.
11. **Araignée** : toile puis morsure, en alternance. Le bouclier arrête la toile. Les œufs n'éclosent qu'une fois ; les petites se mettent devant.
12. **Têtard** : « un seul coup suffit » = tout coup qui fait des dégâts.
13. **Roi des rats** : les deux étapes du combo sont deux gestes de l'Alchimiste, donc le nœud reste tendu jusqu'à la fin du tour suivant (et pendant ce temps ils n'attaquent pas). « Le bruit juste après leur attaque » = le bruit en **premier geste** du tour suivant. Le roi collé reste ouvert jusqu'à la fin du tour suivant. La charge sur l'Alchimiste : 30 (la conception disait 24).
14. **Gardien** : la plaque entrouverte par le bouclier le reste jusqu'à la fin du tour suivant. Le feu : +10 par coup jusqu'à la fin.
15. **Bourbe** :
    - la lumière le sort pour 2 tours (ce tour-ci et le suivant) ; sans feu, il sèche tout seul après deux fins de tour hors de l'eau, et reste alors un tour de plus dehors ;
    - **chatouillé, il recrache toujours, mais ne roule sur le dos que s'il est sec** (sinon, être avalé suffirait à le battre, sans le Sage) ;
    - le bouclier arrête la langue ; un héros que la langue fait tomber n'est pas avalé ;
    - **quand il a plongé, il remonte à la fin du tour avec ses deux têtards et retombe sur tout le monde** (un saut). Sans cela, taper sur la marmite à chaque tour l'empêchait d'attaquer pour toujours ;
    - jamais plus de 4 têtards à la fois ; quand il est battu, ses têtards détalent ;
    - dans la file, les têtards sont devant lui.
16. **Après une victoire, un héros au sol se relève avec 1 PV.** `sol` est donc toujours `false` hors combat.
17. **Hors combat, un piège ne fait jamais tomber** (il reste 1 PV) : pas de défaite sur la carte.
18. **Le sac** se refait au départ, au feu de camp et après une fuite ; il se ferme en entrant dans une salle de combat. **Les codes de recette** se tapent n'importe où hors combat.
19. **Une sauvegarde garde aussi les codes déjà tapés.** Après un rechargement, une recette apprise après la sauvegarde est à retaper (son code remarche).
20. **Après 2 fuites (ou défaites) dans la même salle, le Grand Livre offre une ligne** sur la bête la plus forte de la salle (décision de Romain du 8 novembre, Bible §12.51, que le cahier des charges ne reprenait pas).
21. **L'amulette** se déclenche toute seule, sur celui qui la porte. Un objet laissé reste dans la salle.
22. **Le rat errant des égouts** n'est là qu'une fois.
23. **L'ordre des monstres** (de devant à derrière) : canaux : rat, chauve-souris, chauve-souris ; cave : araignée, feu follet, feu follet ; atelier : rat cuirassé, Gardien ; ossuaire : Roi des rats, feu follet, feu follet ; bassin : têtard, têtard, Bourbe.
24. **Le Grand Livre** : la première ligne de chaque bête est la phrase de sa fiche (validée), complétée pour les élites et le boss, dont le combo a plusieurs étapes. Les deux lignes du rat sont celles de l'essai.

## 9. Ce qui reste ouvert

- **Le soin en fin de combat** : devant un dernier monstre faible, des joueurs patients peuvent se remettre à neuf à coups de Baume avant de l'achever. C'est long, et ça coûte une place dans le sac, mais rien ne l'interdit. À voir à l'essai ; un remède sans minuteur existe (un monstre normal resté seul finit par détaler), mais il toucherait à la salle des rats : à décider avec Romain.
- **Une équipe très prudente sans le Sage** (soins et boucliers à chaque tour) tient debout devant le Gardien, le Roi des rats et Bourbe sans pouvoir leur faire quoi que ce soit. Elle ne gagne jamais, mais elle ne tombe pas non plus : il faut qu'elle pense à fuir.
- **La difficulté réelle** dépend des étourderies : voir `equilibre.md` §4 et §6. Les chiffres à bouger d'abord sont les dégâts des attaques dans `donnees.js`.
- **Les textes du Grand Livre** sont à faire relire par Romain (ton, niveau d'indice).
- Les règles ne connaissent pas la géométrie : si un lieu change d'id dans `carte.js`, le changer aussi dans `D.LIEUX` (un test compare les deux listes).

## 9. Changements du 10 novembre au soir (premier essai de Romain)

- Les carquois s'appellent « Flèches de lune » (`fleches-argent`) et « Flèches transperçantes » (`fleches-lourdes`). Les identifiants n'ont pas changé.
- Le Pisteur part avec `fleches-normales`, qui prennent une de ses deux places.
- La réserve n'est plus un coffre à choix : ses deux carquois sont des objets ordinaires (`Regles.prendre`). Mains pleines : `prendre` rend `[{t:'plein', heros, objets, objet}]` ; on rappelle `prendre(p, objet, heros, laisser)` avec l'objet à reposer, qui reste dans le lieu (`faits['pose:<id>'] = lieu`) et peut être repris.
- Avec les deux carquois, `_carquois(bete)` prend celui qui est fait pour la bête visée.
- Le lutrin de la bibliothèque reste un coffre à choix (`Regles.choisir`), en attendant la décision de Romain.
- À venir (en discussion) : l'étude du Sage sort du combat et va sur la tablette du Sage.

## 11. Ce qui a changé le 10 novembre au soir (à lire AVANT le reste : ces lignes remplacent ce qui est écrit plus haut)

Décisions de Romain du 10 novembre (17 h 47 et 17 h 56, Bible §12.51).

**L'étude des monstres : un code, plus de texte dans le donjon**

- `etudier` : seulement sur un monstre d'une sorte **pas encore étudiée** (`Regles.etudie(partie, type)`). Sinon le geste est éteint (« Déjà étudié »). Une seule étude par sorte suffit.
- L'évènement qui suit `etudie` : `{t:'livre', monstre, code:'etude:<monstre>', nom, cause:'etude' | 'fuites'}` (ou `{t:'livre', monstre, rien:true}`). Plus de `ligne`, `texte`, `sujet`, `total`, `sur`.
- `partie.livre[monstre]` : absent = jamais rencontré ; `0` = rencontré ; plus de `0` = étudié (`D.ETUDIE`, 4 : pour la simulation, « l'équipe sait tout de ce monstre »).
- `Regles.grandLivre(partie)` → `[{monstre, nom, rang, etudie, code}]` : c'est **le journal** du donjon (les codes à montrer au Sage).
- Après 2 fuites dans la même salle : le journal offre le code de la bête la plus forte **pas encore étudiée** (rien si tout l'est).
- Les codes `etude:<monstre>` sont dans `donjon-codes.js` (affichés par le Pisteur, tapés par le Sage). Depuis le 11 novembre, `D.LIVRE` contient **le journal d'un aventurier** (un à trois paragraphes par monstre, lus par la tablette du Sage ; plus de devinettes : `CARNET-EXPLORATEUR.md`). `test-regles.js` refuse une question, le nom d'un geste, d'une potion ou d'un héros. Le carnet lui-même est un objet à code de la salle `puits` (`carnet`, code `carnet:aventurier` pour le Sage).

**Les potions : plus de sac**

- Plus de `partie.sac`, plus de `Regles.refaireSac`, `sacPermis`, `placesSac`, plus de fait `sac:ouvert`, plus d'évènement `sac`, plus de sacoche (objet retiré, le puits d'aération n'a plus que les herbes).
- En combat, l'Alchimiste a **toutes les potions de `partie.recettes`** (`Regles.potions(partie)`, dans l'ordre de `D.ORDRE_RECETTES`). Les 7 de `D.RECETTES_DEPART` au départ ; `givre` et `baumelum` par code.
- Une potion qui manque : `refus` rend « Pas emporté ». Pour essayer : `?combat=<salle>&potions=feu,huile` ou `?nouveau=1&potions=…` (`&potions=toutes` : les 9 ; l'ancien `&sac=` veut dire la même chose).
- `Regles.importer` nettoie une partie gardée d'avant (sac, sacoche, flèches normales reposées).

**Les flèches : le Pisteur les porte toutes et choisit**

- Un carquois (`carquois:true` dans `D.OBJETS`) **ne prend pas de place** : `Regles.enMains([objets])` donne ce qui compte pour les 2 places. `plein` ne liste que ce qu'on a en mains.
- Gestes du Pisteur : `fleche` (la normale : ni bonus, ni défaut), et un geste `f:<objet>` par carquois spécial porté (`f:fleches-argent`, `f:fleches-lourdes`). Une flèche trempée (`p:<recette>`) est toujours une flèche normale.
- Les bonus n'ont pas changé (flèches de lune : feu follet et chauve-souris ; transperçantes : rat cuirassé et Gardien).
- **Les défauts** (`rebondit`, `traverse` dans `D.OBJETS`) : la flèche de lune rebondit sur le rat cuirassé et le Gardien ; la transperçante passe à travers le feu follet et la chauve-souris. Même point faible ouvert : aucun dégât, le geste est joué. Évènements : `tir {…, defaut:'rebondit', rebond:true}` puis `rebond` ; `tir {…, defaut:'traverse'}` puis `mot {texte:'À travers !'}`.
- `_carquois(bete)` n'existe plus (plus de choix automatique) ; `_carquoisPortes()` liste les carquois spéciaux.

**Pas encore fait** : les armes du Sage se choisissent toujours au lutrin (`Regles.choisir`, une seule des deux).

## 12. Ce qui a changé le 11 novembre : la rune de l'œil, les coups préparés (ces lignes remplacent ce qui est écrit plus haut)

Décisions de Romain du 11 novembre (9 h 08 à 9 h 26, Bible §12.51, « Les sorts du Sage en combat »).

**Plus d'étude dans le donjon**

- Le geste `etudier`, l'évènement `etudie`, l'évènement `livre`, `Regles.grandLivre`, `Regles.etudie`, `D.ETUDIE`, `D.LIVRE_VIDE` et le code offert après deux fuites n'existent plus. `partie.livre[monstre] = 0` veut seulement dire « rencontré » (l'écran de fin compte les sortes de monstres).
- `D.LIVRE` (le journal de l'aventurier) ne sert plus qu'à la tablette du Sage : le carnet ramassé à l'entrée (`carnet:aventurier`) ouvre toutes les pages. Les codes `etude:<monstre>` restent dans `donjon-codes.js` (la tablette du Sage les accepte encore).

**La rune de l'œil** (`oeil`, Sage, vise `salle`)

- `jouer('sage', {geste:'oeil'})` → `{t:'oeil', heros:'sage', jusque:<tour>, plans:[…]}`. Le Sage voit ce tour et le suivant : `combat.vu = tour + 1`.
- Refusée (« Déjà vu ! », `D.MOTS.vu`) tant que `vu > tour` ; au tour d'après (`vu === tour`), elle se relance.
- `etat().vu` : `0` (on ne sait rien), `1` (ce tour), `2` (ce tour et le suivant). Par bête : `vise` (seulement si `vu`) et `suite` (seulement si `vu === 2`), tous deux `{attaque, cibles, degats, fois, prepare, gros}` ; `degats` vaut 0 pendant un tour d'élan. **Sans l'œil, `vise` est `null` : l'écran ne montre plus qui est visé.**
- `combat.intentions()` : la même chose en liste (`{bete, dans:0|1, …}`).
- La proie du tour suivant est tirée au sort dès que le Sage regarde (`_prevoir`, gardée dans `m.suite`) et reprise telle quelle au tour d'après (`_planDuTour`).

**Les coups préparés** (attaque `prepare:true` dans `D.MONSTRES` : `marteau` du Gardien, `ruee` du Roi des rats, `ecrasement` de Bourbe)

- Rythmes : `['poing', 'marteau', 'poing']`, `['grouillement', 'ruee', 'grouillement']`, `['langue', 'ecrasement', 'saut']`.
- Au début du tour d'élan : `{t:'etat', bete, nom:'prepare', on:true, tours:'fin'}` (visible de tous). Au tour des monstres : `{t:'prepare', bete, attaque}` — il ne frappe pas. Au tour suivant : `{t:'attaque', nom, anim, gros:true, …}` sur la proie choisie à l'élan (`m.c.coup`), puis `{t:'etat', nom:'prepare', on:false}`.
- `anim` : le nom de l'attaque du module animé qui sert pour ce coup (`marteau` → `poing`, `ruee` → `grouillement`, `ecrasement` → `saut`) ; l'affichage joue `ev.anim || ev.nom`.
- `etat().betes[i].prepare` : `0`, `1` (il prend son élan ce tour-ci) ou `2` (le coup tombe à la fin de ce tour).
- Un monstre qui passe son tour (`passeSi` : sur le dos, sous l'eau…) garde son coup pour plus tard.

**Le bouclier** : `D.CHIFFRES.bouclier = 0.25` (il laisse passer un quart : 75 % arrêtés).

**L'huile sur un ami** : une recette avec `libere:'entoile'` se lance aussi sur un héros pris dans une toile (`gestes()` l'ajoute aux `cibles`, et le note dans `amis`) : `{t:'potion', heros, recette, heros2}` puis `{t:'etat', heros:heros2, nom:'entoile', on:false, par:'huile'}`. Le héros libéré peut jouer ce tour-ci.

**À l'écran** (`combat.js`) : `ligneVise`, `majBadges` (`.vise-pile`, `.vise-dg`, `.vise-bloc.puis`, `.vise-bloc.elan`, `.vise-bloc.gros`, `.etat.e-coup`), le rond rouge (`.bete.prepare .anneau`), le geste `oeil` (`.oeil-rune`). Plus de `boutonLivre`, de `grandLivre`, de `livre`.

**La simulation** (`equilibre.js`) : l'équipe ne connaît les plans que si l'œil regarde (`voit(c)`, `planDe(c, m)`) ; trois variantes de la maligne (`maligne` : l'œil un tour sur deux ; `oeilGros` : seulement pour un gros coup ; `sansOeil`). Trois cibles manquées, à régler avec Romain après ses essais (Bible §12.51).

## 13. Le durcissement du 11 novembre : la dague, l'arc, la colère (ces lignes remplacent ce qui est écrit plus haut)

Décisions de Romain du 11 novembre (13 h 32 et 13 h 53, Bible §12.51, « Le durcissement du donjon »).

**Le critique : la dague fait les gros dégâts, l'arc seulement sur ce qui est en hauteur**

- `D.CHIFFRES.critique = {normal:{dague:80, fleche:60, sol:20}, elite:{dague:140, fleche:110, sol:35}, boss:{dague:380, fleche:300, sol:95}}`.
- `hauteur:true` dans `D.MONSTRES` : la chauve-souris, le feu follet, l'araignée, le têtard, Bourbe (ils volent, pendent à un fil ou nagent). Une flèche y fait le critique `fleche` ; sur les autres (ils marchent par terre), le critique `sol`, quatre fois plus petit que la dague.
- `combat.critiqueDe(monstre, 'fleche' | 'dague', bonus)` rend le chiffre. `bonus` : le multiplicateur d'une flèche spéciale sur un monstre de sa liste `contre` — elle frappe alors comme en hauteur (transperçante sur le rat cuirassé : 90 ; sur le Gardien : 165).
- Le petit critique : `{t:'touche', …, critique:true, petit:true}` puis `{t:'degats', …, critique:true, petit:true}`. S'il tue, la bête finit comme d'habitude (`fuit` / `meurt`), pas en `explose`. L'écran le joue comme un coup ordinaire et écrit « Petit critique » (`D.MOTS.petitCritique`).
- La dague n'a pas changé de portée : la bête de devant, et celles qui sont tombées devant (`aPortee`). Dans l'atelier, le Gardien est derrière le rat cuirassé.
- Le critique surprise (1 chance sur 8, flèche simple, monstre normal fermé) suit la même table : 20 sur un rat.

**La colère** (`colere:{si:'mi-vie' | 'seul'}` dans `D.MONSTRES` : `gardien` et `bourbe` à mi-vie, `roirats` quand il est le dernier vivant)

- `_colere(ev, m)` est appelée après chaque blessure et chaque mort. Elle pose l'état `colere` (jusqu'à la fin) : `{t:'etat', bete, nom:'colere', on:true, tours:'fin'}` puis `{t:'colere', bete}`. Une seule fois par monstre.
- Les attaques lisent l'état : `doubleSi:['colere']` (le grouillement du Roi : 32 ; les poings du Gardien : 80), `plusSi:{colere:n}` (la ruée 90, le marteau 100, l'écrasement 100).
- **La phase 2 de Bourbe** : `reactions.colere` (une liste de règles comme pour un pouvoir) dit ce qu'il fait en se fâchant — il se referme, quitte le dos et la berge, plonge (`special:'plonger'`, état `sous` pour un tour) ; à la fin du tour suivant, `_bourbeApres` le fait remonter avec ses têtards et retomber sur tout le monde, comme pour le piège du bruit. Bassin gelé : « Il se cogne ! », pas de plongeon.
- À l'écran (`combat.js`) : la pastille `😡 en colère` (`CHIPS.colere`, `.etat.e-rage`), le rond rouge (`.bete.colere .anneau`), l'évènement `colere` (le cri, la secousse, le mot `D.MOTS.colere`). Pas d'état du module animé : rien de nouveau n'est dessiné.

**Les dégâts** : la morsure du rat passe de 8 à 13. `test-regles.js` : le modèle de l'essai (« Essai ») a suivi (morsure, petit critique à la flèche) ; les anciens tests des élites et du boss tournent sans coups préparés et sans colère (`sansGros`), la colère a sa section.

**La simulation** (`equilibre.js`) : `tirer()` passe par `critiqueDe` ; l'équipe `decouvre` (`reflechie({livre:true, apprend:1, tatonne:true})` : aucun combo en entrant, une ligne comprise par tour passé devant chaque sorte de monstre, 4 lignes = tout) et `decouvreLent` (une ligne tous les deux tours). Les trois équipes de Romain : `maligne`, `decouvre`, `hasard`.

## 14. Le 11 novembre en fin d'après-midi : les armes à choisir, la rune d'appel, l'œil qui dure, les herbes (ces lignes remplacent ce qui est écrit plus haut)

Demandes de Romain du 11 novembre (16 h 07 et 16 h 37, Bible §12.51, « Les armes à choisir… »).

**Une arme ne prend pas de place** (`arme:true` dans `D.OBJETS` : `cristal-lune`, `baton-chene`)

- Comme un carquois (`carquois:true`), une arme ne compte pas dans les deux places des mains : `Regles.enMains(objets)` les écarte, `prendre` ne rend jamais `plein` pour elle. Le lutrin de la bibliothèque n'est plus un coffre à choix : `D.LIEUX.bibliotheque.objets = ['page-dechiree', 'cristal-lune', 'baton-chene']`, le Sage prend les deux.
- `carte` dans l'objet : `base` (le sort que ce bâton change : `'rune'` ou `'bouclier'`), `nom` et `effet` (la carte du bâton dans la bande), `d`, `vise`, `max` (le sort lancé avec ce bâton).
- `combat.gestes('sage')` rend, en plus de `rune` et `bouclier`, un geste par bâton porté : **`a:cristal-lune`** (la rune de lumière sur toute la salle, `vise:'salle'`) et **`a:baton-chene`** (le bouclier sur deux amis, `max:2`). Leur `nom` est celui du sort (« Rune de lumière », « Bouclier de runes »). `jouer('sage', {geste:'a:cristal-lune'})` → `{t:'rune', heros:'sage', salle:true}` puis la lumière sur chaque monstre ; `jouer('sage', {geste:'a:baton-chene', cible:['pisteur', 'alchimiste']})` → `pose-bouclier` sur les deux. Un geste `a:<objet>` que le héros ne porte pas est refusé (`D.MOTS.absent`).
- **Les règles ne savent pas quel bâton est « en main »** : c'est l'écran qui le sait (`combat.js`, `E.baton`, gardé dans `partie.heros.sage.baton`) et qui ne propose que le sort du bâton en main. Les règles acceptent les deux gestes tant que le bâton est porté.
- `D.BATON = {id:'baton', nom:'Bâton normal', d:'rien de spécial'}` : le bâton de tous les jours (il n'est pas un objet).
- Les noms d'arme pour la bande : `D.GESTES.fleche.arme = 'Arc normal'`, `D.GESTES.dague.arme = 'Dague'`, `D.GESTES.louche.arme = 'Louche'`, `D.OBJETS['fleches-argent'].carte.nom = 'Arc de lune'`, `D.OBJETS['fleches-lourdes'].carte.nom = 'Arc transperçant'`. Les gestes ne changent pas (`fleche`, `f:fleches-argent`, `f:fleches-lourdes`, `dague`). Une flèche trempée (`p:<potion>`) part toujours de l'arc normal.

**La rune d'appel** (`appel` dans `D.HEROS.sage.gestes`, `D.GESTES.appel`)

- `combat.appelables()` : les monstres qu'on peut cibler, qui marchent par terre (`!def.hauteur`) et qui ne sont pas déjà devant. Sinon la carte est éteinte : `D.MOTS.devant` (« Déjà devant ! ») s'il y a un monstre par terre, `D.MOTS.pasLui` (« Pas celui-là ! ») sinon.
- `jouer('sage', {geste:'appel', cible:'b2'})` déplace le monstre en tête de la file (`this.b`) : `{t:'appel', heros:'sage', bete:'b2', ordre:['b2', 'b1']}`. La dague du Pisteur le touche ensuite (`aPortee`).

**La rune de l'œil dure tout le combat** : `_oeil` pose `this.vu = 9999` ; `{t:'oeil', heros:'sage', jusque:'fin', plans}`. À chaque nouveau tour, tant que l'œil est ouvert, le coup suivant de chaque monstre est prévu (`_nouveauTour`). La carte est ensuite refusée avec `D.MOTS.vu` (« Il voit tout »). `etat().vu` vaut toujours 0, 1 ou 2.

**Les herbes** (`D.GESTES.herbes`, `vise:'equipe'`, `D.CHIFFRES.herbes = 10`) : `{t:'herbes', heros:'alchimiste', equipe:true}` puis un `soin` de 10 pour chaque héros debout. Le baume reste à 40 sur un seul ami.

**Tests** : `test-regles.js` 413 (section « La rune d'appel, les herbes pour toute l'équipe » ; les places se testent avec deux objets inventés, `essai-a` et `essai-b`).
