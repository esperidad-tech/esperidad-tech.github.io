/* ==========================================================
   LE GÂTEAU DE LA FÊTE (Alchimiste) — le jeu (Romain, 11 novembre 2026, 19 h 48)
   « un mini-jeu avec plein d'options pour faire au moins 300 000 ou 500 000 gâteaux différents […] des gâteaux à 4 étages
     avec plein de décorations farfelues, qu'on puisse placer n'importe où […] des icônes de chaque côté du gâteau […]
     quand on clique sur les icônes, ils sont un petit peu animés, avec des petites bulles, toujours avec les mêmes bruits ;
     quand on pose les éléments, des bruits pour chaque catégorie de décoration ; on peut les déplacer où on veut ;
     quand on appuie dessus, ça les fait tourner (dans le sens des aiguilles d'une montre). »

   - Pas de cœurs, on ne perd jamais : on fabrique, puis « C'est prêt ! ». Un minuteur de 10 minutes (Romain : 5 minutes
     à 20 h 29, 15 minutes à 21 h 31, 10 minutes le 12 novembre à 21 h 34) : à zéro, le gâteau part à la fête tel qu'il est.
   - De jour, des couleurs très vives, de petits éclats qui scintillent sur le gâteau, et 46 décorations sur 80 qui bougent
     toutes seules (Romain, 20 h 29 : « un quart des décorations animées » ; 21 h 31 : « encore des décorations animées »).
   - À gauche, ce dont le gâteau est fait (étages, pâte, glaçage, motif, crème, table) : le choix s'applique à l'étage choisi
     (on touche un étage, ou son numéro dans la petite bulle du titre). La dernière icône, « Couleurs », est un pinceau
     (Romain, 20 h 39 : « personnaliser les couleurs de tous les éléments ») : on choisit une couleur, puis on touche ce qu'on
     veut repeindre — une décoration, la pâte, le glaçage, le motif, la crème d'un étage, le plat, la nappe.
   - À droite, les décorations (fruits, fleurs, bonbons, fête, farfelu, paillettes, chantilly) : on touche une bulle
     (ou on la tire jusqu'au gâteau), on déplace au doigt, un petit coup de doigt fait tourner d'un huitième de tour.
   - Les dessins et les listes sont dans mj-gateau-dessins.js (MJ.GATEAU_ART) ; les sons du gâteau sont ici (sonsGateau),
     et dans l'Atelier des sons (donjon/essai/sons/gateau.js) pour que Romain les écoute.
   - fin({reussi:true, gateau:{…}}) : le résumé du gâteau, pour une future « commande de Gaspard » (rien n'en dépend encore).
   MJ.GATEAU.compte() : le nombre de gâteaux différents, sans compter une seule décoration.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ = window.MJ || {}, U = MJ.util, A = MJ.GATEAU_ART;
if(!U || !A) return;
var K = A.K, f1 = A.f1, sombre = A.sombre, clair = A.clair;
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
var nUid = 0; function uid(){ return 'gt' + (++nUid) + '-'; }
function reduit(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function lum(c){ return (0.299 * parseInt(c.substr(1, 2), 16) + 0.587 * parseInt(c.substr(3, 2), 16) + 0.114 * parseInt(c.substr(5, 2), 16)) / 255; }

/* >>> LES SONS DU GÂTEAU (ce bloc est recopié tel quel dans l'Atelier des sons : donjon/essai/construire-sons.py)
   Les mêmes briques que le jeu (moteur-base.js) et que le labo : des notes douces, des souffles, de petits grains. Tout est discret. */
function sonsGateau(audio, sortie){
  function tendre(f, t0, duree, vol, glisse, att, type, filtre){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
    g.connect(sortie(a)); o.start(t); o.stop(t + duree + 0.03);
  }
  /* un souffle : du bruit filtré dont la hauteur glisse de f0 à f1 */
  function souffle(t0, duree, vol, f0, f1, q, type){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
    f.type = type || 'bandpass'; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.06, duree * .3)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* de tout petits grains secs (le sucre, les paillettes) */
  function grains(t0, duree, vol, nb, passeHaut){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr * duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var k = 0; k < nb; k++){ var c = Math.floor(n * Math.random() * .9), l = Math.floor(sr * (.001 + Math.random() * .004)), v = .4 + Math.random() * .6; for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random() * 2 - 1) * v * (1 - j / l); }
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = passeHaut || 2400; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  return {
    /* ce dont le gâteau est fait */
    etage:function(){ souffle(0, .12, .02, 700, 300, .8, 'lowpass'); tendre(196, .02, .17, .075, 128, .006, 'triangle', 700); tendre(523, .13, .1, .034, null, .008); tendre(784, .21, .18, .03, null, .01); },   /* un étage se pose : « poum », puis deux notes contentes */
    etageMoins:function(){ tendre(659, 0, .09, .034, 523, .008); tendre(392, .08, .15, .04, 262, .01, 'triangle', 900); },                                                                              /* on en retire un */
    forme:function(){ tendre(440, 0, .06, .04, 587, .005, 'triangle', 1500); tendre(660, .075, .09, .034, 880, .005, 'triangle', 1800); },                                                               /* le moule change : toc-toc */
    penche:function(){ tendre(520, 0, .2, .034, 330, .02); tendre(330, .19, .17, .03, 440, .02); },                                                                                                    /* oups, ça penche */
    pate:function(){ souffle(0, .1, .024, 520, 240, .9, 'lowpass'); tendre(220, 0, .15, .06, 147, .01); tendre(294, .11, .1, .03, 262, .008); },                                                         /* la pâte : un « plof » moelleux */
    glacage:function(){ souffle(0, .3, .026, 2400, 900, .9); tendre(880, .04, .26, .02, 440, .03); tendre(1319, .31, .08, .02, 988, .004); },                                                            /* le glaçage glisse, une goutte tombe */
    motif:function(){ [0, .07, .14].forEach(function(t, i){ tendre(988 + i * 131, t, .05, .028, null, .004, 'triangle', 2600); }); },                                                                  /* trois petits coups de pinceau */
    creme:function(){ for(var i = 0; i < 5; i++){ souffle(i * .07, .06, .028, 1700 + i * 300, 2500 + i * 300, 1.2); tendre(587 + i * 98, i * .07, .05, .018, null, .005); } },                            /* la poche à douille : psch-psch-psch */
    plat:function(){ tendre(1760, 0, .32, .034, null, .003); tendre(2637, .004, .22, .015, null, .003); tendre(3520, .008, .12, .007, null, .003); },                                                    /* la porcelaine tinte */
    nappe:function(){ souffle(0, .4, .038, 500, 1500, .6); souffle(.24, .26, .024, 1500, 600, .6); },                                                                                                  /* on secoue la nappe */
    /* une décoration posée : un bruit par famille */
    fruit:function(){ tendre(700, 0, .07, .05, 300, .004); tendre(300, .05, .13, .045, 180, .006); tendre(1400, .14, .05, .014, 900, .003); },                                                           /* un « ploc » juteux */
    fleur:function(){ souffle(0, .22, .008, 3000, 5200, .7); tendre(1047, 0, .36, .03, null, .01); tendre(1319, .08, .4, .026, null, .01); tendre(1568, .16, .5, .018, null, .012); },                   /* trois notes de harpe, un souffle */
    bonbon:function(){ tendre(1800, 0, .03, .04, null, .002, 'triangle', 5000); tendre(2400, .06, .03, .034, null, .002, 'triangle', 6000); tendre(1175, .115, .07, .03, 1568, .003); },                 /* tic-tac sucré */
    fete:function(){ [1568, 2093, 2637, 3136].forEach(function(f, i){ tendre(f, i * .045, .2, .022, null, .004); }); grains(0, .26, .012, 14, 5000); },                                                  /* « tzing ! » : des étincelles */
    farfelu:function(){ tendre(196, 0, .13, .055, 494, .008, 'triangle', 1600); tendre(494, .11, .2, .045, 233, .01, 'triangle', 1600); tendre(659, .33, .07, .026, 587, .005, 'triangle', 1400); },     /* « boïng… couic » */
    paillettes:function(){ grains(0, .36, .03, 40, 4200); tendre(2637, .02, .12, .012, null, .004); tendre(3136, .1, .12, .01, null, .004); tendre(3520, .18, .14, .008, null, .004); },                 /* une pincée qui scintille */
    chantilly:function(){ souffle(0, .3, .04, 900, 2200, .7); tendre(262, .28, .1, .045, 180, .006); },                                                                                                /* « pfffrt… plop » */
    /* les gestes */
    prend:function(){ tendre(520, 0, .06, .034, 780, .005); },                                                                                                                                         /* on la soulève */
    tourne:function(){ grains(0, .07, .028, 7, 2000); tendre(784, .01, .08, .03, 988, .006, 'triangle', 2400); },                                                                                      /* un cran : cric */
    poubelle:function(){ tendre(900, 0, .25, .034, 200, .01); tendre(110, .24, .12, .06, 70, .004, 'triangle', 500); },                                                                                /* ça siffle et ça tombe */
    annule:function(){ souffle(0, .16, .022, 1400, 500, .8); tendre(587, 0, .1, .03, 440, .008); },                                                                                                    /* un pas en arrière */
    pinceau:function(){ souffle(0, .17, .03, 900, 2300, .8); tendre(659, .03, .09, .03, 880, .006); tendre(1319, .1, .1, .014, null, .006); },                                                         /* un coup de pinceau */
    plein:function(){ tendre(330, 0, .12, .05, 294, .01, 'triangle', 1100); tendre(262, .1, .18, .045, 233, .01, 'triangle', 900); },                                                                  /* plus de place ! */
    /* la fête */
    bravo:function(){ [523, 659, 784, 1047, 1319, 1568].forEach(function(f, i){ tendre(f, i * .09, .3, .055, null, .01, 'triangle', 3000); });
      tendre(1047, .6, .95, .04, null, .02); tendre(1319, .6, .95, .03, null, .02); tendre(1568, .6, .95, .024, null, .02); grains(.55, .8, .016, 50, 5000); },                                        /* « C'est prêt ! » */
    confetti:function(){ for(var i = 0; i < 5; i++){ var f = 600 + Math.random() * 900; tendre(f, i * .08 + Math.random() * .03, .06, .022, f * 1.5, .005); } }                                         /* petits « pop » de la fête */
  };
}
/* <<< LES SONS DU GÂTEAU */
var ctxA = null;
function audio(){
  try{ if(window.Brume && Brume.sonActif && !Brume.sonActif()) return null; }catch(e){}
  try{ if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; }catch(e){}
  if(!ctxA){ try{ var AC = window.AudioContext || window.webkitAudioContext; ctxA = AC ? new AC() : null; }catch(e){ ctxA = null; } }
  if(ctxA && ctxA.state === 'suspended') try{ ctxA.resume(); }catch(e){}
  return ctxA;
}
var SONS = sonsGateau(audio, function(a){ return a.destination; });
function son(nom){ try{ if(SONS[nom]) SONS[nom](); }catch(e){} }
/* les petits « pop » des bulles : ceux des pastilles de la carte (moteur-base.js) */
function pops(n){ try{ if(window.Brume && Brume.son) Brume.son('pastilles', Math.max(1, Math.min(6, n))); }catch(e){} }

/* ---------- Le gâteau : sa géométrie ----------
   La scène : 640 de large ; le gâteau au milieu (x = 320), posé sur le plat (y = 538). Chaque étage est dessiné autour de
   (0,0) = le milieu de sa base ; un étage « penché » est couché de 9° (skewX) et pousse de côté les étages du dessus. */
var CX = 320, BASE = 538, LARG = [400, 320, 244, 172], HAUT = [92, 86, 80, 74], APLAT = 0.087, PENCHE = Math.tan(9 * Math.PI / 180);
var MAX_ETAGES = 4, MAX_DECOS = 80;
var DUREE = 600;   /* dix minutes pour faire le gâteau (Romain, 11 novembre : « un timer de 5 minutes » à 20 h 29, puis « de 15 minutes » à 21 h 31 ;
                      12 novembre, 21 h 34 : « qu'il dure uniquement 10 minutes », tout le monde fait le sien en même temps) ; à zéro, il part à la fête tel qu'il est */
var HAUT_VUE = 590, DY = 32;   /* ce qu'on voit toujours de la scène : de y = 32 à y = 622 */
function geo(etages){
  var g = [], cx = CX, y = BASE;
  etages.forEach(function(t, k){
    var h = HAUT[k], r = LARG[k] / 2, s = t.penche ? (k % 2 ? -1 : 1) * h * PENCHE : 0;
    g.push({k:k, cx:cx, yB:y, yT:y - h, r:r, h:h, e:r * APLAT, s:s, dir:k % 2 ? -1 : 1});
    cx += s; y -= h;
  });
  return g;
}
function P(x, y){ return f1(x) + ',' + f1(y); }
/* la forme d'un étage : son côté (ce qu'on voit de face), son dessus, la hauteur du bord du bas à l'abscisse x, le tour du dessus */
function forme(idf, r, h, e){
  var F = {}, i, a;
  if(idf === 'carre'){
    var av = .62 * e, ar = .95 * e, ren = 1.5 * e;
    F.bas = function(){ return av; };
    F.cote = 'M' + P(-r, -h + av) + ' L' + P(-r, av) + ' L' + P(r, av) + ' L' + P(r, -h + av) + ' Z';
    F.dessus = 'M' + P(-r, -h + av) + ' L' + P(r, -h + av) + ' L' + P(r - ren, -h - ar) + ' L' + P(-r + ren, -h - ar) + ' Z';
    F.tour = [[-r, -h + av], [r, -h + av], [r - ren, -h - ar], [-r + ren, -h - ar]];
  } else if(idf === 'pans'){
    var c = .52 * r, f = .8 * e;
    F.bas = function(x){ x = Math.abs(x); return x <= c ? f : f * Math.max(0, r - x) / (r - c); };
    F.cote = 'M' + P(-r, -h) + ' L' + P(-r, 0) + ' L' + P(-c, f) + ' L' + P(c, f) + ' L' + P(r, 0) + ' L' + P(r, -h) + ' L' + P(c, -h + f) + ' L' + P(-c, -h + f) + ' Z';
    F.dessus = 'M' + P(-r, -h) + ' L' + P(-c, -h + f) + ' L' + P(c, -h + f) + ' L' + P(r, -h) + ' L' + P(c, -h - f) + ' L' + P(-c, -h - f) + ' Z';
    F.tour = [[-r, -h], [-c, -h + f], [c, -h + f], [r, -h], [c, -h - f], [-c, -h - f]];
    F.faces = '<path d="M' + P(-r, -h) + ' L' + P(-r, 0) + ' L' + P(-c, f) + ' L' + P(-c, -h + f) + ' Z" fill="#fff" opacity=".17"/><path d="M' + P(r, -h) + ' L' + P(r, 0) + ' L' + P(c, f) + ' L' + P(c, -h + f) + ' Z" fill="#1c1026" opacity=".22"/>';
    F.aretes = 'M' + P(-c, -h + f) + ' L' + P(-c, f) + ' M' + P(c, -h + f) + ' L' + P(c, f);
  } else {
    F.bas = function(x){ var u = x / r; return e * Math.sqrt(Math.max(0, 1 - u * u)); };
    F.tour = []; for(i = 0; i < 72; i++){ a = i * Math.PI / 36; F.tour.push([r * Math.cos(a), -h + e * Math.sin(a)]); }
    if(idf === 'cannele'){
      /* un moule cannelé : le bord fait de petites vagues (9 devant), des rainures de haut en bas */
      var N = 9, g = 4.6, pts = [], ctl = [], d, j;
      for(i = 0; i <= N; i++){ a = Math.PI - i * Math.PI / N; pts.push([r * Math.cos(a), e * Math.sin(a)]); }
      for(i = 0; i < N; i++){ a = Math.PI - (i + .5) * Math.PI / N; ctl.push([(r + g) * Math.cos(a), (e + g) * Math.sin(a)]); }
      d = 'M' + P(-r, -h) + ' L' + P(-r, 0);
      for(i = 0; i < N; i++) d += ' Q' + P(ctl[i][0], ctl[i][1]) + ' ' + P(pts[i + 1][0], pts[i + 1][1]);
      d += ' L' + P(r, -h);
      for(i = N - 1; i >= 0; i--) d += ' Q' + P(ctl[i][0], ctl[i][1] - h) + ' ' + P(pts[i][0], pts[i][1] - h);
      F.cote = d + ' Z';
      d = 'M' + P(r, -h);
      for(j = 0; j < 2 * N; j++){ a = (j + .5) * Math.PI / N; var b = (j + 1) * Math.PI / N; d += ' Q' + P((r + g) * Math.cos(a), -h + (e + g) * Math.sin(a)) + ' ' + P(r * Math.cos(b), -h + e * Math.sin(b)); }
      F.dessus = d + ' Z';
      F.aretes = ''; for(i = 1; i < N; i++) F.aretes += 'M' + P(pts[i][0], pts[i][1] - h) + ' L' + P(pts[i][0], pts[i][1]) + ' ';
      F.fin = true;   /* des arêtes fines */
    } else {
      F.cote = 'M' + P(-r, -h) + ' L' + P(-r, 0) + ' A' + P(r, e) + ' 0 0 0 ' + P(r, 0) + ' L' + P(r, -h) + ' A' + P(r, e) + ' 0 0 1 ' + P(-r, -h) + ' Z';
      F.dessus = 'M' + P(-r, -h) + ' A' + P(r, e) + ' 0 1 0 ' + P(r, -h) + ' A' + P(r, e) + ' 0 1 0 ' + P(-r, -h) + ' Z';
    }
  }
  F.rond = idf === 'rond' || idf === 'cannele';
  return F;
}
/* des points à pas réguliers le long d'un tour fermé (pour la bordure de crème) */
function semer(tour, pas){
  var L = 0, seg = [], n = tour.length, i, j, out = [];
  for(i = 0; i < n; i++){ var p = tour[i], q = tour[(i + 1) % n], d = Math.sqrt((q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1])); seg.push(d); L += d; }
  var nb = Math.max(4, Math.round(L / pas)), acc = 0; i = 0;
  for(j = 0; j < nb; j++){
    var cible = L * j / nb;
    while(i < n - 1 && acc + seg[i] < cible){ acc += seg[i]; i++; }
    var u = (cible - acc) / (seg[i] || 1), a = tour[i], b = tour[(i + 1) % n];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}
var PLEINS = {lisse:1, pois:1, rayures:1, vagues:1};   /* ces motifs couvrent tout le côté (on ne voit plus la pâte) */
/* la couleur qui se voit sur un glaçage (les pois, les rayures, les vagues) */
function contraste(G){ return G.arc ? '#ffffff' : (lum(G.c) > .85 ? '#f79ab8' : (lum(G.c) < .3 ? clair(G.c, .55) : clair(G.c, .8))); }
/* Un étage, dessiné autour de (0,0) = le milieu de sa base. t : ses choix ; g : sa géométrie ; id : le préfixe des dégradés */
function etageSVG(t, g, id, choisi){
  var r = g.r, h = g.h, e = g.e, k = g.k, F = forme(t.forme, r, h, e), Pa = A.pate(t.pate), G = t.glacage ? A.glac(t.glacage) : null;
  var cid = id + 'c' + k, R = A.graine(k * 31 + 7), x, i, d;
  var plein = !!(G && PLEINS[t.motif]), cG = G ? (G.arc ? 'url(#' + id + 'arcG)' : G.c) : null, cGs = G ? (G.arc ? '#b07ab0' : sombre(G.c, .32)) : null;
  function y0(x){ return -h + F.bas(Math.max(-r, Math.min(r, x))); }   /* le bord du haut, vu de face */
  var s = '<clipPath id="' + cid + '"><path d="' + F.cote + '"/></clipPath>';
  s += '<ellipse cx="0" cy="1.5" rx="' + f1(r + 6) + '" ry="' + f1(e + 2.5) + '" fill="#1c1026" opacity=".22"/>';   /* son ombre sur ce qui le porte */
  s += '<path data-p="' + (plein ? 'glacage' : 'pate') + '" d="' + F.cote + '" fill="' + (plein ? (G.arc ? '#f8adc8' : G.c) : Pa.c) + '"/><g clip-path="url(#' + cid + ')">';
  if(!plein){
    if(Pa.arc) ['#2fa8ff', '#3fe06a', '#ffe21f', '#ff8a12', '#ff3f8e'].forEach(function(c, n){ s += '<path data-p="pate" d="' + F.cote + '" transform="translate(0,' + f1(-n * h / 5) + ')" fill="' + c + '"/>'; });
    else {
      /* la crème entre les deux moitiés du gâteau, et quelques miettes */
      d = ''; for(x = -r; x <= r + .1; x += r / 12) d += (d ? ' L' : 'M') + P(x, F.bas(x) - h * .47);
      s += '<path d="' + d + '" fill="none" stroke="' + (lum(Pa.c) > .82 ? '#ff8fb4' : '#fff6dc') + '" stroke-width="' + f1(h * .1) + '" pointer-events="none"/>';
      var cm = lum(Pa.c) < .3 ? clair(Pa.c, .25) : sombre(Pa.c, .2);
      for(i = 0; i < Math.round(r / 4); i++){ x = (R() * 2 - 1) * r * .96; var fy = R(); if(fy > .38 && fy < .56) continue; s += '<circle cx="' + f1(x) + '" cy="' + f1(F.bas(x) - 4 - fy * (h - 9)) + '" r="' + f1(1.2 + R() * 1.3) + '" fill="' + cm + '" opacity=".75" pointer-events="none"/>'; }
    }
    if(G){
      /* le glaçage qui descend du dessus : en coulures, ou jusqu'à la moitié */
      var haut = -h - 2 * e - 8, xa, xb;
      d = 'M' + P(-r - 8, haut) + ' L' + P(r + 8, haut);
      if(t.motif === 'moitie'){ for(x = r + 8; x >= -r - 8.1; x -= 8) d += ' L' + P(x, y0(x) + h * .5 + 4.5 * Math.sin(x * .075 + k * 1.7)); }
      else {
        var b0 = h * .17; d += ' L' + P(r + 8, y0(r) + b0); x = r - 3 - R() * 10;
        while(x > -r + 10){
          var w = 13 + R() * 9, len = h * (.14 + R() * .5); xa = x; xb = x - w; if(xb < -r + 2) break;
          var ya = y0(xa) + b0, yb = y0(xb) + b0, xm = (xa + xb) / 2, ym = y0(xm) + b0 + len;
          d += ' L' + P(xa, ya) + ' C' + P(xa, ya + len * .7) + ' ' + P(xa - w * .06, ym) + ' ' + P(xm, ym) + ' C' + P(xb + w * .06, ym) + ' ' + P(xb, yb + len * .7) + ' ' + P(xb, yb);
          var xn = xb - (9 + R() * 24); if(xn > -r + 10) d += ' Q' + P((xb + xn) / 2, y0((xb + xn) / 2) + b0 + 5) + ' ' + P(xn, y0(xn) + b0);
          x = xn;
        }
        d += ' L' + P(-r - 8, y0(-r) + b0);
      }
      s += '<path data-p="glacage" d="' + d + ' Z" fill="' + cG + '" stroke="' + cGs + '" stroke-width="2.2" stroke-linejoin="round"/>';
    }
  } else {
    var cc = t.motifC || contraste(G);
    if(G.arc) s += '<path data-p="glacage" d="' + F.cote + '" fill="' + cG + '"/>';
    s += '<g data-p="motif">';
    if(t.motif === 'pois'){
      [.24, .5, .76].forEach(function(fr, n){ for(x = -r + (n % 2 ? 22 : 8); x < r; x += 28) s += '<circle cx="' + f1(x) + '" cy="' + f1(y0(x) + fr * h) + '" r="5.2" fill="' + cc + '"/>'; });
    } else if(t.motif === 'rayures'){
      if(F.rond){ for(i = -5; i <= 5; i++){ var ph = i * 16.4 * Math.PI / 180, w2 = 11 * Math.cos(ph) + 1.5; s += '<rect x="' + f1(r * Math.sin(ph) - w2 / 2) + '" y="' + f1(-h - 2 * e) + '" width="' + f1(w2) + '" height="' + f1(h + 4 * e) + '" fill="' + cc + '"/>'; } }
      else for(x = -r + 12; x < r - 6; x += 26) s += '<rect x="' + f1(x) + '" y="' + f1(-h - 2 * e) + '" width="12" height="' + f1(h + 4 * e) + '" fill="' + cc + '"/>';
    } else if(t.motif === 'vagues'){
      [.27, .52, .77].forEach(function(fr, n){ d = ''; for(x = -r; x <= r + .1; x += 5) d += (d ? ' L' : 'M') + P(x, y0(x) + fr * h + 4.2 * Math.sin(x * .11 + n * 1.3)); s += '<path d="' + d + '" fill="none" stroke="' + cc + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'; });
    }
    s += '</g>';
  }
  /* le volume : clair à gauche, sombre à droite ; un reflet sous le bord ; un peu d'ombre en bas */
  s += '<g pointer-events="none">' + (F.faces ? F.faces : '<path d="' + F.cote + '" fill="url(#' + id + 'ombre)"/>');
  if(G){ d = ''; for(x = -r * .82; x <= -r * .2; x += r / 12) d += (d ? ' L' : 'M') + P(x, y0(x) + 7); s += '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".6"/>'; }
  d = ''; for(x = -r; x <= r + .1; x += r / 12) d += (d ? ' L' : 'M') + P(x, F.bas(x) - 3);
  s += '<path d="' + d + '" fill="none" stroke="#1c1026" stroke-width="9" opacity=".1"/></g></g>';
  if(F.aretes) s += '<path d="' + F.aretes + '" fill="none" stroke="' + K + '" stroke-width="' + (F.fin ? 1.6 : 2.4) + '" stroke-linecap="round" opacity="' + (F.fin ? .38 : .8) + '"/>';
  s += '<path d="' + F.cote + '" fill="none" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>';
  /* le dessus */
  var cD = G ? cG : (Pa.arc ? '#f6dd9a' : (lum(Pa.c) < .3 ? clair(Pa.c, .16) : clair(Pa.c, .22)));
  s += '<path data-p="' + (G ? 'glacage' : 'pate') + '" d="' + F.dessus + '" fill="' + cD + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>';
  s += '<ellipse pointer-events="none" cx="' + f1(-r * .34) + '" cy="' + f1(-h - e * .12) + '" rx="' + f1(r * .36) + '" ry="' + f1(e * .3) + '" fill="#fff" opacity=".36"/>';
  /* la bordure de crème, tout autour du dessus (celles du fond d'abord) */
  if(t.creme){
    var cC = A.glac(t.cremeC || 'blanc').c, pas = {perles:11, rosettes:15.5, festons:16, etoiles:16, nuages:19.5}[t.creme] || 15;
    var pts = semer(F.tour, pas).sort(function(a, b){ return a[1] - b[1]; }), yMin = -h - e, yMax = -h + e;
    s += '<g data-p="creme">';
    pts.forEach(function(p){
      var u = Math.max(0, Math.min(1, (p[1] - yMin) / ((yMax - yMin) || 1)));
      if(t.creme === 'festons' && p[1] < -h - .01) return;   /* les festons pendent devant seulement */
      s += '<g transform="translate(' + P(p[0], p[1] + (t.creme === 'festons' ? 3 : 0)) + ')">' + A.bouleCreme(t.creme, cC, .8 + .22 * u) + '</g>';
    });
    s += '</g>';
  }
  /* il étincelle (Romain, 11 novembre, 20 h 29) : de petits éclats s'allument et s'éteignent, chacun à son tour */
  for(i = 0; i < 4; i++){
    x = (R() * 2 - 1) * r * .86; var ye = i === 0 ? -h + (R() - .5) * e : y0(x) + (.14 + R() * .72) * h;
    s += '<g transform="translate(' + P(x, ye) + ') scale(' + f1(.7 + R() * .7) + ')"><path class="gt-eclat" style="animation-delay:' + f1(-R() * 2.6) + 's" d="M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10 Z" fill="#fff" stroke="#ffd21f" stroke-width="1.3"/></g>';
  }
  if(choisi) s += '<path class="gt-sel" d="' + F.cote + ' ' + F.dessus + '"/>';
  return s;
}
/* tout le gâteau (opts.neuf : l'étage qui vient de se poser ; opts.pouf : celui qui vient de changer ; opts.choisi : celui qu'on montre) */
function gateauSVG(etages, id, opts){
  opts = opts || {};
  return geo(etages).map(function(g){
    var t = etages[g.k];
    return '<g class="gt-etage" data-k="' + g.k + '" transform="translate(' + P(g.cx, g.yB) + ')' + (g.s ? ' skewX(' + (-g.dir * 9) + ')' : '') + '">' +
      '<g class="gt-e-in' + (opts.neuf === g.k ? ' gt-tombe' : (opts.pouf === g.k ? ' gt-pouf' : '')) + '">' + etageSVG(t, g, id, opts.choisi === g.k) + '</g></g>';
  }).join('');
}
function etageNeuf(){ return {forme:'rond', penche:false, pate:'vanille', glacage:'rose', motif:'coulant', creme:null, cremeC:'blanc'}; }

/* Combien de gâteaux différents, sans une seule décoration ? (le calcul suit les listes : il reste juste si on en ajoute) */
function compte(){
  var nB = A.PINCEAUX.length, nP = A.PATES.length + nB, nG = A.GLACAGES.length + nB, aspects = nP;   /* les couleurs des listes, plus celles du pinceau ; d'abord : sans glaçage */
  A.MOTIFS.forEach(function(m){
    if(!PLEINS[m.id]) aspects += nP * nG;                 /* un glaçage qui laisse voir la pâte */
    else aspects += nG * (m.id === 'lisse' ? 1 : 1 + nB);  /* un glaçage qui couvre tout ; ses pois, ses rayures, ses vagues : leur couleur, ou une du pinceau */
  });
  var cremes = A.CREMES.length * (A.CREME_COUL.length + nB) + 1, parEtage = A.FORMES.length * 2 * aspects * cremes, table = A.PLATS.length * (1 + nB) * A.NAPPES.length * (1 + nB);
  var total = 0, l = []; for(var n = 1; n <= MAX_ETAGES; n++){ var v = Math.pow(parEtage, n) * table; l.push(v); total += v; }
  var decos = 0; A.CATS.forEach(function(c){ decos += c.l.length; });
  return {parEtage:parEtage, table:table, unEtage:l[0], parNombre:l, total:total, decorations:decos, couleursParDecoration:1 + nB};
}
MJ.GATEAU = {compte:compte, sons:SONS, etageSVG:etageSVG, gateauSVG:gateauSVG, geo:geo};

/* ---------- Les deux colonnes d'icônes ---------- */
var GAUCHE = [{id:'etages', nom:'Étages'}, {id:'pate', nom:'Pâte'}, {id:'glacage', nom:'Glaçage'}, {id:'motif', nom:'Motif'}, {id:'creme', nom:'Crème'}, {id:'table', nom:'Table'}, {id:'couleurs', nom:'Couleurs'}];
var PAR_ETAGE = {etages:1, pate:1, glacage:1, motif:1, creme:1};
var CAT = {}; A.CATS.forEach(function(c){ CAT[c.id] = c; });

/* ---------- Ce que dit le conteur ---------- */
var DIT = {
  debut:'Un gâteau bien sage… pour l\'instant. Les ronds, sur les côtés, débordent de surprises !',
  deco:'Un petit coup de doigt : elle tourne. Fais-la glisser : elle voyage !',
  plein:'Stop ! Le gâteau n\'en peut plus. Une de plus, et il s\'écroule !',
  minute:'Plus qu\'une minute ! Gaspard a déjà sorti les assiettes.',
  pinceau:'Un pinceau magique ! Choisis une couleur, puis effleure ce que tu veux repeindre : une fraise, un étage, la nappe…',
  fini:'Dong ! Les dix minutes sont passées. Gaspard emporte le gâteau… en courant !'
};
function phraseFin(R){
  if(R.parDeco.chaussette) return 'Une chaussette sur un gâteau ? À Brumeval, on appelle ça de la grande cuisine !';
  if(R.chats >= 7) return 'Les sept chats d\'Odette sont tous là. Ils se trouvent très ressemblants !';
  if(!R.nbDecos) return 'Un gâteau tout nu ? Sobre, élégant… et il reste de la place pour les fraises !';
  if(R.parDeco.sardine || R.parDeco.fromage || R.parDeco.cornichon) return 'Sucré, salé, un peu les deux… Gaspard goûte. Il en reprend. Deux fois !';
  if(R.etages >= 4) return 'Quatre étages ! Il faudra une échelle pour souffler les bougies.';
  return U.choix(['Gaspard en lâche sa cuillère. Un gâteau pareil, Brumeval n\'en a jamais vu !', 'Toute la place retient son souffle. Même les pigeons font la queue !', 'Le clocher sonne tout seul. Il veut sa part, lui aussi !']);
}

/* ==========================================================
   Le jeu
   ========================================================== */
function jouer(zone, params, fin){
  var id = uid(), arrete = false, enFete = false, minuteurs = [];
  var etat = {etages:[etageNeuf()], sel:0, plat:'porcelaine', nappe:'vichy', decos:[]}, nDeco = 0, histoire = [], ouvert = null, tours = {}, dejaDit = {};
  var reste = (params && params.duree) || DUREE, tempsFini = false, horloge = null, tAvant = Date.now();
  var pinceau = A.PINCEAUX[0].c;   /* la couleur du pinceau (null : « d'origine », il rend ses couleurs à ce qu'il touche) */
  var VB = '0 0 640 ' + HAUT_VUE, MONDE = '<g class="gt-monde" transform="translate(0,' + (-DY) + ')">';
  zone.innerHTML = '';
  var racine = U.html('<div class="gt">' +
    /* deux calques : la place, un peu floue (Romain, 11 novembre, 20 h 39 : « l'arrière-plan un peu flou », pour que ses couleurs
       ne se mêlent pas à celles du gâteau) ; et, par-dessus, bien nets, la table, le plat, le gâteau et ses décorations */
    '<svg class="gt-fond" viewBox="' + VB + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' + A.defs(id) + MONDE + A.fond(id) + '</g></svg>' +
    '<svg class="gt-scene" viewBox="' + VB + '" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Le gâteau">' + MONDE + '<g class="gt-table"></g><g class="gt-plat"></g><g class="gt-gateau"></g><g class="gt-decos"></g></g></svg>' +
    '<div class="gt-pluie" aria-hidden="true"></div>' +
    '<div class="gt-col gt-gauche"></div><div class="gt-col gt-droite"></div>' +
    '<div class="gt-plateau" hidden></div>' +
    '<div class="gt-bas"><button type="button" class="gt-rond gt-annuler" aria-label="Annuler" disabled>↩️</button><span class="gt-rond gt-poubelle" role="img" aria-label="La poubelle">🗑️</span>' +
      '<span class="gt-temps" role="timer" aria-label="Le temps qui reste"><i aria-hidden="true">⏳</i><b>15:00</b></span>' +
      '<div class="gt-place"><div class="gt-conteur" hidden></div></div><button type="button" class="btn b-aller gt-pret">🎂 C\'est prêt !</button></div>' +
    '<div class="gt-final" hidden></div>' +
  '</div>');
  zone.appendChild(racine);
  var q = function(s){ return racine.querySelector(s); };
  var scene = q('.gt-scene'), monde = scene.querySelector('.gt-monde'), gTable = q('.gt-table'), gPlat = q('.gt-plat'), gGateau = q('.gt-gateau'), gDecos = q('.gt-decos');
  var colG = q('.gt-gauche'), colD = q('.gt-droite'), plateau = q('.gt-plateau'), conteur = q('.gt-conteur'), bAnnuler = q('.gt-annuler'), poubelle = q('.gt-poubelle'), bPret = q('.gt-pret'), final = q('.gt-final'), pluie = q('.gt-pluie'), bTemps = q('.gt-temps');
  function apres(ms, fn){ var t = setTimeout(function(){ if(!arrete) fn(); }, ms); minuteurs.push(t); return t; }

  /* ----- les icônes ----- */
  function boutonIcone(c, i){
    var b = U.html('<button type="button" class="gt-ic" data-c="' + c.id + '" style="--i:' + i + '" aria-label="' + esc(c.nom) + '">' + A.icone(c.id) + '<b>' + esc(c.nom) + '</b></button>');
    b.addEventListener('click', function(){ if(enFete) return; b.classList.remove('gt-rebond'); void b.offsetWidth; b.classList.add('gt-rebond'); ouvrir(c.id); });
    return b;
  }
  GAUCHE.forEach(function(c, i){ colG.appendChild(boutonIcone(c, i)); });
  A.CATS.forEach(function(c, i){ colD.appendChild(boutonIcone(c, i + 3)); });

  /* ----- les dessins ----- */
  function rendreTable(){ gTable.innerHTML = A.table(id, etat.nappe, etat.nappeC); }
  function rendrePlat(){ gPlat.innerHTML = A.plat(id, etat.plat, etat.platC); }
  function montrerChoisi(){ return etat.etages.length > 1 && ouvert && PAR_ETAGE[ouvert] ? etat.sel : -1; }
  function rendreGateau(opts){ opts = opts || {}; opts.choisi = opts.choisi !== undefined ? opts.choisi : montrerChoisi(); gGateau.innerHTML = gateauSVG(etat.etages, id, opts); }
  function noeudDeco(d){
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gt-deco'); g.setAttribute('data-id', d.id); g.setAttribute('transform', 'translate(' + P(d.x, d.y) + ')');
    if(tours[d.id] === undefined) tours[d.id] = d.r;
    g.innerHTML = '<circle class="gt-prise" r="30"/><g class="gt-deco-p"><g class="gt-deco-r" style="transform:rotate(' + tours[d.id] + 'deg)">' + A.dessinDeco(d.d, d.t) + '</g></g>';
    return g;
  }
  function rendreDecos(){ gDecos.innerHTML = ''; tours = {}; etat.decos.forEach(function(d){ gDecos.appendChild(noeudDeco(d)); }); }
  function noeudDe(d){ return gDecos.querySelector('.gt-deco[data-id="' + d.id + '"]'); }
  function parId(n){ for(var i = 0; i < etat.decos.length; i++) if(String(etat.decos[i].id) === String(n)) return etat.decos[i]; return null; }
  function toutRendre(){ rendreTable(); rendrePlat(); rendreGateau(); rendreDecos(); }

  /* ----- revenir en arrière ----- */
  function memo(){ histoire.push(JSON.stringify(etat)); if(histoire.length > 60) histoire.shift(); bAnnuler.disabled = false; }
  function annuler(){
    if(!histoire.length || enFete) return;
    prises = {}; racine.classList.remove('gt-drag'); poubelle.classList.remove('gt-chaud');   /* (ce qu'un autre doigt tenait est lâché) */
    etat = JSON.parse(histoire.pop()); bAnnuler.disabled = !histoire.length;
    toutRendre(); if(ouvert) bulles(ouvert, true); son('annule');
  }
  bAnnuler.addEventListener('click', annuler);

  /* ----- le conteur (une petite phrase en haut, avec son 🔊 ; jamais lue toute seule) ----- */
  var tConteur = null;
  function dire(cle, duree){
    if(dejaDit[cle]) return; dejaDit[cle] = 1;
    conteur.innerHTML = '<p>' + esc(DIT[cle]) + '</p>'; conteur.appendChild(MJ.boutonLire(DIT[cle])); conteur.hidden = false; sousLesBulles();
    clearTimeout(tConteur); if(duree) tConteur = apres(duree, taire);
  }
  function taire(){ conteur.hidden = true; clearTimeout(tConteur); }
  /* sur un petit écran, la phrase est en haut (en bas, elle cacherait le gâteau) : sous les bulles quand il y en a */
  function sousLesBulles(){ racine.style.setProperty('--gt-sous', (ouvert && !plateau.hidden ? plateau.offsetTop + plateau.offsetHeight + 6 : 8) + 'px'); }

  /* ----- les bulles d'une icône ----- */
  function contenu(c){
    var t = etat.etages[etat.sel], l = [], n = etat.etages.length;
    if(c === 'etages'){
      l.push({j:A.jeton('plus'), nom:'Étage en plus', act:'plus', off:n >= MAX_ETAGES}, {j:A.jeton('moins'), nom:'Étage en moins', act:'moins', off:n <= 1}, {sep:1});
      A.FORMES.forEach(function(f){ l.push({j:A.jeton(f.id), nom:f.nom, act:'forme', v:f.id, on:t.forme === f.id}); });
      l.push({j:A.jeton('penche'), nom:'Penché', act:'penche', on:!!t.penche});
    } else if(c === 'pate') A.PATES.forEach(function(p){ l.push({j:A.jetonPate(p), nom:p.nom, act:'pate', v:p.id, on:t.pate === p.id}); });
    else if(c === 'glacage'){
      A.GLACAGES.forEach(function(g){ l.push({j:A.jetonCouleur(g), nom:g.nom, act:'glacage', v:g.id, on:t.glacage === g.id}); });
      l.push({j:A.jeton('sans'), nom:'Sans glaçage', act:'glacage', v:null, on:!t.glacage});
    } else if(c === 'motif') A.MOTIFS.forEach(function(m){ l.push({j:A.jeton(m.id), nom:m.nom, act:'motif', v:m.id, on:!!t.glacage && t.motif === m.id}); });
    else if(c === 'creme'){
      A.CREMES.forEach(function(m){ l.push({j:A.jetonCreme(m.id), nom:m.nom, act:'creme', v:m.id, on:t.creme === m.id}); });
      l.push({j:A.jeton('sans'), nom:'Sans crème', act:'creme', v:null, on:!t.creme}, {sep:1});
      A.CREME_COUL.forEach(function(k){ var g = A.glac(k); l.push({j:A.jetonCouleur(g), nom:g.nom, act:'cremeC', v:k, on:!!t.creme && t.cremeC === k}); });
    } else if(c === 'table'){
      A.PLATS.forEach(function(p){ l.push({j:jetonPlat(p.id), nom:p.nom, act:'plat', v:p.id, on:etat.plat === p.id}); });
      l.push({sep:1});
      A.NAPPES.forEach(function(p){ l.push({j:jetonNappe(p.id), nom:p.nom, act:'nappe', v:p.id, on:etat.nappe === p.id}); });
    } else if(c === 'couleurs'){
      A.PINCEAUX.forEach(function(p){ l.push({j:A.jetonCouleur(p), nom:p.nom, act:'pinceau', v:p.c, on:pinceau === p.c}); });
      l.push({j:A.jeton('origine'), nom:'D\'origine', act:'pinceau', v:null, on:pinceau === null});
    } else if(CAT[c]) CAT[c].l.forEach(function(d){ l.push({j:A.svgDeco(d.id), nom:d.nom, act:'deco', v:d.id}); });
    return l;
  }
  function jetonPlat(p){ return '<svg viewBox="80 500 480 120" aria-hidden="true">' + A.plat(id + 'j-' + p, p) + '</svg>'; }
  function jetonNappe(n){ return '<svg viewBox="-30 -30 60 60" aria-hidden="true"><rect x="-22" y="-18" width="44" height="36" rx="5" fill="url(#' + id + 'n-' + n + ')" stroke="' + K + '" stroke-width="2.6"/></svg>'; }
  function nomIcone(c){ for(var i = 0; i < GAUCHE.length; i++) if(GAUCHE[i].id === c) return GAUCHE[i].nom; return CAT[c] ? CAT[c].nom : ''; }
  /* Où se posent les bulles : en haut, contre leur colonne d'icônes, là où elles ne cachent ni le gâteau ni l'endroit où les
     décorations arrivent. On essaie d'abord les plus grosses bulles et le moins de rangées ; s'il n'y a pas la place (un grand
     gâteau, un petit écran), elles rapetissent ; en dernier recours, on prend ce qui cache le moins. */
  function placer(){
    if(!ouvert || plateau.hidden) return;
    var R = racine.getBoundingClientRect(), cg = colG.getBoundingClientRect(), cd = colD.getBoundingClientRect(), m = monde.getScreenCTM(); if(!m || !R.width) return;
    var cs = getComputedStyle(racine), basH = parseFloat(cs.getPropertyValue('--gt-bas')) || 66, b0 = parseFloat(cs.getPropertyValue('--gt-b')) || 56;
    var aGauche = !CAT[ouvert], x0 = cg.right - R.left + 8, x1 = cd.left - R.left - 8, hDispo = R.height - basH - 8;
    var G = geo(etat.etages), h = G[G.length - 1];
    function px(x){ return m.a * x + m.e - R.left; } function py(y){ return m.d * y + m.f - R.top; }
    /* (un étage penché ou cannelé déborde un peu de son rectangle : une marge) */
    var zones = G.map(function(g){ return [px(Math.min(g.cx, g.cx + g.s) - g.r - 20), py(g.yT - g.e - 14), px(Math.max(g.cx, g.cx + g.s) + g.r + 20), py(g.yB + g.e)]; });
    zones.push([px(h.cx + h.s - h.r * .8), py(h.yT - 62), px(h.cx + h.s + h.r * .8), py(h.yT)]);
    var groupes = [0]; contenu(ouvert).forEach(function(e){ if(e.sep) groupes.push(0); else groupes[groupes.length - 1]++; });
    var plusGros = Math.max.apply(null, groupes);
    function hauteur(cols, pas){ var r = 0; groupes.forEach(function(n){ r += Math.ceil(n / cols); }); return 8 + 38 + r * pas + (groupes.length - 1) * 10; }
    function cache(cols, pas){
      var w = cols * pas - 8, hh = hauteur(cols, pas), a = aGauche ? x0 : x1 - w, s = 0;
      zones.forEach(function(z){ var ox = Math.min(a + w, z[2]) - Math.max(a, z[0]), oy = Math.min(hh, z[3]) - Math.max(0, z[1]); if(ox > 0 && oy > 0) s += ox * oy; });
      return s;
    }
    var choix = null, repli = null, tailles = [b0, 52, 46, 40].filter(function(b, i, l){ return b <= b0 && l.indexOf(b) === i; });
    tailles.some(function(b){
      var pas = b + 8, c = Math.min(plusGros, Math.floor((x1 - x0 + 8) / pas));
      for(; c >= 2; c--){
        var hh = hauteur(c, pas), ov = hh > hDispo ? 1e9 + hh : cache(c, pas);
        if(!repli || ov < repli.ov) repli = {b:b, cols:c, ov:ov};
        if(ov === 0){ if(!choix || hh <= choix.h) choix = {b:b, cols:c, h:hh}; else break; }
        else if(choix) break;
      }
      return !!choix;
    });
    choix = choix || repli || {b:b0, cols:3};
    plateau.classList.toggle('gt-pl-g', aGauche); plateau.classList.toggle('gt-pl-d', !aGauche);
    plateau.style.left = aGauche ? Math.round(x0) + 'px' : ''; plateau.style.right = aGauche ? '' : Math.round(R.width - x1) + 'px';
    plateau.style.setProperty('--gt-b', choix.b + 'px'); plateau.style.setProperty('--cols', choix.cols);
    sousLesBulles();
  }
  function bulles(c, calme){
    var l = contenu(c), nb = 0, i = 0;
    l.forEach(function(e){ if(!e.sep) nb++; });
    plateau.innerHTML = ''; plateau.hidden = false; plateau.classList.toggle('gt-calme', !!calme);
    var titre = U.html('<div class="gt-titre"><b>' + esc(nomIcone(c)) + '</b></div>');
    if(PAR_ETAGE[c] && etat.etages.length > 1){
      var ch = U.html('<span class="gt-quel" aria-label="Quel étage ?"></span>');
      etat.etages.forEach(function(t, k){
        var bk = U.html('<button type="button" class="gt-num' + (k === etat.sel ? ' on' : '') + '" aria-label="Étage ' + (k + 1) + '">' + (k + 1) + '</button>');
        bk.addEventListener('click', function(){ choisirEtage(k); });
        ch.appendChild(bk);
      });
      titre.appendChild(ch);
    }
    plateau.appendChild(titre);
    var pasMs = nb > 10 ? 32 : 55;
    l.forEach(function(e){
      if(e.sep){ plateau.appendChild(U.html('<i class="gt-sep"></i>')); return; }
      var b = U.html('<button type="button" class="gt-bulle' + (e.on ? ' on' : '') + (e.act === 'deco' ? ' gt-bulle-deco' : '') + '" style="animation-delay:' + (i * pasMs) + 'ms" aria-label="' + esc(e.nom) + '"' + (e.off ? ' disabled' : '') + '>' + e.j + '</button>');
      i++;
      if(e.act === 'deco') tirer(b, e); else b.addEventListener('click', function(){ agir(e); });
      plateau.appendChild(b);
    });
    placer();
    return nb;
  }
  function montrerNom(nom){ var b = plateau.querySelector('.gt-titre b'); if(b){ b.textContent = nom; b.classList.remove('gt-nom-pop'); void b.offsetWidth; b.classList.add('gt-nom-pop'); } }
  function ouvrir(c){
    taire();
    racine.querySelectorAll('.gt-appel').forEach(function(e){ e.classList.remove('gt-appel'); });
    if(ouvert === c){ fermer(); U.son('clic'); return; }
    ouvert = c; racine.classList.add('gt-ouvert');
    racine.querySelectorAll('.gt-ic').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-c') === c); });
    pops(bulles(c));
    rendreGateau();
  }
  function fermer(){
    if(!ouvert) return;
    ouvert = null; plateau.hidden = true; plateau.innerHTML = ''; racine.classList.remove('gt-ouvert'); sousLesBulles();
    racine.querySelectorAll('.gt-ic.on').forEach(function(b){ b.classList.remove('on'); });
    rendreGateau();
  }
  function choisirEtage(k){
    if(k === etat.sel && montrerChoisi() === k) return;
    etat.sel = k; U.son('clic');
    if(ouvert && PAR_ETAGE[ouvert]){ bulles(ouvert, true); rendreGateau({pouf:k}); }
    else { rendreGateau({pouf:k, choisi:etat.etages.length > 1 ? k : -1}); apres(1300, function(){ if(!ouvert || !PAR_ETAGE[ouvert]) rendreGateau(); }); }
  }
  /* quand un étage se couche ou se redresse, les décorations posées plus haut suivent */
  function suivre(k, avant){
    var G = geo(etat.etages)[k], ds = G.s - avant;
    etat.decos.forEach(function(d){ if(d.y < G.yB){ d.x += ds * Math.min(1, (G.yB - d.y) / G.h); var n = noeudDe(d); if(n) n.setAttribute('transform', 'translate(' + P(d.x, d.y) + ')'); } });
  }
  function agir(e){
    if(enFete) return;
    var t = etat.etages[etat.sel], k = etat.sel;
    montrerNom(e.nom);
    switch(e.act){
      case 'plus':
        if(etat.etages.length >= MAX_ETAGES) return;
        memo(); var haut = etat.etages[etat.etages.length - 1], neuf = JSON.parse(JSON.stringify(haut)); neuf.penche = false;
        etat.etages.push(neuf); etat.sel = etat.etages.length - 1;
        rendreGateau({neuf:etat.sel}); bulles(ouvert, true); montrerNom(e.nom); son('etage'); return;
      case 'moins':
        if(etat.etages.length <= 1) return;
        memo(); etat.etages.pop(); etat.sel = Math.min(etat.sel, etat.etages.length - 1);
        rendreGateau(); bulles(ouvert, true); montrerNom(e.nom); son('etageMoins'); return;
      case 'forme': if(t.forme === e.v) return; memo(); t.forme = e.v; son('forme'); break;
      case 'penche': memo(); var av = geo(etat.etages)[k].s; t.penche = !t.penche; suivre(k, av); son('penche'); break;
      case 'pate': if(t.pate === e.v) return; memo(); t.pate = e.v; son('pate'); break;
      case 'glacage': if((t.glacage || null) === e.v) return; memo(); t.glacage = e.v; son('glacage'); break;
      case 'motif': if(t.glacage && t.motif === e.v) return; memo(); t.motif = e.v; if(!t.glacage) t.glacage = 'rose'; son('motif'); break;
      case 'creme': if((t.creme || null) === e.v) return; memo(); t.creme = e.v; son('creme'); break;
      case 'cremeC': if(t.creme && t.cremeC === e.v) return; memo(); t.cremeC = e.v; if(!t.creme) t.creme = 'rosettes'; son('creme'); break;
      case 'plat': if(etat.plat === e.v && !etat.platC) return; memo(); etat.plat = e.v; etat.platC = null; rendrePlat(); son('plat'); majBulles(); return;
      case 'nappe': if(etat.nappe === e.v && !etat.nappeC) return; memo(); etat.nappe = e.v; etat.nappeC = null; rendreTable(); son('nappe'); majBulles(); return;
      case 'pinceau': pinceau = e.v; U.son('clic'); majBulles(); dire('pinceau', 12000); return;
    }
    rendreGateau({pouf:k}); majBulles();
  }
  /* les bulles choisies changent de halo, sans que tout se redessine */
  function majBulles(){
    if(!ouvert) return;
    var l = contenu(ouvert).filter(function(e){ return !e.sep; }), bs = plateau.querySelectorAll('.gt-bulle');
    l.forEach(function(e, i){ if(bs[i]) bs[i].classList.toggle('on', !!e.on); });
  }

  /* ----- les décorations : poser, déplacer, tourner, jeter ----- */
  function versScene(x, y){ var m = monde.getScreenCTM(); if(!m) return {x:CX, y:300}; var p = scene.createSVGPoint(); p.x = x; p.y = y; p = p.matrixTransform(m.inverse()); return {x:p.x, y:p.y}; }
  function limites(){
    var R = racine.getBoundingClientRect(), cg = colG.getBoundingClientRect(), cd = colD.getBoundingClientRect(), bas = q('.gt-bas').getBoundingClientRect();
    var a = versScene(Math.max(R.left, cg.right) + 2, R.top + 4), b = versScene(Math.min(R.right, cd.left) - 2, bas.top + 14);
    return {x0:a.x + 20, y0:a.y + 24, x1:b.x - 20, y1:b.y - 20};
  }
  function borner(p, L){ return {x:Math.max(L.x0, Math.min(L.x1, p.x)), y:Math.max(L.y0, Math.min(L.y1, p.y))}; }
  function surPoubelle(x, y){ var r = poubelle.getBoundingClientRect(); return Math.abs(x - (r.left + r.width / 2)) < r.width * .85 && Math.abs(y - (r.top + r.height / 2)) < r.height * .85; }
  /* L'endroit où une décoration arrive quand on touche sa bulle : d'abord sur le dessus du gâteau, puis sur le rebord de chaque
     étage, à gauche, à droite ; au tour suivant, un peu à côté (jamais deux fois pile au même endroit). */
  function arrivee(){
    var G = geo(etat.etages), places = [], i, j;
    for(i = G.length - 1; i >= 0; i--){
      var g = G[i], sup = G[i + 1], mx = g.cx + g.s;
      if(!sup){ var nb = Math.max(1, Math.round(g.r * 1.4 / 46)), ordre = []; for(j = 0; j < nb; j++) ordre.push(j); ordre.sort(function(a, b){ return Math.abs(a - (nb - 1) / 2) - Math.abs(b - (nb - 1) / 2); });
        ordre.forEach(function(k){ places.push([mx + (nb > 1 ? (k / (nb - 1) - .5) * g.r * 1.3 : 0), g.yT - 17]); }); }
      else places.push([mx - (g.r + sup.r) / 2, g.yT - 15], [mx + (g.r + sup.r) / 2, g.yT - 15]);
    }
    var n = nDeco, p = places[n % places.length], tour = Math.floor(n / places.length) % 5;
    return {x:p[0] + tour * 9 * (tour % 2 ? 1 : -1), y:p[1] - tour * 7};
  }
  function ajouter(did, p){
    if(etat.decos.length >= MAX_DECOS){ dire('plein', 6000); son('plein'); return null; }
    memo();
    var d = {id:++nDeco, d:did, x:p.x, y:p.y, r:0};
    etat.decos.push(d); gDecos.appendChild(noeudDeco(d));
    return d;
  }
  function pose(d){
    var n = noeudDe(d); if(!n) return;
    var pp = n.querySelector('.gt-deco-p'); pp.classList.remove('gt-pose'); void pp.getBoundingClientRect(); pp.classList.add('gt-pose');
    son(A.DECOS[d.d].son);
    if(!dejaDit.deco) dire('deco', 9000);
  }
  function jeter(d){
    var n = noeudDe(d), i = etat.decos.indexOf(d); if(i >= 0) etat.decos.splice(i, 1);
    if(n){ n.classList.add('gt-part'); n.style.pointerEvents = 'none'; apres(260, function(){ if(n.parentNode) n.parentNode.removeChild(n); }); }
    son('poubelle');
  }
  function devant(d){ var i = etat.decos.indexOf(d); if(i >= 0){ etat.decos.splice(i, 1); etat.decos.push(d); } var n = noeudDe(d); if(n) gDecos.appendChild(n); }
  /* (x, y) : où la décoration doit aller, à l'écran ; chaud : le doigt est sur la poubelle */
  function bouger(d, x, y, L, chaud){
    var p = borner(versScene(x, y), L); d.x = p.x; d.y = p.y;
    var n = noeudDe(d); if(n){ n.setAttribute('transform', 'translate(' + P(d.x, d.y) + ')'); n.classList.toggle('gt-jete', !!chaud); }
    poubelle.classList.toggle('gt-chaud', !!chaud);
  }
  function lacher(d, aLaPoubelle){
    racine.classList.remove('gt-drag'); poubelle.classList.remove('gt-chaud');
    var n = noeudDe(d); if(n) n.classList.remove('gt-tenu', 'gt-jete');
    if(aLaPoubelle) jeter(d); else pose(d);
  }
  /* le pinceau : une décoration, un morceau d'étage, le plat, la nappe prennent sa couleur (« d'origine » la leur rend) */
  function peindreDeco(d){
    if((d.t || null) === pinceau) return;
    memo(); d.t = pinceau;
    var n = noeudDe(d), neuf = noeudDeco(d); if(n) gDecos.replaceChild(neuf, n); else gDecos.appendChild(neuf);
    neuf.querySelector('.gt-deco-p').classList.add('gt-pose'); son('pinceau');
  }
  function peindreEtage(k, part){
    var t = etat.etages[k]; if(!t) return;
    memo();
    if(part === 'creme') t.cremeC = pinceau || 'blanc';
    else if(part === 'motif'){ if(pinceau) t.motifC = pinceau; else delete t.motifC; }
    else if(part === 'pate') t.pate = pinceau || 'vanille';
    else t.glacage = pinceau || 'rose';
    rendreGateau({pouf:k}); son('pinceau');
  }
  function tourner(d){
    memo(); d.r = (d.r + 45) % 360; tours[d.id] = (tours[d.id] || 0) + 45;
    var n = noeudDe(d); if(n) n.querySelector('.gt-deco-r').style.transform = 'rotate(' + tours[d.id] + 'deg)';
    son('tourne');
  }
  /* une décoration déjà posée : glisser = déplacer, toucher = tourner
     (c'est le calque des décorations qui retient le doigt, pas la décoration : elle passe devant les autres pendant qu'on la promène,
     et changer un dessin de place dans la page lui ferait lâcher le doigt) */
  var prises = {};
  gDecos.addEventListener('pointerdown', function(ev){
    if(enFete || arrete) return;
    var g = ev.target.closest ? ev.target.closest('.gt-deco') : null, d = g ? parId(g.getAttribute('data-id')) : null; if(!d) return;
    ev.preventDefault(); ev.stopPropagation();
    var p = versScene(ev.clientX, ev.clientY), m = monde.getScreenCTM(), ech = m ? m.a : 1;
    prises[ev.pointerId] = {d:d, x0:ev.clientX, y0:ev.clientY, ex:(d.x - p.x) * ech, ey:(d.y - p.y) * ech, bouge:false, L:null};
    try{ gDecos.setPointerCapture(ev.pointerId); }catch(e){}
  });
  function surBouge(ev){
    var pr = prises[ev.pointerId]; if(!pr) return;
    if(!pr.bouge){
      if(Math.abs(ev.clientX - pr.x0) + Math.abs(ev.clientY - pr.y0) < 9) return;
      pr.bouge = true; pr.L = limites(); memo(); devant(pr.d); son('prend');
      var n = noeudDe(pr.d); if(n) n.classList.add('gt-tenu'); racine.classList.add('gt-drag');
    }
    bouger(pr.d, ev.clientX + pr.ex, ev.clientY + pr.ey, pr.L, surPoubelle(ev.clientX, ev.clientY));
  }
  function surLache(ev){
    var pr = prises[ev.pointerId]; if(!pr) return;
    delete prises[ev.pointerId];
    try{ gDecos.releasePointerCapture(ev.pointerId); }catch(e){}
    var perdu = ev.type !== 'pointerup';   /* le doigt a été repris (un appel, un geste du système) : on pose là où elle est */
    if(pr.bouge) lacher(pr.d, !perdu && surPoubelle(ev.clientX, ev.clientY)); else if(!perdu){ if(ouvert === 'couleurs') peindreDeco(pr.d); else tourner(pr.d); }
  }
  gDecos.addEventListener('pointermove', surBouge);
  gDecos.addEventListener('pointerup', surLache);
  gDecos.addEventListener('pointercancel', surLache);
  gDecos.addEventListener('lostpointercapture', surLache);
  /* une bulle de décoration : on la touche (elle arrive sur le gâteau), ou on la tire jusqu'où on veut */
  function tirer(b, e){
    var pr = null;
    b.addEventListener('pointerdown', function(ev){
      if(enFete || b.disabled) return;
      ev.preventDefault();
      pr = {x0:ev.clientX, y0:ev.clientY, d:null, L:null, pid:ev.pointerId};
      try{ b.setPointerCapture(ev.pointerId); }catch(er){}
    });
    b.addEventListener('pointermove', function(ev){
      if(!pr || ev.pointerId !== pr.pid) return;
      if(!pr.d){
        if(Math.abs(ev.clientX - pr.x0) + Math.abs(ev.clientY - pr.y0) < 12) return;
        pr.L = limites(); pr.d = ajouter(e.v, borner(versScene(ev.clientX, ev.clientY), pr.L)); if(!pr.d){ pr = null; return; }
        var n = noeudDe(pr.d); if(n) n.classList.add('gt-tenu'); racine.classList.add('gt-drag'); son('prend'); montrerNom(e.nom);
      }
      bouger(pr.d, ev.clientX, ev.clientY, pr.L, surPoubelle(ev.clientX, ev.clientY));
    });
    function finTire(ev){
      if(!pr || ev.pointerId !== pr.pid) return;
      var p = pr, perdu = ev.type !== 'pointerup'; pr = null;
      try{ b.releasePointerCapture(ev.pointerId); }catch(er){}
      if(p.d){ lacher(p.d, !perdu && surPoubelle(ev.clientX, ev.clientY)); return; }
      if(perdu) return;
      var d = ajouter(e.v, arrivee()); if(d){ montrerNom(e.nom); pose(d); }
    }
    b.addEventListener('pointerup', finTire);
    b.addEventListener('pointercancel', finTire);
    b.addEventListener('lostpointercapture', finTire);
    /* au clavier (pas de doigt) : Entrée pose la décoration sur le gâteau */
    b.addEventListener('click', function(ev){ if(ev.detail === 0 && !enFete){ var d = ajouter(e.v, arrivee()); if(d){ montrerNom(e.nom); pose(d); } } });
  }
  /* toucher un étage : on le choisit ; toucher le décor : les bulles se rangent */
  scene.addEventListener('pointerdown', function(ev){
    if(enFete || arrete) return;
    var g = ev.target.closest ? ev.target.closest('.gt-etage') : null;
    if(ouvert === 'couleurs'){
      /* avec le pinceau : on repeint ce qu'on touche (la pâte, le glaçage, le motif, la crème d'un étage ; le plat ; la nappe) */
      if(g){ var pp = ev.target.closest('[data-p]'), kk = parseInt(g.getAttribute('data-k'), 10) || 0; peindreEtage(kk, pp ? pp.getAttribute('data-p') : (etat.etages[kk].glacage ? 'glacage' : 'pate')); return; }
      if(gPlat.contains(ev.target)){ if((etat.platC || null) !== pinceau){ memo(); etat.platC = pinceau; rendrePlat(); son('pinceau'); } return; }
      if(gTable.contains(ev.target)){ if((etat.nappeC || null) !== pinceau){ memo(); etat.nappeC = pinceau; rendreTable(); son('pinceau'); } return; }
    }
    if(g){ choisirEtage(parseInt(g.getAttribute('data-k'), 10) || 0); return; }
    if(ouvert){ fermer(); }
  });

  /* ----- « C'est prêt ! » : la fête ----- */
  function resume(){
    var R = {etages:etat.etages.length, formes:[], pates:[], glacages:[], motifs:[], cremes:[], penches:0, plat:etat.plat, nappe:etat.nappe, nbDecos:etat.decos.length, parCat:{}, parDeco:{}, chats:0};
    etat.etages.forEach(function(t){ R.formes.push(t.forme); R.pates.push(t.pate); R.glacages.push(t.glacage || ''); R.motifs.push(t.glacage ? t.motif : ''); R.cremes.push(t.creme ? t.creme + ':' + t.cremeC : ''); if(t.penche) R.penches++; });
    R.repeintes = 0;
    etat.decos.forEach(function(d){ var c = A.DECOS[d.d].cat; R.parCat[c] = (R.parCat[c] || 0) + 1; R.parDeco[d.d] = (R.parDeco[d.d] || 0) + 1; if(d.t) R.repeintes++; });
    ['moustache', 'biscotte', 'pompon', 'caramel', 'mistigri', 'noisette', 'grisette'].forEach(function(c){ if(R.parDeco[c]) R.chats++; });
    return R;
  }
  function confettis(){
    var C = ['#f04a6a', '#f6c52c', '#5bc8f0', '#6fc86a', '#f59a2c', '#bba5ea', '#ffffff'], s = '', n = reduit() ? 0 : 54;
    for(var i = 0; i < n; i++) s += '<i style="left:' + f1(Math.random() * 100) + '%;background:' + C[i % C.length] + ';--d:' + f1(2.8 + Math.random() * 2.6) + 's;--r:' + Math.round(Math.random() * 360) + 'deg;--x:' + Math.round(Math.random() * 120 - 60) + 'px;animation-delay:' + f1(-Math.random() * 5) + 's;width:' + Math.round(7 + Math.random() * 7) + 'px;height:' + Math.round(10 + Math.random() * 8) + 'px"></i>';
    pluie.innerHTML = s;
  }
  function feter(){
    if(enFete || arrete) return;
    enFete = true; fermer(); taire(); U.stop();
    racine.classList.remove('gt-drag'); poubelle.classList.remove('gt-chaud');
    gDecos.querySelectorAll('.gt-tenu, .gt-jete').forEach(function(n){ n.classList.remove('gt-tenu', 'gt-jete'); });   /* (une décoration qu'on tirait encore de sa bulle se pose là) */
    racine.classList.add('gt-fini');
    var R = resume(), phrase = tempsFini ? DIT.fini : phraseFin(R);
    final.innerHTML = '<div class="gt-final-dit"><p>' + esc(phrase) + '</p></div><div class="gt-final-b">' + (tempsFini ? '' : '<button type="button" class="btn second gt-retouche">✏️ Retoucher</button>') + '<button type="button" class="btn b-aller gt-fete">🎉 À la fête !</button></div>';
    final.querySelector('.gt-final-dit').appendChild(MJ.boutonLire(phrase));
    final.hidden = false; mesurer();
    /* « Retoucher » (tant qu'il reste du temps) : on reprend le gâteau, et le temps repart */
    if(!tempsFini) final.querySelector('.gt-retouche').addEventListener('click', function(){ enFete = false; tAvant = Date.now(); racine.classList.remove('gt-fini'); final.hidden = true; pluie.innerHTML = ''; U.stop(); U.son('clic'); mesurer(); });
    final.querySelector('.gt-fete').addEventListener('click', function(){
      if(arrete) return; U.stop();
      var det = R.etages + (R.etages > 1 ? ' étages' : ' étage') + (R.nbDecos ? ' et ' + R.nbDecos + (R.nbDecos > 1 ? ' décorations' : ' décoration') : '') + ' : toute la place en parle déjà.';
      fin({reussi:true, score:1, message:'Quel gâteau !', detail:det, gateau:R});
    });
    confettis(); if(tempsFini) U.son('cloche'); son('bravo'); apres(1500, function(){ if(enFete) son('confetti'); });
  }
  bPret.addEventListener('click', feter);

  /* ----- le temps : dix minutes (il s'arrête pendant la pause du jeu, et pendant qu'on regarde la fête) ----- */
  function ecrireTemps(){
    var s = Math.max(0, Math.ceil(reste)); bTemps.querySelector('b').textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    bTemps.classList.toggle('gt-presse', s <= 30);
  }
  function tic(){
    var t = Date.now(), dt = Math.max(0, Math.min(1.5, (t - tAvant) / 1000)); tAvant = t;
    if(arrete || enFete || tempsFini) return;
    var avant = reste; reste -= dt;
    if(avant > 60 && reste <= 60){ dejaDit.minute = 0; dire('minute', 7000); }
    if(reste > 0 && reste <= 10 && Math.ceil(reste) !== Math.ceil(avant)) U.son('tic');
    ecrireTemps();
    if(reste <= 0){
      /* c'est l'heure : ce qu'on tenait au bout du doigt se pose là, et le gâteau part à la fête */
      tempsFini = true; Object.keys(prises).forEach(function(k){ var pr = prises[k]; delete prises[k]; if(pr.bouge) lacher(pr.d, false); });
      feter();
    }
  }
  horloge = setInterval(tic, 250); ecrireTemps();

  /* ----- la taille des icônes et des bulles suit la place qu'on a ----- */
  function mesurer(){
    if(arrete || !racine.isConnected) return;
    var w = racine.clientWidth, h = racine.clientHeight; if(!w || !h) return;
    var bas = h < 420 ? 54 : 66, ic = Math.floor((h - bas - 18) / 7) - 16, etroit = w < 640;
    if(enFete) bas = Math.max(bas, final.offsetHeight);   /* à la fête, le gâteau monte au-dessus de ce que dit le conteur */
    var place = q('.gt-place'); if(etroit && conteur.parentNode !== racine) racine.appendChild(conteur); else if(!etroit && conteur.parentNode !== place) place.appendChild(conteur);
    ic = Math.max(38, Math.min(66, ic, w < 520 ? 48 : (w < 760 ? 56 : 66)));
    racine.style.setProperty('--gt-ic', ic + 'px'); racine.style.setProperty('--gt-bas', bas + 'px');
    var mm = monde.getScreenCTM(); racine.style.setProperty('--gt-flou', (mm ? Math.max(1.5, Math.min(3.4, mm.a * 2.7)) : 2.6).toFixed(1) + 'px');   /* le flou du fond suit la taille du dessin */
    racine.style.setProperty('--gt-b', (w < 520 || h < 420 ? 46 : (w < 760 ? 52 : 58)) + 'px');
    racine.classList.toggle('gt-petit', ic < 50); racine.classList.toggle('gt-etroit', etroit);
    racine.style.setProperty('--gt-cg', Math.round(colG.offsetWidth) + 'px'); racine.style.setProperty('--gt-cd', Math.round(colD.offsetWidth) + 'px');
    placer();
  }
  var ro = null; try{ ro = new ResizeObserver(mesurer); ro.observe(racine); }catch(e){ window.addEventListener('resize', mesurer); }

  toutRendre(); mesurer();
  /* pour commencer : le conteur dit un mot, et la première icône appelle le doigt (elle bouge, avec son rond jaune) */
  dire('debut'); colG.firstChild.classList.add('gt-appel');
  racine.__gateau = {etat:function(){ return etat; }, resume:resume, temps:function(v){ if(v !== undefined){ reste = v; ecrireTemps(); } return reste; }};   /* pour les essais */

  return {arreter:function(){
    arrete = true; clearInterval(horloge); minuteurs.forEach(function(t){ clearTimeout(t); }); if(ro) ro.disconnect(); else window.removeEventListener('resize', mesurer);
  }};
}

MJ.enregistrer('gateau', {
  nom:'Le gâteau de la fête', role:'alchimiste', ic:'🎂', minuteur:true,
  consigne:'Fabrique le gâteau de la fête : jusqu\'à quatre étages, la pâte, le glaçage, la crème, et toutes les décorations que tu veux, posées où tu veux. Un petit coup de doigt sur une décoration la fait tourner. Tu as dix minutes : à la fin, le gâteau part à la fête tel qu\'il est.',
  reglages:function(){ return {duree:DUREE, lignes:[{nom:'Étages', val:'de 1 à ' + MAX_ETAGES}, {nom:'Décorations', val:'jusqu\'à ' + MAX_DECOS}, {nom:'Temps', val:Math.round(DUREE / 60) + ' minutes'}]}; },
  jouer:jouer
});
MJ.PLEIN_ECRAN = MJ.PLEIN_ECRAN || {}; MJ.PLEIN_ECRAN.gateau = 1;
MJ.LARGE = MJ.LARGE || {}; MJ.LARGE.gateau = 1;   /* toute la largeur de l'écran : on voit la place en fête derrière le gâteau */
MJ.PHRASES = MJ.PHRASES || {}; MJ.PHRASES.gateau = 'Dix minutes pour le plus beau gâteau !';

/* ==========================================================
   L'explication en images, avant de jouer (MJ.DEMOS.gateau) : la main touche une icône, les bulles sortent, elle en choisit une
   (le glaçage change) ; puis elle tire une fraise jusqu'au gâteau, et un petit coup de doigt la fait tourner.
   ========================================================== */
var MAIN = '<g class="rg-main"><circle class="rg-onde" r="13" fill="none" stroke="#8ff3ff" stroke-width="3" opacity="0"/><g class="rg-main-g">' +
  '<g transform="scale(.7) rotate(-12)"><path d="M-5,4 C-5,-4 5,-4 5,4 L5,24 C9,21 15,22 16,27 C19,25 24,27 24,32 C27,31 31,34 30,40 L28,54 C27,60 21,64 13,64 L1,64 C-7,64 -11,59 -13,52 L-20,34 C-22,28 -16,25 -12,30 L-5,39 Z" fill="#ffe0c2" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M5,30 L5,40 M16,31 L16,41" stroke="' + K + '" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g></g></g>';
function lisse(u){ u = u < 0 ? 0 : (u > 1 ? 1 : u); return u * u * (3 - 2 * u); }
function piste(cles){
  return function(t){
    for(var i = 0; i < cles.length - 1; i++){ var a = cles[i], b = cles[i + 1]; if(t >= a[0] && t <= b[0]){ var u = lisse((t - a[0]) / ((b[0] - a[0]) || 1)); return {x:a[1] + (b[1] - a[1]) * u, y:a[2] + (b[2] - a[2]) * u, p:!!a[3]}; } }
    var z = t < cles[0][0] ? cles[0] : cles[cles.length - 1]; return {x:z[1], y:z[2], p:!!z[3]};
  };
}
MJ.DEMOS = MJ.DEMOS || {};
MJ.DEMOS.gateau = {w:300, h:420, f:function(el){
  var id = uid(), E = .47, OX = -0.4, OY = 122;   /* la scène (640 de large) tient dans les 300 de la démo */
  function sc(x, y){ return [OX + x * E, OY + y * E]; }
  var e1 = etageNeuf(), e2 = etageNeuf(); e1.creme = 'perles'; e2.glacage = 'blanc'; e2.creme = 'rosettes'; e2.cremeC = 'rose';
  var e2b = JSON.parse(JSON.stringify(e2)); e2b.glacage = 'menthe';
  var G = geo([e1, e2]);
  function medaillon(cls, x, y, r, dedans){ return '<g class="' + cls + '" transform="translate(' + P(x, y) + ')"><g class="gtd-in"><circle r="' + r + '" fill="#fff6dc" stroke="' + K + '" stroke-width="' + f1(r * .11) + '"/><g transform="scale(' + f1(r / 36) + ')">' + dedans + '</g></g></g>'; }
  var IC1 = [62, 392], IC2 = [578, 392], B1 = [[150, 300], [150, 392], [150, 484]], B2 = [486, 392], FR = [300, 348];
  var coul = ['rose', 'menthe', 'citron'].map(function(c){ return A.glac(c).c; });
  var VUE = ' viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">', CALQUE = '<g transform="translate(' + OX + ',' + OY + ') scale(' + E + ')">';
  el.innerHTML = '<div class="gtd-cadre"><svg class="gtd-fond" aria-hidden="true"' + VUE + A.defs(id) + CALQUE + A.fond(id) + '</g></svg><svg class="rg-demo-svg gtd"' + VUE +
    CALQUE + A.table(id, 'vichy') + A.plat(id, 'porcelaine') +
      '<g transform="translate(' + P(G[0].cx, G[0].yB) + ')">' + etageSVG(e1, G[0], id + 'a') + '</g>' +
      '<g class="gtd-e2a" transform="translate(' + P(G[1].cx, G[1].yB) + ')">' + etageSVG(e2, G[1], id + 'b') + '</g>' +
      '<g class="gtd-e2b" transform="translate(' + P(G[1].cx, G[1].yB) + ')" opacity="0">' + etageSVG(e2b, G[1], id + 'd') + '</g>' +
      medaillon('gtd-ic1', IC1[0], IC1[1], 46, A.icoBrut('glacage')) + medaillon('gtd-ic2', IC2[0], IC2[1], 46, A.icoBrut('fruits')) +
      B1.map(function(b, i){ return '<g class="gtd-b1" transform="translate(' + P(b[0], b[1]) + ')" opacity="0"><g class="gtd-in"><circle r="34" fill="#fff6dc" stroke="' + K + '" stroke-width="4"/><circle r="21" fill="' + coul[i] + '" stroke="' + K + '" stroke-width="3.4"/><path d="M-12,-8 C-8,-13 0,-15 7,-13" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/></g></g>'; }).join('') +
      '<g class="gtd-b2" transform="translate(' + P(B2[0], B2[1]) + ')" opacity="0"><g class="gtd-in"><circle r="34" fill="#fff6dc" stroke="' + K + '" stroke-width="4"/><g transform="scale(1.05)">' + A.DECOS.fraise.dessin() + '</g></g></g>' +
      '<g class="gtd-fr" opacity="0"><g class="gtd-frr" transform="scale(1.5)">' + A.DECOS.fraise.dessin() + '</g></g>' +
    '</g>' + MAIN + '</svg></div>';
  var svg = el.querySelector('.gtd'), $ = function(s){ return svg.querySelector(s); }, $$ = function(s){ return Array.prototype.slice.call(svg.querySelectorAll(s)); };
  var main = $('.rg-main'), ic1 = $('.gtd-ic1 .gtd-in'), ic2 = $('.gtd-ic2 .gtd-in'), b1 = $$('.gtd-b1'), b2 = $('.gtd-b2'), fr = $('.gtd-fr'), frr = $('.gtd-frr'), ea = $('.gtd-e2a'), eb = $('.gtd-e2b');
  /* le film (8 secondes) : 0,8 la main touche « glaçage » ; 1,9 elle touche la bulle verte ; 3,4 elle touche « fruits » ;
     4,3 → 5,5 elle tire la fraise jusqu'au gâteau ; 6,3 un petit coup de doigt : la fraise tourne */
  var m1 = sc(IC1[0], IC1[1]), mb = sc(B1[1][0], B1[1][1]), m2 = sc(IC2[0], IC2[1]), mf = sc(B2[0], B2[1]), mg = sc(FR[0], FR[1]);
  var PF = piste([[0, 120, 400, 0], [.7, m1[0], m1[1], 0], [.8, m1[0], m1[1], 1], [1.05, m1[0], m1[1], 0], [1.8, mb[0], mb[1], 0], [1.9, mb[0], mb[1], 1], [2.15, mb[0], mb[1], 0],
    [3.3, m2[0], m2[1], 0], [3.4, m2[0], m2[1], 1], [3.65, m2[0], m2[1], 0], [4.2, mf[0], mf[1], 0], [4.3, mf[0], mf[1], 1], [5.5, mg[0], mg[1], 1], [5.6, mg[0], mg[1], 0], [5.9, mg[0] + 14, mg[1] + 26, 0],
    [6.2, mg[0], mg[1], 0], [6.3, mg[0], mg[1], 1], [6.5, mg[0], mg[1], 0], [7.2, mg[0] + 40, mg[1] + 70, 0], [8, 120, 400, 0]]);
  var TAPES = [.8, 1.9, 3.4, 6.3], P0 = 8;
  function rebond(t, t0){ var u = (t - t0) / .4; return u > 0 && u < 1 ? 1 + .16 * Math.sin(Math.PI * u) * (1 - u) * 2 : 1; }
  function eclos(t, t0){ var u = (t - t0) / .35; if(u <= 0) return 0; if(u >= 1) return 1; return u < .6 ? 1.12 * lisse(u / .6) : 1.12 - .12 * lisse((u - .6) / .4); }
  function image(t){
    var m = PF(t), o = main.firstChild, mm = main.lastChild, r = 13, op = m.p ? .8 : 0;
    main.setAttribute('transform', 'translate(' + P(m.x, m.y) + ')');
    TAPES.forEach(function(tt){ if(t >= tt && t < tt + .5){ var u = (t - tt) / .5; r = 9 + 22 * u; op = 1 - u; } });
    o.setAttribute('r', f1(r)); o.setAttribute('opacity', op.toFixed(2)); mm.setAttribute('transform', m.p ? 'scale(.9)' : '');
    ic1.setAttribute('transform', 'scale(' + rebond(t, .8).toFixed(3) + ')'); ic2.setAttribute('transform', 'scale(' + rebond(t, 3.4).toFixed(3) + ')');
    b1.forEach(function(b, i){ var k = t < 2.9 ? eclos(t, .9 + i * .09) : 1 - lisse((t - 2.9) / .25); b.setAttribute('opacity', k > 0 ? Math.min(1, k * 1.5).toFixed(2) : '0'); b.firstChild.setAttribute('transform', 'scale(' + Math.max(.01, k).toFixed(3) + ')'); });
    var vert = lisse((t - 1.9) / .25) * (1 - lisse((t - 7.5) / .4));
    eb.setAttribute('opacity', vert.toFixed(2)); ea.setAttribute('opacity', vert > .99 ? '0' : '1');
    var k2 = t < 5.7 ? eclos(t, 3.5) : 1 - lisse((t - 5.7) / .25); b2.setAttribute('opacity', k2 > 0 ? Math.min(1, k2 * 1.5).toFixed(2) : '0'); b2.firstChild.setAttribute('transform', 'scale(' + Math.max(.01, k2).toFixed(3) + ')');
    /* la fraise : elle sort de sa bulle sous le doigt, se pose, puis tourne d'un cran */
    var vis = t > 4.35 && t < 7.6 ? 1 : 0, u = lisse((t - 4.3) / 1.2), fx = B2[0] + (FR[0] - B2[0]) * u, fy = B2[1] + (FR[1] - B2[1]) * u;
    fr.setAttribute('opacity', vis ? (t > 7.3 ? (1 - lisse((t - 7.3) / .3)).toFixed(2) : '1') : '0');
    fr.setAttribute('transform', 'translate(' + P(fx, fy) + ')');
    frr.setAttribute('transform', 'scale(' + (t > 4.3 && t < 5.5 ? 1.7 : 1.5) + ') rotate(' + f1(45 * lisse((t - 6.3) / .25)) + ')');
  }
  if(reduit()){ image(5.55); return {arreter:function(){}}; }
  image(0);
  var stop = U.boucle(function(dt, T){ if(!svg.isConnected) return false; image(T % P0); });
  el.__rgImage = image;
  return {arreter:stop};
}};
})();
