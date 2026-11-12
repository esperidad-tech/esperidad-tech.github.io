/* ==========================================================
   Brumeval — le grand monde : les lieux et les mystères autour du village (Bible chapitre 14)
   Chaque lieu : son dessin (dans le style de carte.js : contour sombre, dégradés), sa place, son étiquette, sa zone de brume.
   ========================================================== */
(function(){
'use strict';
var Monde = window.Monde, O = Monde.O, T = Monde.T;
var f = O.f, C = O.CONTOUR;

Monde.lieux = function(p, pv){
  var G = function(id){ return 'url(#' + pv + id + ')'; }, M = function(id){ return 'url(#' + p + id + ')'; };
  var st = ' stroke="' + C + '"';

  /* ---------- petites briques ---------- */
  function om(cx, cy, rx, ry, o){ return O.ombre(cx, cy, rx, ry, o); }
  /* Un bâtiment vu de haut et un peu de face, comme les maisons du village */
  function batiment(cx, cy, w, o){
    o = o || {};
    var toitH = o.toitH || 52, murH = o.murH || 28, x0 = cx - w / 2, top = cy - toitH + 12, wy = top + toitH - 4, s = '';
    s += '<rect x="' + f(x0 + 7) + '" y="' + f(top + 9) + '" width="' + w + '" height="' + (toitH + murH) + '" rx="8" fill="#0b1a10" opacity=".3"/>';
    s += '<rect x="' + f(x0 + 2) + '" y="' + f(wy) + '" width="' + (w - 4) + '" height="' + (murH + 4) + '" rx="3" fill="' + G(o.mur || 'mur') + '"' + st + ' stroke-width="3"/>';
    if(o.planches) for(var i = 1; i < w / 12; i++) s += '<path d="M' + f(x0 + i * 12) + ' ' + f(wy + 2) + ' v' + (murH) + '" stroke="#5a3a22" stroke-width="2" opacity=".4"/>';
    if(o.porte !== false){
      var pw = o.grandePorte ? 30 : 16;
      s += '<path d="M' + f(cx - pw / 2) + ' ' + f(wy + murH + 4) + ' v-' + (murH - 9) + ' a' + (pw / 2) + ' ' + (pw / 2) + ' 0 0 1 ' + pw + ' 0 v' + (murH - 9) + ' z" fill="' + (o.porteCouleur || '#6f4529') + '"' + st + ' stroke-width="2.5"/>';
      if(o.grandePorte) s += '<path d="M' + f(cx) + ' ' + f(wy + 12) + ' v' + (murH - 8) + '" stroke="' + C + '" stroke-width="2"/>';
    }
    (o.fenetres || [[x0 + 14, wy + 10], [x0 + w - 30, wy + 10]]).forEach(function(q){
      s += '<rect x="' + f(q[0]) + '" y="' + f(q[1]) + '" width="16" height="13" rx="2" fill="' + (o.volets ? '#4a3b55' : '#86b9dd') + '"' + st + ' stroke-width="2"/>';
      if(o.volets) s += '<path d="M' + f(q[0] + 8) + ' ' + f(q[1]) + ' v13 M' + f(q[0] + 2) + ' ' + f(q[1] + 4.5) + ' h12 M' + f(q[0] + 2) + ' ' + f(q[1] + 9) + ' h12" stroke="' + C + '" stroke-width="1.2" opacity=".7"/>';
    });
    if(o.cheminee !== false){ s += '<rect x="' + f(x0 + w - 30) + '" y="' + f(top - 4) + '" width="15" height="22" rx="2" fill="#b4644a"' + st + ' stroke-width="2.5"/>'; }
    s += '<path d="M' + f(x0 - 6) + ' ' + f(top + toitH) + ' L' + f(x0 + 9) + ' ' + f(top) + ' L' + f(x0 + w - 9) + ' ' + f(top) + ' L' + f(x0 + w + 6) + ' ' + f(top + toitH) + ' Z" fill="' + G('t-' + (o.toit || 'terre')) + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<path d="M' + f(x0 + 2) + ' ' + f(top + toitH * .35) + ' H' + f(x0 + w - 2) + ' M' + f(x0 - 2) + ' ' + f(top + toitH * .68) + ' H' + f(x0 + w + 2) + '" stroke="#000" stroke-width="2" opacity=".14"/>';
    s += '<path d="M' + f(x0 + 12) + ' ' + f(top + 5) + ' H' + f(x0 + w - 12) + '" stroke="#fff" stroke-width="3" opacity=".28" stroke-linecap="round"/>';
    if(o.trous) o.trous.forEach(function(q){ s += '<path d="' + O.tache(x0 + q[0], top + q[1], q[2], q[2] * .8, q[0], 7, .3) + '" fill="#2c2440"' + st + ' stroke-width="2"/>'; });
    return s;
  }
  function pierreLevee(x, y, w, h, penche, rune){
    var s = om(x + 7, y + 4, w * .8, 7, .3);
    s += '<path transform="rotate(' + (penche || 0) + ' ' + x + ' ' + y + ')" d="M' + f(x - w / 2) + ' ' + y + ' v' + f(-h + w / 2) + ' q' + f(w * .1) + ' ' + f(-w * .7) + ' ' + f(w / 2) + ' ' + f(-w * .6) + ' q' + f(w * .45) + ' ' + f(w * .05) + ' ' + f(w / 2) + ' ' + f(w * .6) + ' v' + f(h - w / 2) + ' z" fill="' + M('roche') + '"' + st + ' stroke-width="3" stroke-linejoin="round"/>';
    if(rune) s += '<g transform="rotate(' + (penche || 0) + ' ' + x + ' ' + y + ')"><path class="ca-vacille" d="M' + f(x) + ' ' + f(y - h * .72) + ' v' + f(h * .34) + ' M' + f(x - w * .22) + ' ' + f(y - h * .58) + ' l' + f(w * .22) + ' ' + f(h * .12) + ' l' + f(w * .22) + ' ' + f(-h * .12) + '" stroke="#8ff3ff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/></g>';
    return s;
  }
  function arbreMort(x, y, k){
    k = k || 1;
    var d = 'M' + x + ' ' + y + ' v' + f(-34 * k) + ' M' + x + ' ' + f(y - 18 * k) + ' l' + f(-16 * k) + ' ' + f(-14 * k) + ' M' + x + ' ' + f(y - 26 * k) + ' l' + f(15 * k) + ' ' + f(-13 * k) + ' M' + f(x - 16 * k) + ' ' + f(y - 32 * k) + ' l' + f(-4 * k) + ' ' + f(-10 * k) + ' M' + f(x + 15 * k) + ' ' + f(y - 39 * k) + ' l' + f(8 * k) + ' ' + f(-7 * k) + ' M' + x + ' ' + f(y - 34 * k) + ' l' + f(-5 * k) + ' ' + f(-12 * k);
    return om(x + 5, y + 2, 12 * k, 4, .3) + '<path d="' + d + '" stroke="' + C + '" stroke-width="' + f(8 * k) + '" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="#8a7a70" stroke-width="' + f(4 * k) + '" stroke-linecap="round" fill="none"/>';
  }
  function corbeau(x, y, k){ k = k || 1; return '<path transform="translate(' + x + ' ' + y + ') scale(' + k + ')" d="M-14 0 q6 -9 14 -5 q5 -6 12 -2 l-5 3 q4 2 6 6 q-10 -1 -15 2 q-7 1 -12 -4 z" fill="#1b1424"' + st + ' stroke-width="1.5"/>'; }
  function poteau(x, y, textes){   /* un poteau indicateur, comme au carrefour */
    var s = om(x + 4, y + 2, 9, 3.5, .25) + '<rect x="' + (x - 3.5) + '" y="' + (y - 50) + '" width="7" height="52" rx="3" fill="' + G('bois') + '"' + st + ' stroke-width="2.5"/>';
    s += '<path d="M' + (x + 3) + ' ' + (y - 47) + ' h30 l9 8 l-9 8 h-30 z" fill="#c9a06a"' + st + ' stroke-width="2.5"/>';
    if(textes !== 1) s += '<path d="M' + (x - 3) + ' ' + (y - 30) + ' h-30 l-9 8 l9 8 h30 z" fill="#c9a06a"' + st + ' stroke-width="2.5"/>';
    return s;
  }
  function lanterneEteinte(x, y){
    return om(x + 4, y + 2, 7, 3, .25) + '<path d="M' + x + ' ' + y + ' v-34" stroke="' + C + '" stroke-width="5" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' v-34" stroke="#6b6478" stroke-width="2.5" stroke-linecap="round"/>' +
      '<rect x="' + (x - 7) + '" y="' + (y - 50) + '" width="14" height="16" rx="3" fill="#aab3c5"' + st + ' stroke-width="2.5" opacity=".95"/><path d="M' + (x - 9) + ' ' + (y - 50) + ' l9 -8 l9 8 z" fill="#4a4560"' + st + ' stroke-width="2"/>';
  }
  function meule(x, y, k){ k = k || 1; return om(x + 5, y + 3, 16 * k, 5, .28) + '<path d="M' + f(x - 16 * k) + ' ' + y + ' q' + f(16 * k) + ' ' + f(-34 * k) + ' ' + f(32 * k) + ' 0 z" fill="#f2c84b"' + st + ' stroke-width="2.5"/><path d="M' + f(x - 9 * k) + ' ' + f(y - 8 * k) + ' h' + f(18 * k) + '" stroke="#b07a1c" stroke-width="2"/>'; }
  function barque(x, y, rot, couleur){
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')"><path d="M-24 0 q24 -17 48 0 q-24 17 -48 0 z" fill="' + (couleur || '#9a6a40') + '"' + st + ' stroke-width="2.5"/><path d="M-10 -6 v12 M6 -7 v14" stroke="#5a3a22" stroke-width="3"/></g>';
  }
  function roseaux(x, y, n, graine){
    var r = O.rng(graine || x), s = '';
    for(var i = 0; i < n; i++){ var dx = (r() - .5) * 26, h = 12 + r() * 10; s += '<path d="M' + f(x + dx) + ' ' + f(y + (r() - .5) * 8) + ' v' + f(-h) + '" stroke="#3f6a3a" stroke-width="3" stroke-linecap="round"/><ellipse cx="' + f(x + dx) + '" cy="' + f(y - h - 3) + '" rx="2.6" ry="5" fill="#7a5131"/>'; }
    return s;
  }
  function follet(x, y, i){ return '<g class="ca-follet ca-follet' + (i % 3) + '" style="animation-delay:-' + (i * 1.3).toFixed(1) + 's"><circle cx="' + x + '" cy="' + y + '" r="17" fill="' + G('cyan') + '"/><circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#f0ffff"/></g>'; }

  /* ---------- les lieux ---------- */
  var L = [];
  function lieu(o){   /* o.dx : tout le dessin est décalé d'un bloc (pour rentrer un lieu trop près du bord) */
    if(o.dx){ var d = o.dessin, dx = o.dx; o.dessin = function(){ return '<g transform="translate(' + dx + ' 0)">' + d() + '</g>'; }; }
    L.push(o);
  }

  /* ⛏️ La mine condamnée (nord-ouest) */
  lieu({id:'mine', zone:'no', x:370, y:300, nom:'Mine condamnée', ic:'⛏️', etiq:[470,398], emprise:[372,262,112], dessin:function(){
    var s = '<path d="' + O.tache(372, 232, 128, 66, 3, 11, .16) + '" transform="translate(9 12)" fill="#0b1a10" opacity=".3"/>';
    s += '<path d="' + O.tache(372, 232, 128, 66, 3, 11, .16) + '" fill="' + M('roche') + '"' + st + ' stroke-width="3.5"/>';
    s += '<path d="M300 220 l26 -18 M420 206 l28 14 M352 196 l12 -14 M286 250 l22 6 M440 248 l24 -8" stroke="' + C + '" stroke-width="2" opacity=".3" stroke-linecap="round"/>';
    s += T.rocher(p, 276, 276, 26, 5) + T.rocher(p, 470, 270, 22, 6);
    s += '<path d="M342 292 v-30 a28 28 0 0 1 56 0 v30 z" fill="' + M('nuit') + '"' + st + ' stroke-width="3"/>';
    s += '<path d="M340 294 v-32 a30 30 0 0 1 60 0 v32" fill="none" stroke="' + C + '" stroke-width="10"/><path d="M340 294 v-32 a30 30 0 0 1 60 0 v32" fill="none" stroke="#9a6a40" stroke-width="5.5"/>';
    s += '<path d="M344 248 L398 284 M396 250 L346 286" stroke="' + C + '" stroke-width="10" stroke-linecap="round"/><path d="M344 248 L398 284 M396 250 L346 286" stroke="#b07b4c" stroke-width="5.5" stroke-linecap="round"/>';
    /* les rails et le wagonnet aux pierres bleues */
    s += '<path d="M362 296 L430 356 M378 294 L446 352" stroke="' + C + '" stroke-width="4"/>';
    for(var i = 0; i < 6; i++) s += '<path d="M' + (358 + i * 13.5) + ' ' + (302 + i * 11.5) + ' l22 -5" stroke="#7a5131" stroke-width="4" stroke-linecap="round"/>';
    s += om(448, 362, 22, 7, .3) + '<path d="M420 326 h44 l-6 26 h-32 z" fill="#7b7f92"' + st + ' stroke-width="3"/><circle cx="430" cy="356" r="6" fill="#3a3348"' + st + ' stroke-width="2"/><circle cx="454" cy="356" r="6" fill="#3a3348"' + st + ' stroke-width="2"/>';
    s += '<circle class="ca-vacille" cx="442" cy="322" r="20" fill="' + G('cyan') + '" opacity=".6"/><path d="M428 326 l6 -11 l7 9 l6 -12 l8 14 z" fill="#8ff3ff"' + st + ' stroke-width="2" stroke-linejoin="round"/>';
    /* le panneau « danger » */
    s += '<path d="M306 306 v-22" stroke="' + C + '" stroke-width="4"/><path d="M292 286 l14 -24 l14 24 z" fill="#f5b945"' + st + ' stroke-width="2.5" stroke-linejoin="round"/><path d="M306 270 v8 M306 281 v1" stroke="' + C + '" stroke-width="2.5" stroke-linecap="round"/>';
    return s;
  }});

  /* 🏰 La Vieille Tour (une tour de guet en ruine, sur son rocher) */
  lieu({id:'tour', zone:'no', x:266, y:580, nom:'Vieille Tour', ic:'🏰', etiq:[280,642], emprise:[266,548,74], dessin:function(){
    var x = 266, s = '<path d="' + O.tache(x, 572, 82, 34, 12, 10, .2) + '" fill="' + M('roche') + '"' + st + ' stroke-width="3"/>';
    s += om(x + 12, 580, 40, 12, .32);
    s += '<path d="M' + (x - 31) + ' 578 V476 l10 -9 l8 12 l9 -16 l10 11 l8 -13 l9 17 l8 -7 V578 z" fill="' + G('pierre') + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<path d="M' + (x - 31) + ' 506 h62 M' + (x - 31) + ' 540 h62 M' + (x - 10) + ' 506 v34 M' + (x + 12) + ' 540 v38 M' + (x + 8) + ' 478 v28" stroke="' + C + '" stroke-width="1.5" opacity=".32"/>';
    s += '<path d="M' + (x - 9) + ' 578 v-20 a9 9 0 0 1 18 0 v20 z" fill="' + M('nuit') + '"' + st + ' stroke-width="2.5"/>';
    s += '<rect x="' + (x - 4) + '" y="512" width="8" height="18" rx="4" fill="' + M('nuit') + '"' + st + ' stroke-width="2"/>';
    s += '<path d="M' + (x - 31) + ' 560 q10 -22 4 -44 q14 12 8 34 q10 -4 12 10" fill="#4f9a52"' + st + ' stroke-width="2" stroke-linejoin="round"/>';
    s += T.rocher(p, x - 58, 584, 17, 14, {fin:1}) + T.rocher(p, x + 56, 590, 14, 15, {fin:1}) + T.rocher(p, x + 34, 600, 9, 16, {fin:1});
    s += corbeau(x + 6, 462, 1);
    return s;
  }});

  /* 🏕️ Le camp des bûcherons */
  lieu({id:'bucherons', zone:'no', x:720, y:640, nom:'Camp des bûcherons', ic:'🏕️', etiq:[700,704], emprise:[720,618,96], dessin:function(){
    var s = batiment(676, 628, 84, {mur:'bois', toit:'mousse', planches:true});
    /* le tas de bûches */
    s += om(782, 650, 44, 9, .3);
    [[748,640],[766,640],[784,640],[802,640],[757,626],[775,626],[793,626],[766,612],[784,612]].forEach(function(q){ s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="9.5" fill="#d2a56c"' + st + ' stroke-width="2.5"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="4" fill="none" stroke="#9a6a40" stroke-width="1.5"/>'; });
    /* des souches, et la hache plantée */
    [[640,676,11],[802,588,10],[744,574,9]].forEach(function(q){ s += om(q[0] + 4, q[1] + 4, q[2], q[2] * .5, .25) + '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#c79a63"' + st + ' stroke-width="2.5"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (q[2] * .45) + '" fill="none" stroke="#8a5f3c" stroke-width="1.5"/>'; });
    s += '<path d="M640 676 l14 -24" stroke="' + C + '" stroke-width="5" stroke-linecap="round"/><path d="M640 676 l14 -24" stroke="#b07b4c" stroke-width="2.5" stroke-linecap="round"/><path d="M648 650 l14 4 l-4 10 l-12 -6 z" fill="#b9c0cf"' + st + ' stroke-width="2"/>';
    return s;
  }});

  /* 💦 La Source */
  lieu({id:'source', zone:'no', x:800, y:350, nom:'Source', ic:'💦', etiq:[806,262], emprise:[800,332,52], dessin:function(){
    var s = T.rocher(p, 772, 318, 22, 21) + T.rocher(p, 806, 306, 26, 22) + T.rocher(p, 836, 322, 18, 23);
    s += '<ellipse cx="800" cy="340" rx="31" ry="22" fill="' + G('eauR') + '" stroke="#2a4a6a" stroke-width="3"/>';
    s += '<circle class="ca-onde" cx="800" cy="340" r="11" fill="none" stroke="#e6f6ff" stroke-width="2.5"/><circle class="ca-onde ca-onde2" cx="800" cy="340" r="11" fill="none" stroke="#e6f6ff" stroke-width="2.5"/>';
    s += '<path class="ca-flot" d="M803 312 v22" stroke="#e6f6ff" stroke-width="5" stroke-dasharray="5 6" stroke-linecap="round" opacity=".9"/>';
    return s;
  }});

  /* 🍄 Le rond des Sorcières */
  lieu({id:'rond', zone:'n', x:1230, y:232, nom:'Rond des Sorcières', ic:'🍄', etiq:[1236,146], emprise:[1230,208,60], dessin:function(){
    var cx = 1230, cy = 208, s = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="50" ry="38" fill="#2f6447" opacity=".55"/>';
    s += '<circle class="ca-vacille" cx="' + cx + '" cy="' + cy + '" r="32" fill="' + G('cyan') + '" opacity=".4"/>';
    for(var i = 0; i < 10; i++){
      var a = i / 10 * Math.PI * 2 + .2, x = cx + Math.cos(a) * 48, y = cy + Math.sin(a) * 34, k = i % 3 === 0 ? 1.25 : 1;
      s += '<rect x="' + f(x - 3 * k) + '" y="' + f(y - 4 * k) + '" width="' + f(6 * k) + '" height="' + f(10 * k) + '" rx="2.5" fill="#f3e7cb"' + st + ' stroke-width="2"/>' +
        '<path d="M' + f(x - 10 * k) + ' ' + f(y - 3 * k) + ' q' + f(10 * k) + ' ' + f(-17 * k) + ' ' + f(20 * k) + ' 0 z" fill="' + (i % 2 ? '#d8433f' : '#c7402f') + '"' + st + ' stroke-width="2.2" stroke-linejoin="round"/>' +
        '<circle cx="' + f(x - 3 * k) + '" cy="' + f(y - 7 * k) + '" r="' + f(1.8 * k) + '" fill="#fff"/><circle cx="' + f(x + 4 * k) + '" cy="' + f(y - 6 * k) + '" r="' + f(1.4 * k) + '" fill="#fff"/>';
    }
    return s;
  }});

  /* 🦇 La grotte aux Échos (dans la falaise du nord) */
  lieu({id:'grotte', zone:'n', x:1652, y:222, nom:'Grotte aux Échos', ic:'🦇', etiq:[1652,258], emprise:[1500,96,1810,232], dessin:function(){
    var s = T.falaise(p, 1512, 1800, 112, 214, 31);
    s += '<path d="M1620 218 v-30 q32 -46 64 0 v30 z" fill="' + M('nuit') + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<path d="M1630 176 l6 14 l6 -14 M1652 164 l6 16 l6 -16 M1668 176 l5 12 l5 -12" fill="' + G('pierre') + '"' + st + ' stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<g class="ca-vacille"><circle cx="1644" cy="200" r="3" fill="#ffd77a"/><circle cx="1657" cy="200" r="3" fill="#ffd77a"/></g>';
    [[1596,150,1],[1712,140,.8],[1688,104,.7]].forEach(function(q){ s += '<path transform="translate(' + q[0] + ' ' + q[1] + ') scale(' + q[2] + ')" d="M-15 0 q5 -8 9 -2 q3 -6 6 -6 q3 0 6 6 q4 -6 9 2 q-6 -1 -8 5 q-3 -5 -7 -1 q-4 -4 -7 1 q-2 -6 -8 -5 z" fill="#1b1424"' + st + ' stroke-width="1.2"/>'; });
    return s;
  }});

  /* 🗿 Le cercle des Cinq Pierres (sur sa colline) */
  lieu({id:'cercle', zone:'o', x:450, y:960, nom:'Cinq Pierres', ic:'🗿', etiq:[450,1002], emprise:[450,892,150], dessin:function(){
    var cx = 450, cy = 896, s = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="84" ry="56" fill="none" stroke="#3f7a45" stroke-width="3" stroke-dasharray="3 12" opacity=".5"/>';
    var pts = [];
    for(var i = 0; i < 5; i++){ var a = -Math.PI / 2 + i * Math.PI * 2 / 5; pts.push([cx + Math.cos(a) * 76, cy + Math.sin(a) * 50 + 14, i]); }
    pts.sort(function(a, b){ return a[1] - b[1]; });
    var dalle = om(cx + 6, cy + 20, 30, 12, .28) + '<ellipse cx="' + cx + '" cy="' + (cy + 14) + '" rx="28" ry="17" fill="' + G('pierre') + '"' + st + ' stroke-width="3"/>' +
      '<circle class="ca-vacille" cx="' + cx + '" cy="' + (cy + 14) + '" r="22" fill="' + G('cyan') + '" opacity=".45"/>' +
      '<path d="M' + (cx - 12) + ' ' + (cy + 14) + ' a12 7 0 1 1 12 7 a7 4 0 1 1 -6 -5" fill="none" stroke="#8ff3ff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>';
    var fait = false;
    pts.forEach(function(q){ if(!fait && q[1] > cy + 14){ s += dalle; fait = true; } s += pierreLevee(q[0], q[1], 24, 50 + (q[2] % 2) * 8, [-4, 5, -7, 3, 6][q[2]], true); });
    if(!fait) s += dalle;
    return s;
  }});

  /* 🍎 Le vieux verger */
  lieu({id:'verger', zone:'o', x:770, y:940, nom:'Vieux verger', ic:'🍎', etiq:[772,836], emprise:[690,852,852,962], dessin:function(){
    var s = '<rect x="694" y="856" width="154" height="102" rx="12" fill="#8cc977" stroke="#8a5f3c" stroke-width="4" stroke-dasharray="14 6"/>';
    var r = O.rng(41);
    [[722,884],[770,880],[818,886],[730,932],[778,930],[822,934]].forEach(function(q, i){
      s += om(q[0] + 6, q[1] + 8, 19, 16, .26) + '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="19.5" fill="' + G('a2') + '"' + st + ' stroke-width="3"/>';
      for(var k = 0; k < 5; k++){ var a = r() * Math.PI * 2, d = r() * 13; s += '<circle cx="' + f(q[0] + Math.cos(a) * d) + '" cy="' + f(q[1] + Math.sin(a) * d) + '" r="3.6" fill="' + G('baie') + '"' + st + ' stroke-width="1.2"/>'; }
    });
    s += '<path d="M750 952 l8 -34 M762 952 l8 -34 M752 943 h12 M754 934 h12 M756 925 h12" stroke="#7a5131" stroke-width="3" stroke-linecap="round"/>';
    return s;
  }});

  /* 🐝 Le rucher */
  lieu({id:'rucher', zone:'o', x:812, y:1200, nom:'Rucher', ic:'🐝', etiq:[820,1246], emprise:[812,1190,62], dessin:function(){
    var s = '', cols = ['#f2c84b','#fff6dc','#9cc8ee','#f2c84b','#f4a3b8'];
    [[768,1196],[792,1182],[816,1176],[840,1182],[862,1196]].forEach(function(q, i){
      s += om(q[0] + 4, q[1] + 12, 11, 4, .28) + '<path d="M' + (q[0] - 7) + ' ' + (q[1] + 12) + ' v-4 M' + (q[0] + 7) + ' ' + (q[1] + 12) + ' v-4" stroke="' + C + '" stroke-width="3"/>' +
        '<rect x="' + (q[0] - 10) + '" y="' + (q[1] - 10) + '" width="20" height="19" rx="2.5" fill="' + cols[i] + '"' + st + ' stroke-width="2.5"/><path d="M' + (q[0] - 10) + ' ' + (q[1] - 1) + ' h20" stroke="' + C + '" stroke-width="1.5" opacity=".5"/>' +
        '<ellipse cx="' + q[0] + '" cy="' + (q[1] + 4) + '" rx="3.5" ry="2" fill="' + C + '"/><path d="M' + (q[0] - 13) + ' ' + (q[1] - 9) + ' l13 -9 l13 9 z" fill="#b4644a"' + st + ' stroke-width="2.5" stroke-linejoin="round"/>';
    });
    var r = O.rng(17);
    for(var i = 0; i < 16; i++){ var x = 760 + r() * 110, y = 1206 + r() * 22; s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(3 + r() * 2) + '" fill="' + ['#cdb6ff','#ff9fc0','#ffe9a8'][i % 3] + '"/>'; }
    [[790,1160],[828,1154],[852,1166],[806,1168]].forEach(function(q, i){ s += '<circle class="ca-flotte" style="animation-delay:-' + (i * .6) + 's" cx="' + q[0] + '" cy="' + q[1] + '" r="2.6" fill="#35281b" stroke="#f5b945" stroke-width="1.6"/>'; });
    return s;
  }});

  /* 🚪 La Porte sans mur (une porte toute seule, sur une colline) */
  lieu({id:'porte', zone:'o', x:256, y:1110, nom:'Porte sans mur', ic:'🚪', etiq:[296,1156], emprise:[256,1088,110], dessin:function(){
    var x = 256, y = 1104, s = om(x + 16, y + 2, 40, 10, .32);
    s += '<ellipse cx="' + x + '" cy="' + (y + 4) + '" rx="40" ry="10" fill="' + G('pierre') + '"' + st + ' stroke-width="2.5"/><ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="31" ry="7" fill="' + G('pierre') + '"' + st + ' stroke-width="2.5"/>';
    s += '<path d="M' + (x - 29) + ' ' + (y - 2) + ' v-52 a29 29 0 0 1 58 0 v52 z" fill="' + G('pierre') + '"' + st + ' stroke-width="3.5"/>';
    s += '<circle class="ca-vacille" cx="' + (x + 12) + '" cy="' + (y - 34) + '" r="34" fill="' + G('cyan') + '" opacity=".55"/>';
    s += '<path d="M' + (x - 19) + ' ' + (y - 2) + ' v-50 a19 19 0 0 1 38 0 v50 z" fill="#dffcff"' + st + ' stroke-width="2.5"/>';
    s += '<path d="M' + (x - 19) + ' ' + (y - 2) + ' v-50 a19 19 0 0 1 19 -19 l10 6 v66 z" fill="#7a4fb0"' + st + ' stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<path d="M' + (x - 9) + ' ' + (y - 60) + ' v56 M' + (x + 1) + ' ' + (y - 64) + ' v60" stroke="' + C + '" stroke-width="1.5" opacity=".4"/><circle cx="' + (x + 5) + '" cy="' + (y - 30) + '" r="3.2" fill="#f5b945"' + st + ' stroke-width="1.5"/>';
    return s;
  }});

  /* 🐸 L'étang aux Nénuphars, son ponton, sa barque */
  lieu({id:'etang', zone:'o', x:430, y:1345, nom:'Étang aux Nénuphars', ic:'🐸', etiq:[420,1404], emprise:[430,1340,180], dessin:function(){
    var s = '', r = O.rng(23);
    for(var i = 0; i < 13; i++){
      var a = r() * Math.PI * 2, d = .15 + r() * .62, x = 430 + Math.cos(a) * 150 * d, y = 1342 + Math.sin(a) * 92 * d, rr = 8 + r() * 5;
      s += '<path d="M' + f(x) + ' ' + f(y) + ' L' + f(x + rr) + ' ' + f(y - 3) + ' A' + f(rr) + ' ' + f(rr * .72) + ' 0 1 1 ' + f(x + rr * .8) + ' ' + f(y + rr * .45) + ' Z" fill="#5aa45f"' + st + ' stroke-width="1.8" stroke-linejoin="round"/>';
      if(i % 3 === 0) s += '<circle cx="' + f(x - 2) + '" cy="' + f(y - 1) + '" r="4" fill="#ff9fc0"' + st + ' stroke-width="1.3"/><circle cx="' + f(x - 2) + '" cy="' + f(y - 1) + '" r="1.5" fill="#ffe9a8"/>';
    }
    s += roseaux(300, 1300, 5, 1) + roseaux(332, 1420, 6, 2) + roseaux(520, 1432, 5, 3) + roseaux(470, 1250, 4, 4);
    /* le ponton et la barque */
    s += '<g transform="translate(566 1304) rotate(24)"><rect x="-44" y="-9" width="62" height="18" rx="3" fill="' + G('bois') + '"' + st + ' stroke-width="2.5"/><path d="M-34 -8 v16 M-24 -8 v16 M-14 -8 v16 M-4 -8 v16 M6 -8 v16" stroke="#5a3a22" stroke-width="1.8" opacity=".5"/></g>';
    s += barque(498, 1318, -18);
    return s;
  }});
  /* 🎣 La cabane du pêcheur */
  lieu({id:'pecheur', zone:'o', x:628, y:1300, nom:'Cabane du pêcheur', ic:'🎣', etiq:[716,1344], emprise:[636,1272,62], dessin:function(){
    var s = batiment(636, 1284, 74, {toit:'chaume', mur:'bois', planches:true, fenetres:[[650, 1278]]});
    s += '<path d="M690 1300 v-34 M716 1300 v-34 M688 1270 h30" stroke="' + C + '" stroke-width="3.5" stroke-linecap="round"/><path d="M692 1272 l6 22 l6 -22 l6 22 l5 -22" stroke="#cfc8da" stroke-width="1.6" fill="none"/>';
    s += '<ellipse cx="596" cy="1306" rx="9" ry="11" fill="' + G('bois') + '"' + st + ' stroke-width="2.5"/><path d="M588 1302 h16 M588 1310 h16" stroke="' + C + '" stroke-width="1.5" opacity=".5"/>';
    return s;
  }});

  /* 🥀 Le vieux cimetière et sa chapelle en ruine */
  lieu({id:'cimetiere', zone:'so', x:310, y:1756, nom:'Vieux cimetière', ic:'🥀', etiq:[318,1790], emprise:[196,1626,428,1764], dessin:function(){
    var x0 = 208, y0 = 1640, w = 208, h = 114, s = '';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="16" fill="#7f9a72"/>';
    s += '<path d="M' + (x0 + 122) + ' ' + y0 + ' H' + (x0 + w - 16) + ' a16 16 0 0 1 16 16 V' + (y0 + h - 16) + ' a16 16 0 0 1 -16 16 H' + (x0 + 16) + ' a16 16 0 0 1 -16 -16 V' + (y0 + 16) + ' a16 16 0 0 1 16 -16 H' + (x0 + 86) + '" fill="none" stroke="' + C + '" stroke-width="11" stroke-linecap="round"/>';
    s += '<path d="M' + (x0 + 122) + ' ' + y0 + ' H' + (x0 + w - 16) + ' a16 16 0 0 1 16 16 V' + (y0 + h - 16) + ' a16 16 0 0 1 -16 16 H' + (x0 + 16) + ' a16 16 0 0 1 -16 -16 V' + (y0 + 16) + ' a16 16 0 0 1 16 -16 H' + (x0 + 86) + '" fill="none" stroke="#b9b2c6" stroke-width="6" stroke-linecap="round" stroke-dasharray="18 3"/>';
    /* la grille entrouverte */
    s += '<path d="M' + (x0 + 86) + ' ' + (y0 + 6) + ' v-22 M' + (x0 + 122) + ' ' + (y0 + 6) + ' v-22" stroke="' + C + '" stroke-width="7" stroke-linecap="round"/><path d="M' + (x0 + 88) + ' ' + (y0 - 4) + ' l14 12 M' + (x0 + 88) + ' ' + (y0 - 12) + ' l14 12" stroke="' + C + '" stroke-width="2.5"/>';
    /* la chapelle sans toit */
    s += om(256, 1716, 34, 8, .3);
    s += '<path d="M226 1712 v-48 l8 -10 l7 12 l10 -22 l9 18 l8 -9 l8 13 v46 z" fill="' + G('pierre') + '"' + st + ' stroke-width="3" stroke-linejoin="round"/>';
    s += '<path d="M246 1712 v-18 a8 8 0 0 1 16 0 v18 z" fill="' + M('nuit') + '"' + st + ' stroke-width="2.2"/><circle cx="254" cy="1672" r="6.5" fill="' + M('nuit') + '"' + st + ' stroke-width="2"/><path d="M254 1666 v13 M248 1672 h13" stroke="#b9b2c6" stroke-width="1.5"/>';
    /* les tombes */
    [[304,1688,0],[330,1684,-6],[356,1690,4],[382,1686,0],[300,1728,5],[328,1732,0],[354,1728,-8],[380,1734,3],[232,1740,-4]].forEach(function(q, i){
      s += om(q[0] + 4, q[1] + 2, 9, 3, .28);
      if(i % 4 === 1) s += '<path transform="rotate(' + q[2] + ' ' + q[0] + ' ' + q[1] + ')" d="M' + q[0] + ' ' + q[1] + ' v-22 M' + (q[0] - 7) + ' ' + (q[1] - 14) + ' h14" stroke="' + C + '" stroke-width="6.5" stroke-linecap="round"/><path transform="rotate(' + q[2] + ' ' + q[0] + ' ' + q[1] + ')" d="M' + q[0] + ' ' + q[1] + ' v-22 M' + (q[0] - 7) + ' ' + (q[1] - 14) + ' h14" stroke="#cfc8da" stroke-width="3" stroke-linecap="round"/>';
      else s += '<path transform="rotate(' + q[2] + ' ' + q[0] + ' ' + q[1] + ')" d="M' + (q[0] - 8) + ' ' + q[1] + ' v-13 a8 8 0 0 1 16 0 v13 z" fill="#cfc8da"' + st + ' stroke-width="2.2"/>';
    });
    s += arbreMort(394, 1672, 1.15) + corbeau(398, 1622, .8) + corbeau(270, 1640, .7);
    return s;
  }});

  /* 🎃 Le champ aux Citrouilles */
  lieu({id:'citrouilles', zone:'so', x:760, y:1700, nom:'Champ aux Citrouilles', ic:'🎃', etiq:[736,1750], emprise:[672,1596,850,1714], dessin:function(){
    var x0 = 682, y0 = 1606, w = 158, h = 98, s = '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="8" fill="' + G('terre') + '"' + st + ' stroke-width="3"/>';
    for(var i = 0; i < 4; i++) s += '<path d="M' + (x0 + 10) + ' ' + (y0 + 16 + i * 22) + ' q20 -8 40 0 t40 0 t40 0 t18 0" fill="none" stroke="#4f8c55" stroke-width="4" stroke-linecap="round"/>';
    var r = O.rng(53);
    for(var k = 0; k < 13; k++){
      var x = x0 + 16 + r() * (w - 32), y = y0 + 16 + r() * (h - 30), g = 7 + r() * 5;
      if(Math.abs(x - 761) < 18 && Math.abs(y - 1652) < 26) continue;
      s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(g) + '" ry="' + f(g * .8) + '" fill="#f08a2c"' + st + ' stroke-width="2"/><path d="M' + f(x) + ' ' + f(y - g * .8) + ' v' + f(g * 1.6) + '" stroke="#b9591a" stroke-width="1.5" opacity=".6"/><path d="M' + f(x) + ' ' + f(y - g * .8) + ' q2 -5 5 -5" stroke="#3f7a45" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    }
    /* l'épouvantail à tête de citrouille */
    s += om(766, 1672, 12, 4, .3) + '<path d="M761 1672 v-40 M743 1646 h36" stroke="#7a5131" stroke-width="5" stroke-linecap="round"/><path d="M747 1646 l-3 10 M775 1646 l3 10" stroke="#c9a06a" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="761" cy="1628" rx="11" ry="9.5" fill="#f08a2c"' + st + ' stroke-width="2"/><path d="M756 1626 l3 -3 l3 3 z M762 1626 l3 -3 l3 3 z M756 1631 q5 4 10 0" fill="' + C + '" stroke="' + C + '" stroke-width="1"/><path d="M749 1620 h24 l-4 -9 h-16 z" fill="#6a4a8c"' + st + ' stroke-width="2"/>';
    s += '<rect x="' + (x0 - 6) + '" y="' + (y0 - 6) + '" width="' + (w + 12) + '" height="' + (h + 12) + '" rx="10" fill="none" stroke="#8a5f3c" stroke-width="4" stroke-dasharray="14 6"/>';
    return s;
  }});

  /* 🗝️ L'Arche du Sud (la route passe dessous, puis se perd dans la brume).
     Elle se tient 32 plus bas que le bout arrondi de la rue des Lanternes : le village est dessiné PAR-DESSUS le monde d'autour (carte.js, deux dessins),
     et le bout de sa rue lui mangeait le haut. */
  lieu({id:'arche', zone:'s', x:1500, y:1844, nom:'Arche du Sud', ic:'🗝️', etiq:[1500,1866], emprise:[1500,1826,70], dessin:function(){
    var x = 1500, y = 1842, s = om(x + 10, y + 4, 62, 9, .3);
    s += '<path d="M' + (x - 58) + ' ' + y + ' v-40 q58 -64 116 0 v40 h-22 v-30 q-36 -40 -72 0 v30 z" fill="' + G('pierre') + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<path d="M' + (x - 58) + ' ' + (y - 18) + ' h22 M' + (x + 36) + ' ' + (y - 18) + ' h22 M' + (x - 30) + ' ' + (y - 60) + ' l8 12 M' + (x + 30) + ' ' + (y - 60) + ' l-8 12 M' + x + ' ' + (y - 72) + ' v13" stroke="' + C + '" stroke-width="1.6" opacity=".4"/>';
    s += '<circle class="ca-vacille" cx="' + x + '" cy="' + (y - 64) + '" r="15" fill="' + G('cyan') + '" opacity=".6"/><path d="M' + (x - 5) + ' ' + (y - 68) + ' l5 -6 l5 6 l-5 8 z" fill="#8ff3ff"' + st + ' stroke-width="1.5"/>';
    s += '<path d="M' + (x - 55) + ' ' + (y - 6) + ' q-12 -22 -2 -36 q10 14 2 36" fill="#4f9a52"' + st + ' stroke-width="1.8"/>';
    /* la borne */
    s += om(x + 84, y + 2, 9, 3, .28) + '<path d="M' + (x + 72) + ' ' + y + ' v-16 a8 8 0 0 1 16 0 v16 z" fill="#f6ead0"' + st + ' stroke-width="2.2"/><path d="M' + (x + 72) + ' ' + (y - 14) + ' h16" stroke="#d8433f" stroke-width="4"/>';
    return s;
  }});

  /* ✨ Le marais des Feux Follets : la passerelle, la barque échouée, les arbres morts */
  lieu({id:'marais', zone:'se', x:2480, y:1500, nom:'Marais des Feux Follets', ic:'✨', etiq:[2330,1812], emprise:null, dessin:function(){
    var pts = [[2270,1498],[2350,1548],[2440,1592],[2540,1622],[2640,1640],[2730,1628]], d = O.lisse(pts), s = '';
    s += '<path d="' + d + '" transform="translate(5 7)" fill="none" stroke="#0b1a10" stroke-width="22" stroke-linecap="round" opacity=".25"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + C + '" stroke-width="24" stroke-linecap="butt"/><path d="' + d + '" fill="none" stroke="#a9794c" stroke-width="18" stroke-linecap="butt"/><path d="' + d + '" fill="none" stroke="#5a3a22" stroke-width="18" stroke-dasharray="2 11" opacity=".55"/>';
    s += barque(2372, 1716, 28, '#7d6a5a') + '<path d="M2356 1708 l30 18" stroke="#3f5f3a" stroke-width="3" opacity=".6"/>';
    s += roseaux(2298, 1630, 6, 31) + roseaux(2470, 1730, 6, 32) + roseaux(2700, 1740, 6, 33) + roseaux(2180, 1690, 5, 34) + roseaux(2600, 1830, 6, 35) + roseaux(2800, 1620, 5, 36);
    return s;
  }});
  lieu({id:'marais-arbres', zone:'se', x:2480, y:1790, dessin:function(){
    var s = arbreMort(2238, 1640, 1.2) + arbreMort(2520, 1716, 1.35) + arbreMort(2800, 1760, 1.1) + arbreMort(2390, 1838, 1) + arbreMort(2150, 1790, .9);
    [[2300,1596],[2452,1668],[2610,1560],[2740,1700],[2540,1790],[2200,1740],[2680,1600],[2400,1770]].forEach(function(q, i){ s += follet(q[0], q[1], i); });
    return s;
  }});
  /* 🏛️ Les Colonnes noyées (de vieilles pierres qui sortent de l'eau) */
  lieu({id:'colonnes', zone:'se', x:2560, y:1580, nom:'Colonnes noyées', ic:'🏛️', etiq:[2580,1484], emprise:null, dessin:function(){
    var s = '';
    [[2500,1548,13],[2540,1538,15],[2582,1546,13],[2520,1576,12],[2566,1572,14]].forEach(function(q, i){
      s += '<ellipse cx="' + q[0] + '" cy="' + (q[1] + 8) + '" rx="' + (q[2] + 9) + '" ry="7" fill="none" stroke="#d8f0e6" stroke-width="2" opacity=".5"/>';
      s += '<path d="M' + (q[0] - q[2]) + ' ' + (q[1] + 6) + ' v-' + (16 + i % 3 * 7) + ' a' + q[2] + ' 5 0 0 1 ' + (q[2] * 2) + ' 0 v' + (16 + i % 3 * 7) + ' a' + q[2] + ' 5 0 0 1 -' + (q[2] * 2) + ' 0 z" fill="' + G('pierre') + '"' + st + ' stroke-width="2.8"/>';
      s += '<ellipse cx="' + q[0] + '" cy="' + (q[1] - 10 - i % 3 * 7) + '" rx="' + q[2] + '" ry="5" fill="#e4deee"' + st + ' stroke-width="2.2"/>';
    });
    s += '<g transform="translate(2606 1578) rotate(-18)"><rect x="-22" y="-9" width="44" height="18" rx="8" fill="' + G('pierre') + '"' + st + ' stroke-width="2.8"/><path d="M-8 -8 v16 M6 -8 v16" stroke="' + C + '" stroke-width="1.5" opacity=".4"/></g>';
    s += '<path class="ca-vacille" d="M2540 1532 l0 -9 M2534 1528 l6 5 l6 -5" stroke="#8ff3ff" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    return s;
  }});

  /* 🐑 La bergerie */
  lieu({id:'bergerie', zone:'e', x:2180, y:1216, nom:'Bergerie', ic:'🐑', etiq:[2172,1270], emprise:[2068,1142,2452,1262], dessin:function(){
    var s = batiment(2122, 1200, 88, {toit:'terre'});
    s += batiment(2222, 1196, 104, {toit:'prune', mur:'bois', planches:true, grandePorte:true, fenetres:[], cheminee:false, toitH:60});
    /* le pré des moutons */
    s += '<rect x="2290" y="1148" width="150" height="104" rx="12" fill="#9ad67c" stroke="#8a5f3c" stroke-width="4" stroke-dasharray="14 6"/>';
    [[2316,1176,1],[2352,1166,-1],[2392,1184,1],[2330,1214,-1],[2372,1222,1],[2414,1214,-1],[2410,1168,1]].forEach(function(q, i){
      s += '<g transform="translate(' + q[0] + ' ' + q[1] + ') scale(' + q[2] + ' 1)">' + '<ellipse cx="2" cy="7" rx="12" ry="4" fill="#0b1a10" opacity=".22"/>' +
        '<ellipse cx="0" cy="0" rx="12" ry="8.5" fill="#fbf7ee"' + st + ' stroke-width="2.2"/><circle cx="-5" cy="-5" r="4.5" fill="#fbf7ee"/><circle cx="3" cy="-6" r="4.5" fill="#fbf7ee"/><circle cx="11" cy="-3" r="5" fill="#3a3348"' + st + ' stroke-width="1.5"/></g>';
    });
    s += meule(2074, 1236, 1) + meule(2100, 1248, .8);
    return s;
  }});

  /* 🎪 Le pré aux Roulottes */
  lieu({id:'roulottes', zone:'e', x:2430, y:960, nom:'Pré aux Roulottes', ic:'🎪', etiq:[2452,850], emprise:[2430,922,98], dessin:function(){
    function roulotte(x, y, c1, c2, rot){
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')">' + '<ellipse cx="4" cy="20" rx="34" ry="6" fill="#0b1a10" opacity=".28"/>' +
        '<circle cx="-18" cy="15" r="9" fill="#7a5131"' + st + ' stroke-width="2.5"/><circle cx="18" cy="15" r="9" fill="#7a5131"' + st + ' stroke-width="2.5"/><circle cx="-18" cy="15" r="2.5" fill="#f5b945"/><circle cx="18" cy="15" r="2.5" fill="#f5b945"/>' +
        '<rect x="-30" y="-16" width="60" height="30" rx="5" fill="' + c1 + '"' + st + ' stroke-width="3"/>' +
        '<path d="M-34 -14 q34 -26 68 0 z" fill="' + c2 + '"' + st + ' stroke-width="3" stroke-linejoin="round"/>' +
        '<rect x="-8" y="-9" width="16" height="13" rx="6" fill="#ffd77a"' + st + ' stroke-width="2"/><path d="M-30 5 h60" stroke="#f5b945" stroke-width="3"/>' +
        '<path d="M30 6 h10 M30 12 h14" stroke="' + C + '" stroke-width="3" stroke-linecap="round"/></g>';
    }
    var s = roulotte(2372, 902, '#d8433f', '#f5b945', -6) + roulotte(2478, 892, '#4b84e6', '#f6ead0', 5);
    /* le feu de camp */
    s += '<circle class="ca-vacille" cx="2428" cy="940" r="34" fill="' + G('lueur') + '" opacity=".75"/>';
    for(var i = 0; i < 7; i++){ var a = i / 7 * Math.PI * 2; s += '<ellipse cx="' + f(2428 + Math.cos(a) * 16) + '" cy="' + f(942 + Math.sin(a) * 11) + '" rx="5" ry="4" fill="' + G('pierre') + '"' + st + ' stroke-width="1.8"/>'; }
    s += '<path d="M2418 946 l20 -8 M2418 938 l20 8" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/><path d="M2418 946 l20 -8 M2418 938 l20 8" stroke="#7a5131" stroke-width="3" stroke-linecap="round"/>';
    s += '<path class="ca-vacille" d="M2420 940 q-3 -16 8 -26 q-1 10 6 13 q2 -6 0 -10 q9 9 3 23 z" fill="#ff9a2e"' + st + ' stroke-width="1.8" stroke-linejoin="round"/><path d="M2424 940 q0 -8 5 -12 q1 5 4 7 q2 3 0 5 z" fill="#ffe27a"/>';
    s += roulotte(2440, 990, '#5aa45f', '#c07aa2', 2);
    /* les fanions */
    s += '<path d="M2398 874 Q2428 892 2456 866" fill="none" stroke="' + C + '" stroke-width="1.8"/>';
    [[2408,880,'#f5b945'],[2420,884,'#ff9fc0'],[2432,883,'#8ff3ff'],[2444,877,'#9d6ee3']].forEach(function(q){ s += '<path d="M' + (q[0] - 5) + ' ' + q[1] + ' h10 l-5 10 z" fill="' + q[2] + '"' + st + ' stroke-width="1.5" stroke-linejoin="round"/>'; });
    return s;
  }});

  /* 🔭 L'observatoire (sur sa colline) */
  lieu({id:'observatoire', zone:'e', x:2700, y:1270, nom:'Observatoire', ic:'🔭', etiq:[2700,1318], emprise:[2700,1258,120], dessin:function(){
    var x = 2700, y = 1268, s = om(x + 12, y + 2, 46, 12, .32);
    s += '<rect x="' + (x - 36) + '" y="' + (y - 38) + '" width="72" height="40" rx="4" fill="' + G('pierre') + '"' + st + ' stroke-width="3.5"/>';
    s += '<path d="M' + (x - 36) + ' ' + (y - 20) + ' h72 M' + (x - 14) + ' ' + (y - 38) + ' v18 M' + (x + 16) + ' ' + (y - 20) + ' v22" stroke="' + C + '" stroke-width="1.5" opacity=".3"/>';
    s += '<path d="M' + (x - 8) + ' ' + (y + 2) + ' v-16 a8 8 0 0 1 16 0 v16 z" fill="#6f4529"' + st + ' stroke-width="2.5"/>';
    s += '<path d="M' + (x - 42) + ' ' + (y - 36) + ' a42 40 0 0 1 84 0 z" fill="' + G('t-ardoise') + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<path d="M' + (x - 4) + ' ' + (y - 36) + ' L' + (x + 8) + ' ' + (y - 75) + ' L' + (x + 24) + ' ' + (y - 68) + ' L' + (x + 14) + ' ' + (y - 36) + ' z" fill="' + M('nuit') + '"' + st + ' stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<g transform="translate(' + (x + 12) + ' ' + (y - 58) + ') rotate(-52)"><rect x="-4" y="-7" width="46" height="14" rx="4" fill="#d9a441"' + st + ' stroke-width="2.5"/><rect x="34" y="-9.5" width="12" height="19" rx="4" fill="#f2c84b"' + st + ' stroke-width="2.5"/><path d="M8 -6 v12 M20 -6 v12" stroke="' + C + '" stroke-width="1.5" opacity=".5"/></g>';
    s += '<path d="M' + (x - 30) + ' ' + (y - 54) + ' q10 -12 22 -16" fill="none" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>';
    [[x - 64, y - 70], [x + 70, y - 96], [x + 58, y - 30]].forEach(function(q, i){ s += '<path class="ca-vacille" style="animation-delay:-' + i + 's" d="M' + q[0] + ' ' + (q[1] - 7) + ' l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#fff3c4"' + st + ' stroke-width="1"/>'; });
    return s;
  }});

  /* 🦴 Les Os du Géant (dans une clairière du bois) */
  lieu({id:'os', zone:'e', dx:-56, x:2704, y:850, nom:'Os du Géant', ic:'🦴', etiq:[2706,900], emprise:[2704,812,92], dessin:function(){
    var s = '', x = 2700, y = 822;
    s += '<path d="M' + x + ' ' + y + ' q60 -14 128 4" fill="none" stroke="' + C + '" stroke-width="13" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' q60 -14 128 4" fill="none" stroke="#f3ead6" stroke-width="8" stroke-linecap="round"/>';
    for(var i = 0; i < 6; i++){
      var bx = x + 10 + i * 21, by = y - 3 + (i < 3 ? -i : i - 5) * 1.2, h = 44 - Math.abs(i - 2.5) * 5;
      var d = 'M' + bx + ' ' + f(by) + ' q-16 ' + f(-h * .6) + ' 2 ' + f(-h) + ' M' + bx + ' ' + f(by) + ' q-14 ' + f(h * .55) + ' 4 ' + f(h * .9);
      s += '<path d="' + d + '" fill="none" stroke="' + C + '" stroke-width="10" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#f3ead6" stroke-width="5.5" stroke-linecap="round"/>';
    }
    /* le crâne à demi enterré */
    s += om(2706, 838, 34, 9, .28);
    s += '<path d="M2664 828 q-8 -40 30 -44 q34 -2 36 30 q0 14 -14 16 l-4 10 h-30 l-4 -10 q-10 -1 -10 -2 z" fill="' + M('os') + '"' + st + ' stroke-width="3.2" stroke-linejoin="round"/>';
    s += '<ellipse cx="2684" cy="808" rx="9" ry="10" fill="' + M('nuit') + '"' + st + ' stroke-width="2"/><ellipse cx="2710" cy="808" rx="8" ry="9" fill="' + M('nuit') + '"' + st + ' stroke-width="2"/><path d="M2694 822 l4 -8 l4 8 z" fill="' + M('nuit') + '"/><path d="M2684 832 v8 M2692 832 v8 M2700 832 v8 M2708 832 v8" stroke="' + C + '" stroke-width="1.8"/>';
    s += '<path d="M2668 800 q6 -10 14 -10" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>';
    s += '<path d="' + O.tache(2800, 846, 20, 9, 7, 8, .3) + '" fill="#4f9a52" opacity=".8"/>';
    return s;
  }});

  /* ⛵ Le lac Dormant : la falaise, la cascade, le ponton */
  lieu({id:'falaise', zone:'ne', x:2360, y:214, dessin:function(){
    var s = T.falaise(p, 2086, 2650, 108, 226, 47);
    /* quelque chose de sombre derrière l'eau de la cascade… */
    s += '<path d="M2380 226 v-58 q42 -52 84 0 v58 z" fill="' + M('nuit') + '"' + st + ' stroke-width="3"/>';
    s += '<rect x="2398" y="118" width="48" height="114" rx="10" fill="#bfe6fb" stroke="#2a4a6a" stroke-width="3" opacity=".8"/>';
    s += '<path class="ca-flot" d="M2408 126 v102 M2422 122 v108 M2436 126 v102" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 16" stroke-linecap="round" opacity=".9"/>';
    [[2404,236],[2422,242],[2440,236]].forEach(function(q, i){ s += '<circle class="ca-onde' + (i % 2 ? ' ca-onde2' : '') + '" cx="' + q[0] + '" cy="' + q[1] + '" r="11" fill="none" stroke="#ffffff" stroke-width="3"/>'; });
    s += '<ellipse cx="2422" cy="236" rx="34" ry="9" fill="#ffffff" opacity=".7"/>';
    return s;
  }});
  lieu({id:'cascade', zone:'ne', x:2422, y:120, nom:'Cascade du Voile', ic:'🌈', etiq:[2580,262], emprise:[2086,96,2660,232], dessin:function(){ return ''; }});
  lieu({id:'lac', zone:'ne', x:2300, y:520, nom:'Lac Dormant', ic:'⛵', etiq:[2224,306], emprise:null, dessin:function(){
    var s = '<rect x="2291" y="470" width="20" height="56" rx="3" fill="' + G('bois') + '"' + st + ' stroke-width="2.5"/><path d="M2292 480 h18 M2292 490 h18 M2292 500 h18 M2292 510 h18" stroke="#5a3a22" stroke-width="1.8" opacity=".5"/>';
    s += barque(2338, 462, -12, '#d8433f') + roseaux(2190, 470, 5, 61) + roseaux(2470, 492, 5, 62) + roseaux(2110, 400, 4, 63);
    return s;
  }});
  /* 🏝️ L'Îlot et son petit temple rond */
  lieu({id:'ilot', zone:'ne', x:2400, y:372, nom:'Îlot', ic:'🏝️', etiq:[2362,426], emprise:null, dessin:function(){
    var x = 2400, y = 352, s = '<path d="' + O.tache(x, y, 62, 40, 9, 10, .12) + '" fill="#e3d3ad" stroke="#2a4a6a" stroke-width="3"/><path d="' + O.tache(x, y - 2, 50, 30, 10, 10, .12) + '" fill="#8cc977" stroke="#3f7a45" stroke-width="2"/>';
    var cols = [];
    for(var i = 0; i < 6; i++){ var a = i / 6 * Math.PI * 2 + .3; cols.push([x - 6 + Math.cos(a) * 24, y + Math.sin(a) * 15]); }
    cols.sort(function(a, b){ return a[1] - b[1]; });
    s += '<ellipse cx="' + (x - 6) + '" cy="' + y + '" rx="30" ry="19" fill="#d9d2e4"' + st + ' stroke-width="2.2"/>';
    s += '<circle class="ca-vacille" cx="' + (x - 6) + '" cy="' + (y - 2) + '" r="14" fill="' + G('cyan') + '" opacity=".7"/><circle cx="' + (x - 6) + '" cy="' + (y - 1) + '" r="4" fill="#dffcff"' + st + ' stroke-width="1.5"/>';
    cols.forEach(function(q, i){ var h = i === 1 ? 9 : 18; s += '<rect x="' + f(q[0] - 4.5) + '" y="' + f(q[1] - h) + '" width="9" height="' + h + '" rx="2" fill="' + G('pierre') + '"' + st + ' stroke-width="2"/><ellipse cx="' + f(q[0]) + '" cy="' + f(q[1] - h) + '" rx="5.5" ry="2.6" fill="#e4deee"' + st + ' stroke-width="1.5"/>'; });
    s += om(x + 40, y + 6, 14, 5, .25) + '<circle cx="' + (x + 36) + '" cy="' + (y - 6) + '" r="15" fill="' + G('a1') + '"' + st + ' stroke-width="2.5"/>';
    return s;
  }});

  /* 🏚️ Le manoir aux Volets clos */
  lieu({id:'manoir', zone:'ne', dx:-40, x:2650, y:640, nom:'Manoir aux Volets clos', ic:'🏚️', etiq:[2650,454], emprise:[2550,486,2756,676], dessin:function(){
    var x = 2690, top = 520, s = '';
    /* le parc, sa grille, ses buissons fous */
    s += '<rect x="2598" y="500" width="190" height="166" rx="14" fill="#7fa870" opacity=".75"/>';
    s += '<path d="M2674 666 H2612 a14 14 0 0 1 -14 -14 V514 a14 14 0 0 1 14 -14 H2774 a14 14 0 0 1 14 14 V652 a14 14 0 0 1 -14 14 H2708" fill="none" stroke="' + C + '" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>';
    s += '<path d="M2674 668 v-18 M2708 668 v-18" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/>';
    [[2620,640,13],[2764,636,15],[2616,534,12],[2770,540,11]].forEach(function(q){ s += '<path d="' + O.tache(q[0], q[1], q[2], q[2] * .8, q[0], 8, .25) + '" fill="#2f6b3c"' + st + ' stroke-width="2.5"/>'; });
    /* les deux tours */
    [-74, 74].forEach(function(dx){
      s += '<rect x="' + (x + dx - 17) + '" y="' + (top + 20) + '" width="34" height="98" rx="3" fill="' + G('pierre') + '"' + st + ' stroke-width="3"/>';
      s += '<rect x="' + (x + dx - 6) + '" y="' + (top + 62) + '" width="12" height="16" rx="6" fill="#4a3b55"' + st + ' stroke-width="2"/>';
      s += '<path d="M' + (x + dx - 23) + ' ' + (top + 24) + ' L' + (x + dx) + ' ' + (top - 34) + ' L' + (x + dx + 23) + ' ' + (top + 24) + ' Z" fill="' + G('t-ardoise') + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    });
    s += '<rect x="' + (x - 60 + 9) + '" y="' + (top + 22) + '" width="120" height="104" rx="8" fill="#0b1a10" opacity=".3"/>';
    s += '<rect x="' + (x - 58) + '" y="' + (top + 66) + '" width="116" height="52" rx="3" fill="' + G('pierre') + '"' + st + ' stroke-width="3"/>';
    [[-46,76],[-22,76],[22,76],[46,76]].forEach(function(q, i){
      var fx = x + q[0] - 8, fy = top + q[1];
      if(i === 3){ s += '<circle class="ca-vacille" cx="' + (fx + 8) + '" cy="' + (fy + 9) + '" r="20" fill="' + G('lueur') + '" opacity=".8"/><rect x="' + fx + '" y="' + fy + '" width="16" height="18" rx="2" fill="#ffd77a"' + st + ' stroke-width="2"/>'; }
      else s += '<rect x="' + fx + '" y="' + fy + '" width="16" height="18" rx="2" fill="#4a3b55"' + st + ' stroke-width="2"/><path d="M' + (fx + 8) + ' ' + fy + ' v18 M' + (fx + 2) + ' ' + (fy + 6) + ' h12 M' + (fx + 2) + ' ' + (fy + 12) + ' h12" stroke="' + C + '" stroke-width="1.2" opacity=".7"/>';
    });
    s += '<path d="M' + (x - 10) + ' ' + (top + 118) + ' v-22 a10 10 0 0 1 20 0 v22 z" fill="#3a2a44"' + st + ' stroke-width="2.5"/><rect x="' + (x - 20) + '" y="' + (top + 118) + '" width="40" height="7" rx="2" fill="#cfc8da"' + st + ' stroke-width="2"/>';
    s += '<path d="M' + (x - 68) + ' ' + (top + 70) + ' L' + (x - 50) + ' ' + (top + 6) + ' L' + (x + 50) + ' ' + (top + 6) + ' L' + (x + 68) + ' ' + (top + 70) + ' Z" fill="' + G('t-prune') + '"' + st + ' stroke-width="3.5" stroke-linejoin="round"/>';
    s += '<path d="M' + (x - 58) + ' ' + (top + 28) + ' h116 M' + (x - 63) + ' ' + (top + 50) + ' h126" stroke="#000" stroke-width="2" opacity=".16"/>';
    s += '<path d="' + O.tache(x - 18, top + 34, 11, 8, 3, 7, .3) + '" fill="#2c2440"' + st + ' stroke-width="2"/>';
    s += '<rect x="' + (x + 22) + '" y="' + (top - 6) + '" width="14" height="24" rx="2" fill="#8f88a6"' + st + ' stroke-width="2.5"/>';
    s += corbeau(x - 72, top - 40, .9) + corbeau(x + 30, top - 12, .7);
    return s;
  }});

  /* 🌀 Le labyrinthe de buis (un vrai labyrinthe : un seul chemin mène au milieu) */
  lieu({id:'labyrinthe', zone:'ne', x:2440, y:745, nom:'Labyrinthe', ic:'🌀', etiq:[2236,646], emprise:[2330,574,2550,756], dessin:function(){
    var nx = 8, ny = 6, c = 25, x0 = 2340, y0 = 590, r = O.rng(88);
    var vus = [], murV = [], murH = [];   /* murV[y][x] : le mur à droite de la case ; murH[y][x] : le mur sous la case */
    for(var y = 0; y < ny; y++){ vus.push([]); murV.push([]); murH.push([]); for(var x = 0; x < nx; x++){ vus[y].push(false); murV[y].push(true); murH[y].push(true); } }
    (function creuser(x, y){
      vus[y][x] = true;
      var d = [[1,0],[-1,0],[0,1],[0,-1]].sort(function(){ return r() - .5; });
      d.forEach(function(q){ var X = x + q[0], Y = y + q[1]; if(X < 0 || Y < 0 || X >= nx || Y >= ny || vus[Y][X]) return;
        if(q[0] === 1) murV[y][x] = false; else if(q[0] === -1) murV[Y][X] = false; else if(q[1] === 1) murH[y][x] = false; else murH[Y][X] = false;
        creuser(X, Y); });
    })(3, 5);
    var d = 'M' + x0 + ' ' + y0 + ' h' + (nx * c) + ' v' + (ny * c) + ' h-' + (4 * c) + ' M' + (x0 + 3 * c) + ' ' + (y0 + ny * c) + ' h-' + (3 * c) + ' v-' + (ny * c);
    for(var yy = 0; yy < ny; yy++) for(var xx = 0; xx < nx; xx++){
      if(xx < nx - 1 && murV[yy][xx]) d += ' M' + (x0 + (xx + 1) * c) + ' ' + (y0 + yy * c) + ' v' + c;
      if(yy < ny - 1 && murH[yy][xx]) d += ' M' + (x0 + xx * c) + ' ' + (y0 + (yy + 1) * c) + ' h' + c;
    }
    var s = '<rect x="' + (x0 + 6) + '" y="' + (y0 + 8) + '" width="' + (nx * c) + '" height="' + (ny * c) + '" rx="6" fill="#0b1a10" opacity=".28"/>';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (nx * c) + '" height="' + (ny * c) + '" fill="#d9e8b0"/>';
    s += '<circle class="ca-vacille" cx="' + (x0 + 4.5 * c) + '" cy="' + (y0 + 2.5 * c) + '" r="13" fill="' + G('cyan') + '" opacity=".8"/><circle cx="' + (x0 + 4.5 * c) + '" cy="' + (y0 + 2.5 * c) + '" r="5" fill="' + G('pierre') + '"' + st + ' stroke-width="1.8"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + C + '" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#3f8a4c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#7cc977" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 9" opacity=".7"/>';
    return s;
  }});

  /* ---------- les petites choses curieuses, sans nom ---------- */
  var curieux = [];
  function chose(zone, y, svg){ curieux.push({zone: zone, y: y, svg: svg}); }
  /* les pierres gravées : la même rune, à quatre endroits */
  [[618,972,'o'],[2060,812,'e'],[1560,1806,'s'],[884,236,'no']].forEach(function(q, i){ chose(q[2], q[1], pierreLevee(q[0], q[1], 16, 30, [5, -6, 4, -3][i], true)); });
  /* les poteaux indicateurs */
  [[944,1040,'o'],[2166,1040,'e'],[2626,1072,'e'],[812,1548,'so'],[516,812,'o'],[2470,812,'e']].forEach(function(q){ chose(q[2], q[1], poteau(q[0], q[1])); });
  /* les vieilles lanternes éteintes de la route de l'Est */
  [[2076,1040],[2246,1066],[2400,1010],[2556,1088],[2716,1056],[2866,1088]].forEach(function(q){ chose('e', q[1], lanterneEteinte(q[0], q[1])); });
  /* une charrette cassée au bord de la route */
  chose('e', 1132, '<g transform="translate(2562 1124) rotate(-14)"><ellipse cx="4" cy="14" rx="30" ry="6" fill="#0b1a10" opacity=".28"/><rect x="-26" y="-10" width="52" height="20" rx="3" fill="' + G('bois') + '"' + st + ' stroke-width="2.5"/><path d="M-14 -9 v18 M0 -9 v18 M14 -9 v18" stroke="#5a3a22" stroke-width="1.8" opacity=".5"/><circle cx="-18" cy="12" r="9" fill="none" stroke="' + C + '" stroke-width="5"/><circle cx="-18" cy="12" r="9" fill="none" stroke="#7a5131" stroke-width="2.5"/></g><circle cx="2606" cy="1140" r="9" fill="none" stroke="' + C + '" stroke-width="5"/><circle cx="2606" cy="1140" r="9" fill="none" stroke="#7a5131" stroke-width="2.5"/>');
  /* des meules et des rochers */
  [[2372,1408,1],[2404,1416,.8],[1330,1872,.9],[1700,1870,1]].forEach(function(q){ chose(q[0] > 2000 ? 'e' : 's', q[1], meule(q[0], q[1], q[2])); });
  [[560,812,20,'o'],[322,1168,16,'o'],[900,1668,18,'so'],[2110,1368,17,'e'],[2800,1176,20,'e'],[2240,640,18,'ne'],[620,1730,14,'so']].forEach(function(q, i){ chose(q[3], q[1] + 8, T.rocher(p, q[0], q[1], q[2], 200 + i)); });
  /* une épée plantée dans une pierre, au bord de l'étang… */
  chose('o', 1240, T.rocher(p, 566, 1228, 16, 301) + '<path d="M566 1222 v-30" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/><path d="M566 1222 v-30" stroke="#dfe6f2" stroke-width="3" stroke-linecap="round"/><path d="M558 1194 h16" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/><path d="M558 1194 h16" stroke="#f5b945" stroke-width="3" stroke-linecap="round"/><circle cx="566" cy="1186" r="3.5" fill="#f5b945"' + st + ' stroke-width="1.5"/>');
  /* un vieux puits oublié dans le Bois Sombre */
  chose('no', 476, '<g transform="translate(-118 8)">' + om(566, 470, 24, 9, .3) + '<circle cx="560" cy="456" r="21" fill="' + G('pierre') + '"' + st + ' stroke-width="3"/><circle cx="560" cy="456" r="13" fill="#10202f"' + st + ' stroke-width="2.2"/><circle class="ca-vacille" cx="560" cy="456" r="9" fill="' + G('cyan') + '" opacity=".55"/></g>');

  return {lieux: L, curieux: curieux};
};
})();
