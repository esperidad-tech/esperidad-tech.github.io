# Enquête 3 « La lettre d'Odette » — les dialogues du Barde (version 2, 11 novembre 2026)

> **Cette version remplace celle du 6 novembre** (gardée dans `jeu/archives/E3-dialogues-et-trame-6-novembre.md`). Elle a été réécrite le 11 novembre après le « go pour tout » de Romain (15 h 13) : un tiers de lecture en moins (règles du §12.50), moins d'indices vers le clocher, le puits seulement après un échec, la Grosse Marie et le maire à retenir pendant le donjon, la fin « le maire arrive trop tôt ». Les décisions : Bible §13.14. La trame d'ensemble : le document « Enquête 3 — la trame du chemin parfait » (https://claude.ai/artifact/2RcGGWamDNVQStUN6ud1Cw). Les trois autres rôles : `E3-actions-des-roles.md` ; l'atelier des plantes : `E3-atelier-des-plantes.md`.
>
> **Construit le 11 novembre (étape 1, Bible §13.15)** : les §1 à §3 sont dans le jeu (`jeu/src/e3.js`, `jeu/src/marche.js`), sauf le grand dialogue du maire (étape 2). Où est chacun, quand ce fichier ne le disait pas : Tim, le matin, au pied du clocher, l'après-midi dans la ruelle des Brumes ; Silas, le matin, sur la place, l'après-midi devant la mairie ; Victor, l'après-midi, devant le vieux puits ; le voisin, au 1, rue des Lanternes.
>
> **Construit le 11 novembre au soir (étape 2, Bible §13.18)** : les §3.1 (le grand dialogue de la lettre) et §4.1 à §4.5 et §4.7 sont dans le jeu (`jeu/src/grands.js` ; les textes dans `e3.js` : `E.grands`, `E.retenir`, `E.fete`). Ce que la construction a changé : un grand dialogue ne compte pas dans les deux questions par visite (§0) ; la deuxième chance de la Grosse Marie reprend à l'étape ratée (§4.2) ; « Retenir le maire » s'arrête dès que deux dialogues sont réussis, ou deux ratés (§4.4) ; le maire a une réplique à la fête quand il ne cherche pas le Barde (« Quelle fête ! Et à minuit pile, le gâteau ! ») ; le voisin d'Odette a deux petites phrases la nuit. Pas construits : la Lanterne du veilleur (§4.6) et les autres objets du Barde (§7) ; la scène finale (§4.8, étape 7).
>
> **Ne font plus foi pour les dialogues** : le document Claude Docs du 5 novembre (https://claude.ai/artifact/969HCVUYL6F1BToNqhE2Lo) et la page « La lettre d'Odette » (https://claude.ai/artifact/8tDtVAQEffoXqrxCvPhkfC). Ce fichier est la seule source.

## 0. Comment lire ce fichier

- Les textes entre « » sont ceux que le jeu affiche (et lit avec 🔊). Le reste est pour nous.
- **Ruban** : la réponse donne l'indice d'un grand dialogue. **Enquête** : elle fait avancer l'enquête. **Histoire** : pour la banque de données de la saison. **Ment** : le villageois ment d'abord ; démasqué, il dit la « vérité ».
- Chaque villageois a 4 questions ; le Barde en pose 2 par visite, puis la phrase d'impatience (§8).
- **Règles appliquées partout (§12.50)** : une réponse = 2 phrases courtes au plus ; une vérité = 30 mots au plus ; aux portes, une phrase de 15 mots au plus par personne ; aucun « quand il ment, il… » (les signes s'épinglent sur le liège) ; le salut seulement à la première visite (`salutUneFois`) ; le 🤥 seulement sous la dernière réponse (§13.13).
- **Grands dialogues à étapes** (§13.8) : 4 choix par étape, tous polis et plausibles ; un seul essai (comme toute l'enquête depuis l'E2) ; un mauvais choix ferme le dialogue (sauf la Grosse Marie, qui a une deuxième chance). « Exige la vérité » et la potion de vérité démasquent les mensonges des questions et le mensonge d'entrée de Léo, jamais les étapes.
- **Les signes des menteurs** : le liège est gardé depuis l'E2 (§12.37). Au début de l'E3, les étiquettes des menteurs de l'E3 qui manquent (Margot, Victor, Fortuné, Tim, Mélusine, Farinel) s'épinglent toutes seules, avec une note : « Margot t'a glissé ses secrets de tavernière. » Léo est nouveau : Farinel l'épingle l'après-midi.
- **Chaque villageois a une place à chaque moment** (sur la carte, ou « occupé » avec sa phrase).

## 1. L'ouverture (toutes les tablettes)

**La lettre**, lue par le maire sur la place, à l'aube (écran fixe ; c'est le texte que l'Alchimiste analysera, à garder mot pour mot) :

> « Mon cher Monsieur le maire, ne vous faites pas de souci pour moi : je suis partie quelques jours chez ma sœur, de l'autre côté de la forêt. Je vais très bien et je reviendrai la semaine prochaine. Je ne retrouve plus ma canne : si quelqu'un la trouve, qu'il la rapporte chez moi, au 2, rue des Lanternes. Je vous embrasse tous. Odette. »

Puis le maire : « Odette va bien ! Pour fêter ça : grande fête cette nuit sur la place, jusqu'à minuit ! »

**L'écran des missions du maire** (écran fixe, une ligne par rôle, bouton jaune « Commencer l'enquête 3 ») :
- Barde : « Achète les fleurs de la fête. »
- Pisteur : « Accroche les banderoles et rattrape l'oie de Gaspard. »
- Alchimiste : « Fais le gâteau de la fête, d'après la commande de Gaspard. »
- Sage : « Peins le tableau d'Odette et de ses chats. »

La canne d'Odette est d'office dans le sac du Barde (§12.50).

## 2. Le matin

### 2.1 Le marché aux fleurs (consignes : Bible §13.6 bis)

Deux ou trois secondes après « Commencer l'enquête 3 », le maire arrive en plein écran sur la tablette du Barde (ça ne compte pas comme une visite) :
« Barde ! Voici 10 pièces. Rapporte-moi au moins 10 bouquets pour la fête de ce soir ! »
Deux compteurs sur la carte : 💰 10 et 💐 0 sur 10. Seul Fortuné est visible (bulle 🌸) ; Iris et Basile apparaissent pendant son marchandage.

**L'écoute automatique avant Fortuné** (seulement avec Tendre l'oreille ; une réplique à la fois) :
- Silas : « Halte, Fortuné ! Pas de vente sans permis ! »
- Fortuné : « Chut ! Je dis partout que le maire adore son chapeau neuf. Il le déteste ! »
- Silas : « Et ma pendule ? J'ai dit qu'elle était belle : tu me l'as vendue deux fois plus cher ! »
- Fortuné : « Quand on montre qu'on veut quelque chose, ça coûte toujours plus cher ! »

**Fortuné, le marchandage** (pas de bouton « il ment » ; il tutoie le Barde ; une réponse qui fait rester à la même étape disparaît une fois choisie)

Étape 1. Fortuné : « Psst ! De magnifiques fleurs en papier pour la fête ! 4 bouquets pour 2 pièces : moitié prix ! »
- « Marché conclu ! » → il paie 2 pièces, 4 bouquets. Fin.
- « Vous me faites un prix ? » → « C'est déjà moitié prix, mon ami ! »
- « Je vais d'abord voir chez Iris. » → « Attends, attends ! »
- « Je peux les toucher ? » → « Pas touche ! On regarde avec les yeux. »
- Relance commune après les trois dernières : « Viens voir, j'en ai d'autres dans ma carriole ! » → étape 2.

Étape 2. L'image spéciale : Fortuné penché sur sa carriole, la bâche soulevée, une vieille lanterne de cuivre cabossée qui dépasse et brille (aucun texte ne la décrit).
- ✅ « Et ce vieux truc cabossé qui brille, là ? » → « Ça ? Une vieille lanterne. Alors, on fait affaire ? » → étape 3 (il ne sait pas que tu la veux).
- « Cette lanterne est magnifique ! Combien ? » → « Un trésor : 10 pièces ! Alors, on fait affaire ? » → étape 3 (il sait que tu la veux).
- « Vous n'avez pas de vraies fleurs ? » → « Les miennes ne fanent jamais ! » (on reste, la réponse disparaît)
- « Bon, je prends vos 4 bouquets. » → 2 pièces. Fin.

Étape 3 (les 4 réponses finissent le dialogue) :
- ✅ « Je prends vos bouquets… si vous ajoutez la lanterne. Sinon, je file chez Iris. »
  - s'il ne sait pas : « Tu es dur en affaires ! Bon… Elle vient des ruines, au-delà de la brume, comme ma vieille clé. » → 2 pièces, bouquets et lanterne ;
  - s'il sait : « La lanterne en plus ? Tu rêves, mon ami ! » → 2 pièces, bouquets seulement.
- « Une pièce de plus pour la lanterne ? »
  - s'il ne sait pas : « Va pour une pièce, c'est la fête ! Elle vient des ruines, au-delà de la brume. » → 3 pièces, bouquets et lanterne ;
  - s'il sait : « Allez, deux pièces, parce que c'est la fête. Elle vient des ruines, au-delà de la brume. » → 4 pièces, bouquets et lanterne.
- « Elle est toute cabossée, elle ne vaut rien ! » → « Rien ?! Alors je la garde ! » → 2 pièces, bouquets seulement.
- « Et contre une chanson ? » → « Une chanson, ça ne se mange pas ! » → 2 pièces, bouquets seulement.

S'il revient se plaindre : « Remboursé ? Marchandise vendue, ni reprise ni échangée ! » Les bouquets en papier se déchirent chez le premier vrai fleuriste : « Oh là là… des fleurs en papier ! Elles se déchirent déjà ! » (ils comptent pour 0).

**Iris** (herboristerie ; le matin, elle ne fait que vendre) : « Des fleurs pour la fête ? 2 pièces le bouquet. »
- ✅ « Je peux les sentir ? Mmmh… » → « Enfin quelqu'un qui prend le temps ! Pour toi, 1 pièce le bouquet. »
- « C'est le maire qui paie : faites-moi un prix ! » → « Alors c'est 2 pièces, comme tout le monde. »
- « Lesquelles sont les moins chères ? » → « Toutes au même prix : 2 pièces. »
- Maladroit : « 2 pièces ? C'est du vol ! » → « Du vol ?! Va acheter tes fleurs ailleurs ! » (fâchée : elle ne vend plus rien de la journée)

**Basile** (sur la place, sur son échelle) : « Des fleurs ? Je suis coincé sur mon échelle avec ces lampions… 2 pièces le bouquet. »
- ✅ « Attendez, je vous tiens l'échelle ! » → « Ouf, merci ! Tiens, 3 bouquets de mon jardin : cadeau ! » (ensuite 2 pièces le bouquet)
- « Combien de bouquets pour 2 pièces ? » → « Un bouquet, pardi ! »
- « Vos lampions sont magnifiques ! » → « Merci ! Mais c'est 2 pièces quand même. »
- Maladroit : « Dépêchez-vous, je suis pressé ! » → « Je ne vends rien aux gens pressés ! » (fâché)

Ensuite, le Barde choisit combien il achète ; Iris et Basile redeviennent occupés. Les comptes et ce que dit le maire l'après-midi sont inchangés (Bible §13.6 bis : au mieux 11 bouquets et la lanterne, 15 pièces d'or).

### 2.2 Les villageois du matin

**Gaspard** — la boulangerie (ne ment jamais). Salut : « Bonjour ! C'est le coup de feu, mais pour toi, j'ai une minute. »
1. « Et le maire, il est comment ? » — Ruban (maire, étape 1) : « Très fier de ses fêtes ! Il m'a commandé le plus gros gâteau de ma vie. »
2. « Odette est toujours votre première cliente ? » — Enquête : « Une brioche chaque matin. Ce matin, ses chats l'attendaient devant ma porte… tous sauf Moustache, le gros gris. »
3. « Qu'est-ce que vous pensez de la lettre ? » — Enquête : « Odette parle de sa canne, mais pas un mot de ses chats. Elle qui ne parle que d'eux ! »
4. « Votre four est vraiment si vieux ? » — Histoire : « Au fond, ses briques portent des étoiles gravées. Personne ne sait qui les a faites. »

**Margot** — la taverne (ment). Salut : « Bienvenue au Chaudron fêlé ! Ce soir, c'est la fête ! »
1. « Et le maire, il est comment ? » — Ruban (maire, étape 2) : « Il déteste qu'on dise qu'il cache des choses. Un jour, j'ai parlé d'un coffre secret : tout rouge ! »
2. « Odette est vraiment chez sa sœur ? » — Ment, Enquête : « Bien sûr ! Elle m'en parle tout le temps. » Vérité : « Bon… non. Je ne l'ai jamais entendue parler d'une sœur, mais tout le monde était si content… »
3. « Quelle est la plus vieille légende de Brumeval ? » — Histoire : « Celle des Cinq : cinq familles ont bâti le village sur une ville plus vieille. Un jour, leurs enfants reviendront… »
4. « Qu'est-ce qui se prépare pour la fête ? » — Ruban (Mélusine) : « Mélusine coud des banderoles jour et nuit, avec du tissu tout neuf… elle qui n'a jamais un sou ! »

**Victor** — la poste (ment). Salut : « Bonjour ! Une lettre pour toi ? Ah non… »
1. « Et le maire, il est comment ? » — Ruban (maire, étape 3) : « Très ordonné : il compte les papiers de son grand coffre chaque soir. Gare à qui en emprunte un ! »
2. « C'est vous qui avez apporté la lettre d'Odette ? » — Enquête, **code « La lettre n'est pas passée par la poste » pour le Sage** : « Non ! Ni timbre ni tampon. Et en vingt ans, Odette n'a jamais reçu une seule lettre. »
3. « Quel est l'endroit le plus étrange de votre tournée ? » — Histoire : « Le vieux puits. Les jours de brume, j'entends de l'eau couler au fond… alors qu'il est sec depuis cent ans ! »
4. « Vous n'avez jamais peur, pendant votre tournée ? » — Ment, Histoire : « Peur, moi ? Jamais ! » Vérité : « Bon… si : j'ai peur des chats. Et depuis hier, ceux d'Odette me suivent partout en miaulant. Ils ont faim ! »
- Avec l'écoute « le maire et Victor » (§2.4), une question de plus : « Le maire vous a demandé de vous taire ? » → « Oui… Pourquoi cacher d'où vient une lettre qui rassure tout le monde ? »

**Fortuné** — la place (ment ; après le marchandage, c'est un villageois comme les autres). Salut : aucun (il vient de te vendre des fleurs).
1. « Et le maire, il est comment ? » — Ment, le leurre : « Il adore qu'on lui parle de son chapeau neuf ! » Vérité : « Bon… c'est surtout moi qui voudrais lui vendre un chapeau. »
2. « D'où venez-vous, avec votre carriole ? » — Histoire : « De partout ! Je suis le seul à traverser la brume… et elle me regarde, j'en suis sûr. »
3. « Vous avez revu l'homme en cape noire ? » — Ruban (Mélusine) : « Jamais revu. Mais hier soir, une main fine m'a acheté encre et plume, des épingles plantées dans la manche. »
4. « Qu'est-ce que vous vendez de plus précieux ? » — Histoire : « Ça ! Une vieille clé couverte de runes, trouvée dans des ruines au-delà de la brume. Personne n'en veut. » (Dès cette réponse, la clé rouillée entre dans la boutique : 320 pièces.)

**Tim** — sur les toits, il ramone (ment). Salut : « Salut ! Attention, ça tombe ! »
1. « Tu étais sur les toits ce matin, à l'aube ? » — Ment, Enquête : « Non ! Je dormais, comme tout le monde. » Vérité, **code « Le capuchon vers le clocher » pour le Sage** : « Bon… oui. Un grand capuchon a glissé une lettre sous la porte de la mairie, puis il est parti vers le clocher. »
2. « Ça fait quoi, d'être ramoneur ? » — Histoire : « Je vois tout le village ! Et dans une cheminée, j'ai trouvé une pièce avec une lanterne dessinée. »
3. « Comment va Pirate, ton chien ? » — Histoire : « Il ouvre le loquet tout seul ! Mais dès qu'il voit le maire, il file sous mon lit. »
4. « Tu as revu la porte aux runes ? » — Histoire : « Bouchée par les rochers. Mais les mêmes runes sont sur la grille de la crypte ! »

**Le voisin d'Odette** — rue des Lanternes (ne ment jamais). Salut : « Bonjour… Tu viens pour Odette ? »
1. « Les chats d'Odette sont chez vous ? » — Enquête : « Six sur sept, sur ma fenêtre ! Moustache, le gros gris, a disparu hier soir. »
2. « Odette vous a dit qu'elle partait ? » — Enquête : « Odette ne part jamais ! Elle dit toujours : « Mes chats ne savent pas ouvrir les boîtes de sardines. » »
3. « Vous connaissez Odette depuis longtemps ? » — Ruban (le carnet) : « Trente ans ! Elle note tout dans un carnet, un chat à chaque page. Il doit être sur sa table. »
4. « Si on rapporte sa canne, vous la surveillerez ? » — Histoire : « Bien sûr ! Enfin… tant que je ne m'endors pas. »

### 2.3 Occupés le matin

Touchés, ils disent une phrase (la deuxième s'ils reviennent). Ça ne compte pas comme une visite.
- **Mélusine** : « Pas maintenant ! Je viens de coudre ma manche à la banderole de Pompon… » / « Encore toi ? Attention à mes épingles ! Repasse cet après-midi. »
- **Iris** (après la vente) : « Chut ! Je parle à mes fleurs : si je m'arrête, elles fanent. » / « Quarante-sept bouquets à faire ! Plus tard ! »
- **Anselme**, en haut du clocher : « AH, LE BARDE ! VA ME CHERCHER L'ALCHIMISTE : J'AI UN SERVICE À LUI DEMANDER ! » DONG ! / « L'AL-CHI-MISTE ! PAS LE FLEURISTE ! DIS-LUI DE MONTER ME VOIR ! » DONG ! *(changé le 12 novembre, 15 h 39, Bible §13.28 : il veut une tisane de mélisse ; le Barde passe le message à voix haute, sans code. Avant : « QUOI ? JE N'ENTENDS RIEN ! » / « UNE BRIOCHE ? NON MERCI, J'AI DÉJÀ MANGÉ ! »)*
- **Farinel**, tout blanc de farine : « Pas le temps : mon apprenti n'est pas là ! Atchoum ! » / « Regarde-moi : un vrai fantôme de farine ! Reviens cet après-midi. »
- **Silas** : « Halte ! Mission secrète. Si secrète que même moi, je ne la connais pas. » / « Chut ! Je surveille une fourmi très suspecte. »
- **Basile** (après la vente) : « Pas maintenant, j'ai les bras pleins de lampions ! » / « Attention en dessous ! Oups… Reviens cet après-midi. »
- **Le maire**, à la mairie *(ajouté à la construction, le 11 novembre : il lui fallait une place le matin)* : « Mes fleurs d'abord, Barde ! Nous parlerons cet après-midi. » / « Dix bouquets, pas un de moins ! Allez, allez ! »

### 2.4 Aux portes, le matin (Tendre l'oreille)

| Où | Ce qu'on entend | Ce que ça apporte |
| --- | --- | --- |
| La mairie | Le maire : « Si on vous demande d'où vient la lettre, vous ne savez rien. » / Victor : « Mais je ne sais rien, Monsieur le maire. » | Une question de plus chez Victor (§2.2) |
| La boulangerie | Margot : « Je lui ai dit : vous gardez la lettre pour vous ? Il a rougi ! » / Gaspard : « Moi, j'ai vanté sa fête : trois gâteaux de plus ! » | Les indices des étapes 1 et 2 du maire d'un coup |
| La place | La scène de Silas et Fortuné (automatique, §2.1) | Le leurre du chapeau, et l'astuce de la lanterne |
| Rue des Lanternes | Le voisin : « Odette chez sa sœur ? Elle ne m'a jamais parlé d'une sœur. » / Mélusine, tout bas : « Pardon, Odette… » | Mélusine cache quelque chose |
| Le clocher | Anselme : « TIM ! MA CLÉ ÉTAIT PAR TERRE CE MATIN ! » / Tim : « Quelqu'un l'a prise cette nuit, alors… » | Quelqu'un a ouvert la crypte cette nuit |
| L'herboristerie | Iris, seule : « Quelqu'un a pris mes sachets de lavande cette nuit… et mis de la boue partout ! » | La lavande de la lettre vient d'ici |
| Le moulin | Farinel, seul : « Léo ! C'est toi qui as mis de la boue partout ? … Léo ? » | Léo n'est pas là |
| La place | Basile, seul : « Un lampion ici, un lampion là… et un sur ma tête ! » | Pour rire |

## 3. L'après-midi

Le Barde rend ses fleurs, obtient la lettre, pose la canne, fait avouer Mélusine et récolte les indices de la nuit. Léo reste introuvable. Gaspard, Victor, Iris et le voisin sont occupés.

### 3.1 Le maire — la mairie (il ne ment jamais)

Accueil : « Ah, Barde ! Alors, mes fleurs ? » Il compte les bouquets :
- 10 ou 11 : « Bravo ! Voici 10 pièces d'or pour ta peine. »
- 9 : « Il en manque un ! Bien mauvais négociateur… La fête sera belle quand même. » (5 pièces)
- 5 à 8 : « Il manque des fleurs, mais la fête sera jolie quand même. » *(5 ajouté à la construction)*
- 4 et moins : « Si peu ?! C'est une fête ou un enterrement ? » *(0 à 2 ajoutés à la construction)*
- En plus, la lanterne : « Une lanterne… comme celle que… Euh. Parfait : ce sera le clou de la fête ! » (+5 pièces ; le lapsus est un indice)

Ses 4 questions :
1. « D'où vient cette lettre, Monsieur le maire ? » — Enquête : « Glissée sous la porte de la mairie, ce matin. Quel soulagement, n'est-ce pas ? »
2. « Pourquoi une fête, alors qu'Odette n'est pas rentrée ? » — Histoire : « Un village rassuré ne pose plus de questions. Euh… un village rassuré est un village heureux ! »
3. « Vous connaissez Odette depuis longtemps ? » — Histoire : « Depuis toujours : nos deux familles sont là depuis la fondation. Il n'en reste plus beaucoup. »
4. « Je voudrais vous parler de la lettre… » → le grand dialogue.

**Le grand dialogue de la lettre.** Un mauvais choix, toujours la même réplique : « Bien, bien… J'ai beaucoup à faire. Revenez plus tard. » (la porte reste fermée jusqu'au moment suivant).

Étape 1 (indice : Gaspard). Le maire : « Oui ? »
- ✅ « Quelle belle fête vous préparez pour Odette ! » → « N'est-ce pas ? Les lampions, le gâteau, les fleurs… Que puis-je pour vous ? »
- « Quel beau discours vous avez fait ce matin ! »
- « Votre mairie est vraiment très bien rangée ! »
- « Votre chapeau neuf vous va très bien ! » (le leurre de Fortuné)

Étape 2 (indice : Margot). « Que puis-je pour vous ? »
- « Les enfants voudraient voir l'écriture d'Odette, pour être rassurés. »
- « Je voudrais recopier ses mots, pour les chanter à la fête. »
- ✅ « Certains disent que vous gardez la lettre pour vous… Moi, je suis sûr que c'est faux ! » → « Bien sûr que c'est faux ! Tenez, la voilà… Mais vous me la rendez quand ? »
- « Odette est ma grande amie : j'aimerais lire ses mots moi-même. »

Étape 3 (indice : Victor). « Mais vous me la rendez quand ? »
- ✅ « Je vous la rapporte avant ce soir, promis. » → « Avant ce soir, c'est bien compris ? » → **code « La lettre d'Odette » pour le Sage et l'Alchimiste**.
- « Demain matin, à la première heure. »
- « Le Sage la rangera précieusement dans son Grand Livre. »
- Le piège : « Je peux la recopier ici, devant vous ? » → « Mais bien sûr, recopiez donc ! » (le Barde repart avec une copie de sa propre écriture ; le Sage : « C'est ton écriture à toi, ça ! »)

En partant, toujours : « Et ce soir, tout le monde sur la place jusqu'à minuit ! »

Si le Barde rate : le Pisteur peut prendre la lettre en se cachant dans la mairie ; et sinon, le filet du Sage (`E3-actions-des-roles.md`, Sage, l'après-midi).

### 3.2 La maison d'Odette (2, rue des Lanternes)

Une visite, sans questions : « Tu poses la canne contre la porte. Sur la table, le carnet d'Odette. Par terre, du lait renversé… et des petites traces qui filent dehors ! »
→ **code « Le carnet d'Odette » pour le Sage et l'Alchimiste** ; **code « Les traces de Moustache » pour le Pisteur**. (Le plan des Fondateurs est caché dans la couverture du carnet : c'est le Sage qui le trouve, pas le Barde.)

### 3.3 Les villageois de l'après-midi

**Margot** — la taverne (ment)
1. « Vous connaissez bien Léo, l'apprenti ? » — Ruban (Léo, étape 2) : « Il n'a pas de parents. C'est Odette qui lui a appris à lire, le soir. »
2. « Le maire vous a demandé quelque chose pour ce soir ? » — Ment, Enquête : « Non, rien du tout ! Juste servir la soupe. » Vérité : « Bon… si : garder tout le monde sur la place jusqu'à minuit. Il avait l'air si sérieux… »
3. « Vous avez entendu du bruit, la nuit dernière ? » — Enquête : « Vers minuit, une petite lumière bougeait dans la forêt, du côté du vieux puits. J'ai fermé mes volets ! »
4. « Qui étaient les Cinq familles ? » — Histoire : « Ma grand-mère ne disait pas leurs noms. Seulement : « une pour chercher, une pour soigner, une pour parler, une pour savoir… et une pour garder. » »

**Fortuné** — la place (ment)
1. « Vous connaissez Léo, l'apprenti du meunier ? » — Ment, le leurre : « Il adore l'or ! Propose-lui une pièce, il te dira tout. » Vérité : « Bon… c'est moi qui adore l'or. Lui, il a peur : il m'a acheté deux lanternes et une corde en tremblant. »
2. « Elle vous plaît, la fête ? » — Histoire : « Tous mes lampions vendus ! Sauf un qui ne s'allume pas… »
3. « Vous traversez la brume, cette nuit ? » — Histoire : « Jamais ! Les nuits de fête, la brume colle au village comme un chat à son coussin. »
4. « D'où vient votre vieille clé rouillée ? » — Histoire : « Des ruines, au-delà de la brume. Il y a les mêmes dessins que sur ta lanterne… enfin, ma lanterne ! »

**Tim** — sur les toits (ment). *(Ses deux questions sur le clocher sont retirées : Bible §13.14.)*
1. « Tu connais Léo ? » — Ruban (Léo, étape 3) : « L'autre jour, il m'a chuchoté : « Si on sait que je t'ai parlé, je suis fichu. Il a des yeux partout. » »
2. « C'est toi qui as pris la lavande d'Iris ? » — Ment, Enquête : « Moi ? Jamais de la vie ! » Vérité : « Bon… un sachet, pour Pirate : il sent le chien mouillé. Mais cette nuit, quelqu'un en a pris tout un panier ! »
3. « Qu'est-ce que tu vois, du haut des toits ? » — Enquête : « Des lampions partout ! Et Mélusine qui coud, qui coud… Elle a les yeux tout rouges. »
4. « Tu viens à la fête, ce soir ? » — Histoire : « Évidemment : un gâteau à sept étages ! Mais à minuit, loin du clocher : la Grosse Marie, ça casse les oreilles. »

**Mélusine** — son atelier, elle coud les banderoles (ment)
1. « Vous avez entendu la lettre d'Odette ? » — Ment : « De loin… Je ne sais rien de cette lettre, moi ! » Vérité : « Bon… si. » (les larmes aux yeux) « Je ne peux pas en dire plus. Pas maintenant. »
   - **Avec le code « L'écriture de Mélusine »** (de l'Alchimiste), cette question devient : « C'est votre écriture, sur la lettre d'Odette. » — Ment, Enquête : « Mon écriture ? Tout le monde écrit comme ça, à Brumeval ! » Vérité, **code « L'aveu de Mélusine » pour le Sage** : « C'est moi… Un homme en cape m'a payée pour l'écrire, mot pour mot. Voix étouffée, odeur de lavande. Il revient quand la Grosse Marie sonnera. »
2. « Pourquoi Odette part-elle toujours avec sa canne ? » — Enquête : « Je la lui ai offerte, avec sept chats gravés. Elle ne la quitterait pour rien au monde. »
3. « Vous avez acheté du beau tissu neuf ? » — Ment, Enquête : « Ce vieux tissu ? Il traînait dans mon grenier ! » Vérité : « Bon… je l'ai acheté hier, avec de l'or qu'on m'a donné. Ne me demande pas qui. »
4. « Qu'est-ce que vous cousez pour la fête ? » — Histoire : « Une banderole par chat : Moustache, Biscotte, Pompon, Caramel, Mistigri, Noisette, Grisette. Moustache retrouve toujours Odette. »
- **Le filet** : si l'aveu n'est pas obtenu l'après-midi (mensonge raté), Mélusine craque toute seule à la fête, la nuit (§4.3).

**Anselme** — le clocher (ne ment jamais ; un peu sourd, il parle fort). Salut : « HEIN ? AH, C'EST TOI ! »
1. « Vous m'entendez bien, Anselme ? » — Ruban (Anselme, étape 1) : « HEIN ? Ah ! Parle-moi FORT et LEN-TE-MENT. Et ne me presse jamais : quand on me presse, je n'entends plus rien ! »
2. « Qu'y a-t-il sous le clocher ? » — Ruban (la clé) : « La crypte des Fondateurs, fermée à clé. Quand je sonne, je pends la clé au clou, près de la corde. »
3. « Comment s'appellent vos cloches ? » — Ruban (la Grosse Marie) : « Bertille, Gontran et la Grosse Marie. Mon père disait : « Quand la brume s'épaissit, sonne la Grosse Marie : elle la fait reculer. » »
4. « Que ferez-vous pendant la fête ? » — Enquête : « L'ouverture, puis la Grosse Marie à minuit PILE. Le maire y tient tellement… je me demande pourquoi ! »

**Farinel** — le moulin (ment)
1. « Où est Léo, votre apprenti ? » — Enquête : « Pas dormi au moulin, des bottes pleines de boue, et ce mot : « Ne m'attendez pas ce soir. » »
2. « Léo est un bon apprenti ? » — Ruban (Léo, étape 1), **épingle le signe de Léo** : « Un froussard : quand il a peur, il se ferme comme une huître. Parle-lui doucement… et voilà son truc pour mentir, je te l'épingle. »
3. « Vous viendrez à la fête, ce soir ? » — Ment : « Bien sûr ! Je danserai toute la nuit ! » Vérité : « Bon… je vais dormir. Je m'endors toujours avant le dessert. »
4. « Votre moulin est vraiment si vieux ? » — Histoire : « Le plus vieux de Brumeval ! Une pierre du mur porte une lanterne gravée. »

**Silas** — le garde champêtre (ne ment pas : il croit à l'éboulement)
1. « Vous gardez encore le chemin du Vieux Chêne ? » — Histoire : « Ordre du maire : danger d'éboulement ! Et ce soir, je garde la fête. »
2. « C'est vous qui avez emmené Bastien en prison ? » — Enquête : « Oui, et il pleurait. Un homme en cape l'a payé : il en a plus peur que de la prison. »
3. « Vous avez fait votre ronde, cette nuit ? » — Enquête : « Je n'ai rien vu… sauf la porte du clocher qui grinçait. Le vent, sûrement. »
4. « Pourquoi êtes-vous devenu garde ? » — Ruban (Anselme, étape 3) : « Petit, je me suis perdu trois jours dans la brume. Le père d'Anselme m'a retrouvé en sonnant toute la nuit. »

**Basile** — sur la place (ne ment jamais)
1. « Vous décorez la place pour la fête ? » — Enquête : « La fête jusqu'à minuit : le maire n'a jamais fait ça ! »
2. « Anselme est quelqu'un de gentil ? » — Ruban (Anselme, étape 2) : « Bourru, mais gentil. Il ne prête rien… sauf à ceux qui l'aident à sonner la Grosse Marie : elle est si lourde ! »
3. « Vous connaissez le vieux puits ? » — Histoire : « Sa grille est rouillée depuis toujours. Mon grand-père disait qu'au fond, il y a une porte. » *(« Sa grille est » ajouté à la construction, le 11 novembre : sans la question, on ne comprenait pas.)*
4. « Quelle est votre fleur préférée ? » — Histoire : « La pensée sauvage : elle pousse même dans la brume. Les Alchimistes d'autrefois en mettaient dans toutes leurs potions. »

### 3.4 Occupés l'après-midi

- **Gaspard** : « Pas maintenant, j'ai sept étages de gâteau qui penchent ! » / « Si je lâche ma poche à douille, tout s'écroule ! »
- **Victor** : « Cent invitations à distribuer : pas une minute ! » / « Le maire ne les a même pas écrites lui-même : « écriture de patte de mouche », qu'il dit ! »
- **Iris** : « Chut ! Je fais les couronnes de ce soir. » / « Si c'est pour des fleurs, d'accord. Sinon, à ce soir ! » — s'il reste de l'argent, une seule question : « Je voudrais des fleurs pour la fête. » (au prix obtenu le matin, ou le marchandage s'il n'est pas encore passé)
- **Le voisin d'Odette** : « Pas maintenant : les six chats ont faim, ils me griffent les mollets ! » / « Je surveille la maison d'Odette. Repasse ce soir. »

### 3.5 Aux portes, l'après-midi

| Où | Ce qu'on entend | Ce que ça apporte |
| --- | --- | --- |
| Devant la mairie | Le maire : « Ce soir, personne ne quitte la place avant minuit. Personne ! » / Silas : « Et ceux qui veulent dormir ? » / Le maire : « Ils dormiront… après minuit. » | La tension |
| La taverne | Gaspard : « S'il me commande un étage de plus, je dors dans mon four ! » / Margot : « Et moi, la soupe jusqu'à minuit… Il n'a jamais fait ça ! » | L'ambiance |
| L'herboristerie | Iris : « Tu as les yeux rouges… et tu sens la lavande, comme tout le village ! » / Mélusine : « C'est le fil. J'ai trop cousu. » | Mélusine cache quelque chose ; la lavande ne prouve rien |
| Au pied du clocher | Basile : « Je t'aide à sonner, ce soir ? » / Anselme : « UN PAIN AUX RAISINS ? » / Basile : « JE-T'AI-DE-À-SON-NER ! » / Anselme : « Non, je sonne seul. Sauf si on me le demande… lentement ! » | Le coup de pouce pour Anselme |
| Devant le vieux puits | Victor, seul : « Une lueur au fond d'un puits sec… Je n'y passerai pas ce soir ! » | Une graine pour le puits (s'il sert un jour) |
| La boulangerie | Le maire : « Le gâteau à minuit pile, Gaspard. Pas une minute avant ! » / Gaspard : « Mais pourquoi minuit ? » / Le maire : « Parce que c'est l'heure, voyons. » | L'indice pour retenir le maire, la nuit (§4.5) |

(Retirée le 11 novembre : l'écoute de Tim et du voisin, « ça miaule sous le clocher ».)

## 4. La nuit

Tout le village est à la fête sur la place. Il manque Léo (introuvable), Anselme (au clocher) et le voisin (il veille chez lui). Pour le Barde, dans l'ordre : Anselme et la clé ; pendant le donjon, la Grosse Marie et le maire à retenir, la fête et ses écoutes ; à la fin, Léo.

### 4.1 Anselme et la clé (au clocher, avant l'ouverture de la fête)

Ses 4 questions :
1. « Vous êtes prêt pour minuit ? » — Enquête : « Le maire est venu me le redire trois fois : la Grosse Marie à minuit PILE ! »
2. « Vous n'allez pas à la fête ? » — Histoire : « Les sonneurs ne dansent pas, mon petit : ils sonnent ! »
3. « Vous avez entendu du bruit dans la crypte ? » — Enquête : « Je n'entends plus rien ! Mais tout à l'heure, la corde de la Grosse Marie a tremblé toute seule… »
4. « Je voudrais vous demander quelque chose… » → le grand dialogue.

Un mauvais choix : un malentendu de vieux sourd, puis toujours « Bon, je monte sonner, moi. Bonne fête ! » (la clé reste à sa ceinture).

Étape 1 (indice : Anselme lui-même). « Hein ? Ah, le Barde ! Qu'est-ce que tu me veux ? »
- « Une toute petite question, ça ne prendra qu'une seconde ! » → « UNE SECONDE CLOCHE ? La Grosse Marie suffit bien ! »
- « Pardon de vous déranger, Monsieur Anselme… » (tout bas) → « UN HARENG ? Je n'ai pas faim, mon petit ! »
- ✅ « BON-SOIR, AN-SEL-ME ! J'AI TOUT MON TEMPS. JE PEUX VOUS PAR-LER ? » → « Enfin quelqu'un qui parle comme il faut ! Alors, qu'est-ce qui t'amène ? »
- « Vite, Anselme, minuit approche ! » → « UNE VIS ? Demande à Basile ! »

Étape 2 (indice : Basile). « Alors, qu'est-ce qui t'amène ? »
- « Je vous apporte un morceau du gâteau de Gaspard ? » → « UN CHAPEAU ? Il fait des chapeaux, le boulanger ? »
- « Je pourrais jeter un œil à la crypte ? » → « UNE CRÊPE ? À cette heure-ci ? »
- ✅ « LA GROSSE MARIE EST SI LOURDE… JE PEUX VOUS AIDER À LA SONNER ? » → « M'aider ? Personne ne me l'a proposé depuis des années… Dis-moi pourquoi, ce soir. »
- « Vous êtes en pleine forme, ce soir ! » → « EN PLEINE FORÊT ? Je suis au clocher, voyons ! »

Étape 3 (indice : Silas). « Dis-moi pourquoi, ce soir. »
- « Parce que c'est la fête, et que j'adore les cloches ! » → « TU ADORES LES BROCHES ? Demande à Mélusine ! »
- « Parce que le maire veut que tout soit parfait. » → « LE MAIRE VEUT UNE PAIRE ? De chaussettes ? »
- ✅ « VOTRE PÈRE A SONNÉ TOUTE UNE NUIT POUR RAMENER SILAS. CE SOIR, ODETTE AUSSI EST PERDUE… » → il essuie une larme. « Alors on la sonne pour Odette. Monte, mon petit ! »
- « J'aimerais apprendre le métier de sonneur. » → « DE SAUTEUR ? Je suis bien trop vieux pour sauter ! »

**Réussite** : « Anselme pend sa clé au clou. Vous tirez la corde ensemble : DONG ! DONG ! Il ferme les yeux et compte les coups… » → **code « La clé est au clou » pour le Pisteur**, qui se cache dans le clocher pour la décrocher.

**Échec** : « Bon, je monte sonner, moi. Bonne fête ! » Puis, tout de suite, Tim depuis les toits : « Psst, Barde ! Moustache vient de filer dans le vieux puits, entre les barreaux ! » → **code « Le vieux puits » pour le Pisteur** (le puits apparaît sur sa carte). *Si c'est le Pisteur qui se fait voir dans le clocher, le puits lui apparaît sur sa propre tablette : le Barde n'a rien à faire.*

### 4.2 La Grosse Marie (au clocher, pendant le donjon)

**Le but** : faire sonner la Grosse Marie avant minuit. Sous la terre, la brume recule, et les trois héros du donjon retrouvent toute leur vie. Anselme ne veut pas : « À minuit PILE, ordre du maire ! » Il faut trois indices, récoltés à la fête (§4.3 : Fortuné, Silas, Margot), en plus de ce qu'Anselme a dit l'après-midi (son père et la brume).

Dès que le Barde a donné « La clé est au clou » ou « Le vieux puits », Anselme a une question de plus :
- « Anselme, il faut sonner la Grosse Marie, maintenant ! » → le grand dialogue.

Étape 1 (indices : Anselme l'après-midi, et Fortuné à la fête). Anselme : « LA GROSSE MARIE ? À minuit pile, ordre du maire ! Pourquoi maintenant ? »
- « Parce que la fête s'ennuie un peu ! » → « LA FÊTE S'ENNUIE ? Qu'elle danse ! »
- ✅ « LA BRUME MONTE, ANSELME ! VOTRE PÈRE DISAIT : QUAND ELLE S'ÉPAISSIT, SONNE LA GROSSE MARIE. » → il regarde par la lucarne. « Ma parole… on ne voit plus le moulin. Mais le maire va être furieux ! »
- « Pour réveiller Farinel, qui dort sur le buffet ! » → « DE LA FARINE ? J'en ai plein les poches ! »
- « Parce que minuit est passé ! » → « PASSÉ ? Mon horloge dit dix heures, mon petit ! »

Étape 2 (indice : Silas). « Mais le maire va être furieux ! »
- « Le maire est d'accord : il me l'a dit lui-même ! » → « LE MAIRE ? Il m'a dit minuit pile trois fois ce soir ! »
- ✅ « LE VIEUX RÈGLEMENT : QUAND LA BRUME MONTE, LE SONNEUR SONNE. MÊME LE MAIRE N'Y PEUT RIEN. » → « Le vieux règlement… Silas te l'a dit, hein ? C'est vrai. Mais toi, pourquoi tu y tiens tant ? »
- « Le maire ne s'en rendra même pas compte. » → « PAS COMPTE ? Tout le village va l'entendre ! »
- « On s'en moque, du maire ! » → « ON NE SE MOQUE PAS DU MAIRE, MON PETIT ! »

Étape 3 (indice : Margot). « Mais toi, pourquoi tu y tiens tant ? »
- « Pour que la fête soit encore plus belle ! » → « ELLE EST DÉJÀ BELLE, LA FÊTE ! »
- « Parce que j'adore votre cloche ! » → « TU ADORES LE COCHON ? Moi aussi, en rôti ! »
- ✅ « MES AMIS SONT SOUS LA TERRE, DANS LA BRUME. LA GROSSE MARIE PEUT LES PROTÉGER. » → Anselme pâlit. « Sous la terre ?! » Il crache dans ses mains. « Alors on sonne. Fort. Très fort ! »
- « C'est un secret, je ne peux rien dire. » → « UN SECRET ? Pas de secret avec Anselme ! »

**Réussite** : « DONG… DONG… La Grosse Marie fait trembler tout le village. Sous la terre, la brume recule. » → **code « La Grosse Marie » pour le Pisteur** : une seule fois, hors combat ; toute la vie des trois héros revient. C'est l'équipe qui dit au Barde quand l'envoyer (« On est à plat ! »).
**Échec** : « Bon, tu m'embrouilles. À minuit, comme prévu ! » **Une deuxième chance, une seule** : le Barde peut revenir plus tard ; les mauvaises réponses déjà essayées ont disparu.
*(Note pour nous : la Grosse Marie sonnée avant minuit inquiète le maire : son troisième petit dialogue prend la variante A, §4.4.)*

### 4.3 La fête (une visite, une réplique)

Ça ne coûte rien. Trois répliques sont les indices de la Grosse Marie, une celui du maire.
- **Gaspard** (indice : retenir le maire, 1) : « Sept étages et sept chats en pâte d'amande ! À minuit, il me faudra des bras pour le porter. »
- **Margot** (indice : la Grosse Marie, étape 3) : « Anselme ferait tout pour un ami. Mais ne lui raconte jamais d'histoires : il les sent de loin ! »
- **Fortuné** (indice : la Grosse Marie, étape 1) : « Regarde : la brume monte dans les rues ! On ne voit déjà plus le moulin. »
- **Silas** (indice : la Grosse Marie, étape 2, et retenir le maire, 3A) : « Article premier du vieux règlement : quand la brume monte, le sonneur sonne, et tout le monde reste sur la place. Même le maire ! »
- **Victor** : « Je danse ! Enfin, j'essaie. »
- **Tim** : « Chut ! Je suis monté en haut du mât des lampions. »
- **Mélusine** : « Il a dit qu'il reviendrait à minuit… » Elle se tait. « Non, rien. Bonne fête. »
  - **Le filet** (si son aveu n'a pas été obtenu l'après-midi) : « Je n'en peux plus… C'est moi qui ai écrit la lettre, sous la dictée d'un homme en cape. Il revient à minuit ! » → code « L'aveu de Mélusine » pour le Sage.
- **Iris** : « Ça sent la lavande… ah non, c'est Silas : il en met dans ses bottes ! »
- **Farinel** : « Je ne dors pas, je repose mes yeux ! »
- **Basile** : « Les lampions tiennent ! Je n'en reviens pas moi-même. »
- **Le maire** : sa première réplique ouvre « Retenir le maire » (§4.4).

### 4.4 Retenir le maire (pendant le donjon)

Trois des héros manquent à la fête, et le maire le remarque. Trois fois, il veut savoir où ils sont ou aller voir du côté du clocher. Trois petits dialogues d'une étape (4 choix, un seul essai chacun), **au rythme du Barde, sans minuteur** : le premier dès que le Barde a donné « La clé est au clou » ou « Le vieux puits » (le maire porte un « ! » sur la carte) ; chacun des suivants après le précédent et une autre visite à la fête.

**1. « Où sont passés vos amis ? »** — Le maire : « Barde ! Je ne vois pas vos trois amis. Où sont-ils passés ? »
- « Ils sont allés se coucher. » → « Se coucher ? Personne ne part avant minuit ! Je vais voir ça… »
- ✅ « Ils aident Gaspard à porter le gâteau : sept étages, ça pèse ! » → « Ah ! Très bien, très bien. Ce gâteau sera magnifique. »
- « Je ne sais pas, Monsieur le maire. » → « Vous ne savez pas ? Hmm… » Il regarde vers le clocher.
- « Ils sont au clocher, avec Anselme. » → « AU CLOCHER ?! »

**2. « Je vais dire deux mots à Anselme. »** — Le maire : « Je vais monter dire deux mots à Anselme. Rien ne doit rater, ce soir. »
- ✅ « Monsieur le maire, tout le village réclame votre discours ! » → Il redresse son chapeau. « Mon discours ? Bon… le village a besoin de moi. »
- « Anselme dort, il ne faut pas le réveiller. » → « Il dort ?! Alors il ne sonnera jamais minuit ! J'y vais ! »
- « Votre chapeau neuf est magnifique ! » → « Je le déteste, ce chapeau. Laissez-moi passer. »
- « Je viens avec vous ! » → « Non, non. Restez ici. » Il part seul.

**3, variante A (la Grosse Marie a sonné avant minuit).** — Le maire : « La Grosse Marie ? Déjà ?! Qui a osé… »
- ✅ « Le vieux règlement, Monsieur le maire : quand la brume monte, tout le monde reste sur la place. » → Silas : « Article premier ! » Le maire serre les dents. « … Bien. Restons. »
- « C'est sûrement le vent. » → « Le vent ne sonne pas les cloches ! »
- « C'est moi qui l'ai demandé à Anselme. » → « VOUS ?! »
- « C'est pour la fête ! C'est joli, non ? » → « Joli ? Il fallait attendre minuit ! »

**3, variante B (la Grosse Marie n'a pas sonné).** — Le maire : « Il est presque minuit. Je dois aller vérifier quelque chose… »
- ✅ « Et le gâteau ? Il se coupe à minuit pile, et c'est vous qui le coupez ! » → « Le gâteau ! Mais oui, mais oui… Je ne bouge pas. »
- « Allez-y, je surveille la fête pour vous. » → « Merci, Barde. » Il s'éloigne.
- « Il n'est pas encore minuit ! » → « Justement. » Il s'éloigne.
- « Restez, il fait froid dehors. » → « Je ne suis pas frileux. » Il s'éloigne.

**Le résultat** : au moins deux sur trois → « Le maire ne quitte plus la place. » → **code « Le maire est retenu » pour le Pisteur**, à taper avant la dernière salle du donjon. Moins de deux : « Le maire s'éloigne vers le clocher… » Pas de code : dans la dernière salle, le maire arrive trop tôt (§4.7).

### 4.5 Aux portes, la nuit

Rien chez ceux qui dorment ou ne sont pas là.
| Où | Ce qu'on entend | Ce que ça apporte |
| --- | --- | --- |
| Près du gâteau | Le maire : « Que personne n'approche du clocher avant minuit. » / Silas : « Même pas Anselme ? » / Le maire : « Anselme n'entend rien et ne voit rien. C'est parfait. » | Un soupçon sur le maire (il ne ment pas) |
| Sous les banderoles | Iris : « Tu trembles, Mélusine. » / Mélusine : « Il viendra chercher sa réponse à minuit. Je n'écrirai plus jamais pour lui. » | Mélusine a écrit pour l'homme en cape |
| Au buffet | Farinel : « Léo a écrit sur mon pétrin : « Ne m'attendez pas. Je descends. » » / Gaspard : « Il descend ? Où ça ? » | Léo est sous terre |
| Au pied du mât | Tim : « Six chats d'Odette attendent devant la crypte. Moustache, lui, est déjà dedans. » / Victor : « Dedans ? Brrr… » | Moustache est sous le clocher |

### 4.6 La Lanterne du veilleur (objet du Barde, une fois par enquête)

Chez le voisin d'Odette, qui veille : « Entre ! Avant la fête, un grand gaillard aux bottes énormes a pris la canne d'Odette et filé vers le clocher. Puis un homme en cape est entré à la mairie, comme chez lui. »

### 4.7 Léo (dans la crypte, à la fin du donjon)

Le Barde reçoit **« Léo attrapé »** du Pisteur ; le grand dialogue commence tout de suite, sans questions. Léo ment d'entrée (signe épinglé par Farinel) : « Laissez-moi partir ! Je cherchais juste un chat perdu ! » Vérité : « Bon… je descends tous les soirs. On me l'a demandé. Je ne peux pas dire qui. » (Le dialogue continue même si ce mensonge n'est pas démasqué.) Un mauvais choix : Léo se ferme, et on passe à la fin des étapes déjà réussies.

Étape 1 (indice : Farinel). « Qu'est-ce que vous me voulez ? »
- « Léo, tu vas tout nous dire, et tout de suite ! » → Il croise les bras.
- « Je mène l'enquête sur la lettre d'Odette. » → « L'enquête ?! » Il devient tout blanc.
- ✅ « Chut… personne ne va te faire de mal. Prends ton temps, Léo. » → Il s'assoit à son tour. « … D'accord. Qu'est-ce que vous voulez savoir ? »
- « Les gardes arrivent, Léo. Parle vite ! » → Il regarde l'escalier, muet.

Étape 2 (indice : Margot ; le leurre : Fortuné). « Qu'est-ce que vous voulez savoir ? »
- « Où est Odette ? Dis-le ! » → Il baisse la tête.
- « Je te donne une pièce d'or si tu me dis tout. » → « C'est avec de l'or qu'on m'a eu. Plus jamais. »
- ✅ « Odette t'a appris à lire. Tu crois qu'elle mérite d'être enfermée ? » → Les larmes aux yeux : « Elle va bien, je lui apporte à manger tous les soirs. Mais si je parle, il le saura. »
- « Tu sais que tu risques la prison, comme Bastien ? » → Il pâlit, muet.

Étape 3 (indice : Tim). « Si je parle, il le saura. »
- « On ira tout raconter au maire : il te protégera. » → « Au maire ?! Surtout pas ! »
- ✅ « Personne ne saura jamais que c'est toi qui as parlé. C'est promis, Léo. » → l'aveu complet.
- « Silas veille sur le village, tu ne risques rien. » → « Silas ne voit jamais rien. »
- « Pars avec Fortuné, au-delà de la brume. » → « Et laisser Odette toute seule ? Jamais. »

**Les fins** :
- **Aucune étape** : il bondit, renverse la lanterne et file dans le noir. On entend ses grandes bottes s'éloigner.
- **Une étape** : « Elle est vivante. C'est tout ce que je peux dire. » Il file dans le noir.
- **Deux étapes** : « Elle est sous le clocher, je lui apporte à manger. Je ne dirai rien de plus. » Il reste assis, la tête dans les mains.
- **Trois étapes** (+10 pièces d'or) : « Elle est derrière la porte aux quatre signes. Je passe la soupe par une trappe : je n'ai pas de clé. L'homme en cape a une bague à tête de corbeau… et les clés de tout le village. » *(La seule réponse au-delà de 30 mots : c'est la révélation de l'enquête.)*
- **Le maire arrive trop tôt** (le Pisteur n'a pas tapé « Le maire est retenu ») : le Barde reçoit **« Léo s'est enfui »** à la place de « Léo attrapé » : « Des pas descendent l'escalier de la crypte. Léo blêmit, renverse sa lanterne et file dans le noir, sans un mot. » Pas de grand dialogue.

Dans tous les cas, on passe ensuite à l'accusation : l'enquête n'est jamais bloquée.

### 4.8 La scène finale (toutes les tablettes, après l'accusation)

DONG… DONG… La Grosse Marie sonne minuit. Des pas dans l'escalier de la crypte, des lanternes : le maire, avec Silas et deux gardes.
- Léo a tout avoué : il regarde Léo, longtemps. « Toi… tu as beaucoup trop parlé, mon garçon. »
- Léo a avoué à moitié : « Léo. Rentre au moulin. Tout de suite. » Léo file sans un mot.
- Léo s'est enfui (ou le maire est arrivé trop tôt) : « Tiens, tiens… Nos petits enquêteurs, dans la crypte des Fondateurs, en pleine nuit. »

Puis pour tous : il retire lentement ses gants. À son doigt, une bague à tête de corbeau. « Vous êtes allés trop loin. Beaucoup trop loin. » Silas, bouche bée : « Monsieur le maire… ? » « Gardes ! Enfermez-les ! » Dernière image : le cachot de la mairie, le héros de la tablette derrière les barreaux, les trois autres en ombres ; une plume noire se pose devant la grille. L'enquête 4 commencera là. (Personne n'est blessé, Odette va bien, Silas est aussi surpris que les héros.)

## 5. Les codes du Barde

| Moment | Code | De → pour | Où |
| --- | --- | --- | --- |
| Matin | La lettre n'est pas passée par la poste | Barde → Sage | Victor, question 2 |
| Matin | Le capuchon vers le clocher | Barde → Sage | Tim démasqué, question 1 |
| Après-midi | La lettre d'Odette | Barde → Sage, Alchimiste | le grand dialogue du maire |
| Après-midi | Le carnet d'Odette | Barde → Sage, Alchimiste | la maison d'Odette |
| Après-midi | Les traces de Moustache | Barde → Pisteur | la maison d'Odette |
| Après-midi | L'écriture de Mélusine (reçu) | Alchimiste → Barde | ouvre la question « C'est votre écriture… » |
| Après-midi | La crypte est fermée (reçu) | Pisteur → Barde | il faudra la clé d'Anselme |
| Après-midi | L'aveu de Mélusine | Barde → Sage | Mélusine démasquée (ou le filet de la nuit) |
| Nuit | La clé est au clou | Barde → Pisteur | Anselme réussi |
| Nuit | Le vieux puits | Barde → Pisteur | Anselme raté (Tim) |
| Nuit | La Grosse Marie | Barde → Pisteur | la Grosse Marie réussie (une fois, hors combat) |
| Nuit | Le maire est retenu | Barde → Pisteur | au moins 2 sur 3 (avant la dernière salle) |
| Nuit | Léo attrapé, ou Léo s'est enfui (reçu) | Pisteur → Barde | la dernière salle du donjon |
| Nuit | Ce que Léo a avoué (à voix haute) | Barde → Sage | l'accusation (facultatif) |

## 6. Les rubans (qui donne l'indice de quoi)

| Grand dialogue | Étape | Qui donne l'indice | Ce que ça dit |
| --- | --- | --- | --- |
| Le maire (après-midi) | 1 | Gaspard (ou l'écoute de la boulangerie) | Il est très fier de ses fêtes |
| Le maire | 2 | Margot (ou l'écoute de la boulangerie) | Il déteste qu'on dise qu'il cache des choses |
| Le maire | 3 | Victor | Il compte ses papiers chaque soir |
| Le maire | leurre | Fortuné, qui ment | Le chapeau neuf |
| Anselme (nuit) | 1 | Anselme | Lui parler fort et lentement, sans le presser |
| Anselme | 2 | Basile (et l'écoute du clocher) | Il ne prête rien, sauf à qui l'aide à sonner |
| Anselme | 3 | Silas | Le père d'Anselme l'a retrouvé en sonnant toute la nuit |
| Anselme | la clé | Anselme | Quand il sonne, la clé pend au clou |
| La Grosse Marie (nuit) | 1 | Anselme l'après-midi + Fortuné à la fête | « Quand la brume s'épaissit, sonne la Grosse Marie » ; la brume monte ce soir |
| La Grosse Marie | 2 | Silas à la fête | Le vieux règlement : le sonneur sonne, même le maire n'y peut rien |
| La Grosse Marie | 3 | Margot à la fête | Il ferait tout pour un ami, mais ne lui raconte jamais d'histoires |
| Retenir le maire | 1 | Gaspard à la fête | Il faudra des bras pour porter le gâteau |
| Retenir le maire | 2 | Gaspard le matin | Le maire est fier de ses fêtes (son discours) |
| Retenir le maire | 3A | Silas à la fête | Tout le monde reste sur la place quand la brume monte |
| Retenir le maire | 3B | l'écoute de la boulangerie (après-midi) | Le gâteau se coupe à minuit pile |
| Léo (nuit) | 1 | Farinel | Il se ferme comme une huître : lui parler doucement |
| Léo | 2 | Margot | Odette lui a appris à lire |
| Léo | 3 | Tim | Il a peur de quelqu'un qui « a des yeux partout » |
| Léo | leurre | Fortuné, qui ment | « Propose-lui une pièce d'or » |
| Mélusine (après-midi) | — | Margot, Fortuné, l'écoute de la rue des Lanternes | Du tissu neuf, une main fine aux épingles, « Pardon, Odette » |
| Le carnet | — | Le voisin | Le carnet est sur la table d'Odette |

## 7. Les talents et les objets du Barde

Inchangés (Bible §13.9 : Tendre l'oreille ou Exige la vérité ; 8 objets de 70 à 115 pièces et la clé rouillée à 320). Ce que les objets changent :
- **Boussole des confidences** : le matin, elle montre Victor ; l'après-midi, Basile ; la nuit, Anselme (avant l'ouverture), puis Silas (pour la Grosse Marie).
- **Carte de visite** : les 4 questions d'un villageois au même moment.
- **Lettre de recommandation** : l'étiquette Enquête ou Histoire sur 4 questions.
- **Lanterne du veilleur** : le seul objet qui crée un dialogue (§4.6).
- **Chapeau de politesse** : marche aussi dans les petits dialogues du maire de la nuit (un mauvais choix ne compte pas).

## 8. Quand ils s'impatientent (la 3e question, et « Encore toi ? »)

| Qui | Ce qu'il dit |
| --- | --- |
| Le maire | « J'ai une fête à organiser, moi ! Repassez plus tard. » |
| Gaspard | « Ma pâte va retomber ! Repasse plus tard. » |
| Margot | « Tu poses plus de questions que mes clients ne boivent de cidre ! » |
| Victor | « Trois cents lettres à distribuer ! Une autre fois. » |
| Fortuné | « Les questions, c'est gratuit… mais pas illimité ! » |
| Tim | « Ma cheminée m'attend ! Salut ! » |
| Le voisin | « Les chats ont encore faim… Excuse-moi. » |
| Mélusine | « Laisse-moi coudre, je t'en prie… » |
| Iris | « Mes fleurs vont faner si je bavarde ! » |
| Anselme | « ASSEZ ! TU VAS ME CASSER LES OREILLES… ENFIN, CE QU'IL EN RESTE ! » |
| Farinel | Il bâille. « Toutes ces questions me donnent sommeil… » |
| Silas | « Un garde ne bavarde pas pendant son service. Circulez ! » |
| Basile | « Si je continue, je tombe de mon échelle ! » |

## 9. Ce que le Barde lit (compté le 11 novembre)

Compté sur tous les textes entre « » (questions, réponses, choix, portes, fête), comme pour l'E2 au §12.50 :
- **le matin et l'après-midi : 2 670 mots, contre 4 344 le 6 novembre (−39 %)** ;
- la nuit : 1 513 mots, contre 1 371 ; dont 741 pour ce qui est nouveau (la Grosse Marie, le maire à retenir, la fête et ses indices), que le Barde lit **pendant le donjon**, quand il attendait avant ;
- **en tout : 4 285 mots contre 5 867 (−27 %)** ; sans les nouveautés de la nuit, −40 %.
En partie réelle, il lit bien moins : 2 questions sur 4 par visite, un seul chemin dans chaque grand dialogue, une seule variante du troisième dialogue du maire.
