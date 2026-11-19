/* ==========================================================
   Brumeval — la descente dans le donjon (enquête 3, étape 6 : le branchement ; Bible §13.14, E3-actions-des-roles.md §1).

   Le donjon est un jeu à part (jeu/donjon/, en ligne dans brumeval/donjon/) : trois pages, une par tablette —
   index.html (le Pisteur : tout s'y joue, les trois héros en file), sage.html (le plan des souterrains, le carnet de l'aventurier,
   les pages de sauvegarde), alchimiste.html (le chaudron du donjon). Ici, on y va et on en revient :
   · E.donjon = {pages:{pisteur, sage, alchimiste}} (e3.js) : l'enquête a un donjon.
   · Le Pisteur : un point « descente » (la crypte, ou le puits une fois la grille rongée à l'acide) ouvre la fenêtre de la descente.
     (13 novembre, Romain : « il est temps d'enfiler notre tenue de combat », « les codes d'apparence », « on a besoin des sept potions
     pour descendre ».) Il donne le code du départ, « On va dans la crypte » (E.infos.on_descend), au Sage et à l'Alchimiste. Chez eux
     s'ouvre la fenêtre de la tenue de combat, avec LEUR code pour le Pisteur : un CODE D'ALLURE (allure:<n>, E.codesPlus) qui dit à quoi
     ressemble leur héros — fille ou garçon, la peau, les cheveux. Celui de l'Alchimiste n'existe que quand ses sept potions sont prêtes
     (il remplace le code du sac : tapé par le Pisteur, il met les sept potions dans P.sac). Les deux codes tapés, le bouton jaune
     emmène le Pisteur dans le donjon, avec l'allure des trois héros (« look=… », jeu/donjon/moteur/src/allure.js).
     Les héros en tenue se voient dans un petit cadre : la page jeu/donjon/moteur/src/tenue.html (E.donjon.tenue).
   · Le Sage : la page « Le plan des souterrains » de son Grand Livre, la nuit ; l'Alchimiste : « Le chaudron du donjon », dans son sac.
   · Chaque descente a son jeton (P.donjonJeton) : la page du donjon recommence une partie neuve quand le jeton est nouveau, et
     l'enquête ne croit que ce qui porte son jeton (une vieille partie d'essai du donjon, restée dans la tablette, ne compte pas).
   · Au retour (les pages du donjon gardent leur partie dans la tablette, on la relit) :
       le Pisteur — la porte aux quatre signes est trouvée : il garde le code « Odette est derrière la porte » pour le Sage ;
                    le donjon est fini : « Léo attrapé », ou « Léo s'est enfui » (le maire n'a pas été retenu), pour le Barde ;
       le Sage — il a tapé le code de la porte sur son plan : l'enquête le reçoit toute seule (pas besoin de le taper deux fois).
   · Les codes qui passent de l'enquête au donjon (« La Grosse Marie », « Le maire est retenu » : le Barde les donne, le Pisteur les
     tape DANS le donjon) et du donjon à l'enquête (la porte, Léo) ont les mêmes symboles des deux côtés : codes-fixes.js (enquête 3)
     et jeu/donjon/donjon-codes.js. Tapé dans l'enquête, un code qui sert dans le donjon dit où le taper.
   Chargé APRÈS plantes.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
var esc = M.esc, A = M.A;
var CLE_PISTEUR = 'brumeval-donjon-partie', CLE_SAGE = 'brumeval-donjon-sage', CLE_JETON = 'brumeval-donjon-jeton:', CLE_RETOUR = 'brumeval-donjon-retour';
var CLE_DEPART = 'brumeval-donjon-depart';   /* par jeton : d'où on est parti (l'adresse du jeu portait-elle « #test » ?) */
function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
function cfg(){ var E = enquete(); return (E && E.donjon) || null; }
function lu(cle){ try{ return localStorage.getItem(cle); }catch(e){ return null; } }
function json(cle){ try{ var t = lu(cle); return t ? JSON.parse(t) : null; }catch(e){ return null; } }
function lire(t){ return M.lireBtn(t); }
function nuit(){ var E = enquete(), P = M.P(); return !!(E && P && E.moments[Math.min(P.moment, E.moments.length - 1)] === 'nuit'); }
M.donjonDispo = function(){ return !!(cfg() && M.P && M.P()); };
function jeton(){
  var P = M.P();
  if(!P.donjonJeton) P.donjonJeton = 'e' + P.id + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  return P.donjonJeton;
}
/* l'adresse de la page du donjon de ce rôle, avec le jeton de cette descente (et, pour le Pisteur, le sac et l'entrée) */
M.donjonAdresse = function(){
  var C = cfg(), P = M.P(), role = M.role(), base = C && C.pages && C.pages[role];
  if(!base || !P) return null;
  var q = ['enquete=' + P.id, 'jeton=' + encodeURIComponent(jeton())];
  if(role === 'pisteur'){
    if(P.sac && P.sac.length) q.push('potions=' + P.sac.join(','));
    if(P.vus['donjon:entree']) q.push('entree=' + P.vus['donjon:entree']);
    q.push('look=' + encodeURIComponent(lookTxt()));
  }
  return base + '?' + q.join('&');
};
/* on y va (le bouton jaune) */
A['ds-aller'] = function(){
  var P = M.P(), role = M.role(), u = M.donjonAdresse();
  if(!u) return;
  if(role === 'pisteur'){ if(!pretADescendre()) return; P.vus['donjon:parti'] = 1; }
  P.vus['donjon:ouvert:' + role] = 1;
  M.sauver(); if(M.stop) M.stop(); M.son('pas');
  /* (les robots d'essai n'ont pas le donjon à côté d'eux : ils notent seulement où on allait) */
  if(window.BRUMEVAL_SANS_DONJON){ window.__donjonVers = u; M.UI.modal = null; M.render(); return; }
  /* on retient qu'on est parti de l'enquête : en remontant, on revient DANS l'enquête, pas sur la place du village (revenir, plus bas) */
  try{ sessionStorage.setItem(CLE_RETOUR, P.donjonJeton); }catch(e){}
  noterDepart(P.donjonJeton);
  M.UI.modal = null;
  /* la descente en film (Romain, 17 novembre ; Bible §13.62) : l'escalier sous le clocher, ou la corde du puits, puis le donjon. Le film est
     pris sur la tablette du Pisteur (c'est lui qui sait par où on descend) ; pas de film (pas arrivé, pas de lecteur) : on part tout de suite. */
  var film = role === 'pisteur' ? ({crypte:'escalier', puits:'puits'})[P.vus['donjon:entree']] : null;
  function partir(){ window.location.href = u; }
  if(film && M.jouerFilm) M.jouerFilm(film, partir); else partir();
};
A['ds-code'] = function(){ var P = M.P(); M.UI.modal = null; P.onglet = 'code'; M.UI.saisie = []; M.sauver(); M.render(); window.scrollTo(0, 0); };

/* ---------- L'allure des héros dans le donjon : les codes d'apparence (Romain, 13 novembre) ----------
   allure:<n> : n = rôle (0 le Sage, 1 l'Alchimiste) + 2 × (fille 0, garçon 1) + 4 × (peau 0 à 5) + 24 × (cheveux 0 à 8) : 216 codes.
   (Les yeux n'y sont pas : il faudrait un quatrième symbole. Dans le donjon, ils gardent la couleur d'origine du héros de ce rôle ;
   le Pisteur, lui, est sur sa propre tablette : tout son héros passe, les yeux aussi.) */
var PEAUX_A = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], CHEV_A = ['brun', 'chatain', 'noir', 'blond', 'roux', 'gris', 'blanc', 'nuit', 'rose'], ROLES_A = ['sage', 'alchimiste'];
/* LE CACHOT DE LA FIN (13 novembre, Bible §13.33 : « grâce aux codes d'apparence, chaque tablette montre les quatre héros enfermés ») :
   le Pisteur et le Barde ont un code d'allure eux aussi — allure:216 … allure:431, ajoutés APRÈS les 216 premiers (ceux du Sage et de
   l'Alchimiste ne bougent pas). Ils ne servent qu'à la fin, sur l'image du cachot (moteur-ecrans.js, prisonHTML). */
var ROLES_B = ['pisteur', 'barde'];
/* L'ÂGE (Romain, 17 novembre : « l'âge dans les codes de l'allure et redessiner les héros en enfant et en adulte ») : les codes neufs
   s'ajoutent APRÈS les 432 (qui ne bougent pas : ce sont les adultes) — allure:432 … 863 pour un enfant, allure:864 … 1295 pour un âgé,
   dans le même ordre que les adultes. Un héros adulte garde donc son code d'avant. */
var AGES_A = ['adulte', 'enfant', 'age'];
M.allureNumero = function(role, a){
  var base = 2 * ((a.sexe === 'm' ? 1 : 0) + 2 * (Math.max(0, PEAUX_A.indexOf(a.peau)) + 6 * Math.max(0, CHEV_A.indexOf(a.cheveux))));
  var n = ROLES_B.indexOf(role) >= 0 ? 216 + ROLES_B.indexOf(role) + base : Math.max(0, ROLES_A.indexOf(role)) + base;
  return n + 432 * Math.max(0, AGES_A.indexOf(a.age));
};
M.allureDe = function(n){
  n = Math.max(0, Math.min(1295, Math.floor(+n) || 0));
  var ag = Math.floor(n / 432); n -= 432 * ag;
  var roles = n >= 216 ? ROLES_B : ROLES_A; if(n >= 216) n -= 216;
  var r = n % 2; n = (n - r) / 2; var sx = n % 2; n = (n - sx) / 2; var pe = n % 6, ch = (n - pe) / 6;
  return {role:roles[r], sexe:sx ? 'm' : 'f', peau:PEAUX_A[pe], cheveux:CHEV_A[ch], age:AGES_A[ag]};
};
/* mon code d'allure pour le cachot de la fin (les quatre rôles) */
M.allureCodeFin = function(){ return 'allure:' + M.allureNumero(M.role(), M.allureMoi()); };
M.allureMoi = function(){
  var h = (M.S && M.S.heros) || {}, sx = h.sexe === 'm' ? 'm' : 'f';
  return {sexe:sx, age:AGES_A.indexOf(h.age) >= 0 ? h.age : 'adulte', peau:PEAUX_A.indexOf(h.peau) >= 0 ? h.peau : 'p1', cheveux:CHEV_A.indexOf(h.cheveux) >= 0 ? h.cheveux : 'brun', yeux:h.yeux || '',
    coiffure:COIFF_A[sx].indexOf(h.coiffure) >= 0 ? h.coiffure : '', barbe:BARBE_A.indexOf(h.barbe) > 0 ? h.barbe : ''};
};
/* mon code d'allure (le Sage, l'Alchimiste) */
M.allureCode = function(){ var role = M.role(); return ROLES_A.indexOf(role) >= 0 ? 'allure:' + M.allureNumero(role, M.allureMoi()) : null; };
/* LE VISAGE (Romain, 17 novembre : « tout ce qui est dans l'écran de création, sauf les habits […] pour qu'on retrouve son personnage ») :
   la coiffure, les yeux et la barbe ne tiennent pas dans le code d'allure (trois symboles) ; ils ont un DEUXIÈME code, montré juste à
   côté : visage:<n>, n = coiffure (0 à 7, dans la liste de son sexe : persos.js, COIFFURES) + 8 × yeux (0 à 6) + 56 × barbe (0 à 3) :
   224 codes, sans le rôle — il habille le héros dont on a tapé le code d'allure juste avant (P.allureDernier). Il n'est pas obligatoire :
   sans lui, le héros garde la coiffure et les yeux du héros de ce rôle. */
var COIFF_A = {f:['queue', 'tresses', 'carre', 'longs', 'chignon', 'couettes', 'courte', 'tresse_c'], m:['epis', 'court', 'meche', 'boucles', 'arriere', 'catogan', 'milong', 'degarni']};
var YEUX_A = ['vert', 'bleu', 'marron', 'noisette', 'gris', 'violet', 'ambre'], BARBE_A = ['aucune', 'courte', 'longue', 'moustache'];
M.visageNumero = function(a){
  var l = COIFF_A[a.sexe === 'm' ? 'm' : 'f'];
  return Math.max(0, l.indexOf(a.coiffure)) + 8 * Math.max(0, YEUX_A.indexOf(a.yeux)) + 56 * Math.max(0, BARBE_A.indexOf(a.barbe));
};
M.visageDe = function(n, sexe){
  n = Math.max(0, Math.min(223, Math.floor(+n) || 0));
  var c = n % 8, y = Math.floor(n / 8) % 7, b = Math.floor(n / 56);
  return {coiffure:COIFF_A[sexe === 'm' ? 'm' : 'f'][c], yeux:YEUX_A[y], barbe:BARBE_A[b]};
};
M.visageCode = function(){ return 'visage:' + M.visageNumero(M.allureMoi()); };
function allureTxt(a){ return (a.sexe === 'm' ? 'm' : 'f') + '.' + a.peau + '.' + a.cheveux + (a.yeux && /^[a-z]+$/.test(a.yeux) ? '.' + a.yeux : '') + (a.age === 'enfant' ? '.enf' : a.age === 'age' ? '.age' : '') +
  (a.coiffure && /^[a-z_]+$/.test(a.coiffure) ? '.c-' + a.coiffure : '') + (a.barbe && /^[a-z]+$/.test(a.barbe) && a.barbe !== 'aucune' ? '.b-' + a.barbe : ''); }
/* le code d'allure d'un équipier, reçu : son héros (le visage d'avant est gardé, s'il va avec : même sexe) */
function allureRecue(P, a){
  var av = P.allures && P.allures[a.role], n = {sexe:a.sexe, peau:a.peau, cheveux:a.cheveux, age:a.age};
  if(av && av.vu && av.sexe === a.sexe){ n.coiffure = av.coiffure; n.yeux = av.yeux; n.barbe = av.barbe; n.vu = true; }
  P.allures = P.allures || {}; P.allures[a.role] = n; P.allureDernier = a.role;
  return n;
}
/* l'allure à passer au donjon et à la petite page de la tenue : moi, et (le Pisteur) ceux dont j'ai tapé le code */
function lookTxt(){
  var P = M.P(), role = M.role(), a = (P && P.allures) || {}, l = [role.charAt(0) + ':' + allureTxt(M.allureMoi())];
  if(role === 'pisteur') ROLES_A.forEach(function(r){ if(a[r]) l.push(r.charAt(0) + ':' + allureTxt(a[r])); });
  return l.join(',');
}
M.donjonLook = lookTxt;
/* (Romain, 17 novembre, 23 h 13 : « l'Alchimiste a les yeux marron alors que son personnage a les yeux bleus ; le Sage, ça a l'air ok ».)
   Un ami n'est « prêt » que quand son code de SIX symboles est tapé (a.vu : son visage est là). Avant, un ami dont le Pisteur avait
   tapé l'ancien code d'allure à trois symboles (sans visage : celui de l'après-midi, d'avant 22 h) passait pour prêt : son bouton
   « 🔢 Le code de… » ne s'affichait plus, et il descendait avec les yeux et la coiffure du héros par défaut. */
function amiPret(a){ return !!(a && a.vu); }
function pretADescendre(){ var P = M.P(), a = (P && P.allures) || {}; return !!(amiPret(a.sage) && amiPret(a.alchimiste) && P.sac && P.sac.length); }
M.donjonPret = pretADescendre;
/* les héros en tenue de combat : la petite page du donjon, dans un cadre (pas de texte, pas de son, rien à toucher) */
function tenueCadre(qui){
  var C = cfg(); if(!C || !C.tenue) return '';
  if(window.BRUMEVAL_SANS_DONJON) return '<div class="ds-tenue ds-tenue-vide" data-qui="' + qui.join(',') + '" data-look="' + esc(lookTxt()) + '"></div>';
  return '<iframe class="ds-tenue' + (qui.length > 1 ? ' ds-tenue-trois' : '') + '" title="La tenue de combat" tabindex="-1" scrolling="no" src="' + esc(C.tenue + '?h=' + qui.join(',') + '&look=' + encodeURIComponent(lookTxt())) + '"></iframe>';
}
function potions(){ return M.potionsPretes ? M.potionsPretes() : {n:0, sur:7}; }
var TITRE_TENUE = 'Il est temps d\'enfiler notre tenue de combat !';
/* mon code d'allure, à montrer au Pisteur */
/* (17 novembre) et, juste à côté, le code de mon visage (la coiffure, les yeux, la barbe) */
M.deuxCodesHTML = function(id1, gros){
  return '<div class="ds-deux"><div class="ds-un"><b>1 · ' + esc('Ma tenue') + '</b>' + M.codeHTML(M.code(id1), gros) + '</div>' +
    '<div class="ds-un"><b>2 · ' + esc('Mon visage') + '</b>' + M.codeHTML(M.code(M.visageCode()), gros) + '</div></div>';
};
/* (17 novembre, 21 h 46, Romain : « avant d'entrer dans le donjon, une interface spéciale où le Pisteur tape un code de six symboles pour
   l'Alchimiste et pour le Sage ») UN SEUL code de six symboles pour le héros en entier : tenue (allure : 1296) ET visage (224), soit
   1296 × 224 = 290 304 codes sur les 2 985 984 de six symboles parmi douze. Calculé, pas gelé dans une table : rôle, sexe, âge, peau, cheveux
   dans les 1296 premiers, la coiffure, les yeux et la barbe dans les 224 autres. (L'allure à trois symboles reste pour le cachot de la fin.) */
function symOrdre(){ return D.ORDRE_SYM; }
M.tenueCode6 = function(){
  var a = M.allureMoi(), n = M.allureNumero(M.role(), a) * 224 + M.visageNumero(a), o = symOrdre(), r = [], i;
  for(i = 0; i < 6; i++){ r.unshift(o[n % o.length]); n = Math.floor(n / o.length); }
  return r;
};
function decoder6(seq){
  var o = symOrdre(), n = 0, i;
  for(i = 0; i < seq.length; i++){ var k = o.indexOf(seq[i]); if(k < 0) return null; n = n * o.length + k; }
  var al = Math.floor(n / 224); if(al > 1295) return null;
  var a = M.allureDe(al); if(ROLES_A.indexOf(a.role) < 0) return null;
  return {a:a, v:n % 224};
}
M.decoderTenue6 = decoder6;
function monCodeHTML(){
  var role = M.role(), t = 'Montre ce code au Pisteur : c\'est toute ta tenue et ton visage. Il te reconnaîtra dans le donjon.';
  return ROLES_A.indexOf(role) >= 0 ? '<div class="b-donne ds-moncode"><p>🛡️ ' + esc(t) + ' ' + lire(t) + '</p><div class="ds-un">' + M.codeHTML(M.tenueCode6(), true).replace('class="b-code grand"', 'class="b-code grand b-code-oblige" title="Un code à ne pas oublier"') + '</div></div>' : '';   /* (le code à ne pas oublier : l'anneau jaune) */
}
/* le Pisteur, à son écran de départ : le code de six symboles d'un ami (modal {type:'descente', vue:'six', role, seq:[], err}) */
function sixHTML(m){
  var qui = m.role === 'sage' ? 'du Sage' : 'de l\'Alchimiste', seq = m.seq || [], t = 'Demande à ' + (m.role === 'sage' ? 'le Sage' : 'l\'Alchimiste') + ' de te montrer son code : six dessins. Tape-les dans l\'ordre.';
  return '<h2>Le code ' + qui + '</h2><p>' + esc(m.err || t) + ' ' + lire(m.err || t) + '</p>' +
    '<div class="b-saisie ds-six">' + [0, 1, 2, 3, 4, 5].map(function(i){ return '<div class="b-case' + (seq[i] ? ' pleine' : '') + '">' + (seq[i] ? D.SYM[seq[i]].e : '') + '</div>'; }).join('') + '</div>' +
    '<div class="b-pave">' + symOrdre().map(function(k){ return '<button data-act="d6-sym" data-s="' + k + '" aria-label="' + D.SYM[k].n + '" title="' + D.SYM[k].n + '"><span aria-hidden="true">' + D.SYM[k].e + '</span></button>'; }).join('') + '</div>' +
    '<div class="b-rangee centre"><button class="btn second" data-act="d6-efface"' + (seq.length ? '' : ' disabled') + '>⌫ Effacer</button><button class="btn second" data-act="fermer">Plus tard</button></div>';
}
A['ds-six'] = function(el){ M.son('clic'); M.ouvrir({type:'descente', vue:'six', role:el.dataset.role === 'sage' ? 'sage' : 'alchimiste', seq:[]}); };
A['d6-sym'] = function(el){
  var m = M.UI.modal, P = M.P(); if(!m || m.vue !== 'six' || !P) return;
  m.seq = m.seq || []; if(m.seq.length >= 6) return;
  m.err = ''; m.seq.push(el.dataset.s); M.son('tic');
  if(m.seq.length < 6){ M.render(); return; }
  var r = decoder6(m.seq);
  if(!r || r.a.role !== m.role){
    M.son('ko'); m.seq = []; m.err = r ? 'Ce code est celui de l\'autre ami. Regarde bien qui te le montre !' : 'Ce code ne marche pas. Regarde bien les six dessins, et recommence.'; M.render(); return;
  }
  var n = allureRecue(P, r.a), vz = M.visageDe(r.v, r.a.sexe);
  n.coiffure = vz.coiffure; n.yeux = vz.yeux; n.barbe = vz.barbe; n.vu = true;
  P.recus['allure:' + r.a.role] = true;
  M.noter(r.a.role === 'sage' ? 'Le Sage est en tenue de combat : son code est tapé.' : 'L\'Alchimiste est en tenue de combat : son code est tapé.', '🛡️');
  M.son('gain'); M.sauver();
  M.ouvrir({type:'descente'});   /* (19 novembre) on revient à la fenêtre des deux boutons : celui-ci est validé */
};
A['d6-efface'] = function(){ var m = M.UI.modal; if(!m || m.vue !== 'six') return; m.seq = (m.seq || []).slice(0, -1); M.son('clic'); M.render(); };
/* ---------- Le Sage et l'Alchimiste : la fenêtre de la tenue de combat (ils ont tapé « On va dans la crypte ») ---------- */
/* (17 novembre, étape 4 du nouveau fil) les tenues viennent de Mélusine (le code du Barde, « Les tenues de Mélusine », E.objets.tenues) :
   avec lui, les textes le disent. Sans lui, on descend quand même (personne ne reste bloqué). Avant le départ (« On va dans la crypte »),
   la page « Ma tenue de combat » du Sage montre la tenue, sans son code d'allure. */
function aTenues(){ var P = M.P(); return !!(P && P.recus && P.recus['obj:tenues']); }
function parti(){ var P = M.P(); return !!(P && P.recus && P.recus['info:on_descend']); }
function tenueTexte(){
  var role = M.role(), po = potions(), reste = po.sur - po.n, mel = aTenues();
  if(!parti() && role !== 'pisteur') return {ok:false, t:role === 'sage' ? 'Mélusine a tenu parole : capuche bleue, cuir épais, et une poche pour ton grimoire. Ta tenue attend le grand départ.'
    : 'Mélusine a tenu parole : capuche violette, cuir épais, et une ceinture à sept poches. Ta tenue attend le grand départ.'};
  if(role === 'sage') return {ok:true, t:(mel ? 'Dans la tenue de Mélusine — capuche bleue' : 'Capuche bleue') + ', grimoire à la ceinture, bâton de cristal : te voilà prêt pour les souterrains ! Le Pisteur vous emmène tous les trois sur sa tablette.'};
  if(reste <= 0) return {ok:true, t:(mel ? 'Dans la tenue de Mélusine — capuche violette' : 'Capuche violette') + ', lunettes sur le front, et tes sept potions à la ceinture : te voilà prêt pour les souterrains ! Le Pisteur vous emmène tous les trois sur sa tablette.'};
  return {ok:false, t:'Ta tenue est prête… mais pas tes potions ! Il t\'en manque ' + (reste > 1 ? reste : 'une') + '. On a besoin des sept potions pour descendre : file à ton établi. Quand la dernière sera prête, ton code pour le Pisteur t\'y attendra.'};
}
M.tenueFenetre = function(t){
  var role = M.role(); if(!cfg() || ROLES_A.concat(['pisteur']).indexOf(role) < 0) return false;
  M.son('gain'); M.ouvrir({type:'descente', vue:'tenueMel', t:t}); return true;
};
M.tenueHTML = function(dansLivre){
  var role = M.role(), x = tenueTexte(), s = tenueCadre([role]);
  if(!dansLivre) s += '<h2>' + esc(TITRE_TENUE) + '</h2>';
  s += '<p' + (dansLivre ? ' class="lv-texte"' : '') + '>' + esc(x.t) + ' ' + lire(dansLivre ? x.t : TITRE_TENUE + ' ' + x.t) + '</p>';
  if(x.ok) s += monCodeHTML();
  if(!dansLivre && role === 'sage'){ var t2 = 'Dans ton Grand Livre : le vieux plan se regarde maintenant de tout près, et des pages de sauvegarde t\'attendent.'; s += '<p class="ds-suite">' + esc(t2) + ' ' + lire(t2) + '</p>'; }
  return s;
};
/* ---------- Le Pisteur : la fenêtre de la descente ---------- */
function fioles(l){ return M.sacFiolesHTML ? M.sacFiolesHTML(l) : ''; }
function codeDonne(id, autre){
  var n = M.nomCode(id), dit = M.direCode ? M.direCode(id) : null, t = autre || dit || n.nom;
  return '<div class="b-donne"><p>' + n.ic + ' ' + esc(t) + ' ' + lire(t) + '</p>' + M.codeHTML(M.code(id), true) + '</div>';
}
function lignePret(ok, ic, t){ return '<li class="' + (ok ? 'ds-ok' : 'ds-attend') + '"><span aria-hidden="true">' + (ok ? '✅' : '⏳') + ' ' + ic + '</span><span>' + esc(t) + ' ' + lire(t) + '</span></li>'; }
M.descenteHTML = function(m){
  var P = M.P(), role = M.role(), sac = P.sac || [], t, s = '<div class="b-info-modal ds-fenetre">';
  /* (Romain, 19 novembre, 10 h 22) les tenues de Mélusine, reçues : son héros à lui (son visage, sa peau, son âge…) dans sa tenue de combat */
  if(m.vue === 'tenueMel') return s + VUES.tenueMel(m) + '</div>';
  /* le Sage, l'Alchimiste : ce qu'un code du donjon leur apporte (plus bas) ; sinon leur tenue de combat, et leur code pour le Pisteur */
  if(role !== 'pisteur'){
    var vue = m.vue && VUES[m.vue] ? VUES[m.vue](m) : null;
    return s + (vue || M.tenueHTML(false) + '<button class="btn grand b-aller" data-act="fermer">C\'est noté</button>') + '</div>';
  }
  if(m.vue === 'fin' || P.vus['donjon:fini']){
    /* (13 novembre, Bible §13.33) Léo est battu, il a parlé : le code pour le Sage — c'est lui qui ouvre les accusations */
    t = 'Vous voilà remontés du donjon ! Sous la cape noire : Léo, l\'apprenti du meunier. Battu, il a tout dit. Place aux accusations !';
    s += '<div class="b-grand-ic">🕯️</div><h2>Le donjon est fini</h2><p>' + esc(t) + '</p>' + lire(t);
    s += codeDonne('info:leo_battu');
    return s + '<button class="btn" data-act="fermer">D\'accord</button></div>';
  }
  var al = P.allures || {}, codeA = amiPret(al.alchimiste), okS = amiPret(al.sage), okA = !!(codeA && sac.length), ouvert = !!P.vus['donjon:entree'];
  /* (17 novembre) les sept potions viennent de arriver dans le sac : rien d'autre (pas de tenue, pas de donjon : on est encore l'après-midi) */
  if(m.vue === 'potions'){
    t = 'L\'Alchimiste a fini ses sept potions : les voilà dans ton sac. Elles te serviront sûrement… plus tard.';
    return s + '<div class="b-grand-ic">🧪</div><h2>Les sept potions !</h2>' + fioles(sac) + '<p>' + esc(t) + ' ' + lire(t) + '</p><button class="btn grand b-aller" data-act="fermer">D\'accord</button></div>';
  }
  /* il faut le code de six symboles de l'ami */
  if(m.vue === 'six') return s + sixHTML(m) + '</div>';
  /* il vient de taper le code d'un équipier : le voilà, dans sa tenue (« c'est bien lui ? ») */
  if(m.vue === 'recu' && al[m.role]){
    var qui = m.role === 'sage' ? 'Le Sage' : 'L\'Alchimiste';
    t = (m.role === 'sage' ? 'Voilà le Sage dans sa tenue de combat.' : 'Voilà l\'Alchimiste dans sa tenue de combat' + (sac.length ? ', ses sept potions à la ceinture.' : '.')) + ' C\'est bien ton équipier ? Sinon, retape son code.';
    s += tenueCadre([m.role]) + '<h2>' + qui + ' est prêt !</h2>' + (m.role === 'alchimiste' ? fioles(sac) : '') + '<p>' + esc(t) + ' ' + lire(qui + ' est prêt ! ' + t) + '</p>';
    /* (17 novembre, 23 h 30) « Sinon, retape son code » : le bouton pour le faire est là (avant, plus aucun moyen une fois le code tapé) */
    var retaper = '<button class="btn second" data-act="ds-six" data-role="' + m.role + '">🔢 Retaper son code</button>';
    if(ouvert && okS && okA) return s + '<button class="btn grand b-aller" data-act="ds-voir">🕯️ Voir la descente</button>' + retaper + '<button class="btn second" data-act="fermer">Plus tard</button></div>';
    return s + '<button class="btn grand b-aller" data-act="fermer">D\'accord</button>' + retaper + '</div>';
  }
  /* (19 novembre, Romain : « une interface un peu plus travaillée, que le Pisteur ne soit pas obligé de revenir sans arrêt au puits »)
     UNE SEULE fenêtre pour tout le départ : les deux boutons, celui du Sage et celui de l'Alchimiste. On touche l'un, on tape ses six
     symboles, et on REVIENT ICI : son bouton est validé (✅, on ne peut plus le toucher). On touche l'autre, pareil. Quand les deux sont
     validés, « Descendre » apparaît juste dessous. « Corriger un code » rend les deux boutons touchables si un code était faux. */
  var n = sac.length, deja = !!P.vus['donjon:parti'], tous = okS && okA, corriger = !!m.corriger;
  var pretsH = (okS ? ['sage'] : []).concat(okA ? ['alchimiste'] : []);
  function boutonAmi(role, ok, nom, ic){
    var qui = role === 'sage' ? 'du Sage' : 'de l\'Alchimiste';
    if(ok && !corriger) return '<button class="btn grand ds-valide" disabled aria-disabled="true">✅ ' + ic + ' ' + nom + ' est prêt</button>';
    if(role === 'alchimiste' && codeA && !sac.length) return '<button class="btn grand ds-valide ds-attend-b" disabled aria-disabled="true">⏳ ' + ic + ' Son code est tapé</button>';
    return '<button class="btn grand b-aller" data-act="ds-six" data-role="' + role + '">🔢 ' + (ok ? 'Retaper le code ' : 'Le code ') + qui + '</button>';
  }
  if(tous){
    t = deja ? 'Le donjon t\'attend, là où tu l\'as laissé. Les trois héros descendent ensemble, sur ta tablette.'
      : 'Tout le monde est en tenue, les ' + (n === 7 ? 'sept' : n) + ' potions de l\'Alchimiste sont du voyage. Les trois héros descendent ensemble, sur ta tablette. Le Sage ouvre son Grand Livre : il voit le chemin, toi tu ne vois que la brume.';
    s += tenueCadre(['sage', 'alchimiste', 'pisteur']) + '<h2>' + (deja ? 'Retourner dans le donjon' : 'Tout est prêt !') + '</h2><p>' + esc(t) + ' ' + lire(t) + '</p>';
  }else{
    t = 'Un escalier de pierre s\'enfonce dans le noir… Pas si vite ! On ne descend pas là-dessous en chemise. ' + (aTenues() ? 'La tenue de Mélusine, sa capuche verte, ton arc et ta dague' : 'Capuche verte, arc et dague') + ' : te voilà prêt.';
    s += tenueCadre(pretsH.concat(['pisteur'])) + '<h2>' + esc(TITRE_TENUE) + '</h2><p>' + esc(t) + ' ' + lire(TITRE_TENUE + ' ' + t) + '</p>' +
      codeDonne('info:on_descend', 'Donne ce code au Sage et à l\'Alchimiste : ils s\'équipent, et chacun te montrera son code.');
    if(codeA && !sac.length){ var t3 = 'Il te manque ses sept potions : l\'Alchimiste a un code pour ça, quand elles sont toutes prêtes.'; s += '<ul class="ds-prets">' + lignePret(false, '⚗️', t3) + '</ul>'; }
    else if(!codeA && !sac.length){ var t4 = 'Et on a besoin des sept potions pour descendre.'; s += '<ul class="ds-prets">' + lignePret(false, '⚗️', t4) + '</ul>'; }
  }
  s += '<div class="ds-amis">' + boutonAmi('sage', okS, 'Le Sage', '📖') + boutonAmi('alchimiste', okA, 'L\'Alchimiste', '⚗️') + '</div>';
  if(tous) return s + fioles(sac) + '<button class="btn grand b-aller" data-act="ds-aller">🕯️ ' + (deja ? 'Y retourner' : 'Descendre dans le donjon') + '</button>' +
    '<div class="b-rangee centre">' + (corriger ? '' : '<button class="btn second" data-act="ds-corriger">✏️ Corriger un code</button>') + '<button class="btn second" data-act="fermer">Pas tout de suite</button></div></div>';
  return s + (codeA || okS ? '<div class="b-rangee centre">' + (corriger ? '' : '<button class="btn second" data-act="ds-corriger">✏️ Corriger un code</button>') + '</div>' : '') + '</div>';   /* (on referme avec ✕ : la fenêtre tient dans l'écran d'une tablette) */
};
A['ds-corriger'] = function(){ var m = M.UI.modal; if(!m || m.type !== 'descente') return; M.son('clic'); m.corriger = true; M.render(); };
A['ds-voir'] = function(){ M.son('page'); M.ouvrir({type:'descente'}); };
/* un point « descente » (p.descente : 'crypte' ou 'puits') n'est pas une découverte : il ouvre la fenêtre de la descente */
if(A.point){
  var point0 = A.point;
  A.point = function(el){
    var P = M.P(), E = enquete(), role = M.role(), l = el && el.dataset ? el.dataset.l : null, id = el && el.dataset ? el.dataset.id : null;
    var R = E && E.donjon && E.lieux && E.lieux[l] && E.lieux[l][role], p = R && (R.points || []).filter(function(x){ return x.id === id; })[0];
    if(p && p.descente && M.pointsVisibles(l, role).some(function(x){ return x.id === id; })){
      P.vus['explore:' + l] = P.moment; P.vus[role + ':' + l + ':' + id] = 'ok'; P.vus['donjon:entree'] = p.descente;
      M.son('page'); M.sauver();
      /* le film de cette descente se télécharge déjà (on ne l'aura pas attendu quand on appuiera sur « Descendre ») */
      try{
        var fd = ({crypte:'escalier', puits:'puits'})[p.descente];
        if(fd && role === 'pisteur' && window.CineLecteur && window.CINE_INFOS && window.CINE_INFOS[fd] && location.protocol !== 'file:'){
          window.CineLecteur.precharger('cine/' + fd + '.mp4'); if(window.CINE_INFOS[fd].piste) window.CineLecteur.prechargerPiste('cine/' + fd + '.mp3');
        }
      }catch(e){}
      M.ouvrir({type:'descente', retourId:l});
      return;
    }
    return point0.apply(this, arguments);
  };
}

/* ---------- Le donjon du Sage et de l'Alchimiste, DANS le jeu (Romain, 13 novembre) ----------
   « Tous les codes du donjon se tapent dans l'interface principale du Sage et de l'Alchimiste ; le carnet de l'aventurier, le plan, les
   pages de sauvegarde, le plan déchiré : des pages du Grand Livre, pas une interface à part. »
   · Un code du donjon (donjon:<sorte>:<quoi>, gelé dans codes-fixes.js) tapé dans l'onglet Code : M.codeDonjon (moteur-actions.js,
     traiterCode). Ce que le héros a reçu : P.donjonCodes {'rune:lumiere':1, 'etude:rat':1…}.
   · Le Sage : « Le plan des souterrains » (le plan s'ouvre en grand par-dessus le jeu, dans un cadre : la page du donjon
     jeu/donjon/pages/sage.js, en mode « dans le jeu » — sans son pavé de codes ni son livre) ; « Les pages de sauvegarde » (deux pages,
     une de plus avec le code « Une page blanche » ; un sort écrit montre son code, puis on le barre : P.donjonPages) ; « Le carnet de
     l'aventurier » (avec son code, ou page par page avec les codes d'étude ; les textes : window.DONJON_CARNET, tirés par build.py de
     jeu/donjon/moteur/src/donnees.js).
   · L'Alchimiste : la fleur de givre arrive sur son établi (plantes.js) ; la mousse lumineuse (16 novembre, Bible §13.55 : avant, « les
     herbes lumineuses ») pose un brin sur sa paillasse d'analyse et se mélange dans l'ancien chaudron du donjon. */
var POUR_DONJON = {rune:'sage', page:'sage', carnet:'sage', etude:'sage', plante:'alchimiste', sauve:'pisteur', recette:'pisteur'};
function dj(){ var P = M.P(); if(!P.donjonCodes || typeof P.donjonCodes !== 'object') P.donjonCodes = {}; return P.donjonCodes; }
M.donjonCodes = function(){ var P = M.P(); return (P && P.donjonCodes) || {}; };
function CARNET(){ return window.DONJON_CARNET || {ordre:[], noms:{}, livre:{}}; }
function portrait(m){ var C = cfg(), base = C && C.portraits; return base ? '<img class="ds-croquis" src="' + esc(base + m + '.webp') + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : ''; }

/* --- le plan, en grand, par-dessus le jeu --- */
var CADRE_PLAN = 'donjon-plan-cadre';
function planAdresse(nouveau){
  var C = cfg(), P = M.P(), c = Object.keys(dj()).filter(function(k){ return POUR_DONJON[k.split(':')[0]] === 'sage'; });
  return C.pages.sage + '?enquete=' + P.id + '&jeton=' + encodeURIComponent(jeton()) + '&dans=jeu&codes=' + encodeURIComponent(c.join(',')) + (nouveau ? '&nouveau=' + encodeURIComponent(nouveau) : '') + (nuitOuverte() ? '' : '&jour=1');
}
M.planOuvert = function(){ return !!document.getElementById(CADRE_PLAN); };
M.fermerPlan = function(){
  var f = document.getElementById(CADRE_PLAN); if(!f) return;
  f.remove(); document.documentElement.classList.remove('labo-ouvert'); M.son('page'); M.render();
};
A['ds-plan'] = function(el){
  var P = M.P(); if(!P || M.role() !== 'sage' || !cfg() || M.planOuvert()) return;
  var nouveau = el && el.dataset ? el.dataset.nouveau : '', u = planAdresse(nouveau);
  if(nouveau === 'rune:lumiere') P.vus['donjon:rune:plan'] = 1;   /* (la scène de la rune qui apparaît : une seule fois) */
  P.vus[nuitOuverte() ? 'donjon:ouvert:sage' : 'donjon:ouvert:sage:jour'] = 1; M.sauver(); if(M.stop) M.stop(); M.son('page');
  M.UI.modal = null;
  if(window.BRUMEVAL_SANS_DONJON){ window.__donjonVers = u; M.render(); return; }
  M.render();
  var f = document.createElement('iframe');
  f.id = CADRE_PLAN; f.className = 'labo-cadre ds-plan-cadre'; f.setAttribute('title', 'Le vieux plan d\'Odette'); f.setAttribute('allow', 'autoplay; fullscreen');
  f.src = u;
  document.body.appendChild(f);
  document.documentElement.classList.add('labo-ouvert');
  try{ f.focus(); }catch(e){}
};
window.addEventListener('message', function(e){
  var m = e.data, f = document.getElementById(CADRE_PLAN);
  if(!m || m.donjonPlan !== 1 || !f || e.source !== f.contentWindow) return;
  if(m.type === 'fermer') M.fermerPlan();
  else if(m.type === 'lire'){ if(m.t) M.lire(String(m.t)); }
});
/* AU DÉPART, au bas de la page « Le vieux plan d'Odette » du Grand Livre (pierres.js, M.vieuxPlanHTML) : le plan se regarde de tout près
   (17 novembre, étape 4 du nouveau fil : la page « Le plan des souterrains », qui arrivait toute seule la nuit, n'existe plus).
   Seulement quand le Pisteur a ouvert le passage (le code du départ, « On va dans la crypte », que le Sage tape de toute façon pour
   s'équiper : les pages de sauvegarde arrivent au même moment). Avant : rien — le vieux plan reste muet (« on ne sait pas ce que c'est,
   ni où ça mène »), et le Sage ne lit pas le donjon à l'avance. */
/* (Romain, 17 novembre, 23 h 13 : « sur le Sage, j'ai pas le plan des galeries […] on peut poser la pierre sur le plan, mais ça sert à rien
   […] le plan, on peut pas zoomer dedans […] quand je clique sur le plan, il se passe rien ».) Le bouton jaune était tout en bas de la
   page, hors de l'écran : il fallait faire défiler pour le trouver. Maintenant :
   · M.donjonPlanBouton : le bouton jaune est JUSTE SOUS le petit plan (pierres.js le met là), avec le rond jaune tant que le Sage n'a
     pas encore déroulé le plan (ou pas encore depuis que sa pierre de rune y est posée) ;
   · toucher le petit plan lui-même le déroule aussi en grand (pierres.js, PLANS.vieuxplan.ouvrir) ;
   · M.donjonPlanBloc : au bas de la page, il ne reste que les explications. */
/* la nuit, le passage ouvert : le plan devient celui de « là-dessous » (ses noms, son titre, les textes du Grand Livre) */
function nuitOuverte(){ var P = M.P(); return !!(P && nuit() && P.recus && P.recus['info:on_descend']); }
M.donjonPlanNuit = nuitOuverte;
M.donjonPlanOuvrable = function(){
  /* (Romain, 19 novembre, 9 h 41 : « quand on a le vieux plan, je veux qu'on puisse avoir le vieux plan directement […] même si le Sage il
     est resté au matin […] on peut déjà interagir avec le plan […] mais on comprend pas à quoi ça sert ») : dès que le Sage a le vieux plan,
     à tout moment, il se déroule — en « jour » (planAdresse : sans noms, sans titre, sans crâne) tant que le passage n'est pas ouvert, la
     nuit. Le filet de la nuit (le plan gravé, sans la cachette) reste. */
  var P = M.P(); return !!(P && cfg() && M.role() === 'sage' && ((P.recus && P.recus['obj:vieux_plan']) || nuitOuverte()));
};
/* la petite scène « Une rune apparaît ! » ne se joue qu'une fois sur le grand plan (P.vus['donjon:rune:plan']) */
function runeAMontrer(){ var P = M.P(); return !!(P && P.vus['pierre:vieuxplan'] && dj()['rune:lumiere'] && !P.vus['donjon:rune:plan']); }
M.donjonPlanOuvrir = function(){
  if(!M.donjonPlanOuvrable() || M.planOuvert()) return false;
  A['ds-plan']({dataset:{nouveau:runeAMontrer() ? 'rune:lumiere' : ''}});
  return true;
};
/* où : 'sous' (juste sous le dessin) ou 'apres' (après la poche). Tant que la pierre de rune attend dans la poche, c'est elle qu'on doit
   voir d'abord : le bouton passe après la poche, sans rond jaune (toucher le plan le déroule toujours). */
M.donjonPlanBouton = function(ou){
  if(!M.donjonPlanOuvrable()) return '';
  var P = M.P(), attend = !!(dj()['rune:lumiere'] && !P.vus['pierre:vieuxplan']);
  if((ou === 'apres') !== attend) return '';
  var neuf = runeAMontrer(), guide = !attend && (neuf || !P.vus[nuitOuverte() ? 'donjon:ouvert:sage' : 'donjon:ouvert:sage:jour']);
  return '<div class="ds-plan-bouton"><button class="btn grand b-aller lv-ouvrir' + (guide ? ' b-guide' : '') + '" data-act="ds-plan"' + (neuf ? ' data-nouveau="rune:lumiere"' : '') + '>🔎 Regarder le plan de tout près</button></div>';
};
M.donjonPlanBloc = function(){
  if(!M.donjonPlanOuvrable() || !nuitOuverte()) return '';   /* (le jour : rien ne dit ce que c'est) */
  var P = M.P(), C = dj(), posee = !!P.vus['pierre:vieuxplan'];
  var t = 'Le Pisteur a ouvert le passage : ce vieux plan, c\'est celui de ce qu\'il y a là-dessous ! Le Pisteur, lui, ne verra que de la brume : c\'est toi qui dis le chemin, à voix haute !';
  var l = [];
  l.push(C['page:dechiree'] ? ['✅', 'Le morceau déchiré est recollé.'] : ['✂️', 'Il manque un coin à ce plan.']);
  if(C['rune:lumiere']) l.push(posee ? ['✨', 'Ta pierre de rune t\'attend sur le plan déroulé : là, elle se promène partout.'] : ['🪨', 'Tu as une pierre de rune dans ta poche : pose-la sur le plan, juste au-dessus.']);
  return '<div class="ds-plan-nuit"><p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p>' +
    '<ul class="lv-lignes ds-plan-notes">' + l.map(function(x){ return '<li><span class="lv-lignes-ic" aria-hidden="true">' + x[0] + '</span><p>' + esc(x[1]) + '</p>' + lire(x[1]) + '</li>'; }).join('') + '</ul></div>';
};
M.donjonPageSage = M.donjonPlanBloc;   /* (l'ancien nom) */

/* --- les pages de sauvegarde --- */
function pagesSauve(){ return [1, 2].concat(dj()['page:blanche'] ? [4] : []); }
function nomPage(n){ return n === 4 ? 'La page trouvée' : 'Page n° ' + n; }
M.sauvegardesHTML = function(){
  var P = M.P(), E = P.donjonPages || {};
  var t = 'Chaque page blanche garde un sort de sauvegarde. Écris-le, puis montre son code au Pisteur : il le tape quand l\'équipe est au calme, jamais pendant un combat. Un sort ne sert qu\'une fois.';
  var s = '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p><div class="ds-pages">';
  pagesSauve().forEach(function(n){
    var e = E[n], code = M.code('donjon:sauve:' + n), nom = nomPage(n);
    if(!e) s += '<button class="ds-page ds-blanche" data-act="ds-ecrire" data-n="' + n + '"><b>' + nom + '</b><i aria-hidden="true">✦</i><small>Écrire le sort</small></button>';
    else if(e === 'barree') s += '<div class="ds-page ds-barree"><b>' + nom + '</b><div class="ds-code-barre">' + M.codeHTML(code, true) + '</div><small>Sort utilisé</small></div>';
    else s += '<div class="ds-page ds-ecrite"><b>' + nom + '</b>' + M.codeHTML(code, true) + '<button class="btn petit" data-act="ds-barrer" data-n="' + n + '">✔️ Le Pisteur l\'a tapé</button></div>';
  });
  return s + '</div>';
};
A['ds-ecrire'] = function(el){
  var P = M.P(), n = +el.dataset.n; if(pagesSauve().indexOf(n) < 0) return;
  P.donjonPages = P.donjonPages || {}; if(P.donjonPages[n]) return;
  P.donjonPages[n] = 'ecrite'; M.son('magie'); M.sauver(); M.UI.garderDefilement = true; M.render();
};
A['ds-barrer'] = function(el){
  var P = M.P(), n = +el.dataset.n; if(!P.donjonPages || P.donjonPages[n] !== 'ecrite') return;
  P.donjonPages[n] = 'barree'; M.son('clic'); M.sauver(); M.UI.garderDefilement = true; M.render();
};

/* --- le carnet de l'aventurier --- */
function monstresDuCarnet(){ var C = dj(), K = CARNET(); return K.ordre.filter(function(m){ return C['carnet:aventurier'] || C['etude:' + m]; }); }
M.carnetAventurierHTML = function(){
  var l = monstresDuCarnet(), K = CARNET(), entier = !!dj()['carnet:aventurier'];
  var t = entier ? 'Le carnet d\'un aventurier, trouvé à l\'entrée du donjon. Il a tout noté : chaque monstre qu\'il a croisé a sa page. À toi de voir ce que ça vous apprend.'
    : 'Des pages d\'un vieux carnet : un aventurier est passé par ici avant vous. Il raconte les monstres qu\'il a croisés.';
  return '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p><div class="ds-betes">' + l.map(function(m){
    return '<button class="ds-bete" data-act="ds-bete" data-m="' + esc(m) + '">' + portrait(m) + '<b>' + esc(K.noms[m] || m) + '</b></button>';
  }).join('') + '</div>';
};
A['ds-bete'] = function(el){ M.son('page'); M.ouvrir({type:'descente', vue:'bete', m:el.dataset.m}); };
/* (aller à une page du Grand Livre, depuis une fenêtre) */
A['ds-livre'] = function(el){
  var P = M.P(), id = el.dataset.id; M.UI.modal = null; M.son('page');
  if(P.onglet !== 'role' || !M.livreAller || !M.livreAller(id, true)){ P.onglet = 'role'; M.UI.livrePage = id; M.sauver(); M.render(); }
};

/* --- les fenêtres qu'un code du donjon ouvre (M.descenteHTML, plus haut) --- */
function fen(ic, titre, t, boutons){ return '<div class="b-grand-ic">' + ic + '</div><h2>' + esc(titre) + '</h2><p>' + esc(t) + ' ' + lire(titre + '. ' + t) + '</p>' + boutons; }
var PLUS_TARD = '<button class="btn second" data-act="fermer">Plus tard</button>';
var VUES = {
  /* (Romain, 19 novembre, 10 h 22 : « quand on tape ce code, une fenêtre avec le personnage avec la tenue […] tu modifies pas le personnage
     […] la tête, les yeux, la coiffure, la couleur de peau, l'âge […] un bouton super, ok ») le Pisteur, le Sage, l'Alchimiste */
  tenueMel:function(m){
    var role = M.role(), t = m.t || 'Mélusine a tenu parole : ta tenue de combat est prête.';
    return tenueCadre([role]) + '<h2>' + esc('Ta tenue de combat') + '</h2><p>' + esc(t) + ' ' + lire('Ta tenue de combat. ' + t) + '</p>' +
      '<button class="btn grand b-aller" data-act="fermer">👍 Super, OK !</button>';
  },
  'carnet-recu':function(){
    return fen('📓', 'Un vieux carnet', 'Un vieux carnet, trouvé à l\'entrée du donjon. Quelqu\'un est passé par ici avant vous : un aventurier, qui a tout noté. Chaque monstre qu\'il a croisé a sa page. Tu le gardes dans ton Grand Livre.',
      '<button class="btn grand b-aller" data-act="ds-livre" data-id="aventurier">📖 Ouvrir le carnet</button>' + PLUS_TARD);
  },
  bete:function(m){
    var K = CARNET(), L = K.livre[m.m] || [], nom = K.noms[m.m] || m.m;
    var s = '<div class="ds-bete-page">' + portrait(m.m) + '<h2>' + esc(nom) + ' ' + lire(nom) + '</h2>';
    if(m.nouveau){ var t0 = 'Le carnet s\'ouvre à la bonne page : c\'est bien ce monstre-là. L\'aventurier raconte ce qui lui est arrivé.'; s += '<p class="ds-suite">' + esc(t0) + ' ' + lire(t0) + '</p>'; }
    s += L.map(function(t){ return '<p class="ds-recit">' + esc(t) + ' ' + lire(t) + '</p>'; }).join('') + '</div>';
    return s + '<button class="btn grand b-aller" data-act="fermer">' + (m.nouveau ? 'C\'est noté' : 'Refermer la page') + '</button>';
  },
  /* (17 novembre, étape 4) la pierre de rune rejoint la poche du Sage (E.pierres) : il la pose sur le vieux plan, dans son Grand Livre —
     le même geste que le matin avec la pierre de Tim */
  rune:function(){
    return fen('🪨', 'Une pierre de rune !', 'La pierre que le Pisteur a trouvée se met à briller dans ta main… Une rune de lumière ! Elle rejoint ta poche. Pose-la sur le vieux plan, dans ton Grand Livre : on verra bien ce qu\'elle réveille.',
      '<button class="btn grand b-aller" data-act="ds-livre" data-id="vieuxplan">📖 Ouvrir le Grand Livre</button>' + PLUS_TARD);
  },
  coin:function(){
    return fen('📜', 'Le morceau perdu du plan', 'Le Pisteur a trouvé le morceau déchiré de ton plan, dans la bibliothèque engloutie. Pose-le à sa place : les bords se recollent tout seuls…',
      '<button class="btn grand b-aller" data-act="ds-plan" data-nouveau="page:dechiree">🗺️ Regarder le plan</button>' + PLUS_TARD);
  },
  blanche:function(){
    return fen('✨', 'Une page blanche', 'Le Pisteur l\'a trouvée en fouillant. Elle se glisse dans ton Grand Livre : une sauvegarde de plus !',
      '<button class="btn grand b-aller" data-act="ds-livre" data-id="sauvegardes">📖 Ouvrir le Grand Livre</button>' + PLUS_TARD);
  },
  givre:function(){
    return fen('❄️', 'La fleur de givre', 'Le Pisteur t\'envoie une fleur de givre, cueillie tout au fond des souterrains. Elle ne fond jamais… Elle t\'attend sur ton établi : il y a du travail !',
      '<button class="btn grand b-aller" data-act="ds-etabli">🌿 Aller à l\'établi</button>' + PLUS_TARD);
  },
  /* (16 novembre, Romain, 15 h : « oui » à la mousse lumineuse — Bible §13.55) une vraie plante des grottes, Schistostega pennata,
     « l'or des lutins ». Un brin se pose sur la paillasse d'analyse (obj:mousse : la loupe, le microscope, la bougie — on y apprend
     qu'elle ne fabrique pas de lumière, elle la renvoie) ; le reste se mélange dans le chaudron du donjon, avec le miel et le souci :
     la mousse n'est qu'un ingrédient. L'analyse n'est pas obligatoire : le chaudron marche sans elle. */
  lumiere:function(){
    var vue = !!(M.P().analyses || {}).mousse;
    return fen('🌿', 'De la mousse lumineuse', vue ? 'La mousse lumineuse du Pisteur t\'attend : elle se mélange dans ton chaudron du donjon.'
        : 'Le Pisteur t\'envoie une mousse qui brille dans le noir. Un brin t\'attend sur ta paillasse : regarde-le de près ! Le reste se mélange dans ton chaudron du donjon.',
      (vue ? '' : '<button class="btn grand b-aller" data-act="ds-labo">🔬 La regarder de près</button>') +
      '<button class="btn grand b-aller" data-act="ds-chaudron">🫕 Le chaudron du donjon</button>' + PLUS_TARD);
  }
};
A['ds-etabli'] = function(){ M.UI.modal = null; M.render(); if(M.ouvrirEtabli) M.ouvrirEtabli(); };
/* la mousse lumineuse, sur la paillasse d'analyse : on va à l'atelier, et le labo s'ouvre */
A['ds-labo'] = function(){ M.UI.modal = null; M.P().onglet = 'role'; M.render(); if(M.laboDispo && M.laboDispo() && M.ouvrirLabo) M.ouvrirLabo(); };
/* (la mousse lumineuse : l'ancienne page du chaudron du donjon, qui reçoit la plante toute seule) */
A['ds-chaudron'] = function(){
  var C = cfg(), P = M.P(); if(!C || M.role() !== 'alchimiste') return;
  var u = C.pages.alchimiste + '?enquete=' + P.id + '&jeton=' + encodeURIComponent(jeton()) + '&recu=' + encodeURIComponent('plante:lumiere');
  P.vus['donjon:ouvert:alchimiste'] = 1; M.sauver(); if(M.stop) M.stop(); M.son('pas');
  if(window.BRUMEVAL_SANS_DONJON){ window.__donjonVers = u; M.UI.modal = null; M.render(); return; }
  try{ sessionStorage.setItem(CLE_RETOUR, P.donjonJeton); }catch(e){}
  noterDepart(P.donjonJeton);
  M.UI.modal = null;
  window.location.href = u;
};
/* Un code du donjon tapé dans l'enquête (traiterCode) : id = « donjon:<sorte>:<quoi> ». Rend true quand c'est traité. */
M.codeDonjon = function(id){
  var P = M.P(), role = M.role(), k = String(id).split(':'), sorte = k[1], quoi = k[2], pour = POUR_DONJON[sorte], court = sorte + ':' + quoi;
  if(!P || !cfg() || !pour) return false;
  if(pour === 'pisteur'){
    M.son('ko');
    if(role === 'pisteur') M.ouvrir({type:'info', ic:'🕯️', titre:'Un code du donjon', t:'Ce code-là se tape dans le donjon : sur l\'écran du donjon, avec le bouton « 📜 Un code ».'});
    else M.ouvrir({type:'info', ic:'🤝', titre:'Ce code est pour un équipier', t:'Ce code est pour le Pisteur : il le tape dans le donjon.'});
    return true;
  }
  if(pour !== role){
    M.son('ko');
    M.ouvrir({type:'info', ic:'🤝', titre:'Ce code est pour un équipier', t:'Ce code est pour ' + (D.ROLES[pour] ? D.ROLES[pour].le : pour) + ' : dis-lui de le taper sur sa tablette !'});
    return true;
  }
  M.UI.ecran = 'enquete';
  var C = dj(), deja = !!C[court], vue = null, note = null;
  C[court] = 1;
  if(sorte === 'carnet'){ P.vus['donjon:carnet'] = 1; vue = {vue:'carnet-recu'}; note = ['Le carnet de l\'aventurier est dans ton Grand Livre : chaque monstre du donjon y a sa page.', '📓']; }
  else if(sorte === 'etude'){
    if(!CARNET().livre[quoi]){ delete C[court]; return false; }
    P.vus['donjon:carnet'] = 1; vue = {vue:'bete', m:quoi, nouveau:!deja}; note = ['Le carnet de l\'aventurier, à la page : ' + (CARNET().noms[quoi] || quoi) + '.', '📓'];
  }
  else if(court === 'rune:lumiere'){ P.vus['donjon:rune'] = 1; vue = {vue:'rune'}; note = ['Une pierre de rune, dans ta poche : à poser sur le vieux plan, dans ton Grand Livre.', '🪨']; }
  else if(court === 'page:dechiree'){ vue = {vue:'coin'}; note = ['Le morceau déchiré du plan des souterrains est retrouvé.', '📜']; }
  else if(court === 'page:blanche'){ vue = {vue:'blanche'}; note = ['Une page blanche de plus dans ton Grand Livre : une sauvegarde de plus.', '✨']; }
  else if(court === 'plante:givre'){ if(M.recevoirPlanteRare) M.recevoirPlanteRare('givre'); vue = {vue:'givre'}; note = ['Le Pisteur t\'a envoyé une fleur de givre : elle t\'attend sur ton établi.', '❄️']; }
  else if(court === 'plante:lumiere'){ P.recus['obj:mousse'] = true;   /* (16 novembre) un brin sur la paillasse d'analyse (E.labo, E.objets.mousse) */
    vue = {vue:'lumiere'}; note = ['Le Pisteur t\'a envoyé de la mousse lumineuse : un brin sur ta paillasse, le reste pour ton chaudron du donjon.', '🌿']; }
  else { delete C[court]; return false; }
  if(!deja && note) M.noter(note[0], note[1]);
  M.son(deja ? 'clic' : 'gain'); M.sauver();
  M.ouvrir(Object.assign({type:'descente'}, vue));
  return true;
};
/* dans le sac de l'Alchimiste, la nuit (plantes.js) : le chaudron du donjon n'est plus là que pour la mousse lumineuse, une fois reçue */
M.donjonBoutonAlchimiste = function(){
  if(!cfg() || M.role() !== 'alchimiste' || !nuit() || !dj()['plante:lumiere']) return '';
  var t = 'Ta mousse lumineuse t\'attend dans ton chaudron du donjon.';
  return '<p class="ds-suite">' + esc(t) + ' <button type="button" class="b-lire" data-pl="lire" data-t="' + esc(t) + '" aria-label="Écouter">🔊</button></p>' +
    '<button type="button" class="btn b-aller" data-pl="donjon">🫕 Le chaudron du donjon</button>';
};

/* ---------- Au retour : on relit ce que les pages du donjon ont gardé dans la tablette ---------- */
var aMontrer = false;
function relire(){
  var P = M.P(), C = cfg();
  if(!P || !C || P.etape !== 'jeu' || !P.donjonJeton || M.UI.ecran !== 'enquete') return;   /* (dans l'enquête seulement : pas sur la place du village) */
  var role = M.role(), change = false;
  if(role === 'pisteur' && P.vus['donjon:parti'] && !P.vus['donjon:fini']){
    var d = json(CLE_PISTEUR);
    if(d && d.jeton === P.donjonJeton && d.faits){
      if(d.faits['code:porte:odette'] && !P.vus['donjon:porte']){
        /* (17 novembre, 7 h 12) plus de code « Odette est derrière la porte » : ça se dit à voix haute */
        P.vus['donjon:porte'] = 1; change = true;
        M.noter('Dans le donjon : Moustache gratte au bas d\'une grande porte ronde, marquée de quatre signes. Derrière, la voix d\'Odette : elle est vivante ! (À dire à voix haute.)', '🐈');
      }
      /* (13 novembre, Bible §13.33) en entrant dans la dernière salle : le code pour le Barde ; Léo battu : il parle, le code pour le Sage */
      if(d.faits['code:leo:salle'] && !P.vus['donjon:leo_la']){
        P.vus['donjon:leo_la'] = 1; P.objets['_info:leo_la'] = true; change = true;
        M.noter('Tout au fond du donjon : un homme en cape noire, grand et fort, nous attendait.', '🧥');
      }
      if(d.faits.fin){
        P.vus['donjon:fini'] = 1; P.vus['donjon:leo'] = 'battu'; P.objets['_info:leo_battu'] = true; change = true; aMontrer = true;
        M.noter('Léo, l\'apprenti du meunier, se cachait sous la cape noire. Battu, il a parlé : le maire a tout préparé, depuis le début.', '🧑');
      }
    }
  }
  if(change) M.sauver();
}
function montrer(){
  if(!aMontrer || (M.UI && M.UI.modal)) return;
  var P = M.P(), role = M.role(); aMontrer = false;
  if(role === 'pisteur') M.ouvrir({type:'descente', vue:'fin'});
}
var render0 = M.render;
M.render = function(){
  try{ relire(); }catch(e){ console.error(e); }
  var r = render0.apply(this, arguments);
  if(aMontrer) setTimeout(function(){ try{ montrer(); }catch(e){ console.error(e); } }, 350);
  return r;
};
M.donjonRelire = relire;
/* On remonte du donjon (la page du donjon ramène ici) : le jeu s'ouvre d'habitude sur la place du village ; là, on revient tout droit
   dans l'enquête, à la carte. (sessionStorage : seulement dans cet onglet, seulement si on est parti d'ici avec ce jeton.)
   (13 novembre, le bug du Pisteur qui remontait en Alchimiste : moteur-base.js, « Un héros ne prend jamais la place d'un autre ».)
   La page du donjon revient maintenant avec « ?retour=<le jeton de la descente> » : on retrouve le héros de CETTE descente dans les
   emplacements de l'appareil (M.emplacementDuJeton), quel que soit ce que l'onglet a retenu ; et l'adresse retrouve son « #test »
   (sans lui, l'enquête 3, encore fermée aux joueurs, se croyait « en cours d'écriture » au retour). */
function noterDepart(j){
  try{
    var d = json(CLE_DEPART) || {}, l;
    d[j] = {hash:location.hash || '', t:Date.now()};
    l = Object.keys(d).sort(function(a, b){ return (d[b].t || 0) - (d[a].t || 0); });
    l.slice(8).forEach(function(k){ delete d[k]; });
    localStorage.setItem(CLE_DEPART, JSON.stringify(d));
  }catch(e){}
}
function remettreAdresse(j){
  try{
    var d = (json(CLE_DEPART) || {})[j] || {}, u = new URL(location.href), avant = u.search + u.hash;
    u.searchParams.delete('retour');
    var q = u.searchParams.toString(), h = u.hash || d.hash || '';
    if((q ? '?' + q : '') + h !== avant) history.replaceState(null, '', u.pathname + (q ? '?' + q : '') + h);
  }catch(e){}
}
var retourJeton = null;
(function(){
  var j = null;
  try{ (location.search || '').replace(/^\?/, '').split('&').forEach(function(x){ var k = x.split('='); if(k[0] === 'retour') j = decodeURIComponent(k[1] || ''); }); }catch(e){}
  if(!j) return;
  remettreAdresse(j);
  var n = M.emplacementDuJeton ? M.emplacementDuJeton(j) : 0;
  if(!n) return;
  retourJeton = j;
  M.choisirEmplacement(n);   /* (avant le démarrage du jeu, qui relit cet emplacement ; ou après : le héros est remplacé tout de suite) */
})();
function revenir(){
  var j = retourJeton;
  try{ j = j || sessionStorage.getItem(CLE_RETOUR); sessionStorage.removeItem(CLE_RETOUR); }catch(e){}
  retourJeton = null;
  if(j) remettreAdresse(j);
  var Sx = M.S, P = Sx && Sx.e;
  if(!j || !Sx || !Sx.heros || !P || P.etape !== 'jeu' || P.defaite || P.donjonJeton !== j || !cfg()) return;
  M.UI.ecran = 'enquete'; M.UI.modal = null; M.UI.pile = [];
  if(M.role() !== 'sage') P.onglet = 'carte';
  M.render();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ try{ revenir(); }catch(e){ console.error(e); } });
else { try{ revenir(); }catch(e){ console.error(e); } }
/* (le bouton « retour » du navigateur peut rendre la page telle qu'on l'a quittée, sans la recharger : on relit quand même) */
window.addEventListener('pageshow', function(ev){
  if(!ev.persisted) return;
  try{ sessionStorage.removeItem(CLE_RETOUR); }catch(e){}
  try{ if(M.S && M.S.e){ M.UI.modal = null; M.render(); } }catch(e){ console.error(e); }
});

/* ---------- Les codes ---------- */
/* un code qui sert DANS le donjon (I.donjon : la Grosse Marie, le maire retenu), tapé ici par le Pisteur : on lui dit où le taper */
var special0 = M.codeSpecial;
M.codeSpecial = function(t, x, id){
  var E = enquete(), I = t === 'info' && E && E.infos ? E.infos[x] : null, P = M.P();
  /* « On va dans la crypte » (I.tenue), tapé par le Sage ou l'Alchimiste : la fenêtre de la tenue de combat, et leur code pour le
     Pisteur. Retapé : la même fenêtre (pour retrouver son code). */
  if(I && I.tenue && cfg()){
    if(!P.recus[id]){ P.recus[id] = true; M.noter('Reçu : ' + I.nom + '. ' + (I.t || ''), I.ic); M.son('gain'); M.sauver(); } else M.son('clic');
    M.ouvrir({type:'descente', vue:'tenue'});
    return true;
  }
  /* « Les sept potions » (E.infos.sac_pret), tapé par le Pisteur : les sept potions entrent dans son sac, sans rien dire de tenue ni de donjon */
  if(t === 'info' && x === 'sac_pret' && P && cfg() && M.role() === 'pisteur'){
    if(!P.recus[id]){ P.recus[id] = true; M.noter('Les sept potions de l\'Alchimiste sont dans ton sac.', '🧪'); M.son('gain'); } else M.son('clic');
    if(M.sacTout) M.sacTout();
    M.sauver();
    M.ouvrir({type:'descente', vue:'potions'});
    return true;
  }
  /* AU CACHOT, à la fin de l'histoire : le code d'allure d'un ami, tapé sous l'image — son héros apparaît à côté du mien */
  if(t === 'allure' && P && P.etape === 'fin'){
    var af = M.allureDe(x);
    if(af.role === M.role()){ M.son('clic'); M.toast('C\'est ton code à toi ! Tape celui d\'un ami.'); M.render(); return true; }
    allureRecue(P, af);
    M.son('gain'); M.sauver(); M.UI.modal = null; M.render();
    return true;
  }
  /* le code du visage (la coiffure, les yeux, la barbe) : il habille le héros dont on vient de taper le code d'allure */
  if(t === 'visage' && P && (P.etape === 'fin' || cfg())){
    var qui = P.allureDernier, ah = qui && P.allures && P.allures[qui];
    if(!ah){
      M.son('ko');
      M.ouvrir({type:'info', ic:'💇', titre:'Le visage de qui ?', t:'Ce code habille un ami… mais lequel ? Tape d\'abord son premier code, celui de sa tenue, puis celui-ci.'});
      return true;
    }
    var vz = M.visageDe(x, ah.sexe);
    ah.coiffure = vz.coiffure; ah.yeux = vz.yeux; ah.barbe = vz.barbe; ah.vu = true;
    M.son('gain'); M.sauver();
    if(P.etape === 'fin'){ M.UI.modal = null; M.render(); }
    else M.ouvrir({type:'descente', vue:'recu', role:qui, visage:true});
    return true;
  }
  /* le code d'allure d'un équipier, tapé par le Pisteur : son héros, tel qu'on le verra dans le donjon. Celui de l'Alchimiste apporte
     aussi ses sept potions (il ne l'a que quand elles sont toutes prêtes : plantes.js, M.sacTout). */
  if(t === 'allure' && cfg()){
    var a = M.allureDe(x), av = P.allures && P.allures[a.role], deja = !!(av && av.sexe === a.sexe && av.peau === a.peau && av.cheveux === a.cheveux && av.age === a.age);
    allureRecue(P, a); P.recus['allure:' + a.role] = true;
    if(a.role === 'alchimiste' && M.sacTout) M.sacTout();
    if(!deja) M.noter(a.role === 'sage' ? 'Le Sage a enfilé sa tenue de combat.' : 'L\'Alchimiste a enfilé sa tenue de combat. Ses sept potions sont prêtes.', '🛡️');
    M.son('gain'); M.sauver();
    M.ouvrir({type:'descente', vue:'recu', role:a.role});
    return true;
  }
  if(I && I.donjon && cfg()){
    M.son('clic');
    M.ouvrir({type:'info', ic:I.ic, titre:I.nom, t:'Ce code-là se tape dans le donjon, pas ici : sur l\'écran du donjon, avec le bouton « 📜 Un code ».'});
    return true;
  }
  return special0 ? special0.apply(this, arguments) : false;
};
})();
