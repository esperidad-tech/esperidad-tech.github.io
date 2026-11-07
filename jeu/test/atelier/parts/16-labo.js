
/* ==========================================================
   Le vrai matériel d'alchimiste (étape 2) : de la décoration, pour se faire un petit laboratoire.
   Grand alambic, cornues, mortier et pilon, balance, sablier, astrolabe, boule de cristal ;
   au mur : une étagère à fioles, un râtelier d'outils, une carte du ciel (et les herbes séchées).
   Trois formes chacun (et les 8 couleurs) ; tout dans la perspective de la pièce.
   ========================================================== */
function liquide(c, i){
  var l = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.4), sombre(THEMES[c.ti].c, 0.2)] : ['#7cf09a', '#ff7a59', '#8ff3ff', '#ffd84a', '#c9a8ff'];
  return l[i % l.length];
}
/* une petite fiole debout (corps de révolution) : x, z au sol de la fiole, b : son bas, h : sa hauteur */
function fiole3d(c, x, z, b, h, col, forme){
  var r = h * 0.3, s;
  if(forme === 1) s = c.tour(x, z, [[b, r * 1.15], [b - h * 0.45, r * 0.4]], G('verre'), null, ' stroke-width="3"') + c.tour(x, z, [[b - 2, r], [b - h * 0.28, r * 0.75]], col, clair(col, 0.4), ' stroke-width="0" opacity=".9"');
  else if(forme === 2) s = c.cylindre(x, z, r * 0.55, b - h * 0.9, b, G('verre'), null, ' stroke-width="3"') + c.cylindre(x, z, r * 0.45, b - h * 0.5, b - 2, col, clair(col, 0.4), ' stroke-width="0"');
  else s = c.tour(x, z, [[b, r * 0.7], [b - h * 0.2, r], [b - h * 0.45, r * 0.75], [b - h * 0.55, r * 0.35]], G('verre'), null, ' stroke-width="3"') + c.tour(x, z, [[b - 2, r * 0.6], [b - h * 0.18, r * 0.85], [b - h * 0.3, r * 0.82]], col, clair(col, 0.4), ' stroke-width="0" opacity=".9"');
  var haut = forme === 2 ? b - h * 0.9 : b - h * 0.55;
  return s + c.cylindre(x, z, Math.max(3, r * 0.32), b - h, haut + 2, G('verre'), null, ' stroke-width="2.5"') + c.cylindre(x, z, Math.max(3.5, r * 0.36), b - h - 6, b - h + 2, '#c58a4a', '#e0a868', ' stroke-width="2"');
}

/* ---------- Le grand alambic ---------- */
def('alambic_labo', {w:156, h:214, p:110, z:'sol', deco:true, nf:3, nom:'Grand alambic', ic:'⚗️',
  d:function(c){
    var col = liquide(c, 2), cz = 50, s = '';
    var bulles = c.sur('<g class="at-bulles"><circle cx="132" cy="170" r="3" fill="#fff" opacity=".8"/><circle cx="138" cy="178" r="2" fill="#fff" opacity=".7"/></g>', cz - 16);
    if(c.fo === 1){        /* en verre, sur un trépied, une flamme bleue */
      s += c.ligne([[64, 150, cz], [30, 212, cz + 30]], K, 6) + c.ligne([[64, 150, cz], [98, 212, cz + 30]], K, 6) + c.ligne([[64, 150, cz], [64, 212, cz - 34]], K, 6) +
        c.sur('<path class="at-flamme" d="M64,150 c-8,-8 -4,-16 0,-22 c4,6 8,14 0,22 Z" fill="#8ff3ff" stroke="#3fa9d6" stroke-width="2"/>', cz) +
        c.tour(64, cz, [[136, 26], [118, 42], [96, 40], [78, 26], [66, 12]], G('verre'), null, ' stroke-width="4"') + c.tour(64, cz, [[132, 22], [118, 37], [108, 38]], liquide(c, 0), clair(liquide(c, 0), 0.4), ' stroke-width="0" opacity=".8"');
    } else {               /* en cuivre, sur un petit four de briques (2 : doré, avec des pierres précieuses) */
      var dore = c.fo === 2;
      s += c.boite(24, 150, 106, 212, cz - 36, cz + 36, UNI(G('terre'), '#e08a5a', '#94441f')) + c.sur(T('M24,170 H106 M24,190 H106 M50,150 V170 M80,170 V190 M50,190 V212', '#7a3418', 2.5) +
        P('M50,212 V188 C50,176 80,176 80,188 V212 Z', '#2a1208') + '<ellipse class="at-braise" cx="65" cy="204" rx="11" ry="6" fill="#ff8a3c"/>', cz - 36);
      s += c.tour(64, cz, [[150, 30], [130, 42], [106, 40], [86, 28], [72, 14]], G(dore ? 'or' : 'cuivre'), null);
      if(dore) s += c.sur(Cir(48, 118, 6, '#8ff3ff', ' stroke-width="2.5"') + Cir(80, 112, 6, '#ff8fb3', ' stroke-width="2.5"'), cz - 40);
    }
    s += c.cylindre(64, cz, 9, 40, 72, G(c.fo === 1 ? 'verre' : 'cuivre'), G('cuivre'));
    var tuyau = bezier3([64, 44, cz], [80, 6, cz], [126, 10, cz], [132, 132, cz - 16], 14);
    s += c.ligne(tuyau, K, 10) + c.ligne(tuyau, c.fo === 1 ? '#d8f6ff' : '#e08a4a', 5);
    s += c.tour(132, cz - 16, [[204, 18], [190, 24], [172, 22], [160, 9]], G('verre'), null, ' stroke-width="4"') + c.tour(132, cz - 16, [[201, 15], [190, 21], [184, 21]], col, clair(col, 0.4), ' stroke-width="0" opacity=".85"') +
      c.cylindre(132, cz - 16, 6, 132, 162, G('verre'), null, ' stroke-width="3"') + bulles;
    return [N(s + c.sur(reflet('M44,110 C42,100 46,92 52,88', 3), cz - 40))];
  }});

/* ---------- Les cornues : deux ou trois fioles au long cou penché, sur un support ---------- */
def('cornues', {w:132, h:112, p:64, z:'petit', deco:true, nf:3, nom:'Cornues', ic:'🧪',
  d:function(c){
    var cz = 32, s = '';
    if(c.fo === 0) s += c.boite(4, 96, 128, 112, 6, 58, BOIS());
    else if(c.fo === 1) s += c.ovale(66, cz, 60, 26, 100, 112, G('metal'), '#6a6290');
    else s += c.boite(8, 98, 124, 112, 8, 56, UNI(G('pierre'), '#c9c5e2', '#77729c'));
    [[34, 0], [92, 1]].forEach(function(q, i){
      var x = q[0], col = liquide(c, i + (c.fo === 2 ? 2 : 0)), b = 98;
      s += c.tour(x, cz, [[b, 14], [b - 16, 24], [b - 34, 20], [b - 44, 8]], G('verre'), null, ' stroke-width="3.5"') + c.tour(x, cz, [[b - 2, 12], [b - 14, 21], [b - 20, 21]], col, clair(col, 0.4), ' stroke-width="0" opacity=".9"');
      var cou = [[x, b - 42, cz], [x + 10, b - 64, cz], [x + 26, b - 72, cz], [x + 40, b - 66, cz]];
      s += c.ligne(cou, K, 10) + c.ligne(cou, '#e6fbff', 5);
    });
    if(c.fo === 2) s += fiole3d(c, 66, cz + 12, 98, 40, liquide(c, 4), 2);
    return [N(s)];
  }});

/* ---------- Le mortier et son pilon ---------- */
def('mortier_pilon', {w:92, h:82, p:76, z:'petit', deco:true, nf:3, nom:'Mortier et pilon', ic:'🥣',
  d:function(c){
    var cz = 38, f = c.fo === 1 ? G('bois') : c.fo === 2 ? G('cuivre') : G('pierre'), haut = c.fo === 1 ? G('boisH') : c.fo === 2 ? '#f0b07a' : '#8c88ad';
    var s = c.tour(46, cz, [[40, 36], [54, 34], [68, 26], [80, 16]], f, haut) + c.disque(46, cz, 29, 41, '#4a4668');
    if(c.fo === 2) s += c.arcAvant(46, cz, 34.5, 52, '#94481f', 3);
    s += c.disque(46, cz + 4, 14, 42, liquide(c, 3), ' stroke-width="0" opacity=".85"');
    s += c.ligne([[54, 44, cz], [80, 2, cz + 12]], K, 13) + c.ligne([[54, 44, cz], [80, 2, cz + 12]], c.fo === 1 ? '#d29a5e' : '#d6d0ee', 7);
    return [N(s + c.sur(reflet('M18,48 C20,60 28,66 36,68', 3), cz - 36))];
  }});

/* ---------- La balance à plateaux ---------- */
def('balance', {w:122, h:112, p:56, z:'petit', deco:true, nf:3, nom:'Balance', ic:'⚖️',
  d:function(c){
    var cz = 28, met = c.fo === 1 ? G('cuivre') : c.fo === 2 ? G('metal') : G('or'), clr = c.fo === 1 ? '#f0b07a' : c.fo === 2 ? '#6a6290' : '#f7d778';
    var s = c.fo === 2 ? c.boite(36, 98, 86, 112, 10, 46, BOIS()) : c.tour(61, cz, [[98, 14], [110, 26]], met, clr);
    s += c.cylindre(61, cz, 4, 28, 100, met, met);
    var fleau = c.ligne([[14, 32, cz], [108, 32, cz]], K, 8) + c.ligne([[14, 32, cz], [108, 32, cz]], c.fo === 2 ? '#a8a2c8' : '#f5b945', 4);
    [[14], [108]].forEach(function(q){ var x = q[0]; fleau += c.ligne([[x, 32, cz], [x - 10, 72, cz]], '#8a6a3a', 2) + c.ligne([[x, 32, cz], [x + 10, 72, cz]], '#8a6a3a', 2) + c.cylindre(x, cz, 15, 72, 80, met, clr, '', 7); });
    fleau += c.sur(emo(14, 64, 14, c.fo === 1 ? '🌿' : '💎') + emo(108, 64, 14, c.fo === 1 ? '🍄' : '⭐'), cz);
    return [N(s + '<g class="at-balance">' + fleau + '</g>' + c.boule(61, 26, cz, 6, met))];
  }});

/* ---------- Le sablier ---------- */
def('sablier', {w:62, h:104, p:62, z:'petit', deco:true, nf:3, nom:'Sablier', ic:'⏳',
  d:function(c){
    var cz = 31, bois = c.fo === 1 ? G('or') : c.fo === 2 ? G('metal') : G('bois'), bh = c.fo === 1 ? '#f7d778' : c.fo === 2 ? '#6a6290' : G('boisH');
    var sable = c.ti ? THEMES[c.ti].c : '#f2c230';
    var s = c.cylindre(31, cz, 28, 94, 104, bois, bh);
    [[8, cz - 14], [54, cz - 14], [31, cz + 24]].forEach(function(q){ if(q[1] > cz) s += c.cylindre(q[0], q[1], 3, 10, 96, bois, null); });
    s += c.tour(31, cz, [[14, 20], [30, 20], [48, 6], [54, 4], [60, 6], [78, 20], [94, 20]], G('verre'), null, ' stroke-width="3"');
    s += c.tour(31, cz, [[30, 15], [44, 7], [52, 3]], sable, clair(sable, 0.3), ' stroke-width="0"') + c.tour(31, cz, [[76, 12], [92, 18]], sable, clair(sable, 0.3), ' stroke-width="0"');
    s += c.sur('<rect class="at-sable" x="30" y="52" width="2" height="26" fill="' + sable + '"/>', cz);
    [[8, cz - 14], [54, cz - 14]].forEach(function(q){ s += c.cylindre(q[0], q[1], 3, 10, 96, bois, null); });
    s += c.cylindre(31, cz, 28, 4, 14, bois, bh);
    return [N(s)];
  }});

/* ---------- L'astrolabe : des anneaux autour d'un petit globe ---------- */
def('astrolabe', {w:112, h:132, p:90, z:'petit', deco:true, nf:3, nom:'Astrolabe', ic:'🧭',
  d:function(c){
    var cz = 45, met = c.fo === 1 ? G('cuivre') : c.fo === 2 ? G('metal') : G('or'), col = c.fo === 2 ? '#a8a2c8' : c.fo === 1 ? '#e08a4a' : '#f5b945';
    var s = c.tour(56, cz, [[116, 12], [124, 26], [132, 34]], c.fo === 2 ? G('metal') : G('bois'), c.fo === 2 ? '#6a6290' : G('boisH')) + c.cylindre(56, cz, 4, 98, 118, met, null);
    function anneau(pts, w){ return T(lisse(pts, true), K, w + 4) + T(lisse(pts, true), col, w); }
    var horiz = [], vert = [], biais = [];
    for(var i = 0; i < 28; i++){
      var a = i / 28 * Math.PI * 2;
      horiz.push(c.Q(56 + Math.cos(a) * 44, 56, cz + Math.sin(a) * 44));
      vert.push(c.Q(56 + Math.cos(a) * 44, 56 + Math.sin(a) * 44, cz));
      biais.push(c.Q(56 + Math.cos(a) * 40, 56 + Math.sin(a) * 40 * 0.6, cz + Math.sin(a) * 40 * 0.8));
    }
    s += anneau(vert, 4) + c.boule(56, 56, cz, c.fo === 1 ? 20 : 16, c.fo === 2 ? G('cristal') : '#4f73d9') +
      c.sur(c.fo === 2 ? '' : P('M46,50 C52,44 60,46 62,52 C58,58 50,60 46,50 Z M60,62 C64,60 68,62 66,66 Z', '#4fb45f', ' stroke-width="2"'), cz - 16) + anneau(horiz, 3.5) + anneau(biais, 3);
    s += c.sur(etoile(56, 4, 8, '#fff3c4', ' stroke-width="2"'), cz);
    return [N(s)];
  }});

/* ---------- La boule de cristal ---------- */
def('boule_cristal', {w:92, h:112, p:70, z:'petit', deco:true, nf:3, nom:'Boule de cristal', ic:'🔮',
  d:function(c){
    var cz = 35, col = c.ti ? clair(THEMES[c.ti].c, 0.4) : ['#bff3ff', '#ffd0e2', '#d6c4ff'][c.fo];
    var s = c.sur('<circle class="at-halo" cx="46" cy="48" r="58" fill="' + G('haloC') + '"/>', cz);
    if(c.fo === 1) s += c.ligne([[46, 86, cz], [20, 112, cz + 24]], K, 7) + c.ligne([[46, 86, cz], [72, 112, cz + 24]], K, 7) + c.ligne([[46, 86, cz], [46, 112, cz - 30]], K, 7) + c.ovale(46, cz, 22, 18, 82, 90, G('metal'), '#6a6290');
    else if(c.fo === 2) s += c.boite(18, 86, 74, 112, 10, 60, BOIS()) + c.boite(14, 80, 78, 88, 6, 64, UNI(G('boisH'), G('boisH'), G('boisS')));
    else s += c.tour(46, cz, [[82, 16], [96, 22], [110, 28]], G('or'), G('or'));
    s += c.boule(46, 48, cz, 34, 'url(#atg-cristal)') + c.sur('<circle cx="46" cy="48" r="26" fill="' + col + '" opacity=".35"/>' +
      '<path class="at-tourne" d="M32,48 C34,32 58,32 60,48 C58,62 38,60 40,48" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>' + reflet('M24,40 C26,28 34,20 44,18', 4), cz - 20);
    return [N(s)];
  }});

/* ---------- Au mur : l'étagère à fioles ---------- */
def('etagere_fioles', {w:190, h:98, p:46, z:'mur', deco:true, nf:3, nom:'Étagère à fioles', ic:'🧴',
  d:function(c){
    var s = c.boite(14, 82, 26, 98, 8, 40, SOMBRE()) + c.boite(164, 82, 176, 98, 8, 40, SOMBRE());
    if(c.fo === 1) s += c.sur(T('M20,-6 L20,82 M170,-6 L170,82', '#8a6a3a', 3) + Cir(20, -6, 4, '#cfc9e6') + Cir(170, -6, 4, '#cfc9e6'), 23);
    s += c.boite(2, 72, 188, 84, 0, 46, c.fo === 2 ? UNI(G('pierre'), '#c9c5e2', '#77729c') : UNI(G('boisH'), G('boisH'), G('boisS')));
    for(var i = 0; i < 5; i++) s += fiole3d(c, 24 + i * 35, 23, 72, 50 + (i % 2) * 10, liquide(c, i), (i + c.fo) % 3);
    return [N(s)];
  }});

/* ---------- Au mur : le râtelier d'outils (louches, cuillères, pinces) ---------- */
def('ratelier', {w:192, h:132, p:30, z:'mur', deco:true, nf:3, nom:'Râtelier d\'outils', ic:'🥄',
  d:function(c){
    var met = c.fo === 1 ? '#e08a4a' : c.fo === 2 ? '#f5b945' : '#a8a2c8';
    var s = c.boite(4, 6, 188, 26, 0, 22, c.fo === 2 ? UNI(G('pierre'), '#c9c5e2', '#77729c') : BOIS());
    var outils = '';
    [[28, 'louche'], [62, 'cuillere'], [96, 'pince'], [130, 'louche'], [164, 'spatule']].forEach(function(q){
      var x = q[0];
      outils += Cir(x, 18, 4, '#cfc9e6');
      if(q[1] === 'louche') outils += T('M' + x + ',20 V96', K, 7) + T('M' + x + ',20 V96', met, 3.5) + P('M' + (x - 14) + ',96 C' + (x - 14) + ',118 ' + (x + 14) + ',118 ' + (x + 14) + ',96 Z', met);
      else if(q[1] === 'cuillere') outils += T('M' + x + ',20 V98', K, 6) + T('M' + x + ',20 V98', met, 3) + Ell(x, 108, 9, 13, met);
      else if(q[1] === 'pince') outils += T('M' + x + ',20 L' + (x - 9) + ',120 M' + x + ',20 L' + (x + 9) + ',120', K, 6) + T('M' + x + ',20 L' + (x - 9) + ',120 M' + x + ',20 L' + (x + 9) + ',120', met, 2.5);
      else outils += T('M' + x + ',20 V92', K, 7) + T('M' + x + ',20 V92', '#c98450', 3.5) + R(x - 10, 92, 20, 30, 4, met);
    });
    return [N(s + c.sur(outils, 12))];
  }});

/* ---------- Au mur : la carte du ciel (à plat, dans son cadre) ---------- */
def('carte_ciel', {w:162, h:132, p:10, z:'mur', deco:true, nf:3, nom:'Carte du ciel', ic:'🗺️',
  d:function(c){
    var fond = c.ti ? sombre(THEMES[c.ti].c, 0.55) : '#1d2550', art = '';
    if(c.fo === 1){        /* un parchemin roulé */
      art = P('M14,14 L148,14 L148,118 L14,118 Z', '#f3e2bf') + T('M30,40 L60,30 L92,56 L126,40 M40,90 L70,74 L104,96', '#8a5a3a', 2.5) +
        etoile(60, 30, 6, '#c0392b', ' stroke-width="1.5"') + etoile(92, 56, 6, '#c0392b', ' stroke-width="1.5"') + etoile(70, 74, 5, '#c0392b', ' stroke-width="1.5"');
      return [N(c.boite(6, 8, 156, 124, 0, c.p, UNI('#e6d3a8')) + c.sur(art, 0) + c.tube([4, 10, 4], [158, 10, 4], 7, '#c9b48a', '#e6d3a8', '#e6d3a8') + c.tube([4, 122, 4], [158, 122, 4], 7, '#c9b48a', '#e6d3a8', '#e6d3a8'))];
    }
    art = '<rect x="16" y="16" width="130" height="100" fill="' + fond + '"/>';
    var st = [[34, 34], [62, 50], [92, 36], [118, 58], [50, 88], [86, 96], [124, 92]];
    st.forEach(function(q){ art += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.5" fill="#fff3c4"/>'; });
    art += T('M34,34 L62,50 L92,36 L118,58 M50,88 L86,96 L124,92', '#bff3ff', 1.5, ' opacity=".7"') + (c.fo === 2 ? lune(120, 30, 12, '#fff3c4', ' stroke-width="2"') : etoile(78, 70, 9, '#ffd36a', ' stroke-width="2"'));
    return [N(c.sur(T('M60,8 L81,-8 L102,8', K, 3), c.p) + c.boite(6, 6, 156, 126, 0, c.p, UNI(c.fo === 2 ? G('bois') : G('or'), '#f7d778', '#9a6a1c')) + c.sur(art + T('M16,16 H146 V116 H16 Z', K, 3), 0))];
  }});
