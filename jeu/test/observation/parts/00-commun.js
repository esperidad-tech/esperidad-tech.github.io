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
    vies: function(rest, max, bouclier){
      var s = '';
      for(var i = 0; i < max; i++) s += '<span class="mjo-coeur' + (bouclier ? ' bouclier' : '') + (i < rest ? '' : ' perdu') + '">' + (bouclier ? BOUCLIER : COEUR) + '</span>';
      vies.innerHTML = s;
    },
    perdVie: function(rest, max, bouclier){
      api.vies(rest, max, bouclier);
      var c = vies.querySelectorAll('.mjo-coeur')[rest];
      if(c) c.classList.add('casse');
    },
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
