# Enquête 3 « La lettre d'Odette » — le Pisteur, l'Alchimiste et le Sage ; tous les codes ; qui prouve quoi (version 2, 11 novembre 2026)

> **Cette version remplace celle du 6 novembre** (gardée dans `jeu/archives/E3-actions-des-roles-6-novembre.md`). Réécrite le 11 novembre après le « go pour tout » de Romain (15 h 13). Les décisions : Bible §13.14. La trame d'ensemble : le document « Enquête 3 — la trame du chemin parfait » (https://claude.ai/artifact/2RcGGWamDNVQStUN6ud1Cw). Le Barde : `E3-dialogues-et-trame.md`. L'atelier des plantes, les cueillettes et les potions : `E3-atelier-des-plantes.md`. Le donjon lui-même : `jeu/donjon/` (`CONCEPTION-DONJON.md`, `MOTEUR-DONJON.md`). **Le §1 (le Pisteur) est construit et en ligne depuis le 11 novembre, 20 h 50** (Bible §13.16 ; sauf la descente dans le donjon, étape 6) ; le reste est encore de la conception.
>
> **Ce que la construction du Pisteur a changé ici** (Bible §13.16) : les traces de Moustache partent de **la place** (le code du Barde dit « …qui filent dehors, vers la place ») ; sans « Moustache a six doigts », du lait cache ses doigts sur la carte du départ ; **on cherche d'abord le départ de ses traces pendant 10 secondes**, au milieu d'autres pattes qui se croisent, avant que le sol ne se mette à défiler (Romain, 20 h 51) ; la clé d'Anselme se joue dans « Se cacher » **à l'intérieur de l'église et du clocher**, jusqu'à la Grosse Marie (Anselme et le Barde y tirent les cordes) et la clé au clou ; la lettre, **à l'intérieur de la mairie**, jusqu'au bureau du maire (Romain, 21 h 21) ; « Rendre sa mission » dès qu'une des deux missions de fête est réussie (5 pièces d'or).
>
> La page « La lettre d'Odette » (https://claude.ai/artifact/8tDtVAQEffoXqrxCvPhkfC) ne fait plus foi.

Règles pour tous les rôles : chaque texte de plus de 3 mots a son 🔊 ; les aides sont racontées (jamais « Touche … ») ; avant chaque mini-jeu, une explication en images et un bouton jaune ; un seul essai, avec un filet quand la chose est indispensable ; les nouveaux mini-jeux en plein écran verrouillé, montrés d'abord dans la salle des mini-jeux.

## 1. Le Pisteur

L'action : les deux jeux de la fête le matin, les traces de Moustache l'après-midi, la clé (ou le puits) et tout le donjon la nuit, sur sa tablette.

### Le matin
- **Les banderoles** — la place. Tir à l'arc, décor banderoles (déjà fait : `params:{decor:'banderoles'}`, §12.44) → code « Mission de fête (1 sur 2) », rendue au maire l'après-midi. Basile : « Ça, c'est de la décoration ! »
- **L'oie de Gaspard** — la boulangerie, puis les rues. Course-poursuite, une oie vue de dos, en ville ; niveau 4 au plus, comme Tim (`mjNiveauMax:4`) → code « Mission de fête (2 sur 2) ». Gaspard : « Sans elle, pas de festin ! »
- (Le coup d'œil au clocher est abandonné, §13.14.)

### L'après-midi
- **Les traces de Moustache** — de chez Odette jusqu'à l'église. Il lui faut « Les traces de Moustache » (Barde). Avec « Moustache a six doigts » (Sage), il sait lesquelles suivre ; sans, toutes les traces de chats se ressemblent (niveau plus dur). Suivre la piste, version traces de chats, décor ville ; **l'arrivée : l'église et la grille de la crypte au pied du clocher** (le dessin existe déjà : `ARRIVEES_HISTOIRE.crypte`, §12.58). Le mot : « La porte de la crypte ! » → code « La crypte est fermée » pour le Barde. Le filet, si c'est raté : « Tu as perdu les traces… mais un miaulement monte de sous l'église. » (même code). **Le puits n'apparaît pas l'après-midi** (§13.14).
- **Le gui** — le potager de Basile. Avec « Le gui du pommier » (Alchimiste) : « 🌳 Grimper au vieux pommier », une scène racontée, pas de mini-jeu → code « Le gui » pour l'Alchimiste (`E3-atelier-des-plantes.md` §7).
- **La lettre, en se cachant** — la mairie, seulement si le Barde a raté le maire. Se cacher, décor ville. « Tu te glisses derrière le grand rideau. Le maire compte ses papiers un par un… puis il sort. La lettre est sur le dessus. » → code « La lettre d'Odette » pour le Sage et l'Alchimiste (il ne compte qu'une fois).
- **Rendre sa mission** — la mairie. Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde sur la place jusqu'à minuit ! » (or).

### La nuit
1. **Le sac** — pendant le grand dialogue d'Anselme, sur l'écran « Descendre » : il tape le code du sac de l'Alchimiste ; l'écran montre les potions reçues, l'Alchimiste vérifie (`E3-atelier-des-plantes.md` §9).
2. **La clé d'Anselme** — avec « La clé est au clou » (Barde). Se cacher dans le clocher, pendant que les cloches sonnent ; **niveau 8 à 10, un seul essai** (§13.14). Réussi : « DONG ! DONG ! Anselme compte les coups, les yeux fermés. La clé est au clou… Tu la décroches. » La crypte s'ouvre : le donjon, entré par la crypte.
3. **Si ça rate** (vu par Anselme) : « Qui va là ?! » Anselme raccroche la clé à sa ceinture. « En redescendant, tu vois Moustache filer vers la forêt… vers le vieux puits ! » Le puits apparaît sur sa carte. Même chose s'il reçoit « Le vieux puits » du Barde (Anselme a refusé).
4. **Le vieux puits** (seulement après un échec) : « Une vieille grille rouillée. Moustache passe entre les barreaux… toi, non. » Avec l'acide dans le sac : « Tu verses l'acide de l'Alchimiste. Pssshhh ! Les barreaux fondent comme du sucre. » Le donjon, entré par le fond du puits. **Si la clé a été prise, le puits ne s'ouvre jamais.**
5. **Le donjon** — le même par les deux entrées (§12.51, 11 novembre). Tout se joue sur sa tablette, les trois héros en file ; le Sage a le plan et le carnet de l'aventurier sur la sienne, l'Alchimiste son chaudron. Les codes du donjon sont au §4 (le carnet, la rune, les plantes rares, les pages, les sauvegardes).
6. **La Grosse Marie** (du Barde, une seule fois, hors combat) : il la tape avec « 📜 Un code » ; « DONG… La brume recule. » Toute la vie des trois héros revient.
7. **Avant la dernière salle** : « Le Barde a-t-il retenu le maire ? » Il tape « Le maire est retenu », ou continue sans (l'équipe peut attendre le Barde).
8. **La porte aux quatre signes** (avant-dernière salle) : Moustache gratte, une voix étouffée : « Moustache ? Mon gros gris, c'est toi ? » → code « Odette est derrière la porte » pour le Sage.
9. **La dernière salle** : Léo, coincé contre le mur, une lanterne blanche de farine et un panier. Avec le code du maire → code « Léo attrapé » pour le Barde. Sans → des pas dans l'escalier, Léo file dans le noir → code « Léo s'est enfui » pour le Barde. Puis l'écran de fin du donjon.

## 2. L'Alchimiste

Les preuves et les potions. Le matin, le gâteau et les cueillettes ; l'après-midi, le labo (l'écriture de la lettre) et l'atelier des plantes (les sept potions) ; la nuit, le sac et son héros dans le donjon.

### Le matin
- **Le gâteau de la fête** — la boulangerie. Assembler selon une commande (un moteur neuf, noté en étoiles) : sept étages, un par chat d'Odette, et les décorations de la commande de Gaspard → code « Mission de fête ». Gaspard : « Sept étages et sept chats en pâte d'amande ! »
- **Les cueillettes** — l'oseille (lavoir), le souci (potager), la mélisse (herboristerie), le lin (moulin) ; avec le code « L'herbier » (Sage) et ses énigmes : le lycopode (carrefour de la forêt), la vesse-de-loup (clairière aux lièvres, mini-jeu « Suivre la poussière »), le gui (potager, par le Pisteur ou Mimi). Détail : `E3-atelier-des-plantes.md` §4 à §8.
- **L'atelier des plantes** est ouvert dès le matin.

### L'après-midi
- **La lettre, au labo** — il faut « La lettre d'Odette » (Barde, ou Pisteur, ou le filet du Sage). Une fiche du labo (`jeu/src/labo/30-donnees.js`), la lettre posée sur le cuir comme un papier :
  - **au microscope** : des grains de pollen violets → « De la lavande, comme les sachets d'Iris… Tout le village en a. » (une fausse piste) ;
  - **au test des couleurs** (le bocal à bandelettes) : une encre noire qui ne se sépare pas → « De l'encre noire de noix de galle : l'encre que vendent les colporteurs. » (un fil vers Fortuné, qui a vendu encre et plume la veille) ;
  - **à la loupe, l'écriture** : il faut « Les écritures du village » (Sage) : **le Livre d'or est posé sur la paillasse**, à côté de la loupe ; on le touche, on tourne ses pages, et on compare chaque écriture à la lettre (comme on compare un échantillon aux tiroirs). **Pas de tiroir « écritures »** (les tiroirs restent pour les échantillons). Sans le Livre d'or : « Il te faudrait d'autres écritures pour comparer… »
  - Tout est trouvé → code sur l'ardoise : **« L'écriture de Mélusine » pour le Barde et le Sage**.
- **Le Livre d'or, pas évident** (§13.14) : la lettre a trois signes — des « M » qui piquent, des « t » barrés en vague, un petit rond sur les « i ». Seule Mélusine a les trois :

| Qui | Ce qu'il a écrit | Ses « M » qui piquent | Ses « t » en vague | Le rond sur les « i » | Autre chose |
| --- | --- | --- | --- | --- | --- |
| **Mélusine** | « Reviens vite, Odette, tes chats t'attendent ! » | oui | oui | oui | — |
| Victor | « Bon retour, Madame Odette. » | oui | — | oui | une écriture bien droite |
| Fortuné | « Bon voyage… euh, bon retour ! » | oui | oui | — | — |
| Iris | « Mes fleurs t'attendent, Odette. » | — | — | oui | une petite fleur dessinée |
| Margot | « Vive la fête et vive Odette ! » | — | oui | — | — |
| Gaspard | « Une brioche t'attend ! » | — | — | — | une tache de farine |
| Basile | « Vive les lampions ! » | — | — | — | de très grosses lettres |
| Tim | « Reviens vite ! » | — | — | — | des pâtés d'encre |
| Silas | « BON RETOUR. SILAS. » | — | — | — | tout en capitales |
| Farinel | « De la part du moulin. » | — | — | — | penchée, toute blanche de farine |
| Anselme | « DONG ! » | — | — | — | énorme |
| Le maire | « Bienvenue chez toi, Odette. » | — | — | — | en pattes de mouche, minuscule |

  Et Odette (son carnet) : une écriture penchée, un petit chat à côté de chaque « O », aucun des trois signes.
- **Le carnet d'Odette, au labo** (facultatif, il ne donne pas de code) — avec « Le carnet d'Odette » (Barde) : au test des couleurs, une encre violette → « De l'encre de baies de sureau. Odette écrit en violet ; la lettre est en noir. » ; au microscope, des poils gris → « Des poils de chat gris… Moustache dort sur ce carnet ! »
- **Les sept potions de la nuit** — l'atelier des plantes (`E3-atelier-des-plantes.md`). Sa mission de l'après-midi : « Prépare les sept potions de la nuit. » Le Sage ne donne le code de la nuit que quand c'est fait.
- **Rendre le gâteau** — la mairie, de l'or selon les étoiles. Le maire : « On le coupera à minuit pile. Pas une minute avant ! »

### La nuit
- **Le sac** — pendant le grand dialogue d'Anselme : « Ton sac » et son code pour le Pisteur ; s'il manque encore une potion, il la finit avant.
- **Dans le donjon** — son héros joue sur la tablette du Pisteur ; sur sa tablette, le chaudron du donjon (la fleur de givre et les herbes lumineuses reçues par code → les codes des recettes Givre et Baume lumineux pour le Pisteur).

## 3. Le Sage

Les livres, le chemin et l'accusation.

### Le matin
- **Le tableau d'Odette** — la mairie. Assembler les runes, version tableau, niveau 10 : Odette, sa canne, ses sept chats → code « Mission de fête ». Le maire : « Magnifique ! On l'accrochera au-dessus du gâteau. »
- **Le Livre d'or de la fête** — la mairie (validé le 8 novembre). « Reviens vite, Odette ! » « Vive la fête ! »… une page pleine d'écritures → code « Les écritures du village » pour l'Alchimiste (le Livre d'or arrive sur sa paillasse).
- **L'herbier des Fondateurs** — le Grand Livre. Trois énigmes à lire à voix haute à l'Alchimiste, et le code « L'herbier » pour elle (`E3-atelier-des-plantes.md` §5).
- **Les premiers doutes** — avec « La lettre n'est pas passée par la poste » et « Le capuchon vers le clocher » (Barde) : une page « La lettre d'Odette » s'ouvre dans le Grand Livre : « Pas de timbre, pas de tampon. Glissée sous la porte de la mairie, à l'aube, par un grand capuchon reparti vers le clocher. Qui envoie une lettre comme ça ? »
- Il donne le code de l'après-midi.

### L'après-midi
- **La lettre et le carnet** — avec les deux codes du Barde : « Odette écrit penché, avec un petit chat à côté de chaque « O ». La lettre est toute droite, sans un seul chat. Ce n'est pas Odette qui l'a écrite : la lettre est fausse. »
- **Les sept chats du carnet** — « Moustache : mon gros gris, mon malin. Un petit sixième doigt à chaque patte de devant : il ouvre toutes les portes ! » → code « Moustache a six doigts » pour le Pisteur.
- **Le plan des Fondateurs** (décidé le 11 novembre) — dans la couverture du carnet, un vieux parchemin plié, couvert de signes. L'alphabet secret (le mini-jeu, `mj-sage-codes.js`) ; déchiffré : « LE CHEMIN DES FONDATEURS ». Le plan entre dans son Grand Livre : c'est le plan du donjon (avec ses notes codées et son encre invisible, `jeu/donjon/carte.js`, `PLAN`). Un mot d'Odette, au crayon : « Ne le montrer à personne. » Rien ne dépend de l'entrée (crypte ou puits).
- **QUI** — avec « L'écriture de Mélusine » (Alchimiste) et « L'aveu de Mélusine » (Barde) : « Mélusine a écrit la lettre, mot pour mot, sous la dictée d'un homme en cape, à la voix étouffée, qui sentait la lavande. Il reviendra quand la Grosse Marie sonnera. »
- **Rendre le tableau** — la mairie, de l'or. **Le filet de la lettre** : si l'équipe n'a toujours pas la lettre, le maire : « Je l'accroche sous votre tableau, pour que tout le village la lise ce soir ! » → le Sage reçoit « La lettre d'Odette » (et en donne le code à l'Alchimiste).
- **Le code de la nuit**, quand tout le monde a fini (les sept potions comprises).

### La nuit
- **Le donjon** — sur sa tablette : le plan (il dit le chemin à voix haute ; le Pisteur ne voit que la brume), le carnet de l'aventurier (trouvé à l'entrée), les pages blanches de sauvegarde, la rune de lumière (trouvée dans la galerie effondrée). Son héros joue sur la tablette du Pisteur (la rune de l'œil, le bouclier de runes, la rune de lumière).
- **Odette est derrière la porte** (Pisteur) — OÙ est prouvé. **La page de la porte des Fondateurs** s'ouvre toute seule dans le Grand Livre : « Une porte ronde, scellée. Quatre signes : l'œil, le chaudron, la lyre et l'étoile. Seuls les quatre, ensemble, l'ouvriront. » (Les quatre signes sont ceux du donjon : `scenes/scenes.js`, la porte et la pierre de la salle des rats.)
- **L'accusation** — après Léo, avec toute l'équipe :
  - QUI a écrit la fausse lettre ? Mélusine · Margot · Iris · Victor · Fortuné (réponse : Mélusine) ;
  - OÙ est Odette ? Sous le clocher, derrière la porte aux quatre signes · Au fond du puits · Au moulin · Au Vieux Chêne (réponse : sous le clocher) ;
  - la question bonus, qui ne coûte pas de cœur : QUI est le Corbeau ? Grosbec · Silas · Fortuné (la réponse reste secrète jusqu'à la suite de la saison).
  - Puis la scène finale, sur toutes les tablettes (`E3-dialogues-et-trame.md` §4.8).

## 4. Tous les codes de l'enquête 3

Les codes de l'E3 sont neufs ; ils seront gelés dès leur première mise en ligne (`codes-fixes.js`). Ceux du donjon existent déjà (`jeu/donjon/donjon-codes.js`) : ils seront repris dans la table de l'enquête au branchement.

### Le matin
| De | Code | Pour | Note |
| --- | --- | --- | --- |
| Barde | La lettre n'est pas passée par la poste | Sage | Victor |
| Barde | Le capuchon vers le clocher | Sage | Tim, démasqué |
| Pisteur | Mission de fête (1 sur 2), (2 sur 2) | (le maire) | rendues l'après-midi |
| Alchimiste | Mission de fête | (le maire) | rendue l'après-midi |
| Sage | Mission de fête | (le maire) | rendue l'après-midi |
| Sage | Les écritures du village | Alchimiste | le Livre d'or sur sa paillasse |
| Sage | L'herbier | Alchimiste | ouvre les trois plantes rares |
| Alchimiste | Le gui du pommier | Pisteur | il grimpe (sauf avec Mimi) |
| Pisteur | Le gui | Alchimiste | la plante arrive à l'atelier |
| Sage | Le code de l'après-midi | tout le monde | comme à chaque moment |

### L'après-midi
| De | Code | Pour | Note |
| --- | --- | --- | --- |
| Barde | La lettre d'Odette | Sage, Alchimiste | le maire ; ou le Pisteur caché ; ou le filet du Sage |
| Barde | Le carnet d'Odette | Sage, Alchimiste | chez Odette (le plan est dans sa couverture) |
| Barde | Les traces de Moustache | Pisteur | chez Odette |
| Sage | Moustache a six doigts | Pisteur | le carnet |
| Pisteur | La crypte est fermée | Barde | les traces |
| Alchimiste | L'écriture de Mélusine | Barde, Sage | le labo |
| Barde | L'aveu de Mélusine | Sage | Mélusine démasquée (filet : la nuit, à la fête) |
| Sage | Le code de la nuit | tout le monde | quand tout le monde a fini |
| (le gui peut aussi passer l'après-midi) | | | |

### La nuit
| De | Code | Pour | Note |
| --- | --- | --- | --- |
| Barde | La clé est au clou | Pisteur | Anselme réussi |
| Barde | Le vieux puits | Pisteur | Anselme raté (si c'est le Pisteur qui rate, le puits apparaît chez lui) |
| Alchimiste | Le sac | Pisteur | pendant le grand dialogue d'Anselme |
| Pisteur | Le carnet de l'aventurier | Sage | à l'entrée du donjon (existe : `carnet:aventurier`) |
| Pisteur | La rune de lumière | Sage | la galerie effondrée (existe : `rune:lumiere`) |
| Pisteur | Les herbes lumineuses, la fleur de givre | Alchimiste | le donjon (existent) |
| Alchimiste | Les recettes Baume lumineux, Givre | Pisteur | le donjon (existent) |
| Pisteur | La page déchirée, la page blanche | Sage | le donjon (existent) |
| Sage | Les sauvegardes 1 à 4 | Pisteur | les pages blanches (existent) |
| Barde | La Grosse Marie | Pisteur | une fois, hors combat |
| Barde | Le maire est retenu | Pisteur | avant la dernière salle |
| Pisteur | Odette est derrière la porte | Sage | existe : `porte:odette` |
| Pisteur | Léo attrapé, ou Léo s'est enfui | Barde | existe : `leo:attrape` ; « Léo s'est enfui » est nouveau |
| Barde | Ce que Léo a avoué (à voix haute) | Sage | facultatif |

## 5. Qui prouve quoi (le test de la Bible)

**QUI a écrit la lettre ? Mélusine.**
| Preuve | Qui la trouve | Ce qu'il lui faut |
| --- | --- | --- |
| La lettre est fausse | Sage | la lettre (Barde, ou Pisteur, ou filet) + le carnet (Barde) |
| **L'écriture de Mélusine** | Alchimiste (labo) | la lettre + le Livre d'or (Sage) |
| **L'aveu de Mélusine** | Barde | le code de l'écriture (Alchimiste) ; filet la nuit |
| Indices seulement (pas des preuves) | Barde | la main fine aux épingles (Fortuné), le tissu neuf (Margot, Mélusine), « Pardon, Odette » (porte), l'écoute de la nuit ; l'encre de colporteur (Alchimiste) |

**OÙ est Odette ? Sous le clocher, derrière la porte aux quatre signes.**
| Preuve | Qui la trouve | Ce qu'il lui faut |
| --- | --- | --- |
| **Odette est derrière la porte** | Pisteur (donjon) | les traces (Barde + Sage) ; la clé (Barde + Pisteur) ou le puits (Pisteur + l'acide de l'Alchimiste) ; le donjon à trois (Pisteur, Alchimiste et ses potions, Sage et son plan) |
| Indices seulement | Barde | l'aveu de Léo, la Lanterne du veilleur, les écoutes de la nuit |

**Le Corbeau (bonus)** : la bague de l'aveu de Léo, le lapsus de la lanterne, l'homme en cape qui entre à la mairie (Lanterne). Rien d'obligatoire.

**Le test** (chaque rôle est indispensable) :
- **Sans l'Alchimiste** : pas d'écriture, donc pas d'aveu (la question de Mélusine a besoin du code) ; QUI reste ouvert entre les cinq suspects (il ne reste que des indices). Et le donjon sans potions ne se gagne pas (§12.51).
- **Sans le Sage** : pas de Livre d'or (pas d'écriture, pas d'aveu), pas de plan (le donjon est impossible sans lui, §12.51), personne pour accuser.
- **Sans le Barde** : pas de traces (le Pisteur ne peut pas commencer), pas de clé ni de puits (le puits n'apparaît qu'après un échec du clocher, qui passe par lui), pas d'aveu.
- **Sans le Pisteur** : pas de traces, pas de clé, pas de donjon (il se joue sur sa tablette) : OÙ reste ouvert.
- **Avec tout le monde** : une seule réponse à QUI, une seule à OÙ. Aucune preuve ne dépend d'un mensonge démasqué « plus tard » : les seuls mensonges indispensables (Mélusine) ont leur filet.
- À vérifier à la construction avec `tools/verif.js 3` (comme pour l'E2 : une seule solution avec tout, plusieurs sans chaque rôle).

## 6. Les schémas (dans l'ordre)

### Le matin
1. **Tout le monde** : la lettre lue par le maire, l'écran des missions.
2. **Barde** : le marché aux fleurs ; les villageois (les indices du maire, les premiers doutes).
3. **Pisteur** : les banderoles et l'oie.
4. **Alchimiste** : le gâteau ; les cueillettes ; les premières potions.
5. **Sage** : le tableau ; le Livre d'or (→ Alchimiste) ; l'herbier (→ Alchimiste) ; les premiers doutes.

### L'après-midi
- **QUI** : Barde (la lettre, le carnet) → Sage (la lettre est fausse) ; Sage (Livre d'or) + Barde (la lettre) → Alchimiste (l'écriture de Mélusine) → Barde (l'aveu) → Sage.
- **Le chemin** : Barde (les traces) + Sage (six doigts) → Pisteur (la crypte est fermée) → Barde (il faudra Anselme) ; Sage (le plan dans le carnet).
- **Les potions** : Alchimiste (les cueillettes, l'herbier, le gui par le Pisteur) → les sept potions.

### La nuit
1. **Barde** : Anselme. Réussi → **Pisteur** : la clé, dans le clocher. Raté (l'un ou l'autre) → le puits et l'acide.
2. **Alchimiste → Pisteur** : le sac.
3. **Pisteur + Alchimiste + Sage** : le donjon (le Sage guide).
4. **Barde, pendant ce temps** : la fête et ses indices ; la Grosse Marie (→ Pisteur) ; retenir le maire (→ Pisteur).
5. **Pisteur → Sage** : Odette est derrière la porte (la page des Fondateurs).
6. **Pisteur → Barde** : Léo attrapé (ou enfui) ; le grand dialogue de Léo.
7. **Sage** : l'accusation. Puis minuit, le maire, la bague, le cachot.
