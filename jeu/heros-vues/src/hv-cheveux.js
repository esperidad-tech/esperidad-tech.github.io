/* ==========================================================
   Les héros « en volume » — 3 sur 5 : LES CHEVEUX.
   La chevelure est un volume posé autour de la tête (HV.COIFFE), un peu plus gros qu'elle. Une coiffure dit :
   - zone : jusqu'où les cheveux descendent sur le tour de la tête, à chaque hauteur (la ligne des cheveux : le front, la tempe,
     le tour de l'oreille, la nuque) ;
   - frange : le bord de la frange, comme on le voit de face (le même tracé que dans persos.js), posé sur le volume ;
   - meches : des mèches libres, données dans l'espace (devant l'oreille, sur l'épaule…) ;
   - queue : une queue de cheval, une chaîne de points dans l'espace (elle suit la tête avec un peu de retard) ;
   - fils : les séparations des mèches (de face, et sur le côté et l'arrière de la tête).
   À chaque vue on dessine deux masses : celle de derrière (tout le volume des cheveux, avant le visage) et celle de devant
   (la calotte qu'on voit + la frange + les mèches, après le visage).
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, coupe = U.coupe, table = U.table, leve = U.leve, PF = U.PF, PT = U.PT, PC = U.PC;

function rond(y, y0, h){ var k = (y - y0) / h; return Math.sqrt(Math.max(0, 1 - k * k)); }
var T_AH = table([[4, 31.5], [8, 29.6], [12, 25.2], [15, 18.4], [17, 9.4], [18, 0.02]]);
var T_CBH = table([[0, 35.5], [6, 33], [10, 29.6], [14, 23.2], [17, 13], [18, 0.02]]);
function coupeCoiffe(y){
  var a = y <= -12 ? 31.5 * rond(y, -12, 45) : y <= 4 ? 31.5 : T_AH(y);
  var cf = y <= -8 ? 30 * rond(y, -8, 49) : 30;
  var cb = y <= -16 ? 35.5 * rond(y, -16, 41) : y <= 0 ? 35.5 : T_CBH(y);
  return coupe(a, -3, cf, cb, HV.carrure(y), 2);
}
var COIFFE = HV.COIFFE = U.volume(-57, 18, coupeCoiffe);

function lineaire(T){
  return function(y){
    var n = T.length, i;
    if(y <= T[0][0]) return T[0][1];
    if(y >= T[n - 1][0]) return T[n - 1][1];
    for(i = 0; i < n - 1; i++) if(y <= T[i + 1][0]) break;
    return vers(T[i][1], T[i + 1][1], (y - T[i][0]) / (T[i + 1][0] - T[i][0]));
  };
}
/* poser un point de la frange. Passé le bord, la mèche ne s'aplatit pas en un trait : elle garde un peu d'épaisseur et fait le
   tour du bord (une mèche vue par la tranche) */
var HO = 0;      /* (elle baisse la tête, vue de face : la frange descend sur le front — hv-tete.js fait glisser le visage) */
function poseC(x, y, V){
  if(HO) y += HO * U.doux(-42, -28, y);
  var S = COIFFE.a(y, V.w), sg = V.s > 0 ? 1 : V.s < 0 ? -1 : 0, xh = U.xBord(S, V), d = sg * x - xh;
  if(sg && d > 0) return [leve(S, sg * xh, V, true) + sg * 2.6 * Math.sin(Math.PI * Math.min(1, d / 6)) * U.doux(-41, -27, y), y];
  return [leve(S, x, V, true), y];
}
/* un point de la surface de la chevelure : t (degrés autour de la tête, 0 devant), y, r : de combien il s'en écarte → {p : [X, y], vu} */
function surC(td, y, V, r){
  var S = COIFFE.a(y, V.w), t = td * RAD, q = U.point(S, t);
  if(r){ q = [q[0] + r * Math.sin(t), q[1] + r * Math.cos(t)]; }
  return {p:[U.ecranX(q, V), y], vu:U.visible(S, t, V), f:U.fond(q, V)};
}

/* ---------- La calotte : ce qu'on voit des cheveux sur la tête (devant le visage : rien, c'est la « fenêtre » du visage) ---------- */
function calotte(V, zone, y0, y1){
  var rows = [], n = Math.round((y1 - y0) / 2.5), i, y;
  for(i = 0; i <= n; i++){
    y = y0 + (y1 - y0) * i / n;
    var S = COIFFE.a(y, V.w), b = U.bords(S, V), H = U.horizons(S, V), th = zone(y) * RAD, r = {y:y, g:b[0], d:b[1], ig:null, id:null};
    if(th > 0.02){
      var t0 = 0;
      while(t0 - H[2] > Math.PI) t0 -= 2 * Math.PI;
      while(t0 - H[2] < -Math.PI) t0 += 2 * Math.PI;
      var wa = Math.max(H[0], t0 - th), wb = Math.min(H[1], t0 + th);
      if(wb > wa + 1e-4){ r.ig = borne(U.ecranX(U.point(S, wa), V), b[0], b[1]); r.id = borne(U.ecranX(U.point(S, wb), V), b[0], b[1]); }
    }
    rows.push(r);
  }
  var iw = -1;
  for(i = 0; i <= n; i++) if(rows[i].ig !== null){ iw = i; break; }
  var ext = [], k;
  if(iw < 0){
    for(k = n; k >= 0; k--) ext.push([rows[k].g, rows[k].y]);
    for(k = 1; k <= n; k++) ext.push([rows[k].d, rows[k].y]);
    return {d:U.lisse(ext), rows:rows};
  }
  /* de chaque côté de la fenêtre, une « jambe » de cheveux, tant qu'elle a de la largeur */
  var jg = iw - 1, jd = iw - 1;
  for(k = iw; k <= n && rows[k].ig !== null && rows[k].ig - rows[k].g > 0.5; k++) jg = k;
  for(k = iw; k <= n && rows[k].id !== null && rows[k].d - rows[k].id > 0.5; k++) jd = k;
  jg = Math.max(jg, 0); jd = Math.max(jd, 0);
  for(k = jg; k >= 0; k--) ext.push([rows[k].g, rows[k].y]);
  for(k = 1; k <= jd; k++) ext.push([rows[k].d, rows[k].y]);
  var inte = [];
  for(k = jd; k >= iw; k--) inte.push([rows[k].id, rows[k].y]);
  for(k = iw; k <= jg; k++) inte.push([rows[k].ig, rows[k].y]);
  if(inte.length < 2) return {d:U.lisse(ext), rows:rows};
  return {d:'M' + U.pp(ext[0]) + U.courbe(ext, true) + ' L ' + U.pp(inte[0]) + U.courbe(inte, true) + ' Z', rows:rows};
}
/* ---------- La masse de derrière : tout le volume des cheveux (même ce qui est tourné de l'autre côté) ---------- */
function masseDos(V, zone, y0, y1){
  var Gp = [], D = [], n = Math.round((y1 - y0) / 2.5), i, y, t;
  for(i = 0; i <= n; i++){
    y = y0 + (y1 - y0) * i / n;
    var S = COIFFE.a(y, V.w), th = zone(y) * RAD, b = U.bords(S, V), lo, hi;
    if(th < 0.02){ lo = b[0]; hi = b[1]; }
    else {
      lo = 1e9; hi = -1e9;
      for(t = th; t <= 2 * Math.PI - th + 1e-6; t += 0.105){ var X = U.ecranX(U.point(S, t), V); if(X < lo) lo = X; if(X > hi) hi = X; }
      var Xf = U.ecranX(U.point(S, 2 * Math.PI - th), V); if(Xf < lo) lo = Xf; if(Xf > hi) hi = Xf;
      var H = U.horizons(S, V), tD = ((H[1] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), tG = ((H[0] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if(tD >= th && tD <= 2 * Math.PI - th) hi = b[1];
      if(tG >= th && tG <= 2 * Math.PI - th) lo = b[0];
      if(lo > hi){ lo = hi = (b[0] + b[1]) / 2; }
    }
    Gp.push([lo, y]); D.push([hi, y]);
  }
  return U.ferme({G:Gp, D:D});
}

/* ---------- Une chaîne dans l'espace → des points à l'écran ---------- */
function cr3(P, n){
  var r = [], i, j, m = P.length;
  for(i = 0; i < m - 1; i++){
    var a = P[Math.max(i - 1, 0)], b = P[i], c2 = P[i + 1], d = P[Math.min(i + 2, m - 1)];
    for(j = 0; j < n; j++){
      var t = j / n, t2 = t * t, t3 = t2 * t, q = [];
      for(var k = 0; k < 3; k++) q.push(0.5 * (2 * b[k] + (-a[k] + c2[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c2[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c2[k] + d[k]) * t3));
      r.push(q);
    }
  }
  r.push(P[m - 1].slice());
  return r;
}
function ecran3(L, V){ return L.map(function(q){ return [q[0] * V.c + q[2] * V.s, q[1], -q[0] * V.s + q[2] * V.c]; }); }

/* le nœud de la queue de cheval (persos.js, ruban()) */
function noeud(K, x, y, k){
  k = k || 1;
  return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ') scale(' + k + ')"><path d="M0 0 l-9 -5 l1 10 Z M0 0 l9 -5 l-1 10 Z" fill="' + K.u('acc') + '"' + U.c(1.4) + '/><circle r="3" fill="' + K.u('acc') + '"' + U.c(1.2) + '/></g>';
}
/* la bande de lumière sur le crâne (persos.js, eclat() ; elle s'éteint vers le bas) */
function anneau(K, cx, cy, rx, ry, a0, a1, n, h){
  var i, m = 2 * n;
  function Pn(a, d){ return [cx + Math.cos(a * RAD) * (rx - d), cy + Math.sin(a * RAD) * (ry - d)]; }
  var d = 'M' + U.pp(Pn(a0, 0)) + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + U.pp(Pn(a1, 0));
  for(i = m; i >= 0; i--){
    var a = a0 + (a1 - a0) * i / m, t = Math.sin(Math.PI * i / m);
    d += ' L ' + U.pp(Pn(a, (i % 2 ? h * (i % 4 === 1 ? 1 : 0.72) : h * 0.28) * (0.35 + 0.65 * t) + 1.4 * t));
  }
  return '<path d="' + d + ' Z" fill="' + K.u('chevL') + '" opacity=".75"/>';
}

/* ==========================================================
   Les coiffures
   ========================================================== */
var COIFFURES = HV.COIFFURES = {};
COIFFURES.queue = {
  /* (les cheveux passent au-dessus de l'oreille puis derrière elle : elle est dégagée) */
  zone:lineaire([[-57, 0], [-31, 0], [-29, 28], [-26, 46], [-20, 62], [-12, 72], [-7.5, 80], [-5.5, 112], [6, 116], [10, 130], [14, 158], [16.5, 180]]),
  /* la frange, vue de face : son bord du bas (le tracé de persos.js), fermée par le haut du crâne */
  frange:'M44 -42 L 44 -12 L 31 -3 C 28 -12 25 -18 20 -23 C 18 -14 14 -8 8 -4 C 10 -14 8 -22 2 -29 C -4 -19 -12 -13 -22 -10 C -18 -16 -16 -22 -16 -28 C -20 -19 -25 -11 -30 -2 L -44 -12 L -44 -42 Z',
  /* le creux sombre sous la grande mèche */
  creux:['M20 -23 C 18 -14 14 -8 8 -4 C 10 -14 8 -22 2 -29 C 10 -30 16 -28 20 -23 Z'],
  filsFace:[[[-25, -12], [-22, -26], [-12, -40]], [[-14, -13], [-8, -26], [0, -38]], [[9, -8], [13, -22], [10, -36]], [[24, -20], [26, -32], [20, -44]], [[-8, -54], [-18, -46], [-26, -34]], [[16, -53], [25, -46], [30, -36]]],
  /* sur le côté et l'arrière : les cheveux tirés vers la queue de cheval ([degrés autour de la tête, y] ; l'autre côté est en miroir) */
  filsCote:[[[70, -8], [105, -24], [152, -42]], [[60, -23], [100, -37], [146, -49]], [[82, 1], [118, -11], [162, -33]], [[110, 8], [136, -3], [170, -25]], [[36, -41], [88, -48], [140, -53]]],
  /* les deux mèches devant les oreilles : [points dans l'espace x, y, z], largeur */
  meches:[{p:[[-28.5, -12, 6], [-33, 4, 3], [-32.2, 18, 3], [-27, 31, 5.5]], w:8}, {p:[[28.5, -12, 6], [33, 4, 3], [32.2, 18, 3], [27, 31, 5.5]], w:8},
    /* deux petites mèches folles qui cassent le contour du crâne */
    {p:[[-13, -52, 8], [-17.5, -57, 6], [-22.5, -56.6, 4]], w:3.4}, {p:[[11, -55, 2], [10.5, -60, 0], [7, -62, -2]], w:3.2}],
  /* la queue de cheval : attachée haut derrière la tête */
  queue:{p:[[3, -51, -21], [9, -65, -33], [13, -51, -47], [13, -16, -50], [10, 22, -44], [13, 66, -38]],
    larg:table([[0, 4.4], [0.1, 6.4], [0.28, 7.4], [0.6, 6.4], [0.85, 3.9], [1, 0.3]]),
    brin:{de:0.34, p:[[19, 8, -48], [23, 46, -41]], w:4.2}}
};

/* ==========================================================
   HV.cheveux(K, coif, V, P) → {dos, devant, ombre}  (P : {qx, qz : le balancement du bout de la queue de cheval})
   ========================================================== */
HV.cheveux = function(K, coif, V, P){
  P = P || {};
  var dos = '', L = [], fils = '', i, sg = V.s >= 0 ? 1 : -1, face = V.c > -0.3;
  HO = borne((P.hocheF || 0) * 0.16, -3, 5);
  /* --- la queue de cheval --- */
  var Q = coif.queue, queue = '';
  if(Q){
    var C3 = cr3(Q.p, 7), nq = C3.length - 1, qx = P.qx || 0, qz = P.qz || 0;
    C3.forEach(function(q, j){ var k = Math.pow(j / nq, 1.6); q[0] += qx * k; q[2] += qz * k; q[1] -= (Math.abs(qx) + Math.abs(qz)) * 0.12 * k; });
    /* (une chaîne de gélules, comme la queue de Mimi : vue par le bout, elle reste ronde) */
    var E = ecran3(C3, V), Lq = [U.ruban(E, function(t){ return Q.larg(t); })], jq;
    for(jq = 0; jq < nq - 1; jq++) Lq.push(U.gelule(E[jq][0], E[jq][1], Q.larg(jq / nq) - 0.25, E[jq + 1][0], E[jq + 1][1], Q.larg((jq + 1) / nq) - 0.25));
    if(Q.brin){
      var i0 = Math.round(Q.brin.de * nq), B3 = cr3([C3[i0]].concat(Q.brin.p.map(function(q){ return [q[0] + qx * 0.8, q[1], q[2] + qz * 0.8]; })), 5);
      Lq.push(U.meche(ecran3(B3, V), Q.brin.w * 2, 0.8, 0.3));
    }
    queue += U.masse(Lq, K.u('chevQ'));
    /* ses fils, sa lumière */
    var nrm = function(j, k){ var a = E[Math.max(j - 1, 0)], z = E[Math.min(j + 1, nq)], dx = z[0] - a[0], dy = z[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = Q.larg(j / nq) * k; return [E[j][0] - dy / l * w, E[j][1] + dx / l * w]; };
    var f1q = [], f2q = [], lum = [];
    for(i = 2; i < nq - 1; i++){ f1q.push(nrm(i, 0.42)); if(i > 4) f2q.push(nrm(i, -0.38)); if(i > 2 && i < nq - 5) lum.push(nrm(i, sg * 0.62 * (E[i][0] > E[0][0] ? 1 : 1))); }
    /* (vue par le bout, la queue est trop courte à l'écran pour ses fils) */
    var longQ = Math.abs(E[nq][0] - E[0][0]) + Math.abs(E[nq][1] - E[Math.round(nq * 0.2)][1]), opQ = U.doux(70, 110, longQ);
    if(opQ > 0.02){
      queue += '<g fill="' + K.chev.c[2] + '" opacity="' + f1(0.42 * opQ) + '">' + PF(U.filet(f1q, 1.6), K.chev.c[2]) + PF(U.filet(f2q, 1.5), K.chev.c[2]) + '</g>';
      queue += PF(U.filet(lum, 2), K.chev.hl, ' opacity="' + f1(0.4 * opQ) + '"');
    }
    queue += noeud(K, E[0][0], E[0][1] + 1, 0.92);
  }
  var zq = Q ? -Q.p[2][0] * V.s + Q.p[2][2] * V.c : -1;
  /* --- la masse de derrière --- */
  var masse = U.masse([masseDos(V, coif.zone, -57, 18)], K.u('chevB'));
  /* --- les mèches libres : devant si elles sont de notre côté, sinon derrière le visage --- */
  var mDos = [], mDev = [];
  (coif.meches || []).forEach(function(m){
    var C3m = cr3(m.p.map(function(q, j){ var k = Math.pow(j / (m.p.length - 1), 1.5) * 0.22; return [q[0] + (P.qx || 0) * k, q[1], q[2] + (P.qz || 0) * k]; }), 5), Em = ecran3(C3m, V), mil = Em[Math.floor(Em.length / 2)], d = U.meche(Em, m.w, 0.9, 0.3);
    var trait = PF(U.filet(Em.slice(2, Em.length - 3).map(function(p){ return [p[0] + 0.6, p[1]]; }), 1.2), K.chev.c[2], ' opacity=".4"');
    if(mil[2] > -1){ mDev.push(d); fils += trait; } else mDos.push(d);
  });
  dos += masse + (mDos.length ? U.masse(mDos, K.u('chevU')) : '');
  /* --- la masse de devant : la calotte, la frange, les mèches --- */
  var cal = calotte(V, coif.zone, -57, 18);
  L.push(cal.d);
  var ombre = '';
  if(coif.frange && face){
    var fr = U.points(coif.frange, 9).map(function(sp){ return U.poly(U.coupeBord(sp, COIFFE, V, 6).map(function(p){ return poseC(p[0], p[1], V); })); }).join(' ');
    L.push(fr); ombre = fr;
  }
  L = L.concat(mDev);
  if(mDev.length) ombre += ' ' + mDev.join(' ');
  var cid = K.n('chv'), dev = U.masse(L, K.u('chevU'));
  dev += '<clipPath id="' + cid + '">' + L.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</clipPath>';
  var dans = '';
  if(face){
    (coif.creux || []).forEach(function(d){ dans += PF(U.points(d, 8).map(function(sp){ return U.poly(U.coupeBord(sp, COIFFE, V).map(function(p){ return poseC(p[0], p[1], V); })); }).join(' '), K.chev.c[2], ' opacity=".3"'); });
    var ff = '';
    (coif.filsFace || []).forEach(function(t){
      var pts = U.ech(t, 7), vus = pts.filter(function(p){ return !U.cache(COIFFE.a(p[1], V.w), p[0], V); });
      if(vus.length >= 5) ff += '<path d="' + U.filet(vus.map(function(p){ return poseC(p[0], p[1], V); }), 1.5) + '"/>';
    });
    dans += '<g fill="' + K.chev.c[2] + '" opacity=".45">' + ff + '</g>';
  }
  /* les fils du côté et de l'arrière : seulement la partie tournée vers nous */
  var fc = '';
  (coif.filsCote || []).forEach(function(t){
    [1, -1].forEach(function(d){
      var pts = U.ech(t, 10), run = [];
      function vider(){ if(run.length >= 4) fc += '<path d="' + U.filet(run, 1.5) + '"/>'; run = []; }
      pts.forEach(function(p){ var q = surC(p[0] * d, p[1], V); if(q.vu) run.push(q.p); else vider(); });
      vider();
    });
  });
  dans += '<g fill="' + K.chev.c[2] + '" opacity=".4">' + fc + '</g>';
  /* la lumière : elle ne tourne pas avec la tête (elle reste en haut à gauche) ; elle suit seulement le milieu du crâne */
  var bm = U.bords(COIFFE.a(-26, V.w), V), cx = (bm[0] + bm[1]) / 2, kx = (bm[1] - bm[0]) / 63;
  dans += '<g transform="translate(' + f1(cx + 1) + ' 0) scale(' + f1(kx) + ' 1)">' + anneau(K, 0, -26, 26, 25, 208, 332, 6, 5.5) + '</g>';
  dev += '<g clip-path="url(#' + cid + ')">' + dans + '</g>' + fils;
  /* un liseré de lumière sur le haut du crâne, à gauche */
  var lis = [];
  cal.rows.forEach(function(r){ if(r.y > -52 && r.y < -22) lis.push([r.g + 2.6, r.y]); });
  if(lis.length > 3) dev += PT(U.courbe(lis.reverse()), K.chev.hl, 1.6, ' opacity=".5"');
  /* La queue de cheval est attachée derrière la tête : elle ne passe devant (la tête, le dos, les bras) que si on la voit de dos.
     De face et de profil, elle est derrière tout le reste (Romain, 23 novembre, 13 h 36 : « on voit un bout de sa tresse devant
     le bras, alors que normalement la tresse est censée être derrière »). */
  return {queue:queue, queueDevant:zq > 6 && V.c < -0.3, dos:dos, devant:dev, ombre:ombre};
};
})(window);
