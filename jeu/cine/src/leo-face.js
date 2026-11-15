/* leo-face.js — LÉO VU DE FACE, pour les cinématiques (Bible §13.42).
   Le même Léo que dans le combat (leo-corps.js : cheveux de paille en épis, taches de rousseur, barbe de trois jours, le nez qui a
   pris des coups, une cicatrice recousue sur le pectoral et une au sourcil, des bandes de toile aux poignets, le pantalon de meunier
   enfariné, la ceinture à boucle de laiton, la faux dans le dos tenue par une bandoulière, la gourde verte, le sifflet de laiton,
   le sac à rats), mais de face, plus grand, plus détaillé : la caméra est à la place des héros.

   LeoFace.dessin(pose, o) -> le SVG du personnage, dans SON repère (les pieds en 0, 0 ; il mesure environ 600)
     pose : celle de pantin.js, plus :
       v:{…}   le visage : sourcils {f (froncés), l (levés), t (tristes)}, yeux {o (ouverts, 1), lx, ly (le regard), cl (cligne)},
               bouche {o (ouverte), w (large), c (coins : −1 en bas, 1 en haut), d (les dents, le rictus), cri}, nez (plissé),
               veines, sueur, rouge (les joues)
       fl      les muscles bandés (0 → 1) ; poingD, poingG : 'poing' | 'ouvert' | 'tient'
     o : {habit:'cape'|null (la robe noire, les manches, le capuchon : la phase 1), abime (0 → 1 : les marques du combat),
          faux:true (dans le dos), gourde:true, sac:true, sifflet:true, yeuxCape (la lueur des yeux sous le capuchon, 0 → 1)} */
(function(){
'use strict';
var U = window.CU, PT = window.Pantin, M = PT.M;
var O = '#1d0f08', OL = 2.6;
var LF = window.LeoFace = {};

LF.D = {taille:[0, -270], hanche:[42, 34], epaule:[92, -146], cou:[0, -174], bras:96, avant:88, cuisse:110, tibia:126};

var C = {
  peau:['#ffd9b0', '#f2b07e', '#cf8152', '#9a5532'], peauL:'#ffe6c8', trait:'#8a4428',
  cheveux:['#fff3b8', '#f2c862', '#c99032', '#7e5216'], sourcil:'#9a6a22',
  pant:['#7a6a5a', '#54463a', '#352b23'], cuir:['#8a5a34', '#5c3a20', '#33200f'], ceint:['#4a3020', '#2a1a10'],
  or:['#fff0b0', '#e0b050', '#9a6a1e'], bande:['#fbf2dc', '#e2d2ae', '#b8a47c'], acier:['#ffffff', '#dfe5ee', '#9aa4b4', '#5c6574'],
  bois:['#c08a4e', '#8a5a2e', '#55341a'], vert:['#eaffc0', '#9cff5c', '#3fd13a', '#1f8a2a'], toile:['#d7b98a', '#a8865a', '#6e5232'],
  robe:['#2e2840', '#1c1828', '#0d0b14'], doublure:'#4a1e2e', rat:['#b9b2a8', '#8a8076', '#5c544c']
};
function f(n){ return Math.round(n * 10) / 10; }
var idn = 0;

/* les dégradés (dans le repère de chaque forme : ils tournent avec elle) — posés une fois par image dans <defs> */
LF.defs = function(){
  function lin(id, l, x1, y1, x2, y2){ return '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</linearGradient>'; }
  function rad(id, l, cx, cy, r){ return '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</radialGradient>'; }
  return lin('lfPeauX', [C.peau[2], C.peau[1], C.peau[0], C.peau[1], C.peau[2], C.peau[3]], 0, 0, 1, 0) +
    lin('lfPeauB', [C.peau[0], C.peau[1], C.peau[2]], .2, 0, .8, 1) +
    rad('lfPec', [C.peauL, C.peau[0], C.peau[1], C.peau[2]], .55, .3, .8) +
    rad('lfAbs', [C.peau[0], C.peau[1], C.peau[2]], .45, .35, .75) +
    lin('lfBras', [C.peau[0], C.peau[1], C.peau[2], C.peau[3]], .9, 0, .1, .2) +
    rad('lfTete', [C.peauL, C.peau[0], C.peau[1], C.peau[2]], .5, .38, .7) +
    lin('lfCheveux', [C.cheveux[0], C.cheveux[1], C.cheveux[2], C.cheveux[3]], .5, 0, .5, 1) +
    lin('lfPant', [C.pant[0], C.pant[1], C.pant[2]], .9, 0, .1, .3) +
    lin('lfPantX', [C.pant[2], C.pant[1], C.pant[0], C.pant[1], C.pant[2]], 0, 0, 1, 0) +
    lin('lfCuir', C.cuir, .5, 0, .5, 1) + lin('lfCeint', C.ceint, .5, 0, .5, 1) + lin('lfOr', C.or, .2, 0, .8, 1) +
    lin('lfBande', C.bande, .8, 0, .2, 1) + lin('lfAcier', C.acier, .2, 0, .7, 1) + lin('lfBois', C.bois, 0, .5, 1, .5) +
    rad('lfVert', C.vert, .4, .35, .8) + lin('lfToile', C.toile, .8, 0, .2, 1) +
    lin('lfRobe', [C.robe[0], C.robe[1], C.robe[2]], .5, 0, .5, 1) + lin('lfRobeX', [C.robe[2], C.robe[1], C.robe[0], C.robe[1], C.robe[2]], 0, 0, 1, 0) +
    rad('lfBleu', ['#5a3a6a', '#7a3a4a', '#a0503a', 'rgba(160,80,58,0)'], .5, .5, .5) +
    rad('lfYeuxCape', ['#fff8c0', '#ffd040', 'rgba(255,170,0,0)'], .5, .5, .5) +
    rad('lfRat', C.rat, .6, .3, .9);
};

/* ====================================================================== LES PIÈCES */
/* le buste, torse nu (le repère : la taille en 0, 0 ; il monte vers −200) */
function buste(o, fl){
  var s = '';
  var gon = (fl || 0) * 4;
  /* le cou (derrière la tête), les trapèzes */
  /* le tronc (le V : les dorsaux qui s'écartent sous les bras) */
  s += '<path d="M-58 8 C -60 -10 -62 -24 -64 -36 C ' + f(-70 - gon) + ' -60 ' + f(-80 - gon) + ' -84 ' + f(-92 - gon) + ' -106 C ' + f(-98 - gon) + ' -118 ' + f(-100 - gon) + ' -132 -98 -146 ' +
    'C -90 ' + f(-158 - gon) + ' -66 ' + f(-164 - gon) + ' -46 -170 C -38 -172 -32 -176 -30 -186 L 30 -186 C 32 -176 38 -172 46 -170 C 66 ' + f(-164 - gon) + ' 90 ' + f(-158 - gon) + ' 98 -146 ' +
    'C 100 -132 ' + f(98 + gon) + ' -118 ' + f(92 + gon) + ' -106 C ' + f(80 + gon) + ' -84 ' + f(70 + gon) + ' -60 64 -36 C 62 -24 60 -10 58 8 Z" fill="url(#lfPeauX)" stroke="' + O + '" stroke-width="' + OL + '"/>';
  /* le cou, par-dessus (sans trait en bas : il sort du tronc), ses muscles */
  s += '<path d="M-30 -168 C -31 -184 -29 -198 -27 -210 L 27 -210 C 29 -198 31 -184 30 -168" fill="url(#lfPeauX)"/>' +
    '<path d="M-30 -170 C -31 -184 -29 -198 -27 -210 M30 -170 C 31 -184 29 -198 27 -210" fill="none" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-24 -204 C -18 -190 -10 -178 -3 -170 M24 -204 C 18 -190 10 -178 3 -170" fill="none" stroke="' + C.trait + '" stroke-width="1.6" opacity=".55"/>' +
    '<path d="M-3 -170 C -1 -167 1 -167 3 -170" fill="none" stroke="' + C.trait + '" stroke-width="1.4" opacity=".6"/>' +
    '<path d="M-30 -172 C -20 -176 -10 -176 -2 -172 M30 -172 C 20 -176 10 -176 2 -172" fill="none" stroke="' + C.peau[3] + '" stroke-width="3" opacity=".25"/>';
  /* les pectoraux */
  [1, -1].forEach(function(sg){
    var g = '<path d="M4 -158 C 30 ' + f(-166 - gon) + ' 62 ' + f(-162 - gon) + ' ' + f(84 + gon) + ' -148 C ' + f(90 + gon) + ' -134 ' + f(86 + gon) + ' -112 72 -100 C 56 -86 26 -84 7 -95 C 4 -116 3 -140 4 -158 Z" fill="url(#lfPec)"/>' +
      '<path d="M84 -146 C 88 -132 84 -112 72 -100 C 56 -86 26 -84 7 -95 C 4 -116 3 -140 4 -158" fill="none" stroke="' + C.trait + '" stroke-width="1.8"/>' +
      /* l'ombre sous le pectoral, et sur son bord */
      '<path d="M8 -97 C 26 -88 54 -90 70 -102 C 64 -92 50 -84 30 -84 C 20 -84 12 -89 8 -97 Z" fill="' + C.peau[3] + '" opacity=".75"/>' +
      '<path d="M70 -104 C 82 -114 86 -130 84 -146 C 78 -132 72 -116 62 -104 Z" fill="' + C.peau[2] + '" opacity=".45"/>' +
      '<path d="M8 -97 C 26 -88 54 -90 72 -101" fill="none" stroke="' + O + '" stroke-width="2.2" stroke-linecap="round"/>' +
      /* la clavicule, la lumière sur le haut du muscle */
      '<path d="M10 -161 C 32 -168 58 -166 80 -157" fill="none" stroke="' + C.trait + '" stroke-width="1.5" opacity=".5"/>' +
      '<ellipse cx="44" cy="-138" rx="22" ry="11" fill="' + C.peauL + '" opacity=".45" transform="rotate(-8 44 -138)"/>' +
      /* les dentelés, sur le côté */
      '<path d="M66 -96 C 74 -94 78 -88 76 -83 M63 -84 C 71 -82 74 -76 72 -71 M60 -72 C 67 -70 70 -65 68 -60" fill="none" stroke="' + C.trait + '" stroke-width="1.7" stroke-linecap="round" opacity=".75"/>' +
      /* l'oblique, au-dessus de la ceinture */
      '<path d="M50 -38 C 56 -26 58 -14 56 -2" fill="none" stroke="' + C.trait + '" stroke-width="1.7" opacity=".7"/>' +
      '<path d="M46 -30 C 38 -16 30 -4 22 8" fill="none" stroke="' + C.trait + '" stroke-width="1.6" opacity=".7"/>' +
      /* les abdominaux (six) */
      '<path d="M4 -89 C 18 -91 32 -89 36 -81 C 38 -74 36 -68 32 -64 C 22 -62 12 -62 4 -64 Z" fill="url(#lfAbs)" stroke="' + C.trait + '" stroke-width="1.5"/>' +
      '<path d="M4 -59 C 16 -60 30 -59 34 -53 C 36 -46 34 -40 30 -36 C 20 -34 12 -34 4 -36 Z" fill="url(#lfAbs)" stroke="' + C.trait + '" stroke-width="1.5"/>' +
      '<path d="M4 -31 C 14 -32 26 -31 30 -25 C 32 -17 28 -10 24 -6 C 16 -4 10 -4 4 -6 Z" fill="url(#lfAbs)" stroke="' + C.trait + '" stroke-width="1.5"/>' +
      '<path d="M8 -84 C 16 -86 24 -84 28 -80 M8 -54 C 16 -56 24 -54 28 -50 M8 -26 C 14 -28 20 -26 24 -22" fill="none" stroke="' + C.peauL + '" stroke-width="2.2" opacity=".6" stroke-linecap="round"/>';
    s += sg > 0 ? g : '<g transform="scale(-1 1)">' + g + '</g>';
  });
  /* la ligne du milieu, le creux du sternum */
  s += '<path d="M0 -150 L 0 -100 M0 -92 L 0 -4" fill="none" stroke="' + C.trait + '" stroke-width="1.6" opacity=".7"/>';
  /* la vieille cicatrice recousue, sur le pectoral (à gauche de l'image) */
  s += '<path d="M-64 -140 C -52 -132 -40 -124 -26 -114" fill="none" stroke="#c97a6a" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M-58 -142 L -60 -132 M-50 -137 L -53 -127 M-42 -131 L -45 -121 M-34 -125 L -37 -115" fill="none" stroke="#8a3a30" stroke-width="1.4" stroke-linecap="round"/>';
  return s;
}

/* la bandoulière de la faux (de l'épaule droite de l'image à la hanche gauche) et le sifflet */
function bandouliere(){
  var a = [74, -160], b = [-56, 2], n = [-(b[1] - a[1]), b[0] - a[0]], l = Math.hypot(n[0], n[1]); n = [n[0] / l * 8, n[1] / l * 8];
  var s = '<path d="M' + f(a[0] + n[0]) + ' ' + f(a[1] + n[1]) + ' L ' + f(b[0] + n[0]) + ' ' + f(b[1] + n[1]) + ' L ' + f(b[0] - n[0]) + ' ' + f(b[1] - n[1]) + ' L ' + f(a[0] - n[0]) + ' ' + f(a[1] - n[1]) + ' Z" fill="url(#lfCuir)" stroke="' + O + '" stroke-width="2.2"/>';
  s += '<path d="M' + f(a[0] + n[0] * .55) + ' ' + f(a[1] + n[1] * .55) + ' L ' + f(b[0] + n[0] * .55) + ' ' + f(b[1] + n[1] * .55) + ' M' + f(a[0] - n[0] * .55) + ' ' + f(a[1] - n[1] * .55) + ' L ' + f(b[0] - n[0] * .55) + ' ' + f(b[1] - n[1] * .55) + '" fill="none" stroke="#c9a070" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>';
  /* la boucle de laiton au milieu */
  var m = [U.lerp(a[0], b[0], .36), U.lerp(a[1], b[1], .36)];
  s += '<g transform="translate(' + f(m[0]) + ' ' + f(m[1]) + ') rotate(' + f(U.deg(Math.atan2(b[1] - a[1], b[0] - a[0])) + 90) + ')"><rect x="-12" y="-9" width="24" height="18" rx="3" fill="url(#lfOr)" stroke="' + O + '" stroke-width="2"/><rect x="-6" y="-4" width="12" height="8" fill="' + C.cuir[1] + '" stroke="' + O + '" stroke-width="1.2"/></g>';
  return s;
}
function sifflet(){
  return '<path d="M-24 -182 C -16 -150 -6 -142 0 -140 C 6 -142 16 -150 24 -182" fill="none" stroke="#3a2a1a" stroke-width="1.8"/>' +
    '<g transform="translate(2 -136) rotate(18)"><rect x="-5" y="-3" width="20" height="9" rx="4" fill="url(#lfOr)" stroke="' + O + '" stroke-width="1.8"/><circle cx="13" cy="1.5" r="2" fill="#5a3a10"/><rect x="-9" y="-2" width="6" height="7" rx="1.5" fill="' + C.or[2] + '" stroke="' + O + '" stroke-width="1.4"/></g>';
}
/* les marques du combat (abime 0 → 1) : des bleus, des griffures de rats, de la poussière — rien de sanglant */
function marques(k){
  if(!(k > 0)) return '';
  var s = '<g opacity="' + f(U.clamp(k, 0, 1)) + '">';
  [[-62, -118, 20, 14], [58, -44, 16, 22], [30, -152, 12, 9], [-40, -20, 14, 12]].forEach(function(b){
    s += '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="url(#lfBleu)" opacity=".75"/>';
  });
  [[44, -128, 6], [-30, -70, 5], [70, -88, 4]].forEach(function(g){
    for(var i = 0; i < 3; i++) s += '<path d="M' + (g[0] + i * g[2]) + ' ' + (g[1] - 14) + ' l ' + (-10 + i) + ' 26" stroke="#b8443a" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M' + (g[0] + i * g[2] + 1.5) + ' ' + (g[1] - 13) + ' l ' + (-10 + i) + ' 26" stroke="#ffd6c0" stroke-width=".9" stroke-linecap="round" fill="none" opacity=".6"/>';
  });
  s += '<path d="M-50 -60 C -30 -70 -10 -66 0 -58 C -16 -50 -40 -48 -50 -60 Z M20 -20 C 34 -26 48 -22 54 -14 C 40 -10 26 -10 20 -20 Z" fill="#4a3a2a" opacity=".22"/>';
  return s + '</g>';
}

/* le haut du pantalon, la ceinture, la boucle, la gourde, le sac à rats (repère : la taille) */
function bassin(o){
  var s = '<path d="M-60 -2 L 60 -2 C 66 14 70 30 68 48 L 30 64 L 0 70 L -30 64 L -68 48 C -70 30 -66 14 -60 -2 Z" fill="url(#lfPantX)" stroke="' + O + '" stroke-width="' + OL + '"/>';
  s += '<path d="M0 14 L 0 62 M-20 30 C -14 40 -8 50 -4 62 M20 30 C 14 40 8 50 4 62" fill="none" stroke="' + C.pant[2] + '" stroke-width="1.6" opacity=".8"/>';
  /* la farine sur le pantalon */
  s += '<g fill="#eee4d0" opacity=".28"><ellipse cx="-38" cy="40" rx="14" ry="8"/><ellipse cx="30" cy="50" rx="10" ry="6"/><ellipse cx="44" cy="22" rx="8" ry="5"/></g>';
  /* la ceinture */
  s += '<path d="M-62 -6 L 62 -6 L 63 14 L -63 14 Z" fill="url(#lfCeint)" stroke="' + O + '" stroke-width="2.2"/>';
  s += '<path d="M-60 -1 L 60 -1 M-60 9 L 60 9" stroke="#7a5030" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>';
  s += '<rect x="-15" y="-10" width="30" height="28" rx="4" fill="url(#lfOr)" stroke="' + O + '" stroke-width="2.2"/><rect x="-8" y="-3" width="16" height="14" rx="2" fill="' + C.ceint[1] + '" stroke="' + O + '" stroke-width="1.4"/><path d="M0 4 L 14 4" stroke="' + C.or[2] + '" stroke-width="2.4"/>';
  /* le sac à rats (à droite de l'image), un rat qui dépasse */
  if(o.sac !== false){
    s += '<g transform="translate(62 18)"><path d="M-6 0 C -14 10 -16 40 -8 58 C 2 70 28 70 36 56 C 42 40 38 12 28 0 Z" fill="url(#lfToile)" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M-4 6 C 6 10 18 10 28 4" fill="none" stroke="#5a3a1a" stroke-width="2.6"/><path d="M2 20 C 6 34 4 46 0 54 M18 18 C 22 32 24 46 22 58" fill="none" stroke="' + C.toile[2] + '" stroke-width="1.2" opacity=".6"/>' +
      '<g transform="translate(12 -2)"><path d="M-8 2 C -10 -8 -2 -16 6 -14 C 12 -12 16 -6 14 2 Z" fill="url(#lfRat)" stroke="' + O + '" stroke-width="1.8"/><circle cx="-4" cy="-12" r="4" fill="' + C.rat[1] + '" stroke="' + O + '" stroke-width="1.4"/><circle cx="10" cy="-11" r="4" fill="' + C.rat[1] + '" stroke="' + O + '" stroke-width="1.4"/>' +
      '<circle cx="1" cy="-6" r="1.4" fill="#120808"/><circle cx="7" cy="-6" r="1.4" fill="#120808"/><circle cx="4" cy="-2" r="1.6" fill="#e6a0a0"/></g></g>';
  }
  /* la gourde verte (à gauche de l'image) */
  if(o.gourde !== false){
    s += '<g transform="translate(-74 12)"><path d="M6 -8 L 10 6" stroke="' + C.cuir[2] + '" stroke-width="3"/><rect x="2" y="2" width="12" height="10" rx="2" fill="#7a5a3a" stroke="' + O + '" stroke-width="1.6"/>' +
      '<circle cx="8" cy="30" r="20" fill="url(#lfVert)" stroke="' + O + '" stroke-width="2.4"/><path d="M8 20 L 8 40 M-2 30 L 18 30" stroke="#f4fff0" stroke-width="4" stroke-linecap="round" opacity=".85"/>' +
      '<ellipse cx="1" cy="22" rx="6" ry="4" fill="#ffffff" opacity=".55"/></g>';
  }
  return s;
}

/* un bras (le haut) — repère : l'épaule, l'os descend ; +x = le dehors. fl : bandé */
function brasHaut(fl, o){
  fl = fl || 0;
  if(o.habit === 'cape'){
    return '<path d="M-28 -6 C -18 -26 22 -26 34 -8 C 44 20 48 60 52 104 L -24 104 C -28 70 -30 30 -28 -6 Z" fill="url(#lfRobeX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M18 10 C 24 40 30 70 34 100 M-8 20 C -6 50 -4 80 0 102" fill="none" stroke="#08060c" stroke-width="2" opacity=".6"/>';
  }
  /* le deltoïde coiffe le haut du bras ; son bord intérieur n'a pas de trait : il se fond dans le torse */
  var fond = 'M-28 -6 C -20 -22 14 -24 28 -10 C 35 2 35 20 30 38 C ' + f(30 + 20 * fl) + ' 48 ' + f(27 + 24 * fl) + ' 78 ' + f(20 + 4 * fl) + ' 92 C 18 97 16 101 14 104 L -14 104 C -18 84 -22 58 -23 36 C -24 20 -28 8 -28 -6 Z';
  var trait = 'M-6 -20 C 8 -22 21 -19 28 -10 C 35 2 35 20 30 38 C ' + f(30 + 20 * fl) + ' 48 ' + f(27 + 24 * fl) + ' 78 ' + f(20 + 4 * fl) + ' 92 C 18 97 16 101 14 104 L -14 104 C -18 84 -22 58 -23 36';
  return '<path d="' + fond + '" fill="url(#lfBras)"/>' +
    '<path d="M-30 -6 C -26 8 -26 22 -25 36 C -14 30 -10 10 -14 -8 C -18 -16 -26 -14 -30 -6 Z" fill="' + C.peau[2] + '" opacity=".35"/>' +
    '<path d="' + trait + '" fill="none" stroke="' + O + '" stroke-width="' + OL + '" stroke-linecap="round"/>' +
    '<path d="M30 38 C 20 48 4 48 -10 40" fill="none" stroke="' + C.trait + '" stroke-width="1.6" opacity=".6"/>' +
    '<path d="M12 -20 C 18 2 18 22 14 40" fill="none" stroke="' + C.trait + '" stroke-width="1.3" opacity=".35"/>' +
    '<ellipse cx="16" cy="-6" rx="13" ry="9" fill="' + C.peauL + '" opacity=".5"/>' +
    '<ellipse cx="' + f(8 + 9 * fl) + '" cy="' + f(66 - 2 * fl) + '" rx="' + f(11 + 7 * fl) + '" ry="' + f(17 + 2 * fl) + '" fill="' + C.peauL + '" opacity="' + f(.32 + .2 * fl) + '"/>' +
    '<path d="M' + f(12 + 8 * fl) + ' 52 C ' + f(8 + 10 * fl) + ' 66 ' + f(10 + 8 * fl) + ' 80 6 92" fill="none" stroke="#c48a6a" stroke-width="2" opacity="' + f(.3 + .45 * fl) + '"/>' +
    '<path d="M-16 44 C -18 62 -16 80 -12 100" fill="none" stroke="' + C.trait + '" stroke-width="1.4" opacity=".5"/>';
}
function avantBras(o){
  if(o.habit === 'cape'){
    return '<path d="M-24 -8 C -28 30 -30 70 -34 96 C -10 104 30 104 46 92 C 40 60 34 20 30 -8 Z" fill="url(#lfRobeX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
      '<path d="M-30 90 C -6 98 26 98 44 88" fill="none" stroke="#08060c" stroke-width="3" opacity=".7"/>';
  }
  return '<path d="M-18 -6 C -24 14 -22 40 -16 72 L -13 92 L 13 92 L 16 72 C 26 40 28 14 21 -6 Z" fill="url(#lfBras)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M12 6 C 16 22 14 40 8 58 M-4 14 C -8 28 -6 44 -2 60" fill="none" stroke="' + C.trait + '" stroke-width="1.4" opacity=".55"/>' +
    '<path d="M6 20 C 2 30 6 38 2 50" fill="none" stroke="#c48a6a" stroke-width="2" opacity=".5"/>' +
    /* les bandes de toile au poignet */
    '<path d="M-15 62 L 15 62 L 14 94 L -14 94 Z" fill="url(#lfBande)" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M-14 70 L 14 66 M-14 78 L 14 74 M-14 86 L 14 82" stroke="' + C.bande[2] + '" stroke-width="1.4"/>';
}
/* la main : poing, ouverte, ou qui tient quelque chose */
function main(type, o){
  var peau = 'url(#lfPeauB)';
  if(type === 'ouvert'){
    return '<path d="M-14 -2 C -20 8 -22 22 -20 34 L -22 58 C -22 62 -16 62 -15 58 L -12 40 L -10 64 C -9 68 -3 68 -3 64 L -2 42 L 2 66 C 3 70 9 70 9 66 L 8 42 L 12 60 C 13 64 19 63 18 59 L 16 36 C 22 30 26 20 24 10 L 16 -2 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M16 6 C 24 10 30 18 28 26 C 26 30 22 28 20 24" fill="' + peau + '" stroke="' + O + '" stroke-width="2"/>';
  }
  /* le poing (vu de face : les doigts repliés, le pouce dessus) */
  return '<path d="M-17 0 C -23 10 -23 28 -19 38 C -13 47 13 47 19 38 C 23 28 23 10 17 0 Z" fill="' + peau + '" stroke="' + O + '" stroke-width="2.2"/>' +
    '<path d="M-17 24 C -9 30 9 30 17 24 M-10 28 L -11 42 M0 30 L 0 44 M10 28 L 11 42" fill="none" stroke="' + C.trait + '" stroke-width="1.5"/>' +
    (type === 'tient' ? '' : '<path d="M-20 12 C -10 8 2 10 6 18 C 4 22 -6 22 -12 20" fill="' + peau + '" stroke="' + O + '" stroke-width="1.8"/>');
}
/* la cuisse et le tibia (le pantalon, la botte) ; +x = le dehors */
function cuisse(o, cote){
  /* le pantalon de meunier, large en haut */
  return '<path d="M-34 -10 C -38 26 -32 80 -24 124 L 28 128 C 36 80 40 26 37 -10 Z" fill="url(#lfPantX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M20 8 C 16 40 18 80 13 116 M-16 30 C -14 60 -12 90 -14 118 M-6 70 C 2 74 10 74 16 70" fill="none" stroke="' + C.pant[2] + '" stroke-width="1.6" opacity=".7"/>' +
    '<ellipse cx="6" cy="58" rx="11" ry="17" fill="#eee4d0" opacity=".16"/>';
}
function tibia(o, cote){
  var s = '<path d="M-25 -8 C -26 22 -22 52 -19 80 L 21 80 C 24 52 28 22 27 -8 Z" fill="url(#lfPantX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-10 40 C -4 46 6 46 14 40" fill="none" stroke="' + C.pant[2] + '" stroke-width="1.4" opacity=".6"/>';
  /* la pièce cousue au genou (jambe droite de l'image) */
  if(cote === 'D') s += '<path d="M-12 0 L 14 -2 L 15 24 L -11 26 Z" fill="#8a7860" stroke="' + O + '" stroke-width="1.6"/><path d="M-10 2 L 12 0 M-9 23 L 13 21" stroke="#e8dcc0" stroke-width="1" stroke-dasharray="2 2"/>';
  /* la botte, un revers en haut */
  s += '<path d="M-24 72 L 25 72 C 26 98 25 118 24 132 L -23 132 C -24 118 -25 98 -24 72 Z" fill="url(#lfCuir)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-26 68 L 27 68 L 26 84 L -25 84 Z" fill="' + C.cuir[0] + '" stroke="' + O + '" stroke-width="2.2"/>' +
    '<path d="M-6 92 L 6 101 M6 92 L -6 101 M-6 104 L 6 113 M6 104 L -6 113 M-6 116 L 6 125 M6 116 L -6 125" stroke="#e8d4a8" stroke-width="1.6"/>' +
    '<path d="M16 88 C 18 104 18 118 17 130" fill="none" stroke="#c08a5a" stroke-width="2" opacity=".5"/>';
  return s;
}
function pied(){
  return '<path d="M-26 -20 C -30 -8 -28 0 -24 3 L 25 3 C 29 0 31 -8 27 -20 Z" fill="url(#lfCuir)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-24 3 L 25 3 L 26 7 L -25 7 Z" fill="#1a0e06" stroke="' + O + '" stroke-width="1.6"/>' +
    '<ellipse cx="2" cy="-10" rx="12" ry="5" fill="#c08a5a" opacity=".45"/>';
}

/* ---------------------------------------------------------------- LA TÊTE (repère : le bas du cou ; le menton vers −22) */
function tete(v, o, uid){
  v = v || {};
  var so = v.sourcils || {}, ye = v.yeux || {}, bo = v.bouche || {}, ht = v.ht || 0;
  var dx = ht * 5, nx = ht * 7;
  var s = '';
  /* les oreilles */
  [1, -1].forEach(function(sg){
    var ox = sg * (34 - sg * ht * 3);
    s += '<path d="M' + f(ox - sg * 2) + ' -68 C ' + f(ox + sg * 9) + ' -74 ' + f(ox + sg * 12) + ' -56 ' + f(ox + sg * 5) + ' -46 C ' + f(ox + sg * 2) + ' -43 ' + f(ox - sg * 1) + ' -45 ' + f(ox - sg * 2) + ' -48 Z" fill="' + C.peau[1] + '" stroke="' + O + '" stroke-width="2.2"/>' +
      '<path d="M' + f(ox + sg * 2) + ' -64 C ' + f(ox + sg * 7) + ' -64 ' + f(ox + sg * 7) + ' -54 ' + f(ox + sg * 3) + ' -52" fill="none" stroke="' + C.trait + '" stroke-width="1.4"/>';
  });
  /* le visage : la mâchoire carrée */
  var jaw = U.clamp((bo.o || 0) * 13 + (bo.cri || 0) * 6, 0, 20);
  s += '<path d="M-13 ' + f(-22 + jaw) + ' C -25 ' + f(-24 + jaw * .8) + ' -32 ' + f(-33 + jaw * .4) + ' -33 -45 L -35 -63 C -36 -78 -33 -94 -23 -101 C -12 -107 12 -107 23 -101 C 33 -94 36 -78 35 -63 L 33 -45 C 32 ' + f(-33 + jaw * .4) + ' 25 ' + f(-24 + jaw * .8) + ' 13 ' + f(-22 + jaw) + ' C 6 ' + f(-18 + jaw) + ' -6 ' + f(-18 + jaw) + ' -13 ' + f(-22 + jaw) + ' Z" fill="url(#lfTete)" stroke="' + O + '" stroke-width="' + OL + '"/>';
  /* la barbe de trois jours (des points), le menton fendu */
  var R = U.hasard(77), pts = '';
  s += '<path d="M-31 -46 C -30 -32 -22 ' + f(-24 + jaw) + ' -12 ' + f(-21 + jaw) + ' C -4 ' + f(-18 + jaw) + ' 4 ' + f(-18 + jaw) + ' 12 ' + f(-21 + jaw) + ' C 22 ' + f(-24 + jaw) + ' 30 -32 31 -46 C 22 -40 14 -40 10 -42 C 4 -44 -4 -44 -10 -42 C -14 -40 -22 -40 -31 -46 Z" fill="#a07a50" opacity=".18"/>';
  for(var k = 0; k < 260; k++){
    var a = R() * Math.PI, rr = .55 + R() * .45, bx = Math.cos(a) * 30 * rr, by = -40 + Math.sin(a) * 19 * rr + (R() < .25 ? -16 * R() : 0);
    if(Math.abs(bx) < 14 && by < -42) continue;
    pts += '<circle cx="' + f(bx + dx * .6) + '" cy="' + f(by + (by > -36 ? jaw * (by + 36) / -14 * -1 : 0)) + '" r=".42"/>';
  }
  s += '<g fill="#6a4a22" opacity=".5">' + pts + '</g>';
  s += '<path d="M' + f(dx * .5) + ' ' + f(-23 + jaw) + ' l 0 -4" stroke="' + C.trait + '" stroke-width="1.4" opacity=".6"/>';
  /* les pommettes, la lumière sur le front */
  s += '<ellipse cx="' + f(-20 + dx) + '" cy="-56" rx="9" ry="5" fill="#f08a6a" opacity="' + f(.18 + (v.rouge || 0) * .35) + '"/><ellipse cx="' + f(20 + dx) + '" cy="-56" rx="9" ry="5" fill="#f08a6a" opacity="' + f(.18 + (v.rouge || 0) * .35) + '"/>';
  s += '<ellipse cx="' + f(-4 + dx * .5) + '" cy="-90" rx="16" ry="6" fill="' + C.peauL + '" opacity=".5"/>';
  /* les taches de rousseur */
  var R2 = U.hasard(19), tr = '';
  for(var k2 = 0; k2 < 26; k2++){ var sx = R2() < .5 ? -1 : 1, fx = sx * (6 + R2() * 20) + dx, fy = -60 + R2() * 12 - Math.abs(fx) * .05; tr += '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="' + f(.45 + R2() * .5) + '"/>'; }
  s += '<g fill="#b8683a" opacity=".5">' + tr + '</g>';
  /* les plis du nez à la bouche (plus creusés quand il crie, grogne) */
  var pli = .35 + (bo.cri || 0) * .5 + (bo.d || 0) * .4 + (v.nez || 0) * .3;
  s += '<path d="M' + f(-11 + nx) + ' -50 C ' + f(-17 + dx) + ' -44 ' + f(-19 + dx) + ' -38 ' + f(-17 - (bo.w || 0) * 3 + dx) + ' -32 M' + f(11 + nx) + ' -50 C ' + f(17 + dx) + ' -44 ' + f(19 + dx) + ' -38 ' + f(17 + (bo.w || 0) * 3 + dx) + ' -32" fill="none" stroke="' + C.trait + '" stroke-width="1.6" opacity="' + f(U.clamp(pli, 0, 1)) + '"/>';
  /* les yeux */
  s += oeil(-1, ye, so, dx, uid) + oeil(1, ye, so, dx, uid);
  /* les sourcils (épais), la cicatrice qui coupe celui de gauche */
  s += sourcil(-1, so, dx) + sourcil(1, so, dx);
  s += '<path d="M' + f(-19 + dx) + ' -81 L ' + f(-17 + dx) + ' -73" stroke="#f0c0a0" stroke-width="2.4" stroke-linecap="round"/>';
  if((so.f || 0) > .3) s += '<path d="M' + f(-3 + dx) + ' -80 L ' + f(-2 + dx) + ' -70 M' + f(3 + dx) + ' -80 L ' + f(2 + dx) + ' -70" stroke="' + C.trait + '" stroke-width="1.4" opacity="' + f((so.f - .3) * 1.4) + '"/>';
  if((so.t || 0) > .3 || (so.l || 0) > .4) s += '<path d="M' + f(-12 + dx) + ' -92 C ' + f(-4 + dx) + ' -95 ' + f(4 + dx) + ' -95 ' + f(12 + dx) + ' -92 M' + f(-10 + dx) + ' -97 C ' + f(-3 + dx) + ' -99 ' + f(3 + dx) + ' -99 ' + f(10 + dx) + ' -97" fill="none" stroke="' + C.trait + '" stroke-width="1.2" opacity="' + f(Math.max(so.t || 0, (so.l || 0) * .8) * .8) + '"/>';
  /* le nez (il a pris des coups : une bosse) */
  var nz = v.nez || 0;
  s += '<path d="M' + f(-5 + nx) + ' -62 C ' + f(-6 + nx) + ' -58 ' + f(-7 + nx) + ' -55 ' + f(-9 + nx) + ' -52 C ' + f(-12 + nx) + ' -48 ' + f(-9 + nx) + ' ' + f(-43 - nz) + ' ' + f(-4 + nx) + ' ' + f(-45 - nz) + ' C ' + f(-1 + nx) + ' -43 ' + f(1 + nx) + ' -43 ' + f(4 + nx) + ' ' + f(-45 - nz) + ' C ' + f(9 + nx) + ' ' + f(-43 - nz) + ' ' + f(12 + nx) + ' -48 ' + f(9 + nx) + ' -52" fill="' + C.peau[1] + '" stroke="' + O + '" stroke-width="1.9" stroke-linejoin="round"/>' +
    '<path d="M' + f(-3 + nx * .6) + ' -74 C ' + f(-4 + nx) + ' -68 ' + f(-5 + nx) + ' -64 ' + f(-5 + nx) + ' -62" fill="none" stroke="' + C.trait + '" stroke-width="1.4" opacity=".55"/>' +
    '<path d="M' + f(-3 + nx) + ' -64 C ' + f(-1 + nx) + ' -62 ' + f(1 + nx) + ' -62 ' + f(2 + nx) + ' -64" fill="none" stroke="' + C.trait + '" stroke-width="1.3"/>' +
    '<ellipse cx="' + f(-4 + nx) + '" cy="-48" rx="2.4" ry="1.6" fill="#5a2a1a"/><ellipse cx="' + f(4 + nx) + '" cy="-48" rx="2.4" ry="1.6" fill="#5a2a1a"/>' +
    '<ellipse cx="' + f(nx) + '" cy="-55" rx="2.6" ry="3.4" fill="' + C.peauL + '" opacity=".7"/>';
  if(nz > .2) s += '<path d="M' + f(-6 + nx) + ' -66 l -4 -3 M' + f(6 + nx) + ' -66 l 4 -3 M' + f(-5 + nx) + ' -62 l -5 -1 M' + f(5 + nx) + ' -62 l 5 -1" stroke="' + C.trait + '" stroke-width="1.2" opacity="' + f(nz) + '"/>';
  /* la bouche */
  s += bouche(bo, dx, uid);
  /* les veines du front, la sueur */
  if((v.veines || 0) > 0) s += '<path d="M' + f(20 + dx) + ' -96 C ' + f(24 + dx) + ' -90 ' + f(22 + dx) + ' -84 ' + f(26 + dx) + ' -78 M' + f(-8 + dx) + ' -100 C ' + f(-6 + dx) + ' -94 ' + f(-10 + dx) + ' -90 ' + f(-7 + dx) + ' -86" fill="none" stroke="#c0604a" stroke-width="2" opacity="' + f(v.veines) + '" stroke-linecap="round"/>';
  if((v.sueur || 0) > 0){
    [[26, -86, 1], [-28, -80, .8], [10, -98, .7], [-14, -96, .6]].forEach(function(g, i){
      var gy = g[1] + ((v.tSueur || 0) * (8 + i * 3)) % 20;
      s += '<path d="M' + f(g[0] + dx) + ' ' + f(gy - 4) + ' C ' + f(g[0] + 3 + dx) + ' ' + f(gy) + ' ' + f(g[0] + 3 + dx) + ' ' + f(gy + 4) + ' ' + f(g[0] + dx) + ' ' + f(gy + 4) + ' C ' + f(g[0] - 3 + dx) + ' ' + f(gy + 4) + ' ' + f(g[0] - 3 + dx) + ' ' + f(gy) + ' ' + f(g[0] + dx) + ' ' + f(gy - 4) + ' Z" fill="#e8f6ff" stroke="#6a8aa0" stroke-width=".8" opacity="' + f(v.sueur * g[2]) + '"/>';
    });
  }
  /* les marques sur le visage (un bleu à la pommette) */
  if((o.abime || 0) > 0) s += '<ellipse cx="' + f(22 + dx) + '" cy="-58" rx="8" ry="6" fill="url(#lfBleu)" opacity="' + f(o.abime * .8) + '"/><path d="M' + f(-26 + dx) + ' -88 l 6 6" stroke="#b8443a" stroke-width="1.6" opacity="' + f(o.abime) + '"/>';
  /* les cheveux de paille, en épis */
  s += cheveux(v.vent || 0, dx);
  return s;
}
function oeil(sg, ye, so, dx, uid){
  var cx = sg * 15 + dx, cy = -66, op = U.clamp((ye.o == null ? 1 : ye.o) * (1 - (ye.cl || 0)), 0, 1.5);
  var colere = so.f || 0, peur = so.l || 0, triste = so.t || 0;
  var hi = 8 * op, hb = 3.6 * Math.min(op, 1.1) + peur * 1.4;
  /* la paupière du haut descend côté nez quand il est en colère, côté dehors quand il est triste */
  var inX = cx - sg * 9.5, outX = cx + sg * 10;
  var hIn = hi * (1 - colere * .5 + triste * .15), hOut = hi * (1 - triste * .45 + colere * .05);
  var id = 'oe' + uid + (sg > 0 ? 'd' : 'g');
  var forme = 'M' + f(inX) + ' ' + f(cy + .5) + ' C ' + f(inX + sg * 3.5) + ' ' + f(cy - hIn - .5) + ' ' + f(outX - sg * 4.5) + ' ' + f(cy - hOut - .5) + ' ' + f(outX) + ' ' + f(cy - triste * 1.2) +
    ' C ' + f(outX - sg * 4.5) + ' ' + f(cy + hb) + ' ' + f(inX + sg * 3.5) + ' ' + f(cy + hb) + ' ' + f(inX) + ' ' + f(cy + .5) + ' Z';
  var s = '<clipPath id="' + id + '"><path d="' + forme + '"/></clipPath>';
  if(op > .08){
    var ir = 5.4 - peur * .8, lx = cx + (ye.lx || 0) * 3.6, ly = cy - .8 + (ye.ly || 0) * 2.4;
    s += '<path d="' + forme + '" fill="#fbf6ee"/>' +
      '<g clip-path="url(#' + id + ')"><circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="' + f(ir) + '" fill="#4f7fa6" stroke="#1e3448" stroke-width="1.1"/>' +
      '<circle cx="' + f(lx) + '" cy="' + f(ly + ir * .25) + '" r="' + f(ir * .62) + '" fill="#7fb0d4" opacity=".55"/>' +
      '<circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="' + f(ir * .44) + '" fill="#0a1016"/>' +
      '<circle cx="' + f(lx + 1.8) + '" cy="' + f(ly - 1.9) + '" r="1.5" fill="#ffffff"/><circle cx="' + f(lx - 1.6) + '" cy="' + f(ly + 1.8) + '" r=".7" fill="#ffffff" opacity=".8"/>' +
      '<path d="' + forme + '" fill="none" stroke="#b08060" stroke-width="3.4" opacity=".3"/></g>';
  }
  /* la paupière du haut (un trait épais, et son pli au-dessus), celle du bas (fin) */
  s += '<path d="M' + f(inX - sg * .5) + ' ' + f(cy + .5) + ' C ' + f(inX + sg * 3.5) + ' ' + f(cy - hIn - .5) + ' ' + f(outX - sg * 4.5) + ' ' + f(cy - hOut - .5) + ' ' + f(outX + sg * 1.4) + ' ' + f(cy + .3 - triste * 1.2) + '" fill="none" stroke="' + O + '" stroke-width="2.7" stroke-linecap="round"/>';
  s += '<path d="M' + f(inX + sg * 2) + ' ' + f(cy - hIn - 3.2) + ' C ' + f(cx) + ' ' + f(cy - Math.max(hIn, hOut) - 4.6) + ' ' + f(outX - sg * 2) + ' ' + f(cy - hOut - 3.6) + ' ' + f(outX) + ' ' + f(cy - hOut - 1.5) + '" fill="none" stroke="' + C.trait + '" stroke-width="1.2" opacity=".5"/>';
  if(op > .08) s += '<path d="M' + f(outX - sg * 2) + ' ' + f(cy + 1) + ' C ' + f(outX - sg * 5) + ' ' + f(cy + hb + .5) + ' ' + f(inX + sg * 3) + ' ' + f(cy + hb + .5) + ' ' + f(inX + sg * 1) + ' ' + f(cy + 1.2) + '" fill="none" stroke="' + C.trait + '" stroke-width="1.2"/>';
  /* le pli sous l'œil (fatigue, peur) */
  s += '<path d="M' + f(inX + sg * 2) + ' ' + f(cy + hb + 3.8) + ' C ' + f(cx) + ' ' + f(cy + hb + 5.6) + ' ' + f(outX - sg * 2) + ' ' + f(cy + hb + 4.4) + ' ' + f(outX) + ' ' + f(cy + hb + 2.2) + '" fill="none" stroke="' + C.trait + '" stroke-width="1.1" opacity="' + f(.35 + triste * .3 + peur * .2) + '"/>';
  return s;
}
function sourcil(sg, so, dx){
  var colere = so.f || 0, leve = so.l || 0, triste = so.t || 0;
  var inX = sg * 5 + dx, outX = sg * 27 + dx;
  var inY = -76 + colere * 7 - leve * 7 - triste * 9, outY = -80 - colere * 3 - leve * 6 + triste * 4, midY = (inY + outY) / 2 - 2.5 - leve * 1.5 + triste * 1.5;
  var e = 4.4;
  return '<path d="M' + f(inX) + ' ' + f(inY + e * .6) + ' C ' + f(inX + sg * 6) + ' ' + f(midY - e) + ' ' + f(outX - sg * 8) + ' ' + f(midY - e - .5) + ' ' + f(outX) + ' ' + f(outY) +
    ' C ' + f(outX - sg * 8) + ' ' + f(midY + 1) + ' ' + f(inX + sg * 6) + ' ' + f(midY + 2.4) + ' ' + f(inX) + ' ' + f(inY + e) + ' Z" fill="' + C.sourcil + '" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/>';
}
/* la bouche : fermée, qui parle, qui souffle, qui crie, qui grogne (les dents) */
function bouche(b, dx, uid){
  var o = U.clamp(b.o || 0, 0, 1.2), w = b.w || 0, c = b.c || 0, d = b.d || 0, cri = b.cri || 0;
  var w0 = 13 * (1 + .32 * w + .28 * cri), cy = -36;
  var yc = cy - 4.5 * c + 2.5 * o + cri * 2, yu = cy - 1.2 - 3.8 * d - 1.8 * o - cri * 2.5, yl = cy + 1.5 + 11 * o + 4 * cri;
  var s = '';
  if(o < .06 && d < .1){
    s += '<path d="M' + f(-w0 + dx) + ' ' + f(yc) + ' C ' + f(-w0 * .4 + dx) + ' ' + f(cy - .8 + c * 1.6) + ' ' + f(w0 * .4 + dx) + ' ' + f(cy - .8 + c * 1.6) + ' ' + f(w0 + dx) + ' ' + f(yc) + '" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>' +
      (c < -.15 ? '<path d="M' + f(-w0 - 1 + dx) + ' ' + f(yc - 1) + ' l -2.5 3.5 M' + f(w0 + 1 + dx) + ' ' + f(yc - 1) + ' l 2.5 3.5" stroke="' + C.trait + '" stroke-width="1.3" opacity="' + f(-c) + '"/>' : '') +
      '<path d="M' + f(-w0 * .55 + dx) + ' ' + f(cy + 5) + ' C ' + f(-w0 * .2 + dx) + ' ' + f(cy + 7) + ' ' + f(w0 * .2 + dx) + ' ' + f(cy + 7) + ' ' + f(w0 * .55 + dx) + ' ' + f(cy + 5) + '" fill="none" stroke="' + C.trait + '" stroke-width="1.3" opacity=".6"/>';
    return s;
  }
  var id = 'bo' + uid;
  var forme = 'M' + f(-w0 + dx) + ' ' + f(yc) + ' C ' + f(-w0 * .55 + dx) + ' ' + f(yu - 1) + ' ' + f(w0 * .55 + dx) + ' ' + f(yu - 1) + ' ' + f(w0 + dx) + ' ' + f(yc) +
    ' C ' + f(w0 * .65 + dx) + ' ' + f(yl + 1) + ' ' + f(-w0 * .65 + dx) + ' ' + f(yl + 1) + ' ' + f(-w0 + dx) + ' ' + f(yc) + ' Z';
  s += '<clipPath id="' + id + '"><path d="' + forme + '"/></clipPath>';
  s += '<path d="' + forme + '" fill="#3a0c0a"/>';
  s += '<g clip-path="url(#' + id + ')">' +
    /* la langue, au fond */
    '<ellipse cx="' + f(dx) + '" cy="' + f(yl + 2) + '" rx="' + f(w0 * .6) + '" ry="' + f(4 + o * 3) + '" fill="#b8504a"/>' +
    /* les dents du haut */
    '<path d="M' + f(-w0 * .78 + dx) + ' ' + f(yu - 3) + ' L ' + f(w0 * .78 + dx) + ' ' + f(yu - 3) + ' L ' + f(w0 * .72 + dx) + ' ' + f(yu + 5.5 + cri * 1.5) + ' L ' + f(-w0 * .72 + dx) + ' ' + f(yu + 5.5 + cri * 1.5) + ' Z" fill="#fbf4e4" stroke="#8a7a6a" stroke-width=".8"/>' +
    '<path d="M' + f(dx) + ' ' + f(yu - 2) + ' L ' + f(dx) + ' ' + f(yu + 4) + ' M' + f(-w0 * .3 + dx) + ' ' + f(yu - 2) + ' L ' + f(-w0 * .3 + dx) + ' ' + f(yu + 4) + ' M' + f(w0 * .3 + dx) + ' ' + f(yu - 2) + ' L ' + f(w0 * .3 + dx) + ' ' + f(yu + 4) + '" stroke="#b0a090" stroke-width=".8"/>';
  if(o > .35 || d > .3 || cri > .2){
    s += '<path d="M' + f(-w0 * .7 + dx) + ' ' + f(yl + 3) + ' L ' + f(w0 * .7 + dx) + ' ' + f(yl + 3) + ' L ' + f(w0 * .62 + dx) + ' ' + f(yl - 3.6) + ' L ' + f(-w0 * .62 + dx) + ' ' + f(yl - 3.6) + ' Z" fill="#f0e6d0" stroke="#8a7a6a" stroke-width=".8"/>';
  }
  s += '</g>';
  s += '<path d="' + forme + '" fill="none" stroke="' + O + '" stroke-width="2.3" stroke-linejoin="round"/>';
  /* la lèvre du bas, la lumière dessus */
  s += '<path d="M' + f(-w0 * .5 + dx) + ' ' + f(yl + 4) + ' C ' + f(-w0 * .2 + dx) + ' ' + f(yl + 6.5) + ' ' + f(w0 * .2 + dx) + ' ' + f(yl + 6.5) + ' ' + f(w0 * .5 + dx) + ' ' + f(yl + 4) + '" fill="none" stroke="' + C.trait + '" stroke-width="1.3" opacity=".6"/>';
  return s;
}
function cheveux(vent, dx){
  /* des épis, de la racine au bout ; ils partent un peu vers l'arrière et les côtés */
  var E = [[-36, -70, -50, -98], [-33, -86, -46, -118], [-24, -98, -32, -132], [-12, -104, -14, -140], [0, -106, 4, -144], [12, -104, 20, -140],
           [24, -98, 36, -130], [33, -86, 50, -114], [36, -70, 52, -94]];
  var s = '', base = '<path d="M-36 -66 C -38 -88 -26 -106 0 -108 C 26 -106 38 -88 36 -66 C 30 -78 24 -86 14 -90 C 6 -86 -6 -86 -14 -90 C -24 -86 -30 -78 -36 -66 Z" fill="url(#lfCheveux)" stroke="' + O + '" stroke-width="' + OL + '"/>';
  var ep = '';
  E.forEach(function(e, i){
    var bx = e[2] + vent * (6 + i % 3 * 3), by = e[3] + Math.abs(vent) * 4, la = 9;
    var ang = Math.atan2(by - e[1], bx - e[0]), nx = Math.sin(ang) * la, ny = -Math.cos(ang) * la;
    ep += '<path d="M' + f(e[0] - nx + dx * .3) + ' ' + f(e[1] - ny) + ' C ' + f(U.lerp(e[0], bx, .5) - nx * .7 + dx * .3) + ' ' + f(U.lerp(e[1], by, .5) - ny * .7) + ' ' + f(bx - nx * .2 + dx * .3) + ' ' + f(by - ny * .2 + 4) + ' ' + f(bx + dx * .3) + ' ' + f(by) +
      ' C ' + f(bx + nx * .2 + dx * .3) + ' ' + f(by + ny * .2 + 4) + ' ' + f(U.lerp(e[0], bx, .5) + nx * .7 + dx * .3) + ' ' + f(U.lerp(e[1], by, .5) + ny * .7) + ' ' + f(e[0] + nx + dx * .3) + ' ' + f(e[1] + ny) + ' Z" fill="url(#lfCheveux)" stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"/>';
  });
  /* la frange : quelques mèches qui retombent sur le front */
  var fr = '<path d="M-30 -90 C -22 -96 -12 -98 -4 -94 L -8 -86 C -14 -90 -22 -90 -30 -85 Z M4 -96 C 14 -99 24 -97 32 -90 L 30 -84 C 24 -90 14 -92 8 -87 Z" fill="url(#lfCheveux)" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M-20 -100 C -16 -112 -12 -120 -10 -128 M6 -102 C 8 -114 12 -124 14 -132 M24 -94 C 30 -104 36 -112 42 -118" fill="none" stroke="' + C.cheveux[0] + '" stroke-width="2" opacity=".7"/>';
  return ep + base + fr;
}

/* ---------------------------------------------------------------- LA PHASE 1 : la robe noire, le capuchon */
function robeBuste(){
  return '<path d="M-62 10 C -66 -30 -82 -80 -94 -142 C -88 -156 -66 -164 -46 -170 C -36 -173 -30 -178 -28 -188 L 28 -188 C 30 -178 36 -173 46 -170 C 66 -164 88 -156 94 -142 C 82 -80 66 -30 62 10 Z" fill="url(#lfRobeX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-30 -160 C -20 -120 -16 -60 -18 6 M30 -160 C 20 -120 16 -60 18 6 M0 -150 L 0 6" fill="none" stroke="#08060c" stroke-width="2.2" opacity=".7"/>' +
    '<path d="M-50 -150 C -40 -110 -40 -60 -44 0 M50 -150 C 40 -110 40 -60 44 0" fill="none" stroke="#3a3450" stroke-width="2" opacity=".5"/>' +
    /* la corde nouée à la taille */
    '<path d="M-62 -4 C -20 2 20 2 62 -4 L 62 4 C 20 10 -20 10 -62 4 Z" fill="#3a2e24" stroke="' + O + '" stroke-width="1.8"/><path d="M14 4 C 12 20 16 34 12 46 M20 4 C 22 20 26 32 24 44" fill="none" stroke="#3a2e24" stroke-width="4" stroke-linecap="round"/>';
}
function capuchon(lueur, uid){
  var s = '<path d="M-58 4 C -66 -36 -56 -104 -26 -136 C -10 -150 10 -150 26 -136 C 56 -104 66 -36 58 4 C 40 -6 -40 -6 -58 4 Z" fill="url(#lfRobe)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M-28 -18 C -36 -50 -30 -88 0 -98 C 30 -88 36 -50 28 -18 C 16 -10 -16 -10 -28 -18 Z" fill="#030205" stroke="' + O + '" stroke-width="2"/>' +
    '<path d="M-40 -6 C -46 -40 -40 -90 -14 -114 M40 -6 C 46 -40 40 -90 14 -114" fill="none" stroke="#3a3450" stroke-width="2" opacity=".5"/>' +
    /* l'agrafe de la cape, au cou */
    '<circle cx="0" cy="2" r="9" fill="url(#lfAcier)" stroke="' + O + '" stroke-width="2"/><circle cx="0" cy="2" r="3.5" fill="#3a3a48"/>';
  var l = lueur == null ? 1 : lueur;
  if(l > 0){
    s += '<ellipse cx="-12" cy="-60" rx="14" ry="9" fill="url(#lfYeuxCape)" opacity="' + f(.7 * l) + '"/><ellipse cx="12" cy="-60" rx="14" ry="9" fill="url(#lfYeuxCape)" opacity="' + f(.7 * l) + '"/>' +
      '<path d="M-19 -63 L -6 -59 L -18 -57 Z M19 -63 L 6 -59 L 18 -57 Z" fill="#fff6b0" opacity="' + f(l) + '"/>';
  }
  return s;
}
/* la cape qui pend derrière lui (portée) : du haut des épaules jusqu'au sol ; ses bords suivent le corps */
function capeDos(os, D, balance){
  var g = M.pt(os.buste, -96, -150), d = M.pt(os.buste, 96, -150), sol = 0;
  var bas = Math.min(-6, sol - 6), hb = balance || 0;
  var lg = M.pt(os.buste, -110, -60), ld = M.pt(os.buste, 110, -60);
  var x0 = Math.min(g[0], lg[0]) - 30 + hb * .5, x1 = Math.max(d[0], ld[0]) + 30 + hb * .5;
  return '<path d="M' + f(g[0]) + ' ' + f(g[1]) + ' C ' + f(lg[0] - 20) + ' ' + f(lg[1]) + ' ' + f(x0 - 30 + hb) + ' ' + f(bas - 120) + ' ' + f(x0 - 40 + hb * 1.4) + ' ' + f(bas) +
    ' C ' + f(x0 + 40 + hb) + ' ' + f(bas + 8) + ' ' + f(x1 - 40 + hb) + ' ' + f(bas + 8) + ' ' + f(x1 + 40 + hb * 1.4) + ' ' + f(bas) +
    ' C ' + f(x1 + 30 + hb) + ' ' + f(bas - 120) + ' ' + f(ld[0] + 20) + ' ' + f(ld[1]) + ' ' + f(d[0]) + ' ' + f(d[1]) + ' Z" fill="url(#lfRobe)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M' + f(x0 - 10 + hb) + ' ' + f(bas - 4) + ' C ' + f(x0 + 10) + ' ' + f(bas - 200) + ' ' + f(lg[0]) + ' ' + f(lg[1] + 40) + ' ' + f(lg[0] + 10) + ' ' + f(lg[1]) + ' M' + f(x1 + 10 + hb) + ' ' + f(bas - 4) + ' C ' + f(x1 - 10) + ' ' + f(bas - 200) + ' ' + f(ld[0]) + ' ' + f(ld[1] + 40) + ' ' + f(ld[0] - 10) + ' ' + f(ld[1]) + '" fill="none" stroke="#3a3450" stroke-width="2.4" opacity=".55"/>';
}
/* le pan de robe devant les jambes (portée, phase 1) : de la taille jusqu'aux bottes */
function robeBas(os){
  var t1 = M.pt(os.bassin, -64, 0), t2 = M.pt(os.bassin, 64, 0);
  var gG = os.genouG, gD = os.genouD, pG = os.piedG, pD = os.piedD;
  var bgx = Math.min(gG[0], pG[0]) - 34, bdx = Math.max(gD[0], pD[0]) + 34;
  var basY = Math.min(-26, Math.max(gG[1], gD[1]) + 40);
  if(os.gG > .5 || os.gD > .5) basY = -4;
  return '<path d="M' + f(t1[0]) + ' ' + f(t1[1]) + ' C ' + f(t1[0] - 10) + ' ' + f(t1[1] + 60) + ' ' + f(bgx) + ' ' + f(basY - 80) + ' ' + f(bgx - 8) + ' ' + f(basY) +
    ' C ' + f(bgx + 40) + ' ' + f(basY + 6) + ' ' + f(bdx - 40) + ' ' + f(basY + 6) + ' ' + f(bdx + 8) + ' ' + f(basY) + ' C ' + f(bdx) + ' ' + f(basY - 80) + ' ' + f(t2[0] + 10) + ' ' + f(t2[1] + 60) + ' ' + f(t2[0]) + ' ' + f(t2[1]) + ' Z" fill="url(#lfRobeX)" stroke="' + O + '" stroke-width="' + OL + '"/>' +
    '<path d="M' + f((t1[0] + t2[0]) / 2) + ' ' + f(t1[1] + 10) + ' C ' + f((t1[0] + t2[0]) / 2) + ' ' + f(t1[1] + 120) + ' ' + f((bgx + bdx) / 2 - 10) + ' ' + f(basY - 40) + ' ' + f((bgx + bdx) / 2) + ' ' + f(basY) +
    ' M' + f(t1[0] + 20) + ' ' + f(t1[1] + 20) + ' C ' + f(bgx + 30) + ' ' + f(basY - 120) + ' ' + f(bgx + 20) + ' ' + f(basY - 30) + ' ' + f(bgx + 26) + ' ' + f(basY) +
    ' M' + f(t2[0] - 20) + ' ' + f(t2[1] + 20) + ' C ' + f(bdx - 30) + ' ' + f(basY - 120) + ' ' + f(bdx - 20) + ' ' + f(basY - 30) + ' ' + f(bdx - 26) + ' ' + f(basY) + '" fill="none" stroke="#08060c" stroke-width="2" opacity=".65"/>';
}

/* la faux, dans son dos : le manche en travers, la lame au-dessus de l'épaule droite de l'image */
function fauxDos(os){
  var a = M.pt(os.buste, -70, 20), b = M.pt(os.buste, 92, -236);
  var s = '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L ' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + O + '" stroke-width="12" stroke-linecap="round"/><path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L ' + f(b[0]) + ' ' + f(b[1]) + '" stroke="url(#lfBois)" stroke-width="7" stroke-linecap="round"/>';
  var ang = U.deg(Math.atan2(b[1] - a[1], b[0] - a[0]));
  s += '<g transform="translate(' + f(b[0]) + ' ' + f(b[1]) + ') rotate(' + f(ang + 90) + ')"><path d="M-6 -4 C 30 -20 80 -20 120 6 C 90 -4 50 -2 10 12 Z" fill="url(#lfAcier)" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 4 C 50 -10 86 -10 112 2" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".8"/></g>';
  return s;
}

/* ====================================================================== LE PERSONNAGE ENTIER */
LF.dessin = function(p, o){
  o = o || {};
  var D = LF.D, os = PT.os(D, p), uid = 'L' + (++idn);
  var cape = o.habit === 'cape', fl = p.fl || 0, v = p.v || {};
  var s = '';
  /* derrière : la cape (phase 1), la faux dans le dos (phase 2) */
  if(cape && o.capeDos !== false) s += capeDos(os, D, p.balance || 0);
  if(!cape && o.faux !== false) s += fauxDos(os);
  /* les jambes : la plus éloignée d'abord (à genou, celle qui est au sol devant) */
  ['G', 'D'].forEach(function(c){
    s += PT.piece(os['c' + c], cuisse(o, c));
    if(os['g' + c] < .9) s += PT.piece(os['t' + c], tibia(o, c));
    if(os['g' + c] < .5) s += PT.piece(os['p' + c], pied());
    else s += PT.piece(os['p' + c], '<path d="M-24 -10 C -26 2 26 2 24 -10 C 20 -16 -20 -16 -24 -10 Z" fill="url(#lfPantX)" stroke="' + O + '" stroke-width="' + OL + '"/>');
  });
  if(cape) s += robeBas(os);
  /* les bras derrière le buste (ils pendent le long du corps), sauf ceux qui passent devant (b.devant) */
  function unBras(c, quoi){
    var b = p['b' + c] || {}, r = '';
    if(quoi !== 'avant') r += PT.piece(os['b' + c], brasHaut(fl * (b.fl == null ? 1 : b.fl), o));
    if(quoi !== 'haut'){ r += PT.piece(os['a' + c], avantBras(o)); r += PT.piece(os['m' + c], main(p['poing' + c] || 'poing', o)); }
    return r;
  }
  /* le bassin et le buste */
  s += PT.piece(os.bassin, cape ? '' : bassin(o));
  if(cape) s += PT.piece(os.buste, robeBuste());
  else s += PT.piece(os.buste, buste(o, fl) + marques(o.abime) + (o.faux !== false ? bandouliere() : '') + (o.sifflet !== false ? sifflet() : ''));
  ['G', 'D'].forEach(function(c){ s += unBras(c); });
  /* la tête (avec le capuchon, en phase 1) */
  var te = p.tete || {};
  s += PT.piece(os.tete, cape ? capuchon(o.yeuxCape, uid) : tete(Object.assign({ht:te.ht || 0}, v), o, uid));
  /* ce qu'il tient (la fiole, l'agrafe) : dessiné par le film, au point de la main */
  LF.dernier = {os:os, uid:uid};
  return s;
};
/* un point du corps (dans le repère du personnage) : la main, la bouche… */
LF.point = function(os, nom){
  if(nom === 'mainD') return M.pt(os.mD, 0, 22);
  if(nom === 'mainG') return M.pt(os.mG, 0, 22);
  if(nom === 'bouche') return M.pt(os.tete, 0, -36);
  if(nom === 'agrafe') return M.pt(os.tete, 0, 2);
  if(nom === 'poitrine') return M.pt(os.buste, 0, -120);
  if(nom === 'tete') return M.pt(os.tete, 0, -66);
  return [0, 0];
};
LF.couleurs = C;
})();
