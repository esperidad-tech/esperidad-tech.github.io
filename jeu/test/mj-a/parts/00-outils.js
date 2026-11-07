/* ==========================================================
   Brumeval v2 — mini-jeux du Pisteur et de l'Alchimiste
   traces, poursuite, cachette, tir · rythme, bulles, melange,
   temperature, loupe.  Dépend de mj-core.js (MJ, MJ.util).
   Source assemblée depuis test/mj-a/parts/ par test/mj-a/assembler.sh.
   Difficulté : reglages(n, mods), n = numéro d'enquête + réglage de
   l'appareil (Facile +0, Normal +2, Expert +4). Points d'appui
   calibrés à n = 1 (enfant peu à l'aise), 3 (bon joueur : ~2 fois
   sur 3), 6, 9 (presque impossible sans aide) et 12.
   Aucune lecture à voix haute ici : seul le bouton 🔊 du cœur lit.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.util){ console.error('mj-pisteur-alchi : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util;
var NS = 'http://www.w3.org/2000/svg';
var CONTOUR = '#24182e';
var uid = 0;
function nid(p){ uid++; return (p || 'mja') + uid; }

/* ---------- Petits outils ---------- */
function ptSVG(svg, e){
  var m = svg.getScreenCTM();
  if(!m) return {x:0, y:0};
  var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  var r = pt.matrixTransform(m.inverse());
  return {x:r.x, y:r.y};
}
function dist(a, b){ var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
function svgNoeud(tag, attrs, parent){
  var n = document.createElementNS(NS, tag);
  if(attrs) for(var k in attrs) n.setAttribute(k, attrs[k]);
  if(parent) parent.appendChild(n);
  return n;
}
function svgFrag(parent, html){
  var tmp = document.createElementNS(NS, 'g');
  tmp.innerHTML = html;
  var premier = null;
  while(tmp.firstChild){ var c = tmp.firstChild; if(!premier && c.nodeType === 1) premier = c; parent.appendChild(c); }
  return premier;
}
function fixe(n, a, b){ return Math.max(a, Math.min(b, n)); }
/* Courbe de difficulté par points d'appui : courbe(n, {1:a, 3:b, 6:c, 9:d, 12:e}).
   Interpolation linéaire entre les points ; au-delà, on garde la dernière valeur. */
function courbe(n, pts){
  var ks = Object.keys(pts).map(Number).sort(function(a, b){ return a - b; });
  if(n <= ks[0]) return pts[ks[0]];
  for(var i = 1; i < ks.length; i++){
    if(n <= ks[i]){ var a = ks[i - 1], b = ks[i]; return pts[a] + (pts[b] - pts[a]) * (n - a) / (b - a); }
  }
  return pts[ks[ks.length - 1]];
}
function entier(n, pts){ return Math.round(courbe(n, pts)); }
/* Erreurs permises : 3 au niveau 1, 2 au niveau 3, 1 au niveau 6, 0 au niveau 9 (+ mods.erreurs). */
function erreursPermises(n, mods, pts){
  var e = Math.floor(courbe(n, pts || {1:3, 3:2, 6:1, 9:0}) + 0.001);
  return Math.max(0, e + (mods.erreurs || 0));
}
function txtS(x){ return U.fmt(x, x < 1 ? 2 : 1) + ' s'; }
function pct(x){ return Math.round(x * 100) + ' %'; }

/* Cadre adaptatif : la zone de jeu reste 360×480 au centre, le décor déborde
   (x de -240 à 600, y de -220 à 700) et remplit l'écran en paysage comme en portrait. */
var DEC = {x:-240, y:-220, w:840, h:920};
function cadrer(P, svg, o){
  o = o || {};
  var W0 = o.w || 360, H0 = o.h || 480, maxW = o.maxW || 830, maxH = o.maxH || 900;
  function maj(){
    var r = svg.getBoundingClientRect();
    if(!r.width || !r.height) return;
    var a = r.width / r.height, w = W0, h = H0;
    if(a > W0 / H0) w = Math.min(maxW, H0 * a); else h = Math.min(maxH, W0 / a);
    var x = (W0 - w) / 2, y = o.ancre === 'bas' ? H0 - h : (o.ancre === 'haut' ? 0 : (H0 - h) / 2);
    svg.setAttribute('viewBox', x.toFixed(1) + ' ' + y.toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1));
    if(o.apres) o.apres(x, y, w, h);
  }
  maj();
  if(window.ResizeObserver){ var ro = new ResizeObserver(maj); ro.observe(svg); P.stops.push(function(){ ro.disconnect(); }); }
  else P.ecoute(window, 'resize', maj);
  return maj;
}
/* Coordonnées SVG → coordonnées écran (pour les robots de test et les bulles de texte). */
function versEcran(svg, x, y){
  var m = svg.getScreenCTM(); if(!m) return {x:0, y:0};
  var pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
  var r = pt.matrixTransform(m);
  return {x:r.x, y:r.y};
}
/* Position en % d'un point SVG dans un conteneur (pour flotter()). */
function pctDans(svg, cont, x, y){
  var e = versEcran(svg, x, y), r = cont.getBoundingClientRect();
  return {x:(e.x - r.left) / Math.max(1, r.width) * 100, y:(e.y - r.top) / Math.max(1, r.height) * 100};
}
function angleNorm(a){ while(a > Math.PI) a -= 2 * Math.PI; while(a < -Math.PI) a += 2 * Math.PI; return a; }
function lisse(t){ t = fixe(t, 0, 1); return t * t * (3 - 2 * t); }

/* Gestion d'une partie : boucles, minuteurs et écouteurs nettoyés d'un coup. */
function Partie(fin){
  var p = {fini:false, stops:[], timers:[]};
  p.boucle = function(fn){ var s = U.boucle(function(dt, t){ if(p.fini) return false; return fn(dt, t); }); p.stops.push(s); return s; };
  p.apres = function(ms, fn){ var t = setTimeout(function(){ if(!p.fini) fn(); }, ms); p.timers.push(t); return t; };
  p.ecoute = function(cible, type, fn, opt){ cible.addEventListener(type, fn, opt); p.stops.push(function(){ cible.removeEventListener(type, fn, opt); }); };
  p.nettoyer = function(){ p.stops.forEach(function(f){ try{ f(); }catch(e){} }); p.stops = []; p.timers.forEach(clearTimeout); p.timers = []; };
  p.terminer = function(res){ if(p.fini) return; p.fini = true; p.nettoyer(); fin(res); };
  /* Termine après une petite pause (le temps de voir l'animation finale). */
  p.finir = function(res, ms){ if(p.fini || p.fermeture) return; p.fermeture = true; p.apres(ms === undefined ? 700 : ms, function(){ p.terminer(res); }); };
  p.arreter = function(){ p.fini = true; p.nettoyer(); };
  return p;
}

/* ---------- Bandeau du haut : vies, progression, sablier ---------- */
var COEUR = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15 1.5 11.2 1.5 7 C1.5 3.8 4 1.5 7 1.5 C9.1 1.5 10.9 2.7 12 4.5 C13.1 2.7 14.9 1.5 17 1.5 C20 1.5 22.5 3.8 22.5 7 C22.5 11.2 19 15 12 20.5 Z"/></svg>';
function creerHud(el, o){
  o = o || {};
  var h = U.html('<div class="mja-hud">' +
    '<div class="mja-vies" aria-label="Vies"></div>' +
    '<div class="mja-prog" aria-label="Progression"></div>' +
    '<div class="mja-sablier" hidden><span>⏳</span><div class="mja-sab-barre"><i></i></div></div>' +
  '</div>');
  el.appendChild(h);
  var vies = h.querySelector('.mja-vies'), prog = h.querySelector('.mja-prog'), sab = h.querySelector('.mja-sablier'), sabI = sab.querySelector('i');
  var api = {
    el: h,
    vies: function(rest, max){
      if(max === undefined) max = rest;
      var s = '';
      for(var i = 0; i < max; i++) s += '<span class="mja-coeur' + (i < rest ? '' : ' perdu') + '">' + COEUR + '</span>';
      vies.innerHTML = s;
    },
    perdVie: function(rest, max){
      api.vies(rest, max);
      var c = vies.querySelectorAll('.mja-coeur')[rest];
      if(c){ c.classList.add('casse'); }
    },
    prog: function(k, n, ic){
      if(n > 14){ prog.innerHTML = '<div class="mja-prog-barre"><i style="width:' + Math.round(100 * k / n) + '%"></i></div><b>' + k + '/' + n + '</b>'; return; }
      var s = '';
      for(var i = 0; i < n; i++) s += '<span class="mja-gemme' + (i < k ? ' ok' : '') + (i === k - 1 ? ' neuf' : '') + '">' + (ic || '') + '</span>';
      prog.innerHTML = s;
    },
    temps: function(frac){
      sab.hidden = false;
      frac = fixe(frac, 0, 1);
      sabI.style.transform = 'scaleX(' + frac + ')';
      sab.classList.toggle('presse', frac < 0.25);
    },
    barre: function(frac){
      var i = prog.querySelector('.mja-prog-barre i');
      if(!i){ prog.innerHTML = '<div class="mja-prog-barre"><i></i></div>'; i = prog.querySelector('i'); }
      i.style.transform = 'scaleX(' + fixe(frac, 0, 1).toFixed(3) + ')';
    },
    /* Même barre, autre icône (flair du pisteur, stabilité…) */
    icone: function(ic, cls){ sab.querySelector('span').textContent = ic; if(cls) sab.classList.add(cls); },
    cacherTemps: function(){ sab.hidden = true; },
    /* Petit badge libre à gauche de la progression */
    badge: function(html){
      var b = h.querySelector('.mja-badge');
      if(!b){ b = document.createElement('div'); b.className = 'mja-badge'; h.insertBefore(b, prog); }
      b.innerHTML = html; return b;
    }
  };
  return api;
}

/* Petit texte qui s'envole (+1, ✗…) dans un conteneur positionné. */
function flotter(parent, xPct, yPct, texte, cls){
  var s = document.createElement('span');
  s.className = 'mja-flotte ' + (cls || '');
  s.textContent = texte;
  s.style.left = xPct + '%'; s.style.top = yPct + '%';
  parent.appendChild(s);
  setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); }, 1000);
}
/* Grand message au centre (« À toi ! », « Regarde… »). */
function annonce(parent, texte, ms){
  var s = document.createElement('div');
  s.className = 'mja-annonce';
  s.textContent = texte;
  parent.appendChild(s);
  setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); }, ms || 1300);
}
function secouer(n){ if(!n) return; n.classList.remove('mja-secoue'); void n.offsetWidth; n.classList.add('mja-secoue'); }
function erreurSensorielle(n){ U.son('ko'); U.vibrer(40); secouer(n); }

/* ---------- La petite main des démonstrations ---------- */
var MAIN = '<g class="mja-main"><circle class="mja-onde" r="13" cx="0" cy="0"/>' +
  '<g transform="scale(.62) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M5,30 L5,40 M16,31 L16,41" stroke="' + CONTOUR + '" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g></g>';

/* Crée un SVG de démonstration (viewBox 300×170) avec une main déplaçable. */
var dernierDemo = null;
function demoScene(el, fond){
  el.innerHTML = '<svg class="mja-demo-svg" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet">' + (fond || '') + '<g class="mja-demo-contenu"></g>' + MAIN + '</svg>';
  var svg = el.querySelector('svg');
  dernierDemo = svg;
  var main = svg.querySelector('.mja-main');
  var d = {
    svg: svg,
    contenu: svg.querySelector('.mja-demo-contenu'),
    vers: function(x, y, ms){
      main.style.transition = 'transform ' + (ms === undefined ? 600 : ms) + 'ms cubic-bezier(.4,.1,.3,1)';
      main.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    },
    tape: function(){ main.classList.remove('tape'); void main.getBoundingClientRect(); main.classList.add('tape'); },
    appuie: function(oui){ main.classList.toggle('appuie', !!oui); }
  };
  d.vers(250, 150, 0);
  return d;
}
/* Enchaîne des étapes [délai ms, fonction] et recommence en boucle. */
function scenario(etapes, pause){
  var timers = [], actif = true, noeud = dernierDemo;
  function vivant(){
    /* La démo s'arrête seule si son écran a été retiré (ex. le moteur ferme le mini-jeu pendant l'intro). */
    if(actif && noeud && !noeud.isConnected){ actif = false; timers.forEach(clearTimeout); }
    return actif;
  }
  function lancer(){
    var cumul = 0;
    etapes.forEach(function(e){ cumul += e[0]; timers.push(setTimeout(function(){ if(vivant()) e[1](); }, cumul)); });
    timers.push(setTimeout(function(){ if(vivant()){ timers = []; lancer(); } }, cumul + (pause || 900)));
  }
  lancer();
  return {arreter: function(){ actif = false; timers.forEach(clearTimeout); }};
}

/* Démo animée image par image (une seule boucle, qui s'arrête seule si l'écran est retiré). */
function demoBoucle(noeud, fn){
  var actif = true;
  var stop = U.boucle(function(dt, t){
    if(!actif) return false;
    if(!noeud.isConnected){ actif = false; return false; }
    fn(dt, t);
  });
  return {arreter: function(){ actif = false; stop(); }};
}

/* ---------- Un chaudron (réutilisé par plusieurs jeux) ---------- */
function chaudronSVG(o){
  o = o || {};
  var g = nid('ch');
  var feu = o.feu ? '<g class="mja-feu"><path class="mja-flamme f1" d="M-46,62 C-56,40 -38,30 -40,12 C-28,26 -22,36 -24,62 Z"/><path class="mja-flamme f2" d="M-14,62 C-26,34 -4,22 -6,0 C10,20 14,38 8,62 Z"/><path class="mja-flamme f3" d="M24,62 C16,40 34,30 30,14 C44,28 50,44 40,62 Z"/><ellipse class="mja-braises" cx="0" cy="64" rx="62" ry="9"/></g>' : '';
  return '<g class="mja-chaudron">' +
    '<defs><linearGradient id="' + g + 'c" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#4a4166"/><stop offset=".55" stop-color="#2b2540"/><stop offset="1" stop-color="#17131f"/></linearGradient>' +
    '<radialGradient id="' + g + 'l" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    feu +
    '<path d="M-58,40 L-66,58 M58,40 L66,58" stroke="' + CONTOUR + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M-78,-14 C-84,30 -50,56 0,56 C50,56 84,30 78,-14 Z" fill="url(#' + g + 'c)" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M-62,4 C-60,26 -40,40 -18,44" stroke="#8a7fb8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>' +
    '<ellipse cx="0" cy="-16" rx="84" ry="20" fill="#3a3352" stroke="' + CONTOUR + '" stroke-width="5"/>' +
    '<g class="mja-liquide-g"><ellipse class="mja-liquide" cx="0" cy="-15" rx="72" ry="14"/>' +
    '<ellipse cx="0" cy="-15" rx="72" ry="14" fill="url(#' + g + 'l)"/>' +
    '<g class="mja-tourbillon"><path d="M-40,-15 C-30,-24 10,-24 26,-16 M-24,-10 C-6,-6 22,-8 34,-14" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>' +
    '<g class="mja-bulles-ch"></g>' +
  '</g>';
}

/* ---------- Mélange de peintures (rouge-jaune-bleu → RVB) ---------- */
var PIGMENTS = {
  rouge:{n:'Rouge', ryb:[1,0,0], c:'#e5484d'},
  jaune:{n:'Jaune', ryb:[0,1,0], c:'#f6d23a'},
  bleu:{n:'Bleu', ryb:[0,0,1], c:'#3f7fe0'},
  blanc:{n:'Lait de lune', ryb:null, c:'#f4f1ff'},
  noir:{n:'Charbon', ryb:null, c:'#2e2838'}
};
function rybVersRgb(r, y, b){
  function lerp(a, c, t){ return a + (c - a) * t; }
  var C = [[1,1,1],[1,0,0],[1,1,0],[1,.5,0],[.163,.373,.6],[.5,0,.5],[0,.66,.2],[.2,.094,0]];
  var res = [];
  for(var i = 0; i < 3; i++){
    var x0 = lerp(C[0][i], C[4][i], b), x1 = lerp(C[1][i], C[5][i], b), x2 = lerp(C[2][i], C[6][i], b), x3 = lerp(C[3][i], C[7][i], b);
    var y0 = lerp(x0, x1, r), y1 = lerp(x2, x3, r);
    res.push(lerp(y0, y1, y));
  }
  return res;
}
function couleurMelange(comptes){
  var r = comptes.rouge || 0, j = comptes.jaune || 0, b = comptes.bleu || 0, w = comptes.blanc || 0, k = comptes.noir || 0;
  var m = Math.max(r, j, b);
  var rgb = m > 0 ? rybVersRgb(r / m, j / m, b / m) : [0.55, 0.62, 0.78];
  if(m === 0 && w > 0) rgb = [0.96, 0.95, 1];
  if(m === 0 && w === 0 && k > 0) rgb = [0.18, 0.16, 0.22];
  var tot = r + j + b + w + k;
  if(w > 0 && m > 0){ var t = w / tot * 0.9; rgb = rgb.map(function(v){ return v + (1 - v) * t; }); }
  if(k > 0 && (m > 0 || w > 0)){ var t2 = k / tot * 0.85; rgb = rgb.map(function(v){ return v * (1 - t2); }); }
  return rgb;
}
function rgbCss(rgb){ return 'rgb(' + rgb.map(function(v){ return Math.round(fixe(v, 0, 1) * 255); }).join(',') + ')'; }
function ecartCouleur(a, b){ var s = 0; for(var i = 0; i < 3; i++) s += (a[i] - b[i]) * (a[i] - b[i]); return Math.sqrt(s / 3); }

/* ---------- Petites notes de musique (bulles de mémoire) ---------- */
var audioCtx = null;
function note(freq, duree){
  if(MJ.notesCoupees) return;
  if(window.Brume && Brume.sonActif && !Brume.sonActif()) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    var t = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (duree || 0.4));
    o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + (duree || 0.4) + 0.05);
  }catch(e){}
}
