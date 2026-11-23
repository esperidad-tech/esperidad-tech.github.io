/* ==========================================================
   Brumeval — « 🤝 Mes amis » : les codes des trois autres héros, tapés une fois pour toutes (Romain, 23 novembre ; Bible §13.97).

   Romain, 12 h 46 : « dès qu'on a créé le personnage, on peut rentrer le code de chacun […] Comme ça, c'est fait jusqu'à la fin de
   l'aventure […] pour la descente du donjon, il n'y a plus besoin de passer par tous ces codes […] à la fin, directement, on peut mettre
   les personnages dans la prison » ; 13 h 10 : « une fois que tout le monde a créé son personnage, tu fais 3 icônes […] à quoi ressemble
   le Barde, à quoi ressemble l'Alchimiste, à quoi ressemble le Sage. Et dès que tu cliques dessus, il y a le code […] dès que c'est
   rentré, ça te quitte la fenêtre automatiquement et ça te met le bouton en vert […] en haut des 3 boutons, il y a ton code personnel.
   Avec au-dessus ton personnage. »

   · L'écran (UI.ecran = 'amis') : mon héros, mon code de six dessins (M.tenueCode6, descente.js : toute l'apparence, les seize coiffures
     comprises), puis trois boutons, un par ami. Un ami pas encore tapé : son ombre et un « ? » ; tapé : son portrait, le bouton en vert.
   · Juste après la création du héros (moteur-actions.js, A['crea-fin'] : UI.amisCrea) : pas de « ← Retour », le bouton jaune
     « En route pour Brumeval ! » en bas (on peut partir sans avoir tout tapé). Ensuite, de partout : menu ☰ → « 🤝 Mes amis »,
     ou le bouton 🤝 de l'écran du héros. Toucher un bouton vert : on retape son code (un ami qui a changé de tête).
   · La fenêtre du code (M.ouvrir({type:'amis', r})) : six cases, le pavé des douze dessins (celui de la descente, `.ds-six`).
     Le sixième dessin tapé : bon code → l'ami est gardé, la fenêtre se ferme toute seule, le bouton passe au vert.
   · Gardés avec le héros : M.S.amis[rôle] = {sexe, age, peau, cheveux, coiffure, yeux, barbe}, d'une enquête à l'autre ; effacés
     seulement quand on recommence à la création (une nouvelle sauvegarde, M.etatNeuf). Qui s'en sert : descente.js (amiDe, amisDe,
     M.amisConnus : la descente du Pisteur, l'allure envoyée au donjon) et moteur-ecrans.js (le cachot de la fin de l'enquête 3).
   · Les robots (navigator.webdriver) ne passent pas par cet écran après la création, sauf window.BRUMEVAL_AVEC_AMIS (tools/amis.py).
   Chargé APRÈS descente.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
var esc = M.esc, A = M.A, UI = M.UI;
var ROLES = ['pisteur', 'alchimiste', 'barde', 'sage'];
function lire(t){ return M.lireBtn(t); }
function amis(){ var S = M.S; if(!S.amis || typeof S.amis !== 'object') S.amis = {}; return S.amis; }
function autres(){ var moi = M.role(); return ROLES.filter(function(r){ return r !== moi; }); }
/* « le Barde », « la Pisteuse », « l'Alchimiste » ; « du Barde », « de la Pisteuse », « de l'Alchimiste » (sans le savoir : au masculin) */
function nom(r, sexe){ return M.nomRole(r, sexe === 'f' ? 'f' : 'm'); }
function voy(n){ return /^[AEIOUÉÈ]/.test(n); }
function le(r, sexe){ var n = nom(r, sexe); return voy(n) ? 'l\'' + n : (sexe === 'f' ? 'la ' : 'le ') + n; }
function du(r, sexe){ var n = nom(r, sexe); return voy(n) ? 'de l\'' + n : (sexe === 'f' ? 'de la ' : 'du ') + n; }
function maj(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
/* le héros d'un ami, pour son portrait (comme au cachot : sa tenue est celle de son rôle) */
function heroAmi(r, a){
  var h = window.Persos && Persos.defaut ? Persos.defaut(r, a ? a.sexe : 'm') : {role:r};
  if(a) Object.assign(h, {sexe:a.sexe, peau:a.peau, cheveux:a.cheveux, age:a.age || 'adulte', coiffure:a.coiffure, yeux:a.yeux,
    barbe:a.age === 'enfant' || a.sexe !== 'm' ? 'aucune' : (a.barbe || 'aucune')});
  return Object.assign(h, {role:r, niveau:3, talents:[], equip:[]});
}

/* ---------- L'écran ---------- */
M.ecranAmis = function(){
  var moi = M.role(), R = D.ROLES[moi], a = amis(), l = autres(), crea = !!UI.amisCrea;
  var manque = l.filter(function(r){ return !a[r]; }), premier = manque[0];
  var t1 = 'Ton code secret : six dessins qui disent tout de ton héros. Montre-le à tes amis !';
  var t2 = !manque.length ? 'Toute l\'équipe est là ! Vous vous reconnaîtrez jusqu\'au bout de l\'aventure, même au fond des souterrains.'
    : 'Et tes amis, à quoi ressemblent-ils ? Chacun a son code : tape-le, et tu le reconnaîtras jusqu\'au bout de l\'aventure.';
  var boutons = l.map(function(r){
    var x = a[r], Rr = D.ROLES[r], qui = maj(le(r, x && x.sexe));
    return '<button class="am-ami' + (x ? ' on' : '') + (!x && r === premier ? ' b-guide' : '') + '" data-act="am-ami" data-r="' + r + '" aria-label="' + esc(x ? qui + ' : reconnu. Retaper son code' : 'À quoi ressemble ' + le(r) + ' ? Taper son code') + '">' +
      '<span class="am-ami-portrait' + (x ? '' : ' am-ombre') + '">' + M.portrait('buste', false, false, heroAmi(r, x)) + (x ? '' : '<b class="am-question" aria-hidden="true">?</b>') + '</span>' +
      '<span class="am-ami-nom">' + Rr.ic + ' ' + esc(x ? qui : nom(r)) + '</span>' +
      '<small>' + (x ? '✅ Reconnu' : '🔢 Son code') + '</small></button>';
  }).join('');
  var s = '<main class="b-page am-page" style="--c:' + R.c + '">' + (crea ? '<h1 class="centre am-titre">🤝 Mes amis</h1>' : M.barreRetour('🤝 Mes amis')) +
    '<section class="am-moi"><div class="am-moi-heros">' + M.portrait('buste', true, false) + '</div>' +
      '<div class="b-donne ds-moncode am-moncode"><p>' + esc(t1) + ' ' + lire(t1) + '</p><div class="ds-un">' + M.codeHTML(M.tenueCode6(), true) + '</div></div></section>' +
    '<p class="am-consigne">' + esc(t2) + ' ' + lire(t2) + '</p>' +
    '<div class="am-amis">' + boutons + '</div>';
  if(crea){
    var t3 = 'Un ami n\'a pas encore fini son héros ? Tu taperas son code plus tard : menu ☰, puis « 🤝 Mes amis ».';
    s += '<div class="b-bas"><button class="btn grand b-aller' + (manque.length ? '' : ' b-guide') + '" data-act="am-fin">✨ En route pour Brumeval !</button></div>' +
      (manque.length ? '<p class="am-plus-tard">' + esc(t3) + ' ' + lire(t3) + '</p>' : '');
  }
  return s + '</main>';
};

/* ---------- La fenêtre du code d'un ami ---------- */
M.amisHTML = function(m){
  var r = m.r, x = amis()[r], sx = x && x.sexe, seq = m.seq || [], o = D.ORDRE_SYM;
  var t = m.err || maj(le(r, sx)) + ' te montre son code ? Six dessins, dans l\'ordre. Pas un de travers !';
  return '<div class="b-info-modal am-fenetre"><div class="am-f-portrait' + (x ? '' : ' am-ombre') + '">' + M.portrait('buste', false, false, heroAmi(r, x)) + (x ? '' : '<b class="am-question" aria-hidden="true">?</b>') + '</div>' +
    '<h2>Le code ' + esc(du(r, sx)) + '</h2><p>' + esc(t) + ' ' + lire(t) + '</p>' +
    '<div class="b-saisie ds-six">' + [0, 1, 2, 3, 4, 5].map(function(i){ return '<div class="b-case' + (seq[i] ? ' pleine' : '') + '">' + (seq[i] ? D.SYM[seq[i]].e : '') + '</div>'; }).join('') + '</div>' +
    '<div class="b-pave">' + o.map(function(k){ return '<button data-act="am-sym" data-s="' + k + '" aria-label="' + D.SYM[k].n + '" title="' + D.SYM[k].n + '"><span aria-hidden="true">' + D.SYM[k].e + '</span></button>'; }).join('') + '</div>' +
    '<div class="b-rangee centre"><button class="btn second" data-act="am-efface"' + (seq.length ? '' : ' disabled') + '>⌫ Effacer</button><button class="btn second" data-act="fermer">Plus tard</button></div></div>';
};
A['am-ami'] = function(el){
  var r = el && el.dataset ? el.dataset.r : null; if(autres().indexOf(r) < 0) return;
  M.son('clic'); M.ouvrir({type:'amis', r:r, seq:[]});
};
A['am-sym'] = function(el){
  var m = UI.modal; if(!m || m.type !== 'amis' || !D.SYM[el.dataset.s]) return;
  m.seq = m.seq || []; if(m.seq.length >= 6) return;
  m.err = ''; m.seq.push(el.dataset.s); M.son('tic');
  if(m.seq.length < 6){ M.render(); return; }
  var x = M.decoderTenue6 ? M.decoderTenue6(m.seq) : null, moi = M.role();
  var err = !x ? 'Ce code ne marche pas. Regarde bien les six dessins, et recommence.'
    : x.a.role === moi ? 'Ça, c\'est TON code ! Demande plutôt celui ' + du(m.r) + '.'
    : x.a.role !== m.r ? 'Ce code-là, c\'est celui ' + du(x.a.role, x.a.sexe) + ' ! Regarde bien qui te le montre.' : '';
  if(err){ M.son('ko'); m.seq = []; m.err = err; M.render(); return; }
  amis()[m.r] = {sexe:x.a.sexe, age:x.a.age, peau:x.a.peau, cheveux:x.a.cheveux, coiffure:x.vz.coiffure, yeux:x.vz.yeux, barbe:x.vz.barbe};
  /* la fenêtre se ferme toute seule, le bouton passe au vert */
  M.son('gain'); UI.modal = null; M.sauver(); UI.garderDefilement = true; M.render();
};
A['am-efface'] = function(){ var m = UI.modal; if(!m || m.type !== 'amis') return; m.seq = (m.seq || []).slice(0, -1); m.err = ''; M.son('clic'); M.render(); };
A['am-fin'] = function(){ UI.amisCrea = false; M.son('page'); M.aller ? M.aller('accueil') : (UI.ecran = 'accueil', M.render()); };
})();
