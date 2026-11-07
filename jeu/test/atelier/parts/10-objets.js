
/* ==========================================================
   Petits outils de dessin SVG (contour épais, dégradés « jouet »)
   ========================================================== */
var SW = 5;
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function R(x, y, w, h, rx, f, xx){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>'; }
function Ell(cx, cy, rx, ry, f, xx){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>'; }
function Cir(cx, cy, r, f, xx){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (r < 8 ? 2.5 : SW) + '"' + (xx || '') + '/>'; }
function T(d, c, w, xx){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (xx || '') + '/>'; }
function G(id){ return 'url(#atg-' + id + ')'; }
function emo(x, y, s, ch, xx){ return '<text x="' + x + '" y="' + y + '" font-size="' + s + '" text-anchor="middle" dominant-baseline="central"' + (xx || '') + '>' + ch + '</text>'; }
function reflet(d, w){ return T(d, '#fff', w || 4, ' opacity=".38"'); }
function F(s){ return {f:0, s:s}; }   /* un calque du dessin (les objets ne se retournent plus : ils suivent la perspective) */
function N(s){ return {f:0, s:s}; }

/* Étiquettes-autocollants : ingrédients + quelques symboles pour le plaisir */
var ETQ_EXTRA = {'x-etoile':'⭐', 'x-coeur':'❤️', 'x-lune':'🌙', 'x-chat':'🐱', 'x-arc':'🌈', 'x-feu':'🔥', 'x-gemme':'💎', 'x-fleur':'🌸'};
var INGR = {};   /* rempli par la vue (opts.ingr) */
function icEtq(id){ return ETQ_EXTRA[id] || (INGR[id] && INGR[id].ic) || '❔'; }
function icIngr(id){ return (INGR[id] && INGR[id].ic) || '❔'; }
function coulIngr(id){ return (INGR[id] && INGR[id].c) || '#9aa3c8'; }

function pastille(x, y, r, ch){
  return '<g class="at-etq-o"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fffaf0" stroke="' + K + '" stroke-width="2.5"/>' + emo(x, y + r * 0.08, r * 1.2, ch) + '</g>';
}
function rangeeEtq(liste, cx, cy, r){
  var n = liste.length, s = '', pas = r * 2.15;
  liste.forEach(function(id, i){ s += pastille(cx + (i - (n - 1) / 2) * pas, cy, r, icEtq(id)); });
  return s;
}
/* Le hublot d'un tiroir, d'une caisse ou d'un sac : GROSSE icône de l'ingrédient principal, et le nombre.
   Vide : un rond pointillé (on voit que c'est un rangement). Lisible d'un coup d'œil sur un téléphone. */
function hublot(x, y, r, cs){
  var l = trier(cs), n = somme(cs.i);
  if(!l.length) return '<g class="at-hublot vide"><circle cx="' + x + '" cy="' + y + '" r="' + (r - 3) + '" fill="rgba(36,24,46,.16)" stroke="rgba(255,246,216,.45)" stroke-width="3" stroke-dasharray="6 5"/></g>';
  var b = r * 0.5;
  return '<g class="at-hublot"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + G('cuivre') + '" stroke="' + K + '" stroke-width="3.5"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + (r - 5) + '" fill="#fff6e0" stroke="' + K + '" stroke-width="1.5"/>' + emo(x, y + r * 0.06, r * 1.32, icIngr(l[0])) +
    (n > 1 ? '<circle cx="' + (x + r * 0.78) + '" cy="' + (y + r * 0.7) + '" r="' + b + '" fill="#24182e" stroke="#fff6d8" stroke-width="2.5"/>' +
      '<text x="' + (x + r * 0.78) + '" y="' + (y + r * 0.7) + '" font-size="' + (b * 1.25) + '" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + n + '</text>' : '') + '</g>';
}
/* Les ingrédients d'une case, du plus nombreux au moins nombreux */
function trier(cs){ return cles(cs.i).filter(function(k){ return cs.i[k] > 0; }).sort(function(a, b){ return cs.i[b] - cs.i[a]; }); }
function apercu(cs, cx, cy, s){
  var l = trier(cs).slice(0, 3), out = '';
  var pos = [[0, 0], [-s * 0.7, s * 0.18], [s * 0.7, s * 0.2]];
  for(var i = l.length - 1; i >= 0; i--) out += emo(cx + pos[i][0], cy + pos[i][1], s, icIngr(l[i]));
  return out;
}

/* ==========================================================
   Dessiner un objet dans la perspective de la pièce.
   ctxObjet(o, R) : le contexte de dessin (les outils 3D de ctx3d + la forme, le thème, le contenu des cases) ;
   dessinObjet(o, R) : {svg, bb (la boîte du dessin, en unités locales), bbD (sans la zone de toucher)}.
   ========================================================== */
function ajouterOutils3d(x){
  /* un corps de révolution (pot, vase, flacon) : prof = [[y, r], …] ; fh : le dessus (au plus haut des cercles), null = pas de dessus */
  x.tour = function(cx, cz, prof, f, fh, xx){
    var pts = [], haut = prof[0];
    prof.forEach(function(q){ pts = pts.concat(x.cercle(cx, cz, q[1], q[0], 28)); if(q[0] < haut[0]) haut = q; });
    return P(lisse(enveloppe(pts), true, 0.5), f, xx) + (fh === null || fh === undefined ? '' : P(lisse(x.cercle(cx, cz, haut[1], haut[0], 28), true), fh, xx));
  };
  /* un ovale debout (une table ovale, un tabouret) */
  x.ovale = function(cx, cz, rx, rz, yh, yb, f, fh, xx){
    function anneau(y){ var l = []; for(var i = 0; i < 32; i++){ var a = i / 32 * Math.PI * 2; l.push(x.Q(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz)); } return l; }
    var h = anneau(yh), b = anneau(yb);
    return P(lisse(enveloppe(h.concat(b)), true, 0.5), f, xx) + (fh === null ? '' : P(lisse(h, true), fh || f, xx));
  };
  /* un cylindre couché ou penché, de a à b (une bûche, un tuyau, une horloge ronde vue de face) ; fa, fb : ses deux bouts */
  x.tube = function(a, b, r, f, fa, fb, xx){
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]) || 1;
    d = [d[0] / L, d[1] / L, d[2] / L];
    var ref = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    var u = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]], lu = Math.hypot(u[0], u[1], u[2]);
    u = [u[0] / lu, u[1] / lu, u[2] / lu];
    var v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
    function anneau(c){ var l = []; for(var i = 0; i < 24; i++){ var t = i / 24 * Math.PI * 2, cs = Math.cos(t) * r, sn = Math.sin(t) * r; l.push(x.Q(c[0] + u[0] * cs + v[0] * sn, c[1] + u[1] * cs + v[1] * sn, c[2] + u[2] * cs + v[2] * sn)); } return l; }
    var A = anneau(a), B = anneau(b), s = P(lisse(enveloppe(A.concat(B)), true, 0.5), f, xx);
    if(fb && x.voit(d, b)) s += P(lisse(B, true), fb, xx);
    if(fa && x.voit([-d[0], -d[1], -d[2]], a)) s += P(lisse(A, true), fa, xx);
    return s;
  };
  /* un dessin posé sur un plan quelconque : le point (x, y) du dessin va en o3 + x·u + y·v (points 3D locaux) */
  x.surPlan = function(svg, o3, u, v, ax, ay){
    ax = ax || 0; ay = ay || 0;
    function M(px, py){ return x.Q(o3[0] + px * u[0] + py * v[0], o3[1] + px * u[1] + py * v[1], o3[2] + px * u[2] + py * v[2]); }
    var p0 = M(ax, ay), px = M(ax + 10, ay), py = M(ax, ay + 10);
    var a = (px[0] - p0[0]) / 10, b = (px[1] - p0[1]) / 10, cc = (py[0] - p0[0]) / 10, d = (py[1] - p0[1]) / 10;
    var e = p0[0] - (a * ax + cc * ay), ff = p0[1] - (b * ax + d * ay);
    return '<g transform="matrix(' + [a, b, cc, d, e, ff].map(function(t){ return t.toFixed(4); }).join(',') + ')">' + svg + '</g>';
  };
  /* un dessin couché sur un dessus horizontal (à la hauteur y) : le haut du dessin va vers le fond */
  x.dessus = function(svg, y, z0){ return x.surPlan(svg, [0, y, z0 === undefined ? x.p / 2 : z0], [1, 0, 0], [0, 0, -1], x.cat.w / 2, 0); };
  /* un polygone 3D dessiné seulement s'il est tourné vers l'œil (n : sa normale locale) */
  x.plan = function(pts, n, f, xx){
    var m = [0, 0, 0];
    pts.forEach(function(q){ m[0] += q[0] / pts.length; m[1] += q[1] / pts.length; m[2] += q[2] / pts.length; });
    return x.voit(n, m) ? x.poly(pts, f, xx) : '';
  };
  /* un rond sur un plan vertical (le cadran d'une horloge…) */
  x.rond = function(cx, cy, z, r, f, xx){
    var l = [];
    for(var i = 0; i < 28; i++){ var a = i / 28 * Math.PI * 2; l.push(x.Q(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z)); }
    return P(lisse(l, true), f, xx);
  };
  /* le devant d'un cercle horizontal (une rangée de briques sur une tour) */
  x.arcAvant = function(cx, cz, r, y, col, w){
    var l = [];
    for(var i = 0; i <= 16; i++){ var a = Math.PI + i / 16 * Math.PI; l.push(x.Q(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)); }
    return T(lisse(l, false), col, w);
  };
  /* une sphère (la boule de cristal) : son contour et son centre à l'écran */
  x.boule = function(cx, cy, cz, r, f, xx){
    var c0 = x.Q(cx, cy, cz), e = x.Q(cx + r, cy, cz), rr = Math.hypot(e[0] - c0[0], e[1] - c0[1]);
    return '<circle cx="' + f1(c0[0]) + '" cy="' + f1(c0[1]) + '" r="' + f1(rr) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>';
  };
  return x;
}
function ctxObjet(o, R){
  var c = catDe(o), st = o.st || 0, x = R ? ajouterOutils3d(ctx3d(R, false)) : {bb:[0, 0, c.w, c.h]};
  x.o = o; x.cat = c; x.v = o.v || 0; x.fo = st % nfDe(c); x.ti = st % NT; x.ic = icObjetBoutique(o.t); x.p = c.p || 40;
  x.X = function(v){ return v; };
  x.cs = (o.cases || []).map(function(k){ return {e:k.e || [], i:k.i || {}}; });
  while(c.cases && x.cs.length < c.cases.length) x.cs.push({e:[], i:{}});
  return x;
}
var TOUCHE_MIN = 92;      /* un petit objet : une zone invisible autour, pour qu'un doigt d'enfant le touche facilement (≥ 48 px) */
function dessinObjet(o, R, vignette){
  var c = catDe(o);
  if(c.plat || !R){
    var x0 = ctxObjet(o, null), s0 = c.d(x0).map(function(l){ return l.s; }).join('');
    var m = vignette ? 0 : Math.max(0, (80 - Math.min(c.w, c.h)) / 2);
    return {svg:(m ? '<rect x="' + (-m) + '" y="' + (-m) + '" width="' + (c.w + 2 * m) + '" height="' + (c.h + 2 * m) + '" fill="transparent"/>' : '') + repeindre(s0, x0.ti),
      bb:[-m, -m, c.w + m, c.h + m], bbD:[0, 0, c.w, c.h], plat:1};
  }
  var x = ctxObjet(o, R), s = c.d(x).map(function(l){ return l.s; }).join(''), p = x.p;
  /* la boîte 3D de l'objet : elle compte toujours dans son cadre, et sert de zone de toucher */
  var coins = [];
  [0, c.w].forEach(function(a){ [0, c.h].forEach(function(b){ [0, p].forEach(function(z){ coins.push(x.Q(a, b, z)); }); }); });
  var ombre = '';
  if(c.z !== 'mur' && c.z !== 'tapis' && !c.sansOmbre){
    var l = [], mx = c.w * 0.04 + 4, mz = p * 0.05 + 4, y = c.h;
    [[-mx, -mz], [c.w / 2, -mz * 1.6], [c.w + mx, -mz], [c.w + mx * 1.5, p / 2], [c.w + mx, p + mz], [c.w / 2, p + mz * 1.4], [-mx, p + mz], [-mx * 1.5, p / 2]].forEach(function(q){ l.push(x.Q(q[0], y, q[1])); });
    ombre = '<path class="at-ombre" d="' + lisse(l, true) + '" fill="rgba(12,6,20,.32)"/>';
  }
  var bbD = x.bb.slice(), hull = enveloppe(coins);
  var hit = '<path d="M' + hull.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z" fill="transparent"/>', bb = bbD.slice();
  if(!vignette){
    var bw = bb[2] - bb[0], bh = bb[3] - bb[1];
    var tm = c.touche || TOUCHE_MIN;
    if(bw < tm || bh < tm){
      var cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, ww = Math.max(bw, tm), hh = Math.max(bh, tm);
      hit += '<rect x="' + f1(cx - ww / 2) + '" y="' + f1(cy - hh / 2) + '" width="' + f1(ww) + '" height="' + f1(hh) + '" rx="' + f1(Math.min(ww, hh) / 3) + '" fill="transparent"/>';
      bb = [Math.min(bb[0], cx - ww / 2), Math.min(bb[1], cy - hh / 2), Math.max(bb[2], cx + ww / 2), Math.max(bb[3], cy + hh / 2)];
    }
  }
  return {svg:ombre + (vignette ? '' : hit) + repeindre(s, x.ti), bb:bb, bbD:bbD};
}
/* La petite image d'un objet (dans les panneaux, le carton du coin) : vue de face, un peu de côté, comme dans la pièce */
function repereVignette(c){
  if(c.z === 'mur') return repere([VPX - 170, 300, (c.p || 40) / S_REF], AXES_FACE, c.w, c.h);
  return repere([VPX - 170, 0, 470], AXES_FACE, c.w, c.h);
}
function svgObjet(o){
  var c = catDe(o), D = dessinObjet(o, c.plat ? null : repereVignette(c), true), b = D.bbD, m = 4;
  return '<svg viewBox="' + [b[0] - m, b[1] - m, b[2] - b[0] + 2 * m, b[3] - b[1] + 2 * m].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
}
/* ==========================================================
   Catalogue des objets de l'atelier — tous dessinés dans la perspective de la pièce (07-perspective.js).
   w, h : la boîte locale (l'ancre = le milieu du bas de la face avant, en (w/2, h)) ; p : la profondeur (vers le fond) ;
   z : 'sol' | 'mur' | 'petit' (par terre ou sur une surface) | 'tapis'
   cases : rangements [{cap, b:[x,y,w,h]}] ; surf : surfaces [{x0, x1, y, z}] (x par rapport au milieu, y par rapport au bas, z la profondeur)
   verre : pour les liquides ; nf : nombre de formes (le style o.st donne la forme et la couleur) ; deco : se décore au toucher
   special : 'chaudron' | 'grimoire' | 'analyses' (le toucher fait cette action) ; profil : se met de profil contre un mur de côté
   d(c) : renvoie une liste de calques N() ; c a les outils 3D (c.boite, c.cylindre, c.disque, c.poly, c.sur, c.surPlan, c.Q…),
   c.fo = la forme, c.ti = le thème (0 naturel), c.cs = le contenu des cases.
   ========================================================== */
var CAT = {};
function def(t, o){ o.t = t; CAT[t] = o; }
function BOIS(){ return {face:G('bois'), dessus:G('boisH'), cote:G('boisS')}; }
function BOISC(){ return {face:G('boisC'), dessus:G('boisH'), cote:G('boisS')}; }
function SOMBRE(){ return {face:G('boisS'), dessus:G('bois'), cote:G('boisS')}; }
function UNI(f, h, s){ return {face:f, dessus:h || f, cote:s || f}; }
/* quatre pieds (les deux de derrière d'abord) */
function pieds(c, xa, xb, y0, y1, za, zb, l, f){
  f = f || SOMBRE();
  return c.boite(xa, y0, xa + l, y1, zb - l, zb, f) + c.boite(xb - l, y0, xb, y1, zb - l, zb, f) + c.boite(xa, y0, xa + l, y1, za, za + l, f) + c.boite(xb - l, y0, xb, y1, za, za + l, f);
}
/* un bocal de verre (cylindre), son contenu qui monte, son couvercle de cuivre (on voit le dessus) et sa grosse icône */
function bocal3d(c, i, cx, cz, r, yh, yb, cs, cap, couv){
  var tot = somme(cs.i), l = trier(cs), s = '<g data-case="' + i + '">', n = '';
  s += c.cylindre(cx, cz, r, yh, yb, G('verre'), null, ' stroke-width="4"');
  if(tot > 0){
    var hh = (yb - yh - 6) * Math.min(1, tot / cap);
    s += c.cylindre(cx, cz, r - 4, yb - 3 - hh, yb - 3, coulIngr(l[0]), clair(coulIngr(l[0]), 0.35), ' stroke-width="0" opacity=".85"');
  }
  s += c.disque(cx, cz, r, yh, 'rgba(255,255,255,.18)', ' stroke-width="3"');
  s += c.cylindre(cx, cz, r * (couv || 0.9), yh - 16, yh + 2, G('cuivre'), G('cuivre'), ' stroke-width="3.5"');
  s += c.sur(T('M' + (cx - r * 0.62) + ',' + (yh + 12) + ' V' + (yb - 10), '#fff', 4, ' opacity=".5"'), cz - r);
  s += '</g>';
  var my = (yh + yb) / 2;
  if(tot > 0){
    n += '<circle cx="' + cx + '" cy="' + my + '" r="' + (r * 0.74) + '" fill="#fff6e0" stroke="' + K + '" stroke-width="2.5" opacity=".95"/>' + emo(cx, my + 1, r * 1.02, icIngr(l[0]));
    if(tot > 1) n += '<circle cx="' + (cx + r * 0.6) + '" cy="' + (my + r * 0.66) + '" r="' + (r * 0.4) + '" fill="#24182e" stroke="#fff6d8" stroke-width="2"/><text x="' + (cx + r * 0.6) + '" y="' + (my + r * 0.66) + '" font-size="' + (r * 0.52) + '" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + tot + '</text>';
  } else n += '<circle cx="' + cx + '" cy="' + my + '" r="' + (r * 0.58) + '" fill="none" stroke="rgba(36,24,46,.3)" stroke-width="3" stroke-dasharray="6 5"/>';
  if(cs.e.length) n += pastille(cx, yh + 6, 8, icEtq(cs.e[0]));
  return s + c.sur(n, cz - r);
}

/* ---------- Les rangements ---------- */
def('commode', {w:250, h:270, p:90, z:'sol', nom:'Commode', ic:'🗄️',
  cases:[{cap:6, b:[28, 44, 194, 62]}, {cap:6, b:[28, 114, 194, 62]}, {cap:6, b:[28, 184, 194, 62]}],
  surf:[{x0:-108, x1:108, y:-256, z:44}],
  d:function(c){
    var s = pieds(c, 30, 220, 248, 270, 6, 84, 20) + c.boite(14, 30, 236, 252, 0, 84, BOIS()) + c.boite(4, 14, 246, 36, -6, 90, UNI(G('boisH'), G('boisH'), G('boisS')));
    var tir = '', etq = '';
    for(var i = 0; i < 3; i++){
      var y = 44 + i * 70;
      tir += '<g data-case="' + i + '">' + R(28, y, 194, 62, 8, G('boisC')) + Cir(50, y + 31, 6.5, G('or')) + Cir(200, y + 31, 6.5, G('or')) + reflet('M38,' + (y + 8) + ' H212', 3) + '</g>';
      etq += hublot(125, y + 31, 28, c.cs[i]) + rangeeEtq(c.cs[i].e.slice(0, 1), 172, y + 31, 10);
    }
    return [N(s + c.sur(tir + reflet('M22,42 V240') + etq, 0))];
  }});

def('bocaux', {w:216, h:118, p:64, z:'petit', verre:true, nom:'Bocaux', ic:'🫙',
  cases:[{cap:4, b:[8, 10, 62, 94]}, {cap:4, b:[77, 10, 62, 94]}, {cap:4, b:[146, 10, 62, 94]}],
  d:function(c){
    var s = c.boite(4, 104, 212, 118, 0, 62, BOIS());
    for(var i = 0; i < 3; i++) s += bocal3d(c, i, 39 + i * 69, 31, 27, 30, 104, c.cs[i], 4);
    return [N(s)];
  }});

/* Le casier : un petit meuble à quatre tiroirs, sur pieds (posé par terre) */
def('casier', {w:190, h:218, p:80, z:'sol', nom:'Casier à tiroirs', ic:'🗃️', surf:[{x0:-80, x1:80, y:-214, z:40}],
  cases:[{cap:4, b:[14, 22, 78, 78]}, {cap:4, b:[98, 22, 78, 78]}, {cap:4, b:[14, 106, 78, 78]}, {cap:4, b:[98, 106, 78, 78]}],
  d:function(c){
    var s = pieds(c, 22, 168, 192, 218, 6, 72, 18) + c.boite(6, 12, 184, 194, 0, 76, SOMBRE()) + c.boite(2, 4, 188, 20, -4, 80, UNI(G('boisH'), G('boisH'), G('boisS'))), t = '', etq = '';
    c.cat.cases.forEach(function(k, i){
      var x = k.b[0], y = k.b[1];
      t += '<g data-case="' + i + '">' + R(x, y, 78, 78, 8, G('boisC')) + Cir(x + 39, y + 71, 4.5, G('or')) + reflet('M' + (x + 8) + ',' + (y + 8) + ' H' + (x + 70), 3) + '</g>';
      etq += hublot(x + 39, y + 36, 27, c.cs[i]);
    });
    return [N(s + c.sur(t + etq, 0))];
  }});

/* Les fioles d'ingrédients : quatre fioles sur une planchette, au mur */
def('fioles_ingr', {w:220, h:76, p:44, z:'mur', verre:true, nom:'Fioles d\'ingrédients', ic:'🧪',
  cases:[0, 1, 2, 3].map(function(i){ return {cap:3, b:[4 + i * 54, 2, 50, 62]}; }),
  d:function(c){
    var s = c.boite(18, 64, 32, 76, 6, 40, SOMBRE()) + c.boite(188, 64, 202, 76, 6, 40, SOMBRE()) + c.boite(2, 56, 218, 66, 0, 44, UNI(G('boisH'), G('boisH'), G('boisS'))), f = '', haut = '';
    for(var i = 0; i < 4; i++){
      var cx = 29 + i * 54, cs = c.cs[i], tot = somme(cs.i), l = trier(cs);
      f += '<g data-case="' + i + '">' +
        P('M' + (cx - 6) + ',10 L' + (cx + 6) + ',10 L' + (cx + 6) + ',20 C' + (cx + 24) + ',24 ' + (cx + 24) + ',56 ' + cx + ',58 C' + (cx - 24) + ',56 ' + (cx - 24) + ',24 ' + (cx - 6) + ',20 Z', G('verre'), ' stroke-width="3.5"');
      if(tot > 0){
        var hh = 26 * Math.min(1, tot / 3);
        f += '<path d="M' + (cx - 19) + ',' + (54 - hh) + ' H' + (cx + 19) + ' V48 C' + (cx + 15) + ',57 ' + (cx - 15) + ',57 ' + (cx - 19) + ',48 Z" fill="' + coulIngr(l[0]) + '" opacity=".9"/>';
        haut += emo(cx, 38, 26, icIngr(l[0]));
      }
      /* bouchon de cire violette : ce sont des fioles d'ingrédients, pas des potions */
      f += R(cx - 8, 2, 16, 10, 3, '#8b5bd6', ' stroke-width="3"') + Ell(cx, 2, 8, 3, '#b48bf0', ' stroke-width="2"') + T('M' + (cx - 13) + ',30 V46', '#fff', 3, ' opacity=".5"') + '</g>';
      if(cs.e.length) haut += pastille(cx + 16, 16, 7, icEtq(cs.e[0]));
    }
    return [N(s + c.sur(f + haut, 22))];
  }});

/* ---------- Les beaux rangements (au mur de préférence) ---------- */
/* Le placard mural : deux portes, une grosse icône dans le hublot de chacune */
def('placard', {w:190, h:184, p:56, z:'mur', nom:'Placard mural', ic:'🚪',
  cases:[{cap:6, b:[16, 30, 76, 132]}, {cap:6, b:[98, 30, 76, 132]}],
  d:function(c){
    var s = c.sur(T('M64,6 L95,-14 L126,6', K, 3) + Cir(95, -14, 4, '#cfc9e6'), c.p) +
      c.boite(8, 18, 182, 168, 0, 56, BOIS()) + c.boite(0, 4, 190, 22, -6, 56, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.boite(4, 164, 186, 178, -4, 56, UNI(G('boisH'), G('boisH'), G('boisS')));
    var p = '', etq = '';
    for(var i = 0; i < 2; i++){
      var x = 16 + i * 82;
      p += '<g data-case="' + i + '">' + R(x, 30, 76, 132, 8, G('boisC')) + R(x + 9, 42, 58, 108, 6, 'none', ' stroke-width="2.5" opacity=".45"') + reflet('M' + (x + 8) + ',38 V150', 3) + '</g>';
      etq += hublot(x + 38, 88, 27, c.cs[i]) + rangeeEtq(c.cs[i].e.slice(0, 1), x + 38, 138, 10);
    }
    return [N(s + c.sur(p + Cir(86, 100, 5, G('or')) + Cir(104, 100, 5, G('or')) + etq, 0))];
  }});

/* Le petit meuble d'apothicaire : six tiroirs à étiquette de laiton, accroché au mur */
def('apothicaire', {w:210, h:204, p:60, z:'mur', nom:'Meuble d\'apothicaire', ic:'🗄️',
  cases:[0, 1, 2, 3, 4, 5].map(function(i){ return {cap:3, b:[14 + (i % 2) * 94, 26 + Math.floor(i / 2) * 58, 88, 52]}; }),
  d:function(c){
    var s = c.boite(14, 196, 36, 204, 6, 50, SOMBRE()) + c.boite(174, 196, 196, 204, 6, 50, SOMBRE()) + c.boite(4, 14, 206, 198, 0, 60, BOIS()) + c.boite(0, 2, 210, 18, -6, 60, UNI(G('boisH'), G('boisH'), G('boisS'))), t = '', etq = '';
    c.cat.cases.forEach(function(k, i){
      var x = k.b[0], y = k.b[1];
      t += '<g data-case="' + i + '">' + R(x, y, 88, 52, 6, G('boisC')) + R(x + 48, y + 8, 32, 12, 2, G('or'), ' stroke-width="2.5"') + Cir(x + 64, y + 36, 4.5, G('or')) + reflet('M' + (x + 6) + ',' + (y + 6) + ' H' + (x + 40), 2.5) + '</g>';
      etq += hublot(x + 24, y + 27, 19, c.cs[i]) + (c.cs[i].e.length ? pastille(x + 64, y + 14, 7, icEtq(c.cs[i].e[0])) : '');
    });
    return [N(s + c.sur(t + etq, 0))];
  }});

/* Le contenu d'un rangement en verre : la couleur de l'ingrédient qui monte, une grosse icône, le nombre */
function contenuVerre(c, cs, cx, bas, haut, cap, r){
  var tot = somme(cs.i), l = trier(cs), s = '', n = '';
  if(tot > 0){
    var hh = (bas - haut) * Math.min(1, tot / cap);
    s += '<rect x="' + (cx - r * 0.8) + '" y="' + (bas - hh) + '" width="' + (r * 1.6) + '" height="' + hh + '" rx="' + (r * 0.35) + '" fill="' + coulIngr(l[0]) + '" opacity=".85"/>';
    var cy = (bas + haut) / 2;
    n += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.78) + '" fill="#fff6e0" stroke="' + K + '" stroke-width="2.5" opacity=".95"/>' + emo(cx, cy + 1, r * 1.08, icIngr(l[0]));
    if(tot > 1) n += '<circle cx="' + (cx + r * 0.62) + '" cy="' + (cy + r * 0.66) + '" r="' + (r * 0.4) + '" fill="#24182e" stroke="#fff6d8" stroke-width="2"/><text x="' + (cx + r * 0.62) + '" y="' + (cy + r * 0.66) + '" font-size="' + (r * 0.52) + '" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + tot + '</text>';
  } else n += '<circle cx="' + cx + '" cy="' + (bas + haut) / 2 + '" r="' + (r * 0.62) + '" fill="none" stroke="rgba(36,24,46,.3)" stroke-width="3" stroke-dasharray="6 5"/>';
  if(cs.e.length) n += pastille(cx, haut - 4, 8, icEtq(cs.e[0]));
  return {s:s, n:n};
}

/* La vitrine : trois étagères derrière une porte vitrée (pour les liquides), posée par terre */
def('vitrine', {w:184, h:272, p:80, z:'sol', verre:true, nom:'Vitrine', ic:'🪟', surf:[{x0:-76, x1:76, y:-268, z:40}],
  cases:[{cap:4, b:[18, 34, 148, 68]}, {cap:4, b:[18, 106, 148, 68]}, {cap:4, b:[18, 178, 148, 62]}],
  d:function(c){
    var s = pieds(c, 18, 166, 254, 272, 6, 70, 16) + c.boite(6, 20, 178, 256, 0, 76, BOIS()) + c.boite(0, 4, 184, 24, -6, 80, UNI(G('boisH'), G('boisH'), G('boisS')));
    var dedans = R(18, 34, 148, 208, 6, '#2e1c10', ' stroke-width="3"'), n = '';
    [102, 174, 240].forEach(function(y){ dedans += R(16, y, 152, 8, 3, G('boisH'), ' stroke-width="3"'); });
    c.cat.cases.forEach(function(k, i){
      var b = k.b, v = contenuVerre(c, c.cs[i], 92, b[1] + b[3] - 2, b[1] + 8, 4, 30);
      dedans += '<g data-case="' + i + '"><rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="transparent"/>' + v.s +
        P('M40,' + (b[1] + b[3] - 2) + ' C34,' + (b[1] + b[3] - 30) + ' 46,' + (b[1] + 22) + ' 46,' + (b[1] + 16) + ' L54,' + (b[1] + 16) + ' C54,' + (b[1] + 22) + ' 66,' + (b[1] + b[3] - 30) + ' 60,' + (b[1] + b[3] - 2) + ' Z', G('verre'), ' stroke-width="3"') +
        P('M124,' + (b[1] + b[3] - 2) + ' C118,' + (b[1] + b[3] - 24) + ' 130,' + (b[1] + 28) + ' 130,' + (b[1] + 22) + ' L138,' + (b[1] + 22) + ' C138,' + (b[1] + 28) + ' 150,' + (b[1] + b[3] - 24) + ' 144,' + (b[1] + b[3] - 2) + ' Z', G('verre'), ' stroke-width="3"') + '</g>';
      n += v.n;
    });
    return [N(s + c.sur(dedans + n + '<g pointer-events="none">' + R(14, 30, 156, 216, 8, G('verre'), ' stroke-width="4"') + T('M92,32 V244', K, 3) + reflet('M24,40 L24,236', 4) + '</g>' + Cir(100, 140, 5, G('or')), 0))];
  }});

/* L'étagère à épices : quatre petits pots de verre sur une planchette murale */
def('epices', {w:214, h:124, p:44, z:'mur', verre:true, nom:'Étagère à épices', ic:'🧂',
  cases:[0, 1, 2, 3].map(function(i){ return {cap:3, b:[14 + i * 49, 30, 40, 70]}; }),
  d:function(c){
    var s = c.sur(R(6, 6, 202, 96, 10, G('boisS')), c.p - 4) + c.boite(18, 112, 32, 124, 6, 40, SOMBRE()) + c.boite(182, 112, 196, 124, 6, 40, SOMBRE()) +
      c.boite(0, 98, 214, 112, 0, 44, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.boite(2, 2, 212, 14, 0, 44, UNI(G('boisH'), G('boisH'), G('boisS')));
    for(var i = 0; i < 4; i++) s += bocal3d(c, i, 33 + i * 49, 22, 18, 44, 98, c.cs[i], 3, 0.92);
    s += c.boite(8, 64, 206, 68, 2, 6, UNI('#c58a4a'));
    return [N(s)];
  }});

/* Les bocaux suspendus : une planche accrochée par deux cordes, trois gros bocaux dessus */
def('suspendus', {w:204, h:180, p:64, z:'mur', verre:true, nom:'Bocaux suspendus', ic:'🫙',
  cases:[0, 1, 2].map(function(i){ return {cap:4, b:[13 + i * 62, 60, 54, 80]}; }),
  d:function(c){
    var s = c.ligne([[14, 140, 60], [102, 10, 64], [190, 140, 60]], '#6b4a2a', 3) + c.sur(Cir(102, 8, 6, '#cfc9e6'), c.p) +
      c.boite(4, 138, 200, 154, 0, 62, BOIS()) + c.ligne([[14, 140, 4], [102, 10, 64], [190, 140, 4]], '#8a6a3a', 3.5);
    for(var i = 0; i < 3; i++) s += bocal3d(c, i, 40 + i * 62, 32, 26, 66, 138, c.cs[i], 4);
    return [N(s)];
  }});

/* ==========================================================
   Les meubles spéciaux (un de chaque, toujours là, on peut les déplacer partout) :
   le grand chaudron, le lutrin du grimoire, la paillasse d'analyse
   ========================================================== */
var DESSIN = {analyses:[], pret:false, cuivre:false};   /* ce que la vue sait (objets reçus, potion possible), pour dessiner */
def('chaudron', {w:260, h:214, p:230, z:'sol', special:'chaudron', cls:'at-chp', nom:'Grand chaudron', ic:'🍲', surf:null,
  d:function(c){
    var cuivre = DESSIN.cuivre, cz = 116, s = '<g class="at-ch-p" data-at="chaudron">';
    /* le feu dessous, les trois pieds */
    s += c.tube([70, 204, cz + 26], [190, 204, cz - 26], 8, G('boisS'), null, G('boisH')) + c.tube([70, 204, cz - 26], [190, 204, cz + 26], 8, G('bois'), G('boisH'), G('boisH'));
    s += c.sur('<g class="at-feu-p">' + flammesSVG(130, 204, 0) + '</g>', cz);
    s += c.ligne([[90, 170, cz + 80], [80, 212, cz + 96]], K, 10) + c.ligne([[170, 170, cz + 80], [180, 212, cz + 96]], K, 10);
    var corps = [];
    [[94, 110], [112, 116], [140, 112], [168, 96], [188, 70], [198, 40]].forEach(function(q){ corps = corps.concat(c.cercle(130, cz, q[1], q[0], 32)); });
    s += P(lisse(enveloppe(corps), true, 0.5), G(cuivre ? 'cuivre' : 'metal')) + c.sur(reflet('M46,112 C48,140 66,166 90,178', 6), 8);
    s += c.ligne([[60, 170, cz - 80], [42, 212, cz - 96]], K, 10) + c.ligne([[60, 170, cz - 80], [42, 212, cz - 96]], '#5a5078', 4) +
      c.ligne([[200, 170, cz - 80], [218, 212, cz - 96]], K, 10) + c.ligne([[200, 170, cz - 80], [218, 212, cz - 96]], '#5a5078', 4);
    /* les anses */
    s += c.ligne([[22, 100, cz], [6, 112, cz], [10, 128, cz], [24, 126, cz]], K, 7) + c.ligne([[238, 100, cz], [254, 112, cz], [250, 128, cz], [236, 126, cz]], K, 7);
    /* le bord, l'intérieur, le liquide qui bouillonne */
    s += c.disque(130, cz, 112, 94, cuivre ? '#c98450' : '#5f5582') + c.disque(130, cz, 100, 95, cuivre ? '#a5582a' : '#3a3352');
    s += '<path class="at-liq-p" d="' + lisse(c.cercle(130, cz, 92, 98, 32), true) + '"/>';
    for(var i = 0; i < 5; i++){ var b = c.Q(84 + i * 24, 98, cz - 30 + (i % 2) * 40); s += '<circle class="at-blp" style="animation-delay:' + (i * 0.37).toFixed(2) + 's" cx="' + f1(b[0]) + '" cy="' + f1(b[1]) + '" r="5" fill="rgba(255,255,255,.55)"/>'; }
    s += c.sur('<g class="at-vapeur"><path d="M96,70 C86,52 104,42 94,24"/><path d="M134,64 C124,44 144,34 132,12"/><path d="M168,70 C158,52 176,42 166,26"/></g>', cz);
    return [N(s + '</g>')];
  }});

/* Le lutrin : un grand grimoire ouvert sur un pupitre en pente, qui brille doucement (on voit qu'on peut le toucher) */
def('lutrin', {w:170, h:226, p:80, z:'sol', special:'grimoire', nf:3, nom:'Lutrin du grimoire', ic:'📖', surf:[{x0:-30, x1:30, y:-152, z:50}],
  d:function(c){
    var f = c.fo, cuir = c.ti ? sombre(THEMES[c.ti].c, 0.15) : '#7a2a3a', cz = 40, s = '<g class="at-grimoire-p" data-at="grimoire">';
    s += c.sur('<ellipse class="at-halo at-lu-halo" cx="85" cy="70" rx="100" ry="62" fill="' + G('haloC') + '"/>', cz);
    if(f === 0){        /* pied de bois tourné */
      s += c.boite(40, 206, 130, 224, 12, 68, BOIS()) + c.cylindre(85, cz, 9, 104, 206, G('boisS'), null) + c.cylindre(85, cz, 16, 146, 154, G('boisH'), G('boisH')) + c.cylindre(85, cz, 14, 110, 116, G('boisH'), G('boisH'));
    } else if(f === 1){ /* pied sculpté, dorures */
      s += c.cylindre(85, cz, 40, 212, 224, G('bois'), G('boisH')) + c.cylindre(85, cz, 12, 104, 212, G('bois'), null, '', 18) + c.sur(T('M78,128 C84,136 86,150 80,166 M92,128 C86,136 84,150 90,166', '#f5b945', 3), cz - 14) + c.disque(85, cz, 10, 212, G('or'));
    } else {            /* trépied de fer */
      s += c.ligne([[85, 106, cz], [40, 224, cz + 30]], K, 9) + c.ligne([[85, 106, cz], [130, 224, cz + 30]], K, 9) + c.ligne([[85, 106, cz], [85, 224, cz - 34]], K, 9) +
        c.ligne([[85, 106, cz], [40, 224, cz + 30]], '#6a6290', 4) + c.ligne([[85, 106, cz], [130, 224, cz + 30]], '#6a6290', 4) + c.ligne([[85, 106, cz], [85, 224, cz - 34]], '#6a6290', 4);
    }
    /* le pupitre, en pente vers nous : son bord avant est bas, son bord arrière plus haut */
    var plateau = f === 2 ? G('metal') : G('boisH');
    s += c.poly([[10, 112, 2], [160, 112, 2], [160, 70, 64], [10, 70, 64]], plateau) + c.boite(8, 106, 162, 116, -2, 8, f === 2 ? UNI(G('metal')) : BOIS());
    /* le grimoire ouvert, posé sur la pente */
    var livre = P('M16,4 L154,4 L154,92 L16,92 Z', cuir) +
      P('M24,10 L84,14 L84,88 L26,84 Z', '#f6ecd2') + P('M86,14 L146,10 L144,84 L86,88 Z', '#f6ecd2') +
      T('M36,26 L76,28 M36,38 L76,40 M36,50 L76,52 M36,62 L70,64 M96,28 L134,24 M96,40 L136,36 M96,52 L136,48 M96,64 L128,60', '#a08a6a', 2.5) +
      T('M86,88 L92,112', '#c0392b', 4) + reflet('M30,16 L78,20', 3);
    s += c.surPlan(livre, [0, 108 - 92 * 0.449, 7 + 92 * 0.662], [1, 0, 0], [0, 0.449, -0.662], 85, 48);
    s += c.sur('<g class="at-runes at-lu-runes"><text x="54" y="22" font-size="20" fill="#8ff3ff" text-anchor="middle">✦</text><text x="86" y="6" font-size="16" fill="#bff9ff" text-anchor="middle">ᚱ</text><text x="120" y="20" font-size="19" fill="#8ff3ff" text-anchor="middle">✧</text></g>' +
      '<g class="at-lu-scint"><text x="16" y="52" font-size="14" fill="#fff3a8" text-anchor="middle">✨</text><text x="156" y="44" font-size="12" fill="#fff3a8" text-anchor="middle">✨</text></g>', cz);
    return [N(s + '</g>')];
  }});

/* La paillasse d'analyse : un grand plan de travail avec les outils de l'alchimiste (fioles, mortier, balance, pince, loupe)
   et, au milieu, les objets reçus (ceux qui attendent brillent). Cinq styles de table (🎨 dans le panneau d'analyse). */
def('paillasse', {w:480, h:212, p:130, z:'sol', special:'analyses', profil:true, nf:5, nom:'Paillasse d\'analyse', ic:'🔬', surf:[{x0:-226, x1:-150, y:-122, z:64}],
  d:function(c){
    var f = c.fo, s = '<g class="at-pupitre-p" data-at="analyses">', P2 = c.p;
    /* la table */
    if(f === 0){        /* établi de bois à tiroirs */
      s += pieds(c, 24, 456, 140, 212, 8, P2 - 8, 20) + c.boite(30, 184, 450, 194, 16, P2 - 16, UNI(G('boisH'))) + c.boite(14, 110, 466, 144, 4, P2 - 4, BOIS());
      var tir = '';
      for(var i = 0; i < 3; i++) tir += R(34 + i * 146, 116, 120, 22, 4, G('boisC'), ' stroke-width="3.5"') + Cir(94 + i * 146, 127, 4, G('or'));
      s += c.sur(tir, 4) + c.boite(4, 90, 476, 112, 0, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    } else if(f === 1){ /* comptoir de pierre sur un meuble */
      s += c.boite(18, 110, 462, 210, 4, P2 - 4, BOIS()) + c.sur(R(34, 122, 196, 76, 6, G('boisC'), ' stroke-width="3.5"') + R(250, 122, 196, 76, 6, G('boisC'), ' stroke-width="3.5"') + Cir(220, 160, 5, G('or')) + Cir(260, 160, 5, G('or')), 4) +
        c.boite(2, 88, 478, 112, -4, P2, UNI(G('pierre'))) + c.sur(reflet('M14,96 H466', 3), -4);
    } else if(f === 2){ /* marbre et pieds dorés */
      [10, P2 - 12].forEach(function(z){ [40, 160, 320, 440].forEach(function(x, j){ s += c.ligne([[x, 110, z], [x + (j < 2 ? -6 : 6), 160, z], [x, 210, z]], K, 11) + c.ligne([[x, 110, z], [x + (j < 2 ? -6 : 6), 160, z], [x, 210, z]], '#f5b945', 5); }); });
      s += c.boite(16, 104, 464, 114, 6, P2 - 6, UNI(G('or'))) + c.boite(4, 88, 476, 106, 0, P2, UNI('#efeaf6', '#f7f4fb', '#d6d0e8')) + c.sur(T('M60,94 C120,102 160,90 230,98 M300,92 C350,100 400,92 450,98', '#c9c2dc', 2.5), 0);
    } else if(f === 3){ /* meuble à petits tiroirs */
      s += c.boite(12, 108, 468, 210, 4, P2 - 4, BOIS());
      var t3 = '';
      for(var j = 0; j < 8; j++){ var x3 = 22 + (j % 4) * 110, y3 = 116 + Math.floor(j / 4) * 44; t3 += R(x3, y3, 102, 38, 5, G('boisC'), ' stroke-width="3.5"') + Cir(x3 + 51, y3 + 19, 4, G('or')); }
      s += c.sur(t3, 4) + c.boite(4, 90, 476, 110, 0, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    } else {            /* tréteaux */
      [12, P2 - 12].forEach(function(z){ s += c.ligne([[40, 112, z], [112, 210, z]], K, 12) + c.ligne([[112, 112, z], [40, 210, z]], K, 12) + c.ligne([[368, 112, z], [440, 210, z]], K, 12) + c.ligne([[440, 112, z], [368, 210, z]], K, 12) +
        c.ligne([[40, 112, z], [112, 210, z]], '#b06f3e', 6) + c.ligne([[112, 112, z], [40, 210, z]], '#b06f3e', 6) + c.ligne([[368, 112, z], [440, 210, z]], '#b06f3e', 6) + c.ligne([[440, 112, z], [368, 210, z]], '#b06f3e', 6); });
      s += c.boite(76, 156, 404, 164, P2 / 2 - 4, P2 / 2 + 4, UNI('#d29a5e')) + c.boite(4, 92, 476, 112, 0, P2, BOIS());
    }
    /* les outils, posés sur le plateau (au milieu de sa profondeur) */
    var outils = R(102, 56, 98, 10, 3, G('boisH'), ' stroke-width="3.5"') + fiolePetite(120, 92, '#7cf09a') + fiolePetite(151, 92, '#ff8fb3') + fiolePetite(182, 92, '#8ff3ff') +
      T('M226,70 L250,40', K, 10) + T('M226,70 L250,40', '#d6d0ee', 5) + P('M204,66 L256,66 C254,86 244,94 230,94 C216,94 206,86 204,66 Z', G('pierre')) + Ell(230, 66, 26, 6, '#4a4668');
    /* les objets reçus (au plus 3 dessinés) : ceux qui attendent brillent */
    (DESSIN.analyses || []).slice(0, 3).forEach(function(o, k){
      var x = 288 + k * 48;
      outils += (o.fait ? '' : '<circle class="at-halo at-a-analyser" cx="' + x + '" cy="66" r="26" fill="' + G('halo') + '"/>') +
        Ell(x, 88, 20, 6, o.fait ? '#cbbf9c' : '#fff6d8', ' stroke-width="3"') + emo(x, 66, 30, o.ic || '❔') + (o.fait ? emo(x + 15, 52, 14, '✅') : '');
    });
    /* la balance, la pince, la loupe sur son pied */
    outils += R(410, 50, 6, 38, 2, G('or'), ' stroke-width="3"') + T('M392,52 L434,52', K, 6) + T('M392,52 L434,52', '#f5b945', 3) +
      P('M384,70 Q392,78 400,70 Z', G('or'), ' stroke-width="3"') + P('M426,70 Q434,78 442,70 Z', G('or'), ' stroke-width="3"') + T('M392,52 L386,70 M392,52 L398,70 M434,52 L428,70 M434,52 L440,70', '#b8862e', 1.5) +
      T('M446,88 L466,58 M452,88 L462,58', K, 5) + T('M446,88 L466,58 M452,88 L462,58', '#a8a2c8', 2) +
      T('M468,86 L468,20', K, 9) + T('M468,86 L468,20', '#b8862e', 4) + Ell(468, 88, 14, 4, G('or'), ' stroke-width="3"') +
      Cir(444, 4, 24, G('or')) + Cir(444, 4, 17, 'rgba(191,243,255,.55)', ' stroke-width="3"') + T('M432,-4 C436,-10 444,-12 450,-10', '#fff', 3, ' opacity=".8"') + T('M468,20 L460,22', K, 6);
    s += c.sur(outils, P2 / 2);
    return [N(s + '</g>')];
  }});

var CHATS = [['#f2a65a', '#d9783c', '#ffe0bf'], ['#b9b3d2', '#7d7799', '#eceaf6'], ['#4a4060', '#2c2440', '#f3f0ff']];
function teteChat(p, cx, cy, acc){
  acc = acc || {};
  return '<g class="at-c-tete">' + '<g class="at-c-oreilles">' +
    P('M' + (cx - 16) + ',' + (cy - 6) + ' L' + (cx - 18) + ',' + (cy - 24) + ' L' + (cx - 4) + ',' + (cy - 14) + ' Z', p[0], ' stroke-width="4"') +
    P('M' + (cx + 4) + ',' + (cy - 14) + ' L' + (cx + 18) + ',' + (cy - 24) + ' L' + (cx + 16) + ',' + (cy - 6) + ' Z', p[0], ' stroke-width="4"') +
    sansTrait(P('M' + (cx - 14) + ',' + (cy - 9) + ' L' + (cx - 15) + ',' + (cy - 19) + ' L' + (cx - 7) + ',' + (cy - 13) + ' Z', '#ff9db4')) +
    sansTrait(P('M' + (cx + 7) + ',' + (cy - 13) + ' L' + (cx + 15) + ',' + (cy - 19) + ' L' + (cx + 14) + ',' + (cy - 9) + ' Z', '#ff9db4')) + '</g>' +
    (acc.cou && ACC[acc.cou] ? dessinAcc(acc.cou, cx, cy) : '') +
    Ell(cx, cy, 19, 16, p[0]) +
    sansTrait(P('M' + (cx - 8) + ',' + (cy + 6) + ' C' + (cx - 4) + ',' + (cy + 2) + ' ' + (cx + 4) + ',' + (cy + 2) + ' ' + (cx + 8) + ',' + (cy + 6) + ' C' + (cx + 4) + ',' + (cy + 12) + ' ' + (cx - 4) + ',' + (cy + 12) + ' ' + (cx - 8) + ',' + (cy + 6) + ' Z', p[2]) + T('M' + (cx - 8) + ',' + (cy + 6) + ' C' + (cx - 4) + ',' + (cy + 12) + ' ' + (cx + 4) + ',' + (cy + 12) + ' ' + (cx + 8) + ',' + (cy + 6), sombre(p[2], 0.25), 1.5)) +
    '<g class="at-c-yeux">' + Ell(cx - 7, cy - 1, 3.4, 4.4, K, ' stroke-width="1"') + Ell(cx + 7, cy - 1, 3.4, 4.4, K, ' stroke-width="1"') +
      '<circle cx="' + (cx - 6) + '" cy="' + (cy - 2.6) + '" r="1.3" fill="#fff"/><circle cx="' + (cx + 8) + '" cy="' + (cy - 2.6) + '" r="1.3" fill="#fff"/></g>' +
    '<g class="at-c-ferme">' + T('M' + (cx - 10) + ',' + (cy - 1) + ' q3,3 6,0 M' + (cx + 4) + ',' + (cy - 1) + ' q3,3 6,0', K, 2.2) + '</g>' +
    P('M' + (cx - 2.5) + ',' + (cy + 4) + ' l2.5,2.5 l2.5,-2.5 Z', '#ff8fa8', ' stroke-width="1.5"') +
    /* sa bouche dit son humeur : contente, ou un peu triste (il demande quelque chose) ; ses paupières tombent s'il a sommeil */
    '<g class="at-c-bouche">' + T('M' + cx + ',' + (cy + 6.5) + ' q-3,3.5 -6,1 M' + cx + ',' + (cy + 6.5) + ' q3,3.5 6,1', K, 1.6) + '</g>' +
    '<g class="at-c-moue">' + T('M' + (cx - 5) + ',' + (cy + 10) + ' q5,-4 10,0', K, 1.8) + '</g>' +
    '<g class="at-c-paupieres">' + ['M' + (cx - 13.2) + ',' + (cy - 0.4) + ' a6.2,6.6 0 0 1 12.4,0 Z', 'M' + (cx + 0.8) + ',' + (cy - 0.4) + ' a6.2,6.6 0 0 1 12.4,0 Z'].map(function(d){ return '<path d="' + d + '" fill="' + p[0] + '" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/>'; }).join('') + '</g>' +
    T('M' + (cx - 11) + ',' + (cy + 5) + ' l-12,-2 M' + (cx - 11) + ',' + (cy + 8) + ' l-12,2 M' + (cx + 11) + ',' + (cy + 5) + ' l12,-2 M' + (cx + 11) + ',' + (cy + 8) + ' l12,2', K, 1.1) +
    (acc.tete && ACC[acc.tete] ? dessinAcc(acc.tete, cx, cy) : '') +
    '</g>';
}
/* Le chat est dessiné de profil (il bouge, il marche, il saute) : il reste une image plate, posée dans la pièce à la bonne taille */
def('chat', {w:114, h:96, z:'petit', plat:true, nom:'Petit chat', ic:'🐈',
  d:function(c){
    var p = CHATS[c.v % 3], acc = c.o.acc || {};
    var queue = function(d, cls){ return '<g class="' + cls + '">' + T(d, K, 11) + T(d, p[0], 6) + '</g>'; };
    var patte = function(x, y, h, coul, cls){ return '<g class="' + cls + '">' + R(x, y, 9, h, 4, coul) + Ell(x + 4.5, y + h - 1, 6, 3.5, p[2], ' stroke-width="2.5"') + '</g>'; };
    /* roulé en boule, il dort */
    var dort = '<g class="at-c-g-dort"><g transform="translate(0,20)"><g class="at-respire">' +
      P('M88,64 C112,62 112,38 98,40 C106,46 104,58 86,58 Z', p[0]) +
      P('M18,68 C8,48 32,26 62,28 C92,30 102,50 98,68 Z', p[0]) +
      T('M60,32 C58,40 60,46 64,50 M76,34 C74,42 76,48 80,52 M44,34 C44,40 46,44 50,48', p[1], 4) +
      P('M10,68 C2,52 12,38 30,40 C46,42 50,58 44,68 Z', p[0]) +
      P('M13,46 L12,30 L25,40 Z', p[0], ' stroke-width="4"') + P('M33,40 L41,28 L43,46 Z', p[0], ' stroke-width="4"') +
      P('M15,43 L15,35 L21,40 Z', '#ff9db4', ' stroke-width="0"') +
      P('M20,62 C24,58 34,58 40,62 C36,67 24,67 20,62 Z', p[2], ' stroke-width="0"') +
      T('M16,54 q4,3 8,0 M30,54 q4,3 8,0', K, 2.5) + P('M26,59 l3,2 l3,-2 Z', '#ff8fa8', ' stroke-width="1.5"') +
      (acc.tete && ACC[acc.tete] ? '<g transform="translate(-30,18) rotate(-12 57 18)">' + dessinAcc(acc.tete, 57, 30) + '</g>' : '') + '</g></g></g>';
    /* assis, de profil (il regarde à droite) : il peut se lécher la patte ou taper un bocal */
    var assis = '<g class="at-c-g-assis">' + queue('M34,88 C12,90 6,72 16,60 C20,55 26,57 24,63', 'at-c-queue') +
      '<g class="at-c-ventre">' + Ell(52, 80, 30, 14, p[0]) + Ell(56, 82, 18, 8, p[2], ' stroke-width="0"') + '</g>' +
      P('M30,91 C24,74 30,52 50,48 C66,46 76,60 76,76 C76,86 70,91 60,91 Z', p[0]) +
      T('M40,60 C38,70 40,80 44,86 M50,56 C48,64 49,72 52,78', p[1], 4) +
      P('M60,58 C70,60 72,74 66,86 C60,82 58,70 60,58 Z', p[2], ' stroke-width="0"') +
      patte(57, 66, 26, p[1], 'at-c-patte-b') + patte(67, 64, 28, p[0], 'at-c-patte') +
      teteChat(p, 68, 34, acc) + '</g>';
    /* debout, il marche ou il saute */
    var debout = '<g class="at-c-g-debout">' + queue('M22,62 C6,54 6,34 16,26', 'at-c-queue') +
      patte(24, 64, 27, p[1], 'at-c-j at-c-j1') + patte(66, 64, 27, p[1], 'at-c-j at-c-j3') +
      '<g class="at-c-ventre">' + Ell(54, 70, 34, 12, p[0]) + '</g>' +
      P('M18,66 C16,52 30,46 54,46 C76,46 90,50 90,62 C90,72 78,74 56,74 C32,74 18,74 18,66 Z', p[0]) +
      T('M40,48 C38,56 40,64 44,70 M54,47 C52,56 54,64 58,70', p[1], 3.5) +
      patte(34, 66, 26, p[0], 'at-c-j at-c-j2') + patte(76, 66, 26, p[0], 'at-c-j at-c-j4') +
      teteChat(p, 92, 46, acc) + '</g>';
    return [
      N('<ellipse class="at-c-ombre" cx="58" cy="92" rx="46" ry="5" fill="rgba(0,0,0,.28)"/>'),
      N('<g class="at-c-corps">' + dort + assis + debout + '</g>'),
      N('<text class="at-zzz" x="46" y="34" font-size="17" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>' +
        '<text class="at-zzz z2" x="56" y="26" font-size="13" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>')
    ];
  }});

/* ---------- Objets de la boutique de l'Alchimiste (eux aussi dans la perspective de la pièce) ---------- */
/* des points le long d'une courbe de Bézier (un tuyau, une anse) */
function bezier3(a, b, c2, d, n){
  var l = [];
  for(var i = 0; i <= n; i++){
    var t = i / n, u = 1 - t;
    l.push([0, 1, 2].map(function(k){ return u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c2[k] + t * t * t * d[k]; }));
  }
  return l;
}
def('alambic', {w:116, h:144, p:60, z:'petit', nom:'Alambic', ic:'⚗️',
  d:function(c){
    var cz = 30, s = c.boite(18, 118, 68, 142, 14, 46, UNI(G('metal'), '#6a6290', '#352c4f')) +
      c.sur('<path class="at-flamme" d="M43,136 c-6,-6 -3,-12 0,-16 c3,4 6,10 0,16 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>', 14);
    s += c.tour(43, cz, [[118, 22], [106, 31], [92, 33], [80, 26], [72, 14]], G('cuivre'), null) + c.cylindre(43, cz, 8, 44, 74, G('cuivre'), G('cuivre'));
    var tuyau = bezier3([43, 46, cz], [58, 16, cz], [92, 20, cz], [97, 88, cz], 12);
    s += c.ligne(tuyau, K, 10) + c.ligne(tuyau, '#e08a4a', 5);
    s += c.tour(97, cz, [[138, 16], [128, 21], [116, 19], [106, 9]], G('verre'), null, ' stroke-width="4"') +
      c.tour(97, cz, [[136, 13], [128, 18], [124, 18.5]], '#8ff3ff', '#bff9ff', ' stroke-width="0" opacity=".85"') + c.cylindre(97, cz, 6, 88, 108, G('verre'), null, ' stroke-width="3.5"');
    s += c.sur(reflet('M24,104 C22,94 26,86 32,82', 3), cz - 30);
    return [N(s)];
  }});
def('thermometre', {w:52, h:144, p:16, z:'mur', nom:'Thermomètre', ic:'🌡️',
  d:function(c){
    return [N(c.boite(6, 6, 46, 138, 0, 14, BOIS()) + c.sur(R(20, 16, 12, 98, 6, '#f6ecd2', ' stroke-width="3"') +
      '<rect class="at-mercure" x="23" y="48" width="6" height="70" rx="3" fill="#e8693c"/>' + Cir(26, 118, 12, '#e8693c') +
      T('M34,30 h6 M34,46 h6 M34,62 h6 M34,78 h6 M34,94 h6', K, 2) + reflet('M12,20 V128', 3), 0))];
  }});
def('balance_or', {w:124, h:116, p:56, z:'petit', nom:'Balance d\'or', ic:'⚖️',
  d:function(c){
    var cz = 28, s = c.tour(62, cz, [[100, 14], [112, 26]], G('or'), G('or')) + c.cylindre(62, cz, 4, 28, 102, G('or'), G('or'));
    var fleau = c.ligne([[14, 32, cz], [110, 32, cz]], K, 8) + c.ligne([[14, 32, cz], [110, 32, cz]], '#f5b945', 4) +
      c.ligne([[14, 32, cz], [4, 72, cz]], '#b8862e', 2) + c.ligne([[14, 32, cz], [24, 72, cz]], '#b8862e', 2) + c.ligne([[110, 32, cz], [100, 72, cz]], '#b8862e', 2) + c.ligne([[110, 32, cz], [120, 72, cz]], '#b8862e', 2) +
      c.cylindre(14, cz, 15, 72, 80, G('or'), '#f7d778', '', 7) + c.cylindre(110, cz, 15, 72, 80, G('or'), '#f7d778', '', 7);
    s += '<g class="at-balance">' + fleau + '</g>' + c.boule(62, 26, cz, 6, G('or'));
    return [N(s)];
  }});
def('mortier', {w:84, h:74, p:70, z:'petit', nom:'Mortier', ic:'🥣',
  d:function(c){
    var cz = 35, s = c.tour(42, cz, [[36, 34], [50, 32], [62, 26], [72, 16]], G('pierre'), '#8c88ad') + c.disque(42, cz, 27, 37, '#4a4668');
    s += c.ligne([[50, 40, cz], [74, 4, cz + 10]], K, 12) + c.ligne([[50, 40, cz], [74, 4, cz + 10]], '#d6d0ee', 6) + c.sur(reflet('M16,44 C18,56 26,62 34,64', 3), cz - 34);
    return [N(s)];
  }});
def('serre', {w:144, h:176, p:100, z:'sol', nom:'Serre enchantée', ic:'🪴',
  d:function(c){
    var s = c.boite(8, 150, 136, 174, 0, 100, BOIS()) + c.poly([[18, 150, 10], [126, 150, 10], [126, 150, 90], [18, 150, 90]], '#5a3a22');
    s += c.sur(P('M40,150 C34,120 30,100 40,80 C50,100 50,124 46,150 Z', G('vert')) + P('M70,150 C66,110 74,80 92,64 C96,96 86,124 78,150 Z', G('vert')) +
      P('M100,150 C98,126 104,108 118,100 C118,120 112,136 106,150 Z', G('vert')) +
      '<circle class="at-lueur" cx="92" cy="62" r="7" fill="#8ff3ff" stroke="' + K + '" stroke-width="3"/><circle class="at-lueur" cx="40" cy="78" r="6" fill="#ff8fb3" stroke="' + K + '" stroke-width="3"/>', 50);
    /* la cloche de verre : une voûte (son devant, son dos et le dessus entre les deux) */
    var arche = function(z){ var l = []; for(var i = 0; i <= 18; i++){ var a = Math.PI - i / 18 * Math.PI; l.push([72 + Math.cos(a) * 56, 72 - Math.sin(a) * 40, z]); } return l; };
    var av = arche(8), ar = arche(92), pts = [];
    av.concat(ar).forEach(function(q){ pts.push(c.Q(q[0], q[1], q[2])); });
    pts.push(c.Q(16, 150, 8), c.Q(128, 150, 8), c.Q(16, 150, 92), c.Q(128, 150, 92));
    s += P(lisse(enveloppe(pts), true, 0.4), G('verre'), ' stroke-width="4"');
    s += c.ligne(av.concat([[128, 150, 8], [16, 150, 8], [16, 72, 8]]), K, 3.5) + c.ligne([[72, 32, 8], [72, 32, 92]], K, 3) + c.ligne([[72, 32, 8], [72, 150, 8]], K, 3) + c.ligne([[16, 104, 8], [128, 104, 8]], K, 3) +
      c.sur(reflet('M26,70 C28,52 40,42 54,38', 4), 8);
    return [N(s)];
  }});
def('athanor', {w:132, h:196, p:110, z:'sol', nom:'Athanor', ic:'🔥',
  d:function(c){
    var cz = 55, s = c.cylindre(66, cz, 48, 64, 194, G('terre'), null), b = '';
    for(var y = 84; y < 190; y += 20) b += c.arcAvant(66, cz, 48.5, y, '#7a3418', 2.5);
    s += b + c.tour(66, cz, [[64, 48], [46, 42], [34, 28], [28, 14]], G('terre'), G('terre')) + c.cylindre(66, cz, 15, 6, 34, G('pierre'), '#4a4668');
    s += c.sur(P('M46,184 L46,138 C46,118 86,118 86,138 L86,184 Z', '#2a1208') + '<ellipse class="at-braise" cx="66" cy="170" rx="16" ry="10" fill="#ff8a3c"/>', cz - 48);
    s += c.sur(reflet('M30,80 V180', 4), cz - 40);
    return [N(s)];
  }});
def('oeil_cristal', {w:84, h:104, p:62, z:'petit', nom:'Œil de cristal', ic:'🔮',
  d:function(c){
    var cz = 31, s = c.sur('<circle class="at-halo" cx="42" cy="46" r="56" fill="' + G('haloC') + '"/>', cz);
    s += c.tour(42, cz, [[78, 15], [90, 20], [102, 26]], G('or'), G('or'));
    s += c.boule(42, 46, cz, 33, G('cristal')) + c.sur('<path class="at-tourne" d="M28,46 C30,30 54,30 56,46 C54,60 34,58 36,46" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>' + reflet('M22,38 C24,26 32,18 42,16', 4), cz - 20);
    return [N(s)];
  }});
var LIVRES = {herbier:['#3f9a6a', '🌿'], grimoire_rec:['#c0392b', '📕'], grand_grimoire:['#6a3fb0', '⭐']};
def('livre', {w:88, h:52, p:66, z:'petit', nom:'Livre', ic:'📗',
  d:function(c){
    var p = LIVRES[c.o.t] || LIVRES.herbier, col = p[0];
    var s = c.boite(8, 44, 82, 50, 4, 62, UNI(sombre(col, 0.2))) + c.boite(10, 30, 80, 44, 6, 60, UNI('#f6ecd2', '#f6ecd2', '#e6d6b0')) +
      c.boite(8, 26, 82, 31, 4, 62, UNI(col, clair(col, 0.12), sombre(col, 0.25))) + c.boite(4, 26, 12, 50, 4, 62, UNI(sombre(col, 0.3)));
    s += c.dessus(T('M20,-14 H76 M20,14 H76', '#ffd36a', 2.5) + emo(48, 0, 22, p[1]), 26, 33);
    return [N(s)];
  }});
def('fioles', {w:112, h:84, p:44, z:'petit', nom:'Fioles', ic:'🧴',
  d:function(c){
    var cols = c.o.t === 'fioles_ether' ? ['#bff9ff', '#e0d0ff', '#bff9ff', '#ffe3a3'] : ['#7cf09a', '#ff7a59', '#8ff3ff', '#ffd84a'], s = c.boite(6, 62, 106, 82, 2, 42, BOIS()), f = '';
    for(var i = 0; i < 4; i++){
      var x = 22 + i * 23;
      f += c.tour(x, 22, [[64, 10], [56, 11], [46, 6]], G('verre'), null, ' stroke-width="3.5"') + c.tour(x, 22, [[63, 8.5], [56, 9.5], [54, 9.5]], cols[i], clair(cols[i], 0.4), ' stroke-width="0"') +
        c.cylindre(x, 22, 4.5, 34, 48, G('verre'), null, ' stroke-width="3"') + c.cylindre(x, 22, 5, 26, 34, '#c58a4a', '#e0a868', ' stroke-width="2.5"');
    }
    s += c.sur(T('M6,72 H106', 'rgba(40,20,10,.35)', 2), 2);
    return [N(s + f)];
  }});
def('etal', {w:204, h:176, p:110, z:'sol', nom:'Étal du marché', ic:'🛒',
  d:function(c){
    var s = c.boite(20, 50, 30, 100, 94, 104, SOMBRE()) + c.boite(174, 50, 184, 100, 94, 104, SOMBRE()) + c.boite(12, 98, 192, 174, 0, 104, BOIS());
    [[52, 34, '#f3c13e', 13], [84, 58, '#7d3aa8', 12], [112, 30, '#52c05e', 13], [146, 62, '#ff7a59', 12], [70, 76, '#ff7a59', 11], [130, 80, '#f3c13e', 11]].sort(function(a, b){ return b[1] - a[1]; })
      .forEach(function(f){ s += c.boule(f[0], 98 - f[3], f[1], f[3], f[2]); });
    s += c.boite(20, 50, 30, 98, 6, 16, SOMBRE()) + c.boite(174, 50, 184, 98, 6, 16, SOMBRE());
    /* l'auvent rayé, en pente vers nous */
    for(var i = 0; i < 8; i++){
      var a = 6 + i * 24, b = a + 24;
      s += c.poly([[a, 36, 108], [b, 36, 108], [b, 60, -8], [a, 60, -8]], i % 2 ? '#f6ecd2' : '#d9544f', ' stroke-width="3"');
    }
    s += c.sur(reflet('M24,108 H180', 3), 0);
    return [N(s)];
  }});
def('socle', {w:88, h:96, p:62, z:'petit', nom:'Objet', ic:'✨',
  d:function(c){
    var cz = 31, s = c.sur('<circle class="at-halo" cx="44" cy="34" r="40" fill="' + G('haloC') + '"/>', cz) + c.boite(16, 60, 72, 94, 8, 54, BOIS()) + c.boite(10, 52, 78, 62, 2, 60, UNI(G('boisH'), G('boisH'), G('boisS')));
    return [N(s + c.sur(emo(44, 30, 40, c.ic || '✨'), cz))];
  }});

['alambic', 'thermometre', 'balance_or', 'mortier', 'serre', 'athanor', 'oeil_cristal', 'livre', 'fioles', 'etal', 'socle'].forEach(function(t){ CAT[t].deco = true; });

/* Les objets de boutique qu'on pose dans l'atelier (les autres se portent sur le héros) */
var BOUTIQUE_DESSIN = {alambic:'alambic', thermometre:'thermometre', balance_or:'balance_or', mortier:'mortier', serre:'serre', athanor:'athanor',
  oeil_cristal:'oeil_cristal', herbier:'livre', grimoire_rec:'livre', grand_grimoire:'livre', fioles_renf:'fioles', fioles_ether:'fioles', etal:'etal',
  loupe_doree:'socle', pierre_transmu:'socle'};
var PORTES = {gants_cuir:1, lunettes_alchi:1, ceinture_fioles:1, sac_herbo:1, chaudron_cuivre:1};
function catDe(o){
  var c = CAT[o.t];
  if(c) return c;
  var b = BOUTIQUE_DESSIN[o.t];
  return b ? CAT[b] : CAT.socle;
}
function icObjetBoutique(id){ var D = DD(); return (D.OBJETS && D.OBJETS[id] && D.OBJETS[id].ic) || '✨'; }

/* ---------- Cartons et colis (posés par terre, dans la même perspective) ---------- */
var CARTON_TAILLE = {carton:[152, 132, 116], colis:[132, 124, 104]};
function dessinCarton(k, RC){
  var x = ajouterOutils3d(ctx3d(RC, false)), s;
  x.p = (CARTON_TAILLE[k.t] || CARTON_TAILLE.carton)[2]; x.cat = {w:RC.w, h:RC.h};
  var l = [], y = RC.h;
  [[-10, -8], [RC.w + 10, -8], [RC.w + 14, x.p + 8], [-14, x.p + 8]].forEach(function(q){ l.push(x.Q(q[0], y, q[1])); });
  var ombre = '<path d="' + lisse(l, true) + '" fill="rgba(12,6,20,.32)"/>';
  if(k.t === 'colis'){
    var V2 = UNI(G('violet'), '#a585ee', '#5537a0'), OR = UNI(G('or'), '#ffe08a', '#b07a1c');
    s = x.boite(10, 46, 122, 122, 4, 100, V2) + x.boite(58, 46, 74, 122, 2, 4, OR) +
      x.boite(4, 30, 128, 48, -2, 106, V2) + x.boite(58, 29, 74, 48, -3, 107, OR) + x.boite(4, 29, 128, 48, 44, 60, OR);
    s += x.sur(P('M66,30 C46,6 30,18 44,30 Z', G('or'), ' stroke-width="4"') + P('M66,30 C86,6 102,18 88,30 Z', G('or'), ' stroke-width="4"') +
      '<text class="at-scintille" x="104" y="12" font-size="22" text-anchor="middle">✨</text>', 52) + x.sur(reflet('M18,58 V112', 4), 4);
  } else {
    var CB = UNI(G('carton'), G('cartonH'), '#b07c46');
    s = '<g class="at-dessus-ouvert">' + x.poly([[8, 44, 112], [144, 44, 112], [144, 8, 128], [8, 8, 128]], '#d9a966') + '</g>' +
      x.boite(8, 44, 144, 128, 0, 112, CB) +
      '<g class="at-dessus-ferme">' + x.poly([[64, 44, 0], [88, 44, 0], [88, 44, 112], [64, 44, 112]], '#efe0b0', ' stroke-width="3"') + '</g>' +
      '<g class="at-dessus-ouvert">' + x.poly([[14, 44, 6], [138, 44, 6], [138, 44, 106], [14, 44, 106]], '#6b4a2a') + '</g>' +
      '<g class="at-rabats">' + x.poly([[8, 44, 0], [8, 44, 112], [-20, 22, 112], [-20, 22, 0]], G('cartonH')) + x.poly([[144, 44, 0], [144, 44, 112], [172, 22, 112], [172, 22, 0]], G('cartonH')) +
        x.poly([[8, 44, 0], [144, 44, 0], [144, 30, -30], [8, 30, -30]], G('cartonH')) + '</g>' +
      x.sur(R(64, 44, 24, 30, 0, '#efe0b0', ' stroke-width="3"') + T('M20,104 h22 M20,112 h14', '#8a5a2a', 3) + emo(118, 100, 20, '✨') + reflet('M16,52 V120', 4), 0);
  }
  var coins = [];
  [0, RC.w].forEach(function(a){ [0, RC.h].forEach(function(b){ [0, x.p].forEach(function(z){ coins.push(x.Q(a, b, z)); }); }); });
  var hull = enveloppe(coins);
  s = ombre + '<path d="M' + hull.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z" fill="transparent"/>' + s;
  return {svg:s, bb:x.bb.slice()};
}
