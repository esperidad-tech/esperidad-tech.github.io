/* pub.js — LA PUB DE 30 SECONDES (Romain, 16 novembre : « une cinématique de présentation du jeu […] bien rythmée, bien fun, vendeuse »).
   PUB.image(t) met l'image du temps t (en secondes) dans la page ; filmer-pub.py la photographie 30 fois par seconde.
   Tout est calé sur la musique : 120 à la minute, UN TEMPS = 0,5 s, les coupes tombent sur les temps.
     0 → 4 s    quatre joueurs autour d'une table, quatre écrans ; la caméra plonge dans la tablette
     4 → 6      le titre, sur la carte du village
     6 → 8      les quatre héros
     8 → 10     l'enquête (le labo, la carte)
     10 → 14    les mini-jeux (le gâteau qui pousse, se cacher), les potions
     14 → 18    quatre extraits des cinématiques
     18 → 22    le donjon (l'homme en cape, Bourbe)
     22 → 24    huit images en rafale
     24 → 26    on ressort de la tablette : la table, tout le monde lève les bras
     26 → fin   le titre
   Les extraits du jeu sont de vraies images du jeu (capturer.py), rangées dans plans/<nom>/0000.jpg… */
(function(){
'use strict';
var W = 1440, H = 616, T = 29.8;
var DOSSIER = (new URLSearchParams(location.search).get('plans') || 'plans') + '/';
function cl(x, a, b){ return Math.max(a, Math.min(b, x)); }
function lerp(a, b, k){ return a + (b - a) * k; }
function k01(t, a, b){ return cl((t - a) / (b - a), 0, 1); }
function r(x){ return Math.round(x * 100) / 100; }
var E = {
  io:function(k){ return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; },
  o:function(k){ return 1 - Math.pow(1 - k, 3); }, i:function(k){ return k * k * k; },
  rebond:function(k){ var c = 2.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  expo:function(k){ return k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, 10 * (k - 1)); }
};
function hasard(g){ var x = Math.sin(g * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
var NUIT = '#0b1030', OR = '#ffd84a', OR2 = '#f2b63a';
var ROLES = [['Pisteur', '#7bd88a'], ['Alchimiste', '#b99af7'], ['Barde', '#f49ab8'], ['Sage', '#7cbcff']];

/* ------------------------------------------------------------------ les images (on attend qu'elles soient là avant la photo) */
var attente = [], cache = {};
function src(nom, i){ return DOSSIER + nom + '/' + ('000' + (i || 0)).slice(-4) + '.jpg'; }
function poser(img, url){
  if(img.getAttribute('data-u') === url) return;
  img.setAttribute('data-u', url);
  attente.push(new Promise(function(ok){ img.onload = function(){ (img.decode ? img.decode() : Promise.resolve()).then(ok, ok); }; img.onerror = function(){ console.error('image absente', url); ok(); }; img.src = url; }));
}

/* ------------------------------------------------------------------ LES PLANS PLEIN CADRE
   [début, fin, nom, {n : nombre d'images (film), d : première image, pas : secondes par image (image par image), img : une image fixe,
     kb : [zoom, x, y au début, zoom, x, y à la fin], o : le point autour duquel on zoome, pos : le cadrage, sombre, entree}] */
var PLANS = [
  [4.0, 6.0, 'carte', {kb:[1.34, -50, -30, 1.14, 30, 10], sombre:.52, flou:3.5, entree:'flash'}],
  [8.0, 9.0, 'labo', {kb:[1.0, 0, 0, 1.13, -40, 14], entree:'balai'}],
  [9.0, 10.0, 'carte', {kb:[1.85, 120, -60, 2.05, 90, -30], entree:'pousse'}],
  [10.0, 12.0, 'gateau', {n:16, pas:.125, kb:[1.45, 0, 0, 1.8, 0, 0], o:'50% 80%', entree:'balai'}],
  [12.0, 13.0, 'cachette', {n:42, kb:[1.08, 0, 0, 1.0, 0, 0], entree:'pousse'}],
  [13.0, 14.0, 'etabli', {kb:[1.16, 50, 0, 1.0, 0, 0], entree:'pousse'}],
  [14.0, 15.0, 'cine-marche', {n:40, entree:'flash'}],
  [15.0, 16.0, 'cine-allumette', {n:40, entree:'coupe'}],
  [16.0, 17.0, 'cine-fumee', {n:40, entree:'coupe'}],
  [17.0, 18.0, 'cine-cape', {n:40, kb:[1.0, 0, 0, 1.12, 0, 0], entree:'coupe'}],
  [18.0, 20.5, 'cape', {n:90, d:14, entree:'flash', kb:[1.1, 0, 0, 1.0, 0, 0]}],
  [20.5, 22.0, 'bourbe', {n:42, kb:[1.02, 20, 0, 1.14, -70, 0], entree:'pousse'}],
  /* la rafale : des images d'un quart de seconde, sous quatre mots (les énigmes, les combats, les fous rires, ensemble) */
  [22.0, 22.25, 'labo', {entree:'flash', kb:[1.5, 120, 60, 1.6, 120, 60]}],
  [22.25, 22.5, 'pistage', {entree:'coupe', kb:[1.1, 0, 0, 1.18, 0, 0]}],
  [22.5, 22.75, 'cape', {img:52, entree:'coupe', kb:[1.25, -160, 0, 1.32, -160, 0]}],
  [22.75, 23.0, 'bourbe', {img:20, entree:'coupe', kb:[1.3, -200, 0, 1.38, -200, 0]}],
  [23.0, 23.25, 'gateau', {img:15, entree:'coupe', kb:[1.7, 0, 0, 1.8, 0, 0], o:'50% 80%'}],
  [23.25, 23.5, 'visee', {entree:'coupe', kb:[1.25, 0, 0, 1.32, 0, 0]}],
  [23.5, 24.0, 'accueil', {entree:'coupe', pos:'50% 86%', kb:[1.5, 0, -40, 1.34, 0, -20]}]
];
function etatPlan(p, t){
  var o = p[3], kk = k01(t, p[0], p[1]), kb = o.kb || [1, 0, 0, 1, 0, 0], i = 0;
  if(o.img != null) i = o.img;
  else if(o.pas) i = Math.min(o.n - 1, Math.floor((t - p[0]) / o.pas));
  else if(o.n) i = Math.min(o.n - 1, (o.d || 0) + Math.floor((t - p[0]) * 30));
  var coup = 1 + .07 * (1 - E.o(k01(t, p[0], p[0] + .22)));                     /* chaque plan arrive avec un petit coup de zoom */
  return {flou:o.flou || 0, url:src(p[2], i), s:lerp(kb[0], kb[3], kk) * coup, x:lerp(kb[1], kb[4], kk), y:lerp(kb[2], kb[5], kk), o:o.o || '50% 50%', pos:o.pos || '50% 50%', sombre:o.sombre || 0};
}
function mettrePlan(el, e, tx, clip){
  var img = el.firstChild; poser(img, e.url);
  el.style.display = ''; el.style.transform = tx ? 'translateX(' + r(tx) + 'px)' : ''; el.style.clipPath = clip || '';
  img.style.transformOrigin = e.o; img.style.objectPosition = e.pos;
  img.style.transform = 'translate(' + r(e.x) + 'px,' + r(e.y) + 'px) scale(' + r(e.s) + ')';
  el.lastChild.style.opacity = e.sombre; img.style.filter = e.flou ? 'blur(' + e.flou + 'px)' : '';
}

/* ------------------------------------------------------------------ LA TABLE (vue du dessus) : quatre joueurs, quatre écrans */
var JOUEURS = [
  /* x, y, angle (vers la table), taille, peau, cheveux, coiffure, haut, appareil : [x, y, largeur, hauteur, angle, image] */
  {x:720, y:604, a:0, s:1.12, peau:'#f0c6a0', chev:'#5a3a22', coif:'court', haut:'#3f8f6b', app:[720, 428, 210, 131, 0, 'accueil']},
  {x:720, y:22, a:180, s:1.06, peau:'#c98f62', chev:'#1c1a22', coif:'chignon', haut:'#c9567a', app:[720, 190, 66, 122, 180, 'heros1']},
  {x:238, y:308, a:90, s:.9, peau:'#f3d2b2', chev:'#c9742c', coif:'couettes', haut:'#e2a93a', app:[470, 300, 170, 106, 90, 'roles']},
  {x:1202, y:308, a:-90, s:.9, peau:'#8e5b3c', chev:'#20160f', coif:'casquette', haut:'#4f7fd6', app:[980, 316, 62, 116, -90, 'heros3']}
];
var ECRANS = {accueil:['accueil', 0, '50% 50%'], roles:['roles', 0, '50% 50%'], heros1:['heros', 1, '50% 30%'], heros3:['heros', 3, '50% 30%']};
function bras(x0, y0, x1, y1, coude, coul, peau){
  var mx = (x0 + x1) / 2 + coude * (y1 - y0) * .3, my = (y0 + y1) / 2 - coude * (x1 - x0) * .3;
  return '<path d="M' + r(x0) + ' ' + r(y0) + ' Q ' + r(mx) + ' ' + r(my) + ' ' + r(x1) + ' ' + r(y1) + '" fill="none" stroke="#141a3a" stroke-width="31" stroke-linecap="round"/>' +
    '<path d="M' + r(x0) + ' ' + r(y0) + ' Q ' + r(mx) + ' ' + r(my) + ' ' + r(x1) + ' ' + r(y1) + '" fill="none" stroke="' + coul + '" stroke-width="25" stroke-linecap="round"/>' +
    '<circle cx="' + r(x1) + '" cy="' + r(y1) + '" r="13.5" fill="' + peau + '" stroke="#141a3a" stroke-width="3"/>';
}
function joueur(j, i, t, joie){
  /* dans son repère : il regarde vers −y (vers la table) ; les mains sont à (±dx, −dy) */
  var b = Math.sin(t * 2.1 + i * 1.7), tape = Math.max(0, Math.sin(t * 6.3 + i * 2.1)), tape2 = Math.max(0, Math.sin(t * 5.1 + i * 1.3 + 2));
  var mgx = -46 + 3 * b, mgy = -118 - 5 * tape, mdx = 44 + 2 * b, mdy = -112 - 16 * tape2;
  if(joie > 0){ var w = Math.sin(t * 13 + i * 2); mgx = lerp(mgx, -118 - 10 * w, joie); mgy = lerp(mgy, -64 + 14 * w, joie); mdx = lerp(mdx, 118 + 10 * w, joie); mdy = lerp(mdy, -64 - 14 * w, joie); }
  var s = '<g transform="translate(' + j.x + ' ' + j.y + ') rotate(' + j.a + ') scale(' + j.s + ') translate(0 ' + r(-3 * joie * Math.abs(Math.sin(t * 9 + i))) + ')">';
  s += '<ellipse cx="0" cy="6" rx="78" ry="40" fill="#060a1e" opacity=".45"/>';
  s += bras(-52, -6, mgx, mgy, .5, j.haut, j.peau) + bras(52, -6, mdx, mdy, -.5, j.haut, j.peau);
  s += '<ellipse cx="0" cy="0" rx="66" ry="31" fill="' + j.haut + '" stroke="#141a3a" stroke-width="3.5"/>';
  s += '<ellipse cx="0" cy="-4" rx="50" ry="18" fill="#fff" opacity=".12"/>';
  var hy = -10 - 2.5 * b - 4 * joie;
  s += '<g transform="translate(0 ' + r(hy) + ') rotate(' + r(4 * Math.sin(t * 1.3 + i * 2.2)) + ')">';
  if(j.coif === 'couettes') s += '<circle cx="-34" cy="12" r="15" fill="' + j.chev + '" stroke="#141a3a" stroke-width="3"/><circle cx="34" cy="12" r="15" fill="' + j.chev + '" stroke="#141a3a" stroke-width="3"/>';
  s += '<ellipse cx="-29" cy="0" rx="6" ry="8" fill="' + j.peau + '" stroke="#141a3a" stroke-width="2.5"/><ellipse cx="29" cy="0" rx="6" ry="8" fill="' + j.peau + '" stroke="#141a3a" stroke-width="2.5"/>';
  s += '<circle cx="0" cy="0" r="29" fill="' + j.peau + '" stroke="#141a3a" stroke-width="3.5"/>';
  s += '<ellipse cx="0" cy="-27" rx="5" ry="4" fill="' + j.peau + '" stroke="#141a3a" stroke-width="2"/>';                                       /* le bout du nez, vers la table */
  if(j.coif === 'casquette') s += '<path d="M-24 -14 Q 0 -52 24 -14 Z" fill="#e2503f" stroke="#141a3a" stroke-width="3"/><circle cx="0" cy="2" r="27" fill="#e2503f" stroke="#141a3a" stroke-width="3"/><circle cx="0" cy="2" r="4" fill="#fff"/>';
  else {
    s += '<path d="M-28 -6 Q -30 30 0 31 Q 30 30 28 -6 Q 14 -20 0 -19 Q -14 -20 -28 -6 Z" fill="' + j.chev + '" stroke="#141a3a" stroke-width="3"/>';
    s += '<path d="M-14 8 Q 0 0 14 8" fill="none" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"/>';
    if(j.coif === 'chignon') s += '<circle cx="0" cy="22" r="13" fill="' + j.chev + '" stroke="#141a3a" stroke-width="3"/>';
  }
  return s + '</g></g>';
}
function appareil(a, t, k){
  var x = a[0], y = a[1], w = a[2], h = a[3], e = ECRANS[a[5]], id = 'ec-' + a[5], lueur = .5 + .08 * Math.sin(t * 3 + x);
  var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + a[4] + ')">';
  s += '<ellipse cx="0" cy="0" rx="' + (w * .95) + '" ry="' + (h * .95) + '" fill="url(#lueurEcran)" opacity="' + r(lueur) + '"/>';
  s += '<rect x="' + (-w / 2 - 9) + '" y="' + (-h / 2 - 9) + '" width="' + (w + 18) + '" height="' + (h + 18) + '" rx="13" fill="#0a0c18" stroke="#2b3157" stroke-width="2.5"/>';
  s += '<clipPath id="' + id + '"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="4"/></clipPath>';
  s += '<image href="' + src(e[0], e[1]) + '" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>';
  return s + '</g>';
}
var DEFS_TABLE = '<defs><radialGradient id="lampe" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffdf9a" stop-opacity=".5"/><stop offset=".55" stop-color="#ffb65a" stop-opacity=".16"/><stop offset="1" stop-color="#ffb65a" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="lueurEcran"><stop offset="0" stop-color="#9fd0ff" stop-opacity=".55"/><stop offset=".6" stop-color="#6fa8ff" stop-opacity=".18"/><stop offset="1" stop-color="#6fa8ff" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="bois" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9763c"/><stop offset=".5" stop-color="#a5622e"/><stop offset="1" stop-color="#8a4f25"/></linearGradient>' +
  '<radialGradient id="ombreBord" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#05071a" stop-opacity="0"/><stop offset="1" stop-color="#05071a" stop-opacity=".82"/></radialGradient>' +
  '<pattern id="tapis" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="56" height="56" fill="#1d2452"/><rect width="28" height="28" fill="#222a5e"/><rect x="28" y="28" width="28" height="28" fill="#222a5e"/></pattern></defs>';
function table(t, cam, joie){
  /* cam : {s, x, y, a} — le point (x, y) de la table vient au milieu de l'image */
  var s = DEFS_TABLE + '<g transform="translate(720 308) scale(' + r(cam.s) + ') rotate(' + r(cam.a) + ') translate(' + r(-cam.x) + ' ' + r(-cam.y) + ')">';
  s += '<rect x="-800" y="-600" width="3040" height="1816" fill="url(#tapis)"/>';
  s += '<rect x="318" y="96" width="804" height="428" rx="56" fill="#05071a" opacity=".5" transform="translate(10 16)"/>';
  s += '<rect x="318" y="96" width="804" height="428" rx="56" fill="url(#bois)" stroke="#5c3317" stroke-width="7"/>';
  for(var i = 0; i < 9; i++) s += '<path d="M' + (350 + hasard(i) * 40) + ' ' + (130 + i * 44) + ' q ' + (180 + hasard(i + 9) * 120) + ' ' + (hasard(i + 20) * 16 - 8) + ' ' + (700 - hasard(i) * 60) + ' ' + (hasard(i + 30) * 10 - 5) + '" fill="none" stroke="#6e3d1c" stroke-width="2.5" opacity=".32" stroke-linecap="round"/>';
  s += '<rect x="326" y="104" width="788" height="412" rx="50" fill="none" stroke="#e0a063" stroke-width="2.5" opacity=".45"/>';
  s += '<ellipse cx="720" cy="308" rx="430" ry="250" fill="url(#lampe)"/>';
  /* ce qui traîne sur la table : un bol de pop-corn, deux tasses, un carnet et son crayon, une loupe */
  s += '<g transform="translate(596 196)"><circle r="40" fill="#e9e3f7" stroke="#141a3a" stroke-width="3.5"/><circle r="31" fill="#c8455a"/>';
  for(var p = 0; p < 16; p++){ var an = hasard(p + 40) * 6.28, rr = hasard(p + 60) * 24; s += '<circle cx="' + r(Math.cos(an) * rr) + '" cy="' + r(Math.sin(an) * rr) + '" r="' + r(6 + hasard(p + 80) * 3) + '" fill="' + (p % 3 ? '#fff4c7' : '#ffe08a') + '" stroke="#b98a2c" stroke-width="1.2"/>'; }
  s += '</g>';
  [[872, 204, '#7cbcff'], [566, 404, '#f49ab8']].forEach(function(m){ s += '<g transform="translate(' + m[0] + ' ' + m[1] + ')"><path d="M18 -6 q 22 6 0 20" fill="none" stroke="' + m[2] + '" stroke-width="7" stroke-linecap="round"/><circle r="22" fill="' + m[2] + '" stroke="#141a3a" stroke-width="3.5"/><circle r="15" fill="#5a2f1a"/><path d="M-8 -4 q 6 -6 12 0" fill="none" stroke="#fff" stroke-width="2.5" opacity=".5" stroke-linecap="round"/></g>'; });
  s += '<g transform="translate(866 420) rotate(-14)"><rect x="-46" y="-34" width="92" height="68" rx="5" fill="#fbf3dc" stroke="#141a3a" stroke-width="3"/><path d="M-34 -18 h60 M-34 -6 h66 M-34 6 h44 M-34 18 h58" stroke="#8a93c4" stroke-width="3" stroke-linecap="round"/><path d="M-46 -34 v68" stroke="#c8455a" stroke-width="6"/></g>';
  s += '<g transform="translate(940 452) rotate(28)"><rect x="-38" y="-5" width="76" height="10" rx="4" fill="#ffd84a" stroke="#141a3a" stroke-width="2.5"/><path d="M38 -5 l14 5 l-14 5 Z" fill="#f3d2b2" stroke="#141a3a" stroke-width="2.5"/></g>';
  s += '<g transform="translate(486 176) rotate(-30)"><rect x="-6" y="24" width="12" height="42" rx="5" fill="#8a4f25" stroke="#141a3a" stroke-width="2.5"/><circle r="26" fill="#bfe6ff" fill-opacity=".45" stroke="#f2b63a" stroke-width="7"/><circle r="29.5" fill="none" stroke="#141a3a" stroke-width="2.5"/></g>';
  JOUEURS.forEach(function(j){ s += appareil(j.app, t); });
  JOUEURS.forEach(function(j, i){ s += joueur(j, i, t, joie || 0); });
  s += '</g><rect width="1440" height="616" fill="url(#ombreBord)" opacity="' + r(cl(1.6 - cam.s * .6, 0, 1)) + '"/>';
  return s;
}
/* la caméra de la table : large au début, puis elle plonge dans la tablette du joueur du bas ; à la fin, elle en ressort */
var TAB = JOUEURS[0].app, S_DANS = 1440 / TAB[2] * 1.02;
function camTable(t){
  if(t < 4.2){
    var d = E.io(k01(t, 0, 3.0)), p = E.expo(k01(t, 2.75, 4.0));
    return {s:lerp(lerp(1.0, 1.12, d), S_DANS, p), x:lerp(720, TAB[0], Math.min(1, p * 1.6)), y:lerp(lerp(300, 318, d), TAB[1], Math.min(1, p * 1.6)), a:lerp(lerp(-5, -1.5, d), 0, Math.min(1, p * 2))};
  }
  var q = E.o(k01(t, 24.0, 24.8)), z = E.io(k01(t, 24.8, T));
  return {s:lerp(S_DANS, lerp(1.0, 1.1, z), q), x:lerp(TAB[0], 720, q), y:lerp(TAB[1], 306, q), a:lerp(0, 2.5, q)};
}

/* ------------------------------------------------------------------ LES TITRES */
function texte(x, y, txt, o){
  /* un mot en grosses lettres : jaune, bordé de bleu nuit, avec son ombre */
  o = o || {}; var t = o.taille || 96, f = o.police || "'Lilita One'";
  return '<g transform="translate(' + r(x) + ' ' + r(y) + ') rotate(' + r(o.a || 0) + ') scale(' + r(o.s == null ? 1 : o.s) + ')" opacity="' + r(o.op == null ? 1 : o.op) + '">' +
    '<text text-anchor="' + (o.ancre || 'middle') + '" font-family="' + f + '" font-size="' + t + '" y="' + r(t * .09) + '" fill="#05071a" opacity=".55" stroke="#05071a" stroke-width="' + (t * .2) + '" stroke-linejoin="round">' + txt + '</text>' +
    '<text text-anchor="' + (o.ancre || 'middle') + '" font-family="' + f + '" font-size="' + t + '" fill="' + (o.coul || 'url(#orTitre)') + '" stroke="' + (o.bord || NUIT) + '" stroke-width="' + (t * .16) + '" stroke-linejoin="round" paint-order="stroke" letter-spacing="' + (o.esp || 1) + '">' + txt + '</text></g>';
}
function ruban(t, t0, t1, txt, y){
  /* le ruban jaune à lettres noires (les boutons du jeu) : il arrive par la gauche en rebondissant, repart par la gauche */
  var e = E.rebond(k01(t, t0, t0 + .3)), f = E.i(k01(t, t1 - .16, t1)), w = 70 + txt.length * 30.5, x = lerp(-w - 60, 0, e) - f * (w + 80);
  return '<g transform="translate(' + r(x) + ' ' + (y || 508) + ') rotate(-2.2)"><path d="M-40 6 h' + (w + 44) + ' l-30 76 h' + (-w - 14) + ' Z" fill="#05071a" opacity=".5"/>' +
    '<path d="M-40 -4 h' + (w + 40) + ' l-30 76 h' + (-w - 10) + ' Z" fill="url(#orRuban)" stroke="#141a3a" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M-40 4 h' + (w + 28) + '" stroke="#fff6c9" stroke-width="5" opacity=".8"/>' +
    '<text x="34" y="54" font-family="\'Lilita One\'" font-size="56" fill="#141a3a" letter-spacing="1.5">' + txt + '</text></g>';
}
function lanterne(x, y, s, t){
  var l = .85 + .15 * Math.sin(t * 5.3);
  return '<g transform="translate(' + r(x) + ' ' + r(y) + ') scale(' + r(s) + ')"><circle r="92" fill="url(#halo)" opacity="' + r(l) + '"/>' +
    '<path d="M-10 -66 a10 10 0 1 1 20 0" fill="none" stroke="#f2b63a" stroke-width="7"/><rect x="-24" y="-60" width="48" height="14" rx="5" fill="#f2b63a" stroke="#141a3a" stroke-width="4"/>' +
    '<path d="M-30 -46 h60 l8 78 h-76 Z" fill="#fff3b8" stroke="#141a3a" stroke-width="4.5" stroke-linejoin="round"/><path d="M-10 -46 l-3 78 M10 -46 l3 78" stroke="#141a3a" stroke-width="3.5"/>' +
    '<path d="M0 -24 q 14 18 0 36 q -14 -18 0 -36 Z" fill="#ff9d2e" stroke="#e2503f" stroke-width="2.5"/><rect x="-42" y="30" width="84" height="16" rx="6" fill="#f2b63a" stroke="#141a3a" stroke-width="4.5"/></g>';
}
function logo(t, t0, cy, ech){
  var e = E.rebond(k01(t, t0, t0 + .42)), e2 = E.rebond(k01(t, t0 + .14, t0 + .56)), s = '';
  s += '<g transform="translate(720 ' + cy + ') scale(' + ech + ')">';
  s += lanterne(-470, -6, 1.15 * E.rebond(k01(t, t0 + .05, t0 + .5)), t);
  s += texte(40, -34, 'Les Enquêteurs', {taille:118, police:'Macondo', s:e, esp:2});
  s += texte(40, 82, 'de Brumeval', {taille:118, police:'Macondo', s:e2, esp:2});
  return s + '</g>';
}
var DEFS_TITRES = '<defs><linearGradient id="orTitre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".55" stop-color="#ffd84a"/><stop offset="1" stop-color="#f2a52a"/></linearGradient>' +
  '<linearGradient id="orRuban" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f2b63a"/></linearGradient>' +
  '<radialGradient id="halo"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset=".5" stop-color="#ffb84a" stop-opacity=".3"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient></defs>';
function mot(t, t0, t1, txt, x, y, taille, angle){
  if(t < t0 || t >= t1) return '';
  var e = E.rebond(k01(t, t0, t0 + .26)), f = 1 - E.i(k01(t, t1 - .1, t1));
  return texte(x, y, txt, {taille:taille, s:e * (.9 + .1 * f), a:angle + (1 - e) * -8, op:f});
}
function confettis(t, t0){
  var s = '', a = t - t0; if(a < 0) return s;
  var C = ['#ffd84a', '#f49ab8', '#7cbcff', '#7bd88a', '#b99af7', '#ff8a4a', '#fff'];
  for(var i = 0; i < 90; i++){
    var x0 = 720 + (hasard(i) - .5) * 300, vx = (hasard(i + 100) - .5) * 1500, vy = -520 - hasard(i + 200) * 620, g = 1250;
    var x = x0 + vx * a * (1 - .25 * a), y = 420 + vy * a + g * a * a * .5, rot = (hasard(i + 300) * 720 - 360) * a * 2.4, w = 10 + hasard(i + 400) * 12;
    if(y > 660) continue;
    s += '<rect x="' + r(-w / 2) + '" y="-4" width="' + r(w) + '" height="8" rx="2" fill="' + C[i % C.length] + '" transform="translate(' + r(x) + ' ' + r(y) + ') rotate(' + r(rot) + ') scale(1 ' + r(Math.cos(a * 9 + i)) + ')"/>';
  }
  return s;
}
function etoiles(t){
  var s = '';
  for(var i = 0; i < 70; i++){ var x = hasard(i + 500) * W, y = hasard(i + 600) * H, c = .35 + .65 * Math.abs(Math.sin(t * (1 + hasard(i) * 2) + i)); s += '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(1 + hasard(i + 700) * 2.2) + '" fill="#fff6d0" opacity="' + r(c * .8) + '"/>'; }
  return s;
}

/* ------------------------------------------------------------------ L'IMAGE DU TEMPS t */
var pA, pB, elTable, elCartes, elTitres, elFx;
function init(){
  pA = document.getElementById('pA'); pB = document.getElementById('pB'); elTable = document.getElementById('table'); elCartes = document.getElementById('cartes'); elTitres = document.getElementById('titres'); elFx = document.getElementById('fx');
  var h = '';
  ROLES.forEach(function(ro, i){ h += '<div class="carte" id="carte' + i + '" style="border-color:' + ro[1] + '"><img><b style="color:' + ro[1] + '">' + ro[0] + '</b></div>'; });
  elCartes.innerHTML = '<div id="fondHeros"><svg viewBox="0 0 1440 616" id="ciel"></svg></div>' + h;
  ROLES.forEach(function(ro, i){ poser(document.querySelector('#carte' + i + ' img'), src('heros', i)); });
}
function image(t){
  attente = [];
  if(!pA) init();
  var fx = '', titres = DEFS_TITRES, i;
  /* --- les plans plein cadre --- */
  var cur = null, prec = null;
  for(i = 0; i < PLANS.length; i++) if(t >= PLANS[i][0] && t < PLANS[i][1]){ cur = PLANS[i]; prec = i > 0 && Math.abs(PLANS[i - 1][1] - cur[0]) < .01 ? PLANS[i - 1] : null; }
  pA.style.display = 'none'; pB.style.display = 'none';
  if(cur){
    var a = t - cur[0], en = cur[3].entree;
    if(en === 'pousse' && prec && a < .22){ var e = E.o(a / .22); mettrePlan(pA, etatPlan(prec, cur[0] - .001), -e * W * .35); mettrePlan(pB, etatPlan(cur, t), (1 - e) * W); }
    else if(en === 'balai' && a < .3){
      var X = E.io(a / .3) * (W + 560) - 140;
      if(prec) mettrePlan(pA, etatPlan(prec, cur[0] - .001));
      mettrePlan(pB, etatPlan(cur, t), 0, 'polygon(0 0, ' + r(X) + 'px 0, ' + r(X - 200) + 'px 100%, 0 100%)');
      fx += '<div class="balai" style="transform:translateX(' + r(X - 250) + 'px) skewX(-18deg)"></div>';
    }
    else mettrePlan(pB, etatPlan(cur, t));
    if(en === 'flash' && a < .2) fx += '<div class="flash" style="opacity:' + r(1 - a / .2) + '"></div>';
  }
  /* --- la table (le début et la fin) --- */
  var tableOn = t < 4.0 || t >= 24.0;
  elTable.style.display = tableOn ? '' : 'none';
  if(tableOn){
    var joie = t > 24 ? E.o(k01(t, 24.75, 25.1)) * (1 - .55 * E.io(k01(t, 26.6, 27.6))) : 0;
    elTable.innerHTML = table(t, camTable(t), joie);
    if(t > 3.78 && t < 4.0) fx += '<div class="flash" style="opacity:' + r(E.i(k01(t, 3.78, 4.0))) + '"></div>';
    if(t >= 24 && t < 24.2) fx += '<div class="flash" style="opacity:' + r(1 - (t - 24) / .2) + '"></div>';
    if(t >= 26) elTable.insertAdjacentHTML('beforeend', '<rect width="1440" height="616" fill="#060a22" opacity="' + r(.66 * E.o(k01(t, 26, 26.35))) + '"/>');
  }
  /* --- les quatre héros (6 → 8 s) --- */
  var herosOn = t >= 6.0 && t < 8.0;
  elCartes.style.display = herosOn ? '' : 'none';
  if(herosOn){
    document.getElementById('ciel').innerHTML = etoiles(t);
    var arr = E.io(k01(t, 6.0, 6.28)); document.getElementById('fondHeros').style.clipPath = arr < 1 ? 'polygon(0 0, ' + r(arr * (W + 420)) + 'px 0, ' + r(arr * (W + 420) - 200) + 'px 100%, 0 100%)' : '';
    if(arr < 1) fx += '<div class="balai" style="transform:translateX(' + r(arr * (W + 420) - 250) + 'px) skewX(-18deg)"></div>';
    ROLES.forEach(function(ro, n){
      var c = document.getElementById('carte' + n), t0 = 6.0 + n * .5, e = E.rebond(k01(t, t0, t0 + .36)), vu = t >= t0;
      var bat = 1 + .035 * Math.max(0, 1 - ((t * 2) % 1) * 3.5);                                                       /* un petit battement à chaque temps */
      c.style.opacity = vu ? 1 : 0;
      c.style.transform = 'translate(' + (174 + n * 282) + 'px,' + r(lerp(700, 40, e)) + 'px) rotate(' + r([-3.5, 2.5, -2, 3.5][n] * e) + 'deg) scale(' + r(bat) + ')';
    });
  }
  /* --- les titres --- */
  titres += mot(t, .5, 1.5, '4 JOUEURS', 720, 262, 140, -4) + mot(t, 1.5, 2.5, '4 ÉCRANS', 720, 262, 140, 3) + mot(t, 2.5, 3.4, '1 ENQUÊTE', 720, 262, 140, -3);
  if(t >= 4.0 && t < 6.0){ titres += logo(t, 4.0, 250, 1.12); var st = E.o(k01(t, 4.75, 5.0)); if(st > 0) titres += texte(720, 520, 'LE JEU D\'ENQUÊTE À 4 ÉCRANS', {taille:46, coul:'#fff', op:st, s:.9 + .1 * st, esp:3}); }
  if(t >= 6.0 && t < 8.0) titres += ruban(t, 6.05, 8.0, 'CHOISIS TON HÉROS');
  if(t >= 8.0 && t < 10.0) titres += ruban(t, 8.1, 10.0, 'MÈNE L\'ENQUÊTE');
  if(t >= 10.0 && t < 13.0) titres += ruban(t, 10.1, 13.0, 'RELÈVE LES DÉFIS');
  if(t >= 13.0 && t < 14.0) titres += ruban(t, 13.05, 14.0, 'PRÉPARE DES POTIONS');
  if(t >= 14.0 && t < 18.0) titres += ruban(t, 14.1, 18.0, 'PERCE LE MYSTÈRE');
  if(t >= 18.0 && t < 22.0) titres += ruban(t, 18.1, 22.0, 'AFFRONTE LE DONJON');
  titres += mot(t, 22.0, 22.5, 'DES ÉNIGMES', 720, 330, 132, -4) + mot(t, 22.5, 23.0, 'DES COMBATS', 720, 330, 132, 3) + mot(t, 23.0, 23.5, 'DES FOUS RIRES', 720, 330, 124, -3) + mot(t, 23.5, 24.0, 'ENSEMBLE !', 720, 330, 150, 4);
  if(t >= 25.0 && t < 28.2) titres += confettis(t, 25.0);
  if(t >= 26.0){
    titres += logo(t, 26.0, 222, 1.08);
    var s1 = E.rebond(k01(t, 26.9, 27.25)), s2 = E.o(k01(t, 27.8, 28.1));
    if(s1 > 0) titres += texte(720, 448, '4 JOUEURS  ·  4 ÉCRANS  ·  1 ENQUÊTE', {taille:54, coul:'#fff', s:s1, esp:2});
    if(s2 > 0) titres += '<g opacity="' + r(s2) + '" transform="translate(720 ' + r(540 + (1 - s2) * 16) + ')"><rect x="-350" y="-38" width="700" height="70" rx="35" fill="url(#orRuban)" stroke="#141a3a" stroke-width="5"/><text text-anchor="middle" y="13" font-family="\'Lilita One\'" font-size="40" fill="#141a3a" letter-spacing="1.5">À JOUER EN FAMILLE, DÈS 10 ANS</text></g>';
  }
  elTitres.innerHTML = titres;
  /* --- par-dessus : le bord sombre, les éclairs, le fondu de la fin --- */
  fx += '<div class="vignette"></div>';
  if(t < .35) fx += '<div class="noir" style="opacity:' + r(1 - t / .35) + '"></div>';
  if(t > T - .45) fx += '<div class="noir" style="opacity:' + r(k01(t, T - .45, T - .05)) + '"></div>';
  elFx.innerHTML = fx;
  return Promise.all(attente).then(function(){
    var ims = Array.prototype.slice.call(document.querySelectorAll('#table image')), ps = ims.map(function(im){ var u = im.getAttribute('href'); if(cache[u]) return cache[u]; return cache[u] = new Promise(function(ok){ var z = new Image(); z.onload = z.onerror = ok; z.src = u; }); });
    return Promise.all(ps);
  }).then(function(){ return true; });
}
window.PUB = {image:image, duree:T, plans:PLANS, COUPES:PLANS.map(function(p){ return p[0]; })};
})();
