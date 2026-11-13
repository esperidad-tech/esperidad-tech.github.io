# Enquête 3 « La lettre d'Odette » — les dialogues du Barde (version 3, 12 novembre 2026 au soir)

> 🔒 **VERROUILLÉ PAR ROMAIN LE 12 NOVEMBRE 2026 À 21 H 44.** Ce fichier est le **miroir exact** de ce que dit le jeu. Il est écrit par `node jeu/tools/e3-dialogues.js`, à partir de `jeu/src/e3.js`. **On ne le modifie jamais à la main**, et on n'y recolle aucun ancien dialogue. Pour changer une réplique : le « go » de Romain, puis `e3.js`, puis relancer l'outil. `node jeu/tools/verif.js 3` met une croix si ce fichier et le jeu ne disent plus la même chose.
>
> **Ne font plus foi** (anciens dialogues, à ne plus jamais reprendre) : la version 2 du 11 novembre (`jeu/archives/E3-dialogues-et-trame-11-novembre.md`), celle du 6 novembre (`jeu/archives/E3-dialogues-et-trame-6-novembre.md`), le document du 5 novembre (https://claude.ai/artifact/969HCVUYL6F1BToNqhE2Lo), les pages « La lettre d'Odette » (https://claude.ai/artifact/8tDtVAQEffoXqrxCvPhkfC) et « Dialogues du Barde » du 11 novembre (https://claude.ai/artifact/7e9Wm974Ux8D5Ta5Xcr3Ft), et « les 3 questions communes » du 12 novembre à 17 h (https://claude.ai/artifact/D3Ss7fQdWkCZCBvJjVtw4P).
>
> **Pour relire** : la page de Romain, avec des onglets (https://claude.ai/artifact/KpEtFyE3zCWVN4mmEMfyCv), et le scénario (https://claude.ai/artifact/Ya2t6QJG6zsqQ9s96xjFtM). En cas de différence, c'est le jeu (et donc ce fichier) qui a raison.

## 0. Les règles (décidées par Romain le 12 novembre)

- **Le scénario.** Le maire a fait écrire une fausse lettre « d'Odette ». Un homme en cape a forcé Mélusine à l'écrire, en imitant l'écriture d'Odette ; c'est elle qui l'a déposée à l'aube, dans un châle à chats. L'homme en cape, c'est Léo, l'apprenti du meunier : **son nom n'est dit nulle part avant la nuit**. Plus de lavande, plus de « minuit », plus de grosses bottes.
- **Les mêmes questions pour tous** : 1 la lettre, 2 Odette, 3 la nuit, 4 une question sur son métier. Puis, chez quelques-uns, une question qui s'ouvre plus tard. L'ordre ne change jamais (le jeu s'en sert).
- **Plus de limite à deux questions.** Ce qui limite : la moitié du village est occupée à chaque moment. Quand on a tout demandé à quelqu'un, il le dit avec humour (sa phrase « tout demandé »).
- **Les grands dialogues** (le maire, Anselme) ne s'ouvrent qu'une fois **tout demandé** à tout le monde. Ils ne s'affichent pas comme les autres : violets, « 🎭 Grande conversation », un reflet qui passe, une fenêtre à bandeau ; « 🎭 » se pose sur le visage du villageois, sur la carte. Un seul essai. Celui à qui on ne peut pas parler à ce moment-là (occupé, ailleurs, fâché) ne bloque pas.
- **Chez Anselme, les quatre choix sont en majuscules** : la bonne réponse ne se voit plus à l'œil.
- **🤥** : le villageois ment. On le démasque avec « Mensonge ? », sous sa dernière réponse (règle de l'enquête 2).
- **La grille du clocher grince.** Pour l'ouvrir sans bruit : ni tirer, ni pousser — **soulever** (Silas le dit). Le geste lui-même n'est pas encore construit (c'est chez le Pisteur).

## 1. Le début

**À l'aube, devant la mairie, le maire lit une lettre…**

> Mon cher Monsieur le maire, ne vous faites pas de souci pour moi : je suis partie quelques jours chez ma sœur, de l'autre côté de la forêt. Je vais très bien et je reviendrai la semaine prochaine. Je ne retrouve plus ma canne : si quelqu'un la trouve, qu'il la rapporte chez moi, au 2, rue des Lanternes. Je vous embrasse tous. Odette.

Puis : « Odette va bien ! Pour fêter ça : grande fête cette nuit, sur la place ! »

**La mission du Barde, à l'écran des missions** : Achète les fleurs de la fête.

**Dans son Carnet** : Achète les fleurs de la fête avec les pièces du maire. Puis interroge le village : pose toutes tes questions à ceux qui ont le temps de te répondre. Les autres, ce sera pour plus tard !

### Le marché aux fleurs (le matin)

- **Le maire** arrive tout seul : « Barde ! Voici 10 pièces. Rapportez-moi au moins 10 bouquets pour la fête de ce soir ! » (bouton : 💐 En route pour le marché !)
- **Trois secondes après**, le maire revient dire un mot : « Essayez de bien négocier. Je sais que vous êtes doué pour ça. Je compte sur vous ! »
- **Fortuné**, d'abord (Iris et Basile ne se voient qu'une fois son marchandage commencé) :
  - Étape 1 — « Psst ! De magnifiques fleurs en papier pour la fête ! 4 bouquets pour 2 pièces : moitié prix ! »
    - « Marché conclu ! » → « Affaire conclue ! Tu ne le regretteras pas, mon ami. » → marché conclu : 2 pièces
    - « Vous me faites un prix ? » → « C'est déjà moitié prix, mon ami ! » → étape suivante
    - « Je vais d'abord voir chez Iris. » → « Attends, attends ! » → étape suivante
    - « Je peux les toucher ? » → « Pas touche ! On regarde avec les yeux. » → étape suivante
  - Étape 2 — une image : la carriole, la bâche soulevée (aucun texte) La relance d'avant : « Viens voir, j'en ai d'autres dans ma carriole ! »
    - « Et ce vieux truc cabossé qui brille, là ? » → « Ça ? Une vieille lanterne. Alors, on fait affaire ? » → étape suivante
    - « Cette lanterne est magnifique ! Combien ? » → « Un trésor : 10 pièces ! Alors, on fait affaire ? » → étape suivante (il a compris que tu veux la lanterne)
    - « Vous n'avez pas de vraies fleurs ? » → « Les miennes ne fanent jamais ! » → on reste là, ce choix disparaît
    - « Bon, je prends vos 4 bouquets. » → « Affaire conclue ! Tu ne le regretteras pas, mon ami. » → marché conclu : 2 pièces
  - Étape 3
    - « Je prends vos bouquets… si vous ajoutez la lanterne. Sinon, je file chez Iris. » → « Tu es dur en affaires ! Bon… Elle vient des ruines, au-delà de la brume, comme ma vieille clé. » → marché conclu : 2 pièces, avec la lanterne · s'il a compris : « La lanterne en plus ? Tu rêves, mon ami ! » → 2 pièces
    - « Une pièce de plus pour la lanterne ? » → « Va pour une pièce, c'est la fête ! Elle vient des ruines, au-delà de la brume. » → marché conclu : 3 pièces, avec la lanterne · s'il a compris : « Allez, deux pièces, parce que c'est la fête. Elle vient des ruines, au-delà de la brume. » → 4 pièces, avec la lanterne
    - « Elle est toute cabossée, elle ne vaut rien ! » → « Rien ?! Alors je la garde ! » → marché conclu : 2 pièces
    - « Et contre une chanson ? » → « Une chanson, ça ne se mange pas ! » → marché conclu : 2 pièces
  - Se plaindre des fleurs en papier, plus tard : « Remboursé ? Marchandise vendue, ni reprise ni échangée ! »
- Chez le premier vrai fleuriste : « Oh là là… des fleurs en papier ! Elles se déchirent déjà ! »
- **Iris** : « Des fleurs pour la fête ? 2 pièces le bouquet. »
  - « Je peux les sentir ? Mmmh… » → « Enfin quelqu'un qui prend le temps ! Pour toi, 1 pièce le bouquet. » → 1 pièce le bouquet
  - « C'est le maire qui paie : faites-moi un prix ! » → « Alors c'est 2 pièces, comme tout le monde. »
  - « Lesquelles sont les moins chères ? » → « Toutes au même prix : 2 pièces. »
  - « 2 pièces ? C'est du vol ! » → « Du vol ?! Va acheter tes fleurs ailleurs ! » → fâché, plus de fleurs
  - Après la vente : « Voilà ! Prends-en bien soin. »
- **Basile** : « Des fleurs ? Je suis coincé sur mon échelle avec ces lampions… 2 pièces le bouquet. »
  - « Combien de bouquets pour 2 pièces ? » → « Un bouquet, pardi ! »
  - « Attendez, je vous tiens l'échelle ! » → « Ouf, merci ! Tiens, 3 bouquets de mon jardin : cadeau ! » → 3 bouquets en cadeau
  - « Vos lampions sont magnifiques ! » → « Merci ! Mais c'est 2 pièces quand même. »
  - « Dépêchez-vous, je suis pressé ! » → « Je ne vends rien aux gens pressés ! » → fâché, plus de fleurs
  - Après la vente : « Et voilà ! Tout frais du jardin. »
- **L'après-midi, le maire compte** : « Ah, Barde ! Alors, mes fleurs ? »
  - 11 bouquets ou plus ET la lanterne (il est ravi) : « Magnifique ! Je savais que je pouvais compter sur vous. Vous êtes vraiment un négociateur hors pair. Très malin ! »
  - 10 bouquets ou plus (il est content) : « Dix bouquets, comme convenu ! Voici 10 pièces d'or pour votre peine. » (10 pièces d'or)
  - 9 bouquets ou plus (il est pas content) : « Il en manque un ! Bien mauvais négociateur… La fête sera belle quand même. » (5 pièces d'or)
  - 5 bouquets ou plus (il est pas content) : « Il manque des fleurs… La fête sera jolie quand même. Enfin, j'espère. » (0 pièces d'or)
  - 0 bouquets ou plus (il est pas content) : « Si peu ?! C'est une fête ou un enterrement ? » (0 pièces d'or)
  - Avec la lanterne, dans une deuxième fenêtre — un aparté : Le maire réagit d'une façon très étrange : il ne quitte plus la lanterne des yeux… Puis : « Une lanterne comme celle-là… Parfait. Je vais la garder. » (5 pièces d'or de plus)

## 2. Les villageois

## 2.1 Ceux qui répondent dès le matin

### 👨‍🍳 Gaspard Levain — le boulanger

- **Où et quand** : le matin : boulangerie
- **Bonjour** : « Bonjour ! C'est le coup de feu, mais pour toi, j'ai une minute. »
1. **Que pensez-vous de la lettre d'Odette ?** _(le matin)_
   - « Pas un mot de ses chats, elle qui ne parle que d'eux ! »
2. **Vous connaissez bien Odette ?** _(le matin)_
   - « Une brioche chaque matin, et sa canne à la main. Elle ne sort jamais sans. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin)_
   - « Hier soir, une femme, un fichu sur la tête, m'a demandé une plume de mes oies. Il faisait noir : je n'ai pas vu son visage. »
4. **Votre four tourne fort, aujourd'hui ?** _(le matin)_
   - « Le maire m'a commandé le plus gros gâteau de ma vie. Il est si fier de ses fêtes ! »
- **Tout demandé** : « Ma pâte va retomber ! Repasse plus tard. »
- **Occupé, l'après-midi** : « Pas maintenant, j'ai sept étages de gâteau qui penchent ! » — puis, si on revient : « Si je lâche ma poche à douille, tout s'écroule ! »

### 👩‍🍳 Margot Chopine — la tavernière

- **Où et quand** : le matin : taverne · l'après-midi : taverne
- **Bonjour** : « Bienvenue au Chaudron fêlé ! Ce soir, c'est la fête ! »
1. **Que pensez-vous de la lettre d'Odette ?** _(le matin et l'après-midi)_
   - 🤥 « Une bien belle lettre ! Odette me parle souvent de sa sœur. »
   - 🔍 démasqué : « Bon… non. Je ne l'ai jamais entendue parler d'une sœur. Mais tout le monde était si content… »
2. **Vous connaissez bien Odette ?** _(le matin et l'après-midi)_
   - « Elle venait boire sa tisane ici, et savait tout sur tout le monde. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin et l'après-midi)_
   - « Rien vu. Mais ici, tout se sait : Basile parle à ses choux, Victor a peur des chats, Fortuné vend des cailloux peints… et Mélusine a du tissu tout neuf ! »
4. **Le maire vient souvent à la taverne ?** _(le matin et l'après-midi)_
   - « Chaque soir, pour son cidre. Il déteste qu'on dise qu'il cache des choses : il devient tout rouge ! »
5. **C'est vous qui avez écrit la lettre.** — 🔒 s'ouvre avec : le code « Deux écritures » (pour barde, sage) _(l'après-midi)_
   - « Moi ? Je n'écris que mes ardoises, à la craie. Et avec des fautes ! »
- **Tout demandé** : « Tu poses plus de questions que mes clients ne boivent de cidre ! »

### 🧔 Victor Lettrier — le facteur

- **Où et quand** : le matin : poste
- **Bonjour** : « Bonjour ! Une lettre pour toi ? Ah non… »
1. **Que pensez-vous de la lettre d'Odette ?** _(le matin)_
   - « Ni timbre ni tampon : elle n'est pas passée par la poste. Et en vingt ans, Odette n'a jamais envoyé une seule lettre. » → donne « La lettre n'est pas passée par la poste » (pour sage)
2. **Vous connaissez bien Odette ?** _(le matin)_
   - 🤥 « Odette ? Je la connais à peine. »
   - 🔍 démasqué : « Bon… je l'évite. Ses chats me suivent partout en miaulant, et j'ai peur des chats. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin)_
   - « Rien : je me couche tôt, ma tournée commence avant l'aube. »
4. **Votre tournée se passe bien ?** _(le matin)_
   - « Le maire me confie tous ses papiers. Il les recompte chaque soir : gare à qui en emprunte un ! »
5. **Comment savoir si c'est vraiment Odette qui l'a écrite ?** — 🔒 s'ouvre avec : la question 1 de Victor posée _(le matin)_
   - « Il faudrait comparer avec quelque chose qu'elle a écrit elle-même. Un papier à elle, chez elle… »
- **Tout demandé** : « Trois cents lettres à distribuer ! Une autre fois. »
- **Occupé, l'après-midi** : « Cent invitations à distribuer : pas une minute ! » — puis, si on revient : « Quatre-vingt-dix-neuf… Non ! Tu m'as fait perdre le compte ! »

### 🤠 Fortuné Malin — le colporteur

- **Où et quand** : le matin : place · l'après-midi : place
1. **Que pensez-vous de la lettre d'Odette ?** _(le matin et l'après-midi)_
   - « Une lettre qui fait faire une fête ? J'adore : j'ai vendu tous mes lampions ! »
2. **Vous connaissez bien Odette ?** _(le matin et l'après-midi)_
   - « La seule qui marchande mieux que moi ! Elle m'a eu sur un pot de sardines. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin et l'après-midi)_
   - 🤥 « Rien vendu, rien vu : je dormais dans ma carriole ! »
   - 🔍 démasqué : « Bon… j'ai vendu du papier, tard. Payé avec une pièce d'or toute neuve ! Il faisait noir, je n'ai pas vu qui. »
4. **D'où venez-vous, avec votre carriole ?** _(le matin et l'après-midi)_
   - « De partout ! Regarde cette vieille clé couverte de runes, trouvée au-delà de la brume. Personne n'en veut. »
- **Tout demandé** : « Les questions, c'est gratuit… mais pas illimité ! »

### 🧒 Tim — le petit ramoneur

- **Où et quand** : le matin : clocher · l'après-midi : ruelle
- **Bonjour** : « Salut ! Attention, ça tombe ! »
1. **Que penses-tu de la lettre d'Odette ?** _(le matin et l'après-midi)_
   - « Moi, je ne lis pas très bien. Mais une fête, j'adore ! »
2. **Tu connais bien Odette ?** _(le matin et l'après-midi)_
   - « Elle me donne des biscuits pour Pirate. Et elle me gronde quand je marche sur ses toits ! »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin et l'après-midi)_
   - 🤥 « Rien ! Je dormais, comme tout le monde. »
   - 🔍 démasqué : « Bon… j'étais sur les toits, à l'aube. J'ai vu Odette, dans son châle à chats, glisser la lettre à la mairie… mais elle marchait vite, et sans canne. » → donne « Odette… sans sa canne » (pour sage)
4. **Ça fait quoi, d'être ramoneur ?** _(le matin et l'après-midi)_
   - « Je vois tout le village d'en haut ! Et dans une cheminée, j'ai trouvé une pièce avec une lanterne dessinée. »
- **Tout demandé** : « Ma cheminée m'attend ! Salut ! »

### 🧓 Le voisin d'Odette — le voisin d'Odette

- **Où et quand** : le matin : 1, rue des Lanternes
- **Bonjour** : « Bonjour… Tu viens pour Odette ? »
1. **Que pensez-vous de la lettre d'Odette ?** _(le matin)_
   - « Chez sa sœur ? Odette n'a pas de sœur ! »
2. **Vous connaissez bien Odette ?** _(le matin)_
   - « Trente ans qu'on est voisins. Jamais elle ne laisserait ses chats : ils viennent tous mendier chez moi. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin)_
   - « Ses chats ont miaulé toute la nuit. Tous sont chez moi, sauf Moustache, le gros gris : disparu ! »
4. **Vous gardez sa maison ?** _(le matin)_
   - « Elle n'est jamais fermée : Odette ne ferme rien. Si tu retrouves sa canne, va la lui poser. »
- **Tout demandé** : « Les chats ont encore faim… Excuse-moi. »
- **Occupé, l'après-midi** : « Les chats me griffent les mollets, ils ont faim ! Repasse plus tard. » — puis, si on revient : « Je surveille la maison d'Odette. Repasse ce soir. »
- **Occupé, la nuit** : « Je veille sur la maison d'Odette. Rien ne m'échappe ! » — puis, si on revient : « Toujours rien… Enfin, je crois. Je n'ai pas dormi, hein ! »

### 🧓 La maison d'Odette

- **Où et quand** : le matin : chez Odette, 2, rue des Lanternes · l'après-midi : chez Odette, 2, rue des Lanternes · la nuit : chez Odette, 2, rue des Lanternes
- **Bonjour** : « La maison d'Odette. La porte n'est toujours pas fermée à clé… »
1. **Poser la canne d'Odette** _(quand on peut lui parler)_
   - « Tu poses la canne contre la porte. Sur la table, le carnet d'Odette : un chat à chaque page, et son écriture penchée. Par terre, du lait renversé… et de petites traces de pattes qui filent dehors ! » → donne « Le carnet d'Odette » (pour sage) et « Les traces de Moustache » (pour pisteur)

### 👩‍🌾 Iris Lavandin — l'herboriste

- **Où et quand** : le matin : herboristerie
- **Bonjour** : « Ah, c'est toi ! Attention à mes pots, ils sèchent. »
1. **Que pensez-vous de la lettre d'Odette ?** _(le matin)_
   - « Je n'ai pas fait attention, je pensais à mes fleurs. »
2. **Vous connaissez bien Odette ?** _(le matin)_
   - « Elle m'achète de la camomille pour dormir… et elle ne dort jamais ! »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(le matin)_
   - « Cette nuit, on m'a volé un flacon de mon encre ! Je la fabrique moi-même, avec des noix de galle. »
4. **Vos plantes servent à quoi ?** _(le matin)_
   - « À soigner, à teindre, à parfumer. La pensée sauvage pousse même dans la brume ! »
- **Tout demandé** : « Mes fleurs vont faner si je bavarde ! »
- **Occupé, l'après-midi** : « Chut ! Je fais les couronnes de ce soir. » — puis, si on revient : « Si c'est pour des fleurs, d'accord. Sinon, à ce soir ! »

## 2.2 Ceux qui répondent dès l'après-midi

### 🎩 Monsieur Grosbec — le maire

- **Où et quand** : l'après-midi : mairie
1. **Que pensez-vous de la lettre d'Odette ?** _(l'après-midi)_
   - « Une merveilleuse nouvelle ! Je l'ai trouvée sous ma porte ce matin. »
2. **Vous connaissez bien Odette ?** _(l'après-midi)_
   - « Nos deux familles sont là depuis la fondation. Une femme… très curieuse. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(l'après-midi)_
   - « Rien qui mérite qu'on en parle. »
4. **Être maire, c'est beaucoup de travail ?** _(l'après-midi)_
   - « Les fêtes, c'est ma fierté ! Un village heureux ne pose pas de questions. »
5. 🎭 **« Je voudrais vous parler de la lettre… »** — le grand dialogue « lettre » (§3), l'après-midi. Il n'apparaît que quand : tout demandé à Le voisin, Gaspard, Victor, Iris, Margot, Tim, Fortuné, Grosbec (ceux à qui on peut parler à ce moment-là).
- **Tout demandé** : « J'ai une fête à organiser, moi ! Repassez plus tard. »
- **Occupé, le matin** : « Mes fleurs d'abord, Barde ! Nous parlerons cet après-midi. » — puis, si on revient : « Dix bouquets, pas un de moins ! Allez, allez ! »

### 👩‍🦰 Mélusine Dufil — la couturière

- **Où et quand** : l'après-midi : atelier
- **Bonjour** : « Bonjour… Attention aux épingles. »
1. **Que pensez-vous de la lettre d'Odette ?** _(l'après-midi)_
   - « Je suis contente qu'elle aille bien. »
2. **Vous connaissez bien Odette ?** _(l'après-midi)_
   - « C'est mon amie. Je lui ai offert sa canne, avec sept chats gravés. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(l'après-midi)_
   - 🤥 « Rien. Je dormais, voyons ! »
   - 🔍 démasqué : « Bon… j'ai veillé à la bougie. Ne me demande pas pourquoi. »
4. **Qu'est-ce que vous cousez pour la fête ?** _(l'après-midi)_
   - « Une banderole par chat d'Odette : Moustache, Biscotte, Pompon, Caramel, Mistigri, Noisette, Grisette. »
5. **C'est vous qui avez écrit la lettre.** — 🔒 s'ouvre avec : le code « Deux écritures » (pour barde, sage) _(l'après-midi)_
   - 🤥 « Moi ? Je sais à peine écrire mon nom ! »
   - 🔍 démasqué : « C'est moi… Un homme en cape m'a forcée à l'écrire et à la déposer. Je n'ai pas vu son visage. Il est venu ici, cette nuit : il a peut-être laissé des traces… » → donne « L'aveu de Mélusine » (pour sage)
- **Tout demandé** : « Laisse-moi coudre, je t'en prie… »
- **Occupé, le matin** : « Pas maintenant ! Je viens de coudre ma manche à la banderole de Pompon… » — puis, si on revient : « Encore toi ? Attention à mes épingles ! Repasse cet après-midi. »

### 👴 Anselme Bourdon — le sonneur de cloches

- **Où et quand** : l'après-midi : clocher · la nuit : clocher
- **Bonjour** : « HEIN ? AH, C'EST TOI ! »
1. **Que pensez-vous de la lettre d'Odette ?** _(l'après-midi et la nuit)_
   - « LA LETTRE ? LE MAIRE PARLE TROP BAS, JE N'AI RIEN ENTENDU ! »
2. **Vous connaissez bien Odette ?** _(l'après-midi et la nuit)_
   - « ODETTE ? Elle m'apporte des pastilles pour la gorge. Gentille, mais BAVARDE ! »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(l'après-midi et la nuit)_
   - « CETTE NUIT, UNE LANTERNE EST DESCENDUE DANS LA CRYPTE. La grille était fermée à clé… C'est bizarre : j'ai la SEULE clé ! »
4. **Sonner les cloches, c'est dur ?** _(l'après-midi et la nuit)_
   - « Parle-moi FORT et LEN-TE-MENT. Et ne me presse jamais : quand on me presse, je n'entends plus rien ! »
5. **Qu'y a-t-il sous le clocher ?** — 🔒 s'ouvre avec : le code « La crypte est fermée » (pour barde) _(l'après-midi et la nuit)_
   - « LA CRYPTE DES FONDATEURS. Personne n'y descend, jamais ! »
6. 🎭 **« Anselme, je voudrais vous demander quelque chose… »** — le grand dialogue « cle » (§3), la nuit. Il n'apparaît que quand : (Mélusine démasquée (question 5) OU Mélusine a craqué à la fête) ET le code « La crypte est fermée » (pour barde) ET tout demandé à Anselme, Basile, Silas (ceux à qui on peut parler à ce moment-là).
- **Tout demandé** : « ASSEZ ! TU VAS ME CASSER LES OREILLES… ENFIN, CE QU'IL EN RESTE ! »
- **Occupé, le matin** : « AH, LE BARDE ! VA ME CHERCHER L'ALCHIMISTE : J'AI UN SERVICE À LUI DEMANDER ! » DONG ! — puis, si on revient : « L'AL-CHI-MISTE ! PAS LE FLEURISTE ! DIS-LUI DE MONTER ME VOIR ! » DONG !

### 🧑‍🌾 Aimé Farinel — le meunier

- **Où et quand** : l'après-midi : moulin
- **Bonjour** : « Bonjour, bonjour ! Tu veux de la farine ? »
1. **Que pensez-vous de la lettre d'Odette ?** _(l'après-midi)_
   - « Atchoum ! Pardon… je dormais à moitié pendant la lecture. »
2. **Vous connaissez bien Odette ?** _(l'après-midi)_
   - « Elle a appris à lire à mon apprenti, le soir. Brave femme. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(l'après-midi)_
   - 🤥 « J'ai veillé toute la nuit, comme un bon meunier ! »
   - 🔍 démasqué : « Bon… j'ai dormi comme une souche. Je dors toujours. »
4. **Votre moulin est vraiment si vieux ?** _(l'après-midi)_
   - « Le plus vieux de Brumeval ! Une pierre du mur porte une lanterne gravée. »
- **Tout demandé** : « Toutes ces questions me donnent sommeil… »
- **Occupé, le matin** : « Pas le temps, mes sacs de farine débordent ! Atchoum ! » — puis, si on revient : « Regarde-moi : un vrai fantôme de farine ! Reviens cet après-midi. »

### 💂 Silas Sec — le garde champêtre

- **Où et quand** : l'après-midi : mairie
- **Bonjour** : « Halte ! Ah, c'est toi. »
1. **Que pensez-vous de la lettre d'Odette ?** _(l'après-midi)_
   - « Une lettre lue par le maire en personne : affaire classée ! »
2. **Vous connaissez bien Odette ?** _(l'après-midi)_
   - « Une dame respectable. Un peu trop curieuse, dit le maire. »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(l'après-midi)_
   - « Pendant ma ronde, la grille du clocher a grincé : on l'entend à des kilomètres ! Anselme, lui, la soulève un peu, et elle ne dit rien. »
4. **Pourquoi êtes-vous devenu garde ?** _(l'après-midi)_
   - « Petit, je me suis perdu trois jours dans la brume. Le père d'Anselme m'a retrouvé en sonnant toute la nuit. »
- **Tout demandé** : « Un garde ne bavarde pas pendant son service. Circulez ! »
- **Occupé, le matin** : « Halte ! Mission secrète. Si secrète que même moi, je ne la connais pas. » — puis, si on revient : « Chut ! Je surveille une fourmi très suspecte. »

### 👨‍🌾 Basile Potiron — le jardinier

- **Où et quand** : l'après-midi : place
- **Bonjour** : « Ah, te revoilà ! Tiens-moi cette guirlande, tu veux ? »
1. **Que pensez-vous de la lettre d'Odette ?** _(l'après-midi)_
   - « Une fête ! Moi, tant qu'il y a des lampions, je suis content. »
2. **Vous connaissez bien Odette ?** _(l'après-midi)_
   - « Elle me donne des conseils pour mes choux. Toujours les bons ! »
3. **Il s'est passé quelque chose de bizarre, cette nuit ?** _(l'après-midi)_
   - « Rien vu : je me couche avec les poules. »
4. **Vous décorez la place ?** _(l'après-midi)_
   - « Oui, et j'aide Anselme. Il ne prête rien… sauf à ceux qui l'aident à sonner la Grosse Marie : elle est si lourde ! »
- **Tout demandé** : « Si je continue, je tombe de mon échelle ! »
- **Occupé, le matin** : « Pas maintenant, j'ai les bras pleins de lampions ! » — puis, si on revient : « Attention en dessous ! Oups… Reviens cet après-midi. »

## 3. Les grands dialogues (un seul essai)

### 🎭 « lettre » — Monsieur Grosbec

**Étape 1** — « Oui ? »

- ❌ « Quel beau discours vous avez fait ce matin ! »
- ✅ « Quelle belle fête vous préparez pour Odette ! » → « N'est-ce pas ? Les lampions, le gâteau, les fleurs… Que puis-je pour vous ? »
- ❌ « Votre mairie est vraiment très bien rangée ! »
- ❌ « Vous avez l'air bien fatigué, Monsieur le maire. »

**Étape 2** — « Que puis-je pour vous ? »

- ❌ « Les enfants voudraient voir la lettre, pour être rassurés. »
- ❌ « Je voudrais recopier la lettre, pour la chanter à la fête. »
- ✅ « On dit que vous cachez la lettre… Je suis sûr que c'est faux ! » → « Bien sûr que c'est faux ! Tenez, la voilà… Mais vous me la rendez quand ? »
- ❌ « Odette est mon amie : j'aimerais lire ses mots moi-même. »

**Étape 3** — « Mais vous me la rendez quand ? »

- ❌ « Demain matin, à la première heure : c'est promis. »
- ❌ « Le Sage la gardera à l'abri, dans son Grand Livre. »
- 🪤 (le piège) « Je peux la recopier ici, tout de suite, devant vous ? » → « Mais bien sûr, recopiez donc ! »
- ✅ « Avant ce soir, promis : vous pourrez la recompter. » → « Avant ce soir, c'est bien compris ? »

- **Après un mauvais choix** : « Bien, bien… J'ai beaucoup à faire. Revenez plus tard. » (et c'est fini)
- **Réussi** : bouton « ✉️ Prendre la lettre » → « Le maire te prête la lettre » : Tu tiens la lettre d'Odette. Le maire te regarde partir… Il faudra la lui rendre avant ce soir ! → code « La lettre d'Odette » (pour sage, alchimiste)
- **Le piège** : bouton « 📝 Ranger ma copie » → « Ta copie de la lettre » : Tu recopies la lettre, mot pour mot… de ta propre écriture ! Impossible de comparer les écritures avec ça. Le maire range l'original sur son bureau. Il reste une autre façon de l'avoir : sans bruit, et sans se faire voir. → code « La lettre est sur le bureau du maire » (pour pisteur)
- **Raté** : bouton « 🤔 Et maintenant ? » → « Le maire garde la lettre » : Les beaux discours n'ont pas suffi : la lettre reste sur le bureau du maire. Il reste une autre façon de l'avoir : sans bruit, et sans se faire voir. → code « La lettre est sur le bureau du maire » (pour pisteur)
- Dans le Carnet (ok) : Le maire t'a prêté la lettre d'Odette.
- Dans le Carnet (piege) : Tu as recopié la lettre, devant le maire… de ta propre écriture.
- Dans le Carnet (rate) : Le maire n'a pas voulu te prêter la lettre.

### 🎭 « cle » — Anselme Bourdon

**Étape 1** — « HEIN ? Ah, le Barde ! Qu'est-ce que tu me veux ? »

- ❌ « PARDON DE VOUS DÉRANGER, ANSELME, J'AI UNE QUESTION ! » → « UN HARENG ? Je n'ai pas faim, mon petit ! »
- ❌ « VI-TE, AN-SEL-ME, LA FÊ-TE VA COM-MEN-CER ! » → « ME PRESSE PAS, TOI ! Je n'entends plus rien ! »
- ✅ « BON-SOIR, AN-SEL-ME. J'AI TOUT MON TEMPS. » → « Enfin quelqu'un qui parle comme il faut ! Alors, qu'est-ce qui t'amène ? »
- ❌ « UNE TOUTE PETITE QUESTION, ÇA NE PRENDRA QU'UNE SECONDE ! » → « UNE SECONDE CLOCHE ? La Grosse Marie suffit bien ! »

**Étape 2** — « Alors, qu'est-ce qui t'amène ? »

- ✅ « LA GROSSE MARIE EST SI LOURDE… JE PEUX VOUS AIDER ? » → « M'aider ? Personne ne me l'a proposé depuis des années… Dis-moi pourquoi. »
- ❌ « JE VOUDRAIS EMPRUNTER LA CLÉ DE LA CRYPTE. » → « MA CLÉ ? JE NE PRÊTE RIEN À PERSONNE ! »
- ❌ « JE VOUS APPORTE UNE PART DU GÂTEAU DE GASPARD. » → « UN CHAPEAU ? Il fait des chapeaux, le boulanger ? »
- ❌ « VOUS ÊTES EN PLEINE FORME, AUJOURD'HUI ! » → « EN PLEINE FORÊT ? Je suis au clocher, voyons ! »

**Étape 3** — « Dis-moi pourquoi. »

- ❌ « PARCE QUE C'EST LA FÊTE ET QUE J'ADORE LES CLOCHES ! » → « TU ADORES LES BROCHES ? Demande à Mélusine ! »
- ❌ « PARCE QUE SILAS DIT QUE VOUS ÊTES LE MEILLEUR SONNEUR. » → « SILAS ? Il dit ça à tout le monde ! »
- ❌ « PARCE QUE LE MAIRE VEUT QUE TOUT SOIT PARFAIT. » → « LE MAIRE VEUT UNE PAIRE ? De chaussettes ? »
- ✅ « VOTRE PÈRE A SONNÉ TOUTE UNE NUIT POUR SILAS. ODETTE AUSSI EST PERDUE. » → Il essuie une larme. « Alors on sonne pour Odette. Monte, mon petit ! »

- **Après un mauvais choix** : « Bon, je monte sonner, moi. » (et c'est fini)
- **Réussi** : bouton « 🔔 Monter avec Anselme » → « La Grosse Marie sonne » : Vous tirez la corde ensemble : DONG… DONG… Anselme ferme les yeux et compte les coups. Sa clé pend à sa ceinture… → code « La Grosse Marie sonne » (pour pisteur)
- **Raté** : bouton « 🏠 Qui m'appelle ? » → « Tim, depuis les toits » : « Psst, Barde ! Moustache vient de filer dans le vieux puits, entre les barreaux ! » → code « Le vieux puits » (pour pisteur)
- Dans le Carnet (ok) : Tu as aidé Anselme à sonner la Grosse Marie. Sa clé pendait à sa ceinture…
- Dans le Carnet (rate) : Anselme est monté sonner tout seul, sa clé à la ceinture.

## 4. La nuit

### 🎉 La fête, sur la place

Chacun dit une réplique, autant de fois qu'on veut.

- **Gaspard** : « Sept chats en pâte d'amande sur le gâteau ! Il me faudra des bras pour le porter. » _(noté dans le Carnet : un indice pour retenir le maire)_
- **Margot** : « Le discours du maire ? Vingt minutes ! Il adore qu'on le lui réclame. » _(noté dans le Carnet : un indice pour retenir le maire)_
- **Silas** : « Chaque année, c'est le maire qui ouvre le bal. Personne ne danse avant lui ! » _(noté dans le Carnet : un indice pour retenir le maire)_
- **Victor** : « Je danse ! Enfin, j'essaie. »
- **Tim** : « Chut ! Je suis monté en haut du mât des lampions. »
- **Mélusine** : « Je n'écrirai plus jamais pour personne… »
  - **Le filet** (si son aveu n'a pas été obtenu l'après-midi) : « C'est trop dur de garder ce secret… J'ai besoin de me confier. C'est moi qui ai écrit la lettre ! Un homme en cape m'y a forcée. Je n'ai pas vu son visage. » → code « L'aveu de Mélusine » (pour sage)
- **Iris** : « J'ai tressé une couronne pour Odette. Je la poserai sur sa porte… quand elle reviendra. »
- **Farinel** : « Je ne dors pas, je repose mes yeux ! »
- **Basile** : « Les lampions tiennent ! Je n'en reviens pas moi-même. »
- **Fortuné** : « Dernières lanternes ! Deux pour le prix de trois ! »
- **Grosbec** : « Quelle fête ! Tout le village est là… enfin, presque. »

### 🎩 Retenir le maire

Trois petits dialogues, à la fête, sans minuteur. Le premier quand : le grand dialogue « cle » fini (réussi ou raté). Chacun des suivants après une autre visite à la fête. 2 réussis : le code « Le maire est retenu » (pour pisteur) ; deux ratés : « Le maire s'éloigne vers le clocher… »

**1.** « Barde ! Je ne vois pas vos trois amis. Où sont-ils passés ? »

- ❌ « Ils sont allés se coucher, ils étaient épuisés. » → « Se coucher, un soir de fête ? Je vais voir ça… »
- ✅ « Ils aident Gaspard à porter le gâteau : ça pèse ! » → « Ah ! Très bien, très bien. Ce gâteau sera magnifique. »
- ❌ « Ils cherchent encore des fleurs pour vous. » → « À cette heure-ci ? Hmm… » Il regarde vers le clocher.
- ❌ « Je ne sais pas, Monsieur le maire, vraiment pas. » → « Vous ne savez pas ? Hmm… »

**2.** « Je vais faire un petit tour du côté du clocher. »

- ✅ « Monsieur le maire, tout le village réclame votre discours ! » → Il redresse son chapeau. « Mon discours ? Bon… le village a besoin de moi. »
- ❌ « Anselme dort, il ne faut surtout pas le réveiller. » → « Il dort ?! J'y vais tout de suite ! »
- ❌ « Votre chapeau neuf vous va vraiment très bien ! » → « Merci. Laissez-moi passer. »
- ❌ « Je viens avec vous, je connais bien le chemin ! » → « Non, non. Restez ici. » Il part seul.

**3.** « Toujours pas vos amis… Je dois vérifier quelque chose. »

- ❌ « Allez-y, je surveille la fête pour vous. » → « Merci, Barde. » Il s'éloigne.
- ❌ « Il n'y a rien au clocher, je vous assure. » → « Qui a parlé du clocher ? » Il s'éloigne.
- ✅ « Le bal ! Personne ne danse avant que vous l'ouvriez ! » → « Le bal ! Mais oui, mais oui… Musique ! »
- ❌ « Restez donc, il fait bien trop froid dehors. » → « Je ne suis pas frileux. » Il s'éloigne.

### 🧑 Léo (une scène, sans choix — provisoire, tant que la fin n'est pas décidée)

- Avec le code « Léo attrapé » (pour barde) : Tout au fond des souterrains, tes amis ont coincé l'homme en cape, une lanterne à la main. Sous le capuchon : Léo, l'apprenti du meunier !
- Léo : « Vous n'auriez jamais dû descendre ! C'est pour le bien du village… » Puis, tout bas : « Elle m'a appris à lire. Je voulais juste qu'elle n'ait pas froid. » → code « Ce que Léo a dit » (pour sage)
- Puis : Raconte à voix haute à ton équipe ce que Léo a dit, et donne son code au Sage. Puis le Sage accuse !
- Avec le code « Léo s'est enfui » (pour barde) : Des pas descendent l'escalier de la crypte. Léo, l'apprenti du meunier, renverse sa lanterne et file dans le noir, sans un mot. Léo a filé. Raconte à ton équipe ce qui s'est passé. Puis le Sage accuse !

## 5. Les écoutes aux portes (talent « Tendre l'oreille »)

**Le matin**

- _Derrière la porte de la boulangerie_ (boulangerie) :
  - Margot : « Je lui ai dit : vous gardez la lettre pour vous ? Il a rougi ! »
  - Gaspard : « Moi, j'ai vanté sa fête : trois gâteaux de plus ! »
  - Dans le Carnet : Margot : le maire a rougi quand elle a dit qu'il gardait la lettre pour lui. Gaspard : il a vanté sa fête, et le maire a commandé trois gâteaux de plus.
- _Sur la place_ (place) :
  - Silas : « Halte, Fortuné ! Pas de vente sans permis ! »
  - Fortuné : « Chut ! Je dis partout que le maire adore son chapeau neuf. Il le déteste ! »
  - Silas : « Et ma pendule ? J'ai dit qu'elle était belle : tu me l'as vendue deux fois plus cher ! »
  - Fortuné : « Quand on montre qu'on veut quelque chose, ça coûte toujours plus cher ! »
  - Dans le Carnet : Fortuné : le maire déteste son chapeau neuf. Et quand on montre qu'on veut quelque chose, ça coûte toujours plus cher.
- Grosbec, tout seul derrière sa porte : « Cette lettre reste dans mon tiroir. Que personne n'y touche ! »
- Iris, tout seul derrière sa porte : « Mon flacon d'encre… et de la terre partout sur mon carrelage ! »
- Le voisin, tout seul derrière sa porte : « Six gamelles ce matin… et toujours pas de Moustache. »
- Anselme, tout seul derrière sa porte : « UNE LANTERNE DANS MA CRYPTE FERMÉE… J'AI RÊVÉ, OU QUOI ? »
- Mélusine, tout seul derrière sa porte : « Plus jamais de bougie toute la nuit… J'ai les yeux qui piquent. »
- Basile, tout seul derrière sa porte : « Un lampion ici, un lampion là… et un sur ma tête ! »

**L'après-midi**

- _Devant la mairie_ (mairie) :
  - Grosbec : « Ce soir, tout le monde à la fête. Personne au clocher ! »
  - Silas : « Pourquoi le clocher, Monsieur le maire ? »
  - Grosbec : « Parce que je le dis. »
  - Dans le Carnet : Le maire à Silas : « Ce soir, tout le monde à la fête. Personne au clocher ! »
- _Au comptoir de la taverne_ (taverne) :
  - Gaspard : « S'il me commande un étage de plus, je dors dans mon four ! »
  - Margot : « Et moi, la soupe toute la nuit ! »
  - Dans le Carnet : Gaspard et Margot : le maire leur donne beaucoup de travail pour sa fête.
- _Derrière la porte de l'herboristerie_ (herboristerie) :
  - Iris : « Tu as les yeux rouges, Mélusine. »
  - Mélusine : « C'est le fil. J'ai trop cousu. »
  - Dans le Carnet : Iris à Mélusine : « Tu as les yeux rouges. » Mélusine : « C'est le fil. J'ai trop cousu. »
- _Au pied du clocher_ (clocher) :
  - Basile : « Je t'aide à sonner, ce soir ? »
  - Anselme : « UN PAIN AUX RAISINS ? »
  - Basile : « JE-T'AI-DE-À-SON-NER ! »
  - Anselme : « Non, je sonne seul. Sauf si on me le demande… lentement ! »
  - Dans le Carnet : Anselme sonne seul, sauf si on lui demande de l'aider… lentement.
- Victor, tout seul derrière sa porte : « Six chats devant ma porte… Au secours ! »
- Farinel, tout seul derrière sa porte : « Encore de la farine renversée… Atchoum ! »

**La nuit**

- _Près du gâteau_ (place) :
  - Grosbec : « Où sont passés ces trois-là ? »
  - Silas : « Qui ça, Monsieur le maire ? »
  - Dans le Carnet : Le maire à Silas : « Où sont passés ces trois-là ? »
- _Sous les banderoles_ (place) :
  - Iris : « Tu trembles, Mélusine. »
  - Mélusine : « Je n'écrirai plus jamais pour personne. »
  - Dans le Carnet : Mélusine à Iris : « Je n'écrirai plus jamais pour personne. »
- _Au buffet_ (place) :
  - Gaspard : « Encore une part ? »
  - Farinel : « Je ne dors pas, je goûte ! »
  - Dans le Carnet : Gaspard et Farinel, au buffet. Farinel : « Je ne dors pas, je goûte ! »

## 6. Les missions du Barde, dans son Carnet

- 💐 Le maire t'a donné 10 pièces : rapporte-lui au moins 10 bouquets pour la fête.
- 🗣️ Le matin : sept villageois ont le temps de te répondre. Pose-leur toutes tes questions !
- 🦯 Odette demande qu'on rapporte sa canne chez elle, au 2, rue des Lanternes.
- 🗣️ L'après-midi : d'autres villageois ont enfin le temps. Pose-leur toutes tes questions ! _(arrive l'après-midi)_
- ✉️ Le maire garde la lettre pour lui. Quand tu auras tout demandé à tout le monde, va lui en parler… avec les bons mots. _(arrive l'après-midi)_
- 🧵 Quelqu'un a écrit cette lettre. Quand l'équipe saura qui, fais-lui dire la vérité. _(arrive l'après-midi)_
- 🗝️ La crypte est fermée, et Anselme a la seule clé. Quand tu sauras tout ce qu'il faut, va le voir au clocher, la nuit. _(arrive la nuit)_
- 🎉 Reste à la fête. Si le maire te cherche, retiens-le ! _(arrive la nuit)_
- 💡 Regarde bien les visages : plusieurs villageois vont te mentir.
- 🔍 Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?

## 7. Ce qui n'est PAS encore construit (le reste du nouveau scénario)

Les dialogues du Barde suivent le nouveau scénario. Depuis le 13 novembre (Bible §13.32), le Sage et l'Alchimiste aussi, en partie. Ce qui reste, tant que Romain n'a pas donné son « go » :

- **Le Pisteur** : les empreintes de pieds d'enfant chez Iris et derrière l'atelier de Mélusine ; le geste de la grille (tirer, pousser ou soulever) et ce qu'il change pour le maire ; la clé prise à la ceinture d'Anselme (le dessin du mini-jeu la montre encore au clou).
- **Le Sage** : les pointures dans le registre. (Fait le 13 novembre : le Livre d'or, dans son Grand Livre, laisse deux suspectes, Mélusine ou Margot ; le Barde les accuse toutes les deux, une seule ment.)
- **L'Alchimiste** : comparer l'encre de la lettre avec celle d'Iris ; le labo montre encore du pollen de lavande.
- **Le donjon** : Léo en chef des monstres ; le code de la Grosse Marie, gardé en réserve, n'est plus donné par personne (le donjon est donc un peu plus dur).
- **La fin** : Odette délivrée avant l'arrivée du maire, ou seulement entendue derrière la porte ? La scène de Léo est provisoire.
- **La Grosse Marie et la brume** (l'Alchimiste qui cueille pendant que la brume recule) : à décider avec la tisane d'Anselme, validée le 12 novembre à 15 h 39.
- La quatrième écoute de la fête (« au pied du mât »), qui dépend de la grille.
