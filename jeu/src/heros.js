/* ==========================================================
   Brumeval — l'écran du héros, le menu ☰ et ses pages
   (Comment jouer, Livre des Légendes), sauvegarder / charger
   un fichier, supprimer le personnage.
   Demandé par Romain le 3 novembre : tout tient sur un seul écran,
   le moins de texte possible, mêmes icônes sur téléphone et tablette.

   L'écran du héros (UI.ecran = 'heros') :
     - le paysage de Brumeval la nuit (dessiné à la taille de l'écran) ;
     - le héros en pied au milieu, avec sa tenue (garde-robe du Pisteur) et son équipement ;
     - à ses pieds : « Niveau N » et la barre « x / y points d'expérience » ;
     - la bourse 👛 (la boutique) et l'arbre des talents 🌳 ;
     - « Équipement » : des cases à gauche et à droite du héros.
   La mise en place (tailles, positions) se fait en JavaScript (placer), après chaque rendu
   et à chaque changement de taille : rien ne défile, de 360 × 740 à 1280 × 800.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.A) return;
var A = M.A, UI = M.UI, esc = M.esc;
function lire(t, qui){ return M.lireBtn(t, qui); }

/* ---------- Les talents en quelques mots (3 mots au plus) ---------- */
var COURT = {
  vision:'Vue de nuit', pistage:'Pistes plus faciles', reflexes:'Réflexes de chat', compagnon:'Un animal aide',
  camouflage:'Se cacher, épier', course:'Courses gagnées', instinct:'Sentir les pièges', tir:'Tir plus facile',
  scene:'Qui est passé', traque:'Suivre un suspect',
  potionniste:'Potions en double', savante:'Détails cachés', herboriste:'Cueillette gratuite', mainsure:'Potions plus faciles',
  poudres:'Fumigène, poudre', empreintes:'Relever les empreintes', transmutation:'Changer les ingrédients', antidote:'Contre les pièges',
  passe:'Voir le passé', ultime:'Trouver le propriétaire',
  tendre:'Écouter aux portes', exiger:'Exiger la vérité', charmeur:'Jamais vexant', physio:'Un menteur connu',
  rumeur:'Rumeur (Pisteur)', hydromel:'Hydromel (Alchimiste)', intuition:'Un mensonge montré', recoupement:'Comparer deux phrases',
  reseau:'Les enfants t\'aident', plaidoirie:'Plaider (Sage)',
  archiviste:'Pages scellées', stratege:'Rayer deux innocents', dechiffreur:'Codes plus faciles', inspiration:'Une action offerte',
  cartographe:'Passages secrets', tableau:'Grille aidée', protection:'Erreur pardonnée', etoiles:'Prévoir le coup',
  verification:'Vrai ou faux', conseil:'Tous répondent'
};
M.talentCourt = function(id){ return COURT[id] || (D.TALENTS[id] ? D.TALENTS[id].nom : id); };

/* ---------- Navigation : « ← Retour » revient là où on était ---------- */
var BASES = {accueil:1, enquete:1, creation:1};
M.aller = function(e){
  UI.pile = UI.pile || [];
  if(BASES[e]) UI.pile = [];
  else if(UI.ecran !== e){ UI.pile.push({e:UI.ecran, y:window.scrollY || 0}); if(UI.pile.length > 12) UI.pile.shift(); }
  if(e === 'heros' && UI.ecran !== 'heros') UI.arbre = false;
  UI.modal = null; UI.saisie = []; UI.ecran = e;
  M.render(); window.scrollTo(0, 0);
};
A.ecran = function(el){ M.aller(el.dataset.e); };
A.retour = function(){
  if(UI.ecran === 'heros' && UI.arbre){ UI.arbre = false; M.son('page'); M.render(); return; }   /* d'abord refermer l'arbre */
  UI.pile = UI.pile || [];
  var x = UI.pile.pop(), e = x ? x.e : (M.S && M.S.e ? 'enquete' : 'accueil');
  if(e === 'enquete' && !(M.S && M.S.e)) e = 'accueil';
  if(!M.S || !M.S.heros){ if(!BASES[e] && e !== 'qui' && e !== 'reglages' && e !== 'aide' && e !== 'legendes') e = 'accueil'; }
  UI.modal = null; UI.saisie = [];
  if(e !== 'heros') UI.arbre = false;
  UI.ecran = e; M.render(); window.scrollTo(0, x ? x.y : 0);
};
A.menu = function(){ M.aller('menu'); };
A['menu-enquete'] = A.menu;
A.aide = function(){ M.aller('aide'); };
A['changer-joueur'] = function(){ M.aller('qui'); };

/* ==========================================================
   L'écran du héros
   ========================================================== */
function nbCases(n){ return Math.max(8, n + (n % 2)); }
function caseHTML(id){
  var o = id && D.OBJETS[id];
  if(!o) return '<span class="hr-case vide" aria-hidden="true"></span>';
  return '<button class="hr-case pleine" data-act="hr-objet" data-id="' + esc(id) + '" aria-label="' + esc(o.nom) + '"><span>' + o.ic + '</span></button>';
}
M.ecranHeros = function(){
  var S = M.S, h = S.heros, R = D.ROLES[h.role], niv = M.niveau(S.xp), att = M.talentsEnAttente();
  var arbre = !!UI.arbre;
  var eq = S.equip.filter(function(id){ return D.OBJETS[id]; }), n = nbCases(eq.length), g = [], d = [];
  for(var i = 0; i < n; i++) (i % 2 ? d : g).push(caseHTML(eq[i]));
  var txt = niv.haut ? S.xp + ' / ' + niv.haut + ' points d\'expérience' : S.xp + ' points d\'expérience';
  var dit = 'Niveau ' + niv.n + '. ' + (niv.haut ? S.xp + ' points d\'expérience sur ' + niv.haut + '.' : S.xp + ' points d\'expérience.');
  return '<main class="hr-ecran' + (arbre ? ' hr-arbre-on' : '') + '" style="--c:' + R.c + '" data-cases="' + n + '">' +
    '<div class="hr-fond" aria-hidden="true"></div>' +
    '<header class="hr-haut"><button class="btn second petit b-retour" data-act="retour">← Retour</button></header>' +
    '<div class="hr-heros">' + M.portrait('pied', true, false) + '</div>' +
    '<div class="hr-equip hr-g"><span class="hr-equip-titre">Équipement</span><div class="hr-cases">' + g.join('') + '</div></div>' +
    '<div class="hr-equip hr-d"><div class="hr-cases">' + d.join('') + '</div></div>' +
    (arbre ? arbreHTML() : '') +
    '<div class="hr-bas">' +
      '<div class="hr-xp"><b class="hr-niv">Niveau ' + niv.n + '</b>' +
        '<div class="hr-barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + niv.pct + '"><i style="width:' + niv.pct + '%"></i><span>' + txt + '</span></div>' + lire(dit) + '</div>' +
      '<div class="hr-boutons">' +
        '<button class="hr-bourse" data-act="ecran" data-e="boutique" aria-label="Bourse : ' + S.or + ' pièces, la boutique"><span class="hr-bourse-ic">👛</span><b>' + S.or + '</b></button>' +
        '<button class="hr-btn-arbre' + (arbre ? ' on' : '') + '" data-act="hr-arbre" aria-label="Arbre des talents" aria-pressed="' + arbre + '"><span>🌳</span>' + (att.length ? '<i class="hr-badge">⭐</i>' : '') + '</button>' +
      '</div>' +
    '</div>' +
  '</main>';
};

/* ---------- L'arbre des talents : un tronc, un étage par palier (2 → 10), deux branches par étage ---------- */
function etatTalent(id){
  var t = D.TALENTS[id]; if(!t) return 'ferme';
  var pris = M.S.talents;
  if(pris.indexOf(id) >= 0) return 'pris';
  var frere = (D.TALENTS_PAR_ROLE[t.role][t.niv] || []).some(function(x){ return x !== id && pris.indexOf(x) >= 0; });
  if(frere) return 'non';
  return M.niveau(M.S.xp).n >= t.niv ? 'dispo' : 'ferme';
}
M.etatTalent = etatTalent;
function arbreHTML(){
  var T = D.TALENTS_PAR_ROLE[M.role()] || {};
  /* Pisteur, Alchimiste, Sage : leurs talents sont à refaire (Romain, 11 novembre) ; l'arbre attend, sans cases vides */
  if(!M.cle(T).length){
    var tv = 'Ton arbre pousse encore. Tes talents arrivent bientôt : continue tes enquêtes, ton expérience est gardée\u00a0!';
    return '<div class="hr-arbre hr-arbre-vide" role="group" aria-label="Arbre des talents"><div class="hr-tronc" aria-hidden="true"></div>' +
      '<p class="hr-arbre-msg">🌱 ' + esc(tv) + ' ' + lire(tv) + '</p><div class="hr-racines" aria-hidden="true"></div></div>';
  }
  var MARQUE = {pris:'✔', dispo:'⭐', ferme:'🔒', non:''};
  function boite(id, cote){
    var t = D.TALENTS[id]; if(!t) return '<span></span>';
    var et = etatTalent(id);
    return '<button class="hr-talent hr-' + et + ' hr-' + cote + '" data-act="hr-talent" data-id="' + id + '" data-etat="' + et + '" aria-label="' + esc(t.nom) + '">' +
      '<span class="hr-t-ic">' + t.ic + '</span><span class="hr-t-txt">' + esc(M.talentCourt(id)) + '</span>' + (MARQUE[et] ? '<i class="hr-t-etat">' + MARQUE[et] + '</i>' : '') + '</button>';
  }
  return '<div class="hr-arbre" role="group" aria-label="Arbre des talents"><div class="hr-tronc" aria-hidden="true"></div>' + [10, 8, 6, 4, 2].map(function(p){
    var ids = T[p] || [];
    return '<div class="hr-etage" data-niv="' + p + '">' + boite(ids[0], 'g') + '<span class="hr-niv-t">Niv. ' + p + '</span>' + boite(ids[1], 'd') + '</div>';
  }).join('') + '<div class="hr-racines" aria-hidden="true"></div></div>';
}
A['hr-arbre'] = function(){ UI.arbre = !UI.arbre; M.son(UI.arbre ? 'magie' : 'page'); M.render(); };
A['hr-talent'] = function(el){ var id = el.dataset.id; if(D.TALENTS[id]){ M.son('clic'); M.ouvrir({type:'perso', quoi:'talent', id:id}); } };
A['hr-objet'] = function(el){
  var o = D.OBJETS[el.dataset.id]; if(!o) return;
  M.son('clic'); M.ouvrir({type:'perso', quoi:'objet', id:el.dataset.id});
};

/* ---------- Fenêtres de cet écran (type 'perso' dans moteur-actions.js) ---------- */
M.modalPerso = function(m){
  if(m.quoi === 'talent'){
    var t = D.TALENTS[m.id], et = etatTalent(m.id);
    if(!t) return '';
    var pied = et === 'dispo' ? '<button class="btn magie grand" data-act="talent" data-id="' + m.id + '">⭐ Je prends ce talent</button>' :
      et === 'pris' ? '<p class="hr-etat-l">✔</p>' : et === 'ferme' ? '<p class="hr-etat-l">🔒 Niveau ' + t.niv + '</p>' : '';
    return '<div class="b-info-modal hr-fiche-talent"><div class="b-grand-ic">' + t.ic + '</div><h2>' + esc(t.nom) + '</h2><p>' + esc(t.d) + ' ' + lire(t.nom + '. ' + t.d) + '</p>' + pied +
      (et === 'dispo' ? '' : '<button class="btn" data-act="fermer">D\'accord</button>') + '</div>';
  }
  if(m.quoi === 'objet'){
    var o = D.OBJETS[m.id]; if(!o) return '';
    return '<div class="b-info-modal hr-fiche-objet"><div class="b-grand-ic">' + o.ic + '</div><h2>' + esc(o.nom) + '</h2><p>' + esc(o.d) + ' ' + lire(o.nom + '. ' + o.d) + '</p><button class="btn" data-act="fermer">D\'accord</button></div>';
  }
  if(m.quoi === 'charger') return chargerHTML(m);
  if(m.quoi === 'installer') return guideInstaller();
  if(m.quoi === 'horsligne') return horsLigneHTML();
  return '';
};

/* ---------- Le paysage de Brumeval la nuit, dessiné à la taille de l'écran ---------- */
function f1(v){ return Math.round(v * 10) / 10; }
function paysage(W, H, sol){
  var r = M.alea(4243 + Math.round(W) * 7), s = '';
  s += '<defs>' +
    '<linearGradient id="hr-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#100c30"/><stop offset=".62" stop-color="#2c2464"/><stop offset="1" stop-color="#5d4b90"/></linearGradient>' +
    '<radialGradient id="hr-halo"><stop offset="0" stop-color="#fff3d6" stop-opacity=".9"/><stop offset=".4" stop-color="#ffe1a8" stop-opacity=".35"/><stop offset="1" stop-color="#ffe1a8" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="hr-lune" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#fffaf0"/><stop offset=".8" stop-color="#ffe9c2"/><stop offset="1" stop-color="#ffd99a"/></radialGradient>' +
    '<linearGradient id="hr-mont" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3580"/><stop offset="1" stop-color="#221f55"/></linearGradient>' +
    '<linearGradient id="hr-mont2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4392"/><stop offset="1" stop-color="#2e2a6a"/></linearGradient>' +
    '<linearGradient id="hr-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b5a58"/><stop offset=".35" stop-color="#173a3c"/><stop offset="1" stop-color="#0c1d22"/></linearGradient>' +
  '</defs>';
  s += '<rect width="' + W + '" height="' + H + '" fill="url(#hr-ciel)"/>';
  /* étoiles */
  var n = Math.round(Math.min(140, W * sol / 5200)), et = '', sc = '';
  for(var i = 0; i < n; i++){
    var x = f1(r() * W), y = f1(r() * sol * .78), rr = f1(.6 + r() * 1.1);
    if(i % 9 === 0) sc += '<circle class="hr-scintille" style="animation-delay:-' + f1(r() * 2) + 's" cx="' + x + '" cy="' + y + '" r="' + f1(rr + .5) + '"/>';
    else et += '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '"/>';
  }
  s += '<g fill="#fff" opacity=".8">' + et + '</g><g fill="#fff">' + sc + '</g>';
  /* la lune, en haut à droite du héros */
  var lr = Math.max(24, Math.min(58, Math.min(W, H) * .065)), lx = f1(Math.min(W - lr - 16, W / 2 + Math.min(W * .3, 330))), ly = f1(Math.max(lr + 70, sol * .2));
  s += '<circle cx="' + lx + '" cy="' + ly + '" r="' + f1(lr * 2.1) + '" fill="url(#hr-halo)"/><circle cx="' + lx + '" cy="' + ly + '" r="' + f1(lr) + '" fill="url(#hr-lune)"/>' +
    '<circle cx="' + f1(lx - lr * .3) + '" cy="' + f1(ly - lr * .2) + '" r="' + f1(lr * .16) + '" fill="#f3dcb0" opacity=".6"/><circle cx="' + f1(lx + lr * .32) + '" cy="' + f1(ly + lr * .3) + '" r="' + f1(lr * .1) + '" fill="#f3dcb0" opacity=".5"/>';
  /* montagnes : deux rangées de sommets */
  var k = Math.max(.75, Math.min(1.5, H / 800));
  function crete(base, hmin, hmax, pas, fill){
    var x = -40, p = 'M-40 ' + f1(base);
    while(x < W + 40){
      var w = pas * (.7 + r() * .8), hh = hmin + r() * (hmax - hmin);
      p += ' L' + f1(x + w / 2) + ' ' + f1(base - hh) + ' L' + f1(x + w) + ' ' + f1(base - hh * (.25 + r() * .35));
      x += w;
    }
    return '<path d="' + p + ' L' + f1(W + 40) + ' ' + f1(H) + ' L-40 ' + f1(H) + ' Z" fill="' + fill + '"/>';
  }
  s += crete(sol - 30 * k, 90 * k, Math.min(sol * .42, 230 * k), 190 * k, 'url(#hr-mont2)');
  s += crete(sol - 18 * k, 50 * k, Math.min(sol * .3, 150 * k), 130 * k, 'url(#hr-mont)');
  /* la forêt de sapins */
  var x = -10, sap = '';
  while(x < W + 20){
    var hs = (26 + r() * 46) * k, ls = hs * (.28 + r() * .08), b = sol + 6 * k;
    sap += 'M' + f1(x - ls) + ' ' + f1(b) + ' L' + f1(x - ls * .55) + ' ' + f1(b - hs * .45) + ' L' + f1(x - ls * .8) + ' ' + f1(b - hs * .45) + ' L' + f1(x) + ' ' + f1(b - hs) +
      ' L' + f1(x + ls * .8) + ' ' + f1(b - hs * .45) + ' L' + f1(x + ls * .55) + ' ' + f1(b - hs * .45) + ' L' + f1(x + ls) + ' ' + f1(b) + ' Z ';
    x += (12 + r() * 16) * k;
  }
  s += '<path d="' + sap + '" fill="#1a1846"/>';
  /* la brume qui passe */
  s += '<g class="hr-derive"><ellipse cx="' + f1(W / 2) + '" cy="' + f1(sol - 4 * k) + '" rx="' + f1(W * .7) + '" ry="' + f1(20 * k) + '" fill="#cfc9ff" opacity=".12"/></g>';
  /* le sol, et quelques brins d'herbe */
  s += '<path d="M0 ' + f1(sol + 4) + ' Q ' + f1(W * .25) + ' ' + f1(sol - 10 * k) + ' ' + f1(W * .5) + ' ' + f1(sol - 2) + ' T ' + f1(W) + ' ' + f1(sol - 8 * k) + ' L' + f1(W) + ' ' + f1(H) + ' L0 ' + f1(H) + ' Z" fill="url(#hr-sol)"/>';
  var herbe = '';
  for(var j = 0; j < Math.round(W / 46); j++){
    var hx = f1(r() * W), hy = f1(sol + 6 + r() * Math.max(10, (H - sol) * .5)), hk = 1 + r() * .6;
    herbe += 'M' + hx + ' ' + hy + ' l' + f1(3 * hk) + ' ' + f1(-10 * hk) + ' l' + f1(3 * hk) + ' ' + f1(9 * hk) + ' ';
  }
  s += '<path d="' + herbe + '" stroke="#3f7f78" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>';
  return '<svg viewBox="0 0 ' + f1(W) + ' ' + f1(H) + '" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
}
M.paysageNuit = paysage;

/* ---------- Mise en place : tailles et positions exactes, sans défilement ---------- */
var dernierFond = '';
function px(v){ return Math.round(v) + 'px'; }
function placer(){
  var ec = document.querySelector('.hr-ecran'); if(!ec) return;
  var W = window.innerWidth, H = window.innerHeight;
  ec.classList.toggle('hr-large', W > H * 1.05);
  var cs = getComputedStyle(ec);
  var pT = parseFloat(cs.paddingTop) || 0, pL = parseFloat(cs.paddingLeft) || 0, pR = parseFloat(cs.paddingRight) || 0;
  var haut = ec.querySelector('.hr-haut').getBoundingClientRect().bottom;
  var basTop = ec.querySelector('.hr-bas').getBoundingClientRect().top;
  var pieds = basTop - 4;
  /* les cases d'équipement */
  var c = Math.round(Math.max(48, Math.min(72, W * .1, H * .085))), g = 8, titreH = 26;
  var n = +ec.dataset.cases || 8, parCote = n / 2;
  var zoneH = pieds - (haut + 8 + titreH);
  var rangs = Math.max(1, Math.min(parCote, Math.floor((zoneH + g) / (c + g))));
  var cols = Math.ceil(parCote / rangs); rangs = Math.ceil(parCote / cols);
  var colW = cols * c + (cols - 1) * g, colH = rangs * c + (rangs - 1) * g;
  /* le héros : debout sur le sol, juste au-dessus de la barre d'expérience ; le corps (±25 % de la largeur) ne passe jamais sous les cases */
  var cote = Math.max(pL, pR);
  var hH = Math.min((pieds - pT - 2) * 440 / 414, (W / 2 - cote - 22 - colW) / .25 * 440 / 300);
  hH = Math.max(160, hH);
  var hW = hH * 300 / 440, hTop = pieds - hH * 414 / 440;
  var he = ec.querySelector('.hr-heros');
  he.style.width = px(hW); he.style.height = px(hH); he.style.left = px((W - hW) / 2); he.style.top = px(hTop);
  var demi = hW * .25 + 10;
  var yC = hTop + hH * .56 - colH / 2;
  yC = Math.max(haut + 8 + titreH, Math.min(pieds - colH, yC));
  ec.style.setProperty('--hr-case', c + 'px');
  ec.style.setProperty('--hr-rangs', rangs);
  ec.querySelectorAll('.hr-equip').forEach(function(q){
    var gauche = q.classList.contains('hr-g');
    var x = gauche ? Math.max(cote + 12, W / 2 - demi - colW) : Math.min(W - cote - 12 - colW, W / 2 + demi);
    q.style.left = px(x); q.style.top = px(yC); q.style.width = px(colW); q.style.height = px(colH);
  });
  /* l'arbre des talents prend toute la scène */
  var ar = ec.querySelector('.hr-arbre');
  if(ar){
    var besoin = 5 * 52 + 16;
    if(pieds - haut - 12 >= besoin){ ar.style.top = px(haut + 8); ar.style.height = px(pieds - haut - 12); ar.style.width = ''; }
    else {
      /* écran bas (téléphone couché) : l'arbre monte jusqu'en haut, entre « ← Retour » et le bord droit */
      var dr = ec.querySelector('.hr-haut').getBoundingClientRect().right + 10;
      ar.style.top = px(pT + 12); ar.style.height = px(Math.max(5 * 48 + 16, pieds - pT - 16));
      ar.style.width = px(Math.min(760, W - 2 * dr));
    }
  }
  /* le paysage (redessiné seulement si la taille change) */
  var sol = pieds - hH * .045;
  var cle = [W, H, Math.round(sol)].join('x');
  var fond = ec.querySelector('.hr-fond');
  if(fond && (cle !== dernierFond || !fond.firstChild)){ fond.innerHTML = paysage(W, H, sol); dernierFond = cle; }
}
M.placerHeros = placer;
var attente = 0;
function auRedim(){ if(attente) return; attente = requestAnimationFrame(function(){ attente = 0; placer(); }); }
M.monterHeros = function(){
  var ec = document.querySelector('.hr-ecran');
  document.body.classList.toggle('hr-plein', !!ec);
  if(!ec) return;
  dernierFond = '';
  placer();
  if(!M.monterHeros.ecoute){
    M.monterHeros.ecoute = true;
    window.addEventListener('resize', auRedim);
    window.addEventListener('orientationchange', function(){ setTimeout(placer, 250); });
  }
};

/* ==========================================================
   Le menu ☰ (une page, comme les Réglages)
   ========================================================== */
/* iPhone ou iPad, dans Safari, sans être ajouté à l'écran d'accueil */
M.estIOS = function(){
  var ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};
/* Le plein écran de la Fullscreen API (pas une installation) */
function pleinActif(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
/* Le jeu tourne-t-il déjà installé (icône de l'écran d'accueil) ? */
M.installe = function(){
  var mq = function(q){ try{ return !!(window.matchMedia && window.matchMedia(q).matches); }catch(e){ return false; } };
  return navigator.standalone === true || mq('(display-mode: standalone)') || mq('(display-mode: minimal-ui)') || (mq('(display-mode: fullscreen)') && !pleinActif());
};
M.horsEcranAccueil = function(){ return !M.installe(); };
/* Android, Chrome, ordinateur : le navigateur propose l'installation ; on la garde pour le bouton du menu */
M.invitInstall = null;
window.addEventListener('beforeinstallprompt', function(e){
  try{ e.preventDefault(); }catch(x){}
  M.invitInstall = e;
  if(UI.ecran === 'menu' && M.render) try{ M.render(); }catch(x){}
});
window.addEventListener('appinstalled', function(){ M.invitInstall = null; if(UI.ecran === 'menu' && M.render) try{ M.render(); }catch(x){} });
M.peutInstaller = function(){ return !M.installe() && (!!M.invitInstall || M.estIOS()); };
M.peutPleinEcran = function(){
  var d = document.documentElement;
  if(M.installe()) return false;
  return !!((document.fullscreenEnabled && d.requestFullscreen) || (document.webkitFullscreenEnabled && d.webkitRequestFullscreen));
};
function surPleinEcran(){ if(UI.ecran === 'menu' && M.render) try{ M.render(); }catch(x){} }
document.addEventListener('fullscreenchange', surPleinEcran);
document.addEventListener('webkitfullscreenchange', surPleinEcran);
A.installer = function(){
  var e = M.invitInstall;
  if(e && e.prompt){
    M.invitInstall = null;
    try{
      var p = e.prompt();
      if(p && p.then) p.catch(function(){});
      if(e.userChoice && e.userChoice.then) e.userChoice.then(function(c){ if(c && c.outcome === 'accepted'){ M.son('magie'); M.toast('📲 Brumeval est sur l\'écran d\'accueil !'); } M.render(); }, function(){ M.render(); });
      else M.render();
    }catch(x){ M.render(); }
    return;
  }
  M.son('page'); M.ouvrir({type:'perso', quoi:'installer', classe:'hr-feuille-installer'});
};
A['plein-ecran'] = function(){
  var d = document.documentElement;
  try{
    if(pleinActif()){
      var q = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : null;
      if(q && q.then) q.then(surPleinEcran, surPleinEcran);
    } else {
      var r = d.requestFullscreen ? d.requestFullscreen({navigationUI:'hide'}) : d.webkitRequestFullscreen ? d.webkitRequestFullscreen() : null;
      if(r && r.then) r.then(surPleinEcran, function(){ M.toast('Le plein écran ne marche pas ici.'); });
    }
  }catch(x){ M.toast('Le plein écran ne marche pas ici.'); }
  M.son('clic');
};
/* Le petit guide en images pour iPhone et iPad (Safari n'a pas de bouton « Installer ») */
var ICONE_PARTAGE = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="18" width="28" height="24" rx="4" fill="none" stroke="#3f8cff" stroke-width="3.4"/><rect x="20" y="14" width="8" height="8" fill="#fff"/><path d="M24 30 V6 M15 14 L24 5 L33 14" fill="none" stroke="#3f8cff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var ICONE_ACCUEIL = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="32" height="32" rx="8" fill="none" stroke="#2b2b33" stroke-width="3.4"/><path d="M24 16 V32 M16 24 H32" stroke="#2b2b33" stroke-width="3.4" stroke-linecap="round"/></svg>';
function guideInstaller(){
  var dit = 'Pour installer le jeu sur ton iPhone ou ton iPad : dans Safari, touche le bouton Partager, en forme de carré avec une flèche. Puis touche « Sur l\'écran d\'accueil ». Puis touche « Ajouter ». L\'icône de Brumeval apparaît sur l\'écran d\'accueil.';
  return '<div class="hr-guide"><h2>📲 Installer le jeu</h2>' + lire(dit) +
    '<ol class="hr-etapes">' +
      '<li><span class="hr-num">1</span><span class="hr-ic-ios hr-ic-partage">' + ICONE_PARTAGE + '</span><b>Partager</b></li>' +
      '<li><span class="hr-num">2</span><span class="hr-ios-ligne"><span class="hr-ic-ios">' + ICONE_ACCUEIL + '</span><span>Sur l\'écran d\'accueil</span></span></li>' +
      '<li><span class="hr-num">3</span><span class="hr-ios-ajouter">Ajouter</span></li>' +
      '<li><span class="hr-num">✔</span><span class="hr-ic-jeu" aria-hidden="true">🏮</span><b>Brumeval</b></li>' +
    '</ol><button class="btn" data-act="fermer">D\'accord</button></div>';
}
/* ==========================================================
   📥 Jouer sans internet : demander au service worker de tout garder tout de suite
   (version GitHub seulement ; un serveur local pour les essais)
   ========================================================== */
var CLE_HL = 'brumeval-sans-internet';
var HL = {pret:null, date:null, enCours:null, etape:'', fait:0, total:0, echecs:[], erreur:'', voix:false};
M.HL = HL;
M.horsLignePossible = function(){
  try{
    if(!('serviceWorker' in navigator) || !window.caches || window.isSecureContext === false) return false;
    return (location.protocol === 'https:' && /github\.io$/.test(location.hostname)) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  }catch(e){ return false; }
};
function lireHL(){ try{ return JSON.parse(localStorage.getItem(CLE_HL) || 'null'); }catch(e){ return null; } }
function ecrireHL(o){ try{ localStorage.setItem(CLE_HL, JSON.stringify(o)); }catch(e){} }
var BASE_HL = ['./', './index.html', './salle.html', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
function fichiersJeu(){ return BASE_HL.map(function(u){ return new URL(u, location.href).href; }); }
function policesCSS(){ return Array.prototype.slice.call(document.querySelectorAll('link[rel=stylesheet]')).map(function(l){ return l.href; }).filter(function(h){ return /^https:\/\/fonts\.googleapis\.com\//.test(h); }); }
/* Les fichiers vraiment chargés jusqu'ici (Resource Timing) : polices utilisées, moteur des voix et ce qu'il a lui-même chargé */
try{ if(performance.setResourceTimingBufferSize) performance.setResourceTimingBufferSize(2000); }catch(e){}
function vus(re){ try{ return performance.getEntriesByType('resource').map(function(x){ return x.name; }).filter(function(u){ return re.test(u) && !/huggingface\.co|\.hf\.co/.test(u); }); }catch(e){ return []; } }
function fichiersVoix(){
  var V = window.Voix; if(!V || !V.pret) return [];
  var l = vus(/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\//);
  return l.length ? l : (V.SOURCES || []).slice(0, 1);
}
function dateCourte(iso){ return iso ? dateFr(iso.slice(0, 10)) : ''; }
M.verifierHL = function(){
  if(!M.horsLignePossible()) return Promise.resolve(false);
  var o = lireHL();
  if(!o || !Array.isArray(o.urls)){ HL.pret = false; return Promise.resolve(false); }
  var l = fichiersJeu().concat(o.urls);
  return Promise.all(l.map(function(u){ return caches.match(u, {ignoreVary:true}).then(function(r){ return !!r; }, function(){ return false; }); })).then(function(ok){
    HL.pret = ok.every(Boolean); HL.date = o.date; HL.voix = !!o.voix; HL.echecs = o.echecs || [];
    return HL.pret;
  }, function(){ HL.pret = false; return false; });
};
function surHL(){
  if(UI.modal && UI.modal.quoi === 'horsligne') M.render();
  else if(UI.ecran === 'menu' && !UI.modal) M.render();
}
function majBarreHL(){
  var b = document.getElementById('hl-barre'), t = document.getElementById('hl-txt');
  if(b) b.value = HL.total ? Math.round(HL.fait * 100 / HL.total) : 0;
  if(t) t.textContent = HL.etape === 'voix' ? '🗣️ …' : HL.fait + ' / ' + (HL.total || '…');
}
function lancerHL(){
  if(HL.enCours) return HL.enCours;
  var V = window.Voix;
  HL.fait = 0; HL.total = 0; HL.echecs = []; HL.erreur = '';
  HL.etape = V && V.pret && V.prechauffer ? 'voix' : 'jeu';
  HL.enCours = (HL.etape === 'voix' ? V.prechauffer() : Promise.resolve(false)).then(function(){
    HL.etape = 'jeu'; majBarreHL();
    return navigator.serviceWorker.ready;
  }).then(function(reg){
    var sw = reg.active || navigator.serviceWorker.controller;
    if(!sw) throw new Error('service worker absent');
    var urls = fichiersJeu().concat(vus(/^https:\/\/fonts\.gstatic\.com\//), fichiersVoix());
    return new Promise(function(ok, ko){
      var ch = new MessageChannel(), t = setTimeout(function(){ ko(new Error('trop long')); }, 300000);
      ch.port1.onmessage = function(ev){
        var m = ev.data || {};
        if(m.total){ HL.fait = m.fait; HL.total = m.total; majBarreHL(); }
        if(m.fini){ clearTimeout(t); ok(m); }
      };
      sw.postMessage({type:'brumeval-garder', urls:urls, polices:policesCSS()}, [ch.port2]);
    });
  }).then(function(m){
    var echecs = m.echecs || [], jeu = fichiersJeu();
    var manque = jeu.filter(function(u){ return echecs.indexOf(u) >= 0; });
    var o = {date:new Date().toISOString(), urls:(m.faits || []).filter(function(u){ return jeu.indexOf(u) < 0; }), echecs:echecs, voix:!!(window.Voix && Voix.pret)};
    HL.enCours = null; HL.echecs = echecs; HL.voix = o.voix;
    if(!manque.length){ ecrireHL(o); HL.pret = true; HL.date = o.date; M.son('victoire'); }
    else { HL.pret = false; HL.erreur = 'manque'; M.son('ko'); }
    surHL();
    return HL.pret;
  }).catch(function(e){ HL.enCours = null; HL.erreur = e.message || 'erreur'; M.son('ko'); surHL(); return false; });
  return HL.enCours;
}
M.lancerHL = lancerHL;
A['hors-ligne'] = function(){
  M.son('page');
  M.ouvrir({type:'perso', quoi:'horsligne'});
  if(!HL.pret && !HL.enCours) { lancerHL(); M.render(); }
};
A['hors-ligne-maj'] = function(){ lancerHL(); M.render(); };
/* Les voix qu'on vient de télécharger : on garde aussi leur moteur pour jouer sans internet */
var telechargerVoix = A['voix-telecharger'];
A['voix-telecharger'] = function(el){
  var p = telechargerVoix(el);
  if(p && p.then) p.then(function(ok){ if(ok && M.horsLignePossible() && (lireHL() || (UI.modal && UI.modal.quoi === 'horsligne'))) lancerHL(); });
  return p;
};
function horsLigneHTML(){
  var V = window.Voix, s = '<div class="hr-hl"><h2>📥 Jouer sans internet</h2>';
  if(HL.enCours){
    s += '<div class="hr-hl-prog"><progress id="hl-barre" max="100" value="' + (HL.total ? Math.round(HL.fait * 100 / HL.total) : 0) + '"></progress><small id="hl-txt">' + (HL.etape === 'voix' ? '🗣️ …' : HL.fait + ' / ' + (HL.total || '…')) + '</small></div>';
  } else if(HL.pret){
    var d = dateCourte(HL.date), t = 'Prêt à jouer sans internet' + (d ? ', depuis le ' + d : '') + '.';
    s += '<p class="hr-hl-ok">✅ Prêt à jouer sans internet ' + lire(t) + '</p>' + (d ? '<p class="doux">📅 ' + esc(d) + '</p>' : '');
    var autres = (HL.echecs || []).filter(function(u){ return !/^erreur/.test(u); });
    if(autres.length){ var t3 = 'Quelques polices ou fichiers des voix manquent. Réessaie avec le wifi.'; s += '<p class="doux petit">⚠️ ' + esc(t3) + ' ' + lire(t3) + '</p>'; }
  } else if(HL.erreur){
    var t2 = 'Ça n\'a pas marché. Vérifie le wifi, puis réessaie.';
    s += '<p class="hr-hl-ko">⚠️ ' + esc(t2) + ' ' + lire(t2) + '</p>';
  }
  if(V && V.possible && !V.pret){
    var t4 = 'Les voix ne sont pas encore téléchargées';
    s += '<div class="hr-hl-voix"><p>🗣️ ' + esc(t4) + ' ' + lire(t4 + '.') + '</p>' + (M.voixHTML ? M.voixHTML() : '') + '</div>';
  }
  if(!HL.enCours) s += '<div class="b-rangee centre">' + (HL.pret ? '<button class="btn second" data-act="hors-ligne-maj">🔄 Mettre à jour</button>' : HL.erreur ? '<button class="btn second" data-act="hors-ligne-maj">📥 Réessayer</button>' : '') +
    '<button class="btn" data-act="fermer">D\'accord</button></div>';
  return s + '</div>';
}
/* 📴 tout petit, en haut au milieu, quand il n'y a plus d'internet (ça ne bloque rien) */
function majReseau(){
  var el = document.getElementById('hr-reseau');
  if(!el){ el = document.createElement('div'); el.id = 'hr-reseau'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'Sans internet'); el.textContent = '📴'; if(document.body) document.body.appendChild(el); }
  el.hidden = navigator.onLine !== false;
}
window.addEventListener('online', majReseau);
window.addEventListener('offline', majReseau);
if(document.body) majReseau(); else document.addEventListener('DOMContentLoaded', majReseau);
setTimeout(function(){ M.verifierHL().then(function(){ if(UI.ecran === 'menu') surHL(); }); }, 400);

M.ecranMenu = function(){
  var plein = pleinActif();
  return '<main class="b-page hr-page hr-menu">' + M.barreRetour('Menu') +
    '<nav class="hr-menu-l">' +
      (M.S.heros ? '<button class="btn second" data-act="ecran" data-e="heros">🧝 Mon héros</button>' : '') +
      (M.S.calepin && M.S.calepin.length && M.S.heros && M.S.heros.role === 'sage' ? '<button class="btn second" data-act="calepin">📔 Calepin</button>' : '') +   /* (le calepin des enquêtes passées : au Sage, Romain, 14 h 15) */
      '<button class="btn second" data-act="aide">❓ Comment jouer</button>' +
      '<button class="btn second" data-act="ecran" data-e="reglages">⚙️ Réglages</button>' +
      '<button class="btn second" data-act="changer-joueur">👥 Changer de joueur</button>' +
      (M.peutInstaller() ? '<button class="btn second" data-act="installer">📲 Installer le jeu</button>' : '') +
      (M.peutPleinEcran() ? '<button class="btn second" data-act="plein-ecran">⛶ ' + (plein ? 'Quitter le plein écran' : 'Plein écran') + '</button>' : '') +
      (M.horsLignePossible() ? '<button class="btn second' + (HL.pret ? ' hr-hl-pret' : '') + '" data-act="hors-ligne">' + (HL.enCours ? '📥 Jouer sans internet…' : HL.pret ? '✅ Prêt sans internet' : '📥 Jouer sans internet') + '</button>' : '') +
      '<button class="btn second" data-act="sauvegarder">💾 Sauvegarder</button>' +
      chargerBouton('📂 Charger') +
      '<button class="btn second" data-act="ecran" data-e="legendes">📖 Livre des Légendes</button>' +
      '<button class="btn danger" data-act="supprimer">🗑️ Supprimer le personnage</button>' +
      '<a class="btn second hr-projets" href="https://esperidad-tech.github.io/">🏠 Revenir aux projets de Romain</a>' +   /* Romain, 4 novembre, 20 h 41 */
    '</nav>' +
  '</main>';
};
/* Le bouton « Charger » : une étiquette qui ouvre le choix du fichier (marche aussi sur iPhone) */
function chargerBouton(txt, classe){
  return '<label class="btn second hr-charger' + (classe ? ' ' + classe : '') + '">' + txt + '<input type="file" id="import" accept=".json,application/json,text/plain,.txt"></label>';
}
M.chargerBouton = chargerBouton;

/* ---------- Comment jouer (le même contenu, sans bouton en bas) ---------- */
M.ecranAide = function(){
  return '<main class="b-page hr-page hr-aide">' + M.barreRetour('Comment jouer') + (M.aideHTML ? M.aideHTML() : '') + '</main>';
};

/* ---------- Le Livre des Légendes ---------- */
var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function dateFr(d){
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
  return m ? (+m[3]) + (m[3] === '01' ? 'er' : '') + ' ' + MOIS[+m[2] - 1] + ' ' + m[1] : (d || '');
}
function lookLegende(x){
  var h;
  if(x.look && typeof x.look === 'object') h = M.copie(x.look);
  else h = Object.assign(window.Persos ? Persos.defaut(D.ROLES[x.role] ? x.role : 'pisteur', x.sexe) : {role:x.role}, {nom:x.nom});
  h.role = D.ROLES[h.role] ? h.role : (D.ROLES[x.role] ? x.role : 'pisteur');
  h.niveau = h.niveau || x.niveau || 1; h.potion = null;
  h.talents = h.talents || []; h.equip = h.equip || [];
  return h;
}
function carteLegende(x){
  var R = D.ROLES[x.role] || D.ROLES.pisteur, f = x.sexe === 'f';
  var fin = x.fin === 'supprime' ? {ic:'🗑️', t:f ? 'Supprimée' : 'Supprimé'} : {ic:'🌫️', t:(f ? 'Perdue' : 'Perdu') + ' dans la brume'};
  var role = M.nomRole(D.ROLES[x.role] ? x.role : 'pisteur', x.sexe), date = dateFr(x.date);
  var dit = (x.nom || '') + ', ' + role + ' de niveau ' + (x.niveau || 1) + '. Arrivé' + (f ? 'e' : '') + ' à l\'enquête ' + (x.e || 1) + '. ' + fin.t + (date ? ', le ' + date : '') + '.';
  return '<article class="hr-leg" style="--c:' + R.c + '"><div class="hr-leg-img">' + M.portrait('pied', false, true, lookLegende(x)) + '</div>' +
    '<div class="hr-leg-txt"><b class="hr-leg-nom">' + esc(x.nom || '?') + '</b><span>' + R.ic + ' ' + esc(role) + '</span>' +
    '<span class="hr-leg-puces"><i>🔍 Enquête ' + (x.e || 1) + '</i><i>⭐ Niveau ' + (x.niveau || 1) + '</i></span>' +
    '<span class="hr-leg-fin">' + fin.ic + ' ' + fin.t + '</span>' + (date ? '<span class="doux">📅 ' + esc(date) + '</span>' : '') +
    '</div>' + lire(dit) + '</article>';
}
M.ecranLegendes = function(){
  var l = (M.S.legendes || []).filter(function(x){ return x && typeof x === 'object'; }).slice().reverse();
  var s = '<main class="b-page hr-page hr-legendes">' + M.barreRetour('Livre des Légendes');
  if(!l.length) s += '<p class="b-carte-verre centre hr-leg-vide">📖 Le livre est vide. ' + lire('Le livre est vide.') + '</p>';
  return s + '<div class="hr-leg-liste">' + l.map(carteLegende).join('') + '</div></main>';
};
/* Ce qu'on garde d'un héros qui s'en va : son apparence exacte (tenue de la garde-robe et couleurs comprises) */
M.lookActuel = function(){
  var h = M.heroObj(); h.potion = null;
  if(h.garde) h.garde = M.copie(h.garde);
  return h;
};

/* ==========================================================
   Sauvegarder / Charger un fichier
   ========================================================== */
function propre(t){
  var s = String(t || 'heros');
  try{ s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(e){}
  return s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'heros';
}
M.nomFichier = function(){
  var d = new Date(), j = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  return 'Brumeval-' + propre(M.S.heros && M.S.heros.nom) + '-' + j + '.json';
};
M.texteSauvegarde = function(){
  var S = M.S, h = S.heros || {};
  return JSON.stringify({jeu:'brumeval', v:2, quand:new Date().toISOString(), heros:{nom:h.nom, role:h.role, sexe:h.sexe, niveau:M.niveau(S.xp).n}, etat:S});
};
function telecharger(blob, nom){
  var url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = nom; a.rel = 'noopener'; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ try{ URL.revokeObjectURL(url); a.remove(); }catch(e){} }, 4000);
  M.son('ok'); M.toast('💾 ' + nom);
}
A.sauvegarder = function(){
  if(!M.S || !M.S.heros) return;
  M.sauver();
  var nom = M.nomFichier(), blob = new Blob([M.texteSauvegarde()], {type:'application/json'}), f = null;
  try{ f = new File([blob], nom, {type:'application/json'}); }catch(e){}
  /* iPhone, Android : la feuille de partage (Fichiers, Drive, message…) ; sinon, un simple téléchargement */
  try{
    if(f && navigator.share && navigator.canShare && navigator.canShare({files:[f]})){
      navigator.share({files:[f], title:nom}).then(function(){ M.son('ok'); M.toast('💾 ' + nom); }, function(e){ if(e && e.name === 'AbortError') return; telecharger(blob, nom); });
      return;
    }
  }catch(e){}
  telecharger(blob, nom);
};
/* Lire le fichier choisi, le vérifier, puis demander avant de remplacer */
M.chargerFichier = function(fichier){
  if(!fichier) return;
  function mauvais(){
    M.son('ko');
    M.ouvrir({type:'info', ic:'🤔', titre:'Ce fichier ne marche pas', t:'Ce n\'est pas une partie de Brumeval. Choisis le fichier qui commence par « Brumeval ».'});
  }
  if(fichier.size > 8 * 1024 * 1024){ mauvais(); return; }
  var r = new FileReader();
  r.onerror = mauvais;
  r.onload = function(){
    var etat = M.lireSauvegarde ? M.lireSauvegarde(r.result) : null;
    if(!etat){ mauvais(); return; }
    UI.aCharger = etat;
    M.son('page');
    M.ouvrir({type:'perso', quoi:'charger', fixe:true});
  };
  try{ r.readAsText(fichier); }catch(e){ mauvais(); }
};
function chargerHTML(){
  var s = UI.aCharger; if(!s || !s.heros) return '';
  var h = s.heros, niv = M.niveau(s.xp || 0).n, role = M.nomRole(h.role, h.sexe);
  var remplace = !!(M.S && M.S.heros);
  var titre = remplace ? 'Remplacer la partie de cette tablette ?' : 'Charger cette partie ?';
  var t = h.nom + ', ' + role + ', niveau ' + niv + '.';
  var hv = Object.assign({}, h, {niveau:niv, talents:s.talents || [], equip:s.equip || [], garde:M.lookGarde ? M.lookGarde(s) : null});
  return '<div class="b-info-modal hr-fiche-charger"><div class="hr-charger-img">' + M.portrait('buste', false, true, hv) + '</div><h2>' + esc(titre) + '</h2>' +
    '<p><b>' + esc(t) + '</b> ' + lire(titre + ' ' + t + (remplace ? ' La partie de cette tablette sera remplacée.' : '')) + '</p>' +
    (remplace ? '<p class="doux">⚠️ ' + esc(M.S.heros.nom) + ' → ' + esc(h.nom) + '</p>' : '') +
    '<div class="b-rangee centre"><button class="btn second" data-act="hr-charger-non">Non</button><button class="btn' + (remplace ? ' danger' : '') + '" data-act="hr-charger-oui">📂 Oui, charger</button></div></div>';
}
A['hr-charger-non'] = function(){ UI.aCharger = null; M.fermer(); };
A['hr-charger-oui'] = function(){
  var s = UI.aCharger; UI.aCharger = null;
  if(!s) { M.fermer(); return; }
  var avant = M.S || {};
  if(avant.options) s.options = avant.options;   /* le son de cette tablette ne change pas */
  /* le Livre des Légendes de cette tablette est gardé (et complété par celui du fichier) */
  var vu = {}, leg = [];
  (s.legendes || []).concat(avant.legendes || []).forEach(function(x){
    if(!x || typeof x !== 'object') return;
    var k = [x.nom, x.role, x.e, x.niveau, x.date, x.fin || ''].join('|');
    if(!vu[k]){ vu[k] = 1; leg.push(x); }
  });
  s.legendes = leg;
  M.S = s; M.sauver();
  UI.modal = null; UI.pile = []; UI.saisie = []; UI.arbre = false; UI.ecran = 'accueil';
  M.render(); window.scrollTo(0, 0);
  M.son('magie'); M.toast('📂 ' + s.heros.nom + ' est de retour !');
};

/* ==========================================================
   Supprimer le personnage (comme une défaite : Livre des Légendes, puis création)
   ========================================================== */
A.supprimer = function(){
  var h = M.S && M.S.heros; if(!h) return;
  UI.confirmer = function(){ M.recommencer('supprime'); };
  M.son('ko');
  M.ouvrir({type:'confirmer', titre:'Supprimer ' + h.nom + ' ?', t:'⚠️ ' + h.nom + ' part dans le Livre des Légendes. Niveau, or, objets : tout est perdu, et on ne peut pas revenir en arrière.', oui:'🗑️ Oui, supprimer', danger:true, classe:'hr-confirme'});
};
})();
