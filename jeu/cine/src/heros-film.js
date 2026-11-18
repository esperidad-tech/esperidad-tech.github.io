/* heros-film.js — LES TROIS HÉROS DU DONJON DANS UN FILM (Bible §13.68).
   Ce sont les vrais pantins du donjon (jeu/donjon/anim/heros/heros-anime.js : le Pisteur, le Sage, l'Alchimiste, vus de profil,
   en pièces articulées, avec leurs capes et leurs robes simulées) — le film ne les redessine pas : il les POSE, image par image.
   Ici : fabriquer un héros dans un calque (HF.creer), lui donner ce qu'il tient (la torche du Pisteur, la lanterne de
   l'Alchimiste ; le Sage a déjà son bâton à cristal), le poser (HF.poser), faire tomber ses tissus (HF.simuler), et les gestes
   du film : la marche à pieds posés (sur le plat comme dans un escalier), la descente à la corde, se tenir debout.
   Dans le donjon, ces pantins s'animent tout seuls (Web Animations, horloge) ; ici rien ne bouge tout seul : tout vient du temps t. */
(function(){
'use strict';
var U = window.CU, NS = 'http://www.w3.org/2000/svg', O = '#24182e';
var HF = window.HF = {};
function r1(v){ return Math.round(v * 10) / 10; }
function zero(){ return {x:0, y:0, r:0, k:0, sx:1, sy:1}; }
function g(html){ var e = document.createElementNS(NS, 'g'); e.innerHTML = html; return e; }

/* ---------------------------------------------------------------- CE QU'ILS TIENNENT */
/* la torche du Pisteur : tenue dans le poing proche (108, 187) ; elle pointe vers +x (le film tourne la main) */
function torche(){
  var x = 108, y = 187;
  return '<g data-torche>' +
    '<path d="M' + (x - 14) + ' ' + y + ' L ' + (x + 40) + ' ' + y + '" stroke="' + O + '" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M' + (x - 14) + ' ' + y + ' L ' + (x + 40) + ' ' + y + '" stroke="#7a4e2a" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M' + (x - 10) + ' ' + (y - 1.2) + ' L ' + (x + 34) + ' ' + (y - 1.2) + '" stroke="#b98450" stroke-width="1.3" opacity=".7"/>' +
    '<path d="M' + (x + 34) + ' ' + (y - 7) + ' L ' + (x + 52) + ' ' + (y - 9) + ' Q ' + (x + 60) + ' ' + y + ' ' + (x + 52) + ' ' + (y + 9) + ' L ' + (x + 34) + ' ' + (y + 7) + ' Z" fill="#3a2a22" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M' + (x + 38) + ' ' + (y - 7) + ' l 3 14 M' + (x + 44) + ' ' + (y - 8) + ' l 3 16 M' + (x + 50) + ' ' + (y - 8) + ' l 2 16" stroke="#8a6a4a" stroke-width="1.6" opacity=".8"/>' +
    '<path d="M' + (x + 33) + ' ' + (y - 5) + ' l 0 10" stroke="#c9a35a" stroke-width="2.6"/>' +
    '<circle data-r="flamme" cx="' + (x + 54) + '" cy="' + y + '" r=".6" fill="none"/></g>';
}
/* l'arc du Pisteur, en bandoulière dans son dos (il a les mains prises par la torche et par la corde) */
function arcDos(){
  return '<g data-arc-dos><path d="M96 52 Q 52 128 104 204" fill="none" stroke="' + O + '" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M96 52 Q 52 128 104 204" fill="none" stroke="#8a5a2e" stroke-width="5" stroke-linecap="round"/><path d="M95 60 Q 60 128 101 196" fill="none" stroke="#d29a5a" stroke-width="1.3" opacity=".8"/>' +
    '<path d="M96 52 L 104 204" stroke="#f3e7cb" stroke-width="1.4" opacity=".85"/></g>';
}
/* la lanterne de l'Alchimiste : pendue sous son poing proche (108, 187) ; elle reste d'aplomb (le film la redresse à chaque image) */
function lanterne(){
  var x = 108, y = 187;
  return '<g data-lanterne><g data-lant-pend>' +
    '<path d="M' + x + ' ' + (y + 4) + ' L ' + x + ' ' + (y + 15) + '" stroke="' + O + '" stroke-width="4.4"/><path d="M' + x + ' ' + (y + 4) + ' L ' + x + ' ' + (y + 15) + '" stroke="#c9a35a" stroke-width="2"/>' +
    '<path d="M' + (x - 9) + ' ' + (y + 22) + ' Q ' + x + ' ' + (y + 8) + ' ' + (x + 9) + ' ' + (y + 22) + '" fill="none" stroke="' + O + '" stroke-width="4.6"/><path d="M' + (x - 9) + ' ' + (y + 22) + ' Q ' + x + ' ' + (y + 8) + ' ' + (x + 9) + ' ' + (y + 22) + '" fill="none" stroke="#b08a48" stroke-width="2.2"/>' +
    '<path d="M' + (x - 12) + ' ' + (y + 27) + ' L ' + x + ' ' + (y + 17) + ' L ' + (x + 12) + ' ' + (y + 27) + ' Z" fill="#6a4a26" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="' + (x - 10) + '" y="' + (y + 27) + '" width="20" height="26" rx="2" fill="#ffd98a" stroke="' + O + '" stroke-width="3"/>' +
    '<rect x="' + (x - 7.5) + '" y="' + (y + 29.5) + '" width="15" height="21" rx="1.5" fill="#fff4c8"/>' +
    '<path d="M' + x + ' ' + (y + 27) + ' L ' + x + ' ' + (y + 53) + ' M' + (x - 10) + ' ' + (y + 40) + ' L ' + (x + 10) + ' ' + (y + 40) + '" stroke="#5a3c1e" stroke-width="2.2"/>' +
    '<path d="M' + (x - 12) + ' ' + (y + 53) + ' L ' + (x + 12) + ' ' + (y + 53) + ' L ' + (x + 9) + ' ' + (y + 59) + ' L ' + (x - 9) + ' ' + (y + 59) + ' Z" fill="#6a4a26" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle data-r="lampe" cx="' + x + '" cy="' + (y + 40) + '" r=".6" fill="none"/></g></g>';
}

/* ---------------------------------------------------------------- FABRIQUER */
HF.creer = function(S, couche, role, o){
  o = o || {};
  window.HerosAnime.grain = false;
  var boite = document.createElement('div');
  boite.style.cssText = 'width:250px;height:300px;transform-origin:125px 292px';
  couche.poser(boite, 0, 0);
  var h = window.HerosAnime.creer(boite, role, o.lk);
  h.arreter(); h._calme = true;
  var a = {h:h, boite:boite, role:role, couche:couche, x:0, y:0, sens:1, ech:1, tient:{}};
  var om = h.svg.querySelector('[data-ombre]'); if(om) om.style.display = 'none';
  function devantPoing(nom, html){ var m = h.svg.querySelectorAll('[data-i="' + nom + '"]'); m = m[m.length - 1]; var e = g(html).firstChild; m.insertBefore(e, m.firstChild); return e; }
  if(role === 'pisteur'){
    [].forEach.call(h.svg.querySelectorAll('[data-j="arc"],[data-corde],[data-fleche]'), function(e){ e.style.display = 'none'; });
    a.tient.torche = devantPoing('mainB', torche());
    var t0 = h.svg.querySelector('[data-i="torse"]'); t0.insertBefore(g(arcDos()).firstChild, t0.children[1] || null);
  }
  if(role === 'alchimiste'){
    [].forEach.call(h.svg.querySelectorAll('[data-fiole-b]'), function(e){ e.style.display = 'none'; });
    a.tient.lanterne = devantPoing('mainB', lanterne());
    a.pend = a.tient.lanterne.querySelector('[data-lant-pend]');
  }
  /* les repères ajoutés (la flamme, la lampe) */
  [].forEach.call(h.svg.querySelectorAll('[data-r]'), function(e){ var n = e.getAttribute('data-r'); if(!h.reps[n]) h.reps[n] = e; });
  a.vis = {y:h.svg.querySelectorAll('[data-y]'), s:h.svg.querySelectorAll('[data-s]'), b:h.svg.querySelectorAll('[data-b]')};
  a.cligneEl = h.svg.querySelector('.ha-cligne'); a.iris = h.svg.querySelectorAll('.ha-iris');
  S.heros.push(a);
  HF.reinit(a);
  return a;
};
HF.reinit = function(a){ a.h.souples.forEach(function(so, k){ so.init = false; so.t = 2.2 + k * 1.37; so._dessine = null; }); a.balance = 0; a.balanceV = 0; a.mainX = null; };

/* ---------------------------------------------------------------- POSER
   P = {x, y (ses pieds, dans le calque), sens (1 : il regarde à droite), ech, pose:{…}, yeux, sourcils, bouche, cligne (0 → 1), regard:[dx, dy], op} */
HF.poser = function(a, P){
  var h = a.h, n;
  h.etat = {}; for(n in h.els) h.etat[n] = zero();
  h.poser(P.pose);
  a.x = P.x; a.y = P.y; a.sens = P.sens == null ? 1 : P.sens; a.ech = P.ech || 1;
  a.boite.style.left = r1(a.x - 125) + 'px'; a.boite.style.top = r1(a.y - 292) + 'px';
  a.boite.style.transform = 'scale(' + (a.sens * a.ech) + ',' + a.ech + ')';
  a.boite.style.opacity = P.op == null ? '' : P.op;
  a.boite.style.display = P.cache ? 'none' : '';
  var v = {y:P.yeux || 'ouverts', s:P.sourcils || 'garde', b:P.bouche || 'neutre'};
  ['y', 's', 'b'].forEach(function(c){ [].forEach.call(a.vis[c], function(e){ e.style.display = e.getAttribute('data-' + c) === v[c] ? '' : 'none'; }); });
  if(a.cligneEl) a.cligneEl.style.transform = 'scaleY(' + r1(1 - .92 * U.clamp(P.cligne || 0, 0, 1)) + ')';
  var rg = P.regard || [0, 0];
  [].forEach.call(a.iris, function(e){ e.style.transform = 'translate(' + r1(rg[0]) + 'px,' + r1(rg[1]) + 'px)'; });
  if(a.tient.torche) a.tient.torche.style.display = P.sansTorche ? 'none' : '';
  if(a.tient.lanterne) a.tient.lanterne.style.display = P.sansLanterne ? 'none' : '';
  a.P = P;
};
/* les paupières : il cligne de temps en temps (à des instants fixés par une graine) */
HF.cligne = function(t, graine){
  var p = 3.1 + (graine || 0) * .7, ph = (t + (graine || 0) * 1.3) % p;
  return ph < .16 ? Math.sin(ph / .16 * Math.PI) : 0;
};

/* ---------------------------------------------------------------- LES TISSUS (un pas de 1/30 s) ET LA LANTERNE QUI PEND */
HF.simuler = function(a, dt, t){
  var h = a.h, ox = a.sens * a.x / a.ech, oy = a.y / a.ech;
  if(a.pend){
    /* la lanterne reste d'aplomb, et se balance quand la main bouge */
    var e = h.etat, ang = e.racine.r + e.bassin.r + e.torse.r + e.brasB.r + e.avantBrasB.r + e.mainB.r;
    var mx = ox + (h.etat.bassin.x || 0);
    if(a.mainX == null) a.mainX = mx;
    var acc = (mx - a.mainX) / dt; a.mainX = mx;
    a.balanceV += (-a.balance * 60 - a.balanceV * 3.2 - acc * .9) * dt; a.balance += a.balanceV * dt;
    a.balance = U.clamp(a.balance, -22, 22);
    a.pend.setAttribute('transform', 'rotate(' + r1(-ang + a.balance) + ' 108 187)');
  }
  h.souples.forEach(function(so){ so.lire(); });
  h.souples.forEach(function(so){ so.pas(dt, [ox, oy], a.sansSol ? 1e9 : oy + 294); });
};
/* où est, à l'écran, un repère du héros (la flamme, la lampe, le cristal, la tête…) */
HF.ou = function(a, nom){ var e = a.h.reps[nom]; if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2}; };

/* ---------------------------------------------------------------- LES GESTES */
/* debout, au repos : il respire, son poids passe d'un pied sur l'autre ; o = {pA, pB (où sont ses pieds), g (une graine)} */
HF.debout = function(t, o){
  o = o || {};
  var gr = o.g || 0, re = Math.sin(t * 1.9 + gr * 2.1), pd = U.fbm(t * .35, 30 + gr, 2);
  return {bassin:{x:pd * 3, y:(o.bas == null ? 7 : o.bas) + re * .8, r:pd * 1.2}, torse:{r:(o.torse == null ? 4 : o.torse) + re * .7 - pd, sy:1 + .012 * re}, tete:(o.tete == null ? -3 : o.tete) + U.fbm(t * .5, 50 + gr, 2) * 2.5 - re * .5,
    pA:o.pA || [104, 272], pB:o.pB || [150, 272], fA:0, fB:0};
};
/* LA MARCHE À PIEDS POSÉS. Le héros est en X (dans le monde) ; ses pieds se posent tous les « pas » (54) le long du sol, l'un après
   l'autre, et NE GLISSENT PAS : un pied posé reste où il est pendant que le corps passe au-dessus. sol(x) : la hauteur du sol
   (une fonction : plat, ou les marches d'un escalier) ; pente(x) : la hauteur moyenne (pour le corps ; sol par défaut).
   Rend {pose, y (la hauteur des pieds du pantin)} ; o = {pas, x0 (où tombe un pied), leve, g} */
HF.marche = function(X, sol, o){
  o = o || {};
  var Lp = o.pas || 54, x0 = o.x0 || 0, AV = .55, AR = .65, pente = o.pente || sol, Y = pente(X), ech = o.ech || 1;
  function pied(par){
    /* le pied « par » (0 : proche, B ; 1 : loin, A) se pose en x0 + n·Lp pour n de sa parité */
    var u = (X - x0) / Lp, n = Math.floor((u + AV - par) / 2) * 2 + par;      /* la dernière pose commencée */
    var xp = x0 + n * Lp, du = u - n;                                           /* du : de −AV (il se pose) à … */
    if(du <= AR) return {x:xp, y:sol(xp), a:du < -AV + .22 ? -10 * (1 - (du + AV) / .22) : du > AR - .3 ? 22 * (du - (AR - .3)) / .3 : 0};
    var v = (du - AR) / (2 - AV - AR), e = v * v * (3 - 2 * v), xn = xp + 2 * Lp, ya = sol(xp), yb = sol(xn);
    var leve = (o.leve || 15) + Math.abs(yb - ya) * .32;
    return {x:U.lerp(xp, xn, e), y:U.lerp(ya, yb, Math.pow(e, yb > ya ? 1.5 : .7)) - leve * Math.pow(Math.sin(Math.PI * v), .85), a:22 * (1 - v) * (1 - v) + 16 * Math.sin(Math.PI * v) - 10 * v * v};
  }
  var B = pied(0), A = pied(1), u = (X - x0) / Lp, ph = 2 * Math.PI * (u + AV), sw = Math.sin(Math.PI * u);
  var pose = {bassin:{x:0, y:(o.bas == null ? 9 : o.bas) + 2.6 * Math.cos(ph), r:1.8 * Math.sin(Math.PI * u + .4)}, torse:(o.torse == null ? 6 : o.torse) + 1.5 * Math.cos(ph + .5), tete:(o.tete == null ? -5 : o.tete) - 1.2 * Math.cos(ph + .9),
    pA:[122 + (A.x - X) / ech, 272 + (A.y - Y) / ech], fA:A.a, pB:[130 + (B.x - X) / ech, 272 + (B.y - Y) / ech], fB:B.a,
    /* les bras : ils se balancent à l'opposé des jambes (le film remplace celui qui tient quelque chose) */
    brasA:-8 - 26 * sw, avantBrasA:-22 + 8 * sw, mainA:6, brasB:-6 + 26 * sw, avantBrasB:-22 - 8 * sw, mainB:6};
  return {pose:pose, y:Y, A:A, B:B};
};
/* où s'arrêter pour avoir les deux pieds au sol (le n-ième pas) */
HF.arret = function(n, o){ o = o || {}; return (o.x0 || 0) + (n + .55) * (o.pas || 54); };

/* LA DESCENTE À LA CORDE : le corps est en Y (dans le monde) ; les mains se posent sur la corde tous les « prise » (30), l'une après
   l'autre, et tiennent pendant que le corps descend ; les jambes serrent la corde. xc : où passe la corde, dans le pantin (162). */
HF.corde = function(Y, o){
  o = o || {};
  var Lg = o.prise || 30, xc = o.xc || 162, bal = o.bal || 0, ech = o.ech || 1;
  function main(par){
    var u = Y / Lg, n = Math.floor((u + .5 - par) / 2) * 2 + par, yp = n * Lg, du = u - n;      /* du de −.5 (elle prend) à 1.5 */
    if(du <= .78) return {y:yp, l:0};
    var v = (du - .78) / (2 - .5 - .78), e = v * v * (3 - 2 * v);
    return {y:U.lerp(yp, yp + 2 * Lg, e), l:Math.sin(Math.PI * v)};
  }
  var B = main(0), A = main(1), u = Y / Lg, s = Math.sin(Math.PI * u);
  var yB = 94 + (B.y - Y) / ech, yA = 100 + (A.y - Y) / ech;
  return {racine:{r:bal}, bassin:{x:6, y:2 + 1.5 * s, r:-4 + 2 * s}, torse:{r:10 + 2.5 * s}, tete:o.tete == null ? 12 : o.tete,
    mB:[xc - 5 - 7 * B.l, yB], hB:-90, cB:1, mA:[xc + 1 - 6 * A.l, yA], hA:-90, cA:1,
    /* les jambes : croisées sur la corde, elles glissent ; un genou monte un peu quand la main d'en face lâche */
    pA:[xc - 16, 236 - 5 * A.l], fA:28, gA:-1, pB:[xc - 8, 250 - 6 * B.l], fB:34, gB:-1};
};
/* un mélange de deux poses (les mêmes champs) : pour passer d'un geste à l'autre */
HF.mel = function(p, q, k){ return U.melange(norm(p), norm(q), U.lisse(k)); };
function norm(p){ var o = {}, n; for(n in p){ var v = p[n]; o[n] = (typeof v === 'number' && !/^[fhcgs][AB]$/.test(n)) ? {r:v} : v; } return o; }

/* l'ombre au sol d'un héros (une tache sombre sous ses pieds), à dessiner dans le calque du sol */
HF.ombre = function(x, y, rx, op){ return '<ellipse cx="' + r1(x) + '" cy="' + r1(y) + '" rx="' + r1(rx || 62) + '" ry="' + r1((rx || 62) * .16) + '" fill="url(#mpHNoir)" opacity="' + (op == null ? .8 : op) + '"/>'; };
/* la bouche qui parle : des syllabes ; rend 'neutre', 'o', 'sourire' ou 'joie' */
HF.parle = function(t, t0, t1, graine){
  if(t < t0 || t > t1) return 'neutre';
  var k = Math.floor((t - t0) * 7.5), v = U.bruit(k * 1.7, 90 + (graine || 0));
  var f = ((t - t0) * 7.5) % 1;
  if(f > .72) return 'neutre';
  return v > .25 ? 'joie' : v > -.3 ? 'o' : 'sourire';
};
})();
