/* ==========================================================
   Brumeval — le petit tutoriel de la cueillette (enquête 2, l'Alchimiste ; Romain, 14 novembre, 16 h 56)
   « Dans l'enquête numéro 2, ce serait bien aussi de dire à l'alchimiste qu'il faut qu'il aille cueillir ses fleurs […]
     tu lui fais un mini tuto au début pour lui dire qu'il faut récolter et tu lui mets des petits points sur la carte à récolter.
     Dès qu'il a appuyé sur un point, hop, tu arrêtes. »
     1. au début de l'enquête, une fenêtre racontée : ses potions ont besoin de fleurs et d'herbes, qui poussent dans le village ;
        son bouton jaune « 🗺️ Voir ma carte » l'y emmène ;
     2. sur la carte, chaque icône d'ingrédient qu'on peut cueillir maintenant porte le rond jaune animé (celui du tutoriel de
        l'enquête 1 : tuto.css) ; s'il est sur un autre onglet, c'est l'onglet Carte qui le porte ;
     3. dès qu'il touche un de ces points (ou qu'il cueille quelque part), c'est fini, pour toujours.
   P.tutoCueillette : undefined (pas encore commencé), 'carte' (la fenêtre est vue), 'fini'. Une enquête qui le veut : E.tutoCueillette:true.
   Une partie où il a déjà cueilli avant cette version : fini tout de suite.
   Chargé EN DERNIER, après menteur.js : il enveloppe M.render.
   ========================================================== */
(function(){
'use strict';
var M = window.M;
if(!M || !M.A) return;
var UI = M.UI, A = M.A;
function q(s){ return document.querySelector(s); }
function E0(){ return M.S && M.S.e ? M.E() : null; }
function concerne(){ var E = E0(), P = M.P && M.P(); return !!(E && P && E.tutoCueillette && M.role() === 'alchimiste'); }
function dejaCueilli(P){ return M.cle(P.vus || {}).some(function(k){ return k.indexOf('cueilli:') === 0; }); }
M.cueilletteTutoEnCours = function(){
  var P = M.P && M.P();
  if(!concerne() || P.tutoCueillette === 'fini') return false;
  if(dejaCueilli(P)){ P.tutoCueillette = 'fini'; M.sauver(); return false; }
  return true;
};
/* (rien pendant un mini-jeu, le chaudron de l'atelier, le labo ou l'établi : on n'appelle pas ailleurs pendant qu'il joue) */
function occupe(){
  var pl = document.getElementById('mj-plein');
  return !!M.mjPause || !!(pl && !pl.hidden) || !!document.querySelector('#atelier-ici .at-mj, .labo-cadre, #etabli-cadre');
}
function enJeu(){
  var P = M.P();
  return M.cueilletteTutoEnCours() && P.etape === 'jeu' && !P.resolu && UI.ecran === 'enquete' && !occupe() && !(M.tutoTalentForce && M.tutoTalentForce());
}
var T = 'Ton atelier sonne creux, et ton chaudron gargouille de faim ! Les fleurs et les herbes de tes potions poussent dans le village. Sur ta carte, chaque petite icône montre ce qui pousse là. Au panier !';
function dire(){
  var P = M.P();
  P.tutoCueillette = 'carte'; M.sauver();
  M.son('page');
  M.ouvrir({type:'info', ic:'🧺', titre:'La cueillette t\'attend !', t:T, bouton:'🗺️ Voir ma carte', boutonAct:'tc-carte', fixe:true});
}
A['tc-carte'] = function(){ var P = M.P(); UI.modal = null; P.onglet = 'carte'; UI.saisie = []; M.son('clic'); M.sauver(); M.render(); window.scrollTo(0, 0); };
function finir(){
  var P = M.P && M.P(); if(!P || P.tutoCueillette === 'fini') return;
  P.tutoCueillette = 'fini'; M.sauver();
  poser([]);
}
/* les points à cueillir maintenant : les icônes d'ingrédients de la carte, pas grisées */
function points(){ return Array.prototype.slice.call(document.querySelectorAll('#carte-ici g.ca-marqueur.ingr:not(.ingr-fait)[data-act="lieu"]')); }
function cibles(){
  var P = M.P();
  if(!P.tutoCueillette){ if(!UI.modal) dire(); return []; }
  if(UI.modal) return [];
  if(P.onglet !== 'carte'){ var o = q('.b-onglets [data-act=onglet][data-o=carte]'); return o ? [o] : []; }
  return points();
}

/* ---------- Les ronds jaunes (les mêmes que ceux du tutoriel de l'enquête 1 : tuto.css) ---------- */
var ronds = [], vises = [], boucle = 0;
function unRond(i){
  if(ronds[i] && ronds[i].isConnected) return ronds[i];
  var d = document.createElement('div');
  d.className = 'tu-rond tc-rond'; d.hidden = true; d.setAttribute('aria-hidden', 'true');
  d.innerHTML = '<i class="tu-onde"></i><i class="tu-anneau"></i>';
  document.body.appendChild(d);
  return (ronds[i] = d);
}
function memes(a, b){ if(a.length !== b.length) return false; for(var i = 0; i < a.length; i++) if(a[i] !== b[i]) return false; return true; }
function poser(l){
  vises.forEach(function(el){ if(l.indexOf(el) < 0 && !(el instanceof SVGElement)) el.classList.remove('tu-respire'); });
  vises = l.filter(function(el){ return el && el.isConnected; });
  vises.forEach(function(el){ if(!(el instanceof SVGElement)) el.classList.add('tu-respire'); });
  if(!vises.length){ ronds.forEach(function(d){ if(d) d.hidden = true; }); return; }
  if(!boucle) boucle = requestAnimationFrame(suivre);
}
function placer(){
  var n = 0, haut = innerHeight, large = innerWidth, nav = document.querySelector('.b-onglets'), bas = nav ? nav.getBoundingClientRect().top : haut;
  vises.forEach(function(el, i){
    var d = unRond(i);
    if(!el.isConnected){ d.hidden = true; return; }
    var r = el.getBoundingClientRect();
    if(!r.width || r.bottom < 0 || r.top > haut || r.right < 0 || r.left > large){ d.hidden = true; return; }
    if(el instanceof SVGElement && (r.top + r.bottom) / 2 > bas - 8){ d.hidden = true; return; }   /* (une icône passée sous la barre des onglets : pas de rond par-dessus) */
    if(el.classList.contains('tu-respire')){
      var k = parseFloat(getComputedStyle(el).scale) || 1;
      if(k > 0 && Math.abs(k - 1) > .001){ var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, w0 = r.width / k, h0 = r.height / k; r = {left:cx - w0 / 2, top:cy - h0 / 2, width:w0, height:h0}; }
    }
    var w = Math.max(r.width + 14, 46), h = Math.max(r.height + 14, 46), s = Math.max(w, h);
    if(el instanceof SVGElement){ w = h = s; }   /* (une icône ronde de la carte : un rond bien rond) */
    d.style.width = Math.round(w) + 'px'; d.style.height = Math.round(h) + 'px';
    d.style.transform = 'translate(' + Math.round(r.left + r.width / 2 - w / 2) + 'px,' + Math.round(r.top + r.height / 2 - h / 2) + 'px)';
    d.hidden = false; n++;
  });
  for(var j = vises.length; j < ronds.length; j++) if(ronds[j]) ronds[j].hidden = true;
  return vises.length > 0;
}
function suivre(){ boucle = 0; if(placer()) boucle = requestAnimationFrame(suivre); }
function maj(){
  var l = [];
  try{ if(enJeu()) l = cibles(); }catch(e){ console.error(e); }
  if(!memes(l, vises)) poser(l);
  else if(l.length && !boucle) boucle = requestAnimationFrame(suivre);
}
M.cueilletteTutoCibles = function(){ return enJeu() ? vises.slice() : []; };   /* (robots) */

/* ---------- La fin : un point touché, ou une cueillette ---------- */
function pousseIci(id){ try{ return !!(M.cueilletteIci && M.cueilletteIci(id).some(function(c){ return c.ingr; })); }catch(e){ return false; } }
var lieu0 = A.lieu;
A.lieu = function(el){
  var r = lieu0.apply(this, arguments);
  try{ if(M.cueilletteTutoEnCours() && el && el.dataset && pousseIci(el.dataset.id)) finir(); }catch(e){ console.error(e); }
  return r;
};
var cueillir0 = A.cueillir;
A.cueillir = function(){ var r = cueillir0.apply(this, arguments); try{ if(M.cueilletteTutoEnCours()) finir(); }catch(e){ console.error(e); } return r; };

var r0 = M.render;
M.render = function(){
  var r = r0.apply(this, arguments);
  try{ maj(); }catch(e){ console.error(e); }
  return r;
};
setInterval(function(){ try{ if(concerne() || vises.length) maj(); }catch(e){} }, 300);
document.addEventListener('click', function(){ setTimeout(function(){ try{ maj(); }catch(e){} }, 30); }, true);
})();
