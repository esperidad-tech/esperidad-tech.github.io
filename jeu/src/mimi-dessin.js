/* ==========================================================
   Mimi en pantin — 1 sur 3 : SON DESSIN ET SON SQUELETTE (Romain, 16 novembre, 18 h 27 : « je veux vraiment que tu travailles
   beaucoup l'animation de Mimi », « les pattes : le bas des pattes, ensuite le mollet, la cuisse », « qu'elle soit vraiment un
   petit chat adorable »).  DESIGN-saison1.md §12.66.

   Ce fichier ne bouge rien : il sait DESSINER Mimi pour un jeu de réglages P (une « pose » : où sont ses hanches, ses épaules,
   sa tête, ses quatre pattes, sa queue, ses yeux, sa bouche…), et rien d'autre.
     MimiPantin.resoudre(P)  → pour chaque morceau du dessin, la valeur à lui donner (une place, un tracé, montré ou caché)
     MimiPantin.dessin(v, P, acc) → le dessin complet (du SVG), déjà dans la pose P
   Le fichier 2 (mimi-pantin.js) fait vivre ce dessin image par image ; le fichier 3 (mimi-gestes.js) contient les poses et les gestes.

   COMMENT ELLE EST FAITE
   - Vue de profil (elle regarde à droite ; à gauche, tout le dessin est retourné), la tête tournée vers nous.
   - Les mesures : le point (0, 0) est par terre, sous son milieu ; y descend (en l'air : y négatif).
   - Le corps est un tracé recalculé à chaque image entre les hanches et les épaules (le dos plie) ; les rayures, le ventre clair
     et le reflet du dos suivent.
   - Chaque patte : trois os et un bout de patte. Derrière : la cuisse, le mollet, le pied, les doigts. Devant : le bras,
     l'avant-bras, la main. On dit seulement où poser le bout : le genou et le coude se placent tout seuls (ik).
   - La queue : six morceaux, chacun tourne par rapport au précédent.
   - Pour qu'aucun trait ne se voie aux jointures, chaque groupe de morceaux est dessiné deux fois : tous les contours d'abord
     (en sombre, un peu plus gros), puis toute la fourrure par-dessus. Un morceau = deux éléments qui portent le même data-m.
   - Léger : ni filtre, ni flou, ni masque ; des tracés, des dégradés, des déplacements.
   ========================================================== */
(function(G){
'use strict';
var M = G.MimiPantin = {};
var K = '#24182e', RAD = Math.PI / 180, EP = 2.3, MC = 2.9;
M.ECH = 1.55;                 /* sa taille dans le cadre (Romain : « elle est un peu petite ») */
M.W = 176; M.H = 146;         /* son cadre */
M.X0 = 88; M.Y0 = 137;        /* là où est le point (0, 0) dans le cadre */
var LG = M.LG = {bras:11.5, avb:14, cui:11.5, jam:12, pied:8.5, q:7.6};   /* la longueur des os */

function f1(x){ return (Math.round(x * 10) / 10).toString(); }
function f2(x){ return (Math.round(x * 100) / 100).toString(); }
function borne(x, a, b){ return x < a ? a : x > b ? b : x; }
function hexRgb(h){ h = h.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(h.substr(i, 2), 16); }); }
function rgbHex(c){ return '#' + c.map(function(v){ v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function mel(a, b, t){ var x = hexRgb(a), y = hexRgb(b); return rgbHex([0, 1, 2].map(function(i){ return x[i] + (y[i] - x[i]) * t; })); }
function sombre(c, t){ return mel(c, '#1c1230', t); }
function clair(c, t){ return mel(c, '#ffffff', t); }
M.outils = {f1:f1, f2:f2, borne:borne, mel:mel, sombre:sombre, clair:clair};

/* Trois pelages : [pelage, rayures, ventre, iris clair, iris foncé, reflet, tigrée ?] (0 : Mimi, rousse tigrée) */
var CHATS = M.CHATS = [
  ['#f2a65a', '#c4612a', '#fff1dc', '#e6f27a', '#6fae35', '#ffcf96', 1],
  ['#b9b3d2', '#736d8e', '#f7f5fc', '#ffe27a', '#de8424', '#dcd8ee', 1],
  ['#4a4060', '#251d38', '#f7f4ff', '#f6f08a', '#adc23a', '#6c6290', 0]
];
/* Ses dégradés (posés une fois, avec ceux de l'atelier) : le corps (clair en haut), le ventre, la tête, l'œil, l'oreille, la truffe */
M.defs = function(){
  function st(l){ return l.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"/>'; }).join(''); }
  function lin(id, l){ return '<linearGradient id="atg-' + id + '" x1="0" y1="0" x2="0" y2="1">' + st(l) + '</linearGradient>'; }
  function rad(id, l, cx, cy, r){ return '<radialGradient id="atg-' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + st(l) + '</radialGradient>'; }
  return CHATS.map(function(p, i){
    return lin('mim' + i, [[p[5], 0], [p[0], 0.42], [sombre(p[0], 0.2), 1]]) +
      lin('mimv' + i, [[p[2], 0], [mel(p[2], p[0], 0.28), 1]]) +
      rad('mimt' + i, [[p[5], 0], [p[0], 0.55], [sombre(p[0], 0.13), 1]], 0.5, 0.3, 0.78) +
      rad('mimy' + i, [[clair(p[3], 0.35), 0], [p[3], 0.4], [p[4], 1]], 0.5, 0.72, 0.72);
  }).join('') + rad('mimo', [['#ffd6e0', 0], ['#ef86a3', 1]], 0.5, 0.85, 0.85) + lin('mimn', [['#ffb8c8', 0], ['#e4668a', 1]]);
};

/* ---------- Les briques du dessin ---------- */
function PF(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function PT(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function PC(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (w || MC) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function CT(d){ return ' d="' + d + '" fill="' + K + '" stroke="' + K + '" stroke-width="' + (2 * EP) + '" stroke-linejoin="round"'; }   /* le contour d'un morceau */
/* un chemin dont les points sont donnés par rapport à (cx, cy) */
function rp(cx, cy, l){
  var s = '', k = 0;
  l.forEach(function(v){ if(typeof v === 'string'){ s += (s ? ' ' : '') + v; k = 0; } else { s += k % 2 ? ',' + f1(cy + v) : (k ? ' ' : '') + f1(cx + v); k++; } });
  return s;
}
/* un os : rond de rayon r0 à l'attache (0, 0), rond de rayon r1 au bout (0, L) */
function os(r0, r1, L){ return 'M' + f1(-r0) + ',0 A' + f1(r0) + ',' + f1(r0) + ' 0 0 1 ' + f1(r0) + ',0 L' + f1(r1) + ',' + f1(L) + ' A' + f1(r1) + ',' + f1(r1) + ' 0 0 1 ' + f1(-r1) + ',' + f1(L) + ' Z'; }
/* une courbe fermée qui passe par tous les points */
function lisse(p){
  var n = p.length, s = 'M' + f1(p[0][0]) + ',' + f1(p[0][1]), i, a, b, c, d;
  for(i = 0; i < n; i++){
    a = p[(i + n - 1) % n]; b = p[i]; c = p[(i + 1) % n]; d = p[(i + 2) % n];
    s += ' C' + f1(b[0] + (c[0] - a[0]) / 6) + ',' + f1(b[1] + (c[1] - a[1]) / 6) + ' ' + f1(c[0] - (d[0] - b[0]) / 6) + ',' + f1(c[1] - (d[1] - b[1]) / 6) + ' ' + f1(c[0]) + ',' + f1(c[1]);
  }
  return s + ' Z';
}
/* Deux os de longueurs l1, l2, de l'attache (jx, jy) jusqu'à la cible : la direction de chacun (sens : de quel côté plie l'articulation) */
function ik(jx, jy, tx, ty, l1, l2, sens){
  var dx = tx - jx, dy = ty - jy, d = Math.sqrt(dx * dx + dy * dy), max = l1 + l2 - 0.05, min = Math.abs(l1 - l2) + 0.6;
  if(d < 0.001){ dx = 0; dy = 1; d = 1; }
  if(d > max){ dx *= max / d; dy *= max / d; d = max; } else if(d < min){ dx *= min / d; dy *= min / d; d = min; }
  var base = Math.atan2(dy, dx), al = Math.acos(borne((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  var a1 = base + sens * al, kx = jx + l1 * Math.cos(a1), ky = jy + l1 * Math.sin(a1);
  return [a1, Math.atan2(jy + dy - ky, jx + dx - kx), kx, ky, jx + dx, jy + dy];
}
function tr(x, y, a){ return 'translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(a / RAD - 90) + ')'; }

/* ==========================================================
   Résoudre une pose : P (des nombres) → R (ce qu'on écrit dans le dessin).
   Les noms de R : « morceau » (sa place : transform), « morceau:d » (un tracé), « morceau:v » (montré ou caché), « morceau:o » (opacité).
   Ce qui commence par « _ » : des points du squelette, pour le reste du programme (où est sa tête, sa bouche, sa queue).
   ========================================================== */
M.resoudre = function(P, R){
  R = R || {};
  var hx = P.hx, hy = P.hy, sx = P.sx, sy = P.sy, dx = sx - hx, dy = sy - hy, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
  var flip = P.bu > 0.5 ? -1 : 1, amp = Math.abs(1 - 2 * P.bu);      /* sur le dos : le ventre passe en haut */
  var cx = (hx + sx) / 2 + uy * P.arc * 2, cy = (hy + sy) / 2 - ux * P.arc * 2;
  /* un point du dos : [x, y, la direction, le côté du dos, l'épaisseur côté dos, côté ventre] */
  function pt(t){
    var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t, x = a * hx + b * cx + c * sx, y = a * hy + b * cy + c * sy;
    var tx = (1 - t) * (cx - hx) + t * (sx - cx), ty = (1 - t) * (cy - hy) + t * (sy - cy), tl = Math.sqrt(tx * tx + ty * ty) || 1;
    tx /= tl; ty /= tl;
    var sn = Math.sin(Math.PI * t), r0 = P.rh + (P.rs - P.rh) * t;
    return [x, y, tx, ty, ty * flip, -tx * flip, r0 + P.rm * sn, r0 + P.vent * sn];
  }
  var N = 6, i, q, top = [], bot = [], an;
  for(i = 0; i <= N; i++){ q = pt(i / N); top.push([q[0] + q[4] * q[6], q[1] + q[5] * q[6]]); bot.push([q[0] - q[4] * q[7], q[1] - q[5] * q[7]]); }
  var q0 = pt(0), qN = pt(1), pts = top.slice();
  [55, 0, -55].forEach(function(dg){ an = dg * RAD; pts.push([sx + (qN[2] * Math.cos(an) + qN[4] * Math.sin(an)) * P.rs, sy + (qN[3] * Math.cos(an) + qN[5] * Math.sin(an)) * P.rs]); });
  for(i = N; i >= 0; i--) pts.push(bot[i]);
  [-55, 0, 55].forEach(function(dg){ an = dg * RAD; pts.push([hx + (-q0[2] * Math.cos(an) + q0[4] * Math.sin(an)) * P.rh, hy + (-q0[3] * Math.cos(an) + q0[5] * Math.sin(an)) * P.rh]); });
  R['torse:d'] = lisse(pts);
  /* les rayures : des pointes qui descendent du dos, un peu couchées vers l'arrière */
  var s = '', w = 3.8;
  [0.17, 0.33, 0.5, 0.66, 0.82].forEach(function(tt, j){
    q = pt(tt);
    var L = q[6] * (j % 2 ? 0.86 : 1.1) * amp;
    if(L < 1.2) return;
    var ax = q[0] + q[4] * (q[6] - 0.2), ay = q[1] + q[5] * (q[6] - 0.2), bx = ax - q[4] * L - q[2] * 2.6, by = ay - q[5] * L - q[3] * 2.6;
    s += 'M' + f1(ax - q[2] * w / 2) + ',' + f1(ay - q[3] * w / 2) +
      ' Q' + f1(ax - q[2] * (w / 2 + 1.5) - q[4] * L * 0.55) + ',' + f1(ay - q[3] * (w / 2 + 1.5) - q[5] * L * 0.55) + ' ' + f1(bx) + ',' + f1(by) +
      ' Q' + f1(ax + q[2] * (w / 2 - 1.4) - q[4] * L * 0.5) + ',' + f1(ay + q[3] * (w / 2 - 1.4) - q[5] * L * 0.5) + ' ' + f1(ax + q[2] * w / 2) + ',' + f1(ay + q[3] * w / 2) + ' Z ';
  });
  R['raies:d'] = s || 'M0,0';
  /* le ventre clair : le long du dessous, le bord du haut ébouriffé */
  var vo = '', vi = '', n2 = 8, e, ep;
  for(i = 0; i <= n2; i++){
    q = pt(0.2 + 0.7 * i / n2);
    e = q[7] - 1; ep = q[7] * 0.56 * amp * Math.pow(Math.sin(Math.PI * i / n2), 0.6) + (i % 2 ? 1.3 : -0.4) * amp;
    vo += (i ? ' L' : 'M') + f1(q[0] - q[4] * e) + ',' + f1(q[1] - q[5] * e);
    vi = ' L' + f1(q[0] - q[4] * (e - Math.max(0, ep))) + ',' + f1(q[1] - q[5] * (e - Math.max(0, ep))) + vi;
  }
  R['ventre:d'] = vo + vi + ' Z';
  /* le reflet du dos, et quelques poils sur le flanc */
  s = '';
  for(i = 0; i <= 7; i++){ q = pt(0.14 + 0.72 * i / 7); s += (i ? ' L' : 'M') + f1(q[0] + q[4] * (q[6] - 2.6)) + ',' + f1(q[1] + q[5] * (q[6] - 2.6)); }
  R['dosl:d'] = amp > 0.3 ? s : 'M0,0';
  s = '';
  [[0.28, -0.25], [0.45, 0.1], [0.6, -0.3], [0.74, 0.05]].forEach(function(u){ q = pt(u[0]); var px = q[0] - q[4] * q[7] * u[1], py = q[1] - q[5] * q[7] * u[1]; s += 'M' + f1(px) + ',' + f1(py) + ' l' + f1(-q[2] * 3 - q[4] * 1.2) + ',' + f1(-q[3] * 3 - q[5] * 1.2) + ' '; });
  R['poils:d'] = amp > 0.3 ? s : 'M0,0';
  R.plas = 'translate(' + f1(sx) + ',' + f1(sy) + ') rotate(' + f1(Math.atan2(qN[3], qN[2]) / RAD) + ')' + (flip < 0 ? ' scale(1,-1)' : '');
  R['plas:o'] = f2(borne(amp * 1.4, 0, 1));

  /* ---- les pattes ---- */
  var Hj = [hx - q0[2] * 1 - q0[4] * 2.5, hy - q0[3] * 1 - q0[5] * 2.5], Sj = [sx + qN[2] * 4 - qN[4] * 2.5, sy + qN[3] * 4 - qN[5] * 2.5];
  function arriere(pre, jx, jy){
    var phi = P[pre + 'p'] * RAD, c = Math.cos(phi), sn = Math.sin(phi);
    var o = ik(jx, jy, P[pre + 'x'] - LG.pied * c, P[pre + 'y'] - LG.pied * sn, LG.cui, LG.jam, -flip);
    R[pre + 'c'] = tr(jx, jy, o[0]); R[pre + 'j'] = tr(o[2], o[3], o[1]); R[pre + 'p'] = tr(o[4], o[5], phi);
    R[pre + 't'] = 'translate(' + f1(o[4] + LG.pied * c) + ',' + f1(o[5] + LG.pied * sn) + ') rotate(' + f1(P[pre + 'q']) + ')';
    R[pre + 'f:v'] = P[pre + 'f'] > 0.5 ? 'inline' : 'none'; R[pre + 'k:v'] = P[pre + 'f'] > 0.5 ? 'none' : 'inline';
    R['_' + pre] = [o[4] + LG.pied * c, o[5] + LG.pied * sn];
  }
  function avant(pre, jx, jy){
    var o = ik(jx, jy, P[pre + 'x'], P[pre + 'y'], LG.bras, LG.avb, flip);
    R[pre + 'b'] = tr(jx, jy, o[0]); R[pre + 'a'] = tr(o[2], o[3], o[1]);
    R[pre + 't'] = 'translate(' + f1(o[4]) + ',' + f1(o[5]) + ') rotate(' + f1(P[pre + 'q']) + ')';
    R[pre + 'f:v'] = P[pre + 'f'] > 0.5 ? 'inline' : 'none'; R[pre + 'k:v'] = P[pre + 'f'] > 0.5 ? 'none' : 'inline';
    R['_' + pre] = [o[4], o[5]];
  }
  arriere('j1', Hj[0], Hj[1]); arriere('j2', Hj[0] + 2.8, Hj[1] - 0.8);
  avant('a1', Sj[0], Sj[1]); avant('a2', Sj[0] + 2.6, Sj[1] - 0.8);

  /* ---- la queue ---- */
  var px = hx - q0[2] * P.rh * 0.8 + q0[4] * P.rh * 0.32, py = hy - q0[3] * P.rh * 0.8 + q0[5] * P.rh * 0.32, ang = P.q0, pq = [];
  for(i = 0; i < 6; i++){
    if(i) ang += P['q' + i];
    R['q' + i] = tr(px, py, ang * RAD);
    pq.push([px, py]);
    px += LG.q * Math.cos(ang * RAD); py += LG.q * Math.sin(ang * RAD);
  }
  pq.push([px, py]); R._q = pq;

  /* ---- le cou, la tête ---- */
  var tcx = sx + P.tx, tcy = sy + P.ty, ta = P.ta * RAD, ct = Math.cos(ta), stn = Math.sin(ta);
  R['cou:d'] = 'M' + f1(sx + qN[2] * 2 + qN[4] * 3) + ',' + f1(sy + qN[3] * 2 + qN[5] * 3) + ' L' + f1(tcx - 3 * ct - 7 * stn) + ',' + f1(tcy - 3 * stn + 7 * ct);
  R.tete = 'translate(' + f1(tcx) + ',' + f1(tcy) + ') rotate(' + f1(P.ta) + ')';
  var lx = borne(P.lx, -1, 1), ly = borne(P.ly, -1, 1);
  R.vis = 'translate(' + f2(lx * 2.3) + ',' + f2(ly * 1.5) + ')';
  R.mus = 'translate(' + f2(lx * 1) + ',' + f2(ly * 0.6) + ')';
  R.ors = 'translate(' + f2(-lx * 1.1) + ',' + f2(-ly * 0.5) + ')';
  var apl = 1 - 0.26 * borne(P.oa, 0, 1);
  R.orG = 'translate(-10.5,-9) rotate(' + f1(P.og) + ') scale(1,' + f2(apl) + ') translate(10.5,9)';
  R.orD = 'translate(10.5,-9) rotate(' + f1(P.od) + ') scale(1,' + f2(apl) + ') translate(-10.5,9)';
  /* les yeux : la pupille suit le regard et s'ouvre (pu) ; la paupière descend du haut (yo : 1 ouvert, 0 fermé) ; yc : fermés de plaisir (^ ^) */
  var clos = P.yc > 0.5, kp = borne(1 - P.yo, 0, 1), psx = 0.6 + borne(P.pu, 0, 1) * 1.25, pdx = lx * 1.5, pdy = ly * 0.8;
  R.pupG = 'translate(' + f2(-7.2 + pdx) + ',' + f2(-1 + pdy) + ') scale(' + f2(psx) + ',1)';
  R.pupD = 'translate(' + f2(7.2 + pdx) + ',' + f2(-1 + pdy) + ') scale(' + f2(psx) + ',1)';
  R.ref = 'translate(' + f2(pdx * 0.45) + ',' + f2(pdy * 0.45) + ')';
  var ppT = ' translate(0,' + f2(-8.1 * (1 - kp)) + ') scale(1,' + f2(Math.max(kp, 0.001)) + ')', ppA = P.pt * Math.sin(Math.PI * Math.min(1, kp * 1.15));   /* (la paupière penche un peu : un air doux, jamais fâché — sauf pt négatif) */
  R.ppG = 'rotate(' + f1(-ppA) + ' -7.2 -1)' + ppT; R.ppD = 'rotate(' + f1(ppA) + ' 7.2 -1)' + ppT;
  R['pp:v'] = clos || kp < 0.02 ? 'none' : 'inline';
  R['ferme:v'] = clos ? 'inline' : 'none';
  R['yeux:v'] = clos ? 'none' : 'inline';
  /* la bouche : fermée (bo = 0), ouverte (miaou : 1, bâillement : jusqu'à 2) ; la langue (la) */
  var bo = Math.max(0, P.bo), ouv = bo > 0.06;
  R['bouche:v'] = ouv ? 'none' : 'inline';
  R['gueule:v'] = ouv ? 'inline' : 'none';
  R.gueule = 'translate(0,7.6) scale(' + f2(0.7 + 0.3 * Math.min(bo, 1) + 0.3 * Math.max(0, bo - 1)) + ',' + f2(0.25 + 0.75 * Math.min(bo, 1) + 0.62 * Math.max(0, bo - 1)) + ') translate(0,-7.6)';
  R['langue:v'] = P.la > 0.05 ? 'inline' : 'none';
  R.langue = 'translate(' + f2(P.lt || 0) + ',7.2) scale(1,' + f2(Math.max(0.05, P.la)) + ') translate(0,-7.2)';
  R.mouG = 'rotate(' + f1(P.mo) + ' -9.6 6.6)';
  R.mouD = 'rotate(' + f1(-P.mo) + ' 9.6 6.6)';
  R['joue:o'] = f2(0.26 + 0.5 * borne(P.jo, 0, 1));

  /* ---- tout le pantin : sa place, son côté (co : 1 à droite, -1 à gauche), un tour sur lui-même (rr) ---- */
  var co = P.co, bcx = (hx + sx) / 2, bcy = (hy + sy) / 2;
  if(Math.abs(co) < 0.3) co = co < 0 ? -0.3 : 0.3;                 /* (de profil : jamais tout à fait plate) */
  R.rac = 'translate(' + M.X0 + ',' + M.Y0 + ') scale(' + f2(M.ECH * co) + ',' + M.ECH + ') translate(' + f1(P.rx) + ',' + f1(P.ry) + ')' + (P.rr ? ' rotate(' + f1(P.rr) + ' ' + f1(bcx) + ' ' + f1(bcy) + ')' : '');
  var haut = Math.max(0, -P.ry), ko = Math.max(0.35, 1 - haut / 110);
  R.ombre = 'translate(' + f1(M.X0 + M.ECH * co * (bcx + P.rx)) + ',' + f1(M.Y0 + 1.5) + ') scale(' + f2((0.62 + len / 105) * ko * M.ECH) + ',' + f2(ko * M.ECH) + ')';
  R['ombre:o'] = f2(0.3 * ko);
  R['zzz:v'] = P.zz > 0.5 ? 'inline' : 'none';
  R._qd = P.qd > 0.5 ? 1 : 0;
  R._tete = [tcx, tcy];
  R._gueule = [tcx + (lx * 3.3) * ct - (9 + ly * 2) * stn, tcy + (lx * 3.3) * stn + (9 + ly * 2) * ct];
  R._h = [hx, hy]; R._s = [sx, sy];
  R._ventre = flip;
  return R;
};

/* ==========================================================
   Le dessin complet, dans la pose P (v : son pelage ; acc : {cou, tete} : le dessin de ses accessoires, autour de (0, 0) = le milieu de sa tête)
   ========================================================== */
function couleurs(v){
  var i = ((v || 0) % CHATS.length + CHATS.length) % CHATS.length, p = CHATS[i], tig = !!p[6];
  return {i:i, p:p, tig:tig, F:'url(#atg-mim' + i + ')', U:p[0], S:sombre(p[0], 0.22), V:'url(#atg-mimv' + i + ')', Vu:p[2], R:p[1], L:p[5],
    pat:tig ? mel(p[0], p[2], 0.45) : p[2], patS:tig ? sombre(mel(p[0], p[2], 0.45), 0.2) : sombre(p[2], 0.14), ro:tig ? 1 : 0.5};
}
/* le bout d'une patte : de côté (posée, les doigts devant), et de face (on voit les coussinets roses) */
var MAIN_K = 'M-3.9,-1 C-3.9,-3.5 2.6,-3.7 5,-1.5 C7.3,0.5 6.9,3.5 4,3.5 L-2.6,3.5 C-4.4,3.5 -3.9,0.6 -3.9,-1 Z';
var PIED_K = 'M-3.6,-1.6 C-3.6,-3.8 2.4,-3.9 4.6,-2 C6.6,-0.4 6.4,1.8 3.8,1.8 L-2.6,1.8 C-4.2,1.8 -3.6,-0.4 -3.6,-1.6 Z';
var TOUFFE = 'M10.4,1.4 L14.4,3.4 L11.2,5.2 L13.6,8.2 L9.6,8.6 L10.6,11.8 L6.4,10.8 L6,5.6 Z';     /* la touffe du poitrail, qui dépasse (dans le repère des épaules) */
var FACE = 'M-3.6,0.4 C-3.6,-3.2 -0.6,-5.2 2,-5.2 C4.8,-5.2 7.4,-3.2 7.4,0.4 C7.4,3.6 5,5.6 2,5.6 C-1,5.6 -3.6,3.6 -3.6,0.4 Z';
function coussins(){ return '<ellipse cx="2" cy="1.7" rx="2.5" ry="1.9" fill="#ff9fb6"/>' + [[-1.4, -1.4], [0.8, -3], [3.2, -3], [5.4, -1.4]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.05" fill="#ff9fb6"/>'; }).join(''); }

M.dessin = function(v, P, acc){
  acc = acc || {};
  var c = couleurs(v), p = c.p, R = M.resoudre(P), cont = '', rempl = '';
  function at(slot){
    var k = slot.indexOf(':'), typ = k < 0 ? 't' : slot.slice(k + 1), val = R[slot];
    return ' data-m="' + slot + '"' + (typ === 't' ? ' transform="' + val + '"' : typ === 'd' ? ' d="' + val + '"' : typ === 'v' ? ' display="' + val + '"' : ' opacity="' + val + '"');
  }
  function raie(d, w){ return c.tig ? PT(d, c.R, w || 2.2) : PT(d, c.R, w || 2.2, ' opacity=".5"'); }
  /* un morceau : son contour (dans cont), sa fourrure et ses détails (dans rempl) */
  function mor(slot, d, f, det){ cont += '<path' + at(slot) + CT(d) + '/>'; rempl += '<g' + at(slot) + '>' + PF(d, f) + (det || '') + '</g>'; }
  function bout(pre, dK, f, lignes){
    cont += '<g' + at(pre + 't') + '><path' + at(pre + 'k:v') + CT(dK) + '/><path' + at(pre + 'f:v') + CT(FACE) + '/></g>';
    rempl += '<g' + at(pre + 't') + '><g' + at(pre + 'k:v') + '>' + PF(dK, f) + PT(lignes, K, 1, ' opacity=".6"') + '</g><g' + at(pre + 'f:v') + '>' + PF(FACE, f) + coussins() + '</g></g>';
  }
  function patteAr(pre, f, fp, pres){
    mor(pre + 'c', os(8.4, 4.7, LG.cui), f, pres ? raie('M-6.6,2.6 Q-1,5.4 5.4,3.2 M-5,7.6 Q-1,9.8 4,8.2') + PT('M7.2,-3.4 C8.8,2 7,8.4 4.2,12.6', K, 1.5, ' opacity=".42"') : '');
    mor(pre + 'j', os(4.7, 3.4, LG.jam), f, pres ? raie('M-3.2,4.4 Q0,5.8 3,4.6 M-2.6,9 Q0,10.2 2.4,9.2', 1.9) : '');
    mor(pre + 'p', os(3.4, 3, LG.pied), f, '');
    bout(pre, PIED_K, fp, 'M2,1.5 L2.3,-0.5 M4.2,1.2 L4.3,-0.5');
  }
  function patteAv(pre, f, fp, pres){
    mor(pre + 'b', os(6.4, 4.5, LG.bras), f, pres ? raie('M-4.4,4.6 Q-0.6,6.6 3.6,5.2 M-3.6,9.4 Q-0.4,11 3,9.8', 2) + PT('M-5.4,1.6 C-6.4,5.6 -5.6,9.6 -4,12.4', K, 1.4, ' opacity=".34"') : '');
    mor(pre + 'a', os(4.5, 3.6, LG.avb), f, pres ? raie('M-3,4.6 Q0,6 2.8,4.8 M-2.6,9.4 Q0,10.6 2.4,9.6', 1.9) : '');
    bout(pre, MAIN_K, fp, 'M2.6,3.2 L2.9,1 M5,2.9 L5,1');
  }
  /* --- les pattes de l'autre côté (plus sombres) --- */
  patteAr('j2', c.S, c.patS, 0); patteAv('a2', c.S, c.patS, 0);
  var loin = '<g class="mi-loin">' + cont + rempl + '</g>';
  /* --- la queue : six morceaux, des anneaux, le bout foncé --- */
  cont = ''; rempl = '';
  var rq = [4.1, 4.05, 3.9, 3.7, 3.4, 3.1, 2.5], iq;
  for(iq = 0; iq < 6; iq++){
    mor('q' + iq, os(rq[iq], rq[iq + 1], LG.q), iq === 5 ? (c.tig ? c.R : c.Vu) : c.U,
      (iq < 5 ? raie('M' + f1(-rq[iq] + 1.3) + ',3.8 L' + f1(rq[iq] - 1.3) + ',3.8', 2.3) : '') + PT('M' + f1(rq[iq] - 1.6) + ',0.6 L' + f1(rq[iq + 1] - 1.4) + ',' + f1(LG.q - 0.6), c.L, 1.2, ' opacity=".5"'));
  }
  var queue = '<g class="mi-queue">' + cont + rempl + '</g>';
  /* --- de ce côté-ci : le corps, le cou, les deux pattes --- */
  cont = '<path' + at('torse:d') + ' fill="' + K + '" stroke="' + K + '" stroke-width="' + (2 * EP) + '" stroke-linejoin="round"/>' +
    '<path' + at('cou:d') + ' fill="none" stroke="' + K + '" stroke-width="' + f1(15 + 2 * EP) + '" stroke-linecap="round"/>' +
    '<path' + at('plas') + CT(TOUFFE) + '/>';
  rempl = '<path' + at('torse:d') + ' fill="' + c.F + '"/>' +
    '<path' + at('ventre:d') + ' fill="' + c.V + '"/>' +
    '<path' + at('raies:d') + ' fill="' + c.R + '"' + (c.tig ? '' : ' opacity=".5"') + '/>' +
    '<path' + at('dosl:d') + ' fill="none" stroke="' + c.L + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
    '<path' + at('poils:d') + ' fill="none" stroke="' + sombre(p[0], 0.3) + '" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>' +
    '<path' + at('cou:d') + ' fill="none" stroke="' + c.U + '" stroke-width="15" stroke-linecap="round"/>' +
    /* le plastron : une touffe claire et ébouriffée sur le poitrail */
    '<g' + at('plas') + '>' + PF(TOUFFE, c.V) + '<g' + at('plas:o') + '>' + PF('M3.4,-8.6 C9.4,-8 12.8,-3 12.4,2.6 C12,7.4 9.6,10.6 6.2,12.2 L6.6,9.2 L3.6,10.6 L4.6,7.4 L1.6,7.8 L3.4,4.4 L0.8,2.8 L3.4,0.4 L1.6,-2.6 L4.2,-4.6 Z', c.V) +
      PT('M6.6,-3 l-1.5,2.2 M8.2,2 l-1.7,2 M7.2,7 l-1.6,1.8', sombre(p[2], 0.25), 1) + '</g></g>';
  patteAr('j1', c.U, c.pat, 1); patteAv('a1', c.U, c.pat, 1);
  var pres = '<g class="mi-pres">' + cont + rempl + '</g>';
  return '<g class="mi-ombre"' + at('ombre') + '><ellipse' + at('ombre:o') + ' cx="0" cy="0" rx="30" ry="4" fill="#000"/></g>' +
    '<g class="mi-rac"' + at('rac') + '>' + loin + (R._qd ? pres + queue : queue + pres) + tete(c, at, acc) + '</g>' +
    '<g' + at('zzz:v') + '><text class="at-zzz" x="' + (M.X0 + 34) + '" y="' + (M.Y0 - 70) + '" font-size="22" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>' +
    '<text class="at-zzz z2" x="' + (M.X0 + 50) + '" y="' + (M.Y0 - 84) + '" font-size="17" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text></g>';
};

/* ---------- La tête (vue de face) : toutes ses expressions sont là, la pose dit lesquelles on voit ---------- */
function tete(c, at, acc){
  var p = c.p, i = c.i, FT = 'url(#atg-mimt' + i + ')', R = function(l){ return rp(0, 0, l); };
  function oreille(sg, slot){
    var X = function(v){ return f1(sg * v); };
    var ext = 'M' + X(3.4) + ',-12.6 C' + X(6.4) + ',-20 ' + X(12.6) + ',-27.6 ' + X(17.8) + ',-30.4 C' + X(20.4) + ',-24 ' + X(20.4) + ',-13.6 ' + X(16.8) + ',-4.6 Z';
    var inte = 'M' + X(7) + ',-13 C' + X(9) + ',-18.4 ' + X(13) + ',-23.6 ' + X(16.5) + ',-26 C' + X(17.6) + ',-21 ' + X(17.4) + ',-14 ' + X(15.2) + ',-8.4 Z';
    var pointe = 'M' + X(14.2) + ',-27 C' + X(15.6) + ',-28.4 ' + X(16.8) + ',-29.6 ' + X(17.8) + ',-30.4 C' + X(19) + ',-27.6 ' + X(19.6) + ',-24.6 ' + X(19.8) + ',-21.6 Z';
    var poils = 'M' + X(9.2) + ',-10.8 L' + X(11.4) + ',-17.8 M' + X(12.2) + ',-10.2 L' + X(13.6) + ',-18.4 M' + X(14.8) + ',-9.6 L' + X(15.6) + ',-16.6';
    return '<g' + at(slot) + '>' + PC(ext, FT) + PF(pointe, c.R, c.tig ? '' : ' opacity=".6"') + PF(inte, 'url(#atg-mimo)') + PT(poils, '#fffaf2', 1.1, ' opacity=".9"') + PT(ext, K, MC) + '</g>';
  }
  function oeil(ex, slot){
    var E = function(l){ return rp(ex, -1, l); }, forme = E(['M', -5.6, 0, 'C', -4.5, -5.8, 4.5, -5.8, 5.6, 0, 'C', 4.5, 5.2, -4.5, 5.2, -5.6, 0, 'Z']);
    return PF(forme, 'url(#atg-mimy' + i + ')') + PF(E(['M', -5.6, 0, 'C', -4.5, -5.8, 4.5, -5.8, 5.6, 0, 'C', 3, -2.6, -3, -2.6, -5.6, 0, 'Z']), p[4], ' opacity=".34"') +
      '<g' + at(slot) + '><ellipse cx="0" cy="0.1" rx="1.6" ry="3.8" fill="' + K + '"/></g>' +
      '<g' + at('ref') + '><circle cx="' + f1(ex + 1.7) + '" cy="-2.7" r="1.55" fill="#fff"/><circle cx="' + f1(ex - 1.8) + '" cy="1" r=".75" fill="#fff" opacity=".85"/></g>' +
      PT(forme, K, 1.3) + PT(E(['M', -5.9, -0.3, 'C', -4.5, -6.2, 4.5, -6.2, 5.9, -0.3]), K, 2.3);
  }
  function paupiere(ex){
    return PF(rp(ex, -1, ['M', -6.5, 0.4, 'C', -5.1, -7.3, 5.1, -7.3, 6.5, 0.4, 'C', 5.1, 6, -5.1, 6, -6.5, 0.4, 'Z']), p[0]) + PT(rp(ex, -1, ['M', -5.3, 2.9, 'Q', 0, 5.7, 5.3, 2.9]), K, 1.7);
  }
  function couvre(ex){ return PF(rp(ex, -1, ['M', -6.5, 0.4, 'C', -5.1, -7.3, 5.1, -7.3, 6.5, 0.4, 'C', 5.1, 6, -5.1, 6, -6.5, 0.4, 'Z']), p[0]); }
  var moust = function(sg){
    var X = function(v){ return sg * v; };
    return rp(0, 0, ['M', X(9.6), 5.2, 'C', X(14.6), 3.6, X(19.4), 3.4, X(24), 4.6, 'M', X(9.6), 7.4, 'C', X(14.6), 7.4, X(19.4), 8.2, X(23.6), 10.2, 'M', X(9.2), 9.4, 'C', X(13.6), 11, X(17.4), 12.8, X(20.6), 15.4]);
  };
  return '<g class="mi-tete"' + at('tete') + '>' +
    '<g class="at-c-oreilles"' + at('ors') + '>' + oreille(-1, 'orG') + oreille(1, 'orD') + '</g>' +
    (acc.cou || '') +
    /* le crâne et ses touffes de joues */
    PC(R(['M', -16.5, 1, 'C', -18, -9, -10.5, -16.5, 0, -16.5, 'C', 10.5, -16.5, 18, -9, 16.5, 1, 'L', 20.6, 4.2, 'L', 16.9, 6, 'L', 19.7, 9.4, 'L', 14.6, 10.4,
      'C', 10, 16.4, -10, 16.4, -14.6, 10.4, 'L', -19.7, 9.4, 'L', -16.9, 6, 'L', -20.6, 4.2, 'Z']), FT) +
    PT(R(['M', -8.4, -13.4, 'C', -4, -15.4, 4, -15.4, 8.4, -13.4]), p[5], 1.5, ' opacity=".8"') +
    (c.tig ? PT(R(['M', -16.9, 2.4, 'L', -12.6, 3.4, 'M', -17.7, 5.8, 'L', -13.4, 6, 'M', 16.9, 2.4, 'L', 12.6, 3.4, 'M', 17.7, 5.8, 'L', 13.4, 6]), p[1], 1.6) : '') +
    '<g' + at('vis') + '>' +
      /* le « M » des chats tigrés, les sourcils */
      (c.tig ? PF(R(['M', -6.9, -15.4, 'C', -6, -12, -5.2, -10, -3.9, -8.2, 'C', -4.2, -10.6, -4.6, -13, -4.9, -15.9, 'Z', 'M', -1.1, -16.3, 'L', 0, -9.6, 'L', 1.1, -16.3, 'Z',
        'M', 6.9, -15.4, 'C', 6, -12, 5.2, -10, 3.9, -8.2, 'C', 4.2, -10.6, 4.6, -13, 4.9, -15.9, 'Z']), p[1]) : '') +
      PT(R(['M', -10.4, -8.6, 'l', -1.2, -2.6, 'M', -8, -9.2, 'l', -0.4, -2.8, 'M', 10.4, -8.6, 'l', 1.2, -2.6, 'M', 8, -9.2, 'l', 0.4, -2.8]).replace(/l /g, 'l'), '#fffdf6', 0.8, ' opacity=".7"') +
      '<g' + at('joue:o') + '><ellipse cx="-12.6" cy="6.4" rx="3" ry="1.8" fill="#ff7a9c"/><ellipse cx="12.6" cy="6.4" rx="3" ry="1.8" fill="#ff7a9c"/></g>' +
      '<g' + at('yeux:v') + '>' + oeil(-7.2, 'pupG') + oeil(7.2, 'pupD') + '</g>' +
      '<g' + at('pp:v') + '><g' + at('ppG') + '>' + paupiere(-7.2) + '</g><g' + at('ppD') + '>' + paupiere(7.2) + '</g></g>' +
      '<g' + at('ferme:v') + '>' + couvre(-7.2) + couvre(7.2) + PT(R(['M', -11.8, 0.2, 'Q', -7.2, -5, -2.6, 0.2, 'M', 2.6, 0.2, 'Q', 7.2, -5, 11.8, 0.2]), K, 2.3) + '</g>' +
      '<g' + at('mus') + '>' +
        /* le museau clair, le menton, les petits points des moustaches */
        PF(R(['M', -9.6, 6.4, 'C', -9.6, 2.2, -3.4, 1.4, 0, 4.4, 'C', 3.4, 1.4, 9.6, 2.2, 9.6, 6.4, 'C', 9.6, 11.4, 3.4, 12.4, 0, 10.6, 'C', -3.4, 12.4, -9.6, 11.4, -9.6, 6.4, 'Z']), c.V) +
        PF(R(['M', -4.2, 10.8, 'C', -3, 14.2, 3, 14.2, 4.2, 10.8, 'Z']), mel(p[2], p[0], 0.3)) +
        [[-4.2, 6.8], [-6.6, 6], [-5.8, 8.8], [4.2, 6.8], [6.6, 6], [5.8, 8.8]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r=".75" fill="' + sombre(p[2], 0.5) + '"/>'; }).join('') +
        '<g' + at('gueule:v') + '><g' + at('gueule') + '>' + PC(R(['M', -4.4, 7.6, 'C', -4.8, 15, 4.8, 15, 4.4, 7.6, 'C', 2, 9.4, -2, 9.4, -4.4, 7.6, 'Z']), '#5b1d34', 1.4) +
          PF(R(['M', -2.8, 12.6, 'C', -2.2, 10.4, 2.2, 10.4, 2.8, 12.6, 'C', 1.4, 13.9, -1.4, 13.9, -2.8, 12.6, 'Z']), '#ff8fab') +
          PF(R(['M', -3.5, 8.4, 'L', -2.7, 10.7, 'L', -1.9, 8.8, 'Z', 'M', 3.5, 8.4, 'L', 2.7, 10.7, 'L', 1.9, 8.8, 'Z']), '#fff') + '</g></g>' +
        '<g' + at('langue:v') + '><g' + at('langue') + '>' + PC(R(['M', -2.3, 7.2, 'C', -2.8, 12.6, 2.8, 12.6, 2.3, 7.2, 'Z']), '#ff8fab', 0.9) + PT(R(['M', 0, 8, 'L', 0, 10.6]), '#e4668a', 0.9) + '</g></g>' +
        PC(R(['M', -3.3, 2.8, 'C', -3.3, 1.2, 3.3, 1.2, 3.3, 2.8, 'C', 3.3, 4.4, 1.1, 5.7, 0, 5.9, 'C', -1.1, 5.7, -3.3, 4.4, -3.3, 2.8, 'Z']), 'url(#atg-mimn)', 1.3) +
        '<ellipse cx="-1" cy="2.4" rx="1" ry=".55" fill="#fff" opacity=".8"/>' +
        '<g' + at('bouche:v') + '>' + PT(R(['M', 0, 5.9, 'L', 0, 7.4, 'M', 0, 7.4, 'Q', -2.4, 10.2, -5.2, 8, 'M', 0, 7.4, 'Q', 2.4, 10.2, 5.2, 8]), K, 1.45) + '</g>' +
        '<g data-m="butin"></g>' +
        '<g' + at('mouG') + '>' + PT(moust(-1), K, 1.8, ' opacity=".28"') + PT(moust(-1), '#fffdf6', 0.95) + '</g>' +
        '<g' + at('mouD') + '>' + PT(moust(1), K, 1.8, ' opacity=".28"') + PT(moust(1), '#fffdf6', 0.95) + '</g>' +
      '</g>' +
    '</g>' +
    (acc.tete || '') +
    '</g>';
}
/* Sa tête seule, bien droite (les petits portraits) : du SVG autour de (0, 0) */
M.tete = function(v, acc, P){
  var R = M.resoudre(P || G.MimiPantin.pose('assis', {lx:0, ly:0}));
  R.tete = 'translate(0,0)';
  function at(slot){
    var k = slot.indexOf(':'), typ = k < 0 ? 't' : slot.slice(k + 1), val = R[slot];
    return ' data-m="' + slot + '"' + (typ === 't' ? ' transform="' + val + '"' : typ === 'd' ? ' d="' + val + '"' : typ === 'v' ? ' display="' + val + '"' : ' opacity="' + val + '"');
  }
  return tete(couleurs(v), at, acc || {});
};
})(window);
