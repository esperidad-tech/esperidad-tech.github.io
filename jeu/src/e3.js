/* ==========================================================
   Enquête 3 — Les feux du moulin (niveau 3) — version saison 1 (DESIGN-saison1.md § 7)
   Solution : Fortuné, sous les meules, aidé par Basile (3 questions, 5 × 3 × 3 = 45 réponses).
   Clés de voûte : la couleur du fil (Alchimiste + carnet de Mélusine), la grille du Sage (Margot),
   les traces dans la farine (l'indice partiel suffit).
   ========================================================== */
(function(){
'use strict';
var E = window.ENQUETES = window.ENQUETES || {};
var D = window.DONNEES;

E[3] = {
  id:3, titre:'Les feux du moulin', niveau:3,
  /* L'ancienne histoire (le Corbeau) ne suit plus la nouvelle enquête 2 (§ 12.11) : pas jouable tant qu'elle n'est pas réécrite.
     Le village montre « Enquête 3 : en cours d'écriture » (moteur-ecrans.js, moteur-actions.js), verif.js la laisse de côté. */
  enEcriture:true,
  moments:['matin', 'apresmidi', 'soir', 'nuit'],
  lettre:'Chers enquêteurs, depuis trois nuits, des lumières vertes dansent au vieux moulin, et chaque matin, un sac de farine a disparu ! Gaspard accuse le meunier, le meunier jure qu\'il n\'y est pour rien, et tout le village se dispute. Gaspard dit aussi que ces sacs sont bien trop lourds pour une seule personne… J\'ai embauché un garde champêtre, Silas, mais il ne voit rien. Trouvez QUI vole la farine, OÙ, dans le moulin, il cache son secret… et QUI l\'aide à porter les sacs !',
  signature:'Monsieur Grosbec, maire de Brumeval',
  missions:{
    pisteur:'Fouille le moulin et le pont. Le soir, quelqu\'un rôde au bord de l\'eau : attrape-le ! La nuit, cache-toi dans le moulin pour voir d\'où viennent les lumières… il te faudra de la lumière.',
    alchimiste:'Analyse ce que le Pisteur rapporte du moulin. Un fil de couleur ? Reproduis sa couleur exacte : Mélusine peut te prêter de quoi faire des teintures. Prépare aussi une potion de lumière pour le Pisteur, et l\'Élixir du Cœur vaillant pour le Sage.',
    barde:'Tout le monde a un avis sur le meunier ! Interroge les habitants en regardant bien leur visage, interroge ensemble les témoins de la taverne, et va voir Mélusine : elle connaît toutes les couleurs du village.',
    sage:'Étudie les vieux plans du moulin et remplis la grille « Où était chacun à minuit ? ». Compare la couleur de l\'Alchimiste avec le carnet de Mélusine. Tu donnes les codes et tu accuses : il y a TROIS questions.'
  },
  /* Missions de base, en haut du Carnet (mission.js) : générales, sans chemin tout tracé. */
  etapes:{
    pisteur:[
      {ic:'🌾', t:'Fouille le vieux moulin de fond en comble.',
        fait:[{et:[{ou:[{essaye:'pisteur:moulin:farine'}, {apres:3}]}, {vu:'pisteur:moulin:fil'}, {vu:'pisteur:moulin:meules'}]}]},
      {ic:'🌉', t:'Attrape celui qui rôde au bord de la rivière, le soir.', fait:[{essaye:'pisteur:pont:poursuite'}]},
      {ic:'💚', t:'Découvre où vont les lumières vertes.', fait:[{essaye:'pisteur:moulin:guet'}, {vu:'pisteur:tunnel_moulin:tunnel'}]},
      {piste:true, t:'La nuit, le moulin est tout noir : il te faudra de la lumière.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI vole la farine, OÙ est son secret, et QUI l\'aide à porter les sacs ?'}
    ],
    alchimiste:[
      {ic:'🔬', t:'Fais parler ce que le Pisteur rapporte du moulin.', fait:[{et:[{ou:[{analyse:'poussiere'}, {fini:'alchimiste:analyse:poussiere'}]}, {ou:[{analyse:'fil'}, {fini:'alchimiste:analyse:fil'}]}]}]},
      {ic:'💡', t:'Aide le Pisteur à y voir clair, la nuit.', fait:[{donne:'pot:lumiere'}]},
      {ic:'❤️', t:'Prépare l\'Élixir du Cœur vaillant pour le Sage (la recette est dans son Grand Livre).', fait:[{potion:'coeur'}]},
      {piste:true, t:'Pour reproduire une couleur, il faut des teintures : le Barde peut t\'aider à en trouver.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI vole la farine, OÙ est son secret, et QUI l\'aide à porter les sacs ?'}
    ],
    barde:[
      {ic:'🎨', t:'Trouve qui, au village, peut aider l\'équipe avec les couleurs.', fait:[{et:[{vu:'barde:melusine:0'}, {vu:'barde:melusine:1'}]}]},
      {ic:'🔍', t:'Démasque celui qui porte les sacs.', fait:[{vu:'verite:basile:1'}]},
      {ic:'🍺', t:'Le soir, à la taverne, interroge les témoins tous ensemble : lequel ment ?', fait:[{vu:'ecoute:depositions'}, {vu:'ecoute2:depositions'}]},
      {piste:true, t:'Une couturière connaît toutes les couleurs du village.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI vole la farine, OÙ est son secret, et QUI l\'aide à porter les sacs ?'}
    ],
    sage:[
      {ic:'📐', t:'Découvre ce qui a disparu des vieux plans du moulin.', fait:[{page:'plan'}, {fini:'sage:page:plan'}]},
      {ic:'🧩', t:'Vérifie où était chacun à minuit.', fait:[{page:'grille'}, {fini:'sage:page:grille'}]},
      {ic:'🧵', t:'Trouve d\'où vient le fil vert.', fait:[{page:'carnet'}]},
      {piste:true, t:'Compare ce que disent les témoins : qui était où, à minuit ?'},
      {libre:true, ic:'🔍', t:'Écoute l\'équipe, puis accuse. Attention, TROIS questions : QUI, OÙ, et QUI l\'aide ?'}
    ]
  },
  qui:{titre:'QUI vole la farine du moulin ?', choix:['fortune', 'farinel', 'silas', 'iris', 'margot']},
  ou:{titre:'OÙ se cache son secret ?', choix:[
    {id:'meules', nom:'Sous les meules', ic:'⚙️'}, {id:'roue', nom:'Derrière la roue', ic:'🎡'}, {id:'pont', nom:'Sous le pont', ic:'🌉'}]},
  quoi:{titre:'QUI l\'aide à porter les sacs ?', choix:[
    {id:'basile', nom:'Basile', ic:'👨‍🌾', pnj:true}, {id:'silas', nom:'Silas', ic:'💂', pnj:true}, {id:'farinel', nom:'Farinel', ic:'🧑‍🌾', pnj:true}]},
  solution:{qui:'fortune', ou:'meules', quoi:'basile'},
  /* La quatrième accusation (Romain, 3 novembre) : après les trois bonnes réponses, le Sage peut désigner le Corbeau.
     Elle ne coûte aucun cœur. Silas est arrivé cette semaine (le Corbeau veille depuis l'enquête 1), Fortuné a été trompé par l'homme masqué.
     La fin est la même pour toute l'équipe : le maire se démasque et fait arrêter les enquêteurs. */
  corbeau:{titre:'Une dernière question… QUI est le Corbeau ?', choix:['grosbec', 'silas', 'fortune'], solution:'grosbec',
    t:'Vous avez trouvé le voleur de farine. Mais depuis la Fête des Lanternes, quelqu\'un se cache derrière tout ça. Relisez votre calepin, parlez-en ensemble… et désignez le Corbeau !',
    bravo:'Tu as vu juste : le Corbeau, c\'est le maire ! Mais chut… Regardez bien la fin de l\'histoire.',
    rate:'Hmm… Ce n\'est pas lui. Regardez bien la fin de l\'histoire : vous allez comprendre.'},
  /* Les photos du tableau de liège du Barde (liege.js) : les suspects, ceux qui ont pu aider, deux témoins, les lieux du OÙ, le moulin et la taverne */
  liege:{pnj:['fortune', 'farinel', 'silas', 'iris', 'margot', 'basile', 'victor', 'melusine'], lieux:['moulin', 'meules', 'roue', 'pont', 'taverne']},
  sensibles:['fortuné', 'colporteur', 'pastille', 'pelle', 'trésor', 'verre vert', 'sous le plancher', 'cave', 'réglisse', 'citrouille'],
  recettes:['coeur'],
  registre:{
    fortune:{note:'Colporteur. Il voyage avec sa charrette et loge à la taverne depuis la semaine dernière.'},
    farinel:{note:'Meunier. Il porte de gros sabots et chante en travaillant.'},
    silas:{maison:'B1', note:'Nouveau garde champêtre, arrivé cette semaine. Embauché par le maire.'},
    iris:{maison:'F4', note:'Herboriste. Elle cueille certaines plantes la nuit.'},
    margot:{maison:'L1', note:'Tavernière. La taverne ferme à une heure du matin.'},
    basile:{maison:'B3', note:'Jardinier. Toujours de la boue sur ses grosses bottes.'}
  },
  objets:{
    fil:{nom:'Fil vert', ic:'🧵', pour:'alchimiste'},
    poussiere:{nom:'Poussière grise', ic:'🪨', pour:'alchimiste'},
    carnet:{nom:'Carnet de couleurs de Mélusine', ic:'📒', pour:'sage'},
    registre_trappe:{nom:'Registre des gardiens de la trappe', ic:'📔', pour:'barde'}
  },
  infos:{
    /* Renseignements sur un habitant, pour le Barde (carnet.js) : 4 codes dans l'enquête 3 (temoin_basile, sabots, minuit, verts) */
    sabots:{nom:'Les traces dans la farine', ic:'👣', pour:'barde', de:'pisteur', pnj:'farinel', t:'Dans la farine du moulin : des bottes à clous de 4 carreaux. Ce ne sont pas les gros sabots de Farinel, qui font 5 carreaux.'},
    minuit:{nom:'La grille de minuit', ic:'🧩', pour:'barde', de:'sage', t:'La grille du Sage : où étaient Margot et Silas à minuit.', pnj:{
      margot:'À minuit, Margot était à la taverne.', silas:'À minuit, Silas était au moulin, mais son rapport dit « rien à signaler ».'}},
    verts:{nom:'Les verts du carnet', ic:'📒', pour:'barde', de:'sage', t:'Le carnet de couleurs : le vert de Silas et le vert d\'Iris.', pnj:{
      silas:'Son chapeau est vert sapin (carnet de Mélusine).', iris:'Son tablier est vert pomme (carnet de Mélusine).'}},
    temoin_basile:{nom:'Basile, attrapé au bord de l\'eau', ic:'👨‍🌾', pour:'barde', de:'pisteur', pnj:'basile', mimique:'basile', t:'Le Pisteur a attrapé Basile au bord de la rivière, avec un sac vide. Il a peur et il cache quelque chose : va le voir chez lui (3, ruelle des Brumes) ou à la taverne. Un secret : quand Basile ment, une goutte de sueur glisse sur son front.'},
    boite:{nom:'Boîte de teintures de Mélusine', ic:'🎨', pour:'alchimiste', outil:'teintures', t:'Mélusine te prête sa boîte de teintures : tu peux maintenant reproduire la couleur exacte d\'un fil.'},
    passage_tunnel:{nom:'Le vieux tunnel sous le pont', ic:'🕳️', pour:'pisteur', t:'Sur les vieux plans du Sage, un vieux tunnel part de l\'arche du pont. Le passage est ouvert !'},
    serrure:{nom:'La serrure de runes', ic:'🔷', pour:'sage', t:'Le Pisteur a trouvé un coffre fermé par une serrure de runes, dans le vieux tunnel. Remets les runes en place pour trouver la combinaison !'},
    combinaison:{nom:'La combinaison du coffre', ic:'🔓', pour:'pisteur', t:'Le Sage a trouvé la combinaison de la serrure de runes : tu peux ouvrir le coffre du vieux tunnel !'}
  },
  lieux:{
    moulin:{
      pisteur:{intro:'Le vieux moulin grince au bord de la rivière. À l\'intérieur, deux énormes meules de pierre.', points:[
        {id:'farine', ic:'👣', nom:'La farine renversée', moments:['matin', 'apresmidi', 'soir'], mj:'traces', donne:'info:sabots',
          t:'Dans la farine renversée par terre : des empreintes de bottes à clous, de 4 carreaux. Ce ne sont pas celles du meunier : ses gros sabots font 5 carreaux.',
          note:'Moulin : empreintes de bottes à clous de 4 carreaux dans la farine renversée (pas les sabots du meunier).',
          rate:'Le vent a soufflé la farine… Tu as juste vu des marques de clous : ce ne sont pas des sabots.',
          rateNote:'Moulin : des marques de bottes à clous dans la farine, pas des sabots.', partiel:true},   /* clé : « pas des sabots » innocente encore Farinel */
        {id:'fil', ic:'🧵', nom:'Une écharde du plancher', obj:'fil',
          t:'Un fil vert est accroché à une écharde, tout près des meules. Quelqu\'un est passé par là en se baissant ! De quel vert est-il ? L\'Alchimiste saura le dire.',
          note:'Moulin : un fil vert accroché à une écharde, près des meules. Code pour l\'Alchimiste.'},
        {id:'meules', ic:'⚙️', nom:'Les meules', obj:'poussiere',
          t:'Autour des grosses meules de pierre, le plancher est couvert d\'une poussière grise… pas blanche comme la farine ! Tu en ramasses un peu.',
          note:'Moulin : une poussière grise, pas blanche, autour des meules.'},
        {id:'guet', ic:'🫥', nom:'Se cacher et guetter', moments:['nuit'], mj:'cachette', besoin:[{acces:'sombre'}],
          alt:'Il fait noir comme dans un four, tu ne verrais rien ! Il te faut de la lumière : une potion de l\'Alchimiste, une lanterne… Et le garde fait sa ronde.',
          t:'Tu te caches entre deux sacs… Une lumière verte entre dans le moulin, traverse la grande salle… puis disparaît d\'un coup, comme si elle s\'enfonçait dans le sol. Dehors, une lanterne ROUGE passe devant la fenêtre… et ne s\'arrête pas.',
          note:'Moulin, la nuit : la lumière verte entre dans le moulin et s\'enfonce dans le sol. Une lanterne rouge passe dehors sans s\'arrêter.',
          rate:'Le garde passe tout près avec sa lanterne rouge ! Tu dois t\'enfuir avant d\'avoir vu quoi que ce soit.'}
      ]}
    },
    pont:{
      pisteur:{intro:'Le pont de pierre enjambe la rivière, un peu plus bas que le moulin, sur la rivière.', points:[
        {id:'riviere', ic:'🌊', nom:'Sous le pont',
          t:'Des tas de terre grise jetés dans la rivière, et des sacs de farine vides, tout mouillés. Dans la boue, de GROSSES empreintes de 5 carreaux vont du moulin jusqu\'au pont… et reviennent.',
          note:'Pont : terre grise et sacs vides dans la rivière. De grosses empreintes de 5 carreaux font des allers-retours entre le moulin et le pont.'},
        {id:'poursuite', ic:'🏃', nom:'Quelqu\'un au bord de l\'eau', moments:['soir', 'nuit'], mj:'poursuite', donne:'info:temoin_basile',
          t:'Une grande silhouette vide un sac dans la rivière… Elle te voit et s\'enfuit dans le brouillard ! Tu cours, tu sautes les flaques… et tu l\'attrapes par sa salopette : c\'est Basile, le jardinier ! Il est tout rouge : « Je ne suis pas coupable, j\'ai eu peur, je me suis enfui, mais je n\'ai rien fait ! » Une goutte de sueur glisse sur son front : c\'est comme ça quand il cache quelque chose ! Donne son code au Barde.',
          note:'Pont : Basile vidait un sac dans la rivière ! Il a eu peur et s\'est enfui. Code pour le Barde.',
          rate:'Le fuyard disparaît dans le brouillard… Tu as juste vu qu\'il était grand et qu\'il portait un sac vide.'}
      ]}
    },
    tunnel_moulin:{
      verrou:{besoin:[{code:'info:passage_tunnel'}], roles:['pisteur'], t:'Il y a peut-être un vieux passage par ici… Les vieux plans du Sage le diront.'},
      pisteur:{intro:'Sous l\'arche du pont, derrière les ronces, une vieille porte de bois ! Un tunnel humide s\'enfonce sous la terre.', points:[
        {id:'tunnel', ic:'🕸️', nom:'Le tunnel',
          t:'Le tunnel est plein de toiles d\'araignée : personne n\'est passé ici depuis des centaines d\'années. Au bout, un éboulement… et au-dessus de ta tête, de la terre toute fraîche tombe du plafond : quelqu\'un a creusé juste au-dessus, sous le moulin !',
          note:'Vieux tunnel sous le pont : personne n\'y est passé depuis des siècles. Quelqu\'un creuse au-dessus, sous le moulin.'},
        {id:'serrure', ic:'🔷', nom:'Le coffre à runes', donne:'info:serrure',
          t:'Contre le mur, un vieux coffre fermé par une serrure de runes. Impossible de l\'ouvrir… Le Sage, lui, sait lire les runes : donne-lui le code !',
          note:'Vieux tunnel : un coffre fermé par une serrure de runes. Code pour le Sage.'},
        {id:'coffre', ic:'🧰', nom:'Ouvrir le coffre', besoin:[{code:'info:combinaison'}], obj:'registre_trappe', or:20,
          t:'Clic ! Le coffre s\'ouvre. Dedans : vingt pièces d\'or anciennes (pour toi !) et un vieux registre, pour le Barde : il peut le montrer au meunier.',
          note:'Coffre du vieux tunnel : 20 pièces d\'or, et un registre pour le Barde.'}
      ]}
    },
    place:{alchimiste:{cueillir:[{ingr:'eau', n:2}]}},
    lavoir:{alchimiste:{cueillir:[{ingr:'brume', n:2, min:2, moments:['matin', 'nuit']}, {ingr:'eau', n:2}]}},
    herboristerie:{alchimiste:{cueillir:[{ingr:'lavande', n:2}, {ingr:'pensee', n:2}]}},
    potager:{alchimiste:{cueillir:[{ingr:'miel', n:2}, {ingr:'menthe', n:2}]}},
    foret:{alchimiste:{cueillir:[{ingr:'champignon', n:2}]}},
    clairiere:{alchimiste:{cueillir:[{ingr:'trefle', n:2}, {ingr:'champignon', n:2, moments:['soir', 'nuit']}]}},
    lisiere:{alchimiste:{cueillir:[{ingr:'baies', n:3}, {ingr:'ortie', n:1, besoin:[{acces:'gants'}]}]}}
  },
  pnj:{
    farinel:{ou:{matin:'moulin', apresmidi:'moulin', soir:'taverne', nuit:'moulin'}, questions:[
      {q:'Les sacs disparaissent ?', a:'Trois sacs, en trois nuits ! Et je n\'y suis pour rien, moi ! Je dors comme une souche, je n\'entends jamais rien.', note:'Farinel : trois sacs ont disparu en trois nuits. Il dort profondément.'},
      {q:'Votre moulin va bien ?', choix:[
          {q:'Bonjour, monsieur le meunier ! Votre moulin va bien ?', bon:true},
          {q:'Votre vieux moulin tout pourri grince encore ?', vexe:'Tout pourri ?! Mon moulin a trois cents ans, et il tourne encore !'}],
        a:'Ma grosse meule fait un drôle de bruit depuis trois jours. Boum, boum… comme si elle tournait au-dessus d\'un trou ! Mais la roue, elle, tourne comme une horloge.', note:'Farinel : depuis trois jours, la meule sonne creux, comme au-dessus d\'un trou. La roue va bien.'},
      {q:'Montrer le vieux registre', besoin:[{code:'obj:registre_trappe'}], a:'« Gardiens de la clé de la trappe du moulin »… La famille Grosbec, depuis trois cents ans ? Je ne savais même pas qu\'il y avait une trappe !', note:'Registre : depuis 300 ans, la famille Grosbec garde la clé de la trappe du moulin.'}
    ]},
    melusine:{ou:{matin:'atelier', apresmidi:'atelier', soir:'place', nuit:'L4'}, questions:[
      {q:'Vous connaissez les couleurs ?', a:'Toutes ! Tenez, voici mon carnet de couleurs : chaque couleur que j\'ai cousue au village, avec sa recette. Donnez-le à votre Sage.', note:'Mélusine t\'a donné son carnet de couleurs : son code est pour le Sage.', obj:'carnet'},
      {q:'Vous pourriez prêter de quoi faire des teintures ?', a:'Bien sûr ! Je vous dois bien ça, après l\'histoire des lettres. Voici ma boîte de teintures, pour votre Alchimiste.', note:'Mélusine prête sa boîte de teintures : son code est pour l\'Alchimiste.', donne:'info:boite'}
    ]},
    silas:{ou:{matin:'mairie', apresmidi:'place', soir:'pont', nuit:'moulin'}, questions:[
      {q:'Qui êtes-vous ?', a:'Silas Sec, le nouveau garde champêtre. Monsieur le maire m\'a embauché cette semaine. Je surveille tout. TOUT.', note:'Silas est le nouveau garde champêtre, embauché par le maire cette semaine.'},
      {q:'Votre lanterne ?', a:'Une lanterne de garde, rouge, réglementaire ! Je ne m\'en sépare jamais, jour et nuit.', note:'Silas : sa lanterne de garde est rouge, il ne s\'en sépare jamais.'},
      {q:'Vous avez vu les lumières du moulin ?', a:'Rien à signaler. Rien du tout. Circulez, il n\'y a rien à voir.', ment:true, vrai:'Bon… si, j\'ai vu une lumière verte. Mais le maire m\'a dit de ne pas m\'en occuper. Il a dit que ça le regardait.', note:'Silas dit qu\'il n\'a rien vu au moulin.', noteVrai:'Silas a avoué : il a vu la lumière verte, mais le maire lui a dit de ne pas s\'en occuper.'}
    ]},
    fortune:{ou:{matin:'place', apresmidi:'place', soir:'taverne'}, questions:[
      {q:'Où étiez-vous la nuit dernière ?', a:'Je dormais à la taverne, comme un bébé !', ment:true, ok:'Sortir la nuit ne prouve rien.', vrai:'Bon… je suis sorti. Je cherchais… des champignons. Oui, voilà, des champignons !', note:'Fortuné dit qu\'il dormait à la taverne.', noteVrai:'Fortuné a avoué : il est sorti la nuit dernière.'},
      {q:'Que vendez-vous ?', ok:'Le colporteur vend de tout : ça ne prouve rien tout seul.', a:'Des rubans, des chapeaux, des savons… Et des pastilles pour changer de voix ! J\'en ai vendu une boîte à un monsieur masqué, la semaine dernière.', note:'Fortuné vend de tout, et même des pastilles pour changer de voix (une boîte à un homme masqué).'},
      {q:'Avez-vous acheté quelque chose au village ?', a:'Rien du tout ! Moi, je vends, je n\'achète jamais.', ment:true, vrai:'Bon… j\'ai acheté un vieux papier à un homme masqué, avec une voix toute grave. Mais je ne dirai pas ce qu\'il y a dessus !', note:'Fortuné dit qu\'il n\'a rien acheté au village.', noteVrai:'Fortuné a avoué : il a acheté un vieux papier à un homme masqué à la voix grave.', ok:'Un vieux papier ne dit pas où ni quoi.'}
    ]},
    victor:{ou:{matin:'poste', apresmidi:'place', soir:'taverne', nuit:'L6'}, questions:[
      {q:'Où étiez-vous la nuit dernière ?', a:'À la taverne, jusqu\'à minuit, comme tous les soirs.', note:'Victor était à la taverne jusqu\'à minuit.'},
      {q:'Qui était à la taverne ?', choix:[
          {q:'Vous avez passé une bonne soirée à la taverne ?', bon:true},
          {q:'Vous traînez à la taverne tous les soirs, vous ?', vexe:'Traîner ?! Je travaille dur toute la journée, moi !'}],
        a:'Plein de monde ! Et Margot n\'a pas quitté son comptoir de toute la nuit, je peux te le jurer : elle m\'a resservi de la soupe trois fois !', note:'Victor : Margot n\'a pas quitté son comptoir de toute la nuit. (Mais Victor est parti à minuit…)'}
    ]},
    margot:{ou:{matin:'taverne', apresmidi:'taverne', soir:'taverne', nuit:'taverne'}, questions:[
      {q:'Qui est passé hier soir ?', choix:[
          {q:'Bonsoir Margot ! Qui est passé chez vous hier soir ?', bon:true},
          {q:'Vous espionnez toujours vos clients, hein ?', vexe:'Espionner ?! Je sers la soupe, moi, je n\'espionne personne !'}],
        a:'Victor jusqu\'à minuit. Basile, pour une soupe : il est reparti vers le pont, bizarre ! Et Iris, vers dix heures, avant d\'aller cueillir.', note:'Margot : Basile est reparti vers le pont après sa soupe. Iris est passée vers dix heures.'},
      {q:'Qui loge chez vous ?', a:'Le colporteur a une chambre ici. Il paie bien, c\'est tout ce que je sais.', note:'Margot : le colporteur loge à la taverne.', ok:'Ne l\'accuse de rien.'},
      /* un villageois révèle la mimique d'un menteur (barde.js) */
      {q:'Iris vous cache quelque chose ?', mimique:'iris', ok:'Un truc de menteur ne prouve rien.',
        a:'Iris ? Une gentille fille… Mais je la connais par cœur : quand elle cache quelque chose, sa bouche sourit, et ses yeux, eux, ne sourient pas.',
        note:'Margot : quand Iris ment, sa bouche sourit mais ses yeux ne sourient pas.'}
    ]},
    iris:{ou:{matin:'herboristerie', apresmidi:'herboristerie', soir:'taverne', nuit:'F4'}, questions:[
      {q:'Où étiez-vous la nuit dernière ?', a:'À la clairière ! Je cueillais des champignons lumineux : ils ne brillent que la nuit.', ment:true, ok:'Cueillir la nuit ne prouve rien.',
        vrai:'D\'accord… j\'étais derrière le moulin, à cueillir des épis d\'argent, une plante très rare. J\'ai vu une lumière verte entrer dans le moulin… et j\'ai eu peur qu\'on m\'accuse.',
        note:'Iris dit qu\'elle cueillait des champignons à la clairière.', noteVrai:'Iris a avoué : elle était derrière le moulin et elle a vu une lumière verte y entrer.'}
    ]},
    basile:{ou:{matin:'potager', apresmidi:'potager', soir:'taverne', nuit:'B3'}, questions:[
      {q:'Avez-vous vu les lumières ?', a:'Moi ? Je me couche avec les poules ! Je n\'ai rien vu du tout.', ment:true, ok:'Sortir la nuit ne prouve rien.', vrai:'Bon… je sors la nuit. Mais je ne dirai pas pourquoi !', note:'Basile dit qu\'il se couche tôt.', noteVrai:'Basile a avoué : il sort la nuit, mais il ne dit pas pourquoi.'},
      {q:'Que faisais-tu au bord de l\'eau ?', besoin:[{code:'info:temoin_basile'}], choix:[
          {q:'Je sais que vous n\'êtes pas méchant, Basile. Que faisiez-vous au bord de l\'eau ?', bon:true},
          {q:'Alors, voleur de farine, qu\'est-ce que tu jetais dans la rivière ?', vexe:'Voleur ?! Je ne suis pas un voleur, moi !'}],
        a:'Je… je promenais mon cochon ! Voilà.', ment:true, ok:'Basile porte les sacs, mais il ne sait pas qui creuse.',
        vrai:'Bon, d\'accord… Je porte des sacs de terre du moulin jusqu\'au pont, et je les vide dans la rivière. Un homme me paie en graines de citrouille géante. Il reste au fond de son trou : je ne vois jamais son visage.',
        note:'Basile dit qu\'il promenait son cochon.', noteVrai:'Basile a avoué : c\'est LUI qui porte les sacs de terre jusqu\'au pont, pour un homme qui creuse au fond d\'un trou.'}
    ]},
    gaspard:{ou:{matin:'boulangerie', apresmidi:'boulangerie', soir:'place', nuit:'boulangerie'}, questions:[
      {q:'Pourquoi accusez-vous le meunier ?', a:'Il me manque de la farine pour mon pain ! Qui d\'autre va au moulin la nuit, hein ?', note:'Gaspard accuse le meunier : il lui manque de la farine.'}
    ]}
  },
  ecoutes:[
    {id:'depositions', role:'barde', lieu:'taverne', moments:['soir', 'nuit'], titre:'Les dépositions', mj:'depositions', reessai:true,
      intro:'Ils sont quatre au comptoir. Interroge-les tous ensemble sur la nuit dernière, du côté du moulin : trois disent la même chose, chacun avec ses mots. Un seul ment : lequel ?',
      params:{scene:{titre:'La nuit dernière', ic:'🌫️', texte:'La nuit dernière, près du moulin. Trois disent la vérité, un seul ment.'},
        depositions:[
          {qui:'margot', phrases:[{t:'Vers minuit, on a entendu des coups sourds, BOUM… BOUM…, du côté du moulin.', d:'coups'}, {t:'Il y avait un brouillard épais sur la rivière.', d:'brouillard'}, {t:'On entendait le meunier ronfler jusqu\'au pont !', d:'ronfle'}]},
          {qui:'victor', phrases:[{t:'En rentrant à minuit, j\'ai entendu des coups sourds, comme un tambour sous la terre.', d:'coups'}, {t:'Le meunier ronflait si fort qu\'on l\'entendait jusqu\'au pont.', d:'ronfle'}, {t:'Quel brouillard ! Je ne voyais même plus mes pieds.', d:'brouillard'}]},
          {qui:'gaspard', phrases:[{t:'Vers minuit, j\'ai entendu des boum, boum, sous le moulin.', d:'coups'}, 'Le garde est passé devant le moulin avec sa lanterne rouge, sans même s\'arrêter.', {t:'Et quel brouillard sur la rivière !', d:'brouillard'}]},
          {qui:'iris', ment:true, phrases:['Cette nuit-là, je suis sortie cueillir des plantes.', {t:'Il n\'y avait pas un brin de brouillard.', faux:true, d:'brouillard'}, {t:'Je n\'ai rien entendu du tout, pas un bruit.', faux:true, d:'coups'}]}
        ]},
      t:'Iris a menti sur la nuit dernière ! Tous les autres ont entendu des coups sourds vers minuit… et le meunier ronfler jusqu\'au pont : il dormait, il ne portait pas de sacs. Gaspard a aussi vu le garde passer devant le moulin à minuit, sans s\'arrêter.',
      note:'Dépositions : Iris a menti. Le meunier ronflait toute la nuit : ce n\'est pas lui qui porte les sacs. Le garde est passé devant le moulin à minuit sans s\'arrêter.',
      rate:'Tu n\'as pas trouvé qui ment… Tu te souviens seulement des coups sourds, vers minuit.',
      noteRate:'Dépositions : des coups sourds vers minuit (le menteur n\'est pas trouvé).'}
  ],
  /* Tendre l'oreille (talent du niveau 2, barde.js) : des phrases à trous, gratuites, 2 fois par enquête. Utiles, jamais indispensables :
     le moulin (la meule qui sonne creux), la taverne (Margot à son comptoir), le pont (le secret de Silas). Aucun mot sensible. */
  bribes:[
    {id:'moulin', lieu:'moulin', moments:['matin', 'apresmidi'], titre:'Le meunier parle tout seul',
      intro:'Tu entres sans bruit dans le moulin. Farinel tapote sa grosse meule en parlant tout seul…',
      phrases:[
        {qui:'farinel', texte:'Boum… boum… Ma grosse [meule] sonne creux, comme au-dessus d\'un [trou] !'},
        {qui:'farinel', texte:'Mais ma [roue], elle, tourne comme une horloge. Et moi, la nuit, je dors comme une [souche] !'}],
      pieges:['porte', 'cloche', 'puits', 'lac', 'scie', 'pompe', 'bûche', 'marmotte'],
      t:'Farinel : sa grosse meule sonne creux, comme au-dessus d\'un trou. La roue tourne bien. Il dort comme une souche.'},
    {id:'taverne', lieu:'taverne', moments:['soir'], titre:'Au comptoir de la taverne',
      intro:'Tu te glisses derrière un tonneau. Au comptoir, Margot et Victor bavardent…',
      phrases:[
        {qui:'margot', texte:'Hier soir, tu es encore parti à [minuit], Victor !'},
        {qui:'victor', texte:'Comme toujours ! Et toi, tu n\'avais pas quitté ton [comptoir] de la soirée.'},
        {qui:'margot', texte:'Et en rentrant, tu as entendu le meunier ? Il ronflait si fort qu\'on l\'entendait jusqu\'au [pont] !'}],
      pieges:['midi', 'huit', 'fauteuil', 'tablier', 'cuisine', 'puits', 'parc'],
      t:'Victor est parti de la taverne à minuit. Margot n\'avait pas quitté son comptoir de la soirée. Le meunier ronflait si fort qu\'on l\'entendait jusqu\'au pont.'},
    {id:'pont', lieu:'pont', moments:['soir'], titre:'Au bord de l\'eau', mimique:'silas',
      intro:'Caché sous l\'arche du pont, tu entends le garde marmonner en faisant sa ronde…',
      phrases:[
        {qui:'silas', texte:'Rien à [signaler], rien à signaler… Le maire m\'a dit de ne pas m\'occuper de cette [lumière] verte.'},
        {qui:'silas', texte:'Et quand je raconte des histoires, je cligne des yeux deux fois, très vite. Heureusement, personne ne le sait !'}],
      pieges:['raconter', 'déclarer', 'lanterne', 'fumée', 'flamme'],
      t:'Silas : rien à signaler… Le maire lui a dit de ne pas s\'occuper de la lumière verte. Quand Silas ment, il cligne des yeux deux fois.'}
  ],
  /* Hydromel des confidences (talent du niveau 6) : un villageois innocente un suspect (jamais le voleur) */
  alibis:{
    farinel:'Farinel ? Il ronfle si fort, la nuit, qu\'on l\'entend jusqu\'au pont. Il n\'y est pour rien !',
    silas:'Silas ? Il fait sa ronde avec sa lanterne rouge, toute la nuit. Il n\'a pas le temps de voler la farine.',
    iris:'Iris ? Elle cueille ses plantes la nuit, mais elle n\'a jamais porté un sac de farine de sa vie.',
    margot:'Margot ? À minuit, elle servait la soupe à la taverne, devant tout le monde.'
  },
  analyses:{
    fil:{mj:'melange', besoin:[{code:'info:boite'}, {outil:'teintures'}],
      alt:'Pour reproduire la couleur exacte de ce fil, il te faut des teintures. Le Barde peut demander à Mélusine de te prêter les siennes !',
      params:{recette:{pensee:3, menthe:1}},
      t:'Tu as retrouvé la couleur exacte du fil ! Ta teinture : 3 pensées et 1 menthe. Dis-le au Sage : il trouvera ce vert dans le carnet de Mélusine.',
      note:'Couleur du fil vert : 3 pensées et 1 menthe (à comparer avec le carnet de Mélusine).',
      rate:'C\'est un vert très vif… mais lequel ? Tu n\'as pas trouvé la nuance exacte. Une chose est sûre : il n\'est ni foncé comme un sapin, ni pâle comme une pomme.',
      rateNote:'Couleur du fil vert (pas finie) : un vert très vif, ni vert sapin, ni vert pomme.', partiel:true},   /* clé : de quoi comparer avec le carnet de Mélusine */
    poussiere:{mj:'bulles', t:'Ce n\'est pas de la farine : c\'est de la terre et de la pierre broyée, comme quand on creuse un trou très profond. Il y en a beaucoup trop pour venir de dehors.',
      note:'Analyse de la poussière : de la terre et de la pierre de creusage, sous le moulin.',
      rate:'Les bulles ont éclaté trop vite… Tu sais juste que ce n\'est pas de la farine.',
      detail:{t:'Cette pierre grise ne se trouve qu\'en profondeur, sous la vallée.', note:'Détail : la pierre vient de très profond.'}}
  },
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'},
    {id:'plan', titre:'Les vieux plans du moulin', ic:'📐', action:true, mj:'plans', bouton:'Superposer les plans',
      params:{carte:'moulin', secret:'meules', passage:'la cave sous les meules'},
      avant:'Les archives gardent le plan du moulin dessiné par les fondateurs, il y a 300 ans. Pose-le sur le plan d\'aujourd\'hui pour voir ce qui a changé !',
      t:'Sur le vieux plan, deux choses ont disparu des plans d\'aujourd\'hui : une cave sous les meules, avec un escalier, et un vieux tunnel sous l\'arche du pont. Sous la roue : rien du tout. Le code du tunnel est pour toute l\'équipe : chacun peut le taper.',
      note:'Vieux plans : une cave oubliée sous les meules, et un vieux tunnel sous le pont. Rien sous la roue.', donne:'info:passage_tunnel',
      rate:'Les plans ne coïncident pas…'},
    {id:'grille', titre:'Où était chacun à minuit ?', ic:'🧩', action:true, mj:'grille', donne:'info:minuit', bouton:'Remplir la grille',
      avant:'Victor jure que Margot n\'a pas quitté son comptoir… mais Victor est parti à minuit ! Avec ce que racontent les habitants, retrouve où était chacun à minuit pile, et ce qu\'il tenait.',
      params:{
        intro:'À minuit pile, la nuit dernière : où était chacun, et que tenait-il dans les mains ?',
        personnes:['margot', 'victor', 'gaspard', 'silas'],
        lieux:['taverne', 'place', 'boulangerie', 'moulin'],
        objets:['soupe', 'courrier', 'pain', 'lanterne'],
        indices:[
          {t:'meme', c1:'objet', i1:'soupe', c2:'lieu', i2:'taverne'},
          {t:'meme', c1:'objet', i1:'pain', c2:'lieu', i2:'boulangerie'},
          {t:'meme', c1:'objet', i1:'lanterne', c2:'lieu', i2:'moulin'},
          {t:'nini', p:'victor', c:'lieu', i:['taverne', 'moulin']},
          {t:'nini', p:'silas', c:'lieu', i:['taverne', 'boulangerie']},
          {t:'nest', p:'gaspard', c:'objet', i:'soupe'},
          {t:'nest', p:'victor', c:'objet', i:'pain'}],
        solution:{
          margot:{lieu:'taverne', objet:'soupe'},
          victor:{lieu:'place', objet:'courrier'},
          gaspard:{lieu:'boulangerie', objet:'pain'},
          silas:{lieu:'moulin', objet:'lanterne'}},
        confirme:'C\'est confirmé : à minuit pile, quand tout le monde entendait les coups sous le moulin, Margot servait la soupe à la taverne. Ce n\'est pas elle qui creuse ! Et autre chose : à minuit, Silas était AU MOULIN, avec sa lanterne rouge… alors que son rapport dit « rien à signaler ».',
        note:'Grille : à minuit, Margot était à la taverne (elle n\'a pas pu aller au moulin). Silas, lui, était au moulin… et son rapport dit « rien à signaler ».'},
      t:'C\'est confirmé : à minuit pile, quand tout le monde entendait les coups sous le moulin, Margot servait la soupe à la taverne. Ce n\'est pas elle qui creuse ! Et autre chose : à minuit, Silas était AU MOULIN, avec sa lanterne rouge… alors que son rapport dit « rien à signaler ».',
      note:'Grille : à minuit, Margot était à la taverne. Silas était au moulin, mais son rapport dit « rien à signaler ».',
      rate:'La grille ne tombe pas juste… Une chose est sûre quand même : à minuit, Margot était à la taverne.', rateNote:'Grille (pas finie) : à minuit, Margot était à la taverne.', partiel:true},   /* clé */
    {id:'carnet', titre:'Le carnet de Mélusine', ic:'📒', besoin:[{code:'obj:carnet'}], donne:'info:verts',
      avant:'Mélusine, la couturière, connaît toutes les couleurs du village. Le Barde peut lui demander son carnet.',
      t:'Le carnet de couleurs de Mélusine. VERT SAPIN (2 menthes, 1 myrtille, 1 charbon) : le chapeau de Silas, le garde. VERT POMME (2 menthes, 1 pensée, 1 poussière de lune) : le tablier d\'Iris. VERT PERROQUET (3 pensées, 1 menthe) : celui-là, je ne l\'ai jamais cousu pour personne !',
      note:'Carnet de Mélusine : vert sapin = chapeau de Silas ; vert pomme = tablier d\'Iris ; vert perroquet (3 pensées, 1 menthe) = jamais cousu par Mélusine.'},
    {id:'rapport', titre:'Le rapport du garde', ic:'📋', action:true, bouton:'Lire le rapport à la mairie',
      avant:'Chaque matin, le garde champêtre dépose son rapport de nuit à la mairie.',
      t:'Rapport de Silas Sec, garde champêtre. 22 heures : la taverne est pleine. 23 heures : Iris Lavandin part cueillir des plantes, avec sa lanterne jaune. Minuit : rien à signaler au moulin. 1 heure : tout le monde dort.',
      note:'Rapport de Silas : à minuit, « rien à signaler au moulin ».'},
    {id:'serrure', titre:'La serrure de runes', ic:'🔷', besoin:[{code:'info:serrure'}], mj:'runes', bouton:'Remettre les runes en place',
      params:{image:'runes'},
      avant:'Le Pisteur a trouvé un vieux coffre dans un tunnel, fermé par une serrure de runes. Quand il te donnera son code, tu pourras l\'ouvrir.',
      t:'Les runes s\'emboîtent : la serrure fait clic ! Donne la combinaison au Pisteur.',
      note:'Serrure de runes ouverte : la combinaison est pour le Pisteur.', donne:'info:combinaison',
      rate:'Les runes ne s\'emboîtent pas…'},
    {id:'recettes', titre:'Les recettes', ic:'🧪',
      t:'Élixir du Cœur vaillant, pour rendre courage au Sage : ' + D.texteEtapes('coeur') + '. Une seule par enquête : elle rend un cœur d\'accusation.',
      note:'Recette de l\'Élixir du Cœur vaillant : ' + D.texteEtapes('coeur') + '.'},
    {id:'moulin', titre:'Le plus vieux moulin', ic:'🏛️',
      t:'Le moulin est le plus vieux bâtiment de Brumeval. Ce sont les fondateurs eux-mêmes qui l\'ont construit. On raconte qu\'ils y venaient la nuit, avec des lanternes…'}
  ],
  bonus:[
    {id:'girouette', role:'pisteur', lieu:'moulin', moments:['matin', 'apresmidi'], mj:'tir', or:20, titre:'La girouette du moulin',
      t:'La girouette du moulin est coincée ! Tire une flèche dans la goupille pour la débloquer.'},
    {id:'bouquets', role:'alchimiste', lieu:'herboristerie', moments:['matin', 'apresmidi', 'soir'], mj:'differences', or:20, titre:'Les bouquets d\'Iris',
      t:'Dans sa boutique, Iris a rangé ses bouquets sur deux étagères presque pareilles. Trouve les différences entre les deux !', params:{theme:'herboristerie'}},
    {id:'cartes', role:'alchimiste', lieu:'place', moments:['matin', 'apresmidi'], mj:'double', or:20, titre:'Le jeu de cartes du colporteur',
      t:'Sur la place, le colporteur propose un jeu de cartes : trouve le symbole commun plus vite que lui !'},
    /* (plus de mission « Les ragots de la taverne » : Romain, 5 novembre, 9 h 03, le mini-jeu des ragots est abandonné) */
    /* dans la conversation (barde.js) : Margot raconte, son visage la trahit ; un seul essai */
    {id:'menteurs', role:'barde', lieu:'taverne', moments:['apresmidi', 'soir'], or:20, titre:'Le concours de menteurs', pnj:'margot',
      t:'Ce soir, concours de menteurs à la taverne ! Margot raconte trois histoires : une seule est une blague. Laquelle ?',
      repliques:[
        {texte:'La soupe d\'aujourd\'hui est aux poireaux.', ment:false},
        {texte:'Hier, j\'ai vu un poisson voler au-dessus du lavoir !', ment:true},
        {texte:'Gaspard a fait cent pains cette nuit.', ment:false}]},
    {id:'devise', role:'sage', lieu:'mairie', moments:['matin', 'apresmidi', 'soir'], mj:'alphabet', or:20, titre:'La devise des fondateurs',
      t:'Sur un vieux mur de la mairie, les fondateurs ont gravé une phrase dans leur alphabet secret. Déchiffre-la !',
      params:{message:'ENSEMBLE ON EST PLUS FORTS'}}
  ],
  fin:{
    slides:[
      'Au petit matin, toute l\'équipe descend dans le moulin. Vous poussez les grosses meules… Dessous, une trappe ! Et tout au fond, des bruits de pelle.',
      '« Sortez de là ! » Une tête couverte de poussière grise apparaît, avec un chapeau à plume tout cabossé, et un gilet vert perroquet tout déchiré : c\'est Fortuné, le colporteur !',
      'Fortuné bafouille : « Je voulais juste trouver le trésor ! Un homme masqué m\'a vendu cette carte. Il avait une voix toute grave… et pour cause : la veille, je lui avais vendu mes pastilles pour changer de voix ! »',
      'Basile baisse la tête, tout rouge : « Et moi, je portais les sacs de terre jusqu\'au pont… Il m\'avait promis des graines de citrouille géante. Je voulais tant gagner le concours ! »',
      '« Je vidais un sac de farine, je le remplissais de terre, et Basile allait la jeter sous le pont, explique Fortuné. Je comptais tout rembourser ! »',
      'La carte au trésor est fausse : il n\'y a pas de trésor. Mais au fond du trou, vous découvrez un vieux tunnel de pierre… et une grosse pierre gravée de quatre symboles : un œil, un chaudron, une lyre et une étoile. Au milieu, un cinquième creux, vide, en forme de plume.',
      'Silas, le garde champêtre, arrive en courant, suivi du maire, tout sourire. Le maire vous félicite, fait refermer la trappe… et garde la clé dans sa poche. « C\'est plus prudent. »',
      'Fortuné rend la farine au meunier, Basile replante ses carottes, et Gaspard reçoit des pastilles à la menthe pour se faire pardonner. Tout le village fait la paix.',
      'En repartant, vous croisez Silas qui écrit quelque chose dans un petit carnet noir. Quand il vous voit, il le referme d\'un coup sec…',
      'Le soir même, on frappe à vos portes. C\'est le maire, avec Silas et deux gardes. Il ne sourit plus du tout. Lentement, il retire ses gants gris… À son doigt brille une bague en argent à tête de corbeau ! « Vous en savez beaucoup trop, petits enquêteurs. Gardes, arrêtez-les ! »',
      {img:'prison', t:'Vous voilà tous les quatre au cachot de la mairie. Entre les barreaux, une plume noire tombe, avec un petit mot : <b class="corbeau">« Restez bien sages, petits enquêteurs. Quand vous sortirez, Brumeval sera à moi. Le Corbeau »</b> À suivre…'}
    ],
    calepin:[
      {ic:'🍬', t:'Fortuné a vendu des pastilles « pour changer de voix » à un homme masqué.'},
      {ic:'🪨', t:'Sous le moulin : une pierre aux quatre symboles, avec un creux en forme de plume.'},
      {ic:'🔑', t:'Le maire a gardé la clé de la trappe du moulin.'},
      {ic:'📋', t:'À minuit, Silas était au moulin… mais son rapport dit « rien à signaler ».'},
      {ic:'💂', t:'Silas : « Le maire m\'a dit de ne pas m\'occuper des lumières. »'},
      {ic:'📔', t:'Un vieux registre : depuis 300 ans, la famille Grosbec garde la clé de la trappe du moulin.'},
      {ic:'💍', t:'Le maire porte la bague en argent à tête de corbeau : le Corbeau, c\'est lui !'},
      {ic:'⛓️', t:'Le maire vous a fait enfermer au cachot de la mairie.'}
    ]
  },
  defaite:[
    'Au matin, le trou sous les meules est vide : le voleur a filé avec sa pelle. Le village se dispute encore, et le maire vous renvoie chez vous.',
    'La brume monte de la rivière et efface vos souvenirs… D\'autres enquêteurs viendront.'
  ],
  faits:[
    /* QUI */
    {sources:['pisteur:moulin:farine', 'sage:page:habitants'], qui:['farinel']},
    {sources:['pisteur:moulin:fil', 'alchimiste:analyse:fil', 'sage:page:carnet'], qui:['silas', 'iris']},
    {sources:[['barde:victor:1', 'barde:oreille:taverne'], 'sage:page:grille'], qui:['margot'], quoi:[]},
    /* OÙ */
    {sources:['pisteur:moulin:guet'], ou:['pont']},
    {sources:['pisteur:tunnel_moulin:tunnel'], ou:['pont']},
    {sources:['sage:page:plan', ['barde:farinel:1', 'barde:oreille:moulin']], ou:['roue']},
    {sources:['pisteur:moulin:meules', 'alchimiste:analyse:poussiere'], ou:['roue']},
    /* QUI L'AIDE (quoi) */
    {sources:['pisteur:pont:poursuite', 'barde:basile:1:verite'], quoi:['silas', 'farinel']},
    {sources:['pisteur:pont:riviere', 'sage:page:habitants'], quoi:['silas']},
    {sources:[['barde:ecoute:depositions', 'barde:oreille:taverne']], quoi:['farinel']}
  ]
};
})();
