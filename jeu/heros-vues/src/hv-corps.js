/* ==========================================================
   Les héros « en volume » — 4 sur 5 : LE CORPS (le buste et la tunique, les bras, les jambes, la ceinture, le baudrier,
   le carquois, l'arc). Les mesures sont celles de persos.js : le cadre 300 × 440, le milieu à x = 150, le sol à y = 414.
   Ici x est compté depuis le milieu du héros (x > 0 : SA gauche, donc la droite de l'écran quand il est de face), z vers l'avant.

   - Le buste est un volume (HV.BUSTE), comme la tête : son contour est exact sous tous les angles. Le bas de la tunique, la
     ceinture, les revers sont des anneaux : on les voit d'un peu au-dessus (ANNEAU), ils s'arrondissent vers le bas devant.
   - Les bras et les jambes : des os dans l'espace (épaule, coude, poignet ; hanche, genou, cheville). On dit où poser la main
     ou le pied, le coude et le genou se placent tout seuls (ik3). Chaque os est une « gélule » entre deux ronds, comme Mimi.
   - LA TUNIQUE EST D'UN SEUL TENANT (Romain, 23 novembre, 11 h : « que le bras soit intégré dans l'épaule […] qu'il n'y ait pas
     une délimitation du bras […] un tout petit peu moins pantin ») : le buste et les manches ont UN seul contour et la même
     couleur ; le trait d'un bras ne commence qu'à l'aisselle (sa partie « libre »), l'épaule se fond dans le buste.
   - Ce qui est d'un seul côté (l'arc dans SA main droite, le carquois sur SON épaule gauche, le baudrier en travers) reste de
     son côté quand le héros se tourne : c'est ce qui manque à une image retournée.
   - Les matières (la trame du tissu, le grain du cuir, les plis, les coutures, les sangles des bottes, les doigts) viennent de
     la maquette du matin du 23 novembre (dans le projet : claude/maquette-heros-coiffures.md).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, coupe = U.coupe, table = U.table, PF = U.PF, PT = U.PT, PC = U.PC, gelule = U.gelule;
var ANNEAU = 0.2;      /* ce qui est 10 plus près de nous est 2 plus bas à l'écran (les anneaux, les pieds) */

/* ---------- Le buste et la tunique (fille) ---------- */
var T_A = table([[137, 12], [139, 22.5], [142, 29.5], [146, 33.5], [152, 34], [165, 32.5], [180, 30], [200, 28.5], [208, 29], [222, 32.5], [246, 40], [272, 47.5]]);
var T_F = table([[137, 9.5], [139, 11.5], [142, 13.5], [146, 15.5], [152, 18], [165, 20], [180, 18.5], [200, 16.5], [208, 17], [222, 19.5], [246, 24.5], [272, 30]]);
var T_B = table([[137, 9.5], [139, 11], [142, 13], [146, 14.5], [152, 15.5], [165, 16], [180, 15.5], [200, 14.5], [208, 15], [222, 18.5], [246, 23.5], [272, 28.5]]);
var BUSTE = HV.BUSTE = U.volume(137, 272, function(y){ return coupe(T_A(y), 0, T_F(y), T_B(y), 2.3, 2.3); });
var COU = U.volume(100, 146, function(y){ return coupe(8.8, -2, 7.8, 7.6, 2, 2); });

function p3(q, V){ return [q[0] * V.c + q[2] * V.s, q[1], -q[0] * V.s + q[2] * V.c]; }
function add(a, b, k){ k = k == null ? 1 : k; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
function sub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function lon(a){ return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
function uni(a){ var l = lon(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function dot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
/* deux os (l1, l2) de l'attache A à la cible T ; pole : de quel côté va l'articulation → [l'articulation, le bout] */
function ik3(A, T, l1, l2, pole){
  var d = sub(T, A), dist = borne(lon(d), Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.3), u = uni(d);
  var a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  var n = sub(pole, [u[0] * dot(pole, u), u[1] * dot(pole, u), u[2] * dot(pole, u)]);
  n = uni(lon(n) < 0.001 ? [0, 0, 1] : n);
  return [add(add(A, u, a), n, h), add(A, u, dist)];
}
HV.ik3 = ik3;

/* poser sur le buste un point donné de face (x compté depuis le milieu, y), devant ou derrière (dos) → {p : [X, Y], vu} */
function poseB2(x, y, V, dos){
  var S = BUSTE.a(y, 1), a = S.a, xx = borne(x, -a * 0.999, a * 0.999), p = dos ? S.pb : S.pf;
  var q = [xx, S.zm + (dos ? -S.cb : S.cf) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(xx) / a, p)), 1 / p)];
  return {p:[U.ecranX(q, V), y + ANNEAU * U.fond(q, V)], vu:U.visible(S, Math.atan2(q[0], q[1] - S.zm), V)};
}
function poseB(x, y, V){ return poseB2(x, y, V, false).p; }
/* un trait donné de face sur le devant du buste → les morceaux qu'on en voit, posés */
function surBuste(pts, V, dos){
  var R = [], run = [];
  pts.forEach(function(q){ var o = poseB2(q[0], q[1], V, dos); if(o.vu) run.push(o.p); else { if(run.length > 1) R.push(run); run = []; } });
  if(run.length > 1) R.push(run);
  return R;
}
/* un anneau autour d'un volume à la hauteur y : la partie qu'on voit, de la gauche de l'écran à la droite → [[X, Y]…] */
function anneau(vol, y, V, n, k){
  var S = vol.a(y, 1), H = U.horizons(S, V), r = [], i;
  n = n || 12;
  for(i = 0; i <= n; i++){ var q = U.point(S, H[0] + (H[1] - H[0]) * i / n); r.push([U.ecranX(q, V), y + (k == null ? ANNEAU : k) * U.fond(q, V)]); }
  return r;
}
/* un point du tour du buste : az (degrés, 0 devant), y → {p, vu} */
function tour(azd, y, V){ var S = BUSTE.a(y, 1), q = U.point(S, azd * RAD); return {p:[U.ecranX(q, V), y + ANNEAU * U.fond(q, V)], vu:U.visible(S, azd * RAD, V)}; }
function couture(d, op){ return d ? '<path d="' + d + '" stroke="#f3d6a4" stroke-width=".9" fill="none" stroke-dasharray="2.6 2.4" stroke-linecap="round" opacity="' + (op || 0.55) + '"/>' : ''; }

/* le relief d'un os : un dégradé en travers de lui (la lumière vient d'en haut à gauche), quel que soit son sens */
function relief(K, nom, x0, y0, x1, y1, r){
  var nx = -(y1 - y0), ny = x1 - x0, l = Math.sqrt(nx * nx + ny * ny) || 1, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  nx /= l; ny /= l;
  if(nx + 0.35 * ny < 0){ nx = -nx; ny = -ny; }
  return '<linearGradient id="' + K.n(nom) + '" gradientUnits="userSpaceOnUse" x1="' + f1(mx - nx * r) + '" y1="' + f1(my - ny * r) + '" x2="' + f1(mx + nx * r) + '" y2="' + f1(my + ny * r) + '">' +
    '<stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".26" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#000" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>';
}

/* ---------- Un bras (cote : -1, SON bras droit, celui de l'arc ; 1 : SON bras gauche) : sa forme ---------- */
var R_EP = 10.6, R_CO = 9.3, R_PO = 8.3, LIBRE = 0.36;
function bras(V, cote, P){
  var Ep = [cote * 31.5, 151, 0], cle = cote < 0 ? 'G' : 'D';
  var Wc = P['main' + cle] || [cote * 50.5, 243, 4], pole = P['coude' + cle] || [cote * 0.7, -0.1, -0.7];
  var J = ik3(Ep, Wc, 50, 43, pole), El = J[0], W = J[1], dir = uni(sub(W, El)), M = add(W, dir, 17);
  var e = p3(Ep, V), c2 = p3(El, V), w = p3(W, V), m = p3(M, V);
  var a = [vers(e[0], c2[0], LIBRE), vers(e[1], c2[1], LIBRE)], ra = vers(R_EP, R_CO, LIBRE);
  var bas = gelule(c2[0], c2[1], R_CO, w[0], w[1], R_PO);
  return {cote:cote, cle:cle, e:e, c2:c2, w:w, m:m, W:W, dir:dir, fond:e[2] + c2[2] * 0.5,
    manche:[gelule(e[0], e[1], R_EP, c2[0], c2[1], R_CO), bas],                 /* toute la manche */
    libre:[gelule(a[0], a[1], ra, c2[0], c2[1], R_CO), bas],                     /* ce qui se détache du buste : de l'aisselle au poignet */
    epaule:gelule(e[0], e[1], R_EP + 0.4, vers(e[0], c2[0], 0.3), vers(e[1], c2[1], 0.3), vers(R_EP, R_CO, 0.3) + 0.2)};
}
/* son dessin. plein : avec tout son contour (le bras du fond, dessiné avant le buste) ; sinon son trait ne commence qu'à l'aisselle */
function brasSVG(K, V, B, P, plein){
  var s = '', c2 = B.c2, w = B.w, m = B.m, cote = B.cote, L = plein ? B.manche : B.libre;
  s += '<path d="' + L.join(' ') + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linejoin="round"/>' +
    '<path d="' + B.manche.join(' ') + '" fill="' + K.u('tun') + '"/><path d="' + B.manche.join(' ') + '" fill="' + K.u('trame') + '" opacity=".34"/>' +
    /* le relief de chaque os, en travers de lui ; celui de l'avant-bras s'arrête au coude (pas deux couches l'une sur l'autre) */
    relief(K, 'rb' + B.cle + '0', B.e[0], B.e[1], c2[0], c2[1], R_EP) + relief(K, 'rb' + B.cle + '1', c2[0], c2[1], w[0], w[1], R_CO) +
    '<clipPath id="' + K.n('xb' + B.cle) + '"><path clip-rule="evenodd" d="M-400 -200 H400 V700 H-400 Z ' + L[0] + '"/></clipPath>' +
    PF(L[0], K.u('rb' + B.cle + '0')) + PF(L[1], K.u('rb' + B.cle + '1'), ' clip-path="url(#' + K.n('xb' + B.cle) + ')"');
  /* les plis du coude */
  var nx = -(w[1] - c2[1]), ny = w[0] - c2[0], nl = Math.sqrt(nx * nx + ny * ny) || 1, ux = (w[0] - c2[0]) / nl, uy = (w[1] - c2[1]) / nl; nx /= nl; ny /= nl;
  function Q(al, k){ return f1(c2[0] + ux * al + nx * k) + ' ' + f1(c2[1] + uy * al + ny * k); }
  s += PT('M' + Q(-1, -6.4) + ' Q ' + Q(3, 0) + ' ' + Q(0, 5.4) + ' M' + Q(6, -5.6) + ' Q ' + Q(9.4, -1) + ' ' + Q(7.4, 3.4), U.sombre(K.tissu[2], 0.2), 1.5, ' opacity=".34"');
  /* le poignet de cuir, piqué */
  var q1 = [vers(c2[0], w[0], 0.8), vers(c2[1], w[1], 0.8)], dq = gelule(q1[0], q1[1], R_PO + 0.9, w[0], w[1], R_PO + 0.5);
  s += PC(dq, K.u('cuir'), 1.6) + PF(dq, K.u('grain'), ' opacity=".4"') + couture('M' + f1(q1[0] - nx * 6.4) + ' ' + f1(q1[1] - ny * 6.4) + ' L ' + f1(q1[0] + nx * 6.4) + ' ' + f1(q1[1] + ny * 6.4), 0.5);
  /* l'arc est dans cette main : on le dessine avant la main (elle le tient) */
  if(cote < 0 && P.arc !== false) s += arcSVG(K, V, add(B.W, B.dir, 8), P);
  /* la main : le pouce (vers l'avant quand le bras pend : de face la main le cache, de profil il dépasse), la paume et les doigts
     d'un seul tenant, trois traits pour séparer les doigts */
  var pc = P['pouce' + B.cle] || [-cote * 0.25, 0.1, 1], po1 = p3(add(add(B.W, B.dir, 4.5), pc, 4.6), V), po2 = p3(add(add(B.W, B.dir, 10.5), pc, 8.8), V);
  s += PC(gelule(po1[0], po1[1], 3.9, po2[0], po2[1], 3.1), K.u('peau'), 1.8);
  var L2 = Math.sqrt((m[0] - w[0]) * (m[0] - w[0]) + (m[1] - w[1]) * (m[1] - w[1])), ax = (m[0] - w[0]) / (L2 || 1), ay = (m[1] - w[1]) / (L2 || 1);
  var dm = gelule(w[0] + ax * L2 * 0.12, w[1] + ay * L2 * 0.12, 8.4, m[0], m[1], 6.6);
  s += PC(dm, K.u('peau'), 2) + PF(dm, K.u('relM'), ' opacity=".45"');
  if(L2 > 9){
    var dg = '';
    [-3.2, 0, 3.2].forEach(function(k){
      dg += 'M' + f1(w[0] + ax * L2 * 0.68 - ay * k) + ' ' + f1(w[1] + ay * L2 * 0.68 + ax * k) + ' L ' + f1(w[0] + ax * (L2 * 1.06 - Math.abs(k) * 0.5) - ay * k * 0.9) + ' ' + f1(w[1] + ay * (L2 * 1.06 - Math.abs(k) * 0.5) + ax * k * 0.9) + ' ';
    });
    s += PT(dg, K.peau.trait, 1.25, ' opacity=".85"');
  }
  return s;
}

/* ---------- Le buste : un seul contour avec les manches de devant ---------- */
function torse(K, h, V, P, avant, fond){
  var ct = U.contour(BUSTE, V, 137, 272, 6), bas = anneau(BUSTE, 272, V, 14), s = '', jx = (P && P.jx) || 0, i;
  /* le bas de la tunique suit le mouvement avec un peu de retard */
  function suit(q){ var k = (q[1] - 214) / 58; if(k > 0) q[0] += jx * k * k; return q; }
  ct.G.forEach(suit); ct.D.forEach(suit); bas.forEach(suit);
  ct.G[ct.G.length - 1][1] = bas[0][1]; ct.D[ct.D.length - 1][1] = bas[bas.length - 1][1];
  var d = U.lisse(ct.D.concat(bas.slice(1, -1).reverse(), ct.G.slice().reverse())), cid = K.n('tun');
  /* un seul contour pour le buste et les manches de devant ; l'épaule du bras du fond se fond dans le buste */
  var ens = [d];
  avant.forEach(function(B){ ens = ens.concat(B.manche); });
  s += '<path d="' + ens.join(' ') + '" fill="none" stroke="' + O + '" stroke-width="4.6" stroke-linejoin="round"/>';
  fond.forEach(function(B){ s += PF(B.epaule, K.u('tun')); });
  s += PF(d, K.u('tun')) + '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>';
  var dans = PF(d, K.u('trame'), ' opacity=".34"') + PF(d, K.u('relH')) + PF(d, K.u('relV'));
  /* les plis de la jupe : ils tournent avec elle */
  var plis = '', lums = '';
  [-150, -112, -74, -40, -12, 22, 52, 86, 124, 160].forEach(function(az, j){
    var run = [], y;
    for(y = 222 + (j % 3) * 5; y <= 268; y += 6){ var q = tour(az + (y - 222) * 0.05 * (j % 2 ? 1 : -1), y, V); if(q.vu) run.push(suit(q.p)); }
    if(run.length >= 4){ if(j % 2) lums += '<path d="' + U.filet(run, 2.6) + '"/>'; else plis += '<path d="' + U.filet(run, 3.2) + '"/>'; }
  });
  /* les plis du haut : à la taille, sous les bras */
  [[[-23, 199], [-24.5, 187], [-21, 173]], [[23, 199], [24.5, 187], [21, 173]], [[-30, 159], [-25, 166], [-18, 168]], [[30, 159], [25, 166], [18, 168]]].forEach(function(t, j){
    surBuste(U.ech(t, 6), V).forEach(function(run){ if(run.length >= 4) plis += '<path d="' + U.filet(run, j < 2 ? 2.8 : 2.4) + '"/>'; });
  });
  surBuste(U.ech([[-27, 151], [-29, 171], [-27, 193]], 6), V).forEach(function(run){ if(run.length >= 4) lums += '<path d="' + U.filet(run, 2.4) + '"/>'; });
  dans += '<g fill="' + U.sombre(K.tissu[2], 0.2) + '" opacity=".32">' + plis + '</g><g fill="' + U.clair(K.tissu[0], 0.3) + '" opacity=".34">' + lums + '</g>';
  /* les coutures des côtés */
  [-1, 1].forEach(function(c1){ surBuste(U.ech([[c1 * 30, 151], [c1 * 32, 167], [c1 * 30, 187], [c1 * 27, 199]], 8), V).forEach(function(run){ dans += couture(U.poly(run, false), 0.4); }); });
  /* l'ombre de la tête et du cou sur les épaules ; l'ombre des bras de devant sur le corps */
  var e1 = U.bords(BUSTE.a(146, 1), V);
  dans += '<ellipse cx="' + f1((e1[0] + e1[1]) / 2) + '" cy="146" rx="' + f1((e1[1] - e1[0]) * 0.36) + '" ry="12" fill="#000" opacity=".2"/>';
  avant.forEach(function(B){ dans += '<path d="' + B.libre.join(' ') + '" transform="translate(2.8 2.4)" fill="#000" opacity=".17"/>'; });
  /* le bord du bas : une bande plus sombre et sa couture ; un liseré de lumière froide du côté de l'ombre */
  var b2 = anneau(BUSTE, 264.5, V, 14).map(suit);
  dans += PF(U.poly(b2.concat(bas.slice().reverse())), U.sombre(K.tissu[2], 0.25), ' opacity=".34"') + couture(U.courbe(anneau(BUSTE, 263, V, 14).map(suit)), 0.55);
  dans += PT(U.courbe(ct.D.filter(function(q){ return q[1] > 152 && q[1] < 262; }).map(function(q){ return [q[0] - 1.9, q[1]]; })), '#cfe9ff', 1.5, ' opacity=".36"');
  s += '<g clip-path="url(#' + cid + ')">' + dans + '</g>';
  /* le col en V */
  var col = [[-10, 138.5], [-5, 148], [0, 158], [5, 148], [10, 138.5]].map(function(q){ return poseB(q[0], q[1], V); });
  if(Math.abs(col[0][0] - col[4][0]) > 3 && V.c > -0.1) s += PC(U.poly(col), K.u('tunO'), 1.6);
  /* le baudrier : de SON épaule droite à SA hanche gauche, en travers de la poitrine et du dos */
  [false, true].forEach(function(dos){
    var run = [];
    for(i = 0; i <= 16; i++){ var t = i / 16, q = poseB2(-25.5 + 56.5 * t, 142 + 60.5 * t, V, dos); if(q.vu) run.push(q.p); }
    if(run.length > 2){
      var rb = U.ruban(run, function(){ return 4.7; });
      s += '<g clip-path="url(#' + cid + ')">' + PC(rb, K.u('cuir'), 1.8) + PF(rb, K.u('grain'), ' opacity=".4"') + couture(U.poly(run.map(function(q2){ return [q2[0] - 2, q2[1] - 2.2]; }), false)) + '</g>';
    }
  });
  /* la ceinture : un anneau de cuir, et sa boucle devant */
  var c1 = anneau(BUSTE, 202, V, 10).map(function(q){ return [q[0] * 1.02, q[1]]; }), c2 = anneau(BUSTE, 214, V, 10).map(function(q){ return [q[0] * 1.02, q[1]]; });
  var dc = U.poly(c1.concat(c2.slice().reverse()));
  s += PC(dc, K.u('cuirH'), 2) + PF(dc, K.u('grain'), ' opacity=".4"') + couture(U.poly(c1.map(function(q){ return [q[0], q[1] + 2.3]; }), false), 0.6) + couture(U.poly(c2.map(function(q){ return [q[0], q[1] - 2.3]; }), false), 0.45) +
    PF(U.poly(c2.concat(c2.slice().reverse().map(function(q){ return [q[0], q[1] + 5]; }))), '#000', ' opacity=".2" clip-path="url(#' + cid + ')"');
  var bo = [[-9, 198], [9, 198], [9, 218], [-9, 218]].map(function(q){ return poseB(q[0], q[1], V); }), lb = Math.abs(bo[1][0] - bo[0][0]);
  if(lb > 2.5 && V.c > -0.2){
    var k = lb / 18, mx = (bo[0][0] + bo[1][0]) / 2, my = (bo[0][1] + bo[2][1]) / 2;
    s += '<g transform="translate(' + f1(mx) + ' ' + f1(my) + ') scale(' + f1(k) + ' 1)"><rect x="-9" y="-10" width="18" height="20" rx="3" fill="#c9b07a"' + U.c(1.8) + '/><rect x="-4" y="-5" width="8" height="10" rx="1.5" fill="none" stroke="' + O + '" stroke-width="1.4"/><path d="M-6.6 -7.4 h4 M-6.6 -7.4 v5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g>';
  }
  return s;
}

/* ---------- Le cou ---------- */
function cou(K, V, yt, ombre){
  var ct = U.contour(COU, V, yt, 146, 8), d = U.poly(ct.D.concat(ct.G.slice().reverse())), cid = K.n('cou');
  return '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>' + PC(d, K.u('peau'), 2) + (ombre ? '<g clip-path="url(#' + cid + ')">' + ombre + '</g>' : '');
}

/* ---------- L'arc : tenu par la poignée, dans un plan debout ; sa corde passe du côté du corps ---------- */
function arcSVG(K, V, Hd, P){
  var e = uni(P.arcDir || [-0.82, 0, 0.57]), L = P.arcLong || 101, i, pts = [], n = 16, td = P.tendu || 0;
  function Q(u, v){ return p3([Hd[0] + e[0] * u, Hd[1] + v, Hd[2] + e[2] * u], V); }
  /* (tendu : les branches plient un peu vers la corde) */
  var bx = -16.5 - 9 * td, by = L - 5 * td;
  for(i = 0; i <= n; i++){ var b = U.bez([[bx, -by], [5.5, -L * 0.52], [5.5, L * 0.52], [bx, by]], i / n), q = Q(b[0], b[1]); pts.push([q[0], q[1]]); }
  var d = U.poly(pts, false), t1 = Q(bx, -by), t2 = Q(bx, by), g1 = Q(1.6, -11), g2 = Q(1.6, 11), s = '';
  if(td > 0.02 && P._encoche){
    /* la corde passe par les doigts ; la flèche va des doigts à l'arc */
    var nk = p3(P._encoche, V), nk2 = [vers((t1[0] + t2[0]) / 2, nk[0], td), vers((t1[1] + t2[1]) / 2, nk[1], td)], pt = Q(20, 0);
    s += PT('M' + f1(t1[0]) + ' ' + f1(t1[1]) + ' L ' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(t2[0]) + ' ' + f1(t2[1]), '#efe6cc', 1.3, ' opacity=".9"');
    var ax = pt[0] - nk2[0], ay = pt[1] - nk2[1], al = Math.sqrt(ax * ax + ay * ay) || 1; ax /= al; ay /= al;
    s += PT('M' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(pt[0]) + ' ' + f1(pt[1]), O, 3.6) + PT('M' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(pt[0]) + ' ' + f1(pt[1]), '#e6d8b8', 1.8) +
      PC('M' + f1(pt[0] + ax * 9) + ' ' + f1(pt[1] + ay * 9) + ' L ' + f1(pt[0] - ay * 4.2) + ' ' + f1(pt[1] + ax * 4.2) + ' L ' + f1(pt[0] + ay * 4.2) + ' ' + f1(pt[1] - ax * 4.2) + ' Z', '#b8bcc8', 1.3) +
      PC('M' + f1(nk2[0] + ax * 3) + ' ' + f1(nk2[1] + ay * 3) + ' l ' + f1(-ay * 4 + ax * 2) + ' ' + f1(ax * 4 + ay * 2) + ' l ' + f1(ax * 8) + ' ' + f1(ay * 8) + ' l ' + f1(ay * 4 + ax * 2) + ' ' + f1(-ax * 4 + ay * 2) + ' l ' + f1(ay * 4 - ax * 2) + ' ' + f1(-ax * 4 - ay * 2) + ' l ' + f1(-ax * 8) + ' ' + f1(-ay * 8) + ' Z', '#c8faff', 1);
  } else s += '<path d="M' + f1(t1[0]) + ' ' + f1(t1[1]) + ' L ' + f1(t2[0]) + ' ' + f1(t2[1]) + '" stroke="#efe6cc" stroke-width="1.3" opacity=".9"/>';
  return s + PT(d, O, 9) + PT(d, K.u('bois'), 5) + PT('M' + f1(g1[0]) + ' ' + f1(g1[1]) + ' L ' + f1(g2[0]) + ' ' + f1(g2[1]), '#6e4223', 6.4);
}

/* ---------- Une jambe : la cuisse, puis la botte d'un seul tenant (la tige, le talon, le pied) ---------- */
function jambe(K, V, cote, P){
  var Ha = [cote * 13, 246, 0], cle = cote < 0 ? 'G' : 'D';
  var A = P['pied' + cle] || [cote * 19.5, 386, cote * -5], pole = [cote * 0.25, 0, 1];
  var J = ik3(Ha, A, 72, 70, pole), Kn = J[0], An = J[1];
  var ha = p3(Ha, V), kn = p3(Kn, V), an = p3(An, V), bt = p3(add(Kn, uni(sub(An, Kn)), 3), V);
  var ouv = P['ouv' + cle] == null ? 0.3 : P['ouv' + cle];
  var ta = p3(add(An, [-cote, 21, -7]), V), po = p3(add(An, [cote * 20 * ouv, 22, 19]), V);
  var gy = function(q){ return q[1] + 0.13 * (q[2] - an[2]); };
  var s = '', dcu = gelule(ha[0], ha[1], 13.2, kn[0], kn[1], 10.6), cu = K.n('cu' + cle);
  /* la cuisse, et l'ombre de la tunique dessus */
  s += PC(dcu, K.u('pant'), 2.2) + '<clipPath id="' + cu + '"><path d="' + dcu + '"/></clipPath><ellipse cx="' + f1(ha[0] + (kn[0] - ha[0]) * 0.42) + '" cy="278" rx="22" ry="13" fill="#000" opacity=".3" clip-path="url(#' + cu + ')"/>';
  var botte = [gelule(bt[0], bt[1] - 6, 13, an[0], an[1], 11.4), gelule(ta[0], gy(ta), 9, po[0], gy(po), 7.8), gelule(an[0], an[1] + 4, 11, ta[0], gy(ta) - 1, 8.8)];
  var cid = K.n('bt' + cle);
  s += '<clipPath id="' + cid + '"><rect x="-200" y="0" width="400" height="' + f1(414.6 + 0.13 * (Math.max(ta[2], po[2]) - an[2])) + '"/></clipPath>';
  s += '<g clip-path="url(#' + cid + ')">' + U.masse(botte, K.u('cuir'), 2.2) + botte.map(function(d){ return PF(d, K.u('grain'), ' opacity=".42"') + PF(d, K.u('relM'), ' opacity=".55"'); }).join('') + '</g>';
  /* le long de la tige : un reflet, les plis de la cheville, une sangle et sa boucle */
  var ux = an[0] - bt[0], uy = an[1] - bt[1], ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
  function Q(t, k){ return f1(bt[0] + ux * ul * t - uy * k) + ' ' + f1(bt[1] + uy * ul * t + ux * k); }
  s += PT('M' + Q(0.1, 8.6) + ' L ' + Q(0.66, 7.6), '#f6c896', 2, ' opacity=".38"') +
    PT('M' + Q(0.93, 9.6) + ' Q ' + Q(0.99, 0) + ' ' + Q(0.94, -9) + ' M' + Q(1.03, 8) + ' Q ' + Q(1.08, 0) + ' ' + Q(1.04, -7), '#1c0e06', 1.7, ' opacity=".4"') +
    PC('M' + Q(0.74, 12.6) + ' L ' + Q(0.74, -12.6) + ' L ' + Q(0.84, -12.2) + ' L ' + Q(0.84, 12.2) + ' Z', '#4a2a14', 1.3);
  if(Math.abs(V.c) > 0.25) s += '<rect x="-3.8" y="-4.4" width="7.6" height="8.8" rx="1.6" fill="' + K.u('or') + '" stroke="' + O + '" stroke-width="1.1" transform="translate(' + Q(0.79, -cote * 3.5 * V.c) + ')"/>';
  /* la semelle et sa piqûre */
  var sy = 414 + 0.13 * ((ta[2] + po[2]) / 2 - an[2]), x1 = Math.min(ta[0], po[0]) - 6, x2 = Math.max(ta[0], po[0]) + 5.6;
  s += PT('M' + f1(x1) + ' ' + f1(sy) + ' L ' + f1(x2) + ' ' + f1(sy), '#2a1c26', 2.6) + couture('M' + f1(x1 + 3) + ' ' + f1(sy - 5.4) + ' L ' + f1(x2 - 3) + ' ' + f1(sy - 5.4), 0.6);
  /* le revers de la botte, et son ombre sur la tige */
  var rx = bt[0], ry = bt[1] - 9, pl = 3.2 * V.c, dr = 'M' + f1(rx - 14.2) + ' ' + f1(ry) + ' Q ' + f1(rx) + ' ' + f1(ry + pl) + ' ' + f1(rx + 14.2) + ' ' + f1(ry) + ' L ' + f1(rx + 13.8) + ' ' + f1(ry + 9.5) + ' Q ' + f1(rx) + ' ' + f1(ry + 9.5 + pl * 1.6) + ' ' + f1(rx - 13.8) + ' ' + f1(ry + 9.5) + ' Z';
  s += '<path d="' + dr + '" transform="translate(0 4.5)" fill="#000" opacity=".22"/>' + PC(dr, '#8a5a30', 1.6) + PF(dr, K.u('grain'), ' opacity=".4"') + couture('M' + f1(rx - 12) + ' ' + f1(ry + 2.6) + ' Q ' + f1(rx) + ' ' + f1(ry + 2.6 + pl) + ' ' + f1(rx + 12) + ' ' + f1(ry + 2.6), 0.6);
  return {svg:s, fond:ha[2]};
}

/* ---------- Le carquois : en travers du dos, il dépasse derrière SON épaule gauche ---------- */
function carquois(K, V){
  var B = p3([8, 198, -21], V), T = p3([40, 116, -19], V), ux = T[0] - B[0], uy = T[1] - B[1], l = Math.sqrt(ux * ux + uy * uy) || 1;
  ux /= l; uy /= l;
  var nx = -uy, ny = ux, s = '';
  function Q(a, n){ return [B[0] + ux * a + nx * n, B[1] + uy * a + ny * n]; }
  /* les flèches */
  [[-5, 15], [0.5, 20], [5.4, 13]].forEach(function(f){
    var a = Q(l - 2, f[0]), b = Q(l + f[1], f[0] * 1.15), c1 = Q(l + f[1] - 7.5, f[0] * 1.15 - 3.2), c2 = Q(l + f[1] - 7.5, f[0] * 1.15 + 3.2), d1 = Q(l + f[1] + 1.5, f[0] * 1.15);
    s += PT(U.poly([a, b], false), '#d9cbb0', 2.2) + PC(U.poly([c1, d1, c2, Q(l + f[1] - 5.5, f[0] * 1.15)]), '#b8bcc8', 1.2);
  });
  var corps = U.poly([Q(l, -10.6), Q(l, 10.6), Q(5, 9.4), Q(0, 5), Q(0, -5), Q(5, -9.4)]);
  s += PC(corps, K.u('cuir'), 2.2) + PF(corps, K.u('grain'), ' opacity=".42"') + PF(corps, K.u('relM'), ' opacity=".5"') +
    PC(U.poly([Q(l - 12, -10.9), Q(l - 12, 10.9), Q(l - 6, 10.9), Q(l - 6, -10.9)]), '#c9b07a', 1.3) +
    couture(U.poly([Q(l - 16, -8.6), Q(8, -7.6)], false), 0.45) + PT(U.poly([Q(l * 0.5, -6), Q(l * 0.22, -5)], false), '#f0c090', 1.6, ' opacity=".4"');
  return {svg:s, fond:(B[2] + T[2]) / 2};
}

/* ==========================================================
   HV.corps(K, h, V, P) → les morceaux, à ranger par le pantin : {derriere, jambes, cou(…), torse, devant}
   P : {mainG, mainD : où est le poignet [x, y, z] ; coudeG, coudeD ; piedG, piedD : la cheville ; arc}
   ========================================================== */
HV.corps = function(K, h, V, P){
  P = P || {};
  /* (quand elle tend l'arc, la corde passe par les doigts de l'autre main) */
  if(P.tendu > 0.02){ var Jd = ik3([31.5, 151, 0], P.mainD || [50.5, 243, 4], 50, 43, P.coudeD || [0.7, -0.1, -0.7]); P._encoche = add(Jd[1], uni(sub(Jd[1], Jd[0])), 12); }
  var jg = jambe(K, V, -1, P), jd = jambe(K, V, 1, P), cq = h.role === 'pisteur' || !h.role ? carquois(K, V) : null;
  var avant = [], fond = [], SEUIL = -8, dos = V.c < -0.15;      /* (de dos : le carquois passe devant) */
  [bras(V, -1, P), bras(V, 1, P)].sort(function(a, b){ return a.fond - b.fond; }).forEach(function(b){ (b.fond < SEUIL ? fond : avant).push(b); });
  var der = (cq && !dos ? cq.svg : '') + fond.map(function(b){ return brasSVG(K, V, b, P, true); }).join('');
  var jb = [jg, jd].sort(function(a, b){ return a.fond - b.fond; }).map(function(j){ return j.svg; }).join('');
  return {derriere:der, jambes:jb, torse:torse(K, h, V, P, avant, fond), carquoisDevant:cq && dos ? cq.svg : '',
    devant:avant.map(function(b){ return brasSVG(K, V, b, P, false); }).join(''), dos:dos, cou:function(yt, ombre){ return cou(K, V, yt, ombre); }};
};
})(window);
