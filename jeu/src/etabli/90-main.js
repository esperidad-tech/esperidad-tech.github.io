
/* ============ L'établi dans le jeu ============
   Dans le jeu, l'établi s'ouvre dans son propre cadre, par-dessus l'atelier (plantes.js), comme le labo. Le jeu lui donne sa fiche
   (window.ETABLI_CFG) : les plantes cueillies (plantes), les potions déjà faites (faites), ce qui était en route (etat), l'établi et le mur
   choisis dans l'atelier (style), les sons, la nuit (nuit), le code du sac (sac), le chaudron du donjon (donjon), l'explication à montrer (intro).
   L'établi lui répond par de petits messages : « finie » (une potion est prête : le jeu la note, et renvoie « maj » avec le nouveau code du sac),
   « etat » (à garder dans la sauvegarde), « lire » (un bouton 🔊), « stop », « introVue », « sacVu », « donjon », « quitter ».
   Sans fiche : c'est la maquette, toute seule (toutes les plantes sont là), avec ses réglages. */
var CFG = window.ETABLI_CFG || null, JEU = !!(CFG && CFG.jeu);
function dire(type, x){ if(!JEU) return; var m = {etabli:1, type:type}, k; if(x) for(k in x) m[k] = x[k]; try { window.parent.postMessage(m, '*'); } catch(e){} }
function garder(){ dire('etat', {etat:exporter()}); }
/* Jamais de lecture toute seule : seulement quand on touche un 🔊 */
function lire(t){
  if(JEU){ dire('lire', {t:t}); return; }
  try { var u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch(e){}
}
function arreterLecture(){ if(JEU) dire('stop'); else try { window.speechSynthesis.cancel(); } catch(e){} }
/* Le bouton du coin, dans le jeu : ✕ pour revenir à l'atelier ; jaune avec ✔ quand une potion vient d'être finie */
function majQuitter(){ var b = $('#bQuitter'); if(!b) return; var n = S.aDire.length; b.classList.toggle('aller', n > 0); b.textContent = n ? '✔' : '✕'; }
function quitter(){ if(S.occupe) return; if(S.mode) fermerMode(); arreterLecture(); dire('quitter', {etat:exporter(), finies:S.aDire.slice()}); S.aDire = []; majQuitter(); }

/* ---------- Les doigts ---------- */
var clic = {pris:false};
document.addEventListener('click', function(){ clic.pris = false; }, true);
$('#scene').addEventListener('click', function(e){
  if(S.occupe) return;
  clic.pris = true;
  /* de près : on touche une des trois parties de la plante ; à côté, on recule */
  if(S.mode === 'plante'){
    var pa = e.target.closest('.pl-pa'), pl = pa && pa.closest('.plante');
    if(pa && pl && pl.dataset.k === S.plante) prendre(pa.getAttribute('data-pa')); else fermerMode();
    return;
  }
  if(S.mode) return;
  var g = e.target.closest('[data-act]');
  if(!g){ poser(); enleverBulle(); return; }
  var a = g.dataset.act;
  if(a === 'plante') choisirPlante(g.dataset.k);
  else if(a === 'outil') toucherOutil(g.dataset.o);
  else if(a === 'foyer') toucherFoyer(g.dataset.o);
  else if(a === 'porte') tenir(g.dataset.h);
  else if(a === 'livre') ouvrirLivre();
  else if(a === 'sac') ouvrirSac();
  else if(a === 'potion') toucherPotion(g.dataset.id);
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){ if(S.mode && S.mode !== 'intro') return fermerMode(); if(JEU && !S.mode) return quitter(); }
  if(S.mode === 'livre' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return tournerPage(e.key === 'ArrowLeft' ? -1 : 1);
  if((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('svg [role="button"]')){ e.preventDefault(); e.target.closest('svg [role="button"]').dispatchEvent(new MouseEvent('click', {bubbles:true})); }
});
document.addEventListener('click', function(e){
  var b;
  if(clic.pris) return;
  if((b = e.target.closest('[data-lire]'))){ lire(b.dataset.lire); return; }
  if(e.target.closest('#bFermer')){ arreterLecture(); return fermerMode(); }
  if(e.target.closest('#bQuitter')) return quitter();
  if((b = e.target.closest('[data-page]'))) return pageLivreVa(b.dataset.page);
  if((b = e.target.closest('[data-tourne]'))) return tournerPage(+b.dataset.tourne);
  if(e.target.closest('[data-intro]')){ son('clic'); arreterLecture(); S.mode = 'intro'; fermerMode(); dire('introVue'); return; }
  if(e.target.closest('[data-donjon]')){ son('clic'); fermerMode(); dire('donjon', {etat:exporter()}); return; }
  if(e.target.closest('[data-fond]')){ arreterLecture(); return fermerMode(); }
  if(e.target.closest('#bReglages')){ var pn = $('#reglages'); pn.hidden = !pn.hidden; son('clic'); return; }
  if(e.target.closest('#bRecommencer')){ demarrer(); return; }
  if(e.target.closest('#bNuit')){ S.nuit = !S.nuit; S.sac = S.nuit ? {formes:['🌙', '⭐', '🔥']} : null; S.sacVu = false; $('#bNuit').setAttribute('aria-pressed', String(S.nuit)); majEtat(); son('clic'); return; }
  if(e.target.closest('#bSon')){ SON.actif = !SON.actif; try { localStorage.setItem('brumeval-etabli-son', SON.actif ? 'oui' : 'non'); } catch(err){} majStyles(); son('clic'); return; }
  if((b = e.target.closest('[data-style]'))){ var cle = b.dataset.style; ST[cle] = (ST[cle] + 1) % (cle.slice(-1) === 'F' ? 5 : THEMES.length); try { localStorage.setItem('brumeval-etabli-style', JSON.stringify(ST)); } catch(err){} majStyles(); dessinerScene(); majEtat(); son('clic'); return; }
  /* un toucher à côté, dans un gros plan : on recule */
  if(S.mode === 'plante' && !e.target.closest('#hudBoite, #modeHaut')) fermerMode();
});
function majStyles(){
  $('#bSon').textContent = SON.actif ? '🔈 Sons' : '🔇 Sons'; $('#bSon').setAttribute('aria-pressed', String(SON.actif));
  $('#stPaF').textContent = FORMES_PA[ST.paF]; $('#stPaT').textContent = THEMES[ST.paT].nom; $('#stMurF').textContent = FORMES_MUR[ST.murF]; $('#stMurT').textContent = THEMES[ST.murT].nom;
}
/* Tout se mesure avec la même unité : --u = la taille d'un point du dessin à l'écran */
function mesure(){ var c = $('#cadre'); c.style.setProperty('--u', Math.min(c.clientWidth/1200, c.clientHeight/640) + 'px'); }
window.addEventListener('resize', mesure);
/* Jamais de zoom par accident (comme dans le jeu) */
(function(){
  var bloquer = function(e){ if(e.cancelable) e.preventDefault(); };
  if('ongesturestart' in window || 'GestureEvent' in window){
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(t){ document.addEventListener(t, bloquer, {passive:false}); });
    document.addEventListener('touchmove', function(e){ if(e.touches && e.touches.length > 1) bloquer(e); }, {passive:false});
  }
  document.addEventListener('wheel', function(e){ if(e.ctrlKey) bloquer(e); }, {passive:false});
})();

/* ---------- La fiche du jeu ---------- */
if(!JEU){ try { var stE = JSON.parse(localStorage.getItem('brumeval-etabli-style') || 'null'); if(stE) for(var cleE in ST) if(typeof stE[cleE] === 'number') ST[cleE] = stE[cleE]; } catch(e){} }
if(CFG && CFG.style) for(var kS in ST) if(typeof CFG.style[kS] === 'number') ST[kS] = CFG.style[kS];
if(JEU){ SON.actif = CFG.son !== false; document.body.classList.add('jeu'); }
if(CFG && CFG.vite){ reduit = true; document.documentElement.classList.add('vite'); }   /* (les robots d'essai : tout va d'un coup) */
function appliquerFiche(c){
  if(!c) return;
  if(c.plantes && typeof c.plantes === 'object'){ S.dispo = {}; ORDRE_PL.forEach(function(k){ S.dispo[k] = c.plantes[k] > 0 ? c.plantes[k] : 0; }); }
  if(Array.isArray(c.faites)){ S.faites = {}; c.faites.forEach(function(id){ if(RE[id]) S.faites[id] = 1; }); }
  if('nuit' in c) S.nuit = !!c.nuit;
  if('sac' in c) S.sac = c.sac && Array.isArray(c.sac.formes) ? {formes:c.sac.formes.slice(0, 4)} : null;
  if('donjon' in c) S.donjon = !!c.donjon;
}
function demarrer(){
  if(S && S.mode){ S.occupe = false; fermerMode(); }
  neuf();
  if(CFG){ appliquerFiche(CFG); if(CFG.sacVu) S.sacVu = true; importer(CFG.etat); }
  else ORDRE_PL.forEach(function(k){ S.dispo[k] = 1; });
  camera(600, 320, 1); mesure(); majStyles(); dessinerScene(); majEtat(); majQuitter();
}
demarrer();
/* le jeu répond (une potion vient d'être notée : le code du sac a changé) */
window.addEventListener('message', function(e){
  var m = e.data; if(!m || m.etabli !== 1 || e.source !== window.parent) return;
  if(m.type === 'maj'){ appliquerFiche(m); majEtat(); if(S.mode === 'sac'){ $('#hudBoite').innerHTML = sacHTML(); } }
});
if(CFG && CFG.intro) ouvrirIntro();
/* (pour les robots d'essai) */
window.__etabli = {etat:function(){ return S; }, exporter:exporter, libre:function(){ return !S.occupe; }, recettes:RE, plantes:PL, quitter:quitter, style:ST, son:SON, sons:SONS,
  texte:function(){ var b = $('#calque .bulle-o span'); return b ? b.textContent : ''; },
  /* boucler une potion d'un coup, sans les gestes */
  finir:function(id){ var r = RE[id]; if(!r || S.faites[id]) return false; S.plante = r.plante; S.partie = r.partie; S.n = r.etapes.length - 1; finir(id, r.etapes[r.etapes.length - 1]); return true; }};
dire('pret');
})();
