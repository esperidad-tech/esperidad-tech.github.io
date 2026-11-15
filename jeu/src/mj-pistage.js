/* ==========================================================
   Brumeval — « Suivre les traces » : le Pisteur marche librement, la caméra le suit (enquête 3 : les traces de Moustache)

   CE QUE ROMAIN A DEMANDÉ (13 novembre) — il remplace, pour Moustache, l'ancien « Suivre la piste » où le sol défilait tout seul :
   · « Le Pisteur va être au centre de l'image, et quand il avance ou quand il recule, la caméra le suit. »
   · « Simplement, il doit trouver les bonnes traces et aller jusqu'à l'église. S'il suit des mauvaises traces jusqu'à un point précis,
     là, il perd. » On ne perd donc jamais par maladresse : seulement en allant AU BOUT d'une mauvaise piste.
   · « Fais en sorte que les traces ne soient pas énormes […] » ; « que même en petit, on arrive à reconnaître les traces des chats ».
   · « Tu fais démarrer le jeu depuis chez Odette. » Pas de code pour dire quelle trace suivre : le Sage a le carnet d'Odette
     (chats.js), il le dit à voix haute. Ici, rien ne dit laquelle est la bonne.

   LA REFONTE DU 15 NOVEMBRE (Romain, 12 h 56 : « je pense qu'il reviendra […] Je veux qu'il soit bien travaillé »)
   · « augmenter le niveau de détail du décor », « beaucoup, beaucoup plus travailler les textures », « un joli mini-jeu » :
     une vraie petite ville vue du ciel — des pavés un par un, des trottoirs, des toits de tuiles et d'ardoise avec leurs rangs,
     leurs cheminées, leurs lucarnes, des cours, des jardins, des potagers, des puits, des tonneaux, des étals, des lanternes,
     du linge qui sèche, des arbres touffus, des pigeons, l'église et son cimetière, la maison d'Odette et son lait renversé.
   · « des flaques d'eau qui font disparaître un peu les traces » ; « quand il passe dans la flaque, les traces changent de couleur,
     parce qu'au début c'est des traces de lait » ; « petit à petit […] elles finissent par sécher » : chaque chat a les pattes pleines
     de lait chez Odette, et ses traces pâlissent à mesure qu'il marche ; dans une flaque (ou la boue, ou la farine), on ne voit plus
     rien, puis ses traces repartent mouillées (sombres), boueuses (brunes) ou farinées (toutes blanches), bien nettes, et sèchent à
     leur tour. Elles ne disparaissent jamais tout à fait (le « plancher » de chaque niveau) : on peut toujours les suivre.
   · « un système un peu de saut » : des caisses, des tonneaux, une charrette, des sacs, du bois au milieu de la rue ; le chat saute
     par-dessus (un trou dans ses traces, deux pattes serrées à l'appel, quatre à la réception). Le Pisteur, lui, doit faire le tour.
     Parfois aussi, un chat saute par-dessus une petite flaque au lieu de marcher dedans : ses traces restent de lait.
   · « le chat passe sous une arche […] on doit passer sous l'arche, et les traces disparaissent » : des maisons construites
     par-dessus la rue (un passage couvert). Dessous, il fait sombre et il n'y a plus une trace ; le Pisteur y passe (le toit devient
     transparent au-dessus de lui) et cherche de l'autre côté laquelle ressort.
   · « tes propres traces de pas » : le Pisteur ne laisse rien… tant qu'il ne marche pas dans une flaque, la boue ou la farine ; ses
     semelles marquent alors le sol (de moins en moins fort), et ses traces sèchent toutes seules (l'eau vite, la farine moins, la boue
     lentement). Elles passent PAR-DESSUS celles des chats : plus on tourne en rond, plus on se gêne.
   · « 2 ou 3 chats qui passent […] tu les vois passer à côté de toi […] une jolie animation » : deux ou trois fois par partie, un des
     autres chats d'Odette arrive en courant derrière le Pisteur, le dépasse et file ; ses traces toutes fraîches (mouillées) s'ajoutent,
     puis sèchent. Il disparaît d'un bond sur un toit.
   · « le chat gris d'Odette […] miaule devant l'entrée de la crypte […] dès qu'il nous voit arriver, hop, il fuit » : Moustache est
     assis devant la grille et miaule (on l'entend de plus en plus fort en approchant) ; quand le Pisteur arrive, il file entre les
     barreaux et disparaît dans le noir. On ne peut pas le suivre : il reste la grille (c'est gagné, comme avant).
   · « des éclairages matin, après-midi et nuit, en fonction de quand il va voir les traces » : le moment de l'enquête (M.momentId),
     ou params.moment. Le matin : un soleil bas, de longues ombres vers l'ouest, une brume qui traîne ; l'après-midi : la lumière
     dorée, des ombres courtes ; la nuit : tout est bleu et sombre, sauf la lanterne du Pisteur, les lanternes des carrefours, les
     fenêtres allumées, celles de l'église.

   COMMENT C'EST FAIT (pour la fluidité : jeu/donjon/RAPIDITE.md)
   · Le quartier : des rues en quadrillage, des impasses ; le monde est tiré au hasard à chaque partie. Chez Odette (une impasse en
     haut), du lait renversé ; la piste de Moustache mène à l'église, tout au bout ; chaque autre piste finit dans une impasse.
   · TOUT CE QUI NE BOUGE PAS (le sol, les maisons, les arbres, les flaques, les traces des chats) est dessiné UNE FOIS, par morceaux
     de 512 × 512 points de l'écran (Blocs), au moment où ils vont entrer dans l'écran ; ensuite, chaque image ne fait que les
     recopier. Seuls sont redessinés à chaque image : les traces du Pisteur, les chats qui courent, Moustache, les pigeons, les rides
     d'une flaque, et, sur deux toiles au-dessus du Pisteur, les toits des passages couverts, les arbres qui débordent sur la rue,
     le linge, la fumée des cheminées, puis la lumière (une toile trois fois plus petite, étirée : la nuit, la brume).
   · Les traces des chats : chats.js (une seule source avec le carnet du Sage). Le Pisteur : celui de « Se cacher », vu du dessus
     (MJ.DESSUS, mj-cachette.js). Chargé APRÈS chats.js, mj-core.js et mj-cachette.js.
   · Les sons : la fabrique sonsPistage (entre ses deux bornes) est recopiée telle quelle dans l'Atelier des sons
     (donjon/essai/construire-sons.py, donjon/essai/sons/pistage.js).
   · Pour les essais : la zone porte __pistage ({etat(), monde, aller(x, y), poser(x, y), libre(x, y), coureur(), moustache(),
     pas(), chaussures(), moment, mesures()}).
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
var CPX = 512;            /* un morceau du décor déjà dessiné : 512 × 512 points de l'écran */
var MARGE = 340;          /* autour du quartier : des jardins, des vergers */
var PI = Math.PI, TAU = Math.PI * 2;
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function reduit(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function lerp(a, b, t){ return a + (b - a) * t; }
/* un hasard qui redonne toujours la même suite pour une même graine (un morceau du décor redessiné est identique) */
function graine(n){ var s = (Math.abs(Math.floor(n)) % 2147483646) + 1; return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
function nouvelleGraine(){ return Math.floor(Math.random() * 2e9) + 1; }
function hex(c){ var n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t){ var A = hex(a), B = hex(b), o = '#'; for(var i = 0; i < 3; i++){ var v = Math.round(A[i] + (B[i] - A[i]) * t); o += (v < 16 ? '0' : '') + v.toString(16); } return o; }
function rgba(c, a){ var A = hex(c); return 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + a + ')'; }
function croise(a, b, m){ m = m || 0; return a.x < b.x + b.w + m && a.x + a.w > b.x - m && a.y < b.y + b.h + m && a.y + a.h > b.y - m; }
function dans(r, x, y, m){ m = m || 0; return x >= r.x - m && x <= r.x + r.w + m && y >= r.y - m && y <= r.y + r.h + m; }
function rr(x, a, b, w, h, r){ r = Math.min(r, w / 2, h / 2); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function rond(x, cx, cy, r){ x.beginPath(); x.arc(cx, cy, r, 0, TAU); }
function ovale(x, cx, cy, rx, ry, a){ x.beginPath(); x.ellipse(cx, cy, Math.max(.01, rx), Math.max(.01, ry), a || 0, 0, TAU); }
/* l'enveloppe d'un nuage de points (pour l'ombre d'une maison : sa forme et sa forme décalée) */
function enveloppe(P){
  P = P.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
  function c(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  var bas = [], haut = [], i;
  for(i = 0; i < P.length; i++){ while(bas.length >= 2 && c(bas[bas.length - 2], bas[bas.length - 1], P[i]) <= 0) bas.pop(); bas.push(P[i]); }
  for(i = P.length - 1; i >= 0; i--){ while(haut.length >= 2 && c(haut[haut.length - 2], haut[haut.length - 1], P[i]) <= 0) haut.pop(); haut.push(P[i]); }
  haut.pop(); bas.pop(); return bas.concat(haut);
}

/* ---------- les bouts des fausses pistes ---------- */
var LIEUX = {
  voisin:{nom:'chez le voisin', t:'Ces traces s\'arrêtent chez le voisin, devant six gamelles vides.'},
  boulangerie:{nom:'derrière la boulangerie', t:'Ces traces s\'arrêtent derrière la boulangerie, le nez dans la farine.'},
  lavoir:{nom:'au lavoir', t:'Ces traces s\'arrêtent au bord du lavoir.'},
  arbre:{nom:'au pied d\'un arbre', t:'Ces traces s\'arrêtent au pied d\'un arbre : ce chat-là dort tout là-haut.'},
  carriole:{nom:'sous la carriole de Fortuné', t:'Ces traces s\'arrêtent sous la carriole de Fortuné.'},
  potager:{nom:'dans le potager', t:'Ces traces s\'arrêtent dans les choux de Basile.'}
};

/* ---------- la lumière de chaque moment ----------
   ombre : là où tombent les ombres (le soleil est de l'autre côté) ; l : leur longueur pour une hauteur de 1 ; a : leur force.
   ciel : ce que reflètent les flaques. */
var LUM = {
  matin:{ombre:{x:-1, y:-.3, l:1.5, a:.3}, ciel:'#d2dcea', cielB:'#98abc6', reflet:'rgba(255,238,224,.6)', herbe:0},
  apresmidi:{ombre:{x:.62, y:-.58, l:.85, a:.27}, ciel:'#9ccaee', cielB:'#5f90c2', reflet:'rgba(255,255,255,.62)', herbe:0},
  nuit:{ombre:{x:.3, y:-.55, l:.6, a:.18}, ciel:'#3b4d78', cielB:'#1e2a48', reflet:'rgba(200,215,255,.32)', herbe:0, nuit:true}
};
/* ce que les chats ont sous les pattes, et ce qu'en garde une trace de plus (elle pâlit) */
var PERTE = {eau:.9, boue:.945, farine:.955};
var DE_TACHE = {flaque:'eau', boue:'boue', farine:'farine'};
/* les semelles du Pisteur : ce qu'elles gardent d'un pas à l'autre, combien de secondes une trace met à sécher, sa force, sa couleur */
var SEMELLE = {eau:{perte:.91, vie:55, a:.62, c:'#2a221e'}, boue:{perte:.94, vie:160, a:.92, c:'#5e3f21'}, farine:{perte:.93, vie:110, a:.92, c:'#ffffff'}};
var VENT = {x:.92, y:-.38};

/* ==========================================================
   LE MONDE : le quadrillage, les impasses, les pistes, les passages couverts, les obstacles, les flaques, les traces, le décor
   ========================================================== */
function creerMonde(p){
  var NX = p.nx, NY = p.ny, miroir = Math.random() < .5;
  function nx(i){ return BORD + (miroir ? NX - 1 - i : i) * PASX; }
  function ny(j){ return BORD + IMPASSE + j * PASY; }
  var Wm = BORD * 2 + (NX - 1) * PASX, Hm = BORD * 2 + IMPASSE + (NY - 1) * PASY + IMPASSE;
  var rues = [], i, j, k;
  for(i = 0; i < NX; i++) rues.push({x:nx(i) - RUE / 2, y:ny(0) - RUE / 2, w:RUE, h:(NY - 1) * PASY + RUE});
  for(j = 0; j < NY; j++) rues.push({x:Math.min(nx(0), nx(NX - 1)) - RUE / 2, y:ny(j) - RUE / 2, w:(NX - 1) * PASX + RUE, h:RUE});
  /* une impasse : depuis un point d'une rue (mx, my), dans la direction (dx, dy), sur IMPASSE */
  function impasse(mx, my, dx, dy, lg){
    lg = lg || IMPASSE;
    var r = dx ? {x:dx > 0 ? mx : mx - lg, y:my - RUE / 2, w:lg, h:RUE} : {x:mx - RUE / 2, y:dy > 0 ? my : my - lg, w:RUE, h:lg};
    r.imp = true; rues.push(r);
    return {mx:mx, my:my, dx:dx, dy:dy, fx:mx + dx * (lg - 26), fy:my + dy * (lg - 26), bx:mx + dx * lg, by:my + dy * lg, rect:r};
  }
  /* chez Odette : une impasse au-dessus du premier carrefour */
  var odette = impasse(nx(0), ny(0) - RUE / 2, 0, -1);
  /* l'église : au bout du quartier, à l'opposé — après le dernier carrefour, vers le bas ou vers le côté (tiré au hasard) */
  var eg = U.choix([[NX - 1, NY - 1, 'bas'], [NX - 1, NY - 1, 'cote'], [NX - 1, NY - 2, 'cote'], [NX - 2, NY - 1, 'bas']]);
  var sx = miroir ? -1 : 1;
  var eglise = eg[2] === 'bas' ? impasse(nx(eg[0]), ny(eg[1]) + RUE / 2, 0, 1, IMPASSE + 14) : impasse(nx(eg[0]) + sx * RUE / 2, ny(eg[1]), sx, 0, IMPASSE + 14);
  eglise.noeud = [eg[0], eg[1]];
  var depart = {x:odette.fx, y:odette.fy + 30};

  /* ---- les arêtes où brancher une impasse (au milieu d'un bout de rue, vers l'intérieur d'un pâté de maisons) ---- */
  var libres = [];
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY; j++){
    if(j > 0) libres.push({a:[i, j], b:[i + 1, j], mx:(nx(i) + nx(i + 1)) / 2, my:ny(j) - RUE / 2, dx:0, dy:-1});
    if(j < NY - 1) libres.push({a:[i, j], b:[i + 1, j], mx:(nx(i) + nx(i + 1)) / 2, my:ny(j) + RUE / 2, dx:0, dy:1});
  }
  for(i = 0; i < NX; i++) for(j = 0; j < NY - 1; j++){
    var g0 = Math.min(nx(0), nx(NX - 1)), d0 = Math.max(nx(0), nx(NX - 1));
    if(nx(i) > g0) libres.push({a:[i, j], b:[i, j + 1], mx:nx(i) - RUE / 2, my:(ny(j) + ny(j + 1)) / 2, dx:-1, dy:0});
    if(nx(i) < d0) libres.push({a:[i, j], b:[i, j + 1], mx:nx(i) + RUE / 2, my:(ny(j) + ny(j + 1)) / 2, dx:1, dy:0});
  }
  function dist(n){ return n[0] + n[1]; }
  libres = U.melanger(libres);
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
  var noms = U.melanger(Object.keys(LIEUX).filter(function(k2){ return k2 !== 'voisin'; }));
  var couloirs = U.melanger(COULOIRS.slice());
  var pistes = [], fins = [], reserves = [];
  function chemin(n){
    var l = [], q; for(q = 0; q < n[0]; q++) l.push([1, 0]); for(q = 0; q < n[1]; q++) l.push([0, 1]);
    l = U.melanger(l);
    var c = [0, 0], r = [[0, 0]]; l.forEach(function(m){ c = [c[0] + m[0], c[1] + m[1]]; r.push(c); });
    return r;
  }
  function ligne(noeuds, o, vers, fin){
    var pts = [{x:odette.fx + o, y:odette.fy}], sens = 'v', q, a, b, s2;
    for(q = 0; q < noeuds.length - 1; q++){
      a = noeuds[q]; b = noeuds[q + 1]; s2 = a[0] !== b[0] ? 'h' : 'v';
      if(s2 !== sens){ pts.push({x:nx(a[0]) + o, y:ny(a[1]) + o}); sens = s2; }
    }
    var der = noeuds[noeuds.length - 1];
    var sImp = vers.dx ? 'h' : 'v';
    if(vers.noeud){ if(sImp !== sens) pts.push({x:nx(der[0]) + o, y:ny(der[1]) + o}); }
    else {
      var sRue = vers.dx ? 'v' : 'h';
      if(sRue !== sens){ pts.push({x:nx(der[0]) + o, y:ny(der[1]) + o}); sens = sRue; }
      pts.push(sRue === 'h' ? {x:vers.mx + o, y:ny(der[1]) + o} : {x:nx(der[0]) + o, y:vers.my + o});
    }
    pts.push(sImp === 'h' ? {x:fin.fx, y:fin.fy + o * .55} : {x:fin.fx + o * .55, y:fin.fy});
    return pts;
  }
  var oM = couloirs.pop();
  pistes.push({chat:'moustache', bon:true, pts:ligne(chemin(eglise.noeud), oM, eglise, eglise)});
  autres.forEach(function(c, n){
    var e = null, q;
    for(q = 0; q < libres.length && !e; q++){
      var L = libres[q], pres = Math.min(dist(L.a), dist(L.b));
      if(!loin(L)) continue;
      if(n === 0 ? pres > 1 : pres < 1) continue;
      e = L; libres.splice(q, 1);
    }
    if(!e) return;
    prises.push(e);
    var imp = impasse(e.mx, e.my, e.dx, e.dy);
    var lieu = n === 0 ? 'voisin' : noms[(n - 1) % noms.length];
    var dep = dist(e.a) <= dist(e.b) ? e.a : e.b;
    var o = couloirs.pop();
    pistes.push({chat:c.id, bon:false, lieu:lieu, pts:ligne(chemin(dep), o, e, imp)});
    fins.push({x:imp.fx, y:imp.fy, bx:imp.bx, by:imp.by, dx:e.dx, dy:e.dy, lieu:lieu, chat:c.id, e:e, rect:imp.rect, g:nouvelleGraine()});
    reserves.push({x:imp.bx + e.dx * 34 - 64, y:imp.by + e.dy * 34 - 64, w:128, h:128});
  });

  /* ---- la géométrie : où sont les rues, à quel bout de rue appartient un point ---- */
  var gx = [], gy = [];
  for(i = 0; i < NX; i++) gx.push(nx(i)); gx.sort(function(a, b){ return a - b; });
  for(j = 0; j < NY; j++) gy.push(ny(j));
  function dansRue(x, y){ for(var q = 0; q < rues.length; q++){ var r = rues[q]; if(x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true; } return false; }
  /* 'h:i:j' : la rue j, entre les colonnes i et i+1 ; 'v:i:j' : la colonne i, entre les rues j et j+1 ; 'c:i:j' : un carrefour */
  function segment(x, y){
    var ci = -1, rj = -1, q;
    for(q = 0; q < gx.length; q++) if(Math.abs(x - gx[q]) <= RUE / 2) ci = q;
    for(q = 0; q < gy.length; q++) if(Math.abs(y - gy[q]) <= RUE / 2) rj = q;
    if(ci >= 0 && rj >= 0) return 'c:' + ci + ':' + rj;
    if(ci >= 0){ if(y < gy[0] || y > gy[gy.length - 1]) return null; for(q = 0; q < gy.length - 1; q++) if(y > gy[q] && y < gy[q + 1]) return 'v:' + ci + ':' + q; return null; }
    if(rj >= 0){ if(x < gx[0] || x > gx[gx.length - 1]) return null; for(q = 0; q < gx.length - 1; q++) if(x > gx[q] && x < gx[q + 1]) return 'h:' + q + ':' + rj; return null; }
    return null;
  }
  function geoSeg(key){
    var a = key.split(':'), t = a[0], ii = +a[1], jj = +a[2];
    if(t === 'h') return {sens:'h', a0:gx[ii] + RUE / 2, a1:gx[ii + 1] - RUE / 2, c:gy[jj]};
    return {sens:'v', a0:gy[jj] + RUE / 2, a1:gy[jj + 1] - RUE / 2, c:gx[ii]};
  }
  pistes.forEach(function(P){ P.lisse = arrondir(P.pts, 20); P.longueur = longueur(P.lisse); });
  var usage = {}, segImp = {};
  fins.forEach(function(F){ var key = segment(F.e.mx - F.e.dx * 6, F.e.my - F.e.dy * 6); if(key) segImp[key] = 1; });
  pistes.forEach(function(P, ip){ for(var s = 0; s < P.longueur; s += 8){ var q = point(P.lisse, s), key = segment(q.x, q.y); if(key && key.charAt(0) !== 'c') (usage[key] = usage[key] || {})[ip] = 1; } });
  function nbUsage(key){ return Object.keys(usage[key] || {}).length; }

  /* ---- les passages couverts : une maison bâtie par-dessus la rue, là où passent au moins deux pistes ---- */
  var arches = [], segArche = {};
  var candA = U.melanger(Object.keys(usage).filter(function(key){ return nbUsage(key) >= 2 && !segImp[key]; }));
  candA.sort(function(a, b){ return (usage[b][0] ? 1 : 0) - (usage[a][0] ? 1 : 0); });   /* le premier sur le chemin de Moustache */
  for(i = 0; i < candA.length && arches.length < (p.arches || 0); i++){
    var key = candA[i], g = geoSeg(key), La = U.rand(56, 70), mid = (g.a0 + g.a1) / 2, A;
    A = g.sens === 'h' ? {x:mid - La / 2, y:g.c - RUE / 2, w:La, h:RUE} : {x:g.c - RUE / 2, y:mid - La / 2, w:RUE, h:La};
    A.sens = g.sens; A.k = key; A.g = nouvelleGraine(); A.cx = A.x + A.w / 2; A.cy = A.y + A.h / 2;
    A.bat = g.sens === 'h' ? {x:A.x - 4, y:A.y - 34, w:A.w + 8, h:A.h + 68} : {x:A.x - 34, y:A.y - 4, w:A.w + 68, h:A.h + 8};
    if(arches.some(function(B){ return Math.hypot(B.cx - A.cx, B.cy - A.cy) < 300; })) continue;
    arches.push(A); segArche[key] = 1;
  }
  function dansArche(x, y, m){ for(var q = 0; q < arches.length; q++) if(dans(arches[q], x, y, m || 0)) return arches[q]; return null; }

  /* ---- les obstacles par-dessus lesquels les chats sautent : collés à un mur, ils coupent une partie de la rue ---- */
  var obstacles = [], segOb = {};
  function latPiste(P, G, along){
    for(var s = 0; s < P.longueur; s += 2.5){ var q = point(P.lisse, s), a = G.sens === 'h' ? q.x : q.y, l = G.sens === 'h' ? q.y - G.c : q.x - G.c;
      if(Math.abs(a - along) < 2 && Math.abs(l) < RUE / 2 && segment(q.x, q.y) === G.key) return l; }
    return null;
  }
  var TYPES_OB = ['caisses', 'tonneaux', 'charrette', 'sacs', 'bois', 'paniers'];
  var ordreP = [0].concat(U.melanger(pistes.map(function(P, ip){ return ip; }).slice(1))), io = 0;
  for(var essai = 0; essai < 80 && obstacles.length < (p.sauts || 0); essai++){
    var ip = ordreP[io++ % ordreP.length], P = pistes[ip];
    var ks = Object.keys(usage).filter(function(key2){ return usage[key2][ip] && !segArche[key2] && !segOb[key2]; });
    if(!ks.length) continue;
    var k2 = U.choix(ks), g2 = geoSeg(k2), u = Math.random() < .5 ? U.rand(.2, .3) : U.rand(.7, .8), along = g2.a0 + (g2.a1 - g2.a0) * u;
    g2.key = k2;
    var lat = latPiste(P, g2, along); if(lat == null) continue;
    var Lo = U.rand(22, 30), cote = lat < -3 ? -1 : lat > 3 ? 1 : (Math.random() < .5 ? -1 : 1), a0, a1;
    if(cote < 0){ a0 = -RUE / 2; a1 = lat + U.rand(8, 11); } else { a0 = lat - U.rand(8, 11); a1 = RUE / 2; }
    if(a1 - a0 < 18){ if(cote < 0) a1 = a0 + 18; else a0 = a1 - 18; }
    if(a1 - a0 > 50) continue;
    var O = g2.sens === 'h' ? {x:along - Lo / 2, y:g2.c + a0, w:Lo, h:a1 - a0} : {x:g2.c + a0, y:along - Lo / 2, w:a1 - a0, h:Lo};
    if(Math.hypot(O.x + O.w / 2 - depart.x, O.y + O.h / 2 - depart.y) < 170) continue;
    O.sens = g2.sens; O.cote = cote; O.type = U.choix(TYPES_OB); O.g = nouvelleGraine(); O.k = k2; O.haut = O.type === 'charrette' ? 12 : O.type === 'bois' || O.type === 'sacs' ? 7 : 10;
    obstacles.push(O); segOb[k2] = 1;
  }
  function dansObstacle(x, y, m){ for(var q = 0; q < obstacles.length; q++) if(dans(obstacles[q], x, y, m || 0)) return obstacles[q]; return null; }

  /* ---- les flaques, la boue, la farine : sur les pistes (la première sur celle de Moustache), et deux flaques au hasard ---- */
  var taches = [];
  var aFaire = [], boul = -1;
  for(i = 0; i < (p.flaques || 0); i++) aFaire.push('flaque');
  for(i = 0; i < (p.boues || 0); i++) aFaire.push('boue');
  for(i = 0; i < (p.farines || 0); i++) aFaire.push('farine');
  pistes.forEach(function(P2, ip2){ if(P2.lieu === 'boulangerie') boul = ip2; });
  var premFarine = true;
  function tachePossible(cx, cy, rx){
    if(!dansRue(cx, cy)) return false;
    if(Math.hypot(cx - depart.x, cy - depart.y) < 175 || Math.hypot(cx - eglise.fx, cy - eglise.fy) < 150) return false;
    if(fins.some(function(F){ return Math.hypot(cx - F.x, cy - F.y) < 74; })) return false;
    var bb = {x:cx - rx, y:cy - rx, w:rx * 2, h:rx * 2};
    if(arches.some(function(A2){ return croise(A2, bb, 14); }) || obstacles.some(function(O2){ return croise(O2, bb, 24); })) return false;
    if(taches.some(function(T){ return Math.hypot(T.x - cx, T.y - cy) < T.rx + rx + 34; })) return false;
    return true;
  }
  function nouvelleTache(type, cx, cy, rx, rot){
    var m = [], v = 1; for(var q = 0; q < 14; q++){ v = U.borne(v + U.rand(-.16, .16), .74, 1.16); m.push(v); }
    m[13] = (m[12] + m[0]) / 2;
    var T = {type:type, x:cx, y:cy, rx:rx, ry:rx * U.rand(.55, .78), rot:rot, m:m, g:nouvelleGraine(), saut:{}};
    taches.push(T); return T;
  }
  aFaire.forEach(function(type, idx){
    for(var e3 = 0; e3 < 50; e3++){
      var versBoul = type === 'farine' && premFarine && boul >= 0;
      var ip3 = idx === 0 ? 0 : versBoul ? boul : (Math.random() < .3 ? 0 : Math.floor(Math.random() * pistes.length));
      var P3 = pistes[ip3], s3 = versBoul ? P3.longueur - U.rand(84, 120) : U.rand(175, P3.longueur - 110);
      if(s3 < 150) continue;
      var q3 = point(P3.lisse, s3);
      var rx = type === 'flaque' ? U.rand(16, 27) : type === 'boue' ? U.rand(15, 23) : U.rand(13, 18);
      var sh = U.rand(-8, 8), cx = q3.x + Math.cos(q3.a + PI / 2) * sh, cy = q3.y + Math.sin(q3.a + PI / 2) * sh;
      if(!tachePossible(cx, cy, rx)) continue;
      nouvelleTache(type, cx, cy, rx, q3.a + U.rand(-.3, .3));
      if(versBoul) premFarine = false;
      break;
    }
  });
  /* deux flaques au hasard, sur aucune piste en particulier (elles mouillent les semelles du Pisteur) */
  for(i = 0; i < 2; i++) for(var e4 = 0; e4 < 30; e4++){
    var rq = U.choix(rues.filter(function(r){ return !r.imp; }));
    var px4 = U.rand(rq.x + 16, rq.x + rq.w - 16), py4 = U.rand(rq.y + 16, rq.y + rq.h - 16), rx4 = U.rand(14, 22);
    if(!tachePossible(px4, py4, rx4)) continue;
    nouvelleTache('flaque', px4, py4, rx4, rq.w > rq.h ? U.rand(-.3, .3) : PI / 2 + U.rand(-.3, .3)); break;
  }
  function dansTache(x, y, m){
    m = m || 0;
    for(var q = 0; q < taches.length; q++){
      var T = taches[q], dx = x - T.x, dy = y - T.y;
      if(Math.abs(dx) > T.rx * 1.2 + m || Math.abs(dy) > T.rx * 1.2 + m) continue;
      if(dansForme(T, x, y, m)) return T;
    }
    return null;
  }

  /* ---- on doit toujours pouvoir aller au bout de chaque piste : sinon, on retire le dernier obstacle posé ---- */
  function libreM(x, y){ return dansRue(x - 9, y) && dansRue(x + 9, y) && dansRue(x, y - 9) && dansRue(x, y + 9) && !dansObstacle(x, y, 9); }
  function joignable(){
    var G = 8, cw = Math.ceil(Wm / G) + 2, chh = Math.ceil(Hm / G) + 2, vu = new Uint8Array(cw * chh), f = [];
    var a = Math.round(depart.x / G), b = Math.round(depart.y / G);
    if(!libreM(a * G, b * G)) return true;
    vu[b * cw + a] = 1; f.push(b * cw + a);
    while(f.length){
      var c = f.pop(), cx = c % cw, cy = (c - cx) / cw;
      for(var d = 0; d < 4; d++){
        var ax = cx + (d === 0 ? 1 : d === 1 ? -1 : 0), ay = cy + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if(ax < 0 || ay < 0 || ax >= cw || ay >= chh) continue;
        var id = ay * cw + ax; if(vu[id]) continue;
        if(libreM(ax * G, ay * G)){ vu[id] = 1; f.push(id); }
      }
    }
    function ok(x, y){ var X = Math.round(x / G), Y = Math.round(y / G); for(var u2 = -1; u2 <= 1; u2++) for(var v2 = -1; v2 <= 1; v2++){ if(vu[(Y + v2) * cw + X + u2]) return true; } return false; }
    return fins.every(function(F){ return ok(F.x, F.y); }) && ok(eglise.fx, eglise.fy);
  }
  while(obstacles.length && !joignable()){ var Ob = obstacles.pop(); delete segOb[Ob.k]; }

  /* ==== les traces : on suit chaque ligne ; une patte à gauche, une à droite ; le lait pâlit ; une flaque, la boue, la farine
     changent ce que le chat a sous les pattes ; sous un passage couvert, rien ; par-dessus un obstacle, il saute ==== */
  var traces = [], CASE = 220, cases = {};
  function poser(t){ traces.push(t); var cle = Math.floor(t.x / CASE) + ':' + Math.floor(t.y / CASE); (cases[cle] = cases[cle] || []).push(t); }
  var plancher = p.plancher == null ? .32 : p.plancher, trouMax = p.trou || 0, perteLait = p.lait || .98;
  pistes.forEach(function(P, ipp){
    var pts = P.lisse, L = P.longueur, s = 14, nP = 0, sub = 'lait', c = 1, dedans = null, enSaut = false;
    var pk = CH.par[P.chat].trace.k < .8 ? .8 : 1;
    function une(q, cote, ecart, dec){
      var x = q.x + Math.cos(q.a + PI / 2) * ecart * cote + Math.cos(q.a) * (dec || 0) + U.rand(-.9, .9);
      var y = q.y + Math.sin(q.a + PI / 2) * ecart * cote + Math.sin(q.a) * (dec || 0) + U.rand(-.9, .9);
      if(!dansRue(x, y) || dansObstacle(x, y, 3) || dansArche(x, y, 1) || dansTache(x, y, 1)) return;
      poser({x:x, y:y, a:q.a + PI / 2 + U.rand(-.12, .12), c:P.chat, sub:sub, al:plancher + (1 - plancher) * c, k:U.rand(.94, 1.06), g:nouvelleGraine()});
    }
    function serrees(q, quatre){   /* l'appel (deux pattes serrées) ou la réception (quatre) d'un saut */
      une(q, -1, 2.6, 0); une(q, 1, 2.6, 0);
      if(quatre){ une(q, -1, 3.2, 8.5); une(q, 1, 3.2, 8.5); }
    }
    while(s < L - 6){
      var q = point(pts, s), cote = nP % 2 ? 1 : -1, pas = PAS_CHAT * pk * U.rand(.93, 1.07);
      if(dansArche(q.x, q.y, 3)){ s += pas; nP++; continue; }          /* sous le passage couvert : rien */
      var ob = dansObstacle(q.x, q.y, 8);
      if(ob){
        if(!enSaut){   /* l'appel : on recule jusqu'à être devant l'obstacle, et là, deux pattes serrées */
          enSaut = true; var sb = s, qb = q;
          while(sb > 0 && dansObstacle(qb.x, qb.y, 9)){ sb -= 2; qb = point(pts, sb); }
          serrees(qb, false);
        }
        s += pas * .6; continue;
      }
      if(enSaut){ enSaut = false; serrees(q, true); s += pas * 1.4; nP += 2; continue; }
      var ta = dansTache(q.x, q.y, 1);
      if(ta){
        if(ta !== dedans){ dedans = ta; if(ta.type === 'flaque' && ta.rx < 23 && Math.random() < .35 && !ta.saut.pris){ ta.saut[ipp] = 1; } }
        if(!ta.saut[ipp]){ sub = DE_TACHE[ta.type]; c = 1; }
        s += pas; nP++; continue;                                        /* dans la flaque, la boue, la farine : on ne voit plus rien */
      }
      if(dedans){ var sautee = dedans.saut[ipp]; dedans = null; if(sautee){ serrees(q, true); s += pas * 1.4; nP += 2; continue; } }
      if(Math.random() >= trouMax * (1 - c)) une(q, cote, 3.4, 0);
      c *= sub === 'lait' ? perteLait : PERTE[sub];
      s += pas; nP++;
    }
  });

  /* ==== le décor : les pâtés de maisons, et tout autour des bandes de jardins ==== */
  var eviteRues = rues.map(function(r){ return {x:r.x - 4, y:r.y - 4, w:r.w + 8, h:r.h + 8}; }), eviteAutres = reserves.slice();
  eviteAutres.push({x:odette.bx - 66, y:odette.by - 64, w:132, h:68});
  var egBoite = boiteEglise(eglise); eviteAutres.push(egBoite);
  arches.forEach(function(A2){ eviteAutres.push(A2.bat); });
  /* les lanternes, au coin des carrefours */
  var lampes = [];
  for(i = 0; i < NX; i++) for(j = 0; j < NY; j++){
    var coins = U.melanger([[-1, -1], [1, -1], [-1, 1], [1, 1]]).slice(0, Math.random() < .35 ? 2 : 1);
    coins.forEach(function(cn){
      var lx = gx[i] + cn[0] * (RUE / 2 + 5.5), ly = gy[j] + cn[1] * (RUE / 2 + 5.5), bb = {x:lx - 6, y:ly - 6, w:12, h:12};
      if(dansRue(lx, ly) || reserves.some(function(r){ return croise(r, bb); }) || croise(egBoite, bb) || arches.some(function(A3){ return croise(A3.bat, bb); })) return;
      lampes.push({x:lx, y:ly, lx:gx[i] + cn[0] * 30, ly:gy[j] + cn[1] * 30});
      eviteAutres.push(bb);
    });
  }
  /* les arbres qui débordent sur la rue (dessinés au-dessus du Pisteur : ils cachent les traces dessous) */
  var dessus = [];
  for(var e5 = 0; e5 < 40 && dessus.length < (p.branches || 2); e5++){
    var kb = U.choix(Object.keys(usage)); if(segArche[kb]) continue;
    var gb = geoSeg(kb), ub = U.rand(.25, .75), alb = gb.a0 + (gb.a1 - gb.a0) * ub, cb = Math.random() < .5 ? -1 : 1, rb = U.rand(22, 28);
    var tx = gb.sens === 'h' ? alb : gb.c + cb * (RUE / 2 + 9), ty = gb.sens === 'h' ? gb.c + cb * (RUE / 2 + 9) : alb;
    var bbt = {x:tx - 10, y:ty - 10, w:20, h:20};
    if(eviteAutres.some(function(r){ return croise(r, bbt); }) || rues.some(function(r){ return croise(r, {x:tx - 6, y:ty - 6, w:12, h:12}); })) continue;
    if(dessus.some(function(d){ return Math.hypot(d.x - tx, d.y - ty) < 160; }) || Math.hypot(tx - depart.x, ty - depart.y) < 150) continue;
    if(obstacles.some(function(O3){ return Math.hypot(O3.x + O3.w / 2 - tx, O3.y + O3.h / 2 - ty) < 50; })) continue;
    dessus.push({x:tx, y:ty, r:rb, g:nouvelleGraine(), sorte:'feuillu', haut:26});
    eviteAutres.push({x:tx - 12, y:ty - 12, w:24, h:24});
  }
  var evite = eviteRues.concat(eviteAutres);
  /* les cellules : entre les rues, et les quatre bandes du bord (coupées en morceaux) */
  var cellules = [];
  function couper(c, L2){
    var l = [], n, q;
    if(c.w >= c.h){ n = Math.max(1, Math.round(c.w / L2)); for(q = 0; q < n; q++) l.push({x:c.x + c.w * q / n, y:c.y, w:c.w / n, h:c.h, bord:true}); }
    else { n = Math.max(1, Math.round(c.h / L2)); for(q = 0; q < n; q++) l.push({x:c.x, y:c.y + c.h * q / n, w:c.w, h:c.h / n, bord:true}); }
    return l;
  }
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY - 1; j++) cellules.push({x:gx[i] + RUE / 2, y:gy[j] + RUE / 2, w:gx[i + 1] - gx[i] - RUE, h:gy[j + 1] - gy[j] - RUE});
  var hautG = gy[0] - RUE / 2, basG = gy[NY - 1] + RUE / 2, gaucheG = gx[0] - RUE / 2, droiteG = gx[NX - 1] + RUE / 2;
  couper({x:-MARGE, y:-MARGE, w:Wm + 2 * MARGE, h:hautG + MARGE}, 300).forEach(function(c){ cellules.push(c); });
  couper({x:-MARGE, y:basG, w:Wm + 2 * MARGE, h:Hm + MARGE - basG}, 300).forEach(function(c){ cellules.push(c); });
  couper({x:-MARGE, y:hautG, w:gaucheG + MARGE, h:basG - hautG}, 300).forEach(function(c){ cellules.push(c); });
  couper({x:droiteG, y:hautG, w:Wm + MARGE - droiteG, h:basG - hautG}, 300).forEach(function(c){ cellules.push(c); });
  var maisons = [], arbres = [], objets = [], sols = [], bords = [], fenetres = [];
  /* d'abord, des maisons le long des impasses (les voisins d'Odette, les maisons près de l'église, celles des fausses pistes) */
  rues.forEach(function(r){
    if(!r.imp) return;
    var vert = r.h > r.w, len = vert ? r.h : r.w;
    [-1, 1].forEach(function(cote){
      var t = 2;
      while(t < len - 18){
        var w = U.rand(26, 40), d = U.rand(30, 40);
        if(t + w > len + 6) break;
        var R1 = vert ? {x:cote < 0 ? r.x - 5.5 - d : r.x + r.w + 5.5, y:r.y + t, w:d, h:w} : {x:r.x + t, y:cote < 0 ? r.y - 5.5 - d : r.y + r.h + 5.5, w:w, h:d};
        var dv = vert ? {x:cote < 0 ? r.x + 8 : r.x + r.w - 8, y:R1.y + w / 2} : {x:R1.x + w / 2, y:cote < 0 ? r.y + 8 : r.y + r.h - 8};
        if(!evite.some(function(q){ return croise(R1, q, 1); })){ maisons.push(maisonDe(R1, vert ? 'v' : 'h', dv)); evite.push(R1); }
        t += w + U.rand(0, 2.5);
      }
    });
  });
  cellules.forEach(function(c){ decorCellule(c, evite, dansRue, maisons, arbres, objets, sols, bords); });
  /* quelques fenêtres allumées la nuit (la lumière tombe dans la rue, devant la maison) */
  maisons.forEach(function(m){ if(m.devant && Math.random() < .24) fenetres.push({x:m.devant.x, y:m.devant.y}); });
  /* deux chats endormis sur des toits (ce ne sont pas ceux d'Odette) */
  U.melanger(maisons.filter(function(m){ return m.w > 30 && m.h > 30; })).slice(0, 2).forEach(function(m){ m.chat = {u:U.rand(.25, .75), v:U.rand(.25, .75), c:U.choix(['#e0a050', '#3a3038', '#f0ece2']), a:U.rand(0, TAU)}; });
  /* du linge, tendu d'un côté de la rue à l'autre */
  var linges = [];
  for(var e6 = 0; e6 < 40 && linges.length < 3; e6++){
    var kl = U.choix(Object.keys(usage).concat(Object.keys(usage))); if(segArche[kl]) continue;
    var gl = geoSeg(kl), al2 = gl.a0 + (gl.a1 - gl.a0) * U.rand(.35, .65);
    if(linges.some(function(Lg){ return Math.hypot(Lg.cx - (gl.sens === 'h' ? al2 : gl.c), Lg.cy - (gl.sens === 'h' ? gl.c : al2)) < 250; })) continue;
    var habits = [], nh = 3 + Math.floor(Math.random() * 3), COUL = ['#e8e2d4', '#c94b4b', '#4f7ec4', '#e3b84a', '#7ab06a', '#d87aa8', '#f4f0e6'];
    for(var q4 = 0; q4 < nh; q4++) habits.push({u:(q4 + .5) / nh + U.rand(-.04, .04), w:U.rand(6, 10), h:U.rand(7, 13), c:U.choix(COUL), f:U.choix(['drap', 'chemise', 'chaussette', 'drap']), ph:U.rand(0, TAU)});
    linges.push(gl.sens === 'h' ? {x1:al2, y1:gl.c - RUE / 2 - 4, x2:al2, y2:gl.c + RUE / 2 + 4, cx:al2, cy:gl.c, habits:habits} : {x1:gl.c - RUE / 2 - 4, y1:al2, x2:gl.c + RUE / 2 + 4, y2:al2, cx:gl.c, cy:al2, habits:habits});
  }
  /* les pigeons, par petits groupes, dans les rues */
  var pigeons = [];
  for(var e7 = 0; e7 < 40 && pigeons.length < 14; e7++){
    var rp = U.choix(rues.filter(function(r){ return !r.imp; })), pxp = U.rand(rp.x + 14, rp.x + rp.w - 14), pyp = U.rand(rp.y + 14, rp.y + rp.h - 14);
    if(Math.hypot(pxp - depart.x, pyp - depart.y) < 200 || dansTache(pxp, pyp, 10) || dansObstacle(pxp, pyp, 14) || dansArche(pxp, pyp, 10)) continue;
    if(pigeons.some(function(pp){ return Math.hypot(pp.x - pxp, pp.y - pyp) < 180; })) continue;
    var n3 = 3 + Math.floor(Math.random() * 3);
    for(var q5 = 0; q5 < n3; q5++){ var xx = pxp + U.rand(-13, 13), yy = pyp + U.rand(-10, 10); if(dansRue(xx, yy)) pigeons.push({x:xx, y:yy, x0:xx, y0:yy, a:U.rand(0, TAU), ph:U.rand(0, 10), vol:0, tv:0, vx:0, vy:0}); }
  }
  return {W:Wm, H:Hm, rues:rues, odette:odette, eglise:eglise, pistes:pistes, fins:fins, traces:traces, cases:cases, CASE:CASE, miroir:miroir,
    depart:depart, gx:gx, gy:gy, arches:arches, obstacles:obstacles, taches:taches, lampes:lampes, dessus:dessus, cellules:cellules,
    maisons:maisons, arbres:arbres, objets:objets, sols:sols, bords:bords, fenetres:fenetres, linges:linges, pigeons:pigeons,
    dansRue:dansRue, dansArche:dansArche, dansObstacle:dansObstacle, dansTache:dansTache, segment:segment, egBoite:egBoite};
}
/* la place que prend l'église (et son cimetière), dans le repère du monde */
function boiteEglise(E){
  var r = Math.atan2(E.dy, E.dx) + PI / 2, c = Math.cos(r), s = Math.sin(r), xs = [], ys = [];
  [[-118, -250], [118, -250], [118, 6], [-118, 6]].forEach(function(q){ xs.push(E.bx + q[0] * c - q[1] * s); ys.push(E.by + q[0] * s + q[1] * c); });
  var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
  return {x:x0, y:y0, w:Math.max.apply(null, xs) - x0, h:Math.max.apply(null, ys) - y0};
}
/* la forme d'une flaque (une tache irrégulière) : est-ce qu'un point est dedans ? */
function dansForme(T, x, y, m){
  var c = Math.cos(-T.rot), s = Math.sin(-T.rot), dx = x - T.x, dy = y - T.y, lx = dx * c - dy * s, ly = dx * s + dy * c;
  var a = Math.atan2(ly / T.ry, lx / T.rx), N = T.m.length, f = ((a / TAU * N) % N + N) % N, i0 = Math.floor(f), t = f - i0;
  var r = (T.m[i0] * (1 - t) + T.m[(i0 + 1) % N] * t) * .93;
  return Math.hypot(lx / (T.rx + (m || 0)), ly / (T.ry + (m || 0))) <= r;
}
function cheminForme(x, T, gonfle){
  var N = T.m.length, P = [], g = gonfle || 0;
  for(var i = 0; i < N; i++){ var a = TAU * i / N, px = Math.cos(a) * (T.rx + g) * T.m[i], py = Math.sin(a) * (T.ry + g) * T.m[i];
    P.push([T.x + px * Math.cos(T.rot) - py * Math.sin(T.rot), T.y + px * Math.sin(T.rot) + py * Math.cos(T.rot)]); }
  x.beginPath(); x.moveTo((P[N - 1][0] + P[0][0]) / 2, (P[N - 1][1] + P[0][1]) / 2);
  for(i = 0; i < N; i++){ var b = P[(i + 1) % N]; x.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + b[0]) / 2, (P[i][1] + b[1]) / 2); }
  x.closePath();
}
/* le décor d'une cellule : des maisons serrées le long des rues, et derrière, une cour ou un jardin */
var TUILES = ['#c4583f', '#b8643a', '#a9503a', '#c86f45', '#9c4836', '#b5573f', '#cf7a4c', '#bb6646'];
var ARDOISES = ['#5d6b8c', '#66748f', '#56627c', '#6f7d96'];
function maisonDe(r, sens, devant){
  var ard = Math.random() < .24;
  var m = {x:r.x, y:r.y, w:r.w, h:r.h, sens:sens, c:U.choix(ard ? ARDOISES : TUILES), toit:ard ? 'ardoise' : 'tuile', haut:U.rand(12, 20), g:nouvelleGraine(),
    chem:[], lucarne:Math.random() < .35, fum:Math.random() < .4, devant:devant};
  var nc = Math.random() < .3 ? 2 : 1;
  for(var q = 0; q < nc; q++) m.chem.push(sens === 'h' ? {u:U.rand(.15, .85), v:Math.random() < .5 ? .3 : .7} : {u:Math.random() < .5 ? .3 : .7, v:U.rand(.15, .85)});
  return m;
}
function decorCellule(c, evite, dansRue, maisons, arbres, objets, sols, bords){
  c.sol = c.bord ? (Math.random() < .7 ? 'jardin' : 'cour') : (Math.random() < .5 ? 'jardin' : 'cour'); c.g = nouvelleGraine();
  var miennes = [];
  function libre(r, m){
    m = m == null ? 2 : m;
    if(r.x < c.x + 1 || r.y < c.y + 1 || r.x + r.w > c.x + c.w - 1 || r.y + r.h > c.y + c.h - 1) return false;
    return !evite.some(function(q){ return croise(r, q, m); }) && !miennes.some(function(q){ return croise(r, q, m); });
  }
  /* les quatre côtés : ceux qui donnent sur une rue reçoivent une rangée de maisons (et un muret ou une haie entre elles) */
  var cotes = [{h:true, y:c.y, d:-1}, {h:true, y:c.y + c.h, d:1}, {h:false, x:c.x, d:-1}, {h:false, x:c.x + c.w, d:1}];
  cotes.forEach(function(cd){
    var len = cd.h ? c.w : c.h, t = U.rand(1, 6), face = 0, essais = 0;
    while(t < len - 18 && essais++ < 60){
      var w = U.rand(26, 46), d = U.rand(30, 42);
      if(t + w > len - 2) w = len - 2 - t; if(w < 20) break;
      var r, ox, oy;
      if(cd.h){ r = {x:c.x + t, y:cd.d < 0 ? c.y + 5.5 : c.y + c.h - 5.5 - d, w:w, h:d}; ox = r.x + w / 2; oy = cd.d < 0 ? c.y - 8 : c.y + c.h + 8; }
      else { r = {x:cd.d < 0 ? c.x + 5.5 : c.x + c.w - 5.5 - d, y:c.y + t, w:d, h:w}; ox = cd.d < 0 ? c.x - 8 : c.x + c.w + 8; oy = r.y + w / 2; }
      if(dansRue(ox, oy)){
        face++;
        if(libre(r, 1)){ maisons.push(maisonDe(r, cd.h ? 'h' : 'v', {x:ox, y:oy})); miennes.push(r); }
      }
      t += w + (Math.random() < .14 ? U.rand(9, 20) : U.rand(0, 2.5));
    }
    if(face) bords.push({x1:cd.h ? c.x : cd.x, y1:cd.h ? cd.y : c.y, x2:cd.h ? c.x + c.w : cd.x, y2:cd.h ? cd.y : c.y + c.h, d:cd.d, h:cd.h, sorte:Math.random() < .5 ? 'muret' : 'haie', g:nouvelleGraine()});
  });
  /* au bord du quartier : des maisons aussi derrière, au milieu des jardins (une petite ville, pas un champ) */
  if(c.bord){
    var nM = Math.round(c.w * c.h / 16000);
    for(var e0 = 0; e0 < 50 && nM > 0; e0++){
      var hz = Math.random() < .5, mw = U.rand(30, 48), md = U.rand(30, 40), R0 = {x:U.rand(c.x + 8, c.x + c.w - (hz ? mw : md) - 8), y:U.rand(c.y + 8, c.y + c.h - (hz ? md : mw) - 8), w:hz ? mw : md, h:hz ? md : mw};
      if(!libre(R0, 9)) continue;
      maisons.push(maisonDe(R0, hz ? 'h' : 'v', null)); miennes.push(R0); nM--;
    }
  }
  /* derrière : des arbres, et quelques choses de jardin ou de cour */
  var nA = c.sol === 'jardin' ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2);
  if(c.bord) nA += 3;
  var SORTES = c.sol === 'jardin' ? ['feuillu', 'feuillu', 'fruitier', 'fruitier', 'sapin'] : ['feuillu', 'fruitier'];
  for(var e = 0; e < 60 && nA > 0; e++){
    var ra = U.rand(12, 21), a = {x:U.rand(c.x + ra + 4, c.x + c.w - ra - 4), y:U.rand(c.y + ra + 4, c.y + c.h - ra - 4), r:ra};
    if(!libre({x:a.x - ra * .8, y:a.y - ra * .8, w:ra * 1.6, h:ra * 1.6}, 1)) continue;
    a.sorte = U.choix(SORTES); a.g = nouvelleGraine(); a.haut = ra * 1.3;
    if(a.sorte === 'fruitier') a.fruits = U.choix(['#d83b3b', '#e8a23a', '#f2e6ee']);
    arbres.push(a); miennes.push({x:a.x - ra * .7, y:a.y - ra * .7, w:ra * 1.4, h:ra * 1.4}); nA--;
  }
  var CHOSES = c.sol === 'jardin' ? ['potager', 'fleurs', 'puits', 'banc', 'meule', 'fleurs', 'ruches', 'bois'] : ['tonneaux', 'caisses', 'puits', 'bois', 'charrette', 'sacs', 'etal', 'paniers', 'linge'];
  var nO = 2 + Math.floor(Math.random() * 3);
  var TAILLES = {potager:[36, 26], fleurs:[22, 12], puits:[16, 16], banc:[18, 6], meule:[20, 20], ruches:[24, 9], bois:[22, 12], tonneaux:[18, 18], caisses:[18, 16], charrette:[30, 18], sacs:[18, 12], etal:[30, 14], paniers:[18, 10], linge:[34, 4]};
  for(e = 0; e < 60 && nO > 0; e++){
    var ty = U.choix(CHOSES), T = TAILLES[ty], tourne = Math.random() < .5, ow = tourne ? T[1] : T[0], oh = tourne ? T[0] : T[1];
    var o = {x:U.rand(c.x + 6, c.x + c.w - ow - 6), y:U.rand(c.y + 6, c.y + c.h - oh - 6), w:ow, h:oh, type:ty, g:nouvelleGraine(), sens:tourne ? 'v' : 'h', haut:ty === 'meule' ? 10 : ty === 'puits' ? 8 : 5};
    if(!libre(o, 3)) continue;
    (ty === 'potager' || ty === 'fleurs' ? sols : objets).push(o); miennes.push(o); nO--;
  }
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
    var d1 = Math.hypot(b.x - a.x, b.y - a.y), d2 = Math.hypot(c.x - b.x, c.y - b.y), rr2 = Math.min(r, d1 / 2.2, d2 / 2.2);
    if(!d1 || !d2){ out.push(b); continue; }
    var p1 = {x:b.x + (a.x - b.x) * rr2 / d1, y:b.y + (a.y - b.y) * rr2 / d1}, p2 = {x:b.x + (c.x - b.x) * rr2 / d2, y:b.y + (c.y - b.y) * rr2 / d2};
    for(var k = 0; k <= 4; k++){ var u = k / 4, v = 1 - u; out.push({x:v * v * p1.x + 2 * v * u * b.x + u * u * p2.x, y:v * v * p1.y + 2 * v * u * b.y + u * u * p2.y}); }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* ==========================================================
   LES TEXTURES : une tuile de 64 × 64 unités, dessinée une fois à la taille de l'écran, puis posée côte à côte
   ========================================================== */
function partout(px, py, m, f){ for(var dx = -64; dx <= 64; dx += 64) for(var dy = -64; dy <= 64; dy += 64){ var X = px + dx, Y = py + dy; if(X > -m && X < 64 + m && Y > -m && Y < 64 + m) f(X, Y); } }
function tuile(s, quoi){
  var T = Math.max(32, Math.round(64 * s)), c = document.createElement('canvas'); c.width = c.height = T;
  var x = c.getContext('2d'), r = graine(quoi === 'paves' ? 11 : quoi === 'herbe' ? 23 : 37), k;
  x.scale(T / 64, T / 64);
  if(quoi === 'paves'){
    /* des pavés posés en rangs décalés : chacun sa teinte, un bord clair en haut à gauche, un bord sombre en bas à droite */
    x.fillStyle = '#75675a'; x.fillRect(0, 0, 64, 64);
    var TONS = ['#b6a487', '#ab997c', '#bfae91', '#a59376', '#b1a083', '#baa98c', '#a89a80', '#b3a38b'];
    for(var j = 0; j < 10; j++){
      var nb = 8, ws = [], sum = 0; for(k = 0; k < nb; k++){ var w = .7 + r() * .7; ws.push(w); sum += w; }
      var cx = r() * 64;
      for(k = 0; k < nb; k++){
        var pw = ws[k] / sum * 64, st = {t:mix(TONS[Math.floor(r() * TONS.length)], r() < .5 ? '#ffffff' : '#000000', r() * .07), d:[r(), r(), r(), r(), r(), r()], fente:r() < .06};
        (function(px, py, pw2, st2){ partout(px, py, 12, function(X, Y){ pave1(x, X, Y, pw2, 6.4, st2); }); })(cx, j * 6.4, pw, st);
        cx += pw;
      }
    }
    /* de la mousse dans quelques joints, et de la poussière */
    for(k = 0; k < 26; k++){ var mx = r() * 64, my = Math.round(r() * 10) * 6.4 + (r() - .5) * .8, mc = r() < .5 ? 'rgba(96,124,62,.5)' : 'rgba(120,140,70,.4)', ml = 1 + r() * 2.4;
      partout(mx, my, 4, function(X, Y){ x.fillStyle = mc; ovale(x, X, Y, ml, .55, 0); x.fill(); }); }
    for(k = 0; k < 10; k++){ var dx2 = r() * 64, dy2 = r() * 64, dr = 4 + r() * 7; partout(dx2, dy2, dr, function(X, Y){ var gr = x.createRadialGradient(X, Y, 0, X, Y, dr); gr.addColorStop(0, 'rgba(90,72,50,.1)'); gr.addColorStop(1, 'rgba(90,72,50,0)'); x.fillStyle = gr; x.fillRect(X - dr, Y - dr, dr * 2, dr * 2); }); }
  } else if(quoi === 'herbe'){
    x.fillStyle = '#679a50'; x.fillRect(0, 0, 64, 64);
    for(k = 0; k < 16; k++){ var tx = r() * 64, ty = r() * 64, trr = 4 + r() * 9, tc = r() < .5 ? 'rgba(130,180,96,.16)' : 'rgba(50,92,44,.18)';
      partout(tx, ty, trr, function(X, Y){ x.fillStyle = tc; rond(x, X, Y, trr); x.fill(); }); }
    var BRINS = ['#578c43', '#76ab5c', '#86b86a', '#4d7f3d', '#6ea456', '#93c072'];
    x.lineWidth = .42; x.lineCap = 'round';
    for(k = 0; k < 700; k++){
      var bx = r() * 64, by = r() * 64, ba = -PI / 2 + (r() - .5) * 1.2, bl = 1 + r() * 1.6, bc = BRINS[Math.floor(r() * BRINS.length)];
      (function(bc2, ba2, bl2){ partout(bx, by, 3, function(X, Y){ x.strokeStyle = bc2; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(ba2) * bl2, Y + Math.sin(ba2) * bl2); x.stroke(); }); })(bc, ba, bl);
    }
    for(k = 0; k < 7; k++){ var fx = r() * 64, fy = r() * 64, fc = r() < .6 ? '#f6f1e4' : '#f2d04a';
      (function(fc2){ partout(fx, fy, 2, function(X, Y){ x.fillStyle = fc2; for(var pp = 0; pp < 5; pp++){ rond(x, X + Math.cos(pp * 1.257) * .7, Y + Math.sin(pp * 1.257) * .7, .45); x.fill(); } x.fillStyle = '#e8b030'; rond(x, X, Y, .35); x.fill(); }); })(fc); }
  } else {
    /* la terre battue des cours : des cailloux, des taches */
    x.fillStyle = '#a48e6d'; x.fillRect(0, 0, 64, 64);
    for(k = 0; k < 20; k++){ var sx2 = r() * 64, sy2 = r() * 64, sr = 3 + r() * 8, scc = r() < .5 ? 'rgba(126,102,72,.2)' : 'rgba(196,176,140,.2)';
      partout(sx2, sy2, sr, function(X, Y){ x.fillStyle = scc; rond(x, X, Y, sr); x.fill(); }); }
    var CAIL = ['#8d7a5e', '#c2ad8a', '#7a6a52', '#b8a283', '#d0bea0'];
    for(k = 0; k < 110; k++){ var cx3 = r() * 64, cy3 = r() * 64, cr = .35 + r() * .9, ccl = CAIL[Math.floor(r() * CAIL.length)], ca = r() * 3;
      partout(cx3, cy3, 2, function(X, Y){ x.fillStyle = ccl; ovale(x, X, Y, cr, cr * .75, ca); x.fill(); }); }
  }
  return c;
}
function pave1(x, px, py, w, h, st){
  var i = .55, r = 1.7;
  x.fillStyle = st.t; x.beginPath(); rr(x, px + i, py + i, w - 2 * i, h - 2 * i, r); x.fill();
  x.lineWidth = .55;
  x.strokeStyle = 'rgba(255,248,230,.3)'; x.beginPath(); x.moveTo(px + i + r, py + i + .32); x.lineTo(px + w - i - r, py + i + .32); x.moveTo(px + i + .32, py + i + r); x.lineTo(px + i + .32, py + h - i - r); x.stroke();
  x.strokeStyle = 'rgba(50,38,26,.32)'; x.beginPath(); x.moveTo(px + i + r, py + h - i - .32); x.lineTo(px + w - i - r, py + h - i - .32); x.moveTo(px + w - i - .32, py + i + r); x.lineTo(px + w - i - .32, py + h - i - r); x.stroke();
  x.fillStyle = 'rgba(70,56,40,.2)';
  for(var k = 0; k < 2; k++){ rond(x, px + 1.4 + st.d[k] * (w - 2.8), py + 1.4 + st.d[k + 2] * (h - 2.8), .3 + st.d[k + 4] * .32); x.fill(); }
  if(st.fente){ x.strokeStyle = 'rgba(50,38,26,.4)'; x.lineWidth = .35; x.beginPath(); x.moveTo(px + w * .3, py + i + .4); x.lineTo(px + w * .45, py + h * .5); x.lineTo(px + w * .4, py + h - i - .4); x.stroke(); }
}
function carreler(x, t, R, Tw){
  var a0 = Math.floor(R.x / Tw), a1 = Math.floor((R.x + R.w) / Tw), b0 = Math.floor(R.y / Tw), b1 = Math.floor((R.y + R.h) / Tw);
  for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++) x.drawImage(t, a * Tw, b * Tw, Tw, Tw);
}

/* ==========================================================
   LE DESSIN DU DÉCOR (en unités du monde). Tout ce qui est ici est dessiné une fois dans un morceau (Blocs).
   ========================================================== */
function ombre(x, R, L, h){
  var ox = L.ombre.x * h * L.ombre.l, oy = L.ombre.y * h * L.ombre.l;
  var P = [[R.x, R.y], [R.x + R.w, R.y], [R.x + R.w, R.y + R.h], [R.x, R.y + R.h]];
  P = enveloppe(P.concat(P.map(function(q){ return [q[0] + ox, q[1] + oy]; })));
  x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; x.beginPath(); x.moveTo(P[0][0], P[0][1]); for(var i = 1; i < P.length; i++) x.lineTo(P[i][0], P[i][1]); x.closePath(); x.fill();
}
function ombreRond(x, cx, cy, r, L, h){ x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; ovale(x, cx + L.ombre.x * h * L.ombre.l, cy + L.ombre.y * h * L.ombre.l, r, r * .92, 0); x.fill(); }
/* l'ombre d'une chose : ronde pour ce qui est rond (tonneaux, paniers, puits, meule), un peu plus petite que sa boîte pour le reste */
function ombreObjet(x, o, L){
  var h = o.haut || 6, dx = L.ombre.x * h * L.ombre.l, dy = L.ombre.y * h * L.ombre.l, cx = o.x + o.w / 2, cy = o.y + o.h / 2, q;
  x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')';
  if(o.type === 'tonneaux'){
    var nt = o.w * o.h > 450 ? 3 : 2, tr = Math.min(o.w, o.h) * .3;
    x.beginPath();
    for(q = 0; q < nt; q++){ var tx = o.x + tr + (o.w - 2 * tr) * (nt === 1 ? .5 : q / (nt - 1)), ty = o.y + tr + (o.h - 2 * tr) * (q % 2 ? .15 : .85);
      x.moveTo(tx + dx * .7 + tr, ty + dy * .7); x.arc(tx + dx * .7, ty + dy * .7, tr, 0, TAU); }
    x.fill(); return;
  }
  if(o.type === 'paniers'){ x.beginPath(); for(q = 0; q < 2; q++){ var pr = Math.min(o.w * .22, o.h * .46), px = o.x + o.w * (.28 + .44 * q) + dx * .6; x.moveTo(px + pr, cy + dy * .6); x.arc(px, cy + dy * .6, pr, 0, TAU); } x.fill(); return; }
  if(o.type === 'puits' || o.type === 'meule'){ ovale(x, cx + dx, cy + dy, o.w / 2, o.w / 2 * .94, 0); x.fill(); return; }
  if(o.type === 'sacs' || o.type === 'bois' || o.type === 'ruches' || o.type === 'linge'){ ovale(x, cx + dx * .6, cy + dy * .6, o.w * .46, o.h * .44, 0); x.fill(); return; }
  ombre(x, {x:o.x + 2, y:o.y + 2, w:o.w - 4, h:o.h - 4}, L, h);
}
/* un toit vu du ciel : deux pans (celui qui regarde le soleil est plus clair), les rangs de tuiles ou d'ardoises, les joints décalés,
   le faîtage, un peu de mousse, une lucarne, les cheminées */
function dessinerToit(x, m, L){
  var r = graine(m.g), H = m.sens === 'h', X0 = m.x, Y0 = m.y, W = m.w, Hh = m.h, ard = m.toit === 'ardoise';
  var base = m.c, clair = mix(base, ard ? '#e4ebf6' : '#ffe2bf', .2), sombre = mix(base, '#140a12', .24);
  var litA = H ? L.ombre.y > 0 : L.ombre.x > 0;
  var cA = litA ? clair : sombre, cB = litA ? sombre : clair, q, y, u, kk;
  x.fillStyle = cA; if(H) x.fillRect(X0, Y0, W, Hh / 2); else x.fillRect(X0, Y0, W / 2, Hh);
  x.fillStyle = cB; if(H) x.fillRect(X0, Y0 + Hh / 2, W, Hh / 2); else x.fillRect(X0 + W / 2, Y0, W / 2, Hh);
  /* quelques tuiles plus claires ou plus foncées */
  var pas = ard ? 2.6 : 3.2, lg = ard ? 3.3 : 3.9, longueurR = H ? W : Hh, largeurR = H ? Hh : W;
  for(q = 0; q < Math.round(W * Hh / 60); q++){
    var a1 = r() * (longueurR - lg), b1 = Math.floor(r() * largeurR / pas) * pas;
    x.fillStyle = r() < .5 ? 'rgba(255,240,220,.13)' : 'rgba(30,10,10,.12)';
    if(H) x.fillRect(X0 + a1, Y0 + b1, lg, pas); else x.fillRect(X0 + b1, Y0 + a1, pas, lg);
  }
  /* les rangs (parallèles au faîtage) */
  x.lineWidth = .5; x.strokeStyle = ard ? 'rgba(18,22,40,.34)' : 'rgba(64,20,10,.32)'; x.beginPath();
  for(y = pas; y < largeurR - .4; y += pas){ if(Math.abs(y - largeurR / 2) < pas * .45) continue; if(H){ x.moveTo(X0, Y0 + y); x.lineTo(X0 + W, Y0 + y); } else { x.moveTo(X0 + y, Y0); x.lineTo(X0 + y, Y0 + Hh); } }
  x.stroke();
  /* le bombé de chaque rang (un liseré clair) */
  x.strokeStyle = ard ? 'rgba(230,236,250,.12)' : 'rgba(255,226,196,.16)'; x.beginPath();
  for(y = pas - .6; y < largeurR - .4; y += pas){ if(H){ x.moveTo(X0, Y0 + y); x.lineTo(X0 + W, Y0 + y); } else { x.moveTo(X0 + y, Y0); x.lineTo(X0 + y, Y0 + Hh); } }
  x.stroke();
  /* les joints, décalés d'un rang à l'autre */
  x.lineWidth = .38; x.strokeStyle = ard ? 'rgba(18,22,40,.26)' : 'rgba(64,20,10,.24)'; x.beginPath();
  for(y = 0, kk = 0; y < largeurR - .3; y += pas, kk++){
    var dec = (kk % 2) * lg / 2 + (r() - .5) * .6;
    for(u = dec + lg; u < longueurR; u += lg){ if(H){ x.moveTo(X0 + u, Y0 + y + .3); x.lineTo(X0 + u, Y0 + Math.min(y + pas - .2, Hh)); } else { x.moveTo(X0 + y + .3, Y0 + u); x.lineTo(X0 + Math.min(y + pas - .2, W), Y0 + u); } }
  }
  x.stroke();
  /* l'usure : de la mousse, de la suie */
  for(q = 0; q < 3; q++){ x.fillStyle = r() < .55 ? 'rgba(90,116,50,.16)' : 'rgba(30,20,20,.1)'; ovale(x, X0 + r() * W, Y0 + r() * Hh, 2 + r() * 5, 1.5 + r() * 3, r() * 3); x.fill(); }
  /* le faîtage */
  x.strokeStyle = mix(base, '#140a12', .45); x.lineWidth = 1.7; x.beginPath();
  if(H){ x.moveTo(X0, Y0 + Hh / 2); x.lineTo(X0 + W, Y0 + Hh / 2); } else { x.moveTo(X0 + W / 2, Y0); x.lineTo(X0 + W / 2, Y0 + Hh); }
  x.stroke();
  x.strokeStyle = 'rgba(255,236,214,.22)'; x.lineWidth = .5; x.beginPath();
  if(H){ x.moveTo(X0, Y0 + Hh / 2 - .9); x.lineTo(X0 + W, Y0 + Hh / 2 - .9); } else { x.moveTo(X0 + W / 2 - .9, Y0); x.lineTo(X0 + W / 2 - .9, Y0 + Hh); }
  x.stroke();
  /* le bord du toit */
  x.strokeStyle = K; x.lineWidth = 1.7; x.strokeRect(X0, Y0, W, Hh);
  x.strokeStyle = 'rgba(255,255,255,.13)'; x.lineWidth = .6; x.strokeRect(X0 + 1.1, Y0 + 1.1, W - 2.2, Hh - 2.2);
  /* la lucarne : une petite fenêtre et son petit toit, sur un pan */
  if(m.lucarne){
    var lu = .25 + r() * .5, lx = H ? X0 + W * lu : X0 + (r() < .5 ? W * .12 : W * .62), ly = H ? Y0 + (r() < .5 ? Hh * .12 : Hh * .62) : Y0 + Hh * lu;
    var lw = H ? 7 : Hh * 0 + W * .26, lh = H ? Hh * .26 : 7;
    ombre(x, {x:lx, y:ly, w:lw, h:lh}, L, 3);
    x.fillStyle = ard ? '#4a5672' : mix(base, '#140a12', .1); x.fillRect(lx, ly, lw, lh); x.strokeStyle = K; x.lineWidth = 1; x.strokeRect(lx, ly, lw, lh);
    x.fillStyle = L.nuit && r() < .5 ? '#ffd879' : '#9fb4cc';
    if(H) x.fillRect(lx + 1.6, ly + (ly < Y0 + Hh / 2 ? .8 : lh - 3), lw - 3.2, 2.2); else x.fillRect(lx + (lx < X0 + W / 2 ? .8 : lw - 3), ly + 1.6, 2.2, lh - 3.2);
  }
  /* les cheminées */
  m.chem.forEach(function(c){
    var cx = X0 + W * c.u, cy = Y0 + Hh * c.v;
    ombre(x, {x:cx - 3, y:cy - 3, w:6, h:6}, L, 5);
    x.fillStyle = '#8a6a58'; x.fillRect(cx - 3, cy - 3, 6, 6);
    x.fillStyle = '#a5846c'; x.fillRect(cx - 3, cy - 3, 6, 1.5);
    x.strokeStyle = 'rgba(60,40,30,.5)'; x.lineWidth = .35; x.beginPath(); x.moveTo(cx - 3, cy); x.lineTo(cx + 3, cy); x.moveTo(cx, cy - 3); x.lineTo(cx, cy); x.moveTo(cx - 1.5, cy); x.lineTo(cx - 1.5, cy + 3); x.moveTo(cx + 1.5, cy); x.lineTo(cx + 1.5, cy + 3); x.stroke();
    x.strokeStyle = K; x.lineWidth = 1.1; x.strokeRect(cx - 3, cy - 3, 6, 6);
    x.fillStyle = '#211816'; x.fillRect(cx - 1.6, cy - 1.6, 3.2, 3.2);
    x.fillStyle = 'rgba(20,14,12,.25)'; ovale(x, cx + VENT.x * 3, cy + VENT.y * 3, 3.4, 2.2, Math.atan2(VENT.y, VENT.x)); x.fill();
  });
  if(m.chat) chatEndormi(x, X0 + W * m.chat.u, Y0 + Hh * m.chat.v, m.chat.c, m.chat.a);
}
function chatEndormi(x, cx, cy, c, a){
  x.save(); x.translate(cx, cy); x.rotate(a);
  x.fillStyle = 'rgba(10,10,20,.25)'; ovale(x, 1.2, 1.4, 6.4, 5.4, 0); x.fill();
  x.fillStyle = c; x.strokeStyle = K; x.lineWidth = 1; ovale(x, 0, 0, 6, 5, 0); x.fill(); x.stroke();
  x.strokeStyle = K; x.lineWidth = 2.6; x.lineCap = 'round'; x.beginPath(); x.arc(0, 0, 5.4, .3, 2.2); x.stroke(); x.strokeStyle = c; x.lineWidth = 1.5; x.stroke();
  x.fillStyle = c; x.strokeStyle = K; x.lineWidth = 1; rond(x, 3.4, -2.4, 2.8); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(2, -4.6); x.lineTo(2.4, -6.6); x.lineTo(3.8, -5); x.closePath(); x.moveTo(4.6, -4.2); x.lineTo(6.4, -5); x.lineTo(5.6, -3.2); x.closePath(); x.fill(); x.stroke();
  x.restore();
}
/* un arbre vu du ciel : des touffes de feuilles (le contour d'abord, puis le remplissage), plus claires du côté du soleil */
function touffes(a){
  if(a.touffes) return a.touffes;
  var r = graine(a.g), n = a.sorte === 'sapin' ? 0 : 6 + Math.floor(r() * 3), T = [], q;
  for(q = 0; q < n; q++){ var an = q / n * TAU + r() * .5, d = a.r * (.42 + r() * .16); T.push([a.x + Math.cos(an) * d, a.y + Math.sin(an) * d, a.r * (.42 + r() * .14)]); }
  T.push([a.x, a.y, a.r * (a.sorte === 'sapin' ? .95 : .58)]);
  a.touffes = T; return T;
}
function dessinerArbre(x, a, L){
  var r = graine(a.g + 7), T = touffes(a), sx = -L.ombre.x, sy = -L.ombre.y, n = Math.hypot(sx, sy) || 1, q;
  sx /= n; sy /= n;
  if(a.sorte === 'sapin'){
    /* un sapin : une étoile de branches, du plus sombre au plus clair */
    /* un sapin vu d'en haut : une boule d'aiguilles, des rayons de branches, plus clair vers le soleil et vers la pointe */
    var R = a.r * .95, an;
    x.fillStyle = '#21462f'; x.strokeStyle = K; x.lineWidth = 1.6; x.beginPath();
    for(q = 0; q < 32; q++){ an = q / 32 * TAU; var rr2 = R * (q % 2 ? .9 : 1); x.lineTo(a.x + Math.cos(an) * rr2, a.y + Math.sin(an) * rr2); }
    x.closePath(); x.fill(); x.stroke();
    [['#2c5a3c', .78, 1.2], ['#3a6e4a', .55, 2.4], ['#4f8a5a', .3, 3.4]].forEach(function(c){
      x.strokeStyle = c[0]; x.lineWidth = .9; x.lineCap = 'round'; x.beginPath();
      for(var k = 0; k < 26; k++){ var aa = k / 26 * TAU + r() * .2, r0 = R * c[1] * .35, r1 = R * c[1]; x.moveTo(a.x + sx * c[2] + Math.cos(aa) * r0, a.y + sy * c[2] + Math.sin(aa) * r0); x.lineTo(a.x + sx * c[2] + Math.cos(aa) * r1, a.y + sy * c[2] + Math.sin(aa) * r1); }
      x.stroke(); x.fillStyle = c[0]; rond(x, a.x + sx * c[2], a.y + sy * c[2], R * c[1] * .42); x.fill();
    });
    x.fillStyle = '#6aa070'; rond(x, a.x + sx * 4, a.y + sy * 4, R * .1); x.fill();
    return;
  }
  var fonce = a.sorte === 'fruitier' ? '#3d6e34' : '#2d6a3a', moyen = a.sorte === 'fruitier' ? '#549448' : '#3f8a4a', clair = a.sorte === 'fruitier' ? '#7cbc62' : '#62ae5e';
  x.strokeStyle = K; x.lineWidth = 2.1; T.forEach(function(t){ rond(x, t[0], t[1], t[2]); x.stroke(); });
  x.fillStyle = fonce; T.forEach(function(t){ rond(x, t[0], t[1], t[2]); x.fill(); });
  x.fillStyle = moyen; T.forEach(function(t){ rond(x, t[0] + sx * t[2] * .16, t[1] + sy * t[2] * .16, t[2] * .8); x.fill(); });
  x.fillStyle = clair; T.forEach(function(t){ rond(x, t[0] + sx * t[2] * .34, t[1] + sy * t[2] * .34, t[2] * .44); x.fill(); });
  x.fillStyle = 'rgba(16,44,22,.32)'; for(q = 0; q < 16; q++){ var ar = r() * TAU, ad = r() * a.r * .85; rond(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, .6 + r() * .7); x.fill(); }
  x.fillStyle = 'rgba(190,232,150,.42)'; for(q = 0; q < 12; q++){ ar = r() * TAU; ad = r() * a.r * .7; rond(x, a.x + sx * a.r * .3 + Math.cos(ar) * ad * .6, a.y + sy * a.r * .3 + Math.sin(ar) * ad * .6, .4 + r() * .5); x.fill(); }
  if(a.fruits){ x.fillStyle = a.fruits; for(q = 0; q < 9; q++){ ar = r() * TAU; ad = r() * a.r * .8; rond(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, .95); x.fill(); } }
}
/* un muret ou une haie, le long d'un côté qui donne sur la rue (on le voit entre deux maisons) */
function dessinerBord(x, b){
  var r = graine(b.g), L2 = Math.hypot(b.x2 - b.x1, b.y2 - b.y1), off = b.d * -2.6, q;
  var X1 = b.x1 + (b.h ? 0 : off), Y1 = b.y1 + (b.h ? off : 0), X2 = b.x2 + (b.h ? 0 : off), Y2 = b.y2 + (b.h ? off : 0);
  if(b.sorte === 'haie'){
    x.strokeStyle = K; x.lineWidth = 6.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.stroke();
    x.strokeStyle = '#3a7a42'; x.lineWidth = 4.4; x.stroke();
    x.fillStyle = '#5a9e58'; for(q = 0; q < L2 / 3; q++){ var u = q * 3 / L2; rond(x, lerp(X1, X2, u) + (r() - .5), lerp(Y1, Y2, u) + (r() - .5), .9 + r() * .7); x.fill(); }
  } else {
    x.strokeStyle = '#5f5448'; x.lineWidth = 4.2; x.lineCap = 'butt'; x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.stroke();
    x.strokeStyle = '#a89a86'; x.lineWidth = 3; x.stroke();
    x.strokeStyle = 'rgba(70,58,46,.55)'; x.lineWidth = .4; x.beginPath();
    for(q = 0; q < L2 / 4.4; q++){ var u2 = (q * 4.4 + r() * 1.4) / L2; var mx = lerp(X1, X2, u2), my = lerp(Y1, Y2, u2); if(b.h){ x.moveTo(mx, my - 1.4); x.lineTo(mx, my + 1.4); } else { x.moveTo(mx - 1.4, my); x.lineTo(mx + 1.4, my); } }
    x.stroke();
  }
}
/* les choses des cours, des jardins, et les obstacles de la rue */
function dessinerObjet(x, o, L){
  var r = graine(o.g), q, X = o.x, Y = o.y, W = o.w, H = o.h, cx = X + W / 2, cy = Y + H / 2, i;
  x.lineJoin = 'round';
  switch(o.type){
    case 'caisses':
      var n = W * H > 500 ? 3 : 2, cs = Math.min(W, H) * .62;
      for(q = 0; q < n; q++){
        var px = X + (W - cs) * (n === 1 ? .5 : q / (n - 1)) + (r() - .5) * 2, py = Y + (H - cs) * (q % 2 ? .1 : .9) + (r() - .5) * 2, ag = (r() - .5) * .3;
        x.save(); x.translate(px + cs / 2, py + cs / 2); x.rotate(ag);
        x.fillStyle = '#b88a52'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(-cs / 2, -cs / 2, cs, cs); x.strokeRect(-cs / 2, -cs / 2, cs, cs);
        x.strokeStyle = '#7a5530'; x.lineWidth = .6; x.beginPath(); for(i = 1; i < 4; i++){ x.moveTo(-cs / 2, -cs / 2 + cs * i / 4); x.lineTo(cs / 2, -cs / 2 + cs * i / 4); } x.stroke();
        x.strokeStyle = '#8f6534'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(-cs / 2 + 1, -cs / 2 + 1); x.lineTo(cs / 2 - 1, cs / 2 - 1); x.stroke();
        x.fillStyle = 'rgba(255,240,210,.18)'; x.fillRect(-cs / 2, -cs / 2, cs, 1.4);
        x.restore();
      }
      break;
    case 'tonneaux':
      var nt = W * H > 450 ? 3 : 2, tr = Math.min(W, H) * .3;
      for(q = 0; q < nt; q++){
        var tx = X + tr + (W - 2 * tr) * (nt === 1 ? .5 : q / (nt - 1)), ty = Y + tr + (H - 2 * tr) * (q % 2 ? .15 : .85);
        x.fillStyle = '#8a5a30'; x.strokeStyle = K; x.lineWidth = 1.3; rond(x, tx, ty, tr); x.fill(); x.stroke();
        x.strokeStyle = '#3c3434'; x.lineWidth = 1.1; rond(x, tx, ty, tr * .78); x.stroke();
        x.fillStyle = '#a7743e'; rond(x, tx, ty, tr * .66); x.fill();
        x.strokeStyle = 'rgba(70,40,20,.5)'; x.lineWidth = .45; x.beginPath(); for(i = -2; i <= 2; i++){ x.moveTo(tx + i * tr * .22, ty - tr * .6); x.lineTo(tx + i * tr * .22, ty + tr * .6); } x.stroke();
        x.fillStyle = 'rgba(255,230,190,.2)'; ovale(x, tx - tr * .25, ty - tr * .3, tr * .3, tr * .16, -.5); x.fill();
      }
      break;
    case 'charrette':
      x.save(); x.translate(cx, cy); if(o.sens === 'v') x.rotate(PI / 2);
      var cw = o.sens === 'v' ? H : W, ch = o.sens === 'v' ? W : H;
      x.strokeStyle = K; x.lineWidth = 1.6; x.lineCap = 'round';
      x.beginPath(); x.moveTo(cw * .3, -ch * .22); x.lineTo(cw * .62, -ch * .14); x.moveTo(cw * .3, ch * .22); x.lineTo(cw * .62, ch * .14); x.stroke();   /* les brancards */
      x.fillStyle = '#3a2c20'; x.fillRect(-cw * .12, -ch / 2, cw * .2, 3); x.fillRect(-cw * .12, ch / 2 - 3, cw * .2, 3);                                   /* les roues, de côté */
      x.fillStyle = '#a77a48'; x.fillRect(-cw / 2 + 2, -ch / 2 + 3, cw * .8, ch - 6); x.strokeRect(-cw / 2 + 2, -ch / 2 + 3, cw * .8, ch - 6);
      x.strokeStyle = '#6f4d2a'; x.lineWidth = .6; x.beginPath(); for(i = 1; i < 5; i++){ var lx2 = -cw / 2 + 2 + cw * .8 * i / 5; x.moveTo(lx2, -ch / 2 + 3); x.lineTo(lx2, ch / 2 - 3); } x.stroke();
      x.fillStyle = '#e8d6a4'; ovale(x, -cw * .1, 0, cw * .2, ch * .22, 0); x.fill(); x.fillStyle = '#c9a85e'; ovale(x, cw * .1, -ch * .08, cw * .12, ch * .16, .4); x.fill();
      x.restore();
      break;
    case 'sacs':
      var ns = 3;
      for(q = 0; q < ns; q++){
        var sxp = X + W * (.2 + .3 * q) + (r() - .5) * 2, syp = cy + (r() - .5) * H * .3, sa = r() * PI;
        x.fillStyle = '#d8c69c'; x.strokeStyle = K; x.lineWidth = 1.2; ovale(x, sxp, syp, W * .2, H * .38, sa); x.fill(); x.stroke();
        x.strokeStyle = '#a08a5c'; x.lineWidth = .7; x.beginPath(); x.moveTo(sxp - Math.cos(sa) * W * .1, syp - Math.sin(sa) * W * .1); x.lineTo(sxp + Math.cos(sa) * W * .1, syp + Math.sin(sa) * W * .1); x.stroke();
        x.fillStyle = 'rgba(255,255,255,.2)'; ovale(x, sxp - 1, syp - 1, W * .08, H * .12, sa); x.fill();
      }
      break;
    case 'bois':
      /* un tas de bûches : on voit leurs bouts ronds, avec les cernes */
      var nb2 = Math.max(4, Math.round(W * H / 40));
      for(q = 0; q < nb2; q++){
        var bx = X + 2.4 + r() * (W - 4.8), by = Y + 2.4 + r() * (H - 4.8), br = 2 + r() * 1.3;
        x.fillStyle = '#7a5232'; x.strokeStyle = K; x.lineWidth = .8; rond(x, bx, by, br); x.fill(); x.stroke();
        x.fillStyle = '#d2a873'; rond(x, bx, by, br * .72); x.fill(); x.strokeStyle = 'rgba(120,80,40,.6)'; x.lineWidth = .3; rond(x, bx, by, br * .4); x.stroke();
      }
      break;
    case 'paniers':
      for(q = 0; q < 2; q++){
        var pxx = X + W * (.28 + .44 * q), pyy = cy, pr = Math.min(W * .22, H * .46);
        x.fillStyle = '#b8864a'; x.strokeStyle = K; x.lineWidth = 1.1; rond(x, pxx, pyy, pr); x.fill(); x.stroke();
        x.strokeStyle = '#8a6030'; x.lineWidth = .5; rond(x, pxx, pyy, pr * .75); x.stroke();
        var fr = U.choix ? (q ? '#d83b3b' : '#e8a23a') : '#d83b3b';
        x.fillStyle = fr; for(i = 0; i < 6; i++){ var aa = i * 1.05 + r(); rond(x, pxx + Math.cos(aa) * pr * .4, pyy + Math.sin(aa) * pr * .4, pr * .26); x.fill(); }
      }
      break;
    case 'puits':
      x.fillStyle = '#8f8a80'; x.strokeStyle = K; x.lineWidth = 1.4; rond(x, cx, cy, W / 2); x.fill(); x.stroke();
      x.strokeStyle = 'rgba(60,54,46,.6)'; x.lineWidth = .5; x.beginPath(); for(q = 0; q < 10; q++){ var a3 = q / 10 * TAU; x.moveTo(cx + Math.cos(a3) * W * .32, cy + Math.sin(a3) * W * .32); x.lineTo(cx + Math.cos(a3) * W * .5, cy + Math.sin(a3) * W * .5); } x.stroke();
      x.fillStyle = '#18202e'; rond(x, cx, cy, W * .3); x.fill(); x.fillStyle = 'rgba(120,150,200,.25)'; ovale(x, cx - 1, cy - 1, W * .12, W * .06, -.4); x.fill();
      x.strokeStyle = '#6a4a2e'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(cx - W * .55, cy); x.lineTo(cx + W * .55, cy); x.stroke();
      break;
    case 'banc':
      x.fillStyle = '#9a6a3e'; x.strokeStyle = K; x.lineWidth = 1.1; x.fillRect(X, Y, W, H); x.strokeRect(X, Y, W, H);
      x.strokeStyle = '#6f4a28'; x.lineWidth = .4; x.beginPath(); if(W > H){ x.moveTo(X, cy); x.lineTo(X + W, cy); } else { x.moveTo(cx, Y); x.lineTo(cx, Y + H); } x.stroke();
      break;
    case 'meule':
      x.fillStyle = '#d6b35a'; x.strokeStyle = K; x.lineWidth = 1.4; rond(x, cx, cy, W / 2); x.fill(); x.stroke();
      x.strokeStyle = 'rgba(150,110,40,.55)'; x.lineWidth = .45; x.beginPath(); for(q = 0; q < 26; q++){ var a4 = r() * TAU, d4 = r() * W * .45; x.moveTo(cx + Math.cos(a4) * d4, cy + Math.sin(a4) * d4); x.lineTo(cx + Math.cos(a4 + .3) * (d4 + 2), cy + Math.sin(a4 + .3) * (d4 + 2)); } x.stroke();
      x.fillStyle = 'rgba(255,240,180,.3)'; rond(x, cx - W * .12, cy - W * .12, W * .2); x.fill();
      break;
    case 'ruches':
      for(q = 0; q < 3; q++){ var rx2 = X + W * (q + .5) / 3, ry2 = cy; x.fillStyle = '#e2c06a'; x.strokeStyle = K; x.lineWidth = 1; rond(x, rx2, ry2, Math.min(W / 7, H / 2)); x.fill(); x.stroke(); x.strokeStyle = '#b08a3a'; x.lineWidth = .4; rond(x, rx2, ry2, Math.min(W / 7, H / 2) * .6); x.stroke(); }
      break;
    case 'etal':
      /* un petit étal : sa toile rayée */
      x.save(); x.translate(cx, cy); if(o.sens === 'v') x.rotate(PI / 2);
      var ew = o.sens === 'v' ? H : W, eh = o.sens === 'v' ? W : H, coul = U.choix(['#c94b4b', '#4f7ec4', '#3f9a62', '#d8963a']);
      x.fillStyle = '#f4eee0'; x.fillRect(-ew / 2, -eh / 2, ew, eh);
      x.fillStyle = coul; for(q = 0; q < 6; q += 2) x.fillRect(-ew / 2 + ew * q / 6, -eh / 2, ew / 6, eh);
      x.fillStyle = 'rgba(0,0,0,.14)'; x.fillRect(-ew / 2, 0, ew, eh / 2);
      x.strokeStyle = K; x.lineWidth = 1.2; x.strokeRect(-ew / 2, -eh / 2, ew, eh);
      x.beginPath(); x.moveTo(-ew / 2, 0); x.lineTo(ew / 2, 0); x.lineWidth = .7; x.stroke();
      x.restore();
      break;
    case 'linge':
      x.strokeStyle = '#5a4a3a'; x.lineWidth = .5; x.beginPath(); if(W > H){ x.moveTo(X, cy); x.lineTo(X + W, cy); } else { x.moveTo(cx, Y); x.lineTo(cx, Y + H); } x.stroke();
      for(q = 0; q < 4; q++){ x.fillStyle = U.choix(['#e8e2d4', '#c94b4b', '#4f7ec4', '#e3b84a']); var u5 = (q + .5) / 4; if(W > H) x.fillRect(X + W * u5 - 3, cy - .6, 6, 4.6); else x.fillRect(cx - .6, Y + H * u5 - 3, 4.6, 6); }
      break;
  }
}
function dessinerSol(x, o){
  var r = graine(o.g), q, X = o.x, Y = o.y, W = o.w, H = o.h;
  if(o.type === 'potager'){
    x.fillStyle = '#6e5236'; x.strokeStyle = 'rgba(40,26,16,.6)'; x.lineWidth = 1; x.beginPath(); rr(x, X, Y, W, H, 2); x.fill(); x.stroke();
    var rangs = Math.max(2, Math.floor((o.sens === 'h' ? H : W) / 6)), cou = U.choix(['#6fbf5a', '#8fcf64', '#e07a3a']);
    for(q = 0; q < rangs; q++){
      var f = (q + .5) / rangs;
      x.strokeStyle = 'rgba(40,26,16,.4)'; x.lineWidth = 1.6; x.beginPath(); if(o.sens === 'h'){ x.moveTo(X + 2, Y + H * f); x.lineTo(X + W - 2, Y + H * f); } else { x.moveTo(X + W * f, Y + 2); x.lineTo(X + W * f, Y + H - 2); } x.stroke();
      for(var u = 4; u < (o.sens === 'h' ? W : H) - 3; u += 4.4){
        var px = o.sens === 'h' ? X + u : X + W * f, py = o.sens === 'h' ? Y + H * f : Y + u;
        x.fillStyle = q % 2 ? '#5aa84c' : cou; rond(x, px, py, 1.6 + r() * .5); x.fill(); x.fillStyle = 'rgba(200,240,160,.4)'; rond(x, px - .4, py - .4, .6); x.fill();
      }
    }
  } else {
    /* un massif de fleurs */
    x.fillStyle = '#5e7a3e'; x.beginPath(); rr(x, X, Y, W, H, 3); x.fill();
    var C = ['#e84a6a', '#f2d04a', '#f6f1e4', '#b96ad8', '#f08a3a', '#6aa0e8'];
    for(q = 0; q < W * H / 9; q++){ x.fillStyle = C[Math.floor(r() * C.length)]; rond(x, X + 1.5 + r() * (W - 3), Y + 1.5 + r() * (H - 3), .9 + r() * .7); x.fill(); }
  }
}
/* une flaque, de la boue, de la farine (le dessin est coupé au bord de la rue) */
function dessinerTache(x, T, L, rues){
  var r = graine(T.g), q;
  x.save(); x.beginPath(); rues.forEach(function(R2){ if(Math.abs(R2.x + R2.w / 2 - T.x) < R2.w / 2 + T.rx * 1.5 && Math.abs(R2.y + R2.h / 2 - T.y) < R2.h / 2 + T.rx * 1.5) x.rect(R2.x, R2.y, R2.w, R2.h); }); x.clip();
  if(T.type === 'flaque'){
    /* les pavés mouillés autour, puis l'eau qui reflète le ciel, ses bords plus sombres, des reflets */
    cheminForme(x, T, 5); x.fillStyle = 'rgba(40,30,22,.22)'; x.fill();
    cheminForme(x, T, 2); x.fillStyle = 'rgba(40,30,22,.2)'; x.fill();
    cheminForme(x, T, 0);
    var gr = x.createLinearGradient(T.x - T.rx, T.y - T.ry, T.x + T.rx, T.y + T.ry);
    gr.addColorStop(0, L.ciel); gr.addColorStop(1, L.cielB); x.fillStyle = gr; x.globalAlpha = .9; x.fill(); x.globalAlpha = 1;
    x.strokeStyle = 'rgba(30,26,30,.35)'; x.lineWidth = 1.1; x.stroke();
    x.save(); cheminForme(x, T, -1); x.clip();
    x.strokeStyle = L.reflet; x.lineWidth = .9; x.lineCap = 'round';
    for(q = 0; q < 4; q++){ var ry = T.y - T.ry * .5 + T.ry * q * .32, rx = T.x - T.rx * .5 + r() * T.rx * .3; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + T.rx * (.25 + r() * .35), ry - 1.2); x.stroke(); }
    /* des pavés qu'on devine sous l'eau */
    x.strokeStyle = 'rgba(40,50,70,.18)'; x.lineWidth = .45; x.beginPath(); for(q = -4; q <= 4; q++){ x.moveTo(T.x - T.rx, T.y + q * 6.4); x.lineTo(T.x + T.rx, T.y + q * 6.4); } x.stroke();
    x.restore();
  } else if(T.type === 'boue'){
    cheminForme(x, T, 4); x.fillStyle = 'rgba(70,46,24,.28)'; x.fill();
    cheminForme(x, T, 0); x.fillStyle = '#6a4826'; x.fill();
    x.save(); cheminForme(x, T, 0); x.clip();
    for(q = 0; q < 14; q++){ x.fillStyle = r() < .5 ? 'rgba(40,24,10,.35)' : 'rgba(140,100,60,.3)'; ovale(x, T.x + (r() - .5) * T.rx * 1.6, T.y + (r() - .5) * T.ry * 1.6, 1.5 + r() * 4, 1 + r() * 2.6, r() * 3); x.fill(); }
    x.strokeStyle = 'rgba(255,240,220,.25)'; x.lineWidth = .7; x.lineCap = 'round'; for(q = 0; q < 4; q++){ var bx = T.x + (r() - .5) * T.rx, by = T.y + (r() - .5) * T.ry; x.beginPath(); x.arc(bx, by, 2 + r() * 2, PI * 1.1, PI * 1.7); x.stroke(); }
    x.restore();
    cheminForme(x, T, 0); x.strokeStyle = 'rgba(40,24,10,.45)'; x.lineWidth = 1; x.stroke();
    /* des éclaboussures tout autour */
    x.fillStyle = '#6a4826'; for(q = 0; q < 8; q++){ var ea = r() * TAU, ed = 1.05 + r() * .25; rond(x, T.x + Math.cos(ea) * T.rx * ed, T.y + Math.sin(ea) * T.ry * ed, .6 + r() * .8); x.fill(); }
  } else {
    /* de la farine renversée, avec un sac crevé au bord */
    cheminForme(x, T, 3); x.fillStyle = 'rgba(255,255,255,.3)'; x.fill();
    cheminForme(x, T, 0); x.fillStyle = '#f7f4ec'; x.fill();
    x.save(); cheminForme(x, T, 0); x.clip();
    for(q = 0; q < 30; q++){ x.fillStyle = r() < .5 ? 'rgba(220,210,190,.4)' : 'rgba(255,255,255,.8)'; rond(x, T.x + (r() - .5) * T.rx * 2, T.y + (r() - .5) * T.ry * 2, .3 + r() * 1.4); x.fill(); }
    x.restore();
    x.fillStyle = 'rgba(255,255,255,.85)'; for(q = 0; q < 16; q++){ var fa = r() * TAU, fd = 1 + r() * .4; rond(x, T.x + Math.cos(fa) * T.rx * fd, T.y + Math.sin(fa) * T.ry * fd, .3 + r() * .6); x.fill(); }
    var sa = T.rot + PI * .5, sxp = T.x + Math.cos(T.rot) * T.rx * .85, syp = T.y + Math.sin(T.rot) * T.rx * .85;
    x.fillStyle = '#d8c69c'; x.strokeStyle = K; x.lineWidth = 1.1; ovale(x, sxp, syp, 5, 7, sa); x.fill(); x.stroke();
    x.fillStyle = '#f7f4ec'; ovale(x, sxp - Math.cos(T.rot) * 3, syp - Math.sin(T.rot) * 3, 2.4, 3, sa); x.fill();
  }
  x.restore();
}
/* une trace de patte de chat, dans sa matière */
function dessinerTrace(x, T){
  var sz = TRACE * T.k;
  if(T.sub === 'lait'){
    CH.dessiner(x, T.c, T.x + .55, T.y + .65, T.a, sz, 'rgba(70,52,34,.32)', T.al);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#fffdf4', T.al);
  } else if(T.sub === 'eau'){
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz * 1.06, '#2a221e', T.al * .3);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#2a221e', T.al * .6);
  } else if(T.sub === 'boue'){
    CH.dessiner(x, T.c, T.x + .45, T.y + .55, T.a, sz, 'rgba(30,18,8,.35)', T.al);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#6b4724', T.al * .95);
  } else {
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz * 1.1, '#ffffff', T.al * .35);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#ffffff', T.al * .95);
    var r = graine(T.g); x.fillStyle = 'rgba(255,255,255,' + (T.al * .7).toFixed(2) + ')';
    for(var q = 0; q < 4; q++){ rond(x, T.x + (r() - .5) * sz * 2.6, T.y + (r() - .5) * sz * 2.6, .3 + r() * .4); x.fill(); }
  }
}
/* une lanterne au coin d'un carrefour */
function dessinerLampe(x, l, L){
  ombreRond(x, l.x, l.y, 2.2, L, 14);
  x.fillStyle = '#2e2a36'; x.strokeStyle = K; x.lineWidth = 1; rond(x, l.x, l.y, 2.6); x.fill(); x.stroke();
  var dx = l.lx - l.x, dy = l.ly - l.y, n = Math.hypot(dx, dy) || 1, hx = l.x + dx / n * 4.6, hy = l.y + dy / n * 4.6;
  x.strokeStyle = '#2e2a36'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(l.x, l.y); x.lineTo(hx, hy); x.stroke();
  x.fillStyle = L.nuit ? '#ffe08a' : '#e9dcb0'; x.strokeStyle = K; x.lineWidth = .9; x.fillRect(hx - 2.3, hy - 2.3, 4.6, 4.6); x.strokeRect(hx - 2.3, hy - 2.3, 4.6, 4.6);
  x.fillStyle = '#2e2a36'; x.fillRect(hx - .5, hy - 2.3, 1, 4.6); x.fillRect(hx - 2.3, hy - .5, 4.6, 1);
}
/* chez Odette : sa maison au toit violet, la porte, le paillasson, la canne, le bol renversé, la flaque de lait (le lait est dessiné à part, sous les traces) */
function dessinerOdetteSol(x, O){
  x.save(); x.translate(O.bx, O.by);
  var r = graine(31);
  x.fillStyle = 'rgba(200,190,170,.35)'; ovale(x, 0, 28, 40, 19, 0); x.fill();
  x.fillStyle = '#fffdf4'; x.strokeStyle = 'rgba(200,190,160,.7)'; x.lineWidth = .8;
  x.beginPath(); x.moveTo(-34, 24);
  for(var q = 0; q <= 16; q++){ var a = PI + q / 16 * TAU, rx = 34 * (.82 + r() * .3), ry = 15 * (.82 + r() * .3); x.lineTo(Math.cos(a) * rx, 26 + Math.sin(a) * ry); }
  x.closePath(); x.fill(); x.stroke();
  ovale(x, -26, 40, 10, 6, .4); x.fill(); ovale(x, 27, 39, 8, 5, -.3); x.fill(); ovale(x, 8, 44, 5, 3, 0); x.fill();
  x.fillStyle = 'rgba(255,255,255,.9)'; ovale(x, -8, 20, 10, 3, -.1); x.fill();
  for(q = 0; q < 10; q++){ var ga = r() * TAU, gd = 1.15 + r() * .4; rond(x, Math.cos(ga) * 34 * gd, 26 + Math.sin(ga) * 15 * gd, .6 + r() * .9); x.fill(); }
  /* le bol renversé, et la bouteille couchée */
  x.fillStyle = '#c9a26a'; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 18, 15, 7.5, 5.5, .5); x.fill(); x.stroke(); x.fillStyle = '#8a6a3a'; ovale(x, 20, 16, 4.4, 3, .5); x.fill();
  x.fillStyle = '#f4f8fb'; x.strokeStyle = K; x.lineWidth = 1.2; x.save(); x.translate(-12, 36); x.rotate(-.5); x.beginPath(); rr(x, -6, -3, 12, 6, 2.6); x.fill(); x.stroke(); x.fillStyle = '#4f7ec4'; x.fillRect(5, -1.8, 3, 3.6); x.strokeRect(5, -1.8, 3, 3.6); x.restore();
  x.restore();
}
function dessinerOdette(x, O, L){
  x.save(); x.translate(O.bx, O.by);
  var m = {x:-58, y:-56, w:116, h:54, sens:'h', c:'#8a5a8c', toit:'tuile', chem:[{u:.8, v:.3}], lucarne:true, g:4242};
  ombre(x, m, L, 16); dessinerToit(x, m, L);
  /* le seuil, le paillasson, deux pots de fleurs, la canne posée contre le mur */
  x.fillStyle = '#b4a48c'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(-15, -2, 30, 6); x.strokeRect(-15, -2, 30, 6);
  x.fillStyle = '#b0503a'; x.fillRect(-10, 5.5, 20, 8); x.strokeRect(-10, 5.5, 20, 8);
  x.strokeStyle = '#e0a070'; x.lineWidth = .5; x.beginPath(); for(var q = -9; q <= 9; q += 2){ x.moveTo(q, 5.5); x.lineTo(q, 13.5); } x.stroke();
  [[-24, 4], [24, 4]].forEach(function(pp, i){
    x.fillStyle = '#c4683e'; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, pp[0], pp[1], 4.6); x.fill(); x.stroke();
    x.fillStyle = '#3f8a4a'; rond(x, pp[0], pp[1], 3.4); x.fill();
    x.fillStyle = i ? '#f2d04a' : '#e84a6a'; for(var k = 0; k < 5; k++){ rond(x, pp[0] + Math.cos(k * 1.26) * 2, pp[1] + Math.sin(k * 1.26) * 2, 1.1); x.fill(); }
  });
  x.strokeStyle = K; x.lineWidth = 3.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(-33, -1); x.lineTo(-31, 17); x.stroke(); x.beginPath(); x.arc(-35.4, -1, 2.4, 0, PI, true); x.stroke();
  x.strokeStyle = '#b98a4a'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(-33, -1); x.lineTo(-31, 17); x.stroke(); x.beginPath(); x.arc(-35.4, -1, 2.4, 0, PI, true); x.stroke();
  x.restore();
}
/* l'église : son cimetière, la nef d'ardoise, le transept, l'abside, le clocher et sa flèche, la grille de la crypte au pied du clocher */
function dessinerEglise(x, E, L){
  x.save(); x.translate(E.bx, E.by); x.rotate(Math.atan2(E.dy, E.dx) + PI / 2);
  var r = graine(77), q;
  /* le mur du cimetière, ouvert devant ; des tombes ; deux ifs */
  x.fillStyle = '#7f9a60'; x.fillRect(-112, -244, 224, 246);
  x.fillStyle = 'rgba(160,190,120,.25)'; for(q = 0; q < 30; q++){ rond(x, -108 + r() * 216, -240 + r() * 238, 2 + r() * 5); x.fill(); }
  x.strokeStyle = '#5f5448'; x.lineWidth = 5; x.lineCap = 'butt'; x.beginPath(); x.moveTo(-40, 2); x.lineTo(-112, 2); x.lineTo(-112, -244); x.lineTo(112, -244); x.lineTo(112, 2); x.lineTo(40, 2); x.stroke();
  x.strokeStyle = '#a89a86'; x.lineWidth = 3.4; x.stroke();
  /* l'allée de dalles */
  x.fillStyle = '#b3a690'; x.fillRect(-26, -30, 52, 32);
  x.strokeStyle = 'rgba(80,66,50,.4)'; x.lineWidth = .5; x.beginPath(); for(q = -24; q < 28; q += 8){ x.moveTo(q, -30); x.lineTo(q, 2); } for(q = -26; q < 2; q += 7){ x.moveTo(-26, q); x.lineTo(26, q); } x.stroke();
  for(q = 0; q < 14; q++){
    var tx = (q % 2 ? 1 : -1) * (58 + r() * 40), ty = -30 - r() * 200;
    if(Math.abs(tx) < 86 && ty < -128 && ty > -168) continue;
    ombre(x, {x:tx - 3, y:ty - 5, w:6, h:9}, L, 4);
    x.fillStyle = '#9a968c'; x.strokeStyle = K; x.lineWidth = 1; x.beginPath(); rr(x, tx - 3, ty - 5, 6, 9, 2.6); x.fill(); x.stroke();
    if(q % 3 === 0){ x.strokeStyle = '#6a665c'; x.lineWidth = 1; x.beginPath(); x.moveTo(tx, ty - 3.4); x.lineTo(tx, ty + 2.4); x.moveTo(tx - 2, ty - 1.4); x.lineTo(tx + 2, ty - 1.4); x.stroke(); }
    x.fillStyle = 'rgba(232,74,106,.8)'; if(q % 4 === 1){ rond(x, tx + 4, ty + 3, 1); x.fill(); }
  }
  [[-92, -60], [92, -210]].forEach(function(p2){ var a = {x:p2[0], y:p2[1], r:14, sorte:'sapin', g:91 + p2[0]}; ombreRond(x, a.x, a.y, a.r, L, 22); dessinerArbre(x, a, L); });
  /* la nef, le transept, l'abside (ardoise) */
  ombre(x, {x:-46, y:-206, w:92, h:126}, L, 34); ombre(x, {x:-78, y:-168, w:156, h:34}, L, 30);
  x.save(); x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; ovale(x, L.ombre.x * 30, -206 + L.ombre.y * 30, 46, 40, 0); x.fill(); x.restore();
  /* l'abside : un demi-disque d'ardoise, ses rayons */
  x.fillStyle = '#56627c'; x.strokeStyle = K; x.lineWidth = 1.8; x.beginPath(); x.moveTo(-44, -204); x.arc(0, -204, 44, PI, TAU); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(18,22,40,.4)'; x.lineWidth = .5; x.beginPath(); for(q = 1; q < 8; q++){ var a5 = PI + q / 8 * PI; x.moveTo(0, -204); x.lineTo(Math.cos(a5) * 44, -204 + Math.sin(a5) * 44); } x.stroke();
  for(q = 1; q < 6; q++){ x.beginPath(); x.arc(0, -204, 44 * q / 6, PI, TAU); x.stroke(); }
  dessinerToit(x, {x:-46, y:-206, w:92, h:126, sens:'v', c:'#5d6b8c', toit:'ardoise', chem:[], lucarne:false, g:5151}, L);
  dessinerToit(x, {x:-78, y:-168, w:156, h:34, sens:'h', c:'#66748f', toit:'ardoise', chem:[], lucarne:false, g:5252}, L);
  /* les contreforts */
  x.fillStyle = '#9a968c'; x.strokeStyle = K; x.lineWidth = 1;
  [-192, -110, -96].forEach(function(yy){ x.fillRect(-52, yy, 6, 7); x.strokeRect(-52, yy, 6, 7); x.fillRect(46, yy, 6, 7); x.strokeRect(46, yy, 6, 7); });
  /* le clocher : un carré de pierre, sa flèche en pyramide (quatre pans), une croix d'or */
  ombre(x, {x:-30, y:-84, w:60, h:56}, L, 70);
  x.fillStyle = '#b4b0a4'; x.strokeStyle = K; x.lineWidth = 2.2; x.fillRect(-30, -84, 60, 56); x.strokeRect(-30, -84, 60, 56);
  var sun = {x:-L.ombre.x, y:-L.ombre.y}, faces = [[[-26, -80], [26, -80], 'h', -1], [[26, -80], [26, -32], 'v', 1], [[26, -32], [-26, -32], 'h', 1], [[-26, -32], [-26, -80], 'v', -1]];
  faces.forEach(function(f){
    var nrm = f[2] === 'h' ? {x:0, y:f[3]} : {x:f[3], y:0}, l = nrm.x * sun.x + nrm.y * sun.y;
    x.fillStyle = mix('#57647e', l > 0 ? '#c8d2e6' : '#10141e', Math.min(.5, Math.abs(l) * .4));
    x.beginPath(); x.moveTo(f[0][0], f[0][1]); x.lineTo(f[1][0], f[1][1]); x.lineTo(0, -56); x.closePath(); x.fill(); x.strokeStyle = K; x.lineWidth = 1.2; x.stroke();
  });
  x.strokeStyle = 'rgba(18,22,40,.3)'; x.lineWidth = .4; x.beginPath(); for(q = 1; q < 6; q++){ var t5 = q / 6; x.moveTo(-26 * (1 - t5), -80 + 24 * t5); x.lineTo(26 * (1 - t5), -80 + 24 * t5); x.lineTo(26 * (1 - t5), -32 - 24 * t5); x.lineTo(-26 * (1 - t5), -32 - 24 * t5); x.closePath(); } x.stroke();
  x.strokeStyle = '#7a5a1a'; x.lineWidth = 2.6; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, -62); x.lineTo(0, -50); x.moveTo(-4, -56); x.lineTo(4, -56); x.stroke();
  x.strokeStyle = '#f2c84a'; x.lineWidth = 1.4; x.stroke();
  /* la grille de la crypte : un cadre de pierre au pied du clocher, un escalier qui s'enfonce, des barreaux */
  x.fillStyle = '#8f8a80'; x.strokeStyle = K; x.lineWidth = 2.2; x.beginPath(); rr(x, -22, -28, 44, 31, 5); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(60,54,46,.55)'; x.lineWidth = .5; x.beginPath(); x.moveTo(-22, -16); x.lineTo(-17, -16); x.moveTo(17, -16); x.lineTo(22, -16); x.moveTo(-10, -28); x.lineTo(-10, -24); x.moveTo(10, -28); x.lineTo(10, -24); x.stroke();
  x.fillStyle = '#17131f'; x.beginPath(); rr(x, -16, -24, 32, 23, 3); x.fill();
  x.fillStyle = '#2c2638'; x.fillRect(-16, -8, 32, 5); x.fillStyle = '#231e2e'; x.fillRect(-16, -14, 32, 5); x.fillStyle = '#1c1826'; x.fillRect(-16, -19, 32, 4);
  x.strokeStyle = '#c9c4b8'; x.lineWidth = 2; x.lineCap = 'round';
  for(q = -2; q <= 2; q++){ x.beginPath(); x.moveTo(q * 6.2, -23); x.lineTo(q * 6.2, -2); x.stroke(); }
  x.beginPath(); x.moveTo(-15, -12.5); x.lineTo(15, -12.5); x.stroke();
  x.strokeStyle = 'rgba(60,40,30,.5)'; x.lineWidth = .9; x.beginPath(); x.moveTo(-6, -19); x.lineTo(-6, -15); x.moveTo(12, -9); x.lineTo(12, -4); x.stroke();
  x.fillStyle = '#6a5a3a'; x.strokeStyle = K; x.lineWidth = 1; x.beginPath(); rr(x, 9, -15, 5, 6, 1.5); x.fill(); x.stroke();
  x.strokeStyle = K; x.lineWidth = 1.4; x.beginPath(); rr(x, -16, -24, 32, 23, 3); x.stroke();
  /* deux lanternes, de chaque côté du clocher */
  [[-36, -26], [36, -26]].forEach(function(p3){ dessinerLampe(x, {x:p3[0], y:p3[1], lx:p3[0], ly:p3[1] + 6}, L); });
  x.restore();
}
/* le bout d'une fausse piste : (0, 0) le fond de l'impasse, l'impasse arrive par le bas (on tourne le dessin) */
function dessinerLieu(x, F, L){
  x.save(); x.translate(F.bx, F.by); x.rotate(Math.atan2(F.dy, F.dx) + PI / 2);
  var r = graine(F.g), i;
  x.strokeStyle = K; x.lineWidth = 2;
  if(F.lieu === 'voisin' || F.lieu === 'boulangerie'){
    var m = {x:-54, y:-70, w:108, h:66, sens:'h', c:F.lieu === 'voisin' ? '#5d6b8c' : '#c9973a', toit:F.lieu === 'voisin' ? 'ardoise' : 'tuile', chem:[{u:.78, v:.3}], lucarne:true, g:F.g};
    ombre(x, m, L, 16); dessinerToit(x, m, L);
    x.fillStyle = '#b4a48c'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(-15, -4, 30, 6); x.strokeRect(-15, -4, 30, 6);
  }
  if(F.lieu === 'voisin'){
    x.fillStyle = '#4f7ec4'; x.fillRect(-11, 3, 22, 8); x.strokeRect(-11, 3, 22, 8);
    for(i = 0; i < 6; i++){ var gx = -25 + (i % 3) * 10 + (i > 2 ? 30 : 0), gy = 22 + (i % 2) * 4;
      x.fillStyle = '#5a8fc8'; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, gx, gy, 4.4); x.fill(); x.stroke(); x.fillStyle = '#2f4f78'; rond(x, gx, gy, 2.6); x.fill(); x.fillStyle = 'rgba(255,255,255,.4)'; rond(x, gx - 1.4, gy - 1.4, 1); x.fill(); }
  } else if(F.lieu === 'boulangerie'){
    x.fillStyle = 'rgba(255,255,255,.85)'; ovale(x, 2, 24, 24, 12, 0); x.fill();
    for(i = 0; i < 14; i++){ rond(x, 2 + (r() - .5) * 60, 24 + (r() - .5) * 30, .5 + r()); x.fill(); }
    [[-22, 14], [20, 12], [-4, 10]].forEach(function(q){ x.fillStyle = '#f0e6d0'; x.strokeStyle = K; x.lineWidth = 1.3; ovale(x, q[0], q[1], 8, 10, .2); x.fill(); x.stroke(); x.fillStyle = '#c8b48a'; x.fillRect(q[0] - 4, q[1] - 2, 8, 2.4); });
    x.fillStyle = '#b8864a'; x.strokeStyle = K; x.lineWidth = 1.2; x.beginPath(); rr(x, 26, 22, 18, 11, 4); x.fill(); x.stroke();
    x.fillStyle = '#d89a4a'; for(i = 0; i < 3; i++){ ovale(x, 30 + i * 5, 27.5, 2.2, 4, .4); x.fill(); }
  } else if(F.lieu === 'lavoir'){
    ombre(x, {x:-34, y:-46, w:68, h:50}, L, 4);
    x.fillStyle = '#8a8478'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -34, -46, 68, 50, 6); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(60,54,46,.55)'; x.lineWidth = .5; x.beginPath(); for(i = -28; i < 34; i += 9){ x.moveTo(i, -46); x.lineTo(i, -40); x.moveTo(i, -2); x.lineTo(i, 4); } x.stroke();
    var gr = x.createLinearGradient(-26, -38, 26, -4); gr.addColorStop(0, L.ciel); gr.addColorStop(1, L.cielB); x.fillStyle = gr; x.beginPath(); rr(x, -27, -39, 54, 36, 4); x.fill();
    x.strokeStyle = L.reflet; x.lineWidth = 1.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-16, -26); x.quadraticCurveTo(-8, -29, 0, -26); x.quadraticCurveTo(8, -23, 16, -26); x.moveTo(-12, -14); x.quadraticCurveTo(-4, -17, 4, -14); x.stroke();
    x.fillStyle = '#c8a46a'; x.strokeStyle = K; x.lineWidth = 1.1; x.fillRect(-30, -2, 14, 7); x.strokeRect(-30, -2, 14, 7);
    x.strokeStyle = '#8a6a3a'; x.lineWidth = .5; x.beginPath(); for(i = -29; i < -16; i += 2){ x.moveTo(i, -2); x.lineTo(i, 5); } x.stroke();
    x.fillStyle = '#b8864a'; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, 22, 14, 8); x.fill(); x.stroke(); x.fillStyle = '#e8e2d4'; rond(x, 22, 14, 5.6); x.fill(); x.fillStyle = '#4f7ec4'; ovale(x, 20, 13, 3, 2, .4); x.fill();
  } else if(F.lieu === 'arbre'){
    var a = {x:0, y:-10, r:34, sorte:'feuillu', g:F.g};
    ombreRond(x, a.x, a.y, a.r, L, 30); dessinerArbre(x, a, L);
    x.strokeStyle = K; x.lineWidth = 5.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(14, 18); x.quadraticCurveTo(26, 28, 20, 38); x.stroke();
    x.strokeStyle = '#f4f1ea'; x.lineWidth = 3; x.beginPath(); x.moveTo(14, 18); x.quadraticCurveTo(26, 28, 20, 38); x.stroke();
    x.fillStyle = '#8a6a3a'; for(i = 0; i < 5; i++){ ovale(x, -20 + r() * 40, 16 + r() * 18, 1.4, 2.4, r() * 3); x.fill(); }
  } else if(F.lieu === 'carriole'){
    ombre(x, {x:-22, y:-4, w:44, h:42}, L, 14);
    x.strokeStyle = K; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-10, 38); x.lineTo(-8, 54); x.moveTo(10, 38); x.lineTo(8, 54); x.stroke();
    x.fillStyle = '#3a2c20'; x.fillRect(-27, 4, 6, 26); x.fillRect(21, 4, 6, 26);
    x.fillStyle = '#d8a23c'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -21, -4, 42, 42, 5); x.fill(); x.stroke();
    x.fillStyle = '#c0453a'; for(i = 0; i < 3; i++) x.fillRect(-21 + 4 + i * 13, -4, 6, 42);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(-21, -4, 42, 8);
    x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -21, -4, 42, 42, 5); x.stroke();
    x.beginPath(); x.moveTo(0, -4); x.lineTo(0, 38); x.lineWidth = 1; x.stroke();
  } else {
    x.fillStyle = '#6e5236'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -34, -6, 68, 52, 4); x.fill(); x.stroke();
    for(i = 0; i < 12; i++){ var cx = -24 + (i % 4) * 16, cy = 4 + Math.floor(i / 4) * 15;
      x.fillStyle = '#6fbf5a'; x.strokeStyle = K; x.lineWidth = 1.3; rond(x, cx, cy, 5.6); x.fill(); x.stroke();
      x.fillStyle = '#a5dc8a'; rond(x, cx - 1.2, cy - 1.2, 2.6); x.fill(); x.strokeStyle = 'rgba(40,90,40,.6)'; x.lineWidth = .5; x.beginPath(); x.moveTo(cx, cy - 5); x.lineTo(cx, cy + 5); x.moveTo(cx - 5, cy); x.lineTo(cx + 5, cy); x.stroke(); }
    /* l'épouvantail */
    x.strokeStyle = '#7a5232'; x.lineWidth = 2; x.beginPath(); x.moveTo(26, -2); x.lineTo(42, -2); x.stroke();
    x.fillStyle = '#c94b4b'; x.strokeStyle = K; x.lineWidth = 1.2; ovale(x, 34, -2, 5, 4, 0); x.fill(); x.stroke();
    x.fillStyle = '#e3b84a'; rond(x, 34, -2, 3.4); x.fill(); x.stroke();
  }
  x.restore();
}

/* ==========================================================
   LES MORCEAUX DU DÉCOR, DESSINÉS UNE FOIS (Blocs) — tout ce qui ne bouge pas
   ========================================================== */
function Index(){
  var T = 160, g = {}, n = 0, marque = 0;
  return {
    ajouter:function(it){ it.n = n++; it.vu = 0; var a0 = Math.floor(it.x0 / T), a1 = Math.floor(it.x1 / T), b0 = Math.floor(it.y0 / T), b1 = Math.floor(it.y1 / T);
      for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++) (g[a + ':' + b] = g[a + ':' + b] || []).push(it); },
    chercher:function(R){
      marque++; var l = [], a0 = Math.floor(R.x / T), a1 = Math.floor((R.x + R.w) / T), b0 = Math.floor(R.y / T), b1 = Math.floor((R.y + R.h) / T);
      for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++){ var c = g[a + ':' + b]; if(!c) continue;
        for(var k = 0; k < c.length; k++){ var it = c[k]; if(it.vu === marque) continue; it.vu = marque; if(it.x1 < R.x || it.x0 > R.x + R.w || it.y1 < R.y || it.y0 > R.y + R.h) continue; l.push(it); } }
      l.sort(function(p, q){ return p.z - q.z || p.n - q.n; }); return l;
    }
  };
}
/* la liste de tout ce qui se dessine dans un morceau, avec sa couche (z) : 1 le sol des cours, 3 les détails de la rue, 4 le lait,
   5 les flaques, 5.5 le noir sous les passages ; [les traces des chats] ; 6 les ombres, 7 les objets, 8 les toits, 9 les arbres,
   10 les lieux, 11 les lanternes */
function preparerDecor(M, L){
  var I = Index();
  function aj(z, b, d){ I.ajouter({z:z, x0:b.x, y0:b.y, x1:b.x + b.w, y1:b.y + b.h, d:d}); }
  function boite(x0, y0, x1, y1){ return {x:x0, y:y0, w:x1 - x0, h:y1 - y0}; }
  /* de grandes taches plus claires ou plus sombres sur l'herbe, et des salissures sur les pavés : la tuile ne se voit plus se répéter */
  var rv = graine(M.W * 3 + M.H * 5);
  for(var vx = -MARGE; vx < M.W + MARGE; vx += 96) for(var vy = -MARGE; vy < M.H + MARGE; vy += 96){
    (function(cx, cy, cr, clair, sale){
      aj(.5, boite(cx - cr, cy - cr, cx + cr, cy + cr), function(x){ var g = x.createRadialGradient(cx, cy, 0, cx, cy, cr);
        g.addColorStop(0, clair ? 'rgba(150,196,104,.22)' : 'rgba(40,80,40,.2)'); g.addColorStop(1, clair ? 'rgba(150,196,104,0)' : 'rgba(40,80,40,0)'); x.fillStyle = g; x.fillRect(cx - cr, cy - cr, cr * 2, cr * 2); });
      if(sale && M.dansRue(cx, cy)) aj(2.2, boite(cx - cr * .5, cy - cr * .5, cx + cr * .5, cy + cr * .5), function(x){ var g = x.createRadialGradient(cx, cy, 0, cx, cy, cr * .5);
        g.addColorStop(0, 'rgba(84,66,46,.13)'); g.addColorStop(1, 'rgba(84,66,46,0)'); x.fillStyle = g; x.fillRect(cx - cr * .5, cy - cr * .5, cr, cr); });
    })(vx + rv() * 96, vy + rv() * 96, 40 + rv() * 60, rv() < .5, rv() < .6);
  }
  M.cellules.forEach(function(c){ if(c.sol === 'cour') aj(1, c, function(x, E){ x.save(); x.beginPath(); x.rect(c.x, c.y, c.w, c.h); x.clip(); carreler(x, E.tu.terre, E.R, E.tu.Tw); x.restore(); }); });
  M.sols.forEach(function(o){ aj(1.2, o, function(x){ dessinerSol(x, o); }); });
  M.bords.forEach(function(b){ aj(1.4, boite(Math.min(b.x1, b.x2) - 6, Math.min(b.y1, b.y2) - 6, Math.max(b.x1, b.x2) + 6, Math.max(b.y1, b.y2) + 6), function(x){ dessinerBord(x, b); }); });
  /* les détails de la rue : des grilles d'égout, des feuilles mortes, de la paille */
  var r = graine(M.W * 7 + M.H), rues = M.rues;
  rues.forEach(function(R2){
    var n = Math.round(R2.w * R2.h / 2600);
    for(var q = 0; q < n; q++){
      var d = {x:R2.x + 4 + r() * (R2.w - 8), y:R2.y + 4 + r() * (R2.h - 8), a:r() * TAU, t:r() < .55 ? 'feuille' : r() < .7 ? 'paille' : 'caillou', c:U.choix(['#c9742f', '#d8a13a', '#a8562a', '#b88a3a'])};
      (function(d2){ aj(3, boite(d2.x - 3, d2.y - 3, d2.x + 3, d2.y + 3), function(x){
        if(d2.t === 'feuille'){ x.fillStyle = d2.c; ovale(x, d2.x, d2.y, 1.9, .95, d2.a); x.fill(); x.strokeStyle = 'rgba(80,40,10,.5)'; x.lineWidth = .3; x.beginPath(); x.moveTo(d2.x - Math.cos(d2.a) * 1.9, d2.y - Math.sin(d2.a) * 1.9); x.lineTo(d2.x + Math.cos(d2.a) * 2.6, d2.y + Math.sin(d2.a) * 2.6); x.stroke(); }
        else if(d2.t === 'paille'){ x.strokeStyle = '#d8b860'; x.lineWidth = .4; x.beginPath(); for(var k = 0; k < 3; k++){ var aa = d2.a + k * .5; x.moveTo(d2.x, d2.y); x.lineTo(d2.x + Math.cos(aa) * 3, d2.y + Math.sin(aa) * 3); } x.stroke(); }
        else { x.fillStyle = '#8d8070'; ovale(x, d2.x, d2.y, 1.1, .8, d2.a); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; rond(x, d2.x - .3, d2.y - .3, .35); x.fill(); }
      }); })(d);
    }
  });
  M.gx.forEach(function(gxx, i){ M.gy.forEach(function(gyy, j){
    if((i * 7 + j * 3) % 4) return;
    var dx = gxx + (j % 2 ? 24 : -24), dy = gyy + (i % 2 ? -24 : 24);
    aj(3, boite(dx - 6, dy - 6, dx + 6, dy + 6), function(x){ x.fillStyle = '#3a3640'; x.strokeStyle = K; x.lineWidth = .9; x.fillRect(dx - 4.5, dy - 3, 9, 6); x.strokeRect(dx - 4.5, dy - 3, 9, 6);
      x.strokeStyle = '#706a78'; x.lineWidth = .7; x.beginPath(); for(var k = -3; k <= 3; k += 1.5){ x.moveTo(dx + k, dy - 2.4); x.lineTo(dx + k, dy + 2.4); } x.stroke(); });
  }); });
  /* le lait devant chez Odette (sous les traces) */
  aj(4, boite(M.odette.bx - 50, M.odette.by - 4, M.odette.bx + 50, M.odette.by + 56), function(x){ dessinerOdetteSol(x, M.odette); });
  M.taches.forEach(function(T){ aj(5, boite(T.x - T.rx * 1.5 - 6, T.y - T.rx * 1.5 - 6, T.x + T.rx * 1.5 + 6, T.y + T.rx * 1.5 + 6), function(x){ dessinerTache(x, T, L, rues); }); });
  M.arches.forEach(function(A){
    aj(5.5, A, function(x){
      var g = A.sens === 'h' ? x.createLinearGradient(A.x, 0, A.x + A.w, 0) : x.createLinearGradient(0, A.y, 0, A.y + A.h);
      g.addColorStop(0, 'rgba(14,10,22,.25)'); g.addColorStop(.2, 'rgba(14,10,22,.5)'); g.addColorStop(.8, 'rgba(14,10,22,.5)'); g.addColorStop(1, 'rgba(14,10,22,.25)');
      x.fillStyle = g; x.fillRect(A.x, A.y, A.w, A.h);
    });
    /* l'ombre de la maison du passage, sur la rue */
    aj(6, boite(A.bat.x - 40, A.bat.y - 40, A.bat.x + A.bat.w + 40, A.bat.y + A.bat.h + 40), function(x){ ombre(x, A.bat, L, 22); });
  });
  /* les ombres, puis les choses, puis les toits, puis les arbres */
  M.obstacles.forEach(function(o){ var b = boite(o.x - 30, o.y - 30, o.x + o.w + 30, o.y + o.h + 30);
    aj(6, b, function(x){ ombreObjet(x, o, L); }); aj(7, b, function(x){ dessinerObjet(x, o, L); }); });
  M.objets.forEach(function(o){ var b = boite(o.x - 26, o.y - 26, o.x + o.w + 26, o.y + o.h + 26);
    aj(6, b, function(x){ ombreObjet(x, o, L); }); aj(7, b, function(x){ dessinerObjet(x, o, L); }); });
  M.maisons.forEach(function(m){ var b = boite(m.x - 36, m.y - 36, m.x + m.w + 36, m.y + m.h + 36);
    aj(6, b, function(x){ ombre(x, m, L, m.haut); }); aj(8, boite(m.x - 4, m.y - 4, m.x + m.w + 4, m.y + m.h + 4), function(x){ dessinerToit(x, m, L); }); });
  M.arbres.forEach(function(a){ var b = boite(a.x - a.r - 34, a.y - a.r - 34, a.x + a.r + 34, a.y + a.r + 34);
    aj(6, b, function(x){ ombreRond(x, a.x, a.y, a.r, L, a.haut); }); aj(9, boite(a.x - a.r - 3, a.y - a.r - 3, a.x + a.r + 3, a.y + a.r + 3), function(x){ dessinerArbre(x, a, L); }); });
  M.dessus.forEach(function(a){ var b = boite(a.x - a.r - 40, a.y - a.r - 40, a.x + a.r + 40, a.y + a.r + 40);
    aj(6, b, function(x){ ombreRond(x, a.x, a.y, a.r, L, a.haut); });
    aj(7, boite(a.x - 4, a.y - 4, a.x + 4, a.y + 4), function(x){ x.fillStyle = '#5a3e26'; x.strokeStyle = K; x.lineWidth = 1; rond(x, a.x, a.y, 3.2); x.fill(); x.stroke(); }); });
  /* les lieux : chez Odette, l'église, les bouts des fausses pistes */
  aj(10, boite(M.odette.bx - 70, M.odette.by - 90, M.odette.bx + 70, M.odette.by + 20), function(x){ dessinerOdette(x, M.odette, L); });
  aj(10, M.egBoite, function(x){ dessinerEglise(x, M.eglise, L); });
  M.fins.forEach(function(F){ aj(10, boite(F.bx - 110, F.by - 110, F.bx + 110, F.by + 110), function(x){ dessinerLieu(x, F, L); }); });
  M.lampes.forEach(function(l){ aj(11, boite(l.x - 30, l.y - 30, l.x + 30, l.y + 30), function(x){ dessinerLampe(x, l, L); }); });
  return I;
}
function Blocs(M, I, L, s){
  var CW = CPX / s, cache = {}, nb = 0, MAX = 48, horloge = 0, pool = [];
  var tu = {paves:tuile(s, 'paves'), herbe:tuile(s, 'herbe'), terre:tuile(s, 'terre')}; tu.Tw = tu.paves.width / s;
  var stats = {faits:0, ms:0, pire:0};
  function rendre(bx, by){
    var t0 = performance.now();
    var c = pool.pop(); if(!c){ c = document.createElement('canvas'); c.width = c.height = CPX; }
    var x = c.getContext('2d', {alpha:false}), X0 = bx * CW, Y0 = by * CW, R = {x:X0, y:Y0, w:CW, h:CW}, E = {R:R, tu:tu, L:L};   /* (opaque : se recopie plus vite) */
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, CPX, CPX);
    x.setTransform(s, 0, 0, s, -X0 * s, -Y0 * s);
    x.lineCap = 'butt'; x.lineJoin = 'miter';
    carreler(x, tu.herbe, R, tu.Tw);
    var items = I.chercher({x:X0 - 2, y:Y0 - 2, w:CW + 4, h:CW + 4}), i = 0;
    for(; i < items.length && items[i].z < 2; i++) items[i].d(x, E);
    /* les rues : la bordure de pierre (le trottoir), les pavés, une ombre douce le long des bords */
    var rs = M.rues.filter(function(r){ return croise(r, R, 8); });
    if(rs.length){
      x.fillStyle = '#8f8270'; rs.forEach(function(r){ x.fillRect(r.x - 4.5, r.y - 4.5, r.w + 9, r.h + 9); });
      x.strokeStyle = 'rgba(60,50,40,.45)'; x.lineWidth = .5; x.beginPath();
      rs.forEach(function(r){ for(var u = r.x - 4.5; u < r.x + r.w + 4.5; u += 5.5){ if(u < X0 - 6 || u > X0 + CW + 6) continue; x.moveTo(u, r.y - 4.5); x.lineTo(u, r.y - .5); x.moveTo(u, r.y + r.h + .5); x.lineTo(u, r.y + r.h + 4.5); }
        for(var v = r.y - 4.5; v < r.y + r.h + 4.5; v += 5.5){ if(v < Y0 - 6 || v > Y0 + CW + 6) continue; x.moveTo(r.x - 4.5, v); x.lineTo(r.x - .5, v); x.moveTo(r.x + r.w + .5, v); x.lineTo(r.x + r.w + 4.5, v); } });
      x.stroke();
      x.save(); x.beginPath(); rs.forEach(function(r){ x.rect(r.x, r.y, r.w, r.h); }); x.clip();
      carreler(x, tu.paves, R, tu.Tw); x.fillStyle = 'rgba(40,30,20,.24)'; x.fillRect(X0 - 2, Y0 - 2, CW + 4, CW + 4);
      x.restore();
      x.save(); x.beginPath(); rs.forEach(function(r){ x.rect(r.x + 2.2, r.y + 2.2, r.w - 4.4, r.h - 4.4); }); x.clip();
      carreler(x, tu.paves, R, tu.Tw);
      x.restore();
    }
    for(; i < items.length && items[i].z < 6; i++) items[i].d(x, E);
    /* les traces des chats */
    var cx0 = Math.floor((X0 - 10) / M.CASE), cx1 = Math.floor((X0 + CW + 10) / M.CASE), cy0 = Math.floor((Y0 - 10) / M.CASE), cy1 = Math.floor((Y0 + CW + 10) / M.CASE);
    for(var a = cx0; a <= cx1; a++) for(var b = cy0; b <= cy1; b++){
      var l = M.cases[a + ':' + b]; if(!l) continue;
      for(var k = 0; k < l.length; k++){ var T = l[k]; if(T.x < X0 - 10 || T.x > X0 + CW + 10 || T.y < Y0 - 10 || T.y > Y0 + CW + 10) continue; dessinerTrace(x, T); }
    }
    for(; i < items.length; i++) items[i].d(x, E);
    var dt = performance.now() - t0; stats.faits++; stats.ms += dt; if(dt > stats.pire) stats.pire = dt;
    return c;
  }
  function obtenir(bx, by, forcer){
    var cle = bx + ':' + by, e = cache[cle];
    if(e){ e.h = ++horloge; return e.c; }
    if(!forcer) return null;
    if(nb >= MAX){
      var vieux = null; for(var k in cache){ if(!vieux || cache[k].h < cache[vieux].h) vieux = k; }
      if(vieux){ pool.push(cache[vieux].c); delete cache[vieux]; nb--; }
    }
    var c = rendre(bx, by); cache[cle] = {c:c, h:++horloge}; nb++;
    return c;
  }
  function vider(){ for(var k in cache) pool.push(cache[k].c); cache = {}; nb = 0; }
  return {CW:CW, obtenir:obtenir, vider:vider, stats:stats, a:function(bx, by){ return !!cache[bx + ':' + by]; }};
}

/* ==========================================================
   CE QUI BOUGE : les chats vus du ciel (qui courent, assis), les pigeons, le linge, la fumée
   ========================================================== */
function chatCourt(x, C, px, py, ang, ph, t, al){
  var R = C.robe, g = (R.gros || 1) * (R.fine ? .92 : 1), w = R.fine ? .84 : 1, s = Math.sin(ph), c2 = Math.cos(ph);
  x.save(); x.translate(px, py); x.rotate(ang + PI / 2); x.scale(g, g); if(al != null) x.globalAlpha = al;
  x.fillStyle = 'rgba(10,14,24,.26)'; ovale(x, 1.6, 2.4, 6.2 * w, 12.4, 0); x.fill();
  /* la queue, derrière, qui ondule */
  var qx = Math.sin(t * 9) * 3.2;
  x.lineCap = 'round'; x.strokeStyle = K; x.lineWidth = 3.6; x.beginPath(); x.moveTo(0, 8); x.quadraticCurveTo(qx * .6, 14, qx, 20.5); x.stroke();
  x.strokeStyle = R.c; x.lineWidth = 2.1; x.stroke();
  /* les pattes, au galop : celles de devant ensemble, celles de derrière ensemble */
  var fy = -6.4 - s * 3.6, by = 6.4 + s * 3.6;
  x.fillStyle = R.c2; x.strokeStyle = K; x.lineWidth = .9;
  [[-2.9, fy], [2.9, fy + .8], [-3.1, by], [3.1, by - .8]].forEach(function(q){ ovale(x, q[0], q[1], 1.6, 2.4, 0); x.fill(); x.stroke(); });
  /* le corps, qui s'allonge et se ramasse */
  var L2 = 9.4 + c2 * 1;
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 0, 0, 5.1 * w, L2, 0); x.fill(); x.stroke();
  x.fillStyle = rgba(R.c2, .55); ovale(x, 0, -.5, 2.4 * w, L2 * .62, 0); x.fill();
  if(R.raies){ x.strokeStyle = R.raies; x.lineWidth = 1; x.beginPath(); for(var q = -2; q <= 2; q++){ x.moveTo(-4 * w, q * 3); x.quadraticCurveTo(0, q * 3 - 1.4, 4 * w, q * 3); } x.stroke(); }
  /* la tête, les oreilles, le museau */
  var hy = -L2 - 2.4;
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(-3.6, hy + .6); x.lineTo(-3.4, hy - 3.6); x.lineTo(-1, hy - 1.6); x.closePath(); x.moveTo(3.6, hy + .6); x.lineTo(3.4, hy - 3.6); x.lineTo(1, hy - 1.6); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#f4a9b4'; x.beginPath(); x.moveTo(-3, hy - .2); x.lineTo(-3, hy - 2.6); x.lineTo(-1.6, hy - 1.4); x.closePath(); x.moveTo(3, hy - .2); x.lineTo(3, hy - 2.6); x.lineTo(1.6, hy - 1.4); x.closePath(); x.fill();
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, 0, hy, 4); x.fill(); x.stroke();
  x.fillStyle = R.c2; ovale(x, 0, hy - 2.6, 1.8, 1.3, 0); x.fill();
  x.fillStyle = '#e0788a'; rond(x, 0, hy - 3.4, .55); x.fill();
  x.restore();
}
/* Moustache, assis devant la grille : le gros gris, la queue enroulée ; quand il miaule, il lève la tête */
function chatAssis(x, C, px, py, ang, t, miaule, al){
  var R = C.robe, g = R.gros || 1;
  x.save(); x.translate(px, py); x.rotate(ang + PI / 2); x.scale(g, g); if(al != null) x.globalAlpha = al;
  x.fillStyle = 'rgba(10,14,24,.28)'; ovale(x, 1.5, 2.4, 8.6, 9.4, 0); x.fill();
  var bq = Math.sin(t * 2.2) * .8;
  x.lineCap = 'round'; x.strokeStyle = K; x.lineWidth = 3.6; x.beginPath(); x.moveTo(3, 8); x.bezierCurveTo(10.5, 8, 11 + bq, -2, 5.5 + bq, -6.4); x.stroke();
  x.strokeStyle = R.c; x.lineWidth = 2.1; x.stroke();
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 0, 2.4, 7.4, 8, 0); x.fill(); x.stroke();
  x.fillStyle = rgba(R.c2, .55); ovale(x, 0, 3.2, 3.8, 5, 0); x.fill();
  x.fillStyle = R.c2; x.strokeStyle = K; x.lineWidth = .9; ovale(x, -2.2, -4.6, 1.8, 2.2, 0); x.fill(); x.stroke(); ovale(x, 2.2, -4.6, 1.8, 2.2, 0); x.fill(); x.stroke();
  var lev = miaule ? 1 : 0, hy = -5.6 - lev * 1.6, hs = 1 + lev * .08;
  x.save(); x.translate(0, hy); x.scale(hs, hs);
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(-4.4, .4); x.lineTo(-4.2, -4.6); x.lineTo(-1.2, -2.2); x.closePath(); x.moveTo(4.4, .4); x.lineTo(4.2, -4.6); x.lineTo(1.2, -2.2); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#f4a9b4'; x.beginPath(); x.moveTo(-3.6, -.4); x.lineTo(-3.6, -3.4); x.lineTo(-2, -1.8); x.closePath(); x.moveTo(3.6, -.4); x.lineTo(3.6, -3.4); x.lineTo(2, -1.8); x.closePath(); x.fill();
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, 0, 0, 5); x.fill(); x.stroke();
  x.fillStyle = R.c2; ovale(x, 0, -3.2, 2.3, 1.6, 0); x.fill();
  /* ses grandes moustaches */
  x.strokeStyle = 'rgba(36,24,46,.75)'; x.lineWidth = .4; x.beginPath(); x.moveTo(-1.6, -3.4); x.lineTo(-8.4, -4.6); x.moveTo(-1.6, -3); x.lineTo(-8.6, -2.4); x.moveTo(1.6, -3.4); x.lineTo(8.4, -4.6); x.moveTo(1.6, -3); x.lineTo(8.6, -2.4); x.stroke();
  x.fillStyle = '#e0788a'; rond(x, 0, -4.2, .7); x.fill();
  if(miaule){ x.fillStyle = '#5a1e2e'; ovale(x, 0, -4.9, 1, .7, 0); x.fill(); }
  x.restore();
  x.restore();
}
function pigeon(x, P, t){
  x.save(); x.translate(P.x, P.y); x.rotate(P.a + PI / 2);
  if(P.vol){
    var sc = 1 + Math.min(.7, P.tv * .8), f = Math.sin(t * 34 + P.ph);
    x.scale(sc, sc);
    x.fillStyle = 'rgba(10,14,24,.2)'; ovale(x, 4 + P.tv * 14, 6 + P.tv * 14, 6, 3, 0); x.fill();
    x.fillStyle = '#a7adb8'; x.strokeStyle = K; x.lineWidth = .7;
    x.beginPath(); x.ellipse(-4.6, 0, 4.6, 1.6 + Math.abs(f) * 1.2, -.2, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.ellipse(4.6, 0, 4.6, 1.6 + Math.abs(f) * 1.2, .2, 0, TAU); x.fill(); x.stroke();
  } else {
    x.fillStyle = 'rgba(10,14,24,.22)'; ovale(x, .6, 1, 2.8, 3.8, 0); x.fill();
  }
  var pk = P.vol ? 0 : Math.max(0, Math.sin(t * 5 + P.ph)) * 1.4;
  x.fillStyle = '#5a5f6c'; x.beginPath(); x.moveTo(-1.6, 2.6); x.lineTo(0, 5.6); x.lineTo(1.6, 2.6); x.closePath(); x.fill();
  x.fillStyle = '#8d93a0'; x.strokeStyle = K; x.lineWidth = .7; ovale(x, 0, 0, 2.5, 3.7, 0); x.fill(); x.stroke();
  x.fillStyle = '#a9afbc'; ovale(x, -1.2, .6, 1, 2.2, .2); x.fill(); ovale(x, 1.2, .6, 1, 2.2, -.2); x.fill();
  x.strokeStyle = '#4a4f5c'; x.lineWidth = .4; x.beginPath(); x.moveTo(-2, 1); x.lineTo(-.6, 1.4); x.moveTo(2, 1); x.lineTo(.6, 1.4); x.stroke();
  x.fillStyle = '#5f9a86'; ovale(x, 0, -2.6, 1.5, 1, 0); x.fill();
  x.fillStyle = '#6f7686'; x.strokeStyle = K; x.lineWidth = .6; rond(x, 0, -3.8 - pk, 1.35); x.fill(); x.stroke();
  x.fillStyle = '#e0b080'; rond(x, 0, -5.1 - pk, .4); x.fill();
  x.restore();
}
function dessinerLinge(x, Ln, t, ombreL){
  var dx = Ln.x2 - Ln.x1, dy = Ln.y2 - Ln.y1, ox = ombreL ? ombreL.x : 0, oy = ombreL ? ombreL.y : 0;
  if(!ombreL){ x.strokeStyle = '#4a3a2c'; x.lineWidth = .7; x.beginPath(); x.moveTo(Ln.x1, Ln.y1); x.lineTo(Ln.x2, Ln.y2); x.stroke(); }
  else { x.strokeStyle = 'rgba(16,22,40,.16)'; x.lineWidth = .7; x.beginPath(); x.moveTo(Ln.x1 + ox, Ln.y1 + oy); x.lineTo(Ln.x2 + ox, Ln.y2 + oy); x.stroke(); }
  var a = Math.atan2(dy, dx);
  Ln.habits.forEach(function(h, i){
    var px = Ln.x1 + dx * h.u + ox, py = Ln.y1 + dy * h.u + oy, bal = Math.sin(t * 1.9 + h.ph) * .28;
    x.save(); x.translate(px, py); x.rotate(a + PI / 2 + bal);
    if(ombreL){ x.fillStyle = 'rgba(16,22,40,.16)'; x.fillRect(-h.w / 2, 0, h.w, h.h); }
    else {
      x.fillStyle = h.c; x.strokeStyle = K; x.lineWidth = .6;
      if(h.f === 'chemise'){ x.beginPath(); x.moveTo(-h.w / 2, 0); x.lineTo(h.w / 2, 0); x.lineTo(h.w / 2 + 2, 2.6); x.lineTo(h.w / 2 - 1, 3.4); x.lineTo(h.w / 2 - 1, h.h); x.lineTo(-h.w / 2 + 1, h.h); x.lineTo(-h.w / 2 + 1, 3.4); x.lineTo(-h.w / 2 - 2, 2.6); x.closePath(); x.fill(); x.stroke(); }
      else if(h.f === 'chaussette'){ x.beginPath(); rr(x, -1.6, 0, 3.2, h.h * .6, 1.4); x.fill(); x.stroke(); }
      else { x.fillRect(-h.w / 2, 0, h.w, h.h); x.strokeRect(-h.w / 2, 0, h.w, h.h); x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(-h.w / 2, h.h * .55, h.w, h.h * .45); }
      x.fillStyle = '#c8b090'; x.fillRect(-h.w / 2 + .6, -.6, 1, 1.6); x.fillRect(h.w / 2 - 1.6, -.6, 1, 1.6);
    }
    x.restore();
  });
}
/* une bouffée de fumée : un rond flou, dessiné une fois, qu'on pose agrandi et de plus en plus transparent */
var BOUFFEE = null;
function bouffee(){
  if(BOUFFEE) return BOUFFEE;
  var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(236,236,240,1)'); g.addColorStop(.45, 'rgba(228,228,234,.7)'); g.addColorStop(1, 'rgba(220,220,228,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (BOUFFEE = c);
}
function dessinerFumee(x, c, t, fort, k){
  var B = bouffee(); k = k == null ? 1 : k;
  for(var k = 0; k < 6; k++){
    var age = (t * .3 + c.ph + k / 6) % 1, px = c.x + VENT.x * age * 64 + Math.sin(age * 6 + c.ph * 10) * 3, py = c.y + VENT.y * age * 64;
    var r2 = 3 + age * 9, a = k * (fort ? .55 : .36) * (1 - age) * Math.min(1, age * 6);
    x.globalAlpha = a; x.drawImage(B, px - r2, py - r2, r2 * 2, r2 * 2);
  }
  x.globalAlpha = 1;
}

/* ==========================================================
   LES SONS (ce bloc est recopié tel quel dans l'Atelier des sons : donjon/essai/construire-sons.py)
   ========================================================== */
/* >>> LES SONS DES TRACES (15 novembre) : les pas dans l'eau, la boue, la farine ; les miaulements de Moustache ; les chats qui
   filent ; les pigeons qui s'envolent. Les mêmes briques que le gâteau de la fête (des notes douces, des souffles, des grains). */
function sonsPistage(audio, sortie){
  function tendre(f, t0, duree, vol, glisse, att, type, filtre){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
    g.connect(sortie(a)); o.start(t); o.stop(t + duree + 0.03);
  }
  function souffle(t0, duree, vol, f0, f1, q, type){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
    f.type = type || 'bandpass'; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.04, duree * .3)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  function grains(t0, duree, vol, nb, passeHaut){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr * duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var k = 0; k < nb; k++){ var c = Math.floor(n * Math.random() * .9), l = Math.floor(sr * (.001 + Math.random() * .004)), v = .4 + Math.random() * .6; for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random() * 2 - 1) * v * (1 - j / l); }
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = passeHaut || 2400; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* un miaulement : une voix un peu nasillarde (dents de scie filtrées) dont la hauteur monte puis retombe */
  function miaule(t0, f0, f1, f2, duree, vol){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), v = a.createOscillator(), vg = a.createGain(), b1 = a.createBiquadFilter(), b2 = a.createBiquadFilter(), g = a.createGain(), g2 = a.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + duree * .38); o.frequency.linearRampToValueAtTime(f2, t + duree);
    v.frequency.value = 6.2; vg.gain.value = f1 * .018; v.connect(vg); vg.connect(o.frequency);
    b1.type = 'bandpass'; b1.Q.value = 3.2; b1.frequency.setValueAtTime(800, t); b1.frequency.linearRampToValueAtTime(1600, t + duree * .4); b1.frequency.linearRampToValueAtTime(900, t + duree);
    b2.type = 'bandpass'; b2.Q.value = 5; b2.frequency.setValueAtTime(2500, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .06); g.gain.setValueAtTime(vol, t + duree * .7); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    g2.gain.value = .35;
    o.connect(b1); o.connect(b2); b2.connect(g2); g2.connect(g); b1.connect(g); g.connect(sortie(a));
    o.start(t); v.start(t); o.stop(t + duree + .05); v.stop(t + duree + .05);
  }
  function v(x){ return x == null ? 1 : Math.max(0, Math.min(1, x)); }
  return {
    plouf:function(x){ x = v(x); souffle(0, .2, .05 * x, 1500, 380, .7, 'lowpass'); tendre(620, .01, .12, .03 * x, 240, .005); tendre(1300, .06, .05, .012 * x, 700, .003); tendre(980, .11, .05, .01 * x, 520, .003); },   /* un pied dans la flaque */
    floc:function(x){ x = v(x); souffle(0, .16, .055 * x, 500, 160, 1.2); tendre(150, .02, .14, .05 * x, 85, .01, 'triangle', 420); tendre(240, .1, .06, .02 * x, 120, .005, 'triangle', 600); },                /* un pied dans la boue */
    pouf:function(x){ x = v(x); souffle(0, .34, .03 * x, 3200, 1100, .6); grains(.02, .22, .012 * x, 22, 3500); },                                                                                                    /* un pied dans la farine */
    miaouA:function(x){ miaule(0, 520, 780, 430, .62, .13 * v(x)); },                       /* « mi-aou » */
    miaouB:function(x){ miaule(0, 600, 860, 520, .95, .11 * v(x)); },                       /* un long miaulement plaintif */
    miaouC:function(x){ miaule(0, 470, 640, 700, .48, .12 * v(x)); },                       /* « mrraou ? » : il se demande */
    fuite:function(x){ x = v(x); for(var i = 0; i < 6; i++) tendre(420 + Math.random() * 120, i * .055, .03, .025 * x, 240, .002, 'triangle', 1400); miaule(.36, 700, 520, 380, .26, .04 * x); },   /* il file entre les barreaux */
    course:function(x){ x = v(x); for(var i = 0; i < 9; i++){ tendre(320 + (i % 2) * 70, i * .07, .028, .018 * x, 200, .002, 'triangle', 1100); } souffle(0, .6, .006 * x, 1800, 900, .9); },   /* un chat qui passe en courant */
    pigeons:function(x){ x = v(x); for(var i = 0; i < 12; i++) souffle(i * .045, .04, .045 * x, 1600 + Math.random() * 500, 900, 1.4); tendre(330, .02, .2, .02 * x, 290, .03); }                       /* les pigeons s'envolent */
  };
}
/* <<< LES SONS DES TRACES */
var ctxA = null;
function audio(){
  try{ if(window.Brume && Brume.sonActif && !Brume.sonActif()) return null; }catch(e){}
  try{ if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; }catch(e){}
  if(!ctxA){ try{ var AC = window.AudioContext || window.webkitAudioContext; ctxA = AC ? new AC() : null; }catch(e){ ctxA = null; } }
  if(ctxA && ctxA.state === 'suspended') try{ ctxA.resume(); }catch(e){}
  return ctxA;
}
var SONS = null;
function son(nom, vol){ try{ if(!SONS) SONS = sonsPistage(audio, function(a){ return a.destination; }); if(SONS[nom]) SONS[nom](vol); }catch(e){} }

/* ==========================================================
   LE JEU
   ========================================================== */
function quelMoment(p){
  if(p.moment && LUM[p.moment]) return p.moment;
  try{ if(window.M && M.P && M.P() && M.momentId){ var m = M.momentId(); if(LUM[m]) return m; } }catch(e){}
  return U.choix(['matin', 'apresmidi', 'nuit']);
}
function jouer(zone, p, fin){
  var moment = quelMoment(p), L = LUM[moment];
  var M = creerMonde(p), fini = false, arrete = false;
  zone.innerHTML = '<div class="pg pg-' + moment + '" tabindex="0"><canvas class="pg-sol"></canvas><svg class="pg-heros" viewBox="-22 -22 44 44" aria-hidden="true"><g class="pg-h"></g></svg>' +
    '<canvas class="pg-haut"></canvas><canvas class="pg-amb"></canvas><div class="pg-voile" aria-hidden="true"></div><div class="pg-dit"></div></div>';
  var racine = zone.querySelector('.pg'), cv = racine.querySelector('.pg-sol'), ctx = cv.getContext('2d', {alpha:false}), svgH = racine.querySelector('.pg-heros'), gH = racine.querySelector('.pg-h'), dit = racine.querySelector('.pg-dit');
  var cvH = racine.querySelector('.pg-haut'), hx = cvH.getContext('2d'), cvA = racine.querySelector('.pg-amb'), ax = cvA.getContext('2d');
  var anim = null;
  try{ if(MJ.DESSUS){ gH.innerHTML = MJ.DESSUS.pisteur(); anim = MJ.DESSUS.Bonhomme(gH); anim.poser({ph:0, amp:0, t:0}); } }catch(e){}
  if(!gH.firstChild) gH.innerHTML = '<circle r="11" fill="#3f8f5a" stroke="' + K + '" stroke-width="2.4"/><circle cy="-3" r="6" fill="#f1c7a0" stroke="' + K + '" stroke-width="1.8"/>';
  var I = preparerDecor(M, L), blocs = null, sprites = {};
  var W = 0, H = 0, dpr = 1, ech = 3, s = 3, hautSale = true;
  var pos = {x:M.depart.x, y:M.depart.y}, cap = Math.PI / 2, but = null, marche = 0, phase = 0, tPas = 0, aBouge = false, touches = {}, marcheTot = 0, tJeu = 0;
  var semelle = {sub:null, c:0, pas:0, cote:1}, dedansTache = null, mesPas = [], rides = [], poudre = [];
  var vus = {};   /* les phrases du conteur déjà dites */
  var coureurs = [], nbCoureurs = 0, prochainCoureur = 420 + Math.random() * 200;
  var mou = (function(){
    var E = M.eglise, rot = Math.atan2(E.dy, E.dx) + PI / 2;
    function monde(lx, ly){ return {x:E.bx + lx * Math.cos(rot) - ly * Math.sin(rot), y:E.by + lx * Math.sin(rot) + ly * Math.cos(rot)}; }
    var p0 = monde(4, 14), gr = monde(0, -12);
    return {x:p0.x, y:p0.y, x0:p0.x, y0:p0.y, gx:gr.x, gy:gr.y, a:Math.atan2(-E.dy, -E.dx), etat:'assis', t:0, miaou:0, prochain:1.2, bulle:0};
  })();
  var lumieres = [];
  M.lampes.forEach(function(l){ lumieres.push({x:l.lx, y:l.ly, r:80, f:.9, c:1}); });
  M.fenetres.forEach(function(f){ lumieres.push({x:f.x, y:f.y, r:34, f:.55, c:.6}); });
  lumieres.push({x:M.odette.bx, y:M.odette.by + 12, r:62, f:.85, c:1});
  (function(){ var E = M.eglise, rot = Math.atan2(E.dy, E.dx) + PI / 2; [[-36, -20], [36, -20], [0, -10]].forEach(function(q, i){ lumieres.push({x:E.bx + q[0] * Math.cos(rot) - q[1] * Math.sin(rot), y:E.by + q[0] * Math.sin(rot) + q[1] * Math.cos(rot), r:i === 2 ? 40 : 62, f:i === 2 ? .55 : .85, c:i === 2 ? .5 : 1}); }); })();
  var fumees = [];
  M.maisons.forEach(function(m){ if(m.fum && (moment !== 'apresmidi' || Math.random() < .5)) m.chem.forEach(function(c){ fumees.push({x:m.x + m.w * c.u, y:m.y + m.h * c.v, ph:Math.random()}); }); });
  M.fins.forEach(function(F){ if(F.lieu === 'boulangerie'){ var rot = Math.atan2(F.dy, F.dx) + PI / 2, lx = -54 + 108 * .78, ly = -70 + 66 * .3; fumees.push({x:F.bx + lx * Math.cos(rot) - ly * Math.sin(rot), y:F.by + lx * Math.sin(rot) + ly * Math.cos(rot), ph:.3, fort:true}); } });
  var brumes = [];
  if(moment === 'matin') for(var b = 0; b < 14; b++) brumes.push({x:U.rand(-200, M.W + 200), y:U.rand(-200, M.H + 200), r:U.rand(130, 230), v:U.rand(4, 9)});

  function mesurer(){
    var r = racine.getBoundingClientRect(); if(!r.width || !r.height) return;
    var w = r.width, h = r.height, d = Math.min(2, window.devicePixelRatio || 1), e = U.borne(Math.min(w, h) / 150, 2.5, 3.5);
    if(w === W && h === H && d === dpr && blocs) return;
    W = w; H = h; dpr = d; ech = e; s = ech * dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cvH.width = cv.width; cvH.height = cv.height; hautSale = true;
    cvA.width = Math.max(2, Math.round(W / 3)); cvA.height = Math.max(2, Math.round(H / 3));
    svgH.style.width = svgH.style.height = Math.round(44 * ech) + 'px';
    if(blocs) blocs.vider();
    blocs = Blocs(M, I, L, s); sprites = {};
  }
  var ro = window.ResizeObserver ? new ResizeObserver(mesurer) : null;
  if(ro) ro.observe(racine); else window.addEventListener('resize', mesurer);
  mesurer();
  /* la phrase du conteur (une bulle, avec 🔊) */
  var tDit = null;
  function dire(t, ms){
    if(tDit){ clearTimeout(tDit); tDit = null; }
    if(t) t = t.replace(/ ([!?:;…])/g, ' $1');   /* (pas de « ! » tout seul en début de ligne) */
    dit.innerHTML = t ? '<p>' + esc(t) + '</p>' : ''; dit.hidden = !t;
    if(t && MJ.boutonLire && MJ.nbMots && MJ.nbMots(t) > 3) try{ dit.appendChild(MJ.boutonLire(t)); }catch(e){}
    else if(t && MJ.boutonLire && !MJ.nbMots) try{ dit.appendChild(MJ.boutonLire(t)); }catch(e){}
    if(t && ms) tDit = setTimeout(function(){ tDit = null; dit.innerHTML = ''; dit.hidden = true; }, ms);
  }
  function direUneFois(cle, t){ if(vus[cle] || fini) return; vus[cle] = 1; dire(t, 5200); }
  dire('Du lait renversé, et des pattes partout ! Le Pisteur suit ton doigt : tant qu\'il est posé, il marche.');

  function libre(x, y){ return M.dansRue(x - 9, y) && M.dansRue(x + 9, y) && M.dansRue(x, y - 9) && M.dansRue(x, y + 9) && !M.dansObstacle(x, y, 9); }
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

  /* ----- un chat qui passe en courant : il arrive derrière le Pisteur, le dépasse, tourne au carrefour, et saute sur un toit ----- */
  function lancerCoureur(force){
    var gx = M.gx, gy = M.gy, ci = -1, rj = -1, k;
    for(k = 0; k < gx.length; k++) if(Math.abs(pos.x - gx[k]) < RUE / 2) ci = k;
    for(k = 0; k < gy.length; k++) if(Math.abs(pos.y - gy[k]) < RUE / 2) rj = k;
    var dir;
    if(ci >= 0 && rj >= 0) dir = Math.abs(Math.cos(cap)) > Math.abs(Math.sin(cap)) ? [Math.cos(cap) > 0 ? 1 : -1, 0] : [0, Math.sin(cap) > 0 ? 1 : -1];
    else if(ci >= 0){ dir = [0, Math.sin(cap) >= 0 ? 1 : -1]; rj = 0; for(k = 0; k < gy.length; k++) if(Math.abs(gy[k] - pos.y) < Math.abs(gy[rj] - pos.y)) rj = k; }
    else if(rj >= 0){ dir = [Math.cos(cap) >= 0 ? 1 : -1, 0]; ci = 0; for(k = 0; k < gx.length; k++) if(Math.abs(gx[k] - pos.x) < Math.abs(gx[ci] - pos.x)) ci = k; }
    else return false;
    function dansG(a, b2){ return a >= 0 && b2 >= 0 && a < gx.length && b2 < gy.length; }
    /* le carrefour devant le Pisteur, et celui deux crans derrière lui (assez loin : hors de l'écran) */
    var dev = [ci, rj];
    if(dir[0] && (gx[ci] - pos.x) * dir[0] < 0) dev = [ci + dir[0], rj];
    if(dir[1] && (gy[rj] - pos.y) * dir[1] < 0) dev = [ci, rj + dir[1]];
    if(!dansG(dev[0], dev[1])){ dir = [-dir[0], -dir[1]]; dev = [ci, rj]; if(dir[0] && (gx[ci] - pos.x) * dir[0] < 0) dev = [ci + dir[0], rj]; if(dir[1] && (gy[rj] - pos.y) * dir[1] < 0) dev = [ci, rj + dir[1]]; if(!dansG(dev[0], dev[1])) return false; }
    var der = [dev[0] - dir[0] * 2, dev[1] - dir[1] * 2];
    if(!dansG(der[0], der[1])) der = [dev[0] - dir[0], dev[1] - dir[1]];
    if(!dansG(der[0], der[1])) return false;
    var noeuds = [der], c = der.slice();
    while(c[0] !== dev[0] || c[1] !== dev[1]){ c = [c[0] + dir[0], c[1] + dir[1]]; noeuds.push(c); }
    /* après : un cran tout droit ou de côté, puis un saut sur un toit */
    var opts = [[dir[0], dir[1]], [dir[1], dir[0]], [-dir[1], -dir[0]]].filter(function(d){ return dansG(c[0] + d[0], c[1] + d[1]); });
    if(opts.length){ var d2 = U.choix(opts); noeuds.push([c[0] + d2[0], c[1] + d2[1]]); }
    var o = U.choix([-20, -12, 12, 20]);
    var pts = noeuds.map(function(n){ return {x:gx[n[0]] + o, y:gy[n[1]] + o}; });
    var a = pts[pts.length - 2], z = pts[pts.length - 1], lg = Math.hypot(z.x - a.x, z.y - a.y), ux = (z.x - a.x) / lg, uy = (z.y - a.y) / lg;
    var mi = {x:a.x + ux * lg * .55, y:a.y + uy * lg * .55}, cote = Math.random() < .5 ? -1 : 1;
    pts[pts.length - 1] = mi;
    pts.push({x:mi.x - uy * cote * 70 + ux * 14, y:mi.y + ux * cote * 70 + uy * 14});
    pts = arrondir(pts, 22);
    var ids = CH.liste.filter(function(cc){ return cc.id !== 'moustache' && !coureurs.some(function(q){ return q.chat === cc.id; }); });
    var ch = U.choix(ids);
    coureurs.push({chat:ch.id, pts:pts, L:longueur(pts), s:0, v:U.rand(205, 240), ph:0, dPas:0, nPas:0, pres:false, al:1});
    nbCoureurs++;
    return true;
  }
  function majCoureurs(dt, t){
    for(var i = coureurs.length - 1; i >= 0; i--){
      var C = coureurs[i];
      C.s += C.v * dt; C.ph += dt * 15; C.dPas += C.v * dt;
      var q = point(C.pts, Math.min(C.s, C.L)); C.x = q.x; C.y = q.y; C.a = q.a;
      var surRue = M.dansRue(q.x, q.y);
      if(!surRue) C.al = Math.max(0, C.al - dt * 3);
      while(C.dPas > 15){
        C.dPas -= 15; C.nPas++;
        if(!surRue || M.dansTache(q.x, q.y) || M.dansArche(q.x, q.y)) continue;
        var cote = C.nPas % 2 ? 1 : -1;
        mesPas.push({chat:C.chat, x:q.x + Math.cos(q.a + PI / 2) * 2.4 * cote, y:q.y + Math.sin(q.a + PI / 2) * 2.4 * cote, a:q.a + PI / 2, al:.92, t0:tJeu, vie:70, sub:'eau'});
      }
      var d = Math.hypot(C.x - pos.x, C.y - pos.y);
      if(!C.pres && d < 60){ C.pres = true; son('course', .9); direUneFois('coureur', 'Un chat te file sous le nez ! Ses traces sont toutes fraîches…'); }
      if(C.s >= C.L || C.al <= 0) coureurs.splice(i, 1);
    }
  }

  /* ----- chaque image ----- */
  var mesure = {images:0, t:0, tb:0, td:0, th:0, tl:0};
  var stop = U.boucle(function(dt, t){
    if(arrete) return false;
    if(!W) mesurer();
    tJeu = t; mesure.images++;
    var vx = 0, vy = 0, f = 0;
    if(!fini){
      if(but){ var d = Math.hypot(but.x, but.y); if(d > 16){ f = Math.min(1, (d - 10) / 46); vx = but.x / d; vy = but.y / d; } }
      else { Object.keys(touches).forEach(function(k){ vx += FL[k][0]; vy += FL[k][1]; }); var dk = Math.hypot(vx, vy); if(dk){ vx /= dk; vy /= dk; f = 1; } }
    }
    var avant = {x:pos.x, y:pos.y};
    if(f > 0){
      var pas = VITESSE * f * dt, nxp = pos.x + vx * pas, nyp = pos.y + vy * pas;
      if(libre(nxp, nyp)){ pos.x = nxp; pos.y = nyp; }
      else if(libre(nxp, pos.y)){ pos.x = nxp; f *= Math.abs(vx); }
      else if(libre(pos.x, nyp)){ pos.y = nyp; f *= Math.abs(vy); }
      else f = 0;
      var vise = Math.atan2(vy, vx), da = Math.atan2(Math.sin(vise - cap), Math.cos(vise - cap)); cap += da * Math.min(1, dt * 12);
      if(!aBouge && f > 0){ aBouge = true; dire(''); }
    }
    var fait = Math.hypot(pos.x - avant.x, pos.y - avant.y);
    marcheTot += fait;
    marche += (f - marche) * Math.min(1, dt * 10);
    phase += dt * 9.5 * marche;
    if(marche > .5){ tPas += dt; if(tPas > .36){ tPas = 0; U.son('pas'); } }
    if(anim) anim.poser({ph:phase, amp:marche, t:t});
    gH.setAttribute('transform', 'rotate(' + (cap * 180 / Math.PI + 90).toFixed(1) + ')');
    /* les semelles : une flaque, la boue, la farine les salissent ; ensuite, chaque pas laisse une trace (de moins en moins forte) */
    var ta = M.dansTache(pos.x, pos.y, 2);
    if(ta && ta !== dedansTache){
      var sub = DE_TACHE[ta.type];
      son(sub === 'eau' ? 'plouf' : sub === 'boue' ? 'floc' : 'pouf');
      rides.push({x:pos.x, y:pos.y, t0:t, sub:sub});
      if(sub === 'farine') for(var q = 0; q < 10; q++) poudre.push({x:pos.x, y:pos.y, vx:U.rand(-26, 26), vy:U.rand(-26, 26), t0:t, r:U.rand(2, 4.5)});
      direUneFois('semelle-' + sub, sub === 'eau' ? 'Plouf ! Tes semelles sont mouillées : maintenant, toi aussi, tu laisses des traces.' :
        sub === 'boue' ? 'Floc ! De la boue plein les chaussures… Attention à tes propres traces !' : 'Pouf ! De la farine partout : tes pas sont tout blancs.');
    }
    if(ta){ semelle.sub = DE_TACHE[ta.type]; semelle.c = 1; semelle.pas = 0; if(fait > 0 && Math.random() < dt * 6) rides.push({x:pos.x, y:pos.y, t0:t, sub:semelle.sub, petit:true}); }
    else if(semelle.sub && semelle.c > .06){
      semelle.pas += fait;
      if(semelle.pas > 11){
        semelle.pas = 0; semelle.cote = -semelle.cote;
        var S = SEMELLE[semelle.sub];
        mesPas.push({x:pos.x + Math.cos(cap + PI / 2) * 3.4 * semelle.cote, y:pos.y + Math.sin(cap + PI / 2) * 3.4 * semelle.cote, a:cap, al:S.a * semelle.c, t0:t, vie:S.vie, sub:semelle.sub, cote:semelle.cote});
        semelle.c *= S.perte;
        if(mesPas.length > 700) mesPas.splice(0, mesPas.length - 700);
      }
    }
    dedansTache = ta;
    /* les traces qui ont séché disparaissent */
    if(mesPas.length && (mesure.images % 30 === 0)) mesPas = mesPas.filter(function(m){ return t - m.t0 < m.vie; });
    /* les chats qui passent : deux ou trois, au fil de la marche */
    if(!fini && nbCoureurs < (p.coureurs || 0) && marcheTot > prochainCoureur && f > .3 && Math.hypot(pos.x - mou.x, pos.y - mou.y) > 420){
      if(lancerCoureur()) prochainCoureur = marcheTot + U.rand(700, 1100); else prochainCoureur = marcheTot + 120;
    }
    majCoureurs(dt, t);
    /* les pigeons s'envolent quand on approche */
    M.pigeons.forEach(function(P){
      if(P.vol){ P.tv += dt; P.x += P.vx * dt; P.y += P.vy * dt; return; }
      var dd = Math.hypot(P.x - pos.x, P.y - pos.y);
      if(dd < 62 || coureurs.some(function(C){ return Math.hypot(C.x - P.x, C.y - P.y) < 40; })){
        P.vol = 1; P.tv = 0; var aa = Math.atan2(P.y - pos.y, P.x - pos.x) + U.rand(-.6, .6), vv = U.rand(110, 150); P.vx = Math.cos(aa) * vv; P.vy = Math.sin(aa) * vv; P.a = aa;
        if(!vus['pig' + Math.round(P.x0 / 60)]){ vus['pig' + Math.round(P.x0 / 60)] = 1; son('pigeons', .8); }
      } else if(Math.random() < dt * .5){ P.a += U.rand(-.8, .8); }
    });
    /* Moustache, devant la grille : il miaule ; quand on arrive, il file entre les barreaux */
    var dm = Math.hypot(pos.x - mou.x, pos.y - mou.y);
    mou.t += dt;
    if(mou.etat === 'assis'){
      mou.prochain -= dt;
      if(mou.prochain <= 0){ mou.prochain = U.rand(2.2, 3.6); mou.miaou = .9; if(dm < 460) son(U.choix(['miaouA', 'miaouB', 'miaouC']), Math.min(1, 1.15 - dm / 460)); }
      /* il file quand le Pisteur est tout près (assez tard pour qu'on l'ait vu miauler, même sur un petit téléphone) */
      if(dm < U.borne(Math.min(W, H) / 2 / ech * .75, 60, 120) && !fini){ mou.etat = 'fuite'; mou.t = 0; son('fuite', 1); direUneFois('moustache', 'Un gros chat gris file entre les barreaux de la grille !'); }
    } else if(mou.etat === 'fuite'){
      var u = Math.min(1, mou.t / .6);
      mou.x = lerp(mou.x0, mou.gx, u * u); mou.y = lerp(mou.y0, mou.gy, u * u); mou.a = Math.atan2(mou.gy - mou.y0, mou.gx - mou.x0);
      if(mou.t > .75) mou.etat = 'parti';
    }
    if(mou.miaou > 0) mou.miaou -= dt;
    /* au bout d'une piste ? */
    if(!fini){
      if(Math.hypot(pos.x - M.eglise.fx, pos.y - M.eglise.fy) < R_FIN + 6) finir(true);
      else for(var i = 0; i < M.fins.length; i++) if(Math.hypot(pos.x - M.fins[i].x, pos.y - M.fins[i].y) < R_FIN){ finir(false, M.fins[i]); break; }
    }
    dessiner(t, dt);
  });

  /* ----- le dessin de chaque image ----- */
  function dessiner(t, dt){
    if(!W || !blocs) return;
    var ox = Math.round(cv.width / 2 - pos.x * s), oy = Math.round(cv.height / 2 - pos.y * s);
    var x0 = pos.x - W / 2 / ech - 40, x1 = pos.x + W / 2 / ech + 40, y0 = pos.y - H / 2 / ech - 40, y1 = pos.y + H / 2 / ech + 40;
    var t0 = performance.now();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    /* les morceaux du décor déjà dessinés (ceux qui manquent sont dessinés maintenant) */
    var b0 = Math.floor(-ox / CPX), b1 = Math.floor((cv.width - ox) / CPX), c0 = Math.floor(-oy / CPX), c1 = Math.floor((cv.height - oy) / CPX), a, b;
    for(a = b0; a <= b1; a++) for(b = c0; b <= c1; b++){ var bl = blocs.obtenir(a, b, true); ctx.drawImage(bl, a * CPX + ox, b * CPX + oy); }
    /* et, s'il reste du temps, un morceau d'avance, là où l'on va */
    if(performance.now() - t0 < 6){
      var avx = Math.cos(cap) > .3 ? 1 : Math.cos(cap) < -.3 ? -1 : 0, avy = Math.sin(cap) > .3 ? 1 : Math.sin(cap) < -.3 ? -1 : 0, fait = false;
      for(a = b0 - 1; a <= b1 + 1 && !fait; a++) for(b = c0 - 1; b <= c1 + 1 && !fait; b++){
        if(a >= b0 && a <= b1 && b >= c0 && b <= c1) continue;
        if((avx && (a - b0) * avx < 0 && (a - b1) * avx < 0) || (avy && (b - c0) * avy < 0 && (b - c1) * avy < 0)) continue;
        if(!blocs.a(a, b)){ blocs.obtenir(a, b, true); fait = true; }
      }
    }
    var t1 = performance.now(); mesure.tb += t1 - t0;
    ctx.setTransform(s, 0, 0, s, ox, oy);
    /* l'ombre du linge */
    var oL = {x:L.ombre.x * 14 * L.ombre.l, y:L.ombre.y * 14 * L.ombre.l};
    M.linges.forEach(function(Ln){ if(Ln.cx > x0 - 60 && Ln.cx < x1 + 60 && Ln.cy > y0 - 60 && Ln.cy < y1 + 60) dessinerLinge(ctx, Ln, t, oL); });
    /* les rides d'une flaque, la boue qui gicle, la farine qui vole */
    for(var i = rides.length - 1; i >= 0; i--){
      var R = rides[i], age = t - R.t0, du = R.petit ? .6 : 1;
      if(age > du){ rides.splice(i, 1); continue; }
      ctx.strokeStyle = R.sub === 'eau' ? 'rgba(255,255,255,' + (.6 * (1 - age / du)).toFixed(3) + ')' : R.sub === 'boue' ? 'rgba(60,36,16,' + (.5 * (1 - age / du)).toFixed(3) + ')' : 'rgba(255,255,255,' + (.5 * (1 - age / du)).toFixed(3) + ')';
      ctx.lineWidth = 1; rond(ctx, R.x, R.y, (R.petit ? 4 : 6) + age * (R.petit ? 14 : 22)); ctx.stroke();
      if(!R.petit){ rond(ctx, R.x, R.y, 3 + age * 12); ctx.stroke(); }
    }
    /* les traces du Pisteur, et celles des chats qui passent (par-dessus les autres) */
    for(i = 0; i < mesPas.length; i++){
      var m = mesPas[i]; if(m.x < x0 || m.x > x1 || m.y < y0 || m.y > y1) continue;
      var vie = (t - m.t0) / m.vie, al = m.al * (vie < .55 ? 1 : Math.max(0, 1 - (vie - .55) / .45));
      if(al <= .01) continue;
      if(m.chat){ CH.dessiner(ctx, m.chat, m.x, m.y, m.a, TRACE, '#2a221e', al * .66); continue; }
      semelleTrace(ctx, m, al);
    }
    for(i = poudre.length - 1; i >= 0; i--){ var P2 = poudre[i], ag = t - P2.t0; if(ag > .9){ poudre.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(255,255,255,' + (.7 * (1 - ag / .9)).toFixed(3) + ')'; rond(ctx, P2.x + P2.vx * ag, P2.y + P2.vy * ag, P2.r * (1 + ag)); ctx.fill(); }
    /* les pigeons au sol, les chats qui courent, Moustache */
    M.pigeons.forEach(function(P){ if(!P.vol && P.x > x0 && P.x < x1 && P.y > y0 && P.y < y1) pigeon(ctx, P, t); });
    coureurs.forEach(function(C){ if(C.x > x0 - 30 && C.x < x1 + 30 && C.y > y0 - 30 && C.y < y1 + 30) chatCourt(ctx, CH.par[C.chat], C.x, C.y, C.a, C.ph, t, C.al); });
    if(mou.etat !== 'parti' && Math.abs(mou.x - pos.x) < (x1 - x0) / 2 + 40 && Math.abs(mou.y - pos.y) < (y1 - y0) / 2 + 40){
      if(mou.etat === 'assis') chatAssis(ctx, CH.par.moustache, mou.x, mou.y, mou.a, t, mou.miaou > .35);
      else chatCourt(ctx, CH.par.moustache, mou.x, mou.y, mou.a, mou.t * 22, t, Math.max(0, 1 - Math.max(0, mou.t - .4) / .35));
    }
    /* la petite lueur qui bat, tout au fond de la crypte */
    var Eg = M.eglise;
    if(Math.abs(mou.gx - pos.x) < (x1 - x0) / 2 + 40 && Math.abs(mou.gy - pos.y) < (y1 - y0) / 2 + 40){ ctx.fillStyle = 'rgba(255,214,110,' + (.16 + .1 * Math.sin(t * 2.2)).toFixed(3) + ')'; ovale(ctx, mou.gx, mou.gy, 11, 7, Math.atan2(Eg.dy, Eg.dx) + PI / 2); ctx.fill(); }
    var t2 = performance.now(); mesure.td += t2 - t1;
    dessinerHaut(t, ox, oy, x0, x1, y0, y1);
    var t3 = performance.now(); mesure.th += t3 - t2;
    dessinerLumiere(t);
    var t4 = performance.now(); mesure.tl += t4 - t3;
    mesure.t += t4 - t0;
  }
  function semelleTrace(x, m, al){
    var S = SEMELLE[m.sub];
    x.save(); x.translate(m.x, m.y); x.rotate(m.a + PI / 2); x.globalAlpha = al;
    x.fillStyle = S.c;
    ovale(x, 0, -2.2, 2.3, 3.1, 0); x.fill();       /* l'avant de la semelle */
    ovale(x, 0, 3.4, 1.8, 2, 0); x.fill();          /* le talon */
    if(m.sub === 'boue'){ x.fillStyle = 'rgba(30,18,8,.5)'; ovale(x, 0, -2.4, 1.2, 1.8, 0); x.fill(); }
    x.restore();
  }
  function sprite(cle, bb, f){
    if(sprites[cle]) return sprites[cle];
    var c = document.createElement('canvas'), w = Math.ceil(bb.w * s) + 4, h = Math.ceil(bb.h * s) + 4;
    c.width = w; c.height = h;
    var x = c.getContext('2d'); x.setTransform(s, 0, 0, s, -bb.x * s + 2, -bb.y * s + 2); f(x);
    return (sprites[cle] = {c:c, x:bb.x - 2 / s, y:bb.y - 2 / s, w:w / s, h:h / s});
  }
  /* au-dessus du Pisteur : les toits des passages couverts, les arbres qui débordent, le linge, la fumée, les pigeons qui volent, « Miaou ! » */
  function dessinerHaut(t, ox, oy, x0, x1, y0, y1){
    var rien = true;
    function vu(bb, m){ return bb.x < x1 + m && bb.x + bb.w > x0 - m && bb.y < y1 + m && bb.y + bb.h > y0 - m; }
    hx.setTransform(1, 0, 0, 1, 0, 0);
    if(hautSale){ hx.clearRect(0, 0, cvH.width, cvH.height); hautSale = false; cvH.style.visibility = 'hidden'; }   /* (vide : le navigateur ne la pose même plus) */
    var dessinsH = [];
    M.arches.forEach(function(A, i){ if(vu(A.bat, 30)) dessinsH.push(function(){
      var sp = sprite('arche' + i, A.bat, function(x){ dessinerToit(x, {x:A.bat.x, y:A.bat.y, w:A.bat.w, h:A.bat.h, sens:A.sens === 'h' ? 'v' : 'h', c:TUILES[i % TUILES.length], toit:'tuile', chem:[{u:A.sens === 'h' ? .5 : .2, v:A.sens === 'h' ? .2 : .5}], lucarne:true, g:A.g}, L);
        /* les arcs de pierre, de chaque côté */
        x.fillStyle = '#9a8e7a'; x.strokeStyle = K; x.lineWidth = 1.2;
        if(A.sens === 'h'){ x.fillRect(A.bat.x - 1, A.y - 2, 4, A.h + 4); x.strokeRect(A.bat.x - 1, A.y - 2, 4, A.h + 4); x.fillRect(A.bat.x + A.bat.w - 3, A.y - 2, 4, A.h + 4); x.strokeRect(A.bat.x + A.bat.w - 3, A.y - 2, 4, A.h + 4); }
        else { x.fillRect(A.x - 2, A.bat.y - 1, A.w + 4, 4); x.strokeRect(A.x - 2, A.bat.y - 1, A.w + 4, 4); x.fillRect(A.x - 2, A.bat.y + A.bat.h - 3, A.w + 4, 4); x.strokeRect(A.x - 2, A.bat.y + A.bat.h - 3, A.w + 4, 4); }
      });
      if(!dans(A, pos.x, pos.y, 8)){ hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); return; }
      /* le Pisteur est dessous : le toit devient transparent au-dessus de la rue seulement (les deux bouts, sur les maisons, restent) */
      hx.save(); hx.beginPath(); hx.rect(A.bat.x - 2, A.bat.y - 2, A.bat.w + 4, A.bat.h + 4); hx.rect(A.x + A.w, A.y, -A.w, A.h); hx.clip('evenodd');
      hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); hx.restore();
      hx.save(); hx.beginPath(); hx.rect(A.x, A.y, A.w, A.h); hx.clip(); hx.globalAlpha = .4; hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); hx.restore(); }); });
    M.dessus.forEach(function(a, i){ var bb = {x:a.x - a.r - 4, y:a.y - a.r - 4, w:2 * a.r + 8, h:2 * a.r + 8}; if(vu(bb, 20)) dessinsH.push(function(){
      var sp = sprite('arbre' + i, bb, function(x){ dessinerArbre(x, a, L); });
      hx.globalAlpha = Math.hypot(pos.x - a.x, pos.y - a.y) < a.r * .95 ? .4 : .96; hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); hx.globalAlpha = 1; }); });
    M.linges.forEach(function(Ln){ if(Ln.cx > x0 - 50 && Ln.cx < x1 + 50 && Ln.cy > y0 - 50 && Ln.cy < y1 + 50) dessinsH.push(function(){ dessinerLinge(hx, Ln, t); }); });
    M.pigeons.forEach(function(P){ if(P.vol && P.tv < 2.2 && P.x > x0 - 40 && P.x < x1 + 40 && P.y > y0 - 40 && P.y < y1 + 40) dessinsH.push(function(){ hx.globalAlpha = Math.max(0, 1 - Math.max(0, P.tv - 1.4) / .8); pigeon(hx, P, t); hx.globalAlpha = 1; }); });
    if(mou.miaou > 0 && mou.etat === 'assis' && Math.abs(mou.x - pos.x) < (x1 - x0) / 2 && Math.abs(mou.y - pos.y) < (y1 - y0) / 2) dessinsH.push(function(){
      var al = Math.min(1, mou.miaou * 3), bxx = mou.x + 10, byy = mou.y - 22 - (.9 - mou.miaou) * 6;
      hx.globalAlpha = al; hx.fillStyle = '#fffdf4'; hx.strokeStyle = K; hx.lineWidth = 1.2; hx.beginPath(); rr(hx, bxx - 16, byy - 7, 32, 13, 6); hx.fill(); hx.stroke();
      hx.beginPath(); hx.moveTo(bxx - 7, byy + 6); hx.lineTo(bxx - 10, byy + 11); hx.lineTo(bxx - 2, byy + 6); hx.closePath(); hx.fill(); hx.stroke(); hx.fillStyle = '#fffdf4'; hx.fillRect(bxx - 8, byy + 4, 6, 2.4);
      hx.fillStyle = K; hx.font = '700 7.6px system-ui, sans-serif'; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.fillText('Miaou !', bxx, byy - .4); hx.globalAlpha = 1; });
    if(dessinsH.length){
      hx.clearRect(0, 0, cvH.width, cvH.height); hx.setTransform(s, 0, 0, s, ox, oy); dessinsH.forEach(function(f){ f(); }); hautSale = true; rien = false;
      if(cvH.style.visibility) cvH.style.visibility = '';
    }
    return rien;
  }
  /* la lumière : la nuit (le noir, la lanterne du Pisteur, les lanternes, les fenêtres), la brume du matin, le soleil de l'après-midi */
  function dessinerLumiere(t){
    var aw = cvA.width, ah = cvA.height, sw = ech * aw / W;
    ax.setTransform(1, 0, 0, 1, 0, 0); ax.clearRect(0, 0, aw, ah);
    function A(xw, yw){ return [(xw - pos.x) * sw + aw / 2, (yw - pos.y) * sw + ah / 2]; }
    if(moment === 'nuit'){
      ax.fillStyle = 'rgba(6,10,30,.76)'; ax.fillRect(0, 0, aw, ah);
      var ls = [{x:pos.x + Math.cos(cap + .7) * 8, y:pos.y + Math.sin(cap + .7) * 8, r:132 * (1 + .03 * Math.sin(t * 9) + .02 * Math.sin(t * 23)), f:.97, c:1}].concat(lumieres);
      var vis = ls.filter(function(l){ var p2 = A(l.x, l.y), rr2 = l.r * sw; return p2[0] > -rr2 && p2[0] < aw + rr2 && p2[1] > -rr2 && p2[1] < ah + rr2; });
      ax.globalCompositeOperation = 'destination-out';
      vis.forEach(function(l){ var p2 = A(l.x, l.y), rr2 = l.r * sw, g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2);
        g.addColorStop(0, 'rgba(0,0,0,' + l.f + ')'); g.addColorStop(.5, 'rgba(0,0,0,' + (l.f * .7).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
      ax.globalCompositeOperation = 'lighter';
      vis.forEach(function(l){ var p2 = A(l.x, l.y), rr2 = l.r * sw * .8, g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2);
        g.addColorStop(0, 'rgba(255,176,80,' + (.2 * l.c).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,176,80,0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
      ax.globalCompositeOperation = 'source-over';
    } else if(moment === 'matin'){
      ax.fillStyle = 'rgba(255,214,186,.08)'; ax.fillRect(0, 0, aw, ah);
      brumes.forEach(function(B){ var bx = B.x + t * B.v, p2 = A(((bx + 400) % (M.W + 800)) - 400, B.y), rr2 = B.r * sw;
        if(p2[0] < -rr2 || p2[0] > aw + rr2 || p2[1] < -rr2 || p2[1] > ah + rr2) return;
        var g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2); g.addColorStop(0, 'rgba(240,244,252,.3)'); g.addColorStop(1, 'rgba(240,244,252,0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
    } else {
      var g2 = ax.createLinearGradient(0, 0, aw, ah); g2.addColorStop(0, 'rgba(255,226,150,.1)'); g2.addColorStop(1, 'rgba(255,200,120,.03)'); ax.fillStyle = g2; ax.fillRect(0, 0, aw, ah);
    }
    /* la fumée des cheminées : floue de toute façon, elle est dessinée ici, sur la petite toile (rien à redessiner en grand) */
    var hw = W / 2 / ech, hh = H / 2 / ech;
    ax.setTransform(sw, 0, 0, sw, aw / 2 - pos.x * sw, ah / 2 - pos.y * sw);
    fumees.forEach(function(c){ if(c.x > pos.x - hw - 30 && c.x < pos.x + hw + 70 && c.y > pos.y - hh - 70 && c.y < pos.y + hh + 30) dessinerFumee(ax, c, t, c.fort || moment !== 'apresmidi', moment === 'nuit' ? .16 : .8); });
  }
  /* pour les essais */
  racine.__pistage = {monde:M, moment:moment, etat:function(){ return {x:pos.x, y:pos.y, fini:fini, ech:ech}; },
    poser:function(x, y){ pos.x = x; pos.y = y; }, aller:function(vx, vy){ but = vx == null ? null : {x:vx, y:vy}; }, libre:libre,
    coureur:function(){ return lancerCoureur(true); }, coureurs:function(){ return coureurs.map(function(C){ return {chat:C.chat, x:C.x, y:C.y}; }); },
    moustache:function(){ return {etat:mou.etat, x:mou.x, y:mou.y}; }, pas:function(){ return mesPas.filter(function(m){ return !m.chat; }).length; },
    pasChats:function(){ return mesPas.filter(function(m){ return !!m.chat; }).length; }, chaussures:function(){ return {sub:semelle.sub, c:semelle.c}; },
    mesures:function(){ return {images:mesure.images, ms:mesure.t, decor:mesure.tb, bouge:mesure.td, dessus:mesure.th, lumiere:mesure.tl, blocs:blocs ? blocs.stats : null}; }};
  return {arreter:function(){
    arrete = true; try{ stop(); }catch(e){}
    if(tDit) clearTimeout(tDit);
    if(ro) ro.disconnect(); else window.removeEventListener('resize', mesurer);
    window.removeEventListener('keydown', tBas); window.removeEventListener('keyup', tHaut);
    if(blocs) blocs.vider();
  }};
}

MJ.enregistrer('pistage', {
  nom:'Suivre les traces', ic:'🐾', role:'pisteur',
  consigne:'Plusieurs chats ont laissé leurs traces. Marche, regarde bien les pattes, et suis la bonne piste jusqu\'au bout. Au bout d\'une mauvaise piste, c\'est perdu.',
  reglages:function(n, mods){
    var p = {}, nn = U.borne((n - 1) / 9, 0, 1);
    p.faux = Math.max(2, Math.min(6, (n <= 3 ? 3 : n <= 6 ? 4 : n <= 8 ? 5 : 6) - (mods.aide || 0)));
    p.cinq = n >= 5;                      /* Noisette, à cinq doigts : presque Moustache */
    p.nx = n <= 4 ? 4 : 5; p.ny = n <= 4 ? 3 : 4;
    p.flaques = n <= 2 ? 2 : n <= 4 ? 3 : n <= 7 ? 4 : 5;
    p.boues = n <= 3 ? 1 : 2;
    p.farines = n <= 5 ? 1 : 2;
    p.arches = n <= 2 ? 1 : n <= 6 ? 2 : 3;
    p.sauts = n <= 2 ? 1 : n <= 5 ? 2 : 3;
    p.coureurs = n <= 4 ? 2 : 3;
    p.branches = n <= 3 ? 2 : 3;
    p.plancher = lerp(.46, .22, nn) + (mods.aide ? .08 : 0);   /* ce qui reste d'une trace toute sèche */
    p.lait = lerp(.985, .972, nn);                              /* ce qu'une trace de lait garde d'un pas à l'autre */
    p.trou = lerp(.04, .26, nn);                                /* des traces qui manquent, quand elles sont presque sèches */
    p.lignes = [{nom:'Fausses pistes', val:String(p.faux)}, {nom:'Un chat à cinq doigts', val:p.cinq ? 'oui' : 'non'}, {nom:'Le quartier', val:p.nx + ' rues sur ' + p.ny},
      {nom:'Flaques, boue, farine', val:p.flaques + ' · ' + p.boues + ' · ' + p.farines}, {nom:'Passages couverts', val:String(p.arches)}, {nom:'Obstacles', val:String(p.sauts)}];
    return p;
  },
  jouer:jouer
});
MJ.PLEIN_ECRAN = MJ.PLEIN_ECRAN || {}; MJ.PLEIN_ECRAN.pistage = 1;
MJ.LARGE = MJ.LARGE || {}; MJ.LARGE.pistage = 1;
MJ.PHRASES = MJ.PHRASES || {}; MJ.PHRASES.pistage = 'Suis les bonnes traces jusqu\'au bout. Pas les autres !';

/* ==========================================================
   L'explication en images, avant de jouer (MJ.DEMOS.pistage) : le Pisteur au milieu, trois pistes de petites pattes qui se
   séparent ; celle du milieu traverse une flaque (ses traces deviennent sombres) ; un doigt se pose, il marche vers lui ; au bout,
   la grille et Moustache ; au bout des deux autres, une croix.
   ========================================================== */
MJ.DEMOS = MJ.DEMOS || {};
MJ.DEMOS.pistage = {w:340, h:190, f:function(el){
  var W = 340, H = 190;
  el.innerHTML = '<canvas width="' + W * 2 + '" height="' + H * 2 + '" style="width:' + W + 'px;height:' + H + 'px;display:block;border-radius:14px"></canvas>' +
    '<svg viewBox="-22 -22 44 44" style="position:absolute;left:0;top:0;width:58px;height:58px;pointer-events:none"><g class="pgd-h"></g></svg><div class="pgd-doigt" style="position:absolute;left:0;top:0;font-size:30px;line-height:1;pointer-events:none">👆</div>';
  el.style.position = 'relative';
  var cv = el.querySelector('canvas'), x = cv.getContext('2d'), sv = el.querySelector('svg'), g = el.querySelector('.pgd-h'), doigt = el.querySelector('.pgd-doigt'), anim = null;
  try{ if(MJ.DESSUS){ g.innerHTML = MJ.DESSUS.pisteur(); anim = MJ.DESSUS.Bonhomme(g); } }catch(e){}
  var A = [{c:'moustache', pts:[{x:40, y:96}, {x:150, y:100}, {x:300, y:100}]}, {c:'pompon', pts:[{x:40, y:88}, {x:140, y:86}, {x:150, y:30}]}, {c:'caramel', pts:[{x:40, y:106}, {x:200, y:112}, {x:210, y:168}]}];
  var tP = null, tH = null, Lm = LUM.apresmidi, flaque = {type:'flaque', x:232, y:100, rx:17, ry:11, rot:0, m:[1, .95, 1.05, 1, .92, 1.08, 1, .96, 1.04, 1], g:5};
  function fond(){
    x.setTransform(2, 0, 0, 2, 0, 0);
    if(!tH){ try{ tP = tuile(2, 'paves'); tH = tuile(2, 'herbe'); }catch(e){} }
    if(tH) carreler(x, tH, {x:0, y:0, w:W, h:H}, tH.width / 2); else { x.fillStyle = '#6fa85a'; x.fillRect(0, 0, W, H); }
    var rues = [{x:0, y:71, w:W, h:58}, {x:125, y:0, w:50, h:72}, {x:185, y:128, w:50, h:62}];
    x.fillStyle = '#8f8270'; rues.forEach(function(r){ x.fillRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); });
    x.save(); x.beginPath(); rues.forEach(function(r){ x.rect(r.x, r.y, r.w, r.h); }); x.clip();
    if(tP) carreler(x, tP, {x:0, y:0, w:W, h:H}, tP.width / 2); else { x.fillStyle = '#b7a58a'; x.fillRect(0, 0, W, H); }
    x.restore();
    try{ dessinerTache(x, flaque, Lm, rues); }catch(e){}
    A.forEach(function(P, ip){
      var pts = arrondir(P.pts, 16), L = longueur(pts), s = 8, n = 0, sub = 'lait', c = 1;
      while(s < L - 4){
        var q = point(pts, s), cc = n % 2 ? 1 : -1, px = q.x + Math.cos(q.a + 1.5708) * 3.2 * cc, py = q.y + Math.sin(q.a + 1.5708) * 3.2 * cc;
        if(ip === 0 && dansForme(flaque, px, py, 2)){ sub = 'eau'; c = 1; s += 19; n++; continue; }
        dessinerTrace(x, {x:px, y:py, a:q.a + 1.5708, c:P.c, sub:sub, al:sub === 'eau' ? .35 + .65 * c : 1, k:1.3, g:n + 1});
        if(sub === 'eau') c *= .82;
        s += 19; n++;
      }
    });
    x.strokeStyle = '#e5484d'; x.lineWidth = 5; x.lineCap = 'round'; [[150, 18], [210, 178]].forEach(function(q){ x.beginPath(); x.moveTo(q[0] - 8, q[1] - 8); x.lineTo(q[0] + 8, q[1] + 8); x.moveTo(q[0] + 8, q[1] - 8); x.lineTo(q[0] - 8, q[1] + 8); x.stroke(); });
  }
  fond();
  var img = null; try{ img = document.createElement('canvas'); img.width = cv.width; img.height = cv.height; img.getContext('2d').drawImage(cv, 0, 0); }catch(e){ img = null; }
  var pts = arrondir(A[0].pts, 16), L = longueur(pts);
  function image(u, t){
    if(img){ x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(img, 0, 0); }
    x.setTransform(2, 0, 0, 2, 0, 0);
    /* la grille, au bout, et Moustache qui attend devant */
    x.fillStyle = '#17131f'; x.strokeStyle = K; x.lineWidth = 2.4; x.beginPath(); x.moveTo(334, 84); x.lineTo(322, 84); x.arc(322, 100, 16, -1.5708, 1.5708, true); x.lineTo(334, 116); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#c9c4b8'; x.lineWidth = 1.8; [90, 96, 102, 108].forEach(function(y){ x.beginPath(); x.moveTo(310, y); x.lineTo(334, y); x.stroke(); });
    if(u < .86) try{ chatAssis(x, CH.par.moustache, 300, 100, PI, t, Math.sin(t * 3) > .6); }catch(e){}
    var q = point(pts, 4 + (L - 36) * u), d = point(pts, Math.min(L, 4 + (L - 36) * u + 62));
    sv.style.transform = 'translate(' + (q.x - 29) + 'px,' + (q.y - 29) + 'px)'; g.setAttribute('transform', 'rotate(' + (q.a * 180 / Math.PI + 90).toFixed(1) + ')');
    doigt.style.transform = 'translate(' + (d.x - 12) + 'px,' + (d.y - 2) + 'px)';
    if(anim) anim.poser({ph:u * 40, amp:u > 0 && u < 1 ? 1 : 0, t:u * 5});
  }
  if(reduit()){ image(.45, 0); return {arreter:function(){}}; }
  var t0 = null, arr = false;
  (function tic(ts){ if(arr) return; if(t0 === null) t0 = ts; var tt = (ts - t0) / 1000, u = (tt % 5.4) / 4.2; image(Math.min(1, u), tt); requestAnimationFrame(tic); })(performance.now());
  return {arreter:function(){ arr = true; }};
}};
})();
