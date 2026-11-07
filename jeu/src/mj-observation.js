/* ==========================================================
   Brumeval v2 — jeux d'observation de l'Alchimiste (préfixe .mjo-)
   · differences : « Les 7 différences » (remplace « loupe ») — 10 décors,
                   params.theme, params.ingredient (cueillette rare)
   · double      : « Le double » (façon Dobble, vrai plan projectif d'ordre 5 ou 7)
   · insectes    : « Le grand ménage du labo » ; params.ensuite = 'differences'
                   enchaîne sur les 7 différences du labo (fin appelée une seule fois)
   Dépend de mj-core.js (MJ, MJ.util). Aucune lecture à voix haute :
   seulement de petits sons (MJ.util.son et WebAudio pour l'écrasement).
   Source assemblée depuis test/observation/parts/ par test/observation/assembler.py.
   Crochets de test : élément racine .mjo-jeu → .mjoEtat() ; MJ.TYPES.double.plan(q).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.util){ console.error('mj-observation : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util;
var NS = 'http://www.w3.org/2000/svg';
var K = '#24182e';
var uid = 0;
function nid(p){ uid++; return (p || 'mjo') + uid; }

/* ---------- Petits outils ---------- */
function f1(v){ return String(Math.round(v * 10) / 10); }
function fixe(v, a, b){ return Math.max(a, Math.min(b, v)); }
function lisse(t){ t = fixe(t, 0, 1); return t * t * (3 - 2 * t); }
/* Courbe par points d'appui : courbe(n, {1:a, 3:b, 6:c, 10:d}) — interpolation linéaire, bornée aux extrémités. */
function courbe(n, pts){
  var ks = Object.keys(pts).map(Number).sort(function(a, b){ return a - b; });
  if(n <= ks[0]) return pts[ks[0]];
  for(var i = 1; i < ks.length; i++){
    if(n <= ks[i]){ var a = ks[i - 1], b = ks[i]; return pts[a] + (pts[b] - pts[a]) * (n - a) / (b - a); }
  }
  return pts[ks[ks.length - 1]];
}
function entier(n, pts){ return Math.round(courbe(n, pts)); }
function svgNoeud(tag, attrs, parent){
  var n = document.createElementNS(NS, tag);
  if(attrs) for(var k in attrs) n.setAttribute(k, attrs[k]);
  if(parent) parent.appendChild(n);
  return n;
}
function ptSVG(svg, e){
  var m = svg.getScreenCTM(); if(!m) return {x:0, y:0};
  var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  var r = pt.matrixTransform(m.inverse());
  return {x:r.x, y:r.y};
}
function versEcran(svg, x, y){
  var m = svg.getScreenCTM(); if(!m) return {x:0, y:0};
  var pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
  var r = pt.matrixTransform(m);
  return {x:r.x, y:r.y};
}
function relancer(n, cls){ if(!n) return; n.classList.remove(cls); void n.getBoundingClientRect(); n.classList.add(cls); }
function retirer(n){ if(n && n.parentNode) n.parentNode.removeChild(n); }
function sansAccents(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
/* Petit hasard reproductible (décors identiques sur les deux images) */
function alea(graine){ var s = Math.abs(Math.round(graine)) % 2147483646 + 1; return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }

/* ---------- Couleurs ---------- */
function hexRgb(h){ h = String(h).replace('#', ''); if(h.length === 3) h = h.replace(/./g, '$&$&'); var v = parseInt(h, 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function rgbHex(c){ return '#' + c.map(function(v){ return ('0' + Math.round(fixe(v, 0, 255)).toString(16)).slice(-2); }).join(''); }
function mel(a, b, t){ var x = hexRgb(a), y = hexRgb(b); return rgbHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
function fonce(c, t){ return mel(c, '#1a1028', t === undefined ? 0.3 : t); }
function clair(c, t){ return mel(c, '#ffffff', t === undefined ? 0.35 : t); }
function ecart(a, b){ var x = hexRgb(a), y = hexRgb(b); return Math.sqrt(2 * Math.pow(x[0] - y[0], 2) + 4 * Math.pow(x[1] - y[1], 2) + 3 * Math.pow(x[2] - y[2], 2)); }

/* ---------- Partie : boucles, minuteurs, écouteurs et sons nettoyés d'un coup ---------- */
function Partie(fin){
  var p = {fini:false, fermeture:false, stops:[], timers:[]};
  p.boucle = function(fn){ var s = U.boucle(function(dt, t){ if(p.fini) return false; return fn(dt, t); }); p.stops.push(s); return s; };
  p.apres = function(ms, fn){ var t = setTimeout(function(){ if(!p.fini) fn(); }, ms); p.timers.push(t); return t; };
  p.ecoute = function(cible, type, fn, opt){ cible.addEventListener(type, fn, opt); p.stops.push(function(){ cible.removeEventListener(type, fn, opt); }); };
  p.observe = function(el, fn){ if(window.ResizeObserver){ var ro = new ResizeObserver(function(){ if(!p.fini) fn(); }); ro.observe(el); p.stops.push(function(){ ro.disconnect(); }); } else p.ecoute(window, 'resize', fn); };
  p.nettoyer = function(){ p.stops.forEach(function(f){ try{ f(); }catch(e){} }); p.stops = []; p.timers.forEach(clearTimeout); p.timers = []; };
  p.terminer = function(res){ if(p.fini) return; p.fini = true; p.nettoyer(); fin(res); };
  /* Termine après une petite pause (le temps de voir l'animation finale). */
  p.finir = function(res, ms){ if(p.fini || p.fermeture) return; p.fermeture = true; p.apres(ms === undefined ? 800 : ms, function(){ p.terminer(res); }); };
  p.arreter = function(){ p.fini = true; p.nettoyer(); };
  p.sons = Sons(p);
  return p;
}

/* ---------- Sons synthétisés (WebAudio), coupés net par arreter() ---------- */
var ctxA = null;
function audio(){
  if(!ctxA){ try{ ctxA = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ ctxA = null; } }
  if(ctxA && ctxA.state === 'suspended') try{ ctxA.resume(); }catch(e){}
  return ctxA;
}
function sonActif(){ try{ if(window.Brume && Brume.sonActif) return Brume.sonActif(); }catch(e){} return true; }
function Sons(P){
  var maitre = null;
  function sortie(){
    if(P.fini || !sonActif()) return null;
    var a = audio(); if(!a) return null;
    if(!maitre){
      maitre = a.createGain(); maitre.gain.value = 0.9; maitre.connect(a.destination);
      var m = maitre;
      P.stops.push(function(){ try{ m.gain.setValueAtTime(0, a.currentTime); m.disconnect(); }catch(e){} if(maitre === m) maitre = null; });
    }
    return maitre;
  }
  function osc(type, f0, f1v, t0, dur, vol){
    var o = sortie(); if(!o) return;
    try{
      var a = ctxA, t = a.currentTime + t0, s = a.createOscillator(), g = a.createGain();
      s.type = type; s.frequency.setValueAtTime(f0, t); if(f1v) s.frequency.exponentialRampToValueAtTime(f1v, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(g); g.connect(o); s.start(t); s.stop(t + dur + 0.05);
    }catch(e){}
  }
  function bruit(t0, dur, vol, type, fa, fb, q){
    var o = sortie(); if(!o) return;
    try{
      var a = ctxA, t = a.currentTime + t0, n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
      for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      f.type = type || 'lowpass'; f.frequency.setValueAtTime(fa, t); if(fb) f.frequency.exponentialRampToValueAtTime(fb, t + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.buffer = buf; s.connect(f); f.connect(g); g.connect(o); s.start(t); s.stop(t + dur + 0.02);
    }catch(e){}
  }
  return {
    /* le gros « splotch » bien juteux */
    ecrase: function(){
      var k = U.rand(0.85, 1.18);
      osc('sine', 190 * k, 46, 0, 0.2, 0.55);
      bruit(0, 0.32, 0.6, 'bandpass', 2600 * k, 240, 2.4);
      bruit(0, 0.05, 0.28, 'highpass', 3600, 0, 0.7);
      osc('sine', 560 * k, 150, 0.05, 0.15, 0.24);
      bruit(0.08, 0.2, 0.2, 'lowpass', 1000, 260, 1);
    },
    /* petit « oh non » triste */
    ohNon: function(){ osc('triangle', 560, 500, 0, 0.24, 0.17); osc('triangle', 470, 300, 0.26, 0.44, 0.17); osc('sine', 1120, 1000, 0, 0.2, 0.03); },
    pop: function(){ osc('sine', 620, 1150, 0, 0.09, 0.16); },
    ding: function(){ osc('triangle', 880, 0, 0, 0.12, 0.12); osc('triangle', 1320, 0, 0.07, 0.2, 0.11); osc('sine', 1760, 0, 0.12, 0.25, 0.05); },
    rate: function(){ osc('square', 210, 130, 0, 0.16, 0.05); bruit(0, 0.1, 0.08, 'lowpass', 700, 300, 1); },
    bocal: function(){ osc('sine', 1300, 1700, 0, 0.12, 0.08); osc('triangle', 990, 0, 0.1, 0.25, 0.1); osc('triangle', 1480, 0, 0.18, 0.3, 0.08); }
  };
}

/* ---------- Bandeau : vies, progression, sablier ---------- */
var COEUR = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15 1.5 11.2 1.5 7 C1.5 3.8 4 1.5 7 1.5 C9.1 1.5 10.9 2.7 12 4.5 C13.1 2.7 14.9 1.5 17 1.5 C20 1.5 22.5 3.8 22.5 7 C22.5 11.2 19 15 12 20.5 Z"/></svg>';
var BOUCLIER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L21 5.5 C21 13 17.5 19 12 22 C6.5 19 3 13 3 5.5 Z"/></svg>';
function creerHud(el){
  var h = U.html('<div class="mjo-hud">' +
    '<div class="mjo-vies" aria-label="Vies"></div>' +
    '<div class="mjo-prog" aria-label="Progression"></div>' +
    '<div class="mjo-temps" hidden><span class="mjo-sab">⏳</span><div class="mjo-barre"><i></i></div></div>' +
  '</div>');
  el.appendChild(h);
  var vies = h.querySelector('.mjo-vies'), prog = h.querySelector('.mjo-prog'), tps = h.querySelector('.mjo-temps'), bar = tps.querySelector('i');
  var api = {
    el: h,
    /* la règle des cœurs (mj-core.js) : cœurs affichés = erreurs encore permises ; plus de cœur → on prévient */
    coeurs: function(rest, total, casse){ vies.innerHTML = U.coeurs(rest, total, casse); },
    perdCoeur: function(rest, total){ api.coeurs(rest, total, rest); if(rest === 0) U.plusDeCoeur(el); },
    /* rest = vies restantes (on perd quand il n'en reste plus) : cœurs = vies − 1 */
    vies: function(rest, max){ api.coeurs(rest - 1, max - 1); },
    perdVie: function(rest, max){ if(rest >= 1) api.perdCoeur(rest - 1, max - 1); },
    prog: function(k, n, ic, seuil){
      var lim = seuil || 14;
      if(h.clientWidth && h.clientWidth < 420) lim = Math.min(lim, 7);
      if(n > lim){ prog.innerHTML = '<div class="mjo-prog-barre"><i style="transform:scaleX(' + (k / n).toFixed(3) + ')"></i></div><b>' + k + '/' + n + '</b>'; return; }
      var s = '';
      for(var i = 0; i < n; i++) s += '<span class="mjo-gemme' + (i < k ? ' ok' : '') + (i === k - 1 ? ' neuf' : '') + '">' + (i < k && ic ? ic : '') + '</span>';
      prog.innerHTML = s;
    },
    temps: function(frac){
      tps.hidden = false;
      frac = fixe(frac, 0, 1);
      bar.style.transform = 'scaleX(' + frac.toFixed(4) + ')';
      tps.classList.toggle('presse', frac < 0.22);
    },
    moins: function(){ relancer(tps, 'moins'); },
    badge: function(html){
      var b = h.querySelector('.mjo-badge');
      if(!b){ b = document.createElement('div'); b.className = 'mjo-badge'; h.insertBefore(b, prog); }
      b.innerHTML = html; return b;
    }
  };
  return api;
}
/* Petit texte qui s'envole, en % d'un conteneur positionné */
function flotter(parent, xPct, yPct, texte, cls){
  var s = document.createElement('span');
  s.className = 'mjo-flotte ' + (cls || '');
  s.textContent = texte;
  s.style.left = fixe(xPct, 8, 92) + '%'; s.style.top = fixe(yPct, 6, 94) + '%';
  parent.appendChild(s);
  setTimeout(function(){ retirer(s); }, 1100);
  return s;
}
function pctDans(svg, cont, x, y){
  var e = versEcran(svg, x, y), r = cont.getBoundingClientRect();
  return {x:(e.x - r.left) / Math.max(1, r.width) * 100, y:(e.y - r.top) / Math.max(1, r.height) * 100};
}
function annonce(parent, texte, ms, cls){
  var s = document.createElement('div');
  s.className = 'mjo-annonce ' + (cls || '');
  s.textContent = texte;
  parent.appendChild(s);
  setTimeout(function(){ retirer(s); }, ms || 1400);
  return s;
}

/* ---------- La petite main des démonstrations ---------- */
var MAIN = '<g class="mjo-main"><circle class="mjo-onde" r="13" cx="0" cy="0"/>' +
  '<g transform="scale(.62) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M5,30 L5,40 M16,31 L16,41" stroke="' + K + '" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g></g>';
function demoScene(el, fond, vb){
  el.innerHTML = '<svg class="mjo-demo-svg" viewBox="' + (vb || '0 0 300 170') + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + (fond || '') + '<g class="mjo-demo-contenu"></g>' + MAIN + '</svg>';
  var svg = el.querySelector('svg'), main = svg.querySelector('.mjo-main');
  var d = {
    svg: svg,
    contenu: svg.querySelector('.mjo-demo-contenu'),
    vers: function(x, y, ms){
      main.style.transition = 'transform ' + (ms === undefined ? 600 : ms) + 'ms cubic-bezier(.4,.1,.3,1)';
      main.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    },
    tape: function(){ relancer(main, 'tape'); }
  };
  d.vers(260, 150, 0);
  return d;
}
/* Enchaîne des étapes [délai ms, fonction] en boucle ; s'arrête seule si l'écran a disparu. */
function scenario(noeud, etapes, pause){
  var timers = [], actif = true;
  function vivant(){ if(actif && noeud && !noeud.isConnected){ actif = false; timers.forEach(clearTimeout); } return actif; }
  function lancer(){
    var cumul = 0;
    etapes.forEach(function(e){ cumul += e[0]; timers.push(setTimeout(function(){ if(vivant()) e[1](); }, cumul)); });
    timers.push(setTimeout(function(){ if(vivant()){ timers = []; lancer(); } }, cumul + (pause || 900)));
  }
  lancer();
  return {arreter: function(){ actif = false; timers.forEach(clearTimeout); }};
}


/* ==========================================================
   LES OBJETS DES DÉCORS (style jouet : contour épais, ombre propre, reflet)
   Chaque objet est dessiné autour de son point de base (0,0) :
   posé  → il monte vers y négatif ; suspendu (pend) → il descend vers y positif.
   o = {c couleur, d détail oui/non, n nombre, v variante, m retourné}
   ========================================================== */
function sw0(sw){ return sw === undefined ? 2.4 : sw; }
function Pa(d, f, sw, x){ return '<path d="' + d + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + (x || '') + '/>'; }
function Re(x, y, w, h, rx, f, sw, xx){ return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (rx || 0) + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '"' : '') + (xx || '') + '/>'; }
function Ci(cx, cy, r, f, sw, xx){ return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(r) + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '"' : '') + (xx || '') + '/>'; }
function El(cx, cy, rx, ry, f, sw, xx){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + f + '"' + (sw0(sw) ? ' stroke="' + K + '" stroke-width="' + sw0(sw) + '"' : '') + (xx || '') + '/>'; }
function Tr(d, c, w, op){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op !== undefined ? ' opacity="' + op + '"' : '') + '/>'; }
function Om(d, op){ return '<path d="' + d + '" fill="#160c22" opacity="' + (op || 0.2) + '"/>'; }
function Br(d, w, op){ return Tr(d, '#fff', w || 2.2, op || 0.55); }
function Halo(cx, cy, rx, ry, c, op){ return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="' + c + '" opacity="' + (op || 0.2) + '"/>'; }
function etincelle(x, y, r, c){ var a = r * 0.28; return '<path d="M' + f1(x) + ',' + f1(y - r) + ' L' + f1(x + a) + ',' + f1(y - a) + ' L' + f1(x + r) + ',' + f1(y) + ' L' + f1(x + a) + ',' + f1(y + a) + ' L' + f1(x) + ',' + f1(y + r) + ' L' + f1(x - a) + ',' + f1(y + a) + ' L' + f1(x - r) + ',' + f1(y) + ' L' + f1(x - a) + ',' + f1(y - a) + ' Z" fill="' + (c || '#fff') + '"/>'; }
function fleur(x, y, r, c, coeur){
  var s = '';
  for(var k = 0; k < 5; k++){ var a = k * 1.2566 - 1.5708; s += Ci(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.52, c, 1.3); }
  return s + Ci(x, y, r * 0.36, coeur || '#f6d23a', 1.2);
}
var VERRE = 'rgba(214,236,255,.30)';
var VIF = ['#e5484d', '#f08a3c', '#f6d23a', '#4fbf6a', '#3fd0c8', '#3f7fe0', '#9d6ee3', '#ef7fa8'];
var VERTS = ['#4f9a5c', '#8fd27a', '#3fa88a', '#c9b85a', '#2f7a4a'];
var LUMIERES = ['#ffd36a', '#ff9a4a', '#8ff3ff', '#ff8fb3', '#b6ff7a'];
var FOURRURES = ['#f2a65a', '#b9b3d2', '#4a4060', '#f3e7cb', '#c96a3e'];
var PELAGES = ['#f3f0ff', '#c9a27a', '#8a8aa0', '#e0b98a', '#6b5a50'];
var VERRES = ['#3f8a4a', '#3fa8a0', '#3f6fb0', '#7a3fa0', '#b03a3a', '#8a4f22'];
var POMMES = ['#e5484d', '#f08a3c', '#f6d23a', '#8fd24a', '#4fbf6a'];
var CIELS = ['#8fc7ff', '#ffb38a', '#c9a6ff', '#9fe0c0', '#ffd98a'];
var LIVRES = ['#7a2a3a', '#2f6b5a', '#3f4f9a', '#9a6a2a', '#6b3f8a'];
var LUEURS = ['#8ff3ff', '#b6ff7a', '#ffd36a', '#c9a6ff', '#ff9ad0'];

var DES = {};
/* h, w : hauteur et demi-largeur à l'échelle 1 ; asym : peut être retourné ; n : [min, max] ;
   d : 'gros' | 'petit' (taille du détail) ; pal : couleurs possibles (null : pas de couleur) */

DES.fiole = {h:55, w:18, d:'gros', art:function(o){
  var b = 'M-5,-44 L5,-44 L5,-29 C14,-26 17,-20 17,-14 C17,-5 9,0 0,0 C-9,0 -17,-5 -17,-14 C-17,-20 -14,-26 -5,-29 Z';
  return Halo(0, -14, 23, 20, o.c, 0.16) + Pa(b, VERRE) +
    Pa('M-15.5,-13 C-8,-17 8,-10 15.5,-13 C16,-5 9,-1.5 0,-1.5 C-9,-1.5 -16,-5 -15.5,-13 Z', o.c, 0) +
    Om('M15.5,-13 C16,-5 9,-1.5 0,-1.5 C6,-4 10,-8 11,-12 Z', 0.25) + Pa(b, 'none') +
    Br('M-11,-22 C-14,-16 -13,-10 -10,-6', 2.4) + Re(-7, -47, 14, 4, 2, '#d8ecff', 2) +
    (o.d ? Re(-5.5, -56, 11, 10, 2.5, '#c07a3e', 2.2) + Tr('M-3,-52 h6', '#8a4f22', 1.4) : '');
}};
DES.bocal = {h:46, w:18, d:'gros', art:function(o){
  return Re(-15, -36, 30, 36, 8, VERRE) +
    Pa('M-13,-24 C-6,-27 6,-21 13,-24 L13,-6 C13,-3 11,-2 8,-2 L-8,-2 C-11,-2 -13,-3 -13,-6 Z', o.c, 0) +
    Om('M13,-24 L13,-6 C13,-3 11,-2 8,-2 L3,-2 C7,-6 8,-14 8,-23 Z', 0.25) + Re(-15, -36, 30, 36, 8, 'none') +
    Re(-17, -45, 34, 10, 3, '#c98450') + Tr('M-13,-41 h26', '#f3c991', 1.6, 0.8) +
    (o.d ? Re(-10, -21, 20, 12, 2, '#f3e7cb', 1.8) + Tr('M-6,-17 h12 M-6,-13 h8', '#8a6a4a', 1.4) : '') + Br('M-10,-30 V-8', 2.2, 0.5);
}};
DES.livres = {h:56, w:26, n:[2, 4], d:'petit', art:function(o){
  var n = o.n, s = '', hs = [44, 38, 42, 35], x0 = -n * 6.5;
  for(var i = 0; i < n; i++){
    var x = x0 + i * 13, h = hs[i], c = i === 0 ? o.c : LIVRES[(i + (o.v || 0)) % LIVRES.length];
    s += Re(x, -h, 12, h, 2, c, 2.2) + Om('M' + f1(x + 8) + ',' + f1(-h + 1) + ' h3 v' + f1(h - 2) + ' h-3 Z', 0.22) +
      Tr('M' + f1(x + 2) + ',' + f1(-h + 6) + ' h8 M' + f1(x + 2) + ',-7 h8', '#ffe3a3', 1.6, 0.85);
  }
  if(o.d) s += Pa('M' + f1(x0 + 3) + ',' + (-hs[0]) + ' L' + f1(x0 + 3) + ',' + (-hs[0] - 12) + ' L' + f1(x0 + 6) + ',' + (-hs[0] - 9) + ' L' + f1(x0 + 9) + ',' + (-hs[0] - 12) + ' L' + f1(x0 + 9) + ',' + (-hs[0]) + ' Z', '#e5484d', 1.6);
  return s;
}};
DES.bougie = {h:56, w:14, d:'gros', art:function(o){
  return (o.d ? Halo(0, -46, 16, 16, '#ffd36a', 0.28) : '') +
    Pa('M-14,-3 C-14,-8 14,-8 14,-3 C14,1 -14,1 -14,-3 Z', '#d6a24a') + Tr('M13,-4 C20,-4 20,3 12,1', K, 2) +
    Pa('M-6,-36 L6,-36 L6,-5 L-6,-5 Z', o.c) + Om('M6,-36 L6,-5 L2,-5 L2,-36 Z', 0.22) +
    Pa('M-6,-36 C-6,-31 -3,-31 -3,-27 C-3,-24 0,-24 0,-28 L0,-36 Z', clair(o.c, 0.45), 1.4) + Tr('M0,-36 V-40', K, 1.8) +
    (o.d ? Pa('M0,-55 C6,-47 6,-42 0,-39 C-6,-42 -6,-47 0,-55 Z', '#ffd36a', 1.6, ' stroke="#e8693c"') + Pa('M0,-48 C2,-45 2,-43 0,-41 C-2,-43 -2,-45 0,-48 Z', '#fff6c8', 0) : '');
}};
DES.cristal = {h:50, w:22, asym:true, d:'gros', art:function(o){
  var c = o.c;
  return Halo(0, -22, 26, 26, c, 0.14) +
    Pa('M-14,0 L-8,-40 L-1,-48 L5,-40 L4,0 Z', c) + Pa('M-1,-48 L5,-40 L4,0 L-1,0 Z', fonce(c, 0.3), 0) + Pa('M-14,0 L-8,-40 L-1,-48 L5,-40 L4,0 Z', 'none') +
    Pa('M4,0 L9,-26 L15,-31 L19,-24 L16,0 Z', clair(c, 0.15)) + Om('M15,-31 L19,-24 L16,0 L13,0 Z', 0.25) +
    (o.d ? Pa('M-13,0 L-21,-17 L-17,-23 L-11,-14 L-9,0 Z', clair(c, 0.4)) : '') +
    Br('M-7,-36 L-6,-8', 2.4) + Pa('M-21,1 C-19,-5 19,-5 22,1 Z', '#77729c', 2);
}};
DES.sablier = {h:50, w:15, d:'gros', art:function(o){
  var v = 'M-10,-44 C-10,-30 -2,-28 -2,-25 C-2,-22 -10,-20 -10,-6 L10,-6 C10,-20 2,-22 2,-25 C2,-28 10,-30 10,-44 Z';
  return Pa(v, VERRE) + Pa('M-8,-7 C-7,-14 -3,-17 0,-18 C3,-17 7,-14 8,-7 Z', o.c, 0) +
    (o.d ? Pa('M-8,-42 L8,-42 C7,-36 3,-32 0,-29 C-3,-32 -7,-36 -8,-42 Z', o.c, 0) + Tr('M0,-29 V-18', o.c, 1.6) : '') +
    Pa(v, 'none') + Re(-13.5, -44, 3, 38, 1, '#8a5a33', 1.6) + Re(10.5, -44, 3, 38, 1, '#8a5a33', 1.6) +
    Re(-15, -50, 30, 6, 2.5, '#a8743f') + Re(-15, -6, 30, 6, 2.5, '#a8743f') + Br('M-6,-40 C-6,-34 -4,-31 -3,-29', 1.8);
}};
DES.mortier = {h:44, w:20, asym:true, d:'gros', art:function(o){
  return (o.d ? Pa('M1,-21 L15,-40 C17,-44 22,-42 20,-38 L7,-19 Z', '#d8c8b0') : '') +
    Pa('M-18,-22 C-18,-6 -10,0 0,0 C10,0 18,-6 18,-22 Z', '#9a94b8') + Om('M18,-22 C18,-6 10,0 0,0 C8,-4 11,-12 11,-22 Z', 0.22) +
    El(0, -22, 18, 5, '#6a6488') + El(0, -22, 13, 3, o.c, 0) + Re(-12, -3, 24, 4, 2, '#77729c', 2) + Br('M-13,-16 C-12,-9 -8,-5 -4,-4', 2);
}};
DES.encrier = {h:56, w:22, asym:true, d:'petit', art:function(o){
  return Pa('M2,-20 C4,-36 12,-48 22,-54 C21,-40 14,-28 5,-19 Z', o.c) + Tr('M3,-19 L20,-50', K, 1.4) + Tr('M8,-31 L13,-35 M10,-38 L16,-42', fonce(o.c, 0.3), 1.3) +
    Pa('M-12,0 L-13,-14 C-13,-18 13,-18 13,-14 L12,0 Z', '#2a2440') + Re(-6, -21, 12, 5, 2, '#3a3352', 2) + Br('M-8,-12 V-4', 2, 0.4) +
    (o.d ? Pa('M-13,1 C-24,2 -26,-5 -19,-8 C-16,-12 -11,-7 -11,-3 Z', '#3a3a7a', 1.6) : '');
}};
DES.chaudronMini = {h:50, w:26, d:'gros', art:function(o){
  return Tr('M-14,-3 L-17,2 M14,-3 L17,2', K, 3.5) +
    Pa('M-21,-24 C-23,-6 -12,0 0,0 C12,0 23,-6 21,-24 Z', '#3a3352') + Om('M21,-24 C23,-6 12,0 0,0 C9,-5 13,-13 14,-24 Z', 0.3) + Br('M-15,-17 C-14,-10 -10,-6 -5,-4', 2.2, 0.4) +
    El(0, -24, 23, 6, '#2b2540') + El(0, -24, 19, 4, o.c, 0) + Tr('M-23,-22 C-28,-24 -28,-17 -22,-16 M23,-22 C28,-24 28,-17 22,-16', K, 2.6) +
    (o.d ? Ci(-7, -27, 3.4, clair(o.c, 0.4), 1.5) + Ci(5, -29, 4.2, clair(o.c, 0.4), 1.5) + Tr('M-4,-33 C-8,-39 0,-42 -4,-49 M7,-35 C3,-41 11,-44 7,-50', '#ffffff', 2, 0.5) : '');
}};
function champi(x, k, c, d){
  var g = '<g transform="translate(' + f1(x) + ',0) scale(' + k + ')">';
  g += Pa('M-6,0 C-6,-8 -5,-16 -4,-20 L4,-20 C5,-16 6,-8 6,0 Z', '#fff4dc') + Om('M6,0 C6,-8 5,-16 4,-20 L2,-20 C3,-12 3,-6 2,0 Z', 0.15);
  g += Pa('M-20,-18 C-20,-36 20,-36 20,-18 C14,-15 -14,-15 -20,-18 Z', c) + Om('M20,-18 C20,-30 14,-34 8,-34 C14,-28 15,-22 12,-16 C16,-16 18,-17 20,-18 Z', 0.22);
  if(d) g += Ci(-9, -26, 3.4, '#fff', 1.4) + Ci(4, -30, 3, '#fff', 1.4) + Ci(11, -22, 2.6, '#fff', 1.4);
  return g + Br('M-14,-24 C-12,-29 -8,-31 -4,-32', 2) + '</g>';
}
DES.champignon = {h:40, w:26, n:[1, 3], asym:true, asymSi:function(o){ return o.n > 1; }, d:'gros', art:function(o){
  var pos = [[0, 1], [-15, 0.72], [14, 0.62]], s = '';
  for(var i = o.n - 1; i >= 0; i--) s += champi(pos[i][0], pos[i][1], o.c, o.d);
  return s;
}};
function champiL(x, k, c){
  return '<g transform="translate(' + f1(x) + ',0) scale(' + k + ')">' + Halo(0, -32, 20, 14, c, 0.35) +
    Pa('M-4,0 C-4,-12 -3,-22 -2,-28 L2,-28 C3,-22 4,-12 4,0 Z', '#e8fbff') +
    Pa('M-15,-27 C-15,-43 15,-43 15,-27 C9,-24 -9,-24 -15,-27 Z', c) + Om('M15,-27 C15,-37 10,-41 5,-42 C10,-36 11,-30 9,-25 C12,-25 14,-26 15,-27 Z', 0.18) +
    Br('M-9,-33 C-7,-37 -3,-39 1,-40', 2.2, 0.85) + Ci(6, -33, 1.8, '#ffffff', 0, ' opacity=".85"') + '</g>';
}
DES.champiLum = {h:44, w:28, n:[2, 4], asym:true, d:'petit', pal:LUEURS, art:function(o){
  var pos = [[0, 1], [-15, 0.72], [14, 0.62], [-27, 0.5]], s = Halo(0, -18, 36, 26, o.c, 0.2);
  for(var i = o.n - 1; i >= 0; i--) s += champiL(pos[i][0], pos[i][1], o.c);
  if(o.d) s += etincelle(-18, -40, 5, '#ffffff') + etincelle(20, -36, 4, '#ffffff') + etincelle(4, -50, 3.5, '#ffffff');
  return s;
}};
DES.chat = {h:48, w:22, asym:true, d:'petit', pal:FOURRURES, art:function(o){
  var c = o.c, ci = '#ff9fb8';
  return Pa('M8,-4 C22,-4 25,-16 19,-24 C17,-26 14,-24 16,-21 C19,-16 18,-9 8,-9', c) +
    Pa('M-14,0 C-16,-10 -14,-22 -6,-26 C0,-28 8,-24 10,-14 C12,-6 10,0 6,0 Z', c) + Om('M10,-14 C12,-6 10,0 6,0 L0,0 C5,-5 6,-12 4,-20 Z', 0.2) +
    Pa('M-18,-34 L-17,-47 L-10,-40 Z', c) + Pa('M0,-34 L-1,-47 L-8,-40 Z', c) + Pa('M-16,-38 L-15.5,-44 L-12,-40 Z', ci, 0) + Pa('M-2,-38 L-2.5,-44 L-6,-40 Z', ci, 0) +
    Ci(-9, -33, 10, c) + Ci(-13, -34, 1.7, K, 0) + Ci(-5, -34, 1.7, K, 0) + Pa('M-10.5,-30.5 L-7.5,-30.5 L-9,-29 Z', ci, 1) +
    Tr('M-19,-31 h-6 M-19,-29 l-5,2 M1,-31 h6 M1,-29 l5,2', K, 1, 0.6) +
    El(-11, -1.5, 4, 2.5, clair(c, 0.3), 1.6) + El(-3, -1.5, 4, 2.5, clair(c, 0.3), 1.6) +
    (o.d ? Tr('M-16,-24 C-12,-22 -6,-22 -2,-24', '#e5484d', 3.4) + Ci(-9, -20.5, 3.8, '#f6d23a', 1.5) : '');
}};
DES.herbes = {h:52, w:15, pend:true, d:'petit', pal:VERTS, art:function(o){
  var c = o.c;
  return Tr('M0,0 V12', '#c9a874', 1.6) +
    Pa('M0,14 C-13,24 -11,40 -4,48 C-4,36 -3,26 0,14 Z', fonce(c, 0.2)) + Pa('M0,14 C13,24 11,40 4,48 C4,36 3,26 0,14 Z', c) +
    Pa('M0,14 C-5,28 5,42 0,52 C-5,42 5,28 0,14 Z', clair(c, 0.25)) + Re(-5, 11, 10, 6, 2, '#c94a3a', 1.8) +
    (o.d ? Ci(-6, 44, 2.8, '#ef7fa8', 1.2) + Ci(5, 46, 2.8, '#ef7fa8', 1.2) + Ci(0, 51, 2.8, '#ffe3f0', 1.2) : '');
}};
DES.lanterne = {h:50, w:14, pend:true, d:'gros', pal:LUMIERES, couleurSi:function(o){ return o.d; }, art:function(o){
  var c = o.c;
  return Tr('M0,0 V9', K, 2) + Ci(0, 12, 3.5, 'none', 2) + (o.d ? Halo(0, 33, 26, 24, c, 0.28) : '') +
    Pa('M-9,18 L9,18 L12,22 L-12,22 Z', '#3a3352') + Re(-10, 22, 20, 22, 3, o.d ? c : '#5a5470') + Tr('M-4,22 V44 M4,22 V44', '#3a3352', 2) +
    Pa('M-12,44 L12,44 L9,49 L-9,49 Z', '#3a3352') + (o.d ? Pa('M0,27 C3,31 3,35 0,38 C-3,35 -3,31 0,27 Z', '#fff7d0', 1) : '');
}};
DES.lampadaire = {h:114, w:16, d:'gros', pal:LUMIERES, couleurSi:function(o){ return o.d; }, art:function(o){
  var c = o.c;
  return (o.d ? Halo(0, -92, 32, 30, c, 0.3) : '') +
    Re(-9, -7, 18, 7, 2, '#3a3352') + Re(-3, -80, 6, 73, 2, '#3a3352') + Tr('M-1,-76 V-10', '#8a82b0', 1.6, 0.6) +
    Pa('M-12,-80 L12,-80 L9,-85 L-9,-85 Z', '#3a3352') + Re(-9, -103, 18, 18, 3, o.d ? c : '#5a5470') + Tr('M0,-103 V-85', '#3a3352', 2) +
    Pa('M-14,-103 L14,-103 L0,-113 Z', '#3a3352') + Ci(0, -114, 2.5, '#3a3352', 1.6);
}};
DES.fleursPot = {h:50, w:20, n:[2, 5], d:'petit', art:function(o){
  var xs = [[0, -44], [-10, -38], [10, -38], [-15, -29], [15, -29]], s = '';
  for(var i = 0; i < o.n; i++) s += Tr('M0,-18 Q' + f1(xs[i][0] * 0.4) + ',' + f1((xs[i][1] - 18) / 2) + ' ' + xs[i][0] + ',' + xs[i][1], '#3f8a4a', 2.2);
  s += Pa('M0,-20 C-8,-26 -14,-24 -16,-20 C-10,-18 -4,-18 0,-20 Z', '#4fbf6a', 1.6) + Pa('M0,-20 C8,-26 14,-24 16,-20 C10,-18 4,-18 0,-20 Z', '#4fbf6a', 1.6);
  for(i = 0; i < o.n; i++) s += fleur(xs[i][0], xs[i][1], 6.5, o.c);
  s += Pa('M-13,-18 L13,-18 L10,0 L-10,0 Z', '#c96a3e') + Om('M13,-18 L10,0 L4,0 L7,-18 Z', 0.2) + Re(-15, -22, 30, 6, 2, '#e08a5a');
  if(o.d) s += Tr('M-11.5,-10 H11.5', '#f6d23a', 3);
  return s;
}};
function oiseau1(x, c, d){
  return '<g transform="translate(' + x + ',0)">' + Tr('M-2,0 v-3 M2,0 v-3', '#e8a04a', 1.6) +
    Pa('M-8,-8 L-16,-12 L-13,-5 Z', fonce(c, 0.25), 1.6) +
    Pa('M-9,-6 C-10,-14 -4,-18 2,-17 C8,-16 10,-10 8,-5 C5,-2 -6,-2 -9,-6 Z', c) +
    Ci(4, -17, 5.5, c) + Pa('M9,-18 L13.5,-16.5 L9,-15 Z', '#f6a23a', 1.2) + Ci(5.5, -18, 1.2, K, 0) +
    Pa('M-4,-12 C0,-9 5,-10 6,-7 C2,-6 -2,-7 -4,-12 Z', fonce(c, 0.2), 1.4) +
    Pa('M-6,-7 C-2,-4 4,-4 7,-6 C4,-3 -3,-3 -6,-7 Z', clair(c, 0.4), 0) +
    (d ? Pa('M1,-21 C-1,-30 6,-32 7,-24 Z', '#e5484d', 1.4) : '') + '</g>';
}
DES.oiseau = {h:26, w:26, n:[1, 3], asym:true, d:'petit', art:function(o){
  var pos = [[0], [-9, 9], [-17, 0, 17]][o.n - 1], s = '';
  pos.forEach(function(x){ s += oiseau1(x, o.c, o.d); });
  return s;
}};
DES.fanions = {h:30, w:62, n:[4, 6], pend:true, d:'petit', art:function(o){
  var n = o.n, s = Tr('M-62,0 Q0,22 62,0', '#6a4a3a', 2);
  for(var i = 0; i < n; i++){
    var t = (i + 0.5) / n, x = -62 + 124 * t, y = 2 * (1 - t) * t * 22, c = i % 2 ? '#f3e7cb' : o.c;
    s += Pa('M' + f1(x - 8) + ',' + f1(y) + ' L' + f1(x + 8) + ',' + f1(y) + ' L' + f1(x) + ',' + f1(y + 17) + ' Z', c, 1.8);
    if(o.d && i === 0) s += etincelle(x, y + 6, 3.5, '#f6d23a');
  }
  return s;
}};
DES.panneau = {h:62, w:28, asym:true, d:'gros', art:function(o){
  return Re(-3, -58, 6, 58, 2, '#8a5634') +
    Pa('M-4,-57 L18,-57 L27,-49 L18,-41 L-4,-41 Z', o.c) + Om('M27,-49 L18,-41 L-4,-41 L-4,-45 L16,-45 Z', 0.2) + Tr('M2,-49 h14', '#fff4dc', 2.4, 0.9) +
    (o.d ? Pa('M4,-37 L-18,-37 L-27,-29 L-18,-21 L4,-21 Z', '#d29a5e') + Tr('M-2,-29 h-14', '#6b3f24', 2, 0.8) : '');
}};
DES.tonneau = {h:48, w:21, d:'gros', art:function(o){
  return Pa('M-16,-44 C-21,-30 -21,-14 -16,0 L16,0 C21,-14 21,-30 16,-44 Z', '#b06f3e') + Om('M16,-44 C21,-30 21,-14 16,0 L8,0 C12,-14 12,-30 9,-44 Z', 0.22) +
    Tr('M-6,-44 C-8,-30 -8,-14 -6,0 M6,-44 C8,-30 8,-14 6,0', '#7d4626', 1.4, 0.7) +
    Re(-18.5, -38, 37, 5, 2, '#3a3352', 2) + Re(-18.5, -10, 37, 5, 2, '#3a3352', 2) + Re(-20.5, -27, 41, 9, 2, o.c, 2) +
    El(0, -44, 16, 3.5, '#c98450', 2.2) + (o.d ? Re(-4.5, -15, 9, 7, 1.5, '#d6a24a', 1.8) + Re(-1.5, -9, 3, 6, 1, '#d6a24a', 1.4) : '');
}};
DES.fenetre = {h:48, w:25, d:'gros', art:function(o){
  var c = o.c;
  return Re(-12, -42, 24, 36, 3, '#ffd98a') + Halo(0, -24, 10, 14, '#fff6d0', 0.6) + Tr('M0,-42 V-6 M-12,-24 H12', '#6b3f24', 2.4) + Re(-12, -42, 24, 36, 3, 'none') +
    Pa('M-12,-42 L-24,-40 L-24,-8 L-12,-6 Z', c) + Pa('M12,-42 L24,-40 L24,-8 L12,-6 Z', c) + Tr('M-21,-35 V-13 M-16,-37 V-11 M16,-37 V-11 M21,-35 V-13', fonce(c, 0.35), 1.4) +
    Re(-15, -7, 30, 5, 2, '#d8cfc0') +
    (o.d ? Re(-14, -2, 28, 8, 2, '#8a5634') + Ci(-9, -3, 3.2, '#ef7fa8', 1.2) + Ci(0, -4, 3.2, '#f6d23a', 1.2) + Ci(9, -3, 3.2, '#ef7fa8', 1.2) : '');
}};
DES.lapin = {h:50, w:20, asym:true, d:'gros', pal:PELAGES, art:function(o){
  var c = o.c, ci = '#ffb3c6';
  return Ci(12, -8, 5, '#ffffff', 2) +
    Pa('M-12,0 C-16,-12 -10,-24 0,-24 C10,-24 14,-12 12,0 Z', c) + Om('M12,0 C14,-12 10,-24 2,-24 C8,-18 8,-8 6,0 Z', 0.18) +
    Pa('M-15,-34 C-20,-50 -13,-52 -10,-37 Z', c) + Pa('M-7,-36 C-7,-52 0,-52 -2,-36 Z', c) + Pa('M-14.5,-38 C-17,-47 -14,-48 -12.5,-39 Z', ci, 0) + Pa('M-5.5,-38 C-5.5,-48 -2,-48 -3,-38 Z', ci, 0) +
    El(-8, -30, 9, 8, c) + Ci(-11, -31, 1.6, K, 0) + Pa('M-15.5,-28 L-13.5,-28 L-14.5,-26.5 Z', ci, 1) +
    El(-9, -1.5, 4.5, 2.5, clair(c, 0.3), 1.6) + El(-1, -1.5, 4.5, 2.5, clair(c, 0.3), 1.6) +
    (o.d ? Pa('M-20,-17 L-11,-12 L-17,-6 Z', '#f08a3c', 1.6) + Tr('M-19,-16 l-3,-5 M-19,-16 l-6,-1', '#4fbf6a', 2) : '');
}};
DES.papillon = {h:32, w:22, d:'petit', art:function(o){
  var c = o.c, cc = clair(c, 0.35);
  return '<g transform="translate(0,-16)">' +
    Pa('M0,-2 C-6,-14 -22,-16 -20,-4 C-19,2 -8,2 0,0 Z', c) + Pa('M0,-2 C6,-14 22,-16 20,-4 C19,2 8,2 0,0 Z', c) +
    Pa('M0,1 C-6,4 -16,8 -12,14 C-8,16 -3,10 0,3 Z', cc) + Pa('M0,1 C6,4 16,8 12,14 C8,16 3,10 0,3 Z', cc) +
    El(0, 1, 2.2, 9, '#3a3352', 1.6) + Tr('M-1,-7 C-3,-12 -6,-14 -7,-15 M1,-7 C3,-12 6,-14 7,-15', K, 1.4) +
    (o.d ? Ci(-12, -7, 4, '#ffffff', 1.3) + Ci(12, -7, 4, '#ffffff', 1.3) : '') + '</g>';
}};
function herbeTouffe(w){ return Tr('M' + (-w) + ',0 C' + (-w + 2) + ',-8 ' + (-w - 2) + ',-12 ' + (-w - 4) + ',-14 M' + (-w / 3) + ',0 C' + (-w / 3) + ',-9 ' + (-w / 3 + 2) + ',-13 ' + (-w / 3 + 3) + ',-16 M' + (w / 3) + ',0 C' + (w / 3) + ',-8 ' + (w / 3 - 1) + ',-12 ' + (w / 3 - 3) + ',-14 M' + w + ',0 C' + (w - 1) + ',-7 ' + (w + 1) + ',-11 ' + (w + 3) + ',-13', '#3f8a4a', 2.2); }
DES.fleurs = {h:42, w:22, n:[2, 5], d:'petit', art:function(o){
  var xs = [[0, -36], [-11, -28], [11, -30], [-18, -18], [18, -20]], s = herbeTouffe(14);
  for(var i = 0; i < o.n; i++) s += Tr('M0,0 Q' + f1(xs[i][0] * 0.3) + ',' + f1(xs[i][1] / 2) + ' ' + xs[i][0] + ',' + xs[i][1], '#3f8a4a', 2);
  s += Pa('M0,-6 C-7,-12 -13,-10 -14,-6 C-9,-4 -4,-4 0,-6 Z', '#5fbf5a', 1.5) + Pa('M0,-8 C7,-14 13,-12 14,-8 C9,-6 4,-6 0,-8 Z', '#5fbf5a', 1.5);
  for(i = 0; i < o.n; i++) s += fleur(xs[i][0], xs[i][1], 6.5, o.c);
  if(o.d) s += El(11, -9, 4.8, 4, '#e5484d', 1.4) + Tr('M11,-13 V-5', K, 1.1) + Ci(9.5, -9, 1.1, K, 0) + Ci(12.5, -8, 1.1, K, 0);
  return s;
}};
DES.baies = {h:46, w:27, n:[2, 5], d:'petit', pal:['#7d3aa8', '#3f4fd0', '#e5484d', '#e0408a', '#2a2a6a'], art:function(o){
  var s = Pa('M-24,0 C-30,-10 -24,-24 -14,-26 C-12,-38 4,-42 10,-32 C20,-36 30,-24 24,-12 C30,-6 26,0 22,0 Z', '#3f8a4a') +
    Pa('M-14,-26 C-10,-30 -4,-31 0,-28 M10,-32 C14,-30 16,-27 16,-24', 'none', 1.6) +
    Om('M24,-12 C30,-6 26,0 22,0 L8,0 C16,-6 20,-12 24,-12 Z', 0.2) +
    Pa('M-18,-14 C-12,-20 -6,-18 -4,-14 C-8,-12 -14,-12 -18,-14 Z', '#5fbf5a', 1.4) + Pa('M6,-20 C12,-26 18,-24 20,-20 C16,-18 10,-18 6,-20 Z', '#5fbf5a', 1.4);
  var pos = [[-10, -26], [9, -29], [0, -13], [-17, -9], [17, -11]], c = o.c;
  for(var i = 0; i < o.n; i++){
    var x = pos[i][0], y = pos[i][1];
    s += Ci(x - 3.5, y + 1, 4, c, 1.5) + Ci(x + 3.5, y + 1, 4, c, 1.5) + Ci(x, y - 4.5, 4, c, 1.5) +
      Ci(x - 4.5, y, 1.1, '#ffffff', 0, ' opacity=".7"') + Ci(x + 2.5, y, 1.1, '#ffffff', 0, ' opacity=".7"') + Ci(x - 1, y - 5.5, 1.1, '#ffffff', 0, ' opacity=".7"');
  }
  if(o.d) s += fleur(-21, -20, 4.5, '#fff4f8', '#f6d23a');
  return s;
}};
DES.rocher = {h:32, w:24, d:'gros', pal:['#6dbb6a', '#3fa88a', '#a8d84a', '#4f9a5c'], art:function(o){
  return Pa('M-22,0 C-25,-14 -12,-26 0,-26 C14,-26 25,-14 22,0 Z', '#8a86a8') + Om('M22,0 C25,-14 14,-26 4,-26 C14,-18 14,-8 10,0 Z', 0.2) +
    Pa('M-19,-13 C-17,-23 -4,-28 6,-26 C14,-25 21,-18 21,-11 C14,-15 7,-11 1,-13 C-6,-9 -13,-14 -19,-13 Z', o.c, 1.8) + Br('M-14,-6 C-15,-3 -14,-1 -12,0', 2, 0.35) +
    (o.d ? '<g transform="translate(9,-22) scale(.45)">' + champi(0, 1, '#e5484d', true) + '</g>' : '');
}};
DES.souche = {h:46, w:26, d:'gros', art:function(o){
  return Pa('M-26,0 C-22,-4 -20,-6 -18,-10 L18,-10 C20,-6 22,-4 26,0 Z', '#7a4a2a') +
    Pa('M-18,0 C-16,-10 -16,-24 -16,-30 L16,-30 C16,-24 16,-10 18,0 Z', '#8a5634') + Om('M16,-30 C16,-24 16,-10 18,0 L8,0 C10,-10 10,-22 9,-30 Z', 0.22) +
    Tr('M-8,-28 C-9,-18 -9,-8 -10,0 M4,-28 C5,-18 4,-8 6,0', '#5a3820', 1.4, 0.7) +
    El(0, -30, 16, 5, '#d29a5e') + El(0, -30, 9, 2.6, 'none', 1.2) + El(0, -30, 4, 1.2, 'none', 1) +
    Pa('M16,-20 C27,-21 29,-13 17,-12 Z', o.c, 1.8) + Pa('M16,-11 C24,-12 26,-5 17,-4 Z', o.c, 1.8) +
    (o.d ? Tr('M-4,-31 C-4,-38 -2,-42 0,-46', '#3f8a4a', 2) + Pa('M0,-46 C6,-50 10,-46 8,-42 C4,-42 2,-44 0,-46 Z', '#5fbf5a', 1.4) + Pa('M-3,-40 C-9,-43 -12,-39 -10,-36 C-6,-36 -4,-38 -3,-40 Z', '#5fbf5a', 1.4) : '');
}};
DES.chope = {h:44, w:20, asym:true, d:'gros', art:function(o){
  return Tr('M9,-27 C20,-27 20,-10 9,-10', K, 6.5) + Tr('M9,-27 C20,-27 20,-10 9,-10', clair(o.c, 0.1), 3) +
    Re(-12, -32, 22, 32, 4, o.c) + Om('M10,-28 L10,-4 C10,-2 8,0 6,0 L2,0 L2,-32 L6,-32 C8,-32 10,-30 10,-28 Z', 0.22) +
    Tr('M-12,-24 H10 M-12,-8 H10', fonce(o.c, 0.35), 2.2) + Br('M-8,-28 V-12', 2.2, 0.5) +
    (o.d ? Pa('M-14,-31 C-16,-38 -8,-42 -4,-38 C-2,-43 6,-43 8,-38 C12,-40 16,-36 12,-30 Z', '#fff8e6', 2) + Pa('M-11,-31 C-11,-26 -8,-26 -8,-29 Z', '#fff8e6', 1.4) : '');
}};
DES.bouteille = {h:58, w:12, d:'gros', pal:VERRES, art:function(o){
  var c = o.c;
  return Pa('M-4,-54 L4,-54 L4,-40 C11,-36 11,-30 11,-26 L11,-3 C11,-1 9,0 7,0 L-7,0 C-9,0 -11,-1 -11,-3 L-11,-26 C-11,-30 -11,-36 -4,-40 Z', c) +
    Om('M4,-40 C11,-36 11,-30 11,-26 L11,-3 C11,-1 9,0 7,0 L4,0 C6,-10 6,-30 4,-40 Z', 0.25) + Br('M-7,-28 V-6', 2.4, 0.45) +
    Re(-5, -58, 10, 6, 2, '#c98450', 2) +
    (o.d ? Re(-10, -22, 20, 13, 2, '#f3e7cb', 1.8) + Tr('M-6,-18 h12 M-6,-14 h8', '#8a6a4a', 1.3) : '');
}};
DES.assiette = {h:28, w:25, n:[1, 3], d:'gros', art:function(o){
  var s = El(0, -4, 25, 6, o.c) + El(0, -5, 19, 4, '#f3f0ff', 1.6);
  var pos = [[[0]], [[-8], [8]], [[-11], [0], [11]]][o.n - 1];
  pos.forEach(function(p, i){ var x = p[0], y = o.n === 3 && i === 1 ? -12 : -9;
    s += Pa('M' + (x - 9) + ',' + (y + 4) + ' C' + (x - 10) + ',' + (y - 6) + ' ' + (x + 10) + ',' + (y - 6) + ' ' + (x + 9) + ',' + (y + 4) + ' Z', '#d9984a', 1.8) +
      Tr('M' + (x - 4) + ',' + (y - 1) + ' l3,-2 M' + (x + 1) + ',' + y + ' l3,-2', '#8a5020', 1.3) + Br('M' + (x - 6) + ',' + y + ' C' + (x - 5) + ',' + (y - 2) + ' ' + (x - 3) + ',' + (y - 3) + ' ' + (x - 1) + ',' + (y - 3), 1.4, 0.5); });
  if(o.d) s += Pa('M14,-6 L26,-15 L26,-5 Z', '#f6d23a', 1.6) + Ci(22, -9, 1.3, '#d6a22a', 0);
  return s;
}};
DES.tableau = {h:54, w:27, d:'gros', pal:CIELS, art:function(o){
  return Tr('M-10,-44 L0,-53 L10,-44', '#6a4a3a', 1.4) + Ci(0, -53, 1.8, '#3a3352', 0) +
    Re(-27, -45, 54, 41, 3, '#b8862e') + Re(-21, -39, 42, 29, 1, o.c, 1.8) +
    Pa('M-21,-15 C-12,-25 -4,-21 2,-17 C8,-23 16,-25 21,-19 L21,-10 L-21,-10 Z', '#4f9a5c', 1.5) +
    (o.d ? Ci(10, -30, 5.5, '#ffe36a', 1.4) : '') + Tr('M-24,-42 h48', '#fff1b8', 1.4, 0.6);
}};
DES.chapeau = {h:34, w:24, pend:true, asym:true, d:'gros', art:function(o){
  return Re(-3, 0, 6, 8, 1, '#8a5634', 1.8) +
    Pa('M-11,27 L-9,10 C-4,6 4,6 9,10 L11,27 Z', '#3a3352') + Om('M9,10 L11,27 L5,27 L4,9 Z', 0.25) +
    El(0, 28, 22, 5, '#2b2540') + Re(-11, 20, 22, 5, 1, o.c, 1.8) +
    (o.d ? Pa('M8,22 C16,10 22,4 27,1 C23,11 17,18 11,24 Z', '#f3e7cb', 1.8) + Tr('M10,23 L25,3', '#c9b8a0', 1) : '');
}};
DES.horloge = {h:48, w:17, asym:true, d:'gros', art:function(o){
  return (o.d ? Tr('M0,-15 V-4', '#b8862e', 2) + Ci(0, -2, 4, '#f6d23a', 1.6) : '') +
    Ci(0, -31, 16, o.c) + Ci(0, -31, 11.5, '#f8f0dc', 1.6) +
    Tr('M0,-41 v2 M0,-21 v-2 M-10,-31 h2 M10,-31 h-2', K, 1.4) + Tr('M0,-31 L-6,-36', K, 2.2) + Tr('M0,-31 L7,-39', K, 1.6) + Ci(0, -31, 1.6, K, 0);
}};
DES.pommes = {h:42, w:26, n:[1, 6], d:'petit', pal:POMMES, art:function(o){
  var pos = [[0, -8], [-14, -8], [14, -8], [-7, -20], [7, -20], [0, -32]], s = '', c = o.c;
  for(var i = 0; i < o.n; i++){ var x = pos[i][0], y = pos[i][1];
    s += Pa('M' + x + ',' + (y - 7) + ' C' + (x - 4) + ',' + (y - 11) + ' ' + (x - 10) + ',' + (y - 9) + ' ' + (x - 10) + ',' + (y - 2) + ' C' + (x - 10) + ',' + (y + 5) + ' ' + (x - 4) + ',' + (y + 7) + ' ' + x + ',' + (y + 6) + ' C' + (x + 4) + ',' + (y + 7) + ' ' + (x + 10) + ',' + (y + 5) + ' ' + (x + 10) + ',' + (y - 2) + ' C' + (x + 10) + ',' + (y - 9) + ' ' + (x + 4) + ',' + (y - 11) + ' ' + x + ',' + (y - 7) + ' Z', c, 1.8) +
      Tr('M' + x + ',' + (y - 7) + ' l1,-4', '#5e3a1e', 1.6) + Br('M' + (x - 6) + ',' + (y - 4) + ' C' + (x - 6) + ',' + (y - 6) + ' ' + (x - 5) + ',' + (y - 7) + ' ' + (x - 3) + ',' + (y - 7), 1.6, 0.6); }
  var top = pos[o.n - 1];
  if(o.d) s += Pa('M' + (top[0] + 1) + ',' + (top[1] - 10) + ' C' + (top[0] + 6) + ',' + (top[1] - 17) + ' ' + (top[0] + 12) + ',' + (top[1] - 14) + ' ' + (top[0] + 12) + ',' + (top[1] - 12) + ' C' + (top[0] + 8) + ',' + (top[1] - 9) + ' ' + (top[0] + 4) + ',' + (top[1] - 9) + ' ' + (top[0] + 1) + ',' + (top[1] - 10) + ' Z', '#4fbf6a', 1.4);
  return s;
}};
DES.panier = {h:42, w:24, d:'gros', art:function(o){
  return (o.d ? Tr('M-18,-18 C-18,-42 18,-42 18,-18', K, 5.5) + Tr('M-18,-18 C-18,-42 18,-42 18,-18', '#c98450', 2.6) : '') +
    Pa('M-17,-18 C-11,-27 -3,-22 3,-27 C9,-22 14,-25 18,-18 Z', o.c, 1.8) +
    Pa('M-22,-18 L22,-18 L17,0 L-17,0 Z', '#c98450') + Om('M22,-18 L17,0 L9,0 L13,-18 Z', 0.2) +
    Tr('M-20,-11 H20 M-18,-5 H18 M-12,-18 L-10,0 M0,-18 V0 M12,-18 L10,0', '#8a5634', 1.4) + Re(-23, -21, 46, 5, 2, '#d29a5e', 2);
}};
DES.sac = {h:52, w:23, d:'gros', art:function(o){
  var c = o.c;
  return (o.d ? Pa('M10,0 C11,-7 20,-7 23,0 Z', '#fffaf0', 1.6) + Ci(18, -9, 1.6, '#fffaf0', 0) + Ci(22, -12, 1.2, '#fffaf0', 0) : '') +
    Pa('M-16,0 C-20,-14 -18,-30 -10,-36 L-6,-40 L6,-40 L10,-36 C18,-30 20,-14 16,0 Z', '#efe4cc') + Om('M16,0 C20,-14 18,-30 10,-36 C12,-24 12,-10 8,0 Z', 0.18) +
    Pa('M-6,-40 C-9,-47 -2,-49 0,-45 C2,-49 9,-47 6,-40 Z', '#efe4cc', 2) + Tr('M-8,-38 h16', '#8a6a4a', 2.6) +
    Tr('M0,-9 V-29', c, 2.4) + El(-4, -24, 3, 1.6, c, 0, ' transform="rotate(-35 -4 -24)"') + El(4, -24, 3, 1.6, c, 0, ' transform="rotate(35 4 -24)"') +
    El(-4, -18, 3, 1.6, c, 0, ' transform="rotate(-35 -4 -18)"') + El(4, -18, 3, 1.6, c, 0, ' transform="rotate(35 4 -18)"') + El(0, -30, 1.8, 3, c, 0);
}};
function engrenagePath(n, R, r){
  var d = '', pas = Math.PI * 2 / n;
  for(var i = 0; i < n; i++){
    var a = i * pas, pts = [[a - pas * 0.32, r], [a - pas * 0.2, R], [a + pas * 0.2, R], [a + pas * 0.32, r]];
    pts.forEach(function(p, k){ d += (i === 0 && k === 0 ? 'M' : 'L') + f1(Math.cos(p[0]) * p[1]) + ',' + f1(Math.sin(p[0]) * p[1]) + ' '; });
  }
  return d + 'Z';
}
DES.engrenage = {h:52, w:26, n:[6, 10], nSubtil:true, d:'gros', pal:['#d6a24a', '#c96a3e', '#8a8aa0', '#5fa88a'], art:function(o){
  var c = o.c;
  return '<g transform="translate(0,-26)">' + Pa(engrenagePath(o.n, 25, 19), c) + Ci(0, 0, 13, fonce(c, 0.12), 2) +
    (o.d ? Ci(0, -8, 3, '#3a2a1a', 1.4) + Ci(7, 4, 3, '#3a2a1a', 1.4) + Ci(-7, 4, 3, '#3a2a1a', 1.4) : '') + Ci(0, 0, 4.5, '#3a3352', 2) + Br('M-14,-8 C-12,-12 -8,-15 -4,-16', 2, 0.5) + '</g>';
}};
DES.gerbe = {h:58, w:20, n:[3, 5], d:'petit', art:function(o){
  var n = o.n, s = '';
  for(var i = 0; i < n; i++){
    var a = (i - (n - 1) / 2) * 0.32, x = Math.sin(a) * 40, y = -Math.cos(a) * 40;
    s += Tr('M' + f1(-a * 10) + ',0 L' + f1(x) + ',' + f1(y), '#c9a24a', 2.2);
    s += '<g transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(a * 57.3) + ')">' + El(0, -7, 4, 9, '#e8c25a', 1.6) + Tr('M-3,-11 l3,2 l3,-2 M-3,-6 l3,2 l3,-2 M-3,-1 l3,2 l3,-2', '#b8862e', 1, 0.8) + Tr('M0,-16 V-24', '#c9a24a', 1) + '</g>';
  }
  s += Re(-7, -20, 14, 6, 2, o.c, 1.8);
  if(o.d) s += fleur(11, -14, 5, '#e5484d', '#2a2440');
  return s;
}};
DES.souris = {h:26, w:22, asym:true, d:'gros', pal:['#a8a3b8', '#c9a27a', '#8a7a6a', '#f3f0ff'], art:function(o){
  var c = o.c, ci = '#ffb3c6';
  return Tr('M10,-4 C18,-2 22,-9 27,-5', '#e8a0a8', 2.2) +
    Pa('M-12,0 C-15,-10 -6,-18 4,-16 C12,-14 14,-6 12,0 Z', c) + Om('M12,0 C14,-6 12,-14 4,-16 C8,-10 8,-4 6,0 Z', 0.18) +
    Pa('M-12,-4 C-14,-12 -18,-12 -22,-7 C-18,-4 -15,-3 -12,-4 Z', c, 2) + Ci(-8, -15, 5, c, 2) + Ci(-8, -15, 2.6, ci, 0) +
    Ci(-16, -9, 1.3, K, 0) + Ci(-22, -7, 1.6, ci, 1) + Tr('M-20,-6 l-5,1 M-20,-8 l-5,-1', K, 0.9, 0.6) +
    (o.d ? Pa('M-26,0 L-20,-9 L-14,0 Z', '#f6d23a', 1.6) + Ci(-20, -3, 1.4, '#d6a22a', 0) : '');
}};
DES.pain = {h:26, w:28, n:[1, 3], d:'petit', art:function(o){
  var s = Pa('M-28,0 L28,0 L24,-5 L-24,-5 Z', o.c, 1.8), pos = [[0], [-12, 12], [-17, 0, 17]][o.n - 1];
  pos.forEach(function(x){
    s += El(x, -10, 11, 8, '#d9984a', 2) + Om('M' + (x + 4) + ',-17 C' + (x + 11) + ',-15 ' + (x + 12) + ',-5 ' + (x + 4) + ',-3 C' + (x + 8) + ',-8 ' + (x + 8) + ',-13 ' + (x + 4) + ',-17 Z', 0.18) +
      (o.d ? Tr('M' + (x - 5) + ',-12 l3,-4 M' + x + ',-11 l3,-4 M' + (x + 5) + ',-10 l2,-3', '#8a5020', 1.4) : '') + Br('M' + (x - 7) + ',-12 C' + (x - 6) + ',-15 ' + (x - 3) + ',-16 ' + x + ',-16', 1.6, 0.5);
  });
  return s;
}};
DES.seau = {h:42, w:16, asym:true, d:'gros', art:function(o){
  return Tr('M-13,-26 C-10,-41 16,-38 14,-26', K, 2.6) +
    Pa('M-14,-28 L14,-28 L11,0 L-11,0 Z', o.c) + Om('M14,-28 L11,0 L5,0 L7,-28 Z', 0.22) + Tr('M-13.5,-21 H13.5 M-12,-7 H12', fonce(o.c, 0.4), 2) +
    El(0, -28, 14, 3.5, '#5a5a70') + (o.d ? El(0, -28, 11.5, 2.4, '#5aa9ff', 1.2) + Ci(6, -34, 1.8, '#9fd4ff', 1) + Ci(-4, -36, 1.4, '#9fd4ff', 1) : '');
}};
DES.grenouille = {h:30, w:20, asym:true, d:'gros', pal:['#4fbf6a', '#8fd24a', '#3fa88a', '#f6d23a', '#3f7fe0'], art:function(o){
  var c = o.c, cf = fonce(c, 0.2);
  return Pa('M8,0 C20,-2 20,-10 12,-12 C16,-6 12,-3 8,-3 Z', cf, 2) +
    Pa('M-14,0 C-16,-10 -8,-18 2,-18 C10,-18 16,-10 14,0 Z', c) + El(-1, -5, 8, 4, clair(c, 0.4), 0) +
    Ci(-7, -18, 5, c, 2) + Ci(5, -18, 5, c, 2) + Ci(-7, -18, 3, '#ffffff', 1) + Ci(5, -18, 3, '#ffffff', 1) + Ci(-8, -18, 1.5, K, 0) + Ci(4, -18, 1.5, K, 0) +
    Tr('M-7,-10 C-3,-7 1,-7 4,-10', K, 1.4) + Pa('M-12,0 L-18,1 L-15,-3 Z', cf, 1.6) +
    (o.d ? Pa('M-6,-23 L-6,-30 L-3,-26 L0,-31 L3,-26 L6,-30 L6,-23 Z', '#f6d23a', 1.6) : '');
}};
DES.escargot = {h:30, w:22, asym:true, d:'gros', art:function(o){
  var c = o.c;
  return Pa('M-22,0 C-22,-5 -19,-7 -16,-8 L-16,-14 C-16,-18 -11,-18 -11,-14 L-11,-6 L14,-5 C20,-4 22,0 22,0 Z', '#e0cfa8', 2) +
    Tr('M-15,-15 L-18,-24 M-12,-15 L-12,-24', K, 1.4) + Ci(-18, -24, 1.8, K, 0) + Ci(-12, -24, 1.8, K, 0) +
    Ci(4, -14, 11, c) + Om('M4,-3 C11,-3 15,-9 15,-14 C15,-8 10,-5 4,-5 Z', 0.25) + Tr('M4,-14 C4,-17 8,-17 8,-14 C8,-10 1,-10 0,-14 C-1,-20 8,-23 11,-17', fonce(c, 0.45), 1.6) +
    (o.d ? fleur(6, -26, 4.2, '#ffffff', '#f6d23a') : '');
}};
DES.fougere = {h:56, w:26, asym:true, d:'petit', pal:VERTS, art:function(o){
  var c = o.c, s = '';
  [[-0.5, 50, fonce(c, 0.15)], [0.15, 54, c], [0.7, 42, clair(c, 0.15)]].forEach(function(f){
    var a = f[0], L = f[1], col = f[2], ex = Math.sin(a) * L, ey = -Math.cos(a) * L;
    var d = 'M0,0 ', g = '';
    for(var k = 1; k <= 7; k++){ var t = k / 8, px = ex * t + Math.sin(t * 3) * 4, py = ey * t, w = (1 - t) * 9 + 2; g += 'M' + f1(px) + ',' + f1(py) + ' l' + f1(-w * Math.cos(a) - 2) + ',' + f1(-w * Math.sin(a) - 3) + ' M' + f1(px) + ',' + f1(py) + ' l' + f1(w * Math.cos(a) + 2) + ',' + f1(w * Math.sin(a) - 3) + ' '; }
    s += Tr(g, K, 6) + Tr(g, col, 3.6) + Tr(d + 'Q' + f1(ex * 0.5 + 4) + ',' + f1(ey * 0.5) + ' ' + f1(ex) + ',' + f1(ey), col, 2.4);
  });
  if(o.d) s += Tr('M-10,0 C-12,-12 -20,-14 -22,-8 C-23,-4 -18,-3 -17,-7', K, 4.5) + Tr('M-10,0 C-12,-12 -20,-14 -22,-8 C-23,-4 -18,-3 -17,-7', clair(c, 0.25), 2.4);
  return s;
}};
DES.toile = {h:50, w:26, pend:true, asym:true, pal:null, d:'gros', art:function(o){
  var s = '', fil = '', x0 = -26, i, a, r;
  for(i = 0; i <= 5; i++){ a = i / 5 * Math.PI / 2; fil += 'M' + x0 + ',0 L' + f1(x0 + Math.cos(a) * 52) + ',' + f1(Math.sin(a) * 52) + ' '; }
  [14, 27, 40].forEach(function(r){ for(var j = 0; j <= 5; j++){ var b = j / 5 * Math.PI / 2; fil += (j ? 'L' : 'M') + f1(x0 + Math.cos(b) * r) + ',' + f1(Math.sin(b) * r) + ' '; } });
  s += Tr(fil, '#1a1428', 2.6, 0.6) + Tr(fil, '#e8ecff', 1.2, 0.85);
  if(o.d) s += Tr('M8,16 V34', '#e8ecff', 1, 0.8) + Tr('M3,34 l-4,-3 M3,37 l-5,1 M13,34 l4,-3 M13,37 l5,1', K, 1.4) + Ci(8, 38, 5, '#3a3352', 1.6) + Ci(8, 32, 3, '#3a3352', 1.4) + Ci(7, 31.5, 0.9, '#ffffff', 0) + Ci(9.4, 31.5, 0.9, '#ffffff', 0);
  return s;
}};
DES.araignee = {h:48, w:15, pend:true, d:'petit', pal:['#3a3352', '#7a3fa0', '#b03a3a', '#3f6fb0'], art:function(o){
  var c = o.c;
  return Tr('M0,0 V30', '#e8ecff', 1.2, 0.8) +
    Tr('M-4,34 C-10,30 -13,32 -15,36 M-4,37 C-11,36 -13,40 -14,44 M4,34 C10,30 13,32 15,36 M4,37 C11,36 13,40 14,44 M-4,40 C-8,42 -10,46 -10,49 M4,40 C8,42 10,46 10,49', K, 1.8) +
    Ci(0, 39, 7.5, c, 2) + Ci(0, 31, 4.5, c, 1.8) + Ci(-1.6, 30.5, 1.2, '#ffffff', 0) + Ci(1.6, 30.5, 1.2, '#ffffff', 0) +
    (o.d ? Tr('M-5,37 h10 M-5,41 h10', '#f6d23a', 1.8) : '') + Br('M-4,36 C-3,34 -1,33 1,33', 1.4, 0.5);
}};
DES.caisse = {h:36, w:22, d:'gros', art:function(o){
  return (o.d ? Pa('M-16,-32 C-14,-40 -10,-36 -8,-32 C-6,-40 -1,-38 0,-32 C2,-40 8,-38 9,-32 C12,-39 17,-36 16,-32 Z', '#f0d27a', 1.8) : '') +
    Re(-20, -32, 40, 32, 2, '#c98450') + Om('M20,-32 L20,0 L13,0 L13,-32 Z', 0.18) + Tr('M-20,-21 H20 M-20,-11 H20', '#8a5634', 1.4) +
    Tr('M-17,-29 L17,-3', '#8a5634', 3.4) + Ci(0, -16, 7, o.c, 1.8) + etincelle(0, -16, 4.2, '#fff4dc');
}};
DES.citrouille = {h:34, w:26, n:[1, 3], d:'petit', pal:['#f08a3c', '#f6d23a', '#e8e0c8', '#8fd24a'], art:function(o){
  var pos = [[[0, 1]], [[-9, 0.9], [12, 0.7]], [[0, 1], [-16, 0.62], [16, 0.6]]][o.n - 1], s = '';
  for(var i = pos.length - 1; i >= 0; i--){ var x = pos[i][0], k = pos[i][1], c = o.c;
    s += '<g transform="translate(' + x + ',0) scale(' + k + ')">' + El(-8, -13, 9, 13, c, 2.2) + El(8, -13, 9, 13, c, 2.2) + El(0, -13, 8, 14, clair(c, 0.12), 2.2) + Om('M12,-25 C19,-20 19,-6 12,-1 C14,-8 14,-18 12,-25 Z', 0.2) +
      Re(-2, -31, 4, 6, 1.5, '#5e7a2a', 1.8) + (o.d && i === 0 ? Tr('M2,-29 C8,-34 12,-28 8,-26 C5,-25 6,-29 9,-29', '#4f9a5c', 1.6) : '') + '</g>'; }
  return s;
}};
DES.bouquet = {h:62, w:22, n:[3, 5], d:'gros', art:function(o){
  var vase = ['#3f6fb0', '#c96a3e', '#e8e0c8', '#4f9a5c'][(o.v || 0) % 4], pos = [[0, -54], [-12, -46], [12, -47], [-16, -36], [16, -36]], s = '';
  for(var i = 0; i < o.n; i++) s += Tr('M0,-22 Q' + f1(pos[i][0] * 0.3) + ',' + f1((pos[i][1] - 22) / 2) + ' ' + pos[i][0] + ',' + pos[i][1], '#3f8a4a', 2);
  s += Pa('M0,-26 C-8,-34 -16,-30 -18,-26 C-10,-24 -4,-24 0,-26 Z', '#5fbf5a', 1.5) + Pa('M0,-28 C8,-36 16,-32 18,-28 C10,-26 4,-26 0,-28 Z', '#5fbf5a', 1.5);
  for(i = 0; i < o.n; i++) s += (o.v % 2) ? Pa('M' + (pos[i][0] - 6) + ',' + (pos[i][1] - 4) + ' L' + (pos[i][0] - 6) + ',' + (pos[i][1] + 3) + ' C' + (pos[i][0] - 6) + ',' + (pos[i][1] + 8) + ' ' + (pos[i][0] + 6) + ',' + (pos[i][1] + 8) + ' ' + (pos[i][0] + 6) + ',' + (pos[i][1] + 3) + ' L' + (pos[i][0] + 6) + ',' + (pos[i][1] - 4) + ' L' + (pos[i][0] + 3) + ',' + (pos[i][1] - 1) + ' L' + pos[i][0] + ',' + (pos[i][1] - 5) + ' L' + (pos[i][0] - 3) + ',' + (pos[i][1] - 1) + ' Z', o.c, 1.5) : fleur(pos[i][0], pos[i][1], 7, o.c);
  s += Pa('M-9,-26 C-15,-18 -15,-6 -10,0 L10,0 C15,-6 15,-18 9,-26 Z', vase) + Om('M9,-26 C15,-18 15,-6 10,0 L5,0 C8,-8 8,-18 5,-26 Z', 0.2) + Re(-10, -29, 20, 4, 2, clair(vase, 0.2), 1.8) + Br('M-7,-18 C-8,-12 -7,-7 -5,-4', 1.8, 0.45);
  if(o.d) s += Pa('M0,-17 C-6,-23 -12,-19 -9,-14 C-6,-12 -3,-15 0,-17 C3,-15 6,-12 9,-14 C12,-19 6,-23 0,-17 Z', '#ffd36a', 1.4) + Tr('M0,-17 L-4,-8 M0,-17 L4,-8', '#ffd36a', 2);
  return s;
}};
DES.mousse = {h:24, w:27, n:[2, 4], d:'petit', pal:LUEURS, art:function(o){
  var c = o.c, pos = [[0, 9], [-14, 7], [14, 7.5], [-6, 6]], s = Halo(0, -6, 32, 14, c, 0.25);
  for(var i = 0; i < o.n; i++){ var x = pos[i][0], r = pos[i][1]; s += Pa('M' + (x - r - 2) + ',0 C' + (x - r - 2) + ',' + (-r * 1.4) + ' ' + (x + r + 2) + ',' + (-r * 1.4) + ' ' + (x + r + 2) + ',0 Z', c, 1.8) + Ci(x - r * 0.3, -r * 0.6, 1.4, '#ffffff', 0, ' opacity=".8"') + Ci(x + r * 0.35, -r * 0.4, 1.1, '#ffffff', 0, ' opacity=".7"'); }
  if(o.d) s += etincelle(-18, -18, 4.5, '#ffffff') + etincelle(16, -20, 4, '#ffffff');
  return s;
}};
DES.lune = {h:44, w:24, d:'gros', pal:['#eef0ff', '#ffe3a3', '#ffc6e0', '#bff9ff'], art:function(o){
  var c = o.c;
  return Halo(0, -14, 30, 24, c, 0.3) + Pa('M-22,0 C-18,-10 -9,-16 0,-16 C9,-16 18,-10 22,0 Z', c) + Om('M22,0 C18,-10 9,-16 2,-16 C10,-10 13,-5 12,0 Z', 0.12) +
    Ci(-8, -6, 1.6, '#ffffff', 0) + Ci(4, -10, 1.4, '#ffffff', 0) + Ci(10, -4, 1.4, '#ffffff', 0) + Ci(-2, -3, 1.2, fonce(c, 0.25), 0) +
    Pa('M2,-40 C-8,-38 -10,-26 -3,-21 C-9,-22 -14,-28 -12,-35 C-10,-41 -4,-43 2,-40 Z', '#fff4cf', 1.8) +
    (o.d ? etincelle(14, -30, 5.5, '#ffffff') + etincelle(-17, -18, 4, '#ffffff') + etincelle(9, -44, 3.5, '#ffffff') : '');
}};
DES.lavande = {h:56, w:20, n:[3, 5], d:'petit', pal:['#a77bf0', '#7d5bd0', '#c9a6ff', '#ef7fa8'], art:function(o){
  var n = o.n, s = herbeTouffe(10);
  for(var i = 0; i < n; i++){
    var a = (i - (n - 1) / 2) * 0.28, x = Math.sin(a) * 34, y = -Math.cos(a) * 34;
    s += Tr('M0,0 L' + f1(x) + ',' + f1(y), '#4f9a5c', 2);
    for(var k = 0; k < 5; k++){ var t = 1 + k * 0.12; s += El(x * t, y * t - 2, 3.2, 4.2, k % 2 ? o.c : fonce(o.c, 0.15), 1.2); }
  }
  if(o.d) s += Re(-6, -14, 12, 5, 2, '#d8b47a', 1.6);
  return s;
}};
DES.trefle = {h:34, w:22, n:[2, 4], d:'petit', pal:VERTS, art:function(o){
  var pos = [[0, -26], [-13, -18], [13, -20], [-5, -12]], s = '', c = o.c;
  for(var i = 0; i < o.n; i++){
    var x = pos[i][0], y = pos[i][1], f = (o.d && i === 0) ? 4 : 3;
    s += Tr('M' + f1(x * 0.3) + ',0 Q' + f1(x * 0.4) + ',' + f1(y / 2) + ' ' + x + ',' + y, '#3f7a3a', 1.8);
    for(var k = 0; k < f; k++){ var a = k * Math.PI * 2 / f - Math.PI / 2; s += Ci(x + Math.cos(a) * 4.6, y + Math.sin(a) * 4.6, 4.4, c, 1.4); }
    s += Ci(x, y, 1.4, clair(c, 0.5), 0);
  }
  return s;
}};
DES.pensee = {h:40, w:22, n:[2, 4], d:'petit', pal:['#ffd84a', '#9d6ee3', '#ef7fa8', '#f08a3c', '#e8ecff'], art:function(o){
  var pos = [[0, -30], [-13, -21], [13, -23], [-4, -14]], s = herbeTouffe(12);
  for(var i = 0; i < o.n; i++){
    var x = pos[i][0], y = pos[i][1], c = o.c;
    s += Tr('M' + f1(x * 0.3) + ',0 Q' + f1(x * 0.4) + ',' + f1(y / 2) + ' ' + x + ',' + y, '#3f8a4a', 1.8) +
      El(x - 4, y - 4, 4.5, 5, fonce(c, 0.2), 1.3) + El(x + 4, y - 4, 4.5, 5, fonce(c, 0.2), 1.3) + El(x - 5, y + 2, 4.5, 4, c, 1.3) + El(x + 5, y + 2, 4.5, 4, c, 1.3) + El(x, y + 5, 5, 4, c, 1.3) +
      Ci(x, y + 1, 2.4, '#3a2a5a', 0) + Ci(x, y + 1, 1, '#f6d23a', 0);
  }
  if(o.d) s += El(-15, -6, 4.6, 3.8, '#e5484d', 1.3) + Ci(-16, -6, 1, K, 0) + Ci(-13.5, -5, 1, K, 0);
  return s;
}};
DES.feuillage = {h:46, w:22, n:[2, 4], d:'petit', pal:VERTS, art:function(o){
  var n = o.n, s = Tr('M0,0 V' + (-(n * 10 + 6)), '#3f7a3a', 2.4), c = o.c, pointu = (o.v || 0) % 2;
  for(var i = 0; i < n; i++){
    var y = -8 - i * 10, l = 16 - i * 2;
    s += pointu ? Pa('M0,' + y + ' L' + (-l * 0.4) + ',' + (y - 6) + ' L' + (-l * 0.6) + ',' + (y - 3) + ' L' + (-l) + ',' + (y - 6) + ' L' + (-l * 0.8) + ',' + (y + 1) + ' Z', c, 1.5) + Pa('M0,' + y + ' L' + (l * 0.4) + ',' + (y - 6) + ' L' + (l * 0.6) + ',' + (y - 3) + ' L' + l + ',' + (y - 6) + ' L' + (l * 0.8) + ',' + (y + 1) + ' Z', fonce(c, 0.1), 1.5)
      : Pa('M0,' + y + ' C' + (-l * 0.4) + ',' + (y - 9) + ' ' + (-l) + ',' + (y - 6) + ' ' + (-l) + ',' + (y - 2) + ' C' + (-l * 0.6) + ',' + (y + 2) + ' ' + (-l * 0.2) + ',' + (y + 1) + ' 0,' + y + ' Z', c, 1.5) + Pa('M0,' + y + ' C' + (l * 0.4) + ',' + (y - 9) + ' ' + l + ',' + (y - 6) + ' ' + l + ',' + (y - 2) + ' C' + (l * 0.6) + ',' + (y + 2) + ' ' + (l * 0.2) + ',' + (y + 1) + ' 0,' + y + ' Z', fonce(c, 0.1), 1.5);
  }
  if(o.d) s += Ci(-4, -(n * 10 + 8), 3.4, '#ffffff', 1.3) + Ci(4, -(n * 10 + 9), 3.4, '#ffffff', 1.3) + Ci(0, -(n * 10 + 14), 3.4, '#ffffff', 1.3);
  return s;
}};
DES.racine = {h:32, w:26, asym:true, d:'petit', pal:['#9b6a3c', '#c9a27a', '#7a4a2a', '#b0785a'], art:function(o){
  var c = o.c;
  return Pa('M-24,-4 C-18,-14 -6,-18 4,-16 C14,-20 22,-14 25,-6 C20,-8 16,-6 12,-8 C8,-2 0,-2 -4,-6 C-10,-2 -18,-2 -24,-4 Z', c) +
    Tr('M-20,-4 C-24,2 -26,6 -30,6 M10,-7 C14,0 18,2 22,4 M-2,-5 C-2,2 -6,6 -8,8', K, 4.4) + Tr('M-20,-4 C-24,2 -26,6 -30,6 M10,-7 C14,0 18,2 22,4 M-2,-5 C-2,2 -6,6 -8,8', c, 2.4) +
    Tr('M-14,-10 C-8,-12 -2,-12 4,-11 M8,-14 C12,-15 16,-13 18,-11', fonce(c, 0.3), 1.4) + Om('M25,-6 C20,-8 16,-6 12,-8 C8,-2 0,-2 -4,-6 C4,-8 14,-10 25,-6 Z', 0.2) +
    (o.d ? Tr('M4,-16 C4,-22 6,-26 8,-28', '#3f8a4a', 1.8) + Pa('M8,-28 C14,-32 17,-28 15,-25 C11,-25 9,-26 8,-28 Z', '#5fbf5a', 1.4) : '');
}};
DES.miel = {h:42, w:18, d:'gros', pal:['#f3c13e', '#e8963a', '#f6e07a', '#c9822a'], art:function(o){
  var c = o.c;
  return (o.d ? Tr('M4,-30 L16,-46', K, 4) + Tr('M4,-30 L16,-46', '#c98450', 2.2) + El(17, -47, 3.5, 4.5, '#c98450', 1.6, ' transform="rotate(35 17 -47)"') : '') +
    Pa('M-14,-26 C-18,-16 -16,-4 -10,0 L10,0 C16,-4 18,-16 14,-26 Z', '#d29a5e') + Om('M14,-26 C18,-16 16,-4 10,0 L5,0 C9,-8 10,-18 8,-26 Z', 0.2) +
    Pa('M-14,-26 L14,-26 L14,-22 C12,-18 10,-22 8,-20 C6,-14 4,-14 3,-20 C1,-22 -2,-22 -4,-18 C-6,-14 -8,-16 -8,-21 C-10,-22 -13,-20 -14,-22 Z', c, 1.6) +
    Re(-16, -31, 32, 6, 2.5, '#efe4cc', 2) + Tr('M-14,-26 h28', '#c94a3a', 2.2) + Br('M-10,-14 C-10,-9 -9,-6 -7,-4', 1.8, 0.45);
}};
DES.fleurRare = {h:58, w:22, n:[1, 2], d:'petit', pal:LUEURS, art:function(o){
  var c = o.c, pos = [[0, 1], [-15, 0.7]], s = '';
  for(var i = o.n - 1; i >= 0; i--){ var x = pos[i][0], k = pos[i][1];
    s += '<g transform="translate(' + x + ',0) scale(' + k + ')">' + Halo(0, -42, 22, 18, c, 0.35) + Tr('M0,0 C-2,-14 4,-26 0,-36', '#3f8a4a', 2.4) +
      Pa('M0,-14 C-8,-20 -14,-16 -14,-12 C-8,-10 -4,-11 0,-14 Z', '#5fbf5a', 1.4) +
      Pa('M-11,-38 C-14,-50 -6,-56 0,-48 C6,-56 14,-50 11,-38 C6,-34 -6,-34 -11,-38 Z', c) + Pa('M-4,-40 C-4,-46 4,-46 4,-40 Z', clair(c, 0.55), 1.2) +
      Ci(-3, -48, 1.4, '#ffffff', 0) + '</g>'; }
  if(o.d) s += etincelle(14, -50, 5, '#ffffff') + etincelle(-18, -30, 4, '#ffffff');
  return s;
}};


/* ==========================================================
   LES DÉCORS DES 7 DIFFÉRENCES (viewBox 400 × 300)
   Chaque thème : bg(id) = fond fixe, slots = emplacements d'objets
   {x, y (base), s (échelle), k (objets possibles), fixe (ni retourné ni déplacé), m (retourné d'office)}
   ========================================================== */
function lg(id, st, vert){
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
}
function rg(id, st, cx, cy, r){
  return '<radialGradient id="' + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.5) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
}
function gU(i){ return function(n){ return 'url(#' + i + n + ')'; }; }
function briques(x0, y0, x1, y1, bw, bh, op){
  var p = '';
  for(var r = 0, y = y1 - bh; y > y0 - bh; r++, y -= bh){
    for(var x = x0 - (r % 2) * bw / 2; x < x1; x += bw){
      var xa = Math.max(x0, x + 2), xb = Math.min(x1, x + bw - 2), ya = Math.max(y0, y + 2), yb = y + bh - 2;
      if(xb - xa > 6 && yb - ya > 4) p += '<rect x="' + f1(xa) + '" y="' + f1(ya) + '" width="' + f1(xb - xa) + '" height="' + f1(yb - ya) + '" rx="6"/>';
    }
  }
  return '<g fill="rgba(255,255,255,' + (op || 0.04) + ')" stroke="rgba(10,6,20,.32)" stroke-width="1.6">' + p + '</g>';
}
function pierres(rnd, x0, y0, x1, y1, h, fill, op){
  var p = '';
  for(var y = y0, r = 0; y < y1; y += h, r++){
    var x = x0 - rnd() * 20;
    while(x < x1){ var w = h * (1.2 + rnd() * 1.1); p += '<rect x="' + f1(x + 1.5) + '" y="' + f1(y + 1.5) + '" width="' + f1(w - 3) + '" height="' + f1(h - 3) + '" rx="' + f1(h * 0.4) + '" opacity="' + f1(0.7 + rnd() * 0.3) + '"/>'; x += w; }
  }
  return '<g fill="' + fill + '" stroke="rgba(10,6,20,' + (op || 0.45) + ')" stroke-width="1.5">' + p + '</g>';
}
function paves(rnd, y0, y1, fill){
  var p = '', y = y0;
  while(y < y1){
    var h = 9 + (y - y0) * 0.09, x = -rnd() * h * 2;
    while(x < 400){ var w = h * (1.6 + rnd() * 0.8); p += '<rect x="' + f1(x + 1) + '" y="' + f1(y + 1) + '" width="' + f1(w - 2) + '" height="' + f1(h - 2) + '" rx="' + f1(h * 0.42) + '"/>'; x += w; }
    y += h;
  }
  return '<g fill="' + fill + '" stroke="rgba(20,10,30,.35)" stroke-width="1.3">' + p + '</g>';
}
function planche(G, x0, x1, y){
  return Pa('M' + (x0 + 8) + ',' + (y + 7) + ' L' + (x0 + 21) + ',' + (y + 7) + ' L' + (x0 + 8) + ',' + (y + 20) + ' Z', G('bS'), 2) +
    Pa('M' + (x1 - 8) + ',' + (y + 7) + ' L' + (x1 - 21) + ',' + (y + 7) + ' L' + (x1 - 8) + ',' + (y + 20) + ' Z', G('bS'), 2) +
    Re(x0, y, x1 - x0, 8, 2.5, G('bH'), 2.2) + Tr('M' + (x0 + 5) + ',' + (y + 2.5) + ' H' + (x1 - 5), '#ffffff', 1.4, 0.35);
}
function poutre(G){ return Re(-4, -4, 408, 16, 0, G('bS'), 2.4) + Tr('M0,8 H400', '#000000', 2, 0.18); }
/* Fenêtre arrondie : mode 'nuit' (lune, étoiles, brume) ou 'jour' (nuages, collines) */
function fenetreArc(i, G, cx, ty, w, h, mode){
  var x0 = cx - w / 2, x1 = cx + w / 2, r = w / 2, yb = ty + h, ya = ty + r;
  var d = 'M' + f1(x0) + ',' + f1(yb) + ' V' + f1(ya) + ' A' + f1(r) + ',' + f1(r) + ' 0 0 1 ' + f1(x1) + ',' + f1(ya) + ' V' + f1(yb) + ' Z';
  var s = '<clipPath id="' + i + 'fen"><path d="' + d + '"/></clipPath><g clip-path="url(#' + i + 'fen)">' + '<rect x="' + f1(x0) + '" y="' + f1(ty) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + G(mode === 'jour' ? 'cielJ' : 'ciel') + '"/>';
  if(mode === 'jour'){
    s += El(x0 + w * 0.3, ty + h * 0.3, w * 0.22, h * 0.06, '#ffffff', 0, ' opacity=".8"') + El(x0 + w * 0.7, ty + h * 0.42, w * 0.18, h * 0.05, '#ffffff', 0, ' opacity=".7"') +
      Pa('M' + f1(x0) + ',' + f1(yb) + ' L' + f1(x0) + ',' + f1(yb - h * 0.25) + ' C' + f1(x0 + w * 0.3) + ',' + f1(yb - h * 0.38) + ' ' + f1(x0 + w * 0.6) + ',' + f1(yb - h * 0.2) + ' ' + f1(x1) + ',' + f1(yb - h * 0.3) + ' L' + f1(x1) + ',' + f1(yb) + ' Z', '#7fbf6a', 0);
  } else {
    var mx = cx + w * 0.18, my = ty + r * 0.8;
    s += '<circle cx="' + f1(mx) + '" cy="' + f1(my) + '" r="' + f1(w * 0.34) + '" fill="' + G('hl') + '"/>' + Ci(mx, my, w * 0.15, '#fff4cf', 0) + Ci(mx + w * 0.05, my - w * 0.03, w * 0.035, '#f0e2b0', 0);
    [[0.18, 0.3], [0.32, 0.6], [0.8, 0.66], [0.14, 0.75], [0.55, 0.18]].forEach(function(q){ s += Ci(x0 + q[0] * w, ty + q[1] * h, 1.3, '#ffffff', 0); });
    s += Pa('M' + f1(x0) + ',' + f1(yb) + ' L' + f1(x0) + ',' + f1(yb - h * 0.16) + ' C' + f1(x0 + w * 0.2) + ',' + f1(yb - h * 0.26) + ' ' + f1(x0 + w * 0.32) + ',' + f1(yb - h * 0.3) + ' ' + f1(x0 + w * 0.45) + ',' + f1(yb - h * 0.2) + ' C' + f1(x0 + w * 0.6) + ',' + f1(yb - h * 0.3) + ' ' + f1(x0 + w * 0.75) + ',' + f1(yb - h * 0.26) + ' ' + f1(x1) + ',' + f1(yb - h * 0.18) + ' L' + f1(x1) + ',' + f1(yb) + ' Z', '#141a3a', 0) +
      Re(x0 - w * 0.3, yb - h * 0.12, w * 1.6, h * 0.1, h * 0.05, 'rgba(200,210,255,.2)', 0);
  }
  s += '</g><path d="' + d + '" fill="none" stroke="' + K + '" stroke-width="8"/><path d="' + d + '" fill="none" stroke="#8a5a3a" stroke-width="4"/>' +
    Tr('M' + f1(cx) + ',' + f1(ty + 3) + ' V' + f1(yb) + ' M' + f1(x0 + 2) + ',' + f1(ya + h * 0.1) + ' H' + f1(x1 - 2), K, 5.5) +
    Tr('M' + f1(cx) + ',' + f1(ty + 3) + ' V' + f1(yb) + ' M' + f1(x0 + 2) + ',' + f1(ya + h * 0.1) + ' H' + f1(x1 - 2), '#8a5a3a', 2.6) +
    Re(x0 - 9, yb - 3, w + 18, 9, 3, G('bH'));
  return s;
}
var DEFS_BOIS = function(i){ return lg(i + 'bH', [['#f3c991', 0], ['#d29a5e', 1]], 1) + lg(i + 'bS', [['#94603a', 0], ['#62381d', 1]], 1) + lg(i + 'bois', [['#b77a46', 0], ['#7d4626', 1]], 1) +
  lg(i + 'ciel', [['#0d1433', 0], ['#26306a', 0.7], ['#4b3f86', 1]], 1) + lg(i + 'cielJ', [['#7fb8f0', 0], ['#d8ecff', 1]], 1) + rg(i + 'hl', [['#fff6d8', 0, 0.65], ['#fff6d8', 1, 0]]); };
function rayon(d, c, op){ return '<path d="' + d + '" fill="' + c + '" opacity="' + (op || 0.08) + '"/>'; }

var THEMES = {};
function TH(id, o){ o.id = id; THEMES[id] = o; }

/* --- L'étagère du labo --- */
TH('labo', {nom:'L\'étagère du labo', ic:'⚗️', fondCss:'#2b2148',
  bg:function(i){ var G = gU(i);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#2b2148', 0], ['#3e2f5f', 0.55], ['#4a3868', 1]], 1) + rg(i + 'feu', [['#ff9a4a', 0, 0.38], ['#ff7a3c', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>' + briques(0, 12, 400, 262, 52, 26) + '<ellipse cx="-30" cy="250" rx="200" ry="170" fill="' + G('feu') + '"/>';
    s += fenetreArc(i, G, 328, 20, 86, 110, 'nuit') + rayon('M287,130 L371,130 L330,262 L170,262 Z', '#bff9ff', 0.07);
    s += poutre(G) + planche(G, 6, 262, 98) + planche(G, 6, 394, 184);
    s += Re(-4, 262, 408, 11, 3, G('bH')) + '<rect x="-4" y="273" width="408" height="32" fill="' + G('bois') + '" stroke="' + K + '" stroke-width="2.4"/>' +
      Tr('M0,280 H400 M100,273 V300 M300,273 V300', '#000000', 1.6, 0.2) + Re(186, 282, 28, 6, 3, '#d6a24a', 1.6);
    return s;
  },
  slots:[
    {x:30, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier', 'bougie']},
    {x:78, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier', 'bougie']},
    {x:126, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'chat', 'encrier', 'bougie']},
    {x:174, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier', 'bougie']},
    {x:222, y:98, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'bougie']},
    {x:306, y:127, s:0.72, k:['fiole', 'bougie', 'cristal', 'champignon']},
    {x:350, y:127, s:0.72, k:['fiole', 'bougie', 'cristal', 'bocal']},
    {x:30, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'encrier']},
    {x:86, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'champignon', 'chat']},
    {x:142, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'cristal', 'bougie']},
    {x:198, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'mortier', 'cristal', 'champignon']},
    {x:254, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'encrier', 'bougie']},
    {x:310, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'cristal', 'champignon', 'chat']},
    {x:366, y:184, s:0.92, k:['fiole', 'bocal', 'livres', 'sablier', 'bougie']},
    {x:42, y:262, s:1.02, k:['chaudronMini', 'mortier', 'livres', 'bocal', 'bougie', 'chat']},
    {x:118, y:262, s:1.02, k:['chaudronMini', 'mortier', 'livres', 'bocal', 'sablier', 'fiole']},
    {x:196, y:262, s:1.02, k:['chaudronMini', 'mortier', 'livres', 'chat', 'encrier', 'fiole']},
    {x:276, y:262, s:1.02, k:['chaudronMini', 'mortier', 'bocal', 'bougie', 'sablier']},
    {x:356, y:262, s:1.02, k:['chaudronMini', 'chat', 'livres', 'bocal', 'fiole']}
  ]});

/* --- La place de Brumeval --- */
TH('place', {nom:'La place de Brumeval', ic:'⛲', fondCss:'#3a3060',
  bg:function(i){ var G = gU(i), rnd = alea(77);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'soir', [['#1c2450', 0], ['#4a3a78', 0.45], ['#e08a6a', 1]], 1) + lg(i + 'm1', [['#f3e4c4', 0], ['#d9c49a', 1]], 1) + lg(i + 'm2', [['#ecc8b8', 0], ['#c99a8a', 1]], 1) +
      lg(i + 'pi', [['#b9b5d6', 0], ['#77729c', 1]], 1) + lg(i + 'pav', [['#8a84a4', 0], ['#5a5474', 1]], 1) + lg(i + 'eau', [['#9fe0ff', 0], ['#3f8fd0', 1]], 1) + '</defs>';
    s += '<rect width="400" height="240" fill="' + G('soir') + '"/>' + Ci(258, 30, 9, '#fff4cf', 0);
    [[30, 20], [120, 12], [290, 14], [380, 26], [340, 50]].forEach(function(q){ s += Ci(q[0], q[1], 1.2, '#ffffff', 0); });
    /* maison de gauche */
    s += Re(-8, 72, 142, 166, 0, G('m1')) + Tr('M-8,94 H134 M-8,164 H134 M-8,234 H134 M20,94 L64,164 M108,94 L64,164', '#6b3f24', 3.4) +
      Pa('M-16,76 L62,8 L142,76 Z', '#a84a3a') + Tr('M-4,64 L62,14 L128,64', '#7a2f2a', 2, 0.6) + Re(78, 182, 40, 56, 18, '#6b3f24') + Ci(110, 212, 2, '#f6d23a', 1);
    /* la mairie */
    s += Re(146, 50, 108, 190, 0, G('pi')) + Pa('M160,52 L200,-4 L240,52 Z', '#4a4a6a') + Ci(200, 30, 14, '#f3e7cb') + Tr('M200,30 L200,21 M200,30 L207,33', K, 2) +
      Pa('M180,240 L180,210 C180,190 220,190 220,210 L220,240 Z', '#6b3f24') + Tr('M200,194 V240', K, 1.6) + Tr('M150,86 H250', '#5a5474', 2, 0.6) + Re(178, 160, 44, 12, 3, '#f5b945', 2) + Tr('M186,166 h28', '#7a2a3a', 1.6);
    /* maison de droite */
    s += Re(266, 78, 142, 160, 0, G('m2')) + Tr('M266,100 H408 M266,170 H408 M266,236 H408 M300,100 L340,170 M380,100 L340,170', '#6b3f24', 3.4) +
      Pa('M258,82 L336,16 L416,82 Z', '#5a4a8a') + Tr('M272,70 L336,22 L402,70', '#3a3060', 2, 0.6) + Re(282, 186, 38, 52, 17, '#7a3a5a') + Ci(312, 214, 2, '#f6d23a', 1);
    /* le sol pavé et la fontaine */
    s += '<rect x="0" y="236" width="400" height="64" fill="' + G('pav') + '"/>' + paves(rnd, 236, 300, 'rgba(255,255,255,.07)');
    s += El(200, 274, 64, 15, '#8a86a8') + El(200, 268, 56, 10, G('eau'), 2) + Re(193, 222, 14, 46, 3, G('pi')) + El(200, 222, 22, 6, '#9a96b8') +
      Tr('M190,218 C176,222 170,240 166,262 M210,218 C224,222 230,240 234,262', '#bff0ff', 2.4, 0.8) + Ci(200, 210, 5, '#bff0ff', 1.6) +
      Pa('M136,274 C136,290 264,290 264,274', 'none') + Tr('M140,280 C170,292 230,292 260,280', '#ffffff', 1.4, 0.2);
    return s;
  },
  slots:[
    {x:30, y:130, s:0.85, k:['fenetre']}, {x:92, y:130, s:0.85, k:['fenetre']}, {x:30, y:204, s:0.85, k:['fenetre']},
    {x:200, y:132, s:0.85, k:['fenetre']},
    {x:306, y:134, s:0.85, k:['fenetre']}, {x:368, y:134, s:0.85, k:['fenetre']}, {x:370, y:206, s:0.85, k:['fenetre']},
    {x:140, y:62, s:0.72, k:['fanions'], fixe:1}, {x:262, y:66, s:0.72, k:['fanions'], fixe:1},
    {x:142, y:294, s:0.92, k:['lampadaire', 'panneau']}, {x:262, y:294, s:0.92, k:['lampadaire', 'panneau']},
    {x:236, y:262, s:0.85, k:['oiseau']},
    {x:28, y:298, s:1, k:['tonneau', 'caisse', 'fleursPot']}, {x:84, y:298, s:1, k:['chat', 'fleursPot', 'panier', 'oiseau']},
    {x:322, y:298, s:1, k:['chat', 'fleursPot', 'panier', 'pommes']}, {x:374, y:298, s:1, k:['tonneau', 'caisse', 'fleursPot']}
  ]});

/* --- La lisière de la forêt --- */
TH('lisiere', {nom:'La lisière de la forêt', ic:'🌳', fondCss:'#3f6a3a',
  bg:function(i){ var G = gU(i), rnd = alea(31);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'ciel2', [['#7fb8f0', 0], ['#cfe6ff', 0.6], ['#ffe6b8', 1]], 1) + lg(i + 'pre', [['#a8d86a', 0], ['#5fa84a', 1]], 1) + lg(i + 'tr', [['#9a6a42', 0], ['#5a3820', 1]]) + rg(i + 'sol', [['#fff6c8', 0, 0.8], ['#fff6c8', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="200" fill="' + G('ciel2') + '"/>' + '<circle cx="330" cy="40" r="60" fill="' + G('sol') + '"/>' + Ci(330, 40, 16, '#fff8d8', 0);
    s += El(150, 40, 30, 8, '#ffffff', 0, ' opacity=".75"') + El(176, 34, 20, 9, '#ffffff', 0, ' opacity=".75"') + El(260, 70, 26, 6, '#ffffff', 0, ' opacity=".6"');
    s += Pa('M0,172 C60,140 120,150 180,160 C240,140 320,130 400,152 L400,200 L0,200 Z', '#9cc98a', 0);
    s += Pa('M120,166 L120,150 L128,142 L136,150 L136,166 Z M140,166 L140,138 L146,128 L152,138 L152,166 Z M156,166 L156,152 L166,144 L176,152 L176,166 Z', '#7a86b8', 0, ' opacity=".7"');
    for(var k = 0; k < 9; k++){ var x = 196 + k * 26, y = 140 + (k % 3) * 8; s += Ci(x, y, 22 + (k % 2) * 6, k % 2 ? '#2f6b4a' : '#3f7a4a', 2) + Ci(x - 6, y - 8, 7, '#4f8a5a', 0); }
    s += '<rect x="0" y="182" width="400" height="118" fill="' + G('pre') + '"/>' + Tr('M0,184 C100,178 300,190 400,182', '#4f8a3a', 2, 0.5);
    s += Pa('M176,300 C192,262 234,244 226,214 C222,200 240,190 250,184 L260,184 C252,194 240,204 246,218 C256,246 236,274 248,300 Z', '#dcc08e', 0) + Tr('M176,300 C192,262 234,244 226,214 C222,200 240,190 250,184 M260,184 C252,194 240,204 246,218 C256,246 236,274 248,300', '#b8986a', 1.6);
    for(k = 0; k < 14; k++){ var gx = rnd() * 400, gy = 196 + rnd() * 100; s += Tr('M' + f1(gx) + ',' + f1(gy) + ' l-2,-7 M' + f1(gx + 3) + ',' + f1(gy) + ' l1,-8 M' + f1(gx + 6) + ',' + f1(gy) + ' l3,-6', '#3f7a3a', 1.6, 0.8); }
    s += Pa('M4,262 C12,200 16,140 20,70 L46,70 C48,140 54,200 66,262 C50,256 22,256 4,262 Z', G('tr')) + Tr('M28,90 C30,140 30,190 26,240', '#4a2a14', 1.6, 0.6);
    s += Tr('M42,98 C76,90 108,84 146,88', K, 8) + Tr('M42,98 C76,90 108,84 146,88', '#7a5030', 4.4);
    s += Ci(-6, 30, 52, '#3f8a4a') + Ci(46, 12, 44, '#4f9a5a') + Ci(88, 44, 30, '#3f8a4a') + Ci(20, 62, 30, '#2f7a42') + Ci(36, 0, 18, '#6fbf6a', 0) + Ci(78, 36, 10, '#6fbf6a', 0);
    return s;
  },
  slots:[
    {x:118, y:88, s:0.82, k:['oiseau']},
    {x:196, y:128, s:0.85, k:['papillon']}, {x:304, y:100, s:0.85, k:['papillon']},
    {x:112, y:226, s:0.8, k:['lapin', 'champignon', 'fleurs', 'rocher']}, {x:300, y:214, s:0.75, k:['rocher', 'souche', 'fleurs', 'baies']},
    {x:362, y:226, s:0.82, k:['baies', 'fougere', 'lapin']}, {x:160, y:248, s:0.8, k:['fleurs', 'escargot', 'champignon']},
    {x:262, y:240, s:0.62, k:['panneau'], fixe:1},
    {x:40, y:294, s:1, k:['souche', 'rocher', 'fougere']}, {x:112, y:296, s:1, k:['champignon', 'fleurs', 'escargot', 'lapin']},
    {x:198, y:296, s:0.95, k:['fleurs', 'champignon', 'escargot']}, {x:288, y:294, s:1, k:['baies', 'lapin', 'souche', 'fougere']},
    {x:362, y:292, s:1, k:['fougere', 'rocher', 'fleurs']}
  ]});

/* --- La taverne --- */
TH('taverne', {nom:'La taverne', ic:'🍺', fondCss:'#4a2a18',
  bg:function(i){ var G = gU(i);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#6a3e24', 0], ['#4a2a18', 1]], 1) + rg(i + 'lamp', [['#ffbf6a', 0, 0.45], ['#ff9a4a', 1, 0]]) + lg(i + 'comp', [['#9a6a42', 0], ['#5a3820', 1]], 1) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>';
    var l = ''; for(var x = 14; x < 400; x += 30) l += 'M' + x + ',0 V230 ';
    s += Tr(l, '#2a160c', 2, 0.55) + Ci(64, 120, 2, '#2a160c', 0, ' opacity=".5"') + Ci(254, 74, 2, '#2a160c', 0, ' opacity=".5"') + Ci(334, 180, 2, '#2a160c', 0, ' opacity=".5"');
    s += '<ellipse cx="110" cy="70" rx="110" ry="90" fill="' + G('lamp') + '"/><ellipse cx="290" cy="70" rx="110" ry="90" fill="' + G('lamp') + '"/><ellipse cx="420" cy="250" rx="120" ry="110" fill="' + G('lamp') + '"/>';
    s += poutre(G) + planche(G, 20, 380, 150);
    s += Pa('M40,108 C40,96 58,96 58,108 C58,116 52,118 49,118 C46,118 40,116 40,108 Z', 'none', 3.4) + Tr('M43,108 C43,100 55,100 55,108', '#b8b0c8', 2.2);
    s += Re(-4, 222, 408, 11, 3, G('bH')) + '<rect x="-4" y="233" width="408" height="70" fill="' + G('comp') + '" stroke="' + K + '" stroke-width="2.4"/>';
    for(x = 10; x < 400; x += 78) s += Re(x, 244, 64, 46, 4, 'none', 1.6) + Tr('M' + (x + 4) + ',248 h56', '#ffffff', 1.2, 0.18);
    return s;
  },
  slots:[
    {x:110, y:12, s:0.88, k:['lanterne']}, {x:290, y:12, s:0.88, k:['lanterne']},
    {x:36, y:24, s:0.85, k:['chapeau']}, {x:366, y:24, s:0.85, k:['chapeau'], m:1},
    {x:172, y:98, s:0.9, k:['tableau', 'horloge']}, {x:240, y:98, s:0.9, k:['horloge', 'tableau']},
    {x:44, y:150, s:0.82, k:['bouteille', 'chope', 'bocal']}, {x:94, y:150, s:0.82, k:['bouteille', 'assiette', 'bougie']},
    {x:144, y:150, s:0.82, k:['chope', 'bouteille', 'bocal']}, {x:194, y:150, s:0.82, k:['bouteille', 'bougie', 'assiette']},
    {x:244, y:150, s:0.82, k:['bocal', 'bouteille', 'chope']}, {x:294, y:150, s:0.82, k:['bouteille', 'assiette', 'bougie']},
    {x:344, y:150, s:0.82, k:['chope', 'bouteille', 'bocal']},
    {x:56, y:224, s:0.92, k:['chope', 'assiette', 'pain']}, {x:128, y:224, s:0.92, k:['bougie', 'chope', 'bouteille']},
    {x:200, y:224, s:0.92, k:['assiette', 'pain', 'chope']}, {x:272, y:224, s:0.92, k:['chope', 'bouteille', 'bougie']},
    {x:344, y:224, s:0.92, k:['pain', 'assiette', 'chope']},
    {x:28, y:302, s:1.05, k:['tonneau']}, {x:372, y:302, s:1.05, k:['tonneau']}
  ]});

/* --- L'étal de potions --- */
TH('marche', {nom:'L\'étal de potions', ic:'🧪', fondCss:'#5a7aa8',
  bg:function(i){ var G = gU(i), rnd = alea(52);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'jour', [['#8cc8ff', 0], ['#e8f6ff', 1]], 1) + lg(i + 'pav', [['#b8b0c8', 0], ['#8a84a4', 1]], 1) + lg(i + 'fond', [['#a8743f', 0], ['#7d4626', 1]], 1) +
      lg(i + 'nappe', [['#4f7fc0', 0], ['#2f4f90', 1]], 1) + '<clipPath id="' + i + 'auv"><path d="M14,14 L386,14 L396,62 L4,62 Z"/></clipPath></defs>';
    s += '<rect width="400" height="220" fill="' + G('jour') + '"/>';
    [[20, 120, 70, '#f0c8a8', '#a84a3a'], [96, 100, 60, '#c9b8e8', '#5a4a8a'], [260, 110, 70, '#f3e4c4', '#a84a3a'], [336, 96, 70, '#d8e8c8', '#4a6a8a']].forEach(function(m){
      s += Re(m[0], m[1], m[2], 120, 0, m[3], 1.6, ' opacity=".75"') + Pa('M' + (m[0] - 6) + ',' + (m[1] + 2) + ' L' + (m[0] + m[2] / 2) + ',' + (m[1] - 30) + ' L' + (m[0] + m[2] + 6) + ',' + (m[1] + 2) + ' Z', m[4], 1.6, ' opacity=".75"') +
        Re(m[0] + 12, m[1] + 20, 14, 18, 2, '#ffe9a0', 1.2, ' opacity=".8"');
    });
    s += '<rect x="0" y="212" width="400" height="88" fill="' + G('pav') + '"/>' + paves(rnd, 212, 300, 'rgba(255,255,255,.12)');
    s += Re(38, 64, 324, 146, 0, G('fond')) + Tr('M70,64 V210 M110,64 V210 M150,64 V210 M190,64 V210 M230,64 V210 M270,64 V210 M310,64 V210 M350,64 V210', '#5a3820', 1.4, 0.5);
    s += Re(24, 30, 14, 272, 2, G('bois')) + Re(362, 30, 14, 272, 2, G('bois'));
    s += planche(G, 40, 360, 140);
    var raies = ''; for(var x = 0; x < 400; x += 32) raies += '<rect x="' + x + '" y="10" width="16" height="56" fill="#fff4dc"/>';
    s += '<g clip-path="url(#' + i + 'auv)"><rect x="0" y="10" width="400" height="56" fill="#e5484d"/>' + raies + '</g>' + Pa('M14,14 L386,14 L396,62 L4,62 Z', 'none');
    var fest = ''; for(x = 4; x < 396; x += 24) fest += Pa('M' + x + ',62 C' + x + ',74 ' + (x + 24) + ',74 ' + (x + 24) + ',62 Z', (x / 24) % 2 < 1 ? '#e5484d' : '#fff4dc', 1.8);
    s += fest + Re(156, 72, 88, 22, 5, '#f3e7cb', 2.2) + '<text x="200" y="88" text-anchor="middle" font-family="Macondo, Georgia, serif" font-size="14" fill="#7a2a3a">Potions</text>';
    s += Re(20, 208, 360, 10, 3, G('bH')) + Pa('M24,218 L376,218 L376,302 L24,302 Z', G('nappe'));
    var fr = ''; for(x = 24; x < 376; x += 16) fr += Pa('M' + x + ',218 L' + (x + 16) + ',218 L' + (x + 8) + ',230 Z', '#f5b945', 1.4);
    s += fr + etincelle(110, 262, 9, '#f5b945') + etincelle(290, 262, 9, '#f5b945') + etincelle(200, 276, 6, '#ffe3a3');
    return s;
  },
  slots:[
    {x:90, y:64, s:0.78, k:['herbes', 'lanterne']}, {x:310, y:64, s:0.78, k:['lanterne', 'herbes']},
    {x:66, y:140, s:0.82, k:['fiole', 'bocal', 'bouteille', 'miel']}, {x:114, y:140, s:0.82, k:['bocal', 'fiole', 'bouteille']},
    {x:162, y:140, s:0.82, k:['fiole', 'miel', 'bocal']}, {x:238, y:140, s:0.82, k:['bouteille', 'fiole', 'bocal']},
    {x:286, y:140, s:0.82, k:['miel', 'fiole', 'bouteille']}, {x:334, y:140, s:0.82, k:['bocal', 'fiole', 'bouteille']},
    {x:66, y:208, s:0.95, k:['pommes', 'panier', 'citrouille']}, {x:128, y:208, s:0.95, k:['fiole', 'bocal', 'bouquet']},
    {x:190, y:208, s:0.95, k:['panier', 'pommes', 'miel']}, {x:252, y:208, s:0.95, k:['bocal', 'fiole', 'bouquet']},
    {x:314, y:208, s:0.95, k:['citrouille', 'pommes', 'panier']},
    {x:82, y:302, s:0.95, k:['caisse', 'citrouille', 'sac']}, {x:318, y:302, s:0.95, k:['caisse', 'sac', 'citrouille']}
  ]});

/* --- Les bouquets d'Iris (herboristerie) --- */
TH('herboristerie', {nom:'Les bouquets d\'Iris', ic:'💐', fondCss:'#2f4a3a',
  bg:function(i){ var G = gU(i);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#4f7a5c', 0], ['#2f4a3a', 1]], 1) + rg(i + 'jourR', [['#fff6d0', 0, 0.35], ['#fff6d0', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>';
    var m = ''; for(var y = 24, r = 0; y < 290; y += 26, r++) for(var x = (r % 2) * 18; x < 400; x += 36) m += 'M' + x + ',' + y + ' c3,-6 8,-6 8,0 c-3,4 -6,4 -8,0 Z ';
    s += '<path d="' + m + '" fill="#ffffff" opacity=".06"/>';
    s += '<ellipse cx="200" cy="120" rx="160" ry="140" fill="' + G('jourR') + '"/>';
    s += '<clipPath id="' + i + 'rond"><circle cx="200" cy="40" r="25"/></clipPath><g clip-path="url(#' + i + 'rond)"><rect x="170" y="10" width="60" height="60" fill="' + G('cielJ') + '"/>' + Ci(186, 58, 14, '#7fbf6a', 0) + Ci(214, 62, 16, '#6aaf5a', 0) + '</g>' +
      Ci(200, 40, 25, 'none', 6) + Ci(200, 40, 25, 'none', 0, ' stroke="#8a5a3a" stroke-width="3"') + Tr('M200,16 V64 M176,40 H224', '#8a5a3a', 2.6);
    s += rayon('M184,60 L216,60 L160,300 L60,300 Z', '#fff6d0', 0.07);
    s += poutre(G) + planche(G, 8, 392, 118) + planche(G, 8, 392, 206);
    s += Re(-4, 284, 408, 22, 3, G('bH')) + Tr('M0,292 H400', '#8a5634', 1.4, 0.5);
    return s;
  },
  slots:[
    {x:40, y:12, s:0.82, k:['herbes']}, {x:112, y:12, s:0.82, k:['herbes']}, {x:288, y:12, s:0.82, k:['herbes']}, {x:360, y:12, s:0.82, k:['herbes']},
    {x:40, y:118, s:0.88, k:['bouquet', 'bocal', 'fleursPot']}, {x:102, y:118, s:0.88, k:['bouquet', 'lavande', 'miel']},
    {x:164, y:118, s:0.88, k:['bouquet', 'bocal', 'fleursPot']}, {x:236, y:118, s:0.88, k:['bouquet', 'lavande', 'bocal']},
    {x:298, y:118, s:0.88, k:['bouquet', 'fleursPot', 'miel']}, {x:360, y:118, s:0.88, k:['bouquet', 'bocal', 'lavande']},
    {x:40, y:206, s:0.88, k:['bouquet', 'panier', 'bocal']}, {x:102, y:206, s:0.88, k:['bouquet', 'lavande', 'fleursPot']},
    {x:164, y:206, s:0.88, k:['bouquet', 'miel', 'bocal']}, {x:236, y:206, s:0.88, k:['bouquet', 'panier', 'fleursPot']},
    {x:298, y:206, s:0.88, k:['bouquet', 'bocal', 'lavande']}, {x:360, y:206, s:0.88, k:['bouquet', 'miel', 'fleursPot']},
    {x:60, y:286, s:0.95, k:['bouquet', 'panier', 'livres']}, {x:156, y:286, s:0.95, k:['bouquet', 'fleursPot', 'panier']},
    {x:248, y:286, s:0.95, k:['bouquet', 'livres', 'miel']}, {x:342, y:286, s:0.95, k:['bouquet', 'panier', 'fleursPot']}
  ]});

/* --- La cave aux champignons --- */
TH('cave', {nom:'La cave aux champignons', ic:'🍄', fondCss:'#1a1430',
  bg:function(i){ var G = gU(i), rnd = alea(19);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#1a1430', 0], ['#2c2444', 1]], 1) + lg(i + 'sol', [['#3a2a22', 0], ['#1e1410', 1]], 1) +
      rg(i + 'lant', [['#ffbf6a', 0, 0.5], ['#ff9a4a', 1, 0]]) + rg(i + 'cyan', [['#8ff3ff', 0, 0.3], ['#8ff3ff', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>' + pierres(rnd, 0, 0, 400, 240, 26, '#4a4068');
    s += Tr('M-20,300 L-20,130 C-20,30 100,-10 200,-10 C300,-10 420,30 420,130 L420,300', K, 14) + Tr('M-20,300 L-20,130 C-20,30 100,-10 200,-10 C300,-10 420,30 420,130 L420,300', '#4a4266', 9);
    s += '<ellipse cx="100" cy="60" rx="150" ry="120" fill="' + G('lant') + '"/><ellipse cx="300" cy="270" rx="140" ry="70" fill="' + G('cyan') + '"/><ellipse cx="160" cy="250" rx="80" ry="40" fill="' + G('cyan') + '"/>';
    [[0, 150, 80], [0, 168, 64], [0, 186, 48], [0, 204, 32], [0, 222, 16]].forEach(function(m){ s += Re(m[0] - 4, m[1], m[2] + 4, 18, 3, '#4a4266', 2) + Tr('M2,' + (m[1] + 3) + ' h' + (m[2] - 6), '#ffffff', 1.2, 0.15); });
    s += planche(G, 236, 396, 130);
    s += Pa('M0,236 L400,236 L400,300 L0,300 Z', G('sol'), 0) + Tr('M0,236 H400', K, 2.4);
    for(var k = 0; k < 16; k++){ var x = rnd() * 400, y = 244 + rnd() * 52; s += El(x, y, 3 + rnd() * 4, 1.6 + rnd() * 1.4, '#5a4a40', 1, ' opacity=".7"'); }
    s += Tr('M330,40 C336,60 326,80 334,100 M60,180 C66,196 58,210 64,226', '#0a0612', 2, 0.6);
    return s;
  },
  slots:[
    {x:26, y:0, s:1, k:['toile'], fixe:1}, {x:374, y:0, s:1, k:['toile'], fixe:1, m:1},
    {x:100, y:4, s:1, k:['lanterne']}, {x:198, y:0, s:0.9, k:['araignee']}, {x:292, y:4, s:0.9, k:['lanterne', 'araignee']},
    {x:262, y:130, s:0.82, k:['bouteille', 'bocal', 'bougie']}, {x:312, y:130, s:0.82, k:['bocal', 'champignon', 'bouteille']},
    {x:362, y:130, s:0.82, k:['bouteille', 'bougie', 'bocal']},
    {x:34, y:150, s:0.78, k:['bougie', 'bouteille', 'souris']},
    {x:150, y:246, s:0.75, k:['champiLum', 'bouteille', 'seau']}, {x:236, y:244, s:0.78, k:['caisse', 'seau', 'bouteille']},
    {x:40, y:298, s:1, k:['caisse', 'tonneau', 'seau']},
    {x:108, y:294, s:1.05, k:['tonneau', 'caisse']}, {x:180, y:292, s:1, k:['champiLum', 'champignon', 'souris']},
    {x:250, y:296, s:1, k:['caisse', 'tonneau']}, {x:318, y:292, s:0.95, k:['champiLum', 'bouteille', 'souris']},
    {x:372, y:294, s:0.95, k:['tonneau', 'champiLum']}
  ]});

/* --- La forêt aux baies --- */
TH('baies', {nom:'La forêt aux baies', ic:'🫐', fondCss:'#1f3a2a',
  bg:function(i){ var G = gU(i), rnd = alea(64);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'fond', [['#16301f', 0], ['#24452c', 0.6], ['#356a3e', 1]], 1) + lg(i + 'sol', [['#5a8a3e', 0], ['#2f5228', 1]], 1) + lg(i + 'tr', [['#8a5a3a', 0], ['#4a2e1a', 1]]) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('fond') + '"/>';
    [[86, 16], [176, 20], [248, 14], [296, 12]].forEach(function(t){ s += '<rect x="' + t[0] + '" y="0" width="' + t[1] + '" height="215" fill="#13261a" opacity=".85"/>'; });
    s += rayon('M250,-10 L300,-10 L200,300 L110,300 Z', '#fff6c0', 0.09) + rayon('M330,-10 L360,-10 L320,300 L250,300 Z', '#fff6c0', 0.07) + rayon('M140,-10 L160,-10 L90,300 L50,300 Z', '#fff6c0', 0.05);
    s += Pa('M0,204 C80,192 160,208 240,198 C300,192 360,202 400,196 L400,300 L0,300 Z', G('sol'), 0) + Tr('M0,204 C80,192 160,208 240,198 C300,192 360,202 400,196', '#6a9a4a', 2, 0.7);
    for(var k = 0; k < 10; k++){ s += El(rnd() * 400, 214 + rnd() * 84, 16 + rnd() * 18, 4 + rnd() * 3, '#e8f6a0', 0, ' opacity=".13"'); }
    for(k = 0; k < 12; k++){ var gx = rnd() * 400, gy = 210 + rnd() * 86; s += Tr('M' + f1(gx) + ',' + f1(gy) + ' l-2,-7 M' + f1(gx + 3) + ',' + f1(gy) + ' l1,-8 M' + f1(gx + 6) + ',' + f1(gy) + ' l3,-6', '#7aaa4a', 1.6, 0.8); }
    s += Pa('M14,302 C18,220 20,120 22,-6 L50,-6 C52,120 54,220 60,302 Z', G('tr')) + Pa('M336,302 C338,220 340,120 342,-6 L370,-6 C372,120 374,220 380,302 Z', G('tr'));
    s += Tr('M48,78 C70,74 92,70 118,74', K, 7) + Tr('M48,78 C70,74 92,70 118,74', '#6a4428', 3.6) + Tr('M340,66 C318,62 298,60 276,64', K, 7) + Tr('M340,66 C318,62 298,60 276,64', '#6a4428', 3.6);
    for(k = 0; k < 12; k++){ var cx = k * 36 - 10, cy = 4 + (k % 3) * 8; s += Ci(cx, cy, 24 + (k % 2) * 6, k % 2 ? '#1f4a2a' : '#2a5a32', 2) + Ci(cx - 6, cy + 6, 6, '#4f8a4a', 0, ' opacity=".7"'); }
    s += Pa('M60,300 C70,270 90,262 110,266 C126,258 140,270 136,300 Z', '#2f6a32', 1.6, ' opacity=".9"');
    return s;
  },
  slots:[
    {x:100, y:74, s:0.82, k:['oiseau']}, {x:300, y:62, s:0.82, k:['oiseau'], m:1},
    {x:176, y:134, s:0.85, k:['papillon']}, {x:244, y:106, s:0.8, k:['papillon']},
    {x:112, y:214, s:0.8, k:['baies', 'fougere', 'rocher']}, {x:200, y:208, s:0.75, k:['baies', 'souche', 'champignon']},
    {x:282, y:212, s:0.8, k:['fougere', 'baies', 'rocher']},
    {x:150, y:254, s:0.85, k:['champignon', 'escargot', 'fleurs']}, {x:316, y:254, s:0.85, k:['escargot', 'fleurs', 'champignon']},
    {x:40, y:294, s:1, k:['fougere', 'rocher', 'souche']}, {x:112, y:296, s:1, k:['baies', 'champignon', 'escargot', 'fleurs']},
    {x:196, y:292, s:1, k:['rocher', 'baies', 'fleurs']}, {x:268, y:296, s:1, k:['champignon', 'escargot', 'fleurs', 'baies']},
    {x:356, y:294, s:1, k:['baies', 'fougere', 'souche']}
  ]});

/* --- Le moulin --- */
TH('moulin', {nom:'Le moulin', ic:'🌾', fondCss:'#5a3a22',
  bg:function(i){ var G = gU(i), rnd = alea(43);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#7a5232', 0], ['#4a2e1a', 1]], 1) + lg(i + 'sol', [['#a07e56', 0], ['#6a4a2a', 1]], 1) + lg(i + 'rai', [['#fff2c8', 0, 0.3], ['#fff2c8', 1, 0]], 1) + '</defs>';
    s += '<rect width="400" height="300" fill="' + G('mur') + '"/>';
    var l = ''; for(var y = 22; y < 240; y += 22) l += 'M0,' + y + ' H400 ';
    s += Tr(l, '#2a160c', 1.8, 0.5);
    s += '<g transform="translate(64,62)" opacity=".55">' + Pa(engrenagePath(12, 54, 44), '#5a3a22', 3) + Ci(0, 0, 18, '#4a2e1a', 3) + Ci(0, 0, 6, '#2a160c', 2) + '</g>';
    s += Re(116, -4, 14, 246, 2, G('bS')) + Re(292, -4, 14, 246, 2, G('bS')) + Tr('M130,40 L292,180', K, 9) + Tr('M130,40 L292,180', '#6a4428', 5.5);
    s += Re(306, 14, 72, 52, 3, '#ffe9b0') + Tr('M342,14 V66 M306,40 H378', '#6a4428', 3.4) + Re(306, 14, 72, 52, 3, 'none', 3);
    s += '<path d="M306,66 L378,66 L250,246 L110,246 Z" fill="' + G('rai') + '"/>';
    for(var k = 0; k < 18; k++){ var t = rnd(), u = rnd(); s += Ci(306 + 72 * u - (196 * t) * (0.9 + u * 0.2), 66 + 180 * t, 0.8 + rnd() * 1.2, '#fff8e0', 0, ' opacity="' + f1(0.4 + rnd() * 0.5) + '"'); }
    s += planche(G, 8, 204, 130);
    s += Pa('M0,242 L400,242 L400,300 L0,300 Z', G('sol'), 0) + Tr('M0,242 H400', K, 2.4);
    var p = ''; for(var x = -40; x < 440; x += 44) p += 'M' + (200 + (x - 200) * 0.8) + ',242 L' + x + ',300 ';
    s += Tr(p, '#4a2e1a', 1.6, 0.6);
    for(k = 0; k < 6; k++) s += El(30 + rnd() * 340, 252 + rnd() * 42, 10 + rnd() * 12, 2.4, '#fff8e8', 0, ' opacity=".3"');
    return s;
  },
  slots:[
    {x:34, y:130, s:0.8, k:['pain', 'bocal', 'bougie']}, {x:82, y:130, s:0.8, k:['sac', 'bocal', 'seau']},
    {x:130, y:130, s:0.8, k:['bougie', 'pain', 'bocal']}, {x:178, y:130, s:0.8, k:['seau', 'sac', 'pain']},
    {x:250, y:178, s:1, k:['engrenage']}, {x:340, y:216, s:0.82, k:['engrenage']},
    {x:212, y:4, s:0.85, k:['lanterne']},
    {x:150, y:252, s:0.75, k:['souris', 'seau', 'pain']},
    {x:40, y:294, s:1, k:['sac', 'gerbe', 'caisse']}, {x:108, y:296, s:1, k:['sac', 'seau', 'souris']},
    {x:180, y:292, s:1, k:['gerbe', 'sac', 'caisse']}, {x:250, y:296, s:1, k:['souris', 'pain', 'seau']},
    {x:318, y:292, s:1, k:['sac', 'gerbe', 'caisse']}, {x:378, y:294, s:0.95, k:['gerbe', 'seau', 'souris']}
  ]});

/* --- Le puits --- */
TH('puits', {nom:'Le puits', ic:'🪣', fondCss:'#1a2a4a',
  bg:function(i){ var G = gU(i), rnd = alea(88);
    var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'nuit', [['#0f1c38', 0], ['#26405a', 0.7], ['#3a5a6a', 1]], 1) + lg(i + 'sol', [['#4a5a64', 0], ['#2a3440', 1]], 1) +
      lg(i + 'pu', [['#9aa6b0', 0], ['#6a7680', 1]]) + rg(i + 'mou', [['#b6ff7a', 0, 0.25], ['#b6ff7a', 1, 0]]) + '</defs>';
    s += '<rect width="400" height="230" fill="' + G('nuit') + '"/>' + Ci(60, 30, 12, '#fff4cf', 0) + '<circle cx="60" cy="30" r="30" fill="' + G('hl') + '"/>';
    [[120, 16], [180, 34], [300, 20], [360, 44], [240, 10]].forEach(function(q){ s += Ci(q[0], q[1], 1.2, '#ffffff', 0); });
    s += pierres(rnd, 0, 66, 400, 224, 24, '#5a6a74');
    s += Pa('M0,66 C40,58 70,70 110,62 C150,56 190,68 230,60 C280,54 330,68 400,60 L400,72 L0,74 Z', '#4f8a5a', 1.6);
    for(var k = 0; k < 7; k++) s += El(rnd() * 400, 90 + rnd() * 120, 10 + rnd() * 10, 4, '#4f8a5a', 0, ' opacity=".6"');
    s += '<ellipse cx="200" cy="260" rx="220" ry="60" fill="' + G('mou') + '"/>';
    s += '<rect x="0" y="222" width="400" height="78" fill="' + G('sol') + '"/>' + paves(rnd, 222, 300, 'rgba(255,255,255,.06)') + El(320, 280, 30, 5, '#8ab0c8', 0, ' opacity=".35"') + El(70, 262, 22, 4, '#8ab0c8', 0, ' opacity=".3"');
    s += Re(146, 92, 10, 96, 2, G('bS')) + Re(244, 92, 10, 96, 2, G('bS'));
    s += Pa('M140,186 L140,262 C140,278 260,278 260,262 L260,186 Z', G('pu'));
    var pi = ''; for(var r = 0; r < 4; r++) for(var x = 140 + (r % 2) * 14; x < 260; x += 28) pi += 'M' + x + ',' + (198 + r * 18) + ' h24 ';
    s += Tr(pi, '#4a5660', 2.4, 0.6) + El(200, 186, 62, 12, '#aab6c0') + El(200, 186, 50, 8, '#0a0e18', 2) + Pa('M150,200 C160,206 172,204 180,210 C170,214 158,212 150,206 Z', '#4f8a5a', 1.4);
    s += Re(150, 104, 100, 8, 2, G('bH')) + Tr('M250,108 h12 v12', K, 3) + Re(258, 118, 10, 5, 2, '#d29a5e', 1.6);
    s += Pa('M128,98 L200,54 L272,98 L262,103 L200,66 L138,103 Z', '#7a4a2a') + Tr('M150,92 L200,62 M250,92 L200,62', '#a86a3a', 2, 0.6);
    s += Tr('M200,112 V176', '#c9a874', 2.2) + Tr('M196,176 h8', '#6a6a7a', 2.4);
    return s;
  },
  slots:[
    {x:226, y:112, s:0.72, k:['lanterne']},
    {x:168, y:184, s:0.78, k:['seau']}, {x:234, y:184, s:0.72, k:['grenouille', 'escargot', 'mousse']},
    {x:40, y:132, s:0.75, k:['mousse', 'fougere', 'champignon']}, {x:362, y:122, s:0.75, k:['mousse', 'champignon', 'escargot']},
    {x:62, y:224, s:0.88, k:['fougere', 'rocher']}, {x:338, y:224, s:0.88, k:['fougere', 'mousse', 'rocher']},
    {x:112, y:242, s:0.8, k:['champignon', 'escargot', 'mousse']}, {x:292, y:242, s:0.8, k:['mousse', 'grenouille', 'champignon']},
    {x:36, y:296, s:1, k:['seau', 'rocher', 'grenouille']}, {x:106, y:296, s:1, k:['grenouille', 'mousse', 'champignon', 'escargot']},
    {x:200, y:298, s:0.95, k:['mousse', 'escargot', 'grenouille']}, {x:294, y:296, s:1, k:['rocher', 'fougere', 'champignon']},
    {x:364, y:296, s:1, k:['seau', 'grenouille', 'escargot']}
  ]});

/* ---------- Ingrédients rares à cueillir ---------- */
var INGR_DESSIN = {
  champignon:{t:'champiLum', c:'#8ff3ff', art:'des champignons lumineux', ic:'🍄', theme:'cave'},
  baies:{t:'baies', c:'#7d3aa8', art:'des baies de sureau', ic:'🫐', theme:'baies'},
  lune:{t:'lune', c:'#eef0ff', art:'de la poussière de lune', ic:'✨', theme:'puits'},
  lavande:{t:'lavande', c:'#a77bf0', art:'de la lavande', ic:'🪻', theme:'herboristerie'},
  menthe:{t:'feuillage', v:0, c:'#3fa88a', art:'de la menthe poivrée', ic:'🌿', theme:'baies'},
  ortie:{t:'feuillage', v:1, c:'#2f7a4a', art:'de l\'ortie piquante', ic:'🌱', theme:'lisiere'},
  trefle:{t:'trefle', c:'#4f9a5c', art:'du trèfle des lièvres', ic:'☘️', theme:'lisiere'},
  pensee:{t:'pensee', c:'#ffd84a', art:'des pensées sauvages', ic:'🌼', theme:'lisiere'},
  racine:{t:'racine', c:'#9b6a3c', art:'une racine du Vieux Chêne', ic:'🪵', theme:'baies'},
  miel:{t:'miel', c:'#f3c13e', art:'du miel des ruches', ic:'🍯', theme:'marche'},
  eau:{t:'fiole', c:'#3f7fe0', art:'de l\'eau de la fontaine', ic:'💧', theme:'place'},
  brume:{t:'bocal', c:'#c9d3ff', art:'de la brume du lavoir', ic:'🌫️', theme:'puits'},
  rare:{t:'fleurRare', c:'#8ff3ff', art:'une plante rare', ic:'🌸', theme:'baies'}
};
var THEME_MOTS = [[/champi|cave|cellier/, 'cave'], [/baie|myrtille|sureau/, 'baies'], [/moulin|farine|ble/, 'moulin'], [/puits/, 'puits'], [/taverne|auberge/, 'taverne'],
  [/marche|etal|stand/, 'marche'], [/herbo|iris|bouquet/, 'herboristerie'], [/lisiere|foret|bois/, 'lisiere'], [/place|village|fontaine/, 'place'], [/labo|atelier|etagere/, 'labo']];
var INGR_MOTS = [[/champi/, 'champignon'], [/baie|myrtille|sureau|mure/, 'baies'], [/lune|etoile|astre/, 'lune'], [/lavand/, 'lavande'], [/menth/, 'menthe'], [/orti/, 'ortie'],
  [/trefl/, 'trefle'], [/pense/, 'pensee'], [/racin/, 'racine'], [/miel/, 'miel'], [/brume/, 'brume'], [/eau|rosee/, 'eau']];
function themeDe(t){
  if(!t) return null;
  if(THEMES[t]) return THEMES[t];
  var s = sansAccents(t);
  for(var k = 0; k < THEME_MOTS.length; k++) if(THEME_MOTS[k][0].test(s)) return THEMES[THEME_MOTS[k][1]];
  return null;
}
function ingredientDe(x){
  if(!x) return null;
  var id = typeof x === 'string' ? x : (x.id || x.nom || '');
  if(INGR_DESSIN[id]) return Object.assign({id:id}, INGR_DESSIN[id]);
  var s = sansAccents(id), k = 'rare';
  for(var j = 0; j < INGR_MOTS.length; j++) if(INGR_MOTS[j][0].test(s)){ k = INGR_MOTS[j][1]; break; }
  return Object.assign({id:k}, INGR_DESSIN[k], {libre:String(typeof x === 'string' ? x : (x.nom || x.id))});
}
/* Thème d'une partie : params.theme, sinon celui de l'ingrédient, sinon au hasard (mémorisé dans p._theme). */
function choisirTheme(p){
  p = p || {};
  if(p._theme && THEMES[p._theme]) return THEMES[p._theme];
  var th = themeDe(p.theme), ing = ingredientDe(p.ingredient);
  if(!th && ing) th = THEMES[ing.theme];
  if(!th) th = THEMES[U.choix(Object.keys(THEMES))];
  try{ p._theme = th.id; }catch(e){}
  return th;
}

/* ---------- Génération d'une scène et de ses différences ---------- */
var NON_INGR = {fenetre:1, lampadaire:1, tableau:1, horloge:1, engrenage:1, papillon:1, oiseau:1, fanions:1, panneau:1, toile:1};
function choisirType(k, used){
  var poids = k.map(function(t){ return 1 / (1 + 1.6 * (used[t] || 0)); }), tot = poids.reduce(function(a, b){ return a + b; }, 0), r = Math.random() * tot;
  for(var i = 0; i < k.length; i++){ r -= poids[i]; if(r <= 0) return k[i]; }
  return k[k.length - 1];
}
function nouvelObjet(t, sl){
  var def = DES[t];
  var o = {t:t, x:sl.x, y:sl.y, s:sl.s || 1, sl:sl, c:U.choix(def.pal || VIF), d:Math.random() < 0.6, n:def.n ? U.randInt(def.n[0], def.n[1]) : 1, v:U.randInt(0, 3), m:!!sl.m};
  if(def.asym && !sl.fixe && !sl.m) o.m = Math.random() < 0.35;
  if(t === 'lanterne' || t === 'lampadaire') o.d = Math.random() < 0.85;
  return o;
}
function boite(o, dx){
  var def = DES[o.t], w = def.w * o.s, h = def.h * o.s, x = o.x + (dx || 0);
  return def.pend ? {x0:x - w, y0:o.y, x1:x + w, y1:o.y + h} : {x0:x - w, y0:o.y - h, x1:x + w, y1:o.y};
}
function aire(o){ var b = boite(o); return (b.x1 - b.x0) * (b.y1 - b.y0); }
function chevauche(a, b, m){ return a.x0 < b.x1 + m && a.x1 > b.x0 - m && a.y0 < b.y1 + m && a.y1 > b.y0 - m; }
function poserIngredient(objs, ingr){
  var ok = objs.filter(function(o){ return !DES[o.t].pend && !NON_INGR[o.t] && !o.sl.fixe && o.s >= 0.74; });
  ok.sort(function(a, b){ return (b.y + Math.random() * 60) - (a.y + Math.random() * 60); });
  var choisis = [];
  ok.forEach(function(o){ if(choisis.length < 3 && choisis.every(function(c){ return Math.abs(c.x - o.x) > 70 || Math.abs(c.y - o.y) > 60; })) choisis.push(o); });
  choisis.forEach(function(o){
    var def = DES[ingr.t];
    o.t = ingr.t; o.c = ingr.c; o.v = ingr.v || 0; o.ingr = true; o.m = false;
    o.n = def.n ? Math.max(def.n[0], def.n[1] - 1) : 1; o.d = true;
  });
}
function autreCouleur(pal, c, pres){
  var autres = pal.filter(function(x){ return x !== c; }).map(function(x){ return {x:x, e:ecart(x, c)}; });
  if(pres){ autres = autres.filter(function(a){ return a.e > 110; }).sort(function(a, b){ return a.e - b.e; }); return autres.length ? autres[0].x : null; }
  autres.sort(function(a, b){ return b.e - a.e; });
  return autres.length ? U.choix(autres.slice(0, 2)).x : null;
}
function placeLibre(o, amp, objs){
  var dirs = U.melanger([-1, 1]);
  for(var k = 0; k < 2; k++){
    var bx = boite(o, dirs[k] * amp);
    if(bx.x0 < 2 || bx.x1 > 398) continue;
    var libre = objs.every(function(p){
      if(p === o) return true;
      var q = boite(p);
      return !(bx.x0 < q.x1 - 7 && bx.x1 > q.x0 + 7 && bx.y0 < q.y1 - 7 && bx.y1 > q.y0 + 7);
    });
    if(libre) return dirs[k];
  }
  return 0;
}
var SORTES = {
  facile:['absent', 'absent', 'couleur', 'couleur', 'nombre', 'detail'],
  moyen:['absent', 'couleur', 'nombre', 'detail', 'miroir', 'deplace'],
  fin:['couleur', 'teinte', 'nombre', 'detail', 'miroir', 'deplace', 'absent'],
  expert:['teinte', 'detail', 'miroir', 'deplace', 'nombre', 'teinte', 'deplace']
};
function appliquer(o, sorte, n, objs){
  var def = DES[o.t], b = Object.assign({}, o);
  if(sorte === 'absent'){ b.absent = true; return b; }
  if(sorte === 'couleur' || sorte === 'teinte'){
    if(def.pal === null || (def.couleurSi && !def.couleurSi(o))) return null;
    b.c = autreCouleur(def.pal || VIF, o.c, sorte === 'teinte'); return b.c ? b : null;
  }
  if(sorte === 'nombre'){
    if(!def.n || (def.nSubtil && n < 6)) return null;
    var lo = def.n[0], hi = def.n[1], dn = (n <= 2 || def.nSubtil) && hi - lo >= 2 ? 2 : 1, up = o.n + dn <= hi, down = o.n - dn >= lo;
    if(!up && !down) return null;
    b.n = up && (!down || Math.random() < 0.5) ? o.n + dn : o.n - dn; return b;
  }
  if(sorte === 'detail'){ if(!def.d || (n <= 3 && def.d !== 'gros')) return null; b.d = !o.d; return b; }
  if(sorte === 'miroir'){ if(!def.asym || o.sl.fixe || (def.asymSi && !def.asymSi(o))) return null; b.m = !o.m; return b; }
  if(sorte === 'deplace'){
    if(o.sl.fixe || DES[o.t].h * o.s > 80) return null;
    var amp = n <= 5 ? 30 : (n <= 8 ? 24 : 18), dir = placeLibre(o, amp, objs);
    if(!dir) return null;
    b.x = o.x + dir * amp; return b;
  }
  return null;
}
function choisirDiffs(objs, n, nDiff){
  var pool = n <= 2 ? SORTES.facile : (n <= 5 ? SORTES.moyen : (n <= 8 ? SORTES.fin : SORTES.expert));
  var cand = U.melanger(objs.map(function(o, i){ return i; }));
  if(n <= 2) cand.sort(function(a, b){ return aire(objs[b]) * U.rand(0.7, 1.3) - aire(objs[a]) * U.rand(0.7, 1.3); });
  var diffs = [];
  for(var pass = 0; pass < 3 && diffs.length < nDiff; pass++){
    var marge = pass === 0 ? 8 : (pass === 1 ? 2 : -6), sortes = pass === 2 ? SORTES.moyen.concat(SORTES.fin) : pool;
    cand.forEach(function(i){
      if(diffs.length >= nDiff || diffs.some(function(d){ return d.i === i; })) return;
      var o = objs[i];
      if(n <= 2 && pass === 0 && aire(o) < 900) return;
      var bo = boite(o);
      if(diffs.some(function(d){ return chevauche(bo, d.box, marge); })) return;
      var ss = U.melanger(sortes);
      for(var k = 0; k < ss.length; k++){
        var b = appliquer(o, ss[k], n, objs);
        if(!b) continue;
        var bb = b.absent ? bo : boite(b), bx = {x0:Math.min(bo.x0, bb.x0), y0:Math.min(bo.y0, bb.y0), x1:Math.max(bo.x1, bb.x1), y1:Math.max(bo.y1, bb.y1)};
        if(diffs.some(function(d){ return chevauche(bx, d.box, marge); })) continue;
        diffs.push({i:i, sorte:ss[k], b:b, cote:Math.random() < 0.5 ? 0 : 1, box:bx});
        break;
      }
    });
  }
  diffs.forEach(function(d){
    var bx = d.box;
    d.x = (bx.x0 + bx.x1) / 2; d.y = (bx.y0 + bx.y1) / 2;
    d.rx = Math.max(22, (bx.x1 - bx.x0) / 2 + 6); d.ry = Math.max(22, (bx.y1 - bx.y0) / 2 + 6);
  });
  return diffs;
}
function genererScene(th, n, nDiff, ingr){
  var objs = [], used = {};
  th.slots.forEach(function(sl){ var t = choisirType(sl.k, used); used[t] = (used[t] || 0) + 1; objs.push(nouvelObjet(t, sl)); });
  if(ingr) poserIngredient(objs, ingr);
  return {th:th, objs:objs, diffs:choisirDiffs(objs, n, nDiff)};
}
function e2(v){ return String(Math.round(v * 100) / 100); }
function dessinerObjet(o){
  if(o.absent) return '';
  var def = DES[o.t];
  return '<g transform="translate(' + f1(o.x) + ',' + f1(o.y) + ') scale(' + e2((o.m ? -1 : 1) * o.s) + ',' + e2(o.s) + ')">' +
    (o.ingr ? Halo(0, def.pend ? def.h / 2 : -def.h / 2, def.w + 14, def.h / 2 + 10, '#fff2b0', 0.16) : '') + def.art(o) + '</g>';
}
function imageSVG(scene, k, pref){
  var mods = {};
  scene.diffs.forEach(function(d){ if(d.cote === k) mods[d.i] = d.b; });
  return '<svg class="mjo-d-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" data-img="' + k + '">' + scene.th.bg(pref) +
    '<g class="mjo-d-objets">' + scene.objs.map(function(o, i){ return dessinerObjet(mods[i] || o); }).join('') + '</g>' +
    '<g class="mjo-d-marques"></g></svg>';
}


/* ==========================================================
   LES 7 DIFFÉRENCES (Alchimiste) — remplace « loupe ».
   Deux images côte à côte (l'une sous l'autre en portrait) ; toucher une
   différence sur l'une OU l'autre l'entoure sur les deux. Une mauvaise
   touche coûte un cœur. 10 décors (params.theme), cueillette d'un
   ingrédient rare (params.ingredient : il est dessiné plusieurs fois dans
   la scène et l'écran de victoire dit « Tu as trouvé … ! »).
   Mods : zone (zones de touche plus grandes), temps (+N s), lent (sablier
   plus long), erreurs (+N cœurs), aide (N indices 💡 : une différence
   clignote), revele (les différences scintillent doucement), facile (cœur).
   ========================================================== */
function txtDuree(s){ s = Math.round(s); if(s < 60) return s + ' secondes'; var m = Math.floor(s / 60), r = s % 60; return m + ' min' + (r ? ' ' + r + ' s' : ''); }
function majuscule(s){ s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function reglagesDiff(n, mods){
  mods = mods || {};
  var p = {};
  p.differences = n <= 2 ? 5 : (n <= 4 ? 6 : 7);
  p.duree = Math.round(courbe(n, {1:120, 3:105, 6:90, 10:70, 12:60}) / (mods.lent || 1) + (mods.temps || 0));
  p.vies = Math.max(1, entier(n, {1:6, 3:5, 6:4, 9:3, 12:2}) + Math.round(mods.erreurs || 0));
  p.erreurs = p.vies - 1;
  p.niveauScene = n;
  p.marge = mods.zone || 1;
  p.indices = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  p.lignes = [
    {nom:'Différences à trouver', val:String(p.differences)},
    {nom:'Elles sont', val:n <= 2 ? 'faciles à voir 👀' : (n <= 5 ? 'un peu cachées' : (n <= 8 ? 'bien cachées' : 'très bien cachées 🔍'))},
    {nom:'Le sablier', val:txtDuree(p.duree)},
    {nom:'Cœurs (erreurs permises)', val:p.erreurs + ' ❤️'},
    {nom:'Toucher à côté', val:'coûte un cœur'}
  ];
  if(p.marge > 1) p.lignes.push({nom:'Zones à toucher', val:'plus grandes'});
  if(p.indices) p.lignes.push({nom:'Indices 💡', val:String(p.indices)});
  if(p.revele) p.lignes.push({nom:'Les différences brillent', val:'oui ✨'});
  return p;
}
/* Ajoute le lieu et l'ingrédient aux lignes de l'écran de consigne (une seule fois). */
function lignesLieu(p){
  if(!p || p._lignesObs) return;
  p._lignesObs = 1;
  var th = choisirTheme(p), ing = ingredientDe(p.ingredient);
  if(!p.lignes) p.lignes = [];
  if(p.theme || ing) p.lignes.unshift({nom:'Le lieu', val:th.ic + ' ' + th.nom});
  if(ing) p.lignes.unshift({nom:'À cueillir', val:ing.ic + ' ' + (ing.libre || majuscule(ing.art))});
}

/* Une partie de différences dans el. quandFini(res) est appelé une seule fois. */
function partieDiff(el, p, P, quandFini){
  var n = p.niveauScene || p.niveauEffectif || 3, nDiff = p.differences || 7, marge = p.marge || 1;
  var th = choisirTheme(p), ing = ingredientDe(p.ingredient);
  var scene = genererScene(th, n, nDiff, ing);
  nDiff = scene.diffs.length;
  var id = nid('mjod');
  var racine = U.html('<div class="mjo-jeu mjo-diff mjo-th-' + th.id + '" style="--fond:' + th.fondCss + '">' +
    '<div class="mjo-fond" aria-hidden="true"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">' + th.bg(id + 'f') + '</svg></div></div>');
  el.appendChild(racine);
  var hud = creerHud(racine);
  var vies = p.vies || 3, viesMax = vies, trouvees = 0, rates = 0, restant = p.duree || 90, fini = false, indices = p.indices || 0, bloqueJusqua = 0;
  hud.vies(vies, viesMax); hud.prog(0, nDiff, '✓'); hud.temps(1);
  if(ing) hud.badge('<span class="mjo-ingr" title="À cueillir">' + ing.ic + '</span>');
  var aireEl = U.html('<div class="mjo-d-aire"><div class="mjo-d-images">' +
    '<div class="mjo-d-cadre">' + imageSVG(scene, 0, id + 'a') + '</div>' +
    '<div class="mjo-d-cadre">' + imageSVG(scene, 1, id + 'b') + '</div>' +
  '</div></div>');
  racine.appendChild(aireEl);
  var bas = null;
  if(indices || ing){
    bas = U.html('<div class="mjo-bas">' + (ing ? '<span class="mjo-cueille">' + ing.ic + ' <b></b></span>' : '') +
      (indices ? '<button class="btn magie mjo-indice" type="button">💡 × ' + indices + '</button>' : '') + '</div>');
    if(ing) bas.querySelector('.mjo-cueille b').textContent = 'À cueillir : ' + (ing.libre || ing.art);
    racine.appendChild(bas);
  }
  var images = aireEl.querySelector('.mjo-d-images'), cadres = Array.prototype.slice.call(aireEl.querySelectorAll('.mjo-d-cadre'));
  var svgs = cadres.map(function(c){ return c.querySelector('svg'); });
  function disposer(){
    var r = aireEl.getBoundingClientRect();
    if(!r.width || !r.height) return;
    var W = r.width - 12, H = r.height - 12, g = 10, pad = 12;
    var wCote = Math.min((W - g) / 2 - pad, (H - pad) * 4 / 3), wPile = Math.min(W - pad, ((H - g) / 2 - pad) * 4 / 3);
    var pile = wPile >= wCote, w = Math.max(140, Math.floor(pile ? wPile : wCote));
    images.classList.toggle('pile', pile);
    cadres.forEach(function(c){ c.style.width = (w + pad) + 'px'; c.style.height = Math.round(w * 0.75 + pad) + 'px'; });
  }
  disposer();
  P.observe(aireEl, disposer);

  function marque(d, cls){
    svgs.forEach(function(s){
      var g = svgNoeud('g', {'class':'mjo-rond ' + (cls || ''), transform:'translate(' + f1(d.x) + ',' + f1(d.y) + ')'}, s.querySelector('.mjo-d-marques'));
      g.innerHTML = '<ellipse class="mjo-rond-o" rx="' + f1(d.rx) + '" ry="' + f1(d.ry) + '" pathLength="100"/><ellipse class="mjo-rond-i" rx="' + f1(d.rx) + '" ry="' + f1(d.ry) + '" pathLength="100"/>' +
        (cls ? '' : etincelle(d.rx * 0.72, -d.ry * 0.72, 7, '#fff4c0') + etincelle(-d.rx * 0.8, d.ry * 0.5, 5, '#fff4c0'));
      d.marques = (d.marques || []).concat([g]);
    });
  }
  if(p.revele) scene.diffs.forEach(function(d){
    svgs.forEach(function(s){ var g = svgNoeud('g', {'class':'mjo-scint', transform:'translate(' + f1(d.x) + ',' + f1(d.y) + ')'}, s.querySelector('.mjo-d-marques')); g.innerHTML = etincelle(0, 0, 9, '#ffffff') + etincelle(d.rx * 0.5, -d.ry * 0.4, 5, '#bff9ff'); d.scint = (d.scint || []).concat([g]); });
  });
  function dedans(d, pt){ var dx = (pt.x - d.x) / (d.rx * marge + 4), dy = (pt.y - d.y) / (d.ry * marge + 4); return dx * dx + dy * dy <= 1; }
  function toucher(k, pt){
    if(fini) return;
    var d = null, best = 9;
    scene.diffs.forEach(function(x){ if(x.ok || !dedans(x, pt)) return; var q = Math.hypot((pt.x - x.x) / x.rx, (pt.y - x.y) / x.ry); if(q < best){ best = q; d = x; } });
    if(d){
      d.ok = true; trouvees++;
      (d.scint || []).forEach(retirer); (d.indice || []).forEach(retirer);
      marque(d);
      P.sons.ding(); U.vibrer(15);
      hud.prog(trouvees, nDiff, '✓');
      if(trouvees >= nDiff){
        fini = true;
        annonce(racine, ing ? ing.ic + ' Bravo !' : 'Bravo !', 1300);
        var res = {reussi:true, score:1, erreurs:rates, detail:'Les ' + nDiff + ' différences sont trouvées' + (rates ? ' (' + rates + ' touche' + (rates > 1 ? 's' : '') + ' à côté).' : ', sans une seule erreur !')};
        if(ing) res.message = ing.libre ? 'Tu as trouvé : ' + ing.libre + ' !' : 'Tu as trouvé ' + ing.art + ' !';
        if(ing) res.ingredient = ing.libre || ing.id;
        quandFini(res);
      }
      return;
    }
    /* touche à côté : pas de pénalité si on touche une différence déjà trouvée, ni deux fois de suite trop vite */
    if(scene.diffs.some(function(x){ return x.ok && dedans(x, pt); })) return;
    var t = performance.now();
    if(t < bloqueJusqua) return;
    bloqueJusqua = t + 450;
    rates++; vies--;
    hud.perdVie(vies, viesMax);
    U.son('ko'); U.vibrer(40);
    relancer(cadres[k], 'mjo-secoue');
    var x = svgNoeud('g', {'class':'mjo-croix', transform:'translate(' + f1(pt.x) + ',' + f1(pt.y) + ')'}, svgs[k].querySelector('.mjo-d-marques'));
    x.innerHTML = Tr('M-9,-9 L9,9 M9,-9 L-9,9', K, 7) + Tr('M-9,-9 L9,9 M9,-9 L-9,9', '#ff6b6b', 3.6);
    P.apres(750, function(){ retirer(x); });
    if(vies <= 0){ fini = true; montrerTout(); quandFini({reussi:false, score:trouvees / nDiff, erreurs:rates, detail:'Plus de cœur : c\'était l\'erreur de trop… Il en restait ' + (nDiff - trouvees) + ' à trouver.'}); }
  }
  svgs.forEach(function(s, k){
    P.ecoute(s, 'pointerdown', function(e){ if(fini) return; e.preventDefault(); toucher(k, ptSVG(s, e)); });
  });
  var bi = bas && bas.querySelector('.mjo-indice');
  if(bi) P.ecoute(bi, 'click', function(){
    if(fini || indices <= 0) return;
    var reste = scene.diffs.filter(function(d){ return !d.ok; });
    if(!reste.length) return;
    indices--; bi.textContent = '💡 × ' + indices; if(!indices) bi.disabled = true;
    var d = U.choix(reste);
    P.sons.pop();
    svgs.forEach(function(s){ var g = svgNoeud('g', {'class':'mjo-indice-rond', transform:'translate(' + f1(d.x) + ',' + f1(d.y) + ')'}, s.querySelector('.mjo-d-marques')); g.innerHTML = '<ellipse rx="' + f1(d.rx + 6) + '" ry="' + f1(d.ry + 6) + '"/>'; d.indice = (d.indice || []).concat([g]); P.apres(2600, function(){ retirer(g); }); });
  });
  function montrerTout(){ scene.diffs.forEach(function(d){ if(!d.ok){ (d.scint || []).forEach(retirer); marque(d, 'manque'); } }); }
  racine.mjoEtat = function(){
    return {jeu:'differences', theme:th.id, ingredient:ing ? ing.id : null, ingrNb:scene.objs.filter(function(o){ return o.ingr; }).length, vies:vies, viesMax:viesMax, restant:restant, trouvees:trouvees,
      diffs:scene.diffs.map(function(d){ var a = versEcran(svgs[0], d.x, d.y), b = versEcran(svgs[1], d.x, d.y); return {x:d.x, y:d.y, rx:d.rx, ry:d.ry, sorte:d.sorte, objet:scene.objs[d.i].t, ok:!!d.ok, ecran:[a, b]}; }),
      rect:svgs.map(function(s){ var r = s.getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height}; })};
  };
  P.boucle(function(dt){
    if(fini) return false;
    restant -= dt;
    hud.temps(restant / (p.duree || 90));
    if(restant <= 0){ fini = true; montrerTout(); quandFini({reussi:false, score:trouvees / nDiff, erreurs:rates, detail:'Le sablier est vide… Il en restait ' + (nDiff - trouvees) + ' à trouver.'}); return false; }
  });
  return racine;
}

MJ.enregistrer('differences', {
  nom:'Les 7 différences', role:'alchimiste', ic:'🔎',
  consigne:function(p){
    lignesLieu(p);
    var ing = ingredientDe(p && p.ingredient), nb = (p && p.differences) || 7;
    if(ing) return 'Trouve les ' + nb + ' différences entre les deux images pour cueillir ' + (ing.libre ? 'cet ingrédient rare' : ing.art) + ' ! Touche-les sur l\'une ou l\'autre image.';
    return 'Trouve les ' + nb + ' différences entre les deux images ! Touche-les sur l\'une ou l\'autre image.';
  },
  minuteur:true,
  reglages: reglagesDiff,
  themes: THEMES,
  demo: function(el, p){
    var th = choisirTheme(p), ing = ingredientDe(p && p.ingredient), id = nid('mjodd');
    var fond = '<defs><clipPath id="' + id + 'a"><rect x="14" y="16" width="130" height="104" rx="8"/></clipPath><clipPath id="' + id + 'b"><rect x="156" y="16" width="130" height="104" rx="8"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'a)"><g transform="translate(14,16) scale(.325,.3467)">' + th.bg(id + 'x') + '</g></g>' +
      '<g clip-path="url(#' + id + 'b)"><g transform="translate(156,16) scale(.325,.3467)">' + th.bg(id + 'y') + '</g></g>' +
      Re(14, 16, 130, 104, 8, 'none', 3, ' stroke="#d29a5e"') + Re(156, 16, 130, 104, 8, 'none', 3, ' stroke="#d29a5e"');
    var d = demoScene(el, fond);
    var t1 = ing ? ing.t : 'fiole', c1 = ing ? ing.c : '#3f7fe0';
    var objs = [{t:t1, x:44, y:112, s:0.8, c:c1, d:true, n:2, v:ing ? ing.v || 0 : 0}, {t:'champignon', x:79, y:112, s:0.8, c:'#e5484d', d:true, n:1}, {t:'bougie', x:114, y:112, s:0.75, c:'#f3e7cb', d:true}];
    var objs2 = objs.map(function(o){ return Object.assign({}, o, {x:o.x + 142}); });
    objs2[1].c = '#4fbf6a';
    d.contenu.innerHTML = objs.map(dessinerObjet).join('') + objs2.map(dessinerObjet).join('') +
      '<g class="mjo-demo-ronds" opacity="0"><ellipse cx="79" cy="96" rx="20" ry="22" fill="none" stroke="#ffd36a" stroke-width="3.5"/><ellipse cx="221" cy="96" rx="20" ry="22" fill="none" stroke="#ffd36a" stroke-width="3.5"/></g>';
    var r = d.contenu.querySelector('.mjo-demo-ronds');
    return scenario(d.svg, [
      [10, function(){ r.setAttribute('opacity', '0'); d.vers(262, 150, 0); }],
      [500, function(){ d.vers(222, 104, 800); }],
      [900, function(){ d.tape(); r.setAttribute('opacity', '1'); U.son('ok'); }],
      [1300, function(){}]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    partieDiff(el, p, P, function(res){ P.finir(res, res.reussi ? 1100 : 1600); });
    return {arreter: P.arreter};
  }
});


/* ==========================================================
   LE DOUBLE (Alchimiste) — façon Dobble.
   Deux cartes rondes : la carte du chaudron (en haut / à gauche) et
   ta carte. Elles ont TOUJOURS exactement un symbole en commun (plan
   projectif d'ordre q : q = 5 → 31 cartes de 6 symboles ; q = 7 →
   57 cartes de 8 symboles). Toucher ce symbole (sur l'une ou l'autre
   carte) : ta carte part sur le chaudron, une nouvelle arrive.
   Une erreur : la carte tremble et le sablier perd quelques secondes.
   Mods : zone (symboles plus gros, touche plus large), temps (+N s),
   lent (sablier plus long), erreurs (+N boucliers : une erreur gratuite),
   aide (N indices 💡 : le symbole commun brille), revele (il brille tout
   seul après 3 secondes), facile (cœur).
   ========================================================== */
var SYM = [];
function S(id, f, c, art){ SYM.push({id:id, f:f, c:c, art:art}); }
var FAMILLES = {fiole:'#9d6ee3', plante:'#4fbf6a', ciel:'#f6d23a', bete:'#c98a4a', objet:'#3f7fe0', pierre:'#3fd0c8', feu:'#f08a3c'};
var VR = '#eaf6ff';
S('fiole', 'fiole', '#9d6ee3', function(c){ var b = 'M-5,-22 L5,-22 L5,-10 C15,-6 18,2 16,9 C13,19 -13,19 -16,9 C-18,2 -15,-6 -5,-10 Z'; return Pa(b, VR) + Pa('M-16.5,4 C-6,0 6,8 16.5,4 C15,15 8,18 0,18 C-8,18 -15,15 -16.5,4 Z', c, 0) + Pa(b, 'none') + Re(-6, -27, 12, 6, 2, '#c07a3e', 2) + Br('M-11,-2 C-13,3 -12,8 -10,11', 2.2); });
S('eprouvette', 'fiole', '#4fbf6a', function(c){ return '<g transform="rotate(-18)">' + Pa('M-6,-22 L6,-22 L6,16 C6,24 -6,24 -6,16 Z', VR) + Pa('M-6,0 L6,0 L6,16 C6,24 -6,24 -6,16 Z', c, 0) + Pa('M-6,-22 L6,-22 L6,16 C6,24 -6,24 -6,16 Z', 'none') + Re(-8.5, -25, 17, 4, 2, '#d8ecff', 2) + Ci(-1, -6, 2, c, 1.2) + Ci(2, -12, 1.5, c, 1.2) + '</g>'; });
S('bouteille', 'fiole', '#3f7fe0', function(c){ return Pa('M-4,-22 L4,-22 L4,-11 C12,-7 12,-3 12,1 L12,18 C12,21 10,22 8,22 L-8,22 C-10,22 -12,21 -12,18 L-12,1 C-12,-3 -12,-7 -4,-11 Z', c) + Om('M4,-11 C12,-7 12,-3 12,1 L12,18 C12,21 10,22 8,22 L5,22 C7,10 7,-2 4,-11 Z', 0.25) + Re(-9, 3, 18, 10, 2, '#f3e7cb', 1.6) + Re(-5, -27, 10, 6, 2, '#c07a3e', 2) + Br('M-8,-1 V16', 2.2, 0.4); });
S('bocal', 'fiole', '#f08a3c', function(c){ return Re(-15, -12, 30, 33, 8, VR) + Pa('M-13,0 C-6,-3 6,3 13,0 L13,14 C13,18 11,19 8,19 L-8,19 C-11,19 -13,18 -13,14 Z', c, 0) + Re(-15, -12, 30, 33, 8, 'none') + Re(-17, -21, 34, 10, 3, '#c98450') + Br('M-10,-6 V12', 2, 0.5); });
S('chaudron', 'objet', '#4fbf6a', function(c){ return Tr('M-13,15 L-16,22 M13,15 L16,22', K, 3.6) + Pa('M-20,-6 C-22,12 -10,19 0,19 C10,19 22,12 20,-6 Z', '#3a3352') + Br('M-14,0 C-13,8 -9,12 -4,14', 2, 0.35) + El(0, -6, 22, 6, '#2b2540') + El(0, -6, 18, 4, c, 0) + Ci(-6, -10, 3, clair(c, 0.4), 1.4) + Ci(6, -13, 3.6, clair(c, 0.4), 1.4); });
S('mortier', 'objet', '#9a94b8', function(c){ return Pa('M2,-4 L14,-24 C16,-27 20,-25 18,-22 L8,-2 Z', '#d8c8b0') + Pa('M-19,-4 C-19,12 -10,19 0,19 C10,19 19,12 19,-4 Z', c) + Om('M19,-4 C19,12 10,19 0,19 C8,14 11,6 11,-4 Z', 0.22) + El(0, -4, 19, 5, fonce(c, 0.25)); });
S('sablier', 'objet', '#f6d23a', function(c){ var v = 'M-10,-18 C-10,-6 -2,-4 -2,0 C-2,4 -10,6 -10,18 L10,18 C10,6 2,4 2,0 C2,-4 10,-6 10,-18 Z'; return Pa(v, VR) + Pa('M-8,17 C-7,10 -3,7 0,6 C3,7 7,10 8,17 Z', c, 0) + Pa('M-7,-15 L7,-15 C6,-10 3,-6 0,-4 C-3,-6 -6,-10 -7,-15 Z', c, 0) + Pa(v, 'none') + Re(-15, -24, 30, 6, 2.5, '#a8743f') + Re(-15, 18, 30, 6, 2.5, '#a8743f'); });
S('feuille', 'plante', '#4fbf6a', function(c){ return Pa('M-18,18 C-22,-6 -4,-22 20,-20 C22,4 6,20 -18,18 Z', c) + Tr('M-18,18 C-6,6 6,-6 16,-16', fonce(c, 0.35), 2) + Tr('M-6,6 L-8,-6 M2,-2 L10,0 M4,-4 L2,-14', fonce(c, 0.35), 1.4); });
S('trefle', 'plante', '#2f9e44', function(c){ var s = Tr('M0,4 C2,12 4,18 8,22', '#2a6a2a', 2.6); [-90, 30, 150].forEach(function(a){ s += '<g transform="rotate(' + a + ') translate(10,0)">' + Pa('M-9,0 C-9,-9 0,-11 2,-4 C4,-11 13,-9 11,0 C9,6 2,9 1,10 C0,9 -9,6 -9,0 Z', c, 2, ' transform="rotate(90)"') + '</g>'; }); return s; });
S('champignon', 'plante', '#e5484d', function(c){ return Pa('M-7,20 C-7,10 -6,2 -5,-2 L5,-2 C6,2 7,10 7,20 Z', '#fff4dc') + Pa('M-22,0 C-22,-24 22,-24 22,0 C14,4 -14,4 -22,0 Z', c) + Ci(-10, -10, 4, '#ffffff', 1.4) + Ci(5, -14, 3.4, '#ffffff', 1.4) + Ci(13, -5, 3, '#ffffff', 1.4); });
S('fleur', 'plante', '#ef7fa8', function(c){ var s = ''; for(var k = 0; k < 6; k++){ var a = k * 60; s += El(0, -12, 7, 11, c, 2, ' transform="rotate(' + a + ')"'); } return s + Ci(0, 0, 7, '#f6d23a', 2); });
S('lavande', 'plante', '#9d6ee3', function(c){ var s = Tr('M0,24 V-12', '#3f8a4a', 2.6) + Pa('M0,14 C-8,6 -14,8 -14,12 C-10,14 -4,14 0,14 Z', '#4fbf6a', 1.6); for(var k = 0; k < 6; k++) s += El(k % 2 ? 4 : -4, -20 + k * 5.5, 4.6, 5.2, k % 2 ? c : fonce(c, 0.15), 1.5); return s; });
S('baies', 'plante', '#7d3aa8', function(c){ return Pa('M2,-14 C10,-24 20,-20 20,-14 C12,-10 6,-11 2,-14 Z', '#4fbf6a', 1.6) + Tr('M2,-14 L-2,-4 M2,-14 L8,-2', '#3f7a3a', 1.8) + Ci(-7, 2, 8, c, 2) + Ci(9, 4, 8, c, 2) + Ci(1, 14, 8, c, 2) + Ci(-9, 0, 2, '#ffffff', 0, ' opacity=".7"') + Ci(7, 2, 2, '#ffffff', 0, ' opacity=".7"') + Ci(-1, 12, 2, '#ffffff', 0, ' opacity=".7"'); });
S('gland', 'plante', '#a8743f', function(c){ return Pa('M-12,-4 C-12,10 -6,20 0,22 C6,20 12,10 12,-4 Z', c) + Pa('M-16,-4 C-16,-16 16,-16 16,-4 C10,0 -10,0 -16,-4 Z', '#6b4a2a') + Tr('M-10,-8 L-4,-13 M-4,-6 L4,-14 M4,-6 L10,-11', '#4a2e1a', 1.4) + Tr('M0,-14 V-20', '#4a2e1a', 2.4) + Br('M-7,2 C-7,8 -5,13 -2,16', 1.8, 0.45); });
S('pomme', 'plante', '#e5484d', function(c){ return Pa('M0,-12 C-6,-20 -21,-18 -20,-2 C-19,12 -8,20 0,16 C8,20 19,12 20,-2 C21,-18 6,-20 0,-12 Z', c) + Tr('M0,-12 L2,-21', '#5e3a1e', 2.4) + Pa('M2,-18 C8,-26 16,-22 16,-19 C10,-15 6,-15 2,-18 Z', '#4fbf6a', 1.6) + Br('M-13,-6 C-13,-10 -10,-12 -7,-12', 2.2, 0.6); });
S('cristal', 'pierre', '#3fd0c8', function(c){ return Pa('M0,-24 L12,-12 L12,14 L0,24 L-12,14 L-12,-12 Z', c) + Pa('M0,-24 L12,-12 L12,14 L0,24 Z', fonce(c, 0.25), 0) + Pa('M0,-24 L12,-12 L12,14 L0,24 L-12,14 L-12,-12 Z', 'none') + Tr('M-12,-12 L0,-4 L12,-12 M0,-4 V24', K, 1.4, 0.5) + Br('M-7,-10 L-7,8', 2.2); });
S('diamant', 'pierre', '#8ff3ff', function(c){ return Pa('M-21,-6 L-11,-18 L11,-18 L21,-6 L0,21 Z', c) + Tr('M-21,-6 H21 M-11,-18 L-6,-6 L0,21 L6,-6 L11,-18 M-6,-6 L0,-18 L6,-6', K, 1.4, 0.6) + Pa('M11,-18 L21,-6 L0,21 L6,-6 Z', fonce(c, 0.2), 0, ' opacity=".5"') + Br('M-14,-9 L-9,-15', 2.2); });
S('lune', 'ciel', '#f6d23a', function(c){ return Pa('M6,-22 C-12,-22 -22,-6 -18,8 C-14,20 0,24 10,20 C-4,16 -10,4 -8,-6 C-6,-14 0,-20 6,-22 Z', c) + Ci(-10, 4, 2, fonce(c, 0.25), 0) + Ci(-6, 12, 1.5, fonce(c, 0.25), 0); });
S('etoile', 'ciel', '#f6d23a', function(c){ var d = ''; for(var k = 0; k < 10; k++){ var a = k * Math.PI / 5 - Math.PI / 2, r = k % 2 ? 9.5 : 23; d += (k ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r + 2) + ' '; } return Pa(d + 'Z', c) + Br('M-6,-4 L-2,-12', 2, 0.6); });
S('soleil', 'ciel', '#f08a3c', function(c){ var s = ''; for(var k = 0; k < 8; k++) s += Pa('M-4,-14 L0,-24 L4,-14 Z', clair(c, 0.2), 1.8, ' transform="rotate(' + k * 45 + ')"'); return s + Ci(0, 0, 13, c, 2.4) + Ci(-4, -3, 1.6, K, 0) + Ci(4, -3, 1.6, K, 0) + Tr('M-5,4 C-2,7 2,7 5,4', K, 1.6); });
S('eclair', 'ciel', '#f6d23a', function(c){ return Pa('M4,-24 L-14,4 L-2,4 L-8,24 L14,-6 L2,-6 L10,-24 Z', c); });
S('flamme', 'feu', '#f08a3c', function(c){ return Pa('M0,-24 C10,-12 18,-4 16,8 C14,18 6,22 0,22 C-6,22 -14,18 -16,8 C-18,-4 -8,-6 -6,-16 C-2,-10 -2,-6 0,-4 C2,-12 0,-18 0,-24 Z', c) + Pa('M0,4 C6,8 8,12 6,16 C4,20 -4,20 -6,16 C-8,12 -4,8 0,4 Z', '#ffe36a', 1.6); });
S('goutte', 'ciel', '#3f7fe0', function(c){ return Pa('M0,-24 C8,-10 16,-2 16,8 C16,18 8,23 0,23 C-8,23 -16,18 -16,8 C-16,-2 -8,-10 0,-24 Z', c) + Br('M-8,6 C-8,12 -5,15 -2,16', 2.4, 0.6); });
S('flocon', 'ciel', '#8ff3ff', function(c){ var d = ''; for(var k = 0; k < 6; k++){ var a = k * Math.PI / 3, x = Math.cos(a) * 22, y = Math.sin(a) * 22, x2 = Math.cos(a) * 13, y2 = Math.sin(a) * 13; d += 'M0,0 L' + f1(x) + ',' + f1(y) + ' M' + f1(x2) + ',' + f1(y2) + ' L' + f1(x2 + Math.cos(a + 0.8) * 7) + ',' + f1(y2 + Math.sin(a + 0.8) * 7) + ' M' + f1(x2) + ',' + f1(y2) + ' L' + f1(x2 + Math.cos(a - 0.8) * 7) + ',' + f1(y2 + Math.sin(a - 0.8) * 7) + ' '; } return Tr(d, K, 7) + Tr(d, c, 3.6) + Ci(0, 0, 4, c, 2); });
S('nuage', 'ciel', '#c9d3ff', function(c){ return Pa('M-18,12 C-26,12 -26,0 -18,-1 C-18,-12 -4,-16 2,-8 C6,-16 20,-14 18,-2 C26,-2 26,12 18,12 Z', c) + Br('M-14,4 C-14,0 -12,-2 -9,-3', 2, 0.6); });
S('corbeau', 'bete', '#3a3352', function(c){ return Pa('M-20,8 L-26,14 L-22,2 Z', c, 2) + Pa('M-20,6 C-18,-8 -2,-12 8,-8 C12,-14 20,-14 22,-8 L28,-6 L22,-3 C20,6 8,14 -4,14 C-10,14 -16,12 -20,6 Z', c) + Pa('M-12,0 C-6,6 6,6 10,2 C4,-2 -6,-4 -12,0 Z', clair(c, 0.2), 1.6) + Ci(15, -9, 1.8, '#ffffff', 0) + Tr('M-2,14 L-4,22 M4,13 L4,22', '#f6a23a', 2); });
S('chat', 'bete', '#f2a65a', function(c){ return Pa('M-18,-6 L-16,-24 L-6,-14 Z', c) + Pa('M18,-6 L16,-24 L6,-14 Z', c) + Ci(0, 2, 18, c) + El(-7, -1, 3, 4, '#3a3352', 0) + El(7, -1, 3, 4, '#3a3352', 0) + Pa('M-3,6 L3,6 L0,9 Z', '#ff9fb8', 1.4) + Tr('M-8,10 h-12 M-8,12 l-11,4 M8,10 h12 M8,12 l11,4', K, 1.2, 0.7); });
S('hibou', 'bete', '#a8743f', function(c){ return Pa('M-16,-14 L-12,-24 L-6,-17 L6,-17 L12,-24 L16,-14 C20,0 18,20 0,22 C-18,20 -20,0 -16,-14 Z', c) + El(0, 10, 9, 10, clair(c, 0.35), 0) + Ci(-7, -8, 7, '#ffffff', 2) + Ci(7, -8, 7, '#ffffff', 2) + Ci(-7, -8, 3, K, 0) + Ci(7, -8, 3, K, 0) + Pa('M-3,-2 L3,-2 L0,4 Z', '#f6a23a', 1.4); });
S('grenouille', 'bete', '#4fbf6a', function(c){ return El(0, 6, 20, 15, c) + Ci(-10, -10, 7, c) + Ci(10, -10, 7, c) + Ci(-10, -10, 4, '#ffffff', 1.4) + Ci(10, -10, 4, '#ffffff', 1.4) + Ci(-10, -10, 2, K, 0) + Ci(10, -10, 2, K, 0) + Tr('M-9,6 C-4,11 4,11 9,6', K, 1.8) + Ci(-6, 2, 1.4, fonce(c, 0.3), 0) + Ci(6, 2, 1.4, fonce(c, 0.3), 0); });
S('araignee', 'bete', '#3a3352', function(c){ return Tr('M-6,-2 C-14,-12 -20,-10 -24,-4 M-6,2 C-16,-2 -22,4 -24,10 M-5,6 C-12,8 -16,16 -16,22 M6,-2 C14,-12 20,-10 24,-4 M6,2 C16,-2 22,4 24,10 M5,6 C12,8 16,16 16,22 M-4,-6 C-8,-16 -14,-20 -18,-22 M4,-6 C8,-16 14,-20 18,-22', K, 2.4) + Ci(0, 6, 10, c) + Ci(0, -8, 6, c) + Ci(-2.4, -9, 1.6, '#ffffff', 0) + Ci(2.4, -9, 1.6, '#ffffff', 0) + Pa('M-3,2 L3,2 L0,8 Z', '#e5484d', 0); });
S('escargot', 'bete', '#f08a3c', function(c){ return Pa('M-24,16 C-24,10 -20,8 -16,8 L-16,-2 C-16,-6 -11,-6 -11,-2 L-11,10 L16,10 C22,12 24,16 24,16 Z', '#e0cfa8', 2) + Tr('M-15,-3 L-18,-12 M-12,-3 L-11,-12', K, 1.6) + Ci(-18, -12, 2, K, 0) + Ci(-11, -12, 2, K, 0) + Ci(4, -2, 14, c) + Tr('M4,-2 C4,-6 9,-6 9,-2 C9,4 0,4 -1,-2 C-2,-10 10,-13 13,-5', fonce(c, 0.45), 2); });
S('papillon', 'bete', '#3f7fe0', function(c){ return Pa('M0,-2 C-8,-18 -26,-20 -22,-4 C-20,4 -8,2 0,0 Z', c) + Pa('M0,-2 C8,-18 26,-20 22,-4 C20,4 8,2 0,0 Z', c) + Pa('M0,2 C-8,6 -18,12 -12,20 C-6,22 -2,12 0,4 Z', clair(c, 0.35)) + Pa('M0,2 C8,6 18,12 12,20 C6,22 2,12 0,4 Z', clair(c, 0.35)) + El(0, 2, 3, 12, '#3a3352', 1.6) + Tr('M-1,-9 C-3,-16 -7,-19 -9,-20 M1,-9 C3,-16 7,-19 9,-20', K, 1.4) + Ci(-13, -9, 3, '#ffffff', 1.2) + Ci(13, -9, 3, '#ffffff', 1.2); });
S('serpent', 'bete', '#4fbf6a', function(c){ var d = 'M-20,18 C-4,22 8,14 0,6 C-8,-2 -8,-12 4,-16 C10,-18 14,-14 16,-12'; return Tr(d, K, 11) + Tr(d, c, 7) + Tr(d, clair(c, 0.4), 2, 0.6) + El(18, -12, 7, 5, c, 2, ' transform="rotate(-20 18 -12)"') + Ci(19, -14, 1.4, K, 0) + Tr('M24,-14 L29,-16 M24,-14 L29,-12', '#e5484d', 1.4); });
S('poisson', 'bete', '#3fd0c8', function(c){ return Pa('M14,0 L26,-12 L24,0 L26,12 Z', fonce(c, 0.15)) + Pa('M-24,0 C-16,-14 4,-16 16,0 C4,16 -16,14 -24,0 Z', c) + Ci(-14, -3, 2.4, '#ffffff', 1.2) + Ci(-14, -3, 1, K, 0) + Tr('M-4,-9 C0,-4 0,4 -4,9', fonce(c, 0.35), 1.6) + Pa('M-2,-12 C2,-20 8,-18 10,-8 Z', fonce(c, 0.15), 1.6); });
S('chauvesouris', 'bete', '#6b3f8a', function(c){ return Pa('M0,-6 C-6,-10 -14,-14 -26,-8 C-22,-4 -22,2 -20,6 C-16,2 -12,4 -10,8 C-6,4 -2,6 0,10 C2,6 6,4 10,8 C12,4 16,2 20,6 C22,2 22,-4 26,-8 C14,-14 6,-10 0,-6 Z', c) + Pa('M-5,-6 L-6,-14 L-2,-9 L2,-9 L6,-14 L5,-6 C5,0 -5,0 -5,-6 Z', c, 2) + Ci(-2.2, -5, 1.2, '#ffd36a', 0) + Ci(2.2, -5, 1.2, '#ffd36a', 0); });
S('cle', 'objet', '#f6d23a', function(c){ return '<g transform="rotate(-35)">' + Tr('M-4,0 L24,0 M18,0 V8 M12,0 V6', K, 7.5) + Tr('M-4,0 L24,0 M18,0 V8 M12,0 V6', c, 4) + Ci(-12, 0, 10, c, 2.4) + Ci(-12, 0, 4, '#2b2540', 2) + '</g>'; });
S('oeil', 'objet', '#3f7fe0', function(c){ return Pa('M-24,0 C-12,-16 12,-16 24,0 C12,16 -12,16 -24,0 Z', '#ffffff') + Ci(0, 0, 9, c, 2) + Ci(0, 0, 4, K, 0) + Ci(-3, -3, 2, '#ffffff', 0) + Tr('M-16,-12 l-3,-5 M0,-15 v-6 M16,-12 l3,-5', K, 2); });
S('bougie', 'objet', '#ef7fa8', function(c){ return Pa('M0,-24 C6,-16 6,-12 0,-8 C-6,-12 -6,-16 0,-24 Z', '#ffd36a', 1.6, ' stroke="#e8693c"') + Re(-7, -6, 14, 24, 3, c) + Pa('M-7,-6 C-7,0 -3,0 -3,4 L-3,-6 Z', clair(c, 0.45), 1.2) + El(0, 20, 15, 4, '#d6a24a'); });
S('livre', 'objet', '#e5484d', function(c){ return Re(-17, -21, 34, 42, 3, c) + Re(-14, -21, 4, 42, 1, fonce(c, 0.3), 1.6) + Re(-4, -10, 16, 16, 3, '#f6d23a', 1.8) + Ci(4, -2, 3.4, '#8ff3ff', 1.4) + Tr('M15,-18 V18', '#f3e7cb', 2, 0.7); });
S('plume', 'objet', '#3fd0c8', function(c){ return Pa('M-16,22 C-12,6 0,-14 18,-24 C16,-6 4,12 -12,18 Z', c) + Tr('M-16,22 L16,-20', K, 1.6) + Tr('M-4,6 L-10,2 M2,-2 L-4,-6 M8,-10 L2,-14 M-6,10 L0,14 M0,2 L6,6 M6,-6 L12,-2', fonce(c, 0.35), 1.4); });
S('cloche', 'objet', '#f6d23a', function(c){ return Pa('M-16,12 C-14,10 -12,6 -12,-4 C-12,-14 -6,-18 0,-18 C6,-18 12,-14 12,-4 C12,6 14,10 16,12 Z', c) + Re(-18, 11, 36, 5, 2, fonce(c, 0.15), 2) + Ci(0, 19, 4, fonce(c, 0.2), 2) + Ci(0, -21, 3, 'none', 2) + Br('M-7,-8 C-7,-2 -7,4 -8,8', 2, 0.6); });
S('couronne', 'objet', '#f6d23a', function(c){ return Pa('M-20,14 L-22,-12 L-11,-2 L0,-18 L11,-2 L22,-12 L20,14 Z', c) + Re(-20, 10, 40, 7, 2, fonce(c, 0.15), 2) + Ci(-22, -14, 3, '#e5484d', 1.4) + Ci(0, -20, 3, '#3f7fe0', 1.4) + Ci(22, -14, 3, '#4fbf6a', 1.4) + Ci(0, 4, 3.4, '#e5484d', 1.4); });
S('anneau', 'pierre', '#f6d23a', function(c){ return Ci(0, 6, 15, 'none', 9) + Ci(0, 6, 15, 'none', 0, ' stroke="' + c + '" stroke-width="5"') + Pa('M-8,-10 L0,-22 L8,-10 L0,-4 Z', '#e5484d', 2) + Tr('M-8,-10 H8', K, 1.2, 0.6); });
S('coeur', 'objet', '#e5484d', function(c){ return Pa('M0,20 C-14,10 -22,2 -22,-8 C-22,-16 -16,-21 -10,-21 C-5,-21 -2,-18 0,-14 C2,-18 5,-21 10,-21 C16,-21 22,-16 22,-8 C22,2 14,10 0,20 Z', c) + Br('M-14,-12 C-14,-15 -12,-17 -9,-17', 2.4, 0.6); });
S('lanterne', 'objet', '#f08a3c', function(c){ return Ci(0, -21, 3.4, 'none', 2) + Pa('M-10,-16 L10,-16 L13,-12 L-13,-12 Z', '#3a3352') + Re(-11, -12, 22, 26, 3, c) + Tr('M-4,-12 V14 M4,-12 V14', '#3a3352', 2.2) + Pa('M-13,14 L13,14 L10,20 L-10,20 Z', '#3a3352') + Pa('M0,-6 C4,-2 4,3 0,6 C-4,3 -4,-2 0,-6 Z', '#fff7d0', 1.2); });
S('parchemin', 'objet', '#f3e7cb', function(c){ return Pa('M-16,-16 L16,-16 L16,16 L-16,16 Z', c) + El(-16, 0, 4, 17, clair(c, 0.2), 2) + El(16, 0, 4, 17, mel(c, '#c9a874', 0.4), 2) + Tr('M-9,-8 H9 M-9,-2 H9 M-9,4 H6 M-9,10 H3', '#8a6a4a', 1.6) + Ci(8, 10, 4, '#e5484d', 1.4); });
S('loupe', 'objet', '#3fd0c8', function(c){ return Tr('M8,8 L22,22', K, 8) + Tr('M8,8 L22,22', '#a8743f', 4.4) + Ci(-4, -4, 15, clair(c, 0.55), 2.6) + Ci(-4, -4, 15, 'none', 0, ' stroke="' + c + '" stroke-width="3"') + Br('M-12,-8 C-12,-12 -9,-14 -6,-15', 2.2, 0.8); });
S('chapeau', 'objet', '#6b3f8a', function(c){ return El(0, 16, 24, 6, fonce(c, 0.2)) + Pa('M-14,16 L-4,-12 C-2,-18 4,-24 14,-22 C8,-20 6,-14 6,-8 L14,16 Z', c) + Re(-13, 8, 26, 6, 2, '#f6d23a', 1.8) + etincelle(0, -2, 4, '#f6d23a'); });
S('balai', 'objet', '#a8743f', function(c){ return '<g transform="rotate(30)">' + Tr('M0,-26 V6', K, 6) + Tr('M0,-26 V6', c, 3) + Pa('M-4,4 L4,4 L12,24 L-12,24 Z', '#e8c25a') + Tr('M-6,12 L-8,24 M0,10 V24 M6,12 L8,24', '#b8862e', 1.4) + Re(-5, 2, 10, 5, 1.5, '#e5484d', 1.6) + '</g>'; });
S('boule', 'pierre', '#9d6ee3', function(c){ return Pa('M-14,22 L-10,12 L10,12 L14,22 Z', '#a8743f') + Ci(0, -4, 17, clair(c, 0.3)) + Ci(0, -4, 17, 'none', 0, ' fill="' + c + '" opacity=".35"') + etincelle(-4, -8, 6, '#ffffff') + Br('M-10,-12 C-10,-16 -7,-18 -4,-19', 2.2, 0.7); });
S('fer', 'objet', '#8a8aa0', function(c){ return Tr('M-14,18 L-16,4 C-18,-14 -8,-22 0,-22 C8,-22 18,-14 16,4 L14,18', K, 11) + Tr('M-14,18 L-16,4 C-18,-14 -8,-22 0,-22 C8,-22 18,-14 16,4 L14,18', c, 7) + Ci(-14, 2, 1.4, K, 0) + Ci(-10, -12, 1.4, K, 0) + Ci(14, 2, 1.4, K, 0) + Ci(10, -12, 1.4, K, 0); });
S('citrouille', 'plante', '#f08a3c', function(c){ return El(-9, 4, 11, 16, c) + El(9, 4, 11, 16, c) + El(0, 4, 9, 17, clair(c, 0.12)) + Re(-2.5, -18, 5, 8, 1.5, '#5e7a2a', 1.8) + Tr('M2,-16 C8,-22 12,-16 8,-14', '#4f9a5c', 1.6); });
S('oeuf', 'bete', '#f3e7cb', function(c){ return Pa('M0,-22 C10,-22 17,-4 17,6 C17,16 9,22 0,22 C-9,22 -17,16 -17,6 C-17,-4 -10,-22 0,-22 Z', c) + Ci(-5, -6, 3, '#4fbf6a', 1.2) + Ci(6, 4, 3.6, '#3f7fe0', 1.2) + Ci(-6, 12, 2.4, '#e5484d', 1.2) + Br('M-9,-6 C-10,-2 -10,2 -9,6', 1.8, 0.6); });
S('coquillage', 'bete', '#ef7fa8', function(c){ return Pa('M-22,4 C-22,-14 22,-14 22,4 L4,18 L-4,18 Z', c) + Tr('M0,18 L0,-10 M0,18 L-12,-8 M0,18 L12,-8 M0,18 L-19,-2 M0,18 L19,-2', fonce(c, 0.3), 1.6) + Re(-6, 16, 12, 6, 2, fonce(c, 0.15), 1.8); });
S('spirale', 'ciel', '#9d6ee3', function(c){ var d = 'M0,0 C0,-4 5,-4 5,0 C5,6 -6,7 -7,0 C-8,-9 6,-12 10,-4 C15,6 4,16 -6,14 C-16,12 -20,0 -16,-9 C-12,-18 0,-22 10,-18'; return Tr(d, K, 7.5) + Tr(d, c, 4); });
S('engrenage', 'objet', '#d6a24a', function(c){ return Pa(engrenagePath(8, 23, 17), c) + Ci(0, 0, 7, '#3a3352', 2) + Ci(0, 0, 11, 'none', 1.4); });
S('bourse', 'objet', '#a8743f', function(c){ return Pa('M-16,20 C-24,6 -16,-6 -6,-10 L-8,-16 L8,-16 L6,-10 C16,-6 24,6 16,20 Z', c) + Tr('M-8,-11 C-3,-8 3,-8 8,-11', '#f6d23a', 2.2) + Ci(10, 14, 6, '#f6d23a', 1.8) + Tr('M8,12 h4', '#b8862e', 1.2) + Br('M-12,4 C-13,9 -12,13 -10,16', 2, 0.4); });
var DISTINCTS = ['fiole', 'chaudron', 'sablier', 'feuille', 'champignon', 'fleur', 'baies', 'pomme', 'cristal', 'lune', 'etoile', 'soleil', 'eclair', 'flamme', 'goutte', 'flocon',
  'corbeau', 'chat', 'hibou', 'grenouille', 'araignee', 'escargot', 'papillon', 'poisson', 'cle', 'oeil', 'livre', 'plume', 'couronne', 'coeur', 'citrouille'];
var SYM_ID = {}; SYM.forEach(function(s, i){ SYM_ID[s.id] = i; });

/* Plan projectif d'ordre q (q premier) : q²+q+1 cartes de q+1 symboles, deux cartes ont toujours exactement un symbole commun. */
function planProjectif(q){
  var cartes = [], m, b, x, c;
  for(m = 0; m < q; m++) for(b = 0; b < q; b++){
    c = [];
    for(x = 0; x < q; x++) c.push(x * q + ((m * x + b) % q));
    c.push(q * q + m); cartes.push(c);
  }
  for(x = 0; x < q; x++){ c = []; for(var y = 0; y < q; y++) c.push(x * q + y); c.push(q * q + q); cartes.push(c); }
  c = []; for(m = 0; m < q; m++) c.push(q * q + m); c.push(q * q + q); cartes.push(c);
  return cartes;
}
function communs(a, b){ return a.filter(function(x){ return b.indexOf(x) >= 0; }); }
/* Paquet de cartes d'une partie : chaque point du plan reçoit un symbole. */
function paquet(q, ressemblance){
  var nb = q * q + q + 1, ids;
  if(nb === SYM.length) ids = SYM.map(function(s){ return s.id; });
  else if(ressemblance === 'distincts') ids = DISTINCTS.slice(0, nb);
  else ids = U.melanger(SYM.map(function(s){ return s.id; })).slice(0, nb);
  ids = U.melanger(ids);
  return U.melanger(planProjectif(q).map(function(c){ return U.melanger(c.map(function(pt){ return ids[pt]; })); }));
}
/* Place les symboles d'une carte (rayon 100) sans qu'ils se chevauchent. */
function disposerCarte(nb, varTaille, rot, zone){
  var base = (nb <= 6 ? 30 : 25) * Math.min(1.12, zone || 1), pts = [], a0 = Math.random() * Math.PI * 2, R = 94;
  pts.push({x:U.rand(-6, 6), y:U.rand(-6, 6)});
  for(var i = 1; i < nb; i++){ var a = a0 + i * 2 * Math.PI / (nb - 1) + U.rand(-0.15, 0.15); pts.push({x:Math.cos(a) * 60, y:Math.sin(a) * 60}); }
  pts.forEach(function(p){ p.r = base * U.rand(1 - varTaille, 1 + varTaille * 0.55); p.rot = rot >= 180 ? U.rand(0, 360) : U.rand(-rot, rot); });
  for(var essai = 0; essai < 6; essai++){
    for(var it = 0; it < 120; it++){
      for(var a1 = 0; a1 < nb; a1++){
        var p = pts[a1];
        for(var b1 = a1 + 1; b1 < nb; b1++){
          var o = pts[b1], dx = o.x - p.x, dy = o.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, mini = p.r + o.r + 3;
          if(d < mini){ var k = (mini - d) / 2 / d; p.x -= dx * k; p.y -= dy * k; o.x += dx * k; o.y += dy * k; }
        }
        var dc = Math.sqrt(p.x * p.x + p.y * p.y), lim = R - p.r;
        if(dc > lim){ p.x *= lim / dc; p.y *= lim / dc; }
      }
    }
    var ok = true;
    for(a1 = 0; a1 < nb && ok; a1++) for(b1 = a1 + 1; b1 < nb; b1++){ var q1 = pts[a1], q2 = pts[b1]; if(Math.hypot(q1.x - q2.x, q1.y - q2.y) < q1.r + q2.r - 1){ ok = false; break; } }
    if(ok) break;
    pts.forEach(function(p){ p.r *= 0.94; });
  }
  return pts;
}
function couleurSym(s, mode){ return mode === 'familles' ? FAMILLES[s.f] : s.c; }
function carteSVG(ids, pts, mode, cls){
  var s = '<g class="mjo-carte ' + (cls || '') + '">' + Ci(3, 6, 100, '#0a0612', 0, ' opacity=".35"') + Ci(0, 0, 100, cls === 'pile' ? '#fbf1d8' : '#f4f0ff', 4) +
    Ci(0, 0, 92, 'none', 0, ' stroke="' + (cls === 'pile' ? '#e0b860' : '#b8a0f0') + '" stroke-width="3"') + Ci(0, 0, 96.5, 'none', 0, ' stroke="#ffffff" stroke-width="1.6" opacity=".7"');
  ids.forEach(function(id, k){
    var sy = SYM[SYM_ID[id]], p = pts[k];
    s += '<g class="mjo-sym" data-k="' + k + '" data-id="' + id + '" transform="translate(' + f1(p.x) + ',' + f1(p.y) + ')"><circle class="mjo-sym-halo" r="' + f1(p.r + 4) + '"/>' +
      '<g transform="rotate(' + f1(p.rot) + ') scale(' + e2(p.r / 25) + ')">' + sy.art(couleurSym(sy, mode)) + '</g></g>';
  });
  return s + '</g>';
}
function reglagesDouble(n, mods){
  mods = mods || {};
  var p = {};
  p.q = n <= 4 ? 5 : 7;
  p.symboles = p.q + 1;
  p.manches = entier(n, {1:6, 3:8, 6:10, 10:12});
  p.duree = Math.round(courbe(n, {1:100, 3:95, 6:90, 10:75, 12:68}) / (mods.lent || 1) + (mods.temps || 0));
  p.penalite = Math.round(courbe(n, {1:2, 6:3, 10:4}) * 2) / 2;
  /* la règle des cœurs (Romain, 4 nov.) : une erreur coûte un cœur (et plus de temps) ; sans cœur, la prochaine fait perdre.
     (avant : une erreur coûtait 2 à 4 s, les boucliers de mods.erreurs étaient des erreurs gratuites → ce sont des cœurs en plus) */
  p.boucliers = 0;
  p.coeurs = entier(n, {1:5, 3:4, 6:3, 10:2}) + Math.max(0, Math.round(mods.erreurs || 0));
  p.rotation = courbe(n, {1:20, 3:70, 5:180});
  p.tailles = courbe(n, {1:0.06, 3:0.16, 6:0.28, 10:0.4});
  p.ressemblance = n <= 3 ? 'distincts' : (n <= 6 ? 'meles' : 'familles');
  p.zone = mods.zone || 1;
  p.indices = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  p.lignes = [
    {nom:'Symboles sur chaque carte', val:String(p.symboles)},
    {nom:'Paires à trouver', val:p.manches + ' paires'},
    {nom:'Le sablier', val:txtDuree(p.duree)},
    {nom:'Une erreur', val:'tu perds un cœur'},
    {nom:'Cœurs (erreurs permises)', val:p.coeurs + ' ❤️'},
    {nom:'Les symboles', val:p.ressemblance === 'distincts' ? 'tous très différents' : (p.ressemblance === 'meles' ? 'certains se ressemblent' : 'mêmes couleurs par famille 🎨')},
    {nom:'Ils sont tournés', val:p.rotation < 40 ? 'un tout petit peu' : (p.rotation < 180 ? 'un peu' : 'dans tous les sens 🔄')},
    {nom:'Leurs tailles', val:p.tailles < 0.12 ? 'presque pareilles' : (p.tailles < 0.3 ? 'un peu variées' : 'très variées')}
  ];
  if(p.boucliers) p.lignes.push({nom:'Boucliers 🛡️', val:p.boucliers + ' erreur' + (p.boucliers > 1 ? 's' : '') + ' sans perdre de temps'});
  if(p.zone > 1) p.lignes.push({nom:'Symboles', val:'plus gros'});
  if(p.indices) p.lignes.push({nom:'Indices 💡', val:String(p.indices)});
  if(p.revele) p.lignes.push({nom:'Le bon symbole brille', val:'après 3 secondes ✨'});
  return p;
}

MJ.enregistrer('double', {
  nom:'Le double', role:'alchimiste', ic:'🃏',
  consigne:'Un seul symbole est sur les DEUX cartes. Trouve-le vite et touche-le !',
  minuteur:true,
  reglages: reglagesDouble,
  plan: planProjectif,
  symboles: SYM,
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#5a3a22" opacity=".6"/>');
    var A = ['lune', 'pomme', 'cle', 'flamme'], B = ['etoile', 'cle', 'feuille', 'goutte'];
    var pa = [{x:0, y:0, r:24, rot:0}, {x:-34, y:-30, r:20, rot:-20}, {x:36, y:28, r:22, rot:30}, {x:30, y:-34, r:18, rot:10}];
    var pb = [{x:-32, y:-30, r:20, rot:15}, {x:8, y:30, r:24, rot:-40}, {x:34, y:-26, r:20, rot:0}, {x:-34, y:30, r:18, rot:20}];
    d.contenu.innerHTML = '<g transform="translate(78,86) scale(.72)">' + carteSVG(A, pa, 'propres', 'pile') + '</g><g transform="translate(222,86) scale(.72)">' + carteSVG(B, pb, 'propres', 'joueur') + '</g>';
    var syms = d.contenu.querySelectorAll('.mjo-sym[data-id="cle"]');
    return scenario(d.svg, [
      [10, function(){ syms.forEach(function(s){ s.classList.remove('trouve'); }); d.vers(262, 160, 0); }],
      [500, function(){ d.vers(228, 112, 800); }],
      [900, function(){ d.tape(); syms.forEach(function(s){ s.classList.add('trouve'); }); U.son('ok'); }],
      [1300, function(){}]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var q = p.q || 5, mode = p.ressemblance === 'familles' ? 'familles' : 'propres';
    var cartes = paquet(q, p.ressemblance), idx = 2;
    var racine = U.html('<div class="mjo-jeu mjo-double"><div class="mjo-table" aria-hidden="true"><i class="mjo-bougie-t"></i></div></div>');
    el.appendChild(racine);
    var hud = creerHud(racine);
    var manches = Math.min(p.manches || 8, cartes.length - 1), trouvees = 0, erreurs = 0, restant = p.duree || 90, fini = false, verrou = true, tPaire = 0, indices = p.indices || 0;
    var coeursD = p.coeurs === undefined ? 4 : p.coeurs, coeursDMax = coeursD;
    hud.coeurs(coeursD, coeursDMax);
    hud.prog(0, manches); hud.temps(1);
    var aire = U.html('<div class="mjo-db-aire"><svg class="mjo-db-svg" preserveAspectRatio="xMidYMid meet"><g class="mjo-db-cartes"></g><g class="mjo-db-fx"></g></svg></div>');
    racine.appendChild(aire);
    var bas = null;
    if(indices){ bas = U.html('<div class="mjo-bas"><button class="btn magie mjo-indice" type="button">💡 × ' + indices + '</button></div>'); racine.appendChild(bas); }
    var svg = aire.querySelector('svg'), calque = svg.querySelector('.mjo-db-cartes'), fx = svg.querySelector('.mjo-db-fx');
    var vertical = true, POS = {pile:{x:0, y:-108}, joueur:{x:0, y:108}};
    function disposer(){
      var r = aire.getBoundingClientRect(); if(!r.width || !r.height) return;
      vertical = r.height >= r.width * 0.9;
      POS = vertical ? {pile:{x:0, y:-108}, joueur:{x:0, y:108}} : {pile:{x:-112, y:0}, joueur:{x:112, y:0}};
      svg.setAttribute('viewBox', vertical ? '-112 -222 224 444' : '-226 -106 452 212');
      [A, B].forEach(function(c){ if(c) c.g.setAttribute('transform', 'translate(' + POS[c.role].x + ',' + POS[c.role].y + ')'); });
    }
    var A = null, B = null;
    function creer(ids, role){
      var pts = disposerCarte(ids.length, p.tailles || 0.1, p.rotation || 30, p.zone || 1);
      var g = svgNoeud('g', {transform:'translate(' + POS[role].x + ',' + POS[role].y + ')'}, calque);
      g.innerHTML = carteSVG(ids, pts, mode, role);
      return {ids:ids, pts:pts, g:g, role:role, inner:g.firstChild};
    }
    disposer();
    A = creer(cartes[0], 'pile'); B = creer(cartes[1], 'joueur');
    relancer(B.inner, 'arrive');
    P.apres(380, function(){ verrou = false; });
    P.observe(aire, disposer);
    function commun(){ return communs(A.ids, B.ids)[0]; }
    function symboleSous(pt){
      var best = null, bd = 1e9;
      [A, B].forEach(function(c){
        var lx = pt.x - POS[c.role].x, ly = pt.y - POS[c.role].y;
        if(lx * lx + ly * ly > 104 * 104) return;
        c.pts.forEach(function(q2, k){ var d = Math.hypot(lx - q2.x, ly - q2.y); if(d <= q2.r * (p.zone || 1) + 6 && d - q2.r < bd){ bd = d - q2.r; best = {carte:c, k:k, id:c.ids[k]}; } });
      });
      return best;
    }
    function nSym(c, id){ return c.g.querySelector('.mjo-sym[data-id="' + id + '"]'); }
    function briller(cls, on){ var id = commun(); [A, B].forEach(function(c){ var s = nSym(c, id); if(s) s.classList.toggle(cls, on !== false); }); }
    function suivante(){
      verrou = true;
      var id = commun();
      briller('trouve');
      var sa = nSym(A, id), sb = nSym(B, id);
      if(sa && sb){
        var ka = A.pts[A.ids.indexOf(id)], kb = B.pts[B.ids.indexOf(id)];
        var l = svgNoeud('path', {'class':'mjo-lien', d:'M' + f1(POS.pile.x + ka.x) + ',' + f1(POS.pile.y + ka.y) + ' L' + f1(POS.joueur.x + kb.x) + ',' + f1(POS.joueur.y + kb.y), pathLength:'100'}, fx);
        P.apres(700, function(){ retirer(l); });
      }
      if(trouvees >= manches){
        fini = true;
        annonce(racine, 'Bravo !', 1300);
        P.finir({reussi:true, score:1, erreurs:erreurs, detail:manches + ' paires trouvées' + (erreurs ? ' (' + erreurs + ' erreur' + (erreurs > 1 ? 's' : '') + ').' : ', sans une erreur !')}, 1100);
        return;
      }
      P.apres(520, function(){
        var vieux = A;
        B.inner.style.transition = 'transform .38s cubic-bezier(.4,.1,.3,1)';
        B.inner.style.transform = 'translate(' + (POS.pile.x - POS.joueur.x) + 'px,' + (POS.pile.y - POS.joueur.y) + 'px)';
        vieux.inner.classList.add('part');
        P.apres(400, function(){
          retirer(vieux.g);
          A = B; A.role = 'pile'; A.inner.style.transition = 'none'; A.inner.style.transform = '';
          A.g.setAttribute('transform', 'translate(' + POS.pile.x + ',' + POS.pile.y + ')');
          A.inner.classList.remove('joueur'); A.inner.classList.add('pile');
          var fond = A.inner.querySelectorAll('circle'); if(fond[1]) fond[1].setAttribute('fill', '#fbf1d8'); if(fond[2]) fond[2].setAttribute('stroke', '#e0b860');
          A.g.querySelectorAll('.mjo-sym').forEach(function(s){ s.classList.remove('trouve', 'revele', 'indice'); });
          B = creer(cartes[idx++], 'joueur');
          relancer(B.inner, 'arrive');
          tPaire = 0;
          P.apres(330, function(){ verrou = false; });
        });
      });
    }
    function toucher(pt){
      if(fini || verrou) return;
      var s = symboleSous(pt);
      if(!s) return;
      if(s.id === commun()){
        trouvees++; P.sons.ding(); U.vibrer(15);
        hud.prog(trouvees, manches);
        suivante();
        return;
      }
      erreurs++;
      verrou = true;
      var n2 = nSym(s.carte, s.id); if(n2) relancer(n2, 'faux');
      relancer(s.carte.inner, 'tremble');
      U.son('ko'); U.vibrer(40);
      var q2 = s.carte.pts[s.k], e = versEcran(svg, POS[s.carte.role].x + q2.x, POS[s.carte.role].y + q2.y), r = racine.getBoundingClientRect();
      if(coeursD <= 0){
        fini = true;
        P.finir({reussi:false, score:trouvees / manches, erreurs:erreurs, detail:'Plus de cœur : c\'était l\'erreur de trop… ' + trouvees + ' paire' + (trouvees > 1 ? 's' : '') + ' sur ' + manches + '.'}, 1200);
        return;
      }
      coeursD--; hud.perdCoeur(coeursD, coeursDMax);
      flotter(racine, (e.x - r.left) / r.width * 100, (e.y - r.top) / r.height * 100, '💔', 'ko');
      P.apres(600, function(){ if(!fini) verrou = false; });
    }
    P.ecoute(svg, 'pointerdown', function(e){ if(fini) return; e.preventDefault(); toucher(ptSVG(svg, e)); });
    var bi = bas && bas.querySelector('.mjo-indice');
    if(bi) P.ecoute(bi, 'click', function(){ if(fini || verrou || indices <= 0) return; indices--; bi.textContent = '💡 × ' + indices; if(!indices) bi.disabled = true; P.sons.pop(); briller('indice'); });
    racine.mjoEtat = function(){
      var id = commun();
      function pos(c){ return c.ids.map(function(x, k){ var q2 = c.pts[k], e = versEcran(svg, POS[c.role].x + q2.x, POS[c.role].y + q2.y); return {id:x, x:e.x, y:e.y}; }); }
      return {jeu:'double', q:q, pile:A.ids.slice(), carte:B.ids.slice(), commun:id, nbCommuns:communs(A.ids, B.ids).length, verrou:verrou, trouvees:trouvees, manches:manches, restant:restant, erreurs:erreurs, posPile:pos(A), posCarte:pos(B)};
    };
    P.boucle(function(dt){
      if(fini) return false;
      if(!verrou){ restant -= dt; tPaire += dt; if(p.revele && tPaire > 3) briller('revele'); }
      hud.temps(restant / (p.duree || 90));
      if(restant <= 0){
        fini = true; briller('revele');
        P.finir({reussi:false, score:trouvees / manches, erreurs:erreurs, detail:'Le sablier est vide… ' + trouvees + ' paire' + (trouvees > 1 ? 's' : '') + ' sur ' + manches + '.'}, 1500);
        return false;
      }
    });
    return {arreter: P.arreter};
  }
});


/* ==========================================================
   LE GRAND MÉNAGE DU LABO (Alchimiste)
   Des insectes se promènent dans le labo. Les MAUVAIS (bocal rouge ☠)
   s'écrasent d'une touche : grosse tache de jus, « splotch » bien juteux.
   Les GENTILS (bocal vert ✔) ne s'écrasent pas : les toucher coûte un
   cœur (« oh non »). On peut les glisser dans leur bocal (bonus ; obligatoire
   dès le niveau 7). On les reconnaît à leur FORME : certains ont marché
   dans les ingrédients et sont teintés rouge, vert, bleu ou jaune.
   params.ensuite = 'differences' : une fois le labo propre, on enchaîne sur
   les 7 différences de l'étagère du labo, dans le même mini-jeu ; fin n'est
   appelée qu'une fois, à la toute fin.
   Mods : zone (insectes plus faciles à toucher), temps (+N s), lent (insectes
   plus lents, ex. 0.85), erreurs (+N cœurs), aide (N indices 💡 : un mauvais
   insecte est montré), revele (les mauvais ont un petit rond rouge), facile (cœur).
   ========================================================== */
function jambes(xb, ys, l, ep){
  var dirs = [[-0.75, -0.66], [-1, 0.05], [-0.8, 0.62]], A = '', B = '';
  for(var i = 0; i < 3; i++){
    var y = ys[i], dx = dirs[i][0], dy = dirs[i][1];
    var kx = -xb + dx * l * 0.55, ky = y + dy * l * 0.55 - 3, ex = -xb + dx * l, ey = y + dy * l + (i === 0 ? -2 : 4);
    var g = 'M' + f1(-xb) + ',' + f1(y) + ' L' + f1(kx) + ',' + f1(ky) + ' L' + f1(ex) + ',' + f1(ey) + ' ';
    var d = 'M' + f1(xb) + ',' + f1(y) + ' L' + f1(-kx) + ',' + f1(ky) + ' L' + f1(-ex) + ',' + f1(ey) + ' ';
    if(i === 1){ A += d; B += g; } else { A += g; B += d; }
  }
  return '<g class="mjo-pa">' + Tr(A, K, ep || 2.4) + '</g><g class="mjo-pb">' + Tr(B, K, ep || 2.4) + '</g>';
}
var NOIR = '#2a1a20';
var ESPECES = {
  cafard:{bon:false, nom:'cafard', c:'#8a4b2a', goo:'#c9e05a', art:function(c){
    return jambes(7, [-6, 3, 11], 20, 2.2) + Tr('M-3,-20 C-10,-34 -20,-38 -30,-46 M3,-20 C10,-34 20,-38 30,-46', K, 1.7) + Tr('M-3,21 l-4,7 M3,21 l4,7', K, 1.6) +
      El(0, 4, 11, 19, c) + Pa('M-10,-8 C-10,-19 10,-19 10,-8 C6,-5 -6,-5 -10,-8 Z', clair(c, 0.3), 1.8) + Tr('M0,-5 V22', fonce(c, 0.45), 1.4) +
      El(0, -19, 5, 3.5, fonce(c, 0.35), 1.6) + Br('M-6,0 C-7,6 -6,12 -4,16', 1.8, 0.4);
  }},
  chenille:{bon:false, nom:'chenille', c:'#6dbb4a', goo:'#b6f05a', art:function(c){
    var ys = [23, 16, 8, 0, -8, -16], A = '', B = '', s = '';
    ys.forEach(function(y, k){ var x = Math.sin(k * 0.9) * 2, st = 'M' + f1(x - 6) + ',' + y + ' l-4,1 M' + f1(x + 6) + ',' + y + ' l4,1 '; if(k % 2) A += st; else B += st; });
    s += '<g class="mjo-pa">' + Tr(A, K, 2.6) + '</g><g class="mjo-pb">' + Tr(B, K, 2.6) + '</g>';
    ys.forEach(function(y, k){ var x = Math.sin(k * 0.9) * 2; s += Ci(x, y, k === 0 ? 5.5 : 7, k % 2 ? c : clair(c, 0.14), 2) + Ci(x - 2.6, y - 1, 1.3, fonce(c, 0.45), 0) + Ci(x + 2.6, y - 1, 1.3, fonce(c, 0.45), 0); });
    return s + Ci(0, -23, 6.5, fonce(c, 0.25), 2) + Ci(-2.4, -25, 1.4, '#ffffff', 0) + Ci(2.4, -25, 1.4, '#ffffff', 0) + Tr('M-3,-29 l-2,-5 M3,-29 l2,-5', K, 1.6);
  }},
  charancon:{bon:false, nom:'charançon', c:'#7a6a5a', goo:'#e0c45a', art:function(c){
    return jambes(8, [-6, 4, 12], 15, 2.4) + Tr('M-2,-25 L-9,-29 L-11,-37 M2,-25 L9,-29 L11,-37', K, 1.5) + Ci(-11, -38, 2, K, 0) + Ci(11, -38, 2, K, 0) +
      Pa('M-2.5,-12 L-2,-31 C-2,-33 2,-33 2,-31 L2.5,-12 Z', fonce(c, 0.2), 1.8) + El(0, -10, 7, 6, c, 2) +
      Pa('M0,23 C-13,23 -15,8 -11,-2 C-8,-7 8,-7 11,-2 C15,8 13,23 0,23 Z', c) + Tr('M0,-4 V22', fonce(c, 0.4), 1.4) +
      Ci(-6, 4, 1.5, clair(c, 0.5), 0) + Ci(5, 9, 1.5, clair(c, 0.5), 0) + Ci(-4, 14, 1.5, clair(c, 0.5), 0) + Ci(6, 16, 1.3, clair(c, 0.5), 0) + Br('M-8,2 C-9,8 -8,13 -6,17', 1.6, 0.4);
  }},
  mite:{bon:false, nom:'mite des grimoires', c:'#c8b890', goo:'#efe6b0', art:function(c){
    return jambes(5, [-10, -7, -3], 10, 2) +
      Pa('M0,-14 L-18,19 C-11,23 -3,21 0,17 C3,21 11,23 18,19 Z', c) + Tr('M-5,-2 L-12,14 M5,-2 L12,14 M0,-6 V16', fonce(c, 0.28), 1.3) + Ci(-8, 8, 2.2, fonce(c, 0.35), 0) + Ci(8, 8, 2.2, fonce(c, 0.35), 0) +
      El(0, -13, 5, 6, fonce(c, 0.12), 1.8) + Ci(0, -19, 4, fonce(c, 0.2), 1.8) +
      Tr('M-2,-22 C-6,-28 -10,-30 -15,-30 M2,-22 C6,-28 10,-30 15,-30', K, 1.6) + Tr('M-6,-27 l-1,-3.5 M-9,-29 l-1,-3.5 M-12,-30 l0,-3.5 M6,-27 l1,-3.5 M9,-29 l1,-3.5 M12,-30 l0,-3.5', K, 1.2);
  }},
  doryphore:{bon:false, nom:'doryphore', c:'#f2d36b', goo:'#f0a040', art:function(c){
    return jambes(10, [-6, 3, 11], 14, 2.4) + Tr('M-3,-19 C-6,-25 -8,-27 -10,-30 M3,-19 C6,-25 8,-27 10,-30', K, 1.5) +
      El(0, 5, 13.5, 17, c) + Tr('M0,-11 V22', K, 1.6) +
      Tr('M-10,-4 C-11,4 -10,12 -7,18 M-5,-9 C-5,3 -5,12 -3,20 M10,-4 C11,4 10,12 7,18 M5,-9 C5,3 5,12 3,20', NOIR, 2.6) +
      El(0, -12, 9, 5, mel(c, '#f08a3c', 0.55), 2) + Ci(-3, -12, 1.3, NOIR, 0) + Ci(3, -12, 1.3, NOIR, 0) + Ci(0, -14, 1.1, NOIR, 0) +
      El(0, -18, 4.5, 3, fonce(c, 0.4), 1.6) + Br('M-11,0 C-12,-4 -10,-7 -8,-9', 1.6, 0.5);
  }},
  punaise:{bon:false, nom:'punaise', c:'#6a8a3a', goo:'#a8d84a', art:function(c){
    return jambes(9, [-6, 2, 9], 15, 2.3) + Tr('M-2,-20 L-8,-27 L-10,-36 M2,-20 L8,-27 L10,-36', K, 1.5) +
      Pa('M-15,-9 L15,-9 L13,6 L0,23 L-13,6 Z', c) + Pa('M-15,-9 C-13,-16 13,-16 15,-9 Z', clair(c, 0.18), 2) + Pa('M-7,-8 L7,-8 L0,11 Z', fonce(c, 0.2), 1.4) +
      Pa('M-6,14 L0,23 L6,14 Z', fonce(c, 0.35), 1.2) + Pa('M-4,-14 L4,-14 L3,-20 L-3,-20 Z', fonce(c, 0.3), 1.6) + Br('M-12,-6 L-10,4', 1.6, 0.45);
  }},
  coccinelle:{bon:true, nom:'coccinelle', c:'#e5484d', art:function(c){
    return jambes(10, [-4, 4, 11], 11, 2.4) + Tr('M-3,-15 l-4,-6 M3,-15 l4,-6', K, 1.5) +
      Ci(0, 3, 15.5, c) + Tr('M0,-12 V18', K, 1.6) + Ci(-7, -2, 3.4, NOIR, 0) + Ci(7, -2, 3.4, NOIR, 0) + Ci(-8, 9, 3, NOIR, 0) + Ci(8, 9, 3, NOIR, 0) + Ci(-3.5, 14, 2.2, NOIR, 0) + Ci(3.5, 14, 2.2, NOIR, 0) +
      Pa('M-9,-10 C-9,-18 9,-18 9,-10 C5,-8 -5,-8 -9,-10 Z', NOIR, 2) + Ci(-4, -13, 1.8, '#ffffff', 0) + Ci(4, -13, 1.8, '#ffffff', 0) + Br('M-11,-2 C-11,-6 -9,-9 -6,-10', 2, 0.6);
  }},
  abeille:{bon:true, nom:'abeille', c:'#f6c23a', art:function(c){
    return jambes(5, [-8, -3, 2], 10, 2) +
      El(0, 8, 9.5, 14, c) + Tr('M-9,4 H9 M-9.5,10 H9.5 M-7.5,16 H7.5', NOIR, 3) + El(0, 8, 9.5, 14, 'none') + Pa('M-2,21 L0,27 L2,21 Z', NOIR, 1.2) +
      Ci(0, -8, 7.5, mel(c, NOIR, 0.3), 2) + Ci(0, -17, 5.5, NOIR, 1.8) + Ci(-2, -18, 1.2, '#ffffff', 0) + Ci(2, -18, 1.2, '#ffffff', 0) +
      Tr('M-2,-21 C-4,-26 -7,-27 -9,-27 M2,-21 C4,-26 7,-27 9,-27', K, 1.4) +
      El(-11, -5, 10, 5.5, 'rgba(225,245,255,.62)', 1.6, ' transform="rotate(-25 -11 -5)"') + El(11, -5, 10, 5.5, 'rgba(225,245,255,.62)', 1.6, ' transform="rotate(25 11 -5)"');
  }},
  luciole:{bon:true, nom:'luciole', c:'#5a4a3a', art:function(c){
    return Halo(0, 15, 16, 14, '#d8ff6a', 0.55) + jambes(6, [-6, 0, 6], 12, 2) + Tr('M-2,-18 C-6,-26 -9,-28 -12,-30 M2,-18 C6,-26 9,-28 12,-30', K, 1.4) +
      Ci(0, 16, 6.5, '#e8ff9a', 2) + El(0, 1, 7.5, 15, c) + Tr('M0,-10 V14', fonce(c, 0.4), 1.4) + Tr('M-6,0 C-6,8 -5,12 -3,14 M6,0 C6,8 5,12 3,14', clair(c, 0.35), 1.4) +
      El(0, -12, 7, 4.5, '#f08a3c', 1.8) + Ci(0, -12, 1.8, NOIR, 0) + Ci(0, -17, 3.5, fonce(c, 0.3), 1.6);
  }},
  chrysope:{bon:true, nom:'chrysope', c:'#7ed06a', art:function(c){
    var aile = 'rgba(225,255,230,.42)';
    return jambes(4, [-8, -4, 0], 11, 1.8) + Tr('M-1,-17 C-6,-30 -10,-38 -14,-46 M1,-17 C6,-30 10,-38 14,-46', K, 1.1) +
      El(0, 4, 3.8, 17, c, 1.8) + Ci(0, -14, 4.2, c, 1.6) + Ci(-3, -15, 1.9, '#f6d23a', 0.8) + Ci(3, -15, 1.9, '#f6d23a', 0.8) +
      Pa('M-1,-8 C-15,-4 -19,12 -11,26 C-6,26 -2,14 -1,-4 Z', aile, 1.6) + Pa('M1,-8 C15,-4 19,12 11,26 C6,26 2,14 1,-4 Z', aile, 1.6) +
      Tr('M-3,-4 C-10,2 -13,12 -11,22 M-5,4 L-14,8 M-6,12 L-14,16 M-4,18 L-11,22 M3,-4 C10,2 13,12 11,22 M5,4 L14,8 M6,12 L14,16 M4,18 L11,22', '#2a5a3a', 0.9, 0.7);
  }}
};
var LOTS = {
  1:{mauvais:['cafard', 'chenille'], bons:['coccinelle', 'abeille']},
  2:{mauvais:['cafard', 'chenille', 'charancon'], bons:['coccinelle', 'abeille', 'luciole']},
  3:{mauvais:['doryphore', 'charancon', 'mite', 'cafard'], bons:['coccinelle', 'chrysope', 'abeille', 'luciole']},
  4:{mauvais:['doryphore', 'punaise', 'mite', 'charancon'], bons:['coccinelle', 'chrysope', 'luciole', 'abeille']}
};
var TEINTES = ['#e5484d', '#4fbf6a', '#3f7fe0', '#f6d23a'];
function insecteSVG(esp, c){ return '<g class="mjo-ins-c">' + El(2, 5, 13, 19, '#0a0612', 0, ' opacity=".22"') + ESPECES[esp].art(c || ESPECES[esp].c) + '</g>'; }
function blob(n, R, var1){
  var pts = [], i, d;
  for(i = 0; i < n; i++){ var a = i / n * Math.PI * 2 + U.rand(-0.12, 0.12), r = R * U.rand(1 - var1, 1 + var1 * 0.4) * (i % 2 ? 1.16 : 0.84); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  function mid(a, b){ return f1((a[0] + b[0]) / 2) + ',' + f1((a[1] + b[1]) / 2); }
  d = 'M' + mid(pts[n - 1], pts[0]);
  for(i = 0; i < n; i++) d += ' Q' + f1(pts[i][0]) + ',' + f1(pts[i][1]) + ' ' + mid(pts[i], pts[(i + 1) % n]);
  return d + ' Z';
}
function splatSVG(c){
  var d = blob(14, 27, 0.3), s = '<g class="mjo-splat-c">', i;
  for(i = 0; i < 4; i++){ var a = U.rand(0, Math.PI * 2), r = U.rand(26, 36); s += Pa('M' + f1(Math.cos(a) * 18) + ',' + f1(Math.sin(a) * 18) + ' L' + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r), 'none', 0) + Ci(Math.cos(a) * r, Math.sin(a) * r, U.rand(4.5, 7.5), c, 2.2) + Tr('M' + f1(Math.cos(a) * 16) + ',' + f1(Math.sin(a) * 16) + ' L' + f1(Math.cos(a) * (r - 3)) + ',' + f1(Math.sin(a) * (r - 3)), c, 6); }
  s += Pa(d, c, 2.8) + '<path d="' + d + '" fill="' + fonce(c, 0.32) + '" opacity=".3" transform="translate(3,4) scale(.74)"/>' + '<path d="' + blob(9, 12, 0.25) + '" fill="' + clair(c, 0.35) + '" opacity=".55" transform="translate(-4,-5)"/>';
  for(i = 0; i < 6; i++){ var b = U.rand(0, Math.PI * 2), l = U.rand(10, 16); s += Tr('M' + f1(Math.cos(b) * 7) + ',' + f1(Math.sin(b) * 7) + ' l' + f1(Math.cos(b) * l) + ',' + f1(Math.sin(b) * l) + ' l' + f1(Math.cos(b + 0.8) * 4) + ',' + f1(Math.sin(b + 0.8) * 4), K, 2.2, 0.8); }
  for(i = 0; i < 10; i++){ var g = U.rand(0, Math.PI * 2), dd = U.rand(36, 62); s += '<circle class="mjo-goutte" r="' + f1(U.rand(2.4, 5.5)) + '" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" style="--dx:' + f1(Math.cos(g) * dd) + 'px;--dy:' + f1(Math.sin(g) * dd) + 'px"/>'; }
  return s + El(-8, -9, 9, 4.4, '#ffffff', 0, ' opacity=".6" transform="rotate(-30 -8 -9)"') + Ci(8, -11, 2.4, '#ffffff', 0, ' opacity=".65"') + Ci(-12, 6, 1.6, '#ffffff', 0, ' opacity=".5"') + '</g>';
}
/* Le labo vu de face, pour une scène de W × H unités (les insectes s'y promènent partout). */
function decorLabo(i, W, H){
  var G = gU(i), F = Math.round(H * 0.7), rnd = alea(Math.round(W * 3 + H));
  var s = '<defs>' + DEFS_BOIS(i) + lg(i + 'mur', [['#2b2148', 0], ['#3e2f5f', 0.6], ['#4a3868', 1]], 1) + lg(i + 'sol', [['#6b3f24', 0], ['#8a5634', 0.45], ['#5c341d', 1]], 1) +
    rg(i + 'feu', [['#ff9a4a', 0, 0.4], ['#ff7a3c', 1, 0]]) + '</defs>';
  s += '<rect x="-2" y="-2" width="' + (W + 4) + '" height="' + (F + 2) + '" fill="' + G('mur') + '"/>' + briques(0, 14, W, F, 56, 28);
  var fw = Math.min(104, W * 0.26), fh = Math.min(160, F * 0.46), fx = W * 0.52, fy = 26;
  s += fenetreArc(i, G, fx, fy, fw, fh, 'nuit') + rayon('M' + f1(fx - fw / 2) + ',' + f1(fy + fh) + ' L' + f1(fx + fw / 2) + ',' + f1(fy + fh) + ' L' + f1(fx + fw * 0.2) + ',' + F + ' L' + f1(fx - fw * 1.6) + ',' + F + ' Z', '#bff9ff', 0.07);
  s += '<ellipse cx="' + W + '" cy="' + F + '" rx="' + f1(W * 0.6) + '" ry="' + f1(H * 0.55) + '" fill="' + G('feu') + '"/>';
  s += Re(-4, -4, W + 8, 16, 0, G('bS'), 2.4);
  var sw = Math.min(150, W * 0.3), y1 = Math.round(F * 0.4), y2 = Math.round(F * 0.66);
  s += planche(G, 6, 6 + sw, y1) + planche(G, W - 6 - sw, W - 6, y2);
  var deco = [['fiole', '#8ff3ff'], ['livres', '#7a2a3a'], ['bocal', '#ffd36a'], ['fiole', '#ff7f9e'], ['bocal', '#5fdc7a']], x = 22;
  deco.forEach(function(q, k){ if(x < 6 + sw - 16){ s += dessinerObjet({t:q[0], x:x, y:y1, s:0.66, c:q[1], d:true, n:3, v:k, sl:{}}); x += q[0] === 'livres' ? 34 : 26; } });
  x = W - sw + 10;
  [['bocal', '#b48cff'], ['cristal', '#8ff3ff'], ['fiole', '#ffd36a'], ['champignon', '#e5484d'], ['bocal', '#ff9a4a']].forEach(function(q, k){ if(x < W - 20){ s += dessinerObjet({t:q[0], x:x, y:y2, s:0.66, c:q[1], d:true, n:2, v:k, sl:{}}); x += 26; } });
  s += dessinerObjet({t:'herbes', x:W * 0.2, y:12, s:0.7, c:'#4f9a5c', d:true, sl:{}}) + dessinerObjet({t:'herbes', x:W * 0.82, y:12, s:0.7, c:'#8fd27a', d:false, sl:{}});
  /* le plancher */
  s += '<rect x="-2" y="' + F + '" width="' + (W + 4) + '" height="' + (H - F + 2) + '" fill="' + G('sol') + '"/>';
  var pl = '';
  for(var k = -12; k <= 12; k++){ var xa = W / 2 + k * 44, xb = W / 2 + k * 62; pl += 'M' + f1(xa) + ',' + F + ' L' + f1(xb) + ',' + (H + 2) + ' '; }
  for(k = 0; k < 9; k++){ var yj = F + (H - F) * (0.25 + rnd() * 0.7), xj = rnd() * W; pl += 'M' + f1(xj) + ',' + f1(yj) + ' h' + f1(26 + rnd() * 20) + ' '; }
  s += Tr(pl, 'rgba(40,20,10,.45)', 2) + Re(-4, F - 6, W + 8, 8, 0, G('bS'), 2);
  /* l'établi et le chaudron */
  var ex = W * 0.08, ew = Math.min(W * 0.36, 200), ey = F + (H - F) * 0.12;
  s += Re(ex + 10, ey + 6, 9, (H - F) * 0.5, 2, G('bS')) + Re(ex + ew - 19, ey + 6, 9, (H - F) * 0.5, 2, G('bS')) + Re(ex, ey - 4, ew, 12, 3, G('bH')) +
    dessinerObjet({t:'mortier', x:ex + ew * 0.25, y:ey - 4, s:0.7, c:'#8fd27a', d:true, sl:{}}) + dessinerObjet({t:'livres', x:ex + ew * 0.62, y:ey - 4, s:0.7, c:'#3f4f9a', d:true, n:3, v:1, sl:{}}) +
    dessinerObjet({t:'bougie', x:ex + ew * 0.88, y:ey - 4, s:0.62, c:'#f6ecd2', d:true, sl:{}});
  var cx = W * 0.8, cy = F + (H - F) * 0.62;
  s += El(cx, cy + 4, 46, 9, '#1b0e0a', 0, ' opacity=".6"') + dessinerObjet({t:'chaudronMini', x:cx, y:cy, s:1.5, c:'#6fd3a8', d:true, sl:{}});
  /* trous d'où sortent les insectes */
  s += El(W * 0.05, F + (H - F) * 0.5, 13, 8, '#0a0612', 2) + El(W * 0.47, H - 5, 15, 7, '#0a0612', 2) + Tr('M' + f1(W * 0.9) + ',' + f1(F * 0.42) + ' l-6,8 l5,6 l-4,9', '#0a0612', 3) + El(W * 0.9, F * 0.52, 8, 5, '#0a0612', 1.6);
  return s;
}
function trous(W, H){ var F = H * 0.7; return [{x:W * 0.05, y:F + (H - F) * 0.5}, {x:W * 0.47, y:H - 6}, {x:W * 0.9, y:F * 0.52}, {x:W * 0.05 + 4, y:F * 0.3}]; }
function bocalSVG(i, especes, bon){
  var s = '<svg class="mjo-bocal-svg" viewBox="0 0 200 170" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>' + lg(i + 'v', [['#ffffff', 0, 0.45], ['#bff3ff', 0.45, 0.1], ['#ffffff', 1, 0.26]]) + '</defs>' +
    El(100, 165, 86, 5, '#000000', 0, ' opacity=".3"') + Re(8, 30, 184, 132, 30, bon ? 'rgba(120,220,140,.16)' : 'rgba(240,90,90,.16)', 0) +
    '<g class="mjo-bocal-especes">';
  var pos = especes.length <= 2 ? [[58, 104, -20, 1.25], [142, 102, 25, 1.25]] : [[56, 74, -20, 1], [144, 72, 25, 1], [58, 132, 160, 1], [142, 134, -150, 1]];
  especes.forEach(function(e, k){ var q = pos[k % pos.length]; s += '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ') scale(' + q[3] + ')">' + ESPECES[e].art(ESPECES[e].c) + '</g>'; });
  s += '</g><g class="mjo-bocal-dedans"></g>' + Re(8, 30, 184, 132, 30, 'url(#' + i + 'v)', 3) + Re(30, 18, 140, 15, 6, '#c98450', 3) + Re(22, 5, 156, 16, 6, '#e0a060', 3) +
    Br('M22,50 V144', 3.4, 0.45) + Br('M180,58 V86', 2.4, 0.3) + '</svg>';
  return s;
}
function reglagesInsectes(n, mods){
  mods = mods || {};
  var p = {};
  p.mauvais = entier(n, {1:6, 3:8, 6:11, 10:14});
  p.ecran = entier(n, {1:3, 3:4, 6:6, 10:8});
  p.bons = entier(n, {1:2, 3:3, 6:4, 10:6});
  p.vitesse = courbe(n, {1:24, 3:32, 6:44, 10:60, 12:68}) * (mods.lent || 1);
  p.duree = Math.round(courbe(n, {1:80, 3:75, 6:70, 10:65}) + (mods.temps || 0) + (mods.lent && mods.lent < 1 ? 5 : 0));
  p.vies = Math.max(1, entier(n, {1:5, 3:4, 6:3, 10:2}) + Math.round(mods.erreurs || 0));
  p.erreurs = p.vies - 1;
  p.ressemblance = n <= 2 ? 1 : (n <= 5 ? 2 : (n <= 8 ? 3 : 4));
  p.teintes = courbe(n, {1:0.1, 3:0.25, 6:0.45, 10:0.6});
  p.pauses = courbe(n, {1:0.5, 10:0.25});
  p.ranger = n >= 7;
  p.zone = mods.zone || 1;
  p.indices = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  var v = p.vitesse;
  p.lignes = [
    {nom:'Mauvais insectes à écraser', val:String(p.mauvais)},
    {nom:'Gentils insectes', val:p.bons + ' (ne pas écraser !)'},
    {nom:'Ils courent', val:v < 28 ? 'tout doucement 🐌' : (v < 38 ? 'doucement' : (v < 52 ? 'vite' : 'très vite 💨'))},
    {nom:'Ils se ressemblent', val:['pas du tout', 'un peu', 'beaucoup', 'énormément'][p.ressemblance - 1]},
    {nom:'Couleurs trompeuses', val:p.teintes < 0.2 ? 'quelques-unes' : (p.teintes < 0.4 ? 'pas mal' : 'beaucoup 🎨')},
    {nom:'Le sablier', val:txtDuree(p.duree)},
    {nom:'Cœurs (erreurs permises)', val:p.erreurs + ' ❤️'},
    {nom:'Ranger les gentils dans le bocal vert', val:p.ranger ? 'obligatoire' : 'en bonus ⭐'}
  ];
  if(p.zone > 1) p.lignes.push({nom:'Insectes', val:'plus faciles à toucher'});
  if(p.indices) p.lignes.push({nom:'Indices 💡', val:String(p.indices)});
  if(p.revele) p.lignes.push({nom:'Les mauvais ont un rond rouge', val:'oui'});
  return p;
}

MJ.enregistrer('insectes', {
  nom:'Le grand ménage du labo', role:'alchimiste', ic:'🪲',
  consigne:function(p){
    return 'Écrase les mauvais insectes (bocal rouge) mais pas les gentils (bocal vert) ! Regarde bien leur FORME : leur couleur peut tromper.' +
      (p && p.ranger ? ' Glisse les gentils dans le bocal vert.' : ' Bonus : glisse les gentils dans le bocal vert.') + (p && p.ensuite === 'differences' ? ' Ensuite : les différences de l\'étagère du labo !' : '');
  },
  minuteur:true,
  reglages: reglagesInsectes,
  especes: ESPECES,
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#3e2f5f"/><rect y="118" width="300" height="52" fill="#8a5634"/>');
    function bocalMini(x, esp, bon){
      return '<g transform="translate(' + (x - 4) + ',70) scale(.3)">' + bocalSVG(nid('dj'), [esp], bon).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</g>' +
        Re(x + 3, 100, 48, 14, 4, bon ? '#2f9e44' : '#c0392b', 1.6) + '<text x="' + (x + 27) + '" y="111" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">' + (bon ? '✔' : '☠') + '</text>';
    }
    var j1 = bocalMini(192, 'cafard', false), j2 = bocalMini(244, 'coccinelle', true);
    d.contenu.innerHTML = j1 + j2 + '<g class="mjo-demo-splat" opacity="0" transform="translate(60,112)">' + splatSVG('#c9e05a') + '</g>' +
      '<g class="mjo-demo-caf" transform="translate(60,112) rotate(70) scale(.8)">' + insecteSVG('cafard') + '</g>' +
      '<g transform="translate(140,134)"><g class="mjo-demo-cocci" style="transition:transform .8s cubic-bezier(.4,.1,.3,1)"><g transform="rotate(-60) scale(.8)">' + insecteSVG('coccinelle') + '</g></g></g>';
    var caf = d.contenu.querySelector('.mjo-demo-caf'), spl = d.contenu.querySelector('.mjo-demo-splat'), co = d.contenu.querySelector('.mjo-demo-cocci');
    return scenario(d.svg, [
      [10, function(){ caf.setAttribute('opacity', '1'); spl.setAttribute('opacity', '0'); co.style.transition = 'none'; co.style.transform = ''; co.setAttribute('opacity', '1'); d.vers(150, 160, 0); }],
      [400, function(){ co.style.transition = 'transform .8s cubic-bezier(.4,.1,.3,1)'; d.vers(64, 118, 700); }],
      [800, function(){ d.tape(); caf.setAttribute('opacity', '0'); spl.setAttribute('opacity', '1'); relancer(spl.querySelector('.mjo-splat-c'), 'pop'); }],
      [700, function(){ d.vers(144, 140, 600); }],
      [700, function(){ co.style.transform = 'translate(131px,-30px) scale(.7)'; d.vers(276, 110, 800); }],
      [900, function(){ co.setAttribute('opacity', '0'); U.son('ok'); }],
      [600, function(){}]
    ], 700);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var n = p.niveauEffectif || 3, lot = LOTS[p.ressemblance || 2], zone = p.zone || 1;
    var id = nid('mjoi');
    var racine = U.html('<div class="mjo-jeu mjo-insectes"></div>');
    el.appendChild(racine);
    var hud = creerHud(racine);
    var totalM = p.mauvais || 8, totalB = p.bons || 3, vies = p.vies || 3, viesMax = vies;
    var tues = 0, ranges = 0, erreurs = 0, sortis = 0, restant = p.duree || 70, fini = false, indices = p.indices || 0, annonceRanger = false;
    hud.vies(vies, viesMax); hud.prog(0, totalM, '💥', 9); hud.temps(1);
    var aire = U.html('<div class="mjo-in-aire">' +
      '<div class="mjo-in-scene"><svg class="mjo-in-svg" preserveAspectRatio="none"><g class="mjo-in-decor"></g><g class="mjo-in-taches"></g><g class="mjo-in-bestioles"></g><g class="mjo-in-fx"></g></svg></div>' +
      '<div class="mjo-bocaux">' +
        '<div class="mjo-bocal mauvais">' + bocalSVG(id + 'm', lot.mauvais, false) + '<div class="mjo-etiquette"><b>☠</b> Mauvais insectes</div></div>' +
        '<div class="mjo-bocal bons">' + bocalSVG(id + 'b', lot.bons, true) + '<div class="mjo-etiquette"><b>✔</b> Bons insectes</div><span class="mjo-compte">0/' + totalB + '</span></div>' +
      '</div></div>');
    racine.appendChild(aire);
    var bas = null;
    if(indices){ bas = U.html('<div class="mjo-bas"><button class="btn magie mjo-indice" type="button">💡 × ' + indices + '</button></div>'); racine.appendChild(bas); }
    var scene = aire.querySelector('.mjo-in-scene'), svg = aire.querySelector('svg'), gDecor = svg.querySelector('.mjo-in-decor'), gTaches = svg.querySelector('.mjo-in-taches'), gBest = svg.querySelector('.mjo-in-bestioles'), gFx = svg.querySelector('.mjo-in-fx');
    var jarBon = aire.querySelector('.mjo-bocal.bons'), jarMal = aire.querySelector('.mjo-bocal.mauvais'), compte = jarBon.querySelector('.mjo-compte'), dedansBon = jarBon.querySelector('.mjo-bocal-dedans');
    var W = 400, H = 500, kpx = 1, bestioles = [], seq = 0;
    function disposer(){
      var r0 = aire.getBoundingClientRect();
      aire.classList.toggle('large', r0.width > r0.height * 1.05);
      var r = scene.getBoundingClientRect();
      if(!r.width || !r.height) return;
      kpx = fixe(Math.min(r.width, r.height * 1.2) / 400, 0.9, 1.4);
      var W2 = r.width / kpx, H2 = r.height / kpx;
      if(Math.abs(W2 - W) < 1 && Math.abs(H2 - H) < 1 && gDecor.firstChild) return;
      W = W2; H = H2;
      svg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H));
      gDecor.innerHTML = decorLabo(id + 'd' + (seq++), W, H);
      bestioles.forEach(function(b){ b.x = fixe(b.x, 12, W - 12); b.y = fixe(b.y, 12, H - 12); });
    }
    disposer();
    P.observe(aire, disposer);
    function teinte(){ return Math.random() < (p.teintes || 0) ? U.choix(TEINTES) : null; }
    function creerBestiole(esp, bon, x, y, a, sortie){
      var t = teinte(), b = {id:++seq, esp:esp, bon:bon, x:x, y:y, a:a, v:(p.vitesse || 30) * U.rand(0.8, 1.2), vire:0, etat:sortie ? 'apparait' : 'marche', tEtat:sortie ? 0.5 : U.rand(0.5, 2.5), teinte:t, arret:false};
      b.el = svgNoeud('g', {'class':'mjo-ins' + (bon ? ' bon' : ' mauvais') + (sortie ? ' sort' : '')}, gBest);
      b.el.innerHTML = (p.revele && !bon ? '<circle class="mjo-revele" r="27"/>' : '') + insecteSVG(esp, t);
      bestioles.push(b); dessiner(b);
      return b;
    }
    function placeLibreIns(){
      for(var k = 0; k < 40; k++){
        var x = U.rand(30, W - 30), y = U.rand(30, H - 30);
        if(bestioles.every(function(b){ return Math.hypot(b.x - x, b.y - y) > 70; })) return {x:x, y:y};
      }
      return {x:U.rand(30, W - 30), y:U.rand(30, H - 30)};
    }
    for(var k = 0; k < totalB; k++){ var q = placeLibreIns(); creerBestiole(lot.bons[k % lot.bons.length], true, q.x, q.y, U.rand(0, 6.28), false); }
    var debut = Math.min(p.ecran || 4, totalM);
    for(k = 0; k < debut; k++){ q = placeLibreIns(); creerBestiole(U.choix(lot.mauvais), false, q.x, q.y, U.rand(0, 6.28), false); sortis++; }
    var tSortie = 1.5;
    function sortir(){
      var h = U.choix(trous(W, H)), a = Math.atan2(W / 2 - h.x, -(H / 2 - h.y));
      creerBestiole(U.choix(lot.mauvais), false, h.x, h.y, a, true); sortis++;
    }
    function dessiner(b){
      b.el.setAttribute('transform', 'translate(' + f1(b.x) + ',' + f1(b.y) + ') rotate(' + f1(b.a * 57.2958) + ')');
      var arret = b.etat === 'pause' || b.etat === 'etourdi';
      if(arret !== b.arret){ b.arret = arret; b.el.classList.toggle('arret', arret); }
    }
    function bouger(b, dt){
      if(b.etat === 'mort' || b.etat === 'traine' || b.etat === 'bocal') return;
      b.tEtat -= dt;
      if(b.etat === 'apparait'){ if(b.tEtat <= 0){ b.etat = 'marche'; b.tEtat = U.rand(1, 2.5); b.el.classList.remove('sort'); } }
      else if(b.etat === 'pause' || b.etat === 'etourdi'){
        if(b.tEtat <= 0){ b.etat = b.etat === 'etourdi' ? 'fuite' : 'marche'; b.tEtat = U.rand(1.2, 3); b.a += U.rand(-1.6, 1.6); }
        return;
      }
      var marge = 34, cx = W / 2 - b.x, cy = H / 2 - b.y;
      if(b.x < marge || b.x > W - marge || b.y < marge || b.y > H - marge){
        var voulu = Math.atan2(cx, -cy), dA = voulu - b.a;
        while(dA > Math.PI) dA -= 2 * Math.PI; while(dA < -Math.PI) dA += 2 * Math.PI;
        b.a += fixe(dA, -4 * dt, 4 * dt);
      } else {
        b.vire = fixe(b.vire + U.rand(-1, 1) * dt * 7, -2.4, 2.4);
        b.a += b.vire * dt;
      }
      var v = b.v * (b.etat === 'fuite' ? 2.2 : (b.etat === 'apparait' ? 0.6 : 1));
      b.x = fixe(b.x + Math.sin(b.a) * v * dt, 8, W - 8); b.y = fixe(b.y - Math.cos(b.a) * v * dt, 8, H - 8);
      if(b.tEtat <= 0){
        if(b.etat === 'fuite'){ b.etat = 'marche'; b.tEtat = U.rand(1, 2.5); }
        else if(Math.random() < (p.pauses || 0.35)){ b.etat = 'pause'; b.tEtat = U.rand(0.35, 1.3); }
        else { b.tEtat = U.rand(0.8, 2.6); b.vire = U.rand(-2, 2); }
      }
    }
    function pctScene(x, y){ var e = versEcran(svg, x, y), r = racine.getBoundingClientRect(); return {x:(e.x - r.left) / r.width * 100, y:(e.y - r.top) / r.height * 100}; }
    function ecraser(b){
      b.etat = 'mort'; tues++;
      P.sons.ecrase(); U.vibrer(22);
      var goo = b.teinte ? mel(b.teinte, '#ffffff', 0.15) : ESPECES[b.esp].goo;
      var sp = svgNoeud('g', {'class':'mjo-splat', transform:'translate(' + f1(b.x) + ',' + f1(b.y) + ') rotate(' + f1(U.rand(0, 360)) + ') scale(' + e2(U.rand(1, 1.25)) + ')'}, gTaches);
      sp.innerHTML = splatSVG(goo);
      b.el.classList.add('ecrase');
      P.apres(300, function(){ retirer(b.el); });
      P.apres(2200, function(){ sp.classList.add('sec'); });
      var taches = gTaches.querySelectorAll('.mjo-splat'); if(taches.length > 16) retirer(taches[0]);
      var q2 = pctScene(b.x, b.y); flotter(racine, q2.x, q2.y - 6, U.choix(['SPLAT !', 'SPLOTCH !', 'Beurk !', 'Pof !', 'SCHPLOUF !']), 'splat');
      hud.prog(tues, totalM, '💥', 9);
      verifier();
    }
    function erreurGentil(b){
      erreurs++; vies--;
      hud.perdVie(vies, viesMax);
      P.sons.ohNon(); U.vibrer(60);
      b.etat = 'etourdi'; b.tEtat = 0.9;
      relancer(b.el, 'aie');
      var et = svgNoeud('g', {'class':'mjo-etoiles'}, b.el); et.innerHTML = etincelle(-14, -26, 6, '#ffe36a') + etincelle(14, -24, 5, '#ffffff') + etincelle(0, -32, 4, '#ffe36a');
      P.apres(1000, function(){ retirer(et); });
      var q2 = pctScene(b.x, b.y); flotter(racine, q2.x, q2.y - 6, 'Oh non !', 'ko');
      relancer(jarBon, 'montre');
      if(vies <= 0){ fini = true; perdre('Oh non… plus de cœur, et encore un gentil insecte touché.'); }
    }
    function verifier(){
      if(fini || tues < totalM) return;
      var libres = bestioles.filter(function(b){ return b.bon && b.etat !== 'bocal'; }).length;
      if(p.ranger && libres > 0){
        if(!annonceRanger){ annonceRanger = true; annonce(racine, 'Range les gentils ! ✔', 1600); relancer(jarBon, 'montre'); }
        return;
      }
      gagner();
    }
    function perdre(txt){
      fini = true;
      bestioles.forEach(function(b){ if(!b.bon && b.etat !== 'mort') b.el.classList.add('montre'); });
      P.finir({reussi:false, score:tues / totalM, erreurs:erreurs, detail:txt}, 1600);
    }
    function gagner(){
      fini = true;
      var resIns = {reussi:true, score:1, erreurs:erreurs, bonus:ranges, detail:'Les ' + totalM + ' mauvais insectes sont écrasés' + (ranges ? ' et ' + ranges + ' gentil' + (ranges > 1 ? 's' : '') + ' rangé' + (ranges > 1 ? 's' : '') + ' dans le bocal ⭐' : '') + ' !'};
      annonce(racine, 'Le labo est tout propre ! ✨', 1500);
      P.sons.pop();
      if(p.ensuite === 'differences') P.apres(1100, function(){ enchainer(resIns); });
      else P.finir(resIns, 1500);
    }
    function enchainer(resIns){
      var pd = MJ.reglages('differences', p.niveau || n, Object.assign({}, p.mods || {}), {brut:!!p.brut, joueur:p.joueur || undefined});
      pd.theme = 'labo'; pd._theme = 'labo';
      if(p.ingredient) pd.ingredient = p.ingredient;
      var voile = U.html('<div class="mjo-transition"><div class="mjo-trans-txt"><span>✨🔎✨</span><b>Le labo est propre !</b><i>Maintenant : trouve les ' + pd.differences + ' différences de l\'étagère</i></div></div>');
      el.appendChild(voile);
      P.apres(1400, function(){
        retirer(racine);
        partieDiff(el, pd, P, function(resD){
          var res = {reussi:!!resD.reussi, score:(1 + (resD.score || 0)) / 2, erreurs:resIns.erreurs + (resD.erreurs || 0),
            detail:'Labo nettoyé, puis : ' + resD.detail, etapes:{insectes:resIns, differences:resD}};
          if(resD.message) res.message = resD.message;
          P.finir(res, resD.reussi ? 1100 : 1600);
        });
        P.apres(1500, function(){ retirer(voile); });
      });
    }
    /* ---------- Toucher, glisser ---------- */
    var prise = null, fantome = null;
    function sous(pt){
      var best = null, bd = 28 * zone;
      bestioles.forEach(function(b){ if(b.etat === 'mort' || b.etat === 'bocal' || b.etat === 'traine') return; var d = Math.hypot(b.x - pt.x, b.y - pt.y); if(d < bd){ bd = d; best = b; } });
      return best;
    }
    function dans(el2, e){ var r = el2.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    function poserFantome(e){
      var r = racine.getBoundingClientRect();
      fantome.style.transform = 'translate(' + f1(e.clientX - r.left) + 'px,' + f1(e.clientY - r.top) + 'px)';
    }
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini || prise) return;
      e.preventDefault();
      var pt = ptSVG(svg, e), b = sous(pt);
      if(!b) return;
      if(!b.bon){ ecraser(b); return; }
      prise = {b:b, x:e.clientX, y:e.clientY, id:e.pointerId, glisse:false};
      try{ svg.setPointerCapture(e.pointerId); }catch(er){}
    });
    P.ecoute(svg, 'pointermove', function(e){
      if(!prise || e.pointerId !== prise.id || fini) return;
      if(!prise.glisse && Math.hypot(e.clientX - prise.x, e.clientY - prise.y) > 10){
        prise.glisse = true; var b = prise.b;
        b.etatAvant = b.etat; b.etat = 'traine'; b.el.classList.add('cache');
        fantome = U.html('<div class="mjo-fantome"><svg viewBox="-34 -34 68 68" style="width:' + Math.round(68 * kpx * 1.15) + 'px;height:' + Math.round(68 * kpx * 1.15) + 'px">' + insecteSVG(b.esp, b.teinte) + '</svg></div>');
        racine.appendChild(fantome);
        P.sons.pop();
      }
      if(prise.glisse){
        poserFantome(e);
        jarBon.classList.toggle('vise', dans(jarBon, e)); jarMal.classList.toggle('vise', dans(jarMal, e));
      }
    });
    function lacher(e){
      if(!prise || e.pointerId !== prise.id) return;
      var pr = prise; prise = null;
      try{ svg.releasePointerCapture(e.pointerId); }catch(er){}
      jarBon.classList.remove('vise'); jarMal.classList.remove('vise');
      var b = pr.b;
      if(!pr.glisse){ if(!fini) erreurGentil(b); return; }
      retirer(fantome); fantome = null;
      if(fini){ b.etat = 'marche'; b.el.classList.remove('cache'); return; }
      if(dans(jarBon, e)){
        b.etat = 'bocal'; retirer(b.el); ranges++;
        P.sons.bocal(); U.vibrer(15);
        var g = svgNoeud('g', {transform:'translate(' + f1(U.rand(36, 164)) + ',' + f1(U.rand(112, 146)) + ') rotate(' + f1(U.rand(0, 360)) + ') scale(.55)', 'class':'mjo-range'}, dedansBon);
        g.innerHTML = ESPECES[b.esp].art(b.teinte || ESPECES[b.esp].c);
        compte.textContent = ranges + '/' + totalB; relancer(jarBon, 'gagne');
        var r = jarBon.getBoundingClientRect(), rr = racine.getBoundingClientRect();
        flotter(racine, (r.left + r.width / 2 - rr.left) / rr.width * 100, (r.top + r.height * 0.3 - rr.top) / rr.height * 100, '+1 ⭐', 'ok');
        verifier();
        return;
      }
      if(dans(jarMal, e)) flotter(racine, 50, 40, 'Pas ce bocal !', 'ko');
      var pt = ptSVG(svg, e);
      if(pt.x > 8 && pt.x < W - 8 && pt.y > 8 && pt.y < H - 8){ b.x = pt.x; b.y = pt.y; }
      b.etat = 'pause'; b.tEtat = 0.5; b.el.classList.remove('cache'); dessiner(b);
    }
    P.ecoute(svg, 'pointerup', lacher);
    P.ecoute(svg, 'pointercancel', function(e){ if(prise && e.pointerId === prise.id){ var b = prise.b; prise = null; retirer(fantome); fantome = null; if(b.etat === 'traine'){ b.etat = 'marche'; b.el.classList.remove('cache'); } } });
    var bi = bas && bas.querySelector('.mjo-indice');
    if(bi) P.ecoute(bi, 'click', function(){
      if(fini || indices <= 0) return;
      var m = bestioles.filter(function(b){ return !b.bon && b.etat !== 'mort'; });
      if(!m.length) return;
      indices--; bi.textContent = '💡 × ' + indices; if(!indices) bi.disabled = true;
      P.sons.pop();
      var b = U.choix(m), c = svgNoeud('circle', {'class':'mjo-indice-ins', r:'30'}, b.el);
      b.el.insertBefore(c, b.el.firstChild);
      P.apres(3200, function(){ retirer(c); });
    });
    racine.mjoEtat = function(){
      return {jeu:'insectes', tues:tues, totalMauvais:totalM, ranges:ranges, totalBons:totalB, vies:vies, restant:restant, ranger:!!p.ranger, ensuite:p.ensuite || null,
        bocalBon:(function(){ var r = jarBon.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height * 0.6}; })(),
        insectes:bestioles.filter(function(b){ return b.etat !== 'mort' && b.etat !== 'bocal'; }).map(function(b){ var e = versEcran(svg, b.x, b.y); return {id:b.id, esp:b.esp, bon:b.bon, teinte:b.teinte, etat:b.etat, x:e.x, y:e.y}; })};
    };
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / (p.duree || 70));
      tSortie -= dt;
      var vivantsM = bestioles.filter(function(b){ return !b.bon && b.etat !== 'mort'; }).length;
      if(tSortie <= 0 && sortis < totalM && vivantsM < (p.ecran || 4)){ sortir(); tSortie = U.rand(0.8, 1.8); }
      for(var i = 0; i < bestioles.length; i++){ var b = bestioles[i]; if(b.etat === 'mort' || b.etat === 'bocal') continue; bouger(b, dt); if(b.etat !== 'traine') dessiner(b); }
      if(bestioles.length > 40) bestioles = bestioles.filter(function(b){ return b.etat !== 'mort'; });
      if(restant <= 0){ perdre(tues >= totalM ? 'Le sablier est vide… les gentils ne sont pas tous rangés.' : 'Le sablier est vide… il reste ' + (totalM - tues) + ' mauvais insecte' + (totalM - tues > 1 ? 's' : '') + '.'); return false; }
    });
    return {arreter: function(){ P.arreter(); retirer(fantome); }};
  }
});

})();
