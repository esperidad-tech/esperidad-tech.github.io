/* ==========================================================
   LES BANDEROLES DE LA FÊTE (Pisteur) — le nouveau tir, vu par les yeux du Pisteur.
   Romain, 12 novembre 2026 (13 h 01 et 13 h 26) : « les banderoles, c'est trop facile même au
   niveau 10 ; ce jeu de l'arc est un peu basique, il faudrait changer la mécanique », puis il a
   décrit le tir qu'il aime (le jeu « Archery » de l'application « 2 Player Games ») :
   - on voit la cible au loin et, sur le côté, l'arc, dessiné comme en relief ;
   - on ne pose pas le doigt sur la cible : on appuie EN BAS de l'écran ; l'arc se bande, et un
     curseur apparaît quelque part autour de la cible, au hasard ;
   - le curseur a une très forte inertie : il suit le doigt avec du retard, tout en douceur ;
   - le vent compte : sa force et son sens sont écrits au-dessus de la cible ;
   - un minuteur tourne autour du curseur : à la fin, la flèche part toute seule ; si on lève le
     doigt avant, elle part aussi ;
   - l'écran suit la flèche (une petite traînée blanche derrière elle), la cible se rapproche, la
     flèche se plante en gros plan, avec un petit choc et le bruit du bois.
   Chez nous : sur la place en fête, cinq villageois tiennent un anneau de bois au bout d'une
   perche. On touche un anneau, la vue de tir s'ouvre. La flèche doit passer DANS l'anneau (elle
   y tire la banderole) ; plantée dans le bois de l'anneau, ou à côté : raté. La difficulté, c'est
   la taille de l'anneau et la force du vent, rien d'autre (Romain).

   Comment c'est fait (pour rester fluide sur une vieille tablette, on ne bouge que des calques) :
   - le décor (mj-visee-decor.js) est posé deux fois : la place entière (.vs-c-large) et la vue de
     tir (.vs-c-vise, le même dessin regardé de près, net) ; on passe de l'un à l'autre par un zoom
     et un fondu ;
   - dans la vue de tir, l'anneau visé est un calque à part, dessiné en grand (net en gros plan) ;
     sa perche est un trait redessiné entre les mains du porteur (au fond) et l'anneau (devant) ;
   - quand la flèche vole, la caméra avance : l'anneau grossit plus vite que les maisons derrière
     (camera()), c'est ce qui donne la profondeur ;
   - l'arc est un vrai petit modèle en trois dimensions, projeté à l'écran (Arc) : la poignée, les
     branches qui plient, la corde, la flèche, le bras.
   Les sons sont fabriqués ici (sonsVisee) et recopiés tels quels dans l'Atelier des sons.
   Pour les essais : la scène porte __visee (l'état, les anneaux, choisir, viser).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.VISEE_ART){ if(window.console) console.error('mj-visee : mj-visee-decor.js doit être chargé avant.'); return; }
var U = MJ.util, A = MJ.VISEE_ART, K = A.K, f = A.f, P = A.P;
var DEV = 3.3;          /* ce que le vent pousse la flèche, par point de vent (en unités du monde) */
var ZOOM_VISEE = 2.75;  /* la vue de tir regarde le monde d'aussi près (× l'unité de l'écran) */
var HAUT = 0.36;        /* dans la vue de tir, l'anneau est à cette hauteur de l'écran */
var ZONE_BAS = 0.56;    /* on pose le doigt sous cette hauteur */
var T_VOL = 0.95;       /* le vol de la flèche, en secondes */
var FOND = 0.5;         /* les maisons sont plus loin que l'anneau : elles grossissent moins vite */
var OMEGA = 4, AMORTI = 0.85;   /* l'inertie du curseur : un ressort mou, à peine amorti */
var MARGE = 0.4;        /* la flèche a une épaisseur */
var PISTEUR = [0, 590]; /* là où le Pisteur tient le bout de la banderole (sous l'écran) */
var nUid = 0;
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function lisse(x){ x = x < 0 ? 0 : (x > 1 ? 1 : x); return x * x * (3 - 2 * x); }
function reduit(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }

/* >>> LES SONS DE LA VISÉE (ce bloc est recopié tel quel dans l'Atelier des sons : donjon/essai/construire-sons.py)
   Les mêmes briques que le gâteau et le labo : des notes, des souffles, de petits grains. */
function sonsVisee(audio, sortie){
  function tendre(fq, t0, duree, vol, glisse, att, type, filtre){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(fq, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
    g.connect(sortie(a)); o.start(t); o.stop(t + duree + 0.03);
  }
  /* un souffle : du bruit filtré dont la hauteur glisse de f0 à f1 */
  function souffle(t0, duree, vol, f0, f1, q, type, att){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
    fl.type = type || 'bandpass'; fl.Q.value = q || 0.8; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || Math.min(.06, duree * .3))); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(fl); fl.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* une note qui tremble (la flèche qui vibre dans le bois, la corde qui frémit) */
  function tremble(fq, t0, duree, vol, vite, type){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain(), l = a.createOscillator(), lg = a.createGain();
    o.type = type || 'triangle'; o.frequency.setValueAtTime(fq, t); o.frequency.exponentialRampToValueAtTime(fq * .8, t + duree);
    l.frequency.value = vite; lg.gain.value = vol * .8; l.connect(lg); lg.connect(g.gain);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g); g.connect(sortie(a)); o.start(t); l.start(t); o.stop(t + duree + .03); l.stop(t + duree + .03);
  }
  return {
    choisir:function(){ souffle(0, .22, .03, 500, 1700, .7); tendre(660, .02, .09, .03, 880, .006); },                                                                       /* on regarde un anneau de plus près */
    bander:function(){ souffle(0, .34, .034, 240, 520, 1.6); tendre(92, 0, .32, .05, 128, .05, 'sawtooth', 420); tendre(310, .12, .05, .02, 360, .004, 'triangle', 900); tendre(350, .24, .05, .018, 410, .004, 'triangle', 900); },   /* le bois de l'arc craque, la corde se tend */
    tic:function(){ tendre(1500, 0, .035, .03, null, .002, 'triangle', 4000); },                                                                                               /* le minuteur presse */
    lacher:function(){ tendre(196, 0, .16, .09, 122, .003, 'triangle', 1400); tremble(147, .01, .3, .03, 46); souffle(0, .07, .05, 1800, 700, .7); },                           /* « twang ! » */
    vol:function(){ souffle(0, .95, .06, 500, 2400, 1.1, 'bandpass', .5); souffle(.05, .9, .03, 3000, 5200, .8, 'bandpass', .6); },                                              /* la flèche file dans le vent */
    bois:function(){ tendre(150, 0, .2, .2, 62, .003, 'sine'); tendre(330, 0, .06, .1, 190, .002, 'triangle', 1800); souffle(0, .06, .12, 1400, 400, .7, 'lowpass', .004); tremble(210, .05, .42, .045, 31); },   /* « tchac ! » : plantée dans le bois, elle vibre */
    dedans:function(){ souffle(0, .2, .06, 2600, 900, .9); tendre(1047, .1, .3, .05, null, .006); tendre(1568, .2, .4, .045, null, .006); souffle(.16, .1, .03, 700, 1500, .6); souffle(.3, .1, .026, 800, 1700, .6); },   /* elle passe : un souffle, deux notes claires, la banderole claque */
    acote:function(){ souffle(0, .5, .04, 2200, 500, .8); tendre(392, .3, .22, .04, 262, .01, 'triangle', 900); },                                                               /* elle file au loin… */
    accroche:function(){ souffle(0, .16, .03, 900, 2000, .7); [784, 988, 1175].forEach(function(n, i){ tendre(n, .06 + i * .07, .16, .032, null, .006, 'triangle', 3000); }); },    /* la banderole se tend entre deux anneaux */
    fete:function(){ [523, 659, 784, 1047, 1319, 1568].forEach(function(n, i){ tendre(n, i * .09, .3, .055, null, .01, 'triangle', 3000); }); tendre(1047, .6, .9, .04, null, .02); tendre(1319, .6, .9, .03, null, .02); tendre(1568, .6, .9, .024, null, .02);
      for(var i = 0; i < 6; i++){ var n = 700 + Math.random() * 900; tendre(n, .7 + i * .09, .06, .02, n * 1.5, .005); } },                                                      /* la place est décorée ! */
    vide:function(){ tendre(330, 0, .16, .05, 262, .01, 'triangle', 1000); tendre(220, .16, .3, .05, 165, .01, 'triangle', 800); }                                               /* plus de flèches */
  };
}
/* <<< LES SONS DE LA VISÉE */
var ctxA = null;
function audio(){
  try{ if(window.Brume && Brume.sonActif && !Brume.sonActif()) return null; }catch(e){}
  try{ if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; }catch(e){}
  if(!ctxA){ try{ var AC = window.AudioContext || window.webkitAudioContext; ctxA = AC ? new AC() : null; }catch(e){ ctxA = null; } }
  if(ctxA && ctxA.state === 'suspended') try{ ctxA.resume(); }catch(e){}
  return ctxA;
}
var SONS = sonsVisee(audio, function(a){ return a.destination; });
function son(nom){ try{ if(SONS[nom]) SONS[nom](); }catch(e){} }

/* ==========================================================
   L'ARC, vu par l'archer : un petit modèle en trois dimensions, projeté à l'écran.
   La caméra est derrière l'épaule ; la poignée est en bas à gauche, la flèche pointe vers le
   milieu de l'écran. d = 0 : l'arc au repos ; d = 1 : bandé à fond (les branches plient vers
   nous, l'encoche de la flèche sort de l'écran, la pointe revient vers la main).
   Dessiné pour un écran de 1164 × 740, puis mis à l'échelle (regler) et calé en bas à gauche.
   ========================================================== */
function Arc(svg, id){
  var F = 700, OX = 582, OY = 370, kb = 1, hb = 740;
  function nrm(v){ var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function add(a, b, k){ return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function pv(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  var G = [-0.322, -0.263, 0.80], D = nrm([0.30, 0.26, 1]);
  var u0 = [Math.sin(.25), Math.cos(.25), 0], k0 = u0[0] * D[0] + u0[1] * D[1] + u0[2] * D[2], UP = nrm(add(u0, D, -k0)), DR = nrm(pv(UP, D));
  function pr(p){ var z = Math.max(.1, p[2]); return [(OX + F * p[0] / z) * kb, hb - (740 - (OY - F * p[1] / z)) * kb, F / z * kb]; }
  svg.innerHTML = '<defs><linearGradient id="' + id + 'ab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0cc8c"/><stop offset=".5" stop-color="#cf9a52"/><stop offset="1" stop-color="#96662c"/></linearGradient>' +
    '<linearGradient id="' + id + 'am" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c9c68"/><stop offset="1" stop-color="#2a6a42"/></linearGradient></defs>' +
    '<g class="vs-arc-g"><path class="vs-a-bras" fill="url(#' + id + 'am)" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-brassard" fill="#7a4e2c" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-sangle" fill="none" stroke="#4c2e18"/>' +
    '<path class="vs-a-bois" fill="url(#' + id + 'ab)" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-reflet" fill="none" stroke="#fff3d0" stroke-linecap="round" opacity=".75"/><path class="vs-a-poignee" fill="#5a3422" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-couture" fill="none" stroke="#c9a070" stroke-linecap="round" opacity=".8"/>' +
    '<path class="vs-a-corde-c" fill="none" stroke="' + K + '" stroke-linecap="round" stroke-linejoin="round"/><path class="vs-a-corde" fill="none" stroke="#f4ecdc" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path class="vs-a-main" fill="#f1c7a0" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-doigts" fill="none" stroke="#a8745a" stroke-linecap="round"/><path class="vs-a-pouce" fill="#f1c7a0" stroke="' + K + '" stroke-linejoin="round"/>' +
    '<g class="vs-a-fleche"><path class="vs-a-fut" fill="#dcbb80" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-pointe" fill="#b8c2cc" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-p vs-a-p1" fill="#f4ecdc" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-p vs-a-p2" fill="#f4ecdc" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-a-p vs-a-p0" fill="#e5484d" stroke="' + K + '" stroke-linejoin="round"/></g></g>';
  function q(c){ return svg.querySelector(c); }
  var E = {bras:q('.vs-a-bras'), brassard:q('.vs-a-brassard'), sangle:q('.vs-a-sangle'), bois:q('.vs-a-bois'), reflet:q('.vs-a-reflet'), poignee:q('.vs-a-poignee'), couture:q('.vs-a-couture'), cordeC:q('.vs-a-corde-c'), corde:q('.vs-a-corde'), main:q('.vs-a-main'), doigts:q('.vs-a-doigts'), pouce:q('.vs-a-pouce'), fleche:q('.vs-a-fleche'), fut:q('.vs-a-fut'), pointe:q('.vs-a-pointe'), p0:q('.vs-a-p0'), p1:q('.vs-a-p1'), p2:q('.vs-a-p2')};
  /* un ruban : des points au milieu (x, y, demi-largeur) → le contour */
  function ruban(pts){
    var g = [], dr = [];
    for(var i = 0; i < pts.length; i++){
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
      g.push(P(pts[i][0] + nx * pts[i][2], pts[i][1] + ny * pts[i][2])); dr.unshift(P(pts[i][0] - nx * pts[i][2], pts[i][1] - ny * pts[i][2]));
    }
    return 'M' + g.join(' L') + ' L' + dr.join(' L') + ' Z';
  }
  function poly(l){ return 'M' + l.map(function(p){ var r = pr(p); return P(r[0], r[1]); }).join(' L') + ' Z'; }
  function pointDuBois(s, d){ return add(add(G, UP, 0.5 * s * (1 - .1 * d)), D, -(0.17 + 0.11 * d) * s * s); }
  var etat = {d:0, fleche:true};
  this.regler = function(k, h){ kb = k; hb = h; };
  /* la pointe de la flèche, à l'écran (d'où part la flèche qui vole) */
  this.pointe = function(d){ var r = pr(add(G, D, -(0.17 + 0.45 * d) + 0.72)); return [r[0], r[1]]; };
  this.dessiner = function(d, avecFleche){
    if(d === undefined) d = etat.d; if(avecFleche === undefined) avecFleche = etat.fleche;
    etat.d = d; etat.fleche = avecFleche;
    var ep = Math.max(1.4, 2.6 * kb), i, s, r;
    /* le bois */
    var pts = [], po = [];
    for(i = 0; i <= 28; i++){ s = -1 + i / 14; r = pr(pointDuBois(s, d)); var l = (0.014 + 0.022 * (1 - Math.pow(Math.abs(s), 1.4))) * .5 * r[2]; pts.push([r[0], r[1], l]); if(Math.abs(s) <= .15) po.push([r[0], r[1], l * 1.14]); }
    E.bois.setAttribute('d', ruban(pts)); E.bois.setAttribute('stroke-width', f(ep));
    E.reflet.setAttribute('d', 'M' + pts.map(function(p, k){ var a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l2 = Math.hypot(tx, ty) || 1; return P(p[0] - ty / l2 * p[2] * .45, p[1] + tx / l2 * p[2] * .45); }).join(' L')); E.reflet.setAttribute('stroke-width', f(1.6 * kb));
    E.poignee.setAttribute('d', ruban(po)); E.poignee.setAttribute('stroke-width', f(ep));
    E.couture.setAttribute('d', po.filter(function(p, k){ return k > 0 && k < po.length - 1; }).map(function(p){ return 'M' + P(p[0] - p[2] * .7, p[1] - p[2] * .1) + ' L' + P(p[0] + p[2] * .7, p[1] + p[2] * .1); }).join(' ')); E.couture.setAttribute('stroke-width', f(1.3 * kb));
    /* la corde : d'un bout à l'autre de l'arc, en passant par l'encoche de la flèche */
    var N = add(G, D, -(0.17 + 0.45 * d)), h1 = pr(pointDuBois(1, d)), h2 = pr(pointDuBois(-1, d)), n2 = pr(N), dc = 'M' + P(h1[0], h1[1]) + ' L' + P(n2[0], n2[1]) + ' L' + P(h2[0], h2[1]);
    E.cordeC.setAttribute('d', dc); E.cordeC.setAttribute('stroke-width', f(4.4 * kb)); E.corde.setAttribute('d', dc); E.corde.setAttribute('stroke-width', f(2.2 * kb));
    /* l'avant-bras (la manche verte du Pisteur), son brassard de cuir, le poing sur la poignée */
    var g2 = pr(G), co = pr(add(G, [-0.10, -0.40, -0.42], 1)), dx = co[0] - g2[0], dy = co[1] - g2[1];
    function surBras(t, lar){ return [g2[0] + dx * t, g2[1] + dy * t, lar * (g2[2] + (co[2] - g2[2]) * t) * .5]; }
    E.bras.setAttribute('d', ruban([surBras(.04, .08), surBras(.5, .092), surBras(1, .105)])); E.bras.setAttribute('stroke-width', f(ep));
    E.brassard.setAttribute('d', ruban([surBras(.09, .086), surBras(.3, .093)])); E.brassard.setAttribute('stroke-width', f(ep));
    E.sangle.setAttribute('d', [.15, .24].map(function(t){ var a = surBras(t, .09), l3 = Math.hypot(dx, dy) || 1; return 'M' + P(a[0] + dy / l3 * a[2], a[1] - dx / l3 * a[2]) + ' L' + P(a[0] - dy / l3 * a[2], a[1] + dx / l3 * a[2]); }).join(' ')); E.sangle.setAttribute('stroke-width', f(2 * kb));
    var rm = .05 * g2[2], a1 = pr(pointDuBois(.1, d)), a0 = pr(pointDuBois(-.1, d)), an = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), ca = Math.cos(an), sa = Math.sin(an);
    function mm(x, y){ return P(g2[0] + (x * ca - y * sa) * rm, g2[1] + (x * sa + y * ca) * rm); }
    E.main.setAttribute('d', 'M' + mm(-1.05, -.2) + ' C' + mm(-1.1, -1) + ' ' + mm(-.2, -1.1) + ' ' + mm(.5, -1) + ' C' + mm(1.1, -.95) + ' ' + mm(1.15, .1) + ' ' + mm(.95, .7) + ' C' + mm(.6, 1.2) + ' ' + mm(-.7, 1.15) + ' ' + mm(-1, .5) + ' Z'); E.main.setAttribute('stroke-width', f(ep));
    E.doigts.setAttribute('d', [-.5, 0, .5].map(function(x){ return 'M' + mm(x, -1) + ' Q' + mm(x + .08, -.3) + ' ' + mm(x, .25); }).join(' ')); E.doigts.setAttribute('stroke-width', f(1.6 * kb));
    E.pouce.setAttribute('d', 'M' + mm(-.2, .45) + ' C' + mm(.2, .2) + ' ' + mm(.95, .3) + ' ' + mm(1.25, .62) + ' C' + mm(1.4, .95) + ' ' + mm(1.05, 1.15) + ' ' + mm(.7, .98) + ' C' + mm(.4, .85) + ' ' + mm(0, .95) + ' ' + mm(-.3, .9) + ' Z'); E.pouce.setAttribute('stroke-width', f(ep * .85));
    /* la flèche : le fût, la pointe d'acier, les trois plumes */
    E.fleche.style.display = avecFleche ? '' : 'none';
    if(avecFleche){
      var T = add(N, D, 0.70), t2 = pr(T), fx = t2[0] - n2[0], fy = t2[1] - n2[1], fl = Math.hypot(fx, fy) || 1, nx = -fy / fl, ny = fx / fl, wn = .006 * n2[2], wt = .006 * t2[2];
      E.fut.setAttribute('d', 'M' + P(n2[0] + nx * wn, n2[1] + ny * wn) + ' L' + P(t2[0] + nx * wt, t2[1] + ny * wt) + ' L' + P(t2[0] - nx * wt, t2[1] - ny * wt) + ' L' + P(n2[0] - nx * wn, n2[1] - ny * wn) + ' Z'); E.fut.setAttribute('stroke-width', f(ep * .85));
      var bt = pr(add(T, D, .05)), wp = .015 * t2[2];
      E.pointe.setAttribute('d', 'M' + P(bt[0], bt[1]) + ' L' + P(t2[0] + nx * wp, t2[1] + ny * wp) + ' L' + P(t2[0] - nx * wp, t2[1] - ny * wp) + ' Z'); E.pointe.setAttribute('stroke-width', f(ep * .8));
      [[E.p0, UP], [E.p1, add(add([0, 0, 0], UP, -.5), DR, .866)], [E.p2, add(add([0, 0, 0], UP, -.5), DR, -.866)]].forEach(function(c){
        c[0].setAttribute('d', poly([add(N, D, .03), add(add(N, D, .045), c[1], .022), add(add(N, D, .12), c[1], .022), add(N, D, .14)])); c[0].setAttribute('stroke-width', f(ep * .7));
      });
    }
  };
}

/* la flèche qui vole, vue de derrière : sa traînée blanche (elle vient vers nous), le fût, la pointe, les trois plumes */
var FLECHE_DOS = '<g class="vs-v-f"><path class="vs-v-t" d="M0,4 L-9,74 Q0,90 9,74 Z" fill="#fff" opacity=".7"/><path class="vs-v-t2" d="M-13,10 L-22,56 M13,10 L22,56" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>' +
  '<path d="M-2.6,2 L-1.2,-30 H1.2 L2.6,2 Z" fill="#dcbb80" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M0,-37 L-3,-29 H3 Z" fill="#b8c2cc" stroke="' + K + '" stroke-width="1.3" stroke-linejoin="round"/>' +
  '<path d="M-1.6,-8 L-11,-3 L-11,6 L-1.6,2 Z" fill="#f4ecdc" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/><path d="M1.6,-8 L11,-3 L11,6 L1.6,2 Z" fill="#f4ecdc" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/><path d="M-1.8,-9 L0,-13 L1.8,-9 L1.8,3 H-1.8 Z" fill="#e5484d" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/></g>';
/* le curseur : le rond du minuteur, la croix, le point rouge du milieu */
var CURSEUR = '<circle r="24" fill="rgba(20,14,30,.22)" stroke="' + K + '" stroke-width="6.4"/><circle r="24" fill="none" stroke="#fff" stroke-width="3.6" opacity=".9"/><circle class="vs-cu-t" r="24" fill="none" stroke="#ffd23f" stroke-width="3.6" stroke-linecap="butt" transform="rotate(-90)"/>' +
  '<path d="M0,-17 V-7 M0,7 V17 M-17,0 H-7 M7,0 H17" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M0,-17 V-7 M0,7 V17 M-17,0 H-7 M7,0 H17" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle r="3.4" fill="' + K + '"/><circle r="1.9" fill="#ff4a4a"/>';
var TOUR = 2 * Math.PI * 24;
/* la main qui montre (la même que dans les autres explications) */
var MAIN = '<g transform="scale(.62) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/><path d="M5,30 L5,40 M16,31 L16,41" stroke="' + K + '" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g>';
/* le vent : trois traits de vent, puis une flèche blanche longue de lg (elle part de 0) */
var IC_VENT = '<path d="M2,6 H15 C19,6 19,1 15.5,1.6 M2,10.5 H21 C25.4,10.5 25.4,16.4 21,15.6 M2,15 H11 C14.4,15 14.4,19 11.6,18.6" fill="none" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/>';
function flecheVent(lg){ return 'M4,7 H' + f(lg - 9) + ' V2.4 L' + f(lg + 4) + ',10 L' + f(lg - 9) + ',17.6 V13 H4 Z'; }

/* ==========================================================
   LES ANNEAUX ET LA BANDEROLE (dessinés en unités du monde, par-dessus le décor)
   ========================================================== */
/* un anneau : il est fixé au bout de sa perche, dans son prolongement (la perche ne passe jamais devant le trou) */
function unAnneau(po, i, rExt, vent){
  var dx = po.bout[0] - po.main[0], dy = po.bout[1] - po.main[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
  return {i:i, po:po, main:po.main, bout:po.bout, dir:[ux, uy], rExt:rExt, c:[po.bout[0] + ux * rExt, po.bout[1] + uy * rExt], vent:vent, fait:false};
}
/* la banderole : une ficelle qui pend entre deux points, et ses petits drapeaux */
function banderole(a, b, neuve, k0){
  var L = Math.hypot(b[0] - a[0], b[1] - a[1]), fl = L * .1 + 5, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 2 * fl, n = Math.max(3, Math.round(L / 13)), q = '';
  var dd = 'M' + P(a[0], a[1]) + ' Q' + P(mx, my) + ' ' + P(b[0], b[1]);
  q += '<path d="' + dd + '" fill="none" stroke="' + K + '" stroke-width="2" opacity=".8"/><path d="' + dd + '" fill="none" stroke="#f4ecdc" stroke-width="1"/>';
  for(var i = 0; i < n; i++){
    var t = (i + .5) / n, w = 1 - t, x = w * w * a[0] + 2 * w * t * mx + t * t * b[0], y = w * w * a[1] + 2 * w * t * my + t * t * b[1], an = Math.atan2(2 * w * (my - a[1]) + 2 * t * (b[1] - my), 2 * w * (mx - a[0]) + 2 * t * (b[0] - mx)) * 180 / Math.PI;
    if(an > 90) an -= 180; if(an < -90) an += 180;
    q += '<g transform="translate(' + P(x, y) + ') rotate(' + f(an + ((i * 37) % 11) - 5) + ')"><path class="vs-fan' + (neuve ? ' vs-fan-neuf' : '') + '"' + (neuve ? ' style="animation-delay:' + (i * 30) + 'ms"' : '') + ' d="M-4.6,0 H4.6 L0,11.5 Z" fill="' + A.COULEURS[(i + (k0 || 0)) % A.COULEURS.length] + '" stroke="' + K + '" stroke-width=".8" stroke-linejoin="round"/></g>';
  }
  return q;
}
/* le petit fanion planté en haut de l'anneau : il montre d'où vient le vent */
function fanion(an, x, y){
  var s = an.vent < 0 ? -1 : 1, l = an.vent ? 6 + Math.abs(an.vent) * .9 : 0;
  return '<path d="M' + P(x, y + 1) + ' v-11" stroke="' + K + '" stroke-width="1.1" stroke-linecap="round"/>' +
    (an.vent ? '<g transform="translate(' + P(x, y - 10) + ') scale(' + s + ',1)"><path class="vs-fanion" style="animation-duration:' + f(1 - Math.abs(an.vent) * .07) + 's" d="M0,0 L' + f(l) + ',3.2 L0,6.4 Z" fill="#e5484d" stroke="' + K + '" stroke-width=".7" stroke-linejoin="round"/></g>' :
      '<path d="M' + P(x, y - 10) + ' q2.4,3 .6,8.4 l-2,-1.4 Z" fill="#e5484d" stroke="' + K + '" stroke-width=".7" stroke-linejoin="round"/>');
}
/* un anneau et sa perche, à plat (la place entière ; et, dans la vue de tir, les anneaux qu'on ne vise pas) */
function anneauPlat(an, prefixe, trou, bois){
  var ux = an.dir[0], uy = an.dir[1], b0 = [an.main[0] - ux * 9, an.main[1] - uy * 9];
  return '<g class="vs-an" data-i="' + an.i + '"><path d="M' + P(b0[0], b0[1]) + ' L' + P(an.bout[0], an.bout[1]) + '" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round"/><path d="M' + P(b0[0], b0[1]) + ' L' + P(an.bout[0], an.bout[1]) + '" stroke="#c99a5e" stroke-width="2" stroke-linecap="round"/><path d="M' + P(b0[0] - uy * .5, b0[1] + ux * .5) + ' L' + P(an.bout[0] - uy * .5, an.bout[1] + ux * .5) + '" stroke="#f0d2a0" stroke-width=".6" opacity=".8"/>' +
    fanion(an, an.c[0], an.c[1] - an.rExt) + '<g transform="translate(' + P(an.c[0], an.c[1]) + ')">' + A.anneau(prefixe + an.i, trou, bois) + '</g></g>';
}

/* ==========================================================
   LE JEU
   ========================================================== */
function jouer(el, p, fin){
  var id = 'vs' + (++nUid) + '-', N = Math.min(A.PORTEURS.length, p.anneaux || 5), rExt = p.trou + p.bois;
  var etat = 'large', actif = -1, fleches = p.fleches, rates = 0, chaine = [], finie = false, arrete = false;
  var W = 0, H = 0, u = 1, sL = 1, sV = 1, C = [0, 0], zf = 2.5, cote = 0, oyL = 0;
  var boucles = [], minuteurs = [];
  /* les anneaux : un par porteur ; chacun son vent (le sens au hasard, mais jamais tous du même côté) */
  var anneaux = A.PORTEURS.slice(0, N).map(function(po, i){ var v = U.randInt(p.ventMin, p.ventMax); return unAnneau(po, i, rExt, v ? v * (Math.random() < .5 ? -1 : 1) : 0); });
  if(p.ventMax > 0 && anneaux.every(function(a){ return a.vent >= 0; })) anneaux[U.randInt(0, N - 1)].vent *= -1;
  if(p.ventMax > 0 && anneaux.every(function(a){ return a.vent <= 0; })) anneaux[U.randInt(0, N - 1)].vent *= -1;

  el.innerHTML = '';
  var monde = A.monde(id + 'l');
  var racine = U.html('<div class="vs vs-e-large">' +
    '<div class="vs-couche vs-c-large"><svg class="vs-monde" aria-hidden="true">' + monde + '</svg><svg class="vs-dyn" aria-hidden="true"></svg></div>' +
    '<div class="vs-couche vs-c-vise"><svg class="vs-monde" aria-hidden="true">' + monde.split(id + 'l').join(id + 'v') + '</svg><svg class="vs-dyn" aria-hidden="true"></svg></div>' +
    '<svg class="vs-perche" aria-hidden="true"><path class="vs-pe-c" fill="#c99a5e" stroke="' + K + '" stroke-linejoin="round"/><path class="vs-pe-r" fill="none" stroke="#f0d2a0" stroke-linecap="round" opacity=".8"/></svg>' +
    '<div class="vs-anneau"><svg aria-hidden="true"></svg></div>' +
    '<svg class="vs-arc" aria-hidden="true"></svg>' +
    '<svg class="vs-fx" aria-hidden="true"></svg>' +
    '<div class="vs-vent"></div>' +
    '<div class="vs-cibles"></div>' +
    '<div class="vs-zone"><i></i><svg viewBox="-20 -8 40 80" aria-hidden="true">' + MAIN + '</svg></div>' +
    '<div class="vs-curseur"><svg viewBox="-30 -30 60 60" aria-hidden="true">' + CURSEUR + '</svg></div>' +
    '<div class="vs-hud"><span class="vs-h-fl"><svg viewBox="0 0 40 14" aria-hidden="true"><path d="M2,7 H30" stroke="' + K + '" stroke-width="4.4" stroke-linecap="round"/><path d="M2,7 H30" stroke="#dcbb80" stroke-width="2.4" stroke-linecap="round"/><path d="M38,7 L28,2 V12 Z" fill="#b8c2cc" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M2,7 l5,-5 h5 l-4,5 l4,5 h-5 Z" fill="#e5484d" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/></svg><b></b></span><span class="vs-h-an"></span></div>' +
    '<div class="vs-mot" aria-live="polite"></div><div class="vs-confettis" aria-hidden="true"></div></div>');
  el.appendChild(racine);
  function $(s){ return racine.querySelector(s); }
  var cL = $('.vs-c-large'), cV = $('.vs-c-vise'), svgL = cL.firstChild, dynL = cL.lastChild, svgV = cV.firstChild, dynV = cV.lastChild;
  var svgP = $('.vs-perche'), peC = $('.vs-pe-c'), peR = $('.vs-pe-r'), divA = $('.vs-anneau'), svgA = divA.firstChild, svgArc = $('.vs-arc'), svgFx = $('.vs-fx');
  var divVent = $('.vs-vent'), divCibles = $('.vs-cibles'), divZone = $('.vs-zone'), divCur = $('.vs-curseur'), cuT = $('.vs-cu-t'), divMot = $('.vs-mot'), divConf = $('.vs-confettis'), hFl = $('.vs-h-fl b'), hAn = $('.vs-h-an');
  var arc = new Arc(svgArc, id + 'a');
  cuT.setAttribute('stroke-dasharray', f(TOUR)); cuT.setAttribute('stroke-dashoffset', f(TOUR));

  function plusTard(ms, fn){ var t = setTimeout(function(){ if(!arrete) fn(); }, ms); minuteurs.push(t); return t; }
  function anim(duree, pas, fini){
    var arret = U.boucle(function(dt, t){
      if(arrete) return false;
      var x = duree > 0 ? Math.min(1, t / duree) : 1;
      pas(x, dt);
      if(x >= 1){ if(fini) fini(); return false; }
    });
    boucles.push(arret); return arret;
  }

  /* tout ce qui change sur la place : les perches, les anneaux, la banderole déjà tendue */
  function dessinerDyn(neuf, sansLeDernier){
    var ch = sansLeDernier ? chaine.slice(0, -1) : chaine;
    [[dynL, 'L'], [dynV, 'V']].forEach(function(c){
      var q = '';
      anneaux.forEach(function(an){ q += anneauPlat(an, id + c[1], p.trou, p.bois); });
      if(ch.length){
        var premier = anneaux[ch[0]].c, dernier = anneaux[ch[ch.length - 1]].c;
        q += '<g class="vs-bande">' + banderole(finie ? [A.MAT.x, A.MAT.y + 4] : PISTEUR, premier, neuf && (finie || ch.length === 1), 2);
        for(var i = 1; i < ch.length; i++) q += banderole(anneaux[ch[i - 1]].c, anneaux[ch[i]].c, neuf && !finie && i === ch.length - 1, i * 3);
        /* le bout libre, après le dernier anneau : il pend */
        q += banderole(dernier, [dernier[0] + 7, dernier[1] + 30], false, 5) + '</g>';
      }
      c[0].innerHTML = q;
    });
    if(actif >= 0){ var g = dynV.querySelector('.vs-an[data-i="' + actif + '"]'); if(g) g.style.display = 'none'; }
  }

  /* ---------- les mesures de l'écran, et la place de chaque chose ---------- */
  function ecranL(x, y){ return [W / 2 + x * sL, H * .5 + oyL + (y + 120) * sL]; }
  function mesurer(){
    var zw = el.clientWidth, zh = el.clientHeight; if(!zw || !zh) return;
    racine.style.maxWidth = Math.round(zh * 1.75) + 'px';
    W = Math.min(zw, Math.round(zh * 1.75)); H = zh;
    u = U.borne(Math.min(W, H) / 400, .8, 1.7);
    sL = Math.min(W / 620, H / 740); sV = ZOOM_VISEE * u; C = [W / 2, H * HAUT];
    zf = U.borne(.26 * Math.min(W, H) / (rExt * sV), 2.2, 3.6);
    /* sur un écran très bas, l'anneau du clocher et son vent sortiraient par le haut : on descend alors un peu la place */
    oyL = 0;
    var hEt = (11 + 2.5 * u) * 1.35 + 6, haut = 1e9;
    anneaux.forEach(function(an){ var e = ecranL(an.c[0], an.c[1]); haut = Math.min(haut, e[1] - (rExt + 12) * sL - 3 - hEt, e[1] - Math.max(26, rExt * sL + 14)); });
    if(haut < 4) oyL = 4 - haut;
    var vb = [-(W / 2) / sL, -120 - (H * .5 + oyL) / sL, W / sL, H / sL].map(f).join(' ');
    svgL.setAttribute('viewBox', vb); dynL.setAttribute('viewBox', vb);
    svgP.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svgArc.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svgFx.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    arc.regler(Math.min(H / 740, W / 620), H); arc.dessiner();
    racine.style.setProperty('--vs-u', u.toFixed(3));
    cibles();
    if(actif >= 0){ cadrerVisee(); if(etat === 'vise' || etat === 'bande') camera(1, [0, 0], C[0], C[1], true); }
    else arcBas(0);
  }
  /* la vue de tir : le même monde, regardé de près, l'anneau visé à sa place sur l'écran */
  function cadrerVisee(){
    var an = anneaux[actif], vb = [an.c[0] - (W / 2) / sV, an.c[1] - (H * HAUT) / sV, W / sV, H / sV].map(f).join(' ');
    svgV.setAttribute('viewBox', vb); dynV.setAttribute('viewBox', vb);
    /* l'anneau visé, dessiné en grand (net en gros plan), puis rapetissé */
    var demi = rExt + 24; cote = 2 * demi * sV * zf;
    divA.style.width = divA.style.height = Math.round(cote) + 'px';
    svgA.setAttribute('viewBox', [-demi, -demi, 2 * demi, 2 * demi].join(' '));
    svgA.innerHTML = '<g class="vs-an-g" style="transform-origin:' + f(demi - an.dir[0] * rExt) + 'px ' + f(demi - an.dir[1] * rExt) + 'px">' + fanion(an, 0, -rExt) + A.anneau(id + 'A', p.trou, p.bois) + '</g>';
    /* le vent, écrit au-dessus de l'anneau : sa force, et une flèche longue comme ce qu'il pousse */
    var v = Math.abs(an.vent), lg = Math.max(22, v * DEV * sV), haut = 20 * u;
    divVent.innerHTML = '<div class="vs-vent-p"><svg viewBox="0 0 26 20" aria-hidden="true">' + IC_VENT + '</svg><b>' + v + '</b></div>' +
      (v ? '<svg class="vs-vent-f" width="' + Math.round(lg + 8) + '" height="' + Math.round(haut) + '" viewBox="0 0 ' + f(lg + 8) + ' 20" preserveAspectRatio="none" style="transform:scaleX(' + (an.vent < 0 ? -1 : 1) + ')" aria-hidden="true"><path d="' + flecheVent(lg) + '" fill="#fff" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' : '');
    divVent.style.left = f(C[0]) + 'px'; divVent.style.top = f(C[1] - (rExt + 13) * sV - 6 * u) + 'px';
    divVent.setAttribute('aria-label', v ? 'Vent de force ' + v + ', vers la ' + (an.vent < 0 ? 'gauche' : 'droite') : 'Pas de vent');
  }
  /* la caméra de la vue de tir. m : de combien l'anneau est grossi ; pw : le point du monde (compté depuis le milieu de
     l'anneau) qu'on a devant soi ; (ax, ay) : où ce point tombe à l'écran. plat : tout grossit pareil (le zoom depuis la
     place) ; sinon les maisons, plus loin, grossissent moins que l'anneau (on avance vers lui). */
  var cam = {m:1, mb:1, rx:0, ry:0};
  function camera(m, pw, ax, ay, plat, sx, sy){
    var an = anneaux[actif], mb = plat ? m : (1 + FOND) / (1 / m + FOND);
    ax += sx || 0; ay += sy || 0;
    cV.style.transform = 'translate(' + f(ax - mb * C[0] - mb * sV * pw[0]) + 'px,' + f(ay - mb * C[1] - mb * sV * pw[1]) + 'px) scale(' + mb.toFixed(4) + ')';
    var rx = ax - m * sV * pw[0], ry = ay - m * sV * pw[1], k = m / zf;
    divA.style.transform = 'translate(' + f(rx - cote * k / 2) + 'px,' + f(ry - cote * k / 2) + 'px) scale(' + k.toFixed(4) + ')';
    var hx = ax + mb * sV * (an.main[0] - an.c[0] - pw[0]), hy = ay + mb * sV * (an.main[1] - an.c[1] - pw[1]), bx = rx - m * sV * an.dir[0] * rExt, by = ry - m * sV * an.dir[1] * rExt;
    var dx = bx - hx, dy = by - hy, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, wh = 1.05 * sV * mb, wb = .95 * sV * m, qx = hx - dx / l * 9 * sV * mb, qy = hy - dy / l * 9 * sV * mb;
    peC.setAttribute('d', 'M' + P(qx + nx * wh, qy + ny * wh) + ' L' + P(bx + nx * wb, by + ny * wb) + ' L' + P(bx - nx * wb, by - ny * wb) + ' L' + P(qx - nx * wh, qy - ny * wh) + ' Z'); peC.setAttribute('stroke-width', f(Math.max(1.4, .55 * sV * mb)));
    peR.setAttribute('d', 'M' + P(qx + nx * wh * .35, qy + ny * wh * .35) + ' L' + P(bx + nx * wb * .35, by + ny * wb * .35)); peR.setAttribute('stroke-width', f(.3 * sV * mb));
    cam.m = m; cam.mb = mb; cam.rx = rx; cam.ry = ry; cam.pw = [pw[0], pw[1]]; cam.ax = ax - (sx || 0); cam.ay = ay - (sy || 0);
  }
  /* le zoom entre la place (e = 0) et la vue de tir (e = 1) : les deux dessins bougent ensemble, et se fondent à la fin */
  function zoomer(e){
    var an = anneaux[actif], q = ecranL(an.c[0], an.c[1]), k = sV / sL, kk = Math.pow(k, e), px = q[0] + (C[0] - q[0]) * e, py = q[1] + (C[1] - q[1]) * e;
    cL.style.transform = 'translate(' + f(px - kk * q[0]) + 'px,' + f(py - kk * q[1]) + 'px) scale(' + kk.toFixed(4) + ')';
    camera(kk / k, [0, 0], px, py, true);
    var fondu = lisse((e - .5) / .4);
    cL.style.opacity = (1 - fondu).toFixed(3); cV.style.opacity = svgP.style.opacity = divA.style.opacity = fondu.toFixed(3);
    arcBas(lisse(e));
  }
  /* l'arc : baissé quand on regarde toute la place (on n'en voit que le haut), levé dans la vue de tir */
  function arcBas(e){ svgArc.style.transform = 'translate(' + f(-46 * u * (1 - e)) + 'px,' + f(H * .58 * (1 - e)) + 'px)'; }

  /* ---------- la place entière : les anneaux à toucher (le rond jaune), le vent de chacun ---------- */
  function cibles(){
    var q = '';
    anneaux.forEach(function(an){
      if(an.fait) return;
      var e = ecranL(an.c[0], an.c[1]), r = Math.max(26, rExt * sL + 14), v = Math.abs(an.vent);
      q += '<button type="button" class="vs-cible" data-i="' + an.i + '" style="left:' + f(e[0]) + 'px;top:' + f(e[1]) + 'px;width:' + f(2 * r) + 'px;height:' + f(2 * r) + 'px" aria-label="Viser l\'anneau que tient ' + esc(an.po.nom) + '"><i></i></button>' +
        '<span class="vs-etiq" style="left:' + f(e[0]) + 'px;top:' + f(e[1] - (rExt + 12) * sL - 3) + 'px">' + (an.vent < 0 ? '<i class="vs-et-g"></i>' : '') + '<b>' + v + '</b>' + (an.vent > 0 ? '<i class="vs-et-d"></i>' : '') + '</span>';
    });
    divCibles.innerHTML = q;
  }
  function hud(pouls){
    hFl.textContent = '× ' + fleches;
    var q = ''; for(var i = 0; i < N; i++) q += '<i class="' + (i < chaine.length ? 'fait' : '') + '"></i>'; hAn.innerHTML = q;
    if(pouls){ var c = hFl.parentNode; c.classList.remove('vs-pouls'); void c.offsetWidth; c.classList.add('vs-pouls'); }
  }
  function mot(t, sorte){ divMot.innerHTML = t ? '<b class="vs-mot-' + sorte + '">' + esc(t) + '</b>' : ''; }
  function etre(e){ etat = e; racine.className = 'vs vs-e-' + e + (reduit() ? ' vs-calme' : ''); }
  function confettis(x, y, n, force){
    if(reduit()) return;
    for(var i = 0; i < n; i++){
      var c = document.createElement('i'), a = Math.random() * Math.PI * 2, d = (40 + Math.random() * 110) * force * u;
      c.style.left = f(x) + 'px'; c.style.top = f(y) + 'px'; c.style.background = A.COULEURS[i % A.COULEURS.length];
      c.style.setProperty('--dx', f(Math.cos(a) * d) + 'px'); c.style.setProperty('--dy', f(Math.sin(a) * d * .7 - 30 * u) + 'px'); c.style.setProperty('--r', Math.round(Math.random() * 900 - 450) + 'deg');
      c.style.animationDelay = Math.round(Math.random() * 120) + 'ms'; c.style.animationDuration = Math.round(900 + Math.random() * 700) + 'ms';
      divConf.appendChild(c);
    }
    plusTard(2200, function(){ divConf.innerHTML = ''; });
  }

  /* ---------- on a touché un anneau : la vue de tir s'ouvre ---------- */
  function choisir(i){
    if(etat !== 'large' || arrete) return;
    var an = anneaux[i]; if(!an || an.fait) return;
    actif = i; U.stop(); son('choisir');
    etre('zoom'); mot('');
    cadrerVisee(); dessinerDyn(); arc.dessiner(0, true);
    anim(reduit() ? 0 : .62, function(x){ zoomer(lisse(x)); }, function(){ zoomer(1); etre('vise'); });
  }
  /* ---------- le doigt se pose en bas : l'arc se bande, le curseur apparaît quelque part autour de l'anneau ---------- */
  var doigt = null, cur = {x:0, y:0, vx:0, vy:0}, but = {x:0, y:0}, tBande = 0, dernierTic = 9, arretVise = null;
  function borner(){ but.x = U.borne(but.x, 16, W - 16); but.y = U.borne(but.y, 16, H * (ZONE_BAS + .06)); }
  function poserCurseur(){ divCur.style.transform = 'translate(' + f(cur.x) + 'px,' + f(cur.y) + 'px)'; }
  function bander(){
    etre('bande'); son('bander');
    var a = Math.random() * Math.PI * 2, d = (66 + Math.random() * 38) * u;
    cur.x = U.borne(C[0] + Math.cos(a) * d, 30, W - 30); cur.y = U.borne(C[1] + Math.sin(a) * d * .8, 30, H * ZONE_BAS - 10); cur.vx = cur.vy = 0;
    but.x = cur.x; but.y = cur.y; tBande = 0; dernierTic = 9;
    cuT.setAttribute('stroke-dashoffset', f(2 * Math.PI * 24)); cuT.setAttribute('stroke', '#ffd23f'); poserCurseur();
    arretVise = U.boucle(function(dt){
      if(arrete || etat !== 'bande') return false;
      tBande += dt;
      /* le ressort mou : le curseur va vers le but (là où le doigt l'emmène), avec du retard */
      cur.vx += (OMEGA * OMEGA * (but.x - cur.x) - 2 * AMORTI * OMEGA * cur.vx) * dt; cur.vy += (OMEGA * OMEGA * (but.y - cur.y) - 2 * AMORTI * OMEGA * cur.vy) * dt;
      cur.x += cur.vx * dt; cur.y += cur.vy * dt; poserCurseur();
      /* l'arc se bande (un quart de seconde), puis suit un peu la visée */
      if(tBande < .34) arc.dessiner(lisse(tBande / .28), true);
      svgArc.style.transform = 'translate(' + f((cur.x - C[0]) * .1) + 'px,' + f((cur.y - C[1]) * .1) + 'px)';
      /* le minuteur, autour du curseur ; à la fin, la flèche part toute seule */
      var reste = p.duree - tBande;
      cuT.setAttribute('stroke-dashoffset', f(2 * Math.PI * 24 * Math.max(0, reste / p.duree)));
      if(reste < 1.5){ var n = Math.ceil(reste / .5); if(n < dernierTic){ dernierTic = n; son('tic'); cuT.setAttribute('stroke', '#ff5a4a'); } }
      if(reste <= 0){ tirer(); return false; }
    });
    boucles.push(arretVise);
  }
  function appui(ev){
    if(etat !== 'vise' || arrete) return;
    var r = racine.getBoundingClientRect();
    if(ev.clientY - r.top < H * ZONE_BAS){ divZone.classList.remove('vs-rappel'); void divZone.offsetWidth; divZone.classList.add('vs-rappel'); return; }
    ev.preventDefault();
    try{ racine.setPointerCapture(ev.pointerId); }catch(e){}
    doigt = {id:ev.pointerId, x:ev.clientX, y:ev.clientY};
    bander();
  }
  function glisse(ev){
    if(!doigt || ev.pointerId !== doigt.id) return;
    if(etat === 'bande'){ but.x += ev.clientX - doigt.x; but.y += ev.clientY - doigt.y; borner(); }
    doigt.x = ev.clientX; doigt.y = ev.clientY;
  }
  function leve(ev){
    if(!doigt || ev.pointerId !== doigt.id) return;
    doigt = null;
    if(etat === 'bande') tirer();
  }
  racine.addEventListener('pointerdown', appui);
  racine.addEventListener('pointermove', glisse);
  racine.addEventListener('pointerup', leve);
  racine.addEventListener('pointercancel', leve);
  racine.addEventListener('contextmenu', function(ev){ ev.preventDefault(); });
  divCibles.addEventListener('click', function(ev){ var b = ev.target.closest ? ev.target.closest('.vs-cible') : null; if(b) choisir(+b.dataset.i); });

  /* ---------- la flèche part : la caméra la suit jusqu'à l'anneau ---------- */
  function flecheVol(){ return '<g class="vs-vol"><path class="vs-v-bande" fill="none" stroke="#f4ecdc" stroke-linecap="round"/><g class="vs-v-fanions"></g>' + FLECHE_DOS + '</g>'; }
  /* la banderole que la flèche emporte : une ficelle qui part de la flèche et revient vers nous, de plus en plus grosse */
  function bandeVol(g, x, y, t, passe){
    var bx = W * .42, by = H + 30, mx = (x + bx) / 2 + Math.sin(t * 21) * 9 * u, my = (y + by) / 2 + 24 * u, q = '';
    g.querySelector('.vs-v-bande').setAttribute('d', 'M' + P(x, y) + ' Q' + P(mx, my) + ' ' + P(bx, by));
    g.querySelector('.vs-v-bande').setAttribute('stroke-width', f(1.6 * u));
    for(var i = 0; i < 5; i++){
      var s = .16 + i * .18 - (passe ? passe * .14 : 0); if(s < .04) continue;
      var w = 1 - s, px = w * w * x + 2 * w * s * mx + s * s * bx, py = w * w * y + 2 * w * s * my + s * s * by, k = (.5 + s * 2.2) * u;
      q += '<path transform="translate(' + P(px, py) + ') rotate(' + f(Math.sin(t * 17 + i * 2) * 16) + ') scale(' + k.toFixed(2) + ')" d="M-5,0 H5 L0,12 Z" fill="' + A.COULEURS[i % A.COULEURS.length] + '" stroke="' + K + '" stroke-width="1" stroke-linejoin="round"/>';
    }
    g.querySelector('.vs-v-fanions').innerHTML = q;
  }
  function tirer(){
    if(etat !== 'bande') return;
    etre('vol'); doigt = null;
    var an = anneaux[actif], cw = [(cur.x - C[0]) / sV, (cur.y - C[1]) / sV], dev = an.vent * DEV, imp = [cw[0] + dev, cw[1]], dist = Math.hypot(imp[0], imp[1]);
    var res = dist < p.trou - MARGE ? 'dedans' : (dist <= rExt + MARGE ? 'bois' : 'acote');
    fleches--; hud(true);
    son('lacher'); son('vol'); U.vibrer(15);
    var x0 = cur.x, y0 = cur.y, fin0 = [W / 2, H * .46], dep = arc.pointe(1), sway = [(cur.x - C[0]) * .1, (cur.y - C[1]) * .1];
    svgFx.innerHTML = flecheVol();
    var gV = svgFx.querySelector('.vs-vol'), gF = svgFx.querySelector('.vs-v-f'), tr = svgFx.querySelector('.vs-v-t'), tr2 = svgFx.querySelector('.vs-v-t2');
    anim(reduit() ? .3 : T_VOL, function(t){
      /* la corde claque, l'arc s'en va */
      if(t < .05) arc.dessiner(1 - t / .05, false); else if(t < .32) arc.dessiner(-.07 * Math.sin((t - .05) * 70) * (1 - (t - .05) / .27), false);
      svgArc.style.opacity = (1 - lisse((t - .1) / .25)).toFixed(2);
      svgArc.style.transform = 'translate(' + f(sway[0] - 60 * u * lisse(t / .4)) + 'px,' + f(sway[1] + H * .25 * lisse(t / .4)) + 'px)';
      /* la caméra avance à vitesse constante : l'anneau grossit de plus en plus vite ; le vent pousse la flèche peu à peu */
      var m = 1 / (1 - (1 - 1 / zf) * t), pw = [cw[0] + dev * t * t, cw[1]], e = lisse(t / .4), ax = x0 + (fin0[0] - x0) * e, ay = y0 + (fin0[1] - y0) * e;
      camera(m, pw, ax, ay);
      /* la flèche : elle quitte l'arc, rapetisse, puis reste devant nous ; sa traînée blanche tremble */
      var l = lisse(t / .2), fx = dep[0] + sway[0] + (ax - dep[0] - sway[0]) * l, fy = dep[1] + sway[1] + (ay - dep[1] - sway[1]) * l, k = (2.6 - 1.6 * l) * u;
      gF.setAttribute('transform', 'translate(' + P(fx, fy) + ') rotate(' + f(Math.sin(t * 46) * 3 * (1 - t)) + ') scale(' + k.toFixed(3) + ')');
      tr.setAttribute('transform', 'scale(1,' + (.75 + Math.random() * .5).toFixed(2) + ')'); tr2.setAttribute('opacity', (.25 + Math.random() * .4).toFixed(2));
      bandeVol(gV, fx, fy + 2 * u, t * T_VOL, 0);
    }, function(){ impact(res, imp, fin0); });
  }
  /* ---------- la flèche arrive : dans l'anneau, dans le bois, ou à côté ---------- */
  function impact(res, imp, ou){
    etre('impact');
    var an = anneaux[actif], gV = svgFx.querySelector('.vs-vol'), gF = svgFx.querySelector('.vs-v-f'), m = zf, x = ou[0], y = ou[1];
    if(res === 'bois'){
      son('bois'); U.vibrer(45); mot('Dans le bois !', 'bois'); rates++;
      /* la flèche plantée : la pointe dans le bois, le fût qui revient vers nous, les plumes ; elle vibre */
      svgFx.innerHTML = '<g class="vs-plantee" transform="translate(' + P(x, y) + ') scale(' + u.toFixed(3) + ')"><path d="M-7,-3 L-13,-9 M6,-4 L13,-10 M0,-6 L1,-15 M-8,3 L-15,5 M8,3 L14,6" stroke="#5e3a16" stroke-width="2" stroke-linecap="round"/>' +
        '<g class="vs-pl-f"><path d="M-2,0 L-5,62 Q0,66 5,62 L2,0 Z" fill="#dcbb80" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><path d="M-3.6,40 L-17,48 L-18,68 L-4.6,60 Z" fill="#f4ecdc" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.6,40 L17,48 L18,68 L4.6,60 Z" fill="#f4ecdc" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/><path d="M-3.4,38 L0,31 L3.4,38 L4,62 Q0,66 -4,62 Z" fill="#e5484d" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/></g>' +
        '<circle r="3.6" fill="#3a2410"/></g>';
      var pl = svgFx.querySelector('.vs-pl-f');
      /* le petit choc : l'écran s'arrête net, tremble un instant ; la flèche vibre */
      anim(.6, function(t){
        var a = Math.exp(-t * 7), sx = Math.sin(t * 95) * 7 * u * a, sy = Math.cos(t * 83) * 5 * u * a;
        camera(m, imp, x, y, false, sx, sy);
        svgFx.style.transform = 'translate(' + f(sx) + 'px,' + f(sy) + 'px)';
        pl.setAttribute('transform', 'rotate(' + f(Math.sin(t * 70) * 11 * Math.exp(-t * 5)) + ')');
      }, function(){ svgFx.style.transform = ''; });
      plusTard(1250, revenir);
    } else if(res === 'dedans'){
      son('dedans'); U.vibrer(20); mot('Dans l\'anneau !', 'ok');
      an.fait = true; chaine.push(actif);
      svgA.firstChild.classList.add('vs-touche');
      confettis(cam.rx, cam.ry, 16, 1);
      /* la flèche file à travers le trou, la banderole la suit */
      anim(.55, function(t){
        var k = (1 - .86 * lisse(t / .6)) * u, fx = x + (cam.rx - x) * .25 * t, fy = y - 16 * u * t;
        gF.setAttribute('transform', 'translate(' + P(fx, fy) + ') scale(' + k.toFixed(3) + ')'); gF.setAttribute('opacity', (1 - lisse((t - .6) / .4)).toFixed(2));
        bandeVol(gV, fx, fy, T_VOL + t * .55, t * 3);
        camera(m * (1 + .05 * lisse(t)), imp, x, y);
      });
      plusTard(1350, revenir);
    } else {
      son('acote'); mot('À côté !', 'ko'); rates++;
      anim(.5, function(t){
        var k = (1 - .9 * lisse(t)) * u;
        gF.setAttribute('transform', 'translate(' + P(x, y - 22 * u * t) + ') scale(' + k.toFixed(3) + ')'); gF.setAttribute('opacity', (1 - lisse((t - .4) / .6)).toFixed(2));
        bandeVol(gV, x, y - 22 * u * t, T_VOL + t * .5, t * 2);
        camera(m * (1 + .12 * lisse(t)), imp, x, y);
      });
      plusTard(1150, revenir);
    }
  }
  /* ---------- retour à la place : la banderole se tend jusqu'au nouvel anneau ---------- */
  function revenir(){
    if(arrete) return;
    var m0 = cam.m, pw0 = cam.pw || [0, 0], ax0 = cam.ax, ay0 = cam.ay, pris = anneaux[actif].fait, an = anneaux[actif];
    etre('retour'); mot('');
    svgFx.innerHTML = ''; svgArc.style.opacity = '0';
    /* d'abord la caméra recule jusqu'à la vue de tir, puis la vue de tir redevient la place */
    anim(reduit() ? 0 : .26, function(t){
      var e = lisse(t), m = m0 + (1 - m0) * e;
      camera(m, [pw0[0] * (1 - e), pw0[1] * (1 - e)], ax0 + (C[0] - ax0) * e, ay0 + (C[1] - ay0) * e);
    }, function(){
      actif = an.i; dessinerDyn(false, pris);
      arc.dessiner(0, fleches > 0); svgArc.style.opacity = '';
      anim(reduit() ? 0 : .55, function(t){ zoomer(1 - lisse(t)); }, function(){
        zoomer(0); actif = -1; cL.style.transform = ''; cL.style.opacity = '';
        var restants = anneaux.filter(function(a){ return !a.fait; }).length;
        if(pris){ dessinerDyn(true); son('accroche'); var e = ecranL(an.c[0], an.c[1]); confettis(e[0], e[1], 8, .6); } else dessinerDyn(false);
        hud(); cibles();
        if(!restants){ plusTard(650, fete); etre('fin'); }
        else if(fleches < restants){ etre('fin'); son('vide'); plusTard(1100, function(){ fin({reussi:false, message:fleches ? 'Plus assez de flèches…' : 'Plus de flèches…', detail:'Il restait ' + (restants > 1 ? restants + ' anneaux' : 'un anneau') + ' à décorer.', erreurs:rates}); }); }
        else etre('large');
      });
    });
  }
  /* ---------- les cinq anneaux sont décorés : le bout de la banderole file en haut du mât, la place est en fête ---------- */
  function fete(){
    finie = true; dessinerDyn(true); son('fete');
    racine.classList.add('vs-fete');
    confettis(W * .3, H * .3, 26, 1.6); confettis(W * .7, H * .3, 26, 1.6); confettis(W * .5, H * .2, 20, 1.4);
    plusTard(2100, function(){ fin({reussi:true, message:'La place est décorée !', erreurs:rates, score:Math.max(0, 1 - rates / Math.max(1, p.fleches - N + 1))}); });
  }

  /* ---------- c'est parti ---------- */
  var ro = null;
  if(window.ResizeObserver){ ro = new ResizeObserver(mesurer); ro.observe(el); } else window.addEventListener('resize', mesurer);
  cV.style.opacity = svgP.style.opacity = divA.style.opacity = '0';
  mesurer(); dessinerDyn(); hud(); cibles();
  racine.__visee = {
    etat:function(){ return etat; }, anneaux:anneaux, p:p, DEV:DEV,
    mesures:function(){ return {W:W, H:H, u:u, sV:sV, sL:sL, C:C.slice(), zf:zf, zone:H * ZONE_BAS, fleches:fleches, faits:chaine.slice(), actif:actif}; },
    curseur:function(){ return {x:cur.x, y:cur.y, bx:but.x, by:but.y, reste:p.duree - tBande}; },
    ecran:function(i){ return ecranL(anneaux[i].c[0], anneaux[i].c[1]); },
    choisir:choisir
  };
  return {arreter:function(){
    arrete = true; boucles.forEach(function(b){ try{ b(); }catch(e){} }); minuteurs.forEach(function(t){ clearTimeout(t); });
    if(ro) ro.disconnect(); else window.removeEventListener('resize', mesurer);
  }};
}

MJ.enregistrer('visee', {
  nom:'Les banderoles de la fête', role:'pisteur', ic:'🎏', minuteur:false,
  consigne:'Cinq anneaux de bois attendent leur banderole. Choisis-en un : te voilà en train de le viser. Pose ton doigt en bas de l\'écran : l\'arc se bande et un viseur apparaît. Il suit ton doigt, mais avec du retard. Regarde le vent écrit au-dessus de l\'anneau : il poussera ta flèche. Lève le doigt, la flèche part. Dans le trou, la banderole est accrochée. Dans le bois ou à côté, la flèche est perdue.',
  reglages:function(n, mods){
    var p = {anneaux:5};
    p.reserve = 2 + (mods.erreurs || 0) + (mods.fleches || 0);
    p.fleches = p.anneaux + p.reserve;
    /* la difficulté (Romain) : la taille de l'anneau et la force du vent, rien d'autre */
    p.trou = U.parNiveau(n, 13, 5.2, 4.4) * (mods.zone || 1);
    p.bois = U.parNiveau(n, 4.6, 3.3, 3);
    p.ventMax = Math.max(0, Math.round(U.parNiveau(n, 1, 9, 0, 9) * (mods.stable === undefined ? 1 : mods.stable)));
    p.ventMin = Math.max(0, Math.min(p.ventMax, Math.round(U.parNiveau(n, -0.7, 6))));
    p.duree = 5 + (mods.temps || 0) * .5;
    p.lignes = [
      {nom:'Anneaux', val:String(p.anneaux)},
      {nom:'Flèches', val:p.fleches + ' (' + p.reserve + ' de réserve)'},
      {nom:'Le trou de l\'anneau', val:p.trou > 11 ? 'très grand' : (p.trou > 8.5 ? 'grand' : (p.trou > 6.5 ? 'moyen' : 'petit'))},
      {nom:'Vent', val:p.ventMax <= 1 ? 'presque rien (0 ou 1)' : 'force ' + p.ventMin + ' à ' + p.ventMax},
      {nom:'Le minuteur du curseur', val:MJ.util.fmt(p.duree, 1) + ' secondes, puis la flèche part seule'}
    ];
    return p;
  },
  jouer:jouer
});
MJ.PLEIN_ECRAN = MJ.PLEIN_ECRAN || {}; MJ.PLEIN_ECRAN.visee = 1;
MJ.LARGE = MJ.LARGE || {}; MJ.LARGE.visee = 1;
MJ.PHRASES = MJ.PHRASES || {}; MJ.PHRASES.visee = 'Fais passer la banderole dans les cinq anneaux. Gare au vent !';
/* ==========================================================
   L'explication en images, avant de jouer (MJ.DEMOS.visee) : la main se pose en bas, l'arc se bande, le curseur apparaît
   à côté de l'anneau ; la main glisse, le curseur la suit avec du retard et s'arrête un peu contre le vent ; la main se
   lève, la flèche part, le vent la pousse dans l'anneau, et la banderole y reste accrochée.
   ========================================================== */
MJ.DEMOS = MJ.DEMOS || {};
MJ.DEMOS.visee = {w:300, h:420, f:function(el, prm){
  var id = 'vsd' + (++nUid) + '-', W = 300, H = 420, sD = 2.1, C = [150, 138], vent = 3;
  var trou = Math.min(11, (prm && prm.trou) || 10), bois = (prm && prm.bois) || 4.2, an = unAnneau(A.PORTEURS[3], 3, trou + bois, vent);
  var vb = [an.c[0] - C[0] / sD, an.c[1] - C[1] / sD, W / sD, H / sD].map(f).join(' '), pousse = vent * DEV * sD;
  el.innerHTML = '<div class="vsd"><svg viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + A.monde(id) + anneauPlat(an, id + 'p', trou, bois) + '<g class="vsd-bande" opacity="0">' + banderole([an.c[0] - 30, an.c[1] + 150], an.c, false, 2) + banderole(an.c, [an.c[0] + 7, an.c[1] + 30], false, 5) + '</g></svg>' +
    '<svg class="vsd-arc" viewBox="0 0 300 420" aria-hidden="true"></svg>' +
    '<svg class="vsd-dessus" viewBox="0 0 300 420" aria-hidden="true">' +
      '<g transform="translate(' + P(C[0], C[1] - (trou + bois + 13) * sD - 20) + ')"><rect x="-27" y="-11" width="54" height="22" rx="11" fill="#fff6dc" stroke="' + K + '" stroke-width="2.2"/><g transform="translate(-21,-8) scale(.8)">' + IC_VENT + '</g><text x="12" y="6" text-anchor="middle" font-size="16" font-weight="700" fill="' + K + '">' + vent + '</text>' +
        '<g transform="translate(' + f(-pousse / 2 - 4) + ',13)"><path d="' + flecheVent(pousse) + '" fill="#fff" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/></g></g>' +
      '<g class="vsd-vol" opacity="0"><path class="vsd-fil" fill="none" stroke="#f4ecdc" stroke-width="1.4"/>' + FLECHE_DOS + '</g>' +
      '<g class="vsd-eclat" opacity="0">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function(i){ var a = i * Math.PI / 4; return '<path d="M' + P(Math.cos(a) * 20, Math.sin(a) * 20) + ' L' + P(Math.cos(a) * 34, Math.sin(a) * 34) + '" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>'; }).join('') + '</g>' +
      '<g class="vsd-cur" opacity="0"><g transform="scale(.6)">' + CURSEUR + '</g></g>' +
      '<g class="vsd-main"><circle class="vsd-onde" r="13" fill="none" stroke="#ffd23f" stroke-width="3.4" opacity="0"/><g class="vsd-main-g">' + MAIN + '</g></g></svg></div>';
  var rac = el.firstChild, $ = function(s){ return rac.querySelector(s); };
  var arc = new Arc($('.vsd-arc'), id + 'a'); arc.regler(.4, H); arc.dessiner(0, true);
  var main = $('.vsd-main'), onde = $('.vsd-onde'), mainG = $('.vsd-main-g'), gCur = $('.vsd-cur'), cuT = gCur.querySelector('.vs-cu-t'), gVol = $('.vsd-vol'), gF = gVol.querySelector('.vs-v-f'), fil = $('.vsd-fil'), eclat = $('.vsd-eclat'), bande = $('.vsd-bande'), gAn = rac.querySelector('.vs-an');
  cuT.setAttribute('stroke-dasharray', f(TOUR));
  /* le film (7,8 secondes) : 0,9 la main se pose ; 1,3 → 3,3 elle glisse ; 3,8 elle se lève, la flèche part ; 4,7 la flèche passe */
  var T_POSE = .9, T_LEVE = 3.8, T_PASSE = 4.7, P0 = 7.8, M0 = [150, 348], M1 = [84, 383];
  function doigt(t){
    if(t < T_POSE){ var a = lisse(t / T_POSE); return [214 + (M0[0] - 214) * a, 404 + (M0[1] - 404) * a]; }
    if(t < T_LEVE){ var b = lisse((t - 1.3) / 2); return [M0[0] + (M1[0] - M0[0]) * b, M0[1] + (M1[1] - M0[1]) * b]; }
    var c = lisse((t - T_LEVE - .2) / .9); return [M1[0] + (214 - M1[0]) * c, M1[1] + (404 - M1[1]) * c];
  }
  /* le curseur part d'un endroit « au hasard » ; il doit finir un peu contre le vent (le vent poussera la flèche d'autant) */
  var arrivee = [C[0] - pousse, C[1]], depart = [arrivee[0] - (M1[0] - M0[0]), arrivee[1] - (M1[1] - M0[1])], sim = {t:-1, x:0, y:0, vx:0, vy:0}, vu = {d:-1, f:null};
  function curseur(t){
    if(sim.t < 0 || t < sim.t){ sim.t = T_POSE; sim.x = depart[0]; sim.y = depart[1]; sim.vx = sim.vy = 0; }
    var fin2 = Math.min(t, T_LEVE);
    while(sim.t < fin2){
      var dt = Math.min(1 / 60, fin2 - sim.t), d = doigt(sim.t), bx = depart[0] + d[0] - M0[0], by = depart[1] + d[1] - M0[1];
      sim.vx += (OMEGA * OMEGA * (bx - sim.x) - 2 * AMORTI * OMEGA * sim.vx) * dt; sim.vy += (OMEGA * OMEGA * (by - sim.y) - 2 * AMORTI * OMEGA * sim.vy) * dt;
      sim.x += sim.vx * dt; sim.y += sim.vy * dt; sim.t += dt;
    }
    return [sim.x, sim.y];
  }
  function image(t){
    var d = doigt(t), appuie = t >= T_POSE && t < T_LEVE, r = 13, op = appuie ? .85 : 0;
    main.setAttribute('transform', 'translate(' + P(d[0], d[1]) + ')'); mainG.setAttribute('transform', appuie ? 'scale(.9)' : '');
    if(t >= T_POSE && t < T_POSE + .5){ var a = (t - T_POSE) / .5; r = 9 + 24 * a; op = 1 - a * .15; }
    onde.setAttribute('r', f(r)); onde.setAttribute('opacity', op.toFixed(2));
    /* l'arc se bande, puis la corde claque */
    var da = t < T_POSE ? 0 : (t < T_LEVE ? lisse((t - T_POSE) / .3) : (t < T_LEVE + .05 ? 1 - (t - T_LEVE) / .05 : 0)), fa = t < T_LEVE || t > 6.6;
    if(da !== vu.d || fa !== vu.f){ vu.d = da; vu.f = fa; arc.dessiner(da, fa); }
    /* le curseur et son minuteur */
    if(t >= T_POSE + .05 && t < T_LEVE){ var c = curseur(t); gCur.setAttribute('opacity', '1'); gCur.setAttribute('transform', 'translate(' + P(c[0], c[1]) + ')'); cuT.setAttribute('stroke-dashoffset', f(TOUR * (1 - (t - T_POSE) / 5))); }
    else gCur.setAttribute('opacity', '0');
    /* la flèche : elle quitte l'arc, file vers l'anneau en rapetissant, et le vent la pousse jusqu'au milieu */
    if(t >= T_LEVE && t < T_PASSE + .3){
      var c2 = curseur(T_LEVE), v = (t - T_LEVE) / (T_PASSE - T_LEVE), l = lisse(v / .25), pt = arc.pointe(1);
      var x = pt[0] + (c2[0] - pt[0]) * l + pousse * Math.min(1, v) * Math.min(1, v), y = pt[1] + (c2[1] - pt[1]) * l, k = 1.3 - .75 * lisse(Math.min(1, v)) - (v > 1 ? (v - 1) * .5 : 0);
      gVol.setAttribute('opacity', (1 - lisse((t - T_PASSE) / .3)).toFixed(2)); gF.setAttribute('transform', 'translate(' + P(x, y) + ') scale(' + Math.max(.1, k).toFixed(2) + ')');
      fil.setAttribute('d', 'M' + P(x, y) + ' Q' + P((x + 120) / 2, (y + 440) / 2 + 14) + ' 120,440');
    } else gVol.setAttribute('opacity', '0');
    /* elle passe : un éclat, l'anneau se balance, la banderole reste */
    var e = (t - T_PASSE) / .5;
    eclat.setAttribute('opacity', e > 0 && e < 1 ? (1 - e).toFixed(2) : '0'); eclat.setAttribute('transform', 'translate(' + P(C[0], C[1]) + ') scale(' + (.6 + .7 * Math.max(0, Math.min(1, e))).toFixed(2) + ')');
    bande.setAttribute('opacity', (lisse((t - T_PASSE) / .3) * (1 - lisse((t - 7) / .5))).toFixed(2));
    gAn.setAttribute('transform', 'rotate(' + f(t > T_PASSE && t < T_PASSE + 1 ? Math.sin((t - T_PASSE) * 13) * 5 * (1 - (t - T_PASSE)) : 0) + ' ' + P(an.bout[0], an.bout[1]) + ')');
  }
  if(reduit()){ image(3.6); return {arreter:function(){}}; }
  image(0);
  var stop = U.boucle(function(dt, T){ if(!rac.isConnected) return false; image(el.__rgFige !== undefined ? el.__rgFige : T % P0); });
  el.__rgImage = image;   /* pour les essais : el.__rgFige = 3.6 arrête le film sur cet instant */
  return {arreter:stop};
}};
MJ.VISEE = {Arc:Arc, lisse:lisse, DEV:DEV};
})();
