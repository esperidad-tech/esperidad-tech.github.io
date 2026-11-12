
/* ============ L'établi des plantes, vu de près ============
   On est penché sur l'établi de l'atelier (même œil que pour la paillasse : src/labo/10-base.js), mais il est plus profond : tout doit y tenir.
   Au fond, de gauche à droite : les bûches, l'alambic (son fourneau de briques, son col de cygne, son seau d'eau froide, le vase qui reçoit
   les gouttes), la marmite sur son trépied, le lutrin et le grimoire, le pressoir, le séchoir, les fioles vides.
   Au milieu : les allumettes, le mortier, le tamis ; le grand linge où sont couchées les plantes cueillies ; la cruche d'eau, l'huile de lin,
   le bocal à filtrer. Devant : la planche et son couteau ; le sac. Au mur : l'étagère des sept potions, des bouquets qui sèchent, une lanterne.
   Chaque chose est dessinée dans son repère à elle (son pied en 0,0), puis posée à sa place (OU) à son échelle. */
YF = 540; YB = 250;
function yTe(t){ return VY + (YF - VY)/(1 + t*((YF - VY)/(YB - VY) - 1)); }
var OU = {
  buches:{x:92, y:326, e:.8}, alambic:{x:216, y:316, e:.8}, marmite:{x:494, y:322, e:.84}, livre:{x:664, y:308, e:1}, presse:{x:842, y:320, e:.8},
  sechoir:{x:990, y:326, e:.84}, fiole:{x:1106, y:330, e:.84},
  allumettes:{x:64, y:424, e:.92}, mortier:{x:158, y:430, e:.92}, tamis:{x:308, y:430, e:.92},
  cruche:{x:906, y:424, e:.92}, huilier:{x:976, y:426, e:.92}, filtre:{x:1084, y:434, e:.92},
  planche:{x:172, y:520, e:1}, sac:{x:1092, y:534, e:1}
};
/* Où se pose la matière dans chaque outil (dans son repère) : [x, y, la façon de la dessiner, échelle] ; « sortie » : là où attend ce que l'outil a donné */
var FENTE = {
  planche:{entree:[-22, -26, 'plat', 1.2]},
  tamis:{entree:[-6, -62, 'plat', .9], sortie:[4, -20, 'creux', .9]},
  mortier:{entree:[0, -50, 'creux', .95]},
  presse:{entree:[0, -78, 'plat', .85], sortie:[78, -22, 'verre', 1]},
  filtre:{entree:[0, -84, 'plat', .8], sortie:[0, -40, 'verre', 1]},
  marmite:{entree:[0, -116, 'creux', 1.05]},
  alambic:{entree:[0, -156, 'plat', .78], sortie:[190, -20, 'verre', 1]},
  sechoir:{entree:[0, -32, 'creux', 1.05]},
  fiole:{entree:[0, -96, 'plat', .7]}
};
var NOMS_O = {planche:'La planche et le couteau', tamis:'Le tamis', mortier:'Le mortier et son pilon', presse:'Le pressoir', filtre:'Le bocal à filtrer', marmite:'La marmite',
  alambic:'L\'alambic', sechoir:'Le séchoir', fiole:'Les fioles vides', cruche:'La cruche d\'eau', huilier:'L\'huile de lin', buche:'Les bûches', allumette:'Les allumettes'};
var PLACE = {oseille:[444, 448, 258], souci:[548, 448, 258], melisse:[652, 448, 258], lin:[756, 448, 258], lycopode:[492, 526, 296], vesse:[600, 526, 310], gui:[708, 526, 298]};
var SP = .44, APLAT = .64;
function centrePlante(k){ var q = PLACE[k]; return {x:q[0], y:q[1] - (q[2] - 150)*SP*APLAT}; }
function gT(o, s, x){ var q = OU[o]; return '<g transform="translate(' + q.x + ',' + q.y + ') scale(' + q.e + ')"' + (x || '') + '>' + s + '</g>'; }
function TT(d, c, w, plus, xx){ return T(d, K, w + (plus || 4.5), xx) + T(d, c, w, xx); }   /* un trait de couleur cerné de noir */
function pt(o, lx, ly){ var q = OU[o]; return {x:q.x + lx*q.e, y:q.y + ly*q.e}; }        /* un point d'un outil, dans le grand dessin */
function ptFente(o, quoi){ var f = FENTE[o], a = (f && (f[quoi] || f.entree)) || [0, -30]; return pt(o, a[0], a[1]); }

/* Les matières en plus (le cuivre, la fonte, le grès, la terre cuite, l'osier, le linge…) */
function defsEtabli(){
  var plus = lin('cuivre', [['#7a3a18',0],['#d98a4a',.28],['#ffd0a0',.42],['#c9703a',.66],['#6a2e12',1]]) + lin('cuivreV', [['#f0b080',0],['#d98a4a',.5],['#8a4a22',1]], 1) +
    lin('fonte', [['#1c1a26',0],['#4a465e',.3],['#6f6a88',.42],['#3a3650',.66],['#14121c',1]]) + lin('gres', [['#56677e',0],['#9ab0c8',.34],['#d2e0ee',.45],['#7f95ae',.7],['#445268',1]]) +
    lin('terre', [['#e6a878',0],['#c57e4c',.55],['#8a4e2c',1]], 1) + lin('pierreM', [['#807a98',0],['#cfc8d8',.33],['#f3f0f8',.45],['#b0a8c0',.7],['#6a637e',1]]) +
    lin('osier', [['#e3b574',0],['#b98848',.6],['#8a6030',1]], 1) + lin('linge', [['#fbf7ea',0],['#efe7cf',1]], 1) + lin('page', [['#fbf4de',0],['#eadbb4',1]], 1) +
    lin('brique', [['#c96a4c',0],['#a8523a',.6],['#7e3a28',1]], 1) + lin('acier', [['#f4f8fc',0],['#c9d3de',.55],['#8e9aa8',1]], 1) + lin('cuirS', [['#b9743f',0],['#8f5429',.6],['#653819',1]], 1) +
    rad('braise', [['#fff2a8',0],['#ff9a2a',.5],['#d0401a',1]], .5, .7, .6) + rad('lueurFeu', [['#ffb85a',0,.55],['#ff8a2a',.5,.2],['#ff8a2a',1,0]]) +
    rad('haloP', [['#fff7d0',0,.9],['#ffe08a',.45,.35],['#ffe08a',1,0]]);
  return defs().replace('</defs>', plus + '</defs>');
}

/* ---------- Le mur de l'atelier (mêmes motifs, mêmes couleurs que dans le jeu), le plancher sur les côtés ---------- */
function mur(){
  var ti = ST.murT, f = ST.murF, cl = ti ? clair(THEMES[ti].c, .55) : '#ffffff', op = ti ? .22 : .06, E = 1.85, s = '', d = '', d2 = '', u, v, r, u0 = -1300, u1 = 1300, H = 1060, Y0 = YB;
  function W(a, b){ return [600 + a*E, Y0 + (122 - b)*E]; }
  function rect(ua, va, ub, vb){ var a = W(ua, va), b = W(ub, vb); return 'M' + f1(a[0]) + ',' + f1(a[1]) + ' H' + f1(b[0]) + ' V' + f1(b[1]) + ' H' + f1(a[0]) + ' Z '; }
  function etoile(cu, cv, rr){ var t = ''; for(var j = 0; j < 8; j++){ var a = j/8*Math.PI*2, q = W(cu + Math.cos(a)*(j % 2 ? rr*.3 : rr), cv + Math.sin(a)*(j % 2 ? rr*.3 : rr)); t += (j ? ' L' : 'M') + f1(q[0]) + ',' + f1(q[1]); } return t + ' Z '; }
  function fleur(cu, cv){ var t = ''; for(var p = 0; p < 5; p++){ var b = p/5*Math.PI*2, pu = cu + Math.cos(b)*7, pv = cv + Math.sin(b)*7, a = W(pu - 5, pv), b2 = W(pu, pv + 5), c2 = W(pu + 5, pv), d3 = W(pu, pv - 5); t += 'M' + f1(a[0]) + ',' + f1(a[1]) + ' L' + f1(b2[0]) + ',' + f1(b2[1]) + ' L' + f1(c2[0]) + ',' + f1(c2[1]) + ' L' + f1(d3[0]) + ',' + f1(d3[1]) + ' Z '; } return t; }
  s += '<rect x="-1900" y="-1800" width="5000" height="2300" fill="' + G('mur') + '"/>';
  if(f === 0){ for(r = 0; r*54 < H; r++){ var dec = (r % 2)*50; for(u = u0 + dec; u < u1; u += 100) d += rect(u + 4, r*54 + 3, u + 96, r*54 + 51); }
    s += '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? .1 : .035) + '" stroke="rgba(10,6,20,.32)" stroke-width="3" stroke-linejoin="round"/>'; }
  else if(f === 1){ for(u = u0; u < u1; u += 64){ d += rect(u, 0, u + 30, H); d2 += rect(u + 40, 0, u + 44, H); }
    s += '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + op + '"/><path d="' + d2 + '" fill="' + cl + '" fill-opacity="' + (op*.8) + '"/>'; }
  else if(f === 2 || f === 4){ for(v = 40; v < H; v += 90) for(u = u0 + ((v/90 | 0) % 2)*45; u < u1; u += 90) d += f === 2 ? etoile(u, v, 11) : fleur(u, v);
    s += '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (op*1.35) + '"/>'; }
  else { for(u = u0 + 14; u < u1; u += 120) d += rect(u, 22, u + 92, 172);
    s += '<path d="' + rect(u0, 0, u1, 196) + '" fill="' + (ti ? sombre(THEMES[ti].c, .35) : '#3a2418') + '" fill-opacity="' + (ti ? .55 : .7) + '"/><path d="' + d + '" fill="none" stroke="' + cl + '" stroke-opacity="' + (op*1.8) + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="' + rect(u0, 196, u1, 210) + '" fill="' + (ti ? sombre(THEMES[ti].c, .2) : '#6b4a2a') + '" stroke="rgba(10,6,20,.3)" stroke-width="3"/>'; }
  var ys = Y0 + 226;
  s += '<rect x="-1900" y="' + ys + '" width="5000" height="1700" fill="#5a3a24"/>';
  for(u = -1500; u < 2700; u += 132) s += '<path d="M' + u + ',' + ys + ' L' + f1(600 + (u - 600)*2.2) + ',' + (ys + 1300) + '" stroke="rgba(40,20,10,.45)" stroke-width="3" fill="none"/>';
  return s + '<rect x="-1900" y="' + ys + '" width="5000" height="60" fill="' + G('piedMur') + '"/><rect x="-1900" y="' + (Y0 - 86) + '" width="5000" height="90" fill="' + G('dessous') + '" transform="rotate(180 600 ' + (Y0 - 41) + ')" opacity=".5"/>';
}
/* Au mur : la lanterne (à gauche), la tringle où sèchent des bouquets, la tête en bas (à droite) */
function decorMur(){
  var s = '<g transform="translate(62,150)"><circle cx="0" cy="-26" r="92" fill="' + G('halo') + '" opacity=".55" class="lueur-feu"/>' +
    TT('M0,-78 V-96 M-20,-96 H20', '#5f5872', 4) + P('M-19,-60 L19,-60 L24,-6 L-24,-6 Z', 'rgba(255,224,160,.32)') + P('M-22,-60 L22,-60 L12,-78 L-12,-78 Z', G('fer')) + R(-27, -8, 54, 11, 3, G('fer')) +
    T('M-19,-60 L-24,-6 M19,-60 L24,-6 M0,-60 V-8', K, 3.2) + R(-5, -26, 10, 18, 2, G('cire'), ' stroke-width="2.5"') +
    '<g class="flamme"><path d="M0,-27 C-7,-35 -4,-45 0,-54 C4,-45 7,-35 0,-27 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/></g></g>';
  return s;
}
/* ---------- Les sept potions : chacune dans son verre à elle ---------- */
var VERRES = {
  feu:{d:'M-6,-64 V-46 C-22,-41 -27,-23 -23,-11 C-19,2 19,2 23,-11 C27,-23 22,-41 6,-46 V-64 Z', n:30, b:[-7, -72, 14, 11]},
  fumigene:{d:'M-18,-50 Q-20,-57 -13,-57 H13 Q20,-57 18,-50 V-6 Q18,0 12,0 H-12 Q-18,0 -18,-6 Z', n:54, b:[-13, -67, 26, 13]},
  huile:{d:'M-5,-68 V-48 C-14,-44 -15,-37 -15,-31 V-5 Q-15,0 -10,0 H10 Q15,0 15,-5 V-31 C15,-37 14,-44 5,-48 V-68 Z', n:38, b:[-6, -76, 12, 11]},
  colle:{d:'M-21,-36 H21 L18,-4 Q17,0 12,0 H-12 Q-17,0 -18,-4 Z', n:28, b:null},
  acide:{d:'M-6,-66 V-47 L-23,-7 Q-25,0 -17,0 H17 Q25,0 23,-7 L6,-47 V-66 Z', n:30, b:[-7, -74, 14, 11]},
  baume:{d:'M-19,-32 C-24,-21 -23,-7 -16,0 H16 C23,-7 24,-21 19,-32 Z', n:26, b:null},
  coeur:{d:'M-4.5,-70 V-38 C-19,-33 -22,-17 -17,-8 C-12,2 12,2 17,-8 C22,-17 19,-33 4.5,-38 V-70 Z', n:26, b:[-6, -78, 12, 11]}
};
var CLIP_N = 0;
function flacon(id, coul){
  var v = VERRES[id], n = 'cpf' + (++CLIP_N), s = '';
  if(coul){
    s += '<clipPath id="' + n + '"><path d="' + v.d + '"/></clipPath><g clip-path="url(#' + n + ')"><rect x="-30" y="' + (-v.n) + '" width="60" height="' + (v.n + 6) + '" fill="' + coul + '"/>' +
      '<ellipse cx="0" cy="' + (-v.n) + '" rx="26" ry="4" fill="' + clair(coul, .45) + '"/>';
    if(id === 'fumigene') s += T('M-12,-12 C-2,-20 4,-8 10,-18 C14,-26 2,-30 -6,-26 C-12,-22 -8,-38 4,-40', '#f4f6ff', 3.4, ' opacity=".75"');
    if(id === 'feu') s += '<g class="scint"><path d="M0,-18 l3,-8 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 Z" fill="#fff3a8" transform="scale(.6) translate(-4,-6)"/></g>';
    if(id === 'acide') s += '<circle cx="-6" cy="-10" r="2.4" fill="none" stroke="#f4ffe0" stroke-width="1.4"/><circle cx="5" cy="-18" r="1.8" fill="none" stroke="#f4ffe0" stroke-width="1.3"/><circle cx="9" cy="-7" r="1.5" fill="none" stroke="#f4ffe0" stroke-width="1.2"/>';
    s += '</g>';
  }
  s += '<path d="' + v.d + '" fill="rgba(220,245,255,' + (coul ? .16 : .12) + ')" stroke="' + K + '" stroke-width="3.2" stroke-linejoin="round"/>';
  if(id === 'colle') s += R(-24, -45, 48, 10, 3, G('boisC'), ' stroke-width="3"') + Cir(0, -49, 5, G('boisS'), ' stroke-width="2.5"') + (coul ? TT('M12,-45 L22,-66', '#d9a066', 3, 3) : '');
  else if(id === 'baume') s += P('M-22,-31 Q0,-48 22,-31 L25,-23 Q0,-15 -25,-23 Z', coul ? '#f6f1e4' : 'rgba(246,241,228,.4)', ' stroke-width="3"') + (coul ? T('M-22,-25 Q0,-18 22,-25', '#c9483f', 2.6) + T('M18,-25 l7,7 M18,-25 l1,9', '#c9483f', 2.4) : '');
  else if(coul) s += R(v.b[0], v.b[1], v.b[2], v.b[3], 3, '#d9a066', ' stroke-width="2.6"');
  s += reflet('M' + (id === 'acide' ? -12 : -11) + ',-' + (id === 'colle' || id === 'baume' ? 26 : 30) + ' q-3,10 1,18', 3, coul ? .6 : .35);
  return s;
}
/* Le portique de l'établi (Romain, 12 novembre, 12 h 45 : « accrochée à l'établi, pas collée au mur », « bien au-dessus de tous les autres
   trucs ») : deux montants fixés au fond de la table ; tout en haut, l'étagère des sept potions ; dessous, une tringle de laiton où sèchent,
   la tête en bas, les plantes cueillies. Chaque plante pend juste sous le flacon de sa potion. */
var PORT = {x0:414, pas:58, yEt:84, yTr:108, eF:.9, eP:.25};
function xPort(i){ return PORT.x0 + i*PORT.pas; }
function colPlante(k){ return ORDRE.indexOf(PL[k].potion); }
function etagereScene(){
  var a = 372, b = 804, yE = PORT.yEt, yT = PORT.yTr, s = '';
  [a, b].forEach(function(x, i){
    var d = i ? -1 : 1;
    s += R(x - 8, yE - 2, 16, 190, 3, G('boisS'), ' stroke-width="3.5"') + T('M' + (x - 3) + ',' + (yE + 20) + ' V262', 'rgba(255,255,255,.14)', 2) +
      P('M' + (x + d*8) + ',' + (yE + 12) + ' L' + (x + d*40) + ',' + (yE + 12) + ' L' + (x + d*8) + ',' + (yE + 46) + ' Z', G('boisS'), ' stroke-width="3"') +
      Cir(x, 230, 4, G('laitonV'), ' stroke-width="2"') + Cir(x, 243, 4, G('laitonV'), ' stroke-width="2"');
  });
  s += TT('M' + (a + 22) + ',' + (yE + 12) + ' V' + yT + ' M' + (b - 22) + ',' + (yE + 12) + ' V' + yT, '#5f5872', 3, 3) + TT('M' + (a + 14) + ',' + yT + ' H' + (b - 14), '#c9973a', 5, 4) +
    reflet('M' + (a + 20) + ',' + (yT - 1.5) + ' H' + (b - 20), 1.4, .5) + Cir(a + 14, yT, 5, G('laitonV')) + Cir(b - 14, yT, 5, G('laitonV'));
  s += ombre(588, yE + 16, 200, 5, .25) + R(a - 26, yE, b - a + 52, 13, 3, G('boisC'), ' stroke-width="3.5"') + reflet('M' + (a - 20) + ',' + (yE + 3) + ' H' + (b + 20), 2, .35);
  ORDRE.forEach(function(id, i){ s += '<g class="potion" id="potion-' + id + '" data-act="potion" data-id="' + id + '" tabindex="0" role="button" transform="translate(' + xPort(i) + ',' + yE + ') scale(' + PORT.eF + ')"></g>'; });
  return '<g id="portique">' + s + '</g>';
}
/* les plantes cueillies qui attendent, pendues à la tringle (on en touche une : elle se couche sur le linge) */
function majPendues(){
  var g = $('#pendues'); if(!g) return; var s = '';
  ORDRE_PL.forEach(function(k){
    var p = PL[k], i = colPlante(k);
    if(!(S.dispo[k] > 0) || S.faites[p.potion] || S.posees[k] || S.plante === k) return;
    var q = PLACE[k], h = Math.round(q[2]*PORT.eP) + 8;
    s += '<g class="pendue" id="pendue-' + k + '" data-act="pendue" data-k="' + k + '" tabindex="0" role="button" aria-label="' + p.nom + ' : la décrocher" transform="translate(' + xPort(i) + ',' + PORT.yTr + ')">' +
      '<ellipse class="rond" cx="0" cy="' + (h/2 + 4) + '" rx="30" ry="' + (h/2 + 8) + '"/>' +
      '<g class="balance' + (i % 3 === 1 ? ' b2' : i % 3 === 2 ? ' b3' : '') + '">' + T('M0,-3 V9', '#e8d9b0', 2.6) + '<g class="corps-p" transform="translate(0,8) rotate(180) scale(' + PORT.eP + ') translate(-130,-' + q[2] + ')">' + PLD.corps(k) + '</g>' + T('M-5,7 q5,4 10,0 M-5,11 q5,4 10,0', '#c9483f', 2.4) + '</g>' +
      '<rect x="-28" y="-6" width="56" height="' + (h + 14) + '" fill="transparent"/></g>';
  });
  g.innerHTML = s;
}
function majEtagere(){
  ORDRE.forEach(function(id){
    var g = $('#potion-' + id); if(!g) return; var f = !!S.faites[id], r = RE[id];
    g.innerHTML = '<circle class="rond" cx="0" cy="-36" r="40"/>' + (f ? '<circle class="halo-p" cx="0" cy="-30" r="38" fill="' + G('haloP') + '"/>' : '') + '<g' + (f ? '' : ' opacity=".5"') + '>' + flacon(id, f ? r.coul : null) + '</g><rect x="-26" y="-82" width="52" height="84" fill="transparent"/>';
    g.classList.toggle('pleine', f); g.setAttribute('aria-label', r.nom + (f ? ' : prête' : ' : pas encore faite'));
  });
}

/* ---------- Le plateau (sa matière dépend de l'établi choisi), son chant, le tablier, et ce qu'il y a dessous ---------- */
function plateau(){
  var L = LARG, X0 = 600 - L, X1 = 600 + L, W = 2*L, p = palettePlateau(), b = paletteBois(), Rn = rng(21), s = '', i, y, yF = YF, yt = yF + 18, yb = yt + 150, q = 'M' + X0 + ',' + yF + ' L' + X1 + ',' + yF + ' L' + f1(xP(L, YB)) + ',' + YB + ' L' + f1(xP(-L, YB)) + ',' + YB + ' Z';
  /* le bas du meuble (visible sur un écran haut) */
  s += '<rect x="' + (X0 - 10) + '" y="' + (yb - 6) + '" width="' + (W + 20) + '" height="640" fill="rgba(10,6,20,.35)"/>';
  if(ST.paF === 0) s += R(X0 + 10, yb, 52, 560, 4, G('pTablier')) + R(X1 - 62, yb, 52, 560, 4, G('pTablier')) + R(X0 + 62, yb + 250, W - 124, 34, 4, G('pFonce'));
  else if(ST.paF === 1) s += R(X0 + 14, yb, W - 28, 560, 6, G('pTablier')) + R(X0 + 40, yb + 26, L - 64, 500, 8, G('pTiroir')) + R(624, yb + 26, L - 64, 500, 8, G('pTiroir')) + Cir(556, yb + 270, 9, G('laitonV')) + Cir(644, yb + 270, 9, G('laitonV'));
  else if(ST.paF === 2) [X0 + 40, 380, 800, X1 - 60].forEach(function(x){ s += T('M' + x + ',' + yb + ' q-14,280 0,560', K, 26) + T('M' + x + ',' + yb + ' q-14,280 0,560', '#f5b945', 14); });
  else if(ST.paF === 3){ var lc = (W - 68)/4; s += R(X0 + 14, yb, W - 28, 560, 6, G('pTablier')); for(i = 0; i < 8; i++) s += R(X0 + 34 + (i % 4)*lc, yb + 22 + Math.floor(i/4)*120, lc - 16, 104, 6, G('pTiroir')) + Cir(X0 + 34 + (i % 4)*lc + (lc - 16)/2, yb + 74 + Math.floor(i/4)*120, 8, G('laitonV')); }
  else [X0 + 120, X1 - 120].forEach(function(x){ s += T('M' + (x - 90) + ',' + yb + ' L' + (x + 90) + ',' + (yb + 560) + ' M' + (x + 90) + ',' + yb + ' L' + (x - 90) + ',' + (yb + 560), K, 30) + T('M' + (x - 90) + ',' + yb + ' L' + (x + 90) + ',' + (yb + 560) + ' M' + (x + 90) + ',' + yb + ' L' + (x - 90) + ',' + (yb + 560), b.V[1], 18); });
  /* le tablier : pas de tiroirs ici, mais des crochets où pendent les petits outils de l'herboriste */
  s += R(X0, yt, W, 156, 0, G('pTablier'));
  if(ST.paF !== 2) s += grainBois(X0 + 4, yt + 4, W - 8, 148, 6, 23, b.F[1], .32);
  if(ST.paF === 3) for(i = 0; i < 4; i++){ var lw = (W - 60)/4; s += R(X0 + 30 + i*lw, yt + 14, lw - 14, 124, 6, G('pTiroir')) + Cir(X0 + 30 + i*lw + (lw - 14)/2, yt + 76, 9, G('laitonV')); }
  if(ST.paF === 1) s += R(X0 + 40, yt + 16, L - 64, 120, 8, G('pTiroir')) + R(624, yt + 16, L - 64, 120, 8, G('pTiroir'));
  s += '<rect x="' + X0 + '" y="' + yt + '" width="' + W + '" height="22" fill="' + G('dessous') + '"/>';
  s += crochets(yt);
  /* le dessus */
  s += '<clipPath id="clipPlateau"><path d="' + q + '"/></clipPath>' + P(q, G('pPlateau')) + '<g clip-path="url(#clipPlateau)">';
  if(p.sorte === 'bois' || p.sorte === 'planches'){
    [.2, .4, .6, .8].forEach(function(t){ y = yTe(t); s += T('M' + f1(xP(-L - 5, y)) + ',' + f1(y) + ' H' + f1(xP(L + 5, y)), p.joint, p.sorte === 'planches' ? 4 : 2.4, ' opacity=".8"'); if(p.sorte === 'planches') s += Cir(xP(-L + 22, y), y - 9, 3, '#5f5872') + Cir(xP(L - 22, y), y - 9, 3, '#5f5872'); });
    for(i = 0; i < 26; i++){ var t = (i + .2 + Rn()*.6)/26; y = yTe(t); var ph = Rn()*6, am = 1 + Rn()*2.4, d = '', x0 = xP(-L - 5, y), x1 = xP(L + 5, y);
      for(var x = x0; x <= x1; x += 24) d += (d ? ' L' : 'M') + f1(x) + ',' + f1(y + Math.sin(x/47 + ph)*am);
      s += '<path d="' + d + '" fill="none" stroke="' + b.veine + '" stroke-width="' + (1 + Rn()*1.4).toFixed(1) + '" opacity=".34"/>'; }
    s += noeud(1010, 508, 13, .44) + noeud(60, 470, 10, .42) + noeud(388, 300, 8, .36) + noeud(880, 506, 7, .44) + noeud(-20, 508, 9, .42) + noeud(1206, 470, 11, .44) + noeud(940, 372, 8, .4);
    /* de vieilles taches : un rond de marmite, une brûlure, un peu de jus vert séché */
    s += '<ellipse cx="884" cy="486" rx="34" ry="13" fill="none" stroke="rgba(110,50,20,.3)" stroke-width="3"/><ellipse cx="318" cy="492" rx="22" ry="8" fill="rgba(60,110,40,.16)"/><ellipse cx="372" cy="336" rx="16" ry="6" fill="rgba(30,16,10,.25)"/>' + T('M300,372 l44,5 M870,360 l34,-4 M936,516 l30,2', 'rgba(60,30,10,.4)', 2);
  } else if(p.sorte === 'pierre'){
    for(i = 0; i < 380; i++){ y = YB + Rn()*(YF - YB); s += '<circle cx="' + f1(xP((Rn() - .5)*W, y)) + '" cy="' + f1(y) + '" r="' + f1(1 + Rn()*2.6) + '" fill="' + (Rn() < .5 ? 'rgba(30,24,60,.22)' : 'rgba(255,255,255,.3)') + '"/>'; }
    s += T('M250,270 l40,22 l-14,30 l52,34 M980,520 l-46,-28 l10,-20', 'rgba(40,30,70,.35)', 2.4);
  } else {
    s += T('M-40,350 C60,320 100,338 120,320 C260,340 300,290 440,320 S640,380 760,350 S980,310 1090,350 S1200,320 1270,342 M200,490 C340,470 420,520 560,490 S820,470 1000,510 M520,268 C580,288 640,268 720,286', p.joint, 3.2, ' opacity=".6"') +
      T('M150,406 C240,390 300,422 380,402 M700,440 C780,424 860,452 960,432 M300,320 C330,350 320,380 352,412 M860,360 C850,400 880,430 872,470', p.joint, 1.8, ' opacity=".5"') +
      T('M124,326 C262,346 302,296 442,326 S642,386 762,356 S982,316 1092,356 M204,496 C342,476 422,526 562,496 S822,476 1002,516', p.veine2, 2, ' opacity=".55"');
    for(i = 0; i < 130; i++){ y = YB + Rn()*(YF - YB); s += '<circle cx="' + f1(xP((Rn() - .5)*W, y)) + '" cy="' + f1(y) + '" r="' + f1(.8 + Rn()*1.8) + '" fill="' + (Rn() < .5 ? p.joint : p.veine2) + '" opacity=".3"/>'; }
  }
  s += '<path d="M' + X0 + ',' + yF + ' L' + X1 + ',' + yF + ' L' + (X1 - 4) + ',' + (yF - 22) + ' L' + (X0 + 4) + ',' + (yF - 22) + ' Z" fill="#fff" opacity=".07"/></g>';
  s += R(X0, yF, W, 18, 3, G('pChant')) + reflet('M' + (X0 + 10) + ',' + (yF + 4) + ' H' + (X1 - 10), 2.5, .35);
  return s;
}
/* Sous le plateau : une tringle de laiton et ses crochets (les ciseaux, la cuillère de bois, la ficelle, un bouquet de lavande, le torchon) */
function crochets(yt){
  var y = yt + 30, s = TT('M60,' + y + ' H1140', '#e0a23a', 4.5, 4) + reflet('M64,' + (y - 1.5) + ' H1136', 1.4, .5), c;
  [90, 330, 600, 870, 1110].forEach(function(x){ s += Cir(x, y, 6, G('laitonV'), ' stroke-width="2.5"'); });
  function croc(x){ return T('M' + x + ',' + (y + 3) + ' q0,12 7,12 q6,0 6,-7', K, 6) + T('M' + x + ',' + (y + 3) + ' q0,12 7,12 q6,0 6,-7', '#f5c45a', 2.6); }
  /* les ciseaux */
  c = 190; s += croc(c - 7) + '<g transform="translate(' + c + ',' + (y + 16) + ')">' + '<ellipse cx="-8" cy="8" rx="8" ry="10" fill="none" stroke="' + K + '" stroke-width="7"/><ellipse cx="-8" cy="8" rx="8" ry="10" fill="none" stroke="#5f5872" stroke-width="3"/>' +
    '<ellipse cx="9" cy="8" rx="8" ry="10" fill="none" stroke="' + K + '" stroke-width="7"/><ellipse cx="9" cy="8" rx="8" ry="10" fill="none" stroke="#5f5872" stroke-width="3"/>' +
    P('M-5,17 L4,62 L8,60 L2,16 Z', G('acier'), ' stroke-width="2.6"') + P('M6,17 L-3,62 L-7,60 L-1,16 Z', G('acier'), ' stroke-width="2.6"') + Cir(0, 24, 2.6, '#f5c45a') + '</g>';
  /* la grande cuillère de bois */
  c = 452; s += croc(c - 7) + '<g transform="translate(' + c + ',' + (y + 14) + ')">' + R(-4.5, 0, 9, 46, 4, G('bois'), ' stroke-width="3"') + Ell(0, 60, 13, 17, G('boisC'), ' stroke-width="3"') + '<ellipse cx="-1" cy="58" rx="7.5" ry="11" fill="rgba(90,50,20,.3)"/>' + Cir(0, 5, 2.2, '#3a2010') + '</g>';
  /* la pelote de ficelle */
  c = 742; s += croc(c - 7) + '<g transform="translate(' + c + ',' + (y + 40) + ')">' + T('M0,-26 V-12', '#d9c08a', 2.5) + Cir(0, 6, 19, '#e3c98f') + T('M-15,-2 q15,-10 30,2 M-18,8 q18,-10 36,0 M-13,17 q13,-8 27,0 M-8,-10 q-6,16 4,34 M8,-11 q8,16 0,35', '#b9975a', 1.8) + T('M12,20 q10,6 8,18', K, 4.4) + T('M12,20 q10,6 8,18', '#e3c98f', 2) + '</g>';
  /* le bouquet de lavande */
  c = 990; s += croc(c - 7) + '<g transform="translate(' + c + ',' + (y + 16) + ')"><g class="balance b2">';
  [-2, -1, 0, 1, 2].forEach(function(k){ var x1 = k*9, y1 = 64 - Math.abs(k)*4; s += T('M0,2 Q' + (k*3) + ',30 ' + x1 + ',' + y1, K, 4.4) + T('M0,2 Q' + (k*3) + ',30 ' + x1 + ',' + y1, '#7aa86a', 2.2) + '<ellipse cx="' + x1 + '" cy="' + (y1 + 8) + '" rx="4.5" ry="11" fill="#9a7ae0" stroke="' + K + '" stroke-width="2.2"/>'; });
  s += T('M-6,8 q6,5 12,0 M-6,13 q6,5 12,0', '#f2c230', 2.6) + '</g></g>';
  /* la plaque de laiton */
  s += '<g transform="translate(600,' + (yt + 86) + ')">' + R(-128, -19, 256, 38, 7, G('laitonV'), ' stroke-width="3.5"') + '<rect x="-122" y="-13" width="244" height="26" rx="4" fill="none" stroke="#8a5a12" stroke-width="1.6" opacity=".7"/>' +
    Cir(-113, 0, 3, '#8a5a12', ' stroke-width="1.2"') + Cir(113, 0, 3, '#8a5a12', ' stroke-width="1.2"') + txt(0, 1, 25, 'Établi des plantes', ' fill="#4a2e08" textLength="196" lengthAdjust="spacingAndGlyphs"') + '</g>';
  return s;
}

/* ---------- Les matières, dessinées petites (autour de 0,0, une quarantaine de points de large) : c = leur couleur ---------- */
function forme(f, c){
  var s = '', fo = sombre(c, .32), cl = clair(c, .4), B = ' stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"', i, Rn = rng(7 + f.length*13);
  function feuille(x, y, a, k){ return '<g transform="translate(' + x + ',' + y + ') rotate(' + a + ') scale(' + (k || 1) + ')"><path d="M0,0 C-9,-8 -9,-24 0,-32 C9,-24 9,-8 0,0 Z" fill="' + c + '"' + B + '/><path d="M0,-3 V-26" stroke="' + fo + '" stroke-width="1.4" fill="none"/></g>'; }
  if(f === 'feuilles') s = feuille(-4, 8, -52) + feuille(4, 8, 48) + feuille(0, 10, -4, 1.12);
  else if(f === 'fleurs'){ [[-11, -2, 13], [11, 3, 11]].forEach(function(q){ for(i = 0; i < 9; i++) s += '<ellipse cx="' + q[0] + '" cy="' + (q[1] - q[2]*.6) + '" rx="' + f1(q[2]*.24) + '" ry="' + f1(q[2]*.46) + '" fill="' + c + '" stroke="' + K + '" stroke-width="1.5" transform="rotate(' + (i*40) + ' ' + q[0] + ' ' + q[1] + ')"/>'; s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + f1(q[2]*.3) + '" fill="' + fo + '" stroke="' + K + '" stroke-width="1.5"/>'; }); }
  else if(f === 'brins'){ [[-12, 6, -30], [0, 8, 0], [12, 6, 28]].forEach(function(q){ s += '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')">' + T('M0,0 V-24', K, 4.4) + T('M0,0 V-24', '#6aa84f', 2) + [[-4, -8], [4, -13], [-3, -19], [2, -25]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="' + c + '" stroke="' + K + '" stroke-width="1.4"/>'; }).join('') + '</g>'; }); }
  else if(f === 'boules'){ [[-12, 2], [1, 4], [13, 1], [-6, -9], [7, -8]].forEach(function(q){ s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="7.4" fill="' + c + '"' + B + '/><path d="M' + q[0] + ',' + (q[1] - 6) + ' V' + (q[1] + 6) + '" stroke="' + fo + '" stroke-width="1.2"/><path d="M' + (q[0] - 2) + ',' + (q[1] - 7) + ' l2,-4 l2,4" fill="' + c + '"' + B + '/>'; }); }
  else if(f === 'epis'){ [[-11, 6, -22], [0, 8, 2], [11, 6, 24]].forEach(function(q){ s += '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')">' + '<ellipse cx="0" cy="-14" rx="5.6" ry="15" fill="' + c + '"' + B + '/>' + T('M-4,-22 l8,4 M-5,-15 l10,4 M-4,-8 l8,4', fo, 1.1) + '</g>'; }); }
  else if(f === 'champi') s = '<path d="M-17,4 C-22,-14 -10,-24 0,-24 C10,-24 22,-14 17,4 C14,12 -14,12 -17,4 Z" fill="' + c + '"' + B + '/>' + '<ellipse cx="0" cy="-21" rx="4.5" ry="2.2" fill="' + sombre(c, .55) + '"/>' + T('M-8,-8 q3,4 1,9 M8,-9 q-3,5 0,9', fo, 1.5) + '<ellipse cx="-7" cy="-12" rx="4" ry="6" fill="#fff" opacity=".25"/>';
  else if(f === 'baies'){ [[-10, 3], [2, 5], [12, 1], [-4, -7], [7, -8], [-13, -8]].forEach(function(q){ s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6.4" fill="' + c + '"' + B + '/><circle cx="' + (q[0] + 2) + '" cy="' + (q[1] + 2) + '" r="1.2" fill="#8a8a7a"/><circle cx="' + (q[0] - 2) + '" cy="' + (q[1] - 2) + '" r="1.6" fill="#fff" opacity=".8"/>'; }); }
  else if(f === 'racine') s = '<path d="M-6,-16 C-9,-2 -4,8 0,16 C4,8 9,-2 6,-16 Z" fill="' + c + '"' + B + '/>' + T('M-4,0 q-10,3 -14,10 M4,3 q9,3 13,9 M0,12 q-6,4 -7,9', fo, 2);
  else if(f === 'tige') s = TT('M-16,8 L14,-12', c, 4.5, 4) + TT('M-12,-10 L16,6', c, 4.5, 4) + T('M-14,7 L12,-11', cl, 1.3, ' opacity=".7"');
  else if(f === 'bois') s = TT('M-18,6 L16,-8', c, 9, 5) + T('M-12,3 l8,-3 M2,-3 l8,-3', fo, 1.6) + '<ellipse cx="17" cy="-8.5" rx="3" ry="4.6" fill="' + cl + '" stroke="' + K + '" stroke-width="1.6" transform="rotate(-22 17 -8.5)"/>';
  else if(f === 'hache'){ s = '<path d="M-21,7 C-17,-9 -7,-14 0,-14 C8,-14 18,-8 21,7 C12,12 -12,12 -21,7 Z" fill="' + c + '"' + B + '/>'; for(i = 0; i < 16; i++){ var x = (Rn() - .5)*30, y = -9 + Rn()*14; s += '<path d="M' + f1(x) + ',' + f1(y) + ' l' + f1(2 + Rn()*4) + ',' + f1((Rn() - .5)*5) + '" stroke="' + (i % 3 ? fo : cl) + '" stroke-width="2.2" stroke-linecap="round"/>'; } }
  else if(f === 'tas') s = '<path d="M-20,7 C-14,-12 -5,-15 0,-15 C5,-15 14,-12 20,7 C12,11 -12,11 -20,7 Z" fill="' + c + '"' + B + '/>' + '<path d="M-9,-6 C-5,-11 2,-12 6,-10" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".55"/>' + [[-10, 2], [3, 3], [10, -1], [-2, -5]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.2" fill="' + fo + '"/>'; }).join('');
  else if(f === 'graines'){ s = '<path d="M-19,7 C-14,-9 -6,-12 0,-12 C6,-12 14,-9 19,7 C12,11 -12,11 -19,7 Z" fill="' + sombre(c, .12) + '"' + B + '/>'; for(i = 0; i < 13; i++){ var gx = (Rn() - .5)*28, gy = -6 + Rn()*11; s += '<ellipse cx="' + f1(gx) + '" cy="' + f1(gy) + '" rx="3.2" ry="1.9" fill="' + (i % 2 ? c : cl) + '" stroke="' + K + '" stroke-width=".9" transform="rotate(' + f1(Rn()*180) + ' ' + f1(gx) + ' ' + f1(gy) + ')"/>'; } }
  else if(f === 'pate') s = '<path d="M-20,5 C-22,-8 -10,-15 -1,-13 C8,-17 22,-9 19,4 C17,12 -16,13 -20,5 Z" fill="' + c + '"' + B + '/>' + '<path d="M-11,-5 C-6,-10 3,-10 8,-7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".7"/>' + T('M-6,4 q6,4 13,0', fo, 1.4, ' opacity=".5"');
  else if(f === 'cristaux'){ [[-12, 4, -12], [-2, 6, 6], [9, 4, 18], [-6, -4, 30], [5, -5, -20]].forEach(function(q){ s += '<path d="M0,-8 L5,-3 L4,5 L-3,7 L-6,0 Z" fill="' + c + '"' + B.replace('2.4', '1.8') + ' transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')"/><path d="M0,-8 L-1,1 L4,5 M-1,1 L-6,0" stroke="#b8c8dc" stroke-width="1" fill="none" transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')"/>'; }); }
  else if(f === 'goutte') s = '<path d="M0,-17 C10,-3 12,6 0,13 C-12,6 -10,-3 0,-17 Z" fill="' + c + '"' + B + '/><path d="M-4,-2 q-2,5 1,9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".7"/>';
  else s = '<ellipse cx="0" cy="2" rx="22" ry="8" fill="' + c + '"' + B + '/><ellipse cx="-7" cy="0" rx="7" ry="2.2" fill="#fff" opacity=".45"/>';   /* (jus : une petite flaque) */
  return s;
}
/* La matière en cours, posée « à plat » (sur une planche, un tamis), « au creux » (dans un bol, vue d'en haut), ou en vol */
function spriteM(m, facon){
  if(!m) return '';
  if(m.f === 'jus') return facon === 'vol' ? forme('goutte', m.c) : facon === 'creux' ? '<ellipse cx="0" cy="0" rx="30" ry="8.5" fill="' + m.c + '" opacity=".95"/><ellipse cx="-9" cy="-2" rx="9" ry="2.4" fill="#fff" opacity=".4"/>' : forme('jus', m.c);
  return (facon === 'vol' ? '' : '<ellipse cx="0" cy="9" rx="21" ry="5" fill="rgba(20,10,6,.3)"/>') + forme(m.f, m.c);
}
function ici(o, pos){ return (S && S.partie && S.ou === o && (S.pos || 'entree') === pos) ? S.m : null; }
function fenteSvg(o, pos){
  var f = FENTE[o][pos], m = ici(o, pos); if(!f || !m || f[2] === 'verre') return '';
  return '<g class="matiere" transform="translate(' + f[0] + ',' + f[1] + ') scale(' + f[3] + ')">' + spriteM(m, f[2]) + '</g>';
}
function reste(o){ var c = S && S.restes && S.restes[o]; return c || null; }

/* ---------- Le feu : des bûches (0, 1 ou 2), et des flammes quand il est allumé ---------- */
function bucheArt(x, y, a, k){
  return '<g transform="translate(' + x + ',' + y + ') rotate(' + (a || 0) + ') scale(' + (k || 1) + ')">' + R(-34, -10, 68, 20, 9, '#7a4a28', ' stroke-width="3.2"') + T('M-22,-4 h14 M-2,3 h18 M6,-5 h12', '#56321a', 1.8) +
    '<ellipse cx="31" cy="0" rx="6" ry="9.4" fill="#e2b87c" stroke="' + K + '" stroke-width="2.6"/><ellipse cx="31" cy="0" rx="2.6" ry="4.4" fill="none" stroke="#b98a52" stroke-width="1.3"/></g>';
}
function flammesArt(n, l){
  var s = '', i, pos = n >= 2 ? [[-26, 26], [0, 38], [24, 30], [-12, 20], [12, 22]] : [[-12, 18], [8, 22], [-2, 14]];
  pos.forEach(function(q, i){ var h = q[1]*(l || 1); s += '<g class="flamme' + (i % 3 === 1 ? ' f2' : i % 3 === 2 ? ' f3' : '') + '"><path d="M' + q[0] + ',0 C' + (q[0] - h*.42) + ',' + (-h*.3) + ' ' + (q[0] - h*.2) + ',' + (-h*.7) + ' ' + q[0] + ',' + (-h) + ' C' + (q[0] + h*.2) + ',' + (-h*.7) + ' ' + (q[0] + h*.42) + ',' + (-h*.3) + ' ' + q[0] + ',0 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/>' +
    '<path d="M' + q[0] + ',-2 C' + (q[0] - h*.16) + ',' + (-h*.24) + ' ' + (q[0] - h*.08) + ',' + (-h*.42) + ' ' + q[0] + ',' + (-h*.56) + ' C' + (q[0] + h*.08) + ',' + (-h*.42) + ' ' + (q[0] + h*.16) + ',' + (-h*.24) + ' ' + q[0] + ',-2 Z" fill="#fff7c2"/></g>'; });
  return s;
}
function foyerArt(o, y, k){
  var f = S ? S.feux[o] : {b:0, allume:false}, s = '';
  k = k || 1;
  if(f.allume) s += '<circle class="lueur-feu" cx="0" cy="' + (y - 18*k) + '" r="' + ((f.b >= 2 ? 86 : 62)*k) + '" fill="' + G('lueurFeu') + '"/>';
  if(f.b >= 2) s += bucheArt(6*k, y - 16*k, -6, .82*k);
  if(f.b >= 1) s += bucheArt(-4*k, y - 7*k, 7, .86*k);
  if(f.allume) s += '<g transform="translate(0,' + (y - 14*k) + ') scale(' + k + ')">' + flammesArt(f.b) + '</g>';
  return s;
}

/* ---------- Les outils, un par un (dans leur repère : le pied en 0,0) ---------- */
var ART = {};
/* Le tas de bûches */
ART.buches = function(){
  var s = ombre(4, 4, 58, 10, .42), L = [[-36, -18], [0, -18], [36, -18], [-18, -50], [18, -50], [0, -82]];
  L.forEach(function(q, i){
    var x = q[0], y = q[1];
    s += '<path d="M' + (x - 18) + ',' + y + ' L' + (x - 15) + ',' + (y - 20) + ' A15,6 0 0 1 ' + (x + 15) + ',' + (y - 20) + ' L' + (x + 18) + ',' + y + ' Z" fill="#6f4426" stroke="' + K + '" stroke-width="3.4" stroke-linejoin="round"/>' + T('M' + (x - 9) + ',' + (y - 20) + ' v8 M' + (x + 6) + ',' + (y - 22) + ' v9', '#4a2a14', 1.6) +
      Cir(x, y, 18, '#8a5a36') + '<circle cx="' + x + '" cy="' + y + '" r="13" fill="#e2b87c" stroke="#a5713a" stroke-width="1.6"/><circle cx="' + (x + 1) + '" cy="' + y + '" r="8" fill="none" stroke="#c9975a" stroke-width="1.5"/><circle cx="' + (x + 1) + '" cy="' + (y + 1) + '" r="3.4" fill="none" stroke="#c9975a" stroke-width="1.3"/>' +
      T('M' + x + ',' + y + ' l' + [9, -7, 6, 8, -9, 5][i] + ',' + [-8, -9, 9, 6, 4, -10][i], '#a5713a', 1.5);
  });
  function mb(x, y){ return Cir(x, y, 9, '#8a5a36', ' stroke-width="2.4"') + '<circle cx="' + x + '" cy="' + y + '" r="5.6" fill="#e2b87c" stroke="#a5713a" stroke-width="1.2"/>'; }
  function fl(x, y, k){ return '<path transform="translate(' + x + ',' + y + ') scale(' + k + ')" d="M0,12 C-11,3 -7,-9 0,-21 C7,-9 11,3 0,12 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2.2" stroke-linejoin="round"/>'; }
  function ec(x, y, t){ return '<text x="' + x + '" y="' + y + '" font-size="15" font-weight="800" font-family="Fredoka, system-ui, sans-serif" fill="#3a2410">' + t + '</text>'; }
  var pan = '<g class="pan-feu" pointer-events="none" transform="translate(4,-170)">' + T('M-50,34 V62 M50,34 V62', K, 8) + T('M-50,34 V62 M50,34 V62', '#8a5a36', 4.4) + R(-78, -42, 156, 78, 6, G('boisC'), ' stroke-width="3.5"') + reflet('M-70,-36 H70', 2, .3) +
    mb(-58, -21) + ec(-42, -16, '= feu doux') + fl(60, -19, .62) + mb(-64, 15) + mb(-50, 15) + ec(-36, 20, '= feu fort') + fl(60, 16, 1) + '</g>';
  return pan + '<rect class="rond" x="-64" y="-112" width="128" height="126" rx="18"/><g class="leve">' + s + '</g><rect x="-64" y="-110" width="128" height="122" fill="transparent"/>';
};
/* L'alambic : le fourneau de briques, la cucurbite de cuivre, son chapeau, le col de cygne, le seau d'eau froide et son serpentin, le vase qui reçoit */
ART.alambic = function(){
  var s = ombre(60, 6, 150, 13, .45), i, m = ici('alambic', 'entree'), ouvert = !!m, sor = ici('alambic', 'sortie'), eau = S && S.liq.alambic;
  /* le seau du serpentin (derrière le col) */
  var seau = P('M92,-98 L160,-98 L154,4 L98,4 Z', G('boisV')) + T('M106,-96 L109,3 M122,-97 L123,4 M138,-97 L138,4 M150,-96 L146,3', '#6b3d1f', 2) + TT('M93,-76 L159,-76', '#3a3450', 5, 4) + TT('M96,-22 L156,-22', '#3a3450', 5, 4) +
    Ell(126, -98, 34, 9, '#8fc6e8', ' stroke-width="3.5"') + '<path d="M104,-99 q22,-9 44,0" fill="none" stroke="' + K + '" stroke-width="6"/><path d="M104,-99 q22,-9 44,0" fill="none" stroke="#e0a070" stroke-width="3"/><ellipse cx="116" cy="-96" rx="9" ry="2" fill="#fff" opacity=".45"/>' +
    reflet('M100,-90 L103,-6', 3, .22);
  /* le bec, et le vase florentin */
  var bec = TT('M152,-34 L182,-28', '#e0a070', 5, 4.5) + '<path class="goutte-a" id="goutteAl" d="M186,-24 c-3,4 -3,7 0,8 c3,-1 3,-4 0,-8 Z" fill="#bfeee0" stroke="' + K + '" stroke-width="1.2" opacity="0"/>';
  var vd = 'M178,-52 V-42 C167,-37 164,-14 170,-4 Q190,3 210,-4 C216,-14 213,-37 202,-42 V-52 Z';
  var vase = ombre(192, 2, 26, 6, .4) + (sor ? '<clipPath id="clipVase"><path d="' + vd + '"/></clipPath><g clip-path="url(#clipVase)"><rect id="vaseLiq" x="160" y="-30" width="60" height="36" fill="' + sor.c + '"/><ellipse cx="190" cy="-30" rx="24" ry="4" fill="' + clair(sor.c, .5) + '"/></g>' : '<clipPath id="clipVase"><path d="' + vd + '"/></clipPath><g clip-path="url(#clipVase)"><rect id="vaseLiq" x="160" y="6" width="60" height="0" fill="#bfeee0"/></g>') +
    '<path d="' + vd + '" fill="rgba(220,245,255,.2)" stroke="' + K + '" stroke-width="3.4" stroke-linejoin="round"/>' + Ell(190, -52, 12, 3.6, 'rgba(220,245,255,.4)', ' stroke-width="2.6"') + TT('M212,-18 q12,-2 12,-14', 'rgba(220,245,255,.8)', 3, 3.5) + reflet('M172,-34 q-3,12 1,24', 3, .55);
  /* le fourneau */
  var four = R(-66, -66, 132, 70, 5, G('brique'));
  for(i = 0; i < 4; i++) four += T('M-64,' + (-50 + i*16) + ' H64', '#e9c9a6', 1.6, ' opacity=".7"') + [[-40, -10, 22], [-52, -24, 4, 30], [-40, -10, 22], [-52, -24, 4, 30]][i].map(function(x){ return T('M' + x + ',' + (-66 + i*16) + ' v16', '#e9c9a6', 1.6, ' opacity=".7"'); }).join('');
  four += '<path d="M-36,4 V-28 A36,26 0 0 1 36,-28 V4 Z" fill="#170f0c" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + '<g id="foyer-alambic" clip-path="url(#clipFour)">' + foyerArt('alambic', 3, .74) + '</g>' +
    '<path d="M-36,-28 A36,26 0 0 1 36,-28" fill="none" stroke="#e9c9a6" stroke-width="5" opacity=".55"/>' + R(-72, -76, 144, 13, 4, '#9a93ac') + reflet('M-66,-72 H66', 2, .4);
  /* la cucurbite, son chapeau, le col de cygne */
  var cuc = '<path d="M-46,-76 C-68,-114 -40,-154 0,-154 C40,-154 68,-114 46,-76 Z" fill="' + G('cuivre') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + T('M-50,-98 Q0,-88 50,-98', '#8a4a22', 2.2, ' opacity=".8"') +
    [-40, -24, -8, 8, 24, 40].map(function(x){ return '<circle cx="' + x + '" cy="' + (-94 + Math.abs(x)*.09) + '" r="2.2" fill="#ffd0a0" stroke="#6a2e12" stroke-width="1"/>'; }).join('') + reflet('M-38,-112 C-40,-128 -30,-142 -16,-147', 4.5, .55) +
    TT('M-52,-108 q-16,2 -12,18', '#c9703a', 5, 4.5) + TT('M52,-108 q16,2 12,18', '#c9703a', 5, 4.5) +
    (eau ? '<ellipse cx="0" cy="-151" rx="20" ry="5" fill="' + (eau === 'huile' ? '#f2b630' : '#6fb6ea') + '" opacity=".9"/>' : '<ellipse cx="0" cy="-151" rx="20" ry="5" fill="#3a1a0c"/>');
  var col = 'M8,-198 C40,-238 116,-226 124,-158 L126,-102';
  var chap = '<g id="chapiteau"' + (ouvert ? ' transform="translate(-34,-10) rotate(-34 -22 -154)"' : '') + '>' + (ouvert ? '' : TT(col, '#d98a4a', 9, 6) + reflet('M30,-216 C60,-232 102,-220 114,-176', 2.6, .5)) +
    '<path d="M-25,-152 C-36,-176 -22,-200 0,-206 C22,-200 36,-176 25,-152 Z" fill="' + G('cuivre') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + Ell(0, -152, 25, 6.5, '#e0a070', ' stroke-width="3.2"') + Cir(0, -208, 6, G('laitonV'), ' stroke-width="3"') + reflet('M-17,-170 C-18,-184 -10,-196 -2,-200', 3.4, .55) + '</g>';
  var colOuvert = ouvert ? '<g opacity=".95">' + TT('M40,-214 C70,-232 116,-224 124,-158 L126,-102', '#d98a4a', 9, 6) + '</g>' : '';
  s += seau + bec + vase + four + colOuvert + cuc + '<g class="agit">' + fenteSvg('alambic', 'entree') + '</g>' + chap +
    '<g class="vapeur" id="vapAl" style="display:none">' + T('M118,-232 q-6,-9 0,-18 q6,-9 0,-18', '#fff', 3, ' opacity=".7"') + '</g>';
  return '<rect class="rond" x="-80" y="-246" width="312" height="262" rx="20"/>' + s + '<rect x="-80" y="-240" width="312" height="254" fill="transparent"/>' +
    '<rect data-act="foyer" data-o="alambic" x="-50" y="-60" width="100" height="72" fill="transparent"/>';
};
/* La marmite de fonte sur son trépied, au-dessus d'une plaque de pierre */
ART.marmite = function(){
  var m = ici('marmite', 'entree'), liq = S && S.liq.marmite, f = S ? S.feux.marmite : {b:0}, coul = m && m.f === 'jus' ? m.c : liq === 'huile' ? '#f2b630' : liq === 'eau' ? '#6fb6ea' : null;
  if(m && liq && m.f !== 'jus') coul = melange(liq === 'huile' ? '#f2b630' : '#6fb6ea', m.c, .3);
  var s = ombre(4, 8, 84, 14, .45) + Ell(0, 2, 80, 22, '#8f879f') + '<ellipse cx="0" cy="-1" rx="70" ry="17" fill="#7a738f" stroke="' + K + '" stroke-width="2"/>' + T('M-40,-6 q10,6 4,12 M30,-8 l12,10', 'rgba(30,24,50,.4)', 1.8);
  s += TT('M0,-66 V-12', '#3a3450', 5.5, 4.5);                                  /* le pied du fond */
  s += '<g id="foyer-marmite">' + foyerArt('marmite', 4) + '</g>';
  s += TT('M-50,-64 L-64,2', '#3a3450', 6, 4.5) + TT('M50,-64 L64,2', '#3a3450', 6, 4.5) + '<path d="M-56,-66 A56,13 0 0 0 56,-66" fill="none" stroke="' + K + '" stroke-width="9"/><path d="M-56,-66 A56,13 0 0 0 56,-66" fill="none" stroke="#4a465e" stroke-width="4.5"/>';
  /* la marmite */
  s += TT('M-58,-104 q-17,3 -12,20', '#3a3650', 5, 4.5) + TT('M58,-104 q17,3 12,20', '#3a3650', 5, 4.5) +
    '<path d="M-58,-118 C-66,-84 -46,-56 0,-54 C46,-56 66,-84 58,-118 Z" fill="' + G('fonte') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + reflet('M-44,-104 C-46,-88 -40,-74 -28,-66', 4.5, .35) +
    (f.allume ? '<path d="M-44,-66 C-22,-54 22,-54 44,-66 C24,-60 -24,-60 -44,-66 Z" fill="#ff8a2a" opacity=".55"/>' : '') +
    Ell(0, -118, 58, 15, '#3a3650') + '<clipPath id="clipMarmite"><ellipse cx="0" cy="-116" rx="51" ry="11.5"/></clipPath><ellipse cx="0" cy="-116" rx="51" ry="11.5" fill="#12101a"/>';
  s += '<g clip-path="url(#clipMarmite)" id="dansMarmite">' + (coul ? '<ellipse id="liqMarmite" cx="0" cy="-114" rx="51" ry="11.5" fill="' + coul + '"/><ellipse cx="-16" cy="-117" rx="14" ry="3" fill="#fff" opacity=".3"/>' : '') + (m && m.f !== 'jus' ? fenteSvg('marmite', 'entree') : '') + '</g>';
  /* la cuillère de bois */
  s += '<g class="agit" id="cuillere">' + TT('M22,-114 L60,-184', '#c98450', 6, 5) + Cir(61, -186, 5.5, G('boisC'), ' stroke-width="3"') + '</g>';
  s += '<g id="vapMa" style="display:none"><g class="vapeur">' + T('M-16,-132 q-7,-10 0,-20 q7,-10 0,-20', '#fff', 3.4, ' opacity=".7"') + '</g><g class="vapeur v2">' + T('M12,-134 q-7,-10 0,-20 q7,-10 0,-20', '#fff', 3.4, ' opacity=".7"') + '</g></g>';
  return '<rect class="rond" x="-84" y="-196" width="168" height="224" rx="20"/>' + s + '<rect x="-84" y="-190" width="168" height="130" fill="transparent"/>' +
    '<rect data-act="foyer" data-o="marmite" x="-80" y="-60" width="160" height="84" fill="transparent"/>';
};
/* Le lutrin et le grimoire, ouvert sur ses recettes */
ART.livre = function(){
  var s = ombre(4, 6, 92, 12, .45);
  s += R(-70, -14, 140, 16, 4, G('boisS')) + P('M-64,-14 L64,-14 L52,-40 L-52,-40 Z', G('boisV'), ' stroke-width="3.5"');                       /* le pied */
  s += P('M-84,-26 L84,-26 L72,-124 L-72,-124 Z', G('boisH')) + grainBois(-70, -120, 140, 90, 5, 44, '#8a5530', .3);                       /* la tablette penchée */
  /* le livre : sa couverture, ses pages, ses lignes, un dessin de plante, le ruban */
  s += P('M-78,-32 L78,-32 L67,-120 L-67,-120 Z', '#7a2a3a', ' stroke-width="3.5"') + P('M-72,-36 L0,-33 L0,-113 L-62,-116 Z', G('page'), ' stroke-width="2.6"') + P('M72,-36 L0,-33 L0,-113 L62,-116 Z', G('page'), ' stroke-width="2.6"') +
    F('M0,-33 L0,-113 L-9,-113.5 L-10,-33.5 Z', 'rgba(120,90,40,.22)') + F('M0,-33 L0,-113 L9,-113.5 L10,-33.5 Z', 'rgba(120,90,40,.16)') + T('M0,-33 V-113', K, 2.6);
  s += T('M-52,-102 C-50,-86 -54,-70 -46,-54 M-46,-54 q-12,-8 -16,-20 M-49,-70 q10,-8 12,-20 M-50,-86 q-9,-6 -12,-14', '#3f8f4f', 2.6) + '<circle cx="-52" cy="-104" r="5.5" fill="#ff9a1f" stroke="' + K + '" stroke-width="1.6"/><ellipse cx="-63" cy="-74" rx="6" ry="3.4" fill="#6fae5a" stroke="' + K + '" stroke-width="1.3" transform="rotate(30 -63 -74)"/><ellipse cx="-37" cy="-92" rx="6" ry="3.4" fill="#6fae5a" stroke="' + K + '" stroke-width="1.3" transform="rotate(-40 -37 -92)"/>';
  s += T('M-30,-100 q4,-3 8,0 t8,0 M-30,-90 q4,-3 8,0 t9,0 M-31,-80 q4,-3 8,0 t7,0 M-32,-66 q4,-3 9,0 t10,0 M-58,-46 q5,-3 10,0 t10,0 t10,0 t12,0', '#3a2a22', 1.5, ' opacity=".8"') +
    T('M12,-102 q5,-3 10,0 t10,0 t10,0 t10,0 M12,-92 q5,-3 10,0 t10,0 t10,0 t8,0 M13,-82 q5,-3 10,0 t10,0 t10,0 t9,0 M13,-72 q5,-3 10,0 t10,0 t10,0 M14,-62 q5,-3 10,0 t10,0 t10,0 t9,0 M14,-52 q5,-3 10,0 t10,0 t8,0 M15,-44 q5,-3 10,0 t10,0', '#3a2a22', 1.5, ' opacity=".8"') +
    '<text x="34" y="-108" font-size="11" text-anchor="middle" font-family="Macondo, serif" fill="#7a2a3a">Recettes</text>';
  s += R(-88, -32, 176, 10, 4, G('boisC'), ' stroke-width="3.2"') + TT('M-6,-30 q-5,22 2,40', '#e8343c', 4.5, 3.5) + P('M-8,8 l4,10 l4,-9 Z', '#e8343c', ' stroke-width="2"');
  /* un peu de magie : de petites étoiles au-dessus des pages */
  s += '<g fill="#fff3a8"><path class="scint" d="M-34,-140 l2.5,-7 l2.5,7 l7,2.5 l-7,2.5 l-2.5,7 l-2.5,-7 l-7,-2.5 Z"/><path class="scint s2" d="M30,-150 l2,-5.5 l2,5.5 l5.5,2 l-5.5,2 l-2,5.5 l-2,-5.5 l-5.5,-2 Z"/><path class="scint s3" d="M0,-166 l1.8,-5 l1.8,5 l5,1.8 l-5,1.8 l-1.8,5 l-1.8,-5 l-5,-1.8 Z"/></g>';
  if(S && S.pagesVues && nouvellesPages().length) s += '<g class="badge-l" transform="translate(86,-30)">' + Cir(0, 0, 16, '#ffd23f', ' stroke-width="3.2"') + '<text x="0" y="1" font-size="23" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#2a1d0e" font-family="Fredoka, system-ui, sans-serif">!</text></g>';
  return '<rect class="rond" x="-92" y="-134" width="184" height="158" rx="18"/>' + s + '<rect x="-92" y="-128" width="184" height="148" fill="transparent"/>';
};
/* Le pressoir : un cadre de bois, une grosse vis, un panier à claire-voie, un plateau à bec, le petit verre dessous */
ART.presse = function(){
  var m = ici('presse', 'entree'), sor = ici('presse', 'sortie'), bas = S && S.presseBas ? 16 : 0, rs = reste('presse'), s = ombre(10, 6, 86, 12, .45), i;
  s += R(-66, -12, 132, 14, 4, G('boisS')) + R(-60, -160, 14, 150, 3, G('boisV')) + R(46, -160, 14, 150, 3, G('boisV')) + grainBois(-58, -156, 10, 142, 2, 5, '#6b3d1f', .4) + grainBois(48, -156, 10, 142, 2, 6, '#6b3d1f', .4);
  /* le plateau à bec et le verre */
  s += P('M-52,-26 H52 L45,-12 H-45 Z', G('boisC'), ' stroke-width="3.5"') + TT('M50,-20 L72,-16', '#c98450', 6, 4.5) +
    '<path class="goutte-p" id="gouttePr" d="M76,-12 c-3,4 -3,7 0,8 c3,-1 3,-4 0,-8 Z" fill="#f2b630" stroke="' + K + '" stroke-width="1.2" opacity="0"/>';
  var vd = 'M64,-34 L66,-2 Q67,2 71,2 H85 Q89,2 90,-2 L92,-34 Z';
  s += ombre(79, 4, 18, 5, .4) + '<clipPath id="clipVerre"><path d="' + vd + '"/></clipPath><g clip-path="url(#clipVerre)"><rect id="verreLiq" x="60" y="' + (sor ? -24 : 4) + '" width="36" height="' + (sor ? 28 : 0) + '" fill="' + (sor ? sor.c : '#f2b630') + '"/></g>' +
    '<path d="' + vd + '" fill="rgba(220,245,255,.22)" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' + reflet('M68,-28 l2,22', 2.4, .55);
  /* le panier à claire-voie (on voit dedans, entre les lattes) */
  s += '<rect x="-38" y="-76" width="76" height="50" fill="#2a1a10"/>' + (rs ? '<rect x="-36" y="-44" width="72" height="16" fill="' + rs + '"/>' : '');
  for(i = 0; i < 7; i++) s += R(-40 + i*11.4, -78, 8.6, 54, 2, G('bois'), ' stroke-width="2.4"');
  s += TT('M-41,-66 H41', '#3a3450', 4, 4) + TT('M-41,-38 H41', '#3a3450', 4, 4);
  s += fenteSvg('presse', 'entree');
  /* la traverse, la vis, le plateau qui descend, la manivelle */
  s += '<g id="presseMobile" transform="translate(0,' + bas + ')">' + R(-7, -150, 14, 66, 2, '#b8b4c8', ' stroke-width="3"') + T('M-7,-140 l14,5 M-7,-130 l14,5 M-7,-120 l14,5 M-7,-110 l14,5 M-7,-100 l14,5', '#6f6a88', 2) + R(-36, -90, 72, 11, 3, G('boisC'), ' stroke-width="3.2"') + '</g>';
  s += R(-70, -174, 140, 18, 4, G('boisC')) + grainBois(-66, -171, 132, 12, 2, 9, '#6b3d1f', .4) + R(-11, -178, 22, 26, 3, G('fer'), ' stroke-width="3"');
  s += '<g class="agit" id="manivelle"><g id="manivelleT">' + R(-7, -204, 14, 30, 2, '#b8b4c8', ' stroke-width="3"') + T('M-7,-196 l14,5 M-7,-186 l14,5', '#6f6a88', 2) + TT('M-44,-206 H44', '#94603a', 8, 5) + Cir(-44, -206, 8, G('boisC'), ' stroke-width="3"') + Cir(44, -206, 8, G('boisC'), ' stroke-width="3"') + '</g></g>';
  return '<rect class="rond" x="-80" y="-224" width="184" height="244" rx="20"/>' + s + '<rect x="-80" y="-222" width="184" height="238" fill="transparent"/>';
};
/* Le séchoir : une large jatte de terre cuite sur son petit support, et son écriteau « On laisse sécher » */
ART.sechoir = function(){
  var s = ombre(4, 6, 70, 11, .42), m = ici('sechoir', 'entree');
  /* l'écriteau, planté derrière */
  s += TT('M58,-18 V-104', '#94603a', 6, 4.5) + '<g transform="rotate(-4 58 -104)">' + R(8, -128, 102, 46, 5, G('boisC'), ' stroke-width="3.5"') + grainBois(11, -125, 96, 40, 3, 71, '#8a5530', .3) + Cir(15, -121, 2, '#3a2010', ' stroke-width="1"') + Cir(103, -121, 2, '#3a2010', ' stroke-width="1"') +
    txt(59, -114, 20, 'On laisse', ' fill="#3a2010"') + txt(59, -95, 20, 'sécher', ' fill="#3a2010"') + '</g>';
  /* le support et la jatte */
  s += TT('M-40,2 L-20,-22 M40,2 L20,-22 M-34,-4 H34', '#94603a', 6, 4.5);
  s += '<path d="M-60,-32 C-54,-10 -32,-4 0,-4 C32,-4 54,-10 60,-32 Z" fill="' + G('terre') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + T('M-50,-20 Q0,-6 50,-20', '#8a4e2c', 2, ' opacity=".6"') +
    Ell(0, -32, 60, 16, '#d08a58') + '<clipPath id="clipJatte"><ellipse cx="0" cy="-31" rx="53" ry="12.5"/></clipPath><ellipse cx="0" cy="-31" rx="53" ry="12.5" fill="#f0d0a8" stroke="' + K + '" stroke-width="2"/><ellipse cx="6" cy="-28" rx="40" ry="8" fill="#e6bc8c" opacity=".7"/>' +
    '<g clip-path="url(#clipJatte)">' + fenteSvg('sechoir', 'entree') + '</g>' + reflet('M-50,-26 q8,12 24,16', 3, .3);
  /* le petit courant d'air qui sèche (on le voit quand ça sèche) */
  s += '<g id="airSec" style="display:none"><g class="vapeur">' + T('M-22,-52 q-6,-8 0,-16 q6,-8 0,-16', '#fff', 3, ' opacity=".6"') + '</g><g class="vapeur v2">' + T('M14,-52 q-6,-8 0,-16 q6,-8 0,-16', '#fff', 3, ' opacity=".6"') + '</g></g>';
  return '<rect class="rond" x="-70" y="-140" width="190" height="158" rx="18"/><g class="agit"></g>' + s + '<rect x="-70" y="-138" width="190" height="152" fill="transparent"/>';
};
/* Les fioles vides, sur leur petit râtelier, et l'entonnoir de laiton */
ART.fiole = function(){
  var s = ombre(2, 6, 62, 10, .42), fd = 'M-6,-70 V-56 L-15,-22 Q-17,-12 -7,-12 H7 Q17,-12 15,-22 L6,-56 V-70 Z';
  s += R(-56, -12, 112, 14, 4, G('boisS')) + R(-52, -64, 9, 54, 2, G('boisV'), ' stroke-width="3"') + R(43, -64, 9, 54, 2, G('boisV'), ' stroke-width="3"');
  [-33, 0, 33].forEach(function(x, i){
    s += '<g transform="translate(' + x + ',0)"' + (i === 1 ? ' id="fioleMilieu"' : '') + '>' + (i === 1 ? '<clipPath id="clipFiole"><path d="' + fd + '"/></clipPath><g clip-path="url(#clipFiole)"><rect id="fioleLiq" x="-20" y="-10" width="40" height="0" fill="#fff"/></g>' : '') +
      '<path d="' + fd + '" fill="rgba(220,245,255,.2)" stroke="' + K + '" stroke-width="3.2" stroke-linejoin="round"/>' + Ell(0, -70, 6, 2.2, 'rgba(220,245,255,.5)', ' stroke-width="2.2"') + reflet('M-8,-44 q-3,10 0,18', 2.6, .5) + '</g>';
  });
  s += R(-58, -50, 116, 10, 4, G('boisC'), ' stroke-width="3.2"') + reflet('M-52,-47 H52', 1.8, .35);
  /* l'entonnoir, posé sur la fiole du milieu */
  s += '<g class="agit" id="entonnoir">' + P('M-17,-100 L17,-100 L4,-80 L4,-68 L-4,-68 L-4,-80 Z', G('laiton'), ' stroke-width="3.2"') + Ell(0, -100, 17, 5, '#f7cd6a', ' stroke-width="3"') + '<ellipse cx="0" cy="-99.5" rx="12" ry="3" fill="#8a5a12" opacity=".6"/></g>';
  s += fenteSvg('fiole', 'entree');
  return '<rect class="rond" x="-66" y="-116" width="132" height="136" rx="18"/>' + s + '<rect x="-66" y="-114" width="132" height="130" fill="transparent"/>';
};
/* Les allumettes : une boîte, et une grande allumette posée dessus */
ART.allumettes = function(){
  var s = ombre(2, 6, 40, 8, .4);
  s += P('M-34,-22 L16,-30 L34,-14 L-16,-6 Z', '#efe2b4', ' stroke-width="3.2"') + P('M-16,-6 L34,-14 L34,2 L-16,10 Z', '#c8443c', ' stroke-width="3.2"') + P('M-34,-22 L-16,-6 L-16,10 L-34,-6 Z', '#a2332e', ' stroke-width="3.2"') +
    T('M-10,3 L28,-3', '#5a1a16', 5) + '<path d="M-2,-22 c-5,-5 -1,-8 1,-11 c1,4 6,5 3,11 Z" fill="#e8693c"/><path d="M-12,-17 l22,-4" stroke="#7a2420" stroke-width="1.6"/>';
  s += '<g class="leve" id="allumetteG"><g>' + TT('M-22,-28 L26,-50', '#e8c98a', 3.4, 3.6) + Cir(28, -51, 5, '#c0392b', ' stroke-width="2.4"') +
    '<g id="flammeAll" style="display:none"><g class="flamme"><path d="M28,-54 C20,-63 23,-74 28,-84 C33,-74 36,-63 28,-54 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/></g></g></g></g>';
  return '<rect class="rond" x="-44" y="-62" width="88" height="80" rx="14"/>' + s + '<rect x="-44" y="-62" width="88" height="78" fill="transparent"/>';
};
/* Le mortier de marbre et son pilon */
ART.mortier = function(){
  var s = ombre(2, 6, 54, 10, .45);
  s += R(-24, -10, 48, 12, 5, G('pierreM')) + '<path d="M-48,-54 C-48,-20 -28,-8 0,-8 C28,-8 48,-20 48,-54 Z" fill="' + G('pierreM') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
    T('M-36,-40 q8,10 4,22 M22,-44 q-6,12 6,24 M-10,-26 q10,4 18,-2', 'rgba(110,100,140,.5)', 1.6) + reflet('M-40,-44 C-40,-30 -34,-20 -24,-14', 4, .45) +
    Ell(0, -54, 48, 14, '#b8b0c8') + '<clipPath id="clipMortier"><ellipse cx="0" cy="-52" rx="41" ry="10.5"/></clipPath><ellipse cx="0" cy="-52" rx="41" ry="10.5" fill="#6a637e" stroke="' + K + '" stroke-width="2"/><ellipse cx="4" cy="-49" rx="30" ry="6.5" fill="#8f879f" opacity=".7"/>' +
    '<g clip-path="url(#clipMortier)">' + fenteSvg('mortier', 'entree') + '</g>';
  s += '<g class="agit" id="pilon"><g id="pilonT">' + '<g transform="rotate(-22 -12 -56)">' + R(-19, -118, 14, 66, 7, '#efe8d6', ' stroke-width="3.4"') + Ell(-12, -52, 10, 6, '#d6cdb8', ' stroke-width="3"') + reflet('M-15,-110 V-66', 2.4, .6) + Cir(-12, -120, 8.5, '#efe8d6', ' stroke-width="3.2"') + '</g></g></g>';
  return '<rect class="rond" x="-58" y="-140" width="116" height="160" rx="18"/>' + s + '<rect x="-58" y="-138" width="116" height="154" fill="transparent"/>';
};
/* Le tamis, posé sur une jatte de bois : ce qui est fin tombe dedans */
ART.tamis = function(){
  var s = ombre(2, 6, 66, 11, .45), rs = reste('tamis');
  s += '<path d="M-60,-28 C-56,-8 -32,0 0,0 C32,0 56,-8 60,-28 Z" fill="' + G('boisV') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + T('M-48,-14 Q0,0 48,-14', '#6b3d1f', 1.8, ' opacity=".6"') + reflet('M-50,-22 q8,12 22,16', 3, .3) +
    Ell(0, -28, 60, 15, G('boisC')) + '<clipPath id="clipBol"><ellipse cx="0" cy="-27" rx="53" ry="11.5"/></clipPath><ellipse cx="0" cy="-27" rx="53" ry="11.5" fill="#5a3418" stroke="' + K + '" stroke-width="2"/><ellipse cx="4" cy="-24" rx="40" ry="7" fill="#7d4a26" opacity=".7"/>' +
    '<g clip-path="url(#clipBol)">' + fenteSvg('tamis', 'sortie') + '</g>';
  /* le tamis : un cercle de bois, une toile de crin */
  s += '<g class="agit" id="tamisG"><g id="tamisT">' + '<path d="M-50,-62 V-48 A44,12 0 0 0 38,-48 V-62 Z" fill="' + G('bois') + '" stroke="' + K + '" stroke-width="3.6" stroke-linejoin="round"/>' + T('M-50,-55 A44,12 0 0 0 38,-55', '#6b3d1f', 1.6, ' opacity=".7"') + Cir(-6, -45, 2.4, '#f5c45a', ' stroke-width="1.2"') +
    Ell(-6, -62, 44, 12, G('boisC'), ' stroke-width="3.6"') + '<clipPath id="clipTamis"><ellipse cx="-6" cy="-62" rx="37" ry="8.6"/></clipPath><ellipse cx="-6" cy="-62" rx="37" ry="8.6" fill="#efe3c2" stroke="' + K + '" stroke-width="2"/>' +
    '<g clip-path="url(#clipTamis)">' + T('M-46,-70 l80,16 M-46,-64 l80,16 M-46,-76 l80,16 M-46,-58 l80,16 M-46,-54 l80,-16 M-46,-60 l80,-16 M-46,-48 l80,-16 M-46,-66 l80,-16', '#b8a476', 1.1) + (rs ? '<g transform="translate(-6,-62) scale(.7)">' + forme('hache', rs) + '</g>' : '') + '</g>' +
    fenteSvg('tamis', 'entree') + '</g></g>';
  return '<rect class="rond" x="-70" y="-88" width="140" height="106" rx="18"/>' + s + '<rect x="-70" y="-86" width="140" height="100" fill="transparent"/>';
};
/* La cruche de grès, pleine d'eau fraîche */
ART.cruche = function(){
  var s = ombre(4, 6, 36, 8, .42);
  s += '<g class="leve" id="crucheG"><g id="crucheT">' + TT('M18,-80 C46,-80 46,-34 24,-28', '#8fa6c0', 7, 5) +
    '<path d="M-23,-6 C-36,-30 -32,-64 -15,-76 L-13,-94 L13,-94 L15,-76 C32,-64 36,-30 23,-6 Q0,3 -23,-6 Z" fill="' + G('gres') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + P('M-13,-94 L-25,-99 L-17,-84 Z', G('gres'), ' stroke-width="3.2"') +
    '<path d="M0,-71 C-10,-57 -12,-52 -12,-47 A12,12 0 0 0 12,-47 C12,-52 10,-57 0,-71 Z" fill="#4f9be0" stroke="#2f5f9a" stroke-width="2.4" stroke-linejoin="round"/><path d="M-5,-49 q-1,6 5,8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/>' + '<text x="0" y="-17" font-size="17" font-weight="800" text-anchor="middle" font-family="Fredoka, system-ui, sans-serif" fill="#2f5f9a" letter-spacing="1">EAU</text>' +
    Ell(0, -94, 13, 4.2, '#4f9be0', ' stroke-width="3"') + '<ellipse cx="-3" cy="-95" rx="5" ry="1.4" fill="#fff" opacity=".6"/>' + reflet('M-22,-58 C-24,-44 -22,-28 -16,-16', 3.6, .45) + '</g></g>';
  return '<rect class="rond" x="-44" y="-110" width="96" height="128" rx="16"/>' + s + '<rect x="-44" y="-108" width="96" height="122" fill="transparent"/>';
};
/* L'huile de lin : une petite burette de verre (vide tant que la potion d'huile n'est pas faite) */
ART.huilier = function(){
  var plein = !!(S && S.faites.huile), d = 'M-13,0 L-15,-38 C-15,-48 -6,-50 -5,-58 L-5,-68 L5,-68 L5,-58 C6,-50 15,-48 15,-38 L13,0 Z', s = ombre(2, 5, 26, 7, .42);
  s += '<g class="leve" id="huilierG"><g id="huilierT"><g transform="scale(1.3)">' + '<clipPath id="clipHuile"><path d="' + d + '"/></clipPath>' + (plein ? '<g clip-path="url(#clipHuile)"><rect x="-18" y="-34" width="36" height="36" fill="#f2b630"/><ellipse cx="0" cy="-34" rx="15" ry="3" fill="#ffd86a"/></g>' : '') +
    '<path d="' + d + '" fill="rgba(220,245,255,.2)" stroke="' + K + '" stroke-width="2.8" stroke-linejoin="round"/>' + R(-6, -78, 12, 11, 3, '#d9a066', ' stroke-width="2.2"') + reflet('M-10,-36 l1,22', 2.2, .55) + '</g>' +
    /* l'étiquette, pendue au goulot par une ficelle */
    T('M4,-84 Q20,-92 30,-74', '#e8d9b0', 2.2) + '<g transform="rotate(5 38 -60)">' + R(12, -76, 54, plein ? 24 : 38, 4, '#fff6d8', ' stroke-width="2.6"') + Cir(19, -69, 2.2, '#8a5a12', ' stroke-width="1"') +
    '<text x="41" y="-58" font-size="16" font-weight="800" text-anchor="middle" font-family="Fredoka, system-ui, sans-serif" fill="#8a5a12">Huile</text>' +
    (plein ? '' : '<text x="39" y="-43" font-size="13" font-weight="700" font-style="italic" text-anchor="middle" font-family="Fredoka, system-ui, sans-serif" fill="#9a8f80">vide</text>') + '</g></g></g>';
  return '<rect class="rond" x="-32" y="-114" width="104" height="130" rx="14"/>' + s + '<rect x="-32" y="-112" width="104" height="126" fill="transparent"/>';
};
/* Le bocal à filtrer : une étamine tendue sur un bocal de verre, tenue par une ficelle */
ART.filtre = function(){
  var sor = ici('filtre', 'sortie'), rs = reste('filtre'), jd = 'M-42,-6 L-42,-70 Q-42,-80 -32,-82 L32,-82 Q42,-80 42,-70 L42,-6 A42,12 0 0 1 -42,-6 Z', s = ombre(4, 6, 50, 10, .45);
  s += '<clipPath id="clipBocal"><path d="' + jd + '"/></clipPath><g clip-path="url(#clipBocal)"><rect id="bocalLiq" x="-46" y="' + (sor ? -40 : 8) + '" width="92" height="' + (sor ? 50 : 0) + '" fill="' + (sor ? sor.c : '#f2b630') + '"/>' + (sor ? '<ellipse cx="0" cy="-40" rx="42" ry="9" fill="' + clair(sor.c, .4) + '"/>' : '') + '</g>' +
    '<path d="' + jd + '" fill="rgba(220,245,255,.2)" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + reflet('M-33,-66 V-14', 4.5, .45) + reflet('M-24,-64 V-44', 2.4, .3);
  /* l'étamine : elle se creuse au milieu, et pend tout autour */
  s += '<g class="agit">' + '<path d="M-48,-84 C-46,-66 -40,-62 -34,-68 C-28,-58 -18,-60 -12,-66 C-4,-56 6,-58 12,-66 C20,-58 30,-58 34,-68 C40,-62 46,-66 48,-84 Z" fill="#ece4cc" stroke="' + K + '" stroke-width="3.4" stroke-linejoin="round"/>' +
    Ell(0, -84, 48, 13, G('linge'), ' stroke-width="3.4"') + '<ellipse cx="0" cy="-82" rx="30" ry="7" fill="#e2d8ba"/>' + '<clipPath id="clipEtamine"><ellipse cx="0" cy="-84" rx="45" ry="11"/></clipPath><g clip-path="url(#clipEtamine)">' +
    T('M-50,-96 l100,22 M-50,-88 l100,22 M-50,-80 l100,22 M-50,-104 l100,22 M-50,-72 l100,-22 M-50,-64 l100,-22 M-50,-80 l100,-22 M-50,-56 l100,-22', '#cfc3a0', 1) + (rs ? '<g transform="translate(0,-83) scale(.8,.62)">' + forme('hache', rs) + '</g>' : '') + '</g>' +
    T('M-46,-76 Q0,-62 46,-76', '#c9483f', 3) + T('M40,-74 l10,10 M40,-74 l2,13', '#c9483f', 2.6) + fenteSvg('filtre', 'entree') + '</g>';
  return '<rect class="rond" x="-58" y="-106" width="116" height="124" rx="18"/>' + s + '<rect x="-58" y="-104" width="116" height="118" fill="transparent"/>';
};
/* La planche à hacher et son grand couteau */
ART.planche = function(){
  var s = ombre(0, 16, 116, 12, .4);
  s += '<path d="M-108,6 L108,6 L108,17 L-108,17 Z" fill="' + G('boisS') + '" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' + P('M-108,6 L108,6 L94,-58 L-94,-58 Z', G('boisH')) +
    T('M-96,-10 Q0,-4 100,-12 M-90,-30 Q0,-24 96,-32 M-88,-46 Q0,-42 92,-48', '#b9824e', 1.6, ' opacity=".7"') + T('M-60,-18 l26,-6 M-46,-8 l30,-9 M-30,-34 l22,-4 M-66,-36 l18,-7 M-18,-14 l24,-3', 'rgba(90,50,20,.45)', 1.4) + '<ellipse cx="86" cy="-44" rx="6" ry="4" fill="#3a2010" stroke="' + K + '" stroke-width="2"/>';
  s += fenteSvg('planche', 'entree');
  /* le couteau : au repos, couché au fond de la planche */
  s += '<g class="agit" id="couteau"><g id="couteauT" transform="translate(52,-50) rotate(-3)">' + '<path d="M-6,-10 L-110,-10 Q-126,-9 -134,-3 Q-96,15 -6,14 Z" fill="' + G('acier') + '" stroke="' + K + '" stroke-width="3.4" stroke-linejoin="round"/>' + '<path d="M-6,-10 L-110,-10 Q-126,-9 -134,-3 L-124,-4 Q-118,-5 -108,-5 L-6,-5 Z" fill="#7f8a99" opacity=".85"/>' + '<path d="M-8,13 Q-96,14 -132,-3 Q-98,6 -8,6 Z" fill="#ffffff" opacity=".92"/>' + T('M-8,6 Q-98,6 -130,-3', '#9aa6b4', 1.2, ' opacity=".8"') +
    R(-8, -12, 9, 26, 2, '#b8b4c8', ' stroke-width="3"') + R(0, -9, 56, 19, 8, '#5a3418', ' stroke-width="3.4"') + Cir(14, 0, 2.6, '#f5c45a', ' stroke-width="1"') + Cir(32, 0, 2.6, '#f5c45a', ' stroke-width="1"') + reflet('M6,-5 H48', 2, .3) + '</g></g>';
  return '<rect class="rond" x="-118" y="-74" width="236" height="100" rx="18"/>' + s + '<rect x="-116" y="-72" width="232" height="94" fill="transparent"/>';
};
/* ---------- Le grand linge de la cueillette, et les plantes couchées dessus ---------- */
var LINGE = {X:238, y0:374, y1:536};
function quadPlat(X, a, b){ return 'M' + f1(xP(-X, b)) + ',' + b + ' L' + f1(xP(X, b)) + ',' + b + ' L' + f1(xP(X, a)) + ',' + a + ' L' + f1(xP(-X, a)) + ',' + a + ' Z'; }
function lingeScene(){
  var C = LINGE, q = quadPlat(C.X, C.y0, C.y1), q2 = quadPlat(C.X - 12, C.y0 + 8, C.y1 - 9), q3 = quadPlat(C.X - 18, C.y0 + 12, C.y1 - 13), s = ombre(604, 466, 250, 80, .3), i, Rn = rng(5);
  s += '<path d="' + quadPlat(C.X + 1, C.y0 + 4, C.y1 + 4) + '" fill="#cfc3a0" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/><clipPath id="clipLinge"><path d="' + q + '"/></clipPath>' + P(q, G('linge'), ' stroke-width="3.5"') + '<g clip-path="url(#clipLinge)" pointer-events="none">';
  /* la trame du lin, de doux plis, deux liserés rouges */
  for(i = 0; i < 22; i++){ var y = C.y0 + (i + .5)*(C.y1 - C.y0)/22; s += '<path d="M' + f1(xP(-C.X, y)) + ',' + f1(y) + ' H' + f1(xP(C.X, y)) + '" stroke="#d9cfb0" stroke-width="1" opacity=".5"/>'; }
  for(i = -9; i <= 9; i++) s += '<path d="M' + f1(xP(i*26, C.y0)) + ',' + C.y0 + ' L' + f1(xP(i*26, C.y1)) + ',' + C.y1 + '" stroke="#d9cfb0" stroke-width="1" opacity=".4"/>';
  s += T('M420,430 q60,14 120,-2 M640,420 q50,12 110,4 M460,516 q80,-12 150,2 M660,508 q60,-10 120,6', '#c9bd98', 2, ' opacity=".55"') + T('M421,432 q60,14 120,-2 M641,422 q50,12 110,4', '#fff', 1.4, ' opacity=".6"');
  s += '<path d="' + q2 + '" fill="none" stroke="#c9483f" stroke-width="3" opacity=".8"/><path d="' + q3 + '" fill="none" stroke="#c9483f" stroke-width="1.2" opacity=".8"/>';
  s += '</g>';
  /* les sept places : une plante cueillie y est couchée ; sinon, un rond brodé qui l'attend */
  ORDRE_PL.forEach(function(k){ s += '<g class="plante" id="plante-' + k + '" data-act="plante" data-k="' + k + '" tabindex="0" role="button"></g>'; });
  return s;
}
function majPlantes(){
  ORDRE_PL.forEach(function(k){
    var g = $('#plante-' + k); if(!g) return; var q = PLACE[k], p = PL[k], la = S.dispo[k] > 0, fait = !!S.faites[p.potion], c = centrePlante(k), s = '', choisie = S.plante === k && !!S.partie;
    /* (une plante cueillie attend d'abord sur la tringle : majPendues ; sa potion faite, elle est partie) */
    if(!la || fait || !(S.posees[k] || S.plante === k)){ g.innerHTML = ''; g.setAttribute('class', 'plante'); g.removeAttribute('aria-label'); return; }
    s += '<ellipse class="rond" cx="' + q[0] + '" cy="' + (c.y + 4) + '" rx="54" ry="42"/>' + '<ellipse cx="' + (q[0] + 3) + '" cy="' + (q[1] - 2) + '" rx="40" ry="7" fill="rgba(60,40,20,.2)"/>';
    s += '<g class="corps" transform="translate(' + q[0] + ',' + q[1] + ') scale(' + SP + ',' + (SP*APLAT).toFixed(3) + ') translate(-130,-' + q[2] + ')">' + PLD.corps(k) + '</g>';
    s += '<rect class="prise" x="' + (q[0] - 50) + '" y="' + (c.y - 40) + '" width="100" height="86" fill="transparent"/>';
    g.innerHTML = s;
    g.setAttribute('class', 'plante' + (la && !fait ? ' dispo' : '') + (fait ? ' faite' : '') + (S.mode === 'plante' && S.plante === k ? ' zoom' : '') + (choisie ? ' choisie' + (S.ou === 'linge' ? ' partie-sur-linge' : '') : ''));
    g.setAttribute('aria-label', p.nom + (fait ? ' : sa potion est faite' : ''));
    if(choisie){ var pa = g.querySelector('.pl-pa[data-pa="' + S.partie + '"]'); if(pa) pa.classList.add(S.ou === 'linge' ? 'pl-sel' : 'pl-pris'); }
    /* dans le gros plan, on touche les parties, pas la plante entière */
    var pr = g.querySelector('.prise'); if(pr && S.mode === 'plante' && S.plante === k) pr.remove();
  });
}

/* ---------- Tout l'établi ---------- */
var OUTILS_SC = ['alambic', 'marmite', 'presse', 'sechoir', 'fiole', 'mortier', 'tamis', 'filtre', 'planche'];
function majOutil(o){ var g = $('#g-' + o); if(g) g.innerHTML = ART[o](); }
function majTout(){ OUTILS_SC.forEach(majOutil); ['buches', 'allumettes', 'cruche', 'huilier'].forEach(majOutil); majPlantes(); majPendues(); majEtagere(); majLivre(); }
function majLivre(){ var g = $('#gLivre'); if(g) g.innerHTML = ART.livre(); }
function dessinerScene(){
  var s = defsEtabli() + '<clipPath id="clipFour"><path d="M-34,3 V-28 A34,24 0 0 1 34,-28 V3 Z"/></clipPath>' + mur() + decorMur() + etagereScene() + plateau();
  function outil(o, nom){ return gT(o, '', ' id="g-' + o + '" class="outil" data-act="outil" data-o="' + o + '" tabindex="0" role="button" aria-label="' + nom + '"'); }
  function porte(o, h, nom){ return gT(o, '', ' id="g-' + o + '" class="porte" data-act="porte" data-h="' + h + '" tabindex="0" role="button" aria-label="' + nom + '"'); }
  /* du fond vers le devant */
  s += porte('buches', 'buche', NOMS_O.buche) + outil('alambic', NOMS_O.alambic) + outil('marmite', NOMS_O.marmite) +
    gT('livre', ART.livre(), ' id="gLivre" data-act="livre" tabindex="0" role="button" aria-label="Le grimoire : les potions de la brume"') +
    outil('presse', NOMS_O.presse) + outil('sechoir', NOMS_O.sechoir) + outil('fiole', NOMS_O.fiole) + '<g id="pendues"></g>';   /* (les plantes pendues : par-dessus le haut des outils du fond, pour qu'on les touche bien) */
  s += porte('allumettes', 'allumette', NOMS_O.allumette) + outil('mortier', NOMS_O.mortier) + outil('tamis', NOMS_O.tamis) + lingeScene() + porte('cruche', 'cruche', NOMS_O.cruche) + porte('huilier', 'huilier', NOMS_O.huilier) + outil('filtre', NOMS_O.filtre);
  s += outil('planche', NOMS_O.planche);
  /* de la poussière dorée dans la lumière de la lanterne, puis ce qui vole, les effets, le bord sombre */
  s += '<g fill="#ffe9a3" pointer-events="none"><circle class="poussiere" cx="120" cy="250" r="2"/><circle class="poussiere p2" cx="170" cy="210" r="1.6"/><circle class="poussiere p3" cx="90" cy="290" r="1.8"/><circle class="poussiere p2" cx="250" cy="170" r="1.4"/><circle class="poussiere p3" cx="640" cy="200" r="1.5"/><circle class="poussiere" cx="700" cy="230" r="1.3"/></g>';
  s += '<g id="vol"></g><g id="effets"></g><rect x="-1900" y="-1800" width="5000" height="4000" fill="' + G('vignette') + '" pointer-events="none"/>';
  $('#scene').innerHTML = s;
  majTout();
}
