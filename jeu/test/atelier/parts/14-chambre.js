
/* ==========================================================
   La chambre : ses meubles et sa décoration (étape 2), dans la même perspective que tout le reste.
   Tout se décore au toucher (c.fo : la forme, c.ti : le thème) et se range dans le carton 📦.
   chambre:true : sort d'un carton posé dans la chambre (et s'y installe) ; on peut ensuite le mettre où l'on veut, même dans l'atelier.
   ========================================================== */
function etoile(cx, cy, r, f, xx){
  var d = '';
  for(var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L' : 'M') + f1(cx + Math.cos(a) * rr) + ',' + f1(cy + Math.sin(a) * rr); }
  return P(d + ' Z', f, xx || ' stroke-width="3"');
}
function coeurP(cx, cy, r, f, xx){
  return P('M' + cx + ',' + f1(cy + r * 0.9) + ' C' + f1(cx - r * 1.5) + ',' + f1(cy - r * 0.1) + ' ' + f1(cx - r * 0.8) + ',' + f1(cy - r * 1.2) + ' ' + cx + ',' + f1(cy - r * 0.45) +
    ' C' + f1(cx + r * 0.8) + ',' + f1(cy - r * 1.2) + ' ' + f1(cx + r * 1.5) + ',' + f1(cy - r * 0.1) + ' ' + cx + ',' + f1(cy + r * 0.9) + ' Z', f, xx || ' stroke-width="3"');
}
function nuageD(x, y, w, h){
  var r = h / 2;
  return 'M' + f1(x + r) + ',' + f1(y + h) + ' C' + f1(x - r * 0.2) + ',' + f1(y + h) + ' ' + f1(x - r * 0.1) + ',' + f1(y + r * 0.2) + ' ' + f1(x + r * 1.1) + ',' + f1(y + r * 0.5) +
    ' C' + f1(x + w * 0.3) + ',' + f1(y - r * 0.6) + ' ' + f1(x + w * 0.62) + ',' + f1(y - r * 0.5) + ' ' + f1(x + w * 0.68) + ',' + f1(y + r * 0.35) +
    ' C' + f1(x + w + r * 0.2) + ',' + f1(y + r * 0.1) + ' ' + f1(x + w + r * 0.3) + ',' + f1(y + h) + ' ' + f1(x + w - r * 0.4) + ',' + f1(y + h) + ' Z';
}
function nuageP(x, y, w, h, f, xx){ return P(nuageD(x, y, w, h), f, xx); }
/* un croissant de lune (ouvert vers la droite) */
function lune(cx, cy, r, f, xx){
  var hx = f1(cx + r * 0.5), ht = f1(cy - r * 0.866), hb = f1(cy + r * 0.866);
  return P('M' + hx + ',' + ht + ' A' + r + ',' + r + ' 0 1 0 ' + hx + ',' + hb + ' A' + f1(r * 0.95) + ',' + f1(r * 0.95) + ' 0 0 1 ' + hx + ',' + ht + ' Z', f, xx || ' stroke-width="3"');
}
/* une forme plate qui a de l'épaisseur : son dos (plus sombre) un peu derrière, puis sa face */
function epais(c, svgDos, svgFace, z, e){ return c.sur(svgDos, z + (e || 10)) + c.sur(svgFace, z); }
/* un coussin moelleux : une boîte aux coins arrondis (x0..x1, y0 le dessus, y1 le bas, z0..z1) */
function moelleux(c, x0, y0, x1, y1, z0, z1, f, fh, r){
  r = r === undefined ? 10 : r;
  var mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, haut = [], tout = [];
  [[x0 + r, z0], [mx, z0 - 2], [x1 - r, z0], [x1 + 2, mz], [x1 - r, z1], [mx, z1 + 2], [x0 + r, z1], [x0 - 2, mz]].forEach(function(q){
    haut.push(c.Q(q[0], y0, q[1])); tout.push(c.Q(q[0], y0, q[1]), c.Q(q[0], y1, q[1]));
  });
  return P(lisse(enveloppe(tout), true, 0.9), f) + P(lisse(haut, true), fh || f);
}

/* ---------- Le lit : bois, baldaquin, cabane, fer forgé, nuage ---------- */
var LITS = [['#5f8fd9', '#bcd6ff', '#2f4f8f'], ['#e86f9c', '#ffd0e2', '#9c2f5a'], ['#6cbf7a', '#d2f4d6', '#2f7a42'], ['#f2b63c', '#ffe9b0', '#a86f14'], ['#9d7ee8', '#e2d6ff', '#5a3fa8']];
def('lit', {w:330, h:220, p:250, z:'sol', deco:true, chambre:true, profil:true, nf:5, nom:'Lit', ic:'🛏️', surf:[{x0:-110, x1:110, y:-112, z:150}],
  d:function(c){
    var p = palette(c, LITS[c.fo]), P2 = c.p, f = c.fo, s = '', tete = '', pied = '';
    var FER = UNI(G('metal'), '#6a6290', '#352c4f');
    /* la tête du lit, contre le mur (au fond), selon le style */
    if(f === 0){            /* en bois, tête de lit arrondie */
      tete = c.boite(8, 40, 322, 190, P2 - 24, P2, BOIS()) + c.sur(P('M8,60 C8,10 322,10 322,60 L322,64 L8,64 Z', G('boisH')) + R(30, 70, 270, 96, 10, G('boisC'), ' stroke-width="3"') + Cir(165, 36, 7, G('or')), P2 - 24);
      pied = c.boite(8, 126, 322, 190, 0, 18, BOIS());
    } else if(f === 1){     /* à baldaquin : quatre colonnes et un ciel de lit */
      [[8, P2 - 18], [304, P2 - 18]].forEach(function(q){ s += c.boite(q[0], 0, q[0] + 18, 216, q[1], q[1] + 18, BOIS()); });
      tete = c.boite(26, 60, 304, 190, P2 - 20, P2, BOIS()) + c.sur(R(44, 76, 242, 96, 10, p[1], ' stroke-width="3"'), P2 - 20);
      pied = c.boite(8, 0, 26, 216, 0, 18, BOIS()) + c.boite(304, 0, 322, 216, 0, 18, BOIS()) + c.boite(0, -4, 330, 16, -4, P2 + 4, UNI(p[0], clair(p[0], 0.2), sombre(p[0], 0.2))) +
        c.sur(P('M0,16 L330,16 L330,30 C300,46 272,30 246,46 C220,30 192,46 166,30 C138,46 112,30 84,46 C58,30 30,46 0,30 Z', p[0]), -4);
    } else if(f === 2){     /* lit-cabane : un toit de poutres au-dessus */
      var poutre = function(a, b){ return c.ligne([a, b], K, 14) + c.ligne([a, b], '#c98450', 8); };
      s += poutre([18, 190, P2 - 8], [18, 70, P2 - 8]) + poutre([312, 190, P2 - 8], [312, 70, P2 - 8]) + poutre([18, 70, P2 - 8], [165, -6, P2 - 8]) + poutre([312, 70, P2 - 8], [165, -6, P2 - 8]) + poutre([165, -6, P2 - 8], [165, -6, 8]);
      tete = c.boite(26, 90, 304, 190, P2 - 20, P2, BOIS()) + c.sur(etoile(165, 60, 14, '#fff3c4'), P2 - 8);
      pied = poutre([18, 190, 8], [18, 70, 8]) + poutre([312, 190, 8], [312, 70, 8]) + poutre([18, 70, 8], [165, -6, 8]) + poutre([312, 70, 8], [165, -6, 8]);
    } else if(f === 3){     /* fer forgé, avec des boucles */
      tete = c.tube([14, 196, P2 - 10], [14, 40, P2 - 10], 7, G('metal'), null, G('or')) + c.tube([316, 196, P2 - 10], [316, 40, P2 - 10], 7, G('metal'), null, G('or')) +
        c.sur(T('M14,60 C60,20 110,90 165,50 C220,90 270,20 316,60 M14,110 C60,80 110,140 165,104 C220,140 270,80 316,110', K, 8) + T('M14,60 C60,20 110,90 165,50 C220,90 270,20 316,60 M14,110 C60,80 110,140 165,104 C220,140 270,80 316,110', '#a8a2c8', 3.5), P2 - 10);
      pied = c.tube([14, 196, 10], [14, 100, 10], 7, G('metal'), null, G('or')) + c.tube([316, 196, 10], [316, 100, 10], 7, G('metal'), null, G('or')) +
        c.sur(T('M14,120 C90,96 240,96 316,120', K, 8) + T('M14,120 C90,96 240,96 316,120', '#a8a2c8', 3.5), 10);
    } else {                /* lit-nuage, avec des étoiles */
      tete = epais(c, nuageP(-6, 10, 342, 150, sombre(p[1], 0.15)), nuageP(-6, 10, 342, 150, p[1], ' stroke-width="5"') + etoile(60, 60, 13, '#fff3c4') + etoile(270, 44, 9, '#fff3c4') + lune(160, 54, 16, '#fff3c4'), P2 - 16, 10);
      pied = epais(c, nuageP(0, 110, 330, 70, sombre(p[1], 0.15)), nuageP(0, 110, 330, 70, p[1], ' stroke-width="5"'), 0, 10);
    }
    /* le cadre et ses pieds, le matelas, l'oreiller, la couette */
    var cadre = (f === 3 ? FER : BOIS());
    s += tete + pieds(c, 20, 310, 186, 220, 14, P2 - 14, 18, f === 3 ? FER : SOMBRE()) + c.boite(16, 150, 314, 190, 10, P2 - 10, cadre) +
      c.boite(24, 118, 306, 152, 14, P2 - 22, UNI('#f6ecd2', '#fffaf0', '#e4d6b4')) +
      moelleux(c, 60, 104, 270, 120, P2 - 80, P2 - 30, '#e9e0c8', '#fffaf0', 18) +
      c.boite(20, 110, 310, 158, 8, P2 - 96, UNI(p[0], clair(p[0], 0.18), sombre(p[0], 0.22))) +
      c.boite(20, 104, 310, 112, P2 - 112, P2 - 96, UNI(clair(p[0], 0.5), '#fffaf0', clair(p[0], 0.3)));
    var motif = '';
    if(f === 0) for(var i = 0; i < 5; i++) for(var j = 0; j < 3; j++) if((i + j) % 2) motif += '<rect x="' + (30 + i * 54) + '" y="' + (-60 + j * 40) + '" width="52" height="38" rx="5" fill="' + p[1] + '" opacity=".75"/>';
    if(f === 1 || f === 3) motif = T('M30,-40 C110,-50 220,-50 300,-40 M30,10 C110,0 220,0 300,10', p[1], 5, ' stroke-dasharray="12 9"');
    if(f === 2) for(var k = 0; k < 6; k++) motif += Cir(50 + k * 46, -30 + (k % 2) * 34, 8, p[1], ' stroke-width="2.5"');
    if(f === 4) motif = lune(110, -16, 14, p[1], ' stroke-width="2.5"') + etoile(190, -36, 11, '#fff3c4', ' stroke-width="2.5"') + etoile(250, 10, 8, '#fff3c4', ' stroke-width="2.5"');
    s += c.dessus(motif, 110, (P2 - 88) / 2) + c.sur(T('M24,130 H306', sombre(p[0], 0.35), 3, ' opacity=".5"'), 8);
    return [N(s + pied)];
  }});

/* ---------- Le grand tapis : rond à fleurs, d'Orient, étoile, arc-en-ciel, tressé (couché sur le plancher) ---------- */
var GTAPIS = [['#f06eaa', '#ffd0e2', '#a8326a'], ['#c0392b', '#f5b945', '#6b1d16'], ['#3d8ef0', '#fff3c4', '#1f4f9a'], ['#9d6ee3', '#ffd36a', '#4cbb5c'], ['#c98450', '#f3e7cb', '#7d4626']];
def('tapis_grand', {w:440, h:4, p:270, z:'tapis', deco:true, chambre:true, nf:5, nom:'Grand tapis', ic:'🟪',
  d:function(c){
    var p = palette(c, GTAPIS[c.fo]), W = 440, D = 270, cx = W / 2, cy = D / 2, s = '', i;
    if(c.fo === 0){
      var fl = '';
      for(i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2, x = cx + Math.cos(a) * 168, y = cy + Math.sin(a) * 100; fl += Cir(f1(x), f1(y), 13, p[1], ' stroke-width="3"') + Cir(f1(x), f1(y), 5, '#ffd36a', ' stroke-width="0"'); }
      s = Ell(cx, cy, 214, 130, p[0]) + Ell(cx, cy, 140, 82, p[1], ' stroke-width="3" opacity=".6"') + Ell(cx, cy, 64, 38, p[2], ' stroke-width="3"') + fl;
    } else if(c.fo === 1){
      var fr = '';
      for(var y2 = 14; y2 < D - 10; y2 += 14) fr += 'M-14,' + y2 + ' H6 M' + (W - 6) + ',' + y2 + ' H' + (W + 14) + ' ';
      s = T(fr, '#f3e7cb', 4) + R(4, 4, W - 8, D - 8, 8, p[0]) + R(30, 26, W - 60, D - 52, 6, 'none', ' stroke="' + p[1] + '" stroke-width="6" stroke-dasharray="16 10"') +
        P('M' + cx + ',' + (cy - 80) + ' L' + (cx + 110) + ',' + cy + ' L' + cx + ',' + (cy + 80) + ' L' + (cx - 110) + ',' + cy + ' Z', p[1]) + P('M' + cx + ',' + (cy - 40) + ' L' + (cx + 55) + ',' + cy + ' L' + cx + ',' + (cy + 40) + ' L' + (cx - 55) + ',' + cy + ' Z', p[2], ' stroke-width="4"') +
        Cir(70, cy, 13, p[1]) + Cir(W - 70, cy, 13, p[1]);
    } else if(c.fo === 2){
      var e = '';
      for(i = 0; i < 10; i++){ var b = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.48 : 1; e += (i ? ' L' : 'M') + f1(cx + Math.cos(b) * 214 * rr) + ',' + f1(cy + Math.sin(b) * 132 * rr); }
      s = P(e + ' Z', p[0]) + Ell(cx, cy, 56, 34, p[1], ' stroke-width="3"') + etoile(cx, cy, 22, '#fff3c4');
    } else if(c.fo === 3){
      var cols = c.ti ? [p[2], p[0], p[1], clair(p[0], 0.75)] : ['#e0443a', '#f58a2a', '#f2c230', '#4cbb5c'];
      s = Ell(cx, cy, 214, 130, c.ti ? sombre(p[0], 0.15) : '#3d8ef0');
      cols.forEach(function(col, k){ s += Ell(cx, cy, 214 - (k + 1) * 40, 130 - (k + 1) * 24, col, ' stroke-width="3"'); });
      s += nuageP(cx - 90, cy - 20, 80, 40, '#fff', ' stroke-width="3"') + nuageP(cx + 20, cy - 4, 70, 34, '#fff', ' stroke-width="3"');
    } else {
      s = Ell(cx, cy, 214, 130, p[0]);
      for(i = 1; i < 6; i++) s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (214 - i * 34) + '" ry="' + (130 - i * 21) + '" fill="none" stroke="' + (i % 2 ? p[1] : p[2]) + '" stroke-width="12" opacity=".8"/>';
    }
    return [N(c.surPlan(s, [0, 0, D], [1, 0, 0], [0, 0, -1], cx, cy))];
  }});

/* ---------- Les rideaux : devant une fenêtre (le milieu reste ouvert), collés au mur ---------- */
var RIDEAUX = [['#d9544f', '#ff9b8f', '#8a2f3a'], ['#4f73d9', '#a8c4ff', '#2a3a7d'], ['#f2b63c', '#ffe3a3', '#a86f14'], ['#f3f0ff', '#ffffff', '#b9b3d2'], ['#3a2c7a', '#8d7ae0', '#1c1340']];
def('rideaux', {w:260, h:300, p:26, z:'mur', deco:true, chambre:true, fenetre:true, nf:5, nom:'Rideaux', ic:'🪟',
  d:function(c){
    var p = palette(c, RIDEAUX[c.fo]), op = c.fo === 3 ? ' fill-opacity=".62"' : '', s = '';
    function pan(g){   /* un pan de rideau, à gauche (g) ou à droite (miroir) */
      var d, plis;
      if(c.fo === 1 || c.fo === 4){ d = 'M10,14 L78,14 C70,90 52,150 62,190 C72,230 86,262 70,296 L10,296 Z'; plis = 'M28,20 C26,110 22,190 28,290 M48,20 C46,100 40,170 46,286'; }
      else { d = 'M10,14 L74,14 C78,100 70,200 78,296 L10,296 Z'; plis = 'M28,20 V290 M48,20 C50,110 46,200 52,290'; }
      var t = P(d, p[0], op) + T(plis, p[2], 3, ' opacity=".45"');
      if(c.fo === 1) t += R(46, 182, 32, 14, 6, p[1], ' stroke-width="3"') + Cir(62, 189, 6, G('or'));
      if(c.fo === 4){ t += P('M50,180 C60,170 74,170 80,186 C70,200 58,198 50,180 Z', '#ffd36a', ' stroke-width="3"'); [[30, 60], [52, 112], [28, 160], [44, 236]].forEach(function(q){ t += etoile(q[0], q[1], 7, '#fff3c4', ' stroke-width="2"'); }); }
      if(c.fo === 3) t += T('M10,286 C20,296 30,276 40,290 C50,300 60,280 70,292', p[2], 3);
      return g ? t : '<g transform="translate(260,0) scale(-1,1)">' + t + '</g>';
    }
    s = c.sur(pan(1) + pan(0), 10);
    if(c.fo === 2){        /* une cantonnière à festons */
      var fe = 'M4,10 L256,10 L256,44';
      for(var i = 0; i < 6; i++) fe += ' C' + f1(256 - i * 42 - 8) + ',62 ' + f1(256 - i * 42 - 34) + ',62 ' + f1(256 - (i + 1) * 42) + ',44';
      s += c.boite(4, 6, 256, 14, 0, 18, UNI(p[1])) + c.sur(P(fe + ' Z', p[1]) + T('M8,24 H252', p[2], 3, ' opacity=".5"'), 0);
    }
    /* la tringle : un tube qui avance un peu du mur */
    s += c.tube([0, 14, 12], [260, 14, 12], 4.5, '#b8862e', G('or'), G('or')) + c.boule(4, 14, 12, 8, G('or')) + c.boule(256, 14, 12, 8, G('or'));
    return [N(s)];
  }});

/* ---------- Le pouf : rond, poire, cube tricoté, champignon, nuage ---------- */
var POUFS = [['#9d6ee3', '#d6c4ff', '#5f3fa8'], ['#f58a2a', '#ffd0a8', '#a8541a'], ['#4cbb5c', '#c6f0cc', '#2a7a3a'], ['#e0443a', '#ffffff', '#8a2018'], ['#8fc8ff', '#ffffff', '#4a86c8']];
def('pouf', {w:112, h:92, p:104, z:'sol', deco:true, chambre:true, nf:5, nom:'Pouf', ic:'🍄', surf:[{x0:-30, x1:30, y:-66, z:52}],
  d:function(c){
    var p = palette(c, POUFS[c.fo]), cz = c.p / 2;
    if(c.fo === 1) return [N(c.tour(56, cz, [[10, 14], [26, 34], [52, 48], [76, 50], [88, 40], [92, 26]], p[0], null) + c.sur(T('M40,22 C30,42 30,66 38,84', p[2], 3, ' opacity=".5"'), cz - 44))];
    if(c.fo === 2){
      var m = '';
      for(var y = 36; y < 88; y += 12) m += 'M14,' + y + ' q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 ';
      return [N(c.boite(8, 26, 104, 92, 6, c.p - 6, UNI(p[0], p[1], sombre(p[0], 0.2))) + c.sur(T(m, p[2], 2.5, ' opacity=".45"'), 6) + c.dessus(T('M-30,-30 L30,30 M30,-30 L-30,30', p[2], 3, ' opacity=".4"'), 26, cz))];
    }
    if(c.fo === 3) return [N(c.cylindre(56, cz, 18, 46, 92, '#f6ecd2', null) + c.tour(56, cz, [[12, 20], [22, 40], [36, 52], [50, 54]], p[0], null) +
      c.dessus(Cir(26, -16, 9, p[1], ' stroke-width="2.5"') + Cir(60, 14, 8, p[1], ' stroke-width="2.5"') + Cir(84, -20, 7, p[1], ' stroke-width="2.5"'), 22, cz))];
    if(c.fo === 4) return [N(epais(c, nuageP(4, 30, 104, 60, sombre(p[0], 0.18)), nuageP(4, 30, 104, 60, p[0], ' stroke-width="5"') + T('M30,62 q6,4 12,0 M68,62 q6,4 12,0', K, 2.5) + Ell(56, 72, 5, 3, '#ff9db4', ' stroke-width="0"'), cz - 14, 26))];
    return [N(c.cylindre(56, cz, 48, 30, 90, p[0], p[1]) + c.arcAvant(56, cz, 48.5, 60, p[2], 3) + c.disque(56, cz, 5, 31, p[2]))];
  }});

/* ---------- La table de chevet ---------- */
def('chevet', {w:120, h:122, p:96, z:'sol', deco:true, chambre:true, nf:5, nom:'Table de chevet', ic:'🛋️', surf:[{x0:-40, x1:40, y:-112, z:48}],
  d:function(c){
    var p = palette(c, ['#9d6ee3', '#d6c4ff', '#5f3fa8']), cz = c.p / 2;
    if(c.fo === 1) return [N(c.ovale(60, cz, 30, 24, 114, 122, G('boisS'), G('bois')) + c.cylindre(60, cz, 7, 18, 116, G('bois'), null) + c.ovale(60, cz, 56, 44, 10, 20, G('bois'), G('boisH')))];
    if(c.fo === 2) return [N(c.boite(8, 14, 112, 122, 4, c.p - 4, UNI(G('boisC'), G('boisH'), G('boisS'))) + c.sur(T('M8,50 H112 M8,86 H112 M40,14 V122 M80,14 V122', '#8a5a2a', 3, ' opacity=".55"'), 4) + c.dessus(emo(60, 0, 34, '🧸'), 14, cz))];
    if(c.fo === 3) return [N(c.cylindre(60, cz, 16, 40, 122, '#f6ecd2', null) + c.tour(60, cz, [[10, 26], [22, 48], [34, 58], [42, 60]], c.ti ? p[0] : '#e0443a', null) +
      c.dessus(Cir(30, -14, 7, '#fff') + Cir(64, 12, 6, '#fff') + Cir(92, -16, 7, '#fff'), 12, cz))];
    if(c.fo === 4) return [N(pieds(c, 18, 102, 96, 122, 10, c.p - 10, 12) + c.boite(10, 20, 110, 100, 6, c.p - 6, UNI(c.ti ? p[0] : '#ef7fa8', clair(c.ti ? p[0] : '#ef7fa8', 0.3), sombre(c.ti ? p[0] : '#ef7fa8', 0.25))) +
      c.sur(coeurP(60, 60, 18, p[1]), 6) + c.boite(4, 10, 116, 22, 0, c.p, UNI(G('boisH'), G('boisH'), G('boisS'))))];
    return [N(pieds(c, 14, 106, 104, 122, 8, c.p - 8, 12) + c.boite(8, 18, 112, 106, 4, c.p - 4, BOIS()) +
      c.sur(R(16, 30, 88, 32, 5, G('boisC'), ' stroke-width="3"') + R(16, 68, 88, 32, 5, G('boisC'), ' stroke-width="3"') + Cir(60, 46, 5, G('or')) + Cir(60, 84, 5, G('or')), 4) +
      c.boite(2, 8, 118, 20, 0, c.p, UNI(G('boisH'), G('boisH'), G('boisS'))))];
  }});

/* ---------- La lampe de chevet : elle éclaire toute seule le soir ---------- */
def('lampe_chevet', {w:72, h:104, p:60, z:'petit', deco:true, chambre:true, lumiere:true, nf:5, prefere:['chevet', 'coffre', 'table'], nom:'Lampe de chevet', ic:'💡',
  d:function(c){
    var p = palette(c, [['#f2b63c', '#ffe3a3', '#a86f14'], ['#e0443a', '#ffd0c8', '#8a2018'], ['#fff3c4', '#ffffff', '#c9a227'], ['#ffd84a', '#fff3c4', '#c9a227'], ['#bff3ff', '#ffffff', '#3fa9d6']][c.fo]);
    var cz = 30, halo = c.sur('<circle class="at-halo" cx="36" cy="40" r="66" fill="' + G('halo') + '"/>', cz);
    var pied = c.cylindre(36, cz, 20, 96, 104, G('bois'), G('boisH')) + c.cylindre(36, cz, 4, 56, 98, G('bois'), null);
    if(c.fo === 1) return [N(halo + c.cylindre(36, cz, 11, 50, 104, '#f6ecd2', null) + c.tour(36, cz, [[16, 14], [26, 26], [44, 34], [54, 35]], p[0], null) + c.dessus(Cir(22, -8, 5, '#fff') + Cir(46, 8, 5, '#fff'), 18, cz))];
    if(c.fo === 2) return [N(halo + pied + epais(c, lune(36, 34, 26, sombre(p[0], 0.2), ' stroke-width="4"'), lune(36, 34, 26, p[0], ' stroke-width="4"') + Cir(44, 30, 3, p[2], ' stroke-width="0"'), cz - 4, 8))];
    if(c.fo === 3) return [N(halo + pied + epais(c, etoile(36, 34, 30, sombre(p[0], 0.2), ' stroke-width="4"'), etoile(36, 34, 30, p[0], ' stroke-width="4"') + Cir(36, 36, 6, p[1], ' stroke-width="2"'), cz - 4, 8))];
    if(c.fo === 4) return [N(halo + pied + c.boule(36, 32, cz, 26, p[0]) + c.sur(T('M20,26 C24,18 32,14 40,14', '#fff', 4, ' opacity=".7"'), cz - 24))];
    return [N(halo + pied + c.cylindre(36, cz, 25, 14, 56, p[0], clair(p[0], 0.4), '', 30) + c.arcAvant(36, cz, 29, 48, p[2], 3))];
  }});

/* ---------- L'armoire de la chambre (sur son dessus, le chat aime monter) ---------- */
def('armoire_ch', {w:210, h:300, p:110, z:'sol', deco:true, chambre:true, profil:true, nf:5, nom:'Armoire', ic:'🚪', surf:[{x0:-76, x1:76, y:-290, z:55}],
  d:function(c){
    var p = palette(c, ['#9d6ee3', '#d6c4ff', '#5f3fa8']), P2 = c.p, s = pieds(c, 22, 188, 276, 300, 8, P2 - 8, 20), portes = '';
    s += c.boite(10, 28, 200, 280, 0, P2, BOIS());
    function porte(x, f){ return R(x, 42, 84, 226, 6, f); }
    if(c.fo === 1){
      portes = porte(18, c.ti ? p[0] : '#ef7fa8') + porte(108, c.ti ? p[0] : '#ef7fa8') + coeurP(60, 110, 16, p[1]) + coeurP(150, 110, 16, p[1]) + coeurP(60, 200, 10, p[1]) + coeurP(150, 200, 10, p[1]);
    } else if(c.fo === 2){
      portes = porte(18, G('boisC')) + R(108, 42, 84, 226, 6, '#cfe8ff') + T('M120,72 L170,52 M124,112 L182,82 M126,152 L150,142', '#fff', 5, ' opacity=".75"') + R(30, 62, 60, 80, 6, 'none', ' stroke-width="3" opacity=".5"');
    } else if(c.fo === 3){   /* un petit château : des créneaux, un drapeau */
      for(var i = 0; i < 5; i++) s += c.boite(10 + i * 42, 6, 34 + i * 42, 30, 0, P2, UNI(G('pierre'), '#c9c5e2', '#77729c'));
      s += c.ligne([[105, 6, P2 / 2], [105, -40, P2 / 2]], K, 4) + c.sur(P('M105,-40 L132,-32 L105,-24 Z', c.ti ? p[0] : '#e0443a', ' stroke-width="3"'), P2 / 2);
      portes = P('M18,268 V92 C18,58 102,58 102,92 V268 Z', G('boisC')) + P('M108,268 V92 C108,58 192,58 192,92 V268 Z', G('boisC')) + T('M60,92 V268 M150,92 V268', '#8a5a2a', 3, ' opacity=".5"');
    } else if(c.fo === 4){
      var fl = '';
      [[44, 92], [70, 142], [40, 202], [140, 94], [170, 152], [136, 212]].forEach(function(q, i){ for(var j = 0; j < 5; j++){ var a = j / 5 * Math.PI * 2; fl += Cir(f1(q[0] + Math.cos(a) * 7), f1(q[1] + Math.sin(a) * 7), 5, i % 2 ? p[1] : (c.ti ? p[0] : '#ff8fb3'), ' stroke-width="2"'); } fl += Cir(q[0], q[1], 4, '#ffd36a', ' stroke-width="1.5"'); });
      portes = porte(18, G('boisC')) + porte(108, G('boisC')) + T('M44,102 C50,132 70,142 70,152 M140,104 C150,132 170,142 170,162', '#4fb45f', 3) + fl;
    } else {
      portes = porte(18, G('boisC')) + porte(108, G('boisC')) + R(30, 58, 60, 90, 6, 'none', ' stroke-width="3" opacity=".55"') + R(120, 58, 60, 90, 6, 'none', ' stroke-width="3" opacity=".55"') +
        R(30, 162, 60, 92, 6, 'none', ' stroke-width="3" opacity=".55"') + R(120, 162, 60, 92, 6, 'none', ' stroke-width="3" opacity=".55"');
    }
    if(c.fo !== 3) s += c.boite(2, 12, 208, 32, -6, P2 + 4, UNI(G('boisH'), G('boisH'), G('boisS'))) + (c.fo === 0 ? c.sur(P('M70,12 C80,-12 130,-12 140,12 Z', G('boisH')), -6) : '');
    return [N(s + c.sur(portes + Cir(98, 160, 6, G('or')) + Cir(112, 160, 6, G('or')) + reflet('M20,48 V262', 4), 0))];
  }});

/* ---------- La bibliothèque : des livres de toutes les couleurs (de vrais petits volumes) ---------- */
def('bibliotheque', {w:190, h:262, p:76, z:'sol', deco:true, chambre:true, profil:true, nf:3, nom:'Bibliothèque', ic:'📚', surf:[{x0:-80, x1:80, y:-254, z:38}],
  d:function(c){
    var cols = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.4), sombre(THEMES[c.ti].c, 0.3), clair(THEMES[c.ti].c, 0.7)] : ['#d9544f', '#4f73d9', '#4fb45f', '#f2b63c', '#9d6ee3'];
    var P2 = c.p, s = '', livres = '';
    /* le fond (sombre), les côtés, les rayons */
    s += c.poly([[12, 12, P2], [178, 12, P2], [178, 256, P2], [12, 256, P2]], '#2e1c10');
    if(c.fo === 2){        /* une échelle de bois : deux montants, des planches */
      s += c.boite(8, 4, 20, 262, 4, P2, BOIS()) + c.boite(170, 4, 182, 262, 4, P2, BOIS());
    } else {
      s += c.boite(4, 8, 16, 262, 0, P2, BOIS()) + c.boite(174, 8, 186, 262, 0, P2, BOIS());
    }
    [72, 138, 204].forEach(function(y, r){
      var x = 20;
      for(var i = 0; x < 166; i++){
        var w = 12 + ((i * 7 + r * 3) % 4) * 3, h = 40 + ((i * 5 + r) % 3) * 8, col = cols[(i + r) % cols.length];
        if(x + w > 168) break;
        livres += c.boite(x, y - h, x + w, y, 14 + (i % 3) * 4, P2 - 8, UNI(col, clair(col, 0.35), sombre(col, 0.25)));
        x += w + 1;
      }
      livres += c.boite(14, y, 176, y + 10, 2, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    });
    s += livres + c.boite(14, 252, 176, 262, 2, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    if(c.fo === 1) s += c.boite(0, -6, 190, 12, -4, P2 + 4, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.sur(P('M10,12 C10,-30 180,-30 180,12 Z', G('bois')) + etoile(95, -2, 9, '#fff3c4'), -4);
    else if(c.fo === 0) s += c.boite(0, 2, 190, 14, -4, P2 + 4, UNI(G('boisH'), G('boisH'), G('boisS')));
    return [N(s)];
  }});

/* ---------- Le miroir (au mur, avec une petite épaisseur) ---------- */
def('miroir', {w:104, h:140, p:12, z:'mur', deco:true, chambre:true, nf:5, touche:118, nom:'Miroir', ic:'🪞',
  d:function(c){
    var verre = '#cfe8ff', reflets = T('M36,40 L64,20 M30,62 L70,34', '#fff', 5, ' opacity=".7"'), cad = c.ti ? THEMES[c.ti].c : null, P2 = c.p;
    if(c.fo === 1){
      var r = '';
      for(var i = 0; i < 16; i++){ var a = i / 16 * Math.PI * 2; r += 'M' + f1(52 + Math.cos(a) * 40) + ',' + f1(72 + Math.sin(a) * 40) + ' L' + f1(52 + Math.cos(a) * 52) + ',' + f1(72 + Math.sin(a) * 52) + ' '; }
      return [N(c.sur(T(r, K, 8) + T(r, cad || '#f5b945', 4), P2) + c.tube([52, 72, P2], [52, 72, 0], 40, '#9a6a1c', null, null) + c.sur(Cir(52, 72, 40, G('or')) + Cir(52, 72, 30, verre, ' stroke-width="3"') + T('M38,62 L58,48 M36,78 L64,58', '#fff', 4, ' opacity=".7"'), 0))];
    }
    if(c.fo === 2) return [N(c.boite(10, 8, 94, 134, 0, P2, BOIS()) + c.sur(R(20, 18, 64, 106, 3, verre, ' stroke-width="3"') + reflets, 0))];
    if(c.fo === 3) return [N(epais(c, etoile(52, 72, 54, '#9a6a1c', ' stroke-width="5"'), etoile(52, 72, 54, cad || G('or'), ' stroke-width="5"') + etoile(52, 72, 38, verre, ' stroke-width="3"') + T('M40,66 L56,54', '#fff', 4, ' opacity=".7"'), 0, P2))];
    if(c.fo === 4) return [N(epais(c, coeurP(52, 70, 40, sombre(cad || '#ef7fa8', 0.3), ' stroke-width="5"'), coeurP(52, 70, 40, cad || '#ef7fa8', ' stroke-width="5"') + coeurP(52, 70, 28, verre) + T('M34,52 L48,44', '#fff', 4, ' opacity=".7"'), 0, P2))];
    return [N(c.sur(T('M30,6 L52,-8 L74,6', K, 3), P2) + epais(c, Ell(52, 72, 44, 64, '#9a6a1c'), Ell(52, 72, 44, 64, G('or')) + Ell(52, 72, 34, 54, verre, ' stroke-width="3"') + reflets + Cir(52, 10, 6, cad || '#ff8fb3'), 0, P2))];
  }});

/* ---------- Le mobile : accroché par un bras qui sort du mur, il se balance doucement ---------- */
def('mobile', {w:150, h:160, p:80, z:'mur', deco:true, chambre:true, nf:5, nom:'Mobile', ic:'🌙',
  d:function(c){
    var p = palette(c, [['#fff3c4', '#ffd36a', '#c9a227'], ['#bff3ff', '#ffffff', '#3fa9d6'], ['#ff8fb3', '#ffd0e2', '#a8326a'], ['#a6ef93', '#fff3c4', '#25703c'], ['#b796ff', '#ffd36a', '#5537a0']][c.fo]);
    var cz = 30, bras = c.sur(Cir(75, -4, 5, '#cfc9e6'), c.p) + c.ligne([[75, -4, c.p], [75, -4, cz]], K, 6) + c.ligne([[75, -4, c.p], [75, -4, cz]], '#c98450', 3);
    var formes = [
      function(x, y, r){ return etoile(x, y, r, p[0]); },
      function(x, y, r){ return nuageP(x - r * 1.3, y - r * 0.5, r * 2.6, r * 1.2, p[0], ' stroke-width="3"'); },
      function(x, y, r){ return coeurP(x, y, r * 0.8, p[0]); },
      function(x, y, r){ return P('M' + (x - r) + ',' + y + ' C' + (x - r * 0.4) + ',' + (y - r) + ' ' + (x + r * 0.6) + ',' + (y - r) + ' ' + (x + r) + ',' + y + ' C' + (x + r * 0.4) + ',' + (y - r * 0.2) + ' ' + (x - r * 0.4) + ',' + (y + r * 0.6) + ' ' + (x - r) + ',' + y + ' Z', p[0], ' stroke-width="3"'); },
      function(x, y, r){ return Cir(x, y, r * 0.8, p[0]) + '<ellipse cx="' + x + '" cy="' + y + '" rx="' + f1(r * 1.3) + '" ry="' + f1(r * 0.35) + '" fill="none" stroke="' + p[2] + '" stroke-width="3"/>'; }
    ], fo = formes[c.fo];
    var fils = T('M75,-4 V22 M20,30 V86 M75,22 V112 M130,30 V76', '#5a4630', 2) + T('M14,30 C40,18 110,18 136,30', K, 7) + T('M14,30 C40,18 110,18 136,30', '#c98450', 3);
    return [N(bras + c.sur('<g class="at-mobile">' + fils + fo(20, 100, 16) + lune(75, 130, 20, p[1]) + fo(130, 90, 14) + '</g>', cz))];
  }});

/* ---------- L'arbre à chat : des plateformes pour que le chat grimpe ---------- */
def('arbre_chat', {w:180, h:300, p:120, z:'sol', deco:true, chambre:true, chat:true, nf:5, nom:'Arbre à chat', ic:'🐈',
  surf:[{x0:-62, x1:-20, y:-126, z:60}, {x0:16, x1:60, y:-206, z:60}, {x0:12, x1:68, y:-286, z:60}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#4cbb5c', '#a6ef93', '#25703c'], ['#a9a5c6', '#e8e4ff', '#524d75'], ['#e0443a', '#fff3c4', '#8a2018'], ['#8fc8ff', '#ffffff', '#4a86c8']][c.fo]);
    var cz = c.p / 2, s = c.boite(6, 280, 174, 300, 4, c.p - 4, UNI(p[2], clair(p[2], 0.25), sombre(p[2], 0.2)));
    function poteau(x, y0, y1){
      var t = c.cylindre(x, cz, 10, y0, y1, '#e2c48e', null);
      for(var y = y0 + 12; y < y1 - 4; y += 14) t += c.arcAvant(x, cz, 10.5, y, '#a8854e', 2);
      return t;
    }
    function plat(x0, x1, y){
      var m = (x0 + x1) / 2, r = (x1 - x0) / 2 + 8;
      if(c.fo === 4) return epais(c, nuageP(x0 - 8, y - 24, x1 - x0 + 16, 26, sombre(p[0], 0.15)), nuageP(x0 - 8, y - 24, x1 - x0 + 16, 26, p[0], ' stroke-width="4"'), cz - 10, 20);
      if(c.fo === 1) return c.ovale(m, cz, r, 34, y - 10, y + 4, p[0], p[1]);
      return c.boite(x0 - 8, y - 12, x1 + 8, y + 4, cz - 32, cz + 32, UNI(p[0], p[1], sombre(p[0], 0.2)));
    }
    s += poteau(46, 174, 282) + poteau(132, 94, 282) + plat(16, 76, 174) + plat(104, 164, 94) + poteau(132, 14, 94) + plat(96, 168, 14);
    if(c.fo === 2) s += c.boite(94, -44, 170, 2, cz - 30, cz + 30, UNI(G('pierre'), '#c9c5e2', '#77729c')) + c.sur(P('M119,2 V-18 C119,-30 145,-30 145,-18 V2 Z', '#2a1d14', ' stroke-width="3"'), cz - 30);
    if(c.fo === 3) s += c.cylindre(132, cz, 26, -30, 2, p[0], null) + c.tour(132, cz, [[-60, 4], [-42, 20], [-30, 30]], p[0], null) + c.sur(Cir(132, -14, 8, '#bff3ff', ' stroke-width="3"'), cz - 26);
    if(c.fo === 1) s += c.boule(150, 70, cz, 8, '#ff8fb3') + c.boule(24, 150, cz, 7, '#ffd36a');
    s += c.ligne([[150, 98, cz], [152, 140, cz]], '#5a4630', 2) + c.boule(152, 146, cz, 9, c.ti ? p[1] : '#ff7a59');
    return [N(s)];
  }});

/* ---------- Le coffre à jouets ---------- */
def('coffre', {w:170, h:118, p:96, z:'sol', deco:true, chambre:true, profil:true, nf:5, nom:'Coffre à jouets', ic:'🧸', surf:[{x0:-60, x1:60, y:-104, z:48}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#3d8ef0', '#fff3c4', '#1f4f9a'], ['#f5b945', '#fff1b8', '#b07a1c'], ['#d7b27a', '#f3e2bf', '#8a6a3a'], ['#f2a65a', '#ffe0bf', '#d9783c']][c.fo]);
    var P2 = c.p, cz = P2 / 2, jouets = c.sur(emo(52, 8, 30, '🧸'), cz) + c.boule(120, 8, cz + 10, 13, '#ff7a59');
    var C3 = UNI(p[0], clair(p[0], 0.25), sombre(p[0], 0.25));
    if(c.fo === 1) return [N(c.boite(8, 22, 162, 118, 4, P2 - 4, C3) + jouets + c.boite(4, 14, 166, 30, 0, P2, UNI(p[2], clair(p[2], 0.2), sombre(p[2], 0.2))) + c.sur(etoile(52, 72, 14, p[1]) + etoile(118, 66, 11, p[1]) + etoile(86, 94, 8, p[1]), 4))];
    if(c.fo === 2){        /* un coffre de pirate : couvercle bombé, ferrures dorées */
      var couv = [];
      for(var i = 0; i <= 10; i++){ var a = Math.PI - i / 10 * Math.PI; couv.push([85 + Math.cos(a) * 75, 46 - Math.sin(a) * 34]); }
      var av = couv.map(function(q){ return [q[0], q[1], 4]; }), ar = couv.map(function(q){ return [q[0], q[1], P2 - 4]; }), pts = [];
      av.concat(ar).forEach(function(q){ pts.push(c.Q(q[0], q[1], q[2])); });
      return [N(c.boite(10, 46, 160, 118, 4, P2 - 4, BOIS()) + P(lisse(enveloppe(pts), true, 0.4), G('boisH')) + c.ligne(av, K, 4) +
        c.sur(T('M40,14 V118 M130,14 V118', K, 9) + T('M40,14 V118 M130,14 V118', '#f5b945', 5) + R(74, 40, 22, 26, 4, G('or')) + Cir(85, 52, 3, K), 4))];
    }
    if(c.fo === 3){        /* un panier tressé */
      var tresse = '';
      for(var y = 34; y < 112; y += 12) tresse += 'M14,' + y + ' q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 ';
      return [N(c.ovale(85, cz, 78, 44, 26, 118, p[0], p[2]) + jouets + c.sur(T(tresse, p[2], 2.5, ' opacity=".55"'), cz - 44) + c.ligne(bezier3([24, 26, cz], [30, -30, cz], [140, -30, cz], [146, 26, cz], 10), K, 8) + c.ligne(bezier3([24, 26, cz], [30, -30, cz], [140, -30, cz], [146, 26, cz], 10), p[1], 4))];
    }
    if(c.fo === 4) return [N(c.boite(8, 26, 162, 118, 4, P2 - 4, C3) + c.boite(4, 18, 166, 32, 0, P2, C3) +
      c.sur(P('M26,22 L38,-10 L60,18 Z', p[0]) + P('M144,22 L132,-10 L110,18 Z', p[0]) + Ell(60, 66, 8, 10, K) + Ell(110, 66, 8, 10, K) + P('M80,82 l5,5 l5,-5 Z', '#ff8fa8', ' stroke-width="2"') + T('M70,94 q15,10 30,0', K, 3), 0))];
    return [N(c.boite(10, 30, 160, 118, 4, P2 - 4, BOIS()) + jouets + c.boite(4, 20, 166, 36, 0, P2, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.sur(T('M10,62 H160', K, 4) + R(76, 36, 18, 18, 4, G('or')) + reflet('M18,48 V106', 3), 4))];
  }});
