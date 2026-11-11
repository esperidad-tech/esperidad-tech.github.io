/* ==========================================================
   Enquête 3 — La lettre d'Odette — DESIGN-saison1.md § 13 (surtout § 13.14) et jeu/enquete3/*.md (le détail, qui fait foi)
   EN CONSTRUCTION, étape par étape (§ 13.14) : fermée aux joueurs (enEcriture), ouverte avec le mode test (M.enEcriture, moteur-base.js).
   Étape 1 (11 novembre) : la lettre, l'écran des missions, le marché aux fleurs du Barde, les villageois du matin et de l'après-midi,
   les occupés, les écoutes aux portes. Pas encore : les grands dialogues (étape 2), le Sage (3), l'Alchimiste (4), le Pisteur (5),
   le donjon (6), la nuit et la fin (7), le vérificateur (8).

   Solution : Mélusine a écrit la fausse lettre · Odette est sous le clocher, derrière la porte aux quatre signes.
   Ce qui s'est passé (jamais dit tel quel) : un homme en cape (le maire, qui ne ment jamais) a payé Mélusine pour écrire, mot pour mot,
   une lettre « d'Odette », glissée à l'aube sous la porte de la mairie. Odette est enfermée sous le clocher ; Léo, l'apprenti du meunier,
   lui porte à manger tous les soirs. Moustache, son chat à six doigts, la retrouve toujours.
   ========================================================== */
(function(){
'use strict';
var E = window.ENQUETES = window.ENQUETES || {};

/* Les signes des menteurs (barde.js lit E.tics) : les mêmes qu'à l'enquête 2 (le tableau de liège est gardé), et celui de Léo, nouveau.
   Au début de l'enquête, les étiquettes qui manquent s'épinglent toutes seules (signesDepart) ; celle de Léo, c'est Farinel qui l'épingle. */
var TICS = {margot:'yeuxbas', victor:'morsure', fortune:'coin', tim:'mordille', melusine:'rougeur', farinel:'double', leo:'sueur'};

/* g : ce qu'apporte la réponse (pour nous, et pour les objets du Barde à venir : la Lettre de recommandation, le Carnet à rubans) :
   'r' un ruban (l'indice d'un grand dialogue), 'e' l'enquête, 'h' l'histoire de la saison. */
var M_ = ['matin'], A_ = ['apresmidi'];

E[3] = {
  id:3, titre:'La lettre d\'Odette', niveau:3,
  /* pas encore jouable par les joueurs : le village dit « en cours d'écriture ». Avec le mode test (#test), elle s'ouvre (M.enEcriture). */
  enEcriture:true,
  moments:['matin', 'apresmidi', 'nuit'],
  sansActions:true,
  salutUneFois:true,

  /* ---------- L'ouverture (moteur-ecrans.js, vueLettre) : la lettre « d'Odette », lue par le maire sur la place, à l'aube ----------
     Le texte de la lettre est celui que l'Alchimiste analysera : à garder mot pour mot. */
  lettre:'Mon cher Monsieur le maire, ne vous faites pas de souci pour moi : je suis partie quelques jours chez ma sœur, de l\'autre côté de la forêt. Je vais très bien et je reviendrai la semaine prochaine. Je ne retrouve plus ma canne : si quelqu\'un la trouve, qu\'il la rapporte chez moi, au 2, rue des Lanternes. Je vous embrasse tous. Odette.',
  signature:'Odette',
  lettreLue:{titre:'À l\'aube, sur la place, le maire lit une lettre…', apres:'Odette va bien ! Pour fêter ça : grande fête cette nuit sur la place, jusqu\'à minuit !'},
  /* L'écran des missions du maire, juste après la lettre, pour tous (§ 13.6) : une ligne par rôle, et le bouton jaune */
  missionsMaire:{titre:'Les missions du maire', sous:'Pour la fête de cette nuit, chacun a sa mission :', bouton:'Commencer l\'enquête 3',
    barde:'Achète les fleurs de la fête.',
    pisteur:'Accroche les banderoles et rattrape l\'oie de Gaspard.',
    alchimiste:'Fais le gâteau de la fête, d\'après la commande de Gaspard.',
    sage:'Peins le tableau d\'Odette et de ses chats.'},
  missions:{
    pisteur:'Accroche les banderoles de la fête et rattrape l\'oie de Gaspard. Et ouvre l\'œil : cette lettre est bizarre…',
    alchimiste:'Fais le gâteau de la fête, d\'après la commande de Gaspard. Et prépare ton atelier : l\'équipe aura besoin de toi.',
    barde:'Achète les fleurs de la fête avec les pièces du maire. Puis interroge le village : chacun te répond à deux questions, pas plus. Choisis bien !',
    sage:'Peins le tableau d\'Odette et de ses chats. Lis ton Grand Livre à l\'équipe, donne le code de chaque moment, et accuse quand toute l\'équipe est d\'accord.'
  },
  /* Les missions de base, en haut du Carnet (mission.js). Celles du Pisteur, de l'Alchimiste et du Sage arrivent avec leurs étapes (3 à 5). */
  etapes:{
    barde:[
      {ic:'💐', t:'Le maire t\'a donné 10 pièces : rapporte-lui au moins 10 bouquets pour la fête.', fait:[{vu:'marche:dix'}]},
      {ic:'🗣️', t:'Chaque villageois répond à deux questions par moment, pas plus : choisis bien !', fait:[{bavard:4}]},
      {ic:'🦯', t:'Odette demande qu\'on rapporte sa canne chez elle, au 2, rue des Lanternes.', fait:[{vu:'barde:voisin:0'}]},
      {piste:true, t:'Regarde bien les visages : plusieurs villageois vont te mentir.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    /* (étape 5) une mission de fête ratée compte comme faite (fini : un seul essai) ; rendre sa mission au maire, l'après-midi,
       se coche aussi quand les deux sont ratées (il n'y a alors rien à rendre) */
    pisteur:[
      {ic:'🎏', t:'Accroche les banderoles de la fête, sur la place.', fait:[{fini:'pisteur:place:banderoles'}]},
      {ic:'🦢', t:'Rattrape l\'oie de Gaspard, à la boulangerie.', fait:[{fini:'pisteur:boulangerie:oie'}]},
      {ic:'🏛️', t:'L\'après-midi, va rendre ta mission au maire.', fait:[{vu:'pisteur:mairie:mission'}, {et:[{rate:'pisteur:place:banderoles'}, {rate:'pisteur:boulangerie:oie'}]}]},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    alchimiste:[
      {libre:true, ic:'🎂', t:'Fais le gâteau de la fête, d\'après la commande de Gaspard.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    sage:[
      {ic:'👥', t:'Lis « Les habitants » à toute l\'équipe.', fait:[{lu:'habitants'}]},
      {libre:true, ic:'🖼️', t:'Peins le tableau d\'Odette et de ses chats.'},
      {piste:true, t:'Quand toute l\'équipe a tout fait, donne le code du moment suivant (page ⏭️ Les codes des moments).'},
      {libre:true, ic:'🔍', t:'Écoute l\'équipe, puis accuse : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ]
  },
  qui:{titre:'QUI a écrit la fausse lettre ?', choix:['melusine', 'margot', 'iris', 'victor', 'fortune']},
  ou:{titre:'OÙ est Odette ?', choix:[
    {id:'clocher', nom:'Sous le clocher, derrière la porte aux quatre signes', ic:'🔔'}, {id:'puits', nom:'Au fond du puits', ic:'💧'},
    {id:'moulin', nom:'Au moulin', ic:'🌾'}, {id:'chene', nom:'Au Vieux Chêne', ic:'🌳'}]},
  solution:{qui:'melusine', ou:'clocher'},
  /* la question bonus, qui ne coûte pas de cœur ; la réponse reste secrète jusqu'à la suite de la saison */
  corbeau:{titre:'Une dernière question… QUI est le Corbeau ?', choix:['grosbec', 'silas', 'fortune'], solution:'grosbec'},

  /* ---------- Le Barde (barde.js) ----------
     parVisite : chaque villageois répond à 2 questions par moment (E3-dialogues-et-trame.md §0) ; ensuite, sa phrase d'impatience (§8),
     dite aussi quand on revient (« Encore toi ? »). Du nouveau qui le concerne (un code, une écoute) rouvre la porte pour cette question-là. */
  parVisite:2,
  impatience:{
    grosbec:'J\'ai une fête à organiser, moi ! Repassez plus tard.',
    gaspard:'Ma pâte va retomber ! Repasse plus tard.',
    margot:'Tu poses plus de questions que mes clients ne boivent de cidre !',
    victor:'Trois cents lettres à distribuer ! Une autre fois.',
    fortune:'Les questions, c\'est gratuit… mais pas illimité !',
    tim:'Ma cheminée m\'attend ! Salut !',
    levoisin:'Les chats ont encore faim… Excuse-moi.',
    melusine:'Laisse-moi coudre, je t\'en prie…',
    iris:'Mes fleurs vont faner si je bavarde !',
    anselme:'ASSEZ ! TU VAS ME CASSER LES OREILLES… ENFIN, CE QU\'IL EN RESTE !',
    farinel:'Toutes ces questions me donnent sommeil…',
    silas:'Un garde ne bavarde pas pendant son service. Circulez !',
    basile:'Si je continue, je tombe de mon échelle !'
  },
  uneVisite:['grosbec', 'gaspard', 'margot', 'victor', 'fortune', 'tim', 'levoisin', 'melusine', 'iris', 'anselme', 'farinel', 'silas', 'basile'],
  questionsCachees:true,
  ecouteMaisons:true,   /* avec « Tendre l'oreille », une maison où il y a quelque chose à écouter montre sa feuille (« Frapper », « Écouter aux portes ») */
  potionAveu:true,
  vexeNeutre:true,
  veriteUnique:true,
  tics:TICS,
  /* au début de l'enquête, les étiquettes des menteurs qui manquent sur le liège s'épinglent toutes seules (E3-dialogues-et-trame.md §0) */
  signesDepart:{qui:['margot', 'victor', 'fortune', 'tim', 'melusine', 'farinel'], note:'Margot t\'a glissé ses secrets de tavernière : les signes des menteurs sont sur ton tableau de liège.'},

  /* ---------- Le marché aux fleurs du Barde (marche.js ; Bible § 13.6 bis ; E3-dialogues-et-trame.md §2.1 et §3.1) ----------
     Le matin : le maire donne 10 pièces et veut au moins 10 bouquets. Fortuné d'abord (3 étapes ; ses 4 bouquets en papier comptent
     pour 0 : ils se déchirent chez le premier vrai fleuriste ; la lanterne selon le chemin), puis Iris et Basile.
     L'après-midi : le maire compte les bouquets (de l'or selon le nombre, 5 de plus pour la lanterne). Au mieux : 11 bouquets, la lanterne, 15 pièces d'or. */
  marche:{
    or:10, but:10,
    maire:{t:'Barde ! Voici 10 pièces. Rapporte-moi au moins 10 bouquets pour la fête de ce soir !', bouton:'💐 En route pour le marché !'},
    /* avec Tendre l'oreille : cette écoute (bribes) se joue toute seule avant le marchandage de Fortuné */
    avant:'place_matin',
    fortune:{
      papier:4, prix:2,
      /* r : sa réplique ; fin : {or, lanterne} le marché est conclu ; vers : l'étape suivante ; sait : il a compris que tu veux la lanterne ;
         reste : on reste à la même étape, et cette réponse disparaît */
      relance:'Viens voir, j\'en ai d\'autres dans ma carriole !',
      etapes:[
        {t:'Psst ! De magnifiques fleurs en papier pour la fête ! 4 bouquets pour 2 pièces : moitié prix !', choix:[
          {q:'Marché conclu !', r:'Affaire conclue ! Tu ne le regretteras pas, mon ami.', fin:{or:2}},
          {q:'Vous me faites un prix ?', r:'C\'est déjà moitié prix, mon ami !', vers:1, relance:true},
          {q:'Je vais d\'abord voir chez Iris.', r:'Attends, attends !', vers:1, relance:true},
          {q:'Je peux les toucher ?', r:'Pas touche ! On regarde avec les yeux.', vers:1, relance:true}]},
        /* l'image spéciale (illus-fin.js, 'e3-carriole') : la bâche soulevée, une vieille lanterne cabossée qui brille ; aucun texte ne la décrit */
        {illu:'e3-carriole', choix:[
          {q:'Et ce vieux truc cabossé qui brille, là ?', r:'Ça ? Une vieille lanterne. Alors, on fait affaire ?', vers:2},
          {q:'Cette lanterne est magnifique ! Combien ?', r:'Un trésor : 10 pièces ! Alors, on fait affaire ?', vers:2, sait:true},
          {q:'Vous n\'avez pas de vraies fleurs ?', r:'Les miennes ne fanent jamais !', reste:true},
          {q:'Bon, je prends vos 4 bouquets.', r:'Affaire conclue ! Tu ne le regretteras pas, mon ami.', fin:{or:2}}]},
        {choix:[
          {q:'Je prends vos bouquets… si vous ajoutez la lanterne. Sinon, je file chez Iris.',
            r:'Tu es dur en affaires ! Bon… Elle vient des ruines, au-delà de la brume, comme ma vieille clé.', fin:{or:2, lanterne:true},
            siSait:{r:'La lanterne en plus ? Tu rêves, mon ami !', fin:{or:2}}},
          {q:'Une pièce de plus pour la lanterne ?',
            r:'Va pour une pièce, c\'est la fête ! Elle vient des ruines, au-delà de la brume.', fin:{or:3, lanterne:true},
            siSait:{r:'Allez, deux pièces, parce que c\'est la fête. Elle vient des ruines, au-delà de la brume.', fin:{or:4, lanterne:true}}},
          {q:'Elle est toute cabossée, elle ne vaut rien !', r:'Rien ?! Alors je la garde !', fin:{or:2}},
          {q:'Et contre une chanson ?', r:'Une chanson, ça ne se mange pas !', fin:{or:2}}]}
      ],
      plainte:'Remboursé ? Marchandise vendue, ni reprise ni échangée !'
    },
    /* chez le premier vrai fleuriste, les bouquets en papier se déchirent */
    dechire:'Oh là là… des fleurs en papier ! Elles se déchirent déjà !',
    vendeurs:{
      iris:{t:'Des fleurs pour la fête ? 2 pièces le bouquet.', prix:2, choix:[
        {q:'Je peux les sentir ? Mmmh…', r:'Enfin quelqu\'un qui prend le temps ! Pour toi, 1 pièce le bouquet.', prix:1},
        {q:'C\'est le maire qui paie : faites-moi un prix !', r:'Alors c\'est 2 pièces, comme tout le monde.'},
        {q:'Lesquelles sont les moins chères ?', r:'Toutes au même prix : 2 pièces.'},
        {q:'2 pièces ? C\'est du vol !', r:'Du vol ?! Va acheter tes fleurs ailleurs !', fache:true}],
        merci:'Voilà ! Prends-en bien soin.', encore:'Je voudrais des fleurs pour la fête.'},
      basile:{t:'Des fleurs ? Je suis coincé sur mon échelle avec ces lampions… 2 pièces le bouquet.', prix:2, choix:[
        {q:'Combien de bouquets pour 2 pièces ?', r:'Un bouquet, pardi !'},
        {q:'Attendez, je vous tiens l\'échelle !', r:'Ouf, merci ! Tiens, 3 bouquets de mon jardin : cadeau !', cadeau:3},
        {q:'Vos lampions sont magnifiques !', r:'Merci ! Mais c\'est 2 pièces quand même.'},
        {q:'Dépêchez-vous, je suis pressé !', r:'Je ne vends rien aux gens pressés !', fache:true}],
        merci:'Et voilà ! Tout frais du jardin.', encore:'Je voudrais des fleurs pour la fête.'}
    },
    /* l'après-midi, à la mairie : le maire compte les bouquets (min : à partir de combien), puis la lanterne */
    retour:{accueil:'Ah, Barde ! Alors, mes fleurs ?',
      paliers:[
        {min:10, or:10, t:'Bravo ! Voici 10 pièces d\'or pour ta peine.'},
        {min:9, or:5, t:'Il en manque un ! Bien mauvais négociateur… La fête sera belle quand même.'},
        {min:5, or:0, t:'Il manque des fleurs, mais la fête sera jolie quand même.'},
        {min:0, or:0, t:'Si peu ?! C\'est une fête ou un enterrement ?'}],
      lanterne:{or:5, t:'Une lanterne… comme celle que… Euh. Parfait : ce sera le clou de la fête !'}}
  },

  /* Les photos du tableau de liège du Barde (liege.js) ; les mots-clés (« Autre ») viendront avec la suite */
  liege:{pnj:['melusine', 'margot', 'iris', 'victor', 'fortune', 'tim', 'gaspard', 'farinel', 'anselme', 'silas', 'basile', 'levoisin', 'leo'],
    lieux:['clocher', 'puits', 'moulin', 'chene', 'mairie', 'place']},
  sensibles:[],
  recettes:[],
  /* Le registre du Sage (livre.js) */
  registre:{
    odette:{maison:'L2', note:'Elle vit avec ses sept chats. Elle ne sort jamais sans sa canne.'},
    levoisin:{maison:'L1', note:'Il habite en face de chez Odette, et il la connaît depuis trente ans.'},
    melusine:{maison:'L4', note:'Elle coud toutes les banderoles de la fête.'},
    victor:{maison:'L6', note:'Il passe partout, tous les jours, avec sa grosse sacoche de lettres.'},
    tim:{maison:'L7', note:'Du haut des toits, il voit tout le village. Son chien s\'appelle Pirate.'},
    gaspard:{maison:'F1', note:'Il prépare le plus gros gâteau de sa vie pour la fête.'},
    iris:{maison:'F4', note:'Elle vend des fleurs et des sachets de lavande à tout le village.'},
    basile:{maison:'B3', note:'Il accroche les lampions de la fête, du haut de son échelle.'},
    silas:{maison:'B1', note:'Le garde champêtre. Il obéit aux ordres du maire.'},
    /* (sa maison garde son visage sur la carte, grisée : il n'y est pas) */
    bastien:{maison:'B2', note:'Le charretier. Il est en prison depuis l\'affaire de la rivière rouge.'},
    margot:{adresse:'la taverne du Chaudron fêlé, sur la place', note:'Elle adore les vieilles légendes, et elle connaît le signe de chaque menteur.'},
    farinel:{adresse:'le moulin, au bord de la rivière', note:'Le meunier. Son apprenti s\'appelle Léo.'},
    leo:{adresse:'le moulin, au bord de la rivière', note:'L\'apprenti du meunier. On ne le voit presque jamais.'},
    anselme:{adresse:'le clocher', note:'Il sonne les trois cloches du village. Il est un peu sourd.'},
    fortune:{adresse:'sa carriole, sur la place', note:'Le colporteur. Il est le seul à traverser la brume.'},
    grosbec:{adresse:'la mairie, sur la place', note:'Le maire de Brumeval. Il ne quitte jamais ses gants gris, même à l\'intérieur.'}
  },
  objets:{},
  /* Les codes de l'enquête 3 (E3-actions-des-roles.md §4). Neufs : ils seront gelés à l'ouverture de l'enquête aux joueurs (codes-fixes.js).
     Étape 1 : ceux que le Barde donne ou reçoit le matin et l'après-midi. */
  infos:{
    poste:{nom:'La lettre n\'est pas passée par la poste', ic:'✉️', pour:'sage', de:'barde',
      t:'Victor, le facteur, n\'a pas apporté la lettre d\'Odette : elle n\'a ni timbre ni tampon. Et en vingt ans, Odette n\'a jamais reçu une seule lettre.',
      dire:'Une lettre sans timbre ? Le Sage doit le savoir : donne-lui ce code.'},
    capuchon:{nom:'Le capuchon vers le clocher', ic:'🧥', pour:'sage', de:'barde',
      t:'À l\'aube, du haut des toits, Tim a vu un grand capuchon glisser une lettre sous la porte de la mairie, puis repartir vers le clocher.',
      dire:'Qui porte une lettre comme ça ? Le Sage doit le savoir : donne-lui ce code.'},
    lettre:{nom:'La lettre d\'Odette', ic:'✉️', pour:['sage', 'alchimiste'], de:'barde',
      t:'Le maire a prêté la lettre d\'Odette. Le Sage peut la lire de près, et l\'Alchimiste peut l\'analyser dans son laboratoire.',
      dire:'La vraie lettre, en main ! Donne ce code au Sage et à l\'Alchimiste.'},
    carnet:{nom:'Le carnet d\'Odette', ic:'📓', pour:['sage', 'alchimiste'], de:'barde',
      t:'Le Barde a trouvé le carnet d\'Odette sur sa table, au 2, rue des Lanternes. Elle y note tout, un chat à chaque page.',
      dire:'Le carnet d\'Odette : donne ce code au Sage et à l\'Alchimiste.'},
    traces_moustache:{nom:'Les traces de Moustache', ic:'🐾', pour:'pisteur', de:'barde',
      t:'Chez Odette, du lait renversé… et des petites traces de pattes qui filent dehors, vers la place. Moustache, le gros chat gris, est passé par là !',
      dire:'Des traces toutes fraîches ! Le Pisteur saura les suivre : donne-lui ce code.'},
    ecriture:{nom:'L\'écriture de Mélusine', ic:'🖋️', pour:['barde', 'sage'], de:'alchimiste', pnj:'melusine',
      t:'L\'Alchimiste a comparé la lettre au Livre d\'or de la fête : les « M » qui piquent, les « t » en vague, le petit rond sur les « i »… C\'est l\'écriture de Mélusine !',
      dire:'Le Barde et le Sage doivent le savoir : donne-leur ce code.'},
    crypte_fermee:{nom:'La crypte est fermée', ic:'🗝️', pour:'barde', de:'pisteur', pnj:'anselme',
      t:'Le Pisteur a suivi les traces de Moustache jusqu\'à l\'église : elles passent sous la porte de la crypte, au pied du clocher. La porte est fermée à clé.',
      dire:'Il faudra la clé du sonneur… Le Barde saura lui parler : donne-lui ce code.'},
    aveu:{nom:'L\'aveu de Mélusine', ic:'🧵', pour:'sage', de:'barde',
      t:'Mélusine a avoué : c\'est elle qui a écrit la lettre, mot pour mot, sous la dictée d\'un homme en cape, à la voix étouffée, qui sentait la lavande. Il reviendra quand la Grosse Marie sonnera.',
      dire:'C\'est une preuve pour le Sage : donne-lui ce code.'},
    /* (étape 5, le Pisteur) ce qu'il reçoit et ce qu'il donne ; ceux du Sage, de l'Alchimiste et des grands dialogues du Barde
       arriveront avec leurs étapes : en attendant, ils se tapent comme les autres codes */
    six_doigts:{nom:'Moustache a six doigts', ic:'🐾', pour:'pisteur', de:'sage',
      t:'Dans le carnet d\'Odette, un dessin de Moustache et une flèche : « Mon gros gris a six doigts à chaque patte ! » Aucun autre chat du village n\'en a autant.',
      dire:'Le Pisteur saura reconnaître ses traces : donne-lui ce code.'},
    gui_pommier:{nom:'Le gui du pommier', ic:'🌳', pour:'pisteur', de:'alchimiste',
      t:'Le gui pousse tout en haut du vieux pommier, dans le potager de Basile. Bien trop haut pour l\'Alchimiste !',
      dire:'Le Pisteur sait grimper, lui : donne-lui ce code.'},
    gui:{nom:'Le gui', ic:'🌿', pour:'alchimiste', de:'pisteur',
      t:'Le Pisteur a grimpé dans le vieux pommier du potager et a cueilli une grosse touffe de gui.',
      dire:'L\'Alchimiste en a besoin pour ses potions : donne-lui ce code.'},
    cle_clou:{nom:'La clé est au clou', ic:'🔔', pour:'pisteur', de:'barde',
      t:'Anselme a pendu sa clé au clou, en haut du clocher. Quand les cloches sonnent, il ferme les yeux et compte les coups…',
      dire:'C\'est le moment de la décrocher ! Donne ce code au Pisteur.'},
    vieux_puits:{nom:'Le vieux puits', ic:'🕳️', pour:'pisteur', de:'barde',
      t:'Tim l\'a vu depuis les toits : Moustache vient de filer dans le vieux puits, entre les barreaux de la grille !',
      dire:'Le Pisteur doit y aller : donne-lui ce code.'}
  },
  /* ---------- Les lieux (étape 5 : le Pisteur ; E3-actions-des-roles.md §1) ----------
     L'Alchimiste ajoutera ses cueillettes à ces lieux (étape 4). Un seul essai par mini-jeu (essais.js) ; un filet (ouvrePartiel)
     seulement pour ce qui est indispensable : les traces de Moustache. Niveaux (rang de l'enquête 3 + mjNiveau, puis la courbe
     enfant / adulte, mj-core.js) : la clé d'Anselme, rang 7 (enfant 9, adulte 8) ; les traces, rang 5 sans « six doigts », rang 3 avec. */
  lieux:{
    place:{
      pisteur:{intro:'La place des Lanternes. Tout le village prépare la fête !', points:[
        {id:'banderoles', ic:'🎏', nom:'Les banderoles de la fête', moments:M_, mj:'tir', params:{decor:'banderoles'},
          avant:'Le maire veut des banderoles partout sur la place ! Vise les anneaux : chaque flèche emporte sa guirlande de petits drapeaux.',
          bouton:'🏹 Accrocher les banderoles',
          t:'Les petits drapeaux claquent au vent, d\'un toit à l\'autre. Basile lève le nez : « Ça, c\'est de la décoration ! »',
          rate:'Une guirlande s\'emmêle, puis une autre… Le maire soupire : « Bon. On fera sans. »',
          ferme:'Les banderoles restent dans leur panier.'},
        /* les traces de Moustache (il faut le code du Barde) : sans « Moustache a six doigts », du lait cache ses doigts sur la carte
           du départ et le niveau est plus dur ; avec, on voit ses six doigts (p.facileSi, moteur-actions.js). Le filet : raté, on
           entend un miaulement sous l'église, et le code est donné quand même. Pas de puits l'après-midi. */
        {id:'traces', ic:'🐾', nom:'Les traces de Moustache', moments:A_, mj:'traces', mjNiveau:2,
          besoin:[{code:'info:traces_moustache'}], visibleSi:[{code:'info:traces_moustache'}],
          /* chercher:10 (Romain, 20 h 51) : dix secondes pour trouver le départ des traces au milieu des autres pattes, puis tout avance */
          params:{decor:'ville', suspect:'chat', chercher:10, arrivee:'crypte', arriveeTxt:'La porte de la crypte !', carteFloue:true,
            departTitre:'Retiens bien cette trace', departNom:'Une patte de chat, dans le lait', departTxt:'Le lait cache ses doigts… Et au village, il y a plein de chats !'},
          facileSi:{si:[{code:'info:six_doigts'}], niveau:-2, params:{carteFloue:false, departNom:'Moustache : six doigts !', departTxt:'Compte bien ses doigts : aucun autre chat n\'en a autant.'}},
          donne:'info:crypte_fermee', ouvrePartiel:true,
          avant:'Des petites traces de pattes toutes fraîches traversent la place. Moustache est passé par là… Suis-le !',
          bouton:'🐾 Suivre les traces',
          t:'Les traces filent jusqu\'à l\'église… et passent sous la grille de la crypte, au pied du clocher. Fermée à clé ! Derrière, dans le noir, un miaulement.',
          rate:'Tu as perdu les traces… mais un miaulement monte de sous l\'église. La crypte ! Sa grille est fermée à clé.'}
      ]}
    },
    boulangerie:{
      pisteur:{intro:'La boulangerie de Gaspard. Ça sent la brioche chaude !', points:[
        /* une oie vue de dos, en ville (mj-pisteur-alchi.js : fuyard 'oie', décor 'ville') ; jamais plus que le niveau 4, comme Tim */
        {id:'oie', ic:'🦢', nom:'L\'oie de Gaspard', moments:M_, mj:'poursuite', mjNiveauMax:4, params:{fuyard:'oie', decor:'ville'},
          avant:'COUAC ! L\'oie de Gaspard s\'est sauvée de la cour, et elle file dans les rues ! Gaspard crie : « Sans elle, pas de festin ! » Rattrape-la !',
          bouton:'🏃 Courir après l\'oie',
          t:'Tu plonges… et tu l\'attrapes ! COUAC, COUAC ! Elle se débat, puis se calme dans tes bras. Gaspard la serre contre lui : « Ma belle ! Te voilà ! »',
          rate:'Elle est trop rapide ! L\'oie disparaît au coin de la rue, en battant des ailes. Gaspard s\'arrache les cheveux.',
          ferme:'L\'oie court encore quelque part dans Brumeval…'}
      ]}
    },
    mairie:{
      pisteur:{intro:'La mairie. Le maire n\'aime pas qu\'on fouine dans ses papiers…', points:[
        /* la lettre, en se cachant : pour quand le Barde n'a pas su la demander au maire (le même code que lui) */
        /* (decor 'mairie' : l'intérieur de la mairie, et au bout le bureau du maire avec la lettre — Romain, 21 h 21) */
        {id:'lettre', ic:'🫥', nom:'La lettre, en cachette', moments:A_, mj:'cachette', params:{decor:'mairie'}, donne:'info:lettre',
          avant:'Le maire garde la lettre d\'Odette sur son bureau. Traverse la mairie sans te faire voir, jusqu\'à son bureau !',
          bouton:'🫥 Se faufiler',
          t:'Tu te glisses derrière le grand rideau. Le maire compte ses papiers un par un… puis il sort. La lettre est sur le dessus.',
          rate:'« Qui va là ?! » On t\'a vu. Tu files sans demander ton reste.',
          ferme:'Le garde surveille la mairie, maintenant.'},
        /* rendre sa mission : dès qu'une des deux missions de fête est réussie */
        {id:'mission', ic:'🎉', nom:'Rendre ta mission au maire', moments:A_, or:5, visibleSi:[{vu:'pisteur:place:banderoles'}, {vu:'pisteur:boulangerie:oie'}],
          t:'Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde sur la place jusqu\'à minuit ! »',
          variantes:[
            {si:[{et:[{vu:'pisteur:place:banderoles'}, {vu:'pisteur:boulangerie:oie'}]}], t:'Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde sur la place jusqu\'à minuit ! »'},
            {si:[{vu:'pisteur:place:banderoles'}], t:'Le maire : « Des banderoles… mais pas d\'oie ? Tant pis ! Ce soir, tout le monde sur la place jusqu\'à minuit ! »'},
            {si:[{vu:'pisteur:boulangerie:oie'}], t:'Le maire : « Une oie… mais pas de banderoles ? Bon, bon. Ce soir, tout le monde sur la place jusqu\'à minuit ! »'}]}
      ]}
    },
    potager:{
      pisteur:{intro:'Le potager de Basile : des choux, des poireaux, et un vieux pommier tout tordu.', points:[
        /* le gui (E3-atelier-des-plantes.md §7) : avec le code de l'Alchimiste ; pas de mini-jeu */
        {id:'gui', ic:'🌳', nom:'Grimper au vieux pommier', moments:['matin', 'apresmidi'], besoin:[{code:'info:gui_pommier'}], visibleSi:[{code:'info:gui_pommier'}], donne:'info:gui',
          t:'Une branche, deux branches… Basile crie d\'en bas : « Pas sur mes pommes ! » Tu attrapes une grosse touffe de gui.'}
      ]}
    },
    clocher:{
      pisteur:{intro:'Le clocher. Tout là-haut dort la Grosse Marie, la plus vieille cloche du village.', points:[
        /* la clé d'Anselme : avec « La clé est au clou » (le Barde) ; difficile, un seul essai. Raté : le puits apparaît (puits, plus bas) */
        /* (decor 'clocher' : la nef, la sacristie, et tout en haut la Grosse Marie, Anselme et le Barde, la clé au clou — Romain, 21 h 21) */
        {id:'cle', ic:'🗝️', nom:'La clé d\'Anselme', moments:['nuit'], mj:'cachette', mjNiveau:4, params:{decor:'clocher'},
          besoin:[{code:'info:cle_clou'}], visibleSi:[{code:'info:cle_clou'}],
          avant:'Les cloches sonnent ! Là-haut, Anselme compte les coups, les yeux fermés. Traverse l\'église et monte tout en haut du clocher sans te faire voir. Un seul essai !',
          bouton:'🫥 Se faufiler',
          t:'DONG ! DONG ! Anselme compte les coups, les yeux fermés. La clé est au clou… Tu la décroches.',
          rate:'« Qui va là ?! » Anselme raccroche la clé à sa ceinture. En redescendant, tu vois Moustache filer vers la forêt… vers le vieux puits !',
          ferme:'Anselme garde sa clé à la ceinture.'},
        /* la clé en main : la grille s'ouvre (la descente dans le donjon se branche à l'étape 6) */
        {id:'crypte', ic:'🕯️', nom:'La grille de la crypte', moments:['nuit'], besoin:[{vu:'pisteur:clocher:cle'}], visibleSi:[{vu:'pisteur:clocher:cle'}],
          t:'La clé tourne : clac ! La grille grince. Un escalier de pierre descend dans le noir… Moustache file devant toi en miaulant.'}
      ]}
    },
    puits:{
      pisteur:{intro:'Le vieux puits, au bord de la forêt. Plus personne n\'y tire d\'eau depuis longtemps.', points:[
        /* seulement si la clé d'Anselme est ratée, ou avec « Le vieux puits » du Barde ; jamais si la clé a été prise.
           (L'acide de l'Alchimiste, qui fait fondre les barreaux, arrive avec le sac, à l'étape 6.) */
        {id:'grille', ic:'🕳️', nom:'La grille du vieux puits', moments:['nuit'], visibleSi:[{rate:'pisteur:clocher:cle'}, {code:'info:vieux_puits'}], cacheSi:[{vu:'pisteur:clocher:cle'}],
          t:'Une vieille grille rouillée. Moustache passe entre les barreaux… toi, non.'}
      ]}
    }
  },

  /* ---------- Les villageois (E3-dialogues-et-trame.md §2 et §3) ----------
     Chacun a une place à chaque moment : ou (on lui parle), sinon carte + occupe (deux petites phrases : la deuxième quand on revient). */
  pnj:{
    /* le maire ne ment jamais. Le matin, il attend ses fleurs ; l'après-midi, il les compte (marche.retour), puis ses questions.
       Sa 4e question (« Je voudrais vous parler de la lettre… », le grand dialogue) arrive avec l'étape 2. */
    grosbec:{ou:{apresmidi:'mairie'}, carte:{matin:'mairie'},
      occupe:{matin:['« Mes fleurs d\'abord, Barde ! Nous parlerons cet après-midi. »', '« Dix bouquets, pas un de moins ! Allez, allez ! »']},
      salut:'', questions:[
      {q:'D\'où vient cette lettre, Monsieur le maire ?', g:'e', moments:A_, a:'Glissée sous la porte de la mairie, ce matin. Quel soulagement, n\'est-ce pas ?',
        note:'Le maire : la lettre a été glissée sous la porte de la mairie, ce matin.'},
      {q:'Pourquoi une fête, alors qu\'Odette n\'est pas rentrée ?', g:'h', moments:A_, a:'Un village rassuré ne pose plus de questions. Euh… un village rassuré est un village heureux !',
        note:'Le maire : « Un village rassuré ne pose plus de questions. Euh… un village rassuré est un village heureux ! »'},
      {q:'Vous connaissez Odette depuis longtemps ?', g:'h', moments:A_, a:'Depuis toujours : nos deux familles sont là depuis la fondation. Il n\'en reste plus beaucoup.',
        note:'Le maire : sa famille et celle d\'Odette sont à Brumeval depuis la fondation. Il n\'en reste plus beaucoup.'}
    ]},
    gaspard:{ou:{matin:'boulangerie'}, carte:{apresmidi:'boulangerie'},
      occupe:{apresmidi:['« Pas maintenant, j\'ai sept étages de gâteau qui penchent ! »', '« Si je lâche ma poche à douille, tout s\'écroule ! »']},
      salut:'Bonjour ! C\'est le coup de feu, mais pour toi, j\'ai une minute.', questions:[
      {q:'Et le maire, il est comment ?', g:'r', moments:M_, a:'Très fier de ses fêtes ! Il m\'a commandé le plus gros gâteau de ma vie.',
        note:'Gaspard : le maire est très fier de ses fêtes.'},
      {q:'Odette est toujours votre première cliente ?', g:'e', moments:M_, a:'Une brioche chaque matin. Ce matin, ses chats l\'attendaient devant ma porte… tous sauf Moustache, le gros gris.',
        note:'Gaspard : ce matin, les chats d\'Odette attendaient devant sa porte… tous sauf Moustache, le gros gris.'},
      {q:'Qu\'est-ce que vous pensez de la lettre ?', g:'e', moments:M_, a:'Odette parle de sa canne, mais pas un mot de ses chats. Elle qui ne parle que d\'eux !',
        note:'Gaspard : dans la lettre, Odette parle de sa canne, mais pas un mot de ses chats. Elle qui ne parle que d\'eux !'},
      {q:'Votre four est vraiment si vieux ?', g:'h', moments:M_, a:'Au fond, ses briques portent des étoiles gravées. Personne ne sait qui les a faites.',
        note:'Gaspard : au fond de son vieux four, les briques portent des étoiles gravées.'}
    ]},
    margot:{ou:{matin:'taverne', apresmidi:'taverne'}, salut:'Bienvenue au Chaudron fêlé ! Ce soir, c\'est la fête !', questions:[
      {q:'Et le maire, il est comment ?', g:'r', moments:M_, a:'Il déteste qu\'on dise qu\'il cache des choses. Un jour, j\'ai parlé d\'un coffre secret : tout rouge !',
        note:'Margot : le maire déteste qu\'on dise qu\'il cache des choses.'},
      {q:'Odette est vraiment chez sa sœur ?', g:'e', moments:M_, a:'Bien sûr ! Elle m\'en parle tout le temps.', ment:true,
        vrai:'Bon… non. Je ne l\'ai jamais entendue parler d\'une sœur, mais tout le monde était si content…',
        note:'Margot dit qu\'Odette lui parle tout le temps de sa sœur.', noteVrai:'Margot a avoué : elle n\'a jamais entendu Odette parler d\'une sœur.'},
      {q:'Quelle est la plus vieille légende de Brumeval ?', g:'h', moments:M_, a:'Celle des Cinq : cinq familles ont bâti le village sur une ville plus vieille. Un jour, leurs enfants reviendront…',
        note:'Margot : la légende des Cinq. Cinq familles ont bâti le village sur une ville plus vieille. Un jour, leurs enfants reviendront…'},
      {q:'Qu\'est-ce qui se prépare pour la fête ?', g:'r', moments:M_, a:'Mélusine coud des banderoles jour et nuit, avec du tissu tout neuf… elle qui n\'a jamais un sou !',
        note:'Margot : Mélusine coud des banderoles avec du tissu tout neuf, elle qui n\'a jamais un sou.'},
      {q:'Vous connaissez bien Léo, l\'apprenti ?', g:'r', moments:A_, a:'Il n\'a pas de parents. C\'est Odette qui lui a appris à lire, le soir.',
        note:'Margot : Léo n\'a pas de parents. C\'est Odette qui lui a appris à lire.'},
      {q:'Le maire vous a demandé quelque chose pour ce soir ?', g:'e', moments:A_, a:'Non, rien du tout ! Juste servir la soupe.', ment:true,
        vrai:'Bon… si : garder tout le monde sur la place jusqu\'à minuit. Il avait l\'air si sérieux…',
        note:'Margot dit que le maire ne lui a rien demandé, à part servir la soupe.', noteVrai:'Margot a avoué : le maire lui a demandé de garder tout le monde sur la place jusqu\'à minuit.'},
      {q:'Vous avez entendu du bruit, la nuit dernière ?', g:'e', moments:A_, a:'Vers minuit, une petite lumière bougeait dans la forêt, du côté du vieux puits. J\'ai fermé mes volets !',
        note:'Margot : la nuit dernière, vers minuit, une petite lumière bougeait dans la forêt, du côté du vieux puits.'},
      {q:'Qui étaient les Cinq familles ?', g:'h', moments:A_, a:'Ma grand-mère ne disait pas leurs noms. Seulement : « une pour chercher, une pour soigner, une pour parler, une pour savoir… et une pour garder. »',
        note:'Margot : les Cinq familles. « Une pour chercher, une pour soigner, une pour parler, une pour savoir… et une pour garder. »'}
    ]},
    victor:{ou:{matin:'poste'}, carte:{apresmidi:'puits'},
      occupe:{apresmidi:['« Cent invitations à distribuer : pas une minute ! »', '« Le maire ne les a même pas écrites lui-même : « écriture de patte de mouche », qu\'il dit ! »']},
      salut:'Bonjour ! Une lettre pour toi ? Ah non…', questions:[
      {q:'Et le maire, il est comment ?', g:'r', moments:M_, a:'Très ordonné : il compte les papiers de son grand coffre chaque soir. Gare à qui en emprunte un !',
        note:'Victor : le maire compte les papiers de son grand coffre chaque soir. Gare à qui en emprunte un !'},
      {q:'C\'est vous qui avez apporté la lettre d\'Odette ?', g:'e', moments:M_, donne:'info:poste', a:'Non ! Ni timbre ni tampon. Et en vingt ans, Odette n\'a jamais reçu une seule lettre.',
        note:'Victor : il n\'a pas apporté la lettre d\'Odette. Ni timbre ni tampon ! Et en vingt ans, Odette n\'a jamais reçu une seule lettre (code pour le Sage).'},
      {q:'Quel est l\'endroit le plus étrange de votre tournée ?', g:'h', moments:M_, a:'Le vieux puits. Les jours de brume, j\'entends de l\'eau couler au fond… alors qu\'il est sec depuis cent ans !',
        note:'Victor : au vieux puits, les jours de brume, il entend de l\'eau couler au fond. Il est sec depuis cent ans !'},
      {q:'Vous n\'avez jamais peur, pendant votre tournée ?', g:'h', moments:M_, a:'Peur, moi ? Jamais !', ment:true,
        vrai:'Bon… si : j\'ai peur des chats. Et depuis hier, ceux d\'Odette me suivent partout en miaulant. Ils ont faim !',
        note:'Victor dit qu\'il n\'a jamais peur.', noteVrai:'Victor a avoué : il a peur des chats. Depuis hier, ceux d\'Odette le suivent partout en miaulant : ils ont faim !'},
      /* une question de plus, avec l'écoute de la mairie, le matin (le maire et Victor) */
      {q:'Le maire vous a demandé de vous taire ?', g:'e', moments:M_, besoin:[{vu:'barde:oreille:mairie_matin'}], a:'Oui… Pourquoi cacher d\'où vient une lettre qui rassure tout le monde ?',
        note:'Victor : le maire lui a demandé de se taire sur la lettre. Pourquoi cacher d\'où elle vient ?'}
    ]},
    /* après le marchandage, c'est un villageois comme les autres (pas de salut : il vient de te vendre des fleurs) */
    fortune:{ou:{matin:'place', apresmidi:'place'}, salut:'', questions:[
      {q:'Et le maire, il est comment ?', g:'r', moments:M_, a:'Il adore qu\'on lui parle de son chapeau neuf !', ment:true,
        vrai:'Bon… c\'est surtout moi qui voudrais lui vendre un chapeau.',
        note:'Fortuné dit que le maire adore qu\'on lui parle de son chapeau neuf.', noteVrai:'Fortuné a avoué : c\'est surtout lui qui voudrait vendre un chapeau au maire.'},
      {q:'D\'où venez-vous, avec votre carriole ?', g:'h', moments:M_, a:'De partout ! Je suis le seul à traverser la brume… et elle me regarde, j\'en suis sûr.',
        note:'Fortuné : il est le seul à traverser la brume. Il est sûr qu\'elle le regarde.'},
      {q:'Vous avez revu l\'homme en cape noire ?', g:'r', moments:M_, a:'Jamais revu. Mais hier soir, une main fine m\'a acheté encre et plume, des épingles plantées dans la manche.',
        note:'Fortuné : hier soir, une main fine lui a acheté de l\'encre et une plume. Il y avait des épingles plantées dans la manche.'},
      /* (dès cette réponse, la vieille clé rouillée entrera dans la boutique du Barde : 320 pièces, § 13.9 — à brancher avec les objets) */
      {q:'Qu\'est-ce que vous vendez de plus précieux ?', g:'h', moments:M_, a:'Ça ! Une vieille clé couverte de runes, trouvée dans des ruines au-delà de la brume. Personne n\'en veut.',
        note:'Fortuné : il vend une vieille clé couverte de runes, trouvée dans des ruines au-delà de la brume.'},
      {q:'Vous connaissez Léo, l\'apprenti du meunier ?', g:'r', moments:A_, a:'Il adore l\'or ! Propose-lui une pièce, il te dira tout.', ment:true,
        vrai:'Bon… c\'est moi qui adore l\'or. Lui, il a peur : il m\'a acheté deux lanternes et une corde en tremblant.',
        note:'Fortuné dit que Léo adore l\'or : « Propose-lui une pièce, il te dira tout. »', noteVrai:'Fortuné a avoué : c\'est lui qui adore l\'or. Léo, lui, a peur : il a acheté deux lanternes et une corde en tremblant.'},
      {q:'Elle vous plaît, la fête ?', g:'h', moments:A_, a:'Tous mes lampions vendus ! Sauf un qui ne s\'allume pas…',
        note:'Fortuné : il a vendu tous ses lampions, sauf un qui ne s\'allume pas.'},
      {q:'Vous traversez la brume, cette nuit ?', g:'h', moments:A_, a:'Jamais ! Les nuits de fête, la brume colle au village comme un chat à son coussin.',
        note:'Fortuné : les nuits de fête, la brume colle au village comme un chat à son coussin.'},
      {q:'D\'où vient votre vieille clé rouillée ?', g:'h', moments:A_, a:'Des ruines, au-delà de la brume. Il y a les mêmes dessins que sur ta lanterne… enfin, ma lanterne !',
        note:'Fortuné : sa vieille clé vient des ruines, au-delà de la brume. Elle porte les mêmes dessins que la vieille lanterne.'}
    ]},
    /* le matin, il ramone près du clocher ; l'après-midi, sur les toits de la ruelle des Brumes */
    tim:{ou:{matin:'clocher', apresmidi:'ruelle'}, salut:'Salut ! Attention, ça tombe !', questions:[
      {q:'Tu étais sur les toits ce matin, à l\'aube ?', g:'e', moments:M_, a:'Non ! Je dormais, comme tout le monde.', ment:true, donneVrai:'info:capuchon',
        vrai:'Bon… oui. Un grand capuchon a glissé une lettre sous la porte de la mairie, puis il est parti vers le clocher.',
        note:'Tim dit qu\'à l\'aube, il dormait, comme tout le monde.', noteVrai:'Tim a avoué : à l\'aube, un grand capuchon a glissé une lettre sous la porte de la mairie, puis il est parti vers le clocher (code pour le Sage).'},
      {q:'Ça fait quoi, d\'être ramoneur ?', g:'h', moments:M_, a:'Je vois tout le village ! Et dans une cheminée, j\'ai trouvé une pièce avec une lanterne dessinée.',
        note:'Tim : dans une cheminée, il a trouvé une pièce avec une lanterne dessinée.'},
      {q:'Comment va Pirate, ton chien ?', g:'h', moments:M_, a:'Il ouvre le loquet tout seul ! Mais dès qu\'il voit le maire, il file sous mon lit.',
        note:'Tim : son chien Pirate ouvre le loquet tout seul. Dès qu\'il voit le maire, il file sous le lit.'},
      {q:'Tu as revu la porte aux runes ?', g:'h', moments:M_, a:'Bouchée par les rochers. Mais les mêmes runes sont sur la grille de la crypte !',
        note:'Tim : la porte aux runes est bouchée par les rochers. Les mêmes runes sont sur la grille de la crypte !'},
      {q:'Tu connais Léo ?', g:'r', moments:A_, a:'L\'autre jour, il m\'a chuchoté : « Si on sait que je t\'ai parlé, je suis fichu. Il a des yeux partout. »',
        note:'Tim : Léo lui a chuchoté : « Si on sait que je t\'ai parlé, je suis fichu. Il a des yeux partout. »'},
      {q:'C\'est toi qui as pris la lavande d\'Iris ?', g:'e', moments:A_, a:'Moi ? Jamais de la vie !', ment:true,
        vrai:'Bon… un sachet, pour Pirate : il sent le chien mouillé. Mais cette nuit, quelqu\'un en a pris tout un panier !',
        note:'Tim dit qu\'il n\'a jamais pris la lavande d\'Iris.', noteVrai:'Tim a avoué : il a pris un sachet de lavande pour son chien. Mais cette nuit, quelqu\'un en a pris tout un panier !'},
      {q:'Qu\'est-ce que tu vois, du haut des toits ?', g:'e', moments:A_, a:'Des lampions partout ! Et Mélusine qui coud, qui coud… Elle a les yeux tout rouges.',
        note:'Tim : du haut des toits, il voit Mélusine qui coud sans arrêt. Elle a les yeux tout rouges.'},
      {q:'Tu viens à la fête, ce soir ?', g:'h', moments:A_, a:'Évidemment : un gâteau à sept étages ! Mais à minuit, loin du clocher : la Grosse Marie, ça casse les oreilles.',
        note:'Tim : à minuit, il se tiendra loin du clocher. La Grosse Marie, ça casse les oreilles !'}
    ]},
    /* le voisin d'Odette, au 1, rue des Lanternes (il ne ment jamais) : un vrai villageois à l'enquête 3 (« voisin », plus bas, reste la porte d'Odette) */
    levoisin:{ou:{matin:'L1'}, carte:{apresmidi:'L1'},
      occupe:{apresmidi:['« Pas maintenant : les six chats ont faim, ils me griffent les mollets ! »', '« Je surveille la maison d\'Odette. Repasse ce soir. »']},
      salut:'Bonjour… Tu viens pour Odette ?', questions:[
      {q:'Les chats d\'Odette sont chez vous ?', g:'e', moments:M_, a:'Six sur sept, sur ma fenêtre ! Moustache, le gros gris, a disparu hier soir.',
        note:'Le voisin : six des sept chats d\'Odette sont sur sa fenêtre. Moustache, le gros gris, a disparu hier soir.'},
      {q:'Odette vous a dit qu\'elle partait ?', g:'e', moments:M_, a:'Odette ne part jamais ! Elle dit toujours : « Mes chats ne savent pas ouvrir les boîtes de sardines. »',
        note:'Le voisin : Odette ne part jamais. « Mes chats ne savent pas ouvrir les boîtes de sardines. »'},
      {q:'Vous connaissez Odette depuis longtemps ?', g:'r', moments:M_, a:'Trente ans ! Elle note tout dans un carnet, un chat à chaque page. Il doit être sur sa table.',
        note:'Le voisin : Odette note tout dans un carnet, un chat à chaque page. Il doit être sur sa table.'},
      {q:'Si on rapporte sa canne, vous la surveillerez ?', g:'h', moments:M_, a:'Bien sûr ! Enfin… tant que je ne m\'endors pas.',
        note:'Le voisin veut bien surveiller la canne d\'Odette… tant qu\'il ne s\'endort pas.'}
    ]},
    /* la maison d'Odette, au 2, rue des Lanternes (l'après-midi) : une visite, sans questions ; deux codes d'un coup */
    voisin:{ou:{apresmidi:'L2'}, salut:'La maison d\'Odette. La porte n\'est toujours pas fermée à clé…', questions:[
      {q:'Poser la canne d\'Odette', donne:['info:carnet', 'info:traces_moustache'], titreDonne:'Chez Odette',
        a:'Tu poses la canne contre la porte. Sur la table, le carnet d\'Odette. Par terre, du lait renversé… et des petites traces qui filent dehors !',
        note:'Chez Odette : tu as posé sa canne contre la porte. Sur la table, son carnet. Par terre, du lait renversé, et des petites traces qui filent dehors.'}
    ]},
    /* occupée le matin ; l'après-midi, dans son atelier, elle coud les banderoles (elle ment) */
    melusine:{ou:{apresmidi:'atelier'}, carte:{matin:'atelier'},
      occupe:{matin:['« Pas maintenant ! Je viens de coudre ma manche à la banderole de Pompon… »', '« Encore toi ? Attention à mes épingles ! Repasse cet après-midi. »']},
      salut:'Bonjour… Attention aux épingles.', questions:[
      /* sans le code de l'Alchimiste : elle se ferme. Avec « L'écriture de Mélusine », cette question laisse la place à la dernière. */
      {q:'Vous avez entendu la lettre d\'Odette ?', g:'e', moments:A_, cacheSi:[{code:'info:ecriture'}], a:'De loin… Je ne sais rien de cette lettre, moi !', ment:true,
        vrai:'Bon… si. Je ne peux pas en dire plus. Pas maintenant.',
        note:'Mélusine dit qu\'elle ne sait rien de la lettre d\'Odette.', noteVrai:'Mélusine, les larmes aux yeux : elle sait quelque chose sur la lettre, mais elle ne peut pas en dire plus. Pas maintenant.'},
      {q:'Pourquoi Odette part-elle toujours avec sa canne ?', g:'e', moments:A_, a:'Je la lui ai offerte, avec sept chats gravés. Elle ne la quitterait pour rien au monde.',
        note:'Mélusine : c\'est elle qui a offert sa canne à Odette. Odette ne la quitterait pour rien au monde.'},
      {q:'Vous avez acheté du beau tissu neuf ?', g:'e', moments:A_, a:'Ce vieux tissu ? Il traînait dans mon grenier !', ment:true,
        vrai:'Bon… je l\'ai acheté hier, avec de l\'or qu\'on m\'a donné. Ne me demande pas qui.',
        note:'Mélusine dit que son tissu traînait dans son grenier.', noteVrai:'Mélusine a avoué : elle a acheté son tissu hier, avec de l\'or qu\'on lui a donné. Elle ne dit pas qui.'},
      {q:'Qu\'est-ce que vous cousez pour la fête ?', g:'h', moments:A_, a:'Une banderole par chat : Moustache, Biscotte, Pompon, Caramel, Mistigri, Noisette, Grisette. Moustache retrouve toujours Odette.',
        note:'Mélusine : les sept chats d\'Odette s\'appellent Moustache, Biscotte, Pompon, Caramel, Mistigri, Noisette et Grisette. Moustache retrouve toujours Odette.'},
      /* avec le code de l'Alchimiste. Démasquée : son aveu, et le code pour le Sage (le filet : la nuit, à la fête, étape 7) */
      {q:'C\'est votre écriture, sur la lettre d\'Odette.', g:'e', moments:A_, besoin:[{code:'info:ecriture'}], a:'Mon écriture ? Tout le monde écrit comme ça, à Brumeval !', ment:true, donneVrai:'info:aveu',
        vrai:'C\'est moi… Un homme en cape m\'a payée pour l\'écrire, mot pour mot. Voix étouffée, odeur de lavande. Il revient quand la Grosse Marie sonnera.',
        note:'Mélusine dit que tout le monde écrit comme elle, à Brumeval.', noteVrai:'Mélusine a avoué : un homme en cape l\'a payée pour écrire la lettre, mot pour mot. Voix étouffée, odeur de lavande. Il revient quand la Grosse Marie sonnera (code pour le Sage).'}
    ]},
    /* le matin et l'après-midi, elle ne fait que vendre ses fleurs (marche.js), puis elle est occupée ; ses questions d'enquête : plus tard */
    iris:{carte:{matin:'herboristerie', apresmidi:'herboristerie'},
      occupe:{matin:['« Chut ! Je parle à mes fleurs : si je m\'arrête, elles fanent. »', '« Quarante-sept bouquets à faire ! Plus tard ! »'],
        apresmidi:['« Chut ! Je fais les couronnes de ce soir. »', '« Si c\'est pour des fleurs, d\'accord. Sinon, à ce soir ! »']},
      questions:[]},
    /* un peu sourd, il parle fort (il ne ment jamais) */
    anselme:{ou:{apresmidi:'clocher'}, carte:{matin:'clocher'},
      occupe:{matin:['« QUOI ? JE N\'ENTENDS RIEN ! » DONG !', '« UNE BRIOCHE ? NON MERCI, J\'AI DÉJÀ MANGÉ ! » DONG !']},
      salut:'HEIN ? AH, C\'EST TOI !', questions:[
      {q:'Vous m\'entendez bien, Anselme ?', g:'r', moments:A_, a:'HEIN ? Ah ! Parle-moi FORT et LEN-TE-MENT. Et ne me presse jamais : quand on me presse, je n\'entends plus rien !',
        note:'Anselme : il faut lui parler fort et lentement, et ne jamais le presser.'},
      {q:'Qu\'y a-t-il sous le clocher ?', g:'r', moments:A_, a:'La crypte des Fondateurs, fermée à clé. Quand je sonne, je pends la clé au clou, près de la corde.',
        note:'Anselme : sous le clocher, la crypte des Fondateurs, fermée à clé. Quand il sonne, il pend la clé au clou, près de la corde.'},
      {q:'Comment s\'appellent vos cloches ?', g:'r', moments:A_, a:'Bertille, Gontran et la Grosse Marie. Mon père disait : « Quand la brume s\'épaissit, sonne la Grosse Marie : elle la fait reculer. »',
        note:'Anselme : ses cloches s\'appellent Bertille, Gontran et la Grosse Marie. Son père disait : « Quand la brume s\'épaissit, sonne la Grosse Marie : elle la fait reculer. »'},
      {q:'Que ferez-vous pendant la fête ?', g:'e', moments:A_, a:'L\'ouverture, puis la Grosse Marie à minuit PILE. Le maire y tient tellement… je me demande pourquoi !',
        note:'Anselme : il sonnera l\'ouverture de la fête, puis la Grosse Marie à minuit pile. Le maire y tient beaucoup.'}
    ]},
    farinel:{ou:{apresmidi:'moulin'}, carte:{matin:'moulin'},
      occupe:{matin:['« Pas le temps : mon apprenti n\'est pas là ! Atchoum ! »', '« Regarde-moi : un vrai fantôme de farine ! Reviens cet après-midi. »']},
      salut:'Bonjour, bonjour ! Tu veux de la farine ?', questions:[
      {q:'Où est Léo, votre apprenti ?', g:'e', moments:A_, a:'Pas dormi au moulin, des bottes pleines de boue, et ce mot : « Ne m\'attendez pas ce soir. »',
        note:'Farinel : Léo n\'a pas dormi au moulin. Il a laissé des bottes pleines de boue, et ce mot : « Ne m\'attendez pas ce soir. »'},
      /* il épingle le signe de Léo sur le liège (Léo ment d'entrée, la nuit) */
      {q:'Léo est un bon apprenti ?', g:'r', moments:A_, mimique:'leo', a:'Un froussard : quand il a peur, il se ferme comme une huître. Parle-lui doucement… et voilà son truc pour mentir, je te l\'épingle.',
        note:'Farinel : quand Léo a peur, il se ferme comme une huître. Il faut lui parler doucement. Son signe de menteur est sur ton tableau de liège.'},
      {q:'Vous viendrez à la fête, ce soir ?', g:'h', moments:A_, a:'Bien sûr ! Je danserai toute la nuit !', ment:true,
        vrai:'Bon… je vais dormir. Je m\'endors toujours avant le dessert.',
        note:'Farinel dit qu\'il dansera toute la nuit.', noteVrai:'Farinel a avoué : il s\'endort toujours avant le dessert.'},
      {q:'Votre moulin est vraiment si vieux ?', g:'h', moments:A_, a:'Le plus vieux de Brumeval ! Une pierre du mur porte une lanterne gravée.',
        note:'Farinel : son moulin est le plus vieux de Brumeval. Une pierre du mur porte une lanterne gravée.'}
    ]},
    /* le matin, sur la place (sa « mission secrète », et Fortuné qui vend sans permis) ; l'après-midi, devant la mairie.
       Il ne ment pas : il croit à l'éboulement. */
    silas:{ou:{apresmidi:'mairie'}, carte:{matin:'place'},
      occupe:{matin:['« Halte ! Mission secrète. Si secrète que même moi, je ne la connais pas. »', '« Chut ! Je surveille une fourmi très suspecte. »']},
      salut:'Halte ! Ah, c\'est toi.', questions:[
      {q:'Vous gardez encore le chemin du Vieux Chêne ?', g:'h', moments:A_, a:'Ordre du maire : danger d\'éboulement ! Et ce soir, je garde la fête.',
        note:'Silas : le chemin du Vieux Chêne reste fermé, par ordre du maire. Ce soir, il garde la fête.'},
      {q:'C\'est vous qui avez emmené Bastien en prison ?', g:'e', moments:A_, a:'Oui, et il pleurait. Un homme en cape l\'a payé : il en a plus peur que de la prison.',
        note:'Silas : Bastien a plus peur de l\'homme en cape que de la prison.'},
      {q:'Vous avez fait votre ronde, cette nuit ?', g:'e', moments:A_, a:'Je n\'ai rien vu… sauf la porte du clocher qui grinçait. Le vent, sûrement.',
        note:'Silas : cette nuit, la porte du clocher grinçait. « Le vent, sûrement. »'},
      {q:'Pourquoi êtes-vous devenu garde ?', g:'r', moments:A_, a:'Petit, je me suis perdu trois jours dans la brume. Le père d\'Anselme m\'a retrouvé en sonnant toute la nuit.',
        note:'Silas : petit, il s\'est perdu trois jours dans la brume. Le père d\'Anselme l\'a retrouvé en sonnant toute la nuit.'}
    ]},
    /* sur la place, sur son échelle : le matin, il vend ses fleurs (marche.js), puis il est occupé ; l'après-midi, ses questions (il ne ment jamais) */
    basile:{ou:{apresmidi:'place'}, carte:{matin:'place'},
      occupe:{matin:['« Pas maintenant, j\'ai les bras pleins de lampions ! »', '« Attention en dessous ! Oups… Reviens cet après-midi. »']},
      salut:'Ah, te revoilà ! Tiens-moi cette guirlande, tu veux ?', questions:[
      {q:'Vous décorez la place pour la fête ?', g:'e', moments:A_, a:'La fête jusqu\'à minuit : le maire n\'a jamais fait ça !',
        note:'Basile : une fête jusqu\'à minuit, le maire n\'a jamais fait ça.'},
      {q:'Anselme est quelqu\'un de gentil ?', g:'r', moments:A_, a:'Bourru, mais gentil. Il ne prête rien… sauf à ceux qui l\'aident à sonner la Grosse Marie : elle est si lourde !',
        note:'Basile : Anselme ne prête rien… sauf à ceux qui l\'aident à sonner la Grosse Marie, qui est si lourde.'},
      {q:'Vous connaissez le vieux puits ?', g:'h', moments:A_, a:'Sa grille est rouillée depuis toujours. Mon grand-père disait qu\'au fond, il y a une porte.',
        note:'Basile : la grille du vieux puits est rouillée depuis toujours. Son grand-père disait qu\'au fond, il y a une porte.'},
      {q:'Quelle est votre fleur préférée ?', g:'h', moments:A_, a:'La pensée sauvage : elle pousse même dans la brume. Les Alchimistes d\'autrefois en mettaient dans toutes leurs potions.',
        note:'Basile : la pensée sauvage pousse même dans la brume. Les Alchimistes d\'autrefois en mettaient dans toutes leurs potions.'}
    ]}
  },
  ecoutes:[],
  /* 👂 Les écoutes aux portes (talent « Tendre l'oreille », barde.js : B.porteIci) : à deux, une réplique par personne (bribes) ;
     tout seul, une phrase (portes). Certaines donnent un vrai indice, d'autres font juste rire (E3-dialogues-et-trame.md §2.4 et §3.5). */
  bribes:[
    {id:'mairie_matin', lieu:'mairie', moments:M_, titre:'Derrière la porte de la mairie', phrases:[
      {qui:'grosbec', texte:'Si on vous demande d\'où vient la lettre, vous ne savez rien.'},
      {qui:'victor', texte:'Mais je ne sais rien, Monsieur le maire.'}],
      t:'Le maire à Victor : « Si on vous demande d\'où vient la lettre, vous ne savez rien. »'},
    {id:'boulangerie_matin', lieu:'boulangerie', moments:M_, titre:'Derrière la porte de la boulangerie', phrases:[
      {qui:'margot', texte:'Je lui ai dit : vous gardez la lettre pour vous ? Il a rougi !'},
      {qui:'gaspard', texte:'Moi, j\'ai vanté sa fête : trois gâteaux de plus !'}],
      t:'Margot : le maire a rougi quand elle a dit qu\'il gardait la lettre pour lui. Gaspard : il a vanté sa fête, et le maire a commandé trois gâteaux de plus.'},
    /* la scène de Silas et Fortuné : avec Tendre l'oreille, elle se joue toute seule avant le marchandage (marche.avant) */
    {id:'place_matin', lieu:'place', moments:M_, titre:'Sur la place', phrases:[
      {qui:'silas', texte:'Halte, Fortuné ! Pas de vente sans permis !'},
      {qui:'fortune', texte:'Chut ! Je dis partout que le maire adore son chapeau neuf. Il le déteste !'},
      {qui:'silas', texte:'Et ma pendule ? J\'ai dit qu\'elle était belle : tu me l\'as vendue deux fois plus cher !'},
      {qui:'fortune', texte:'Quand on montre qu\'on veut quelque chose, ça coûte toujours plus cher !'}],
      t:'Fortuné : le maire déteste son chapeau neuf. Et quand on montre qu\'on veut quelque chose, ça coûte toujours plus cher.'},
    {id:'lanternes_matin', lieu:'L1', moments:M_, titre:'Rue des Lanternes', phrases:[
      {qui:'levoisin', texte:'Odette chez sa sœur ? Elle ne m\'a jamais parlé d\'une sœur.'},
      {qui:'melusine', texte:'Pardon, Odette…'}],
      t:'Le voisin : Odette ne lui a jamais parlé d\'une sœur. Mélusine, tout bas : « Pardon, Odette… »'},
    {id:'clocher_matin', lieu:'clocher', moments:M_, titre:'Au pied du clocher', phrases:[
      {qui:'anselme', texte:'TIM ! MA CLÉ ÉTAIT PAR TERRE CE MATIN !'},
      {qui:'tim', texte:'Quelqu\'un l\'a prise cette nuit, alors…'}],
      t:'Anselme : sa clé était par terre ce matin. Tim : quelqu\'un l\'a prise cette nuit.'},
    {id:'mairie_aprem', lieu:'mairie', moments:A_, titre:'Devant la mairie', phrases:[
      {qui:'grosbec', texte:'Ce soir, personne ne quitte la place avant minuit. Personne !'},
      {qui:'silas', texte:'Et ceux qui veulent dormir ?'},
      {qui:'grosbec', texte:'Ils dormiront… après minuit.'}],
      t:'Le maire à Silas : « Ce soir, personne ne quitte la place avant minuit. Personne ! »'},
    {id:'taverne_aprem', lieu:'taverne', moments:A_, titre:'Au comptoir de la taverne', phrases:[
      {qui:'gaspard', texte:'S\'il me commande un étage de plus, je dors dans mon four !'},
      {qui:'margot', texte:'Et moi, la soupe jusqu\'à minuit… Il n\'a jamais fait ça !'}],
      t:'Gaspard et Margot : le maire n\'a jamais fait une fête pareille.'},
    {id:'herboristerie_aprem', lieu:'herboristerie', moments:A_, titre:'Derrière la porte de l\'herboristerie', phrases:[
      {qui:'iris', texte:'Tu as les yeux rouges… et tu sens la lavande, comme tout le village !'},
      {qui:'melusine', texte:'C\'est le fil. J\'ai trop cousu.'}],
      t:'Iris à Mélusine : « Tu as les yeux rouges… et tu sens la lavande, comme tout le village ! »'},
    {id:'clocher_aprem', lieu:'clocher', moments:A_, titre:'Au pied du clocher', phrases:[
      {qui:'basile', texte:'Je t\'aide à sonner, ce soir ?'},
      {qui:'anselme', texte:'UN PAIN AUX RAISINS ?'},
      {qui:'basile', texte:'JE-T\'AI-DE-À-SON-NER !'},
      {qui:'anselme', texte:'Non, je sonne seul. Sauf si on me le demande… lentement !'}],
      t:'Anselme sonne seul, sauf si on lui demande de l\'aider… lentement.'},
    {id:'boulangerie_aprem', lieu:'boulangerie', moments:A_, titre:'Derrière la porte de la boulangerie', phrases:[
      {qui:'grosbec', texte:'Le gâteau à minuit pile, Gaspard. Pas une minute avant !'},
      {qui:'gaspard', texte:'Mais pourquoi minuit ?'},
      {qui:'grosbec', texte:'Parce que c\'est l\'heure, voyons.'}],
      t:'Le maire à Gaspard : « Le gâteau à minuit pile. Pas une minute avant ! »'}
  ],
  portes:{
    iris:{matin:'« Quelqu\'un a pris mes sachets de lavande cette nuit… et mis de la boue partout ! »'},
    farinel:{matin:'« Léo ! C\'est toi qui as mis de la boue partout ? … Léo ? »'},
    basile:{matin:'« Un lampion ici, un lampion là… et un sur ma tête ! »'},
    victor:{apresmidi:'« Une lueur au fond d\'un puits sec… Je n\'y passerai pas ce soir ! »'}
  },
  /* la maison d'Odette, pour le Pisteur, l'Alchimiste et le Sage */
  absentTexte:{odette:'Odette n\'est pas chez elle. Le maire dit qu\'elle est chez sa sœur…'},
  absentPourTous:true,   /* le Barde aussi (il n'entre chez Odette que l'après-midi, pour poser la canne) */
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'}
  ],
  bonus:[],
  /* (la vraie fin, animée, arrive avec l'étape 7) */
  fin:{slides:['<b>À suivre…</b>'], calepin:[]},
  defaite:[
    'Minuit sonne. La fête est finie… et personne ne sait où est Odette.',
    'La brume entre dans le village et efface vos souvenirs… D\'autres enquêteurs viendront.'
  ],
  faits:[]
};
})();
