
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
    J('tete', '<g data-souple="queue"></g>');
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
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, '#c9a35a') + rep('tete', 124, 40) + rep('teteC', 128, 60) + rep('nez', 152, 66)) + col(d, 124, 58, capu));
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
    ].concat(lk.fille ? [{nom:'queue', type:'meche', pts:[[98, 42], [84, 50], [74, 64], [68, 80], [64, 98]], larg:[10, 11, 10, 7, 2], k:30, c:3.6, g:500,
      f:d.g(ch[1]), traits:[[ch[0], 2.4, .8, -.25], [ch[2], 2, .6, .3]], noeud:'#2f8050'}] : []);
  return {svg:d.svg(corps, grain), souples:so};
}
