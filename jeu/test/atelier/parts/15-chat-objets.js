
/* ==========================================================
   Les affaires du chat (étape 3) : gamelle de croquettes, gamelle d'eau, distributeur de croquettes, panier.
   (L'arbre à chat est dans la chambre.) Tout se décore ; le toucher fait d'abord son action :
   une gamelle vide se remplit, le distributeur remplit la gamelle ; pleine, un toucher change son style.
   ========================================================== */
/* (un dessin sans contour : un reflet, de l'eau) */
function sansTrait(svg){ return svg.split(' stroke="' + K + '" stroke-width="' + SW + '"').join(''); }
var GAMELLES = [['#e0443a', '#ff9b8f', '#8a2018'], ['#3d8ef0', '#bcd6ff', '#1f4f9a'], ['#4cbb5c', '#c6f0cc', '#2a7a3a']];
function croquettes(c, cx, cz, r, y){
  var s = '', n = 0;
  for(var i = 0; i < 14; i++){
    var a = i * 2.39996, rr = r * Math.sqrt((i + 0.5) / 14), q = c.Q(cx + Math.cos(a) * rr, y - (i % 3), cz + Math.sin(a) * rr);
    s += '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="5" ry="3.4" fill="' + (i % 2 ? '#b8743a' : '#d89452') + '" stroke="#5a3418" stroke-width="1.5"/>';
    n++;
  }
  return s;
}
def('gamelle', {w:96, h:40, p:80, z:'petit', deco:true, chat:true, nf:3, nom:'Gamelle de croquettes', ic:'🍗',
  d:function(c){
    var p = palette(c, GAMELLES[c.fo]), cz = 40, s;
    if(c.fo === 1) s = c.tour(48, cz, [[14, 42], [26, 40], [40, 30]], p[0], p[1]) + c.disque(48, cz, 34, 15, sombre(p[0], 0.35));
    else if(c.fo === 2) s = c.cylindre(48, cz, 42, 12, 40, p[0], p[1], '', 38) + c.disque(48, cz, 34, 13, sombre(p[0], 0.35)) + c.sur(T('M24,26 q6,-6 12,0 M60,26 q6,-6 12,0', '#fff', 3, ' opacity=".7"'), cz - 42);
    else s = c.tour(48, cz, [[14, 44], [22, 44], [34, 36], [40, 34]], p[0], p[1]) + c.disque(48, cz, 36, 15, sombre(p[0], 0.35)) + c.sur(emo(48, 28, 14, '🐾'), cz - 40);
    if(c.o.plein) s += croquettes(c, 48, cz, 26, 14);
    return [N(s)];
  }});
def('eau', {w:96, h:40, p:80, z:'petit', deco:true, chat:true, nf:3, nom:'Gamelle d\'eau', ic:'💧',
  d:function(c){
    var p = palette(c, [['#8fc8ff', '#e2f1ff', '#3d8ef0'], ['#f2b63c', '#ffe9b0', '#a86f14'], ['#b796ff', '#e2d6ff', '#5537a0']][c.fo]), cz = 40, s;
    if(c.fo === 1) s = c.tour(48, cz, [[14, 42], [26, 40], [40, 30]], p[0], p[1]);
    else if(c.fo === 2) s = c.cylindre(48, cz, 42, 12, 40, p[0], p[1], '', 38);
    else s = c.tour(48, cz, [[14, 44], [22, 44], [34, 36], [40, 34]], p[0], p[1]);
    s += c.disque(48, cz, 34, 15, c.o.plein ? '#5fb8ff' : sombre(p[0], 0.35), c.o.plein ? ' stroke-width="3"' : '');
    if(c.o.plein) s += sansTrait(c.disque(36, cz - 8, 12, 14.5, 'rgba(255,255,255,.6)', '', 6));
    return [N(s)];
  }});
def('distributeur', {w:86, h:150, p:76, z:'petit', deco:true, chat:true, nf:3, nom:'Distributeur de croquettes', ic:'🥫',
  d:function(c){
    var p = palette(c, [['#f2a65a', '#ffe0bf', '#d9783c'], ['#9d6ee3', '#d6c4ff', '#5f3fa8'], ['#e0443a', '#ffd0c8', '#8a2018']][c.fo]), cz = 38;
    var corps = UNI(p[0], p[1], sombre(p[0], 0.25)), s = c.boite(6, 128, 80, 150, 4, 72, corps);
    if(c.fo === 1){        /* une tour ronde, comme un petit château */
      s += c.cylindre(43, cz, 28, 30, 130, p[0], null) + c.tour(43, cz, [[2, 4], [16, 22], [30, 30]], sombre(p[0], 0.15), null);
    } else if(c.fo === 2){ /* une tête de chat */
      s += c.boite(12, 40, 74, 130, 10, 66, corps) + c.sur(P('M14,40 L22,14 L36,40 Z', p[0]) + P('M72,40 L64,14 L50,40 Z', p[0]) + Cir(32, 62, 5, K) + Cir(54, 62, 5, K) + P('M40,72 l3,3 l3,-3 Z', '#ff8fa8', ' stroke-width="1.5"'), 10);
    } else {
      s += c.boite(12, 40, 74, 130, 10, 66, corps) + c.boite(8, 30, 78, 42, 6, 70, UNI(p[2], p[1], sombre(p[2], 0.2)));
    }
    /* la vitre qui montre les croquettes, la petite trappe */
    s += c.sur(R(24, 54, 38, 46, 6, 'rgba(220,250,255,.55)', ' stroke-width="3"') + croquettesPlates(26, 72, 34) + R(30, 108, 26, 16, 4, sombre(p[0], 0.3), ' stroke-width="3"'), c.fo === 1 ? cz - 28 : 10);
    return [N(s)];
  }});
function croquettesPlates(x, y, w){
  var s = '';
  for(var i = 0; i < 9; i++) s += '<ellipse cx="' + (x + 4 + (i % 3) * (w / 3)) + '" cy="' + (y + Math.floor(i / 3) * 8) + '" rx="5" ry="3.4" fill="' + (i % 2 ? '#b8743a' : '#d89452') + '" stroke="#5a3418" stroke-width="1.5"/>';
  return s;
}
/* Le panier : le chat aime y dormir (osier et coussin, coussin rond, carton) */
def('panier', {w:150, h:70, p:120, z:'sol', deco:true, chat:true, nf:3, nom:'Panier du chat', ic:'🧺', surf:[{x0:-30, x1:30, y:-40, z:60}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#ef7fa8', '#ffd0e2', '#9c2f5a'], ['#d7b27a', '#f3e2bf', '#8a6a3a']][c.fo]), cz = c.p / 2, s;
    if(c.fo === 2){        /* un carton : le chat adore ! */
      s = c.boite(8, 20, 142, 70, 6, c.p - 6, UNI(G('carton'), G('cartonH'), '#b07c46')) + c.poly([[14, 20, 12], [136, 20, 12], [136, 20, c.p - 12], [14, 20, c.p - 12]], '#6b4a2a') +
        c.poly([[8, 20, 6], [142, 20, 6], [142, 4, -18], [8, 4, -18]], G('cartonH')) + c.sur(emo(110, 50, 18, '🐾'), 6);
    } else if(c.fo === 1){ /* un gros coussin rond, avec un creux au milieu */
      s = c.ovale(75, cz, 70, 54, 40, 70, p[0], p[1]) + c.disque(75, cz, 44, 40, clair(p[0], 0.25), '', 32) +
        sansTrait(c.disque(75, cz, 30, 42, clair(p[0], 0.45), '', 21)) + c.arcAvant(75, cz, 70.5, 56, p[2], 3) + c.sur(emo(75, 58, 14, '💗'), cz - 54);
    } else {               /* une corbeille en osier, et son coussin */
      s = c.ovale(75, cz, 70, 54, 34, 70, '#c58a4a', null) + c.disque(75, cz, 64, 34, '#7d4f24', ' stroke-width="4"', 49);
      s += c.ovale(75, cz + 2, 56, 41, 42, 50, p[1], clair(p[1], 0.2)) + sansTrait(c.disque(66, cz - 6, 18, 41, 'rgba(255,255,255,.55)', '', 9));
      for(var y = 44; y < 68; y += 8) s += c.arcAvant(75, cz, 70.5, y, '#8a5a2a', 2.5);
      s += c.arcAvant(75, cz, 70.5, 34, K, 9) + c.arcAvant(75, cz, 70.5, 34, '#e0b074', 5);
    }
    return [N(s)];
  }});
