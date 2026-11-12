
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
document.addEventListener('click', function(e){
  clic.pris = false;
  /* (le toucher qui suit un glisser-déposer ne compte pas) */
  if(clic.avale && Date.now() - clic.avale < 450){ clic.avale = 0; e.stopPropagation(); e.preventDefault(); }
}, true);
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
  else if(a === 'pendue') decrocher(g.dataset.k);
  else if(a === 'potion') toucherPotion(g.dataset.id);
});
/* ---------- Glisser-déposer (Romain, 12 novembre, 13 h 52) : une bûche, la cruche d'eau, l'huile, une allumette se prennent aussi au doigt,
   se font glisser et se lâchent sur la marmite ou sur l'alambic. « Toucher, puis toucher » marche toujours : les deux façons sont là. ---------- */
var glisse = null, DE_QUOI = {buche:'buches', allumette:'allumettes', cruche:'cruche', huilier:'huilier'};
function ptScene(e){ var sv = $('#scene'), m = sv.getScreenCTM(); if(!m) return {x:0, y:0}; var q = sv.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; q = q.matrixTransform(m.inverse()); return {x:q.x, y:q.y}; }
$('#scene').addEventListener('pointerdown', function(e){
  if(S.occupe || S.mode || glisse) return;
  var g = e.target.closest('[data-act="porte"]'); if(!g) return;
  glisse = {h:g.dataset.h, g:g, x0:e.clientX, y0:e.clientY, id:e.pointerId, bouge:false, el:null};
});
document.addEventListener('pointermove', function(e){
  if(!glisse || e.pointerId !== glisse.id) return;
  if(!glisse.bouge){
    if(Math.abs(e.clientX - glisse.x0) + Math.abs(e.clientY - glisse.y0) < 12) return;
    if(S.occupe || S.mode){ glisse = null; return; }
    if(glisse.h === 'huilier' && !S.faites.huile){ glisse = null; clic.avale = Date.now(); tenir('huilier'); return; }   /* (vide : elle le dit) */
    glisse.bouge = true; poser(); enleverBulle();
    var lv = glisse.g.querySelector('.leve');
    glisse.e = OU[DE_QUOI[glisse.h]].e;
    glisse.el = svgEl('<g pointer-events="none">' + (glisse.h === 'buche' ? bucheArt(0, 0, -14, 1.15) : (lv ? lv.outerHTML : '')) + '</g>');
    $('#vol').appendChild(glisse.el); glisse.g.classList.add('glisse'); document.body.classList.add('e-glisse');
    son(glisse.h === 'buche' ? 'buche' : 'clic');
  }
  var q = ptScene(e);
  glisse.el.setAttribute('transform', 'translate(' + f1(q.x) + ',' + f1(q.y + (glisse.h === 'buche' ? 6 : 46*glisse.e)) + ') scale(' + glisse.e + ')');
  if(e.cancelable) e.preventDefault();
}, {passive:false});
function finGlisse(e, annule){
  if(!glisse || (e && e.pointerId !== glisse.id)) return;
  var gl = glisse; glisse = null;
  if(!gl.bouge) return;                                   /* un simple toucher : le « click » fait le reste, comme avant */
  if(gl.el) gl.el.remove(); gl.g.classList.remove('glisse'); document.body.classList.remove('e-glisse');
  clic.avale = Date.now();
  if(annule || S.occupe || S.mode) return;
  var t = document.elementFromPoint(e.clientX, e.clientY), c = t && t.closest ? t.closest('[data-act="foyer"], [data-act="outil"]') : null;
  if(!c){ son('clic'); return; }                           /* lâché à côté : il retourne à sa place */
  S.H = gl.h; majEtat(); appliquer(gl.h, c.dataset.o);
  if(S.H === gl.h){ S.H = null; majEtat(); }               /* (après un glisser, on n'a plus rien « en main ») */
}
document.addEventListener('pointerup', function(e){ finGlisse(e, false); });
document.addEventListener('pointercancel', function(e){ finGlisse(e, true); });
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
  if(e.target.closest('[data-suite]')){ arreterLecture(); fermerMode(); if(toutesFaites() && S.sac) ouvrirCode(); return; }   /* après la septième potion : le code */
  if(e.target.closest('[data-fond]')){ arreterLecture(); return fermerMode(); }
  if(e.target.closest('#bReglages')){ var pn = $('#reglages'); pn.hidden = !pn.hidden; son('clic'); return; }
  if(e.target.closest('#bRecommencer')){ demarrer(); return; }
  if(e.target.closest('#bNuit')){ S.nuit = !S.nuit; S.donjon = S.nuit; $('#bNuit').setAttribute('aria-pressed', String(S.nuit)); majEtat(); son('clic'); return; }
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
/* (iPhone : la barre du navigateur apparaît ou s'en va, on tourne le téléphone… sans toujours prévenir par « resize » — et le dessin,
   resté trop grand, dépassait en haut et en bas : Romain, 12 novembre, 13 h 52. On remesure dès que le cadre change vraiment de taille.) */
window.addEventListener('orientationchange', function(){ setTimeout(mesure, 80); setTimeout(mesure, 450); });
if(window.visualViewport && visualViewport.addEventListener) visualViewport.addEventListener('resize', mesure);
if(window.ResizeObserver){ try{ new ResizeObserver(function(){ mesure(); }).observe(document.getElementById('cadre')); }catch(e){} }
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
  if(Array.isArray(c.trouvees)){ S.trouvees = {}; c.trouvees.forEach(function(k){ if(PL[k]) S.trouvees[k] = 1; }); }
  if(Array.isArray(c.faites)){ S.faites = {}; c.faites.forEach(function(id){ if(RE[id]) S.faites[id] = 1; }); }
  if('nuit' in c) S.nuit = !!c.nuit;
  if('sac' in c) S.sac = c.sac && Array.isArray(c.sac.formes) ? {formes:c.sac.formes.slice(0, 4)} : null;
  if('donjon' in c) S.donjon = !!c.donjon;
}
function demarrer(){
  if(S && S.mode){ S.occupe = false; fermerMode(); }
  neuf();
  if(CFG){ appliquerFiche(CFG); if(CFG.sacVu) S.sacVu = true; importer(CFG.etat); }
  else{ S.stock = ORDRE_PL.slice(); ORDRE_PL.forEach(function(k){ S.trouvees[k] = 1; }); regarnir(); S.sac = {formes:['🌙', '⭐', '🔥']}; }   /* (la maquette : tout est cueilli, et un code pour voir) */
  camera(600, 320, 1); mesure(); majStyles(); dessinerScene(); majEtat(); majQuitter();
}
demarrer();
/* le jeu répond (une potion vient d'être notée : le code du sac a changé) */
window.addEventListener('message', function(e){
  var m = e.data; if(!m || m.etabli !== 1 || e.source !== window.parent) return;
  if(m.type === 'maj'){ appliquerFiche(m); majEtat(); if(S.mode === 'sac'){ $('#hudBoite').innerHTML = codeHTML(); } }
});
if(CFG && CFG.intro) ouvrirIntro();
/* (pour les robots d'essai) */
window.__etabli = {etat:function(){ return S; }, exporter:exporter, libre:function(){ return !S.occupe; }, recettes:RE, plantes:PL, quitter:quitter, style:ST, son:SON, sons:SONS,
  texte:function(){ var b = $('#calque .bulle-o span'); return b ? b.textContent : ''; },
  /* boucler une potion d'un coup, sans les gestes */
  redessiner:function(){ majTout(); majEtat(); },
  finir:function(id){ var r = RE[id]; if(!r || S.faites[id]) return false; S.plante = r.plante; S.partie = r.partie; S.n = r.etapes.length - 1; finir(id, r.etapes[r.etapes.length - 1]); return true; }};
dire('pret');
})();
