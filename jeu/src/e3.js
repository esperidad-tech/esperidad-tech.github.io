/* ==========================================================
   Enquête 3 — La lettre d'Odette — DESIGN-saison1.md § 13 (surtout § 13.14) et jeu/enquete3/*.md (le détail, qui fait foi)
   EN CONSTRUCTION, étape par étape (§ 13.14) : fermée aux joueurs (enEcriture), ouverte avec le mode test (M.enEcriture, moteur-base.js).
   Étape 1 (11 novembre) : la lettre, l'écran des missions, le marché aux fleurs du Barde, les villageois du matin et de l'après-midi,
   les occupés, les écoutes aux portes. Pas encore : les grands dialogues (étape 2), le Sage (3), l'Alchimiste (4), le Pisteur (5),
   le donjon (6), la nuit et la fin (7), le vérificateur (8).

   Solution : Mélusine a écrit la fausse lettre · Odette est sous le clocher, derrière la porte aux quatre signes.

   LE SCÉNARIO A CHANGÉ LE 12 NOVEMBRE AU SOIR (Romain, 18 h 06 à 21 h 44 ; Bible § 13.30 ; E3-dialogues-et-trame.md, version 3, qui fait foi
   pour tous les textes du Barde). Ce qui s'est passé (jamais dit tel quel) : le maire (qui ne ment jamais) a chargé Léo, l'apprenti du
   meunier — c'est lui, l'homme en cape — de faire écrire une lettre « d'Odette ». Léo a forcé Mélusine, qui a volé un flacon d'encre chez
   Iris, écrit la lettre en imitant Odette, et l'a glissée elle-même sous la porte de la mairie, à l'aube, dans un châle comme celui d'Odette.
   Odette est enfermée sous le clocher ; Léo lui porte à manger tous les soirs, par la grille de la crypte (il a une clé). Moustache, son chat
   à six doigts, la retrouve toujours. Plus de lavande, plus de « minuit », plus de Léo froussard : son nom n'est dit nulle part avant la nuit.
   LE BARDE (12 novembre au soir) : les mêmes trois questions pour tous les villageois, et une question sur leur métier ; plus de limite à
   deux questions par visite (la moitié du village est occupée à chaque moment) ; un grand dialogue ne s'ouvre qu'une fois tout demandé
   (q.besoin : {toutDit:[…]}, barde.js). Pas refait ce soir-là : les trois autres rôles (les empreintes chez Iris, l'encre, la pointure, la
   grille à soulever) et le donjon (Léo en chef des monstres) — leurs textes suivent encore l'ancien fil, sans le contredire.
   ========================================================== */
(function(){
'use strict';
var E = window.ENQUETES = window.ENQUETES || {};

/* Les signes des menteurs (barde.js lit E.tics) : les mêmes qu'à l'enquête 2 (le tableau de liège est gardé).
   Au début de l'enquête, les étiquettes qui manquent s'épinglent toutes seules (signesDepart). (12 novembre au soir : plus de signe pour Léo,
   on ne l'interroge plus.) */
var TICS = {margot:'yeuxbas', victor:'morsure', fortune:'coin', tim:'mordille', melusine:'rougeur', farinel:'double'};
/* Les trois questions que le Barde pose à tout le monde (Romain, 12 novembre : « des questions un peu standards », les mêmes pour tous —
   c'est la différence entre les réponses qui fait l'enquête). Tim, on le tutoie. */
var Q_LETTRE = 'Que pensez-vous de la lettre d\'Odette ?', Q_ODETTE = 'Vous connaissez bien Odette ?', Q_NUIT = 'Il s\'est passé quelque chose de bizarre, cette nuit ?';
var Q_LETTRE_TU = 'Que penses-tu de la lettre d\'Odette ?', Q_ODETTE_TU = 'Tu connais bien Odette ?';

/* g : ce qu'apporte la réponse (pour nous, et pour les objets du Barde à venir : la Lettre de recommandation, le Carnet à rubans) :
   'r' un ruban (l'indice d'un grand dialogue), 'e' l'enquête, 'h' l'histoire de la saison. */
var M_ = ['matin'], A_ = ['apresmidi'], N_ = ['nuit'], MA_ = ['matin', 'apresmidi'], AN_ = ['apresmidi', 'nuit'];

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
  lettreLue:{titre:'À l\'aube, devant la mairie, le maire lit une lettre…', apres:'Odette va bien ! Pour fêter ça : grande fête cette nuit, sur la place !'},
  /* L'écran des missions du maire, juste après la lettre, pour tous (§ 13.6) : une ligne par rôle, et le bouton jaune */
  missionsMaire:{titre:'Les missions du maire', sous:'Pour la fête de cette nuit, chacun a sa mission :', bouton:'Commencer l\'enquête 3',
    barde:'Achète les fleurs de la fête.',
    pisteur:'Accroche les banderoles et rattrape l\'oie de Gaspard.',
    alchimiste:'Fais le haut du gâteau de la fête, chez Gaspard.',
    sage:'Peins le tableau d\'Odette et de ses chats.'},
  missions:{
    pisteur:'Accroche les banderoles de la fête et rattrape l\'oie de Gaspard. Et ouvre l\'œil : cette lettre est bizarre…',
    alchimiste:'Fais le haut du gâteau de la fête, chez Gaspard. Puis cueille les plantes de la vallée : cette nuit, l\'équipe aura besoin de tes potions.',
    barde:'Achète les fleurs de la fête avec les pièces du maire. Puis interroge le village : pose toutes tes questions à ceux qui ont le temps de te répondre. Les autres, ce sera pour plus tard !',
    sage:'Peins le tableau d\'Odette et de ses chats. Lis ton Grand Livre à l\'équipe, donne le code de chaque moment, et accuse quand toute l\'équipe est d\'accord.'
  },
  /* Les missions de base, en haut du Carnet (mission.js). Celles du Pisteur, de l'Alchimiste et du Sage arrivent avec leurs étapes (3 à 5). */
  etapes:{
    barde:[
      {ic:'💐', t:'Le maire t\'a donné 10 pièces : rapporte-lui au moins 10 bouquets pour la fête.', fait:[{vu:'marche:dix'}]},
      /* (12 novembre au soir) « pose toutes tes questions » : la liste des questions de chacun est écrite tout en bas de ce fichier (TOUT_DIT),
         à partir de E.pnj — pas ici à la main */
      {id:'matin', ic:'🗣️', t:'Le matin : sept villageois ont le temps de te répondre. Pose-leur toutes tes questions !', fait:[]},
      {ic:'🦯', t:'Odette demande qu\'on rapporte sa canne chez elle, au 2, rue des Lanternes.', fait:[{vu:'barde:voisin:0'}]},
      /* l'après-midi (des:1 : ces missions n'arrivent dans le Carnet qu'à ce moment-là, mission.js) */
      {des:1, id:'aprem', ic:'🗣️', t:'L\'après-midi : d\'autres villageois ont enfin le temps. Pose-leur toutes tes questions !', fait:[]},
      {des:1, ic:'✉️', t:'Le maire garde la lettre pour lui. Quand tu auras tout demandé à tout le monde, va lui en parler… avec les bons mots.', fait:[{vu:'grand:lettre:fini'}]},
      {des:1, ic:'🧵', t:'Quelqu\'un a écrit cette lettre. Quand l\'équipe saura qui, fais-lui dire la vérité.', fait:[{vu:'verite:melusine:4'}, {vu:'fete:filet:melusine'}]},
      /* la nuit (des:2) */
      {des:2, ic:'🗝️', t:'La nuit : la crypte est fermée, et Anselme a la seule clé. Quand tu sauras tout ce qu\'il faut, va le voir au clocher.', fait:[{vu:'grand:cle:fini'}]},
      {des:2, ic:'🎉', t:'Pendant que les trois autres sont sous la terre : reste à la fête. Si le maire te cherche, retiens-le !', fait:[{vu:'grand:retenir:fini'}]},
      {des:2, ic:'🧑', t:'Quand le Pisteur remonte, il a un code pour toi : tape-le vite.', fait:[{vu:'grand:leo:fini'}]},
      {piste:true, t:'Regarde bien les visages : plusieurs villageois vont te mentir.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    /* (étape 5) une mission de fête ratée compte comme faite (fini : un seul essai) ; rendre sa mission au maire, l'après-midi,
       se coche aussi quand les deux sont ratées (il n'y a alors rien à rendre) */
    pisteur:[
      {ic:'🎏', t:'Accroche les banderoles de la fête, sur la place.', fait:[{fini:'pisteur:place:banderoles'}]},
      {ic:'🦢', t:'Rattrape l\'oie de Gaspard, à la boulangerie.', fait:[{fini:'pisteur:boulangerie:oie'}]},
      {ic:'🏛️', t:'L\'après-midi, va rendre ta mission au maire.', fait:[{vu:'pisteur:mairie:mission'}, {et:[{rate:'pisteur:place:banderoles'}, {rate:'pisteur:boulangerie:oie'}]}]},
      /* (étape 6) la nuit : le sac de l'Alchimiste, puis le donjon (descente.js) */
      {des:2, ic:'🎒', t:'La nuit, avant de descendre sous la terre : demande à l\'Alchimiste le code de ses sept potions.', fait:[{vu:'sac:recu'}]},
      {des:2, ic:'🕯️', t:'Traverse le donjon avec le Sage et l\'Alchimiste, jusqu\'au bout.', fait:[{vu:'donjon:fini'}]},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    /* (étape 4) le gâteau (une création libre : on ne le rate jamais), les sept plantes, la lettre au labo, les sept potions de la nuit */
    alchimiste:[
      {ic:'🎂', t:'Fais le haut du gâteau de la fête, à la boulangerie de Gaspard.', fait:[{vu:'alchimiste:boulangerie:gateau'}]},
      /* (12 novembre, Bible §13.26 et §13.28) les sept plantes sont cachées sur la carte (D.PLANTES, cueillette.js) : l'herbier du Sage ne donne
         que des indices ; quatre poussent au-delà de la brume, qu'Anselme repousse un peu avec Bertille, sa petite cloche (lieux.clocher, E.brume).
         En échange, il veut de la mélisse pour sa tisane : la troisième mission n'arrive qu'après Bertille (e.si, mission.js). */
      {ic:'🌿', t:'Cueille les sept plantes de la vallée. Elles se cachent bien : l\'herbier du Sage te mettra sur la piste.',
        fait:[{et:[{vu:'plante:oseille'}, {vu:'plante:souci'}, {vu:'plante:melisse'}, {vu:'plante:lin'}, {vu:'plante:lycopode'}, {vu:'plante:vesse'}, {vu:'plante:gui'}]}]},
      {ic:'🔔', t:'Des plantes poussent au-delà de la brume. Anselme, au clocher, pourra peut-être t\'aider.', fait:[{vu:'alchimiste:clocher:bertille'}]},
      {si:[{vu:'alchimiste:clocher:bertille'}], ic:'🍵', t:'Rapporte de la mélisse à Anselme, pour sa tisane. Une promesse est une promesse !', fait:[{vu:'alchimiste:clocher:tisane'}]},
      {ic:'✉️', t:'Analyse la lettre d\'Odette sur ta paillasse, quand l\'équipe l\'aura.', fait:[{analyse:'lettre'}]},
      {ic:'🧪', t:'Prépare les sept potions de la nuit, sur ton établi.',
        fait:[{et:[{vu:'fiole:feu'}, {vu:'fiole:fumigene'}, {vu:'fiole:huile'}, {vu:'fiole:colle'}, {vu:'fiole:acide'}, {vu:'fiole:baume'}, {vu:'fiole:coeur'}]}]},
      {des:2, ic:'🎒', t:'La nuit : donne le code de tes sept potions au Pisteur, puis ouvre le chaudron du donjon.', fait:[{vu:'donjon:ouvert:alchimiste'}]},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    sage:[
      {ic:'👥', t:'Lis « Les habitants » à toute l\'équipe.', fait:[{lu:'habitants'}]},
      {ic:'🖼️', t:'Peins le tableau d\'Odette et de ses chats, à la mairie.', fait:[{fini:'sage:mairie:tableau'}]},
      {ic:'🌿', t:'Lis l\'herbier à l\'Alchimiste, dans ton Grand Livre : un indice pour chaque plante, et le moment de la cueillir.', fait:[{lu:'herbier'}]},
      {des:2, ic:'🗺️', t:'La nuit : ouvre le plan des souterrains, et dis le chemin au Pisteur, à voix haute.', fait:[{vu:'donjon:ouvert:sage'}]},
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
  corbeau:{titre:'Une dernière question… QUI est le Corbeau ?', choix:['grosbec', 'silas', 'fortune'], solution:'grosbec',
    t:'Un homme en cape a fait écrire la lettre. Mais quelqu\'un lui donne des ordres… Depuis la Fête des Lanternes, quelqu\'un se cache derrière tout ça. Parlez-en ensemble, puis désignez le Corbeau ! Cette question ne coûte aucun cœur.',
    /* (étape 7) secret : le jeu ne dit ni « bravo » ni « raté » (même phrase, même bruit) ; la réponse est gardée pour la suite de la saison */
    secret:'C\'est écrit dans le Grand Livre, à l\'encre secrète. As-tu vu juste ? Regardez bien la fin de l\'histoire…'},

  /* ---------- Le Barde (barde.js) ----------
     (Romain, 12 novembre, 20 h 50) plus de limite à deux questions par visite, ni de porte qui se ferme quand on revient (plus de parVisite
     ni de uneVisite) : toutes les questions d'un villageois se posent d'un coup. Ce qui limite : la moitié du village est occupée à chaque
     moment (pnj.ou / pnj.occupe). La phrase d'impatience ne sert plus qu'à dire, avec humour, qu'on lui a tout demandé (barde.js). */
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

  /* ---------- Les grands dialogues du Barde (grands.js ; Bible § 13.8 et § 13.30 ; E3-dialogues-et-trame.md, version 3) ----------
     On y entre par une question (q.grand), qui n'apparaît qu'une fois tout demandé à tout le monde (q.besoin : {toutDit:[…]}, barde.js ;
     Romain, 12 novembre, 21 h 31 et 21 h 44), et qui ne ressemble pas aux autres (grands.css : violette, « 🎭 Grande conversation », un reflet).
     4 choix par étape, tous polis, de la même longueur ; un seul essai. La bonne réponse n'est jamais à la même place.
     Un choix : q (ce que dit le Barde), r (sa réplique ; avec « » quand elle mêle paroles et récit), n (un petit récit après), bon, piege.
     rate : la réplique d'un mauvais choix (après r).
     (12 novembre au soir) retirés : le grand dialogue de la Grosse Marie pendant le donjon, et celui de Léo (une scène, plus bas). */
  grands:{
    /* l'après-midi, à la mairie. Les indices : Gaspard (il est fier de ses fêtes), Margot (il déteste qu'on dise qu'il cache des choses),
       Victor (il recompte ses papiers chaque soir) — leurs questions sur leur métier, le matin. */
    lettre:{pnj:'grosbec', ic:'✉️',
      rate:'Bien, bien… J\'ai beaucoup à faire. Revenez plus tard.',
      etapes:[
        {t:'Oui ?', choix:[
          {q:'Quel beau discours vous avez fait ce matin !'},
          {q:'Quelle belle fête vous préparez pour Odette !', r:'N\'est-ce pas ? Les lampions, le gâteau, les fleurs… Que puis-je pour vous ?', bon:true},
          {q:'Votre mairie est vraiment très bien rangée !'},
          {q:'Vous avez l\'air bien fatigué, Monsieur le maire.'}]},
        {t:'Que puis-je pour vous ?', choix:[
          {q:'Les enfants voudraient voir la lettre, pour être rassurés.'},
          {q:'Je voudrais recopier la lettre, pour la chanter à la fête.'},
          {q:'On dit que vous cachez la lettre… Je suis sûr que c\'est faux !', r:'Bien sûr que c\'est faux ! Tenez, la voilà… Mais vous me la rendez quand ?', bon:true},
          {q:'Odette est mon amie : j\'aimerais lire ses mots moi-même.'}]},
        {t:'Mais vous me la rendez quand ?', choix:[
          {q:'Demain matin, à la première heure : c\'est promis.'},
          {q:'Le Sage la gardera à l\'abri, dans son Grand Livre.'},
          /* le piège : le Barde repart avec une copie de sa propre écriture (le Sage : « C'est ton écriture à toi, ça ! ») */
          {q:'Je peux la recopier ici, tout de suite, devant vous ?', r:'Mais bien sûr, recopiez donc !', piege:true},
          {q:'Avant ce soir, promis : vous pourrez la recompter.', r:'Avant ce soir, c\'est bien compris ?', bon:true}]}
      ],
      reussi:{bouton:'✉️ Prendre la lettre', titre:'Le maire te prête la lettre', t:'Tu tiens la lettre d\'Odette. Le maire te regarde partir… Il faudra la lui rendre avant ce soir !', code:'obj:lettre'},
      piege:{bouton:'📝 Ranger ma copie', titre:'Ta copie de la lettre', t:'Tu recopies la lettre, mot pour mot, sous l\'œil du maire. Le maire range l\'original dans son grand coffre.', code:'info:copie'},
      resume:{ok:'Le maire t\'a prêté la lettre d\'Odette.', piege:'Tu as recopié la lettre, devant le maire.', rate:'Le maire n\'a pas voulu te prêter la lettre.'}},
    /* la nuit, au clocher, quand Anselme monte sonner la Grosse Marie pour ouvrir la fête (il la sonne dans tous les cas : Romain, 21 h 38).
       Le but n'est plus qu'il prête sa clé, mais de l'aider à sonner : pendant qu'il compte les coups, les yeux fermés, le Pisteur, caché
       dans le clocher, lui prend la clé à la ceinture (le code s'appelle toujours info:cle_clou). Raté : Tim montre le vieux puits.
       TOUT ce qu'on dit à Anselme est en majuscules, pour les quatre choix (Romain : « c'est trop facile, c'est les seuls choix en
       majuscules »). Les indices : Anselme (fort, lentement, sans le presser), Basile (il ne prête rien, sauf à qui l'aide à sonner),
       Silas (le père d'Anselme l'a retrouvé en sonnant toute une nuit). */
    cle:{pnj:'anselme', ic:'🔔',
      rate:'Bon, je monte sonner, moi.',
      etapes:[
        {t:'HEIN ? Ah, le Barde ! Qu\'est-ce que tu me veux ?', choix:[
          {q:'PARDON DE VOUS DÉRANGER, ANSELME, J\'AI UNE QUESTION !', r:'UN HARENG ? Je n\'ai pas faim, mon petit !'},
          {q:'VI-TE, AN-SEL-ME, LA FÊ-TE VA COM-MEN-CER !', r:'ME PRESSE PAS, TOI ! Je n\'entends plus rien !'},
          {q:'BON-SOIR, AN-SEL-ME. J\'AI TOUT MON TEMPS.', r:'Enfin quelqu\'un qui parle comme il faut ! Alors, qu\'est-ce qui t\'amène ?', bon:true},
          {q:'UNE TOUTE PETITE QUESTION, ÇA NE PRENDRA QU\'UNE SECONDE !', r:'UNE SECONDE CLOCHE ? La Grosse Marie suffit bien !'}]},
        {t:'Alors, qu\'est-ce qui t\'amène ?', choix:[
          {q:'LA GROSSE MARIE EST SI LOURDE… JE PEUX VOUS AIDER ?', r:'M\'aider ? Personne ne me l\'a proposé depuis des années… Dis-moi pourquoi.', bon:true},
          {q:'JE VOUDRAIS EMPRUNTER LA CLÉ DE LA CRYPTE.', r:'MA CLÉ ? JE NE PRÊTE RIEN À PERSONNE !'},
          {q:'JE VOUS APPORTE UNE PART DU GÂTEAU DE GASPARD.', r:'UN CHAPEAU ? Il fait des chapeaux, le boulanger ?'},
          {q:'VOUS ÊTES EN PLEINE FORME, AUJOURD\'HUI !', r:'EN PLEINE FORÊT ? Je suis au clocher, voyons !'}]},
        {t:'Dis-moi pourquoi.', choix:[
          {q:'PARCE QUE C\'EST LA FÊTE ET QUE J\'ADORE LES CLOCHES !', r:'TU ADORES LES BROCHES ? Demande à Mélusine !'},
          {q:'PARCE QUE SILAS DIT QUE VOUS ÊTES LE MEILLEUR SONNEUR.', r:'SILAS ? Il dit ça à tout le monde !'},
          {q:'PARCE QUE LE MAIRE VEUT QUE TOUT SOIT PARFAIT.', r:'LE MAIRE VEUT UNE PAIRE ? De chaussettes ?'},
          {q:'VOTRE PÈRE A SONNÉ TOUTE UNE NUIT POUR SILAS. ODETTE AUSSI EST PERDUE.', r:'Il essuie une larme. « Alors on sonne pour Odette. Monte, mon petit ! »', bon:true}]}
      ],
      reussi:{bouton:'🔔 Monter avec Anselme', titre:'La Grosse Marie sonne', t:'Vous tirez la corde ensemble : DONG… DONG… Anselme ferme les yeux et compte les coups. Sa clé pend à sa ceinture…', code:'info:cle_clou'},
      echec:{bouton:'🏠 Qui m\'appelle ?', qui:'tim', titre:'Tim, depuis les toits', t:'« Psst, Barde ! Moustache vient de filer dans le vieux puits, entre les barreaux ! »', code:'info:vieux_puits'},
      resume:{ok:'Tu as aidé Anselme à sonner la Grosse Marie. Sa clé pendait à sa ceinture…', rate:'Anselme est monté sonner tout seul, sa clé à la ceinture.'}},
    /* à la fin du donjon (le code « Léo attrapé » du Pisteur). (12 novembre au soir) Léo n'est plus un froussard qu'on interroge en trois
       étapes : c'est lui, l'homme en cape. EN ATTENDANT que Romain ait décidé de la fin (Léo en chef des monstres du donjon, Odette délivrée
       ou non), une scène sans choix (scene:true, grands.js) : le Barde apprend qui est l'homme en cape, et « Ce que Léo a dit » part chez le
       Sage (fins[0].code ; la scène finale s'en souvient sur toutes les tablettes : E.finVariante, plus bas). Léo ne nomme pas le maire :
       la question du Corbeau reste entière. */
    leo:{pnj:'leo', ic:'🧑', scene:true,
      intro:'Tout au fond des souterrains, tes amis ont coincé l\'homme en cape, une lanterne à la main. Sous le capuchon : Léo, l\'apprenti du meunier !',
      fins:[
        {t:'« Vous n\'auriez jamais dû descendre ! C\'est pour le bien du village… » Puis, tout bas : « Elle m\'a appris à lire. Je voulais juste qu\'elle n\'ait pas froid. »', code:'info:leo_dit3'}
      ],
      apres:'Raconte à voix haute à ton équipe ce que Léo a dit. Puis le Sage accuse !',
      apresCode:'Raconte à voix haute à ton équipe ce que Léo a dit, et donne son code au Sage. Puis le Sage accuse !',
      apresRien:'Léo a filé. Raconte à ton équipe ce qui s\'est passé. Puis le Sage accuse !',
      titreCode:'Ce que Léo a dit',
      enfui:'Des pas descendent l\'escalier de la crypte. Léo, l\'apprenti du meunier, renverse sa lanterne et file dans le noir, sans un mot.'}
  },
  /* ---------- Retenir le maire (grands.js ; E3-dialogues-et-trame.md, version 3) : trois petits dialogues d'une étape, à la fête, pendant le
     donjon, au rythme du Barde (sans minuteur). Le maire remarque que trois héros manquent. Le premier dès que le dialogue de la clé est
     fini (le maire porte un « ! ») ; chacun des suivants après le précédent et une autre visite à la fête. Deux réussis : le code pour le
     Pisteur ; deux ratés : il s'éloigne (on s'arrête là). Les indices sont à la fête : Gaspard (le gâteau), Margot (le discours), Silas
     (le bal). (12 novembre au soir : plus de « minuit », plus de variante selon la Grosse Marie. PAS ENCORE : la grille du clocher qui grince
     — tirer, pousser ou soulever, Romain, 21 h 44 — c'est chez le Pisteur, à l'entrée du donjon.) */
  retenir:{pnj:'grosbec', besoin:[{vu:'grand:cle:fini'}], n:2,
    dialogues:[
      {t:'Barde ! Je ne vois pas vos trois amis. Où sont-ils passés ?', choix:[
        {q:'Ils sont allés se coucher, ils étaient épuisés.', r:'Se coucher, un soir de fête ? Je vais voir ça…'},
        {q:'Ils aident Gaspard à porter le gâteau : ça pèse !', r:'Ah ! Très bien, très bien. Ce gâteau sera magnifique.', bon:true},
        {q:'Ils cherchent encore des fleurs pour vous.', r:'À cette heure-ci ? Hmm…', n:'Il regarde vers le clocher.'},
        {q:'Je ne sais pas, Monsieur le maire, vraiment pas.', r:'Vous ne savez pas ? Hmm…'}]},
      {t:'Je vais faire un petit tour du côté du clocher.', choix:[
        {q:'Monsieur le maire, tout le village réclame votre discours !', r:'Il redresse son chapeau. « Mon discours ? Bon… le village a besoin de moi. »', bon:true},
        {q:'Anselme dort, il ne faut surtout pas le réveiller.', r:'Il dort ?! J\'y vais tout de suite !'},
        {q:'Votre chapeau neuf vous va vraiment très bien !', r:'Merci. Laissez-moi passer.'},
        {q:'Je viens avec vous, je connais bien le chemin !', r:'Non, non. Restez ici.', n:'Il part seul.'}]},
      {t:'Toujours pas vos amis… Je dois vérifier quelque chose.', choix:[
        {q:'Allez-y, je surveille la fête pour vous.', r:'Merci, Barde.', n:'Il s\'éloigne.'},
        {q:'Il n\'y a rien au clocher, je vous assure.', r:'Qui a parlé du clocher ?', n:'Il s\'éloigne.'},
        {q:'Le bal ! Personne ne danse avant que vous l\'ouvriez !', r:'Le bal ! Mais oui, mais oui… Musique !', bon:true},
        {q:'Restez donc, il fait bien trop froid dehors.', r:'Je ne suis pas frileux.', n:'Il s\'éloigne.'}]}
    ],
    reussi:{titre:'Le maire est retenu', t:'Le maire ne quitte plus la place.', code:'info:maire_retenu'},
    rate:{titre:'Le maire s\'éloigne…', t:'Le maire s\'éloigne vers le clocher…'}},
  /* ---------- La fête (grands.js ; E3-dialogues-et-trame.md, version 3) : la nuit, sur la place ; chacun dit une réplique (gratuit).
     Trois sont les indices de « Retenir le maire » (Gaspard, Margot, Silas), notées dans le Carnet. Mélusine, si son aveu n'a pas été
     obtenu l'après-midi, craque (le filet). */
  fete:{lieu:'place', moments:N_,
    gens:{
      gaspard:{t:'Sept chats en pâte d\'amande sur le gâteau ! Il me faudra des bras pour le porter.', note:'Gaspard, à la fête : il lui faudra des bras pour porter son gâteau.'},
      margot:{t:'Le discours du maire ? Vingt minutes ! Il adore qu\'on le lui réclame.', note:'Margot, à la fête : le maire adore qu\'on lui réclame son discours.'},
      silas:{t:'Chaque année, c\'est le maire qui ouvre le bal. Personne ne danse avant lui !', note:'Silas, à la fête : c\'est le maire qui ouvre le bal. Personne ne danse avant lui.'},
      victor:{t:'Je danse ! Enfin, j\'essaie.'},
      tim:{t:'Chut ! Je suis monté en haut du mât des lampions.'},
      melusine:{t:'Je n\'écrirai plus jamais pour personne…',
        /* le filet : son aveu n'a pas été obtenu l'après-midi */
        filet:{sauf:'info:aveu', t:'Je n\'en peux plus… C\'est moi qui ai écrit la lettre ! Un homme en cape m\'y a forcée. Je n\'ai pas vu son visage.', code:'info:aveu',
          note:'Mélusine a craqué, à la fête : c\'est elle qui a écrit la lettre, forcée par un homme en cape. Elle n\'a pas vu son visage (code pour le Sage).'}},
      iris:{t:'J\'ai tressé une couronne pour Odette. Je la poserai sur sa porte… quand elle reviendra.'},
      farinel:{t:'Je ne dors pas, je repose mes yeux !'},
      basile:{t:'Les lampions tiennent ! Je n\'en reviens pas moi-même.'},
      fortune:{t:'Dernières lanternes ! Deux pour le prix de trois !'},
      /* (sa réplique tant que « Retenir le maire » n'a pas commencé, ou quand c'est fini) */
      grosbec:{t:'Quelle fête ! Tout le village est là… enfin, presque.'}
    }},

  /* Les photos du tableau de liège du Barde (liege.js) ; les mots-clés (« Autre ») viendront avec la suite.
     (12 novembre au soir : plus de photo de Léo — on ne sait rien de lui avant la nuit.) */
  liege:{pnj:['melusine', 'margot', 'iris', 'victor', 'fortune', 'tim', 'gaspard', 'farinel', 'anselme', 'silas', 'basile', 'levoisin'],
    lieux:['clocher', 'puits', 'moulin', 'chene', 'mairie', 'place']},
  sensibles:[],
  recettes:[],
  /* ---------- Le labo de l'Alchimiste (labo.js ; les fiches : src/labo/30-donnees.js) : la lettre d'Odette ----------
     Au microscope, du pollen de lavande (une fausse piste : tout le village en a) ; au test des couleurs, de l'encre de noix de galle
     (celle des colporteurs) ; à la loupe, l'écriture — avec le Livre d'or du Sage posé sur la paillasse (le code « Les écritures
     du village »), on compare : seule Mélusine a les trois signes de la lettre. */
  labo:['lettre'],
  analyses:{
    lettre:{donne:'info:ecriture',
      t:'La lettre d\'Odette, de près : des « M » qui piquent, des « t » barrés d\'une vague, un petit rond sur les « i ». Dans le Livre d\'or, une seule personne écrit comme ça : MÉLUSINE ! Sur le papier, du pollen de lavande et de l\'encre de noix de galle.',
      note:'Analyse de la lettre : c\'est l\'écriture de Mélusine (ses « M » qui piquent, ses « t » en vague, son rond sur les « i »). Du pollen de lavande, de l\'encre de noix de galle.'}
  },
  laboNotes:{
    pollen_l:'Sur la lettre : du pollen de lavande, comme les sachets d\'Iris. Mais tout le village en a !',
    /* (12 novembre au soir : plus « l'encre des colporteurs » — Iris dit au Barde qu'on lui a volé son encre, faite de noix de galle) */
    encre_l:'L\'encre de la lettre : une encre noire, faite avec des noix de galle, ces petites boules qui poussent sur les chênes.'},
  /* ---------- L'établi des plantes (plantes.js ; E3-atelier-des-plantes.md) : les sept potions de la nuit, faites de vraies plantes ---------- */
  plantes:true,
  /* ---------- La brume repoussée (12 novembre, Bible §13.26 et §14.7 ; cueillette.js, carte-jeu.js) : Bertille, la petite cloche d'Anselme, lève
     deux bancs de brume de la grande carte — le Nord (le Rond des Sorcières, où pousse la vesse-de-loup) et les collines de l'Ouest (le Vieux
     verger et son gui, les Cinq Pierres et leur pied-de-loup, le Rucher et sa mélisse). Les zones : monde-brume.js, ZONES. Sur la tablette de l'Alchimiste seulement
     (c'est elle qui demande à Anselme) ; la brume revient à l'enquête suivante. ---------- */
  brume:{zones:['n', 'o'], si:[{vu:'alchimiste:clocher:bertille'}]},
  /* ---------- Le donjon (descente.js ; jeu/donjon/, en ligne dans brumeval/donjon/) : une page par tablette. Le Barde n'en a pas :
     pendant ce temps, il fait la fête (la Grosse Marie, retenir le maire). ---------- */
  donjon:{pages:{pisteur:'donjon/index.html', sage:'donjon/sage.html', alchimiste:'donjon/alchimiste.html'}},
  /* le code du sac (plantes.js) : un code par contenu possible du sac (sept potions, faites ou non : 128), pour le Pisteur */
  /* (étape 7) et les codes de fin qui portent la variante de la scène finale (E.finVariante : la dizaine ; l'unité : les erreurs) */
  codesPlus:(function(){ var l = [], i; for(i = 0; i < 128; i++) l.push('sac:' + i); [1, 2].forEach(function(v){ for(i = 0; i < 4; i++) l.push('victoire:' + (10 * v + i)); }); return l; })(),
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
  /* Les deux objets de l'enquête : le Sage les lit dans son Grand Livre, l'Alchimiste analyse la lettre dans son labo (E.labo, labo.js) */
  objets:{
    lettre:{nom:'La lettre d\'Odette', ic:'✉️', pour:['sage', 'alchimiste'], dire:'La vraie lettre, en main ! Donne ce code au Sage et à l\'Alchimiste.'},
    /* (le carnet n'a pas de fiche au labo : il n'est que pour le Sage, qui le compare à la lettre et y trouve le plan) */
    carnet:{nom:'Le carnet d\'Odette', ic:'📓', pour:'sage', dire:'Le carnet d\'Odette : donne ce code au Sage.'}
  },
  /* Les codes de l'enquête 3 (E3-actions-des-roles.md §4). Neufs : ils seront gelés à l'ouverture de l'enquête aux joueurs (codes-fixes.js).
     Étape 1 : ceux que le Barde donne ou reçoit le matin et l'après-midi. */
  infos:{
    poste:{nom:'La lettre n\'est pas passée par la poste', ic:'✉️', pour:'sage', de:'barde',
      t:'Victor, le facteur, n\'a pas apporté la lettre d\'Odette : elle n\'a ni timbre ni tampon. Et en vingt ans, Odette n\'a jamais envoyé une seule lettre.',
      dire:'Une lettre sans timbre ? Le Sage doit le savoir : donne-lui ce code.'},
    /* (12 novembre au soir : il remplace « Le capuchon vers le clocher » — c'est Mélusine qui a déposé la lettre, déguisée en Odette) */
    chale:{nom:'Odette… sans sa canne', ic:'🧣', pour:'sage', de:'barde',
      t:'À l\'aube, du haut des toits, Tim a cru voir Odette, dans son châle à chats, glisser la lettre sous la porte de la mairie. Mais elle marchait vite… et sans canne !',
      dire:'Odette, sans sa canne ? Le Sage doit le savoir : donne-lui ce code.'},
    /* (la lettre et le carnet sont des objets : E.objets, plus haut ; l'Alchimiste pose la lettre sur sa paillasse) */
    traces_moustache:{nom:'Les traces de Moustache', ic:'🐾', pour:'pisteur', de:'barde',
      t:'Chez Odette, du lait renversé… et des petites traces de pattes qui filent dehors, vers la place. Moustache, le gros chat gris, est passé par là !',
      dire:'Des traces toutes fraîches ! Le Pisteur saura les suivre : donne-lui ce code.'},
    ecriture:{nom:'L\'écriture de Mélusine', ic:'🖋️', pour:['barde', 'sage'], de:'alchimiste', pnj:'melusine',
      t:'L\'Alchimiste a comparé la lettre au Livre d\'or de la fête : les « M » qui piquent, les « t » en vague, le petit rond sur les « i »… C\'est l\'écriture de Mélusine !',
      dire:'Le Barde et le Sage doivent le savoir : donne-leur ce code.'},
    crypte_fermee:{nom:'La crypte est fermée', ic:'🗝️', pour:'barde', de:'pisteur', pnj:'anselme',
      t:'Le Pisteur a suivi les traces de Moustache jusqu\'à l\'église : elles passent sous la porte de la crypte, au pied du clocher. La porte est fermée à clé.',
      dire:'Il faudra la clé du sonneur… Le Barde saura lui parler : donne-lui ce code.'},
    /* (étape 3, le Sage) */
    ecritures:{nom:'Les écritures du village', ic:'📖', pour:'alchimiste', de:'sage',
      t:'Le Livre d\'or de la fête est posé sur ta paillasse : tout le village y a écrit un petit mot pour Odette, chacun de sa main. Compare ces écritures à celle de la lettre, à la loupe !',
      dire:'L\'Alchimiste pourra comparer les écritures : donne-lui ce code.'},
    /* (12 novembre : plus de code « L'herbier » — le Sage lit l'herbier à voix haute, l'Alchimiste cherche sur sa carte ; Bible §13.26) */
    aveu:{nom:'L\'aveu de Mélusine', ic:'🧵', pour:'sage', de:'barde',
      t:'Mélusine a avoué : c\'est elle qui a écrit la lettre, et qui l\'a glissée sous la porte de la mairie. Un homme en cape l\'y a forcée ; elle n\'a pas vu son visage. Il est venu chez elle cette nuit : il a peut-être laissé des traces…',
      dire:'C\'est une preuve pour le Sage : donne-lui ce code.'},
    /* (étape 5, le Pisteur) ce qu'il reçoit et ce qu'il donne ; ceux du Sage, de l'Alchimiste et des grands dialogues du Barde
       arriveront avec leurs étapes : en attendant, ils se tapent comme les autres codes */
    six_doigts:{nom:'Moustache a six doigts', ic:'🐾', pour:'pisteur', de:'sage',
      t:'Dans le carnet d\'Odette, un dessin de Moustache et une flèche : « Mon gros gris a six doigts à chaque patte ! » Aucun autre chat du village n\'en a autant.',
      dire:'Le Pisteur saura reconnaître ses traces : donne-lui ce code.'},
    /* (12 novembre : plus de codes « Le gui du pommier » ni « Le gui » — le gui est dans le Vieux verger, au-delà de la brume, sur le pommier
       à l'échelle : l'Alchimiste y grimpe elle-même ; Bible §13.26) */
    /* (12 novembre au soir : le code garde son nom de code, cle_clou, mais Anselme ne pend plus sa clé au clou — elle est à sa ceinture) */
    cle_clou:{nom:'La Grosse Marie sonne', ic:'🔔', pour:'pisteur', de:'barde',
      t:'Le Barde aide Anselme à sonner la Grosse Marie. DONG… DONG… Anselme ferme les yeux et compte les coups. Sa clé pend à sa ceinture…',
      dire:'C\'est le moment de la lui prendre ! Donne ce code au Pisteur.'},
    vieux_puits:{nom:'Le vieux puits', ic:'🕳️', pour:'pisteur', de:'barde',
      t:'Tim l\'a vu depuis les toits : Moustache vient de filer dans le vieux puits, entre les barreaux de la grille !',
      dire:'Le Pisteur doit y aller : donne-lui ce code.'},
    /* (étape 2, les grands dialogues du Barde) */
    copie:{nom:'La copie de la lettre', ic:'📝', pour:['sage', 'alchimiste'], de:'barde',
      t:'Le Barde a recopié la lettre d\'Odette, devant le maire… de sa propre main ! « C\'est ton écriture à toi, ça ! » Impossible de comparer les écritures avec cette copie.',
      dire:'Le Sage et l\'Alchimiste vont l\'étudier : donne-leur ce code.'},
    /* EN RÉSERVE (12 novembre au soir) : plus personne ne donne ce code. Le grand dialogue « sonner la Grosse Marie pendant le donjon » est
       retiré (plus de « minuit » ; la Grosse Marie sonne pour ouvrir la fête, dans tous les cas). Le donjon sait toujours le lire (toute la
       vie des trois héros revient, une fois) : le code reste écrit ici, avec ses symboles gelés (codes-fixes.js, donjon-codes.js), tant que
       Romain n'a pas décidé s'il revient autrement. reserve:true : le vérificateur ne lui cherche pas de donneur (tools/verif-e3.js). */
    grosse_marie:{nom:'La Grosse Marie', ic:'🔔', pour:'pisteur', de:'barde', donjon:true, reserve:true,
      t:'DONG… DONG… La Grosse Marie sonne. Sous la terre, la brume recule : une fois, hors d\'un combat, toute la vie des trois héros revient.',
      dire:'Quand l\'équipe du donjon dit « On est à plat ! », donne ce code au Pisteur : il le tape dans le donjon.'},
    maire_retenu:{nom:'Le maire est retenu', ic:'🎩', pour:'pisteur', de:'barde', donjon:true,
      t:'Le Barde a retenu le maire sur la place : il ne descendra pas trop tôt dans la crypte.',
      dire:'Le Pisteur doit le taper dans le donjon, avant la dernière salle : donne-lui ce code.'},
    /* (étape 6) le donjon : la porte aux quatre signes (le code du donjon « Un chat gratte à la porte », porte:odette) */
    odette_porte:{nom:'Odette est derrière la porte', ic:'🚪', pour:'sage', de:'pisteur',
      t:'Tout au fond des souterrains, Moustache gratte au bas d\'une grande porte ronde. Tu colles l\'oreille… Une voix étouffée : « Moustache ? Mon gros gris, c\'est toi ? » Odette est là, vivante, derrière la porte !',
      dire:'Un gros chat gris gratte à la porte aux quatre signes : donne ce code au Sage.'},
    /* (étape 7) ce que Léo a dit, pour le Sage (12 novembre au soir : un seul code — plus de grand dialogue à trois étapes, plus de leo_dit1
       ni de leo_dit2 ; le nom de code leo_dit3 est gardé) */
    leo_dit3:{nom:'Ce que Léo a dit', ic:'🧑', pour:'sage', de:'barde',
      t:'L\'homme en cape, c\'était Léo, l\'apprenti du meunier. « C\'est pour le bien du village », dit-il. Puis, tout bas : « Elle m\'a appris à lire. Je voulais juste qu\'elle n\'ait pas froid. » Qui lui donne des ordres ?',
      dire:'Le Sage note tout dans son Grand Livre : donne-lui ce code.'},
    leo_attrape:{nom:'Léo attrapé', ic:'🧑', pour:'barde', de:'pisteur', pnj:'leo',
      t:'Tout au fond des souterrains, le Pisteur a coincé l\'homme en cape : c\'est Léo, l\'apprenti du meunier !',
      dire:'Le Barde doit le savoir : donne-lui ce code.'},
    leo_enfui:{nom:'Léo s\'est enfui', ic:'🏃', pour:'barde', de:'pisteur', pnj:'leo',
      t:'Des pas descendent l\'escalier de la crypte. Léo, l\'apprenti du meunier, renverse sa lanterne et file dans le noir, sans un mot.',
      dire:'Le Barde doit le savoir : donne-lui ce code.'}
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
        /* (12 novembre au soir) à tout moment, dès que le Barde a donné le code : il entre chez Odette dès le matin, et encore la nuit
           (un filet : sans « La crypte est fermée », le grand dialogue d'Anselme ne s'ouvre pas) */
        {id:'traces', ic:'🐾', nom:'Les traces de Moustache', mj:'traces', mjNiveau:2,
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
        /* une oie vue de dos, en ville (mj-pisteur-alchi.js : fuyard 'oie', décor 'ville') ; niveau 9 pour tout le monde
           (Romain, 12 novembre, 8 h 56 ; avant : 4 au plus, comme Tim). On la recommence autant qu'on veut (essaisInfinis, Romain, 12 novembre,
           12 h 54 : « ça va l'occuper un temps ») : « 🔁 Recommencer » à la fin du mini-jeu, et le point reste ouvert tout le matin. */
        {id:'oie', ic:'🦢', nom:'L\'oie de Gaspard', moments:M_, mj:'poursuite', mjNiveauFixe:9, essaisInfinis:true, params:{fuyard:'oie', decor:'ville'},
          avant:'COUAC ! L\'oie de Gaspard s\'est sauvée de la cour, et elle file dans les rues ! Gaspard crie : « Sans elle, pas de festin ! » Rattrape-la !',
          bouton:'🏃 Courir après l\'oie',
          t:'Tu plonges… et tu l\'attrapes ! COUAC, COUAC ! Elle se débat, puis se calme dans tes bras. Gaspard la serre contre lui : « Ma belle ! Te voilà ! »',
          rate:'Elle est trop rapide ! L\'oie disparaît au coin de la rue, en battant des ailes. Gaspard s\'arrache les cheveux.',
          ferme:'L\'oie court encore quelque part dans Brumeval…'}
      ]},
      /* l'Alchimiste (étape 4) : le gâteau de la fête (mj-gateau.js : une création libre, quinze minutes, on ne le rate jamais).
         Gaspard a monté les gros étages du bas ; l'Alchimiste fait le haut (jusqu'à quatre étages) : avec les siens, ça fait bien
         les « sept étages » dont tout le village parle. */
      alchimiste:{intro:'La boulangerie de Gaspard. Sur la grande table, trois énormes étages de gâteau attendent leur chapeau.', points:[
        {id:'gateau', ic:'🎂', nom:'Le gâteau de la fête', moments:['matin', 'apresmidi'], mj:'gateau',
          avant:'Gaspard a monté les gros étages du bas. Il te confie le plus beau : tout le haut du gâteau ! La pâte, le glaçage, la crème, les décorations… et n\'oublie pas les chats d\'Odette. Tu as quinze minutes.',
          bouton:'🎂 Faire le gâteau',
          t:'Gaspard pose ton gâteau tout en haut de sa pièce montée, et recule de trois pas : « Sept étages en tout ! Du jamais vu à Brumeval ! »'}
      ]}
    },
    /* LES CUEILLETTES DE L'ALCHIMISTE NE SONT PLUS ICI (Romain, 12 novembre, 12 h 52 ; Bible §13.26) : les sept plantes poussent à sept endroits
       précis de la carte, qu'on ne voit pas (D.PLANTES, donnees.js ; cueillette.js). L'herbier du Sage dit où et quand ; trois sont au-delà de la
       brume (E.brume, plus bas : Bertille). Retirés de l'enquête : « Chercher des plantes » au lavoir, à l'herboristerie, au moulin, au carrefour ;
       le mini-jeu « Suivre la poussière » de la clairière (il reste dans mj-pisteur-alchi.js : suspect 'poussiere', arrivée 'vesses') ; le gui du
       potager, que le Pisteur allait cueillir (deux codes). L'oseille se cueille à tout moment, sans rien demander à personne : c'est elle qui
       donne l'acide de la grille du puits (tools/verif-e3.js le vérifie). */
    mairie:{
      pisteur:{intro:'La mairie. Le maire n\'aime pas qu\'on fouine dans ses papiers…', points:[
        /* la lettre, en se cachant : pour quand le Barde n'a pas su la demander au maire (le même code que lui) */
        /* (decor 'mairie' : l'intérieur de la mairie, et au bout le bureau du maire avec la lettre — Romain, 21 h 21) */
        {id:'lettre', ic:'🫥', nom:'La lettre, en cachette', moments:A_, mj:'cachette', params:{decor:'mairie'}, obj:'lettre',
          avant:'Le maire garde la lettre d\'Odette sur son bureau. Traverse la mairie sans te faire voir, jusqu\'à son bureau !',
          bouton:'🫥 Se faufiler',
          t:'Tu te glisses derrière le grand rideau. Le maire compte ses papiers un par un… puis il sort. La lettre est sur le dessus.',
          rate:'« Qui va là ?! » On t\'a vu. Tu files sans demander ton reste.',
          ferme:'Le garde surveille la mairie, maintenant.'},
        /* rendre sa mission : dès qu'une des deux missions de fête est réussie */
        {id:'mission', ic:'🎉', nom:'Rendre ta mission au maire', moments:A_, or:5, visibleSi:[{vu:'pisteur:place:banderoles'}, {vu:'pisteur:boulangerie:oie'}],
          t:'Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde à la fête ! »',
          variantes:[
            {si:[{et:[{vu:'pisteur:place:banderoles'}, {vu:'pisteur:boulangerie:oie'}]}], t:'Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde à la fête ! »'},
            {si:[{vu:'pisteur:place:banderoles'}], t:'Le maire : « Des banderoles… mais pas d\'oie ? Tant pis ! Ce soir, tout le monde à la fête ! »'},
            {si:[{vu:'pisteur:boulangerie:oie'}], t:'Le maire : « Une oie… mais pas de banderoles ? Bon, bon. Ce soir, tout le monde à la fête ! »'}]}
      ]},
      /* le Sage (étape 3) : le tableau d'Odette (sa mission de fête), le Livre d'or, puis rendre le tableau (et le filet de la lettre) */
      sage:{intro:'La mairie. Ce soir, le tableau d\'Odette sera accroché au-dessus du gâteau.', points:[
        {id:'tableau', ic:'🖼️', nom:'Le tableau d\'Odette', moments:['matin', 'apresmidi'], mj:'runes', mjNiveau:7, params:{image:'tableau'},
          avant:'Pour peindre le tableau, tu as collé les vieux dessins d\'Odette et de ses chats… mais un coup de vent les a tous mélangés ! Remets chaque morceau à sa place.',
          bouton:'🖼️ Assembler le tableau',
          t:'Odette sourit sur la toile, sa canne à la main, ses sept chats autour d\'elle. Le maire : « Magnifique ! On l\'accrochera au-dessus du gâteau. »',
          rate:'Les morceaux se mélangent de plus en plus… Le maire soupire : « Bon. On accrochera des lampions à la place. »',
          ferme:'Le tableau est rangé dans un coin.'},
        {id:'livredor', ic:'📖', nom:'Le Livre d\'or de la fête', moments:['matin', 'apresmidi'], donne:'info:ecritures',
          t:'Sur la table de la mairie, le Livre d\'or de la fête. « Reviens vite, Odette ! » « Vive la fête ! » « Une brioche t\'attend ! »… Tout le village y a écrit un petit mot, chacun avec son écriture.'},
        /* rendre le tableau : 5 pièces d'or. Le filet : si le Sage n'a pas encore la lettre, le maire l'accroche sous le tableau */
        {id:'rendu', ic:'🎉', nom:'Rendre le tableau au maire', moments:A_, or:5, visibleSi:[{vu:'sage:mairie:tableau'}], varianteFigee:true,
          t:'Le maire : « Magnifique ! Ce soir, tout le monde à la fête ! »',
          variantes:[
            {si:[{et:[{non:{code:'obj:lettre'}}, {non:{code:'info:copie'}}]}], recoit:'obj:lettre', obj:'lettre',
              t:'Le maire : « Magnifique ! Et la lettre d\'Odette, je l\'accroche sous votre tableau, pour que tout le village la lise ce soir ! » Tu peux la lire de près…'}]},
        /* le tableau raté : rien à rendre (pas d'or), mais le filet de la lettre ne doit pas dépendre du tableau (sinon, pas de lettre du tout) */
        {id:'sanstableau', ic:'🏛️', nom:'Passer voir le maire', moments:A_, visibleSi:[{rate:'sage:mairie:tableau'}], varianteFigee:true,
          t:'Le maire : « Pas de tableau ? Tant pis, les lampions feront l\'affaire. Ce soir, tout le monde à la fête ! »',
          variantes:[
            {si:[{et:[{non:{code:'obj:lettre'}}, {non:{code:'info:copie'}}]}], recoit:'obj:lettre', obj:'lettre',
              t:'Le maire : « Pas de tableau ? Tant pis. La lettre d\'Odette, je l\'accroche au mur, pour que tout le village la lise ce soir ! » Tu peux la lire de près…'}]}
      ]},
      /* l'Alchimiste (étape 4) : porter le gâteau au maire, l'après-midi (5 pièces d'or) */
      alchimiste:{intro:'La mairie. Le maire attend son gâteau en regardant sa montre.', points:[
        {id:'gateau', ic:'🎉', nom:'Porter le gâteau au maire', moments:A_, or:5, visibleSi:[{vu:'alchimiste:boulangerie:gateau'}],
          t:'Le maire fait le tour du gâteau, les mains dans le dos : « Quelle merveille ! Ce sera le clou de ma fête. Que personne n\'y touche avant ce soir ! »'}
      ]}
    },
    clocher:{
      /* (12 novembre, Bible §13.26) L'ALCHIMISTE ET BERTILLE : des plantes poussent au-delà de la brume. Anselme sonne Bertille, la plus petite de
         ses trois cloches (« Bertille, Gontran et la Grosse Marie », pnj.anselme) : elle repousse la brume « un petit peu » — au nord et à l'ouest
         (E.brume). La Grosse Marie, elle, sonne l'ouverture de la fête, la nuit : c'est l'affaire du Barde (grands.cle). À tout moment de la journée.
         (12 novembre au soir, EN DISCUSSION, rien de construit : Romain aimerait que ce soit la Grosse Marie qui écarte la brume pour la
         cueillette — mais alors les quatre plantes d'au-delà de la brume ne se cueilleraient plus que la nuit, et la tisane n'aurait plus
         de raison. À trancher avec lui avant d'y toucher.)
         LA TISANE D'ANSELME (Romain, 12 novembre, 15 h 39 ; Bible §13.28) : « c'est Anselme qui réclame de la tisane à la mélisse, et la mélisse, on
         ne peut la trouver que derrière la brume ». Il sonne donc Bertille POUR qu'on aille lui en chercher ; l'Alchimiste lui en rapporte (le
         point « tisane », visible dès qu'elle a de la mélisse ; elle garde sa plante pour l'établi). Dès le matin, Anselme la fait appeler par le
         Barde (pnj.anselme, occupe.matin). En vrai : la tisane de mélisse calme et aide à dormir. */
      alchimiste:{intro:'Le clocher. Tout là-haut, Anselme veille sur ses trois cloches : Bertille, Gontran et la Grosse Marie.', points:[
        {id:'bertille', ic:'🔔', nom:'Monter voir Anselme',
          t:'« AH, TE VOILÀ ! » Anselme bâille à s\'en décrocher la mâchoire. « Mes cloches me résonnent dans la tête : je ne dors plus ! Il me faudrait une tisane de mélisse… mais la mélisse ne pousse plus que derrière la brume. » Il attrape la plus petite corde. « Bertille est toute menue : elle ne repousse la brume qu\'un petit peu. Ça suffira. Tu m\'en rapportes ? » DING ! DING ! DING ! Par la lucarne, tu vois la brume reculer, au nord et à l\'ouest.',
          note:'Anselme a sonné Bertille, sa plus petite cloche : la brume a reculé un peu, au nord et à l\'ouest du village. En échange, il veut de la mélisse pour sa tisane.'},
        {id:'tisane', ic:'🍵', nom:'Porter la mélisse à Anselme', or:3, visibleSi:[{vu:'plante:melisse'}],
          t:'Tu lui tends une belle poignée de mélisse. Il froisse une feuille sous son nez. « ÇA SENT LE CITRON ! » Ce soir, une bonne tisane, et il dormira comme un loir. « Garde le reste pour toi. Et merci ! »',
          note:'Anselme a sa mélisse. En tisane, elle calme et elle aide à dormir.'}
      ]},
      pisteur:{intro:'Le clocher. Tout là-haut dort la Grosse Marie, la plus vieille cloche du village.', points:[
        /* la clé d'Anselme : avec « La Grosse Marie sonne » (le Barde, info:cle_clou) ; difficile, un seul essai. Raté : le puits apparaît (puits, plus bas) */
        /* (decor 'clocher' : la nef, la sacristie, et tout en haut la Grosse Marie, Anselme et le Barde, la clé au clou — Romain, 21 h 21)
           (12 novembre au soir : dans l'histoire, la clé est maintenant à la ceinture d'Anselme — les textes le disent ; le dessin de la
           dernière pièce, dans mj-cachette.js, montre encore la clé au clou : à reprendre avec le Pisteur) */
        {id:'cle', ic:'🗝️', nom:'La clé d\'Anselme', moments:['nuit'], mj:'cachette', mjNiveau:4, params:{decor:'clocher'},
          besoin:[{code:'info:cle_clou'}], visibleSi:[{code:'info:cle_clou'}],
          avant:'Les cloches sonnent ! Là-haut, Anselme compte les coups, les yeux fermés. Traverse l\'église et monte tout en haut du clocher sans te faire voir. Un seul essai !',
          bouton:'🫥 Se faufiler',
          t:'DONG ! DONG ! Anselme compte les coups, les yeux fermés. Sa clé pend à sa ceinture… Tu la décroches, tout doucement.',
          rate:'« Qui va là ?! » Anselme pose la main sur sa clé. En redescendant, tu vois Moustache filer vers la forêt… vers le vieux puits !',
          ferme:'Anselme garde sa clé à la ceinture.'},
        /* la clé en main : la grille s'ouvre (la descente dans le donjon se branche à l'étape 6) */
        {id:'crypte', ic:'🗝️', nom:'La grille de la crypte', moments:['nuit'], besoin:[{vu:'pisteur:clocher:cle'}], visibleSi:[{vu:'pisteur:clocher:cle'}],
          t:'La clé tourne : clac ! La grille grince. Un escalier de pierre descend dans le noir… Moustache file devant toi en miaulant.', choix:['descendre']},
        /* (étape 6) la descente : la fenêtre du donjon (descente.js) ; il lui faut le sac de l'Alchimiste */
        {id:'descendre', ic:'🕯️', nom:'Descendre sous le clocher', choixTxt:'🕯️ Descendre', moments:['nuit'], visibleSi:[{vu:'pisteur:clocher:crypte'}], descente:'crypte'}
      ]}
    },
    puits:{
      pisteur:{intro:'Le vieux puits, au bord de la forêt. Plus personne n\'y tire d\'eau depuis longtemps.', points:[
        /* seulement si la clé d'Anselme est ratée, ou avec « Le vieux puits » du Barde ; jamais si la clé a été prise.
           (L'acide de l'Alchimiste, qui fait fondre les barreaux, arrive avec le sac, à l'étape 6.) */
        {id:'grille', ic:'🕳️', nom:'La grille du vieux puits', moments:['nuit'], visibleSi:[{rate:'pisteur:clocher:cle'}, {code:'info:vieux_puits'}], cacheSi:[{vu:'pisteur:clocher:cle'}],
          t:'Une vieille grille rouillée. Moustache passe entre les barreaux… toi, non. Il faudrait de quoi ronger toute cette rouille !'},
        /* (étape 6) l'acide du sac de l'Alchimiste (le code du sac : P.vus['sac:acide'], plantes.js) fait fondre les barreaux */
        {id:'acide', ic:'🧪', nom:'Verser l\'acide sur la grille', moments:['nuit'], visibleSi:[{vu:'pisteur:puits:grille'}], besoin:[{vu:'sac:acide'}],
          alt:'Tu n\'as rien pour ronger la rouille. L\'Alchimiste a ce qu\'il faut : demande-lui le code de son sac, et tape-le dans ton onglet Code.',
          t:'Tu verses l\'acide de l\'Alchimiste. Pssshhh ! Les barreaux fondent comme du sucre. Tout en bas, deux yeux brillent : Moustache t\'attend.', choix:['descendre']},
        {id:'descendre', ic:'🕯️', nom:'Descendre au fond du puits', choixTxt:'🕯️ Descendre', moments:['nuit'], visibleSi:[{vu:'pisteur:puits:acide'}], descente:'puits'}
      ]}
    }
  },

  /* ---------- Les villageois (E3-dialogues-et-trame.md, version 3 : la seule source) ----------
     Chacun a une place à chaque moment : ou (on lui parle), sinon carte + occupe (deux petites phrases : la deuxième quand on revient).
     LES QUESTIONS (12 novembre au soir) : pour chacun, dans cet ordre, [0] la lettre, [1] Odette, [2] cette nuit (les trois questions
     communes), [3] sa question de métier, puis ce qui s'ouvre plus tard (une question de plus, un grand dialogue). NE PAS CHANGER CET ORDRE :
     les missions du Carnet, les conditions et les robots comptent dessus (barde:<pnj>:<n°>).
     Un menteur ne ment qu'une fois sur ses quatre réponses. Le nom de Léo n'est dans aucune question ni aucune réponse.
     Le matin : le voisin, Gaspard, Victor, Iris, Margot, Tim, Fortuné. L'après-midi : le maire, Mélusine, Anselme, Silas, Basile, Farinel
     (et encore Margot, Tim, Fortuné, avec les mêmes questions). La nuit : Anselme au clocher ; les autres sont à la fête (E.fete). */
  pnj:{
    /* le maire ne ment jamais (il ne dit pas tout). Le matin, il attend ses fleurs ; l'après-midi, il les compte (marche.retour), puis ses
       questions. Le grand dialogue de la lettre ne s'ouvre qu'une fois tout demandé aux villageois du matin, et à lui (toutDit). */
    grosbec:{ou:{apresmidi:'mairie'}, carte:{matin:'mairie'},
      occupe:{matin:['« Mes fleurs d\'abord, Barde ! Nous parlerons cet après-midi. »', '« Dix bouquets, pas un de moins ! Allez, allez ! »']},
      salut:'', questions:[
      {q:Q_LETTRE, g:'h', moments:A_, a:'Une merveilleuse nouvelle ! Je l\'ai trouvée sous ma porte ce matin.',
        note:'Le maire : il a trouvé la lettre sous sa porte, ce matin.'},
      {q:Q_ODETTE, g:'h', moments:A_, a:'Nos deux familles sont là depuis la fondation. Une femme… très curieuse.',
        note:'Le maire : sa famille et celle d\'Odette sont à Brumeval depuis la fondation. « Une femme… très curieuse. »'},
      {q:Q_NUIT, g:'h', moments:A_, a:'Rien qui mérite qu\'on en parle.',
        note:'Le maire : cette nuit, « rien qui mérite qu\'on en parle ».'},
      {q:'Être maire, c\'est beaucoup de travail ?', g:'h', moments:A_, a:'Les fêtes, c\'est ma fierté ! Un village heureux ne pose pas de questions.',
        note:'Le maire : « Les fêtes, c\'est ma fierté ! Un village heureux ne pose pas de questions. »'},
      /* le grand dialogue de la lettre (E.grands.lettre, grands.js) */
      {q:'Je voudrais vous parler de la lettre…', g:'r', moments:A_, grand:'lettre',
        besoin:[{toutDit:['levoisin', 'gaspard', 'victor', 'iris', 'margot', 'tim', 'fortune', 'grosbec']}]}
    ]},
    gaspard:{ou:{matin:'boulangerie'}, carte:{apresmidi:'boulangerie'},
      occupe:{apresmidi:['« Pas maintenant, j\'ai sept étages de gâteau qui penchent ! »', '« Si je lâche ma poche à douille, tout s\'écroule ! »']},
      salut:'Bonjour ! C\'est le coup de feu, mais pour toi, j\'ai une minute.', questions:[
      {q:Q_LETTRE, g:'e', moments:M_, a:'Pas un mot de ses chats, elle qui ne parle que d\'eux !',
        note:'Gaspard : dans la lettre, pas un mot des chats d\'Odette. Elle qui ne parle que d\'eux !'},
      {q:Q_ODETTE, g:'e', moments:M_, a:'Une brioche chaque matin, et sa canne à la main. Elle ne sort jamais sans.',
        note:'Gaspard : Odette ne sort jamais sans sa canne.'},
      {q:Q_NUIT, g:'e', moments:M_, a:'Hier soir, une femme, un fichu sur la tête, m\'a demandé une plume de mes oies. Il faisait noir : je n\'ai pas vu son visage.',
        note:'Gaspard : hier soir, une femme, un fichu sur la tête, lui a demandé une plume de ses oies. Il n\'a pas vu son visage.'},
      {q:'Votre four tourne fort, aujourd\'hui ?', g:'r', moments:M_, a:'Le maire m\'a commandé le plus gros gâteau de ma vie. Il est si fier de ses fêtes !',
        note:'Gaspard : le maire est très fier de ses fêtes.'}
    ]},
    margot:{ou:{matin:'taverne', apresmidi:'taverne'}, salut:'Bienvenue au Chaudron fêlé ! Ce soir, c\'est la fête !', questions:[
      {q:Q_LETTRE, g:'e', moments:MA_, a:'Une bien belle lettre ! Odette me parle souvent de sa sœur.', ment:true,
        vrai:'Bon… non. Je ne l\'ai jamais entendue parler d\'une sœur. Mais tout le monde était si content…',
        note:'Margot dit qu\'Odette lui parle souvent de sa sœur.', noteVrai:'Margot a avoué : elle n\'a jamais entendu Odette parler d\'une sœur.'},
      {q:Q_ODETTE, g:'h', moments:MA_, a:'Elle venait boire sa tisane ici, et savait tout sur tout le monde.',
        note:'Margot : Odette venait boire sa tisane à la taverne, et savait tout sur tout le monde.'},
      /* des ragots sur tout le monde : Mélusine est noyée dans la liste (Romain, 21 h 31 : « soit elle dénonce plein de gens, soit personne ») */
      {q:Q_NUIT, g:'h', moments:MA_, a:'Rien vu. Mais ici, tout se sait : Basile parle à ses choux, Victor a peur des chats, Fortuné vend des cailloux peints… et Mélusine a du tissu tout neuf !',
        note:'Margot, ses ragots : Basile parle à ses choux, Victor a peur des chats, Fortuné vend des cailloux peints, Mélusine a du tissu tout neuf.'},
      {q:'Le maire vient souvent à la taverne ?', g:'r', moments:MA_, a:'Chaque soir, pour son cidre. Il déteste qu\'on dise qu\'il cache des choses : il devient tout rouge !',
        note:'Margot : le maire déteste qu\'on dise qu\'il cache des choses.'}
    ]},
    victor:{ou:{matin:'poste'}, carte:{apresmidi:'poste'},
      occupe:{apresmidi:['« Cent invitations à distribuer : pas une minute ! »', '« Quatre-vingt-dix-neuf… Non ! Tu m\'as fait perdre le compte ! »']},
      salut:'Bonjour ! Une lettre pour toi ? Ah non…', questions:[
      {q:Q_LETTRE, g:'e', moments:M_, donne:'info:poste', a:'Ni timbre ni tampon : elle n\'est pas passée par la poste. Et en vingt ans, Odette n\'a jamais envoyé une seule lettre.',
        note:'Victor : la lettre d\'Odette n\'a ni timbre ni tampon, elle n\'est pas passée par la poste. Et en vingt ans, Odette n\'a jamais envoyé une seule lettre (code pour le Sage).'},
      {q:Q_ODETTE, g:'h', moments:M_, a:'Odette ? Je la connais à peine.', ment:true,
        vrai:'Bon… je l\'évite. Ses chats me suivent partout en miaulant, et j\'ai peur des chats.',
        note:'Victor dit qu\'il connaît à peine Odette.', noteVrai:'Victor a avoué : il évite Odette. Ses chats le suivent partout en miaulant, et il a peur des chats.'},
      {q:Q_NUIT, g:'h', moments:M_, a:'Rien : je me couche tôt, ma tournée commence avant l\'aube.',
        note:'Victor : il n\'a rien vu cette nuit, il se couche tôt.'},
      {q:'Votre tournée se passe bien ?', g:'r', moments:M_, a:'Le maire me confie tous ses papiers. Il les recompte chaque soir : gare à qui en emprunte un !',
        note:'Victor : le maire recompte ses papiers chaque soir. Gare à qui en emprunte un !'},
      /* une question de plus, dès qu'il a répondu sur la lettre : l'idée de comparer les écritures (Romain, 20 h 04 : « ce serait bien qu'il
         y ait quelqu'un qui émette l'hypothèse de récupérer la lettre et de la comparer avec son écriture ») */
      {q:'Comment savoir si c\'est vraiment Odette qui l\'a écrite ?', g:'e', moments:M_, besoin:[{vu:'barde:victor:0'}], a:'Il faudrait comparer avec quelque chose qu\'elle a écrit elle-même. Un papier à elle, chez elle…',
        note:'Victor : pour savoir si Odette a écrit la lettre, il faudrait la comparer avec quelque chose qu\'elle a écrit elle-même. Un papier à elle, chez elle…'}
    ]},
    /* après le marchandage, c'est un villageois comme les autres (pas de salut : il vient de te vendre des fleurs) */
    fortune:{ou:{matin:'place', apresmidi:'place'}, salut:'', questions:[
      {q:Q_LETTRE, g:'h', moments:MA_, a:'Une lettre qui fait faire une fête ? J\'adore : j\'ai vendu tous mes lampions !',
        note:'Fortuné : grâce à la lettre et à la fête, il a vendu tous ses lampions.'},
      {q:Q_ODETTE, g:'h', moments:MA_, a:'La seule qui marchande mieux que moi ! Elle m\'a eu sur un pot de sardines.',
        note:'Fortuné : Odette marchande mieux que lui.'},
      {q:Q_NUIT, g:'e', moments:MA_, a:'Rien vendu, rien vu : je dormais dans ma carriole !', ment:true,
        vrai:'Bon… j\'ai vendu du papier, tard. Payé avec une pièce d\'or toute neuve ! Il faisait noir, je n\'ai pas vu qui.',
        note:'Fortuné dit qu\'il n\'a rien vendu ni rien vu, cette nuit.', noteVrai:'Fortuné a avoué : cette nuit, il a vendu du papier, payé avec une pièce d\'or toute neuve. Il n\'a pas vu qui.'},
      /* (dès cette réponse, la vieille clé rouillée entrera dans la boutique du Barde : 320 pièces, § 13.9 — à brancher avec les objets) */
      {q:'D\'où venez-vous, avec votre carriole ?', g:'h', moments:MA_, a:'De partout ! Regarde cette vieille clé couverte de runes, trouvée au-delà de la brume. Personne n\'en veut.',
        note:'Fortuné : il vend une vieille clé couverte de runes, trouvée au-delà de la brume.'}
    ]},
    /* le matin, il ramone près du clocher ; l'après-midi, sur les toits de la ruelle des Brumes */
    tim:{ou:{matin:'clocher', apresmidi:'ruelle'}, salut:'Salut ! Attention, ça tombe !', questions:[
      {q:Q_LETTRE_TU, g:'h', moments:MA_, a:'Moi, je ne lis pas très bien. Mais une fête, j\'adore !',
        note:'Tim : il ne lit pas très bien, mais il adore les fêtes.'},
      {q:Q_ODETTE_TU, g:'h', moments:MA_, a:'Elle me donne des biscuits pour Pirate. Et elle me gronde quand je marche sur ses toits !',
        note:'Tim : Odette lui donne des biscuits pour son chien, Pirate.'},
      /* (c'est Mélusine qui a déposé la lettre, dans un châle comme celui d'Odette : Romain, 18 h 15) */
      {q:Q_NUIT, g:'e', moments:MA_, a:'Rien ! Je dormais, comme tout le monde.', ment:true, donneVrai:'info:chale',
        vrai:'Bon… j\'étais sur les toits, à l\'aube. J\'ai vu Odette, dans son châle à chats, glisser la lettre à la mairie… mais elle marchait vite, et sans canne.',
        note:'Tim dit que cette nuit, il dormait, comme tout le monde.', noteVrai:'Tim a avoué : à l\'aube, il a vu « Odette », dans son châle à chats, glisser la lettre à la mairie. Mais elle marchait vite, et sans canne (code pour le Sage).'},
      {q:'Ça fait quoi, d\'être ramoneur ?', g:'h', moments:MA_, a:'Je vois tout le village d\'en haut ! Et dans une cheminée, j\'ai trouvé une pièce avec une lanterne dessinée.',
        note:'Tim : dans une cheminée, il a trouvé une pièce avec une lanterne dessinée.'}
    ]},
    /* le voisin d'Odette, au 1, rue des Lanternes (il ne ment jamais) : un vrai villageois à l'enquête 3 (« voisin », plus bas, reste la porte d'Odette) */
    levoisin:{ou:{matin:'L1'}, carte:{apresmidi:'L1'},
      occupe:{apresmidi:['« Les chats me griffent les mollets, ils ont faim ! Repasse plus tard. »', '« Je surveille la maison d\'Odette. Repasse ce soir. »']},
      salut:'Bonjour… Tu viens pour Odette ?', questions:[
      {q:Q_LETTRE, g:'e', moments:M_, a:'Chez sa sœur ? Odette n\'a pas de sœur !',
        note:'Le voisin : Odette n\'a pas de sœur !'},
      {q:Q_ODETTE, g:'e', moments:M_, a:'Trente ans qu\'on est voisins. Jamais elle ne laisserait ses chats : ils viennent tous mendier chez moi.',
        note:'Le voisin : jamais Odette ne laisserait ses chats. Ils viennent tous mendier chez lui.'},
      {q:Q_NUIT, g:'e', moments:M_, a:'Ses chats ont miaulé toute la nuit. Tous sont chez moi, sauf Moustache, le gros gris : disparu !',
        note:'Le voisin : les chats d\'Odette ont miaulé toute la nuit. Tous sont chez lui, sauf Moustache, le gros gris, qui a disparu.'},
      {q:'Vous gardez sa maison ?', g:'e', moments:M_, a:'Elle n\'est jamais fermée : Odette ne ferme rien. Si tu retrouves sa canne, va la lui poser.',
        note:'Le voisin : la maison d\'Odette n\'est jamais fermée. Si tu retrouves sa canne, va la lui poser.'}
    ]},
    /* la maison d'Odette, au 2, rue des Lanternes : une visite, sans questions ; deux codes d'un coup. (12 novembre au soir) Dès le matin
       (le voisin dit qu'elle n'est jamais fermée, et la lettre demande de rapporter la canne), et encore la nuit (un filet). */
    voisin:{ou:{matin:'L2', apresmidi:'L2', nuit:'L2'}, salut:'La maison d\'Odette. La porte n\'est toujours pas fermée à clé…', questions:[
      {q:'Poser la canne d\'Odette', donne:['obj:carnet', 'info:traces_moustache'], titreDonne:'Chez Odette',
        a:'Tu poses la canne contre la porte. Sur la table, le carnet d\'Odette : un chat à chaque page, et son écriture penchée. Par terre, du lait renversé… et de petites traces de pattes qui filent dehors !',
        note:'Chez Odette : tu as posé sa canne contre la porte. Sur la table, son carnet, de son écriture penchée. Par terre, du lait renversé, et de petites traces de pattes qui filent dehors.'}
    ]},
    /* occupée le matin ; l'après-midi, dans son atelier, elle coud les banderoles (elle ment) */
    melusine:{ou:{apresmidi:'atelier'}, carte:{matin:'atelier'},
      occupe:{matin:['« Pas maintenant ! Je viens de coudre ma manche à la banderole de Pompon… »', '« Encore toi ? Attention à mes épingles ! Repasse cet après-midi. »']},
      salut:'Bonjour… Attention aux épingles.', questions:[
      /* (Romain, 21 h 31 : « juste : je suis contente qu'elle aille bien, c'est tout », sans « elle baisse les yeux ») */
      {q:Q_LETTRE, g:'h', moments:A_, a:'Je suis contente qu\'elle aille bien.',
        note:'Mélusine : elle est contente qu\'Odette aille bien.'},
      {q:Q_ODETTE, g:'e', moments:A_, a:'C\'est mon amie. Je lui ai offert sa canne, avec sept chats gravés.',
        note:'Mélusine : Odette est son amie. C\'est elle qui lui a offert sa canne, avec sept chats gravés.'},
      {q:Q_NUIT, g:'e', moments:A_, a:'Rien. Je dormais, voyons !', ment:true,
        vrai:'Bon… j\'ai veillé à la bougie. Ne me demande pas pourquoi.',
        note:'Mélusine dit que cette nuit, elle dormait.', noteVrai:'Mélusine a avoué : cette nuit, elle a veillé à la bougie. Elle ne dit pas pourquoi.'},
      {q:'Qu\'est-ce que vous cousez pour la fête ?', g:'h', moments:A_, a:'Une banderole par chat d\'Odette : Moustache, Biscotte, Pompon, Caramel, Mistigri, Noisette, Grisette.',
        note:'Mélusine : les sept chats d\'Odette s\'appellent Moustache, Biscotte, Pompon, Caramel, Mistigri, Noisette et Grisette.'},
      /* [4] l'accusation, quand l'équipe sait que c'est elle (aujourd'hui : le code de l'Alchimiste, « L'écriture de Mélusine » ; dans le
         nouveau fil, ce sera celui du Sage — l'écriture et la pointure). Démasquée : son aveu, et le code pour le Sage (le filet : la nuit,
         à la fête). La seule vérité de plus de 30 mots : c'est le tournant de l'enquête. NE PAS DÉPLACER : E.faits, les missions et le
         grand dialogue d'Anselme citent « verite:melusine:4 ». */
      {q:'C\'est vous qui avez écrit la lettre.', g:'e', moments:A_, besoin:[{code:'info:ecriture'}], a:'Moi ? Je sais à peine écrire mon nom !', ment:true, donneVrai:'info:aveu',
        vrai:'C\'est moi… Un homme en cape m\'a forcée à l\'écrire et à la déposer. Je n\'ai pas vu son visage. Il est venu ici, cette nuit : il a peut-être laissé des traces…',
        note:'Mélusine dit qu\'elle sait à peine écrire son nom.', noteVrai:'Mélusine a avoué : un homme en cape l\'a forcée à écrire la lettre et à la déposer. Elle n\'a pas vu son visage. Il est venu chez elle cette nuit : il a peut-être laissé des traces (code pour le Sage).'}
    ]},
    /* le matin : ses fleurs (marche.js : le bouton « 🌸 » dans sa conversation et sur sa pastille), et ses quatre questions — on lui a volé
       un flacon d'encre, cette nuit (Romain, 18 h 19). L'après-midi, elle est occupée par ses couronnes (elle vend encore, s'il reste des pièces). */
    iris:{ou:{matin:'herboristerie'}, carte:{apresmidi:'herboristerie'},
      occupe:{apresmidi:['« Chut ! Je fais les couronnes de ce soir. »', '« Si c\'est pour des fleurs, d\'accord. Sinon, à ce soir ! »']},
      /* (son bonjour marche aussi quand le Barde vient de la fâcher au marché : fâchée, elle ne vend plus, mais elle répond encore) */
      salut:'Ah, c\'est toi ! Attention à mes pots, ils sèchent.', questions:[
      {q:Q_LETTRE, g:'h', moments:M_, a:'Je n\'ai pas fait attention, je pensais à mes fleurs.',
        note:'Iris : elle n\'a pas fait attention à la lettre.'},
      {q:Q_ODETTE, g:'h', moments:M_, a:'Elle m\'achète de la camomille pour dormir… et elle ne dort jamais !',
        note:'Iris : Odette lui achète de la camomille pour dormir… et elle ne dort jamais.'},
      {q:Q_NUIT, g:'e', moments:M_, a:'Cette nuit, on m\'a volé un flacon de mon encre ! Je la fabrique moi-même, avec des noix de galle.',
        note:'Iris : cette nuit, on lui a volé un flacon de son encre. Elle la fabrique elle-même, avec des noix de galle.'},
      {q:'Vos plantes servent à quoi ?', g:'h', moments:M_, a:'À soigner, à teindre, à parfumer. La pensée sauvage pousse même dans la brume !',
        note:'Iris : la pensée sauvage pousse même dans la brume.'}
    ]},
    /* un peu sourd, il parle fort (il ne ment jamais) */
    anselme:{ou:{apresmidi:'clocher', nuit:'clocher'}, carte:{matin:'clocher'},
      /* (Romain, 12 novembre, 15 h 39) le matin, il fait appeler l'Alchimiste par le Barde : il a un service à lui demander (sa tisane de mélisse,
         lieux.clocher). Dit à voix haute, sans code : l'Alchimiste peut monter au clocher dès le matin, avec ou sans ce message. */
      occupe:{matin:['« AH, LE BARDE ! VA ME CHERCHER L\'ALCHIMISTE : J\'AI UN SERVICE À LUI DEMANDER ! » DONG !', '« L\'AL-CHI-MISTE ! PAS LE FLEURISTE ! DIS-LUI DE MONTER ME VOIR ! » DONG !']},
      salut:'HEIN ? AH, C\'EST TOI !', questions:[
      /* (l'après-midi et la nuit : il est au clocher aux deux moments) */
      {q:Q_LETTRE, g:'h', moments:AN_, a:'LA LETTRE ? LE MAIRE PARLE TROP BAS, JE N\'AI RIEN ENTENDU !',
        note:'Anselme : il n\'a rien entendu de la lettre, le maire parle trop bas.'},
      {q:Q_ODETTE, g:'h', moments:AN_, a:'ODETTE ? Elle m\'apporte des pastilles pour la gorge. Gentille, mais BAVARDE !',
        note:'Anselme : Odette lui apporte des pastilles pour la gorge. « Gentille, mais bavarde ! »'},
      /* (Romain, 21 h 31) */
      {q:Q_NUIT, g:'e', moments:AN_, a:'CETTE NUIT, UNE LANTERNE EST DESCENDUE DANS LA CRYPTE. La grille était fermée à clé… C\'est bizarre : j\'ai la SEULE clé !',
        note:'Anselme : cette nuit, une lanterne est descendue dans la crypte. La grille était fermée à clé… et il a la seule clé !'},
      {q:'Sonner les cloches, c\'est dur ?', g:'r', moments:AN_, a:'Parle-moi FORT et LEN-TE-MENT. Et ne me presse jamais : quand on me presse, je n\'entends plus rien !',
        note:'Anselme : il faut lui parler fort et lentement, et ne jamais le presser.'},
      /* [4] avec le code du Pisteur « La crypte est fermée ». Il ne parle plus de sa clé (Romain, 21 h 31 : « on s'en fiche ») */
      {q:'Qu\'y a-t-il sous le clocher ?', g:'h', moments:AN_, besoin:[{code:'info:crypte_fermee'}], a:'LA CRYPTE DES FONDATEURS. Personne n\'y descend, jamais !',
        note:'Anselme : sous le clocher, la crypte des Fondateurs. « Personne n\'y descend, jamais ! »'},
      /* [5] le grand dialogue (E.grands.cle), la nuit, quand il monte sonner l'ouverture de la fête. Il ne s'ouvre que quand tout est prêt
         (Romain : « pour Anselme, il faut débloquer pas mal de choses ») : l'aveu de Mélusine (démasquée l'après-midi, ou le filet de la
         fête), le code « La crypte est fermée », et tout demandé à Anselme, à Basile et à Silas. */
      {q:'Anselme, je voudrais vous demander quelque chose…', g:'r', moments:N_, grand:'cle',
        besoin:[{et:[{ou:[{vu:'verite:melusine:4'}, {vu:'fete:filet:melusine'}]}, {code:'info:crypte_fermee'}, {toutDit:['anselme', 'basile', 'silas']}]}]}
    ]},
    /* (il ment une fois : sa nuit. « Elle a appris à lire à mon apprenti » : une graine, qu'on ne comprend qu'après le donjon) */
    farinel:{ou:{apresmidi:'moulin'}, carte:{matin:'moulin'},
      occupe:{matin:['« Pas le temps, mes sacs de farine débordent ! Atchoum ! »', '« Regarde-moi : un vrai fantôme de farine ! Reviens cet après-midi. »']},
      salut:'Bonjour, bonjour ! Tu veux de la farine ?', questions:[
      {q:Q_LETTRE, g:'h', moments:A_, a:'Atchoum ! Pardon… je dormais à moitié pendant la lecture.',
        note:'Farinel : il dormait à moitié pendant la lecture de la lettre.'},
      {q:Q_ODETTE, g:'h', moments:A_, a:'Elle a appris à lire à mon apprenti, le soir. Brave femme.',
        note:'Farinel : Odette a appris à lire à son apprenti, le soir.'},
      {q:Q_NUIT, g:'h', moments:A_, a:'J\'ai veillé toute la nuit, comme un bon meunier !', ment:true,
        vrai:'Bon… j\'ai dormi comme une souche. Je dors toujours.',
        note:'Farinel dit qu\'il a veillé toute la nuit.', noteVrai:'Farinel a avoué : il a dormi comme une souche.'},
      {q:'Votre moulin est vraiment si vieux ?', g:'h', moments:A_, a:'Le plus vieux de Brumeval ! Une pierre du mur porte une lanterne gravée.',
        note:'Farinel : son moulin est le plus vieux de Brumeval. Une pierre du mur porte une lanterne gravée.'}
    ]},
    /* le matin, sur la place (sa « mission secrète », et Fortuné qui vend sans permis) ; l'après-midi, devant la mairie.
       Il ne ment pas : il croit à l'éboulement. */
    silas:{ou:{apresmidi:'mairie'}, carte:{matin:'place'},
      occupe:{matin:['« Halte ! Mission secrète. Si secrète que même moi, je ne la connais pas. »', '« Chut ! Je surveille une fourmi très suspecte. »']},
      salut:'Halte ! Ah, c\'est toi.', questions:[
      {q:Q_LETTRE, g:'h', moments:A_, a:'Une lettre lue par le maire en personne : affaire classée !',
        note:'Silas : pour lui, une lettre lue par le maire, c\'est une affaire classée.'},
      {q:Q_ODETTE, g:'h', moments:A_, a:'Une dame respectable. Un peu trop curieuse, dit le maire.',
        note:'Silas : Odette est « un peu trop curieuse, dit le maire ».'},
      /* (Romain, 21 h 40 et 21 h 44) la grille grince : pour descendre sans que le maire l'entende, il faudra la soulever — ni la tirer, ni la
         pousser. Le geste lui-même est à construire chez le Pisteur, à l'entrée du donjon. */
      {q:Q_NUIT, g:'e', moments:A_, a:'Pendant ma ronde, la grille du clocher a grincé : on l\'entend à des kilomètres ! Anselme, lui, la soulève un peu, et elle ne dit rien.',
        note:'Silas : cette nuit, la grille du clocher a grincé. On l\'entend à des kilomètres ! Anselme, lui, la soulève un peu, et elle ne dit rien.'},
      {q:'Pourquoi êtes-vous devenu garde ?', g:'r', moments:A_, a:'Petit, je me suis perdu trois jours dans la brume. Le père d\'Anselme m\'a retrouvé en sonnant toute la nuit.',
        note:'Silas : petit, il s\'est perdu trois jours dans la brume. Le père d\'Anselme l\'a retrouvé en sonnant toute la nuit.'}
    ]},
    /* sur la place, sur son échelle : le matin, il vend ses fleurs (marche.js), puis il est occupé ; l'après-midi, ses questions (il ne ment jamais) */
    basile:{ou:{apresmidi:'place'}, carte:{matin:'place'},
      occupe:{matin:['« Pas maintenant, j\'ai les bras pleins de lampions ! »', '« Attention en dessous ! Oups… Reviens cet après-midi. »']},
      salut:'Ah, te revoilà ! Tiens-moi cette guirlande, tu veux ?', questions:[
      {q:Q_LETTRE, g:'h', moments:A_, a:'Une fête ! Moi, tant qu\'il y a des lampions, je suis content.',
        note:'Basile : tant qu\'il y a une fête et des lampions, il est content.'},
      {q:Q_ODETTE, g:'h', moments:A_, a:'Elle me donne des conseils pour mes choux. Toujours les bons !',
        note:'Basile : Odette lui donne des conseils pour ses choux.'},
      {q:Q_NUIT, g:'h', moments:A_, a:'Rien vu : je me couche avec les poules.',
        note:'Basile : il n\'a rien vu cette nuit, il se couche avec les poules.'},
      {q:'Vous décorez la place ?', g:'r', moments:A_, a:'Oui, et j\'aide Anselme. Il ne prête rien… sauf à ceux qui l\'aident à sonner la Grosse Marie : elle est si lourde !',
        note:'Basile : Anselme ne prête rien… sauf à ceux qui l\'aident à sonner la Grosse Marie, qui est si lourde.'}
    ]}
  },
  ecoutes:[],
  /* 👂 Les écoutes aux portes (talent « Tendre l'oreille », barde.js : B.porteIci) : à deux, une réplique par personne (bribes) ;
     tout seul, une phrase (portes). Certaines donnent un vrai indice, d'autres font juste rire. Réécrites le 12 novembre au soir
     (E3-dialogues-et-trame.md, version 3) : plus de lavande, plus de minuit, plus de Léo ; aucune ne donne un nom. */
  bribes:[
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
    {id:'mairie_aprem', lieu:'mairie', moments:A_, titre:'Devant la mairie', phrases:[
      {qui:'grosbec', texte:'Ce soir, tout le monde à la fête. Personne au clocher !'},
      {qui:'silas', texte:'Pourquoi le clocher, Monsieur le maire ?'},
      {qui:'grosbec', texte:'Parce que je le dis.'}],
      t:'Le maire à Silas : « Ce soir, tout le monde à la fête. Personne au clocher ! »'},
    {id:'taverne_aprem', lieu:'taverne', moments:A_, titre:'Au comptoir de la taverne', phrases:[
      {qui:'gaspard', texte:'S\'il me commande un étage de plus, je dors dans mon four !'},
      {qui:'margot', texte:'Et moi, la soupe toute la nuit !'}],
      t:'Gaspard et Margot : le maire leur donne beaucoup de travail pour sa fête.'},
    {id:'herboristerie_aprem', lieu:'herboristerie', moments:A_, titre:'Derrière la porte de l\'herboristerie', phrases:[
      {qui:'iris', texte:'Tu as les yeux rouges, Mélusine.'},
      {qui:'melusine', texte:'C\'est le fil. J\'ai trop cousu.'}],
      t:'Iris à Mélusine : « Tu as les yeux rouges. » Mélusine : « C\'est le fil. J\'ai trop cousu. »'},
    {id:'clocher_aprem', lieu:'clocher', moments:A_, titre:'Au pied du clocher', phrases:[
      {qui:'basile', texte:'Je t\'aide à sonner, ce soir ?'},
      {qui:'anselme', texte:'UN PAIN AUX RAISINS ?'},
      {qui:'basile', texte:'JE-T\'AI-DE-À-SON-NER !'},
      {qui:'anselme', texte:'Non, je sonne seul. Sauf si on me le demande… lentement !'}],
      t:'Anselme sonne seul, sauf si on lui demande de l\'aider… lentement.'},
    /* la nuit, à la fête : trois écoutes au même endroit, la place ; chaque « Écouter en douce » joue la suivante (barde.js, B.porteIci).
       (Une quatrième, « au pied du mât », viendra avec la grille du clocher : elle ne se dit que si la grille n'a pas grincé.) */
    {id:'gateau_nuit', lieu:'place', moments:N_, titre:'Près du gâteau', phrases:[
      {qui:'grosbec', texte:'Où sont passés ces trois-là ?'},
      {qui:'silas', texte:'Qui ça, Monsieur le maire ?'}],
      t:'Le maire à Silas : « Où sont passés ces trois-là ? »'},
    {id:'banderoles_nuit', lieu:'place', moments:N_, titre:'Sous les banderoles', phrases:[
      {qui:'iris', texte:'Tu trembles, Mélusine.'},
      {qui:'melusine', texte:'Je n\'écrirai plus jamais pour personne.'}],
      t:'Mélusine à Iris : « Je n\'écrirai plus jamais pour personne. »'},
    {id:'buffet_nuit', lieu:'place', moments:N_, titre:'Au buffet', phrases:[
      {qui:'gaspard', texte:'Encore une part ?'},
      {qui:'farinel', texte:'Je ne dors pas, je goûte !'}],
      t:'Gaspard et Farinel, au buffet. Farinel : « Je ne dors pas, je goûte ! »'}
  ],
  /* tout seul derrière sa porte : une phrase (à ce moment-là, qu'on puisse lui parler ou non) */
  portes:{
    grosbec:{matin:'« Cette lettre reste dans mon tiroir. Que personne n\'y touche ! »'},
    iris:{matin:'« Mon flacon d\'encre… et de la terre partout sur mon carrelage ! »'},
    levoisin:{matin:'« Six gamelles ce matin… et toujours pas de Moustache. »'},
    anselme:{matin:'« UNE LANTERNE DANS MA CRYPTE FERMÉE… J\'AI RÊVÉ, OU QUOI ? »'},
    melusine:{matin:'« Plus jamais de bougie toute la nuit… J\'ai les yeux qui piquent. »'},
    basile:{matin:'« Un lampion ici, un lampion là… et un sur ma tête ! »'},
    victor:{apresmidi:'« Six chats devant ma porte… Au secours ! »'},
    farinel:{apresmidi:'« Encore de la farine renversée… Atchoum ! »'}
  },
  /* la maison d'Odette, pour le Pisteur, l'Alchimiste et le Sage */
  absentTexte:{odette:'Odette n\'est pas chez elle. Le maire dit qu\'elle est chez sa sœur…'},
  absentPourTous:true,   /* (le Barde, lui, entre chez Odette pour poser la canne : pnj.voisin, à tous les moments depuis le 12 novembre au soir) */
  /* ---------- Le Grand Livre du Sage (livre.js ; E3-actions-des-roles.md §3, étape 3) ---------- */
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'},
    /* dès le matin : L'HERBIER (Romain, 12 novembre, 12 h 52 : « uniquement de plantes, là où elles sont, et à quel moment de la journée on peut les
       cueillir » ; « je ne veux pas qu'il parle de donjon »). Une planche par plante : où elle vit pour de vrai, UN INDICE (plus l'endroit précis
       depuis 15 h 37 : « il faut que ça soit un jeu de recherche », Bible §13.28), le moment. Tout vient de D.PLANTES (donnees.js) ; la page est
       dessinée par cueillette.js (M.herbierHTML). Plus de code : le Sage lit à voix haute, l'Alchimiste cherche sur sa carte. */
    {id:'herbier', titre:'L\'herbier des Fondateurs', ic:'🌿', type:'herbier',
      t:'Sept plantes séchées, très anciennes. Sous chacune, les Fondateurs ont laissé un indice, et le moment de la cueillir. Lis-les à voix haute à l\'Alchimiste : à vous de deviner où chercher !'},
    /* les premiers doutes (les codes du Barde : Victor, Tim démasqué). (12 novembre au soir : « Odette… sans sa canne » remplace le capuchon) */
    {id:'doutes', titre:'Une drôle de lettre', ic:'✉️', besoin:[{code:'info:poste'}, {code:'info:chale'}], bouton:'Réfléchir à la lettre',
      avant:'Cette lettre d\'Odette a quelque chose de bizarre… Il te faudrait un indice du Barde.',
      variantes:[
        {si:[{et:[{code:'info:poste'}, {code:'info:chale'}]}], t:'Pas de timbre, pas de tampon. Glissée sous la porte de la mairie, à l\'aube, par « Odette »… qui marchait vite, et sans sa canne. Odette ne sort jamais sans sa canne : ce n\'était pas elle !'},
        {si:[{code:'info:poste'}], t:'Pas de timbre, pas de tampon : la lettre n\'est pas passée par la poste. Et Odette n\'a jamais envoyé une seule lettre ! Alors, qui l\'a apportée ?'}],
      t:'À l\'aube, « Odette », dans son châle à chats, a glissé la lettre sous la porte de la mairie. Mais elle marchait vite, et sans sa canne… Odette ne sort jamais sans sa canne : ce n\'était pas elle !'},
    /* l'après-midi : la lettre et le carnet (les deux codes du Barde) → la lettre est fausse */
    {id:'fausse', titre:'La lettre et le carnet', ic:'🔍', besoin:[{et:[{code:'obj:lettre'}, {code:'obj:carnet'}]}], bouton:'Comparer la lettre et le carnet',
      avant:'Pour savoir si Odette a vraiment écrit cette lettre, il te faudrait la lettre… et quelque chose qu\'Odette a écrit elle-même.',
      t:'Odette écrit penché, avec un petit chat à côté de chaque « O ». La lettre est toute droite, sans un seul chat. Ce n\'est pas Odette qui l\'a écrite : la lettre est fausse !'},
    /* les sept chats du carnet → Moustache a six doigts (pour le Pisteur) */
    {id:'chats', titre:'Les sept chats du carnet', ic:'🐈', besoin:[{code:'obj:carnet'}], bouton:'Feuilleter le carnet', donne:'info:six_doigts',
      avant:'Odette note tout dans un carnet, un chat à chaque page. Le Barde pourrait le trouver chez elle…',
      t:'« Moustache : mon gros gris, mon malin. Un petit sixième doigt à chaque patte de devant : il ouvre toutes les portes ! »'},
    /* le plan des Fondateurs, caché dans la couverture du carnet : l'alphabet secret (il sert cette nuit, dans le donjon) */
    {id:'plan', titre:'Le plan des Fondateurs', ic:'🗺️', besoin:[{code:'obj:carnet'}], mj:'alphabet', params:{message:'LE CHEMIN DES FONDATEURS'}, bouton:'Déchiffrer le vieux parchemin',
      ouvrePartiel:true, partiel:true,
      avant:'Dans la couverture du carnet d\'Odette, un vieux parchemin plié, couvert de signes. Qu\'est-ce qu\'il dit ?',
      t:'« LE CHEMIN DES FONDATEURS » : c\'est le plan des souterrains, sous le village ! Un mot d\'Odette, au crayon : « Ne le montrer à personne. » Tu le ranges dans ton Grand Livre : il te servira cette nuit.',
      note:'Le plan des Fondateurs était caché dans le carnet d\'Odette : le chemin des souterrains, sous le village.',
      rate:'Les signes sont à moitié effacés… Tu as quand même reconnu un plan : des couloirs, sous le village. Tu le ranges dans ton Grand Livre.',
      tPartiel:'Il te servira cette nuit.'},
    /* (étape 6) la nuit : le plan des souterrains (sa page du donjon, descente.js) ; la porte des Fondateurs, quand le Pisteur l'a trouvée */
    {id:'donjon', titre:'Le plan des souterrains', ic:'🗺️', moments:['nuit'], horsMoment:'Sous le village, il y aurait de vieux souterrains… Cette page servira cette nuit.',
      get html(){ return window.M && window.M.donjonPageSage ? window.M.donjonPageSage() : ''; }},
    /* (obligatoire, livre.js : dès que le Sage a le code de la porte, son Grand Livre s'ouvre tout seul sur cette page, le bouton jaune palpite) */
    {id:'porte', titre:'La porte des Fondateurs', ic:'🚪', moments:['nuit'], horsMoment:'Une page blanche. Elle s\'écrira cette nuit.', besoin:[{code:'info:odette_porte'}], bouton:'Tourner la page', obligatoire:true,
      avant:'Tout au fond des souterrains, il y aurait une grande porte ronde. Le Pisteur la trouvera-t-il ?',
      t:'Une porte ronde, scellée. Quatre signes gravés : l\'œil, le chaudron, la lyre et l\'étoile. « Seuls les quatre, ensemble, l\'ouvriront. » Odette est là, derrière, sous le clocher. Mais cette porte ne s\'ouvrira pas cette nuit…',
      note:'Odette est sous le clocher, derrière la porte aux quatre signes : l\'œil, le chaudron, la lyre et l\'étoile.'},
    /* QUI : l'écriture (l'Alchimiste) et l'aveu (le Barde) */
    {id:'qui', titre:'Qui a écrit la lettre ?', ic:'🧵', besoin:[{et:[{code:'info:ecriture'}, {code:'info:aveu'}]}], bouton:'Relier les preuves',
      avant:'Il te faut deux preuves : l\'écriture de la lettre (l\'Alchimiste), et un aveu (le Barde).',
      t:'Mélusine a écrit la lettre, et elle l\'a glissée elle-même sous la porte de la mairie. Un homme en cape l\'y a forcée ; elle n\'a pas vu son visage. Qui est-il ? Et où va-t-il, la nuit ?'}
  ],
  bonus:[],
  /* ---------- La fin (étape 7) : dans la crypte, le maire, la bague, le cachot ----------
     La même pour toute l'équipe. Une seule réplique change, selon que Léo a été attrapé ou non : la tablette du Sage le sait par le code
     « Ce que Léo a dit » (info:leo_dit3), et le dit aux autres dans le code de fin (victoire:2x : moteur-actions.js, commencerFin ;
     P.fin.variante). 0 : Léo n'est pas là (il s'est enfui : le maire n'a pas été retenu) ; 2 : Léo est là, il a parlé.
     (12 novembre au soir : plus de « minuit » ; plus de variante 1, « Léo a parlé à moitié » — les codes victoire:1x restent réservés.
     LA FIN N'EST PAS DÉCIDÉE : Romain doit encore dire si Odette est délivrée avant l'arrivée du maire. En attendant, la même qu'avant,
     sans rien qui contredise le nouveau fil.) */
  finVariante:function(P){ return P && P.recus && P.recus['info:leo_dit3'] ? 2 : 0; },
  fin:{
    slides:[
      'Mélusine a écrit la fausse lettre, forcée par un homme en cape. Et Odette est vivante : elle est là, tout près, derrière la porte aux quatre signes. Mais qui l\'a enfermée ?',
      'Dans la crypte des Fondateurs, des pas descendent l\'escalier. Des lanternes : c\'est le maire, avec Silas et deux gardes. À la fête, il a bien vu qu\'il manquait du monde…',
      function(P){
        var v = (P && P.fin && P.fin.variante) || 0;
        return v === 2 ? 'Le maire regarde Léo, longtemps. « Toi… tu as beaucoup trop parlé, mon garçon. »'
          : 'Le maire lève sa lanterne. « Tiens, tiens… Nos petits enquêteurs, dans la crypte des Fondateurs, en pleine nuit. »';
      },
      'Lentement, il retire ses gants gris. À son doigt brille une bague en argent, à tête de corbeau. « Vous êtes allés trop loin. Beaucoup trop loin. »',
      'Silas en reste bouche bée : « Monsieur le maire… ? » Le maire ne le regarde même pas. « Gardes ! Enfermez-les ! »',
      {img:'prison', plume:true, t:'Vous voilà tous les quatre au cachot de la mairie. Devant la grille, une plume noire se pose, sans un bruit… <b>À suivre…</b>'}
    ],
    illus:['e3-porte', 'e3-minuit', 'e3-leo', 'e3-bague', 'e3-gardes'],
    calepin:[
      {ic:'✍️', t:'Mélusine a écrit la fausse lettre d\'Odette, forcée par un homme en cape. C\'est elle qui l\'a déposée à la mairie, déguisée en Odette.'},
      {ic:'🚪', t:'Odette est vivante, enfermée sous le clocher, derrière la porte aux quatre signes : l\'œil, le chaudron, la lyre et l\'étoile.'},
      {ic:'🧑', t:'L\'homme en cape, c\'est Léo, l\'apprenti du meunier. Chaque nuit, il descend dans la crypte. Quelqu\'un lui donne des ordres.'},
      {ic:'💍', t:'Dans la crypte, le maire a retiré ses gants : il porte une bague en argent à tête de corbeau.'},
      {ic:'💂', t:'Silas, le garde champêtre, n\'en revenait pas : « Monsieur le maire… ? »'},
      {ic:'⛓️', t:'Le maire vous a fait enfermer au cachot de la mairie.'}
    ]
  },
  defaite:[
    'Les lampions s\'éteignent. La fête est finie… et personne ne sait où est Odette.',
    'La brume entre dans le village et efface vos souvenirs… D\'autres enquêteurs viendront.'
  ],
  /* ---------- Les preuves (pour le vérificateur : tools/verif.js 3 → verif-e3.js ; E3-actions-des-roles.md §5, « Qui prouve quoi ») ----------
     Une preuve écarte les autres réponses. Les sources sont les clés du vérificateur (un point, une analyse, une vérité démasquée…). */
  faits:[
    /* QUI : l'écriture de la lettre (l'Alchimiste, au labo, avec le Livre d'or du Sage), ou l'aveu de Mélusine (le Barde : démasquée
       l'après-midi, ou le filet, la nuit, à la fête) */
    {sources:[['alchimiste:analyse:lettre', 'barde:melusine:4:verite', 'barde:fete:melusine']], qui:['margot', 'iris', 'victor', 'fortune']},
    /* OÙ : la porte aux quatre signes, au fond du donjon (le Pisteur, avec les potions de l'Alchimiste, et la clé ou le puits du Barde) */
    {sources:['donjon:fini'], ou:['puits', 'moulin', 'chene']}
  ]
};
/* La nuit, tout le village est à la fête, sur la place (§4) : sur la carte, chacun y est ; c'est la fête (grands.js) qui leur fait dire
   leur réplique au Barde. Le voisin d'Odette veille chez lui ; Anselme est au clocher ; Léo, introuvable. */
var E3 = E[3];
/* « Pose toutes tes questions » (les deux missions du Barde, etapes.barde, id 'matin' et 'aprem') : la liste est tirée d'ici, de E.pnj —
   pour chaque villageois, ses questions de ce moment-là qui ne demandent rien (ni code, ni grand dialogue), et celle de Victor qui
   s'ouvre toute seule (son idée). Margot, Tim et Fortuné sont là matin et après-midi : ils comptent pour le matin. */
(function(){
  function cles(ids, moment){
    var l = [];
    ids.forEach(function(id){
      (E3.pnj[id].questions || []).forEach(function(q, i){
        if(q.grand || (q.moments && q.moments.indexOf(moment) < 0)) return;
        if(q.besoin && !q.besoin.every(function(b){ return b.vu && b.vu.indexOf('barde:' + id + ':') === 0; })) return;
        l.push({vu:'barde:' + id + ':' + i});
      });
    });
    return [{et:l}];
  }
  E3.etapes.barde.forEach(function(e){
    if(e.id === 'matin') e.fait = cles(['levoisin', 'gaspard', 'victor', 'iris', 'margot', 'tim', 'fortune'], 'matin');
    if(e.id === 'aprem') e.fait = cles(['grosbec', 'melusine', 'anselme', 'silas', 'basile', 'farinel'], 'apresmidi');
  });
})();
M3cle(E3.fete.gens).forEach(function(id){
  var N = E3.pnj[id]; if(!N) return;
  N.carte = N.carte || {}; N.carte.nuit = E3.fete.lieu;
  N.occupe = N.occupe || {}; N.occupe.nuit = 'À la fête, sur la place.';
});
E3.pnj.levoisin.carte.nuit = 'L1';
/* (ajouté à la construction, le 11 novembre : il lui fallait une place la nuit) */
E3.pnj.levoisin.occupe.nuit = ['« Je veille sur la maison d\'Odette. Rien ne m\'échappe ! »', '« Toujours rien… Enfin, je crois. Je n\'ai pas dormi, hein ! »'];
function M3cle(o){ return Object.keys(o || {}); }
})();
