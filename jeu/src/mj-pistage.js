/* ==========================================================
   Brumeval — « Suivre les traces » : le Pisteur marche librement, la caméra le suit (enquête 3 : les traces de Moustache)

   CE QUE ROMAIN A DEMANDÉ (13 novembre) — il remplace, pour Moustache, l'ancien « Suivre la piste » où le sol défilait tout seul :
   · « Le Pisteur va être au centre de l'image, et quand il avance ou quand il recule, la caméra le suit. »
   · « Simplement, il doit trouver les bonnes traces et aller jusqu'à l'église. S'il suit des mauvaises traces jusqu'à un point précis,
     là, il perd. » On ne perd donc jamais par maladresse : seulement en allant AU BOUT d'une mauvaise piste.
   · « Fais en sorte que les traces ne soient pas énormes […] des traces de dinosaures » ; « que même en petit, on arrive à reconnaître
     les traces des chats ; s'il faut, tu éloignes un peu les coussinets ».
   · « Tu fais démarrer le jeu depuis chez Odette. »
   · Pas de code pour dire quelle trace suivre : le Sage a le carnet d'Odette (chats.js : les sept chats, leurs traces), il le dit à
     voix haute. Ici, rien ne dit laquelle est la bonne.

   COMMENT C'EST FAIT
   · Un petit quartier vu du ciel : des rues en quadrillage, des pâtés de maisons entre elles. Le Pisteur ne marche que dans les rues
     et les impasses. Le monde est tiré au hasard à chaque partie (les pistes, l'église, le sens gauche-droite) : on ne l'apprend pas
     par cœur.
   · Chez Odette (une impasse, en haut), du lait renversé : les sept chats y ont trempé les pattes. Chaque chat laisse sa piste de
     petites traces blanches, dans son couloir de la rue (deux pistes qui prennent la même rue marchent côte à côte : on peut comparer).
   · La piste de Moustache mène à l'église, tout au bout : la grille de la crypte. Y arriver = gagné (même sans avoir suivi la piste :
     « il suffit de trouver l'église »).
   · Chaque autre piste finit dans une impasse (chez le voisin, derrière la boulangerie, au lavoir, au pied d'un arbre, sous la
     carriole de Fortuné, dans les choux de Basile). Y arriver = perdu : « ce n'était pas Moustache, c'était Pompon ! »
   · On pose le doigt : le Pisteur marche vers lui. On lève le doigt : il s'arrête. (Au clavier : les flèches.)
   · Le niveau ne change que le nombre de fausses pistes (3 à 6) et la taille du quartier ; Noisette, à cinq doigts — presque
     Moustache — n'arrive qu'à partir du niveau 5.

   Le dessin est fait sur un canevas (le monde bouge sous le Pisteur, qui reste au milieu) ; le Pisteur est celui de « Se cacher »,
   vu du dessus (MJ.DESSUS, mj-cachette.js). Chargé APRÈS chats.js, mj-core.js et mj-cachette.js.
   Pour les essais : la zone porte __pistage ({etat(), monde, aller(x, y), poser(x, y)}).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ, CH = window.CHATS;
if(!MJ || !CH){ if(window.console) console.error('mj-pistage : mj-core.js et chats.js doivent être chargés avant.'); return; }
var U = MJ.util;
var K = '#24182e';
var RUE = 78, PASX = 318, PASY = 276, BORD = 190, IMPASSE = 118;   /* la largeur d'une rue, l'écart entre deux carrefours, la marge du monde, la longueur d'une impasse */
var VITESSE = 104;        /* le pas du Pisteur (unités du monde par seconde) */
var PAS_CHAT = 21;        /* l'écart entre deux traces d'une même piste */
var TRACE = 5.1;          /* la demi-largeur d'une trace (le Pisteur fait 26 de large : une trace est petite, mais on compte ses doigts) */
var R_FIN = 34;           /* à cette distance du bout d'une piste, on y est */
var COULOIRS = [-27, -18, -9, 0, 9, 18, 27];
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function reduit(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }

/* ---------- les bouts des fausses pistes ---------- */
var LIEUX = {
  voisin:{nom:'chez le voisin', t:'Ces traces s\'arrêtent chez le voisin, devant six gamelles vides.'},
  boulangerie:{nom:'derrière la boulangerie', t:'Ces traces s\'arrêtent derrière la boulangerie, le nez dans la farine.'},
  lavoir:{nom:'au lavoir', t:'Ces traces s\'arrêtent au bord du lavoir.'},
  arbre:{nom:'au pied d\'un arbre', t:'Ces traces s\'arrêtent au pied d\'un arbre : ce chat-là dort tout là-haut.'},
  carriole:{nom:'sous la carriole de Fortuné', t:'Ces traces s\'arrêtent sous la carriole de Fortuné.'},
  potager:{nom:'dans le potager', t:'Ces traces s\'arrêtent dans les choux de Basile.'}
};

/* ==========================================================
   LE MONDE : le quadrillage, les impasses, les pistes, les traces
   ========================================================== */
function creerMonde(p){
  var NX = p.nx, NY = p.ny, miroir = Math.random() < .5;
  function nx(i){ return BORD + (miroir ? NX - 1 - i : i) * PASX; }
  function ny(j){ return BORD + IMPASSE + j * PASY; }
  var Wm = BORD * 2 + (NX - 1) * PASX, Hm = BORD * 2 + IMPASSE + (NY - 1) * PASY + IMPASSE;
  var rues = [], i, j;
  for(i = 0; i < NX; i++) rues.push({x:nx(i) - RUE / 2, y:ny(0) - RUE / 2, w:RUE, h:(NY - 1) * PASY + RUE});
  for(j = 0; j < NY; j++) rues.push({x:Math.min(nx(0), nx(NX - 1)) - RUE / 2, y:ny(j) - RUE / 2, w:(NX - 1) * PASX + RUE, h:RUE});
  /* une impasse : depuis un point d'une rue (mx, my), dans la direction (dx, dy), sur IMPASSE */
  function impasse(mx, my, dx, dy, lg){
    lg = lg || IMPASSE;
    var r = dx ? {x:dx > 0 ? mx : mx - lg, y:my - RUE / 2, w:lg, h:RUE} : {x:mx - RUE / 2, y:dy > 0 ? my : my - lg, w:RUE, h:lg};
    rues.push(r);
    return {mx:mx, my:my, dx:dx, dy:dy, fx:mx + dx * (lg - 26), fy:my + dy * (lg - 26), bx:mx + dx * lg, by:my + dy * lg};
  }
  /* chez Odette : une impasse au-dessus du premier carrefour */
  var odette = impasse(nx(0), ny(0) - RUE / 2, 0, -1);
  /* l'église : au bout du quartier, à l'opposé — après le dernier carrefour, vers le bas ou vers le côté (tiré au hasard) */
  var eg = U.choix([[NX - 1, NY - 1, 'bas'], [NX - 1, NY - 1, 'cote'], [NX - 1, NY - 2, 'cote'], [NX - 2, NY - 1, 'bas']]);
  var sx = miroir ? -1 : 1;
  var eglise = eg[2] === 'bas' ? impasse(nx(eg[0]), ny(eg[1]) + RUE / 2, 0, 1, IMPASSE + 14) : impasse(nx(eg[0]) + sx * RUE / 2, ny(eg[1]), sx, 0, IMPASSE + 14);
  eglise.noeud = [eg[0], eg[1]];

  /* ---- les arêtes où brancher une impasse (au milieu d'un bout de rue, vers l'intérieur d'un pâté de maisons) ---- */
  var libres = [];
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY; j++){   /* un bout de rue horizontal : l'impasse monte ou descend */
    if(j > 0) libres.push({a:[i, j], b:[i + 1, j], mx:(nx(i) + nx(i + 1)) / 2, my:ny(j) - RUE / 2, dx:0, dy:-1});
    if(j < NY - 1) libres.push({a:[i, j], b:[i + 1, j], mx:(nx(i) + nx(i + 1)) / 2, my:ny(j) + RUE / 2, dx:0, dy:1});
  }
  for(i = 0; i < NX; i++) for(j = 0; j < NY - 1; j++){   /* un bout de rue vertical : l'impasse part d'un côté ou de l'autre */
    var g = Math.min(nx(0), nx(NX - 1)), d = Math.max(nx(0), nx(NX - 1));
    if(nx(i) > g) libres.push({a:[i, j], b:[i, j + 1], mx:nx(i) - RUE / 2, my:(ny(j) + ny(j + 1)) / 2, dx:-1, dy:0});
    if(nx(i) < d) libres.push({a:[i, j], b:[i, j + 1], mx:nx(i) + RUE / 2, my:(ny(j) + ny(j + 1)) / 2, dx:1, dy:0});
  }
  function dist(n){ return n[0] + n[1]; }
  libres = U.melanger(libres);
  /* deux impasses ne se font pas face dans le même pâté (elles se toucheraient), et on garde de la place autour de l'église */
  var prises = [];
  function loin(e){
    return prises.every(function(q){ return Math.hypot(q.mx + q.dx * IMPASSE - (e.mx + e.dx * IMPASSE), q.my + q.dy * IMPASSE - (e.my + e.dy * IMPASSE)) > RUE * 1.6; }) &&
      Math.hypot(eglise.bx - (e.mx + e.dx * IMPASSE), eglise.by - (e.my + e.dy * IMPASSE)) > RUE * 2.2;
  }
  /* ---- les chats de cette partie : Moustache, et p.faux fausses pistes ---- */
  var autres = CH.liste.filter(function(c){ return c.id !== 'moustache' && (p.cinq || c.id !== 'noisette'); });
  autres = U.melanger(autres).slice(0, p.faux);
  if(p.cinq && !autres.some(function(c){ return c.id === 'noisette'; })) autres[0] = CH.par.noisette;   /* à partir du niveau 5, Noisette est toujours là */
  autres = U.melanger(autres);
  var noms = U.melanger(Object.keys(LIEUX).filter(function(k){ return k !== 'voisin'; }));
  var couloirs = U.melanger(COULOIRS.slice());
  var pistes = [], fins = [], reserves = [];
  /* un chemin de carrefour en carrefour, de (0,0) à n : les pas à droite et les pas en bas, mélangés */
  function chemin(n){
    var l = [], k; for(k = 0; k < n[0]; k++) l.push([1, 0]); for(k = 0; k < n[1]; k++) l.push([0, 1]);
    l = U.melanger(l);
    var c = [0, 0], r = [[0, 0]]; l.forEach(function(m){ c = [c[0] + m[0], c[1] + m[1]]; r.push(c); });
    return r;
  }
  /* la ligne brisée d'une piste, dans son couloir o : de la porte d'Odette, par les carrefours, jusqu'au bout de son impasse */
  function ligne(noeuds, o, vers, fin){
    var pts = [{x:odette.fx + o, y:odette.fy}], sens = 'v', k, a, b, s2;   /* (l'impasse d'Odette descend : on arrive au premier carrefour en vertical) */
    for(k = 0; k < noeuds.length - 1; k++){
      a = noeuds[k]; b = noeuds[k + 1]; s2 = a[0] !== b[0] ? 'h' : 'v';
      if(s2 !== sens){ pts.push({x:nx(a[0]) + o, y:ny(a[1]) + o}); sens = s2; }
    }
    var der = noeuds[noeuds.length - 1];
    /* jusqu'à l'entrée de l'impasse (vers.mx, vers.my), puis dedans */
    var sImp = vers.dx ? 'h' : 'v';
    if(vers.noeud){   /* l'église : son impasse part du dernier carrefour */
      if(sImp !== sens) pts.push({x:nx(der[0]) + o, y:ny(der[1]) + o});
    } else {
      var sRue = vers.dx ? 'v' : 'h';   /* la rue où s'ouvre l'impasse */
      if(sRue !== sens){ pts.push({x:nx(der[0]) + o, y:ny(der[1]) + o}); sens = sRue; }
      pts.push(sRue === 'h' ? {x:vers.mx + o, y:ny(der[1]) + o} : {x:nx(der[0]) + o, y:vers.my + o});
    }
    pts.push(sImp === 'h' ? {x:fin.fx, y:fin.fy + o * .55} : {x:fin.fx + o * .55, y:fin.fy});
    return pts;
  }
  /* Moustache : jusqu'à l'église */
  var oM = couloirs.pop();
  pistes.push({chat:'moustache', bon:true, pts:ligne(chemin(eglise.noeud), oM, eglise, eglise)});
  /* les autres : chacun son impasse. Le premier va chez le voisin, tout près ; les suivants de plus en plus loin. */
  autres.forEach(function(c, n){
    var e = null, k;
    for(k = 0; k < libres.length && !e; k++){
      var q = libres[k], da = dist(q.a), db = dist(q.b), pres = Math.min(da, db);
      if(!loin(q)) continue;
      if(n === 0 ? pres > 1 : pres < 1) continue;
      e = q; libres.splice(k, 1);
    }
    if(!e) return;
    prises.push(e);
    var imp = impasse(e.mx, e.my, e.dx, e.dy);
    var lieu = n === 0 ? 'voisin' : noms[(n - 1) % noms.length];
    /* on arrive par le carrefour le plus proche de chez Odette */
    var dep = dist(e.a) <= dist(e.b) ? e.a : e.b;
    var o = couloirs.pop();
    pistes.push({chat:c.id, bon:false, lieu:lieu, pts:ligne(chemin(dep), o, e, imp)});
    fins.push({x:imp.fx, y:imp.fy, bx:imp.bx, by:imp.by, dx:e.dx, dy:e.dy, lieu:lieu, chat:c.id});
    reserves.push({x:imp.bx + e.dx * 34 - 60, y:imp.by + e.dy * 34 - 60, w:120, h:120});
  });
  /* ---- les traces : on suit chaque ligne (coins arrondis), une patte à gauche, une patte à droite ---- */
  var traces = [], CASE = 220, cases = {};
  pistes.forEach(function(P){
    var pts = arrondir(P.pts, 20), s = 14, n = 0, L = longueur(pts);
    P.longueur = L;
    while(s < L - 6){
      var q = point(pts, s), cote = n % 2 ? 1 : -1;
      var x = q.x + Math.cos(q.a + Math.PI / 2) * 3.4 * cote + U.rand(-.9, .9), y = q.y + Math.sin(q.a + Math.PI / 2) * 3.4 * cote + U.rand(-.9, .9);
      /* le lait s'use : les traces pâlissent un peu en s'éloignant (jamais au point de disparaître) */
      var al = Math.max(.74, 1 - s / 2600);
      var t = {x:x, y:y, a:q.a + Math.PI / 2 + U.rand(-.12, .12), c:P.chat, al:al, k:U.rand(.94, 1.06)};
      traces.push(t);
      var cle = Math.floor(x / CASE) + ':' + Math.floor(y / CASE); (cases[cle] = cases[cle] || []).push(t);
      s += PAS_CHAT * (CH.par[P.chat].trace.k < .8 ? .8 : 1) * U.rand(.93, 1.07); n++;
    }
  });
  /* ---- les pâtés de maisons (pour le décor) : entre les rues ---- */
  var pates = [], xs = [], ys = [];
  for(i = 0; i < NX; i++) xs.push(nx(i)); xs.sort(function(a, b){ return a - b; });
  for(j = 0; j < NY; j++) ys.push(ny(j));
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY - 1; j++) pates.push(decorPate(xs[i] + RUE / 2, ys[j] + RUE / 2, PASX - RUE, PASY - RUE, rues.concat(reserves)));
  return {W:Wm, H:Hm, rues:rues, odette:odette, eglise:eglise, pistes:pistes, fins:fins, traces:traces, cases:cases, CASE:CASE, pates:pates, miroir:miroir,
    depart:{x:odette.fx, y:odette.fy + 30}};
}
function longueur(pts){ var L = 0; for(var i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return L; }
function point(pts, s){
  for(var i = 1; i < pts.length; i++){
    var d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if(s <= d || i === pts.length - 1){ var u = d ? Math.min(1, s / d) : 0; return {x:pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u, y:pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u, a:Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x)}; }
    s -= d;
  }
  return {x:pts[0].x, y:pts[0].y, a:0};
}
/* les coins d'une ligne brisée, arrondis (un chat ne tourne pas à angle droit) */
function arrondir(pts, r){
  if(pts.length < 3) return pts.slice();
  var out = [pts[0]];
  for(var i = 1; i < pts.length - 1; i++){
    var a = pts[i - 1], b = pts[i], c = pts[i + 1];
    var d1 = Math.hypot(b.x - a.x, b.y - a.y), d2 = Math.hypot(c.x - b.x, c.y - b.y), rr = Math.min(r, d1 / 2.2, d2 / 2.2);
    if(!d1 || !d2){ out.push(b); continue; }
    var p1 = {x:b.x + (a.x - b.x) * rr / d1, y:b.y + (a.y - b.y) * rr / d1}, p2 = {x:b.x + (c.x - b.x) * rr / d2, y:b.y + (c.y - b.y) * rr / d2};
    for(var k = 0; k <= 4; k++){ var u = k / 4, v = 1 - u; out.push({x:v * v * p1.x + 2 * v * u * b.x + u * u * p2.x, y:v * v * p1.y + 2 * v * u * b.y + u * u * p2.y}); }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/* le décor d'un pâté de maisons : des toits et des arbres, là où aucune impasse ne passe */
var TOITS = ['#c8553d', '#b8643a', '#8a5a8c', '#6a7fb0', '#c9973a', '#7a9a62', '#a8503a'];
function decorPate(x, y, w, h, rues){
  var o = {x:x, y:y, w:w, h:h, maisons:[], arbres:[]}, essais = 0;
  function libre(r){
    return !rues.some(function(q){ return r.x < q.x + q.w + 6 && r.x + r.w > q.x - 6 && r.y < q.y + q.h + 6 && r.y + r.h > q.y - 6; }) &&
      !o.maisons.some(function(q){ return r.x < q.x + q.w + 8 && r.x + r.w > q.x - 8 && r.y < q.y + q.h + 8 && r.y + r.h > q.y - 8; });
  }
  while(o.maisons.length < 4 && essais++ < 40){
    var mw = U.rand(64, 104), mh = U.rand(50, 82), r = {x:x + 8 + Math.random() * Math.max(1, w - mw - 16), y:y + 8 + Math.random() * Math.max(1, h - mh - 16), w:mw, h:mh};
    if(libre(r)){ r.c = U.choix(TOITS); r.sens = mw > mh ? 'h' : 'v'; r.chem = [U.rand(.2, .8), U.rand(.2, .8)]; o.maisons.push(r); }
  }
  essais = 0;
  while(o.arbres.length < 5 && essais++ < 40){
    var ar = U.rand(13, 21), a = {x:x + ar + Math.random() * (w - 2 * ar), y:y + ar + Math.random() * (h - 2 * ar), r:ar};
    if(libre({x:a.x - ar, y:a.y - ar, w:2 * ar, h:2 * ar})) o.arbres.push(a);
  }
  return o;
}

/* ==========================================================
   LE DESSIN (sur le canevas, en unités du monde)
   ========================================================== */
function pave(){   /* le motif des pavés : une petite tuile, répétée */
  var c = document.createElement('canvas'); c.width = c.height = 96;
  var x = c.getContext('2d'); x.fillStyle = '#b7a58a'; x.fillRect(0, 0, 96, 96);
  var rnd = (function(s){ return function(){ s = (s * 16807) % 2147483647; return s / 2147483647; }; })(7);
  for(var j = 0; j < 4; j++) for(var i = 0; i < 4; i++){
    var px = i * 24 + (j % 2 ? 12 : 0), py = j * 24, t = rnd();
    x.fillStyle = t < .33 ? '#c2b196' : t < .66 ? '#ae9c82' : '#bcab90';
    for(var k = -1; k <= 1; k++){ x.beginPath(); rr(x, px + 2 + k * 96, py + 2, 20, 20, 6); x.fill(); }
  }
  return c;
}
function rr(x, a, b, w, h, r){ x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function dessinerMaison(x, m){
  x.fillStyle = 'rgba(11,26,16,.28)'; x.fillRect(m.x + 5, m.y + 6, m.w, m.h);
  x.fillStyle = m.c; x.strokeStyle = K; x.lineWidth = 2.6; x.fillRect(m.x, m.y, m.w, m.h); x.strokeRect(m.x, m.y, m.w, m.h);
  x.fillStyle = 'rgba(255,255,255,.16)';
  if(m.sens === 'h'){ x.fillRect(m.x, m.y, m.w, m.h / 2); x.beginPath(); x.moveTo(m.x, m.y + m.h / 2); x.lineTo(m.x + m.w, m.y + m.h / 2); }
  else { x.fillRect(m.x, m.y, m.w / 2, m.h); x.beginPath(); x.moveTo(m.x + m.w / 2, m.y); x.lineTo(m.x + m.w / 2, m.y + m.h); }
  x.lineWidth = 2; x.stroke();
  /* la cheminée */
  var cx = m.x + m.w * m.chem[0], cy = m.y + m.h * m.chem[1];
  x.fillStyle = '#6a4a3a'; x.lineWidth = 1.8; x.fillRect(cx - 5, cy - 5, 10, 10); x.strokeRect(cx - 5, cy - 5, 10, 10); x.fillStyle = '#2a1e1a'; x.fillRect(cx - 2.4, cy - 2.4, 4.8, 4.8);
}
function dessinerArbre(x, a){
  x.fillStyle = 'rgba(11,26,16,.25)'; x.beginPath(); x.arc(a.x + 4, a.y + 5, a.r, 0, 6.2832); x.fill();
  x.fillStyle = '#3f8a4c'; x.strokeStyle = K; x.lineWidth = 2.4; x.beginPath(); x.arc(a.x, a.y, a.r, 0, 6.2832); x.fill(); x.stroke();
  x.fillStyle = '#5aa862'; x.beginPath(); x.arc(a.x - a.r * .28, a.y - a.r * .3, a.r * .52, 0, 6.2832); x.fill();
}
/* le bout d'une fausse piste : (0, 0) le fond de l'impasse, l'impasse arrive par le bas (on tourne le dessin) */
function dessinerLieu(x, F){
  x.save(); x.translate(F.bx, F.by); x.rotate(Math.atan2(F.dy, F.dx) - Math.PI / 2 + Math.PI);
  x.strokeStyle = K; x.lineWidth = 2.4;
  var i;
  if(F.lieu === 'voisin' || F.lieu === 'boulangerie'){   /* la maison, derrière sa porte */
    x.fillStyle = 'rgba(11,26,16,.28)'; x.fillRect(-49, -68, 106, 68);
    x.fillStyle = F.lieu === 'voisin' ? '#6a7fb0' : '#c9973a'; x.fillRect(-54, -74, 108, 68); x.strokeRect(-54, -74, 108, 68);
    x.fillStyle = 'rgba(255,255,255,.16)'; x.fillRect(-54, -74, 108, 34); x.beginPath(); x.moveTo(-54, -40); x.lineTo(54, -40); x.stroke();
    x.fillStyle = '#6a4a3a'; x.fillRect(22, -62, 11, 11); x.strokeRect(22, -62, 11, 11);
  }
  if(F.lieu === 'voisin'){   /* une porte, un paillasson, six gamelles */
    x.fillStyle = '#7a5232'; x.fillRect(-17, -6, 34, 12); x.strokeRect(-17, -6, 34, 12); x.fillStyle = '#ffd36a'; x.beginPath(); x.arc(10, 0, 2.2, 0, 6.2832); x.fill();
    x.fillStyle = '#b0503a'; x.fillRect(-15, 9, 30, 12); x.strokeRect(-15, 9, 30, 12);
    for(i = 0; i < 6; i++){ var gx = -30 + (i % 3) * 12 + (i > 2 ? 54 : 0), gy = 30 + (i % 2) * 3; x.fillStyle = '#5a8fc8'; x.beginPath(); x.arc(gx > 12 ? gx - 24 : gx, gy, 5, 0, 6.2832); x.fill(); x.stroke(); x.fillStyle = '#2f4f78'; x.beginPath(); x.arc(gx > 12 ? gx - 24 : gx, gy, 2.6, 0, 6.2832); x.fill(); }
  } else if(F.lieu === 'boulangerie'){   /* la porte de derrière, des sacs de farine, de la farine par terre */
    x.fillStyle = '#8a6a4a'; x.fillRect(-17, -6, 34, 12); x.strokeRect(-17, -6, 34, 12);
    x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(2, 26, 24, 13, 0, 0, 6.2832); x.fill();
    [[-20, 16], [18, 14], [-2, 12]].forEach(function(q){ x.fillStyle = '#f0e6d0'; x.beginPath(); x.ellipse(q[0], q[1], 9, 11, .2, 0, 6.2832); x.fill(); x.stroke(); x.fillStyle = '#c8b48a'; x.fillRect(q[0] - 4, q[1] - 2, 8, 2.4); });
  } else if(F.lieu === 'lavoir'){   /* le bassin */
    x.fillStyle = '#8a8478'; rrF(x, -30, -4, 60, 44, 6); x.fillStyle = '#4f9fd8'; rrF(x, -24, 2, 48, 32, 4);
    x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(-16, 12); x.quadraticCurveTo(-8, 8, 0, 12); x.quadraticCurveTo(8, 16, 16, 12); x.moveTo(-12, 24); x.quadraticCurveTo(-4, 20, 4, 24); x.stroke();
  } else if(F.lieu === 'arbre'){   /* un grand arbre, et un bout de queue qui dépasse */
    x.fillStyle = '#2f7040'; x.beginPath(); x.arc(0, 8, 30, 0, 6.2832); x.fill(); x.stroke();
    x.fillStyle = '#4c9a58'; x.beginPath(); x.arc(-8, 0, 15, 0, 6.2832); x.fill(); x.beginPath(); x.arc(12, 14, 11, 0, 6.2832); x.fill();
    x.strokeStyle = K; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(14, 30); x.quadraticCurveTo(26, 40, 20, 50); x.stroke();
    x.strokeStyle = '#f4f1ea'; x.lineWidth = 3.4; x.beginPath(); x.moveTo(14, 30); x.quadraticCurveTo(26, 40, 20, 50); x.stroke();
  } else if(F.lieu === 'carriole'){   /* la carriole : sa bâche, ses deux roues */
    x.fillStyle = '#3a2c20'; x.fillRect(-26, 2, 6, 30); x.fillRect(20, 2, 6, 30);
    x.fillStyle = '#d8a23c'; rrF(x, -20, -2, 40, 38, 5); x.fillStyle = '#c0453a'; for(i = 0; i < 3; i++) x.fillRect(-20 + 4 + i * 13, -2, 6, 38);
    x.strokeStyle = K; x.lineWidth = 2.4; x.beginPath(); rr(x, -20, -2, 40, 38, 5); x.stroke();
  } else {   /* le potager : des rangs de choux */
    x.fillStyle = '#7a5a3a'; rrF(x, -30, -2, 60, 46, 4);
    for(i = 0; i < 9; i++){ var cx = -20 + (i % 3) * 20, cy = 8 + Math.floor(i / 3) * 14; x.fillStyle = '#6fbf5a'; x.strokeStyle = K; x.lineWidth = 1.6; x.beginPath(); x.arc(cx, cy, 6, 0, 6.2832); x.fill(); x.stroke(); x.fillStyle = '#a5dc8a'; x.beginPath(); x.arc(cx - 1.4, cy - 1.4, 2.6, 0, 6.2832); x.fill(); }
  }
  x.restore();
}
function rrF(x, a, b, w, h, r){ x.beginPath(); rr(x, a, b, w, h, r); x.fill(); x.strokeStyle = K; x.lineWidth = 2.4; x.stroke(); }
/* chez Odette : la porte, le bol renversé, la flaque de lait */
function dessinerOdette(x, O){
  x.save(); x.translate(O.bx, O.by);
  x.fillStyle = '#8a5a8c'; x.strokeStyle = K; x.lineWidth = 2.6; x.fillRect(-RUE / 2 - 6, -34, RUE + 12, 34); x.strokeRect(-RUE / 2 - 6, -34, RUE + 12, 34);
  x.fillStyle = '#6a4a2e'; x.fillRect(-13, -12, 26, 12); x.strokeRect(-13, -12, 26, 12); x.fillStyle = '#ffd36a'; x.beginPath(); x.arc(8, -6, 2.2, 0, 6.2832); x.fill();
  /* la canne, posée contre la porte */
  x.strokeStyle = K; x.lineWidth = 4.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(-24, -4); x.lineTo(-22, 16); x.stroke(); x.strokeStyle = '#b98a4a'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(-24, -4); x.lineTo(-22, 16); x.stroke();
  /* le lait */
  x.fillStyle = '#fffdf4'; x.beginPath(); x.ellipse(0, 24, 34, 15, 0, 0, 6.2832); x.fill(); x.beginPath(); x.ellipse(-22, 34, 12, 7, .4, 0, 6.2832); x.fill(); x.beginPath(); x.ellipse(24, 33, 10, 6, -.3, 0, 6.2832); x.fill();
  x.fillStyle = '#c9a26a'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); x.ellipse(14, 14, 8, 6, .5, 0, 6.2832); x.fill(); x.stroke();
  x.restore();
}
/* l'église : son mur de pierre au fond de l'impasse, le clocher, et la grille de la crypte */
function dessinerEglise(x, E, t){
  x.save(); x.translate(E.bx, E.by); x.rotate(Math.atan2(E.dy, E.dx) - Math.PI / 2 + Math.PI);
  x.strokeStyle = K; x.lineWidth = 3;
  x.fillStyle = 'rgba(11,26,16,.3)'; x.fillRect(-84, -150, 180, 156);
  x.fillStyle = '#9a968c'; x.fillRect(-90, -156, 180, 156); x.strokeRect(-90, -156, 180, 156);      /* la nef */
  x.fillStyle = '#5f6f95'; x.fillRect(-90, -156, 180, 132); x.strokeRect(-90, -156, 180, 132);      /* son toit d'ardoise */
  x.beginPath(); x.moveTo(0, -156); x.lineTo(0, -24); x.lineWidth = 2; x.stroke();
  x.fillStyle = '#b4b0a4'; x.lineWidth = 3; x.fillRect(34, -112, 62, 62); x.strokeRect(34, -112, 62, 62);   /* le clocher */
  x.fillStyle = '#44557a'; x.beginPath(); x.moveTo(34, -112); x.lineTo(65, -81); x.lineTo(96, -112); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(34, -50); x.lineTo(65, -81); x.lineTo(96, -50); x.closePath(); x.fillStyle = '#566890'; x.fill(); x.stroke();
  x.fillStyle = '#e8c24a'; x.beginPath(); x.arc(65, -81, 5, 0, 6.2832); x.fill(); x.stroke();
  /* la grille de la crypte, au pied du mur : un escalier qui s'enfonce sous l'église, des barreaux par-dessus */
  x.fillStyle = '#8f8a80'; x.strokeStyle = K; x.lineWidth = 3; x.beginPath(); rr(x, -30, -40, 60, 46, 7); x.fill(); x.stroke();
  x.fillStyle = '#17131f'; x.beginPath(); rr(x, -23, -34, 46, 34, 4); x.fill();
  x.fillStyle = '#2c2638'; x.fillRect(-23, -12, 46, 7); x.fillStyle = '#231e2e'; x.fillRect(-23, -20, 46, 7);     /* deux marches, de plus en plus sombres */
  /* une petite lueur qui bat, tout en bas */
  x.fillStyle = 'rgba(255,220,120,' + (.2 + .12 * Math.sin(t * 2.2)).toFixed(3) + ')'; x.beginPath(); x.ellipse(0, -27, 15, 6, 0, 0, 6.2832); x.fill();
  x.strokeStyle = '#c9c4b8'; x.lineWidth = 2.6; x.lineCap = 'round';
  for(var i = -2; i <= 2; i++){ x.beginPath(); x.moveTo(i * 9, -33); x.lineTo(i * 9, -1); x.stroke(); }
  x.beginPath(); x.moveTo(-22, -17); x.lineTo(22, -17); x.stroke();
  x.strokeStyle = K; x.lineWidth = 2.4; x.beginPath(); rr(x, -23, -34, 46, 34, 4); x.stroke();
  x.restore();
}

/* ==========================================================
   LE JEU
   ========================================================== */
function jouer(zone, p, fin){
  var M = creerMonde(p), fini = false, arrete = false;
  zone.innerHTML = '<div class="pg" tabindex="0"><canvas class="pg-sol"></canvas><svg class="pg-heros" viewBox="-22 -22 44 44" aria-hidden="true"><g class="pg-h"></g></svg>' +
    '<div class="pg-voile" aria-hidden="true"></div><div class="pg-dit"></div></div>';
  var racine = zone.querySelector('.pg'), cv = racine.querySelector('.pg-sol'), ctx = cv.getContext('2d'), svgH = racine.querySelector('.pg-heros'), gH = racine.querySelector('.pg-h'), dit = racine.querySelector('.pg-dit');
  var anim = null;
  try{ if(MJ.DESSUS){ gH.innerHTML = MJ.DESSUS.pisteur(); anim = MJ.DESSUS.Bonhomme(gH); anim.poser({ph:0, amp:0, t:0}); } }catch(e){}
  if(!gH.firstChild) gH.innerHTML = '<circle r="11" fill="#3f8f5a" stroke="' + K + '" stroke-width="2.4"/><circle cy="-3" r="6" fill="#f1c7a0" stroke="' + K + '" stroke-width="1.8"/>';
  var W = 0, H = 0, dpr = 1, ech = 3, motif = null;
  var pos = {x:M.depart.x, y:M.depart.y}, cap = Math.PI / 2, but = null, marche = 0, phase = 0, tPas = 0, aBouge = false, touches = {};
  function mesurer(){
    var r = racine.getBoundingClientRect(); if(!r.width || !r.height) return;
    W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    /* l'échelle : on voit à peu près 5 Pisteurs de large sur un téléphone, davantage sur une tablette ; une trace fait toujours une
       trentaine de points d'écran, pour qu'on compte ses doigts */
    ech = U.borne(Math.min(W, H) / 150, 2.5, 3.5);
    svgH.style.width = svgH.style.height = Math.round(44 * ech) + 'px';
    motif = null;
  }
  var ro = window.ResizeObserver ? new ResizeObserver(mesurer) : null;
  if(ro) ro.observe(racine); else window.addEventListener('resize', mesurer);
  mesurer();
  /* la phrase du conteur (une bulle, avec 🔊), tant qu'on n'a pas bougé */
  function dire(t){
    dit.innerHTML = t ? '<p>' + esc(t) + '</p>' : ''; dit.hidden = !t;
    if(t && MJ.boutonLire) try{ dit.appendChild(MJ.boutonLire(t)); }catch(e){}
  }
  dire('Du lait renversé, et des pattes partout ! Le Pisteur suit ton doigt : tant qu\'il est posé, il marche.');

  /* ----- où l'on peut marcher : dans une rue ou une impasse, à 9 unités des murs (les rues se touchent : on passe de l'une à l'autre) ----- */
  function dansRue(x, y){ for(var i = 0; i < M.rues.length; i++){ var r = M.rues[i]; if(x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true; } return false; }
  function libre(x, y){ return dansRue(x - 9, y) && dansRue(x + 9, y) && dansRue(x, y - 9) && dansRue(x, y + 9); }
  /* ----- le doigt ----- */
  function viser(ev){ var r = racine.getBoundingClientRect(); but = {x:ev.clientX - r.left - W / 2, y:ev.clientY - r.top - H / 2}; }
  function bas(ev){ if(fini || (ev.target && ev.target.closest && ev.target.closest('.mj-lire-mini, .b-lire, button'))) return; ev.preventDefault(); try{ racine.setPointerCapture(ev.pointerId); }catch(e){} viser(ev); }
  function bouge(ev){ if(but && !fini){ ev.preventDefault(); viser(ev); } }
  function haut(){ but = null; }
  racine.addEventListener('pointerdown', bas); racine.addEventListener('pointermove', bouge);
  racine.addEventListener('pointerup', haut); racine.addEventListener('pointercancel', haut); racine.addEventListener('lostpointercapture', haut);
  racine.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  var FL = {ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1]};
  function tBas(e){ if(FL[e.key]){ touches[e.key] = 1; e.preventDefault(); } }
  function tHaut(e){ if(FL[e.key]) delete touches[e.key]; }
  window.addEventListener('keydown', tBas); window.addEventListener('keyup', tHaut);

  /* ----- la fin : au bout d'une piste ----- */
  function finir(ok, F){
    if(fini) return; fini = true; but = null;
    if(ok){ U.son('magie'); dire('Les traces passent sous la grille de la crypte !'); }
    else { U.son('ko'); dire(LIEUX[F.lieu].t); }
    setTimeout(function(){
      if(arrete) return;
      if(ok) fin({reussi:true, score:1, message:'La crypte !', detail:'Les traces de Moustache passent sous la grille, au pied du clocher.'});
      else fin({reussi:false, score:0, message:'Ce n\'était pas Moustache…', detail:LIEUX[F.lieu].t + ' C\'était ' + CH.par[F.chat].nom + ' !'});
    }, ok ? 1500 : 1900);
  }

  /* ----- chaque image ----- */
  var stop = U.boucle(function(dt, t){
    if(arrete) return false;
    if(!W) mesurer();
    /* le pas : vers le doigt (ou les flèches du clavier) */
    var vx = 0, vy = 0, f = 0;
    if(!fini){
      if(but){ var d = Math.hypot(but.x, but.y); if(d > 16){ f = Math.min(1, (d - 10) / 46); vx = but.x / d; vy = but.y / d; } }
      else { Object.keys(touches).forEach(function(k){ vx += FL[k][0]; vy += FL[k][1]; }); var dk = Math.hypot(vx, vy); if(dk){ vx /= dk; vy /= dk; f = 1; } }
    }
    if(f > 0){
      var pas = VITESSE * f * dt, nxp = pos.x + vx * pas, nyp = pos.y + vy * pas;
      if(libre(nxp, nyp)){ pos.x = nxp; pos.y = nyp; }
      else if(libre(nxp, pos.y)){ pos.x = nxp; f *= Math.abs(vx); }      /* contre un mur : on glisse le long */
      else if(libre(pos.x, nyp)){ pos.y = nyp; f *= Math.abs(vy); }
      else f = 0;
      /* il tourne vers là où il va, sans à-coup */
      var vise = Math.atan2(vy, vx), da = Math.atan2(Math.sin(vise - cap), Math.cos(vise - cap)); cap += da * Math.min(1, dt * 12);
      if(!aBouge && f > 0){ aBouge = true; dire(''); }
    }
    marche += (f - marche) * Math.min(1, dt * 10);
    phase += dt * 9.5 * marche;
    if(marche > .5){ tPas += dt; if(tPas > .36){ tPas = 0; U.son('pas'); } }
    if(anim) anim.poser({ph:phase, amp:marche, t:t});
    gH.setAttribute('transform', 'rotate(' + (cap * 180 / Math.PI + 90).toFixed(1) + ')');
    /* au bout d'une piste ? */
    if(!fini){
      if(Math.hypot(pos.x - M.eglise.fx, pos.y - M.eglise.fy) < R_FIN + 6) finir(true);
      else for(var i = 0; i < M.fins.length; i++) if(Math.hypot(pos.x - M.fins[i].x, pos.y - M.fins[i].y) < R_FIN){ finir(false, M.fins[i]); break; }
    }
    dessiner(t);
  });
  function dessiner(t){
    if(!W) return;
    var s = ech * dpr, ox = cv.width / 2 - pos.x * s, oy = cv.height / 2 - pos.y * s;
    var x0 = pos.x - W / 2 / ech - 40, x1 = pos.x + W / 2 / ech + 40, y0 = pos.y - H / 2 / ech - 40, y1 = pos.y + H / 2 / ech + 40;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#6fa85a'; ctx.fillRect(0, 0, cv.width, cv.height);     /* l'herbe des jardins */
    ctx.setTransform(s, 0, 0, s, ox, oy);
    /* les rues : un bord sombre, puis les pavés */
    if(!motif){ try{ motif = ctx.createPattern(pave(), 'repeat'); }catch(e){ motif = '#b7a58a'; } }
    var i, r;
    ctx.fillStyle = '#7d6f5c';
    for(i = 0; i < M.rues.length; i++){ r = M.rues[i]; if(r.x < x1 && r.x + r.w > x0 && r.y < y1 && r.y + r.h > y0) ctx.fillRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); }
    ctx.fillStyle = motif;
    for(i = 0; i < M.rues.length; i++){ r = M.rues[i]; if(r.x < x1 && r.x + r.w > x0 && r.y < y1 && r.y + r.h > y0) ctx.fillRect(r.x, r.y, r.w, r.h); }
    /* les maisons et les arbres des pâtés qu'on voit */
    for(i = 0; i < M.pates.length; i++){
      var P = M.pates[i]; if(P.x > x1 || P.x + P.w < x0 || P.y > y1 || P.y + P.h < y0) continue;
      P.arbres.forEach(function(a){ dessinerArbre(ctx, a); }); P.maisons.forEach(function(m){ dessinerMaison(ctx, m); });
    }
    /* chez Odette, l'église, les bouts des fausses pistes */
    if(M.odette.by > y0 - 60 && M.odette.by < y1 + 60 && M.odette.bx > x0 - 80 && M.odette.bx < x1 + 80) dessinerOdette(ctx, M.odette);
    if(Math.abs(M.eglise.bx - pos.x) < (x1 - x0) / 2 + 220 && Math.abs(M.eglise.by - pos.y) < (y1 - y0) / 2 + 220) dessinerEglise(ctx, M.eglise, t);
    for(i = 0; i < M.fins.length; i++){ var F = M.fins[i]; if(F.bx > x0 - 70 && F.bx < x1 + 70 && F.by > y0 - 70 && F.by < y1 + 70) dessinerLieu(ctx, F); }
    /* les traces (par cases, pour ne regarder que celles qu'on voit) */
    var cx0 = Math.floor(x0 / M.CASE), cx1 = Math.floor(x1 / M.CASE), cy0 = Math.floor(y0 / M.CASE), cy1 = Math.floor(y1 / M.CASE), a, b, l, k, T;
    for(a = cx0; a <= cx1; a++) for(b = cy0; b <= cy1; b++){
      l = M.cases[a + ':' + b]; if(!l) continue;
      for(k = 0; k < l.length; k++){
        T = l[k]; if(T.x < x0 || T.x > x1 || T.y < y0 || T.y > y1) continue;
        CH.dessiner(ctx, T.c, T.x + .5, T.y + .6, T.a, TRACE * T.k, 'rgba(60,44,30,.3)', 1);    /* une ombre légère : la trace se détache des pavés */
        CH.dessiner(ctx, T.c, T.x, T.y, T.a, TRACE * T.k, '#fffdf4', T.al);
      }
    }
  }
  /* pour les essais */
  racine.__pistage = {monde:M, etat:function(){ return {x:pos.x, y:pos.y, fini:fini, ech:ech}; },
    poser:function(x, y){ pos.x = x; pos.y = y; }, aller:function(vx, vy){ but = vx == null ? null : {x:vx, y:vy}; }, libre:libre};
  return {arreter:function(){
    arrete = true; try{ stop(); }catch(e){}
    if(ro) ro.disconnect(); else window.removeEventListener('resize', mesurer);
    window.removeEventListener('keydown', tBas); window.removeEventListener('keyup', tHaut);
  }};
}

MJ.enregistrer('pistage', {
  nom:'Suivre les traces', ic:'🐾', role:'pisteur',
  consigne:'Plusieurs chats ont laissé leurs traces. Marche, regarde bien les pattes, et suis la bonne piste jusqu\'au bout. Au bout d\'une mauvaise piste, c\'est perdu.',
  reglages:function(n, mods){
    var p = {};
    p.faux = Math.max(2, Math.min(6, (n <= 3 ? 3 : n <= 6 ? 4 : n <= 8 ? 5 : 6) - (mods.aide || 0)));
    p.cinq = n >= 5;                      /* Noisette, à cinq doigts : presque Moustache */
    p.nx = n <= 4 ? 4 : 5; p.ny = n <= 4 ? 3 : 4;
    p.lignes = [{nom:'Fausses pistes', val:String(p.faux)}, {nom:'Un chat à cinq doigts', val:p.cinq ? 'oui' : 'non'}, {nom:'Le quartier', val:p.nx + ' rues sur ' + p.ny}];
    return p;
  },
  jouer:jouer
});
MJ.PLEIN_ECRAN = MJ.PLEIN_ECRAN || {}; MJ.PLEIN_ECRAN.pistage = 1;
MJ.LARGE = MJ.LARGE || {}; MJ.LARGE.pistage = 1;
MJ.PHRASES = MJ.PHRASES || {}; MJ.PHRASES.pistage = 'Suis les bonnes traces jusqu\'au bout. Pas les autres !';

/* ==========================================================
   L'explication en images, avant de jouer (MJ.DEMOS.pistage) : le Pisteur au milieu, trois pistes de petites pattes qui se
   séparent ; un doigt se pose, il marche vers lui ; au bout d'une piste, une grille ; au bout d'une autre, une croix.
   ========================================================== */
MJ.DEMOS = MJ.DEMOS || {};
MJ.DEMOS.pistage = {w:340, h:190, f:function(el){
  var W = 340, H = 190;
  el.innerHTML = '<canvas width="' + W * 2 + '" height="' + H * 2 + '" style="width:' + W + 'px;height:' + H + 'px;display:block;border-radius:14px"></canvas>' +
    '<svg viewBox="-22 -22 44 44" style="position:absolute;left:0;top:0;width:58px;height:58px;pointer-events:none"><g class="pgd-h"></g></svg><div class="pgd-doigt" style="position:absolute;left:0;top:0;font-size:30px;line-height:1;pointer-events:none">👆</div>';
  el.style.position = 'relative';
  var cv = el.querySelector('canvas'), x = cv.getContext('2d'), sv = el.querySelector('svg'), g = el.querySelector('.pgd-h'), doigt = el.querySelector('.pgd-doigt'), anim = null;
  try{ if(MJ.DESSUS){ g.innerHTML = MJ.DESSUS.pisteur(); anim = MJ.DESSUS.Bonhomme(g); } }catch(e){}
  /* trois pistes : celle du milieu va à la grille (à droite), une monte vers une impasse (une croix), une descend */
  var A = [{c:'moustache', pts:[{x:40, y:96}, {x:150, y:100}, {x:300, y:100}]}, {c:'pompon', pts:[{x:40, y:88}, {x:140, y:86}, {x:150, y:30}]}, {c:'caramel', pts:[{x:40, y:106}, {x:200, y:112}, {x:210, y:168}]}];
  var motif = null;
  function fond(){
    x.setTransform(2, 0, 0, 2, 0, 0);
    x.fillStyle = '#6fa85a'; x.fillRect(0, 0, W, H);
    if(!motif){ try{ motif = x.createPattern(pave(), 'repeat'); }catch(e){ motif = '#b7a58a'; } }
    x.fillStyle = '#7d6f5c'; x.fillRect(0, 68, W, 64); x.fillRect(122, 0, 56, 70); x.fillRect(182, 130, 56, 60);
    x.fillStyle = motif; x.fillRect(0, 71, W, 58); x.fillRect(125, 0, 50, 72); x.fillRect(185, 128, 50, 62);
    A.forEach(function(P){
      var pts = arrondir(P.pts, 16), L = longueur(pts), s = 8, n = 0;
      while(s < L - 4){ var q = point(pts, s), c = n % 2 ? 1 : -1; CH.dessiner(x, P.c, q.x + Math.cos(q.a + 1.5708) * 3.2 * c, q.y + Math.sin(q.a + 1.5708) * 3.2 * c, q.a + 1.5708, 6.6, '#fffdf4', 1); s += 19; n++; }
    });
    /* la grille, au bout */
    x.fillStyle = '#17131f'; x.strokeStyle = K; x.lineWidth = 2.4; x.beginPath(); x.moveTo(322, 84); x.lineTo(310, 84); x.arc(310, 100, 16, -1.5708, 1.5708, true); x.lineTo(322, 116); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#8f8a80'; x.lineWidth = 1.8; [90, 96, 102, 108].forEach(function(y){ x.beginPath(); x.moveTo(300, y); x.lineTo(322, y); x.stroke(); });
    /* les croix, au bout des deux autres */
    x.strokeStyle = '#e5484d'; x.lineWidth = 5; x.lineCap = 'round'; [[150, 18], [210, 178]].forEach(function(q){ x.beginPath(); x.moveTo(q[0] - 8, q[1] - 8); x.lineTo(q[0] + 8, q[1] + 8); x.moveTo(q[0] + 8, q[1] - 8); x.lineTo(q[0] - 8, q[1] + 8); x.stroke(); });
  }
  fond();
  var pts = arrondir(A[0].pts, 16), L = longueur(pts);
  function image(u){
    var q = point(pts, 4 + (L - 36) * u), d = point(pts, Math.min(L, 4 + (L - 36) * u + 62));
    sv.style.transform = 'translate(' + (q.x - 29) + 'px,' + (q.y - 29) + 'px)'; g.setAttribute('transform', 'rotate(' + (q.a * 180 / Math.PI + 90).toFixed(1) + ')');
    doigt.style.transform = 'translate(' + (d.x - 12) + 'px,' + (d.y - 2) + 'px)';
    if(anim) anim.poser({ph:u * 40, amp:u > 0 && u < 1 ? 1 : 0, t:u * 5});
  }
  if(reduit()){ image(.45); return {arreter:function(){}}; }
  var t0 = null, arr = false;
  (function tic(ts){ if(arr) return; if(t0 === null) t0 = ts; var u = ((ts - t0) / 1000 % 5.4) / 4.2; image(Math.min(1, u)); requestAnimationFrame(tic); })(performance.now());
  return {arreter:function(){ arr = true; }};
}};
})();
