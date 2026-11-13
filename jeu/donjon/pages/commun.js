/* commun.js — les outils des pages du Sage et de l'Alchimiste (donjon de Brumeval) : window.PAGE
   - la voix : SEULEMENT sur un bouton 🔊 (jamais toute seule) ; PAGE.dit(t) = un texte et son 🔊 ;
   - la mémoire (localStorage, toujours dans un try/catch) ;
   - « tourne la tablette » quand elle est debout ;
   - les fenêtres, la question oui / non, le pavé des 12 symboles (codes de donjon-codes.js), les étincelles, les petits sons. */
(function(global){
'use strict';
var PAGE = global.PAGE = {};
function q(s, r){ return (r || document).querySelector(s); }
function qa(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(t){ return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
PAGE.q = q; PAGE.qa = qa; PAGE.esc = esc; PAGE.el = el;

/* ================= la voix (seulement sur un bouton 🔊) ================= */
var voix = null;
function noteVoix(x){
  var n = (x.name || '') + ' ' + (x.voiceURI || ''), s = 0;
  if(/natural|neural|premium|enhanced|améliorée|wavenet|studio/i.test(n)) s += 50;
  if(/google/i.test(n)) s += 15;
  if(/(Amélie|Thomas|Audrey|Marie|Denise|Hortense|Julie|Henri|Vivienne|Rémi|Eloise|Celeste)/i.test(n)) s += 10;
  if(/fr[-_]FR/i.test(x.lang)) s += 5;
  if(/compact|espeak|robot/i.test(n)) s -= 40;
  return s;
}
function choisirVoix(){
  try{ var v = speechSynthesis.getVoices().filter(function(x){ return /^fr/i.test(x.lang); }); v.sort(function(a, b){ return noteVoix(b) - noteVoix(a); }); voix = v[0] || null; }catch(e){}
}
try{ choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }catch(e){}
function lire(t){
  t = String(t || '').replace(/[«»]/g, '').replace(/[←-⯿\uD83C-􏰀-\uDFFF️]/g, '').replace(/\s+/g, ' ').trim();
  if(!t) return;
  try{
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = 'fr-FR'; if(voix) u.voice = voix; u.rate = .95;
    speechSynthesis.speak(u);
  }catch(e){}
}
function taire(){ try{ speechSynthesis.cancel(); }catch(e){} }
PAGE.taire = taire;
/* le bouton 🔊 d'un texte, et un texte raconté avec son bouton */
PAGE.lireBtn = function(t, cls){ return '<button type="button" class="lire' + (cls ? ' ' + cls : '') + '" data-lire="' + esc(t) + '" aria-label="Écouter">🔊</button>'; };
PAGE.dit = function(t, cls, tag){ tag = tag || 'p'; return '<' + tag + ' class="dit ' + (cls || '') + '"><span>' + esc(t) + '</span>' + PAGE.lireBtn(t) + '</' + tag + '>'; };
PAGE.bulle = function(t, cls){ return '<div class="bulle ' + (cls || '') + '"><span>' + esc(t) + '</span>' + PAGE.lireBtn(t) + '</div>'; };
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-lire]');
  if(b){ e.stopPropagation(); e.preventDefault(); son('tic'); lire(b.getAttribute('data-lire')); }
}, true);

/* ================= les petits sons (fabriqués, sans fichier) ================= */
var AC = null;
function audio(){
  if(AC) return AC;
  try{ var A = global.AudioContext || global.webkitAudioContext; if(A) AC = new A(); }catch(e){ AC = null; }
  return AC;
}
function note(f, t0, d, type, vol){
  var a = audio(); if(!a) return;
  try{
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .08, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .05);
  }catch(e){}
}
/* une note qui glisse (le miaulement) */
function glisse(f0, f1, t0, d, vol){
  var a = audio(); if(!a) return;
  try{
    var o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter(), t = a.currentTime + (t0 || 0);
    o.type = 'triangle'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
    lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = .5;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol || .05, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .05);
  }catch(e){}
}
function son(type){
  try{ if(AC && AC.state === 'suspended') AC.resume(); }catch(e){}
  if(type === 'tic') note(880, 0, .06, 'triangle', .05);
  else if(type === 'ok'){ note(660, 0, .18, 'triangle', .07); note(990, .09, .25, 'triangle', .07); }
  else if(type === 'ko'){ note(220, 0, .2, 'sawtooth', .035); note(180, .1, .22, 'sawtooth', .03); }
  else if(type === 'magie'){ [784, 988, 1175, 1568].forEach(function(f, i){ note(f, i * .08, .5, 'sine', .05); }); }
  else if(type === 'page'){ note(320, 0, .12, 'triangle', .03); note(420, .05, .1, 'triangle', .02); }
  else if(type === 'plouf'){ note(260, 0, .25, 'sine', .08); note(180, .05, .3, 'sine', .05); }
  else if(type === 'feu'){ note(120, 0, .25, 'sawtooth', .025); note(90, .04, .3, 'triangle', .04); }
  else if(type === 'miaou'){ glisse(620, 940, 0, .34, .06); glisse(940, 560, .16, .3, .05); }      /* le miaou du labo (jeu/src/labo/15-sons.js) */
}
PAGE.son = son;

/* ================= la descente lancée depuis l'enquête 3 (jeu/src/descente.js) =================
   L'adresse porte ?enquete=3&jeton=… : un jeton nouveau = une descente neuve, la mémoire de la page repart de zéro (une vieille
   partie d'essai ne se mélange pas à l'enquête) ; le même jeton : on reprend. L'enquête relit ensuite la mémoire de la page (le code
   de la porte tapé par le Sage). Et un petit bouton, en haut à gauche, ramène à l'enquête. */
var ENQ = (function(){
  var o = {};
  try{ (location.search || '').replace(/^\?/, '').split('&').forEach(function(x){ if(!x) return; var k = x.split('='); o[decodeURIComponent(k[0])] = decodeURIComponent((k[1] || '').replace(/\+/g, ' ')); }); }catch(e){}
  return o.enquete ? {id:o.enquete, jeton:o.jeton || ''} : null;
})();
PAGE.enquete = ENQ;
function jetonNeuf(cle){
  if(!ENQ || !ENQ.jeton) return false;
  var nom = cle.replace(/^brumeval-donjon-/, ''), k = 'brumeval-donjon-jeton:' + nom;
  try{ if(localStorage.getItem(k) === ENQ.jeton) return false; localStorage.setItem(k, ENQ.jeton); localStorage.removeItem(cle); return true; }catch(e){ return false; }
}
function boutonEnquete(){
  if(!ENQ || q('#b-enquete')) return;
  var b = el('a', 'discret', '🏘️'); b.id = 'b-enquete'; b.href = '../index.html' + (ENQ.jeton ? '?retour=' + encodeURIComponent(ENQ.jeton) : '');   /* (13 novembre : le jeu retrouve le héros de cette descente) */ b.setAttribute('aria-label', 'Retour à l\'enquête'); b.title = 'Retour à l\'enquête';
  b.style.cssText = 'position:fixed;left:max(10px, env(safe-area-inset-left, 0px));top:max(10px, env(safe-area-inset-top, 0px));z-index:40;text-decoration:none;opacity:.9';
  document.body.appendChild(b);
}
if(ENQ){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boutonEnquete); else boutonEnquete(); }

/* ================= la mémoire (localStorage peut manquer : jamais d'erreur) ================= */
PAGE.memoire = function(cle){
  jetonNeuf(cle);     /* (une descente neuve : la page repart de zéro) */
  return {
    lire:function(defaut){ try{ var v = localStorage.getItem(cle); return v ? JSON.parse(v) : defaut; }catch(e){ return defaut; } },
    ecrire:function(o){ try{ localStorage.setItem(cle, JSON.stringify(o)); return true; }catch(e){ return false; } },
    effacer:function(){ try{ localStorage.removeItem(cle); }catch(e){} }
  };
};

/* ================= la tablette debout : « tourne-la » ================= */
PAGE.orientation = function(){
  var t = q('#tourne');
  function maj(){ if(t) t.hidden = !(window.innerHeight > window.innerWidth * 1.05); }
  maj();
  window.addEventListener('resize', maj);
  window.addEventListener('orientationchange', function(){ setTimeout(maj, 200); });
  /* la page ne défile jamais (iOS) et ne zoome jamais à deux doigts (on a nos propres gestes) */
  window.addEventListener('scroll', function(){ if(window.scrollX || window.scrollY) window.scrollTo(0, 0); });
  if('ongesturestart' in window || 'GestureEvent' in window){
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(n){ document.addEventListener(n, function(e){ if(e.cancelable) e.preventDefault(); }, {passive:false}); });
    document.addEventListener('touchmove', function(e){ if(e.touches && e.touches.length > 1 && e.cancelable) e.preventDefault(); }, {passive:false});
  }
  document.addEventListener('wheel', function(e){ if(e.ctrlKey && e.cancelable) e.preventDefault(); }, {passive:false});
};

/* ================= le rond jaune (un seul à la fois) ================= */
PAGE.guider = function(cible){
  qa('.guide').forEach(function(e){ if(e !== cible) e.classList.remove('guide'); });
  if(cible) cible.classList.add('guide');
};

/* ================= les fenêtres ================= */
var pile = [];
PAGE.fenetre = function(html, o){
  o = o || {};
  var v = el('div', 'voile'), f = el('div', 'fen ' + (o.classe || ''));
  f.setAttribute('role', 'dialog');
  f.innerHTML = html + (o.fermer === false ? '' : '<button type="button" class="fermer" data-fen-fermer aria-label="Fermer">✕</button>');
  v.appendChild(f); document.body.appendChild(v);
  var w = {el:f, voile:v, fermee:false, fermer:function(){ if(w.fermee) return; w.fermee = true; taire(); v.remove(); pile.splice(pile.indexOf(w), 1); if(o.surFermer) o.surFermer(); }};
  f.addEventListener('click', function(e){ var b = e.target.closest('[data-fen-fermer]'); if(b){ son('tic'); w.fermer(); } });
  if(o.fermerDehors !== false) v.addEventListener('click', function(e){ if(e.target === v && o.fermer !== false) w.fermer(); });
  pile.push(w);
  return w;
};
PAGE.fenetresOuvertes = function(){ return pile.length; };
PAGE.toutFermer = function(){ pile.slice().forEach(function(w){ w.fermer(); }); };

/* une question : bouton jaune (oui) et bouton sombre (non). Rend une promesse (true / false). */
PAGE.confirmer = function(o){
  return new Promise(function(ok){
    var rendu = false;
    var w = PAGE.fenetre('<div class="titre"><h2>' + esc(o.titre) + '</h2>' + (o.titre.split(/\s+/).length > 3 ? PAGE.lireBtn(o.titre, 'clair') : '') + '</div>' +
      (o.texte ? PAGE.dit(o.texte, 'sur-nuit') : '') +
      '<div class="rangee"><button type="button" class="aller" data-oui>' + esc(o.oui || 'Oui') + '</button><button type="button" class="sombre" data-non>' + esc(o.non || 'Non') + '</button></div>',
      {classe:'question ' + (o.classe || ''), surFermer:function(){ if(!rendu){ rendu = true; ok(false); } }});
    w.el.querySelector('[data-oui]').addEventListener('click', function(){ son('tic'); rendu = true; w.fermer(); ok(true); });
    w.el.querySelector('[data-non]').addEventListener('click', function(){ son('tic'); rendu = true; w.fermer(); ok(false); });
    PAGE.guider(w.el.querySelector('[data-oui]'));
  });
};

/* ================= le pavé des 12 symboles =================
   o : {tablette:'sage'|'alchimiste', titre, texte, deja(id) → true si déjà reçu, recevoir(id)} */
var NOMS_ROLES = {pisteur:'le Pisteur', alchimiste:'l’Alchimiste', sage:'le Sage', barde:'le Barde'};
PAGE.pave = function(o){
  var DC = global.DONJON_CODES, seq = [];
  var html = '<div class="titre"><h2>' + esc(o.titre || '📥 Un code') + '</h2></div>' +
    '<div class="pave-corps"><div class="pave-gauche">' + PAGE.dit(o.texte || 'Un équipier te donne un code ? Tape ses trois symboles.', 'sur-nuit pave-expl') +
      '<div class="saisie">' + [0, 1, 2].map(function(i){ return '<div class="case" data-case="' + i + '"></div>'; }).join('') + '</div>' +
      '<button type="button" class="sombre" data-efface disabled>⌫ Effacer</button></div>' +
    '<div class="pave">' + DC.ORDRE.map(function(k){ return '<button type="button" data-sym="' + k + '" aria-label="' + esc(DC.SYM[k].n) + '"><span aria-hidden="true">' + DC.SYM[k].e + '</span></button>'; }).join('') + '</div></div>' +
    '<div class="pave-msg" aria-live="polite"></div>';
  var w = PAGE.fenetre(html, {classe:'pave-fen'}), f = w.el, occupe = false;
  function maj(){
    qa('[data-case]', f).forEach(function(c, i){ var k = seq[i]; c.textContent = k ? DC.SYM[k].e : ''; c.classList.toggle('pleine', !!k); });
    q('[data-efface]', f).disabled = !seq.length;
  }
  function dire(t, ko){ var m = q('.pave-msg', f); m.innerHTML = PAGE.bulle(t, ko ? 'ko' : ''); var b = m.firstChild; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  function valider(){
    var s = seq.slice(); seq = []; occupe = false; maj();
    var id = DC.lire(s);
    if(!id){ son('ko'); dire('Hmm… ce code ne veut rien dire. Vérifie les symboles avec ton équipier, et recommence.', true); return; }
    var c = DC.CODES[id];
    if(c.a !== o.tablette){ son('ko'); dire('Ce code est pour ' + (NOMS_ROLES[c.a] || 'un équipier') + ' : dis-lui de le taper sur sa tablette !', true); return; }
    if(o.deja && o.deja(id)){ son('ko'); dire('Tu l’as déjà reçu ! Un code ne marche qu’une fois.', true); return; }
    son('ok'); w.fermer(); o.recevoir(id);
  }
  f.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b || occupe) return;
    if(b.hasAttribute('data-sym')){
      if(seq.length >= 3) return;
      seq.push(b.getAttribute('data-sym')); son('tic'); maj();
      if(seq.length === 3){ occupe = true; setTimeout(valider, 260); }
    } else if(b.hasAttribute('data-efface')){ seq.pop(); son('tic'); maj(); }
  });
  maj();
  return w;
};
/* un code en grand (trois cases) */
PAGE.codeGrand = function(id){
  var DC = global.DONJON_CODES;
  return '<div class="code-grand" data-code="' + esc(id) + '">' + DC.code(id).map(function(k){ return '<b title="' + esc(DC.SYM[k].n) + '">' + DC.SYM[k].e + '</b>'; }).join('') + '</div>';
};

/* ================= des étincelles (trajectoires calculées une fois, jouées par la carte graphique) ================= */
PAGE.etincelles = function(parent, x, y, n, o){
  o = o || {};
  if(!parent || !parent.animate && !Element.prototype.animate) return;
  for(var i = 0; i < (n || 14); i++){
    var e = el('i', 'etin ' + (o.cls || ''));
    e.style.left = x + 'px'; e.style.top = y + 'px';
    parent.appendChild(e);
    var a = Math.random() * Math.PI * 2, d = (o.dist || 60) * (.4 + Math.random() * .8), s = .6 + Math.random() * 1.1;
    var an = e.animate([{transform:'translate(0,0) scale(' + s + ')', opacity:1}, {transform:'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d - (o.monte || 20)) + 'px) scale(.2)', opacity:0}],
      {duration:(o.duree || 900) * (.7 + Math.random() * .6), easing:'cubic-bezier(.2,.7,.4,1)', fill:'forwards'});
    an.onfinish = (function(x2){ return function(){ x2.remove(); }; })(e);
  }
};
PAGE.attendre = function(ms){ return new Promise(function(ok){ setTimeout(ok, ms); }); };
})(window);
