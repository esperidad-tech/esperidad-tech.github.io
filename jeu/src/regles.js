/* ==========================================================
   Brumeval — des règles qu'une enquête allume par un réglage (l'enquête 2, DESIGN-saison1.md § 12.11).
   Les règles du Barde (une seule visite par moment, potion de vérité…) sont dans barde.js ; le rassemblement est une page du Sage (e2.js).
   · Un point qui n'apparaît qu'après un autre (p.visibleSi : [conditions]), ou qui s'en va (p.cacheSi) : les points du moulin, la nuit,
     l'un après l'autre. Un point peut finir sur un choix (p.choix : les points proposés, leur bouton p.choixTxt ; moteur-actions.js).
   · Un point dont le texte change (p.variantes : [{si:[conditions], t, note}], la première qui convient) : le pot du
     Vieux Chêne l'après-midi, après le rassemblement, la nuit. Quand le texte change, le point redevient « à voir »
     (sauf p.varianteFigee : guetter au moulin garde le texte du moment où on l'a vu).
   · L'Alchimiste remplit un flacon dans un lieu (L.alchimiste.echantillon {objet, t, moments}) : un objet à analyser.
   · Une trouvaille en cueillant (L.alchimiste.trouvaille {moments, ic, titre, t, note, donne}) : le champ rasé.
   · (Plus de verrou de l'accusation ni de « petit matin », Romain, 5 novembre, 01 h 36 : le Sage accuse quand il veut.
     Un vieux P.aube d'une sauvegarde ne sert plus à rien.)
   · Les vieilles sauvegardes de l'ancienne enquête 2 (le Corbeau) : une enquête 2 en cours repart de zéro (nouvelle histoire).
   Chargé APRÈS moteur-actions.js, barde.js et livre.js (et avant tuto.js).
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.A) return;
var A = M.A, UI = M.UI;
function esc(s){ return M.esc(s); }
function lire(t, qui){ return M.lireBtn(t, qui); }

/* ---------- 1. Les variantes de texte d'un point ---------- */
function varianteDe(p){
  if(!p || !p.variantes) return -1;
  for(var i = 0; i < p.variantes.length; i++) if(M.besoinOk(p.variantes[i].si)) return i;
  return -1;
}
var pv0 = M.pointsVisibles;
M.pointsVisibles = function(lieu, role){
  var l = pv0.apply(this, arguments), P = M.P();
  if(!P) return l;
  /* p.visibleSi (Romain, 23 h 31) : un point qui n'apparaît qu'après un autre (au moulin, la nuit : guetter → la pièce cachée → sous l'alambic) ;
     p.cacheSi : un point qui s'en va (pas encore utilisé) ; un point déjà regardé reste là */
  l = l.filter(function(p){
    if(!p || P.vus[role + ':' + lieu + ':' + p.id]) return true;
    return (!p.visibleSi || M.besoinOk(p.visibleSi)) && !(p.cacheSi && M.besoinOk(p.cacheSi));
  });
  return l.map(function(p){
    if(!p || !p.variantes) return p;
    var i = varianteDe(p), k = role + ':' + lieu + ':' + p.id, vu = P.vus[k + ':var'];
    /* p.varianteFigee (guetter au moulin) : une fois vu, il garde le texte de ce moment-là et ne redevient pas « à voir »
       (un mini-jeu : la découverte arrive après A.point, on note donc ici, à la première relecture, le texte qu'il vient de voir) */
    if(p.varianteFigee && P.vus[k] === 'ok'){ if(vu === undefined) P.vus[k + ':var'] = i; else i = vu; }
    /* le texte a changé : à revoir (sans :var, il vient d'être vu : A.point ci-dessous le note juste après ; sinon il ne restait jamais vu) */
    else if(P.vus[k] === 'ok' && vu !== undefined && vu !== i){ delete P.vus[k]; delete P.vus[k + ':var']; }
    var v = i >= 0 ? p.variantes[i] : null;
    return v ? Object.assign({}, p, {t:v.t || p.t, note:v.note || p.note}) : p;
  });
};
var point0 = A.point;
A.point = function(el){
  var r = point0.apply(this, arguments), P = M.P(), E = M.E(), role = M.role(), l = el.dataset.l, id = el.dataset.id;
  var R = E && E.lieux && E.lieux[l] && E.lieux[l][role], p = R && (R.points || []).filter(function(x){ return x.id === id; })[0];
  var k = role + ':' + l + ':' + id;
  if(P && p && p.variantes && P.vus[k] === 'ok' && P.vus[k + ':var'] === undefined){ P.vus[k + ':var'] = varianteDe(p); M.sauver(); }
  return r;
};

/* ---------- 2. L'Alchimiste : un flacon à remplir, une trouvaille en cueillant ---------- */
function alchi(lieu){ var E = M.E(), L = E && E.lieux && E.lieux[lieu]; return (L && L.alchimiste) || {}; }
var fl0 = M.feuilleLieu;
M.feuilleLieu = function(lieu){
  var s = fl0.apply(this, arguments);
  if(M.role() !== 'alchimiste' || M.verrouLieu(lieu)) return s;
  var X = alchi(lieu).echantillon;
  if(!X || !M.momentOk(X.moments)) return s;
  var E = M.E(), P = M.P(), o = (E.objets || {})[X.objet] || {nom:X.objet, ic:'🧪'}, deja = !!P.recus['obj:' + X.objet];
  var td = 'Tu as déjà ton flacon : il t\'attend sur la table d\'analyse de ton atelier.';
  var b = '<div class="b-ecoute b-echantillon"><h3>' + o.ic + ' ' + esc(o.nom) + '</h3>' +
    (deja ? '<p class="doux">' + esc(td) + ' ' + lire(td) + '</p>' : '<button class="btn grand" data-act="echantillon" data-id="' + esc(lieu) + '">🧪 Remplir un flacon</button>') + '</div>';
  var i = s.indexOf('<div class="b-ce-que-je-sais">');
  return i >= 0 ? s.slice(0, i) + b + s.slice(i) : s + b;
};
A.echantillon = function(el){
  var P = M.P(), E = M.E(), lieu = el.dataset.id, X = alchi(lieu).echantillon;
  if(!P || !X || P.recus['obj:' + X.objet] || M.verrouLieu(lieu) || !M.momentOk(X.moments)) return;
  P.recus['obj:' + X.objet] = true;
  var o = (E.objets || {})[X.objet] || {};
  M.noter('Pris : ' + (o.nom || X.objet) + '. Il t\'attend sur ta table d\'analyse.', o.ic || '🧪');
  M.son('plouf'); M.sauver();
  M.decouvrir({ic:o.ic || '🧪', titre:o.nom || 'Un flacon', t:X.t, retour:'lieu', retourId:lieu});
};
var cueillir0 = A.cueillir;
A.cueillir = function(el){
  var P = M.P(), lieu = el.dataset.id, T = alchi(lieu).trouvaille, avant = P && P.vus['cueilli:' + lieu];
  var r = cueillir0.apply(this, arguments);
  P = M.P();
  if(!P || !T || P.vus['trouvaille:' + lieu] || P.vus['cueilli:' + lieu] !== P.moment || avant === P.moment || !M.momentOk(T.moments)) return r;
  P.vus['trouvaille:' + lieu] = 1;
  if(T.donne) P.objets['_' + T.donne] = true;
  var m = UI.modal && UI.modal.type === 'info' ? (UI.modal.t || '') : '';   /* ce qu'elle a cueilli, à la suite */
  M.sauver();
  M.decouvrir({ic:T.ic || '👀', titre:T.titre || 'Une trouvaille', t:T.t + (m ? ' ' + m : ''), note:T.note, code:T.donne || null});
  return r;
};

/* ---------- 3. (Le verrou de l'accusation et le petit matin : supprimés, Romain, 5 novembre, 01 h 36) ---------- */

/* ---------- 4. Les vieilles sauvegardes de l'ancienne enquête 2 ---------- */
/* Une enquête 2 commencée avec l'ancienne histoire (le Corbeau) n'a plus de sens : elle repart de zéro (le bouton « Enquête 2 » du village).
   Une enquête 2 déjà finie est gardée telle quelle. Les nouvelles parties sont marquées P.histoire = 'riviere'. */
function nouvelleE2(s){
  try{ if(s && s.e && typeof s.e === 'object' && +s.e.id === 2 && s.e.histoire !== 'riviere' && s.e.etape !== 'fin') s.e = null; }catch(e){}
  return s;
}
M.nouvelleE2 = nouvelleE2;
var en0 = M.enqueteNeuve;
M.enqueteNeuve = function(id){ var P = en0.apply(this, arguments); if(+id === 2 && P) P.histoire = 'riviere'; return P; };
var ch0 = M.charger;
M.charger = function(){ return nouvelleE2(ch0.apply(this, arguments)); };
var ls0 = M.lireSauvegarde;
M.lireSauvegarde = function(){ var s = ls0.apply(this, arguments); return s ? nouvelleE2(s) : s; };
if(M.S) nouvelleE2(M.S);

/* ---------- 5. Les petites scènes animées (m.illu, à la place de la grande icône : moteur-actions.js) ----------
   « rassemblement » (enquête 2, Romain 22 h 41 : c'est le SAGE, la nuit) : le Sage arrive en tête au Vieux Chêne avec le village ;
   une ombre se sauve derrière le buisson ; PFFFT, la fumée rouge ; le maire accourt avec Silas (Silas : « Vapeurs toxiques ! »,
   le maire : « Reculez ! ») ; tout le monde s'enfuit en toussant. Des personnages en entier (Romain, 5 novembre, 8 h 59), et la fumée,
   une fois partie, ne s'arrête plus jamais. Une boucle de 11 s en CSS (barde.css, .rs-…) ; figée au moment de la fumée si l'appareil demande moins de mouvement.
   Sur la tablette du Sage : son héros en tête ; ailleurs (le récit tapé en code) : l'étoile du Sage. Un ciel de nuit, la lune, des étoiles. */
var nIllu = 0;
/* Les personnages en entier (Romain, 5 novembre, 8 h 59 : plus de petits ronds avec un visage) : {h: le dessin, ar: largeur / hauteur, k: hauteur relative} */
var HAUT_PNJ = 353;   /* la hauteur du dessin d'un villageois adulte en entier (persos.js, pnj {pied:true}) */
function forme(svg, w0, h0){
  var m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg || ''), w = m ? +m[1] : w0, h = m ? +m[2] : h0;
  return {ar:w / h, h:h};
}
function genRs(id){
  try{
    if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
      var s = Persos.pnj(id, {anime:false, pied:true, id:'rs' + (++nIllu)}), f = forme(s, 200, HAUT_PNJ);
      if(s) return {h:s, ar:f.ar, k:f.h / HAUT_PNJ};
    }
  }catch(e){}
  return {h:'<b>' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</b>', ar:.57, k:1};
}
/* Le Sage : son héros sur sa tablette ; sur les autres (le récit tapé en code), un Sage comme les autres */
function chefRs(){
  try{
    if(window.Persos && Persos.heros){
      var h = M.role() === 'sage' && M.heroObj ? M.heroObj() : (Persos.defaut ? Persos.defaut('sage', 'm') : null);
      if(h){ var s = Persos.heros(h, {vue:'pied', anime:false, fond:false, id:'rsh' + (++nIllu)}), f = forme(s, 300, 440); if(s) return {h:s, ar:f.ar, k:1.16}; }
    }
  }catch(e){}
  return {h:'<b>' + D.ROLES.sage.ic + '</b>', ar:.57, k:1};
}
function personnageRs(p, cls, x, delai, bulle){
  var H = 46;   /* la hauteur d'un villageois adulte : 46 % de l'image */
  return '<span class="rs-gens' + cls + '" style="--x:' + x + '%;--h:' + (H * p.k).toFixed(1) + '%;--ar:' + p.ar.toFixed(3) + (delai != null ? ';animation-delay:' + delai + 's' : '') + '"><i>' + p.h + '</i>' + (bulle || '') + '</span>';
}
var DECOR_RS = '<svg class="rs-decor" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
  '<defs><linearGradient id="rs-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121736"/><stop offset="1" stop-color="#3a3f78"/></linearGradient></defs>' +
  '<rect width="320" height="200" fill="url(#rs-ciel)"/><circle cx="58" cy="40" r="16" fill="#fff4cf"/><circle cx="64" cy="36" r="14" fill="#1a2046"/>' +
  '<g fill="#fff4cf"><circle cx="110" cy="22" r="1.6"/><circle cx="150" cy="44" r="1.2"/><circle cx="270" cy="20" r="1.6"/><circle cx="300" cy="52" r="1.1"/><circle cx="20" cy="74" r="1.2"/><circle cx="128" cy="70" r="1"/></g>' +
  '<path d="M0 132 Q 60 104 130 124 T 320 116 V200 H0 Z" fill="#3f5c48"/><path d="M0 150 Q 90 136 180 148 T 320 144 V200 H0 Z" fill="#33503c"/>' +
  '<path d="M-10 186 Q 90 170 196 160" stroke="#8a7a62" stroke-width="16" fill="none" stroke-linecap="round" opacity=".8"/>' +
  /* le Vieux Chêne : un gros tronc, des racines, un grand feuillage */
  '<path d="M190 162 C 192 140 194 118 192 96 L 222 96 C 220 118 222 140 226 162 C 234 166 240 168 244 172 L 170 172 C 176 168 182 166 190 162 Z" fill="#7a4e2c" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/>' +
  '<path d="M200 110 q 4 20 0 44 M214 104 q -4 26 2 52" stroke="#5e3a1e" stroke-width="2.5" fill="none"/>' +
  '<g stroke="#24182e" stroke-width="3"><circle cx="176" cy="74" r="30" fill="#2f6b3a"/><circle cx="240" cy="72" r="32" fill="#2f6b3a"/><circle cx="208" cy="48" r="36" fill="#3a7d44"/><circle cx="206" cy="86" r="26" fill="#2a5e33"/></g>' +
  '<circle cx="196" cy="40" r="9" fill="#4f9a55"/><circle cx="246" cy="62" r="7" fill="#4f9a55"/>' +
  /* les gros rochers sur le trou */
  '<g stroke="#24182e" stroke-width="2.5"><path d="M182 172 C 180 158 196 152 204 160 C 206 168 200 174 182 172 Z" fill="#8c8aa0"/><path d="M200 174 C 198 156 222 150 228 162 C 232 170 224 176 200 174 Z" fill="#7d7a92"/><path d="M222 174 C 222 162 238 160 242 168 C 244 174 236 176 222 174 Z" fill="#9a98ae"/></g>' +
  '<path d="M190 162 q 6 -4 10 -1 M210 158 q 6 -3 10 0" stroke="#c8c6d8" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  /* le buisson, à droite */
  '<path d="M262 176 C 254 164 262 150 276 152 C 282 140 304 142 306 156 C 318 158 318 176 304 178 Z" fill="#2f7a4c" stroke="#24182e" stroke-width="3"/>' +
  '<circle cx="276" cy="162" r="2.6" fill="#e5484d"/><circle cx="294" cy="158" r="2.6" fill="#e5484d"/>' +
  '</svg>';
var OMBRE_RS = '<svg viewBox="-20 -44 40 48" aria-hidden="true" focusable="false"><path d="M-12 2 C -14 -14 -10 -28 0 -34 C 10 -28 14 -14 12 2 Z" fill="#1d1730"/><circle cx="0" cy="-36" r="8" fill="#1d1730"/><path d="M-11 -2 l-8 6 M11 -2 l8 6" stroke="#1d1730" stroke-width="5" stroke-linecap="round"/></svg>';
var ILLU = {
  rassemblement:function(){
    var gens = ['gaspard', 'margot', 'iris'];
    var s = '<div class="rs-scene" role="img" aria-label="La nuit, le Sage et le village au Vieux Chêne : une fumée rouge sort de sous les branches. Silas crie « Vapeurs toxiques ! », le maire crie « Reculez ! »">' + DECOR_RS;
    s += '<span class="rs-ombre">' + OMBRE_RS + '</span>';
    s += '<span class="rs-fumee">' + [[-14, 0, -16], [2, -6, 0], [16, 2, 14], [-4, 6, -8], [10, -2, 8]].map(function(f, i){ return '<i style="left:' + (50 + f[0] * 2) + '%;top:' + (50 + f[1] * 3) + '%;--dx:' + f[2] + 'px;animation-delay:' + (i * .12).toFixed(2) + 's"></i>'; }).join('') + '</span>';
    /* la fumée sans fin : elle part avec le premier PFFFT (au bout de 4 s) et ne s'arrête plus, même quand la scène recommence */
    s += '<span class="rs-fumee rs-fumee-sans-fin">' + [[-6, -10], [8, 12], [0, -4], [-12, 8], [12, -14], [4, 6], [-2, 16]].map(function(f, i){ return '<i style="left:' + (50 + f[0] * 2) + '%;top:86%;--dx:' + f[1] + 'px;animation-delay:' + (4 + i * .5).toFixed(2) + 's"></i>'; }).join('') + '</span>';
    s += '<b class="rs-pfft">PFFFT !</b>';
    var kof = function(d){ return '<em class="rs-kof" style="animation-delay:' + d + 's">kof !</em>'; };
    s += personnageRs(chefRs(), ' rs-chef', 40, 0, kof(0));
    gens.forEach(function(id, i){ var d = .35 * (i + 1); s += personnageRs(genRs(id), '', 29 - 10.5 * i, d, kof(d)); });
    /* le maire accourt, Silas sur ses talons : c'est Silas qui parle des vapeurs (il y croit), le maire ne dit que des choses vraies */
    s += personnageRs(genRs('grosbec'), ' rs-maire', 73, null, '<em class="rs-bulle">Reculez !</em>');
    s += personnageRs(genRs('silas'), ' rs-silas', 89, null, '<em class="rs-bulle">Vapeurs toxiques !</em>');
    return s + '</div>';
  }
};
M.illustration = function(id){ return ILLU[id] ? ILLU[id]() : ''; };
})();
