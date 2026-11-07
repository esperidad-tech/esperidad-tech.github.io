/* ==========================================================
   Brumeval — le tableau de liège du Barde (son premier onglet)
   Comme les détectives des films : un grand panneau de liège, plein
   écran entre le bandeau et les onglets. Le bac du bas contient les
   « photos » de l'enquête (habitants, lieux, objets connus) ; on les
   glisse vers le haut pour les épingler 📌, on les déplace au doigt.
   Toucher une photo : rien → ✓ innocent (vert) → ⚠️ à surveiller (orange)
   → 🎯 suspect (rouge) → rien. La bobine 🧵 relie deux photos par un fil
   rouge (toucher un fil le coupe). Remettre une photo dans le bac l'enlève.
   C'est le bloc-notes du Barde : le jeu ne vérifie rien.
   Dès l'enquête 2 (E.tics : un signe par menteur), chaque signe révélé par un villageois arrive dans le bac sous la forme
   d'une ÉTIQUETTE ANIMÉE (un petit visage qui n'est personne refait le signe en boucle) : le Barde l'épingle et la relie
   par un fil rouge à la bonne photo. Pas de validation non plus (comme les phrases à trous).
   P.liege = {cartes:{'pnj:iris':{x, y, s:0..3, z}, 'signe:oreilles':{x, y, z}}, fils:[['pnj:iris', 'lieu:moulin']], z}
   Chargé APRÈS moteur-actions.js (M.monterLiege est appelé après chaque rendu).
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
var W = 1500, H = 900;          /* le panneau, en unités du monde */
var CW = 150, CH = 196;         /* une photo */
var F = 56, TW = W + 2 * F, TH = H + 2 * F;   /* le cadre de bois autour du liège (son épaisseur, en unités du monde) */
var ETATS = ['', 'innocent', 'surveiller', 'suspect'];
var ETIQ = {innocent:'✓ innocent', surveiller:'⚠️ à surveiller', suspect:'🎯 suspect'};
var uid = 0;
function esc(s){ return M.esc(s); }
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }

function etat(src){
  src = src || M.P();
  if(!src.liege || typeof src.liege !== 'object') src.liege = {};
  var L = src.liege; L.cartes = L.cartes || {}; L.fils = L.fils || []; L.z = L.z || 1;
  return L;
}

/* ---------- Les photos de l'enquête ----------
   Chaque enquête choisit ses photos intéressantes : E.liege = {pnj:[…], lieux:[…]} (e1.js, e2.js…).
   Sans liste : les suspects (QUI, et QUI l'aide) et les lieux du OÙ. Les objets : seulement ceux que
   cette tablette connaît (trouvés ou reçus), pour ne rien dévoiler. Une photo déjà épinglée reste toujours. */
/* une photo épinglée dans une enquête d'avant : on retrouve son nom dans l'enquête où elle est née */
function autresEnquetes(E){ var l = [E]; M.cle(window.ENQUETES || {}).forEach(function(n){ if(window.ENQUETES[n] && window.ENQUETES[n] !== E) l.push(window.ENQUETES[n]); }); return l; }
function motAilleurs(E, id){ var m = null; autresEnquetes(E).some(function(X){ m = ((X.liege && X.liege.mots) || []).filter(function(x){ return x.id === id; })[0] || null; return !!m; }); return m; }
function objetAilleurs(E, id){ var o = null; autresEnquetes(E).some(function(X){ o = (X.objets && X.objets[id]) || null; return !!o; }); return o; }
function photoLieu(E, id){
  var c = null;
  autresEnquetes(E).some(function(X){ c = ((X.ou && X.ou.choix) || []).filter(function(x){ return x.id === id; })[0] || null; return !!c; });
  if(c) return {k:'lieu:' + id, type:'lieu', id:id, nom:c.nom, ic:c.ic};
  if(window.Carte && Carte.LIEUX && Carte.LIEUX[id]){
    if(Carte.LIEUX[id].zone === 'dessous') return null;   /* les souterrains restent secrets */
    return {k:'lieu:' + id, type:'lieu', id:id, nom:M.nomLieu(id), ic:M.icLieu(id)};
  }
  return null;
}
/* ---------- Les étiquettes des signes de menteur (E.tics) ----------
   [nom court sur l'étiquette, la phrase entière (lue par le 🔊 du bac et donnée en légende)] */
var SIGNES = {
  oreilles:['Oreilles rouges', 'Ses oreilles rougissent.'],
  yeuxbas:['Yeux baissés', 'Baisse les yeux et lève les sourcils en même temps.'],
  mordille:['Lèvre mordillée', 'Mordille sa lèvre du bas.'],
  morsure:['Lèvre mordue', 'Se mord la lèvre, très vite.'],
  rougeur:['Front rose', 'Le haut de son front devient tout rose.'],
  coin:['Yeux de côté', 'Ses yeux filent sur le côté, avec un petit sourire de travers.'],
  double:['Cligne deux fois', 'Cligne des yeux deux fois, très vite.'],
  sueur:['Goutte de sueur', 'Une goutte de sueur glisse sur son front.'],
  force:['Sourire forcé', 'Sa bouche sourit, mais ses yeux ne sourient pas.']
};
/* Les signes révélés à cette tablette (les secrets connus du Barde, barde.js), dans l'ordre des menteurs de l'enquête */
function signesRevel(E, P){
  if(!E.tics || !P || P !== M.P() || !M.barde || !M.barde.mimiques) return [];
  var o = M.barde.mimiques(), l = [];
  M.cle(E.tics).forEach(function(id){ var k = E.tics[id]; if(o[id] && SIGNES[k] && l.indexOf(k) < 0) l.push(k); });
  return l;
}
/* Le petit visage d'une étiquette : un dessin simple (personne du village), qui refait le signe en boucle (liege.css, .lg-sg-…) */
var VISAGE_SIGNE = '<svg viewBox="-40 -40 80 80" aria-hidden="true" focusable="false">' +
  '<ellipse cx="-29" cy="3" rx="6.5" ry="9.5" fill="#f4c38f" stroke="#24182e" stroke-width="2.2"/><ellipse cx="29" cy="3" rx="6.5" ry="9.5" fill="#f4c38f" stroke="#24182e" stroke-width="2.2"/>' +
  '<g class="sg-or"><ellipse cx="-29" cy="3" rx="6.5" ry="9.5" fill="#e5323c" stroke="#8c1a22" stroke-width="2.2"/><ellipse cx="29" cy="3" rx="6.5" ry="9.5" fill="#e5323c" stroke="#8c1a22" stroke-width="2.2"/>' +
    '<path d="M-38 -5 l-4 -3 M-39.5 3 l-5 0 M-38 11 l-4 3 M38 -5 l4 -3 M39.5 3 l5 0 M38 11 l4 3" stroke="#ff3b3b" stroke-width="2.4" stroke-linecap="round"/></g>' +
  '<circle r="27" fill="#ffd9a8" stroke="#24182e" stroke-width="2.4"/>' +
  '<ellipse class="sg-front" cx="0" cy="-17" rx="14" ry="5.5" fill="#ff6f91"/>' +
  '<path class="sg-goutte" d="M19 -22 q-3.6 5.5 0 7.6 q3.6 -2.1 0 -7.6 z" fill="#8fd3ff" stroke="#24182e" stroke-width="1.2"/>' +
  '<path class="sg-sc" d="M-18 -11 q6 -4.5 12 0 M6 -11 q6 -4.5 12 0" stroke="#5a3a24" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="-11" cy="-1" rx="6" ry="6.5" fill="#fff" stroke="#24182e" stroke-width="1.6"/><ellipse cx="11" cy="-1" rx="6" ry="6.5" fill="#fff" stroke="#24182e" stroke-width="1.6"/>' +
  '<g class="sg-pup"><circle cx="-11" cy="-.5" r="3.2" fill="#24182e"/><circle cx="11" cy="-.5" r="3.2" fill="#24182e"/></g>' +
  '<g class="sg-paup"><ellipse cx="-11" cy="-1" rx="6.8" ry="7.3" fill="#f6c99a" stroke="#24182e" stroke-width="1.6"/><ellipse cx="11" cy="-1" rx="6.8" ry="7.3" fill="#f6c99a" stroke="#24182e" stroke-width="1.6"/></g>' +
  '<path class="sg-b sg-b-n" d="M-9 13 q9 6 18 0" stroke="#24182e" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
  '<path class="sg-b sg-b-coin" d="M-9 15 q9 3 16 -5" stroke="#24182e" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
  '<path class="sg-b sg-b-force" d="M-13 11 q13 11 26 0 z" fill="#fff" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<g class="sg-b sg-b-mordille"><path d="M-9 14 q9 3 18 0" stroke="#24182e" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-4 12.6 h8 v3.4 h-8 z" fill="#fff" stroke="#24182e" stroke-width="1.3"/></g>' +
  '<g class="sg-b sg-b-mord"><path d="M-11 15 q11 6 22 0 q-11 2 -22 0 z" fill="#e0607a" stroke="#24182e" stroke-width="1.6"/><path d="M-7 11 h14 v5 h-14 z M0 11 v5" fill="#fff" stroke="#24182e" stroke-width="1.4"/></g>' +
  '</svg>';

var INCONNU = {k:'pnj:inconnu', type:'pnj', id:'inconnu'};
function mot(m){ return m ? {k:'mot:' + m.id, type:'mot', id:m.id, nom:m.nom, ic:m.ic} : null; }
function photos(E, P){
  var l = [], vus = {}, Lg = E.liege || {};
  function ajout(c){ if(c && !vus[c.k]){ vus[c.k] = 1; l.push(c); } }
  function gens(id){ if(id !== 'voisin' && D.PNJ[id]) ajout({k:'pnj:' + id, type:'pnj', id:id}); }
  /* d'abord les étiquettes des signes révélés : en tête du bac, pour qu'on les voie arriver */
  signesRevel(E, P).forEach(function(k){ ajout({k:'signe:' + k, type:'signe', id:k}); });
  (Lg.pnj || [].concat((E.qui && E.qui.choix) || [], ((E.quoi && E.quoi.choix) || []).filter(function(c){ return c.pnj; }).map(function(c){ return c.id; }))).forEach(gens);
  (Lg.lieux || ((E.ou && E.ou.choix) || []).map(function(c){ return c.id; })).forEach(function(id){ ajout(photoLieu(E, id)); });
  /* la fiche « ? » (Romain, 5 novembre, 14 h 18) : quelqu'un dont on ne connaît pas encore le nom */
  ajout(INCONNU);
  M.cle(E.objets || {}).forEach(function(id){
    if(P && ((P.recus || {})['obj:' + id] || (P.objets || {})[id])) ajout({k:'obj:' + id, type:'obj', id:id, nom:E.objets[id].nom, ic:E.objets[id].ic});
  });
  /* le dossier « Autre » : les mots-clés de l'enquête (E.liege.mots), chacun dès que cette tablette l'a appris
     (m.si : les mêmes conditions que les questions ; sans m.si, connu dès le début) */
  (Lg.mots || []).forEach(function(m){ if(!m.si || (P && P === M.P() && M.besoinOk(m.si))) ajout(mot(m)); });
  /* une photo épinglée avant un changement de liste ne disparaît pas */
  M.cle(((P && P.liege) || {}).cartes || {}).forEach(function(k){
    var q = k.split(':');
    if(q[0] === 'pnj'){ if(q[1] === INCONNU.id) ajout(INCONNU); else gens(q[1]); }
    else if(q[0] === 'mot') ajout(mot(motAilleurs(E, q[1])));
    else if(q[0] === 'lieu') ajout(photoLieu(E, q[1]));
    else if(q[0] === 'obj'){ var ob = objetAilleurs(E, q[1]); if(ob) ajout({k:k, type:'obj', id:q[1], nom:ob.nom, ic:ob.ic}); }
    else if(q[0] === 'signe' && SIGNES[q[1]]) ajout({k:k, type:'signe', id:q[1]});
  });
  return l;
}
function portrait(id){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
    try{ return Persos.pnj(id, {anime:false, humeur:'normal', id:'lg' + (++uid)}); }catch(e){}
  }
  return '<span class="lg-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}
function metier(id){
  var x = D.PNJ[id] || {};
  return (x.icMetier ? x.icMetier + ' ' : '') + (x.metierCourt || String(x.metier || '').replace(/^(le |la |l')/i, ''));
}
function contenu(c){
  if(c.type === 'signe') return '<span class="lg-photo lg-sg lg-sg-' + c.id + '" role="img" aria-label="' + esc(SIGNES[c.id][1]) + '">' + VISAGE_SIGNE + '</span><b>' + esc(SIGNES[c.id][0]) + '</b><small>🤥 signe</small>';
  if(c.type === 'pnj' && c.id === INCONNU.id) return '<span class="lg-photo lg-inconnu" aria-hidden="true"><span>?</span></span><b>Quelqu\'un</b><small>❓ inconnu</small>';
  if(c.type === 'mot') return '<span class="lg-photo lg-objet lg-mot-ic"><span>' + c.ic + '</span></span><b>' + esc(c.nom) + '</b>';
  if(c.type === 'pnj') return '<span class="lg-photo">' + portrait(c.id) + '</span><b>' + esc(D.PNJ[c.id].court) + '</b><small>' + esc(metier(c.id)) + '</small>';
  return '<span class="lg-photo lg-objet"><span>' + c.ic + '</span></span><b>' + esc(c.nom) + '</b>';
}

/* ---------- HTML (une photo épinglée, les fils) ---------- */
function carteHTML(c, d, lecture){
  var s = ETATS[d.s || 0], h = 0;
  for(var i = 0; i < c.k.length; i++) h = (h * 31 + c.k.charCodeAt(i)) % 997;
  return '<div class="lg-carte lg-' + c.type + (s ? ' lg-s-' + s : '') + '" data-k="' + esc(c.k) + '" style="left:' + Math.round(d.x - CW / 2) + 'px;top:' + Math.round(d.y - CH / 2) + 'px;z-index:' + (d.z || 1) + ';--r:' + ((h % 7) - 3) + 'deg">' +
    '<i class="lg-epingle" aria-hidden="true"></i>' + contenu(c) + (s ? '<span class="lg-etiq">' + ETIQ[s] + '</span>' : '') + '</div>';
}
function epingle(d){ return {x:d.x, y:d.y - CH / 2 + 12}; }
/* Les fils : le fil rouge se voit PAR-DESSUS les photos (noué aux punaises, comme au cinéma) ;
   la zone qu'on touche pour le couper est SOUS les photos (toucher une photo reste toucher la photo). */
function filsSVG(L, zones){
  var s = '';
  L.fils.forEach(function(f, i){
    var a = L.cartes[f[0]], b = L.cartes[f[1]]; if(!a || !b) return;
    var p = epingle(a), q = epingle(b), dist = Math.hypot(q.x - p.x, q.y - p.y);
    var d = 'M' + p.x + ' ' + p.y + ' Q' + ((p.x + q.x) / 2) + ' ' + ((p.y + q.y) / 2 + 18 + dist * 0.1) + ' ' + q.x + ' ' + q.y;
    s += zones ? '<path d="' + d + '" class="lg-fil-zone" data-fil="' + i + '"/>' : '<path d="' + d + '" class="lg-fil-ombre"/><path d="' + d + '" class="lg-fil"/>';
  });
  return s;
}
function svgFils(cls, contenu){ return '<svg class="lg-fils ' + cls + '" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + contenu + '</svg>'; }
function mondeHTML(E, P, lecture){
  var L = etat(P), s = lecture ? '' : svgFils('lg-fils-bas', filsSVG(L, true));
  photos(E, P).forEach(function(c){ var d = L.cartes[c.k]; if(d) s += carteHTML(c, d, lecture); });
  return s + svgFils('lg-fils-haut', filsSVG(L, false));
}

/* ---------- Le cadre de bois et le mur du bureau ----------
   Dessinés une seule fois au montage (rien ne bouge au repos), sous le liège : ils suivent le liège
   quand on glisse ou qu'on zoome (même transformation), et le mur couvre tout ce qu'on peut voir.
   Le cadre : une moulure en bois foncé (même bois que le chevalet de la cabane, plus sombre que le liège),
   quatre côtés coupés à 45° dans les coins, la veinure dans le sens du bois, la lumière qui vient d'en haut,
   des coins de laiton rivetés. Le mur : son papier peint (liege.css). */
var PROFIL = [[0, '#3a1f0d'], [.07, '#b37b47'], [.17, '#965f36'], [.42, '#6b3c1b'], [.6, '#7d4925'], [.76, '#a76f40'], [.87, '#73431f'], [1, '#2a160a']];
var VEINE = '<path d="M0 6C120 3 210 10 300 7S470 3 560 6M0 17C90 19 190 14 290 17S460 21 560 17M0 37C80 41 170 33 240 38S420 40 560 37M0 49C110 46 200 53 280 49S440 47 560 49" fill="none" stroke="rgba(38,16,4,.38)" stroke-width="1.6"/>' +
  '<path d="M0 27C80 31 170 23 240 28S410 30 560 27M0 56C110 53 200 59 280 56S450 54 560 56" fill="none" stroke="rgba(255,222,176,.13)" stroke-width="1.3"/>';
function teinte(hex, c, a){   /* la lumière d'en haut, l'ombre d'en bas : mêlée au bois, pour ne peindre chaque côté qu'une fois */
  return 'rgb(' + [1, 3, 5].map(function(i, j){ return Math.round(parseInt(hex.substr(i, 2), 16) * (1 - a) + c[j] * a); }).join(',') + ')';
}
function cadreSVG(){
  var u = 'lgc' + (++uid), s = '<defs>';
  function degrade(id, x1, y1, x2, y2, c, a){   /* le profil de la moulure, du bord extérieur vers le liège */
    return '<linearGradient id="' + u + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
      PROFIL.map(function(p){ return '<stop offset="' + p[0] + '" stop-color="' + teinte(p[1], c, a) + '"/>'; }).join('') + '</linearGradient>';
  }
  var clair = [255, 232, 196], sombre = [18, 6, 0];
  s += degrade('h', 0, 0, 0, F, clair, .1) + degrade('b', 0, TH, 0, TH - F, sombre, .26) + degrade('g', 0, 0, F, 0, clair, .04) + degrade('d', TW, 0, TW - F, 0, sombre, .15);
  /* la veinure : le long du côté (tournée d'un quart pour les montants) */
  s += '<pattern id="' + u + 'vh" width="560" height="60" patternUnits="userSpaceOnUse">' + VEINE + '</pattern>' +
    '<pattern id="' + u + 'vv" width="560" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">' + VEINE + '</pattern>';
  s += '<linearGradient id="' + u + 'l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffeab0"/><stop offset=".45" stop-color="#d6a648"/><stop offset="1" stop-color="#8a5f1c"/></linearGradient></defs>';
  var cotes = {h:'0,0 ' + TW + ',0 ' + (TW - F) + ',' + F + ' ' + F + ',' + F, b:'0,' + TH + ' ' + TW + ',' + TH + ' ' + (TW - F) + ',' + (TH - F) + ' ' + F + ',' + (TH - F),
    g:'0,0 ' + F + ',' + F + ' ' + F + ',' + (TH - F) + ' 0,' + TH, d:TW + ',0 ' + (TW - F) + ',' + F + ' ' + (TW - F) + ',' + (TH - F) + ' ' + TW + ',' + TH};
  M.cle(cotes).forEach(function(c){ s += '<polygon points="' + cotes[c] + '" fill="url(#' + u + c + ')"/>'; });
  s += '<path d="M' + cotes.h + 'ZM' + cotes.b + 'Z" fill="url(#' + u + 'vh)"/><path d="M' + cotes.g + 'ZM' + cotes.d + 'Z" fill="url(#' + u + 'vv)"/>';
  s += '<path d="M0 0L' + F + ' ' + F + 'M' + TW + ' 0L' + (TW - F) + ' ' + F + 'M0 ' + TH + 'L' + F + ' ' + (TH - F) + 'M' + TW + ' ' + TH + 'L' + (TW - F) + ' ' + (TH - F) + '" stroke="rgba(30,12,2,.7)" stroke-width="3"/>' +
    '<rect x="3" y="3" width="' + (TW - 6) + '" height="' + (TH - 6) + '" rx="4" fill="none" stroke="#24182e" stroke-width="6"/>' +
    '<rect x="' + F + '" y="' + F + '" width="' + W + '" height="' + H + '" fill="none" stroke="#24182e" stroke-width="8"/>';
  /* les coins de laiton : la même pièce retournée dans chaque coin (dessinée à sa place, pour que la lumière vienne toujours d'en haut à gauche) */
  [[1, 1, 0, 0], [-1, 1, TW, 0], [1, -1, 0, TH], [-1, -1, TW, TH]].forEach(function(c){
    function p(x, y){ return (c[2] + c[0] * x) + ' ' + (c[3] + c[1] * y); }
    s += '<path d="M' + p(0, 0) + 'L' + p(100, 0) + 'C' + p(88, 10) + ' ' + p(72, 18) + ' ' + p(52, 22) + 'L' + p(22, 52) + 'C' + p(18, 72) + ' ' + p(10, 88) + ' ' + p(0, 100) + 'Z" fill="url(#' + u + 'l)" stroke="#24182e" stroke-width="3.5"/>' +
      '<path d="M' + p(84, 6) + 'C' + p(74, 13) + ' ' + p(62, 19) + ' ' + p(46, 22) + 'L' + p(22, 46) + 'C' + p(19, 62) + ' ' + p(13, 74) + ' ' + p(6, 84) + '" fill="none" stroke="rgba(92,58,14,.55)" stroke-width="2.5"/>' +
      '<g fill="#f6dc94" stroke="#5a3a10" stroke-width="2"><circle cx="' + (c[2] + c[0] * 16) + '" cy="' + (c[3] + c[1] * 16) + '" r="5.5"/><circle cx="' + (c[2] + c[0] * 70) + '" cy="' + (c[3] + c[1] * 9) + '" r="4"/><circle cx="' + (c[2] + c[0] * 9) + '" cy="' + (c[3] + c[1] * 70) + '" r="4"/></g>';
  });
  return s;
}
function decorHTML(){
  return '<div class="lg-decor" aria-hidden="true" style="width:' + W + 'px;height:' + H + 'px"><div class="lg-mur"></div>' +
    '<div class="lg-cadre" style="left:' + (-F) + 'px;top:' + (-F) + 'px;width:' + TW + 'px;height:' + TH + 'px">' +
    '<svg viewBox="0 0 ' + TW + ' ' + TH + '" width="' + TW + '" height="' + TH + '" focusable="false">' + cadreSVG() + '</svg></div></div>';
}

/* ---------- L'onglet ---------- */
M.liegePlein = function(){ return M.role() === 'barde'; };
M.liegeHTML = function(){ return '<div id="liege-ici" class="lg b-atelier-plein"></div>'; };

var V = null;   /* la vue montée */
M.demonterLiege = function(){
  if(!V) return;
  try{ V.suivis.slice().forEach(function(f){ f(); }); window.removeEventListener('resize', V.resize); }catch(e){}
  if(M.UI) M.UI.liegeVue = {ox:V.ox, oy:V.oy, z:V.kMax ? V.k / V.kMax : 1};   /* le zoom et la place, pour la session */
  V = null;
};
/* Les tableaux du journal (lecture seule) : à la largeur de l'écran */
function ajusterJournal(){
  [].forEach.call(document.querySelectorAll('.lg-jr-boite'), function(b){
    var w = b.parentNode.clientWidth; if(!w) return;
    var k = Math.min(1, w / W);
    b.style.width = Math.round(W * k) + 'px'; b.style.height = Math.round(H * k) + 'px';
    var m = b.querySelector('.lg-monde'); if(m) m.style.transform = 'scale(' + k + ')';
  });
}
window.addEventListener('resize', function(){ try{ ajusterJournal(); }catch(e){} });
M.monterLiege = function(){
  try{ ajusterJournal(); }catch(e){}
  var ici = document.getElementById('liege-ici');
  if(!ici){ M.demonterLiege(); return; }
  M.demonterLiege();
  var E = M.E(), P = M.P(); if(!E || !P) return;
  var aide = 'Glisse une photo du bac vers le haut pour l\'épingler. Touche une photo du tableau pour changer sa couleur : vert innocent, orange à surveiller, rouge suspect. La bobine relie deux photos par un fil rouge. Pour couper un fil, touche-le, ou relie encore les deux mêmes photos. Pour enlever une photo, remets-la dans le bac.' +
    (E.tics ? ' Quand un villageois te dit comment quelqu\'un ment, une étiquette jaune arrive dans le bac : épingle-la, et relie-la par un fil rouge à la bonne personne.' : '');
  ici.innerHTML = '<div class="lg-vue">' + decorHTML() + '<div class="lg-monde" style="width:' + W + 'px;height:' + H + 'px"></div>' +
    '<p class="lg-vide">📌 Glisse les photos du bac sur le tableau !</p>' +
    '<div class="lg-outils"><button type="button" class="lg-bobine" data-lg="bobine" aria-label="Relier deux photos par un fil rouge">🧵<small>Fil rouge</small></button>' +
    '<button type="button" class="lg-sac" data-lg="sac" aria-label="Mon sac et mes codes">🎒<small>Mes codes</small><i class="lg-n"></i></button>' +
    /* venu d'un interrogatoire (« 📌 Mon tableau », barde.js) : on y retourne, dans la même visite */
    (M.barde && M.barde.retourPossible && M.barde.retourPossible() ? '<button type="button" class="lg-retour" data-lg="retour" aria-label="Retour à l\'interrogatoire">↩️<small>' + esc((D.PNJ[M.barde.retourPossible()] || {}).court || 'Retour') + '</small></button>' : '') + '</div>' +
    '<p class="lg-consigne" hidden></p>' +
    '<button type="button" class="lg-fleche g" data-lg="gauche" aria-label="Voir à gauche">‹</button><button type="button" class="lg-fleche d" data-lg="droite" aria-label="Voir à droite">›</button></div>' +
    '<div class="lg-bac"><div class="lg-bac-tete"><b>📦 Les photos</b><span class="lg-bac-n"></span>' + M.lireBtn(aide) + '</div><div class="lg-bac-cats"></div><div class="lg-bac-liste" hidden></div></div>';
  V = {ici:ici, vue:ici.querySelector('.lg-vue'), monde:ici.querySelector('.lg-monde'), decor:ici.querySelector('.lg-decor'), mur:ici.querySelector('.lg-mur'), bac:ici.querySelector('.lg-bac'), liste:ici.querySelector('.lg-bac-liste'),
    consigne:ici.querySelector('.lg-consigne'), k:1, mode:null, sel:null, suivis:[], E:E, P:P, pts:{}, geste:0, annule:0, pinch:null, reste:null, avale:0};
  var mem = (M.UI && M.UI.liegeVue) || {}; V.ox = mem.ox || 0; V.oy = mem.oy || 0; V.z = mem.z || 1;
  V.resize = function(){ ajuster(); };
  window.addEventListener('resize', V.resize);
  ajuster();
  dessiner();
  brancher();
};
function ajuster(){
  if(!V) return;
  var ici = V.ici, nav = document.querySelector('.b-onglets'), bas = nav ? nav.offsetHeight : 0;
  ici.style.height = Math.max(300, Math.round(window.innerHeight - (ici.getBoundingClientRect().top + window.scrollY) - bas)) + 'px';
  var w = V.vue.clientWidth, h = V.vue.clientHeight;
  V.w = w; V.h = h;
  /* le zoom : au plus, le liège remplit la hauteur (comme avant) ; au moins, on voit tout le cadre, avec du mur autour */
  var mp = Math.max(10, Math.min(24, Math.round(Math.min(w, h) * 0.05)));   /* le mur qu'on voit autour du cadre, à l'écran */
  V.kMax = h / H; V.kMin = Math.max(0.02, Math.min(V.kMax, (w - 2 * mp) / TW, (h - 2 * mp) / TH));
  V.k = borne(V.kMax * (V.z || 1), V.kMin, V.kMax);
  /* le mur : assez grand pour couvrir tout ce qu'on voit au plus petit zoom (calé sur ses motifs, 220 × 240) */
  var mx = Math.ceil(Math.max(F, (w / V.kMin - W) / 2 + 60) / 1100) * 1100, my = Math.ceil(Math.max(F, (h / V.kMin - H) / 2 + 60) / 1200) * 1200;
  if(V.murT !== mx + ',' + my){
    V.murT = mx + ',' + my;
    var s = V.mur.style; s.left = -mx + 'px'; s.top = -my + 'px'; s.width = (W + 2 * mx) + 'px'; s.height = (H + 2 * my) + 'px';
  }
  borner();
  appliquer();
}
/* La place du tableau : on ne sort jamais du tableau (le liège, et au bord son cadre) ; plus petit que l'écran, il reste au milieu */
function axe(o, vue, t, f){   /* o : le décalage, vue : la taille de l'écran, t : celle du liège, f : l'épaisseur du cadre (à l'écran) */
  if(t <= vue + 1) return {o:(vue - t) / 2, pan:false};
  var e = Math.min(f, t - vue);   /* au doigt, on peut aller voir le cadre au bord (en douceur : rien ne saute quand le liège devient plus petit que l'écran) */
  return {o:borne(o, vue - t - e, e), pan:true};
}
function borner(){
  var f = F * V.k, x = axe(V.ox, V.w, W * V.k, f), y = axe(V.oy, V.h, H * V.k, f);
  V.ox = x.o; V.oy = y.o; V.panX = x.pan; V.panY = y.pan;
  V.pan = V.panX; V.minOx = Math.min(0, V.w - W * V.k);   /* les flèches ‹ › : du bord gauche au bord droit du liège, comme avant */
  V.z = V.k / V.kMax;
}
function appliquer(anim){
  var t = 'translate(' + Math.round(V.ox) + 'px,' + Math.round(V.oy) + 'px) scale(' + V.k + ')', tr = anim ? 'transform .35s ease' : '';
  V.monde.style.transition = tr; V.monde.style.transform = t;
  V.decor.style.transition = tr; V.decor.style.transform = t;   /* le mur et le cadre suivent le liège */
  V.ici.querySelector('.lg-fleche.g').hidden = !V.pan || V.ox >= -2;
  V.ici.querySelector('.lg-fleche.d').hidden = !V.pan || V.ox <= V.minOx + 2;
}
function dessiner(){
  var E = V.E, P = V.P, L = etat(P);
  V.monde.innerHTML = mondeHTML(E, P, false);
  V.ici.querySelector('.lg-vide').hidden = M.cle(L.cartes).length > 0;
  majBac(); majSac();
  ajuster();   /* le bac a pu changer de hauteur : le tableau se recale */
}
/* Le bac est rangé en dossiers qu'on déroule (Romain, 5 novembre, 13 h 19 : « sinon, c'est un peu le bordel ») :
   🤥 les mensonges (les signes), 👥 les habitants (et la fiche « ? »), 📍 les lieux, 🎒 les objets,
   🏷️ autre (les mots-clés de l'enquête, Romain, 14 h 18). Un seul dossier ouvert à la fois (M.UI.lgCat). */
var CATS = [{t:'signe', ic:'🤥', nom:'Mensonges'}, {t:'pnj', ic:'👥', nom:'Habitants'}, {t:'lieu', ic:'📍', nom:'Lieux'}, {t:'obj', ic:'🎒', nom:'Objets'}, {t:'mot', ic:'🏷️', nom:'Autre'}];
function majBac(){
  var L = etat(V.P), dispo = photos(V.E, V.P).filter(function(c){ return !L.cartes[c.k]; });
  var UI = M.UI || {}, cats = CATS.map(function(C){ return {C:C, l:dispo.filter(function(c){ return c.type === C.t; })}; }).filter(function(x){ return x.l.length; });
  if(UI.lgCat && !cats.some(function(x){ return x.C.t === UI.lgCat; })) UI.lgCat = null;
  /* une étiquette de signe toute neuve : le dossier des mensonges s'ouvre tout seul, pour qu'on la voie arriver */
  var nSg = dispo.filter(function(c){ return c.type === 'signe'; }).length;
  if(nSg > (UI.lgSignes || 0)) UI.lgCat = 'signe';
  UI.lgSignes = nSg;
  V.ici.querySelector('.lg-bac-cats').innerHTML = cats.map(function(x){
    var on = UI.lgCat === x.C.t;
    return '<button type="button" class="lg-cat' + (on ? ' on' : '') + '" data-cat="' + x.C.t + '" aria-expanded="' + on + '"><span class="lg-cat-ic">' + x.C.ic + '</span><b>' + esc(x.C.nom) + '</b><i>' + x.l.length + '</i><span class="lg-cat-fl" aria-hidden="true">▾</span></button>';
  }).join('') || '<p class="lg-bac-fini">Toutes les photos sont au tableau ! ✨</p>';
  var ouverte = cats.filter(function(x){ return x.C.t === UI.lgCat; })[0];
  V.liste.hidden = !ouverte;
  V.liste.innerHTML = ouverte ? ouverte.l.map(function(c){ return '<button type="button" class="lg-bac-carte lg-' + c.type + '" data-k="' + esc(c.k) + '">' + contenu(c) + '</button>'; }).join('') : '';
  V.ici.querySelector('.lg-bac-n').textContent = dispo.length ? dispo.length + ' à épingler' : '';
}
function majSac(){
  var P = V.P, n = M.cle(P.objets || {}).length;
  var i = V.ici.querySelector('.lg-n'); i.textContent = n || ''; i.hidden = !n;
}
function majFils(){
  var L = etat(V.P), bas = V.monde.querySelector('.lg-fils-bas'), haut = V.monde.querySelector('.lg-fils-haut');
  if(bas) bas.innerHTML = filsSVG(L, true);
  if(haut) haut.innerHTML = filsSVG(L, false);
}
/* le tableau du Barde est gardé d'une enquête à l'autre (Romain, 5 novembre, 18 h 15 : « le tableau en liège, il bouge pas,
   il reste comme il est ») : chaque changement est aussi recopié dans la sauvegarde (S.liege), et une nouvelle enquête repart de là */
function sauver(){
  try{ if(V && V.P && V.P === M.P() && M.S) M.S.liege = M.copie(etat(V.P)); }catch(e){}
  try{ M.sauver(); }catch(e){}
}
function consigne(t){ V.consigne.hidden = !t; V.consigne.textContent = t || ''; }

/* ---------- Gestes ---------- */
function suivre(e, cb){
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, bouge = false;
  function mv(ev){
    if(ev.pointerId !== id) return;
    var dx = ev.clientX - x0, dy = ev.clientY - y0;
    if(!bouge && Math.hypot(dx, dy) > 8) bouge = true;
    if(cb.move && cb.move(ev, dx, dy, bouge) === false) fin();
  }
  function up(ev){ if(ev.pointerId !== id) return; fin(); if(cb.up) cb.up(ev, bouge, ev.type === 'pointercancel'); }
  function fin(){
    window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    if(V) V.suivis = V.suivis.filter(function(f){ return f !== fin; });
  }
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
function dans(el, ev){ var r = el.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }
function versMonde(ev){
  var r = V.vue.getBoundingClientRect();
  return {x:borne((ev.clientX - r.left - V.ox) / V.k, CW / 2 + 6, W - CW / 2 - 6), y:borne((ev.clientY - r.top - V.oy) / V.k, CH / 2 + 6, H - CH / 2 - 6)};
}
/* Une place sans photo, la plus proche du milieu de la partie visible du tableau (sinon : le milieu) */
function placeLibre(){
  var L = etat(V.P), cs = M.cle(L.cartes).map(function(c){ return L.cartes[c]; });
  var r = V.vue.getBoundingClientRect(), bord = V.pan ? 50 : 0;   /* les flèches ‹ › sur les côtés */
  var x0 = Math.max(0, (bord - V.ox) / V.k), x1 = Math.min(W, (r.width - bord - V.ox) / V.k);
  var y0 = Math.max(0, -V.oy / V.k), y1 = Math.min(H, (r.height - V.oy) / V.k);   /* la partie visible (avec le zoom) */
  var o = V.ici.querySelector('.lg-outils').getBoundingClientRect();   /* ni sous la bobine, ni sous le sac */
  var ob = {x1:(o.right - r.left + 8 - V.ox) / V.k, y1:(o.bottom - r.top + 8 - V.oy) / V.k};
  var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, l = [];
  for(var y = y0 + CH / 2 + 16; y <= y1 - CH / 2 - 6; y += CH * 0.55) for(var x = x0 + CW / 2 + 10; x <= x1 - CW / 2 - 10; x += CW * 0.55){
    if(x - CW / 2 < ob.x1 && y - CH / 2 < ob.y1) continue;
    l.push({x:x, y:y});
  }
  l.sort(function(a, b){ return Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy); });
  for(var i = 0; i < l.length; i++){
    var p = l[i];
    if(!cs.some(function(c){ return Math.abs(c.x - p.x) < CW + 6 && Math.abs(c.y - p.y) < CH * 0.8; })) return p;
  }
  return {x:borne(cx + ((cs.length * 37) % 120) - 60, CW / 2 + 6, W - CW / 2 - 6), y:borne(cy + ((cs.length * 53) % 90) - 45, CH / 2 + 6, H - CH / 2 - 6)};
}
function ajouter(k, pos){
  var L = etat(V.P); if(L.cartes[k]) return;
  L.cartes[k] = {x:Math.round(pos.x), y:Math.round(pos.y), s:0, z:++L.z};
  sauver(); dessiner();
  var el = V.monde.querySelector('.lg-carte[data-k="' + k + '"]'); if(el) el.classList.add('lg-pose');
  M.son('ok');
}
function retirer(k){
  var L = etat(V.P);
  delete L.cartes[k];
  L.fils = L.fils.filter(function(f){ return f[0] !== k && f[1] !== k; });
  if(V.sel === k){ V.sel = null; }
  sauver(); dessiner(); M.son('page');
}
function toucherCarte(k, el){
  var L = etat(V.P), d = L.cartes[k]; if(!d) return;
  if(V.mode === 'fil'){
    if(!V.sel){ V.sel = k; el.classList.add('lg-choisie'); consigne('🧵 Maintenant, touche la deuxième photo.'); M.son('clic'); return; }
    if(V.sel === k){ V.sel = null; el.classList.remove('lg-choisie'); consigne('🧵 Touche deux photos pour les relier.'); return; }
    var a = V.sel, b = k;
    var deja = L.fils.filter(function(f){ return (f[0] === a && f[1] === b) || (f[0] === b && f[1] === a); });
    if(deja.length){   /* déjà reliées : la bobine coupe le fil (l'autre façon de le couper) */
      L.fils = L.fils.filter(function(f){ return deja.indexOf(f) < 0; });
      finFil(); sauver(); majFils(); M.son('page'); M.toast('✂️ Fil coupé');
      return;
    }
    L.fils.push([a, b]);
    finFil(); sauver(); majFils(); M.son('magie');
    return;
  }
  /* une étiquette n'a pas de couleur d'avis : la toucher la fait juste sautiller */
  if(k.indexOf('signe:') === 0){ el.classList.remove('lg-pose'); void el.offsetWidth; el.classList.add('lg-pose'); M.son('clic'); return; }
  d.s = ((d.s || 0) + 1) % ETATS.length;
  var s = ETATS[d.s];
  el.classList.remove('lg-s-innocent', 'lg-s-surveiller', 'lg-s-suspect');
  if(s) el.classList.add('lg-s-' + s);
  var et = el.querySelector('.lg-etiq');
  if(s){ if(!et){ et = document.createElement('span'); et.className = 'lg-etiq'; el.appendChild(et); } et.textContent = ETIQ[s]; } else if(et) et.remove();
  sauver(); M.son('clic');
}
function finFil(){
  V.mode = null; V.sel = null;
  V.ici.querySelector('.lg-bobine').classList.remove('on');
  [].forEach.call(V.monde.querySelectorAll('.lg-choisie'), function(x){ x.classList.remove('lg-choisie'); });
  consigne('');
}
/* ---------- Le zoom à deux doigts ----------
   Comme la carte : un doigt fait glisser, deux doigts zooment autour du milieu des doigts (et font glisser).
   Pendant un pincement, le geste en cours (toucher, déplacer une photo, faire défiler) est annulé :
   un pincement n'épingle, n'enlève et ne colore jamais rien. */
function nbPts(){ return M.cle(V.pts).length; }
function annule(g){ return V.annule >= g; }
function commencerPinch(){
  V.annule = V.geste; V.reste = null;
  var ids = M.cle(V.pts).slice(0, 2), a = V.pts[ids[0]], b = V.pts[ids[1]], r = V.vue.getBoundingClientRect();
  V.pinch = {ids:ids, d0:Math.max(24, Math.hypot(a.x - b.x, a.y - b.y)), k0:V.k,
    wx:((a.x + b.x) / 2 - r.left - V.ox) / V.k, wy:((a.y + b.y) / 2 - r.top - V.oy) / V.k};
  V.vue.classList.add('lg-zoom');
}
function majPinch(){
  var p = V.pinch, a = V.pts[p.ids[0]], b = V.pts[p.ids[1]]; if(!a || !b) return;
  var r = V.vue.getBoundingClientRect();
  V.k = borne(p.k0 * Math.hypot(a.x - b.x, a.y - b.y) / p.d0, V.kMin, V.kMax);
  V.ox = (a.x + b.x) / 2 - r.left - p.wx * V.k; V.oy = (a.y + b.y) / 2 - r.top - p.wy * V.k;
  borner(); appliquer();
}
function finPinch(){
  V.pinch = null; V.vue.classList.remove('lg-zoom'); V.avale = Date.now();
  var id = M.cle(V.pts)[0];   /* un doigt reste : il continue de faire glisser, sans saut */
  if(id){ var q = V.pts[id]; V.reste = {id:id, x:q.x, y:q.y, ox:V.ox, oy:V.oy}; }
}
function suivreDoigts(){
  function mv(ev){
    if(!V) return; var q = V.pts[ev.pointerId]; if(!q) return;
    q.x = ev.clientX; q.y = ev.clientY;
    if(V.pinch) majPinch();
    else if(V.reste && V.reste.id == ev.pointerId){ V.ox = V.reste.ox + ev.clientX - V.reste.x; V.oy = V.reste.oy + ev.clientY - V.reste.y; borner(); appliquer(); }
  }
  function up(ev){
    if(!V || !V.pts[ev.pointerId]) return;
    delete V.pts[ev.pointerId];
    if(V.pinch && nbPts() < 2) finPinch();
    if(V.reste && V.reste.id == ev.pointerId) V.reste = null;
  }
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  V.suivis.push(function(){ window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); });
}
function brancher(){
  suivreDoigts();
  /* sur un ordinateur : Ctrl + molette (ou le pincement du pavé tactile) zoome autour de la souris */
  V.vue.addEventListener('wheel', function(e){
    if(!e.ctrlKey) return;
    e.preventDefault();
    var r = V.vue.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, wx = (mx - V.ox) / V.k, wy = (my - V.oy) / V.k;
    V.k = borne(V.k * Math.exp(-e.deltaY * 0.0025), V.kMin, V.kMax);
    V.ox = mx - wx * V.k; V.oy = my - wy * V.k; borner(); appliquer();
  }, {passive:false});
  /* les boutons de la vue */
  V.vue.addEventListener('click', function(e){
    var b = e.target.closest('[data-lg]'); if(!b) return;
    if(Date.now() - V.avale < 700) return;   /* juste après un pincement : on n'appuie sur rien */
    var a = b.dataset.lg;
    if(a === 'bobine'){
      if(V.mode === 'fil'){ finFil(); return; }
      V.mode = 'fil'; V.sel = null; b.classList.add('on'); consigne('🧵 Touche deux photos pour les relier.'); M.son('clic');
    } else if(a === 'sac'){ M.ouvrir({type:'barde-sac'}); }
    else if(a === 'retour'){ if(M.retourConv) M.retourConv(); }
    else if(a === 'gauche' || a === 'droite'){ V.ox = borne(V.ox + (a === 'gauche' ? 1 : -1) * V.w * 0.7, V.minOx, 0); appliquer(true); M.son('clic'); }
  });
  /* le panneau : une photo se touche ou se déplace ; un fil se coupe ; le liège fait défiler */
  V.vue.addEventListener('pointerdown', function(e){
    if(e.button > 0 || e.target.closest('button')) return;
    var el = e.target.closest('.lg-carte'), fil = e.target.closest('[data-fil]');
    e.preventDefault();
    V.pts[e.pointerId] = {x:e.clientX, y:e.clientY};
    if(nbPts() >= 2){ if(!V.pinch) commencerPinch(); return; }   /* deuxième doigt : on zoome */
    V.reste = null;
    var g = ++V.geste;
    if(el){
      var k = el.dataset.k, L = etat(V.P), d = L.cartes[k], x0 = d.x, y0 = d.y;
      function remettre(){   /* le geste est annulé par un pincement : la photo revient à sa place */
        V.bac.classList.remove('lg-survol');
        if(!el.classList.contains('lg-tenue')) return;
        d.x = x0; d.y = y0; el.classList.remove('lg-tenue'); el.style.zIndex = d.z;
        el.style.left = Math.round(d.x - CW / 2) + 'px'; el.style.top = Math.round(d.y - CH / 2) + 'px'; majFils();
      }
      suivre(e, {
        move:function(ev, dx, dy, bouge){
          if(annule(g)){ remettre(); return false; }
          if(!bouge) return;
          if(!el.classList.contains('lg-tenue')){ el.classList.add('lg-tenue'); d.z = ++L.z; el.style.zIndex = 9999; }
          d.x = borne(x0 + dx / V.k, CW / 2 + 6, W - CW / 2 - 6); d.y = borne(y0 + dy / V.k, CH / 2 + 6, H - CH / 2 - 6);
          el.style.left = Math.round(d.x - CW / 2) + 'px'; el.style.top = Math.round(d.y - CH / 2) + 'px';
          V.bac.classList.toggle('lg-survol', dans(V.bac, ev));
          majFils();
        },
        up:function(ev, bouge, coupe){
          if(annule(g)){ remettre(); return; }
          V.bac.classList.remove('lg-survol');
          if(!bouge){ if(!coupe) toucherCarte(k, el); return; }
          el.classList.remove('lg-tenue'); el.style.zIndex = d.z;
          if(!coupe && dans(V.bac, ev)){ retirer(k); return; }
          d.x = Math.round(d.x); d.y = Math.round(d.y); sauver();
        }
      });
      return;
    }
    var ox0 = V.ox, oy0 = V.oy;
    suivre(e, {
      move:function(ev, dx, dy, bouge){
        if(annule(g)){ V.vue.classList.remove('lg-defile'); return false; }
        if(bouge && (V.panX || V.panY)){ V.vue.classList.add('lg-defile'); V.ox = ox0 + dx; V.oy = oy0 + dy; borner(); appliquer(); }
      },
      up:function(ev, bouge, coupe){
        V.vue.classList.remove('lg-defile');
        if(annule(g)) return;
        if(!bouge && !coupe && fil){ var L = etat(V.P), i = +fil.dataset.fil; L.fils.splice(i, 1); sauver(); majFils(); M.son('page'); M.toast('✂️ Fil coupé'); }
      }
    });
  });
  /* les dossiers du bac : toucher l'un l'ouvre (et ferme les autres) */
  V.ici.querySelector('.lg-bac-cats').addEventListener('click', function(e){
    var b = e.target.closest('.lg-cat'); if(!b || !M.UI) return;
    M.UI.lgCat = M.UI.lgCat === b.dataset.cat ? null : b.dataset.cat;
    M.son('clic'); majBac(); ajuster();
  });
  /* le bac : glisser une photo vers le haut l'épingle ; la toucher l'épingle au milieu du tableau */
  V.liste.addEventListener('pointerdown', function(e){
    var bc = e.target.closest('.lg-bac-carte'); if(!bc || e.button > 0) return;
    var k = bc.dataset.k, fantome = null, tactile = e.pointerType !== 'mouse';
    suivre(e, {
      move:function(ev, dx, dy, bouge){
        if(!fantome){
          if(!bouge) return;
          if(tactile && !(dy < -6 && Math.abs(dy) > Math.abs(dx))) return false;   /* de côté : on laisse le bac défiler */
          var r = bc.getBoundingClientRect();
          fantome = bc.cloneNode(true); fantome.className += ' lg-fantome';
          fantome.style.width = r.width + 'px'; fantome.style.height = r.height + 'px';
          document.body.appendChild(fantome); bc.classList.add('lg-partie');
        }
        fantome.style.left = (ev.clientX - fantome.offsetWidth / 2) + 'px'; fantome.style.top = (ev.clientY - fantome.offsetHeight * 0.7) + 'px';
        V.vue.classList.toggle('lg-cible', dans(V.vue, ev));
      },
      up:function(ev, bouge, annule){
        V.vue.classList.remove('lg-cible');
        if(!fantome){
          if(!bouge && !annule) ajouter(k, placeLibre());   /* un simple toucher : une place libre, près du milieu de ce qu'on voit */
          return;
        }
        fantome.remove(); bc.classList.remove('lg-partie');
        if(!annule && dans(V.vue, ev)) ajouter(k, versMonde(ev));
      }
    });
  });
}

/* ---------- Le sac du Barde (ses codes à donner, ce qu'il a reçu) ---------- */
M.sacBarde = function(){
  var P = M.P(), s = '<h2>🎒 Mon sac</h2>';
  s += M.objetsTrouves();
  var objs = M.cle(P.recus).filter(function(k){ return k.indexOf('obj:') === 0; });
  if(objs.length) s += '<h3>Objets à montrer aux habitants</h3><div class="b-recus">' + objs.map(function(k){ var n = M.nomCode(k); return '<span class="b-puce-ingr">' + n.ic + ' ' + esc(n.nom) + '</span>'; }).join('') + '</div>';
  s += M.potionsRecues() + M.equipementUtile();
  return s + '<button class="btn grand" data-act="fermer">D\'accord</button>';
};

/* ---------- Le tableau qu'une nouvelle enquête reprend ----------
   S.liege (recopié à chaque changement) ; pour une ancienne sauvegarde : le tableau de l'enquête d'avant
   (en cours, ou le plus récent du journal). */
M.liegeGarde = function(S, avant){
  var L = S.liege || (avant && avant.liege) || null;
  if(!L){ var n = -1; M.cle(S.journal || {}).forEach(function(e){ var J = S.journal[e]; if(J && J.liege && (+e || J.e) > n){ n = +e || J.e; L = J.liege; } }); }
  if(!L || !L.cartes || !M.cle(L.cartes).length) return null;
  return {cartes:M.copie(L.cartes), fils:M.copie(L.fils || []), z:L.z || 1};
};

/* ---------- Le journal : le tableau d'une enquête passée, en lecture seule ---------- */
M.liegeJournal = function(J){
  if(M.role() !== 'barde' || !J || !J.liege) return '';
  var E = window.ENQUETES && J.e && window.ENQUETES[J.e]; if(!E) return '';
  var src = {liege:M.copie(J.liege), recus:{}, objets:{}};
  M.cle(src.liege.cartes || {}).forEach(function(k){ if(k.indexOf('obj:') === 0) src.objets[k.slice(4)] = true; });
  if(!M.cle(src.liege.cartes || {}).length) return '';
  var k = 0.36;
  return '<h3>📌 Mon tableau de liège</h3><div class="lg-jr"><div class="lg-jr-boite" style="width:' + Math.round(W * k) + 'px;height:' + Math.round(H * k) + 'px">' +
    '<div class="lg-monde lg-lecture" style="width:' + W + 'px;height:' + H + 'px;transform:scale(' + k + ')">' + mondeHTML(E, src, true) + '</div></div></div>';
};
})();
