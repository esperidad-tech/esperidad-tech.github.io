/* ==========================================================
   Brumeval — la boîte noire (Romain, 14 novembre, 16 h 56 : « plusieurs fois des bugs qui me faisaient quitter l'appli »)
   ----------------------------------------------------------
   Le jeu se fermait tout seul sur les tablettes, sans erreur visible : sans doute le navigateur qui ferme la page
   quand elle prend trop de mémoire. On ne le voit pas sur un ordinateur ; alors la page tient son journal :
   - pendant qu'elle est à l'écran, elle note dans la mémoire de l'appareil (localStorage, « brumeval-vivant:<page> ») qu'elle
     est ouverte, l'écran, l'onglet, l'enquête, le rôle, les huit derniers boutons touchés, les erreurs et l'état des voix ;
   - quand on la quitte normalement (une autre appli, l'écran qui s'éteint, la page rechargée, le donjon), elle efface ce mot ;
   - si un mot est encore là au lancement suivant, et que sa page ne répond pas (plusieurs onglets ouverts sur un ordinateur :
     BroadcastChannel), c'est qu'elle s'est fermée toute seule, en plein jeu : on le garde (« brumeval-plantages », les cinq
     derniers) et les Réglages le disent, en bas (BoiteNoire.texte()).
   La voix (voix.js) a son propre témoin, qui sait si le moteur des voix tournait à ce moment-là.
   ========================================================== */
(function(){
'use strict';
var CLE = 'brumeval-vivant:', CLE_L = 'brumeval-plantages';
var moi = Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), MA_CLE = CLE + moi;
function lire(k){ try{ return JSON.parse(localStorage.getItem(k) || 'null'); }catch(e){ return null; } }
function ecrire(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function effacer(k){ try{ localStorage.removeItem(k); }catch(e){} }
var plantages = lire(CLE_L); if(!Array.isArray(plantages)) plantages = [];

/* 1. Au lancement : une page d'avant s'est-elle fermée toute seule ? (on demande d'abord aux autres onglets s'ils sont là) */
var canal = null, vivants = {};
try{ canal = new BroadcastChannel('brumeval-vivant'); }catch(e){ canal = null; }
if(canal){
  canal.onmessage = function(ev){
    var m = ev.data || {};
    if(m.q === 'la') try{ canal.postMessage({r:moi}); }catch(e){}
    if(m.r) vivants[m.r] = 1;
  };
  try{ canal.postMessage({q:'la'}); }catch(e){}
}
setTimeout(function(){
  var neufs = [];
  try{
    for(var i = localStorage.length - 1; i >= 0; i--){
      var k = localStorage.key(i);
      if(!k || k.indexOf(CLE) !== 0 || k === MA_CLE) continue;
      var id = k.slice(CLE.length), r = lire(k);
      if(vivants[id]) continue;   /* un autre onglet ouvert : il va bien */
      effacer(k);
      if(r && typeof r === 'object' && r.d) neufs.push(r);
    }
  }catch(e){}
  if(!neufs.length) return;
  neufs.sort(function(a, b){ return (a.m || 0) - (b.m || 0); });
  plantages = plantages.concat(neufs).slice(-5);
  ecrire(CLE_L, plantages);
  /* des voix naturelles étaient chargées à ce moment-là : le moteur des voix le compte (voix.js, V.plantage) */
  neufs.forEach(function(r){ if(r.voix && r.voix.voix && r.voix.voix.length && window.Voix && Voix.plantage) try{ Voix.plantage(); }catch(e){} });
}, canal ? 700 : 0);

/* 2. Pendant le jeu : le journal */
var j = {d:Date.now(), m:Date.now(), a:[], err:[]}, attente = 0;
function etat(){
  try{
    var M = window.M, UI = M && M.UI, P = M && M.P ? M.P() : null;
    j.ecran = UI ? UI.ecran : null;
    j.onglet = P ? P.onglet : null;
    j.enq = P ? P.id : null;
    j.role = M && M.role && M.S && M.S.heros ? M.role() : null;
    j.modal = UI && UI.modal ? UI.modal.type || '?' : null;
    var mj = document.getElementById('mj-plein');
    j.mj = !!(mj && !mj.hidden) || !!(M && M.mjPause);
    j.cadre = !!document.querySelector('.labo-cadre, #etabli-cadre');
    var V = window.Voix;
    if(V && V.diag && V.pret){ var g = V.diag(); j.voix = {mode:g.mode, voix:g.voix, enCours:g.enCours, sons:g.sons, octets:g.octets}; }
    else j.voix = null;
    if(window.performance && performance.memory) j.mem = Math.round(performance.memory.usedJSHeapSize / 1e6);
  }catch(e){}
}
function noter(){
  if(attente){ clearTimeout(attente); attente = 0; }
  if(document.hidden) return;
  j.m = Date.now(); etat();
  ecrire(MA_CLE, j);
}
function bientot(){ if(!attente) attente = setTimeout(noter, 300); }
function fermer(){ if(attente){ clearTimeout(attente); attente = 0; } effacer(MA_CLE); }

document.addEventListener('click', function(ev){
  try{
    var el = ev.target && ev.target.closest ? ev.target.closest('[data-act], [data-at], button') : null;
    var nom = el ? (el.getAttribute('data-act') || el.getAttribute('data-at') || String(el.className || el.tagName || '').split(' ')[0]) : '(vide)';
    var x = el && (el.getAttribute('data-id') || el.getAttribute('data-s') || el.getAttribute('data-l'));
    j.a.push(nom + (x ? ':' + String(x).slice(0, 24) : ''));
    if(j.a.length > 8) j.a = j.a.slice(-8);
  }catch(e){}
  bientot();
}, true);
function erreur(t){ try{ j.err.push(String(t || 'erreur').slice(0, 120)); if(j.err.length > 3) j.err = j.err.slice(-3); }catch(e){} bientot(); }
window.addEventListener('error', function(ev){ erreur(ev && ev.message); });
window.addEventListener('unhandledrejection', function(ev){ erreur(ev && ev.reason && (ev.reason.message || ev.reason)); });
/* quitter normalement : on efface le mot ; revenir : on le repose */
window.addEventListener('pagehide', fermer);
window.addEventListener('pageshow', function(){ noter(); });
document.addEventListener('visibilitychange', function(){ if(document.hidden) fermer(); else noter(); });
/* toutes les 20 secondes, l'heure et l'état (pour savoir ce qui tournait, même sans toucher l'écran) */
setInterval(function(){ if(!document.hidden) noter(); }, 20000);
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', noter); else noter();

/* 3. Pour les Réglages : une phrase sur le dernier plantage (rien s'il n'y en a pas eu) */
function heure(t){ var d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1) + ' à ' + d.getHours() + ' h ' + ('0' + d.getMinutes()).slice(-2); }
window.BoiteNoire = {
  plantages:function(){ return plantages.slice(); },
  texte:function(){
    var p = plantages[plantages.length - 1]; if(!p) return '';
    var o = [p.ecran, p.onglet, p.modal].filter(Boolean).join(' › ');
    var nv = p.voix && p.voix.voix ? p.voix.voix.length : 0;
    var v = p.voix ? ' ; voix : ' + p.voix.mode + (nv ? ' (' + nv + ' chargée' + (nv > 1 ? 's' : '') + ')' : '') : '';
    return 'Le jeu s\'est fermé tout seul ' + plantages.length + ' fois sur cet appareil. La dernière : le ' + heure(p.m || p.d) +
      (p.enq ? ', enquête ' + p.enq : '') + (p.role ? ', ' + p.role : '') + (o ? ', ' + o : '') + (p.mj ? ', pendant un mini-jeu' : '') + (p.cadre ? ', au labo ou à l\'établi' : '') +
      ' ; derniers boutons : ' + (p.a && p.a.length ? p.a.join(', ') : 'aucun') + v + (p.mem ? ' ; mémoire : ' + p.mem + ' Mo' : '') + (p.err && p.err.length ? ' ; erreur : ' + p.err[p.err.length - 1] : '') + '.';
  },
  oublier:function(){ plantages = []; effacer(CLE_L); }
};
})();
