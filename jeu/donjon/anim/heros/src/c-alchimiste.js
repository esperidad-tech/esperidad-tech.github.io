
/* un gant ouvert (doigts écartés), au repos les doigts pointent vers le bas */
function gantOuvert(d, x, y, c){
  var s = '';
  [[-26, 10], [-6, 12.5], [14, 11.5], [32, 9]].forEach(function(f){ s += '<g transform="rotate(' + f[0] + ' ' + x + ' ' + y + ')">' + seg(x, y + 4, y + 4 + f[1], 5, 4.2, d.gh(c)) + '</g>'; });
  s += '<g transform="rotate(-78 ' + x + ' ' + y + ')">' + seg(x, y + 2, y + 12, 5.6, 4.6, d.gh(c)) + '</g>';
  return s + main(d, x, y, 8.5, c);
}
/* une fiole tenue droite au-dessus du poing (hx, hy) ; id pour changer sa couleur */
function fioleTenue(d, hx, hy, id, coul, k){
  k = k || 1;
  var t = function(p){ return T(p.replace(/(-?\d+(?:\.\d+)?)/g, function(v){ return +v * k; }), hx, hy); };
  d.defs.push('<radialGradient id="' + id + 'h"><stop offset="0" stop-color="#fff6c0" stop-opacity=".9"/><stop offset=".4" stop-color="' + coul + '" stop-opacity=".55"/><stop offset="1" stop-color="' + coul + '" stop-opacity="0"/></radialGradient>');
  return '<g data-fiole="' + id + '">' +
    '<circle data-halo cx="' + hx + '" cy="' + (hy - 20 * k) + '" r="' + (30 * k) + '" fill="url(#' + id + 'h)" opacity=".7"/>' +
    P(t('M-6 -38 L 6 -38 L 6 -30 C 18 -26 20 -10 10 -4 C 4 0 -4 0 -10 -4 C -20 -10 -18 -26 -6 -30 Z'), '#dff4ff', ' fill-opacity=".38"') +
    '<g data-liq class="haJ" style="transform-origin:' + hx + 'px ' + (hy - 2 * k) + 'px">' + F(t('M-15 -19 C -8 -23 8 -23 15 -19 C 16 -10 10 -4 0 -3 C -10 -4 -16 -10 -15 -19 Z'), coul, ' data-coul') +
      F(t('M-12 -17 C -6 -20 6 -20 12 -17 C 10 -14 -10 -14 -12 -17 Z'), '#fff', ' opacity=".35"') + '</g>' +
    '<g data-bulles></g>' +
    L(t('M-10 -26 Q -8 -31 -2 -32'), '#fff', 2.4 * k, ' opacity=".85"') + C(hx + 8 * k, hy - 12 * k, 1.6 * k, '#fff', ' opacity=".6"') +
    P(t('M-8 -44 L 8 -44 L 8 -37 L -8 -37 Z'), '#8a5a32', ' stroke-width="' + (2.6 * k) + '"') +
    rep(id + 'bec', hx, hy - 40 * k) + rep(id + 'c', hx, hy - 16 * k) + '</g>';
}

/* ============ l'Alchimiste ============ */
function alchimiste(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var pr = '#5e3a96', capu = '#4e2f86', cuir = '#7a5232', gant = '#5a3a26', pant = '#3e3448', bt = '#6e4428', or = '#d9b46a';
  var B = '', x = SQ.brasA[0], xb = SQ.brasB[0];
  /* couche 0 : les pans de la veste, la pointe de la capuche */
  B += J('torse', '<g data-souple="pans"></g>' + J('tete', '<g data-souple="pointe"></g>'));
  var genou = function(xx, k){ return k ? '' : P('M' + (xx - 10) + ' 224 L ' + (xx + 10) + ' 222 L ' + (xx + 11) + ' 238 L ' + (xx - 9) + ' 240 Z', d.g(cuir)) + rivets([[xx - 4, 230], [xx + 5, 229]]); };
  B += jambe(d, 'A', pant, bt, genou);
  /* bras loin, derrière le corps : manche violette, revers d'or, gant ouvert */
  var brasA = function(av){
    var w = av ? function(c){ return '<g class="haAv">' + c + '</g>'; } : function(c){ return c; };
    return J('brasA', w(seg(x, 106, 141, 17.5, 15, d.gh(pr)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', LUNE, 1.4, ' opacity=".45"')) +
      J('avantBrasA', w(seg(x, 140, 179, 15, 13, d.gh(pr)) + bande(x, 166, 16, 10, or)) +
        J('mainA', av ? '<g data-louche-main style="display:none">' + L('M' + (x + 4) + ' 187 L ' + (x + 42) + ' 187', O, 7.5) + L('M' + (x + 4) + ' 187 L ' + (x + 42) + ' 187', '#a8763e', 3.6) +
            P('M' + (x + 38) + ' 183 Q ' + (x + 50) + ' 202 ' + (x + 63) + ' 183 Z', d.g('#b9c2d0')) + L('M' + (x + 44) + ' 188 Q ' + (x + 50) + ' 194 ' + (x + 56) + ' 189', '#fff', 1.4, ' opacity=".7"') + rep('louche', x + 52, 196) + '</g>' +
            '<g data-fiole-main style="display:none">' + fioleTenue(d, x, 182, 'hfA' + (++uid), '#5fd08a', 0.78) + '</g>' +
            '<g data-herbes-main style="display:none">' + C(x + 2, 178, 12, '#8aff9a', ' opacity=".35" filter="' + d.flou(3) + '"') +
              P('M' + (x - 6) + ' 180 Q ' + (x - 2) + ' 166 ' + (x + 6) + ' 170 Q ' + (x + 2) + ' 178 ' + (x - 6) + ' 180 Z', '#5fd08a', ' stroke-width="2"') +
              P('M' + (x + 2) + ' 180 Q ' + (x + 12) + ' 168 ' + (x + 14) + ' 176 Q ' + (x + 8) + ' 182 ' + (x + 2) + ' 180 Z', '#8ae07a', ' stroke-width="2"') + '</g>' +
            '<g data-gantA="tient" style="display:none">' + poing(d, x, 185, 8.5, gant) + '</g><g data-gantA="ouvert">' + gantOuvert(d, x, 185, gant) + '</g>' + rep('mainA', x, 186)
          : gantOuvert(d, x, 185, gant))));
  };
  B += J('torse', brasA(false));
  B += jambe(d, 'B', pant, bt, genou);
  /* le tablier sous la ceinture (tissu souple qui pend entre les jambes) */
  B += '<g data-souple="tablier"></g>';
  /* le corps : veste matelassée, tablier de cuir roussi, bandoulière de fioles, ceinture, sacoche, petite marmite, louche */
  var band = [[112, 112, '#ff6a2a'], [121, 125, '#9aa3c8'], [130, 139, '#5fd08a']].map(function(v, i){
    return '<g data-band="' + i + '">' + P('M' + (v[0] - 4) + ' ' + (v[1] - 2) + ' L ' + (v[0] + 4) + ' ' + (v[1] - 2) + ' L ' + (v[0] + 5) + ' ' + (v[1] + 8) + ' Q ' + v[0] + ' ' + (v[1] + 12) + ' ' + (v[0] - 5) + ' ' + (v[1] + 8) + ' Z', v[2]) +
      P('M' + (v[0] - 3) + ' ' + (v[1] - 6) + ' L ' + (v[0] + 3) + ' ' + (v[1] - 6) + ' L ' + (v[0] + 3) + ' ' + (v[1] - 2) + ' L ' + (v[0] - 3) + ' ' + (v[1] - 2) + ' Z', '#8a5a32') +
      L('M' + (v[0] - 2) + ' ' + (v[1] + 1) + ' L ' + (v[0] - 2) + ' ' + (v[1] + 6), '#fff', 1.4, ' opacity=".7"') + '</g>';
  }).join('');
  B += J('torse', P('M100 102 Q 122 90 146 100 L 148 156 L 98 158 Q 92 128 100 102 Z', d.g(pr)) +
    L('M104 112 L 138 140 M102 128 L 122 146 M116 102 L 144 126 M104 146 L 140 112 M102 132 L 128 106', sombre(pr, .35), 1.3, ' opacity=".7"') +
    P('M112 104 Q 128 99 144 104 L 148 154 L 112 156 Z', d.g(cuir)) +
    F('M112 104 Q 117 102 122 102 L 120 156 L 112 156 Z', sombre(cuir, .3), ' opacity=".8"') +
    couture('M116 108 L 116 152', '#d8b07a') + couture('M141 108 L 144 152', '#d8b07a') +
    E(124, 128, 5, 3.5, '#2a1a10', ' opacity=".3"') +
    L('M146 104 L 150 154', LUNE, 2, ' opacity=".5"') +
    L('M104 100 L 144 156', O, 9) + L('M104 100 L 144 156', '#5a361f', 5.5) + band +
    L('M98 152 Q 124 160 150 150', O, 8) + L('M98 152 Q 124 160 150 150', '#5a361f', 4.5) + P('M118 152 L 128 154 L 128 163 L 118 161 Z', or) +
    P('M100 156 L 118 158 L 116 176 Q 107 180 99 174 Z', d.g('#8a5a32')) + L('M101 162 L 117 163', '#5e3a1e', 2) + C(108, 167, 2, or, ' stroke="' + O + '" stroke-width="1"') +
    '<g data-louche-ceinture>' + L('M160 150 L 168 186', O, 6.5) + L('M160 150 L 168 186', '#a8763e', 3) + P('M162 184 Q 168 200 178 186 Z', d.g('#b9c2d0'), ' stroke-width="2.4"') + '</g>' +
    J('marmite', L('M142 154 Q 150 146 158 154', O, 2.4) + P('M137 162 L 163 162 Q 167 182 150 186 Q 133 182 137 162 Z', d.g('#4a4458')) +
      E(150, 162, 14, 4, '#2a2436', ' stroke="' + O + '" stroke-width="2.6"') + L('M137 162 Q 150 168 163 162', '#c87a3a', 2.4) +
      L('M141 168 Q 142 178 148 182', '#8a84a0', 1.6, ' opacity=".7"') + rep('marmite', 150, 174), [150, 152]));
  /* devant : la main loin (fiole, louche, herbes), la tête, les lunettes d'alchimiste, le col */
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, or) +
      L(T('M-26 -22 C -10 -30 20 -32 36 -24', 124, 58), O, 6) + L(T('M-26 -22 C -10 -30 20 -32 36 -24', 124, 58), '#4a2e1c', 3.5) +
      [[2, -30, 8], [21, -30, 7]].map(function(g){
        var gx = 124 + g[0], gy = 58 + g[1];
        return '<circle cx="' + gx + '" cy="' + gy + '" r="' + g[2] + '" fill="' + d.g('#3fa8c8') + '" stroke="#c9a040" stroke-width="3.5"/>' +
          '<circle cx="' + gx + '" cy="' + gy + '" r="' + (g[2] + 2) + '" fill="none" stroke="' + O + '" stroke-width="1.5"/>' +
          L('M' + (gx - 3) + ' ' + (gy - 2) + ' Q ' + (gx - 1) + ' ' + (gy - 5) + ' ' + (gx + 2) + ' ' + (gy - 5), '#e8fdff', 1.8);
      }).join('') + rep('tete', 124, 40) + rep('teteC', 128, 60)) +
    col(d, 124, 58, pr));
  B += J('torse', brasA(true));
  /* le filet de potion versée (calculé à chaque image) */
  B += J('torse', '<path data-filet fill="none" stroke-linecap="round" stroke-width="4" style="display:none"/>');
  /* bras proche : la fiole qui bouillonne */
  B += J('torse', J('brasB', seg(xb, 108, 143, 18, 15.5, d.gh(pr)) + L('M' + (xb + 5) + ' 112 L ' + (xb + 4) + ' 138', LUNE, 1.4, ' opacity=".45"') +
    J('avantBrasB', seg(xb, 142, 181, 15.5, 13.5, d.gh(pr)) + bande(xb, 168, 17, 10, or) +
      J('mainB', '<g data-fiole-b>' + fioleTenue(d, xb, 184, 'hfB' + (++uid), '#ff8a3a', 1) + '</g>' + poing(d, xb, 187, 8.5, gant) + rep('pince', xb, 187)))));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="52" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
    {nom:'pans', type:'tissu', dos:[[98, 146], [84, 186], [62, 224]], devant:[[132, 150], [136, 190], [142, 228]], k:55, c:3.2, g:420, vent:0.8, onde:2.6,
      chemins:[{f:d.g(pr), contour:true}, {f:sombre(pr, .4), o:.85, zone:[0, .3, 0, 1]}, {s:sombre(pr, .45), w:1.6, ligne:['u', .5, .08, .98]},
        {s:or, w:1.4, o:.8, ligne:['v', .9, .03, .97], tirets:1}]},
    {nom:'tablier', type:'jupe', haut:[[112, 152], [149, 151]], bas:[[110, 214], [156, 212]], jambe:'cuisse', yJ:214, k:80, c:8, milieu:true,
      chemins:[{f:d.g(cuir), contour:true}, {f:sombre(cuir, .3), o:.8, zone:[0, .18, 0, 1]}, {s:'#d8b07a', w:1.3, o:.75, ligne:['u', .12, .03, .95], tirets:1},
        {s:'#d8b07a', w:1.3, o:.75, ligne:['u', .9, .03, .95], tirets:1}, {s:'#2a1a10', w:5, o:.22, ligne:['v', .55, .45, .75]}, {s:LUNE, w:1.8, o:.4, ligne:['u', .99, .05, .95]}]},
    {nom:'pointe', type:'meche', pts:[[92, 6], [78, 2], [64, 6], [54, 16], [48, 30]], larg:[14, 11, 8, 5, 2], k:34, c:3.4, g:450,
      f:d.g(capu), traits:[[sombre(capu, .45), 1.6, .8, -.15]], noeud:or, pompon:true, rNoeud:4.5}
  ];
  return {svg:d.svg(corps, grain), souples:so};
}
