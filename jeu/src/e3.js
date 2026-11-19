/* ==========================================================
   Enquête 3 — La lettre d'Odette — DESIGN-saison1.md § 13 (surtout § 13.14) et jeu/enquete3/*.md (le détail, qui fait foi)
   Construite étape par étape (§ 13.14), d'abord fermée aux joueurs ; OUVERTE AUX JOUEURS le 14 novembre (Bible § 13.39), codes gelés.
   Étape 1 (11 novembre) : la lettre, l'écran des missions, le marché aux fleurs du Barde, les villageois du matin et de l'après-midi,
   les occupés, les écoutes aux portes. Pas encore : les grands dialogues (étape 2), le Sage (3), l'Alchimiste (4), le Pisteur (5),
   le donjon (6), la nuit et la fin (7), le vérificateur (8).

   Solution : Mélusine a écrit la fausse lettre · Odette est sous le clocher, derrière la porte aux quatre signes.

   LE SCÉNARIO A CHANGÉ LE 12 NOVEMBRE AU SOIR (Romain, 18 h 06 à 21 h 44 ; Bible § 13.31 ; E3-dialogues-et-trame.md, version 3, qui fait foi
   pour tous les textes du Barde). Ce qui s'est passé (jamais dit tel quel) : le maire (qui ne ment jamais) a chargé Léo, l'apprenti du
   meunier — c'est lui, l'homme en cape — de faire écrire une lettre « d'Odette ». Léo a forcé Mélusine, qui a volé un flacon d'encre chez
   Iris, écrit la lettre en imitant Odette, et l'a glissée elle-même sous la porte de la mairie, à l'aube, dans un châle comme celui d'Odette.
   Odette est enfermée sous le clocher ; Léo lui porte à manger tous les soirs, par la grille de la crypte (il a une clé). Moustache, son chat
   à six doigts, la retrouve toujours. Plus de lavande, plus de « minuit », plus de Léo froussard : son nom n'est dit nulle part avant la nuit.
   LE BARDE (12 novembre au soir) : les mêmes trois questions pour tous les villageois, et une question sur leur métier ; plus de limite à
   deux questions par visite (la moitié du village est occupée à chaque moment) ; un grand dialogue ne s'ouvre qu'une fois tout demandé
   (q.besoin : {toutDit:[…]}, barde.js). Pas refait ce soir-là : les trois autres rôles (les empreintes chez Iris, l'encre, la pointure, la
   grille à soulever) et le donjon (Léo en chef des monstres) — leurs textes suivent encore l'ancien fil, sans le contredire.
   (Faits depuis : la grille et le donjon, les 13 et 14 novembre ; LES EMPREINTES DU JARDIN D'IRIS, le 16 novembre — lieux.herboristerie,
   infos.pieds_enfant, Bible § 13.52 ; la taille des pieds était déjà dans le registre du Sage, en carreaux, depuis l'enquête 1.
   Reste : l'encre de la lettre comparée à celle d'Iris, chez l'Alchimiste.)
   ========================================================== */
(function(){
'use strict';
var E = window.ENQUETES = window.ENQUETES || {};
var D3 = window.DONNEES;

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
  /* le film du début (Romain, 18 novembre : « une cinématique à chaque début d'enquête, comme un générique d'épisode » ; jeu/cine/src/film-debut3.js ;
     Bible §13.69) : il part tout seul la première fois qu'on ouvre l'enquête, avant la lettre (M.jouerFilmDebut, moteur-actions.js) */
  filmDebut:'debut3',
  /* OUVERTE AUX JOUEURS depuis le 14 novembre (Romain, 13 h 57 : « l'adresse sans le test, on puisse aussi aller jusqu'à l'enquête numéro 3 ») :
     plus de « enEcriture:true » ici (c'est lui qui faisait dire au village « en cours d'écriture » sans #test : M.enEcriture, moteur-base.js).
     Ses codes sont gelés depuis ce jour-là : src/codes-fixes-e3.js. */
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
    /* (17 novembre, étape 3 du nouveau fil) plus de plantes ni de potions dès le matin : elles arrivent l'après-midi, quand Iris a dit
       pourquoi (« préparez-vous, et beaucoup »), que le Sage a l'herbier et qu'Anselme est réveillé. Le matin : le gâteau, et le labo. */
    alchimiste:'Fais le haut du gâteau de la fête, chez Gaspard. Puis file à ton labo : tes amis vont t\'apporter de quoi chercher.',
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
      /* (13 novembre : « les missions de la nuit sont trop grillées ») elles n'arrivent que quand le Barde sait de quoi elles parlent
         (e.si, mission.js) : la clé avec le code du Pisteur « La crypte est fermée », la fête une fois Anselme vu */
      /* (17 novembre, étape 3 du nouveau fil) « 💡 LE PLAN » : il s'écrit tout seul dans le Carnet du Barde quand il a entendu les quatre
         phrases qui le font — le refus d'Anselme (sa clé à la ceinture), Basile (il ne prête rien, sauf à qui l'aide à sonner), et Silas
         deux fois (la grille grince, lui la soulève ; il sonne les yeux fermés). Avec son code pour le Pisteur (e.code, mission.js) :
         chez lui, sa mission de la nuit s'affiche. Même place dans la liste que l'ancienne mission de la clé (les cases cochées tiennent). */
      /* (le filet) la nuit, avec le code du Pisteur, il s'écrit de toute façon : Basile et Silas sont à la fête, on ne peut plus leur parler */
      {si:[{et:[{vu:'barde:anselme:4'}, {vu:'barde:basile:3'}, {vu:'barde:silas:2'}, {vu:'barde:silas:3'}]}, {et:[{moment:'nuit'}, {code:'info:crypte_fermee'}]}], ic:'💡', code:'info:plan_nuit',
        t:'Le plan ! Cette nuit, aide Anselme à sonner la Grosse Marie. Pendant qu\'il compte les coups, les yeux fermés, le Pisteur lui prend sa clé. Dis-le à tes amis !', fait:[{vu:'grand:cle:fini'}]},
      /* (13 novembre, Bible §13.33 : « Retenir le maire » est retiré — le Barde, maintenant, apporte des indices pour le donjon) elle
         n'arrive qu'avec le code du Pisteur, « L'homme en cape est là ! » ; à la fête, Farinel et Iris portent alors un « ❗ » */
      {des:2, si:[{code:'info:leo_la'}], ic:'🎉', t:'Tes amis se battent, tout au fond ! À la fête, quelqu\'un saura peut-être les aider.', fait:[{et:[{vu:'fete:aide:farinel'}, {vu:'fete:aide:iris'}, {vu:'fete:aide:silas'}]}]},
      /* (14 novembre, 11 h 44, Bible §13.38) plus de mission pour le maire inquiet : il vient tout seul, sur un minuteur CACHÉ — une
         mission l'annoncerait un quart d'heure à l'avance */
      {piste:true, t:'Regarde bien les visages : plusieurs villageois vont te mentir.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : qu\'est-il arrivé à Odette ?'}
    ],
    /* (étape 5) une mission de fête ratée compte comme faite (fini : un seul essai) ; rendre sa mission au maire, l'après-midi,
       se coche aussi quand les deux sont ratées (il n'y a alors rien à rendre) */
    pisteur:[
      {ic:'🎏', t:'Accroche les banderoles de la fête, sur la place.', fait:[{fini:'pisteur:place:banderoles'}]},
      {ic:'🦢', t:'Rattrape l\'oie de Gaspard, à la boulangerie.', fait:[{fini:'pisteur:boulangerie:oie'}]},
      {ic:'🏛️', t:'L\'après-midi, va rendre ta mission au maire.', fait:[{vu:'pisteur:mairie:mission'}, {et:[{rate:'pisteur:place:banderoles'}, {rate:'pisteur:boulangerie:oie'}]}]},
      /* (Romain, 13 novembre : « quand on passe la nuit, il y a des missions qui se mettent à jour et, pour le Pisteur, c'est trop
         grillé. Il faut les enlever. ») plus de missions de la nuit : ni le sac, ni le donjon — on les découvre en jouant */
      /* (17 novembre, étape 3 du nouveau fil) sauf une, que le Pisteur ne voit qu'avec le code du Barde, « Le plan de la nuit » : c'est
         l'équipe qui a trouvé le plan, la mission ne fait que le lui rappeler */
      {si:[{code:'info:plan_nuit'}], ic:'🗝️', t:'Le plan de la nuit : quand la Grosse Marie sonnera, monte au clocher sans te faire voir, et prends la clé à la ceinture d\'Anselme.', fait:[{fini:'pisteur:clocher:cle'}, {vu:'pisteur:puits:acide'}]   /* (ou par le puits, si le Barde a raté Anselme) */},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : qu\'est-il arrivé à Odette ?'}
    ],
    /* (étape 4) le gâteau (une création libre : on ne le rate jamais), les sept plantes, la lettre au labo, les sept potions de la nuit */
    alchimiste:[
      {ic:'🎂', t:'Fais le haut du gâteau de la fête, à la boulangerie de Gaspard.', fait:[{vu:'alchimiste:boulangerie:gateau'}]},
      /* (12 novembre, Bible §13.26 et §13.28) les sept plantes sont cachées sur la carte (D.PLANTES, cueillette.js) : l'herbier du Sage ne donne
         que des indices ; quatre poussent au-delà de la brume, qu'Anselme repousse un peu avec Bertille, sa petite cloche (lieux.clocher, E.brume).
         En échange, il veut de la mélisse pour sa tisane : la troisième mission n'arrive qu'après Bertille (e.si, mission.js). */
      /* (17 novembre) les trois missions des plantes et des potions n'arrivent que l'après-midi (des:1) : le matin, Anselme dort, le Sage
         n'a pas encore l'herbier, et personne n'a dit pourquoi il faudrait des potions */
      {des:1, ic:'🌿', t:'Cueille les sept plantes de la vallée. Elles se cachent bien : l\'herbier du Sage te mettra sur la piste.',
        fait:[{et:[{vu:'plante:oseille'}, {vu:'plante:souci'}, {vu:'plante:melisse'}, {vu:'plante:lin'}, {vu:'plante:lycopode'}, {vu:'plante:vesse'}, {vu:'plante:gui'}]}]},
      {des:1, ic:'🔔', t:'Des plantes poussent au-delà de la brume. Anselme, au clocher, pourra peut-être t\'aider.', fait:[{vu:'alchimiste:clocher:bertille'}]},
      {si:[{vu:'alchimiste:clocher:bertille'}], ic:'🍵', t:'Rapporte de la mélisse à Anselme, pour sa tisane. Une promesse est une promesse !', fait:[{vu:'alchimiste:clocher:tisane'}]},
      /* (Romain, 13 novembre : « on en dit trop ») plus de mission « Analyse la lettre » (le signe « À analyser ! » de la paillasse suffit),
         « Prépare les sept potions sur ton établi » sans « de la nuit », et plus de mission de la nuit */
      {des:1, ic:'🧪', t:'Prépare les sept potions, sur ton établi.',
        fait:[{et:[{vu:'fiole:feu'}, {vu:'fiole:fumigene'}, {vu:'fiole:huile'}, {vu:'fiole:colle'}, {vu:'fiole:acide'}, {vu:'fiole:baume'}, {vu:'fiole:coeur'}]}]},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : qu\'est-il arrivé à Odette ?'}
    ],
    sage:[
      {ic:'👥', t:'Lis « Les habitants » à toute l\'équipe.', fait:[{lu:'habitants'}]},
      {ic:'🖼️', t:'Peins le tableau d\'Odette et de ses chats, à la mairie.', fait:[{fini:'sage:mairie:tableau'}]},
      {si:[{code:'obj:herbier'}, {moment:'nuit'}], ic:'🌿', t:'Lis l\'herbier à l\'Alchimiste, dans ton Grand Livre : un indice pour chaque plante, et le moment de la cueillir.', fait:[{lu:'herbier'}]},
      /* (16 novembre) le secret d'Odette : elle n'arrive qu'avec le papier (e.si, mission.js) ; rien n'y dit quoi faire de la pierre */
      {si:[{code:'obj:papier_odette'}], ic:'📜', t:'Odette a laissé un papier couvert de signes. Fais-le parler, dans ton Grand Livre.', fait:[{vu:'pierre:maison'}]},
      {piste:true, t:'Quand toute l\'équipe a tout fait, donne le code du moment suivant (page ⏭️ Les codes des moments).'},
      {libre:true, ic:'🔍', t:'Écoute l\'équipe : tes accusations arriveront au fur et à mesure. À la fin, accuse !'}
    ]
  },
  /* (Romain, 13 novembre : « dans Mon tableau d'enquête, il faut une dizaine de lieux — au clocher, au puits, pas “au fond du puits”,
     au moulin, au Vieux Chêne, et six autres — et tous les personnages ») le tableau et l'accusation offrent les mêmes choix :
     rien ne désigne plus la réponse d'avance. court : le nom dans l'en-tête de colonne du tableau (tableau.js). */
  /* LES ACCUSATIONS ARRIVENT AU FUR ET À MESURE (Romain, 17 novembre, 7 h 50 : « au début, il n'y a rien. On ne peut pas faire d'accusation
     au début. […] elles arrivent au fur et à mesure que des codes arrivent. […] Et tu le dis au Sage : "les accusations sont à jour". »)
     des : ce que le Sage doit avoir reçu pour que la question existe (une condition suffit). Une question par moment, si tout va bien :
       · le matin, avec le papier d'Odette (le Barde) : OÙ est Odette ?
       · l'après-midi, avec la lettre (le Pisteur) : QUI a écrit la fausse lettre ?
       · la nuit, avec « Léo a parlé » (le Pisteur, après le donjon) : QUI se cachait sous la cape noire ?
     Filets : le vieux plan et « On descend » ouvrent aussi OÙ ; « Léo a parlé » ouvre tout (c'est lui qui permet d'accuser). */
  qui:{titre:'QUI a écrit la fausse lettre ?', des:[{code:'obj:lettre'}, {code:'info:leo_battu'}], choix:['melusine', 'margot', 'iris', 'victor', 'fortune', 'gaspard', 'tim', 'basile', 'silas', 'levoisin', 'farinel', 'leo', 'anselme', 'grosbec']},
  ou:{titre:'OÙ est Odette ?', des:[{code:'obj:papier_odette'}, {code:'obj:vieux_plan'}, {code:'info:on_descend'}, {code:'info:leo_battu'}], choix:[
    {id:'clocher', nom:'Au clocher', court:'Clocher', ic:'🔔'}, {id:'puits', nom:'Au puits', court:'Puits', ic:'💧'},
    {id:'moulin', nom:'Au moulin', court:'Moulin', ic:'🌾'}, {id:'chene', nom:'Au Vieux Chêne', court:'Vieux Chêne', ic:'🌳'},
    {id:'soeur', nom:'Chez sa sœur', court:'Chez sa sœur', ic:'🏡'}, {id:'mairie', nom:'À la mairie', court:'Mairie', ic:'🏛️'},
    {id:'taverne', nom:'À la taverne', court:'Taverne', ic:'🍺'}, {id:'lavoir', nom:'Au lavoir', court:'Lavoir', ic:'🧺'},
    {id:'foret', nom:'Dans la forêt', court:'Forêt', ic:'🌲'}, {id:'herboristerie', nom:'À l\'herboristerie', court:'Herbo\u00adristerie', ic:'🌿'}]},
  /* (13 novembre, 18 h 06, Bible §13.33) LA TROISIÈME QUESTION : « QUI se cachait sous la cape noire ? » — Léo. Elle n'est pas dans le
     tableau du Sage (horsTableau) : on ne le découvre qu'au fond du donjon, quand il arrache sa cape. L'ordre des trois questions
     (ordreAccusation) : OÙ, QUI a écrit, QUI sous la cape. Et le Sage n'accuse qu'une fois Léo battu (accuser.besoin : le code du
     Pisteur, « Léo a parlé ») : Romain, « Bravo ! Vous avez résolu l'enquête n° 3. Place aux accusations ! » */
  quoi:{titre:'QUI se cachait sous la cape noire ?', icQ:'🧥', horsTableau:true, des:[{code:'info:leo_battu'}], choix:[
    {id:'farinel', nom:'Farinel', pnj:true}, {id:'silas', nom:'Silas', pnj:true}, {id:'leo', nom:'Léo', pnj:true}, {id:'grosbec', nom:'Grosbec', pnj:true},
    {id:'fortune', nom:'Fortuné', pnj:true}, {id:'victor', nom:'Victor', pnj:true}, {id:'basile', nom:'Basile', pnj:true}, {id:'gaspard', nom:'Gaspard', pnj:true},
    {id:'anselme', nom:'Anselme', pnj:true}, {id:'levoisin', nom:'Le voisin', pnj:true}]},
  ordreAccusation:['ou', 'qui', 'quoi'],
  /* (Romain, 16 novembre, 19 h 48 : « il ne faut pas donner tous ces indices […] il ne faut pas dévoiler le suspense ». Avant : « Il manque
     quelqu'un : l'homme en cape. Tes amis doivent d'abord le trouver, tout au fond des souterrains. ») */
  accuser:{besoin:[{code:'info:leo_battu'}], avant:'Pas encore… Il reste un mystère à éclaircir.'},
  solution:{qui:'melusine', ou:'clocher', quoi:'leo'},

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
  /* (17 novembre, Romain) un villageois fâché reparle dès qu'une question s'ouvre chez lui (le code « L'écriture de Mélusine » : barde.js, estVexe) */
  vexeRouvre:true,
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
    /* (Romain, 13 novembre) trois secondes après « En route pour le marché », le maire revient dire un mot (rappel) ; il vouvoie le Barde,
       comme dans ses grandes conversations */
    maire:{t:'Barde ! Voici 10 pièces. Rapportez-moi au moins 10 bouquets pour la fête de ce soir !', bouton:'💐 En route pour le marché !',
      rappel:'Essayez de bien négocier. Je sais que vous êtes doué pour ça. Je compte sur vous !'},
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
    /* (Romain, 13 novembre) le maire a trois visages (humeur : persos.js, HUMEUR_X) : pas content (moins de 10 bouquets), content
       (les 10 bouquets), ravi (11 bouquets ET la lanterne : parfait). Devant la lanterne, un aparté (recit) : il réagit d'une façon
       très étrange — il ne dit pas pourquoi. */
    retour:{accueil:'Ah, Barde ! Alors, mes fleurs ?',
      paliers:[
        {min:10, or:10, humeur:'satisfait', t:'Dix bouquets, comme convenu ! Voici 10 pièces d\'or pour votre peine.'},
        {min:9, or:5, humeur:'fache', t:'Il en manque un ! Bien mauvais négociateur… La fête sera belle quand même.'},
        {min:5, or:0, humeur:'fache', t:'Il manque des fleurs… La fête sera jolie quand même. Enfin, j\'espère.'},
        {min:0, or:0, humeur:'fache', t:'Si peu ?! C\'est une fête ou un enterrement ?'}],
      parfait:{min:11, humeur:'ravi', t:'Magnifique ! Je savais que je pouvais compter sur vous. Vous êtes vraiment un négociateur hors pair. Très malin !'},
      lanterne:{or:5, humeur:'saisi', recit:'Le maire réagit d\'une façon très étrange : il ne quitte plus la lanterne des yeux…', t:'Une lanterne comme celle-là… Parfait. Je vais la garder.'}}
  },

  /* ---------- Les grands dialogues du Barde (grands.js ; Bible § 13.8 et § 13.31 ; E3-dialogues-et-trame.md, version 3) ----------
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
      /* (Romain, 13 novembre) raté, ou le piège de la copie : un code pour le Pisteur — c'est lui qui ira chercher la lettre, en cachette
         (lieux.mairie, le point « lettre » : il n'apparaît qu'avec ce code ; niveau 5, autant d'essais qu'il veut : on est sûr d'avoir
         la lettre). Plus de code « La copie de la lettre », ni de lettre accrochée sous le tableau du Sage. */
      piege:{bouton:'📝 Ranger ma copie', titre:'Ta copie de la lettre', t:'Tu recopies la lettre, mot pour mot… de ta propre écriture ! Impossible de comparer les écritures avec ça. Le maire range l\'original sur son bureau. Il reste une autre façon de l\'avoir : sans bruit, et sans se faire voir.', code:'info:lettre_bureau'},
      echec:{bouton:'🤔 Et maintenant ?', titre:'Le maire garde la lettre', t:'Les beaux discours n\'ont pas suffi : la lettre reste sur le bureau du maire. Il reste une autre façon de l\'avoir : sans bruit, et sans se faire voir.', code:'info:lettre_bureau'},
      resume:{ok:'Le maire t\'a prêté la lettre d\'Odette.', piege:'Tu as recopié la lettre, devant le maire… de ta propre écriture.', rate:'Le maire n\'a pas voulu te prêter la lettre.'}},
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
      /* (17 novembre, le nouveau fil, la nuit) raté : le Barde demande à Tim, perché sur les toits, s'il connaît un autre passage. Tim montre
         le sentier du vieux puits : son code le trace sur le tableau des chemins secrets du Pisteur (E.chemins, plus bas). */
      echec:{bouton:'🙋 « Tim ! Tu connais un autre passage ? »', qui:'tim', titre:'Tim, depuis les toits', t:'« Un autre passage ? Regarde, là-bas ! Moustache vient de filer par un petit sentier, jusqu\'au vieux puits… Il s\'est glissé entre les barreaux ! »', code:'info:vieux_puits'},
      resume:{ok:'Tu as aidé Anselme à sonner la Grosse Marie. Sa clé pendait à sa ceinture…', rate:'Anselme est monté sonner tout seul, sa clé à la ceinture.'}},
    /* LE MAIRE INQUIET, À LA FÊTE (Romain, 14 novembre, 10 h 29, Bible §13.36 : « j'aimerais bien qu'on remette à la fin le maire inquiet,
       qui demande au Barde où sont ses amis »).
       IL VIENT TOUT SEUL, SUR DES MINUTEURS CACHÉS (Romain, 14 novembre, 11 h 44, Bible §13.38 ; grands.js : veiller, venir) :
       · attente : dès que le Barde a tapé le code du Pisteur (si : la grille sans bruit, la grille qui a hurlé, ou le puits), un minuteur
         caché de 15 minutes (debut : 900 secondes). Au bout, la fenêtre du maire s'ouvre toute seule, par-dessus tout, avec le toc-toc.
         Plus besoin d'avoir écouté tout le monde à la fête, plus de « 🎭 » à toucher.
       · Le Barde le retient (une bonne réponse) : 5 minutes plus tard (suite : 300), il revient pour le dialogue suivant. Trois dialogues.
       · sansReponse : si la grille a fait du bruit, au bout des 15 minutes il ne pose pas de question — « le Barde n'a pas de réponse,
         il ne peut rien faire : le maire le prévient qu'il va aller voir ». Une fenêtre, « D'accord », et c'est fini.
       · Ses questions restent innocentes : « Où sont vos amis ? ». Il ne dit JAMAIS « clocher » de lui-même (« il ne faut pas qu'il se
         trahisse : il ne sait pas si on sait qu'ils sont au clocher ») ; c'est le récit qui montre où il regarde.
       · À chaque mauvaise réponse, et seulement là, il le lâche en partant : « J'ai une affaire à régler au clocher. »
       · Les bonnes réponses sont les trois indices de la fête : Margot (son discours), Silas (il ouvre le bal), Gaspard (le gâteau).
       · Ni code ni récompense au bout : « c'est juste pour occuper le Barde. Ça ne change rien » — le maire descendra dans tous les cas.
       (Dans l'histoire, son discours dure vingt minutes ; dans le jeu, il revient au bout de cinq.) */
    amis:{pnj:'grosbec', ic:'🎩', fete:true,
      attente:{si:[{code:'info:grille_silence'}, {code:'info:grille_bruit'}, {code:'info:puits_ouvert'}], debut:900, suite:300},
      sansReponse:{si:[{code:'info:grille_bruit'}],
        t:'« Où sont vos trois amis ? C\'est bizarre… J\'ai entendu la grille. Je vais aller voir. » Il quitte la fête, à grands pas.',
        resume:'Le maire a entendu la grille. Il a quitté la fête : « Je vais aller voir. »'},
      rate:'« Bien, bien… J\'ai une affaire à régler au clocher. » Il quitte la fête, à grands pas.',
      etapes:[
        {t:'Barde… Où sont vos trois amis ? Je ne les vois nulle part.',
          choix:[
          {q:'Ils sont partis se coucher : ils étaient très fatigués.'},
          {q:'Ils arrivent ! Mais tout le monde réclame votre discours.', r:'« Mon discours ? Si on le réclame… » Il monte sur l\'estrade, un œil sur le clocher.', bon:true},
          {q:'Ils cherchent encore Odette, je crois, Monsieur le maire.'},
          {q:'Ils arrivent ! Goûtez donc le buffet en les attendant.'}]},
        {t:'Vingt minutes, et toujours personne. Où sont-ils ?', choix:[
          {q:'Attendez encore un peu, Monsieur le maire, je vous en prie.'},
          {q:'Ils sont au clocher : ils aident Anselme à sonner.'},
          {q:'Vous avez l\'air bien nerveux, ce soir, Monsieur le maire.'},
          {q:'Personne ne danse avant vous : ouvrez le bal !', r:'« C\'est vrai… Une seule danse. » Il ouvre le bal, les yeux tournés vers le clocher.', bon:true}]},
        {t:'J\'ai dansé. Alors, où sont-ils ?', choix:[
          {q:'Gaspard n\'arrive pas à porter le gâteau tout seul !', r:'« Mon gâteau ! » Il court aider Gaspard, sans un regard pour le clocher.', bon:true},
          {q:'Reprenez donc un verre de cidre, Monsieur le maire.'},
          {q:'Regardez les lampions de Basile, comme ils sont beaux !'},
          {q:'Ils ne font rien de mal, Monsieur le maire, c\'est juré !'}]}
      ],
      resume:{ok:'Le maire cherchait tes trois amis, à la fête. Tu l\'as retenu un bon moment.', rate:'Le maire cherchait tes trois amis, à la fête. Il est parti : « J\'ai une affaire à régler au clocher. »'}}
  },
  /* (13 novembre, 18 h 08, Bible §13.33) « Retenir le maire » est retiré : ses trois petits dialogues, sa mission et son code. La grande
     scène de Léo aussi : Léo parle dans le donjon, une fois battu (jeu/donjon/moteur/src/leo.js).
     (14 novembre, Bible §13.36 et §13.38) Le maire revient à la fête, autrement : un grand dialogue à minuteurs cachés, sans code ni
     effet sur le donjon (grands.amis). */
  /* ---------- La fête (grands.js ; E3-dialogues-et-trame.md, version 3) : la nuit, sur la place ; chacun dit une réplique (gratuit).
     Mélusine, si son aveu n'a pas été
     obtenu l'après-midi, craque (le filet). */
  fete:{lieu:'place', moments:N_,
    gens:{
      gaspard:{t:'Sept chats en pâte d\'amande sur le gâteau ! Il me faudra des bras pour le porter.', note:'Gaspard, à la fête : il lui faudra des bras pour porter son gâteau.'},
      margot:{t:'Le discours du maire ? Vingt minutes ! Il adore qu\'on le lui réclame.', note:'Margot, à la fête : le maire adore qu\'on lui réclame son discours.'},
      silas:{t:'Chaque année, c\'est le maire qui ouvre le bal. Personne ne danse avant lui !', note:'Silas, à la fête : c\'est le maire qui ouvre le bal. Personne ne danse avant lui.',
        aide:{si:'info:leo_la', t:'Tiens, le Barde. Tu cherches un bon conseil ?', questions:[
          {q:'C\'est vous qui avez entraîné Léo ?', r:'Évidemment ! Il fonce comme un taureau, saute comme un chat et frappe en rafale. Et son cri… à faire trembler les murs !'},
          {q:'Il a des points faibles ?', apres:0, r:'Des points faibles ? Mon élève ? Aucun ! Bon… Peut-être un ou deux.'},
          {q:'Quand il fonce ?', apres:1, r:'Il ne regarde jamais ses pieds. Une flaque bien glissante, et il s\'étale. Une fois à terre, frappe-le avec une lame : là, il souffre vraiment.'},
          {q:'Quand il saute, boit ou crie ?', apres:1, r:'Il lui faut un instant pour s\'y préparer. Un bon coup sur la tête à ce moment-là, et tout s\'arrête.'},
          {q:'Et s\'il attrape quelqu\'un ?', apres:1, r:'Il prend toujours le plus faible. Ne laisse jamais un ami à moitié de ses forces.'}],
          note:'Silas, à la fête : c\'est lui qui a entraîné Léo. Quand il fonce, il ne regarde pas ses pieds (une flaque, et il s\'étale ; à terre, une lame lui fait très mal) ; avant de sauter, boire ou crier, un coup sur la tête arrête tout ; il attrape le plus faible.'}},
      victor:{t:'Je danse ! Enfin, j\'essaie.'},
      tim:{t:'Chut ! Je suis monté en haut du mât des lampions.'},
      melusine:{t:'Je n\'écrirai plus jamais pour personne…',
        /* le filet : son aveu n'a pas été obtenu l'après-midi */
        /* (Romain, 13 novembre : pas « je n'en peux plus » — « c'est trop dur de garder le secret, j'ai besoin de me confier ») */
        filet:{sauf:'info:aveu', t:'C\'est trop dur de garder ce secret… J\'ai besoin de me confier. C\'est moi qui ai écrit la lettre ! Un homme en cape m\'y a forcée. Je n\'ai pas vu son visage.', code:'info:aveu',
          note:'Mélusine a craqué, à la fête : c\'est elle qui a écrit la lettre, forcée par un homme en cape. Elle n\'a pas vu son visage (code pour le Sage).'},
        /* (17 novembre, étape 4 du nouveau fil) LES TENUES : une fois qu'elle a avoué (l'après-midi, ou ici par le filet), elle porte un
           « ❗ » à la fête et donne au Barde trois tenues, cousues par remords : un code objet pour le Pisteur, le Sage et l'Alchimiste
           (x.don, grands.js). C'est d'elle que viennent les tenues de combat (« pourquoi des tenues ? », Romain, 16 novembre). */
        don:{obj:'tenues', si:[{vu:'verite:melusine:4'}, {vu:'fete:filet:melusine'}], titre:'Les tenues de Mélusine',
          t:'Pour m\'excuser, je vous ai préparé des tenues de combat : les voilà, quatre tenues bien solides, une pour chacun de vous, et une pour toi, Barde. J\'y ai cousu toute ma honte… Là où vous allez, il en faudra. Soyez prudents !',
          note:'Mélusine, à la fête : quatre tenues de combat solides, pour s\'excuser. La tienne est prête ; pour le Pisteur, le Sage et l\'Alchimiste, donne-leur le code. Maintenant, tu peux parler à Anselme.'}},
      /* L'AIDE POUR LE DONJON (13 novembre, Bible §13.33) : dès que le Barde a tapé « L'homme en cape est là ! », Farinel et Iris portent
         un « ❗ » et ont de nouvelles questions (grands.js). Le Barde lit les réponses à voix haute pendant que le Pisteur se bat.
         La règle de Romain : deux phrases courtes au plus ; ils disent ce que fait l'outil, jamais la parade toute crue. */
      /* (Romain, 16 novembre, 5 h 42 → 6 h 09, Bible §13.51) trois villageois : Farinel (ses outils : le fléau, la faux, la farine, le
         crochet et l'huile), Iris (ses potions : la potion de force, son feu, la gourde), Silas (le maître d'armes qui a entraîné Léo :
         il se vante, puis donne ses points faibles — une question « apres » n'apparaît qu'une fois la question n° apres posée).
         Personne ne dit : le crochet contre le cuir des rats, la rafale, le noir. */
      iris:{t:'J\'ai tressé une couronne pour Odette. Je la poserai sur sa porte… quand elle reviendra.',
        aide:{si:'info:leo_la', t:'Tu as l\'air soucieux… Il se passe quelque chose ?', questions:[
          {q:'On t\'a volé autre chose que ton encre ?', r:'Oui… Ma potion de force, et ma gourde de soin.'},
          {q:'Que fait la potion de force ?', r:'Celui qui la boit ne sent plus aucun coup. Sauf s\'il saigne : là, elle ne peut plus rien.'},
          {q:'Elle a d\'autres effets ?', r:'Elle brûle de l\'intérieur. Trop forte, elle fait cracher du feu, et une brûlure pareille ne s\'éteint qu\'avec un soin.'},
          {q:'Et la gourde ?', r:'Une gorgée, et on est comme neuf. Elle ne se vide jamais : à qui la tient, elle sert sans fin.'}],
          note:'Iris, à la fête : on lui a volé sa potion de force (on ne sent plus les coups, sauf si on saigne ; elle fait cracher du feu, et sa brûlure ne s\'éteint qu\'avec un soin) et sa gourde de soin, qui ne se vide jamais.'}},
      farinel:{t:'Je ne dors pas, je repose mes yeux !',
        aide:{si:'info:leo_la', t:'Hein ? Quoi ? Je ne dormais pas ! … Qu\'est-ce que tu veux savoir, l\'ami ?', questions:[
          {q:'C\'est toi qui as appris à Léo à se battre ?', r:'À se battre ? Moi ? Je suis meunier, mon garçon. Je fais de la farine, pas la guerre !'},
          {q:'Et ce fléau ?', r:'Il bat le blé et chasse les rats du grenier. Un bon coup, et toute la bande détale.'},
          {q:'Et la faux ?', r:'Elle coupe le blé… et les doigts. Une entaille de faux saigne sans s\'arrêter : on la soigne tout de suite.'},
          {q:'Et la farine ?', r:'Dans un nuage de farine, on ne voit plus rien. Qu\'une flamme le touche, et BOUM : celui qui est dedans n\'en ressort pas !'},
          {q:'Et ce crochet ?', r:'Une fois accroché, impossible de s\'en défaire… Sauf avec un filet d\'huile : là, on glisse dehors comme une anguille !'}],
          note:'Farinel, à la fête : son fléau fait détaler les rats, sa faux fait saigner (on soigne tout de suite), une flamme dans la farine fait BOUM sur celui qui est dedans, et l\'huile fait glisser hors du crochet.'}},
      basile:{t:'Les lampions tiennent ! Je n\'en reviens pas moi-même.'},
      fortune:{t:'Dernières lanternes ! Deux pour le prix de trois !'},
      /* (14 novembre, 11 h 44, Bible §13.38) on ne va plus chercher le maire à la fête pour sa grande conversation : il vient tout seul,
         sur un minuteur caché (grands.amis.attente) */
      grosbec:{t:'Quelle fête ! Tout le village est là… enfin, presque.'}
    }},

  /* Les photos du tableau de liège du Barde (liege.js) ; les mots-clés (« Autre ») viendront avec la suite.
     (12 novembre au soir : plus de photo de Léo — on ne sait rien de lui avant la nuit.) */
  liege:{pnj:['melusine', 'margot', 'iris', 'victor', 'fortune', 'tim', 'gaspard', 'farinel', 'anselme', 'silas', 'basile', 'levoisin'],
    lieux:['clocher', 'puits', 'moulin', 'chene', 'mairie', 'place'],
    /* le dossier « Autre » (Romain, 13 novembre : « la plume d'oie », « le papier », « l'encre ») : chaque mot arrive quand le Barde
       l'a entendu (comme à l'enquête 2), pour ne rien dévoiler — la plume chez Gaspard, le papier quand Fortuné avoue, l'encre chez Iris */
    mots:[
      {id:'plume_oie', ic:'🪶', nom:'Plume d\'oie', si:[{vu:'barde:gaspard:2'}]},
      {id:'papier', ic:'📄', nom:'Papier', si:[{vu:'verite:fortune:2'}]},
      {id:'encre', ic:'🖋️', nom:'Encre', si:[{vu:'barde:iris:2'}]}
    ]},
  sensibles:[],
  /* (Romain, 13 novembre : « j'aimerais bien que l'Alchimiste puisse encore préparer les potions de vérité à l'enquête 3, et qu'il puisse
     encore cueillir les plantes qu'il pouvait cueillir à l'enquête 2 ») la recette de la potion de vérité est dans son grimoire (déjà
     dictée à l'enquête 2 ; sinon le Sage la dicte : sa page « Les recettes ») ; les ingrédients sont sur sa carte, aux mêmes endroits
     qu'à l'enquête 2 (lieux, plus bas ; carteIngredients). Une seule potion de vérité par enquête (veriteUnique), comme à l'enquête 2. */
  recettes:['verite'],
  carteIngredients:true,
  /* ---------- Le labo de l'Alchimiste (labo.js ; les fiches : src/labo/30-donnees.js) : la lettre d'Odette ----------
     À la loupe, l'écriture — avec le Livre d'or du Sage posé sur la paillasse (le code « Les écritures du village »), on compare :
     Mélusine et Margot ont les trois signes de la lettre ; au test des couleurs, de l'encre de noix de galle.
     (16 novembre, Romain, 15 h : « oui » aux deux — le pollen de lavande est retiré, la lavande n'est plus une piste ; et l'étape 6 de son
     scénario est construite : Iris donne au Barde un fond de flacon de son encre (pnj.iris, sa dernière question), le Barde le passe à
     l'Alchimiste par un code, et le labo compare — la même bande noire que l'encre de la lettre. La DEUXIÈME des deux analyses
     (la lettre, l'encre d'Iris) raconte la comparaison et donne le code « La même encre », pour le Sage : comme les deux pièces d'or de
     l'enquête 2. Si c'est la lettre, elle donne deux codes dans la même fenêtre : donneAussi (moteur-actions.js, M.texteAnalyse).) */
  /* (16 novembre, §13.55) mousse : le brin de mousse lumineuse que le Pisteur envoie du donjon (son code « plante:lumiere », descente.js) */
  labo:['lettre', 'piece_pain', 'encre_iris', 'mousse', 'sac_farine'],
  analyses:{
    /* (Romain, 16 novembre, 8 h 07) la pièce de Fortuné : la même analyse que la pièce de la boulangerie de l'enquête 2 (sa fiche au labo,
       piece_pain : l'or, la fêlure, la farine) ; elle ne donne pas de code, elle raconte */
    piece_pain:{
      t:'Sous ta loupe : de l\'or vrai, tout neuf. Sous la couronne, une toute petite fêlure en forme d\'éclair… exactement comme les pièces de Bastien, dans l\'affaire de la rivière rouge ! Elle sort du même moule, de la même bourse. Et dans les creux… de la farine.',
      note:'Analyse de la pièce de Fortuné : de l\'or tout neuf, la même petite fêlure en éclair que les pièces de Bastien (enquête 2) : la même bourse. De la farine dans les creux.'},
    /* (17 novembre, le nouveau fil) l'Alchimiste ne compare plus les écritures (c'est le Sage, dans son Grand Livre) : au labo, la lettre
       ne parle que par son encre, et l'encre d'Iris dit que c'est la même. Plus de code : elle le dit à voix haute. */
    lettre:{
      t:'L\'encre de la lettre, sur la bandelette : une seule bande noire, tout en bas. De l\'encre de noix de galle : elle ne se sépare pas en couleurs. Une encre, ça se compare…',
      note:'Analyse de la lettre : de l\'encre de noix de galle (une seule bande noire, tout en bas de la bandelette).',
      variantes:[{si:[{analyse:'encre_iris'}],
        t:'L\'encre de la lettre, sur la bandelette : une seule bande noire, tout en bas… exactement comme l\'encre d\'Iris. C\'est la même ! La lettre a été écrite avec l\'encre volée chez Iris, cette nuit. Dis-le à tes amis !',
        note:'L\'encre de la lettre et celle d\'Iris sont les mêmes : la lettre a été écrite avec l\'encre volée chez Iris. À dire à l\'équipe !'}]},
    /* (16 novembre) le fond de flacon d'Iris : toute seule, son encre ne dit que ce qu'elle est ; après la lettre, elle dit que c'est la même */
    encre_iris:{
      t:'L\'encre d\'Iris, sur la bandelette : une seule bande noire, tout en bas. De l\'encre de noix de galle : elle ne se sépare pas en couleurs. Garde-la bien : une encre, ça se compare.',
      note:'Analyse de l\'encre d\'Iris : de l\'encre de noix de galle (une seule bande noire, tout en bas de la bandelette).',
      variantes:[{si:[{analyse:'lettre'}],
        t:'L\'encre d\'Iris, sur la bandelette : une seule bande noire, tout en bas… exactement comme l\'encre de la lettre. C\'est la même ! La lettre a été écrite avec l\'encre volée chez Iris. Dis-le à tes amis !',
        note:'L\'encre de la lettre et celle d\'Iris sont les mêmes : la lettre a été écrite avec l\'encre volée chez Iris. À dire à l\'équipe !'}]},
    /* (17 novembre, étape 3 : « ces rats vivent sous terre », sans jamais dire « souterrain » ni « donjon ») la pincée du sac éventré :
       pas de code, l'Alchimiste le dit à voix haute */
    sac_farine:{
      t:'Sous ta loupe : un poil de rat… mais énorme, trois fois plus gros que la normale ! Avec lui, une terre noire et mouillée, sans une racine : une terre de cave, qui n\'a jamais vu le soleil. Et ce brin vert qui brille, c\'est de la mousse lumineuse : elle ne pousse que dans le noir. Ces rats-là vivent sous terre ! Dis-le à tes amis !',
      note:'Analyse de la pincée du sac éventré : un poil de rat énorme, une terre de cave qui n\'a jamais vu le soleil, et de la mousse lumineuse, qui ne pousse que dans le noir. Ces rats vivent sous terre. À dire à l\'équipe !'},
    /* (16 novembre, §13.55) la mousse lumineuse du donjon : une vraie plante (Schistostega pennata, « l'or des lutins »). Tout ce qui est
       dit ici est vrai ; elle ne donne pas de code (c'est le chaudron du donjon qui donne la recette du baume). */
    mousse:{
      t:'La mousse lumineuse, de près : de toutes petites frondes plates, comme des plumes, sur un tapis de fils verts. Au microscope, ces fils sont faits de cellules rondes comme des billes de verre : de petites loupes ! Elles rassemblent la moindre lueur… et en renvoient un éclat vert doré. Cette mousse ne fabrique pas de lumière : elle renvoie celle qu\'elle reçoit. On l\'appelle « l\'or des lutins ».',
      note:'Analyse de la mousse lumineuse : elle ne fabrique pas de lumière, elle renvoie celle qu\'elle reçoit (ses cellules sont rondes comme de petites loupes). On l\'appelle « l\'or des lutins ».'}
  },
  laboNotes:{
    /* (12 novembre au soir : plus « l'encre des colporteurs » — Iris dit au Barde qu'on lui a volé son encre, faite de noix de galle) */
    encre_l:'L\'encre de la lettre : une encre noire, faite avec des noix de galle, ces petites boules qui poussent sur les chênes.'},
  /* ---------- L'établi des plantes (plantes.js ; E3-atelier-des-plantes.md) : les sept potions de la nuit, faites de vraies plantes ---------- */
  plantes:true,
  /* ---------- La brume repoussée (12 novembre, Bible §13.26 et §14.7 ; cueillette.js, carte-jeu.js) : Bertille, la petite cloche d'Anselme, lève
     deux bancs de brume de la grande carte — le Nord (le Rond des Sorcières, où pousse la vesse-de-loup) et les collines de l'Ouest (le Vieux
     verger et son gui, les Cinq Pierres et leur pied-de-loup, le Rucher et sa mélisse). Les zones : monde-brume.js, ZONES. Sur la tablette de l'Alchimiste seulement
     (c'est elle qui demande à Anselme) ; la brume revient à l'enquête suivante. ---------- */
  /* (Romain, 13 novembre ; revient) les quatre plantes d'au-delà de la brume cueillies : au moment suivant, la brume se réinstalle */
  brume:{zones:['n', 'o'], si:[{vu:'alchimiste:clocher:bertille'}], revient:true},
  /* (Romain, 16 novembre, 8 h 00) la carte de l'Alchimiste n'a aucun visage (carte-jeu.js, SANS_GENS)… sauf Anselme : c'est à lui qu'elle
     demande de sonner Bertille, et qu'elle porte sa tisane */
  carteGens:{alchimiste:['anselme']},
  /* ---------- Le donjon (descente.js ; jeu/donjon/, en ligne dans brumeval/donjon/) : une page par tablette. Le Barde n'en a pas :
     pendant ce temps, il fait la fête (et il aide ceux du donjon : Farinel et Iris, E.fete). ---------- */
  donjon:{pages:{pisteur:'donjon/index.html', sage:'donjon/sage.html', alchimiste:'donjon/alchimiste.html'}, tenue:'donjon/tenue.html', portraits:'donjon/i/portrait-'},
  /* LES CODES D'ALLURE (Romain, 13 novembre : « les codes d'apparence du Sage et de l'Alchimiste, pour le Pisteur ») : avant de descendre,
     le Sage et l'Alchimiste montrent chacun un code au Pisteur ; il dit à quoi ressemble leur héros (fille ou garçon, la peau, les
     cheveux), pour qu'on le reconnaisse dans le donjon. allure:<n> : descente.js (M.allureCode). Celui de l'Alchimiste n'existe que
     quand ses sept potions sont prêtes (« on a besoin des sept potions pour descendre ») : il remplace le code du sac (plus de sac:<n>).
     2 rôles × 2 × 6 peaux × 9 cheveux = 216 codes, à la fin de la liste. */
  /* (étape 7) et les codes de fin qui portent la variante de la scène finale (E.finVariante : la dizaine ; l'unité : les erreurs) */
  codesPlus:(function(){ var l = [], i; [1, 2].forEach(function(v){ for(i = 0; i < 4; i++) l.push('victoire:' + (10 * v + i)); }); for(i = 0; i < 1296; i++) l.push('allure:' + i); for(i = 0; i < 224; i++) l.push('visage:' + i); return l; })(),   /* (432 : les 216 du Sage et de l'Alchimiste, puis ceux du Pisteur et du Barde, pour le cachot de la fin ; 17 novembre : 864 de plus pour l'âge — 432 à 863 les enfants, 864 à 1295 les âgés ; puis les 224 codes du visage, le deuxième code : la coiffure, les yeux, la barbe — descente.js, M.visageCode) */
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
    /* recu : ce que dit la fenêtre « Tu as reçu… » à ce rôle (moteur-actions.js) */
    lettre:{nom:'La lettre d\'Odette', ic:'✉️', pour:['sage', 'alchimiste'], dire:'La vraie lettre, en main ! Donne ce code au Sage et à l\'Alchimiste.',
      recu:{sage:'Une nouvelle page s\'est glissée dans ton Grand Livre : la lettre, telle qu\'elle est écrite.'}},
    /* (le carnet n'a pas de fiche au labo : il n'est que pour le Sage, qui le compare à la lettre et y trouve le plan) */
    carnet:{nom:'Le carnet d\'Odette', ic:'📓', pour:'sage', dire:'Le carnet d\'Odette : donne ce code au Sage.',
      recu:{sage:'Une nouvelle page s\'est glissée dans ton Grand Livre : le carnet d\'Odette, écrit de sa main.'}},
    /* (16 novembre, le secret d'Odette) le papier que le voisin gardait pour elle (le Barde → le Sage), et le vieux plan de la cachette,
       sous les dalles de sa maison (le Pisteur → le Sage). Ni l'un ni l'autre ne nomme le maire ; le plan ne dit pas « souterrains ». */
    /* (17 novembre) l'herbier : Iris le prête au Barde (avec le code du Pisteur), pour le Sage. La nuit, s'il n'est jamais arrivé, il est
       dans le Grand Livre quand même (le filet : sans ses indices, les sept plantes sont introuvables). */
    herbier:{nom:'Le vieil herbier', ic:'🌿', pour:'sage', dire:'Un herbier plein d\'indices : le Sage les lira à voix haute. Donne-lui ce code.',
      recu:{sage:'Une nouvelle page s\'est glissée dans ton Grand Livre : le vieil herbier d\'Iris.'}},
    papier_odette:{nom:'Le papier d\'Odette', ic:'📜', pour:'sage', dire:'Des signes secrets ? Le Sage saura peut-être les lire : donne-lui ce code.',
      recu:{sage:'Une nouvelle page s\'est glissée dans ton Grand Livre : le papier d\'Odette, couvert de signes.'}},
    vieux_plan:{nom:'Le vieux plan d\'Odette', ic:'🗺️', pour:'sage', dire:'Un très vieux plan, roulé dans un étui de cuir. Le Sage saura le lire : donne-lui ce code.',
      recu:{sage:'Une nouvelle page s\'est glissée dans ton Grand Livre : le vieux plan d\'Odette.'}},
    /* (16 novembre) la pièce que Fortuné prête au Barde : le même objet du labo que la pièce de la boulangerie de l'enquête 2 */
    piece_pain:{nom:'La pièce d\'or de Fortuné', ic:'🪙', pour:'alchimiste', dire:'L\'Alchimiste saura la faire parler : donne-lui ce code.'},
    /* (16 novembre, 15 h) le fond de flacon d'encre qu'Iris donne au Barde : l'Alchimiste le compare à l'encre de la lettre (labo : encre_iris) */
    encre_iris:{nom:'L\'encre d\'Iris', ic:'🖋️', pour:'alchimiste', dire:'L\'Alchimiste saura la faire parler : donne-lui ce code.'},
    /* (17 novembre, étape 4) les trois tenues que Mélusine donne au Barde, à la fête (E.fete.gens.melusine.don) : pas obligatoires pour
       descendre (personne ne reste bloqué), mais c'est d'elle que vient la tenue de combat (descente.js) */
    tenues:{nom:'Les tenues de Mélusine', ic:'🧵', pour:['pisteur', 'sage', 'alchimiste'], dire:'Une tenue pour le Pisteur, une pour le Sage, une pour l\'Alchimiste : donne-leur ce code.',
      recu:{pisteur:'Une tenue solide, cousue par Mélusine : capuche verte et cuir épais. Elle t\'attend pour cette nuit.',
        sage:'Une nouvelle page s\'est glissée dans ton Grand Livre : ta tenue, cousue par Mélusine.',
        alchimiste:'Une tenue solide, cousue par Mélusine : capuche violette, et une ceinture à sept poches… pour sept fioles.'}},
    /* (17 novembre, étape 3) la pincée de farine du sac éventré : l'Alchimiste la ramasse lui-même chez Gaspard (lieux.boulangerie,
       p.recoit) et l'analyse au labo. sansCode:true : personne ne donne son code (tools/verif-e3.js). */
    sac_farine:{nom:'La pincée du sac éventré', ic:'🌾', pour:'alchimiste', sansCode:true, dire:'Une pincée de farine, pour l\'Alchimiste.'},
    /* (16 novembre, §13.55) le brin de mousse lumineuse du donjon : il arrive tout seul sur la paillasse quand l'Alchimiste tape le code
       du donjon « plante:lumiere » (descente.js). donjon:true : personne ne donne son code dans l'enquête (tools/verif-e3.js). */
    mousse:{nom:'La mousse lumineuse', ic:'🌿', pour:'alchimiste', donjon:true, dire:'Un brin de mousse lumineuse, pour l\'Alchimiste.'}
  },
  /* Les codes de l'enquête 3 (E3-actions-des-roles.md §4). Neufs : ils seront gelés à l'ouverture de l'enquête aux joueurs (codes-fixes.js).
     Étape 1 : ceux que le Barde donne ou reçoit le matin et l'après-midi. */
  infos:{
    /* savoir:true — une information à retenir : elle n'ouvre rien (les pages qui en tiraient la conclusion à la place du Sage sont
       retirées, Romain, 13 novembre : « ça donne la solution ») */
    poste:{nom:'La lettre n\'est pas passée par la poste', ic:'✉️', pour:'sage', de:'barde', savoir:true, reserve:true,
      t:'Victor, le facteur, n\'a pas apporté la lettre d\'Odette : elle n\'a ni timbre ni tampon. Et en vingt ans, Odette n\'a jamais envoyé une seule lettre.',
      dire:'Une lettre sans timbre ? Le Sage doit le savoir : donne-lui ce code.'},
    /* (12 novembre au soir : il remplace « Le capuchon vers le clocher » — c'est Mélusine qui a déposé la lettre, déguisée en Odette) */
    chale:{nom:'Odette… sans sa canne', ic:'🧣', pour:'sage', de:'barde', savoir:true, reserve:true,
      t:'À l\'aube, du haut des toits, Tim a cru voir Odette, dans son châle à chats, glisser la lettre sous la porte de la mairie. Mais elle marchait vite… et sans canne !',
      dire:'Odette, sans sa canne ? Le Sage doit le savoir : donne-lui ce code.'},
    /* (la lettre et le carnet sont des objets : E.objets, plus haut ; l'Alchimiste pose la lettre sur sa paillasse) */
    traces_moustache:{nom:'Les traces de Moustache', ic:'🐾', pour:'pisteur', de:'barde', reserve:true,
      t:'Devant chez Odette, du lait renversé… et des petites traces de pattes qui filent dans les rues. Moustache, le gros chat gris, est passé par là. Les autres chats aussi !',
      dire:'Des traces toutes fraîches ! Le Pisteur saura les suivre, depuis chez Odette : donne-lui ce code.'},
    /* (Romain, 13 novembre : « ça accusait deux femmes, et après on devait trouver laquelle était la bonne » ; Bible §13.31, étape 8)
       le Livre d'or laisse DEUX suspectes. Le Barde les interroge toutes les deux : une seule ment (pnj.melusine [4], pnj.margot [4]). */
    /* (17 novembre) c'est le Sage qui compare, dans son Grand Livre : « Deux écritures », « Les écritures du village » et « La même
       encre » ne sont plus donnés par personne (en réserve : leurs symboles ne resserviront pas). Le seul code : celui du Sage au Barde. */
    /* (17 novembre, 21 h 46, Romain : « le Sage découvre deux écritures similaires et les donne au Barde ; ça active deux dialogues, Margot et
       Mélusine ; le Barde juge en regardant qui ment ») le même code (gelé), une autre histoire : deux mains pareilles, pas une coupable */
    cest_melusine:{nom:'Deux écritures pareilles', ic:'🧵', pour:'barde', de:'sage',
      pnj:{melusine:'Le Sage a comparé la lettre au Livre d\'or : son écriture ressemble à celle de la lettre… comme celle de Margot. Laquelle des deux ment ?',
           margot:'Le Sage a comparé la lettre au Livre d\'or : son écriture ressemble à celle de la lettre… comme celle de Mélusine. Laquelle des deux ment ?'},
      t:'Le Sage a comparé la lettre au Livre d\'or de la fête : deux mains écrivent comme ça, Mélusine la couturière et Margot de la taverne. Une seule a écrit la lettre. Laquelle des deux ment ?',
      dire:'Le Barde doit aller leur parler à toutes les deux : donne-lui ce code.'},
    /* (17 novembre, 21 h 46, Romain : « l'après-midi, on ne sait pas encore s'il y a un donjon : pas de tenue de combat ») le code des sept
       potions : l'Alchimiste le donne au Pisteur quand elles sont toutes prêtes. Rien que les potions (descente.js, codeSpecial) : l'allure et
       le visage se donnent plus tard, au départ, en un seul code de six symboles. */
    sac_pret:{nom:'Les sept potions', ic:'🧪', pour:'pisteur', de:'alchimiste', t:'L\'Alchimiste a fini ses sept potions : les voilà dans ton sac.',
      dire:'Les sept potions sont prêtes. Donne ce code au Pisteur : il le tape dans son onglet Code.'},
    ecriture:{nom:'Deux écritures', ic:'🖋️', pour:['barde', 'sage'], de:'alchimiste', savoir:true, reserve:true,
      t:'L\'Alchimiste a comparé la lettre au Livre d\'or de la fête : des « M » qui piquent, des « t » en vague, un petit rond sur les « i »… Deux femmes écrivent comme ça : Mélusine et Margot. Laquelle des deux ?',
      dire:'Le Barde et le Sage doivent le savoir : donne-leur ce code.'},
    /* (17 novembre) le même code qu'avant (« La crypte est fermée » : mêmes dessins), sous un nouveau nom. Chez le Barde, il rouvre
       Anselme (sa clé) et Iris (l'herbier, qu'elle prête pour préparer la descente). */
    crypte_fermee:{nom:'Odette est sous l\'église', ic:'🗝️', pour:'barde', de:'pisteur', pnj:'anselme',
      t:'Le Pisteur a suivi Moustache jusqu\'à la grille de la crypte, sous l\'église : le chat appelle Odette, elle est là-dessous ! Mais la grille est fermée à clé… et derrière, des bêtes aux yeux rouges.',
      dire:'Iris, l\'herboriste, et Anselme, le sonneur de cloches, pourront peut-être vous aider. Donne ce code au Barde.'},
    /* (étape 3, le Sage) */
    ecritures:{nom:'Les écritures du village', ic:'📖', pour:'alchimiste', de:'sage', reserve:true,
      t:'Le Livre d\'or de la fête t\'attend dans ton labo : tout le village y a écrit un petit mot pour Odette, chacun de sa main. Glisse la lettre sous ta loupe : le Livre d\'or s\'ouvrira, et tu compareras les écritures.',
      dire:'L\'Alchimiste pourra comparer les écritures : donne-lui ce code.'},
    /* (12 novembre : plus de code « L'herbier » — le Sage lit l'herbier à voix haute, l'Alchimiste cherche sur sa carte ; Bible §13.26) */
    aveu:{nom:'L\'aveu de Mélusine', ic:'🧵', pour:'sage', de:'barde', savoir:true,
      t:'Mélusine a avoué : c\'est elle qui a écrit la lettre, et qui l\'a glissée sous la porte de la mairie. Un homme en cape l\'y a forcée ; elle n\'a pas vu son visage.',
      dire:'C\'est une preuve pour le Sage : donne-lui ce code.'},
    /* (étape 5, le Pisteur) ce qu'il reçoit et ce qu'il donne ; ceux du Sage, de l'Alchimiste et des grands dialogues du Barde
       arriveront avec leurs étapes : en attendant, ils se tapent comme les autres codes */
    /* (13 novembre : plus de code « Moustache a six doigts » — le Sage lit le carnet d'Odette à voix haute ; Romain : « pas de code pour ça ») */
    /* (12 novembre : plus de codes « Le gui du pommier » ni « Le gui » — le gui est dans le Vieux verger, au-delà de la brume, sur le pommier
       à l'échelle : l'Alchimiste y grimpe elle-même ; Bible §13.26) */
    /* (12 novembre au soir : le code garde son nom de code, cle_clou, mais Anselme ne pend plus sa clé au clou — elle est à sa ceinture) */
    /* (17 novembre) « Le plan de la nuit » : le Barde l'a dans son Carnet avec « 💡 Le plan » (E.etapes.barde) ; chez le Pisteur, il
       affiche sa mission de la nuit */
    plan_nuit:{nom:'Le plan de la nuit', ic:'💡', pour:'pisteur', de:'barde',
      t:'Le Barde a un plan ! Anselme ne prête jamais sa clé : elle ne quitte pas sa ceinture. Mais cette nuit, il sonnera la Grosse Marie, les yeux fermés, pour compter les coups… Ce sera le moment de la lui prendre.',
      dire:'Le Pisteur a un rôle dans ce plan : donne-lui ce code.'},
    cle_clou:{nom:'La Grosse Marie sonne', ic:'🔔', pour:'pisteur', de:'barde',
      t:'Le Barde aide Anselme à sonner la Grosse Marie. DONG… DONG… Anselme ferme les yeux et compte les coups. Sa clé pend à sa ceinture…',
      dire:'C\'est le moment de la lui prendre ! Donne ce code au Pisteur.'},
    vieux_puits:{nom:'Le vieux puits', ic:'🕳️', pour:'pisteur', de:'barde',
      t:'Tim l\'a vu depuis les toits : Moustache a filé par un petit sentier, jusqu\'au vieux puits, et il s\'est glissé entre les barreaux de la grille ! Ce sentier est maintenant sur ton tableau des chemins secrets.',
      dire:'Le Pisteur doit y aller : donne-lui ce code.'},
    /* (étape 2, les grands dialogues du Barde) */
    /* (13 novembre) il remplace « La copie de la lettre » : le Barde n'a pas eu la lettre → le Pisteur va la chercher */
    lettre_bureau:{nom:'La lettre est sur le bureau du maire', ic:'🫥', pour:'pisteur', de:'barde',
      t:'Le Barde n\'a pas réussi à se faire prêter la lettre d\'Odette : le maire la garde sur son bureau, à la mairie. Les beaux discours n\'ont pas suffi… Il reste la discrétion !',
      dire:'C\'est un travail pour le Pisteur : donne-lui ce code.'},
    /* EN RÉSERVE (12 novembre au soir) : plus personne ne donne ce code. Le grand dialogue « sonner la Grosse Marie pendant le donjon » est
       retiré (plus de « minuit » ; la Grosse Marie sonne pour ouvrir la fête, dans tous les cas). Le donjon sait toujours le lire (toute la
       vie des trois héros revient, une fois) : le code reste écrit ici, avec ses symboles gelés (codes-fixes.js, donjon-codes.js), tant que
       Romain n'a pas décidé s'il revient autrement. reserve:true : le vérificateur ne lui cherche pas de donneur (tools/verif-e3.js). */
    grosse_marie:{nom:'La Grosse Marie', ic:'🔔', pour:'pisteur', de:'barde', donjon:true, reserve:true,
      t:'DONG… DONG… La Grosse Marie sonne. Sous la terre, la brume recule : une fois, hors d\'un combat, toute la vie des trois héros revient.',
      dire:'Quand l\'équipe du donjon dit « On est à plat ! », donne ce code au Pisteur : il le tape dans le donjon.'},
    /* LE DÉPART (Romain, 13 novembre : « le code du Pisteur au Sage : on va dans la crypte ») : la grille ouverte (ou les barreaux du puits
       fondus), le Pisteur le donne au Sage ET à l'Alchimiste. Chez eux : la fenêtre « Il est temps d'enfiler notre tenue de combat ! »,
       et leur code à eux pour le Pisteur (leur allure dans le donjon : descente.js) ; chez le Sage, ses pages du donjon s'ouvrent dans son
       Grand Livre. (tenue:true : descente.js ouvre la fenêtre de la tenue à la place du « Tu as reçu » ordinaire.) */
    on_descend:{nom:'On va dans la crypte', ic:'🕯️', pour:['sage', 'alchimiste'], de:'pisteur', tenue:true,
      t:'Le Pisteur a ouvert le passage : sous le village, un escalier de pierre descend dans le noir. Tout le monde s\'équipe !',
      dire:'Il est temps d\'enfiler notre tenue de combat ! Donne ce code au Sage et à l\'Alchimiste.'},
    /* LE BRUIT DE LA GRILLE, POUR LE BARDE (Romain, 14 novembre, 10 h 29, Bible §13.36 : « il faut qu'il reçoive un code pour savoir s'ils
       ont fait du bruit ou pas »). En ouvrant le passage, le Pisteur a un deuxième code, pour le Barde (p.donneAussi, moteur-actions.js) :
       soulever → « La grille s'ouvre sans bruit » ; tirer ou pousser → « La grille a hurlé » ; le puits (ajouté par Claude : personne
       n'a rien entendu non plus) → « Le puits est ouvert ». Chez le Barde, n'importe lequel lance le minuteur caché du maire (grands.amis.attente :
       il vient tout seul au bout de 15 minutes) ; avec le bruit, il ne pose pas de question, il prévient qu'il va voir
       (grands.amis.sansReponse). « C'est juste pour occuper le Barde. Ça ne change rien » à la fin : le maire descendra dans tous les cas.
       tard:true : ces trois codes se rangent tout à la fin de la liste (moteur-base.js, codesBruts) — aucun autre code ne bouge. */
    grille_silence:{nom:'La grille s\'ouvre sans bruit', ic:'🤫', pour:'barde', de:'pisteur', tard:true,
      t:'Tes amis ont soulevé la grille de la crypte, tout doucement. Pas un bruit : à la fête, personne n\'a rien entendu.',
      dire:'Pas un bruit ! Le Barde doit le savoir : donne-lui ce code.'},
    grille_bruit:{nom:'La grille a hurlé', ic:'💥', pour:'barde', de:'pisteur', tard:true,
      t:'CRIIIIIC ! Tes amis ont ouvert la grille de la crypte… et tout le village l\'a entendue. À la fête, toutes les têtes se sont levées.',
      dire:'Tout le village a entendu ! Le Barde doit le savoir : donne-lui ce code.'},
    puits_ouvert:{nom:'Le puits est ouvert', ic:'🕳️', pour:'barde', de:'pisteur', tard:true,
      t:'Les barreaux du vieux puits ont fondu : tes amis descendent sous la terre. À la fête, personne n\'a rien entendu.',
      dire:'Le Barde doit le savoir : donne-lui ce code.'},
    /* LES EMPREINTES DU JARDIN D'IRIS (16 novembre, Bible §13.52 ; lieux.herboristerie) : le Pisteur les a suivies et mesurées. Une
       information pour le Sage (savoir), qui a la taille des pieds de chacun dans « Les habitants ». Le texte ne conclut rien, et ne
       parle pas de l'encre : c'est le Barde qui sait qu'on en a volé chez Iris. tard:true : rangé tout à la fin, aucun autre code ne bouge. */
    pieds_enfant:{nom:'Des pieds d\'enfant', ic:'👣', pour:'sage', de:'pisteur', savoir:true, reserve:true, tard:true,
      t:'Cette nuit, quelqu\'un est passé par le jardin d\'Iris, sous la fenêtre de son atelier. Le Pisteur a mesuré ses empreintes dans la terre : 3 carreaux. Des pieds d\'enfant ! Elles filaient vers la rue des Lanternes.',
      dire:'Des pieds d\'enfant ? Le Sage doit le savoir : donne-lui ce code.'},
    /* LA MÊME ENCRE (16 novembre, 15 h, Bible §13.54 ; l'étape 6 du scénario : « Alchimiste, code pour le Sage ») : l'Alchimiste a comparé
       l'encre de la lettre à celle d'Iris. C'est ce qui relie le vol chez Iris (et donc les empreintes du jardin) à la lettre. Une
       information (savoir) ; le texte ne dit pas qui. tard:true : rangé tout à la fin, aucun autre code ne bouge. */
    meme_encre:{nom:'La même encre', ic:'🖋️', pour:'sage', de:'alchimiste', savoir:true, tard:true, reserve:true,
      t:'L\'Alchimiste a comparé l\'encre de la lettre à celle d\'Iris : c\'est la même, une encre noire de noix de galle. La lettre a été écrite avec l\'encre volée chez Iris, cette nuit.',
      dire:'La même encre ? Le Sage doit le savoir : donne-lui ce code.'},
    /* (étape 6) le donjon : la porte aux quatre signes (le code du donjon « Un chat gratte à la porte », porte:odette) */
    /* (Romain, 17 novembre, 7 h 12 : « on a assez de codes comme ça ») plus personne ne donne ce code : devant la porte, le Pisteur entend
       la voix d'Odette et le dit à voix haute. Ses symboles restent en réserve. */
    odette_porte:{nom:'Odette est derrière la porte', ic:'🚪', pour:'sage', de:'pisteur', reserve:true,
      t:'Tout au fond des souterrains, Moustache gratte au bas d\'une grande porte ronde. Tu colles l\'oreille… Une voix étouffée : « Moustache ? Mon gros gris, c\'est toi ? » Odette est là, vivante, derrière la porte !',
      dire:'Un gros chat gris gratte à la porte aux quatre signes : donne ce code au Sage.'},
    /* LÉO, LE BOSS FINAL DU DONJON (13 novembre, Bible §13.33). Deux codes du Pisteur, que le donjon affiche lui-même (descente.js les
       relit au retour) :
       · en entrant dans la dernière salle, « L'homme en cape est là ! », pour le Barde : à la fête, Farinel et Iris ont alors des choses
         à lui dire (E.fete.gens.<pnj>.aide) — il les lit à voix haute pendant que le Pisteur se bat ;
       · Léo battu, « Léo a parlé », pour le Sage : c'est ce code qui ouvre les accusations (E.accuser.besoin). */
    leo_la:{nom:'L\'homme en cape est là !', ic:'🧥', pour:'barde', de:'pisteur',
      t:'Tout au fond des souterrains, un homme en cape noire attendait tes amis. Le combat commence ! Il se bat avec les outils du moulin…',
      dire:'Le Barde doit le savoir, vite : donne-lui ce code.'},
    leo_battu:{nom:'Léo a parlé', ic:'🧑', pour:'sage', de:'pisteur',
      t:'Sous la cape noire : Léo, l\'apprenti du meunier ! Battu, il a parlé. C\'est le maire qui a tout préparé, depuis le début : la rivière rouge, les fumigènes, la lettre. Et sous Brumeval, il y aurait une ville entière… Place aux accusations !',
      dire:'Le Sage note tout dans son Grand Livre, puis il accuse : donne-lui ce code.'}
  },
  /* ---------- Les lieux (étape 5 : le Pisteur ; E3-actions-des-roles.md §1) ----------
     L'Alchimiste ajoutera ses cueillettes à ces lieux (étape 4). Un seul essai par mini-jeu (essais.js) ; un filet (ouvrePartiel)
     seulement pour ce qui est indispensable. Niveaux (rang de l'enquête 3 + mjNiveau, puis la courbe
     enfant / adulte, mj-core.js) : la clé d'Anselme, rang 7 (enfant 9, adulte 8) ; les traces, rang 3 (plus bas : lieux.L2). */
  /* LE SENTIER DE MOUSTACHE (17 novembre, le nouveau fil, la nuit : « Tim montre le vieux puits, qui s'affiche sur le tableau des chemins
     secrets du Pisteur »). Un chemin secret en surface, comme le chemin des bûcherons de l'enquête 2 (carte-jeu.js, E.chemins) : le code
     de Tim, tapé par le Pisteur, l'emmène à son tableau, où le sentier se trace ; le toucher l'emmène au vieux puits. Il part de derrière
     la taverne, longe le bois à l'ouest du village, et arrive au puits (Carte.LIEUX.puits, 112 × 345) par le sud. */
  /* LES PASSAGES OBLIGATOIRES (Romain, 17 novembre, 7 h 10 : « les codes où il n'y a qu'une seule passerelle […] il faut les mettre avec un
     rond jaune pour éviter qu'un des quatre personnages oublie. […] montre-le explicitement sur la carte, de façon gratuite. C'est valable
     pour les quatre personnages. »). Ce sont les étapes sans lesquelles personne ne descend : le vérificateur les calcule (tools/verif-e3.js,
     « les passages obligatoires ») et contrôle que chacune est marquée.
       · Sur la carte : un point de lieu ou une question du Barde marqués oblige:true → le rond jaune de leur lieu (ou de leur maison),
         tant que c'est faisable et pas fait (M.obligesCarte, moteur-roles.js ; carte.js).
       · Les codes : ceux de cette liste ont un anneau jaune partout où ils sont dessinés (M.codeHTML, moteur-ecrans.js).
     Les sept plantes de l'Alchimiste sont obligatoires aussi, mais leur cachette est l'énigme de l'herbier : pas de rond jaune dessus. */
  codesObliges:['info:crypte_fermee', 'info:cle_clou', 'info:vieux_puits', 'info:on_descend', 'info:sac_pret', 'allure:'],   /* (17 novembre : « info:sac_pret » = les sept potions ; « allure: » : les codes d'allure, au cachot de la fin) */
  chemins:[
    {id:'moustache', nom:'Le sentier de Moustache', ic:'🐈', code:'info:vieux_puits', vers:'puits', etiquette:[232, 560],
      pts:[[262,702],[214,640],[166,566],[128,486],[110,410],[112,372]]}
  ],
  lieux:{
    /* LES TRACES DE MOUSTACHE (Romain, 13 novembre : « ce mini-jeu est à refaire […] tu le fais démarrer depuis chez Odette, pas sur la
       place » ; « le Pisteur au centre de l'image, la caméra le suit ; il doit trouver les bonnes traces et aller jusqu'à l'église. S'il
       suit des mauvaises traces jusqu'à un point précis, il perd »). Le nouveau mini-jeu : mj-pistage.js (« Suivre les traces »).
       · Devant la maison d'Odette (L2 : une maison avec des choses à voir, moteur-roles.js, M.pointsMaison), à tout moment, dès que le
         Barde a donné le code « Les traces de Moustache » ; une petite bulle 🐾 se pose alors sur la maison, sur la carte du Pisteur.
       · Plus de code « Moustache a six doigts » : le Sage a le carnet d'Odette dans son Grand Livre (les sept chats et leurs traces,
         chats.js) ; il le dit à voix haute. Ici, rien ne dit quelle trace suivre.
       · On recommence autant qu'on veut (essaisInfinis) : sans « La crypte est fermée », le grand dialogue d'Anselme ne s'ouvre pas.
       · Niveau : celui de l'enquête (enfant 3 : trois fausses pistes ; adulte 6 : quatre, dont Noisette et ses cinq doigts). */
    L2:{
      pisteur:{points:[
        /* L'INTÉRIEUR DE LA MAISON D'ODETTE (16 novembre, le secret d'Odette ; interieur.js) — REFAIT LE 19 NOVEMBRE (Romain : « je veux pas
           qu'il y ait d'aide […] la maison un peu sombre […] il peut appuyer sur les dalles. Mais comme il n'y a pas le soleil, il ne sait
           pas sur lesquelles appuyer. Après, s'il a de la chance, il peut trouver […] l'après-midi […] au bout de 3 secondes, une dalle
           qui s'affiche, puis une seconde plus tard, une deuxième, puis une troisième […] il n'y a pas de signe »).
           UN SEUL POINT, le matin et l'après-midi (p.parMoment, moteur-roles.js) : la même maison, les mêmes neuf dalles sans signe, la même
           cachette — le vieux plan (un code objet pour le Sage).
           · Le matin (« 🏠 La maison d'Odette ») : dans l'ombre, aucune aide. On peut appuyer sur les dalles : un coup de chance sur 504.
           · L'après-midi (« ☀️ Chez Odette, au soleil ») : le soleil allume trois dalles, l'une après l'autre : c'est l'ordre.
           On ressort quand on veut, sans fenêtre « Raté » (res.sorti, moteur-actions.js). Le Sage, lui, a lu sur le papier d'Odette, avec
           la pierre de Tim : « soleil de l'après-midi », et les dalles qui s'éclairent (pierres.js) — il le dit à voix haute, ou pas : le
           Pisteur peut trouver sans lui (plus de p.oral). (Avant le 19 novembre : deux points, « maison » le matin — une simple visite —
           et « cachette » l'après-midi ; une partie en cours garde « pisteur:L2:maison », qui ne sert plus à rien.) */
        {id:'cachette', ic:'☀️', nom:'Chez Odette, au soleil', moments:['matin', 'apresmidi'], mj:'interieur', essaisInfinis:true, sortieLibre:true, obj:'vieux_plan',
          params:{maison:'odette', moment:'apresmidi', lait:true},
          avant:'Le soleil de l\'après-midi entre enfin chez Odette. Tu pousses la porte…', bouton:'☀️ Entrer chez Odette',
          parMoment:{matin:{ic:'🏠', nom:'La maison d\'Odette', bulleUneFois:true, params:{maison:'odette', moment:'matin'},
            avant:'La porte d\'Odette n\'est jamais fermée à clé. Tu pousses le battant, sans bruit…', bouton:'🏠 Entrer chez Odette'}},
          t:'Sous la dalle du milieu, un étui de cuir. Dedans, un très vieux plan, roulé serré : des couloirs, des couloirs… Odette le cachait bien !',
          rate:'Tu ressors de chez Odette.'},
        /* (17 novembre, étape 3 du nouveau fil) plus de code du Barde : l'après-midi, le bol de lait de midi est renversé, le Pisteur le
           voit lui-même (et encore la nuit). Au bout : Moustache cherche Odette à la grille, et des yeux rouges derrière les barreaux —
           ce qui annonce les bêtes (Romain : « rien n'annonce le combat »). Le code, lui, ne change pas d'identité (info:crypte_fermee) :
           il s'appelle maintenant « Odette est sous l'église », et rouvre Iris (l'herbier) et Anselme chez le Barde. */
        {oblige:['nuit'], id:'traces', ic:'🐾', nom:'Les traces de Moustache', moments:['apresmidi', 'nuit'], mj:'pistage', essaisInfinis:true,
          donne:'info:crypte_fermee',
          avant:'Le bol de lait de midi est renversé, et des pattes blanches filent dehors : les chats d\'Odette sont partis, chacun de son côté ! Suis celles de Moustache… si tu sais les reconnaître.',
          bouton:'🐾 Suivre les traces',
          t:'Les traces mènent à la grille de la crypte, sous l\'église. Moustache gratte les barreaux et miaule vers le noir : il appelle Odette, elle est là-dessous ! Soudain, un grognement… deux yeux rouges… un rat énorme se jette sur la grille ! Elle est fermée à clé. Dis-le à tes amis !',
          /* (15 novembre, 14 h 26 : « Désolé, tu t'es trompé, tu n'as pas suivi la bonne trace ») */
          rate:'Désolé, tu t\'es trompé : ce n\'était pas Moustache. Tu n\'as pas suivi la bonne trace.'}
      ]}
    },
    place:{
      pisteur:{intro:'La place des Lanternes. Tout le village prépare la fête !', points:[
        /* (Romain, 13 novembre : « le mini-jeu des banderoles n'est pas à jour. Il faut mettre […] l'arc qu'on bande en vue un peu 3D,
           c'est le dernier jeu qu'on a fait. Et tu le mets au niveau 9 ») le tir aux anneaux (mj-visee.js).
           (Romain, 16 novembre, 6 h 43 : « le nouveau tir de banderoles, niveau 8 ») niveau 8 pour tout le monde */
        /* (Romain, 16 novembre, 7 h 58 : « répétable à l'infini, jusqu'à ce qu'on réussisse ») essaisInfinis */
        {id:'banderoles', ic:'🎏', nom:'Les banderoles de la fête', moments:M_, mj:'visee', mjNiveauFixe:8, essaisInfinis:true,
          avant:'Le maire veut des banderoles partout sur la place ! Vise les anneaux : chaque flèche emporte sa guirlande de petits drapeaux.',
          bouton:'🏹 Accrocher les banderoles',
          t:'Les petits drapeaux claquent au vent, d\'un toit à l\'autre. Basile lève le nez : « Ça, c\'est de la décoration ! »',
          rate:'Une guirlande s\'emmêle, puis une autre… Le maire te tend un nouveau carquois : « Allez, on recommence ! »',
          ferme:'Les banderoles restent dans leur panier.'}
      ]},
      alchimiste:{cueillir:[{ingr:'eau', n:2}]}
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
      /* l'Alchimiste (étape 4) : le gâteau de la fête (mj-gateau.js : une création libre, dix minutes, on ne le rate jamais).
         Gaspard a monté les gros étages du bas ; l'Alchimiste fait le haut (jusqu'à quatre étages) : avec les siens, ça fait bien
         les « sept étages » dont tout le village parle. Depuis le 12 novembre (21 h 34, Romain : « que le mini-jeu du gâteau soit pour
         tout le monde ») les trois autres font aussi le leur (E.bonus, « Le concours de gâteaux ») : on attend les autres, on commence
         ensemble, et on élit le plus beau. L'icône 🎂 sur la carte : carteIc (moteur-roles.js, M.infosCarte). */
      alchimiste:{intro:'La boulangerie de Gaspard. Sur la grande table, trois énormes étages de gâteau attendent leur chapeau.', points:[
        /* (13 novembre) à la fin : le vote (la note sur 20, la place : 5, 4, 3 ou 2 pièces d'or) ; le gâteau porté au maire, tout ce qui
           touche au gâteau disparaît (disparait) */
        {id:'gateau', ic:'🎂', nom:'Le gâteau de la fête', moments:['matin', 'apresmidi'], mj:'gateau', carteIc:'🎂', carteNom:'Le gâteau',
          disparait:[{vu:'alchimiste:mairie:gateau'}],
          avant:'Gaspard te confie le haut de son gâteau ! Attends tes amis : commencez vos gâteaux en même temps, ce sera plus rigolo. Dix minutes… puis élisez le plus beau !',
          bouton:'🎂 Faire le gâteau',
          t:'Ton gâteau part sur la grande table de la fête.'},
        /* (17 novembre, étape 3 du nouveau fil : « les bêtes ») LES SACS ÉVENTRÉS : Gaspard a dit au Barde que des rats grands comme des
           chats ont crevé ses sacs cette nuit. L'Alchimiste y ramasse de quoi chercher : l'échantillon arrive sur sa paillasse (p.recoit ;
           sa fiche : src/labo/30-donnees.js, sac_farine). Le matin de l'Alchimiste, c'est le gâteau et le labo. */
        {id:'sac', ic:'🌾', nom:'Les sacs éventrés', carteIc:'🌾', carteNom:'Les sacs éventrés', recoit:'obj:sac_farine',
          t:'Derrière le four, trois sacs de farine crevés. « Cette nuit ! Des rats grands comme des chats ! » gémit Gaspard. Sur le plus gros sac, tu ramasses une pincée de farine : dedans, un drôle de poil, une miette noire, un petit brin vert qui brille… Tout ça file sur ta paillasse.',
          note:'Chez Gaspard : sur un sac de farine éventré, un drôle de poil, une miette noire et un petit brin vert qui brille. À regarder de près, sur la paillasse.'}
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
        /* la lettre, en se cachant : seulement quand le Barde n'a pas su la demander au maire (son code « La lettre est sur le bureau du
           maire » : Romain, 13 novembre). Niveau 5 pour tout le monde, autant d'essais qu'on veut : « on est sûr d'avoir la lettre ».
           L'après-midi, et encore la nuit si le code arrive tard. Réussi : la lettre, avec son code pour le Sage et l'Alchimiste. */
        /* (decor 'mairie' : l'intérieur de la mairie, et au bout le bureau du maire avec la lettre — Romain, 21 h 21) */
        {id:'lettre', ic:'🫥', nom:'La lettre, en cachette', moments:AN_, mj:'cachette', mjNiveauFixe:5, essaisInfinis:true, params:{decor:'mairie'}, obj:'lettre',
          besoin:[{code:'info:lettre_bureau'}], visibleSi:[{code:'info:lettre_bureau'}],
          avant:'Le maire garde la lettre d\'Odette sur son bureau. Traverse la mairie sans te faire voir, jusqu\'à son bureau !',
          bouton:'🫥 Se faufiler',
          t:'Tu te glisses derrière le grand rideau. Le maire compte ses papiers un par un… puis il sort. La lettre est sur le dessus.',
          rate:'« Qui va là ?! » On t\'a vu. Tu files sans demander ton reste.'},
        /* rendre sa mission (la seule chose à faire ici sans le code du Barde) : dès qu'une des deux missions de fête est réussie */
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
        /* (13 novembre) le Livre d'or n'est plus un point de la mairie : c'est une page du Grand Livre (E.pages, « livredor ») */
        /* rendre le tableau : 5 pièces d'or. (13 novembre : plus de lettre accrochée sous le tableau — si le Barde ne l'obtient pas, le
           Pisteur va la chercher, autant de fois qu'il faut : « pas besoin de subterfuges », Romain) */
        {id:'rendu', ic:'🎉', nom:'Rendre le tableau au maire', moments:A_, or:5, visibleSi:[{vu:'sage:mairie:tableau'}], ouvreLivre:['quiecrit'],
          /* (17 novembre, le nouveau fil) en échange, le maire lui confie le Livre d'or de la fête : il n'est plus dans le Grand Livre dès le
             matin (« rien n'arrive par magie »), et c'est le Sage qui compare les écritures, plus l'Alchimiste */
          t:'Le maire : « Magnifique ! Ce soir, tout le monde à la fête ! Tenez, gardez-moi donc le Livre d\'or : tout le village y a écrit un mot pour Odette. »'},
        {id:'sanstableau', ic:'🏛️', nom:'Passer voir le maire', moments:A_, visibleSi:[{rate:'sage:mairie:tableau'}], ouvreLivre:['quiecrit'],
          t:'Le maire : « Pas de tableau ? Tant pis, les lampions feront l\'affaire. Rendez-vous utile : gardez-moi le Livre d\'or, tout le village y a écrit un mot pour Odette. »'}
      ]},
      /* l'Alchimiste (étape 4) : porter le gâteau au maire, l'après-midi (5 pièces d'or) */
      alchimiste:{intro:'La mairie. Le maire attend son gâteau en regardant sa montre.', points:[
        {id:'gateau', ic:'🎉', nom:'Porter le gâteau au maire', moments:A_, or:5, visibleSi:[{vu:'alchimiste:boulangerie:gateau'}],
          t:'Le maire fait le tour du gâteau, les mains dans le dos : « Quelle merveille ! Ce sera le clou de ma fête. Que personne n\'y touche avant ce soir ! »'}
      ]}
    },
    clocher:{
      /* (17 novembre, étape 3 du nouveau fil : « l'affiche est vue par les quatre ») l'après-midi, une affiche sur la porte de l'église, sur
         la carte de chacun (L.affiche, moteur-roles.js). Elle dit QUAND Anselme sonnera : c'est une pièce du plan de la nuit. */
      affiche:{moments:A_, ic:'📜', nom:'Une affiche',
        t:'Sur la porte de l\'église, une affiche toute fraîche : « CETTE NUIT, LA GROSSE MARIE OUVRIRA LA FÊTE ! »'},
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
        /* (Romain, 13 novembre ; disparait : regles.js) les quatre plantes d'au-delà de la brume cueillies : plus rien à demander à
           Anselme pour la cloche ; la mélisse rapportée : plus rien à lui dire sur sa tisane */
        /* (17 novembre) le matin, Anselme dort : rien à faire au clocher avant l'après-midi */
        {id:'endormi', ic:'💤', nom:'Monter voir Anselme', moments:M_,
          t:'Sur la porte du clocher, un écriteau : « SONNEUR ENDORMI. REVENEZ CET APRÈS-MIDI. » Derrière la porte, ça ronfle comme une cloche fêlée.'},
        {oblige:true, id:'bertille', ic:'🔔', nom:'Monter voir Anselme', moments:AN_, disparait:[{brumeFinie:true}],
          t:'« AH, TE VOILÀ ! » Anselme bâille à s\'en décrocher la mâchoire. « J\'ai dormi toute la matinée… et très mal ! Mes cloches me résonnent dans la tête. Il me faudrait une tisane de mélisse… mais la mélisse ne pousse plus que derrière la brume. » Il attrape la plus petite corde. « Bertille est toute menue : elle ne repousse la brume qu\'un petit peu. Ça suffira. Tu m\'en rapportes ? » DING ! DING ! DING ! Par la lucarne, tu vois la brume reculer, au nord et à l\'ouest.',
          note:'Anselme a sonné Bertille, sa plus petite cloche : la brume a reculé un peu, au nord et à l\'ouest du village. En échange, il veut de la mélisse pour sa tisane.'},
        {id:'tisane', ic:'🍵', nom:'Porter la mélisse à Anselme', moments:AN_, or:3, visibleSi:[{vu:'plante:melisse'}], disparait:[{vu:'alchimiste:clocher:tisane'}],
          t:'Tu lui tends une belle poignée de mélisse. Il froisse une feuille sous son nez. « ÇA SENT LE CITRON ! » Cette nuit, après la fête, une bonne tisane, et il dormira comme un loir. « Garde le reste pour toi. Et merci ! »',
          note:'Anselme a sa mélisse. En tisane, elle calme et elle aide à dormir.'}
      ]},
      pisteur:{intro:'Le clocher. Tout là-haut dort la Grosse Marie, la plus vieille cloche du village.', points:[
        /* la clé d'Anselme : avec « La Grosse Marie sonne » (le Barde, info:cle_clou) ; difficile, un seul essai. Raté : le puits apparaît (puits, plus bas) */
        /* (decor 'clocher' : la nef, la sacristie, et tout en haut la Grosse Marie, Anselme et le Barde, la clé au clou — Romain, 21 h 21)
           (12 novembre au soir : dans l'histoire, la clé est maintenant à la ceinture d'Anselme — les textes le disent ; le dessin de la
           dernière pièce, dans mj-cachette.js, montre encore la clé au clou : à reprendre avec le Pisteur) */
        {oblige:true, id:'cle', ic:'🗝️', nom:'La clé d\'Anselme', moments:['nuit'], mj:'cachette', mjNiveau:4, params:{decor:'clocher'},
          besoin:[{code:'info:cle_clou'}], visibleSi:[{code:'info:cle_clou'}],
          avant:'Les cloches sonnent ! Là-haut, Anselme compte les coups, les yeux fermés. Traverse l\'église et monte tout en haut du clocher sans te faire voir. Un seul essai !',
          bouton:'🫥 Se faufiler',
          t:'DONG ! DONG ! Anselme compte les coups, les yeux fermés. Sa clé pend à sa ceinture… Tu la décroches, tout doucement.',
          rate:'« Qui va là ?! » Anselme pose la main sur sa clé. Tu redescends en vitesse… Dehors, des miaulements dans la nuit : Moustache file vers la forêt !',
          ferme:'Anselme garde sa clé à la ceinture.'},
        /* LES TRACES JUSQU'AU PUITS (Romain, 15 novembre, 14 h 28 et 14 h 29 : « quand il ne réussit pas à attraper la clé d'Anselme, il y a
           des miaulements et un chat qui va vers le puits […] moitié ville et moitié forêt […] à la fin, il y a le puits » ; « dans ce mini-jeu
           précisément, il ne peut pas perdre […] sinon on va se retrouver bloqué »). Le même mini-jeu que chez Odette (mj-pistage.js), dans
           son décor « forêt » : on n'y perd jamais (près d'un mauvais chat, il file, et on rebrousse chemin), et on le recommence autant
           qu'on veut. Au bout, la grille du vieux puits apparaît (lieux.puits). La nuit seulement (comme la clé). */
        {oblige:true, id:'traces_puits', ic:'🐾', nom:'Les traces de Moustache', moments:['nuit'], mj:'pistage', essaisInfinis:true, params:{decor:'foret', moment:'nuit'},
          visibleSi:[{rate:'pisteur:clocher:cle'}], cacheSi:[{vu:'pisteur:clocher:cle'}],
          avant:'Des miaulements, partout dans la nuit ! Moustache a filé vers la forêt… mais ce n\'est pas le seul chat dehors. Suis ses traces, et seulement les siennes.',
          bouton:'🐾 Suivre Moustache',
          t:'Les traces s\'arrêtent au bord d\'un vieux puits, au bout de la forêt. Moustache s\'est glissé entre les barreaux de sa grille !',
          note:'Moustache s\'est glissé dans le vieux puits, au bout de la forêt.'},
        /* LA GRILLE (Romain, 12 novembre, 21 h 44, et 13 novembre : « Explorer, déverrouiller ; tirer ou pousser : un énorme bruit s'est entendu
           dans tout le village ; soulever : le portail s'ouvre sans bruit et vous pénétrez dans la crypte »). La clé en main, la grille se
           déverrouille ; reste à l'ouvrir : trois gestes, un seul compte (les deux autres s'en vont : cacheSi). Silas le dit au Barde :
           « Anselme, lui, la soulève un peu, et elle ne dit rien. »
           Chacun des trois gestes donne le code du départ, « On va dans la crypte », pour le Sage et l'Alchimiste (infos.on_descend),
           ET un code pour le Barde (donneAussi ; Romain, 14 novembre, Bible §13.36) : « La grille a hurlé » (tirer, pousser) ou « La
           grille s'ouvre sans bruit » (soulever). Chez le Barde, il fait venir le maire à la fête (grands.amis). */
        {oblige:true, id:'crypte', ic:'🗝️', nom:'La grille de la crypte', moments:['nuit'], besoin:[{vu:'pisteur:clocher:cle'}], visibleSi:[{vu:'pisteur:clocher:cle'}],
          t:'La clé tourne : clac ! La grille est déverrouillée. Elle est lourde, et toute rouillée… Comment vas-tu l\'ouvrir ?', choix:['tirer', 'pousser', 'soulever']},
        {obligeUn:'grille', id:'tirer', ic:'💥', nom:'Tirer la grille', choixTxt:'Tirer', moments:['nuit'], visibleSi:[{vu:'pisteur:clocher:crypte'}],
          cacheSi:[{vu:'pisteur:clocher:pousser'}, {vu:'pisteur:clocher:soulever'}], donne:'info:on_descend', donneAussi:'info:grille_bruit',
          t:'Tu tires de toutes tes forces. CRIIIIIC ! Un énorme bruit s\'est entendu dans tout le village ! La grille est ouverte… mais pour la discrétion, c\'est raté.',
          note:'La grille de la crypte a grincé : un énorme bruit s\'est entendu dans tout le village.', choix:['descendre']},
        {obligeUn:'grille', id:'pousser', ic:'💥', nom:'Pousser la grille', choixTxt:'Pousser', moments:['nuit'], visibleSi:[{vu:'pisteur:clocher:crypte'}],
          cacheSi:[{vu:'pisteur:clocher:tirer'}, {vu:'pisteur:clocher:soulever'}], donne:'info:on_descend', donneAussi:'info:grille_bruit',
          t:'Tu pousses de toutes tes forces. CRIIIIIC ! Un énorme bruit s\'est entendu dans tout le village ! La grille est ouverte… mais pour la discrétion, c\'est raté.',
          note:'La grille de la crypte a grincé : un énorme bruit s\'est entendu dans tout le village.', choix:['descendre']},
        {obligeUn:'grille', id:'soulever', ic:'🤫', nom:'Soulever la grille', choixTxt:'Soulever', moments:['nuit'], visibleSi:[{vu:'pisteur:clocher:crypte'}],
          cacheSi:[{vu:'pisteur:clocher:tirer'}, {vu:'pisteur:clocher:pousser'}], donne:'info:on_descend', donneAussi:'info:grille_silence',
          t:'Tu soulèves un peu la grille, tout doucement. Le portail s\'ouvre sans bruit, et vous pénétrez dans la crypte. Moustache file devant toi.',
          note:'La grille de la crypte s\'est ouverte sans un bruit.', choix:['descendre']},
        /* (étape 6) la descente : la fenêtre du donjon (descente.js) ; il lui faut les codes du Sage et de l'Alchimiste */
        {oblige:true, id:'descendre', ic:'🕯️', nom:'Descendre sous le clocher', choixTxt:'🕯️ Descendre', moments:['nuit'],
          visibleSi:[{vu:'pisteur:clocher:tirer'}, {vu:'pisteur:clocher:pousser'}, {vu:'pisteur:clocher:soulever'}], descente:'crypte'}
      ]}
    },
    /* LES INGRÉDIENTS DU CHAUDRON, comme à l'enquête 2 (Romain, 13 novembre) : la pensée sauvage et le miel de la potion de vérité, et
       tout ce qui se cueillait déjà. (La fontaine de la place : son eau, dans lieux.place.) */
    foret:{alchimiste:{cueillir:[{ingr:'champignon', n:2, moments:['nuit'], annonce:'Les champignons, c\'est à la tombée de la nuit qu\'on les cueille le mieux. Reviens cette nuit !'}]}},
    clairiere:{alchimiste:{cueillir:[{ingr:'trefle', n:2}]}},
    lavoir:{alchimiste:{cueillir:[{ingr:'brume', n:2, min:2, moments:['matin']}, {ingr:'eau', n:2}]}},
    /* LES EMPREINTES DE PIEDS D'ENFANT, DANS LE JARDIN D'IRIS (l'étape 8 du scénario de Romain du 12 novembre — « Dans le jardin d'Iris, des
       empreintes de pieds d'enfant. Dans le registre, seuls Tim et Mélusine chaussent si petit ; Tim est un garçon, Margot chausse
       grand » ; son go le 16 novembre, 6 h 43 : « je te laisse faire : les empreintes de pas d'enfant » ; Bible §13.52).
       Cette nuit, Mélusine s'est glissée dans l'atelier d'Iris par le jardin, pour voler un flacon d'encre (Iris le dit au Barde, le
       matin : pnj.iris [2] ; à voix haute, pas de code — le Pisteur vient voir de lui-même).
       · Le mini-jeu : « Suivre la piste » (mj-pisteur-alchi.js), habillé pour ce lieu, comme le massif de la mairie à l'enquête 1 : au
         départ, les sabots d'Iris marchent avec les petites empreintes (compagnon), puis s'en vont vers ses plates-bandes ; les petites
         sortent du jardin et filent jusqu'à la rue des Lanternes, où elles se perdent (arrivee 'lanterne') : ce matin, tout le village y
         a marché pour aller écouter le maire lire la lettre (le scénario de Romain : « des dizaines de pieds piétinent : il n'y a plus
         aucune trace à suivre »). Elles ne mènent chez personne : dans cette rue habitent le voisin, Odette, Mélusine, Victor et Tim.
       · Ce qu'on apprend : la taille. 3 carreaux — la mesure du registre du Sage depuis l'enquête 1 (D.PNJ.pied, livre.js : « 👣 pieds
         de 3 carreaux »). Seuls Tim, Mélusine (et Odette, l'absente) ont d'aussi petits pieds ; Margot, l'autre suspecte du Livre d'or, 4.
       · Le code « Des pieds d'enfant », pour le Sage (une information : savoir ; rien ne conclut à sa place — il a son registre).
       · Le matin et l'après-midi ; on recommence autant qu'on veut (c'est une preuve, comme les traces de Moustache) ; niveau 7 pour
         tout le monde (décision de Claude, à régler avec Romain). Rien ne l'annonce : ni mission, ni signe sur la carte. Et rien n'en
         dépend : sans elles, le Barde départage encore Mélusine et Margot en les accusant toutes les deux. */
    herboristerie:{
      pisteur:{intro:'L\'herboristerie d\'Iris. Derrière la boutique, son petit jardin, plein de pots et de plates-bandes.', points:[
        {id:'jardin', ic:'👣', nom:'Le jardin d\'Iris', moments:MA_, mj:'traces', mjNiveauFixe:7, essaisInfinis:true,
          params:{decor:'ville', suspect:'enfant', compagnon:'sabot', compagnonTxt:'Les sabots d\'Iris…', arrivee:'lanterne', arriveeTxt:'La place des Lanternes !',
            departTitre:'Retiens bien ces petites empreintes', departNom:'De tout petits pieds', departTxt:'Au départ, les sabots d\'Iris marchent avec elles. Ne suis que les petites !',
            consigne:'Au départ, de petites empreintes et les sabots d\'Iris se mélangent. Retiens bien les petites, puis guide le Pisteur du doigt sur LEUR piste jusqu\'au bout !'},
          /* (17 novembre) plus de code « Des pieds d'enfant » : le Pisteur le dit à voix haute (le Sage a la taille des pieds de chacun dans
             « Les habitants ») ; et la piste ne finit plus rue des Lanternes — Romain : « ça grille Mélusine » — mais sur la place */
          avant:'Sous la fenêtre de l\'atelier, la terre du jardin est toute piétinée. Des empreintes fraîches : quelqu\'un est passé par là, cette nuit ! Où mènent-elles ?',
          bouton:'👣 Suivre les empreintes',
          t:'Les petites empreintes filent jusqu\'à la place des Lanternes… et s\'y perdent : ce matin, tout le village l\'a piétinée pour écouter le maire. Mais tu les as mesurées : 3 carreaux. Des pieds d\'enfant ! Dis-le à tes amis.',
          rate:'Tu as perdu la piste… Retourne au jardin : les empreintes y sont encore.'}
      ]},
      alchimiste:{cueillir:[{ingr:'lavande', n:2}, {ingr:'pensee', n:2}]}},
    potager:{alchimiste:{cueillir:[{ingr:'miel', n:2}, {ingr:'menthe', n:2}]}},
    lisiere:{alchimiste:{cueillir:[{ingr:'baies', n:3}]}},
    puits:{
      pisteur:{intro:'Le vieux puits, au bord de la forêt. Plus personne n\'y tire d\'eau depuis longtemps.', points:[
        /* seulement si la clé d'Anselme est ratée (et ses traces suivies jusqu'ici, au clocher : traces_puits — 15 novembre), ou avec « Le
           vieux puits » du Barde ; jamais si la clé a été prise.
           (L'acide de l'Alchimiste, qui fait fondre les barreaux, arrive avec son code, quand ses sept potions sont prêtes : descente.js.) */
        {oblige:true, id:'grille', ic:'🕳️', nom:'La grille du vieux puits', moments:['nuit'], visibleSi:[{vu:'pisteur:clocher:traces_puits'}, {code:'info:vieux_puits'}], cacheSi:[{vu:'pisteur:clocher:cle'}],
          t:'Une vieille grille rouillée. Moustache passe entre les barreaux… toi, non. Il faudrait de quoi ronger toute cette rouille !'},
        /* (étape 6) l'acide de l'Alchimiste (son code, tapé par le Pisteur : P.vus['sac:acide'], descente.js) fait fondre les barreaux */
        {oblige:true, id:'acide', ic:'🧪', nom:'Verser l\'acide sur la grille', moments:['nuit'], visibleSi:[{vu:'pisteur:puits:grille'}], besoin:[{vu:'sac:acide'}],
          alt:'Tu n\'as rien pour ronger la rouille. L\'Alchimiste a ce qu\'il faut… quand ses sept potions seront prêtes ! Demande-lui son code, et tape-le dans ton onglet Code.',
          donne:'info:on_descend', donneAussi:'info:puits_ouvert',   /* (14 novembre) et un code pour le Barde : le maire, à la fête (grands.amis) */
          t:'Tu verses l\'acide de l\'Alchimiste. Pssshhh ! Les barreaux fondent comme du sucre. Tout en bas, deux yeux brillent : Moustache t\'attend.', choix:['descendre']},
        {oblige:true, id:'descendre', ic:'🕯️', nom:'Descendre au fond du puits', choixTxt:'🕯️ Descendre', moments:['nuit'], visibleSi:[{vu:'pisteur:puits:acide'}], descente:'puits'}
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
      occupe:{matin:['« La mairie est fermée : je prépare ma fête ! Revenez cet après-midi. »', '« Dix bouquets, pas un de moins ! Allez, allez ! »']},
      /* vexeDonne (17 novembre ; Romain, 20 h 16) : accusé à tort (« Mensonge ? »), le maire ferme sa porte jusqu'au moment suivant, et la
         grande conversation de la lettre (l'après-midi seulement) ne se tient plus : sans elle, personne ne donnait « La lettre est sur le
         bureau du maire » et le Pisteur ne voyait jamais le point de la lettre. Fâché, il le donne quand même (rien si la conversation a eu lieu). */
      vexeDonne:{info:'lettre_bureau', deja:'grand:lettre:fini', moments:A_,
        a:'Et n\'essayez même pas de me demander la lettre d\'Odette !',
        note:'Le maire, fâché : « N\'essayez même pas de me demander la lettre d\'Odette ! » Elle reste sur son bureau (code pour le Pisteur).'},
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
        note:'Gaspard : le maire est très fier de ses fêtes.'},
      /* [4] (17 novembre ; Romain, 16 novembre, 20 h 58 : « il pourrait parler de rats avec des yeux rouges, Gaspard ») */
      {q:'Et ces sacs de farine éventrés ?', g:'e', moments:M_, a:'Des rats ! Cette nuit, dans ma réserve : grands comme des chats… avec des yeux rouges !',
        note:'Gaspard : cette nuit, des rats grands comme des chats, aux yeux rouges, ont éventré ses sacs de farine.'}
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
        note:'Margot : le maire déteste qu\'on dise qu\'il cache des choses.'},
      /* [4] (13 novembre) la même accusation que chez Mélusine, avec le code « Deux écritures » de l'Alchimiste : le Livre d'or désigne
         deux femmes, le Barde les interroge toutes les deux. Margot dit vrai (aucun signe sur son visage) ; Mélusine ment.
         Réplique écrite par Claude le 13 novembre ; gardée telle quelle par Romain le 16 novembre (6 h 43 : « je te laisse faire »). */
      {q:'C\'est vous qui avez écrit la lettre.', g:'e', moments:A_, besoin:[{code:'info:cest_melusine'}], a:'Moi ? Je n\'écris que mes ardoises, à la craie. Et avec des fautes !',
        note:'Margot dit qu\'elle n\'écrit que ses ardoises, à la craie.'}
    ]},
    victor:{ou:{matin:'poste'}, carte:{apresmidi:'poste'},
      occupe:{apresmidi:['« Cent invitations à distribuer : pas une minute ! »', '« Quatre-vingt-dix-neuf… Non ! Tu m\'as fait perdre le compte ! »']},
      salut:'Bonjour ! Une lettre pour toi ? Ah non…', questions:[
      /* (17 novembre, la règle des codes de Romain : « un code, ça sert à donner un objet, ou à activer un truc sur l'appareil de l'autre »)
         plus de code « La lettre n'est pas passée par la poste » : le Barde le dit à voix haute */
      {q:Q_LETTRE, g:'e', moments:M_, a:'Ni timbre ni tampon : elle n\'est pas passée par la poste. Et en vingt ans, Odette n\'a jamais envoyé une seule lettre.',
        note:'Victor : la lettre d\'Odette n\'a ni timbre ni tampon, elle n\'est pas passée par la poste. Et en vingt ans, Odette n\'a jamais envoyé une seule lettre. À dire au Sage !'},
      {q:Q_ODETTE, g:'h', moments:M_, a:'Odette ? Je la connais à peine.', ment:true,
        vrai:'Bon… je l\'évite. Ses chats me suivent partout en miaulant, et j\'ai peur des chats.',
        note:'Victor dit qu\'il connaît à peine Odette.', noteVrai:'Victor a avoué : il évite Odette. Ses chats le suivent partout en miaulant, et il a peur des chats.'},
      {q:Q_NUIT, g:'h', moments:M_, a:'Rien : je me couche tôt, ma tournée commence avant l\'aube.',
        note:'Victor : il n\'a rien vu cette nuit, il se couche tôt.'},
      {q:'Votre tournée se passe bien ?', g:'r', moments:M_, a:'Le maire me confie tous ses papiers. Il les recompte chaque soir : gare à qui en emprunte un !',
        note:'Victor : le maire recompte ses papiers chaque soir. Gare à qui en emprunte un !'},
      /* une question de plus, dès qu'il a répondu sur la lettre : l'idée de comparer les écritures (Romain, 20 h 04 : « ce serait bien qu'il
         y ait quelqu'un qui émette l'hypothèse de récupérer la lettre et de la comparer avec son écriture ») */
      {q:'Comment savoir si c\'est vraiment Odette qui l\'a écrite ?', g:'e', moments:M_, besoin:[{vu:'barde:victor:0'}], a:'Il faudrait la comparer avec un papier écrit de sa main. Mais la lettre, le maire la garde dans son bureau… et la mairie n\'ouvre que cet après-midi.',
        note:'Victor : pour savoir si Odette a écrit la lettre, il faudrait la comparer avec un papier écrit de sa main. Le maire garde la lettre dans son bureau ; la mairie n\'ouvre que cet après-midi.'}
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
        note:'Fortuné : il vend une vieille clé couverte de runes, trouvée au-delà de la brume.'},
      /* (Romain, 16 novembre, 8 h 07) une fois son mensonge démasqué (la pièce d'or toute neuve) : on lui emprunte la pièce, et
         l'Alchimiste l'analyse — la même que celles de Bastien, à l'enquête 2 (labo : la fiche piece_pain, tout pareil). Toujours en dernier. */
      /* (Romain, 16 novembre, 19 h 48 : « il sourit de toutes ses dents : mais bien sûr, ça fera trois pièces d'or. Et là, accepter ou
         refuser. Est-ce qu'on dépense trois pièces pour une seule pièce ? ») prix : avant la réponse, une fenêtre « Accepter / Refuser » ;
         accepter coûte 3 pièces d'or du héros, refuser ne change rien (on peut redemander plus tard). barde.js, question(). */
      {q:'Est-ce que je peux vous emprunter cette pièce ?', g:'h', moments:MA_, secret:true, besoin:[{vu:'verite:fortune:2'}], obj:'piece_pain',
        a:'Il sourit de toutes ses dents : « Mais bien sûr ! Ça fera trois pièces d\'or. »',
        prix:3, paye:'Tu lui donnes trois pièces d\'or. Il te tend la sienne, toute neuve.',
        note:'Fortuné t\'a vendu la pièce d\'or toute neuve de la nuit, pour trois pièces d\'or. L\'Alchimiste pourra l\'analyser.'}
    ]},
    /* le matin, il ramone près du clocher ; l'après-midi, sur les toits de la ruelle des Brumes */
    tim:{ou:{matin:'clocher', apresmidi:'ruelle'}, salut:'Salut ! Attention, ça tombe !', questions:[
      {q:Q_LETTRE_TU, g:'h', moments:MA_, a:'Moi, je ne lis pas très bien. Mais une fête, j\'adore !',
        note:'Tim : il ne lit pas très bien, mais il adore les fêtes.'},
      {q:Q_ODETTE_TU, g:'h', moments:MA_, a:'Elle me donne des biscuits pour Pirate. Et elle me gronde quand je marche sur ses toits !',
        note:'Tim : Odette lui donne des biscuits pour son chien, Pirate.'},
      /* (c'est Mélusine qui a déposé la lettre, dans un châle comme celui d'Odette : Romain, 18 h 15) */
      {q:Q_NUIT, g:'e', moments:MA_, a:'Rien ! Je dormais, comme tout le monde.', ment:true,   /* (17 novembre) plus de code « Odette… sans sa canne » : à voix haute */
        vrai:'Bon… j\'étais sur les toits, à l\'aube. J\'ai vu Odette, dans son châle à chats, glisser la lettre à la mairie… mais elle marchait vite, et sans canne.',
        note:'Tim dit que cette nuit, il dormait, comme tout le monde.', noteVrai:'Tim a avoué : à l\'aube, il a vu « Odette », dans son châle à chats, glisser la lettre à la mairie. Mais elle marchait vite, et sans canne. À dire au Sage !'},
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
        note:'Le voisin : la maison d\'Odette n\'est jamais fermée. Si tu retrouves sa canne, va la lui poser.'},
      /* [4] (16 novembre, le nouveau fil : « rien n'arrive par magie dans le Grand Livre ») le papier d'Odette, pour le Sage : au dos, le
         plan de sa maison (pierres.js). Romain : « le papier d'Odette donné par le voisin le matin, oui, ça me va ». */
      {q:'Odette vous a laissé quelque chose ?', g:'e', moments:M_, obj:'papier_odette',
        a:'« Si je disparais, donne ce papier à qui viendra me chercher. » Voilà ce qu\'elle m\'a dit, le mois dernier. Tiens. Il est couvert de petits signes : moi, je n\'y comprends rien.',
        note:'Le voisin : Odette lui avait confié un papier couvert de signes, « pour qui viendra me chercher » (code pour le Sage).'}
    ]},
    /* la maison d'Odette, au 2, rue des Lanternes : une visite, sans questions ; deux codes d'un coup. (12 novembre au soir) Dès le matin
       (le voisin dit qu'elle n'est jamais fermée, et la lettre demande de rapporter la canne), et encore la nuit (un filet). */
    voisin:{ou:{matin:'L2', apresmidi:'L2', nuit:'L2'}, salut:'La maison d\'Odette. La porte n\'est toujours pas fermée à clé…', questions:[
      /* (17 novembre, étape 3 du nouveau fil) plus de code « Les traces de Moustache » : le Pisteur les voit lui-même, chez Odette,
         l'après-midi ; le Barde, qui voit le lait renversé, le lui dit s'il n'y a pas pensé */
      /* (17 novembre) le matin, plus de lait renversé ni de traces : c'est le bol de midi qui se renverse (le Pisteur le voit l'après-midi) */
      /* oblige:true (17 novembre ; Romain, 20 h 16 : « la maison d'Odette avec un petit rond jaune pour pas qu'il oublie d'y aller ») :
         le rond jaune sur la maison d'Odette (L2), dès le matin, tant que la canne n'est pas posée */
      {q:'Poser la canne d\'Odette', oblige:true, donne:['obj:carnet'], titreDonne:'Chez Odette',
        a:'Tu poses la canne contre la porte. Sur la table, le carnet d\'Odette : un chat à chaque page, avec ses traces de pattes, et son écriture penchée.',
        note:'Chez Odette : tu as posé sa canne contre la porte. Sur la table, son carnet : un chat à chaque page, avec ses traces de pattes, et son écriture penchée.'},
      /* [1] (17 novembre, étape 3 du nouveau fil : « la maison d'Odette brille aussi sur sa carte : il voit le lait renversé, et le dit
         au Pisteur s'il n'y a pas pensé ») l'après-midi et la nuit, sans code : une phrase à dire à voix haute */
      {q:'Jeter un œil chez Odette', moments:AN_, oblige:['apresmidi'],   /* (Romain, 19 novembre, 9 h 31 et 9 h 37) le rond jaune chez Odette, l'après-midi, c'est pour le Barde : il le dit au Pisteur */
       
        a:'Dans la cuisine, le bol de lait de midi est renversé. Par terre, de petites traces de pattes toutes fraîches filent dehors ! Les traces, c\'est l\'affaire du Pisteur : dis-le-lui !',
        note:'Chez Odette, l\'après-midi : le bol de lait de midi est renversé, et de petites traces de pattes toutes fraîches filent dehors. À dire au Pisteur !'}
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
      {q:'C\'est vous qui avez écrit la lettre.', g:'e', moments:A_, besoin:[{code:'info:cest_melusine'}], a:'Moi ? Je sais à peine écrire mon nom !', ment:true, donneVrai:'info:aveu',
        /* (17 novembre, étape 4 du nouveau fil : « Mélusine : revenez me voir cette nuit ») plus de « il a peut-être laissé des traces »
           (une piste qui ne menait nulle part) : honteuse, elle promet de coudre de quoi les protéger — les tenues, à la fête (E.fete) */
        vrai:'C\'est moi… Un homme en cape m\'a forcée à l\'écrire et à la déposer. Je n\'ai pas vu son visage. Pardon… Pour m\'excuser, je vous couds des tenues de combat. Revenez me voir cette nuit, à la fête : elles seront prêtes !',
        note:'Mélusine dit qu\'elle sait à peine écrire son nom.', noteVrai:'Mélusine a avoué : un homme en cape l\'a forcée à écrire la lettre et à la déposer. Elle n\'a pas vu son visage (code pour le Sage). Pour s\'excuser, elle vous coud des tenues de combat : retourne la voir cette nuit, à la fête, avant de parler à Anselme !'}
    ]},
    /* le matin : ses fleurs (marche.js : le bouton « 🌸 » dans sa conversation et sur sa pastille), et ses quatre questions — on lui a volé
       un flacon d'encre, cette nuit (Romain, 18 h 19). L'après-midi, elle est occupée par ses couronnes (elle vend encore, s'il reste des pièces). */
    /* (17 novembre) l'après-midi, elle n'est plus « occupée » : elle n'a rien de plus à dire… jusqu'au code du Pisteur (« Odette est sous
       l'église »), qui lui donne une question : l'herbier */
    iris:{ou:{matin:'herboristerie', apresmidi:'herboristerie'}, saluts:{apresmidi:'Chut… je tresse les couronnes de ce soir. Qu\'y a-t-il ?'},
      /* (son bonjour marche aussi quand le Barde vient de la fâcher au marché : fâchée, elle ne vend plus, mais elle répond encore) */
      salut:'Ah, c\'est toi ! Attention à mes pots, ils sèchent.', questions:[
      {q:Q_LETTRE, g:'h', moments:M_, a:'Je n\'ai pas fait attention, je pensais à mes fleurs.',
        note:'Iris : elle n\'a pas fait attention à la lettre.'},
      {q:Q_ODETTE, g:'h', moments:M_, a:'Elle m\'achète de la camomille pour dormir… et elle ne dort jamais !',
        note:'Iris : Odette lui achète de la camomille pour dormir… et elle ne dort jamais.'},
      {q:Q_NUIT, g:'e', moments:M_, a:'Cette nuit, on m\'a volé un flacon de mon encre ! Mon jardin est plein de traces : envoie-moi ton ami le Pisteur, il saura les lire.',
        note:'Iris : cette nuit, on lui a volé un flacon de son encre. Son jardin est plein de traces : elle demande le Pisteur. À lui dire !'},
      {q:'Vos plantes servent à quoi ?', g:'h', moments:M_, a:'À soigner, à teindre, à parfumer. La pensée sauvage pousse même dans la brume !',
        note:'Iris : la pensée sauvage pousse même dans la brume.'},
      /* (Romain, 16 novembre, 15 h : « oui » à l'encre d'Iris — l'étape 6 de son scénario : « Iris donne un échantillon de son encre ») une fois
         le vol raconté, on lui demande un peu de son encre : un code pour l'Alchimiste, qui la compare à celle de la lettre. Comme la
         pièce de Fortuné : toujours en dernier. La question et la réponse sont de Claude : à faire valider par Romain. */
      {q:'Il vous reste un peu de cette encre ?', g:'h', moments:M_, secret:true, besoin:[{vu:'barde:iris:2'}], obj:'encre_iris',
        a:'Elle fouille dans son tablier : « Un fond de flacon, c\'est tout ce qu\'il me reste. Tiens, prends-le ! »',
        note:'Iris t\'a donné un fond de flacon de son encre. L\'Alchimiste pourra l\'analyser.'},
      /* [5] (17 novembre, le nouveau fil : « l'herbier, c'est quelque chose que quelqu'un doit lui apporter ») avec le code du Pisteur.
         (19 novembre, 9 h 51, Romain : « une fois qu'elle a le code du Pisteur, tu peux mettre un rond jaune sur Iris ») oblige:true → le rond
         jaune sur l'herboristerie, chez le Barde, dès qu'il a le code et tant que l'herbier n'est pas prêté (M.obligesCarte). Avant le code,
         rien : Iris reste en rouge (« rien de plus à dire »). L'herbier n'est pas un verrou (la nuit, il arrive quand même) : son code n'a
         pas d'anneau, et tools/verif-e3.js ne le compte pas parmi les passages obligatoires. */
      {q:'Odette est sous l\'église, avec des bêtes aux yeux rouges !', g:'e', moments:A_, secret:true, besoin:[{code:'info:crypte_fermee'}], obj:'herbier', oblige:true,
        a:'Vous voulez descendre là-dessous ? Alors préparez-vous, et beaucoup : ces bêtes dorment le jour, et chassent la nuit. Tiens : Odette m\'empruntait souvent ce vieil herbier. Prends-le.',
        note:'Iris : les bêtes de sous l\'église dorment le jour et chassent la nuit. Elle t\'a prêté son vieil herbier (code pour le Sage).'}
    ]},
    /* un peu sourd, il parle fort (il ne ment jamais) */
    /* (Romain, 13 novembre) la nuit, son visage est posé sur le toit du clocher : on voit qu'il n'est pas à la fête, prêt à sonner (pose : carte-jeu.js) */
    anselme:{ou:{apresmidi:'clocher', nuit:'clocher'}, carte:{matin:'clocher'}, pose:{nuit:[660, 500]},
      /* (Romain, 12 novembre, 15 h 39) le matin, il fait appeler l'Alchimiste par le Barde : il a un service à lui demander (sa tisane de mélisse,
         lieux.clocher). Dit à voix haute, sans code : l'Alchimiste peut monter au clocher dès le matin, avec ou sans ce message. */
      /* (17 novembre, étape 3 du nouveau fil : « à la fin du matin, on a envie de passer à l'après-midi ») le matin, il dort : un écriteau
         sur la porte. C'est l'après-midi qu'il fait appeler l'Alchimiste (son bonjour), et qu'il sonne Bertille pour elle. */
      occupe:{matin:['Sur la porte du clocher, un écriteau : « SONNEUR ENDORMI. REVENEZ CET APRÈS-MIDI. » Derrière, ça ronfle.', '« RRRON… PSCHHH… » L\'écriteau n\'a pas bougé : « REVENEZ CET APRÈS-MIDI. »']},
      saluts:{apresmidi:'AH, LE BARDE ! VA ME CHERCHER L\'ALCHIMISTE : J\'AI UN SERVICE À LUI DEMANDER ! ET TOI, QUE VEUX-TU ?'},
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
      /* [4] avec le code du Pisteur « Odette est sous l'église ». (17 novembre, étape 3 du nouveau fil, Romain le 16 au soir : « Anselme
         refuse ») il dit non, et pourquoi le plan de la nuit passe par lui : la seule entrée, c'est sa grille, et sa clé est à sa ceinture */
      {q:'Odette est sous l\'église ! Vous nous ouvrez la grille ?', g:'h', moments:AN_, besoin:[{code:'info:crypte_fermee'}],
        a:'ODETTE, LÀ-DESSOUS ? JAMAIS JE NE PRÊTE MA CLÉ ! C\'EST DANGEREUX, ET C\'EST INTERDIT. LA SEULE ENTRÉE, C\'EST MA GRILLE, ET MA CLÉ NE QUITTE JAMAIS MA CEINTURE !',
        note:'Anselme : « Jamais je ne prête ma clé ! » La seule entrée, c\'est sa grille, et sa clé ne quitte jamais sa ceinture.'},
      /* [5] le grand dialogue (E.grands.cle), la nuit, quand il monte sonner l'ouverture de la fête. Il ne s'ouvre que quand tout est prêt
         (Romain : « pour Anselme, il faut débloquer pas mal de choses ») : l'aveu de Mélusine (démasquée l'après-midi, ou le filet de la
         fête), le code « La crypte est fermée », et tout demandé à Anselme, à Basile et à Silas. */
      {q:'Anselme, je voudrais vous demander quelque chose…', g:'r', moments:N_, grand:'cle', oblige:true,
        /* (17 novembre, 22 h 08, Romain : « le Barde doit d'abord aller chercher les tenues de combat chez Mélusine, avant de parler à Anselme ») il faut
           qu'il ait pris les tenues (fete:don:melusine) : le reste de la nuit ne bouge pas */
        besoin:[{et:[{ou:[{vu:'verite:melusine:4'}, {vu:'fete:filet:melusine'}]}, {vu:'fete:don:melusine'}, {code:'info:crypte_fermee'}, {toutDit:['anselme', 'basile', 'silas']}]}]}
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
      {q:'Pourquoi êtes-vous devenu garde ?', g:'r', moments:A_, a:'Petit, je me suis perdu trois jours dans la brume. Le père d\'Anselme m\'a retrouvé en sonnant toute la nuit. Anselme sonne comme lui : les yeux fermés, pour compter les coups.',
        note:'Silas : petit, il s\'est perdu trois jours dans la brume. Le père d\'Anselme l\'a retrouvé en sonnant toute la nuit. Anselme sonne comme lui : les yeux fermés, pour compter les coups.'}
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
  /* (16 novembre) les pierres du Sage : sa poche, sous les plans de son Grand Livre, et « Les objets magiques » (pierres.js ; les plans où
     on les pose : E.plansPierre, écrit par pierres.js). La pierre de Tim vient de l'enquête 2 : il l'a toujours sur lui. */
  pierres:[
    {id:'tim', nom:'La pierre de Tim', t:'Tim l\'avait ramassée au fond du trou du Vieux Chêne, devant une porte couverte de runes. Tu ne t\'en sépares plus. Elle est froide… presque toujours.'},
    /* (17 novembre, étape 4) la pierre de rune : le Pisteur la trouve là-dessous, la nuit (le code du donjon « rune:lumiere », descente.js :
       P.vus['donjon:rune']) ; elle se pose sur le vieux plan d'Odette, comme la pierre de Tim sur le plan de la maison */
    {id:'rune', nom:'La pierre de rune', si:[{vu:'donjon:rune'}], t:'Le Pisteur l\'a trouvée parmi les éboulis, sous la ville : une pierre gravée, tiède comme un petit soleil. Elle réveille l\'encre que les vieux plans cachent.'}
  ],
  /* les plans où une pierre se pose : la pierre qu'il attend, et la page du Grand Livre où il est (les dessins et les phrases : pierres.js).
     Ce que ça donne : le fait « pierre:<plan> » (P.vus), que le vérificateur connaît (tools/verif-e3.js). */
  plansPierre:{
    maison:{pierre:'tim', page:'papier'},
    vieuxplan:{pierre:'rune', page:'vieuxplan'}
  },
  absentTexte:{odette:'Odette n\'est pas chez elle. Le maire dit qu\'elle est chez sa sœur…'},
  absentPourTous:true,   /* (le Barde, lui, entre chez Odette pour poser la canne : pnj.voisin, à tous les moments depuis le 12 novembre au soir) */
  /* ---------- Le Grand Livre du Sage (livre.js ; E3-actions-des-roles.md §3, étape 3) ---------- */
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'},
    /* dès le matin : L'HERBIER (Romain, 12 novembre, 12 h 52 : « uniquement de plantes, là où elles sont, et à quel moment de la journée on peut les
       cueillir » ; « je ne veux pas qu'il parle de donjon »). Une planche par plante : où elle vit pour de vrai, UN INDICE (plus l'endroit précis
       depuis 15 h 37 : « il faut que ça soit un jeu de recherche », Bible §13.28), le moment. Tout vient de D.PLANTES (donnees.js) ; la page est
       dessinée par cueillette.js (M.herbierHTML). Plus de code : le Sage lit à voix haute, l'Alchimiste cherche sur sa carte. */
    /* (17 novembre) c'est « le vieil herbier » qu'Iris prête au Barde (plus « l'herbier des Fondateurs », qui était là dès le matin) */
    {id:'herbier', titre:'Le vieil herbier', ic:'🌿', type:'herbier', visibleSi:[{code:'obj:herbier'}, {moment:'nuit'}],
      t:'Le vieil herbier d\'Iris : sept plantes séchées, très anciennes. Sous chacune, quelqu\'un a laissé un indice, et le moment de la cueillir. Lis-les à voix haute à l\'Alchimiste : à vous de deviner où chercher !'},
    /* (13 novembre) la potion de vérité se prépare encore à l'enquête 3 : sa recette secrète, à dicter à l'Alchimiste s'il ne l'a pas déjà
       dans son grimoire (comme à l'enquête 2) */
    {id:'recettes', titre:'Les recettes', ic:'🧪',
      recette:'verite', t:'Potion de vérité, pour faire avouer un menteur : ' + D3.texteEtapes('verite') + '.',
      note:'Recette de la potion de vérité : ' + D3.texteEtapes('verite') + '.'},
    /* LE LIVRE D'OR DE LA FÊTE (Romain, 13 novembre : « l'Alchimiste ne le trouvait pas ; directement dans le Grand Livre du Sage. Le
       matin, des signatures, des petits mots pour Odette selon le caractère de chacun, et : tout le monde n'a pas encore signé.
       L'après-midi, un gros bouton jaune : tout le monde a signé, donne ce livre à l'Alchimiste »). La page : ecritures.js
       (M.livreDorHTML) ; les mots et les écritures : ecritures-donnees.js (les mêmes qu'au labo). quand : le bouton n'existe que
       l'après-midi et la nuit (moteur-actions.js, « ouvrir-page »). */
    /* (17 novembre, le nouveau fil ; Romain, 16 novembre, 22 h 14 : « c'est le Sage qui compare les écritures, avec une petite interface
       d'analyse dans le Grand Livre, qui donne un code au Barde ») Le Livre d'or n'existe dans le livre qu'une fois confié par le maire
       (le tableau rendu, l'après-midi). « Comparer les écritures » : avec la lettre ET le Livre d'or — la lettre en haut, les douze mots
       du village dessous ; le Sage désigne une main, autant de fois qu'il veut (Romain, 17 novembre, 7 h 10 : plus d'essais comptés). Mélusine : le code « L'écriture de Mélusine » pour le
       Barde, qui rouvre sa porte. Pas fait : le filet de la fête, la nuit. (ecritures.js : M.livreDorHTML, M.quiEcritHTML) */
    {id:'livredor', titre:'Le Livre d\'or de la fête', ic:'📖', type:'livredor', visibleSi:[{vu:'sage:mairie:rendu'}, {vu:'sage:mairie:sanstableau'}]},
    {id:'quiecrit', titre:'Comparer les écritures', ic:'🔍', visibleSi:[{et:[{code:'obj:lettre'}, {ou:[{vu:'sage:mairie:rendu'}, {vu:'sage:mairie:sanstableau'}]}]}],
      get html(){ return window.M && window.M.quiEcritHTML ? window.M.quiEcritHTML() : ''; }},
    /* LA LETTRE et LE CARNET (Romain, 13 novembre : les pages « Une drôle de lettre », « La lettre et le carnet » et « Qui a écrit la
       lettre ? » sont retirées — « ça donne la solution »). À la place, deux pages qui n'apparaissent qu'avec le code du Barde
       (visibleSi, livre.js) et qui ne concluent rien : la vraie lettre, écrite « à la manière d'Odette », et le carnet, écrit de sa
       main, avec ses sept chats (« la description, un petit dessin de chaque chat, et leurs traces de pas » : chats.js). Le Sage
       compare les deux écritures de ses yeux, et dit au Pisteur, à voix haute, quelle patte suivre. Plus de code « six doigts ». */
    {id:'vraielettre', titre:'La lettre d\'Odette', ic:'✉️', visibleSi:[{code:'obj:lettre'}],
      get html(){ return window.M && window.M.vraieLettreHTML ? window.M.vraieLettreHTML() : ''; }},
    {id:'carnet', titre:'Le carnet d\'Odette', ic:'📓', visibleSi:[{code:'obj:carnet'}],
      get html(){ return window.M && window.M.carnetOdetteHTML ? window.M.carnetOdetteHTML() : ''; }},
    /* LE SECRET D'ODETTE (16 novembre ; il remplace « Le plan des Fondateurs », qui sortait de nulle part — Romain : « il faut que quelqu'un
       l'apporte »). pierres.js :
       · le papier d'Odette (le voisin → le Barde → un code objet) : l'alphabet secret, sans minuteur ; au dos, le plan de sa maison, où
         le Sage promène la pierre de Tim (sa poche) : près du soleil, des mots s'allument (« soleil de l'après-midi ») ; sur les dalles,
         elles s'éclairent. Aucun signe, aucun ordre (19 novembre) : l'ordre, c'est le soleil qui le montre au Pisteur, l'après-midi ;
       · le vieux plan d'Odette (la cachette → le Pisteur → un code objet) : des couloirs sans nom, une petite cloche au départ, des
         signes qu'on ne sait pas lire. Il attend une autre pierre : la nuit.
       · le tableau d'Odette, une fois peint : on peut le revoir (le chat de pierre sur la fenêtre, le rayon, les runes de la pierre). */
    {id:'tableauodette', titre:'Le tableau d\'Odette', ic:'🖼️', visibleSi:[{vu:'sage:mairie:tableau'}],
      get html(){ return window.M && window.M.tableauOdetteHTML ? window.M.tableauOdetteHTML() : ''; }},
    {id:'papier', titre:'Le papier d\'Odette', ic:'📜', visibleSi:[{code:'obj:papier_odette'}], mj:'alphabet', params:{message:'LE CHAT QUI DORT TE MONTRERA LE CHEMIN', sansTemps:true}, bouton:'Déchiffrer le papier',
      ouvrePartiel:true, partiel:true,
      avant:'Le papier que le voisin gardait pour Odette, plié en quatre. En haut, une ligne qu\'on peut lire : « Quand le soleil de l\'après-midi entrera chez moi… » La suite est écrite en petits signes.',
      t:'« Quand le soleil de l\'après-midi entrera chez moi, le chat qui dort te montrera le chemin. » Et au dos du papier, Odette a dessiné sa maison…',
      note:'Le papier d\'Odette : « Quand le soleil de l\'après-midi entrera chez moi, le chat qui dort te montrera le chemin. » Au dos, le plan de sa maison.',
      rate:'Les signes dansent devant tes yeux…',
      tPartiel:'Tu reconnais quand même quelques mots : « le chat qui dort », « le chemin ». Et au dos du papier, Odette a dessiné sa maison.',
      get html(){ return window.M && window.M.papierOdetteHTML ? window.M.papierOdetteHTML() : ''; }},
    /* (17 novembre, étape 4) la nuit, c'est ici que le plan se regarde de tout près (pierres.js, M.vieuxPlanHTML) ; le filet : sans la
       cachette d'Odette, la page arrive avec le code du départ (« On va dans la crypte ») */
    {id:'vieuxplan', ic:'🗺️', visibleSi:[{code:'obj:vieux_plan'}, {et:[{code:'info:on_descend'}, {moment:'nuit'}]}],
      /* (le filet : sans la cachette d'Odette, ce n'est pas « le vieux plan d'Odette » mais celui que le Sage a recopié en haut de l'escalier) */
      get titre(){ var Mx = typeof window !== 'undefined' && window.M, Px = Mx && Mx.P ? Mx.P() : null; return Px && Px.recus && !Px.recus['obj:vieux_plan'] ? 'Le plan gravé dans la pierre' : 'Le vieux plan d\'Odette'; },
      get html(){ return window.M && window.M.vieuxPlanHTML ? window.M.vieuxPlanHTML() : ''; }},
    /* LA TENUE DE COMBAT (Romain, 13 novembre) : avec le code du Pisteur « On va dans la crypte ». Le Sage y retrouve son héros en
       tenue et son code d'allure pour le Pisteur (descente.js, M.tenueHTML) — la fenêtre s'ouvre toute seule quand il tape le code. */
    {id:'tenue', titre:'Ma tenue de combat', ic:'🛡️', visibleSi:[{code:'info:on_descend'}, {code:'obj:tenues'}],   /* (17 novembre) ou avec les tenues de Mélusine : sans le code d'allure, qui attend le départ */
      get html(){ return window.M && window.M.tenueHTML ? window.M.tenueHTML(true) : ''; }},
    /* LE DONJON DANS LE GRAND LIVRE (Romain, 13 novembre : « le carnet de l'aventurier, le plan, les pages de sauvegarde, le plan déchiré :
       des pages du Grand Livre, pas une interface à part » ; descente.js).
       · le plan des souterrains, la nuit : il s'ouvre en grand par-dessus le jeu (« Regarder le plan ») ;
       · les pages de sauvegarde : avec le code du départ (« elles apparaissent quand le Pisteur donne le code du départ ») ; deux pages,
         une de plus avec le code « Une page blanche » ; un code utilisé se barre ;
       · le carnet de l'aventurier : avec son code (chapeau, arbre, poisson), ou page par page avec les codes d'étude des monstres. */
    /* (17 novembre, étape 4 du nouveau fil : « rien n'arrive par magie dans le Grand Livre ») PLUS DE PAGE « Le plan des souterrains », qui
       arrivait toute seule la nuit (et disait dès le matin « il y aurait de vieux souterrains ») : le plan, c'est le vieux plan d'Odette */
    {id:'sauvegardes', titre:'Les pages de sauvegarde', ic:'📜', visibleSi:[{code:'info:on_descend'}],
      get html(){ return window.M && window.M.sauvegardesHTML ? window.M.sauvegardesHTML() : ''; }},
    {id:'aventurier', titre:'Le carnet de l\'aventurier', ic:'📓', visibleSi:[{vu:'donjon:carnet'}],
      get html(){ return window.M && window.M.carnetAventurierHTML ? window.M.carnetAventurierHTML() : ''; }}
    /* (17 novembre, étape 4 ; Romain, 16 novembre : « C'est quoi la porte des Fondateurs ? On s'en fout ») PLUS DE PAGE « La porte des
       Fondateurs » : le code du Pisteur, « Odette est derrière la porte », dit tout ce qu'il y a à dire (sa fenêtre « Tu as reçu »). */
  ],
  /* ---------- La fin : dans la crypte, le maire, la bague, le cachot (décidée par Romain le 13 novembre, 18 h 06 ; Bible §13.33) ----------
     La même pour toute l'équipe (plus de variante : Léo est toujours là, battu). L'ordre : Léo battu parle (dans le donjon) ; « Place
     aux accusations ! » ; les trois accusations du Sage ; puis, sur toutes les tablettes (le code de fin) : le maire descend avec
     Silas et les gardes, la bague, « Gardes ! Attrapez-les ! », le cachot — « Fin de l'enquête 3… mais ce n'est que le début. »
     Odette n'est PAS délivrée. Léo ne dit pas qui est vraiment le maire.
     (finVariante : toujours 2 — Léo est là, à terre, dans l'image où le maire lève sa lanterne ; illus-fin.js, e3-leo.) */
  finVariante:function(){ return 2; },
  /* Le concours de gâteaux (Romain, 12 novembre, 21 h 34 : « que tout le monde fasse un gâteau, et après on élit le plus beau » ;
     dix minutes ; une icône sur la carte ; « attends tes amis, commencez en même temps ») : le Barde, le Pisteur et le Sage font le leur
     à la boulangerie, le matin ou l'après-midi, en même temps que l'Alchimiste (son point « Le gâteau de la fête », plus haut).
     On ne le rate jamais ; l'élection se fait autour de la table, pas dans le jeu. */
  /* (Romain, 13 novembre) « ← Plus tard » dans la fenêtre d'avant (plusTard) ; à la fin, le vote : chacun touche sa note sur 20, puis sa
     place — 5, 4, 3 ou 2 pièces d'or (le mini-jeu les donne : res.or) ; et dès qu'on a rendu sa mission au maire, le gâteau disparaît
     de la carte (cacheSi). */
  bonus:['barde', 'pisteur', 'sage'].map(function(r){
    var rendu = {barde:[{vu:'marche:rendu'}], pisteur:[{vu:'pisteur:mairie:mission'}], sage:[{vu:'sage:mairie:rendu'}, {vu:'sage:mairie:sanstableau'}]}[r];
    return {id:'gateau_' + r, role:r, lieu:'boulangerie', moments:['matin', 'apresmidi'], mj:'gateau', ic:'🎂', label:'Le gâteau', or:3,
      plusTard:true, cacheSi:rendu, gain:'De 2 à 5 pièces d\'or, selon ta place au concours',
      titre:'Le concours de gâteaux',
      t:'Gaspard lance un concours : chacun fait son gâteau pour la fête !',
      avant:'Concours de gâteaux chez Gaspard ! Attends tes amis : commencez vos gâteaux en même temps, ce sera plus rigolo. Dix minutes… puis élisez le plus beau !',
      bouton:'🎂 Faire le gâteau',
      fin:'Ton gâteau part sur la grande table de la fête.'};
  }),
  fin:{
    /* (15 novembre, Bible §13.45) la cinématique du maire : un film (jeu/cine, « finMaire ») joué tout seul au début de la fin, sur
       chaque tablette ; s'il est vu, on saute les quatre images qu'il remplace (jusqu'au cachot). S'il n'arrive pas (pas d'internet),
       les quatre images restent. */
    film:{nom:'finMaire', remplace:4},
    slides:[
      'Dans la crypte des Fondateurs, des pas descendent l\'escalier. Des lanternes : c\'est le maire, avec Silas et deux gardes.',
      'Le maire lève sa lanterne. « Que s\'est-il passé ici ? Léo ! Qu\'avez-vous fait à Léo ? »',
      'Lentement, il retire ses gants gris. À son doigt brille une bague en argent, à tête de corbeau. « Vous êtes allés trop loin. Beaucoup trop loin. »',
      'Silas en reste bouche bée : « Monsieur le maire… ? » Le maire ne le regarde même pas. « Gardes ! Attrapez-les ! »',
      /* (codes:true : sous l'image, chacun montre son code d'apparence et tape ceux de ses amis — les quatre héros apparaissent) */
      {img:'prison', plume:true, codes:true, t:'Vous voilà tous les quatre au cachot de la mairie. Devant la grille, une plume noire se pose, sans un bruit…'},
      '<b>Fin de l\'enquête 3</b>… mais ce n\'est que le début.'
    ],
    illus:['e3-minuit', 'e3-leo', 'e3-bague', 'e3-gardes'],
    calepin:[
      {ic:'✍️', t:'Mélusine a écrit la fausse lettre d\'Odette, forcée par un homme en cape. C\'est elle qui l\'a déposée à la mairie, déguisée en Odette.'},
      {ic:'🚪', t:'Odette est vivante, enfermée sous le clocher, derrière la porte aux quatre signes : l\'œil, le chaudron, la lyre et l\'étoile. Elle y est toujours.'},
      {ic:'🧑', t:'L\'homme en cape, c\'était Léo, l\'apprenti du meunier. Il n\'a jamais voulu être meunier : le maire lui a promis une vraie place.'},
      {ic:'🎩', t:'Léo l\'a dit : c\'est le maire qui a tout préparé, depuis le début. La rivière rouge, les fumigènes, la lettre. Odette, ce n\'était pas prévu : elle a été trop curieuse.'},
      {ic:'🏙️', t:'Le maire descend souvent, tout seul, encore plus bas. Là-dessous, il y aurait une ville entière, sous Brumeval. Personne n\'y va. Jamais.'},
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
    /* (13 novembre) l'écriture ne laisse plus que deux suspectes, Mélusine et Margot ; c'est l'aveu qui désigne Mélusine */
    /* (17 novembre) l'écriture, comparée par le Sage dans son Grand Livre (la lettre et le Livre d'or) : il désigne Mélusine */
    {sources:['sage:ecriture'], qui:['margot', 'iris', 'victor', 'fortune', 'gaspard', 'tim', 'basile', 'silas', 'levoisin', 'farinel', 'leo', 'anselme', 'grosbec']},
    {sources:[['barde:melusine:4:verite', 'barde:fete:melusine']], qui:['margot', 'iris', 'victor', 'fortune', 'gaspard', 'tim', 'basile', 'silas', 'levoisin', 'farinel', 'leo', 'anselme', 'grosbec']},
    /* (16 novembre, Bible §13.52) les empreintes du jardin d'Iris (le Pisteur) et la taille des pieds dans le registre (le Sage) :
       3 carreaux — seuls Tim et Mélusine. Avec l'écriture (Mélusine ou Margot), il ne reste que Mélusine, avant même son aveu.
       (16 novembre, 15 h, §13.54) Ce qui relie ces empreintes à la lettre : l'encre — celle d'Iris et celle de la lettre, comparées au
       labo (l'Alchimiste, avec le flacon que le Barde a reçu d'Iris). Sans elle, les empreintes ne disent que « quelqu'un a volé de l'encre ». */
    {sources:['pisteur:herboristerie:jardin', 'sage:page:habitants', 'alchimiste:analyse:encre_iris', 'alchimiste:analyse:lettre'], qui:['margot', 'iris', 'victor', 'fortune', 'gaspard', 'basile', 'silas', 'levoisin', 'farinel', 'leo', 'anselme', 'grosbec']},
    /* OÙ : la porte aux quatre signes, au fond du donjon (le Pisteur, avec les potions de l'Alchimiste, et la clé ou le puits du Barde) */
    {sources:['donjon:fini'], ou:['puits', 'moulin', 'chene', 'soeur', 'mairie', 'taverne', 'lavoir', 'foret', 'herboristerie']},
    /* QUI SOUS LA CAPE (13 novembre) : au fond du donjon, Léo arrache sa cape */
    {sources:['donjon:fini'], quoi:['farinel', 'silas', 'grosbec', 'fortune', 'victor', 'basile', 'gaspard', 'anselme', 'levoisin']}
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
