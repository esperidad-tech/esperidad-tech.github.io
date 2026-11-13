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
   · Le code des sept potions (13 novembre) : quand elles sont toutes prêtes, l'établi montre le code de l'Alchimiste pour le Pisteur — son
     code d'allure (descente.js). Le Pisteur le tape dans son onglet Code : P.sac = les sept potions (elles partent avec lui dans le donjon).
   Chargé APRÈS moteur-actions.js, grands.js, plantes-donnees.js et plantes-dessins.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, PLD = window.PLD, DN = window.PLANTES_DONNEES;
if(!M || !PLD || !DN) return;
var esc = M.esc, ORDRE = DN.ORDRE, ORDRE_PL = DN.ORDRE_PL, PL = DN.PL, RE = DN.RE;
/* (13 novembre) en plus des sept : la fleur de givre du donjon et sa potion (plantes-donnees.js). Elles ne suivent pas le héros d'une
   enquête à l'autre et ne comptent pas parmi « les sept potions » ; elles ont leur place à la tringle et dans le grimoire. */
var PLUS = DN.PLUS || [], PL_PLUS = DN.PL_PLUS || [], TOUTES_PL = ORDRE_PL.concat(PL_PLUS);
window.PLANTES_RECETTES = {ORDRE:ORDRE, RE:RE, PL:PL};   /* (pour les robots d'essai et le vérificateur) */

/* ---------- Ce que sait le jeu ---------- */
function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
/* D'une enquête à l'autre (Romain, 12 novembre, 12 h 45 : « dès l'enquête numéro 2 ») : les plantes trouvées et les potions faites suivent le
   héros. M.S.herbier = {plantes:{<plante>:n° de l'enquête où on l'a trouvée}, fioles:{<potion>:n° de l'enquête où on l'a faite}}.
   Au début d'une partie, on reprend ce qui vient d'une enquête D'AVANT ; rejouer une enquête repart de zéro pour ce qu'on y avait fait. */
function memoire(){ var S = M.S; if(!S.herbier || typeof S.herbier !== 'object') S.herbier = {}; S.herbier.plantes = S.herbier.plantes || {}; S.herbier.fioles = S.herbier.fioles || {}; return S.herbier; }
function suivre(){
  var P = M.P && M.P(); if(!P || !M.S || M.role() !== 'alchimiste') return;
  var g = memoire(), n = +P.id || 0;
  if(!P.herbierRepris){
    P.herbierRepris = 1; P.plantes = P.plantes || {};
    ORDRE.forEach(function(id){ if(g.fioles[id] >= n) delete g.fioles[id]; else if(g.fioles[id]) P.vus['fiole:' + id] = 1; });
    ORDRE_PL.forEach(function(k){ if(g.plantes[k] >= n) delete g.plantes[k]; else if(g.plantes[k]){ P.vus['plante:' + k] = 1; if(!g.fioles[PL[k].potion] && !(P.plantes[k] > 0)) P.plantes[k] = 1; } });
  }
  ORDRE_PL.forEach(function(k){ if(P.plantes && P.plantes[k] > 0 && !g.plantes[k]) g.plantes[k] = n; });
  ORDRE.forEach(function(id){ if(P.vus['fiole:' + id] && !g.fioles[id]) g.fioles[id] = n; });
}
/* La tringle de l'établi n'a que TROIS places (Romain, 12 novembre, 13 h 52). Une plante cueillie s'y pend s'il en reste une ; sinon elle
   attend devant la porte de l'atelier (P.plPorte). Là, on touche le panier : elles vont se pendre s'il y a de la place, sinon « plus de place ».
   Une place se libère quand la potion de la plante est faite. P.tringle = les plantes de l'établi (pendues, ou sur le linge). */
var PLACES = 3;
function utile(k){ var P = M.P(); return !!(P && P.plantes && P.plantes[k] > 0 && !P.vus['fiole:' + PL[k].potion]); }
function repartir(){
  var P = M.P(); if(!P) return [];
  if(!Array.isArray(P.tringle)) P.tringle = [];
  if(!P.plPorte || typeof P.plPorte !== 'object') P.plPorte = {};
  P.tringle = P.tringle.filter(function(k, i, l){ return PL[k] && utile(k) && l.indexOf(k) === i; }).slice(0, PLACES);
  TOUTES_PL.forEach(function(k){
    if(!utile(k)){ delete P.plPorte[k]; return; }
    if(P.tringle.indexOf(k) >= 0){ delete P.plPorte[k]; return; }
    if(P.plPorte[k]) return;
    if(P.tringle.length < PLACES) P.tringle.push(k); else P.plPorte[k] = 1;
  });
  return P.tringle;
}
M.plantesPorte = function(){ if(!M.etabliDispo()) return []; var P = M.P(); return TOUTES_PL.filter(function(k){ return P.plPorte && P.plPorte[k] && utile(k); }); };
/* On touche le panier devant la porte : ce qui peut va se pendre. Rend {mis, reste, t (la phrase à dire)} */
M.rangerPlantes = function(){
  var l = M.plantesPorte(), P = M.P(), t = repartir(), n = 0, ph;
  l.forEach(function(k){ if(t.length < PLACES){ t.push(k); delete P.plPorte[k]; n++; } });
  var r = l.length - n;
  if(!l.length) ph = 'Plus rien devant la porte.';
  else if(!n) ph = 'Il n\'y a plus de place sur la tringle de l\'établi : trois plantes, pas une de plus. Prépare d\'abord une potion !';
  else if(r) ph = (n > 1 ? n + ' plantes vont' : 'Une plante va') + ' se pendre à la tringle de l\'établi. Il n\'y a plus de place pour ' + (r > 1 ? 'les ' + r + ' autres' : 'la dernière') + '.';
  else ph = (n > 1 ? 'Tes ' + n + ' plantes vont' : 'Ta plante va') + ' se pendre à la tringle de l\'établi.';
  if(n) M.sauver();
  return {mis:n, reste:r, t:ph};
};
/* (le dessin d'une plante cueillie, à glisser dans un autre dessin : le panier devant la porte de l'atelier) */
M.planteSVG = function(k, x, y, w, h){ return PL[k] ? '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 260 322" class="pl-dessin" overflow="visible">' + PLD.corps(k) + '</svg>' : ''; };
/* L'établi est là dès que le héros a trouvé une plante (dans n'importe quelle enquête), et toujours dans une enquête à plantes */
M.etabliDispo = function(){
  var E = enquete(); if(!(window.ETABLI_HTML && E && M.P && M.P() && M.role() === 'alchimiste')) return false;
  suivre(); repartir();
  var P = M.P();
  return !!(E.plantes || TOUTES_PL.some(function(k){ return P.plantes && P.plantes[k] > 0; }) || ORDRE.some(function(id){ return P.vus['fiole:' + id]; }));
};
function faite(id){ var P = M.P(); return !!(P && P.vus['fiole:' + id]); }
function faites(){ return ORDRE.filter(faite); }
function aPlante(k){ var P = M.P(); return !!(P && P.plantes && P.plantes[k] > 0); }
/* les plantes cueillies dont la potion n'est pas encore faite : le signe « 🌿 À préparer ! » de l'établi */
M.plantesEnAttente = function(){ return M.etabliDispo() ? repartir().length : 0; };
function nuit(){ var E = enquete(), P = M.P(); return !!(E && P && E.moments[Math.min(P.moment, E.moments.length - 1)] === 'nuit'); }
M.sacBits = function(){ var n = 0; ORDRE.forEach(function(id, i){ if(faite(id)) n |= (1 << i); }); return n; };
M.sacDe = function(n){ return ORDRE.filter(function(id, i){ return (n >> i) & 1; }); };
/* le signe au-dessus de l'établi : les sept potions sont prêtes, leur code attend (Romain, 12 novembre, 12 h 45 : plus de sac) */
M.etabliSigne = function(){ return (M.etabliDispo() && sacFiche() && !(M.P().vus['sac:donne'])) ? '🧪 Ton code !' : null; };

/* ---------- La page de l'établi : un cadre, en plein écran, par-dessus l'atelier (comme le labo) ---------- */
var CADRE = 'etabli-cadre';
/* l'établi et le mur choisis dans l'atelier : la page les reprend (5 formes × 8 couleurs chacun) */
function style(){
  var a = M.S.atelier || {}, et = (a.objets || []).filter(function(o){ return o.id === 'et'; })[0], st = et ? (et.st || 0) : ((a.etabli || {}).st || 0), fond = (a.deco || {}).fond || 0;
  return {paF:st % 5, paT:st % 8, murF:fond % 5, murT:fond % 8};
}
/* le code pour le Pisteur, en trois formes : seulement quand les SEPT potions sont faites (dans une enquête qui a ce code).
   (13 novembre, Romain : « on a besoin des sept potions pour descendre ») C'est le CODE D'ALLURE de l'Alchimiste (descente.js,
   M.allureCode) : tapé par le Pisteur, il dit à quoi ressemble son héros dans le donjon ET que les sept potions sont du voyage. */
function sacFiche(){
  if(faites().length < ORDRE.length || !M.allureCode) return null;
  try{ var id = M.allureCode(), c = id && M.code(id); return c ? {formes:c.map(function(s){ return D.SYM[s].e; })} : null; }catch(e){ return null; }
}
M.potionsPretes = function(){ return {n:faites().length, sur:ORDRE.length}; };
/* (le Pisteur a tapé le code de l'Alchimiste) les sept potions sont dans son sac ; l'acide pour la grille du puits : P.vus['sac:acide'] */
M.sacTout = function(){
  var P = M.P(); if(!P) return;
  P.sac = ORDRE.slice(); P.recus['sac'] = true; P.vus['sac:recu'] = 1;
  ORDRE.forEach(function(k){ P.vus['sac:' + k] = 1; });
};
function donjonDispo(){ try{ return !!(M.donjonBoutonAlchimiste && M.donjonBoutonAlchimiste()); }catch(e){ return false; } }
/* pour la page : seulement les plantes de la tringle ; et toutes celles qu'on a trouvées (leurs pages du grimoire) */
function plantesDispo(){ var t = repartir(), r = {}; TOUTES_PL.forEach(function(k){ r[k] = t.indexOf(k) >= 0 ? 1 : 0; }); return r; }
function trouvees(){ var P = M.P(); return TOUTES_PL.filter(function(k){ return P.vus['plante:' + k] || (P.plantes && P.plantes[k] > 0); }); }
/* les potions faites, pour la page de l'établi : les sept, et celles en plus */
function faitesTout(){ return faites().concat(PLUS.filter(faite)); }
/* les codes des potions en plus (le givre : le code de sa recette, que le Pisteur tape dans le donjon) */
function codesPlus(){
  var r = {};
  PLUS.forEach(function(id){ try{ var c = RE[id].code && M.code(RE[id].code); if(c) r[id] = {formes:c.map(function(s){ return D.SYM[s].e; })}; }catch(e){} });
  return r;
}
/* (descente.js) le Pisteur a envoyé une plante rare du donjon : elle arrive chez l'Alchimiste (la tringle de l'établi, ou le panier devant la porte) */
M.recevoirPlanteRare = function(k){
  var P = M.P(); if(!P || PL_PLUS.indexOf(k) < 0) return false;
  P.plantes = P.plantes || {};
  if(!P.vus['fiole:' + PL[k].potion] && !(P.plantes[k] > 0)) P.plantes[k] = 1;
  P.vus['plante:' + k] = 1; repartir();
  return true;
};
function fiche(){
  suivre();
  var P = M.P(), S = M.S;
  return {jeu:true, plantes:plantesDispo(), trouvees:trouvees(), faites:faitesTout(), etat:P.etabli || null, style:style(), son:!(S.options && S.options.son === false),
    intro:!S.etabliIntro, nuit:nuit(), sac:sacFiche(), sacVu:!!P.vus['sac:donne'], donjon:donjonDispo(), plus:codesPlus(), vite:!!window.BRUMEVAL_ETABLI_VITE};
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
  M.noter('Potion prête : ' + r.nom.charAt(0).toLowerCase() + r.nom.slice(1) + '.', '🧪');
  /* (une potion en plus : le givre) son code est pour le Pisteur — il le tape dans le donjon */
  if(PLUS.indexOf(id) >= 0){ if(r.code){ P.objets['_' + r.code] = true; M.noter(r.nom + ' : son code est pour le Pisteur. ' + (r.apres || ''), '❄️'); } }
  toutes = PLUS.indexOf(id) < 0 && faites().length === ORDRE.length;
  if(toutes) M.noter('Les sept potions sont prêtes !', '🧪');
  if(P.etabli && typeof P.etabli === 'object') P.etabli = {vu:P.etabli.vu, po:P.etabli.po, pv:P.etabli.pv}; else delete P.etabli;
  suivre();
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
    try{ f.contentWindow.postMessage({etabli:1, type:'maj', faites:faitesTout(), plantes:plantesDispo(), trouvees:trouvees(), nuit:nuit(), sac:sacFiche(), donjon:donjonDispo(), plus:codesPlus()}, '*'); }catch(err){}
  }
  else if(m.type === 'lire'){ if(m.t) M.lire(String(m.t)); }
  else if(m.type === 'stop'){ M.stop && M.stop(); }
  else if(m.type === 'introVue'){ M.S.etabliIntro = 1; M.sauver(); }
  else if(m.type === 'sacVu'){ if(sacFiche()){ P.vus['sac:donne'] = 1; M.sauver(); } }
  else if(m.type === 'donjon'){ if(m.etat && typeof m.etat === 'object') P.etabli = m.etat; M.fermerEtabli(); if(M.A['ds-chaudron']) M.A['ds-chaudron'](); }   /* 🫕 le chaudron du donjon : les herbes lumineuses (descente.js) */
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

/* (13 novembre : plus de code du sac — le Pisteur tape le code d'allure de l'Alchimiste : descente.js, M.sacTout ci-dessus) */
M.sacPotions = function(){ var P = M.P(); return (P && P.sac) || null; };
})();
