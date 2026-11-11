# Le journal de l'aventurier (les pages des monstres sur la tablette du Sage)

**État : validé par Romain le 11 novembre (8 h 02 : « Oui pour les 3 » ; 8 h 03 : « go pour créer la page du Sage, et fais en sorte qu'il y ait un livre à l'entrée du puits ou l'entrée de la crypte »). Construit et en ligne le 11 novembre (8 h 34, commit du site 369ee6d, version « 11/11 à 8 h 10 »).**

- Les pages en ligne sont celles de `D.LIVRE` (`moteur/src/donnees.js`) : la version 4 ci-dessous, avec deux retouches acceptées par Romain (« oui pour les 3 ») : au **Roi des rats**, la phrase « Cette fois, mon cri les a fait sursauter, et j'ai vu le nœud de leurs queues » ; **Bourbe** raccourci dans le même esprit que les autres. **Romain n'a pas encore lu ces deux textes dans leur forme finale.**
- Les neuf croquis sont dans `pages/portraits/<id>.webp` (les originaux en PNG : `pages/croquis/croquis-<id>.png`). Style validé (« oui »).
- **Le carnet est un objet** : il attend à l'entrée du donjon (`carnet`, dans la salle `puits`, par terre entre le Pisteur et la corde). Le Pisteur le ramasse : code `carnet:aventurier` (🎩 🌳 🐟) pour le Sage. Sur la tablette du Sage, le carnet entre dans le Grand Livre (« 📓 Le vieux carnet »).
- **Romain, 11 novembre, 8 h 45 (après avoir vu la première version en ligne)** : « Je préférerais que dans le livre il n'y ait pas de page collée ou quoi que ce soit. Qu'on dise juste que c'est un aventurier, tu ne précises pas qu'il n'a pas de pouvoirs. Et qu'il y ait **toutes les pages débloquées dès le début**. » **Fait (9 h 05)** : dès que le Sage a le carnet, il feuillette ses neuf pages ; le texte dit seulement « un aventurier, qui a tout noté ». Un code d'étude ouvre le carnet tout droit à la page du monstre (et marche même sans le carnet).
- **Question posée à Romain, pas encore tranchée** : puisque tout le carnet est ouvert dès le début, le geste « Étudier » du Sage en combat ne sert plus qu'à aller droit à la bonne page. Le garder, ou le retirer ?
- **8 h 45 et 8 h 46, l'entrée** : « le donjon en partant de la crypte ou en partant du puits, c'est le même. Tu changes juste la pièce de l'entrée. » Donc rien ne doit dépendre de l'entrée : **la pierre de rune du Sage n'est plus dans la première salle, mais dans la deuxième** (la galerie effondrée, parmi les éboulis), et la tablette du Sage ne dit plus « au fond du puits ».

## Ce que Romain a dit (10 novembre, 20 h 55, 21 h 05 et 21 h 08)

- **Pas d'énigmes à questions** (« Qui suis-je ? ») : « ça n'a pas de sens, qui aurait écrit des énigmes ? ». Les énigmes cachées, c'est pour **la carte du Sage** (révélées par certaines pierres : quelqu'un voulait garder des endroits secrets).
- Les monstres **dessinés à la main, à l'ancienne, comme dans un carnet**.
- Le texte : **le journal d'un aventurier** qui a traversé ce donjon et s'est fait attaquer. Il raconte son expérience, « avec ses déboires, ses réussites ». Il n'a pas tout testé : parfois il propose (« si seulement j'avais eu telle chose, peut-être que… »). Il n'est pas obligé de donner toutes les solutions. **Il n'a pas de pouvoirs ni les armes des héros : seulement ses propres outils.**
- **Être logique et concret.** Une lanterne, c'est juste de la lumière : les rats n'osent pas approcher, ils ne se dressent pas « le ventre à l'air » (ça, c'est l'éclair du sort du Sage dans leurs yeux). Un seul objet du début à la fin : pas « ma lanterne » puis « ma lampe à huile ». « J'ai fait tomber ma gamelle, ils sont devenus enragés » : ça, il aime (« c'est du concret »).
- Ce ne doit pas être trop évident : il faut laisser un peu de recherche.

## Les outils de l'aventurier (toujours les mêmes)

Une lampe à huile et sa réserve d'huile, une gamelle, un feu de camp, un bâton, ce qu'il trouve sur place (un couvercle, une vieille porte), un compagnon. Il ne nomme jamais les potions, la rune, ni les flèches de lune et transperçantes : aux joueurs de faire le lien.

## Ce que Romain a dit des pages (10 novembre, 21 h 28)

- **Raconter, ne pas décrire.** « Tu décris trop, toutes les étapes. Il faut que ce soit moins évident. Je veux un récit. » Pas de « un bon coup suffit », pas de « au deuxième coup, le casque est tombé », pas de « le fer a rougi, il cognait plus fort ».
- **Du sens par rapport à ce qu'il a vécu.** « Son fil n'aime pas le gras » : ça n'a pas de sens, on ne met pas de l'huile sur un fil. Mieux : l'araignée l'a entoilé, et c'est l'huile de sa lampe qui l'a sorti de là.
- Rat : « super », sauf la fin (« ils ont patiné. Ça m'a fait gagner du temps »).
- Chauves-souris : il les a ficelées, « les ailes collées » (le mot « collé » doit y être).
- Araignée : « elle aussi, elle a l'air de détester ma lumière » ; il a voulu brûler les œufs, ils ont éclos, et cette erreur lui a coûté quelque chose.
- Feu follet : plus effrayant. Ils ont avalé la lumière de la lampe, « comme aspirée », jusqu'à ne laisser que de la fumée ; et c'est là qu'il les a vus, entiers et gigantesques. La phrase du bouclier : pas comprise, retirée.
- Rat cuirassé : la cuirasse à moitié mangée par la rouille, il n'a même plus peur de la lumière ; il s'est défendu à coups de gamelle et s'en est sorti, sans le détail.
- Roi des rats : une description et son avis (« c'est ignoble »), ils sont intelligents et se protègent entre eux ; il n'a pas pu s'empêcher de crier, ça les a rendus furieux.
- Gardien : raconter au lieu de décrire ; la fin est « pas mal ». Bourbe : « pas mal ».

## Les pages proposées (version 4, 21 h 35 — en attente de Romain)

**Rat d'égout** — « Des rats, gros comme des chats. Ils vivent dans le noir : tant que ma lampe à huile brûlait, ils restaient figés, sans oser approcher. J'ai voulu en profiter pour filer… et j'ai fait tomber ma gamelle. Quel vacarme ! Ils sont devenus enragés. C'est ma réserve d'huile qui m'a sauvé : elle a coulé sur les dalles, et ils ont patiné. Ça m'a fait gagner du temps. »

**Chauve-souris de la brume** — « Elles me sont tombées dessus dans les canaux. J'ai levé ma lampe pour les chasser : mauvaise idée, la lumière les a rendues folles. De peur, j'ai hurlé… et elles sont tombées comme des pommes, complètement perdues. J'en ai profité pour les ficeler, les ailes collées contre le corps. Elles ne pouvaient plus bouger. C'est comme ça que je m'en suis débarrassé. »

**Araignée des caves** — « Une araignée grosse comme un tonneau, pendue à son fil. Elle aussi, elle a l'air de détester ma lumière. J'ai voulu mettre le feu à ses œufs. Au lieu de brûler, ils ont tous éclos ! Cette erreur m'a coûté mon sac de vivres. Dans la fumée, la mère est remontée se cacher, et elle m'a entoilé par surprise. Je ne m'en suis sorti que grâce à l'huile de ma lampe : sur du gras, sa toile ne colle plus. »

**Feu follet** — « Ceux-là, je les ai à peine aperçus. Le temps de lever ma lampe, ils avaient avalé sa lumière, comme aspirée, jusqu'à n'en laisser que de la fumée. Et c'est là que je les ai vus : tout entiers, et gigantesques. J'ai couru. Je n'ai jamais couru aussi vite. »

**Rat cuirassé** — « Celui-là porte une cuirasse à moitié mangée par la rouille. Il n'a même plus peur de la lumière. J'ai essayé de le brûler, mais sa carapace le protège. Je me suis défendu comme j'ai pu, à grands coups de gamelle, et j'ai fini par m'en sortir. Toute cette rouille… Si seulement j'avais eu de quoi finir le travail. »

**Têtard du puits** — « Au bord du grand bassin, des têtards gros comme des chiens m'ont sauté dessus. Je les ai chassés à coups de pied, l'un après l'autre. Mais chaque fois que le gros crapaud plongeait, il en ramenait deux de plus. »

**Le Roi des rats** — « Dix rats noués par la queue, qui bougent comme un seul. C'est ignoble. Et malin, avec ça : dès que j'ai levé ma lampe, ils se sont roulés en boule pour se protéger les uns les autres. Je n'ai pas pu m'empêcher de crier. Ça les a rendus furieux : ils m'ont chargé. Je ne leur ai échappé que le soir, quand mon feu s'est mis à fumer. Dans la fumée, ils ne savaient plus où aller : chacun tirait de son côté. »

**Le Gardien de rouille** — « Une machine des Fondateurs, haute comme deux hommes, toute rouillée. Elle m'a barré la route. J'ai levé ma lampe pour voir à qui j'avais affaire : elle est devenue folle. J'ai couru me cacher derrière une vieille porte. Elle a cogné dessus, et sa plaque s'est entrouverte, le temps d'un souffle. Derrière, quelque chose brillait. C'est là qu'il faut mettre la lumière. Si seulement j'avais eu de quoi ronger cette plaque pour de bon… »

**Bourbe, le crapaud du puits — RÉÉCRIT le 11 novembre au soir** (Romain, 19 h 21 : seul le givre le sort de l'eau, « du coup, il faut modifier aussi le livre de l'aventurier ») ; **Romain n'a pas encore lu ce texte.** En ligne (`D.LIVRE.bourbe`) : « Un crapaud grand comme une maison. Dans l'eau, on ne voit que sa tête, et rien ne l'atteint. Ma lampe, il s'en moque. Une nuit de grand froid, le bassin a gelé d'un coup. Il a bondi pour ne pas rester pris, et il est retombé sur la glace, tout entier. » / « Sur la glace, mes coups glissaient sur sa bave. Mais il ne pouvait plus plonger. Alors j'ai attendu, sans bouger. Au sec, sa bave a fini par sécher. Avec un bon feu, ça irait plus vite. Et pas de bruit, surtout : dans l'eau, le bruit le fait plonger, et il revient avec ses petits. » / le troisième paragraphe n'a pas changé (le compagnon avalé, la fumée une fois sec).

*L'ancienne page (jusqu'au 11 novembre, 19 h)* — « Un crapaud grand comme une maison. Dans l'eau, rien ne l'atteint. Ma lampe l'a fait sortir sur la berge. Là, mes coups glissaient sur sa bave. J'ai attendu : au sec, elle finit par sécher. Avec un bon feu, ça irait plus vite. J'ai fait du bruit : il a plongé, et il est revenu avec ses petits. J'ai enfumé le bassin trop tôt : il a gonflé, et il sautait deux fois plus fort. Mais une fois bien sec, la fumée lui a tourné la tête : il est tombé à la renverse. Mon compagnon, lui, s'est fait avaler. Il a gigoté là-dedans : le crapaud a éclaté de rire et l'a recraché. »

**Questions posées à Romain (21 h 35)** : (1) Roi des rats : la page ne dit pas que le bruit marche une fois qu'ils sont dans la fumée ; on le laisse à trouver ? (2) Bourbe : la page décrit encore beaucoup d'étapes, faut-il la raccourcir comme les autres ? (3) le style des croquis.

## Ce que ces pages ne disent plus (par rapport aux règles)

- Le givre (rat cuirassé, Gardien, bassin de Bourbe) ; la colle sur le Roi des rats et le bruit après la fumée ; le chemin sans potion du rat cuirassé (deux coups sur le casque, puis la lumière) et du feu follet (le bouclier) ; les flèches de lune (feu follet, chauve-souris) et le défaut de chaque flèche ne sont pas dits. C'est voulu (« il n'est pas obligé de tout dire »), mais à vérifier avec Romain une fois le ton validé.

## Les croquis

- Essais envoyés à Romain à 20 h 58 : `pages/croquis/croquis-rat.png`, `croquis-gardien.png` (encre brune sur vieux papier). **Pas encore de réponse sur le style.**
- Fabrication : `python3 pages/croquis/seuls.py <id…>` (le monstre du bestiaire seul sur fond blanc, avec Playwright), puis `python3 pages/croquis/croquis.py <id…>`.

## Pour changer une page ou un croquis

1. Le texte : `D.LIVRE` dans `moteur/src/donnees.js` (un à trois paragraphes courts par monstre, chacun aura son 🔊). `test-regles.js` refuse une question, le nom d'un geste, d'une potion ou d'un héros, et tout autre lampe que la lampe à huile.
2. Le croquis : `python3 pages/croquis/seuls.py <id>` puis `python3 pages/croquis/croquis.py <id>`, puis l'enregistrer en WebP dans `pages/portraits/<id>.webp`.
3. `python3 pages/assembler.py`, `python3 moteur/construire.py`, `test-sage.py --vite`, mise en ligne.

## Le 11 novembre (étape 1 des sorts du Sage) : plus d'étude dans le donjon

« Étudier » et le bouton « Journal » du donjon ont disparu (la rune de l'œil a pris la place d'« Étudier » : Bible §12.51). Le carnet ramassé à l'entrée reste la seule façon d'ouvrir les pages : toutes d'un coup, sur la tablette du Sage. Les anciens codes `etude:<monstre>` marchent encore sur sa tablette, mais le donjon n'en donne plus.

