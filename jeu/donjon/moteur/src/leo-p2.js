/* leo-p2.js — LA PHASE 2 DE LÉO À L'ÉCRAN : ses gestes, attaque par attaque, et ce qui les fait comprendre (Bible §13.40).
   Romain, 14 novembre au soir : « Je veux vraiment que chaque fois qu'il fait un mouvement, on comprenne bien ce qu'il va faire.
   Quand il prend son marteau pour assommer, ou quand il saute, il faut qu'il se prépare. […] tu peux rajouter des effets […]
   des émotes, changer son visage […] Les sons aussi sont très utiles. »

   CE QUI DÉCIDE : les règles (leo-regles.js), comme toujours. Ici, À CHAQUE IMAGE, on lit où Léo en est dans son attaque
   (son étape — prise, élan, retour… — et le temps qu'il y a passé, sur SA propre horloge : le givre le ralentit, le marteau
   le coupe) et on en tire sa pose. Une attaque = trois « pistes » de poses clés (la prise, l'élan, le retour), entre lesquelles
   on glisse ; des « repères » (à tel moment de l'étape : le sifflet passe dans sa main, le bouchon saute, un glou…) lancent
   les effets et les sons une seule fois. Ainsi l'animation dure EXACTEMENT ce que dure l'attaque, et un geste coupé s'arrête net.

     var P2 = LeoP2.creer(ctx)          ctx : {leo (la façade LeoAnime), fx, sol, persos (les calques), Fx, bruit, son, hCx, hPt, LX, SOL, el, q}
     P2.image(dt, c)                     à chaque image du combat (phase 2, hors cinématique) : c = le combat (LeoRegles)
     P2.evenement(ev, c)                 un évènement des règles qui concerne Léo (rend true s'il l'a joué)
     P2.cine12(o) -> Promise             la cinématique du début de la phase 2 (il arrache sa cape et sa tunique)
     P2.vider()                          enlève tous les effets en cours (une défaite, un nouvel essai)
     LeoP2.PISTES, LeoP2.pose(att, etape, k, t)   pour les essais (les planches de poses) */
(function(){
'use strict';
var LC = window.LeoCorps;

/* ============================================================================ LES POSES CLÉS
   Les nombres sont ceux de leo-corps.js (POSE). mAv / mAr : où va le poignet, dans le buste au repos (l'épaule de devant est en
   197, 129 ; celle de derrière en 103, 127 ; la bouche vers 116, 94 ; le sifflet sur la poitrine en 141, 130). */
var G = {bas:10, bassin:3, torse:5, tete:9, bAv:[-10, 26, -6], bAr:[18, 34, 0], pAv:[200, 318], pAr:[102, 318]};
function pose(o){ var r = {}, k; for(k in G) r[k] = Array.isArray(G[k]) ? G[k].slice() : G[k]; for(k in o) r[k] = o[k]; return r; }
/* une piste : [[k, pose, courbe vers la suivante], …] ; k de 0 à 1 dans l'étape */
var PISTES = {};
/* ---------- LE SIFFLET : il prend le sifflet à son cou, le porte à sa bouche, siffle à pleins poumons ; ses rats arrivent ---------- */
PISTES.sifflet = {
  prise:[[0, pose({}), 'io'], [.45, pose({mAv:[150, 146], tete:16, torse:8}), 'io'], [1, pose({mAv:[128, 104], tete:2, torse:2, bAr:[24, 40, 0]})]],
  elan:[[0, pose({mAv:[128, 104], tete:2, torse:2, bAr:[24, 40, 0]}), 'o'], [.2, pose({mAv:[126, 100], tete:-8, torse:-6, bas:6, bAr:[76, 18, 0], souffle:.2}), 'lin'], [1, pose({mAv:[126, 98], tete:-10, torse:-8, bas:6, bAr:[82, 14, 0], souffle:.2})]],
  retour:[[0, pose({mAv:[146, 140], tete:6, torse:6, bAr:[98, 4, 0], bas:12}), 'io'], [.4, pose({mAv:[146, 140], tete:6, torse:6, bAr:[98, 4, 0], bas:12}), 'io'], [1, pose({})]]
};
/* ---------- LE COUP DE POING : il arme son poing (qui rougeoie), et frappe l'air si fort que le souffle balaie les trois ---------- */
PISTES.poing = {
  elan:[[0, pose({}), 'o'], [.55, pose({torse:-12, bas:18, bassin:-4, tete:4, bAv:[-80, 124, -10], bAr:[66, 56, 0], pAv:[218, 318], pAr:[96, 318]}), 'io'], [1, pose({torse:-15, bas:20, bassin:-5, tete:4, bAv:[-92, 128, -10], bAr:[70, 50, 0], pAv:[220, 318], pAr:[96, 318]})]],
  retour:[[0, pose({x:-22, torse:24, bas:14, bassin:8, tete:10, bAv:[98, 4, 0], bAr:[-34, 44, 0], pAv:[178, 318], pAr:[70, 318]}), 'lin'], [.35, pose({x:-22, torse:22, bas:14, bassin:8, tete:10, bAv:[96, 8, 0], bAr:[-30, 44, 0], pAv:[178, 318], pAr:[70, 318]}), 'io'], [1, pose({})]]
};
/* ---------- LA FAUX : il la tire de son dos, la tient à deux mains, l'arme loin derrière lui (la lame brille), et fauche ---------- */
/* (le geste du faucheur : il ne l'abat pas d'en haut — il FAUCHE, au ras du sol, comme on fauche le blé : la lame part de
   derrière lui, à droite, et balaie tout devant, à hauteur des jambes des trois héros) */
var FAUX_PRETE = {x:-60, mAv:[222, 180], fa:232, fg:0, deux:1, torse:-6, bas:18, bassin:-2, tete:6};
var FAUX_ARMEE = {x:-104, mAv:[226, 168], fa:194, fg:0, deux:1, torse:-14, bas:28, bassin:-6, tete:4, pAv:[226, 318], pAr:[92, 318]};
var FAUX_FAUCHE = {mAv:[78, 214], fa:432, fg:0, deux:1, torse:26, bas:28, bassin:10, tete:12, x:-124, pAv:[198, 318], pAr:[66, 318]};
PISTES.faux = {
  prise:[[0, pose({}), 'io'], [.4, pose({bAv:[166, 58, 0], bAr:[10, 30, 0], tete:4, torse:-4}), 'io'], [.45, pose({bAv:[166, 58, 0], bAr:[10, 30, 0], tete:4, torse:-4, fa:206, fg:120}), 'io'],
    [.72, pose({bAv:[150, 10, 0], bAr:[20, 40, 0], tete:-4, torse:-6, fa:190, fg:70}), 'io'],
    [1, pose(FAUX_PRETE)]],
  elan:[[0, pose(FAUX_PRETE), 'io'], [.75, pose(FAUX_ARMEE), 'lin'], [1, pose({x:-106, mAv:[228, 166], fa:190, fg:0, deux:1, torse:-15, bas:29, bassin:-6, tete:4, pAv:[226, 318], pAr:[92, 318]})]],
  retour:[[0, pose(FAUX_FAUCHE), 'o'], [.3, pose({mAv:[82, 212], fa:430, fg:0, deux:1, torse:24, bas:26, bassin:10, tete:10, x:-124, pAv:[198, 318], pAr:[66, 318]}), 'io'],
    [.62, pose({bAv:[166, 58, 0], fa:566, fg:120, deux:0, torse:-4, bas:12, tete:4}), 'io'], [1, pose({})]]
};
/* ---------- LA CHARGE : tête baissée comme un taureau, il racle le sol, souffle par les naseaux… et fonce ---------- */
var TAUREAU = {torse:30, bas:26, bassin:8, tete:-6, bAv:[-30, 70, 0], bAr:[26, 80, 0], pAv:[232, 318], pAr:[100, 318]};
PISTES.charge = {
  prise:[[0, pose({}), 'io'], [1, pose(TAUREAU)]],
  elan:[[0, pose(TAUREAU), 'lin'], [1, pose(TAUREAU)]],              /* (le raclement est ajouté par-dessus, en boucle) */
  retour:[[0, pose({x:'cible', torse:36, bas:20, bassin:10, tete:6, bAv:[-20, 40, 0], bAr:[60, 30, 0], pAv:[200, 318], pAr:[96, 318]}), 'io'], [.25, pose({x:'cible', torse:10, bas:12}), 'io'], [1, pose({})]]
};
/* ---------- LE LANCER DE RAT : il plonge la main dans son sac, tire un rat par la queue, le fait tournoyer, et le lance ---------- */
PISTES.lancer = {
  elan:[[0, pose({}), 'o'], [.3, pose({mAv:[212, 196], torse:-2, tete:14, bas:14}), 'o'], [.62, pose({bAv:[170, 30, 0], torse:-10, tete:-6, bas:8, ra:-160}), 'lin'], [1, pose({bAv:[200, 40, 0], torse:-14, tete:-4, bas:10, ra:-330})]],
  retour:[[0, pose({bAv:[80, 0, 0], torse:16, tete:8, bas:12, bAr:[-20, 40, 0]}), 'o'], [.3, pose({bAv:[70, 6, 0], torse:14, tete:8, bas:12}), 'io'], [1, pose({})]]
};
/* ---------- LA GOURDE (la potion de soin, verte) : il la décroche de sa ceinture, fait sauter le bouchon, la lève au-dessus de
   son visage et la boit, glou, glou, glou… des croix vertes montent : il se soigne. Le marteau peut l'arrêter. ---------- */
var BOIT = {mAv:[186, 34], ga:222, gp:1, tete:-34, torse:-10, bas:6, bAr:[-8, 30, 0], bassin:-2};
PISTES.gourde = {
  prise:[[0, pose({}), 'io'], [.4, pose({mAv:[186, 206], tete:22, torse:10, bas:14, ga:0}), 'io'], [.75, pose({mAv:[160, 150], tete:10, torse:4, bAr:[40, 70, 0], ga:-10}), 'io'], [1, pose({mAv:[158, 146], tete:8, torse:4, bAr:[44, 74, 0], ga:-12, gp:.3})]],
  elan:[[0, pose({mAv:[158, 146], tete:8, torse:4, bAr:[44, 74, 0], ga:-12}), 'io'], [.16, pose(BOIT), 'lin'], [1, pose(BOIT)]],     /* (les glous sont ajoutés par-dessus) */
  retour:[[0, pose({mAv:[160, 150], tete:-4, torse:-6, bAr:[96, 100, 0], bas:6, ga:-10}), 'io'], [.45, pose({mAv:[186, 206], tete:10, torse:6, bas:12, ga:0}), 'io'], [1, pose({})]]
};
/* ---------- LE SAUT (refait le 15 novembre ; Romain : « l'animation est pas claire », « il faut qu'elle dure un tout petit peu plus
   longtemps pour la préparation ») : il se ramasse très bas, les bras en arrière (la poussière tourne) ; il bondit VERS les héros,
   bien visible, les deux poings levés au-dessus de la tête ; il reste un instant en l'air au-dessus de l'endroit où il va tomber
   (une grande cible orange au sol, son ombre qui grossit) ; puis il s'abat, poings joints. Il ne sort plus de l'écran. ---------- */
var ACCROUPI = {bas:60, torse:34, bassin:14, tete:-8, bAv:[-84, 34, 0], bAr:[-66, 38, 0], pAv:[218, 318], pAr:[86, 318]};
var SAUT_X = -250;                       /* là où il retombe (au milieu de la salle, devant les héros) */
PISTES.saut = {
  prise:[[0, pose({}), 'io'], [.55, pose(ACCROUPI), 'io'], [1, pose({bas:66, torse:38, bassin:15, tete:-10, bAv:[-92, 36, 0], bAr:[-74, 40, 0], pAv:[218, 318], pAr:[86, 318]})]],
  elan:[[0, pose({bas:66, torse:38, bassin:15, tete:-10, bAv:[-92, 36, 0], bAr:[-74, 40, 0], pAv:[218, 318], pAr:[86, 318]}), 'o'],
    /* (il ne monte pas plus haut que le haut de la salle : il bondit ramassé, les genoux sous lui — on le voit en entier) */
    [.1, pose({x:-24, y:-44, bas:14, torse:6, tete:-10, bAv:[120, 30, 0], bAr:[114, 34, 0], ombre:1.1}), 'o'],
    [.4, pose({x:SAUT_X * .62, y:-84, bas:32, torse:18, tete:-8, bAv:[150, 34, 0], bAr:[144, 38, 0], ombre:1.5}), 'io'],
    [.82, pose({x:SAUT_X, y:-92, bas:36, torse:8, tete:-16, bAv:[168, 24, 0], bAr:[162, 28, 0], ombre:1.9}), 'i'],
    [1, pose({x:SAUT_X, y:0, bas:58, torse:40, bassin:14, tete:10, mAv:[120, 252], mAr:[100, 256], pAv:[224, 318], pAr:[84, 318], ombre:1.3})]],
  retour:[[0, pose({x:SAUT_X, bas:58, torse:40, bassin:14, tete:10, mAv:[120, 252], mAr:[100, 256], pAv:[224, 318], pAr:[84, 318]}), 'o'],
    [.3, pose({x:SAUT_X, bas:54, torse:36, bassin:14, tete:4, mAv:[120, 250], mAr:[100, 254], pAv:[224, 318], pAr:[84, 318]}), 'io'],
    [.5, pose({x:SAUT_X, bas:30, torse:10, tete:-6, bAv:[-30, 40, 0], bAr:[-20, 44, 0]}), 'o'],
    [.75, pose({x:SAUT_X * .5, y:-50, bas:22, torse:4, tete:-4, bAv:[40, 60, 0], bAr:[50, 56, 0]}), 'i'],
    [.92, pose({x:0, bas:30, torse:12, tete:2}), 'o'], [1, pose({})]]
};
/* ---------- ce qui lui arrive ---------- */
var SONNE = pose({bas:16, torse:16, tete:24, bAv:[6, 20, 0], bAr:[14, 16, 0], pAv:[194, 318], pAr:[110, 318]});
var AU_SOL = pose({bas:0, r:-80, x:-262, y:-26, torse:-6, tete:-16, bAv:[150, 40, 0], bAr:[176, 30, 0], jAv:[20, 30], jAr:[44, 60], ombre:1.6});

/* ============================================================================ LE MOTEUR DES PISTES */
var COURBES = {
  lin:function(t){ return t; }, o:function(t){ return 1 - Math.pow(1 - t, 3); }, i:function(t){ return t * t * t; },
  io:function(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  b:function(t){ var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
};
var CACHE = new Map(), CIBLE2 = 0;
function complet(p, cx){
  /* x:'cible' : la place devant le héros visé (la charge) ; x:'cible2' : devant le second (celui qu'il frappe avec le premier) */
  if(p.x === 'cible' || p.x === 'cible2'){ var q = {}; for(var k in p) q[k] = p[k]; q.x = (p.x === 'cible2' ? CIBLE2 || cx : cx) || 0; return LC.complete(q); }
  var c = CACHE.get(p); if(!c){ c = LC.complete(p); CACHE.set(p, c); } return c;
}
function piste(l, k, cx){
  if(!l || !l.length) return complet(G);
  if(k <= l[0][0]) return complet(l[0][1], cx);
  for(var i = 0; i < l.length - 1; i++){
    var a = l[i], b = l[i + 1];
    if(k <= b[0]){ var u = (k - a[0]) / Math.max(1e-6, b[0] - a[0]); return LC.melange(complet(a[1], cx), complet(b[1], cx), (COURBES[a[2] || 'io'] || COURBES.io)(u)); }
  }
  return complet(l[l.length - 1][1], cx);
}
function poseDe(att, etape, k, cx){ var P = PISTES[att]; return P && P[etape] ? piste(P[etape], k, cx) : complet(G); }

/* ============================================================================ CE QUE FAIT SON VISAGE, ÉTAPE PAR ÉTAPE
   [k, visage] : à partir de k dans l'étape (Romain : « son visage, je veux qu'il change en fonction de ce qu'il fait ») */
var VISAGES = {/* (ceux de la phase 3 sont ajoutés plus bas) */
  sifflet:{prise:[[0, 'colere'], [.8, 'souffle']], elan:[[0, 'souffle']], retour:[[0, 'rictus']]},
  poing:{elan:[[0, 'effort']], retour:[[0, 'cri'], [.5, 'colere']]},
  faux:{prise:[[0, 'colere'], [.75, 'rictus']], elan:[[0, 'effort']], retour:[[0, 'cri'], [.55, 'rictus']]},
  charge:{prise:[[0, 'colere']], elan:[[0, 'effort']], retour:[[0, 'rictus']]},
  lancer:{elan:[[0, 'rictus']], retour:[[0, 'rictus']]},
  gourde:{prise:[[0, 'colere'], [.6, 'rictus']], elan:[[0, 'boit']], retour:[[0, 'aah']]},
  saut:{prise:[[0, 'effort']], elan:[[0, 'cri']], retour:[[0, 'cri'], [.6, 'colere']]}
};

/* ============================================================================ LA SCÈNE (créée par leo.js) */
function creer(ctx){
  var X = {ctx:ctx, sig:'', debut:0, duree:1, de:null, fondu:9, F:.12, faits:{}, suiveurs:[], temps:0, cible:0, fx:[], flinch:0, douleur:0, att:null, etape:null, k:0,
    pose:null, brule:false, coupe:0};
  return {
    image:function(dt, c){ image(X, dt, c); },
    evenement:function(ev, c){ return evenement(X, ev, c); },
    cine12:function(o){ return cine12(X, o); },
    vider:function(){ vider(X); },
    icone:icone,
    X:X
  };
}
function el(cls, html, parent){ var e = document.createElement('div'); e.className = cls; if(html != null) e.innerHTML = html; (parent || null) && parent.appendChild(e); return e; }
function retirer(e, ms){ setTimeout(function(){ try{ e.remove(); }catch(x){} }, ms); }
function anim(e, kf, o){ try{ return e.animate(kf, o); }catch(x){ return null; } }
function hasard(a, b){ return a + Math.random() * (b - a); }
function corps(X){ return X.ctx.leo.corps; }
function sc(X, os, x, y){ return X.ctx.leo.scene(os, x, y); }
/* un effet qui suit Léo à chaque image : {maj(dt) -> false pour s'arrêter, fin()} ; etape:true = il s'arrête avec l'étape */
function suivre(X, s){ X.suiveurs.push(s); return s; }
function vider(X){
  X.suiveurs.forEach(function(s){ try{ if(s.fin) s.fin(); }catch(e){} }); X.suiveurs = [];
  X.fx.forEach(function(e){ try{ e.remove(); }catch(x){} }); X.fx = [];
  if(X.annonce){ try{ X.annonce.el.remove(); }catch(x){} X.annonce = null; }
  X.cibleSaut = null;
  X.sig = ''; X.faits = {}; X.brule = false; X.flinch = 0; X.douleur = 0; X.coupe = 0;
  var C = corps(X), f3 = !!(C && C.etat.forme === 3);
  if(C){ C.objet('faux', f3 ? null : 'dos'); C.objet('gourde', f3 ? null : 'ceinture'); C.objet('bouchon', true); C.objet('sifflet', 'cou'); C.objet('rat', null); C.visage('colere'); C.devantAr(false); C.main('Av', 'poing'); C.main('Ar', 'poing'); if(C.arme) C.arme(null); }
  if(X.mareEl){ try{ X.mareEl.remove(); }catch(x){} X.mareEl = null; }
  if(X.porte){ try{ var sp = X.porte.el; sp.style.transform = ''; sp.style.willChange = ''; sp.style.zIndex = ''; }catch(x){} X.porte = null; }
  X.cibleH = null; X.cibleX2 = 0; X.coupVu = 0; X.sangT = 0;
}
function bruit(X, id, o, ancien){ try{ return X.ctx.bruit(id, o || {}, ancien); }catch(e){ return null; } }
function son(X){ try{ X.ctx.son.apply(null, [].slice.call(arguments, 1)); }catch(e){} }

/* ============================================================================ À CHAQUE IMAGE */
function idle(X, t){
  /* au repos, il n'est jamais immobile : il souffle fort (il est en colère), il se balance, il serre les poings */
  var f3 = p3(X), p = LC.complete(f3 ? pose(G3) : G), s1 = Math.sin(t * 1.25), s2 = Math.sin(t * .7 + 1);
  p.x = s1 * 2.5; p.torse += s1 * 1.6 + 1; p.tete += s2 * 2;
  p.bAv[1] += Math.sin(t * 2.1) * 6; p.bAr[1] += Math.sin(t * 1.8 + 2) * 6; p.bAv[0] += s2 * 3;
  p.souffle = f3 ? 2.6 : 1.7;                       /* (sous la potion : il halète, les bras ballants) */
  return p;
}
function image(X, dt, c){
  var C = corps(X); if(!C) return;
  var Z = c.leo, t = (X.temps += dt), etape = Z.etape, att = Z.att;
  var sig = etape + '|' + (att || '') + '|' + Z.fin.toFixed(4);
  if(sig !== X.sig){ changer(X, Z, c); X.sig = sig; }
  var k = Math.max(0, Math.min(1, (Z.tl - X.debut) / X.duree));
  X.k = k;
  var p;
  CIBLE2 = X.cibleX2 || 0;
  if(etape === 'coups' && att === 'rafale' && !PISTES.rafale.coups) PISTES.rafale.coups = pisteCoups();
  if((etape === 'prise' || etape === 'elan' || etape === 'retour' || etape === 'coups' || etape === 'porte' || etape === 'tient' || etape === 'farine') && PISTES[att] && PISTES[att][etape]) { var q0 = poseDe(att, etape, k, X.cibleX); p = LC.melange(q0, q0, 0); }
  else if(etape === 'sonne' || etape === 'noirci') p = sonne(t);
  else if(etape === 'sol') p = auSol(k, t);
  else p = idle(X, t);
  /* par-dessus : ce qui se répète pendant une étape (le raclement, les glous, le sifflet qui tremble) */
  p = plus(X, p, etape, att, k, t, Z, c);
  /* on glisse de la pose d'avant à la nouvelle (une attaque coupée net ne « saute » pas) */
  if(X.fondu < X.F && X.de){ X.fondu += dt; p = LC.melange(X.de, p, Math.min(1, X.fondu / X.F)); }
  /* il encaisse un coup */
  if(X.flinch > 0){ X.flinch = Math.max(0, X.flinch - dt * 4); var f = X.flinch * X.flinchF; p.torse -= 7 * f; p.tete -= 10 * f; p.x += 6 * f; }
  /* les repères de l'étape (les effets, les sons, une seule fois) */
  reperes(X, etape, att, k, c);
  annoncer(X, etape, att, k);
  if(p3(X)) gouttes(X, dt, Z);
  /* le visage */
  visage(X, etape, att, k, dt);
  X.pose = p;
  C.temps += dt; C.poser(p);
  /* les effets qui le suivent */
  for(var i = X.suiveurs.length - 1; i >= 0; i--){ var s = X.suiveurs[i], garde = true; try{ garde = s.maj(dt) !== false; }catch(e){ garde = false; } if(!garde){ try{ if(s.fin) s.fin(); }catch(e){} X.suiveurs.splice(i, 1); } }
}
/* L'ANNONCE (15 novembre ; Romain : « les animations restent pas très claires, il faut augmenter la clarté encore ») : pendant
   qu'il prépare une attaque, son nom s'affiche en gros au milieu de la salle, avec une jauge qui se remplit jusqu'au coup.
   On sait ce qui arrive, et quand. (Trois mots au plus : pas de bouton 🔊.) */
var ANNONCES = {fleau:['⚠️', 'LE FLÉAU'], marteau:['🔨', 'LE MARTEAU'], meule:['⚠️', 'LA MEULE'], crochet:['🪝', 'LE CROCHET'], cape:['🌑', 'LA CAPE'],
  poing3:['👊', 'LE POING'], rafale:['🥊', 'LA RAFALE'], hurlement:['📢', 'LE CRI'], attrape:['✊', 'IL ATTRAPE'], souffle:['🔥', 'LE FEU'],
  sifflet:['🐀', 'IL SIFFLE'], faux:['⚠️', 'LA FAUX'], charge:['⚠️', 'LA CHARGE'], lancer:['🐀', 'UN RAT VOLE'], gourde:['🧪', 'IL BOIT'], saut:['⚠️', 'LE SAUT'], poing:['⚠️', 'LE POING']};
/* (15 novembre, 13 h 54 — Romain : « pour chaque animation, tu mets à chaque fois un petit curseur qui montre ce qu'il fait. Quand il
   donne sa volée de coups, tu vois écrit 1, 2, 3 … 16 ») : pendant la rafale, l'annonce reste et compte les coups (« 7 / 16 », la
   jauge avance d'un cran par coup) ; pendant qu'il porte un héros, « IL VA FRAPPER », et la jauge court jusqu'au coup. */
var ANNONCES_SUITE = {porte:['✊', 'IL VA FRAPPER'], tient:['🪝', 'IL SERRE']};
function annoncer(X, etape, att, k){
  var suite = (etape === 'coups' && att === 'rafale') || (etape === 'porte' && att === 'attrape') || (etape === 'tient' && att === 'crochet');
  var A = ANNONCES[att], en = !!A && (etape === 'prise' || etape === 'elan' || suite), a = X.annonce;
  if(a && en && a.att === att && suite){
    /* la suite de la même attaque : le même panneau, son texte et sa jauge changent */
    if(etape === 'coups'){
      var NC = (window.LeoRegles && window.LeoRegles.L.ATTAQUES.rafale.coups) || 16, nc = Math.min(NC, X.coupVu || 0);
      if(a.n !== 1000 + nc){ a.n = 1000 + nc; a.txt.textContent = nc + ' / ' + NC; a.u.style.transform = 'scaleX(' + (nc / NC).toFixed(3) + ')'; if(!a.suite){ a.suite = 1; a.el.classList.add('coups'); } }
    } else {
      if(a.suite !== 2){ a.suite = 2; a.txt.textContent = ANNONCES_SUITE[etape][1]; a.el.classList.add('coups'); }
      var np = Math.round(k * 60); if(a.n !== 2000 + np){ a.n = 2000 + np; a.u.style.transform = 'scaleX(' + (np / 60).toFixed(3) + ')'; }
    }
    return;
  }
  if(suite && !a) return;
  if(a && (!en || a.att !== att)){ X.annonce = null; var e0 = a.el; anim(e0, [{opacity:1}, {opacity:0}], {duration:160, fill:'forwards'}); retirer(e0, 180); a = null; if(X.cibleSaut && att !== 'saut') finCibleSaut(X); }
  if(!en) return;
  var R = window.LeoRegles && window.LeoRegles.L.ATTAQUES[att], pr = R ? R.prise || 0 : 0, elx = R ? R.elan || 0 : 1, tot = (pr + elx) || 1;
  if(!a){
    var e = el('lp-annonce' + (att === 'gourde' ? ' vert' : att === 'sifflet' || att === 'lancer' ? ' rat' : ''), '<b>' + A[0] + '</b><span>' + A[1] + '</span><i><u></u></i>', calque(X));
    anim(e, [{opacity:0, transform:'translate(-50%,10px) scale(.7)'}, {opacity:1, transform:'translate(-50%,0) scale(1.08)', offset:.7}, {opacity:1, transform:'translate(-50%,0) scale(1)'}], {duration:200, fill:'forwards', easing:'ease-out'});
    a = X.annonce = {att:att, el:e, u:e.querySelector('u'), txt:e.querySelector('span'), n:-1, suite:0};
  }
  /* la jauge : où l'on en est entre le début de la préparation et le coup (l'horloge de Léo fait foi, même ralentie par le givre) */
  var n = Math.round(Math.max(0, Math.min(1, (etape === 'prise' ? k * pr : pr + k * elx) / tot)) * 60);
  if(n !== a.n){ a.n = n; a.u.style.transform = 'scaleX(' + (n / 60).toFixed(3) + ')'; }
}
function changer(X, Z, c){
  /* une nouvelle étape commence : on note d'où l'on part ; les effets de l'étape d'avant s'arrêtent */
  X.suiveurs = X.suiveurs.filter(function(s){ if(s.etape){ try{ if(s.fin) s.fin(); }catch(e){} return false; } return true; });
  X.debut = Z.tl; X.duree = Math.max(1e-4, Z.fin - Z.tl);
  X.de = X.pose; X.fondu = 0; X.F = Z.etape === 'retour' ? .05 : Math.min(.14, X.duree * .4);
  X.faits = {};
  X.etape = Z.etape; X.att = Z.att;
  var C = corps(X);
  /* (phase 1 : une attaque finie ou coupée — il n'a plus son arme en main) */
  if(C && C.arme && (Z.etape === 'repos' || Z.etape === 'sonne' || Z.etape === 'sol' || Z.etape === 'noirci')) C.arme(null);
  /* (une attaque qui recommence : tout reprend sa place, au cas où une étape aurait été coupée) */
  if(p3(X)){ if(Z.etape === 'repos' || Z.etape === 'prise'){ C.main('Ar', 'poing'); if(Z.att !== 'attrape') C.main('Av', 'poing'); }
    /* (un héros encore porté alors que l'attaque est finie ou coupée : il retombe) */
    if(X.porte && (Z.etape === 'repos' || Z.etape === 'sonne' || Z.etape === 'sol' || (Z.etape === 'prise' && Z.att !== 'attrape'))) lacher(X);
    if(Z.etape === 'repos' || Z.etape === 'sonne'){ X.cibleH = null; X.coupVu = 0; } }
  else if(Z.etape === 'repos' || Z.etape === 'prise' && Z.att !== 'faux' && Z.att !== 'gourde'){
    if(C.etat.faux === 'main' && Z.att !== 'faux') C.objet('faux', 'dos');
    if(C.etat.sifflet === 'main' && Z.att !== 'sifflet') C.objet('sifflet', 'cou');
    if(C.etat.rat === 'main' && Z.att !== 'lancer') C.objet('rat', null);
    if(C.etat.gourde !== 'ceinture' && Z.att !== 'gourde' && !X.gourdePerdue){ C.objet('gourde', 'ceinture'); C.objet('bouchon', true); }
    if(Z.att !== 'faux') C.devantAr(false);
    C.main('Ar', 'poing'); C.main('Av', 'poing');
  }
}
function sonne(t){ var p = LC.complete(SONNE); p.torse += Math.sin(t * 7) * 6; p.tete += Math.sin(t * 5 + 1) * 10; p.x = Math.sin(t * 3.5) * 6; return p; }
function auSol(k, t){
  /* il a glissé sur l'huile : sur le dos, sonné… puis, à la fin, il se relève d'un coup de reins */
  var p = LC.complete(AU_SOL);
  p.tete += Math.sin(t * 4) * 6;
  if(k > .86){ var u = (k - .86) / .14; p = LC.melange(p, LC.complete(pose({bas:30, torse:20, tete:6, x:-120, bAv:[-30, 40, 0], bAr:[40, 60, 0]})), COURBES.io(u)); }
  return p;
}

/* ============================================================================ LA PHASE 1 : L'HOMME EN CAPE (15 novembre, 13 h 54)
   Romain : « la phase 1, tu refais le personnage comme les autres, plus joli, plus animé […] ses sorts bien lisibles, avec des petites
   indications, des petits timers qui avancent ». C'est le même pantin, habillé (la capuche, la tunique, la cape : LeoCorps.habits) ;
   chaque attaque a sa préparation — il sort son arme de sous sa cape, on la voit —, son coup, son retour ; son nom s'affiche
   avec la jauge. aa : l'angle de l'arme (0 : elle pend ; 180 : levée). */
function p1(X){ var C = corps(X); return !!(C && C.etat.cape); }
var SOUS_CAPE = {torse:10, tete:12, bAv:[-34, 70, 0], bAr:[22, 40, 0]};                           /* sa main passe sous la cape */
/* ---------- LE FLÉAU : il le fait tournoyer au-dessus de sa tête, puis l'abat sur deux héros ---------- */
var FL_PRET = {torse:2, tete:6, bAv:[72, 50, 0], aa:150, ag:40};
/* (il le fait tourner devant lui, le bras tendu vers les héros : levé au-dessus de sa tête, le fléau sortait de l'écran) */
var FL_TOURNE = {torse:-6, bas:10, tete:2, bAv:[84, 10, 0], bAr:[30, 50, 0], aa:180, ag:40};
var FL_ABAT = {x:'cible', torse:34, bas:20, bassin:8, tete:12, bAv:[62, 6, 0], bAr:[-30, 50, 0], pAv:[180, 318], pAr:[66, 318], aa:64, ag:40};
PISTES.fleau = {
  prise:[[0, pose({}), 'io'], [.36, pose(SOUS_CAPE), 'io'], [1, pose(FL_PRET)]],
  elan:[[0, pose(FL_PRET), 'io'], [.2, pose(FL_TOURNE), 'lin'], [.82, pose(FL_TOURNE), 'i'], [1, pose(FL_ABAT)]],
  retour:[[0, pose(FL_ABAT), 'lin'], [.3, pose(FL_ABAT), 'io'], [1, pose({})]]
};
/* ---------- LE MARTEAU : sur l'épaule, puis levé à bout de bras (il tremble sous le poids)… et il l'écrase sur un héros ---------- */
/* (le haut de l'écran est pris par la barre de Léo et les réglages : un marteau levé au-dessus de sa tête ne se verrait pas.
   Il le pose devant lui, la tête au sol ; le ramène en arrière, à l'horizontale, en se cabrant ; puis bondit et l'abat.) */
var MA_EPAULE = {torse:12, tete:12, bas:14, bAv:[52, 40, 0], bAr:[40, 50, 0], aa:32, ag:56};
var MA_HAUT = {torse:-16, bas:12, bassin:-5, tete:-4, bAv:[-36, 104, 0], bAr:[60, 60, 0], aa:96, ag:30};
var MA_DESSUS = {x:'cible', torse:6, bas:10, tete:4, bAv:[150, 12, 0], bAr:[40, 40, 0], pAv:[190, 318], pAr:[80, 318], aa:168, ag:30};
var MA_ABAT = {x:'cible', torse:38, bas:24, bassin:10, tete:14, bAv:[58, 4, 0], bAr:[40, 30, 0], pAv:[182, 318], pAr:[66, 318], aa:58, ag:30};
PISTES.marteau = {
  prise:[[0, pose({}), 'io'], [.36, pose(SOUS_CAPE), 'io'], [1, pose(MA_EPAULE)]],
  elan:[[0, pose(MA_EPAULE), 'io'], [.4, pose(MA_HAUT), 'lin'], [.82, pose(MA_HAUT), 'i'], [.93, pose(MA_DESSUS), 'i'], [1, pose(MA_ABAT)]],
  retour:[[0, pose(MA_ABAT), 'lin'], [.35, pose(MA_ABAT), 'io'], [1, pose({})]]
};
/* ---------- LA MEULE DE PAILLE : il se baisse, la soulève au-dessus de sa tête, la tient là… et la lance : elle roule sur les trois ---------- */
var ME_PREND = {bas:40, torse:30, tete:20, bAv:[40, 30, 0], bAr:[50, 30, 0], aa:96};
/* (la meule contre sa poitrine, puis ramenée en arrière — au-dessus de sa tête, elle sortait de l'écran) */
var ME_HAUT = {bas:14, torse:-14, bassin:-5, tete:-4, bAv:[34, 66, 0], bAr:[46, 64, 0], aa:96};
var ME_JETTE = {torse:32, bas:20, bassin:8, tete:12, bAv:[84, 0, 0], bAr:[70, 10, 0], aa:100};
PISTES.meule = {
  prise:[[0, pose({}), 'io'], [.34, pose(ME_PREND), 'io'], [1, pose(ME_HAUT)]],
  elan:[[0, pose(ME_HAUT), 'lin'], [.8, pose(ME_HAUT), 'i'], [1, pose(ME_JETTE)]],
  retour:[[0, pose(ME_JETTE), 'io'], [1, pose({})]]
};
/* ---------- LE CROCHET : il jette sa farine (le nuage), arme son croc en arrière, le lance au bout de sa chaîne… et il serre ---------- */
var CR_FARINE = {torse:14, tete:10, bAv:[40, 20, 0], bAr:[120, 10, 0]};
var CR_ARME = {torse:-12, bas:14, tete:0, bAv:[-84, 104, 0], bAr:[40, 40, 0], aa:-30};
var CR_LANCE = {torse:30, bas:20, bassin:8, tete:10, bAv:[96, 0, 0], bAr:[-30, 50, 0], aa:92};
var CR_TIENT = {torse:8, bas:16, tete:8, bAv:[50, 96, 0], bAr:[40, 90, 0], aa:120};
PISTES.crochet = {
  prise:[[0, pose({}), 'io'], [.3, pose(CR_FARINE), 'io'], [.55, pose(SOUS_CAPE), 'io'], [1, pose(CR_ARME)]],
  elan:[[0, pose(CR_ARME), 'lin'], [.7, pose(CR_ARME), 'i'], [1, pose(CR_LANCE)]],
  tient:[[0, pose(CR_LANCE), 'io'], [.06, pose(CR_TIENT), 'lin'], [1, pose(CR_TIENT)]],
  farine:[[0, pose(CR_TIENT), 'io'], [.3, pose({}), 'lin'], [1, pose({})]],
  retour:[[0, pose(CR_TIENT), 'io'], [1, pose({})]]
};
/* ---------- LA CAPE : il se ramasse sous sa cape… et l'ouvre d'un grand geste : les torches s'éteignent ---------- */
var CA_PREND = {torse:16, bas:14, tete:18, bAv:[24, 112, 0], bAr:[34, 112, 0]};
var CA_OUVRE = {torse:-12, bas:6, tete:-8, bAv:[150, 12, 0], bAr:[-118, 18, 0]};
PISTES.cape = {
  prise:[[0, pose({}), 'io'], [1, pose(CA_PREND)]],
  elan:[[0, pose(CA_PREND), 'lin'], [.7, pose(CA_PREND), 'o'], [1, pose(CA_OUVRE)]],
  retour:[[0, pose(CA_OUVRE), 'io'], [1, pose({})]]
};

/* ============================================================================ LA PHASE 3 : LÉO SOUS LA POTION (Romain, 15 novembre)
   « Toutes les attaques, il n'y a absolument rien qui va. On comprend rien […] je veux vraiment des animations très très
   travaillées […] une animation très précise pour chaque sort qu'il fait, pour qu'on comprenne bien. » Même façon que la phase 2 :
   chaque attaque a sa préparation (qu'on voit venir), son coup, son retour ; son nom s'affiche avec la jauge (ANNONCES). */
var G3 = {torse:11, tete:5, bas:14, bassin:4, bAv:[-24, 42, -6], bAr:[32, 48, 0], pAv:[206, 318], pAr:[96, 318]};      /* voûté, les bras écartés */
function pose3(o){ var r = pose(G3), k; for(k in o) r[k] = o[k]; return r; }
/* ---------- LE GROS COUP DE POING : il recule son poing très loin (il rougeoie, il tremble), puis il bondit et frappe ---------- */
var ARME3 = {torse:-17, bas:22, bassin:-6, tete:2, bAv:[-98, 130, -10], bAr:[72, 52, 0], pAv:[224, 318], pAr:[92, 318]};
var FRAPPE3 = {x:'cible', torse:30, bas:16, bassin:8, tete:10, bAv:[100, 2, 0], bAr:[-40, 50, 0], pAv:[176, 318], pAr:[60, 318]};
PISTES.poing3 = {
  prise:[[0, pose3({}), 'io'], [1, pose3(ARME3)]],
  elan:[[0, pose3(ARME3), 'io'], [.5, pose3({torse:-22, bas:27, bassin:-7, tete:0, bAv:[-108, 136, -10], bAr:[78, 46, 0], pAv:[226, 318], pAr:[92, 318]}), 'lin'],
    [.82, pose3({torse:-24, bas:28, bassin:-7, tete:0, bAv:[-112, 138, -10], bAr:[80, 44, 0], pAv:[226, 318], pAr:[92, 318]}), 'i'], [1, pose3(FRAPPE3)]],
  retour:[[0, pose3(FRAPPE3), 'lin'], [.35, pose3({x:'cible', torse:27, bas:16, bassin:8, tete:10, bAv:[96, 8, 0], bAr:[-36, 50, 0], pAv:[176, 318], pAr:[60, 318]}), 'io'], [1, pose3({})]]
};
/* ---------- LA RAFALE : la garde du boxeur (il sautille), il fonce, et les coups pleuvent, gauche, droite, gauche, droite ---------- */
var BOXE = {torse:6, bas:16, tete:6, bAv:[62, 112, 0], bAr:[72, 112, 0]};
var DIRECT_A = {x:'cible', torse:26, bas:16, tete:8, bAv:[100, 4, 0], bAr:[44, 120, 0], pAv:[178, 318], pAr:[66, 318]};
var DIRECT_B = {x:'cible', torse:19, bas:16, tete:8, bAv:[52, 122, 0], bAr:[106, 6, 0], pAv:[178, 318], pAr:[66, 318]};
var BOXE_C = {x:'cible', torse:14, bas:17, tete:6, bAv:[52, 122, 0], bAr:[66, 120, 0], pAv:[178, 318], pAr:[66, 318]};      /* devant sa proie, les poings armés */
var CROCHET_FIN = {x:'cible', torse:32, bas:18, tete:10, bAv:[52, 122, 0], bAr:[112, 0, 0], pAv:[178, 318], pAr:[60, 318]};       /* le dernier coup, le plus lourd */
PISTES.rafale = {
  prise:[[0, pose3({}), 'io'], [.4, pose3(BOXE), 'io'], [1, pose3(BOXE)]],
  elan:[[0, pose3(BOXE), 'io'], [.5, pose3(BOXE), 'i'], [.84, pose3(BOXE_C), 'o'], [1, pose3(BOXE_C)]],
  /* coups : fabriquée au premier besoin (pisteCoups), un direct par coup des règles */
  retour:[[0, pose3(CROCHET_FIN), 'lin'], [.3, pose3({x:'cible', torse:10, bas:14}), 'io'], [1, pose3({})]]
};
/* (15 novembre, 13 h 54 : seize coups, comptés par les règles — gauche, droite, gauche, droite… ; chaque direct est tendu au moment
   exact où les règles frappent ; le seizième est un crochet, plus lourd) */
function pisteCoups(){
  var N = (window.LeoRegles && window.LeoRegles.L.ATTAQUES.rafale.coups) || 16, l = [[0, pose3(BOXE_C), 'o']];
  for(var i = 0; i < N; i++) l.push([(i + 1) / N, pose3(i === N - 1 ? CROCHET_FIN : i % 2 ? DIRECT_B : DIRECT_A), 'o']);
  return l;
}
/* ---------- LE HURLEMENT : il se redresse et aspire tout l'air de la salle (la poitrine gonflée, la tête en arrière)… puis il se
   plie en avant et hurle : les ondes du cri traversent la salle ---------- */
var INSPIRE = {torse:-18, bas:6, bassin:-4, tete:-26, bAv:[-60, 30, 0], bAr:[-40, 36, 0]};
var INSPIRE2 = {torse:-23, bas:4, bassin:-5, tete:-33, bAv:[-74, 34, 0], bAr:[-54, 40, 0]};
var HURLE = {torse:27, bas:24, bassin:8, tete:14, bAv:[-52, 72, 0], bAr:[-32, 78, 0], pAv:[214, 318], pAr:[86, 318]};
PISTES.hurlement = {
  prise:[[0, pose3({}), 'io'], [.6, pose3(INSPIRE), 'io'], [1, pose3(INSPIRE2)]],
  elan:[[0, pose3(INSPIRE2), 'o'], [.13, pose3(HURLE), 'lin'], [1, pose3({torse:30, bas:26, bassin:8, tete:16, bAv:[-58, 76, 0], bAr:[-38, 82, 0], pAv:[214, 318], pAr:[86, 318]})]],
  retour:[[0, pose3(HURLE), 'io'], [.4, pose3({torse:16, bas:16}), 'io'], [1, pose3({})]]
};
/* ---------- IL ATTRAPE UN HÉROS : la main grande ouverte, il fonce, l'empoigne, le soulève… et s'en sert pour frapper le voisin ---------- */
var GUET = {torse:22, bas:26, bassin:8, tete:8, bAv:[72, 30, 0], bAr:[-30, 60, 0], pAv:[216, 318], pAr:[88, 318]};
/* (15 novembre, 13 h 54 — Romain : « il saute, il attrape, il revient en arrière, et là, il tape quelqu'un » ; « là, c'est pas clair
   quand il s'en sert pour frapper un autre ») : il fonce et l'empoigne (elan) ; il revient à sa place en le tenant à bout de bras,
   arme son coup — tout le monde voit ce qui vient — et l'abat sur le second (porte) ; puis il se redresse (retour). */
var EMPOIGNE = {x:'cible', torse:-6, bas:8, tete:-8, bAv:[152, 18, 0], bAr:[10, 60, 0], pAv:[190, 318], pAr:[72, 318]};
var TIENT_HAUT = {torse:-12, bas:8, tete:-8, bAv:[160, 14, 0], bAr:[16, 58, 0]};
var ARME_JET = {torse:-20, bas:18, bassin:-6, tete:-4, bAv:[178, 22, 0], bAr:[44, 50, 0], pAv:[222, 318], pAr:[92, 318]};
var ABAT = {x:'cible2', torse:42, bas:24, bassin:10, tete:14, bAv:[58, 8, 0], bAr:[-24, 60, 0], pAv:[184, 318], pAr:[66, 318]};
PISTES.attrape = {
  prise:[[0, pose3({}), 'io'], [1, pose3(GUET)]],
  elan:[[0, pose3(GUET), 'i'], [.5, pose3({x:'cible', torse:26, bas:22, bassin:8, tete:8, bAv:[86, 12, 0], bAr:[-30, 60, 0], pAv:[190, 318], pAr:[70, 318]}), 'o'],
    [.64, pose3({x:'cible', torse:31, bas:20, bassin:8, tete:10, bAv:[98, 0, 0], bAr:[-34, 60, 0], pAv:[186, 318], pAr:[66, 318]}), 'io'],
    [1, pose3(EMPOIGNE)]],
  porte:[[0, pose3(EMPOIGNE), 'io'], [.4, pose3(TIENT_HAUT), 'io'], [.68, pose3(ARME_JET), 'lin'], [.87, pose3(ARME_JET), 'i'], [1, pose3(ABAT)]],
  retour:[[0, pose3(ABAT), 'lin'], [.3, pose3(ABAT), 'io'], [1, pose3({})]]
};
/* ---------- LE SOUFFLE DE FEU : il aspire (une braise grossit dans sa gorge)… puis se penche et crache un long jet de flammes ---------- */
var CRACHE = {torse:30, bas:26, bassin:8, tete:10, bAv:[-56, 60, 0], bAr:[-36, 66, 0], pAv:[216, 318], pAr:[86, 318]};
PISTES.souffle = {
  prise:[[0, pose3({}), 'io'], [.55, pose3(INSPIRE), 'io'], [1, pose3(INSPIRE2)]],
  elan:[[0, pose3(INSPIRE2), 'o'], [.12, pose3(CRACHE), 'lin'], [1, pose3(CRACHE)]],
  retour:[[0, pose3(CRACHE), 'io'], [.35, pose3({torse:14, bas:16, tete:8}), 'io'], [1, pose3({})]]
};
/*§V3*/VISAGES.poing3 = {prise:[[0, 'effort']], elan:[[0, 'effort'], [.84, 'cri']], retour:[[0, 'cri'], [.5, 'rictus']]};
VISAGES.rafale = {prise:[[0, 'rictus']], elan:[[0, 'effort']], coups:[[0, 'cri']], retour:[[0, 'rictus']]};
VISAGES.hurlement = {prise:[[0, 'souffle']], elan:[[0, 'souffle'], [.1, 'cri']], retour:[[0, 'rictus']]};
VISAGES.attrape = {prise:[[0, 'rictus']], elan:[[0, 'effort']], porte:[[0, 'rictus'], [.66, 'effort'], [.9, 'cri']], retour:[[0, 'cri'], [.4, 'rictus']]};
VISAGES.souffle = {prise:[[0, 'souffle']], elan:[[0, 'souffle'], [.1, 'cri']], retour:[[0, 'aah'], [.5, 'rictus']]};
function visage(X, etape, att, k, dt){
  var C = corps(X), v = 'colere';
  if(X.douleur > 0){ X.douleur -= dt; }
  var V2 = VISAGES[att] && VISAGES[att][etape];
  if((etape === 'prise' || etape === 'elan' || etape === 'retour' || etape === 'coups' || etape === 'porte') && V2){ for(var i = 0; i < V2.length; i++) if(k >= V2[i][0]) v = V2[i][1]; }
  else if(etape === 'sonne' || etape === 'sol') v = 'ko';
  else if(etape === 'repos') v = Math.sin(X.temps * .5) > .82 ? 'rictus' : 'colere';
  if(X.douleur > 0 && v !== 'boit' && v !== 'ko') v = 'douleur';
  if(X.brule && v === 'colere') v = 'douleur';
  C.visage(v);
}

/* ============================================================================ CE QUI SE RÉPÈTE PENDANT UNE ÉTAPE */
function plus(X, p, etape, att, k, t, Z, c){
  var dur = X.duree;
  /* (phase 1) le fléau tournoie au-dessus de sa tête : trois tours, de plus en plus vite ; le marteau et la meule : il tremble sous le poids */
  if(att === 'fleau' && etape === 'elan' && k > .2 && k < .82){ var uf = (k - .2) / .62; p.aa = 180 + uf * uf * 1080; if(p.bAv) p.bAv[0] += Math.sin(uf * uf * 18.85) * 5; }
  if((att === 'marteau' || att === 'meule') && etape === 'elan' && k > .4 && k < .82){ p.x += Math.sin(t * 52) * 1.2; p.torse += Math.sin(t * 9) * 1.4; }
  if(att === 'charge' && etape === 'elan'){
    /* il racle le sol avec le pied de derrière, encore et encore ; tout le corps se balance (le taureau va charger) */
    var per = .62, u = ((k * dur) % per) / per, lev = Math.sin(Math.min(1, u * 1.6) * Math.PI);
    p.pAv = [p.pAv[0] + 30 * u - 12, p.pAv[1] - 12 * Math.max(0, lev)];
    p.torse += Math.sin(u * Math.PI * 2) * 3; p.x += Math.sin(u * Math.PI * 2) * 3;
    var n = Math.floor(k * dur / per);
    if(n !== X.racle){ X.racle = n; racleSol(X); }
    /* et il part : les dernières 0,24 seconde, il fonce (ou il glisse, s'il y a de l'huile) */
    var reste = (1 - k) * dur;
    if(reste < .24){
      var v = 1 - reste / .24;
      if(c.leo.flaque > c.t){ p = glisseDebut(p, v); X.glisse = true; }
      else { p.x = X.cibleX * COURBES.i(v); p.torse = 36; p.tete = 6; p.bas = 18; p.bAv = [-50, 80, 0]; p.bAr = [70, 30, 0]; p.pAv = [214 + 40 * v, 318 - 10 * v]; p.pAr = [70, 318]; }
      if(!X.parti){ X.parti = true; vitesse(X); }
    }
  }
  if(att === 'gourde' && etape === 'elan' && k > .16){
    /* glou… glou… glou… : la tête et la gorge, à chaque gorgée */
    var g = ((k - .16) * dur) / .34, ng = Math.floor(g), ug = g - ng;
    p.tete += -6 * Math.sin(Math.min(1, ug * 1.4) * Math.PI);
    if(ng !== X.glou){ X.glou = ng; glou(X, ng); }
  }
  if(att === 'sifflet' && etape === 'elan'){ p.x += Math.sin(t * 40) * 1.2; p.tete += Math.sin(t * 33) * 1.5; }
  if(att === 'poing' && etape === 'elan'){ p.x += Math.sin(t * 50) * k * 1.6; }
  if(att === 'faux' && etape === 'elan'){ p.x += Math.sin(t * 46) * k * 1.4; }
  if(att === 'saut' && etape === 'prise'){ p.x += Math.sin(t * 52) * k * 2; }
  /* la phase 3 : le poing qui tremble d'être retenu, le boxeur qui sautille, le corps qui vibre quand il hurle ou crache */
  if(att === 'poing3' && etape === 'elan' && k < .82){ p.x += Math.sin(t * 54) * (.6 + k * 2.2); p.bAv = [p.bAv[0] + Math.sin(t * 47) * 2, p.bAv[1], p.bAv[2]]; }
  if(att === 'rafale' && etape === 'prise'){ var sr = Math.abs(Math.sin(t * 11)); p.y = -7 * sr; p.bas = Math.max(0, p.bas - 5 * sr); }
  if((att === 'hurlement' || att === 'souffle') && etape === 'elan' && k > .12){ p.x += Math.sin(t * 58) * 1.6; p.tete += Math.sin(t * 6) * 3; }
  if((att === 'hurlement' || att === 'souffle') && etape === 'prise'){ p.souffle = 0; p.torse -= Math.sin(t * 30) * .6 * k; }
  return p;
}
function glisseDebut(p, v){
  /* les pieds partent en avant, il bascule en arrière */
  var q = LC.melange(p, LC.complete(pose({r:-40, x:-120, y:-30, torse:-20, tete:-24, bAv:[160, 30, 0], bAr:[170, 20, 0], jAv:[70, 10], jAr:[80, 20]})), COURBES.o(v));
  return q;
}

/* ============================================================================ LES REPÈRES : à tel moment de l'étape, une seule fois */
function une(X, nom, k, seuil){ if(k >= seuil && !X.faits[nom]){ X.faits[nom] = 1; return true; } return false; }
function reperes(X, etape, att, k, c){
  var C = corps(X), Z = c.leo, d = X.duree;
  if(att === 'sifflet'){
    if(etape === 'prise' && une(X, 's1', k, .45)) C.objet('sifflet', 'main');
    if(etape === 'elan' && une(X, 's2', k, 0)){ bruit(X, 'leoSifflet', {cale:d * .55}, ['magie']); notes(X, d); C.main('Ar', 'ouvert'); }
    if(etape === 'retour' && une(X, 's3', k, 0)) C.objet('sifflet', 'cou');
    if(etape === 'retour' && une(X, 's4', k, .7)) C.main('Ar', 'poing');
  }
  if(att === 'poing' && etape === 'elan' && une(X, 'p1', k, 0)){ lueurPoing(X, d); bruit(X, 'leoPoing', {cale:d}, ['bong']); alerte(X, '!', '#ffb050'); }
  if(att === 'faux'){
    if(etape === 'prise' && une(X, 'f0', k, .1)) alerte(X, '!', '#ff6a5a');
    if(etape === 'prise' && une(X, 'f1', k, .45)){ C.objet('faux', 'main'); bruit(X, 'leoFauxTire', {}, ['metal']); eclatLame(X, .5); }
    if(etape === 'prise' && une(X, 'f2', k, .82)) C.devantAr(true);
    if(etape === 'elan' && une(X, 'f3', k, 0)){ lueurLame(X, d); dangerSol(X, d, '#ff4a4a'); }
    if(etape === 'elan' && une(X, 'f4', k, .25)) bruit(X, 'leoFaux', {version:'B', cale:(1 - .25) * d}, ['metal']);
    if(etape === 'retour' && une(X, 'f5', k, .5)) C.devantAr(false);
    if(etape === 'retour' && une(X, 'f6', k, .62)){ C.objet('faux', 'dos'); son(X, 'clic'); }
  }
  if(att === 'charge'){
    if(etape === 'prise' && une(X, 'c0', k, 0)){ X.parti = false; X.glisse = false; X.racle = -1; X.cibleX = cibleX(X, Z); alerte(X, '!', '#ff6a5a'); naseaux(X); }
    if(etape === 'prise' && une(X, 'c1', k, .6)) naseaux(X);
    if(etape === 'elan'){ var n = Math.floor(k * d / .9); if(n !== X.naseau){ X.naseau = n; naseaux(X); } }
    if(etape === 'elan' && une(X, 'c2', k, 0)) bruit(X, 'leoCharge', {cale:d}, ['tombe']);
  }
  if(att === 'lancer'){
    if(etape === 'elan' && une(X, 'l1', k, .28)){ C.objet('rat', 'main'); bruit(X, 'leoSac', {}, ['couine']); }
    if(etape === 'elan' && une(X, 'l2', k, 0)) bruit(X, 'leoLancer', {cale:d}, ['vole']);
  }
  if(att === 'gourde'){
    if(etape === 'prise' && une(X, 'g1', k, .42)){ C.objet('gourde', 'main'); C.objet('bouchon', true); son(X, 'clic'); X.gourdePerdue = false; }
    if(etape === 'prise' && une(X, 'g2', k, .86)){ C.objet('bouchon', false); bouchon(X); }
    if(etape === 'elan' && une(X, 'g3', k, .12)){ X.glou = -1; flot(X); halo(X, d); }
    if(etape === 'retour' && une(X, 'g4', k, .5)){ C.objet('gourde', 'ceinture'); C.objet('bouchon', true); }
  }
  /* ---------- la phase 1 ---------- */
  if(att === 'fleau' || att === 'marteau' || att === 'meule' || att === 'crochet'){
    if(etape === 'prise' && une(X, 'w0', k, 0)){ X.cibleX = cibleX(X, Z); alerte(X, '!', '#ff6a5a'); if(att === 'crochet') bruit(X, 'leoFarine', {}, ['vole']); }
    if(etape === 'prise' && une(X, 'w1', k, att === 'crochet' ? .56 : att === 'meule' ? .34 : .38)){ C.arme(att); bruit(X, 'leoMuscles', {}, null); }
    if(etape === 'elan' && une(X, 'w2', k, 0)) bruit(X, att === 'fleau' ? 'leoFleau' : att === 'marteau' ? 'leoMarteau' : att === 'meule' ? 'leoMeule' : 'leoCrochet', {cale:d}, null);
    if(etape === 'elan' && att !== 'meule' && une(X, 'w3', k, att === 'crochet' ? .72 : .84)) vitesse(X);
    if(etape === 'retour' && une(X, 'w4', k, .55)) C.arme(null);
  }
  if(att === 'cape'){
    if(etape === 'prise' && une(X, 'k0', k, 0)) alerte(X, '!', '#b9a8ff');
    if(etape === 'elan' && une(X, 'k1', k, 0)) bruit(X, 'leoCape', {cale:d}, ['magie']);
  }
  /* ---------- la phase 3 ---------- */
  if(att === 'poing3' || att === 'rafale' || att === 'attrape'){
    if(etape === 'prise' && une(X, 'q0', k, 0)){ X.cibleX = cibleX(X, Z); X.cibleH = Z.cibles && Z.cibles[0]; alerte(X, '!', '#ff6a5a'); bruit(X, 'leoMuscles', {}, null); if(att === 'attrape') C.main('Av', 'ouvert'); }
  }
  if(att === 'poing3'){
    if(etape === 'prise' && une(X, 'q1', k, .25)) lueurPoing(X, d * .75 + ((window.LeoRegles && window.LeoRegles.L.ATTAQUES.poing3.elan) || .8));
    if(etape === 'elan' && une(X, 'q2', k, .3)) poussiereTourne(X);
    if(etape === 'elan' && une(X, 'q3', k, .8)){ vitesse(X); bruit(X, 'leoPoing', {cale:d * .2}, ['bong']); }
  }
  if(att === 'rafale'){
    if(etape === 'prise' && une(X, 'r0', k, .4)) poussiereTourne(X);
    if(etape === 'elan' && une(X, 'r1', k, .5)) vitesse(X);
  }
  if(att === 'hurlement'){
    if(etape === 'prise' && une(X, 'h0', k, .05)){ aspire(X, d * .9); bruit(X, 'leoNaseaux', {}, null); }
    if(etape === 'elan' && une(X, 'h1', k, .1)){ ondesCri(X, d * .9); bruit(X, 'leoHurlement', {}, ['rugit']); }
  }
  if(att === 'attrape'){
    if(etape === 'elan' && une(X, 'a1', k, .2)) vitesse(X);
    if(etape === 'porte' && une(X, 'a3', k, .6)){ alerte(X, '!', '#ff6a5a'); bruit(X, 'leoMuscles', {}, null); }
    if(etape === 'porte' && une(X, 'a4', k, .88)) vitesse(X);
  }
  if(att === 'souffle'){
    if(etape === 'prise' && une(X, 's0', k, .05)){ aspire(X, d * .9, 'linear-gradient(90deg,rgba(255,170,60,0),#ffb050)'); braise(X, d); bruit(X, 'leoNaseaux', {}, null); }
    if(etape === 'elan' && une(X, 's1', k, .1)){ jetDeFlammes(X, d * .92); bruit(X, 'leoSouffle', {}, ['feu']); }
    if(etape === 'retour' && une(X, 's2', k, .05)) fumeeBouche(X);
  }
  if(att === 'saut'){
    if(etape === 'prise' && une(X, 'j0', k, 0)){ poussiereTourne(X); cibleSaut(X, d + ((window.LeoRegles && window.LeoRegles.L.ATTAQUES.saut.elan) || 1.5)); }
    if(etape === 'prise' && une(X, 'j0b', k, .5)) poussiereTourne(X);
    if(etape === 'elan' && une(X, 'j1', k, .06)){ decollage(X); bruit(X, 'leoSaut', {cale:d * .88}, ['tombe']); }
  }
}
function xDevant(X, h){ var x = h ? X.ctx.hCx(h) : X.ctx.hCx('alchimiste'); return Math.min(-120, (x + 110) - X.ctx.LX); }
function cibleX(X, Z){
  /* la charge : il fonce jusque devant le héros visé */
  return xDevant(X, Z.cibles && Z.cibles[0]);
}
/* ---------- LE HÉROS PORTÉ (« il attrape ») : il suit la main de Léo, image par image ; lâché, il retombe à sa place ---------- */
function porter(X, h){
  var s = X.ctx.slot && X.ctx.slot(h); if(!s) return;
  var o = X.ctx.hPt(h), t = 0;
  if(X.porte) lacher(X);
  X.porte = {h:h, el:s};
  s.style.transition = 'none'; s.style.willChange = 'transform'; s.style.zIndex = '6';
  suivre(X, {maj:function(dt){
    if(!X.porte || X.porte.h !== h) return false;
    t += dt;
    var p = sc(X, 'mainAv', 197, 246), u = Math.min(1, t / .16);
    s.style.transform = 'translate(' + ((p.x - o.x - 6) * u).toFixed(1) + 'px,' + ((p.y - o.y + 38) * u).toFixed(1) + 'px) rotate(' + (-20 * u).toFixed(1) + 'deg)';
  }});
}
function lacher(X){
  var P = X.porte; if(!P) return; X.porte = null;
  var s = P.el, de = s.style.transform || 'translate(0px,0px) rotate(0deg)';
  s.style.transform = ''; s.style.zIndex = '';
  anim(s, [{transform:de}, {transform:'translate(0px,-26px) rotate(0deg)', offset:.6, easing:'ease-in'}, {transform:'translate(0px,0px) rotate(0deg)'}], {duration:360, easing:'ease-out'});
  setTimeout(function(){ try{ s.style.willChange = ''; }catch(e){} }, 420);
}
/* le second, frappé de plein fouet : « il valdingue en l'air » — il décolle, fait un tour complet, retombe à sa place */
function valdingue(X, h){
  var s = X.ctx.slot && X.ctx.slot(h); if(!s) return;
  anim(s, [{transform:'translate(0px,0px) rotate(0deg)'}, {transform:'translate(-40px,-150px) rotate(-150deg)', offset:.3, easing:'ease-out'}, {transform:'translate(-60px,-178px) rotate(-240deg)', offset:.48, easing:'ease-in'},
    {transform:'translate(-24px,0px) rotate(-360deg)', offset:.8, easing:'ease-out'}, {transform:'translate(-24px,-12px) rotate(-360deg)', offset:.9, easing:'ease-in'}, {transform:'translate(0px,0px) rotate(-360deg)'}], {duration:900});
}
function frappeAvec(X, ev){
  var ctx = X.ctx, Fx = ctx.Fx, q = ev.autre ? ctx.hPt(ev.autre) : (ev.pris ? ctx.hPt(ev.pris) : {x:300, y:220});
  lacher(X);
  if(ev.autre) valdingue(X, ev.autre);
  Fx.eclat(q.x + 20, q.y, ev.mortel ? 320 : 240, 'radial-gradient(closest-side,#fff,rgba(255,225,150,.95) 32%,rgba(255,110,40,.5) 60%,rgba(255,110,40,0))', 400);
  Fx.onde(q.x + 10, q.y + 60, '#ffe2b0', 280, 420); Fx.tremble(10, 300); Fx.mot(q.x + 30, Math.max(100, q.y - 124), 'PAF !', 'croc');
  bruit(X, 'leoPoing', {}, ['bong']);
}

/* ============================================================================ LES ÉVÈNEMENTS DES RÈGLES */
function evenement(X, ev, c){
  var C = corps(X), ctx = X.ctx;
  if(ev.t === 'leo'){
    if(ev.quoi === 'impact') return impact(X, ev, c);
    /* la rafale, coup par coup ; le héros empoigné, porté, puis abattu sur son voisin */
    if(ev.quoi === 'coups'){ X.cibleH = ev.heros; X.coupVu = 0; bruit(X, 'leoRafale', {}, ['bong']); return true; }
    if(ev.quoi === 'coup'){ X.coupVu = ev.k; coupRafale(X, ev.k, ev.n, ev.heros); return true; }
    if(ev.quoi === 'porte'){ X.cibleX2 = ev.autre ? xDevant(X, ev.autre) : X.cibleX; porter(X, ev.heros); C.main('Av', 'poing'); bruit(X, 'leoAttrape', {}, ['bong']); return true; }
    if(ev.quoi === 'frappe-avec'){ frappeAvec(X, ev); return true; }
    if(ev.quoi === 'lache'){ lacher(X); return true; }
    if(ev.quoi === 'coupe'){ coupe(X, ev); return true; }
    if(ev.quoi === 'glisse'){ glisse(X); return true; }
    if(ev.quoi === 'debout'){ bruit(X, 'leoMuscles', {}, ['tombe']); var pd = sc(X, 'piedAr', 120, 330); ctx.Fx.onde(pd.x + 60, 330, '#d8c8a8', 260, 500); return true; }
    if(ev.quoi === 'ebloui'){ var pe = ctx.leo.ancre('haut'); ctx.Fx.mot(pe.x, Math.max(100, pe.y), 'Ébloui !', 'refus'); X.douleur = ev.duree; return true; }
    return true;                                   /* (prise, élan, retour, repos : la pose suit toute seule) */
  }
  if(ev.t === 'leo-etat'){
    if(ev.nom === 'brule'){ brule(X, ev.on); return true; }
    if(ev.nom === 'saigne' && ev.on && p3(X)){ entaille(X, ev.n || 1); return false; }      /* (l'état « 🩸 » s'affiche comme avant) */
    return false;
  }
  if(ev.t === 'degats' && ev.cible === 'leo' && ev.n > 0 && !ev.coule){ X.flinch = 1; X.flinchF = ev.n >= 150 ? 1.6 : 1; X.douleur = .35; return false; }
  if(ev.t === 'soin-leo'){ gueri(X, ev); return true; }
  return false;
}
function impact(X, ev, c){
  var ctx = X.ctx, att = ev.att, C = corps(X), Fx = ctx.Fx, l = ev.cibles || [];
  if(att === 'sifflet'){ var m = ctx.leo.ancre('bouche'); Fx.onde(m.x - 10, m.y, '#ffe9a0', 300, 600); return true; }
  if(att === 'poing'){ souffleAir(X, l); Fx.tremble(10, 320); return true; }
  if(att === 'faux'){ fauche(X, l); Fx.tremble(9, 300); return true; }
  if(att === 'charge'){
    var h = l[0]; if(h){ var p = ctx.hPt(h); Fx.eclat(p.x + 30, p.y, 220, 'radial-gradient(closest-side,#fff,rgba(255,220,150,.9) 35%,rgba(255,120,60,0))', 360); Fx.etincelles(p.x + 20, p.y, 14, null, 1.1); }
    Fx.tremble(14, 420); bruit(X, 'leoPoing', {}, ['bong']);
    return true;
  }
  if(att === 'lancer'){ lancerRat(X, l[0]); C.objet('rat', null); return true; }
  if(att === 'saut'){ finCibleSaut(X); atterrit(X); return true; }
  if(att === 'gourde') return true;                     /* (le soin arrive avec « soin-leo ») */
  /* ---------- la phase 1 ---------- */
  if(att === 'fleau' || att === 'marteau'){
    l.forEach(function(h, i){ var q1 = ctx.hPt(h); setTimeout(function(){ try{ Fx.eclat(q1.x + 24, q1.y - 4, att === 'marteau' ? 280 : 220, 'radial-gradient(closest-side,#fff,rgba(255,225,150,.95) 32%,rgba(255,120,50,.5) 60%,rgba(255,120,50,0))', 380); Fx.onde(q1.x + 10, q1.y + 110, '#d8c8a8', att === 'marteau' ? 300 : 220, 460); }catch(e){} }, i * 70); });
    var q0 = l[0] ? ctx.hPt(l[0]) : {x:300, y:220};
    Fx.tremble(10, 300); Fx.mot(q0.x + 40, Math.max(100, q0.y - 120), att === 'marteau' ? 'BONG !' : 'PAF !', 'croc');
    return true;
  }
  if(att === 'meule'){
    /* la meule quitte ses mains et roule sur les trois héros */
    C.arme(null);
    var D1 = LC.DESSINS, m0 = sc(X, 'mainAv', 197, 246), me = el('leo-meule', '<svg viewBox="-78 6 156 150" width="132" height="127" aria-hidden="true" style="overflow:visible">' + LC.DEFS + D1.meule.svg + '</svg>', calque(X));
    me.style.left = (m0.x - 66) + 'px'; me.style.top = '222px';
    anim(me, [{transform:'translate(0px,' + (m0.y - 290).toFixed(0) + 'px) rotate(0deg)'}, {transform:'translate(-120px,0px) rotate(-140deg)', offset:.16, easing:'linear'}, {transform:'translate(' + (-m0.x - 160).toFixed(0) + 'px,0px) rotate(-1040deg)'}], {duration:820, easing:'ease-in', fill:'both'});
    retirer(me, 860); Fx.tremble(8, 300);
    return true;
  }
  if(att === 'crochet'){
    /* la chaîne file hors du nuage, jusqu'au héros */
    if(l[0]){ var ch = el('leo-chaine', null, calque(X)), x1 = ctx.hCx(l[0]) + 20, x2 = ctx.leo.ancre('centre').x - 40; ch.style.left = x1 + 'px'; ch.style.width = Math.max(10, x2 - x1) + 'px'; ch.style.top = '214px'; retirer(ch, 380); }
    return true;
  }
  if(att === 'cape') return true;                        /* (les torches s'éteignent : « noir ») */
  /* ---------- la phase 3 ---------- */
  if(att === 'poing3'){
    var h3 = l[0], q3 = h3 ? ctx.hPt(h3) : {x:300, y:220};
    Fx.eclat(q3.x + 26, q3.y - 6, 300, 'radial-gradient(closest-side,#fff,rgba(255,225,150,.95) 30%,rgba(255,110,40,.5) 60%,rgba(255,110,40,0))', 420); Fx.etincelles(q3.x + 20, q3.y, 18, null, 1.3);
    Fx.onde(q3.x + 20, q3.y, '#ffe2b0', 300, 420); Fx.tremble(18, 520); Fx.mot(q3.x + 40, Math.max(100, q3.y - 120), 'PAF !', 'croc');
    return true;
  }
  if(att === 'rafale') return true;                      /* (les coups arrivent un par un : « coup ») */
  if(att === 'hurlement'){ Fx.tremble(10, 300); return true; }
  if(att === 'attrape') return true;                     /* (il l'empoigne : « porte » ; il frappe : « frappe-avec ») */
  if(att === 'souffle'){ return true; }                  /* (les flammes sont déjà là ; les héros prennent feu avec « etat ») */
  return false;
}

/* ============================================================================ LES EFFETS
   (RAPIDITE.md : seulement transform et opacity ; des trajectoires calculées une fois ; tout est retiré à la fin) */
function calque(X){ return X.ctx.fx; }
function garde(X, e){ X.fx.push(e); return e; }
/* un « ! » au-dessus de sa tête : il prépare quelque chose */
function alerte(X, t, coul){
  var p = X.ctx.leo.ancre('haut'), e = el('lp-alerte', t, calque(X));
  e.style.left = (p.x + 14) + 'px'; e.style.top = Math.max(60, p.y - 10) + 'px'; e.style.color = coul;
  anim(e, [{transform:'translate(-50%,0) scale(.2)', opacity:0}, {transform:'translate(-50%,-14px) scale(1.25)', opacity:1, offset:.25}, {transform:'translate(-50%,-18px) scale(1)', opacity:1, offset:.8}, {transform:'translate(-50%,-24px) scale(1)', opacity:0}], {duration:900, easing:'ease-out'});
  retirer(e, 950);
}
/* le sifflet : des notes et des ondes qui partent de sa bouche, vers ses rats */
function notes(X, d){
  var n = Math.max(3, Math.round(d / .18)), ctx = X.ctx;
  for(var i = 0; i < n; i++) (function(i){
    setTimeout(function(){
      var m = ctx.leo.ancre('bouche'), e = el('lp-note', i % 2 ? '♫' : '♪', calque(X));
      e.style.left = (m.x - 12) + 'px'; e.style.top = (m.y - 8) + 'px';
      var dx = -60 - Math.random() * 90, dy = -30 - Math.random() * 60;
      anim(e, [{transform:'translate(0,0) scale(.5) rotate(0deg)', opacity:0}, {transform:'translate(' + dx * .3 + 'px,' + dy * .4 + 'px) scale(1.2) rotate(-10deg)', opacity:1, offset:.2}, {transform:'translate(' + dx + 'px,' + dy + 'px) scale(1) rotate(12deg)', opacity:0}], {duration:900, easing:'ease-out'});
      retirer(e, 950);
      if(i % 2 === 0) ctx.Fx.onde(m.x - 16, m.y, 'rgba(255,233,160,.8)', 120, 500);
    }, i * 180);
  })(i);
}
/* le poing qui rougeoie pendant qu'il l'arme */
function lueurPoing(X, d){
  var e = garde(X, el('lp-lueur', null, calque(X))), C = corps(X), t = 0;
  suivre(X, {etape:true, maj:function(dt){ t += dt; var p = sc(X, 'mainAv', 197, 246); e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + (.5 + Math.min(1, t / d) * .9).toFixed(3) + ')'; e.style.opacity = String(Math.min(1, t / (d * .5))); }, fin:function(){ e.remove(); }});
}
/* le coup de poing : un souffle d'air qui file au ras des trois héros (il fait sauter leurs boucliers) */
function souffleAir(X, l){
  var ctx = X.ctx, p = sc(X, 'mainAv', 197, 246), e = el('lp-souffle', '<i></i><i></i><i></i>', calque(X));
  e.style.left = p.x + 'px'; e.style.top = (p.y - 70) + 'px';
  var dx = 60 - p.x;
  anim(e, [{transform:'translateX(0) scaleX(.3)', opacity:0}, {transform:'translateX(' + dx * .15 + 'px) scaleX(1)', opacity:1, offset:.15}, {transform:'translateX(' + dx + 'px) scaleX(1.3)', opacity:0}], {duration:420, easing:'ease-out'});
  retirer(e, 460);
  ctx.Fx.eclat(p.x, p.y, 160, 'radial-gradient(closest-side,#fff,rgba(255,210,140,.9) 35%,rgba(255,140,60,0))', 300);
}
/* la faux : le reflet qui court sur la lame pendant qu'il l'arme */
function eclatLame(X, ms){
  var p = sc(X, 'faux@main', -96, 178), e = el('lp-eclat', '✦', calque(X)); e.style.left = p.x + 'px'; e.style.top = p.y + 'px';
  anim(e, [{transform:'translate(-50%,-50%) scale(0) rotate(0)', opacity:0}, {transform:'translate(-50%,-50%) scale(1.6) rotate(90deg)', opacity:1, offset:.4}, {transform:'translate(-50%,-50%) scale(0) rotate(180deg)', opacity:0}], {duration:ms * 1000});
  retirer(e, ms * 1000 + 50);
}
function lueurLame(X, d){
  var e = garde(X, el('lp-eclat lp-eclat-l', '✦', calque(X))), t = 0;
  suivre(X, {etape:true, maj:function(dt){ t += dt; var u = (t * 1.6) % 1, p = sc(X, 'faux@main', -10 - u * 116, 168 + u * 18); e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + (.6 + Math.sin(u * Math.PI) * 1.1).toFixed(2) + ') rotate(' + (t * 300 % 360).toFixed(0) + 'deg)'; e.style.opacity = String(Math.sin(u * Math.PI)); }, fin:function(){ e.remove(); }});
}
/* le danger au sol, sous les trois héros : la lame (rouge) ou l'onde du saut (orange) va passer par là */
function dangerSol(X, d, coul, saut){
  var e = garde(X, el('lp-danger' + (saut ? ' saut' : ''), null, X.ctx.sol || calque(X)));
  e.style.setProperty('--c', coul);
  anim(e, [{opacity:0, transform:'scaleX(.6)'}, {opacity:.9, transform:'scaleX(1)', offset:.5}, {opacity:.55, transform:'scaleX(1)', offset:.75}, {opacity:1, transform:'scaleX(1.02)'}], {duration:d * 1000, easing:'ease-in', fill:'forwards'});
  suivre(X, {etape:true, maj:function(){ return true; }, fin:function(){ anim(e, [{opacity:1}, {opacity:0}], {duration:250, fill:'forwards'}); retirer(e, 260); }});
}
/* LA FAUX qui fauche : une grande traînée blanche devant lui, et une lame d'air qui file au ras du sol, à travers les trois */
function fauche(X, l){
  var ctx = X.ctx, LX = ctx.LX;
  var t = el('lp-trainee', '<svg viewBox="0 0 420 220" width="420" height="220"><path d="M410 30 C330 -4 160 10 70 120 C40 156 20 190 6 214 C60 160 120 116 210 92 C290 70 360 66 410 30 Z" fill="url(#lp-tr)" opacity=".85"/><defs><linearGradient id="lp-tr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#ffd0d0" stop-opacity=".2"/></linearGradient></defs></svg>', calque(X));
  t.style.left = (LX - 400) + 'px'; t.style.top = '150px';
  anim(t, [{opacity:0, transform:'scale(.9)'}, {opacity:1, transform:'scale(1)', offset:.15}, {opacity:0, transform:'scale(1.04)'}], {duration:380, easing:'ease-out'});
  retirer(t, 400);
  var w = el('lp-lame', '<svg viewBox="0 0 150 70" width="150" height="70"><path d="M150 6 C90 -6 22 10 4 36 C22 60 90 74 150 64 C104 58 52 50 40 36 C52 22 104 12 150 6 Z" fill="#fff" opacity=".92"/><path d="M150 14 C104 18 64 26 52 36 C64 46 104 54 150 58" fill="none" stroke="#ffb0b0" stroke-width="3" opacity=".7"/></svg>', calque(X)); w.style.left = (LX - 260) + 'px'; w.style.top = '250px';
  anim(w, [{transform:'translateX(0) scaleX(.6)', opacity:0}, {transform:'translateX(-60px) scaleX(1)', opacity:1, offset:.15}, {transform:'translateX(' + (60 - LX + 200) + 'px) scaleX(1.1)', opacity:.9, offset:.85}, {transform:'translateX(' + (20 - LX + 200) + 'px) scaleX(1.1)', opacity:0}], {duration:420, easing:'linear'});
  retirer(w, 450);
  (l.length ? l : ['sage', 'alchimiste', 'pisteur']).forEach(function(h){
    var x = ctx.hCx(h), delai = Math.max(0, (LX - 200 - x) / (LX - 140)) * 360;
    setTimeout(function(){ var s = el('lp-entaille', '<i></i><i></i>', calque(X)); s.style.left = x + 'px'; s.style.top = '262px'; anim(s, [{opacity:0, transform:'translate(-50%,-50%) scale(.4)'}, {opacity:1, transform:'translate(-50%,-50%) scale(1.1)', offset:.2}, {opacity:0, transform:'translate(-50%,-50%) scale(1)'}], {duration:520}); retirer(s, 540); }, delai);
  });
}
/* la charge : la vapeur qui sort de ses naseaux, la poussière quand il racle le sol, les traits de vitesse */
function naseaux(X){
  var p = sc(X, 'tete', 108, 84);
  for(var i = 0; i < 2; i++){ var e = el('lp-vapeur', null, calque(X)); e.style.left = p.x + 'px'; e.style.top = (p.y + i * 4) + 'px';
    anim(e, [{transform:'translate(-50%,-50%) scale(.3)', opacity:.9}, {transform:'translate(' + (-40 - i * 16) + 'px,' + (10 + i * 8) + 'px) scale(1.4)', opacity:0}], {duration:700, delay:i * 90, easing:'ease-out', fill:'backwards'}); retirer(e, 850); }
  bruit(X, 'leoNaseaux', {}, null);
}
function racleSol(X){
  var p = sc(X, 'piedAv', 165, 330), ctx = X.ctx;
  for(var i = 0; i < 6; i++){ var e = el('lp-terre', null, calque(X)); ctx.Fx.particule(e, {x:p.x + hasard(-6, 10), y:338, vx:hasard(60, 200), vy:hasard(-260, -120), g:900, vie:hasard(.35, .6), s0:1, s1:.4, sol:342}); }
  bruit(X, 'leoRacle', {}, null);
}
function vitesse(X){
  var ctx = X.ctx;
  for(var i = 0; i < 5; i++){ var e = el('lp-trait', null, calque(X)); e.style.top = (170 + i * 30) + 'px'; e.style.left = (ctx.LX - 60) + 'px';
    anim(e, [{transform:'translateX(0) scaleX(.2)', opacity:0}, {transform:'translateX(-120px) scaleX(1)', opacity:.9, offset:.3}, {transform:'translateX(-380px) scaleX(.6)', opacity:0}], {duration:360, delay:i * 30, fill:'backwards'}); retirer(e, 460); }
}
function glisse(X){
  var ctx = X.ctx, p = ctx.leo.ancre('pieds');
  bruit(X, 'leoGlisse', {cale:.3}, ['tombe']);
  ctx.Fx.mot(p.x - 120, 150, 'Il glisse !', 'croc');
  setTimeout(function(){ ctx.Fx.tremble(12, 380); ctx.Fx.onde(p.x - 140, 332, '#f2b630', 320, 500); }, 260);
  /* des étoiles tournent au-dessus de sa tête, tant qu'il est par terre */
  etoiles(X, 4.6);
}
function etoiles(X, duree){
  var e = garde(X, el('lp-etoiles', '<i>★</i><i>★</i><i>★</i>', calque(X))), t = 0;
  suivre(X, {maj:function(dt){ t += dt; var p = X.ctx.leo.ancre('tete'); e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + (p.y - 30).toFixed(1) + 'px)'; return t < duree; }, fin:function(){ e.remove(); }});
}
function coupe(X, ev){
  var ctx = X.ctx, C = corps(X), p = ctx.leo.ancre('haut');
  /* (phase 1) la lumière du bâton de lune l'éblouit et coupe son attaque : pas de coup de marteau, pas d'étoiles */
  if(ev.par === 'lune'){ ctx.Fx.mot(p.x, Math.max(100, p.y), 'Ébloui !', 'refus'); ctx.Fx.onde(p.x, p.y + 40, '#eef4ff', 300, 500); X.douleur = 1.1; if(C.arme) C.arme(null); return; }
  bruit(X, 'leoSonne', {}, ['bong']);
  ctx.Fx.mot(p.x, Math.max(100, p.y), 'Coupé !', 'croc'); ctx.Fx.onde(p.x, p.y + 40, '#fff1b8', 240, 500);
  etoiles(X, 1.5);
  /* la gourde lui échappe des mains et se brise : pas de soin ! */
  if(ev.att === 'gourde' && C.etat.gourde === 'main'){
    var g = sc(X, 'gourde@main', 0, 0);
    C.objet('gourde', null); X.gourdePerdue = true;
    var b = el('lp-gourde', '<svg viewBox="-24 -40 48 70" width="48" height="70">' + LC.DEFS + LC.DESSINS.gourde.svg + '</svg>', calque(X));
    b.style.left = g.x + 'px'; b.style.top = g.y + 'px';
    var dx = 40 + Math.random() * 30;
    anim(b, [{transform:'translate(-50%,-50%) rotate(0deg)'}, {transform:'translate(' + (dx * .5 - 24) + 'px,' + (-80) + 'px) rotate(260deg)', offset:.4}, {transform:'translate(' + (dx - 24) + 'px,' + (330 - g.y - 30) + 'px) rotate(560deg)'}], {duration:620, easing:'ease-in', fill:'forwards'});
    setTimeout(function(){ b.remove(); son(X, 'verre'); bruit(X, 'leoBrise', {}, null); ctx.Fx.eclabousse(g.x + dx, 326, '#5cff4a'); ctx.Fx.mot(g.x + dx, 260, 'Plus de potion !', 'croc'); }, 620);
    setTimeout(function(){ X.gourdePerdue = false; if(C.etat.gourde == null){ C.objet('gourde', 'ceinture'); C.objet('bouchon', true); } }, 2200);
  }
  if(C.etat.faux === 'main'){ C.devantAr(false); }
}
/* le feu (la fiole ou la flèche de feu) : des flammes sur lui, tant qu'il brûle */
function brule(X, on){
  X.brule = !!on;
  if(!on){ if(X.feu){ X.feu.e.remove(); X.feu.fini = true; X.feu = null; } return; }
  if(X.feu) return;
  var e = garde(X, el('lp-feu', '<b><i></i></b><b><i></i></b><b><i></i></b><b><i></i></b><b><i></i></b>', calque(X)));
  var f = X.feu = {e:e, fini:false}, pts = [[150, 150], [118, 128], [186, 132], [140, 186], [172, 176]];
  suivre(X, {maj:function(){ if(f.fini) return false; var l = e.children; for(var i = 0; i < l.length; i++){ var p = sc(X, 'torse', pts[i][0], pts[i][1]); l[i].style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)'; } }, fin:function(){ e.remove(); }});
  var p = X.ctx.leo.ancre('haut'); X.ctx.Fx.mot(p.x, Math.max(100, p.y + 10), 'Il brûle !', 'croc');
}
/* LA GOURDE : le bouchon qui saute, la potion qui coule dans sa bouche, les glous, les croix vertes, le halo qui grandit */
function bouchon(X){
  var p = sc(X, 'gourde@main', 0, -30), ctx = X.ctx, e = el('lp-bouchon', null, calque(X));
  ctx.Fx.particule(e, {x:p.x, y:p.y, vx:hasard(60, 140), vy:-420, g:1300, vie:.8, vr:900, sol:336});
  bruit(X, 'leoBouchon', {}, ['clic']);
}
function flot(X){
  var e = garde(X, el('lp-flot', '<i></i>', calque(X))), C = corps(X);
  suivre(X, {etape:true, maj:function(){
    var a = sc(X, 'gourde@main', 0, -32), b = sc(X, 'tete', 116, 96), dx = b.x - a.x, dy = b.y - a.y, L = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    e.style.transform = 'translate(' + a.x.toFixed(1) + 'px,' + a.y.toFixed(1) + 'px) rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI - 90).toFixed(1) + 'deg) scaleY(' + (L / 20).toFixed(3) + ')';
  }, fin:function(){ e.remove(); }});
}
function glou(X, n){
  var ctx = X.ctx, b = sc(X, 'tete', 120, 100);
  bruit(X, 'leoGlou', {}, ['bulles']);
  var e = el('lp-glou', 'glou', calque(X)); e.style.left = (b.x - 30 - (n % 2) * 16) + 'px'; e.style.top = (b.y - 6) + 'px';
  anim(e, [{transform:'translate(-50%,0) scale(.4)', opacity:0}, {transform:'translate(-50%,-10px) scale(1.1)', opacity:1, offset:.25}, {transform:'translate(-50%,-34px) scale(1)', opacity:0}], {duration:800, easing:'ease-out'});
  retirer(e, 820);
  /* deux croix vertes qui montent de son corps (il se soigne) */
  for(var i = 0; i < 2; i++){ var p = sc(X, 'torse', 110 + Math.random() * 90, 140 + Math.random() * 60), c = el('lp-croix', '✚', calque(X)); c.style.left = p.x + 'px'; c.style.top = p.y + 'px';
    anim(c, [{transform:'translate(-50%,-50%) scale(.3)', opacity:0}, {transform:'translate(-50%,-80%) scale(1.15)', opacity:1, offset:.25}, {transform:'translate(-50%,-' + (260 + Math.random() * 120) + '%) scale(.8)', opacity:0}], {duration:1100, delay:i * 140, easing:'ease-out', fill:'backwards'}); retirer(c, 1300); }
}
function halo(X, d){
  /* un halo vert derrière lui, qui grandit tant qu'il boit : c'est le moment de l'arrêter (le marteau !) */
  var e = garde(X, el('lp-halo', null, X.ctx.persos)), t = 0;
  e.style.zIndex = '2';
  suivre(X, {etape:true, maj:function(dt){ t += dt; var p = X.ctx.leo.ancre('centre'), k = Math.min(1, t / d); e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + (.5 + k * .8 + Math.sin(t * 9) * .04).toFixed(3) + ')'; e.style.opacity = String(.25 + k * .7); }, fin:function(){ anim(e, [{opacity:+e.style.opacity}, {opacity:0}], {duration:300, fill:'forwards'}); retirer(e, 320); }});
}
function gueri(X, ev){
  var ctx = X.ctx, p = ctx.leo.ancre('centre'), h = ctx.leo.ancre('haut');
  bruit(X, 'leoAah', {}, ['magie']); bruit(X, 'leoAura', {dt:.1}, null);
  ctx.Fx.chiffre(h.x, Math.max(96, h.y + 20), '+' + ev.n, 'soin gros');
  ctx.Fx.eclat(p.x, p.y, 420, 'radial-gradient(closest-side,rgba(230,255,200,.95),rgba(120,255,110,.7) 40%,rgba(60,220,80,0))', 600);
  ctx.Fx.onde(p.x, p.y, '#7dff6a', 420, 700);
  for(var i = 0; i < 10; i++){ var a = Math.PI * 2 * i / 10, c = el('lp-croix', '✚', calque(X)); c.style.left = p.x + 'px'; c.style.top = p.y + 'px';
    anim(c, [{transform:'translate(-50%,-50%) scale(.4)', opacity:1}, {transform:'translate(calc(-50% + ' + (Math.cos(a) * 130).toFixed(0) + 'px),calc(-50% + ' + (Math.sin(a) * 110 - 40).toFixed(0) + 'px)) scale(1.3)', opacity:0}], {duration:900, easing:'ease-out'}); retirer(c, 920); }
  /* l'aura revigorante : elle reste un moment autour de lui (« ça y est, il est re-soigné ») */
  var e = garde(X, el('lp-aura', '<i></i><i></i><i></i>', ctx.persos)), t = 0;
  e.style.zIndex = '2';
  suivre(X, {maj:function(dt){ t += dt; var q = ctx.leo.ancre('pieds'); e.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px)'; e.style.opacity = String(t < 1.8 ? 1 : Math.max(0, 1 - (t - 1.8) / .8)); return t < 2.6; }, fin:function(){ e.remove(); }});
  /* (un éclair vert, court, sans filtre : une lueur posée sur lui — RAPIDITE.md, R2) */
  try{ ctx.leo.corps.flash('#9dff8a', 700); }catch(e){}
}
/* LE LANCER : le rat vole en tournant jusqu'au héros */
function lancerRat(X, h){
  var ctx = X.ctx, d = ctx.leo.ancre('main'), to = h ? ctx.hPt(h) : {x:200, y:200};
  var r = el('lp-rat', '<svg viewBox="-34 -8 60 112" width="44" height="82">' + LC.DEFS + LC.DESSINS.rat.svg + '</svg>', calque(X));
  r.style.left = d.x + 'px'; r.style.top = d.y + 'px';
  var mx = (to.x - d.x) / 2, my = Math.min(to.y, d.y) - d.y - 90;
  anim(r, [{transform:'translate(-50%,-50%) rotate(0deg)'}, {transform:'translate(calc(-50% + ' + mx + 'px),calc(-50% + ' + my + 'px)) rotate(-400deg)', offset:.5}, {transform:'translate(calc(-50% + ' + (to.x - d.x) + 'px),calc(-50% + ' + (to.y - d.y) + 'px)) rotate(-760deg)'}], {duration:260, easing:'linear', fill:'forwards'});
  setTimeout(function(){ r.remove(); son(X, 'morsure'); }, 270);
}
/* LE SAUT : la poussière qui tourne pendant qu'il se ramasse, le décollage, l'atterrissage qui fait trembler toute la salle */
/* ============================================================================ LES EFFETS DE LA PHASE 3 */
function p3(X){ var C = corps(X); return !!(C && C.etat.forme === 3); }
function bouche(X){ return X.ctx.leo.ancre('bouche'); }
/* l'air aspiré (le hurlement, le souffle) : des traits qui filent vers sa bouche */
function aspire(X, d, coul){
  var m = bouche(X);
  for(var i = 0; i < 9; i++){
    var a = Math.PI * (.75 + i / 8 * .5) + hasard(-.1, .1), r = hasard(150, 250), e = el('lp-aspire', null, calque(X));
    if(coul) e.style.background = coul;
    e.style.left = m.x + 'px'; e.style.top = m.y + 'px';
    anim(e, [{transform:'translate(' + (Math.cos(a) * r).toFixed(0) + 'px,' + (Math.sin(a) * r * .6).toFixed(0) + 'px) rotate(' + (a * 180 / Math.PI).toFixed(0) + 'deg) scaleX(1.4)', opacity:0}, {opacity:.9, offset:.3},
      {transform:'translate(0px,0px) rotate(' + (a * 180 / Math.PI).toFixed(0) + 'deg) scaleX(.2)', opacity:0}], {duration:d * 520, delay:i * d * 60, iterations:Math.max(1, Math.round(d / .6)), easing:'ease-in'});
    retirer(e, d * 1000 + 600);
  }
}
/* LE HURLEMENT : les ondes du cri partent de sa bouche et traversent la salle, l'une après l'autre ; un gros « RAAAH ! » */
function ondesCri(X, d){
  var m = bouche(X), n = Math.max(3, Math.round(d / .17));
  for(var i = 0; i < n; i++){
    var e = el('lp-cri', null, calque(X)); e.style.left = m.x + 'px'; e.style.top = m.y + 'px';
    anim(e, [{transform:'translate(0,-50%) scale(.12,.2)', opacity:0}, {opacity:.95, offset:.12}, {transform:'translate(-720px,-50%) scale(1.25,1.5)', opacity:0}], {duration:620, delay:i * 170, easing:'cubic-bezier(.2,.6,.4,1)', fill:'backwards'});
    retirer(e, i * 170 + 660);
  }
  var t = el('lp-raah', 'RAAAH !', calque(X)); t.style.left = (m.x - 150) + 'px'; t.style.top = Math.max(84, m.y - 96) + 'px';
  anim(t, [{transform:'scale(.3) rotate(-10deg)', opacity:0}, {transform:'scale(1.15) rotate(-6deg)', opacity:1, offset:.14}, {transform:'scale(1.3) rotate(-5deg)', opacity:1, offset:.8}, {transform:'scale(1.5) rotate(-4deg)', opacity:0}], {duration:d * 1000 + 200, easing:'ease-out'});
  retirer(t, d * 1000 + 240);
  X.ctx.Fx.tremble(7, d * 1000);
}
/* LE SOUFFLE DE FEU : la braise qui grossit dans sa gorge pendant qu'il aspire */
function braise(X, d){
  var e = garde(X, el('lp-lueur braise', null, calque(X))), t = 0;
  suivre(X, {maj:function(dt){ t += dt; var p = bouche(X), k = Math.min(1, t / d); e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + (.25 + k * .75).toFixed(3) + ')'; e.style.opacity = String(Math.min(1, .3 + k)); return X.att === 'souffle' && (X.etape === 'prise' || X.etape === 'elan'); },
    fin:function(){ e.remove(); }});
}
/* … et le jet de flammes : de VRAIES flammes (l'image de flamme du donjon), une quinzaine, qui partent de sa bouche, grossissent et
   s'éteignent en traversant la salle, l'une derrière l'autre, tant qu'il crache. La carte graphique les joue seule. */
function jetDeFlammes(X, d){
  var ctx = X.ctx, m = bouche(X), src = window.SALLE && window.SALLE.img ? window.SALLE.img('flamme') : null, N = 10, vie = 620;
  var boite = garde(X, el('lp-jet', '<i class="lp-jet-lueur"></i>', calque(X)));
  var x1 = 30, long = m.x - x1, n = Math.max(1, Math.ceil(d * 1000 / vie));
  var lu = boite.firstChild; lu.style.left = (x1 - 30) + 'px'; lu.style.width = (long + 60) + 'px';
  anim(lu, [{opacity:0}, {opacity:1, offset:.15}, {opacity:.75, offset:.5}, {opacity:1, offset:.85}, {opacity:0}], {duration:d * 1000 + 300, fill:'forwards'});
  for(var i = 0; i < N; i++){
    var f = src ? document.createElement('img') : document.createElement('i');
    f.className = 'lp-flam'; if(src){ f.src = src; f.alt = ''; }
    var u = i / N, dy = hasard(-1, 1), k = hasard(.85, 1.2), r0 = -90 + hasard(-10, 10), fin = hasard(.72, 1);
    f.style.left = m.x + 'px'; f.style.top = m.y + 'px';
    boite.appendChild(f);
    anim(f, [
      {transform:'translate(-50%,-50%) translate(-6px,4px) rotate(' + r0 + 'deg) scale(.22)', opacity:0},
      {transform:'translate(-50%,-50%) translate(' + (-long * .16).toFixed(0) + 'px,' + (10 + dy * 8).toFixed(0) + 'px) rotate(' + (r0 + dy * 6).toFixed(0) + 'deg) scale(' + (.7 * k).toFixed(2) + ')', opacity:1, offset:.14},
      {transform:'translate(-50%,-50%) translate(' + (-long * .55 * fin).toFixed(0) + 'px,' + (34 + dy * 34).toFixed(0) + 'px) rotate(' + (r0 + dy * 14).toFixed(0) + 'deg) scale(' + (1.5 * k).toFixed(2) + ')', opacity:.95, offset:.55},
      {transform:'translate(-50%,-50%) translate(' + (-long * fin).toFixed(0) + 'px,' + (52 + dy * 56).toFixed(0) + 'px) rotate(' + (r0 + dy * 22).toFixed(0) + 'deg) scale(' + (2.3 * k).toFixed(2) + ')', opacity:0}],
      {duration:vie, delay:u * vie, iterations:n, easing:'linear', fill:'backwards'});
  }
  setTimeout(function(){ try{ boite.remove(); }catch(e){} }, d * 1000 + vie + 80);
  /* (15 novembre, 13 h 54 : plus de secousse d'écran pendant tout le souffle — RAPIDITE.md, R17) */
}
/* la fumée qui lui sort de la bouche, après */
function fumeeBouche(X){
  var m = bouche(X);
  for(var i = 0; i < 4; i++){ var e = el('lp-vapeur', null, calque(X)); e.style.left = (m.x - 8) + 'px'; e.style.top = (m.y - 6) + 'px';
    anim(e, [{transform:'translate(0,0) scale(.4)', opacity:.75}, {transform:'translate(' + hasard(-50, -14).toFixed(0) + 'px,' + hasard(-70, -40).toFixed(0) + 'px) scale(1.7)', opacity:0}], {duration:900, delay:i * 130, easing:'ease-out', fill:'backwards'}); retirer(e, 1500); }
}
/* LA RAFALE : chaque coup claque sur le héros (un éclat, un « paf ») */
/* (15 novembre, 13 h 54 — Romain : « la rafale de coups, ça fait ramer extrêmement le téléphone » ; RAPIDITE.md, R18) : un coup de
   la rafale ne fabrique plus rien — le même éclat (posé une fois) saute près du héros et se rallume ; plus d'étincelles, plus de
   secousse d'écran à chaque coup ; un son un coup sur deux. Seul le dernier coup, le plus lourd, a droit au grand jeu. */
function coupRafale(X, k, n, h){
  var ctx = X.ctx, p = h ? ctx.hPt(h) : {x:300, y:220}, dernier = k >= n;
  var e = X.eclatR;
  if(!e || !e.isConnected) e = X.eclatR = garde(X, el('lp-eclat-r', null, calque(X)));
  var x = p.x + 26 + ((k * 37) % 25 - 12), y = p.y + ((k * 53) % 65 - 34);
  if(X.eclatA) try{ X.eclatA.cancel(); }catch(x0){}
  X.eclatA = anim(e, [{transform:'translate(' + x + 'px,' + y + 'px) scale(.35)', opacity:1}, {transform:'translate(' + x + 'px,' + y + 'px) scale(' + (dernier ? 2.4 : 1.25) + ')', opacity:0}], {duration:dernier ? 380 : 200, easing:'ease-out'});
  if(k % 2 === 1 || dernier) bruit(X, 'leoPoing', {}, ['bong']);
  if(dernier){ ctx.Fx.tremble(10, 300); ctx.Fx.mot(p.x + 40, Math.max(100, p.y - 120), 'PAF !', 'croc'); }
}
/* IL SAIGNE : la faux vient de l'entailler — un trait blanc claque sur son torse, le sang gicle, l'entaille reste */
var PLAIES = [[143, 134], [148, 158], [153, 181]];
function entaille(X, n){
  var ctx = X.ctx, C = corps(X), k = Math.max(1, Math.min(3, n)), w = PLAIES[k - 1], p = sc(X, 'torse', w[0], w[1]);
  C.plaies(k);
  var e = el('lp-entaille leo', '<i></i><i></i>', calque(X)); e.style.left = (p.x - 60) + 'px'; e.style.top = (p.y - 40) + 'px';
  anim(e, [{opacity:0, transform:'scale(.4) rotate(34deg)'}, {opacity:1, transform:'scale(1.5) rotate(34deg)', offset:.3}, {opacity:0, transform:'scale(1.8) rotate(34deg)'}], {duration:340, easing:'ease-out'}); retirer(e, 360);
  for(var i = 0; i < 10; i++){ var g = el('lp-sang', null, calque(X)); ctx.Fx.particule(g, {x:p.x + hasard(-14, 14), y:p.y + hasard(-8, 8), vx:hasard(-220, 120), vy:hasard(-260, -40), g:900, vie:hasard(.5, .8), sol:338}); }
  ctx.Fx.mot(p.x - 10, Math.max(100, p.y - 90), 'Il saigne !', 'croc');
  X.flinch = 1; X.flinchF = 1.5; X.douleur = .6;
  mare(X, k);
}
/* la mare de sang à ses pieds : elle grandit à chaque entaille */
function mare(X, n){
  var ctx = X.ctx;
  if(!X.mareEl){ X.mareEl = el('lp-mare', null, ctx.sol || calque(X)); X.mareEl.style.left = (ctx.LX - 16) + 'px'; }
  X.mareEl.style.transform = 'translate(-50%,-50%) scale(' + (.35 + n * .22).toFixed(2) + ')'; X.mareEl.style.opacity = n ? '1' : '0';
}
/* … et le sang qui goutte de ses entailles, sans arrêt (plus il en a, plus ça coule) */
function gouttes(X, dt, Z){
  var n = Math.min(3, Z.saigne || 0); if(!n) return;
  X.sangT = (X.sangT || 0) + dt * (1.1 + n * .9);
  if(X.sangT < 1) return;
  X.sangT = 0;
  var w = PLAIES[Math.floor(Math.random() * n)], p = sc(X, 'torse', w[0] + hasard(-10, 10), w[1] + hasard(0, 12));
  var g = el('lp-sang', null, calque(X)); X.ctx.Fx.particule(g, {x:p.x, y:p.y, vx:hasard(-14, 14), vy:hasard(0, 40), g:760, vie:.9, sol:339});
}
/* LE SAUT : la cible au sol, là où il va retomber — dès qu'il se ramasse, et jusqu'au choc (elle se resserre : c'est le compte à rebours) */
function cibleSaut(X, d){
  var ctx = X.ctx, x = ctx.LX + SAUT_X, e = garde(X, el('lp-cible-saut', '<i></i><i></i>', ctx.sol || calque(X)));
  e.style.left = x + 'px';
  anim(e, [{opacity:0}, {opacity:1, offset:.1}, {opacity:1}], {duration:d * 1000, fill:'forwards'});
  anim(e.firstChild, [{transform:'translate(-50%,-50%) scale(1.5)'}, {transform:'translate(-50%,-50%) scale(.42)'}], {duration:d * 1000, fill:'forwards', easing:'linear'});
  X.cibleSaut = e;
}
function finCibleSaut(X){ var e = X.cibleSaut; if(!e) return; X.cibleSaut = null; anim(e, [{opacity:1}, {opacity:0}], {duration:200, fill:'forwards'}); retirer(e, 220); }
function poussiereTourne(X){
  var ctx = X.ctx, p = ctx.leo.ancre('pieds');
  for(var i = 0; i < 8; i++){ var e = el('lp-terre gros', null, calque(X)); var a = (i / 8) * Math.PI * 2; ctx.Fx.particule(e, {x:p.x + Math.cos(a) * 60, y:334, vx:-Math.sin(a) * 120, vy:-hasard(60, 160), g:300, vie:.6, s0:1.2, s1:.3, delai:i * .04}); }
  bruit(X, 'leoMuscles', {}, null);
}
function decollage(X){
  var ctx = X.ctx, p = ctx.leo.ancre('pieds');
  ctx.Fx.onde(p.x, 334, '#d8c8a8', 300, 500);
  for(var i = 0; i < 10; i++){ var e = el('lp-terre', null, calque(X)); ctx.Fx.particule(e, {x:p.x + hasard(-50, 50), y:334, vx:hasard(-200, 200), vy:hasard(-300, -100), g:900, vie:.6, sol:340}); }
}
function atterrit(X){
  var ctx = X.ctx, p = ctx.leo.ancre('pieds'), Fx = ctx.Fx;
  Fx.tremble(20, 700);
  [0, 120, 240].forEach(function(d){ setTimeout(function(){ var o = el('lp-onde-sol', null, ctx.sol || calque(X)); o.style.left = p.x + 'px'; anim(o, [{transform:'translate(-50%,-50%) scale(.1,.1)', opacity:1}, {transform:'translate(-50%,-50%) scale(1,1)', opacity:0}], {duration:700, easing:'ease-out'}); retirer(o, 720); }, d); });
  var f = el('lp-fissure', '<svg viewBox="0 0 300 40" width="300" height="40"><path d="M150 20 L120 14 L96 24 L60 16 L30 26 L0 20 M150 20 L176 28 L200 18 L236 26 L270 16 L300 22 M120 14 L110 2 M200 18 L212 6 M96 24 L90 38" fill="none" stroke="#120a06" stroke-width="3.4" stroke-linecap="round"/><path d="M150 20 L120 14 L96 24 L60 16 L30 26 L0 20 M150 20 L176 28 L200 18 L236 26 L270 16 L300 22" fill="none" stroke="#ffb050" stroke-width="1.2" opacity=".7"/></svg>', ctx.sol || calque(X));
  f.style.left = (p.x - 150) + 'px';
  anim(f, [{opacity:0, transform:'scaleX(.2)'}, {opacity:1, transform:'scaleX(1)', offset:.1}, {opacity:1, offset:.75}, {opacity:0}], {duration:2200, easing:'ease-out'}); retirer(f, 2250);
  for(var i = 0; i < 18; i++){ var e = el('lp-caillou', null, calque(X)); Fx.particule(e, {x:p.x + hasard(-60, 60), y:330, vx:hasard(-380, 260), vy:hasard(-520, -180), g:1300, vie:hasard(.6, 1), vr:hasard(-600, 600), sol:338}); }
  Fx.eclat(p.x, 320, 360, 'radial-gradient(closest-side,rgba(255,240,210,.9),rgba(216,200,168,.6) 40%,rgba(216,200,168,0))', 600);
  Fx.mot(p.x - 60, 150, 'BOUM !', 'croc');
}

/* ============================================================================ LES ICÔNES DE LA RUNE DE L'ŒIL (ses vraies affaires) */
function icone(att){
  var D = LC.DESSINS;
  function svg(vb, nom, tr){ return '<svg viewBox="' + vb + '" width="100%" height="100%" aria-hidden="true">' + LC.DEFS + '<g transform="' + (tr || '') + '">' + D[nom].svg + '</g></svg>'; }
  if(att === 'faux') return svg('-140 -60 180 260', 'faux', 'rotate(-30 -50 80)');
  if(att === 'gourde') return svg('-24 -40 48 68', 'gourde');
  if(att === 'lancer') return svg('-34 -8 60 112', 'rat');
  if(att === 'sifflet') return svg('-20 -14 34 24', 'sifflet');
  return null;
}

/* ============================================================================ LA CINÉMATIQUE 1 → 2
   Romain : « il faut vraiment qu'ils prennent le temps […] qu'il n'y ait plus rien qui se passe, que la barre des sorts se baisse,
   et que là on voie bien avec des mouvements bien clairs avec son bras qu'il enlève sa cape et tous ses vêtements et qu'il se
   retrouve torse nu, et il la jette en dehors de l'écran. Et là, il faut qu'on voie vraiment que c'est un homme ultra entraîné,
   très musclé […] dans l'animation, comment il est animé, il faut qu'on voie qu'il est fort. »
   o : {pause(ms), titre(grand, petit, ms), bande(on), ramasser(liste), saute() -> true si on a touché « Passer »} */
var DEBOUT = pose({bas:4, torse:-2, tete:-4, bAv:[-6, 20, 0], bAr:[10, 24, 0], pAv:[194, 318], pAr:[108, 318], souffle:2.2});
var AGRAFE = pose({bas:4, torse:2, tete:4, mAv:[150, 116], bAr:[10, 24, 0], pAv:[194, 318], pAr:[108, 318]});
var ARRACHE = pose({bas:10, torse:-12, tete:-10, bAv:[-128, 30, 0], bAr:[40, 60, 0], pAv:[200, 318], pAr:[100, 318]});
var OURLET = pose({bas:18, torse:18, tete:16, mAv:[176, 208], mAr:[124, 210], pAv:[200, 318], pAr:[100, 318]});
var PAR_DESSUS = pose({bas:2, torse:-8, tete:-6, mAv:[174, 24], mAr:[132, 30], pAv:[196, 318], pAr:[106, 318]});
var JETTE = pose({bas:8, torse:-14, tete:-12, bAv:[-140, 20, 0], bAr:[96, 116, 0], pAv:[200, 318], pAr:[100, 318]});
var BICEPS = pose({bas:8, torse:-6, tete:-8, bAv:[-82, -104, 0], bAr:[82, 104, 0], pAv:[202, 318], pAr:[98, 318], souffle:1.2});
var COSTAUD = pose({bas:22, torse:20, tete:10, mAv:[156, 196], mAr:[140, 200], pAv:[208, 318], pAr:[94, 318], souffle:.4});
async function cine12(X, o){
  var ctx = X.ctx, L = ctx.leo, C = L.corps, Fx = ctx.Fx;
  function vers(p, ms, c){ return o.saute() ? C.vers(p, 1) : C.vers(p, ms, c); }
  function att(ms){ return o.saute() ? Promise.resolve() : o.pause(ms); }
  vider(X);
  /* (pendant la cinématique, le combat est arrêté : les effets qui suivent Léo ont leur propre petite boucle) */
  var tourne = true, t0 = 0;
  (function tic(ts){ if(!tourne) return; var dt = t0 ? Math.min(.1, (ts - t0) / 1000) : 0; t0 = ts;
    for(var i = X.suiveurs.length - 1; i >= 0; i--){ var sv = X.suiveurs[i], ok = true; try{ ok = sv.maj(dt) !== false; }catch(e){ ok = false; } if(!ok){ try{ if(sv.fin) sv.fin(); }catch(e){} X.suiveurs.splice(i, 1); } }
    requestAnimationFrame(tic); })(0);
  try{ await suiteCine(X, o, ctx, L, C, Fx, vers, att); } finally { tourne = false; }
}
async function suiteCine(X, o, ctx, L, C, Fx, vers, att){
  /* 1. tout s'arrête : la barre des sorts descend ; il tombe à genoux, encore habillé (la cape, la capuche, la tunique) */
  o.bande(false);
  L.tenue(2); C.habits({capuche:true, tunique:true, cape:true}); C.visage('douleur');
  C.temps = 0; C.poser(LC.POSES.genou); L.eclair();
  bruit(X, 'leoChute', {}, ['tombe']);
  var pd = L.ancre('pieds'); Fx.onde(pd.x, 334, '#d8c8a8', 260, 500);
  await att(1200);
  /* 2. il se relève, lentement, en serrant les poings */
  C.visage('colere');
  await vers(DEBOUT, 900, 'io');
  await att(350);
  /* 3. LA CAPE : la main à l'agrafe, sous son cou… et il l'arrache d'un grand geste ; elle s'envole hors de l'écran */
  await vers(AGRAFE, 520, 'io');
  await att(250);
  bruit(X, 'leoDechire', {}, ['magie']);
  var p0 = L.scene('torse', 150, 150);
  C.habits({cape:false, capuche:false}); C.visage('cri');
  if(o.nom) o.nom('Léo');
  capeVole(X, p0);
  outilsTombent(X);
  await vers(ARRACHE, 260, 'o');
  Fx.tremble(8, 300);
  o.titre('Léo !', 'l\'apprenti du meunier', 2400);
  await att(900);
  /* 4. LA TUNIQUE : il croise les bras, attrape le bas, la passe par-dessus sa tête… et la jette, elle aussi */
  C.visage('effort');
  await vers(OURLET, 560, 'io');
  bruit(X, 'leoTunique', {}, ['vole']);
  await vers(PAR_DESSUS, 420, 'o');
  C.habits({tunique:false}); C.visage('rictus');
  var boule = tuniqueEnMain(X);
  await att(220);
  bruit(X, 'leoJette', {}, ['vole']);
  await vers(JETTE, 240, 'o');
  boule.lancer();
  await att(500);
  /* 5. IL MONTRE SES MUSCLES : les deux biceps (il rugit, la salle tremble), puis tout le corps bandé — des années d'entraînement */
  C.visage('cri');
  await vers(BICEPS, 420, 'b');
  bruit(X, 'leoMuscles', {}, ['tombe']); Fx.tremble(14, 600);
  muscles(X, [['brasAv', 186, 154], ['brasAr', 92, 154], ['torse', 170, 134], ['torse', 120, 136]]);
  energie(X, '#ffb24a');
  await att(1100);
  C.visage('effort');
  await vers(COSTAUD, 380, 'o');
  bruit(X, 'leoMuscles', {}, ['tombe']); Fx.tremble(16, 700);
  muscles(X, [['torse', 150, 168], ['torse', 184, 150], ['brasAv', 200, 140], ['avantAv', 196, 200]]);
  energie(X, '#ff7a3a'); cailloux(X);
  await att(1100);
  /* 6. les outils de la phase 1, tombés à ses pieds, glissent jusqu'au Pisteur ; il se met en garde */
  X.fx.filter(function(e){ return e.classList && e.classList.contains('lp-outil-sol'); }).forEach(function(e){ e.remove(); });
  o.ramasser(['crochet', 'fleau', 'marteau']);
  C.visage('colere');
  await vers(G, 600, 'io');
  await att(400);
  o.bande(true);
}
function capeVole(X, p){
  /* la cape arrachée : elle tourne en l'air et sort de l'écran, à droite */
  var e = el('lp-cape', '<svg viewBox="0 0 200 220" width="200" height="220"><path d="M60 10 C40 60 20 140 6 210 C60 220 150 220 196 206 C184 140 160 60 140 10 C120 2 80 2 60 10 Z" fill="#141020" stroke="#1a0e08" stroke-width="4"/><path d="M56 70 C50 120 44 170 40 206 M144 70 C150 120 158 170 164 204 M100 40 V214" fill="none" stroke="#2f2840" stroke-width="3"/><path d="M70 14 C80 30 120 30 130 14" fill="none" stroke="#c8a868" stroke-width="3"/></svg>', calque(X));
  e.style.left = (p.x - 100) + 'px'; e.style.top = (p.y - 110) + 'px';
  anim(e, [{transform:'translate(0,0) rotate(0deg) scale(1)'}, {transform:'translate(120px,-120px) rotate(70deg) scale(1.1,.8)', offset:.4}, {transform:'translate(420px,-260px) rotate(220deg) scale(.9,1.1)'}], {duration:900, easing:'cubic-bezier(.3,.6,.4,1)', fill:'forwards'});
  retirer(e, 950);
}
function outilsTombent(X){
  /* le fléau, le marteau et le crochet, accrochés sous sa cape, tombent par terre avec fracas */
  var ctx = X.ctx, LX = ctx.LX, A = window.LeoAnime && window.LeoAnime.ARMES;
  ['crochet', 'fleau', 'marteau'].forEach(function(a, k){
    var e = garde(X, el('leo-outil lp-outil-sol', '<svg viewBox="-50 -50 100 100" width="60" height="60"><g transform="scale(.7)">' + (A && A[a] ? A[a]() : '') + '</g></svg>', calque(X)));
    e.style.left = (LX - 60 + k * 40) + 'px'; e.style.top = '300px';
    anim(e, [{transform:'translate(0,-110px) rotate(0deg)', opacity:0}, {transform:'translate(0,-100px) rotate(20deg)', opacity:1, offset:.1}, {transform:'translate(' + (k * 6 - 6) + 'px,10px) rotate(' + (80 + k * 40) + 'deg)', opacity:1, offset:.8}, {transform:'translate(' + (k * 6 - 6) + 'px,6px) rotate(' + (90 + k * 40) + 'deg)', opacity:1}], {duration:520, delay:k * 90, easing:'ease-in', fill:'both'});
  });
  setTimeout(function(){ son(X, 'metal'); bruit(X, 'leoCasse', {}, null); }, 480);
}
function tuniqueEnMain(X){
  /* la tunique roulée en boule, dans ses mains au-dessus de sa tête, puis jetée hors de l'écran */
  var e = garde(X, el('lp-tunique', '<svg viewBox="0 0 90 70" width="90" height="70"><path d="M10 40 C4 20 24 4 44 8 C60 0 84 12 82 32 C90 46 76 66 56 62 C40 70 16 64 10 40 Z" fill="#2e2740" stroke="#1a0e08" stroke-width="3.4"/><path d="M20 34 C30 24 44 22 56 28 M30 50 C44 44 60 46 70 40 M46 14 C50 22 50 30 46 38" fill="none" stroke="#4a4060" stroke-width="2.6"/><path d="M60 58 L74 70 M18 52 L8 64" stroke="#1a0e08" stroke-width="6" stroke-linecap="round"/><path d="M60 58 L74 70 M18 52 L8 64" stroke="#2e2740" stroke-width="3" stroke-linecap="round"/></svg>', calque(X)));
  var suiv = suivre(X, {maj:function(){ var a = X.ctx.leo.scene('mainAv', 197, 246), b = X.ctx.leo.scene('mainAr', 103, 246); e.style.transform = 'translate(' + ((a.x + b.x) / 2 - 45).toFixed(1) + 'px,' + ((a.y + b.y) / 2 - 40).toFixed(1) + 'px)'; }, fin:function(){}});
  return {lancer:function(){
    var i = X.suiveurs.indexOf(suiv); if(i >= 0) X.suiveurs.splice(i, 1);
    var m = /translate\(([-\d.]+)px,([-\d.]+)px\)/.exec(e.style.transform) || [0, 0, 0];
    anim(e, [{transform:'translate(' + m[1] + 'px,' + m[2] + 'px) rotate(0deg)'}, {transform:'translate(' + (+m[1] + 380) + 'px,' + (+m[2] - 200) + 'px) rotate(540deg)'}], {duration:620, easing:'ease-out', fill:'forwards'});
    retirer(e, 650);
  }};
}
function muscles(X, pts){
  /* des éclats de lumière sur ses muscles (ils brillent : la sueur, la force) */
  pts.forEach(function(q, k){ setTimeout(function(){ var p = X.ctx.leo.scene(q[0], q[1], q[2]), e = el('lp-eclat lp-brille', '✦', calque(X)); e.style.left = p.x + 'px'; e.style.top = p.y + 'px';
    anim(e, [{transform:'translate(-50%,-50%) scale(0) rotate(0)', opacity:0}, {transform:'translate(-50%,-50%) scale(1.5) rotate(90deg)', opacity:1, offset:.35}, {transform:'translate(-50%,-50%) scale(0) rotate(200deg)', opacity:0}], {duration:700}); retirer(e, 720); }, k * 110); });
}
function energie(X, coul){
  var ctx = X.ctx, p = ctx.leo.ancre('centre');
  ctx.Fx.onde(p.x, p.y, coul, 460, 700); setTimeout(function(){ ctx.Fx.onde(p.x, p.y, coul, 360, 600); }, 140);
  ctx.Fx.eclat(p.x, p.y, 380, 'radial-gradient(closest-side,rgba(255,240,200,.7),rgba(255,170,80,.35) 50%,rgba(255,120,40,0))', 650);
}
function cailloux(X){
  var ctx = X.ctx, p = ctx.leo.ancre('pieds');
  for(var i = 0; i < 12; i++){ var e = el('lp-caillou', null, calque(X)); ctx.Fx.particule(e, {x:p.x + hasard(-120, 120), y:336, vx:hasard(-40, 40), vy:hasard(-420, -200), g:900, vie:hasard(.8, 1.1), vr:hasard(-300, 300), sol:338}); }
}

window.LeoP2 = {creer:creer, PISTES:PISTES, pose:poseDe, G:G, SONNE:SONNE, AU_SOL:AU_SOL, TAUREAU:TAUREAU, BOIT:BOIT, ACCROUPI:ACCROUPI, CINE:{DEBOUT:DEBOUT, AGRAFE:AGRAFE, ARRACHE:ARRACHE, OURLET:OURLET, PAR_DESSUS:PAR_DESSUS, JETTE:JETTE, BICEPS:BICEPS, COSTAUD:COSTAUD}, icone:icone};
})();
