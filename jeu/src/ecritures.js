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
  /* (17 novembre) le maire l'a confié au Sage, l'après-midi : tout le monde a signé. Plus de bouton « Donner ce livre à l'Alchimiste » :
     c'est le Sage qui compare (la page « Comparer les écritures », plus bas). */
  var t0 = 'Le Livre d\'or de la fête, que le maire t\'a confié. Chacun y a écrit un petit mot pour Odette, de sa main.';
  return '<p class="lv-texte">' + esc(t0) + ' ' + lire(t0) + '</p><div class="ec-or">' + EC.ordre.map(motDor).join('') + '</div>';
};

/* ---------- 🔍 Comparer les écritures (17 novembre : le Sage, plus l'Alchimiste) ----------
   La lettre en haut (et le carnet d'Odette, s'il l'a : sa vraie écriture), les douze mots du Livre d'or dessous : chacun est un bouton.
   Le Sage désigne une main ; « Tu en es sûr ? » ; deux essais (essais.js, la clé « sage:ecriture »). Mélusine : le code pour le Barde.
   Rien, à l'écran, ne dit quelles lettres regarder : il compare de ses yeux. */
var K_EC = 'sage:ecriture', MAXI = 2;   /* deux essais, quel que soit le réglage des mini-jeux (un seul à l'enquête 3) : on compare de petites lettres sur un petit écran */
function nbRates(){ return M.nbEchecs ? M.nbEchecs(K_EC) : 0; }
M.quiEcritHTML = function(){
  var P = M.P(), fait = !!(P && P.vus[K_EC] === 'ok'), ferme = !fait && nbRates() >= MAXI, reste = MAXI - nbRates();
  var s = '<div class="ec-compare"><div class="ec-feuille ec-compare-l"><small>La lettre</small>' + EC.lettre.l.map(function(l){ return '<span>' + M.ecrit(l, EC.fausse) + '</span>'; }).join('') + '</div>';
  if(P && P.recus['obj:carnet']) s += '<div class="ec-feuille ec-compare-l ec-compare-o"><small>Le carnet d\'Odette</small><span>' + M.ecrit('Mes sept amours,', EC.odette) + '</span><span>' + M.ecrit('par Odette', EC.odette) + '</span></div>';
  s += '</div>';
  var t = fait ? 'C\'est la main de Mélusine qui a écrit la lettre. Le Barde a ton code : à lui de la faire parler.'
    : ferme ? 'Les écritures se brouillent devant tes yeux : tu ne sais plus. Il faudra trouver autrement…'
    : 'Une main du village a écrit cette lettre. Laquelle ? Compare-la aux mots du Livre d\'or, lettre par lettre, puis désigne-la. ' + (reste > 1 ? 'Tu n\'as droit qu\'à deux essais.' : 'C\'est ton dernier essai.');
  s += '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p>';
  s += '<div class="ec-or' + (fait || ferme ? ' ec-or-fini' : ' ec-or-choix') + '">' + EC.ordre.map(function(id){
    var m = motDor(id);
    if(fait) return id === 'melusine' ? m.replace('class="ec-or-mot"', 'class="ec-or-mot ec-or-bon"') : m;
    if(ferme) return m;
    return '<button type="button" class="ec-or-b" data-act="ec-designer" data-id="' + esc(id) + '">' + m + '</button>';
  }).join('') + '</div>';
  if(fait){ var c = 'info:cest_melusine', nc = M.nomCode(c), td = M.texteDonne(c);
    s += '<div class="b-donne"><p>' + nc.ic + ' <b>' + esc(nc.nom) + '</b> : ' + esc(td) + ' ' + lire(nc.nom + ' : ' + td) + '</p>' + M.codeHTML(M.code(c)) + '</div>'; }
  return s;
};
if(M.A) M.A['ec-designer'] = function(el){
  var P = M.P(), id = el.dataset.id, e = EC.ech[id];
  if(!P || !e || P.vus[K_EC] === 'ok' || nbRates() >= MAXI) return;
  var dernier = nbRates() >= MAXI - 1, nom = e.nom.charAt(0).toUpperCase() + e.nom.slice(1);
  M.UI.confirmer = function(){ juger(id); };
  M.son('clic');
  M.ouvrir({type:'confirmer', titre:'Tu en es sûr ?', t:nom + ' aurait écrit la lettre ? ' + (dernier ? 'Attention : c\'est ton dernier essai.' : 'Réfléchis bien : tu n\'as que deux essais.'), oui:'Oui, c\'est cette main-là', non:'Je regarde encore'});
};
function juger(id){
  var P = M.P(), e = EC.ech[id]; if(!P || !e) return;
  if(id === 'melusine'){
    P.vus[K_EC] = 'ok'; P.objets['_info:cest_melusine'] = true;
    var t = 'Les mêmes lettres, trait pour trait : c\'est la main de Mélusine, la couturière, qui a écrit la lettre d\'Odette !';
    M.noter('En comparant la lettre au Livre d\'or : c\'est l\'écriture de Mélusine (code pour le Barde).', '🔍');
    M.son('magie'); M.sauver();
    M.decouvrir({ic:'🧵', titre:'La même main !', t:t, code:'info:cest_melusine'});
    return;
  }
  var n = M.echec ? M.echec(K_EC) : MAXI, fin = n >= MAXI;
  var tr = (EC.bons.indexOf(id) >= 0 ? 'Son écriture ressemble beaucoup à celle de la lettre… mais ce n\'est pas elle.' : 'Non : en regardant mieux, ces lettres-là ne se ressemblent pas.') +
    (fin ? ' Les écritures se brouillent devant tes yeux : tu ne sais plus. Il faudra trouver autrement…' : ' Il te reste un essai.');
  if(fin) P.vus[K_EC] = 'rate';
  M.son('ko'); M.sauver();
  M.decouvrir({ic:'💨', titre:'Ce n\'est pas cette main-là', t:tr, rate:true});
}

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
