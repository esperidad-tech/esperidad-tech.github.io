/* ==========================================================
   Brumeval — l'établi des plantes de l'Alchimiste, dans le jeu (enquête 3 ; conçu dans E3-atelier-des-plantes.md).

   Refait le 12 novembre (Romain, 8 h 50 : « ton établi, il est pas joli. C'est que des icônes, il n'y a pas de magie… je veux que tu
   reprennes le modèle du laboratoire d'analyse ») : l'établi lui-même est maintenant une page à part, src/etabli/ (assemblée par
   build.py dans window.ETABLI_HTML), comme le labo. On l'ouvre dans un cadre, en plein écran, par-dessus l'atelier : ses dessins, ses
   styles et ses sons restent chez lui. Le jeu et l'établi se parlent par de petits messages (postMessage).

   · M.etabliDispo() : cette enquête a-t-elle des plantes à préparer ?   · M.ouvrirEtabli() : l'atelier l'appelle (bulle « 🌿 Préparer »).
   · Le jeu envoie à l'établi (window.ETABLI_CFG, écrit dans la page du cadre) : les plantes cueillies (P.plantes), les potions faites,
     ce qui était en route (P.etabli), l'établi et le mur de l'atelier (style), les sons, la nuit et le code du sac, l'explication à montrer.
   · L'établi répond : « finie » (une potion est prête : P.vus['fiole:<id>'] = 1, une note au Carnet ; on lui renvoie le nouveau code du sac),
     « etat », « lire » (un bouton 🔊 : jamais de lecture toute seule), « stop », « introVue », « sacVu », « donjon », « quitter ».
   · Les recettes et les plantes : plantes-donnees.js (la même source pour le jeu et pour la page).
   · Jamais d'échec : un geste faux donne ce que ça donnerait pour de vrai, et rien n'est perdu.
   · Le sac : la nuit, il montre les potions faites et leur code (sac:<n>, n = un bit par potion : E.codesPlus, e3.js) pour le Pisteur ;
     il le tape dans son onglet Code : P.sac = la liste des potions (elle part avec lui dans le donjon).
   Chargé APRÈS moteur-actions.js, grands.js, plantes-donnees.js et plantes-dessins.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, PLD = window.PLD, DN = window.PLANTES_DONNEES;
if(!M || !PLD || !DN) return;
var esc = M.esc, ORDRE = DN.ORDRE, ORDRE_PL = DN.ORDRE_PL, PL = DN.PL, RE = DN.RE;
window.PLANTES_RECETTES = {ORDRE:ORDRE, RE:RE, PL:PL};   /* (pour les robots d'essai et le vérificateur) */

/* ---------- Ce que sait le jeu ---------- */
function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
M.etabliDispo = function(){ var E = enquete(); return !!(window.ETABLI_HTML && E && E.plantes && M.P && M.P() && M.role() === 'alchimiste'); };
function faite(id){ var P = M.P(); return !!(P && P.vus['fiole:' + id]); }
function faites(){ return ORDRE.filter(faite); }
function aPlante(k){ var P = M.P(); return !!(P && P.plantes && P.plantes[k] > 0); }
/* les plantes cueillies dont la potion n'est pas encore faite : le signe « 🌿 À préparer ! » de l'établi */
M.plantesEnAttente = function(){ return M.etabliDispo() ? ORDRE_PL.filter(function(k){ return aPlante(k) && !faite(PL[k].potion); }).length : 0; };
function nuit(){ var E = enquete(), P = M.P(); return !!(E && P && E.moments[Math.min(P.moment, E.moments.length - 1)] === 'nuit'); }
M.sacBits = function(){ var n = 0; ORDRE.forEach(function(id, i){ if(faite(id)) n |= (1 << i); }); return n; };
M.sacDe = function(n){ return ORDRE.filter(function(id, i){ return (n >> i) & 1; }); };
/* le signe au-dessus de l'établi, la nuit : le sac attend son code */
M.etabliSigne = function(){ return (M.etabliDispo() && nuit() && !(M.P().vus['sac:donne'])) ? '🎒 Ton sac !' : null; };

/* ---------- La page de l'établi : un cadre, en plein écran, par-dessus l'atelier (comme le labo) ---------- */
var CADRE = 'etabli-cadre';
/* l'établi et le mur choisis dans l'atelier : la page les reprend (5 formes × 8 couleurs chacun) */
function style(){
  var a = M.S.atelier || {}, et = (a.objets || []).filter(function(o){ return o.id === 'et'; })[0], st = et ? (et.st || 0) : ((a.etabli || {}).st || 0), fond = (a.deco || {}).fond || 0;
  return {paF:st % 5, paT:st % 8, murF:fond % 5, murT:fond % 8};
}
/* le code du sac, en trois formes (seulement la nuit, et s'il y a au moins une potion) */
function sacFiche(){
  if(!nuit() || !faites().length) return null;
  try{ return {formes:M.code('sac:' + M.sacBits()).map(function(s){ return D.SYM[s].e; })}; }catch(e){ return null; }
}
function donjonDispo(){ try{ return !!(M.donjonBoutonAlchimiste && M.donjonBoutonAlchimiste()); }catch(e){ return false; } }
function plantesDispo(){ var P = M.P(), r = {}; ORDRE_PL.forEach(function(k){ r[k] = (P.plantes && P.plantes[k] > 0) ? P.plantes[k] : 0; }); return r; }
function fiche(){
  var P = M.P(), S = M.S;
  return {jeu:true, plantes:plantesDispo(), faites:faites(), etat:P.etabli || null, style:style(), son:!(S.options && S.options.son === false),
    intro:!S.etabliIntro, nuit:nuit(), sac:sacFiche(), sacVu:!!P.vus['sac:donne'], donjon:donjonDispo(), vite:!!window.BRUMEVAL_ETABLI_VITE};
}
function cadre(){ return document.getElementById(CADRE); }
M.etabliOuvert = function(){ return !!cadre(); };
M.ouvrirEtabli = function(){
  if(!M.etabliDispo() || cadre()) return false;
  M.stop && M.stop();
  var f = document.createElement('iframe');
  f.id = CADRE; f.className = 'labo-cadre etabli-cadre'; f.setAttribute('title', 'L\'établi des plantes'); f.setAttribute('allow', 'autoplay; fullscreen');
  /* la fiche est écrite dans la page du cadre, avant ses programmes (« < » échappé : rien ne peut fermer la balise) */
  var cfg = JSON.stringify(fiche()).replace(/</g, '\\u003c');
  f.srcdoc = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><script>window.ETABLI_CFG = ' + cfg + ';<\/script></head><body>' + window.ETABLI_HTML + '</body></html>';
  document.body.appendChild(f);
  document.documentElement.classList.add('labo-ouvert');
  try{ f.focus(); }catch(e){}
  return true;
};
M.fermerEtabli = function(){
  var f = cadre(); if(!f) return;
  f.remove(); document.documentElement.classList.remove('labo-ouvert');
  M.stop && M.stop(); M.sauver(); M.son('clic'); M.render();
};
/* Une potion est prête (les mêmes effets qu'avant : la fiole, la plante utilisée, la note au Carnet) */
function finie(id){
  var P = M.P(), r = RE[id], toutes;
  if(!P || !r || P.vus['fiole:' + id]) return;
  P.vus['fiole:' + id] = 1;
  if(P.plantes && P.plantes[r.plante] > 0) P.plantes[r.plante]--;
  M.noter('Potion prête : ' + r.nom.charAt(0).toLowerCase() + r.nom.slice(1) + '. ' + r.sert, '🧪');
  toutes = faites().length === ORDRE.length;
  if(toutes) M.noter('Les sept potions de la nuit sont prêtes !', '🎒');
  delete P.etabli;
  M.sauver();
}
window.addEventListener('message', function(e){
  var m = e.data, f = cadre();
  if(!m || m.etabli !== 1 || !f || e.source !== f.contentWindow) return;
  var P = M.P && M.P();
  if(!P) return;
  if(m.type === 'etat'){ if(m.etat && typeof m.etat === 'object'){ P.etabli = m.etat; M.sauver(); } }
  else if(m.type === 'finie'){
    finie(String(m.id));
    /* on répond : ce que le jeu sait maintenant (le code du sac change avec chaque potion) */
    try{ f.contentWindow.postMessage({etabli:1, type:'maj', faites:faites(), plantes:plantesDispo(), nuit:nuit(), sac:sacFiche(), donjon:donjonDispo()}, '*'); }catch(err){}
  }
  else if(m.type === 'lire'){ if(m.t) M.lire(String(m.t)); }
  else if(m.type === 'stop'){ M.stop && M.stop(); }
  else if(m.type === 'introVue'){ M.S.etabliIntro = 1; M.sauver(); }
  else if(m.type === 'sacVu'){ if(nuit() && faites().length){ P.vus['sac:donne'] = 1; M.sauver(); } }
  else if(m.type === 'donjon'){ if(m.etat && typeof m.etat === 'object') P.etabli = m.etat; M.fermerEtabli(); if(M.A['ds-aller']) M.A['ds-aller'](); }   /* 🫕 le chaudron du donjon (descente.js) */
  else if(m.type === 'quitter'){ if(m.etat && typeof m.etat === 'object') P.etabli = m.etat; M.fermerEtabli(); }
});

/* ---------- Le sac, en petites fioles (la fenêtre du Pisteur, la fenêtre de la descente : descente.js) ---------- */
function fiolesSac(l){
  l = l || [];
  return '<div class="pl-sac-fioles">' + ORDRE.map(function(id){ var f = l.indexOf(id) >= 0; return '<span class="pl-fiole' + (f ? ' pl-pleine' : '') + '">' + PLD.fiole(f ? RE[id].coul : null) + '<small>' + esc(RE[id].court) + '</small></span>'; }).join('') + '</div>';
}
M.sacFiolesHTML = fiolesSac;

/* L'Alchimiste n'« explore » pas un lieu avant d'y agir (moteur-roles.js, feuilleLieu) : ses points s'ouvrent tout de suite */
if(M.A && M.A.point){
  var pointAv = M.A.point;
  M.A.point = function(el){
    var P = M.P();
    if(P && M.role() === 'alchimiste' && el && el.dataset && el.dataset.l) P.vus['explore:' + el.dataset.l] = P.moment;
    return pointAv.apply(this, arguments);
  };
}

/* ---------- Le code du sac, tapé par le Pisteur (moteur-actions.js, traiterCode → M.codeSpecial) ---------- */
var special0 = M.codeSpecial;
M.codeSpecial = function(t, x, id){
  if(t === 'sac'){
    var P = M.P(), l = M.sacDe(+x), deja = P.sac && P.sac.join(',') === l.join(',');
    P.sac = l; P.recus['sac'] = true; P.vus['sac:recu'] = 1;
    ORDRE.forEach(function(k){ if(l.indexOf(k) >= 0) P.vus['sac:' + k] = 1; else delete P.vus['sac:' + k]; });   /* (ce qu'il y a dedans : l'acide pour la grille du puits) */
    if(!deja) M.noter('Le sac de l\'Alchimiste : ' + l.map(function(k){ return RE[k].court.toLowerCase(); }).join(', ') + '.', '🎒');
    M.son('gain'); M.sauver();
    M.ouvrir({type:'plantes', vue:'sac-recu'});
    return true;
  }
  return special0 ? special0.apply(this, arguments) : false;
};
/* (la fenêtre du Pisteur : le sac qu'il vient de recevoir) */
M.plantesHTML = function(m){
  var P = M.P(), l = (P && P.sac) || [], n = l.length;
  var t = 'L\'Alchimiste te confie son sac : ' + n + ' potion' + (n > 1 ? 's' : '') + '. Compte-les avec lui ! ' +
    (n === 7 ? 'Tout y est.' : 'S\'il en prépare d\'autres avant de descendre, il te donnera un nouveau code.');
  return '<div class="b-info-modal pl-sac-recu"><div class="b-grand-ic">🎒</div><h2>Le sac de l\'Alchimiste</h2>' + fiolesSac(l) +
    '<p>' + esc(t) + '</p>' + M.lireBtn(t) + '<button class="btn" data-act="fermer">Fermer</button></div>';
};
M.sacPotions = function(){ var P = M.P(); return (P && P.sac) || null; };
})();
