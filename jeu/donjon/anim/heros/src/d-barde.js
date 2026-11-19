
/* ============ le Barde (Romain, 19 novembre, 12 h 36 : « la tenue de combat du barde […] tu as mon go ») ============
   Pour la fenêtre de sa tenue de combat (jeu/src/descente.js, tenue.html) : il n'entre pas (encore) dans le donjon, il n'a donc ni
   arme ni geste de combat — seulement sa garde, sa joie, sa course. Sa tenue, cousue par Mélusine : un pourpoint rouge à galons d'or,
   un gilet de cuir, une petite cape, un chapeau à plume ; son luth en bandoulière dans le dos, et son tambourin à la main.
   Pas de capuche : ses cheveux se voient sous le chapeau (dessous : la même coiffure que dans l'écran de création). */
function chapeau(d, cx, cy, feutre, or, plume){
  /* la plume, derrière (elle part de la couronne vers l'arrière) */
  var s = P(T('M-10 -50 C -30 -74 -60 -78 -76 -64 C -60 -66 -40 -62 -24 -48 Z', cx, cy), d.g(plume)) +
    L(T('M-12 -50 C -32 -68 -54 -72 -70 -66', cx, cy), sombre(plume, .35), 1.6) +
    L(T('M-30 -62 L -34 -68 M-42 -66 L -46 -72 M-54 -68 L -57 -74 M-30 -60 L -32 -54 M-44 -64 L -46 -58', cx, cy), clair(plume, .5), 1.4, ' opacity=".85"');   /* (T décale chaque paire : jamais de « l » relatif) */
  /* la couronne, le bord (un peu penché), le galon */
  s += P(T('M-26 -34 C -28 -50 -16 -62 2 -62 C 20 -62 28 -50 26 -34 Z', cx, cy), d.g(feutre)) +
    L(T('M-24 -40 C -10 -44 10 -44 26 -40', cx, cy), O, 7) + L(T('M-24 -40 C -10 -44 10 -44 26 -40', cx, cy), or, 4) +
    P(T('M-46 -30 C -30 -40 30 -42 48 -30 C 34 -22 -32 -20 -46 -30 Z', cx, cy), d.g(sombre(feutre, .15))) +
    L(T('M-40 -30 C -22 -36 26 -37 42 -30', cx, cy), clair(feutre, .35), 1.4, ' opacity=".6"') +
    C(cx - 6, cy - 42, 3.4, or, ' stroke="' + O + '" stroke-width="1.6"');
  return s;
}
/* les cheveux du dessus de la tête et de l'arrière (sous le chapeau : la capuche les cachait chez les autres héros) */
function cheveuxBarde(d, cx, cy, ch){
  return P(T('M30 -26 C 22 -44 -20 -48 -36 -28 C -46 -14 -44 10 -34 28 L -20 26 C -26 6 -26 -12 -16 -20 C 0 -30 18 -30 30 -24 Z', cx, cy), d.g(ch[1])) +
    L(T('M-30 -20 C -36 -6 -34 10 -28 22 M-20 -32 Q -4 -40 14 -36', cx, cy), ch[0], 1.8, ' opacity=".7"');
}
/* le luth, en bandoulière dans le dos (la caisse en bas à gauche, le manche qui monte derrière la tête) */
function luth(d, bois, or){
  /* (dans le dos : la caisse dépasse en bas, derrière la hanche ; le manche monte derrière l'épaule) */
  return P('M66 58 L 76 54 L 96 132 L 86 136 Z', d.g(sombre(bois, .25))) + L('M72 60 L 90 132', '#f3e7cb', 1, ' opacity=".7"') +
    P('M60 46 L 76 40 L 78 54 L 64 58 Z', d.g(sombre(bois, .4))) + C(64, 48, 2, or) + C(70, 45, 2, or) + C(74, 50, 2, or) +
    '<g transform="rotate(-18 82 160)">' + E(82, 160, 25, 31, d.g(bois)) + E(82, 160, 17, 22, 'none', ' stroke="' + sombre(bois, .4) + '" stroke-width="1.6"') +
      C(82, 152, 7, '#2a1a10', ' stroke="' + or + '" stroke-width="1.6"') + P('M74 176 L 90 176 L 89 182 L 75 182 Z', or, ' stroke-width="1.6"') +
      L('M80 128 L 78 178 M84 128 L 86 178', '#f3e7cb', 0.9, ' opacity=".7"') + '</g>';
}
/* la fraise blanche, autour du cou (pas de capuche, donc pas de col de capuche) */
function fraise(d, cx, cy){
  var s = '', i;
  for(i = 0; i < 7; i++){ var x = cx - 20 + i * 6.6, y = cy + 40 + Math.sin(i / 6 * Math.PI) * 4; s += E(r1(x), r1(y), 5.4, 4.2, '#fbf3df', ' stroke="' + O + '" stroke-width="1.8"'); }
  return s;
}
/* le tambourin, dans la main loin (la peau, le cerceau, les petites cymbales) */
function tambourin(d, x, y, or){
  return E(x + 4, y - 2, 20, 21, d.g('#c98a4a')) + E(x + 4, y - 2, 15, 16, '#f6e7c4', ' stroke="' + O + '" stroke-width="2"') +
    [[-16, -10], [-18, 6], [24, -10], [26, 6], [4, -23], [4, 19]].map(function(p){ return E(x + p[0], y + p[1], 3.6, 2.4, or, ' stroke="' + O + '" stroke-width="1.4"'); }).join('') +
    L('M' + (x - 4) + ' ' + (y - 8) + ' l 6 -3 M' + (x + 6) + ' ' + (y + 8) + ' l 6 -3', '#c98a4a', 1.4, ' opacity=".6"');
}
function barde(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var rouge = '#a8323e', rougeF = '#6e1f2c', or = '#e2b24c', cuir = '#7a4a2a', cuirF = '#4e2e18', pant = '#3a2f4a', bt = '#6a3e24', feutre = '#3d2a5e', plume = '#e8e0c8', bois = '#b8783a';
  var co = coiffureDe('barde', lk), B = '';
  /* couche 0 : la petite cape, le luth en bandoulière, les cheveux qui pendent dans le dos */
  B += J('torse', '<g data-souple="cape"></g>' + luth(d, bois, or) + J('tete', '<g data-souple="chDos"></g>'));
  var genou = function(x, k){ return P('M' + (x - 10) + ' 224 L ' + (x + 10) + ' 222 L ' + (x + 11) + ' 238 L ' + (x - 9) + ' 240 Z', d.g(sombre(cuir, k))) + rivets([[x - 4, 230], [x + 5, 229]], or); };
  B += jambe(d, 'A', pant, bt, genou);
  /* bras loin : le tambourin */
  var x = SQ.brasA[0];
  B += J('torse', J('brasA', seg(x, 106, 141, 17, 14, d.gh(rougeF)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', or, 1.4, ' opacity=".5"') +
    J('avantBrasA', seg(x, 140, 179, 14.5, 12.5, d.gh(rouge)) + L('M' + (x - 7) + ' 172 L ' + (x + 7) + ' 172', or, 2.4) +
      J('mainA', main(d, x, 185, 8.5, pe[1])))));
  B += jambe(d, 'B', pant, bt, genou);
  /* le pourpoint sous la ceinture (tissu souple) */
  B += '<g data-souple="jupe"></g>';
  /* le corps : pourpoint rouge, gilet de cuir lacé, galons d'or, la sangle du luth, la ceinture et sa bourse */
  B += J('torse', P('M98 98 Q 122 88 148 96 L 154 150 L 96 152 Q 92 124 98 98 Z', d.g(rouge)) +
    P('M103 103 Q 124 96 145 101 L 148 146 L 101 148 Q 98 126 103 103 Z', d.g(cuir)) +
    F('M103 103 Q 108 101 113 101 L 110 148 L 101 148 Q 98 126 103 103 Z', sombre(cuir, .35), ' opacity=".8"') +
    P('M117 100 L 125 146 L 133 99 Z', d.g(rouge)) + L('M119 108 L 131 112 M120 116 L 130 120 M121 124 L 129 128 M131 108 L 119 112 M130 116 L 120 120', '#f3e7cb', 1.4) +
    L('M117 100 L 125 146 L 133 99', or, 2) + L('M150 101 L 153 148', LUNE, 2, ' opacity=".5"') +
    L('M100 100 L 150 146', O, 8) + L('M100 100 L 150 146', cuirF, 4.5) + rivets([[112, 111], [124, 122], [136, 133]], or) +
    L('M96 146 Q 124 154 154 144', O, 9) + L('M96 146 Q 124 154 154 144', cuirF, 5.5) + P('M119 144 L 131 144 L 131 155 L 119 155 Z', or) + L('M122 149 L 129 149', O, 2) +
    P('M136 150 Q 146 148 150 154 Q 152 168 142 170 Q 132 168 136 150 Z', d.g('#7a4a28')) + L('M138 152 Q 143 156 148 152', or, 1.6) +
    amulette(d, 127, 115) + rep('amulette', 127, 115));
  /* la tête : les cheveux de derrière, le visage, la frange, le chapeau ; le col */
  B += J('torse', J('tete', cheveuxBarde(d, 124, 58, ch) + visage(d, 124, 58, lk) + cheveux(d, 124, 58, ch, co, feutre) + chapeau(d, 124, 58, feutre, or, plume) +
    rep('tete', 124, 40) + rep('teteC', 128, 60) + rep('nez', 152, 66)) + fraise(d, 124, 58));
  B += J('torse', J('brasA', '<g class="haAv">' + seg(x, 106, 141, 17, 14, d.gh(rougeF)) + '</g>' +
      J('avantBrasA', '<g class="haAv">' + seg(x, 140, 179, 14.5, 12.5, d.gh(rouge)) + '</g>' + J('mainA', tambourin(d, x, 186, or) + main(d, x, 185, 8.5, pe[1])))));
  /* bras proche : manche bouffante, brassard de cuir, le poing libre */
  var xb = SQ.brasB[0];
  B += J('torse', J('brasB', seg(xb, 108, 143, 20, 17, d.gh(rouge)) + L('M' + (xb - 6) + ' 116 L ' + (xb - 5) + ' 138 M' + (xb + 6) + ' 116 L ' + (xb + 5) + ' 138', or, 1.6, ' opacity=".8"') +
    J('avantBrasB', seg(xb, 142, 181, 15, 13, d.gh(rouge)) + P('M' + (xb - 8) + ' 152 L ' + (xb + 8) + ' 152 L ' + (xb + 7.5) + ' 176 L ' + (xb - 7.5) + ' 176 Z', d.g(cuir)) +
      L('M' + (xb - 8) + ' 160 L ' + (xb + 8) + ' 160 M' + (xb - 7.5) + ' 168 L ' + (xb + 7.5) + ' 168', cuirF, 2) + epaulette(xb, 142, d.g(rougeF)) +
      J('mainB', poing(d, xb, 187, 8.5, pe[1]) + rep('pince', xb + 2, 184)))));
  B += J('torse', J('tete', '<g data-souple="chDev"></g>'));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="52" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
      {nom:'cape', type:'tissu', dos:[[100, 100], [86, 140], [76, 180]], devant:[[118, 104], [110, 144], [102, 184]], k:60, c:3, g:420, vent:1,
        chemins:[{f:d.g(rougeF), contour:true}, {f:sombre(rougeF, .4), o:.7, zone:[0, .22, .06, 1]},
          {s:sombre(rougeF, .5), w:2, ligne:['u', .45, .1, .97]}, {s:or, w:1.6, o:.8, ligne:['v', .92, .03, .97]}]},
      {nom:'jupe', type:'jupe', haut:[[96, 147], [153, 145]], bas:[[88, 192], [170, 190]], jambe:'cuisse', yJ:190, k:90, c:9,
        chemins:[{f:d.g(rouge), contour:true}, {f:sombre(rouge, .35), o:.8, zone:[0, .22, 0, 1]},
          {s:sombre(rouge, .5), w:2, ligne:['u', .6, .06, .99]}, {s:or, w:2.2, ligne:['v', .95, .03, .97]},
          {s:LUNE, w:1.8, o:.45, ligne:['u', .985, .05, .95]}]}
    ].concat(souplesCheveux(d, ch, co, or));
  return {svg:d.svg(corps, grain), souples:so};
}
