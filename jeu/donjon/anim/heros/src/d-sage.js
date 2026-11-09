
/* ============ le Sage : bâton de runes dans la main proche, livre à la ceinture ============ */
function livreFerme(d, x, y, or){
  return P('M' + (x - 11) + ' ' + (y - 13) + ' L ' + (x + 11) + ' ' + (y - 14) + ' L ' + (x + 12) + ' ' + (y + 13) + ' L ' + (x - 10) + ' ' + (y + 14) + ' Z', d.g('#6a3c8a')) +
    L('M' + (x - 8) + ' ' + (y - 12) + ' L ' + (x - 7) + ' ' + (y + 13), '#f6ecd2', 2.4) +
    P('M' + (x - 11) + ' ' + (y - 13) + ' l 5 0 l -5 5 Z M' + (x + 11) + ' ' + (y - 14) + ' l -5 0 l 6 5 Z', or, ' stroke-width="1.4"') +
    L('M' + (x + 1) + ' ' + (y - 4) + ' l 3 -5 l 3 5 M' + (x + 4) + ' ' + (y - 9) + ' l 0 12', CYAN, 1.6, ' opacity=".9"');
}
function sage(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var bleu = '#2f4c9e', capu = '#2a4290', robe = '#d8caa4', or = '#e8c062', pant = '#2e2c4a', ch0 = '#5e3a1e';
  var B = '', x = SQ.brasA[0], xb = SQ.brasB[0];
  /* couche 0 : le manteau qui flotte, la tresse du dos (ou la pointe de la capuche) */
  B += J('torse', '<g data-souple="manteau"></g>' + J('tete', '<g data-souple="tresse"></g>'));
  B += jambe(d, 'A', pant, ch0);
  var manche = function(av){
    var w = av ? function(c){ return '<g class="haAv">' + c + '</g>'; } : function(c){ return c; };
    return w(seg(x, 106, 141, 18, 16, d.gh(bleu)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', LUNE, 1.4, ' opacity=".45"'));
  };
  var avb = function(av){
    var w = av ? function(c){ return '<g class="haAv">' + c + '</g>'; } : function(c){ return c; };
    return w(P('M' + (x - 8) + ' 140 L ' + (x + 8) + ' 140 L ' + (x + 12) + ' 176 Q ' + x + ' 182 ' + (x - 12) + ' 176 Z', d.gh(bleu)) + L('M' + (x - 12) + ' 175 Q ' + x + ' 181 ' + (x + 12) + ' 175', or, 2.6));
  };
  B += J('torse', J('brasA', manche(false) + J('avantBrasA', avb(false) + J('mainA', main(d, x, 186, 8, pe[1])))));
  B += jambe(d, 'B', pant, ch0);
  /* la robe sous la ceinture (tissu souple qui suit les jambes) */
  B += '<g data-souple="robe"></g>';
  /* le corps : robe claire, pans bleus brodés, écharpe-ceinture, bourse, livre fermé, pèlerine */
  B += J('torse', P('M98 98 Q 122 88 148 98 L 152 154 L 96 154 Z', d.g(robe)) +
    P('M98 98 Q 106 96 115 98 L 112 154 L 96 154 Z', d.g(bleu)) + P('M138 96 Q 145 97 148 98 L 152 154 L 140 154 Z', d.g(bleu)) +
    L('M112 100 L 110 154', or, 2.4) + L('M140 98 L 141 154', or, 2.4) + L('M150 110 L 152 152', LUNE, 2, ' opacity=".5"') +
    '<g data-souple="echarpe"></g>' +
    L('M96 150 Q 124 158 152 148', O, 10) + L('M96 150 Q 124 158 152 148', bleu, 6) + L('M96 148 Q 124 156 152 146', or, 1.6) +
    P('M126 156 Q 136 154 142 158 Q 144 172 134 174 Q 124 172 126 156 Z', d.g('#7a4a28')) + L('M128 158 Q 134 162 140 158', or, 1.6) +
    '<g data-livre-ceinture>' + L('M146 152 L 150 160', '#5e3a1e', 2.4) + livreFerme(d, 152, 170, or) + '</g>' +
    P('M94 96 Q 122 86 152 96 L 158 128 Q 124 140 90 128 Z', d.g(bleu)) + L('M92 126 Q 124 138 156 126', or, 2.4) +
    couture('M96 120 Q 124 130 154 120', CYAN) + L('M152 98 L 157 126', LUNE, 2, ' opacity=".55"') +
    C(124, 101, 4.5, or, ' stroke="' + O + '" stroke-width="2"') + C(124, 101, 1.8, CYAN));
  /* devant : la main loin (le livre ouvert), la tête */
  var livre = '<g data-livre-main style="display:none"><g transform="translate(' + x + ' 186) scale(1.3) translate(' + (-x) + ' -186)">' +
    '<ellipse data-livre-halo cx="' + x + '" cy="170" rx="40" ry="26" fill="' + d.halo('#e8fdff', '#3fd0ff') + '" opacity="0"/>' +
    P('M' + (x - 30) + ' 160 L ' + x + ' 154 L ' + (x + 30) + ' 160 L ' + (x + 30) + ' 190 L ' + x + ' 184 L ' + (x - 30) + ' 190 Z', d.g('#6a3c8a')) +
    '<g data-couv class="haJ" style="transform-origin:' + x + 'px 170px">' + P('M' + (x - 26) + ' 162 L ' + x + ' 157 L ' + x + ' 181 L ' + (x - 26) + ' 186 Z', '#f6ecd2') +
      L('M' + (x - 22) + ' 166 L ' + (x - 4) + ' 163 M' + (x - 22) + ' 171 L ' + (x - 6) + ' 168 M' + (x - 22) + ' 176 L ' + (x - 4) + ' 173', '#2ab0e0', 1.6) + '</g>' +
    P('M' + x + ' 157 L ' + (x + 26) + ' 162 L ' + (x + 26) + ' 186 L ' + x + ' 181 Z', '#fff8e6') +
    L('M' + (x + 4) + ' 163 L ' + (x + 22) + ' 166 M' + (x + 4) + ' 168 L ' + (x + 20) + ' 171 M' + (x + 4) + ' 173 L ' + (x + 22) + ' 176', '#2ab0e0', 1.6) +
    [0, 1, 2].map(function(k){ return '<path data-page="' + k + '" class="haJ" style="transform-origin:' + x + 'px 170px;opacity:0" d="M' + x + ' 157 L ' + (x + 25) + ' 161.5 L ' + (x + 25) + ' 185.5 L ' + x + ' 181 Z" fill="' + (k % 2 ? '#fffaf0' : '#f2e6c8') + '" stroke="' + O + '" stroke-width="2"/>'; }).join('') +
    '<g data-lueur-pages style="opacity:0">' + F('M' + (x - 26) + ' 162 L ' + x + ' 157 L ' + (x + 26) + ' 162 L ' + (x + 26) + ' 186 L ' + x + ' 181 L ' + (x - 26) + ' 186 Z', CYAN, ' opacity=".45" filter="' + d.flou(2.5) + '"') + '</g>' +
    rep('livre', x, 160) + '</g></g>';
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk, {lunettes:lk.lunettes}) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, or) +
      '<g data-souple="tresse2"></g>' + rep('tete', 124, 40) + rep('teteC', 128, 60)));
  B += J('torse', J('brasA', manche(true) + J('avantBrasA', avb(true) + J('mainA', livre + '<g class="haAv">' + main(d, x, 186, 8, pe[1]) + '</g>'))));
  /* bras proche : le bâton de runes */
  var top = 187 - 122, bas = 187 + 132;
  var baton = L('M' + xb + ' ' + (top + 14) + ' L ' + xb + ' ' + bas, O, 10) + L('M' + xb + ' ' + (top + 14) + ' L ' + xb + ' ' + bas, '#4a3020', 6) +
    L('M' + (xb + 1.5) + ' ' + (top + 20) + ' L ' + (xb + 1.5) + ' ' + (bas - 6), '#7a5638', 1.6, ' opacity=".8"') +
    L('M' + (xb - 1) + ' ' + (top + 60) + ' l 0 14 M' + (xb - 1.5) + ' ' + (top + 150) + ' l 0 22', '#2a1a10', 1.4) +
    P('M' + (xb - 6) + ' ' + (top + 34) + ' L ' + (xb + 6) + ' ' + (top + 34) + ' L ' + (xb + 6) + ' ' + (top + 41) + ' L ' + (xb - 6) + ' ' + (top + 41) + ' Z', or, ' stroke-width="2"') +
    P('M' + (xb - 6) + ' ' + (bas - 10) + ' L ' + (xb + 6) + ' ' + (bas - 10) + ' L ' + (xb + 4) + ' ' + bas + ' L ' + (xb - 4) + ' ' + bas + ' Z', or, ' stroke-width="2"') +
    /* la tête du bâton : une crosse qui tient le cristal */
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb - 2) + ' ' + (top - 2) + ' ' + (xb - 18) + ' ' + (top - 8) + ' ' + (xb - 20) + ' ' + (top + 6) + ' C ' + (xb - 21) + ' ' + (top + 14) + ' ' + (xb - 12) + ' ' + (top + 16) + ' ' + (xb - 10) + ' ' + (top + 9), O, 10) +
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb - 2) + ' ' + (top - 2) + ' ' + (xb - 18) + ' ' + (top - 8) + ' ' + (xb - 20) + ' ' + (top + 6) + ' C ' + (xb - 21) + ' ' + (top + 14) + ' ' + (xb - 12) + ' ' + (top + 16) + ' ' + (xb - 10) + ' ' + (top + 9), '#4a3020', 6) +
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb + 4) + ' ' + (top + 2) + ' ' + (xb + 14) + ' ' + (top - 2) + ' ' + (xb + 14) + ' ' + (top - 12), O, 8) +
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb + 4) + ' ' + (top + 2) + ' ' + (xb + 14) + ' ' + (top - 2) + ' ' + (xb + 14) + ' ' + (top - 12), '#4a3020', 4.5) +
    '<g data-cristal class="haJ" style="transform-origin:' + (xb + 2) + 'px ' + (top - 2) + 'px">' +
      '<circle data-cr-halo cx="' + (xb + 2) + '" cy="' + (top - 2) + '" r="30" fill="' + d.halo('#e8fdff', '#3fd0ff') + '" opacity=".75"/>' +
      P('M' + (xb + 2) + ' ' + (top - 20) + ' L ' + (xb + 11) + ' ' + (top - 4) + ' L ' + (xb + 2) + ' ' + (top + 12) + ' L ' + (xb - 7) + ' ' + (top - 4) + ' Z', d.g('#5fe0ff', 1.3)) +
      F('M' + (xb + 2) + ' ' + (top - 20) + ' L ' + (xb + 11) + ' ' + (top - 4) + ' L ' + (xb + 2) + ' ' + (top - 2) + ' Z', '#e8fdff', ' opacity=".75"') +
      L('M' + (xb - 1) + ' ' + (top - 8) + ' l 3 -5 l 3 5 M' + (xb + 2) + ' ' + (top - 13) + ' l 0 12', '#fff', 1.6) +
      C(xb + 2, top - 2, 3, '#fff', ' opacity=".8"') + '</g>' + rep('cristal', xb + 2, top - 2) + rep('baton-bas', xb, bas);
  B += J('torse', J('brasB', seg(xb, 108, 143, 18, 16, d.gh(bleu)) + L('M' + (xb + 5) + ' 112 L ' + (xb + 4) + ' 138', LUNE, 1.4, ' opacity=".45"') +
    J('avantBrasB', P('M' + (xb - 8) + ' 142 L ' + (xb + 8) + ' 142 L ' + (xb + 12) + ' 178 Q ' + xb + ' 184 ' + (xb - 12) + ' 178 Z', d.gh(bleu)) + L('M' + (xb - 12) + ' 177 Q ' + xb + ' 183 ' + (xb + 12) + ' 177', or, 2.6) +
      J('mainB', baton + poing(d, xb, 188, 8, pe[1])))));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="56" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
    {nom:'manteau', type:'tissu', dos:[[98, 100], [74, 192], [50, 286]], devant:[[114, 102], [104, 194], [96, 288]], k:46, c:2.8, g:420, vent:1, onde:3,
      chemins:[{f:d.g(sombre(capu, .2)), contour:true}, {f:sombre(capu, .5), o:.6, zone:[0, .25, .05, 1]}, {s:sombre(capu, .55), w:1.8, ligne:['u', .45, .08, .98]},
        {s:or, w:2, o:.8, ligne:['v', .95, .02, .98]}]},
    {nom:'robe', type:'jupe', haut:[[96, 152], [152, 151]], bas:[[64, 286], [182, 284]], jambe:'tibia', yJ:268, k:70, c:7,
      chemins:[{f:d.g(robe), contour:true}, {s:sombre(robe, .3), w:2.2, ligne:['u', .42, .1, .98]}, {s:sombre(robe, .3), w:2.2, ligne:['u', .62, .15, .98]},
        {f:d.g(bleu), zone:[0, .17, 0, 1]}, {f:d.g(bleu), zone:[.84, 1, 0, 1]}, {s:or, w:2.4, ligne:['u', .17, 0, .99]}, {s:or, w:2.4, ligne:['u', .84, 0, .99]},
        {s:or, w:3, ligne:['v', .985, .01, .99]}, {s:CYAN, w:1.3, o:.75, ligne:['v', .94, .02, .98], tirets:1}, {s:LUNE, w:2, o:.5, ligne:['u', .9, .05, .95]}]},
    {nom:'echarpe', type:'meche', pts:[[102, 152], [94, 166], [86, 182], [80, 198]], larg:[10, 9, 7, 4], k:40, c:3.5, g:400, f:d.g(bleu), traits:[[or, 1.4, .9, .3]], noeud:or, pompon:true, rNoeud:4}
  ];
  if(lk.fille){
    so.push({nom:'tresse', type:'tresse', pts:[[86, 92], [82, 120], [78, 148], [74, 176]], n:6, pasT:15, k:40, c:3.4, g:450, f:d.g(ch[1]), trait:ch[0], bout:or});
    so.push({nom:'tresse2', type:'tresse', pts:[[106, 92], [105, 116], [104, 140], [103, 164]], n:5, pasT:15, k:46, c:3.6, g:450, f:d.g(ch[1]), trait:ch[0], bout:or});
  } else so.push({nom:'tresse', type:'meche', pts:[[92, 6], [78, 2], [64, 6], [54, 16], [48, 30]], larg:[14, 11, 8, 5, 2], k:34, c:3.4, g:450, f:d.g(capu), traits:[[sombre(capu, .45), 1.6, .8, -.15]], noeud:or, pompon:true, rNoeud:4.5});
  return {svg:d.svg(corps, grain), souples:so};
}
