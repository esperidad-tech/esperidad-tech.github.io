
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
    corbeau:{nom:'corbeau', col:'#1b1d2b', lustre:'#4a6aa8'},
    oie:{nom:'oie', col:'#f3f1ea', tige:'#bdb6a6'},
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
    or:{nom:'feuille d\'or'}, laiton:{nom:'laiton'}, mica:{nom:'mica'}, verre:{nom:'verre pilé'}
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
    grains:['suie','charbon','poudre','poivre','pavot','limaille','terre','argile','sciure','rouille','tuile','brique','sable','sel','cendre','or','laiton','mica']
  },
  difficile:{
    fils:['tricot','filee','feutree','cardee','mohair','coton','lin','chanvre','jute','soie','broder','dore','crin','cheveu','ficelle','corde','raphia','araignee'],
    poils:['chien','chatroux','chatgris','mouton','cheval','chevre','lapin','renard','sanglier','ane','blaireau','souris','vache','loup'],
    plumes:['corbeau','oie','poule','pie','canard','hibou','pigeon','geai','faisan','moineau','mesange','paon','coq','cygne'],
    petales:['coquelicot','rose','pivoine','paquerette','tournesol','pissenlit','boutondor','bleuet','violette','myosotis','lavande','souci','iris','mauve'],
    feuilles:['chene','hetre','bouleau','tilleul','chataignier','saule','houx','ortie','erable','lierre','frene','trefle','sapin','fougere'],
    grains:['suie','charbon','poudre','poivre','pavot','limaille','ardoise','terre','argile','sciure','rouille','cannelle','tuile','brique','sable','sel','cendre','farine','or','laiton','mica','verre']
  }
};
function contenuCasier(k){ return LISTES[S.niveau][k]; }
var OBJETS = {
  fil:{nom:'l\'échantillon n° 1', tiroir:'fils', bon:'tricot', voisins:['filee','feutree','cardee','mohair']},
  noir:{nom:'les grains noirs', tiroir:'grains', bon:'suie', coul:'#17110f', voisins:['charbon','poudre','poivre','pavot']},
  brun:{nom:'le grain brun', tiroir:'grains', bon:'terre', coul:'#7a5230', voisins:['argile','rouille','sciure','cannelle']},
  orange:{nom:'l\'éclat orange', tiroir:'grains', bon:'tuile', coul:'#d9772f', voisins:['brique','argile','rouille']},
  or:{nom:'la paillette dorée', tiroir:'grains', bon:'or', coul:'#f2c040', voisins:['laiton','mica','sable']},
  rouge:{nom:'l\'eau rougie', liquide:true, voisins:['coquelicot','cochenille','betterave']}
};
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
  fil:rea({chaude:{t:'L\'eau chaude fait déteindre le fil : de l\'eau rougie !', cree:'rouge'}, flamme:{t:'Le fil se recroqueville et sent le cheveu brûlé.'}}),
  noir:rea({eau:{t:'Les grains flottent : ils n\'aiment pas l\'eau.'}, chaude:{t:'Les grains flottent : ils n\'aiment pas l\'eau.'},
    iode:{t:'L\'orange de l\'iode pâlit autour des grains : ils l\'avalent !', fx:'pali'}, flamme:{t:'Les grains rougeoient tout doucement, sans flamme et sans crépiter.'}}),
  brun:rea({eau:{t:'Ça fait de la boue.'}, chaude:{t:'Ça fait de la boue.'}, vinaigre:{t:'De toutes petites bulles : il y a du calcaire là-dedans.', fx:'bulles'}}),
  orange:rea({eau:{t:'La goutte disparaît : il boit l\'eau, comme un pot de fleurs.'}, chaude:{t:'La goutte disparaît : il boit l\'eau.'}}),
  or:rea({}),
  rouge:rea({eau:{t:'Elle devient plus pâle.'}, vinaigre:{t:'Le rouge vire à l\'orangé.', fx:'orange'}, bicar:{t:'Le rouge vire au violet.', fx:'violet'}, flamme:{t:'L\'eau s\'évapore et laisse un anneau rouge.'}})
};
/* Le test des couleurs, comme dans un vrai labo : une goutte du liquide sur une bandelette de papier buvard, le pied dans un peu d'alcool.
   L'alcool monte dans le papier et emporte les couleurs, chacune à sa vitesse : la teinture se sépare en bandes.
   Chaque teinture a ses bandes à elle (y : la hauteur où la bande s'arrête, de 0 en bas à 1 en haut ; h : son épaisseur). */
var TEINTES = [
  {k:'garance', nom:'racine de garance', c:'#c8503c', b:[{c:'#f0c060', y:.90, h:.05, a:.6}, {c:'#e2553a', y:.70, h:.09}, {c:'#d43a6a', y:.42, h:.08}]},
  {k:'coquelicot', nom:'coquelicot', c:'#e8343c', b:[{c:'#e8343c', y:.56, h:.09}, {c:'#8a3a9a', y:.26, h:.07}]},
  {k:'betterave', nom:'betterave', c:'#9c2257', b:[{c:'#f0c838', y:.78, h:.06}, {c:'#b0206a', y:.50, h:.10}]},
  {k:'cochenille', nom:'cochenille', c:'#c9306a', b:[{c:'#c9306a', y:.33, h:.13}]},
  {k:'mure', nom:'mûres', c:'#4a2a5c', b:[{c:'#7a3aa0', y:.62, h:.08}, {c:'#3a2a6a', y:.18, h:.09}]},
  {k:'oignon', nom:'pelure d\'oignon', c:'#d98a2c', b:[{c:'#e8b830', y:.80, h:.07}, {c:'#a8642a', y:.14, h:.07}]},
  {k:'safran', nom:'safran', c:'#e8b820', b:[{c:'#f0a820', y:.86, h:.11}]},
  {k:'noix', nom:'brou de noix', c:'#6a4a2c', b:[{c:'#c8a040', y:.66, h:.07}, {c:'#6a4a2c', y:.20, h:.11}]}
];
function teinte(k){ return TEINTES.filter(function(t){ return t.k === k; })[0]; }
/* Une teinture est souvent un mélange : la bandelette montre alors les bandes de tous ses ingrédients, et chaque bande doit trouver le sien */
var CIBLES = {facile:['garance','coquelicot'], difficile:['garance','coquelicot','oignon']};
/* Les bandes de la bandelette à analyser, du haut vers le bas, avec l'ingrédient qui les explique */
function bandesMelange(){ var l = []; CIBLES[S.niveau].forEach(function(k){ teinte(k).b.forEach(function(b){ l.push({k:k, y:b.y, h:b.h, c:b.c}); }); }); return l.sort(function(a, b){ return b.y - a.y; }); }
var TXT = {trop:'Trop petit : zoome !', pris:'Dans la coupelle !', mite:'L\'acarien file se cacher entre les fibres !', code:['🍄','🎩','🔑']};

/* ============ État ============ */
var S;
function neuf(niveau){
  S = {niveau:niveau, sel:null, coupes:[], barres:{}, flair:{}, tiroir:null, casier:null, essai:null, trouves:{}, teinte:null, mix:[], bande:0, mode:null,
       zoom:10, cx:500, cy:500, items:null, mite:{x:880, y:140}, occupe:false, tirP:{g:0, d:0}};
  genItems(); genScenes();
}
function couleurDe(liste){ var acc = [0,0,0]; liste.forEach(function(k){ var c = hexRgb(teinte(k).c); for(var j=0;j<3;j++) acc[j] += c[j]; }); return rgbHex(acc.map(function(v){ return v/liste.length; })); }
function couleurRouge(){ return couleurDe(CIBLES[S.niveau]); }
