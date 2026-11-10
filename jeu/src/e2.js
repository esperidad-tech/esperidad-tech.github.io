/* ==========================================================
   Enquête 2 — La rivière rouge (titre provisoire) — DESIGN-saison1.md § 12.11 (la spécification qui fait foi)
   Solution : Bastien Roulebosse, le charretier · au moulin (la pièce cachée) · quelqu'un l'a payé.
   Ce qui s'est passé (jamais dit tel quel) : avant-hier avant l'aube, Bastien, payé par un homme en cape noire,
   a rasé le champ de coquelicots d'Iris et emporté les fleurs en charrette vers le moulin ; dans une pièce cachée
   (oubliée depuis les ancêtres de Farinel), il en a tiré un concentré avec des alambics, et l'a versé dans
   la rivière la nuit dernière. Pendant ce temps, les ouvriers du maire bouchent le trou du Vieux Chêne avec des
   rochers ; Odette a vu ce qu'il ne fallait pas, elle est enfermée dans les sous-sols (en bonne santé).
   Chaînes : Gaspard (pièce d'or toute neuve) + Pisteur (pièce sous l'alambic) → QUI ;
   traces de charrette (Pisteur) → Farinel (Barde) → bibliothèque des plans (Sage) → passage (Pisteur : sans le plan, jamais de pièce cachée,
   Romain, 5 novembre, 00 h 27) → colorant (Alchimiste) → OÙ ; à côté, la nuit, le Pisteur peut guetter l'homme en cape qui sort
   d'une porte cachée du moulin : le suivre mène à la crypte du clocher, un indice pour l'enquête 3 ; Bastien démasqué (détecteur, « J'exige la vérité »,
   potion de vérité) ou la pièce d'un charretier sans le sou → POURQUOI.
   Le fond : la maison d'Odette (Barde), la canne d'Odette (Pisteur), la pierre de Tim (Barde → Sage). Plus de verrou sur l'accusation
   (Romain, 5 novembre, 01 h 36) : le Sage accuse quand il veut, même s'il manque des choses.
   ========================================================== */
(function(){
'use strict';
var E = window.ENQUETES = window.ENQUETES || {};
var D = window.DONNEES;

/* Les signes des menteurs de cette enquête (barde.js lit E.tics). Un signe différent par menteur (§ 12.11).
   Bastien et Margot ont chacun un signe à eux, créé pour cette enquête dans le moteur des visages (persos.js, mj-barde-sage.js) :
   Bastien : ses oreilles rougissent (doucement, Romain 5 novembre 21 h 46) ; Margot : elle baisse les yeux et lève les sourcils. */
var TICS = {bastien:'oreilles', margot:'yeuxbas', tim:'mordille', victor:'morsure', melusine:'rougeur', fortune:'coin', farinel:'double'};
var GESTES = {coin:'ses yeux filent sur le côté, avec un petit sourire de travers', rougeur:'le haut de son front devient tout rose',
  mordille:'{il} mordille sa lèvre du bas', morsure:'{il} se mord la lèvre, très vite', double:'{il} cligne des yeux deux fois, très vite',
  oreilles:'ses oreilles rougissent', yeuxbas:'{il} baisse les yeux et lève les sourcils en même temps'};
/* (7 novembre : plus de phrase « Quand X ment, … » dans les réponses ; les villageois « épinglent » le signe sur le liège, avec le nom.
   GESTES reste la description des gestes, pour s'y retrouver.) */

/* Les dialogues à choix (Romain, 4 novembre, 18 h 27, § 12.13) : tous les choix sont polis et plausibles ; seul un indice récolté
   ailleurs (chez un autre villageois, à mots couverts ; parfois un leurre d'un menteur) dit lequel est le bon. Tous les mauvais choix
   reçoivent la même réplique neutre (barde.js ajoute quand repasser), et le bon choix n'est jamais à la même place. */
var NEUTRE = 'Hmm… je ne sais pas.';
function choix(bon, autres, pos){ var l = autres.map(function(q){ return {q:q, vexe:NEUTRE}; }); l.splice(pos, 0, {q:bon, bon:true}); return l; }
/* Le rassemblement du village (Romain, 4 novembre, 22 h 41, puis 5 novembre, 01 h 36) : c'est le SAGE, la nuit seulement, et il a lieu
   quoi qu'il arrive : plus besoin de preuves. Quand sa tablette passe à la nuit, le Grand Livre s'ouvre tout seul sur la page
   (pages, id 'rassemblement', obligatoire : livre.js), tant qu'il ne l'a pas fait. */

E[2] = {
  id:2, titre:'La rivière rouge', niveau:2,
  moments:['matin', 'apresmidi', 'nuit'],
  /* Pas de points d'action (comme l'enquête 1 : M.sansActions, moteur-base.js). Ce qui limite : un lieu ne donne qu'une chose
     par moment, les moments des villageois, et une seule visite par moment pour certains d'entre eux (uneVisite, barde.js). */
  sansActions:true,
  /* le salut d'un villageois n'est dit qu'à la première visite (le salut du moment, à la première visite de ce moment) : Romain,
     7 novembre, « le Barde lit trop » (barde.js, salut ; Bible §12.50) */
  salutUneFois:true,
  riviereRouge:true,   /* sur la carte, l'eau de la rivière est rouge et luit doucement (carte.js, Romain, 4 novembre, 21 h 12) */
  lettre:'Chers enquêteurs, au secours ! Ce matin, à l\'aube, la rivière de Brumeval est devenue toute rouge ! Les poissons se cachent, les lavandières crient, et tout le village a peur. Trouvez QUI a fait ça, OÙ, et POURQUOI !',
  signature:'Monsieur Grosbec, maire de Brumeval',
  /* l'affiche du maire, sous la lettre (moteur-ecrans.js). Le maire ne ment jamais (Romain, 5 novembre, 01 h 36) : pas d'« éboulement »,
     seulement « danger » (c'est Silas, le garde, qui croit à l'éboulement) */
  affiche:{titre:'Par ordre du maire', t:'Le chemin du Vieux Chêne est fermé : danger !'},
  missions:{
    pisteur:'Le chemin du Vieux Chêne est fermé et gardé : trouve un moyen d\'y aller sans te faire voir. Suis les traces, cherche partout… et la nuit, quand tout le monde dort, fouille là où il y avait trop de monde le jour. Ce que tu trouves a un code : donne-le à la bonne personne !',
    alchimiste:'La rivière est toute rouge, et l\'eau du lavoir toute rose ! Va prendre un peu de cette eau (au pont, au lavoir) et analyse-la dans ton atelier. Cueille, prépare des potions (le Barde aimerait bien une potion de vérité), et analyse ce que l\'équipe te rapporte.',
    barde:'Interroge tout le monde : cette fois, beaucoup vont te mentir ! Regarde bien leur visage. Certains ne veulent te voir qu\'une fois par moment : reviens quand tu as du nouveau pour eux. Attention : si tu accuses quelqu\'un qui dit la vérité, il se vexe et ne te parle plus jusqu\'au moment suivant.',
    sage:'Lis le Grand Livre à l\'équipe : les habitants, les vieux chemins, les vieux plans. Déchiffre ce qu\'on t\'apporte. La nuit, rassemble tout le village au Vieux Chêne ! Tu donnes le code de chaque moment, et quand toute l\'équipe est d\'accord, tu accuses : QUI, OÙ et POURQUOI.'
  },
  /* Missions de base, en haut du Carnet (mission.js) : générales, sans chemin tout tracé, sans jamais dire QUI, OÙ ni POURQUOI */
  etapes:{
    pisteur:[
      {ic:'🌳', t:'Le chemin du Vieux Chêne est gardé : trouve un moyen d\'y aller, et regarde bien ce qui s\'y passe.', fait:[{vu:'pisteur:chene:ouvriers'}, {vu:'pisteur:chene:rochers'}, {vu:'pisteur:chene:canne'}]},
      {ic:'👣', t:'Quand la brume sera levée, va à la clairière aux lièvres et suis les traces.', fait:[{essaye:'pisteur:clairiere:champ'}]},
      {ic:'🌙', t:'La nuit, quand tout le monde dort, fouille là où il y avait trop de monde le jour.', fait:[{vu:'pisteur:moulin:alambics'}, {vu:'pisteur:moulin:piece'}]},
      {piste:true, t:'Ce que tu trouves a un code : donne-le à la bonne personne !'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a rendu la rivière rouge, OÙ, et POURQUOI ?'}
    ],
    alchimiste:[
      {ic:'💧', t:'Va prendre un peu d\'eau de la rivière, au pont, et analyse-la dans ton atelier.', fait:[{analyse:'eau_riviere'}]},
      {ic:'🧺', t:'L\'eau du lavoir est toute rose : prends-en un peu et analyse-la.', fait:[{analyse:'eau_lavoir'}]},
      {ic:'💬', t:'Prépare la potion de vérité pour le Barde (la recette est dans ton grimoire). Une seule par enquête : ne la rate pas !', fait:[{potion:'verite'}]},
      {ic:'⚗️', t:'Analyse ce que le Pisteur te rapportera de ses fouilles.', fait:[{analyse:'colorant'}]},
      {piste:true, t:'En cueillant, ouvre bien les yeux : certains coins du village ont changé.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a rendu la rivière rouge, OÙ, et POURQUOI ?'}
    ],
    barde:[
      {ic:'🗣️', t:'Interroge au moins quatre villageois. Regarde bien leur visage quand ils répondent !', fait:[{bavard:4}]},
      {ic:'🤥', t:'Démasque deux menteurs (🤥 pendant qu\'ils parlent).', fait:[{demasque:2}]},
      {ic:'🏠', t:'Odette a disparu : va voir chez elle.', fait:[{vu:'barde:voisin:0'}]},
      {piste:true, t:'Certains villageois ne te parlent qu\'une fois par moment : reviens quand tu as du nouveau pour eux.'},
      {piste:true, t:'Demande gentiment : un villageois vexé ne te parle plus avant le moment suivant.'},
      {piste:true, t:'Attention : si tu accuses quelqu\'un qui dit la vérité, il se vexe et ne te parle plus jusqu\'au moment suivant.'},
      {libre:true, ic:'🔍', t:'Cherchez ensemble : QUI a rendu la rivière rouge, OÙ, et POURQUOI ?'}
    ],
    sage:[
      {ic:'👥', t:'Lis « Les habitants » à toute l\'équipe : qui fait quoi, où chacun habite, et ce qu\'on sait de lui.', fait:[{lu:'habitants'}]},
      {ic:'🗺️', t:'Le garde ne laisse passer personne vers le Vieux Chêne : cherche un vieux chemin dans ton Grand Livre.', fait:[{page:'chemins'}]},
      {ic:'📐', t:'Quand un code te mène à la bibliothèque des plans, répare le plan déchiré.', fait:[{page:'bibliotheque'}, {fini:'sage:page:bibliotheque'}]},
      {ic:'🪨', t:'Déchiffre les runes qu\'on t\'apportera.', fait:[{page:'pierre'}, {fini:'sage:page:pierre'}]},
      {piste:true, t:'Quand la nuit tombe, ton Grand Livre s\'ouvre sur la page 📣 « Rassembler le village » : emmène tout le village au Vieux Chêne !'},
      {piste:true, t:'Quand toute l\'équipe a tout fait, donne le code du moment suivant (page ⏭️ Les codes des moments). Tu peux accuser à n\'importe quel moment (page ⚖️), dès que toute l\'équipe est d\'accord.'},
      {libre:true, ic:'🔍', t:'Écoute l\'équipe, puis accuse : QUI a rendu la rivière rouge, OÙ, et POURQUOI ?'}
    ]
  },
  qui:{titre:'QUI a rendu la rivière rouge ?', choix:['bastien', 'melusine', 'margot', 'iris', 'farinel']},
  ou:{titre:'OÙ a-t-il fait ça ?', choix:[
    {id:'moulin', nom:'Le moulin', ic:'🌾'}, {id:'lavoir', nom:'Le lavoir', ic:'🧺'}, {id:'chene', nom:'Le Vieux Chêne', ic:'🌳'},
    {id:'pont', nom:'Le pont', ic:'🌉'}, {id:'clairiere', nom:'La clairière', ic:'🐇'}]},
  pourquoi:{titre:'POURQUOI a-t-il fait ça ?', choix:[
    {id:'paye', nom:'Quelqu\'un l\'a payé', ic:'🪙'}, {id:'joli', nom:'Pour faire joli', ic:'🌸'},
    {id:'teindre', nom:'Pour teindre des tissus', ic:'🧵'}, {id:'farce', nom:'Pour faire une farce', ic:'😜'}]},
  solution:{qui:'bastien', ou:'moulin', pourquoi:'paye'},
  /* (Plus de verrou sur l'accusation ni de « petit matin », Romain, 5 novembre, 01 h 36 : le Sage accuse quand il veut.
     Une accusation fausse garde ses conséquences habituelles : moteur-actions.js, validerAccusation.) */
  /* Les chemins secrets du Pisteur (Romain, 5 novembre, 01 h 30 ; carte-jeu.js) : sur le tableau « Les chemins secrets » du chevalet
     de sa cabane, avec les passages des sous-sols. Chaque enquête peut en ajouter. Un chemin : id (unique dans la saison), nom, ic,
     code (son code le fait apparaître ; pour le Pisteur SEULEMENT : moteur-base.js ne le compte pas dans les codes de lieu de toute l'équipe),
     vers (le lieu où il mène : le toucher y emmène le Pisteur), pts (le tracé, en unités de la carte 1000 × 1400, du départ — le rond jaune —
     à l'arrivée), etiquette (facultatif : où poser son nom, sinon au milieu du tracé), t (ce qu'on lit en le touchant sur le tableau,
     s'il ne mène nulle part). Gardé toute la saison, comme les sous-sols.
     Le chemin des bûcherons : il quitte le carrefour (Carte.LIEUX.foret, 500 × 270) par le chemin libre de la clairière, loin de Silas
     qui garde celui du Vieux Chêne, fait le tour de la forêt par le nord, et arrive au Vieux Chêne (270 × 128) par derrière. */
  chemins:[
    {id:'bucherons', nom:'Le chemin des bûcherons', ic:'🪓', code:'info:detour', vers:'chene', etiquette:[486, 116],
      pts:[[572,232],[640,186],[662,112],[612,54],[510,32],[410,36],[338,60],[306,94]]}
  ],
  /* Le Barde (barde.js) : une seule visite par moment pour ces villageois ; revenir avec du nouveau qui les concerne rouvre la porte.
     Les questions qui attendent un indice restent cachées tant qu'on ne l'a pas (questionsCachees). La potion de vérité fait avouer. */
  uneVisite:['bastien', 'tim', 'victor', 'iris', 'farinel', 'melusine'],
  questionsCachees:true,
  potionAveu:true,
  vexeNeutre:true,   /* un mauvais choix : la même réplique neutre partout, sans « vexé » (§ 12.13) ; il reste fermé jusqu'au moment suivant */
  tics:TICS,
  /* (le rassemblement n'est plus au Barde : c'est une page du Grand Livre du Sage, chaque nuit, sans preuves ; voir pages, 'rassemblement') */
  veriteUnique:true,   /* une seule potion de vérité par enquête : l'Alchimiste n'en prépare qu'une, le Barde la fait boire à un seul villageois */
  /* Les photos du tableau de liège du Barde (liege.js) : les suspects, les autres villageois de l'histoire, tous les lieux du OÙ */
  liege:{pnj:['bastien', 'melusine', 'margot', 'iris', 'farinel', 'tim', 'victor', 'gaspard', 'fortune'], lieux:['moulin', 'lavoir', 'chene', 'pont', 'clairiere', 'place', 'foret'],
    /* le dossier « Autre » (Romain, 5 novembre, 14 h 18) : les mots-clés des dialogues, pour que le Barde s'amuse à faire des liens.
       Chacun arrive dès que le Barde l'a appris (si : les conditions des questions), pour ne rien dévoiler.
       Pas de Léo (une seule ligne à l'enquête 2, il servira à l'enquête 3), pas de crypte (dite à l'oral par le Pisteur). */
    mots:[
      {id:'riviere', ic:'🔴', nom:'Rivière rouge'},
      {id:'interdit', ic:'🚧', nom:'Chemin interdit'},
      {id:'ordre', ic:'✋', nom:'Ordre du maire', si:[{vu:'barde:silas:0'}, {vu:'barde:grosbec:1'}]},
      {id:'eboulement', ic:'⛰️', nom:'Éboulement', si:[{vu:'barde:silas:0'}]},
      {id:'odette', ic:'👵', nom:'Odette disparue'},   /* dans les missions du Barde dès le début */
      {id:'canne', ic:'🦯', nom:'Canne aux sept chats', si:[{vu:'barde:melusine:0'}, {code:'info:canne'}]},
      {id:'aube', ic:'🌅', nom:'Avant l\'aube', si:[{vu:'barde:silas:1'}, {vu:'barde:melusine:1'}, {vu:'verite:victor:0'}]},
      {id:'lavoir_rose', ic:'🩷', nom:'Lavoir rose', si:[{code:'info:lavoir_rose'}, {vu:'verite:melusine:2'}]},
      {id:'champ', ic:'🌺', nom:'Champ rasé', si:[{vu:'barde:iris:0'}, {code:'info:champ_rase'}]},
      {id:'rouge_fleurs', ic:'🎨', nom:'Rouge de coquelicot', si:[{vu:'barde:iris:1'}]},
      {id:'charrette', ic:'🛒', nom:'Charrette', si:[{vu:'barde:silas:1'}, {vu:'barde:iris:2'}, {vu:'verite:victor:0'}, {code:'info:traces'}]},
      {id:'piece', ic:'🪙', nom:'Pièce d\'or neuve', si:[{vu:'barde:gaspard:1'}, {vu:'barde:oreille:boulangerie'}, {vu:'barde:margot:3'}, {code:'info:piece'}]},
      {id:'cape', ic:'🧥', nom:'Cape noire', si:[{vu:'barde:fortune:1'}, {vu:'verite:bastien:1'}]},
      {id:'poudre', ic:'⚫', nom:'Poudre noire', si:[{vu:'barde:fortune:1'}]},
      {id:'tissus', ic:'🧵', nom:'Tissus qui déteignent', si:[{vu:'verite:melusine:2'}, {vu:'verite:fortune:0'}, {vu:'barde:oreille:atelier'}, {code:'info:lavoir_rose'}]},
      {id:'tonneau', ic:'🍷', nom:'Tonneau de vin', si:[{vu:'barde:margot:0'}]},
      {id:'legendes', ic:'📜', nom:'Vieilles légendes', si:[{vu:'barde:gaspard:2'}]},
      {id:'runes', ic:'🚪', nom:'Porte aux runes', si:[{vu:'verite:tim:1'}, {vu:'barde:tim:2'}]},
      {id:'rochers', ic:'🪨', nom:'Gros rochers', si:[{vu:'barde:tim:2'}, {vu:'ecoute:ouvriers'}, {code:'info:rassemblement'}]},
      {id:'plans', ic:'📐', nom:'Vieux plans du moulin', si:[{vu:'barde:farinel:2'}]},
      {id:'sieste', ic:'😴', nom:'Sieste de Farinel', si:[{vu:'verite:farinel:1'}]}
    ]},
  /* Le vérificateur refuse tout texte qu'un joueur obtient seul et qui contient un de ces mots, sauf s'il fait partie d'un indice prévu ou s'il a été relu (ok). */
  sensibles:['bastien', 'roulebosse', 'pièce d\'or', 'payé', 'alambic'],
  recettes:['verite'],
  depart:{alchimiste:{ingr:{eau:2, miel:2}}},
  /* Le registre du Sage (livre.js) : pour chacun, son métier et ses pieds (donnees.js), son adresse (maison : son visage est sur cette
     maison de la carte ; adresse : un lieu sans numéro) et une phrase sur lui (note). */
  registre:{
    bastien:{maison:'B2', note:'Il transporte tout, partout, avec sa grande charrette. Jamais un sou en poche.'},
    odette:{maison:'L2', note:'Ne dort presque jamais. Marche avec une canne gravée de sept chats.'},
    tim:{maison:'L7', note:'Son chien s\'appelle Pirate. Il ne confie ses secrets qu\'à ceux qui promettent de ne rien répéter.'},
    victor:{maison:'L6', note:'Il passe partout, tous les jours, avec sa grosse sacoche de lettres.'},
    melusine:{maison:'L4', note:'Elle dit qu\'elle tisse tous ses tissus elle-même.'},
    iris:{maison:'F4', note:'Elle cultive des fleurs à la clairière aux lièvres.'},   /* (rien de plus : l'indice de sa question à choix vient de Mélusine) */
    margot:{adresse:'la taverne du Chaudron fêlé, sur la place', note:'Elle sert à boire à tout le village, et elle adore les histoires mystérieuses.'},
    farinel:{adresse:'le moulin, au bord de la rivière', note:'Tout rond et gentil, toujours plein de farine. Gare à qui le réveille la nuit !'},
    gaspard:{maison:'F1', note:'Tout le village vient chercher son pain chez lui.'},
    /* le maire signe la lettre de chaque enquête : tout le monde le connaît (sur la carte, son visage et pas un « ? ») */
    grosbec:{adresse:'la mairie, sur la place', note:'Le maire de Brumeval. Il ne quitte jamais ses gants gris, même à l\'intérieur.'}
  },
  objets:{
    eau_riviere:{nom:'Flacon d\'eau de la rivière', ic:'💧', pour:'alchimiste'},
    eau_lavoir:{nom:'Flacon d\'eau du lavoir', ic:'🧺', pour:'alchimiste'},
    colorant:{nom:'Reste de colorant rouge', ic:'🔴', pour:'alchimiste', dire:'L\'Alchimiste saura d\'où vient ce rouge : donne-lui ce code.'},
    pierre:{nom:'Pierre gravée de Tim', ic:'🪨', pour:'sage', dire:'Des runes ! Le Sage saura peut-être les lire : donne-lui ce code.'},
    /* la poudre du pot noir (Romain, 23 h 14) : un code ajouté après le gel (codes-fixes.js : il prend un code libre) */
    poudre:{nom:'Poudre du pot noir', ic:'⚫', pour:'alchimiste', dire:'L\'Alchimiste pourra l\'analyser dans son atelier : donne-lui ce code.'}
  },
  /* dire : la phrase sous un code donné (moteur-base.js, M.direCode), dans l'histoire, à la place de « donne ce code au … » */
  infos:{
    /* Renseignements sur un habitant, pour le Barde (carnet.js) : 4 codes (tim_chene, traces, lavoir_rose, champ_rase)
       (plus de code du registre, Romain, 5 novembre, 01 h 20 : le Sage lit « Les habitants » à tout le monde, et les visages sont sur les
       maisons ; le code gelé reste dans codes-fixes.js, inutilisé. L'indice de Tim, « il ne confie ses secrets qu'à ceux qui promettent
       de ne rien répéter », est dans le registre, que le Sage lit à voix haute.) */
    /* aussi pour le Sage, qui accuse (le même code, son « pour » seul change ; ce n'est plus une condition du rassemblement) */
    tim_chene:{nom:'Tim, attrapé au Vieux Chêne', ic:'🧒', pour:['barde', 'sage'], de:'pisteur', pnj:'tim', t:'Le Pisteur a attrapé Tim qui se cachait près du Vieux Chêne. Il a très peur, et il cache quelque chose : le Barde saura le faire parler !',
      dire:'Le Barde saura le faire parler : donne ce code au Barde, et aussi au Sage.'},
    traces:{nom:'Les traces perdues', ic:'👣', pour:'barde', de:'pisteur', pnj:'farinel', t:'Le Pisteur a suivi des traces de charrette depuis le champ rasé jusqu\'à la cour du moulin. Là, sur les pavés, elles se perdent.',
      dire:'Farinel, le meunier, sait peut-être quelque chose : donne ce code au Barde.'},   /* (Romain, 23 h 11) */
    lavoir_rose:{nom:'Le rose du lavoir', ic:'🧺', pour:'barde', de:'alchimiste', pnj:'melusine', t:'L\'Alchimiste a analysé l\'eau du lavoir : ce rose vient d\'un tissu qui déteint.',
      dire:'Mélusine, la couturière, sait peut-être d\'où vient ce tissu : donne ce code au Barde.'},
    champ_rase:{nom:'Le champ rasé', ic:'🌺', pour:'barde', de:'alchimiste', pnj:'iris', t:'L\'Alchimiste a vu, à la clairière aux lièvres, un grand champ de coquelicots tout rasé.',
      dire:'Iris, l\'herboriste, voudra le savoir : donne ce code au Barde.'},
    /* les autres codes */
    piece:{nom:'La pièce d\'or du moulin', ic:'🪙', pour:'barde', t:'Le Pisteur a trouvé, sous un alambic de la pièce cachée du moulin, une pièce d\'or toute neuve. Quelqu\'un a compté son or ici…',
      dire:'À qui est cette pièce ? Le Barde va le découvrir : donne-lui ce code.'},
    /* (Romain, 23 h 22) : bâti par « ses ancêtres » ; le plan arrive toujours dans la page de la bibliothèque des plans du Sage, à réparer */
    plans_moulin:{nom:'Les plans du moulin', ic:'📐', pour:'sage', t:'Farinel a donné les vieux plans de son moulin, bâti par ses ancêtres. Ils sont tout déchirés : répare-les dans la bibliothèque des plans du Grand Livre.',
      dire:'Les plans du moulin : donne ce code au Sage.'},
    passage:{nom:'Le passage secret du moulin', ic:'🕳️', pour:'pisteur', t:'Sur le vieux plan du moulin, réparé par le Sage : une petite pièce sans porte, sous la grande roue, et un passage secret pour y entrer. Va voir la nuit, quand le moulin est vide !',
      dire:'Le Pisteur pourra s\'y glisser, la nuit : donne-lui ce code.'},
    /* un chemin secret du Pisteur, et de lui seul (Romain, 5 novembre, 01 h 30 : chemins, plus haut) : tapé sur sa tablette, le jeu l'emmène
       à son tableau des chemins secrets ; tapé sur une autre tablette, « Ce code est pour le Pisteur » */
    detour:{nom:'Le chemin des bûcherons', ic:'🗺️', pour:'pisteur', t:'Un vieux chemin des bûcherons fait le tour de la forêt et arrive au Vieux Chêne par derrière, loin du garde.',
      dire:'Par là, on passe loin du garde ! C\'est un chemin secret pour le Pisteur : donne-lui ce code.'},
    canne:{nom:'La canne d\'Odette', ic:'🦯', pour:['sage', 'barde'], t:'Le Pisteur a trouvé la canne d\'Odette, gravée de sept chats, dans l\'herbe près des gros rochers du Vieux Chêne. Odette ne sort jamais sans elle…',
      dire:'Le Sage et le Barde voudront le savoir : donne ce code au Sage ou au Barde.'},
    /* une preuve pour le Sage, qui accuse (Romain, 22 h 41 ; plus une condition du rassemblement depuis le 5 novembre, 01 h 36) :
       un code ajouté après le gel (codes-fixes.js : il prend un code libre) */
    rochers:{nom:'Les rochers posés exprès', ic:'🪨', pour:'sage', de:'pisteur', t:'Le Pisteur a vu les gros rochers qui bouchent le trou du Vieux Chêne : ils sont bien rangés, posés là exprès. Ce n\'est pas un éboulement !',
      dire:'C\'est une preuve pour le Sage : donne-lui ce code.'},
    odette:{nom:'La maison d\'Odette', ic:'🏠', pour:'sage', t:'Le Barde est allé chez Odette : la porte n\'était pas fermée, un chat s\'est sauvé, et son lit n\'est pas défait. Odette n\'a pas dormi chez elle.',
      dire:'Odette a disparu ! Le Sage doit le savoir : donne-lui ce code.'},
    /* l'homme en cape suivi la nuit jusqu'à la crypte du clocher (Romain, 23 h 58) : un indice de fond, sans effet sur l'accusation,
       la porte d'entrée de l'enquête 3 ; un code ajouté après le gel (codes-fixes.js : il prend un code libre) */
    crypte:{nom:'La crypte du clocher', ic:'🗝️', pour:['sage', 'barde'], de:'pisteur',
      t:'La nuit, le Pisteur a suivi l\'homme en cape noire sorti de la porte cachée du moulin : il est entré dans la crypte du clocher avec une clé, et a refermé à clé derrière lui.',
      dire:'Un mystère pour plus tard… Le Sage et le Barde voudront le savoir : donne ce code au Sage ou au Barde.'},
    rassemblement:{nom:'Le récit du rassemblement', ic:'📣', illu:'rassemblement', pour:'tous', t:'Cette nuit, le Sage a emmené tout le village au Vieux Chêne. De gros rochers bouchent le trou. Soudain, une épaisse fumée rouge est sortie de sous les branches ! Le maire est arrivé en courant, avec Silas. Silas a crié : « Ce sont des vapeurs toxiques ! Elles montent des sous-sols ! » Et le maire : « Reculez ! Ne respirez pas ça ! La zone est condamnée. Rentrez chez vous ! » Tout le monde est rentré en toussant.'}
  },
  lieux:{
    foret:{
      pisteur:{intro:'Le carrefour de la forêt. Trois chemins : vers le Vieux Chêne, vers la clairière aux lièvres, vers le moulin.', points:[
        {id:'branche', ic:'💂', nom:'Le garde',
          t:'Silas, le garde champêtre, garde le chemin du Vieux Chêne : « Ordre du maire ! Personne ne passe ! » Les autres chemins, vers la clairière et le moulin, sont libres.',
          note:'Carrefour : Silas garde le chemin du Vieux Chêne. Les autres chemins sont libres.'},
        /* très risqué (Romain, 23 h 13) : « Se cacher » au niveau 10 pour tout le monde (moteur-actions.js : options.niveauFixe) ;
           l'équipement, les talents et les potions du héros aident encore. Gagné : la cape d'aurore (garderobe.js). Raté : le détour du Sage. */
        {id:'passer', ic:'🫥', nom:'Passer derrière son dos', mj:'cachette', params:{decor:'foret'}, mjNiveauFixe:10, visibleSi:[{vu:'pisteur:foret:branche'}],   /* après avoir vu le garde ; la forêt (Romain, 6 novembre, 2 h 34) */
          avant:'Silas a l\'œil partout… Il faudra être très, très discret ! C\'est très risqué : si tu rates, il faudra attendre que le Sage trouve un autre chemin.',
          bouton:'🫥 Passer en douce',
          t:'Tu te glisses derrière les fougères, sans un bruit… Silas regarde ailleurs : tu passes derrière son dos ! Tu peux aller au Vieux Chêne.',
          note:'Carrefour : tu es passé derrière le dos de Silas. Tu peux aller au Vieux Chêne.',
          rate:'Silas tourne la tête : « Hé, toi ! Pas par là ! » Tu dois faire demi-tour.',
          ferme:'Silas te surveille, maintenant : impossible de passer derrière son dos. Attends que le Sage trouve un autre chemin, dans son Grand Livre.'}
      ]},
      alchimiste:{cueillir:[{ingr:'champignon', n:2, moments:['nuit']}]}
    },
    chene:{
      /* (Romain, 5 novembre, 13 h 56 : la phrase courte pour tout le monde ; le conseil et « ce qui marcherait », seulement pour le Pisteur) */
      verrou:{besoin:[{code:'info:detour'}, {vu:'pisteur:foret:passer'}], t:'Silas, le garde, ne laisse passer personne vers le Vieux Chêne.', besoinPour:['pisteur'],
        tPour:{pisteur:'Silas, le garde, ne laisse passer personne vers le Vieux Chêne. Le Grand Livre du Sage connaît peut-être un vieux chemin… ou bien, au carrefour, passe derrière son dos sans te faire voir !'}},
      pisteur:{intro:'Le Vieux Chêne, immense et sombre. Personne ne doit te voir ici !', points:[
        {id:'ouvriers', ic:'👷', nom:'Les ouvriers', moments:['matin'],
          t:'Caché derrière un buisson, tu vois deux ouvriers poser les derniers gros rochers sur le trou du Vieux Chêne. Puis l\'un d\'eux cache un pot noir tout près, sous les branches basses. Ils s\'en vont en chuchotant.',
          note:'Vieux Chêne (matin) : deux ouvriers finissent de boucher le trou avec de gros rochers. L\'un cache un pot noir sous les branches.'},
        {id:'rochers', ic:'🪨', nom:'Les rochers', moments:['apresmidi', 'nuit'], donne:'info:rochers',
          t:'De gros rochers bouchent le trou du Vieux Chêne. Entre les pierres, un courant d\'air froid souffle encore… Ce n\'est pas un éboulement : ces rochers ont été posés là, bien rangés !',
          note:'Vieux Chêne : de gros rochers bouchent le trou, bien rangés. Ce n\'est pas un éboulement.'},
        /* le pot noir (Romain, 23 h 14) : une pincée de sa poudre pour l'Alchimiste (obj:poudre, analyses.poudre) */
        {id:'pot', ic:'⚱️', nom:'Le pot noir', moments:['apresmidi', 'nuit'], obj:'poudre',
          t:'Sous les branches basses, il y a un pot noir, tout neuf : on l\'a posé ce matin. Il sent la poudre… Mais à quoi sert-il ? Tu en prends une pincée dans ton mouchoir.',
          note:'Vieux Chêne : un pot noir tout neuf, posé ce matin sous les branches. Il sent la poudre. Une pincée pour l\'Alchimiste.',
          /* le texte change selon le moment et le rassemblement (regles.js : la première variante qui convient) */
          /* le rassemblement (le Sage, la nuit) : après lui, le pot est tout noirci, encore tiède */
          variantes:[
            {si:[{code:'info:rassemblement'}], t:'Le pot noir sous les branches est tout noirci, encore tiède : c\'est de lui qu\'est sortie la fumée rouge du rassemblement ! Ce n\'étaient pas des vapeurs du trou. Tu prends une pincée de ce qui reste au fond.', note:'Vieux Chêne : la fumée rouge du rassemblement sortait du pot noir posé ce matin, pas du trou. Une pincée pour l\'Alchimiste.'},
            {si:[{moment:'nuit'}], t:'Le pot noir est toujours là, froid, sous les branches. Il sent la poudre noire. On l\'a posé ce matin… Tu en prends une pincée dans ton mouchoir.', note:'Vieux Chêne : un pot noir, posé ce matin sous les branches. Il sent la poudre noire. Une pincée pour l\'Alchimiste.'}
          ]},
        {id:'canne', ic:'🦯', nom:'Dans l\'herbe', donne:'info:canne',
          t:'Près des rochers, dans l\'herbe, une canne en bois. Sur la poignée, on a gravé sept petits chats : c\'est la canne d\'Odette ! Que fait-elle ici ? Odette ne sort jamais sans elle…',
          note:'Vieux Chêne : la canne d\'Odette (sept chats gravés) était dans l\'herbe, près des rochers.'},
        /* mjNiveauMax (Romain, 7 novembre) : jamais plus que le niveau 4 (un adulte jouait au 5, trop dur pour un seul essai) */
        {id:'tim', ic:'🧒', nom:'Quelqu\'un derrière le tronc', moments:['matin', 'apresmidi'], mj:'poursuite', mjNiveauMax:4, params:{decor:'foret'}, donne:'info:tim_chene',
          avant:'Quelqu\'un t\'observe, caché derrière le tronc… Il s\'enfuit ! Vite, cours-lui après !',
          t:'Tu cours, tu sautes les racines… et tu l\'attrapes par le col : c\'est Tim, le petit ramoneur ! Il tremble : « Je n\'ai rien fait ! Laisse-moi ! » Il a peur, et il cache quelque chose.',
          note:'Vieux Chêne : Tim se cachait derrière le tronc. Il a très peur et il cache quelque chose : code pour le Barde et le Sage.',
          rate:'Il est bien trop rapide ! Tu as juste vu une petite casquette disparaître entre les arbres.',
          rateNote:'Vieux Chêne : quelqu\'un de petit, avec une casquette, s\'est enfui entre les arbres.',
          ferme:'Il a disparu pour de bon…'}
      ]}
    },
    clairiere:{
      pisteur:{intro:'La clairière aux lièvres, au bord de la forêt.', points:[
        {id:'brume', ic:'🌫️', nom:'La brume', moments:['matin'],
          t:'Une brume épaisse couvre toute la clairière : tu ne vois même pas tes pieds ! Impossible de suivre des traces ce matin. Reviens quand elle sera levée.'},
        /* Suivre la piste, version charrette (mj-pisteur-alchi.js) : deux traits de roues + les pieds de celui qui pousse ;
           pour embrouiller, la brouette (une roue) et la carriole plus large de Fortuné */
        {id:'champ', ic:'👣', nom:'Le champ de coquelicots', moments:['apresmidi', 'nuit'], mj:'traces', params:{vehicule:'charrette'}, donne:'info:traces',
          /* ouvrePartiel : raté deux fois, le code est donné quand même, avec l'indice partiel (moteur-actions.js) */
          ouvrePartiel:true, partiel:true,
          /* l'explication avant le mini-jeu, et le résultat (Romain, 23 h 11, mot pour mot) ; la ligne du code : infos.traces.dire */
          avant:'Le champ de coquelicots est tout rasé ! Dans la terre, deux longs traits de roues de charrette… et les traces de pas de celui qui la poussait. Tu les suis…',
          bouton:'👣 Suivre les traces',
          t:'Tu as suivi les traces jusqu\'à la cour du moulin. Là, sur les pavés, elles disparaissent : tu ne peux plus les suivre. Au moulin, tu ne vois rien de spécial.',
          note:'Clairière : le champ de coquelicots est rasé (on a seulement coupé des fleurs ici). Des traces de charrette vont jusqu\'à la cour du moulin, puis disparaissent sur les pavés.',
          rate:'Les traces se brouillent… tu les as perdues ! Tu as juste vu qu\'elles partaient vers le moulin.',
          rateNote:'Clairière : le champ de coquelicots est rasé (on a seulement coupé des fleurs ici). Des traces de roues partent vers le moulin.'}
      ]},
      alchimiste:{cueillir:[{ingr:'trefle', n:2}],
        /* une trouvaille en cueillant (regles.js) : le champ rasé, à dire au Barde */
        /* (dès le matin : le champ a été rasé avant, Romain, 5 novembre, 12 h 31) */
        trouvaille:{ic:'🌺', titre:'Un champ tout rasé', donne:'info:champ_rase',
          t:'En cueillant, tu découvres un grand champ… tout rasé ! Il ne reste pas un seul coquelicot, juste des tiges coupées. C\'est bizarre !',
          note:'Clairière : un grand champ de coquelicots tout rasé. Bizarre !'}}
    },
    moulin:{
      pisteur:{intro:'Le vieux moulin tourne au bord de la rivière.', points:[
        /* le jour, pas de pièce cachée (Romain, 23 h 48) : un message clair, surtout avec le plan du Sage */
        {id:'cour', ic:'🌾', nom:'La cour', moments:['matin', 'apresmidi'],
          t:'Le moulin est plein de monde : Farinel et ses clients vont et viennent. Impossible de fouiller sans être vu… Mieux vaut revenir la nuit. 🌙',
          note:'Moulin : trop de monde le jour pour fouiller. Revenir la nuit.',
          variantes:[{si:[{code:'info:passage'}], t:'Le moulin est plein de monde : Farinel et ses clients vont et viennent. Impossible d\'ouvrir le passage sans être vu… Mieux vaut revenir la nuit. 🌙',
            note:'Moulin : trop de monde le jour pour ouvrir le passage secret. Revenir la nuit.'}]},
        /* La nuit au moulin (Romain, 23 h 31, 23 h 58, puis la règle de 00 h 27), les points l'un après l'autre (regles.js : visibleSi) :
           - « La pièce cachée » : SEULEMENT avec le plan réparé du Sage (info:passage), la nuit ; sans lui, jamais (ni elle, ni
             « Sous l'alambic »). Le plan arrive tard dans la nuit ? Le Pisteur revient au moulin : elle est là (pointsVisibles est relu à chaque fois) ;
           - une fois entré dans la pièce cachée, « Sous l'alambic » (la pièce d'or) apparaît tout de suite, dans la même visite ;
           - « Te cacher et guetter », toujours (raté : « Tout est calme… », on retente) ; réussi : l'homme en cape noire (le payeur ;
             on ne voit jamais son visage) sort d'une porte cachée qui se referme et se fond dans le mur → un seul choix (p.choix) :
             👣 le suivre (niveau 10 : jusqu'à la crypte du clocher, info:crypte pour le Sage et le Barde, un indice de fond pour l'enquête 3,
             sans effet sur l'accusation ; raté : une direction, le sud-ouest, vers le clocher) ; sinon « D'accord », et on le laisse filer. */
        {id:'guet', ic:'🫥', nom:'Te cacher et guetter', moments:['nuit'], mj:'cachette', params:{decor:'moulin'}, choix:['suivre'],   /* le moulin, la nuit (Romain, 6 novembre, 2 h 34) */
          avant:'Il fait nuit noire au moulin. Tout est calme… Cache-toi près du mur sans te faire voir, et guette !',
          bouton:'🫥 Se cacher et guetter',
          t:'Une porte cachée s\'ouvre dans le mur. Un homme en cape noire, le capuchon rabattu, sort sans bruit… La porte se referme derrière lui et se fond dans le mur : impossible de voir comment elle s\'ouvre. L\'homme file dans la nuit.',
          note:'Moulin (nuit) : un homme en cape noire, le capuchon rabattu, est sorti d\'une porte cachée dans le mur. Elle s\'est refermée et fondue dans le mur : impossible de voir comment elle s\'ouvre.',
          /* avec le plan du Sage, il reconnaît le passage ; le texte vu reste celui-là (varianteFigee, regles.js : guetter ne se rejoue pas) */
          varianteFigee:true, variantes:[{si:[{code:'info:passage'}],
            t:'Une porte cachée s\'ouvre dans le mur. Un homme en cape noire, le capuchon rabattu, sort sans bruit… La porte se referme derrière lui : c\'est le passage secret du plan du Sage ! L\'homme file dans la nuit.',
            note:'Moulin (nuit) : un homme en cape noire, le capuchon rabattu, est sorti par le passage secret du plan du Sage.'}],
          rate:'Tu as failli être vu ! Vite, tu t\'aplatis derrière les sacs de farine… Tout est calme, tu n\'as rien vu.',
          ferme:'Tout est calme… Plus personne ne sortira du moulin cette nuit. Le plan du Sage montrera peut-être où chercher.'},
        {id:'alambics', ic:'⚗️', nom:'La pièce cachée', moments:['nuit'], obj:'colorant',
          besoin:[{code:'info:passage'}], visibleSi:[{code:'info:passage'}],
          t:'Derrière la porte cachée : une petite pièce oubliée, sous la grande roue. Des alambics, des tuyaux, et au fond d\'une cuve, un reste de colorant tout rouge ! Une rigole descend droit dans la rivière. Pas un tissu, pas une bassine pour teindre : on a fabriqué le rouge ici, et on l\'a versé dans l\'eau. Tu prends un peu du colorant qui reste.',
          note:'Moulin, la pièce cachée : des alambics, un reste de colorant rouge, une rigole vers la rivière. Ni tissu ni bassine.'},
        /* suivre l'homme en cape : « Suivre la piste », la nuit (params.decor), au niveau 10 pour tout le monde (très difficile) ;
           gagné : la crypte du clocher (info:crypte) et un vêtement rare (garderobe.js) ; raté : rien d'autre, aucune conséquence */
        {id:'suivre', ic:'👣', nom:'Suivre l\'homme en cape', moments:['nuit'], choixTxt:'👣 Suivre l\'homme en cape', mj:'traces', mjNiveauFixe:10, params:{decor:'nuit', suspect:'botte'},   /* (plus de code info:crypte : il le raconte à l'oral, Romain, 5 novembre, 13 h 19 ; la crypte va sur son tableau des chemins secrets) */
          besoin:[{vu:'pisteur:moulin:guet'}], visibleSi:[{vu:'pisteur:moulin:guet'}],
          avant:'Il marche vite et sans bruit… Ce sera très difficile de ne pas le perdre !',
          bouton:'👣 Le suivre',
          /* (Romain, 00 h 00 : pas de farine sur sa cape, elle désignerait Farinel à tort) */
          t:'Il traverse le village jusqu\'au clocher… Il s\'arrête devant la grille de la crypte, sort une clé, entre, et referme à clé derrière lui. Impossible d\'entrer : la piste s\'arrête là.',
          note:'Nuit : l\'homme en cape noire du moulin est entré dans la crypte du clocher, avec une clé, et a refermé à clé derrière lui.',
          /* raté : on donne quand même une direction (Romain, 5 novembre, minuit : on peut supposer l'église sans en être sûr) */
          rate:'Tu as perdu sa trace… mais il partait vers le sud-ouest, du côté du clocher.',
          rateNote:'Nuit : l\'homme en cape noire du moulin est parti vers le sud-ouest, du côté du clocher. Tu as perdu sa trace.',
          ferme:'Il a disparu dans la nuit.'},
        {id:'piece', ic:'🪙', nom:'Sous l\'alambic', moments:['nuit'], besoin:[{vu:'pisteur:moulin:alambics'}], visibleSi:[{vu:'pisteur:moulin:alambics'}],   /* (plus de code info:piece : il le raconte au Barde) */
          t:'Sous un alambic, quelque chose brille : quelqu\'un a compté son or ici, et en a perdu une ! Une pièce d\'or toute neuve… Qui, au village, en a eu une récemment ? Raconte-le au Barde !',
          note:'Moulin, la pièce cachée : une pièce d\'or toute neuve, sous un alambic. Qui, au village, en a eu une récemment ?'}
      ]}
    },
    place:{
      pisteur:{intro:'La place des Lanternes. Tout le monde ne parle que de la rivière rouge.', points:[
        {id:'affiche', ic:'📜', nom:'Le panneau',
          t:'Sur le panneau, l\'affiche du maire : « Par ordre du maire, le chemin du Vieux Chêne est fermé : danger ! »'},
        {id:'charrette', ic:'🛒', nom:'La charrette', moments:['apresmidi'], ok:'La charrette lavée ne prouve rien.',
          t:'Devant la fontaine, la charrette de Bastien le charretier. Elle est toute propre, lavée à grande eau : ça sent encore le savon ! Rien d\'autre.',
          note:'Place : la charrette de Bastien est toute propre, lavée à grande eau.'},
        {id:'carriole', ic:'🧳', nom:'La carriole', moments:['apresmidi'],
          t:'La carriole de Fortuné, le colporteur : bien plus large qu\'une charrette, et pleine de tissus de toutes les couleurs.'}
      ]},
      alchimiste:{cueillir:[{ingr:'eau', n:2}]}
    },
    pont:{
      pisteur:{intro:'Le pont de pierre, au-dessus de la rivière.', points:[
        {id:'riviere', ic:'🌉', nom:'La rivière',
          t:'Sous le pont, la rivière coule, toute rouge. Les poissons se cachent sous les pierres. Dis à l\'Alchimiste de venir voir !'}
      ]},
      /* l'eau de la rivière : un échantillon à analyser dans l'atelier (regles.js) */
      alchimiste:{cueillir:[], echantillon:{objet:'eau_riviere', t:'Tu te penches au bord du pont et tu remplis un petit flacon d\'eau toute rouge. Analyse-la sur ta table d\'analyse, dans ton atelier !'}}
    },
    lavoir:{
      pisteur:{intro:'Le lavoir du village.', points:[
        {id:'eau', ic:'🧺', nom:'L\'eau du lavoir',
          t:'L\'eau du lavoir est toute rose… Pas rouge comme la rivière : rose, comme un bonbon ! Dis à l\'Alchimiste de venir voir !'}
      ]},
      alchimiste:{cueillir:[{ingr:'brume', n:2, min:2, moments:['matin']}, {ingr:'eau', n:2}],
        echantillon:{objet:'eau_lavoir', t:'Tu remplis un petit flacon avec l\'eau rose du lavoir. Analyse-la sur ta table d\'analyse, dans ton atelier !'}}
    },
    herboristerie:{alchimiste:{cueillir:[{ingr:'lavande', n:2}, {ingr:'pensee', n:2}]}},
    potager:{alchimiste:{cueillir:[{ingr:'miel', n:2}, {ingr:'menthe', n:2}]}},
    lisiere:{alchimiste:{cueillir:[{ingr:'baies', n:3}]}}
  },
  /* Les villageois. Tous les interrogatoires sont le mini-jeu du mensonge (barde.js : visages animés, 🤥).
     ou : où les trouver à chaque moment (un moment absent = introuvable). salut / saluts{moment} / occupe{moment}.
     Les questions qui attendent un indice restent cachées (questionsCachees). Les menteurs : Bastien, Tim, Victor, Margot,
     Mélusine, Fortuné, Farinel (un petit mensonge pour rire). Le maire ne ment jamais : il dit des choses vraies et tait le reste. */
  pnj:{
    /* carte + occupe (Romain, 5 novembre, 8 h 59 : la carte montre toujours où est chacun) : là où il est quand on ne peut pas lui parler,
       et ce qu'on voit en arrivant (moteur-roles.js, M.pnjOccupesIci). Le rythme de l'enquête ne change pas. */
    bastien:{ou:{apresmidi:'place', nuit:'B2'}, carte:{matin:'lisiere'}, occupe:{matin:'« Pas le temps, je pars livrer ! Reviens cet après-midi. »'},   /* (des phrases courtes : elles tiennent dans une pastille de la carte) */ salut:'Salut ! Bastien Roulebosse, charretier. Je transporte tout, partout !', saluts:{nuit:'Hein ? Qui frappe à ma porte en pleine nuit ?'}, questions:[
      /* (Romain, 7 novembre : le Barde lit trop → réponses de 2 phrases courtes, vérités de 25 à 30 mots, Bible §12.50) */
      {q:'Qu\'as-tu fait ces derniers jours ?', a:'Rien du tout ! J\'ai dormi chez moi, et je me suis levé tard.', ment:true, ok:'Son nom est seulement dans son propre interrogatoire, qui ne dit rien de la rivière.',
        vrai:'Bon… avant-hier, je me suis promené dans la forêt. C\'est tout !',
        note:'Bastien dit qu\'il a dormi chez lui ces jours-ci, et qu\'il n\'a rien fait.', noteVrai:'Bastien a avoué : avant-hier, il s\'est promené dans la forêt. Il n\'en dit pas plus.'},
      /* (Romain, 5 novembre, 13 h 47 : plus de code de la pièce du moulin ; le ragot de Gaspard, ou de Margot la nuit, suffit ; le Pisteur raconte sa pièce à l'oral) */
      {q:'On t\'a vu payer avec une pièce d\'or toute neuve !', moments:['nuit'], besoin:[{vu:'barde:gaspard:1'}, {vu:'barde:oreille:boulangerie'}, {vu:'barde:margot:3'}],
        a:'D\'accord, c\'est moi qui ai rendu la rivière rouge ! Mais c\'était juste pour faire joli.', ment:true,
        vrai:'Bon… Un homme en cape noire m\'a payé en pièces d\'or toutes neuves. Je n\'ai jamais vu son visage, je le jure !',
        note:'Bastien avoue que c\'est lui qui a rendu la rivière rouge. Il dit que c\'était « pour faire joli ».', noteVrai:'Bastien a avoué : un homme en cape noire l\'a payé avec des pièces d\'or toutes neuves pour rendre la rivière rouge. Il ne sait pas qui c\'était.'}
    ]},
    /* vexeDonne (Romain, 23 h 20) : vexé la nuit, Tim part fâché… mais lâche quand même sa pierre (barde.js, vexeLache) */
    /* (le matin, Tim se cache au Vieux Chêne : la carte ne le montre pas, pour garder la surprise du Pisteur — Romain, 5 novembre, 9 h 30 ;
       sa maison est grisée, il est sorti, sans dire où) */
    tim:{ou:{apresmidi:'place', nuit:'L7'}, salut:'Oh… c\'est toi.', saluts:{nuit:'Tu ne dors pas, toi non plus ?'},
      vexeDonne:{obj:'pierre', moments:['nuit'], a:'Il te lance une pierre : « Tiens, ton caillou, et laisse-moi tranquille ! » Elle est gravée de runes.',
        note:'Tim, fâché, t\'a lancé une pierre gravée de runes en partant (code pour le Sage).'}, questions:[
      {q:'Salut Tim ! Ça va ?', a:'Euh… oui, oui, ça va. Je… je dois y aller !', note:'Tim a l\'air inquiet. Il veut s\'en aller.'},
      /* l'indice : le registre du Sage (« il ne confie ses secrets qu'à ceux qui promettent de ne rien répéter ») */
      /* (ni la question ni les choix ne parlent du trou ni de son chien : le Barde ne le sait pas encore ; Tim le dit lui-même en avouant) */
      {q:'Que faisais-tu près du Vieux Chêne ?', besoin:[{code:'info:tim_chene'}, {vu:'barde:margot:2'}],
        choix:choix('Si tu me le dis, je te promets de ne le répéter à personne.', ['Tu as été très courageux, Tim. Que faisais-tu là-bas ?', 'Tu peux tout me dire, Tim. Qu\'as-tu vu là-bas ?'], 1),
        a:'Rien ! Je me promenais. Je n\'ai rien vu, je le jure !', ment:true, objVrai:'pierre',
        vrai:'Au fond du trou, il y a une porte couverte de runes. J\'y ai ramassé cette pierre : donne-la à ton Sage. Et ce matin, des ouvriers ont bouché le trou avec de gros rochers !',
        note:'Tim dit qu\'il se promenait près du Vieux Chêne, et qu\'il n\'a rien vu.', noteVrai:'Tim a avoué : au fond du trou du Vieux Chêne, il y a une porte en pierre couverte de runes. Ce matin, des ouvriers ont posé de gros rochers sur le trou. Il t\'a donné une pierre gravée (code pour le Sage).'},
      /* filet de sécurité : si on n'a pas pu le démasquer, Tim finit par tout dire la nuit (jamais d'indice indispensable perdu) */
      {q:'Tim, tu as l\'air triste…', moments:['nuit'], besoin:[{vu:'barde:tim:1'}], cacheSi:[{vu:'verite:tim:1'}], obj:'pierre',
        a:'Je n\'arrive pas à dormir… Au fond du trou, il y a une porte couverte de runes : j\'y ai ramassé cette pierre, prends-la ! Et ce matin, des ouvriers ont bouché le trou avec de gros rochers.',
        note:'Tim a fini par tout dire : au fond du trou du Vieux Chêne, une porte en pierre couverte de runes ; ce matin, des ouvriers ont posé de gros rochers sur le trou. Il t\'a donné une pierre gravée (code pour le Sage).'}
    ]},
    /* (Romain, 5 novembre, 13 h 19 : son mensonge dès le matin ; il fait sa tournée dans la ruelle, on peut lui parler) */
    victor:{ou:{matin:'ruelle', apresmidi:'poste'}, carte:{nuit:'taverne'}, occupe:{nuit:'😴 Victor est trop fatigué pour parler.'}, salut:'Bonjour ! Je passe partout, tous les jours, avec mes lettres.', questions:[
      {q:'Avez-vous vu quelque chose de bizarre ces jours-ci ?', a:'Moi ? Toujours à l\'heure pour ma tournée ! Je n\'ai rien vu.', ment:true,
        vrai:'Bon… avant-hier, en retard, j\'ai coupé par la clairière aux lièvres. Avant l\'aube, une charrette partait du champ de coquelicots. Trop sombre pour voir qui !',
        note:'Victor dit qu\'il est toujours à l\'heure et qu\'il n\'a rien vu.', noteVrai:'Victor a avoué : avant-hier, en retard, il a coupé par la clairière. Avant l\'aube, une charrette partait du champ de coquelicots (trop sombre pour voir qui).'}
    ]},
    /* Gaspard dès le matin (Romain, 4 novembre, 22 h 38) : Odette, sa toute première cliente, n'est pas venue ; la pièce d'or de Bastien
       et le signe de Margot restent pour l'après-midi (moments) */
    gaspard:{ou:{matin:'boulangerie', apresmidi:'boulangerie', nuit:'boulangerie'}, salut:'Bonjour ! Du bon pain chaud ?',
      saluts:{matin:'Bonjour ! C\'est le coup de feu, mais pour toi, j\'ai une minute.', nuit:'Ah, c\'est toi ? Je prépare le pain de demain. Entre, entre !'}, questions:[
      /* (7 novembre : l'adresse d'Odette est sur la carte, son visage sur sa maison ; la canne, Mélusine en parle) */
      {q:'Quelles nouvelles, Gaspard ?', a:'Odette, ma toute première cliente, n\'est pas venue ce matin. Ça ne lui ressemble pas… Quelqu\'un devrait aller voir chez elle !', note:'Gaspard : Odette, sa toute première cliente, n\'est pas venue ce matin. Ça ne lui ressemble pas.'},
      {q:'Et rien d\'autre de bizarre ?', moments:['apresmidi', 'nuit'], a:'Si ! Bastien, le charretier, m\'a payé avec une pièce d\'or toute neuve. Lui qui n\'a jamais un sou !', note:'Gaspard : Bastien le charretier l\'a payé avec une pièce d\'or toute neuve, lui qui n\'a jamais un sou.'},
      /* les signes des menteurs ne se lisent plus : ils s'épinglent sur le liège, avec le nom (liege.js, Bible §12.50) */
      {q:'Margot dit toujours la vérité ?', mimique:'margot',   /* (dès le matin : Romain, 5 novembre, 13 h 19) */ ok:'Un signe de menteur ne dit pas qui est coupable.',
        a:'Margot ? Elle adore les vieilles légendes… et elle en invente parfois. Je connais son truc pour mentir : je te l\'épingle !',
        note:'Gaspard : Margot adore les vieilles légendes, et elle en invente parfois. Son signe de menteuse est sur ton tableau de liège.'}
    ]},
    /* la taverne est ouverte dès le matin (Romain, 5 novembre, 12 h 31 : c'est Margot qui confie les signes des menteurs) */
    margot:{ou:{matin:'taverne', apresmidi:'taverne', nuit:'taverne'}, salut:'Bienvenue au Chaudron fêlé !', questions:[
      {q:'On dit que c\'est votre vin qui a rougi la rivière !', a:'Mon vin ? N\'importe quoi ! Aucun tonneau n\'a disparu de ma taverne !', ment:true,
        vrai:'Bon… un tonneau est tombé dans la rivière la semaine dernière. Et l\'eau n\'a pas rougi du tout !',
        note:'Margot dit qu\'aucun tonneau n\'a disparu de sa taverne.', noteVrai:'Margot a avoué : un tonneau est tombé dans la rivière la semaine dernière, et l\'eau n\'est pas devenue rouge. Ce n\'est pas son vin.'},
      {q:'Bastien, c\'est un farceur ?', a:'Bastien, une farce ? Il déteste les farces ! Il n\'a jamais ri de sa vie.', note:'Margot : Bastien déteste les farces, il n\'a jamais ri de sa vie.'},
      /* (7 novembre) elle ne lit plus les six signes : six étiquettes, avec le nom, s'épinglent sur le liège (liege.js) */
      {q:'Comment sais-tu quand quelqu\'un ment ?', besoin:[{vu:'verite:margot:0'}], mimique:['victor', 'tim', 'bastien', 'melusine', 'fortune', 'farinel'], ok:'Des signes de menteurs ne disent pas qui est coupable.',
        a:'Ha ! Tu m\'as bien eue… Tiens, mes secrets de tavernière : je te les épingle. Et surveille le petit Tim : il traîne au Vieux Chêne, ces jours-ci.',
        note:'Margot t\'a confié comment mentent six villageois : six étiquettes sur ton tableau de liège. Le petit Tim traîne au Vieux Chêne, ces jours-ci.'},
      /* une deuxième source de la pièce de Bastien, la nuit (Romain, 23 h 20) : si Gaspard est vexé la nuit, Margot la raconte aussi
         (elle ouvre la même question chez Bastien) ; toujours à la fin de la liste : les numéros des questions ne bougent pas */
      {q:'Quoi de neuf, ce soir ?', moments:['nuit'],
        a:'Ce soir, toute la taverne en parle : Bastien a payé son pain chez Gaspard avec une pièce d\'or toute neuve. Lui qui n\'a jamais un sou !',
        note:'Margot (la nuit) : tout se raconte à la taverne. Bastien a payé son pain chez Gaspard avec une pièce d\'or toute neuve, lui qui n\'a jamais un sou.'}
    ]},
    melusine:{ou:{matin:'lavoir', apresmidi:'atelier'}, carte:{nuit:'atelier'}, occupe:{nuit:'😴 Elle dort à poings fermés.'}, salut:'Bonjour ! Attention aux épingles…', questions:[
      {q:'Odette vient laver son linge ici ?', a:'Odette ne vient plus au lavoir depuis hier… Ce n\'est pas son genre ! Et elle ne sort jamais sans sa canne aux sept chats.', note:'Mélusine : Odette ne vient plus au lavoir depuis hier. Elle ne sort jamais sans sa canne aux sept chats.'},
      {q:'Quand la rivière est-elle devenue rouge ?', a:'À l\'aube, la rivière était déjà toute rouge ! La pauvre Iris en a pleuré… Pour la consoler, rien de tel qu\'un compliment sur ses fleurs.', note:'Mélusine : à l\'aube, la rivière était déjà toute rouge. Pour consoler Iris : un compliment sur ses fleurs.'},
      {q:'Vos tissus déteignent dans le lavoir ?', besoin:[{code:'info:lavoir_rose'}], a:'Mes tissus ? Je les tisse tous moi-même ! Ils ne déteignent jamais.', ment:true,
        vrai:'Bon… je les achète en cachette à Fortuné, pas cher. Ils déteignent : c\'est eux qui ont rendu le lavoir tout rose. Pas la rivière, juré !',
        note:'Mélusine dit qu\'elle tisse tous ses tissus elle-même.', noteVrai:'Mélusine a avoué : elle achète en cachette des tissus pas chers à Fortuné. Ils déteignent : c\'est eux qui ont rendu le lavoir rose, pas la rivière.'},
      /* un signe de menteur dès le matin : celui de Fortuné (qu'on verra l'après-midi, sur la place) */
      {q:'Qui raconte des histoires, au village ?', mimique:'fortune', ok:'Un signe de menteur ne dit pas qui est coupable.',
        a:'Méfie-toi de Fortuné, le colporteur ! Je connais son truc pour mentir : je te l\'épingle. Regarde-le bien, cet après-midi.',
        note:'Mélusine : méfie-toi de Fortuné, le colporteur. Son signe de menteur est sur ton tableau de liège.'}
    ]},
    fortune:{ou:{apresmidi:'place'}, carte:{matin:'pont', nuit:'lisiere'}, occupe:{matin:'« Je m\'installe sur la place cet après-midi ! »', nuit:'😴 Il ronfle dans sa carriole.'}, salut:'Approchez, approchez ! Des tissus, des rubans, des merveilles !', questions:[
      /* seulement quand le Barde sait que Mélusine achète ses tissus à Fortuné (elle l'a avoué, ou l'oreille à l'atelier) */
      {q:'Vous vendez des tissus à Mélusine ?', besoin:[{vu:'verite:melusine:2'}, {vu:'barde:oreille:atelier'}], a:'À Mélusine ? Jamais de la vie !', ment:true,
        vrai:'Bon… je lui vends des tissus pas chers, en cachette. Ils déteignent un peu. Chut !',
        note:'Fortuné dit qu\'il n\'a rien vendu à Mélusine.', noteVrai:'Fortuné a avoué : il vend en cachette à Mélusine des tissus pas chers, qui déteignent.'},
      {q:'Vous avez vendu quelque chose d\'étrange ?', a:'Avant-hier, un homme en cape noire m\'a acheté toute ma poudre noire. Il m\'a donné de l\'or, sans un mot, le visage caché.', note:'Fortuné : avant-hier, un homme en cape noire lui a acheté toute sa poudre noire, avec de l\'or. Visage caché.'}
      /* (7 novembre : plus de question sur Victor et les contes de fées, un leurre pour un dialogue qui n'existe plus) */
    ]},
    /* vexeDonne (5 novembre, 1 h 40) : sans les plans du moulin, plus de pièce cachée (Romain, 0 h 27) ; vexé la nuit avant d'avoir parlé
       des traces, Farinel ne pouvait plus les donner et l'enquête n'avait plus de OÙ. Fâché, il les donne quand même (si le Barde a les traces). */
    farinel:{ou:{matin:'moulin', apresmidi:'moulin', nuit:'moulin'}, salut:'Bonjour, bonjour ! Tu veux de la farine ?', saluts:{nuit:'Hein ?! Qui me réveille en pleine nuit ?! Grrr… Bon, qu\'est-ce que tu veux ?'},
      vexeDonne:{info:'plans_moulin', besoin:[{code:'info:traces'}], deja:'barde:farinel:2', moments:['nuit'],
        a:'Il te fourre un vieux rouleau dans les mains : « Les plans de mon moulin ! Tu verras qu\'il n\'y a rien chez moi. Et laisse-moi dormir ! »',
        note:'Farinel, fâché, t\'a donné les vieux plans de son moulin (code pour le Sage).'}, questions:[
      /* Léo Mouture, l'apprenti (Romain, 4 novembre) : une seule ligne ici, on ne le voit jamais dans l'enquête 2 (il servira dans l'enquête 3) */
      {q:'Rien de bizarre au moulin ?', a:'Rien du tout, tout va bien ! Mon apprenti, Léo ? Encore parti livrer la farine, celui-là…', note:'Farinel : rien de bizarre au moulin. Son apprenti, Léo, est encore parti livrer la farine.'},
      {q:'Vous travaillez toute la journée ?', a:'Toute la journée ! Jamais de sieste, moi !', ment:true, ok:'Une sieste ne prouve rien.',
        vrai:'Bon… je fais la sieste tous les après-midi, sur mes sacs de farine. Chut !',
        note:'Farinel dit qu\'il ne fait jamais la sieste.', noteVrai:'Farinel a avoué : il fait la sieste tous les après-midi sur ses sacs de farine. Rien à voir avec la rivière !'},
      {q:'Des traces de charrette vont jusqu\'à votre moulin !', besoin:[{code:'info:traces'}], donne:'info:plans_moulin',
        /* (Romain, 23 h 22) : le texte seulement ; la ligne du code : infos.plans_moulin.dire */
        a:'Des traces, chez moi ? Tout le monde passe dans ma cour ! Tiens, les vieux plans du moulin de mes ancêtres : tu verras qu\'il n\'y a rien.',
        note:'Farinel : les traces de charrette ne mènent nulle part, dit-il. Il t\'a donné les vieux plans de son moulin, bâti par ses ancêtres (code pour le Sage).'}
    ]},
    /* (7 novembre : la phrase de §13.10, raccourcie ; l'astuce pour l'enquête 3 reste mot pour mot, et le salut n'est dit qu'une fois) */
    iris:{ou:{matin:'herboristerie', apresmidi:'herboristerie'}, carte:{nuit:'herboristerie'}, occupe:{nuit:'😴 Elle dort.'}, salut:'Grrr… Les gens achètent mes bouquets sans même les sentir ! Celui qui prendra la peine de sentir mes fleurs, je lui ferai une réduction, foi d\'Iris !',
      /* (Bible §13.10, 6 novembre : l'astuce d'Iris, pour le marché aux fleurs de l'enquête 3 ; elle s'inscrit aussi dans le Carnet) */
      noteSalut:'Iris fait une réduction à qui prend la peine de sentir ses fleurs.', questions:[
      {q:'Bonjour Iris ! Vous avez l\'air fâchée…', a:'FURIEUSE ! Avant-hier, quelqu\'un a rasé tout mon champ de coquelicots, à la clairière aux lièvres !', note:'Iris : avant-hier, quelqu\'un a rasé tout son champ de coquelicots, à la clairière aux lièvres.'},
      /* l'indice : Mélusine (« pour la consoler, rien de tel qu'un compliment sur ses fleurs ») ; après sa colère (son champ rasé),
         pour qu'aucun choix ne dise avant elle que ses coquelicots ont disparu */
      {q:'À quoi servent vos coquelicots ?', besoin:[{vu:'barde:iris:0'}], choix:choix('Vos coquelicots devaient être magnifiques… À quoi servaient-ils ?', ['On pourrait en replanter ensemble. À quoi servaient-ils ?', 'Le maire va sûrement vous aider. À quoi servaient-ils ?'], 2),
        a:'Ils donnent un rouge magnifique… qui part au premier lavage : pour teindre, ça ne vaut rien. Et pour le tirer des fleurs, il faut des alambics.',
        note:'Iris : le rouge de coquelicot part à l\'eau, il ne sert à rien pour teindre un tissu. Pour le fabriquer, il faut des alambics.'},
      {q:'Votre champ est tout rasé : on a emporté les fleurs ?', besoin:[{code:'info:champ_rase'}], a:'Jusqu\'à la dernière ! Il a fallu une grande charrette pour tout emporter.', note:'Iris : il a fallu une grande charrette pour emporter toutes ses fleurs.'},
      /* un signe de menteur dès le matin (Romain, 22 h 25) : celui de Mélusine, la menteuse du matin (son tissu) */
      {q:'Vous connaissez bien Mélusine ?', mimique:'melusine', ok:'Un signe de menteur ne dit pas qui est coupable.',
        a:'Mélusine ? Elle est gentille… mais elle raconte de petits mensonges. Je connais son truc : je te l\'épingle.',
        note:'Iris : Mélusine raconte de petits mensonges. Son signe de menteuse est sur ton tableau de liège.'}
    ]},
    silas:{ou:{matin:'foret', apresmidi:'foret', nuit:'foret'}, salut:'Halte ! Ordre du maire.', questions:[
      {q:'Pourquoi gardez-vous ce chemin ?', a:'Ordre du maire : personne ne va au Vieux Chêne ! Un éboulement, c\'est dangereux. Les autres chemins sont libres.', note:'Silas : ordre du maire, personne ne va au Vieux Chêne. Les autres chemins sont libres.'},
      {q:'Vous avez vu passer quelqu\'un ?', a:'Avant-hier, avant l\'aube, une charrette est passée vers la clairière. Je n\'ai pas vu qui la poussait. Et Victor est passé aussi, comme tous les jours.', note:'Silas : avant-hier, avant l\'aube, une charrette est passée vers la clairière. Victor aussi, comme tous les jours.'},
      /* un signe de menteur dès le matin : celui de Farinel (le meunier, qui ment pour rire, le matin aussi) */
      {q:'On vous raconte souvent des histoires ?', mimique:'farinel', ok:'Un signe de menteur ne dit pas qui est coupable.',
        a:'Tous les jours ! Farinel, le meunier, m\'en raconte de belles… Je connais son truc : je te l\'épingle.',
        note:'Silas : Farinel, le meunier, raconte des histoires. Son signe de menteur est sur ton tableau de liège.'}
    ]},
    grosbec:{ou:{matin:'mairie', apresmidi:'mairie'}, carte:{nuit:'mairie'}, occupe:{nuit:'🔒 La mairie est fermée pour la nuit.'}, salut:'Ah, mes enquêteurs ! Alors, cette rivière ?', questions:[
      {q:'Qui a rendu la rivière rouge ?', a:'Sans doute une mauvaise farce ! Trouvez vite le coupable, que le village se calme.', note:'Le maire pense que c\'est « une mauvaise farce ».'},
      /* le maire ne ment jamais (Romain, 5 novembre, 01 h 36) : il ne parle pas d'éboulement, il tait le reste */
      {q:'Pourquoi le chemin du Vieux Chêne est-il fermé ?', a:'C\'est très dangereux là-bas, mon petit. Je ne peux pas t\'en dire plus. Que personne n\'y aille !', note:'Le maire : c\'est très dangereux au Vieux Chêne, et il ne peut pas en dire plus. Personne ne doit y aller.'}
    ]},
    /* la maison d'Odette (2, rue des Lanternes) : la scène est la même quel que soit l'ordre du jeu */
    voisin:{ou:{matin:'L2', apresmidi:'L2', nuit:'L2'}, salut:'Tu frappes chez Odette… Pas de réponse. La porte n\'est pas fermée à clé.', questions:[
      {q:'Pousser la porte d\'Odette', donne:'info:odette', ok:'Odette a disparu : ça ne dit pas qui a rougi la rivière.',
        a:'Un chat jaillit entre tes jambes ! Dedans, personne, et le lit n\'est pas défait. Le voisin, à sa fenêtre : « Odette ? Pas vue depuis hier soir… »',
        note:'Chez Odette : personne. Son lit n\'est pas défait, elle n\'a pas dormi chez elle. Un de ses chats s\'est sauvé.'}
    ]}
  },
  ecoutes:[
    /* mj:'trous' : une phrase à trous dans le Carnet (barde.js) ; on ne dit jamais si c'est juste. Pendant que le Barde attend la pièce du Pisteur. */
    {id:'ouvriers', role:'barde', lieu:'lavoir', moments:['nuit'], titre:'Des voix au lavoir', mj:'trous', ok:'Les ouvriers ne parlent pas de la rivière.',
      intro:'Au lavoir, deux ouvriers lavent leurs mains pleines de terre en chuchotant. Cache-toi derrière les draps !',
      entendu:'Avec le bruit de l\'eau, tu n\'as entendu que des morceaux…',
      params:{phrases:[
        {qui:'👷', texte:'Ouf ! On a tout [bouché] avant l\'[aube].'},
        {qui:'👷', texte:'Et on nous a bien [payés] pour ça !'},
        {qui:'👷', texte:'Chut ! Personne ne doit [approcher] du [chêne].'}],
        pieges:['fermé', 'creusé', 'nuit', 'midi', 'grondés', 'aidés', 'parler', 'pont', 'moulin']},   /* des pièges qui vont aussi dans la phrase */
      t:'Deux ouvriers, au lavoir, la nuit : « On a tout bouché avant l\'aube. On nous a bien payés pour ça. Chut ! Personne ne doit approcher du chêne. »',
      note:'Lavoir (nuit) : deux ouvriers aux mains pleines de terre parlent d\'avoir tout bouché, et d\'être payés. Personne ne doit approcher du chêne.'}
  ],
  /* Tendre l'oreille (talent du niveau 2, barde.js) : devant un bâtiment, deux fois par enquête ; des phrases à trous.
     Utiles sans être indispensables : la boulangerie (la pièce d'or), l'atelier (le lavoir rose), la taverne (le tonneau). t : la bribe en entier (vérificateur). */
  bribes:[
    {id:'boulangerie', lieu:'boulangerie', moments:['matin', 'apresmidi'], titre:'Dans le fournil',
      intro:'Dans le fournil, Gaspard bavarde avec son apprenti…',
      phrases:[
        {qui:'gaspard', texte:'Et devine quoi : Bastien m\'a payé son pain avec une [pièce] d\'or toute [neuve] !'},
        {qui:'🧑‍🍳', texte:'Bastien ? Lui qui n\'a jamais un [sou] ?'},
        {qui:'gaspard', texte:'Exactement ! C\'est [bizarre], non ?'}],
      pieges:['brioche', 'vieille', 'cassée', 'ami', 'pain', 'drôle', 'normal'],
      t:'Gaspard : Bastien l\'a payé avec une pièce d\'or toute neuve, lui qui n\'a jamais un sou. C\'est bizarre.'},
    {id:'atelier', lieu:'atelier', moments:['apresmidi'], titre:'Derrière la porte de l\'atelier',
      intro:'Mélusine parle toute seule en rinçant un tissu…',
      phrases:[
        {qui:'melusine', texte:'Encore ce tissu de [Fortuné] qui déteint dans mon seau…'},
        {qui:'melusine', texte:'Toute l\'eau du [lavoir] est devenue [rose] à cause de lui !'},
        {qui:'melusine', texte:'Chut… Personne ne doit savoir que je ne [tisse] plus moi-même.'}],
      pieges:['Margot', 'pont', 'bleue', 'rouge', 'couds', 'lave'],
      t:'Mélusine : le tissu de Fortuné déteint ; c\'est lui qui a rendu le lavoir rose. Elle ne tisse plus elle-même.'},
    {id:'taverne', lieu:'taverne', moments:['apresmidi', 'nuit'], titre:'Au comptoir de la taverne',
      intro:'Au comptoir, Margot bavarde avec un client…',
      phrases:[
        {qui:'margot', texte:'Le [tonneau] tombé dans la rivière la semaine dernière ? L\'eau n\'a même pas [rougi] !'},
        {qui:'🧔', texte:'Alors ce n\'est pas ton [vin] qui a fait ça.'},
        {qui:'margot', texte:'Bien sûr que non ! Mais chut, je n\'aime pas qu\'on en [parle].'}],
      pieges:['sac', 'panier', 'bougé', 'gelé', 'pain', 'lait', 'rie', 'sache'],
      t:'Margot : un tonneau est tombé dans la rivière la semaine dernière, et l\'eau n\'a pas rougi. Ce n\'est pas son vin.'}
  ],
  /* Odette n'est pas chez elle : pour le Pisteur, l'Alchimiste et le Sage (le Barde, lui, trouve la porte ouverte : « voisin ») */
  absentTexte:{odette:'Odette n\'est pas chez elle… C\'est bizarre ! Dis au Barde de venir voir.'},
  /* 👂 Écouter aux portes (talent « Tendre l'oreille », Romain, 5 novembre, 12 h 31) : chacun a toujours quelque chose à dire, à chaque
     moment, là où il est (barde.js : B.porteIci). Ce qu'ils pensent de l'enquête, en rapport avec leur métier ; rien qui ne soit prévu
     ailleurs (les vrais indices restent dans les bribes ci-dessus, qui passent avant). Le Carnet le garde sur la page de chacun. */
  /* (Romain, 7 novembre : le Barde lit trop, surtout avec ce talent) une seule phrase, 15 mots au plus (Bible §12.50) */
  portes:{
    bastien:{matin:'Allez, bois, Cocotte ! Tu n\'as rien à craindre de cette eau rouge…',
      apresmidi:'Tout le monde parle de cette rivière… Moi, je transporte, je ne pose pas de questions !',
      nuit:'Bastien bâille : « Mes roues grincent… Il faudra les graisser demain. »'},
    tim:{apresmidi:'Tim, à son chien : « Avec cette rivière rouge, plus personne ne fait ramoner, Pirate… »',
      nuit:'Tim chuchote : « Dors, Pirate. Demain, on ramone chez Gaspard. »'},
    victor:{matin:'Ma sacoche n\'a jamais été si lourde : tout le monde écrit au maire !',
      apresmidi:'Victor tamponne ses lettres : « Une rivière rouge… Même les canards sont partis ! »'},
    gaspard:{nuit:'Gaspard pétrit : « Avec l\'eau de la rivière, je ferais du pain rose ! »'},
    margot:{matin:'Margot essuie ses chopes : « Ce village devient plus mystérieux que mes histoires ! »'},
    melusine:{matin:'Mélusine frotte son linge tout rose : « J\'aurais dû m\'en douter… Quel escroc ! »'},
    fortune:{matin:'Fortuné range ses rubans : « Cet après-midi, tout le monde voudra mes tissus ! »',
      apresmidi:'Fortuné : « Moi, cette rivière rouge, je la trouve jolie… Mais ce n\'est pas moi ! »'},
    farinel:{matin:'Farinel chante : « Tourne, mon moulin… Même dans l\'eau rouge, ma roue tourne ! »',
      apresmidi:'Farinel tousse dans la farine : « Que de monde dans ma cour, aujourd\'hui ! »',
      nuit:'Farinel ronfle si fort que les murs tremblent : « Rrrr… pas touche à mon grain… »'},
    iris:{matin:'Iris grogne : « Pas une goutte de cette eau rouge pour mes fleurs ! »',
      apresmidi:'Iris trie ses herbes : « Ici, au moins, personne ne touche à mes plantes. »'},
    silas:{matin:'Silas fait les cent pas : « Personne ne passe. Même pas les écureuils ! »',
      apresmidi:'Silas bâille : « Et si quelqu\'un passait derrière mon dos ? Bah, impossible ! »',
      nuit:'Silas grelotte : « Toute la nuit dans le froid… et ce vieux chêne qui grince ! »'},
    grosbec:{matin:'Le maire soupire : « Une rivière rouge… Au moins, les gens ont l\'esprit ailleurs. »',
      apresmidi:'Le maire grogne : « Encore une plainte… Heureusement, Silas tient bon au Vieux Chêne. »'}
  },
  /* Hydromel des confidences (talent du niveau 6) : ce qu'un villageois confie pour innocenter un suspect (jamais le coupable) */
  alibis:{
    melusine:'Mélusine ? Ses tissus déteignent, c\'est tout. Elle n\'a jamais touché à la rivière.',
    margot:'Margot ? La nuit dernière, elle a servi la soupe jusqu\'à minuit, puis elle a dormi dans sa taverne.',
    iris:'Iris ? C\'est son champ qu\'on a rasé ! Elle pleure ses coquelicots depuis deux jours.',
    farinel:'Farinel ? Il dort comme une souche, la nuit. Il ronfle si fort qu\'on l\'entend du pont !'
  },
  /* (Romain, 10 novembre, 17 h 50 : plus aucun mini-jeu d'analyse, dans aucune enquête ; le résultat tombe tout de suite dans le labo,
     en attendant le nouveau laboratoire d'analyse, construit dans une autre conversation. Le chaudron reste.) */
  analyses:{
    eau_riviere:{
      t:'Sous ta loupe, dans l\'eau de la rivière : un colorant rouge… un colorant qui part à l\'eau : il ne tient sur rien, il ne fait que colorer l\'eau. Et il arrive déjà rouge d\'en haut de la rivière : ce n\'est pas au pont qu\'on l\'a versé.',
      note:'Analyse de la rivière : un colorant rouge qui part à l\'eau (il ne tient sur rien). Il arrive d\'en haut : on ne l\'a pas versé au pont.'},
    eau_lavoir:{donne:'info:lavoir_rose',
      t:'Sous ta loupe, l\'eau du lavoir n\'a rien à voir avec la rivière : ce rose vient d\'un tissu qui déteint, comme un vêtement neuf qu\'on lave pour la première fois !',
      note:'Analyse du lavoir : ce rose vient d\'un tissu qui déteint. Rien à voir avec le rouge de la rivière.'},
    colorant:{
      t:'Sous ta loupe, le reste de l\'alambic a exactement la même couleur que la rivière : c\'est le même rouge ! C\'est bien dans la pièce cachée du moulin qu\'on a fabriqué le colorant.',
      note:'Analyse du colorant : c\'est le même rouge que la rivière. Il a été fabriqué dans la pièce cachée du moulin.'},
    /* la poudre du pot noir (Romain, 23 h 14) : avant le rassemblement, elle fera une fumée rouge ; après, c'est elle qui l'a faite :
       un fumigène, pas des vapeurs toxiques (variantes : moteur-actions.js, M.texteAnalyse, relu à chaque fois) */
    poudre:{
      t:'Sous ta loupe : de la poudre noire, comme celle des feux d\'artifice… mélangée à un colorant rouge ! Si on l\'allume, ça fera une grosse fumée toute rouge. Mais pour quoi faire ?',
      note:'Analyse de la poudre du pot noir : de la poudre noire mélangée à un colorant rouge. De quoi faire une fumée rouge !',
      variantes:[
        {si:[{code:'info:rassemblement'}], t:'De la poudre noire mélangée à un colorant rouge : c\'est un fumigène ! C\'est lui qui a fait la fumée rouge du rassemblement. Ce n\'étaient pas des vapeurs toxiques : quelqu\'un a voulu vous faire peur !',
          note:'Analyse de la poudre du pot noir : un fumigène (poudre noire et colorant rouge). La fumée rouge du rassemblement, ce n\'étaient pas des vapeurs toxiques.'}
      ]}
  },
  pages:[
    {id:'habitants', titre:'Les habitants', ic:'👥', type:'registre'},   /* (plus de code pour le Barde : Romain, 5 novembre, 01 h 20) */
    {id:'recettes', titre:'Les recettes', ic:'🧪',
      recette:'verite', t:'Potion de vérité, pour faire avouer un menteur : ' + D.texteEtapes('verite') + '.',
      note:'Recette de la potion de vérité : ' + D.texteEtapes('verite') + '.'},
    /* Les vieux chemins : Superposer les plans → le détour des bûcherons (un chemin secret, pour le Pisteur seulement : chemins, plus haut).
       Raté deux fois : l'indice partiel suffit, et le code est donné quand même (ouvrePartiel) : le Pisteur doit pouvoir aller au chêne. */
    /* rangés DANS « 📚 La bibliothèque des plans » (Romain, 5 novembre, 15 h 05 : « ça fait deux pages pour rien »), dès le début */
    {id:'chemins', dans:'bibliotheque', titre:'Les vieux chemins', ic:'🗺️', mj:'plans', params:{carte:'foret', secret:'chene', passage:'le chemin des bûcherons'}, bouton:'Superposer les vieux chemins',
      ouvrePartiel:true, partiel:true, donne:'info:detour',
      avant:'Un très vieux plan de la forêt, avec des chemins que plus personne ne prend. Pose-le sur le plan d\'aujourd\'hui : un vieux chemin mène peut-être au Vieux Chêne sans passer devant le garde…',
      t:'Sur le vieux plan, un chemin des bûcherons fait le tour de la forêt et arrive au Vieux Chêne par derrière, loin du garde !',
      note:'Vieux chemins : le chemin des bûcherons arrive au Vieux Chêne par derrière, loin du garde. Code pour le Pisteur.',
      rate:'La bougie s\'éteint, les plans se brouillent…',
      tPartiel:'Il reste juste assez du dessin : un vieux chemin des bûcherons qui arrive au Vieux Chêne par derrière.',
      rateNote:'Vieux chemins (à moitié effacé) : un chemin des bûcherons arrive au Vieux Chêne par derrière.'},
    /* Le plan du moulin (le code de Farinel) → Assembler les runes → le passage. Rangé DANS la page « 📐 La bibliothèque des plans »
       de toutes les enquêtes (dans, livre.js) : il n'y apparaît qu'une fois le code tapé, et la page ne dit jamais quoi chercher.
       Sans ce plan, le Pisteur n'entre jamais dans la pièce cachée (Romain, 5 novembre, 00 h 27) : raté deux fois, le plan à moitié effacé
       suffit, et le code est donné quand même (ouvrePartiel, comme les vieux chemins). */
    {id:'bibliotheque', dans:'bibliotheque', titre:'Le plan du moulin', ic:'📐', besoin:[{code:'info:plans_moulin'}], mj:'runes', params:{image:'moulin'}, bouton:'Réparer le plan déchiré',
      ouvrePartiel:true, partiel:true,
      tPartiel:'Le plan est à moitié effacé… mais on voit encore, sous la grande roue, une petite pièce sans porte, et un passage secret pour y entrer.',
      rateNote:'Bibliothèque des plans (à moitié effacé) : sur le vieux plan du moulin, une pièce sans porte sous la grande roue, et un passage secret.',
      avant:'Voici le vieux plan du moulin de Farinel… mais il est tout déchiré ! Remets les morceaux en place.',
      t:'Le plan du moulin, bâti par les ancêtres de Farinel ! Une fois réparé, on voit une petite pièce sans porte, cachée sous la grande roue, et un passage secret pour y entrer.',
      note:'Bibliothèque des plans : sur le vieux plan du moulin, une pièce sans porte sous la grande roue, et un passage secret (code pour le Pisteur).', donne:'info:passage',
      rate:'Les morceaux du plan se mélangent…'},
    /* La pierre de Tim (code du Barde) → L'alphabet secret (message proposé, Romain n'a pas encore choisi). Rangée DANS la page
       « 🔮 Les objets magiques » de toutes les enquêtes (dans, livre.js) : elle n'y apparaît qu'une fois le code tapé. */
    {id:'pierre', dans:'objets', titre:'La pierre gravée', ic:'🪨', besoin:[{code:'obj:pierre'}], mj:'alphabet', params:{message:'SOUS LA BRUME DORT LA VILLE D AVANT'}, bouton:'Déchiffrer les runes',
      avant:'La pierre de Tim est couverte de runes. Que disent-elles ?',
      t:'Les runes de la pierre disent : « SOUS LA BRUME DORT LA VILLE D\'AVANT ». Qu\'est-ce que ça veut dire ?',
      note:'La pierre de Tim : « SOUS LA BRUME DORT LA VILLE D\'AVANT ».',
      rate:'Les runes sont trop abîmées… Tu as juste pu lire : « … LA BRUME … LA VILLE … »', rateNote:'La pierre de Tim (abîmée) : « … LA BRUME … LA VILLE … »', partiel:true},
    /* 📣 Le rassemblement du village (Romain, 4 novembre, 22 h 41, puis 5 novembre, 01 h 36) : le Sage, la nuit seulement, et quoi qu'il
       arrive (plus de preuves à réunir). obligatoire (livre.js) : quand sa tablette passe à la nuit, le Grand Livre s'ouvre sur cette page,
       et il y revient chaque fois qu'il rouvre son livre, tant que le village n'est pas rassemblé (il peut toujours tourner les pages).
       La scène animée (illu, regles.js), puis le code du récit pour les autres tablettes. Le texte tient même si l'équipe n'a encore rien trouvé. */
    {id:'rassemblement', titre:'Rassembler le village', ic:'📣', moments:['nuit'], obligatoire:true,
      horsMoment:'Le village ne se rassemblera que la nuit, quand tout le monde sera rentré chez soi.',
      avant:'La nuit tombe sur Brumeval. Tout le village se demande ce qui se passe au Vieux Chêne, que le maire a fermé… Prends ta lanterne, frappe à toutes les portes, et emmène tout le monde là-bas !', bouton:'Rassembler le village', boutonIc:'📣 ', illu:'rassemblement',
      t:'Tu frappes à toutes les portes, ta lanterne à la main… et tout le village te suit ! Silas veut vous arrêter, mais vous êtes bien trop nombreux. Au Vieux Chêne, de gros rochers bouchent le trou. Derrière un buisson, quelqu\'un se sauve en courant… Soudain, PFFFT ! Une épaisse fumée rouge sort de sous les branches ! Le maire arrive en courant, en bonnet de nuit, avec Silas sur ses talons. Silas crie : « Ce sont des vapeurs toxiques ! Elles montent des sous-sols ! » Et le maire : « Reculez ! Ne respirez pas ça ! La zone est condamnée. Rentrez chez vous ! » Tout le monde s\'enfuit en toussant. Raconte tout à l\'équipe : donne-leur ce code !',
      /* le maire ne ment jamais (Romain, 5 novembre, 8 h 59) : c'est Silas qui parle des vapeurs toxiques (il le croit, comme l'« éboulement ») */
      note:'Le rassemblement (la nuit) : au Vieux Chêne, une fumée rouge est sortie de sous les branches. Silas a crié : « Ce sont des vapeurs toxiques ! Elles montent des sous-sols ! » Le maire : « La zone est condamnée. Rentrez chez vous ! » Quelqu\'un s\'est sauvé derrière un buisson.', donne:'info:rassemblement'}
  ],
  bonus:[
    {id:'cerfvolant', role:'pisteur', lieu:'clocher', moments:['matin', 'apresmidi'], mj:'tir', params:{decor:'cerfvolant'}, or:15, titre:'Le cerf-volant du clocher',
      t:'Le cerf-volant d\'un enfant est coincé en haut du clocher. Coupe la ficelle avec une flèche !'},
    {id:'brioches', role:'alchimiste', lieu:'boulangerie', moments:['apresmidi', 'nuit'], mj:'melange', or:15, titre:'La confiture de Gaspard',
      t:'Gaspard a perdu la recette de la confiture de ses brioches ! Retrouve sa couleur exacte.'},
    /* (plus de mission « Les ragots de la taverne » : Romain, 5 novembre, 9 h 03, le mini-jeu des ragots est abandonné) */
    {id:'blason', role:'sage', lieu:'mairie', moments:['matin', 'apresmidi'], mj:'runes', or:15, titre:'Le blason de la mairie',
      t:'Le vieux blason de la mairie est tombé et s\'est cassé en morceaux : remets-les en place !', params:{image:'blason'}}
  ],
  fin:{
    slides:[
      'Au petit matin, vous racontez tout au maire. Il fait venir Bastien Roulebosse, le charretier. Bastien baisse la tête : « C\'est moi… Un homme en cape noire m\'a payé pour rendre la rivière rouge. Je ne sais pas qui c\'était ! »',
      'Le maire tape sur la table : « En prison ! Payé ? Par qui ? Bah, peu importe : l\'affaire est close ! » Et il range très vite ses papiers.',
      'Le lendemain, la rivière redevient claire. Les poissons ressortent, les lavandières chantent… Mais au village, tout le monde ne parle que d\'Odette. Où est-elle ? Personne ne l\'a revue.',
      'Au Vieux Chêne, un des chats d\'Odette est assis devant les gros rochers. Il miaule, il gratte la pierre, comme s\'il attendait quelqu\'un…',
      'Vous vous regardez tous les quatre. Une canne près des rochers, une porte couverte de runes au fond du trou, Odette disparue… Cette affaire n\'est pas finie. Il faut aller voir ce qu\'il y a derrière ces rochers !',
      '<b>À suivre…</b>'
    ],
    calepin:[
      {ic:'👵', t:'Odette a disparu : elle n\'a pas dormi chez elle.'},
      {ic:'🦯', t:'La canne d\'Odette était dans l\'herbe, près des rochers du Vieux Chêne.'},
      {ic:'🚪', t:'Tim a vu une porte couverte de runes au fond du trou du Vieux Chêne.'},
      {ic:'🪨', t:'La pierre gravée de Tim vient du fond du trou. Ses runes parlent d\'une « ville d\'avant ».'},
      {ic:'🧥', t:'Un homme en cape noire a payé Bastien, et acheté de la poudre noire à Fortuné.'},
      {ic:'🔴', t:'Devant la fumée rouge du Vieux Chêne, Silas a crié : « Vapeurs toxiques ! » Le maire a fait condamner la zone.'}
    ]
  },
  /* Les archives du Grand Livre du Sage, à partir de l'enquête 3 (livre.js, Bible §12.28). Rien de plus que ce que toute équipe
     apprend ou que la fin raconte : pas la crypte, pas le pot noir (Romain, 7 novembre). */
  archive:{
    resume:'Un matin, la rivière de Brumeval est devenue toute rouge. C\'est Bastien Roulebosse, le charretier, qui l\'avait teinte : un homme en cape noire l\'avait payé.',
    parties:[
      {ic:'📜', titre:'Ce qui s\'est passé', lignes:[
        ['🌺', 'Avant l\'aube, quelqu\'un a rasé tout le champ de coquelicots d\'Iris, à la clairière aux lièvres, et emporté les fleurs en charrette.'],
        ['⚗️', 'Dans une pièce cachée du moulin, des alambics en ont tiré un rouge qui part à l\'eau. La nuit, il a été versé dans la rivière.'],
        ['🪙', 'C\'était Bastien, le charretier. Un homme en cape noire l\'a payé en pièces d\'or toutes neuves. Bastien n\'a jamais vu son visage.'],
        ['⚖️', 'Le maire a mis Bastien en prison : « Payé ? Par qui ? Bah, peu importe : l\'affaire est close ! »'],
        ['🐟', 'Le lendemain, la rivière est redevenue claire.']
      ]},
      {ic:'⭐', titre:'Les grands moments de l\'enquête', lignes:[
        ['🍞', 'Bastien a payé son pain chez Gaspard avec une pièce d\'or toute neuve, lui qui n\'a jamais un sou.'],
        ['🛒', 'Des traces de charrette allaient du champ rasé jusqu\'à la cour du moulin, puis se perdaient sur les pavés.'],
        ['📐', 'Les vieux plans du moulin, donnés par Farinel et réparés par le Sage, montraient une petite pièce sans porte.'],
        ['🩷', 'Le lavoir était rose pour une autre raison : les tissus pas chers que Fortuné vend en cachette à Mélusine déteignent.'],
        ['🍷', 'Le tonneau de Margot, tombé dans la rivière la semaine d\'avant, n\'avait pas rougi l\'eau.'],
        ['📣', 'La nuit, le Sage a emmené le village au Vieux Chêne. Une fumée rouge en est sortie ; Silas a crié « Vapeurs toxiques ! », et le maire a fait condamner la zone.']
      ]},
      {ic:'🔑', titre:'À retenir pour la suite', lignes:[
        ['👵', 'Odette a disparu : elle n\'a pas dormi chez elle, et personne ne l\'a revue.'],
        ['🦯', 'Sa canne aux sept chats était dans l\'herbe, près des rochers du Vieux Chêne. Odette ne sort jamais sans elle.'],
        ['🪨', 'De gros rochers bouchent le trou du Vieux Chêne. Le chemin est fermé par ordre du maire, et Silas le garde.'],
        ['🚪', 'Au fond du trou, Tim a vu une porte couverte de runes. Les runes de sa pierre gravée parlent d\'une « ville d\'avant ».'],
        ['🧥', 'Un homme en cape noire, le visage toujours caché, a payé Bastien et acheté toute la poudre noire de Fortuné.'],
        ['🐈', 'Un des chats d\'Odette attend devant les rochers du Vieux Chêne, et gratte la pierre.']
      ]},
      {ic:'👥', titre:'Ce qu\'on sait des habitants', lignes:[
        ['🛒', 'Bastien Roulebosse, le charretier : il est en prison. Il déteste les farces.'],
        ['👨‍🍳', 'Gaspard, le boulanger : Odette était sa toute première cliente, chaque matin.'],
        ['🍺', 'Margot, la tavernière : elle adore les vieilles légendes, et elle connaît le signe de chaque menteur du village.'],
        ['🧵', 'Mélusine, la couturière : elle achète en cachette des tissus pas chers à Fortuné, pour économiser.'],
        ['🤠', 'Fortuné, le colporteur : il vend de tout… mais pas toujours de la bonne qualité.'],
        ['🌾', 'Farinel, le meunier : il fait la sieste sur ses sacs de farine. Son apprenti, Léo, est toujours parti livrer.'],
        ['🌿', 'Iris, l\'herboriste : c\'était son champ de coquelicots. Elle aime ses fleurs plus que tout.'],
        ['💂', 'Silas, le garde champêtre : il obéit aux ordres du maire.'],
        ['🎩', 'Monsieur Grosbec, le maire : il ne quitte jamais ses gants gris. Il a clos l\'affaire très vite.']
      ]}
    ]
  },
  defaite:[
    'Le maire soupire : « Vous n\'avez pas trouvé ? Quelle déception… » La rivière reste toute rouge, et personne ne sait pourquoi.',
    'La brume entre dans le village et efface vos souvenirs… D\'autres enquêteurs viendront.'
  ],
  /* Les faits (tools/verif.js) : ce que chaque indice écarte. QUI se trouve (la pièce d'or), OÙ et POURQUOI aussi. */
  faits:[
    /* QUI : la pièce d'or toute neuve de Bastien (Gaspard, ce qu'on entend au fournil, ou Margot la nuit) + celle sous l'alambic (Pisteur) */
    {sources:[['barde:gaspard:1', 'barde:oreille:boulangerie', 'barde:margot:3'], 'pisteur:moulin:piece'], qui:['melusine', 'margot', 'iris', 'farinel']},
    {sources:['barde:bastien:1'], qui:['melusine', 'margot', 'iris', 'farinel']},
    /* Mélusine : son rose, c'est le lavoir (ses tissus de Fortuné), pas la rivière */
    {sources:[['barde:melusine:2:verite', 'barde:fortune:0:verite', 'barde:oreille:atelier'], 'alchimiste:analyse:eau_lavoir'], qui:['melusine']},
    /* Margot : le tonneau tombé n'a pas rougi l'eau */
    {sources:[['barde:margot:0:verite', 'barde:oreille:taverne']], qui:['margot']},
    /* OÙ */
    {sources:['barde:melusine:1', ['pisteur:chene:ouvriers', 'pisteur:chene:pot']], ou:['chene']},
    {sources:['alchimiste:analyse:eau_lavoir', 'alchimiste:analyse:eau_riviere'], ou:['lavoir']},
    {sources:['alchimiste:analyse:eau_riviere'], ou:['pont']},
    {sources:['pisteur:clairiere:champ'], ou:['clairiere']},
    {sources:['pisteur:moulin:alambics', 'alchimiste:analyse:colorant'], ou:['lavoir', 'chene', 'pont', 'clairiere']},
    /* POURQUOI */
    {sources:['barde:margot:1'], pourquoi:['farce']},
    {sources:[['pisteur:moulin:alambics', 'barde:iris:1'], 'alchimiste:analyse:eau_riviere'], pourquoi:['teindre']},
    {sources:['barde:bastien:1:verite'], pourquoi:['joli', 'teindre', 'farce']},
    /* le filet : même sans aveu, la pièce toute neuve d'un charretier sans le sou dit qu'on l'a payé */
    {sources:[['barde:gaspard:1', 'barde:oreille:boulangerie', 'barde:margot:3'], 'pisteur:moulin:piece'], pourquoi:['joli', 'farce']}
  ]
};
})();
