/* ============ les objets du donjon (équipement visible) et les dessins des nouvelles réactions ============
   Deux sortes de dessins ici :
   - l'ÉQUIPEMENT (carquois d'argent ou lourd, cristal de lune, bâton de chêne, sacoche, amulette) et les FLÈCHES spéciales :
     des variantes cachées, dessinées d'avance dans le héros (<g data-eq="…" style="display:none">). Elles sont « cuites » en
     images avec le reste (RAPIDITE.md R1) ; equiper() ne fait que les montrer ou les cacher ;
   - les calques des RÉACTIONS (givre, bave, toile) : de petits dessins SVG fixes, posés à la demande dans la pièce qu'ils
     suivent (cuit : un îlot, peint une fois, puis déplacé et estompé par la carte graphique). Ils ne changent jamais de forme. */

/* un chemin avec un contour d'épaisseur choisie (P() garde toujours 3) */
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
/* une variante d'équipement, cachée au départ */
function V(nom, contenu){ return '<g data-eq="' + nom + '" style="display:none">' + contenu + '</g>'; }
/* un petit hasard qui donne toujours la même suite (les dessins restent les mêmes d'une fois sur l'autre) */
function graine(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
/* un croissant de lune : le disque (cx, cy, R) moins le disque (cx + ox, cy + oy, r) */
function croissant(cx, cy, R, ox, oy, r){
  var d = Math.hypot(ox, oy) || 1, a = (R * R - r * r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, R * R - a * a));
  var ux = ox / d, uy = oy / d, px = cx + a * ux, py = cy + a * uy;
  var i1 = [px - h * uy, py + h * ux], i2 = [px + h * uy, py - h * ux];
  return 'M' + r1(i1[0]) + ' ' + r1(i1[1]) + ' A ' + R + ' ' + R + ' 0 1 1 ' + r1(i2[0]) + ' ' + r1(i2[1]) + ' A ' + r + ' ' + r + ' 0 ' + (d < a ? 1 : 0) + ' 0 ' + r1(i1[0]) + ' ' + r1(i1[1]) + ' Z';
}
function coeurD(x, y, r){
  return 'M' + r1(x) + ' ' + r1(y + r) + ' C ' + r1(x - r * 1.7) + ' ' + r1(y - r * .1) + ' ' + r1(x - r * .95) + ' ' + r1(y - r * 1.45) + ' ' + r1(x) + ' ' + r1(y - r * .45) +
    ' C ' + r1(x + r * .95) + ' ' + r1(y - r * 1.45) + ' ' + r1(x + r * 1.7) + ' ' + r1(y - r * .1) + ' ' + r1(x) + ' ' + r1(y + r) + ' Z';
}
/* une étoile à 4 branches (scintillement fixe, dessiné) */
function eclat4(x, y, r, c){ return F('M' + x + ' ' + (y - r) + ' Q ' + (x + r * .16) + ' ' + (y - r * .16) + ' ' + (x + r) + ' ' + y + ' Q ' + (x + r * .16) + ' ' + (y + r * .16) + ' ' + x + ' ' + (y + r) + ' Q ' + (x - r * .16) + ' ' + (y + r * .16) + ' ' + (x - r) + ' ' + y + ' Q ' + (x - r * .16) + ' ' + (y - r * .16) + ' ' + x + ' ' + (y - r) + ' Z', c); }

/* ---------- l'amulette de vie (n'importe quel héros) : un médaillon d'or au cœur de rubis, sur la poitrine ---------- */
function amulette(d, cx, cy){
  var or = '#e8c062', ch = 'M' + (cx - 14) + ' ' + (cy - 19) + ' Q ' + (cx - 11) + ' ' + (cy - 6) + ' ' + cx + ' ' + (cy - 8) + ' Q ' + (cx + 11) + ' ' + (cy - 6) + ' ' + (cx + 14) + ' ' + (cy - 20);
  return V('amulette', '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="' + d.halo('#fff2b0', '#ffc850') + '" opacity=".55"/>' +
    L(ch, O, 3.4) + L(ch, or, 1.9, ' stroke-dasharray="2.4 1.5"') +
    '<circle cx="' + cx + '" cy="' + cy + '" r="8.4" fill="' + d.g('#f0c860') + '" stroke="' + O + '" stroke-width="2.4"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="none" stroke="#fff4c0" stroke-width="1" opacity=".75"/>' +
    Pw(coeurD(cx, cy + .6, 4.4), d.g('#ff4a6a'), 1.5) + C(cx - 1.7, cy - 1.2, 1.3, '#fff', ' opacity=".9"') +
    C(cx, cy - 9.4, 2.2, or, ' stroke="' + O + '" stroke-width="1.3"') + eclat4(cx + 7, cy - 7, 3.4, '#fff8d0'));
}

/* ---------- les flèches spéciales (dessinées de l'encoche (0, 0) à la pointe (124, 0)), par-dessus la flèche simple ---------- */
function flechesSpeciales(){
  /* d'argent : fût et pointe d'argent, plumes blanches, deux bagues */
  var argent = L('M0 0 L 112 0', O, 6.4) + L('M0 0 L 112 0', '#dfe7f2', 3) + L('M8 -0.8 L 104 -0.8', '#ffffff', 1.1) +
    L('M90 -3 L 90 3 M96 -3 L 96 3', '#a8b4c8', 1.6) +
    Pw('M129 0 L 109 -7.5 L 112.5 0 L 109 7.5 Z', '#eef3fb', 2.4) + L('M113 -2.4 L 124 -0.4', '#ffffff', 1.4) + F('M112.5 0 L 129 0 L 109 7.5 Z', '#b8c4d8', ' opacity=".55"') +
    Pw('M6 -1 L -8 -10 L -3 0 Z', '#f6f9ff', 2) + Pw('M6 1 L -8 10 L -3 0 Z', '#e2eaf6', 2) + L('M4 -1.5 L -5 -7 M4 1.5 L -5 7', '#a8b4c8', 1) +
    eclat4(131, -6, 4.2, '#ffffff');
  /* lourde : fût épais, grosse pointe de fer noir, plumes sombres */
  var lourde = L('M-2 0 L 108 0', O, 9.5) + L('M-2 0 L 108 0', '#6a4a2e', 6) + L('M6 -1.6 L 100 -1.6', '#a07a4a', 1.4) +
    Pw('M102 -5.2 L 111 -5.2 L 111 5.2 L 102 5.2 Z', '#3a3844', 2.2) + C(106.5, 0, 1.4, '#8a8898') +
    Pw('M134 0 L 107 -11 L 113 0 L 107 11 Z', '#2e2c36', 2.6) + F('M113 0 L 134 0 L 107 -11 Z', '#4e4c5c') + L('M116 -2.2 L 130 -0.4', '#b8b6c8', 1.4) +
    Pw('M8 -1.4 L -11 -13 L -4 0 Z', '#3a3444', 2.2) + Pw('M8 1.4 L -11 13 L -4 0 Z', '#2a2632', 2.2) + L('M5 -2 L -6 -9 M5 2 L -6 9', '#6a6478', 1.1);
  /* trempée dans le givre : la pointe gelée, des cristaux qui la hérissent, du givre sur le fût */
  var gl = '';
  [[114, -6, -60, 7], [119, -5, -35, 6], [123, 4, 40, 6], [116, 6, 70, 7], [126, -1, 0, 6], [108, -4, -100, 5]].forEach(function(c){
    var a = c[2] / DEG, l = c[3], x2 = c[0] + Math.cos(a) * l, y2 = c[1] + Math.sin(a) * l, nx = -Math.sin(a) * 1.6, ny = Math.cos(a) * 1.6;
    gl += Pw('M' + r1(c[0] + nx) + ' ' + r1(c[1] + ny) + ' L ' + r1(x2) + ' ' + r1(y2) + ' L ' + r1(c[0] - nx) + ' ' + r1(c[1] - ny) + ' Z', '#eaf8ff', 1.2);
  });
  var givre = Pw('M127 0 L 110 -7.5 L 112.5 0 L 110 7.5 Z', '#bfeaff', 2.2) + gl + C(117, -1, 2.2, '#ffffff', ' opacity=".9"') +
    L('M84 -2.6 L 88 -1 M92 2.4 L 96 0.8 M99 -2.6 L 103 -1 M88 2.6 L 91 1', '#e8f8ff', 1.6) + eclat4(128, -8, 3.6, '#ffffff');
  /* trempée dans l'acide : une goutte verte qui coule de la pointe, des bulles */
  var acide = Pw('M110 -5.5 C 116 -9 124 -6 126 0 C 124 5 120 7 116 7 C 112 7 109 3 110 -5.5 Z', '#7ae04a', 1.8) +
    Pw('M114 6 C 113 11 113 15 115.5 17.5 C 118 15 117.5 11 117 6 Z', '#7ae04a', 1.4) + Pw('M121 5 C 121 8 121 10 122.5 11.5 C 124 10 124 8 123.5 5 Z', '#62c83a', 1.2) +
    C(117, -2.2, 2, '#eaffd0', ' opacity=".95"') + C(123, 0, 1.2, '#c8ff9a') + C(112.5, 1.5, 1.1, '#c8ff9a') + C(115, 15, 1.1, '#eaffd0', ' opacity=".8"');
  return '<g data-argent style="display:none">' + argent + '</g><g data-lourde style="display:none">' + lourde + '</g>' +
    '<g data-givre style="display:none">' + givre + '</g><g data-acide style="display:none">' + acide + '</g>';
}

/* ---------- le Pisteur : les deux carquois trouvés dans la réserve (derrière l'épaule) ---------- */
function carquoisArgent(d){
  return V('carquois-argent',
    /* deux bagues d'argent sur le carquois, et un croissant de lune gravé */
    L('M71.5 74.5 L 96.5 65.5', O, 6.4) + L('M71.5 74.5 L 96.5 65.5', '#e6eef8', 3.6) + L('M72 73.2 L 96 64.6', '#ffffff', 1, ' opacity=".8"') +
    L('M93.5 129.5 L 113.5 122', O, 6.4) + L('M93.5 129.5 L 113.5 122', '#e6eef8', 3.6) +
    Pw(croissant(93, 99, 7.5, 3.5, -1.6, 6.4), '#eef4ff', 1.8) + eclat4(101, 92, 3, '#ffffff') +
    /* trois flèches d'argent : fûts d'argent, plumes blanches */
    L('M72 61 L 72 49 M82 59 L 81 45 M92 57 L 92 43', O, 4) + L('M72 61 L 72 49 M82 59 L 81 45 M92 57 L 92 43', '#dfe7f2', 2.2) +
    Pw('M70 52 L 63 40 L 77 45 Z', '#f6f9ff', 2) + Pw('M80 48 L 75 34 L 87 41 Z', '#e2eaf6', 2) + Pw('M90 46 L 87 32 L 98 41 Z', '#f6f9ff', 2) +
    L('M71 50 L 66 43 M81 46 L 78 38 M91 44 L 89 36', '#a8b4c8', 1) +
    eclat4(64, 34, 4.4, '#ffffff') + eclat4(99, 30, 3.4, '#e8f6ff') + rep('carquois', 84, 46));
}
function carquoisLourd(d){
  return V('carquois-lourd',
    /* un carquois renforcé de fer : un gros cerclage au bord, des plaques rivetées */
    L('M68.5 64.5 L 93.5 55.5', O, 8.5) + L('M68.5 64.5 L 93.5 55.5', '#56546a', 5.4) + L('M69 63 L 93 54.5', '#9a98ac', 1.3) +
    rivets([[74, 62.4], [82, 59.6], [90, 56.8]], '#c8c6d8') +
    L('M93 130 L 114 122', O, 8.5) + L('M93 130 L 114 122', '#56546a', 5.4) + rivets([[99, 127.8], [108, 124.4]], '#c8c6d8') +
    Pw('M83 92 L 95 88 L 99 104 L 87 108 Z', '#4a4858', 2) + rivets([[86, 94], [94, 91.4], [89, 104.6], [96, 102]], '#c8c6d8') +
    /* trois grosses flèches : fûts épais, plumes noires */
    L('M72 62 L 71 47 M82 60 L 80 43 M92 58 L 92 41', O, 6) + L('M72 62 L 71 47 M82 60 L 80 43 M92 58 L 92 41', '#6a4a2e', 3.6) +
    Pw('M70.5 51 L 61 37 L 78 43 Z', '#3a3444', 2.2) + Pw('M79.5 47 L 73 31 L 88 39 Z', '#2a2632', 2.2) + Pw('M91.5 45 L 87 28 L 100 39 Z', '#3a3444', 2.2) +
    L('M70 49 L 64 41 M79 45 L 75 36 M91 43 L 88 33', '#6a6478', 1.1) + rep('carquois', 84, 46));
}

/* ---------- l'Alchimiste : la sacoche (une 4e place de recette), à la hanche, derrière ---------- */
function sacoche(d){
  return V('sacoche',
    /* deux courroies accrochées à la ceinture */
    L('M98 153 L 92 162 M104 155 L 101 163', O, 4.4) + L('M98 153 L 92 162 M104 155 L 101 163', '#5a361f', 2.4) +
    /* ce qui dépasse : un rouleau de recettes, un brin d'herbe, le bouchon d'une fiole */
    Pw('M77 150 L 83 148 L 86 164 L 80 166 Z', '#f6ecd2', 2) + L('M78.5 153 L 83.5 151.5', '#c8a870', 1.2) + E(80, 149, 3.2, 1.8, '#e8dcc0', ' stroke="' + O + '" stroke-width="1.4"') +
    L('M93 162 Q 92 152 97 146', '#3e7a2a', 2.2) + Pw('M97 146 Q 103 144 102 150 Q 99 151 97 146 Z', '#6ac85a', 1.4) + Pw('M94 152 Q 89 148 90 144 Q 95 146 94 152 Z', '#5ab84a', 1.4) +
    Pw('M86 156 L 92 156 L 92 162 L 86 162 Z', '#9a6a3a', 1.6) + C(89, 155, 2.4, '#ff8a3a', ' stroke="' + O + '" stroke-width="1.2"') +
    /* le sac, cousu */
    Pw('M71 162 Q 88 157 104 162 L 102 194 Q 87 200 73 194 Z', d.g('#9a6a3a'), 2.8) +
    couture('M75 168 L 75 190 M99 167 L 98 190', '#e0b484') + L('M74 194 Q 88 199 101 194', '#5e3a1e', 1.6) +
    /* le rabat, la boucle d'or */
    Pw('M70 160 Q 88 154 105 161 L 103 177 Q 87 184 72 176 Z', d.g('#7a4a26'), 2.8) + couture('M74 172 Q 88 178 100 172', '#e0b484') +
    Pw('M84 174 L 92 174 L 92 182 L 84 182 Z', '#e8c062', 2) + L('M88 174 L 88 182', O, 1.4) +
    rep('sacoche', 88, 180));
}

/* ---------- le Sage : le cristal de lune (sur la crosse) et le bâton de chêne ---------- */
function cristalLune(d, x, y){
  return V('cristal-lune', '<circle cx="' + x + '" cy="' + y + '" r="40" fill="' + d.halo('#ffffff', '#cfdcff') + '" opacity=".75"/>' +
    /* le croissant de pierre de lune qui tient le cristal, serti d'argent */
    Pw(croissant(x - 1, y, 24, 10, -1, 20), d.g('#eef2ff', 1.2), 2.8) +
    L(croissant(x - 1, y, 24, 10, -1, 20).split(' A ')[0] + ' A 24 24 0 0 1 ' + r1(x - 21) + ' ' + r1(y + 10), '#ffffff', 1.6, ' opacity=".8"') +
    F(croissant(x - 1, y, 19, 9, -1, 16.5), '#c8d0f8', ' opacity=".45"') +
    C(x - 22, y + 2, 2.6, '#ffffff', ' stroke="' + O + '" stroke-width="1.2"') + C(x - 16, y + 15, 2, '#e8ecff', ' stroke="' + O + '" stroke-width="1"') + C(x - 16, y - 13, 2, '#e8ecff', ' stroke="' + O + '" stroke-width="1"') +
    eclat4(x + 20, y - 22, 5, '#ffffff') + eclat4(x - 30, y - 18, 3.4, '#e8f0ff') + eclat4(x + 24, y + 16, 3, '#e8f0ff'));
}
function feuilleChene(x, y, a, k, c){
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + k + ')">' +
    Pw('M0 0 C 2 -3 4 -5 6 -4 C 6 -8 10 -9 11 -6 C 12 -10 16 -10 16 -6 C 19 -8 21 -5 20 -3 C 23 -2 23 0 23 0 C 23 0 23 2 20 3 C 21 5 19 8 16 6 C 16 10 12 10 11 6 C 10 9 6 8 6 4 C 4 5 2 3 0 0 Z', c || '#5aa04a', 1.6) +
    L('M0 0 L 21 0 M8 0 L 11 -4 M8 0 L 11 4 M14 0 L 16 -4 M14 0 L 16 4', '#2e6a26', 1) + '</g>';
}
function gland(x, y, a){
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (a || 0) + ')">' + L('M0 -7 L 0 -3', '#5e3a1c', 1.6) +
    Pw('M-4.6 7 C -5 13 -2 16 0 16 C 2 16 5 13 4.6 7 Z', '#c88a3a', 1.6) + C(-1.4, 10, 1.2, '#fff0c0', ' opacity=".7"') +
    Pw('M-5.5 7.5 C -6 3 -3 -2 0 -2 C 3 -2 6 3 5.5 7.5 Z', '#7a5230', 1.6) + L('M-4 3 L 4 6 M-4 6 L 3 1 M-1 0 L 4 4', '#4e321a', .9) + '</g>';
}
function batonChene(d, xb, top, bas){
  var x = xb, t = function(k){ return r1(top + k); };
  var tronc = 'M' + x + ' ' + t(14) + ' C ' + (x - 3.5) + ' ' + t(60) + ' ' + (x + 3.5) + ' ' + t(100) + ' ' + (x - 1) + ' ' + t(140) + ' C ' + (x - 4.5) + ' ' + t(180) + ' ' + (x + 3.5) + ' ' + t(214) + ' ' + x + ' ' + r1(bas - 10);
  var ecorce = '';
  [[22, -1], [40, 1.5], [58, -1.5], [78, 1], [96, 2], [118, -1], [150, 1.2], [168, -2], [196, 1.6], [214, -1], [232, 1.4]].forEach(function(e){
    var y = top + e[0]; ecorce += 'M' + r1(x + e[1] - 2) + ' ' + r1(y) + ' q 1.6 4 0 8 ';
  });
  return V('baton-chene', L(tronc, O, 13) + L(tronc, '#8a5a2e', 8.4) + L(tronc.replace(/M(\d+)/, function(m, v){ return 'M' + (+v + 2.2); }), '#b88048', 1.6, ' opacity=".75"') +
    L(ecorce, '#4e321a', 1.4) +
    E(x - 1, top + 70, 3, 4.6, '#5e3a1c', ' stroke="' + O + '" stroke-width="1.4"') + E(x + 1, top + 182, 2.6, 4, '#5e3a1c', ' stroke="' + O + '" stroke-width="1.4"') +
    /* une branche de lierre qui s'enroule, des feuilles de chêne sous la crosse et un gland */
    L('M' + (x - 5) + ' ' + t(24) + ' C ' + (x + 8) + ' ' + t(36) + ' ' + (x - 8) + ' ' + t(52) + ' ' + (x + 6) + ' ' + t(66) + ' C ' + (x + 9) + ' ' + t(70) + ' ' + (x - 7) + ' ' + t(84) + ' ' + (x + 5) + ' ' + t(98), '#3e7a2a', 2.2) +
    feuilleChene(x + 2, top + 30, -20, .62, '#6ab85a') + feuilleChene(x - 2, top + 58, 200, .55, '#5aa04a') + feuilleChene(x + 4, top + 88, -10, .5, '#6ab85a') +
    feuilleChene(x - 2, top + 16, 205, .8) + feuilleChene(x + 3, top + 18, -40, .78, '#6ab85a') + gland(x + 13, top + 26, -10) + gland(x + 4, top + 32, 12) +
    rep('chene', x, top + 40));
}

/* ============ les calques des réactions (posés à la demande dans une pièce) ============ */
/* les normales d'une ligne de points (vers le « haut » quand la ligne va de gauche à droite) */
function normales(p){
  return p.map(function(q, i){ var a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; });
}
/* une ligne de points plus serrée (chaque segment coupé en n) */
function affiner(p, n){ var r = []; for(var i = 0; i < p.length - 1; i++) for(var k = 0; k < n; k++) r.push(lerp(p[i], p[i + 1], k / n)); r.push(p[p.length - 1]); return r; }
/* une croûte de givre posée sur une ligne : piquants dessus, glaçons dessous */
function croute(pts, ep, s){
  var R = graine(s || 7), p = affiner(pts, 3), n = normales(p), haut = [], bas = [], glac = '', i;
  for(i = 0; i < p.length; i++){
    var pic = i % 2 ? ep * (.5 + R() * .5) : ep * (.05 + R() * .15);
    haut.push([p[i][0] + n[i][0] * (ep * .45 + pic), p[i][1] + n[i][1] * (ep * .45 + pic)]);
    bas.unshift([p[i][0] - n[i][0] * ep * (.5 + R() * .2), p[i][1] - n[i][1] * ep * (.5 + R() * .2)]);
  }
  for(i = 1; i < p.length - 1; i += 2 + (R() < .5 ? 1 : 0)){
    var l = ep * (.9 + R() * 1.3), b0 = [p[i][0] - n[i][0] * ep * .5, p[i][1] - n[i][1] * ep * .5];
    glac += 'M' + r1(b0[0] - 2.2) + ' ' + r1(b0[1]) + ' L ' + r1(b0[0] - n[i][0] * l) + ' ' + r1(b0[1] - n[i][1] * l) + ' L ' + r1(b0[0] + 2.2) + ' ' + r1(b0[1]) + ' Z ';
  }
  var forme = 'M' + haut.concat(bas).map(function(q){ return r1(q[0]) + ' ' + r1(q[1]); }).join(' L ') + ' Z';
  var reflet = 'M' + haut.slice(1, -1).map(function(q, k){ var j = k + 1; return r1(q[0] - n[j][0] * ep * .45) + ' ' + r1(q[1] - n[j][1] * ep * .45); }).join(' L ');
  return Pw(glac, '#dff6ff', 1.4) + Pw(forme, '#e8f8ff', 1.8) + F(forme, '#bfe8ff', ' opacity=".35"') + L(reflet, '#ffffff', 1.4, ' opacity=".9"');
}
/* le givre d'un héros (calques : épaules, capuche, bras proche), en unités du dessin */
function givreDessin(role){
  var ep = role === 'sage' ? [[90, 99], [102, 93.5], [116, 90], [130, 89.5], [143, 91.5], [154, 97.5], [160, 104]] : [[78, 101], [90, 106], [104, 110], [120, 111], [135, 108.5], [149, 103.5], [162, 97]];
  var tete = [[92, 8], [101, 4], [113, -1], [126, -1.5], [139, 1.5], [150, 9], [157, 21], [161, 34]];
  var s = croute(ep, 7, 11) + eclat4(ep[1][0], ep[1][1] - 12, 4, '#ffffff') + eclat4(ep[5][0] + 2, ep[5][1] - 11, 3.4, '#ffffff');
  return {epaules:s + '<circle cx="' + ep[3][0] + '" cy="' + (ep[3][1] - 2) + '" r="3" fill="#ffffff" opacity=".8"/>',
    tete:croute(tete, 6.5, 23) + eclat4(118, -10, 4.6, '#ffffff') + eclat4(152, 4, 3.2, '#e8f8ff'),
    bras:croute([[97, 112], [101, 105.5], [108, 102.5], [115, 104.5], [119, 110.5]], 6, 31)};
}
/* une coulée de bave gluante sur une ligne : bourrelets dessus, gouttes qui pendent dessous ; renvoie aussi le bout des gouttes */
function coulee(pts, ep, s, nGouttes){
  var R = graine(s || 5), p = affiner(pts, 2), n = normales(p), haut = [], bas = [], gouttes = [], i;
  for(i = 0; i < p.length; i++){
    var b = ep * (.35 + R() * .45);
    haut.push([p[i][0] + n[i][0] * b, p[i][1] + n[i][1] * b]);
    bas.push([p[i][0] - n[i][0] * ep * (.45 + R() * .25), p[i][1] - n[i][1] * ep * (.45 + R() * .25)]);
  }
  /* des gouttes qui pendent : on les insère dans le bord du dessous */
  var bord = [], pas = Math.max(2, Math.floor(p.length / (nGouttes || 3)));
  for(i = 0; i < bas.length; i++){
    bord.push(bas[i]);
    if(i > 0 && i < bas.length - 1 && i % pas === 1){
      var l = ep * (1.4 + R() * 1.8), q = bas[i], m = [q[0] - n[i][0] * l, q[1] - n[i][1] * l], nx = n[i][1], ny = -n[i][0], w = 3 + R() * 1.6;
      bord.push([q[0] + nx * w, q[1] + ny * w], [m[0] + nx * w * .7, m[1] + ny * w * .7], [m[0] - n[i][0] * w, m[1] - n[i][1] * w], [m[0] - nx * w * .7, m[1] - ny * w * .7], [q[0] - nx * w, q[1] - ny * w]);
      gouttes.push([m[0] - n[i][0] * w, m[1] - n[i][1] * w]);
    }
  }
  var forme = lisse(haut.concat(bord.reverse()), true);
  var reflet = lisse(haut.slice(1, -1).map(function(q, k){ var j = k + 1; return [q[0] - n[j][0] * ep * .3, q[1] - n[j][1] * ep * .3]; }), false);
  return {svg:Pw(forme, '#a6e07a', 2.2, ' fill-opacity=".9"') + F(forme, '#5ab83a', ' opacity=".25"') + L(reflet, '#eaffd0', 2, ' opacity=".9"') +
    gouttes.map(function(g){ return C(g[0] - 1, g[1] - 2.5, 1.3, '#ffffff', ' opacity=".8"'); }).join(''), gouttes:gouttes};
}
function baveDessin(role){
  var ep = role === 'sage' ? [[92, 99], [106, 92.5], [122, 89.5], [138, 90.5], [152, 96.5], [160, 104]] : [[80, 101], [94, 107], [110, 111], [126, 110.5], [142, 105.5], [158, 98]];
  var a = coulee(ep, 7.5, 17, 4), b = coulee([[94, 8], [106, 1], [120, -2], [134, -.5], [147, 6], [156, 18], [161, 32]], 8.5, 29, 4), c = coulee([[97, 111], [102, 104.5], [110, 102], [118, 106], [121, 113]], 6.5, 41, 2);
  /* une grosse goutte sur le front, qui pend devant l'œil */
  var front = Pw('M137 20 C 141 19 144 22 143 27 C 142.5 31 143.5 36 141 39 C 138.5 41 136 39 136.5 35 C 137 31 135 24 137 20 Z', '#a6e07a', 1.8, ' fill-opacity=".92"') + C(139, 24, 1.3, '#ffffff', ' opacity=".85"');
  return {epaules:a.svg, tete:b.svg + front, bras:c.svg, gouttes:{epaules:a.gouttes, tete:b.gouttes.concat([[140, 40]]), bras:c.gouttes}};
}
/* la toile d'araignée qui ligote un héros : des fils qui l'entourent, ancrés au sol et en haut ; en deux moitiés (pour la déchirer) */
function toileDessin(){
  var R = graine(53), G = ['', ''], X = 126;
  function fil(a, m, b, w){
    /* coupé en deux au milieu (de Casteljau) : chaque moitié va dans son camp */
    var p01 = lerp(a, m, .5), p12 = lerp(m, b, .5), mid = lerp(p01, p12, .5);
    var d1 = 'M' + r1(a[0]) + ' ' + r1(a[1]) + ' Q ' + r1(p01[0]) + ' ' + r1(p01[1]) + ' ' + r1(mid[0]) + ' ' + r1(mid[1]);
    var d2 = 'M' + r1(mid[0]) + ' ' + r1(mid[1]) + ' Q ' + r1(p12[0]) + ' ' + r1(p12[1]) + ' ' + r1(b[0]) + ' ' + r1(b[1]);
    var gA = a[0] < b[0] ? 0 : 1;
    G[gA] += L(d1, O, (w || 1.8) + 1.8, ' opacity=".5"') + L(d1, '#f4f8ff', w || 1.8);
    G[1 - gA] += L(d2, O, (w || 1.8) + 1.8, ' opacity=".5"') + L(d2, '#f4f8ff', w || 1.8);
  }
  /* les fils qui le ligotent (en travers du corps, des bras, des jambes) */
  [[[74, 106], [124, 132], [176, 116]], [[76, 144], [122, 118], [174, 154]], [[80, 172], [126, 196], [172, 168]], [[84, 202], [124, 180], [168, 214]],
   [[88, 236], [128, 252], [166, 230]], [[92, 262], [126, 248], [162, 266]], [[86, 86], [124, 108], [166, 84]], [[90, 54], [124, 76], [160, 52]]].forEach(function(f, i){ fil(f[0], f[1], f[2], i % 3 ? 1.7 : 2.3); });
  /* les amarres : vers le sol et vers le haut (d'où vient la toile) */
  fil([86, 250], [72, 274], [56, 294], 1.6); fil([168, 252], [182, 276], [198, 294], 1.6); fil([90, 60], [70, 20], [50, -30], 1.4); fil([162, 56], [184, 16], [206, -30], 1.4);
  /* une petite toile ronde collée sur la poitrine */
  var cx = 128, cy = 150, ray = [];
  for(var k = 0; k < 10; k++){ var an = k / 10 * Math.PI * 2 + (R() - .5) * .25, lg = 34 + R() * 12; ray.push([an, lg]);
    var b = [cx + Math.cos(an) * lg, cy + Math.sin(an) * lg], dd = 'M' + cx + ' ' + cy + ' L ' + r1(b[0]) + ' ' + r1(b[1]), g = b[0] < X ? 0 : 1;
    G[g] += L(dd, O, 3, ' opacity=".45"') + L(dd, '#f4f8ff', 1.3); }
  [.35, .6, .85].forEach(function(f){ for(var k2 = 0; k2 < ray.length; k2++){
    var r0 = ray[k2], q = ray[(k2 + 1) % ray.length], p0 = [cx + Math.cos(r0[0]) * r0[1] * f, cy + Math.sin(r0[0]) * r0[1] * f], p1 = [cx + Math.cos(q[0]) * q[1] * f, cy + Math.sin(q[0]) * q[1] * f], mm = lerp(lerp(p0, p1, .5), [cx, cy], .12);
    var dd = 'M' + r1(p0[0]) + ' ' + r1(p0[1]) + ' Q ' + r1(mm[0]) + ' ' + r1(mm[1]) + ' ' + r1(p1[0]) + ' ' + r1(p1[1]), g = mm[0] < X ? 0 : 1;
    G[g] += L(dd, O, 2.8, ' opacity=".4"') + L(dd, '#e8f0ff', 1.2);
    if(R() < .3) G[g] += C(r1(mm[0]), r1(mm[1] + 1.4), 1.8, '#f8ffe8', ' opacity=".9"');
  } });
  /* un voile de soie, des gouttes de colle */
  G[0] = '<path d="M80 92 C 70 160 76 230 92 268 L 126 262 L 126 84 Z" fill="#e8f0ff" opacity=".13"/>' + G[0];
  G[1] = '<path d="M126 84 L 126 262 L 160 268 C 176 230 182 160 172 92 Z" fill="#e8f0ff" opacity=".13"/>' + G[1];
  [[96, 120, 0], [150, 128, 1], [104, 190, 0], [146, 205, 1], [112, 246, 0], [138, 240, 1], [100, 62, 0], [152, 70, 1]].forEach(function(g){ G[g[2]] += C(g[0], g[1], 2.2, '#f8ffe8', ' stroke="' + O + '" stroke-width=".8" opacity=".95"'); });
  return G;
}
