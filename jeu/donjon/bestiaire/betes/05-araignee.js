/* L'araignée des caves : pendue à son fil, huit pattes velues, huit yeux rouges, et ses œufs à côté */
(function(){
var B = window.BT, P = B.P, L = B.L, F = B.F, C = B.C, O = B.O, LUNE = B.LUNE, N = 0;
function f1(v){ return (+v).toFixed(1); }
function pt(p){ return f1(p[0]) + ' ' + f1(p[1]); }
function lisse(pts, ferme){
  var n = pts.length, s = 'M' + pt(pts[0]), m = ferme ? n : n - 1;
  function q(i){ return ferme ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; }
  for(var i = 0; i < m; i++){
    var a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2);
    s += ' C ' + pt([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) + ' ' + pt([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) + ' ' + pt(c);
  }
  return s + (ferme ? ' Z' : '');
}
function tube(pts, ws){
  var n = pts.length, G = [], D = [];
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = ws[i] / 2;
    G.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); D.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  function bout(i, j, w){ var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], l = Math.hypot(dx, dy) || 1; return [pts[i][0] + dx / l * w * .5, pts[i][1] + dy / l * w * .5]; }
  return {d: lisse(G.concat([bout(n - 1, n - 2, ws[n - 1])], D.slice().reverse(), [bout(0, 1, ws[0])]), true), g: G, dr: D};
}
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
/* un point sur une ellipse tournée */
function ell(c, rx, ry, rot, a){ var ca = Math.cos(rot), sa = Math.sin(rot), x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca]; }
function ellChemin(c, rx, ry, rot, n, bosse, seed){
  var R = B.rng(seed || 1), pts = [];
  for(var k = 0; k < n; k++){ var a = k / n * Math.PI * 2, f = 1 + (R() - .5) * (bosse || 0); pts.push(ell(c, rx * f, ry * f, rot, a)); }
  return lisse(pts, true);
}

function dessin(){
  var d = new B.Dessin(), u = 'araignee' + (++N) + '_', nid = 0, s = '';
  function id(){ return u + (++nid); }
  function clip(chemin){ var i = id(); d.defs.push('<clipPath id="' + i + '"><path d="' + chemin + '"/></clipPath>'); return ' clip-path="url(#' + i + ')"'; }
  function rad(stops, cx, cy, r){ var i = id(); d.defs.push('<radialGradient id="' + i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</radialGradient>'); return 'url(#' + i + ')'; }
  function lin(stops, x1, y1, x2, y2){ var i = id(); d.defs.push('<linearGradient id="' + i + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stops.map(function(t){ return '<stop offset="' + t[0] + '" stop-color="' + t[1] + '" stop-opacity="' + (t[2] == null ? 1 : t[2]) + '"/>'; }).join('') + '</linearGradient>'); return 'url(#' + i + ')'; }
  var flou1 = d.flou(1), flou2 = d.flou(2), flou4 = d.flou(4), flou8 = d.flou(8);
  var chit = '#40302f', chitS = '#2a1e22', bande = '#a27a52', soie = '#d6dcea';

  /* ---- l'ombre au sol : petite et pâle (elle pend en l'air) ---- */
  s += '<ellipse cx="262" cy="396" rx="120" ry="10" fill="#000" opacity=".3" filter="' + flou4 + '"/><ellipse cx="262" cy="396" rx="60" ry="5" fill="#000" opacity=".25"/>';

  /* ---- la toile, en arrière-plan : rayons, spirale qui pend, gouttes de rosée ---- */
  var W = [118, 70], R = B.rng(21), rayons = [];
  for(var k = 0; k < 14; k++){ var a = -1.9 + k * .34 + (R() - .5) * .08, lg = 220 + R() * 160; rayons.push([a, lg]); s += L('M' + pt(W) + ' L ' + pt([W[0] + Math.cos(a) * lg, W[1] + Math.sin(a) * lg]), soie, 1, ' opacity=".22"'); }
  for(var r = 18; r < 230; r += 14 + r * .06){
    var tr = '';
    for(var k2 = 0; k2 < rayons.length - 1; k2++){
      if(R() < .1 && r > 80) continue;
      var a0 = rayons[k2][0], a1 = rayons[k2 + 1][0], r0 = r * (.96 + R() * .08), r1 = r * (.96 + R() * .08);
      if(r0 > rayons[k2][1] || r1 > rayons[k2 + 1][1]) continue;
      var p0 = [W[0] + Math.cos(a0) * r0, W[1] + Math.sin(a0) * r0], p1 = [W[0] + Math.cos(a1) * r1, W[1] + Math.sin(a1) * r1], m = lerp(lerp(p0, p1, .5), W, .06);
      tr += 'M' + pt(p0) + ' Q ' + pt(m) + ' ' + pt(p1) + ' ';
      if(R() < .08) s += C(f1(m[0]), f1(m[1] + 2), 1.8, '#e8f6ff', ' opacity=".55"') + C(f1(m[0] + .6), f1(m[1] + 1.4), .6, '#ffffff');
    }
    s += L(tr, soie, .9, ' opacity="' + f1(.24 - r / 1400) + '"');
  }
  /* un pan de toile déchiré qui pend */
  s += L('M40 250 C 52 270 58 300 52 330 M60 238 C 74 262 78 290 70 318 M52 250 Q 60 262 66 258 M56 280 Q 62 290 70 286', soie, 1, ' opacity=".22"');
  /* le coin de toile en haut à droite */
  s += L('M540 160 L 452 0 M540 120 L 492 0 M540 70 L 516 0 M520 0 Q 528 40 540 50 M484 0 Q 506 70 540 96 M462 0 Q 490 96 540 136', soie, 1, ' opacity=".2"');

  /* ---- les fils : celui de l'araignée, celui du cocon ---- */
  var spin = [392, 88];
  s += L('M392 0 L ' + pt(spin), '#eef4ff', 3, ' opacity=".25" filter="' + flou1 + '"') + L('M392 0 L ' + pt(spin), '#eef4ff', 1.4, ' opacity=".85"');
  s += C(392, 34, 2, '#ffffff', ' opacity=".8"') + C(392, 60, 1.4, '#ffffff', ' opacity=".6"');
  s += L('M472 0 L 472 58', '#eef4ff', 1.2, ' opacity=".7"') + L('M472 40 L 452 0 M472 40 L 494 0', '#eef4ff', .8, ' opacity=".35"');

  /* ---- le cocon d'œufs, emmailloté de soie ---- */
  var coc = [472, 104], cocon = ellChemin(coc, 30, 42, .12, 14, .1, 4);
  s += '<g>' + P(cocon, rad([[0, '#f4efe2'], [.6, '#cfc6b4'], [1, '#8a8274']], .62, .32, .75));
  s += '<g' + clip(cocon) + '>';
  R = B.rng(8);
  for(var e = 0; e < 16; e++){ var ex = coc[0] - 20 + R() * 40, ey = coc[1] - 30 + R() * 60; s += C(f1(ex), f1(ey), f1(4 + R() * 3), '#e8c890', ' opacity=".35"') + C(f1(ex + 1.5), f1(ey - 1.5), 1.4, '#fff8e0', ' opacity=".5"'); }
  for(var e2 = 0; e2 < 22; e2++){ var y0 = coc[1] - 44 + e2 * 4.2, cu = (R() - .5) * 20; s += L('M' + f1(coc[0] - 34) + ' ' + f1(y0 + cu * .3) + ' Q ' + f1(coc[0]) + ' ' + f1(y0 + cu) + ' ' + f1(coc[0] + 34) + ' ' + f1(y0 - cu * .4 + 6), R() < .5 ? '#ffffff' : '#9a9282', .8, ' opacity=".45"'); }
  s += '<ellipse cx="' + (coc[0] + 10) + '" cy="' + (coc[1] - 18) + '" rx="10" ry="14" fill="#ffffff" opacity=".35" filter="' + flou4 + '"/>';
  s += '</g>' + L('M462 64 C 480 66 496 84 500 104', LUNE, 2, ' opacity=".6"') + '</g>';
  s += L('M466 62 Q 472 70 478 62 M462 70 L 482 70', '#eef4ff', 1, ' opacity=".6"');
  s += L('M470 146 C 468 156 474 164 470 172', '#eef4ff', .9, ' opacity=".5"');

  /* ---- les huit pattes : hanche, cuisse, genou, tibia, bout griffu ; poils raides et anneaux clairs ---- */
  var Cc = [250, 226], rotC = Math.atan2(-82, 87) + Math.PI;
  function patte(b, t, w, fonce, seed){
    var R = B.rng(seed), dx = t[0] - b[0], dy = t[1] - b[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, m = lerp(b, t, .5);
    if(nx * (m[0] - Cc[0]) + ny * (m[1] - Cc[1]) < 0){ nx = -nx; ny = -ny; }
    var K = [b[0] + dx * .36 + nx * l * .3, b[1] + dy * .36 + ny * l * .3], J = [b[0] + dx * .7 + nx * l * .16, b[1] + dy * .7 + ny * l * .16];
    var col = fonce ? B.sombre(chit, .3) : chit, bd = fonce ? B.sombre(bande, .35) : bande, s = '';
    var segs = [[b, K, [w, w * .92, w * .78]], [K, J, [w * .72, w * .62, w * .56]], [J, t, [w * .52, w * .36, w * .16]]];
    segs.forEach(function(g, i){
      var mm = lerp(g[0], g[1], .5), tb = tube([g[0], [mm[0] + nx * 3 * (i === 2 ? -1 : 1), mm[1] + ny * 3 * (i === 2 ? -1 : 1)], g[1]], g[2]);
      /* poils raides le long des bords, inclinés vers le bout */
      var poilsH = '', ux = (g[1][0] - g[0][0]), uy = (g[1][1] - g[0][1]), ul = Math.hypot(ux, uy); ux /= ul; uy /= ul;
      [tb.g, tb.dr].forEach(function(bord, sd){
        for(var q = 0; q < bord.length - 1; q++){ for(var z = 0; z < 3; z++){ var p = lerp(bord[q], bord[q + 1], (z + R()) / 3), ox = p[0] - lerp(g[0], g[1], (q + z / 3) / 2)[0], oy = p[1] - lerp(g[0], g[1], (q + z / 3) / 2)[1], ol = Math.hypot(ox, oy) || 1, hl = (5 - i * 1.2) * (.6 + R() * .8);
          poilsH += 'M' + pt(p) + ' l ' + f1(ox / ol * hl * 1.3 + ux * hl * .9) + ' ' + f1(oy / ol * hl * 1.3 + uy * hl * .9) + ' '; } }
      });
      s += L(poilsH, fonce ? '#5a4a52' : '#8a7470', 1.3, ' opacity=".9"');
      s += P(tb.d, d.g(col), ' stroke-width="' + (i === 2 ? 2.2 : 2.6) + '"');
      var fz = '';
      for(var q2 = 0; q2 < 14; q2++){ var pp = lerp(g[0], g[1], .08 + q2 / 15), off = (R() - .5) * g[2][1] * .7; fz += 'M' + f1(pp[0] + nx * off) + ' ' + f1(pp[1] + ny * off) + ' l ' + f1(ux * 4 + nx * 1.5) + ' ' + f1(uy * 4 + ny * 1.5) + ' '; }
      s += L(fz, fonce ? '#8a7a8a' : '#c8aa98', .9, ' opacity=".45"' + clip(tb.d));
      /* l'anneau clair au bout du segment */
      if(i < 2){ var r0 = lerp(g[0], g[1], .8), r1 = lerp(g[0], g[1], .94), wv = g[2][2] * .5 + .5;
        s += L('M' + pt(r0) + ' L ' + pt(r1), bd, wv * 2, ' opacity=".9"' + clip(tb.d)); }
      s += L('M' + pt(lerp(tb.dr[0], tb.dr[1], .3)) + ' Q ' + pt(tb.dr[1]) + ' ' + pt(lerp(tb.dr[1], tb.dr[2], .7)), fonce ? '#7a6a8a' : LUNE, 1.2, ' opacity=".5"');
      s += L('M' + pt(lerp(tb.g[0], tb.g[1], .3)) + ' Q ' + pt(tb.g[1]) + ' ' + pt(lerp(tb.g[1], tb.g[2], .7)), fonce ? '#7a6a8a' : LUNE, 1.2, ' opacity=".5"');
    });
    /* les articulations, bosselées */
    [K, J].forEach(function(j, i){ s += '<ellipse cx="' + f1(j[0]) + '" cy="' + f1(j[1]) + '" rx="' + f1(w * (.5 - i * .12)) + '" ry="' + f1(w * (.42 - i * .1)) + '" fill="' + d.g(fonce ? B.sombre(bande, .45) : B.sombre(bande, .15)) + '" stroke="' + O + '" stroke-width="2"/>' + C(f1(j[0] + 1.5), f1(j[1] - 1.5), f1(w * .12), '#ffe8c8', ' opacity=".5"'); });
    /* la petite griffe au bout */
    var ex = (t[0] - J[0]) / Math.hypot(t[0] - J[0], t[1] - J[1]), ey = (t[1] - J[1]) / Math.hypot(t[0] - J[0], t[1] - J[1]);
    s += L('M' + pt(t) + ' q ' + f1(ex * 6) + ' ' + f1(ey * 6) + ' ' + f1(ex * 5 - ey * 4) + ' ' + f1(ey * 5 + ex * 4), '#120c10', 2);
    return s;
  }
  /* d'où partent les pattes, et où elles vont */
  var hanches = [[218, 196], [232, 188], [248, 184], [264, 186], [270, 252], [256, 260], [240, 262], [226, 258]];
  var bouts = [[18, 236], [24, 126], [118, 30], [262, 16], [524, 262], [404, 378], [176, 376], [56, 318]];
  var largeurs = [18, 17, 16, 15, 15, 16, 17, 18];
  /* d'abord celles du fond (le côté haut), plus sombres */
  [3, 2, 4, 5].forEach(function(i){ s += patte(hanches[i], bouts[i], largeurs[i], true, 30 + i); });
  [1, 0, 6, 7].forEach(function(i){ s += patte(hanches[i], bouts[i], largeurs[i], false, 30 + i); });

  /* ---- l'abdomen : gros, luisant, poilu, avec ses losanges orange ---- */
  var Ac = [334, 142], rotA = Math.atan2(-82, 87);
  var abdo = ellChemin(Ac, 82, 64, rotA, 18, .05, 9);
  s += F(abdo, '#000', ' opacity=".35" filter="' + flou8 + '" transform="translate(-6 10)"');
  /* une frange de poils raides sur le pourtour */
  R = B.rng(13); var fr = '';
  for(var k3 = 0; k3 < 60; k3++){ var a3 = k3 / 60 * Math.PI * 2, p0 = ell(Ac, 80, 62, rotA, a3), p1 = ell(Ac, 90 + R() * 6, 71 + R() * 6, rotA, a3 + .04); fr += 'M' + pt(p0) + ' L ' + pt(p1) + ' '; }
  s += L(fr, '#2a1c1e', 1.4);
  s += P(abdo, rad([[0, '#6a5048'], [.55, '#463430'], [1, '#22181c']], .62, .32, .78));
  s += '<g' + clip(abdo) + '>';
  /* le motif : une rangée de losanges orange le long du dos, bordés de noir, et des chevrons */
  var axA = [Math.cos(rotA), Math.sin(rotA)];
  s += L('M' + pt(ell(Ac, 82 * -.55, 0, rotA, 0)) + ' L ' + pt(ell(Ac, 82 * .8, 0, rotA, 0)), '#140a0c', 12, ' opacity=".55"');
  for(var k4 = 0; k4 < 5; k4++){
    var t4 = -.42 + k4 * .27, c4 = ell(Ac, 82 * t4, 0, rotA, 0), sz = 23 - k4 * 3.3, ax = Math.cos(rotA), ay = Math.sin(rotA), bx = -ay, by = ax;
    var los = 'M' + pt([c4[0] + ax * sz * 1.1, c4[1] + ay * sz * 1.1]) + ' L ' + pt([c4[0] + bx * sz * .8, c4[1] + by * sz * .8]) + ' L ' + pt([c4[0] - ax * sz * 1.1, c4[1] - ay * sz * 1.1]) + ' L ' + pt([c4[0] - bx * sz * .8, c4[1] - by * sz * .8]) + ' Z';
    s += P(los, lin([[0, '#ffb060'], [.5, '#e8762a'], [1, '#a8441a']], 1, 0, 0, 1), ' stroke-width="3"');
    s += L('M' + pt([c4[0] - ax * sz * .7, c4[1] - ay * sz * .7]) + ' L ' + pt([c4[0] + ax * sz * .7, c4[1] + ay * sz * .7]), '#ffe0a8', 1.6, ' opacity=".7"');
    s += F('M' + pt([c4[0] + ax * sz * 1.1, c4[1] + ay * sz * 1.1]) + ' L ' + pt([c4[0] + bx * sz * .8, c4[1] + by * sz * .8]) + ' L ' + pt([c4[0], c4[1]]) + ' Z', '#fff0c8', ' opacity=".3"');
    var ch = 'M' + pt([c4[0] + bx * sz * 1.6 - ax * sz * .4, c4[1] + by * sz * 1.6 - ay * sz * .4]) + ' L ' + pt([c4[0] + bx * sz * .95, c4[1] + by * sz * .95]) + ' M' + pt([c4[0] - bx * sz * 1.6 - ax * sz * .4, c4[1] - by * sz * 1.6 - ay * sz * .4]) + ' L ' + pt([c4[0] - bx * sz * .95, c4[1] - by * sz * .95]);
    s += L(ch, '#d8a070', 2.2, ' opacity=".55"');
    s += C(f1(c4[0] + bx * sz * 1.9), f1(c4[1] + by * sz * 1.9), 2.6, '#e8c8a0', ' opacity=".5"') + C(f1(c4[0] - bx * sz * 1.9), f1(c4[1] - by * sz * 1.9), 2.6, '#e8c8a0', ' opacity=".5"');
  }
  /* le duvet, le reflet luisant de la lune */
  R = B.rng(17); var duvet = '';
  for(var k5 = 0; k5 < 220; k5++){ var a5 = R() * Math.PI * 2, r5 = Math.sqrt(R()), p5 = ell(Ac, 80 * r5, 62 * r5, rotA, a5), l5 = 3 + R() * 4; duvet += 'M' + pt(p5) + ' l ' + f1(Math.cos(rotA + Math.PI) * l5 + (R() - .5) * 3) + ' ' + f1(Math.sin(rotA + Math.PI) * l5 + (R() - .5) * 3) + ' '; }
  s += L(duvet, '#c8a890', .9, ' opacity=".35"');
  s += '<ellipse cx="368" cy="104" rx="30" ry="14" transform="rotate(-40 368 104)" fill="#ffffff" opacity=".22" filter="' + flou4 + '"/>';
  s += '<ellipse cx="376" cy="100" rx="12" ry="5" transform="rotate(-40 376 100)" fill="#ffffff" opacity=".45" filter="' + flou1 + '"/>';
  s += F(abdo, rad([[0, '#000', 0], [.65, '#000', 0], [1, '#000', .45]], .55, .45, .6));
  s += '</g>';
  s += L(lisse([ell(Ac, 82, 64, rotA, -2.2), ell(Ac, 82, 64, rotA, -1.6), ell(Ac, 82, 64, rotA, -.9), ell(Ac, 82, 64, rotA, -.2)]), LUNE, 2.4, ' opacity=".6"');
  /* les filières, d'où sort le fil */
  s += P('M386 92 C 388 84 396 84 398 92 C 396 98 388 98 386 92 Z', d.g('#5a4440'), ' stroke-width="2"');

  /* ---- la taille fine ---- */
  s += P(tube([[296, 176], [282, 190]], [22, 18]).d, d.g(chitS));

  /* ---- la tête-thorax : carapace luisante, sillons, poils ---- */
  var cep = ellChemin(Cc, 56, 46, rotC, 14, .04, 3);
  s += F(cep, '#000', ' opacity=".35" filter="' + flou4 + '" transform="translate(-4 8)"');
  s += P(cep, rad([[0, '#6e5450'], [.6, '#4a3634'], [1, '#261a1e']], .62, .3, .8));
  s += '<g' + clip(cep) + '>';
  var fov = ell(Cc, 10, 0, rotC, Math.PI);
  for(var k6 = 0; k6 < 8; k6++){ var a6 = k6 / 8 * Math.PI * 2 + .2; s += L('M' + pt(fov) + ' L ' + pt(ell(Cc, 50, 40, rotC, a6)), '#1e1418', 1.6, ' opacity=".5"'); }
  s += '<ellipse cx="' + f1(fov[0]) + '" cy="' + f1(fov[1]) + '" rx="5" ry="2.4" transform="rotate(' + f1(rotC * 57.3) + ' ' + f1(fov[0]) + ' ' + f1(fov[1]) + ')" fill="#120a0e" opacity=".7"/>';
  R = B.rng(29); var dv2 = '';
  for(var k7 = 0; k7 < 70; k7++){ var a7 = R() * Math.PI * 2, r7 = Math.sqrt(R()), p7 = ell(Cc, 52 * r7, 42 * r7, rotC, a7); dv2 += 'M' + pt(p7) + ' l ' + f1(Math.cos(rotC) * 4 + (R() - .5) * 2) + ' ' + f1(Math.sin(rotC) * 4 + (R() - .5) * 2) + ' '; }
  s += L(dv2, '#d0b0a0', .9, ' opacity=".3"');
  s += '<ellipse cx="268" cy="200" rx="18" ry="9" transform="rotate(-40 268 200)" fill="#ffffff" opacity=".22" filter="' + flou2 + '"/>';
  s += '</g>';
  s += L(lisse([ell(Cc, 56, 46, rotC, 3.6), ell(Cc, 56, 46, rotC, 4.3), ell(Cc, 56, 46, rotC, 5)]), LUNE, 2.2, ' opacity=".55"');

  /* ---- les pédipalpes, de part et d'autre de la bouche ---- */
  s += P(tube([[214, 218], [196, 224], [186, 240], [184, 254]], [11, 10, 9, 8]).d, d.g(chit)) + '<ellipse cx="184" cy="257" rx="7" ry="6" fill="' + d.g(B.sombre(chit, .2)) + '" stroke="' + O + '" stroke-width="2.4"/>';
  s += P(tube([[246, 262], [244, 278], [234, 290], [222, 296]], [11, 10, 9, 8]).d, d.g(chit)) + '<ellipse cx="219" cy="298" rx="7" ry="6" fill="' + d.g(B.sombre(chit, .2)) + '" stroke="' + O + '" stroke-width="2.4"/>';
  s += L('M190 226 l -5 -4 M186 240 l -6 -1 M246 280 l 5 3 M236 292 l 3 5', '#2a1c1e', 1.2);

  /* ---- les chélicères, gonflées, et leurs crochets noirs et luisants ---- */
  var ch1 = 'M206 236 C 196 246 194 264 204 276 C 214 284 226 278 228 266 C 230 252 220 238 206 236 Z', ch2 = 'M228 246 C 220 258 222 276 234 284 C 244 290 254 282 254 270 C 254 256 244 246 228 246 Z';
  s += P(ch1, d.g('#5a4240')) + P(ch2, d.g('#5a4240'));
  s += L('M210 244 C 218 248 224 256 224 266 M234 254 C 242 258 248 266 248 274', '#d0b0a0', 1, ' opacity=".4"');
  R = B.rng(41); var pc = '';
  for(var k8 = 0; k8 < 24; k8++){ var px = 200 + R() * 52, py = 240 + R() * 40; pc += 'M' + f1(px) + ' ' + f1(py) + ' l ' + f1(-1 - R() * 2) + ' ' + f1(3 + R() * 2) + ' '; }
  s += L(pc, '#1a1014', 1, ' opacity=".5"');
  var croc = lin([[0, '#5a5060'], [.4, '#1a141c'], [1, '#050306']], 1, 0, 0, 1);
  s += P('M204 270 C 200 286 206 300 222 308 C 226 309 226 305 223 303 C 214 296 212 286 214 274 Z', croc, ' stroke-width="2.2"') + L('M206 276 C 205 288 210 298 218 304', '#d8d0e8', 1.2, ' opacity=".75"');
  s += P('M234 280 C 230 296 236 310 252 318 C 256 319 256 315 253 313 C 244 306 242 296 244 284 Z', croc, ' stroke-width="2.2"') + L('M236 286 C 235 298 240 308 248 314', '#d8d0e8', 1.2, ' opacity=".75"');
  s += P('M252 317 C 254 322 257 326 257 329.5 C 257 332.5 254.8 334.5 252 334.5 C 249.2 334.5 247 332.5 247 329.5 C 247 326 250 322 252 317 Z', '#c8f0a0', ' stroke-width="1.4" opacity=".9"') + C(250.4, 329, 1.2, '#ffffff', ' opacity=".85"');
  s += '<circle cx="252" cy="326" r="7" fill="#b8f090" opacity=".25" filter="' + flou2 + '"/>';

  /* ---- les huit yeux rouges : deux gros au milieu, deux moyens, quatre petits au-dessus ---- */
  var yeux = [[214, 226, 8.5], [230, 236, 8.5], [204, 216, 5.5], [242, 244, 5.5], [218, 210, 4.4], [232, 216, 4.4], [244, 226, 4.2], [208, 204, 3.6]];
  s += '<ellipse cx="224" cy="226" rx="44" ry="34" fill="' + d.halo('#ff9a80', '#ff2a1a') + '" opacity=".55"/>';
  s += F('M196 222 C 200 204 226 196 248 214 C 256 228 252 246 238 252 C 222 254 200 244 196 222 Z', '#14080c', ' opacity=".55"');
  yeux.forEach(function(y){
    var g = rad([[0, '#fff2a0'], [.35, '#ff5a2a'], [.8, '#a00a14'], [1, '#4a0008']], .4, .38, .65);
    s += '<circle cx="' + y[0] + '" cy="' + y[1] + '" r="' + y[2] + '" fill="' + g + '" stroke="' + O + '" stroke-width="2"/>' + C(f1(y[0] - y[2] * .32), f1(y[1] - y[2] * .34), f1(y[2] * .32), '#ffffff', ' opacity=".9"') + C(f1(y[0] + y[2] * .35), f1(y[1] + y[2] * .3), f1(y[2] * .14), '#ffffff', ' opacity=".6"');
  });

  /* ---- un peu de poussière qui flotte dans la lumière ---- */
  R = B.rng(3);
  for(var k9 = 0; k9 < 14; k9++) s += C(f1(330 + R() * 120), f1(20 + R() * 260), f1(.6 + R()), '#e8f0ff', ' opacity="' + f1(.2 + R() * .4) + '"');

  return d.svg('0 0 540 430', s);
}
window.BESTIAIRE.araignee = {nom:'Araignée des caves', rang:'monstre', pv:60, lieu:'La cave aux toiles · pendue au plafond',
  livre:'« Pendue à son fil, elle fuit ce qui brille. »',
  combo:['+✨ S\'ouvre : la lumière', ' Autre chemin : l\'huile sur le fil', '!🔥 Le renforce : le feu (ses œufs)'], dessin:dessin};
})();
