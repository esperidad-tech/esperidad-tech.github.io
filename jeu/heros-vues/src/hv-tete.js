/* ==========================================================
   Les héros « en volume » — 2 sur 5 : LA TÊTE (la peau, le visage, les oreilles).
   Les mesures sont celles de la tête de persos.js : le point (0, 0) est entre les yeux, y descend, le menton est à y = 34.
   z va vers le nez ; l'axe du cou est à z = -3.

   - HV.TETE : le volume de la tête (les coupes), le nez en plus (une bosse sur la ligne du milieu).
   - Le visage (yeux, sourcils, nez, bouche, joues) est donné comme on le voit de face, puis posé sur le volume :
     quand elle tourne la tête, les traits glissent du côté où elle regarde, l'œil du fond se resserre puis passe derrière
     la joue, le nez sort du contour, l'oreille et le côté de la tête apparaissent.
   - HV.tete(K, h, V, P) → les morceaux du dessin, dans les mesures de la tête.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, U = HV.outils, O = HV.O, RAD = HV.RAD;
var f1 = U.f1, borne = U.borne, vers = U.vers, doux = U.doux, coupe = U.coupe, table = U.table, leve = U.leve, PF = U.PF, PT = U.PT, PC = U.PC;

/* ---------- Le volume de la tête ---------- */
var T_A = table([[5, 26], [10, 25.4], [15.3, 24.1], [20, 21.6], [23.6, 18.8], [27, 14.8], [29.9, 10.6], [32, 6.6], [33.5, 2.8], [34, 0.02]]);
var T_ZM = table([[12, -3], [15, -1.6], [18, 1.2], [21, 4.8], [24, 8.4], [27, 11.4], [30, 13.5], [33, 14.8], [34, 15]]);
var T_ZF = table([[-8, 22.5], [-2, 22.4], [4, 21.5], [9, 21.7], [14, 22.3], [19, 22.6], [22, 22.2], [25, 21.9], [28, 20.6], [31, 19.9], [33, 17.6], [34, 15.1]]);
var T_ZB = table([[-16, -31.5], [-8, -31], [0, -29], [6, -26], [10, -23], [14, -18.5], [17, -13], [20, -8.5], [23, -4], [26, 0.5], [29, 5.5], [31.5, 10], [33.5, 14], [34, 14.9]]);
var T_PF = HV.carrure = table([[-57, 2], [-49, 2.1], [-30, 2.7], [-12, 3.6], [4, 4], [16, 3.6], [26, 2.6], [34, 2]]);
function rond(y, y0, h){ var k = (y - y0) / h; return Math.sqrt(Math.max(0, 1 - k * k)); }
function coupeTete(y){
  var a = y <= -12 ? 26 * rond(y, -12, 37) : y <= 5 ? 26 : T_A(y);
  var zm = y <= 12 ? -3 : T_ZM(y);
  var zf = y <= -8 ? -3 + 25.5 * rond(y, -8, 41) : T_ZF(y);
  var zb = y <= -16 ? -3 - 28.5 * rond(y, -16, 33) : T_ZB(y);
  return coupe(a, zm, zf - zm, zm - zb, T_PF(y), 2);
}
var TETE = HV.TETE = U.volume(-49, 34, coupeTete);
/* la ligne du milieu du visage, vue de profil : le front, le creux entre les yeux, le nez, les lèvres, le menton.
   Elle passe un peu devant le reste du visage (les yeux sont en retrait) ; c'est elle qui dessine le profil. */
var T_MIL = table([[-34, 19.6], [-26, 22.6], [-18, 24.6], [-10, 25.5], [-3, 25.3], [3, 24.3], [8, 25], [12.5, 26.9], [15.6, 28.9], [17.4, 26.6], [19, 23.6], [21.2, 23.9], [22.6, 22.9], [24.6, 23.4], [27.4, 21.5], [30.4, 21.5], [32.6, 19.4], [34, 15.4]]);
function zMilieu(y){ var S = TETE.a(y, 0); return Math.max(S.zm + S.cf, y < -34 ? -99 : T_MIL(y)); }
HV.zMilieu = zMilieu;

/* poser un point du visage (x, y vus de face) → [X, y] */
function pose(x, y, V){ return [leve(TETE.a(y, V.w), x, V), y]; }
function poseL(L, V){ return L.map(function(p){ return pose(p[0], p[1], V); }); }
function ovale(cx, cy, rx, ry, n){ var r = [], i; n = n || 20; for(i = 0; i < n; i++){ var a = 2 * Math.PI * i / n; r.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return r; }

/* ---------- Un œil (d : -1 celui de gauche à l'écran quand elle est de face, 1 celui de droite) ---------- */
function oeil(K, d, V, P, f){
  var ex = 12 * d, ey = 6, yo = borne(P.yo == null ? 1 : P.yo, 0, 1), s = '', garcon = f.sexe === 'm';
  var ox = borne(P.rx || 0, -1, 1) * 2.6, oy = borne(P.ry || 0, -1, 1) * 1.6;
  /* un point de l'œil (v : vers l'extérieur du visage, w : vers le bas) ; la paupière qui se ferme le ramène vers le bas de l'œil */
  function Q(v, w){ w = 7 - (7 - w) * (0.12 + 0.88 * yo); return pose(ex + v * d, ey + w, V); }
  function L(pts){ return pts.map(function(p){ return Q(p[0], p[1]); }); }
  if(yo < 0.14){
    s += PT(U.poly(L(U.ech([[-8.5, 4.6], [0, 8.6], [9.2, 4.2]], 8)), false), O, 2.4);
    if(!garcon) s += PT(U.poly(L(U.ech([[9, 4.4], [12.6, 4.4], [14.4, 2.4]], 4)), false), O, 1.7);
    return s;
  }
  var blanc = L(U.ech([[-8.5, -4], [0, -7.5], [9, -4.5]], 8).concat(U.ech([[9, -4.5], [9.2, 6], [0, 7]], 8).slice(1), U.ech([[0, 7], [-8.5, 6], [-8.5, -4]], 8).slice(1)));
  var dB = U.poly(blanc), cid = K.n('o' + (d < 0 ? 'g' : 'd'));
  s += '<clipPath id="' + cid + '"><path d="' + dB + '"/></clipPath>' + PF(dB, '#fff');
  /* l'iris, la pupille : posés eux aussi (ils se resserrent avec l'œil) */
  function I(cx, cy, rx, ry, n){ return U.poly(ovale(ex + cx, ey + cy, rx, ry, n).map(function(p){ return pose(p[0], 7 + ey - (7 + ey - p[1]) * (0.12 + 0.88 * yo), V); })); }
  s += '<g clip-path="url(#' + cid + ')">' +
    PF(I(ox, 0.5 + oy, 5.9, 7.3, 22), K.u('iris')) +
    PT(I(ox, 0.5 + oy, 5.9, 7.3, 22), O, 1.1, ' opacity=".5"') +
    PF(I(ox, 1 + oy, 2.6, 3.5, 14), '#0a0612') +
    PT(U.poly(L(U.ech([[ox * d - 3.6, 5.6 + oy], [ox * d, 8 + oy], [ox * d + 3.6, 5.6 + oy]], 6)), false), '#fff', 1.5, ' opacity=".45"') +
    PF(I(0, -7.6, 12, 4.8, 16), '#2a1d48', ' opacity=".26"') + '</g>';
  /* les reflets : toujours du même côté (la lumière ne tourne pas avec elle) */
  s += PF(I(ox + 2.2, -2.4 + oy, 2.1, 2.7, 10), '#fff') + PF(I(ox - 2, 4 + oy, 1, 1, 8), '#fff');
  /* la paupière du haut : un trait épais */
  var paup = L(U.ech([[-9.5, -2.5], [-2, -10.5], [9.5, -6]], 10).concat([[10.5, -3]], U.ech([[10.5, -3], [0, -8], [-9.5, -2]], 10).slice(1)));
  s += PF(U.poly(paup), O);
  if(!garcon){
    var cils = '';
    [[[9, -5], [13, -6.5], [14.5, -9.5]], [[9.6, -2.5], [13.2, -2.1], [14.8, -4.3]]].forEach(function(cl){
      U.morceaux(U.ech(cl, 5).map(function(q){ return [ex + q[0] * d, ey + 7 - (7 - q[1]) * (0.12 + 0.88 * yo)]; }), TETE, V).forEach(function(run){ cils += U.poly(run.map(function(q){ return pose(q[0], q[1], V); }), false) + ' '; });
    });
    s += PT(cils, O, 1.8);
  }
  s += PT(U.poly(L(U.ech([[-6, 8], [0, 9.5], [6, 8]], 6)), false), K.peau.trait, 1);
  return s;
}

/* ---------- Une oreille : un petit pavillon accroché sur le côté de la tête, qui part vers l'arrière ---------- */
var OREILLE = [[0, -7], [3, -9.2], [7, -8.6], [9.2, -4], [8.6, 2], [6, 6.4], [2.8, 7.4], [0, 4.6]];
var OREILLE_PLI = [[2.8, -5], [5.8, -4.8], [6.6, 0.4], [4.2, 3.8]];
function oreille(K, d, V){
  var S = TETE.a(3), bx = d * (S.a - 0.6), bz = -3.4, ux = d * 0.52, uz = -0.855;      /* (l'attache ; la direction du pavillon : vers l'extérieur et l'arrière) */
  function Q(p){ var x = bx + ux * p[0], z = bz + uz * p[0]; return [x * V.c + z * V.s, 4 + p[1]]; }
  var d1 = U.lisse(OREILLE.map(Q));
  return {devant:(-bx * V.s + bz * V.c) > -1.5,
    svg:PC(d1, K.u('peauU'), 1.8) + PT(U.courbe(OREILLE_PLI.map(Q)), K.peau.trait, 1.2)};
}

/* ==========================================================
   La tête. V : la vue de la tête ; P : {rx, ry : le regard ; yo : les yeux ouverts (1) ou fermés (0) ; bouche ; sourcils}
   → {peau : le tracé du contour (pour l'ombre sur le cou), svg(avantCheveux) : le visage complet}
   ========================================================== */
HV.tete = function(K, h, V, P, CH){
  var f = {sexe:h.sexe === 'm' ? 'm' : 'f'}, s = '', sg = V.s >= 0 ? 1 : -1, face = V.c > -0.3;
  /* le contour : la tête, et le nez qui dépasse du côté où elle regarde */
  var ct = U.contour(TETE, V, -49, 34, 2.4, function(y, b){ var X = zMilieu(y) * V.s; return [X, X]; });
  function Sv(y){ return TETE.a(y, V.w); }
  var dPeau = U.ferme(ct), cid = K.n('vis');
  var av = '', ar = '';
  /* les oreilles : devant la peau du côté qu'on voit, derrière de l'autre */
  [-1, 1].forEach(function(d){ var o = oreille(K, d, V); if(o.devant) av += o.svg; else ar += o.svg; });
  s += ar + '<clipPath id="' + cid + '"><path d="' + dPeau + '"/></clipPath>' + PC(dPeau, K.u('peauU'), 2.3);
  var dans = '';
  /* l'ombre : la joue et la mâchoire du côté opposé à la lumière (elle vient de la gauche de l'écran) */
  var om = [], i, n = 14;
  for(i = 0; i <= n; i++){ var y = -2 + 36 * i / n, b = U.bords(Sv(Math.min(y, 34)), V), X = Math.max(b[1], zMilieu(Math.min(y, 34)) * V.s); om.push([X + 1, y]); }
  for(i = n; i >= 0; i--){ var y2 = -2 + 36 * i / n, b2 = U.bords(Sv(Math.min(y2, 34)), V), X2 = Math.max(b2[1], zMilieu(Math.min(y2, 34)) * V.s), w = 2.5 + 8.5 * Math.pow(Math.sin(Math.PI * Math.min(1, (i / n) * 0.92)), 0.8); om.push([X2 - w, y2 + (i === 0 ? 0 : 1.5)]); }
  dans += PF(U.lisse(om), K.peau.ombre, ' opacity=".5"');
  /* l'ombre de la frange sur le front */
  if(CH && CH.ombre) dans += '<path d="' + CH.ombre + '" transform="translate(1.4 4.4)" fill="' + K.peau.ombre + '" opacity=".6"/>';
  if(face){
    /* les joues */
    [-1, 1].forEach(function(d){ dans += PF(U.poly(poseL(ovale(19 * d, 16, 6, 3.2, 14), V)), K.peau.joue, ' opacity=".34"'); });
    /* les yeux */
    dans += oeil(K, -1, V, P, f) + oeil(K, 1, V, P, f);
    /* le nez : un petit trait qui pointe du côté où elle regarde ; de profil, c'est le contour qui le dessine */
    var S15 = Sv(15.6);
    var N1 = [(T_MIL(12) - 0.4) * V.s, 12], N2 = [-1.6 * V.c + (T_MIL(15.8) - 0.3) * V.s, 16.4], N3 = [0.8 * V.c + (T_MIL(18) - 1.6) * V.s, 17.2];
    var bord = U.bords(S15, V), sort = sg > 0 ? N2[0] - bord[1] : bord[0] - N2[0], opN = 1 - doux(-2.4, 0.4, sort);
    if(opN > 0.03) dans += PT(U.poly([N1, N2, N3], false), K.peau.trait, 1.5, ' opacity="' + f1(opN) + '"');
    /* la bouche : un sourire, sur le bombé des lèvres (elle s'enroule plus que le reste du visage : de profil il en reste le coin) */
    function levre(q){ return [q[0] * V.c + (T_MIL(q[1]) - 0.3 - q[0] * q[0] / 12) * V.s, q[1]]; }
    function vuL(q){ return V.c - V.s * q[0] / 6 > 0.02; }
    var bo = U.ech([[-6, 22], [0, 26.2], [6, 22]], 12).filter(vuL).map(levre);
    if(bo.length > 1) dans += PT(U.poly(bo, false), '#9e4c38', 1.8);
    if(f.sexe === 'f'){
      var lv = U.ech([[-3.5, 23.6], [0, 25.8], [3.5, 23.6]], 6).concat(U.ech([[3.5, 23.6], [0, 24.5], [-3.5, 23.6]], 6).slice(1)).filter(vuL).map(levre);
      if(lv.length > 2) dans += PF(U.poly(lv), '#e0707a', ' opacity=".7"');
    }
  }
  s += '<g clip-path="url(#' + cid + ')">' + dans + '</g>';
  /* les sourcils : par-dessus la frange (on les voit à travers, comme dans persos.js) */
  var sc = '';
  if(face){
    var sb = P.sourcils || 0;        /* -1 : froncés ; 1 : levés */
    [-1, 1].forEach(function(d){
      U.morceaux(U.ech([[20 * d, -8 - sb * 1.5], [12 * d, -12 - sb * 2.6], [4 * d, -9 - sb * 0.8]], 8), TETE, V).forEach(function(run){
        var pts = run.map(function(p){ return pose(p[0], p[1], V); });
        if(Math.abs(pts[0][0] - pts[pts.length - 1][0]) > 1.6) sc += PT(U.poly(pts, false), K.chev.c[2], f.sexe === 'm' ? 3 : 2.4);
      });
    });
  }
  return {peau:dPeau, svg:s, oreille:av, sourcils:sc, contour:ct};
};
})(window);
