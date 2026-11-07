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
    /* la règle des cœurs (mj-core.js) : cœurs affichés = erreurs encore permises ; plus de cœur → on prévient */
    coeurs: function(rest, total, casse){ vies.innerHTML = U.coeurs(rest, total, casse); },
    perdCoeur: function(rest, total){ api.coeurs(rest, total, rest); if(rest === 0) U.plusDeCoeur(el); },
    /* rest = vies restantes (on perd quand il n'en reste plus) : cœurs = vies − 1 */
    vies: function(rest, max){ if(max === undefined) max = rest; api.coeurs(rest - 1, max - 1); },
    perdVie: function(rest, max){ if(rest >= 1) api.perdCoeur(rest - 1, max - 1); },
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

/* ==========================================================
   TRACES (Pisteur) — « Suivre la piste ». Vue du dessus, monde
   BEAUCOUP plus large que l'écran (5 écrans au niveau 3, 8 et plus
   au niveau 9). Le sol défile vers l'avant sans jamais s'arrêter ;
   la caméra suit le Pisteur de côté. Il marche vers le doigt (ou la
   souris) à vitesse limitée et ne voit les empreintes que dans un
   petit cercle devant lui.
   Départ : une ligne droite avec SEULEMENT sa piste. Ensuite, aux
   embranchements et à la sortie des haies, ruisseaux, graviers, la
   piste se sépare en branches qui partent très loin l'une de l'autre :
   à l'écran, jamais plus de quelques pistes. Une erreur vite vue se
   rattrape ; trop tard, la bonne piste sort de l'écran.
   Perdu : la bonne piste n'est plus du tout à l'écran (devant le
   Pisteur) pendant 2 s → « Tu t'es perdu : tu as perdu la trace ! »,
   ou on entre dans une autre arrivée, ou la bonne arrivée défile sans
   qu'on l'atteigne. Gagné : on entre dans l'arrivée de sa piste.
   Jamais de changement de direction dans une zone sans traces
   (gravier, eau, haie, dalles, clôture) : le virage se fait AVANT,
   il faut lire l'angle des derniers pas.
   Mods : zone (cercle de vision plus grand), vitesse (+x : le Pisteur
   marche plus vite, ex. 0.3 = +30 %), lent (le sol défile moins vite),
   temps (+N : défilement un peu plus lent), nuit (vision de nuit :
   toutes les empreintes visibles, floues et pâles au loin, nettes près
   de toi), aide (rappel de l'empreinte dans un coin), revele (après
   chaque obstacle, les pas suivants s'allument un instant), erreurs
   (+N : une mauvaise arrivée ne termine pas la partie).
   params.suspect (facultatif) : 'enfant' | 'femme' | 'homme' | 'sabot'
   | 'botte', ou params.empreinte = {L, W, bout, talon, detail, foulee,
   ouvre} ; params.meteo (essais) : 'bruine' | 'averse' | 'vent' | 'beau'.
   params.vehicule = 'charrette' (enquête 2, le champ rasé) : la piste à
   suivre est une charrette — deux traits de roues + les pieds de celui
   qui la pousse. Pour embrouiller : la brouette (un seul trait de roue),
   la carriole de Fortuné (deux traits bien plus écartés), une autre
   charrette poussée par d'autres pieds.
   ========================================================== */
var EMP_PRESETS = {
  enfant:{nom:'Petite chaussure d\'enfant', L:14.5, W:0.42, bout:'rond', talon:'separe', detail:'aucun', foulee:19, ouvre:6},
  femme:{nom:'Chaussure fine', L:16.5, W:0.37, bout:'rond', talon:'separe', detail:'aucun', foulee:22, ouvre:4},
  homme:{nom:'Grosse chaussure', L:19.5, W:0.43, bout:'carre', talon:'separe', detail:'aucun', foulee:26, ouvre:10},
  sabot:{nom:'Sabot de bois', L:17, W:0.46, bout:'rond', talon:'plein', detail:'aucun', foulee:22, ouvre:8},
  botte:{nom:'Botte', L:18.5, W:0.44, bout:'carre', talon:'plein', detail:'trait', foulee:25, ouvre:6}
};
var BOUTS = ['rond', 'carre'], DETAILS = ['aucun', 'encoche', 'point', 'trait'];
var formesCache = {};
function n1(v){ return (Math.round(v * 10) / 10).toString(); }
/* Forme d'une semelle (pied gauche, pointe vers le haut), centrée sur 0.
   bout : 'rond' (arrondi) | 'carre' (bout plat) ; talon : 'separe' (avant et talon
   bien séparés) | 'plein' (une seule semelle d'un bloc, avec son rebord). */
function formeSemelle(f){
  var cle = [n1(f.L), n1(f.W), f.bout, f.talon, f.detail].join('|');
  if(formesCache[cle]) return formesCache[cle];
  var L = f.L, w = f.L * f.W;
  function P(a, b){ return n1(a * w) + ',' + n1(b * L); }
  var bout = f.bout === 'carre'
    ? ' C' + P(-0.52, -0.38) + ' ' + P(-0.5, -0.5) + ' ' + P(-0.3, -0.5) + ' L' + P(0.32, -0.5) + ' C' + P(0.5, -0.5) + ' ' + P(0.53, -0.38) + ' ' + P(0.5, -0.24)
    : ' C' + P(-0.5, -0.42) + ' ' + P(-0.24, -0.56) + ' ' + P(0.04, -0.54) + ' C' + P(0.34, -0.52) + ' ' + P(0.52, -0.4) + ' ' + P(0.5, -0.24);
  var d, det = '';
  if(f.talon === 'plein'){
    /* une seule semelle : bord continu, taille marquée mais pas coupée */
    d = 'M' + P(-0.5, -0.24) + bout + ' C' + P(0.48, -0.02) + ' ' + P(0.36, 0.12) + ' ' + P(0.37, 0.28) + ' C' + P(0.38, 0.46) + ' ' + P(0.22, 0.53) + ' ' + P(0, 0.53) + ' C' + P(-0.22, 0.53) + ' ' + P(-0.4, 0.46) + ' ' + P(-0.39, 0.28) + ' C' + P(-0.38, 0.12) + ' ' + P(-0.53, -0.02) + ' ' + P(-0.5, -0.24) + ' Z';
    det += '<path class="e-rebord" d="M' + P(-0.28, -0.22) + ' C' + P(-0.28, -0.36) + ' ' + P(0.24, -0.38) + ' ' + P(0.26, -0.22) + ' C' + P(0.26, 0.05) + ' ' + P(0.17, 0.2) + ' ' + P(0.18, 0.32) + ' C' + P(0.18, 0.4) + ' ' + P(-0.18, 0.4) + ' ' + P(-0.2, 0.32) + ' C' + P(-0.2, 0.2) + ' ' + P(-0.28, 0.05) + ' ' + P(-0.28, -0.22) + ' Z"/>';
  } else {
    /* avant du pied, puis un vrai vide, puis le talon */
    d = 'M' + P(-0.5, -0.24) + bout + ' C' + P(0.48, -0.04) + ' ' + P(0.34, 0.06) + ' ' + P(0.3, 0.12) + ' Q' + P(-0.02, 0.17) + ' ' + P(-0.36, 0.11) + ' C' + P(-0.48, 0.02) + ' ' + P(-0.53, -0.1) + ' ' + P(-0.5, -0.24) + ' Z';
    d += ' M' + P(-0.34, 0.28) + ' C' + P(-0.37, 0.46) + ' ' + P(-0.2, 0.53) + ' ' + P(0, 0.53) + ' C' + P(0.2, 0.53) + ' ' + P(0.35, 0.46) + ' ' + P(0.33, 0.28) + ' Q' + P(0, 0.23) + ' ' + P(-0.34, 0.28) + ' Z';
  }
  if(f.detail === 'encoche') det += '<circle class="e-trou" cx="' + n1(-0.37 * w) + '" cy="' + n1(0.4 * L) + '" r="' + n1(0.07 * L) + '"/>';
  else if(f.detail === 'point') det += '<circle class="e-c" cx="' + n1(0.02 * w) + '" cy="' + n1(-0.28 * L) + '" r="' + n1(0.055 * L) + '"/>';
  else if(f.detail === 'trait') det += '<path class="e-r" d="M' + P(-0.2, 0.4) + ' L' + P(0.2, 0.4) + '"/>';
  return (formesCache[cle] = {d:d, det:det});
}
/* ---- Variante charrette : roues.n = nombre de traits de roues (1 : brouette), roues.e = écart entre les deux traits ---- */
var ROUES = {charrette:{n:2, e:34}, brouette:{n:1, e:0}, carriole:{n:2, e:54}};
function charretteCible(){ return Object.assign({}, EMP_PRESETS.homme, {nom:'La charrette et les pieds de celui qui la pousse', roues:ROUES.charrette}); }
function memeVehicule(a, b){ var ra = a.roues, rb = b.roues; if(!ra || !rb) return !ra && !rb; return ra.n === rb.n && Math.abs(ra.e - rb.e) < 8; }
/* Une fausse piste de charrette : la brouette, la carriole (mêmes pieds, autres roues) ou d'autres pieds (même charrette) ;
   dans un même groupe (embranchement, éventail), d'abord des sortes différentes. */
function varianteCharrette(c, n, evite){
  var deja = (evite || []).map(function(v){ return v.sorte; });
  var sortes = U.melanger(['brouette', 'carriole', 'pieds']).sort(function(a, b){ return (deja.indexOf(a) >= 0 ? 1 : 0) - (deja.indexOf(b) >= 0 ? 1 : 0); });
  var s = sortes[0], v;
  if(s === 'pieds') v = Object.assign(variante(c, n, (evite || []).filter(function(x){ return x.sorte === 'pieds'; })), {roues:c.roues});
  else v = Object.assign({}, c, {roues:ROUES[s]});
  v.sorte = s;
  if(evite) evite.push(v);
  return v;
}
/* La carte du départ (et le rappel de l'aide) : l'empreinte, ou pour une charrette ses traits de roues et deux pas, vus de dessus */
function traceCarte(f, taille){
  if(!f.roues) return empreinteCarte(f, taille);
  var s = formeSemelle(f), r = f.roues, H = f.L * 3, Wd = Math.max(r.e, f.L) + 24, k = (taille || 70) / H, rr = '';
  (r.n === 1 ? [0] : [-r.e / 2, r.e / 2]).forEach(function(o){ rr += '<rect class="e-roue" x="' + n1(o - 2.6) + '" y="' + n1(-H / 2) + '" width="5.2" height="' + n1(H) + '" rx="2.6"/>'; });
  return '<svg class="mja-empr-carte" viewBox="' + n1(-Wd / 2) + ' ' + n1(-H / 2) + ' ' + n1(Wd) + ' ' + n1(H) + '" width="' + Math.round(Wd * k) + '" height="' + Math.round(taille || 70) + '" aria-hidden="true"><g class="mja-empr">' + rr + '</g>' +
    '<g class="mja-empr" transform="translate(' + n1(-f.L * 0.3) + ',' + n1(f.L * 0.6) + ')"><path class="e-f" d="' + s.d + '"/>' + s.det + '</g>' +
    '<g class="mja-empr" transform="translate(' + n1(f.L * 0.3) + ',' + n1(-f.L * 0.6) + ') scale(-1,1)"><path class="e-f" d="' + s.d + '"/>' + s.det + '</g></svg>';
}
function empreinteCarte(f, taille){
  var s = formeSemelle(f), h = f.L * 1.25, k = (taille || 70) / h;
  return '<svg class="mja-empr-carte" viewBox="' + n1(-h * 0.75) + ' ' + n1(-h / 2) + ' ' + n1(h * 1.5) + ' ' + n1(h) + '" width="' + Math.round(h * 1.5 * k) + '" height="' + Math.round(taille || 70) + '" aria-hidden="true">' +
    '<g class="mja-empr" transform="translate(' + n1(-f.L * 0.32) + ',' + n1(f.L * 0.08) + ')"><path class="e-f" d="' + s.d + '"/>' + s.det + '</g>' +
    '<g class="mja-empr" transform="translate(' + n1(f.L * 0.32) + ',' + n1(-f.L * 0.08) + ') scale(-1,1)"><path class="e-f" d="' + s.d + '"/>' + s.det + '</g></svg>';
}
/* Deux empreintes « pareilles » : même forme (bout, talon, détail, largeur) ET même taille (moins de 9 % d'écart).
   La piste à suivre doit être UNIQUE : aucune autre piste de la carte ne lui est pareille. */
function memeEmpreinte(a, b){
  return a.bout === b.bout && a.talon === b.talon && a.detail === b.detail && Math.abs(a.W - b.W) < 0.03 &&
    Math.abs(a.L - b.L) / Math.min(a.L, b.L) < 0.09;
}
/* Une fausse piste « de la même famille » : toujours une VRAIE différence visible — autre taille (au moins
   +11 %, souvent la même chaussure en plus grand), autre bout, autre talon ou autre petit détail —, plus
   parfois une foulée ou un angle de pied un peu différents. evite : empreintes déjà prises dans le même groupe. */
function variante(c, n, evite){
  var amp = Math.max(0.11, courbe(n, {1:0.3, 3:0.2, 6:0.14, 9:0.11, 12:0.11}));
  function sgn(){ return Math.random() < 0.5 ? -1 : 1; }
  var poids = n <= 2 ? ['taille', 'bout', 'talon', 'detail'] : ['taille', 'taille', 'bout', 'talon', 'talon', 'detail'];
  for(var essai = 0; essai < 60; essai++){
    var v = Object.assign({}, c), trait = U.choix(poids);
    if(trait === 'taille'){
      var k = c.L < 16 ? 1 : (c.L > 19 ? -1 : sgn()), a = amp * U.rand(1, 1.35);
      v.L = c.L * (1 + k * a); v.foulee = c.foulee * (1 + k * a * 0.85);
    }
    else if(trait === 'bout') v.bout = c.bout === 'rond' ? 'carre' : 'rond';
    else if(trait === 'talon') v.talon = c.talon === 'plein' ? 'separe' : 'plein';
    else v.detail = U.choix(DETAILS.filter(function(d){ return d !== c.detail; }));
    if(n <= 2 && trait !== 'taille'){ var s2 = Math.random() < 0.5 ? 1 : -1; v.L = c.L * (1 + s2 * 0.2); v.foulee = c.foulee * (1 + s2 * 0.17); }
    if(Math.random() < 0.4) v.foulee *= 1 + sgn() * 0.08;
    if(Math.random() < 0.3) v.ouvre = c.ouvre + sgn() * 8;
    if(memeEmpreinte(v, c)) continue;
    if(evite && evite.some(function(e){ return memeEmpreinte(v, e); })) continue;
    if(evite) evite.push(v);
    return v;
  }
  var w = Object.assign({}, c); w.L = c.L * 1.3; w.foulee = c.foulee * 1.25; if(evite) evite.push(w); return w;
}
/* Une piste = des segments droits (pente m = dx/dd) reliés par de petits virages
   arrondis (largeur ±V) qu'on ne place jamais dans une zone sans traces. */
var VIR = 20;
function Trace(noeuds){
  for(var i = 1; i < noeuds.length; i++) noeuds[i].x = noeuds[i - 1].x + noeuds[i - 1].m * (noeuds[i].d - noeuds[i - 1].d);
  var k = 0, n = noeuds;
  return {n:n, x:function(d){
    if(d <= n[0].d) return n[0].x + n[0].m * (d - n[0].d);
    if(k >= n.length || n[k].d > d) k = 0;
    while(k < n.length - 1 && n[k + 1].d <= d) k++;
    var a = n[k], x = a.x + a.m * (d - a.d);
    if(k > 0 && d - a.d < VIR){ var p0 = a.x - n[k - 1].m * VIR, p2 = a.x + a.m * VIR, t = (d - a.d + VIR) / (2 * VIR); return (1 - t) * (1 - t) * p0 + 2 * t * (1 - t) * a.x + t * t * p2; }
    if(k < n.length - 1 && n[k + 1].d - d < VIR){ var b = n[k + 1], q0 = b.x - a.m * VIR, q2 = b.x + b.m * VIR, u = (d - b.d + VIR) / (2 * VIR); return (1 - u) * (1 - u) * q0 + 2 * u * (1 - u) * b.x + u * u * q2; }
    return x;
  }, pente:function(d){ var h = this.x(d + 3) - this.x(d - 3); return h / 6; }};
}
var NOMS_OBST = {gravier:'gravier', haie:'haies', eau:'ruisseaux et flaques', dalles:'grandes dalles', cloture:'clôtures'};
function genererMonde(p){
  /* D0 : la ligne droite du départ, avec seulement la bonne piste (230 avant la partie raccourcie du 4 nov.) */
  var W = p.largeur * 360, X0 = W / 2, D0 = 150, FIN = 200, zones = [], fourches = [];
  var EP = {haie:null, eau:null, dalles:[90, 120], cloture:[30, 30]};
  var evts = U.melanger(p.obstaclesListe.map(function(t){ return {type:t}; }).concat(Array.apply(null, Array(p.fourches)).map(function(){ return {type:'fourche'}; })));
  var noeuds = [{d:-900, x:X0, m:0}], dern = noeuds[0];
  function xA(d){ return dern.x + dern.m * (d - dern.d); }
  function vire(d, m){ var x = xA(d); dern = {d:d, x:x, m:m}; noeuds.push(dern); }
  function borne(x, m, long){
    var xf = x + m * (long || 320);
    if(xf < W * 0.12 || xf > W * 0.88){ m = -m; xf = x + m * (long || 320); if(xf < W * 0.12 || xf > W * 0.88) m = (X0 - x) / 700; }
    return fixe(m, -p.penteMax, p.penteMax);
  }
  var d = D0, verrou = null;
  /* après un embranchement, la bonne piste continue de s'écarter un moment */
  function penteLibre(dd){
    if(verrou && dd < verrou.fin){ var xv = xA(dd); if((verrou.signe < 0 && xv < W * 0.2) || (verrou.signe > 0 && xv > W * 0.8)) verrou = null; else { var m0 = verrou.signe * U.rand(0.5, Math.max(0.6, p.ampli)); return fixe(m0, -p.penteMax, p.penteMax); } }
    return borne(xA(dd), U.rand(-p.ampli, p.ampli));
  }
  evts.forEach(function(ev){
    var gap = U.rand(150, 215), nt = Math.random() < 0.55 ? 1 : 2;
    for(var k = 1; k <= nt; k++){
      var dt = d + gap * k / (nt + 1), mL = penteLibre(dt);
      /* avant un embranchement, on revient vers le milieu de la forêt : les deux branches auront de la place */
      if(ev.type === 'fourche' && !(verrou && dt < verrou.fin)) mL = fixe((X0 - xA(dt)) / Math.max(60, d + gap - dt) * 0.8 + U.rand(-0.15, 0.15), -p.penteMax, p.penteMax);
      vire(dt, mL);
    }
    d += gap;
    if(ev.type === 'fourche'){
      var x = xA(d), roomG = x - 80, roomD = W - 80 - x;
      /* la fausse branche part du côté où elle a la place de s'éloigner (≈ 500), la bonne de l'autre */
      var okD = roomD >= 500 && roomG >= 380, okG = roomG >= 500 && roomD >= 380;
      var cote = okD && okG ? (Math.random() < 0.5 ? 1 : -1) : (okD ? 1 : (okG ? -1 : (roomD > roomG ? 1 : -1)));
      var mt = fixe(-cote * p.ecart * U.rand(0.35, 0.5), -p.penteMax, p.penteMax);
      var md = fixe(mt + cote * p.ecart, -1.75, 1.75);
      vire(d, mt);
      var f = {d:d, x:x, mt:mt, pentes:[md]};
      if(Math.random() < p.triple) f.pentes.push(fixe(mt - cote * p.ecart * 0.85, -1.75, 1.75));
      fourches.push(f);
      verrou = {fin:d + 360, signe:mt < 0 ? -1 : 1};
      d += VIR + 60;
    } else {
      var z = {type:ev.type, mAvant:dern.m};
      if(ev.type === 'gravier'){
        var sd = (verrou && d < verrou.fin ? verrou.signe : (Math.random() < 0.5 ? -1 : 1)) * p.diag * U.rand(0.8, 1.15);
        if(!(verrou && d < verrou.fin)) sd = borne(xA(d), sd, 260);
        sd = fixe(sd, -p.penteMax, p.penteMax);
        if(Math.abs(sd - z.mAvant) < 0.35) sd = fixe(sd + (sd >= z.mAvant ? 0.45 : -0.45), -p.penteMax, p.penteMax);
        vire(d, sd);
        z.d0 = d + VIR + 48; z.d1 = z.d0 + U.rand(40, p.gravierMax);
      } else {
        if(Math.abs(dern.m) > 0.9 && !(verrou && d < verrou.fin)) vire(d, borne(xA(d), dern.m * 0.6));
        var r0 = Math.random(), ep;
        if(ev.type === 'eau') ep = r0 < 0.4 ? 24 : (r0 < 0.75 ? 54 : U.rand(88, 110));
        else if(ev.type === 'haie') ep = r0 < 0.5 ? U.rand(34, 44) : (r0 < 0.8 ? U.rand(62, 80) : U.rand(96, 124));
        else ep = U.rand(EP[ev.type][0], EP[ev.type][1]);
        z.d0 = d + VIR + 22; z.d1 = z.d0 + ep;
      }
      z.x0 = xA(z.d0); z.x1 = xA(z.d1); z.m = dern.m;
      zones.push(z);
      d = z.d1 + VIR + 28;
    }
  });
  vire(d + 60, borne(xA(d + 60), U.rand(-p.ampli, p.ampli) * 0.6));
  var L = d + FIN;   /* l'arrivée, après le dernier obstacle (300 avant le 4 nov.) */
  /* garde-fou : si la piste frôle un bord, on recommence la carte */
  for(var dd0 = 0; dd0 < L; dd0 += 40){ var xx0 = (function(dd){ var k = 0; while(k < noeuds.length - 1 && noeuds[k + 1].d <= dd) k++; return noeuds[k].x + noeuds[k].m * (dd - noeuds[k].d); })(dd0); if(xx0 < W * 0.06 || xx0 > W * 0.94){ if((p._essaiCarte = (p._essaiCarte || 0) + 1) < 25) return genererMonde(p); break; } }
  p._essaiCarte = 0;
  noeuds.push({d:L + 400, m:0});
  var cible = Trace(noeuds);
  cible.debut = 20; cible.fin = L - 12; cible.vrai = true; cible.f = p.empreinte;
  function dansZone(dd, marge){ for(var i = 0; i < zones.length; i++){ if(dd > zones[i].d0 - marge && dd < zones[i].d1 + marge) return zones[i]; } return null; }
  function libre(dd){ var z; while((z = dansZone(dd, VIR + 8))) dd = z.d1 + VIR + 10; return dd; }
  /* arrivées : une seule par écran */
  var arrivees = [{x:cible.x(L), d:L, trace:cible, cible:true}];
  function placeLibre(x, dd){ if(x < 50 || x > W - 50) return false; if(dansZone(dd, 30)) return false; if(dd < L + 40 && Math.abs(x - cible.x(dd)) < 64) return false; return arrivees.every(function(a){ return Math.abs(a.d - dd) > 560 || Math.abs(a.x - x) > 420; }); }
  var leurres = [];
  /* l'empreinte d'une fausse piste (variante charrette : un autre véhicule, ou d'autres pieds) */
  function faux(groupe){ return p.vehicule === 'charrette' && p.empreinte.roues ? varianteCharrette(p.empreinte, p.niveau, groupe) : variante(p.empreinte, p.niveau, groupe); }
  function ajoute(tr, f, dS, dFin){
    tr.f = f; tr.debut = dS + 4; tr.fin = dFin - 12; tr.vrai = false;
    var a = {x:tr.x(dFin), d:dFin, trace:tr, cible:false}; arrivees.push(a); tr.arrivee = a;
    leurres.push(tr); return leurres.length - 1;
  }
  /* fausse piste longue : part fort de côté, s'éloigne, finit loin */
  function longue(dS, xS, mS, groupe){
    var nds = [{d:dS - 1, x:xS - mS, m:mS}], der = nds[0];
    function xa(dd){ return der.x + der.m * (dd - der.d); }
    var dd = dS + U.rand(260, 420);
    while(dd < L + 700){
      dd = libre(dd);
      var xL = xa(dd), sep = xL - cible.x(dd), sg = sep >= 0 ? 1 : -1;
      var m = Math.abs(sep) < 300 ? sg * U.rand(0.55, 0.95) : sg * U.rand(-0.15, 0.7);
      if(xL + m * 260 < 70 || xL + m * 260 > W - 70) m = (xL < W / 2 ? 1 : -1) * U.rand(0, 0.25);
      der = {d:dd, x:xa(dd), m:m}; nds.push(der);
      dd += U.rand(170, 260);
    }
    nds.push({d:L + 1200, m:0});
    var tr = Trace(nds);
    for(var e = 0; e < 40; e++){
      var dFin = U.rand(dS + 650, L + 650), x = tr.x(dFin);
      if(placeLibre(x, dFin)) return ajoute(tr, faux(groupe), dS, dFin);
    }
    return ajoute(tr, faux(groupe), dS, L + 1100 + U.rand(0, 400));
  }
  /* fausse piste courte : diverge peu, finit vite dans une arrivée (cul-de-sac) */
  function courte(dS, xS, mS, groupe){
    var lg = U.rand(170, 230), dFin = dS + lg, tr = Trace([{d:dS - 1, x:xS - mS, m:mS}, {d:dFin + 100, m:mS}]);
    if(!placeLibre(tr.x(dFin), dFin)) return -1;
    return ajoute(tr, faux(groupe), dS, dFin);
  }
  fourches.forEach(function(f){ var g = []; f.leurres = f.pentes.map(function(m){ return longue(f.d + 2, f.x, m, g); }); });
  zones.forEach(function(z){
    z.leurres = []; z.court = -1; var groupe = [];
    var nb = p.eventail[z.type] || 0, offs = [], tries = 0;
    if(z.type === 'gravier'){ var xn = z.x0 + z.mAvant * (z.d1 - z.d0); if(Math.abs(xn - z.x1) > 30) offs.push(xn - z.x1); }
    while(offs.length < nb && tries++ < 60){
      var o = (Math.random() < 0.5 ? -1 : 1) * U.rand(26, 72);
      if(offs.every(function(q){ return Math.abs(q - o) > 22; })) offs.push(o);
    }
    offs.slice(0, nb).forEach(function(o, i){
      var xS = z.x1 + o, sg = o >= 0 ? 1 : -1, id;
      if(i === 0 && nb >= 2 && z.court < 0){ id = courte(z.d1 + 3, xS, z.m + sg * U.rand(0.45, 0.7), groupe); if(id >= 0){ z.court = id; z.leurres.push(id); return; } }
      id = longue(z.d1 + 3, xS, fixe(z.m + sg * U.rand(1.0, p.ecart), -1.75, 1.75), groupe);
      z.leurres.push(id);
    });
  });
  /* dalles le long de la piste (elle y est droite), flaques à côté */
  var dalles = [], flaques = [], rochers = [];
  zones.forEach(function(z){
    if(z.type === 'dalles'){ for(var dd = z.d0 + 14; dd < z.d1 - 8; dd += U.rand(30, 40)) dalles.push({d:dd, x:cible.x(dd) + U.rand(-9, 9), r:U.rand(17, 26), a:U.rand(0, 6)}); for(var k = 0; k < 6; k++){ var dr = U.rand(z.d0, z.d1), xr = cible.x(dr) + (Math.random() < 0.5 ? -1 : 1) * U.rand(60, 170); rochers.push({d:dr, x:xr, r:U.rand(14, 22)}); } }
    if(z.type === 'eau'){ for(var k2 = 0; k2 < 3; k2++){ var dq = z.d1 + U.rand(20, 130), xq = cible.x(dq) + (Math.random() < 0.5 ? -1 : 1) * U.rand(45, 140); flaques.push({d:dq, x:xq, rx:U.rand(16, 26), ry:U.rand(9, 14)}); } }
  });
  return {W:W, X0:X0, D0:D0, L:L, zones:zones, fourches:fourches, cible:cible, leurres:leurres, arrivees:arrivees, dalles:dalles, flaques:flaques, rochers:rochers};
}
var ARRIVEES_ART = {
  buisson:'<path d="M-17,8 C-22,-4 -12,-16 -2,-13 C4,-20 18,-14 16,-4 C24,0 20,12 10,12 C2,17 -10,16 -13,11 C-20,12 -21,8 -17,8 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-5" cy="-3" r="2.3" fill="#e5484d"/><circle cx="7" cy="3" r="2.3" fill="#e5484d"/><ellipse cx="0" cy="9" rx="7" ry="4" fill="#14111f"/>',
  porte:'<rect x="-15" y="-16" width="30" height="26" rx="3" fill="#7a5a3e" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-15,-16 L0,-26 L15,-16" fill="#a8743f" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/><rect x="-6" y="-4" width="12" height="14" rx="5" fill="#3b2a1e" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="3" cy="3" r="1.4" fill="#ffd36a"/>',
  creux:'<circle r="16" fill="#6e4424" stroke="' + CONTOUR + '" stroke-width="3"/><circle r="11" fill="none" stroke="#8a5a33" stroke-width="2"/><ellipse cx="0" cy="3" rx="7" ry="8" fill="#14111f"/>',
  terrier:'<path d="M-16,8 C-16,-8 16,-8 16,8 Z" fill="#7a6250" stroke="' + CONTOUR + '" stroke-width="3"/><ellipse cx="0" cy="5" rx="8" ry="6" fill="#14111f"/><circle cx="-12" cy="-6" r="3" fill="#8b7a62" stroke="' + CONTOUR + '" stroke-width="1.5"/>',
  grotte:'<path d="M-18,10 L-14,-8 L-4,-16 L8,-14 L17,-4 L18,10 Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/><path d="M-7,10 C-7,-2 7,-2 7,10 Z" fill="#14111f"/>',
  tonneau:'<ellipse cx="0" cy="0" rx="15" ry="13" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="3"/><ellipse cx="0" cy="0" rx="9" ry="8" fill="#14111f"/><path d="M-15,-4 L15,-4" stroke="#3b3346" stroke-width="2" opacity=".6"/>'
};
MJ.enregistrer('traces', {
  nom:'Suivre la piste', role:'pisteur', ic:'👣',
  consigne:function(p){ return p && p.vehicule === 'charrette' ? 'Retiens bien les traces du départ : deux traits de roues et les pieds de celui qui pousse la charrette. Puis guide le Pisteur du doigt sur CETTE piste jusqu\'à son arrivée, sans la perdre de vue !' :
    'Retiens bien l\'empreinte du départ, puis guide le Pisteur du doigt sur SA piste jusqu\'à son arrivée, sans jamais la perdre de vue !'; },
  ROUES:ROUES,
  minuteur:false,
  reglages: function(n, mods){
    var p = {niveau:n};
    var t = Math.min(6, mods.temps || 0);
    p.defile = courbe(n, {1:20, 3:24, 6:29, 9:34, 12:38}) * (mods.lent || 1) / (1 + 0.06 * t);
    p.marche = 52 * (1 + (mods.vitesse || 0));
    p.vision = courbe(n, {1:36, 3:31, 6:28, 9:25, 12:23}) * (mods.zone || 1);
    p.largeur = courbe(n, {1:4, 3:5, 6:7, 9:8.5, 12:10});
    /* Romain, 4 nov. : « c'est beaucoup trop long » → une partie deux fois plus courte à chaque niveau :
       environ deux fois moins d'embranchements et d'obstacles (avant : 1 à 4 embranchements, 3 à 8 obstacles ;
       maintenant 1 à 2 embranchements et 1 à 4 obstacles), et un départ et une arrivée un peu plus courts
       (genererMonde). Chaque obstacle et chaque embranchement restent aussi durs qu'avant.
       Arrondi au hasard (1,8 obstacle = 2 obstacles 8 fois sur 10) : la durée moyenne suit le niveau sans à-coups. */
    function auHasard(x){ return Math.floor(x + Math.random()); }
    p.fourches = auHasard(courbe(n, {1:1, 5:1, 8:2, 12:2.5}));
    var nbObst = auHasard(courbe(n, {1:1, 3:1.8, 6:2.7, 9:3.6, 12:4.2}));
    /* les obstacles sont tirés parmi ceux de l'ancienne piste du même niveau : dalles et clôtures restent pour les grands niveaux */
    var sac = ['gravier', 'haie', 'eau', 'gravier', 'dalles', 'cloture', 'haie', 'gravier', 'eau'];
    p.obstaclesListe = U.melanger(sac.slice(0, entier(n, {1:3, 3:4, 6:6, 9:8, 12:9}))).slice(0, nbObst);
    p.eventail = {gravier:entier(n, {1:1, 3:2, 6:3, 9:3}), haie:entier(n, {1:2, 3:3, 6:4, 9:4}), eau:entier(n, {1:1, 3:2, 6:2, 9:3}), dalles:entier(n, {1:0, 6:1, 9:2}), cloture:entier(n, {1:0, 3:1, 9:2})};
    p.ecart = courbe(n, {1:1.8, 3:2.4, 6:2.5, 9:2.6, 12:2.7});
    var v0 = courbe(n, {1:20, 3:24, 6:29, 9:34, 12:38});
    p.penteMax = Math.min(1.25, 0.85 * Math.sqrt(Math.max(1, 52 * 52 - v0 * v0)) / v0);
    p.ampli = Math.min(p.penteMax, courbe(n, {1:0.5, 3:0.75, 6:0.95, 9:1.1}));
    p.diag = Math.min(p.penteMax, courbe(n, {1:0.55, 3:0.8, 6:0.95, 9:1.05}));
    p.gravierMax = courbe(n, {1:110, 3:170, 6:230, 9:260});
    p.triple = courbe(n, {1:0, 5:0, 6:0.3, 9:0.5});
    p.bruine = courbe(n, {1:0, 2:0, 3:0.25, 6:0.35, 9:0.4});
    p.averse = courbe(n, {1:0, 2:0, 3:0.15, 6:0.3, 9:0.45});
    p.vent = courbe(n, {1:0, 2:0, 3:0.3, 6:0.5, 9:0.7});
    p.grace = 2;
    p.essais = 1 + (mods.erreurs || 0);
    p.nuit = !!mods.nuit; p.aide = !!mods.aide; p.revele = !!mods.revele;
    p.suspect = U.choix(Object.keys(EMP_PRESETS));
    var obstNoms = []; p.obstaclesListe.forEach(function(o){ if(obstNoms.indexOf(NOMS_OBST[o]) < 0) obstNoms.push(NOMS_OBST[o]); });
    var meteo = [];
    if(p.bruine > 0) meteo.push('bruine'); if(p.averse > 0) meteo.push('grosse pluie'); if(p.vent > 0) meteo.push('vent');
    p.lignes = [
      {nom:'Taille de ta vision', val:p.vision < 27 ? 'toute petite' : (p.vision < 33 ? 'petite' : (p.vision < 42 ? 'moyenne' : 'grande'))},
      {nom:'Vitesse du Pisteur', val:(mods.vitesse || 0) > 0 ? 'rapide (+' + Math.round(mods.vitesse * 100) + ' %)' : 'normale'},
      {nom:'Le sol défile', val:p.defile < 22 ? 'lentement' : (p.defile < 30 ? 'moyennement' : 'vite')},
      {nom:'Largeur de la forêt', val:Math.round(p.largeur) + ' écrans'},
      {nom:'Embranchements', val:p.fourches + ' + des pistes qui surgissent derrière les obstacles'},
      {nom:'Fausses pistes', val:n <= 2 ? 'assez différentes' : (n <= 5 ? 'ressemblantes' : 'presque pareilles')},
      {nom:'Obstacles', val:obstNoms.join(', ')},
      {nom:'Météo', val:meteo.length ? meteo.join(', ') + ' possibles' : 'beau temps'}
    ];
    if(p.essais > 1) p.lignes.push({nom:'Mauvaises arrivées permises', val:String(p.essais - 1)});
    if(p.nuit) p.lignes.push({nom:'Vision de nuit', val:'toutes les traces, floues au loin'});
    if(p.aide) p.lignes.push({nom:'Rappel de l\'empreinte', val:'dans un coin'});
    if(p.revele) p.lignes.push({nom:'Après un obstacle', val:'les pas suivants s\'allument'});
    return p;
  },
  /* Vérification (banc d'essai) : sur nb cartes au niveau n, la piste à suivre est-elle unique, aucun
     embranchement ni éventail ne donne deux branches pareilles, et aucun virage dans une zone sans traces ? */
  verifier: function(n, nb){
    var r = {cartes:0, pistes:0, pareilleCible:0, fourchePareille:0, eventailPareil:0, virageDansZone:0, exemples:[]};
    for(var k = 0; k < (nb || 200); k++){
      var p = MJ.reglages('traces', n, {}, {brut:true}); p.empreinte = EMP_PRESETS[p.suspect];   /* n : le niveau du jeu tel quel */
      var M = genererMonde(p), C = M.cible.f;
      r.cartes++; r.pistes += M.leurres.length + 1;
      M.leurres.forEach(function(l){ if(memeEmpreinte(l.f, C)) r.pareilleCible++; });
      function pareils(liste){ for(var i = 0; i < liste.length; i++) for(var j = i + 1; j < liste.length; j++) if(memeEmpreinte(liste[i], liste[j])) return true; return false; }
      M.fourches.forEach(function(f){ if(pareils([C].concat(f.leurres.filter(function(i){ return i >= 0; }).map(function(i){ return M.leurres[i].f; })))) r.fourchePareille++; });
      M.zones.forEach(function(z){ if(pareils([C].concat(z.leurres.filter(function(i){ return i >= 0; }).map(function(i){ return M.leurres[i].f; })))) r.eventailPareil++; });
      [M.cible].concat(M.leurres).forEach(function(t, it){
        t.n.forEach(function(nd, i){
          if(i === 0 || Math.abs(nd.m - t.n[i - 1].m) < 0.005 || nd.d > t.fin) return;
          M.zones.forEach(function(z){ if(nd.d > z.d0 - VIR && nd.d < z.d1 + VIR){ r.virageDansZone++; if(r.exemples.length < 4) r.exemples.push({piste:it ? 'leurre' : 'cible', type:z.type, d:Math.round(nd.d), z:[Math.round(z.d0), Math.round(z.d1)]}); } });
        });
      });
    }
    return r;
  },
  demo: function(el, prm){
    /* variante charrette : la bonne piste a deux traits de roues, la fausse (une brouette) un seul */
    var ch = !!(prm && prm.vehicule === 'charrette');
    var f = ch ? charretteCible() : EMP_PRESETS.enfant, g = ch ? Object.assign({}, f, {roues:ROUES.brouette}) : variante(EMP_PRESETS.enfant, 9);
    if(!ch){ g.L = 17.5; g.foulee = 23; }
    el.innerHTML = '<svg class="mja-demo-svg mja-traces" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice"><rect x="-200" y="-20" width="700" height="210" fill="#5b5236"/>' +
      '<g class="dm"></g><circle class="dv" r="30" fill="#fff4d6" fill-opacity=".14" stroke="#8ff3ff" stroke-width="1.6" stroke-dasharray="4 4"/>' +
      '<g class="dj"><ellipse cx="0" cy="6" rx="10" ry="4" fill="#000" opacity=".3"/><circle r="8" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-4,-2 C-2,-6 2,-6 4,-2" stroke="#bff0cf" stroke-width="1.6" fill="none"/></g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), gm = svg.querySelector('.dm'), j = svg.querySelector('.dj'), cv = svg.querySelector('.dv'), main = svg.querySelector('.mja-main');
    var s1 = formeSemelle(f), s2 = formeSemelle(g), prints = [];
    function xb(y){ return y > 40 ? 150 : 150 - (40 - y) * 1.1; }
    function xl(y){ return y > 40 ? 150 : 150 + (40 - y) * 1.1; }
    var pasY = ch ? 22 : 18;
    /* un bout de trait de roue : décalé de côté (o), dans le sens de la piste (a, en degrés) */
    function roue(x, y, o, a){ var r = a / 57.3; prints.push({x:x + o * Math.cos(r), y:y + o * Math.sin(r), a:a, h:pasY * 1.12 / Math.cos(r), roue:true}); }
    for(var y = 260, i = 0; y > -320; y -= pasY, i++){
      if(ch){ var ab = y > 40 ? 0 : -47.7; roue(xb(y), y, -17, ab); roue(xb(y), y, 17, ab); if(y < 36) roue(xl(y), y, 0, 47.7); }
      prints.push({x:xb(y) + (i % 2 ? 4 : -4), y:y, s:s1, sx:i % 2 ? -1 : 1});
      if(y < 36) prints.push({x:xl(y) + (i % 2 ? 4 : -4), y:y, s:s2, sx:i % 2 ? -1 : 1});
    }
    gm.innerHTML = prints.map(function(q){
      if(q.roue) return '<g class="mja-empr" transform="translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') rotate(' + q.a + ')"><rect class="e-roue" x="-2.6" y="' + (-q.h / 2).toFixed(1) + '" width="5.2" height="' + q.h.toFixed(1) + '" rx="2.6"/></g>';
      return '<g class="mja-empr" transform="translate(' + q.x.toFixed(1) + ',' + q.y + ') scale(' + q.sx + ',1)"><path class="e-f" d="' + q.s.d + '"/>' + q.s.det + '</g>';
    }).join('');
    var els = gm.querySelectorAll('.mja-empr');
    main.style.transition = 'none';
    return demoBoucle(svg, function(dt, t){
      var c = (t % 6) / 6, dec = c * 360, dW = 120 - dec, xW = xb(dW), camX = xW;
      gm.setAttribute('transform', 'translate(' + (150 - camX).toFixed(1) + ',' + dec.toFixed(1) + ')');
      j.setAttribute('transform', 'translate(150,120)');
      cv.setAttribute('cx', 150); cv.setAttribute('cy', 106);
      for(var k = 0; k < els.length; k++){ var q = prints[k], dd = Math.hypot(q.x - camX, q.y + dec - 106); els[k].style.opacity = dd < 32 ? 1 : 0.07; }
      main.style.transform = 'translate(160px,148px)';
    });
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var ch = p.vehicule === 'charrette';
    var cibleF = p.empreinte || (ch ? charretteCible() : null) || EMP_PRESETS[p.suspect] || EMP_PRESETS.enfant;
    p.empreinte = cibleF;
    var hud = creerHud(el);
    var essais = p.essais;
    hud.vies(essais, p.essais);
    hud.barre(0);
    if(p.aide){ var badge = hud.badge(traceCarte(cibleF, 30)); badge.classList.add('large'); }
    /* params.decor = 'nuit' (enquête 2 : suivre Bastien, la nuit) : le même jeu, en plus sombre */
    var terrain = U.html('<div class="mja-terrain mja-traces' + (p.decor === 'nuit' ? ' mja-traces-nuit' : '') + '"></div>');
    el.appendChild(terrain);
    var M = genererMonde(p), cible = M.cible, YB = 430, W = M.W, L = M.L;
    var id = nid('tr');
    /* météo : une pluie (bruine ou averse) sur une partie du chemin, du vent sur une autre */
    var meteo = {bruine:null, averse:null, vent:null}, tout = [M.D0 - 80, L + 2000];
    if(p.meteo === 'bruine' || p.meteo === 'averse' || p.meteo === 'vent') meteo[p.meteo] = tout;
    else if(!p.meteo){
      var r = Math.random(), a0 = U.rand(M.D0 + 60, L * 0.5), a1 = a0 + L * U.rand(0.3, 0.5);
      if(r < p.averse) meteo.averse = [a0, a1]; else if(r < p.averse + p.bruine) meteo.bruine = [a0, a1];
      if(Math.random() < p.vent){ var b0 = U.rand(M.D0 + 60, L * 0.6); meteo.vent = [b0, b0 + L * U.rand(0.25, 0.45)]; }
    }
    /* grosse pluie : deux motifs de traits déplacés par la boucle (pas d'animation CSS par trait) */
    function motifPluie(pid, n, taille){ var t2 = ''; for(var i = 0; i < n; i++){ var xr = U.rand(0, taille), yr = U.rand(0, taille); t2 += '<path d="M' + xr.toFixed(0) + ',' + yr.toFixed(0) + ' l-9,26"/>'; } return '<pattern id="' + pid + '" class="mja-motif-pluie" width="' + taille + '" height="' + taille + '" patternUnits="userSpaceOnUse">' + t2 + '</pattern>'; }
    var lignesPluie = '<defs>' + motifPluie(id + 'p1', 9, 130) + motifPluie(id + 'p2', 7, 97) + '</defs><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'p1)"/><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'p2)" opacity=".7"/>';
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' +
      '<defs><radialGradient id="' + id + 'n" class="mja-gr-nuit" cx="180" cy="300" r="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#090a1c" stop-opacity="0"/><stop offset=".45" stop-color="#090a1c" stop-opacity=".25"/><stop offset="1" stop-color="#090a1c" stop-opacity=".8"/></radialGradient>' +
        '<radialGradient id="' + id + 'b" class="mja-gr-bruine" cx="180" cy="300" r="250" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8f97a8" stop-opacity=".06"/><stop offset=".22" stop-color="#8f97a8" stop-opacity=".14"/><stop offset=".5" stop-color="#9aa2b4" stop-opacity=".4"/><stop offset="1" stop-color="#a7aebd" stop-opacity=".66"/></radialGradient>' +
        '<pattern id="' + id + 'g" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#9a907c"/><circle cx="3" cy="4" r="2.2" fill="#b8ad96"/><circle cx="11" cy="3" r="1.8" fill="#7d7462"/><circle cx="7" cy="11" r="2.4" fill="#ada28a"/><circle cx="14" cy="12" r="1.6" fill="#857b68"/><circle cx="2" cy="13" r="1.3" fill="#c4b9a2"/></pattern>' +
        '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e6f9a"/><stop offset=".5" stop-color="#3f8fc0"/><stop offset="1" stop-color="#2a5f86"/></linearGradient></defs>' +
      '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="#5b5236"/>' +
      '<g class="mja-monde"><g class="mja-deco"></g><g class="mja-sol-z"></g><g class="mja-flous"></g><g class="mja-marques"></g><g class="mja-haut-z"></g><g class="mja-arr"></g></g>' +
      '<circle class="mja-vision-sol" r="30"/>' +
      '<g class="mja-pisteur-g"><ellipse cx="0" cy="6" rx="12" ry="5" fill="#000" opacity=".35"/>' +
        '<g class="mja-pisteur-corps" transform="scale(.72)"><path d="M-15,4 C-17,18 -8,28 0,30 C8,28 17,18 15,4 Z" fill="#245e3c" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M-6,-14 L-11,14 M9,-12 C17,-4 17,8 9,16" stroke="#8a5a33" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="2" rx="17" ry="11" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/>' +
        '<circle cx="0" cy="-4" r="11" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-6,-10 C-3,-15 3,-15 6,-10" stroke="#bff0cf" stroke-width="2.5" fill="none" stroke-linecap="round"/></g></g>' +
      '<g class="mja-feuilles-v"></g>' +
      '<g class="mja-bruine-g" opacity="0" display="none"><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'b)"/></g>' +
      '<g class="mja-nuit-g" opacity="0" display="none"><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'n)"/></g>' +
      '<g class="mja-pluie" opacity="0" display="none">' + lignesPluie + '</g>' +
      '<circle class="mja-vision-halo" r="30"/><circle class="mja-vision" r="30"/>' +
      '<rect class="mja-alerte-perdu" x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" opacity="0" display="none"/>' +
    '</svg>';
    var svg = terrain.querySelector('svg');
    var vue = {x:0, y:0, w:360, h:480};
    cadrer(P, svg, {maxW:440, apres:function(x, y, w, h){ vue = {x:x, y:y, w:w, h:h}; }});
    var gMonde = svg.querySelector('.mja-monde'), gDeco = svg.querySelector('.mja-deco'), gSolZ = svg.querySelector('.mja-sol-z'), gHaut = svg.querySelector('.mja-haut-z'), gM = svg.querySelector('.mja-marques'), gFlous = svg.querySelector('.mja-flous'), gArr = svg.querySelector('.mja-arr');
    var gJ = svg.querySelector('.mja-pisteur-g'), corpsJ = svg.querySelector('.mja-pisteur-corps'), cercle = svg.querySelector('.mja-vision'), cercleSol = svg.querySelector('.mja-vision-sol');
    var nuitG = svg.querySelector('.mja-nuit-g'), bruineG = svg.querySelector('.mja-bruine-g'), pluieG = svg.querySelector('.mja-pluie'), gFeuilles = svg.querySelector('.mja-feuilles-v'), alerteR = svg.querySelector('.mja-alerte-perdu');

    /* ---- Zones dessinées sur toute la largeur du monde (y = -d) ---- */
    var X1 = -320, X2 = W + 320, s = '', h = '', motifs = [];
    M.zones.forEach(function(o){
      var y0 = -o.d1, y1 = -o.d0, H = o.d1 - o.d0;
      if(o.type === 'gravier'){
        s += '<rect x="' + X1 + '" y="' + (y0 - 5).toFixed(0) + '" width="' + (X2 - X1) + '" height="' + (H + 10).toFixed(0) + '" fill="#6d6352"/><rect x="' + X1 + '" y="' + y0.toFixed(0) + '" width="' + (X2 - X1) + '" height="' + H.toFixed(0) + '" fill="url(#' + id + 'g)"/>';
        s += '<path d="M' + X1 + ',' + (y0 - 2).toFixed(0) + ' L' + X2 + ',' + (y0 - 2).toFixed(0) + ' M' + X1 + ',' + (y1 + 2).toFixed(0) + ' L' + X2 + ',' + (y1 + 2).toFixed(0) + '" stroke="#4a4232" stroke-width="3" stroke-dasharray="10 6"/>';
      } else if(o.type === 'haie'){
        var rangs = Math.max(1, Math.round(H / 30));
        for(var rg = 0; rg < rangs; rg++) for(var x = X1 + (rg % 2) * 12; x < X2; x += U.rand(20, 28)){ var yy = y0 + H * (rg + 0.5) / rangs + U.rand(-6, 6), rr = U.rand(16, 23) + (rangs > 1 ? 3 : 0); h += '<circle cx="' + x.toFixed(0) + '" cy="' + yy.toFixed(0) + '" r="' + rr.toFixed(0) + '" fill="' + U.choix(['#245e3c', '#2a6a44', '#2f7a4c']) + '" stroke="' + CONTOUR + '" stroke-width="3"/>'; if(Math.random() < 0.25) h += '<circle cx="' + (x + U.rand(-6, 6)).toFixed(0) + '" cy="' + (yy - 4).toFixed(0) + '" r="2.4" fill="' + U.choix(['#e5484d', '#f6d23a', '#eef0ff']) + '"/>'; }
      } else if(o.type === 'eau'){
        s += '<rect x="' + X1 + '" y="' + (y0 - 6).toFixed(0) + '" width="' + (X2 - X1) + '" height="' + (H + 12).toFixed(0) + '" fill="#3b2c1e"/><rect x="' + X1 + '" y="' + y0.toFixed(0) + '" width="' + (X2 - X1) + '" height="' + H.toFixed(0) + '" fill="url(#' + id + 'w)"/>';
        [0.3, 0.7].forEach(function(fr){ var yv = y0 + H * fr - 6, pid = id + 'v' + (motifs.length); motifs.push('<pattern id="' + pid + '" class="mja-motif-v" width="40" height="12" x="0" y="' + yv.toFixed(0) + '" patternUnits="userSpaceOnUse"><path d="M0,6 q10,-5 20,0 t20,0" fill="none" stroke="#bfe6ff" stroke-width="2.5" stroke-opacity=".6"/></pattern>'); s += '<rect x="' + X1 + '" y="' + yv.toFixed(0) + '" width="' + (X2 - X1) + '" height="12" fill="url(#' + pid + ')"/>'; });
        for(var k = 0; k < W / 180; k++) s += '<ellipse cx="' + U.rand(X1, X2).toFixed(0) + '" cy="' + (y0 + H / 2).toFixed(0) + '" rx="9" ry="6" fill="#8a8aa0" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
      } else if(o.type === 'cloture'){
        var yf = -(o.d0 + o.d1) / 2;
        h += '<path d="M' + X1 + ',' + (yf - 4).toFixed(0) + ' L' + X2 + ',' + (yf - 4).toFixed(0) + ' M' + X1 + ',' + (yf + 4).toFixed(0) + ' L' + X2 + ',' + (yf + 4).toFixed(0) + '" stroke="' + CONTOUR + '" stroke-width="6"/><path d="M' + X1 + ',' + (yf - 4).toFixed(0) + ' L' + X2 + ',' + (yf - 4).toFixed(0) + ' M' + X1 + ',' + (yf + 4).toFixed(0) + ' L' + X2 + ',' + (yf + 4).toFixed(0) + '" stroke="#a8743f" stroke-width="3"/>';
        for(var xp = X1; xp < X2; xp += 34) h += '<rect x="' + (xp - 4) + '" y="' + (yf - 9).toFixed(0) + '" width="8" height="18" rx="2" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
      }
    });
    M.flaques.forEach(function(q){ s += '<ellipse cx="' + q.x.toFixed(0) + '" cy="' + (-q.d).toFixed(0) + '" rx="' + (q.rx + 7).toFixed(0) + '" ry="' + (q.ry + 5).toFixed(0) + '" fill="#3f2e1f" opacity=".7"/><ellipse cx="' + q.x.toFixed(0) + '" cy="' + (-q.d).toFixed(0) + '" rx="' + q.rx.toFixed(0) + '" ry="' + q.ry.toFixed(0) + '" fill="#3a5f96" stroke="' + CONTOUR + '" stroke-width="2"/><ellipse cx="' + (q.x - q.rx * 0.3).toFixed(0) + '" cy="' + (-q.d - 3).toFixed(0) + '" rx="' + (q.rx * 0.35).toFixed(0) + '" ry="2.5" fill="#a8d4ff" opacity=".6"/>'; });
    M.dalles.forEach(function(q){
      var pts = []; for(var k = 0; k < 7; k++){ var a = q.a + k / 7 * 6.283, rr = q.r * U.rand(0.85, 1.08); pts.push((q.x + Math.cos(a) * rr).toFixed(1) + ',' + (-q.d + Math.sin(a) * rr * 0.85).toFixed(1)); }
      s += '<path d="M' + pts.join(' L') + ' Z" fill="#8c8aa0" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/><path d="M' + (q.x - q.r * 0.4).toFixed(0) + ',' + (-q.d - 2).toFixed(0) + ' l' + (q.r * 0.5).toFixed(0) + ',4" stroke="#6d6b82" stroke-width="2"/>';
    });
    M.rochers.forEach(function(q){ h += '<ellipse cx="' + q.x.toFixed(0) + '" cy="' + (-q.d + 6).toFixed(0) + '" rx="' + q.r.toFixed(0) + '" ry="' + (q.r * 0.6).toFixed(0) + '" fill="#000" opacity=".3"/><path d="M' + (q.x - q.r) + ',' + (-q.d + 4) + ' C' + (q.x - q.r) + ',' + (-q.d - q.r) + ' ' + (q.x + q.r) + ',' + (-q.d - q.r) + ' ' + (q.x + q.r) + ',' + (-q.d + 4) + ' Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="3"/>'; });
    gSolZ.innerHTML = s; gHaut.innerHTML = h;
    if(motifs.length) svgFrag(svg.querySelector('defs'), motifs.join(''));
    var motifsV = Array.prototype.slice.call(svg.querySelectorAll('.mja-motif-v')), motifsPluie = svg.querySelectorAll('.mja-motif-pluie'), grNuit = svg.querySelector('.mja-gr-nuit'), grBruine = svg.querySelector('.mja-gr-bruine'), cercleHalo = svg.querySelector('.mja-vision-halo');
    /* arrivées : une par piste, éparpillées */
    var types = Object.keys(ARRIVEES_ART);
    M.arrivees.forEach(function(a){
      a.type = U.choix(types);
      a.g = svgNoeud('g', {'class':'mja-arrivee', transform:'translate(' + a.x.toFixed(1) + ',' + (-a.d).toFixed(1) + ') scale(1.25)'}, gArr);
      a.g.innerHTML = '<circle class="mja-arr-halo" r="21"/>' + ARRIVEES_ART[a.type] + '<text class="mja-arr-x" y="6" text-anchor="middle">✗</text>';
    });
    /* ---- Zones sans empreintes, zones mouillées ---- */
    function sansTrace(x, d){
      for(var i = 0; i < M.zones.length; i++){
        var o = M.zones[i];
        if(o.type === 'cloture'){ if(Math.abs(d - (o.d0 + o.d1) / 2) < 22) return true; }
        else if(o.type !== 'dalles' && d > o.d0 - 5 && d < o.d1 + 5) return true;
      }
      for(var j = 0; j < M.dalles.length; j++){ var q = M.dalles[j]; if(Math.hypot(x - q.x, (d - q.d) / 0.85) < q.r + 2) return true; }
      for(var k = 0; k < M.flaques.length; k++){ var f = M.flaques[k], u = (x - f.x) / f.rx, v = (d - f.d) / f.ry; if(u * u + v * v < 1.1) return true; }
      return false;
    }
    /* Après l'eau : pendant ~3,5 pas, TOUTES les pistes (la bonne aussi) ne laissent que la même tache de boue. */
    var mouilleL = cibleF.foulee * 3.6;
    function mouille(x, d){
      for(var i = 0; i < M.zones.length; i++){ var o = M.zones[i]; if(o.type === 'eau' && d > o.d1 && d < o.d1 + mouilleL) return true; }
      for(var k = 0; k < M.flaques.length; k++){ var f = M.flaques[k], u = (x - f.x) / (f.rx + 18), v = (d - f.d) / (f.ry + 18); if(u * u + v * v < 1) return true; }
      return false;
    }
    /* Après une clôture : on a sauté, les 1 ou 2 premiers pas sont plus grands et plus enfoncés. */
    function atterrissage(d, foulee){
      for(var i = 0; i < M.zones.length; i++){ var o = M.zones[i]; if(o.type !== 'cloture') continue; var mid = (o.d0 + o.d1) / 2; if(d > mid + 22 && d < mid + 22 + foulee * 1.9) return true; }
      return false;
    }
    var TACHE = 'M-6,-10 C-3,-15 5,-14 7,-8 C9,-2 8,6 6,10 C3,15 -4,15 -6,10 C-9,4 -9,-5 -6,-10 Z';
    /* Variante charrette : à chaque pas, un bout de chaque trait de roue (il s'allume dans le cercle, comme une empreinte) */
    function traitsRoues(f, x, d, rad, vrai){
      var r = f.roues, lg = f.foulee * 1.1, deg = (rad * 57.3).toFixed(0);
      (r.n === 1 ? [0] : [-r.e / 2, r.e / 2]).forEach(function(o){
        var wx = x + Math.cos(rad) * o, wd = d - Math.sin(rad) * o;
        var tr = 'translate(' + wx.toFixed(1) + ',' + (-wd).toFixed(1) + ') rotate(' + deg + ')', rect = {x:-2.6, y:(-lg / 2).toFixed(1), width:5.2, height:lg.toFixed(1), rx:2.6};
        var m = {x:wx, d:wd, vrai:vrai, o:-1, of:-1};
        m.g = svgNoeud('g', {'class':'mja-empr mja-roue', transform:tr, opacity:'0'}, gM);
        svgNoeud('rect', Object.assign({'class':'e-roue'}, rect), m.g);
        if(p.nuit) m.fl = svgNoeud('rect', Object.assign({'class':'e-flou', transform:tr, opacity:'0'}, rect), gFlous);
        marques.push(m);
      });
    }
    /* ---- Empreintes : créées au fil du défilement ---- */
    var pistes = [cible].concat(M.leurres);
    pistes.forEach(function(t){ t.next = t.debut; t.k = 0; });
    var marques = [];
    function creerJusqua(dMax){
      pistes.forEach(function(t){
        while(t.next < Math.min(dMax, t.fin)){
          var d = t.next, x = t.x(d), pente = t.pente(d);
          t.next += t.f.foulee / Math.sqrt(1 + pente * pente); t.k++;
          if(sansTrace(x, d)) continue;
          var cote = t.k % 2 ? 1 : -1, rad = Math.atan(pente), off = t.f.L * 0.3 * cote;
          if(t.f.roues) traitsRoues(t.f, x, d, rad, t.vrai);   /* variante charrette : les roues d'abord, les pas par-dessus */
          var px = x + Math.cos(rad) * off, pd = d - Math.sin(rad) * off;
          var boue = mouille(px, pd), saut = !boue && atterrissage(d, t.f.foulee), fs = formeSemelle(t.f), tr, contenu, forme;
          if(boue){
            /* la même tache pour tout le monde : même taille, même forme, seulement dans le sens de la marche */
            tr = 'translate(' + px.toFixed(1) + ',' + (-pd).toFixed(1) + ') rotate(' + (rad * 57.3).toFixed(0) + ')';
            contenu = '<ellipse class="e-tache" rx="11" ry="15"/><path class="e-f" d="' + TACHE + '"/>'; forme = TACHE;
          } else {
            var k = saut ? 1.3 : 1, ang = rad * 57.3 + t.f.ouvre * cote;
            tr = 'translate(' + px.toFixed(1) + ',' + (-pd).toFixed(1) + ') rotate(' + ang.toFixed(0) + ') scale(' + (cote > 0 ? -k : k) + ',' + k + ')';
            contenu = (saut ? '<path class="e-creux" d="' + fs.d + '"/>' : '') + '<path class="e-f" d="' + fs.d + '"/>' + fs.det; forme = fs.d;
          }
          var m = {x:px, d:pd, vrai:t.vrai, o:-1, of:-1};
          m.g = svgNoeud('g', {'class':'mja-empr' + (boue ? ' boue' : '') + (saut ? ' saut' : ''), transform:tr, opacity:'0'}, gM);
          m.g.innerHTML = contenu;
          if(p.nuit) m.fl = svgNoeud('path', {'class':'e-flou', d:forme, transform:tr, opacity:'0'}, gFlous);
          marques.push(m);
        }
      });
    }
    /* ---- Décor par tuiles autour de la caméra ; arbres serrés au bord du monde ---- */
    var tuiles = {};
    function decor(){
      var tx0 = Math.floor((camX + vue.x - 180 - 200) / 360), tx1 = Math.floor((camX + vue.x + vue.w - 180 + 200) / 360);
      var ty0 = Math.floor((cam + YB - (vue.y + vue.h) - 100) / 240), ty1 = Math.floor((cam + YB - vue.y + 300) / 240);
      for(var ix = tx0; ix <= tx1; ix++) for(var iy = ty0; iy <= ty1; iy++){
        var cle = ix + ',' + iy; if(tuiles[cle]) continue;
        var s2 = '', xa = ix * 360, da = iy * 240;
        if(Math.random() < 0.22){ var ya = -(da + U.rand(20, 200)), sl = U.rand(-0.5, 0.5); s2 += '<path d="M' + xa + ',' + (ya + sl * 0).toFixed(0) + ' L' + (xa + 360) + ',' + (ya - sl * 360).toFixed(0) + '" stroke="#7a6a4c" stroke-width="30" stroke-linecap="round" opacity=".5"/>'; }
        for(var i = 0; i < 14; i++){
          var x = xa + U.rand(0, 360), y = -(da + U.rand(0, 240)), r = Math.random();
          if(r < .3) s2 += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l-3,-9 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l1,-11 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l5,-8" stroke="#7fa65a" stroke-width="2.4" stroke-linecap="round"/>';
          else if(r < .45) s2 += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + U.rand(3, 7).toFixed(0) + '" ry="' + U.rand(2, 5).toFixed(0) + '" fill="#8b7a62" stroke="' + CONTOUR + '" stroke-width="1.5"/>';
          else if(r < .6) s2 += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' c8,-4 14,2 24,-3 M' + (x + 10).toFixed(0) + ',' + (y - 2).toFixed(0) + ' c4,6 2,10 8,14" stroke="#4a3220" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
          else if(r < .72) s2 += '<g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ')"><circle r="2.6" cx="-3" fill="' + U.choix(['#ef7fa8', '#f6d23a', '#eef0ff', '#b48cff']) + '"/><circle r="2.6" cx="3" fill="' + U.choix(['#ef7fa8', '#f6d23a', '#eef0ff']) + '"/><circle r="2.6" cy="-3" fill="#f6d23a"/></g>';
          else if(r < .86) s2 += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z" fill="' + U.choix(['#c07a34', '#a5672e', '#d79a3c']) + '" transform="rotate(' + U.rand(0, 360).toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>';
          else s2 += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + U.rand(18, 32).toFixed(0) + '" ry="' + U.rand(8, 14).toFixed(0) + '" fill="#4f472e" opacity=".55"/>';
        }
        if(xa < 30 || xa + 360 > W - 30){
          var bord = xa < 30 ? 0 : W;
          for(var yb = 0; yb < 240; yb += 26){ for(var kb = 0; kb < 4; kb++){ var xx = bord + (bord ? 1 : -1) * (kb * 30 + U.rand(0, 14)); s2 += '<circle cx="' + xx.toFixed(0) + '" cy="' + (-(da + yb + U.rand(0, 10))).toFixed(0) + '" r="' + U.rand(18, 26).toFixed(0) + '" fill="' + U.choix(['#1f4a34', '#245e3c', '#1a3f2c']) + '" stroke="' + CONTOUR + '" stroke-width="3"/>'; } }
        }
        var g = svgNoeud('g', {'data-d':da}, gDeco); g.innerHTML = s2; tuiles[cle] = g;
      }
      var dMin = cam + YB - (vue.y + vue.h) - 400;
      Object.keys(tuiles).forEach(function(c){ if(+tuiles[c].getAttribute('data-d') + 240 < dMin){ tuiles[c].parentNode.removeChild(tuiles[c]); delete tuiles[c]; } });
    }
    /* ---- Vent : feuilles devant ---- */
    var feuilles = [];
    for(var fI = 0; fI < 52; fI++){ var fe = {x:U.rand(-240, 600), y:U.rand(-200, 680), v:U.rand(90, 170), ph:U.rand(0, 6), r:U.rand(0, 360)}; fe.g = svgNoeud('path', {'class':'mja-feuille-v', d:'M-9,0 c6,-9 16,-9 19,0 c-6,6 -13,6 -19,0 Z', fill:U.choix(['#d79a3c', '#c07a34', '#e8b04a', '#7fa65a'])}, gFeuilles); feuilles.push(fe); }

    /* ---- État ---- */
    var cam = 0, camX = M.X0, px = M.X0, pd = 0, phase = 'depart', t = 0, fini = false, perduT = 0;
    var doigt = null, butMonde = null, clavier = {x:0, y:0}, reveles = [], iBruine = 0, iAverse = 0, iVent = 0;
    pd = cam + YB - 400;
    function ecranX(x){ return 180 + (x - camX); }
    function ecranY(d){ return YB - (d - cam); }
    /* Contrôles : on vise un point de l'écran, le Pisteur y marche ; la caméra le suit */
    var appui = null;
    function viser(e){ var pt = ptSVG(svg, e); if(e.pointerType === 'touch'){ var m = svg.getScreenCTM(); pt.y -= 34 / (m ? m.d : 1); } doigt = {x:pt.x, y:pt.y}; butMonde = null; }
    P.ecoute(svg, 'pointerdown', function(e){ e.preventDefault(); appui = e.pointerId; try{ svg.setPointerCapture(e.pointerId); }catch(er){} viser(e); });
    P.ecoute(svg, 'pointermove', function(e){ if(appui === e.pointerId) viser(e); });
    function lacher(e){ if(appui === e.pointerId){ appui = null; doigt = null; } }
    P.ecoute(svg, 'pointerup', lacher); P.ecoute(svg, 'pointercancel', lacher);
    P.ecoute(document, 'keydown', function(e){ var k = {ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1]}[e.key]; if(k){ clavier.x = k[0] || clavier.x; clavier.y = k[1] || clavier.y; e.preventDefault(); } });
    P.ecoute(document, 'keyup', function(e){ if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') clavier.x = 0; if(e.key === 'ArrowUp' || e.key === 'ArrowDown') clavier.y = 0; });
    terrain.mjaViserMonde = function(x, d){ butMonde = (x === null) ? null : {x:x, d:d}; };
    terrain.mjaEtat = function(){ return {t:t, cam:cam, camX:camX, px:px, pd:pd, YB:YB, L:L, W:W, phase:phase, perduT:perduT, vue:vue, defile:p.defile,
      cible:function(d){ return cible.x(d); }, fourches:M.fourches.map(function(f){ return {d:f.d, x:f.x, leurres:f.leurres}; }),
      zones:M.zones.map(function(z){ return {type:z.type, d0:z.d0, d1:z.d1, x0:z.x0, x1:z.x1, leurres:z.leurres, court:z.court}; }),
      leurre:function(i, d){ return M.leurres[i].x(d); }, finLeurre:function(i){ var a = M.leurres[i].arrivee; return {x:a.x, d:a.d, debut:M.leurres[i].debut}; }, arrivee:{x:M.arrivees[0].x, d:M.arrivees[0].d}, meteo:meteo}; };

    /* Carte de départ : l'empreinte à retenir */
    function esc2(x){ return String(x).replace(/[&<>"]/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]; }); }
    var carteD = ch && cibleF.roues ?
      U.html('<div class="mja-depart"><div class="mja-depart-in"><span class="sur-titre">Retiens bien ces traces</span>' + traceCarte(cibleF, 110) + '<b>' + esc2(cibleF.nom) + '</b><span class="mja-depart-pt">Deux traits de roues, et ses pas au milieu. Attention : pas la brouette (une seule roue), ni la carriole de Fortuné (plus large) !</span></div></div>') :
      U.html('<div class="mja-depart"><div class="mja-depart-in"><span class="sur-titre">Retiens bien cette empreinte</span>' + empreinteCarte(cibleF, 96) + '<b>' + esc2(cibleF.nom || 'L\'empreinte du suspect') + '</b><span class="mja-depart-pt">Au début, elle est toute seule. Ensuite, la piste se sépare : ne la perds pas de vue !</span></div></div>');
    terrain.appendChild(carteD);
    P.apres(2800, function(){
      carteD.classList.add('part');
      P.apres(400, function(){ if(carteD.parentNode) carteD.parentNode.removeChild(carteD); });
      phase = 'marche';
    });
    function perdre(detail, ann){
      if(fini) return;
      phase = 'fin'; fini = true;
      if(ann) annonce(terrain, ann, 1600);
      M.arrivees[0].g.classList.add('bonne', 'revelee');
      P.finir({reussi:false, score:fixe(pd / L, 0, 1) * 0.5, erreurs:p.essais - essais + 1, detail:detail}, 1700);
    }
    function entrer(a){
      if(a.essaye) return;
      a.essaye = true;
      var q = pctDans(svg, terrain, ecranX(a.x), ecranY(a.d) - 34);
      if(a.cible){
        phase = 'fin'; fini = true;
        a.g.classList.add('bonne');
        U.son('victoire'); U.vibrer(40);
        flotter(terrain, q.x, q.y, ch ? 'C\'est la charrette !' : 'C\'est lui !', 'ok');
        P.finir({reussi:true, score:1, erreurs:p.essais - essais, detail:'Tu as suivi la bonne piste jusqu\'au bout !'}, 1500);
        return;
      }
      essais--; hud.perdVie(essais, p.essais);
      a.g.classList.add('fausse');
      erreurSensorielle(terrain);
      flotter(terrain, q.x, q.y, ch ? (a.trace && a.trace.f && a.trace.f.sorte === 'brouette' ? 'Une brouette…' : a.trace && a.trace.f && a.trace.f.sorte === 'carriole' ? 'La carriole de Fortuné…' : 'Pas ces pieds-là…') : 'Ce n\'est pas lui…', 'ko');
      if(essais <= 0) perdre('Tu as suivi la piste de quelqu\'un d\'autre…');
    }
    function cibleVisible(xMin, xMax, dTop){
      var d0 = Math.max(cible.debut, pd - 30), d1 = Math.min(cible.fin + 12, dTop);
      if(d0 > d1) return true;
      for(var d = d0; d <= d1; d += 14){ var x = cible.x(d); if(x > xMin - 6 && x < xMax + 6) return true; }
      return false;
    }

    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      /* le sol défile toujours, même à la fin */
      if(phase !== 'depart') cam += p.defile * dt;
      var dBas = cam + YB - (vue.y + vue.h), dHaut = cam + YB - vue.y;
      var xMin = camX + vue.x - 180, xMax = camX + vue.x + vue.w - 180;
      /* le Pisteur marche vers le doigt, à vitesse limitée */
      if(phase === 'marche'){
        var tx = null, td = null;
        if(butMonde){ tx = butMonde.x; td = butMonde.d; }
        else if(doigt){ tx = camX + (doigt.x - 180); td = cam + YB - doigt.y; }
        var vx = 0, vd = 0;
        if(tx !== null){ var dx = tx - px, ddd = td - pd, dd = Math.sqrt(dx * dx + ddd * ddd); if(dd > 1){ var v = Math.min(p.marche, dd * 8); vx = dx / dd * v; vd = ddd / dd * v; } }
        else if(clavier.x || clavier.y){ vx = clavier.x * p.marche; vd = -clavier.y * p.marche; }
        px = fixe(px + vx * dt, 24, W - 24); pd += vd * dt;
        pd = fixe(pd, cam + YB - (vue.y + vue.h - 26), cam + YB - (vue.y + 40));
        corpsJ.setAttribute('transform', 'rotate(' + (vx || vd ? Math.atan2(vx, vd) * 57.3 : 0).toFixed(0) + ') scale(.72)');
      } else if(phase === 'depart') pd = cam + YB - (vue.y + vue.h * 0.8);
      camX += (px - camX) * Math.min(1, dt * 3);
      creerJusqua(dHaut + 80);
      decor();
      hud.barre(fixe(pd / L, 0, 1));
      /* arrivées */
      if(phase === 'marche'){
        for(var ia = 0; ia < M.arrivees.length; ia++){ var a = M.arrivees[ia]; if(!a.essaye && Math.abs(a.x - px) < 18 && Math.abs(a.d - pd) < 18){ entrer(a); if(fini) return false; } }
        var aC = M.arrivees[0];
        if(aC.d < dBas - 14){ perdre('La bonne arrivée est passée sans toi…', '😵 Trop tard !'); return false; }
        /* la bonne piste doit rester à l'écran (devant le Pisteur) */
        if(!cibleVisible(xMin, xMax, dHaut)){ perduT += dt; if(perduT > p.grace){ perdre('Tu t\'es perdu : tu as perdu la trace !', '😵 Perdu !'); return false; } }
        else perduT = 0;
        var al = perduT > 0.9; if(alerteR._vis !== al){ alerteR._vis = al; alerteR.setAttribute('display', al ? 'inline' : 'none'); } if(al) alerteR.setAttribute('opacity', (0.16 + 0.12 * Math.sin(t * 12)).toFixed(2));
      }
      /* « revele » : après chaque obstacle, les pas suivants s'allument */
      if(p.revele) M.zones.forEach(function(o){ if(!o.vu && pd > o.d1 - 30){ o.vu = true; reveles.push({d0:o.d1, d1:o.d1 + cibleF.foulee * 5.5, fin:t + 1.9}); } });
      /* météo */
      var dm = pd + 60;
      function dans(z){ return z && dm > z[0] && dm < z[1] ? 1 : 0; }
      iBruine += (dans(meteo.bruine) - iBruine) * Math.min(1, dt * 1.2);
      iAverse += (dans(meteo.averse) - iAverse) * Math.min(1, dt * 1.2);
      iVent += (dans(meteo.vent) - iVent) * Math.min(1, dt * 1.2);
      function montre(g, o){ var vis = o > 0.02; if(g._vis !== vis){ g._vis = vis; g.setAttribute('display', vis ? 'inline' : 'none'); } if(vis) g.setAttribute('opacity', o.toFixed(2)); }
      montre(bruineG, iBruine); montre(pluieG, iAverse * 0.95); montre(nuitG, iAverse * 0.85); montre(gFeuilles, iVent);
      if(pluieG._vis){ motifsPluie[0].setAttribute('patternTransform', 'translate(' + (-(t * 120) % 130).toFixed(1) + ',' + ((t * 340) % 130).toFixed(1) + ')'); motifsPluie[1].setAttribute('patternTransform', 'translate(' + (-(t * 95) % 97).toFixed(1) + ',' + ((t * 270) % 97).toFixed(1) + ')'); }
      if(motifsV.length){ var dv = ((t * 22) % 40).toFixed(1); for(var mv = 0; mv < motifsV.length; mv++) motifsV[mv].setAttribute('patternTransform', 'translate(' + dv + ',0)'); }
      if(iVent > 0.02) feuilles.forEach(function(fe){
        fe.x += fe.v * dt; fe.y += Math.sin(t * 2 + fe.ph) * 30 * dt; fe.r += 200 * dt;
        if(fe.x > 610){ fe.x = -250; fe.y = U.rand(-200, 680); }
        fe.g.setAttribute('transform', 'translate(' + fe.x.toFixed(0) + ',' + fe.y.toFixed(0) + ') rotate(' + (fe.r % 360).toFixed(0) + ')');
      });
      /* dessin */
      var sx = ecranX(px), sy = ecranY(pd);
      var R = p.vision * (1 - 0.15 * Math.max(iBruine, iAverse)), cx = sx, cy = sy - R * 0.4;
      cercle.setAttribute('cx', cx.toFixed(1)); cercle.setAttribute('cy', cy.toFixed(1)); cercle.setAttribute('r', R.toFixed(1));
      cercleSol.setAttribute('cx', cx.toFixed(1)); cercleSol.setAttribute('cy', cy.toFixed(1)); cercleSol.setAttribute('r', R.toFixed(1));
      cercleHalo.setAttribute('cx', cx.toFixed(1)); cercleHalo.setAttribute('cy', cy.toFixed(1)); cercleHalo.setAttribute('r', R.toFixed(1));
      if(nuitG._vis){ grNuit.setAttribute('cx', cx.toFixed(1)); grNuit.setAttribute('cy', cy.toFixed(1)); grNuit.setAttribute('r', (R * 110 / 60).toFixed(1)); }
      if(bruineG._vis){ grBruine.setAttribute('cx', cx.toFixed(1)); grBruine.setAttribute('cy', cy.toFixed(1)); grBruine.setAttribute('r', (R * 170 / 20).toFixed(1)); }
      gMonde.setAttribute('transform', 'translate(' + (180 - camX).toFixed(1) + ',' + (YB + cam).toFixed(1) + ')');
      gJ.setAttribute('transform', 'translate(' + sx.toFixed(1) + ',' + sy.toFixed(1) + ')');
      /* empreintes : visibles dans le cercle (vision de nuit : floues au loin) */
      var garde = [], attenue = 1 - 0.3 * iAverse;
      for(var i = 0; i < marques.length; i++){
        var m = marques[i];
        if(m.d < dBas - 60){ m.g.parentNode.removeChild(m.g); if(m.fl) m.fl.parentNode.removeChild(m.fl); continue; }
        garde.push(m);
        var ex = ecranX(m.x) - cx, ey = ecranY(m.d) - cy, dist2 = Math.sqrt(ex * ex + ey * ey);
        var o = dist2 < R * 0.6 ? 1 : (dist2 > R ? 0 : 1 - (dist2 - R * 0.6) / (R * 0.4));
        if(m.vrai && reveles.length){ for(var k = 0; k < reveles.length; k++){ var rv = reveles[k]; if(t < rv.fin && m.d > rv.d0 && m.d < rv.d1){ o = 1; if(!m.rv){ m.rv = true; m.g.classList.add('revele'); } } } }
        o = Math.round(o * attenue * 10) / 10;
        if(o !== m.o){ m.o = o; m.g.setAttribute('opacity', o); }
        if(m.fl){ var of = dist2 > 700 ? 0 : Math.round((1 - o) * fixe(0.6 - dist2 / 560, 0.1, 0.6) * (1 - 0.6 * iBruine) * 10) / 10; if(of !== m.of){ m.of = of; m.fl.setAttribute('opacity', of); } }
      }
      marques = garde;
      if(reveles.length && reveles.every(function(rv){ return t > rv.fin; })){ reveles = []; marques.forEach(function(m){ if(m.rv){ m.rv = false; m.g.classList.remove('revele'); } }); }
    });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   POURSUITE (Pisteur) — course sur 3 couloirs vue de derrière.
   Glisser ⬅️ ➡️ pour changer de couloir, ⬆️ pour sauter, ⬇️ pour
   glisser (ou toucher à gauche / à droite, ou les boutons).
   Beaucoup d'obstacles, variés et serrés : caisses, charrettes, étals
   du marché, barrières, chien endormi, flaques de boue, linge et
   branches basses, poules qui traversent, tonneaux qui roulent, et
   des enchaînements (changer vite de couloir puis sauter).
   Un choc ne finit pas la partie : on trébuche, on ralentit, et la
   silhouette s'éloigne d'un pas (plus petite, plus haut sur la route).
   10 obstacles sans faute d'affilée : elle se rapproche d'un pas.
   Départ : 2 pas de « attrapée », 3 pas de « perdue ». Pas d'autre
   fin : les obstacles arrivent jusqu'à ce qu'on l'attrape ou la perde.
   Mods : erreurs (+1 pas avant de la perdre), lent et temps (tout
   arrive moins vite), zone (sauts et glissades plus longs, chocs plus
   tolérants), aide (obstacles visibles et surlignés plus tôt, et une
   flèche dit quoi faire pour les N×6 premiers), revele (toujours la
   flèche), obstacles (− = moins serrés, + = plus serrés), vitesse
   (bottes : elle se rapproche après 8 obstacles sans faute au lieu de 10).
   ========================================================== */
var OBSTACLES_P = {
  tronc: '<g><rect x="-46" y="-22" width="92" height="30" rx="14" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="-46" cy="-7" rx="9" ry="15" fill="#d9a066" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-30,-14 L20,-14 M-20,-2 L30,-2" stroke="#5e3a1e" stroke-width="3" stroke-linecap="round"/></g>',
  caisse: '<g><rect x="-30" y="-56" width="60" height="58" rx="5" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-30,-56 L30,2 M30,-56 L-30,2" stroke="#7d5428" stroke-width="5"/><rect x="-30" y="-56" width="60" height="58" rx="5" fill="none" stroke="' + CONTOUR + '" stroke-width="5"/></g>',
  tonneau: '<g><path d="M-26,-60 C-36,-30 -36,-28 -26,2 L26,2 C36,-28 36,-30 26,-60 Z" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-31,-42 L31,-42 M-31,-16 L31,-16" stroke="#3b3346" stroke-width="6"/><ellipse cx="0" cy="-60" rx="26" ry="7" fill="#b87a44" stroke="' + CONTOUR + '" stroke-width="4"/></g>',
  foin: '<g><path d="M-44,2 L-40,-40 C-20,-54 20,-54 40,-40 L44,2 Z" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-30,-30 L-26,-6 M-8,-40 L-6,-8 M14,-38 L12,-6 M32,-28 L30,-4" stroke="#b08a2a" stroke-width="3" stroke-linecap="round"/><path d="M-42,-22 L42,-22" stroke="#8a5a33" stroke-width="5"/></g>',
  rocher: '<g><path d="M-40,2 C-46,-18 -30,-44 -6,-46 C20,-48 42,-30 40,-8 C40,-2 38,2 34,2 Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-20,-30 C-10,-38 6,-38 14,-32" stroke="#b5b2cc" stroke-width="4" fill="none" stroke-linecap="round"/></g>',
  poule: '<g><ellipse cx="0" cy="-20" rx="22" ry="18" fill="#fff" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="16" cy="-36" r="10" fill="#fff" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M14,-48 l4,-6 l3,6 l4,-5 l2,7" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M25,-36 l9,3 l-9,3 Z" fill="#f6b23a" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle cx="18" cy="-38" r="2.2" fill="' + CONTOUR + '"/><path d="M-6,-2 L-8,8 M6,-2 L8,8" stroke="#f6b23a" stroke-width="4" stroke-linecap="round"/></g>',
  roule: '<g class="mja-roule"><ellipse cx="0" cy="-28" rx="30" ry="30" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="0" cy="-28" rx="13" ry="30" fill="#b87a44" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-28,-40 L28,-40 M-28,-16 L28,-16" stroke="#3b3346" stroke-width="5"/></g>',
  barriere: '<g><path d="M-52,4 L-52,-34 M52,4 L52,-34 M0,4 L0,-34" stroke="' + CONTOUR + '" stroke-width="12" stroke-linecap="round"/><path d="M-52,4 L-52,-34 M52,4 L52,-34 M0,4 L0,-34" stroke="#a8743f" stroke-width="7" stroke-linecap="round"/><rect x="-60" y="-30" width="120" height="11" rx="4" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="4"/><rect x="-60" y="-12" width="120" height="11" rx="4" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="4"/></g>',
  linge: '<g><path d="M-60,4 L-60,-120 M60,4 L60,-120" stroke="' + CONTOUR + '" stroke-width="10" stroke-linecap="round"/><path d="M-60,4 L-60,-120 M60,4 L60,-120" stroke="#8a5a33" stroke-width="5" stroke-linecap="round"/><path d="M-60,-112 Q0,-96 60,-112" stroke="#e8d7ae" stroke-width="3" fill="none"/>' +
    '<path d="M-46,-110 L-24,-104 L-26,-70 L-48,-74 Z" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M-14,-102 L14,-102 L16,-64 L4,-64 L0,-80 L-4,-64 L-16,-64 Z" fill="#6cb6ff" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M24,-104 L46,-110 L48,-76 L26,-72 Z" fill="#f6d23a" stroke="' + CONTOUR + '" stroke-width="3.5"/></g>',
  branche: '<g><path d="M-62,-96 C-30,-110 20,-90 62,-104" stroke="' + CONTOUR + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M-62,-96 C-30,-110 20,-90 62,-104" stroke="#7a4e2c" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<circle cx="-34" cy="-90" r="15" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="6" cy="-84" r="17" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="40" cy="-92" r="14" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="10" cy="-90" r="7" fill="#3c9a62"/></g>',
  boost: '<g class="mja-boost"><path d="M-30,-2 L0,-22 L30,-2 L30,-12 L0,-32 L-30,-12 Z M-30,18 L0,-2 L30,18 L30,8 L0,-12 L-30,8 Z" fill="#8ff3ff" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/></g>',
  flaque: '<g><ellipse cx="0" cy="-2" rx="50" ry="13" fill="#4a3220" stroke="' + CONTOUR + '" stroke-width="3"/><ellipse cx="-12" cy="-5" rx="16" ry="4" fill="#7a5a3e" opacity=".7"/><circle cx="18" cy="-2" r="3" fill="#6d5238"/></g>',
  haie: '<g><path d="M-50,4 C-56,-30 -40,-64 -20,-60 C-10,-80 14,-80 22,-62 C44,-66 58,-30 50,4 Z" fill="#245e3c" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-18" cy="-36" r="4" fill="#e5484d"/><circle cx="16" cy="-24" r="4" fill="#e5484d"/><circle cx="4" cy="-52" r="4" fill="#e5484d"/></g>',
  charrette: '<g><rect x="-40" y="-62" width="80" height="50" rx="5" fill="#a8743f" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-40,-46 L40,-46 M-40,-30 L40,-30" stroke="#7d5428" stroke-width="4"/><path d="M-34,-62 C-30,-80 -6,-84 0,-72 C8,-86 32,-80 34,-62 Z" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="-30" cy="-6" r="13" fill="#5e3a1e" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="30" cy="-6" r="13" fill="#5e3a1e" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-30" cy="-6" r="4" fill="' + CONTOUR + '"/><circle cx="30" cy="-6" r="4" fill="' + CONTOUR + '"/></g>',
  etal: '<g><path d="M-44,2 L-44,-70 M44,2 L44,-70" stroke="' + CONTOUR + '" stroke-width="8" stroke-linecap="round"/><path d="M-44,2 L-44,-70 M44,2 L44,-70" stroke="#8a5a33" stroke-width="4" stroke-linecap="round"/><rect x="-46" y="-34" width="92" height="30" rx="4" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-24" cy="-40" r="8" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-6" cy="-41" r="8" fill="#f6d23a" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="14" cy="-40" r="8" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="30" cy="-41" r="7" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-54,-70 L54,-70 L48,-90 L-48,-90 Z" fill="#fff" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-36,-90 L-40,-70 M-12,-90 L-13,-70 M12,-90 L13,-70 M36,-90 L40,-70" stroke="#e5484d" stroke-width="9"/><path d="M-54,-70 L54,-70 L48,-90 L-48,-90 Z" fill="none" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/></g>',
  chien: '<g><ellipse cx="0" cy="-10" rx="34" ry="14" fill="#e8d7ae" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="-12" cy="-12" rx="10" ry="8" fill="#3b2a1e"/><circle cx="24" cy="-14" r="11" fill="#e8d7ae" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M18,-24 C14,-30 22,-32 24,-25 Z" fill="#3b2a1e" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M20,-14 l4,1 M26,-15 l4,1" stroke="' + CONTOUR + '" stroke-width="2.5" stroke-linecap="round"/><path d="M-34,-8 C-44,-14 -42,-24 -36,-22" stroke="' + CONTOUR + '" stroke-width="5" fill="none" stroke-linecap="round"/><text x="34" y="-34" font-size="16" fill="#eef0ff" font-family="sans-serif">z</text></g>',
  arche: '<g><path d="M-58,4 L-58,-90 C-58,-150 58,-150 58,-90 L58,4 L36,4 L36,-86 C36,-120 -36,-120 -36,-86 L-36,4 Z" fill="#8f8aa6" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-36,4 L-36,-86 C-36,-120 36,-120 36,-86 L36,4 Z" fill="#14112a" opacity=".85"/><path d="M-50,-40 L-44,-40 M-50,-70 L-44,-70 M44,-56 L50,-56" stroke="' + CONTOUR + '" stroke-width="3"/></g>'
};
var GENRE_P = {caisse:'bloc', tonneau:'bloc', foin:'bloc', rocher:'bloc', poule:'bloc', roule:'bloc', haie:'bloc', charrette:'bloc', etal:'bloc', tronc:'bas', barriere:'bas', chien:'bas', flaque:'bas', linge:'haut', branche:'haut', boost:'boost', arche:'arche'};
/* --- Variante « forêt » (params.decor = 'foret') : mêmes obstacles, mêmes genres (donc mêmes gestes),
   autres dessins. Ex. E1 : poursuivre le petit chien noir et blanc entre les arbres (params.fuyard = 'chien'). --- */
var FORET_P = {
  /* à sauter (bas) : racines, tronc couché, flaque de boue */
  barriere: '<g><path d="M-60,4 C-52,-32 -22,-36 0,-18 C22,-36 52,-32 60,4" stroke="' + CONTOUR + '" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M-60,4 C-52,-32 -22,-36 0,-18 C22,-36 52,-32 60,4" stroke="#7a4e2c" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-40,-24 C-34,-28 -26,-28 -20,-24 M22,-26 C28,-29 36,-28 40,-22" stroke="#b07a4a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6,-14 C-2,-20 6,-20 8,-14" stroke="#3c9a62" stroke-width="5" fill="none" stroke-linecap="round"/></g>',
  chien: '<g><path d="M-54,4 C-44,-28 -10,-28 4,4 M-4,4 C12,-24 42,-24 54,4" stroke="' + CONTOUR + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M-54,4 C-44,-28 -10,-28 4,4 M-4,4 C12,-24 42,-24 54,4" stroke="#8a5a33" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-26" cy="-20" r="5" fill="#3c9a62"/><circle cx="28" cy="-18" r="4" fill="#3c9a62"/></g>',
  /* à se baisser (haut) : liane qui pend (la branche basse reste la même) */
  linge: '<g><path d="M-64,-116 C-24,-126 20,-106 64,-118" stroke="' + CONTOUR + '" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M-64,-116 C-24,-126 20,-106 64,-118" stroke="#6b4426" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<path d="M-40,-118 C-46,-96 -34,-84 -40,-64 M-8,-114 C-14,-92 -2,-80 -8,-58 M26,-116 C20,-96 32,-84 26,-66 M48,-118 C44,-102 52,-92 48,-80" stroke="' + CONTOUR + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<path d="M-40,-118 C-46,-96 -34,-84 -40,-64 M-8,-114 C-14,-92 -2,-80 -8,-58 M26,-116 C20,-96 32,-84 26,-66 M48,-118 C44,-102 52,-92 48,-80" stroke="#3c9a62" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="-40" cy="-64" rx="7" ry="5" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="-8" cy="-58" rx="7" ry="5" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="26" cy="-66" rx="7" ry="5" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="-36" cy="-92" rx="6" ry="4" fill="#5fcf86"/><ellipse cx="-12" cy="-88" rx="6" ry="4" fill="#5fcf86"/><ellipse cx="30" cy="-94" rx="6" ry="4" fill="#5fcf86"/></g>',
  /* à éviter (bloc) : rocher moussu, souche, buisson, gros rochers, cercle de champignons, hérisson, rondin qui roule */
  caisse: '<g><path d="M-38,2 C-44,-20 -28,-46 -4,-48 C22,-50 40,-30 38,-8 C38,-2 36,2 32,2 Z" fill="#6f7a6a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-30,-30 C-18,-46 10,-50 26,-36 C16,-30 -12,-26 -30,-30 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/></g>',
  tonneau: '<g><path d="M-36,2 C-30,-2 -28,-6 -26,-10 L-24,-44 C-10,-50 10,-50 24,-44 L26,-10 C28,-6 30,-2 36,2 Z" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-44" rx="24" ry="8" fill="#d9a066" stroke="' + CONTOUR + '" stroke-width="4"/><ellipse cx="0" cy="-44" rx="13" ry="4" fill="none" stroke="#a8743f" stroke-width="2.5"/><path d="M-12,-36 L-12,-6 M8,-34 L8,-4" stroke="#6b4426" stroke-width="3"/></g>',
  foin: '<g><path d="M-46,2 C-52,-22 -36,-46 -16,-42 C-8,-58 18,-58 26,-42 C44,-46 54,-22 46,2 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-26,-22 C-20,-30 -10,-30 -6,-22 M8,-32 C14,-40 24,-38 28,-30" stroke="#5fcf86" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="-30" cy="-8" r="4" fill="#e5484d"/><circle cx="20" cy="-14" r="4" fill="#e5484d"/></g>',
  charrette: '<g><path d="M-46,2 C-52,-24 -36,-58 -6,-60 C24,-62 46,-40 44,-10 C44,-4 42,2 38,2 Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M14,2 C10,-14 22,-30 38,-28 C52,-26 58,-12 54,2 Z" fill="#6f7a6a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-36,-40 C-22,-56 4,-60 22,-50 C10,-44 -18,-38 -36,-40 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/></g>',
  etal: '<g><ellipse cx="0" cy="0" rx="50" ry="11" fill="#2f5a3a" opacity=".8"/>' +
    '<path d="M-38,0 L-38,-16 M-12,-2 L-12,-28 M14,-2 L14,-20 M36,0 L36,-14" stroke="' + CONTOUR + '" stroke-width="10" stroke-linecap="round"/><path d="M-38,0 L-38,-16 M-12,-2 L-12,-28 M14,-2 L14,-20 M36,0 L36,-14" stroke="#f3e7cb" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M-52,-14 C-50,-30 -26,-30 -24,-14 Z M-30,-26 C-28,-48 4,-48 6,-26 Z M0,-18 C2,-36 26,-36 28,-18 Z M24,-12 C26,-28 46,-28 48,-12 Z" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<circle cx="-16" cy="-38" r="3" fill="#fff"/><circle cx="-4" cy="-34" r="2.6" fill="#fff"/><circle cx="12" cy="-28" r="2.6" fill="#fff"/><circle cx="-40" cy="-22" r="2.4" fill="#fff"/><circle cx="36" cy="-20" r="2.4" fill="#fff"/></g>',
  poule: '<g><path d="M-26,-2 C-30,-26 -10,-42 10,-38 C26,-34 32,-20 28,-2 Z" fill="#8a6a4a" stroke="' + CONTOUR + '" stroke-width="5"/>' +
    '<path d="M-24,-14 l-8,-6 M-20,-26 l-6,-9 M-10,-34 l-2,-11 M2,-38 l3,-11 M14,-36 l7,-9 M-14,-20 l-6,-7 M-2,-28 l0,-9 M10,-26 l5,-8" stroke="' + CONTOUR + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M22,-20 C30,-24 40,-18 40,-10 C36,-4 26,-4 22,-8 Z" fill="#e8d7ae" stroke="' + CONTOUR + '" stroke-width="3.5"/><circle cx="40" cy="-11" r="2.6" fill="' + CONTOUR + '"/><circle cx="31" cy="-15" r="2" fill="' + CONTOUR + '"/><path d="M-8,-2 L-10,6 M10,-2 L12,6" stroke="' + CONTOUR + '" stroke-width="4" stroke-linecap="round"/></g>',
  roule: '<g class="mja-roule"><circle cx="0" cy="-28" r="30" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="0" cy="-28" r="22" fill="#d9a066" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="0" cy="-28" r="14" fill="none" stroke="#a8743f" stroke-width="3"/><circle cx="0" cy="-28" r="6" fill="none" stroke="#a8743f" stroke-width="3"/><path d="M0,-50 L0,-40" stroke="#6b4426" stroke-width="3"/></g>',
  /* le raccourci : des arches de bois couvertes de feuilles (et le buisson du milieu reste la haie) */
  arche: '<g><path d="M-58,4 L-58,-90 C-58,-150 58,-150 58,-90 L58,4 L36,4 L36,-86 C36,-120 -36,-120 -36,-86 L-36,4 Z" fill="#6b4a2e" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-36,4 L-36,-86 C-36,-120 36,-120 36,-86 L36,4 Z" fill="#0c1a12" opacity=".85"/>' +
    '<circle cx="-46" cy="-112" r="18" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="-14" cy="-140" r="20" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="20" cy="-138" r="18" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="48" cy="-110" r="17" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-50,-40 L-44,-40 M-50,-70 L-44,-70 M44,-56 L50,-56" stroke="#4a3220" stroke-width="3"/></g>'
};
/* le petit chien noir et blanc qui s'enfuit, de profil (pattes et queue animées dans la boucle de jeu) */
function chienSVG(){
  var patte = function(cls, x, y, c){ return '<g transform="translate(' + x + ',' + y + ')"><g class="' + cls + '"><path d="M0,0 L-2,15" stroke="' + CONTOUR + '" stroke-width="8" stroke-linecap="round"/><path d="M0,0 L-2,15" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/></g></g>'; };
  return '<g class="mja-fuyard-corps mja-chien"><g transform="scale(1.15)">' +
    '<g transform="translate(-22,-27)"><g class="ch-queue"><path d="M0,0 C-8,-4 -14,-14 -10,-24" stroke="' + CONTOUR + '" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M0,0 C-8,-4 -14,-14 -10,-24" stroke="#f4f1ea" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-11,-18 C-13,-21 -12,-24 -10,-24" stroke="#1d1a22" stroke-width="4" fill="none" stroke-linecap="round"/></g></g>' +
    patte('ch-ar2', -14, -16, '#1d1a22') + patte('ch-av2', 14, -16, '#f4f1ea') +
    '<ellipse cx="0" cy="-23" rx="24" ry="12" fill="#f4f1ea" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<path d="M-18,-30 C-10,-37 6,-36 10,-28 C4,-20 -8,-19 -16,-24 Z" fill="#1d1a22"/>' +
    patte('ch-ar1', -16, -15, '#1d1a22') + patte('ch-av1', 16, -15, '#f4f1ea') +
    '<g transform="translate(22,-34)"><g class="ch-tete">' +
      '<ellipse cx="3" cy="1" rx="13" ry="11" fill="#f4f1ea" stroke="' + CONTOUR + '" stroke-width="4"/>' +
      '<path d="M-7,-5 C-3,-12 7,-12 11,-6 C9,1 1,3 -5,0 Z" fill="#1d1a22"/>' +
      '<ellipse cx="15" cy="5" rx="7" ry="5" fill="#f4f1ea" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="21" cy="3.5" r="3" fill="#1d1a22"/>' +
      '<circle cx="6" cy="-2" r="2.4" fill="#fff"/><circle cx="6.5" cy="-2" r="1.4" fill="#1d1a22"/>' +
      '<path d="M-6,-8 C-15,-10 -15,6 -8,7 C-5,3 -4,-3 -6,-8 Z" fill="#1d1a22" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
      '<path d="M12,11 C13,16 18,16 19,12" fill="#ff8fb3" stroke="' + CONTOUR + '" stroke-width="2"/>' +
    '</g></g></g></g>';
}
/* pattes qui galopent, queue qui frétille : appelé à chaque image avec le temps t (s) */
function animerChien(g, t, vite){
  if(!g) return;
  var ph = t * (vite || 1) * 15;
  var q = g.__q || (g.__q = {a1:g.querySelector('.ch-av1'), a2:g.querySelector('.ch-av2'), r1:g.querySelector('.ch-ar1'), r2:g.querySelector('.ch-ar2'), qu:g.querySelector('.ch-queue'), te:g.querySelector('.ch-tete')});
  if(q.a1) q.a1.setAttribute('transform', 'rotate(' + (38 * Math.sin(ph)).toFixed(1) + ')');
  if(q.a2) q.a2.setAttribute('transform', 'rotate(' + (38 * Math.sin(ph + 1.2)).toFixed(1) + ')');
  if(q.r1) q.r1.setAttribute('transform', 'rotate(' + (-38 * Math.sin(ph + .4)).toFixed(1) + ')');
  if(q.r2) q.r2.setAttribute('transform', 'rotate(' + (-38 * Math.sin(ph + 1.6)).toFixed(1) + ')');
  if(q.qu) q.qu.setAttribute('transform', 'rotate(' + (24 * Math.sin(t * 22)).toFixed(1) + ')');
  if(q.te) q.te.setAttribute('transform', 'translate(0,' + (1.5 * Math.sin(ph * 2)).toFixed(1) + ')');
}
var HZ = 168, BAS = 470;
function projette(p){ var e = Math.pow(fixe(p, 0, 1.3), 1.7); return {e:e, y:HZ + (BAS - HZ) * e, s:0.07 + 0.93 * e}; }
var LANE_H = [168, 180, 192], LANE_B = [62, 180, 298];
function laneX(l, e){ var a = Math.floor(fixe(l, 0, 2)), b = Math.min(2, a + 1), f = l - a; var xa = LANE_H[a] + (LANE_B[a] - LANE_H[a]) * e, xb = LANE_H[b] + (LANE_B[b] - LANE_H[b]) * e; return xa + (xb - xa) * f; }
function routeSVG(id, decor){
  if(decor === 'foret') return foretSVG(id);
  var s = '<defs><linearGradient id="' + id + 'ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141038"/><stop offset=".55" stop-color="#3b2a6a"/><stop offset=".85" stop-color="#7a4a86"/><stop offset="1" stop-color="#e08a6a"/></linearGradient>' +
    '<linearGradient id="' + id + 'sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a3a"/><stop offset="1" stop-color="#12261f"/></linearGradient>' +
    '<linearGradient id="' + id + 'rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5e4a"/><stop offset="1" stop-color="#b48a62"/></linearGradient></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + (HZ - DEC.y) + '" fill="url(#' + id + 'ciel)"/>';
  for(var i = 0; i < 30; i++) s += '<circle class="mja-etoile" cx="' + U.rand(-230, 590).toFixed(0) + '" cy="' + U.rand(-210, 110).toFixed(0) + '" r="' + U.rand(.8, 1.8).toFixed(1) + '" fill="#eef0ff" style="animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"/>';
  s += '<circle cx="290" cy="58" r="26" fill="#fff4d0" opacity=".92"/><circle cx="290" cy="58" r="44" fill="#fff4d0" opacity=".12"/>' +
    '<path d="M-240,' + HZ + ' L-240,120 L-200,100 L-150,130 L-100,96 L-50,126 L0,104 L30,96 L58,128 L92,84 L130,130 L160,108 L200,132 L240,92 L280,128 L320,100 L360,126 L400,96 L450,124 L500,102 L560,128 L600,110 L600,' + HZ + ' Z" fill="#241d44"/>' +
    '<path d="M-240,' + HZ + ' L-240,146 C-120,136 -40,150 60,142 C140,136 220,150 300,142 C400,134 500,148 600,140 L600,' + HZ + ' Z" fill="#1a2a2e"/>' +
    '<rect x="' + DEC.x + '" y="' + HZ + '" width="' + DEC.w + '" height="' + (DEC.y + DEC.h - HZ) + '" fill="url(#' + id + 'sol)"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720 L-200,720 Z" fill="url(#' + id + 'rt)" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L-200,720 M' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720" stroke="#5e4634" stroke-width="5"/>';
  return s;
}
/* la forêt au crépuscule : lumière verte et dorée, rangées de sapins à l'horizon, sol de mousse, sentier de terre, lucioles */
function foretSVG(id){
  var s = '<defs><linearGradient id="' + id + 'ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2219"/><stop offset=".5" stop-color="#244a33"/><stop offset=".82" stop-color="#5f7a3e"/><stop offset="1" stop-color="#d9a65a"/></linearGradient>' +
    '<linearGradient id="' + id + 'sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4a2c"/><stop offset="1" stop-color="#0f1f15"/></linearGradient>' +
    '<linearGradient id="' + id + 'rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4430"/><stop offset="1" stop-color="#8f6e48"/></linearGradient></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + (HZ - DEC.y) + '" fill="url(#' + id + 'ciel)"/>' +
    '<circle cx="250" cy="132" r="34" fill="#ffe3a3" opacity=".55"/><circle cx="250" cy="132" r="64" fill="#ffe3a3" opacity=".12"/>';
  for(var i = 0; i < 26; i++) s += '<circle class="mja-etoile" cx="' + U.rand(-230, 590).toFixed(0) + '" cy="' + U.rand(-120, HZ + 140).toFixed(0) + '" r="' + U.rand(1.2, 2.4).toFixed(1) + '" fill="#d8ff8a" style="animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"/>';
  var rang = function(y0, h, pas, coul){ var d = 'M-240,' + HZ; for(var x = -240; x <= 600; x += pas){ d += ' L' + x + ',' + (y0 - U.rand(h * .5, h)).toFixed(0) + ' L' + (x + pas / 2) + ',' + y0; } return '<path d="' + d + ' L600,' + HZ + ' Z" fill="' + coul + '"/>'; };
  s += rang(HZ - 14, 70, 34, '#15301f') + rang(HZ, 46, 26, '#0e2417') +
    '<rect x="' + DEC.x + '" y="' + HZ + '" width="' + DEC.w + '" height="' + (DEC.y + DEC.h - HZ) + '" fill="url(#' + id + 'sol)"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720 L-200,720 Z" fill="url(#' + id + 'rt)" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L-200,720 M' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720" stroke="#2f4a2a" stroke-width="7"/>';
  return s;
}
function silhouetteSVG(){
  return '<g class="mja-fuyard-corps"><path d="M-15,0 C-17,-20 -13,-40 0,-48 C13,-40 17,-20 15,0 Z" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-14,-4 l-9,7 M14,-4 l9,7 M-11,-22 l-11,3 M11,-22 l11,3" stroke="#1d1730" stroke-width="5" stroke-linecap="round"/><path d="M-10,-40 C-6,-50 6,-50 10,-40" stroke="#3b2a6a" stroke-width="3" fill="none"/><circle cx="-4" cy="-38" r="2" fill="#ffd36a"/><circle cx="4" cy="-38" r="2" fill="#ffd36a"/></g>';
}
MJ.enregistrer('poursuite', {
  nom:'Course-poursuite', role:'pisteur', ic:'🏃',
  consigne:function(p){ return 'Rattrape ' + (p && p.fuyard === 'chien' ? 'le petit chien' : 'la silhouette') + ' en glissant ton doigt : à gauche ou à droite pour changer de couloir, vers le haut pour sauter, vers le bas pour glisser !'; },
  /* dessins réutilisés par l'écran d'accueil (mj-regles.js) : le chien et les obstacles de la forêt */
  art:{chien:chienSVG, animerChien:animerChien, foret:FORET_P},
  minuteur:false,
  reglages: function(n, mods){
    var p = {niveau:n};
    var lent = (mods.lent || 1) / (1 + 0.05 * Math.min(4, mods.temps || 0));
    p.approche = courbe(n, {1:2.2, 3:1.82, 5:1.78, 9:1.62, 12:1.52}) / lent;
    p.intervalle = courbe(n, {1:1.3, 3:0.96, 5:0.88, 9:0.74, 12:0.66}) / lent * (1 - 0.1 * fixe(mods.obstacles || 0, -4, 3));
    p.saut = 0.66 * (mods.zone || 1);
    p.grace = 0.035 * ((mods.zone || 1) - 1) * 3;
    p.aDistance = 2;
    p.perdu = 3 + (mods.erreurs || 0);
    p.rattrape = (mods.vitesse || 0) > 0 ? 8 : 10;
    p.aide = (mods.aide || 0) > 0;
    p.conseils = (mods.aide || 0) * 6;
    p.revele = !!mods.revele;
    p.raccourci = n >= 4 ? courbe(n, {4:0.04, 9:0.07}) : 0;
    p.poids = {un:3, deux:courbe(n, {1:2, 6:3}), saut:1.6, bas1:1.6, glisse:n >= 2 ? 1.6 : 0, poule:n >= 3 ? 1.2 : 0, mixteS:n >= 3 ? courbe(n, {3:1, 8:2}) : 0,
      enchaine:n >= 3 ? courbe(n, {3:0.8, 6:1.6, 9:2.4}) : 0, roule:n >= 4 ? 1 : 0, mixteG:n >= 5 ? 1.4 : 0, triple:n >= 7 ? courbe(n, {7:0.8, 10:1.6}) : 0};
    var noms = {un:'📦', deux:'🚧', saut:'⤒', bas1:'🐕', glisse:'⤓', poule:'🐔', mixteS:'🔀', enchaine:'⚡', roule:'🛢️', mixteG:'🧺', triple:'🏪'};
    p.lignes = [
      {nom:'Vitesse de course', val:n <= 5 ? 'normale' : (n <= 8 ? 'un peu plus rapide' : 'rapide')},
      {nom:'Obstacles', val:Object.keys(p.poids).filter(function(k){ return p.poids[k] > 0; }).map(function(k){ return noms[k]; }).join(' ')},
      {nom:'Obstacles serrés', val:p.intervalle > 1.1 ? 'un peu' : (p.intervalle > 0.85 ? 'beaucoup' : 'énormément')},
      {nom:'Pour la rattraper', val:'2 fois ' + p.rattrape + ' obstacles sans faute'},
      {nom:'Elle s\'échappe si', val:'tu prends ' + p.perdu + ' pas de retard'}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect x="-60" width="420" height="170" fill="#2c4a3a"/><path d="M140,10 L160,10 L270,170 L30,170 Z" fill="#a37c5a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M147,10 L105,170 M153,10 L195,170" stroke="#e8d7ae" stroke-width="2" stroke-dasharray="8 8"/>');
    d.contenu.innerHTML = '<g class="mja-obs-demo">' + OBSTACLES_P.barriere + '</g><g class="mja-obs-demo2">' + OBSTACLES_P.charrette + '</g><g class="mja-coureur-demo"><circle cx="0" cy="-26" r="11" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-14,-12 C-14,-22 14,-22 14,-12 L12,8 L-12,8 Z" fill="#3a8a5a" stroke="' + CONTOUR + '" stroke-width="4"/></g>';
    var obs = d.contenu.querySelector('.mja-obs-demo'), obs2 = d.contenu.querySelector('.mja-obs-demo2'), cour = d.contenu.querySelector('.mja-coureur-demo');
    function placer(o, x, y, s, ms){ o.style.transition = 'transform ' + (ms || 0) + 'ms linear, opacity .2s'; o.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')'; }
    return scenario([
      [10, function(){ obs.style.opacity = '0'; obs2.style.opacity = '1'; placer(obs2, 150, 20, 0.12); placer(cour, 150, 160, 1); d.vers(150, 160, 0); placer(obs, 225, 20, 0.12); }],
      [150, function(){ placer(obs2, 150, 160, 1.1, 1200); obs.style.opacity = '1'; placer(obs, 225, 160, 1.1, 1700); }],
      [550, function(){ d.vers(150, 140, 0); d.appuie(true); d.vers(230, 140, 300); }],
      [280, function(){ d.appuie(false); placer(cour, 225, 160, 1, 160); U.son('pas'); }],
      [650, function(){ d.vers(225, 150, 0); d.appuie(true); d.vers(225, 90, 300); }],
      [280, function(){ d.appuie(false); placer(cour, 225, 112, 1, 200); U.son('pas'); }],
      [380, function(){ placer(cour, 225, 160, 1, 220); obs2.style.opacity = '0'; }],
      [500, function(){ obs.style.opacity = '0'; }]
    ], 400);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var hud = creerHud(el);
    hud.el.classList.add('mja-hud-course');
    /* variante : params.fuyard = 'chien' (le petit chien noir et blanc), params.decor = 'foret' ; sinon, comme avant */
    var CHIEN = p.fuyard === 'chien', FORET = p.decor === 'foret';
    var TX = CHIEN ? {raccourci:'👀 Il prend un raccourci !', aie:'Aïe ! Il s\'éloigne…', perdue:'💨 Il s\'échappe…', attrapee:'🙌 Attrapé !', tAttrapee:'attrapé', tPerdue:'perdu',
        rate:'Le petit chien a disparu entre les arbres…', gagne:'Tu as rattrapé le petit chien !'}
      : {raccourci:'👀 Elle prend un raccourci !', aie:'Aïe ! Elle s\'éloigne…', perdue:'💨 Elle s\'échappe…', attrapee:'🙌 Attrapée !', tAttrapee:'attrapée', tPerdue:'perdue',
        rate:'La silhouette a disparu à l\'horizon…', gagne:'Tu as rattrapé la silhouette !'};
    var terrain = U.html('<div class="mja-terrain mja-poursuite' + (FORET ? ' foret' : '') + '"></div>');
    el.appendChild(terrain);
    var id = nid('po');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' + routeSVG(id, FORET ? 'foret' : '') +
      '<g class="mja-bords"></g><g class="mja-tirets"></g><g class="mja-sol-obs"></g>' +
      '<g class="mja-fuyard">' + (CHIEN ? chienSVG() : silhouetteSVG()) + '<text class="mja-fuyard-ex" x="0" y="-58" text-anchor="middle">!</text></g>' +
      '<g class="mja-obstacles"></g>' +
      '<g class="mja-coureur"><ellipse class="mja-ombre-c" cx="0" cy="6" rx="30" ry="8" fill="#000" opacity=".3"/><g class="mja-coureur-corps">' +
        '<path class="mja-jambe g" d="M-10,-6 L-14,10" stroke="' + CONTOUR + '" stroke-width="9" stroke-linecap="round"/><path class="mja-jambe d" d="M10,-6 L14,10" stroke="' + CONTOUR + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M-26,-12 C-28,-44 -18,-62 0,-64 C18,-62 28,-44 26,-12 C14,-6 -14,-6 -26,-12 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="5"/>' +
        '<path d="M-18,-58 C-18,-80 18,-80 18,-58 C12,-52 -12,-52 -18,-58 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="5"/>' +
        '<path d="M-6,-40 L6,-40 L4,-18 L-4,-18 Z" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/>' +
        '<path d="M14,-56 L22,-66 M18,-54 L28,-60" stroke="#8ff3ff" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="mja-etoiles-choc"><path d="M-30,-80 l3,-8 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 Z M24,-86 l2,-6 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2 Z" fill="#ffe3a3" stroke="' + CONTOUR + '" stroke-width="1.5"/></g>' +
      '</g></g>' +
      '<g class="mja-conseil" opacity="0"><circle r="20" fill="#14112a" stroke="#8ff3ff" stroke-width="3"/><text class="mja-conseil-t" y="8" text-anchor="middle"></text></g>' +
    '</svg>' +
    '<div class="mja-pad"><button class="mja-pb" data-k="g" type="button" aria-label="À gauche">◀</button><button class="mja-pb" data-k="h" type="button" aria-label="Sauter">⤒</button><button class="mja-pb" data-k="b" type="button" aria-label="Glisser">⤓</button><button class="mja-pb" data-k="d" type="button" aria-label="À droite">▶</button></div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var gObs = svg.querySelector('.mja-obstacles'), gSol = svg.querySelector('.mja-sol-obs'), gBords = svg.querySelector('.mja-bords'), gTirets = svg.querySelector('.mja-tirets');
    var coureur = svg.querySelector('.mja-coureur'), corps = svg.querySelector('.mja-coureur-corps'), ombre = svg.querySelector('.mja-ombre-c'), fuyard = svg.querySelector('.mja-fuyard'), conseil = svg.querySelector('.mja-conseil'), conseilT = svg.querySelector('.mja-conseil-t');

    /* HUD discret : la rangée des pas (attrapée … perdue) et le compteur sans faute */
    var rangee = hud.badge(''); rangee.className = 'mja-pas-rangee';
    var compteur = document.createElement('div'); compteur.className = 'mja-sans-faute'; hud.el.appendChild(compteur);
    var pas = 0, sansFaute = 0;
    function majHud(anim){
      var s = '<span class="mja-pas-bout" title="' + TX.tAttrapee + '">🙌</span>';
      for(var k = -1; k < p.perdu; k++) s += '<span class="mja-pas-pt' + (k === pas ? ' ici' : '') + (k === 0 ? ' depart' : '') + '"></span>';
      s += '<span class="mja-pas-bout" title="' + TX.tPerdue + '">💨</span>';
      rangee.innerHTML = s;
      compteur.innerHTML = 'Sans faute : <b>' + sansFaute + '</b>/' + p.rattrape;
      if(anim){ compteur.classList.remove('pop'); void compteur.offsetWidth; compteur.classList.add('pop'); }
      /* les cœurs : les chocs encore permis avant qu'elle s'échappe (un rattrapage en rend un) */
      hud.coeurs(Math.max(0, p.perdu - 1 - pas), p.perdu - 1, anim === 'choc' ? Math.max(0, p.perdu - 1 - pas) : undefined);
    }
    majHud();

    /* Décor qui défile */
    var arbres = [];
    for(var i = 0; i < 12; i++){
      var g = svgNoeud('g', {}, gBords);
      if(FORET && i % 2 === 1) g.innerHTML = '<path d="M0,0 L0,-56" stroke="' + CONTOUR + '" stroke-width="16"/><path d="M0,0 L0,-56" stroke="#5e3f26" stroke-width="10"/><circle cx="0" cy="-92" r="42" fill="#245e3c" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-20" cy="-104" r="20" fill="#2f7a4c"/><circle cx="16" cy="-84" r="16" fill="#2f7a4c"/><path d="M-22,0 C-30,-14 -16,-18 -10,-8 M22,0 C30,-14 16,-18 10,-8" stroke="#3c9a62" stroke-width="5" fill="none" stroke-linecap="round"/>';
      else if(i % 4 === 3 && !FORET) g.innerHTML = '<path d="M0,0 L0,-120" stroke="' + CONTOUR + '" stroke-width="8"/><path d="M0,0 L0,-120" stroke="#3b3346" stroke-width="4"/><rect x="-11" y="-146" width="22" height="28" rx="4" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="4"/><circle cy="-132" r="30" fill="#ffd36a" opacity=".18"/>';
      else g.innerHTML = '<path d="M0,0 L0,-30" stroke="#4a3220" stroke-width="10"/><path d="M-34,-24 L0,-120 L34,-24 Z" fill="#1f5a40" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-26,-60 L0,-140 L26,-60 Z" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/>';
      arbres.push({g:g, p:(i % 6) / 6, cote:i < 6 ? -1 : 1, loin:(i % 2) ? 1.6 : 1});
    }
    var tirets = [];
    for(var k = 0; k < 12; k++) tirets.push({l:svgNoeud('line', {'class':'mja-tiret'}, gTirets), p:(k % 6) / 6, voie:k < 6 ? 0.5 : 1.5});
    if(FORET) tirets.forEach(function(tr){ tr.l.style.stroke = '#c9b48a'; tr.l.style.opacity = '.4'; });

    /* État */
    var voie = 1, xJ = LANE_B[1], saut = 0, glisse = 0, fini = false, t = 0, vagues = [], prochain = 1.1, nVagues = 0, etat = 'course';
    var choc = 0, invuln = 0, vitesseC = 1, fuyX = 1, fuyCible = 1, fuyChange = 2, pF = 0.38, raccourci = null, finT = 0;
    function pFcible(){ var f = fixe((pas + p.aDistance) / (p.perdu + p.aDistance), 0, 1); return 0.86 * Math.pow(1 - f, 1.6); }
    pF = pFcible();
    /* Commandes */
    function action(k){
      if(fini || etat !== 'course') return;
      if(k === 'g' || k === 'd'){
        var v = fixe(voie + (k === 'g' ? -1 : 1), 0, 2);
        if(v !== voie){ voie = v; U.son('pas'); }
        else { corps.classList.remove('bute'); void corps.getBoundingClientRect(); corps.classList.add('bute'); }
      } else if(k === 'h'){ if(saut <= 0 && glisse <= 0){ saut = p.saut; U.son('pas'); } }
      else if(k === 'b'){ if(saut <= 0.12 && glisse <= 0){ saut = 0; glisse = p.saut; U.son('pas'); } }
    }
    terrain.querySelectorAll('.mja-pb').forEach(function(b){ P.ecoute(b, 'pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); action(b.getAttribute('data-k')); }); });
    var geste = null;
    P.ecoute(svg, 'pointerdown', function(e){ e.preventDefault(); geste = {x:e.clientX, y:e.clientY, fait:false, id:e.pointerId}; try{ svg.setPointerCapture(e.pointerId); }catch(er){} });
    P.ecoute(svg, 'pointermove', function(e){
      if(!geste || geste.fait || e.pointerId !== geste.id) return;
      var dx = e.clientX - geste.x, dy = e.clientY - geste.y;
      if(Math.max(Math.abs(dx), Math.abs(dy)) > 24){ geste.fait = true; action(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'g' : 'd') : (dy < 0 ? 'h' : 'b')); }
    });
    P.ecoute(svg, 'pointerup', function(e){
      if(geste && !geste.fait){ var r = svg.getBoundingClientRect(); action(e.clientX - r.left < r.width / 2 ? 'g' : 'd'); }
      geste = null;
    });
    P.ecoute(svg, 'pointercancel', function(){ geste = null; });
    P.ecoute(document, 'keydown', function(e){
      var kk = {ArrowLeft:'g', ArrowRight:'d', ArrowUp:'h', ArrowDown:'b'}[e.key];
      if(kk){ action(kk); e.preventDefault(); }
    });

    /* Fabrication des vagues */
    var BLOCS = ['caisse', 'tonneau', 'foin', 'rocher', 'charrette', 'etal'], BAS1 = ['flaque', 'chien', 'tronc', 'barriere'];
    function objet(type, voieO, en){
      var o = {type:type, genre:GENRE_P[type], voie:voieO, de:voieO, vers:voieO};
      o.g = svgNoeud('g', {'class':'mja-obstacle g-' + o.genre + (p.aide ? ' tot' : '')}, (type === 'flaque' || o.genre === 'boost') ? gSol : gObs);
      o.g.innerHTML = (FORET && FORET_P[type]) || OBSTACLES_P[type];
      if(en) Object.assign(o, en);
      return o;
    }
    function choisirGenre(){
      var cles = Object.keys(p.poids).filter(function(k){ return p.poids[k] > 0; });
      var tot = cles.reduce(function(a, k){ return a + p.poids[k]; }, 0), r = Math.random() * tot;
      for(var i = 0; i < cles.length; i++){ r -= p.poids[cles[i]]; if(r <= 0) return cles[i]; }
      return 'un';
    }
    function pousser(objs, decale){ nVagues++; vagues.push({p:-(decale || 0), objs:objs, conseil:nVagues <= p.conseils || p.revele, compte:false, vit:objs.some(function(o){ return o.rapide; }) ? 1.7 : 1}); }
    function lancerVague(){
      var genre = choisirGenre(), libre = U.randInt(0, 2), autres = [0, 1, 2].filter(function(v){ return v !== libre; }), objs = [];
      if(genre === 'un') objs.push(objet(U.choix(BLOCS), U.randInt(0, 2)));
      else if(genre === 'deux') autres.forEach(function(v){ objs.push(objet(U.choix(BLOCS), v)); });
      else if(genre === 'saut'){ var tb = U.choix(['barriere', 'tronc', 'barriere']); [0, 1, 2].forEach(function(v){ objs.push(objet(tb, v)); }); }
      else if(genre === 'bas1'){ objs.push(objet(U.choix(BAS1), autres[0])); if(Math.random() < 0.5) objs.push(objet(U.choix(BAS1), autres[1])); }
      else if(genre === 'glisse'){ var tg = Math.random() < .5 ? 'linge' : 'branche'; [0, 1, 2].forEach(function(v){ objs.push(objet(tg, v)); }); }
      else if(genre === 'poule'){ var de = U.choix([0, 2]); objs.push(objet('poule', de, {de:de, vers:2 - de, mobile:true})); if(Math.random() < 0.4) objs.push(objet(U.choix(BAS1), 1)); }
      else if(genre === 'mixteS'){ objs.push(objet(U.choix(BLOCS), libre)); autres.forEach(function(v){ objs.push(objet(U.choix(['barriere', 'chien', 'flaque']), v)); }); }
      else if(genre === 'mixteG'){ objs.push(objet(U.choix(BLOCS), libre)); autres.forEach(function(v){ objs.push(objet('branche', v)); }); }
      else if(genre === 'roule') objs.push(objet('roule', U.randInt(0, 2), {rapide:1.7}));
      else if(genre === 'triple'){ autres.forEach(function(v){ objs.push(objet(U.choix(BLOCS), v)); }); pousser(objs); objs = [objet(U.choix(['linge', 'branche']), libre), objet(U.choix(BLOCS), autres[0]), objet(U.choix(BLOCS), autres[1])]; pousser(objs, 0.3); return; }
      else if(genre === 'enchaine'){
        /* changer vite de couloir… puis sauter */
        var ici = voie, cible = U.choix([0, 1, 2].filter(function(v){ return v !== ici; }));
        [0, 1, 2].filter(function(v){ return v !== cible; }).forEach(function(v){ objs.push(objet(U.choix(BLOCS), v)); });
        pousser(objs);
        pousser([0, 1, 2].map(function(v){ return objet(v === cible ? U.choix(['barriere', 'chien', 'flaque']) : U.choix(BLOCS), v); }), 0.27);
        return;
      }
      pousser(objs);
    }
    function lancerRaccourci(){
      var cote = raccourci.cote;
      pousser([objet('arche', 0, {arche:cote === 0}), objet('haie', 1), objet('arche', 2, {arche:cote === 2})]);
      vagues[vagues.length - 1].raccourci = true;
    }
    function texte(s, cls){ var q = pctDans(svg, terrain, xJ, 360); flotter(terrain, q.x, q.y, s, cls); }
    function heurte(o){
      if(invuln > 0) return;
      if(o) o.g.classList.add('casse');
      erreurSensorielle(terrain);
      corps.classList.remove('trebuche'); void corps.getBoundingClientRect(); corps.classList.add('trebuche');
      choc = 0.9; invuln = 0.9; vitesseC = 0.5;
      sansFaute = 0; pas++;
      texte(TX.aie, 'ko');
      majHud('choc');
      if(pas === p.perdu - 1) U.plusDeCoeur(terrain);
      if(pas >= p.perdu){ etat = 'perdue'; finT = 0; annonce(terrain, TX.perdue, 1300); }
    }
    function propre(){
      sansFaute++;
      U.son('tic');
      if(sansFaute >= p.rattrape){
        sansFaute = 0; pas--;
        U.son('gain'); U.vibrer(20);
        coureur.classList.remove('sprint'); void coureur.getBoundingClientRect(); coureur.classList.add('sprint');
        texte('Je me rapproche !', 'ok');
        if(pas <= -p.aDistance){ etat = 'attrape'; finT = 0; fuyard.classList.add('attrape'); U.son('victoire'); annonce(terrain, TX.attrapee, 1300); }
      }
      majHud(true);
    }
    function conseilPour(ev){
      var dans = ev.objs.filter(function(o){ return Math.round(o.voie) === voie && o.genre !== 'boost'; });
      if(ev.raccourci){ var c = raccourci ? raccourci.cote : -1; return voie === c ? '' : (c < voie ? '◀' : '▶'); }
      if(!dans.length) return '';
      if(dans.every(function(o){ return o.genre === 'bas'; })) return '⤒';
      if(dans.every(function(o){ return o.genre === 'haut'; })) return '⤓';
      var sur = [0, 1, 2].filter(function(v){ return !ev.objs.some(function(o){ return Math.round(o.voie) === v && o.genre === 'bloc'; }); });
      sur.sort(function(a, b){ return Math.abs(a - voie) - Math.abs(b - voie); });
      return sur.length ? (sur[0] < voie ? '◀' : '▶') : '';
    }
    terrain.mjaEtat = function(){ return {voie:voie, saut:saut, glisse:glisse, pas:pas, sansFaute:sansFaute, etat:etat, nVagues:nVagues, faites:faites, chocs:chocs, invuln:invuln, vagues:vagues.map(function(v){ return {p:v.p, raccourci:!!v.raccourci, objs:v.objs.map(function(o){ return {genre:o.genre, voie:Math.round(o.voie), arche:o.arche}; })}; }), cote:raccourci ? raccourci.cote : -1}; };
    var faites = 0, chocs = 0;

    var PC = 0.93;
    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      if(choc > 0) choc -= dt;
      if(invuln > 0) invuln -= dt;
      vitesseC += ((choc > 0 ? 0.5 : 1) - vitesseC) * Math.min(1, dt * 3);
      var V = vitesseC;
      /* fins : on la voit s'éloigner ou on l'attrape */
      pF += (pFcible() - pF) * Math.min(1, dt * 2.2);
      if(etat === 'perdue'){
        finT += dt; pF = Math.max(-0.05, pF - dt * 0.15);
        fuyard.style.opacity = Math.max(0, 1 - finT / 1.1).toFixed(2);
        if(finT > 1.2 && !fini){ fini = true; P.finir({reussi:false, score:0, erreurs:chocs, detail:TX.rate}, 400); }
      } else if(etat === 'attrape'){
        finT += dt; pF = Math.min(0.9, pF + dt * 1.2);
        if(finT > 1.1 && !fini){ fini = true; P.finir({reussi:true, score:1, erreurs:chocs, detail:TX.gagne}, 500); }
      }
      if(saut > 0) saut = Math.max(0, saut - dt);
      if(glisse > 0) glisse = Math.max(0, glisse - dt);
      /* raccourcis de la silhouette */
      if(etat === 'course' && !raccourci && p.raccourci && nVagues > 4 && Math.random() < p.raccourci * dt){
        var cote = U.choix([0, 2]);
        raccourci = {cote:cote, t:0};
        fuyCible = cote; fuyard.classList.add('alerte');
        annonce(terrain, TX.raccourci, 1100);
      }
      if(raccourci){ raccourci.t += dt; if(raccourci.t > 1.1 && !raccourci.lance){ raccourci.lance = true; lancerRaccourci(); } }
      else if(t > fuyChange){ fuyChange = t + U.rand(1.2, 2.6); fuyCible = U.randInt(0, 2); }
      fuyX += (fuyCible - fuyX) * Math.min(1, dt * 5);
      /* vagues : sans fin, jusqu'à l'attraper ou la perdre */
      if(etat === 'course' && !raccourci){
        prochain -= dt * V;
        if(prochain <= 0){ lancerVague(); prochain = p.intervalle * U.rand(0.85, 1.2); }
      }
      /* décor */
      arbres.forEach(function(a){
        a.p += dt * V / p.approche * 0.9; if(a.p > 1.25) a.p -= 1.25;
        var pr = projette(a.p), x = 180 + a.cote * (36 + 250 * pr.e * a.loin);
        a.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + pr.y.toFixed(1) + ') scale(' + (pr.s * 1.1).toFixed(3) + ')');
        a.g.style.opacity = a.p < 0.05 ? a.p / 0.05 : 1;
      });
      tirets.forEach(function(tr){
        tr.p += dt * V / p.approche; if(tr.p > 1.2) tr.p -= 1.2;
        var a = projette(tr.p), b = projette(tr.p + 0.06);
        tr.l.setAttribute('x1', laneX(tr.voie, a.e).toFixed(1)); tr.l.setAttribute('y1', a.y.toFixed(1)); tr.l.setAttribute('x2', laneX(tr.voie, b.e).toFixed(1)); tr.l.setAttribute('y2', b.y.toFixed(1));
        tr.l.setAttribute('stroke-width', (1 + 5 * a.e).toFixed(1));
      });
      /* coureur */
      xJ += (LANE_B[voie] - xJ) * Math.min(1, dt * 16);
      var haut = saut > 0 ? Math.sin(Math.PI * (1 - saut / p.saut)) * 64 : 0;
      var rebond = saut > 0 || glisse > 0 ? 0 : Math.abs(Math.sin(t * 11 * V)) * 5;
      var avance = etat === 'attrape' ? Math.min(1, finT / 0.9) * 150 : 0;
      coureur.setAttribute('transform', 'translate(' + xJ.toFixed(1) + ',' + (452 - avance).toFixed(1) + ') scale(' + (1 - avance / 400).toFixed(3) + ')');
      corps.setAttribute('transform', 'translate(0,' + (-haut - rebond).toFixed(1) + ')' + (glisse > 0 ? ' translate(0,8) scale(1.12,.52) rotate(-8)' : '') + (choc > 0 ? ' rotate(' + (Math.sin(t * 30) * 8).toFixed(1) + ')' : ''));
      ombre.setAttribute('rx', (30 - haut * 0.2).toFixed(1));
      coureur.classList.toggle('pas2', Math.sin(t * 11 * V) > 0 && !saut && !glisse);
      /* silhouette : plus loin = plus petite et plus haut sur la route */
      var prF = projette(Math.max(0, pF));
      var cache = raccourci && raccourci.disparu;
      if(etat !== 'perdue') fuyard.style.opacity = cache ? '0' : '1';
      var xF = etat === 'attrape' ? xJ : laneX(fuyX, prF.e);
      fuyard.setAttribute('transform', 'translate(' + xF.toFixed(1) + ',' + (prF.y + 4 - Math.abs(Math.sin(t * 9)) * 2).toFixed(1) + ') scale(' + (0.55 + prF.s * 1.6).toFixed(3) + ')');
      if(CHIEN && etat !== 'attrape') animerChien(fuyard, t, V);
      /* vagues */
      var conseilTxt = '';
      vagues.forEach(function(ev){
        ev.p += dt * V * ev.vit / p.approche;
        if(raccourci && ev.raccourci && !raccourci.disparu && ev.p > pF){ raccourci.disparu = true; fuyard.classList.remove('alerte'); }
        var pr = projette(Math.max(0, ev.p));
        ev.objs.forEach(function(o){
          if(o.mobile){ var f = lisse(fixe((ev.p - 0.25) / 0.55, 0, 1)); o.voie = o.de + (o.vers - o.de) * f; }
          var sc = pr.s * (o.genre === 'arche' || o.genre === 'haut' ? 1.05 : 1);
          o.g.setAttribute('transform', 'translate(' + laneX(o.voie, pr.e).toFixed(1) + ',' + pr.y.toFixed(1) + ') scale(' + (o.type === 'poule' && o.vers < o.de ? -sc : sc).toFixed(3) + ',' + sc.toFixed(3) + ')');
          o.g.style.opacity = ev.p < 0 ? '0' : (p.aide ? '' : (ev.p < 0.1 ? (ev.p / 0.1 * 0.6).toFixed(2) : ''));
        });
        if(!ev.compte && ev.conseil && ev.p > (p.aide ? 0.15 : 0.28) && ev.p < PC) conseilTxt = conseilPour(ev) || conseilTxt;
        if(!ev.compte && ev.p >= PC + p.grace && etat === 'course'){
          ev.compte = true;
          if(ev.raccourci){
            if(voie === raccourci.cote){ faites++; propre(); texte('Bien vu !', 'ok'); }
            else { chocs++; heurte(voie === 1 ? ev.objs[1] : null); if(voie !== 1) texte('Pas par là !', 'ko'); }
            raccourci = null; prochain = p.intervalle * 0.8;
          } else {
            var touche = null, avecObs = false;
            ev.objs.forEach(function(o){
              if(o.genre === 'boost') return;
              avecObs = true;
              if(Math.round(o.voie) !== voie) return;
              if(o.genre === 'bloc') touche = touche || o;
              else if(o.genre === 'bas' && haut < 18) touche = touche || o;
              else if(o.genre === 'haut' && glisse <= 0) touche = touche || o;
            });
            if(touche){ if(invuln <= 0){ chocs++; heurte(touche); } }
            else if(avecObs){ faites++; propre(); }
          }
        }
      });
      vagues = vagues.filter(function(ev){
        if(ev.p > 1.3){ ev.objs.forEach(function(o){ if(o.g.parentNode) o.g.parentNode.removeChild(o.g); }); return false; }
        return true;
      });
      if(conseilTxt && etat === 'course'){ conseil.setAttribute('opacity', '1'); conseilT.textContent = conseilTxt; conseil.setAttribute('transform', 'translate(' + xJ.toFixed(1) + ',' + (360 - haut).toFixed(1) + ')'); }
      else conseil.setAttribute('opacity', '0');
    });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   CACHETTE (Pisteur) — vue du dessus, la nuit. On touche une
   cachette à portée (cercle bleu) pour y courir ; il faut choisir
   son chemin jusqu'à la porte. Plusieurs gardes : rondes avec pauses
   où ils balaient la rue, demi-tours imprévus, guetteurs qui pivotent.
   Une charrette roule : cachée dedans, on avance avec elle. Les tas
   de feuilles et les flaques font du bruit : les gardes viennent voir.
   (Romain, 4 nov. : on ne lance plus rien pour distraire les gardes,
   on se cache seulement.)
   Mods : erreurs (+vies), lent (gardes plus lents), zone (lanternes
   moins longues), gardes (± gardes), invisible (N s d'invisibilité,
   une fois), temps (+N s au sablier),
   aide / revele (chaque cachette dit si on peut y aller : vert/rouge).
   ========================================================== */
var COUVERTS = {
  tonneau: '<circle r="20" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="4"/><circle r="13" fill="none" stroke="#3b3346" stroke-width="3"/><circle r="5" fill="#6e4424"/>',
  buisson: '<path d="M-24,4 C-30,-10 -16,-24 -4,-20 C2,-30 22,-24 22,-10 C32,-4 26,16 12,16 C4,24 -14,22 -18,14 C-28,14 -30,8 -24,4 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="-8" cy="-6" r="3" fill="#e5484d"/><circle cx="8" cy="4" r="3" fill="#e5484d"/>',
  caisses: '<rect x="-22" y="-20" width="26" height="26" rx="3" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="4"/><rect x="-2" y="-6" width="24" height="24" rx="3" fill="#b07a3c" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-22,-20 L4,6 M-2,-6 L22,18" stroke="#7d5428" stroke-width="3"/>',
  foin: '<circle r="21" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-12,-8 C-4,-14 8,-12 12,-4 M-10,6 C-2,12 8,10 12,2" stroke="#b08a2a" stroke-width="3" fill="none"/>',
  puits: '<circle r="21" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="4"/><circle r="13" fill="#14112a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-22,0 L22,0" stroke="#8a5a33" stroke-width="4"/>'
};
var CHARRETTE = '<rect x="-30" y="-17" width="60" height="32" rx="4" fill="#a8743f" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-30,-2 L30,-2 M-10,-17 L-10,15 M10,-17 L10,15" stroke="#7d5428" stroke-width="3"/><rect x="-36" y="-23" width="10" height="44" rx="4" fill="#3b3346" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="26" y="-23" width="10" height="44" rx="4" fill="#3b3346" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-22" cy="-8" r="6" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="20" cy="6" r="7" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="2"/>';
var PORTE = '<path d="M-24,14 L-24,-12 C-24,-30 24,-30 24,-12 L24,14 Z" fill="#6e4424" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M0,-26 L0,14" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="8" cy="0" r="3" fill="#ffd36a"/><path d="M-30,14 L30,14" stroke="' + CONTOUR + '" stroke-width="5" stroke-linecap="round"/>';
var BRUYANTS = {
  feuilles: '<ellipse rx="26" ry="15" fill="#6b3f1e" opacity=".55"/>' + [[-12,-4,'#d79a3c'],[2,-8,'#c07a34'],[12,2,'#e8b04a'],[-4,6,'#a5672e'],[16,-6,'#d79a3c'],[-18,4,'#c07a34']].map(function(f){ return '<path d="M' + f[0] + ',' + f[1] + ' c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z" fill="' + f[2] + '" stroke="' + CONTOUR + '" stroke-width="1"/>'; }).join(''),
  flaque: '<ellipse rx="28" ry="14" fill="#3a5f96" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="-8" cy="-4" rx="10" ry="3" fill="#a8d4ff" opacity=".6"/>'
};
function rueNuit(id){
  var s = '<defs><pattern id="' + id + 'pv" width="30" height="22" patternUnits="userSpaceOnUse"><rect width="30" height="22" fill="#2b3150"/><path d="M1,1 h12 v9 h-12 Z M16,1 h13 v9 h-13 Z M-6,12 h13 v9 h-13 Z M9,12 h13 v9 h-13 Z M24,12 h13 v9 h-13 Z" fill="#343b60" stroke="#1d2240" stroke-width="1.5"/></pattern></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'pv)"/>';
  /* maisons des deux côtés */
  [[-240, 16], [344, 600]].forEach(function(c, k){
    var x0 = c[0], x1 = c[1];
    s += '<rect x="' + x0 + '" y="' + DEC.y + '" width="' + (x1 - x0) + '" height="' + DEC.h + '" fill="#3b2a3e"/>';
    for(var y = -200; y < 700; y += 110){
      s += '<path d="M' + x0 + ',' + y + ' L' + x1 + ',' + y + '" stroke="' + CONTOUR + '" stroke-width="5"/>';
      s += '<rect x="' + (k ? x0 + 14 : x1 - 26) + '" y="' + (y + 40) + '" width="12" height="18" rx="2" fill="#ffd36a" opacity="' + (Math.random() < .5 ? .85 : .25) + '"/>';
    }
  });
  s += '<path d="M16,' + DEC.y + ' L16,700 M344,' + DEC.y + ' L344,700" stroke="' + CONTOUR + '" stroke-width="5"/>';
  return s;
}
MJ.enregistrer('cachette', {
  nom:'Se cacher', role:'pisteur', ic:'🫥',
  consigne:'Touche une cachette entourée de bleu pour y courir quand aucune lanterne ne te regarde, jusqu\'à la porte en haut !',
  minuteur:true,
  reglages: function(n, mods){
    var p = {niveau:n};
    p.rangees = entier(n, {1:3, 3:4, 7:4, 8:5});
    p.gardes = fixe(entier(n, {1:1, 3:2, 6:3, 9:4}) + (mods.gardes || 0), 1, 5);
    p.vitesse = courbe(n, {1:30, 3:44, 6:60, 9:78, 12:90}) * (mods.lent || 1);
    p.faisceau = courbe(n, {1:92, 3:110, 6:132, 9:156, 12:170}) / (mods.zone || 1);
    p.pause = courbe(n, {1:1.6, 3:1.2, 6:0.85, 9:0.6});
    p.imprevu = courbe(n, {1:0, 3:0.05, 6:0.16, 9:0.3, 12:0.38});
    p.guet = n >= 5;
    p.boucle = n >= 4;
    p.charrette = n >= 3;
    p.bruits = entier(n, {1:0, 3:1, 6:2, 9:3});
    p.portee = courbe(n, {1:200, 3:182, 6:170, 9:160});
    p.course = courbe(n, {1:205, 3:190, 6:178, 9:165});
    p.erreurs = erreursPermises(n, mods);
    p.duree = Math.round(courbe(n, {1:95, 3:80, 6:68, 9:58}) + (mods.temps || 0));
    p.invisible = mods.invisible || 0;
    p.aide = !!(mods.aide || mods.revele);
    p.lignes = [
      {nom:'Gardes', val:String(p.gardes) + (p.guet ? ' (dont un guetteur)' : '')},
      {nom:'Portée des lanternes', val:Math.round(p.faisceau / 10) + ' pas'},
      {nom:'Ils changent d\'avis', val:p.imprevu > 0.2 ? 'souvent' : (p.imprevu > 0 ? 'parfois' : 'jamais')},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect x="-60" width="420" height="170" fill="#2b3150"/>');
    d.contenu.innerHTML = '<g transform="translate(70,138)">' + COUVERTS.tonneau + '</g><g transform="translate(230,40)">' + COUVERTS.buisson + '</g><circle class="mja-demo-anneau" cx="230" cy="40" r="30"/>' +
      '<g class="mja-dg"><path d="M0,0 L90,-40 A98,98 0 0 1 90,40 Z" fill="#ffd36a" opacity=".45"/><circle r="11" fill="#3a5a9a" stroke="' + CONTOUR + '" stroke-width="3"/></g>' +
      '<g class="mja-jd"><circle r="9" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/></g>';
    var g = d.contenu.querySelector('.mja-dg'), j = d.contenu.querySelector('.mja-jd');
    function pose(o, x, y, rot, ms){ o.style.transition = 'transform ' + (ms || 0) + 'ms ease-in-out'; o.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (rot || 0) + 'deg)'; }
    return scenario([
      [10, function(){ pose(g, 150, 92, 200); pose(j, 86, 128); d.vers(270, 160, 0); }],
      [400, function(){ pose(g, 120, 92, 180, 900); }],
      [900, function(){ pose(g, 110, 92, 0, 400); }],
      [450, function(){ d.vers(232, 52); }],
      [600, function(){ d.tape(); pose(j, 222, 46, 0, 700); U.son('pas'); }],
      [900, function(){}]
    ], 500);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies);
    hud.barre(0);
    var terrain = U.html('<div class="mja-terrain mja-cachette"></div>');
    el.appendChild(terrain);
    var id = nid('ca');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' + rueNuit(id) +
      '<rect class="mja-voile-nuit" x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '"/>' +
      '<g class="mja-bruyants"></g><g class="mja-cones"></g><g class="mja-anneaux"></g><g class="mja-couverts"></g>' +
      '<g class="mja-joueur"><ellipse cx="0" cy="4" rx="12" ry="5" fill="#000" opacity=".35"/><circle r="11" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-7,-3 C-4,-9 4,-9 7,-3" stroke="#bff0cf" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="-4" cy="3" r="2.4" fill="#fff"/><circle cx="4" cy="3" r="2.4" fill="#fff"/></g>' +
      '<g class="mja-gardes"></g>' +
    '</svg>' +
    (p.invisible ? '<div class="mja-actions"><button class="btn magie mja-invis" type="button">👻 ' + p.invisible + ' s</button></div>' : '');
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var gC = svg.querySelector('.mja-couverts'), gG = svg.querySelector('.mja-gardes'), gCones = svg.querySelector('.mja-cones'), gAn = svg.querySelector('.mja-anneaux'), gBr = svg.querySelector('.mja-bruyants'), joueur = svg.querySelector('.mja-joueur');
    var btnI = terrain.querySelector('.mja-invis');

    /* Cachettes en rangées */
    var R = p.rangees, couv = [], types = Object.keys(COUVERTS), Y0 = 446, Y1 = 40;
    function ry(k){ return Y0 - k * (Y0 - Y1) / (R + 1); }
    var rangCharrette = p.charrette ? U.randInt(1, R) : -1;
    function relie(liste){
      /* chemin possible du départ à la porte sans la charrette ? */
      var vu = [liste[0]], file = [liste[0]], porteP = {x:180, y:Y1};
      while(file.length){
        var c = file.shift();
        if(dist(c, porteP) <= p.portee * 0.95) return true;
        liste.forEach(function(d){ if(vu.indexOf(d) < 0 && !d.charrette && dist(c, d) <= p.portee * 0.95){ vu.push(d); file.push(d); } });
      }
      return false;
    }
    for(var essai = 0; essai < 80; essai++){
      couv = [{x:U.rand(120, 240), y:Y0, k:0, type:U.choix(types)}];
      for(var k = 1; k <= R; k++){
        var segs = U.melanger([[46, 120], [140, 220], [240, 314]]).slice(0, R >= 4 && Math.random() < 0.5 ? 3 : 2);
        if(k === rangCharrette) segs = segs.slice(0, 1);
        segs.forEach(function(sg){ couv.push({x:U.rand(sg[0], sg[1]), y:ry(k) + U.rand(-10, 10), k:k, type:U.choix(types)}); });
        if(k === rangCharrette) couv.push({x:180, y:ry(k), k:k, charrette:true, dir:Math.random() < .5 ? 1 : -1, v:courbe(p.niveau, {3:26, 9:40})});
      }
      if(relie(couv)) break;
    }
    var porte = {x:180, y:Y1, k:R + 1, porte:true};
    couv.push(porte);
    couv.forEach(function(c){
      c.g = svgNoeud('g', {'class':'mja-couvert' + (c.porte ? ' porte' : '') + (c.charrette ? ' charrette' : '')}, gC);
      c.g.innerHTML = c.porte ? PORTE : (c.charrette ? CHARRETTE : COUVERTS[c.type]);
      c.an = svgNoeud('circle', {'class':'mja-anneau', r:c.charrette ? 40 : 32}, gAn);
      placer(c);
    });
    function placer(c){ c.g.setAttribute('transform', 'translate(' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ')'); c.an.setAttribute('cx', c.x.toFixed(1)); c.an.setAttribute('cy', c.y.toFixed(1)); }
    function cachetteDe(c){ return c.porte ? {x:c.x, y:c.y + 12} : (c.charrette ? {x:c.x, y:c.y + 2} : {x:c.x + 15, y:c.y - 13}); }
    /* Endroits bruyants entre les rangées */
    var bruyants = [];
    for(var b = 0; b < p.bruits; b++){
      for(var e = 0; e < 30; e++){
        var kk = U.randInt(0, R), q = {x:U.rand(50, 310), y:(ry(kk) + ry(kk + 1)) / 2 + U.rand(-12, 12), type:Math.random() < .5 ? 'feuilles' : 'flaque'};
        if(couv.every(function(c){ return dist(c, q) > 46; }) && bruyants.every(function(o){ return dist(o, q) > 70; })){
          q.g = svgNoeud('g', {'class':'mja-bruyant', transform:'translate(' + q.x.toFixed(0) + ',' + q.y.toFixed(0) + ')'}, gBr); q.g.innerHTML = BRUYANTS[q.type]; bruyants.push(q); break;
        }
      }
    }
    /* Gardes */
    var gardes = [], G = p.gardes;
    for(var j = 0; j < G; j++){
      var gap = fixe(Math.round((j + 0.5) * R / G + 0.3), 0, R);
      var y = (ry(gap) + ry(gap + 1)) / 2, gd;
      var typ = (p.guet && j === G - 1 && G >= 2) ? 'guet' : (p.boucle && j === 0 && R >= 3 ? 'boucle' : 'ronde');
      if(typ === 'guet'){ var cote = Math.random() < .5 ? 1 : -1; gd = {type:'guet', x:cote > 0 ? 30 : 330, y:y, base:cote > 0 ? 0 : Math.PI, amp:1.0, w:U.rand(0.7, 1.1), tg:U.rand(0, 6), pts:null}; gd.ang = gd.base; }
      else if(typ === 'boucle'){ var g2 = Math.min(R, gap + 1), ya = y, yb = (ry(g2) + ry(g2 + 1)) / 2; if(Math.abs(yb - ya) < 20) yb = ya - 60; gd = {type:'boucle', pts:[{x:44, y:ya}, {x:316, y:ya}, {x:316, y:yb}, {x:44, y:yb}], i:1, x:44, y:ya}; gd.ang = 0; }
      else { gd = {type:'ronde', pts:[{x:40, y:y}, {x:320, y:y}], i:Math.random() < .5 ? 0 : 1, x:U.rand(80, 280), y:y}; gd.ang = gd.i ? 0 : Math.PI; }
      gd.etat = gd.type === 'guet' ? 'guet' : 'marche'; gd.t = 0; gd.phase = U.rand(0, 6); gd.alerte = 0;
      gd.cone = svgNoeud('path', {'class':'mja-cone'}, gCones);
      gd.g = svgNoeud('g', {'class':'mja-garde'}, gG);
      gd.g.innerHTML = '<ellipse cx="0" cy="5" rx="15" ry="6" fill="#000" opacity=".35"/><g class="mja-corps-garde"><circle r="14" fill="#3a5a9a" stroke="' + CONTOUR + '" stroke-width="4"/><circle r="8" fill="#26345e" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M2,-12 L12,-6" stroke="' + CONTOUR + '" stroke-width="4" stroke-linecap="round"/><circle class="mja-lanterne" cx="18" cy="0" r="6.5" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="3"/></g><text class="mja-alerte" x="0" y="-22" text-anchor="middle">!</text><text class="mja-doute" x="0" y="-22" text-anchor="middle">?</text>';
      gd.corps = gd.g.querySelector('.mja-corps-garde');
      gardes.push(gd);
    }
    /* Mouvement d'un garde (aléa = false pour les prévisions) */
    function tourner(gd, cible, dt, vit){ var d = angleNorm(cible - gd.ang); gd.ang += fixe(d, -vit * dt, vit * dt); }
    function majGarde(gd, dt, alea){
      var v = p.vitesse;
      if(gd.alerte > 0){ gd.alerte -= dt; return; }
      gd.phase += dt;
      if(gd.etat === 'guet'){ gd.tg += dt * gd.w; if(alea && p.imprevu && Math.random() < p.imprevu * dt * 0.6) gd.w = U.rand(0.5, 1.4); gd.ang = gd.base + Math.sin(gd.tg) * gd.amp; return; }
      if(gd.etat === 'marche'){
        var c = gd.pts[gd.i], dx = c.x - gd.x, dy = c.y - gd.y, dd = Math.sqrt(dx * dx + dy * dy);
        tourner(gd, Math.atan2(dy, dx), dt, 5);
        if(dd < v * dt + 0.5){ gd.x = c.x; gd.y = c.y; gd.etat = 'pause'; gd.t = p.pause * (alea ? U.rand(0.6, 1.4) : 1); gd.base = gd.ang; gd.phase = 0; gd.i = (gd.i + 1) % gd.pts.length; }
        else { gd.x += dx / dd * v * dt; gd.y += dy / dd * v * dt; }
        if(alea && p.imprevu && Math.random() < p.imprevu * dt){ gd.etat = 'pause'; gd.t = U.rand(0.5, 0.9); gd.base = gd.ang + Math.PI; gd.phase = 0; if(Math.random() < 0.5 && gd.type === 'ronde') gd.i = 1 - gd.i; }
      } else if(gd.etat === 'pause'){
        gd.t -= dt; tourner(gd, gd.base + Math.sin(gd.phase * 2.6) * 0.9, dt, 6);
        if(gd.t <= 0) gd.etat = 'marche';
      } else if(gd.etat === 'enquete'){
        var ex = gd.bruit.x - gd.x, ey = gd.bruit.y - gd.y, ed = Math.sqrt(ex * ex + ey * ey);
        tourner(gd, Math.atan2(ey, ex), dt, 6);
        if(ed < 30){ gd.etat = 'regarde'; gd.t = 2; gd.base = gd.ang; gd.phase = 0; }
        else { gd.x += ex / ed * v * 1.3 * dt; gd.y += ey / ed * v * 1.3 * dt; }
      } else if(gd.etat === 'regarde'){
        gd.t -= dt; gd.ang = gd.base + Math.sin(gd.phase * 3) * 1.4;
        if(gd.t <= 0){ gd.etat = 'marche'; var best = 0; gd.pts.forEach(function(q, i){ if(dist(q, gd) < dist(gd.pts[best], gd)) best = i; }); gd.i = best; }
      }
    }
    function voit(gd, pt, marge){
      var dx = pt.x - gd.x, dy = pt.y - gd.y, d = Math.sqrt(dx * dx + dy * dy);
      if(d < 24) return true;
      if(d > p.faisceau * (marge || 1)) return false;
      return Math.abs(angleNorm(Math.atan2(dy, dx) - gd.ang)) < 0.55 * (marge || 1) + (marge > 1 ? 0.1 : 0);
    }
    function bruit(x, y, rayon, quoi){
      var q = pctDans(svg, terrain, x, y); flotter(terrain, q.x, q.y, quoi, 'ko');
      gardes.forEach(function(gd){ if(gd.type !== 'guet' && dist(gd, {x:x, y:y}) < rayon && gd.alerte <= 0){ gd.etat = 'enquete'; gd.bruit = {x:x, y:y}; gd.g.classList.add('doute'); P.apres(1600, function(){ gd.g.classList.remove('doute'); }); }
        else if(gd.type === 'guet' && dist(gd, {x:x, y:y}) < rayon){ gd.base = Math.atan2(y - gd.y, x - gd.x); gd.tg = 0; } });
    }
    /* Joueur */
    var ici = couv[0], dep = cachetteDe(ici), jx = dep.x, jy = dep.y, course = null, fini = false, restant = p.duree, invisT = 0, invisUtilise = false;
    function accessibles(){ return couv.filter(function(c){ return c !== ici && dist(c, ici) <= p.portee && c.k >= ici.k - 1; }); }
    function majAnneaux(){
      var acc = course ? [] : accessibles();
      couv.forEach(function(c){ var a = acc.indexOf(c) >= 0; c.an.classList.toggle('on', a); c.acc = a; });
    }
    majAnneaux();
    function dureeCourse(a, b){ return dist(a, b) / p.course; }
    /* où sera la charrette dans tt secondes (elle rebondit entre 56 et 304) */
    function charretteDans(c, tt){
      var x = c.x + c.dir * c.v * tt;
      for(var r = 0; r < 6 && (x < 56 || x > 304); r++) x = x > 304 ? 608 - x : 112 - x;
      return {x:x, y:c.y, charrette:true};
    }
    function surPredit(c){
      var a = {x:jx, y:jy}, b = cachetteDe(c), T = dureeCourse(a, b);
      var copies = gardes.map(function(gd){ return Object.assign({}, gd); });
      for(var tt = 0; tt <= T + 0.1; tt += 0.05){
        /* même élan que la vraie course (lente au départ, rapide au milieu) ; la charrette continue de rouler */
        var k = Math.min(1, tt / T), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, bb = c.charrette ? cachetteDe(charretteDans(c, tt)) : b;
        var pt = {x:a.x + (bb.x - a.x) * e, y:a.y + (bb.y - a.y) * e};
        /* passer sur des feuilles ou une flaque quand un garde est tout près : il se retourne vers toi */
        for(var j = 0; j < bruyants.length; j++){ if(dist(bruyants[j], pt) < 26 && copies.some(function(gd){ return dist(gd, bruyants[j]) < 200; })) return false; }
        for(var i = 0; i < copies.length; i++){ if(copies[i].alerte <= 0 && voit(copies[i], pt, 1.15)) return false; majGarde(copies[i], 0.05, false); }
      }
      return true;
    }
    function courir(c){
      if(fini || course) return;
      var a = {x:jx, y:jy};
      course = {a:a, c:c, t:0, T:dureeCourse(a, cachetteDe(c)), retour:false, bruit:{}};
      U.son('pas');
      majAnneaux();
    }
    if(btnI) P.ecoute(btnI, 'click', function(){ if(invisUtilise || fini) return; invisUtilise = true; invisT = p.invisible; btnI.disabled = true; U.son('magie'); });
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini) return;
      e.preventDefault();
      var pt = ptSVG(svg, e);
      var best = null, bd = 48;
      couv.forEach(function(c){ var d = dist(pt, c); if(d < bd){ bd = d; best = c; } });
      if(!best || best === ici) return;
      if(best.acc) courir(best);
      else { secouer(best.g); var q = pctDans(svg, terrain, best.x, best.y - 30); flotter(terrain, q.x, q.y, 'Trop loin !', 'ko'); }
    });
    terrain.mjaEtat = function(){ return {ici:couv.indexOf(ici), course:!!course, couv:couv.map(function(c, i){ return {i:i, acc:!!c.acc, sur:c.acc ? surPredit(c) : false, k:c.k, porte:!!c.porte, x:c.x, y:c.y}; })}; };
    terrain.mjaCourir = function(i){ if(couv[i] && couv[i].acc) courir(couv[i]); };

    function repere(gd){
      vies--; hud.perdVie(vies, maxVies);
      erreurSensorielle(terrain);
      gd.alerte = 1.2; gd.g.classList.add('alerte'); P.apres(1200, function(){ gd.g.classList.remove('alerte'); });
      var q = pctDans(svg, terrain, jx, jy - 26); flotter(terrain, q.x, q.y, 'Repéré !', 'ko');
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:ici.k / (R + 1), erreurs:maxVies, detail:'Le garde t\'a vu…'}, 900); return; }
      course = {a:{x:jx, y:jy}, c:ici, t:0, T:0.35, retour:true, bruit:{}};
    }
    var majAnneauxT = 0;
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; P.finir({reussi:false, score:ici.k / (R + 1), detail:'Le jour se lève… trop tard !'}, 600); return false; }
      if(invisT > 0){ invisT -= dt; if(invisT <= 0 && btnI) btnI.textContent = '👻'; }
      joueur.classList.toggle('invisible', invisT > 0);
      /* charrette */
      couv.forEach(function(c){
        if(!c.charrette) return;
        c.x += c.dir * c.v * dt;
        if(c.x < 56 || c.x > 304){ c.dir = -c.dir; c.x = fixe(c.x, 56, 304); }
        placer(c);
      });
      /* gardes */
      gardes.forEach(function(gd){
        majGarde(gd, dt, true);
        var L = p.faisceau, h = 0.55;
        var x1 = gd.x + Math.cos(gd.ang - h) * L, y1 = gd.y + Math.sin(gd.ang - h) * L, x2 = gd.x + Math.cos(gd.ang + h) * L, y2 = gd.y + Math.sin(gd.ang + h) * L;
        gd.cone.setAttribute('d', 'M' + gd.x.toFixed(1) + ',' + gd.y.toFixed(1) + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + L.toFixed(0) + ',' + L.toFixed(0) + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z');
        gd.cone.classList.toggle('alerte', gd.alerte > 0);
        gd.g.setAttribute('transform', 'translate(' + gd.x.toFixed(1) + ',' + gd.y.toFixed(1) + ')');
        gd.corps.setAttribute('transform', 'rotate(' + (gd.ang * 57.3).toFixed(1) + ')');
      });
      /* joueur */
      if(course){
        if(course.c.charrette && !course.retour){ var bb = cachetteDe(course.c); course.b = bb; } else course.b = cachetteDe(course.c);
        course.t += dt / course.T;
        var k = Math.min(1, course.t), e = course.retour ? k : (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        jx = course.a.x + (course.b.x - course.a.x) * e; jy = course.a.y + (course.b.y - course.a.y) * e;
        if(!course.retour){
          bruyants.forEach(function(q, i){ if(!course.bruit[i] && dist(q, {x:jx, y:jy}) < 26){ course.bruit[i] = true; U.son(q.type === 'flaque' ? 'plouf' : 'pas'); bruit(q.x, q.y, 200, q.type === 'flaque' ? 'Splash !' : 'Crac !'); } });
          if(invisT <= 0){ for(var i = 0; i < gardes.length; i++){ if(gardes[i].alerte <= 0 && voit(gardes[i], {x:jx, y:jy})){ repere(gardes[i]); break; } } }
        }
        if(!fini && course && course.t >= 1){
          if(!course.retour){
            ici = course.c;
            U.son('ok');
            hud.barre(ici.k / (R + 1));
            if(ici.porte){ fini = true; ici.g.classList.add('ouverte'); U.son('porte'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'Personne ne t\'a vu !'}, 900); }
          }
          course = null;
          majAnneaux();
        }
      } else if(ici.charrette){ var cc = cachetteDe(ici); jx = cc.x; jy = cc.y; majAnneauxT += dt; if(majAnneauxT > 0.2){ majAnneauxT = 0; majAnneaux(); } }
      joueur.setAttribute('transform', 'translate(' + jx.toFixed(1) + ',' + jy.toFixed(1) + ')');
      joueur.classList.toggle('cache', !course);
      /* aide : vert si on peut y aller maintenant */
      if(p.aide && !course){ couv.forEach(function(c){ if(c.acc){ var s = surPredit(c); c.an.classList.toggle('sur', s); c.an.classList.toggle('danger', !s); } }); }
    });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   TIR À L'ARC (Pisteur) — on bande l'arc comme un lance-pierre :
   poser le doigt n'importe où, tirer vers l'arrière, lâcher. La
   direction ET la puissance viennent du geste. La flèche suit une
   courbe (gravité + vent). Cibles qui bougent : lanterne qui se
   balance, corbeau qui vole en huit (il lâche ce qu'il a volé),
   corde d'un sac à couper (petit point précis), pomme sur une
   branche. Obstacles : branches qui bougent, petits oiseaux.
   Flèches limitées ; au-delà du niveau 4, l'arc tremble si on le
   tient trop longtemps. Ralenti sur les tirs parfaits.
   Flèche bien tirée (Romain, 4 nov.) : l'arc bandé à fond (puissance
   ≥ PERCE, la jauge devient dorée et « À fond ! » s'affiche). Elle ne
   s'arrête pas à la première cible : elle traverse et touche toutes les
   cibles sur sa route (« Transpercé ! ×2 »). Les obstacles (branches,
   oiseaux), le sac lui-même et le sol l'arrêtent toujours. Un tir moins
   fort s'arrête à la première cible, comme avant.
   Mods : erreurs (+N flèches), fleches (+N, 99 = carquois sans fond),
   zone (cibles plus grosses), lent (tout bouge moins vite), stable
   (vent et tremblement ×), ralenti (N s de temps ralenti, une fois),
   temps (+N : ligne de visée plus longue),
   aide (N premiers tirs : trajectoire entière, vent compris),
   revele (toujours la trajectoire entière).
   ========================================================== */
var ARC = {g:560, v:610, tire:118, x:62, y:398};
var PERCE = 0.95;   /* puissance à partir de laquelle la flèche traverse les cibles (arc bandé à fond) */
var SLOTS_TIR = {
  lanterne:[{ax:205, ay:52, L:118}, {ax:292, ay:58, L:150}, {ax:150, ay:46, L:92}],
  sac:[{ax:300, ay:58, L:178}, {ax:232, ay:50, L:126}],
  pomme:[{x:262, y:128}, {x:318, y:178}, {x:178, y:150}],
  corbeau:[{cx:232, cy:160, ax:96, ay:52}, {cx:250, cy:250, ax:78, ay:40}, {cx:220, cy:112, ax:108, ay:34}]
};
var ART_TIR = {
  lanterne:'<g class="mja-lant"><path d="M-11,-18 L11,-18 L15,13 L-15,13 Z" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M-13,-24 L13,-24 L11,-18 L-11,-18 Z M-15,13 L15,13 L11,19 L-11,19 Z" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="3"/><path class="mja-lant-feu" d="M0,-10 C6,-3 6,4 0,8 C-6,4 -6,-3 0,-10 Z" fill="#e8693c"/><path d="M-7,-14 L-9,9" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/></g>',
  sac:'<path d="M-15,-8 C-22,6 -20,22 0,23 C20,22 22,6 15,-8 C10,-14 -10,-14 -15,-8 Z" fill="#b07a3c" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M-9,-13 L9,-13 L6,-18 L-6,-18 Z" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-6,4 C-2,8 4,8 8,3" stroke="#7d5428" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="-4" cy="10" r="3.4" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="1.5"/>',
  pomme:'<path d="M0,-14 C-3,-19 -15,-19 -16,-8 C-18,4 -8,12 0,9 C8,12 18,4 16,-8 C15,-19 3,-19 0,-14 Z" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M-9,-9 C-9,-12 -7,-14 -4,-14" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/><path d="M0,-14 L1,-22" stroke="#5e3a1e" stroke-width="3"/><path d="M1,-20 C6,-27 13,-24 13,-22 C8,-18 5,-18 1,-20 Z" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2"/>',
  corbeau:'<g class="mja-ailes"><path d="M-4,-2 C-18,-22 -34,-20 -40,-10 C-28,-10 -18,-4 -10,4 Z" fill="#2a2440" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M4,-2 C18,-22 34,-20 40,-10 C28,-10 18,-4 10,4 Z" fill="#2a2440" stroke="' + CONTOUR + '" stroke-width="3"/></g><path d="M-12,2 L-22,-2 L-20,6 Z" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="0" cy="2" rx="13" ry="10" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="10" cy="-5" r="8" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M16,-6 L26,-3 L16,-1 Z" fill="#f6b23a" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="12" cy="-7" r="2.2" fill="#ffd36a"/><g class="mja-butin"><path d="M2,14 L2,24 M-1,22 L5,22 M2,18 L6,18" stroke="#ffd36a" stroke-width="3" stroke-linecap="round"/><circle cx="2" cy="11" r="3.5" fill="none" stroke="#ffd36a" stroke-width="2.5"/></g>'
};
var FLECHE_ART = '<path d="M-30,0 L4,0" stroke="#c99a5e" stroke-width="3.2" stroke-linecap="round"/><path d="M-30,0 L-24,0" stroke="' + CONTOUR + '" stroke-width="1" /><path d="M2,-5 L12,0 L2,5 Z" fill="#dfe6ff" stroke="' + CONTOUR + '" stroke-width="2" stroke-linejoin="round"/><path d="M-30,0 L-36,-6 L-26,-1 M-30,0 L-36,6 L-26,1" stroke="#8ff3ff" stroke-width="2.6" stroke-linecap="round" fill="none"/>';
/* la flèche en main et en vol : un halo doré s'allume quand l'arc est bandé à fond (elle transperce) */
var FLECHE_FORTE = '<path class="mja-fl-halo" d="M-36,0 L14,0"/>' + FLECHE_ART;
function plumeSVG(c){ return '<path d="M0,-9 C5,-5 5,5 0,9 C-5,5 -5,-5 0,-9 Z M0,-9 L0,10" fill="' + (c || '#2a2440') + '" stroke="' + CONTOUR + '" stroke-width="1.5"/>'; }
function distSeg(p, a, b){
  var dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, t = l2 ? fixe(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1) : 0;
  var x = a.x + dx * t - p.x, y = a.y + dy * t - p.y;
  return {d:Math.sqrt(x * x + y * y), t:t};
}
function decorTir(id){
  var s = '<defs><linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121735"/><stop offset=".7" stop-color="#2d3e66"/><stop offset="1" stop-color="#4a5a86"/></linearGradient>' +
    '<radialGradient id="' + id + 'l" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4d0" stop-opacity=".35"/><stop offset="1" stop-color="#fff4d0" stop-opacity="0"/></radialGradient></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'c)"/>';
  for(var i = 0; i < 40; i++){ s += '<circle class="mja-etoile" cx="' + U.rand(-230, 590).toFixed(0) + '" cy="' + U.rand(-210, 280).toFixed(0) + '" r="' + U.rand(.8, 2).toFixed(1) + '" fill="#eef0ff" style="animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"/>'; }
  s += '<circle cx="96" cy="96" r="70" fill="url(#' + id + 'l)"/><circle cx="96" cy="96" r="26" fill="#fff4d0" opacity=".92"/><circle cx="88" cy="90" r="5" fill="#e8dcb0" opacity=".7"/>';
  s += '<path d="M-260,330 C-160,300 -60,316 40,300 C140,284 240,306 340,290 C440,276 520,300 620,288 L620,720 L-260,720 Z" fill="#22324e"/>';
  s += '<path d="M-260,372 C-150,352 -40,368 70,354 C180,342 280,358 380,350 C470,342 540,356 620,350 L620,720 L-260,720 Z" fill="#1f3a30"/>';
  s += '<path d="M-260,420 C-100,404 100,410 200,416 C300,422 460,404 620,414 L620,720 L-260,720 Z" fill="#2b5038" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var k = 0; k < 30; k++){ var x = U.rand(-240, 600), y = U.rand(426, 600); s += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l-4,-10 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l1,-13 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l5,-9" stroke="#5fcf86" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'; }
  /* le grand arbre à droite et sa branche maîtresse */
  s += '<path d="M352,720 L346,250 C344,170 360,110 400,70 L430,90 C400,130 392,190 396,250 L402,720 Z" fill="#5e3a1e" stroke="' + CONTOUR + '" stroke-width="4"/>';
  s += '<path d="M380,96 C320,44 220,34 120,40" stroke="' + CONTOUR + '" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M380,96 C320,44 220,34 120,40" stroke="#7a4e2c" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M200,38 C230,34 262,36 290,44" stroke="#a06a3c" stroke-width="3" fill="none" stroke-linecap="round"/>';
  [[120,40,26],[150,26,30],[100,24,22],[400,40,54],[440,90,48],[370,16,40],[470,30,44],[430,150,40]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#1f5a40" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="' + (b[0] + b[2] * .25) + '" cy="' + (b[1] - b[2] * .3) + '" r="' + (b[2] * .5) + '" fill="#2a7050" opacity=".8"/>'; });
  return s;
}
function archerSVG(){
  return '<g class="mja-archer" transform="translate(' + ARC.x + ',' + ARC.y + ')">' +
    '<ellipse cx="-14" cy="30" rx="30" ry="7" fill="#000" opacity=".3"/>' +
    '<path d="M-24,28 L-20,4 M-8,28 L-12,4" stroke="#3b2a3e" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M-30,6 C-32,-20 -24,-32 -14,-34 C-4,-32 2,-20 0,6 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M-26,-30 L-38,-4" stroke="#8a5a33" stroke-width="7" stroke-linecap="round"/><path d="M-30,-34 l-6,-8 M-27,-34 l-1,-10 M-24,-33 l4,-8" stroke="#8ff3ff" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle cx="-14" cy="-44" r="12" fill="#ffe0c2" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<path d="M-28,-44 C-28,-62 2,-62 0,-44 C-6,-50 -20,-52 -28,-44 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3.5"/>' +
    '<circle cx="-8" cy="-44" r="2" fill="' + CONTOUR + '"/>' +
  '</g>';
}
MJ.enregistrer('tir', {
  nom:'Tir à l\'arc', role:'pisteur', ic:'🏹',
  consigne:'Pose ton doigt, tire vers l\'arrière comme un lance-pierre et lâche : touche toutes les cibles avant d\'avoir vidé ton carquois ! Tirée à fond, la flèche transperce toutes les cibles sur sa route.',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    var listes = {1:['lanterne', 'pomme'], 2:['lanterne', 'pomme', 'lanterne'], 3:['lanterne', 'corbeau', 'pomme'], 4:['lanterne', 'corbeau', 'sac'],
      5:['lanterne', 'corbeau', 'sac', 'pomme'], 6:['lanterne', 'corbeau', 'sac', 'corbeau'], 7:['sac', 'corbeau', 'lanterne', 'corbeau', 'pomme'],
      8:['sac', 'corbeau', 'lanterne', 'corbeau', 'pomme'], 9:['sac', 'corbeau', 'corbeau', 'lanterne', 'sac']};
    p.cibles = (listes[Math.min(9, n)] || listes[9]).slice();
    if(n >= 11) p.cibles.push('corbeau');
    /* au niveau 10 (adultes, enquête 10), encore une flèche de réserve : sans elle, une seule flèche ratée = perdu (robot : 1 partie sur 8) */
    var reserve = Math.floor(courbe(n, {1:4, 3:2, 6:2, 9:1, 10:1, 12:0}) + 0.001);
    p.fleches = p.cibles.length + reserve + (mods.erreurs || 0) + (mods.fleches || 0);
    if((mods.fleches || 0) >= 99) p.fleches = 99;
    var lent = mods.lent || 1, stable = mods.stable === undefined ? 1 : mods.stable;
    p.vitesse = courbe(n, {1:0.5, 3:0.78, 6:1.08, 9:1.42, 12:1.7}) * lent;
    p.rayon = courbe(n, {1:19, 3:15.5, 6:13, 9:11, 12:10}) * (mods.zone || 1);
    p.corde = courbe(n, {1:7, 4:5.5, 9:4.2, 12:3.6}) * (mods.zone || 1);
    p.vent = courbe(n, {1:0, 2:0, 3:38, 6:88, 9:130, 12:165}) * stable;
    p.rafales = n >= 6;
    p.apercu = courbe(n, {1:1.15, 3:0.42, 6:0.24, 9:0.13, 12:0.08}) + 0.12 * Math.min(5, mods.temps || 0);
    p.branches = entier(n, {1:0, 3:1, 7:1, 8:2});
    p.oiseaux = n >= 5 ? courbe(n, {5:4.5, 6:3.6, 9:2.1, 12:1.5}) : 0;
    p.tenue = n >= 4 ? courbe(n, {4:3.2, 6:2.4, 9:1.5, 12:1.1}) : 99;
    p.tremble = courbe(n, {4:2.5, 6:3.5, 9:5.5, 12:7}) * stable;
    p.ralenti = mods.ralenti || 0;
    p.revele = !!mods.revele;
    p.aide = mods.aide || 0;
    var noms = {lanterne:'🏮', pomme:'🍎', corbeau:'🐦‍⬛', sac:'🪢'};
    p.lignes = [
      {nom:'Cibles', val:p.cibles.map(function(c){ return noms[c] || c; }).join(' ')},
      {nom:'Flèches', val:p.fleches >= 99 ? '∞' : p.fleches + ' (' + (p.fleches - p.cibles.length) + ' de réserve)'},
      {nom:'Vent', val:p.vent < 5 ? 'aucun' : (p.vent < 60 ? 'léger' : (p.vent < 110 ? 'fort' : 'tempête')) + (p.rafales && p.vent >= 5 ? ', en rafales' : '')},
      {nom:'Ligne de visée', val:p.revele ? 'complète' : (p.apercu > 0.8 ? 'longue' : (p.apercu > 0.3 ? 'moyenne' : 'très courte'))},
      {nom:'L\'arc tremble après', val:p.tenue > 50 ? 'jamais' : txtS(p.tenue)},
      {nom:'Flèche tirée à fond', val:'transperce les cibles'}
    ];
    return p;
  },
  demo: function(el){
    el.innerHTML = '<svg class="mja-demo-svg" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet"><rect x="-60" width="420" height="170" fill="#1f2d4a"/><rect x="-60" y="146" width="420" height="30" fill="#2b5038"/>' +
      '<path d="M300,24 C260,14 220,12 190,14" stroke="#7a4e2c" stroke-width="8" fill="none" stroke-linecap="round"/><line class="dc" x1="232" y1="14" x2="232" y2="60" stroke="#c9c2e0" stroke-width="2"/><g class="dl">' + ART_TIR.lanterne + '</g>' +
      '<g class="da" transform="translate(52,112)"><path d="M0,-30 C16,-22 16,22 0,30" stroke="#8a5a33" stroke-width="5" fill="none" stroke-linecap="round"/><path class="ds" d="M0,-30 L0,30" stroke="#eee" stroke-width="1.6" fill="none"/></g>' +
      '<g class="dp"></g><g class="df" opacity="0">' + FLECHE_ART + '</g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), l = svg.querySelector('.dl'), corde = svg.querySelector('.dc'), a = svg.querySelector('.da'), s = svg.querySelector('.ds'), pts = svg.querySelector('.dp'), f = svg.querySelector('.df'), main = svg.querySelector('.mja-main');
    main.style.transition = 'none';
    var X0 = 52, Y0 = 112, vx = 205, vy = -140, g = 160;
    return demoBoucle(svg, function(dt, t){
      var c = t % 3.6, ang = Math.sin(t * 2.2) * 0.35, lx = 232 + Math.sin(ang) * 46, ly = 14 + Math.cos(ang) * 46;
      corde.setAttribute('x2', lx.toFixed(1)); corde.setAttribute('y2', (ly - 14).toFixed(1));
      l.setAttribute('transform', 'translate(' + lx.toFixed(1) + ',' + ly.toFixed(1) + ') scale(.8)');
      var tire = c < 0.4 ? 0 : (c < 1.5 ? (c - 0.4) / 1.1 : 0);
      var ar = Math.atan2(vy, vx) * 180 / Math.PI;
      a.setAttribute('transform', 'translate(' + X0 + ',' + Y0 + ') rotate(' + ar.toFixed(1) + ')');
      s.setAttribute('d', 'M0,-30 L' + (-tire * 24).toFixed(1) + ',0 L0,30');
      var hx = X0 - 18 - tire * 34, hy = Y0 + 4 + tire * 22;
      main.style.transform = 'translate(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px)';
      main.classList.toggle('appuie', tire > 0);
      var dots = '';
      if(tire > 0.3){ for(var k = 1; k < 9; k++){ var tt = k * 0.08; dots += '<circle cx="' + (X0 + vx * tt).toFixed(1) + '" cy="' + (Y0 + vy * tt + 0.5 * g * tt * tt).toFixed(1) + '" r="2.4" fill="#8ff3ff" opacity="' + (1 - k / 10).toFixed(2) + '"/>'; } }
      pts.innerHTML = dots;
      if(c >= 1.5 && c < 2.6){
        var u = (c - 1.5) * 0.98, x = X0 + vx * u, y = Y0 + vy * u + 0.5 * g * u * u;
        f.setAttribute('opacity', '1');
        f.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + (Math.atan2(vy + g * u, vx) * 180 / Math.PI).toFixed(1) + ') scale(.8)');
      } else f.setAttribute('opacity', '0');
    });
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var hud = creerHud(el);
    hud.prog(0, p.cibles.length, '🎯');
    var badge = hud.badge(''); badge.classList.add('large');
    var terrain = U.html('<div class="mja-terrain mja-tir"></div>');
    el.appendChild(terrain);
    var id = nid('ti');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet"><g class="mja-cam">' + decorTir(id) +
      '<g class="mja-vent-g" transform="translate(150,404)"><path d="M0,0 L0,-52" stroke="#c9c2e0" stroke-width="4" stroke-linecap="round"/><g class="mja-manche-g" transform="translate(0,-50)"><path class="mja-manche" d="M0,0 L34,4 L34,14 L0,18 Z" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M11,1.5 L11,16.5 M22,3 L22,15" stroke="#fff" stroke-width="3"/></g></g>' +
      '<g class="mja-feuilles"></g><g class="mja-cordes"></g><g class="mja-branches"></g><g class="mja-cibles-g"></g><g class="mja-oiseaux"></g><g class="mja-plantees"></g>' +
      '<g class="mja-apercu"></g><path class="mja-trainee" d=""/><g class="mja-fl-vol" opacity="0">' + FLECHE_FORTE + '</g><g class="mja-parts"></g>' +
      archerSVG() +
      '<g class="mja-arc-g" transform="translate(' + ARC.x + ',' + (ARC.y - 22) + ')"><circle class="mja-jauge-arc" r="44"/><g class="mja-arc-rot"><path d="M0,-38 C22,-28 22,28 0,38" stroke="#8a5a33" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M0,-38 C22,-28 22,28 0,38" stroke="' + CONTOUR + '" stroke-width="1.6" fill="none"/><path class="mja-corde-arc" d="M0,-38 L0,38" stroke="#eee" stroke-width="2" fill="none"/><g class="mja-fl-encoche">' + FLECHE_FORTE + '</g></g>' +
        '<text class="mja-afond" x="4" y="-56" text-anchor="middle">À fond !</text></g>' +
    '</g></svg>' +
    (p.ralenti ? '<div class="mja-actions"><button class="btn magie mja-ralenti" type="button">⏳ Ralentir le temps (' + p.ralenti + ' s)</button></div>' : '');
    var svg = terrain.querySelector('svg');
    cadrer(P, svg, {ancre:'bas'});
    var cam = svg.querySelector('.mja-cam'), gCordes = svg.querySelector('.mja-cordes'), gCibles = svg.querySelector('.mja-cibles-g'), gBr = svg.querySelector('.mja-branches'), gOis = svg.querySelector('.mja-oiseaux');
    var gPl = svg.querySelector('.mja-plantees'), gAp = svg.querySelector('.mja-apercu'), trainee = svg.querySelector('.mja-trainee'), flVol = svg.querySelector('.mja-fl-vol'), gParts = svg.querySelector('.mja-parts');
    var arcRot = svg.querySelector('.mja-arc-rot'), cordeArc = svg.querySelector('.mja-corde-arc'), encoche = svg.querySelector('.mja-fl-encoche'), jaugeArc = svg.querySelector('.mja-jauge-arc'), manche = svg.querySelector('.mja-manche-g'), gFeuilles = svg.querySelector('.mja-feuilles'), aFond = svg.querySelector('.mja-afond');
    var ventBase = p.vent * (Math.random() < 0.5 ? -1 : 1);
    /* utiles : flèches qui ont touché au moins une cible ; maxPerce : le plus de cibles touchées par une seule flèche */
    var fleches = p.fleches, tirs = 0, touches = 0, utiles = 0, maxPerce = 0, fini = false, t = 0, echelle = 1, ralentiT = 0, slow = 1, slowCible = 1;
    var camZ = 1, camX = 180, camY = 240, camZc = 1, camXc = 180, camYc = 240, tenir = 0;
    function majCarquois(){ badge.innerHTML = '<span class="mja-carquois">🏹 ' + (fleches >= 99 ? '∞' : '× ' + fleches) + '</span>'; }
    majCarquois();
    /* les cœurs : les flèches qu'on peut encore perdre (flèches − cibles debout) ; une flèche qui en transperce deux en rend un */
    var coeursTir = Math.max(0, p.fleches - p.cibles.length), coeursAvant = coeursTir;
    function restantsTir(){ return fleches - (cibles.length - touches); }
    if(p.fleches < 99) hud.coeurs(coeursTir, coeursTir);
    /* Cibles */
    var utilises = {};
    var cibles = p.cibles.map(function(type){
      var k = utilises[type] || 0; utilises[type] = k + 1;
      var sl = SLOTS_TIR[type][k % SLOTS_TIR[type].length];
      var c = {type:type, s:sl, ph:U.rand(0, 6.28), w:U.rand(0.85, 1.15), touche:false};
      c.g = svgNoeud('g', {'class':'mja-cible t-' + type}, gCibles);
      c.art = svgNoeud('g', {'class':'mja-cible-art'}, c.g);
      c.art.innerHTML = ART_TIR[type] + '<circle class="mja-cible-halo" r="' + (type === 'sac' ? 26 : 24) + '"/>';
      if(type === 'lanterne' || type === 'sac') c.fil = svgNoeud('line', {'class':'mja-fil' + (type === 'sac' ? ' corde' : '')}, gCordes);
      if(type === 'pomme') c.tige = svgNoeud('path', {'class':'mja-tige'}, gCordes);
      return c;
    });
    function posCible(c, tt){
      var s = c.s, v = p.vitesse * c.w, q = {};
      if(c.type === 'lanterne' || c.type === 'sac'){
        var amp = c.type === 'sac' ? 0.34 : 0.46;
        var a = Math.sin(tt * 1.5 * v + c.ph) * amp;
        q.x = s.ax + Math.sin(a) * s.L; q.y = s.ay + Math.cos(a) * s.L; q.a = a;
        q.nx = s.ax + Math.sin(a) * (s.L - (c.type === 'sac' ? 19 : 25)); q.ny = s.ay + Math.cos(a) * (s.L - (c.type === 'sac' ? 19 : 25));
      } else if(c.type === 'pomme'){
        q.x = s.x + Math.sin(tt * 1.3 * v + c.ph) * 16 * Math.min(1.6, v); q.y = s.y + Math.sin(tt * 2.6 * v + c.ph) * 4; q.a = 0;
      } else {
        var u = tt * 0.75 * v + c.ph;
        q.x = s.cx + Math.sin(u) * s.ax; q.y = s.cy + Math.sin(2 * u) * s.ay; q.sens = Math.cos(u) >= 0 ? 1 : -1;
      }
      return q;
    }
    function dessinerCible(c){
      if(c.chute) return;
      var q = c.q = posCible(c, t);
      if(c.type === 'corbeau') c.g.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') scale(' + q.sens + ',1)');
      else c.g.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') rotate(' + (-(q.a || 0) * 57.3).toFixed(1) + ')');
      if(c.fil){ c.fil.setAttribute('x1', c.s.ax); c.fil.setAttribute('y1', c.s.ay); c.fil.setAttribute('x2', q.nx.toFixed(1)); c.fil.setAttribute('y2', q.ny.toFixed(1)); }
      if(c.tige) c.tige.setAttribute('d', 'M' + (c.s.x + 4) + ',' + (c.s.x > 330 ? 70 : 44) + ' Q' + (c.s.x - 6) + ',' + ((c.s.y + 40) / 2).toFixed(0) + ' ' + q.x.toFixed(1) + ',' + (q.y - 20).toFixed(1));
    }
    /* Branches mobiles (obstacles) */
    var branches = [];
    for(var b = 0; b < p.branches; b++){
      var gauche = b % 2 === 1;
      var br = {bx:gauche ? -10 : 368, by:gauche ? 250 : 318, L:gauche ? 120 : 150, a0:gauche ? -0.12 : Math.PI + 0.18, ph:U.rand(0, 6), amp:0.22 + 0.04 * b, gauche:gauche};
      br.g = svgNoeud('g', {'class':'mja-branche'}, gBr);
      br.g.innerHTML = '<path d="M0,0 C' + (br.L * 0.4) + ',-8 ' + (br.L * 0.7) + ',6 ' + br.L + ',0" stroke="' + CONTOUR + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M0,0 C' + (br.L * 0.4) + ',-8 ' + (br.L * 0.7) + ',6 ' + br.L + ',0" stroke="#7a4e2c" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        [0.45, 0.72, 0.98].map(function(f, i){ return '<g transform="translate(' + (br.L * f) + ',' + (i % 2 ? -6 : 4) + ')"><circle r="' + (17 - i * 2) + '" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="3.5"/><circle cx="4" cy="-5" r="' + (8 - i) + '" fill="#3c9a62"/></g>'; }).join('') + '<g class="mja-br-fl"></g>';
      br.fl = br.g.querySelector('.mja-br-fl');
      branches.push(br);
    }
    function angBranche(br, tt){ return br.a0 + Math.sin((tt === undefined ? t : tt) * 0.9 * p.vitesse + br.ph) * br.amp; }
    function collBranche(br, x, y, tt){
      var a = angBranche(br, tt), ca = Math.cos(a), sa = Math.sin(a);
      var lx = (x - br.bx) * ca + (y - br.by) * sa, ly = -(x - br.bx) * sa + (y - br.by) * ca;
      if(lx < br.L * 0.3 || lx > br.L + 16) return null;
      return Math.abs(ly) < 15 ? {lx:lx, ly:ly} : null;
    }
    /* Oiseaux (obstacles) */
    var oiseaux = [], prochainOiseau = p.oiseaux ? U.rand(1.2, p.oiseaux) : 1e9;
    function lancerOiseau(){
      var dir = Math.random() < 0.5 ? 1 : -1, y = U.rand(110, 330), v = U.rand(80, 150) * p.vitesse;
      var o = {x:dir > 0 ? -250 : 610, y:y, vx:dir * v, ph:U.rand(0, 6)};
      o.g = svgNoeud('g', {'class':'mja-oiseau'}, gOis);
      o.g.innerHTML = '<g transform="scale(' + (dir > 0 ? 1 : -1) + ',1)"><g class="mja-ailes"><path d="M-2,-1 C-8,-11 -15,-10 -18,-5 C-12,-5 -8,-2 -4,2 Z M2,-1 C8,-11 15,-10 18,-5 C12,-5 8,-2 4,2 Z" fill="#c9a77a" stroke="' + CONTOUR + '" stroke-width="2"/></g><ellipse rx="7" ry="5.5" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="6" cy="-3" r="4" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="2"/><path d="M9,-3 L13,-2 L9,-1 Z" fill="#f6b23a"/></g>';
      oiseaux.push(o);
    }
    /* Feuilles qui montrent le vent */
    var feuilles = [];
    if(Math.abs(ventBase) > 5){
      for(var f = 0; f < 7; f++){ var fe = {x:U.rand(-240, 600), y:U.rand(60, 400), ph:U.rand(0, 6), v:U.rand(0.6, 1.2)}; fe.g = svgNoeud('path', {'class':'mja-feuille', d:'M0,0 c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z'}, gFeuilles); feuilles.push(fe); }
    }
    function ventA(tt){ return p.rafales ? ventBase * (0.7 + 0.45 * Math.sin(tt * 0.8) + 0.2 * Math.sin(tt * 2.3)) : ventBase; }

    /* Particules (plumes, éclats, copeaux) */
    var parts = [];
    function particule(x, y, art, vx, vy, vie, g, rot){
      var q = {x:x, y:y, vx:vx, vy:vy, vie:vie, age:0, g:g === undefined ? 300 : g, r:U.rand(0, 360), vr:rot === undefined ? U.rand(-300, 300) : rot};
      q.el = svgNoeud('g', {}, gParts); q.el.innerHTML = art; parts.push(q); return q;
    }
    function eclats(x, y, sorte){
      var i;
      if(sorte === 'plumes'){ for(i = 0; i < 12; i++) particule(x, y, plumeSVG(i % 3 ? '#2a2440' : '#4a3f6a'), U.rand(-120, 120), U.rand(-160, 40), U.rand(1.2, 2), 70); }
      else if(sorte === 'verre'){ for(i = 0; i < 10; i++) particule(x, y, '<path d="M0,-4 L4,3 L-3,2 Z" fill="' + (i % 2 ? '#ffe3a3' : '#bff9ff') + '" stroke="' + CONTOUR + '" stroke-width="1"/>', U.rand(-160, 160), U.rand(-200, 20), U.rand(0.7, 1.2), 520); for(i = 0; i < 6; i++) particule(x, y, '<circle r="3" fill="#ffd36a"/>', U.rand(-60, 60), U.rand(-120, -40), 0.6, -40, 0); }
      else if(sorte === 'bois'){ for(i = 0; i < 6; i++) particule(x, y, '<path d="M-3,-1 L3,-1 L2,1 L-2,1 Z" fill="#c99a5e" stroke="' + CONTOUR + '" stroke-width=".8"/>', U.rand(-90, 90), U.rand(-140, -20), 0.7, 500); for(i = 0; i < 4; i++) particule(x, y, '<path d="M0,0 c3,-4 7,-4 8,0 c-3,3 -6,3 -8,0 Z" fill="#3c9a62"/>', U.rand(-60, 60), U.rand(-60, 10), 1.4, 90); }
      else if(sorte === 'pomme'){ for(i = 0; i < 7; i++) particule(x, y, '<circle r="2.6" fill="' + (i % 2 ? '#ffe9c0' : '#e5484d') + '"/>', U.rand(-120, 120), U.rand(-160, 0), 0.8, 480); }
      else if(sorte === 'etoiles'){ for(i = 0; i < 10; i++){ var a = i / 10 * 6.28; particule(x, y, '<path d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z" fill="#ffe3a3"/>', Math.cos(a) * 170, Math.sin(a) * 170, 0.6, 0, 200); } }
    }
    /* Viser */
    var vise = null, enVol = null, apercuPts = [];
    for(var k = 0; k < 40; k++) apercuPts.push(svgNoeud('circle', {r:'2.6', 'class':'mja-pt', opacity:'0'}, gAp));
    function tirDepuis(v){
      var tirAng = Math.atan2(v.y, v.x), puis = Math.min(1, Math.sqrt(v.x * v.x + v.y * v.y) / ARC.tire);
      if(tenir > p.tenue){ var amp = Math.min(1, (tenir - p.tenue) / 1.5) * p.tremble * Math.PI / 180; tirAng += amp * (Math.sin(t * 9) + 0.5 * Math.sin(t * 13.7)); }
      return {ang:tirAng, puis:puis, vx:Math.cos(tirAng) * puis * ARC.v, vy:Math.sin(tirAng) * puis * ARC.v};
    }
    function pointeDepart(a){ return {x:ARC.x + Math.cos(a) * 14, y:ARC.y - 22 + Math.sin(a) * 14}; }
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini || enVol || fleches <= 0) return;
      e.preventDefault();
      var pt = ptSVG(svg, e);
      vise = {x0:pt.x, y0:pt.y, x:pt.x, y:pt.y, id:e.pointerId};
      tenir = 0;
      try{ svg.setPointerCapture(e.pointerId); }catch(er){}
    });
    P.ecoute(svg, 'pointermove', function(e){ if(!vise || e.pointerId !== vise.id) return; var pt = ptSVG(svg, e); vise.x = pt.x; vise.y = pt.y; });
    function lacher(e){
      if(!vise || (e && e.pointerId !== vise.id)) return;
      var v = {x:vise.x0 - vise.x, y:vise.y0 - vise.y};
      vise = null;
      if(Math.sqrt(v.x * v.x + v.y * v.y) < 14) return;
      tirer(tirDepuis(v));
    }
    P.ecoute(svg, 'pointerup', lacher); P.ecoute(svg, 'pointercancel', function(){ vise = null; });
    var br0 = terrain.querySelector('.mja-ralenti');
    if(br0) P.ecoute(br0, 'click', function(){ if(ralentiT > 0 || br0.disabled) return; ralentiT = p.ralenti; br0.disabled = true; U.son('magie'); terrain.classList.add('ralenti'); });
    /* Clavier (et robots de test) : flèches = viser, espace = tirer */
    var clav = {ang:-0.9, puis:0.75};
    P.ecoute(document, 'keydown', function(e){
      if(e.key === 'ArrowLeft') clav.ang -= 0.03; else if(e.key === 'ArrowRight') clav.ang += 0.03;
      else if(e.key === 'ArrowUp') clav.puis = Math.min(1, clav.puis + 0.03); else if(e.key === 'ArrowDown') clav.puis = Math.max(0.2, clav.puis - 0.03);
      else if(e.key === ' ' || e.key === 'Enter'){ if(!enVol && !fini && fleches > 0) tirer({ang:clav.ang, puis:clav.puis, vx:Math.cos(clav.ang) * clav.puis * ARC.v, vy:Math.sin(clav.ang) * clav.puis * ARC.v}); }
      else return;
      e.preventDefault();
    });
    terrain.mjaTirer = function(ang, puis){ if(enVol || fini || fleches <= 0) return false; tirer({ang:ang, puis:puis, vx:Math.cos(ang) * puis * ARC.v, vy:Math.sin(ang) * puis * ARC.v}); return true; };
    terrain.mjaEtat = function(){ return {t:t, vent:ventA(t), ventA:ventA, cibles:cibles.map(function(c){ return c.touche ? null : {type:c.type, q:posCible(c, t), c:c}; }), enVol:!!enVol, posCible:function(i, tt){ return posCible(cibles[i], tt); }, ARC:ARC, fleches:fleches, PERCE:PERCE, tirs:tirs, touches:touches, utiles:utiles, maxPerce:maxPerce,
      /* pour les robots : une branche ou un oiseau sera-t-il à cet endroit au temps tt ? */
      obstacle:function(x, y, tt){ var dto = tt === undefined ? 0 : tt - t; for(var b = 0; b < branches.length; b++) if(collBranche(branches[b], x, y, tt)) return true; for(var o = 0; o < oiseaux.length; o++) if(!oiseaux[o].fuit && dist({x:x, y:y}, {x:oiseaux[o].x + oiseaux[o].vx * dto, y:oiseaux[o].y}) < 20) return true; return false; }}; };

    function tirer(s){
      if(fleches < 99) fleches--;
      tirs++;
      majCarquois();
      U.son('fleche');
      var d = pointeDepart(s.ang), fort = s.puis >= PERCE;
      /* perce : tirée à fond, elle traverse les cibles ; nb : cibles déjà traversées */
      enVol = {x:d.x, y:d.y, vx:s.vx, vy:s.vy, hist:[], age:0, ralenti:false, perce:fort, nb:0};
      flVol.classList.toggle('puissante', fort); trainee.classList.toggle('puissante', fort);
      flVol.setAttribute('opacity', '1');
      cordeArc.classList.remove('vibre'); void cordeArc.getBoundingClientRect(); cordeArc.classList.add('vibre');
      encoche.setAttribute('opacity', '0');
      apercuPts.forEach(function(c){ c.setAttribute('opacity', '0'); });
    }
    function local(c, x, y){ var a = c.q.a || 0, dx = x - c.q.x, dy = y - c.q.y, ca = Math.cos(a), sa = Math.sin(a); return {x:dx * ca - dy * sa, y:dx * sa + dy * ca, a:a}; }
    function planter(x, y, ang, parent){
      var g = svgNoeud('g', {'class':'mja-plantee', transform:'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + (ang * 57.3).toFixed(1) + ')'}, parent || gPl);
      g.innerHTML = '<g transform="translate(-8,0)">' + FLECHE_ART + '</g>';
      return g;
    }
    function finVol(){ enVol = null; flVol.setAttribute('opacity', '0'); trainee.setAttribute('d', ''); P.apres(250, function(){ if(!enVol) encoche.setAttribute('opacity', '1'); }); verifierFin(); }
    function verifierFin(){
      if(fini) return;
      var perdues = tirs - utiles, exploit = maxPerce >= 2 ? 'Une flèche en a transpercé ' + maxPerce + ' d\'un coup ! ' : '';
      if(touches >= cibles.length){ fini = true; P.finir({reussi:true, score:1, erreurs:perdues, transperce:maxPerce, detail:exploit + (perdues === 0 ? 'Pas une seule flèche perdue !' : 'Toutes les cibles sont tombées !')}, 1300); return; }
      if(fleches < 99 && !enVol){
        var hr = restantsTir();
        if(hr < 0){ fini = true; P.finir({reussi:false, score:touches / cibles.length, erreurs:perdues, transperce:maxPerce, detail:'Plus de cœur : une flèche perdue de trop… il n\'en reste plus assez pour toutes les cibles.'}, 1000); return; }
        hud.coeurs(hr, Math.max(coeursTir, hr), hr < coeursAvant ? hr : undefined);
        if(hr === 0 && coeursAvant > 0) U.plusDeCoeur(terrain);
        coeursAvant = hr;
      }
      if(fleches <= 0 && !enVol){ fini = true; P.finir({reussi:false, score:touches / cibles.length, erreurs:perdues, transperce:maxPerce, detail:'Plus de flèches dans le carquois…'}, 1000); }
    }
    function texte(x, y, s, cls){ var q = pctDans(svg, terrain, x, y); flotter(terrain, q.x, q.y, s, cls); }
    /* sansTexte : la flèche qui transperce affiche « Transpercé ! ×2 » à la place */
    function toucher(c, x, y, parfait, sansTexte){
      c.touche = true; touches++;
      hud.prog(touches, cibles.length, '🎯');
      U.son(parfait ? 'gain' : 'ok'); U.vibrer(25);
      c.g.classList.add('touchee');
      var msg, mx = x, my = y - 30;
      if(c.type === 'corbeau'){ eclats(x, y, 'plumes'); c.chute = {vx:U.rand(-40, 40), vy:-160, r:0}; msg = parfait ? 'Tir parfait ! Croâ !' : 'Croâ !'; }
      else if(c.type === 'lanterne'){ eclats(x, y, 'verre'); c.chute = {vx:0, vy:-40, r:0}; c.g.classList.add('eteinte'); msg = parfait ? 'Tir parfait !' : 'Touché !'; }
      else if(c.type === 'sac'){ eclats(x, y, 'bois'); c.chute = {vx:U.rand(-30, 30), vy:0, r:0}; if(c.fil) c.fil.classList.add('coupee'); msg = 'Corde coupée !'; mx = c.q.x; my = c.q.y - 40; }
      else { eclats(x, y, 'pomme'); c.chute = {vx:0, vy:0, r:0}; msg = parfait ? 'Tir parfait !' : 'Touché !'; }
      if(!sansTexte) texte(mx, my, msg, 'ok');
      if(parfait) eclats(x, y, 'etoiles');
      if(c.fil && c.type === 'lanterne') c.fil.classList.add('vide');
    }
    /* La flèche tirée à fond traverse la cible et continue sa route */
    function traverser(res){
      var vol = enVol; vol.nb++;
      if(vol.nb === 1) utiles++;
      maxPerce = Math.max(maxPerce, vol.nb);
      toucher(res.c, res.x, res.y, res.parfait, vol.nb >= 2);
      if(!res.parfait) eclats(res.x, res.y, 'etoiles');
      if(vol.nb >= 2){
        texte(res.x, res.y - 48, 'Transpercé ! ×' + vol.nb, 'perce');
        U.son('magie'); U.vibrer(60);
        [784, 988, 1175, 1568, 1976].slice(0, vol.nb + 1).forEach(function(f, i){ P.apres(i * 75, function(){ note(f, 0.3); }); });
      }
      /* fin du ralenti sur cette cible ; il peut repartir pour la suivante */
      if(vol.ralenti){ vol.ralenti = false; P.apres(380, function(){ if(enVol && enVol.ralenti) return; slowCible = 1; camZc = 1; camXc = 180; camYc = 240; }); }
    }
    function rater(x, y, quoi){
      erreurSensorielle(terrain);
      texte(x, y - 24, quoi, 'ko');
    }
    /* Une étape de vol : renvoie ce qui est touché (ignore : cibles déjà traversées, pour l'aperçu) */
    function collision(x, y, tt, ignore){
      for(var i = 0; i < cibles.length; i++){
        var c = cibles[i]; if(c.touche || (ignore && ignore.indexOf(c) >= 0)) continue;
        var q = posCible(c, tt);
        if(c.type === 'sac'){
          var seg = distSeg({x:x, y:y}, {x:c.s.ax, y:c.s.ay}, {x:q.nx, y:q.ny});
          if(seg.d < p.corde && seg.t > 0.08) return {c:c, parfait:true, x:x, y:y};
          if(dist({x:x, y:y}, q) < 19) return {rate:'sac', c:c, x:x, y:y};
        } else {
          var r = c.type === 'corbeau' ? p.rayon * 1.05 : p.rayon, dd = dist({x:x, y:y}, q);
          if(dd < r) return {c:c, parfait:dd < r * 0.42, x:x, y:y};
        }
      }
      for(var b = 0; b < branches.length; b++){ var h = collBranche(branches[b], x, y); if(h) return {branche:branches[b], local:h, x:x, y:y}; }
      for(var o = 0; o < oiseaux.length; o++){ var oi = oiseaux[o]; if(!oi.fuit && dist({x:x, y:y}, oi) < 13) return {oiseau:oi, x:x, y:y}; }
      if(y > 422 + Math.sin(x / 50) * 4) return {sol:true, x:x, y:y};
      if(x > 640 || x < -280 || y > 720) return {perdue:true, x:x, y:y};
      return null;
    }
    /* Prévision (pour le ralenti) */
    function prevoir(v, tt, duree){
      var s = {x:v.x, y:v.y, vx:v.vx, vy:v.vy}, h = 1 / 90;
      for(var k = 0; k < duree / h; k++){
        s.vx += ventA(tt) * h; s.vy += ARC.g * h; s.x += s.vx * h; s.y += s.vy * h; tt += h;
        var r = collision(s.x, s.y, tt); if(r) return r;
      }
      return null;
    }
    /* fort : arc bandé à fond, l'aperçu complet continue à travers les cibles (toutes surlignées) */
    function apercu(v, fort){
      var complet = p.revele || tirs < p.aide;
      var duree = complet ? 2.2 : p.apercu;
      var s = {x:v.x, y:v.y, vx:v.vx, vy:v.vy}, h = 1 / 60, n = 0, tt = t, vu = null, vues = [];
      for(var k = 0; k < duree / h && n < apercuPts.length; k++){
        if(complet) s.vx += ventA(tt) * h;
        s.vy += ARC.g * h; s.x += s.vx * h; s.y += s.vy * h; tt += h;
        if(k % 3 === 2){ var c = apercuPts[n++]; c.setAttribute('cx', s.x.toFixed(1)); c.setAttribute('cy', s.y.toFixed(1)); c.setAttribute('opacity', complet ? '0.9' : (1 - k * h / duree).toFixed(2)); }
        if(complet && !vu){ var r = collision(s.x, s.y, tt, vues); if(r){ if(fort && r.c && !r.rate) vues.push(r.c); else { vu = r; break; } } }
      }
      for(; n < apercuPts.length; n++) apercuPts[n].setAttribute('opacity', '0');
      cibles.forEach(function(c){ c.g.classList.toggle('visee', vues.indexOf(c) >= 0 || !!(vu && vu.c === c && !vu.rate)); });
    }

    P.boucle(function(dtR){
      if(fini && !parts.length && slow === 1) {/* on laisse finir les animations */}
      if(ralentiT > 0){ ralentiT -= dtR; if(ralentiT <= 0) terrain.classList.remove('ralenti'); }
      slow += (slowCible - slow) * Math.min(1, dtR * 10);
      var dt = dtR * slow * (ralentiT > 0 ? 0.35 : 1);
      t += dt;
      var vent = ventA(t);
      /* caméra */
      camZ += (camZc - camZ) * Math.min(1, dtR * 6); camX += (camXc - camX) * Math.min(1, dtR * 6); camY += (camYc - camY) * Math.min(1, dtR * 6);
      cam.setAttribute('transform', camZ > 1.01 ? 'translate(' + camX.toFixed(1) + ',' + camY.toFixed(1) + ') scale(' + camZ.toFixed(3) + ') translate(' + (-camX).toFixed(1) + ',' + (-camY).toFixed(1) + ')' : '');
      /* décor vivant */
      manche.setAttribute('transform', 'translate(0,-50) rotate(' + (vent >= 0 ? 0 : 180) + ' 0 9) scale(' + (0.35 + Math.min(1, Math.abs(vent) / 120) * 0.75).toFixed(2) + ',1)');
      feuilles.forEach(function(fe){
        fe.x += (vent * 1.1 + Math.sign(vent) * 30) * dt * fe.v; fe.y += Math.sin(t * 2 + fe.ph) * 20 * dt;
        if(fe.x > 610) fe.x = -250; if(fe.x < -250) fe.x = 610;
        fe.g.setAttribute('transform', 'translate(' + fe.x.toFixed(0) + ',' + fe.y.toFixed(0) + ') rotate(' + ((t * 160 * fe.v) % 360).toFixed(0) + ')');
      });
      cibles.forEach(function(c){
        if(c.chute){
          var ch = c.chute; ch.vy += 600 * dt; ch.r += (c.type === 'corbeau' ? 400 : 120) * dt;
          if(c.type === 'corbeau'){ ch.vy = Math.min(ch.vy, 60) - 900 * dt * (ch.r > 300 ? 1 : 0); }
          c.q.x += ch.vx * dt; c.q.y += ch.vy * dt;
          if(c.q.y < 700 && c.q.y > -300) c.g.setAttribute('transform', 'translate(' + c.q.x.toFixed(1) + ',' + c.q.y.toFixed(1) + ') rotate(' + ch.r.toFixed(0) + ')');
          else c.g.style.display = 'none';
          if(c.fil && c.type === 'lanterne'){ var a = Math.sin(t * 3) * 0.2; c.fil.setAttribute('x2', (c.s.ax + Math.sin(a) * 30).toFixed(1)); c.fil.setAttribute('y2', (c.s.ay + 30).toFixed(1)); }
          if(c.fil && c.type === 'sac'){ var a2 = Math.sin(t * 3) * 0.3; c.fil.setAttribute('x2', (c.s.ax + Math.sin(a2) * 40).toFixed(1)); c.fil.setAttribute('y2', (c.s.ay + 40).toFixed(1)); }
        } else dessinerCible(c);
      });
      branches.forEach(function(br){ br.g.setAttribute('transform', 'translate(' + br.bx + ',' + br.by + ') rotate(' + (angBranche(br) * 57.3).toFixed(1) + ')'); });
      if(p.oiseaux){ prochainOiseau -= dt; if(prochainOiseau <= 0){ lancerOiseau(); prochainOiseau = p.oiseaux * U.rand(0.7, 1.3); } }
      oiseaux = oiseaux.filter(function(o){
        o.x += o.vx * dt; o.y += (o.fuit ? -140 : Math.sin(t * 3 + o.ph) * 18) * dt;
        o.g.setAttribute('transform', 'translate(' + o.x.toFixed(1) + ',' + o.y.toFixed(1) + ')');
        if(o.x < -270 || o.x > 630 || o.y < -230){ o.g.parentNode.removeChild(o.g); return false; }
        return true;
      });
      /* l'arc */
      var ang = clav.ang, puis = 0;
      if(vise){
        tenir += dtR;
        var v = {x:(vise.x0 - vise.x), y:(vise.y0 - vise.y)};
        var s = tirDepuis(v); ang = s.ang; puis = s.puis;
        var d = pointeDepart(ang), fort = puis >= PERCE;
        apercu({x:d.x, y:d.y, vx:s.vx, vy:s.vy}, fort);
        jaugeArc.style.strokeDasharray = (puis * 276).toFixed(0) + ' 400';
        jaugeArc.classList.toggle('tremble', tenir > p.tenue);
        /* bandé à fond : jauge dorée, flèche dorée, « À fond ! » */
        if(fort !== !!vise.fort){ vise.fort = fort; jaugeArc.classList.toggle('fort', fort); gAp.classList.toggle('fort', fort); encoche.classList.toggle('fort', fort); aFond.classList.toggle('on', fort); if(fort){ U.son('tic'); U.vibrer(15); } }
      } else {
        jaugeArc.style.strokeDasharray = '0 400'; tenir = 0; cibles.forEach(function(c){ c.g.classList.remove('visee'); });
        if(jaugeArc.classList.contains('fort')){ jaugeArc.classList.remove('fort'); gAp.classList.remove('fort'); encoche.classList.remove('fort'); aFond.classList.remove('on'); }
      }
      if(vise || !enVol){ arcRot.setAttribute('transform', 'rotate(' + (ang * 57.3).toFixed(1) + ')'); }
      cordeArc.setAttribute('d', 'M0,-38 L' + (-puis * 26).toFixed(1) + ',0 L0,38');
      encoche.setAttribute('transform', 'translate(' + (-puis * 26 + 22).toFixed(1) + ',0)');
      /* la flèche */
      if(enVol){
        var sub = 4, h = dt / sub, res = null;
        for(var k = 0; k < sub && !res; k++){
          enVol.vx += vent * h; enVol.vy += ARC.g * h; enVol.x += enVol.vx * h; enVol.y += enVol.vy * h;
          res = collision(enVol.x, enVol.y, t - dt + h * (k + 1));
          /* tirée à fond : elle traverse la cible et continue (les obstacles et le sac l'arrêtent toujours) */
          if(res && enVol.perce && res.c && !res.rate){ traverser(res); res = null; }
        }
        /* toutes les cibles sont tombées : la flèche qui transperce n'a plus besoin de voler longtemps */
        if(!res && enVol.nb && touches >= cibles.length){ enVol.age += dt; if(enVol.age > 0.6) res = {perdue:true, x:enVol.x, y:enVol.y}; }
        enVol.hist.push(enVol.x.toFixed(1) + ',' + enVol.y.toFixed(1)); if(enVol.hist.length > 9) enVol.hist.shift();
        trainee.setAttribute('d', 'M' + enVol.hist.join(' L'));
        var aV = Math.atan2(enVol.vy, enVol.vx);
        flVol.setAttribute('transform', 'translate(' + enVol.x.toFixed(1) + ',' + enVol.y.toFixed(1) + ') rotate(' + (aV * 57.3).toFixed(1) + ')');
        /* ralenti : tir parfait ou dernière cible */
        if(!enVol.ralenti && !res){
          var pr = prevoir(enVol, t, 0.26);
          /* ralenti : tir parfait, dernière cible, ou une flèche qui va en transpercer une deuxième */
          if(pr && pr.c && !pr.rate && (pr.parfait || touches === cibles.length - 1 || enVol.nb >= 1)){ enVol.ralenti = true; enVol.zoom = true; slowCible = 0.2; camZc = 1.55; camXc = pr.x; camYc = pr.y; }
        }
        if(res){
          /* deja : cette flèche a déjà transpercé une cible, ce n'est plus un raté */
          var vol = enVol, deja = vol.nb > 0; enVol = null;
          var rate2 = function(x, y, quoi){ if(deja) texte(x, y - 24, quoi, 'ko'); else rater(x, y, quoi); };
          if(res.c && !res.rate){ utiles++; maxPerce = Math.max(maxPerce, 1); toucher(res.c, res.x, res.y, res.parfait); if(res.c.type === 'pomme' || res.c.type === 'lanterne'){ var lo = local(res.c, res.x, res.y); planter(lo.x, lo.y, aV + lo.a, res.c.art); } }
          else if(res.rate === 'sac'){ eclats(res.x, res.y, 'bois'); rate2(res.x, res.y, 'Vise la corde !'); var lo2 = local(res.c, res.x, res.y); planter(lo2.x, lo2.y, aV + lo2.a, res.c.art); }
          else if(res.branche){ eclats(res.x, res.y, 'bois'); rate2(res.x, res.y, 'Dans la branche !'); planter(res.local.lx, res.local.ly, aV - angBranche(res.branche), res.branche.fl); if(!deja) U.son('ko'); }
          else if(res.oiseau){ res.oiseau.fuit = true; res.oiseau.vx *= -1.6; particule(res.x, res.y, FLECHE_ART, vol.vx * 0.1, -80, 1.2, 500, 500); rate2(res.x, res.y, deja ? 'Piou !' : 'Piou ! Un oiseau…'); }
          else if(res.sol){ planter(res.x, res.y, aV); if(!deja) rater(res.x, res.y, 'Raté'); }
          else if(!deja){ rater(fixe(res.x, 20, 340), fixe(res.y, 40, 420), 'Raté'); }
          if(vol.ralenti || vol.zoom){ P.apres(380, function(){ if(enVol && enVol.ralenti) return; slowCible = 1; camZc = 1; camXc = 180; camYc = 240; }); }
          else { slowCible = 1; camZc = 1; }
          finVol();
        }
      }
      /* particules */
      parts = parts.filter(function(q){
        q.age += dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
        if(q.g < 100){ q.vx *= (1 - dt * 1.5); }
        q.el.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') rotate(' + q.r.toFixed(0) + ')');
        q.el.setAttribute('opacity', Math.max(0, 1 - q.age / q.vie).toFixed(2));
        if(q.age > q.vie){ q.el.parentNode.removeChild(q.el); return false; }
        return true;
      });
    });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   RYTHME (Alchimiste) — le chaudron vu du dessus : la cuillère
   tourne autour. Touche quand elle passe sur une goutte dorée.
   Si elle passe une goutte sans que tu touches, c'est raté aussi !
   À chaque goutte prise, la cuillère repart dans l'autre sens et
   va un peu plus vite. Plus loin : plusieurs gouttes à la fois,
   gouttes de poison 💀 à ne PAS toucher, vitesse qui varie.
   Mods : erreurs (+vies), zone (gouttes plus larges), lent et temps (cuillère
   plus lente), aide (N premières gouttes : elle brille quand c'est
   le moment), revele (toujours), params.couleur (couleur potion).
   ========================================================== */
function bullesDansChaudron(gB, n, couleur){
  for(var i = 0; i < n; i++){
    var c = svgNoeud('circle', {cx:U.rand(-55, 55).toFixed(0), cy:'-16', r:U.rand(3, 8).toFixed(1), 'class':'mja-bulle-ch', fill:couleur || '#bff9ff'}, gB);
    c.style.animationDelay = (i * 0.08) + 's';
    (function(c){ setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 1400); })(c);
  }
}
var GAMME = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
function chaudronDessus(id, couleur){
  return '<defs><radialGradient id="' + id + 'f" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#5a5078"/><stop offset=".6" stop-color="#2b2540"/><stop offset="1" stop-color="#14111f"/></radialGradient>' +
    '<radialGradient id="' + id + 'l" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    '<circle r="152" fill="#000" opacity=".3" cy="10"/>' +
    '<circle r="148" fill="url(#' + id + 'f)" stroke="' + CONTOUR + '" stroke-width="6"/>' +
    '<circle r="134" fill="none" stroke="#6b6290" stroke-width="3" opacity=".5"/>' +
    '<circle class="mja-liq-dessus" r="128" fill="' + couleur + '" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<g class="mja-remous"><path d="M-80,-20 C-60,-70 20,-90 60,-50 M-40,40 C0,70 70,50 90,0 M-20,-10 C0,-30 30,-20 30,0" stroke="#fff" stroke-opacity=".35" stroke-width="6" fill="none" stroke-linecap="round"/></g>' +
    '<circle r="128" fill="url(#' + id + 'l)"/>';
}
MJ.enregistrer('rythme', {
  nom:'Remuer en rythme', role:'alchimiste', ic:'🥄',
  consigne:'Touche l\'écran quand la cuillère passe sur une goutte dorée, sans en laisser filer une seule !',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    p.coups = entier(n, {1:6, 3:10, 6:14, 9:18, 12:22});
    p.vitesse = courbe(n, {1:90, 3:126, 6:172, 9:225, 12:265}) * (mods.lent || 1) / (1 + 0.06 * Math.min(5, mods.temps || 0));
    p.accel = courbe(n, {1:1.0, 3:1.009, 6:1.016, 9:1.022});
    p.largeur = courbe(n, {1:17, 3:13, 6:9.5, 9:7, 12:6}) * (mods.zone || 1);
    p.inverse = n >= 2;
    p.gouttes = n >= 9 ? 3 : (n >= 5 ? 2 : 1);
    p.poisons = n >= 8 ? 2 : (n >= 4 ? 1 : 0);
    p.variation = n >= 7 ? courbe(n, {7:0.1, 12:0.22}) : 0;
    p.erreurs = erreursPermises(n, mods);
    p.aide = mods.aide || 0;
    p.revele = !!mods.revele;
    p.couleur = '#7cc4ff';
    p.lignes = [
      {nom:'Gouttes à attraper', val:String(p.coups)},
      {nom:'Vitesse de la cuillère', val:Math.round(p.vitesse / 36) + ' / 10' + (p.inverse ? ', change de sens' : '')},
      {nom:'Taille des gouttes', val:p.largeur >= 14 ? 'grosses' : (p.largeur >= 9 ? 'moyennes' : 'toutes petites')},
      {nom:'Pièges', val:(p.gouttes > 1 ? p.gouttes + ' gouttes à la fois' : '') + (p.poisons ? (p.gouttes > 1 ? ', ' : '') + p.poisons + ' poison 💀' : '') || 'aucun'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    el.innerHTML = '<svg class="mja-demo-svg" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet"><g transform="translate(150,85) scale(.52)">' + chaudronDessus(nid('rd'), '#7cc4ff') +
      '<path class="mja-goutte-arc" d="" stroke-width="22"/><g class="dc"><path d="M0,-22 L0,-96" stroke="' + CONTOUR + '" stroke-width="14" stroke-linecap="round"/><path d="M0,-22 L0,-96" stroke="#c99a5e" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-112" rx="14" ry="19" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="5"/></g></g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), c = svg.querySelector('.dc'), arc = svg.querySelector('.mja-goutte-arc'), main = svg.querySelector('.mja-main');
    var cible = 1.2;
    function arcD(a, hw){ var R = 112, x1 = Math.sin(a - hw) * R, y1 = -Math.cos(a - hw) * R, x2 = Math.sin(a + hw) * R, y2 = -Math.cos(a + hw) * R; return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1); }
    arc.setAttribute('d', arcD(cible, 0.25));
    var a = -0.6, dir = 1, tape = 0;
    main.style.transition = 'none'; main.style.transform = 'translate(250px,140px)';
    return demoBoucle(svg, function(dt){
      a += dir * 1.6 * dt;
      if(Math.abs(angleNorm(a - cible)) < 0.06 && tape <= 0){ tape = 0.5; main.classList.remove('tape'); void main.getBoundingClientRect(); main.classList.add('tape'); dir = -dir; cible = a + dir * U.rand(1.6, 3.4); arc.setAttribute('d', arcD(cible, 0.25)); }
      if(tape > 0) tape -= dt;
      c.setAttribute('transform', 'rotate(' + (a * 57.3).toFixed(1) + ')');
    });
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies); hud.prog(0, p.coups, '💧');
    var terrain = U.html('<div class="mja-terrain mja-rythme"></div>');
    el.appendChild(terrain);
    var id = nid('ry'), R = 112, couleur = p.couleur || '#7cc4ff';
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet"><g transform="translate(180,236)">' + chaudronDessus(id, couleur) +
      '<circle r="' + R + '" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2" stroke-dasharray="3 9"/>' +
      '<g class="mja-gouttes-r"></g><g class="mja-eclabousse"></g>' +
      '<g class="mja-cuillere"><path d="M0,-18 L0,' + (-R + 18) + '" stroke="' + CONTOUR + '" stroke-width="14" stroke-linecap="round"/><path d="M0,-18 L0,' + (-R + 18) + '" stroke="#c99a5e" stroke-width="8" stroke-linecap="round"/><path d="M-2,-30 L-2,' + (-R + 26) + '" stroke="#e6c08a" stroke-width="2" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="' + (-R) + '" rx="13" ry="18" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="-3" cy="' + (-R - 4) + '" rx="5" ry="8" fill="#f0d4a8"/></g>' +
      '<circle r="20" fill="#2b2540" stroke="' + CONTOUR + '" stroke-width="4"/><text class="mja-combo" y="7" text-anchor="middle"></text>' +
    '</g></svg>' +
    '<div class="mja-actions"><button class="btn grand mja-remuer" type="button">🥄 Remue !</button></div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var gG = svg.querySelector('.mja-gouttes-r'), cuil = svg.querySelector('.mja-cuillere'), liq = svg.querySelector('.mja-liq-dessus'), gE = svg.querySelector('.mja-eclabousse'), combo = svg.querySelector('.mja-combo');
    var hw = p.largeur * Math.PI / 180, omega = p.vitesse * Math.PI / 180;
    var a = 0, dir = 1, faits = 0, serie = 0, fini = false, t = 0, depart = 0.9, gouttes = [];
    function arcD(ang, w){ var x1 = Math.sin(ang - w) * R, y1 = -Math.cos(ang - w) * R, x2 = Math.sin(ang + w) * R, y2 = -Math.cos(ang + w) * R; return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1); }
    function libre(ang){ return gouttes.every(function(g){ return Math.abs(angleNorm(g.ang - ang)) > hw * 3 + 0.25; }) && Math.abs(angleNorm(ang - a)) > 0.9; }
    function placer(g){
      for(var k = 0; k < 40; k++){
        var ang = a + dir * U.rand(1.25, 5.2);
        if(libre(ang)){ g.ang = ang; break; }
      }
      g.dedans = false;
      g.arc.setAttribute('d', arcD(g.ang, hw));
      g.ic.setAttribute('transform', 'translate(' + (Math.sin(g.ang) * R).toFixed(1) + ',' + (-Math.cos(g.ang) * R).toFixed(1) + ')');
      g.el.classList.remove('nait'); void g.el.getBoundingClientRect(); g.el.classList.add('nait');
    }
    function creer(poison){
      var g = {poison:poison, ang:0};
      g.el = svgNoeud('g', {'class':'mja-goutte-r' + (poison ? ' poison' : '')}, gG);
      g.arc = svgNoeud('path', {'class':'mja-goutte-arc'}, g.el);
      g.ic = svgNoeud('g', {'class':'mja-goutte-ic'}, g.el);
      g.ic.innerHTML = poison ? '<circle r="11" fill="#5a2a7a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-5,-2 C-5,-8 5,-8 5,-2 C5,1 3,2 3,4 L-3,4 C-3,2 -5,1 -5,-2 Z" fill="#eef0ff"/><circle cx="-2" cy="-2" r="1.4" fill="#5a2a7a"/><circle cx="2" cy="-2" r="1.4" fill="#5a2a7a"/>'
        : '<path d="M0,-12 C6,-4 9,1 9,4 C9,9 5,12 0,12 C-5,12 -9,9 -9,4 C-9,1 -6,-4 0,-12 Z" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-4,2 C-4,5 -2,7 1,7" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>';
      gouttes.push(g);
      placer(g);
      return g;
    }
    for(var i = 0; i < p.gouttes; i++) creer(false);
    for(var j = 0; j < p.poisons; j++) creer(true);
    function eclabousser(ang, coul){
      var x = Math.sin(ang) * R, y = -Math.cos(ang) * R;
      for(var k = 0; k < 8; k++){
        var c = svgNoeud('circle', {cx:x.toFixed(1), cy:y.toFixed(1), r:U.rand(3, 6).toFixed(1), fill:coul, 'class':'mja-giclee'}, gE);
        var aa = U.rand(0, 6.28), d = U.rand(18, 40);
        c.style.setProperty('--dx', (Math.cos(aa) * d).toFixed(0) + 'px'); c.style.setProperty('--dy', (Math.sin(aa) * d).toFixed(0) + 'px');
        (function(c){ setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 600); })(c);
      }
    }
    function rate(texte){
      vies--; hud.perdVie(vies, maxVies); serie = 0; combo.textContent = '';
      erreurSensorielle(terrain);
      liq.classList.remove('rouge'); void liq.getBoundingClientRect(); liq.classList.add('rouge');
      var q = pctDans(svg, terrain, 180 + Math.sin(a) * R, 236 - Math.cos(a) * R - 30); flotter(terrain, q.x, q.y, texte, 'ko');
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:faits / p.coups, erreurs:maxVies, detail:'La potion a tourné…'}, 900); }
    }
    function remuer(){
      if(fini || depart > 0) return;
      var bonne = null, poison = null;
      gouttes.forEach(function(g){ if(Math.abs(angleNorm(a - g.ang)) <= hw){ if(g.poison) poison = g; else bonne = g; } });
      if(bonne){
        faits++; serie++;
        hud.prog(faits, p.coups, '💧');
        note(GAMME[Math.min(GAMME.length - 1, serie - 1)], 0.25);
        U.vibrer(15);
        eclabousser(bonne.ang, '#ffd36a');
        liq.classList.remove('flash'); void liq.getBoundingClientRect(); liq.classList.add('flash');
        combo.textContent = serie > 1 ? '×' + serie : '';
        if(faits >= p.coups){ fini = true; U.son('ok'); liq.classList.add('brille'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'La potion est parfaitement mélangée !'}, 900); return; }
        if(p.inverse) dir = -dir;
        omega *= p.accel;
        placer(bonne);
        gouttes.forEach(function(g){ if(g.poison && Math.random() < 0.5) placer(g); });
      } else if(poison){ eclabousser(poison.ang, '#9d6ee3'); rate('Poison !'); placer(poison); }
      else rate('Splatch !');
    }
    P.ecoute(terrain.querySelector('.mja-remuer'), 'pointerdown', function(e){ e.preventDefault(); remuer(); });
    P.ecoute(svg, 'pointerdown', function(e){ e.preventDefault(); remuer(); });
    P.ecoute(document, 'keydown', function(e){ if((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); remuer(); } });
    terrain.mjaEtat = function(){ return {a:a, hw:hw, dir:dir, w:omega * (1 + p.variation * Math.sin(t * 1.3)), gouttes:gouttes.map(function(g){ return {ang:g.ang, poison:g.poison}; }), depart:depart}; };
    annonce(terrain, '🥄 Prêt ?', 900);
    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      if(depart > 0){ depart -= dt; }
      else {
        var w = omega * (1 + p.variation * Math.sin(t * 1.3));
        a += dir * w * dt;
      }
      cuil.setAttribute('transform', 'rotate(' + (a * 57.3).toFixed(2) + ')');
      for(var i = 0; i < gouttes.length; i++){
        var g = gouttes[i], rel = angleNorm(a - g.ang) * dir;
        var dedans = Math.abs(rel) <= hw;
        g.el.classList.toggle('maintenant', dedans && !g.poison && (p.revele || faits < p.aide));
        if(dedans) g.dedans = true;
        else if(g.dedans && rel > hw && rel < hw + 0.6){
          g.dedans = false;
          if(!g.poison){ rate('Trop tard !'); if(fini) return false; placer(g); }
        } else if(rel < -hw) g.dedans = false;
      }
    });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   BULLES (Alchimiste) — mémoire : les bulles magiques s'allument
   dans un ordre (avec une note chacune), puis on le refait.
   Plusieurs manches : la suite s'allonge à chaque manche. Plus loin :
   les bulles ÉCHANGENT leurs places juste avant ton tour (retiens
   les couleurs, pas les places !), une manche se joue À L'ENVERS ⏪,
   et les bulles flottent pendant que tu joues.
   Mods compris : erreurs (+vies), lent et temps (montre plus lentement),
   zone (les bulles bougent moins souvent),
   aide (N fois le bouton « Revoir »), revele (la bonne bulle luit
   doucement pendant qu'on joue).
   ========================================================== */
var BULLES_DEF = [
  {c:'#e5484d', f:523, s:'<path d="M0,9 C-10,2 -12,-4 -8,-8 C-5,-11 -1,-10 0,-6 C1,-10 5,-11 8,-8 C12,-4 10,2 0,9 Z"/>'},
  {c:'#3f7fe0', f:587, s:'<path d="M0,-11 C6,-3 9,2 9,5 C9,10 5,13 0,13 C-5,13 -9,10 -9,5 C-9,2 -6,-3 0,-11 Z"/>'},
  {c:'#f6d23a', f:659, s:'<path d="M0,-11 L3,-3 L11,-3 L5,2 L7,10 L0,5 L-7,10 L-5,2 L-11,-3 L-3,-3 Z"/>'},
  {c:'#4fbf6a', f:784, s:'<path d="M-9,9 C-11,-4 -2,-11 10,-10 C11,2 4,10 -9,9 Z M-9,9 L4,-4" />'},
  {c:'#9d6ee3', f:880, s:'<path d="M4,-11 C-6,-10 -11,-2 -9,5 C-7,11 2,13 8,9 C1,8 -4,2 -2,-5 C-1,-8 1,-10 4,-11 Z"/>'},
  {c:'#f08a3c', f:1047, s:'<path d="M0,12 C-8,10 -10,2 -6,-4 C-6,0 -3,1 -2,0 C-4,-6 0,-10 3,-12 C3,-6 9,-3 8,4 C8,9 4,12 0,12 Z"/>'},
  {c:'#ef7fa8', f:1175, s:'<path d="M0,-11 L3,-4 L10,-6 L5,0 L10,6 L3,4 L0,11 L-3,4 L-10,6 L-5,0 L-10,-6 L-3,-4 Z"/>'},
  {c:'#8ff3ff', f:1319, s:'<path d="M0,-11 L9,0 L0,11 L-9,0 Z"/>'}
];
function placesBulles(N){
  var pos = [], i;
  if(N <= 5){
    var R = 118;
    for(i = 0; i < N; i++){
      var a = -Math.PI / 2 + (i - (N - 1) / 2) * (Math.PI * 1.15 / Math.max(1, N - 1)) * (N <= 4 ? 1.05 : 1);
      pos.push({x:180 + Math.cos(a) * R * 1.25, y:250 + Math.sin(a) * R});
    }
  } else {
    var h = Math.ceil(N / 2), b = N - h;
    for(i = 0; i < h; i++) pos.push({x:180 + (i - (h - 1) / 2) * 84, y:128});
    for(i = 0; i < b; i++) pos.push({x:180 + (i - (b - 1) / 2) * 84, y:222});
  }
  return pos;
}
MJ.enregistrer('bulles', {
  nom:'Les bulles magiques', role:'alchimiste', ic:'🫧',
  consigne:'Regarde l\'ordre dans lequel les bulles s\'allument, puis touche-les dans le même ordre.',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    p.bulles = entier(n, {1:4, 3:5, 6:6, 9:7, 12:8});
    p.manches = entier(n, {1:2, 3:3, 6:3, 9:4});
    p.longueur = entier(n, {1:3, 3:4, 6:5, 9:6, 12:7});
    p.intervalle = (courbe(n, {1:0.9, 3:0.68, 6:0.5, 9:0.38, 12:0.32}) + 0.08 * Math.min(4, mods.temps || 0)) / (mods.lent || 1);
    p.melange = courbe(n, {1:0, 4:0, 5:0.5, 6:1}) / Math.pow(mods.zone || 1, 3);
    p.envers = n >= 7;
    p.flotte = n >= 8;
    p.erreurs = erreursPermises(n, mods, {1:2, 3:1, 6:1, 9:0});
    p.revoir = mods.aide || 0;
    p.revele = !!mods.revele;
    p.lignes = [
      {nom:'Bulles', val:String(p.bulles)},
      {nom:'Longueur de la suite', val:p.longueur + ' → ' + (p.longueur + p.manches - 1)},
      {nom:'Vitesse', val:txtS(p.intervalle) + ' par bulle'},
      {nom:'Pièges', val:[p.melange >= 1 ? 'les bulles changent de place' : (p.melange > 0 ? 'parfois, les bulles changent de place' : ''), p.envers ? 'une manche à l\'envers ⏪' : '', p.flotte ? 'bulles qui flottent' : ''].filter(Boolean).join(', ') || 'aucun'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/>');
    var pos = [[90,70],[150,50],[210,70]];
    d.contenu.innerHTML = pos.map(function(q, i){ var b = BULLES_DEF[i]; return '<g class="mja-bulle-demo" transform="translate(' + q[0] + ',' + q[1] + ')"><circle r="22" fill="' + b.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><g fill="#fff" opacity=".85">' + b.s + '</g></g>'; }).join('');
    var bs = d.contenu.querySelectorAll('.mja-bulle-demo');
    function allume(i){ bs[i].classList.add('allume'); setTimeout(function(){ bs[i].classList.remove('allume'); }, 380); }
    var ordre = [2, 0, 1];
    var et = [[10, function(){ d.vers(260, 150, 0); }]];
    ordre.forEach(function(i){ et.push([550, function(){ allume(i); }]); });
    ordre.forEach(function(i){ et.push([500, function(){ d.vers(pos[i][0], pos[i][1] + 6, 380); }]); et.push([420, function(){ d.tape(); allume(i); }]); });
    return scenario(et, 900);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies); hud.prog(0, p.manches, '🫧');
    var terrain = U.html('<div class="mja-terrain mja-bulles"></div>');
    el.appendChild(terrain);
    var N = p.bulles, positions = placesBulles(N);
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' +
      '<g transform="translate(180,385) scale(1.3)">' + chaudronSVG() + '</g>' +
      '<g class="mja-vapeur"><path d="M150,330 C130,300 170,280 150,250" /><path d="M210,330 C230,300 190,280 210,250"/></g>' +
      positions.map(function(q, i){ var b = BULLES_DEF[i]; return '<g class="mja-bulle" data-i="' + i + '"><g class="mja-bulle-in"><circle class="mja-halo" r="44" fill="' + b.c + '"/><circle r="34" fill="' + b.c + '" stroke="' + CONTOUR + '" stroke-width="4"/><ellipse cx="-11" cy="-13" rx="9" ry="6" fill="#fff" opacity=".55"/><g fill="#fff" stroke="' + CONTOUR + '" stroke-width="1.5" transform="scale(1.35)">' + b.s + '</g></g></g>'; }).join('') +
    '</svg>' +
    '<div class="mja-actions"><span class="mja-etat"></span>' + (p.revoir ? '<button class="btn second mja-revoir" type="button">👁 Revoir (' + p.revoir + ')</button>' : '') + '</div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    svg.querySelector('.mja-liquide').style.fill = '#b48cff';
    var bulles = Array.prototype.slice.call(svg.querySelectorAll('.mja-bulle'));
    var place = bulles.map(function(b, i){ return i; });   /* place[i] = index de position de la bulle i */
    function poser(anime){
      bulles.forEach(function(b, i){
        var q = positions[place[i]];
        b.style.transition = anime ? 'transform .55s cubic-bezier(.5,-0.3,.4,1.3)' : 'none';
        b.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px)';
      });
    }
    poser(false);
    var etat = terrain.querySelector('.mja-etat'), br = terrain.querySelector('.mja-revoir');
    var suite = [];
    for(var k = 0; k < p.longueur + p.manches - 1; k++){
      var v; do { v = U.randInt(0, N - 1); } while(k > 0 && v === suite[k - 1] && Math.random() < 0.75);
      suite.push(v);
    }
    var manche = 0, pos = 0, phase = 'attente', fini = false, revoirs = p.revoir, envers = false, flotteT = 0;
    function longueur(){ return p.longueur + manche; }
    function attendu(){ var L = longueur(); return suite[envers ? L - 1 - pos : pos]; }
    function allumer(i, ms){
      var b = bulles[i]; b.classList.add('allume');
      note(BULLES_DEF[i].f, 0.35);
      P.apres(ms || 360, function(){ b.classList.remove('allume'); });
    }
    function montrer(){
      phase = 'montre'; pos = 0;
      envers = p.envers && manche === p.manches - 1;
      terrain.classList.add('montre');
      terrain.classList.toggle('envers', envers);
      etat.textContent = '👀';
      indice();
      var L = longueur();
      for(var i = 0; i < L; i++){
        (function(i){ P.apres(600 + i * p.intervalle * 1000, function(){ allumer(suite[i], Math.min(420, p.intervalle * 750)); }); })(i);
      }
      var fin0 = 600 + L * p.intervalle * 1000 + 200;
      var bouge = Math.random() < p.melange;
      if(bouge){
        P.apres(fin0, function(){ melanger(); annonce(terrain, '🔀 Elles bougent !', 900); });
        fin0 += 800;
      }
      P.apres(fin0, function(){ phase = 'joue'; terrain.classList.remove('montre'); etat.textContent = envers ? '⏪' : '👆'; annonce(terrain, envers ? '⏪ À l\'envers !' : '👆 À toi !', 900); indice(); });
    }
    function melanger(){
      var nv;
      do { nv = U.melanger(place); } while(N > 2 && nv.some(function(v, i){ return v === place[i]; }) && Math.random() < 0.85);
      place = nv; poser(true); U.son('bulle');
    }
    function indice(){
      bulles.forEach(function(b){ b.classList.remove('indice'); });
      if(p.revele && phase === 'joue' && pos < longueur()){ var i = attendu(); if(bulles[i]) bulles[i].classList.add('indice'); }
    }
    if(br) P.ecoute(br, 'click', function(){ if(phase !== 'joue' || revoirs <= 0) return; revoirs--; br.textContent = '👁 Revoir (' + revoirs + ')'; if(!revoirs) br.disabled = true; montrer(); });
    terrain.mjaEtat = function(){ return {phase:phase, attendu:phase === 'joue' ? attendu() : -1}; };
    P.ecoute(svg, 'pointerdown', function(e){
      if(phase !== 'joue' || fini) return;
      var g = e.target.closest ? e.target.closest('.mja-bulle') : null;
      if(!g) return;
      e.preventDefault();
      var i = +g.getAttribute('data-i');
      allumer(i, 260);
      if(i === attendu()){
        pos++;
        indice();
        if(pos >= longueur()){
          phase = 'attente';
          manche++;
          hud.prog(manche, p.manches, '🫧');
          bullesDansChaudron(svg.querySelector('.mja-bulles-ch'), 8, '#e6d6ff');
          if(manche >= p.manches){ fini = true; U.son('ok'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'Quelle mémoire !'}, 900); }
          else { U.son('ok'); annonce(terrain, '✨ Une bulle de plus !', 1000); P.apres(1300, montrer); }
        }
      } else {
        vies--; hud.perdVie(vies, maxVies);
        erreurSensorielle(terrain);
        g.classList.add('faux'); P.apres(500, function(){ g.classList.remove('faux'); });
        if(vies <= 0){ fini = true; phase = 'fini'; P.finir({reussi:false, score:manche / p.manches, erreurs:maxVies, detail:'Les bulles ont éclaté…'}, 900); }
        else { phase = 'attente'; annonce(terrain, '👀 Regarde encore…', 900); P.apres(1200, montrer); }
      }
    });
    if(p.flotte) P.boucle(function(dt){
      if(fini) return false;
      if(phase !== 'joue') return;
      flotteT += dt;
      bulles.forEach(function(b, i){
        var q = positions[place[i]], dx = Math.sin(flotteT * 0.9 + i * 1.7) * 16, dy = Math.cos(flotteT * 1.1 + i * 2.3) * 12;
        b.style.transition = 'none';
        b.style.transform = 'translate(' + (q.x + dx).toFixed(1) + 'px,' + (q.y + dy).toFixed(1) + 'px)';
      });
    });
    P.apres(400, montrer);
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   MÉLANGE (Alchimiste) — obtenir la couleur de la fiole modèle
   en versant des gouttes de rouge, jaune, bleu (puis lait de lune
   pour éclaircir et charbon pour assombrir). Les proportions
   comptent : 3 rouges + 1 jaune ≠ 2 rouges + 1 jaune. Le chaudron
   déborde si on verse trop ; « Vider » recommence ; « Goûter »
   vérifie (un essai de moins si c'est faux). Sablier.
   Mods compris : erreurs (+essais), zone (tolérance de couleur plus
   large), temps (+N s) et lent (sablier plus long), aide (N manches : la première couleur de la
   recette brille), revele (la recette s'affiche sous la fiole).
   params.recettes (facultatif) : [{rouge:1, jaune:1}, …] imposées.
   ========================================================== */
var ORDRE_PIG = ['rouge', 'jaune', 'bleu', 'blanc', 'noir'];
function recetteAuHasard(n){
  var nbCouleurs = n <= 2 ? 2 : (n <= 4 ? U.randInt(2, 3) : 3);
  var gouttes = Math.max(nbCouleurs, entier(n, {1:2, 3:4, 6:6, 9:8, 12:9}));
  var choix = U.melanger(['rouge', 'jaune', 'bleu']).slice(0, nbCouleurs);
  var r = {};
  choix.forEach(function(c){ r[c] = 1; });
  var reste = gouttes - nbCouleurs;
  if(n >= 5 && Math.random() < 0.6 && reste > 0){ r.blanc = 1; reste--; }
  if(n >= 8 && Math.random() < 0.5 && reste > 0){ r.noir = 1; reste--; }
  while(reste > 0){ var c = U.choix(choix); r[c]++; reste--; }
  /* pas de proportions « 1:1:1 » simplifiables à 1 goutte : la couleur doit demander de la précision */
  return r;
}
function gouttesTotal(r){ var s = 0; for(var k in r) s += r[k]; return s; }
function recetteTexte(r){ return ORDRE_PIG.filter(function(c){ return r[c]; }).map(function(c){ return r[c] + '×' + PIGMENTS[c].n.toLowerCase(); }).join(' + '); }
function conseilMelange(recette, comptes, n){
  var tr = gouttesTotal(recette), tc = gouttesTotal(comptes) || 1, pire = null, ecart = 0;
  ORDRE_PIG.forEach(function(c){ var d = (recette[c] || 0) / tr - (comptes[c] || 0) / tc; if(d > ecart){ ecart = d; pire = c; } });
  if(n <= 3 && pire) return 'Il manque du ' + PIGMENTS[pire].n.toLowerCase() + ' !';
  if(n <= 6){ var a = couleurMelange(recette), b = couleurMelange(comptes), la = (a[0] + a[1] + a[2]) / 3, lb = (b[0] + b[1] + b[2]) / 3; if(Math.abs(la - lb) > 0.08) return la > lb ? 'Trop sombre !' : 'Trop clair !'; return 'Pas la bonne teinte…'; }
  return 'Pas encore…';
}
function fioleSVG(couleur, cls){
  return '<g class="' + (cls || '') + '"><path d="M-10,-44 L10,-44 L10,-22 C30,-14 34,6 30,18 C24,36 -24,36 -30,18 C-34,6 -30,-14 -10,-22 Z" fill="#dfe6ff" fill-opacity=".25" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<path class="mja-fiole-liq" d="M-26,4 C-12,0 12,8 26,4 C28,14 26,22 22,26 C12,34 -12,34 -22,26 C-26,22 -28,14 -26,4 Z" fill="' + couleur + '"/>' +
    '<rect x="-13" y="-52" width="26" height="10" rx="3" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M-18,-8 C-22,0 -22,8 -18,14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/></g>';
}
MJ.enregistrer('melange', {
  nom:'Le bon mélange', role:'alchimiste', ic:'🎨',
  consigne:'Verse des gouttes de couleur dans le chaudron pour obtenir la même couleur que la fiole, puis goûte !',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    p.manches = entier(n, {1:1, 2:2, 8:2, 9:3});
    p.tolerance = courbe(n, {1:0.085, 3:0.055, 6:0.036, 9:0.026, 12:0.02}) * (mods.zone || 1);
    p.erreurs = erreursPermises(n, mods, {1:3, 3:2, 6:1, 9:1});
    p.blanc = n >= 5;
    p.noir = n >= 8;
    p.marge = entier(n, {1:5, 3:4, 6:3, 9:2});
    p.duree = Math.round(courbe(n, {1:100, 3:75, 6:60, 9:48}) / (mods.lent || 1) + (mods.temps || 0));
    p.jauge = n <= 4 || !!mods.revele;
    p.compteur = n <= 5 || !!mods.revele;
    p.revele = !!mods.revele;
    p.aide = mods.aide || 0;
    p.niveauRecette = n;
    p.lignes = [
      {nom:'Couleurs à préparer', val:String(p.manches)},
      {nom:'Gouttes dans une recette', val:String(Math.max(2, entier(n, {1:2, 3:4, 6:6, 9:8, 12:9})))},
      {nom:'Ingrédients', val:'rouge, jaune, bleu' + (p.blanc ? ', lait de lune' : '') + (p.noir ? ', charbon' : '')},
      {nom:'Précision demandée', val:Math.round(100 - p.tolerance * 100) + ' %'},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Essais ratés permis', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/>');
    d.contenu.innerHTML = '<g transform="translate(42,92) scale(.8)">' + fioleSVG('#2fa84a') + '</g>' +
      '<g transform="translate(150,120) scale(.5)">' + chaudronSVG() + '</g>' +
      '<g transform="translate(240,50)"><circle r="16" fill="#3f7fe0" stroke="' + CONTOUR + '" stroke-width="3"/></g><g transform="translate(240,100)"><circle r="16" fill="#f6d23a" stroke="' + CONTOUR + '" stroke-width="3"/></g>' +
      '<circle class="mja-goutte-demo" r="6" cx="150" cy="40" fill="#3f7fe0" opacity="0"/>';
    var liq = d.contenu.querySelector('.mja-liquide'), gt = d.contenu.querySelector('.mja-goutte-demo');
    function goutte(c){ gt.setAttribute('fill', c); gt.style.transition = 'none'; gt.style.opacity = '1'; gt.style.transform = 'translate(0,0)'; void gt.getBoundingClientRect(); gt.style.transition = 'transform .4s ease-in, opacity .1s .38s'; gt.style.transform = 'translate(0,70px)'; gt.style.opacity = '0'; }
    return scenario([
      [10, function(){ liq.style.fill = '#8a9ac6'; d.vers(270, 150, 0); }],
      [300, function(){ d.vers(240, 56); }],
      [600, function(){ d.tape(); goutte('#3f7fe0'); }],
      [450, function(){ liq.style.fill = '#3f7fe0'; U.son('plouf'); d.vers(240, 106); }],
      [600, function(){ d.tape(); goutte('#f6d23a'); }],
      [450, function(){ liq.style.fill = '#2fa84a'; U.son('plouf'); }],
      [600, function(){ U.son('ok'); }]
    ], 800);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies); hud.prog(0, p.manches, '🎨');
    var terrain = U.html('<div class="mja-terrain mja-melange"></div>');
    el.appendChild(terrain);
    var pigs = ORDRE_PIG.filter(function(c){ return c === 'blanc' ? p.blanc : (c === 'noir' ? p.noir : true); });
    terrain.innerHTML = '<svg viewBox="0 0 360 400" preserveAspectRatio="xMidYMid meet">' +
      '<g class="mja-etagere-m"><rect x="10" y="226" width="120" height="12" rx="4" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/></g>' +
      '<g class="mja-modele" transform="translate(70,170) scale(1.35)"></g>' +
      '<text class="mja-recette" x="70" y="262" text-anchor="middle"></text>' +
      '<g transform="translate(236,300) scale(1.05)">' + chaudronSVG({feu:true}) + '</g>' +
      '<g class="mja-points" transform="translate(236,372)"></g>' +
      '<g class="mja-gouttes"></g>' +
      '<g class="mja-jauge" transform="translate(236,52)"><rect x="-80" y="-11" width="160" height="22" rx="11" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="3"/><rect class="mja-jauge-v" x="-77" y="-8" width="10" height="16" rx="8"/><text x="0" y="-18" text-anchor="middle" class="mja-jauge-t">ressemblance</text></g>' +
    '</svg>' +
    '<div class="mja-pigments">' + pigs.map(function(c){ return '<button class="mja-pig" type="button" data-c="' + c + '" style="--pc:' + PIGMENTS[c].c + '" aria-label="' + PIGMENTS[c].n + '"><span></span></button>'; }).join('') + '</div>' +
    '<div class="mja-actions"><button class="btn second mja-vider" type="button">♻️ Vider</button><button class="btn grand mja-gouter" type="button">👅 Goûter</button></div>';
    var svg = terrain.querySelector('svg');
    var liq = svg.querySelector('.mja-liquide'), gG = svg.querySelector('.mja-gouttes'), jauge = svg.querySelector('.mja-jauge'), jaugeV = svg.querySelector('.mja-jauge-v'), gPts = svg.querySelector('.mja-points');
    var modele = svg.querySelector('.mja-modele'), txtRec = svg.querySelector('.mja-recette');
    if(!p.jauge) jauge.style.display = 'none';
    var manche = 0, comptes = {}, recette = null, cible = null, fini = false, restant = p.duree, enChute = 0;
    var maxGouttes = 0;
    function nouvelleManche(){
      recette = (p.recettes && p.recettes[manche]) ? p.recettes[manche] : recetteAuHasard(p.niveauRecette + manche);
      if(!p.blanc) delete recette.blanc;
      if(!p.noir) delete recette.noir;
      cible = couleurMelange(recette);
      maxGouttes = gouttesTotal(recette) + p.marge;
      modele.innerHTML = fioleSVG(rgbCss(cible), 'mja-fiole-modele');
      txtRec.textContent = p.revele ? recetteTexte(recette) : '';
      vider(true);
    }
    function majAide(){
      terrain.querySelectorAll('.mja-pig').forEach(function(b){ b.classList.remove('indice'); });
      if(manche < p.aide && gouttesTotal(comptes) === 0){
        var premiere = ORDRE_PIG.filter(function(c){ return recette[c]; })[0];
        var b = terrain.querySelector('.mja-pig[data-c="' + premiere + '"]');
        if(b) b.classList.add('indice');
      }
    }
    function majCouleur(){
      var tot = gouttesTotal(comptes);
      var rgb = tot ? couleurMelange(comptes) : [0.55, 0.62, 0.78];
      liq.style.fill = rgbCss(rgb);
      var e = tot ? ecartCouleur(rgb, cible) : 0.5;
      var ress = fixe(1 - e / 0.45, 0, 1);
      jaugeV.setAttribute('width', (10 + ress * 144).toFixed(1));
      jaugeV.classList.toggle('chaud', e < p.tolerance);
      terrain.querySelectorAll('.mja-pig').forEach(function(b){ b.disabled = tot + enChute >= maxGouttes; });
      /* petits points : les gouttes versées */
      if(p.compteur){
        var s = '', i = 0, liste = [];
        ORDRE_PIG.forEach(function(c){ for(var k = 0; k < (comptes[c] || 0); k++) liste.push(c); });
        var w = Math.min(14, 150 / Math.max(1, maxGouttes));
        for(i = 0; i < maxGouttes; i++) s += '<circle cx="' + ((i - (maxGouttes - 1) / 2) * w).toFixed(1) + '" r="' + (w * 0.36).toFixed(1) + '" fill="' + (liste[i] ? PIGMENTS[liste[i]].c : '#2b2f55') + '" stroke="' + CONTOUR + '" stroke-width="1.5"/>';
        gPts.innerHTML = s;
      }
    }
    function vider(silence){
      comptes = {};
      majCouleur();
      if(!silence){ U.son('plouf'); liq.classList.remove('vide'); void liq.getBoundingClientRect(); liq.classList.add('vide'); }
      majAide();
    }
    terrain.querySelectorAll('.mja-pig').forEach(function(b){
      P.ecoute(b, 'click', function(){
        if(fini) return;
        var c = b.getAttribute('data-c');
        if(gouttesTotal(comptes) + enChute >= maxGouttes) return;
        enChute++;
        var g = svgNoeud('circle', {r:7, cx:236, cy:150, fill:PIGMENTS[c].c, stroke:CONTOUR, 'stroke-width':2, 'class':'mja-goutte'}, gG);
        P.apres(380, function(){
          if(g.parentNode) g.parentNode.removeChild(g);
          enChute--;
          comptes[c] = (comptes[c] || 0) + 1;
          U.son('plouf');
          bullesDansChaudron(svg.querySelector('.mja-bulles-ch'), 3, PIGMENTS[c].c);
          var tb = svg.querySelector('.mja-tourbillon'); tb.classList.remove('remue'); void tb.getBoundingClientRect(); tb.classList.add('remue');
          majCouleur(); majAide();
          if(gouttesTotal(comptes) >= maxGouttes){ var q = pctDans(svg, terrain, 236, 250); flotter(terrain, q.x, q.y, 'C\'est plein !', 'ko'); }
        });
      });
    });
    P.ecoute(terrain.querySelector('.mja-vider'), 'click', function(){ if(!fini) vider(false); });
    P.ecoute(terrain.querySelector('.mja-gouter'), 'click', function(){
      if(fini || !gouttesTotal(comptes) || enChute) return;
      var e = ecartCouleur(couleurMelange(comptes), cible);
      var q = pctDans(svg, terrain, 236, 240);
      if(e < p.tolerance){
        manche++;
        hud.prog(manche, p.manches, '🎨');
        U.son('ok');
        liq.classList.add('brille');
        flotter(terrain, q.x, q.y, 'Parfait !', 'ok');
        if(manche >= p.manches){ fini = true; P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'C\'est exactement la bonne couleur !'}, 900); }
        else P.apres(1000, function(){ liq.classList.remove('brille'); annonce(terrain, '✨ Une autre couleur !', 900); nouvelleManche(); });
      } else {
        vies--; hud.perdVie(vies, maxVies);
        erreurSensorielle(terrain);
        flotter(terrain, q.x, q.y, conseilMelange(recette, comptes, p.niveauRecette), 'ko');
        if(vies <= 0){ fini = true; P.finir({reussi:false, score:manche / p.manches, erreurs:maxVies, detail:'La potion a une drôle de couleur…'}, 900); }
      }
    });
    terrain.mjaEtat = function(){ return {recette:recette, comptes:comptes}; };
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; P.finir({reussi:false, score:manche / p.manches, detail:'Le sablier est vide…'}, 600); return false; }
    });
    nouvelleManche();
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   TEMPÉRATURE (Alchimiste) — garder la potion à la bonne chaleur :
   garder le doigt sur « Chauffer » fait monter l'aiguille, lâcher la
   fait redescendre, avec de l'inertie (ça continue un peu sur sa
   lancée). La zone verte BOUGE (la recette dérive), des courants
   d'air 💨 refroidissent et les braises 🔥 s'emballent (annoncés
   juste avant). Il faut cumuler N secondes dans la zone ; plus loin,
   le compteur redescend quand on en sort. Trop chaud : ça déborde.
   Aux niveaux 7+, la zone n'est plus dessinée : il faut lire les
   bulles (rares = froid, régulières = bon, bouillons = trop chaud).
   Mods compris : erreurs (+vies), zone (zone plus large), lent
   (aiguille plus lente), temps (+N s au sablier), revele (la zone
   reste affichée et l'aiguille clignote quand il faut lâcher),
   aide (idem, et le compteur ne redescend plus hors de la zone).
   ========================================================== */
MJ.enregistrer('temperature', {
  nom:'Dosage et température', role:'alchimiste', ic:'🌡️',
  consigne:'Garde ton doigt sur le bouton 🔥 pour chauffer et lâche-le pour refroidir : reste dans la zone verte, même quand elle bouge !',
  minuteur:true,
  reglages: function(n, mods){
    var p = {};
    p.largeur = fixe(courbe(n, {1:0.3, 3:0.21, 6:0.15, 9:0.11, 12:0.09}) * (mods.zone || 1), 0.06, 0.6);
    p.requis = entier(n, {1:5, 3:8, 6:11, 9:14, 12:16});
    p.duree = Math.round(p.requis * courbe(n, {1:2.4, 3:2.0, 6:1.7, 9:1.45}) + (mods.temps || 0));
    p.vitesse = courbe(n, {1:0.3, 3:0.36, 6:0.42, 9:0.5}) * (mods.lent || 1);
    p.inertie = courbe(n, {1:0.15, 3:0.32, 6:0.5, 9:0.7});
    p.derive = courbe(n, {1:0, 2:0, 3:0.08, 6:0.16, 9:0.22});
    p.deriveW = courbe(n, {1:0.3, 3:0.35, 9:0.62});
    p.coups = courbe(n, {1:0, 2:0.07, 6:0.2, 9:0.3});
    p.perte = courbe(n, {1:0, 4:0, 5:0.3, 9:0.7});
    p.zoneVisible = n <= 6 || !!mods.revele || !!mods.aide;
    p.aide = !!(mods.aide || mods.revele);
    if(mods.aide) p.perte = 0;
    p.erreurs = erreursPermises(n, mods);
    p.lignes = [
      {nom:'Temps à tenir dans la zone', val:p.requis + ' s'},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Largeur de la zone', val:pct(p.largeur)},
      {nom:'La zone bouge', val:p.derive > 0.12 ? 'beaucoup' : (p.derive > 0 ? 'un peu' : 'non')},
      {nom:'Courants d\'air et braises', val:p.coups > 0.15 ? 'souvent' : (p.coups > 0 ? 'parfois' : 'non')},
      {nom:'Zone affichée', val:p.zoneVisible ? 'oui' : 'non : regarde les bulles'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    if(p.perte > 0) p.lignes.splice(1, 0, {nom:'Hors de la zone', val:'le compteur redescend'});
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/><rect x="246" y="20" width="22" height="120" rx="11" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="249" y="50" width="16" height="34" fill="#4fbf6a" opacity=".8"/>');
    d.contenu.innerHTML = '<g transform="translate(130,110) scale(.55)">' + chaudronSVG({feu:true}) + '</g><rect class="mja-niv-demo" x="251" y="120" width="12" height="16" rx="6" fill="#e8693c"/><rect x="60" y="140" width="110" height="24" rx="12" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="3"/><text x="115" y="157" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">Chauffer</text>';
    var niv = d.contenu.querySelector('.mja-niv-demo'), feu = d.contenu.querySelector('.mja-feu');
    function hauteur(h, ms){ niv.style.transition = 'transform ' + (ms || 0) + 'ms ease-in-out'; niv.style.transform = 'translate(0,' + (-h) + 'px)'; niv.style.transformBox = 'fill-box'; }
    return scenario([
      [10, function(){ hauteur(0); d.vers(260, 160, 0); feu.classList.remove('fort'); }],
      [200, function(){ d.vers(115, 150); }],
      [600, function(){ d.appuie(true); feu.classList.add('fort'); hauteur(62, 1300); }],
      [1300, function(){ d.appuie(false); feu.classList.remove('fort'); hauteur(52, 600); U.son('ok'); }],
      [900, function(){ }]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies);
    var terrain = U.html('<div class="mja-terrain mja-temperature"></div>');
    el.appendChild(terrain);
    var H0 = 70, H1 = 400;
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' +
      '<g class="mja-souffle" opacity="0"><path d="M-40,250 C0,236 40,264 90,248 M-50,290 C-10,276 30,304 80,288 M-30,330 C10,316 50,344 100,328" stroke="#dfe6ff" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      '<g transform="translate(150,360) scale(1.45)">' + chaudronSVG({feu:true}) + '</g>' +
      '<g class="mja-vapeur"><path d="M120,250 C100,220 140,200 120,170"/><path d="M180,250 C200,220 160,200 180,170"/></g>' +
      '<g class="mja-thermo"><rect x="300" y="' + (H0 - 12) + '" width="40" height="' + (H1 - H0 + 24) + '" rx="20" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="5"/>' +
      '<rect class="mja-zone-v" x="306" y="100" width="28" height="40" rx="6"/>' +
      '<rect class="mja-rouge" x="306" y="' + H0 + '" width="28" height="' + ((H1 - H0) * 0.06).toFixed(0) + '" rx="6"/>' +
      '<rect class="mja-colonne" x="312" y="200" width="16" height="200" rx="8"/>' +
      '<circle cx="320" cy="' + (H1 + 26) + '" r="20" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="5"/>' +
      '<path class="mja-aiguille" d="M292,0 L276,-9 L276,9 Z"/></g>' +
      '<g class="mja-cercle" transform="translate(150,90)"><circle r="34" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="5"/><circle class="mja-cercle-v" r="26" fill="none" stroke="#4fbf6a" stroke-width="9" stroke-dasharray="0 999" transform="rotate(-90)"/><text class="mja-cercle-t" y="8" text-anchor="middle">0</text></g>' +
    '</svg>' +
    '<div class="mja-actions"><button class="btn grand danger mja-chauffer" type="button">🔥 Chauffer</button></div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var col = svg.querySelector('.mja-colonne'), aig = svg.querySelector('.mja-aiguille'), zoneV = svg.querySelector('.mja-zone-v'), cercle = svg.querySelector('.mja-cercle-v'), cercleT = svg.querySelector('.mja-cercle-t');
    var feu = svg.querySelector('.mja-feu'), liq = svg.querySelector('.mja-liquide'), gB = svg.querySelector('.mja-bulles-ch'), btn = terrain.querySelector('.mja-chauffer'), souffle = svg.querySelector('.mja-souffle');
    liq.style.fill = '#6fd3a8';
    if(!p.zoneVisible) zoneV.style.opacity = '0';
    var z0 = U.rand(0.4, 0.72 - p.largeur / 2), z = z0, v = 0.12, vit = 0, chauffe = false, dedansT = 0, restant = p.duree, fini = false, bulleT = 0, t = 0, ph = U.rand(0, 6);
    var evt = null, prochainEvt = p.coups ? U.rand(2, 1 / p.coups + 2) : 1e9;
    function yDe(f){ return H1 - f * (H1 - H0); }
    function placeZone(){ zoneV.setAttribute('y', yDe(z + p.largeur).toFixed(1)); zoneV.setAttribute('height', (p.largeur * (H1 - H0)).toFixed(1)); }
    placeZone();
    function presser(e){ if(e) e.preventDefault(); if(fini) return; chauffe = true; btn.classList.add('presse'); feu.classList.add('fort'); }
    function relacher(){ chauffe = false; btn.classList.remove('presse'); feu.classList.remove('fort'); }
    P.ecoute(btn, 'pointerdown', presser);
    P.ecoute(window, 'pointerup', relacher); P.ecoute(window, 'pointercancel', relacher);
    P.ecoute(btn, 'pointerleave', relacher);
    P.ecoute(document, 'keydown', function(e){ if(e.key === ' ' && !e.repeat){ presser(e); } });
    P.ecoute(document, 'keyup', function(e){ if(e.key === ' '){ relacher(); } });
    P.ecoute(btn, 'contextmenu', function(e){ e.preventDefault(); });
    terrain.mjaEtat = function(){ return {v:v, vit:vit, z:z, l:p.largeur, chauffe:chauffe}; };
    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      restant -= dt;
      hud.temps(restant / p.duree);
      /* la zone dérive */
      if(p.derive){ z = fixe(z0 + Math.sin(t * p.deriveW + ph) * p.derive + Math.sin(t * p.deriveW * 2.3 + ph * 2) * p.derive * 0.35, 0.1, 0.9 - p.largeur); placeZone(); }
      /* courants d'air et braises : annoncés 0,8 s avant, puis poussent 1,3 s */
      prochainEvt -= dt;
      if(!evt && prochainEvt <= 0){
        evt = {type:Math.random() < 0.5 ? 'air' : 'braise', t:0};
        var q = pctDans(svg, terrain, 150, 200);
        flotter(terrain, q.x, q.y, evt.type === 'air' ? '💨 Courant d\'air !' : '🔥 Les braises !', '');
      }
      var force = 0;
      if(evt){
        evt.t += dt;
        if(evt.t > 0.8){ force = (evt.type === 'air' ? -1 : 1) * p.vitesse * 1.1; }
        souffle.setAttribute('opacity', evt.type === 'air' && evt.t > 0.5 ? '0.5' : '0');
        souffle.setAttribute('transform', 'translate(' + ((evt.t * 160) % 120).toFixed(0) + ',0)');
        feu.classList.toggle('emballe', evt.type === 'braise' && evt.t > 0.5);
        if(evt.t > 2.1){ evt = null; souffle.setAttribute('opacity', '0'); feu.classList.remove('emballe'); prochainEvt = U.rand(0.6, 1.4) / p.coups; }
      }
      /* dynamique : la vitesse cible dépend du feu, avec de l'inertie */
      var cibleV = (chauffe ? p.vitesse : -p.vitesse * 0.8) + force;
      vit += (cibleV - vit) * Math.min(1, dt / p.inertie);
      v = fixe(v + vit * dt, 0, 1);
      var dedans = v >= z && v <= z + p.largeur;
      if(dedans) dedansT += dt; else dedansT = Math.max(0, dedansT - dt * p.perte);
      var frac = Math.min(1, dedansT / p.requis);
      cercle.setAttribute('stroke-dasharray', (frac * 163.4).toFixed(1) + ' 999');
      cercleT.textContent = Math.ceil(Math.max(0, p.requis - dedansT));
      /* dessin */
      var y = yDe(v);
      col.setAttribute('y', y.toFixed(1)); col.setAttribute('height', (H1 + 10 - y).toFixed(1));
      aig.setAttribute('transform', 'translate(0,' + y.toFixed(1) + ')');
      var etat = v > z + p.largeur ? 'chaud' : (dedans ? 'bon' : 'froid');
      terrain.setAttribute('data-etat', etat);
      aig.classList.toggle('lache', p.aide && dedans && chauffe && v > z + p.largeur * 0.6);
      /* bulles : peu si froid, régulières si bon, beaucoup si trop chaud */
      bulleT -= dt;
      if(bulleT <= 0){
        var nb = etat === 'chaud' ? 5 : (etat === 'bon' ? 2 : (v > z - 0.12 ? 1 : 0));
        if(nb) bullesDansChaudron(gB, nb, etat === 'chaud' ? '#ffb38a' : '#d6fff0');
        if(etat === 'bon' && Math.random() < 0.3) U.son('bulle');
        bulleT = etat === 'chaud' ? 0.18 : 0.45;
      }
      liq.style.fill = etat === 'chaud' ? '#ff8a6a' : (etat === 'bon' ? '#6fd3a8' : '#7aa7c9');
      if(v >= 0.97){
        vies--; hud.perdVie(vies, maxVies);
        erreurSensorielle(terrain);
        var q2 = pctDans(svg, terrain, 150, 260); flotter(terrain, q2.x, q2.y, 'Ça déborde !', 'ko');
        liq.classList.remove('eclabousse'); void liq.getBoundingClientRect(); liq.classList.add('eclabousse');
        v = z * 0.6; vit = 0;
        if(vies <= 0){ fini = true; relacher(); P.finir({reussi:false, score:frac, erreurs:maxVies, detail:'La potion a débordé…'}, 900); return false; }
      }
      if(dedansT >= p.requis){ fini = true; relacher(); U.son('ok'); liq.classList.add('brille'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'La cuisson est parfaite !'}, 900); return false; }
      if(restant <= 0){ fini = true; relacher(); P.finir({reussi:false, score:frac, detail:'Le sablier est vide…'}, 600); return false; }
    });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   LOUPE (Alchimiste) — deux images de l'étagère : trouver les N
   différences avant la fin du sablier. Toucher une différence sur
   l'une ou l'autre image l'entoure sur les deux. Plus loin : trois
   étagères, différences subtiles (teinte proche, petit détail,
   objet décalé, tourné, un peu plus grand…) et, dès le niveau 5,
   il fait sombre : seule la LOUPE (sous ton doigt) éclaire les deux
   images au même endroit. Glisse pour regarder, touche pour marquer.
   Mods compris : erreurs (+N touches ratées permises), temps (+N s), lent (sablier plus long),
   aide (N fois le bouton 💡 qui montre une différence : lunettes
   d'alchimiste), revele (les différences scintillent, pas de nuit),
   zone (zones de touche et loupe plus grandes).
   ========================================================== */
var COUL_ALT = {
  '#e5484d':['#3f7fe0', '#e8803c'], '#3f7fe0':['#4fbf6a', '#5a5fd8'], '#4fbf6a':['#f6d23a', '#3fa88a'], '#f6d23a':['#e5484d', '#f0b93a'],
  '#9d6ee3':['#e5484d', '#c06ee3'], '#f08a3c':['#9d6ee3', '#e8603c'], '#c08a4a':['#6e8acb', '#a8743f'], '#8ff3ff':['#ffd36a', '#a8e8ff']
};
var COULS = Object.keys(COUL_ALT);
var OBJ_LOUPE = {
  fiole: {asym:false, art:function(o){ return '<path d="M-6,-46 L6,-46 L6,-30 C18,-24 20,-10 18,-4 C14,4 -14,4 -18,-4 C-20,-10 -18,-24 -6,-30 Z" fill="#dfe6ff" fill-opacity=".3" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-16,-12 C-6,-15 6,-9 16,-12 C17,-6 15,-1 12,1 C4,4 -4,4 -12,1 C-15,-1 -17,-6 -16,-12 Z" fill="' + o.c + '"/>' + (o.d ? '<rect x="-7" y="-52" width="14" height="8" rx="2" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="2"/>' : '') + '<path d="M-11,-20 C-13,-14 -13,-9 -11,-5" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/>'; }},
  livre: {asym:false, art:function(o){ return '<rect x="-10" y="-50" width="20" height="50" rx="2" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-6,-46 L-6,-4" stroke="#fff" stroke-width="2" opacity=".35"/>' + (o.d ? '<rect x="-10" y="-36" width="20" height="6" fill="#f5b945" stroke="' + CONTOUR + '" stroke-width="1.5"/>' : '') + '<rect x="-10" y="-14" width="20" height="4" fill="' + CONTOUR + '" opacity=".35"/>'; }},
  bougie: {asym:false, art:function(o){ return '<ellipse cx="0" cy="-2" rx="16" ry="5" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="-7" y="-34" width="14" height="32" rx="3" fill="#fff4dc" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M0,-34 L0,-39" stroke="' + CONTOUR + '" stroke-width="2"/>' + (o.d ? '<path d="M0,-52 C5,-46 5,-41 0,-38 C-5,-41 -5,-46 0,-52 Z" fill="#ffb03a" stroke="' + CONTOUR + '" stroke-width="1.5"/>' : ''); }},
  champignon: {asym:false, art:function(o){ return '<path d="M-6,0 L-5,-18 L5,-18 L6,0 Z" fill="#fff4dc" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-22,-16 C-22,-40 22,-40 22,-16 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-10" cy="-26" r="3.5" fill="#fff"/><circle cx="8" cy="-30" r="3" fill="#fff"/>' + (o.d ? '<circle cx="12" cy="-20" r="3" fill="#fff"/>' : ''); }},
  cle: {asym:true, art:function(o){ return '<circle cx="-14" cy="-14" r="10" fill="none" stroke="' + o.c + '" stroke-width="6"/><circle cx="-14" cy="-14" r="10" fill="none" stroke="' + CONTOUR + '" stroke-width="1.5"/><path d="M-4,-14 L22,-14" stroke="' + o.c + '" stroke-width="6" stroke-linecap="round"/><path d="M16,-14 L16,-6' + (o.d ? ' M10,-14 L10,-7' : '') + '" stroke="' + o.c + '" stroke-width="5"/>'; }},
  plume: {asym:true, art:function(o){ return '<path d="M-12,0 L-14,-14 L14,-14 L12,0 Z" fill="#2a2440" stroke="' + CONTOUR + '" stroke-width="3"/>' + (o.d ? '<rect x="-8" y="-11" width="16" height="6" fill="#f3e7cb"/>' : '') + '<path d="M2,-14 C4,-34 14,-50 24,-56 C22,-40 16,-24 4,-14 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="2.5"/><path d="M3,-14 L22,-52" stroke="' + CONTOUR + '" stroke-width="1.5"/>'; }},
  sablier: {asym:false, art:function(o){ return '<rect x="-14" y="-50" width="28" height="5" rx="2" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="2.5"/><rect x="-14" y="-5" width="28" height="5" rx="2" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="2.5"/><path d="M-10,-45 C-10,-30 -2,-28 0,-25 C2,-28 10,-30 10,-45 Z M-10,-5 C-10,-20 -2,-22 0,-25 C2,-22 10,-20 10,-5 Z" fill="#dfe6ff" fill-opacity=".4" stroke="' + CONTOUR + '" stroke-width="2.5"/>' + (o.d ? '<path d="M-7,-42 L7,-42 C5,-34 2,-30 0,-28 C-2,-30 -5,-34 -7,-42 Z" fill="' + o.c + '"/>' : '<path d="M-8,-6 C-6,-14 6,-14 8,-6 Z" fill="' + o.c + '"/>'); }},
  pomme: {asym:true, art:function(o){ return '<path d="M0,-30 C-4,-36 -18,-36 -20,-22 C-22,-8 -10,0 0,-4 C10,0 22,-8 20,-22 C18,-36 4,-36 0,-30 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M0,-30 L2,-38" stroke="#5e3a1e" stroke-width="3"/>' + (o.d ? '<path d="M2,-36 C8,-44 16,-40 16,-38 C10,-34 6,-34 2,-36 Z" fill="#4fbf6a" stroke="' + CONTOUR + '" stroke-width="2"/>' : '') + '<path d="M-12,-24 C-12,-28 -9,-30 -6,-30" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/>'; }},
  cristal: {asym:true, art:function(o){ return '<path d="M-6,0 L-10,-30 L-2,-46 L6,-30 L4,0 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M4,0 L10,-22 L18,-14 L14,0 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3" opacity=".9"/>' + (o.d ? '<path d="M-6,0 L-18,-16 L-12,-22 L-8,-4 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/>' : '') + '<path d="M-4,-34 L-2,-12" stroke="#fff" stroke-width="2" opacity=".6"/>'; }},
  pot: {asym:true, art:function(o){ return '<path d="M-14,-20 L14,-20 L10,0 L-10,0 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M0,-20 C-2,-30 -8,-36 -12,-40 M0,-20 C2,-32 8,-38 14,-40" stroke="#3a8a5a" stroke-width="3" fill="none"/><ellipse cx="-12" cy="-40" rx="6" ry="3" fill="#4fbf6a" stroke="' + CONTOUR + '" stroke-width="1.5"/>' + (o.d ? '<circle cx="14" cy="-42" r="5" fill="#ff8fb3" stroke="' + CONTOUR + '" stroke-width="2"/>' : '<ellipse cx="14" cy="-40" rx="6" ry="3" fill="#4fbf6a" stroke="' + CONTOUR + '" stroke-width="1.5"/>'); }}
};
var TYPES_LOUPE = Object.keys(OBJ_LOUPE);
function etagere(id, H){
  var s = '<defs><linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3168"/><stop offset="1" stop-color="#262050"/></linearGradient></defs>' +
    '<rect width="360" height="' + H + '" fill="url(#' + id + 'm)"/>';
  for(var y = 108; y < H; y += 112) s += '<path d="M0,' + (y - 70) + ' L360,' + (y - 70) + '" stroke="#30285a" stroke-width="2"/><rect x="6" y="' + y + '" width="348" height="12" rx="3" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/>';
  return s;
}
function genererScene(n, nDiff){
  var objets = [], rangees = n >= 6 ? 3 : 2;
  var parEtagere = n <= 2 ? 4 : 5;
  for(var r = 0; r < rangees; r++){
    var y = 108 + r * 112, largeur = 330 / parEtagere;
    for(var i = 0; i < parEtagere; i++){
      objets.push({t:U.choix(TYPES_LOUPE), x:22 + largeur * (i + 0.5) + U.rand(-6, 6), y:y, s:U.rand(1.05, 1.3), c:U.choix(COULS), d:Math.random() < 0.6, m:Math.random() < 0.3, r:0});
    }
  }
  var sortes = n <= 2 ? ['absent', 'couleur', 'taille'] : (n <= 5 ? ['absent', 'couleur', 'detail', 'detail', 'miroir', 'decale'] : ['detail', 'detail', 'teinte', 'miroir', 'decale', 'tourne', 'taille']);
  var indices = U.melanger(objets.map(function(o, i){ return i; })).slice(0, nDiff);
  var diffs = indices.map(function(i){
    var o = objets[i];
    var sorte = U.choix(sortes);
    if(sorte === 'miroir' && !OBJ_LOUPE[o.t].asym) sorte = 'detail';
    var b = {t:o.t, x:o.x, y:o.y, s:o.s, c:o.c, d:o.d, m:o.m, r:0};
    if(sorte === 'couleur') b.c = COUL_ALT[o.c][0];
    else if(sorte === 'teinte') b.c = COUL_ALT[o.c][1];
    else if(sorte === 'detail') b.d = !o.d;
    else if(sorte === 'miroir') b.m = !o.m;
    else if(sorte === 'taille') b.s = o.s * (n <= 2 ? 1.35 : 1.16);
    else if(sorte === 'decale') b.x = o.x + (Math.random() < .5 ? -1 : 1) * (n <= 5 ? 14 : 9);
    else if(sorte === 'tourne') b.r = (Math.random() < .5 ? -1 : 1) * 16;
    else if(sorte === 'absent') b.absent = true;
    return {i:i, sorte:sorte, b:b, x:o.x, y:o.y - 26 * o.s, r:30 * o.s};
  });
  return {objets:objets, diffs:diffs, H:rangees * 112 + 16};
}
function dessinerObjets(objets, remplacements){
  return objets.map(function(o, i){
    var r = remplacements && remplacements[i] ? remplacements[i] : o;
    if(r.absent) return '';
    return '<g class="mja-obj o-' + r.t + '" transform="translate(' + r.x.toFixed(1) + ',' + r.y.toFixed(1) + ') rotate(' + (r.r || 0) + ') scale(' + (r.m ? -r.s : r.s).toFixed(2) + ',' + r.s.toFixed(2) + ')">' + OBJ_LOUPE[r.t].art(r) + '</g>';
  }).join('');
}
MJ.enregistrer('loupe', {
  nom:'Différences à la loupe', role:'alchimiste', ic:'🔍',
  consigne:function(p){ return p && p.loupe ? 'Promène ta loupe sur les étagères et touche les différences entre les deux images avant la fin du sablier !' : 'Touche les différences entre les deux étagères avant la fin du sablier !'; },
  minuteur:true,
  reglages: function(n, mods){
    var p = {};
    p.differences = entier(n, {1:3, 3:5, 6:6, 9:7, 12:8});
    p.duree = Math.round(courbe(n, {1:75, 3:58, 6:50, 9:42, 12:36}) / (mods.lent || 1) + (mods.temps || 0));
    p.erreurs = erreursPermises(n, mods, {1:5, 3:3, 6:2, 9:1});
    p.indices = mods.aide || 0;
    p.revele = !!mods.revele;
    p.marge = mods.zone || 1;
    p.loupe = n >= 5 && !mods.revele ? courbe(n, {5:96, 7:82, 9:70, 12:60}) * (mods.zone || 1) : 0;
    p.niveauScene = n;
    p.lignes = [
      {nom:'Différences', val:String(p.differences)},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Touches ratées permises', val:String(p.erreurs)},
      {nom:'Taille des différences', val:n <= 2 ? 'faciles à voir' : (n <= 5 ? 'moyennes' : 'toutes petites')},
      {nom:'Lumière', val:p.loupe ? 'nuit : seule ta loupe éclaire' : 'plein jour'}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/><rect x="14" y="20" width="130" height="110" rx="10" fill="#3a3168" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="156" y="20" width="130" height="110" rx="10" fill="#3a3168" stroke="' + CONTOUR + '" stroke-width="3"/>');
    var a = {t:'champignon', x:50, y:110, s:1, c:'#e5484d', d:true}, b = {t:'fiole', x:105, y:110, s:1, c:'#4fbf6a', d:true};
    var b2 = {t:'fiole', x:247, y:110, s:1, c:'#3f7fe0', d:true}, a2 = {t:'champignon', x:192, y:110, s:1, c:'#e5484d', d:true};
    d.contenu.innerHTML = dessinerObjets([a, b]) + dessinerObjets([a2, b2]) + '<circle class="mja-rond-demo" cx="247" cy="86" r="26" fill="none" stroke="#8ff3ff" stroke-width="4" opacity="0"/><circle class="mja-rond-demo2" cx="105" cy="86" r="26" fill="none" stroke="#8ff3ff" stroke-width="4" opacity="0"/>';
    var r1 = d.contenu.querySelector('.mja-rond-demo'), r2 = d.contenu.querySelector('.mja-rond-demo2');
    return scenario([
      [10, function(){ r1.setAttribute('opacity', '0'); r2.setAttribute('opacity', '0'); d.vers(270, 160, 0); }],
      [500, function(){ d.vers(247, 92, 800); }],
      [900, function(){ d.tape(); r1.setAttribute('opacity', '1'); r2.setAttribute('opacity', '1'); U.son('ok'); }],
      [1200, function(){ }]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var hud = creerHud(el);
    var ratesMax = p.erreurs, rates = 0;
    hud.vies(ratesMax + 1, ratesMax + 1);
    hud.prog(0, p.differences, '🔍');
    var scene = p.scene || genererScene(p.niveauScene, p.differences);
    var H = scene.H || 240;
    var id = nid('lo');
    var remp = {};
    scene.diffs.forEach(function(d){ remp[d.i] = d.b; });
    function nuit(k){ return p.loupe ? '<defs><mask id="' + id + 'k' + k + '"><rect width="360" height="' + H + '" fill="#fff"/><circle class="mja-trou" cx="-200" cy="-200" r="' + p.loupe.toFixed(0) + '" fill="#000"/></mask>' +
      '<radialGradient id="' + id + 'g' + k + '"><stop offset=".8" stop-color="#8ff3ff" stop-opacity="0"/><stop offset="1" stop-color="#8ff3ff" stop-opacity=".5"/></radialGradient></defs>' +
      '<rect class="mja-nuit" width="360" height="' + H + '" mask="url(#' + id + 'k' + k + ')"/><circle class="mja-lentille" cx="-200" cy="-200" r="' + p.loupe.toFixed(0) + '" fill="url(#' + id + 'g' + k + ')"/>' : ''; }
    var terrain = U.html('<div class="mja-terrain mja-loupe' + (p.loupe ? ' de-nuit' : '') + '"><div class="mja-images">' +
      '<div class="mja-image"><svg viewBox="0 0 360 ' + H + '" preserveAspectRatio="xMidYMid meet" data-img="a">' + etagere(id + 'a', H) + dessinerObjets(scene.objets) + '<g class="mja-ronds"></g>' + nuit(0) + '</svg></div>' +
      '<div class="mja-image"><svg viewBox="0 0 360 ' + H + '" preserveAspectRatio="xMidYMid meet" data-img="b">' + etagere(id + 'b', H) + dessinerObjets(scene.objets, remp) + '<g class="mja-ronds"></g>' + nuit(1) + '</svg></div>' +
    '</div>' + (p.indices ? '<div class="mja-actions"><button class="btn magie mja-indice" type="button">💡 × ' + p.indices + '</button></div>' : '') + '</div>');
    el.appendChild(terrain);
    var images = terrain.querySelector('.mja-images');
    function disposer(){ var r = terrain.getBoundingClientRect(); images.classList.toggle('cote', r.width > r.height * 1.1); }
    disposer();
    P.ecoute(window, 'resize', disposer);
    var svgs = Array.prototype.slice.call(terrain.querySelectorAll('svg'));
    var trouvees = 0, restant = p.duree, fini = false, indicesRestants = p.indices;
    if(p.revele){
      scene.diffs.forEach(function(d){ svgs.forEach(function(s){ svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r, 'class':'mja-scintille'}, s.querySelector('.mja-ronds')); }); });
    }
    function lentille(pt){
      if(!p.loupe) return;
      svgs.forEach(function(s){ s.querySelectorAll('.mja-trou, .mja-lentille').forEach(function(c){ c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); }); });
    }
    if(p.loupe) lentille({x:180, y:H / 2});
    function marquer(s, pt){
      if(fini) return;
      var d = null;
      scene.diffs.forEach(function(x){ if(!x.ok && dist(pt, x) < x.r * p.marge + 6) d = x; });
      if(d){
        d.ok = true; trouvees++;
        svgs.forEach(function(s2){ svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r, 'class':'mja-rond'}, s2.querySelector('.mja-ronds')); });
        U.son('ok');
        hud.prog(trouvees, p.differences, '🔍');
        if(trouvees >= p.differences){ fini = true; P.finir({reussi:true, score:1, erreurs:rates, detail:'Tu as l\'œil d\'un vrai savant !'}, 900); }
      } else {
        rates++;
        hud.perdVie(ratesMax + 1 - rates, ratesMax + 1);
        erreurSensorielle(s.parentNode);
        var x = svgNoeud('text', {x:pt.x, y:pt.y + 8, 'class':'mja-croix', 'text-anchor':'middle'}, s.querySelector('.mja-ronds'));
        x.textContent = '✗';
        P.apres(700, function(){ if(x.parentNode) x.parentNode.removeChild(x); });
        if(rates > ratesMax){ fini = true; montrerTout(); P.finir({reussi:false, score:trouvees / p.differences, erreurs:rates, detail:'Trop de mauvaises touches…'}, 1400); }
      }
    }
    svgs.forEach(function(s){
      var appui = null;
      P.ecoute(s, 'pointerdown', function(e){
        if(fini) return;
        e.preventDefault();
        var pt = ptSVG(s, e);
        if(!p.loupe){ marquer(s, pt); return; }
        appui = {x:e.clientX, y:e.clientY, id:e.pointerId, bouge:false};
        try{ s.setPointerCapture(e.pointerId); }catch(er){}
        lentille(pt);
      });
      P.ecoute(s, 'pointermove', function(e){
        if(!p.loupe) return;
        if(appui && e.pointerId === appui.id){ if(Math.abs(e.clientX - appui.x) + Math.abs(e.clientY - appui.y) > 12) appui.bouge = true; lentille(ptSVG(s, e)); }
        else if(e.pointerType === 'mouse') lentille(ptSVG(s, e));
      });
      P.ecoute(s, 'pointerup', function(e){
        if(!p.loupe || !appui || e.pointerId !== appui.id) return;
        var a = appui; appui = null;
        if(!a.bouge) marquer(s, ptSVG(s, e));
      });
      P.ecoute(s, 'pointercancel', function(){ appui = null; });
    });
    var bi = terrain.querySelector('.mja-indice');
    if(bi) P.ecoute(bi, 'click', function(){
      if(fini || indicesRestants <= 0) return;
      var restantes = scene.diffs.filter(function(d){ return !d.ok; });
      if(!restantes.length) return;
      indicesRestants--; bi.textContent = '💡 × ' + indicesRestants; if(!indicesRestants) bi.disabled = true;
      var d = U.choix(restantes);
      U.son('magie');
      lentille(d);
      var c = svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r * 1.2, 'class':'mja-indice-rond'}, svgs[1].querySelector('.mja-ronds'));
      P.apres(1800, function(){ if(c.parentNode) c.parentNode.removeChild(c); });
    });
    function montrerTout(){
      terrain.classList.remove('de-nuit');
      scene.diffs.forEach(function(d){ if(!d.ok) svgs.forEach(function(s){ svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r, 'class':'mja-rond manque'}, s.querySelector('.mja-ronds')); }); });
    }
    terrain.mjaEtat = function(){ return {diffs:scene.diffs.map(function(d){ return {x:d.x, y:d.y, ok:!!d.ok}; }), loupe:p.loupe}; };
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; montrerTout(); P.finir({reussi:false, score:trouvees / p.differences, erreurs:rates, detail:'Le sablier est vide…'}, 1400); return false; }
    });
    return {arreter: P.arreter};
  }
});

})();
