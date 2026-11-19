
/* ---------- des morceaux communs aux trois héros ---------- */
function jambe(d, c, pant, bt, deco){
  var x = SQ['cuisse' + c][0], k = c === 'A' ? .16 : 0, p = sombre(pant, k), b = sombre(bt, k);
  return J('cuisse' + c, seg(x, 172, 224, 22, 18, d.gh(p)) + L('M' + (x + 6) + ' 180 L ' + (x + 5) + ' 218', LUNE, 1.6, ' opacity="' + (c === 'A' ? .15 : .35) + '"') +
    J('tibia' + c, seg(x, 222, 272, 18, 15, d.gh(p)) + L('M' + (x - 3) + ' 230 L ' + (x - 2) + ' 266', sombre(p, .4), 1.6) + (deco ? deco(x, k) : '') +
      J('pied' + c, botte(d, x, b) + rep('cheville' + c, x, 272) + rep('orteil' + c, x + 24, 290))));
}
function epaulette(x, y, c){ return E(x, y, 9, 8, c, ' stroke="' + O + '" stroke-width="3"'); }
/* la flèche, dessinée de l'encoche (0, 0) à la pointe (124, 0) */
function flecheDessin(){
  return '<g data-feu style="display:none">' + E(118, 0, 18, 9, '#ff9a2a', ' opacity=".45"') +
      F('M108 0 C 112 -14 124 -16 128 -26 C 132 -12 140 -8 136 0 C 132 8 114 8 108 0 Z', '#ff7a1a', ' stroke="' + O + '" stroke-width="2"') +
      F('M114 0 C 118 -8 124 -10 127 -16 C 130 -8 134 -4 131 0 C 128 4 118 4 114 0 Z', '#ffd84a') + '</g>' +
    L('M0 0 L 112 0', O, 6) + L('M0 0 L 112 0', '#d9b46a', 2.6) + L('M10 -0.6 L 100 -0.6', '#fff2c8', 1, ' opacity=".6"') +
    P('M125 0 L 110 -6.5 L 112 0 L 110 6.5 Z', '#c8d2e4', ' stroke-width="2.4"') + L('M113 -2 L 121 0', '#fff', 1.2) +
    P('M6 -1 L -7 -9 L -3 0 Z', '#e04a3a', ' stroke-width="2.2"') + P('M6 1 L -7 9 L -3 0 Z', '#e04a3a', ' stroke-width="2.2"') +
    '<g data-huile style="display:none">' + E(118, 3, 6, 4, '#2a2418', ' stroke="' + O + '" stroke-width="1.6"') + E(117, 9, 2.2, 3.4, '#3a3020') + C(116, 1, 1.4, '#c8b88a') + '</g>' +
    '<g data-colle style="display:none">' + E(117, 0, 8, 6, '#f2f6e8', ' stroke="' + O + '" stroke-width="1.6"') + L('M112 5 Q 110 12 113 16 M120 5 Q 122 11 120 14', '#e8f0d8', 1.6) + C(119, -2, 1.6, '#fff') + '</g>' +
    flechesSpeciales();
}

/* ============ les cheveux sous la capuche, la barbe (Romain, 17 novembre : « tout ce qui est dans l'écran de création, sauf les
   habits […] pour qu'on retrouve son personnage ») ============
   Les seize coiffures de l'écran de création (persos.js, COIFFURES), vues de trois quarts sous la capuche : ce qui dépasse sur le
   front et le long de la joue (dessiné entre le visage et la capuche), une bosse de la capuche (le chignon), une houppe qui sort
   de la capuche, et ce qui pend (des mèches souples : la queue de cheval, les tresses, les couettes, les cheveux longs, la queue de
   samouraï). Les barbes (courte, longue, moustache) : jamais pour un enfant. Sans coiffure donnée : celle du héros de ce rôle. */
var COIFF_F = ['queue', 'tresses', 'carre', 'longs', 'chignon', 'couettes', 'courte', 'tresse_c'];
var COIFF_M = ['epis', 'court', 'meche', 'boucles', 'arriere', 'catogan', 'milong', 'degarni'];
var COIFF_DEF = {pisteur:{f:'queue', m:'epis'}, alchimiste:{f:'chignon', m:'boucles'}, sage:{f:'tresses', m:'milong'}, barde:{f:'longs', m:'meche'}};
function coiffureDe(role, lk){
  var l = lk.fille ? COIFF_F : COIFF_M;
  return l.indexOf(lk.coiffure) >= 0 ? lk.coiffure : COIFF_DEF[role][lk.fille ? 'f' : 'm'];
}
function barbeDe(lk){ return !lk.fille && lk.age !== 'enfant' && ['courte', 'longue', 'moustache'].indexOf(lk.barbe) >= 0 ? lk.barbe : null; }
/* un point de la tête, pour une mèche souple : la tête d'un enfant est plus grosse (ECHELLE_TETE, autour du cou) */
function pT(p){ return ECHELLE_TETE === 1 ? p : [r1(124 + (p[0] - 124) * ECHELLE_TETE), r1(98 + (p[1] - 98) * ECHELLE_TETE)]; }
/* ce qui dépasse de la capuche, sur le front et le long de la joue (entre le visage et la capuche) */
function cheveux(d, cx, cy, ch, co, capu){
  var g = d.g(ch[1]), haut = ' L 36 -22 C 28 -40 -8 -45 -30 -28 Z';   /* (le haut est caché sous le bord de la capuche) */
  var fr = function(bas, reflets){
    return P(T(bas + haut, cx, cy), g) + (reflets || []).map(function(r){ return L(T(r, cx, cy), ch[0], 1.8, ' opacity=".75"'); }).join('');
  };
  var boucle = function(x, y, r){ return C(cx + x, cy + y, r, g, ' stroke="' + O + '" stroke-width="2.6"') + L(T('M' + (x - r * .4) + ' ' + (y - r * .2) + ' Q ' + x + ' ' + (y - r * .7) + ' ' + (x + r * .4) + ' ' + (y + r * .1), cx, cy), ch[0], 1.4, ' opacity=".8"'); };
  var cote = function(bas){ return P(T('M-31 -22 L -31 ' + bas + ' Q -24 ' + (bas + 6) + ' -17 ' + (bas - 1) + ' C -15 ' + (bas - 14) + ' -17 -6 -14 -18 Z', cx, cy), g) +
    L(T('M-25 -16 C -25 -2 -25 ' + (bas - 10) + ' -23 ' + (bas - 2), cx, cy), ch[0], 1.6, ' opacity=".7"'); };
  switch(co){
    case 'carre': return fr('M-31 -24 L -31 22 Q -24 25 -15 22 L -15 -8 Q 6 -5 30 -10 L 33 -16', ['M-25 -18 L -25 16', 'M-6 -25 Q 8 -23 22 -17']);
    case 'longs': return cote(28) + meche(d, cx, cy, ch);
    case 'courte': return fr('M-29 -24 L -29 -2 Q -25 2 -20 -4 Q -18 -12 -14 -16 C -8 -10 0 -14 4 -18 C 10 -12 20 -14 32 -16', ['M-20 -26 Q -8 -22 4 -24']);
    case 'chignon': case 'catogan':
      /* (le chignon fait une bosse sous la capuche, derrière la tête) */
      return (co === 'chignon' ? E(cx - 47, cy - 38, 14, 12, d.g(capu), ' stroke="' + O + '" stroke-width="3" transform="rotate(-30 ' + (cx - 47) + ' ' + (cy - 38) + ')"') : '') +
        fr('M-29 -22 C -22 -27 -6 -31 8 -32 C 18 -32 28 -28 34 -22', ['M-2 -31 Q -14 -30 -24 -24', 'M14 -30 Q 2 -33 -14 -29']);
    case 'tresse_c':
      return fr('M-29 -22 C -22 -27 -6 -31 8 -32 C 18 -32 28 -28 34 -22') +
        [[-20, -25], [-12, -28.5], [-3, -30.5], [6, -31.5], [15, -30.5], [23, -28]].map(function(p){
          return E(cx + p[0], cy + p[1], 5.6, 4.4, g, ' stroke="' + O + '" stroke-width="2.2"') + L(T('M' + (p[0] - 2) + ' ' + (p[1] - 2) + ' Q ' + p[0] + ' ' + (p[1] + 1) + ' ' + (p[0] + 2) + ' ' + (p[1] - 2), cx, cy), ch[0], 1.3, ' opacity=".8"');
        }).join('');
    case 'epis': return fr('M-29 -24 L -27 -12 L -19 -22 L -12 -9 L -4 -20 L 2 -8 L 8 -19 L 15 -9 L 20 -19 L 27 -11 L 31 -18', ['M-16 -24 L -12 -14', 'M4 -24 L 8 -16']);
    case 'court': return fr('M-29 -24 C -27 -14 -21 -10 -17 -16 C -15 -8 -9 -8 -6 -14 C -2 -6 4 -8 6 -14 C 10 -6 16 -8 18 -14 C 22 -8 28 -10 31 -16', ['M-10 -20 L -12 -11', 'M14 -20 L 16 -12']) +
      L(T('M-2 -30 Q 2 -36 8 -38', cx, cy), ch[2], 2);
    case 'meche': return fr('M-29 -24 C -29 -8 -20 6 -6 9 C -12 0 -11 -10 -2 -16 C 6 -12 18 -14 32 -16', ['M-24 -18 C -22 -6 -16 2 -8 6', 'M2 -24 Q 14 -20 24 -18']);
    case 'boucles': return boucle(-25, -4, 6) + boucle(-24, 8, 5.5) +
      fr('M-29 -24 C -33 -16 -27 -8 -21 -12 C -23 -4 -13 -2 -11 -10 C -9 -2 1 -2 1 -10 C 3 -4 11 -4 12 -12 C 15 -6 23 -8 23 -14 C 27 -10 33 -14 32 -20', ['M-14 -22 Q -11 -18 -8 -21', 'M4 -24 Q 7 -20 10 -23']);
    case 'arriere': return fr('M-29 -24 C -22 -25 -10 -27 0 -29 C 8 -25 14 -19 20 -21 C 26 -23 30 -25 33 -21', ['M-18 -26 Q -6 -28 4 -28']);
    case 'milong': return fr('M-31 -24 L -31 22 Q -23 26 -15 20 C -13 8 -14 -8 -4 -20 Q 2 -27 6 -31 Q 16 -22 32 -16', ['M-23 -20 C -23 0 -23 10 -21 18', 'M8 -28 Q 18 -22 26 -18']);
    case 'degarni': return P(T('M-31 -14 L -31 14 Q -25 18 -19 12 Q -21 0 -19 -12 Q -25 -16 -31 -14 Z', cx, cy), g) + L(T('M-26 -10 L -26 10', cx, cy), ch[0], 1.4, ' opacity=".7"');
    default: return meche(d, cx, cy, ch);   /* queue, tresses, couettes : la frange d'avant */
  }
}
/* ce qui sort de la capuche, par-dessus son bord (la houppe) */
function cheveuxDessus(d, cx, cy, ch, co){
  if(co === 'arriere') return P(T('M10 -30 C 18 -44 36 -46 42 -32 C 36 -36 28 -36 24 -28 Z', cx, cy), d.g(ch[1])) + L(T('M18 -36 Q 28 -42 36 -38', cx, cy), ch[0], 1.6, ' opacity=".8"');
  if(co === 'epis') return P(T('M10 -36 L 16 -48 L 20 -37 L 30 -46 L 28 -34 L 38 -38 L 32 -27 Z', cx, cy), d.g(ch[1]));
  return '';
}
/* ce qui pend : une mèche souple dans le dos (chDos, derrière le corps) et une devant (chDev, par-dessus l'épaule) */
function souplesCheveux(d, ch, co, noeud){
  var f = d.g(ch[1]), tr = [[ch[0], 2.4, .8, -.25], [ch[2], 2, .6, .3]], l = [];
  var m = function(nom, pts, larg, nd, o){ o = o || {};
    l.push({nom:nom, type:'meche', pts:pts.map(pT), larg:larg.map(function(w){ return r1(w * ECHELLE_TETE); }), k:o.k || 30, c:o.c || 3.6, g:o.g || 500, f:f, traits:tr, noeud:nd || undefined, rNoeud:o.r}); };
  var t = function(nom, pts, n){ l.push({nom:nom, type:'tresse', pts:pts.map(pT), n:n, pasT:15, k:nom === 'chDos' ? 40 : 46, c:nom === 'chDos' ? 3.4 : 3.6, g:450, f:f, trait:ch[0], bout:noeud}); };
  if(co === 'queue') m('chDos', [[98, 42], [84, 50], [74, 64], [68, 80], [64, 98]], [10, 11, 10, 7, 2], noeud);
  if(co === 'catogan') m('chDos', [[96, 40], [84, 44], [75, 52], [69, 63]], [8, 9, 7, 2], noeud, {r:4});
  if(co === 'tresses'){ t('chDos', [[86, 92], [82, 120], [78, 148], [74, 176]], 6); t('chDev', [[106, 92], [105, 116], [104, 140], [103, 164]], 5); }
  if(co === 'couettes'){ m('chDos', [[90, 56], [78, 64], [70, 76], [66, 90]], [9, 10, 8, 2], noeud, {r:4}); m('chDev', [[104, 80], [102, 94], [99, 108], [97, 120]], [8, 9, 7, 2], noeud, {r:4}); }
  if(co === 'longs'){ m('chDos', [[94, 50], [84, 72], [78, 100], [74, 128], [72, 150]], [14, 16, 15, 12, 4], null, {k:26, c:3.2}); m('chDev', [[103, 84], [99, 100], [103, 116], [99, 132], [102, 146]], [8, 11, 11, 8, 2], null, {k:28}); }
  return l;
}
/* la pointe de la capuche (l'Alchimiste ; le Sage, quand rien ne pend dans son dos) */
function pointeCapuche(d, capu, or){
  return {nom:'pointe', type:'meche', pts:[[92, 6], [78, 2], [64, 6], [54, 16], [48, 30]].map(pT), larg:[14, 11, 8, 5, 2].map(function(w){ return r1(w * ECHELLE_TETE); }), k:34, c:3.4, g:450,
    f:d.g(capu), traits:[[sombre(capu, .45), 1.6, .8, -.15]], noeud:or, pompon:true, rNoeud:4.5};
}
/* la barbe (sous la bouche : la bouche reste par-dessus), la moustache (par-dessus la bouche) */
function barbe(d, cx, cy, ch, b, dessus){
  if(dessus) return P(T('M6 19 C 8 14 14 13 18 16 C 21 13 26 14 27 18 C 24 17 21 18 18 19 C 14 18 10 19 6 19 Z', cx, cy), d.g(ch[1]), ' stroke-width="2.2"');
  if(b !== 'courte' && b !== 'longue') return '';
  var bas = b === 'longue' ? 'C -20 32 -6 48 7 50 C 15 44 23 34 27 20' : 'C -22 28 -8 37 4 37 C 12 37 22 32 27 20';
  return P(T('M-21 -2 L -25 12 ' + bas + ' L 24 17 C 20 24 13 28 6 28 C -4 28 -12 22 -16 10 L -17 -2 Z', cx, cy), d.g(ch[1]), ' stroke-width="2.4"') +
    L(T(b === 'longue' ? 'M-6 32 Q -2 42 4 50 M8 32 Q 10 40 10 48' : 'M-6 30 Q -4 33 -1 34 M10 30 Q 12 32 15 31', cx, cy), ch[0], 1.4, ' opacity=".75"');
}

/* ============ le Pisteur ============ */
function pisteur(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var vert = '#3b7f54', capu = '#2d6a46', cuir = '#8e5a36', cuirF = '#5a361f', pant = '#4c3c38', bt = '#74482a';
  var B = '';
  /* couche 0 : la cape, le carquois, la queue de cheval */
  var c0 = '<g data-souple="cape"></g>' +
    P('M70 64 L 92 56 L 116 138 L 94 146 Z', d.g('#7c4a28')) + L('M80 61 L 103 141', cuirF, 2) +
    L('M73 74 L 95 66 M95 128 L 112 122', '#c9a35a', 3) + couture('M76 70 L 98 140', '#d8aa76') +
    '<g data-carquois>' + P('M70 52 L 64 42 L 76 46 Z', '#e04a3a') + P('M80 48 L 76 36 L 86 42 Z', '#f3e7cb') + P('M90 46 L 88 34 L 97 42 Z', '#e04a3a') +
    L('M72 60 L 72 50 M82 58 L 81 46 M92 56 L 92 44', '#7a5a3a', 2) + '</g>' + carquoisArgent(d) + carquoisLourd(d) +
    J('tete', '<g data-souple="chDos"></g>');
  var co = coiffureDe('pisteur', lk);
  B += J('torse', c0);
  /* jambe loin */
  var genou = function(x, k){ return P('M' + (x - 10) + ' 224 L ' + (x + 10) + ' 222 L ' + (x + 11) + ' 238 L ' + (x - 9) + ' 240 Z', d.g(sombre(cuir, k))) + rivets([[x - 4, 230], [x + 5, 229]]); };
  B += jambe(d, 'A', pant, bt, genou);
  /* bras loin (derrière le corps) : il tient l'arc */
  var x = SQ.brasA[0];
  B += J('torse', J('brasA', seg(x, 106, 141, 17, 14, d.gh(vert)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', LUNE, 1.4, ' opacity=".4"') +
    J('avantBrasA', seg(x, 140, 179, 14.5, 12.5, d.gh(cuir)) + L('M' + (x - 7) + ' 150 L ' + (x + 7) + ' 150 M' + (x - 6.5) + ' 162 L ' + (x + 6.5) + ' 162', cuirF, 2) +
      J('mainA', main(d, x, 185, 8.5, pe[1])))));
  /* jambe proche */
  B += jambe(d, 'B', pant, bt, genou);
  /* la tunique sous la ceinture (tissu souple) */
  B += '<g data-souple="jupe"></g>';
  /* le corps : tunique, gilet de cuir cousu, ceinture, dague */
  B += J('torse', P('M98 98 Q 122 88 148 96 L 154 150 L 96 152 Q 92 124 98 98 Z', d.g(vert)) +
    P('M101 102 Q 124 94 147 100 L 151 148 L 99 150 Q 95 126 101 102 Z', d.g(cuir)) +
    F('M101 102 Q 106 100 112 100 L 108 150 L 99 150 Q 95 126 101 102 Z', sombre(cuir, .35), ' opacity=".8"') +
    P('M116 99 L 128 124 L 140 97 Z', d.g(vert)) + L('M120 106 L 134 110 M122 113 L 132 116 M134 106 L 121 111', '#efe0b8', 1.5) +
    couture('M105 108 Q 102 128 103 146', '#e0b484') + couture('M144 104 L 147 146', '#e0b484') +
    L('M150 101 L 153 148', LUNE, 2, ' opacity=".55"') +
    L('M106 100 L 150 146', O, 8) + L('M106 100 L 150 146', '#5e3a22', 4.5) + rivets([[114, 109], [126, 121], [138, 133]]) +
    L('M96 146 Q 124 154 154 144', O, 9) + L('M96 146 Q 124 154 154 144', '#5a361f', 5.5) + P('M119 144 L 131 144 L 131 155 L 119 155 Z', '#d9b46a') + L('M122 149 L 129 149', O, 2) +
    P('M98 152 L 114 152 L 114 168 Q 106 172 98 168 Z', d.g('#7a4a28')) + C(106, 157, 2, '#d9b46a', ' stroke="' + O + '" stroke-width="1"') +
    P('M150 152 L 168 182 L 174 179 L 156 149 Z', d.g('#4e2e18')) +
    '<g data-dague-ceinture>' + P('M144 147 L 150 137 L 155 140 L 149 150 Z', '#3a2a1a') + P('M141 148 L 156 146 L 157 151 L 142 153 Z', '#c9a35a') + '</g>' + amulette(d, 127, 115) + rep('amulette', 127, 115));
  /* devant : l'arc dans la main loin, la tête, le col */
  var arc = L('M126 103 Q 172 185 126 267', O, 11) + L('M126 103 Q 172 185 126 267', '#8a5a2e', 6) + L('M130 112 Q 166 185 130 258', '#d29a5a', 1.6) +
    P('M142 170 L 154 170 L 155 200 L 143 200 Z', d.g('#5a361f')) + L('M142 177 L 155 178 M142 185 L 155 186 M143 193 L 155 193', '#c9a35a', 1.3) +
    P('M121 98 L 129 101 L 128 109 L 122 106 Z', '#d9b46a') + P('M121 272 L 129 269 L 128 261 L 122 264 Z', '#d9b46a') +
    rep('arcH', 126, 103) + rep('arcB', 126, 267) + rep('poignee', 148, 180);
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk) + cheveux(d, 124, 58, ch, co, capu) + capuche(d, 124, 58, capu, '#c9a35a') + cheveuxDessus(d, 124, 58, ch, co) +
    rep('tete', 124, 40) + rep('teteC', 128, 60) + rep('nez', 152, 66)) + col(d, 124, 58, capu));
  B += J('torse', J('brasA', '<g class="haAv">' + seg(x, 106, 141, 17, 14, d.gh(vert)) + '</g>' +
      J('avantBrasA', '<g class="haAv">' + seg(x, 140, 179, 14.5, 12.5, d.gh(cuir)) + '</g>' +
        J('mainA', J('arc', arc, [148, 185]) + poing(d, x, 185, 8.5, pe[1])))));
  /* la corde et la flèche encochée (calculées à chaque image) */
  B += J('torse', '<path data-corde fill="none" stroke="#f3e7cb" stroke-width="1.8" stroke-linecap="round"/>' +
    '<g data-fleche style="display:none"><g data-fl>' + flecheDessin() + rep('flN', 0, 0) + rep('flP', 124, 0) + '</g></g>');
  /* bras proche : brassard, coudière ; la dague cachée dans la main */
  var xb = SQ.brasB[0];
  B += J('torse', J('brasB', seg(xb, 108, 143, 18, 15, d.gh(vert)) + L('M' + (xb + 5) + ' 112 L ' + (xb + 4) + ' 138', LUNE, 1.4, ' opacity=".45"') +
    J('avantBrasB', seg(xb, 142, 181, 15, 13, d.gh(vert)) + P('M' + (xb - 8) + ' 150 L ' + (xb + 8) + ' 150 L ' + (xb + 7.5) + ' 176 L ' + (xb - 7.5) + ' 176 Z', d.g(cuir)) +
      L('M' + (xb - 8) + ' 158 L ' + (xb + 8) + ' 158 M' + (xb - 7.5) + ' 168 L ' + (xb + 7.5) + ' 168', cuirF, 2) + couture('M' + (xb + 4) + ' 151 L ' + (xb + 4) + ' 175', '#e0b484') +
      epaulette(xb, 142, d.g(cuir)) + rivets([[xb - 2, 139], [xb + 3, 145]]) +
      J('mainB', '<g data-dague-main style="display:none">' +
          L('M' + (xb + 4) + ' 187 L ' + (xb + 44) + ' 187', O, 7) + F('M' + (xb + 6) + ' 183.5 L ' + (xb + 40) + ' 184 L ' + (xb + 48) + ' 187 L ' + (xb + 40) + ' 190 L ' + (xb + 6) + ' 190.5 Z', '#dfe6f2', ' stroke="' + O + '" stroke-width="2.4"') +
          L('M' + (xb + 9) + ' 186 L ' + (xb + 40) + ' 186', '#fff', 1.2, ' opacity=".8"') + P('M' + (xb + 3) + ' 179 L ' + (xb + 7) + ' 179 L ' + (xb + 7) + ' 195 L ' + (xb + 3) + ' 195 Z', '#c9a35a', ' stroke-width="2"') +
          L('M' + (xb - 10) + ' 187 L ' + (xb + 2) + ' 187', '#3a2a1a', 5) + rep('lame', xb + 46, 187) + '</g>' +
        poing(d, xb, 187, 8.5, pe[1]) + rep('pince', xb + 2, 184)))));
  /* la mèche de devant tombe par-dessus l'épaule et le bras proche */
  B += J('torse', J('tete', '<g data-souple="chDev"></g>'));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="52" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
      {nom:'cape', type:'tissu', dos:[[100, 100], [84, 152], [70, 208]], devant:[[118, 104], [108, 156], [98, 212]], k:60, c:3, g:420, vent:1,
        chemins:[{f:d.g(sombre(capu, .15)), contour:true}, {f:sombre(capu, .45), o:.7, zone:[0, .22, .06, 1]},
          {s:sombre(capu, .55), w:2, ligne:['u', .4, .1, .97]}, {s:sombre(capu, .5), w:1.6, ligne:['u', .7, .12, .98]},
          {s:'#c9a35a', w:1.4, o:.6, ligne:['v', .9, .03, .97], tirets:1}]},
      {nom:'jupe', type:'jupe', haut:[[96, 147], [153, 145]], bas:[[88, 190], [170, 188]], jambe:'cuisse', yJ:190, k:90, c:9,
        chemins:[{f:d.g(vert), contour:true}, {f:sombre(vert, .35), o:.8, zone:[0, .22, 0, 1]},
          {s:sombre(vert, .5), w:2, ligne:['u', .6, .06, .99]}, {s:clair(vert, .45), w:1.3, o:.75, ligne:['v', .86, .03, .97], tirets:1},
          {s:LUNE, w:1.8, o:.45, ligne:['u', .985, .05, .95]}]}
    ].concat(souplesCheveux(d, ch, co, '#2f8050'));
  return {svg:d.svg(corps, grain), souples:so};
}
