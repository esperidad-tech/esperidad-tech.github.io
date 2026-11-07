# Brumeval v2 — architecture et contrats entre modules

Jeu d'enquête coopératif, 4 tablettes non connectées (Pisteur, Alchimiste, Barde, Sage).
Joueurs : Romain, Siham (téléphones), Naïm et Alicia (8 ans, tablettes Android bas de gamme possibles).
Tout est en HTML/CSS/JS vanilla, sans bibliothèque, assemblé en UN fichier par `build.py`.
Aucune ressource externe sauf les polices Google (repli prévu). Doit tourner hors connexion.

Dossier : `/tmp/claude-0/-home-claude/665077da-ba1e-55f5-95f5-bf914c1f5a85/scratchpad/jeu/`

## Qui écrit quoi

| Fichier | Auteur | Rôle |
|---|---|---|
| `src/base.css` | moteur (déjà écrit) | jetons de couleur, polices, boutons `.btn`, animations communes `b-*` |
| `src/mj-core.js`, `src/mj-core.css` | moteur (déjà écrit) | registre et écran commun des mini-jeux |
| `src/persos.js`, `src/persos.css` | fork PERSOS | dessin des héros et des villageois |
| `src/carte.js`, `src/carte.css` | fork CARTE | la carte de Brumeval vue du dessus |
| `src/mj-pisteur-alchi.js`, `src/mj-pisteur-alchi.css` | fork MJ-A | 9 mini-jeux Pisteur + Alchimiste |
| `src/mj-barde-sage.js`, `src/mj-barde-sage.css` | fork MJ-B | 7 mini-jeux Barde + Sage |
| `src/donnees.js`, `src/moteur.js`, `src/moteur.css`, `src/e1.js`… | moteur | tout le reste |

Chaque fork travaille UNIQUEMENT dans ses fichiers, plus un banc d'essai à lui dans `test/<module>/`.
Ne jamais toucher aux fichiers des autres. Ne rien publier, ne rien pousser sur GitHub.

## Règles communes

- Chaque module est un IIFE `(function(){ 'use strict'; ... })();` qui expose UN global (`Persos`, `Carte`, ou ajoute des jeux à `MJ`).
- JS moderne autorisé (ES2017, Chrome Android récent), mais pas de modules ES, pas de `import`.
- Préfixes CSS obligatoires pour éviter les collisions : `.pj-` (persos), `.ca-` (carte), `.mj-` + nom du jeu (mini-jeux).
- Utiliser les variables de `base.css` (`--nuit`, `--or`, `--cyan`, `--contour`, `--c-pisteur`…).
- Tablettes modestes : animations CSS `transform`/`opacity` de préférence ; filtres `blur` rares et petits ; pas plus d'une boucle `requestAnimationFrame` à la fois par écran.
- Tactile d'abord : cibles ≥ 48 px, `pointer` events, rien qui exige un survol. Doit marcher de 360 px de large (téléphone) à 1280 px (tablette paysage).
- Enfants de 8 ans qui lisent peu : icônes partout, phrases très courtes, consignes lisibles à voix haute.
- Le moteur fournit `window.Brume` (peut être absent dans les bancs d'essai : toujours tester son existence) :
  - `Brume.lire(texte)` lit à voix haute, `Brume.stop()` coupe ;
  - `Brume.son(type)` avec `type` ∈ `clic, ok, ko, gain, magie, pas, fleche, bulle, plouf, tic, victoire, echec, page, cloche, porte` ;
  - `MJ.util.son / lire / stop / vibrer` font déjà le test d'existence.
- Style graphique retenu (voir `../essai/essai-pisteur.html` et `../essai/essai.png`) : contours anime épais `#24182e`, dégradés doux façon jouet 3D (ombre propre d'un côté), lueurs magiques cyan `#8ff3ff` qui bougent. Romain veut de JOLIES coiffures et des visages harmonieux pour tous.

## API PERSOS (`src/persos.js`)

```js
Persos.CHOIX = {
  sexe:   [{id:'f', nom:'Fille'}, {id:'m', nom:'Garçon'}],
  age:    [{id:'enfant', nom:'Enfant'}, {id:'adulte', nom:'Adulte'}, {id:'age', nom:'Âgé'}],
  peau:   [{id, nom, c}],          // 6 teintes
  coiffure: {f:[{id, nom}], m:[{id, nom}]},   // au moins 6 jolies par sexe ; certaines adaptées à « âgé »
  cheveux: [{id, nom, c}],         // dont gris et blanc
  yeux:   [{id, nom, c}],
  tenue:  [{id, nom, c}],          // couleur principale ; la coupe dépend du rôle
  barbe:  [{id, nom}],             // aucune, courte, longue, moustache (garçon adulte/âgé)
  animal: [{id:'faucon'}, {id:'renard'}, {id:'loup'}]   // compagnon du talent « compagnon »
};
Persos.defaut(role, sexe) -> h   // héros complet par défaut, joli tel quel
Persos.heros(h, opts) -> '<svg …>'
//  h = {role:'pisteur'|'alchimiste'|'barde'|'sage', sexe, age, peau, coiffure, cheveux, yeux, tenue, barbe, animal,
//       niveau:1..10, talents:[ids], equip:[ids d'objets], potion:null|id}
//  opts = {vue:'pied'|'buste'|'tete', anime:true, fond:true, id:'unique'}
//  'pied' : viewBox 0 0 300 440 ; 'buste' et 'tete' : recadrages carrés.
//  Le niveau change la tenue (apprenti → héros, comme l'essai niveaux 1 et 10).
Persos.pnj(id, opts) -> '<svg …>'     // portrait buste (carré) d'un villageois, opts {anime, humeur:'normal'|'ment'|'peur'|'content'}
Persos.PNJ = {id:{nom, metier}}       // la liste ci-dessous
Persos.visible(itemId) -> bool         // l'objet est-il dessiné sur le héros ?
```
Talents visibles (ids, par rôle, 2 choix par palier aux niveaux 2/4/6/8/10) :
- pisteur : vision, pistage | reflexes, compagnon | camouflage, course | instinct, tir | scene, traque
- alchimiste : potionniste, savante | herboriste, mainsure | poudres, empreintes | transmutation, antidote | passe, ultime
- barde : conteur, ombre | oreille, ami | apaisante, ragots | imitation, memoire | ballade, reseau
- sage : archiviste, stratege | dechiffreur, inspiration | cartographe, tableau | protection, etoiles | verification, conseil

Exemples d'effets visibles : vision → yeux lumineux ; compagnon → l'animal à côté ; camouflage → reflets d'ombre ; tir → carquois lumineux ; potionniste → fioles en bandoulière ; savante → monocle ; oreille → boucle d'oreille note de musique ; ballade → notes qui flottent ; archiviste → livre flottant ; etoiles → constellations ; verification → runes qui tournent… Discret mais lisible, de plus en plus magique.

Objets (ids, 20 par rôle, palier 1 → 4). Dessiner sur le héros ceux qui se portent ou se tiennent :
- pisteur : bottes_souples, arc_court, lanterne_sourde, sifflet, gants_pisteur, grappin, cape_rodeur, bottes_vent, longue_vue_ch, carquois, collier, pieges, arc_elfique, lanterne_lune, amulette_instinct, bracelets_vent, masque_ombre, arc_argent, bottes_fondateurs, oeil_faucon
- alchimiste : fioles_renf, mortier, thermometre, ceinture_fioles, herbier, gants_cuir, alambic, loupe_doree, etal, sac_herbo, lunettes_alchi, grimoire_rec, chaudron_cuivre, balance_or, serre, oeil_cristal, fioles_ether, athanor, pierre_transmu, grand_grimoire
- barde : luth_voyage, carnet_ragots, bourse, bonbons, clochette, chapeau_plume, cornet, deguisement, cape_scene, pendule, lettre_maire, carillon, luth_enchante, masque_velours, miroir, plume_rossignol, corne, harpe, anneau, registre
- sage : loupe_lecture, plume_encre, baton_marche, sablier, cle_archives, lunettes_sage, longue_vue, livre_annote, cor, astrolabe, pierre_runes, cartes_fond, baton_cristal, chapeau_etoile, banniere, index, boule, grimoire_sage, couronne, oeil_temps
Un objet tenu en main remplace l'objet de départ (ex. arc_argent remplace arc_court). S'il y en a plusieurs, le plus cher gagne.

Villageois (`Persos.PNJ`) — portraits bustes, même style, chacun reconnaissable à 64 px :
| id | nom | description |
|---|---|---|
| grosbec | Monsieur Grosbec, le maire | rond, grand nez busqué (« gros bec »), favoris gris, écharpe de maire dorée, gants gris TOUJOURS, sourire un peu trop grand |
| gaspard | Gaspard, le boulanger | grand et costaud, toque blanche, moustache, farine sur les joues |
| melusine | Mélusine, la couturière | cheveux roux, mètre ruban autour du cou, écharpe rouge tricotée, épingles |
| basile | Basile, le jardinier | chapeau de paille, barbe, salopette, terre sur les joues |
| odette | Odette, la grand-mère aux sept chats | chignon blanc, châle, écharpe rouge, lunettes, un chat sur l'épaule |
| tim | Tim, le petit ramoneur (10 ans) | casquette, suie sur le visage, écharpe rouge ; son chien Pirate noir et blanc |
| victor | Victor, le facteur | casquette de facteur, sacoche, barbe brune |
| anselme | Anselme, le sonneur de cloches | très vieux, chauve avec couronne blanche, trousseau de clés |
| iris | Iris, l'herboriste | fleurs et lavande dans les cheveux, tablier vert |
| fortune | Fortuné, le colporteur | chapeau à plume, moustache frisée, boucle d'oreille, gilet voyant |
| silas | Silas, le garde champêtre | grand et maigre, képi vert, fine moustache, sifflet, regard en coin |
| farinel | Aimé Farinel, le meunier | gros, gentil, bonnet, couvert de farine |
| margot | Margot, la tavernière | joues rouges, tablier, chope, cheveux bruns relevés |
Humeurs : 'ment' (petit tic visible : goutte de sueur, yeux qui fuient), 'peur', 'content'.

## API CARTE (`src/carte.js`)

```js
Carte.LIEUX   = {id:{nom, ic, x, y, zone:'village'|'dehors'|'dessous'}}
Carte.MAISONS = {id:{adresse:'1, rue des Lanternes', rue, num, x, y, enseigne:null|'pain'|…}}
Carte.svg(opts) -> '<svg …>'
//  opts = {moment:'matin'|'apresmidi'|'soir'|'nuit', niveau:'surface'|'dessous',
//          actifs:[ids lieux cliquables], verrous:[ids lieux fermés (cadenas)], cachés:[ids non découverts],
//          notes:{maisonId:{texte, ic}}, marqueurs:[{lieu|maison|x,y, ic, label, classe, act, id}],
//          calque:'pisteur'|'alchimiste'|'barde'|'sage'|null, surbrillance:id|null}
```
- Chaque lieu cliquable porte `data-act="lieu" data-id="<id>"`, chaque maison `data-act="maison" data-id="<id>"`, chaque marqueur `data-act="<act>" data-id="<id>"` : le moteur gère les clics par délégation.
- viewBox portrait 1000 × 1400 ; le moteur l'affiche en largeur 100 %.
- Lieux (ids figés) : place, mairie, clocher, taverne, boulangerie, poste, atelier, herboristerie, ruelle, lavoir, potager, foret, chene, clairiere, puits, moulin, pont, lisiere ; dessous : salle_coeur, tunnel_chene, tunnel_moulin, crypte, tunnel_puits.
- Maisons (ids figés) : L1…L8 rue des Lanternes (impairs à l'ouest), F1…F4 rue du Four, B1…B3 ruelle des Brumes. Enseignes : L4 atelier de couture, L6 la poste, F1 boulangerie, F4 herboristerie. Mairie, clocher, taverne ne sont pas numérotés.
- Les moments changent la lumière (matin rosé, après-midi clair, soir orangé avec lanternes, nuit bleue avec fenêtres allumées et feux follets). Brume qui dérive, fumée des cheminées, eau qui ondule.

## API MINI-JEUX (`MJ`, cœur dans `src/mj-core.js`)

```js
MJ.enregistrer('traces', {
  nom:'Suivre des traces', role:'pisteur', ic:'👣',
  consigne:'Phrase courte lue à voix haute.',          // ou function(params)
  reglages(n, mods){ return {…nombres…, lignes:[{nom:'Temps pour réagir', val:'0,35 s'}]}; },
  demo(el, params){ …petite animation qui montre quoi faire…; return {arreter(){}}; },   // facultatif mais souhaité
  jouer(el, params, fin){ …; fin({reussi, score, erreurs, detail}); return {arreter(){}}; }
});
```
- `n` = niveau effectif 1…12 (déjà réduit par `mods.facile`). Niveau 1 : très facile pour un enfant de 8 ans. Niveau 8 sans aide : presque impossible ; bien équipé : faisable.
- Vocabulaire des `mods` (tous facultatifs) : `facile` (déjà appliqué), `erreurs` (+N erreurs permises), `temps` (+N secondes), `lent` (multiplicateur de vitesse < 1), `zone` (multiplicateur de la zone de réussite > 1), `aide` (N indices automatiques), `revele` (montre la cible exacte), `deuxiemeChance` (géré par le cœur), plus des mods propres à un jeu documentés dans son `reglages`.
- `MJ.util` fournit rand, melanger, borne, parNiveau(n, v1, v10, min, max), boucle(fn), html, son, lire, vibrer.
- Le cœur gère l'intro (consigne, démo, réglages, aides) et l'écran de résultat ; le jeu ne gère que la partie elle-même dans `el` (zone flexible ~ 360×480 minimum).

Liste des jeux :
| type | rôle | principe |
|---|---|---|
| traces | pisteur | des empreintes apparaissent une à une puis s'effacent ; toucher dans l'ordre ; leurres d'animaux |
| poursuite | pisteur | course sur 3 couloirs vue de derrière, obstacles qui arrivent, glisser/toucher pour changer de couloir ; la silhouette fuit devant |
| cachette | pisteur | un garde avec lanterne fait sa ronde ; passer de cachette en cachette quand le faisceau regarde ailleurs |
| tir | pisteur | cible mobile (corbeau, corde, objet accroché), viseur qui oscille, toucher pour tirer ; flèches limitées, vent |
| rythme | alchimiste | remuer le chaudron en rythme : toucher quand le curseur est dans la zone |
| bulles | alchimiste | mémoire : les bulles s'allument dans un ordre, le refaire |
| melange | alchimiste | obtenir la couleur cible en ajoutant des gouttes de couleurs |
| temperature | alchimiste | maintenir l'aiguille dans la zone verte en appuyant (feu) / relâchant pendant N secondes |
| loupe | alchimiste | deux images d'un objet : trouver N différences avant la fin du sablier |
| mensonge | barde | un villageois parle (bulles successives) ; toucher « Mensonge ! » pendant la phrase où un petit tic le trahit. params.repliques fournies par le moteur |
| ordre | barde | remettre les morceaux d'une conversation entendue dans l'ordre. params.morceaux (ordre correct) |
| ragots | barde | vrai ou faux ? params.ragots [{texte, vrai}] ; le joueur s'aide de ce qu'il sait |
| alphabet | sage | déchiffrer un message en alphabet secret (pigpen des fondateurs) avec la clé affichée ; params.message, params.alphabet |
| plans | sage | glisser un vieux plan transparent sur la carte jusqu'à l'aligner : un passage secret apparaît ; params.passage |
| grille | sage | petite grille de déduction (qui était où) ; params.personnes, params.lieux, params.indices, params.solution |
| runes | sage | tourner des tuiles de runes pour reconstituer le symbole demandé ; params.symbole |

Les jeux à contenu (mensonge, ordre, ragots, alphabet, plans, grille, runes) doivent avoir un contenu d'exemple par défaut si `params` n'en fournit pas.

## Bancs d'essai

Chaque fork fait `test/<module>/index.html` qui charge `../../src/base.css`, ses fichiers (et `mj-core.*` pour les mini-jeux), et montre tout ce qu'il a fait. Vérifier avec Playwright Python (Chromium préinstallé, `from playwright.sync_api import sync_playwright`, `p.chromium.launch()`), captures d'écran à 390×844 (téléphone) et 800×1280 (tablette), aucune erreur console. Regarder les captures, corriger, recommencer jusqu'à ce que ce soit vraiment joli.
