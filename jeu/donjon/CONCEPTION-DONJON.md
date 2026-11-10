# Le donjon du puits — conception du prototype complet

> Écrit le 9 novembre 2026 (10 h 10) après le go de Romain : « Tu vas pouvoir me fabriquer tout le jeu… Prends ton temps et fais ça bien. »
> Ce document guide la construction du prototype jouable complet (chemin long, par le puits). Il s'appuie sur la Bible §12.51, le bestiaire (Claude Docs « Donjon de l'enquête 3 — le bestiaire ») et les maquettes (`maquettes/explo/`, `bestiaire/`). En cas de doute, la Bible fait foi.

## 1. Ce que Romain demande (9 novembre, 10 h 04)

- Chaque salle est différente, avec son propre décor.
- Des découvertes au fil du donjon, et des **choix d'armes** : certaines armes sont plus efficaces contre certains ennemis.
- **De la difficulté dès la sortie de la salle des rats.** Il faut réfléchir, sinon on meurt. Le jeu doit rester faisable, mais **sans les connaissances du Sage, il est impossible**.
- Calibrer les dégâts : est-ce qu'un combo réussi tue tout d'un coup, ou est-ce qu'il affiche des dégâts sans forcément tuer ?
- Des salles avec seulement des objets à attraper en les touchant. Certains objets sont à passer à l'Alchimiste ou au Sage, par des codes.
- Tout est modélisé, boss compris. Les points de sauvegarde sont bien gérés. Les ennemis sont bien animés, et chaque nouvelle arme a sa propre animation.

## 2. Les trois tablettes

- **Le Pisteur** : le donjon se joue sur sa tablette. Il voit la carte avec la brume, les combats, les salles d'objets. Il tape les codes de sauvegarde du Sage et les codes de recette de l'Alchimiste. Il affiche les codes des objets à donner.
- **Le Sage** (page `donjon-sage.html`) : le plan des Fondateurs (avec l'encre invisible, révélée en le touchant avec la rune), la grille de l'alphabet secret et le Grand Livre avec ses **pages blanches de sauvegarde**. Il reçoit par code la page déchirée et les pages blanches trouvées.
- **L'Alchimiste** (page `donjon-alchimiste.html`) : ses recettes connues et le **chaudron**. Une plante rare reçue par code se cuisine au chaudron (un petit mini-jeu). Le chaudron donne un code de recette, à taper sur la tablette du Pisteur au feu de camp.
- **Les codes** : 3 symboles parmi les 12 du jeu, fixes pour le prototype. Chaque code ne marche qu'une fois. La liste est au §9.

## 3. Les règles du combat (rappel et changements)

- Les héros jouent dans l'ordre qu'ils choisissent, puis les monstres jouent, de devant à derrière. Les monstres montrent qui ils visent.
- **Les points de vie ne reviennent pas entre les salles.** On se soigne avec les Herbes (20), le Baume (40, s'il est dans le sac) et le feu de camp (la moitié des PV max).
- Les potions sont infinies, et le sac a 3 recettes (4 avec la Sacoche). Sept recettes sont connues au départ : feu, fumigène (le nuage), huile, colle, acide, baume, cœur vaillant. Le givre et le baume lumineux se gagnent au chaudron.
- **Le point faible fermé** :
  - les monstres normaux prennent 1 à 5 de dégâts ;
  - **les élites et le boss sont IMMUNISÉS** (0 de dégâts, « ça rebondit ! ») tant que le point faible est fermé.
- **Le point faible ouvert** dure jusqu'à la fin du tour des monstres du même tour : il faut l'ouvrir PUIS frapper, dans le même tour.
- **Le critique du Pisteur sur un point faible ouvert** affiche toujours ses dégâts, mais ne tue pas toujours (réponse à la question de Romain) :

| Cible | Critique à la flèche | Critique à la dague (devant) |
|---|---|---|
| Monstre normal | 60 : tue les petits (rat, chauve-souris, feu follet, araignée), mais pas le rat cuirassé (70) | 75 |
| Élite | 110 | 140 |
| Boss | 300 | 380 |

  Les autres coups sur un point faible ouvert font 15 à 30. Les armes trouvées ajoutent des bonus contre certains ennemis (§6).
- **Une chance sur 8 de critique surprise** à la flèche, seulement sur un monstre normal, même fermé.
- La rage dure jusqu'à la fin du combat. La brûlure fait −4 par tour jusqu'à la fin.
- **Toujours une sortie** : avec la bonne potion, le combo est facile. Sans elle, il existe un chemin plus difficile (§5). Mais les élites et le boss ne se battent pas sans au moins une lecture du Grand Livre : leurs combos ont plusieurs étapes dans un ordre précis, et une erreur les renforce.

## 4. La difficulté (cible de l'équilibre)

- **La salle des rats** est l'apprentissage : elle reste facile.
- **Ensuite**, les monstres font assez de dégâts pour qu'une équipe qui tape sans réfléchir tombe en 5 ou 6 tours. Une équipe qui étudie et ouvre les points faibles gagne en 3 ou 4 tours. On le vérifie par simulation (`equilibre.py`) :
  - « malin » : il gagne ;
  - « au hasard » : il perd souvent ;
  - « tape sans réfléchir » : il PERD dès la salle 2 ;
  - « sans le Grand Livre » : il perd contre les élites et le boss.
- **Le soin infini** (Baume, Herbes) ne doit pas suffire : à partir de la salle 2, les dégâts des monstres par tour dépassent ce qu'un soin rend par tour.
- **Se perdre coûte cher.** Les fausses pistes ont parfois un monstre errant (les égouts tournants) ou un piège (le couloir aux dalles sans le plan).

## 5. Les monstres du chemin long

Les points de vie et attaques sont ajustés pour la difficulté. Les combos viennent du bestiaire.

| Monstre | PV | Attaque | S'ouvre avec | Autre chemin | Sans potion | Le renforce |
|---|---|---|---|---|---|---|
| Rat d'égout | 40 | morsure 8 (16 enragé) | lumière | huile | — | bruit (rage) |
| Rat cuirassé | 70 | coup de tête 14 | acide (armure tombe) | givre | 2 coups de louche sur le casque (il a le tournis, le casque tombe), puis lumière | feu (ses coups brûlent +5) |
| Chauve-souris | 25 | piqué 10, frappe 2 fois si folle | bruit (tombe devant) | colle | — (le bruit est un geste) | lumière (folle) |
| Feu follet | 30 | brûlure froide 12 à 2 héros | nuage | encre (plus tard) | Bouclier sur sa cible : il s'y accroche, il se voit | lumière (+30 PV) |
| Araignée des caves | 60 | morsure 12 + toile (un héros passe son tour) | lumière (tombe sur le dos devant) | huile sur le fil | — | feu (2 petites de 15 PV) ; nuage (remonte) |
| Têtard | 15 | morsure 5 | pas de point faible | — | — | — |
| **Le Roi des rats** (élite) | 220 | grouillement 10 sur chaque héros | nuage PUIS bruit (le nœud) | nuage puis colle sur le roi | bruit juste après leur attaque | lumière (boule 2 tours) ; bruit avant nuage (24 sur l'Alchimiste) |
| **Le Gardien de rouille** (élite) | 280 | poing 30 sur celui de devant | acide (plaque) PUIS lumière (cœur) | givre puis lumière | Bouclier : il frappe le bouclier, s'arrête, sa plaque s'entrouvre, puis lumière | lumière avant acide (coups doublés 2 tours) ; feu |
| **Bourbe** (boss) | 1 000 | langue (avale un héros) ; saut 15 sur tous | lumière dans l'eau PUIS feu sur la bave PUIS nuage (sur le dos) | givre sur le bassin (il ne plonge plus) ; miel, sel, piment (plus tard) | sans feu : 2 tours sur la berge ; sans nuage : « Chatouiller » le héros avalé | nuage avant feu (gonfle, saut double) ; bruit (plonge, +2 têtards) |

Chaque monstre a ses animations : entrée, attente, attaque, réactions à chaque pouvoir, point faible ouvert, fuite ou mort, et explosion au critique mortel (§10).

## 6. Les armes et les objets (les choix)

Chaque héros a **2 places d'objet**. Trouver un objet quand c'est plein oblige à en laisser un. Certains coffres proposent **deux objets dont on n'en prend qu'un**.

| Objet | Pour | Effet | Où |
|---|---|---|---|
| Flèches d'argent | Pisteur | Contre les créatures de brume (feu follet, chauve-souris) : elles touchent même fermé (10), et le critique ×1,5 | La réserve, au choix avec les flèches lourdes |
| Flèches lourdes | Pisteur | Contre l'armure (rat cuirassé, Gardien) : 12 même fermé, et le critique ×1,5 | La réserve, au choix avec les flèches d'argent |
| Cristal de lune | Sage | Sa rune de lumière éclaire TOUTE la salle (puissant, mais dangereux avec les chauves-souris et les feux follets) | La bibliothèque engloutie, au choix avec le bâton de chêne |
| Bâton de chêne | Sage | Son bouclier protège deux héros | La bibliothèque engloutie, au choix avec le cristal |
| Sacoche | Alchimiste | Une 4e place de recette | Le puits d'aération |
| Amulette de vie | n'importe qui | Une fois par donjon : le héros qui tombe se relève tout seul avec 30 | La fausse crypte |
| Bourse de pièces | — | De l'or pour la boutique | La galerie effondrée |

**Les objets à passer par code :**
- la fleur de givre (grotte de givre) va à l'Alchimiste, qui la cuisine au chaudron et obtient la recette Givre ;
- les herbes lumineuses (puits d'aération) vont à l'Alchimiste, pour la recette Baume lumineux (soigne 30 toute l'équipe) ;
- la page déchirée (bibliothèque) va au Sage, et complète le plan : le coin du bassin, avec une note sur Bourbe ;
- une page blanche (le tas d'os du cul-de-sac éboulé) va au Sage, et lui donne une sauvegarde de plus.

## 7. Les salles, dans l'ordre du chemin

Chaque salle a son décor (§10).

| # | Salle | Type | Contenu |
|---|---|---|---|
| 0 | Le fond du puits | départ (sauvegarde de départ) | trois couloirs : ouest, nord, est |
| — | La galerie effondrée | cul-de-sac, objets | bourse de pièces |
| — | Le puits d'aération | cul-de-sac, objets | sacoche, herbes lumineuses (code Alchimiste) |
| 1 | La salle des rats | combat (apprentissage) | 3 rats d'égout |
| — | La réserve | objets, choix | un coffre avec deux carquois : flèches d'argent OU flèches lourdes |
| 2 | Les canaux de la ville d'avant | combat | 2 chauves-souris et 1 rat d'égout |
| — | Les égouts tournants | boucle | un rat errant (combat court), puis on ressort aux canaux |
| — | La grotte de la fleur de givre | objets | la fleur de givre (code Alchimiste) |
| 3 | La cave aux toiles | combat | 1 araignée et 2 feux follets |
| — | Le cul-de-sac éboulé | curiosité | un tas d'os à fouiller : la première fouille réveille un rat qui mord (−10), la deuxième donne la page blanche (code Sage) ; le crâne du passage secret (visible avec l'encre invisible du Sage) mène au feu de camp |
| — | Le couloir aux dalles | piège | un damier : sur les dalles sombres, −15 à toute l'équipe ; le plan du Sage dit « seulement les dalles claires » |
| 4 | L'atelier des Fondateurs | combat, élite | le Gardien de rouille et 1 rat cuirassé |
| — | La bibliothèque engloutie | objets, choix | la page déchirée (code Sage) ; cristal de lune OU bâton de chêne |
| — | La salle aux trois portes | énigme | œil (vers l'ossuaire), gueule (vers la fausse crypte), lune (retour à la cave) |
| — | La fausse crypte | cul-de-sac | l'amulette de vie dans le sarcophage, et 2 chauves-souris (combat) |
| 5 | L'ossuaire | combat, élite | le Roi des rats et 2 feux follets |
| — | Le feu de camp | repos | rend la moitié des PV max ; on change le sac et on y tape les codes de recette |
| 6 | Le grand bassin | BOSS | Bourbe et 2 têtards |
| — | La porte aux quatre signes | scène | Moustache gratte, la voix d'Odette répond : « Odette est derrière la porte » (code pour le Sage) |
| — | La dernière salle | fin | Léo, coincé, avec sa lanterne : fin du donjon (code « Léo attrapé ») |

## 8. Les sauvegardes et la fuite

- **La sauvegarde de départ** est au fond du puits.
- Le Sage a 3 pages blanches sur sa tablette, et on en trouve une de plus (le tas d'os du cul-de-sac éboulé). Une page donne un code. Le Pisteur le tape hors combat (bouton « 📜 Un code » sur la carte). La sauvegarde garde tout : la position, les PV, les objets, le sac et les salles battues.
- **Fuir recharge la dernière sauvegarde** : tout ce qui a été fait depuis est à refaire. Le Grand Livre garde ce qu'il a appris.
- Le conseil du conteur (raconté) : « Une page blanche avant une grande porte, ça ne se refuse pas… »

## 9. Les codes du prototype (fixes)

À choisir parmi les 12 symboles du jeu, à fixer à la construction, dans un tableau unique partagé par les trois pages :
- sauvegarde 1 à 4 (pages du Sage) ;
- fleur de givre (Pisteur vers Alchimiste) ;
- recette Givre (Alchimiste vers Pisteur) ;
- herbes lumineuses (Pisteur vers Alchimiste) ;
- recette Baume lumineux (Alchimiste vers Pisteur) ;
- page déchirée (Pisteur vers Sage) ;
- page blanche trouvée (Pisteur vers Sage) ;
- Odette derrière la porte (Pisteur vers Sage) ;
- Léo attrapé (Pisteur vers Barde).

## 10. Les images et les animations

- **Les décors de combat** (960 × 372, à la manière de `maquettes/combat2-*.png`, plus de détails, pas de torche de jeu) :
  - la salle des rats (déjà faite) ;
  - les canaux (eau qui coule, petit pont, grille) ;
  - la cave aux toiles (toiles, cocons, œufs) ;
  - l'atelier (engrenages, établis, runes) ;
  - l'ossuaire (crânes dans des niches, os) ;
  - le grand bassin (eau sombre, margelle, nénuphars) ;
  - les égouts tournants ;
  - la fausse crypte.
- **Les salles d'objets** : la même scène vue de côté, avec les objets à toucher, qui brillent et qu'on attrape avec une animation :
  - la galerie effondrée ;
  - le puits d'aération ;
  - la réserve (le coffre et les deux carquois) ;
  - la grotte de givre ;
  - la bibliothèque engloutie ;
  - le cul-de-sac éboulé (le tas d'os) ;
  - le feu de camp ;
  - la salle aux trois portes ;
  - la porte aux quatre signes (avec Moustache) ;
  - la dernière salle (avec Léo).
- **Les monstres animés** : chaque monstre est un module en pièces articulées, comme `anim/rat/rat-anime.js`, avec la même interface (`BETES[id].creer(conteneur)`). Ils ont :
  - les méthodes communes : `entrer`, `attendre`, `attaquer`, `touche`, `etat`, `tousser`, `fuir`, `mourir`, `exploser`, `cible` et `ancre` ;
  - leurs animations propres (§5).
- **Les héros** : les nouvelles armes ont leurs animations :
  - pour le Pisteur, la flèche d'argent (traînée argentée, éclat) et la flèche lourde (lourde, étincelles sur le métal) ;
  - pour le Sage, le cristal de lune (éclair dans toute la salle) et le bâton de chêne (double dôme) ;
  - la potion de givre (éclat de glace) ;
  - le geste « Chatouiller » (dans le ventre de Bourbe) ;
  - l'amulette (relève dorée).
- **Les sons** de tout ça sont proposés dans l'Atelier des sons (onglets Bestiaire et Donjon), et Romain les valide là.

> **La suite, pour construire le moteur : `MOTEUR-DONJON.md`** (découpage, contrat entre les règles et l'affichage, sauvegardes, tests, difficulté).

## 11. L'ordre de construction

1. Les monstres animés (en parallèle, par groupes), les décors, et les nouvelles animations des héros.
2. Le moteur du donjon :
   - la carte avec la brume, qu'on fait glisser ;
   - les déplacements ;
   - les salles d'objets ;
   - les pièges ;
   - le combat, piloté par des données ;
   - les objets et les places ;
   - les codes et les sauvegardes ;
   - les pages du Sage et de l'Alchimiste.
3. Les branchements, les sons provisoires, puis l'équilibre par simulation, les tests, et la mise en ligne (`brumeval/donjon-essai.html`, plus les pages du Sage et de l'Alchimiste).
4. Les sons proposés dans l'Atelier, à valider par Romain.
