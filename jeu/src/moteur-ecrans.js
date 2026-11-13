/* ==========================================================
   Brumeval v2 — moteur, partie 2 : les écrans (HTML)
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, esc = M.esc;
var UI = M.UI = {ecran:'accueil', modal:null, lectures:[], crea:null, creaEtape:1, boutiquePalier:1, saisie:[], page:null, fin:null, finSlide:0};

/* ---------- Petits morceaux ---------- */
function lire(t, qui){ var i = UI.lectures.push({t:t, qui:qui || null}) - 1; return '<button class="b-lire" data-act="lire" data-i="' + i + '" aria-label="Écouter">🔊</button>'; }
M.lireBtn = lire;
function heroObj(){ var h = M.copie(M.S.heros); h.niveau = M.niveau(M.S.xp).n; h.talents = M.S.talents.slice(); h.equip = M.S.equip.slice(); h.garde = M.lookGarde ? M.lookGarde() : null; /* la tenue de la garde-robe du Pisteur (cabane.js) */ return h; }
M.heroObj = heroObj;
var compteur = 0;
function portrait(vue, anime, fond, h){
  h = h || heroObj();
  if(window.Persos && Persos.heros){
    try{ return Persos.heros(h, {vue:vue, anime:anime !== false, fond:!!fond, id:'h' + (++compteur)}); }catch(e){ console.error(e); }
  }
  return '<div class="b-emoji-heros">' + D.ROLES[h.role].ic + '</div>';
}
M.portrait = portrait;
function pnjImg(id, humeur){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
    try{ return Persos.pnj(id, {anime:true, humeur:humeur || 'normal', id:'p' + (++compteur)}); }catch(e){ console.error(e); }
  }
  return '<div class="b-emoji-pnj">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</div>';
}
M.pnjImg = pnjImg;
/* Un code : seulement les dessins (Romain : « les dessins suffisent ») ; le nom reste pour les lecteurs d'écran et au survol */
function codeHTML(seq, grand){
  return '<div class="b-code' + (grand ? ' grand' : '') + '">' + seq.map(function(s, i){
    return '<div class="b-sym" role="img" aria-label="' + D.SYM[s].n + '" title="' + D.SYM[s].n + '" style="animation-delay:' + (i * .12) + 's"><span aria-hidden="true">' + D.SYM[s].e + '</span></div>';
  }).join('') + '</div>';
}
M.codeHTML = codeHTML;
function besoinHTML(besoin, role){
  var l = M.texteBesoin(besoin, role);
  if(!l.length) return '';
  var P = M.P(), boire = '';
  if(P){
    var cles = (besoin || []).filter(function(b){ return b.acces; }).map(function(b){ return b.acces; });
    M.cle(P.potions).forEach(function(pid){
      var p = D.POTIONS[pid];
      if(P.potions[pid] > 0 && (p.fx.acces || []).some(function(a){ return cles.indexOf(a) >= 0; }))
        boire += '<button class="btn magie petit" data-act="boire" data-id="' + pid + '">' + p.ic + ' Boire : ' + esc(p.nom) + '</button>';
    });
  }
  return '<div class="b-besoin"><span class="sur-titre">Ce qui marcherait</span><ul>' + l.map(function(x){ return '<li><span>' + x.ic + '</span> ' + esc(x.nom) + '</li>'; }).join('') + '</ul>' + boire + '</div>';
}
M.besoinHTML = besoinHTML;
M.pipsHTML = function(){ return pips(); };
function pips(){
  if(M.sansActions()) return '';   /* enquête sans points d'action : pas de pastilles */
  var P = M.P(), max = Math.max(M.actionsMax(), P.actions), s = '';
  for(var i = 0; i < max; i++) s += '<i class="' + (i < P.actions ? 'plein' : '') + '"></i>';
  return '<span class="b-pips" aria-label="' + P.actions + ' actions">' + s + '</span>';
}

/* ---------- Vue principale ---------- */
M.vue = function(){
  UI.lectures = [];
  if(!M.emplacement()) return vueQuiJoue();
  /* les pages du menu ☰ (heros.js), aussi sans héros */
  switch(UI.ecran){
    case 'qui': return vueQuiJoue(true);
    case 'reglages': return vueReglages();
    case 'aide': if(M.ecranAide) return M.ecranAide(); break;
    case 'legendes': if(M.ecranLegendes) return M.ecranLegendes(); break;
  }
  if(!M.S.heros) return UI.ecran === 'creation' ? vueCreation() : vueAccueil();
  switch(UI.ecran){
    case 'creation': return vueCreation();
    case 'heros': return M.ecranHeros ? M.ecranHeros() : vueAccueil();   /* l'écran du héros (heros.js) */
    case 'menu': return M.ecranMenu ? M.ecranMenu() : vueAccueil();
    case 'boutique': return vueBoutique();
    case 'enquete': return vueEnquete();
    default: return vueAccueil();
  }
};
/* L'en-tête des pages : « ← Retour » en haut à gauche (revient là où on était), le titre au centre */
function barreRetour(titre){
  return '<header class="b-barre b-barre-c"><button class="btn second petit b-retour" data-act="retour">← Retour</button><h2>' + titre + '</h2><span></span></header>';
}
M.barreRetour = barreRetour;
/* Le « Mode test » (essayer les enquêtes 2 et 3) n'est plus dans les Réglages des joueurs :
   seulement en ouvrant le fichier sur l'ordinateur (bancs d'essai), ou avec #test dans l'adresse. */
M.modeDev = function(){ return location.protocol === 'file:' || /(^|[?#&])test\b/.test(location.search + location.hash); };

function lanterne(){
  return '<svg class="b-lanterne" viewBox="0 0 80 110" aria-hidden="true"><defs><radialGradient id="b-lg" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#fff6d0"/><stop offset=".6" stop-color="#ffcf66"/><stop offset="1" stop-color="#f5b945" stop-opacity="0"/></radialGradient></defs>' +
    '<circle class="b-halo" cx="40" cy="64" r="40" fill="url(#b-lg)"/>' +
    '<path d="M28 18 Q40 2 52 18" fill="none" stroke="#24182e" stroke-width="6"/><path d="M28 18 Q40 2 52 18" fill="none" stroke="#c99a3a" stroke-width="3"/>' +
    '<rect x="22" y="20" width="36" height="10" rx="4" fill="#c99a3a" stroke="#24182e" stroke-width="3"/>' +
    '<rect x="25" y="30" width="30" height="50" rx="6" fill="#ffe3a3" stroke="#24182e" stroke-width="3"/>' +
    '<path class="b-flamme" d="M40 46 C34 56 36 66 40 70 C44 66 46 56 40 46Z" fill="#e8693c"/>' +
    '<rect x="22" y="80" width="36" height="10" rx="4" fill="#c99a3a" stroke="#24182e" stroke-width="3"/></svg>';
}

function vueQuiJoue(retour){
  var l = M.emplacements(), moi = M.emplacement();
  return '<main class="b-page b-accueil' + (retour ? ' hr-page hr-qui' : '') + '">' + (retour ? barreRetour('Changer de joueur') : titreJeu()) +
    '<section class="b-carte-verre"><h2>Qui joue sur cet écran ?</h2><div class="b-qui">' +
    l.map(function(x){ var h = x.s.heros; return '<button class="b-qui-h' + (retour && String(x.n) === String(moi) ? ' moi' : '') + '" data-act="emplacement" data-n="' + x.n + '">' +
      '<div class="b-qui-portrait">' + portrait('tete', false, false, Object.assign({}, h, {niveau:M.niveau(x.s.xp).n, talents:x.s.talents, equip:x.s.equip, garde:M.lookGarde ? M.lookGarde(x.s) : null})) + '</div>' +
      '<b>' + esc(h.nom) + '</b><span>' + M.nomRole(h.role, h.sexe) + ' · niveau ' + M.niveau(x.s.xp).n + '</span></button>'; }).join('') +
    (l.length < 4 ? '<button class="b-qui-h nouveau" data-act="emplacement-neuf"><div class="b-qui-portrait">✨</div><b>Nouveau héros</b><span>Créer un personnage</span></button>' : '') +
    '</div><p class="doux petit centre">Chaque joueur a son héros. Sur une tablette partagée, chacun choisit le sien.</p></section></main>';
}
function titreJeu(){
  return '<header class="b-titre">' + lanterne() + '<div><p class="sur-titre">Un jeu d\'enquête à quatre écrans</p><h1>Les Enquêteurs de Brumeval</h1></div></header>';
}

/* Voix naturelles : la proposition du village, une seule fois (version installée seulement ; ensuite, c'est dans les Réglages : M.voixHTML) */
M.carteVoix = function(){
  var V = window.Voix, o = M.S.options;
  if(!V || !V.possible || V.pret || o.voixPlusTard) return '';
  var t = 'Une seule fois, en wifi : environ 120 Mo. Ensuite, chaque personnage parle avec sa propre voix, même sans internet.';
  return '<section class="b-carte-verre b-carte-voix"><h3>🗣️ Des voix naturelles pour Brumeval</h3><p class="doux petit">' + esc(t) + ' ' + lire(t) + '</p>' +
    '<div class="b-rangee"><button class="btn" data-act="voix-telecharger"' + (V.enCours ? ' disabled' : '') + '>⬇ Télécharger les voix</button><button class="btn second petit" data-act="voix-plus-tard">Plus tard</button></div>' +
    '<div id="voix-prog" class="b-voix-prog"' + (V.enCours ? '' : ' hidden') + '><progress max="100" value="0"></progress><small></small></div></section>';
};
function vueAccueil(){
  var S = M.S;
  if(!S.heros){
    return '<main class="b-page b-accueil">' + titreJeu() +
      '<section class="b-carte-verre b-intro-jeu"><p class="b-grand-texte">Un mystère plane sur le village de Brumeval. Quatre enquêteurs, quatre écrans, une seule enquête : personne ne la résout seul !</p>' +
      lire('Un mystère plane sur le village de Brumeval. Quatre enquêteurs, quatre écrans, une seule enquête : personne ne la résout seul !') +
      '<div class="b-quatre">' + ['pisteur', 'alchimiste', 'barde', 'sage'].map(function(r, i){
        return '<div class="b-quatre-h" style="--c:' + D.ROLES[r].c + ';animation-delay:' + (i * .15) + 's">' + portrait('buste', true, false, Object.assign(window.Persos ? Persos.defaut(r, i % 2 ? 'm' : 'f') : {role:r}, {role:r, niveau:3, talents:[], equip:[]})) + '<b>' + D.ROLES[r][i % 2 ? 'm' : 'f'] + '</b></div>';
      }).join('') + '</div>' +
      '<button class="btn grand" data-act="creer">✨ Créer mon héros</button></section>' + M.carteVoix(false) +
      (M.emplacements().length >= 1 ? '<footer class="b-pied"><button class="btn second petit" data-act="changer-joueur">👥 Changer de joueur</button></footer>' : '') + '</main>';   /* plus de boutons en bas (Romain, 4 novembre) */
  }
  var niv = M.niveau(S.xp), h = S.heros, E = window.ENQUETES[S.prochaine], att = M.talentsEnAttente();
  var enCours = S.e && !S.e.resolu;
  if(M.debutant() && !enCours && E){   /* avant la toute première enquête : seulement l'enquête 1 (Romain, 4 novembre) */
    return '<main class="b-page b-accueil b-debut b-ecran-fixe">' + titreJeu() + M.carteVoix(false) +
      '<section class="b-hub"><div class="b-hub-heros b-hub-fixe" style="--c:' + D.ROLES[h.role].c + '"><div class="b-hub-portrait">' + portrait('pied', true, true) + '</div>' +
        '<div class="b-hub-info"><b>' + esc(h.nom) + '</b><span>' + M.nomRole(h.role, h.sexe) + '</span></div></div>' +
      '<div class="b-hub-actions"><button class="btn grand b-guide" data-act="nouvelle-enquete">🔍 Enquête ' + E.id + ' : ' + esc(E.titre) + '</button></div></section></main>';
  }
  /* Le village, simplifié au maximum (Romain, 4 novembre, 20 h 41) : le héros, deux boutons dorés (Boutique, Talent),
     le bouton de l'enquête pour tout le monde (plus de code pour y entrer), et le menu ☰ tout en haut. */
  return '<main class="b-page b-accueil b-hub-simple b-ecran-fixe"><button class="b-menu-haut" data-act="menu" aria-label="Menu">☰</button>' + titreJeu() + M.carteVoix(false) +
    '<section class="b-hub">' +
      '<div class="b-hub-heros b-hub-fixe" style="--c:' + D.ROLES[h.role].c + '">' +
        '<div class="b-hub-portrait">' + portrait('pied', true, true) + '</div>' +
        '<div class="b-hub-info"><b>' + esc(h.nom) + '</b><span>' + M.nomRole(h.role, h.sexe) + ' · niveau ' + niv.n + '</span>' +
        '<div class="b-xp"><i style="width:' + niv.pct + '%"></i></div><span class="b-or">🪙 ' + S.or + ' pièces d\'or</span></div>' +
        '<div class="b-hub-dores">' +   /* en bas de l'image du héros */
          '<button class="btn b-dore b-guide" data-act="ecran" data-e="boutique">🛒 Boutique</button>' +
          (att.length ? '<button class="btn b-dore b-guide" data-act="choisir-talent" data-p="' + att[0] + '">⭐ Talent</button>' :
            '<button class="btn b-dore" data-act="ecran" data-e="heros">⭐ Talents</button>') +
        '</div></div>' +
      '<div class="b-hub-actions">' +
        (enCours ? '<button class="btn grand" data-act="reprendre">▶ Reprendre l\'enquête ' + S.e.id + '</button>' :
          (M.enEcriture(E) ? '<p class="b-carte-verre centre">🚧 <b>Enquête ' + E.id + ' : en cours d\'écriture.</b> Elle arrive bientôt ! ' + lire('Enquête ' + E.id + ' : en cours d\'écriture. Elle arrive bientôt !') + '</p>' :   /* pas encore jouable (e3.js) */
          E ? '<button class="btn grand" data-act="nouvelle-enquete">🔍 Enquête ' + E.id + ' : ' + esc(E.titre) + '</button>' :
            '<p class="b-carte-verre">Bravo ! Vous avez fini toutes les enquêtes de cette version. La suite arrive bientôt… ' + lire('Bravo ! Vous avez fini toutes les enquêtes de cette version. La suite arrive bientôt…') + '</p>')) +
      '</div>' +
    '</section></main>';   /* plus de code pour l'enquête suivante, plus de boutons en bas : Mon héros, le Calepin, Comment jouer… sont dans le menu ☰ */
}
/* Entre deux enquêtes, au village : plus de code pour l'enquête suivante (Romain, 4 novembre, 20 h 41) : chacun touche le bouton « Enquête N » */
function villageSuite(N){ return ''; }
/* Le pavé des trois symboles (onglet Code, fin d'enquête, village) : seulement les dessins, le nom dans aria-label */
function touchesSym(){
  return '<div class="b-pave">' + D.ORDRE_SYM.map(function(k){ return '<button data-act="sym" data-s="' + k + '" aria-label="' + D.SYM[k].n + '" title="' + D.SYM[k].n + '"><span aria-hidden="true">' + D.SYM[k].e + '</span></button>'; }).join('') + '</div>';
}
function padHTML(){
  var sel = UI.saisie;
  return '<div class="b-saisie">' + [0, 1, 2].map(function(i){ return '<div class="b-case' + (sel[i] ? ' pleine' : '') + '">' + (sel[i] ? D.SYM[sel[i]].e : '') + '</div>'; }).join('') + '</div>' +
    touchesSym() +
    '<div class="b-rangee centre"><button class="btn second" data-act="sym-efface"' + (sel.length ? '' : ' disabled') + '>⌫ Effacer</button></div>';
}
/* Le pied du village. Le Livre des Légendes, Sauvegarder, Charger et Supprimer sont dans le menu ☰ (heros.js) ;
   sans héros, on peut déjà charger une partie gardée dans un fichier, et ouvrir le Livre des Légendes. */
function piedAccueil(){
  var S = M.S, leg = (S.legendes || []).length;
  return '<footer class="b-pied"><button class="btn second petit" data-act="aide">❓ Comment jouer</button><button class="btn second petit" data-act="ecran" data-e="reglages">⚙️ Réglages</button>' +
    (M.emplacements().length > 1 || (S.heros && M.emplacements().length >= 1) ? '<button class="btn second petit" data-act="changer-joueur">👥 Changer de joueur</button>' : '') +
    (S.heros ? '<button class="btn second petit" data-act="menu">☰ Menu</button>' :
      (M.chargerBouton ? M.chargerBouton('📂 Charger', 'petit') : '') + (leg ? '<button class="btn second petit" data-act="ecran" data-e="legendes">📖 Livre des Légendes</button>' : '')) + '</footer>';
}

/* ---------- Création du héros ---------- */
function vueCreation(){
  var c = UI.crea, et = UI.creaEtape;
  var s = '<main class="b-page b-creation"><header class="b-barre"><button class="btn second petit" data-act="crea-retour">← Retour</button><h2>Créer mon héros</h2><span class="b-etapes">' +
    [1, 2, 3].map(function(i){ return '<i class="' + (i <= et ? 'on' : '') + '"></i>'; }).join('') + '</span></header>';
  if(et === 1){
    var anc = M.S && M.S.ancien && M.S.ancien.heros;
    if(anc) s += '<section class="b-carte-verre centre"><p>' + esc('Tu peux reprendre le même héros qu\'avant : même rôle, même apparence.') + ' ' + lire('Tu peux reprendre le même héros qu\'avant : même rôle, même apparence.') + '</p><button class="btn magie" data-act="crea-meme">🔁 Reprendre la même apparence (' + esc(anc.nom || '') + ')</button></section>';
    s += '<p class="b-consigne">Choisis ton rôle. Chaque joueur prend un rôle différent ! ' + lire('Choisis ton rôle. Chaque joueur prend un rôle différent !') + '</p><div class="b-roles">';
    ['pisteur', 'alchimiste', 'barde', 'sage'].forEach(function(r){
      var R = D.ROLES[r], h = Object.assign(window.Persos ? Persos.defaut(r, c.sexe || 'f') : {role:r}, {niveau:3, talents:[], equip:[]});
      if(c.role === r) h = Object.assign({}, h, c, {role:r, niveau:3});
      s += '<button class="b-role' + (c.role === r ? ' choisi' : '') + '" data-act="crea-role" data-r="' + r + '" style="--c:' + R.c + '">' +
        '<div class="b-role-img">' + portrait('buste', c.role === r, false, h) + '</div>' +
        '<div class="b-role-txt"><b>' + R.ic + ' ' + (c.sexe === 'm' ? R.m : R.f) + '</b><span class="b-tag">' + R.tag + '</span><p>' + esc(R.desc) + '</p></div></button>';
    });
    s += '</div>';   /* toucher un rôle passe directement à l'étape suivante (Romain, 4 novembre) */
  } else if(et === 2){
    var C = window.Persos ? Persos.CHOIX : null;
    var h2 = Object.assign({}, c, {niveau:1, talents:[], equip:[]});
    s += '<div class="b-crea-grille"><div class="b-crea-apercu">' + portrait('pied', true, true, h2) + '<button class="btn second petit" data-act="crea-hasard">🎲 Au hasard</button></div><div class="b-crea-options">';
    if(C){
      /* (Romain, 13 novembre : plus de « Qui va jouer ? » à la création ; un nouveau héros joue comme les 10 ans et plus. Le choix reste dans
         les Réglages, pour une vieille sauvegarde réglée sur « moins de 10 ans ») */
      s += option('Je suis', 'sexe', C.sexe.map(function(x){ return {id:x.id, nom:x.id === 'f' ? 'Une fille' : 'Un garçon'}; }), c.sexe, 'puce');
      s += option('Mon âge', 'age', C.age, c.age, 'puce');
      s += option('Ma peau', 'peau', C.peau, c.peau, 'couleur');
      s += option('Ma coiffure', 'coiffure', C.coiffure[c.sexe] || [], c.coiffure, 'puce');
      s += option('Mes cheveux', 'cheveux', C.cheveux, c.cheveux, 'couleur');
      s += option('Mes yeux', 'yeux', C.yeux, c.yeux, 'couleur');
      s += option('Ma tenue', 'tenue', C.tenue, c.tenue, 'couleur');
      if(c.sexe === 'm' && c.age !== 'enfant' && C.barbe) s += option('Ma barbe', 'barbe', C.barbe, c.barbe, 'puce');
    } else s += '<p>Le module des personnages n\'est pas chargé.</p>';
    s += '</div></div><div class="b-bas"><button class="btn grand" data-act="crea-suite">✔ OK</button></div>';
  } else {
    s += '<div class="b-crea-nom"><div class="b-crea-apercu petit">' + portrait('buste', true, true, Object.assign({}, c, {niveau:1, talents:[], equip:[]})) + '</div>' +
      '<label class="b-etiquette" for="nom">Comment t\'appelles-tu, ' + (c.sexe === 'm' ? D.ROLES[c.role].m : D.ROLES[c.role].f) + ' ?</label>' +
      '<input id="nom" class="b-champ" maxlength="16" autocomplete="off" value="' + esc(c.nom || '') + '" placeholder="Ton prénom">' +
      '<div class="b-suggestions">' + ['Naïm', 'Alicia', 'Siham', 'Romain', 'Lia'].map(function(n){ return '<button class="puce" data-act="crea-nom" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
      '</div><div class="b-bas"><button class="btn grand" data-act="crea-fin">✨ C\'est parti !</button></div>';
  }
  return s + '</main>';
}
/* « Qui va jouer ? » (enfant / adulte) est revenu le 4 novembre : étape 2 de la création, et dans les Réglages. */
function option(titre, cle, liste, val, type){
  return '<div class="b-opt"><span class="b-etiquette">' + titre + '</span><div class="b-opt-l l-' + type + '">' + liste.map(function(x){
    var on = x.id === val;
    if(type === 'couleur') return '<button class="b-pastille' + (on ? ' on' : '') + '" style="--p:' + x.c + '" data-act="crea-opt" data-k="' + cle + '" data-v="' + x.id + '" aria-label="' + esc(x.nom) + '" title="' + esc(x.nom) + '"></button>';
    return '<button class="puce' + (on ? ' on' : '') + '" data-act="crea-opt" data-k="' + cle + '" data-v="' + x.id + '">' + esc(x.nom) + '</button>';
  }).join('') + '</div></div>';
}

/* ---------- Fiche du héros : un seul écran, sans défilement (M.ecranHeros, heros.js) ---------- */

/* ---------- Boutique (on y entre par la bourse 👛 de l'écran du héros) ---------- */
function vueBoutique(){
  var S = M.S, role = M.role(), n = M.niveau(S.xp).n, pal = UI.boutiquePalier;
  var s = '<main class="b-page b-boutique"><header class="b-barre b-barre-c"><button class="btn second petit b-retour" data-act="retour">← Retour</button><h2>La boutique</h2><span class="b-or" style="justify-self:end">👛 ' + S.or + '</span></header>';
  s += '<div class="b-boutique-haut"><div class="b-marchand">' + (window.Persos && Persos.PNJ && Persos.PNJ.fortune ? M.pnjImg('fortune', 'content') : '🧙') + '</div><p class="b-bulle">« Bienvenue, ' + esc(S.heros.nom) + ' ! Voici tout ce qu\'il faut pour ' + (role === 'pisteur' ? 'une pisteuse ou un pisteur' : role === 'alchimiste' ? 'une alchimiste ou un alchimiste' : role === 'barde' ? 'une barde ou un barde' : 'une sage ou un sage') + '. Les plus beaux trésors sont pour les plus grands héros ! » ' + lire('Bienvenue ! Voici tout ce qu\'il faut pour ton rôle. Les plus beaux trésors sont pour les plus grands héros !') + '</p></div>';
  s += '<nav class="b-paliers">' + [1, 2, 3, 4].map(function(p){
    var ouvert = n >= D.PALIER_NIVEAU[p];
    return '<button class="' + (pal === p ? 'on' : '') + (ouvert ? '' : ' ferme') + '" data-act="palier" data-p="' + p + '">' + ['🥉', '🥈', '🥇', '💎'][p - 1] + ' ' + (ouvert ? 'Rang ' + p : 'Niv. ' + D.PALIER_NIVEAU[p]) + '</button>';
  }).join('') + '</nav>';
  var ouvert = n >= D.PALIER_NIVEAU[pal];
  if(!ouvert) s += '<p class="b-carte-verre centre">🔒 Ces objets s\'achètent à partir du niveau ' + D.PALIER_NIVEAU[pal] + '. Tu peux déjà les regarder et économiser ! ' + lire('Ces objets s\'achètent à partir du niveau ' + D.PALIER_NIVEAU[pal] + '. Tu peux déjà les regarder et économiser !') + '</p>';
  s += '<div class="b-objets">';
  M.cle(D.OBJETS).filter(function(id){ return D.OBJETS[id].role === role && D.OBJETS[id].palier === pal && (!D.OBJETS[id].retire || S.equip.indexOf(id) >= 0); }).forEach(function(id){
    var o = D.OBJETS[id], a = S.equip.indexOf(id) >= 0, peut = ouvert && !a && S.or >= o.prix;
    s += '<div class="b-objet' + (a ? ' possede' : '') + '"><div class="b-objet-ic">' + o.ic + '</div><div class="b-objet-txt"><b>' + esc(o.nom) + '</b><p>' + esc(o.d) + ' ' + lire(o.nom + '. ' + o.d) + '</p>' +
      (o.ens ? '<span class="b-ens">' + D.ENSEMBLES[o.ens].ic + ' Ensemble ' + esc(D.ENSEMBLES[o.ens].nom) + ' (' + M.compteEnsemble(o.ens) + '/3)</span>' : '') + '</div>' +
      '<div class="b-objet-prix">' + (a ? '<span class="b-possede">✔ À toi</span><button class="btn second petit" data-act="revendre" data-id="' + id + '">Revendre 🪙 ' + Math.floor(o.prix / 2) + '</button>' : '<button class="btn petit" data-act="acheter" data-id="' + id + '"' + (peut ? '' : ' disabled') + '>🪙 ' + o.prix + '</button>') + '</div></div>';
  });
  s += '</div>';
  var ens = M.cle(D.ENSEMBLES).filter(function(k){ return D.ENSEMBLES[k].role === role; });
  if(ens.length) s += '<h3 class="b-sous-titre">Les ensembles</h3><p class="doux petit">Trois objets d\'un même ensemble débloquent un pouvoir secret.</p><ul class="b-liste">' + ens.map(function(k){
    var e = D.ENSEMBLES[k], c = M.compteEnsemble(k);
    return '<li><span class="b-ic">' + e.ic + '</span><div><b>' + esc(e.nom) + ' · ' + c + '/3</b><p>' + (c >= 3 ? esc(e.bonus) : '??? Complète l\'ensemble pour découvrir son pouvoir.') + '</p></div>' + lire(e.nom + '. ' + (c >= 3 ? e.bonus : 'Complète l\'ensemble pour découvrir son pouvoir.')) + '</li>';
  }).join('') + '</ul>';
  s += '</main>';
  return s;
}

/* ---------- Réglages ---------- */
/* Seulement le son et les voix naturelles. Plus de choix de la voix de l'appareil ni de vitesse : les voix naturelles
   servent toutes seules dès qu'elles sont téléchargées, sinon la meilleure voix de l'appareil. La sauvegarde est dans le menu ☰. */
M.voixHTML = function(){
  var V = window.Voix;
  if(!V || !V.possible) return '';   /* hors de la version installée (GitHub) : rien sur les voix */
  if(V.pret){
    /* Ce que cet appareil fait de ses voix (voix.js, V.mode ; Romain, 13 novembre : « dès qu'on appuie, le son sort ») :
       jamais d'attente, la voix de l'appareil lit dès que la voix naturelle n'est pas prête. « Vitesse » : combien de fois plus vite
       que la parole l'appareil fabrique la voix (au moins ×2 pour être « rapide ») ; c'est le chiffre à demander à Romain pour une tablette. */
    var md = V.mode ? V.mode() : 'rapide', vit = V.vitesse ? V.vitesse() : 0;
    var t = md === 'rapide' ? 'Cet appareil est assez rapide pour ces voix. Si l\'une d\'elles n\'est pas prête à l\'instant, c\'est la voix de l\'appareil qui lit, sans attendre.'
      : md === 'lent' ? 'Cet appareil est trop lent pour ces voix. Pour ne pas te faire attendre, il lit tout de suite avec sa propre voix.'
      : md === 'panne' ? 'Les voix naturelles ne démarrent pas sur cet appareil : il lit avec sa propre voix.'
      : 'Je mesure la vitesse de cet appareil. En attendant, il lit avec sa propre voix.';
    return '<p class="hr-voix-etat">✔ Voix installées</p><p class="doux petit hr-voix-mode" data-mode="' + md + '">' + esc(t) + ' ' + lire(t) + '</p>' +
      (vit ? '<p class="doux petit hr-voix-vit">Vitesse : ×' + String(vit).replace('.', ',') + '</p>' : '') +
      '<div class="b-rangee"><button class="btn second" data-act="test-voix">🔊 Essayer la voix</button>' +
      /* un appareil jugé lent un jour où il était très occupé : on peut refaire la mesure (elle se refait aussi toute seule au bout de 14 jours) */
      (md === 'lent' || md === 'panne' ? '<button class="btn second" data-act="voix-mesurer">🔁 Mesurer encore</button>' : '') + '</div>';
  }
  var a = V.avance || [0, ''];
  return '<button class="btn" data-act="voix-telecharger"' + (V.enCours ? ' disabled' : '') + '>⬇ Télécharger les voix</button>' +
    '<div id="voix-prog" class="b-voix-prog"' + (V.enCours ? '' : ' hidden') + '><progress max="100" value="' + Math.round((a[0] || 0) * 100) + '"></progress><small>' + esc(a[1] || '') + '</small></div>';
};
function vueReglages(){
  var o = M.S.options, V = window.Voix, voix = !!(V && V.possible);
  return '<main class="b-page hr-page b-reglages">' + barreRetour('Réglages') +
    '<section class="b-carte-verre"><h3>' + (voix ? 'Son et voix' : 'Son') + '</h3>' +
    '<label class="b-interr"><input type="checkbox" data-act="opt" data-k="son"' + (o.son !== false ? ' checked' : '') + '> 🔔 Sons</label>' +
    M.voixHTML() + '</section>' +
    (M.S.heros ? '<section class="b-carte-verre"><h3>Qui joue ce héros ?</h3><p class="doux petit">' + esc('Les mini-jeux sont plus faciles pour les moins de 10 ans.') + '</p><div class="b-rangee">' +
      [['enfant', '🧒 Moins de 10 ans'], ['adulte', '🧑 10 ans et plus']].map(function(x){ return '<button class="btn ' + (M.joueur() === x[0] ? '' : 'second ') + 'petit" data-act="joueur" data-v="' + x[0] + '" aria-pressed="' + (M.joueur() === x[0]) + '">' + x[1] + (M.joueur() === x[0] ? ' ✔' : '') + '</button>'; }).join('') + '</div></section>' : '') +
    (M.modeDev() && M.S.heros ? '<section class="b-carte-verre b-mode-test"><h3>Mode test</h3>' +
      '<div class="b-rangee">' + [1, 2, 3].map(function(i){ return '<button class="btn second petit" data-act="mode-test" data-i="' + i + '">Enquête ' + i + '</button>'; }).join('') + '</div></section>' : '') +
    (window.BRUMEVAL_VERSION ? '<p class="doux petit b-version">' + esc('Version du jeu : ' + M.versionTxt() + '. Toutes les tablettes doivent avoir la même, sinon les codes ne marchent pas.') + '</p>' : '') +
    '</main>';
}
/* La version du jeu, lisible : « 4/11 à 18 h 13 » (build.py écrit window.BRUMEVAL_VERSION = « 2026-11-04 18:13 ») */
M.versionTxt = function(){
  var v = String(window.BRUMEVAL_VERSION || ''), m = /^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/.exec(v);
  return m ? (+m[3]) + '/' + (+m[2]) + ' à ' + m[4] + ' h ' + m[5] : v;
};

/* Le bandeau du haut et la barre des onglets, à part (Romain, 5 novembre, 17 h 01 : M.render les redessine seuls quand la carte reste la même) */
M.enteteEnqueteHTML = function(){
  var P = M.P(), E = M.E(), role = M.role(), R = D.ROLES[role], mid = M.momentId(), mo = D.MOMENTS[mid], s = '';
  s += '<header class="b-entete"><button class="b-et-heros" data-act="ecran" data-e="heros" aria-label="Mon héros">' + portrait('tete', false) + '</button>' +
    '<button class="b-et-info" data-act="ecran" data-e="heros"><b>' + esc(M.S.heros.nom) + '</b><span>' + R.ic + ' ' + M.nomRole(role, M.S.heros.sexe) + '</span><span class="b-et-enq">📜 Enquête ' + E.id + '</span></button>' +   /* le nom, le rôle et l'enquête en cours (Romain, 3 novembre) ; ils ouvrent aussi l'écran du héros */
    '<div class="b-et-moment"><span class="b-et-m">' + mo.ic + ' ' + mo.nom + '</span>' + pips() + '</div>' +
    (role === 'sage' && !M.livreHTML ? '<button class="b-et-btn" data-act="moment-suivant" aria-label="Moment suivant">⏭️</button><button class="b-et-btn" data-act="accuser" aria-label="Accuser">⚖️</button>' : '') +   /* Sage : les codes des moments et l'accusation sont des pages du Grand Livre (livre.js) */
    '<button class="b-et-btn" data-act="menu-enquete" aria-label="Menu">☰</button>' + (M.bandeauTuto ? M.bandeauTuto() : '') + '</header>';   /* le tutoriel (tuto.js) : une phrase courte avec 🔊, sous le bandeau */
  return s;
};
M.ongletsEnqueteHTML = function(){
  var P = M.P(), R = D.ROLES[M.role()];
  return '<nav class="b-onglets">' + ong('role', R.onglet.ic, R.onglet.nom) + ong('carnet', '📒' + (M.badgeMission ? M.badgeMission() : ''), 'Carnet', P.carnet.length) + ong('carte', '🗺️' + badgeCarte(), 'Carte') + ong('code', '🔢', 'Code') + '</nav>';
};
/* ---------- Enquête ---------- */
function vueEnquete(){
  var P = M.P(), E = M.E();
  if(!P || !E) return vueAccueil();
  if(P.defaite) return vueDefaite();
  if(P.etape === 'lettre') return vueLettre();
  if(P.etape === 'missions' && E.missionsMaire) return vueMissionsMaire();   /* l'écran des missions du maire (enquête 3) */
  if(P.etape === 'fin') return vueFin();
  var role = M.role(), R = D.ROLES[role], mid = M.momentId(), mo = D.MOMENTS[mid];
  var s = '<div class="b-jeu moment-' + mid + '" style="--c:' + R.c + '">';
  s += M.enteteEnqueteHTML();
  var plein = P.onglet === 'role' && ((M.atelierPlein && M.atelierPlein()) || (M.liegePlein && M.liegePlein()) || (M.livrePlein && M.livrePlein()) || (M.cabanePlein && M.cabanePlein()));   /* … et la cabane du Pisteur (cabane.js) */   /* l'atelier de l'Alchimiste, le liège du Barde, le Grand Livre du Sage : plein écran, sans marges */
  if(P.onglet === 'carte' && window.Carte && Carte.monter) plein = true;   /* la carte aussi : plein écran, sans cadre */
  s += '<main class="b-contenu' + (plein ? ' b-plein' : '') + (plein && P.onglet === 'carte' ? ' b-contenu-carte' : '') + '">' + (P.onglet === 'carte' ? ongletCarte() : P.onglet === 'role' ? ongletRole() : P.onglet === 'carnet' ? ongletCarnet() : ongletCode()) + '</main>';
  s += M.ongletsEnqueteHTML() + '</div>';
  return s;
}
function ong(id, ic, nom, n){
  var P = M.P();
  return '<button class="' + (P.onglet === id ? 'on' : '') + '" data-act="onglet" data-o="' + id + '"><span>' + ic + '</span><b>' + nom + '</b>' + (n ? '<i>' + n + '</i>' : '') + '</button>';
}

function vueLettre(){
  var E = M.E(), role = M.role(), R = D.ROLES[role];
  if(E.id === 1){   /* le tutoriel : seulement la lettre du maire, puis on commence (Romain, 4 novembre) */
    return '<main class="b-page b-lettre-page b-ecran-fixe"><p class="sur-titre centre">Enquête ' + E.id + '</p><h1 class="centre">' + esc(E.titre) + '</h1>' +
      '<article class="parchemin b-lettre"><div class="b-lettre-maire">' + M.pnjImg('grosbec', 'content') + '</div><p class="b-lettre-date">Brumeval, ' + D.MOMENTS[E.moments[0]].nom.toLowerCase() + '</p>' +
      '<p>' + esc(E.lettre) + '</p><p class="b-signature">' + esc(E.signature || 'Monsieur Grosbec, maire de Brumeval') + '</p>' + lire(E.lettre, 'grosbec') + '</article>' +
      '<div class="b-bas"><button class="btn grand b-guide" data-act="commencer">🔍 Commencer l\'enquête</button></div></main>';
  }
  /* Enquête 3 (E.lettreLue, Bible § 13.6) : ce n'est pas une lettre du maire, mais la lettre « d'Odette » qu'il lit sur la place, à l'aube ;
     dessous, ce qu'il annonce ; puis l'écran des missions du maire (vueMissionsMaire). Même mise en page que la lettre et son affiche. */
  if(E.lettreLue){
    var L = E.lettreLue;
    return '<main class="b-page b-lettre-page b-ecran-fixe b-avec-affiche b-lettre-lue"><p class="sur-titre centre">Enquête ' + E.id + '</p><h1 class="centre">' + esc(E.titre) + '</h1>' +
      '<article class="parchemin b-lettre"><div class="b-lettre-maire">' + M.pnjImg('grosbec', 'content') + '</div><p class="b-lettre-date">' + esc(L.titre) + '</p>' +
      '<p>« ' + esc(E.lettre) + ' »</p>' + lire(E.lettre, 'grosbec') + '</article>' +
      '<article class="parchemin b-lettre b-affiche"><p class="sur-titre centre">📣 Le maire</p><p class="centre"><b>« ' + esc(L.apres) + ' »</b></p>' + lire(L.apres, 'grosbec') + '</article>' +
      '<div class="b-bas"><button class="btn grand b-aller b-guide" data-act="' + (E.missionsMaire ? 'lettre-suite' : 'commencer') + '">➡️ La suite</button></div></main>';
  }
  /* b-ecran-fixe : tout tient dans l'écran, sans défiler (Romain, 5 novembre, 21 h 46 ; moteur-actions.js, M.ecranFixe) */
  return '<main class="b-page b-lettre-page b-ecran-fixe' + (E.affiche ? ' b-avec-affiche' : '') + '"><p class="sur-titre centre">Enquête ' + E.id + '</p><h1 class="centre">' + esc(E.titre) + '</h1>' +
    '<article class="parchemin b-lettre"><div class="b-lettre-maire">' + M.pnjImg('grosbec', 'content') + '</div><p class="b-lettre-date">Brumeval, ' + D.MOMENTS[E.moments[0]].nom.toLowerCase() + '</p>' +
    '<p>' + esc(E.lettre) + '</p><p class="b-signature">' + esc(E.signature || 'Monsieur Grosbec, maire de Brumeval') + '</p>' + lire(E.lettre, 'grosbec') + '</article>' +
    (E.affiche ? '<article class="parchemin b-lettre b-affiche"><p class="sur-titre centre">📜 ' + esc(E.affiche.titre || 'Affiche') + '</p><p class="centre"><b>' + esc(E.affiche.t) + '</b></p>' + lire((E.affiche.titre ? E.affiche.titre + ' : ' : '') + E.affiche.t, 'grosbec') + '</article>' : '') +   /* l'affiche du maire (enquête 2) */
    /* Simplifié pour toutes les enquêtes (Romain, 4 novembre, 20 h 49) : la lettre, l'affiche, et « Commencer l'enquête ».
       Plus de mission, de règles ni de code ici : la mission est en haut du Carnet. */
    '<div class="b-bas"><button class="btn grand b-guide" data-act="commencer">🔍 Commencer l\'enquête</button></div></main>';
}
/* L'écran des missions du maire (enquête 3, Bible § 13.6) : juste après la lettre, pour tous. Une ligne par rôle (la sienne en couleur),
   chacune avec son 🔊, et le bouton jaune. Plein écran fixe, comme la lettre. */
function vueMissionsMaire(){
  var E = M.E(), X = E.missionsMaire, moi = M.role(), h = (M.S && M.S.heros) || {};
  var s = '<main class="b-page b-ecran-fixe b-missions-maire"><p class="sur-titre centre">Enquête ' + E.id + '</p><h1 class="centre">' + esc(X.titre) + '</h1>' +
    '<div class="b-mm-maire"><div class="b-mm-img">' + M.pnjImg('grosbec', 'content') + '</div><p>« ' + esc(X.sous) + ' » ' + lire(X.sous, 'grosbec') + '</p></div><div class="b-mm-liste">';
  ['barde', 'pisteur', 'alchimiste', 'sage'].forEach(function(r){
    var R = D.ROLES[r], n = r === moi ? M.nomRole(r, h.sexe) : R.m;
    s += '<div class="b-mm-ligne' + (r === moi ? ' moi' : '') + '" style="--c:' + R.c + '"><span class="b-mm-ic">' + R.ic + '</span><div><b>' + esc(n) + (r === moi ? ' <small>(c\'est toi)</small>' : '') + '</b><p>' + esc(X[r]) + '</p></div>' + lire(n + ' : ' + X[r], 'grosbec') + '</div>';
  });
  return s + '</div><div class="b-bas"><button class="btn grand b-aller b-guide" data-act="commencer">🔍 ' + esc(X.bouton || 'Commencer l\'enquête') + '</button></div></main>';
}
function vueLettreAncienne(E, role, R){   /* l'ancienne lettre complète (gardée pour mémoire, plus affichée) */
  return '<section class="b-carte-verre b-mission" style="--c:' + R.c + '"><h3>' + R.ic + ' Ta mission</h3><p>' + esc(E.missions[role]) + '</p>' + lire(E.missions[role]) + (M.lettreMission ? M.lettreMission() : '') +
    '<ul class="b-regles"><li><span>☀️</span> L\'enquête dure ' + E.moments.length + ' moments : ' + E.moments.map(function(m){ return D.MOMENTS[m].nom.toLowerCase(); }).join(', ') + '.</li>' +
    (M.sansActions() ? '' : '<li><span>' + (M.actionsMax() > 2 ? '●●●' : '●●') + '</span> À chaque moment, tu as ' + M.actionsMax() + ' actions : choisis bien !</li>') +
    '<li><span>❤️</span> Le Sage a 2 cœurs : il peut se tromper 2 fois. À la 3e erreur, l\'enquête est perdue.</li>' +
    '<li><span>🔢</span> Les codes à 3 symboles passent d\'un écran à l\'autre : dis-les à voix haute.</li>' +
    (role === 'sage' ? '<li><span>⏭️</span> C\'est toi qui donnes le code du moment suivant, quand toute l\'équipe est prête (dans ton Grand Livre 📖).</li><li><span>⚖️</span> C\'est toi qui accuses à la fin, après en avoir parlé avec l\'équipe (la dernière page du Grand Livre).</li>' :
      '<li><span>⏭️</span> Pour passer au moment suivant, tape le code que le Sage te donne.</li>') + '</ul></section>' +
    (E.id === 1 ? (function(){ var t = 'Attention : si le Sage se trompe trois fois, toute l\'équipe perd ses héros et recommence au tout début.'; return '<section class="b-carte-verre b-alerte-defaite"><p>⚠️ ' + esc(t) + ' ' + lire(t) + '</p></section>'; })() : '') +
    lettreSuite(E) +
    '<div class="b-bas"><button class="btn grand" data-act="commencer">🔍 Commencer l\'enquête</button></div></main>';
}
/* Sur la lettre : un talent gagné à l'enquête d'avant (plus de code pour un équipier en retard : chacun touche le bouton « Enquête N ») */
function lettreSuite(E){
  var s = '', att = M.talentsEnAttente();
  if(att.length){ var t = 'Tu as gagné un niveau : choisis ton nouveau talent !'; s += '<section class="b-carte-verre centre"><p>⭐ ' + esc(t) + ' ' + lire(t) + '</p><button class="btn magie" data-act="choisir-talent" data-p="' + att[0] + '">⭐ Choisir mon talent du niveau ' + att[0] + '</button></section>'; }
  return s;
}

/* --- Onglet carte : seulement la carte, en grand, entre le bandeau et les onglets (sans cadre, sans liste).
   Tout est dans carte-jeu.js (M.ongletCarteHTML ; M.monterCarte, appelé par M.render) et carte.js (le dessin, la vue qui glisse). --- */
function ongletCarte(){ return M.ongletCarteHTML ? M.ongletCarteHTML() : '<p class="doux">La carte n\'est pas disponible.</p>'; }
function badgeCarte(){ try{ return M.badgeCarte ? M.badgeCarte() : ''; }catch(e){ return ''; } }   /* ✨ un lieu (ou un passage) tout neuf sur la carte */

/* --- Onglet du rôle --- */
function ongletRole(){
  var role = M.role();
  if(role === 'pisteur') return M.ongletPisteur();
  if(role === 'alchimiste') return M.ongletAlchimiste();
  if(role === 'barde') return M.ongletBarde();
  return M.ongletSage();
}

/* --- Carnet --- */
function ongletCarnet(){
  var P = M.P(), E = M.E(), S = M.S;
  var s = '<section class="b-carnet"><h2>📒 Mon carnet</h2>';
  /* (Romain, 5 novembre, 14 h 26) pour tout le monde : 🎯 les missions, puis 🔢 les codes donnés (et 👥 les habitants pour le Barde), carnet.js.
     Plus d'onglets des enquêtes passées, de lettre ni de calepin ici : la lettre du maire et les archives sont des pages du Grand Livre du Sage. */
  if(M.sectionMissions) s += M.sectionMissions(); /* 🎯 Mes missions (mission.js) */
  if(M.carnetCorps) return s + M.carnetCorps() + '</section>';
  var lettre = '<button class="btn second" data-act="relire-lettre">✉️ La lettre du maire</button>';
  s += '<div class="b-rangee centre">' + lettre + '</div>';
  if(P.revisions && P.revisions.length){
    s += '<div class="b-relire"><h3>🔁 À relire</h3><p class="doux petit">Tu peux relire, réfléchir et changer d\'avis… mais personne ne te donnera la réponse.</p>' +
      P.revisions.map(function(r, i){ return '<button class="b-relire-l" data-act="revoir" data-i="' + i + '"><span>' + (r.ic || '🔁') + '</span><b>' + esc(r.titre || 'À relire') + '</b><small>' + esc(r.bilan || '') + '</small></button>'; }).reverse().join('') + '</div>';
  }
  if(!P.carnet.length) s += '<p class="doux">Rien pour l\'instant. Tout ce que tu découvres s\'écrit ici. ' + lire('Rien pour l\'instant. Tout ce que tu découvres s\'écrit ici.') + '</p>';
  s += '<ul class="b-notes">' + P.carnet.slice().reverse().map(function(n){
    return '<li><span class="b-ic">' + n.ic + '</span><p>' + esc(n.t) + '</p>' + lire(n.t) + '</li>';
  }).join('') + '</ul>';
  var objs = M.cle(P.recus).filter(function(k){ return P.recus[k]; });
  if(objs.length) s += '<h3>Ce que l\'équipe m\'a donné</h3><div class="b-recus">' + objs.map(function(k){ var n = M.nomCode(k); return '<span class="b-puce-ingr">' + n.ic + ' ' + esc(n.nom) + '</span>'; }).join('') + '</div>';
  s += '<h3>Les suspects</h3><div class="b-suspects">' + E.qui.choix.map(function(id){
    var x = D.PNJ[id], r = P.raye.indexOf(id) >= 0;
    return '<button class="b-suspect' + (r ? ' raye' : '') + '" data-act="rayer" data-id="' + id + '"><div class="b-suspect-img">' + M.pnjImg(id) + '</div><b>' + esc(x.court) + '</b><small>' + esc(x.metier) + '</small></button>';
  }).join('') + '</div><p class="doux petit">Touche un suspect pour le rayer quand tu es sûr qu\'il est innocent.</p>';
  if(S.calepin.length) s += '<button class="btn second" data-act="calepin">📔 Ouvrir le calepin des enquêtes passées</button>';
  return s + '</section>';
}

/* Carnet d'une enquête passée (sans les codes du Sage, qui ne servent plus) */
function journalPasse(J){
  var c = J.carnet || [];
  var s = '<p class="sur-titre">' + esc(J.titre || '') + '</p>';
  if(M.tableauJournal) s += M.tableauJournal(J); /* le tableau d'enquête du Sage (tableau.js) */
  if(M.liegeJournal) s += M.liegeJournal(J);     /* le tableau de liège du Barde (liege.js) */
  if(!c.length) s += '<p class="doux">Rien n\'a été noté dans cette enquête. ' + lire('Rien n\'a été noté dans cette enquête.') + '</p>';
  s += '<ul class="b-notes">' + c.slice().reverse().map(function(n){ return '<li><span class="b-ic">' + (n.ic || '📝') + '</span><p>' + esc(n.t) + '</p>' + lire(n.t) + '</li>'; }).join('') + '</ul>';
  if(J.recus && J.recus.length) s += '<h3>Ce que l\'équipe m\'a donné</h3><div class="b-recus">' + J.recus.map(function(n){ return '<span class="b-puce-ingr">' + n.ic + ' ' + esc(n.nom) + '</span>'; }).join('') + '</div>';
  return s;
}

/* --- Code --- */
function ongletCode(){
  var sel = UI.saisie;
  var s = '<section class="b-code-page"><h2>🔢 Entrer un code</h2>' +   /* Romain : seulement le titre et le pavé */
    '<div class="b-saisie">' + [0, 1, 2].map(function(i){ return '<div class="b-case' + (sel[i] ? ' pleine' : '') + '">' + (sel[i] ? D.SYM[sel[i]].e : '') + '</div>'; }).join('') + '</div>' +
    touchesSym() +
    '<div class="b-rangee centre"><button class="btn second" data-act="sym-efface"' + (sel.length ? '' : ' disabled') + '>⌫ Effacer</button></div>';
  return s + '</section>';
}

/* ---------- Fin d'enquête ---------- */
function vueFin(){
  var P = M.P(), E = M.E(), F = P.fin, slides = E.fin.slides;
  if(!F) return '';
  if(F.etape === 'histoire'){
    var i = Math.min(F.slide, slides.length - 1), t = slides[i], img = '';
    if(typeof t === 'function'){ try{ t = t(P); }catch(e){ console.error(e); t = ''; } }   /* (enquête 3) un texte qui dépend de la partie (la variante de la scène finale) */
    if(t && typeof t === 'object'){ img = t.img === 'prison' ? prisonHTML(t) : ''; t = t.t || ''; }   /* une image dans l'histoire : {t, img:'prison'} */
    /* une petite scène animée sous le texte (E.fin.illus[i] : illus-fin.js ; Romain, 5 novembre, 9 h 37) */
    var anim = !img && E.fin.illus && E.fin.illus[i] && M.illustration ? M.illustration(E.fin.illus[i]) : '';
    var codeFin = M.role() === 'sage' ? '<details class="b-code-fin"><summary>🔢 Le code de fin pour l\'équipe</summary>' + M.codeHTML(M.code(M.idVictoire(F.erreurs, F.variante || 0))) + '</details>' : '';
    return '<main class="b-page b-fin"><p class="sur-titre centre">Enquête ' + E.id + ' · ' + esc(E.titre) + '</p>' + codeFin +
      (F.slide === 0 && F.erreurs >= 3 ? '<p class="b-carte-verre centre">La solution vous a été révélée. Ce n\'est pas grave : on apprend en enquêtant !</p>' : '') +
      '<article class="parchemin b-fin-slide" data-n="' + i + '">' + img + '<p>' + t + '</p>' + lire(t) + anim + '</article>' +
      '<div class="b-points">' + slides.map(function(x, j){ return '<i class="' + (j <= i ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      padPendantHistoire(E) +
      '<div class="b-bas"><button class="btn grand" data-act="fin-suite">' + (i < slides.length - 1 ? 'Suite →' : 'Mes récompenses ✨') + '</button></div></main>';
  }
  var niv = M.niveau(M.S.xp);
  /* « Enquête résolue » simplifié comme le village, pour tous les rôles (Romain, 4 novembre, 21 h 44) : le héros, son niveau,
     ses pièces d'or, les deux boutons dorés (Boutique, Talent), le bouton de l'enquête suivante, le menu ☰ en haut.
     Le calepin de fin reste dans le menu ☰ (Calepin). */
  var h = M.S.heros, att = M.talentsEnAttente(), N = window.ENQUETES[E.id + 1];
  /* (Romain, 13 novembre) plus de bouton Boutique ici : à sa place, le bouton Talents, pour les quatre rôles, au-dessus de l'enquête suivante,
     et c'est LUI qui brille (plus l'enquête suivante) tant qu'on ne l'a pas touché (F.talentsVus). Le Barde y choisit son talent ;
     les trois autres rôles voient leur page des talents (pour l'instant, sans talent à choisir : heros.js, message 🌱). */
  var guideT = !F.talentsVus;
  var talent = '<button class="btn b-dore' + (guideT ? ' b-guide' : '') + '" data-act="fin-talents"' + (att.length ? ' data-p="' + att[0] + '"' : '') + '>⭐ Talent' + (att.length ? '' : 's') + '</button>';
  /* (Romain, 13 novembre) à la fin du tutoriel (l'enquête 1), un petit mot en gros sur le héros : l'entraînement est fini, plus d'aide ensuite */
  var tFin = 'Dans l\'enquête ' + (N ? N.id : E.id + 1) + ', plus personne ne vous guide : à vous de jouer !';
  var motTuto = E.tuto && !F.motTutoVu && N ? '<div class="b-fin-tuto" role="dialog" aria-label="Entraînement terminé"><b class="b-fin-tuto-t">🎓 Entraînement terminé !</b>' +
    '<p>' + esc(tFin) + ' ' + lire('Entraînement terminé ! ' + tFin) + '</p><button class="btn" data-act="fin-mot-tuto">OK</button></div>' : '';
  return '<main class="b-page b-fin b-hub-simple b-ecran-fixe"><button class="b-menu-haut" data-act="menu" aria-label="Menu">☰</button><h1 class="centre">Enquête résolue !</h1>' +
    '<section class="b-hub"><div class="b-hub-heros b-hub-fixe" style="--c:' + D.ROLES[h.role].c + '"><div class="b-hub-portrait">' + portrait('pied', true, true) + motTuto + '</div>' +
      '<div class="b-hub-info"><b>' + esc(h.nom) + '</b><span>' + M.nomRole(h.role, h.sexe) + ' · niveau ' + niv.n + (F.monte ? ' 🎉' : '') + '</span>' +
      '<div class="b-xp"><i style="width:' + niv.pct + '%"></i></div><span class="b-or">🪙 ' + M.S.or + ' pièces d\'or (+' + F.or + ')</span></div>' +
      '<div class="b-hub-dores">' + talent + '</div></div>' +
    '<div class="b-hub-actions">' + blocSuite(E, F, !guideT) + (N && !M.enEcriture(N) ? '' : '<button class="btn grand" data-act="fin-retour">🏘️ Retour au village</button>') + '</div></section></main>';
}
function vueFinAncienne(E, F, niv){   /* l'ancien écran des récompenses (gardé pour mémoire, plus affiché) */
  return '<main class="b-page b-fin"><h1 class="centre">Enquête résolue !</h1>' +
    '<div class="b-recompenses"><div class="b-fin-portrait">' + portrait('pied', true, true) + '</div><div>' +
    '<p class="b-gain">⭐ +' + F.xp + ' points d\'expérience</p><p class="b-gain">🪙 +' + F.or + ' pièces d\'or</p>' +
    (F.monte ? '<p class="b-niveau-monte">🎉 Niveau ' + niv.n + ' !</p>' : '') +
    '<div class="b-xp grand"><i style="width:' + niv.pct + '%"></i></div><p class="doux petit">Niveau ' + niv.n + ' · ' + niv.titre + '</p>' +
    (M.talentsEnAttente().length ? '<button class="btn magie" data-act="choisir-talent" data-p="' + M.talentsEnAttente()[0] + '">⭐ Choisir un nouveau talent</button>' : '') +
    '</div></div>' +
    '<section class="b-carte-verre"><h3>📔 Dans le calepin</h3><p class="doux petit">Ces indices ne servent à rien pour l\'instant… ou peut-être que si, plus tard !</p><ul class="b-notes">' +
    E.fin.calepin.map(function(c){ return '<li><span class="b-ic">' + c.ic + '</span><p>' + esc(c.t) + '</p>' + lire(c.t) + '</li>'; }).join('') + '</ul></section>' +
    blocSuite(E, F) +
    '<div class="b-bas"><button class="btn second" data-act="ecran" data-e="boutique">🛒 Boutique</button><button class="btn ' + (window.ENQUETES[E.id + 1] ? 'second' : 'grand') + '" data-act="fin-retour">🏘️ Retour au village</button></div></main>';
}
/* Fin de l'enquête 3 : le héros de cette tablette au cachot de la mairie, derrière les barreaux,
   avec les trois autres enquêteurs en ombres (on ne connaît pas l'allure des héros des autres tablettes) */
function prisonHTML(o){
  var moi = M.role(), autres = ['pisteur', 'alchimiste', 'barde', 'sage'].filter(function(r){ return r !== moi; });
  var ombre = function(r, i){
    var h = window.Persos && Persos.defaut ? Persos.defaut(r, i % 2 ? 'm' : 'f') : {role:r};
    return '<div class="b-prison-ombre o' + i + '">' + portrait('pied', false, false, Object.assign(h, {role:r, niveau:3, talents:[], equip:[]})) + '</div>';
  };
  return '<div class="b-prison" role="img" aria-label="Les quatre enquêteurs au cachot, derrière les barreaux">' +
    '<i class="b-prison-fenetre"></i><i class="b-prison-rayon"></i><i class="b-prison-sol"></i>' +
    autres.map(ombre).join('') +
    '<div class="b-prison-moi">' + portrait('pied', true, false) + '</div>' +
    '<i class="b-prison-barreaux"></i>' +
    /* (enquête 3, o.plume) une plume noire descend en se balançant, et se pose devant la grille */
    (o && o.plume ? '<b class="b-prison-plume" aria-hidden="true"><svg viewBox="-12 -30 24 60" focusable="false"><path d="M0 28 C -1 10 -2 -8 1 -27" stroke="#0c0a12" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M1 -27 C -9 -18 -11 -2 -7 12 C -5 16 -2 18 0 20 C 2 18 6 15 8 10 C 11 -3 9 -19 1 -27 Z" fill="#15121c" stroke="#05040a" stroke-width="1"/><path d="M0 16 C -2 2 -2 -12 1 -24 M-5 6 L 0 2 M-6 -4 L 0 -8 M6 4 L 0 -1 M6 -8 L 1 -13" stroke="#3a3550" stroke-width=".9" fill="none"/></svg></b>' : '') + '</div>';
}
/* ---------- Défaite ---------- */
function vueDefaite(){
  var P = M.P(), E = M.E(), F = P.defaite, S = M.S, h = S.heros;
  var slides = (Array.isArray(E.defaite) && E.defaite.length ? E.defaite.slice() :
    [F.abandon ? 'Les enquêteurs ont abandonné l\'enquête. Le coupable s\'enfuit dans la nuit, et personne ne saura jamais la vérité…' :
      'Le Sage s\'est trompé trop de fois. Le vrai coupable en profite : il s\'enfuit dans la nuit, et la brume efface ses traces…'])
  ;
  if(!slides.some(function(x){ return /brume entre dans le village/i.test(x); })) slides.push('La brume entre dans le village et efface vos souvenirs… D\'autres enquêteurs viendront.');
  var i = Math.min(F.slide, slides.length);
  var codeD = M.role() === 'sage' ? '<section class="b-carte-verre centre"><h3>🌫️ Le code de la défaite</h3><p>' + esc('Dis ce code à l\'équipe : chacun le tape dans son onglet Code.') + ' ' + lire('Dis ce code à l\'équipe : chacun le tape dans son onglet Code.') + '</p>' + codeHTML(M.code('defaite:0'), true) + '</section>' : '';
  var s = '<main class="b-page b-fin b-defaite-page"><p class="sur-titre centre">Enquête ' + E.id + ' · ' + esc(E.titre) + '</p><h1 class="centre">🌫️ L\'enquête est perdue</h1>' + codeD;
  if(i < slides.length){
    var t = slides[i];
    return s + '<article class="parchemin b-fin-slide" data-n="' + i + '"><p>' + esc(t) + '</p>' + lire(t) + '</article>' +
      '<div class="b-points">' + slides.map(function(x, j){ return '<i class="' + (j <= i ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="b-bas"><button class="btn grand" data-act="defaite-suite">Suite →</button></div></main>';
  }
  var t2 = h.nom + ' entre dans le Livre des Légendes. Toute l\'équipe recommence à la création des héros, puis à l\'enquête 1. Tu peux reprendre la même apparence' + (S.atelier ? ', mais l\'atelier repart à neuf' : '') + '.';
  return s + '<div class="b-recompenses"><div class="b-fin-portrait">' + portrait('pied', false, true) + '</div><div>' +
    '<p class="b-gain">📖 ' + esc(h.nom) + ' · ' + M.nomRole(h.role, h.sexe) + ' · niveau ' + M.niveau(S.xp).n + '</p>' +
    '<p>' + esc(t2) + ' ' + lire(t2) + '</p></div></div>' +
    '<div class="b-bas"><button class="btn grand" data-act="defaite-fin">✨ Recommencer à la création des héros</button></div></main>';
}

/* Passer à l'enquête suivante : le Sage montre le code, les autres le tapent ici */
function blocSuite(E, F, guide){
  var N = window.ENQUETES[E.id + 1];
  if(guide === undefined) guide = true;
  if(!N) return '';
  if(M.enEcriture(N)){ var te = 'L\'enquête ' + N.id + ' est en cours d\'écriture : elle arrive bientôt ! Votre or et votre expérience sont bien gardés.'; return '<section class="b-carte-verre b-suite centre"><h3>🚧 Enquête ' + N.id + ' : en cours d\'écriture</h3><p>' + esc(te) + ' ' + lire(te) + '</p></section>'; }
  /* Plus de code pour partir à l'enquête suivante (Romain, 4 novembre, 20 h 41) : chacun touche le bouton, sur sa tablette.
     (Le code « suite » existe toujours dans la liste des codes : tapé par habitude, il marche encore.) */
  return '<button class="btn grand' + (guide ? ' b-guide' : '') + '" data-act="suite-sage">🔍 Enquête ' + N.id + ' : ' + esc(N.titre) + '</button>';
}
/* Pendant l'histoire de fin : si le Sage donne déjà le code de l'enquête suivante, on peut le taper sans attendre */
function padPendantHistoire(E){
  var N = window.ENQUETES[E.id + 1];
  if(!N || M.enEcriture(N) || M.role() === 'sage') return '';
  return '';   /* plus de code pour l'enquête suivante (Romain, 4 novembre, 20 h 41) : le bouton est à la fin de l'histoire */
  if(!UI.padSuite) return '<div class="centre"><button class="btn second petit" data-act="pad-suite">🔢 Le Sage a déjà donné le code de l\'enquête ' + N.id + ' ?</button></div>';
  var t = 'Tape le code de l\'enquête ' + N.id + ' que le Sage te donne. Ne t\'inquiète pas : ton or et ton expérience sont déjà gagnés !';
  return '<section class="b-carte-verre b-suite centre"><h3>➡️ Code de l\'enquête ' + N.id + '</h3><p>' + esc(t) + ' ' + lire(t) + '</p>' + padHTML() +
    '<button class="btn second petit" data-act="pad-suite">✖ Fermer</button></section>';
}
})();
