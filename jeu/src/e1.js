/* ==========================================================
   Enquête 1 — La Lanterne d'Or (niveau 1, tutoriel)
   Solution : Tim, au Vieux Chêne.
   ========================================================== */
(function(){
'use strict';
var E = window.ENQUETES = window.ENQUETES || {};
/* Seul le plan du Sage ouvre la forêt (Romain, 10 novembre, 14 h 56 : « c'est le Sage qui ouvre la forêt, et lui seul ; son rôle, c'est la connaissance ») :
   l'Alchimiste fait l'encre → le Sage révèle la page blanche → le Pisteur entre. Basile ne dessine plus le chemin (le code info:chemin reste gelé, plus donné). */
var FORET = [{code:'info:carte'}];
var ALT_FORET = 'La forêt est immense et toute sombre. Sans plan, tu vas te perdre ! Le Grand Livre du Sage cache peut-être un plan…';

E[1] = {
  id:1, titre:'La Lanterne d\'Or', niveau:1,
  moments:['matin', 'apresmidi', 'soir'],
  /* Pas de points d'action dans cette enquête (Romain, 4 novembre, 14 h 13 ; M.sansActions, moteur-base.js) : ce qui limite, c'est le tutoriel,
     et « un lieu ou un villageois ne donne qu'une chose par moment ». Les enquêtes 2 et 3 gardent leurs actions. */
  sansActions:true,
  /* La carte montre où est chacun (Romain, 5 novembre, 8 h 59), sauf Tim : où il est, c'est la solution (9 h 23). Sa maison reste normale. */
  carteSecret:['tim'],
  lettre:'Chers enquêteurs, c\'est une catastrophe ! Cette nuit, quelqu\'un a pris la Lanterne d\'Or dans mon bureau, à la mairie. Ce soir, c\'est la Fête des Lanternes : sans elle, aucune lanterne du village ne pourra s\'allumer ! Trouvez QUI l\'a prise, et OÙ elle se trouve, avant ce soir.',
  signature:'Monsieur Grosbec, maire de Brumeval',
  missions:{
    pisteur:'Va voir la mairie, la place, la boulangerie. Trouve des traces et des objets : un objet trouvé a un code, donne-le à la bonne personne ! La forêt est fermée tant que tu n\'as pas de plan : le Sage pourra peut-être t\'en trouver un. Tes missions, en haut de ton Carnet, te disent où aller.',
    alchimiste:'Le Sage a besoin d\'une encre révélatrice. Cherche-la dans ton grimoire : c\'est une recette secrète, le Sage te la dictera. Ensuite, va cueillir ce qui te manque, et prépare-la au chaudron. Analyse aussi les objets que l\'équipe te confie, sur ta table d\'analyse : ta loupe fera le reste !',
    barde:'Va parler aux habitants. Sur la carte, chaque maison montre le visage de celui qui y habite : pour parler à quelqu\'un chez lui, touche sa maison.',
    sage:'Lis le Grand Livre à l\'équipe : les habitants (qui fait quoi, et la taille de leurs pieds), la recette de l\'encre révélatrice, et une page toute blanche qui cache peut-être quelque chose. Tu donnes le code de chaque moment, et c\'est toi qui accuses à la fin.'
  },
  /* Missions de base, en haut du Carnet (mission.js). L'enquête 1 est le tutoriel (Romain) : chaque mission dit
     où aller et quoi faire, dans l'ordre, sans jamais dire QUI ni OÙ est la Lanterne.
     lieu : l'endroit de la mission (id de Carte.LIEUX, ou une liste) ; la carte du Pisteur s'en sert pour se dévoiler.
     plantesApres : en E1, « Ce qui pousse ici » n'apparaît au Pisteur qu'une fois ses missions faites. */
  plantesApres:true,
  /* Le tutoriel en « pilote automatique » (Romain, 4 novembre ; tuto.js) : l'enquête suit pas à pas la trame parfaite.
     Pour chaque rôle, la première étape pas encore faite est l'étape en cours : un seul lieu ouvert sur la carte,
     un rond lumineux sur ce qu'il faut toucher, et tout le reste hors de portée.
     Champs d'une étape (en plus de mission.js) :
       m : le moment prévu dans la trame (0 matin, 1 après-midi, 2 soir). Une étape « dans le village » (action:true : un lieu, un habitant,
           une analyse ; plus aucun point d'action n'est compté, sansActions) ou à cocher (manuel) attend ce moment-là.
       court : la phrase courte du bandeau (avec 🔊) ; attend : [conditions] (un code d'un équipier) + attendT : le message d'attente,
           qui commence toujours par le rôle qui va donner le code (« Attends le Pisteur : … ») ;
       passer : si l'équipier n'a pas pu (mini-jeu raté), un bouton « Passer » apparaît au moment suivant.
       Où et quoi : lieu + points (Pisteur, Sage), pnj (Barde : le lieu suit l'habitant ; chez lui, on touche sa maison, son visage est dessus),
       lieu + cueillir (Alchimiste), atelier (encre / objet à analyser), livre (une page du Grand Livre du Sage). */
  tuto:true,
  etapes:{
    pisteur:[
      {ic:'👣', m:0, action:true, lieu:'mairie', points:['massif'], t:'Mairie : le massif de fleurs. Suis les traces !', court:'Mairie : suis les traces du massif de fleurs !', histoire:'Des traces de pas toutes fraîches, au pied de la mairie… Suis-les, enquêteur !', fait:[{essaye:'pisteur:mairie:massif'}]},
      {ic:'🪟', m:0, action:true, lieu:'mairie', points:['fenetre'], t:'Mairie : la fenêtre. Tu y trouves des poils → donne leur code à l\'Alchimiste.', court:'Mairie : la fenêtre. Ta trouvaille, c\'est pour l\'Alchimiste !', histoire:'Un détail cloche, à la fenêtre de la mairie… Approche, et ouvre l\'œil !', fait:[{vu:'pisteur:mairie:fenetre'}]},
      {ic:'🏠', m:0, action:true, lieu:'mairie', points:['gouttiere'], t:'Mairie : la gouttière.', court:'Mairie : regarde la gouttière.', histoire:'Cette gouttière est toute tordue… Et si le voleur était passé par là ?', fait:[{vu:'pisteur:mairie:gouttiere'}]},
      {ic:'⛲', m:0, action:true, lieu:'place', points:['fontaine', 'affiche'], t:'Place : la fontaine et le panneau → donne le code de l\'affiche au Barde.', court:'Place : la fontaine, puis le panneau (pour le Barde).', histoire:'Sur la place, des empreintes de chien… et une affiche sur le panneau !',
        fait:[{et:[{vu:'pisteur:place:fontaine'}, {vu:'pisteur:place:affiche'}]}]},
      {ic:'🍞', m:1, action:true, lieu:'boulangerie', points:['sol', 'four'], t:'Boulangerie : regarde le sol et le four → donne le code du sol au Barde.', court:'Boulangerie : le sol (pour le Barde), puis le four.', histoire:'Ça sent le bon pain chaud… Va donc fouiner chez Gaspard, enquêteur !', fait:[{et:[{vu:'pisteur:boulangerie:sol'}, {vu:'pisteur:boulangerie:four'}]}]},
      {ic:'🗺️', m:1, lieu:'foret', t:'Entre dans la forêt : le Sage va trouver un plan dans son Grand Livre → tape son code dans ton onglet Code 🔢.', court:'Entre dans la forêt avec le plan !', histoire:'Le plan de la forêt ! En route, sous les grands arbres…',
        attend:[{code:'info:carte'}], attendT:'La forêt est immense… sans plan, on s\'y perd. Le Sage fouille son Grand Livre !',
        fait:[{code:'info:carte'}]},
      {ic:'🔀', m:1, action:true, lieu:'foret', points:['carrefour', 'ch_moulin', 'ch_puits', 'ch_chene'], t:'Forêt : le carrefour et les trois chemins (Moulin, Puits, Vieux Chêne).', court:'Forêt : le carrefour, puis les trois chemins.',
        fait:[{et:[{vu:'pisteur:foret:carrefour'}, {vu:'pisteur:foret:ch_moulin'}, {vu:'pisteur:foret:ch_puits'}, {vu:'pisteur:foret:ch_chene'}]}]},
      {ic:'🐕', m:1, action:true, lieu:'foret', points:['buisson'], t:'Forêt : attrape le petit chien (course-poursuite) → donne le code des poils à l\'Alchimiste.', court:'Forêt : attrape le chien ! Ses poils : pour l\'Alchimiste.', fait:[{vu:'pisteur:foret:buisson'}, {fini:'pisteur:foret:buisson'}]},
      {ic:'🌳', m:2, action:true, lieu:'chene', points:['racines'], t:'Les chemins du Moulin et du Puits sont vides. Ce soir, va au bout du chemin du Vieux Chêne, là où il faisait trop noir pour voir des traces.', court:'Va au bout du chemin du Vieux Chêne !',
        fait:[{vu:'pisteur:chene:racines'}, {vu:'pisteur:puits:grille'}, {vu:'pisteur:moulin:roue'}]},
      {ic:'📜', m:2, t:'Raconte tout au Sage : ce que tu as vu et trouvé.', court:'Raconte au Sage tout ce que tu as trouvé.', histoire:'Le Sage t\'attend : raconte-lui tout ce que tu as découvert !', manuel:true},
      {piste:true, t:'Ici, pour t\'entraîner, un mini-jeu raté se retente autant que tu veux. Dans les autres enquêtes, tu n\'auras qu\'un seul essai !'},   /* (Romain, 5 novembre, 13 h 19) */
      {libre:true, ic:'🔍', t:'Ensuite, cherche, parle, déduis : trouvez ensemble QUI a pris la Lanterne, et OÙ elle est !'}
    ],
    alchimiste:[
      {ic:'📦', m:0, atelier:'installer', t:'Installe ton atelier : ouvre tes cartons et installe un meuble pour ranger tes ingrédients.', court:'Atelier : ouvre un carton, puis installe un meuble.', histoire:'Bienvenue dans ton atelier ! Il sent encore la poussière… Déballe tes trésors.', fait:[{rangement:1}]},
      /* (Romain, 10 novembre, 16 h 56 : d'abord le grimoire, ensuite la cueillette — « pourquoi irait-il cueillir des baies s'il ne sait pas encore quelle recette ? ») */
      {ic:'📖', m:0, atelier:'grimoire', t:'Ouvre ton grimoire et cherche l\'encre révélatrice : c\'est une recette secrète, le Sage va te la dicter.', court:'Grimoire : le Sage te dicte la recette de l\'encre.', histoire:'Une encre qui fait parler les pages blanches ? Ton grimoire en parle… mais la recette est secrète. Le Sage, lui, la connaît !', fait:[{dictee:'revelatrice'}, {potion:'revelatrice'}]},
      {ic:'🫐', m:0, action:true, lieu:'lisiere', cueillir:true, t:'Va à la lisière de la forêt et rapporte 3 baies de sureau.', court:'Lisière de la forêt : cueille 3 baies de sureau.', histoire:'La recette veut 3 baies de sureau… et ton atelier n\'en a pas une ! Elles poussent à la lisière de la forêt.', fait:[{ingr:{baies:3}}, {potion:'revelatrice'}]},
      {ic:'🧪', m:0, action:true, atelier:'encre', t:'Prépare l\'encre révélatrice au chaudron, puis donne-la au Sage.', court:'Prépare l\'encre au chaudron, puis donne-la au Sage.', histoire:'Tout est là : la recette, et les baies ! Au chaudron, alchimiste… puis cours porter l\'encre au Sage.', fait:[{donne:'pot:revelatrice'}]},
      {ic:'🔍', m:0, action:true, atelier:'analyse', objet:'fil', t:'Le Pisteur va te donner le code de poils trouvés à la mairie : tape-le, analyse-les, puis donne leur code au Barde.', court:'Analyse les poils de la fenêtre, puis donne leur code au Barde.', histoire:'Des poils accrochés à la fenêtre de la mairie… Sous ta loupe, ils vont parler !',
        attend:[{code:'obj:fil'}], attendT:'Le Pisteur fouille la mairie… Il va sûrement te rapporter un indice !', fait:[{analyse:'fil'}]},
      {ic:'🐾', m:1, action:true, atelier:'analyse', objet:'poils', t:'Plus tard, il trouvera une touffe de poils dans la forêt : analyse-la aussi.', court:'Analyse la touffe de poils, puis raconte au Pisteur.', histoire:'Une touffe de poils, trouvée dans la forêt ! Analyse-la, puis raconte tout au Pisteur.',
        attend:[{code:'obj:poils'}], attendT:'Le Pisteur court après un indice, dans la forêt… Patience !', fait:[{analyse:'poils'}]},
      {ic:'🪶', m:2, action:true, atelier:'analyse', objet:'plume', t:'Odette a donné une grande plume noire au Barde : tape son code et analyse-la.', court:'Analyse la grande plume noire d\'Odette.', histoire:'Une grande plume noire… À qui peut-elle bien appartenir ?',
        attend:[{code:'obj:plume'}], attendT:'Le Barde rend visite à Odette… Elle lui confiera peut-être un indice.', fait:[{analyse:'plume'}]},
      {ic:'📜', m:2, t:'Raconte au Sage ce que tes analyses ont montré.', court:'Raconte au Sage ce que tes analyses ont montré.', histoire:'Le Sage t\'attend : raconte-lui ce que tes analyses ont révélé !', manuel:true},
      {piste:true, t:'Pour analyser : choisis un échantillon sur ta paillasse, puis sers-toi de ta loupe, de ton microscope et de tes bocaux.'},   /* (Romain, 10 novembre : plus de mini-jeu pour les analyses, tout se passe dans le labo) */
      {libre:true, ic:'🔍', t:'Ensuite, analyse ce que l\'équipe te confie, et aide-la à trouver QUI a pris la Lanterne, et OÙ elle est !'}
    ],
    barde:[
      /* (Romain, 5 novembre, 00 h 14 et 01 h 20 : plus d'adresses à noter, chaque maison montre le visage de son habitant, et plus de code
         du registre ; une astuce garde la place de l'ancienne première étape : les étapes suivantes gardent leur numéro, P.mission) */
      {piste:true, t:'Sur la carte, chaque maison montre le visage de celui qui y habite : touche-la pour frapper à sa porte.'},
      {ic:'👵', m:0, action:true, pnj:'odette', t:'Frappe chez Odette : touche sa maison sur la carte (son visage est dessus), et pose-lui toutes tes questions. Si elle te donne quelque chose, donne son code à l\'Alchimiste.', court:'Chez Odette : pose tes questions. Son cadeau : pour l\'Alchimiste.', histoire:'Odette, la grand-mère aux sept chats, a peut-être vu quelque chose…',
        fait:[{et:[{vu:'barde:odette:1'}, {vu:'barde:odette:2'}, {vu:'barde:odette:3'}]}]},
      /* (Romain, 10 novembre : le plan de la forêt est au Sage seul ; Basile sert au QUI, ses grosses bottes expliquent les grosses traces de la mairie) */
      {ic:'🥕', m:0, action:true, pnj:'basile', t:'Va voir Basile au potager : demande-lui où il était cette nuit.', court:'Basile, au potager : où était-il cette nuit ?', histoire:'Basile, le jardinier, bêche son potager du matin au soir… A-t-il remarqué quelque chose ?', fait:[{vu:'barde:basile:0'}]},
      {ic:'🧵', m:1, action:true, pnj:'melusine', t:'Trouve Mélusine, la couturière (à son atelier le matin, puis sur la place) : parle-lui de ses écharpes.', court:'Mélusine, sur la place : parle-lui des écharpes.', histoire:'Mélusine tricote des écharpes pour tout le village… Va donc lui en parler !',
        fait:[{et:[{vu:'barde:melusine:1'}, {vu:'barde:melusine:2'}]}]},
      {ic:'🐶', m:1, action:true, pnj:'gaspard', t:'Quand le Pisteur te donne l\'affiche du chien, montre-la à Gaspard, à la boulangerie.', court:'Boulangerie : montre l\'affiche du chien à Gaspard.', histoire:'L\'affiche du chien perdu ! Gaspard connaît tout le monde : montre-la-lui.',
        attend:[{code:'obj:affiche'}], attendT:'Le Pisteur a repéré une affiche sur la place… Il va te l\'apporter !', fait:[{vu:'barde:gaspard:1'}]},
      {ic:'🧔', m:2, action:true, pnj:'victor', t:'Ce soir, Victor le facteur est à la taverne : demande-lui ce qu\'il a vu.', court:'Taverne : demande à Victor ce qu\'il a vu.', histoire:'Ce soir, Victor le facteur traîne à la taverne… Lui, il voit tout !', fait:[{vu:'barde:victor:1'}]},
      {ic:'📜', m:2, t:'Raconte au Sage ce que les habitants t\'ont dit.', court:'Raconte au Sage ce que les habitants t\'ont dit.', histoire:'Le Sage t\'attend : raconte-lui ce que les villageois t\'ont confié !', manuel:true},
      {piste:true, t:'Pour trouver quelqu\'un, regarde sa tête sur la carte : elle montre où il est en ce moment.'},
      {piste:true, t:'Les autres te donnent des codes 📨 sur les habitants : tape-les, ils s\'écrivent sur le bon visage de ton Carnet.'},
      {libre:true, ic:'🔍', t:'Ensuite, cherche, parle, déduis : trouvez ensemble QUI a pris la Lanterne, et OÙ elle est !'}
    ],
    sage:[
      {ic:'👥', m:0, livre:'habitants', t:'Lis à voix haute « Les habitants » à toute l\'équipe : qui fait quoi, où chacun habite, et la taille de leurs pieds.', court:'Lis « Les habitants » à l\'équipe (la taille des pieds !).', histoire:'Ton Grand Livre connaît tout Brumeval : lis « Les habitants » à l\'équipe !', manuel:true},
      {ic:'🧪', m:0, livre:'recettes', t:'Lis à l\'Alchimiste la recette de l\'encre révélatrice (page « Les recettes »).', court:'Lis la recette de l\'encre à l\'Alchimiste.', histoire:'L\'Alchimiste a besoin de toi : lis-lui la recette de l\'encre révélatrice.', fait:[{lu:'recettes'}]},
      {ic:'🔭', m:0, action:true, lieu:'mairie', points:['balcon'], t:'Mairie : monte au balcon et regarde les toits.', court:'Mairie : monte au balcon et regarde les toits.', histoire:'Du balcon de la mairie, on voit tous les toits… Va jeter un œil !', fait:[{vu:'sage:mairie:balcon'}]},
      /* (Romain, 10 novembre : plus de « Passer » au tutoriel : tout se refait à l'infini, chacun réussit forcément ses missions ; sans ce plan, personne n'entre dans la forêt) */
      {ic:'❔', m:1, livre:'mystere', t:'Quand l\'Alchimiste t\'apporte l\'encre, fais parler la page blanche de ton Grand Livre → donne le code du plan au Pisteur : sans lui, personne n\'entre dans la forêt !', court:'Page blanche : reconstitue le plan (pour le Pisteur).', histoire:'L\'encre est là ! La page blanche de ton livre cache un secret… et le Pisteur compte sur toi.',
        attend:[{code:'pot:revelatrice'}], attendT:'L\'Alchimiste prépare l\'encre… Ça bouillonne, ça fume, patience !', fait:[{page:'mystere'}]},
      {ic:'📋', m:2, livre:'tableau', t:'Écoute ce que chacun a trouvé, et barre les innocents dans ton tableau d\'enquête (la première page du Grand Livre).', court:'Écoute chacun, et barre les innocents dans ton tableau.', histoire:'Chacun te raconte ses trouvailles : barre les innocents dans ton tableau !', manuel:true},
      {piste:true, t:'Quand toute l\'équipe a tout fait, donne le code du moment suivant (page ⏭️ Les codes des moments, dans ton Grand Livre).'},
      {libre:true, ic:'🔍', t:'Ensuite, écoute l\'équipe, barre les innocents dans ton tableau d\'enquête, et accuse : QUI a pris la Lanterne, et OÙ est-elle ?'}
    ]
  },
  qui:{titre:'QUI a pris la Lanterne ?', choix:['gaspard', 'basile', 'victor', 'melusine', 'odette', 'tim']},
  ou:{titre:'OÙ est la Lanterne ?', choix:[
    {id:'moulin', nom:'Le Moulin', ic:'🌾'}, {id:'puits', nom:'Le Puits', ic:'🪣'},
    {id:'chene', nom:'Le Vieux Chêne', ic:'🌳'}, {id:'toits', nom:'Les toits du village', ic:'🏠'}]},
  solution:{qui:'tim', ou:'chene'},
  /* Les photos du tableau de liège du Barde (liege.js) : les suspects, et les lieux qui comptent (tous les choix du OÙ) */
  liege:{pnj:['gaspard', 'basile', 'victor', 'melusine', 'odette', 'tim'], lieux:['mairie', 'place', 'boulangerie', 'foret', 'moulin', 'puits', 'chene', 'toits'],
    /* le dossier « Autre » (Romain, 5 novembre, 14 h 18) : les mots-clés des dialogues, chacun dès que le Barde l'a appris (liege.js) */
    mots:[
      {id:'lanterne', ic:'🏮', nom:'Lanterne d\'Or'},
      {id:'fenetre', ic:'🪟', nom:'Fenêtre de la mairie', si:[{vu:'barde:basile:1'}]},
      {id:'six', ic:'🕕', nom:'Six heures du soir', si:[{vu:'barde:basile:1'}]},
      {id:'minuit', ic:'🕛', nom:'Minuit', si:[{vu:'barde:odette:1'}]},
      {id:'silhouette', ic:'🌙', nom:'Silhouette sur les toits', si:[{vu:'barde:odette:1'}]},
      {id:'lumiere', ic:'✨', nom:'Lumière dorée', si:[{vu:'barde:odette:1'}]},
      {id:'fournil', ic:'💡', nom:'Lumière du fournil', si:[{vu:'barde:odette:0'}, {vu:'barde:margot:0'}, {vu:'barde:gaspard:0'}]},
      {id:'echarpes', ic:'🧣', nom:'Écharpes rouges', si:[{vu:'barde:melusine:1'}, {vu:'barde:melusine:2'}, {vu:'barde:odette:2'}, {code:'info:echarpe'}]},
      {id:'pirate', ic:'🐕', nom:'Pirate, le chien', si:[{vu:'barde:gaspard:1'}, {vu:'barde:victor:1'}]},
      {id:'gants', ic:'🧤', nom:'Gants gris', si:[{vu:'barde:grosbec:1'}]},
      {id:'bottes', ic:'🥾', nom:'Grosses bottes', si:[{vu:'barde:basile:0'}]},
      {id:'pieds', ic:'👣', nom:'Grands pieds', si:[{code:'info:grands_pieds'}]},
      {id:'canne', ic:'🦯', nom:'Canne d\'Odette', si:[{vu:'barde:odette:2'}]}
    ]},
  /* 🗄️ Les archives de l'enquête (Romain, 5 novembre, 14 h 26) : dans le Grand Livre du Sage, à partir de l'enquête 2 (livre.js).
     Les grands moments et ce qui peut servir pour la suite, les quatre héros confondus. Quand l'histoire ajoute une graine pour plus tard, l'écrire ici. */
  archive:{
    resume:'La nuit avant la Fête des Lanternes, la Lanterne d\'Or a disparu du bureau du maire. C\'est Tim, le petit ramoneur, qui l\'avait prise pour chercher son chien perdu.',
    parties:[
      {ic:'📜', titre:'Ce qui s\'est passé', lignes:[
        ['🐶', 'Pirate, le petit chien noir et blanc de Tim, s\'était perdu dans la forêt.'],
        ['🏮', 'Il faisait trop noir pour le chercher : Tim a pris la Lanterne d\'Or dans le bureau du maire, à la mairie.'],
        ['🌙', 'À minuit, Odette a vu de sa fenêtre une petite silhouette sauter de toit en toit, avec une lumière dorée, vers la forêt.'],
        ['🕳️', 'Sous le Vieux Chêne, Tim a cru entendre Pirate. La terre a cédé : il est tombé tout au fond d\'un énorme trou.'],
        ['🪢', 'Toute l\'équipe a couru au Vieux Chêne. Gaspard est descendu au bout d\'une corde et a remonté Tim, avec la Lanterne. Pirate est revenu !'],
        ['🎉', 'Le soir, la Lanterne d\'Or a allumé toutes les lanternes de Brumeval : la fête était sauvée.']
      ]},
      {ic:'⭐', titre:'Les grands moments de l\'enquête', lignes:[
        ['🧶', 'À la fenêtre de la mairie, des poils accrochés à la poignée : en fait, des brins de laine, un bout d\'écharpe tricotée à la main, couvert de suie de cheminée.'],
        ['🧣', 'L\'écharpe de Mélusine n\'avait pas un trou : ce n\'était pas elle.'],
        ['👣', 'Les grosses traces devant la mairie : les bottes de Basile, qui avait planté des fleurs l\'après-midi.'],
        ['📜', 'Sur la place, l\'affiche du chien perdu : « Prévenez Tim, 7, rue des Lanternes. »'],
        ['🐾', 'Dans un buisson de la forêt, des poils de chien noirs et blancs, avec une petite feuille de chêne.'],
        ['🗺️', 'La page blanche du Grand Livre cachait le plan de la forêt : sans lui, personne ne pouvait y entrer.'],
        ['🌲', 'Sur le chemin du moulin, personne n\'était passé ; sur celui du puits, seulement un sanglier : la Lanterne n\'y était pas.']
      ]},
      {ic:'🔑', titre:'À retenir pour la suite', lignes:[
        ['🕳️', 'Un énorme trou sous le Vieux Chêne : personne au village ne sait d\'où il vient.'],
        ['🌬️', 'Un courant d\'air froid sort d\'entre les racines, comme si un passage s\'enfonçait sous la terre.'],
        ['🪵', 'Le maire a fait couvrir le trou de grosses planches : « C\'est bien trop dangereux, que personne ne s\'en approche ! »'],
        ['✊', 'En remontant du trou, Tim gardait l\'autre main bien fermée au fond de sa poche.'],
        ['🪶', 'La grande plume noire rapportée par le chat d\'Odette, la nuit du vol, sentait la lavande.'],
        ['🧤', 'Le maire ne quitte jamais ses gants gris, même à l\'intérieur.'],
        ['🏮', 'Le maire garde la Lanterne d\'Or dans son bureau toute l\'année. Quand on la lui a rendue, il l\'a serrée très fort contre lui.'],
        ['🔮', 'La Lanterne d\'Or est un objet magique : tout le monde croit qu\'elle sert seulement à allumer les lanternes du village.']
      ]},
      {ic:'👥', titre:'Ce qu\'on sait des habitants', lignes:[
        ['🧒', 'Tim, le petit ramoneur : il habite au 7, rue des Lanternes, avec Pirate. Il part très tôt pour ramoner les cheminées.'],
        ['👵', 'Odette, la grand-mère aux sept chats : elle ne dort presque jamais et voit tout ce qui se passe au village. Avec sa canne, elle ne grimpe plus.'],
        ['👨‍🍳', 'Gaspard, le boulanger : il fait son pain toute la nuit. Il a de très grands pieds, et il est fort comme un bœuf.'],
        ['👩‍🦰', 'Mélusine, la couturière : elle a tricoté des écharpes en laine rouge pour la moitié du village.'],
        ['👨‍🌾', 'Basile, le jardinier : il bêche son potager du matin au soir, avec ses grosses bottes.'],
        ['🧔', 'Victor, le facteur : il se lève à 5 heures pour trier le courrier.'],
        ['👩‍🍳', 'Margot, la tavernière : à la taverne, tout le village vient bavarder.'],
        ['🎩', 'Monsieur Grosbec, le maire : « J\'aurai d\'autres missions pour vous. »']
      ]}
    ]
  },
  /* Le vérificateur refuse tout texte qu'un joueur obtient seul et qui contient un de ces mots, sauf s'il fait partie d'un indice prévu ou s'il a été relu (ok). */
  sensibles:['tim', 'suie', 'ramon', 'petite main', 'petites main', 'ronfle'],
  depart:{alchimiste:{ingr:{eau:2, miel:2}}},
  registre:{
    gaspard:{maison:'F1', note:'Fort comme un bœuf. Fait le pain la nuit, devant son four à bois.'},
    basile:{maison:'B3', note:'Toujours de la boue sur ses grosses bottes.'},
    victor:{maison:'L6', note:'Distribue le courrier chaque matin.'},
    melusine:{maison:'L4', note:'Tricote plus vite que son ombre.'},
    odette:{maison:'L2', note:'Marche avec une canne. Ne dort presque jamais.'},
    tim:{maison:'L7', note:'Petit ramoneur de 10 ans : il grimpe sur les toits pour nettoyer les cheminées. Toujours plein de suie !'}
  },
  objets:{
    /* (Romain, 10 novembre : le Pisteur trouve « des poils », ni un fil ni rouge ; c'est l'analyse qui montre que c'est de la laine.
       L'identifiant « fil » reste : son code est gelé) */
    fil:{nom:'Poils de la fenêtre', ic:'〰️', pour:'alchimiste'},
    poils:{nom:'Touffe de poils de la forêt', ic:'🐾', pour:'alchimiste'},
    plume:{nom:'Grande plume noire', ic:'🪶', pour:'alchimiste'},
    affiche:{nom:'Affiche du chien perdu', ic:'🐶', pour:'barde'}
  },
  infos:{
    carte:{nom:'Plan de la forêt', ic:'🗺️', pour:'pisteur', t:'Le plan de la forêt du Grand Livre. Tu peux entrer dans la forêt sans te perdre.'},
    /* plus donné depuis le 10 novembre (le plan du Sage est le seul chemin) ; gardé pour que les codes gelés ne bougent pas */
    chemin:{nom:'Chemin dessiné par Basile', ic:'✏️', pour:'pisteur', t:'Basile a dessiné le chemin de la forêt pour toute l\'équipe. Tu peux y entrer sans te perdre.'},
    /* Renseignements sur un habitant, pour le Barde (carnet.js) : 2 codes dans l'enquête 1
       (plus de code du registre, Romain, 5 novembre, 01 h 20 : le Sage lit le registre à tout le monde ; le code gelé reste dans codes-fixes.js, inutilisé) */
    echarpe:{nom:'Les poils de la fenêtre', ic:'🧶', pour:'barde', de:'alchimiste', pnj:'melusine', t:'Les poils de la fenêtre de la mairie sont des brins de laine : un bout d\'écharpe tricotée à la main.'},
    grands_pieds:{nom:'Les traces de la boulangerie', ic:'👣', pour:'barde', de:'pisteur', pnj:'gaspard', t:'À la boulangerie, la farine montre que Gaspard a de très grands pieds.'}
  },
  lieux:{
    mairie:{
      pisteur:{intro:'C\'est ici que dormait la Lanterne d\'Or. La fenêtre du bureau du maire est grande ouverte.', points:[
        /* la ville vue du ciel (Romain, 6 novembre, 2 h 34) ; un mini-jeu fait pour ce lieu (Romain, 10 novembre, 16 h 56) : au départ, les grosses
           bottes du jardinier et les petites traces s'entremêlent, puis chacune part de son côté ; les petites mènent à une gouttière, du côté
           de la forêt, où elles s'arrêtent net (quelqu'un est remonté sur les toits : ça colle avec Odette et avec la gouttière de la mairie) */
        {id:'massif', ic:'👣', nom:'Le massif de fleurs', mj:'traces',
          params:{decor:'ville', suspect:'enfant', compagnon:'botte', arrivee:'gouttiere', arriveeTxt:'Plus de traces !', compagnonTxt:'Les bottes du jardinier…',
            departTitre:'Retiens bien ces petites traces', departNom:'Petites traces toutes fraîches', departTxt:'Au départ, de grosses bottes marchent avec elles. Ne suis que les petites !'},
          t:'Dans le massif, deux sortes de traces se mêlent. De grosses bottes, sèches et craquelées : elles datent d\'hier. Et des petites, toutes fraîches, de 3 carreaux : elles datent de cette nuit ! Les petites t\'ont mené au pied d\'une gouttière, du côté de la forêt… et là, plus rien. Quelqu\'un est remonté sur les toits !',
          note:'Mairie : traces fraîches de cette nuit, 3 carreaux. Elles mènent au pied d\'une gouttière, côté forêt : quelqu\'un est remonté sur les toits. Les grosses bottes sèches datent d\'hier.',
          rate:'Les traces se brouillent… Tu as juste vu des petites traces fraîches, bien plus petites que des bottes d\'homme.',
          rateNote:'Mairie : des petites traces fraîches de cette nuit, bien plus petites que des bottes d\'homme.', partiel:true,   /* clé : ce partiel innocente encore les grands pieds */
          ferme:'Les traces sont effacées pour de bon… Il te reste ce que tu as vu.'},
        {id:'fenetre', ic:'🪟', nom:'La fenêtre', obj:'fil',
          t:'La fenêtre a été ouverte depuis dehors. Accrochés à la poignée : des poils ! Qui a bien pu laisser ça ?',
          note:'Mairie : des poils accrochés à la poignée de la fenêtre.'},
        {id:'gouttiere', ic:'🏠', nom:'La gouttière',
          t:'La gouttière est tordue : quelqu\'un est descendu du toit en s\'y accrochant. Quelqu\'un de léger et agile, sinon elle aurait cassé !',
          note:'Mairie : quelqu\'un de léger et agile est descendu du toit par la gouttière.'}
      ]},
      sage:{intro:'Du balcon de la mairie, on voit tout le village.', points:[
        {id:'balcon', ic:'🔭', nom:'Regarder les toits',
          t:'Juste au-dessus de la fenêtre du bureau, sur les tuiles du toit, il y a des taches de poussière noire. D\'où ça vient ? Mystère…',
          note:'Toit de la mairie : des taches de poussière noire au-dessus de la fenêtre.'}
      ]}
    },
    place:{
      pisteur:{intro:'Au milieu, la fontaine. Tout autour, les lanternes de la fête attendent d\'être allumées.', points:[
        {id:'fontaine', ic:'💧', nom:'La fontaine',
          t:'Sur le bord de la fontaine : des traces de pattes de chien, toutes mouillées.',
          note:'Place : des traces de pattes de chien près de la fontaine.'},
        {id:'affiche', ic:'📌', nom:'Le panneau', obj:'affiche', ok:'L\'affiche parle du chien, pas de la Lanterne.',
          t:'Une affiche : « PERDU : PIRATE, petit chien noir et blanc. Prévenez Tim, 7, rue des Lanternes. »',
          note:'Place : Tim a perdu son chien Pirate, noir et blanc. Il habite au 7, rue des Lanternes.'},
        {id:'lanternes', ic:'🏮', nom:'Les lanternes',
          t:'Des centaines de lanternes éteintes. Sans la Lanterne d\'Or, impossible de les allumer ce soir !'}
      ]},
      alchimiste:{cueillir:[{ingr:'eau', n:2}]}
    },
    boulangerie:{
      pisteur:{intro:'Ça sent bon le pain chaud ! C\'est la boutique de Gaspard.', points:[
        {id:'sol', ic:'👣', nom:'Le sol', donne:'info:grands_pieds',
          t:'De la farine partout, et de grosses traces de bottes toutes blanches : Gaspard a de très grands pieds.',
          note:'Boulangerie : Gaspard a de très grands pieds.'},
        {id:'four', ic:'🔥', nom:'Le four', ok:'Fausse piste : la suie peut aussi venir du four.',
          t:'Le four est encore chaud : quelqu\'un a fait du pain toute la nuit. Il y a de la suie tout autour.',
          note:'Boulangerie : du pain toute la nuit, et de la suie autour du four.'}
      ]}
    },
    foret:{
      verrou:{besoin:FORET, t:ALT_FORET},
      pisteur:{intro:'Tu trouves le bon sentier. Te voilà au carrefour de la forêt.', points:[
        {id:'carrefour', ic:'🔀', nom:'Le carrefour',
          t:'Trois chemins partent d\'ici : vers le Moulin, vers le Puits et vers le Vieux Chêne.'},
        {id:'ch_moulin', ic:'🌾', nom:'Chemin du Moulin',
          t:'Sur le chemin du Moulin, la boue est toute lisse : personne n\'est passé.',
          note:'Chemin du Moulin : personne n\'est passé.'},
        {id:'ch_puits', ic:'🐗', nom:'Chemin du Puits',
          t:'Sur le chemin du Puits, rien que de grosses traces de sabots : un sanglier est passé par là, c\'est tout.',   /* (Romain, 10 novembre : plus de « aucune trace d'enfant », ça donnait la réponse) */
          note:'Chemin du Puits : seulement un sanglier.'},
        {id:'ch_chene', ic:'🌳', nom:'Chemin du Vieux Chêne',
          t:'Sur le chemin du Vieux Chêne, il fait bien trop noir pour voir des traces…',
          note:'Chemin du Vieux Chêne : trop sombre pour voir des traces.'},
        {id:'buisson', ic:'🐕', nom:'Le petit chien', mj:'poursuite', params:{fuyard:'chien', decor:'foret'}, obj:'poils',
          t:'Un petit chien noir et blanc file entre les arbres ! Tu cours derrière lui… Il plonge sous un buisson épineux et t\'échappe, mais une touffe de poils reste accrochée aux épines !',
          note:'Forêt : un petit chien noir et blanc s\'est enfui. Une touffe de ses poils est restée dans un buisson épineux.',
          rate:'Le chien est bien trop rapide : il disparaît entre les arbres. Il était noir et blanc.', ferme:'Le chien a disparu pour de bon…',
          rateNote:'Forêt : un petit chien noir et blanc s\'enfuit entre les arbres.'}
      ]},
      alchimiste:{cueillir:[{ingr:'champignon', n:2, moments:['soir', 'nuit']}]}
    },
    chene:{
      verrou:{besoin:FORET, t:ALT_FORET},
      pisteur:{intro:'Le Vieux Chêne est immense. Sous ses branches, il fait noir comme dans un four.', points:[
        {id:'racines', ic:'🌬️', nom:'Les racines',
          t:'Entre les grosses racines, la terre s\'est effondrée : un trou immense descend sous l\'arbre, et un air froid en sort, comme si le sol respirait. Tout au fond, une lueur dorée brille faiblement… C\'est bien trop profond pour y descendre seul. Va vite le dire au Sage !',
          note:'Vieux Chêne : un trou immense sous les racines, avec une lueur dorée tout au fond.'}
      ]}
    },
    puits:{
      verrou:{besoin:FORET, t:ALT_FORET},
      pisteur:{intro:'Le vieux puits, au bord de la forêt.', points:[
        {id:'grille', ic:'🪣', nom:'La grille', t:'Le puits est fermé par une grille rouillée. Personne ne l\'a ouverte depuis des années.'}
      ]}
    },
    moulin:{
      verrou:{besoin:FORET, t:ALT_FORET},
      pisteur:{intro:'Le moulin tourne doucement au bord de la rivière.', points:[
        {id:'roue', ic:'🌾', nom:'La roue', t:'Le meunier chante en travaillant. Il n\'a vu personne cette nuit.'}
      ]}
    },
    lisiere:{alchimiste:{cueillir:[{ingr:'baies', n:3, min:3}]}},
    potager:{alchimiste:{cueillir:[{ingr:'miel', n:2}, {ingr:'menthe', n:2}]}},
    lavoir:{alchimiste:{cueillir:[{ingr:'brume', n:2, min:2, moments:['matin']}, {ingr:'eau', n:2}]}},
    herboristerie:{alchimiste:{cueillir:[{ingr:'lavande', n:2}, {ingr:'pensee', n:2}]}},
    clairiere:{verrou:{besoin:FORET, t:ALT_FORET}, alchimiste:{cueillir:[{ingr:'trefle', n:2}]}}
  },
  pnj:{
    gaspard:{ou:{matin:'boulangerie', apresmidi:'boulangerie', soir:'place'}, questions:[
      {q:'Où étiez-vous cette nuit ?', a:'Dans mon fournil, à faire le pain ! Toute la nuit. Odette a sûrement vu ma lumière.', note:'Gaspard dit qu\'il a fait le pain toute la nuit.'},
      {q:'Montrer l\'affiche du chien perdu', besoin:[{code:'obj:affiche'}], a:'Pirate, le chien de Tim ! Hier soir, Tim le cherchait partout en pleurant. Je lui ai dit : les chiens perdus filent souvent dans la forêt.', note:'Gaspard : hier soir, Tim cherchait Pirate en pleurant. Gaspard lui a parlé de la forêt.'}
    ]},
    melusine:{ou:{matin:'atelier', apresmidi:'place', soir:'place'}, questions:[
      {q:'Où étiez-vous cette nuit ?', a:'Je dormais comme un loir !', note:'Mélusine dit qu\'elle dormait.'},
      {q:'Vous tricotez des écharpes ?', a:'Oh oui ! Cet hiver, j\'ai tricoté des écharpes en laine rouge pour la moitié du village. Même moi, j\'en porte une !', note:'Mélusine a tricoté des écharpes rouges pour beaucoup de monde au village, et elle en porte une.'},
      {q:'Et votre écharpe à vous ?', a:'La voici, autour de mon cou. Regardez : pas un trou, pas un fil qui dépasse !', note:'L\'écharpe de Mélusine n\'a pas un trou.'}
    ]},
    basile:{ou:{matin:'potager', apresmidi:'potager', soir:'taverne'}, questions:[
      {q:'Où étiez-vous cette nuit ?', a:'Dans mon lit ! Mais hier après-midi, j\'ai planté des fleurs devant la mairie. Mes grosses bottes ont dû laisser des traces.', note:'Basile a planté des fleurs devant la mairie hier après-midi, avec ses grosses bottes.'},
      {q:'Avez-vous vu quelque chose ?', a:'Quand je suis parti, à six heures du soir, la fenêtre de la mairie était bien fermée.', note:'Basile : à 6 heures du soir, la fenêtre de la mairie était fermée.'},
      {q:'Vous connaissez la forêt ?', a:'La forêt ? Elle est si grande qu\'on s\'y perd, même moi ! Il paraît que le Grand Livre du Sage cache un vieux plan. Demande-lui !', note:'Basile : on se perd dans la forêt. Le Grand Livre du Sage cacherait un vieux plan : demande au Sage !'}
    ]},
    odette:{ou:{matin:'L2', apresmidi:'place', soir:'L2'}, questions:[
      {q:'Où étiez-vous cette nuit ?', a:'À ma fenêtre, comme toutes les nuits : je ne dors jamais ! La lumière de la boulangerie est restée allumée jusqu\'au matin.', note:'Odette : la lumière de la boulangerie est restée allumée toute la nuit.'},
      {q:'Avez-vous vu quelque chose ?', a:'Oh oui ! À minuit, une petite silhouette a sauté de toit en toit, avec une lumière dorée qui brillait très fort. Elle est partie vers la forêt.', note:'Odette : à minuit, une petite silhouette avec une lumière dorée a filé sur les toits, vers la forêt.'},
      {q:'Et votre écharpe rouge ?', a:'Elle est sur mes épaules, toute neuve ! Et avec ma canne, ça fait longtemps que je ne grimpe plus sur les toits.', note:'L\'écharpe d\'Odette est neuve. Avec sa canne, elle ne grimpe plus.'},
      {q:'Vos chats ont vu quelque chose ?', a:'Mon chat Moustache a rapporté ça cette nuit. Moi qui ne dors presque jamais, je vois tout ce qui se passe au village… mais ça, je ne sais pas d\'où ça vient ! Tiens, prends-le.', note:'Odette t\'a donné une grande plume noire rapportée par son chat.', obj:'plume'}
    ]},
    victor:{ou:{matin:'poste', apresmidi:'place', soir:'taverne'}, questions:[
      {q:'Où étiez-vous cette nuit ?', a:'Au lit ! Je me lève à cinq heures pour trier le courrier.', note:'Victor dormait. Il se lève à 5 heures.'},
      {q:'Avez-vous vu quelque chose ?', a:'Ce matin, à l\'aube, un petit chien noir et blanc courait vers la forêt. Il avait l\'air de chercher quelqu\'un.', note:'Victor : à l\'aube, un petit chien noir et blanc courait vers la forêt.'}
    ]},
    voisin:{ou:{matin:'L7', apresmidi:'L7', soir:'L7'}, questions:[
      {q:'Frapper chez Tim', a:'Personne ne répond. Le voisin passe la tête par sa fenêtre : « Tim ? Il part souvent très tôt pour ramoner les cheminées. Je ne sais pas où il est. »', note:'Personne chez Tim. D\'après le voisin, il part souvent très tôt pour son travail.', ok:'Tim est souvent absent : ce n\'est pas une preuve.'}
    ]},
    grosbec:{ou:{matin:'mairie', apresmidi:'mairie', soir:'place'}, questions:[
      {q:'Où était la Lanterne ?', a:'Dans mon bureau, à la mairie. Je la garde toute l\'année… pour la protéger, bien sûr.', note:'Le maire garde la Lanterne d\'Or dans son bureau toute l\'année.'},
      {q:'Pourquoi gardez-vous vos gants ?', a:'Mes gants ? Euh… J\'ai toujours froid aux mains. Allez, allez, au travail !', note:'Le maire ne quitte jamais ses gants gris, même à l\'intérieur.'}
    ]},
    margot:{ou:{matin:'taverne', apresmidi:'taverne', soir:'place'}, questions:[
      {q:'Quelles nouvelles ?', a:'Tout le village ne parle que de la Lanterne ! Et cette nuit, Gaspard a encore fait du pain : ça sentait bon jusqu\'ici.', note:'Margot : cette nuit, Gaspard faisait du pain.'}
    ]}
  },
  /* Les trois analyses se font au labo (Romain, 10 novembre, 17 h 18 : « il faut brancher ce nouveau labo dans les enquêtes » ; labo.js ;
     les fiches du labo : src/labo/30-donnees.js). On y cherche avec la loupe, le microscope, les bocaux ; rien ne se rate ; l'analyse est faite
     quand l'essentiel est reconnu (les poils de la fenêtre : laine tricotée + suie ; la touffe de la forêt : chien + feuille de chêne ;
     la plume : plume d'oie + pollen de lavande). Le code s'écrit sur l'ardoise du labo ; en sortant, la fiche de la découverte ci-dessous. */
  labo:['fil', 'poils', 'plume'],
  /* les trouvailles en plus (pas obligatoires) : une petite note au Carnet, la première fois */
  laboNotes:{
    brun:'Sur la laine de la fenêtre : un peu de terre de jardin.',
    orange:'Sur la laine de la fenêtre : un éclat de tuile.',
    or:'Sur la laine de la fenêtre : une paillette de feuille d\'or, comme sur la Lanterne !',
    rouge:'La laine de la fenêtre a été teinte avec de la garance et de la pelure d\'oignon.',
    bardane:'Dans la touffe de poils : des graines de bardane, qui s\'accrochent à tout ce qui passe.',
    encre:'Le noir de la plume : des mûres et du brou de noix.'
  },
  analyses:{
    /* (Romain, 10 novembre, 16 h 56 : plus de mini-jeu pour les analyses de l'Alchimiste ; tout se passe dans son labo.
       Les poils de la fenêtre : ni « fil » ni « rouge » pour le Pisteur ; c'est la loupe de l'Alchimiste qui montre que c'est de la laine) */
    fil:{donne:'info:echarpe',
      t:'Sous ta loupe, surprise : ce ne sont pas des poils de bête ! Ce sont des brins de laine tricotée à la main… un morceau d\'écharpe. Ils sont couverts de SUIE noire, comme dans les cheminées.',
      note:'Analyse des poils de la fenêtre : des brins de laine tricotée main, un bout d\'écharpe, plein de suie de cheminée.',
      detail:{t:'La suie est toute fraîche : elle date de cette nuit.', note:'Détail : la suie de la laine est toute fraîche.'}},
    poils:{
      t:'Sous ta loupe : des poils de chien, noirs et blancs. Coincée dedans : une petite feuille de CHÊNE !',
      note:'Analyse des poils : chien noir et blanc, avec une feuille de chêne.',
      detail:{t:'Les poils sont encore humides : le chien est passé ce matin, très tôt.', note:'Détail : le chien est passé ce matin très tôt.'}},
    /* (une plume d'oie teinte en noir, avec du pollen de lavande : décidé par Romain le 9 novembre, mystère pour plus tard) */
    plume:{t:'Sous ta loupe : une plume d\'oie, teinte en noir ! Elle sent la lavande : dessus, il y a du pollen de LAVANDE. D\'où peut-elle venir ? Mystère… Rien à voir avec la Lanterne. Garde-la bien : elle servira peut-être un jour.',
      note:'Analyse de la plume : une plume d\'oie teinte en noir, avec du pollen de lavande. Mystère…'}
  },
  recettes:['revelatrice'],
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'},   /* (plus de code pour le Barde : Romain, 5 novembre, 01 h 20) */
    {id:'recettes', titre:'Les recettes', ic:'🧪',
      recette:'revelatrice', t:'Encre révélatrice, pour lire l\'encre invisible : ' + window.DONNEES.texteEtapes('revelatrice') + '.',
      note:'Recette de l\'encre révélatrice : ' + window.DONNEES.texteEtapes('revelatrice') + '.'},
    /* Le tutoriel (12.2) : quand l'encre arrive, la page blanche se révèle avec le mini-jeu « Les runes » (blancheMj : livre.js la garde toute blanche).
       Raté deux fois : l'indice partiel suffit (ouvrePartiel : la page s'ouvre quand même, avec le plan à moitié effacé et son code ; partiel : pour le vérificateur). */
    {id:'mystere', titre:'La page blanche', ic:'❔', besoin:[{code:'pot:revelatrice'}, {acces:'encre'}], mj:'runes', params:{image:'carte'}, blancheMj:true, partiel:true, ouvrePartiel:true,
      avant:'Cette page est toute blanche… Mais quand on la penche vers la lumière, on dirait qu\'il y a quelque chose d\'écrit. De l\'encre invisible ? L\'Alchimiste a peut-être de quoi la révéler.',
      t:'L\'encre révélatrice fait apparaître un dessin : le plan de la forêt ! Le carrefour, puis trois chemins : vers le Moulin, le Puits et le Vieux Chêne.',
      note:'Page blanche : le plan de la forêt est apparu. Son code est pour toute l\'équipe : chacun peut le taper.', donne:'info:carte',
      rate:'L\'encre a pâli trop vite : les morceaux du dessin se brouillent…',
      tPartiel:'Il reste juste assez du dessin : le carrefour de la forêt, et trois chemins vers le Moulin, le Puits et le Vieux Chêne. Le Pisteur pourra entrer dans la forêt !',
      rateNote:'Page blanche : le plan de la forêt, à moitié effacé (le carrefour et trois chemins).'},
    {id:'fondateurs', titre:'Les fondateurs', ic:'🏛️',
      t:'Brumeval a été fondé il y a 300 ans par quatre amis : une pisteuse, un alchimiste, une barde et un sage. Comme vous ! Une vieille chanson dit qu\'ils étaient cinq… mais plus personne ne se souvient du cinquième.'}
  ],
  bonus:[
    /* (tutoriel) une mission bonus n'est proposée que pendant une attente (un code qui n'est pas encore là, le moment suivant, la fin), une seule fois */
    {id:'ballon', role:'pisteur', lieu:'clocher', moments:['apresmidi', 'soir'], mj:'tir', params:{decor:'clocher'}, or:15, titre:'Le ballon du clocher', histoire:'Un enfant pleure : son ballon est coincé tout en haut du clocher !',
      t:'Le ballon rouge d\'un enfant est coincé en haut du clocher. Coupe la ficelle avec une flèche !'},
    {id:'fournees', role:'alchimiste', lieu:'boulangerie', moments:['matin', 'apresmidi', 'soir'], mj:'bulles', or:15, titre:'Les fournées de Gaspard', histoire:'Gaspard a oublié l\'ordre de ses fournées : aide-le !',
      t:'Gaspard a oublié l\'ordre de ses fournées. Aide-le à s\'en souvenir !'},
    /* (plus de mission « Les ragots de la taverne » : Romain, 5 novembre, 9 h 03, le mini-jeu des ragots est abandonné) */
    /* La première phrase à trous du Barde (barde.js) : elle s'écrit dans son Carnet ; on la chante ensuite à Margot, une seule fois */
    {id:'chanson', role:'barde', lieu:'taverne', moments:['apresmidi', 'soir'], trous:true, or:15, titre:'La chanson de la fête', histoire:'Margot a perdu les paroles de sa chanson : aide-la !',
      t:'Margot chante la chanson de la fête, mais il y a tant de bruit dans la taverne ! Écoute-la, puis retrouve les mots qui manquent.',
      entendu:'Margot chante à tue-tête… mais avec tout ce bruit, tu n\'as entendu que des morceaux de sa chanson !',
      params:{phrases:[
        {qui:'🎶', texte:'Quand la [brume] se lève sur [Brumeval],'},
        {qui:'🎶', texte:'les [lanternes] s\'allument une à [une],'},
        {qui:'🎶', texte:'on [danse] autour de la [fontaine],'},
        {qui:'🎶', texte:'jusqu\'à ce que se couche la [lune].'}],
        pieges:['neige', 'pluie', 'Bruxelles', 'bougies', 'étoiles', 'deux', 'chante', 'saute', 'mairie', 'rivière', 'soleil']}},   /* des pièges qui vont aussi dans la phrase */
    {id:'horloge', role:'sage', lieu:'mairie', moments:['matin', 'apresmidi'], mj:'runes', or:15, titre:'L\'horloge de la mairie', histoire:'La vieille horloge de la mairie est déréglée : répare-la !',
      t:'La vieille horloge de la mairie est déréglée : remets ses runes en place !', params:{image:'horloge'}}
  ],
  fin:{
    slides:[
      'Toute l\'équipe court jusqu\'au Vieux Chêne, suivie de la moitié du village, avec des cordes et des lanternes. Tout au fond du trou, sous les racines, la lueur dorée brille toujours…',
      'Gaspard, fort comme un bœuf, descend au bout d\'une corde… et remonte Tim, couvert de terre, la Lanterne d\'Or serrée contre lui, l\'autre main bien fermée au fond de sa poche ! Au même moment, un petit chien noir et blanc jaillit des buissons et lui saute dans les bras : c\'est Pirate !',
      'Tim pleure de joie : « Pardon ! Pirate s\'était perdu dans la forêt, et il faisait si noir… J\'ai pris la lanterne pour le chercher. Sous le chêne, j\'ai cru l\'entendre aboyer, je me suis penché… la terre a cédé, et je suis tombé tout au fond. Je n\'arrivais plus à remonter ! »',
      'Au fond du trou, un courant d\'air froid souffle toujours, comme si un passage s\'enfonçait sous la terre…',
      'Le maire arrive en courant. Il serre la Lanterne contre lui, très fort.',
      'Le soir venu, la Lanterne d\'Or allume toutes les lanternes de Brumeval. Devant tout le village, le maire vous remercie : « Quelle équipe ! J\'aurai d\'autres missions pour vous. »',
      /* (Romain, 4 novembre, 14 h 13 : plus de Corbeau visible ; le maire, le vrai méchant, reste discret) */
      'Pendant la fête, tout le monde ne parle que de cet énorme trou sous le Vieux Chêne. D\'où vient-il ? Personne au village ne le sait… ni d\'où sort ce courant d\'air froid.',
      'Le maire, lui, retourne au Vieux Chêne. Il regarde longtemps le trou, sans rien dire. Le lendemain, il y fait poser de grosses planches : « C\'est bien trop dangereux, que personne ne s\'en approche ! »'
    ],
    /* une petite scène animée sous chaque texte, dans le même ordre (illus-fin.js ; Romain, 5 novembre, 9 h 37) */
    illus:['e1-course', 'e1-remonte', 'e1-pardon', 'e1-courant', 'e1-maire', 'e1-fete', 'e1-ragots', 'e1-planches'],
    calepin:[
      {ic:'🌬️', t:'Vieux Chêne : un courant d\'air froid sort d\'entre les racines.'},
      {ic:'🕳️', t:'Un énorme trou sous le Vieux Chêne : personne ne sait d\'où il vient.'},
      {ic:'🪵', t:'Le maire a fait couvrir le trou de grosses planches.'},
      {ic:'🪶', t:'La grande plume noire de la nuit du vol sentait la lavande.'},
      {ic:'🧤', t:'Le maire ne quitte jamais ses gants.'}
    ]
  },
  faits:[
    {sources:['pisteur:mairie:massif', 'sage:page:habitants'], qui:['gaspard', 'basile', 'victor']},
    {sources:['pisteur:mairie:fenetre', 'alchimiste:analyse:fil', 'barde:melusine:2'], qui:['melusine']},
    {sources:['pisteur:mairie:gouttiere', ['barde:odette:2', 'sage:page:habitants']], qui:['odette']},
    {sources:['barde:odette:1'], ou:['toits']},
    {sources:['pisteur:foret:ch_moulin'], ou:['moulin']},
    {sources:['pisteur:foret:ch_puits'], ou:['puits']},
    {sources:['pisteur:foret:buisson', 'alchimiste:analyse:poils'], ou:['moulin', 'puits']}
  ]
};
})();
