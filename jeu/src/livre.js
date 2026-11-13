/* ==========================================================
   Brumeval — le Grand Livre du Sage : un vrai livre dont on tourne les pages
   (livre.js + livre.css). L'onglet du Sage, en plein écran entre le bandeau
   du haut et les onglets du bas, comme l'atelier de l'Alchimiste.

   · Pas d'onglets en haut : on tourne les pages. Glisser de droite à gauche =
     page suivante, de gauche à droite = page précédente : la page se soulève
     et tourne autour de la reliure (à gauche), comme du papier. On peut aussi
     toucher les coins cornés ‹ › en bas, ou « 2 / 7 » au milieu (le sommaire),
     ou les flèches du clavier.
   · Tant que ce héros n'a jamais tourné une page (M.S.options.livreTourne), le
     coin de la page se soulève tout seul pour montrer qu'on peut la tourner.
   · Les pages, dans l'ordre : 📋 Mon tableau d'enquête (tableau.js),
     👥 Les habitants, 🧪 Les recettes, ❔ la page blanche (enquête 1),
     🏛️ Les fondateurs (cachée pour l'instant : FONDATEURS_VISIBLE, plus bas),
     les autres pages de l'enquête (E.pages, dans l'ordre de l'histoire),
     📐 La bibliothèque des plans et 🔮 Les objets magiques (dans toutes les enquêtes, toujours ouvertes),
     ⏭️ Les codes des moments, 💡 Donner une action (la réserve du Sage, qui
     était dans son Carnet), ⚖️ L'accusation. Les boutons ⏭️ et ⚖️ du bandeau
     vivent ici maintenant.
   · Seules la page ouverte et ses voisines sont dessinées (tablettes modestes).
     Tourner une page ne redessine pas l'écran ; toucher le tableau d'enquête
     non plus (tableau.js met la case à jour sur place). M.render n'est appelé
     que quand l'état change (une page s'ouvre, un code…) : le livre se remet
     alors à la même page, au même endroit.
   · M.render est enveloppé ici : (1) démonter / monter le livre ; (2) quand on
     redessine le même écran (même onglet), les animations d'entrée (fondu de
     .b-contenu, notes qui glissent) ne rejouent pas : plus de clignotement
     quand on coche une mission, ouvre un habitant du Carnet ou ferme une fenêtre.
   Chargé APRÈS moteur-actions.js et tableau.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.UI) return;
var UI = M.UI;
function esc(s){ return M.esc(s); }
function lire(t, qui){ return M.lireBtn(t, qui); }
var uid = 0;
var ANG = 96;          /* au-delà de 90°, la page tournée est sortie de l'écran (à gauche de la reliure) */
var DUREE = 480;
function calme(){ try{ return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }

/* ---------- Les pages, dans l'ordre du livre ---------- */
var RANG = {tableau:0, lettre:0.5, habitants:1, recettes:2, mystere:3, fondateurs:4, carte:5, moulin:5,
  /* enquête 2 */ lettres:10, livreor:11, blanche:12, secret:14, plans:15, nuancier:16,
  /* enquête 3 */ plan:10, rapport:11, grille:12, carnet:13, serrure:14,
  /* toutes les enquêtes */ bibliotheque:80, objets:81, archives:82,
  codes:90, actions:91, accusation:99};
/* 🏛️ Les fondateurs : cachée pour l'instant (Romain, 4 novembre, 21 h 12 : on la découvrira plus tard, dans les sous-sols).
   Son contenu reste plus bas (HISTOIRE, fondateurs()) : true pour la remettre dans le livre de toutes les enquêtes. */
var FONDATEURS_VISIBLE = false;
function pagesDuLivre(){
  var E = M.E(), l = [];
  if(M.pageTableau) l.push(M.pageTableau());
  /* ✉️ la lettre du maire et 🗄️ les archives des enquêtes passées : des pages du livre (Romain, 5 novembre, 14 h 26 ; elles étaient dans le Carnet) */
  if(E.lettre) l.push({id:'lettre', titre:'La lettre du maire', ic:'✉️', livre:true});
  if(archivesDe(E).length) l.push({id:'archives', titre:'Les archives', ic:'🗄️', livre:true});
  /* les fondateurs : la page de la saison (plus bas) ; p.dans : une page de l'enquête rangée DANS une page de toutes les enquêtes
     (le plan du moulin dans la bibliothèque des plans, la pierre de Tim dans les objets magiques) */
  /* une page d'un moment seulement (p.moments : 📣 le rassemblement, la nuit) n'est pas dans le livre avant son moment
     (Romain, 5 novembre, 12 h 31) ; elle y apparaît quand on y passe, et le livre s'ouvre dessus (passer-moment, plus bas) */
  var P0 = M.P();
  (E.pages || []).forEach(function(p){ if(p.id !== 'fondateurs' && !p.dans && !(p.moments && !M.momentOk(p.moments) && !(P0 && P0.pages[p.id]))) l.push(p); });
  if(FONDATEURS_VISIBLE) l.push({id:'fondateurs', titre:'Les fondateurs', ic:'🏛️', livre:true});
  l.push({id:'bibliotheque', titre:'La bibliothèque des plans', ic:'📚', livre:true});   /* (un vieux livre, plus une équerre : Romain, 15 h 05) */
  l.push({id:'objets', titre:'Les objets magiques', ic:'🔮', livre:true});
  l.push({id:'codes', titre:'Les codes des moments', ic:'⏭️', livre:true});
  if(!M.sansActions()) l.push({id:'actions', titre:'Donner une action', ic:'💡', livre:true});   /* une enquête sans points d'action : pas de réserve */
  l.push({id:'accusation', titre:'L\'accusation', ic:'⚖️', livre:true});
  return l.map(function(p, k){ var r = RANG[p.id]; return {p:p, r:r === undefined ? 50 : r, k:k}; })
    .sort(function(a, b){ return (a.r - b.r) || (a.k - b.k); }).map(function(x){ return x.p; });
}
function indexDe(L, id){ for(var k = 0; k < L.length; k++) if(L[k].id === id) return k; return -1; }
function pageE(id){ return (M.E().pages || []).filter(function(x){ return x.id === id; })[0] || null; }
/* La page blanche (enquête 1) : toute la page est blanche, sans un mot */
function pagePleineBlanche(p){ return !!p && !p.livre && (p.id === 'mystere' || /page blanche/i.test(p.titre || '')) && encreRequise(p); }
/* Une page (ou lettre) blanche à faire parler avec l'encre de l'Alchimiste */
function encreRequise(p){ return !p.action && (!p.mj || p.blancheMj) && (p.besoin || []).some(function(b){ return b.code === 'pot:revelatrice'; }); }   /* blancheMj (enquête 1) : la page reste blanche, et la toucher avec l'encre lance son mini-jeu (les runes) */
function fermee(p){ var P = M.P(); return !p.livre && !p.tableau && p.besoin && !P.pages[p.id] && !M.besoinOk(p.besoin); }

/* ---------- Petits dessins ---------- */
function portrait(id){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
    try{ return Persos.pnj(id, {anime:false, humeur:'normal', id:'lv' + (++uid)}); }catch(e){}
  }
  return '<span class="lv-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}
var CORPS_FIOLE = 'M26 14v13C15 31 9 41 9 52c0 15 10 27 23 27s23-12 23-27c0-11-6-21-17-25V14z';
function fiole(c, ic){
  var k = 'lvf' + (++uid);
  return '<span class="lv-fiole"><svg viewBox="0 0 64 84" aria-hidden="true"><defs><clipPath id="' + k + '"><path d="' + CORPS_FIOLE + '"/></clipPath></defs>' +
    '<g clip-path="url(#' + k + ')"><rect x="0" y="41" width="64" height="50" fill="' + c + '"/><path d="M0 43 Q16 37 32 43 T64 43 V50 H0Z" fill="#fff" opacity=".35"/>' +
    '<circle cx="25" cy="61" r="3" fill="#fff" opacity=".6"/><circle cx="38" cy="55" r="2" fill="#fff" opacity=".6"/><circle cx="33" cy="69" r="2.4" fill="#fff" opacity=".5"/></g>' +
    '<path d="' + CORPS_FIOLE + '" fill="rgba(255,255,255,.28)" stroke="#24182e" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M16 46 Q13 56 19 66" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>' +
    '<rect x="23" y="5" width="18" height="11" rx="3" fill="#b07a46" stroke="#24182e" stroke-width="3"/></svg>' +
    '<span class="lv-fiole-ic">' + ic + '</span></span>';
}
/* Les signes des fondateurs : un œil, un chaudron, une lyre, une étoile ; le cinquième est gratté */
var SIGNES = {
  oeil:'<path d="M8 30 Q30 10 52 30 Q30 50 8 30Z" fill="#fffaf0" stroke="#35281b" stroke-width="3" stroke-linejoin="round"/><circle cx="30" cy="30" r="8.5" fill="var(--c)" stroke="#35281b" stroke-width="2.5"/><circle cx="30" cy="30" r="3.4" fill="#35281b"/><circle cx="27.4" cy="27.4" r="1.6" fill="#fff"/><path d="M16 21l-3-4M24 17l-1-5M36 17l1-5M44 21l3-4" stroke="#35281b" stroke-width="2.5" stroke-linecap="round"/>',
  chaudron:'<circle cx="24" cy="15" r="3" fill="none" stroke="#35281b" stroke-width="2"/><circle cx="33" cy="9" r="2.2" fill="none" stroke="#35281b" stroke-width="2"/><circle cx="37" cy="17" r="2.6" fill="none" stroke="#35281b" stroke-width="2"/><path d="M13 27 Q12 48 30 49 Q48 48 47 27Z" fill="#4a3f5c" stroke="#35281b" stroke-width="3" stroke-linejoin="round"/><ellipse cx="30" cy="26" rx="19" ry="5" fill="var(--c)" stroke="#35281b" stroke-width="3"/><path d="M19 47l-3 6M41 47l3 6" stroke="#35281b" stroke-width="3" stroke-linecap="round"/>',
  lyre:'<path d="M18 13 Q9 31 22 44 M42 13 Q51 31 38 44" fill="none" stroke="#35281b" stroke-width="3.5" stroke-linecap="round"/><path d="M18 13q-5-3-2-7M42 13q5-3 2-7" fill="none" stroke="#35281b" stroke-width="3" stroke-linecap="round"/><path d="M17 19h26" stroke="#35281b" stroke-width="3" stroke-linecap="round"/><path d="M25 19v25M30 19v25M35 19v25" stroke="#35281b" stroke-width="1.8"/><rect x="19" y="43" width="22" height="6" rx="2" fill="var(--c)" stroke="#35281b" stroke-width="2.5"/>',
  etoile:'<path d="M30 8 L35.4 22.6 L50.9 23.2 L38.7 32.8 L42.9 47.8 L30 39.2 L17.1 47.8 L21.3 32.8 L9.1 23.2 L24.6 22.6 Z" fill="var(--c)" stroke="#35281b" stroke-width="3" stroke-linejoin="round"/><circle cx="47" cy="45" r="1.8" fill="#35281b"/><circle cx="12" cy="44" r="1.4" fill="#35281b"/>',
  efface:'<path d="M22 20 Q30 12 38 20 Q42 30 30 36" fill="none" stroke="#35281b" stroke-width="2.5" opacity=".25"/><path d="M11 22 L49 17 L13 29 L47 27 L15 37 L48 35 L17 45 L45 44" fill="none" stroke="#35281b" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>'
};
function medaille(signe, c){
  return '<svg class="lv-med-svg" viewBox="0 0 60 60" style="--c:' + c + '" aria-hidden="true"><circle cx="30" cy="30" r="28" fill="#fbf3dc" stroke="#35281b" stroke-width="2.5"/>' +
    '<circle cx="30" cy="30" r="24.5" fill="none" stroke="' + c + '" stroke-width="2.5" stroke-dasharray="3 3"/>' + '<g transform="translate(30 30) scale(.78) translate(-30 -30)">' + SIGNES[signe] + '</g></svg>';
}
/* Le plan de la forêt, dessiné à l'encre révélée */
function carteForet(){
  var arbres = [[40,150],[70,186],[28,112],[95,140],[234,150],[262,190],[292,128],[112,52],[124,104],[198,108],[300,30],[22,200],[110,200],[300,200]].map(function(a){
    return '<path class="lv-arbre" d="M' + a[0] + ' ' + (a[1] - 14) + ' l-8 14 h16z M' + a[0] + ' ' + a[1] + ' v6"/>';
  }).join('');
  function chemin(d){ return '<path class="lv-trace" pathLength="1" d="' + d + '"/>'; }
  function lieu(x, y, ic, nom){ return '<g class="lv-lieu"><text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="22">' + ic + '</text><text class="lv-nom" x="' + x + '" y="' + (y + 18) + '" text-anchor="middle">' + nom + '</text></g>'; }
  return '<svg class="lv-carte-foret" viewBox="0 0 320 240" role="img" aria-label="Le plan de la forêt">' + arbres +
    chemin('M160 222 C150 200 172 182 160 152') + chemin('M155 146 C128 128 92 106 64 74') + chemin('M160 144 C168 118 150 96 160 70') + chemin('M166 147 C200 128 236 108 260 76') +
    '<circle class="lv-carrefour" cx="160" cy="148" r="6"/>' +
    lieu(58, 56, '🌾', 'Moulin') + lieu(160, 50, '🪣', 'Puits') + lieu(256, 58, '🌳', 'Vieux Chêne') +
    '<g class="lv-lieu"><text x="160" y="236" text-anchor="middle" class="lv-nom">Brumeval</text></g>' +
    '<g class="lv-lieu"><text x="174" y="166" class="lv-nom petit">carrefour</text></g></svg>';
}
/* Les symboles bizarres de la lettre blanche (décoratifs : on les lit avec l'alphabet des archives) */
var GLYPHES = ['M5 5v18h18', 'M23 5v18H5', 'M5 23V5h18', 'M5 5h18v18', 'M5 5h18v18H5z', 'M5 5l9 18 9-18', 'M5 23l9-18 9 18', 'M23 5L5 14l18 9', 'M5 5l18 9L5 23'];
function glyphes(){
  var seq = [4, 0, 7, 2, 5, 1, 8, 3, 0, 6, 4, 2, 7, 1, 5, 3, 8, 6];
  return '<div class="lv-glyphes" role="img" aria-label="Des symboles secrets">' + seq.map(function(g, k){
    return '<svg viewBox="0 0 28 28" style="--d:' + (k * 0.08).toFixed(2) + 's"><path d="' + GLYPHES[g] + '"/>' + (k % 3 === 1 ? '<circle cx="14" cy="14" r="2.4"/>' : '') + '</svg>';
  }).join('') + '</div>';
}
var PLUME = '<svg class="lv-plume" viewBox="0 0 80 70" aria-hidden="true"><path d="M8 64 C26 44 48 22 74 6 C66 30 44 52 14 60 Z" fill="none" stroke="#7d7a92" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 64 L60 18" stroke="#7d7a92" stroke-width="2" stroke-linecap="round"/></svg>';

/* ---------- Le contenu de chaque page ---------- */
function tete(p){ return '<header class="lv-tete"><span class="lv-tete-ic" aria-hidden="true">' + p.ic + '</span><h2>' + esc(p.titre) + '</h2></header>'; }
function contenu(p){
  var E = M.E(), P = M.P();
  if(p.tableau) return tete(p) + (M.tableauHTML ? M.tableauHTML() : '');
  if(p.type === 'registre') return tete(p) + registre(E) + (p.donne ? donne(p) : '');   /* (le registre ne donne plus de code au Barde depuis le 5 novembre : les visages sont sur les maisons ; p.donne reste possible) */
  if(p.id === 'recettes') return tete(p) + recettes(E, P);
  if(p.id === 'lettre' && p.livre) return tete(p) + lettreMaire(E);
  if(p.id === 'archives' && p.livre) return tete(p) + archives(E);
  if(p.id === 'fondateurs' && p.livre) return tete(p) + fondateurs();
  if(p.id === 'bibliotheque' && p.livre) return tete(p) + bibliotheque(E, P);
  if(p.id === 'objets' && p.livre) return tete(p) + objetsMagiques(E, P);
  if(p.id === 'codes' && p.livre) return tete(p) + codesMoments(E, P);
  if(p.id === 'actions' && p.livre) return tete(p) + donnerAction(P);
  if(p.id === 'accusation' && p.livre) return tete(p) + accusation(E, P);
  if(pagePleineBlanche(p)) return P.pages[p.id] ? tete(p) + revele(p) : pageBlanche(p);
  if(encreRequise(p)) return tete(p) + (P.pages[p.id] ? revele(p) : lettreBlanche(p));
  return tete(p) + generique(p, E, P);
}
/* ---------- ✉️ La lettre du maire (celle du début de l'enquête, et son affiche) ---------- */
function lettreMaire(E){
  var sg = E.signature || 'Monsieur Grosbec, maire de Brumeval';
  var s = '<article class="parchemin b-lettre lv-lettre"><p class="b-lettre-date">Brumeval, ' + esc(D.MOMENTS[E.moments[0]].nom.toLowerCase()) + '</p>' +
    '<p>' + esc(E.lettre) + '</p><p class="b-signature">' + esc(sg) + '</p>' + lire(E.lettre, 'grosbec') + '</article>';
  if(E.affiche) s += '<article class="parchemin b-lettre b-affiche lv-lettre"><p class="sur-titre centre">📜 ' + esc(E.affiche.titre || 'Affiche') + '</p><p class="centre"><b>' + esc(E.affiche.t) + '</b></p>' +
    lire((E.affiche.titre ? E.affiche.titre + ' : ' : '') + E.affiche.t, 'grosbec') + '</article>';
  return s;
}

/* ---------- 🗄️ Les archives (Romain, 5 novembre, 14 h 26) ----------
   Le Sage range ce qu'il faut retenir des enquêtes passées (E.archive, dans e1.js, e2.js… : les grands moments, ce qui servira plus tard,
   les quatre héros confondus). À l'enquête N : les archives des enquêtes 1 à N − 1 (à l'enquête 1, pas de page).
   Chaque enquête est un dossier qui se déplie (le dernier : déplié au départ) ; dedans, des parties qui se déplient aussi,
   dans les cadres des missions. UI.archOuverts : ce qui est déplié (le temps de la partie). */
function archivesDe(E){
  var l = [];
  M.cle(window.ENQUETES || {}).map(Number).sort(function(a, b){ return a - b; }).forEach(function(n){
    var A = window.ENQUETES[n]; if(n < E.id && A && A.archive) l.push(A);
  });
  return l;
}
function archives(E){
  var l = archivesDe(E), O = UI.archOuverts = UI.archOuverts || {};
  var aide = 'Ici, le Sage range ce qu\'il faut retenir des enquêtes passées. Certaines choses serviront plus tard !';
  var s = '<p class="lv-arch-intro">' + esc(aide) + ' ' + lire(aide) + '</p>';
  l.forEach(function(A, k){
    var id = 'e' + A.id, ouvert = O[id] === undefined ? k === l.length - 1 : !!O[id];
    s += '<section class="b-missions lv-arch' + (ouvert ? '' : ' plie') + '"><h3><button type="button" class="b-mi-plier" data-act="arch-plier" data-id="' + id + '" aria-expanded="' + ouvert + '">' +
      '<span>📁 Enquête ' + A.id + ' · ' + esc(A.titre) + '</span><i class="b-mi-fleche" aria-hidden="true">▾</i></button></h3>';
    if(ouvert){
      if(A.archive.resume) s += '<p class="lv-arch-resume">' + esc(A.archive.resume) + ' ' + lire(A.archive.resume) + '</p>';
      (A.archive.parties || []).forEach(function(pt, j){
        var pid = id + ':' + j, po = !!O[pid];
        s += '<div class="lv-arch-partie' + (po ? '' : ' plie') + '"><button type="button" class="b-mi-plier lv-arch-tete" data-act="arch-plier" data-id="' + pid + '" aria-expanded="' + po + '">' +
          '<span>' + pt.ic + ' ' + esc(pt.titre) + '</span><small class="b-mi-compte">' + pt.lignes.length + '</small><i class="b-mi-fleche" aria-hidden="true">▾</i></button>';
        if(po) s += '<ul>' + pt.lignes.map(function(x){ return '<li><span class="b-mi-ic">' + x[0] + '</span><div class="b-mi-corps"><p>' + esc(x[1]) + '</p></div>' + lire(x[1]) + '</li>'; }).join('') + '</ul>';
        s += '</div>';
      });
    }
    s += '</section>';
  });
  return s;
}
if(M.A) M.A['arch-plier'] = function(el){
  var O = UI.archOuverts = UI.archOuverts || {}, id = el.dataset.id, E = M.E();
  var dernier = archivesDe(E).length ? 'e' + archivesDe(E).slice(-1)[0].id : '';
  var avant = O[id] === undefined ? id === dernier : !!O[id];
  O[id] = !avant; M.son('page'); M.render();
};

function donne(p){
  var n = M.nomCode(p.donne), td = M.texteDonne(p.donne);
  return '<div class="b-donne"><p>' + n.ic + ' <b>' + esc(n.nom) + '</b> : ' + esc(td) + ' ' + lire(n.nom + ' : ' + td) + '</p>' + M.codeHTML(M.code(p.donne)) + '</div>';
}

/* 👥 Les habitants */
/* Pour chacun (Romain, 5 novembre, 00 h 14) : son nom et son métier, son adresse (r.maison : une maison numérotée, son visage est dessus
   sur la carte ; r.adresse : un lieu sans numéro, la taverne, le moulin…), la taille de ses pieds, et une phrase sur lui (r.note). */
function adresseReg(r){ return r.maison ? M.adresse(r.maison) : (r.adresse || ''); }
function registre(E){
  var ids = M.cle(E.registre || {});
  var tout = ids.map(function(id){ var x = D.PNJ[id], r = E.registre[id], a = adresseReg(r);
    return x.nom + ', ' + x.metier + '. ' + (a ? (r.maison ? 'Habite au ' : 'Habite : ') + a + '. ' : '') + (x.pied ? 'Pieds de ' + x.pied + ' carreaux. ' : '') + (r.note || ''); }).join(' ');
  return '<p class="lv-intro">Le registre des habitants de Brumeval. ' + lire(tout) + '</p><div class="b-registre lv-registre">' + ids.map(function(id){
    var x = D.PNJ[id], r = E.registre[id], a = adresseReg(r);
    return '<div class="b-reg-ligne"><div class="b-reg-img">' + portrait(id) + '</div><div class="lv-reg-txt"><b>' + esc(x.nom) + '</b> · <i>' + esc(x.metier) + '</i>' +
      '<p class="petit">' + (a ? '🏠 ' + esc(a.charAt(0).toUpperCase() + a.slice(1)) + (x.pied ? ' · ' : '') : '') + (x.pied ? '👣 pieds de ' + x.pied + ' carreaux' : '') + '</p>' +
      (r.note ? '<p class="petit">' + esc(r.note) + ' ' + lire(r.note) + '</p>' : '') + '</div></div>';
  }).join('') + '</div>';
}

/* 🧪 Les recettes : ce que l'Alchimiste sait préparer dans cette enquête (dont celles apprises pendant la saison) */
function recettes(E, P){
  var l = [];
  (E.recettes || []).forEach(function(r){ if(D.RECETTES[r] && l.indexOf(r) < 0) l.push(r); });   /* celles de l'enquête d'abord */
  M.recettesConnues().forEach(function(r){ if(D.RECETTES[r] && l.indexOf(r) < 0) l.push(r); });
  var s = '<div class="lv-recettes">' + l.map(function(r){ return carteRecette(r, E, P); }).join('') + '</div>';
  var autres = M.cle(P.potions || {}).filter(function(k){ return P.potions[k] > 0 && D.POTIONS[k] && l.indexOf(k) < 0; });
  if(autres.length) s += '<div class="lv-sac-rangee"><b>🎒 Dans ton sac</b>' + autres.map(function(k){ var p = D.POTIONS[k], ut = sertA(p); return '<span class="lv-puce">' + p.ic + ' ' + esc(p.nom) + ' ×' + P.potions[k] + (ut ? ' <small>' + esc(ut) + '</small>' : '') + ' ' + lire(p.nom + '. ' + ut) + '</span>'; }).join('') + '</div>';
  return s;
}
/* À quoi sert une potion, en une phrase courte pour un enfant (Romain, 4 novembre, 21 h 12) : la phrase courte (d), sinon la longue (utile) */
function sertA(p){ return (p && (p.d || p.utile)) || ''; }
function carteRecette(r, E, P){
  var R = D.RECETTES[r], p = D.POTIONS[r], secrete = !!R.secrete, ut = sertA(p);
  var ingr = R.ingr.map(function(x, k){
    var I = D.INGR[x[0]] || {nom:x[0], ic:'❔', c:'#ddd'};
    return (k ? '<i class="lv-suite" aria-hidden="true">›</i>' : '') + '<span class="lv-ingr" style="--c:' + I.c + '"><span class="lv-ingr-ic">' + I.ic + '<b>×' + x[1] + '</b></span><small>' + esc(I.nom) + '</small></span>';
  }).join('');
  var dire = (secrete ? 'Recette secrète : lis-la à l\'Alchimiste ! ' : '') + p.nom + '. ' + (ut ? 'À quoi elle sert ? ' + ut + ' ' : '') + 'Il faut : ' + R.ingr.map(function(x){ return x[1] + ' ' + (D.INGR[x[0]] || {nom:x[0]}).nom.toLowerCase(); }).join(', ') + '.';
  var n = P.potions && P.potions[r] > 0 ? P.potions[r] : 0;
  /* L'encre révélatrice : un raccourci vers la page (ou la lettre) blanche qu'elle fait parler */
  var lien = '';
  if((p.fx && (p.fx.acces || []).indexOf('encre') >= 0) || r === 'revelatrice'){
    var b = (E.pages || []).filter(encreRequise)[0];
    if(b) lien = '<button type="button" class="lv-vers" data-lv="aller" data-id="' + b.id + '"><span class="lv-mini-blanc" aria-hidden="true"></span>' + esc(b.titre) + ' ›</button>';
  }
  return '<article class="lv-recette' + (secrete ? ' secrete' : '') + '" style="--p:' + p.c + '">' +
    '<header>' + fiole(p.c, p.ic) + '<div class="lv-rec-nom"><h3>' + esc(p.nom) + '</h3>' +
      (secrete ? '<span class="lv-badge secret">📜 Secrète : lis-la à l\'Alchimiste !</span>' : '') + (n ? '<span class="lv-badge sac">🎒 Tu en as ' + n + '</span>' : '') + '</div>' + lire(dire) + '</header>' +
    (ut ? '<p class="lv-utile"><b>À quoi elle sert ?</b> ' + esc(ut) + '</p>' : '') +
    '<div class="lv-ingrs">' + ingr + '</div>' + lien + '</article>';
}

/* ❔ La page blanche : toute blanche, des reflets bleu-violet qui bougent, pas un mot */
function pageBlanche(p){
  var pret = M.besoinOk(p.besoin);
  return '<button type="button" class="lv-blanc lv-blanc-page' + (pret ? ' pret' : '') + '" data-lv="blanche" data-id="' + esc(p.id) + '" aria-label="' + esc(p.titre) + '">' +
    '<span class="lv-reflets" aria-hidden="true"></span><span class="lv-lustre" aria-hidden="true"></span><span class="lv-fantome" aria-hidden="true" data-ic="' + D.POTIONS.revelatrice.ic + '"></span></button>';
}
/* 📃 La lettre blanche (enquête 2) : une feuille blanche sur la page, avec juste une plume dessinée en bas */
function lettreBlanche(p){
  var pret = M.besoinOk(p.besoin);
  return '<button type="button" class="lv-blanc lv-blanc-lettre' + (pret ? ' pret' : '') + '" data-lv="blanche" data-id="' + esc(p.id) + '" aria-label="' + esc(p.titre) + '">' +
    '<span class="lv-reflets" aria-hidden="true"></span><span class="lv-lustre" aria-hidden="true"></span><span class="lv-fantome" aria-hidden="true" data-ic="' + D.POTIONS.revelatrice.ic + '"></span>' + PLUME + '</button>';
}
/* Ce que l'encre a fait apparaître */
function revele(p){
  var neuf = UI.livreRevele === p.id && !UI.modal;   /* le dessin se trace une seule fois, quand la fenêtre de la découverte se ferme */
  if(neuf) UI.livreRevele = null;
  var dessin = p.donne === 'info:carte' || p.id === 'mystere' ? carteForet() : glyphes();
  var partiel = M.P().pages[p.id] === 'partiel', t = partiel && p.tPartiel ? p.tPartiel : p.t;   /* mini-jeu raté deux fois : le dessin à moitié effacé (moteur-actions.js, ouvrir-page) */
  return '<div class="lv-revele' + (neuf ? ' neuf' : '') + (partiel ? ' partiel' : '') + (p.donne === 'info:carte' || p.id === 'mystere' ? '' : ' lettre') + '">' + dessin + '</div>' +
    (t ? '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p>' : '') + (p.donne ? donne(p) : '');
}

/* Les autres pages de l'enquête (lettres du Corbeau, Livre d'or, archives, plans, grille…) */
function generique(p, E, P){
  var ouvert = P.pages[p.id], s = '';
  if(p.type === 'lettres' && (ouvert || !(p.besoin || p.action || p.mj))){
    if(p.t) s += '<p class="lv-texte">' + esc(p.t) + ' ' + lire(p.t) + '</p>';
    s += '<div class="b-lettres">' + (p.lettres || []).map(function(l){
      return '<div class="b-lettre-corbeau' + (l.signe ? ' signee' : '') + '"><span class="ecriture">' + M.ecriture(l.texte, l.pt) + '</span>' +
        (l.signe ? '<span class="b-signe ecriture">' + M.ecriture(l.signe, l.pt) + '</span>' : '<span class="b-plume">🪶</span>') + '</div>';
    }).join('') + '</div>';
    return s + (p.donne ? donne(p) : '');
  }
  if(!ouvert){
    /* une page qui ne s'ouvre qu'à certains moments (p.moments : le rassemblement, la nuit) : un message, pas de bouton */
    if(p.moments && !M.momentOk(p.moments)){
      var hm = p.horsMoment || 'Ce n\'est pas encore le moment.';
      return '<div class="lv-illu" aria-hidden="true">' + p.ic + '</div><p class="lv-texte">' + esc(hm) + ' ' + lire(hm) + '</p>';
    }
    if(p.besoin && !M.besoinOk(p.besoin)){
      /* (plus de p.besoinNeutre : c'était le message « pas assez de preuves » du rassemblement, qui n'en demande plus depuis le 5 novembre, 01 h 36) */
      var av = p.avant || 'Cette page est fermée.';
      return '<div class="lv-sceau" aria-hidden="true"><span>🔒</span></div><p class="lv-texte">' + esc(av) + ' ' + lire(av) + '</p>' + M.besoinHTML(p.besoin, 'sage');
    }
    /* (p.obligatoire : la page où le livre s'ouvre tout seul, plus bas ; son gros bouton jaune palpite) */
    if(p.besoin || p.action || p.mj || p.obligatoire){
      var sans = p.action && !M.peutAgir();
      return '<div class="lv-illu" aria-hidden="true">' + p.ic + '</div>' + (p.avant ? '<p class="lv-texte">' + esc(p.avant) + ' ' + lire(p.avant) + '</p>' : '') +
        '<button class="btn grand b-aller lv-ouvrir' + (p.obligatoire ? ' b-guide' : '') + '" data-act="ouvrir-page" data-id="' + esc(p.id) + '"' + (sans ? ' disabled' : '') + '>' + (p.mj ? '🎮 ' : (p.boutonIc || '📖 ')) + esc(p.bouton || 'Ouvrir la page') + (p.action ? M.coutTxt() : '') + '</button>' + (sans ? M.plusDAction() : '');
    }
  }
  /* (enquête 3) p.variantes [{si, t}] : le texte selon ce que le Sage sait (la page des premiers doutes : un code du Barde, ou les deux) */
  var pv = (p.variantes || []).filter(function(x){ return M.besoinOk(x.si); })[0], pt = pv ? pv.t : p.t;
  s += '<div class="lv-texte-page">' + (p.html || '<p class="lv-texte">' + esc(pt || '') + ' ' + (pt ? lire(pt) : '') + '</p>') + '</div>';
  /* (enquête 3) p.lignes : des lignes à lire à voix haute, chacune avec son petit dessin et son 🔊 (les énigmes de l'herbier) */
  if(p.lignes) s += '<ul class="lv-lignes">' + p.lignes.map(function(x){ return '<li><span class="lv-lignes-ic" aria-hidden="true">' + (x.ic || '•') + '</span><p>' + esc(x.t) + '</p>' + lire(x.t) + '</li>'; }).join('') + '</ul>';
  /* (12 novembre) p.type 'herbier' : une planche par plante — son dessin, où elle vit et l'endroit précis, le moment de la journée (cueillette.js, D.PLANTES) */
  if(p.type === 'herbier' && M.herbierHTML) s += M.herbierHTML();
  if(p.donne && (ouvert || !p.besoin)) s += donne(p);
  return s;
}

/* 🏛️ Les fondateurs : l'histoire de la saison, sans rien dévoiler */
var HISTOIRE = {
  debut:['Il y a trois cents ans, la vallée de Brumeval était cachée sous une brume épaisse. Personne n\'osait y entrer.',
    'Un matin, quatre amis ont traversé la brume. Comme vous, ils étaient quatre : une pisteuse, un alchimiste, une barde et un sage.'],
  quatre:[
    {r:'pisteur', signe:'oeil', qui:'La pisteuse', t:'Elle voyait tout, même dans le noir. C\'est elle qui a trouvé les chemins de la forêt.'},
    {r:'alchimiste', signe:'chaudron', qui:'L\'alchimiste', t:'Avec trois fleurs et un peu d\'eau, il faisait des merveilles. Ses potions brillaient dans la nuit.'},
    {r:'barde', signe:'lyre', qui:'La barde', t:'Quand elle chantait, les oiseaux se taisaient pour l\'écouter. On dit que ses chansons ouvraient des portes…'},
    {r:'sage', signe:'etoile', qui:'Le sage', t:'Il lisait le ciel comme un livre. C\'est lui qui a écrit ce Grand Livre, avec un alphabet secret que seuls ses amis savaient lire.'}],
  milieu:['Ensemble, ils ont bâti le village : le moulin, le clocher, la place et sa fontaine. Chacun y a laissé son signe : un œil, un chaudron, une lyre et une étoile.',
    'Sous le village, ils ont creusé des passages secrets. Où mènent-ils ? Plus personne ne s\'en souvient…'],
  cinquieme:'Mais une vieille chanson dit qu\'ils étaient CINQ. Ici, il y avait un cinquième portrait. Quelqu\'un l\'a gratté jusqu\'à le faire disparaître. Qui était-ce ? Et pourquoi l\'a-t-on effacé ?',
  fin:'Le Grand Livre garde encore bien des secrets. Ouvrez l\'œil, enquêteurs !'
};
function fondateurs(){
  var H = HISTOIRE;
  function para(t, cls){ return '<p class="lv-histoire' + (cls ? ' ' + cls : '') + '">' + esc(t) + ' ' + lire(t) + '</p>'; }
  var s = H.debut.map(function(t, k){ return para(t, k ? '' : 'lettrine'); }).join('');
  s += '<div class="lv-fondateurs">' + H.quatre.map(function(f){
    var R = D.ROLES[f.r] || {c:'#b8862e'};
    return '<figure class="lv-fond" style="--c:' + R.c + '">' + medaille(f.signe, R.c) + '<figcaption><b>' + esc(f.qui) + '</b><span>' + esc(f.t) + ' ' + lire(f.qui + '. ' + f.t) + '</span></figcaption></figure>';
  }).join('') + '</div>';
  s += H.milieu.map(function(t){ return para(t); }).join('');
  s += '<figure class="lv-cinquieme">' + medaille('efface', '#8a7a66') + '<figcaption><b>Le cinquième ?</b><span>' + esc(H.cinquieme) + ' ' + lire(H.cinquieme) + '</span></figcaption></figure>';
  s += para(H.fin, 'lv-fin-histoire');
  return s;
}

/* 📐 La bibliothèque des plans et 🔮 Les objets magiques (Romain, 4 novembre, 21 h 12) : deux pages de toutes les enquêtes,
   toujours ouvertes (pas de cadenas), qui ne disent jamais quoi chercher ni ce qui « marcherait ».
   Ce qu'une enquête y range (E.pages avec dans:'bibliotheque' ou dans:'objets' : le plan du moulin de Farinel, la pierre de Tim)
   n'y apparaît qu'une fois son code tapé ; c'est alors la même page qu'avant (réparer le plan, déchiffrer les runes). */
var T_PLANS = 'Ici sont rangés tous les vieux plans de Brumeval : la mairie, le clocher, le pont, la taverne, la place des Lanternes, la ruelle des Brumes… Un de tes coéquipiers finira bien par mettre la main sur celui qu\'il te faut, au fil de vos aventures.';
var T_RIEN = 'Pour l\'instant, vous n\'avez rien trouvé.';
var T_OBJETS = 'Ici seront rangés les plans des runes et tous les autres objets magiques.';
var T_LANTERNE = 'La Lanterne d\'Or est un objet magique. Tout le monde croit que son pouvoir se limite à allumer les lanternes du village, sur la place de la fontaine.';
function rangees(E, P, ou){ return (E.pages || []).filter(function(p){ return p.dans === ou && (P.pages[p.id] || !p.besoin || M.besoinOk(p.besoin)); }); }
function rangee(p, E, P){ return '<section class="lv-rangee"><h3><span aria-hidden="true">' + p.ic + '</span> ' + esc(p.titre) + '</h3>' + generique(p, E, P) + '</section>'; }
/* La bibliothèque des plans (Romain, 5 novembre, 15 h 05) : en haut, de vieux livres sur une étagère (dessin) ;
   chaque plan rangé est un menu qui se déplie (cadres des missions, fermé au départ, UI.bibOuverts) ;
   dès qu'il y a un plan, plus de texte d'explication (dans l'enquête 2, les vieux chemins y sont dès le début). */
function livreSVG(x, w, h, c, bande, penche){
  var y = 84 - h, t = penche ? ' transform="rotate(' + penche + ' ' + (x + w) + ' 84)"' : '';
  return '<g' + t + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2.5" fill="' + c + '" stroke="#35281b" stroke-width="2"/>' +
    '<rect x="' + (x + 3) + '" y="' + (y + 2) + '" width="' + Math.max(3, w * .22) + '" height="' + (h - 4) + '" fill="rgba(255,255,255,.18)"/>' +
    '<rect x="' + x + '" y="' + (y + 7) + '" width="' + w + '" height="3" fill="' + bande + '"/><rect x="' + x + '" y="' + (y + h - 11) + '" width="' + w + '" height="3" fill="' + bande + '"/>' +
    '<rect x="' + (x + 4) + '" y="' + (y + h * .36) + '" width="' + (w - 8) + '" height="' + Math.round(h * .2) + '" rx="1.5" fill="#efdcae" stroke="#35281b" stroke-width="1.2"/></g>';
}
var ETAGERE = '<svg class="lv-etagere" viewBox="0 0 240 104" role="img" aria-label="De vieux livres sur une étagère">' +
  livreSVG(22, 20, 62, '#7b2d26', '#d9b15c') + livreSVG(44, 15, 52, '#2f4f3a', '#d9b15c') + livreSVG(61, 24, 68, '#5a3a22', '#c99a48') +
  livreSVG(87, 17, 57, '#23395b', '#d9b15c') + livreSVG(107, 19, 60, '#8a5a2b', '#e3c27a', 16) +
  /* une pile de livres couchés, et un vieux plan roulé posé dessus */
  '<rect x="150" y="71" width="64" height="13" rx="2.5" fill="#6b2a3a" stroke="#35281b" stroke-width="2"/><rect x="150" y="75" width="64" height="2.5" fill="#d9b15c"/>' +
  '<rect x="155" y="58" width="56" height="13" rx="2.5" fill="#3d5a4a" stroke="#35281b" stroke-width="2"/><rect x="155" y="62" width="56" height="2.5" fill="#d9b15c"/>' +
  '<rect x="160" y="45" width="48" height="11" rx="5.5" fill="#efdcae" stroke="#35281b" stroke-width="2"/><ellipse cx="160" cy="50.5" rx="4" ry="5.5" fill="#e0c88f" stroke="#35281b" stroke-width="2"/>' +
  '<path d="M178 45v11M190 45v11" stroke="#b0453a" stroke-width="2.5"/>' +
  /* la planche et ses équerres */
  '<rect x="6" y="84" width="228" height="10" rx="2" fill="#7a4a26" stroke="#35281b" stroke-width="2"/><rect x="8" y="85.5" width="224" height="2.5" fill="#a5703f"/>' +
  '<path d="M32 94h14l-14 10z M194 94h14v10z" fill="#5e3618" stroke="#35281b" stroke-width="2" stroke-linejoin="round"/></svg>';
function bibliotheque(E, P){
  var l = rangees(E, P, 'bibliotheque'), O = UI.bibOuverts = UI.bibOuverts || {};
  if(!l.length) return ETAGERE + '<p class="lv-texte">' + esc(T_PLANS) + ' ' + lire(T_PLANS) + '</p><p class="lv-texte lv-rien">' + esc(T_RIEN) + ' ' + lire(T_RIEN) + '</p>';
  return ETAGERE + l.map(function(p){
    var ouvert = !!O[p.id], fait = P.pages[p.id];
    return '<section class="b-missions lv-arch lv-bib' + (ouvert ? '' : ' plie') + '"><h3><button type="button" class="b-mi-plier" data-act="bib-plier" data-id="' + esc(p.id) + '" aria-expanded="' + ouvert + '">' +
      '<span>' + p.ic + ' ' + esc(p.titre) + '</span>' + (fait ? '<small class="b-mi-compte">✅</small>' : '') + '<i class="b-mi-fleche" aria-hidden="true">▾</i></button></h3>' +
      (ouvert ? '<div class="lv-bib-corps">' + generique(p, E, P) + '</div>' : '') + '</section>';
  }).join('');
}
if(M.A) M.A['bib-plier'] = function(el){ var O = UI.bibOuverts = UI.bibOuverts || {}; O[el.dataset.id] = !O[el.dataset.id]; M.son('page'); M.render(); };
function objetsMagiques(E, P){
  return '<p class="lv-texte">' + esc(T_OBJETS) + ' ' + lire(T_OBJETS) + '</p>' +
    '<figure class="lv-objet">' + lanterneOr() + '<figcaption><b>La Lanterne d\'Or</b><span>' + esc(T_LANTERNE) + ' ' + lire(T_LANTERNE) + '</span></figcaption></figure>' +
    rangees(E, P, 'objets').map(function(p){ return rangee(p, E, P); }).join('');
}
/* La Lanterne d'Or : cadre doré, verre chaud, une flamme, un halo qui respire doucement (immobile si l'appareil demande moins de mouvement) */
function lanterneOr(){
  var k = 'lvl' + (++uid), K = '#24182e';
  return '<svg class="lv-lanterne" viewBox="0 0 120 160" role="img" aria-label="La Lanterne d\'Or">' +
    '<defs><radialGradient id="' + k + 'h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3c4"/><stop offset=".45" stop-color="#ffc457" stop-opacity=".7"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + k + 'o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#f5b945"/><stop offset="1" stop-color="#c8862a"/></linearGradient>' +
    '<linearGradient id="' + k + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d6"/><stop offset="1" stop-color="#ffd77a"/></linearGradient></defs>' +
    '<circle class="lv-lanterne-halo" cx="60" cy="90" r="58" fill="url(#' + k + 'h)"/>' +
    '<circle cx="60" cy="13" r="8.5" fill="none" stroke="' + K + '" stroke-width="7"/><circle cx="60" cy="13" r="8.5" fill="none" stroke="#f5b945" stroke-width="3"/>' +
    '<path d="M34 46 Q36 25 60 21 Q84 25 86 46 Z" fill="url(#' + k + 'o)" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M44 34 Q50 27 60 26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
    '<rect x="28" y="44" width="64" height="11" rx="4" fill="url(#' + k + 'o)" stroke="' + K + '" stroke-width="4"/>' +
    '<path d="M36 55 H84 L80 121 H40 Z" fill="url(#' + k + 'v)" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path class="lv-lanterne-flamme" d="M60 72 C71 87 71 100 60 109 C49 100 49 87 60 72 Z" fill="#ff9a2e" stroke="' + K + '" stroke-width="2.5"/>' +
    '<path d="M60 87 C65 94 64 101 60 104 C56 101 55 94 60 87 Z" fill="#fff3c4"/>' +
    '<path d="M48 55 L46 121 M72 55 L74 121" stroke="' + K + '" stroke-width="6.5"/><path d="M48 55 L46 121 M72 55 L74 121" stroke="#f5b945" stroke-width="2.8"/>' +
    '<path d="M41 62 L39.5 104" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>' +
    '<rect x="32" y="119" width="56" height="12" rx="4" fill="url(#' + k + 'o)" stroke="' + K + '" stroke-width="4"/>' +
    '<path d="M40 131 H80 L74 146 H46 Z" fill="url(#' + k + 'o)" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<circle cx="60" cy="125" r="3" fill="#fff3c4" stroke="' + K + '" stroke-width="1.5"/>' +
    '<path class="lv-lanterne-eclat" d="M16 38 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z M103 70 l1.8 4.5 4.5 1.8 -4.5 1.8 -1.8 4.5 -1.8 -4.5 -4.5 -1.8 4.5 -1.8z M98 128 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4z" fill="#fff3c4" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/>' +
    '</svg>';
}

/* ⏭️ Les codes des moments : un cadre identique par moment (logo et nom en haut, les trois dessins du code dessous,
   l'état « maintenant / le prochain » sur une étiquette au même coin), une petite teinte par moment ; le bouton pour
   passer au moment suivant sous les cadres (dans un cadre, il le rendrait plus grand que les autres). */
var AU = {matin:'au matin', apresmidi:'à l\'après-midi', soir:'au soir', nuit:'à la nuit'};
var TEINTE = {matin:'#ffc6a6', apresmidi:'#ffdd6e', soir:'#e3abef', nuit:'#a7b8ff'};
var ETAT = {passe:'✔', maintenant:'📍 Maintenant', suivant:'⏭️ Le prochain'};
function codesMoments(E, P){
  var prochain = null;
  var s = '<ol class="lv-moments n' + E.moments.length + '">';
  E.moments.forEach(function(m, i){
    var mo = D.MOMENTS[m], st = i < P.moment ? 'passe' : i === P.moment ? 'maintenant' : i === P.moment + 1 ? 'suivant' : 'plus-tard';
    if(st === 'suivant') prochain = {m:m, mo:mo};
    s += '<li class="lv-mo ' + st + '" style="--t:' + (TEINTE[m] || '#e9d8b0') + '">' +
      '<div class="lv-mo-tete"><span class="lv-mo-ic" aria-hidden="true">' + mo.ic + '</span><b>' + esc(mo.nom) + '</b></div>' +
      '<div class="lv-mo-code">' + (i === 0 ? '<span class="lv-depart">🏁 Le départ</span>' : M.codeHTML(M.code('moment:' + i))) + '</div>' +
      (ETAT[st] ? '<span class="lv-mo-badge">' + ETAT[st] + '</span>' : '') + '</li>';
  });
  s += '</ol>';
  if(prochain && P.etape === 'jeu') s += '<button class="btn grand lv-passer" data-act="moment-suivant">' + prochain.mo.ic + ' Passer ' + (AU[prochain.m] || 'au moment suivant') + '</button>';
  if(P.moment >= E.moments.length - 1){
    var t2 = 'C\'est le dernier moment. Quand l\'équipe est prête, accuse !';
    s += '<div class="lv-fin-jour"><p>🌙 ' + esc(t2) + ' ' + lire(t2) + '</p><button type="button" class="btn" data-lv="aller" data-id="accusation">⚖️ L\'accusation ›</button></div>';
  }
  /* (plus de code pour rejoindre l'enquête suivante, Romain, 4 novembre, 20 h 41 : chacun touche le bouton « Enquête N ») */
  var trouves = M.objetsTrouves ? M.objetsTrouves() : '';
  if(trouves.indexOf('b-objet-code') >= 0) s += '<div class="lv-trouves">' + trouves + '</div>';
  return s;
}

/* 💡 Donner une action : la réserve du Sage (le bouton était dans son Carnet). Même bouton, même action
   « reserve » (moteur-actions.js : la fenêtre où l'on choisit l'équipier). Une ampoule par action de la réserve. */
function donnerAction(P){
  var r = M.reserve(), max = Math.max(M.reserveMax(), r);
  var t = 'Un équipier a besoin d\'une action de plus ? Donne-lui une action de ta réserve.';
  var s = '<p class="lv-intro centre">' + esc(t) + ' ' + lire(t) + '</p>';
  s += '<div class="lv-reserve" role="img" aria-label="Ta réserve : encore ' + r + ' action' + (r > 1 ? 's' : '') + ' sur ' + max + '">';
  for(var k = 0; k < max; k++) s += '<span class="lv-ampoule' + (k < r ? ' pleine' : '') + '" aria-hidden="true"><span>💡</span></span>';
  s += '</div>';
  if(P.etape === 'jeu') s += '<button class="btn magie grand lv-donner" data-act="reserve">💡 Donner une action (' + r + ')</button>';
  return s;
}

/* ⚖️ L'accusation */
var IC_Q = {qui:'👤', ou:'📍', quoi:'🤝', pourquoi:'❓'};
function accusation(E, P){
  var dims = ['qui', 'ou', 'quoi', 'pourquoi'].filter(function(d){ return E[d] && E[d].titre; });
  var t = 'Parlez-en tous ensemble. Quand toute l\'équipe est d\'accord, accuse !';
  var q = dims.map(function(d){ return E[d].titre; }).join(' ');
  var s = '<div class="lv-acc-haut"><div class="lv-balance" aria-hidden="true">⚖️</div><p class="lv-intro">' + esc(t) + ' ' + lire(t + ' ' + q) + '</p></div>';
  s += '<ul class="lv-questions">' + dims.map(function(d){ return '<li><span aria-hidden="true">' + IC_Q[d] + '</span><b>' + esc(E[d].titre) + '</b></li>'; }).join('') + '</ul>';
  /* (plus de verrou ni de « petit matin », Romain, 5 novembre, 01 h 36 : le Sage accuse quand il veut, à n'importe quel moment) */
  s += '<button class="btn grand lv-accuser" data-act="accuser">⚖️ Accuser</button>';
  s += M.coeursHTML ? M.coeursHTML() : '';
  /* les suspects : ceux que le Sage a barrés dans son tableau sont grisés (ils restent choisissables à l'accusation) */
  s += '<div class="lv-suspects">' + ((E.qui && E.qui.choix) || []).map(function(id){
    var raye = (P.raye || []).indexOf(id) >= 0 || !!(M.tableauRaye && M.tableauRaye('qui', id));
    return '<span class="lv-suspect' + (raye ? ' raye' : '') + '"><span class="lv-suspect-img">' + portrait(id) + '</span><small>' + esc((D.PNJ[id] || {}).court || id) + '</small></span>';
  }).join('') + '</div>';
  return s;
}

/* ---------- Une page « un peu obligatoire » (p.obligatoire ; enquête 2 : 📣 Rassembler le village, la nuit, Romain, 5 novembre, 01 h 36) ----------
   Tant qu'elle n'est pas faite (et qu'elle est ouverte à ce moment), le Grand Livre s'ouvre dessus : quand la tablette du Sage passe à ce
   moment (passer-moment, plus bas), et chaque fois qu'il revient sur son livre (un autre onglet, le village, la page rechargée…).
   Jamais pendant qu'il le lit : il peut toujours tourner les pages, et rien ne boucle si quelque chose rate. */
function pageObligatoire(){
  var E = M.E(), P = M.P();
  if(!E || !P || P.etape !== 'jeu' || M.role() !== 'sage') return null;
  var p = (E.pages || []).filter(function(x){ return x.obligatoire && !x.dans && !P.pages[x.id] && (!x.moments || M.momentOk(x.moments)) && (!x.besoin || M.besoinOk(x.besoin)); })[0];
  return p ? p.id : null;
}
M.pageObligatoire = pageObligatoire;

/* ---------- L'onglet ---------- */
var BATI = null;   /* ce que la dernière vue a préparé, pour le montage */
M.livrePlein = function(){ return M.role() === 'sage' && !!M.E() && !!M.P(); };
M.livreHTML = function(){
  var P = M.P(), L = pagesDuLivre(), n = L.length;
  if(UI.livreE !== P.id){ UI.livreE = P.id; UI.livrePage = L[0].id; UI.livreDefil = {}; }
  /* le livre n'était pas à l'écran au rendu d'avant : il s'ouvre, sur la page obligatoire s'il y en a une */
  if(!UI.livreAffiche){ var ob = pageObligatoire(); if(ob && indexDe(L, ob) >= 0) UI.livrePage = ob; }
  var i = indexDe(L, UI.livrePage); if(i < 0) i = 0;
  UI.livrePage = L[i].id;
  BATI = {L:L, i:i};
  var s = '<div id="livre-ici" class="lv b-atelier-plein"><div class="lv-pages">';
  L.forEach(function(p, k){
    s += '<section class="lv-page' + (k === i ? ' on' : '') + (pagePleineBlanche(p) ? ' blanc' + (P.pages[p.id] ? '' : ' vierge') : '') + '" data-i="' + k + '" data-id="' + esc(p.id) + '" aria-label="Page ' + (k + 1) + ' sur ' + n + ' : ' + esc(p.titre) + '" aria-hidden="' + (k === i ? 'false' : 'true') + '">' +
      '<div class="lv-feuille">' + (k === i ? '<div class="lv-contenu">' + contenu(p) + '</div>' : '') + '</div><i class="lv-ombre" aria-hidden="true"></i></section>';
  });
  s += '</div>' +
    '<button type="button" class="lv-coin g" data-lv="prec" aria-label="Page précédente"' + (i > 0 ? '' : ' hidden') + '><span>‹</span></button>' +
    '<button type="button" class="lv-coin d" data-lv="suiv" aria-label="Page suivante"' + (i < n - 1 ? '' : ' hidden') + '><span>›</span></button>' +
    '<button type="button" class="lv-num" data-lv="sommaire" aria-label="Sommaire du Grand Livre" aria-expanded="false"><span class="lv-num-ic" aria-hidden="true">' + L[i].ic + '</span><b>' + (i + 1) + '</b>&nbsp;/&nbsp;' + n + '</button>' +
    '<nav class="lv-sommaire" hidden aria-label="Sommaire">' + L.map(function(p, k){
      return '<button type="button" data-lv="aller" data-i="' + k + '" class="' + (k === i ? 'on' : '') + '"><span aria-hidden="true">' + p.ic + '</span><b>' + esc(p.titre) + (fermee(p) ? ' 🔒' : '') + '</b><small>' + (k + 1) + '</small></button>';
    }).join('') + '</nav></div>';
  return s;
};

/* ---------- Le livre monté : tourner les pages ---------- */
var V = null;
function monter(){
  var ici = document.getElementById('livre-ici');
  if(!ici || !BATI){ BATI = null; return; }
  if(window.scrollY) window.scrollTo(0, 0);
  V = {ici:ici, L:BATI.L, i:BATI.i, n:BATI.L.length, pages:[].slice.call(ici.querySelectorAll('.lv-page')), bati:{}, T:null, G:null, minut:[], anims:[]};
  BATI = null;
  V.bati[V.i] = true;
  ajuster();
  V.resize = function(){ ajuster(); };
  V.clavier = clavier;
  window.addEventListener('resize', V.resize);
  document.addEventListener('keydown', V.clavier);
  ici.addEventListener('pointerdown', bas);
  ici.addEventListener('pointermove', bouge);
  ici.addEventListener('pointerup', haut);
  ici.addEventListener('pointercancel', annule);
  ici.addEventListener('click', clic, true);
  defiler(V.i);
  vuPage(V.L[V.i]);
  V.minut.push(setTimeout(function(){ voisines(V && V.i); }, 40));
  indice();
  try{ reprendreVerser(); }catch(e){ console.error(e); }
}
function demonter(){
  if(!V) return;
  try{ arreterVerser(); }catch(e){}
  try{ garderDefil(); }catch(e){}
  V.minut.forEach(clearTimeout); arreterIndice();
  window.removeEventListener('resize', V.resize);
  document.removeEventListener('keydown', V.clavier);
  V = null;
}
function ajuster(){
  if(!V) return;
  var ici = V.ici, nav = document.querySelector('.b-onglets'), b = nav ? nav.offsetHeight : 0;
  ici.style.height = Math.max(220, Math.round(window.innerHeight - (ici.getBoundingClientRect().top + window.scrollY) - b)) + 'px';
  V.w = ici.clientWidth || window.innerWidth;
}
function feuille(k){ return V.pages[k] && V.pages[k].querySelector('.lv-feuille'); }
function remplir(k){
  if(!V || k === null || k === undefined || k < 0 || k >= V.n || V.bati[k]) return;
  var f = feuille(k); if(!f) return;
  try{ f.innerHTML = '<div class="lv-contenu">' + contenu(V.L[k]) + '</div>'; }catch(e){ console.error(e); f.innerHTML = '<div class="lv-contenu">' + tete(V.L[k]) + '</div>'; }
  V.bati[k] = true;
  defiler(k);
}
function voisines(k){ if(!V || k === null || k === undefined) return; remplir(k + 1); remplir(k - 1); }
function defiler(k){ var f = feuille(k), d = UI.livreDefil && UI.livreDefil[V.L[k].id]; if(f && d) f.scrollTop = d; }
function garderDefil(){
  UI.livreDefil = UI.livreDefil || {};
  V.L.forEach(function(p, k){ if(V.bati[k]){ var f = feuille(k); if(f) UI.livreDefil[p.id] = f.scrollTop; } });
}
/* Une page vue : pour les missions (« lu ») et le vérificateur ; une page qui donne un code le met dans « Codes à donner » */
function vuPage(p){
  var P = M.P(); if(!P || !p) return;
  var ch = false, k = 'page:' + p.id;
  if(!P.vus[k]){ P.vus[k] = 1; ch = true; }
  var Ep = pageE(p.id);
  if(Ep && Ep.donne && !Ep.besoin && !Ep.action && !Ep.mj && !Ep.obligatoire && !Ep.moments && !P.objets['_' + Ep.donne]){   /* (le rassemblement : son code seulement une fois le village rassemblé) */
    P.objets['_' + Ep.donne] = true; ch = true;
    if(V){ var c = indexDe(V.L, 'codes'); if(c >= 0 && c !== V.i) V.bati[c] = false; }   /* la page des codes se redessinera */
  }
  if(ch) M.sauver();
}
function montrer(i){
  if(!V) return;
  var avant = V.i;
  V.pages.forEach(function(pg, k){ pg.classList.toggle('on', k === i); pg.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
  V.i = i; UI.livrePage = V.L[i].id;
  var n = V.ici.querySelector('.lv-num');
  if(n){ n.querySelector('b').textContent = i + 1; n.querySelector('.lv-num-ic').textContent = V.L[i].ic; }
  V.ici.querySelector('.lv-coin.g').hidden = i <= 0;
  V.ici.querySelector('.lv-coin.d').hidden = i >= V.n - 1;
  [].forEach.call(V.ici.querySelectorAll('.lv-sommaire button'), function(b, k){ b.classList.toggle('on', k === i); });
  if(i !== avant){
    vuPage(V.L[i]);
    if(!(M.S.options || {}).livreTourne){ M.S.options = M.S.options || {}; M.S.options.livreTourne = true; M.sauver(); arreterIndice(); }
    V.minut.push(setTimeout(function(){ voisines(V && V.i); }, 30));
  }
}
function preparer(sens, cible){
  remplir(cible);
  var cur = V.pages[V.i], dest = V.pages[cible];
  var T = {sens:sens, cible:cible, haut:sens > 0 ? cur : dest, bas:sens > 0 ? dest : cur, p:0};
  V.pages.forEach(function(pg){ pg.classList.remove('on', 'lv-haut', 'lv-bas'); });
  T.haut.classList.add('lv-haut'); T.bas.classList.add('lv-bas');
  T.oh = T.haut.querySelector('.lv-ombre'); T.ob = T.bas.querySelector('.lv-ombre');
  [T.haut, T.oh, T.ob].forEach(function(el){ el.style.transition = 'none'; });
  V.ici.classList.add('lv-tourne');
  V.T = T;
  poser(0);
  return T;
}
function poser(p){
  var T = V && V.T; if(!T) return;
  T.p = p;
  var a = T.sens > 0 ? -ANG * p : -ANG * (1 - p), f = Math.min(1, Math.abs(a) / 90);
  T.haut.style.transform = 'rotateY(' + a.toFixed(2) + 'deg)';
  T.oh.style.opacity = (0.6 * f).toFixed(3);
  T.ob.style.opacity = (0.45 * (1 - f)).toFixed(3);
}
var rafP = null, rafId = 0;
function poserBientot(p){ rafP = p; if(rafId) return; rafId = requestAnimationFrame(function(){ rafId = 0; if(rafP !== null) poser(rafP); rafP = null; }); }
function lancer(fini, duree){
  var T = V && V.T; if(!T) return;
  if(rafId){ cancelAnimationFrame(rafId); rafId = 0; if(rafP !== null) poser(rafP); rafP = null; }
  duree = calme() ? 1 : Math.max(160, duree || DUREE);
  void T.haut.offsetWidth;   /* la position de départ est bien posée avant l'animation */
  var tr = 'transform ' + duree + 'ms cubic-bezier(.3,.6,.35,1), opacity ' + duree + 'ms ease-out';
  [T.haut, T.oh, T.ob].forEach(function(el){ el.style.transition = tr; });
  T.fini = fini;
  poser(fini ? 1 : 0);
  clearTimeout(T.minuteur);
  T.minuteur = setTimeout(terminer, duree + 40);
}
function terminer(){
  var T = V && V.T; if(!T) return;
  V.T = null;
  [T.haut, T.oh, T.ob].forEach(function(el){ el.style.transition = ''; el.style.transform = ''; el.style.opacity = ''; });
  T.haut.classList.remove('lv-haut'); T.bas.classList.remove('lv-bas');
  V.ici.classList.remove('lv-tourne');
  montrer(T.fini ? T.cible : V.i);
}
function allerA(j, instant){
  if(!V || V.T || j === V.i || j < 0 || j >= V.n) return;
  fermerSommaire(); arreterIndice();
  if(instant){ remplir(j); montrer(j); return; }
  preparer(j > V.i ? 1 : -1, j);
  M.son('feuille');   /* une vraie page de papier (moteur-base.js) */
  lancer(true);
}
function tourner(sens){
  if(!V || V.T) return;
  var j = V.i + sens;
  if(j < 0 || j >= V.n){ rebond(sens); return; }
  allerA(j);
}
function rebond(sens){
  var pg = V.pages[V.i]; if(!pg || !pg.animate || calme()) return;
  try{ pg.animate([{transform:'none'}, {transform:'translateX(' + (sens > 0 ? -16 : 16) + 'px)'}, {transform:'none'}], {duration:280, easing:'ease-out'}); }catch(e){}
}
/* Le doigt : glisser pour tourner (la page suit le doigt), lâcher pour finir ou revenir */
function bas(e){
  if(!V || V.T) return;
  if(e.pointerType === 'mouse' && e.button !== 0) return;
  if(e.target.closest('.lv-sommaire, input, textarea, select')) return;
  V.G = {id:e.pointerId, x:e.clientX, y:e.clientY, actif:false, hist:[[e.clientX, performance.now()]]};
}
function bouge(e){
  var G = V && V.G; if(!G || e.pointerId !== G.id) return;
  var dx = e.clientX - G.x, dy = e.clientY - G.y;
  if(!G.actif){
    if(Math.abs(dx) < 14){ if(Math.abs(dy) > 14) V.G = null; return; }
    if(Math.abs(dx) < Math.abs(dy) * 1.2){ V.G = null; return; }
    G.actif = true; G.sens = dx < 0 ? 1 : -1;
    fermerSommaire(); arreterIndice();
    var j = V.i + G.sens;
    if(j < 0 || j >= V.n) G.bord = true; else preparer(G.sens, j);
    try{ V.ici.setPointerCapture(e.pointerId); }catch(er){}
  }
  G.hist.push([e.clientX, performance.now()]); if(G.hist.length > 6) G.hist.shift();
  if(e.cancelable) e.preventDefault();
  if(G.bord){ V.pages[V.i].style.transform = 'translateX(' + (dx * 0.16).toFixed(1) + 'px)'; return; }
  var w = (V.w || 360) * 0.8, p = G.sens > 0 ? -dx / w : dx / w;
  poserBientot(Math.max(0, Math.min(1, p)));
}
function vitesse(G){
  var h = G.hist; if(h.length < 2) return 0;
  var a = h[0], b = h[h.length - 1], dt = b[1] - a[1];
  return dt > 0 ? (b[0] - a[0]) / dt : 0;
}
function haut(e, annuler){
  var G = V && V.G; if(!G || e.pointerId !== G.id) return;
  V.G = null;
  if(!G.actif) return;
  V.bloque = Date.now();   /* le « clic » qui suit un glisser ne touche rien */
  if(G.bord){
    var pg = V.pages[V.i];
    pg.style.transition = 'transform .25s ease-out'; pg.style.transform = '';
    setTimeout(function(){ pg.style.transition = ''; }, 280);
    rebond(G.sens);
    return;
  }
  var v = vitesse(G), p = V.T ? V.T.p : 0;
  var vers = G.sens > 0 ? -v : v;   /* > 0 : dans le sens de la page */
  var ok = !annuler && ((p > 0.3 && vers > -0.3) || vers > 0.35);
  if(ok) M.son('feuille');
  lancer(ok, Math.round(DUREE * (ok ? 1 - p : p)) + 120);
}
function annule(e){ haut(e, true); }
function clavier(e){
  if(!V || UI.modal) return;
  var mj = document.getElementById('mj-plein'); if(mj && !mj.hidden && !mj.classList.contains('mj-cache')) return;   /* (un mini-jeu en pause : le livre se feuillette) */
  if(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if(e.key === 'ArrowRight' || e.key === 'PageDown'){ e.preventDefault(); tourner(1); }
  else if(e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); tourner(-1); }
}
function basculerSommaire(){
  var s = V.ici.querySelector('.lv-sommaire'), b = V.ici.querySelector('.lv-num');
  s.hidden = !s.hidden; b.setAttribute('aria-expanded', s.hidden ? 'false' : 'true');
  if(!s.hidden){ var on = s.querySelector('.on'); if(on && on.scrollIntoView) try{ on.scrollIntoView({block:'nearest'}); }catch(e){} }
  M.son('clic');
}
function fermerSommaire(){ if(!V) return; var s = V.ici.querySelector('.lv-sommaire'); if(s && !s.hidden){ s.hidden = true; V.ici.querySelector('.lv-num').setAttribute('aria-expanded', 'false'); } }
function clic(e){
  if(!V) return;
  /* le clic que le navigateur envoie juste après un glisser (même geste) ne touche rien ; un vrai toucher qui suit, si */
  if(V.bloque && Date.now() - V.bloque < 150){ V.bloque = 0; e.stopPropagation(); e.preventDefault(); return; }
  if(!e.target.closest('.lv-sommaire, .lv-num')) fermerSommaire();
  var el = e.target.closest('[data-lv]');
  if(!el || !V.ici.contains(el)) return;
  e.stopPropagation(); e.preventDefault();
  var a = el.dataset.lv;
  if(a === 'suiv') tourner(1);
  else if(a === 'prec') tourner(-1);
  else if(a === 'sommaire') basculerSommaire();
  else if(a === 'aller'){ var k = el.dataset.i !== undefined ? +el.dataset.i : indexDe(V.L, el.dataset.id); if(k >= 0) allerA(k); }
  else if(a === 'blanche') toucherBlanche(el);
}
/* Toucher la page blanche : avec l'encre de l'Alchimiste, elle parle ; sinon, les reflets frémissent (et la fiole d'encre passe comme un fantôme) */
function toucherBlanche(el){
  var P = M.P(), id = el.dataset.id, p = pageE(id);
  if(!p || P.pages[id]) return;
  if(M.besoinOk(p.besoin)){
    if(p.verser && !p.mj){ if(!(M.tutoPermet && !M.tutoPermet('ouvrir-page', {id:id}))) verser(el, p); else M.A['ouvrir-page']({dataset:{id:id}}); return; }   /* (le tutoriel refuse ? ouvrir-page le dit) */
    UI.livreRevele = id; M.son('magie');
    M.A['ouvrir-page']({dataset:{id:id}});
    return;
  }
  M.son('tic');
  if(calme() || !el.animate) return;
  try{
    var r = el.querySelector('.lv-reflets'), f = el.querySelector('.lv-fantome');
    if(r) r.animate([{opacity:1}, {opacity:2.2, filter:'saturate(1.6)'}, {opacity:1}], {duration:900, easing:'ease-out'});
    if(f) f.animate([{opacity:0, transform:'translate(-50%,-50%) scale(.8)'}, {opacity:.22, transform:'translate(-50%,-50%) scale(1)'}, {opacity:0, transform:'translate(-50%,-50%) scale(1.15)'}], {duration:1300, easing:'ease-in-out'});
  }catch(er){}
}
/* ---------- 🫗 Verser l'encre sur la page blanche (Romain, 13 novembre : « il est juste censé mettre la potion révélatrice sur la page » ;
   plus de mini-jeu ; « quand on clique sur la page blanche, une sorte de potion renversée se verse dessus ; le Sage doit déplacer la potion,
   et au fur et à mesure qu'il descend, ça révèle la page ») ----------
   La fiole se renverse en haut de la page, une flaque d'encre s'y pose. Le Sage la fait glisser avec le doigt : partout où l'encre passe,
   le papier se mouille et le dessin caché apparaît. Arrivée tout en bas : toute la page se révèle, puis la découverte s'ouvre (ouvrir-page,
   qui donne le code). Rien ne se rate. Une page qui le fait : p.verser:true (e1.js, la page blanche).
   Robots : la flaque est .lv-vs-goutte.prete (la glisser jusqu'en bas), ou M.verserFini() d'un coup. */
var VS = null;
function verser(el, p){
  if(VS && VS.id === p.id && VS.el.isConnected) return;
  var f = el.closest('.lv-feuille'); if(!f || !p) return;
  arreterVerser();
  var c = (D.POTIONS.revelatrice || {}).c || '#8a5cff', dessin = p.donne === 'info:carte' || p.id === 'mystere' ? carteForet() : glyphes();
  var o = document.createElement('div');
  o.className = 'lv-vs';
  o.style.setProperty('--p', c);
  o.innerHTML = '<div class="lv-vs-fond"><div class="lv-vs-dessin' + (p.donne === 'info:carte' || p.id === 'mystere' ? '' : ' lettre') + '">' + dessin + '</div></div><canvas class="lv-vs-voile" aria-hidden="true"></canvas>' +
    '<span class="lv-vs-fiole" aria-hidden="true">' + fiole(c, D.POTIONS.revelatrice.ic) + '</span><i class="lv-vs-filet" aria-hidden="true"></i>' +
    '<span class="lv-vs-goutte" role="button" aria-label="L\'encre : fais-la couler jusqu\'en bas de la page"><svg viewBox="0 0 120 100" aria-hidden="true">' +
      '<path class="lv-vs-tache" d="M60 8 C84 6 108 22 110 46 C112 70 94 92 64 92 C36 94 10 80 10 52 C10 26 34 10 60 8 Z"/>' +
      '<path d="M36 32 C44 23 56 20 66 22" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"/><circle cx="84" cy="34" r="5" fill="#fff" opacity=".45"/></svg></span>' +
    '<span class="lv-vs-fleches" aria-hidden="true"><i></i><i></i><i></i></span>';
  f.appendChild(o);
  f.scrollTop = 0;
  VS = {id:p.id, el:o, f:f, p:p, cv:o.querySelector('canvas'), g:o.querySelector('.lv-vs-goutte'), x:0, y:0, fini:false, tenu:null, minut:[]};
  taillerVerser();
  var deja = UI.versee === p.id;   /* déjà renversée (le livre s'est redessiné) : la flaque est là tout de suite */
  UI.versee = p.id;
  VS.x = VS.w / 2; VS.y = Math.max(VS.R * 0.95, VS.h * 0.15);
  poserGoutte();
  VS.g.addEventListener('pointerdown', vsBas);
  VS.g.addEventListener('pointermove', vsBouge);
  VS.g.addEventListener('pointerup', vsHaut);
  VS.g.addEventListener('pointercancel', vsHaut);
  o.addEventListener('pointerdown', function(e){ e.stopPropagation(); });   /* le livre ne tourne pas la page sous le doigt */
  VS.resize = function(){ taillerVerser(true); };
  window.addEventListener('resize', VS.resize);
  if(deja || calme()){ o.classList.add('prete'); VS.g.classList.add('prete'); essuyer(VS.x, VS.y, VS.x, VS.y); return; }
  /* la fiole se renverse, l'encre coule, la flaque s'étale */
  M.son('magie');
  o.classList.add('verse');
  VS.minut.push(setTimeout(function(){ if(!VS) return; M.son('plouf'); essuyer(VS.x, VS.y, VS.x, VS.y); }, 950));
  VS.minut.push(setTimeout(function(){ if(!VS) return; o.classList.add('prete'); VS.g.classList.add('prete'); }, 1500));
}
function taillerVerser(garder){
  if(!VS) return;
  var r = VS.el.getBoundingClientRect(), k = Math.min(2, window.devicePixelRatio || 1);
  var w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
  if(garder && VS.w === w && VS.h === h) return;
  var ancien = garder && VS.w ? {w:VS.w, h:VS.h} : null;
  VS.w = w; VS.h = h; VS.R = Math.max(44, Math.min(w, h) * 0.19);
  VS.cv.width = Math.round(w * k); VS.cv.height = Math.round(h * k);
  VS.cv.style.width = w + 'px'; VS.cv.style.height = h + 'px';
  var g = VS.cv.getContext('2d'); VS.ctx = g;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#fdfcff'; g.fillRect(0, 0, w, h);
  var gr = g.createLinearGradient(0, 0, w, h);   /* de légers reflets bleu-violet, comme la page blanche */
  gr.addColorStop(0, 'rgba(150,130,255,.08)'); gr.addColorStop(.5, 'rgba(150,130,255,0)'); gr.addColorStop(1, 'rgba(120,170,255,.09)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  VS.g.style.width = Math.round(VS.R * 2.2) + 'px'; VS.g.style.height = Math.round(VS.R * 1.85) + 'px';
  if(ancien){ VS.x = VS.x * w / ancien.w; VS.y = VS.y * h / ancien.h; essuyer(VS.x, VS.y, VS.x, VS.y); poserGoutte(); }
}
function poserGoutte(){
  if(!VS) return;
  VS.g.style.transform = 'translate(' + (VS.x - VS.R * 1.1).toFixed(1) + 'px,' + (VS.y - VS.R * 0.92).toFixed(1) + 'px)';
  var fl = VS.el.querySelector('.lv-vs-fleches');
  if(fl) fl.style.transform = 'translate(' + VS.x.toFixed(1) + 'px,' + (VS.y + VS.R * 1.05).toFixed(1) + 'px)';
  var fi = VS.el.querySelector('.lv-vs-fiole'), ft = VS.el.querySelector('.lv-vs-filet');   /* la fiole se renverse juste au-dessus de la flaque */
  if(fi) fi.style.left = VS.x + 'px';
  if(ft){ ft.style.left = VS.x + 'px'; ft.style.height = Math.max(10, VS.y - 70) + 'px'; }
}
/* là où l'encre passe, la page devient transparente : on voit le dessin (un pinceau rond aux bords doux) */
function essuyer(x0, y0, x1, y1){
  if(!VS || !VS.ctx) return;
  var g = VS.ctx, R = VS.R, d = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)), n = Math.max(1, Math.ceil(d / (R * 0.25)));
  g.globalCompositeOperation = 'destination-out';
  for(var i = 0; i <= n; i++){
    var x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    var gr = g.createRadialGradient(x, y, R * 0.35, x, y, R);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.7, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
}
function vsBas(e){
  if(!VS || VS.fini || !VS.g.classList.contains('prete')) return;
  e.stopPropagation(); if(e.cancelable) e.preventDefault();
  var r = VS.el.getBoundingClientRect();
  VS.tenu = {id:e.pointerId, dx:VS.x - (e.clientX - r.left), dy:VS.y - (e.clientY - r.top)};
  try{ VS.g.setPointerCapture(e.pointerId); }catch(er){}
  VS.g.classList.add('tenue'); VS.el.classList.add('touchee');
  M.son('bulle');
}
function vsBouge(e){
  var T = VS && VS.tenu; if(!T || e.pointerId !== T.id || VS.fini) return;
  e.stopPropagation(); if(e.cancelable) e.preventDefault();
  var r = VS.el.getBoundingClientRect(), R = VS.R;
  var x = Math.max(R * 0.5, Math.min(VS.w - R * 0.5, e.clientX - r.left + T.dx)), y = Math.max(R * 0.5, Math.min(VS.h - R * 0.3, e.clientY - r.top + T.dy));
  essuyer(VS.x, VS.y, x, y);
  VS.x = x; VS.y = y; poserGoutte();
  if(!VS.son || performance.now() - VS.son > 280){ VS.son = performance.now(); M.son('tic'); }
  if(VS.y >= VS.h - R * 0.95) finirVerser();
}
function vsHaut(e){
  var T = VS && VS.tenu; if(!T || e.pointerId !== T.id) return;
  e.stopPropagation();
  VS.tenu = null; VS.g.classList.remove('tenue');
  if(V) V.bloque = Date.now();   /* le « clic » qui suit ne touche rien */
}
/* arrivée en bas : toute la page se révèle, puis la découverte (le code du plan) */
function finirVerser(){
  if(!VS || VS.fini) return;
  VS.fini = true; VS.tenu = null;
  var id = VS.id;
  VS.el.classList.add('fini'); VS.g.classList.remove('prete', 'tenue');
  M.son('magie');
  setTimeout(function(){
    arreterVerser();
    UI.versee = null;
    UI.livreRevele = id;
    M.A['ouvrir-page']({dataset:{id:id}});
  }, calme() ? 60 : 1300);
}
function arreterVerser(){
  if(!VS) return;
  VS.minut.forEach(clearTimeout);
  window.removeEventListener('resize', VS.resize);
  if(VS.el && VS.el.parentNode && !VS.fini) VS.el.parentNode.removeChild(VS.el);
  VS = null;
}
M.verserFini = function(){ if(VS && !VS.fini){ finirVerser(); return true; } return false; };
/* le livre s'est redessiné pendant qu'on versait : la flaque revient en haut de la page (la page n'est pas encore révélée) */
function reprendreVerser(){
  if(!V || !UI.versee) return;
  var p = pageE(UI.versee), P = M.P();
  if(!p || P.pages[p.id] || V.L[V.i].id !== p.id){ if(!p || P.pages[p.id]) UI.versee = null; return; }
  var b = V.ici.querySelector('.lv-page.on [data-lv=blanche][data-id="' + p.id + '"]');
  if(b && M.besoinOk(p.besoin)) verser(b, p);
}
/* Premier livre : le coin de la page se soulève tout seul (jusqu'au premier tour de page) */
function indice(){
  if(!V || V.n < 2 || (M.S.options || {}).livreTourne || calme()) return;
  var fois = 0;
  function montrerCoin(){
    if(!V || V.T || V.G || (M.S.options || {}).livreTourne || fois >= 3 || UI.modal) return;
    var j = V.i + 1; if(j >= V.n) return;
    fois++;
    remplir(j);
    var cur = V.pages[V.i], dest = V.pages[j], coin = V.ici.querySelector('.lv-coin.d'), om = cur.querySelector('.lv-ombre');
    if(!cur.animate) return;
    dest.classList.add('lv-bas');
    try{
      var a = cur.animate([{transform:'none'}, {transform:'rotateY(-20deg)', offset:.35}, {transform:'none', offset:.62}, {transform:'rotateY(-9deg)', offset:.82}, {transform:'none'}], {duration:1800, easing:'ease-in-out'});
      V.anims.push(a);
      if(om) V.anims.push(om.animate([{opacity:0}, {opacity:.25, offset:.35}, {opacity:0, offset:.62}, {opacity:.12, offset:.82}, {opacity:0}], {duration:1800}));
      if(coin) V.anims.push(coin.animate([{transform:'none'}, {transform:'scale(1.7)', offset:.35}, {transform:'none', offset:.62}, {transform:'scale(1.3)', offset:.82}, {transform:'none'}], {duration:1800, easing:'ease-in-out'}));
      a.onfinish = a.oncancel = function(){ if(!V || !V.T) dest.classList.remove('lv-bas'); };
    }catch(e){ dest.classList.remove('lv-bas'); }
    if(V) V.minut.push(setTimeout(montrerCoin, 6500));
  }
  V.minut.push(setTimeout(montrerCoin, 900));
}
function arreterIndice(){
  if(!V) return;
  (V.anims || []).forEach(function(a){ try{ a.cancel(); }catch(e){} });
  V.anims = [];
}

/* Aller à une page (outils de test, liens) : M.livreAller('accusation') ; instant = sans animation */
M.livreAller = function(id, instant){
  if(!V){ UI.livrePage = id; return false; }
  var k = indexDe(V.L, id); if(k < 0) return false;
  if(k === V.i) return true;
  allerA(k, instant !== false);
  return true;
};
M.livrePage = function(){ return V ? V.L[V.i].id : UI.livrePage || null; };

/* L'ancien onglet de page (robot de test, ancien code) : ouvre cette page du livre */
if(M.A){
  M.A.page = function(el){
    var id = el.dataset.id; UI.livrePage = id;
    vuPage({id:id});
    M.son('feuille'); M.render();
  };
  /* Le Sage passe au moment suivant : s'il y a une page obligatoire à ce moment (le rassemblement, la nuit), le livre s'y ouvre */
  var passer0 = M.A['passer-moment'];
  if(passer0) M.A['passer-moment'] = function(){
    var r = passer0.apply(this, arguments);
    try{
      var ob = pageObligatoire(), P = M.P();
      if(ob && P){
        if(P.onglet !== 'role' || !M.livreAller(ob, true)){ P.onglet = 'role'; UI.livrePage = ob; M.sauver(); M.render(); }
      }
    }catch(e){ console.error(e); }
    return r;
  };
}

/* ---------- M.render enveloppé ---------- */
function cleVue(){
  var P = M.S && M.S.e, S = M.S || {};
  return [M.emplacement ? M.emplacement() : '', UI.ecran, S.heros ? 1 : 0, P ? P.id : '', P ? P.etape : '', P ? P.onglet : '', P && P.fin ? P.fin.etape + ':' + P.fin.slide : '',
    P && P.defaite ? 'd' + P.defaite.slide : '', UI.creaEtape, UI.boutiquePalier, UI.journalE ? UI.journalE.e : ''].join('|');
}
var rendreAvant = M.render, derniere = null, derniereModale = null;
if(typeof rendreAvant === 'function'){
  M.render = function(){
    var app = document.getElementById('app'), voile = document.getElementById('voile'), k = cleVue();
    if(app) app.classList.toggle('b-sans-entree', k === derniere);   /* même écran : pas d'animation d'entrée, pas de clignotement */
    if(voile) voile.classList.toggle('b-sans-entree', !!UI.modal && UI.modal === derniereModale);   /* la même fenêtre qui change (accusation : qui → où…) ne remonte pas */
    derniere = k; derniereModale = UI.modal;
    demonter();
    var r;
    try{ r = rendreAvant.apply(this, arguments); }
    finally{ UI.livreAffiche = !!document.getElementById('livre-ici'); }   /* pour la page obligatoire (M.livreHTML) : le livre est-il à l'écran ? */
    try{ monter(); }catch(e){ console.error(e); }
    return r;
  };
}
})();
