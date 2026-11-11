/* donnees.js — LES TABLEAUX du donjon du puits (Les Enquêteurs de Brumeval, enquête 3).
   Aucun calcul ici, aucun affichage : seulement ce que regles.js lit. Mode d'emploi : moteur/REGLES.md.
   Dans la page : window.DonjonDonnees. Dans Node : require('./donnees.js').

   Les chiffres de la salle des rats (héros, rat d'égout, gestes, recettes de l'essai) sont ceux que Romain a validés
   dans jeu/donjon/essai/src/jeu.js : ON NE LES CHANGE PAS. Les autres chiffres sortent de la simulation
   (moteur/equilibre.js, rapport dans moteur/equilibre.md) et sont reportés dans CONCEPTION-DONJON.md.

   ---------------------------------------------------------------------------------------------------------------
   LES RÉACTIONS D'UN MONSTRE (sa « machine à états »)
   reactions[coup] = une liste de règles ; la PREMIÈRE dont la condition est vraie s'applique.
   Sans règle (ou sans règle vraie), c'est la réaction ordinaire du coup (regles.js, « _ordinaire »).
     coup    : lumiere, bruit, nuage, feu, huile, colle, givre, acide, louche (le coup de louche lui-même, sur la bête
               de devant), bouclier (son attaque tombe sur un bouclier de runes), chatouille (Bourbe seulement)
     si      : {avec:[états qu'il doit tous avoir], sans:[états qu'il ne doit pas avoir], un:[au moins un de ceux-là]}
               « ouvert » compte comme un état (son point faible est ouvert).
     fait    : la suite de ce qui se passe :
               ['etat', nom, durée]      il prend cet état. Durée : 1 = jusqu'à la fin du tour des monstres de ce tour ;
                                          2 = jusqu'à la fin du tour suivant ; 3 = encore un de plus ; 'fin' = jusqu'à la fin
                                          du combat ; 'geste' = jusqu'au premier geste des héros du tour suivant.
               ['retire', nom]           il perd cet état
               ['ouvre', durée, par]     son point faible s'ouvre (même durées)
               ['ferme']                 son point faible se referme
               ['special', nom]          un moment propre à la bête (special(nom) du module animé)
               ['gagne', n]              il gagne n PV (et n PV max)
               ['naissent', type, n]     n petites bêtes arrivent devant lui
               ['riposte', attaque, qui] il frappe tout de suite (« alchimiste », ou « auteur » : celui qui a fait le geste)
               ['mot', texte]            deux mots à montrer au-dessus de la bête
               (un état dont le nom commence par « _ » est une note des règles : il ne s'affiche pas)
     defaut  : true = la réaction ordinaire du coup s'applique AUSSI (dégâts, brûlure…)
     piege   : true = c'est un piège : ça le renforce (pour les tests, la simulation et le Grand Livre)
   --------------------------------------------------------------------------------------------------------------- */
(function(global){
'use strict';
var D = {};

/* ===================================================================== 1. LES HÉROS (essai : ne pas changer) */
D.HEROS = {
  sage:{nom:'Sage', le:'le Sage', Le:'Le Sage', du:'du Sage', pv:90, gestes:['etudier', 'rune', 'bouclier'], sac:null},
  alchimiste:{nom:'Alchimiste', le:'l\'Alchimiste', Le:'L\'Alchimiste', du:'de l\'Alchimiste', pv:100, gestes:['louche', 'herbes'], sac:'potion'},
  pisteur:{nom:'Pisteur', le:'le Pisteur', Le:'Le Pisteur', du:'du Pisteur', pv:120, gestes:['fleche', 'dague'], sac:'fleche', objets:['fleches-normales']}
};
D.ORDRE = ['sage', 'alchimiste', 'pisteur'];           /* de gauche à droite à l'écran */
D.EXPOSES = ['pisteur', 'alchimiste', 'sage'];         /* du plus exposé (devant) au moins exposé */
D.VISEE = {pisteur:6, alchimiste:2.5, sage:1.5};       /* les monstres visent plutôt celui de devant (60 %, 25 %, 15 %) */

/* ===================================================================== 2. LES GESTES
   vise : 'bete' (un monstre), 'devant' (les bêtes à portée de main), 'heros' (un ami debout), 'salle' (pas de cible) */
D.GESTES = {
  etudier:{ic:'🔍', nom:'Étudier', d:'un code pour le Sage', vise:'bete'},
  rune:{ic:'✨', nom:'Rune de lumière', d:'une vive lumière', vise:'bete'},
  bouclier:{ic:'🛡️', nom:'Bouclier de runes', d:'protège un ami', vise:'heros'},
  louche:{ic:'🥄', nom:'Coup de louche', d:'un grand BONG', vise:'salle'},
  herbes:{ic:'🌿', nom:'Herbes', d:'soigne un peu', vise:'heros'},
  fleche:{ic:'🏹', nom:'Flèche', d:'n\'importe quel monstre', vise:'bete'},
  dague:{ic:'🗡️', nom:'Coup de dague', d:'celui de devant', vise:'devant'},
  chatouiller:{ic:'🪶', nom:'Chatouiller', d:'guili-guili !', vise:'salle'}
};

/* ===================================================================== 3. LES RECETTES (les potions de l'Alchimiste)
   Romain, 10 novembre (17 h 47 et 17 h 56) : plus de sac de 3 recettes à choisir (« un peu trop compliqué »). L'Alchimiste a
   TOUTES les potions qu'il a réussi à créer pendant ses missions (partie.recettes). S'il lui en manque une, il reste un
   chemin plus long, en deux étapes, écrit en énigme dans le Grand Livre du Sage (D.LIVRE, la dernière ligne).
   vise : 'bete', 'salle', 'heros' (un ami debout), 'sol' (un ami au sol), 'equipe' (tout le monde, pas de cible)
   fleche : le Pisteur peut y tremper une flèche. pouvoir : le nom du coup que reçoit le monstre. */
D.RECETTES = {
  feu:{petit:'Feu', nom:'Fiole de feu', d:'brûle un monstre', long:'Elle brûle un monstre.', vise:'bete', fleche:true, pouvoir:'feu', coul:'#ff7a2a'},
  fumigene:{nom:'Fumigène', d:'un gros nuage', long:'Un gros nuage, dans toute la salle.', vise:'salle', fleche:false, pouvoir:'nuage', coul:'#aab4d2'},
  huile:{nom:'Huile', d:'ça glisse !', long:'Ça glisse, ça glisse…', vise:'bete', fleche:true, pouvoir:'huile', coul:'#f2b630'},
  colle:{nom:'Colle', d:'pattes collées', long:'Les pattes restent collées au sol.', vise:'bete', fleche:true, pouvoir:'colle', coul:'#ece4d0'},
  acide:{nom:'Acide', d:'ronge le fer', long:'Il ronge le fer et la rouille.', vise:'bete', fleche:true, pouvoir:'acide', coul:'#9be04a'},
  baume:{nom:'Baume', d:'soigne beaucoup', long:'Il soigne beaucoup un ami.', vise:'heros', fleche:false, soin:40, coul:'#5fd08a'},
  coeur:{petit:'Cœur', nom:'Cœur vaillant', d:'relève un ami', long:'Il relève un ami tombé au sol.', vise:'sol', fleche:false, releve:40, coul:'#ff5a7a'},
  /* celles qu'on gagne au chaudron de l'Alchimiste (codes recette:givre et recette:baumelum) */
  givre:{nom:'Givre', d:'gèle tout', long:'Un froid qui gèle tout ce qu\'il touche.', vise:'bete', fleche:true, pouvoir:'givre', coul:'#bff4ff', gagnee:true},
  baumelum:{petit:'Lumineux', nom:'Baume lumineux', d:'soigne tout le monde', long:'Il soigne un peu toute l\'équipe.', vise:'equipe', fleche:false, soinEquipe:15, coul:'#7affc0', gagnee:true}
};
D.RECETTES_DEPART = ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'];
D.ORDRE_RECETTES = ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur', 'givre', 'baumelum'];

/* ===================================================================== 4. LES CHIFFRES COMMUNS */
D.CHIFFRES = {
  places:2,                                /* places d'objet par héros */
  /* le critique du Pisteur sur un point faible ouvert, selon le rang de la bête */
  critique:{normal:{fleche:60, dague:75}, elite:{fleche:110, dague:140}, boss:{fleche:300, dague:380}},
  surprise:1 / 8,                          /* le critique surprise : flèche simple, monstre normal, même fermé */
  /* un coup sur un monstre NORMAL au point faible fermé (les élites et le boss : 0, « ça rebondit ») */
  ferme:{fleche:3, dague:4, louche:2, feu:5, acide:5},
  /* les autres coups sur un point faible ouvert */
  ouvert:{louche:10, feu:30, acide:25},
  brulure:4,                               /* à chaque tour des monstres, jusqu'à la fin du combat */
  bouclier:0.5,                            /* la part des dégâts qui passe à travers le bouclier de runes */
  herbes:20,
  amulette:30,                             /* le héros qui tombe se relève avec 30 (une fois par donjon) */
  repos:0.5,                               /* le feu de camp rend la moitié des PV max */
  os:10,                                   /* la morsure du rat du tas d'os (sur le Pisteur) */
  bourse:25,                               /* les pièces de la bourse */
  plancher:1                               /* hors combat, un piège ne fait jamais tomber : il reste au moins 1 PV */
};

/* ===================================================================== 5. LES OBJETS (2 places par héros)
   pour : qui le porte ('tous' : on choisit). code : c'est un objet à passer par code (il ne prend pas de place).
   equipe : le nom pour HerosAnime.equiper(nom). */
D.OBJETS = {
  /* Romain, 10 novembre : « flèches de lune » et « flèches transperçantes » (les identifiants ne changent pas : 'fleches-argent',
     'fleches-lourdes'). À 17 h 56 : « fais en sorte qu'on puisse prendre toutes les flèches, et c'est juste qu'on peut choisir
     le type de flèche » en combat. Un carquois (carquois:true) ne prend donc plus de place dans les mains.
     Chaque sorte a son défaut (accepté par Romain) : les flèches de lune rebondissent sur l'armure (rebondit), les
     transperçantes passent à travers les bêtes de brume (traverse), les normales n'ont pas de bonus. */
  'fleches-normales':{nom:'Flèches normales', court:'Flèche', pour:'pisteur', carquois:true, equipe:null, d:'Les flèches de tous les jours. Ni bonus, ni mauvaise surprise.'},
  'fleches-argent':{nom:'Flèches de lune', petit:'De lune', court:'Flèche de lune', pour:'pisteur', carquois:true, equipe:'carquois-argent', fleche:'argent', coup:'fleche-argent', ic:'🌙',
    contre:['feufollet', 'chauvesouris'], ferme:10, critique:1.5, rebondit:['ratcuir', 'gardien'], dg:'bêtes de brume',
    d:'Contre les créatures de brume : elles touchent même fermé, et le critique frappe une fois et demie plus fort. Mais sur une armure, elles rebondissent.'},
  'fleches-lourdes':{nom:'Flèches transperçantes', petit:'Transperçante', court:'Flèche transperçante', pour:'pisteur', carquois:true, equipe:'carquois-lourd', fleche:'lourde', coup:'fleche-lourde', ic:'🔩',
    contre:['ratcuir', 'gardien'], ferme:12, critique:1.5, traverse:['feufollet', 'chauvesouris'], dg:'perce l\'armure',
    d:'Contre l\'armure : le critique frappe une fois et demie plus fort, et sur le rat cuirassé elles touchent même fermé. Mais elles passent à travers les bêtes de brume, sans rien leur faire.'},
  'cristal-lune':{nom:'Cristal de lune', pour:'sage', equipe:'cristal-lune', d:'La rune de lumière éclaire toute la salle. Toute la salle…'},
  'baton-chene':{nom:'Bâton de chêne', pour:'sage', equipe:'baton-chene', d:'Le bouclier de runes protège deux amis à la fois.'},
  'amulette':{nom:'Amulette de vie', pour:'tous', equipe:'amulette', d:'Une fois dans le donjon, celui qui la porte se relève tout seul.'},
  'bourse':{nom:'Bourse de pièces', pour:null, or:true, d:'De l\'or pour la boutique.'},
  /* les objets à code : la tablette du Pisteur montre le code, un autre joueur le tape */
  'fleur-givre':{nom:'Fleur de givre', pour:'alchimiste', code:'plante:givre', d:'Une plante rare, pour le chaudron de l\'Alchimiste.'},
  'herbes':{nom:'Herbes lumineuses', pour:'alchimiste', code:'plante:lumiere', d:'Une plante rare, pour le chaudron de l\'Alchimiste.'},
  'page-dechiree':{nom:'Page déchirée', pour:'sage', code:'page:dechiree', d:'Le morceau qui manque au plan du Sage.'},
  'page-blanche':{nom:'Page blanche', pour:'sage', code:'page:blanche', d:'Une page de plus pour le Grand Livre du Sage.'},
  /* la rune de lumière du Sage (Romain, 10 novembre : « la rune, il la trouve dans une salle, par exemple au fond du puits »).
     discret : rien ne la signale dans la salle (elle ne brille pas, elle ne compte pas dans « il reste quelque chose à faire ici ») */
  /* Romain, 11 novembre (8 h 03) : « qu'il y ait un livre à l'entrée du puits ou de la crypte » — le journal de l'aventurier.
     Le Sage tape son code : le carnet entre dans son Grand Livre ; chaque monstre étudié y décolle une page. */
  'carnet':{nom:'Le carnet d\'un aventurier', pour:'sage', code:'carnet:aventurier', d:'Le journal de quelqu\'un qui est passé par là avant vous. Le Sage y retrouvera chaque monstre étudié.'},
  'rune':{nom:'Pierre de rune', pour:'sage', code:'rune:lumiere', discret:true, d:'Une rune de lumière : elle réveille l\'encre cachée du plan du Sage.'}
};

/* ===================================================================== 6. LES MONSTRES
   rang : normal | elite | boss. module : l'id dans BETES (anim/betes/<id>/) ; « rat » : RatAnime, à envelopper.
   fin : comment il part quand il est battu sans critique ('fuit' ou 'meurt' : une machine, un esprit, le boss).
   attaques[nom] : degats ; cibles : 'un' (celui qu'il vise), 'deux', 'tous', 'devant' (le héros le plus exposé) ;
                   foisSi {état:n} : il frappe n fois ; plusSi {état:n} : +n dégâts ; doubleSi [états] : dégâts doublés ;
                   pose : l'état donné au héros touché ('entoile') ; avale : il l'avale ; consomme : l'état qui s'en va après
                   le coup ; apres : ce qui lui arrive après avoir attaqué (comme « fait »).
   rythme : la suite de ses attaques, en boucle.
   passeSi : les états où il n'attaque pas ce tour-ci.
   tombe : les états où il est tombé devant (la dague l'atteint, où qu'il soit).
   seReleve : tombé, il se relève avant d'attaquer (ses états « tombe » s'en vont et il se referme juste avant son attaque).
   cache : les états où on ne peut pas le viser (les pouvoirs de toute la salle l'atteignent quand même).
   blinde : les états où tout rebondit sur lui.
   ferme : ses propres chiffres au point faible fermé (sinon ceux de CHIFFRES.ferme).
   livre : le monstre du Grand Livre où ses lignes sont rangées (lui-même, sauf la petite araignée). */
D.MONSTRES = {
  /* ---------- le rat d'égout : L'ESSAI, validé par Romain. Ne rien changer. ---------- */
  rat:{
    nom:'Rat d\'égout', le:'le rat', rang:'normal', pv:40, module:'rat', fin:'fuit',
    attaques:{morsure:{degats:8, cibles:'un', foisSi:{enrage:2}}}, rythme:['morsure'],
    passeSi:['colle', 'gele'], tombe:[],             /* comme dans l'essai : la dague ne touche que le rat de devant, même si un autre est sur le dos */
    reactions:{
      lumiere:[{si:{sans:['ouvert']}, fait:[['etat', 'ebloui', 1], ['ouvre', 1, 'lumiere']]},
               {fait:[['mot', 'Déjà ébloui']]}],
      huile:[{si:{sans:['ouvert']}, fait:[['etat', 'dos', 1], ['ouvre', 1, 'huile']]},
             {fait:[['mot', 'Déjà retourné']]}],
      bruit:[{fait:[['etat', 'enrage', 'fin']], piege:true}]
    }
  },

  /* ---------- le rat cuirassé ---------- */
  ratcuir:{
    nom:'Rat cuirassé', le:'le rat cuirassé', rang:'normal', pv:70, module:'ratcuir', fin:'fuit',
    attaques:{'coup-de-tete':{degats:18, cibles:'un', plusSi:{rougeoie:6}}}, rythme:['coup-de-tete'],
    passeSi:['colle', 'gele', 'tournis'], tombe:[],
    ferme:{fleche:1, dague:2, louche:1, feu:0, acide:0},
    reactions:{
      /* l'armure tombe : ce qui est cassé reste cassé, la peau nue reste à découvert jusqu'à la fin */
      acide:[{si:{sans:['nu']}, fait:[['special', 'armure-tombe'], ['retire', 'rougeoie'], ['etat', 'nu', 'fin'], ['ouvre', 'fin', 'acide']]},
             {defaut:true}],
      givre:[{si:{sans:['nu']}, fait:[['special', 'armure-eclate'], ['retire', 'rougeoie'], ['etat', 'nu', 'fin'], ['ouvre', 'fin', 'givre']]},
             {defaut:true}],
      /* sans potion : deux coups de louche sur le casque (le tournis, puis le casque tombe), ensuite la lumière */
      louche:[{si:{sans:['sans-casque', 'tournis']}, fait:[['special', 'tournis'], ['etat', 'tournis', 2]]},
              {si:{avec:['tournis'], sans:['sans-casque']}, fait:[['special', 'casque-tombe'], ['retire', 'tournis'], ['etat', 'sans-casque', 'fin']]},
              {defaut:true}],
      lumiere:[{si:{avec:['sans-casque']}, fait:[['etat', 'ebloui', 1], ['ouvre', 1, 'lumiere']]},
               {fait:[['mot', 'Ça glisse !']]}],
      /* le piège : le feu fait rougeoyer l'armure, ses coups brûlent */
      feu:[{si:{sans:['nu']}, fait:[['etat', 'rougeoie', 'fin'], ['mot', 'Il rougeoie !']], piege:true},
           {defaut:true}],
      huile:[{fait:[['mot', 'Il se rattrape']]}]
    }
  },

  /* ---------- la chauve-souris de la brume ---------- */
  chauvesouris:{
    nom:'Chauve-souris de la brume', le:'la chauve-souris', rang:'normal', pv:25, module:'chauvesouris', fin:'fuit',
    attaques:{pique:{degats:30, cibles:'un', foisSi:{folle:2}}}, rythme:['pique'],
    passeSi:['colle', 'gele'], tombe:['au-sol'], seReleve:true,
    reactions:{
      bruit:[{si:{sans:['au-sol']}, fait:[['etat', 'au-sol', 1], ['ouvre', 1, 'bruit']]}, {fait:[]}],
      colle:[{fait:[['etat', 'colle', 1], ['etat', 'au-sol', 1], ['ouvre', 1, 'colle']]}],
      lumiere:[{si:{sans:['folle']}, fait:[['etat', 'folle', 'fin'], ['mot', 'Elle devient folle !']], piege:true},
               {fait:[['mot', 'Déjà folle']]}]
    }
  },

  /* ---------- le feu follet ---------- */
  feufollet:{
    nom:'Feu follet', le:'le feu follet', rang:'normal', pv:30, module:'feufollet', fin:'meurt',
    attaques:{brulure:{degats:18, cibles:'deux'}}, rythme:['brulure'],
    passeSi:['colle', 'gele'], tombe:[],
    ferme:{fleche:1, dague:1, louche:0, feu:0, acide:1},
    reactions:{
      nuage:[{fait:[['etat', 'visible', 1], ['ouvre', 1, 'nuage']]}],
      lumiere:[{si:{sans:['grand']}, fait:[['special', 'grandit'], ['etat', 'grand', 'fin'], ['gagne', 30], ['mot', 'Il grandit !']], piege:true},
               {fait:[['mot', 'Déjà grand']]}],
      /* sans potion : son attaque tombe sur un bouclier de runes, il s'y accroche et on le voit tout entier */
      bouclier:[{fait:[['special', 'accroche'], ['etat', 'accroche', 2], ['etat', 'visible', 2], ['ouvre', 2, 'bouclier']]}],
      feu:[{si:{sans:['ouvert']}, fait:[['mot', 'Même pas chaud']]}, {defaut:true}],
      huile:[{fait:[['mot', 'Ça le traverse']]}]
    }
  },

  /* ---------- l'araignée des caves ---------- */
  araignee:{
    nom:'Araignée des caves', le:'l\'araignée', rang:'normal', pv:60, module:'araignee', fin:'fuit',
    attaques:{morsure:{degats:18, cibles:'un'}, toile:{degats:0, cibles:'un', pose:'entoile'}}, rythme:['toile', 'morsure'],
    passeSi:['colle', 'gele'], tombe:['dos'], cache:['haut'], seReleve:true,
    reactions:{
      lumiere:[{si:{sans:['dos']}, fait:[['retire', 'haut'], ['etat', 'dos', 1], ['ouvre', 1, 'lumiere']]}, {fait:[['mot', 'Déjà par terre']]}],
      huile:[{si:{sans:['dos']}, fait:[['retire', 'haut'], ['etat', 'dos', 1], ['ouvre', 1, 'huile']]}, {fait:[['mot', 'Déjà par terre']]}],
      /* les pièges : le feu fait éclore ses œufs (une seule fois) ; dans le nuage, elle remonte hors d'atteinte */
      feu:[{si:{sans:['_eclos']}, fait:[['etat', 'oeufs-brulent', 'fin'], ['etat', '_eclos', 'fin'], ['special', 'eclosion'], ['naissent', 'petitearaignee', 2], ['mot', 'Les œufs !']], piege:true},
           {defaut:true}],
      nuage:[{si:{sans:['dos']}, fait:[['etat', 'haut', 1], ['mot', 'Elle remonte !']], piege:true}, {fait:[]}]
    }
  },

  /* ---------- la petite araignée (née des œufs) ---------- */
  petitearaignee:{
    nom:'Petite araignée', le:'la petite araignée', rang:'normal', pv:15, module:'petitearaignee', fin:'fuit', livre:'araignee',
    attaques:{morsure:{degats:6, cibles:'un'}}, rythme:['morsure'],
    passeSi:['colle', 'gele'], tombe:[],
    reactions:{
      lumiere:[{si:{sans:['ouvert']}, fait:[['etat', 'ebloui', 1], ['ouvre', 1, 'lumiere']]}, {fait:[]}],
      huile:[{si:{sans:['ouvert']}, fait:[['etat', 'dos', 1], ['ouvre', 1, 'huile']]}, {fait:[]}]
    }
  },

  /* ---------- le têtard du puits : pas de point faible, un seul coup suffit ---------- */
  tetard:{
    nom:'Têtard du puits', le:'le têtard', rang:'normal', pv:15, module:'tetard', fin:'fuit',
    attaques:{morsure:{degats:8, cibles:'un'}}, rythme:['morsure'],
    passeSi:['colle', 'gele'], tombe:[],
    ferme:{fleche:15, dague:15, louche:15, feu:15, acide:15},
    reactions:{}
  },

  /* ---------- le Roi des rats (élite) ---------- */
  roirats:{
    nom:'Le Roi des rats', le:'le Roi des rats', rang:'elite', pv:220, module:'roirats', fin:'fuit',
    attaques:{
      grouillement:{degats:16, cibles:'tous', apres:[['etat', 'etale', 'geste']]},
      charge:{degats:30, cibles:'un'}
    }, rythme:['grouillement'],
    passeSi:['noeud'], tombe:[], blinde:['boule'],
    reactions:{
      /* le combo : le nuage (ils tirent chacun de leur côté, le nœud se tend), PUIS le bruit */
      nuage:[{si:{sans:['ouvert']}, fait:[['retire', 'etale'], ['etat', 'noeud', 2]]}, {fait:[]}],
      bruit:[{si:{avec:['ouvert']}, fait:[]},
             {si:{avec:['noeud']}, fait:[['special', 'tirent'], ['retire', 'noeud'], ['ouvre', 1, 'bruit']]},
             /* sans potion : le bruit juste après leur attaque, quand la masse est encore étalée */
             {si:{avec:['etale']}, fait:[['special', 'panique'], ['retire', 'etale'], ['ouvre', 1, 'panique']]},
             /* le piège : le bruit trop tôt, ils chargent l'Alchimiste */
             {fait:[['special', 'charge'], ['riposte', 'charge', 'alchimiste'], ['mot', 'Ils chargent !']], piege:true}],
      /* l'autre chemin : le nuage puis la colle sur le roi (il reste collé jusqu'à la fin du tour suivant) */
      colle:[{si:{avec:['noeud']}, fait:[['special', 'roi-colle'], ['retire', 'noeud'], ['etat', 'colle', 2], ['ouvre', 2, 'colle']]},
             {fait:[['mot', 'Trop nombreux !']]}],
      /* le piège : la lumière, ils se roulent en boule pour deux tours */
      lumiere:[{fait:[['ferme'], ['retire', 'noeud'], ['retire', 'etale'], ['etat', 'boule', 2], ['mot', 'En boule !']], piege:true}]
    }
  },

  /* ---------- le Gardien de rouille (élite) ---------- */
  gardien:{
    nom:'Le Gardien de rouille', le:'le Gardien', rang:'elite', pv:280, module:'gardien', fin:'meurt',
    attaques:{poing:{degats:40, cibles:'devant', plusSi:{rougeoie:10}, doubleSi:['enrage']}}, rythme:['poing'],
    passeSi:[], tombe:[],
    reactions:{
      /* le combo : d'abord la plaque (elle reste cassée), ensuite le cœur (la lumière, à chaque tour) */
      acide:[{si:{sans:['plaque-ouverte', 'sans-plaque']}, fait:[['special', 'plaque-tombe'], ['retire', 'plaque-entrouverte'], ['etat', 'plaque-ouverte', 'fin']]},
             {defaut:true}],
      givre:[{si:{sans:['plaque-ouverte', 'sans-plaque']}, fait:[['special', 'plaque-eclate'], ['retire', 'plaque-entrouverte'], ['etat', 'sans-plaque', 'fin']]},
             {fait:[['mot', 'Trop fort !']]}],
      lumiere:[{si:{avec:['ouvert']}, fait:[['mot', 'Déjà ébloui']]},
               {si:{un:['plaque-ouverte', 'sans-plaque', 'plaque-entrouverte']}, fait:[['etat', 'ebloui', 1], ['ouvre', 1, 'lumiere']]},
               /* le piège : la lumière sur la plaque fermée, ses runes s'affolent, il frappe double pendant deux tours */
               {fait:[['etat', 'enrage', 2], ['mot', 'Il s\'emballe !']], piege:true}],
      /* le piège : le feu le chauffe au rouge, il cogne plus fort jusqu'à la fin */
      feu:[{si:{sans:['ouvert']}, fait:[['etat', 'rougeoie', 'fin'], ['mot', 'Il rougeoie !']], piege:true},
           {defaut:true}],
      /* sans potion : il frappe un bouclier de runes, s'arrête net, sa plaque s'entrouvre jusqu'à la fin du tour suivant */
      bouclier:[{si:{sans:['plaque-ouverte', 'sans-plaque']}, fait:[['special', 'entrouvert'], ['etat', 'plaque-entrouverte', 2]]}, {fait:[]}]
    }
  },

  /* ---------- Bourbe, le crapaud du puits (boss) ----------
     Dans l'eau (immunisé) → lumière : sur la berge → feu : sec → nuage : sur le dos, ouvert jusqu'à la fin du tour suivant.
     Le reste de son comportement (il sèche tout seul, il replonge, il remonte avec ses têtards) est dans D.BOURBE. */
  bourbe:{
    nom:'Bourbe, le crapaud du puits', le:'Bourbe', rang:'boss', pv:1000, module:'bourbe', fin:'meurt', chef:true,
    attaques:{
      langue:{degats:30, cibles:'un', avale:true},
      saut:{degats:28, cibles:'tous', doubleSi:['gonfle'], consomme:'gonfle'}
    }, rythme:['langue', 'saut'],
    passeSi:['dos', 'sous'], tombe:['dos'], cache:['sous'],
    reactions:{
      lumiere:[{si:{un:['dos', 'sous']}, fait:[]},
               {fait:[['etat', 'berge', 2]]}],
      feu:[{si:{avec:['ouvert']}, defaut:true},
           {si:{un:['berge', 'gele'], sans:['sec', 'sous']}, fait:[['etat', 'sec', 'fin'], ['mot', 'Tout sec !']]},
           {si:{avec:['sec']}, fait:[['mot', 'Déjà sec']]},
           {fait:[['mot', 'Trop mouillé !']]}],
      nuage:[{si:{un:['dos', 'sous']}, fait:[]},
             {si:{avec:['sec']}, fait:[['etat', 'dos', 2], ['ouvre', 2, 'nuage']]},
             /* le piège : le nuage avant qu'il soit sec, il gonfle (son prochain saut frappe double) */
             {si:{sans:['gonfle']}, fait:[['etat', 'gonfle', 'fin'], ['mot', 'Il gonfle !']], piege:true},
             {fait:[]}],
      /* le piège : le bruit, il plonge et revient avec deux têtards (sauf si le bassin est gelé : il se cogne) */
      bruit:[{si:{un:['dos', 'sous']}, fait:[]},
             {si:{avec:['gele']}, fait:[['mot', 'Il se cogne !']]},
             {fait:[['special', 'plonger'], ['retire', 'berge'], ['retire', 'sec'], ['etat', 'sous', 1], ['mot', 'Il plonge !']], piege:true}],
      /* l'autre chemin : le givre gèle le bassin pour trois tours (il ne plonge plus, il est comme sur la berge) */
      givre:[{si:{un:['dos', 'sous']}, fait:[]},
             {fait:[['etat', 'gele', 3], ['mot', 'Le bassin gèle !']]}],
      /* sans nuage : le héros avalé le chatouille ; s'il est sec, il en roule sur le dos */
      chatouille:[{si:{avec:['sec'], sans:['dos']}, fait:[['special', 'chatouille'], ['etat', 'dos', 2], ['ouvre', 2, 'chatouille']]},
                  {fait:[['special', 'recrache']]}]
    }
  }
};

/* Bourbe : ce que les réactions ne disent pas */
D.BOURBE = {
  secApres:2,          /* sans feu : au bout de 2 tours entiers hors de l'eau, il sèche tout seul… */
  secReste:1,          /* …et un crapaud sec reste encore 1 tour dehors, tout raide */
  tetards:2,           /* les têtards qu'il ramène quand il a plongé */
  tetardsMax:4,        /* jamais plus de têtards que ça en même temps */
  retour:'saut'        /* quand il remonte, il retombe sur tout le monde (en plus de son rythme) */
};

/* ===================================================================== 7. LES SALLES DE COMBAT
   Les monstres dans l'ordre de la file : le premier est DEVANT (la dague et la louche l'atteignent). */
D.COMBATS = {
  rats:{nom:'La salle des rats', monstres:['rat', 'rat', 'rat']},
  canaux:{nom:'Les canaux de la ville d\'avant', monstres:['rat', 'chauvesouris', 'chauvesouris']},
  egouts:{nom:'Les égouts tournants', monstres:['rat'], errant:true},
  toiles:{nom:'La cave aux toiles', monstres:['araignee', 'feufollet', 'feufollet']},
  atelier:{nom:'L\'atelier des Fondateurs', monstres:['ratcuir', 'gardien'], elite:true},
  crypte:{nom:'La fausse crypte', monstres:['chauvesouris', 'chauvesouris']},
  ossuaire:{nom:'L\'ossuaire', monstres:['roirats', 'feufollet', 'feufollet'], elite:true},
  bassin:{nom:'Le grand bassin', monstres:['tetard', 'tetard', 'bourbe'], boss:true}
};
/* l'ordre du chemin long (les salles de combat qu'on ne peut pas éviter) */
D.CHEMIN = ['rats', 'canaux', 'toiles', 'atelier', 'ossuaire', 'bassin'];

/* ===================================================================== 8. LES LIEUX (ids de carte.js) : ce qu'on y trouve
   objets : à prendre en les touchant. coffre : deux objets, on n'en prend qu'un. combat : l'id dans D.COMBATS. */
D.LIEUX = {
  puits:{nom:'Le fond du puits', depart:true, objets:['carnet']},             /* le carnet de l'aventurier attend à l'entrée (Romain, 11 novembre) */
  /* Romain, 11 novembre (8 h 45) : la rune du Sage n'est plus dans la première salle, mais dans la deuxième — pour que rien ne
     dépende de l'entrée (le puits aujourd'hui, la crypte dans l'enquête 3) */
  galerie:{nom:'La galerie effondrée', objets:['bourse', 'rune']},
  aeration:{nom:'Le puits d\'aération', objets:['herbes']},            /* (la sacoche est retirée : plus de sac à remplir, Romain, 10 novembre) */
  rats:{nom:'La salle des rats', combat:'rats'},
  reserve:{nom:'La réserve', objets:['fleches-argent', 'fleches-lourdes']},      /* deux carquois dans un coffre : on prend ce que les mains peuvent porter */
  canaux:{nom:'Les canaux de la ville d\'avant', combat:'canaux', roue:true},      /* la roue qui lève la grille du passage secret (D.ROUE) */
  egouts:{nom:'Les égouts tournants', combat:'egouts', boucle:'canaux'},
  givre:{nom:'La grotte de la fleur de givre', objets:['fleur-givre']},
  toiles:{nom:'La cave aux toiles', combat:'toiles'},
  eboulis:{nom:'Le cul-de-sac éboulé', tas:true, crane:true},
  dalles:{nom:'Le couloir aux dalles', piege:'dalles'},
  atelier:{nom:'L\'atelier des Fondateurs', combat:'atelier'},
  bibliotheque:{nom:'La bibliothèque engloutie', objets:['page-dechiree'], coffre:['cristal-lune', 'baton-chene']},
  portes:{nom:'La salle aux trois portes', portes:{oeil:'ossuaire', gueule:'crypte', lune:'toiles'}},
  crypte:{nom:'La fausse crypte', combat:'crypte', objets:['amulette'], apresCombat:true},
  ossuaire:{nom:'L\'ossuaire', combat:'ossuaire'},
  camp:{nom:'Le feu de camp', repos:true},
  bassin:{nom:'Le grand bassin', combat:'bassin'},
  porte4:{nom:'La porte aux quatre signes', donne:'porte:odette', pour:'sage'},
  leo:{nom:'La dernière salle', donne:'leo:attrape', pour:'barde', fin:true}
};

/* le couloir aux dalles : 6 pas ; à chaque pas, deux dalles (celle du fond, celle de devant) ; une seule est claire.
   Les éléments de scenes.js s'appellent « dalle-<6 + pas>-<0 : fond | 1 : devant> ». Rien à l'écran ne dit laquelle est sûre. */
D.DALLES = {pas:6, sures:['fond', 'devant', 'fond', 'devant', 'fond', 'devant'], degats:15};
/* Romain, 10 novembre : « pas forcément que les dalles claires, sinon c'est trop facile ; sur le plan, une sorte de code :
   noir, blanc, blanc… ». Le chemin sûr est donc une suite de couleurs, notée en code sur le plan du Sage (« N B B, N B N »).
   Au pas n° k, la dalle du fond est blanche (claire) si k est pair, noire (sombre) sinon : regles.js en tire la rangée sûre. */
D.DALLES.code = ['noir', 'blanc', 'blanc', 'noir', 'blanc', 'noir'];

/* la roue des canaux : elle lève la grille du passage secret vers la cave aux toiles. Il faut la tourner dans le bon ordre
   ('d' : un cran à droite, 'g' : un cran à gauche). Rien ne se passe avant le dernier cran : si l'ordre est faux, la roue
   revient toute seule (on ne peut pas deviner cran par cran). L'ordre est sur le plan du Sage, à l'encre invisible :
   « la roue : 3 à droite, 1 à gauche, 2 à droite ». */
D.ROUE = {lieu:'canaux', suite:['d', 'd', 'd', 'g', 'd', 'd'], ouvre:'passage:canaux', vers:'toiles'};

/* ===================================================================== 9. LES CODES tapés sur la tablette du Pisteur
   (les ids de donjon-codes.js ; les symboles restent là-bas). Chaque code ne marche qu'une fois. */
D.CODES = {
  'sauve:1':{sauve:true}, 'sauve:2':{sauve:true}, 'sauve:3':{sauve:true}, 'sauve:4':{sauve:true},
  'recette:givre':{recette:'givre'}, 'recette:baumelum':{recette:'baumelum'}
};

/* ===================================================================== 10. LE JOURNAL DE L'AVENTURIER
   L'étude d'un monstre donne un code (dans le journal du Pisteur). Le Sage le tape sur sa tablette : il voit le croquis du
   monstre et la page d'un vieux carnet — le journal d'un aventurier passé par là avant eux.
   Romain, 10 novembre (20 h 55 à 21 h 28) et 11 novembre (8 h 02, validé) : PAS d'énigmes à questions (« qui aurait écrit des
   énigmes ? »). Un récit : « ses déboires, ses réussites ». L'aventurier n'a ni pouvoirs ni les armes des héros : sa lampe à
   huile, sa gamelle, son feu, ce qu'il trouve sur place. Il raconte ce qu'il a vécu, il ne décrit pas les étapes, il ne dit
   pas tout (« si seulement j'avais eu… »). Tout doit être logique et concret (une lampe fige les rats, elle ne les fait pas
   se dresser ; un seul objet du début à la fin). Aux joueurs de faire le lien : le bruit = le coup de louche, la fumée = le
   fumigène, « de quoi ronger le fer » = l'acide, « les ailes collées » = la colle, la lumière = la rune du Sage.
   Une page = quelques paragraphes courts (chacun aura son 🔊). Les mots de Romain et les versions : CARNET-EXPLORATEUR.md. */
D.LIVRE = {
  rat:[
    'Des rats, gros comme des chats. Ils vivent dans le noir : tant que ma lampe à huile brûlait, ils restaient figés, sans oser approcher.',
    'J\'ai voulu en profiter pour filer… et j\'ai fait tomber ma gamelle. Quel vacarme ! Ils sont devenus enragés. C\'est ma réserve d\'huile qui m\'a sauvé : elle a coulé sur les dalles, et ils ont patiné. Ça m\'a fait gagner du temps.'
  ],
  ratcuir:[
    'Celui-là porte une cuirasse à moitié mangée par la rouille. Il n\'a même plus peur de la lumière. J\'ai essayé de le brûler, mais sa carapace le protège.',
    'Je me suis défendu comme j\'ai pu, à grands coups de gamelle, et j\'ai fini par m\'en sortir. Toute cette rouille… Si seulement j\'avais eu de quoi finir le travail.'
  ],
  chauvesouris:[
    'Elles me sont tombées dessus dans les canaux. J\'ai levé ma lampe pour les chasser : mauvaise idée, la lumière les a rendues folles.',
    'De peur, j\'ai hurlé… et elles sont tombées comme des pommes, complètement perdues. J\'en ai profité pour les ficeler, les ailes collées contre le corps. Elles ne pouvaient plus bouger. C\'est comme ça que je m\'en suis débarrassé.'
  ],
  feufollet:[
    'Ceux-là, je les ai à peine aperçus. Le temps de lever ma lampe, ils avaient avalé sa lumière, comme aspirée, jusqu\'à n\'en laisser que de la fumée.',
    'Et c\'est là que je les ai vus : tout entiers, et gigantesques. J\'ai couru. Je n\'ai jamais couru aussi vite.'
  ],
  araignee:[
    'Une araignée grosse comme un tonneau, pendue à son fil. Elle aussi, elle a l\'air de détester ma lumière.',
    'J\'ai voulu mettre le feu à ses œufs. Au lieu de brûler, ils ont tous éclos ! Cette erreur m\'a coûté mon sac de vivres.',
    'Dans la fumée, la mère est remontée se cacher, et elle m\'a entoilé par surprise. Je ne m\'en suis sorti que grâce à l\'huile de ma lampe : sur du gras, sa toile ne colle plus.'
  ],
  tetard:[
    'Au bord du grand bassin, des têtards gros comme des chiens m\'ont sauté dessus. Je les ai chassés à coups de pied, l\'un après l\'autre. Mais chaque fois que le gros crapaud plongeait, il en ramenait deux de plus.'
  ],
  roirats:[
    'Dix rats noués par la queue, qui bougent comme un seul. C\'est ignoble. Et malin, avec ça : dès que j\'ai levé ma lampe, ils se sont roulés en boule pour se protéger les uns les autres.',
    'Je n\'ai pas pu m\'empêcher de crier. Ça les a rendus furieux : ils m\'ont chargé.',
    'Je ne leur ai échappé que le soir, quand mon feu s\'est mis à fumer. Dans la fumée, ils ne savaient plus où aller : chacun tirait de son côté. Cette fois, mon cri les a fait sursauter, et j\'ai vu le nœud de leurs queues.'
  ],
  gardien:[
    'Une machine des Fondateurs, haute comme deux hommes, toute rouillée. Elle m\'a barré la route. J\'ai levé ma lampe pour voir à qui j\'avais affaire : elle est devenue folle.',
    'J\'ai couru me cacher derrière une vieille porte. Elle a cogné dessus, et sa plaque s\'est entrouverte, le temps d\'un souffle. Derrière, quelque chose brillait. C\'est là qu\'il faut mettre la lumière. Si seulement j\'avais eu de quoi ronger cette plaque pour de bon…'
  ],
  bourbe:[
    'Un crapaud grand comme une maison. Tant qu\'il reste dans l\'eau, rien ne l\'atteint. C\'est ma lampe qui l\'a fait sortir sur la berge. Là, mes coups glissaient sur sa bave.',
    'J\'ai eu le malheur de faire du bruit : il a replongé, et il est revenu avec ses petits. Alors j\'ai attendu, sans bouger. Au sec, sa bave a fini par sécher. Avec un bon feu, ça irait plus vite.',
    'Mon compagnon, lui, s\'est fait avaler. Il a gigoté là-dedans : le crapaud a éclaté de rire et l\'a recraché. C\'est la fumée de notre feu qui nous a sauvés : tout sec, il ne la supporte pas. Il est tombé à la renverse.'
  ]
};
/* « étudié » dans partie.livre : ce nombre (la simulation y lit « l'équipe sait tout de ce monstre ») */
D.ETUDIE = 4;
D.LIVRE_VIDE = 'Le journal est encore vide. Pendant un combat, le Sage peut étudier un monstre.';
D.LIVRE_COMPLET = 'Le Sage a déjà étudié ce monstre.';
/* après 2 fuites (ou défaites) dans la même salle, le journal offre le code de la bête la plus forte de la salle que le Sage n'a pas étudiée */
D.FUITES_POUR_UNE_LIGNE = 2;

/* ===================================================================== 11. LES REFUS, en deux mots */
D.MOTS = {
  sol:'Au sol !', joue:'Déjà joué', loin:'Trop loin !', debout:'Encore debout', impossible:'Impossible !',
  personne:'Personne au sol', entoile:'Entoilé !', avale:'Avalé !', haut:'Trop haut !', eau:'Sous l\'eau !',
  absent:'Pas emporté', fini:'C\'est fini', pasEncore:'Pas encore !', seul:'Un seul geste', cible:'Qui viser ?',
  combat:'Pas en combat !', use:'Code usé', inconnu:'Code inconnu', traverse:'À travers !',
  recette:'Recette inconnue', pourQui:'Pour qui ?', pris:'Déjà pris', plein:'Mains pleines', pasIci:'Pas ici !', repos:'Déjà reposés',
  rebond:'Ça rebondit !', tropFort:'Trop fort !', rien:'Rien du tout', etudie:'Déjà étudié'
};

if(typeof module !== 'undefined' && module.exports) module.exports = D;
else global.DonjonDonnees = D;
})(typeof window !== 'undefined' ? window : this);
