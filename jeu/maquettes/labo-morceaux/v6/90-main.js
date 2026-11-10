
/* ============ Bulles et petites secousses ============ */
var bulleT;
function bulle(x, y, t, ms){
  var c = $('#calque'), b = c.querySelector('.bulle-o'); if(b) b.remove();
  b = document.createElement('div'); b.className = 'bulle-o'; b.textContent = t; b.style.left = Math.max(12, Math.min(88, x/12)) + '%'; b.style.top = (y/6.4) + '%'; c.appendChild(b);
  clearTimeout(bulleT); bulleT = setTimeout(function(){ b.remove(); }, ms || 4200);
}
function secouer(g){ if(!g) return; son('non'); g.classList.remove('secoue-svg'); void g.getBoundingClientRect(); g.classList.add('secoue-svg'); setTimeout(function(){ g.classList.remove('secoue-svg'); }, 500); }

/* ============ Choisir ce qu'on analyse : les outils qui peuvent servir s'allument, les autres s'éteignent ============ */
function utilisable(outil){
  var o = S.sel && OBJETS[S.sel]; if(!o) return null;
  if(outil === 'loupe') return !o.liquide;
  if(outil === 'micro') return S.sel === 'fil';
  if(outil === 'test') return !!o.liquide;
  return true;
}
function majOutils(){
  $$('#scene [data-outil]').forEach(function(g){ var u = utilisable(g.dataset.outil); g.classList.toggle('ok', u === true); g.classList.toggle('non', u === false); });
  document.body.classList.toggle('choisi', !!S.sel);
  var l = $('#gLame'); if(l) l.classList.toggle('sel', S.sel === 'fil');
}
function selectionner(t){
  if(S.mode || S.occupe) return; if(t === 'fil' && mimiGene()) return; S.sel = t; son('choisir'); dessinerLame(); dessinerCoupes(); majOutils();
  var p = posCible(); bulle(p.x, p.y - 18, S.trouves[t] ? '✅ ' + nomTrouve(t) : OBJETS[t].nom, 1900);
}

/* ============ Les gouttes et la flamme ============ */
function goutte(k){
  if(S.occupe || S.mode) return; var b = BOCAUX.filter(function(x){ return x.k === k; })[0], cible = posCible(), pip = $('#pipette'), gt = $('#goutte');
  S.occupe = true; son(b.poudre ? 'poudre' : 'pipette'); pip.style.display = ''; $('#pipLiq').setAttribute('fill', b.poudre ? '#f6f6f2' : b.liq);
  var x0 = b.x, y0 = b.y - 96, x1 = cible.x, y1 = cible.y - 52;
  tween(560, function(p){ pip.setAttribute('transform', 'translate(' + f1(x0 + (x1 - x0)*p) + ',' + f1(y0 + (y1 - y0)*p - Math.sin(p*Math.PI)*30) + ')'); }, function(){
    gt.style.display = ''; gt.querySelector('path').setAttribute('fill', TACHE[k].replace(/[\d.]+\)$/, '1)'));
    tween(320, function(p){ gt.setAttribute('transform', 'translate(' + x1 + ',' + f1(y1 + 12 + p*36) + ')'); }, function(){
      gt.style.display = 'none'; son(b.poudre ? 'poudre' : 'goutte'); if(b.vapeur) son('chaud'); effetTache(cible, k); reaction(k, cible);
      tween(440, function(p){ pip.setAttribute('transform', 'translate(' + f1(x1 + (x0 - x1)*p) + ',' + f1(y1 + (y0 - y1)*p - Math.sin(p*Math.PI)*30) + ')'); }, function(){ pip.style.display = 'none'; S.occupe = false; majOutils(); });
    });
  });
}
function effetTache(cible, k){
  var e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); e.setAttribute('cx', cible.x); e.setAttribute('cy', cible.y + 2); e.setAttribute('fill', TACHE[k]); $('#effets').appendChild(e);
  var pali = S.sel === 'noir' && k === 'iode', fil = S.sel === 'fil';
  tween(600, function(p){ e.setAttribute('rx', 5 + p*(fil ? 40 : 28)); e.setAttribute('ry', 2 + p*(fil ? 16 : 10)); });
  setTimeout(function(){ tween(pali ? 1600 : 900, function(p){ e.setAttribute('opacity', 1 - p); if(pali) e.setAttribute('fill', 'rgba(' + Math.round(205 + 40*p) + ',' + Math.round(115 + 110*p) + ',' + Math.round(30 + 170*p) + ',' + (.65*(1 - p*.6)) + ')'); }, function(){ e.remove(); }); }, pali ? 900 : 2600);
}
function petitesBulles(cible){
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); $('#effets').appendChild(g);
  for(var i=0;i<6;i++) g.insertAdjacentHTML('beforeend', '<circle cx="' + (cible.x - 10 + Math.random()*20) + '" cy="' + cible.y + '" r="' + (1.5 + Math.random()*2) + '" fill="none" stroke="#fff" stroke-width="1.5"/>');
  var cs = g.querySelectorAll('circle'); tween(1400, function(p){ cs.forEach(function(c, i){ c.setAttribute('cy', cible.y - p*(18 + i*4)); c.setAttribute('opacity', 1 - p); }); }, function(){ g.remove(); });
}
function nuageRouge(cible, fin){
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); g.setAttribute('cx', cible.x); g.setAttribute('cy', cible.y); g.setAttribute('fill', 'rgba(217,100,90,.75)'); $('#effets').appendChild(g);
  tween(1000, function(p){ g.setAttribute('rx', 10 + p*46); g.setAttribute('ry', 4 + p*18); }, function(){ setTimeout(function(){ g.remove(); fin(); }, 300); });
}
function reaction(k, cible){
  var r = REA[S.sel][k]; if(!r) return;
  bulle(cible.x, cible.y - 20, r.t, 5200);
  if(r.cree && !S.coupes.some(function(c){ return c && c.t === r.cree; })) nuageRouge(cible, function(){ ajouterCoupe(r.cree); dessinerCoupes(); });
  if(r.fx === 'violet' || r.fx === 'orange'){ S.teinte = r.fx === 'violet' ? '#8a4f9e' : '#e08a50'; dessinerCoupes(); setTimeout(function(){ S.teinte = null; dessinerCoupes(); }, 2600); }
  if(r.fx === 'bulles'){ petitesBulles(cible); son('bulles'); }
  if(r.cree || r.fx === 'violet' || r.fx === 'orange' || r.fx === 'pali') son('taches');
}
function flamme(){
  if(S.occupe || S.mode) return; var cible = posCible(), pince = $('#pince'), bout = $('#pinceBout'), r = REA[S.sel].flamme, o = OBJETS[S.sel], fil = S.sel === 'fil';
  S.occupe = true; son('pince'); pince.style.display = ''; bout.setAttribute('fill', fil ? ROUGE : (o.coul || couleurRouge()));
  var x0 = cible.x, y0 = cible.y, x1 = BOUGIE.x, y1 = BOUGIE.y - 86*BOUGIE.e;
  tween(680, function(p){ pince.setAttribute('transform', 'translate(' + f1(x0 + (x1 - x0)*p) + ',' + f1(y0 + (y1 - y0)*p - Math.sin(p*Math.PI)*46) + ')'); }, function(){
    var f = $('#gLampe .flamme'); f.style.transform = 'scale(1.45)'; son('flamme');
    var fumee = ''; for(var i=0;i<4;i++) fumee += '<circle cx="' + (x1 + i*4) + '" cy="' + (y1 - 14) + '" r="' + (5 + i*2.5) + '" fill="rgba(120,120,130,.45)"/>';
    $('#effets').insertAdjacentHTML('beforeend', '<g id="fumee">' + fumee + '</g>');
    var cs = document.querySelectorAll('#fumee circle'); tween(1300, function(p){ cs.forEach(function(c, i){ c.setAttribute('cy', y1 - 14 - p*(60 + i*18)); c.setAttribute('opacity', 1 - p); }); });
    if(fil) bout.setAttribute('fill', '#1a1210'); if(S.sel === 'noir') bout.setAttribute('fill', '#ff6a2a');
    attendre(1300, function(){ f.style.transform = ''; var g = $('#fumee'); if(g) g.remove(); bulle(x1 + 60, y1 - 6, r.t, 5600);
      tween(520, function(p){ pince.setAttribute('transform', 'translate(' + f1(x1 + (x0 - x1)*p) + ',' + f1(y1 + (y0 - y1)*p) + ')'); }, function(){ pince.style.display = 'none'; S.occupe = false; majOutils(); });
    });
  });
}

/* ============ L'ardoise : quand le code est écrit, on la touche pour le voir en grand ============ */
function ouvrirArdoise(){ if(S.occupe || !codePret()) return; ouvrirMode('ardoise', ''); camera(ARD.x + ARD.w/2, ARD.y + ARD.h/2 + 2, 3.4); }

/* ============ Branchements ============
   Un toucher « à côté », dans un gros plan, fait revenir d'un pas : les échantillons se rangent, puis le tiroir se referme,
   puis on quitte le gros plan. (La croix en haut à droite quitte d'un seul coup.) */
var clic = {pris:false, mode:null, occupe:false};
document.addEventListener('click', function(){ clic.pris = false; clic.mode = S.mode; clic.occupe = S.occupe; }, true);
function dansVerre(e){ var v = S.verre, b = $('#hudBoite').getBoundingClientRect(), u = b.width/1200; return !!v && Math.hypot((e.clientX - b.left)/u - v.x, (e.clientY - b.top)/u - v.y) < v.r; }
function reculer(e){
  if(S.occupe) return;
  if(S.mode === 'loupe'){ if(dansVerre(e)) return; if(S.casier) fermerCasier(); else if(S.tiroir) fermerTiroir(); else fermerMode(); }
  else if(S.mode === 'micro'){ if(e.target.closest('#gMicro, [data-act="coupe"]')) return; fermerMode(); }
  else fermerMode();
}
$('#scene').addEventListener('click', function(e){
  var g = e.target.closest('[data-act]'); if(!g || S.occupe) return; var a = g.dataset.act, z, k;
  /* dans un gros plan, l'image reste vivante : les tiroirs et leurs casiers sous la loupe, la molette du microscope */
  if(S.mode === 'loupe'){
    if(a !== 'tiroir') return; clic.pris = true;
    if(S.tiroir !== g.dataset.t) ouvrirTiroir(g.dataset.t); else if((k = e.target.closest('[data-casier]'))) ouvrirCasier(k.dataset.casier); else fermerTiroir();
    return; }
  if(S.mode === 'micro'){ if((z = e.target.closest('[data-zoom]'))){ clic.pris = true; changerZoom(+z.dataset.zoom); } else if(a === 'molette' || a === 'micro'){ clic.pris = true; changerZoom(({10:40, 40:100, 100:10})[S.zoom]); } return; }
  if(S.mode) return;
  clic.pris = true;
  if(a === 'molette') g = $('#gMicro'), a = 'micro';
  if(a === 'ardoise'){ if(codePret()) ouvrirArdoise(); else son('clic'); return; }
  if(a === 'lame') return selectionner('fil');
  if(a === 'coupe'){ var c = S.coupes[+g.dataset.i]; if(c) selectionner(c.t); return; }
  /* un outil : il faut d'abord avoir choisi quelque chose à analyser, et que l'outil puisse servir */
  if(!S.sel){ $$('#scene .objet').forEach(secouer); return; }
  if(a === 'tiroir'){ if(OBJETS[S.sel].liquide){ secouer(g); return; } if(S.sel === 'fil' && mimiGene()) return; return ouvrirLoupe(g.dataset.t); }
  if(utilisable(g.dataset.outil) === false){ secouer(g); return; }
  if(S.sel === 'fil' && mimiGene()) return;
  if(a === 'loupe') ouvrirLoupe(); else if(a === 'micro') ouvrirMicro();
  else if(a === 'goutte') goutte(g.dataset.k); else if(a === 'flamme') flamme(); else if(a === 'test') ouvrirTest();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && S.mode) return fermerMode();
  if((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('svg [role="button"]')){ e.preventDefault(); e.target.closest('svg [role="button"]').dispatchEvent(new MouseEvent('click', {bubbles:true})); }
});
document.addEventListener('click', function(e){
  var b;
  if(clic.pris) return;
  if(e.target.closest('#bFermer')) return fermerMode();
  if(e.target.closest('#bRefermer')) return fermerTiroir();
  if((b = e.target.closest('[data-ech]'))) return essayer(b.dataset.ech, b);
  if((b = e.target.closest('[data-temoin]'))) return essayerTemoin(b.dataset.temoin, b);
  if((b = e.target.closest('[data-casier]'))) return ouvrirCasier(b.dataset.casier);
  if(e.target.closest('#zoomTxt')) return changerZoom(({10:40, 40:100, 100:10})[S.zoom]);
  if(e.target.closest('#bReglages')){ var pn = $('#reglages'); pn.hidden = !pn.hidden; son('clic'); return; }
  if(e.target.closest('#bRecommencer')) return demarrer(S.niveau);
  if(e.target.closest('#bPlein')) return pleinEcran();
  if(e.target.closest('#bSon')){ SON.actif = !SON.actif; try { localStorage.setItem('brumeval-labo-son', SON.actif ? 'oui' : 'non'); } catch(err){} majStyles(); son('clic'); return; }
  if((b = e.target.closest('[data-style]'))){ var cle = b.dataset.style; ST[cle] = (ST[cle] + 1) % (cle.slice(-1) === 'F' ? 5 : THEMES.length); gardeStyle(); majStyles(); dessinerScene(); majOutils(); son('clic'); return; }
  if((b = e.target.closest('#nvF, #nvD'))) return demarrer(b.id === 'nvF' ? 'facile' : 'difficile');
  /* rien de tout ça : dans un gros plan, c'est un toucher « à côté » */
  if(clic.mode && clic.mode === S.mode && !clic.occupe && !e.target.closest('#hudBoite, #modeHaut, .barre-haut, .mimi')) reculer(e);
});
/* Les réglages de la maquette : la paillasse et le mur choisis dans l'atelier (dans le jeu, ils viendront de la sauvegarde) */
function majStyles(){
  $('#bSon').textContent = SON.actif ? '🔈 Sons' : '🔇 Sons'; $('#bSon').setAttribute('aria-pressed', String(SON.actif));
  $('#stPaF').textContent = FORMES_PA[ST.paF]; $('#stPaT').textContent = THEMES[ST.paT].nom; $('#stMurF').textContent = FORMES_MUR[ST.murF]; $('#stMurT').textContent = THEMES[ST.murT].nom;
}
/* Tout se mesure avec la même unité : --u = la taille d'un point du dessin à l'écran */
function mesure(){ var c = $('#cadre'); c.style.setProperty('--u', Math.min(c.clientWidth/1200, c.clientHeight/640) + 'px'); }
var rz; window.addEventListener('resize', function(){ mesure(); clearTimeout(rz); rz = setTimeout(function(){ if(S.mode === 'loupe'){ rendVerre(); majBas(); } else if(S.mode === 'micro') rendLentille(); else if(S.mode === 'test'){ rendBande(); majTemoins(); } }, 150); });

function pleinEcran(){
  var d = document, el = d.documentElement;
  try {
    var p = (d.fullscreenElement || d.webkitFullscreenElement) ? (d.exitFullscreen || d.webkitExitFullscreen).call(d) : (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    if(p && p.catch) p.catch(function(){});
  } catch(e){}
}
try { if(document.fullscreenEnabled || document.webkitFullscreenEnabled) $('#bPlein').hidden = false; } catch(e){}

function demarrer(niveau){
  if(S && S.mode){ S.occupe = false; fermerMode(); }
  neuf(niveau);
  $('#nvF').setAttribute('aria-pressed', String(niveau === 'facile')); $('#nvD').setAttribute('aria-pressed', String(niveau === 'difficile'));
  mesure(); majStyles(); dessinerScene();
  if(!mimi.el) poserMimi(); else mimiRetour();
  majOutils();
}
demarrer('facile');
window.__labo = {etat:function(){ return S; }, rendre:function(){ rendLentille(); }, mimi:mimi, mimiVient:mimiVient, style:ST, son:SON, sons:SONS};
})();
