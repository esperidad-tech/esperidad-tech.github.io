
/* ============ Les données de l'analyse : une fiche de données, la même table servira pour tout ============ */
var ROUGE = '#b3262f', ECRU = '#e8dfca';
/* Les deux tiroirs de la paillasse et leurs trois casiers */
var TIROIRS = {g:['fils','poils','plumes'], d:['petales','feuilles','grains']};
var CASIERS = {fils:'Fils', poils:'Poils', plumes:'Plumes', petales:'Pétales', feuilles:'Feuilles', grains:'Grains'};
var ECH = {
  fils:{
    tricot:{nom:'laine tricotée', p:{base:ECRU, plies:2, twist:16, thick:13, fuzz:.75, sheen:.08, crimp:4.5}},
    filee:{nom:'laine filée', p:{base:ECRU, plies:2, twist:16, thick:13, fuzz:.75, sheen:.08, crimp:0}},
    feutree:{nom:'laine feutrée', p:{base:'#cfc8bb', plies:2, twist:16, thick:15, fuzz:1.6, sheen:0, crimp:2, twistAlpha:.1}},
    cardee:{nom:'laine cardée', p:{base:ECRU, single:true, thick:21, fuzz:2, sheen:0, crimp:1.5}},
    mohair:{nom:'mohair', p:{base:'#efe6d6', plies:2, twist:20, thick:10, fuzz:2.3, sheen:.25, crimp:0, poil:2.2}},
    coton:{nom:'coton', p:{base:'#f6f4ee', plies:2, twist:9, thick:10, fuzz:.12, sheen:.12, crimp:0}},
    lin:{nom:'lin', p:{base:'#d6c9a8', plies:2, twist:20, thick:9, fuzz:.25, sheen:.15, crimp:0}},
    chanvre:{nom:'chanvre', p:{base:'#a89468', plies:2, twist:26, thick:14, fuzz:.7, sheen:0, crimp:0, poil:.7}},
    jute:{nom:'jute', p:{base:'#8a6a3c', plies:3, twist:24, thick:16, fuzz:1, sheen:0, crimp:0}},
    soie:{nom:'soie', p:{base:'#fbf7f3', plies:2, twist:22, thick:7, fuzz:0, sheen:1, crimp:0, twistAlpha:.25}},
    broder:{nom:'fil à broder', p:{base:'#f4f1ea', strands:6, thick:12, fuzz:0, sheen:.7, crimp:0}},
    dore:{nom:'fil doré', p:{base:'#e0b040', plies:2, twist:10, thick:8, fuzz:0, sheen:1, crimp:0}},
    crin:{nom:'crin de cheval', p:{base:'#2f2621', single:true, thick:6, fuzz:0, sheen:.85, crimp:0}},
    cheveu:{nom:'cheveu', p:{base:'#6b4a2a', single:true, thick:3, fuzz:0, sheen:.5, crimp:1.2}},
    ficelle:{nom:'ficelle', p:{base:'#b99a68', plies:3, twist:30, thick:17, fuzz:.45, sheen:0, crimp:0}},
    corde:{nom:'corde', p:{base:'#c9b48a', plies:3, twist:46, thick:27, fuzz:.2, sheen:0, crimp:0}},
    raphia:{nom:'raphia', p:{base:'#d9c58a', strands:3, thick:19, fuzz:.15, sheen:.05, crimp:0}},
    araignee:{nom:'fil d\'araignée', p:{base:'#f4f6fa', single:true, thick:1.6, fuzz:0, sheen:.4, crimp:0, perles:true}}
  },
  poils:{
    chien:{nom:'chien noir et blanc', n:9, col:'#1a1a1e', bout:'#f2f2f2', amp:3, f:.05, l:1, lw:2.2},
    chatroux:{nom:'chat roux', n:12, col:'#d9873c', amp:5, f:.09, l:.8, lw:1.4},
    chatgris:{nom:'chat gris', n:12, col:'#8a8a94', amp:4, f:.09, l:.75, lw:1.3},
    mouton:{nom:'mouton', n:9, col:'#f2efe6', amp:6, f:.32, l:.9, lw:2.4},
    cheval:{nom:'cheval', n:6, col:'#2a1f1a', amp:1.5, f:.02, l:1.1, lw:3.4, reflet:true},
    chevre:{nom:'chèvre', n:8, col:'#e6e0d0', amp:2, f:.03, l:1.15, lw:1.8},
    lapin:{nom:'lapin', n:18, col:'#c9b8a0', amp:2, f:.12, l:.48, lw:1},
    renard:{nom:'renard', n:11, col:'#c8551e', bout:'#f6efe0', amp:3, f:.06, l:.85, lw:1.6},
    sanglier:{nom:'sanglier', n:6, col:'#3a2c22', bout:'#b89a6a', amp:1, f:.02, l:.9, lw:4.2},
    ane:{nom:'âne', n:8, col:'#8c8378', amp:2.5, f:.05, l:.9, lw:2.6},
    blaireau:{nom:'blaireau', n:8, col:'#f0ece0', bandes:['#f0ece0','#2a2622','#f0ece0'], amp:1.5, f:.03, l:1, lw:2.4},
    souris:{nom:'souris', n:20, col:'#9a8f86', amp:1.5, f:.14, l:.33, lw:.9},
    vache:{nom:'vache', n:10, col:'#6a3f22', amp:2, f:.06, l:.6, lw:2},
    loup:{nom:'loup', n:10, col:'#77736c', bout:'#2a2622', amp:3, f:.05, l:.95, lw:1.8}
  },
  plumes:{
    corbeau:{nom:'corbeau', col:'#1b1d2b', lustre:'#4a6aa8', larg:.86},
    oie:{nom:'oie', col:'#f3f1ea', tige:'#bdb6a6', larg:1.2, L:1.06},
    poule:{nom:'poule rousse', col:'#b5652e', tache:'#e0a060'},
    pie:{nom:'pie', col:'#16161c', bout:'#f4f4f4', tb:.72},
    canard:{nom:'canard', col:'#6a747a', miroir:'#2a5ad0'},
    hibou:{nom:'hibou', col:'#a8793c', barres:'#4a3018', nb:6, doux:true},
    pigeon:{nom:'pigeon', col:'#8a93a6', bout:'#3a3f4c', tb:.8},
    geai:{nom:'geai', col:'#2a8fd8', barres:'#101828', nb:11, L:.8},
    faisan:{nom:'faisan', col:'#b8742c', barres:'#2a1a10', nb:8, L:1.08, larg:.7},
    moineau:{nom:'moineau', col:'#8a6a48', coeur:'#4a3420', L:.7},
    mesange:{nom:'mésange', col:'#4a7ac0', bout:'#e8e8f0', tb:.84, L:.72},
    paon:{nom:'paon', col:'#1c6a4a', oeil:true, larg:1.25},
    coq:{nom:'coq', col:'#1a3a2a', lustre:'#2aa06a', larg:.8, L:1.05},
    cygne:{nom:'cygne', col:'#ffffff', tige:'#d8d2c4', larg:1.2, doux:true}
  },
  petales:{
    coquelicot:{nom:'coquelicot', f:'rond', c:['#e8202a','#b0101a'], tache:'#1a1010'},
    rose:{nom:'rose', f:'rond', c:['#f4a6c0','#d9748f']},
    pivoine:{nom:'pivoine', f:'rond', c:['#d8457a','#a02858'], plis:true},
    paquerette:{nom:'pâquerette', f:'long', c:['#ffffff','#e6dccc'], L:52, W:10, bout:'rgba(240,120,150,.5)'},
    tournesol:{nom:'tournesol', f:'long', c:['#f2b81e','#d98a10'], L:50, W:15, pointe:true},
    pissenlit:{nom:'pissenlit', f:'long', c:['#f6d020','#e0a800'], L:50, W:5.5, dents:true},
    boutondor:{nom:'bouton-d\'or', f:'rond', c:['#f8d81c','#e0b000'], g:.72, brille:true},
    bleuet:{nom:'bleuet', f:'frange', c:['#3a6ad8','#2848a8']},
    violette:{nom:'violette', f:'coeur', c:['#6a3ab8','#4a2488'], base:'#f0e6ff'},
    myosotis:{nom:'myosotis', f:'rond', c:['#7ab0f0','#5a8ad8'], g:.6, base:'#f8e060'},
    lavande:{nom:'lavande', f:'epi'},
    souci:{nom:'souci', f:'long', c:['#f08a1e','#d8640e'], L:48, W:12},
    iris:{nom:'iris', f:'coeur', c:['#5a4ac0','#3a2e90'], base:'#f8d040', g:1.1},
    mauve:{nom:'mauve', f:'coeur', c:['#d890d8','#b060b0'], rayures:true}
  },
  feuilles:{
    chene:{nom:'chêne', f:'profil', c:'#5e8a3a', w:.2, lobes:4.5, la:.38},
    hetre:{nom:'hêtre', f:'profil', c:'#8ab04a', w:.3, ex:.75, ner:9},
    bouleau:{nom:'bouleau', f:'profil', c:'#a8b83a', w:.36, tri:.3, dents:26, da:.02, tige:true},
    tilleul:{nom:'tilleul', f:'profil', c:'#6aa84a', w:.43, coeur:true, dents:34, da:.012, tige:true},
    chataignier:{nom:'châtaignier', f:'profil', c:'#4f8a34', w:.17, ex:.7, dents:14, da:.035, ner:14},
    saule:{nom:'saule', f:'profil', c:'#8fb07a', w:.1, ex:.8},
    houx:{nom:'houx', f:'profil', c:'#2f6a3a', w:.19, ex:.6, epines:6, brille:true},
    ortie:{nom:'ortie', f:'profil', c:'#4a8a3a', w:.25, tri:.25, dents:20, da:.03, poilue:true},
    erable:{nom:'érable', f:'palme', c:'#c8642a'},
    lierre:{nom:'lierre', f:'lierre', c:'#2f5a34'},
    frene:{nom:'frêne', f:'compose', c:'#6fa04a'},
    trefle:{nom:'trèfle', f:'trefle', c:'#4fa04a'},
    sapin:{nom:'sapin', f:'aiguilles', c:'#2a5a3a'},
    fougere:{nom:'fougère', f:'fronde', c:'#4a8a4a'}
  },
  grains:{
    suie:{nom:'suie'}, charbon:{nom:'charbon de bois'}, poudre:{nom:'poudre noire'}, poivre:{nom:'poivre moulu'}, pavot:{nom:'graines de pavot'}, limaille:{nom:'limaille de fer'},
    ardoise:{nom:'ardoise'}, terre:{nom:'terre de jardin'}, argile:{nom:'argile'}, sciure:{nom:'sciure de bois'}, rouille:{nom:'rouille'}, cannelle:{nom:'cannelle'},
    tuile:{nom:'tuile'}, brique:{nom:'brique'}, sable:{nom:'sable'}, sel:{nom:'sel'}, cendre:{nom:'cendre'}, farine:{nom:'farine'},
    or:{nom:'feuille d\'or'}, laiton:{nom:'laiton'}, mica:{nom:'mica'}, verre:{nom:'verre pilé'}, vertdegris:{nom:'vert-de-gris'}, soufre:{nom:'soufre'},
    /* ce qui s'accroche et ce qui voyage : une graine à crochets, et trois pollens (chaque plante a le sien, avec sa forme à elle) */
    bardane:{nom:'graine de bardane'}, pollenlav:{nom:'pollen de lavande'}, pollenpin:{nom:'pollen de pin'}, pollenpis:{nom:'pollen de pissenlit'}
  }
};
/* Ce qu'il y a dans chaque casier : l'enquête 1, puis « plus difficile » (encore plus d'échantillons) */
var LISTES = {
  facile:{
    fils:['tricot','filee','feutree','mohair','coton','lin','chanvre','soie','broder','crin','ficelle','corde','raphia','araignee'],
    poils:['chien','chatroux','chatgris','mouton','cheval','chevre','lapin','renard','sanglier','ane','blaireau','souris'],
    plumes:['corbeau','oie','poule','pie','canard','hibou','pigeon','geai','faisan','moineau','mesange','paon'],
    petales:['coquelicot','rose','pivoine','paquerette','tournesol','pissenlit','boutondor','bleuet','violette','myosotis','lavande','souci'],
    feuilles:['chene','hetre','bouleau','tilleul','chataignier','saule','houx','erable','lierre','frene','trefle','sapin'],
    grains:['suie','charbon','poudre','poivre','pavot','terre','argile','sciure','rouille','tuile','brique','sable','cendre','farine','or','laiton','mica','vertdegris','soufre','bardane','pollenlav','pollenpin','pollenpis']
  },
  difficile:{
    fils:['tricot','filee','feutree','cardee','mohair','coton','lin','chanvre','jute','soie','broder','dore','crin','cheveu','ficelle','corde','raphia','araignee'],
    poils:['chien','chatroux','chatgris','mouton','cheval','chevre','lapin','renard','sanglier','ane','blaireau','souris','vache','loup'],
    plumes:['corbeau','oie','poule','pie','canard','hibou','pigeon','geai','faisan','moineau','mesange','paon','coq','cygne'],
    petales:['coquelicot','rose','pivoine','paquerette','tournesol','pissenlit','boutondor','bleuet','violette','myosotis','lavande','souci','iris','mauve'],
    feuilles:['chene','hetre','bouleau','tilleul','chataignier','saule','houx','ortie','erable','lierre','frene','trefle','sapin','fougere'],
    grains:['suie','charbon','poudre','poivre','pavot','limaille','ardoise','terre','argile','sciure','rouille','cannelle','tuile','brique','sable','sel','cendre','farine','or','laiton','mica','verre','vertdegris','soufre','bardane','pollenlav','pollenpin','pollenpis']
  }
};
/* ===== L'enquête 3 : les écritures du Livre d'or de la fête (Bible §13.14 ; E3-actions-des-roles.md §2) =====
   Douze habitants y ont écrit un mot. La lettre d'Odette a trois signes : des « M » pointus (M), des « t » barrés d'une vague (t),
   un petit rond sur les « i » (i). Mélusine seule a les trois ; Victor, Fortuné, Iris et Margot en ont un ou deux. Les autres se
   reconnaissent de loin (de très grosses lettres, des pâtés d'encre, tout en capitales, des pattes de mouche…).
   Ce casier n'est dans aucun tiroir : c'est le Livre d'or, posé sur la paillasse, qui l'ouvre (60-loupe.js : ouvrirLivreDor).
   l : les lignes ; taille, penche (0 : toute droite), gras ; deco : une petite fleur, de la farine, des pâtés d'encre. */
TIROIRS.livre = ['ecritures'];
CASIERS.ecritures = 'Le Livre d\'or';
/* (13 novembre) les douze écritures et la lettre : une seule source, src/ecritures-donnees.js (le Grand Livre du Sage montre le même
   Livre d'or). DEUX écritures ont les trois signes de la lettre : Mélusine et Margot (ECRITURES.bons). */
ECH.ecritures = ECRITURES.ech;
/* la lettre d'Odette, telle qu'on la voit sous la loupe : quelques mots, et les trois signes de celle qui l'a écrite */
var ECR_LETTRE = ECRITURES.lettre;
LISTES.facile.ecritures = LISTES.difficile.ecritures = ECRITURES.ordre;
function contenuCasier(k){ return LISTES[S.niveau][k]; }
/* ============ Les dossiers : ce que l'Alchimiste a reçu ============
   Un dossier = un échantillon posé sur le carré de cuir (on ne sait pas ce que c'est : c'est la loupe qui le dit), et tout ce qu'on en tire :
   ce que la pince prélève au microscope (dans les coupelles), le liquide que l'eau chaude fait sortir. Le dossier est bouclé quand tout
   ce qui est « requis » est reconnu : c'est là que le jeu note l'analyse (et que le code s'écrit sur l'ardoise, s'il y en a un).
   « savoir » : une phrase vraie, dite une fois la chose reconnue (jamais avant : elle ne doit pas souffler la réponse).
   La fiche ci-dessous est celle de l'enquête 1. */
var OBJETS = {
  /* les « poils » de la fenêtre de la mairie (l'identifiant du jeu reste « fil » : son code est gelé). Le Pisteur a trouvé « des poils » :
     c'est la loupe qui montre un fil rouge tricoté, à chercher dans le casier des fils, pas dans celui des poils. */
  fil:{tiroir:'fils', bon:'tricot', scene:'fibres', requis:['fil', 'noir'], bete:'acarien', savoir:'Tricotée : le fil fait des boucles, comme dans un pull.'},
  noir:{de:'fil', nom:'les grains noirs', tiroir:'grains', bon:'suie', coul:'#17110f', voisins:['charbon','poudre','poivre','pavot'], savoir:'La suie : la poussière noire que le feu laisse dans les cheminées.'},
  brun:{de:'fil', nom:'le grain brun', tiroir:'grains', bon:'terre', coul:'#7a5230', voisins:['argile','rouille','sciure','cannelle']},
  orange:{de:'fil', nom:'l\'éclat orange', tiroir:'grains', bon:'tuile', coul:'#d9772f', voisins:['brique','argile','rouille'], savoir:'Une tuile, c\'est de l\'argile cuite : elle boit l\'eau.'},
  or:{de:'fil', nom:'la paillette dorée', tiroir:'grains', bon:'or', coul:'#f2c040', voisins:['laiton','mica','sable'], savoir:'De l\'or battu en feuille, plus fine qu\'un cheveu.'},
  rouge:{de:'fil', nom:'l\'eau rougie', liquide:true, cibles:['garance', 'oignon'], savoir:'Chaque teinture a ses bandes à elle, comme une signature.'},
  /* la touffe de poils du buisson */
  poils:{tiroir:'poils', bon:'chien', scene:'poils', requis:['poils', 'feuil'], bete:'puce', savoir:'Des poils longs contre la pluie, des poils courts pour avoir chaud.'},
  feuil:{de:'poils', nom:'le bout de feuille', tiroir:'feuilles', bon:'chene', coul:'#5e8a3a', fragment:true, savoir:'Des bords en vagues : c\'est la feuille du chêne.'},
  bardane:{de:'poils', nom:'la boule piquante', tiroir:'grains', bon:'bardane', coul:'#8a6a3c', savoir:'Ses petits crochets s\'accrochent aux poils : ils ont donné l\'idée du scratch !'},
  /* la grande plume noire */
  plume:{tiroir:'plumes', bon:'oie', scene:'plume', requis:['plume', 'pollen'], bete:'acarien', savoir:'Une plume d\'oie… teinte en noir ! Autrefois, on écrivait avec.'},
  pollen:{de:'plume', nom:'le grain jaune', tiroir:'grains', bon:'pollenlav', coul:'#e8c84a', savoir:'Chaque fleur a son pollen, avec sa forme à elle.'},
  encre:{de:'plume', nom:'l\'eau noircie', liquide:true, coul:'#3b3340', cibles:['mure', 'noix'], savoir:'Un noir cache souvent plusieurs couleurs.'},

  /* ===== L'enquête 2 (Romain, 11 novembre) : des flacons posés sur le cuir (forme:'flacon', liquide), une poudre, deux pièces ===== */
  /* l'eau de la rivière : le coquelicot (bandes), des bouts de pétales (loupe), de la farine (l'iode la fait virer au bleu-noir),
     des paillettes de cuivre (la flamme devient verte : en plus, une note) ; une puce d'eau pour le plaisir */
  eau_riviere:{forme:'flacon', liquide:true, cibles:['coquelicot'], scene:'goutte', bete:'daphnie', mite0:{x:600, y:560}, requis:['eau_riviere', 'petale_r', 'farine_r'],
    savoir:'Le rouge du coquelicot change de couleur avec le vinaigre et le bicarbonate, comme le jus de chou rouge : c\'est un indicateur.'},
  petale_r:{de:'eau_riviere', nom:'le bout de pétale', tiroir:'petales', bon:'coquelicot', coul:'#e8202a', fragment:true, savoir:'Le coquelicot est un pavot sauvage : ses pétales sont rouges, avec une tache noire tout en bas.'},
  farine_r:{de:'eau_riviere', nom:'les grains blancs', tiroir:'grains', bon:'farine', coul:'#f4efe2', savoir:'La farine, c\'est du blé moulu. Elle est pleine d\'amidon.'},
  cuivre_r:{de:'eau_riviere', nom:'la paillette verte', tiroir:'grains', bon:'vertdegris', coul:'#3aa88a', savoir:'Le vert-de-gris, c\'est la rouille du cuivre : il pousse sur les vieilles marmites et les vieux toits.'},
  /* l'eau du lavoir (Romain, 8 h 58 : « rien qu'avec les analyses, il faut montrer toute la petite enquête ») : de la cendre (la lessive
     des lavandières), des fibres de coton (un tissu acheté : le coton vient de loin), le bois de Brésil (une teinture de marchand, pas chère,
     qui part au lavage), et des poils d'âne (les tissus ont voyagé à dos d'âne : celui de Fortuné, jamais nommé) */
  eau_lavoir:{forme:'flacon', liquide:true, cibles:['bresil'], scene:'goutte', requis:['eau_lavoir', 'fibre_l', 'cendre_l'],
    savoir:'Le bois de Brésil teint vite et pas cher… mais sa couleur s\'en va au lavage.'},
  fibre_l:{de:'eau_lavoir', nom:'les petits fils blancs', tiroir:'fils', bon:'coton', coul:'#f6f4ee', savoir:'Le coton ne pousse pas chez nous : il vient de pays chauds, très loin. Ce tissu a été acheté, pas tissé ici.'},
  cendre_l:{de:'eau_lavoir', nom:'la poussière grise', tiroir:'grains', bon:'cendre', coul:'#b8b4b0', savoir:'Autrefois, on lavait le linge avec de la cendre de bois : c\'était la lessive !'},
  poils_l:{de:'eau_lavoir', nom:'le poil gris', tiroir:'poils', bon:'ane', coul:'#8c8378', savoir:'Un poil d\'âne : épais et raide. Ces tissus ont voyagé à dos d\'âne…'},
  /* le reste de colorant de l'alambic : les mêmes bandes que la rivière, et des bouts de pétales */
  colorant:{forme:'flacon', liquide:true, cibles:['coquelicot'], coul:'#9a1020', scene:'goutte', requis:['colorant', 'petale_c'],
    savoir:'Deux bandelettes qui ont les mêmes bandes : c\'est le même colorant.'},
  petale_c:{de:'colorant', nom:'le bout de pétale', tiroir:'petales', bon:'coquelicot', coul:'#e8202a', fragment:true, savoir:'Le coquelicot est un pavot sauvage : ses pétales sont rouges, avec une tache noire tout en bas.'},
  /* la poudre du pot noir (Romain, 8 h 58 : « tu complexifies, tu donnes des trucs réels ») : de la poudre noire (loupe), du soufre
     (la flamme bleue qui pique le nez), du charbon de bois (on voit encore les trous du bois), un brin de laine noire feutrée (comme une cape) ;
     l'eau chaude en fait sortir un rouge (bandes : coquelicot). Jamais de recette ni de quantités. */
  poudre:{forme:'tas', couls:['#1b1b1f', '#3a3d42', '#c8202a', '#e8c830', '#3a3d42'], tiroir:'grains', bon:'poudre', scene:'poudre', requis:['poudre', 'rouge_p', 'soufre_p'],
    savoir:'La poudre noire, c\'est elle qui fait partir les feux d\'artifice.'},
  rouge_p:{de:'poudre', nom:'l\'eau rougie', liquide:true, cibles:['coquelicot'], savoir:'Le même rouge que la rivière : quelqu\'un a mêlé ce colorant à la poudre.'},
  /* (Romain, 13 novembre : « un message sur le soufre, que c'est avec ça qu'on fait les allumettes ») */
  soufre_p:{de:'poudre', nom:'les grains jaunes', tiroir:'grains', bon:'soufre', coul:'#e8c830', savoir:'Le soufre est jaune ; il brûle avec une petite flamme bleue. Il y en a dans le bout des allumettes : c\'est lui qui les aide à s\'enflammer !'},
  charbon_p:{de:'poudre', nom:'le morceau noir', tiroir:'grains', bon:'charbon', coul:'#1b1b1f', savoir:'Le charbon de bois, c\'est du bois cuit sans air : on y voit encore les petits trous du bois.'},
  laine_p:{de:'poudre', nom:'le brin noir', tiroir:'fils', bon:'feutree', coul:'#1c1a22', noir:true, savoir:'De la laine feutrée, épaisse et serrée : on en fait les manteaux… et les capes.'},
  /* les deux pièces d'or : de l'or (loupe), la même fêlure au microscope ; de la farine sur celle de la boulangerie,
     une tache de colorant sur celle du moulin (l'eau chaude la fait fondre : bandes, coquelicot) */
  piece_pain:{forme:'piece', tiroir:'grains', bon:'or', scene:'piece', voirMicro:true, requis:['piece_pain', 'farine_p'],
    savoir:'L\'or ne rouille jamais : une pièce d\'or reste brillante pendant des siècles.'},
  farine_p:{de:'piece_pain', nom:'la poussière blanche', tiroir:'grains', bon:'farine', coul:'#f4efe2', savoir:'La farine, c\'est du blé moulu. Elle est pleine d\'amidon.'},
  piece_moulin:{forme:'piece', tiroir:'grains', bon:'or', scene:'piece', voirMicro:true, requis:['piece_moulin', 'rouge_m'],
    savoir:'L\'or ne rouille jamais : une pièce d\'or reste brillante pendant des siècles.'},
  rouge_m:{de:'piece_moulin', nom:'l\'eau rougie', liquide:true, cibles:['coquelicot'], savoir:'Le même rouge que la rivière !'},

  /* ===== L'enquête 3 : la lettre d'Odette, une feuille de papier (forme:'papier') =====
     à la loupe, son écriture, à comparer aux douze du Livre d'or (il faut le code « Les écritures du village » du Sage : CFG.livredor) ;
     au microscope, des grains de pollen de lavande (une fausse piste : tout le village en a) ; l'eau chaude fait couler un peu
     d'encre : au test des couleurs, de l'encre de noix de galle, celle des colporteurs (elle ne se sépare pas) */
  /* bons (13 novembre) : plusieurs bonnes réponses — n'importe laquelle des deux écritures qui ressemblent ; le labo annonce les deux */
  lettre:{forme:'papier', tiroir:'ecritures', bon:'melusine', bons:ECRITURES.bons, scene:'papier', requis:['lettre', 'pollen_l', 'encre_l'],
    savoir:'Chacun forme ses lettres à sa façon : une écriture se reconnaît comme un visage.'},
  pollen_l:{de:'lettre', nom:'le grain jaune', tiroir:'grains', bon:'pollenlav', coul:'#e8c84a', savoir:'Du pollen de lavande, comme dans les sachets d\'Iris… Mais tout le village en a !'},
  encre_l:{de:'lettre', nom:'l\'eau noircie', liquide:true, coul:'#2a2a32', cibles:['galle'], savoir:'L\'encre de noix de galle ne se sépare pas en couleurs. On la fait avec de petites boules qui poussent sur les chênes.'}
};
/* Ce que l'Alchimiste a reçu, dans l'ordre d'arrivée : chacun à sa place numérotée sur le carré de cuir (quatre places) */
var CUIRS = ['fil', 'poils', 'plume'];
function surCuir(t){ return !!t && CUIRS.indexOf(t) >= 0; }
function rangCuir(t){ return Math.max(0, CUIRS.indexOf(t)); }
function dossierDe(t){ return surCuir(t) ? t : ((OBJETS[t] || {}).de || null); }
function nomObjet(t){ return surCuir(t) ? 'l\'échantillon n° ' + (rangCuir(t) + 1) : OBJETS[t].nom; }
/* Le liquide d'un dossier : le dossier lui-même quand c'est un flacon posé sur le cuir (l'eau de la rivière, enquête 2),
   sinon ce que l'eau chaude a fait sortir de l'échantillon */
function liqDe(d){ if(OBJETS[d] && OBJETS[d].liquide && !OBJETS[d].de) return d; for(var k in OBJETS) if(OBJETS[k].de === d && OBJETS[k].liquide) return k; return null; }
/* Le code qui s'écrit sur l'ardoise quand un dossier est bouclé (le jeu envoie les vrais ; ici, un exemple) */
var CODES = {fil:{pour:'pour le Barde', formes:['🍄','🎩','🔑']}};
/* Dans le jeu, pendant le tutoriel : les échantillons dont ce n'est pas encore le tour (ils attendent sur le cuir : « Plus tard ! ») */
var ATTENTE = {};
/* Les cinq bocaux, posés sur la petite étagère de la paillasse */
var BOCAUX = [
  {k:'eau', x:440, nom:['Eau'], liq:'#a9dcff', a:.55},
  {k:'chaude', x:520, nom:['Eau','chaude'], liq:'#a9dcff', a:.55, vapeur:true},
  {k:'iode', x:600, nom:['Iode'], liq:'#9a4f12', a:.9},
  {k:'vinaigre', x:680, nom:['Vinaigre'], liq:'#efe1a0', a:.8},
  {k:'bicar', x:760, nom:['Bicar-','bonate'], poudre:true}
];
BOCAUX.forEach(function(b){ b.y = YBOC; });
var TACHE = {eau:'rgba(140,200,255,.55)', chaude:'rgba(140,200,255,.55)', iode:'rgba(205,115,30,.65)', vinaigre:'rgba(240,225,150,.6)', bicar:'rgba(255,255,255,.8)'};
var RIEN = {t:'Rien à signaler.'};
function rea(o){ var r = {eau:RIEN, chaude:RIEN, iode:RIEN, vinaigre:RIEN, bicar:RIEN, flamme:RIEN}; for(var k in o) r[k] = o[k]; return r; }
/* De vraies réactions : « Rien à signaler » quand il ne se passe rien */
var REA = {
  fil:rea({chaude:{t:'L\'eau chaude le fait déteindre : de l\'eau rougie !', cree:'rouge'}, flamme:{t:'Ça se recroqueville et ça sent le cheveu brûlé.'}}),
  noir:rea({eau:{t:'Les grains flottent : ils n\'aiment pas l\'eau.'}, chaude:{t:'Les grains flottent : ils n\'aiment pas l\'eau.'},
    iode:{t:'L\'orange de l\'iode pâlit autour des grains : ils l\'avalent !', fx:'pali'}, flamme:{t:'Les grains rougeoient tout doucement, sans flamme et sans crépiter.', braise:true}}),
  brun:rea({eau:{t:'Ça fait de la boue.'}, chaude:{t:'Ça fait de la boue.'}, vinaigre:{t:'De toutes petites bulles : il y a du calcaire là-dedans.', fx:'bulles'}}),
  orange:rea({eau:{t:'La goutte disparaît : il boit l\'eau, comme un pot de fleurs.'}, chaude:{t:'La goutte disparaît : il boit l\'eau.'}}),
  or:rea({}),
  rouge:rea({eau:{t:'Elle devient plus pâle.'}, vinaigre:{t:'Le rouge vire à l\'orangé.', fx:'vire', c:'#e08a50'}, bicar:{t:'Le rouge vire au violet.', fx:'vire', c:'#8a4f9e'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau rouge.'}}),
  poils:rea({eau:{t:'L\'eau glisse sur les poils.'}, chaude:{t:'L\'eau glisse sur les poils.'}, flamme:{t:'Ils grésillent et sentent le cheveu brûlé.'}}),
  feuil:rea({flamme:{t:'Il noircit, se tord et fume.'}}),
  bardane:rea({flamme:{t:'Elle brûle d\'un coup, comme de la paille.'}}),
  plume:rea({eau:{t:'L\'eau roule dessus en perles.'}, chaude:{t:'L\'eau chaude fait déteindre la plume : de l\'eau noircie !', cree:'encre', fx:'delave'}, flamme:{t:'Elle se recroqueville et sent le cheveu brûlé.'}}),
  pollen:rea({eau:{t:'Le grain flotte.'}, chaude:{t:'Le grain flotte.'}, flamme:{t:'Pfuit ! Il brûle en un éclair.'}}),
  /* (le jus de mûre change de couleur comme un vrai indicateur : rouge dans l'acide, bleu-vert avec le bicarbonate) */
  encre:rea({eau:{t:'Elle devient plus pâle.'}, vinaigre:{t:'Le noir vire au rouge sombre.', fx:'vire', c:'#7a2a3a'}, bicar:{t:'Le noir vire au bleu-vert.', fx:'vire', c:'#2a5a5c'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau sombre.'}}),
  /* l'enquête 2 : de vraies réactions (le rouge du coquelicot et celui du bois de Brésil changent de couleur avec l'acide et la base ;
     l'iode devient bleu-noir avec l'amidon ; le cuivre colore la flamme en vert ; l'or ne craint ni l'acide ni le feu) */
  eau_riviere:rea({eau:{t:'Elle devient plus pâle.'}, vinaigre:{t:'Le rouge devient encore plus vif.', fx:'vire', c:'#ff2a3a'}, bicar:{t:'Le rouge vire au bleu-violet !', fx:'vire', c:'#6a3aa8'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau rouge.'}}),
  petale_r:rea({eau:{t:'Le bout de pétale flotte.'}, flamme:{t:'Il noircit et se ratatine.'}}),
  farine_r:rea({eau:{t:'Les grains se mouillent et collent : on dirait de la pâte.'}, chaude:{t:'Ça épaissit, comme une sauce.'}, iode:{t:'L\'iode devient bleu-noir sur les grains ! Il y a de l\'amidon.', fx:'vire', c:'#1e2050'}, flamme:{t:'Ça grille et ça sent le pain brûlé.'}}),
  cuivre_r:rea({vinaigre:{t:'Le vinaigre devient tout bleu-vert.', fx:'vire', c:'#3aa88a'}, flamme:{t:'La flamme devient toute verte ! C\'est la couleur du cuivre.', verte:true, trouve:'cuivre_r'}}),
  eau_lavoir:rea({eau:{t:'Elle devient plus pâle.'}, vinaigre:{t:'Le rose vire à l\'orangé.', fx:'vire', c:'#f08a4a'}, bicar:{t:'Le rose vire au violet !', fx:'vire', c:'#8a3a8a'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau rose.'}}),
  fibre_l:rea({eau:{t:'Les fils boivent l\'eau.'}, flamme:{t:'Ils brûlent vite, comme du papier, et sentent le papier brûlé : c\'est une plante, pas un poil de bête.'}}),
  cendre_l:rea({eau:{t:'L\'eau devient un peu glissante, comme du savon.'}, vinaigre:{t:'De toutes petites bulles !', fx:'bulles'}, flamme:{t:'Rien : la cendre a déjà brûlé.'}}),
  poils_l:rea({eau:{t:'L\'eau glisse sur le poil.'}, flamme:{t:'Il grésille et sent le cheveu brûlé : c\'est un poil de bête.'}}),
  soufre_p:rea({eau:{t:'Les grains jaunes flottent : ils n\'aiment pas l\'eau.'}, flamme:{t:'Une toute petite flamme bleue ! Et ça pique le nez, comme une allumette qu\'on craque.', bleue:true}}),
  charbon_p:rea({eau:{t:'Le morceau flotte : il est plein de petits trous remplis d\'air.'}, iode:{t:'L\'orange de l\'iode pâlit : le charbon l\'avale !', fx:'pali'}, flamme:{t:'Il rougeoie tout doucement, sans flamme.', braise:true}}),
  laine_p:rea({eau:{t:'L\'eau glisse sur le brin.'}, flamme:{t:'Il se recroqueville et sent le cheveu brûlé : c\'est de la laine.'}}),
  colorant:rea({eau:{t:'Il devient plus pâle : il était très concentré.'}, vinaigre:{t:'Le rouge devient encore plus vif.', fx:'vire', c:'#ff2a3a'}, bicar:{t:'Le rouge vire au bleu-violet, comme l\'eau de la rivière !', fx:'vire', c:'#6a3aa8'}, flamme:{t:'L\'eau s\'évapore et laisse une croûte rouge.'}}),
  petale_c:rea({eau:{t:'Le bout de pétale flotte.'}, flamme:{t:'Il noircit et se ratatine.'}}),
  poudre:rea({eau:{t:'La poudre flotte, et l\'eau rosit un peu autour.'}, chaude:{t:'L\'eau chaude devient toute rouge : un colorant était mêlé à la poudre !', cree:'rouge_p'}, flamme:{t:'Fffft ! Elle fuse d\'un coup, avec une grosse fumée rouge !', fumeeRouge:true}}),
  rouge_p:rea({eau:{t:'Elle devient plus pâle.'}, bicar:{t:'Le rouge vire au bleu-violet.', fx:'vire', c:'#6a3aa8'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau rouge.'}}),
  piece_pain:rea({eau:{t:'L\'eau ruisselle sur la pièce : rien ne change.'}, vinaigre:{t:'Rien ! Le vinaigre n\'attaque pas l\'or.'}, iode:{t:'Quelques points deviennent bleu-noir sur la pièce : il y a de l\'amidon collé dessus.'}, flamme:{t:'Elle chauffe, mais elle reste toute brillante : l\'or ne noircit pas au feu.'}}),
  farine_p:rea({eau:{t:'La poussière se mouille et colle : on dirait de la pâte.'}, iode:{t:'L\'iode devient bleu-noir ! Il y a de l\'amidon.', fx:'vire', c:'#1e2050'}, flamme:{t:'Ça grille et ça sent le pain brûlé.'}}),
  piece_moulin:rea({eau:{t:'L\'eau froide ne fait rien à la tache rouge.'}, chaude:{t:'La tache rouge fond dans l\'eau chaude : de l\'eau rougie !', cree:'rouge_m'}, vinaigre:{t:'Rien ! Le vinaigre n\'attaque pas l\'or.'}, flamme:{t:'Elle chauffe, mais elle reste toute brillante : l\'or ne noircit pas au feu.'}}),
  rouge_m:rea({eau:{t:'Elle devient plus pâle.'}, bicar:{t:'Le rouge vire au bleu-violet.', fx:'vire', c:'#6a3aa8'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau rouge.'}}),
  /* l'enquête 3 : la lettre (de vraies réactions : l'encre de noix de galle tient à l'eau froide, et pâlit avec un acide) */
  lettre:rea({eau:{t:'L\'eau froide ne fait rien à l\'encre : elle tient bon.'}, chaude:{t:'L\'eau chaude fait couler un peu d\'encre : de l\'eau noircie !', cree:'encre_l'},
    vinaigre:{t:'Là où tombe le vinaigre, l\'encre pâlit un peu.'}, flamme:{t:'Le coin du papier roussit… Stop ! C\'est une preuve.'}}),
  pollen_l:rea({eau:{t:'Le grain flotte.'}, chaude:{t:'Le grain flotte.'}, flamme:{t:'Pfuit ! Il brûle en un éclair.'}}),
  encre_l:rea({eau:{t:'Elle devient plus pâle.'}, vinaigre:{t:'Le noir pâlit : cette encre n\'aime pas l\'acide.', fx:'vire', c:'#8a8a94'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau noir.'}})
};
/* Le test des couleurs, comme dans un vrai labo : une goutte du liquide sur une bandelette de papier buvard, le pied dans un peu d'alcool.
   L'alcool monte dans le papier et emporte les couleurs, chacune à sa vitesse : la teinture se sépare en bandes.
   Chaque teinture a ses bandes à elle (y : la hauteur où la bande s'arrête, de 0 en bas à 1 en haut ; h : son épaisseur). */
var TEINTES = [
  {k:'garance', nom:'racine de garance', c:'#c8503c', b:[{c:'#f0c060', y:.90, h:.05, a:.6}, {c:'#e2553a', y:.70, h:.09}, {c:'#d43a6a', y:.42, h:.08}]},
  {k:'coquelicot', nom:'coquelicot', c:'#e8343c', b:[{c:'#e8343c', y:.56, h:.09}, {c:'#8a3a9a', y:.26, h:.07}]},
  {k:'betterave', nom:'betterave', c:'#9c2257', b:[{c:'#f0c838', y:.78, h:.06}, {c:'#b0206a', y:.50, h:.10}]},
  {k:'cochenille', nom:'cochenille', c:'#c9306a', b:[{c:'#c9306a', y:.33, h:.13}]},
  /* le bois de Brésil (enquête 2, l'eau du lavoir) : une vraie teinture rouge pas chère, qui part au lavage */
  {k:'bresil', nom:'bois de Brésil', c:'#c2305a', b:[{c:'#f0b040', y:.84, h:.05, a:.6}, {c:'#d8406a', y:.40, h:.10}]},
  {k:'mure', nom:'mûres', c:'#4a2a5c', b:[{c:'#7a3aa0', y:.62, h:.08}, {c:'#3a2a6a', y:.18, h:.09}]},
  {k:'oignon', nom:'pelure d\'oignon', c:'#d98a2c', b:[{c:'#e8b830', y:.80, h:.07}, {c:'#a8642a', y:.14, h:.07}]},
  {k:'safran', nom:'safran', c:'#e8b820', b:[{c:'#f0a820', y:.86, h:.11}]},
  {k:'noix', nom:'brou de noix', c:'#6a4a2c', b:[{c:'#c8a040', y:.66, h:.07}, {c:'#6a4a2c', y:.20, h:.11}]}
];
/* (enquête 3) l'encre de noix de galle : une seule bande noire, tout en bas — elle ne se sépare pas. Elle n'entre dans le carnet de
   teintures que quand la lettre d'Odette est sur le cuir (90-main.js) : rien ne change pour les analyses des enquêtes 1 et 2. */
var TEINTE_GALLE = {k:'galle', nom:'noix de galle', c:'#2a2a32', b:[{c:'#1c1c24', y:.1, h:.15}]};
function teinte(k){ return TEINTES.filter(function(t){ return t.k === k; })[0] || (k === 'galle' ? TEINTE_GALLE : null); }
/* Une teinture est souvent un mélange : la bandelette montre alors les bandes de tous ses ingrédients, et chaque bande doit trouver le sien.
   Les ingrédients du liquide du dossier en cours : */
function ciblesLiq(){ var l = liqDe(S.dc); return l ? OBJETS[l].cibles : []; }
/* Les bandes de la bandelette à analyser, du haut vers le bas, avec l'ingrédient qui les explique */
function bandesMelange(){ var l = []; ciblesLiq().forEach(function(k){ teinte(k).b.forEach(function(b){ l.push({k:k, y:b.y, h:b.h, c:b.c}); }); }); return l.sort(function(a, b){ return b.y - a.y; }); }
var TXT = {trop:'Trop petit : zoome !', pris:'Dans la coupelle !',
  betes:{acarien:'L\'acarien file se cacher !', puce:'Une puce ! Elle saute et se cache dans les poils.', daphnie:'Une puce d\'eau ! Elle file d\'un coup de rame.'}};
/* Ce que le microscope apprend, à chaque grossissement (dit une fois, quand on y arrive ; jamais le nom de la chose) */
var SAVOIR_MICRO = {
  fibres:{40:'Des écailles, comme les tuiles d\'un toit !'},
  poils:{40:'Au milieu de chaque poil, un petit canal.', 100:'Les écailles pointent toujours vers le bout du poil.'},
  plume:{40:'Chaque brin porte de plus petits brins encore.', 100:'De tout petits crochets : la plume se referme comme une fermeture éclair !'},
  /* l'enquête 2 */
  goutte:{40:'Dans une seule goutte, il y a plein de choses : des bouts de plantes, des grains…', 100:'Une goutte de rivière est pleine de toutes petites bêtes !'},
  poudre:{40:'Des grains noirs… et, mêlés à eux, des grains rouges.'},
  piece:{10:'Une couronne, et tout autour, une ronde de petites étoiles.', 40:'Sous la couronne, une toute petite fêlure en forme d\'éclair : le moule qui a frappé la pièce était fêlé.'},
  /* l'enquête 3 */
  papier:{40:'Le papier est fait de petits fils emmêlés : l\'encre s\'est glissée entre eux.'}
};

/* ============ État ============
   S.dc : le dossier en cours (le dernier échantillon du cuir qu'on a choisi) ; ses coupelles, sa bandelette, ses grains sont dans S.dos[S.dc]. */
var S;
var VIDE = {coupes:[], items:{10:[], 40:[], 100:[]}, mite:{x:0, y:0}, mix:[], bande:0, delave:false};     /* (rien de reçu : un dossier vide) */
function D(){ return S.dos[S.dc] || VIDE; }
function neuf(niveau){
  S = {niveau:niveau, sel:null, dc:CUIRS[0] || null, dos:{}, barres:{}, flair:{}, tiroir:null, casier:null, essai:null, trouves:{}, finis:{}, dits:{}, codeEcrit:{}, teinte:null, mode:null,
       zoom:10, cx:500, cy:500, occupe:false, tirP:{g:0, d:0}};
  CUIRS.forEach(function(d){ S.dos[d] = {coupes:[], items:genItems(d), mite:OBJETS[d].mite0 ? {x:OBJETS[d].mite0.x, y:OBJETS[d].mite0.y} : {x:880, y:140}, mix:[], bande:0, delave:false}; });   /* (mite0 : la daphnie part du milieu de la goutte) */
}
function couleurDe(liste){ var acc = [0,0,0]; liste.forEach(function(k){ var c = hexRgb(teinte(k).c); for(var j=0;j<3;j++) acc[j] += c[j]; }); return rgbHex(acc.map(function(v){ return v/liste.length; })); }
function couleurLiq(t){ var o = OBJETS[t] || {}; return o.coul || couleurDe(o.cibles || []); }
/* Un dossier est bouclé quand tout ce qu'il demande est reconnu */
function dossierBoucle(d){ return !!d && (OBJETS[d].requis || [d]).every(function(t){ return !!S.trouves[t]; }); }
/* Ce qu'on garde d'une fois sur l'autre (le jeu le range dans la sauvegarde) */
/* (le cuir n'a que quatre places : un dossier qui n'y est pas cette fois-ci garde ce qu'on y avait fait, tel quel) */
var DOS_AILLEURS = {};
function exporter(){
  var e = {trouves:S.trouves, barres:S.barres, finis:S.finis, dits:S.dits, dos:JSON.parse(JSON.stringify(DOS_AILLEURS))};
  CUIRS.forEach(function(d){ var x = S.dos[d], pris = []; [10, 40, 100].forEach(function(z){ x.items[z].forEach(function(it, i){ if(it.pris) pris.push(z + ':' + i); }); });
    e.dos[d] = {coupes:x.coupes, pris:pris, mix:x.mix, bande:x.bande >= 1 ? 1 : 0, delave:x.delave}; });
  return JSON.parse(JSON.stringify(e));
}
function importer(e){
  if(!e || typeof e !== 'object') return;
  ['trouves', 'barres', 'finis', 'dits'].forEach(function(k){ if(e[k] && typeof e[k] === 'object') S[k] = JSON.parse(JSON.stringify(e[k])); });
  DOS_AILLEURS = {}; Object.keys(e.dos || {}).forEach(function(d){ if(CUIRS.indexOf(d) < 0) DOS_AILLEURS[d] = e.dos[d]; });
  CUIRS.forEach(function(d){ var x = S.dos[d], y = (e.dos || {})[d]; if(!y) return;
    if(Array.isArray(y.coupes)) x.coupes = y.coupes.filter(function(c){ return !c || OBJETS[c.t]; });
    (y.pris || []).forEach(function(k){ var q = String(k).split(':'), it = (x.items[q[0]] || [])[+q[1]]; if(it) it.pris = true; });
    if(Array.isArray(y.mix)) x.mix = y.mix.slice(); x.bande = y.bande ? 1 : 0; x.delave = !!y.delave; });
  CUIRS.forEach(function(d){ if(S.finis[d]) S.codeEcrit[d] = true; });
}
