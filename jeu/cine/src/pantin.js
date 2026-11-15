/* pantin.js — un personnage VU DE FACE, articulé (Léo, le maire, Silas, les gardes).
   Un « pantin » est une liste de pièces dessinées (le buste, la tête, les bras, les jambes…), chacune dans SON repère
   (l'os part de l'articulation et descend, +y), posées à chaque image par des matrices calculées depuis la POSE.

   La pose (tout est facultatif ; les angles en degrés) :
     w:[x, y]      la taille (la ceinture), dans le repère du personnage (les pieds en 0, 0 ; y vers le bas)
     r             le bassin qui penche ; t : le buste qui penche (par rapport au bassin) ; tk : le buste qui vient vers nous
                   (1 = droit, 0,8 = penché en avant : il se raccourcit) ; souffle : 0 → 1 (la poitrine qui se gonfle)
     tete:{r, k, ht, x, y}   r : penchée sur le côté ; k : baissée (+) ou levée (−) ; ht : tournée (−1 gauche … 1 droite)
     bD, bG:{a, c, l1, l2, m, cible:[x, y]}   les bras (D : celui de droite DE L'IMAGE) ; a : écarté vers l'extérieur
                   (0 = pendant, 90 = à l'horizontale, 180 = en l'air) ; c : le coude plié (vers le haut, vers l'intérieur) ;
                   l1, l2 : raccourcis (le bras vient vers nous) ; m : le poignet ; cible : la main va là (cinématique inverse)
     jD, jG:{p:[x, y], g}    les jambes : où est le pied (dans le repère du personnage) ; g : à genou (0 → 1 : le tibia part
                   derrière, on ne le voit plus) — le genou se plie tout seul (vers nous, et un peu en dehors)
   Le pantin ne décide de rien : ce sont les films (films.js) qui lui donnent une pose par image. */
(function(){
'use strict';
var U = window.CU, PT = window.Pantin = {};

/* ---------------- les matrices 2D [a, b, c, d, e, f] (comme SVG) ---------------- */
var M = PT.M = {
  id: function(){ return [1, 0, 0, 1, 0, 0]; },
  mul: function(m, n){ return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]; },
  tr: function(x, y){ return [1, 0, 0, 1, x, y]; },
  rot: function(deg){ var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, 0, 0]; },
  sc: function(x, y){ return [x, 0, 0, y == null ? x : y, 0, 0]; },
  pt: function(m, x, y){ return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; },
  css: function(m){ return 'matrix(' + m.map(function(v){ return Math.round(v * 1000) / 1000; }).join(' ') + ')'; }
};
function chaine(){ var m = M.id(); for(var i = 0; i < arguments.length; i++) m = M.mul(m, arguments[i]); return m; }

/* l'angle (en degrés) qui fait pointer un os (qui descend, +y) de a vers b */
function angleVers(a, b){ return Math.atan2(-(b[0] - a[0]), b[1] - a[1]) * 180 / Math.PI; }

/* ---------------- les os ----------------
   D = le modèle du personnage : {taille:[0, y] (la ceinture au repos), hanche:[x, y] (depuis la ceinture, côté droit),
   epaule:[x, y] (depuis la ceinture, dans le buste), cou:[0, y], bras, avant, cuisse, tibia} */
PT.os = function(D, p){
  var o = {};
  var w = p.w || D.taille;
  o.bassin = chaine(M.tr(w[0], w[1]), M.rot(p.r || 0));
  var sf = p.souffle || 0, tk = p.tk == null ? 1 : p.tk;
  o.buste = chaine(o.bassin, M.rot(p.t || 0), M.sc(1 + .035 * sf, tk * (1 + .012 * sf)));
  /* les épaules montent un peu quand il respire fort */
  var cou = M.pt(o.buste, 0, D.cou[1]);
  var te = p.tete || {};
  o.tete = chaine(M.tr(cou[0] + (te.x || 0), cou[1] + (te.y || 0) - sf * 2), M.rot((p.t || 0) * .3 + (p.r || 0) * .5 + (te.r || 0)), M.sc(1, 1 - Math.abs(te.k || 0) * .004));
  o.cou = cou;
  /* les bras */
  ['D', 'G'].forEach(function(cote){
    var sg = cote === 'D' ? 1 : -1, b = p['b' + cote] || {};
    var ep = M.pt(o.buste, sg * D.epaule[0], D.epaule[1] - sf * 3);
    var rotB = U.deg(Math.atan2(o.buste[1], o.buste[0]));
    var a1, a2, l1 = b.l1 == null ? 1 : b.l1, l2 = b.l2 == null ? 1 : b.l2;
    /* les angles « à la main » (a, c) */
    a1 = rotB - sg * (b.a || 0); a2 = a1 - sg * (b.c || 0);
    if(b.cible){
      /* la main va là : le coude se plie tout seul ; ik (0 → 1) mélange avec les angles à la main (un geste qui va chercher) */
      var c = b.cible, L1 = D.bras * l1, L2 = D.avant * l2, dx = c[0] - ep[0], dy = c[1] - ep[1], d = Math.hypot(dx, dy);
      d = U.clamp(d, Math.abs(L1 - L2) + 1, L1 + L2 - .5);
      var base = Math.atan2(dy, dx), cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), A = Math.acos(U.clamp(cosA, -1, 1));
      var ang = base - sg * A * (b.coudeEnHaut ? -1 : 1);
      var coude = [ep[0] + Math.cos(ang) * L1, ep[1] + Math.sin(ang) * L1];
      var main = [ep[0] + Math.cos(base) * d, ep[1] + Math.sin(base) * d];
      var i1 = angleVers(ep, coude), i2 = angleVers(coude, main), w = b.ik == null ? 1 : b.ik;
      function vers(x, y){ var dd = ((y - x) % 360 + 540) % 360 - 180; return x + dd * w; }
      a1 = vers(a1, i1); a2 = vers(a2, i2);
    }
    o['b' + cote] = chaine(M.tr(ep[0], ep[1]), M.rot(a1), M.sc(sg, l1));
    var coude2 = M.pt(o['b' + cote], 0, D.bras);
    o['a' + cote] = chaine(M.tr(coude2[0], coude2[1]), M.rot(a2), M.sc(sg, l2));
    var poi = M.pt(o['a' + cote], 0, D.avant);
    o['m' + cote] = chaine(M.tr(poi[0], poi[1]), M.rot(a2 - sg * (b.m || 0)), M.sc(sg, 1));
    o['ep' + cote] = ep; o['ang' + cote] = a1; o['rotB'] = rotB;
  });
  /* les jambes : on dit où est le pied ; le genou se plie vers nous (la jambe se raccourcit) et un peu en dehors */
  ['D', 'G'].forEach(function(cote){
    var sg = cote === 'D' ? 1 : -1, j = p['j' + cote] || {};
    var ha = M.pt(o.bassin, sg * D.hanche[0], D.hanche[1]);
    var pied = j.p || [sg * D.hanche[0], 0];
    var L1 = D.cuisse, L2 = D.tibia, dx = pied[0] - ha[0], dy = pied[1] - ha[1], d = Math.hypot(dx, dy);
    var g = j.g || 0, genou, s1, s2;
    if(g > 0){
      /* à genou : la cuisse descend jusqu'au sol, le tibia part derrière */
      var gx = pied[0], gy = pied[1];
      genou = [gx, gy];
      var dd = Math.hypot(gx - ha[0], gy - ha[1]);
      s1 = Math.min(1.04, dd / L1);
      /* (entre debout et à genou : on mélange) */
      if(g < 1){
        var dz = Math.max(0, Math.min(L1 + L2, d)), avant = Math.sqrt(Math.max(0, (L1 + L2) * (L1 + L2) / 4 - dz * dz / 4));
        var n = [-dy / (d || 1), dx / (d || 1)];
        var gDebout = [ha[0] + dx / 2 + sg * Math.abs(n[0]) * avant * .22, ha[1] + dy / 2];
        genou = [U.lerp(gDebout[0], gx, g), U.lerp(gDebout[1], gy, g)];
        s1 = U.lerp(Math.hypot(genou[0] - ha[0], genou[1] - ha[1]) / L1, s1, g);
      }
      s2 = U.lerp(1, .12, g);
    } else {
      if(d >= L1 + L2 - .5){ genou = [ha[0] + dx * L1 / (L1 + L2), ha[1] + dy * L1 / (L1 + L2)]; }
      else {
        /* la jambe pliée, vue de face : chaque moitié se raccourcit ; le genou s'écarte un peu */
        var f = Math.sqrt(Math.max(0, L1 * L1 - d * d / 4));
        genou = [ha[0] + dx / 2 + sg * f * .24, ha[1] + dy / 2];
      }
      s1 = Math.hypot(genou[0] - ha[0], genou[1] - ha[1]) / L1;
      s2 = Math.hypot(pied[0] - genou[0], pied[1] - genou[1]) / L2;
    }
    var aC = angleVers(ha, genou), aT = g > 0 ? aC : angleVers(genou, pied);
    o['c' + cote] = chaine(M.tr(ha[0], ha[1]), M.rot(aC), M.sc(sg, U.clamp(s1, .05, 1.05)));
    o['t' + cote] = chaine(M.tr(genou[0], genou[1]), M.rot(aT), M.sc(sg, U.clamp(s2, .05, 1.05)));
    o['p' + cote] = chaine(M.tr(g >= .5 ? genou[0] : pied[0], g >= .5 ? genou[1] : pied[1]), M.rot(j.r || 0), M.sc(sg, 1));
    o['genou' + cote] = genou; o['pied' + cote] = pied; o['g' + cote] = g;
  });
  return o;
};

/* placer une pièce : <g transform="matrix(…)">dessin</g> */
PT.piece = function(m, svg){ return '<g transform="' + M.css(m) + '">' + svg + '</g>'; };
})();
