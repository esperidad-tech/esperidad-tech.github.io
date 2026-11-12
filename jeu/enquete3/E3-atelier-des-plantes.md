# Enquête 3 — l'atelier des plantes, les cueillettes et les potions du donjon (conçu le 11 novembre 2026)

> Décidé par Romain le 11 novembre (14 h 52 : « un atelier où il a besoin de séparer certains ingrédients de ces plantes… écraser les plantes, couper les plantes ; des potions basées sur des plantes qui existent réellement » ; 15 h 13 : « d'accord pour absolument tout ce que tu m'as proposé, go pour tout »). Construit une première fois le 12 novembre à 1 h (Bible §13.19).
>
> **⚠️ L'ÉTABLI A ÉTÉ REFAIT LE 12 NOVEMBRE (Bible §13.22)**, à la demande de Romain (8 h 50 : « il est pas joli. C'est que des icônes, il n'y a pas de magie… Je veux que tu reprennes le modèle du laboratoire d'analyse »). **Les §2, §3 et §9 de ce document décrivent l'établi tel qu'il est construit aujourd'hui, avec les retouches de Romain du 12 novembre à 12 h 45 (Bible §13.23).** Les recettes ont changé : elles suivent les vrais gestes des herboristes. **⚠️ LES CUEILLETTES ONT ÉTÉ REFAITES LE 12 NOVEMBRE APRÈS-MIDI (Bible §13.26)**, à la demande de Romain (12 h 45, 12 h 52, 13 h 09) : les sept plantes sont **cachées sur la carte**, quatre au village (dès l'enquête 2), trois au-delà de la brume (enquête 3, après la cloche d'Anselme), chacune là où elle pousse pour de vrai ; l'herbier du Sage dit où et quand. **Les §4 et §5 décrivent ce qui est construit aujourd'hui ; les §6 et §7 (« Suivre la poussière », le gui par le Pisteur) sont retirés de l'enquête.** Les autres parties de l'enquête : `E3-dialogues-et-trame.md` (Barde), `E3-actions-des-roles.md` (Pisteur, Alchimiste, Sage).

## 1. Le principe

- **Les sept potions du donjon** (feu, fumigène, huile, colle, acide, baume, cœur vaillant ; ce sont les identifiants de `jeu/donjon/moteur/src/donnees.js`, `D.RECETTES_DEPART`) se font **à l'atelier des plantes**, à partir de **vraies plantes**, que l'Alchimiste cueille sur la carte (§4 : sept endroits cachés ; à toute heure, sauf le souci et le lin, pas avant l'après-midi).
- **Jamais d'échec** (comme le labo) : un geste faux donne un petit résultat drôle, et on recommence. Il faut du travail, pas de la chance.
- **Le chaudron ne change pas** : il garde les potions des enquêtes 1 et 2 (`D.POTIONS`, `D.RECETTES` de `donnees.js`). **Les codes des enquêtes 1 et 2 ne bougent pas.** Depuis le 12 novembre, les quatre plantes du village existent aussi dans l'enquête 2 (cachées, sans mission : §4) ; **les trois potions « du début » du chaudron (lumière, rapidité, invisibilité) sont retirées du grimoire** (Romain, 12 h 52 ; Bible §13.26).
- **Deux noms en commun, à régler à la construction** : le « Fumigène » et le « Cœur vaillant » existent déjà au chaudron des enquêtes 1 et 2 (`fumigene`, `coeur` : un nuage pour se cacher, un cœur d'accusation rendu au Sage). Proposé : ce sont les mêmes potions, avec une nouvelle recette à partir de l'enquête 3 ; dans l'enquête, le Cœur vaillant garde son effet (un cœur d'accusation) ; dans le donjon, il relève un ami tombé. Une potion, deux usages, comme l'acide.
- **L'acide est la « potion qui ronge la rouille »** : la même fiole ouvre la grille du puits (si le chemin du clocher rate) et ronge l'armure du rat cuirassé et du Gardien de rouille dans le donjon.
- **Toutes les potions doivent être faites quoi qu'il arrive** (Romain) : la mission de l'Alchimiste l'après-midi est « Prépare les sept potions de la nuit » ; le Sage ne donne le code de la nuit que quand chacun a fini. S'il en manque encore une à la nuit, l'Alchimiste peut la finir pendant le grand dialogue d'Anselme, avant de donner le code du sac.

## 2. L'écran : l'établi des plantes (refait le 12 novembre)

Fait comme la paillasse d'analyse (`jeu/src/labo/`) : **on est penché sur une vraie table, dessinée en entier**. Chaque outil est un objet posé dessus, qu'on touche et qui bouge. Pas de menu, pas de liste d'icônes. Le code : `jeu/src/etabli/` (une page à part, ouverte dans un cadre par-dessus l'atelier, comme le labo) ; les recettes et les phrases : `jeu/src/plantes-donnees.js` ; les dessins des plantes : `jeu/src/plantes-dessins.js`.

**Ce qu'il y a sur la table** (toujours à la même place) :

| L'objet | À quoi il sert | Ce qu'on voit quand il travaille |
| --- | --- | --- |
| **La tringle**, fixée à l'établi, sous l'étagère | les plantes cueillies y pendent d'abord, la tête en bas, chacune sous le flacon de sa potion | on touche une plante pendue : elle se couche sur le linge |
| **Le linge, au milieu** | les plantes qu'on a décrochées | on touche une plante : elle vient vers nous, en grand, avec ses trois parties à toucher |
| **La planche et le couteau** | hacher | le couteau fait « tchac, tchac, tchac », les morceaux sautent |
| **Le tamis** (sur son bol) | trier : le fin passe, le gros reste | le tamis se secoue, la poudre ou les graines tombent dessous |
| **Le mortier et son pilon** | écraser | le pilon tape et tourne |
| **Le pressoir à vis** | presser : tirer le jus ou l'huile | on tourne la manivelle, le plateau descend, les gouttes coulent dans le verre |
| **Le bocal et son tissu** (une étamine tenue par une ficelle) | filtrer | le liquide passe goutte à goutte, les miettes restent dans le tissu |
| **La marmite sur son trépied** | tremper, cuire, faire réduire | la cuillère tourne ; des bulles et de la vapeur selon le feu |
| **L'alambic de cuivre** (sur son petit four de briques, avec son seau d'eau froide et son petit vase) | distiller | la vapeur monte dans le col de cygne, les gouttes tombent dans le vase |
| **Le séchoir** (une claie, avec la pancarte « On laisse sécher ») | laisser sécher, à l'ombre | un sablier tourne : le temps passe |
| **Les fioles vides** (sur leur râtelier, avec un entonnoir) | la dernière étape de chaque potion | la fiole se remplit, on la bouche, elle monte sur l'étagère |
| **Le tas de bûches, son panneau, et la boîte d'allumettes** | le feu, sous la marmite ou sous l'alambic ; le panneau dit : une bûche = feu doux, deux bûches = feu fort | voir « Le feu » plus bas |
| **La cruche d'eau** (en grès, une goutte bleue et « EAU » dessus) et **la bouteille d'huile** (étiquette « Huile ») | ce qu'on verse dans la marmite ou l'alambic | la cruche est toujours pleine ; la bouteille est « vide » tant qu'on n'a pas fait la potion d'huile |
| **Le grimoire, sur son petit pupitre** | les recettes des plantes déjà trouvées | il s'ouvre en grand : une page par plante trouvée ; un rond jaune « ! » quand une page vient de s'écrire |
| **L'étagère des potions**, fixée à l'établi, tout en haut | sept flacons de verre, tous différents | vides et pâles au début ; pleins et brillants quand la potion est faite ; les sept faites, on la touche pour voir le code (§9) |

Au mur : une lanterne.

**Comment on joue** (toujours pareil) :
1. On touche une plante pendue à la tringle : elle se couche sur le linge. On la touche encore : elle vient en grand. On touche **la partie** qu'on veut (feuilles, fleurs, graines, racine…).
2. On touche **un outil** : la matière y va. On touche **l'outil encore une fois** : il travaille. Le filtre, le séchoir et les fioles travaillent tout seuls dès que la matière arrive.
3. **La cruche, l'huile, une bûche, une allumette** : on la touche (on la tient), puis on touche où on veut la mettre.
4. À chaque étape réussie, la matière change (les feuilles deviennent des feuilles hachées, puis un jus vert…) et **une phrase courte raconte ce qui se passe pour de vrai**, avec son 🔊.

**Le feu, c'est le joueur qui décide** (Romain) : pas de bûche = pas de feu ; **une bûche = feu doux** ; **deux bûches = feu fort** (un petit panneau le rappelle, près des bûches). Puis une allumette. Une allumette sans bûche : « Craac ! Une jolie flamme… et rien à brûler. » On peut retirer une bûche tant que le feu n'est pas allumé. Quand la cuisson est finie, le bois a brûlé : le feu s'éteint.

**On ne peut pas rater pour de bon** :
- **le mauvais outil, ou le mauvais feu** : une phrase dit ce qui se passerait pour de vrai (« Trop fort ! La glu attache au fond et brûle. À petit feu, toujours. »). La matière reste comme elle était : on essaie autre chose ;
- **la mauvaise partie de la plante** : une phrase vraie sur cette partie (« De jolies fleurs bleues… qui ne donnent pas une goutte. Elles ne durent qu'un matin ! »), et la plante revient entière sur le linge.
Chaque recette a ses phrases à elle pour ses erreurs les plus probables (de 5 à 13 par recette), et chaque outil a ses phrases pour tout le reste.

**Le grimoire** : une page par plante trouvée (il se remplit au fur et à mesure). À gauche, la plante dessinée et « Où ? » (où elle pousse **dans la vraie nature**). À droite : **« La partie »** (en mots, sans la montrer), **« La recette »** en phrases numérotées (« 1. Hache les feuilles. 2. Presse-les : garde le jus… »), jamais en images d'outils. Il faut lire, reconnaître la partie sur la plante, et trouver le bon outil et le bon feu.

**Une potion finie** : des étoiles, la fiole monte sur l'étagère, et une carte s'ouvre : la potion en grand, puis **« C'est vrai ! »** — ce qu'il y a de vrai dans cette recette (colonne de droite du §3), avec son 🔊 et un bouton jaune « Continuer ». Le « C'est vrai ! » reste ensuite dans le grimoire, à la page de la potion.

**Le décor suit l'atelier** : la table prend la forme et la couleur de l'établi de l'atelier (5 formes × 8 couleurs, les mêmes que la paillasse : bois, pierre sur buffet, marbre et or, meuble à tiroirs, tréteaux), et le mur celui de la pièce.

**La première fois** : une explication en quatre images (le grimoire, la plante de près, l'outil, le feu), chaque phrase avec son 🔊, et le bouton jaune « 🌿 À l'établi ! ».

**Si on quitte au milieu d'une potion**, elle attend : on la retrouve au même outil en revenant.

## 3. Les sept recettes (refaites le 12 novembre, d'après les vrais gestes)

| Potion | La vraie plante | La partie | Les étapes, dans l'ordre | « C'est vrai ! » |
| --- | --- | --- | --- | --- |
| **Feu** | le pied-de-loup (lycopode) | les épis jaunes | séchoir → tamis (la poudre jaune) → fiole | La poudre de lycopode s'enflamme d'un coup : les flammes du théâtre, le flash des premiers photographes. La plante est protégée aujourd'hui : on ne la cueille plus. |
| **Fumigène** | la vesse-de-loup | la grosse boule brune, bien mûre | séchoir → fiole (on la presse au-dessus du bocal, et on bouche vite) | Jeune, elle est blanche et ferme ; mûre, pleine d'une poussière brune (ses spores). Une goutte de pluie, et pouf ! On ne respire jamais ce nuage. |
| **Huile** | le lin | les petites boules dorées (les graines sont dedans) | tamis (les graines) → pressoir → filtre → fiole | On presse les graines sans les chauffer. Ce qui reste, le « tourteau », nourrit les vaches. Avec les tiges, on fait du fil. |
| **Colle** | le gui | les baies blanches | mortier → marmite avec de l'eau, **sans feu** (ça trempe) → marmite à **feu doux** → fiole | Avec ces baies, on faisait la « glu ». L'oiseau essuie son bec collant sur une branche… et un nouveau gui y pousse. Les baies sont du poison. |
| **Acide** | l'oseille | les feuilles | planche → pressoir (le jus vert) → filtre → marmite à **feu fort** (le jus réduit) → séchoir (des cristaux blancs) → un peu d'eau de la cruche dessus → fiole | L'oseille pique la langue : elle contient un acide. On en tirait le « sel d'oseille », qui enlève encore la rouille et les taches d'encre. Il ne se mange pas. |
| **Baume** | le souci (calendula) | les fleurs orange | séchoir → marmite avec **l'huile de lin**, à **feu doux** → filtre → fiole | L'huile de souci est un très vieux remède pour la peau. La fleur s'ouvre quand le soleil est haut et se referme le soir. |
| **Cœur vaillant** | la mélisse | les feuilles | planche → alambic avec de l'eau, à **feu doux** → fiole | Distiller : changer un liquide en vapeur, puis la vapeur en gouttes. Des moines de Paris préparaient l'eau de mélisse dès 1611 ; on en trouve encore en pharmacie. |

**Le baume a besoin de la potion d'huile** (la bouteille d'huile de lin est vide avant) : c'est le seul ordre imposé entre les potions.

**Quelques erreurs racontées** (exemples) : écraser les graines de lin au mortier (« une farine grasse »), presser les baies de gui sans les écraser, faire bouillir le gui à grand feu (la glu brûle), cuire les soucis dans l'eau (une tisane, pas une huile), faire bouillir la mélisse dans la marmite (le parfum s'envole avec la vapeur : il faut l'alambic), mettre de l'eau ET de l'huile (« l'huile flotte dessus : il faut choisir »).

**Le givre et le baume lumineux** restent des plantes du donjon (la fleur de givre, les herbes lumineuses), cuisinées sur la tablette de l'Alchimiste pendant le donjon, comme aujourd'hui (`jeu/donjon/`).

Pas de minuteur. La difficulté : lire la recette, choisir la bonne partie, trouver l'outil, doser le feu.

## 4. Où poussent les plantes (les cueillettes)

> **Refait le 12 novembre après-midi (Bible §13.26).** Romain, 12 h 52 : « sur la carte, on ne les voit pas […] dès qu'on va appuyer exactement sur la zone […] la petite bulle, avec marqué cueillir cette plante-là » ; « 4 plantes dans le plan de base du village […] 3 plantes dans la carte élargie, pas accessibles à l'enquête numéro 2 ». 13 h 09 : « liés à là où on peut les trouver dans la réalité […] je veux qu'on apprenne des choses sur la réalité ».

**Chaque plante pousse à UN endroit précis de la carte, qu'on ne voit pas.** L'Alchimiste touche le bon endroit : la plante surgit (une petite pastille, qui reste sur la carte pour toute la saison) et sa bulle s'ouvre, avec le bouton jaune « 🧺 Cueillir … ». À côté, rien ne se passe. Seul l'Alchimiste a ces endroits. Cueillie, la plante pend à la tringle de l'établi (§2).

| Plante | L'endroit précis, sur la carte | Son vrai milieu | Quand |
| --- | --- | --- | --- |
| **L'oseille** | au bord du ruisseau, juste au-dessus du lavoir, là où un petit bras d'eau le rejoint | les prés humides | à toute heure, même la nuit |
| **La mélisse** | derrière l'herboristerie, entre le carré de lavande et la rivière | les jardins (« l'herbe aux abeilles ») | dès le matin, la rosée partie |
| **Le souci** | dans le potager, au pied de la cloche de paille du milieu | les potagers, près des choux (il éloigne les pucerons) | pas avant l'après-midi (il dort la nuit, s'ouvre quand le soleil est haut) |
| **Le lin** | dans le grand champ de blé, au pied de l'épouvantail | les champs, en plein soleil | pas avant l'après-midi (le matin, la rosée mouille ses graines) |
| **Le pied-de-loup** ⭐ | au-delà de la brume, à l'ouest : sur la colline des Cinq Pierres, au pied de la pierre du nord | les landes des collines, en terre pauvre, entre les bruyères | à toute heure |
| **La vesse-de-loup** ⭐ | au-delà de la brume, au nord du Vieux Chêne : au beau milieu du Rond des Sorcières | les bois et les clairières, à même la terre, par petits groupes | à toute heure |
| **Le gui** ⭐ | au-delà de la brume, à l'ouest : dans le Vieux verger, tout en haut du pommier à l'échelle | jamais dans la terre : sur les branches, surtout des vieux pommiers | à toute heure (il reste vert en hiver) |

- **Les quatre premières** sont dans le village : on les trouve avec toute la brume, **dès l'enquête 2** (à l'aveugle : pas d'herbier, pas de mission ; trouvée, la plante se cueille vraiment, l'établi apparaît et on peut faire sa potion ; tout suit le héros à l'enquête 3).
- **Les trois ⭐** n'existent que dans l'enquête 3, et seulement quand la brume a reculé : **l'Alchimiste monte au clocher et demande à Anselme** (« 🔔 Demander à Anselme de chasser la brume ») ; il sonne **Bertille, sa plus petite cloche**, qui « ne repousse la brume qu'un petit peu » : au nord et à l'ouest, sur la carte de l'Alchimiste seulement (Bible §14.7).
- **Trop tôt** (le souci et le lin, le matin) : la plante se montre, sa bulle raconte pourquoi elle ne se cueille pas encore. **Jamais trop tard** : tout se cueille encore la nuit (les sept potions sont obligatoires).
- **Tout est dans `D.PLANTES`** (`jeu/src/donnees.js`) : la place (`x`, `y`), la première enquête (`des`), la zone de brume (`zone`), le moment (`pasAvant`) et toutes les phrases. Pour déplacer une plante : changer la place **et** la phrase « où » de l'herbier, garder un vrai milieu, relancer `tools/e3-cueillette.py`.

## 5. L'herbier des Fondateurs (le Sage)

> **Refait le 12 novembre après-midi (Bible §13.26).** Romain, 12 h 52 : « dans l'herbier, je veux pas qu'il parle de donjon […] uniquement de plantes et uniquement là où elles sont […] et à quel moment de la journée on peut les cueillir » ; « des informations très précises ».

- **Dès le matin de l'enquête 3**, une page du Grand Livre du Sage : « L'herbier des Fondateurs ». En tête : « Sept plantes séchées, très anciennes. Sous chacune, les Fondateurs ont noté où elle vit, et quand la cueillir. Lis-les à voix haute à l'Alchimiste ! »
- **Une planche par plante** (les quatre du village, puis les trois d'au-delà de la brume) : son dessin (le même qu'à l'établi), son nom, puis deux lignes, chacune avec son 🔊 :
  - **« Où ? »** : d'abord son vrai milieu, puis l'endroit précis de la carte (les deux premières colonnes du tableau du §4, mot pour mot dans `D.PLANTES` : `vit` et `ou`). Exemple : « Il ne pousse jamais dans la terre : il vit accroché aux branches, surtout celles des vieux pommiers. Au-delà de la brume, à l'ouest : dans le Vieux verger, tout en haut du pommier à l'échelle. »
  - **« Quand ? »** (`quand`). Exemple : « Pas avant l'après-midi : il dort la nuit, et ne s'ouvre que quand le soleil est haut. »
- **Pas un mot du donjon, pas un mot des potions.**
- **Plus de code « L'herbier »** : le Sage lit, l'Alchimiste cherche sur sa carte. La mission du Sage : « Lis l'herbier à l'Alchimiste, dans ton Grand Livre : où vit chaque plante, et quand la cueillir. »
- Les anciennes énigmes (le carrefour, les lièvres, le pommier du potager) sont supprimées.

## 6. La vesse-de-loup : « Suivre la poussière » (mini-jeu de l'Alchimiste) — RETIRÉ DE L'ENQUÊTE LE 12 NOVEMBRE

> **Retiré de l'enquête 3 le 12 novembre après-midi (Bible §13.26)** : la vesse-de-loup se trouve maintenant en touchant le milieu du Rond des Sorcières, au-delà de la brume. Le mini-jeu existe toujours dans le code (`mj-pisteur-alchi.js` : suspect `poussiere`, arrivée `vesses`) et dans la salle des mini-jeux ; il peut resservir. Ce qui suit est la conception d'origine.

- Romain voulait que l'Alchimiste, comme le Pisteur, suive des traces pour trouver une plante. **Le moteur de « Suivre la piste » sert tel quel**, en décor forêt (déjà fait pour l'enquête 2), avec une autre trace : **une fine poussière brune sur l'herbe**, que les vesses-de-loup crachent quand un lièvre les écrase. De fausses traces : des feuilles mortes, de la terre, des champignons qui ne sont pas des vesses.
- À l'arrivée, comme pour le moulin et la crypte (§12.57, §12.58), un dessin plus grand : **le rond des vesses-de-loup**, et le mot « Le rond des vesses-de-loup ! ».
- Paramètres proposés : `params:{decor:'foret', trace:'poussiere', arrivee:'vesses', arriveeTxt:'Le rond des vesses-de-loup !'}` ; niveau selon `MJ.COURBE` ; une explication en images et un bouton jaune avant ; un seul essai, et le filet : si c'est raté, « Tu as perdu la trace… mais un nuage brun s'élève près du gros rocher. » (la plante est cueillie quand même : jamais d'échec qui bloque une potion).

## 7. Le gui : le Pisteur grimpe — RETIRÉ DE L'ENQUÊTE LE 12 NOVEMBRE

> **Retiré de l'enquête 3 le 12 novembre après-midi (Bible §13.26)** : le gui est dans le Vieux verger, au-delà de la brume, sur le pommier qui a une échelle ; l'Alchimiste y grimpe elle-même. Les deux codes (« Le gui du pommier », « Le gui ») n'existent plus. Ce qui suit est la conception d'origine.

- Quand l'Alchimiste a l'herbier et va au potager de Basile : « Le gui est tout en haut du vieux pommier. Bien trop haut pour toi ! » → **code « Le gui du pommier » pour le Pisteur**.
- Le Pisteur, au potager, a une action de plus : « 🌳 Grimper au vieux pommier » (pas de mini-jeu ; une petite scène racontée : « Une branche, deux branches… Basile crie d'en bas : « Pas sur mes pommes ! » Tu attrapes une grosse touffe de gui. ») → **code « Le gui » pour l'Alchimiste**, qui peut alors le cueillir (il arrive dans son atelier).
- Avec Mimi (§8), le chat grimpe tout seul : pas besoin du Pisteur.

## 8. Mimi, le talent du niveau 2 de l'Alchimiste

> **Toujours pas construit. À repenser avec Romain** : depuis le 12 novembre après-midi, les plantes sont cachées sur la carte (§4) ; il n'y a plus de pommier trop haut ni de mini-jeu à éviter. Une idée possible : Mimi flaire une plante cachée et s'assoit tout près, une fois par moment.

- Le talent « Mimi, chat de labo » (§12.51) n'a plus de rôle depuis que le labo n'a plus besoin d'elle (§12.58). **Il devient « Mimi, chasseuse de plantes »** (l'autre choix du niveau 2 reste « Les expériences », §12.51).
- **Dans l'enquête** : une fois par moment, sur la carte de l'Alchimiste, on touche Mimi puis un lieu : elle y file et revient avec la plante qui y pousse (une petite animation : le chat qui part, la queue en l'air, puis revient la plante dans la gueule). Elle sait grimper au pommier (le gui sans le Pisteur) et trouver la vesse-de-loup sans le mini-jeu. **Il faut quand même savoir où envoyer Mimi** (les énigmes de l'herbier), et pour les plantes rares, avoir le code de l'herbier.
- **Dans le donjon** (à voir avec la conversation du donjon) : une fois par zone, Mimi flaire une chose cachée (la pierre de rune sans lueur, le crâne secret, la page blanche du tas d'os) : un petit chat qui s'assoit dessus.
- La règle des talents : un chemin plus amusant, jamais une chose qu'on ne pourrait pas trouver autrement.

## 9. Le code des sept potions (le sac est enlevé : Romain, 12 novembre, 12 h 45)

> **Ce qui est construit** : il n'y a plus de sac sur l'établi. **Le code pour le Pisteur n'est donné qu'une fois les sept potions faites** : il s'affiche tout seul après la septième, et on le revoit en touchant l'étagère des potions. Romain : « on ne peut pas faire le donjon si on n'a pas réuni les ingrédients ». Ce qui suit est la conception d'origine (un code même avec un sac incomplet), gardée pour mémoire.

- À la nuit, avant de descendre (pendant le grand dialogue d'Anselme), la tablette de l'Alchimiste montre **« Ton sac »** : les potions faites (normalement les sept), avec un **code** que le Pisteur tape sur son écran « Descendre » ; puis un écran montre le sac reçu, et l'Alchimiste vérifie.
- Proposé : 3 symboles suffisent pour dire lesquelles des sept potions sont faites (128 possibilités), plus un symbole de contrôle si on veut repérer une faute de frappe (§12.51). Si le « code par joueur » (la tenue, §12.51) est fait un jour, il peut porter le sac.
- Si une potion manque quand même, le donjon a toujours un chemin plus long (§12.51 ; `D.LIVRE`, le carnet de l'aventurier).

## 10. Ce qu'il fallait construire (liste d'origine, du 11 novembre)

> Tout est construit (Bible §13.19, §13.20), sauf Mimi chasseuse de plantes (point 8). **Les points 1, 5, 6 et 7 ont été remplacés le 12 novembre après-midi par les plantes cachées sur la carte (§4, §5 ; Bible §13.26).** L'établi (point 2), le grimoire (point 3) et les recettes (point 4) ont été refaits le 12 novembre (§13.22, et §2-§3 ci-dessus). Les sons de l'établi (point 10) sont dans l'Atelier des sons, en attente de l'écoute de Romain.

1. Les sept plantes (`D.INGR`), leurs lieux de cueillette dans `e3.js`, et le code « L'herbier » qui ouvre les trois rares.
2. L'établi : un meuble de l'atelier, ses bulles, son signe « 🌿 À préparer ! », et la page plein écran sur le modèle du labo (les outils, la plante en parties, les gestes, les phrases du conteur, les gestes faux).
3. Les sept pages du grimoire.
4. Les sept recettes (`fumigene` et `coeur` : voir §1).
5. La page « L'herbier des Fondateurs » du Grand Livre (trois énigmes, trois dessins).
6. « Suivre la poussière » (le moteur de la piste, une trace et une arrivée nouvelles), à montrer d'abord dans la salle des mini-jeux.
7. Le gui : la phrase de l'Alchimiste, l'action du Pisteur, les deux codes.
8. Mimi, chasseuse de plantes (talent du niveau 2 de l'Alchimiste) ; son rôle dans le donjon est à faire avec la conversation du donjon.
9. Le code du sac et le lien avec le donjon (la liste des potions faites remplace `partie.recettes` ; aujourd'hui, le donjon les donne toutes).
10. Les sons nouveaux (couteau, pilon, presse, alambic, pouf de la vesse-de-loup…) passent par l'Atelier des sons, où Romain les valide.

## Sources des faits sur les plantes (vérifiées le 11 novembre)

- Lycopode : [Of club mosses, horsetails and flash photography](https://hatiandskoll.com/2016/06/29/of-club-mosses-horsetails-and-flash-photography-or-lycophytes-light-up-the-sky)
- Gui et glu : [Gui (plante), techno-science.net](https://www.techno-science.net/fr/definitions/gui-plante)
- Acide oxalique, sel d'oseille et rouille : [Acide oxalique, techno-science.net](https://www.techno-science.net/glossaire-definition/Acide-oxalique.html) ; [Sel d'oseille, Greenweez](https://www.greenweez.com/produit/sel-doseille-1-kg-acide-oxalique-100-naturel/1TPLN013P)
- Eau de mélisse des Carmes : [L'eau de mélisse : une eau à travers l'histoire, Revue Conflits](https://www.revueconflits.com/eau-de-melisse-carmes-boyer/)
- Eau de mélisse (12 novembre) : [Eau de mélisse, techno-science.net](https://www.techno-science.net/fr/definitions/eau-de-melisse) — créée par les Carmes de la rue de Vaugirard, à Paris, en 1611 ; la recette a été vendue à la famille Boyer en 1830, qui la fabrique toujours.

**Vérifié en ligne le 12 novembre, pour refaire les recettes** (recherches faites pendant la construction ; les adresses n'ont pas été gardées) :
- le lycopode : on coupe les épis, on les fait sécher, on les secoue et on tamise ; la poudre flotte sur l'eau sans se mouiller ; elle servait aussi à enrober les pilules ; la plante est protégée ;
- la vesse-de-loup : mûre, elle crache ses spores quand on la presse ou quand une goutte de pluie tombe dessus ; les respirer rend malade ;
- le lin : l'huile sort des graines pressées à froid, dans une presse à vis, puis on la filtre ; il reste le tourteau ;
- le gui : la « viscine » des baies donne la glu ; les baies sont toxiques ; les oiseaux sèment le gui en s'essuyant le bec ;
- l'oseille : le « sel d'oseille » se tirait autrefois du jus de la plante, qu'on laissait reposer et cristalliser ; il enlève la rouille et l'encre ; il est nocif si on l'avale ;
- le souci : on fait le macérat avec des fleurs **séchées** (à l'ombre, pour garder la couleur), dans une huile, à chaleur douce, puis on filtre dans une étamine ;
- l'alambic : la cucurbite (la cuve), le chapiteau, le col de cygne, le serpentin dans l'eau froide, et le « vase florentin » qui reçoit les gouttes ;
- les plantes sèchent à l'ombre, sur des claies.

**Vérifié en ligne le 12 novembre après-midi, pour placer les plantes là où elles poussent pour de vrai** (Romain, 13 h 09 ; recherches faites pendant la construction ; les adresses n'ont pas été gardées) :
- l'oseille des prés pousse dans les prairies et aime les sols frais et humides ;
- la mélisse est appelée « herbe aux abeilles » (son nom vient du mot grec pour l'abeille) ; on la cueille le matin, quand la rosée s'est évaporée : c'est là qu'elle a le plus de parfum ;
- le souci : son vieux nom latin veut dire « qui suit le soleil » ; ses fleurs se ferment la nuit et se rouvrent avec le soleil ; les jardiniers le plantent au potager, près des choux, contre les pucerons ;
- le lin se sème dans les champs ; sa fleur bleue ne dure qu'une matinée ; on récolte ses graines bien sèches, et les capsules mûres tintent quand on les secoue ;
- le pied-de-loup (lycopode en massue) vit sur les landes et les pelouses des collines et des montagnes, en terre pauvre et acide, souvent avec la bruyère ;
- la vesse-de-loup pousse dans les bois et les prairies, sur le sol, souvent en petits groupes (le « Rond des Sorcières » de la carte est un clin d'œil aux ronds de champignons, pas un fait vérifié pour cette espèce) ;
- le gui n'a pas de racine dans la terre : il vit sur les branches des arbres (pommiers et peupliers surtout) et reste vert l'hiver.

**Une liberté prise ici** : dans la nature, on ne trouverait pas forcément ces sept plantes à la même saison, ni mûres le même jour.

**Deux libertés prises avec la réalité, pour que ce soit jouable** : tout va vite (sécher prend des jours, tremper le gui des semaines) ; et la vraie eau de mélisse des Carmes est faite avec de l'alcool et beaucoup d'autres plantes — ici, c'est une simple eau distillée de mélisse.
