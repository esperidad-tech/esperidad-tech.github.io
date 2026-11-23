/* ==========================================================
   Les héros « en volume » — 4 sur 5 : LE CORPS (le buste et la tunique, les bras, les mains, les jambes, la ceinture, le baudrier,
   le carquois, l'arc). Les mesures sont celles de persos.js : le cadre 300 × 440, le milieu à x = 150, le sol à y = 414.
   Ici x est compté depuis le milieu du héros (x > 0 : SA gauche, donc la droite de l'écran quand il est de face), z vers l'avant.

   LE CORPS SE PLIE (Romain, 23 novembre, 11 h 22 et 12 h 39 : « des poses accroupies, les deux mains posées au sol, avec la
   pliure du corps logique » ; « go pour le corps qui se plie et les mains »).
   - LE TRONC est une chaîne, comme le corps de Mimi : le bassin (où il est, comment il penche), puis le dos qui se courbe peu à
     peu jusqu'aux épaules (en avant, sur le côté, en vrille). À chaque hauteur du buste « au repos » (y de 137 à 272), on sait où
     est passée sa coupe et comment elle est tournée (tronc().fr). Le bas de la tunique suit les cuisses : il se drape dessus.
   - Le contour du buste : la réunion des coupes vues sous l'angle voulu (des « coques » qui se chevauchent, coques()). C'est
     exact debout, penché, accroupi, vu de face comme de profil — aucune image n'est tournée ni écrasée.
   - Tout ce qui est SUR le buste (la ceinture, le baudrier, le col, les plis, les coutures) est posé sur ces coupes (T.pt, T.face,
     T.anneau) : il suit donc la pliure. Les épaules, les hanches, le cou, le carquois sont accrochés au tronc.
   - Les bras et les jambes : des os dans l'espace (épaule, coude, poignet ; hanche, genou, cheville). On dit où poser la main
     ou le pied, le coude et le genou se placent tout seuls (ik3). Le bassin descend, les pieds restent au sol.
   - Ce qui est près du sol est vu d'un peu au-dessus (ksol) : une main posée devant les pieds est plus bas à l'écran.
   - LA TUNIQUE EST D'UN SEUL TENANT (Romain, 23 novembre, 11 h : « que le bras soit intégré dans l'épaule […] un tout petit peu
     moins pantin ») : le buste et les manches ont UN seul contour et la même couleur.
   - Ce qui est d'un seul côté (l'arc dans SA main droite, le carquois sur SON épaule gauche, le baudrier en travers) reste de
     son côté quand le héros se tourne.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, doux = U.doux, coupe = U.coupe, table = U.table, PF = U.PF, PT = U.PT, PC = U.PC, gelule = U.gelule;
var ANNEAU = 0.2;      /* ce qui est 10 plus près de nous est 2 plus bas à l'écran (les anneaux du buste) */
var PSOL = 0.13;       /* près du sol : ce qui est 10 plus près de nous est 1,3 plus bas (les pieds, les mains posées, un genou à terre) */
var SOL = 414, TAU = Math.PI * 2, Z3 = [0, 0, 0];

/* ---------- Le buste et la tunique (fille) : ses coupes, debout ---------- */
var T_A = table([[137, 12], [139, 22.5], [142, 29.5], [146, 33.5], [152, 34], [165, 32.5], [180, 30], [200, 28.5], [208, 29], [222, 32.5], [246, 40], [272, 47.5]]);
var T_F = table([[137, 9.5], [139, 11.5], [142, 13.5], [146, 15.5], [152, 18], [165, 20], [180, 18.5], [200, 16.5], [208, 17], [222, 19.5], [246, 24.5], [272, 30]]);
var T_B = table([[137, 9.5], [139, 11], [142, 13], [146, 14.5], [152, 15.5], [165, 16], [180, 15.5], [200, 14.5], [208, 15], [222, 18.5], [246, 23.5], [272, 28.5]]);
var BUSTE = HV.BUSTE = U.volume(137, 272, function(y){ return coupe(T_A(y), 0, T_F(y), T_B(y), 2.3, 2.3); });

/* ---------- Les vecteurs, les rotations ---------- */
function add(a, b, k){ k = k == null ? 1 : k; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
function sub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function mul(a, k){ return [a[0] * k, a[1] * k, a[2] * k]; }
function lon(a){ return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
function uni(a){ var l = lon(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function dot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function croix(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function mixv(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function mv(M, v){ return [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]]; }
function mm(A, B){ var R = [], i, j; for(i = 0; i < 3; i++) for(j = 0; j < 3; j++) R.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return R; }
var ID = [1, 0, 0, 0, 1, 0, 0, 0, 1];
/* se pencher en avant (a > 0 : le haut part vers l'avant) ; sur le côté (a > 0 : vers SA gauche) ; se tourner (comme cap) */
function RX(d){ if(!d) return ID; var a = d * RAD, c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, s, 0, -s, c]; }
function RZ(d){ if(!d) return ID; var a = d * RAD, c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
function RY(d){ if(!d) return ID; var a = d * RAD, c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
/* tourner d'un angle (radians) autour d'un axe */
function rotAxe(k, a){
  var c = Math.cos(a), s = Math.sin(a), t = 1 - c, x = k[0], y = k[1], z = k[2];
  return [c + t * x * x, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, c + t * y * y, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, c + t * z * z];
}
/* deux os (l1, l2) de l'attache A à la cible T ; pole : de quel côté va l'articulation → [l'articulation, le bout] */
function ik3(A, T, l1, l2, pole){
  var d = sub(T, A), dist = borne(lon(d), Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.3), u = uni(d);
  var a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  var n = sub(pole, [u[0] * dot(pole, u), u[1] * dot(pole, u), u[2] * dot(pole, u)]);
  n = uni(lon(n) < 0.001 ? [0, 0, 1] : n);
  return [add(add(A, u, a), n, h), add(A, u, dist)];
}
HV.ik3 = ik3;

/* Un point du héros → l'écran : [X, Y, sa profondeur (plus grand : plus près de nous)].
   Ce qui est haut est vu à l'horizontale ; ce qui est près du sol, d'un peu au-dessus (comme les pieds depuis le début). */
function ksol(y){ return PSOL * doux(250, 400, y); }
function pj(q, V){ var d = -q[0] * V.s + q[2] * V.c; return [q[0] * V.c + q[2] * V.s, q[1] + ksol(q[1]) * d, d]; }
function d2(a, b){ var x = b[0] - a[0], y = b[1] - a[1]; return Math.sqrt(x * x + y * y); }

/* l'enveloppe d'un nuage de points (un polygone bombé) */
function enveloppe(P){
  P = P.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
  var n = P.length, H = [], i, k = 0, t;
  function cr(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  for(i = 0; i < n; i++){ while(k >= 2 && cr(H[k - 2], H[k - 1], P[i]) <= 0) k--; H[k++] = P[i]; }
  for(i = n - 2, t = k + 1; i >= 0; i--){ while(k >= t && cr(H[k - 2], H[k - 1], P[i]) <= 0) k--; H[k++] = P[i]; }
  H.length = k - 1;
  return H;
}
/* vers où est tournée la surface d'une coupe en ce point de son tour ([x, z]) */
function normale(S, q){
  var x = q[0], zr = q[1] - S.zm, av = zr >= 0, cc = av ? S.cf : S.cb, p = av ? S.pf : S.pb;
  return [(x < 0 ? -1 : 1) * Math.pow(Math.abs(x) / S.a, p - 1) / S.a, (av ? 1 : -1) * Math.pow(Math.abs(zr) / cc, p - 1) / cc];
}

/* ==========================================================
   LE TRONC : où est passée chaque coupe du buste, et comment elle est tournée.
   P.bas [x, y, z] : le bassin se déplace (y > 0 : il descend) ; P.bang [avant, côté, vrille] : il penche (degrés) ;
   P.dos [avant, côté, vrille] : le dos se courbe, de la taille aux épaules.
   Les coupes sont gardées tous les 3 de hauteur : y = 137 + 3 i (i = 0 : la base du cou ; 36 : le bassin ; 45 : le bas de la tunique).
   ========================================================== */
var PAS = 3, Y0 = 137, NF = 45, IP = 36;
function tronc(V, P){
  var bas = P.bas || Z3, ba = P.bang || Z3, ds = P.dos || Z3, so = (P.souffle || 0) * 1.3;
  var Mp = mm(RY(ba[2]), mm(RX(ba[0]), RZ(ba[1])));
  var T = {V:V, Mp:Mp, Pc:[bas[0] + (P.bx || 0), 245 + bas[1], bas[2]], C:[], M:[], jx:P.jx || 0};
  var droit = !ds[0] && !ds[1] && !ds[2], i, y;
  function Ms(yy){ var f = 1 - doux(160, 232, yy); return droit || f <= 0 ? Mp : mm(Mp, mm(RY(ds[2] * f), mm(RX(ds[0] * f), RZ(ds[1] * f)))); }
  T.C[IP] = T.Pc; T.M[IP] = Mp;
  for(i = IP - 1; i >= 0; i--){
    y = Y0 + PAS * i;
    T.M[i] = Ms(y);
    T.C[i] = add(T.C[i + 1], mv(Ms(y + PAS / 2), [0, -PAS, 0]));
  }
  /* elle respire : la poitrine monte un peu, le bassin ne bouge pas */
  if(so) for(i = 0; i < IP; i++) T.C[i] = [T.C[i][0], T.C[i][1] - so * (1 - doux(150, 240, Y0 + PAS * i)), T.C[i][2]];
  /* (en attendant les cuisses : le bas de la tunique tombe droit sous le bassin) */
  for(i = IP + 1; i <= NF; i++){ T.M[i] = Mp; T.C[i] = add(T.C[i - 1], mv(Mp, [0, PAS, 0])); }
  /* LE BAS DE LA TUNIQUE EN QUATRE PANS (draper()) : le devant de SON côté droit, le devant de SON côté gauche, le dos à droite,
     le dos à gauche. Chaque pan suit la cuisse qui est dessous ; un point du bas de la tunique est le mélange des quatre, selon
     où il est sur le tour (devant / derrière, à droite / à gauche). Au repos les quatre sont les mêmes. */
  T.pans = {fG:{C:T.C, M:T.M}, fD:{C:T.C, M:T.M}, bG:{C:T.C, M:T.M}, bD:{C:T.C, M:T.M}, g:{C:T.C, M:T.M}};
  function cadre(C, Mx, yy){
    var u = borne((yy - Y0) / PAS, 0, NF), k = Math.min(NF - 1, Math.floor(u)), t = u - k, A = C[k], B = C[k + 1], Ma = Mx[k], Mb = Mx[k + 1];
    if(t < 1e-6) return {C:A, M:Ma};
    return {C:mixv(A, B, t), M:Ma === Mb ? Ma : Ma.map(function(v, j){ return v + (Mb[j] - v) * t; })};
  }
  /* la coupe à la hauteur y : {C : son milieu, M : comment elle est tournée} (sous le bassin : la moyenne des quatre pans) */
  T.fr = function(yy){
    if(yy <= 245 || !T.drape) return cadre(T.C, T.M, yy);
    var R = {C:[0, 0, 0], M:[0, 0, 0, 0, 0, 0, 0, 0, 0]};
    ['fG', 'fD', 'bG', 'bD', 'g'].forEach(function(v){ var f = cadre(T.pans[v].C, T.pans[v].M, yy), j; for(j = 0; j < 3; j++) R.C[j] += f.C[j] / 5; for(j = 0; j < 9; j++) R.M[j] += f.M[j] / 5; });
    return R;
  };
  T.frPan = function(v, yy){ return cadre(T.pans[v].C, T.pans[v].M, yy); };
  /* un point donné dans les mesures du héros debout → où il est passé (il suit la coupe de sa hauteur) */
  T.lieu = function(q){ var yy = borne(q[1], Y0, Y0 + PAS * NF), fr = T.fr(yy); return add(fr.C, mv(fr.M, [q[0], q[1] - yy, q[2]])); };
  /* le même, accroché à la poitrine d'un seul bloc (les épaules, le carquois, les mains « qui suivent ») */
  T.Mb = T.M[5]; T.Cb = T.C[5];
  T.buste = function(q){ return add(T.Cb, mv(T.Mb, [q[0], q[1] - 152, q[2]])); };
  T.dB = -T.Cb[0] * V.s + T.Cb[2] * V.c;       /* la profondeur de la poitrine */
  /* un point de la surface : y, q = [x, z] dans sa coupe ; nrm : pour savoir s'il est tourné vers nous → {p : [X, Y], f, vu} */
  T.sur = function(yy, q, nrm, fr){
    var w, n = null, Cc;
    if(yy > 245 && T.drape){
      /* sous le bassin : le mélange des quatre pans, selon où est le point (devant / derrière, SA droite / SA gauche) */
      var S = BUSTE.a(yy, 1), zr = q[1] - S.zm, l = Math.sqrt(q[0] * q[0] + zr * zr) || 1;
      var wf = doux(-0.35, 0.35, zr / l), wd = doux(-0.45 * S.a, 0.45 * S.a, q[0]), wc = 1 - doux(0.12 * S.a, 0.5 * S.a, Math.abs(q[0]));
      /* (le milieu du devant tombe entre les cuisses : il prend le pan « g ») */
      var P4 = {fG:wf * (1 - wc) * (1 - wd), fD:wf * (1 - wc) * wd, g:wf * wc, bG:(1 - wf) * (1 - wd), bD:(1 - wf) * wd};
      w = [0, 0, 0]; Cc = [0, 0, 0]; if(nrm) n = [0, 0, 0];
      for(var v in P4){
        if(P4[v] < 1e-4) continue;
        var f = T.frPan(v, yy), pw = add(f.C, mv(f.M, [q[0], 0, q[1]]));
        w = add(w, pw, P4[v]); Cc = add(Cc, f.C, P4[v]);
        if(nrm) n = add(n, mv(f.M, [nrm[0], 0, nrm[1]]), P4[v]);
      }
    } else {
      fr = fr || T.fr(yy);
      w = add(fr.C, mv(fr.M, [q[0], 0, q[1]])); Cc = fr.C;
      if(nrm) n = mv(fr.M, [nrm[0], 0, nrm[1]]);
    }
    var p = pj(w, V), dc = -Cc[0] * V.s + Cc[2] * V.c, k = (yy - 214) / 58;
    var o = {p:[p[0] + (k > 0 ? T.jx * k * k : 0), p[1] + ANNEAU * (p[2] - dc)], f:p[2], w:w};
    /* (vu : tourné vers nous ; fa : de combien, de 0 au bord à 1 en face) */
    if(n){ var fa = (-n[0] * V.s + n[2] * V.c) - ANNEAU * n[1]; o.vu = fa > 0; o.fa = fa / (lon(n) || 1); }
    return o;
  };
  /* un point du tour du buste : az (radians ; 0 : devant, +90° : SA gauche), y */
  T.pt = function(az, yy){ var S = BUSTE.a(yy, 1), q = U.point(S, az); return T.sur(yy, q, normale(S, q)); };
  /* un point donné de face (x compté depuis le milieu, y), devant ou derrière (dos) */
  T.face = function(x, yy, dos){
    var S = BUSTE.a(yy, 1), a = S.a, xx = borne(x, -a * 0.999, a * 0.999), p = dos ? S.pb : S.pf;
    var q = [xx, S.zm + (dos ? -S.cb : S.cf) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(xx) / a, p)), 1 / p)];
    return T.sur(yy, q, normale(S, q));
  };
  /* un trait donné de face → les morceaux qu'on en voit, posés */
  T.traits = function(pts, dos){
    var R = [], run = [];
    pts.forEach(function(q){ var o = T.face(q[0], q[1], dos); if(o.vu) run.push(o.p); else { if(run.length > 1) R.push(run); run = []; } });
    if(run.length > 1) R.push(run);
    return R;
  };
  /* tout le tour d'une coupe, à l'écran (n points) */
  T.cercle = function(yy, n, prof){
    var S = BUSTE.a(yy, 1), fr = yy > 245 && T.drape ? null : T.fr(yy), r = [], j;
    /* (r.f : la profondeur de chaque point de l'anneau) */
    r.f = [];
    for(j = 0; j < n; j++){ var o = T.sur(yy, U.point(S, TAU * j / n), null, fr); r.push(o.p); r.f.push(o.f); if(prof) prof.push([o.p[0], o.p[1], o.f]); }
    /* (pour savoir ce qui est devant ou derrière : aussi des points à l'intérieur de la coupe, à mi-chemin et au milieu) */
    if(prof){
      for(j = 0; j < 8; j++){ var q = U.point(S, TAU * j / 8), o2 = T.sur(yy, [q[0] * 0.5, S.zm + (q[1] - S.zm) * 0.5], null, fr); prof.push([o2.p[0], o2.p[1], o2.f]); }
      var o3 = T.sur(yy, [0, S.zm], null, fr); prof.push([o3.p[0], o3.p[1], o3.f]);
    }
    return r;
  };
  /* un anneau autour du buste à la hauteur y : la partie tournée vers nous, de SA droite à SA gauche → [[X, Y]…] */
  T.anneau = function(yy, n){
    var S = BUSTE.a(yy, 1), fr = yy > 245 && T.drape ? null : T.fr(yy), NK = 24, vis = [], a0 = null, a1 = null, j, r = [];
    function vu(a){ var q = U.point(S, a); return T.sur(yy, q, normale(S, q), fr).vu; }
    function ang(k){ return -Math.PI + TAU * k / NK; }
    function bord(k){ var lo = ang(k), hi = lo + TAU / NK, va = vis[k], m, it; for(it = 0; it < 8; it++){ m = (lo + hi) / 2; if(vu(m) === va) lo = m; else hi = m; } return (lo + hi) / 2; }
    var nv = 0;
    for(j = 0; j < NK; j++){ vis.push(vu(ang(j))); if(vis[j]) nv++; }
    if(!nv) return r;
    if(nv === NK){ a0 = -Math.PI; a1 = Math.PI; }
    else {
      for(j = 0; j < NK; j++){ var j2 = (j + 1) % NK; if(!vis[j] && vis[j2]) a0 = bord(j); if(vis[j] && !vis[j2]) a1 = bord(j); }
      if(a0 === null || a1 === null) return r;
      while(a1 < a0) a1 += TAU;
    }
    n = n || 12;
    for(j = 0; j <= n; j++) r.push(T.sur(yy, U.point(S, a0 + (a1 - a0) * j / n), null, fr).p);
    return r;
  };
  /* le contour : dix « coques » qui se chevauchent, du cou au bas de la tunique → [{d, y0, y1}…] */
  T.coques = function(){
    if(T._cq) return T._cq;
    var NS = 40, R = [], L = [], k, j;
    /* (T.prof : des points de la surface, avec leur profondeur, pour la poitrine (jusqu'à la ceinture) et pour la jupe) */
    T.prof = {haut:[], jupe:[]};
    for(j = 0; j <= NS; j++){ var yy = 137 + 135 * j / NS, ring = T.cercle(yy, 24, yy <= YJ + 0.1 ? T.prof.haut : T.prof.jupe); ring.y = yy; R.push(ring); }
    for(k = 0; k < NS; k += 4){ var pts = []; for(j = k; j <= k + 4; j++) pts = pts.concat(R[j]); L.push({d:U.poly(enveloppe(pts)), y0:R[k].y, y1:R[k + 4].y}); }
    T.tours = R;
    return (T._cq = L);
  };
  /* Ce point (X, Y à l'écran, sa profondeur d, l'épaisseur r du membre) est-il devant (1) ou derrière (-1) cette partie du buste
     ('haut' : la poitrine ; 'jupe' : le bas de la tunique) ? 0 : ils ne se recouvrent pas à l'écran. */
  T.devant = function(X, Y, d, r, part){
    T.coques();
    var L = T.prof[part], best = -1e9, i, R2 = 64;
    for(i = 0; i < L.length; i++){ var dx = L[i][0] - X, dy = L[i][1] - Y; if(dx * dx + dy * dy < R2 && L[i][2] > best) best = L[i][2]; }
    if(best < -1e8) return 0;
    return d + r >= best - 1 ? 1 : -1;
  };
  return T;
}
var YJ = 204.5;      /* où la poitrine s'arrête et où commence la jupe (sous la ceinture, qui cache la jointure) */
/* Un membre (une suite de points dans l'espace et son épaisseur) : devant ou derrière la poitrine, et la jupe ?
   → {haut, jupe} : 1 devant, -1 derrière, 0 ils ne se recouvrent pas. On vote sur plusieurs points du membre. */
function cote3(T, pts, r){
  var R = {haut:0, jupe:0};
  ['haut', 'jupe'].forEach(function(part){
    var s = 0;
    pts.forEach(function(q){ var p = pj(q, T.V); s += T.devant(p[0], p[1], p[2], r, part); });
    R[part] = s > 0 ? 1 : s < 0 ? -1 : 0;
  });
  return R;
}
/* LE BAS DE LA TUNIQUE SE POSE SUR LES CUISSES (Romain, 23 novembre, 13 h 36 : « on est censé la voir, la jambe droite »).
   Chaque pan suit la cuisse qui est dessous : le devant de SON côté droit se pose sur SA cuisse droite levée (et la cuisse
   ressort au bas de la tunique), le dos suit une cuisse qui part en arrière ; sinon le pan tombe. dc : la direction de la cuisse. */
function draper(T, dcG, dcD){
  var M = T.Mp, i;
  function angles(dc){
    /* (la cuisse vue depuis le bassin : vers SON côté, vers le bas, vers l'avant) */
    var s = M[0] * dc[0] + M[3] * dc[1] + M[6] * dc[2], d = M[1] * dc[0] + M[4] * dc[1] + M[7] * dc[2], f = M[2] * dc[0] + M[5] * dc[1] + M[8] * dc[2];
    var al = Math.atan2(f, d) / RAD;
    if(al < -120) al += 360;           /* (un genou levé plus haut que la hanche : c'est encore « vers l'avant ») */
    return {al:al, be:Math.asin(borne(s, -1, 1)) / RAD};
  }
  var A = {G:angles(dcG), D:angles(dcD)}, Gr = angles([0, 1, 0]);      /* (Gr : le bas du monde, vu depuis le bassin : la pesanteur) */
  Gr.al *= 0.85; Gr.be *= 0.6;
  function pan(al, be){
    var C = T.C.slice(0, IP + 1), Mx = T.M.slice(0, IP + 1);
    function Mj(y){ var t = doux(245, 272, y); return mm(M, mm(RX(-al * t), RZ(-be * t))); }
    for(i = IP + 1; i <= NF; i++){ var y = Y0 + PAS * i; Mx[i] = Mj(y); C[i] = add(C[i - 1], mv(Mj(y - PAS / 2), [0, PAS, 0])); }
    return {C:C, M:Mx};
  }
  /* Devant : le pan se pose sur la cuisse si elle est plus en avant que la pesanteur (jusqu'à 150° : accroupie, la cuisse
     remonte) ; sinon il tombe. Derrière : il suit une cuisse qui part plus en arrière que la pesanteur ; sinon il tombe (Romain :
     « la logique » — une tunique ne reste pas raide en l'air quand elle se penche). Sur le côté, le pan s'écarte avec la cuisse.
     g : le tissu qui tombe, tout simplement (le milieu du devant, entre les cuisses). */
  function be(s){ return borne(A[s].be * 0.75 + Gr.be * 0.4, -40, 40); }
  T.pans = {
    fG:pan(borne(Math.max(A.G.al * 0.94, Gr.al), -60, 150), be('G')),
    fD:pan(borne(Math.max(A.D.al * 0.94, Gr.al), -60, 150), be('D')),
    bG:pan(borne(Math.min(A.G.al * 0.85, Gr.al), -70, 90), be('G')),
    bD:pan(borne(Math.min(A.D.al * 0.85, Gr.al), -70, 90), be('D')),
    g:pan(borne(Gr.al, -70, 90), borne(Gr.be, -40, 40))
  };
  T.drape = true; T._cq = null;
}
function couture(d, op){ return d ? '<path d="' + d + '" stroke="#f3d6a4" stroke-width=".9" fill="none" stroke-dasharray="2.6 2.4" stroke-linecap="round" opacity="' + (op || 0.55) + '"/>' : ''; }
function st(o, c1, a){ return '<stop offset="' + o + '" stop-color="' + c1 + '"' + (a == null ? '' : ' stop-opacity="' + a + '"') + '/>'; }
function degU(id, x1, y1, x2, y2, stops){ return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '">' + stops + '</linearGradient>'; }

/* le relief d'un os : un dégradé en travers de lui (la lumière vient d'en haut à gauche), quel que soit son sens */
function relief(K, nom, x0, y0, x1, y1, r){
  var nx = -(y1 - y0), ny = x1 - x0, l = Math.sqrt(nx * nx + ny * ny) || 1, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  nx /= l; ny /= l;
  if(nx + 0.35 * ny < 0){ nx = -nx; ny = -ny; }
  return degU(K.n(nom), mx - nx * r, my - ny * r, mx + nx * r, my + ny * r, st(0, '#000', 0.2) + st(0.26, '#fff', 0.16) + st(0.6, '#000', 0.03) + st(1, '#000', 0.4));
}

/* ---------- Un bras (cote : -1, SON bras droit, celui de l'arc ; 1 : SON bras gauche) : sa forme ----------
   P.mainG / mainD : où est le poignet ; P.relG / relD : 1, la main suit le buste quand il se penche (les mesures sont celles du
   héros debout) ; 0, elle est là où on le dit (posée au sol, sur un genou). P.mdirG / mdirD : vers où pointent les doigts
   ([0, 0, 0] : dans le prolongement de l'avant-bras). */
var R_EP = 10.6, R_CO = 9.3, R_PO = 8.3, LIBRE = 0.36;
/* (la main en visière : où est le poignet par rapport au centre de la tête, tête droite — à gauche du front, devant, au-dessus des
   sourcils) */
HV.VISIERE = [22, -46, 32];
function bras(V, cote, P, T){
  var cle = cote < 0 ? 'G' : 'D', Ep = T.buste([cote * 31.5, 151, 0]);
  var rel = P['rel' + cle]; if(rel == null) rel = 1;
  var Wa = P['main' + cle] || [cote * 50.5, 243, 4], pa = P['coude' + cle] || [cote * 0.7, -0.1, -0.7], mdL = P['mdir' + cle], pcL = P['pouce' + cle];
  /* LA MAIN EN VISIÈRE (P.visiere, de 0 à 1, SA main gauche) : la main à plat au-dessus des yeux, comme une casquette, et elle suit
     la tête quand elle tourne (Romain, 16 h 39 : « elle passe derrière la tête, elle passe devant la tête […] la main, elle doit être
     placée plate […] comme une casquette devant les yeux ») */
  var vi = cle === 'D' ? borne(P.visiere || 0, 0, 1) : 0;
  if(vi > 0){
    var ty = (P.tete || 0) * RAD, cy = Math.cos(ty), sy = Math.sin(ty);
    var ry = function(v){ return [v[0] * cy + v[2] * sy, v[1], -v[0] * sy + v[2] * cy]; };
    Wa = mixv(Wa, add([0, 116, -2], ry(HV.VISIERE)), vi); pa = mixv(pa, ry([1, 0.4, -0.1]), vi); rel = rel + (1 - rel) * vi;
    mdL = mixv(mdL || [0, 0, 0], ry([-1, 0.04, 0.18]), vi); pcL = mixv(pcL || [-0.25, 0.1, 1], ry([0, 0.5, -1]), vi);
  }
  var Wc = rel > 0 ? mixv(Wa, T.buste(Wa), rel) : Wa, pole = rel > 0 ? mixv(pa, mv(T.Mb, pa), rel) : pa;
  var J = ik3(Ep, Wc, 50, 43, pole), El = J[0], W = J[1], da = uni(sub(W, El));
  /* (une main qui suit le buste tourne AVEC lui : vers où pointent ses doigts, son pouce, l'arc qu'elle tient — Romain, 23 novembre,
     16 h 39 : « l'arc est à l'envers » quand elle s'était tournée pour viser) */
  function tourne(v){ return rel > 0 && v ? mixv(v, mv(T.Mb, v), rel) : v; }
  var md = tourne(mdL || Z3), lm = lon(md), dir = lm < 0.02 ? da : uni(add(mul(da, Math.max(0, 1 - lm)), md)), M = add(W, dir, 17);
  var e = pj(Ep, V), c2 = pj(El, V), w = pj(W, V), m = pj(M, V);
  var a = [vers(e[0], c2[0], LIBRE), vers(e[1], c2[1], LIBRE)], ra = vers(R_EP, R_CO, LIBRE);
  var bas = gelule(c2[0], c2[1], R_CO, w[0], w[1], R_PO);
  return {cote:cote, cle:cle, e:e, c2:c2, w:w, m:m, W:W, El:El, Ep:Ep, dir:dir, da:da, a:a, ra:ra, tourne:tourne, pouce:pcL, fond:(e[2] - T.dB) + (c2[2] - T.dB) * 0.5,
    manche:[gelule(e[0], e[1], R_EP, c2[0], c2[1], R_CO), bas],                 /* toute la manche */
    libre:[gelule(a[0], a[1], ra, c2[0], c2[1], R_CO), bas],                     /* ce qui se détache du buste : de l'aisselle au poignet */
    epaule:gelule(e[0], e[1], R_EP + 0.4, vers(e[0], c2[0], 0.3), vers(e[1], c2[1], 0.3), vers(R_EP, R_CO, 0.3) + 0.2)};
}

/* ---------- Une main : la paume, quatre doigts (deux phalanges chacun), le pouce ----------
   (Romain, 23 novembre : « des mains moins moufles ».) W : le poignet ; d : vers où pointent les doigts ; P.pouceG / pouceD :
   de quel côté est le pouce ; P.poingG / poingD : 0, la main ouverte ; 1, le poing fermé (elle tient l'arc, la dague). */
var DG_OFF = [4.5, 1.55, -1.5, -4.4], DG_LON = [9.7, 10.9, 10.1, 8.2], DG_RAY = [2.3, 2.35, 2.3, 2.05];
function mainSVG(K, V, B, P){
  var cote = B.cote, cle = B.cle, W = B.W, d = B.dir, pc = (B.tourne || function(v){ return v; })(B.pouce || P['pouce' + cle] || [-cote * 0.25, 0.1, 1]), pg = P['poing' + cle];
  if(pg == null) pg = cote < 0 ? 0.75 : 0.15;
  var w = sub(pc, mul(d, dot(pc, d)));
  if(lon(w) < 0.08) w = sub([0, -1, 0.2], mul(d, dot([0, -1, 0.2], d)));
  w = uni(w);
  var n = mul(croix(d, w), -cote);                               /* (vers où regarde la paume) */
  function Q(a, b, c2){ return pj(add(add(add(W, d, a), w, b), n, c2 || 0), V); }
  var L = [], objet = '', objetPts = [], i;
  /* la dague, dans SA main gauche : le manche est dans le poing, la lame sort du côté du pouce */
  if(cote > 0 && (P.dague || 0) > 0.3){
    var g0 = Q(7.6, -7.4, 2.4), g1 = Q(7.6, 8, 2.4), ga = Q(3.6, 8.6, 2.4), gb = Q(11.6, 8.6, 2.4);
    /* (la lame : effilée, et jamais un simple trait, même vue par la tranche) */
    var l0 = Q(7.6, 9.4, 2.4), l1 = Q(7.7, 30, 2.4), l2 = Q(7.7, 39, 2.4), lame = [gelule(l0[0], l0[1], 2.9, l1[0], l1[1], 2.3), gelule(l1[0], l1[1], 2.3, l2[0], l2[1], 0.5)], fil = [Q(7.6, 11, 2.4), Q(7.7, 35.5, 2.4)];
    objet = '<g opacity="' + f1(doux(0.3, 0.7, P.dague)) + '">' + PT(U.poly([g0, g1], false), O, 7.4) + PT(U.poly([g0, g1], false), '#6e4223', 4.6) +
      U.masse(lame, '#d5dbe6', 1.6) + PT(U.poly(fil, false), '#ffffff', 1.2, ' opacity=".8"') + PT(U.poly([ga, gb], false), O, 5.6) + PT(U.poly([ga, gb], false), '#c9b07a', 3) + '</g>';
  }
  /* une flèche tenue dans la même main (P.flecheD : elle la sort du carquois, la remet) : la tige passe dans le poing, la pointe
     sort du côté du pouce, l'empennage de l'autre */
  if(cote > 0 && (P.flecheD || 0) > 0.05){
    /* (P.flecheP : 0, tenue au milieu ; 1, tenue par son bout, l'encoche — pour la tirer du carquois) */
    var sf = 22 * (P.flecheP || 0);
    var fa = Q(7.6, -26 + sf, 2.4), fb = Q(7.6, 40 + sf, 2.4), fp = Q(7.6, 48 + sf, 2.4), fq = Q(7.6, 40 + sf, 5.2), fr = Q(7.6, 40 + sf, -0.4), e1 = Q(7.6, -26 + sf, 2.4), e2 = Q(7.6, -14 + sf, 2.4), e3 = Q(7.6, -24 + sf, 7.4), e4 = Q(7.6, -16 + sf, 7.4);
    objet += '<g opacity="' + f1(doux(0.05, 0.6, P.flecheD)) + '">' + PT(U.poly([fa, fb], false), O, 3.6) + PT(U.poly([fa, fb], false), '#e6d8b8', 1.8) +
      PC(U.poly([fp, fq, fr]), '#b8bcc8', 1.3) + PC(U.poly([e1, e2, e4, e3]), '#c0392b', 1.1) + '</g>';
    /* (ses points, loin du poing : pour savoir ce qui passe devant la flèche — un bras, le buste) */
    [-24, -14, 18, 28, 38, 46].forEach(function(b){ objetPts.push(Q(7.6, b + sf, 2.4)); });
  }
  /* la paume */
  var p1 = Q(1.5, 3.4), p2 = Q(1.5, -3.4), p3 = Q(9.6, 4.7), p4 = Q(9.6, -4.7), Lp = [];
  Lp.push(gelule(p1[0], p1[1], 4.5, p3[0], p3[1], 3.9), gelule(p2[0], p2[1], 4.5, p4[0], p4[1], 3.9), gelule(p3[0], p3[1], 3.9, p4[0], p4[1], 3.9), gelule(p1[0], p1[1], 4.5, p2[0], p2[1], 4.5));
  /* les doigts : ils se plient vers la paume (deux phalanges) ; ouverts, ils s'écartent un peu */
  var ec = (1 - pg) * 0.07, D = [], idx = P['index' + cle] || 0;
  for(i = 0; i < 4; i++){
    /* (l'index peut rester tendu : elle montre du doigt, « chut ! ») */
    var pli = i === 0 ? pg * (1 - idx) : pg, c1 = 0.1 + 1.3 * pli, c2a = c1 * 2.15;
    var l1 = DG_LON[i] * 0.55, l2 = DG_LON[i] * 0.47, ev = DG_OFF[i] * ec, r = DG_RAY[i];
    var b0 = [9.6, DG_OFF[i], 0], b1 = [b0[0] + l1 * Math.cos(c1), b0[1] + ev * l1, l1 * Math.sin(c1)], b2 = [b1[0] + l2 * Math.cos(c2a), b1[1] + ev * l2, b1[2] + l2 * Math.sin(c2a)];
    var q0 = Q(b0[0], b0[1], b0[2]), q1 = Q(b1[0], b1[1], b1[2]), q2 = Q(b2[0], b2[1], b2[2]);
    L.push(gelule(q0[0], q0[1], r + 0.2, q1[0], q1[1], r), gelule(q1[0], q1[1], r, q2[0], q2[1], r * 0.88));
    D.push([b0, b1, b2]);
  }
  /* le pouce */
  var t0 = [3.2, 5.2, 0.6], u1 = uni([0.62 - 0.3 * pg, 0.75, 0.2 + 0.7 * pg]), t1 = add(t0, u1, 5.6), u2 = uni([0.85 - 0.9 * pg, 0.42 - 0.6 * pg, 0.25 + 0.9 * pg]), t2 = add(t1, u2, 4.7);
  var k0 = Q(t0[0], t0[1], t0[2]), k1 = Q(t1[0], t1[1], t1[2]), k2 = Q(t2[0], t2[1], t2[2]);
  Lp.push(gelule(k0[0], k0[1], 3.1, k1[0], k1[1], 2.75), gelule(k1[0], k1[1], 2.75, k2[0], k2[1], 2.35));
  /* la peau : un dégradé en travers de la main */
  var mc = Q(8, 0), gid = K.n('pm' + cle), s = degU(gid, mc[0] - 9, mc[1] - 10, mc[0] + 9, mc[1] + 10, st(0, K.peau.c[0]) + st(0.62, K.peau.c[1]) + st(1, U.mix(K.peau.c[1], K.peau.ombre, 0.7)));
  var defs = s, paume = U.masse(Lp, 'url(#' + gid + ')', 1.9);
  s += U.masse(Lp.concat(L), 'url(#' + gid + ')', 1.9);
  /* un trait entre deux doigts voisins */
  var tr = '';
  for(i = 0; i < 3; i++){
    var A = D[i], Bq = D[i + 1], pts = [0, 1, 2].map(function(j){ var x = j === 0 ? 1.6 : 0, qq = Q((A[j][0] + Bq[j][0]) / 2 + x, (A[j][1] + Bq[j][1]) / 2, (A[j][2] + Bq[j][2]) / 2 + 0.6); return [qq[0], qq[1]]; });
    if(d2(pts[0], pts[2]) > 2.2) tr += U.poly(pts, false) + ' ';
  }
  s += PT(tr, K.peau.trait, 1.05, ' opacity=".8"');
  /* (pour tenir l'arc : la paume seule, et les doigts seuls avec leurs traits ; vers : la paume est tournée vers nous) */
  return {objet:objet, objetPts:objetPts, main:s, paume:defs + paume, doigts:U.masse(L, 'url(#' + gid + ')', 1.9) + PT(tr, K.peau.trait, 1.05, ' opacity=".8"'), n:n, vers:-n[0] * V.s + n[2] * V.c};
}

/* le dessin d'un bras. plein : avec tout son contour (le bras du fond, dessiné avant le buste) ; sinon son trait ne commence qu'à l'aisselle */
/* les deux côtés d'une gélule, sans ses bouts arrondis */
function cotes(x0, y0, r0, x1, y1, r1){
  var dx = x1 - x0, dy = y1 - y0, d = Math.sqrt(dx * dx + dy * dy);
  if(d < 0.5 || d <= Math.abs(r0 - r1) + 0.02) return '';
  var a = Math.atan2(dy, dx), b = Math.acos((r0 - r1) / d), c1 = Math.cos(a + b), s1 = Math.sin(a + b), c2 = Math.cos(a - b), s2 = Math.sin(a - b);
  return 'M' + f1(x0 + r0 * c1) + ' ' + f1(y0 + r0 * s1) + ' L' + f1(x1 + r1 * c1) + ' ' + f1(y1 + r1 * s1) + ' M' + f1(x0 + r0 * c2) + ' ' + f1(y0 + r0 * s2) + ' L' + f1(x1 + r1 * c2) + ' ' + f1(y1 + r1 * s2);
}
function brasSVG(K, V, B, P, plein){
  var s = '', c2 = B.c2, w = B.w, cote = B.cote, L = plein ? B.manche : B.libre;
  /* LE HAUT DU BRAS SANS TRAIT (Romain, 23 novembre, 14 h 11 : « j'aurais bien aimé qu'on ne voie pas la liaison entre les bras et
     les épaules […] le trait noir en haut du bras ») : pour un bras de devant, on ne trace que les deux côtés du haut du bras, pas
     son bout arrondi (c'était lui, le trait en travers du haut du bras) ; l'avant-bras garde tout son contour. */
  /* (et le haut du bras apparaît en fondu : son relief et ses côtés naissent doucement sur l'épaule, sans bord net) */
  var fondu = '';
  if(!plein){
    var fx = c2[0] - B.a[0], fy = c2[1] - B.a[1], fl = Math.sqrt(fx * fx + fy * fy) || 1, lf = Math.min(16, fl * 0.45), fid = K.n('fb' + B.cle);
    fx /= fl; fy /= fl;
    s += '<linearGradient id="' + fid + 'g" gradientUnits="userSpaceOnUse" x1="' + f1(B.a[0]) + '" y1="' + f1(B.a[1]) + '" x2="' + f1(B.a[0] + fx * lf) + '" y2="' + f1(B.a[1] + fy * lf) + '"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
      '<mask id="' + fid + '" maskUnits="userSpaceOnUse" x="-500" y="-300" width="1000" height="1100"><rect x="-500" y="-300" width="1000" height="1100" fill="url(#' + fid + 'g)"/></mask>';
    fondu = ' mask="url(#' + fid + ')"';
  }
  s += (plein ? '<path d="' + L.join(' ') + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linejoin="round"/>' :
      '<path d="' + cotes(B.a[0], B.a[1], B.ra, c2[0], c2[1], R_CO) + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linecap="round"' + fondu + '/>' +
      '<path d="' + L[1] + '" fill="none" stroke="' + O + '" stroke-width="4.4" stroke-linejoin="round"/>') +
    '<path d="' + L.join(' ') + '" fill="' + K.u('tunP') + '"/><path d="' + L.join(' ') + '" fill="' + K.u('trame') + '" opacity=".34"/>' +
    /* le relief de chaque os, en travers de lui ; celui de l'avant-bras s'arrête au coude (pas deux couches l'une sur l'autre) */
    relief(K, 'rb' + B.cle + '0', B.e[0], B.e[1], c2[0], c2[1], R_EP) + relief(K, 'rb' + B.cle + '1', c2[0], c2[1], w[0], w[1], R_CO) +
    '<clipPath id="' + K.n('xb' + B.cle) + '"><path clip-rule="evenodd" d="M-400 -200 H400 V700 H-400 Z ' + L[0] + '"/></clipPath>' +
    PF(L[0], K.u('rb' + B.cle + '0'), fondu) + PF(L[1], K.u('rb' + B.cle + '1'), ' clip-path="url(#' + K.n('xb' + B.cle) + ')"');
  /* les plis du coude */
  var nx = -(w[1] - c2[1]), ny = w[0] - c2[0], nl = Math.sqrt(nx * nx + ny * ny) || 1, ux = (w[0] - c2[0]) / nl, uy = (w[1] - c2[1]) / nl; nx /= nl; ny /= nl;
  function Q(al, k){ return f1(c2[0] + ux * al + nx * k) + ' ' + f1(c2[1] + uy * al + ny * k); }
  if(nl > 12) s += PT('M' + Q(-1, -6.4) + ' Q ' + Q(3, 0) + ' ' + Q(0, 5.4) + ' M' + Q(6, -5.6) + ' Q ' + Q(9.4, -1) + ' ' + Q(7.4, 3.4), U.sombre(K.tissu[2], 0.2), 1.5, ' opacity=".34"');
  /* le poignet de cuir, piqué */
  var q1 = [vers(c2[0], w[0], 0.8), vers(c2[1], w[1], 0.8)], dq = gelule(q1[0], q1[1], R_PO + 0.9, w[0], w[1], R_PO + 0.5);
  s += PC(dq, K.u('cuir'), 1.6) + PF(dq, K.u('grain'), ' opacity=".4"') + couture('M' + f1(q1[0] - nx * 6.4) + ' ' + f1(q1[1] - ny * 6.4) + ' L ' + f1(q1[0] + nx * 6.4) + ' ' + f1(q1[1] + ny * 6.4), 0.5);
  /* Trois couches, que le corps range : les manches, PUIS ce qu'elle tient (l'arc, la dague : jamais sous une manche), PUIS les mains */
  var mn = mainSVG(K, V, B, P);
  if(cote < 0 && P.arc !== false){
    /* L'ARC DANS LE POING (Romain, 23 novembre, 13 h 36 : « l'arc, il est censé être devant la main ») : la poignée passe dans la
       paume, les doigts se referment par-dessus. Quand on voit l'intérieur de la main, on voit donc la paume, puis l'arc, puis les
       doigts ; quand on voit le dos de la main, le poing cache la poignée. L'arc est rendu en morceaux (ses deux branches, la
       poignée) : HV.corps cache chaque branche là où le buste ou une jambe est devant elle. */
    /* (l'arc tourne avec la main quand elle suit le buste) */
    var Pa = P;
    if(B.tourne){ Pa = Object.create(P); Pa.arcAxe = B.tourne(P.arcAxe || [0, 1, 0]); Pa.arcDir = B.tourne(P.arcDir || [-0.82, 0, 0.57]); }
    var arc = arcSVG(K, V, add(add(B.W, B.dir, 8), mn.n, 3.5), Pa);
    if(mn.vers > 0.15) return {manche:s, paume:mn.paume, arc:arc, objet:mn.objet, objetPts:mn.objetPts, main:mn.doigts};
    return {manche:s, paume:'', arc:arc, objet:mn.objet, objetPts:mn.objetPts, main:mn.main};
  }
  return {manche:s, paume:'', arc:null, objet:mn.objet, objetPts:mn.objetPts, main:mn.main};
}
/* un bras en une seule chaîne de dessin (la manche, la paume, l'arc, ce qu'il tient, la main) ; m : pour chaque morceau de l'arc
   (cH, cB, bH, bB), le masque qui le cache là où quelque chose est devant lui */
function brasTout(o, m){
  m = m || {};
  return o.manche + o.paume + objetsTout(o, m) + o.main;
}
/* ce qu'une main tient (l'arc en morceaux, la flèche ou la dague), chaque morceau sous son masque s'il en a un */
function objetsTout(o, m){
  m = m || {};
  function sous(id, s){ return id ? '<g mask="url(#' + id + ')">' + s + '</g>' : s; }
  var a = o.arc ? o.arc.morceaux.map(function(x){ return sous(m[x.nom], x.svg); }).join('') + o.arc.poignee : '';
  return a + sous(m.objet, o.objet);
}

/* ---------- Le buste : un seul contour avec les manches de devant ----------
   jb.devant : les jambes qui passent devant le haut du corps (un genou levé devant la poitrine) ; jb.ouv : les jambes vues par
   l'ouverture de la tunique (accroupie de face, on regarde dans le bas de la tunique : les cuisses en sortent). */
function torse(K, h, T, P, avant, fond, jb){
  var V = T.V, cq = T.coques(), s = '', i, cid = K.n('tun');
  var pH = pj(T.C[0], V), pB = pj(T.C[NF], V), pM = pj(T.fr(204).C, V);
  /* la couleur de la tunique suit le corps (le même dégradé pour le buste et les manches : ils se fondent) */
  var T3 = K.tissu, defs = degU(K.n('tunP'), -46 + pM[0], 136 + pM[1] - 204, 46 + pM[0], 276 + pM[1] - 204, st(0, T3[0]) + st(0.55, T3[1]) + st(1, T3[2]));
  /* le relief : en travers du buste et le long de lui, même penché */
  var ax = pB[0] - pH[0], ay = pB[1] - pH[1], al = Math.sqrt(ax * ax + ay * ay), nx = 1, ny = 0, mx = (pH[0] + pB[0]) / 2, my = (pH[1] + pB[1]) / 2;
  if(al > 30){ ax /= al; ay /= al; nx = ay; ny = -ax; if(nx + 0.35 * ny < 0){ nx = -nx; ny = -ny; } } else { ax = 0; ay = 1; al = 135; mx = pM[0]; my = pM[1]; }
  defs += degU(K.n('rtH'), mx - nx * 47.5, my - ny * 47.5, mx + nx * 47.5, my + ny * 47.5, st(0, '#000', 0.14) + st(0.16, '#fff', 0.2) + st(0.42, '#fff', 0.02) + st(0.66, '#000', 0.08) + st(0.86, '#000', 0.26) + st(1, '#000', 0.46)) +
    degU(K.n('rtV'), mx - ax * al / 2, my - ay * al / 2, mx + ax * al / 2, my + ay * al / 2, st(0, '#fff', 0.12) + st(0.3, '#fff', 0) + st(0.62, '#000', 0) + st(1, '#000', 0.26));
  var dTout = cq.map(function(c1){ return c1.d; }).join(' ');
  /* LES CACHES (Romain, 23 novembre, 13 h 36 : « les membres ne peuvent pas traverser le corps […] avoir la logique en 3D ») :
     une jambe est dessinée APRÈS le buste, mais cachée là où la poitrine ou la jupe est devant elle. Le cache prend aussi le
     trait du contour : la jambe s'arrête net au bord du buste, elle passe derrière. */
  /* (chaque forme est un tracé à part : deux formes mises dans un seul tracé peuvent, là où elles se chevauchent, s'annuler et
     laisser un trou dans le cache) */
  function cache(id, L){ return '<mask id="' + K.n(id) + '" maskUnits="userSpaceOnUse" x="-500" y="-300" width="1000" height="1100"><rect x="-500" y="-300" width="1000" height="1100" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="4.6" stroke-linejoin="round">' + L.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g></mask>'; }
  /* (le haut des bras de devant fait partie de la poitrine : une jambe derrière la poitrine est aussi derrière les épaules) */
  var hautBras = avant.map(function(B){ return B.manche[0]; }), lH = cq.filter(function(c1){ return c1.y1 <= YJ + 0.1; }).map(function(c1){ return c1.d; }),
    lJ = cq.filter(function(c1){ return c1.y0 >= YJ - 0.1; }).map(function(c1){ return c1.d; });
  s += '<defs>' + defs + '<path id="' + K.n('tc') + '" d="' + dTout + '"/><clipPath id="' + cid + '"><use href="#' + K.n('tc') + '"/></clipPath>' +
    cache('mH', lH.concat(hautBras)) + cache('mJ', lJ) + cache('mHJ', lH.concat(lJ, hautBras)) + '</defs>';
  function plein(d, c1){ return '<path d="' + d + '" fill="' + c1 + '"/>'; }
  function tout(c1, x){ return '<use href="#' + K.n('tc') + '" fill="' + c1 + '"' + (x || '') + '/>'; }

  /* --- ce qui est dessiné sur la tunique --- */
  var dans = tout(K.u('trame'), ' opacity=".34"') + tout(K.u('rtH')) + tout(K.u('rtV'));
  /* les plis de la jupe : ils tournent avec elle */
  var plis = '', lums = '';
  [-150, -112, -74, -40, -12, 22, 52, 86, 124, 160].forEach(function(az, j){
    var run = [], y;
    for(y = 222 + (j % 3) * 5; y <= 268; y += 6){ var q = T.pt((az + (y - 222) * 0.05 * (j % 2 ? 1 : -1)) * RAD, y); if(q.vu) run.push(q.p); }
    if(run.length >= 4){ if(j % 2) lums += '<path d="' + U.filet(run, 2.6) + '"/>'; else plis += '<path d="' + U.filet(run, 3.2) + '"/>'; }
  });
  /* les plis du haut : à la taille, sous les bras */
  [[[-23, 199], [-24.5, 187], [-21, 173]], [[23, 199], [24.5, 187], [21, 173]], [[-30, 159], [-25, 166], [-18, 168]], [[30, 159], [25, 166], [18, 168]]].forEach(function(t, j){
    T.traits(U.ech(t, 6)).forEach(function(run){ if(run.length >= 4) plis += '<path d="' + U.filet(run, j < 2 ? 2.8 : 2.4) + '"/>'; });
  });
  T.traits(U.ech([[-27, 151], [-29, 171], [-27, 193]], 6)).forEach(function(run){ if(run.length >= 4) lums += '<path d="' + U.filet(run, 2.4) + '"/>'; });
  /* quand elle se penche : les plis du ventre, en travers */
  var pli = borne(((P.dos || Z3)[0] + (P.bang || Z3)[0] * 0.3) / 40, 0, 1);
  if(pli > 0.08){
    var ventre = '';
    [[196, 21], [188, 16]].forEach(function(t){ T.traits(U.ech([[-t[1], t[0] + 2], [0, t[0] - 2.5], [t[1], t[0] + 2]], 8)).forEach(function(run){ if(run.length >= 4) ventre += '<path d="' + U.filet(run, 2.8) + '"/>'; }); });
    dans += '<g fill="' + U.sombre(K.tissu[2], 0.2) + '" opacity="' + f1(0.3 * pli) + '">' + ventre + '</g>';
  }
  dans += '<g fill="' + U.sombre(K.tissu[2], 0.2) + '" opacity=".32">' + plis + '</g><g fill="' + U.clair(K.tissu[0], 0.3) + '" opacity=".34">' + lums + '</g>';
  /* les coutures des côtés */
  [-1, 1].forEach(function(c1){ T.traits(U.ech([[c1 * 30, 151], [c1 * 32, 167], [c1 * 30, 187], [c1 * 27, 199]], 8)).forEach(function(run){ dans += couture(U.poly(run, false), 0.4); }); });
  /* l'ombre de la tête et du cou sur les épaules ; l'ombre des bras de devant sur le corps */
  var e1 = pj(T.fr(146).C, V), la = d2(T.sur(146, [-33.5, 0]).p, T.sur(146, [33.5, 0]).p), lz = d2(T.sur(146, [0, -14.5]).p, T.sur(146, [0, 15.5]).p);
  dans += '<ellipse cx="' + f1(e1[0]) + '" cy="' + f1(e1[1]) + '" rx="' + f1(Math.max(la, lz * 1.1) * 0.36) + '" ry="12" fill="#000" opacity=".2"/>';
  avant.forEach(function(B){ dans += '<path d="' + B.libre.join(' ') + '" transform="translate(2.8 2.4)" fill="#000" opacity=".17"/>'; });
  /* le bord du bas : une bande plus sombre et sa couture */
  var bas = T.anneau(272, 14), b2 = T.anneau(264.5, 14);
  if(bas.length && b2.length) dans += PF(U.poly(b2.concat(bas.slice().reverse())), U.sombre(K.tissu[2], 0.25), ' opacity=".34"') + couture(U.courbe(T.anneau(263, 14)), 0.55);
  /* un liseré de lumière froide du côté de l'ombre */
  if(al > 60 && T.tours){
    var lis = [];
    T.tours.forEach(function(ring){
      if(ring.y < 153 || ring.y > 261) return;
      var best = -1e9, bp = null;
      ring.forEach(function(q){ var v = q[0] * nx + q[1] * ny; if(v > best){ best = v; bp = q; } });
      lis.push([bp[0] - nx * 1.9, bp[1] - ny * 1.9]);
    });
    dans += PT(U.courbe(lis), '#cfe9ff', 1.5, ' opacity="' + f1(0.36 * doux(60, 100, al)) + '"');
  }

  /* --- ce qui passe par-dessus : le col, le baudrier (le haut) ; la ceinture et sa boucle --- */
  var dessusHaut = '', ceinture = '';
  /* le haut des bras de devant fait partie du buste : le baudrier et la ceinture passent PAR-DESSUS l'épaule
     (Romain, 23 novembre, 11 h 22 : « c'est le vêtement le plus au-dessus ») */
  avant.forEach(function(B){ dessusHaut += PF(B.manche[0], K.u('tunP')) + PF(B.manche[0], K.u('trame'), ' opacity=".34"'); });
  /* le col en V */
  var colO = [[-10, 138.5], [-5, 148], [0, 158], [5, 148], [10, 138.5]].map(function(q){ return T.face(q[0], q[1]); }), col = colO.map(function(o){ return o.p; });
  if(d2(col[0], col[4]) > 3 && colO[2].vu) dessusHaut += PC(U.poly(col), K.u('tunO'), 1.6);
  /* le baudrier : UNE boucle de cuir autour du buste, de SON épaule droite (en haut) à SA hanche gauche (en bas), devant et
     derrière d'un seul tenant (Romain, 23 novembre, 15 h 04 : « elle se coupe […] il faut qu'elle arrête de disparaître dès que
     ça tourne ») : on suit la boucle tout autour et on dessine les morceaux qu'on voit, chacun prolongé exactement jusqu'au bord
     du buste (là où il passe derrière), et passé par-dessus l'épaule quand on la voit de côté. */
  (function(){
    var NB = 96, Y0b = 172.25, Ab = 30.25;
    function bq(az){ return T.pt(az, Y0b + Ab * Math.sin(az)); }
    function bord(a0, a1, v0){ var m, it, o; for(it = 0; it < 9; it++){ m = (a0 + a1) / 2; o = bq(m); if(o.vu === v0) a0 = m; else a1 = m; } var p = bq((a0 + a1) / 2).p; return [p[0], p[1], 0]; }
    function pt3(o){ return [o.p[0], o.p[1], o.fa]; }
    var S = [], k, runs = [], run = null, k0 = -1, pas = TAU / NB;
    for(k = 0; k < NB; k++){ S.push(bq(-Math.PI + pas * k)); if(k0 < 0 && !S[k].vu) k0 = k; }
    /* (on part d'un point caché : un morceau vu n'est jamais coupé en deux par le début de la boucle) */
    if(k0 < 0) runs.push(S.map(pt3).concat([pt3(S[0])]));
    else for(k = k0 + 1; k <= k0 + NB; k++){
      var o0 = S[k % NB], av = S[(k - 1) % NB], az0 = -Math.PI + pas * k;
      if(o0.vu && !av.vu) run = [bord(az0 - pas, az0, false)];
      if(o0.vu) run.push(pt3(o0));
      if(o0.vu && !S[(k + 1) % NB].vu){ run.push(bord(az0, az0 + pas, true)); runs.push(run); run = null; }
    }
    /* (le cuir ne dépasse jamais du contour du buste et du haut des bras ; vu par la tranche, près du bord, il s'amincit : il
       tourne autour du corps au lieu de s'arrêter net) */
    var bc = K.n('bdc'), s2 = '';
    runs.forEach(function(r2){
      if(r2.length < 2) return;
      var rb = U.ruban(r2, function(u){ var q = r2[Math.round(u * (r2.length - 1))]; return 4.7 * (0.12 + 0.88 * doux(0, 0.45, q[2])); });
      s2 += PC(rb, K.u('cuir'), 1.8) + PF(rb, K.u('grain'), ' opacity=".4"') + couture(U.poly(r2.map(function(q2){ return [q2[0] - 2, q2[1] - 2.2]; }), false));
    });
    if(s2) dessusHaut += '<clipPath id="' + bc + '"><use href="#' + K.n('tc') + '"/>' + avant.map(function(B){ return '<path d="' + B.manche[0] + '"/>'; }).join('') + '</clipPath><g clip-path="url(#' + bc + ')">' + s2 + '</g>';
  })();
  /* la ceinture : un anneau de cuir, et sa boucle devant */
  var mc = pj(T.fr(208).C, V);
  function large(q){ return [mc[0] + (q[0] - mc[0]) * 1.02, q[1]]; }
  var c1 = T.anneau(202, 10).map(large), c2 = T.anneau(214, 10).map(large);
  if(c1.length && c2.length){
    var dc = U.poly(c1.concat(c2.slice().reverse()));
    ceinture += PC(dc, K.u('cuirH'), 2) + PF(dc, K.u('grain'), ' opacity=".4"') + couture(U.poly(c1.map(function(q){ return [q[0], q[1] + 2.3]; }), false), 0.6) + couture(U.poly(c2.map(function(q){ return [q[0], q[1] - 2.3]; }), false), 0.45) +
      PF(U.poly(c2.concat(c2.slice().reverse().map(function(q){ return [q[0], q[1] + 5]; }))), '#000', ' opacity=".2" clip-path="url(#' + cid + ')"');
  }
  var boO = [[-9, 198], [9, 198], [9, 218], [-9, 218], [0, 208]].map(function(q){ return T.face(q[0], q[1]); }), bo = boO.map(function(o){ return o.p; }), lb = d2(bo[0], bo[1]);
  if(lb > 2.5 && boO[4].vu){
    /* (la boucle : un rectangle posé sur le ventre ; il se resserre quand elle se tourne, il penche quand elle se penche) */
    var ux = (bo[1][0] - bo[0][0]) / 18, uy = (bo[1][1] - bo[0][1]) / 18, vx = (bo[3][0] - bo[0][0]) / 20, vy = (bo[3][1] - bo[0][1]) / 20;
    ceinture += '<g transform="matrix(' + [ux, uy, vx, vy, (bo[0][0] + bo[2][0]) / 2, (bo[0][1] + bo[2][1]) / 2].map(function(v){ return Math.round(v * 1000) / 1000; }).join(' ') + ')"><rect x="-9" y="-10" width="18" height="20" rx="3" fill="#c9b07a"' + U.c(1.8) + '/><rect x="-4" y="-5" width="8" height="10" rx="1.5" fill="none" stroke="' + O + '" stroke-width="1.4"/><path d="M-6.6 -7.4 h4 M-6.6 -7.4 v5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g>';
  }

  /* --- l'ouverture du bas de la tunique : quand on regarde dedans (accroupie, de face), on voit l'intérieur et les cuisses --- */
  var axS = mv(T.fr(272).M, [0, 1, 0]), vuO = (-axS[0] * V.s + axS[2] * V.c) - ANNEAU * axS[1], ouv = '';
  if(vuO > 0.03 && jb && jb.ouv){
    var dO = U.poly(T.tours[T.tours.length - 1]), oid = K.n('ouv');
    ouv = '<clipPath id="' + oid + '"><path d="' + dO + '"/></clipPath><g opacity="' + f1(doux(0.03, 0.16, vuO)) + '">' + PF(dO, U.sombre(K.tissu[2], 0.3)) + '<g clip-path="url(#' + oid + ')">' + jb.ouv() + '</g>' + PT(dO, O, 2) + '</g>';
  }

  /* --- l'assemblage : un seul contour pour le buste et les manches de devant ; l'épaule du bras du fond se fond dans le buste --- */
  var manches = '';
  avant.forEach(function(B){ manches += ' ' + B.manche.join(' '); });
  function trait(d){ return '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="4.6" stroke-linejoin="round"/>'; }
  /* (l'épaule d'un bras du fond : une pièce de tunique posée sur le haut du bras, qui s'efface en fondu — Romain, 23 novembre,
     14 h 11 : « qu'on ne voie pas la liaison entre les bras et les épaules ») */
  var epaules = '';
  fond.forEach(function(B){
    var ux = B.c2[0] - B.e[0], uy = B.c2[1] - B.e[1], ul = Math.sqrt(ux * ux + uy * uy) || 1, fid = K.n('fe' + B.cle), p0 = 0.1 * ul, p1 = 0.3 * ul + R_CO;
    ux /= ul; uy /= ul;
    epaules += '<linearGradient id="' + fid + 'g" gradientUnits="userSpaceOnUse" x1="' + f1(B.e[0] + ux * p0) + '" y1="' + f1(B.e[1] + uy * p0) + '" x2="' + f1(B.e[0] + ux * p1) + '" y2="' + f1(B.e[1] + uy * p1) + '"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<mask id="' + fid + '" maskUnits="userSpaceOnUse" x="-500" y="-300" width="1000" height="1100"><rect x="-500" y="-300" width="1000" height="1100" fill="url(#' + fid + 'g)"/></mask>' +
      PF(B.epaule, K.u('tunP'), ' mask="url(#' + fid + ')"');
  });
  s += trait(dTout + manches) + epaules + tout(K.u('tunP')) + '<g clip-path="url(#' + cid + ')">' + dans + '</g>' + ouv + dessusHaut + ceinture;
  return s;
}

/* ---------- Le cou : de la base de la tête au haut du buste ---------- */
function cou(K, V, a, b, r, ombre){
  var d = gelule(a[0], a[1], r, b[0], b[1], r), cid = K.n('cou');
  return '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>' + PC(d, K.u('peau'), 2) + (ombre ? '<g clip-path="url(#' + cid + ')">' + ombre + '</g>' : '');
}

/* ---------- L'arc : tenu par la poignée ; P.arcAxe : dans quel sens il est tenu (debout par défaut), P.arcDir : de quel côté est sa corde ---------- */
function arcSVG(K, V, Hd, P){
  var axe = uni(P.arcAxe || [0, 1, 0]), e0 = P.arcDir || [-0.82, 0, 0.57], e = sub(e0, mul(axe, dot(e0, axe))), L = P.arcLong || 101, i, pts = [], n = 16, td = P.tendu || 0;
  e = uni(lon(e) < 0.05 ? [-0.82, 0, 0.57] : e);
  function Q(u, v){ return pj(add(add(Hd, e, u), axe, v), V); }
  /* (tendu : les branches plient un peu vers la corde) */
  var bx = -16.5 - 9 * td, by = L - 5 * td;
  for(i = 0; i <= n; i++){ var b = U.bez([[bx, -by], [5.5, -L * 0.52], [5.5, L * 0.52], [bx, by]], i / n), q = Q(b[0], b[1]); pts.push(q); }
  var t1 = Q(bx, -by), t2 = Q(bx, by), g1 = Q(1.6, -11), g2 = Q(1.6, 11), s = '', mid = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2, (t1[2] + t2[2]) / 2];
  /* (une branche : le bois ; une demi-corde : du bout de la branche jusqu'au milieu de la corde) */
  function branche(P2){ var d = U.poly(P2.map(function(q){ return [q[0], q[1]]; }), false); return PT(d, O, 9) + PT(d, K.u('bois'), 5); }
  function corde(tip){ return PT('M' + f1(tip[0]) + ' ' + f1(tip[1]) + ' L ' + f1(mid[0]) + ' ' + f1(mid[1]), '#efe6cc', 1.3, ' opacity=".9"'); }
  function ptsCorde(tip){ var r = [], k; for(k = 1; k <= 5; k++) r.push([vers(tip[0], mid[0], k / 6), vers(tip[1], mid[1], k / 6), vers(tip[2], mid[2], k / 6)]); return r; }
  if(td > 0.02 && P._encoche){
    /* la corde passe par les doigts ; la flèche va des doigts à l'arc */
    var nk = pj(P._encoche, V), nk2 = [vers((t1[0] + t2[0]) / 2, nk[0], td), vers((t1[1] + t2[1]) / 2, nk[1], td), vers((t1[2] + t2[2]) / 2, nk[2], td)], pt = Q(20, 0);
    mid = nk2;
    var ax = pt[0] - nk2[0], ay = pt[1] - nk2[1], al = Math.sqrt(ax * ax + ay * ay) || 1; ax /= al; ay /= al;
    s += PT('M' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(pt[0]) + ' ' + f1(pt[1]), O, 3.6) + PT('M' + f1(nk2[0]) + ' ' + f1(nk2[1]) + ' L ' + f1(pt[0]) + ' ' + f1(pt[1]), '#e6d8b8', 1.8) +
      PC('M' + f1(pt[0] + ax * 9) + ' ' + f1(pt[1] + ay * 9) + ' L ' + f1(pt[0] - ay * 4.2) + ' ' + f1(pt[1] + ax * 4.2) + ' L ' + f1(pt[0] + ay * 4.2) + ' ' + f1(pt[1] - ax * 4.2) + ' Z', '#b8bcc8', 1.3) +
      PC('M' + f1(nk2[0] + ax * 3) + ' ' + f1(nk2[1] + ay * 3) + ' l ' + f1(-ay * 4 + ax * 2) + ' ' + f1(ax * 4 + ay * 2) + ' l ' + f1(ax * 8) + ' ' + f1(ay * 8) + ' l ' + f1(ay * 4 + ax * 2) + ' ' + f1(-ax * 4 + ay * 2) + ' l ' + f1(ay * 4 - ax * 2) + ' ' + f1(-ax * 4 - ay * 2) + ' l ' + f1(-ax * 8) + ' ' + f1(-ay * 8) + ' Z', '#c8faff', 1);
  }
  /* l'arc en quatre morceaux, chacun avec ses points à l'écran (et leur profondeur), pour savoir ce qui passe devant lui :
     haut, bas : les deux branches ; cordeH, cordeB : les deux moitiés de la corde ; poignee : la poignée et la flèche */
  var M = [
      {nom:'cH', svg:corde(t1), pts:ptsCorde(t1)}, {nom:'cB', svg:corde(t2), pts:ptsCorde(t2)},
      {nom:'bH', svg:branche(pts.slice(0, n / 2 + 1)), pts:pts.slice(1, n / 2)}, {nom:'bB', svg:branche(pts.slice(n / 2)), pts:pts.slice(n / 2 + 1, n)}];
  /* (la flèche encochée est un morceau à part : un bras peut passer devant elle — Romain, 16 h 39 : « la flèche elle est censée être
     derrière le bras ») */
  if(s){ var fp = []; for(i = 1; i <= 6; i++) fp.push([vers(mid[0], pt[0], i / 7), vers(mid[1], pt[1], i / 7), vers(mid[2], pt[2], i / 7)]); M.push({nom:'fl', svg:s, pts:fp}); }
  return {morceaux:M, poignee:PT('M' + f1(g1[0]) + ' ' + f1(g1[1]) + ' L ' + f1(g2[0]) + ' ' + f1(g2[1]), '#6e4223', 6.4)};
}

/* ---------- Une jambe : où sont ses os ----------
   P.piedG / piedD : la cheville ; P.genouG / genouD : de quel côté va le genou ; P.ouvG / ouvD : le pied tourné vers l'extérieur ;
   P.pointeG / pointeD (degrés) : 0, le pied à plat ; 50, sur la pointe (le talon levé) ; 90, les orteils repliés sous un genou à terre.
   Un pied ne passe jamais sous le sol : sa cheville remonte s'il le faut. */
function jambe(V, cote, P, T){
  var cle = cote < 0 ? 'G' : 'D', Ha = add(T.Pc, mv(T.Mp, [cote * 13, 1, 0]));
  var A = (P['pied' + cle] || [cote * 19.5, 386, cote * -5]).slice(), pole = P['genou' + cle] || [cote * 0.25, 0, 1];
  var ouv = P['ouv' + cle] == null ? 0.3 : P['ouv' + cle], pt = (P['pointe' + cle] || 0) * RAD, cp = Math.cos(pt), sp = Math.sin(pt);
  /* (le pied tourne en dehors — ou en dedans si ouv < 0 — sans changer de longueur) */
  /* (P.lacetG / lacetD : le pied pivote sur place — Romain, 16 h 39 : « quand on est debout et qu'on se retourne comme ça, les jambes
     elles se tournent sans qu'on ait besoin de lever la jambe ») */
  var la = (P['lacet' + cle] || 0) * RAD, h1 = [cote * 20 * ouv, 0, 19];
  var h0 = [h1[0] * Math.cos(la) + h1[2] * Math.sin(la), 0, -h1[0] * Math.sin(la) + h1[2] * Math.cos(la)], Lt = 19.92, e = uni(h0), sd = [e[0] * cp, sp, e[2] * cp], m = [-e[0] * sp, cp, -e[2] * sp];
  /* le pied au sol : le talon ou la pointe ne descend pas plus bas que le sol */
  var bas = Math.max(A[1] + 21 * m[1] - 7.07 * sd[1] + 9, A[1] + 22 * m[1] + Lt * sd[1] + 7.8) - (SOL + 2);
  if(bas > 0) A[1] -= bas;
  var J = ik3(Ha, A, 72, 70, pole), Kn = J[0], An = J[1], dj = uni(sub(An, Kn));
  return {cote:cote, cle:cle, Ha:Ha, Kn:Kn, An:An, dj:dj, dc:uni(sub(Kn, Ha)), m:m, sd:sd, pt:pt,
    Ta:add(add(An, m, 21), sd, -7.07), Po:add(add(An, m, 22), sd, Lt), fond:(pj(Ha, V)[2] + pj(Kn, V)[2] * 2 + pj(An, V)[2]) / 4, kn:pj(Kn, V)};
}
/* son dessin : la cuisse, puis la botte d'un seul tenant (le genou, le mollet, la cheville, le talon, le pied) */
function jambeSVG(K, V, J, P, suf){
  /* LE HAUT DE LA BOTTE (Romain, 23 novembre, 14 h 11 : accroupie, « il y a vraiment un problème avec ses jambes par rapport à la
     botte ») : jambe droite, la botte monte jusqu'au genou et le couvre (comme avant) ; jambe pliée, elle s'arrête sous le genou,
     qui ressort par-dessus — sinon le haut de la botte « avalait » le genou. */
  var plie = Math.min(1, Math.max(0, 1 - dot(J.dc, J.dj))), dh = 8 * plie;
  var cote = J.cote, cle = J.cle + (suf || ''), ha = pj(J.Ha, V), kn = J.kn, an = pj(J.An, V), bt = pj(add(J.Kn, J.dj, -3 + dh), V);
  var ta = pj(J.Ta, V), po = pj(J.Po, V), a2 = pj(add(J.An, J.m, 4), V), t2 = pj(add(J.Ta, J.m, -1), V);
  var s = '', dcu = gelule(ha[0], ha[1], 13.2, kn[0], kn[1], 10.6), cu = K.n('cu' + cle);
  /* la cuisse, et l'ombre de la tunique dessus */
  var lc = d2(ha, kn) || 1, ox = ha[0] + (kn[0] - ha[0]) * Math.min(1, 32 / lc), oy = ha[1] + (kn[1] - ha[1]) * Math.min(1, 32 / lc);
  s += PC(dcu, K.u('pant'), 2.2) + '<clipPath id="' + cu + '"><path d="' + dcu + '"/></clipPath><ellipse cx="' + f1(ox) + '" cy="' + f1(oy) + '" rx="22" ry="13" fill="#000" opacity=".3" clip-path="url(#' + cu + ')"/>';
  /* (la cuisse et la botte sont deux morceaux : chacun sait s'il est devant ou derrière le buste) */
  var cuisse = s; s = '';
  /* le mollet : un peu en arrière du tibia, au premier tiers ; la cheville est plus fine */
  var hk = sub(J.Ha, J.Kn), ar = sub(hk, mul(J.dj, dot(hk, J.dj))), Mo = add(add(J.Kn, J.dj, 24), uni(lon(ar) < 0.5 ? [0, 0, -1] : ar), 2.4), mo = pj(Mo, V);
  var botte = [gelule(bt[0], bt[1], 13, mo[0], mo[1], 12.5), gelule(mo[0], mo[1], 12.5, an[0], an[1], 10.9), gelule(ta[0], ta[1], 9, po[0], po[1], 7.8), gelule(a2[0], a2[1], 10.6, t2[0], t2[1], 8.8)];
  var cid = K.n('bt' + cle), ysol = SOL + 0.6 + PSOL * Math.max(ta[2], po[2]);
  s += '<clipPath id="' + cid + '"><rect x="-300" y="-100" width="600" height="' + f1(ysol + 100) + '"/></clipPath>';
  s += '<g clip-path="url(#' + cid + ')">' + U.masse(botte, K.u('botte'), 2.2) + botte.map(function(d){ return PF(d, K.u('grain'), ' opacity=".42"') + PF(d, K.u('relM'), ' opacity=".55"'); }).join('') + '</g>';
  /* le long de la tige : un reflet, les plis de la cheville, une sangle et sa boucle */
  var bq = pj(add(J.Kn, J.dj, 3 + dh), V), ux = an[0] - bq[0], uy = an[1] - bq[1], ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
  function Q(t, k){ return f1(bq[0] + ux * ul * t - uy * k) + ' ' + f1(bq[1] + uy * ul * t + ux * k); }
  if(ul > 26){
    s += PT('M' + Q(0.1, 8.6) + ' L ' + Q(0.66, 7.6), '#f6c896', 2, ' opacity=".38"') +
      PT('M' + Q(0.93, 9.2) + ' Q ' + Q(0.99, 0) + ' ' + Q(0.94, -8.6) + ' M' + Q(1.03, 7.6) + ' Q ' + Q(1.08, 0) + ' ' + Q(1.04, -6.6), '#1c0e06', 1.7, ' opacity=".4"') +
      PC('M' + Q(0.74, 12.2) + ' L ' + Q(0.74, -12.2) + ' L ' + Q(0.84, -11.8) + ' L ' + Q(0.84, 11.8) + ' Z', '#4a2a14', 1.3);
    if(Math.abs(V.c) > 0.25) s += '<rect x="-3.8" y="-4.4" width="7.6" height="8.8" rx="1.6" fill="' + K.u('or') + '" stroke="' + O + '" stroke-width="1.1" transform="translate(' + Q(0.79, -cote * 3.5 * V.c) + ') rotate(' + f1(Math.atan2(uy, ux) / RAD - 90) + ')"/>';
  }
  /* la semelle et sa piqûre : à plat sur le sol, ou le long du pied quand le talon est levé */
  var sy = SOL + PSOL * (ta[2] + po[2]) / 2, x1 = Math.min(ta[0], po[0]) - 6, x2 = Math.max(ta[0], po[0]) + 5.6;
  var leve = doux(4, 22, Math.abs(J.pt) / RAD) + doux(1.5, 6, sy - Math.max(ta[1] + 9, po[1] + 7.8));
  if(leve < 0.02) s += PT('M' + f1(x1) + ' ' + f1(sy) + ' L ' + f1(x2) + ' ' + f1(sy), '#2a1c26', 2.6) + couture('M' + f1(x1 + 3) + ' ' + f1(sy - 5.4) + ' L ' + f1(x2 - 3) + ' ' + f1(sy - 5.4), 0.6);
  else {
    var s1 = pj(add(add(J.Ta, J.m, 8.6), J.sd, -4), V), s2 = pj(add(add(J.Po, J.m, 7.4), J.sd, 3.4), V), c1 = pj(add(add(J.Ta, J.m, 3.4), J.sd, -1), V), c2 = pj(add(add(J.Po, J.m, 2.2), J.sd, 1), V);
    if(d2(s1, s2) > 6) s += '<g clip-path="url(#' + cid + ')">' + PT(U.poly([s1, s2], false), '#2a1c26', 2.6) + couture(U.poly([c1, c2], false), 0.6) + '</g>';
  }
  /* le revers de la botte, et son ombre sur la tige : il suit le tibia */
  var pl = 3.2 * V.c, dr = 'M-14.2 0 Q 0 ' + f1(pl) + ' 14.2 0 L 13.8 9.5 Q 0 ' + f1(9.5 + pl * 1.6) + ' -13.8 9.5 Z';
  var rev = ul > 8 ? f1(Math.atan2(uy, ux) / RAD - 90) : 0;
  s += '<g transform="translate(' + f1(bq[0] - ux * 9) + ' ' + f1(bq[1] - uy * 9) + ') rotate(' + rev + ')"><path d="' + dr + '" transform="translate(0 4.5)" fill="#000" opacity=".22"/>' + PC(dr, '#8a5a30', 1.6) + PF(dr, K.u('grain'), ' opacity=".4"') + couture('M-12 2.6 Q 0 ' + f1(2.6 + pl) + ' 12 2.6', 0.6) + '</g>';
  return {cuisse:cuisse, botte:s, svg:cuisse + s, dCuisse:dcu, dBotte:botte};
}

/* ---------- Le carquois : en travers du dos, il dépasse derrière SON épaule gauche ; il suit la poitrine ---------- */
function carquois(K, V, T){
  var B = pj(T.buste([8, 198, -21]), V), Tp = pj(T.buste([40, 116, -19]), V), ux = Tp[0] - B[0], uy = Tp[1] - B[1], l = Math.sqrt(ux * ux + uy * uy) || 1;
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
  return {svg:s};
}

/* ==========================================================
   HV.corps(K, h, V, P) → les morceaux, à ranger par le pantin : {derriere, jambes, cou(…), torse, devant, tete…}
   P : la pose (hv-pantin.js, HV.POSES.repos en donne toutes les clés).
   ========================================================== */
HV.corps = function(K, h, V, P){
  P = P || {};
  var T = tronc(V, P), ba = P.bang || Z3, ds = P.dos || Z3;
  var jg = jambe(V, -1, P, T), jd = jambe(V, 1, P, T);
  draper(T, jg.dc, jd.dc);
  var bG = bras(V, -1, P, T), bD = bras(V, 1, P, T);
  /* (quand elle tend l'arc, la corde passe par les doigts de l'autre main) */
  if(P.tendu > 0.02) P._encoche = add(bD.W, bD.da, 12);
  var av = mv(T.Mb, [0, 0, 1]), dos = -av[0] * V.s + av[2] * V.c < -0.15;      /* (de dos : le carquois passe devant) */
  var cq = h.role === 'pisteur' || !h.role ? carquois(K, V, T) : null;
  var avant = [], fond = [], SEUIL = -8;
  /* (une main près de la tête et plus près de nous qu'elle : son bras passe devant, même si l'épaule est derrière — vue de dos, la
     main qui va chercher une flèche dans le carquois, derrière sa tête ; Romain, 16 h 39 : « le mouvement du bras qui se relève, il y
     est pas toujours ») */
  var tH = pj(T.lieu([0, 118, -2]), V);
  [bG, bD].forEach(function(b){ var w = pj(b.W, V); b.prTete = w[2] > tH[2] + 6 && w[1] < tH[1] + 12 && Math.abs(w[0] - tH[0]) < 62; });
  [bG, bD].sort(function(a, b){ return a.fond - b.fond; }).forEach(function(b){ (b.fond < SEUIL && !b.prTete ? fond : avant).push(b); });
  var pf = fond.map(function(b){ return brasSVG(K, V, b, P, true); });
  var der = (cq && !dos ? cq.svg : '') + pf.map(function(o){ return brasTout(o); }).join('');
  var pa = avant.map(function(b){ return brasSVG(K, V, b, P, false); });
  /* LES JAMBES : celle du fond d'abord. Elles sont dessinées après le buste ; chaque morceau (la cuisse, la botte) est caché là
     où la poitrine ou la jupe est devant lui (on regarde, en plusieurs points du morceau, ce qui est le plus près de nous). */
  var J2 = [jg, jd].sort(function(a, b){ return a.fond - b.fond; }), jb = '', dbg = [], membres = [], jambesInfo = [];
  function prof(){ var s = 0, i; for(i = 0; i < arguments.length; i++) s += pj(arguments[i], V)[2]; return s / arguments.length; }
  function morceau(svg, pts, r, nom){
    var R = cote3(T, pts, r), id = R.haut < 0 && R.jupe < 0 ? 'mHJ' : R.haut < 0 ? 'mH' : R.jupe < 0 ? 'mJ' : '';
    dbg.push([nom, R.haut, R.jupe]);
    return id ? '<g mask="url(#' + K.n(id) + ')">' + svg + '</g>' : svg;
  }
  /* LA CUISSE ET LA JUPE (Romain, 23 novembre, 13 h 36 et 14 h 11 : « il faut faire très attention aux superpositions ») : la
     cuisse est à moitié dans la tunique. On regarde la jupe par petits carreaux : la cuisse est cachée exactement là où un carreau
     de la jupe est devant elle (près du bassin, elle est dedans, donc toujours cachée ; plus loin, la jupe posée sur la cuisse la
     cache jusqu'à l'ourlet ; le pan de derrière, lui, est derrière elle). Et l'ourlet passe par-dessus la cuisse, avec son trait. */
  var Rj = T.coques() && T.tours, lHautC = T.coques().filter(function(c1){ return c1.y1 <= YJ + 0.1; }).map(function(c1){ return c1.d; });
  function jupeSurCuisse(j){
    var a = pj(j.Ha, V), b = pj(j.Kn, V), vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1, d = '', ourlet = '', k, i, n = 24, der = Rj.length - 2;
    /* (de combien ce point de la jupe est devant la cuisse : > 0, devant ; < 0, derrière ; loin : la distance à la cuisse) */
    function ecart(x, y, f){
      var t = borne(((x - a[0]) * vx + (y - a[1]) * vy) / l2, 0, 1), cx = a[0] + vx * t - x, cy = a[1] + vy * t - y, r = vers(13.2, 10.6, t), u2 = cx * cx + cy * cy;
      return {g:f - (vers(a[2], b[2], t) + Math.sqrt(Math.max(0, r * r - u2)) - 1), loin:Math.sqrt(u2) - r};
    }
    function coupe(pl, gs){
      /* (la partie d'un triangle où la jupe est devant : on coupe là où l'écart passe par zéro ; ce bord-là est le bord de la jupe
         posée sur la cuisse : il a son trait) */
      var out = [], m, X = [];
      for(m = 0; m < pl.length; m++){
        var p1 = pl[m], p2 = pl[(m + 1) % pl.length], g1 = gs[m], g2 = gs[(m + 1) % pl.length];
        if(g1 >= 0) out.push(p1);
        if((g1 >= 0) !== (g2 >= 0)){ var u = g1 / (g1 - g2), c = [vers(p1[0], p2[0], u), vers(p1[1], p2[1], u)]; out.push(c); X.push(c); }
      }
      if(X.length === 2) ourlet += 'M' + f1(X[0][0]) + ' ' + f1(X[0][1]) + ' L ' + f1(X[1][0]) + ' ' + f1(X[1][1]) + ' ';
      return out;
    }
    function ajoute(pl){
      if(pl.length < 3) return;
      /* (tous les morceaux tournés dans le même sens : ils s'ajoutent sans s'annuler) */
      var ar = 0, m; for(m = 0; m < pl.length; m++){ var p1 = pl[m], p2 = pl[(m + 1) % pl.length]; ar += p1[0] * p2[1] - p2[0] * p1[1]; }
      d += U.poly(ar < 0 ? pl.slice().reverse() : pl) + ' ';
    }
    var E = [];
    for(k = 20; k <= der + 1; k++){ E[k] = []; for(i = 0; i < n; i++) E[k][i] = ecart(Rj[k][i][0], Rj[k][i][1], Rj[k].f[i]); }
    for(k = 20; k <= der; k++) for(i = 0; i < n; i++){
      var i2 = (i + 1) % n, Q4 = [Rj[k][i], Rj[k][i2], Rj[k + 1][i2], Rj[k + 1][i]], e4 = [E[k][i], E[k][i2], E[k + 1][i2], E[k + 1][i]];
      if(Math.min(e4[0].loin, e4[1].loin, e4[2].loin, e4[3].loin) > 10) continue;
      var g4 = e4.map(function(e){ return e.g; });
      if(g4[0] < 0 && g4[1] < 0 && g4[2] < 0 && g4[3] < 0) continue;
      if(g4[0] >= 0 && g4[1] >= 0 && g4[2] >= 0 && g4[3] >= 0) ajoute(Q4.slice());
      else { ajoute(coupe([Q4[0], Q4[1], Q4[2]], [g4[0], g4[1], g4[2]])); ajoute(coupe([Q4[0], Q4[2], Q4[3]], [g4[0], g4[2], g4[3]])); }
      /* l'ourlet : le bord du bas, là où la jupe est devant la cuisse */
      if(k === der && (g4[2] >= 0 || g4[3] >= 0)){
        var A0 = Q4[3], A1 = Q4[2], h0 = g4[3], h1 = g4[2];
        if(h0 < 0){ var u0 = h0 / (h0 - h1); A0 = [vers(A0[0], A1[0], u0), vers(A0[1], A1[1], u0)]; }
        else if(h1 < 0){ var u1 = h0 / (h0 - h1); A1 = [vers(A0[0], A1[0], u1), vers(A0[1], A1[1], u1)]; }
        ourlet += 'M' + f1(A0[0]) + ' ' + f1(A0[1]) + ' L ' + f1(A1[0]) + ' ' + f1(A1[1]) + ' ';
      }
    }
    return {d:d, ourlet:ourlet};
  }
  J2.forEach(function(j){
    var sv = jambeSVG(K, V, j, P);
    var dehors = cote3(T, [0.5, 0.65, 0.8, 0.95].map(function(t){ return mixv(j.Ha, j.Kn, t); }), 12), js = jupeSurCuisse(j), mid = K.n('mc' + j.cle);
    dbg.push(['cuisse' + j.cle, dehors.haut, dehors.jupe]);
    /* (la poitrine, quand elle est devant la cuisse : penchée en avant, vue de dos…) */
    var autres = dehors.haut < 0 ? lHautC.concat(avant.map(function(B){ return B.manche[0]; })) : [];
    jb = '<mask id="' + mid + '" maskUnits="userSpaceOnUse" x="-500" y="-300" width="1000" height="1100"><rect x="-500" y="-300" width="1000" height="1100" fill="#fff"/>' +
      (js.d ? '<path d="' + js.d + '" fill="#000" stroke="#000" stroke-width="1" stroke-linejoin="round"/>' : '') +
      (autres.length ? '<g fill="#000" stroke="#000" stroke-width="4.6" stroke-linejoin="round">' + autres.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g>' : '') + '</mask>' +
      '<g mask="url(#' + mid + ')">' + sv.cuisse + '</g>';
    /* (le trait du bord de la jupe : caché par le même cache, il ne reste que sa moitié posée sur la cuisse ; un bord qui tombe
       au milieu de la jupe disparaît entièrement) */
    if(js.ourlet){
      var oc = K.n('oc' + j.cle);
      jb += '<clipPath id="' + oc + '"><path d="' + sv.dCuisse + '"/></clipPath><g mask="url(#' + mid + ')"><path d="' + js.ourlet + '" fill="none" stroke="' + O + '" stroke-width="5" stroke-linecap="round" clip-path="url(#' + oc + ')"/></g>';
    }
    var sBotte = morceau(sv.botte, [j.Kn, add(j.Kn, j.dj, 24), j.An, mixv(j.An, j.Po, 0.5), j.Po], 10, 'botte' + j.cle);
    /* UNE JAMBE EST D'UN SEUL TENANT (Romain, 23 novembre, 14 h 11 : « il y a le genou qui est par-dessus la botte, alors que
       l'autre jambe, la botte est bien par-dessus le genou, et c'est comme ça que ça doit être ») : la botte passe par-dessus la
       cuisse, sauf quand, au genou, la cuisse est nettement plus près de nous que le tibia (un genou à terre vu de face : le
       tibia part en arrière). */
    var cuisseDevant = prof(add(j.Kn, j.dc, -10)) > prof(add(j.Kn, j.dj, 10)) + 5;
    var dj = (prof(mixv(j.Ha, j.Kn, 0.6)) + prof(j.Kn, j.An)) / 2;
    membres.push({d:dj, s:cuisseDevant ? sBotte + jb : jb + sBotte});
    jambesInfo.push({j:j, dCuisse:sv.dCuisse, dBotte:sv.dBotte, d:dj});
  });
  /* LES BRAS DE DEVANT ET LES JAMBES SE RANGENT ENTRE EUX selon la profondeur (le plus loin d'abord) : une main posée au sol devant
     elle passe derrière la botte du genou à terre quand on la voit de dos. Un bras est d'un seul tenant : la manche, puis ce qu'il
     tient (l'arc n'est jamais sous sa propre manche — Romain, 23 novembre, 11 h 22 et 14 h 11), puis la main. Quand les bras passent
     devant la tête (brasDessus, vue de face), ils restent à part, dessinés après elle ; vus de dos, ils restent avec les autres. */
  /* (les bras passent aussi par-dessus la tête quand une main est près d'elle et plus près de nous qu'elle) */
  var dessus = (P.brasDessus > 0.5 && !dos) || avant.some(function(b){ return b.prTete; });
  var cqs = T.coques(), lHaut = cqs.filter(function(c1){ return c1.y1 <= YJ + 0.1; }).map(function(c1){ return c1.d; }),
    lJupe = cqs.filter(function(c1){ return c1.y0 >= YJ - 0.1; }).map(function(c1){ return c1.d; }), defsArc = '';
  /* L'ARC : chaque branche est cachée là où la poitrine, la jupe ou une jambe est devant elle (on compare les profondeurs en
     plusieurs points de la branche) */
  function masqueBranche(pts, nom, avecBras){
    var occ = [], s1;
    ['haut', 'jupe'].forEach(function(part){ s1 = 0; pts.forEach(function(q){ s1 += T.devant(q[0], q[1], q[2], 2, part); }); if(s1 < 0) occ = occ.concat(part === 'haut' ? lHaut : lJupe); });
    /* un os (de A à B, d'épaisseur r) cache le morceau si, là où il le croise à l'écran, il est plus près de nous que lui */
    function os(a3, b3, r, d){
      var A = pj(a3, V), Bp = pj(b3, V), vx = Bp[0] - A[0], vy = Bp[1] - A[1], l2 = vx * vx + vy * vy || 1, vote = 0;
      pts.forEach(function(q){
        var t = borne(((q[0] - A[0]) * vx + (q[1] - A[1]) * vy) / l2, 0, 1), cx = A[0] + vx * t - q[0], cy = A[1] + vy * t - q[1];
        if(cx * cx + cy * cy > r * r) return;
        vote += vers(A[2], Bp[2], t) + r * 0.6 > q[2] + 1 ? 1 : -1;
      });
      if(vote > 0) occ = occ.concat(d);
    }
    /* (la cuisse : seulement la partie qui sort de la tunique ; dedans, c'est la tunique qui compte) */
    jambesInfo.forEach(function(ji){
      var c0 = mixv(ji.j.Ha, ji.j.Kn, 0.37), p0 = pj(c0, V), p1 = pj(ji.j.Kn, V);
      os(c0, ji.j.Kn, 12, gelule(p0[0], p0[1], 12.2, p1[0], p1[1], 10.6));
      os(ji.j.Kn, ji.j.An, 11, ji.dBotte);
    });
    /* (la corde et les flèches passent DERRIÈRE un bras qui est devant elles — Romain, 16 h 39 : « le fil de l'arc, lui aussi, il est
       censé être derrière le bras ») */
    if(avecBras) [bG, bD].forEach(function(B){ os(B.Ep, B.El, R_EP, B.manche[0]); os(B.El, B.W, R_CO, B.manche[1]); });
    if(!occ.length) return '';
    var id = K.n('am' + nom);
    defsArc += '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="-500" y="-300" width="1000" height="1100"><rect x="-500" y="-300" width="1000" height="1100" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="4.4" stroke-linejoin="round">' + occ.map(function(d){ return '<path d="' + d + '"/>'; }).join('') + '</g></mask>';
    return id;
  }
  function masquesObjets(B, o, suffixe){
    var m = {};
    if(o.arc) o.arc.morceaux.forEach(function(x){ m[x.nom] = masqueBranche(x.pts, B.cle + suffixe + x.nom, /^(cH|cB|fl)$/.test(x.nom)); });
    if(o.objetPts && o.objetPts.length) m.objet = masqueBranche(o.objetPts, B.cle + suffixe + 'ob', true);
    return m;
  }
  var mPa = avant.map(function(B, i){ return masquesObjets(B, pa[i], ''); });
  if(!dessus) avant.forEach(function(B, i){ membres.push({d:prof(B.W), s:brasTout(pa[i], mPa[i])}); });
  /* UN BRAS DU FOND DEVANT UNE JAMBE (elle ramasse un indice, vue de trois quarts : le bras qui descend vers le sol passe devant le
     genou levé) : il est dessiné derrière le buste, puis une deuxième fois avec les jambes, caché là où le buste est (il reste
     donc derrière le buste, mais il passe devant la jambe qui est derrière lui). */
  fond.forEach(function(B, i){
    var dw = prof(B.W);
    if(!jambesInfo.some(function(ji){ return ji.d < dw; })) return;
    membres.push({d:dw, s:'<g mask="url(#' + K.n('mHJ') + ')">' + brasTout(pf[i], masquesObjets(B, pf[i], 'f')) + '</g>'});
  });
  membres.sort(function(a, b){ return a.d - b.d; });
  jb = (defsArc ? '<defs>' + defsArc + '</defs>' : '') + membres.map(function(m){ return m.s; }).join('');
  var tor = torse(K, h, T, P, avant, fond, {ouv:function(){ return J2.map(function(j){ return jambeSVG(K, V, j, P, 'o').svg; }).join(''); }});
  /* la tête : au bout du cou, qui part du haut du buste. Elle reste droite quand le dos se penche (elle regarde devant elle) ;
     P.hoche la fait baisser (> 0) ou lever le nez. */
  var yawT = ba[2] + ds[2] + (P.tete || 0), Vt = U.vue((HV.capDe ? HV.capDe(P) : P.cap || 0) + yawT), ho = P.hoche || 0;
  /* (P.couche, de 0 à 1 : allongée, la tête ne reste plus droite, elle se pose dans le prolongement du cou — Romain, 16 h 39 : au sol,
     « la tête, elle est toute bizarre ») */
  var co = borne(P.couche || 0, 0, 1);
  var upC = mv(T.M[0], [0, -1, 0]), upT = mv(mm(RY(yawT), RX(ho * 0.5)), [0, -1, 0]), N0 = T.lieu([0, 139, -2]), nd = uni(add(mul(upC, 0.5 + 0.5 * co), upT, 0.5 - 0.5 * co)), Hp = add(N0, nd, 19);
  var pN0 = pj(N0, V), pN1 = pj(add(N0, nd, 30), V), lN = d2(pN0, pN1), angN = lN < 1 ? 0 : Math.atan2(pN1[0] - pN0[0], pN0[1] - pN1[1]) / RAD * Math.min(1, lN / 16);
  var pHp = pj(Hp, V), rc = Math.sqrt(77.4 * V.c * V.c + 59.3 * V.s * V.s), bc = pj(T.lieu([0, 146, -2]), V);
  /* l'ombre au sol : sous les pieds (et sous une main ou un genou posé) */
  var xs = [pj(jg.An, V), pj(jd.An, V)], ys = 0;
  [jg.Kn, jd.Kn, bG.W, bD.W].forEach(function(q){ if(q[1] > SOL - 26) xs.push(pj(q, V)); });
  var xa = 1e9, xb = -1e9; xs.forEach(function(q){ xa = Math.min(xa, q[0]); xb = Math.max(xb, q[0]); ys += q[2] / xs.length; });
  return {T:T, dbg:dbg, derriere:der, jambes:'', jambesApres:jb, torse:tor, carquoisDevant:cq && dos ? cq.svg : '',
    devant:dessus ? pa.map(function(o){ return o.manche; }).join('') + pa.map(function(o, i){ return o.paume + objetsTout(o, mPa[i]); }).join('') + pa.map(function(o){ return o.main; }).join('') : '', dos:dos, dessus:dessus,
    cou:function(tDos, ombre){ return cou(K, V, pj(add(Hp, nd, tDos ? 13 : 20), V), bc, rc, ombre); },
    tete:{V:Vt, tx:pHp[0] + 3 * Vt.s, ty:pHp[1] - 28, px:-3 * Vt.s, rot:(P.pen || 0) + ho * Vt.s + co * angN, hocheF:ho * Vt.c, fond:pHp[2] - T.dB},
    ombre:{cx:(xa + xb) / 2, rx:Math.max(50 + 8 * Math.abs(V.s), (xb - xa) / 2 + 32), cy:SOL + 1 + PSOL * ys},
    os:{bassin:T.Pc, hancheG:jg.Ha, hancheD:jd.Ha, genouG:jg.Kn, genouD:jd.Kn, chevilleG:jg.An, chevilleD:jd.An, talonG:jg.Ta, talonD:jd.Ta, orteilG:jg.Po, orteilD:jd.Po,
      epauleG:T.buste([-31.5, 151, 0]), epauleD:T.buste([31.5, 151, 0]), coudeG:bG.El, coudeD:bD.El, poignetG:bG.W, poignetD:bD.W, cou:N0, tete:Hp}};
};
HV.SOL = SOL;
})(window);
