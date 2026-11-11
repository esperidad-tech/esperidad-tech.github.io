
/* ============ Le labo dans le jeu ============
   Dans le jeu, le labo s'ouvre dans son propre cadre, par-dessus l'atelier. Le jeu lui donne sa fiche (window.LABO_CFG) :
   les objets reçus, dans l'ordre (recus), ceux qui sont déjà analysés (faits), ce qu'on avait déjà trouvé la dernière fois (etat),
   les vrais codes (codes), la paillasse et le mur choisis dans l'atelier (style), les sons, le chat.
   Le labo lui répond par de petits messages : « etat » (à garder dans la sauvegarde), « trouve », « fini » (un dossier est bouclé :
   le jeu note l'analyse), « lire » (un bouton 🔊), « quitter ». Sans fiche : c'est la maquette, toute seule, avec ses réglages. */
var CFG = window.LABO_CFG || null, JEU = !!(CFG && CFG.jeu);
function dire(type, x){ if(!JEU) return; var m = {labo:1, type:type}, k; if(x) for(k in x) m[k] = x[k]; try { window.parent.postMessage(m, '*'); } catch(e){} }
function garder(){ dire('etat', {etat:exporter()}); }
/* Jamais de lecture toute seule : seulement quand on touche un 🔊 */
function lire(t){
  if(JEU){ dire('lire', {t:t}); return; }
  try { var u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch(e){}
}
function nbMots(t){ return String(t).split(/\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length; }
/* Tout texte de plus de trois mots a son bouton 🔊 : la bulle reste alors le temps d'écouter */
function avecSon(el, t){
  if(nbMots(t) <= 3) return;
  var b = document.createElement('button'); b.type = 'button'; b.className = 'b-son'; b.setAttribute('aria-label', 'Écouter'); b.textContent = '🔊'; el.appendChild(b); el.classList.add('avec-son');
  b.addEventListener('click', function(e){ e.stopPropagation(); el.dataset.garde = '1'; lire(t); clearTimeout(el._t); el._t = setTimeout(function(){ el.remove(); }, 7000); });
}

/* ============ Bulles et petites secousses ============ */
var bulleT;
function bulle(x, y, t, ms){
  var c = $('#calque'), b = c.querySelector('.bulle-o'); if(b) b.remove();
  b = document.createElement('div'); b.className = 'bulle-o'; b.textContent = t; b.style.left = Math.max(12, Math.min(88, x/12)) + '%'; b.style.top = (y/6.4) + '%'; c.appendChild(b); avecSon(b, t);
  clearTimeout(bulleT); bulleT = setTimeout(function(){ if(!b.dataset.garde) b.remove(); }, ms || 4200);
}
function secouer(g){ if(!g) return; if(!secouer.t || Date.now() - secouer.t > 120){ secouer.t = Date.now(); son('non'); } g.classList.remove('secoue-svg'); void g.getBoundingClientRect(); g.classList.add('secoue-svg'); setTimeout(function(){ g.classList.remove('secoue-svg'); }, 500); }
/* Un petit papier « le savais-tu » : une chose vraie, dite une fois, après qu'on a reconnu (jamais avant : il ne souffle pas la réponse) */
function noteSavoir(t, ou){
  var h = $('#hudBoite'); if(!h || !S.mode) return; var vieux = h.querySelector('.savoir'); if(vieux) vieux.remove();
  var n = document.createElement('div'); n.className = 'savoir pose'; n.setAttribute('role', 'note');
  /* sous la loupe : du côté opposé à l'échantillon (là où le verre et ses deux flèches reviennent quand le tiroir se referme), jamais sur une flèche */
  var c = ou === 'loupe' ? posCible() : null, gauche = !!c && 600 + (c.x - borne(c.x, 520, 690))*1.45 > 600;
  var x = ou === 'test' ? 505 : (gauche ? 14 : 902), y = ou === 'test' ? 240 : (ou === 'micro' ? 132 : 74), w = ou === 'test' ? 560 : 284;
  n.style.cssText = 'left:calc(' + x + '*var(--u));top:calc(' + y + '*var(--u));width:calc(' + w + '*var(--u))';
  n.innerHTML = '<span class="sv-ic" aria-hidden="true">💡</span><span class="sv-t"></span>'; n.querySelector('.sv-t').textContent = t; h.appendChild(n); avecSon(n, t);
  n._t = setTimeout(function(){ n.remove(); }, 9000);
  n.addEventListener('click', function(e){ e.stopPropagation(); if(!e.target.closest('.b-son')) n.remove(); });
}
/* Une chose vient d'être reconnue : son petit papier, et, si tout ce que le dossier demande est là, le dossier est bouclé */
function apresTrouve(t){
  var o = OBJETS[t], d = dossierDe(t), ou = S.mode;
  /* (sous la loupe : le papier arrive une fois le tiroir refermé, quand le verre a repris sa place) */
  if(o.savoir && !S.dits['s:' + t]){ S.dits['s:' + t] = 1; attendre(ou === 'loupe' ? 2000 : 1000, function(){ if(ou && S.mode === ou && S.sel === t) noteSavoir(o.savoir, ou); }); }
  dire('trouve', {id:t, de:d, nom:nomTrouve(t)});
  if(d && !S.finis[d] && dossierBoucle(d)){ S.finis[d] = true; S.aDire.push(d); dire('fini', {id:d}); }
  garder();
}
/* (pour les robots d'essai : boucler un dossier d'un coup) */
function finirDossier(d){
  if(!S.dos[d] || S.finis[d]) return false;
  (OBJETS[d].requis || [d]).forEach(function(t){ S.trouves[t] = true; var cp = S.dos[d].coupes; if(!surCuir(t) && !cp.some(function(c){ return c && c.t === t; })){ var i = 0; while(cp[i]) i++; cp[i] = {t:t, n:1}; } });
  S.finis[d] = true; S.aDire.push(d); dire('fini', {id:d}); garder(); dessinerLame(); dessinerCoupes(); majArdoise(); majOutils(); majQuitter(); return true;
}
/* Le bouton du coin, dans le jeu : ✕ pour revenir à l'atelier ; jaune avec ✔ quand un dossier vient d'être bouclé (il y a du nouveau à noter) */
function majQuitter(){ var b = $('#bQuitter'); if(!b) return; var n = S.aDire.length; b.classList.toggle('aller', n > 0); b.textContent = n ? '✔' : '✕'; }
function quitter(){ if(S.occupe) return; if(S.mode) fermerMode(); dire('quitter', {etat:exporter(), finis:S.aDire.slice()}); S.aDire = []; majQuitter(); }

/* ============ Choisir ce qu'on analyse : les outils qui peuvent servir s'allument, les autres s'éteignent ============ */
function microReste(){ var it = D().items; return [10, 40, 100].some(function(z){ return it[z].some(function(i){ return !i.pris; }); }); }
/* L'eau chaude peut-elle encore faire sortir quelque chose de cet échantillon ? */
function aCreer(t){ var r = REA[t] || {}; return Object.keys(r).some(function(k){ return r[k].cree && !D().coupes.some(function(c){ return c && c.t === r[k].cree; }); }); }
/* Un outil s'allume seulement s'il peut encore apprendre quelque chose sur ce qu'on a choisi.
   Un échantillon reconnu : la loupe s'éteint pour lui ; s'il n'y a plus rien à en tirer, tout s'éteint. */
function utilisable(outil){
  var t = S.sel, o = t && OBJETS[t]; if(!o) return null; var fait = !!S.trouves[t], cuir = surCuir(t);
  if(outil === 'loupe') return !o.liquide && !fait;
  if(outil === 'micro') return cuir && !!o.scene && (microReste() || !!o.voirMicro);   /* (les pièces : on revient toujours voir la fêlure) */
  if(outil === 'test') return !!o.liquide && !fait;
  return !fait || (cuir && aCreer(t));       /* les bocaux, la bougie : tant qu'on cherche (ou tant que l'eau chaude peut encore faire déteindre) */
}
function majOutils(){
  $$('#scene [data-outil]').forEach(function(g){ var u = utilisable(g.dataset.outil); g.classList.toggle('ok', u === true); g.classList.toggle('non', u === false); });
  document.body.classList.toggle('choisi', !!S.sel);
  CUIRS.forEach(function(t){ var l = $('#ech-' + t); if(l) l.classList.toggle('sel', S.sel === t); });
}
function selectionner(t){
  if(S.mode || S.occupe) return;
  /* pas encore son tour (le tutoriel suit sa trame) : il attend */
  if(surCuir(t) && ATTENTE[t] && !S.finis[t]){ secouer($('#ech-' + t)); var qa = posEch(rangCuir(t)); bulle(qa.x, qa.y - 18, 'Plus tard !', 1700); return; }
  if(surCuir(t) && mimiGene()) return;
  /* un autre échantillon du cuir : ses coupelles, sa bandelette et son code prennent la place de ceux d'avant */
  var change = surCuir(t) && t !== S.dc; if(surCuir(t)) S.dc = t;
  S.sel = t; son('choisir'); dessinerLame(); dessinerCoupes(); if(change){ majArdoise(); majBandeScene(); } majOutils();
  var p = posCible(); bulle(p.x, p.y - 18, S.trouves[t] ? '✅ ' + nomTrouve(t) : nomObjet(t), 1900);
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
function reaDe(k){ return (REA[S.sel] || {})[k] || RIEN; }
function effetTache(cible, k){
  var e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); e.setAttribute('cx', cible.x); e.setAttribute('cy', cible.y + 2); e.setAttribute('fill', TACHE[k]); $('#effets').appendChild(e);
  var pali = reaDe(k).fx === 'pali', grand = surCuir(S.sel);
  tween(600, function(p){ e.setAttribute('rx', 5 + p*(grand ? 40 : 28)); e.setAttribute('ry', 2 + p*(grand ? 16 : 10)); });
  setTimeout(function(){ tween(pali ? 1600 : 900, function(p){ e.setAttribute('opacity', 1 - p); if(pali) e.setAttribute('fill', 'rgba(' + Math.round(205 + 40*p) + ',' + Math.round(115 + 110*p) + ',' + Math.round(30 + 170*p) + ',' + (.65*(1 - p*.6)) + ')'); }, function(){ e.remove(); }); }, pali ? 900 : 2600);
}
function petitesBulles(cible){
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); $('#effets').appendChild(g);
  for(var i=0;i<6;i++) g.insertAdjacentHTML('beforeend', '<circle cx="' + (cible.x - 10 + Math.random()*20) + '" cy="' + cible.y + '" r="' + (1.5 + Math.random()*2) + '" fill="none" stroke="#fff" stroke-width="1.5"/>');
  var cs = g.querySelectorAll('circle'); tween(1400, function(p){ cs.forEach(function(c, i){ c.setAttribute('cy', cible.y - p*(18 + i*4)); c.setAttribute('opacity', 1 - p); }); }, function(){ g.remove(); });
}
/* Le petit nuage de couleur qui sort de l'échantillon quand l'eau chaude le fait déteindre */
function nuage(cible, coul, fin){
  var g = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); g.setAttribute('cx', cible.x); g.setAttribute('cy', cible.y); g.setAttribute('fill', 'rgba(' + hexRgb(coul).join(',') + ',.75)'); $('#effets').appendChild(g);
  tween(1000, function(p){ g.setAttribute('rx', 10 + p*46); g.setAttribute('ry', 4 + p*18); }, function(){ setTimeout(function(){ g.remove(); fin(); }, 300); });
}
function reaction(k, cible){
  var r = reaDe(k), t = S.sel;
  bulle(cible.x, cible.y - 20, r.t, 5200);
  if(r.cree && !D().coupes.some(function(c){ return c && c.t === r.cree; })) nuage(cible, OBJETS[r.cree].coul || couleurLiq(r.cree), function(){ ajouterCoupe(r.cree); dessinerCoupes(); garder(); });
  if(r.fx === 'delave' && S.dos[t]){ S.dos[t].delave = true; garder(); }
  if(r.fx === 'vire'){ S.teinte = r.c; dessinerCoupes(); dessinerLame(); setTimeout(function(){ S.teinte = null; dessinerCoupes(); dessinerLame(); }, 2600); }
  if(r.fx === 'bulles'){ petitesBulles(cible); son('bulles'); }
  if(r.cree || r.fx === 'vire' || r.fx === 'pali') son('taches');
}
function flamme(){
  if(S.occupe || S.mode) return; var cible = posCible(), pince = $('#pince'), bout = $('#pinceBout'), r = reaDe('flamme'), o = OBJETS[S.sel], cuir = surCuir(S.sel);
  S.occupe = true; son('pince'); pince.style.display = ''; bout.setAttribute('fill', S.sel === 'fil' ? ROUGE : (o.liquide ? couleurLiq(S.sel) : (o.coul || ({poils:'#2a2a2e', plume:'#17171d'})[S.sel] || '#555')));
  var x0 = cible.x, y0 = cible.y, x1 = BOUGIE.x, y1 = BOUGIE.y - 86*BOUGIE.e;
  tween(680, function(p){ pince.setAttribute('transform', 'translate(' + f1(x0 + (x1 - x0)*p) + ',' + f1(y0 + (y1 - y0)*p - Math.sin(p*Math.PI)*46) + ')'); }, function(){
    var f = $('#gLampe .flamme'); f.style.transform = 'scale(1.45)'; son('flamme'); if(r.verte) f.classList.add('verte'); if(r.bleue) f.classList.add('bleue');
    /* (la poudre du pot noir fuse : une grosse fumée rouge ; enquête 2) */
    var fumee = ''; for(var i=0;i<(r.fumeeRouge ? 7 : 4);i++) fumee += '<circle cx="' + (x1 + (r.fumeeRouge ? (i - 3)*7 : i*4)) + '" cy="' + (y1 - 14) + '" r="' + (r.fumeeRouge ? 9 + i*3 : 5 + i*2.5) + '" fill="' + (r.fumeeRouge ? 'rgba(200,40,50,.55)' : 'rgba(120,120,130,.45)') + '"/>';
    $('#effets').insertAdjacentHTML('beforeend', '<g id="fumee">' + fumee + '</g>');
    var cs = document.querySelectorAll('#fumee circle'); tween(1300, function(p){ cs.forEach(function(c, i){ c.setAttribute('cy', y1 - 14 - p*(60 + i*18)); c.setAttribute('opacity', 1 - p); }); });
    if(cuir) bout.setAttribute('fill', '#1a1210'); if(r.braise) bout.setAttribute('fill', '#ff6a2a');
    attendre(1300, function(){ f.style.transform = ''; f.classList.remove('verte', 'bleue'); var g = $('#fumee'); if(g) g.remove(); bulle(x1 + 60, y1 - 6, r.t, 5600);
      if(r.trouve && !S.dits['t:' + r.trouve]){ S.dits['t:' + r.trouve] = 1; dire('trouve', {id:r.trouve}); garder(); }   /* (une trouvaille en plus, dite par la réaction : le cuivre) */
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
    /* un autre échantillon, visible à côté du verre : la loupe y va directement */
    if((a === 'lame' || a === 'coupe') && !dansVerre(e)){ var autre = a === 'lame' ? g.dataset.t : (D().coupes[+g.dataset.i] || {}).t; if(autre && !OBJETS[autre].liquide && autre !== S.sel && !(ATTENTE[autre] && !S.finis[autre])){ clic.pris = true; changerCible(autre); } return; }
    if(a !== 'tiroir') return; clic.pris = true;
    if(S.tiroir !== g.dataset.t) ouvrirTiroir(g.dataset.t); else if((k = e.target.closest('[data-casier]'))) ouvrirCasier(k.dataset.casier); else fermerTiroir();
    return; }
  if(S.mode === 'micro'){ if((z = e.target.closest('[data-zoom]'))){ clic.pris = true; changerZoom(+z.dataset.zoom); } else if(a === 'molette' || a === 'micro'){ clic.pris = true; changerZoom(({10:40, 40:100, 100:10})[S.zoom]); } return; }
  if(S.mode) return;
  clic.pris = true;
  if(a === 'molette') g = $('#gMicro'), a = 'micro';
  if(a === 'ardoise'){ if(codePret()) ouvrirArdoise(); else son('clic'); return; }
  if(a === 'lame') return selectionner(g.dataset.t);
  if(a === 'coupe'){ var c = D().coupes[+g.dataset.i]; if(c) selectionner(c.t); return; }
  /* un outil : il faut d'abord avoir choisi quelque chose à analyser, et que l'outil puisse servir */
  if(!S.sel){ if(a === 'tiroir') secouer(g); else $$('#scene .objet:not(.fait)').forEach(secouer); return; }
  /* les tiroirs ne s'ouvrent pas d'ici : il faut d'abord poser la loupe sur un échantillon (Romain, 10 novembre) */
  if(a === 'tiroir'){ secouer(g); return; }
  if(utilisable(g.dataset.outil) === false){ secouer(g); return; }
  if(surCuir(S.sel) && mimiGene()) return;
  if(a === 'loupe') ouvrirLoupe(); else if(a === 'micro') ouvrirMicro();
  else if(a === 'goutte') goutte(g.dataset.k); else if(a === 'flamme') flamme(); else if(a === 'test') ouvrirTest();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){ if(S.mode) return fermerMode(); if(JEU) return quitter(); }
  if((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('svg [role="button"]')){ e.preventDefault(); e.target.closest('svg [role="button"]').dispatchEvent(new MouseEvent('click', {bubbles:true})); }
});
document.addEventListener('click', function(e){
  var b;
  if(clic.pris) return;
  if(e.target.closest('#bFermer')) return fermerMode();
  if(e.target.closest('#bQuitter')) return quitter();
  if(e.target.closest('#bRefermer')) return fermerTiroir();
  if(e.target.closest('#bPrec')) return cibleVoisine(-1);
  if(e.target.closest('#bSuiv')) return cibleVoisine(1);
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
  if(clic.mode && clic.mode === S.mode && !clic.occupe && !e.target.closest('#hudBoite, #modeHaut, .barre-haut, .coin-jeu, .mimi')) reculer(e);
});
/* Les réglages de la maquette : la paillasse et le mur choisis dans l'atelier (dans le jeu, ils viennent de la sauvegarde) */
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
try { if(!JEU && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) $('#bPlein').hidden = false; } catch(e){}
/* Jamais de zoom par accident (comme dans le jeu, sans-zoom.js) : sur iPhone et iPad, pincer ou toucher deux fois ne zoome pas la page */
(function(){
  var bloquer = function(e){ if(e.cancelable) e.preventDefault(); };
  if('ongesturestart' in window || 'GestureEvent' in window){
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(t){ document.addEventListener(t, bloquer, {passive:false}); });
    document.addEventListener('touchmove', function(e){ if(e.touches && e.touches.length > 1) bloquer(e); }, {passive:false});
  }
  document.addEventListener('wheel', function(e){ if(e.ctrlKey) bloquer(e); }, {passive:false});
})();

/* La fiche du jeu : ce qu'on a reçu, les codes, la paillasse et le mur de l'atelier, les sons, le chat */
if(CFG){
  if(Array.isArray(CFG.recus)) CUIRS = CFG.recus.filter(function(d){ return OBJETS[d] && !OBJETS[d].de; }).slice(0, 4);
  if(CFG.codes) CODES = CFG.codes;
  if(Array.isArray(CFG.plusTard)) CFG.plusTard.forEach(function(d){ ATTENTE[d] = 1; });
  if(CFG.style) for(var kS in ST) if(typeof CFG.style[kS] === 'number') ST[kS] = CFG.style[kS];
  if(Array.isArray(CFG.chat) && CFG.chat.length === 3) CHAT = CFG.chat;
  if(JEU){ SON.actif = CFG.son !== false; SANS_MIMI = !CFG.mimi; document.body.classList.add('jeu'); }
}
function demarrer(niveau){
  if(S && S.mode){ S.occupe = false; fermerMode(); }
  neuf(niveau); S.aDire = [];
  if(CFG && CFG.etat) importer(CFG.etat);
  /* ce que le jeu sait déjà analysé (une ancienne partie, sans le détail) : le dossier est bouclé */
  if(CFG && Array.isArray(CFG.faits)) CFG.faits.forEach(function(d){ if(S.dos[d] && !S.finis[d]){ (OBJETS[d].requis || [d]).forEach(function(t){ S.trouves[t] = true; var cp = S.dos[d].coupes; if(!surCuir(t) && !cp.some(function(c){ return c && c.t === t; })){ var i = 0; while(cp[i]) i++; cp[i] = {t:t, n:1}; } }); S.finis[d] = true; S.codeEcrit[d] = true; } });
  /* on commence par le premier dossier qui n'est pas bouclé */
  S.dc = CUIRS.filter(function(d){ return !S.finis[d] && !ATTENTE[d]; })[0] || CUIRS.filter(function(d){ return !ATTENTE[d]; }).pop() || CUIRS[CUIRS.length - 1] || null;
  $('#nvF').setAttribute('aria-pressed', String(niveau === 'facile')); $('#nvD').setAttribute('aria-pressed', String(niveau === 'difficile'));
  mesure(); majStyles(); dessinerScene();
  if(!mimi.el) poserMimi(); else mimiRetour();
  majOutils(); majQuitter();
}
demarrer(CFG && CFG.niveau === 'difficile' ? 'difficile' : 'facile');
window.__labo = {etat:function(){ return S; }, exporter:exporter, finir:finirDossier, attente:function(){ return ATTENTE; }, quitter:quitter, rendre:function(){ rendLentille(); }, mimi:mimi, mimiVient:mimiVient, style:ST, son:SON, sons:SONS, objets:OBJETS, cuirs:function(){ return CUIRS.slice(); }};
dire('pret');
})();
