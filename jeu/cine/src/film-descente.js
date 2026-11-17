/* film-descente.js — LES DEUX DESCENTES DU DONJON (Bible §13.62 ; Romain, 17 novembre : « les deux cinématiques de l'entrée du donjon »).
   Deux films de 24 s, tournés « à la place des héros » (on ne les voit pas : chacun a le sien sur sa tablette). On ne voit que le dos
   de deux amis qui descendent devant nous (silhouettes à capuche, bleue pour le Sage, violette pour l'Alchimiste).
   - « escalier » : sous le clocher, la grille de la crypte grince, l'escalier de pierre, les runes bleues qui s'éveillent, la lueur
     froide d'une porte tout en bas ;
   - « puits » : la grille du puits a fondu, on descend à la corde le long d'un puits rond, on lève les yeux (la nuit, la lune, un ami
     qui se penche), on touche le fond, une petite galerie qui brille.
   Le conteur parle dans les sous-titres. Plateau : plateau-descente.js (zones 'escalier' et 'puits'). */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, FC = window.CFXC, PD = window.PLATEAU_DESCENTE, E_ = PD.ESC, PUI = PD.PUITS;
var HW = E_.HW, PZ = E_.PZ, PY = E_.PY, NS = E_.NS, BAS = E_.BAS, YB = E_.YB, ZEND = E_.ZEND, SL = E_.SL;
var PP = 1600, QUI = 'Le conteur';
function lisse(a, b, x){ return U.clamp((x - a) / (b - a), 0, 1); }
function dou(a, b, x){ var k = lisse(a, b, x); return k * k * (3 - 2 * k); }
function mix(a, b, k){ return a + (b - a) * k; }

/* les définitions de dessin communes aux deux films */
function defs(){
  return FC.defs() +
    '<radialGradient id="vigD"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></radialGradient>' +
    '<filter id="flGrille" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2"/></filter>' +
    '<filter id="flMain" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2"/></filter>' +
    '<radialGradient id="ciel"><stop offset="0" stop-color="#27427a"/><stop offset=".6" stop-color="#14264c"/><stop offset="1" stop-color="#0a1226"/></radialGradient>' +
    '<radialGradient id="lunD"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#e8ecff"/><stop offset="1" stop-color="#b8c8f0"/></radialGradient>' +
    '<radialGradient id="cristal"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#8fe6ff"/><stop offset="1" stop-color="#2a7ab0" stop-opacity="0"/></radialGradient>';
}

/* ------------------------------------------------------------ un ami, vu de dos (silhouette à capuche) */
function ami(p, o){
  var s = p.s * (o.h || 1) * .52, c = o.coul, ph = o.ph || 0, lit = U.clamp(o.lit == null ? .2 : o.lit, 0, 1);
  var bal = Math.sin(ph * Math.PI), pas = Math.abs(bal), g = '<g transform="translate(' + U.r(p.x + bal * 3 * s) + ' ' + U.r(p.y - pas * 5 * s) + ') scale(' + U.r(s) + ')">';
  var j = Math.floor(ph), cote = (j % 2) ? 1 : -1;
  /* les pieds */
  g += '<ellipse cx="' + (-22 * cote) + '" cy="-3" rx="20" ry="9" fill="#0a0a10"/><ellipse cx="' + (22 * cote) + '" cy="' + U.r(-3 - pas * 16) + '" rx="20" ry="9" fill="#0a0a10"/>';
  /* la cape */
  g += '<path d="M-50 -250 C -62 -170 -82 -80 -86 -14 C -40 -2 40 -2 86 -14 C 82 -80 62 -170 50 -250 Z" fill="' + c + '"/>';
  g += '<path d="M0 -250 C 4 -170 -2 -80 2 -8" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="3"/>';
  /* les épaules et la capuche */
  g += '<path d="M-62 -232 C -60 -262 -34 -270 0 -272 C 34 -270 60 -262 62 -232 C 40 -240 -40 -240 -62 -232 Z" fill="' + c + '"/>';
  g += '<path d="M-38 -250 C -44 -300 -22 -334 0 -346 C 22 -334 44 -300 38 -250 C 20 -240 -20 -240 -38 -250 Z" fill="' + c + '"/>';
  g += '<path d="M-38 -250 C -44 -300 -22 -334 0 -346 C 22 -334 44 -300 38 -250 C 20 -240 -20 -240 -38 -250 Z" fill="url(#lunD)" opacity="' + U.r(.1 + lit * .16) + '"/>';
  /* le liseré froid (la lueur de la porte, devant eux, éclaire leurs contours) */
  g += '<path d="M-86 -14 C -82 -80 -62 -170 -50 -250 C -44 -300 -22 -334 0 -346 C 22 -334 44 -300 50 -250 C 62 -170 82 -80 86 -14" fill="none" stroke="#8fe6ff" stroke-width="4" opacity="' + U.r(.55 * lit) + '"/>';
  g += o.accessoire ? o.accessoire(bal, pas) : '';
  return g + '</g>';
}
function sage(bal){
  /* le bâton à cristal, planté à droite, qui luit */
  var x = 96 + bal * 8;
  return '<path d="M' + x + ' -4 L ' + x + ' -330" stroke="#3a2a1a" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="' + x + '" cy="-338" r="54" fill="url(#cristal)" opacity=".9"/><circle cx="' + x + '" cy="-338" r="12" fill="#e8fcff"/>';
}
function alchimiste(bal){
  /* la lanterne à la main gauche, la sacoche à la ceinture */
  var x = 112 + bal * 6;
  return '<rect x="-84" y="-140" width="46" height="40" rx="8" fill="#3a2410"/><path d="M' + x + ' -170 L ' + x + ' -216" stroke="#2a2a2a" stroke-width="4"/>' +
    '<rect x="' + (x - 14) + '" y="-170" width="28" height="36" rx="4" fill="#ffcf7a"/><circle cx="' + x + '" cy="-152" r="62" fill="url(#haloChaud)" opacity=".8"/>';
}

/* la lanterne qu'on porte (en bas à gauche de l'image : le bras, la lanterne qui se balance) */
function lanterne(t, k){
  var sw = Math.sin(t * 2.1) * 6, bob = Math.sin(t * 3.1) * 4, x = 232 + sw, y = 470 + bob, fl = FX.lueur(t, 7);
  return '<g opacity="' + U.r(k) + '"><path d="M' + (x - 150) + ' 640 C ' + (x - 90) + ' 590 ' + (x - 30) + ' 540 ' + x + ' ' + (y - 44) + '" stroke="#1a1410" stroke-width="42" stroke-linecap="round" fill="none" filter="url(#flMain)"/>' +
    '<path d="M' + x + ' ' + (y - 70) + ' L ' + x + ' ' + (y - 40) + '" stroke="#222" stroke-width="5"/>' +
    '<rect x="' + (x - 30) + '" y="' + (y - 40) + '" width="60" height="78" rx="9" fill="#3a2a16" stroke="#111" stroke-width="5"/>' +
    '<rect x="' + (x - 20) + '" y="' + (y - 30) + '" width="40" height="58" rx="5" fill="#ffd486" opacity="' + U.r(.85 * fl) + '"/>' +
    '<path d="M' + (x - 30) + ' ' + (y - 40) + ' L ' + x + ' ' + (y - 62) + ' L ' + (x + 30) + ' ' + (y - 40) + ' Z" fill="#2a1e10" stroke="#111" stroke-width="4"/></g>';
}
function halo(t, k, x, y){
  var fl = FX.lueur(t, 5);
  return '<circle cx="' + U.r(x) + '" cy="' + U.r(y) + '" r="' + U.r(430 * fl) + '" fill="url(#haloChaud)" opacity="' + U.r(.55 * k) + '"/>' +
    '<circle cx="' + U.r(x) + '" cy="' + U.r(y) + '" r="' + U.r(110 * fl) + '" fill="url(#coeurChaud)" opacity="' + U.r(.8 * k) + '"/>';
}
function vignette(){ return '<rect width="1440" height="616" fill="url(#vigD)"/>'; }

/* ================================================================== L'ESCALIER */
var TE = 24, E0 = 3.0, E1 = 22.6, VE = 162;
var LIGNES_E = [[1.2, 4.3, 'La grille grince… puis cède.', QUI], [6.4, 9.8, 'Marche après marche, le jour s\'éloigne.', QUI],
  [12.8, 16.2, 'Des signes bleus s\'éveillent.', QUI], [19.0, 22.4, 'Tout en bas, une lueur attend.', QUI]];
/* la vitesse : elle monte doucement, tient, puis retombe ; la distance = son intégrale */
function vit(t){ return VE * dou(E0, E0 + 1.6, t) * (1 - dou(19.0, E1, t)); }
function dist(t){ var d = 0, dt = .02; for(var x = 0; x < t; x += dt) d += vit(Math.min(x + dt / 2, t)) * Math.min(dt, t - x); return d; }
function sol(z){            /* la hauteur lissée du sol sous la caméra */
  var a = 0, n = 0; for(var q = -150; q <= 150; q += 30){ var zz = z + q; a += zz > 0 ? 0 : Math.min(YB, -zz * SL); n++; }
  return a / n;
}
function solMarche(z){ if(z > 0) return 0; var i = Math.floor(-z / PZ); return i >= NS ? YB : i * PY; }

function grille(t){
  /* deux battants de fer rouillé qui coulissent (au premier plan, flous) : ils s'ouvrent de 1,0 à 3,4 s */
  var k = dou(1.0, 3.4, t) ; if(k >= 1) return '';
  var o = k * 640 + (t > .9 && t < 3.4 ? Math.sin(t * 40) * 2 * (1 - k) : 0), s = '<g filter="url(#flGrille)" opacity="' + U.r(1 - dou(3.0, 3.4, t)) + '">';
  [-1, 1].forEach(function(sd){
    var x0 = sd < 0 ? -o : 720 + o;
    s += '<g transform="translate(' + U.r(x0) + ' 0)"><rect x="0" y="-20" width="720" height="660" fill="rgba(60,30,14,.0)"/>';
    for(var i = 0; i < 9; i++) s += '<rect x="' + (14 + i * 80) + '" y="-20" width="22" height="660" fill="#40281a"/><rect x="' + (14 + i * 80) + '" y="-20" width="7" height="660" fill="#7a5030" opacity=".7"/>';
    [60, 300, 560].forEach(function(y){ s += '<rect x="0" y="' + y + '" width="720" height="26" fill="#352216"/><rect x="0" y="' + y + '" width="720" height="7" fill="#80583a" opacity=".6"/>'; });
    s += '</g>';
  });
  return s + '</g>';
}

CINE.films.escalier = {
  nom:'L\'escalier de la crypte', plateau:'descente', duree:TE, defs:defs,
  sons:[[.9, 'cineGrille'], [3.1, 'cineLanterne'], [.2, 'cineVent'], [9.0, 'cineVent'], [14.5, 'cineVent'], [6.0, 'cineGoutte'], [11.5, 'cineGoutte'], [16.8, 'cineGoutte'], [19.2, 'cineLueur']]
    .concat((function(){ var a = []; for(var x = 3.6; x < 20.0; x += .8) a.push([x, 'cinePasEscalier']); return a; })()),
  sousTitres:LIGNES_E,
  etat:function(t){
    var d = dist(t), z = 380 - d, fz = sol(z), ph = d / PZ, bob = Math.abs(Math.sin(ph * Math.PI)) * 7 * dou(E0, E0 + 2, t) * (vit(t) / VE);
    var cy = fz - 175 + bob, pente = dou(100, -300, -z + 0) , tang = -.04 - .27 * dou(60, -260, z) * (1 - dou(-BAS + 300, -BAS - 100, z));
    var cam = {x:Math.sin(t * .8) * 4, y:cy, z:z, lacet:Math.sin(t * .35) * .012, tangage:tang, focus:750, ouverture:.22};
    var torches = [];
    [[500, 0], [8, 1], [18, -1], [27, 1]].forEach(function(q, i){
      var zz = i === 0 ? 500 : -q[0] * PZ, yy = i === 0 ? -330 : q[0] * PY - 330, sd = i === 0 ? 1 : q[1];
      torches.push([sd * (HW - 14), yy, zz]);
    });
    torches.push([-(HW - 14), YB - 330, -BAS - 500]);
    var runes = dou(3.5, 12, t) * .95;
    var porte = dou(15, 22, t), lampe = [cam.x - 100, cam.y + 80, cam.z - 50];
    var acteurs = [];
    [[800, 1100, 0], [1250, 1400, 1]].forEach(function(q, i){
      var lim = i ? -3050 : -3300, hz = Math.max(Math.min(380 - dist(Math.max(0, t - .0)) - q[0], 380 - q[0]), lim);
      var marche = vit(t) / VE, pH = (dist(t) + i * 40) / PZ;
      var zH = i === 0 ? Math.max(z - 800, lim) : Math.max(z - 1250, lim + 150);
      zH = Math.min(zH, 380 - 800 + (i ? -450 : 0));
      var yH = solMarche(zH);
      acteurs.push({type:'libre', x:(i ? 60 : -50), y:yH, z:zH, boite:[260, 420], dessin:function(p){
        return ami(p, {coul:i ? '#5a34a0' : '#2c4aa0', h:i ? 1.08 : .95, ph:pH * marche, lit:porte * .7 + .45, accessoire:i ? alchimiste : sage});
      }});
    });
    var E = {zone:'escalier', cam:cam, torches:torches, lampe:lampe, rayon:900, ambiance:.2, runes:runes, acteurs:acteurs,
      poussiere:120, poussiereBoite:[cam.x - 300, cam.y - 500, cam.z - 1400, cam.x + 300, cam.y + 100, cam.z + 100], tremble:0,
      lumieres:function(){
        return halo(t, dou(2.4, 3.6, t), 250, 500) + FC.lumiere(t, 0, YB - 280, ZEND + 60, {sorte:'Lune', r:520, k:porte * 1.1, coeur:0});
      },
      devant:function(){ return lanterne(t, dou(2.2, 3.4, t)) + grille(t); },
      avant:function(){ return vignette(); },
      fondu:null};
    if(t < .6) E.fondu = {k:1 - t / .6};
    else if(t > 22.8) E.fondu = {k:U.clamp((t - 22.8) / 1.1, 0, 1)};
    return E;
  }
};

/* ================================================================== LE PUITS */
var TP = 24, A8 = PUI.A, YT = PUI.YT, YW = PUI.YW;
var LIGNES_P = [[1.0, 4.2, 'La grille du puits a fondu.', QUI], [6.8, 10.1, 'La corde file entre vos mains.', QUI],
  [12.9, 16.2, 'Là-haut, la nuit rétrécit.', QUI], [18.8, 22.2, 'En bas, un passage brille.', QUI]];
function pv(x, y, z){ return CAM.vue(x, y, z); }
/* un polygone du monde, rogné contre le plan de la caméra, puis projeté ; rend le texte des points */
function polyMonde(pts){
  var v = pts.map(function(q){ return pv(q[0], q[1], q[2]); }), out = [], n = v.length, i;
  for(i = 0; i < n; i++){
    var a = v[i], b = v[(i + 1) % n], ia = a.z < -10, ib = b.z < -10;
    if(ia) out.push(a);
    if(ia !== ib){ var k = (-10 - a.z) / (b.z - a.z); out.push({x:a.x + (b.x - a.x) * k, y:a.y + (b.y - a.y) * k, z:-10}); }
  }
  return out.map(function(q){ var d = -q.z; return U.r(CAM.W / 2 + q.x * PP / d) + ',' + U.r(CAM.H / 2 + q.y * PP / d); }).join(' ');
}
function corde(yHaut, yBas, ep){
  var s = [], n = 48;
  for(var i = 0; i <= n; i++){
    var y = yHaut + (yBas - yHaut) * i / n, v = pv(0, y, 0);
    s.push(v.z < -15 ? [CAM.W / 2 + v.x * PP / -v.z, CAM.H / 2 + v.y * PP / -v.z, PP / -v.z] : null);
  }
  var r = '';
  for(i = 0; i < n; i++){
    var a = s[i], b = s[i + 1]; if(!a || !b) continue;
    var w = Math.max(2, ep * (a[2] + b[2]) / 2);
    r += '<line x1="' + U.r(a[0]) + '" y1="' + U.r(a[1]) + '" x2="' + U.r(b[0]) + '" y2="' + U.r(b[1]) + '" stroke="#8a6c40" stroke-width="' + U.r(w) + '"/>';
    if(i % 2) r += '<line x1="' + U.r(a[0]) + '" y1="' + U.r(a[1]) + '" x2="' + U.r(b[0]) + '" y2="' + U.r(b[1]) + '" stroke="#3a2a14" stroke-width="' + U.r(w * .7) + '" opacity=".55"/>';
  }
  return r;
}
function ciel(t, k){
  /* l'ouverture du puits vue d'en bas : le ciel de nuit, des étoiles, la lune, un ami qui se penche */
  var oct = []; for(var i = 0; i < 8; i++){ var th = i * Math.PI / 4 + Math.PI / 8, r = A8 / Math.cos(Math.PI / 8); oct.push([r * Math.cos(th), YT, r * Math.sin(th)]); }
  var pts = polyMonde(oct); if(!pts) return '';
  var R = U.hasard(77), s = '<clipPath id="ouv"><polygon points="' + pts + '"/></clipPath><polygon points="' + pts + '" fill="url(#ciel)"/><g clip-path="url(#ouv)">';
  for(var q = 0; q < 40; q++){ var sx = (R() - .5) * 500, sz = (R() - .5) * 500, pr = CAM.projeter(sx, YT - 4000, sz); s += '<circle cx="' + U.r(pr.x) + '" cy="' + U.r(pr.y) + '" r="' + U.r(1 + R() * 1.6) + '" fill="#fff" opacity="' + U.r(.4 + R() * .5) + '"/>'; }
  var lu = CAM.projeter(-90, YT - 4000, 40);
  s += '<circle cx="' + U.r(lu.x) + '" cy="' + U.r(lu.y) + '" r="' + U.r(34 * lu.s * 6) + '" fill="url(#lunD)"/>';
  /* la tête d'un ami qui se penche au bord : une capuche sombre, un liseré de lune */
  var hp = CAM.projeter(A8 * .8, YT - 20, 40), sc = hp.s * 1.1, ap = k;
  s += '<g transform="translate(' + U.r(hp.x) + ' ' + U.r(hp.y) + ') scale(' + U.r(sc) + ')" opacity="' + U.r(ap) + '"><path d="M-90 40 C -80 -60 -40 -110 0 -120 C 40 -110 80 -60 90 40 Z" fill="#101a3a"/><path d="M-90 40 C -80 -60 -40 -110 0 -120 C 40 -110 80 -60 90 40" fill="none" stroke="#a8c4ff" stroke-width="4" opacity=".7"/></g>';
  return s + '</g>';
}
function mains(t, rythme){
  /* deux mains gantées qui se relaient sur la corde (en bas de l'image) */
  var ph = (t * rythme) % 1, a = Math.sin(ph * Math.PI * 2), s = '';
  [[640, 0], [760, .5]].forEach(function(m, i){
    var u = ((t * rythme + m[1]) % 1), y = 360 + u * 250, op = u < .08 || u > .94 ? .0 : 1;
    s += '<g opacity="' + op + '" filter="url(#flMain)"><rect x="' + (m[0] - 30) + '" y="' + y + '" width="64" height="84" rx="26" fill="#2a2018" stroke="#0e0a08" stroke-width="5"/>' +
      '<path d="M' + (m[0] - 30) + ' ' + (y + 30) + ' h64 M' + (m[0] - 30) + ' ' + (y + 52) + ' h64" stroke="#0e0a08" stroke-width="3"/><path d="M' + (m[0] + 2) + ' ' + (y + 84) + ' l' + (i ? 40 : -40) + ' 190" stroke="#2a2018" stroke-width="56" stroke-linecap="round" opacity=".9"/></g>';
  });
  return s;
}
function ypuits(t){
  /* la descente : la hauteur de la caméra */
  if(t < 4.5) return -520;
  if(t < 6) return mix(-520, -150, dou(4.5, 6, t));
  if(t < 16.5) return mix(-150, 2125, dou(6, 16.5, t) * .5 + lisse(6, 16.5, t) * .5);
  return 2125;
}
CINE.films.puits = {
  nom:'Le puits', plateau:'descente', duree:TP, defs:defs,
  sons:[[.3, 'cineVent'], [.8, 'cineMeche'], [2.0, 'cineMeche'], [3.2, 'cineMeche'], [6.0, 'cineCape'], [7.6, 'cineCorde'], [8.5, 'cineCorde'], [9.4, 'cineCorde'], [10.3, 'cineCorde'], [11.2, 'cineCorde'],
    [12.1, 'cineCorde'], [13.0, 'cineCorde'], [13.9, 'cineCorde'], [14.8, 'cineCorde'], [15.7, 'cineCorde'], [9.0, 'cineGoutte'], [14.2, 'cineGoutte'], [16.8, 'cineChute'], [17.4, 'cinePasEcho'],
    [18.6, 'cineLueur'], [19.6, 'cinePasEcho'], [20.4, 'cinePasEcho'], [21.2, 'cinePasEcho']],
  sousTitres:LIGNES_P,
  etat:function(t){
    var y = ypuits(t), hautK = dou(4.5, 6, t), cam, haut = t < 4.5;
    var reg = dou(10.5, 11.6, t) * (1 - dou(12.6, 13.6, t));
    var tang;
    if(t < 4.5) tang = -.52 - .04 * Math.sin(t * .6);
    else if(t < 6) tang = mix(-.52, -.22, dou(4.5, 6, t));
    else tang = -.22 + reg * 1.45 + (dou(16.5, 18.5, t) * .22);
    var cx = mix(0, 40, hautK), cz = mix(700, 170, hautK), lacet = 0;
    if(t > 16.5){ var k = dou(17.4, 19.6, t); lacet = k * Math.PI / 2; cx = 40 + dou(19.0, 22.5, t) * (A8 + 240 - 40); cz = 170 - dou(17.5, 19.6, t) * 170; }
    if(t > 16.5) y = 2125;
    var tr = t > 16.9 && t < 17.4 ? .8 * (1 - (t - 16.9) / .5) : 0;
    cam = {x:cx + Math.sin(t * 1.1) * 4, y:y, z:cz, lacet:lacet, tangage:t > 16.5 ? mix(-.22 + 0, 0, dou(17.2, 19.6, t)) : tang, focus:t > 16.5 ? 500 : mix(900, 700, hautK), ouverture:t > 16.5 ? .2 : .7};
    var sources = [[0, y - 80, 0]];
    var E = {zone:'puits', haut:t < 7.5, cam:cam, lampe:[cam.x - 60, cam.y + 40, cam.z + 20], lumiere:1.5, rayon:900, ambiance:t > 17 ? .32 : .22, torches:[], runes:0, tremble:tr,
      froid:{cible:[A8 + 900, YW - 190, 115], k:.15 * dou(17, 22, t)},
      poussiere:90, poussiereBoite:[cam.x - 300, cam.y - 400, cam.z - 600, cam.x + 300, cam.y + 200, cam.z + 100], sources:sources,
      lumieres:function(){
        var s = halo(t, t > 2 ? dou(4.5, 6, t) * .8 + .15 : .15, 260, 560);
        if(t < 4.5) s += FC.lumiere(t, 0, YT - 120, 0, {sorte:'Lune', r:260, k:.6, coeur:0});
        if(t > 17.5) s += FC.lumiere(t, A8 + 900, YW - 190, 0, {sorte:'Lune', r:300, k:dou(17.5, 22, t) * .55, coeur:0});
        return s;
      },
      devant:function(){
        var s = '';
        if(t < 6.5){
          /* au-dessus du puits : la poutre, la corde qui part vers le noir, les restes fumants de la grille */
          s += '<polyline fill="none" stroke="#3a2a18" stroke-width="' + U.r(26 * CAM.projeter(0, -560, 0).s) + '" points="' + [-300, 300].map(function(xx){ var q = CAM.projeter(xx, -560, 0); return U.r(q.x) + ',' + U.r(q.y); }).join(' ') + '"/>';
          s += corde(-560, YT + 400, 3.4);
        } else {
          if(t < 17) s += corde(-560, YW, 3.4);
        }
        if(t > 9.5 && t < 14.5) s += ciel(t, dou(11.2, 12.2, t) * (1 - dou(13.0, 13.8, t)));
        else if(t > 9.5 && t < 16) s += '';
        if(t > 6.2 && t < 16.6) s += mains(t, 1 / .9);
        if(t > 16.5) s += lanterne(t, 1);
        else if(t > 6) s += lanterne(t, dou(6, 7, t));
        return s;
      },
      acteurs:[], avant:function(){ return vignette(); }, fondu:null};
    /* un ami qui attend au fond, de dos, devant l'arche */
    if(t > 16.4) E.acteurs.push({type:'libre', x:A8 + 160, y:YW, z:60, boite:[260, 420], dessin:function(p){ return ami(p, {coul:'#3b2260', h:1.08, ph:0, lit:.8, accessoire:alchimiste}); }});
    if(t > 19.6) E.acteurs.push({type:'libre', x:A8 + 560, y:YW, z:-30, boite:[260, 420], dessin:function(p){ return ami(p, {coul:'#1f3070', h:.95, ph:(t - 19.6) * 1.4, lit:1, accessoire:sage}); }});
    if(t < .6) E.fondu = {k:1 - t / .6};
    else if(t > 22.0) E.fondu = {k:U.clamp((t - 22.0) / 1.5, 0, 1)};
    return E;
  }
};
})();
