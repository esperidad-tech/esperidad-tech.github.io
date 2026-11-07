/* ==========================================================
   Brumeval — l'horloge des mini-jeux, qu'on peut arrêter (window.MJT)
   (Romain, 5 novembre, 11 h 21 : « mettre le mini-jeu en pause et revenir sur la carte, taper un code… »)

   build.py enveloppe chaque fichier mj-*.js dans une fonction qui remplace, pour ce fichier seulement,
   setTimeout, setInterval, requestAnimationFrame (et leurs clear/cancel), Date.now et performance.now
   par ceux d'ici. Le reste du jeu (la carte, le tutoriel, l'atelier…) garde l'horloge du navigateur.

   MJT.pause(el)   : tout ce que les mini-jeux attendent est figé (minuteurs, images, temps qui passe),
                     et les animations CSS sous el (getAnimations) aussi ;
   MJT.reprendre() : tout repart exactement où on en était (le temps passé en pause ne compte pas).
   Un seul mini-jeu tourne à la fois : la pause est donc unique, pour tous les mini-jeux.
   MJT.reel : les vraies fonctions du navigateur (le « 3, 2, 1 » de la reprise, mj-core.js).
   ========================================================== */
(function(){
'use strict';
var W = window;
var vST = W.setTimeout.bind(W), vCT = W.clearTimeout.bind(W),
    vRAF = (W.requestAnimationFrame || function(f){ return vST(function(){ f(W.performance.now()); }, 16); }).bind(W),
    vCAF = (W.cancelAnimationFrame || vCT).bind(W);
function reelNow(){ return W.performance.now(); }

var enPause = false, debut = 0, decal = 0, dernierTs = -Infinity, anims = [];
/* le temps des mini-jeux : celui du navigateur, moins tout le temps passé en pause */
function perf(){ return (enPause ? debut : reelNow()) - decal; }
function date(){ return Date.now() - decal - (enPause ? reelNow() - debut : 0); }

/* ---------- Minuteurs (setTimeout / setInterval) ---------- */
var MIN = {}, nMin = 700000000;   /* des numéros loin de ceux du navigateur */
function armer(m){ m.reel = vST(function(){ sonner(m); }, Math.max(0, m.quand - perf())); }
function sonner(m){
  m.reel = null;
  if(MIN[m.id] !== m || enPause) return;
  if(m.quand - perf() > 2){ armer(m); return; }
  if(m.tous){ m.quand = perf() + m.tous; armer(m); } else delete MIN[m.id];
  m.fn.apply(W, m.args);
}
function poser(fn, ms, args, tous){
  if(typeof fn !== 'function') return 0;
  ms = Math.max(0, +ms || 0);
  var m = {id:++nMin, fn:fn, args:args, quand:perf() + ms, tous:tous ? Math.max(4, ms) : 0, reel:null};
  MIN[m.id] = m;
  if(!enPause) armer(m);
  return m.id;
}
function setTimeout_(fn, ms){ return poser(fn, ms, Array.prototype.slice.call(arguments, 2), false); }
function setInterval_(fn, ms){ return poser(fn, ms, Array.prototype.slice.call(arguments, 2), true); }
function effacer(id){
  var m = MIN[id];
  if(m){ if(m.reel) vCT(m.reel); delete MIN[id]; }
  else if(id) vCT(id);   /* un minuteur du navigateur (créé ailleurs) */
}

/* ---------- Images (requestAnimationFrame) ---------- */
var IMG = {}, nImg = 900000000;
function demander(o){
  o.reel = vRAF(function(ts){
    o.reel = null;
    if(IMG[o.id] !== o || enPause) return;
    delete IMG[o.id];
    var t = Math.max(dernierTs, ts - decal); dernierTs = t;   /* le temps de l'image, sans les pauses (jamais en arrière) */
    o.fn(t);
  });
}
function raf(fn){
  if(typeof fn !== 'function') return 0;
  var o = {id:++nImg, fn:fn, reel:null};
  IMG[o.id] = o;
  if(!enPause) demander(o);
  return o.id;
}
function caf(id){
  var o = IMG[id];
  if(o){ if(o.reel) vCAF(o.reel); delete IMG[id]; }
  else if(id) vCAF(id);
}

/* ---------- Pause / reprise ---------- */
function pause(el){
  if(enPause) return;
  enPause = true; debut = reelNow();
  var k;
  for(k in MIN) if(MIN[k].reel){ vCT(MIN[k].reel); MIN[k].reel = null; }
  for(k in IMG) if(IMG[k].reel){ vCAF(IMG[k].reel); IMG[k].reel = null; }
  /* les animations CSS (et celles des scripts) du mini-jeu s'arrêtent aussi */
  anims = [];
  try{
    if(el && el.getAnimations) el.getAnimations({subtree:true}).forEach(function(a){
      if(a.playState === 'running'){ try{ a.pause(); anims.push(a); }catch(e){} }
    });
  }catch(e){}
  anims.el = el;
}
function reprendre(){
  if(!enPause) return;
  decal += reelNow() - debut; enPause = false;
  var k;
  for(k in MIN) if(MIN[k] && !MIN[k].reel) armer(MIN[k]);
  for(k in IMG) if(IMG[k] && !IMG[k].reel) demander(IMG[k]);
  /* seulement celles qui sont encore là (une animation CSS annulée entre-temps ne revient pas) */
  var vivantes = null;
  try{ if(anims.el && anims.el.getAnimations) vivantes = anims.el.getAnimations({subtree:true}); }catch(e){}
  anims.forEach(function(a){ if(!vivantes || vivantes.indexOf(a) >= 0){ try{ a.play(); }catch(e){} } });
  anims = [];
}

W.MJT = {
  setTimeout:setTimeout_, setInterval:setInterval_, clearTimeout:effacer, clearInterval:effacer,
  raf:raf, caf:caf,
  Date:{now:date}, performance:{now:perf},
  pause:pause, reprendre:reprendre,
  enPause:function(){ return enPause; },
  reel:{setTimeout:vST, clearTimeout:vCT, raf:vRAF, caf:vCAF},
  /* pour les tests : combien de minuteurs et d'images attendent */
  _etat:function(){ return {pause:enPause, minuteurs:Object.keys(MIN).length, images:Object.keys(IMG).length, decal:Math.round(decal)}; }
};
})();
