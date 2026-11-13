/* ==========================================================
   Brumeval — les écritures à la main de l'enquête 3, dans le Grand Livre du Sage (Romain, 13 novembre)

   Trois pages du Grand Livre (livre.js les appelle ; les données : ecritures-donnees.js, chats.js) :
   · « Le Livre d'or de la fête » (M.livreDorHTML) : « directement dans le Grand Livre du Sage. Le matin, des signatures et des petits
     mots pour Odette, selon le caractère de chacun, et : tout le monde n'a pas encore signé. L'après-midi, un gros bouton jaune :
     tout le monde a signé, donne ce livre à l'Alchimiste. » Le bouton donne le code « Les écritures du village » (la page : e3.js).
   · « La lettre d'Odette » (M.vraieLettreHTML), quand le Barde (ou le Pisteur) l'a obtenue : la vraie lettre, écrite « à la manière
     d'Odette ».
   · « Le carnet d'Odette » (M.carnetOdetteHTML), quand le Barde l'a trouvé chez elle : « écrit avec l'écriture d'Odette, la
     description avec un petit dessin des sept chats, et aussi leurs traces de pas ».
   Aucun texte ne dit que la lettre est fausse : le Sage compare les deux écritures de ses yeux (Romain : les pages « Une drôle de
   lettre », « La lettre et le carnet » et « Qui a écrit la lettre ? » donnaient la solution — retirées).

   M.ecrit(texte, e) : un texte écrit à la main, en HTML. e = {M, t, i, penche, taille, gras, chatO} (ecritures-donnees.js) :
   chaque mot est penché à part (le texte revient à la ligne normalement) ; les « M » sont dessinés (pointus ou ronds), les « t »
   peuvent porter une longue vague, les « i » un petit rond vide ; chatO : un petit chat à côté de chaque « O » (Odette).
   Chargé APRÈS moteur-roles.js, chats.js et ecritures-donnees.js, AVANT livre.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, EC = window.ECRITURES, CH = window.CHATS;
if(!M || !EC) return;
function esc(s){ return M.esc(s); }
function lire(t){ return M.lireBtn(t); }

var M_POINTU = '<svg class="ec-M" viewBox="0 -76 64 80" aria-hidden="true"><path d="M3 0 L12 -70 L31 -12 L48 -70 L60 0" stroke-linejoin="miter" stroke-miterlimit="12"/></svg>';
var M_ROND = '<svg class="ec-M" viewBox="0 -76 64 80" aria-hidden="true"><path d="M3 0 L5 -40 C6 -72 30 -72 31 -36 L31 -10 M31 -36 C32 -72 57 -72 58 -40 L60 0" stroke-linejoin="round"/></svg>';
var VAGUE = '<svg class="ec-vague" viewBox="0 0 40 14" preserveAspectRatio="none" aria-hidden="true"><path d="M1 8 C9 0 15 1 20 7 S31 14 39 5"/></svg>';
var CHATON = '<svg class="ec-chaton" viewBox="-10 -11 20 18" aria-hidden="true"><path d="M-6 -3 L-6.5 -9.5 L-2 -6 M6 -3 L6.5 -9.5 L2 -6"/><ellipse cx="0" cy="-1" rx="6.6" ry="5.4"/><path d="M-2.4 -1.6 v.1 M2.4 -1.6 v.1 M-1 1 l1 1 l1 -1" /></svg>';
function unMot(mot, e){
  var s = '', k, ch;
  for(k = 0; k < mot.length; k++){
    ch = mot[k];
    if(ch === 'M') s += e.M ? M_POINTU : M_ROND;
    else if(ch === 'i' || ch === 'î') s += '<span class="i-sans">ı<span class="pt pt-' + (e.i ? 'rond' : 'point') + '"></span></span>';
    else if(ch === 't' && e.t){ var tt = mot[k + 1] === 't'; s += '<span class="ec-t">' + (tt ? 'tt' : 't') + VAGUE + '</span>'; if(tt) k++; }   /* (« tt » : une seule vague pour les deux) */
    else if(ch === 'O' && e.chatO) s += 'O' + CHATON;
    else s += esc(ch);
  }
  return s;
}
M.ecrit = function(texte, e){
  e = e || {};
  var deg = Math.round(Math.atan(e.penche == null ? .14 : e.penche) * 180 / Math.PI);
  var st = '--ec-p:' + (-deg) + 'deg' + (e.taille ? ';font-size:' + e.taille + 'em' : '');
  return '<span class="ec' + (e.gras ? ' ec-gras' : '') + '" style="' + st + '" role="text" aria-label="' + esc(texte) + '">' +
    String(texte).split(' ').map(function(m){ return m ? '<span class="ec-mot" aria-hidden="true">' + unMot(m, e) + '</span>' : ''; }).join(' ') + '</span>';
};

/* ---------- 📖 Le Livre d'or de la fête ---------- */
var DECO = {
  fleur:'<svg class="ec-deco ec-fleur" viewBox="-10 -10 20 30" aria-hidden="true"><path d="M0 7 q3 6 -1 12" fill="none" stroke="#2b2233" stroke-width="1"/><g fill="#b48cff"><circle cx="0" cy="-5.5" r="3.4"/><circle cx="5.2" cy="-1.7" r="3.4"/><circle cx="3.2" cy="4.4" r="3.4"/><circle cx="-3.2" cy="4.4" r="3.4"/><circle cx="-5.2" cy="-1.7" r="3.4"/></g><circle r="2.8" fill="#f5b945"/></svg>',
  farine:'<svg class="ec-deco ec-farine" viewBox="0 0 40 24" aria-hidden="true"><g fill="#fff" opacity=".9"><circle cx="8" cy="12" r="3"/><circle cx="15" cy="7" r="2"/><circle cx="20" cy="14" r="3.6"/><circle cx="27" cy="9" r="2.4"/><circle cx="31" cy="16" r="1.8"/><circle cx="13" cy="18" r="1.6"/><circle cx="24" cy="19" r="1.4"/><circle cx="34" cy="8" r="1.2"/></g></svg>',
  pates:'<svg class="ec-deco ec-pates" viewBox="0 0 40 24" aria-hidden="true"><g fill="#2b2233"><path d="M6 8 q4 -5 7 0 q3 5 -2 7 q-6 1 -5 -7z"/><circle cx="16" cy="18" r="1.4"/><path d="M27 12 q5 -3 7 2 q1 6 -5 5 q-5 -2 -2 -7z"/><circle cx="23" cy="6" r="1.1"/></g></svg>'
};
function motDor(id){
  var e = EC.ech[id];
  return '<figure class="ec-or-mot"><div class="ec-or-lignes">' + e.l.map(function(l){ return '<span>' + M.ecrit(l, e) + '</span>'; }).join('') + '</div>' +
    (e.deco ? DECO[e.deco] || '' : '') + '<figcaption>' + esc(e.nom.charAt(0).toUpperCase() + e.nom.slice(1)) + '</figcaption></figure>';
}
M.livreDorSignes = function(){ return EC.ordre.filter(function(id){ return M.momentId() !== 'matin' || !EC.ech[id].tard; }); };
M.livreDorHTML = function(p){
  var P = M.P(), matin = M.momentId() === 'matin', donne = !!(P && P.pages && P.pages[p.id]);
  var t0 = 'Le Livre d\'or de la fête. Chacun y écrit un petit mot pour Odette, de sa main.';
  var s = '<p class="lv-texte">' + esc(t0) + ' ' + lire(t0) + '</p><div class="ec-or">' + M.livreDorSignes().map(motDor).join('') + '</div>';
  if(donne) return s;   /* (le code, juste après : livre.js) */
  if(matin){ var t1 = 'Tout le monde n\'a pas encore signé.'; return s + '<p class="lv-texte ec-or-attente">✒️ ' + esc(t1) + ' ' + lire(t1) + '</p>'; }
  var t2 = 'Tout le monde a signé !';
  return s + '<p class="lv-texte ec-or-attente">✒️ ' + esc(t2) + '</p>' +
    '<button class="btn grand b-aller lv-ouvrir" data-act="ouvrir-page" data-id="' + esc(p.id) + '">📖 ' + esc(p.bouton || 'Donner ce livre à l\'Alchimiste') + '</button>';
};

/* ---------- ✉️ La lettre d'Odette (la vraie feuille : « à la manière d'Odette ») ---------- */
M.vraieLettreHTML = function(){
  var E = M.E(), t = String(E.lettre || ''), sig = E.signature || 'Odette';
  var corps = t.replace(new RegExp('\\s*' + sig + '\\.?\\s*$'), '');
  var t0 = 'La lettre que le maire gardait dans son bureau. La voici, de près.';
  return '<p class="lv-texte">' + esc(t0) + ' ' + lire(t0) + '</p>' +
    '<article class="ec-feuille ec-lettre"><p>' + M.ecrit(corps, EC.fausse) + '</p><p class="ec-signature">' + M.ecrit(sig, EC.fausse) + '</p></article>' +
    '<p class="ec-lire">' + lire(t) + '</p>';
};

/* ---------- 📓 Le carnet d'Odette : ses sept chats, de sa main ---------- */
M.carnetOdetteHTML = function(){
  if(!CH) return '';
  var O = EC.odette, t0 = 'Le carnet d\'Odette, trouvé sur sa table. Elle y parle de ses chats.';
  var s = '<p class="lv-texte">' + esc(t0) + ' ' + lire(t0) + '</p><div class="ec-feuille ec-carnet"><p class="ec-carnet-titre">' + M.ecrit('Mes sept amours, par Odette', O) + '</p>';
  CH.liste.forEach(function(c){
    s += '<section class="ec-chat"><div class="ec-chat-por">' + CH.portraitSVG(c.id, 66) + '</div>' +
      '<div class="ec-chat-txt"><h3>' + M.ecrit(c.nom, O) + '</h3><p>' + M.ecrit(c.dit, O) + '</p></div>' +
      '<div class="ec-chat-patte">' + CH.traceSVG(c.id, 58, '#3a2c20') + '<small>' + M.ecrit('sa patte', O) + '</small></div>' +
      '<div class="ec-chat-lire">' + lire(c.nom + '. ' + c.dit) + '</div></section>';
  });
  return s + '</div>';
};
})();
