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
var M_ = ['matin'], A_ = ['apresmidi'], N_ = ['nuit'];

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
    alchimiste:'Fais le haut du gâteau de la fête, chez Gaspard.',
    sage:'Peins le tableau d\'Odette et de ses chats.'},
  missions:{
    pisteur:'Accroche les banderoles de la fête et rattrape l\'oie de Gaspard. Et ouvre l\'œil : cette lettre est bizarre…',
    alchimiste:'Fais le haut du gâteau de la fête, chez Gaspard. Puis cueille les plantes de la vallée : cette nuit, l\'équipe aura besoin de tes potions.',
    barde:'Achète les fleurs de la fête avec les pièces du maire. Puis interroge le village : chacun te répond à deux questions, pas plus. Choisis bien !',
    sage:'Peins le tableau d\'Odette et de ses chats. Lis ton Grand Livre à l\'équipe, donne le code de chaque moment, et accuse quand toute l\'équipe est d\'accord.'
  },
  /* Les missions de base, en haut du Carnet (mission.js). Celles du Pisteur, de l'Alchimiste et du Sage arrivent avec leurs étapes (3 à 5). */
  etapes:{
    barde:[
      {ic:'💐', t:'Le maire t\'a donné 10 pièces : rapporte-lui au moins 10 bouquets pour la fête.', fait:[{vu:'marche:dix'}]},
      {ic:'🗣️', t:'Chaque villageois répond à deux questions par moment, pas plus : choisis bien !', fait:[{bavard:4}]},
      {ic:'🦯', t:'Odette demande qu\'on rapporte sa canne chez elle, au 2, rue des Lanternes.', fait:[{vu:'barde:voisin:0'}]},
      /* (étapes 6 et 7) la nuit (des:2 : ces missions n'arrivent dans le Carnet qu'à la nuit, mission.js) */
      {des:2, ic:'🗝️', t:'La nuit : la crypte est fermée à clé. Va voir Anselme, au clocher.', fait:[{vu:'grand:cle:fini'}]},
      {des:2, ic:'🎉', t:'Pendant que les trois autres sont sous la terre : reste à la fête, parle à Anselme et au maire. Tu peux les aider d\'en haut !', fait:[{et:[{vu:'grand:gm:fini'}, {vu:'grand:retenir:fini'}]}]},
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
      {ic:'🌿', t:'Cueille les plantes de la vallée : il y en a sept. Pour les plus rares, demande au Sage son herbier.',
        fait:[{et:[{vu:'plante:oseille'}, {vu:'plante:souci'}, {vu:'plante:melisse'}, {vu:'plante:lin'}, {vu:'plante:lycopode'}, {vu:'plante:vesse'}, {vu:'plante:gui'}]}]},
      {ic:'✉️', t:'Analyse la lettre d\'Odette sur ta paillasse, quand l\'équipe l\'aura.', fait:[{analyse:'lettre'}]},
      {ic:'🧪', t:'Prépare les sept potions de la nuit, sur ton établi.',
        fait:[{et:[{vu:'fiole:feu'}, {vu:'fiole:fumigene'}, {vu:'fiole:huile'}, {vu:'fiole:colle'}, {vu:'fiole:acide'}, {vu:'fiole:baume'}, {vu:'fiole:coeur'}]}]},
      {des:2, ic:'🎒', t:'La nuit : donne le code de tes sept potions au Pisteur, puis ouvre le chaudron du donjon.', fait:[{vu:'donjon:ouvert:alchimiste'}]},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a écrit cette lettre, et OÙ est Odette ?'}
    ],
    sage:[
      {ic:'👥', t:'Lis « Les habitants » à toute l\'équipe.', fait:[{lu:'habitants'}]},
      {ic:'🖼️', t:'Peins le tableau d\'Odette et de ses chats, à la mairie.', fait:[{fini:'sage:mairie:tableau'}]},
      {ic:'🌿', t:'Lis l\'herbier des Fondateurs à l\'Alchimiste, dans ton Grand Livre.', fait:[{lu:'herbier'}]},
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
    t:'Un homme en cape a dicté la lettre, et il a enfermé Odette. Depuis la Fête des Lanternes, quelqu\'un se cache derrière tout ça… Parlez-en ensemble, puis désignez le Corbeau ! Cette question ne coûte aucun cœur.',
    /* (étape 7) secret : le jeu ne dit ni « bravo » ni « raté » (même phrase, même bruit) ; la réponse est gardée pour la suite de la saison */
    secret:'C\'est écrit dans le Grand Livre, à l\'encre secrète. As-tu vu juste ? Regardez bien la fin de l\'histoire…'},

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

  /* ---------- Les grands dialogues du Barde (grands.js ; Bible § 13.8 ; E3-dialogues-et-trame.md §3.1, §4.1, §4.2, §4.7) ----------
     On y entre par une question (q.grand), sauf Léo (le code « Léo attrapé » du Pisteur). 4 choix par étape, tous polis ; un seul essai.
     Les questions à grand dialogue ne comptent pas dans les 2 questions par visite (sinon, le Barde pouvait se priver de la clé d'Anselme).
     Un choix : q (ce que dit le Barde), r (sa réplique ; avec « » quand elle mêle paroles et récit), n (un petit récit après), bon, piege.
     rate : la réplique d'un mauvais choix (après r) ; toujours : dit en partant, quoi qu'il arrive ; fermeVisite : un mauvais choix ferme
     la porte jusqu'au moment suivant ; chances : 2 = une deuxième chance (la Grosse Marie), les mauvaises réponses essayées disparaissent. */
  grands:{
    lettre:{pnj:'grosbec', ic:'✉️', fermeVisite:true,
      rate:'Bien, bien… J\'ai beaucoup à faire. Revenez plus tard.',
      toujours:'Et ce soir, tout le monde sur la place jusqu\'à minuit !',
      etapes:[
        {t:'Oui ?', choix:[
          {q:'Quelle belle fête vous préparez pour Odette !', r:'N\'est-ce pas ? Les lampions, le gâteau, les fleurs… Que puis-je pour vous ?', bon:true},
          {q:'Quel beau discours vous avez fait ce matin !'},
          {q:'Votre mairie est vraiment très bien rangée !'},
          {q:'Votre chapeau neuf vous va très bien !'}]},
        {t:'Que puis-je pour vous ?', choix:[
          {q:'Les enfants voudraient voir l\'écriture d\'Odette, pour être rassurés.'},
          {q:'Je voudrais recopier ses mots, pour les chanter à la fête.'},
          {q:'Certains disent que vous gardez la lettre pour vous… Moi, je suis sûr que c\'est faux !', r:'Bien sûr que c\'est faux ! Tenez, la voilà… Mais vous me la rendez quand ?', bon:true},
          {q:'Odette est ma grande amie : j\'aimerais lire ses mots moi-même.'}]},
        {t:'Mais vous me la rendez quand ?', choix:[
          {q:'Je vous la rapporte avant ce soir, promis.', r:'Avant ce soir, c\'est bien compris ?', bon:true},
          {q:'Demain matin, à la première heure.'},
          {q:'Le Sage la rangera précieusement dans son Grand Livre.'},
          /* le piège : le Barde repart avec une copie de sa propre écriture (le Sage : « C'est ton écriture à toi, ça ! ») */
          {q:'Je peux la recopier ici, devant vous ?', r:'Mais bien sûr, recopiez donc !', piege:true}]}
      ],
      reussi:{bouton:'✉️ Prendre la lettre', titre:'Le maire te prête la lettre', t:'Tu tiens la lettre d\'Odette. Le maire te regarde partir… Il faudra la lui rendre avant ce soir !', code:'obj:lettre'},
      piege:{bouton:'📝 Ranger ma copie', titre:'Ta copie de la lettre', t:'Tu recopies la lettre, mot pour mot, sous l\'œil du maire. Le maire range l\'original dans son grand coffre.', code:'info:copie'},
      resume:{ok:'Le maire t\'a prêté la lettre d\'Odette.', piege:'Tu as recopié la lettre, devant le maire.', rate:'Le maire n\'a pas voulu te prêter la lettre.'}},
    /* la nuit, au clocher : la clé d'Anselme (raté : Tim montre le vieux puits) */
    cle:{pnj:'anselme', ic:'🔔', fermeVisite:true,
      rate:'Bon, je monte sonner, moi. Bonne fête !',
      etapes:[
        {t:'Hein ? Ah, le Barde ! Qu\'est-ce que tu me veux ?', choix:[
          {q:'Une toute petite question, ça ne prendra qu\'une seconde !', r:'UNE SECONDE CLOCHE ? La Grosse Marie suffit bien !'},
          {q:'Pardon de vous déranger, Monsieur Anselme…', r:'UN HARENG ? Je n\'ai pas faim, mon petit !'},
          {q:'BON-SOIR, AN-SEL-ME ! J\'AI TOUT MON TEMPS. JE PEUX VOUS PAR-LER ?', r:'Enfin quelqu\'un qui parle comme il faut ! Alors, qu\'est-ce qui t\'amène ?', bon:true},
          {q:'Vite, Anselme, minuit approche !', r:'UNE VIS ? Demande à Basile !'}]},
        {t:'Alors, qu\'est-ce qui t\'amène ?', choix:[
          {q:'Je vous apporte un morceau du gâteau de Gaspard ?', r:'UN CHAPEAU ? Il fait des chapeaux, le boulanger ?'},
          {q:'Je pourrais jeter un œil à la crypte ?', r:'UNE CRÊPE ? À cette heure-ci ?'},
          {q:'LA GROSSE MARIE EST SI LOURDE… JE PEUX VOUS AIDER À LA SONNER ?', r:'M\'aider ? Personne ne me l\'a proposé depuis des années… Dis-moi pourquoi, ce soir.', bon:true},
          {q:'Vous êtes en pleine forme, ce soir !', r:'EN PLEINE FORÊT ? Je suis au clocher, voyons !'}]},
        {t:'Dis-moi pourquoi, ce soir.', choix:[
          {q:'Parce que c\'est la fête, et que j\'adore les cloches !', r:'TU ADORES LES BROCHES ? Demande à Mélusine !'},
          {q:'Parce que le maire veut que tout soit parfait.', r:'LE MAIRE VEUT UNE PAIRE ? De chaussettes ?'},
          {q:'VOTRE PÈRE A SONNÉ TOUTE UNE NUIT POUR RAMENER SILAS. CE SOIR, ODETTE AUSSI EST PERDUE…', r:'Il essuie une larme. « Alors on la sonne pour Odette. Monte, mon petit ! »', bon:true},
          {q:'J\'aimerais apprendre le métier de sonneur.', r:'DE SAUTEUR ? Je suis bien trop vieux pour sauter !'}]}
      ],
      reussi:{bouton:'🔔 Monter avec Anselme', titre:'La clé est au clou', t:'Anselme pend sa clé au clou. Vous tirez la corde ensemble : DONG ! DONG ! Il ferme les yeux et compte les coups…', code:'info:cle_clou'},
      echec:{bouton:'🏠 Qui m\'appelle ?', qui:'tim', titre:'Tim, depuis les toits', t:'« Psst, Barde ! Moustache vient de filer dans le vieux puits, entre les barreaux ! »', code:'info:vieux_puits'},
      resume:{ok:'Anselme a pendu sa clé au clou.', rate:'Anselme est monté sonner, la clé à la ceinture.'}},
    /* la nuit, au clocher, pendant le donjon : faire sonner la Grosse Marie avant minuit (une deuxième chance) */
    gm:{pnj:'anselme', ic:'🔔', chances:2,
      rate:'Bon, tu m\'embrouilles. À minuit, comme prévu !',
      etapes:[
        {t:'LA GROSSE MARIE ? À minuit pile, ordre du maire ! Pourquoi maintenant ?', choix:[
          {q:'Parce que la fête s\'ennuie un peu !', r:'LA FÊTE S\'ENNUIE ? Qu\'elle danse !'},
          {q:'LA BRUME MONTE, ANSELME ! VOTRE PÈRE DISAIT : QUAND ELLE S\'ÉPAISSIT, SONNE LA GROSSE MARIE.', r:'Il regarde par la lucarne. « Ma parole… on ne voit plus le moulin. Mais le maire va être furieux ! »', bon:true},
          {q:'Pour réveiller Farinel, qui dort sur le buffet !', r:'DE LA FARINE ? J\'en ai plein les poches !'},
          {q:'Parce que minuit est passé !', r:'PASSÉ ? Mon horloge dit dix heures, mon petit !'}]},
        {t:'Mais le maire va être furieux !', choix:[
          {q:'Le maire est d\'accord : il me l\'a dit lui-même !', r:'LE MAIRE ? Il m\'a dit minuit pile trois fois ce soir !'},
          {q:'LE VIEUX RÈGLEMENT : QUAND LA BRUME MONTE, LE SONNEUR SONNE. MÊME LE MAIRE N\'Y PEUT RIEN.', r:'Le vieux règlement… Silas te l\'a dit, hein ? C\'est vrai. Mais toi, pourquoi tu y tiens tant ?', bon:true},
          {q:'Le maire ne s\'en rendra même pas compte.', r:'PAS COMPTE ? Tout le village va l\'entendre !'},
          {q:'On s\'en moque, du maire !', r:'ON NE SE MOQUE PAS DU MAIRE, MON PETIT !'}]},
        {t:'Mais toi, pourquoi tu y tiens tant ?', choix:[
          {q:'Pour que la fête soit encore plus belle !', r:'ELLE EST DÉJÀ BELLE, LA FÊTE !'},
          {q:'Parce que j\'adore votre cloche !', r:'TU ADORES LE COCHON ? Moi aussi, en rôti !'},
          {q:'MES AMIS SONT SOUS LA TERRE, DANS LA BRUME. LA GROSSE MARIE PEUT LES PROTÉGER.', r:'Anselme pâlit. « Sous la terre ?! » Il crache dans ses mains. « Alors on sonne. Fort. Très fort ! »', bon:true},
          {q:'C\'est un secret, je ne peux rien dire.', r:'UN SECRET ? Pas de secret avec Anselme !'}]}
      ],
      reussi:{bouton:'🔔 Sonner !', titre:'La Grosse Marie', t:'DONG… DONG… La Grosse Marie fait trembler tout le village. Sous la terre, la brume recule.', code:'info:grosse_marie'},
      resume:{ok:'La Grosse Marie a sonné avant minuit !', rate:'Anselme n\'a pas voulu sonner la Grosse Marie.', encore:'Anselme n\'a pas voulu… pas encore. Tu peux revenir à la charge, une seule fois.'}},
    /* dans la crypte, à la fin du donjon (le code « Léo attrapé » du Pisteur) : Léo ment d'entrée (son signe est épinglé par Farinel) ;
       un mauvais choix : il se ferme, et on passe à la fin des étapes déjà réussies (fins[n]) */
    leo:{pnj:'leo', ic:'🧑',
      intro:'Le Pisteur a attrapé Léo dans la crypte ! Il tremble, sa lanterne à la main.',
      ment:{a:'Laissez-moi partir ! Je cherchais juste un chat perdu !', vrai:'Bon… je descends tous les soirs. On me l\'a demandé. Je ne peux pas dire qui.',
        noteVrai:'Léo a avoué : il descend dans la crypte tous les soirs. On le lui a demandé, mais il ne peut pas dire qui.'},
      etapes:[
        {t:'Qu\'est-ce que vous me voulez ?', choix:[
          {q:'Léo, tu vas tout nous dire, et tout de suite !', n:'Il croise les bras.'},
          {q:'Je mène l\'enquête sur la lettre d\'Odette.', r:'L\'enquête ?!', n:'Il devient tout blanc.'},
          {q:'Chut… personne ne va te faire de mal. Prends ton temps, Léo.', r:'Il s\'assoit à son tour. « … D\'accord. Qu\'est-ce que vous voulez savoir ? »', bon:true},
          {q:'Les gardes arrivent, Léo. Parle vite !', n:'Il regarde l\'escalier, muet.'}]},
        {t:'Qu\'est-ce que vous voulez savoir ?', choix:[
          {q:'Où est Odette ? Dis-le !', n:'Il baisse la tête.'},
          {q:'Je te donne une pièce d\'or si tu me dis tout.', r:'C\'est avec de l\'or qu\'on m\'a eu. Plus jamais.'},
          {q:'Odette t\'a appris à lire. Tu crois qu\'elle mérite d\'être enfermée ?', r:'Les larmes aux yeux : « Elle va bien, je lui apporte à manger tous les soirs. Mais si je parle, il le saura. »', bon:true},
          {q:'Tu sais que tu risques la prison, comme Bastien ?', n:'Il pâlit, muet.'}]},
        {t:'Si je parle, il le saura.', choix:[
          {q:'On ira tout raconter au maire : il te protégera.', r:'Au maire ?! Surtout pas !'},
          {q:'Personne ne saura jamais que c\'est toi qui as parlé. C\'est promis, Léo.', bon:true},
          {q:'Silas veille sur le village, tu ne risques rien.', r:'Silas ne voit jamais rien.'},
          {q:'Pars avec Fortuné, au-delà de la brume.', r:'Et laisser Odette toute seule ? Jamais.'}]}
      ],
      /* selon le nombre d'étapes réussies (la dernière, +10 pièces d'or : la seule réponse de plus de 30 mots, la révélation de l'enquête) */
      fins:[
        {t:'Il bondit, renverse la lanterne et file dans le noir. On entend ses grandes bottes s\'éloigner.'},
        {t:'« Elle est vivante. C\'est tout ce que je peux dire. » Il file dans le noir.', code:'info:leo_dit1'},
        {t:'« Elle est sous le clocher, je lui apporte à manger. Je ne dirai rien de plus. » Il reste assis, la tête dans les mains.', code:'info:leo_dit2'},
        {t:'« Elle est derrière la porte aux quatre signes. Je passe la soupe par une trappe : je n\'ai pas de clé. L\'homme en cape a une bague à tête de corbeau… et les clés de tout le village. »', or:10, code:'info:leo_dit3'}
      ],
      /* (étape 7) ce que Léo a dit part chez le Sage, par un code (fins[n].code) : il le note, et la scène finale s'en souvient
         sur toutes les tablettes (E.finVariante, plus bas) */
      apres:'Raconte à voix haute à ton équipe ce que Léo a dit. Puis le Sage accuse !',
      apresCode:'Raconte à voix haute à ton équipe ce que Léo a dit, et donne son code au Sage. Puis le Sage accuse !',
      apresRien:'Léo n\'a rien voulu dire. Raconte à ton équipe ce qui s\'est passé. Puis le Sage accuse !',
      titreCode:'Ce que Léo a dit',
      enfui:'Des pas descendent l\'escalier de la crypte. Léo blêmit, renverse sa lanterne et file dans le noir, sans un mot.'}
  },
  /* ---------- Retenir le maire (grands.js ; E3-dialogues-et-trame.md §4.4) : trois petits dialogues d'une étape, à la fête, pendant le donjon,
     au rythme du Barde (sans minuteur). Le premier dès que le dialogue de la clé est fini (le maire porte un « ! ») ; chacun des suivants
     après le précédent et une autre visite à la fête. Deux réussis : le code pour le Pisteur ; deux ratés : il s'éloigne (on s'arrête là).
     Le troisième : variante A si la Grosse Marie a sonné, sinon B. */
  retenir:{pnj:'grosbec', besoin:[{vu:'grand:cle:fini'}], n:2,
    dialogues:[
      {t:'Barde ! Je ne vois pas vos trois amis. Où sont-ils passés ?', choix:[
        {q:'Ils sont allés se coucher.', r:'Se coucher ? Personne ne part avant minuit ! Je vais voir ça…'},
        {q:'Ils aident Gaspard à porter le gâteau : sept étages, ça pèse !', r:'Ah ! Très bien, très bien. Ce gâteau sera magnifique.', bon:true},
        {q:'Je ne sais pas, Monsieur le maire.', r:'Vous ne savez pas ? Hmm…', n:'Il regarde vers le clocher.'},
        {q:'Ils sont au clocher, avec Anselme.', r:'AU CLOCHER ?!'}]},
      {t:'Je vais monter dire deux mots à Anselme. Rien ne doit rater, ce soir.', choix:[
        {q:'Monsieur le maire, tout le village réclame votre discours !', r:'Il redresse son chapeau. « Mon discours ? Bon… le village a besoin de moi. »', bon:true},
        {q:'Anselme dort, il ne faut pas le réveiller.', r:'Il dort ?! Alors il ne sonnera jamais minuit ! J\'y vais !'},
        {q:'Votre chapeau neuf est magnifique !', r:'Je le déteste, ce chapeau. Laissez-moi passer.'},
        {q:'Je viens avec vous !', r:'Non, non. Restez ici.', n:'Il part seul.'}]},
      /* A : la Grosse Marie a déjà sonné (P.vus['grand:gm'] === 'ok') ; B : pas encore */
      {
        A:{t:'La Grosse Marie ? Déjà ?! Qui a osé…', choix:[
          {q:'Le vieux règlement, Monsieur le maire : quand la brume monte, tout le monde reste sur la place.', r:'Silas : « Article premier ! » Le maire serre les dents. « … Bien. Restons. »', bon:true},
          {q:'C\'est sûrement le vent.', r:'Le vent ne sonne pas les cloches !'},
          {q:'C\'est moi qui l\'ai demandé à Anselme.', r:'VOUS ?!'},
          {q:'C\'est pour la fête ! C\'est joli, non ?', r:'Joli ? Il fallait attendre minuit !'}]},
        B:{t:'Il est presque minuit. Je dois aller vérifier quelque chose…', choix:[
          {q:'Et le gâteau ? Il se coupe à minuit pile, et c\'est vous qui le coupez !', r:'Le gâteau ! Mais oui, mais oui… Je ne bouge pas.', bon:true},
          {q:'Allez-y, je surveille la fête pour vous.', r:'Merci, Barde.', n:'Il s\'éloigne.'},
          {q:'Il n\'est pas encore minuit !', r:'Justement.', n:'Il s\'éloigne.'},
          {q:'Restez, il fait froid dehors.', r:'Je ne suis pas frileux.', n:'Il s\'éloigne.'}]}}
    ],
    reussi:{titre:'Le maire est retenu', t:'Le maire ne quitte plus la place.', code:'info:maire_retenu'},
    rate:{titre:'Le maire s\'éloigne…', t:'Le maire s\'éloigne vers le clocher…'}},
  /* ---------- La fête (grands.js ; §4.3) : la nuit, sur la place ; chacun dit une réplique (gratuit). Quelques-unes sont des indices
     (la Grosse Marie, retenir le maire), notées dans le Carnet. Mélusine, si son aveu n'a pas été obtenu l'après-midi, craque (le filet). */
  fete:{lieu:'place', moments:N_,
    gens:{
      gaspard:{t:'Sept étages et sept chats en pâte d\'amande ! À minuit, il me faudra des bras pour le porter.', note:'Gaspard, à la fête : à minuit, il lui faudra des bras pour porter son gâteau à sept étages.'},
      margot:{t:'Anselme ferait tout pour un ami. Mais ne lui raconte jamais d\'histoires : il les sent de loin !', note:'Margot, à la fête : Anselme ferait tout pour un ami. Mais il ne faut jamais lui raconter d\'histoires.'},
      fortune:{t:'Regarde : la brume monte dans les rues ! On ne voit déjà plus le moulin.', note:'Fortuné, à la fête : la brume monte dans les rues. On ne voit déjà plus le moulin.'},
      silas:{t:'Article premier du vieux règlement : quand la brume monte, le sonneur sonne, et tout le monde reste sur la place. Même le maire !',
        note:'Silas, à la fête : le vieux règlement dit que quand la brume monte, le sonneur sonne, et tout le monde reste sur la place. Même le maire !'},
      victor:{t:'Je danse ! Enfin, j\'essaie.'},
      tim:{t:'Chut ! Je suis monté en haut du mât des lampions.'},
      melusine:{t:'« Il a dit qu\'il reviendrait à minuit… » Elle se tait. « Non, rien. Bonne fête. »',
        /* le filet : son aveu n'a pas été obtenu l'après-midi */
        filet:{sauf:'info:aveu', t:'Je n\'en peux plus… C\'est moi qui ai écrit la lettre, sous la dictée d\'un homme en cape. Il revient à minuit !', code:'info:aveu',
          note:'Mélusine a craqué, à la fête : c\'est elle qui a écrit la lettre, sous la dictée d\'un homme en cape. Il revient à minuit (code pour le Sage).'}},
      iris:{t:'Ça sent la lavande… ah non, c\'est Silas : il en met dans ses bottes !'},
      farinel:{t:'Je ne dors pas, je repose mes yeux !'},
      basile:{t:'Les lampions tiennent ! Je n\'en reviens pas moi-même.'},
      /* (ajouté à la construction, le 11 novembre : sa réplique tant que « Retenir le maire » n'a pas commencé, ou quand c'est fini) */
      grosbec:{t:'Quelle fête ! Et à minuit pile, le gâteau !'}
    }},

  /* Les photos du tableau de liège du Barde (liege.js) ; les mots-clés (« Autre ») viendront avec la suite */
  liege:{pnj:['melusine', 'margot', 'iris', 'victor', 'fortune', 'tim', 'gaspard', 'farinel', 'anselme', 'silas', 'basile', 'levoisin', 'leo'],
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
      note:'Analyse de la lettre : c\'est l\'écriture de Mélusine (ses « M » qui piquent, ses « t » en vague, son rond sur les « i »). Du pollen de lavande, de l\'encre de colporteur.'}
  },
  laboNotes:{
    pollen_l:'Sur la lettre : du pollen de lavande, comme les sachets d\'Iris. Mais tout le village en a !',
    encre_l:'L\'encre de la lettre : de la noix de galle, l\'encre noire que vendent les colporteurs.'},
  /* ---------- L'établi des plantes (plantes.js ; E3-atelier-des-plantes.md) : les sept potions de la nuit, faites de vraies plantes ---------- */
  plantes:true,
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
      t:'Victor, le facteur, n\'a pas apporté la lettre d\'Odette : elle n\'a ni timbre ni tampon. Et en vingt ans, Odette n\'a jamais reçu une seule lettre.',
      dire:'Une lettre sans timbre ? Le Sage doit le savoir : donne-lui ce code.'},
    capuchon:{nom:'Le capuchon vers le clocher', ic:'🧥', pour:'sage', de:'barde',
      t:'À l\'aube, du haut des toits, Tim a vu un grand capuchon glisser une lettre sous la porte de la mairie, puis repartir vers le clocher.',
      dire:'Qui porte une lettre comme ça ? Le Sage doit le savoir : donne-lui ce code.'},
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
    herbier:{nom:'L\'herbier', ic:'🌿', pour:'alchimiste', de:'sage',
      t:'L\'herbier des Fondateurs : trois plantes rares poussent dans la vallée, le pied-de-loup, la vesse-de-loup et la glu. Le Sage connaît les énigmes qui disent où les trouver.',
      dire:'Lis les trois énigmes à l\'Alchimiste, puis donne-lui ce code.'},
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
    gui:{nom:'Le gui', ic:'🌿', pour:'alchimiste', de:'pisteur', plante:'gui',
      t:'Le Pisteur a grimpé dans le vieux pommier du potager et a cueilli une grosse touffe de gui. Elle t\'attend sur ton établi !',
      dire:'L\'Alchimiste en a besoin pour ses potions : donne-lui ce code.'},
    cle_clou:{nom:'La clé est au clou', ic:'🔔', pour:'pisteur', de:'barde',
      t:'Anselme a pendu sa clé au clou, en haut du clocher. Quand les cloches sonnent, il ferme les yeux et compte les coups…',
      dire:'C\'est le moment de la décrocher ! Donne ce code au Pisteur.'},
    vieux_puits:{nom:'Le vieux puits', ic:'🕳️', pour:'pisteur', de:'barde',
      t:'Tim l\'a vu depuis les toits : Moustache vient de filer dans le vieux puits, entre les barreaux de la grille !',
      dire:'Le Pisteur doit y aller : donne-lui ce code.'},
    /* (étape 2, les grands dialogues du Barde) */
    copie:{nom:'La copie de la lettre', ic:'📝', pour:['sage', 'alchimiste'], de:'barde',
      t:'Le Barde a recopié la lettre d\'Odette, devant le maire… de sa propre main ! « C\'est ton écriture à toi, ça ! » Impossible de comparer les écritures avec cette copie.',
      dire:'Le Sage et l\'Alchimiste vont l\'étudier : donne-leur ce code.'},
    grosse_marie:{nom:'La Grosse Marie', ic:'🔔', pour:'pisteur', de:'barde', donjon:true,
      t:'DONG… DONG… La Grosse Marie a sonné avant minuit. Sous la terre, la brume recule : une fois, hors d\'un combat, toute la vie des trois héros revient.',
      dire:'Quand l\'équipe du donjon dit « On est à plat ! », donne ce code au Pisteur : il le tape dans le donjon.'},
    maire_retenu:{nom:'Le maire est retenu', ic:'🎩', pour:'pisteur', de:'barde', donjon:true,
      t:'Le Barde a retenu le maire sur la place : il ne descendra pas trop tôt dans la crypte.',
      dire:'Le Pisteur doit le taper dans le donjon, avant la dernière salle : donne-lui ce code.'},
    /* (étape 6) le donjon : la porte aux quatre signes (le code du donjon « Un chat gratte à la porte », porte:odette) */
    odette_porte:{nom:'Odette est derrière la porte', ic:'🚪', pour:'sage', de:'pisteur',
      t:'Tout au fond des souterrains, Moustache gratte au bas d\'une grande porte ronde. Tu colles l\'oreille… Une voix étouffée : « Moustache ? Mon gros gris, c\'est toi ? » Odette est là, vivante, derrière la porte !',
      dire:'Un gros chat gris gratte à la porte aux quatre signes : donne ce code au Sage.'},
    /* (étape 7) ce que Léo a dit au Barde, pour le Sage : une, deux ou trois étapes réussies du grand dialogue (grands.js) */
    leo_dit1:{nom:'Léo : « Elle est vivante »', ic:'🧑', pour:'sage', de:'barde',
      t:'Léo, le garçon du moulin, l\'a dit au Barde : « Elle est vivante. C\'est tout ce que je peux dire. » Puis il a filé dans le noir.',
      dire:'Le Sage note tout dans son Grand Livre : donne-lui ce code.'},
    leo_dit2:{nom:'Léo : « Elle est sous le clocher »', ic:'🧑', pour:'sage', de:'barde',
      t:'Léo l\'a dit au Barde : « Elle est sous le clocher, je lui apporte à manger. Je ne dirai rien de plus. » Il a bien trop peur de quelqu\'un.',
      dire:'Le Sage note tout dans son Grand Livre : donne-lui ce code.'},
    leo_dit3:{nom:'Léo a tout dit', ic:'💍', pour:'sage', de:'barde',
      t:'Léo a tout dit au Barde. Odette est derrière la porte aux quatre signes ; il lui passe la soupe par une trappe. L\'homme en cape a une bague à tête de corbeau… et les clés de tout le village.',
      dire:'Le Sage note tout dans son Grand Livre : donne-lui ce code.'},
    leo_attrape:{nom:'Léo attrapé', ic:'🧑', pour:'barde', de:'pisteur', pnj:'leo',
      t:'Le Pisteur a attrapé Léo dans la crypte. À toi de le faire parler… doucement.',
      dire:'Le Barde doit parler à Léo : donne-lui ce code.'},
    leo_enfui:{nom:'Léo s\'est enfui', ic:'🏃', pour:'barde', de:'pisteur', pnj:'leo',
      t:'Des pas descendent l\'escalier de la crypte. Léo blêmit, renverse sa lanterne et file dans le noir, sans un mot.',
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
        /* une oie vue de dos, en ville (mj-pisteur-alchi.js : fuyard 'oie', décor 'ville') ; niveau 9 pour tout le monde
           (Romain, 12 novembre, 8 h 56 ; avant : 4 au plus, comme Tim). Un seul essai : ratée, elle ne coûte que l'or de la mission. */
        {id:'oie', ic:'🦢', nom:'L\'oie de Gaspard', moments:M_, mj:'poursuite', mjNiveauFixe:9, params:{fuyard:'oie', decor:'ville'},
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
    /* les cueillettes de l'Alchimiste (étape 4 ; E3-atelier-des-plantes.md §4) : quatre plantes ordinaires, le matin ou l'après-midi */
    /* (aussi la nuit : s'il manque une potion — l'acide de la grille du puits ! —, on peut encore la finir avant de descendre) */
    lavoir:{alchimiste:{cueillir:[{plante:'oseille'}]}},
    herboristerie:{alchimiste:{cueillir:[{plante:'melisse'}]}},
    moulin:{alchimiste:{cueillir:[{plante:'lin'}]}},
    /* les trois plantes rares : il faut l'herbier du Sage (sans lui, « rien à trouver ») */
    foret:{alchimiste:{cueillir:[{plante:'lycopode', besoin:[{code:'info:herbier'}], secret:true}]}},
    clairiere:{
      alchimiste:{intro:'La clairière aux lièvres. L\'herbe est haute, et ça sent le champignon.', points:[
        /* la vesse-de-loup : « Suivre la poussière » (le moteur de la piste, une trace et une arrivée à elle). Un seul essai, et le
           filet : ratée, on la trouve quand même (jamais d'échec qui bloque une potion). */
        {id:'vesses', ic:'🍄', nom:'La poussière des vesses-de-loup', mj:'traces',
          besoin:[{code:'info:herbier'}], visibleSi:[{code:'info:herbier'}], plante:'vesse', ouvrePartiel:true,
          params:{decor:'foret', suspect:'poussiere', arrivee:'vesses', arriveeTxt:'Le rond des vesses-de-loup !',
            departTitre:'Retiens bien cette trace', departNom:'La poussière des vesses-de-loup', departTxt:'Une fine poussière brune, que le champignon crache quand un lièvre l\'écrase.'},
          avant:'« La vesse-de-loup pousse en rond, là où dansent les lièvres. » Sur l\'herbe, une fine poussière brune file vers le bois… Suis-la, sans la confondre avec la terre et les feuilles mortes !',
          bouton:'🍄 Suivre la poussière',
          t:'Un grand rond de boules blanches, au milieu des fougères. Tu en cueilles une bien mûre… tout doucement. Elle t\'attend sur ton établi !',
          rate:'Tu as perdu la trace… mais un petit nuage brun s\'élève près du gros rocher. Pouf ! Les voilà. Tu en cueilles une bien mûre : elle t\'attend sur ton établi.'}
      ]}
    },
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
          t:'Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde sur la place jusqu\'à minuit ! »',
          variantes:[
            {si:[{et:[{vu:'pisteur:place:banderoles'}, {vu:'pisteur:boulangerie:oie'}]}], t:'Le maire : « Des banderoles, une oie… Parfait ! Et ce soir, tout le monde sur la place jusqu\'à minuit ! »'},
            {si:[{vu:'pisteur:place:banderoles'}], t:'Le maire : « Des banderoles… mais pas d\'oie ? Tant pis ! Ce soir, tout le monde sur la place jusqu\'à minuit ! »'},
            {si:[{vu:'pisteur:boulangerie:oie'}], t:'Le maire : « Une oie… mais pas de banderoles ? Bon, bon. Ce soir, tout le monde sur la place jusqu\'à minuit ! »'}]}
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
          t:'Le maire : « Magnifique ! Ce soir, tout le monde sur la place jusqu\'à minuit ! »',
          variantes:[
            {si:[{et:[{non:{code:'obj:lettre'}}, {non:{code:'info:copie'}}]}], recoit:'obj:lettre', obj:'lettre',
              t:'Le maire : « Magnifique ! Et la lettre d\'Odette, je l\'accroche sous votre tableau, pour que tout le village la lise ce soir ! » Tu peux la lire de près…'}]},
        /* le tableau raté : rien à rendre (pas d'or), mais le filet de la lettre ne doit pas dépendre du tableau (sinon, pas de lettre du tout) */
        {id:'sanstableau', ic:'🏛️', nom:'Passer voir le maire', moments:A_, visibleSi:[{rate:'sage:mairie:tableau'}], varianteFigee:true,
          t:'Le maire : « Pas de tableau ? Tant pis, les lampions feront l\'affaire. Ce soir, tout le monde sur la place jusqu\'à minuit ! »',
          variantes:[
            {si:[{et:[{non:{code:'obj:lettre'}}, {non:{code:'info:copie'}}]}], recoit:'obj:lettre', obj:'lettre',
              t:'Le maire : « Pas de tableau ? Tant pis. La lettre d\'Odette, je l\'accroche au mur, pour que tout le village la lise ce soir ! » Tu peux la lire de près…'}]}
      ]},
      /* l'Alchimiste (étape 4) : porter le gâteau au maire, l'après-midi (5 pièces d'or) */
      alchimiste:{intro:'La mairie. Le maire attend son gâteau en regardant sa montre.', points:[
        {id:'gateau', ic:'🎉', nom:'Porter le gâteau au maire', moments:A_, or:5, visibleSi:[{vu:'alchimiste:boulangerie:gateau'}],
          t:'Le maire fait le tour du gâteau, les mains dans le dos : « Quelle merveille ! On le coupera à minuit pile. Pas une minute avant ! »'}
      ]}
    },
    potager:{
      /* l'Alchimiste : le souci (cueillette ordinaire), et le gui, bien trop haut pour lui (le code pour le Pisteur, qui grimpe) */
      alchimiste:{intro:'Le potager de Basile : des choux, des poireaux, des soucis tout orange, et un vieux pommier tordu.',
        cueillir:[{plante:'souci'}],
        points:[
          {id:'pommier', ic:'🌳', nom:'Le vieux pommier', besoin:[{code:'info:herbier'}], visibleSi:[{code:'info:herbier'}], donne:'info:gui_pommier',
            t:'« La glu ne touche jamais la terre… » Tout en haut du vieux pommier, une grosse boule verte piquée de perles blanches : du gui ! Bien trop haut pour toi.'}
        ]},
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
        note:'Le maire : sa famille et celle d\'Odette sont à Brumeval depuis la fondation. Il n\'en reste plus beaucoup.'},
      /* le grand dialogue de la lettre (E.grands.lettre, grands.js) */
      {q:'Je voudrais vous parler de la lettre…', g:'r', moments:A_, grand:'lettre'}
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
      {q:'Poser la canne d\'Odette', donne:['obj:carnet', 'info:traces_moustache'], titreDonne:'Chez Odette',
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
    anselme:{ou:{apresmidi:'clocher', nuit:'clocher'}, carte:{matin:'clocher'},
      occupe:{matin:['« QUOI ? JE N\'ENTENDS RIEN ! » DONG !', '« UNE BRIOCHE ? NON MERCI, J\'AI DÉJÀ MANGÉ ! » DONG !']},
      salut:'HEIN ? AH, C\'EST TOI !', questions:[
      {q:'Vous m\'entendez bien, Anselme ?', g:'r', moments:A_, a:'HEIN ? Ah ! Parle-moi FORT et LEN-TE-MENT. Et ne me presse jamais : quand on me presse, je n\'entends plus rien !',
        note:'Anselme : il faut lui parler fort et lentement, et ne jamais le presser.'},
      {q:'Qu\'y a-t-il sous le clocher ?', g:'r', moments:A_, a:'La crypte des Fondateurs, fermée à clé. Quand je sonne, je pends la clé au clou, près de la corde.',
        note:'Anselme : sous le clocher, la crypte des Fondateurs, fermée à clé. Quand il sonne, il pend la clé au clou, près de la corde.'},
      {q:'Comment s\'appellent vos cloches ?', g:'r', moments:A_, a:'Bertille, Gontran et la Grosse Marie. Mon père disait : « Quand la brume s\'épaissit, sonne la Grosse Marie : elle la fait reculer. »',
        note:'Anselme : ses cloches s\'appellent Bertille, Gontran et la Grosse Marie. Son père disait : « Quand la brume s\'épaissit, sonne la Grosse Marie : elle la fait reculer. »'},
      {q:'Que ferez-vous pendant la fête ?', g:'e', moments:A_, a:'L\'ouverture, puis la Grosse Marie à minuit PILE. Le maire y tient tellement… je me demande pourquoi !',
        note:'Anselme : il sonnera l\'ouverture de la fête, puis la Grosse Marie à minuit pile. Le maire y tient beaucoup.'},
      /* la nuit (E3-dialogues-et-trame.md §4.1 et §4.2) : la clé, puis la Grosse Marie (dès que le dialogue de la clé est fini) */
      {q:'Vous êtes prêt pour minuit ?', g:'e', moments:N_, a:'Le maire est venu me le redire trois fois : la Grosse Marie à minuit PILE !',
        note:'Anselme, la nuit : le maire est venu lui redire trois fois de sonner la Grosse Marie à minuit pile.'},
      {q:'Vous n\'allez pas à la fête ?', g:'h', moments:N_, a:'Les sonneurs ne dansent pas, mon petit : ils sonnent !',
        note:'Anselme : « Les sonneurs ne dansent pas, mon petit : ils sonnent ! »'},
      {q:'Vous avez entendu du bruit dans la crypte ?', g:'e', moments:N_, a:'Je n\'entends plus rien ! Mais tout à l\'heure, la corde de la Grosse Marie a tremblé toute seule…',
        note:'Anselme, la nuit : tout à l\'heure, la corde de la Grosse Marie a tremblé toute seule.'},
      {q:'Je voudrais vous demander quelque chose…', g:'r', moments:N_, grand:'cle'},
      {q:'Anselme, il faut sonner la Grosse Marie, maintenant !', g:'r', moments:N_, besoin:[{vu:'grand:cle:fini'}], grand:'gm'}
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
      t:'Le maire à Gaspard : « Le gâteau à minuit pile. Pas une minute avant ! »'},
    /* la nuit, à la fête (§4.5) : quatre écoutes au même endroit, la place ; chaque « Écouter en douce » joue la suivante (barde.js, B.porteIci) */
    {id:'gateau_nuit', lieu:'place', moments:N_, titre:'Près du gâteau', phrases:[
      {qui:'grosbec', texte:'Que personne n\'approche du clocher avant minuit.'},
      {qui:'silas', texte:'Même pas Anselme ?'},
      {qui:'grosbec', texte:'Anselme n\'entend rien et ne voit rien. C\'est parfait.'}],
      t:'Le maire à Silas : « Que personne n\'approche du clocher avant minuit. »'},
    {id:'banderoles_nuit', lieu:'place', moments:N_, titre:'Sous les banderoles', phrases:[
      {qui:'iris', texte:'Tu trembles, Mélusine.'},
      {qui:'melusine', texte:'Il viendra chercher sa réponse à minuit. Je n\'écrirai plus jamais pour lui.'}],
      t:'Mélusine à Iris : « Il viendra chercher sa réponse à minuit. Je n\'écrirai plus jamais pour lui. »'},
    {id:'buffet_nuit', lieu:'place', moments:N_, titre:'Au buffet', phrases:[
      {qui:'farinel', texte:'Léo a écrit sur mon pétrin : « Ne m\'attendez pas. Je descends. »'},
      {qui:'gaspard', texte:'Il descend ? Où ça ?'}],
      t:'Farinel : Léo a écrit sur son pétrin « Ne m\'attendez pas. Je descends. »'},
    {id:'mat_nuit', lieu:'place', moments:N_, titre:'Au pied du mât', phrases:[
      {qui:'tim', texte:'Six chats d\'Odette attendent devant la crypte. Moustache, lui, est déjà dedans.'},
      {qui:'victor', texte:'Dedans ? Brrr…'}],
      t:'Tim : six chats d\'Odette attendent devant la crypte. Moustache est déjà dedans.'}
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
  /* ---------- Le Grand Livre du Sage (livre.js ; E3-actions-des-roles.md §3, étape 3) ---------- */
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'},
    /* dès le matin : trois énigmes à lire à voix haute à l'Alchimiste, et son code (sans lui, les trois plantes rares ne se cueillent pas) */
    {id:'herbier', titre:'L\'herbier des Fondateurs', ic:'🌿', donne:'info:herbier',
      t:'Entre deux pages, des plantes séchées, très anciennes. Les Fondateurs y ont noté où pousser les plus rares. Lis ces énigmes à voix haute à l\'Alchimiste !',
      lignes:[
        {ic:'🌿', t:'Le pied-de-loup rampe là où quatre chemins se croisent sous les arbres, et où le soleil n\'entre jamais.'},
        {ic:'🍄', t:'La vesse-de-loup pousse en rond, là où dansent les lièvres.'},
        {ic:'🫐', t:'La glu ne touche jamais la terre : elle vit tout en haut du vieux pommier, au fond du potager.'}]},
    /* les premiers doutes (les codes du Barde : Victor, Tim démasqué) */
    {id:'doutes', titre:'Une drôle de lettre', ic:'✉️', besoin:[{code:'info:poste'}, {code:'info:capuchon'}], bouton:'Réfléchir à la lettre',
      avant:'Cette lettre d\'Odette a quelque chose de bizarre… Il te faudrait un indice du Barde.',
      variantes:[
        {si:[{et:[{code:'info:poste'}, {code:'info:capuchon'}]}], t:'Pas de timbre, pas de tampon. Glissée sous la porte de la mairie, à l\'aube, par un grand capuchon reparti vers le clocher. Qui envoie une lettre comme ça ?'},
        {si:[{code:'info:poste'}], t:'Pas de timbre, pas de tampon : la lettre n\'est pas passée par la poste. Et Odette n\'a jamais reçu une seule lettre ! Alors, qui l\'a apportée ?'}],
      t:'À l\'aube, un grand capuchon a glissé la lettre sous la porte de la mairie, puis il est reparti vers le clocher. Un facteur, ça ? Sûrement pas !'},
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
      t:'Mélusine a écrit la lettre, mot pour mot, sous la dictée d\'un homme en cape, à la voix étouffée, qui sentait la lavande. Il reviendra quand la Grosse Marie sonnera.'}
  ],
  bonus:[],
  /* ---------- La fin (étape 7 ; E3-dialogues-et-trame.md §4.8) : minuit dans la crypte, le maire, la bague, le cachot ----------
     La même pour toute l'équipe. Une seule réplique change, selon ce que Léo a dit au Barde : la tablette du Sage le sait par le code
     « Ce que Léo a dit » (info:leo_dit2 / leo_dit3), et le dit aux autres dans le code de fin (victoire:1x, victoire:2x : moteur-actions.js,
     commencerFin ; P.fin.variante). 0 : Léo n'est pas là (enfui, ou rien dit) ; 1 : il a parlé à moitié ; 2 : il a tout dit. */
  finVariante:function(P){ return P && P.recus && P.recus['info:leo_dit3'] ? 2 : P && P.recus && P.recus['info:leo_dit2'] ? 1 : 0; },
  fin:{
    slides:[
      'Mélusine a écrit la fausse lettre, mot pour mot, sous la dictée d\'un homme en cape. Et Odette est vivante : elle est là, tout près, derrière la porte aux quatre signes. Mais qui l\'a enfermée ?',
      'DONG… DONG… DONG… La Grosse Marie sonne minuit. Dans la crypte des Fondateurs, des pas descendent l\'escalier. Des lanternes : c\'est le maire, avec Silas et deux gardes.',
      function(P){
        var v = (P && P.fin && P.fin.variante) || 0;
        return v === 2 ? 'Le maire regarde Léo, longtemps. « Toi… tu as beaucoup trop parlé, mon garçon. »'
          : v === 1 ? 'Le maire aperçoit Léo, assis contre le mur. « Léo. Rentre au moulin. Tout de suite. » Léo file sans un mot.'
          : 'Le maire lève sa lanterne. « Tiens, tiens… Nos petits enquêteurs, dans la crypte des Fondateurs, en pleine nuit. »';
      },
      'Lentement, il retire ses gants gris. À son doigt brille une bague en argent, à tête de corbeau. « Vous êtes allés trop loin. Beaucoup trop loin. »',
      'Silas en reste bouche bée : « Monsieur le maire… ? » Le maire ne le regarde même pas. « Gardes ! Enfermez-les ! »',
      {img:'prison', plume:true, t:'Vous voilà tous les quatre au cachot de la mairie. Devant la grille, une plume noire se pose, sans un bruit… <b>À suivre…</b>'}
    ],
    illus:['e3-porte', 'e3-minuit', 'e3-leo', 'e3-bague', 'e3-gardes'],
    calepin:[
      {ic:'✍️', t:'Mélusine a écrit la fausse lettre d\'Odette, sous la dictée d\'un homme en cape qui sentait la lavande.'},
      {ic:'🚪', t:'Odette est vivante, enfermée sous le clocher, derrière la porte aux quatre signes : l\'œil, le chaudron, la lyre et l\'étoile.'},
      {ic:'🧑', t:'Léo, le garçon du moulin, portait à manger à Odette tous les soirs. Quelqu\'un le lui avait demandé.'},
      {ic:'💍', t:'À minuit, dans la crypte, le maire a retiré ses gants : il porte une bague en argent à tête de corbeau.'},
      {ic:'💂', t:'Silas, le garde champêtre, n\'en revenait pas : « Monsieur le maire… ? »'},
      {ic:'⛓️', t:'Le maire vous a fait enfermer au cachot de la mairie.'}
    ]
  },
  defaite:[
    'Minuit sonne. La fête est finie… et personne ne sait où est Odette.',
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
