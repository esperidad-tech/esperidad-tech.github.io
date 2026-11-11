# Enquête 3 — l'atelier des plantes, les cueillettes et les potions du donjon (conçu le 11 novembre 2026)

> Décidé par Romain le 11 novembre (14 h 52 : « un atelier où il a besoin de séparer certains ingrédients de ces plantes… écraser les plantes, couper les plantes ; des potions basées sur des plantes qui existent réellement » ; 15 h 13 : « d'accord pour absolument tout ce que tu m'as proposé, go pour tout »). **Conception seulement : rien n'est construit.** La construction se fait dans une autre conversation (Bible §13.14). Les autres parties de l'enquête : `E3-dialogues-et-trame.md` (Barde), `E3-actions-des-roles.md` (Pisteur, Alchimiste, Sage).

## 1. Le principe

- **Les sept potions du donjon** (feu, fumigène, huile, colle, acide, baume, cœur vaillant ; ce sont les identifiants de `jeu/donjon/moteur/src/donnees.js`, `D.RECETTES_DEPART`) se font **à l'atelier des plantes**, à partir de **vraies plantes**, que l'Alchimiste cueille dans le village le matin et l'après-midi.
- **Jamais d'échec** (comme le labo) : un geste faux donne un petit résultat drôle, et on recommence. Il faut du travail, pas de la chance.
- **Le chaudron ne change pas** : il garde les potions des enquêtes 1 et 2 (`D.POTIONS`, `D.RECETTES` de `donnees.js`). **On ne touche pas aux enquêtes 1 et 2** (elles se verrouillent, §12.58) : toutes les nouvelles plantes se trouvent dans l'enquête 3.
- **Deux noms en commun, à régler à la construction** : le « Fumigène » et le « Cœur vaillant » existent déjà au chaudron des enquêtes 1 et 2 (`fumigene`, `coeur` : un nuage pour se cacher, un cœur d'accusation rendu au Sage). Proposé : ce sont les mêmes potions, avec une nouvelle recette à partir de l'enquête 3 ; dans l'enquête, le Cœur vaillant garde son effet (un cœur d'accusation) ; dans le donjon, il relève un ami tombé. Une potion, deux usages, comme l'acide.
- **L'acide est la « potion qui ronge la rouille »** : la même fiole ouvre la grille du puits (si le chemin du clocher rate) et ronge l'armure du rat cuirassé et du Gardien de rouille dans le donjon.
- **Toutes les potions doivent être faites quoi qu'il arrive** (Romain) : la mission de l'Alchimiste l'après-midi est « Prépare les sept potions de la nuit » ; le Sage ne donne le code de la nuit que quand chacun a fini. S'il en manque encore une à la nuit, l'Alchimiste peut la finir pendant le grand dialogue d'Anselme, avant de donner le code du sac.

## 2. L'écran : l'établi des plantes

Sur le modèle du labo d'analyses (`jeu/src/labo/` : une page plein écran, un zoom sur un meuble de l'atelier, les outils qui s'allument quand ils servent, aucun texte d'aide qui dit quoi faire, le conteur avec son 🔊).

- **Un nouveau meuble dans l'atelier : l'établi.** Toucher l'établi fait apparaître ses bulles, comme la paillasse, le chaudron et le lutrin (§12.54) : la jaune « 🌿 Préparer », « Forme », « 🎨 Couleur ». Un signe « 🌿 À préparer ! » sautille au-dessus quand une plante attend (comme « 🔬 À analyser ! », §12.58).
- **Sur l'établi, toujours à la même place** :
  - la **planche et le couteau** (couper une partie de la plante) ;
  - le **tamis** (séparer les graines de leurs coques) ;
  - le **mortier et son pilon** (écraser, réduire en poudre) ;
  - la **presse** à vis (presser des graines, un champignon séché) ;
  - un **linge** (filtrer, presser dans un tissu) ;
  - la **marmite sur son petit réchaud** (faire bouillir, faire chauffer dans l'huile) ;
  - une **coupelle** près de la fenêtre (laisser sécher : des cristaux) ;
  - un petit **alambic** de cuivre (distiller : les gouttes tombent dans une fiole) ;
  - les **fioles vides** sur une étagère ; une fiole pleine va dans l'armoire à potions de l'atelier.
- **La plante arrive sur l'établi** (comme l'échantillon sur le cuir du labo) : elle est dessinée entière, avec ses parties qu'on peut toucher (racine, tige, feuilles, fleurs, graines, baies, épis). On touche la bonne partie, puis le bon outil, dans le bon ordre.
- **Le grimoire** (le lutrin) reçoit, dès le début de l'enquête 3, sept pages « Les potions de la brume » : pour chaque potion, le dessin de la plante, **le nom de la partie à prendre (en mots, sans la montrer)** et **les gestes en petites images**, dans l'ordre. C'est un peu difficile, mais tout est sur la page : il faut reconnaître la partie sur le dessin et retrouver chaque outil.
- **Un geste faux** : le conteur raconte ce qui se passe (« Tu as écrasé les feuilles du gui : une bouillie verte qui ne colle pas du tout ! »), la plante revient comme avant. Rien n'est perdu.
- **Une potion finie** : la fiole se remplit de sa couleur (`coul` de `donnees.js` du donjon), un petit son, et elle file dans l'armoire.
- Toutes les phrases du conteur ont leur 🔊 ; elles sont racontées, jamais « Touche … ».

## 3. Les sept recettes

| Potion | La vraie plante | La partie | Les gestes, dans l'ordre | Un geste faux (exemple) | Ce qui est vrai |
| --- | --- | --- | --- | --- | --- |
| **Feu** | le lycopode, ou « pied-de-loup », une petite plante rampante des sous-bois | les épis jaunes, au bout des tiges | couper les épis → les secouer au-dessus de la coupelle (une poudre jaune tombe) → verser la poudre dans une fiole | écraser les épis au mortier : « Une pâte jaune… qui ne brûle pas du tout. » | Ses spores, très grasses, s'enflamment d'un coup, vite et fort, mais sans grande chaleur : on s'en servait pour les flammes du théâtre et le flash des premiers photographes |
| **Fumigène** | la vesse-de-loup, un champignon rond et blanc qui brunit en mûrissant | le champignon entier, bien mûr | le faire sécher près de la fenêtre → l'écraser dans le linge (pouf ! un nuage brun) → enfermer vite la poussière dans une fiole | le couper au couteau : « Pouf ! Un nuage brun… plein ta figure. Atchoum ! » | Mûre, elle crache un nuage de poussière brune (ses spores) dès qu'on la presse |
| **Huile** | le lin | les graines | séparer les graines au tamis → les presser à la presse → filtrer l'huile dans le linge | presser les tiges : « Rien ne coule. Les tiges du lin, c'est pour faire du fil ! » | L'huile de lin sort de ses graines pressées (et ses tiges donnent la fibre du lin) |
| **Colle** | le gui | les baies blanches | écraser les baies au mortier → les laisser macérer dans la marmite → les cuire : une glu fine et très collante | écraser les feuilles : « Une bouillie verte qui ne colle pas du tout. » | Les baies du gui, macérées, fermentées et cuites, donnaient la « glu des oiseleurs » ; le gui pousse souvent sur les pommiers |
| **Acide** | l'oseille | les feuilles | hacher les feuilles → les faire bouillir → filtrer dans le linge → laisser sécher dans la coupelle : des cristaux blancs → les dissoudre dans un peu d'eau | goûter une feuille : « C'est acide ! Mais ça ne ronge pas la rouille… il faut l'extraire. » | C'est le « sel d'oseille » (de l'acide oxalique) : en cristaux, on s'en sert encore pour enlever la rouille et les taches d'encre |
| **Baume** | le souci (calendula) | les fleurs orange | séparer les pétales → les faire chauffer doucement dans l'huile de lin (il faut déjà avoir l'huile) → filtrer dans le linge | faire bouillir les pétales dans l'eau : « Une tisane orange… qui ne tient pas sur une blessure. » | L'huile de souci est un vieux remède pour la peau et les petites plaies |
| **Cœur vaillant** | la mélisse, qui sent le citron | les feuilles | couper les feuilles → les mettre dans l'alambic avec de l'eau → chauffer : les gouttes de l'eau de mélisse tombent dans la fiole | faire bouillir les feuilles dans la marmite : « Une bonne tisane… mais il faut le cuivre de l'alambic ! » | L'eau de mélisse des moines Carmes (Paris, 1611) est distillée ; on la prenait contre les maux de tête et les douleurs |

**Le givre et le baume lumineux** restent des plantes du donjon (la fleur de givre, les herbes lumineuses), cuisinées sur la tablette de l'Alchimiste pendant le donjon, comme aujourd'hui (`jeu/donjon/`).

Proposé pour la construction : la difficulté vient de l'ordre et de la bonne partie, pas du doigté. Pas de minuteur. Environ une minute et demie par potion : une dizaine de minutes pour les sept.

## 4. Où poussent les plantes (les cueillettes)

La cueillette marche comme aujourd'hui (un lieu donne sa plante une fois par moment ; `Récolter` dans la bulle du lieu). Les sept plantes sont nouvelles (`D.INGR` : `lycopode`, `vesse`, `lin`, `gui`, `oseille`, `souci`, `melisse`).

| Plante | Où | Comment |
| --- | --- | --- |
| **L'oseille** | le lavoir (au bord de l'eau) | cueillette ordinaire, matin ou après-midi |
| **Le souci** | le potager de Basile | cueillette ordinaire |
| **La mélisse** | l'herboristerie (le jardin d'Iris, derrière la boutique) | cueillette ordinaire |
| **Le lin** | le moulin (un sac de graines de lin, au fond) | cueillette ordinaire |
| **Le lycopode** ⭐ | le carrefour de la forêt, sous les sapins | il faut l'herbier du Sage (§5) |
| **La vesse-de-loup** ⭐ | la clairière aux lièvres | il faut l'herbier du Sage ; puis un petit mini-jeu (§6) |
| **Le gui** ⭐ | le potager de Basile, tout en haut du vieux pommier | il faut l'herbier du Sage ; trop haut pour l'Alchimiste : le Pisteur grimpe (§7) |

**Le matin**, l'Alchimiste n'a que le gâteau : c'est le bon moment pour cueillir. L'atelier des plantes est ouvert dès le matin.

## 5. L'herbier des Fondateurs (le Sage)

- **Dès le matin**, une page du Grand Livre du Sage : « L'herbier des Fondateurs ». Elle donne **le code « L'herbier » pour l'Alchimiste** (sans lui, les trois plantes rares ne se cueillent pas : le lieu dit « Rien de spécial ici… pour l'instant ») et **trois énigmes**, que le Sage lit à voix haute (avec 🔊) :
  - « Le pied-de-loup rampe là où quatre chemins se croisent sous les arbres, et où le soleil n'entre jamais. » → le carrefour de la forêt ;
  - « La vesse-de-loup pousse en rond, là où dansent les lièvres. » → la clairière aux lièvres ;
  - « La glu ne touche jamais la terre : elle vit tout en haut du vieux pommier, au fond du potager. » → le potager de Basile.
- Chaque énigme a son petit dessin à la plume (la plante, sans le lieu).
- C'est ce qui donne au Sage du travail le matin, avec le tableau d'Odette et le Livre d'or.

## 6. La vesse-de-loup : « Suivre la poussière » (mini-jeu de l'Alchimiste)

- Romain voulait que l'Alchimiste, comme le Pisteur, suive des traces pour trouver une plante. **Le moteur de « Suivre la piste » sert tel quel**, en décor forêt (déjà fait pour l'enquête 2), avec une autre trace : **une fine poussière brune sur l'herbe**, que les vesses-de-loup crachent quand un lièvre les écrase. De fausses traces : des feuilles mortes, de la terre, des champignons qui ne sont pas des vesses.
- À l'arrivée, comme pour le moulin et la crypte (§12.57, §12.58), un dessin plus grand : **le rond des vesses-de-loup**, et le mot « Le rond des vesses-de-loup ! ».
- Paramètres proposés : `params:{decor:'foret', trace:'poussiere', arrivee:'vesses', arriveeTxt:'Le rond des vesses-de-loup !'}` ; niveau selon `MJ.COURBE` ; une explication en images et un bouton jaune avant ; un seul essai, et le filet : si c'est raté, « Tu as perdu la trace… mais un nuage brun s'élève près du gros rocher. » (la plante est cueillie quand même : jamais d'échec qui bloque une potion).

## 7. Le gui : le Pisteur grimpe

- Quand l'Alchimiste a l'herbier et va au potager de Basile : « Le gui est tout en haut du vieux pommier. Bien trop haut pour toi ! » → **code « Le gui du pommier » pour le Pisteur**.
- Le Pisteur, au potager, a une action de plus : « 🌳 Grimper au vieux pommier » (pas de mini-jeu ; une petite scène racontée : « Une branche, deux branches… Basile crie d'en bas : « Pas sur mes pommes ! » Tu attrapes une grosse touffe de gui. ») → **code « Le gui » pour l'Alchimiste**, qui peut alors le cueillir (il arrive dans son atelier).
- Avec Mimi (§8), le chat grimpe tout seul : pas besoin du Pisteur.

## 8. Mimi, le talent du niveau 2 de l'Alchimiste

- Le talent « Mimi, chat de labo » (§12.51) n'a plus de rôle depuis que le labo n'a plus besoin d'elle (§12.58). **Il devient « Mimi, chasseuse de plantes »** (l'autre choix du niveau 2 reste « Les expériences », §12.51).
- **Dans l'enquête** : une fois par moment, sur la carte de l'Alchimiste, on touche Mimi puis un lieu : elle y file et revient avec la plante qui y pousse (une petite animation : le chat qui part, la queue en l'air, puis revient la plante dans la gueule). Elle sait grimper au pommier (le gui sans le Pisteur) et trouver la vesse-de-loup sans le mini-jeu. **Il faut quand même savoir où envoyer Mimi** (les énigmes de l'herbier), et pour les plantes rares, avoir le code de l'herbier.
- **Dans le donjon** (à voir avec la conversation du donjon) : une fois par zone, Mimi flaire une chose cachée (la pierre de rune sans lueur, le crâne secret, la page blanche du tas d'os) : un petit chat qui s'assoit dessus.
- La règle des talents : un chemin plus amusant, jamais une chose qu'on ne pourrait pas trouver autrement.

## 9. Le code du sac (gardé)

- À la nuit, avant de descendre (pendant le grand dialogue d'Anselme), la tablette de l'Alchimiste montre **« Ton sac »** : les potions faites (normalement les sept), avec un **code** que le Pisteur tape sur son écran « Descendre » ; puis un écran montre le sac reçu, et l'Alchimiste vérifie.
- Proposé : 3 symboles suffisent pour dire lesquelles des sept potions sont faites (128 possibilités), plus un symbole de contrôle si on veut repérer une faute de frappe (§12.51). Si le « code par joueur » (la tenue, §12.51) est fait un jour, il peut porter le sac.
- Si une potion manque quand même, le donjon a toujours un chemin plus long (§12.51 ; `D.LIVRE`, le carnet de l'aventurier).

## 10. Ce qu'il faut construire (pour la conversation qui construit)

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
- La vesse-de-loup, le lin et le souci : connaissances courantes, non vérifiées en ligne ce jour-là.
