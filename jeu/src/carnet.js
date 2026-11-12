/* ==========================================================
   Brumeval — le Carnet (pour tous les rôles), sous « 🎯 Mes missions » :
   · 👥 les habitants : toucher un visage ouvre tout ce qu'il t'a dit
     (ses réponses, ce qu'il a avoué quand tu l'as démasqué, ses ragots,
     sa déposition, les notes qui parlent de lui), avec 🔊. Retoucher le
     ferme ; on peut en ouvrir plusieurs. Les mini-jeux à relire sont
     rangés chez le bon habitant (un bouton 🔁 Relire).
   · 📝 Autres : ce qui n'est lié à personne (les mots perdus…).
   · 📝 Mes indices : toutes les autres notes, en liste compacte.
     Pour le Barde, les réponses des habitants n'y sont plus : elles vivent
     dans les visages.
   Chargé APRÈS moteur-actions.js (ajoute son action à M.A).
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
function esc(s){ return M.esc(s); }
var uid = 0;
function nom(id){ return (D.PNJ[id] && D.PNJ[id].court) || id; }
function metier(id){
  var x = D.PNJ[id] || {};
  return (x.icMetier ? x.icMetier + ' ' : '') + (x.metierCourt || String(x.metier || '').replace(/^(le |la |l')/i, ''));
}
function portrait(id){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
    try{ return Persos.pnj(id, {anime:false, humeur:'normal', id:'cn' + (++uid)}); }catch(e){}
  }
  return '<span class="cn-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}
/* Les habitants de l'enquête, plus ceux dont parlent les mini-jeux (un conteur de ragots…) */
function habitants(E, P){
  var l = [], vus = {};
  function aj(id){ if(id && id !== 'voisin' && D.PNJ[id] && !vus[id]){ vus[id] = 1; l.push(id); } }
  ((E.qui && E.qui.choix) || []).forEach(aj);
  M.cle(E.pnj || {}).forEach(aj);
  ((E.quoi && E.quoi.choix) || []).forEach(function(c){ if(c.pnj) aj(c.id); });
  (P.revisions || []).forEach(function(r){
    if(r.type === 'mensonge') aj(r.qui);
    (r.ragots || []).forEach(function(x){ aj(x.qui); });
    (r.depositions || []).forEach(function(x){ aj(x.qui); });
  });
  return l;
}
/* Les notes qui viennent d'une réponse d'habitant (elles sont déjà dans son visage) */
function notesDesReponses(E){
  var s = {};
  M.cle(E.pnj || {}).forEach(function(id){ (E.pnj[id].questions || []).forEach(function(q){ if(q.note) s[q.note] = 1; if(q.noteVrai) s[q.noteVrai] = 1; }); });
  M.cle(E.infos || {}).forEach(function(x){ var I = E.infos[x]; if(I.pnj) s['Reçu : ' + I.nom + '. ' + (I.t || '')] = 1; });
  return s;
}
function parleDe(t, id){
  var n = nom(id); if(!n || id === 'voisin') return false;
  return new RegExp('(^|[^A-Za-zÀ-ÿ])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-zÀ-ÿ])').test(String(t || ''));
}
var MARQUE = {v:'pareil', r:'bizarre', j:'hmm ?'};
/* ---------- Les renseignements « pour le Barde » sur un habitant ----------
   E.infos.x = {pour:'barde', de:'sage'|'alchimiste'|'pisteur', pnj:'margot', t:'…'}
            ou {pour:'barde', de:'sage', pnj:{odette:'…', basile:'…'}, t:'(résumé)'}
   Le Barde tape le code : c'est écrit dans le visage de l'habitant, dans son Carnet. */
var DE = {sage:'du Sage', alchimiste:'de l\'Alchimiste', pisteur:'du Pisteur'};
function ciblesInfo(I){ if(!I || !I.pnj) return {}; if(typeof I.pnj === 'string'){ var o = {}; o[I.pnj] = I.t || ''; return o; } return I.pnj; }
function infoDe(code, E){ E = E || M.E(); var q = String(code || '').split(':'); return q[0] === 'info' && E && E.infos && E.infos[q[1]] && E.infos[q[1]].pnj ? E.infos[q[1]] : null; }
/* « Margot », « Silas et Iris », « Gaspard, Basile et Odette » : sur qui le Barde va noter ce code */
M.surQui = function(code){
  var I = infoDe(code); if(!I) return '';
  var n = M.cle(ciblesInfo(I)).map(function(id){ return (D.PNJ[id] && D.PNJ[id].court) || id; });
  return n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : (n[0] || '');
};
function infosRecues(E, P, id){
  return M.cle(E.infos || {}).filter(function(x){ return (P.recus || {})['info:' + x] && ciblesInfo(E.infos[x])[id]; }).map(function(x){ return E.infos[x]; });
}
/* Tout ce qui concerne un habitant, pour cette tablette */
function dossier(E, P, id, notesQ){
  var l = [], N = (E.pnj || {})[id];
  if(N) (N.questions || []).forEach(function(q, i){
    if(P.vus['barde:' + id + ':' + i] !== 'ok') return;
    var v = P.vus['verite:' + id + ':' + i];
    l.push('<li class="cn-rep"><div><p class="cn-q">💬 ' + esc(q.q) + '</p><p class="cn-a">« ' + esc(q.a) + ' »</p>' +
      (v ? '<p class="cn-vrai">🔍 La vérité : « ' + esc(q.vrai) + ' »</p>' : '') + (M.repBarde ? M.repBarde(id, i, q) : '') + '</div>' + M.lireBtn(v ? q.a + ' La vérité : ' + q.vrai : q.a, id) + '</li>');
  });
  if(M.dossierBarde) l = M.dossierBarde(id).concat(l);   /* son secret de menteur, s'il boude… (barde.js) */
  (P.revisions || []).forEach(function(r, i){
    var relire = '<button class="btn petit second cn-relire" data-act="revoir" data-i="' + i + '">🔁 Relire</button>';
    if(r.type === 'mensonge' && r.qui === id){
      l.push('<li class="cn-rev"><div><p class="cn-q">🤥 ' + esc(r.titre || 'Repérer le mensonge') + '</p>' + (r.bilan ? '<p class="cn-bilan">' + esc(r.bilan) + '</p>' : '') + '</div>' + relire + '</li>');
    }
    if(r.type === 'ragots'){
      var mes = (r.ragots || []).filter(function(x){ return x.qui === id; });
      if(mes.length) l.push('<li class="cn-rev"><div><p class="cn-q">🍺 Ses ragots, à la taverne</p><ul class="cn-sous">' + mes.map(function(x){ return '<li><span>« ' + esc(x.texte) + ' »</span>' + M.lireBtn(x.texte, id) + '</li>'; }).join('') + '</ul></div>' + relire + '</li>');
    }
    if(r.type === 'depositions'){
      var d = (r.depositions || []).filter(function(x){ return x.qui === id; })[0];
      if(d) l.push('<li class="cn-rev"><div><p class="cn-q">📜 Sa déposition' + (r.scene ? ' · ' + esc(r.scene) : '') + '</p><ul class="cn-sous">' +
        d.phrases.map(function(ph){ return '<li class="cn-m' + (ph.m ? ' cn-m-' + ph.m : '') + '"><span>' + esc(ph.t) + '</span>' + (ph.m && MARQUE[ph.m] ? '<i>' + MARQUE[ph.m] + '</i>' : '') + '</li>'; }).join('') +
        '</ul></div>' + M.lireBtn(d.phrases.map(function(ph){ return ph.t; }).join(' '), id) + relire + '</li>');
    }
  });
  infosRecues(E, P, id).forEach(function(I){
    var t = ciblesInfo(I)[id];
    l.push('<li class="cn-info"><div><p class="cn-de">📨 ' + esc(DE[I.de] || 'd\'un équipier') + '</p><p>' + esc(t) + '</p></div>' + M.lireBtn(t, id) + '</li>');
  });
  (P.carnet || []).forEach(function(n){
    if(notesQ[n.t] || !parleDe(n.t, id)) return;
    l.push('<li class="cn-note"><span class="cn-nic">' + (n.ic || '📝') + '</span><p>' + esc(n.t) + '</p>' + M.lireBtn(n.t) + '</li>');
  });
  return l;
}

/* ==========================================================
   📜 Mon fil d'aventure (le Pisteur, « le mec de l'action ») : tout ce qu'il a fait et trouvé,
   le plus récent en haut. P.aventure = [{m, lieu, ic, titre, t, code, pour}], écrit au fil du jeu
   (M.majAventure, appelé à chaque rendu par mission.js) en regardant ce qui a changé depuis la
   dernière fois (P.aventureVu) : lieux explorés, points vus ou ratés, codes et potions reçus,
   actions données par le Sage, missions bonus.
   ========================================================== */
var MJNOM = {poursuite:['🏃 Course-poursuite gagnée !', '💨 Course-poursuite perdue…'], traces:['👣 Traces suivies !', '💨 Traces perdues…'],
  tir:['🎯 Dans le mille !', '💨 Raté…'], escalade:['🧗 Escalade réussie !', '💨 Tu as glissé…']};
function sansLieu(t){ var s = String(t || '').replace(/^[^:.!?]{1,32} : /, ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function pointPisteur(E, lieu, id){
  var l = [];
  try{ l = M.pointsVisibles(lieu, 'pisteur'); }catch(e){}
  var p = l.filter(function(x){ return x.id === id; })[0];
  if(p) return p;
  var R = E.lieux[lieu] && E.lieux[lieu].pisteur;
  return R && (R.points || []).filter(function(x){ return x.id === id; })[0];
}
M.majAventure = function(){
  var P = M.P(), E = M.E();
  if(!P || !E || M.role() !== 'pisteur' || P.etape !== 'jeu') return;
  var premiere = !P.aventure;
  P.aventure = P.aventure || [];
  var V = P.aventureVu = P.aventureVu || {vus:{}, recus:{}, potions:{}, aides:{}, bonus:{}};
  var n0 = P.aventure.length;
  function ev(o, m){ o.m = (m === undefined || m === null) ? P.moment : m; P.aventure.push(o); }
  /* Une vieille sauvegarde : on raconte d'abord ce qui était déjà fait, lieu par lieu */
  var cles = M.cle(P.vus);
  if(premiere) cles.sort(function(a, b){ return (P.vus['explore:' + a.split(':')[1]] || 0) - (P.vus['explore:' + b.split(':')[1]] || 0); });
  cles.forEach(function(k){
    var v = P.vus[k], q = k.split(':');
    if(q[0] === 'explore' && q.length === 2){
      if(V.vus[k] === v) return; V.vus[k] = v;
      ev({lieu:q[1], ic:'🔍', titre:'Tu explores ' + M.nomLieu(q[1]).replace(/^(Le |La |Les |L')/, function(a){ return a.toLowerCase(); }), t:''}, premiere ? v : null);
      return;
    }
    if(q[0] !== 'pisteur' || q.length !== 3 || V.vus[k] === v) return;
    V.vus[k] = v;
    var p = pointPisteur(E, q[1], q[2]); if(!p) return;
    var m = premiere ? P.vus['explore:' + q[1]] : null;
    var mj = p.mj && (MJNOM[p.mj] || ['🎮 Réussi !', '💨 Raté…']);
    if(v === 'rate'){
      ev({lieu:q[1], ic:p.ic, titre:p.nom, rate:1, t:mj[1] + ' ' + (p.rateNote ? sansLieu(p.rateNote) : (p.rate || 'Tu pourras réessayer en revenant ici.'))}, m);
      return;
    }
    var o = {lieu:q[1], ic:p.ic, titre:p.nom, t:(mj ? mj[0] + ' ' : '') + (p.note ? sansLieu(p.note) : (p.t || ''))};
    if(p.obj && E.objets[p.obj]){ o.code = 'obj:' + p.obj; o.pour = E.objets[p.obj].pour; }
    else if(p.donne){ o.code = p.donne; var x = p.donne.split(':'); o.pour = x[0] === 'info' && E.infos && E.infos[x[1]] ? E.infos[x[1]].pour : null; }
    ev(o, m);
  });
  /* Les codes reçus (et les lieux qu'ils ouvrent) */
  var ouvre = M.codesLieux ? M.codesLieux(E) : {};
  M.cle(P.recus || {}).forEach(function(k){
    if(!P.recus[k] || V.recus[k]) return; V.recus[k] = 1;
    var n; try{ n = M.nomCode(k); }catch(e){ n = {ic:'📩', nom:k}; }
    ev({ic:'📩', titre:'Code reçu', t:n.ic + ' ' + n.nom + '.'});
    var ls = ouvre[k] || [];
    if(ls.length) ev({lieu:ls[0], ic:'🔓', titre:'Passage ouvert', t:'Tu peux aller : ' + ls.map(function(l){ return M.nomLieu(l); }).join(', ') + ' !'});
  });
  M.cle(P.potions || {}).forEach(function(k){
    var c = P.potions[k] || 0, avant = V.potions[k] || 0;
    if(c > avant && D.POTIONS[k]) ev({ic:D.POTIONS[k].ic, titre:'Potion reçue', t:D.POTIONS[k].nom + '. ' + (D.POTIONS[k].d || '')});
    V.potions[k] = c;
  });
  M.cle(P.aides || {}).forEach(function(k){
    if(/^m\d+$/.test(k) || V.aides[k]) return; V.aides[k] = 1;
    ev({ic:'⚡', titre:'Une action en plus', t:'Le Sage t\'a donné une action.'});
  });
  (E.bonus || []).forEach(function(b){
    if(b.role !== 'pisteur' || !P.bonus || !P.bonus[b.id] || V.bonus[b.id]) return; V.bonus[b.id] = 1;
    ev({lieu:b.lieu, ic:'✨', titre:'Mission bonus : ' + b.titre, t:P.bonus[b.id] === 'ok' ? 'Réussie ! Tu as gagné de l\'or.' : 'Ratée… elle ne se rejoue pas.', rate:P.bonus[b.id] !== 'ok'});
  });
  if(P.aventure.length !== n0) try{ M.sauver(); }catch(e){}
};
function filAventure(P){
  var l = (P.aventure || []).slice().reverse(), E = M.E();
  var aide = 'Tout ce que tu fais et trouves s\'écrit ici, le plus récent en haut.';
  /* repliable, fermé au départ (Romain, 5 novembre, 13 h 19) : le titre est un bouton (P.filOuvert) */
  var ouvert = !!P.filOuvert;
  var s = '<section class="cn-aventure' + (ouvert ? '' : ' plie') + '"><h3><button type="button" class="b-mi-plier cn-fil-plier" data-act="fil-plier" aria-expanded="' + ouvert + '"><span>📜 Mon fil d\'aventure</span>' +
    (l.length ? '<small class="b-mi-compte">' + l.length + '</small>' : '') + '<i class="b-mi-fleche" aria-hidden="true">▾</i></button></h3>';
  if(!ouvert) return s + '</section>';
  s += '<p class="doux petit">' + esc(aide) + ' ' + M.lireBtn(aide) + '</p>';
  if(!l.length) return s + '<p class="cn-ev-vide">🥾 Ton aventure commence ! Va explorer : tout ce que tu fais s\'écrira ici. ' + M.lireBtn('Ton aventure commence ! Va explorer : tout ce que tu fais s\'écrira ici.') + '</p></section>';
  s += '<ol class="cn-fil">';
  l.forEach(function(e){
    var mid = (E.moments || [])[e.m], mo = D.MOMENTS[mid] || {ic:'🕰️', nom:''};
    var R = e.pour && D.ROLES[e.pour];
    var pour = e.code ? (R ? 'Son code est pour ' + R.le + ' ' + R.ic + '.' : 'Son code est pour toute l\'équipe.') : '';
    if(e.code && M.surQui(e.code)) pour = 'Donne ce code au Barde 🎻 : il le notera sur ' + M.surQui(e.code) + '.';
    var dire = (e.lieu ? M.nomLieu(e.lieu) + '. ' : '') + e.titre + '. ' + (e.t || '') + (pour ? ' ' + pour : '');
    s += '<li class="cn-ev' + (e.rate ? ' cn-ev-rate' : '') + (e.code ? ' cn-ev-obj' : '') + (e.ic === '🔍' ? ' cn-ev-pas' : '') + '">' +
      '<span class="cn-ev-m" title="' + esc(mo.nom) + '">' + mo.ic + '</span><div>' +
      (e.lieu ? '<p class="cn-ev-lieu">📍 ' + esc(M.nomLieu(e.lieu)) + '</p>' : '') +
      '<p class="cn-ev-t"><b>' + e.ic + ' ' + esc(e.titre) + '</b>' + (e.t ? ' ' + esc(e.t) : '') + '</p>' +
      (e.code ? '<div class="cn-ev-code"><span>🎁 ' + esc(pour) + '</span>' + M.codeHTML(M.code(e.code)) + '</div>' : '') +
      '</div>' + M.lireBtn(dire) + '</li>';
  });
  return s + '</ol></section>';
}

/* Le titre d'un mini-jeu à relire, quand il n'est pas rangé chez un habitant */
function titreRev(r){
  if(r.type === 'ragots') return r.titre || 'Les ragots de la taverne';
  if(r.type === 'depositions') return (r.titre || 'Les dépositions') + (r.scene ? ' · ' + r.scene : '');
  if(r.type === 'mensonge') return (r.titre || 'Repérer le mensonge') + (r.nom ? ' · ' + r.nom : (r.qui && D.PNJ[r.qui] ? ' · ' + D.PNJ[r.qui].court : ''));
  return r.titre || 'À relire';
}
/* ---------- 🔢 Les codes donnés (Romain, 5 novembre, 14 h 26) ----------
   Pour tout le monde, sous les missions, repliés au départ (P.codesOuvert) : chaque code que cette tablette a eu à dire
   (P.objets : les objets et les « _code » trouvés ; les potions données ; pour le Sage, les codes des moments et de la fin).
   Classe b-codes-donnes : un rappel, pas un nouveau code (tools/tuto.py). */
function pourQui(code){
  var d = null; try{ d = M.destinataire(code); }catch(e){}
  if(Array.isArray(d)) return d.map(function(r){ return D.ROLES[r] ? D.ROLES[r].ic + ' ' + D.ROLES[r].le : ''; }).join(' ou ');
  if(D.ROLES[d]) return D.ROLES[d].ic + ' ' + D.ROLES[d].le;
  return '👥 toute l\'équipe';
}
function codesDonnes(E, P){
  var l = [], vus = {};
  function aj(code, n){
    if(!code || vus[code]) return; vus[code] = 1;
    try{ n = n || M.nomCode(code); }catch(e){ return; }
    if(n) l.push({code:code, ic:n.ic, nom:n.nom});
  }
  if(M.role() === 'sage'){
    for(var i = 1; i <= P.moment && i < E.moments.length; i++) aj('moment:' + i);
    if(P.resolu && P.fin) aj(M.idVictoire ? M.idVictoire(P.fin.erreurs, P.fin.variante || 0) : 'victoire:' + Math.min(P.fin.erreurs || 0, 3), {ic:'🏆', nom:'Fin de l\'enquête'});   /* (enquête 3 : le code de fin porte la variante de la scène finale) */
  }
  M.cle(P.objets || {}).forEach(function(id){ if(P.objets[id]) aj(id.charAt(0) === '_' ? id.slice(1) : 'obj:' + id); });
  M.cle(P.donnes || {}).forEach(function(k){ if(P.donnes[k] && k.indexOf('pot:') === 0) aj(k); });
  return l;
}
function sectionCodes(E, P){
  var l = codesDonnes(E, P), ouvert = !!P.codesOuvert;
  var s = '<section class="b-missions b-codes-donnes cn-codes' + (ouvert ? '' : ' plie') + '"><h3><button type="button" class="b-mi-plier" data-act="codes-plier" aria-expanded="' + ouvert + '">' +
    '<span>🔢 Les codes donnés</span><small class="b-mi-compte">' + l.length + '</small><i class="b-mi-fleche" aria-hidden="true">▾</i></button></h3>';
  if(!ouvert) return s + '</section>';
  if(!l.length){ var v = 'Pas encore de code. Chaque code que tu trouves pour l\'équipe se range ici.'; return s + '<p class="doux cn-codes-vide">' + esc(v) + ' ' + M.lireBtn(v) + '</p></section>'; }
  var aide = 'Si un équipier a oublié de taper un code, redonne-le-lui.';
  s += '<p class="doux petit cn-codes-aide">' + esc(aide) + ' ' + M.lireBtn(aide) + '</p><div class="cn-codes-l">';
  l.forEach(function(c){
    var pour = pourQui(c.code);
    s += '<div class="b-code-ligne cn-code"><p><span aria-hidden="true">' + c.ic + '</span> <b>' + esc(c.nom) + '</b><small>Pour ' + esc(pour) + '</small></p>' + M.codeHTML(M.code(c.code)) + '</div>';
  });
  return s + '</div></section>';
}

/* Le Carnet (Romain, 5 novembre, 14 h 26) : pour tout le monde, seulement 🎯 les missions (mission.js, au-dessus) et 🔢 les codes donnés ;
   le Barde a en plus 👥 les habitants. Plus d'indices, de fil d'aventure (Pisteur), de « ce que l'équipe m'a donné » ni d'« Autres ».
   La lettre du maire et les archives des enquêtes passées sont dans le Grand Livre du Sage (livre.js). */
M.carnetCorps = function(){
  var E = M.E(), P = M.P(), role = M.role(), UI = M.UI;
  var s = sectionCodes(E, P);
  if(role !== 'barde') return s;
  var notesQ = notesDesReponses(E), ouverts = UI.carnetOuverts || {};
  var gens = habitants(E, P);
  /* (la chanson d'une mission bonus en cours, barde.js : elle n'apparaît que pendant cette mission) */
  if(M.trousBonusBarde) s += M.trousBonusBarde();
  /* 👥 Les habitants : repliables comme les missions, fermés au départ (Romain, 14 h 15) */
  var go = !!P.gensOuvert;
  s += '<section class="b-missions cn-gens' + (go ? '' : ' plie') + '"><h3><button type="button" class="b-mi-plier" data-act="gens-plier" aria-expanded="' + go + '"><span>👥 Les habitants</span>' +
    '<small class="b-mi-compte">' + gens.length + '</small><i class="b-mi-fleche" aria-hidden="true">▾</i></button></h3>';
  if(!go) return s + '</section>';
  s += '<div class="cn-liste">';
  gens.forEach(function(id){
    var items = dossier(E, P, id, notesQ), ouvert = !!ouverts[id];
    s += '<div class="cn-pnj' + (ouvert ? ' ouvert' : '') + (items.length ? '' : ' vide') + '">' +
      '<button type="button" class="cn-tete" data-act="carnet-pnj" data-id="' + id + '" aria-expanded="' + ouvert + '">' +
      '<span class="cn-por">' + portrait(id) + '</span><span class="cn-noms"><b>' + esc(nom(id)) + '</b><small>' + esc(metier(id)) + '</small></span>' +
      (items.length ? '<span class="cn-n">💬 ' + items.length + '</span>' : '') + '<span class="cn-fleche" aria-hidden="true">' + (ouvert ? '▴' : '▾') + '</span></button>';
    if(ouvert) s += '<ul class="cn-dossier">' + (items.length ? items.join('') : '<li class="cn-rien">Rien pour l\'instant.</li>') + '</ul>';
    s += '</div>';
  });
  return s + '</div></section>';
};

if(M.A){
  M.A['gens-plier'] = function(){ var P = M.P(); if(!P) return; P.gensOuvert = !P.gensOuvert; M.son('clic'); M.sauver(); M.UI.garderDefilement = true; M.render(); };
  M.A['codes-plier'] = function(){ var P = M.P(); if(!P) return; P.codesOuvert = !P.codesOuvert; M.son('clic'); M.sauver(); M.UI.garderDefilement = true; M.render(); };
  M.A['fil-plier'] = function(){ var P = M.P(); if(!P) return; P.filOuvert = !P.filOuvert; M.son('clic'); M.sauver(); M.UI.garderDefilement = true; M.render(); };
  M.A['carnet-pnj'] = function(el){
    var UI = M.UI; UI.carnetOuverts = UI.carnetOuverts || {};
    var id = el.dataset.id;
    if(UI.carnetOuverts[id]) delete UI.carnetOuverts[id]; else UI.carnetOuverts[id] = true;
    M.son('page'); UI.garderDefilement = true; M.render();
  };
}
})();
