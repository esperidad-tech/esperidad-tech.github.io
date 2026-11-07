
/* ==========================================================
   La décoration : chaque toucher change la forme ET la couleur (c.fo : la forme, c.ti : le thème, 0 = naturel).
   Le bois, la terre cuite, le métal et l'or sont repeints tout seuls (repeindre) ; les tissus et les fleurs prennent la couleur du thème.
   Tout est dessiné dans la perspective de la pièce : les meubles en boîtes, les pots en cylindres (on voit leur dessus),
   les tapis couchés sur le plancher ; ce qui est plat (un tableau, des fanions) est collé sur son mur.
   ========================================================== */
function coulTh(c, nat){ return c.ti ? THEMES[c.ti].c : nat; }
function palette(c, nat){ return couleurs(c.ti, nat); }
function PLANCHE(){ return UNI(G('boisH'), G('boisH'), G('boisS')); }

def('etagere', {w:224, h:186, p:56, z:'mur', deco:true, nf:3, nom:'Étagère', ic:'📚', surf:[{x0:-98, x1:98, y:-140, z:28}, {x0:-98, x1:98, y:-20, z:28}],
  d:function(c){
    var s = '', P2 = c.p;
    if(c.fo === 2){        /* planches suspendues à des cordes */
      s += c.sur(Cir(20, -6, 4, '#cfc9e6') + Cir(204, -6, 4, '#cfc9e6'), P2) +
        c.ligne([[20, -6, P2], [20, 46, 6]], '#8a6a3a', 3.5) + c.ligne([[204, -6, P2], [204, 46, 6]], '#8a6a3a', 3.5);
    } else if(c.fo === 0){ /* montants contre le mur, petites consoles */
      s += c.boite(10, 4, 24, 182, P2 - 10, P2, SOMBRE()) + c.boite(200, 4, 214, 182, P2 - 10, P2, SOMBRE());
    }
    [46, 166].forEach(function(y){
      s += c.boite(4, y, 220, y + 14, 0, P2, PLANCHE());
      if(c.fo === 0) s += c.boite(14, y + 14, 22, y + 28, 12, P2 - 10, SOMBRE()) + c.boite(202, y + 14, 210, y + 28, 12, P2 - 10, SOMBRE());
      if(c.fo === 1){      /* consoles festonnées sous la planche */
        var f = '';
        for(var x = 12; x < 212; x += 25) f += P('M' + x + ',' + (y + 14) + ' C' + (x + 3) + ',' + (y + 26) + ' ' + (x + 19) + ',' + (y + 26) + ' ' + (x + 22) + ',' + (y + 14) + ' Z', G('bois'), ' stroke-width="3"');
        s += c.sur(f, 2);
      }
      if(c.fo === 2 && y < 100) s += c.ligne([[20, y + 14, 6], [20, 166, 6]], '#8a6a3a', 3.5) + c.ligne([[204, y + 14, 6], [204, 166, 6]], '#8a6a3a', 3.5);
    });
    return [N(s + c.sur(reflet('M14,50 H210', 3), 0))];
  }});

def('table', {w:232, h:138, p:120, z:'sol', deco:true, nf:3, nom:'Table', ic:'🪵', surf:[{x0:-96, x1:96, y:-108, z:60}],
  d:function(c){
    var P2 = c.p, s = '';
    if(c.fo === 1){        /* table ovale sur un pied */
      s += c.ovale(116, P2 / 2, 44, 26, 128, 136, G('bois'), G('boisH')) + c.cylindre(116, P2 / 2, 11, 44, 130, G('boisS'), null) +
        c.ovale(116, P2 / 2, 112, 58, 30, 44, G('bois'), G('boisH'));
      return [N(s + c.dessus(reflet('M60,-30 C90,-44 150,-44 180,-30', 3), 30, P2 / 2))];
    }
    if(c.fo === 2){        /* une nappe à carreaux */
      var p = palette(c, ['#f3e7cb', '#ffffff', '#d9544f']), raie = c.ti ? p[2] : '#d9544f';
      s += c.boite(30, 90, 42, 138, P2 - 22, P2 - 10, SOMBRE()) + c.boite(190, 90, 202, 138, P2 - 22, P2 - 10, SOMBRE()) +
        c.boite(30, 90, 42, 138, 10, 22, SOMBRE()) + c.boite(190, 90, 202, 138, 10, 22, SOMBRE());
      s += c.boite(4, 30, 228, 92, -6, P2 + 6, UNI(p[0], clair(p[0], 0.2), sombre(p[0], 0.12)));
      var car = '';
      for(var x = 36; x < 228; x += 36) car += 'M' + x + ',30 V92 ';
      s += c.sur(T(car + 'M4,62 H228', raie, 4, ' opacity=".55"') + P('M4,90 C30,104 52,90 78,100 C102,90 130,104 154,96 C178,104 200,90 228,98 L228,92 L4,92 Z', p[0]), -6);
      var lg = '';
      for(var z = 10; z < P2; z += 30) lg += c.ligne([[4, 30, z], [228, 30, z]], raie, 4, ' opacity=".5"');
      for(var x2 = 36; x2 < 228; x2 += 36) lg += c.ligne([[x2, 30, -6], [x2, 30, P2 + 6]], raie, 4, ' opacity=".5"');
      return [N(s + lg)];
    }
    /* table de bois à quatre pieds */
    s += c.boite(20, 44, 36, 138, P2 - 22, P2 - 6, SOMBRE()) + c.boite(196, 44, 212, 138, P2 - 22, P2 - 6, SOMBRE()) +
      c.boite(18, 44, 214, 62, 8, P2 - 8, BOIS()) +
      c.boite(20, 44, 36, 138, 6, 22, BOIS()) + c.boite(196, 44, 212, 138, 6, 22, BOIS()) +
      c.boite(6, 30, 226, 46, 0, P2, UNI(G('bois'), G('boisH'), G('boisS')));
    return [N(s + c.dessus(reflet('M30,-40 H200', 3), 30, P2 / 2))];
  }});

def('tabouret', {w:86, h:86, p:80, z:'sol', deco:true, nf:3, nom:'Tabouret', ic:'🪑', surf:[{x0:-26, x1:26, y:-64, z:40}],
  d:function(c){
    var cz = c.p / 2, s = '';
    if(c.o.renverse){      /* le chat l'a fait tomber : couché sur le côté, les pieds en l'air vers la droite (un toucher le relève) */
      var pr = palette(c, ['#9d6ee3', '#c9a8ff', '#5f3fa8']);
      if(c.fo === 2) return [N(c.tube([10, 54, cz], [76, 54, cz], 31, pr[0], pr[1], pr[1]) + c.sur(emo(62, 12, 18, '💫'), cz))];
      var jambe = function(a, b){ return c.ligne([a, b], K, 11) + c.ligne([a, b], '#b06f3e', 5); };
      s += jambe([28, 30, cz], [84, 40, cz + 4]) + jambe([28, 62, cz - 22], [84, 80, cz - 32]) + jambe([28, 62, cz + 22], [84, 80, cz + 34]);
      s += c.fo === 1 ? c.boite(14, 8, 30, 84, cz - 36, cz + 36, UNI(G('bois'), G('boisH'), G('boisS'))) : c.tube([14, 46, cz], [30, 46, cz], 38, G('bois'), G('boisH'), G('boisH'));
      return [N(s + c.sur(emo(60, 14, 18, '💫'), cz))];
    }
    if(c.fo === 1){        /* carré, quatre pieds écartés */
      var pieds4 = [[16, 76], [70, 76], [16, 4], [70, 4]];
      pieds4.forEach(function(q, i){ var a = [q[0] < 43 ? 14 : 72, 84, q[1] > 40 ? 78 : 2]; s += c.ligne([[q[0], 26, q[1]], a], K, 10) + c.ligne([[q[0], 26, q[1]], a], '#b06f3e', 5); if(i === 1) s += c.ligne([[15, 62, 3], [71, 62, 3]], K, 7) + c.ligne([[15, 62, 3], [71, 62, 3]], '#d29a5e', 3); });
      return [N(s + c.boite(8, 16, 78, 28, 2, c.p - 2, UNI(G('bois'), G('boisH'), G('boisS'))))];
    }
    if(c.fo === 2){        /* pouf rembourré */
      var p = palette(c, ['#9d6ee3', '#c9a8ff', '#5f3fa8']);
      s += c.tour(43, cz, [[24, 34], [40, 38], [64, 38], [84, 32]], p[0], p[1]) + c.arcAvant(43, cz, 38, 52, p[2], 3) + c.disque(43, cz, 4, 23, '#fff2c4', ' stroke-width="3"');
      return [N(s)];
    }
    /* rond, trois pieds */
    [[43, 30, 70], [16, 84, 18], [70, 84, 18]].forEach(function(q, i){
      var a = i === 0 ? [43, 84, 76] : [q[0], q[1], q[2] - 12], b = [i === 0 ? 43 : (q[0] < 43 ? 28 : 58), 28, i === 0 ? 58 : 30];
      if(i === 0){ s += c.ligne([b, a], K, 11) + c.ligne([b, a], '#b06f3e', 5); }
      else { s += c.ligne([b, a], K, 11) + c.ligne([b, a], '#b06f3e', 5); }
    });
    s += c.cylindre(43, cz, 36, 20, 30, G('bois'), G('boisH'));
    return [N(s + c.dessus(reflet('M24,-14 C34,-20 52,-20 62,-16', 3), 20, cz))];
  }});

/* Le tapis est couché sur le plancher : on le voit de haut, il fuit vers le fond comme les planches */
var TAPIS = [['#d9544f', '#f5b945', '#8a2f3a'], ['#4f73d9', '#8ff3ff', '#2a3a7d'], ['#3f9a6a', '#ffd36a', '#1f5a3c']];
def('tapis', {w:304, h:4, p:190, z:'tapis', deco:true, nf:3, nom:'Tapis', ic:'🟥',
  d:function(c){
    var p = palette(c, TAPIS[c.fo]), W = c.cat.w, D = c.p, art;
    if(c.fo === 2){        /* rond, avec des fleurs (un ovale couché) */
      var fl = '';
      for(var k = 0; k < 8; k++){ var a2 = k / 8 * Math.PI * 2, fx = W / 2 + Math.cos(a2) * 112, fy = D / 2 + Math.sin(a2) * 66; fl += Cir(f1(fx), f1(fy), 11, p[1], ' stroke-width="3"') + Cir(f1(fx), f1(fy), 4, p[2], ' stroke-width="0"'); }
      art = Ell(W / 2, D / 2, W / 2 - 4, D / 2 - 4, p[0]) + Ell(W / 2, D / 2, W / 2 - 34, D / 2 - 26, 'none', ' stroke-width="4" stroke-dasharray="12 9" opacity=".7"') + Ell(W / 2, D / 2, 46, 28, p[1], ' stroke-width="4"') + fl;
      return [N(c.surPlan(art, [0, 0, D], [1, 0, 0], [0, 0, -1], W / 2, D / 2))];
    }
    var fr = '';
    for(var y = 12; y < D - 6; y += 14) fr += 'M-12,' + y + ' H4 M' + (W - 4) + ',' + y + ' H' + (W + 12) + ' ';
    if(c.fo === 1){        /* à rayures */
      var r = '';
      for(var i = 0; i < 6; i++) r += '<rect x="4" y="' + (14 + i * 30) + '" width="' + (W - 8) + '" height="14" fill="' + p[1] + '" opacity=".9"/>';
      art = T(fr, '#f3e7cb', 4) + R(4, 4, W - 8, D - 8, 6, p[0]) + r + R(4, 4, W - 8, D - 8, 6, 'none');
    } else {
      art = T(fr, '#f3e7cb', 4) + R(4, 4, W - 8, D - 8, 6, p[0]) + R(24, 22, W - 48, D - 44, 4, 'none', ' stroke="' + p[1] + '" stroke-width="5" stroke-dasharray="14 9"') +
        P('M' + (W / 2) + ',' + (D / 2 - 56) + ' L' + (W / 2 + 80) + ',' + (D / 2) + ' L' + (W / 2) + ',' + (D / 2 + 56) + ' L' + (W / 2 - 80) + ',' + (D / 2) + ' Z', p[1], ' stroke-width="4"') +
        P('M' + (W / 2) + ',' + (D / 2 - 28) + ' L' + (W / 2 + 40) + ',' + (D / 2) + ' L' + (W / 2) + ',' + (D / 2 + 28) + ' L' + (W / 2 - 40) + ',' + (D / 2) + ' Z', p[2], ' stroke-width="4"') +
        Cir(52, D / 2, 9, p[1]) + Cir(W - 52, D / 2, 9, p[1]);
    }
    return [N(c.surPlan(art, [0, 0, D], [1, 0, 0], [0, 0, -1], W / 2, D / 2))];
  }});

/* La lampe se touche pour l'allumer */
def('lampe', {w:64, h:106, p:46, z:'petit', deco:true, rangeable:true, nom:'Lampe à huile', ic:'🪔',
  d:function(c){
    var on = c.o.on !== 0, cz = 23;
    var s = (on ? c.sur('<circle class="at-halo" cx="32" cy="40" r="74" fill="' + G('halo') + '"/>', cz) : '') +
      c.tour(32, cz, [[94, 13], [104, 22]], G('cuivre'), G('cuivre')) + c.cylindre(32, cz, 4, 74, 96, G('cuivre'), null) +
      c.tour(32, cz, [[60, 10], [64, 19], [70, 21], [76, 19], [80, 9]], G('cuivre'), null) +
      c.tour(32, cz, [[20, 7], [30, 10], [44, 14], [56, 12], [62, 9]], G('verre'), null, ' stroke-width="4"') +
      c.sur(on ? '<path class="at-flamme" d="M32,54 C24,46 28,38 32,27 C36,38 40,46 32,54 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>' : T('M32,54 V44', K, 3), cz) +
      c.cylindre(32, cz, 8, 10, 20, G('metal'), '#6a6290') + c.sur(reflet('M24,30 C22,40 23,50 26,56', 3), cz - 12);
    return [N(s)];
  }});

/* Les plantes : un pot de terre (on voit la terre dedans), la plante qui en sort */
var BOUTONS = ['#8ff3ff', '#ff8fb3', '#ffd36a'];
def('plante', {w:96, h:146, p:66, z:'petit', deco:true, nf:3, nom:'Plante', ic:'🪴',
  d:function(c){
    var cz = 33, fleur = coulTh(c, BOUTONS[c.fo]), pl;
    var pot = c.cylindre(48, cz, 26, 98, 144, G('terre'), null, '', 18) + c.cylindre(48, cz, 32, 86, 100, G('terre'), G('terre')) + c.disque(48, cz, 26, 88, '#5a3a22', ' stroke-width="3"');
    if(c.fo === 1){        /* cactus fleuri */
      pl = P('M38,92 C34,60 36,30 48,22 C60,30 62,60 58,92 Z', G('vert')) + P('M38,70 C24,70 18,58 20,44 C26,44 30,52 38,56 Z', G('vert')) + P('M58,64 C72,64 78,52 76,40 C70,40 66,48 58,50 Z', G('vert')) +
        T('M44,30 V86 M52,30 V86', '#25703c', 2) + T('M42,40 l-5,-2 M54,48 l5,-2 M42,64 l-5,-2 M54,74 l5,-2', '#fff6d8', 1.5) +
        '<g class="at-lueur">' + Cir(48, 18, 8, fleur) + Cir(48, 18, 3, '#fff2c4', ' stroke-width="0"') + '</g>';
    } else if(c.fo === 2){ /* buisson de fleurs */
      var fl = '';
      [[30, 50], [52, 34], [70, 54], [42, 70], [62, 74], [24, 72]].forEach(function(q){ fl += Cir(q[0], q[1], 8, fleur, ' stroke-width="3"') + Cir(q[0], q[1], 3, '#fff2c4', ' stroke-width="0"'); });
      pl = P('M14,90 C2,64 18,30 48,26 C78,30 94,64 82,90 Z', G('vert')) + T('M30,80 C36,60 46,48 48,30 M66,82 C60,64 54,52 50,40', '#25703c', 2.5) + fl;
    } else {
      pl = '<g class="at-feuilles">' +
        P('M48,92 C30,82 12,62 16,36 C34,46 44,66 48,92 Z', G('vert')) +
        P('M48,92 C64,80 84,60 82,30 C62,42 52,64 48,92 Z', G('vert')) +
        P('M48,93 C40,72 38,40 50,10 C62,40 58,72 48,93 Z', G('vert')) +
        T('M48,90 C44,70 46,40 50,16 M48,90 C38,76 26,58 20,42 M48,90 C60,76 74,56 78,36', '#25703c', 2.5) +
        '<circle class="at-lueur" cx="50" cy="12" r="7" fill="' + fleur + '" stroke="' + K + '" stroke-width="3"/></g>';
    }
    return [N(pot + c.sur(pl, cz) + c.sur(reflet('M28,106 L33,136', 3), cz - 24))];
  }});

/* Ce qui est plat (tableau, horloge, guirlande, fanions…) est collé sur son mur : de biais sur un mur de côté */
def('tableau', {w:146, h:114, p:10, z:'mur', deco:true, nf:3, nom:'Tableau', ic:'🖼️',
  d:function(c){
    var v = c.fo, art, ciel = c.ti ? sombre(THEMES[c.ti].c, 0.55) : null;
    if(v === 0) art = '<rect x="20" y="22" width="106" height="72" fill="' + (ciel || '#1d2550') + '"/><circle cx="102" cy="40" r="10" fill="#ffe9a3"/>' +
      '<path d="M20,80 C40,62 58,72 78,62 C98,52 114,64 126,58 L126,94 L20,94 Z" fill="#2f5a4a"/><rect x="42" y="50" width="12" height="30" fill="#4b3a6a"/><path d="M40,52 L48,40 L56,52 Z" fill="#7d5bd0"/><rect x="46" y="58" width="4" height="6" fill="#ffd36a"/>' +
      '<circle cx="34" cy="32" r="1.6" fill="#fff"/><circle cx="70" cy="30" r="1.6" fill="#fff"/><circle cx="84" cy="46" r="1.3" fill="#fff"/>';
    else if(v === 1) art = '<rect x="20" y="22" width="106" height="72" fill="' + (c.ti ? clair(THEMES[c.ti].c, 0.55) : '#f7c98a') + '"/><circle cx="72" cy="56" r="16" fill="#ff8a5c"/><path d="M20,94 L52,48 L74,76 L94,56 L126,94 Z" fill="#6a4fa0"/><path d="M44,60 L52,48 L60,58 Z" fill="#fff"/>';
    else art = '<rect x="20" y="22" width="106" height="72" fill="' + (ciel || '#2a2147') + '"/><path d="M62,44 L62,34 L84,34 L84,44 C98,50 100,80 73,86 C46,80 48,50 62,44 Z" fill="#8ff3ff" stroke="#24182e" stroke-width="3"/><circle cx="68" cy="64" r="4" fill="#fff" opacity=".7"/><circle cx="40" cy="36" r="2" fill="#ffe9a3"/><circle cx="106" cy="76" r="2" fill="#ffe9a3"/>';
    var s = c.sur(T('M46,10 L73,-6 L100,10', K, 3), c.p);
    if(v === 1) return [N(s + c.sur(Ell(73, 58, 66, 50, '#9a6a1c'), c.p) + c.sur(Ell(73, 58, 66, 50, G('or')) + '<g clip-path="url(#atg-ov)">' + art + '</g>' + Ell(73, 58, 54, 39, 'none', ' stroke-width="3"') + reflet('M28,40 C34,26 50,16 70,14', 3), 0))];
    if(v === 2) return [N(s + c.tube([73, 58, c.p], [73, 58, 0], 54, '#9a6a1c', null, null) + c.sur(Cir(73, 58, 54, G('or')) + '<g clip-path="url(#atg-rd)">' + art + '</g>' + Cir(73, 58, 43, 'none', ' stroke-width="3"') + reflet('M36,34 C44,22 58,16 72,16', 3), 0))];
    return [N(s + c.boite(6, 8, 140, 108, 0, c.p, UNI(G('or'), '#f7d778', '#9a6a1c')) + c.sur(R(17, 19, 112, 78, 3, '#1d2550', ' stroke-width="3"') + art + T('M20,22 H126 V94 H20 Z', K, 3) + reflet('M14,16 H130', 3), 0))];
  }});

/* L'horloge est de la décoration : un toucher, un autre style */
def('horloge', {w:94, h:158, p:30, z:'mur', deco:true, nf:3, nom:'Horloge', ic:'🕰️',
  d:function(c){
    var P2 = c.p, cad = function(cx, cy, r){
      var t = '';
      for(var i = 0; i < 12; i++){ var a = i * Math.PI / 6; t += 'M' + (cx + Math.sin(a) * (r - 5)).toFixed(1) + ',' + (cy - Math.cos(a) * (r - 5)).toFixed(1) + ' L' + (cx + Math.sin(a) * (r - 2)).toFixed(1) + ',' + (cy - Math.cos(a) * (r - 2)).toFixed(1) + ' '; }
      return Cir(cx, cy, r, '#f6ecd2', ' stroke-width="3"') + T(t, K, 2) +
        '<line class="at-aig-h" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r * 0.52) + '" stroke="' + K + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line class="at-aig-m" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r * 0.8) + '" stroke="' + K + '" stroke-width="2.5" stroke-linecap="round"/>' + Cir(cx, cy, 3, K);
    };
    if(c.fo === 1) return [N(c.tube([47, 52, P2 - 8], [47, 52, 0], 44, G('boisS'), null, G('bois')) + c.sur(cad(47, 52, 34) + reflet('M14,40 C18,24 30,14 44,12', 3), -1))];
    if(c.fo === 2){        /* coucou */
      var s = c.boite(12, 42, 82, 114, 0, P2, BOIS()) + c.poly([[4, 46, -4], [47, 6, -4], [90, 46, -4]], G('boisS')) +
        c.plan([[4, 46, -4], [47, 6, -4], [47, 6, P2], [4, 46, P2]], [-40, -43, 0], G('boisS')) + c.plan([[47, 6, -4], [90, 46, -4], [90, 46, P2], [47, 6, P2]], [40, -43, 0], G('boisS'));
      return [N(s + c.sur(R(38, 48, 18, 16, 4, '#2a1d14', ' stroke-width="3"') + emo(47, 57, 12, '🐦') + cad(47, 88, 20) + T('M8,46 C20,52 30,44 47,50 C64,44 74,52 86,46', '#4fb45f', 4), 0) +
        c.ligne([[30, 114, 12], [30, 146, 12]], '#5a4630', 2.5) + c.ligne([[64, 114, 12], [64, 138, 12]], '#5a4630', 2.5) + c.tube([30, 140, 12], [30, 156, 12], 6, G('or'), G('or'), G('or')) + c.tube([64, 132, 12], [64, 148, 12], 6, G('or'), G('or'), G('or')))];
    }
    return [N(c.boite(20, 50, 74, 152, 0, P2, BOIS()) + c.tube([47, 42, P2], [47, 42, 0], 34, G('boisS'), null, G('bois')) +
      c.sur(cad(47, 42, 25) + R(32, 86, 30, 56, 6, '#2a1d14', ' stroke-width="4"') + '<g class="at-balancier">' + T('M47,86 L47,124', '#b8862e', 3) + Cir(47, 127, 8, G('or')) + '</g>' + reflet('M26,60 V140', 3), -1))];
  }});

def('bougies', {w:74, h:88, p:56, z:'petit', deco:true, nf:3, nom:'Bougies', ic:'🕯️',
  d:function(c){
    function fl(x, y, d){ return '<path class="at-flamme" style="animation-delay:' + d + 's" d="M' + x + ',' + y + ' c-5,-6 -3,-12 0,-18 c3,6 5,12 0,18 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>'; }
    var cire = palette(c, ['#f6ecd2', '#fff8e8', '#ffe3a3']), cz = 28, halo = c.sur('<circle class="at-halo" cx="37" cy="30" r="50" fill="' + G('halo') + '"/>', cz);
    function bougie(x, z, r, yh, col, d){ return c.cylindre(x, z, r, yh, 82, col, clair(col, 0.35), ' stroke-width="3.5"') + c.sur(T('M' + x + ',' + yh + ' V' + (yh - 4), K, 2) + fl(x, yh - 4, d), z); }
    if(c.fo === 1){        /* une bougie dans un pot de verre */
      return [N(halo + c.cylindre(37, cz, 22, 34, 86, G('verre'), null, ' stroke-width="4"') + bougie(37, cz, 13, 54, cire[0], 0) + c.cylindre(37, cz, 23, 30, 38, G('cuivre'), null, ' stroke-width="3"'))];
    }
    if(c.fo === 2){        /* chandelier à trois branches */
      return [N(halo + c.tour(37, cz, [[80, 8], [86, 20]], G('or'), G('or')) + c.cylindre(37, cz, 3, 46, 82, G('or'), null, ' stroke-width="3"') +
        c.sur(T('M12,50 C12,62 62,62 62,50', K, 6) + T('M12,50 C12,62 62,62 62,50', '#f5b945', 3), cz) +
        c.cylindre(12, cz, 5, 32, 52, cire[0], clair(cire[0], 0.35), ' stroke-width="3"') + c.cylindre(37, cz, 5, 24, 48, cire[2], clair(cire[2], 0.35), ' stroke-width="3"') + c.cylindre(62, cz, 5, 32, 52, cire[0], clair(cire[0], 0.35), ' stroke-width="3"') +
        c.sur(fl(12, 30, 0) + fl(37, 22, 0.3) + fl(62, 30, 0.6), cz))];
    }
    return [N(halo + c.cylindre(37, cz, 32, 80, 86, G('cuivre'), G('cuivre')) + bougie(22, cz + 10, 7, 44, cire[0], 0) + bougie(52, cz + 8, 7, 52, cire[0], 0.6) + bougie(37, cz - 8, 7, 32, cire[2], 0.3))];
  }});

var COUSSINS = ['#9d6ee3', '#ef7fa8', '#5fcf86'];
def('coussin', {w:126, h:66, p:110, z:'sol', deco:true, nf:3, nom:'Coussin', ic:'🟣',
  d:function(c){
    var p = palette(c, [COUSSINS[c.fo], clair(COUSSINS[c.fo], 0.5), sombre(COUSSINS[c.fo], 0.35)]), cz = c.p / 2;
    if(c.fo === 2){        /* un cœur debout */
      var coeur = 'M63,62 C20,44 6,26 18,14 C30,2 52,8 63,24 C74,8 96,2 108,14 C120,26 106,44 63,62 Z';
      return [N(c.sur(P(coeur, p[2]), cz + 10) + c.sur(P(coeur, p[0]) + T('M30,20 C36,14 46,14 52,20', '#fff', 4, ' opacity=".5"'), cz - 10))];
    }
    /* un gros coussin moelleux posé par terre : ses coins arrondis */
    var haut = [], tout = [], y0 = 22, y1 = 64;
    [[10, 8], [63, 2], [116, 8], [122, cz], [116, c.p - 8], [63, c.p - 2], [10, c.p - 8], [4, cz]].forEach(function(q){ haut.push(c.Q(q[0], y0 + (q[1] === cz ? 6 : 0), q[1])); tout.push(c.Q(q[0], y0, q[1]), c.Q(q[0], y1, q[1])); });
    var s = P(lisse(enveloppe(tout), true, 0.9), p[2]) + P(lisse(haut, true), p[0]);
    if(c.fo === 1) s += c.dessus(R(30, -30, 66, 60, 10, p[1], ' stroke-width="3"') + reflet('M24,-40 H70', 4), y0, cz) +
      c.ligne([[10, y0, 8], [-2, y0 - 6, -2]], p[2], 4) + c.ligne([[116, y0, 8], [128, y0 - 6, -2]], p[2], 4);
    else s += c.dessus(T('M40,-24 l5,6 M86,-24 l-5,6 M63,-34 v7 M40,24 l5,-5 M86,24 l-5,-5', K, 2.2) + Cir(63, 0, 6, '#fff2c4') + reflet('M24,-30 C34,-38 50,-40 62,-40', 4), y0 + 4, cz);
    return [N(s)];
  }});

def('guirlande', {w:266, h:74, p:8, z:'mur', deco:true, nf:3, nom:'Guirlande', ic:'✨',
  d:function(c){
    var pts = [[30, 24], [60, 36], [92, 39], [118, 31], [148, 31], [174, 39], [206, 36], [236, 24]], cols = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.55), sombre(THEMES[c.ti].c, 0.1)] : ['#8ff3ff', '#ffd36a', '#ff8fb3'], s = '';
    pts.forEach(function(p, i){
      var x = p[0], y = p[1] + 13, col = cols[i % 3], st = ' class="at-ampoule" style="animation-delay:' + (i * 0.25) + 's"';
      s += R(x - 4, p[1] - 2, 8, 7, 2, '#5a4630', ' stroke-width="2.5"');
      if(c.fo === 1) s += '<path' + st + ' d="M' + x + ',' + (y - 10) + ' L' + (x + 3) + ',' + (y - 3) + ' L' + (x + 10) + ',' + (y - 3) + ' L' + (x + 4) + ',' + (y + 2) + ' L' + (x + 7) + ',' + (y + 10) + ' L' + x + ',' + (y + 5) + ' L' + (x - 7) + ',' + (y + 10) + ' L' + (x - 4) + ',' + (y + 2) + ' L' + (x - 10) + ',' + (y - 3) + ' L' + (x - 3) + ',' + (y - 3) + ' Z" fill="' + col + '" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>';
      else if(c.fo === 2) s += '<path' + st + ' d="M' + x + ',' + (y + 9) + ' C' + (x - 12) + ',' + (y + 1) + ' ' + (x - 10) + ',' + (y - 10) + ' ' + x + ',' + (y - 4) + ' C' + (x + 10) + ',' + (y - 10) + ' ' + (x + 12) + ',' + (y + 1) + ' ' + x + ',' + (y + 9) + ' Z" fill="' + col + '" stroke="' + K + '" stroke-width="2.5"/>';
      else s += '<circle' + st + ' cx="' + x + '" cy="' + y + '" r="8" fill="' + col + '" stroke="' + K + '" stroke-width="3"/>';
    });
    return [N(c.sur(Cir(6, 10, 4, '#cfc9e6') + Cir(260, 10, 4, '#cfc9e6') + T('M6,10 C60,50 100,50 133,26 C166,50 206,50 260,10', '#5a4630', 3) + s, 2))];
  }});

def('herbes', {w:126, h:136, p:26, z:'mur', deco:true, nom:'Herbes séchées', ic:'🌾',
  d:function(c){
    var cols = c.ti ? [[THEMES[c.ti].c, sombre(THEMES[c.ti].c, 0.3)], [clair(THEMES[c.ti].c, 0.35), THEMES[c.ti].c], [sombre(THEMES[c.ti].c, 0.15), sombre(THEMES[c.ti].c, 0.45)]] :
      [['#a77bf0', '#7d5bd0'], ['#4fb45f', '#25703c'], ['#ffd84a', '#c9a227']];
    function bouquet(x, c1, c2){
      return T('M' + x + ',18 V32', '#5a4630', 2.5) + R(x - 6, 28, 12, 8, 3, '#c58a4a', ' stroke-width="2.5"') +
        P('M' + (x - 12) + ',36 C' + (x - 18) + ',70 ' + (x - 8) + ',100 ' + x + ',128 C' + (x + 8) + ',100 ' + (x + 18) + ',70 ' + (x + 12) + ',36 Z', c1) +
        T('M' + x + ',40 V118 M' + (x - 6) + ',50 L' + x + ',66 M' + (x + 6) + ',56 L' + x + ',72 M' + (x - 6) + ',80 L' + x + ',94', c2, 2.5);
    }
    return [N(c.boite(6, 6, 120, 18, 0, c.p, BOIS()) + c.sur(bouquet(30, cols[0][0], cols[0][1]) + bouquet(63, cols[1][0], cols[1][1]) + bouquet(96, cols[2][0], cols[2][1]), 8))];
  }});

/* ---------- La nouvelle décoration (dans les cartons cadeaux) ---------- */
def('fanions', {w:270, h:86, p:6, z:'mur', deco:true, nf:3, nom:'Fanions', ic:'🎏',
  d:function(c){
    var cols = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.5), sombre(THEMES[c.ti].c, 0.2)] : ['#ff8fb3', '#ffd36a', '#8ff3ff', '#a6ef93', '#b796ff'], s = '';
    for(var i = 0; i < 8; i++){
      var x = 24 + i * 31, y = 14 + Math.sin((i + 0.5) / 8 * Math.PI) * 22, col = cols[i % cols.length];
      if(c.fo === 1) s += Cir(x, y + 14, 11, col, ' stroke-width="3"') + Cir(x, y + 14, 4, '#fff6d8', ' stroke-width="0"');
      else if(c.fo === 2) s += P('M' + (x - 12) + ',' + y + ' L' + (x + 12) + ',' + y + ' L' + (x + 12) + ',' + (y + 28) + ' L' + x + ',' + (y + 20) + ' L' + (x - 12) + ',' + (y + 28) + ' Z', col, ' stroke-width="3"');
      else s += P('M' + (x - 13) + ',' + y + ' L' + (x + 13) + ',' + y + ' L' + x + ',' + (y + 34) + ' Z', col, ' stroke-width="3"');
    }
    return [N(c.sur(Cir(6, 10, 4, '#cfc9e6') + Cir(264, 10, 4, '#cfc9e6') + T('M6,10 C70,48 200,48 264,10', '#5a4630', 3) + s, 2))];
  }});

def('cadre', {w:66, h:82, p:40, z:'petit', deco:true, nf:3, nom:'Petit cadre', ic:'🖼️',
  d:function(c){
    var fond = c.ti ? clair(THEMES[c.ti].c, 0.6) : '#bff3ff', img, cadre, dos;
    if(c.fo === 1){ img = emo(33, 38, 26, '❤️'); dos = Ell(33, 40, 28, 34, '#9a6a1c'); cadre = Ell(33, 40, 28, 34, G('or')) + Ell(33, 40, 20, 25, fond, ' stroke-width="3"'); }
    else if(c.fo === 2){ img = emo(33, 40, 24, '⭐'); var et = 'M33,4 L42,26 L64,28 L47,44 L52,68 L33,56 L14,68 L19,44 L2,28 L24,26 Z'; dos = P(et, '#9a6a1c'); cadre = P(et, G('or')) + Cir(33, 40, 15, fond, ' stroke-width="3"'); }
    else { img = emo(33, 40, 28, '🐱'); dos = R(6, 6, 54, 66, 6, '#9a6a1c'); cadre = R(6, 6, 54, 66, 6, G('or')) + R(13, 13, 40, 50, 3, fond, ' stroke-width="3"'); }
    /* debout, un peu penché en arrière sur sa béquille */
    var s = c.ligne([[33, 42, 24], [33, 82, 38]], K, 7) + c.ligne([[33, 42, 24], [33, 82, 38]], '#94603a', 3);
    s += c.surPlan(dos, [0, 2, 34.4], [1, 0, 0], [0, 1, -0.18], 33, 40) + c.surPlan(cadre + img, [0, 2, 28.4], [1, 0, 0], [0, 1, -0.18], 33, 40);
    return [N(s)];
  }});

def('vase', {w:66, h:114, p:56, z:'petit', deco:true, nf:3, nom:'Vase de fleurs', ic:'💐',
  d:function(c){
    var p = palette(c, ['#ff8fb3', '#ffd6e6', '#c0397a']), vase = c.ti ? THEMES[c.ti].c : '#8ff3ff', fl = '', cz = 28;
    if(c.fo === 1){        /* un tournesol */
      for(var i = 0; i < 10; i++){ var a = i / 10 * Math.PI * 2; fl += Ell((33 + Math.cos(a) * 15).toFixed(1), (24 + Math.sin(a) * 15).toFixed(1), 6, 6, c.ti ? p[0] : '#ffd84a', ' stroke-width="2.5"'); }
      fl = T('M33,40 V74', '#25703c', 4) + P('M33,64 C22,56 16,60 14,66 C22,70 28,68 33,64 Z', G('vert'), ' stroke-width="2.5"') + fl + Cir(33, 24, 10, '#7a4524', ' stroke-width="3"');
    } else if(c.fo === 2){ /* des marguerites */
      [[18, 30], [33, 18], [48, 32]].forEach(function(q){ for(var j = 0; j < 6; j++){ var b = j / 6 * Math.PI * 2; fl += Ell((q[0] + Math.cos(b) * 6).toFixed(1), (q[1] + Math.sin(b) * 6).toFixed(1), 4, 4, c.ti ? p[1] : '#ffffff', ' stroke-width="2"'); } fl += Cir(q[0], q[1], 3.5, '#ffd84a', ' stroke-width="2"'); });
      fl = T('M18,36 L28,74 M33,24 L33,74 M48,38 L38,74', '#25703c', 3) + fl;
    } else {               /* des tulipes */
      fl = T('M20,40 L28,74 M33,30 L33,74 M46,40 L38,74', '#25703c', 3.5);
      [[20, 34], [33, 24], [46, 34]].forEach(function(q){ fl += P('M' + (q[0] - 8) + ',' + (q[1] - 10) + ' L' + (q[0] - 4) + ',' + (q[1] - 4) + ' L' + q[0] + ',' + (q[1] - 12) + ' L' + (q[0] + 4) + ',' + (q[1] - 4) + ' L' + (q[0] + 8) + ',' + (q[1] - 10) + ' C' + (q[0] + 9) + ',' + (q[1] + 4) + ' ' + (q[0] - 9) + ',' + (q[1] + 4) + ' ' + (q[0] - 8) + ',' + (q[1] - 10) + ' Z', p[0], ' stroke-width="2.5"'); });
    }
    var s = c.tour(33, cz, [[76, 15], [84, 18], [94, 21], [104, 19], [110, 15], [114, 11]], vase, null) + c.cylindre(33, cz, 17, 70, 78, clair(vase, 0.35), '#24405a', ' stroke-width="3"');
    return [N(s + c.sur(fl, cz) + c.sur(reflet('M20,86 C18,94 20,102 24,106', 3), cz - 18))];
  }});

def('lanterne', {w:86, h:152, p:60, z:'mur', deco:true, nf:3, lumiere:true, nom:'Lanterne', ic:'🏮',
  d:function(c){
    var col = c.ti ? THEMES[c.ti].c : '#ff8a5c', cz = 30, P2 = c.p;
    var s = c.sur('<circle class="at-halo" cx="43" cy="84" r="62" fill="' + G('halo') + '"/>', cz) + c.sur(Cir(43, 0, 4, '#cfc9e6'), P2) + c.ligne([[43, 0, P2], [43, 20, cz + 10], [43, 26, cz]], '#5a4630', 3);
    if(c.fo === 1){        /* lanterne étoile, épaisse */
      var et = 'M43,30 L54,62 L86,64 L60,84 L70,116 L43,96 L16,116 L26,84 L0,64 L32,62 Z';
      s += c.sur(P(et, sombre(col, 0.35)), cz + 8) + c.sur(P(et, col) + P('M43,52 L48,68 L64,69 L51,78 L56,94 L43,84 L30,94 L35,78 L22,69 L38,68 Z', '#fff3c4', ' stroke-width="2"'), cz - 8);
    } else if(c.fo === 2){ /* lampe lune */
      var lune = 'M62,40 C30,36 14,70 26,98 C38,124 74,128 84,104 C64,112 40,100 38,76 C36,58 46,46 62,40 Z';
      s += c.sur(P(lune, '#d8c88a'), cz + 8) + c.sur(P(lune, '#fff3c4') + Cir(58, 60, 4, col, ' stroke-width="2"') + Cir(72, 84, 3, col, ' stroke-width="2"'), cz - 8);
    } else {               /* lanterne de papier ronde */
      s += c.cylindre(43, cz, 14, 24, 34, sombre(col, 0.35), sombre(col, 0.2), ' stroke-width="3"') +
        c.tour(43, cz, [[34, 22], [46, 33], [62, 38], [80, 39], [98, 37], [114, 30], [126, 20]], col, null);
      for(var y = 56; y <= 106; y += 25) s += c.arcAvant(43, cz, (y === 81 ? 39.5 : 37), y, sombre(col, 0.3), 2.5);
      s += c.sur(T('M43,34 C30,60 30,100 43,126 M43,34 C56,60 56,100 43,126', sombre(col, 0.3), 2.5) + reflet('M16,64 C14,74 14,86 18,96', 4), cz - 38) +
        c.cylindre(43, cz, 14, 124, 134, sombre(col, 0.35), null, ' stroke-width="3"') + c.sur(T('M43,134 V150', '#f5b945', 3), cz);
    }
    return [N(s)];
  }});
