/* ==========================================================
   Brumeval v2 — L'ÉCRAN D'ACCUEIL DES MINI-JEUX (version simple)
   Romain, 2 nov. au soir : « Tu vires tout et tu simplifies au maximum. »
   Avant chaque mini-jeu : une grande démo animée (comme une petite vidéo
   en boucle, avec une main qui fait les gestes), UNE phrase courte + 🔊,
   et « C'est parti ! ». Rien d'autre.

   MJ.PHRASES[type] : la phrase (8 mots au plus, pour des enfants de 8 ans).
   MJ.DEMOS[type] = {w, h, f(el, params)} : la démo, dessinée en hauteur
     (300 × 420, comme les jeux sur un téléphone) ; mj-core.js l'agrandit
     pour remplir la place libre. f renvoie {arreter()}.
   Pas de légende écrite dans les démos : la main montre le geste.
   prefers-reduced-motion : une image fixe, avec la main.
   Dessins : ceux des jeux quand c'est possible (obstacles de la course,
   cachettes, lanterne et flèche du tir copiés de mj-pisteur-alchi.js ;
   villageois de persos.js via Persos.pnj / Persos.expression).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ = window.MJ || {};

MJ.PHRASES = {
  traces:function(p){ return p && p.vehicule === 'charrette' ? 'Suis bien les traces de la charrette !' : (p && p.decor === 'ville' ? 'Suis les traces : sous les toits, tout droit !' : 'Suis bien les traces de pas !'); },
  poursuite:function(p){ return p && p.fuyard === 'chien' ? 'Saute, baisse-toi, évite : attrape le chien !' : 'Saute, baisse-toi, évite : attrape-la !'; },
  cachette:'Cache-toi et file jusqu\'à la porte !',
  tir:'Tire à fond, lâche : la flèche transperce !',
  bulles:'Touche les bulles dans le même ordre !',
  melange:'Fais la même couleur que la fiole !',
  chaudron:'Le bois chauffe, touiller refroidit, puis verse !',
  differences:'Trouve les différences entre les deux images !',
  double:'Trouve vite le dessin pareil !',
  insectes:'Écrase les méchants, pas les gentils !',
  mensonge:'Regarde son visage : quand ment-il ?',
  ragots:'Écoute : vrai ou faux ?',
  mots:'Remets les mots qui manquent !',
  depositions:'Trouve le témoin qui ment !',
  alphabet:'Déchiffre le message avec la clé !',
  plans:'Pose le calque pile sur le plan !',
  grille:'Lis les indices et coche les cases !',
  runes:'Tourne les pièces pour refaire l\'image !'
};

var DEMOS = MJ.DEMOS = MJ.DEMOS || {};
var K = '#24182e', LW = 300, LH = 420;
/* dessins des jeux (copiés de mj-pisteur-alchi.js : OBSTACLES_P, COUVERTS, ART_TIR, FLECHE_ART) */
var SP = {"barriere":"<g><path d=\"M-52,4 L-52,-34 M52,4 L52,-34 M0,4 L0,-34\" stroke=\"#24182e\" stroke-width=\"12\" stroke-linecap=\"round\"/><path d=\"M-52,4 L-52,-34 M52,4 L52,-34 M0,4 L0,-34\" stroke=\"#a8743f\" stroke-width=\"7\" stroke-linecap=\"round\"/><rect x=\"-60\" y=\"-30\" width=\"120\" height=\"11\" rx=\"4\" fill=\"#c08a4a\" stroke=\"#24182e\" stroke-width=\"4\"/><rect x=\"-60\" y=\"-12\" width=\"120\" height=\"11\" rx=\"4\" fill=\"#c08a4a\" stroke=\"#24182e\" stroke-width=\"4\"/></g>","branche":"<g><path d=\"M-62,-96 C-30,-110 20,-90 62,-104\" stroke=\"#24182e\" stroke-width=\"15\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M-62,-96 C-30,-110 20,-90 62,-104\" stroke=\"#7a4e2c\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"-34\" cy=\"-90\" r=\"15\" fill=\"#2a7050\" stroke=\"#24182e\" stroke-width=\"4\"/><circle cx=\"6\" cy=\"-84\" r=\"17\" fill=\"#2f7a4c\" stroke=\"#24182e\" stroke-width=\"4\"/><circle cx=\"40\" cy=\"-92\" r=\"14\" fill=\"#2a7050\" stroke=\"#24182e\" stroke-width=\"4\"/><circle cx=\"10\" cy=\"-90\" r=\"7\" fill=\"#3c9a62\"/></g>","caisse":"<g><rect x=\"-30\" y=\"-56\" width=\"60\" height=\"58\" rx=\"5\" fill=\"#c08a4a\" stroke=\"#24182e\" stroke-width=\"5\"/><path d=\"M-30,-56 L30,2 M30,-56 L-30,2\" stroke=\"#7d5428\" stroke-width=\"5\"/><rect x=\"-30\" y=\"-56\" width=\"60\" height=\"58\" rx=\"5\" fill=\"none\" stroke=\"#24182e\" stroke-width=\"5\"/></g>","tonneau":"<g><path d=\"M-26,-60 C-36,-30 -36,-28 -26,2 L26,2 C36,-28 36,-30 26,-60 Z\" fill=\"#9a6235\" stroke=\"#24182e\" stroke-width=\"5\"/><path d=\"M-31,-42 L31,-42 M-31,-16 L31,-16\" stroke=\"#3b3346\" stroke-width=\"6\"/><ellipse cx=\"0\" cy=\"-60\" rx=\"26\" ry=\"7\" fill=\"#b87a44\" stroke=\"#24182e\" stroke-width=\"4\"/></g>"};
var SP2 = {"tonneau":"<circle r=\"20\" fill=\"#9a6235\" stroke=\"#24182e\" stroke-width=\"4\"/><circle r=\"13\" fill=\"none\" stroke=\"#3b3346\" stroke-width=\"3\"/><circle r=\"5\" fill=\"#6e4424\"/>","buisson":"<path d=\"M-24,4 C-30,-10 -16,-24 -4,-20 C2,-30 22,-24 22,-10 C32,-4 26,16 12,16 C4,24 -14,22 -18,14 C-28,14 -30,8 -24,4 Z\" fill=\"#2f7a4c\" stroke=\"#24182e\" stroke-width=\"4\"/><circle cx=\"-8\" cy=\"-6\" r=\"3\" fill=\"#e5484d\"/><circle cx=\"8\" cy=\"4\" r=\"3\" fill=\"#e5484d\"/>","lanterne":"<g class=\"mja-lant\"><path d=\"M-11,-18 L11,-18 L15,13 L-15,13 Z\" fill=\"#ffd36a\" stroke=\"#24182e\" stroke-width=\"3.5\" stroke-linejoin=\"round\"/><path d=\"M-13,-24 L13,-24 L11,-18 L-11,-18 Z M-15,13 L15,13 L11,19 L-11,19 Z\" fill=\"#b8862e\" stroke=\"#24182e\" stroke-width=\"3\"/><path class=\"mja-lant-feu\" d=\"M0,-10 C6,-3 6,4 0,8 C-6,4 -6,-3 0,-10 Z\" fill=\"#e8693c\"/><path d=\"M-7,-14 L-9,9\" stroke=\"#fff\" stroke-width=\"2.5\" opacity=\".6\" stroke-linecap=\"round\"/></g>","pomme":"<path d=\"M0,-14 C-3,-19 -15,-19 -16,-8 C-18,4 -8,12 0,9 C8,12 18,4 16,-8 C15,-19 3,-19 0,-14 Z\" fill=\"#e5484d\" stroke=\"#24182e\" stroke-width=\"3.5\"/><path d=\"M-9,-9 C-9,-12 -7,-14 -4,-14\" stroke=\"#fff\" stroke-width=\"2.5\" fill=\"none\" stroke-linecap=\"round\" opacity=\".7\"/><path d=\"M0,-14 L1,-22\" stroke=\"#5e3a1e\" stroke-width=\"3\"/><path d=\"M1,-20 C6,-27 13,-24 13,-22 C8,-18 5,-18 1,-20 Z\" fill=\"#5fcf86\" stroke=\"#24182e\" stroke-width=\"2\"/>","fleche":"<path d=\"M-30,0 L4,0\" stroke=\"#c99a5e\" stroke-width=\"3.2\" stroke-linecap=\"round\"/><path d=\"M-30,0 L-24,0\" stroke=\"#24182e\" stroke-width=\"1\" /><path d=\"M2,-5 L12,0 L2,5 Z\" fill=\"#dfe6ff\" stroke=\"#24182e\" stroke-width=\"2\" stroke-linejoin=\"round\"/><path d=\"M-30,0 L-36,-6 L-26,-1 M-30,0 L-36,6 L-26,1\" stroke=\"#8ff3ff\" stroke-width=\"2.6\" stroke-linecap=\"round\" fill=\"none\"/>"};

/* ---------- outils ---------- */
function reduit(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function lisse(u){ u = u < 0 ? 0 : (u > 1 ? 1 : u); return u * u * (3 - 2 * u); }
function entre(t, a, b){ return lisse((t - a) / (b - a)); }
function bosse(t, a, d){ var u = (t - a) / d; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; }
function mix(a, b, u){ return a + (b - a) * u; }
function hex(c){ return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function mixC(a, b, u){ var x = hex(a), y = hex(b); return 'rgb(' + [0, 1, 2].map(function(i){ return Math.round(mix(x[i], y[i], u)); }).join(',') + ')'; }
function f1(v){ return (Math.round(v * 10) / 10).toString(); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function $(el, s){ return el.querySelector(s); }
function $$(el, s){ return Array.prototype.slice.call(el.querySelectorAll(s)); }
function uid(p){ return p + Math.floor(Math.random() * 1e7); }
/* déplacer / montrer un nœud SVG */
function pose(n, x, y, sc, rot){ n.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(y) + ')' + (sc !== undefined && sc !== 1 ? ' scale(' + sc.toFixed(3) + ')' : '') + (rot ? ' rotate(' + f1(rot) + ')' : '')); }
function vis(n, v){ n.setAttribute('opacity', Math.max(0, Math.min(1, v)).toFixed(2)); }
function emo(x, y, s, ic, cls){ return '<text' + (cls ? ' class="' + cls + '"' : '') + ' x="' + x + '" y="' + y + '" font-size="' + s + '" text-anchor="middle" dominant-baseline="central">' + ic + '</text>'; }
/* la main (même dessin que dans les jeux du Pisteur) : le bout du doigt est en (0,0) */
var MAIN = '<g class="rg-main"><circle class="rg-onde" r="13" fill="none" stroke="#8ff3ff" stroke-width="3" opacity="0"/><g class="rg-main-g">' +
  '<g transform="scale(.7) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M5,30 L5,40 M16,31 L16,41" stroke="' + K + '" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g></g></g>';
/* trajet de la main : [[t, x, y, appuie], …] → position au temps t */
function piste(cles){
  return function(t){
    for(var i = 0; i < cles.length - 1; i++){
      var a = cles[i], b = cles[i + 1];
      if(t >= a[0] && t <= b[0]){ var u = lisse((t - a[0]) / ((b[0] - a[0]) || 1)); return {x:mix(a[1], b[1], u), y:mix(a[2], b[2], u), p:!!a[3]}; }
    }
    var z = t < cles[0][0] ? cles[0] : cles[cles.length - 1];
    return {x:z[1], y:z[2], p:!!z[3]};
  };
}
/* pose la main : position, appui, et une onde quand on touche (tapes = instants des touchers) */
function poserMain(g, x, y, appuie, t, tapes){
  g.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(y) + ')');
  var o = g.firstChild, m = g.lastChild, r = 13, op = appuie ? .8 : 0;
  (tapes || []).forEach(function(tt){ if(t >= tt && t < tt + .5){ var u = (t - tt) / .5; r = 9 + 22 * u; op = 1 - u; } });
  o.setAttribute('r', f1(r)); o.setAttribute('opacity', op.toFixed(2));
  m.setAttribute('transform', appuie ? 'scale(.9)' : '');
}
/* une main toute prête : cles = trajet, tapes = touchers */
function mainAuto(g, cles, tapes){ var pf = piste(cles); return function(t){ var m = pf(t); poserMain(g, m.x, m.y, m.p, t, tapes); return m; }; }
/* boucle de P secondes ; image fixe (au temps tFixe) si l'appareil demande moins de mouvement */
function boucle(el, P, image, tFixe){
  if(reduit()){ image(tFixe); return {arreter:function(){}}; }
  var actif = true, t0 = null;
  function pas(ts){
    if(!actif) return;
    if(!el.isConnected){ actif = false; return; }
    if(t0 === null) t0 = ts;
    try{ image(el.__rgFige !== undefined ? el.__rgFige : ((ts - t0) / 1000) % P); }catch(e){ actif = false; if(window.console) console.warn(e); return; }
    requestAnimationFrame(pas);
  }
  image(0);
  el.__rgImage = image;   /* pour les essais : dessiner un instant précis */
  requestAnimationFrame(pas);
  return {arreter:function(){ actif = false; }};
}
/* une démo en SVG 300 × 420 (main par-dessus) */
function svgDemo(el, inner){
  el.innerHTML = '<svg class="rg-demo-svg" viewBox="0 0 ' + LW + ' ' + LH + '" preserveAspectRatio="xMidYMid meet">' + inner + MAIN + '</svg>';
  return el.firstChild;
}
/* une démo en HTML (la main dans un calque SVG par-dessus) */
function htmlDemo(el, cls, inner){
  el.innerHTML = '<div class="rg-h ' + cls + '">' + inner + '<svg class="rg-main-svg" viewBox="0 0 ' + LW + ' ' + LH + '">' + MAIN + '</svg></div>';
  return el.firstChild;
}
function D(type, f){ DEMOS[type] = {w:LW, h:LH, f:f}; }
/* un villageois de Brumeval (persos.js) ; repli : un emoji */
function villageois(id, opts, ic){
  try{ if(window.Persos && Persos.pnj){ var h = Persos.pnj(id, Object.assign({cadre:'visage', id:uid('rgv')}, opts || {})); if(h) return h; } }catch(e){}
  return '<span class="rg-emoji">' + (ic || '🙂') + '</span>';
}

/* ==========================================================
   PISTEUR
   ========================================================== */
/* TRACES — la démo du jeu (Romain l'aime), vue de plus près et en hauteur :
   on voit le chemin de pas qui arrive devant le Pisteur */
DEMOS.traces = {w:LW, h:LH, f:function(el, p){
  var r = MJ.TYPES.traces.demo(el, p);
  var svg = el.querySelector('svg');
  if(svg){ svg.setAttribute('viewBox', '80 -14 140 196'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); }
  if(reduit() && r) setTimeout(function(){ try{ if(r.arreter) r.arreter(); else if(typeof r === 'function') r(); }catch(e){} }, 1200);
  return r;
}};

/* POURSUITE — vers le haut : il saute la barrière ; vers le bas : il se baisse
   sous la branche ; sur le côté : il change de couloir (caisse, tonneau). */
var COUREUR = '<g class="rg-jambes"><path class="g" d="M-10,-6 L-14,10" stroke="' + K + '" stroke-width="9" stroke-linecap="round"/><path class="d" d="M10,-6 L14,10" stroke="' + K + '" stroke-width="9" stroke-linecap="round"/></g>' +
  '<path d="M-26,-12 C-28,-44 -18,-62 0,-64 C18,-62 28,-44 26,-12 C14,-6 -14,-6 -26,-12 Z" fill="#2f7a4c" stroke="' + K + '" stroke-width="5"/>' +
  '<path d="M-18,-58 C-18,-80 18,-80 18,-58 C12,-52 -12,-52 -18,-58 Z" fill="#3c9a62" stroke="' + K + '" stroke-width="5"/>' +
  '<path d="M-6,-40 L6,-40 L4,-18 L-4,-18 Z" fill="#8a5a33" stroke="' + K + '" stroke-width="3"/>';
var FUYARD = '<path d="M-15,0 C-17,-20 -13,-40 0,-48 C13,-40 17,-20 15,0 Z" fill="#1d1730" stroke="' + K + '" stroke-width="3"/><circle cx="0" cy="-52" r="9" fill="#1d1730" stroke="' + K + '" stroke-width="3"/><path d="M-14,-4 l-9,7 M14,-4 l9,7" stroke="#1d1730" stroke-width="5" stroke-linecap="round"/>';
D('poursuite', function(el, prm){
  prm = prm || {};
  var ART = (MJ.TYPES.poursuite && MJ.TYPES.poursuite.art) || {}, CHIEN = prm.fuyard === 'chien' && ART.chien, FORET = prm.decor === 'foret' && ART.foret, PANT = ART.coureur && ART.Pantin;
  var H = LH, HZ = 150, YR = 390, ER = (YR - HZ) / (H - HZ);
  var LHa = [140.7, 150, 159.3], LB = [37, 150, 263];
  function laneX(l, e){ var a = Math.floor(Math.min(1.999, Math.max(0, l))), b = a + 1, f = l - a; var xa = LHa[a] + (LB[a] - LHa[a]) * e, xb = LHa[b] + (LB[b] - LHa[b]) * e; return xa + (xb - xa) * f; }
  var SEG = [
    {o:'barriere', l:1, g:'haut', de:1, a:1},
    {o:'branche', l:1, g:'bas', de:1, a:1},
    {o:'caisse', l:1, g:'droite', de:1, a:2},
    {o:'tonneau', l:2, g:'gauche', de:2, a:1}
  ], DU = 2.6, P = DU * SEG.length, REPOS = [244, 290];
  var GESTE = {haut:[[244, 330], [244, 236]], bas:[[244, 236], [244, 330]], droite:[[200, 290], [286, 290]], gauche:[[286, 290], [200, 290]]};
  var cles = [[0, REPOS[0], REPOS[1], 0]];
  SEG.forEach(function(s, i){
    var t0 = i * DU, g = GESTE[s.g];
    cles.push([t0 + .8, REPOS[0], REPOS[1], 0], [t0 + 1.12, g[0][0], g[0][1], 1], [t0 + 1.45, g[1][0], g[1][1], 0], [t0 + 2.2, REPOS[0], REPOS[1], 0]);
  });
  var main = piste(cles), id = uid('rgp');
  var svg = svgDemo(el,
    '<defs><linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1">' + (FORET ? '<stop offset="0" stop-color="#0d2219"/><stop offset=".55" stop-color="#244a33"/><stop offset=".85" stop-color="#5f7a3e"/><stop offset="1" stop-color="#d9a65a"/>' : '<stop offset="0" stop-color="#141038"/><stop offset=".6" stop-color="#3b2a6a"/><stop offset="1" stop-color="#e08a6a"/>') + '</linearGradient>' +
    '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (FORET ? '#2a4a2c' : '#2c4a3a') + '"/><stop offset="1" stop-color="' + (FORET ? '#0f1f15' : '#12261f') + '"/></linearGradient>' +
    '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (FORET ? '#5a4430' : '#7a5e4a') + '"/><stop offset="1" stop-color="' + (FORET ? '#8f6e48' : '#b48a62') + '"/></linearGradient></defs>' +
    '<rect width="' + LW + '" height="' + HZ + '" fill="url(#' + id + 'c)"/>' +
    (FORET ? '<circle cx="216" cy="122" r="30" fill="#ffe3a3" opacity=".5"/><circle cx="216" cy="122" r="56" fill="#ffe3a3" opacity=".12"/>' +
      '<path d="M0,' + HZ + ' L0,100 L14,130 L28,86 L42,124 L58,92 L72,128 L88,80 L102,122 L118,96 L134,130 L150,88 L166,126 L182,94 L198,128 L214,84 L230,124 L246,98 L262,128 L278,90 L292,124 L300,104 L300,' + HZ + ' Z" fill="#15301f"/>' +
      '<path d="M0,' + HZ + ' L0,126 L12,144 L26,118 L40,142 L54,122 L70,146 L86,120 L100,144 L116,124 L132,146 L148,120 L164,144 L180,122 L196,146 L212,120 L228,144 L244,124 L260,146 L276,120 L290,144 L300,128 L300,' + HZ + ' Z" fill="#0e2417"/>'
    : '<circle cx="238" cy="52" r="20" fill="#fff4d0" opacity=".92"/><circle cx="238" cy="52" r="34" fill="#fff4d0" opacity=".1"/>' +
      '<path d="M0,' + HZ + ' L0,124 L30,112 L62,128 L96,108 L130,126 L170,110 L206,128 L240,112 L276,126 L300,116 L300,' + HZ + ' Z" fill="#241d44"/>') +
    '<rect y="' + HZ + '" width="' + LW + '" height="' + (H - HZ) + '" fill="url(#' + id + 's)"/>' +
    '<path d="M136,' + HZ + ' L164,' + HZ + ' L320,' + H + ' L-20,' + H + ' Z" fill="url(#' + id + 'r)" stroke="' + K + '" stroke-width="2"/>' +
    '<path class="rg-tirets" d="M145.3,' + HZ + ' L93.3,' + H + ' M154.7,' + HZ + ' L206.7,' + H + '" stroke="' + (FORET ? '#c9b48a' : '#e8d7ae') + '" stroke-width="2.5" stroke-dasharray="12 12" fill="none"' + (FORET ? ' opacity=".45"' : '') + '/>' +
    (FORET ? '<g class="rg-arbres">' + [[22, 214, 1], [278, 214, 1], [6, 300, 1.5], [294, 300, 1.5], [40, 176, .7], [260, 176, .7]].map(function(a){ return '<g transform="translate(' + a[0] + ',' + a[1] + ') scale(' + a[2] + ')"><path d="M0,0 L0,-26" stroke="' + K + '" stroke-width="9"/><path d="M0,0 L0,-26" stroke="#5e3f26" stroke-width="5"/><circle cx="0" cy="-44" r="22" fill="#245e3c" stroke="' + K + '" stroke-width="3.5"/><circle cx="-8" cy="-50" r="9" fill="#2f7a4c"/></g>'; }).join('') + '</g>' : '') +
    '<g class="rg-fuyard">' + (CHIEN ? ART.chien() : (PANT && ART.silhouette ? ART.silhouette() : FUYARD)) + '</g><g class="rg-obs"></g>' +
    '<ellipse class="rg-ombre" cx="150" cy="' + YR + '" rx="22" ry="5" fill="#000" opacity=".3"/>' +
    '<g class="rg-coureur">' + (PANT ? ART.coureur('pisteur') : COUREUR) + '</g>' +
    '<g class="rg-trace" opacity="0"><path d="" stroke="#8ff3ff" stroke-width="8" stroke-linecap="round" fill="none" opacity=".55"/><path d="" fill="#8ff3ff" opacity=".85"/></g>');
  var gObs = $(svg, '.rg-obs'), cour = $(svg, '.rg-coureur'), ombre = $(svg, '.rg-ombre'), fuy = $(svg, '.rg-fuyard'), tir = $(svg, '.rg-tirets');
  var jg = $(svg, '.rg-jambes .g'), jd = $(svg, '.rg-jambes .d'), trace = $(svg, '.rg-trace'), gMain = $(svg, '.rg-main');
  /* le coureur du jeu (pantin vu de dos) et la silhouette, quand mj-pisteur-alchi.js les donne */
  var pant = PANT ? ART.Pantin(cour, 'pisteur') : null, pantF = (PANT && !CHIEN && ART.silhouette) ? ART.Pantin(fuy, 'ombre') : null;
  var obs = SEG.map(function(s){ var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = (FORET && FORET[s.o]) || (ART.route && ART.route[s.o]) || SP[s.o]; gObs.appendChild(g); return g; });
  return boucle(el, P, function(t){
    var i = Math.min(SEG.length - 1, Math.floor(t / DU)), s = SEG[i], t0 = i * DU;
    obs.forEach(function(g, j){
      var u = (t - j * DU) / 1.9;
      if(u < 0 || u > 1.22){ vis(g, 0); return; }
      var e = ER * Math.pow(u, 1.6), sc = .04 + .76 * e / ER, y = HZ + (H - HZ) * e;
      if(SEG[j].o === 'branche' && !ART.route) y += 16 * sc;
      vis(g, u > 1.1 ? (1.22 - u) / .12 : 1);
      pose(g, laneX(SEG[j].l, e), y, sc);
    });
    var dy = 0, sy = 1, voie = s.de;
    if(s.g === 'haut'){ var uj = (t - t0 - 1.45) / .7; if(uj > 0 && uj < 1) dy = -54 * Math.sin(Math.PI * uj); }
    if(s.g === 'bas') sy = 1 - .48 * entre(t, t0 + 1.42, t0 + 1.58) * (1 - entre(t, t0 + 2.2, t0 + 2.4));
    if(s.de !== s.a) voie = mix(s.de, s.a, entre(t, t0 + 1.45, t0 + 1.75));
    var x = laneX(voie, ER), course = Math.sin(t * 14), sc = .74;
    if(pant){
      var lean = s.de !== s.a ? (s.a - s.de) * 11 * bosse(t, t0 + 1.45, .32) : 0;
      cour.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(YR - 4 + dy) + ') scale(' + sc + ') rotate(' + f1(lean) + ')');
      pant.poser({ph:t * 11, j:dy ? Math.min(1, -dy / 54 * 1.8) : 0, b:(1 - sy) / .48, l:0, t:t, v:1});
    } else {
      cour.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(YR - 7 + dy + (dy ? 0 : Math.abs(course) * -2)) + ') scale(' + sc + ',' + (sc * sy).toFixed(3) + ')');
      jg.setAttribute('transform', dy ? 'rotate(18)' : 'rotate(' + f1(course * 14) + ')');
      jd.setAttribute('transform', dy ? 'rotate(-18)' : 'rotate(' + f1(-course * 14) + ')');
    }
    ombre.setAttribute('cx', f1(x)); ombre.setAttribute('rx', f1(22 + dy / 6));
    pose(fuy, 150 + Math.sin(t * 1.3) * 4, HZ + 12 - Math.abs(Math.sin(t * 9)) * 1.5, CHIEN ? .62 : .5);
    if(CHIEN && ART.animerChien) ART.animerChien(fuy, t, 1);
    if(pantF) pantF.poser({ph:t * 12, j:0, b:0, l:0, t:t, v:1});
    tir.setAttribute('stroke-dashoffset', f1(-(t * 60) % 24));
    var m = main(t); poserMain(gMain, m.x, m.y, m.p, t, []);
    var g = GESTE[s.g], ut = entre(t, t0 + 1.12, t0 + 1.45), op = (t > t0 + 1.12 && t < t0 + 2) ? .9 * (1 - entre(t, t0 + 1.5, t0 + 2)) : 0;
    if(op > 0){
      var x1 = mix(g[0][0], g[1][0], ut), y1 = mix(g[0][1], g[1][1], ut), dx = g[1][0] - g[0][0], dy2 = g[1][1] - g[0][1], L = Math.hypot(dx, dy2) || 1, ux = dx / L, uy = dy2 / L;
      trace.firstChild.setAttribute('d', 'M' + g[0][0] + ',' + g[0][1] + ' L' + f1(x1) + ',' + f1(y1));
      trace.lastChild.setAttribute('d', 'M' + f1(x1 + ux * 12) + ',' + f1(y1 + uy * 12) + ' L' + f1(x1 - uy * 10) + ',' + f1(y1 + ux * 10) + ' L' + f1(x1 + uy * 10) + ',' + f1(y1 - ux * 10) + ' Z');
    }
    vis(trace, op);
  }, 1.62);
});

/* CACHETTE — vue du dessus, la nuit : la main touche une cachette entourée de bleu
   quand la lanterne regarde ailleurs ; le Pisteur y court, puis jusqu'à la porte. */
D('cachette', function(el){
  var P = 8, G = [222, 160], DEP = [150, 388], C1 = [206, 292], C2 = [80, 180], PO = [150, 48];
  var A_C1 = Math.atan2(C1[1] - G[1], C1[0] - G[0]), A_LOIN = .05, A_C2 = Math.atan2(C2[1] - G[1], C2[0] - G[0]);
  function angle(t){
    if(t < 1.0) return A_C1;
    if(t < 1.5) return mix(A_C1, A_LOIN, entre(t, 1, 1.5));
    if(t < 2.5) return A_LOIN;
    if(t < 3.0) return mix(A_LOIN, A_C1, entre(t, 2.5, 3));
    if(t < 3.2) return A_C1;
    if(t < 3.7) return mix(A_C1, A_LOIN, entre(t, 3.2, 3.7));
    if(t < 6.8) return A_LOIN + .25 * Math.sin((t - 3.7) * 1.2);
    return mix(A_LOIN, A_C1, entre(t, 6.8, 7.6));
  }
  var anneau = function(c, x, y, r){ return '<circle class="' + c + '" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#6cb6ff" fill-opacity=".12" stroke="#6cb6ff" stroke-width="3.5" stroke-dasharray="7 6"/>'; };
  var svg = svgDemo(el,
    '<rect width="300" height="420" fill="#2b3150"/>' +
    '<g stroke="#3a4470" stroke-width="2" fill="none" opacity=".8"><path d="M0,110 H300 M0,240 H300 M0,340 H300 M60,0 V110 M180,110 V240 M110,240 V340 M240,340 V420 M30,240 V340"/></g>' +
    '<g transform="translate(' + PO[0] + ',' + (PO[1] + 4) + ') scale(1.7)"><rect x="-17" y="-16" width="34" height="30" rx="3" fill="#7a5a3e" stroke="' + K + '" stroke-width="3"/><path d="M-17,-16 L0,-28 L17,-16" fill="#a8743f" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/><rect x="-7" y="-4" width="14" height="18" rx="6" fill="#3b2a1e" stroke="' + K + '" stroke-width="2"/><circle cx="3" cy="5" r="1.6" fill="#ffd36a"/></g>' +
    anneau('an an2', PO[0], PO[1] - 2, 42) +
    '<g transform="translate(' + C1[0] + ',' + C1[1] + ') scale(1.3)">' + SP2.tonneau + '</g>' + anneau('an an0', C1[0], C1[1], 36) +
    '<g transform="translate(' + C2[0] + ',' + C2[1] + ') scale(1.35)">' + SP2.buisson + '</g>' + anneau('an an1', C2[0], C2[1], 40) +
    '<g class="rg-cone-g" transform="translate(' + G[0] + ',' + G[1] + ')"><path class="rg-cone" fill="#ffd36a" opacity=".42"/></g>' +
    '<g class="rg-jd"><circle r="12" fill="#3c9a62" stroke="' + K + '" stroke-width="3"/><path d="M-5,-3 C-2,-8 2,-8 5,-3" stroke="#bff0cf" stroke-width="2" fill="none"/></g>' +
    '<g transform="translate(' + G[0] + ',' + G[1] + ')"><circle r="14" fill="#3a5a9a" stroke="' + K + '" stroke-width="3"/><circle cx="0" cy="-4" r="4.5" fill="#ffd36a"/></g>' +
    '<g class="rg-ouf" opacity="0">' + emo(PO[0], PO[1] - 54, 30, '✨') + '</g>');
  var cone = $(svg, '.rg-cone'), jd = $(svg, '.rg-jd'), an = [$(svg, '.an0'), $(svg, '.an1'), $(svg, '.an2')], ouf = $(svg, '.rg-ouf');
  var main = mainAuto($(svg, '.rg-main'), [[0, 262, 400, 0], [1.25, 262, 400, 0], [1.65, C1[0], C1[1] + 6, 1], [1.8, C1[0], C1[1] + 6, 0], [2.5, 262, 400, 0], [3.5, 262, 400, 0], [3.85, C2[0], C2[1] + 8, 1], [4.0, C2[0], C2[1] + 8, 0], [4.55, PO[0] + 30, PO[1] + 40, 0], [4.9, PO[0], PO[1] + 6, 1], [5.05, PO[0], PO[1] + 6, 0], [6.0, 262, 400, 0], [P, 262, 400, 0]], [1.65, 3.85, 4.9]);
  function chemin(t){
    if(t < 1.8) return {p:DEP, c:false};
    if(t < 2.4){ var u = entre(t, 1.8, 2.4); return {p:[mix(DEP[0], C1[0], u), mix(DEP[1], C1[1], u)], c:false}; }
    if(t < 4.0) return {p:C1, c:true};
    if(t < 4.6){ var v = entre(t, 4.0, 4.6); return {p:[mix(C1[0], C2[0], v), mix(C1[1], C2[1], v)], c:false}; }
    if(t < 5.1) return {p:C2, c:true};
    if(t < 5.8){ var w = entre(t, 5.1, 5.8); return {p:[mix(C2[0], PO[0], w), mix(C2[1], PO[1] + 10, w)], c:false}; }
    return {p:[PO[0], PO[1] + 10], c:true};
  }
  return boucle(el, P, function(t){
    var a = angle(t), L = 175, h = .42;
    cone.setAttribute('d', 'M0,0 L' + f1(L * Math.cos(a - h)) + ',' + f1(L * Math.sin(a - h)) + ' A' + L + ',' + L + ' 0 0 1 ' + f1(L * Math.cos(a + h)) + ',' + f1(L * Math.sin(a + h)) + ' Z');
    var c = chemin(t), fin = entre(t, 7.3, 7.9);
    pose(jd, mix(c.p[0], DEP[0], fin), mix(c.p[1], DEP[1], fin), c.c ? .75 : 1);
    vis(jd, (c.c ? .6 : 1) * (1 - bosse(t, 7.2, .8)));
    var dash = f1(-t * 14);
    an.forEach(function(n){ n.setAttribute('stroke-dashoffset', dash); });
    vis(an[0], t < 1.9 ? 1 : 0); vis(an[1], t > 2.4 && t < 4.1 ? 1 : 0); vis(an[2], t > 4.6 && t < 5.2 ? 1 : 0);
    vis(ouf, entre(t, 5.8, 6.1) * (1 - entre(t, 6.9, 7.2)));
    main(t);
  }, 1.65);
});

/* TIR — la main pose le doigt près de l'arc, tire À FOND vers l'arrière (la ligne
   de visée apparaît puis devient dorée, la jauge autour de l'arc se remplit), lâche :
   la flèche dorée transperce la lanterne, puis la pomme derrière (« ×2 »), et continue. */
D('tir', function(el){
  var P = 6.4, ARC = [82, 330], LANT = [150, 167], POMME = [236, 92], CTRL = [141, 123];
  /* une seule courbe : la lanterne est au milieu (s = 0,5), la pomme au bout (s = 1), la flèche sort de l'image après */
  function bez(s){ var a = 1 - s; return [a * a * ARC[0] + 2 * a * s * CTRL[0] + s * s * POMME[0], a * a * ARC[1] + 2 * a * s * CTRL[1] + s * s * POMME[1]]; }
  function tang(s){ return Math.atan2(2 * (1 - s) * (CTRL[1] - ARC[1]) + 2 * s * (POMME[1] - CTRL[1]), 2 * (1 - s) * (CTRL[0] - ARC[0]) + 2 * s * (POMME[0] - CTRL[0])) * 180 / Math.PI; }
  var pts = ''; for(var i = 1; i <= 16; i++){ var q = bez(i / 15); pts += '<circle class="rg-pt" cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="3"/>'; }
  var a0 = tang(0), id = uid('rgt'), S_FIN = 1.35, T_LACHE = 1.95, VOL = .75;
  var T_LANT = T_LACHE + VOL * .5 / S_FIN, T_POMME = T_LACHE + VOL / S_FIN;
  var svg = svgDemo(el,
    '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141038"/><stop offset="1" stop-color="#2c3566"/></linearGradient></defs>' +
    '<rect width="300" height="420" fill="url(#' + id + ')"/><circle cx="62" cy="78" r="24" fill="#fff4d0" opacity=".9"/>' +
    '<path d="M300,64 C250,48 170,50 112,68" stroke="#7a4e2c" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="196" cy="54" r="10" fill="#2f7a4c"/><circle cx="274" cy="54" r="12" fill="#2a7050"/><circle cx="124" cy="64" r="9" fill="#2a7050"/>' +
    '<line class="rg-corde" x1="' + LANT[0] + '" y1="60" x2="' + LANT[0] + '" y2="' + (LANT[1] - 30) + '" stroke="#c9c2e0" stroke-width="2"/>' +
    '<g class="rg-lant">' + SP2.lanterne + '</g>' +
    '<path class="rg-tige" d="M' + POMME[0] + ',56 L' + POMME[0] + ',' + (POMME[1] - 22) + '" stroke="#5e3a1e" stroke-width="3"/>' +
    '<g class="rg-pomme">' + SP2.pomme + '</g>' +
    '<rect y="372" width="300" height="48" fill="#2b5038"/><path d="M0,374 Q75,364 150,374 T300,372" stroke="#3c7a52" stroke-width="4" fill="none"/>' +
    '<g class="rg-pts">' + pts + '</g>' +
    '<circle class="rg-jauge" cx="' + ARC[0] + '" cy="' + ARC[1] + '" r="54" fill="none" stroke-width="6" stroke-linecap="round" transform="rotate(-90 ' + ARC[0] + ' ' + ARC[1] + ')"/>' +
    '<g transform="translate(' + ARC[0] + ',' + ARC[1] + ') rotate(' + f1(a0) + ') scale(1.35)"><path d="M0,-34 C20,-24 20,24 0,34" transform="rotate(0)" stroke="#8a5a33" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path class="rg-corde-arc" d="M0,-34 L0,34" stroke="#eee" stroke-width="1.8" fill="none"/></g>' +
    '<path class="rg-trainee" d="" stroke="#ffd36a" stroke-width="5" stroke-linecap="round" fill="none" opacity=".75"/>' +
    '<g class="rg-fl"><path class="rg-halo" d="M-36,0 L14,0" stroke="#ffd36a" stroke-width="10" stroke-linecap="round" opacity="0"/>' + SP2.fleche + '</g>' +
    '<g class="rg-bing1" opacity="0">' + emo(LANT[0] - 30, LANT[1] - 18, 22, '✨') + emo(LANT[0] + 28, LANT[1] + 4, 18, '✨') + '</g>' +
    '<g class="rg-bing2" opacity="0">' + emo(POMME[0] + 30, POMME[1] - 26, 24, '✨') + emo(POMME[0] - 30, POMME[1] + 8, 18, '✨') +
      '<text x="182" y="104" text-anchor="middle" font-size="34" font-weight="700" fill="#ffe3a3" stroke="' + K + '" stroke-width="5" paint-order="stroke" style="font-family:var(--f-titre)">×2</text></g>');
  var lant = $(svg, '.rg-lant'), corde = $(svg, '.rg-corde'), pomme = $(svg, '.rg-pomme'), tige = $(svg, '.rg-tige'), ca = $(svg, '.rg-corde-arc'), fl = $(svg, '.rg-fl'), halo = $(svg, '.rg-halo');
  var ptsG = $$(svg, '.rg-pt'), jauge = $(svg, '.rg-jauge'), trainee = $(svg, '.rg-trainee'), bing1 = $(svg, '.rg-bing1'), bing2 = $(svg, '.rg-bing2');
  var rad = a0 * Math.PI / 180, bx = -Math.cos(rad), by = -Math.sin(rad);
  var DEB = [ARC[0] + 4, ARC[1] + 4], FIN = [ARC[0] + bx * 46, ARC[1] + by * 46];
  var main = mainAuto($(svg, '.rg-main'), [[0, 230, 400, 0], [.5, 230, 400, 0], [.95, DEB[0], DEB[1], 1], [1.85, FIN[0], FIN[1], 1], [T_LACHE, FIN[0], FIN[1], 0], [2.7, 230, 400, 0], [P, 230, 400, 0]], [.95]);
  /* une cible transpercée tombe en tournant, puis revient doucement pour la boucle suivante */
  function chute(t, t0){ var u = t - t0; return u > 0 && t < 5.4 ? {y:300 * u * u, r:120 * u, o:1 - entre(t, t0 + .7, t0 + 1.1)} : {y:0, r:0, o:entre(t, 5.5, 6.1) + (t < t0 ? 1 : 0)}; }
  return boucle(el, P, function(t){
    var tire = t > .95 && t < T_LACHE ? entre(t, .95, 1.85) : 0, fort = tire > .97;
    ca.setAttribute('d', 'M0,-34 L' + f1(-tire * 34) + ',0 L0,34');
    /* la jauge se remplit ; à fond, elle devient dorée (comme dans le jeu) */
    jauge.setAttribute('stroke', fort ? '#ffd36a' : '#8ff3ff'); jauge.setAttribute('stroke-dasharray', f1(tire * 339) + ' 400'); vis(jauge, tire > 0 ? (fort ? 1 : .8) : 0);
    ptsG.forEach(function(c, i){ vis(c, tire > i / 16 ? 1 : 0); c.setAttribute('fill', fort ? '#ffd36a' : '#8ff3ff'); });
    var s = (t - T_LACHE) / VOL * S_FIN;
    if(t < T_LACHE){ var ex = ARC[0] - Math.cos(rad) * tire * 46, ey = ARC[1] - Math.sin(rad) * tire * 46; pose(fl, ex + Math.cos(rad) * 22, ey + Math.sin(rad) * 22, 1.35, a0); vis(fl, 1); vis(halo, fort ? .55 : 0); trainee.setAttribute('d', ''); }
    else if(s < S_FIN){
      var b = bez(s); pose(fl, b[0], b[1], 1.35, tang(s)); vis(fl, 1); vis(halo, .55);
      var d = 'M'; for(var k = 0; k <= 6; k++){ var q2 = bez(Math.max(0, s - .3 + k * .05)); d += (k ? ' L' : '') + f1(q2[0]) + ',' + f1(q2[1]); } trainee.setAttribute('d', d);
    } else { vis(fl, 0); trainee.setAttribute('d', ''); }
    vis(trainee, s > 0 && s < S_FIN ? .75 : 0);
    var cl = chute(t, T_LANT), cp = chute(t, T_POMME);
    lant.setAttribute('transform', 'translate(' + LANT[0] + ',' + f1(LANT[1] + cl.y) + ') rotate(' + f1(cl.r) + ') scale(1.4)'); vis(lant, cl.o);
    vis(corde, 1);
    pomme.setAttribute('transform', 'translate(' + POMME[0] + ',' + f1(POMME[1] + cp.y) + ') rotate(' + f1(-cp.r) + ') scale(1.35)'); vis(pomme, cp.o);
    vis(bing1, bosse(t, T_LANT, .9)); vis(bing2, entre(t, T_POMME, T_POMME + .12) * (1 - entre(t, T_POMME + 1.1, T_POMME + 1.5)));
    main(t);
  }, 1.9);
});

/* ==========================================================
   ALCHIMISTE
   ========================================================== */
/* BULLES — les bulles s'allument dans un ordre (👀), puis la main les touche
   dans le même ordre (👆) : leurs ingrédients tombent dans le chaudron. */
D('bulles', function(el){
  var P = 7.8, id = uid('rgb');
  var B = [{x:78, y:120, c:'#e5484d', ic:'❤️'}, {x:222, y:104, c:'#f5b945', ic:'⭐'}, {x:150, y:214, c:'#3fa9ff', ic:'💧'}];
  var MONTRE = [.6, 1.4, 2.2], TAPE = [3.5, 4.3, 5.1];
  var svg = svgDemo(el,
    '<defs>' + B.map(function(b, i){ return '<radialGradient id="' + id + i + '" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".25" stop-color="' + b.c + '" stop-opacity=".9"/><stop offset="1" stop-color="' + b.c + '" stop-opacity=".55"/></radialGradient>'; }).join('') + '</defs>' +
    '<rect width="300" height="420" fill="#2a2040"/>' +
    '<rect x="14" y="44" width="272" height="236" rx="26" fill="#3a2f5a" stroke="#4d4078" stroke-width="3"/>' +
    '<g stroke="#4d4078" stroke-width="2" opacity=".7"><path d="M14,104 H286 M14,164 H286 M14,224 H286 M80,44 V104 M200,44 V104 M140,104 V164 M60,164 V224 M240,164 V224 M120,224 V280"/></g>' +
    '<g class="rg-oeil">' + emo(150, 22, 22, '👀') + '</g><g class="rg-doigt" opacity="0">' + emo(150, 22, 22, '👆') + '</g>' +
    B.map(function(b, i){ return '<g class="bu bu' + i + '"><circle class="halo" r="44" fill="none" stroke="#fff4d0" stroke-width="5" opacity="0"/><circle r="34" fill="url(#' + id + i + ')" stroke="' + K + '" stroke-width="3"/>' + emo(0, 2, 28, b.ic) + '</g>'; }).join('') +
    B.map(function(b, i){ return '<circle class="gt gt' + i + '" r="7" fill="' + b.c + '" stroke="' + K + '" stroke-width="2" opacity="0"/>'; }).join('') +
    '<path d="M112,338 C108,388 126,408 150,408 C174,408 192,388 188,338 Z" fill="#3a3550" stroke="' + K + '" stroke-width="4"/>' +
    '<ellipse cx="150" cy="338" rx="40" ry="10" fill="#3a3550" stroke="' + K + '" stroke-width="4"/><ellipse class="rg-liq" cx="150" cy="338" rx="33" ry="7" fill="#8fb7d6"/>' +
    '<g class="rg-arc" opacity="0">' + emo(118, 316, 20, '✨') + emo(182, 312, 22, '✨') + emo(150, 300, 18, '✨') + '</g>');
  var bu = [0, 1, 2].map(function(i){ return $(svg, '.bu' + i); }), gt = [0, 1, 2].map(function(i){ return $(svg, '.gt' + i); });
  var liq = $(svg, '.rg-liq'), arc = $(svg, '.rg-arc'), oeil = $(svg, '.rg-oeil'), doigt = $(svg, '.rg-doigt');
  var cles = [[0, 262, 400, 0], [3.0, 262, 400, 0]];
  TAPE.forEach(function(tt, i){ cles.push([tt, B[i].x, B[i].y + 6, 1], [tt + .15, B[i].x, B[i].y + 6, 0]); });
  cles.push([6.2, 262, 400, 0], [P, 262, 400, 0]);
  var main = mainAuto($(svg, '.rg-main'), cles, TAPE);
  var COUL = ['#8fb7d6', '#e5484d', '#f08a4a', '#9d6ee3'];
  return boucle(el, P, function(t){
    bu.forEach(function(g, i){
      var b = B[i], dx = 6 * Math.sin(t * .8 + i * 2), dy = 5 * Math.cos(t * .7 + i), lit = Math.max(bosse(t, MONTRE[i], .7), bosse(t, TAPE[i], .45));
      pose(g, b.x + dx, b.y + dy, 1 + .14 * lit);
      vis(g.firstChild, lit);
      var u = (t - TAPE[i] - .1) / .6;
      if(u > 0 && u < 1){ vis(gt[i], 1); pose(gt[i], mix(b.x, 150, u), mix(b.y + 30, 336, u * u)); } else vis(gt[i], 0);
    });
    var n = TAPE.filter(function(tt){ return t > tt + .7; }).length;
    liq.setAttribute('fill', t > 7.2 ? COUL[0] : COUL[n]);
    vis(arc, n === 3 ? .5 + .5 * Math.sin(t * 8) : 0);
    vis(oeil, t < 2.95 ? 1 : 0); vis(doigt, t >= 2.95 && t < 6 ? 1 : 0);
    main(t);
  }, 3.55);
});

/* MÉLANGE — la main touche un pot (myrtille), puis un autre (pensée) : les gouttes
   tombent dans le chaudron, la potion devient de la même couleur que la fiole ;
   puis « Goûter » : c'est réussi. */
D('melange', function(el){
  var P = 8;
  var POTS = [{x:48, ic:'🫐', c:'#4a5fc0'}, {x:116, ic:'🌺', c:'#e5484d'}, {x:184, ic:'🌼', c:'#f5c93e'}, {x:252, ic:'🌿', c:'#3fcf9a'}];
  var CIBLE = '#5fae5a', EAU = '#8fb7d6';
  var pot = function(p, i){ return '<g class="pot pot' + i + '" transform="translate(' + p.x + ',88)"><rect x="-22" y="-26" width="44" height="50" rx="10" fill="#eef0ff" fill-opacity=".18" stroke="#a6aed8" stroke-width="2.5"/><rect x="-18" y="-4" width="36" height="24" rx="7" fill="' + p.c + '"/><rect x="-16" y="-34" width="32" height="10" rx="3" fill="#a8743f" stroke="' + K + '" stroke-width="2"/>' + emo(0, -50, 22, p.ic) + '</g>'; };
  var svg = svgDemo(el,
    '<rect width="300" height="420" fill="#2b2148"/>' +
    '<rect x="8" y="112" width="284" height="9" rx="3" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/>' + POTS.map(pot).join('') +
    '<rect y="350" width="300" height="70" fill="#6b3f24"/><rect y="344" width="300" height="8" fill="#62381d"/>' +
    /* la fiole modèle */
    '<g transform="translate(52,262)"><rect x="-26" y="40" width="52" height="8" rx="3" fill="#8a5a33"/><path d="M-6,-44 L6,-44 L6,-22 C22,-14 26,0 26,10 C26,30 12,40 0,40 C-12,40 -26,30 -26,10 C-26,0 -22,-14 -6,-22 Z" fill="' + CIBLE + '" stroke="' + K + '" stroke-width="3"/><path d="M-6,-44 L6,-44 L6,-22 C22,-14 26,0 26,10 C26,30 12,40 0,40 C-12,40 -26,30 -26,10 C-26,0 -22,-14 -6,-22 Z" fill="#fff" fill-opacity=".15"/><rect x="-9" y="-52" width="18" height="10" rx="3" fill="#a8743f" stroke="' + K + '" stroke-width="2"/></g>' +
    '<g class="rg-ok" opacity="0">' + emo(52, 196, 30, '✅') + '</g>' +
    /* le chaudron */
    '<g transform="translate(184,258)"><path d="M-14,62 L-24,84 M14,62 L24,84" stroke="' + K + '" stroke-width="6"/><path d="M-62,0 C-64,44 -40,70 0,70 C40,70 64,44 62,0 Z" fill="#3a3550" stroke="' + K + '" stroke-width="4"/><ellipse rx="64" ry="15" fill="#3a3550" stroke="' + K + '" stroke-width="4"/><ellipse class="rg-liq" rx="54" ry="10" fill="' + EAU + '"/>' +
      '<g class="rg-bul" opacity="0"><circle cx="-20" cy="-2" r="5" fill="#fff" opacity=".6"/><circle cx="14" cy="2" r="4" fill="#fff" opacity=".6"/></g></g>' +
    '<circle class="rg-gtt" r="8" stroke="' + K + '" stroke-width="2" opacity="0"/>' +
    '<g transform="translate(90,388)"><rect x="-58" y="-20" width="116" height="40" rx="20" fill="#eef0ff" fill-opacity=".16"/><text x="0" y="1" font-size="16" font-weight="700" fill="#eef0ff" text-anchor="middle" dominant-baseline="central">♻️ Vider</text></g>' +
    '<g class="rg-gout" transform="translate(214,388)"><rect x="-66" y="-22" width="132" height="44" rx="22" fill="#f5b945" stroke="' + K + '" stroke-width="2.5"/><text x="0" y="1" font-size="17" font-weight="800" fill="#35281b" text-anchor="middle" dominant-baseline="central">👅 Goûter</text></g>');
  var liq = $(svg, '.rg-liq'), gtt = $(svg, '.rg-gtt'), ok = $(svg, '.rg-ok'), bul = $(svg, '.rg-bul'), gout = $(svg, '.rg-gout');
  var main = mainAuto($(svg, '.rg-main'), [[0, 262, 300, 0], [.6, 262, 300, 0], [1.0, POTS[0].x, 96, 1], [1.15, POTS[0].x, 96, 0], [2.0, POTS[2].x + 20, 160, 0], [2.4, POTS[2].x, 96, 1], [2.55, POTS[2].x, 96, 0], [3.6, 230, 340, 0], [4.0, 214, 392, 1], [4.2, 214, 392, 0], [5.0, 262, 300, 0], [P, 262, 300, 0]], [1.0, 2.4, 4.0]);
  function goutte(t, t0, p){
    var u = (t - t0) / .6; if(u <= 0 || u >= 1) return false;
    gtt.setAttribute('fill', p.c); vis(gtt, 1); pose(gtt, mix(p.x, 184, u), mix(110, 254, u * u)); return true;
  }
  return boucle(el, P, function(t){
    if(!goutte(t, 1.1, POTS[0]) && !goutte(t, 2.5, POTS[2])) vis(gtt, 0);
    var c = EAU;
    if(t > 1.7) c = mixC(EAU, POTS[0].c, entre(t, 1.7, 1.9));
    if(t > 3.1) c = mixC(POTS[0].c, CIBLE, entre(t, 3.1, 3.4));
    if(t > 7.2) c = mixC(CIBLE, EAU, entre(t, 7.2, 7.8));
    liq.setAttribute('fill', c);
    vis(ok, entre(t, 4.3, 4.6) * (1 - entre(t, 6.9, 7.2)));
    vis(bul, t > 4.2 && t < 7 ? .5 + .5 * Math.sin(t * 9) : 0);
    gout.setAttribute('transform', 'translate(214,' + (t > 4 && t < 4.2 ? 391 : 388) + ')');
    main(t);
  }, 4.1);
});

/* CHAUDRON (règle du 4 novembre, 11 h 26) : la main touche le tas de bois (une bûche vole
   dans le feu, la barre de la jauge monte), puis touille (la barre redescend, et continue
   un peu quand la main s'arrête : l'inertie) ; un carré de couleur arrive dans la zone de
   la frise et y attend (une petite flèche le montre) ; la main touche la caisse de la même
   couleur : l'ingrédient vole dans la marmite. Le petit + du bois pulse quand le feu baisse. */
D('chaudron', function(el){
  /* la palette et les motifs du chaudron (mj-chaudron.js) : les mêmes que dans le jeu */
  var TC = MJ.TYPES && MJ.TYPES.chaudron, KS = ['eau', 'miel', 'baies', 'champignon', 'trefle'];
  var CC = KS.map(function(k){ return TC && TC.codes && TC.codes[k] ? TC.codes[k].c : '#888'; });
  function MO(k, x, y, s){ return TC && TC.motif ? TC.motif(k, 'x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '"') : ''; }
  var P = 11.5, CX = 150, RY = 182, ING = ['💧', '🍯', '🫐', '🍄', '☘️'], CIBLE = 2;
  var XE = [34, 92, 150, 208, 266], YE = 384, BU = [40, 300], ZX = 66, ZW = 168, GX = 276, GY0 = 300, GH = 196;   /* la zone : 60 % de la frise, au milieu */
  var th0 = -.55;
  function bout(th){ return {bx:CX + 32 * Math.cos(th), by:RY + 7 * Math.sin(th), hx:CX + 50 * Math.cos(th), hy:126 + 9 * Math.sin(th)}; }
  /* la louche tourne entre 3,3 et 4,9 s */
  function th(t){ return th0 - Math.PI * 4 * Math.max(0, Math.min(1, (t - 3.3) / 1.6)); }
  var b0 = bout(th0);
  /* la main : le tas de bois (0,9 s), la louche (3,3 → 4,9 s), la caisse (7,7 s) */
  var hors = piste([[0, 262, 250, 0], [.7, BU[0] + 30, BU[1] - 24, 0], [.9, BU[0] + 30, BU[1] - 24, 1], [1.08, BU[0] + 30, BU[1] - 24, 0], [2.7, 230, 200, 0], [3.25, b0.hx, b0.hy, 0]]);
  var apres = piste([[4.9, b0.hx, b0.hy, 0], [5.6, 262, 250, 0], [7.25, XE[CIBLE] + 4, YE - 30, 0], [7.6, XE[CIBLE], YE - 4, 1], [7.8, XE[CIBLE], YE - 4, 0], [8.7, 262, 250, 0], [P, 262, 250, 0]]);
  var flammes = '<path d="M0,0 C-16,-6 -14,-26 -4,-40 C-4,-28 4,-26 6,-34 C18,-22 18,-4 0,0 Z" fill="#f5b945" stroke="#e8693c" stroke-width="3"/>';
  var buche = function(x, y, r){ return '<g transform="translate(' + x + ',' + y + ') rotate(' + r + ')"><rect x="-17" y="-5.5" width="34" height="11" rx="5.5" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/><ellipse cx="17" cy="0" rx="3.8" ry="5.5" fill="#d9a066" stroke="' + K + '" stroke-width="1.5"/></g>'; };
  var id = uid('rgch');
  var svg = svgDemo(el,
    '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2148"/><stop offset="1" stop-color="#1a1430"/></linearGradient>' +
    '<linearGradient id="' + id + 'g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8b52e0"/><stop offset=".25" stop-color="#3f86f0"/><stop offset=".5" stop-color="#3fcf6a"/><stop offset=".72" stop-color="#ffd23f"/><stop offset=".88" stop-color="#f04a35"/><stop offset="1" stop-color="#ff2410"/></linearGradient>' +
    '<clipPath id="' + id + 'c"><rect x="10" y="12" width="280" height="50" rx="11"/></clipPath></defs>' +
    '<rect width="300" height="420" fill="url(#' + id + 'f)"/>' +
    /* la frise et sa zone 🍲 */
    '<rect x="10" y="12" width="280" height="50" rx="11" fill="#2a1d14" stroke="#24182e" stroke-width="3"/>' +
    '<rect class="rg-zone" x="' + ZX + '" y="15" width="' + ZW + '" height="44" rx="9" fill="#ffd36a" fill-opacity=".12" stroke="#ffd36a" stroke-width="2.5" stroke-dasharray="6 4"/>' +
    emo(ZX + 9, 23, 11, '🍲') +
    '<g clip-path="url(#' + id + 'c)"><g class="rg-carre"><rect class="rg-carre-r" x="0" y="27" width="30" height="30" rx="7" fill="#7a7590" stroke="' + K + '" stroke-width="2.5"/></g>' +
      '<g class="rg-carre2"><rect x="0" y="27" width="30" height="30" rx="7" fill="#7a7590" stroke="' + K + '" stroke-width="2.5"/></g></g>' +
    '<path class="rg-fl" d="M-8,0 L8,0 L0,10 Z" fill="#ffd36a" stroke="' + K + '" stroke-width="1.5"/>' +
    /* la carte de la recette (version simple) : 2 💧 › 1 🍯 › 3 🫐 › 🧪, chaque ingrédient avec sa pastille de couleur */
    [[2, 0, 10], [1, 1, 82], [3, 2, 154]].map(function(r){
      return '<g class="rg-rec' + r[1] + '"><rect x="' + r[2] + '" y="67" width="62" height="24" rx="12" fill="rgba(0,0,0,.4)" stroke="' + CC[r[1]] + '" stroke-width="2"/>' +
        '<text x="' + (r[2] + 11) + '" y="80" font-size="14" font-weight="800" fill="#ffe3a3" text-anchor="middle" dominant-baseline="central">' + r[0] + '</text>' +
        '<circle cx="' + (r[2] + 28) + '" cy="79" r="7" fill="' + CC[r[1]] + '" stroke="' + K + '" stroke-width="2"/>' + emo(r[2] + 47, 80, 14, ING[r[1]]) +
        (r[1] < 2 ? '<text x="' + (r[2] + 67) + '" y="80" font-size="13" font-weight="900" fill="#ffe3a3" text-anchor="middle" dominant-baseline="central">›</text>' : '') + '</g>';
    }).join('') +
    '<text x="223" y="80" font-size="13" font-weight="900" fill="#ffe3a3" text-anchor="middle" dominant-baseline="central">›</text>' +
    '<rect x="229" y="67" width="30" height="24" rx="12" fill="rgba(0,0,0,.4)" stroke="#ffd36a" stroke-width="1.5"/>' + emo(244, 80, 13, '🧪') +
    /* la jauge : en haut ça explose, en bas ça gèle ; la bande verte au milieu */
    emo(GX + 8, GY0 - GH - 12, 14, '🌋') + emo(GX + 8, GY0 + 14, 14, '🧊') +
    '<rect x="' + GX + '" y="' + (GY0 - GH) + '" width="16" height="' + GH + '" rx="8" fill="url(#' + id + 'g)" stroke="' + K + '" stroke-width="3"/>' +
    '<rect class="rg-curseur" x="' + (GX - 6) + '" y="0" width="28" height="7" rx="3.5" fill="#fff" stroke="' + K + '" stroke-width="2"/>' +
    /* le tas de bois et son + */
    '<g>' + buche(BU[0], BU[1] + 26, 0) + buche(BU[0], BU[1] + 13, 0) + buche(BU[0], BU[1], 0) +
      '<g class="rg-plus"><circle cx="' + (BU[0] + 26) + '" cy="' + (BU[1] - 22) + '" r="16" fill="#ffd36a" opacity="0" class="rg-plus-halo"/><circle cx="' + (BU[0] + 26) + '" cy="' + (BU[1] - 22) + '" r="11" fill="#5fcf86" stroke="' + K + '" stroke-width="2"/><path d="M' + (BU[0] + 20) + ',' + (BU[1] - 22) + ' H' + (BU[0] + 32) + ' M' + (BU[0] + 26) + ',' + (BU[1] - 28) + ' V' + (BU[1] - 16) + '" stroke="' + K + '" stroke-width="2.5"/></g></g>' +
    '<ellipse class="rg-lueur" cx="150" cy="262" rx="64" ry="18" fill="#f5b945" opacity=".25"/>' +
    '<g class="rg-feu" transform="translate(150,282)"><g transform="translate(-22,0)">' + flammes + '</g><g transform="translate(22,0) scale(.85)">' + flammes + '</g><g transform="scale(1.15)">' + flammes + '</g></g>' +
    buche(135, 289, 18) + buche(165, 289, -18) +
    '<g class="rg-marmite"><path d="M84,' + RY + ' C82,226 104,252 150,252 C196,252 218,226 216,' + RY + ' Z" fill="#3a3550" stroke="' + K + '" stroke-width="4"/>' +
    '<ellipse cx="150" cy="' + RY + '" rx="66" ry="16" fill="#3a3550" stroke="' + K + '" stroke-width="4"/>' +
    '<ellipse class="rg-potion" cx="150" cy="' + RY + '" rx="56" ry="11" fill="#5fcf86"/>' +
    '<g class="rg-bulles"><circle cx="130" cy="' + (RY - 2) + '" r="3" fill="#fff" opacity=".5"/><circle cx="168" cy="' + (RY + 2) + '" r="2.4" fill="#fff" opacity=".5"/></g>' +
    '<g class="rg-ronds" opacity="0"><ellipse cx="150" cy="' + RY + '" rx="20" ry="5" fill="none" stroke="#fff" stroke-width="2.5"/><ellipse cx="150" cy="' + RY + '" rx="34" ry="8" fill="none" stroke="#fff" stroke-width="2"/></g>' +
    '<g class="rg-louche"><path d="" stroke="' + K + '" stroke-width="11" stroke-linecap="round"/><path d="" stroke="#c08a4a" stroke-width="6" stroke-linecap="round"/><ellipse rx="10" ry="5" fill="#c08a4a" stroke="' + K + '" stroke-width="2.5"/></g></g>' +
    '<g class="rg-fleche" opacity="0"><path d="M220,150 C200,124 100,124 80,150" stroke="#5ab8ff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M76,156 L89,150 L77,142 Z" fill="#5ab8ff"/></g>' +
    /* les caisses : chacune avec la bande de sa couleur */
    '<rect x="6" y="408" width="288" height="8" rx="3" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/>' +
    ING.map(function(ic, i){ return '<g class="e' + i + '"><rect x="' + (XE[i] - 25) + '" y="' + (YE - 24) + '" width="50" height="48" rx="9" fill="#c08a4a" stroke="' + K + '" stroke-width="2.5"/>' +
      '<rect x="' + (XE[i] - 19) + '" y="' + (YE - 14) + '" width="38" height="30" rx="4" fill="#f3e4c2" stroke="#5a4630" stroke-width="1.5"/>' + emo(XE[i], YE + 1, 20, ic) + '</g>'; }).join('') +
    emo(0, 0, 24, ING[CIBLE], 'rg-vol') +
    '<g class="rg-bvol" opacity="0">' + buche(0, 0, 0) + '</g>');
  var louche = $(svg, '.rg-louche'), potion = $(svg, '.rg-potion'), fleche = $(svg, '.rg-fleche'), feu = $(svg, '.rg-feu'), lueur = $(svg, '.rg-lueur');
  var carre = $(svg, '.rg-carre'), carre2 = $(svg, '.rg-carre2'), zone = $(svg, '.rg-zone'), fl = $(svg, '.rg-fl'), curseur = $(svg, '.rg-curseur');
  var vol = $(svg, '.rg-vol'), bvol = $(svg, '.rg-bvol'), ronds = $(svg, '.rg-ronds'), plus = $(svg, '.rg-plus'), halo = $(svg, '.rg-plus-halo');
  var eCible = $(svg, '.e' + CIBLE), gMain = $(svg, '.rg-main'), bulles = $(svg, '.rg-bulles'), carreR = $(svg, '.rg-carre-r');
  var XS = ZX + ZW / 2 - 15;   /* le carré s'arrête au milieu de la zone */
  return boucle(el, P, function(t){
    var a = th(t), b = bout(a), dl = 'M' + f1(b.bx) + ',' + f1(b.by) + ' L' + f1(b.hx) + ',' + f1(b.hy);
    louche.children[0].setAttribute('d', dl); louche.children[1].setAttribute('d', dl);
    louche.children[2].setAttribute('cx', f1(b.bx)); louche.children[2].setAttribute('cy', f1(b.by));
    var m = t < 3.25 ? hors(t) : (t < 4.9 ? {x:b.hx, y:b.hy, p:true} : apres(t));
    poserMain(gMain, m.x, m.y, m.p, t, [.9, 7.6]);
    /* la barre : monte avec la bûche (1,3 → 3,2 s), redescend en touillant (3,4 → 4,9 s) et continue un peu (inertie, jusqu'à 5,5 s), puis le feu la remet au milieu */
    var c = .5 + .2 * entre(t, 1.3, 3.2) - .27 * entre(t, 3.4, 5.5) + .07 * entre(t, 5.6, 7);
    curseur.setAttribute('y', f1(GY0 - GH * c - 3.5));
    potion.setAttribute('fill', c > .5 ? mixC('#5fcf86', '#e8693c', Math.min(1, (c - .5) / .2)) : mixC('#5fcf86', '#3f86f0', Math.min(1, (.5 - c) / .2)));
    vis(fleche, entre(t, 3.3, 3.6) * (1 - entre(t, 4.8, 5.1)));
    bulles.setAttribute('transform', 'translate(0,' + f1(-Math.abs(Math.sin(t * (3 + 6 * Math.max(0, c - .5)))) * 3) + ')');
    /* la bûche vole du tas au feu */
    var ub = (t - .95) / .5;
    if(ub > 0 && ub < 1){ vis(bvol, 1); pose(bvol, mix(BU[0], 150, ub), mix(BU[1], 286, ub) - 60 * Math.sin(Math.PI * ub), 1, ub * 200); } else vis(bvol, 0);
    var niv = .75 + .45 * entre(t, 1.4, 1.8) - .4 * entre(t, 8.6, 10.6), danse = 1 + .06 * Math.sin(t * 11);
    feu.setAttribute('transform', 'translate(150,282) scale(' + (niv * danse).toFixed(3) + ',' + (niv / danse).toFixed(3) + ')');
    lueur.setAttribute('opacity', (.08 + .3 * Math.max(0, niv - .35)).toFixed(2));
    /* le + du bois pulse quand le feu baisse (au début et à la fin) */
    var pulse = (t < .9 || t > 9.6) ? .5 + .5 * Math.sin(t * 12) : 0;
    vis(halo, pulse * .7);
    plus.setAttribute('transform', pulse ? 'translate(' + (BU[0] + 26) + ',' + (BU[1] - 22) + ') scale(' + (1 + .18 * pulse).toFixed(3) + ') translate(' + (-(BU[0] + 26)) + ',' + (-(BU[1] - 22)) + ')' : '');
    /* le carré de couleur : il arrive (5,4 → 6,8 s), attend dans la zone, puis disparaît quand on verse (7,9 s) */
    var xc = Math.max(XS, 300 - (300 - XS) * entre(t, 5.4, 6.8)), pop = entre(t, 7.85, 8.1);
    pose(carre, xc, 0); vis(carre, (1 - pop) * entre(t, 5.3, 5.5));
    pose(carre2, 300 - 70 * entre(t, 8.3, 11), 0); vis(carre2, entre(t, 8.3, 8.6) * (1 - entre(t, 11.1, 11.4)));
    var dansZ = xc <= ZX + ZW - 4 && t < 7.9;
    carreR.setAttribute('fill', dansZ ? CC[CIBLE] : '#7a7590');   /* gris hors de la zone, sa couleur dans la zone */
    /* sur la recette, l'ingrédient de la même couleur brille pendant que le carré est allumé */
    var rr = $(svg, '.rg-rec' + CIBLE + ' rect'); rr.setAttribute('stroke-width', dansZ ? 4 : 2); rr.setAttribute('stroke', dansZ ? '#ffd36a' : CC[CIBLE]);
    zone.setAttribute('fill-opacity', dansZ ? (.22 + .12 * Math.sin(t * 9)).toFixed(2) : '.12');
    zone.setAttribute('stroke-dasharray', dansZ ? 'none' : '6 4');
    pose(fl, xc + 15, 14 + 2 * Math.abs(Math.sin(t * 6))); vis(fl, t > 5.4 && t < 7.9 ? 1 : 0);
    /* l'ingrédient vole de la caisse à la marmite */
    var ui = (t - 7.7) / .6;
    if(ui > 0 && ui < 1){ vis(vol, 1); vol.setAttribute('x', f1(mix(XE[CIBLE], 150, ui))); vol.setAttribute('y', f1(mix(YE, RY + 4, ui) - 80 * Math.sin(Math.PI * ui))); vol.setAttribute('font-size', f1(24 * (1 - .35 * ui))); }
    else vis(vol, 0);
    eCible.setAttribute('transform', t > 7.6 && t < 7.8 ? 'translate(0,3)' : '');
    var ur = (t - 8.3) / .55, on = ur > 0 && ur < 1;
    vis(ronds, on ? 1 - ur : 0);
    ronds.setAttribute('transform', on ? 'translate(150,' + RY + ') scale(' + (1 + ur * .8).toFixed(2) + ') translate(-150,-' + RY + ')' : '');
  }, 6.9);
});

/* (ancienne démo du chaudron, remplacée le 4 novembre : plus enregistrée) */
function demoChaudronAncienne(el){
  var P = 9.6, CX = 150, RY = 182, V = 140 / 6, ING = ['🌿', '🍄', '🫐', '🍯', '🪻'], CIBLE = 1, XE = [34, 92, 150, 208, 266], YE = 388, BU = [38, 290];
  var th0 = -.55;
  function bout(th){ return {bx:CX + 32 * Math.cos(th), by:RY + 7 * Math.sin(th), hx:CX + 50 * Math.cos(th), hy:126 + 9 * Math.sin(th)}; }
  function th(t){ return th0 + Math.PI * 4 * Math.max(0, Math.min(1, (t - .55) / 2.65)); }
  var b0 = bout(th0);
  var hors = piste([[0, 262, 250, 0], [3.25, b0.hx, b0.hy, 0], [3.8, BU[0] + 2, BU[1] - 12, 1], [3.98, BU[0] + 2, BU[1] - 12, 0], [4.9, 266, 236, 0], [6.0, 266, 236, 0], [6.42, XE[CIBLE], YE - 4, 1], [6.62, XE[CIBLE], YE - 4, 0], [7.6, 262, 250, 0], [P, 262, 250, 0]]);
  var depart = piste([[0, 262, 250, 0], [.5, b0.hx, b0.hy, 1]]);
  var flammes = '<path d="M0,0 C-16,-6 -14,-26 -4,-40 C-4,-28 4,-26 6,-34 C18,-22 18,-4 0,0 Z" fill="#f5b945" stroke="#e8693c" stroke-width="3"/>';
  var buche = function(x, y, r){ return '<g transform="translate(' + x + ',' + y + ') rotate(' + r + ')"><rect x="-17" y="-5.5" width="34" height="11" rx="5.5" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/><ellipse cx="17" cy="0" rx="3.8" ry="5.5" fill="#d9a066" stroke="' + K + '" stroke-width="1.5"/></g>'; };
  var id = uid('rgch');
  var svg = svgDemo(el,
    '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2148"/><stop offset="1" stop-color="#1a1430"/></linearGradient>' +
    '<clipPath id="' + id + 'c"><rect x="10" y="12" width="280" height="44" rx="11"/></clipPath></defs>' +
    '<rect width="300" height="420" fill="url(#' + id + 'f)"/>' +
    '<rect x="10" y="12" width="280" height="44" rx="11" fill="#1d1730" stroke="#3b4679" stroke-width="2"/>' +
    '<rect class="rg-rep" x="127" y="13" width="46" height="42" rx="9" fill="#ffe3a3" fill-opacity="0" stroke="#ffe3a3" stroke-width="2.5"/>' +
    '<g clip-path="url(#' + id + 'c)"><g class="rg-frise">' + emo(0, 35, 28, ING[CIBLE], 'f0') + emo(0, 35, 28, '🫐', 'f1') + '</g></g>' +
    '<g transform="translate(150,70)"><path d="M-10,-3 C-11,7 -6,11 0,11 C6,11 11,7 10,-3 Z" fill="#3a3550" stroke="#ffe3a3" stroke-width="2"/><path d="M-7,-8 L0,-14 L7,-8 Z" fill="#ffe3a3"/></g>' +
    '<g>' + buche(BU[0], BU[1] + 26, 0) + buche(BU[0], BU[1] + 13, 0) + buche(BU[0], BU[1], 0) + '<circle cx="' + (BU[0] + 22) + '" cy="' + (BU[1] - 14) + '" r="10" fill="#5fcf86" stroke="' + K + '" stroke-width="2"/><path d="M' + (BU[0] + 16) + ',' + (BU[1] - 14) + ' H' + (BU[0] + 28) + ' M' + (BU[0] + 22) + ',' + (BU[1] - 20) + ' V' + (BU[1] - 8) + '" stroke="' + K + '" stroke-width="2.5"/></g>' +
    '<ellipse class="rg-lueur" cx="150" cy="262" rx="64" ry="18" fill="#f5b945" opacity=".25"/>' +
    '<g class="rg-feu" transform="translate(150,282)"><g transform="translate(-22,0)">' + flammes + '</g><g transform="translate(22,0) scale(.85)">' + flammes + '</g><g transform="scale(1.15)">' + flammes + '</g></g>' +
    buche(135, 289, 18) + buche(165, 289, -18) +
    '<path d="M84,' + RY + ' C82,226 104,252 150,252 C196,252 218,226 216,' + RY + ' Z" fill="#3a3550" stroke="' + K + '" stroke-width="4"/>' +
    '<ellipse cx="150" cy="' + RY + '" rx="66" ry="16" fill="#3a3550" stroke="' + K + '" stroke-width="4"/>' +
    '<ellipse class="rg-potion" cx="150" cy="' + RY + '" rx="56" ry="11" fill="#5fcf86"/>' +
    '<g class="rg-bulles"><circle cx="130" cy="' + (RY - 2) + '" r="3" fill="#fff" opacity=".5"/><circle cx="168" cy="' + (RY + 2) + '" r="2.4" fill="#fff" opacity=".5"/></g>' +
    '<g class="rg-ronds" opacity="0"><ellipse cx="150" cy="' + RY + '" rx="20" ry="5" fill="none" stroke="#fff" stroke-width="2.5"/><ellipse cx="150" cy="' + RY + '" rx="34" ry="8" fill="none" stroke="#fff" stroke-width="2"/></g>' +
    '<g class="rg-louche"><path d="" stroke="' + K + '" stroke-width="11" stroke-linecap="round"/><path d="" stroke="#c08a4a" stroke-width="6" stroke-linecap="round"/><ellipse rx="10" ry="5" fill="#c08a4a" stroke="' + K + '" stroke-width="2.5"/></g>' +
    '<g class="rg-fleche" opacity="0"><path d="M80,154 C100,128 200,128 220,154" stroke="#e8693c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M224,160 L211,154 L223,146 Z" fill="#e8693c"/></g>' +
    '<rect x="6" y="406" width="288" height="8" rx="3" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/>' +
    ING.map(function(ic, i){ return '<circle cx="' + XE[i] + '" cy="' + YE + '" r="22" fill="#eef0ff" fill-opacity=".1" stroke="#a6aed8" stroke-opacity=".4" stroke-width="1.5"/>' + emo(XE[i], YE, 26, ic, 'e' + i); }).join('') +
    emo(0, 0, 26, ING[CIBLE], 'rg-vol') +
    '<g class="rg-bvol" opacity="0">' + buche(0, 0, 0) + '</g>');
  var louche = $(svg, '.rg-louche'), potion = $(svg, '.rg-potion'), fleche = $(svg, '.rg-fleche'), feu = $(svg, '.rg-feu'), lueur = $(svg, '.rg-lueur');
  var f0 = $(svg, '.f0'), fx1 = $(svg, '.f1'), frise = $(svg, '.rg-frise'), rep = $(svg, '.rg-rep'), vol = $(svg, '.rg-vol'), bvol = $(svg, '.rg-bvol'), ronds = $(svg, '.rg-ronds');
  var eCible = $(svg, '.e' + CIBLE), gMain = $(svg, '.rg-main'), bulles = $(svg, '.rg-bulles');
  return boucle(el, P, function(t){
    var a = th(t), b = bout(a), dl = 'M' + f1(b.bx) + ',' + f1(b.by) + ' L' + f1(b.hx) + ',' + f1(b.hy);
    louche.children[0].setAttribute('d', dl); louche.children[1].setAttribute('d', dl);
    louche.children[2].setAttribute('cx', f1(b.bx)); louche.children[2].setAttribute('cy', f1(b.by));
    var m = t < .5 ? depart(t) : (t < 3.2 ? {x:b.hx, y:b.hy, p:true} : hors(t));
    poserMain(gMain, m.x, m.y, m.p, t, [3.8, 6.42]);
    var chaud = entre(t, .6, 3.1) * (1 - entre(t, 8.6, 9.5));
    potion.setAttribute('fill', mixC('#5fcf86', '#e8693c', chaud));
    vis(fleche, entre(t, .5, .9) * (1 - entre(t, 3.1, 3.5)));
    bulles.setAttribute('transform', 'translate(0,' + f1(-Math.abs(Math.sin(t * 3)) * 3) + ')');
    var ub = (t - 3.9) / .6;
    if(ub > 0 && ub < 1){ vis(bvol, 1); pose(bvol, mix(BU[0], 150, ub), mix(BU[1], 286, ub) - 70 * Math.sin(Math.PI * ub), 1, ub * 200); } else vis(bvol, 0);
    var niv = .8 + .45 * entre(t, 4.45, 4.9) * (1 - entre(t, 8.8, 9.5)), danse = 1 + .06 * Math.sin(t * 11);
    feu.setAttribute('transform', 'translate(150,282) scale(' + (niv * danse).toFixed(3) + ',' + (niv / danse).toFixed(3) + ')');
    lueur.setAttribute('opacity', (.12 + .3 * (niv - .8) / .45).toFixed(2));
    f0.setAttribute('x', f1(Math.max(150, 290 - V * t))); fx1.setAttribute('x', f1(410 - V * t));
    var pop = entre(t, 7.05, 7.35);
    vis(f0, 1 - pop); f0.setAttribute('font-size', f1(28 * (1 + .5 * pop)));
    vis(frise, entre(t, 0, .3) * (1 - entre(t, 9.2, 9.55)));
    var attend = t > 5.95 && t < 7.1;
    rep.setAttribute('fill-opacity', attend ? (.2 + .15 * Math.sin(t * 9)).toFixed(2) : 0);
    rep.setAttribute('stroke-width', attend ? 4 : 2.5);
    var ui = (t - 6.5) / .6;
    if(ui > 0 && ui < 1){ vis(vol, 1); vol.setAttribute('x', f1(mix(XE[CIBLE], 150, ui))); vol.setAttribute('y', f1(mix(YE, RY + 4, ui) - 80 * Math.sin(Math.PI * ui))); vol.setAttribute('font-size', f1(26 * (1 - .35 * ui))); }
    else vis(vol, 0);
    eCible.setAttribute('transform', t > 6.42 && t < 6.62 ? 'translate(0,3)' : '');
    var ur = (t - 7.1) / .55, on = ur > 0 && ur < 1;
    vis(ronds, on ? 1 - ur : 0);
    ronds.setAttribute('transform', on ? 'translate(150,' + RY + ') scale(' + (1 + ur * .8).toFixed(2) + ') translate(-150,-' + RY + ')' : '');
  }, 1.7);
}
void demoChaudronAncienne;

/* LES 7 DIFFÉRENCES — deux étagères l'une sous l'autre ; la main touche une
   différence en bas : elle s'entoure sur les deux images. Puis une autre. */
D('differences', function(el){
  var P = 7;
  function image(y0, diff){
    var champ = diff ? '#3fcf6a' : '#e5484d', fiole = diff ? '#9d6ee3' : '#3fa9ff';
    return '<g transform="translate(16,' + y0 + ')"><rect width="268" height="184" rx="10" fill="#2f4a3a" stroke="#d29a5e" stroke-width="4"/>' +
      '<rect x="10" y="74" width="248" height="9" rx="3" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/><rect x="10" y="156" width="248" height="9" rx="3" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/>' +
      /* étagère du haut : fiole, bougie, livres */
      '<g transform="translate(52,74)"><path d="M-5,-46 L5,-46 L5,-32 C16,-26 18,-16 18,-10 C18,-2 10,0 0,0 C-10,0 -18,-2 -18,-10 C-18,-16 -16,-26 -5,-32 Z" fill="' + fiole + '" stroke="' + K + '" stroke-width="3"/><rect x="-7" y="-52" width="14" height="7" rx="2" fill="#a8743f" stroke="' + K + '" stroke-width="2"/></g>' +
      '<g transform="translate(134,74)"><rect x="-8" y="-34" width="16" height="34" rx="3" fill="#f3e7cb" stroke="' + K + '" stroke-width="2.5"/>' + (diff ? '' : '<path d="M0,-50 C-7,-42 -6,-36 0,-35 C6,-36 7,-42 0,-50 Z" fill="#f5b945" stroke="#e8693c" stroke-width="2"/>') + '</g>' +
      '<g transform="translate(206,74)"><rect x="-26" y="-14" width="52" height="14" rx="2" fill="#9d6ee3" stroke="' + K + '" stroke-width="2"/><rect x="-22" y="-28" width="44" height="14" rx="2" fill="#5fcf86" stroke="' + K + '" stroke-width="2"/></g>' +
      /* étagère du bas : champignon, pot de fleur, sac */
      '<g transform="translate(60,156)"><rect x="-6" y="-22" width="12" height="22" rx="4" fill="#f3e7cb" stroke="' + K + '" stroke-width="2.5"/><path d="M-26,-20 C-24,-44 24,-44 26,-20 Z" fill="' + champ + '" stroke="' + K + '" stroke-width="3"/><circle cx="-10" cy="-30" r="4" fill="#fff"/><circle cx="8" cy="-34" r="3.5" fill="#fff"/></g>' +
      '<g transform="translate(144,156)"><path d="M-16,-26 L16,-26 L12,0 L-12,0 Z" fill="#c96a3a" stroke="' + K + '" stroke-width="2.5"/><path d="M0,-26 C-4,-44 -18,-48 -20,-40 M0,-26 C4,-46 18,-50 20,-40 M0,-26 L0,-50" stroke="#3c9a62" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      '<g transform="translate(214,156)"><path d="M-20,0 C-26,-30 26,-30 20,0 Z" fill="#b48a62" stroke="' + K + '" stroke-width="2.5"/><path d="M-10,-24 L10,-24" stroke="' + K + '" stroke-width="3"/></g>' +
      '</g>';
  }
  var ann = function(x, y, cls){ return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="30" fill="none" stroke="#ffe3a3" stroke-width="5" opacity="0"/>'; };
  var svg = svgDemo(el, '<rect width="300" height="420" fill="#1c2447"/>' + image(16, false) + image(220, true) +
    ann(76, 16 + 128, 'a0') + ann(76, 220 + 128, 'a0') + ann(150, 16 + 40, 'a1') + ann(150, 220 + 40, 'a1'));
  var a0 = $$(svg, '.a0'), a1 = $$(svg, '.a1');
  var main = mainAuto($(svg, '.rg-main'), [[0, 262, 404, 0], [.7, 262, 404, 0], [1.2, 76, 220 + 132, 1], [1.35, 76, 220 + 132, 0], [2.4, 210, 330, 0], [3.0, 150, 220 + 46, 1], [3.15, 150, 220 + 46, 0], [4.0, 262, 404, 0], [P, 262, 404, 0]], [1.2, 3.0]);
  return boucle(el, P, function(t){
    var fin = 1 - entre(t, 6.2, 6.7);
    a0.forEach(function(c){ vis(c, entre(t, 1.25, 1.45) * fin); c.setAttribute('r', f1(30 + 10 * bosse(t, 1.25, .4))); });
    a1.forEach(function(c){ vis(c, entre(t, 3.05, 3.25) * fin); c.setAttribute('r', f1(30 + 10 * bosse(t, 3.05, .4))); });
    main(t);
  }, 3.3);
});

/* LE DOUBLE — deux cartes l'une sous l'autre : un seul dessin est sur les deux.
   La main le touche sur sa carte : ta carte monte sur la pile, une autre arrive. */
D('double', function(el){
  var P = 7.4, Y1 = 112, Y2 = 312, POS = [[0, -50], [48, -14], [30, 42], [-30, 44], [-48, -12]];
  var CARTES = [['🍎', '🌙', '🔑', '🔥', '🍄'], ['⭐', '🔑', '🍃', '💧', '🐸'], ['🌻', '🦉', '💧', '🎃', '🪶']];
  var COMMUN = [[2, 1], [3, 2]];
  var carte = function(i, cls){ return '<g class="' + cls + '"><circle r="96" fill="' + (i === 0 ? '#f6ecd2' : '#fbf8ff') + '" stroke="' + K + '" stroke-width="5"/><circle r="86" fill="none" stroke="' + (i === 0 ? '#d29a5e' : '#b48cff') + '" stroke-width="3"/>' +
    CARTES[i].map(function(ic, k){ return '<g class="s' + k + '" transform="translate(' + POS[k][0] + ',' + POS[k][1] + ')"><circle r="24" fill="#ffe3a3" opacity="0"/>' + emo(0, 2, 34, ic) + '</g>'; }).join('') + '</g>'; };
  var svg = svgDemo(el, '<rect width="300" height="420" fill="#4a3424"/><rect x="10" y="10" width="280" height="400" rx="24" fill="#5a3a22" opacity=".6"/>' + carte(0, 'c0') + carte(1, 'c1') + carte(2, 'c2'));
  var c = [$(svg, '.c0'), $(svg, '.c1'), $(svg, '.c2')];
  function halo(g, k, v){ var n = g.querySelector('.s' + k + ' circle'); vis(n, v); }
  var p1 = [150 + POS[1][0], Y2 + POS[1][1] + 4], p2 = [150 + POS[2][0], Y2 + POS[2][1] + 4];
  var main = mainAuto($(svg, '.rg-main'), [[0, 262, 404, 0], [.7, 262, 404, 0], [1.25, p1[0], p1[1], 1], [1.4, p1[0], p1[1], 0], [2.1, 262, 404, 0], [3.8, 262, 404, 0], [4.35, p2[0], p2[1], 1], [4.5, p2[0], p2[1], 0], [5.2, 262, 404, 0], [P, 262, 404, 0]], [1.25, 4.35]);
  return boucle(el, P, function(t){
    var m1 = entre(t, 2.0, 2.6), m2 = entre(t, 2.6, 3.1), m3 = entre(t, 5.1, 5.7), fin = entre(t, 6.7, 7.3);
    pose(c[0], 150, Y1); vis(c[0], 1);
    pose(c[1], 150, mix(Y2, Y1, m1)); vis(c[1], 1 - fin);
    pose(c[2], 150, mix(mix(560, Y2, m2), Y1, m3)); vis(c[2], 1 - fin);
    var h1 = t > 1.3 && t < 2.6 ? .8 : 0, h2 = t > 4.4 && t < 5.7 ? .8 : 0;
    halo(c[0], COMMUN[0][0], h1); halo(c[1], COMMUN[0][1], h1);
    halo(c[1], COMMUN[1][0], h2); halo(c[2], COMMUN[1][1], h2);
    main(t);
  }, 1.5);
});

/* LE GRAND MÉNAGE DU LABO — la main écrase le cafard (bocal rouge ☠), puis
   glisse la coccinelle (bocal vert ✔) dans son bocal. */
D('insectes', function(el){
  var P = 7;
  var CAFARD = '<g><path d="M-8,-4 l-9,-6 M-8,4 l-10,5 M0,-6 l-2,-11 M0,6 l-2,11 M8,-5 l8,-8 M8,5 l8,8" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round" class="pattes"/><ellipse rx="16" ry="10" fill="#6b4226" stroke="' + K + '" stroke-width="2.5"/><path d="M-12,0 H12" stroke="#3b2414" stroke-width="2"/><ellipse cx="17" cy="0" rx="6" ry="6" fill="#3b2414" stroke="' + K + '" stroke-width="2"/><path d="M21,-3 q12,-10 18,-6 M21,3 q12,10 18,6" stroke="' + K + '" stroke-width="1.8" fill="none"/></g>';
  var COCCI = '<g><path d="M-6,-6 l-6,-6 M-6,6 l-6,6 M0,-9 l0,-7 M0,9 l0,7 M6,-6 l6,-6 M6,6 l6,6" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round" class="pattes"/><circle r="13" fill="#e5484d" stroke="' + K + '" stroke-width="2.5"/><path d="M-13,0 H13" stroke="' + K + '" stroke-width="2"/><circle cx="-5" cy="-6" r="2.6" fill="' + K + '"/><circle cx="6" cy="-5" r="2.6" fill="' + K + '"/><circle cx="-4" cy="6" r="2.6" fill="' + K + '"/><circle cx="6" cy="6" r="2.4" fill="' + K + '"/><circle cx="15" cy="0" r="6" fill="' + K + '"/></g>';
  var bocal = function(x, bon){ var c = bon ? '#2f9e44' : '#c0392b'; return '<g transform="translate(' + x + ',356)"><rect x="-46" y="-34" width="92" height="74" rx="14" fill="#cfe8ff" fill-opacity=".16" stroke="' + c + '" stroke-width="4"/><rect x="-40" y="-44" width="80" height="12" rx="4" fill="#8a5a33" stroke="' + K + '" stroke-width="2"/>' +
    '<g transform="translate(0,6) scale(.8)" opacity=".85">' + (bon ? COCCI : CAFARD) + '</g><rect x="-34" y="24" width="68" height="14" rx="4" fill="' + c + '"/><text x="0" y="32" font-size="12" fill="#fff" font-weight="700" text-anchor="middle" dominant-baseline="central">' + (bon ? '✔' : '☠') + '</text></g>'; };
  var svg = svgDemo(el,
    '<rect width="300" height="420" fill="#3e2f5f"/><path d="M110,20 C110,-10 190,-10 190,20 L190,80 L110,80 Z" fill="#1c2447" stroke="#5a4a8a" stroke-width="4"/><circle cx="168" cy="34" r="10" fill="#fff4d0" opacity=".9"/>' +
    '<rect y="104" width="300" height="190" fill="#8a5634"/><path d="M0,104 H300" stroke="#62381d" stroke-width="5"/><g stroke="#7a4a2a" stroke-width="2" opacity=".6"><path d="M0,164 H300 M0,224 H300 M100,104 V164 M200,164 V224 M60,224 V294 M230,224 V294"/></g>' +
    '<rect y="294" width="300" height="126" fill="#2b2148"/>' +
    '<g class="rg-jus" opacity="0"><path d="M0,-26 C14,-30 20,-14 30,-12 C40,-8 34,8 24,10 C30,24 12,30 4,22 C-8,32 -22,22 -18,12 C-34,10 -32,-8 -20,-10 C-22,-24 -10,-30 0,-26 Z" fill="#9be15d" stroke="#5aa02c" stroke-width="3"/><circle cx="38" cy="-20" r="5" fill="#9be15d"/><circle cx="-34" cy="22" r="4" fill="#9be15d"/></g>' +
    '<g class="rg-caf">' + CAFARD + '</g><g class="rg-coc">' + COCCI + '</g>' +
    bocal(78, false) + bocal(222, true) + '<g class="rg-et" opacity="0">' + emo(250, 304, 26, '⭐') + '</g>');
  var caf = $(svg, '.rg-caf'), coc = $(svg, '.rg-coc'), jus = $(svg, '.rg-jus'), et = $(svg, '.rg-et'), pattes = $$(svg, '.pattes');
  var main = mainAuto($(svg, '.rg-main'), [[0, 262, 404, 0], [.6, 262, 404, 0], [1.45, 130, 186, 1], [1.6, 130, 186, 0], [2.6, 220, 260, 0], [3.3, 212, 232, 1], [4.4, 222, 352, 1], [4.5, 222, 352, 0], [5.4, 262, 404, 0], [P, 262, 404, 0]], [1.45, 3.3]);
  return boucle(el, P, function(t){
    var w = Math.sin(t * 22) * 6;
    pattes.forEach(function(p){ p.setAttribute('transform', 'rotate(' + f1(w) + ')'); });
    var cx = mix(40, 130, Math.min(1, t / 1.5)), cy = 180 + 6 * Math.sin(t * 4);
    pose(caf, cx, cy, 1.25, 8); vis(caf, t < 1.5 ? entre(t, 0, .2) : 0);
    vis(jus, t > 1.5 && t < 6.4 ? entre(t, 1.5, 1.6) * (1 - entre(t, 6, 6.4)) : 0);
    pose(jus, 132, 184, .6 + .4 * entre(t, 1.5, 1.65));
    var kx, ky, ks = 1.25;
    if(t < 3.3){ kx = mix(262, 212, Math.min(1, t / 3.3)); ky = 232 + 8 * Math.sin(t * 3); }
    else if(t < 4.45){ var u = entre(t, 3.35, 4.4); kx = mix(212, 222, u); ky = mix(228, 348, u); ks = mix(1.25, .9, u); }
    else { kx = 222; ky = 348; ks = .9; }
    pose(coc, kx, ky, ks, t < 3.3 ? 190 : 270); vis(coc, t > 4.45 ? 1 - entre(t, 4.45, 4.8) : entre(t, 0, .3));
    vis(et, bosse(t, 4.5, 1.2));
    main(t);
  }, 1.5);
});

/* ==========================================================
   BARDE
   ========================================================== */
/* REPÉRER LE MENSONGE — le villageois parle ; sur la phrase 2, son visage
   trahit le mensonge (yeux de côté, sourire de travers) : la main touche
   « 🤥 Mensonge ! », la phrase 2 est marquée ; à la fin, « ✔ Valider ». */
D('mensonge', function(el, prm){
  var P = 9.6, qui = (prm && prm.pnj && window.Persos && Persos.PNJ && Persos.PNJ[prm.pnj]) ? prm.pnj : 'fortune';
  var racine = htmlDemo(el, 'rg-mens',
    '<div class="rg-puces"><i class="p0">1</i><i class="p1">2</i><i class="p2">3</i></div>' +
    '<div class="rg-mens-visage">' + villageois(qui, {expressif:true, anime:true}, (prm && prm.ic) || '🤠') + '</div>' +
    '<div class="rg-mens-bulle"><span class="rg-mens-t"></span><span class="rg-lire-faux">🔊</span></div>' +
    '<div class="rg-mens-b">🤥 Mensonge !</div><div class="rg-mens-v">✔ Valider</div>');
  var svgV = $(racine, '.rg-mens-visage svg'), txt = $(racine, '.rg-mens-t'), puces = $$(racine, '.rg-puces i'), bMens = $(racine, '.rg-mens-b'), bVal = $(racine, '.rg-mens-v');
  var PH = ['« Je dors à la taverne. »', '« Cette bague est en or ! »', '« Mon chapeau vient de la ville. »'];
  var EX = {vrai:{sourire:1, bouche:'fermee', vitesse:.22}, parle:{bouche:'parle'}, ment:{regard:'cote-d', ampleur:.85, sourire:'coin', bouche:'fermee', vitesse:.24}, repos:{}};
  var dernier = '', ph = -1;
  function expr(k){ if(k === dernier) return; dernier = k; try{ if(svgV && window.Persos && Persos.expression) Persos.expression(svgV, EX[k]); }catch(e){} }
  var main = mainAuto($(racine, '.rg-main'), [[0, 266, 404, 0], [3.6, 266, 404, 0], [4.25, 150, 362, 1], [4.4, 150, 362, 0], [5.2, 266, 404, 0], [7.0, 266, 404, 0], [7.5, 150, 362, 1], [7.65, 150, 362, 0], [8.4, 266, 404, 0], [P, 266, 404, 0]], [4.25, 7.5]);
  return boucle(el, P, function(t){
    var i = t < 2.6 ? 0 : (t < 5.6 ? 1 : 2);
    if(i !== ph){ ph = i; txt.textContent = PH[i]; }
    var lt = t - [0, 2.6, 5.6][i];
    if(i === 1 && t > 3.4 && t < 4.7) expr('ment');
    else if(lt < .9) expr('parle');
    else expr(i === 1 ? 'repos' : 'vrai');
    puces.forEach(function(p, k){ p.className = 'p' + k + (k === i && t < 6.9 ? ' on' : '') + (k === 1 && t > 4.3 ? ' ment' : '') + (t > 7.55 && t < 9.2 ? ' fini' : ''); });
    bMens.classList.toggle('appuye', t > 4.25 && t < 4.5);
    var val = t > 6.9;
    bMens.style.display = val ? 'none' : ''; bVal.style.display = val ? '' : 'none';
    bVal.classList.toggle('appuye', t > 7.5 && t < 7.75);
    racine.classList.toggle('reussi', t > 7.7 && t < 9.2);
    main(t);
  }, 4.3);
});

/* Le catalogue des mimiques sous la phrase (exception voulue par Romain pour ce jeu) :
   « 🤥 Signes de mensonge » (cadre rouge) et « 🙂 Pas un mensonge » (cadre vert).
   La liste vient du jeu (MJ.TYPES.mensonge.MIMIQUES) ; chaque vignette est le visage du jeu
   (Persos.pnj + Persos.expression) qui refait la mimique en boucle, comme l'écran « 📖 Les signes ».
   Tous les signes du menteur sont montrés (décision de Romain, 3 nov.), sauf ceux que l'équipement enlève. */
var NOMS_MIMIQUES = {
  coin:'Yeux de côté', rougeur:'Front rose', sueur:'Goutte de sueur', force:'Sourire forcé', mordille:'Lèvre mordillée', morsure:'Lèvre mordue', double:'Double clignement',
  pencheD:'Penche à droite', pencheG:'Penche à gauche', lent:'Yeux fermés', reflechit:'Yeux en l\'air', petitSourire:'Petit sourire', grandSourire:'Grand sourire',
  sourireFerme:'Sourire fermé', rieurs:'Yeux rieurs', sourcils:'Sourcils levés', unSourcil:'Un sourcil levé', concentre:'Sourcils froncés', hoche:'Hoche la tête',
  nonTete:'Petit non', pince:'Lèvres pincées', moue:'Fait la moue', mentonHaut:'Menton levé', mentonBas:'Menton baissé', calme:'Sourire calme', surpris:'Yeux étonnés', plisse:'Yeux plissés'
};
DEMOS.mensonge.reserve = 64;
DEMOS.mensonge.extra = function(prm){
  var def = MJ.TYPES.mensonge, M = def && def.MIMIQUES;
  if(!M || !window.Persos || !Persos.pnj || !Persos.expression) return null;
  prm = prm || {};
  var qui = (prm.pnj && Persos.PNJ && Persos.PNJ[prm.pnj]) ? prm.pnj : 'fortune';
  var permis = prm.listeSignes && prm.listeSignes.length ? prm.listeSignes : null;
  var signes = Object.keys(M).filter(function(k){ return M[k].sorte === 'signe' && (!permis || permis.indexOf(k) >= 0); });
  var vraies = Object.keys(M).filter(function(k){ return M[k].sorte === 'vraie'; });
  function nom(k){ return NOMS_MIMIQUES[k] || M[k].court || M[k].nom; }
  function section(cls, titre, ks){
    return '<div class="rg-cat-s ' + cls + '"><h3 class="rg-cat-t"><span>' + titre + '</span></h3><div class="rg-cat-g">' +
      ks.map(function(k){ return '<figure class="rg-cat-c" data-m="' + k + '"><div class="rg-cat-f">' + Persos.pnj(qui, {anime:true, expressif:true, cadre:'visage', id:uid('rgcat')}) + '</div><figcaption>' + esc(nom(k)) + '</figcaption></figure>'; }).join('') +
      '</div></div>';
  }
  var box = document.createElement('section');
  box.className = 'rg-cat';
  box.innerHTML = section('ment', '🤥 Signes de mensonge', signes) + section('vrai', '🙂 Pas un mensonge', vraies);
  /* un 🔊 par titre : il lit le titre et le nom de chaque mimique */
  [['ment', 'Signes de mensonge', signes], ['vrai', 'Pas un mensonge', vraies]].forEach(function(x){
    var h = box.querySelector('.rg-cat-s.' + x[0] + ' .rg-cat-t');
    if(h && MJ.boutonLire) h.insertBefore(MJ.boutonLire(x[1] + ' : ' + x[2].map(nom).join(', ') + '.', 'rg-cat-lire'), h.firstChild);
  });
  /* chaque visage refait sa mimique, en décalé (même réglage que l'écran « Les signes » du jeu) */
  var p = {double:.5, monte:.8}, figes = reduit();
  Array.prototype.forEach.call(box.querySelectorAll('.rg-cat-c'), function(cd, i){
    var svg = cd.querySelector('svg'), k = cd.dataset.m, m = M[k];
    if(!svg || !m) return;
    function jouer(){
      if(!figes && !box.isConnected && box.__vu) return;
      if(box.isConnected) box.__vu = true;
      var e = m.e({cote:1, F:1, p:p});
      if(k === 'coin') e.ampleur = 1;
      if(k === 'rougeur') e.rougeur = .8;
      if(k === 'sueur') e.sueurDuree = 2.6;
      try{ Persos.expression(svg, Object.assign(m.sorte === 'signe' && !e.bouche ? {bouche:'fermee'} : {}, e)); }catch(er){}
      if(figes) return;
      setTimeout(function(){ if(box.isConnected) try{ Persos.expression(svg, {bouche:'fermee', vitesseRougeur:.8}); }catch(er){} }, k === 'sueur' ? 2700 : 2300);
      setTimeout(jouer, 3400);
    }
    setTimeout(jouer, 400 + i * 120);
  });
  return box;
};

/* RAGOTS — un villageois raconte ; la main touche 🔊 pour écouter, puis
   👍 J'y crois ; un autre raconte : 👎 C'est faux. Tout va dans le carnet 📒. */
D('ragots', function(el){
  var P = 8.4;
  var HIST = [{qui:'margot', ic:'👵', t:'« Le pont grince la veille d\'un jour de pluie… »'}, {qui:'gaspard', ic:'🧑‍🍳', t:'« Le chat du meunier sait compter jusqu\'à dix ! »'}];
  var racine = htmlDemo(el, 'rg-rag',
    '<div class="rg-rag-qui q0">' + villageois(HIST[0].qui, {}, HIST[0].ic) + '</div><div class="rg-rag-qui q1">' + villageois(HIST[1].qui, {}, HIST[1].ic) + '</div>' +
    '<div class="rg-rag-bulle"><span class="rg-rag-t"></span><span class="rg-rag-lire">🔊</span></div>' +
    '<span class="rg-rag-note">📒 noté !</span>' +
    '<span class="rg-rag-b oui">👍 J\'y crois</span><span class="rg-rag-b non">👎 C\'est faux</span>');
  var q = [$(racine, '.q0'), $(racine, '.q1')], bulle = $(racine, '.rg-rag-bulle'), txt = $(racine, '.rg-rag-t'), oui = $(racine, '.oui'), non = $(racine, '.non'), note = $(racine, '.rg-rag-note'), lire = $(racine, '.rg-rag-lire');
  var main = mainAuto($(racine, '.rg-main'), [[0, 266, 404, 0], [.6, 266, 404, 0], [1.1, 257, 212, 0], [1.2, 257, 212, 1], [1.35, 257, 212, 0], [2.7, 257, 216, 0], [3.2, 80, 350, 0], [3.3, 80, 350, 1], [3.5, 80, 350, 0], [4.4, 150, 404, 0], [5.4, 150, 404, 0], [5.9, 222, 350, 0], [6.0, 222, 350, 1], [6.2, 222, 350, 0], [7.2, 266, 404, 0], [P, 266, 404, 0]], [1.2, 3.3, 6.0]);
  var dernier = -1;
  return boucle(el, P, function(t){
    var k = t < 4.7 ? 0 : 1;
    if(k !== dernier){ dernier = k; txt.textContent = HIST[k].t; }
    var v = k === 0 ? entre(t, 0, .35) * (1 - entre(t, 4.4, 4.7)) : entre(t, 4.8, 5.15) * (1 - entre(t, 7.6, 8));
    bulle.style.opacity = v.toFixed(2); bulle.style.transform = 'scale(' + (.9 + .1 * v).toFixed(3) + ')';
    q[0].style.opacity = k === 0 ? v.toFixed(2) : 0; q[1].style.opacity = k === 1 ? v.toFixed(2) : 0;
    var ec = t > 1.25 && t < 2.7;
    lire.style.transform = ec ? 'scale(' + (1.12 + .08 * Math.sin(t * 12)).toFixed(3) + ')' : '';
    lire.style.boxShadow = ec ? '0 0 0 5px rgba(245,185,69,.6)' : '';
    oui.classList.toggle('appuye', t > 3.3 && t < 3.55);
    non.classList.toggle('appuye', t > 6.0 && t < 6.25);
    var n = Math.max(entre(t, 3.5, 3.75) * (1 - entre(t, 4.3, 4.5)), entre(t, 6.2, 6.45) * (1 - entre(t, 7, 7.2)));
    note.style.opacity = n.toFixed(2); note.style.transform = 'translate(-50%,' + f1(-10 * n) + 'px) scale(' + (.8 + .2 * n).toFixed(2) + ')';
    main(t);
  }, 3.35);
});

/* LES MOTS PERDUS — la main touche le trou, puis le bon mot : il s'y range.
   Puis « ✔ Valider » : c'est juste. */
D('mots', function(el){
  var P = 7;
  var racine = htmlDemo(el, 'rg-mots',
    '<div class="rg-mots-carte"><p><span class="qui">🧔</span> Et mes <b class="trou">&nbsp;1&nbsp;</b> ?</p><p><span class="qui">👩</span> Vous avez tout payé !</p></div>' +
    '<div class="rg-mots-liste"><span class="m0">girafe</span><span class="m1">dettes</span><span class="m2">clé</span><span class="m3">lavoir</span></div>' +
    '<span class="rg-mots-vol">dettes</span><div class="rg-mots-v">✔ Valider</div>');
  var trou = $(racine, '.trou'), m1 = $(racine, '.m1'), vol = $(racine, '.rg-mots-vol'), val = $(racine, '.rg-mots-v');
  var main = mainAuto($(racine, '.rg-main'), [[0, 266, 404, 0], [.5, 266, 404, 0], [1.0, 168, 84, 1], [1.15, 168, 84, 0], [1.6, 220, 200, 0], [2.0, 222, 252, 1], [2.15, 222, 252, 0], [3.2, 272, 320, 0], [3.6, 150, 378, 1], [3.75, 150, 378, 0], [4.6, 266, 404, 0], [P, 266, 404, 0]], [1.0, 2.0, 3.6]);
  return boucle(el, P, function(t){
    var plein = t > 2.6 && t < 6.4;
    trou.textContent = plein ? 'dettes' : ' 1 ';
    trou.className = 'trou' + (t > 1.05 && t < 2.6 ? ' choisi' : '') + (plein ? ' plein' : '') + (t > 3.8 && t < 6.4 ? ' juste' : '');
    m1.className = 'm1' + (t > 2.1 && t < 6.4 ? ' pris' : '');
    var u = (t - 2.1) / .5;
    if(u > 0 && u < 1){ vol.style.opacity = 1; vol.style.left = f1(mix(222, 168, u)) + 'px'; vol.style.top = f1(mix(252, 84, u)) + 'px'; } else vol.style.opacity = 0;
    val.classList.toggle('appuye', t > 3.6 && t < 3.85);
    racine.classList.toggle('reussi', t > 3.85 && t < 6.4);
    main(t);
  }, 3.9);
});

/* LES DÉPOSITIONS — la main prend le feutre vert et surligne les deux témoins
   qui disent pareil, le rouge sur celui qui ne colle pas, puis l'accuse. */
D('depositions', function(el, prm){
  var P = 9;
  /* le choix « 🎧 À l'oral / 📖 À lire » change le jeu : on le garde. C'est la démo du jeu qui le fabrique ;
     elle tourne dans une boîte cachée, et mj-core.js sort le choix du cadre de la démo. */
  var cache = null, demoJeu = null;
  try{
    if(MJ.TYPES.depositions && MJ.TYPES.depositions.demo && el.parentNode){
      cache = document.createElement('div'); cache.hidden = true; cache.className = 'rg-cache';
      el.parentNode.insertBefore(cache, el.nextSibling);
      demoJeu = MJ.TYPES.depositions.demo(cache, prm || {});
    }
  }catch(e){}
  var T = [{ic:'🧔', nom:'Victor', t:'Il pleuvait très fort.'}, {ic:'👩‍🦰', nom:'Mélusine', t:'Dehors, il tombait des cordes.'}, {ic:'🤠', nom:'Fortuné', t:'Il faisait un temps magnifique !'}];
  var racine = htmlDemo(el, 'rg-dep',
    T.map(function(d, i){ return '<div class="rg-dep-c c' + i + '"><span class="ic">' + d.ic + '</span><b>' + esc(d.nom) + '</b><p><span class="sur">' + esc(d.t) + '</span></p><span class="tampon">🤥</span></div>'; }).join('') +
    '<div class="rg-dep-stylos"><span class="s v">🖍️ Pareil</span><span class="s r">🖍️ Bizarre</span><span class="s j">🖍️ Hmm ?</span></div>' +
    '<div class="rg-dep-acc">🤥 Accuser</div>');
  var sur = $$(racine, '.sur'), cartes = $$(racine, '.rg-dep-c'), sv = $(racine, '.s.v'), sr = $(racine, '.s.r'), acc = $(racine, '.rg-dep-acc');
  var Y = [44, 132, 220];
  var anim, main = mainAuto($(racine, '.rg-main'), [[0, 266, 404, 0], [.4, 266, 404, 0], [.8, 54, 312, 1], [.95, 54, 312, 0], [1.2, 70, Y[0] + 20, 1], [1.8, 250, Y[0] + 20, 0], [2.1, 70, Y[1] + 20, 1], [2.7, 250, Y[1] + 20, 0], [3.2, 150, 312, 1], [3.35, 150, 312, 0], [3.7, 70, Y[2] + 20, 1], [4.3, 250, Y[2] + 20, 0], [5.0, 230, 240, 0], [5.3, 230, 240, 1], [5.45, 230, 240, 0], [6.0, 150, 370, 1], [6.15, 150, 370, 0], [7.0, 266, 404, 0], [P, 266, 404, 0]], [.8, 3.2, 5.3, 6.0]);
  anim = boucle(el, P, function(t){
    var fin = t > 8.4;
    [[1.2, 1.8], [2.1, 2.7], [3.7, 4.3]].forEach(function(s, i){ var u = fin ? 0 : entre(t, s[0], s[1]); sur[i].style.backgroundSize = Math.round(u * 100) + '% 100%'; });
    sv.classList.toggle('on', t > .85 && t < 3.25); sr.classList.toggle('on', t > 3.25 && t < 5);
    cartes[2].classList.toggle('choisie', t > 5.35 && !fin);
    cartes[2].classList.toggle('accusee', t > 6.1 && !fin);
    acc.classList.toggle('appuye', t > 6.0 && t < 6.25);
    main(t);
  }, 6.3);
  return {arreter:function(){ anim.arreter(); try{ if(demoJeu && demoJeu.arreter) demoJeu.arreter(); }catch(e){} }};
});

/* ==========================================================
   SAGE
   ========================================================== */
/* L'ALPHABET SECRET — la main touche une case du message codé, puis la lettre
   (la clé dit quel signe va avec quelle lettre) ; à la fin, « ✔ Valider ». */
D('alphabet', function(el){
  var P = 8.6, SIG = ['△', '◯', '☐', '✕'], LET = ['C', 'L', 'E', 'F'], CLAV = ['C', 'E', 'F', 'L', 'R', 'S'];
  var racine = htmlDemo(el, 'rg-alpha',
    '<div class="rg-alpha-parch">' + SIG.map(function(s, i){ return '<div class="case k' + i + '"><b>' + s + '</b><i></i></div>'; }).join('') + '</div>' +
    '<div class="rg-alpha-cle">🔑 ' + SIG.map(function(s, i){ return '<span>' + s + ' = ' + LET[i] + '</span>'; }).join('') + '</div>' +
    '<div class="rg-alpha-clav">' + CLAV.map(function(l){ return '<span class="l' + l + '">' + l + '</span>'; }).join('') + '</div>' +
    '<div class="rg-alpha-v">✔ Valider</div>');
  var cases = $$(racine, '.case'), val = $(racine, '.rg-alpha-v');
  /* positions (px) des cases et des touches, en 300 × 420 */
  var XC = [57, 119, 181, 243], YC = 88, XK = {C:60, E:150, F:240, L:60, R:150, S:240}, YK = {C:282, E:282, F:282, L:334, R:334, S:334};
  var cles = [[0, 266, 404, 0], [.4, 266, 404, 0]], tapes = [];
  LET.forEach(function(l, i){ var t0 = .8 + i * 1.3; cles.push([t0, XC[i], YC, 1], [t0 + .15, XC[i], YC, 0], [t0 + .6, XK[l], YK[l], 1], [t0 + .75, XK[l], YK[l], 0]); tapes.push(t0, t0 + .6); });
  cles.push([6.4, 150, 388, 1], [6.55, 150, 388, 0], [7.3, 266, 404, 0], [P, 266, 404, 0]); tapes.push(6.4);
  var main = mainAuto($(racine, '.rg-main'), cles, tapes);
  var touches = {}; CLAV.forEach(function(l){ touches[l] = $(racine, '.l' + l); });
  return boucle(el, P, function(t){
    var fin = t > 8.2;
    cases.forEach(function(c, i){ var t0 = .8 + i * 1.3; c.classList.toggle('choisie', t > t0 && t < t0 + .65 && !fin); c.lastChild.textContent = (t > t0 + .65 && !fin) ? LET[i] : ''; });
    CLAV.forEach(function(l){ var i = LET.indexOf(l), t0 = .8 + i * 1.3 + .6; touches[l].classList.toggle('appuye', i >= 0 && t > t0 && t < t0 + .25); });
    val.classList.toggle('appuye', t > 6.4 && t < 6.65);
    racine.classList.toggle('reussi', t > 6.6 && !fin);
    main(t);
  }, 3.35);
});

/* SUPERPOSER LES PLANS — la main fait glisser le calque rouge, le tourne
   avec deux doigts : les dessins tombent pile, le secret apparaît. */
D('plans', function(el){
  var P = 7;
  var MARQ = [[-62, -54], [58, -30], [-20, 60]];
  var marques = function(c, w){ return MARQ.map(function(m){ return '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="13" fill="none" stroke="' + c + '" stroke-width="' + w + '"/>'; }).join(''); };
  var svg = svgDemo(el,
    '<rect width="300" height="420" fill="#1c2447"/>' +
    '<g transform="translate(150,210)"><rect x="-120" y="-120" width="240" height="240" rx="8" fill="#f3e7cb" stroke="#6b5434" stroke-width="3"/>' +
      '<path d="M-120,10 C-60,0 -20,30 40,10 S100,-20 120,-10 M-30,-120 C-20,-60 -40,-10 -20,120" stroke="#c9b48a" stroke-width="7" fill="none"/>' +
      '<rect x="-90" y="20" width="30" height="24" fill="none" stroke="#6b5434" stroke-width="2.5"/><rect x="50" y="40" width="34" height="26" fill="none" stroke="#6b5434" stroke-width="2.5"/>' +
      marques('#35281b', 3.5) + '<g class="rg-secret" opacity="0"><path d="M32,32 L56,56 M56,32 L32,56" stroke="#e5484d" stroke-width="7" stroke-linecap="round"/><circle cx="44" cy="44" r="22" fill="none" stroke="#f5b945" stroke-width="3"/></g></g>' +
    '<g class="rg-calque"><rect x="-120" y="-120" width="240" height="240" rx="8" fill="#e5484d" fill-opacity=".12" stroke="#e5484d" stroke-width="3" stroke-dasharray="8 6"/>' + marques('#e5484d', 4) + '</g>' +
    '<g class="rg-brille" opacity="0">' + emo(250, 84, 28, '✨') + emo(54, 316, 24, '✨') + '</g>' +
    '<g class="rg-doigt2" opacity="0"><circle r="16" fill="none" stroke="#8ff3ff" stroke-width="3.5"/><circle r="6" fill="#8ff3ff"/></g>');
  var calque = $(svg, '.rg-calque'), secret = $(svg, '.rg-secret'), brille = $(svg, '.rg-brille'), d2 = $(svg, '.rg-doigt2'), gMain = $(svg, '.rg-main');
  var X0 = 196, Y0 = 246, R0 = 26;
  return boucle(el, P, function(t){
    var ut = entre(t, 1.1, 2.2), ur = entre(t, 2.7, 3.7), fin = entre(t, 6.3, 6.9);
    var x = mix(mix(X0, 150, ut), X0, fin), y = mix(mix(Y0, 210, ut), Y0, fin), r = mix(mix(R0, 0, ur), R0, fin);
    pose(calque, x, y, 1, r);
    var ok = t > 3.7 && t < 6.3;
    calque.firstChild.setAttribute('stroke', ok ? '#f5b945' : '#e5484d');
    vis(secret, ok ? entre(t, 3.8, 4.2) : 0); vis(brille, ok ? .6 + .4 * Math.sin(t * 7) : 0);
    /* la main : un doigt qui glisse, puis deux doigts qui tournent */
    var m, p = false, a1 = (mix(R0, 0, ur) + 40) * Math.PI / 180, rr = 70;
    if(t < .7) m = [266, 404];
    else if(t < 1.0) m = [mix(266, X0 + 30, entre(t, .7, 1)), mix(404, Y0 + 40, entre(t, .7, 1))];
    else if(t < 2.25){ m = [x + 30, y + 40]; p = t > 1.0; }
    else if(t < 2.65) m = [mix(180, 150 + rr * Math.cos(a1), entre(t, 2.25, 2.65)), mix(250, 210 + rr * Math.sin(a1), entre(t, 2.25, 2.65))];
    else if(t < 3.75){ m = [150 + rr * Math.cos(a1), 210 + rr * Math.sin(a1)]; p = true; }
    else { var u = entre(t, 3.75, 4.6); m = [mix(150 + rr * Math.cos(a1), 266, u), mix(210 + rr * Math.sin(a1), 404, u)]; }
    poserMain(gMain, m[0], m[1], p, t, []);
    var deux = t > 2.65 && t < 3.75;
    vis(d2, deux ? 1 : 0); pose(d2, 150 - rr * Math.cos(a1), 210 - rr * Math.sin(a1));
  }, 3.2);
});

/* LA GRILLE DE DÉDUCTION — on lit un indice, la main met une croix ✗ ;
   un autre indice : deux touches pour une coche ✓ ; puis « ✔ Valider ». */
D('grille', function(el){
  var P = 8.6;
  var racine = htmlDemo(el, 'rg-gr',
    '<p class="ind i0"><i>1</i> Tim n\'était pas au moulin.</p><p class="ind i1"><i>2</i> Odette était au moulin.</p>' +
    '<div class="rg-gr-g"><b></b><b>🌾</b><b>🪣</b><b>🧒</b><span class="c0"></span><span class="c1"></span><b>👵</b><span class="c2"></span><span class="c3"></span></div>' +
    '<div class="rg-gr-v">✔ Valider</div>');
  var ind = $$(racine, '.ind'), c = [0, 1, 2, 3].map(function(i){ return $(racine, '.c' + i); }), val = $(racine, '.rg-gr-v');
  /* cases : c0 Tim×moulin, c1 Tim×puits, c2 Odette×moulin, c3 Odette×puits */
  var XC = [140, 228], YC = [193, 267];
  var main = mainAuto($(racine, '.rg-main'), [[0, 266, 404, 0], [.9, 266, 404, 0], [1.3, XC[0], YC[0], 1], [1.45, XC[0], YC[0], 0], [2.4, 200, 230, 0], [2.9, XC[0], YC[1], 1], [3.05, XC[0], YC[1], 0], [3.4, XC[0], YC[1], 1], [3.55, XC[0], YC[1], 0], [4.6, 200, 320, 0], [5.4, 150, 363, 1], [5.55, 150, 363, 0], [6.4, 266, 404, 0], [P, 266, 404, 0]], [1.3, 2.9, 3.4, 5.4]);
  function marque(n, s){ n.textContent = s === 'x' ? '✗' : (s === 'v' ? '✓' : ''); n.className = n.className.split(' ')[0] + (s ? ' ' + s : ''); }
  return boucle(el, P, function(t){
    var fin = t > 8.1;
    ind[0].className = 'ind i0' + (t > .2 && t < 1.7 && !fin ? ' lu' : '') + (t > 1.7 && !fin ? ' fait' : '');
    ind[1].className = 'ind i1' + (t > 2.0 && t < 3.7 && !fin ? ' lu' : '') + (t > 3.7 && !fin ? ' fait' : '');
    marque(c[0], fin ? '' : (t > 1.35 ? 'x' : ''));
    marque(c[2], fin ? '' : (t > 3.45 ? 'v' : (t > 2.95 ? 'x' : '')));
    marque(c[1], fin ? '' : (t > 4.0 ? 'v auto' : ''));
    marque(c[3], fin ? '' : (t > 4.0 ? 'x auto' : ''));
    val.classList.toggle('appuye', t > 5.4 && t < 5.65);
    racine.classList.toggle('reussi', t > 5.6 && !fin);
    main(t);
  }, 3.5);
});

/* ASSEMBLER LES RUNES — en haut, le modèle ; la main touche une pièce (elle
   tourne d'un quart de tour), puis en glisse une sur une autre (elles
   s'échangent) : l'image est refaite. Les coups 🕯️ diminuent. */
D('runes', function(el){
  var P = 7.6, id = uid('rgr');
  var IMG = '<rect width="100" height="100" fill="#454b78"/><rect x="4" y="4" width="92" height="92" rx="6" fill="none" stroke="#c9a75a" stroke-width="3"/>' +
    '<circle cx="50" cy="50" r="26" fill="none" stroke="#bff9ff" stroke-width="6"/><path d="M50 12V88M12 50H88" stroke="#bff9ff" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="14" cy="14" r="5" fill="#e8c46a"/><path d="M78 30L90 18" stroke="#e8c46a" stroke-width="5" stroke-linecap="round"/><path d="M14 86 L28 72" stroke="#e8c46a" stroke-width="5" stroke-linecap="round"/>';
  var S = 112, X0 = 38, Y0 = 150;
  function piece(h){ var qx = (h % 2) * 50, qy = Math.floor(h / 2) * 50; return '<g class="pc pc' + h + '"><svg x="' + (-S / 2) + '" y="' + (-S / 2) + '" width="' + S + '" height="' + S + '" viewBox="' + qx + ' ' + qy + ' 50 50"><use href="#' + id + '"/></svg><rect x="' + (-S / 2) + '" y="' + (-S / 2) + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + K + '" stroke-width="3"/></g>'; }
  var svg = svgDemo(el,
    '<defs><g id="' + id + '">' + IMG + '</g></defs><rect width="300" height="420" fill="#1c2447"/>' +
    '<g transform="translate(24,22) scale(.9)"><use href="#' + id + '"/><rect width="100" height="100" fill="none" stroke="#c9a75a" stroke-width="3"/></g>' +
    '<g transform="translate(196,72)"><rect x="-58" y="-30" width="116" height="60" rx="14" fill="#14112a" stroke="#3b4679" stroke-width="2"/>' + emo(-24, 0, 28, '🕯️') + '<text class="rg-coups" x="22" y="2" font-size="30" font-weight="800" fill="#ffe3a3" text-anchor="middle" dominant-baseline="central">3</text></g>' +
    '<rect x="' + (X0 - 8) + '" y="' + (Y0 - 8) + '" width="' + (2 * S + 16) + '" height="' + (2 * S + 16) + '" rx="12" fill="#14112a" stroke="#3b4679" stroke-width="2" class="rg-plateau"/>' +
    [0, 1, 2, 3].map(piece).join('') + '<g class="rg-brille" opacity="0">' + emo(150, 404, 26, '✨') + emo(40, 400, 20, '✨') + emo(260, 400, 20, '✨') + '</g>');
  var pc = [0, 1, 2, 3].map(function(h){ return $(svg, '.pc' + h); }), coups = $(svg, '.rg-coups'), plateau = $(svg, '.rg-plateau'), brille = $(svg, '.rg-brille');
  function cx(slot){ return X0 + S / 2 + (slot % 2) * S; } function cy(slot){ return Y0 + S / 2 + Math.floor(slot / 2) * S; }
  /* départ : pièce 0 tournée d'un quart ; pièces 1 et 3 échangées */
  var main = mainAuto($(svg, '.rg-main'), [[0, 266, 404, 0], [.6, 266, 404, 0], [1.0, cx(0), cy(0) + 10, 1], [1.15, cx(0), cy(0) + 10, 0], [1.9, cx(1), cy(1) + 10, 0], [2.2, cx(1), cy(1) + 10, 1], [3.0, cx(3), cy(3) + 10, 1], [3.1, cx(3), cy(3) + 10, 0], [4.0, 266, 404, 0], [P, 266, 404, 0]], [1.0, 2.2]);
  return boucle(el, P, function(t){
    var fin = t > 7.0, rot = fin ? 90 : 90 * (1 - entre(t, 1.05, 1.4));
    pose(pc[0], cx(0), cy(0), 1, rot);
    pose(pc[2], cx(2), cy(2));
    var u = fin ? 0 : entre(t, 2.25, 3.0), sw = fin ? 0 : entre(t, 3.0, 3.35);
    /* la pièce 1 (posée en bas à droite) suit le doigt jusqu'en haut à droite ; la 3 descend à sa place */
    pose(pc[3], mix(cx(1), cx(3), Math.max(u, sw)), mix(cy(1), cy(3), Math.max(u, sw)), 1 + .08 * (u > 0 && u < 1 ? 1 : 0));
    pose(pc[1], mix(cx(3), cx(1), sw), mix(cy(3), cy(1), sw));
    coups.textContent = fin ? '3' : (t > 3.0 ? '1' : (t > 1.1 ? '2' : '3'));
    var ok = t > 3.4 && !fin;
    plateau.setAttribute('stroke', ok ? '#f5b945' : '#3b4679'); plateau.setAttribute('stroke-width', ok ? 5 : 2);
    vis(brille, ok ? .6 + .4 * Math.sin(t * 7) : 0);
    main(t);
  }, 1.1);
});
})();
