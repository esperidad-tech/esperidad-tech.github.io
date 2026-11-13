/* ==========================================================
   Brumeval — mini-jeux du Sage, nouvelle version (retours du 2 nov.)
   « L'alphabet secret » ('alphabet') et « Assembler les runes » ('runes').
   Chargé APRÈS mj-barde-sage.js : réenregistre ces deux types (même contrat MJ).

   ALPHABET ('alphabet')
     Un système de codage tiré au hasard à chaque partie (9 systèmes, chacun
     avec sa propre clé) : grilles des fondateurs (pigpen), roue de César,
     symboles du sorcier, code des nombres, carré des coordonnées, miroir /
     reflet dans l'eau, points et traits (morse), lettres échangées, petits
     danseurs. Le parchemin est abîmé (taches, brûlures, déchirures, encre
     effacée) : certaines lettres se devinent seulement avec le mot.
     Le joueur touche N'IMPORTE QUELLE case, choisit une lettre au clavier,
     dans l'ordre qu'il veut, peut changer d'avis, puis valide.
     Une validation fausse coûte un cœur. Plus de temps ou plus de cœurs : perdu.
     params : message (texte, accents enlevés ; sinon un message d'exemple),
              systeme (id ou liste d'ids, sinon au hasard sans répéter le dernier),
              lettresDonnees (lettres déjà connues : tableau ou chaîne).
     mods   : aide (+N lettres offertes), revele (parchemin moins abîmé, signes
              pareils remplis ensemble), temps (+N s), lent (<1 : temps ÷ lent),
              erreurs (+N cœurs), zone (>1 : cases et clavier plus grands),
              facile (géré par le cœur).
     Résultat : {reussi, score, erreurs (validations ratées), message, detail,
              message_dechiffre (si réussi), systeme}
     Crochet de test : window.__mjsAlpha (systeme, message, cases, plan).

   RUNES ('runes')
     Une image découpée en pièces mélangées et tournées : la pierre de runes
     (params.symbole), la carte de Brumeval, le blason des fondateurs ou
     l'horloge de la mairie (params.image ∈ runes, carte, blason, horloge ;
     sinon au hasard). Toucher = tourner d'un quart de tour ; glisser sur une
     autre pièce = échanger. PAS de minuteur : un nombre de coups limité
     (le minimum possible + une marge qui fond avec le niveau). Plus de coups :
     tant pis.
     mods : erreurs (+3 coups par point), aide (N pièces déjà posées et
            bloquées), moins (N tailles de grille en moins = moins de pièces),
            pouce (N « coups de pouce » : chacun pose 2 pièces), revele
            (image fantôme sur le plateau), facile (cœur).
     Résultat : {reussi, score, coups, optimum, image, message, detail}
     Crochet de test : window.__mjsRunes.etat()

   Aucune lecture à voix haute automatique. fin() est appelé une seule fois,
   jamais après arreter().
   ========================================================== */
(function(){
'use strict';
if(!window.MJ || !MJ.enregistrer){ if(window.console) console.error('mj-sage-codes : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util;
var compteur = 0;

/* ---------- Outils ---------- */
function esc(s){ return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function plage(n){ var a = []; for(var i = 0; i < n; i++) a.push(i); return a; }
function f1(x){ return Math.round(x * 10) / 10; }
function f2(x){ return Math.round(x * 100) / 100; }
function minuteurs(){
  var ids = [];
  return {
    t:function(fn, ms){ var id = setTimeout(fn, ms); ids.push(id); return id; },
    i:function(fn, ms){ var id = setInterval(fn, ms); ids.push(id); return id; },
    tout:function(){ ids.forEach(function(id){ clearTimeout(id); clearInterval(id); }); ids = []; }
  };
}
function sansAccents(s){
  s = String(s).replace(/Œ/g, 'OE').replace(/œ/g, 'oe').replace(/Æ/g, 'AE').replace(/æ/g, 'ae');
  return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
}
function graine(g){ return function(){ g |= 0; g = g + 0x6D2B79F5 | 0; var t = Math.imul(g ^ g >>> 15, 1 | g); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hachage(s){ var h = 2166136261; s = String(s); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function secoue(node){ if(!node) return; node.classList.remove('mjs-secoue'); void node.offsetWidth; node.classList.add('mjs-secoue'); }
function fmtTemps(s){ s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
function dureeTxt(s){ s = Math.round(s / 5) * 5; var m = Math.floor(s / 60), r = s % 60; return m ? m + ' min' + (r ? ' ' + (r < 10 ? '0' : '') + r : '') : r + ' s'; }
function retenir(cle, v){ try{ localStorage.setItem('brumeval-mjs-' + cle, v); }catch(e){} }
function rappeler(cle){ try{ return localStorage.getItem('brumeval-mjs-' + cle); }catch(e){ return null; } }
/* tirage au hasard qui évite de reprendre le même que la dernière fois */
function tirerSans(liste, cle){
  var dernier = rappeler(cle), pool = liste.length > 1 ? liste.filter(function(x){ return x !== dernier; }) : liste;
  var c = U.choix(pool); retenir(cle, c); return c;
}
function observer(el, fn){
  var ro = null, raf = 0;
  function planifier(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); }
  if(window.ResizeObserver){ ro = new ResizeObserver(planifier); ro.observe(el); }
  else window.addEventListener('resize', planifier);
  fn();
  return function(){ cancelAnimationFrame(raf); if(ro) ro.disconnect(); else window.removeEventListener('resize', planifier); };
}

/* Petit « clac » de pierre (Web Audio), respecte l'option son du moteur */
var audio = null;
function sonActif(){ try{ return !(window.Brume && Brume.sonActif && !Brume.sonActif()); }catch(e){ return true; } }
function clac(fort){
  if(!sonActif()) return;
  try{
    var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
    if(!audio) audio = new AC();
    if(audio.state === 'suspended' && audio.resume) audio.resume();
    var t = audio.currentTime + .005, sr = audio.sampleRate, n = Math.floor(sr * .045);
    var buf = audio.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
    var src = audio.createBufferSource(); src.buffer = buf;
    var bp = audio.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 1.4;
    var g = audio.createGain(); g.gain.value = fort ? .9 : .6;
    src.connect(bp); bp.connect(g); g.connect(audio.destination); src.start(t);
    var o = audio.createOscillator(), g2 = audio.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(fort ? 640 : 520, t); o.frequency.exponentialRampToValueAtTime(190, t + .07);
    g2.gain.setValueAtTime(.0001, t); g2.gain.exponentialRampToValueAtTime(.22, t + .004); g2.gain.exponentialRampToValueAtTime(.0001, t + .11);
    o.connect(g2); g2.connect(audio.destination); o.start(t); o.stop(t + .12);
  }catch(e){}
}

/* Démo commune : une petite main qui montre les gestes */
function demoMain(el, html, duree, etapes){
  el.innerHTML = '<div class="mjs-demo">' + html + '<span class="mjs-main" aria-hidden="true">👆</span></div>';
  var box = el.firstChild, main = box.querySelector('.mjs-main'), T = minuteurs();
  var c = {
    box:box, T:T,
    q:function(s){ return box.querySelector(s); },
    qa:function(s){ return box.querySelectorAll(s); },
    va:function(x, y){ main.style.left = x + '%'; main.style.top = y + '%'; },
    tape:function(){ main.classList.remove('tape'); void main.offsetWidth; main.classList.add('tape'); }
  };
  function tour(){ etapes.forEach(function(e){ T.t(function(){ e[1](c); }, e[0]); }); T.t(tour, duree); }
  tour();
  return {arreter:T.tout};
}

/* ==========================================================
   ALPHABET — données
   ========================================================== */
var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var MORSE = {A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....', I:'..', J:'.---', K:'-.-', L:'.-..', M:'--',
  N:'-.', O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..'};
var MOTS_CLES = ['BRUMEVAL', 'LANTERNE', 'CORBEAU', 'CLOCHER', 'MOULIN', 'FONDATEUR', 'GRIMOIRE'];
function ordreMotCle(mot){
  var vu = {}, r = [];
  (mot + ABC.join('')).split('').forEach(function(l){ if(!vu[l] && /[A-Z]/.test(l)){ vu[l] = 1; r.push(l); } });
  return r;
}
/* Messages d'exemple (salle d'entraînement) : mots simples, faciles à deviner */
var BANQUE = {
  court:['LE CHAT DORT', 'VA AU PUITS', 'SUIS LA LUNE', 'OUVRE LA PORTE', 'LA CLE EST ICI', 'VIENS AU PONT', 'BOIS LA POTION',
    'LE LOUP DORT', 'CACHE LA CARTE', 'REGARDE EN HAUT', 'PRENDS LA LANTERNE'],
  moyen:['MINUIT AU CLOCHER', 'LE TRESOR EST AU MOULIN', 'REGARDE SOUS LE PONT', 'LA PORTE EST AU LAVOIR', 'LE CORBEAU VOLE LA NUIT',
    'ODETTE A SEPT CHATS', 'LA CLOCHE SONNE A MIDI', 'CHERCHE PRES DU VIEUX CHENE', 'LE MAIRE PORTE DES GANTS', 'SUIS LES TRACES DU RENARD'],
  long:['RENDEZ VOUS SOUS LE VIEUX CHENE', 'LE CORBEAU CACHE SA PLUME AU MOULIN', 'LES FONDATEURS ONT CACHE UNE CARTE',
    'UN PASSAGE SECRET PART DU PUITS', 'LA FARINE DISPARAIT CHAQUE NUIT', 'LE TRESOR DORT SOUS LA VIEILLE TOUR', 'LA LANTERNE BRILLE DANS LA FORET']
};
function banquePour(n){ return n <= 2 ? BANQUE.court : n <= 5 ? BANQUE.moyen : n <= 7 ? BANQUE.moyen.concat(BANQUE.long) : BANQUE.long; }

/* 31 symboles du sorcier (on en tire 26 à chaque partie) — viewBox 30×30 */
var SYMB = [
  {d:'M19 5A10 10 0 1 0 25 21A8 8 0 1 1 19 5Z'},
  {d:'M15 2.5V6.5M15 23.5V27.5M2.5 15H6.5M23.5 15H27.5M6.2 6.2L9 9M21 21L23.8 23.8M6.2 23.8L9 21M21 9L23.8 6.2', o:[[15, 15, 5]]},
  {d:'M15 3L18.4 11.3L27 11.8L20.4 17.6L22.6 26.5L15 21.7L7.4 26.5L9.6 17.6L3 11.8L11.6 11.3Z'},
  {d:'M3 15C8 7 22 7 27 15C22 23 8 23 3 15Z', p:[[15, 15, 3.6]]},
  {d:'M15 4L27 25H3Z', p:[[15, 18, 2.4]]},
  {d:'M15 15C17 13 19.5 16 17.5 18.5C14.5 21.5 10 18 11.5 13.5C13.5 8 21.5 9.5 22.5 15.5C23.5 22.5 14 26.5 8.5 21.5'},
  {d:'M12.6 12.6L25 25M19.5 19.5L22.5 16.5M23 23L26 20', o:[[9, 9, 5]]},
  {d:'M15 26V5M8 12L15 5L22 12'},
  {d:'M4 15C10 7 19 7 23 15C19 23 10 23 4 15ZM23 15L28 10V20Z', p:[[9.5, 13.5, 1.6]]},
  {d:'M15 3L24 15H19L26 24H4L11 15H6ZM15 24V28'},
  {d:'M3 11C7 7 11 15 15 11S23 7 27 11M3 20C7 16 11 24 15 20S23 16 27 20'},
  {d:'M15 27C8 27 6 20 9 15C11 18 12.5 17 12 14C11.5 9 15 6 17 3C18 9 24 12 23 19C22 24 19 27 15 27Z'},
  {d:'M15 3C19 10 23 14 23 19A8 8 0 0 1 7 19C7 14 11 10 15 3Z'},
  {d:'M15 26L5 15C1 10 5 4 10 5C12.5 5.5 14 7 15 9C16 7 17.5 5.5 20 5C25 4 29 10 25 15Z'},
  {d:'M4 23L6 9L11 16L15 6L19 16L24 9L26 23Z'},
  {d:'M15 4V26M4 15H26'},
  {d:'M15 3L26 15L15 27L4 15ZM15 10L20 15L15 20L10 15Z'},
  {d:'M7 4H23L15 15L23 26H7L15 15Z'},
  {d:'M5 25C5 12 13 5 26 5C26 18 18 25 5 25ZM5 25L18 12'},
  {d:'M3 13C8 9 12 11 15 17C18 11 22 9 27 13'},
  {d:'M9 21V14A6 6 0 0 1 21 14V21L24 24H6Z', p:[[15, 27, 2]]},
  {d:'M8 22A5 5 0 0 1 8 12A7 7 0 0 1 21 10A6 6 0 0 1 23 22Z'},
  {d:'M17 3L8 17H15L12 27L22 12H15Z'},
  {d:'M3 25L11 10L16 18L20 13L27 25Z'},
  {d:'M15 15C11 9 13 4 15 4C17 4 19 9 15 15C21 11 26 13 26 15C26 17 21 19 15 15C19 21 17 26 15 26C13 26 11 21 15 15C9 19 4 17 4 15C4 13 9 11 15 15Z'},
  {d:'M15 7V26M9 12H21M5 18C6 24 10 26 15 26C20 26 24 24 25 18', o:[[15, 4.5, 2.5]]},
  {d:'M4 15C4 6 26 6 26 15ZM11 15V25H19V15'},
  {d:'M5 14L15 5L25 14V26H5ZM12 26V19H18V26'},
  {d:'M8 22L22 8', o:[[15, 15, 10]]},
  {d:'M14 15H16M3 13L4 11', o:[[9, 15, 5], [21, 15, 5]]},
  {d:'M4 21L9 9L14 21L19 9L24 21'}
];
function symbSVG(k){
  var s = SYMB[k], h = '<svg class="mjs-svg" viewBox="0 0 30 30" aria-hidden="true"><path d="' + s.d + '"/>';
  (s.o || []).forEach(function(c){ h += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; });
  (s.p || []).forEach(function(c){ h += '<circle class="p" cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; });
  return h + '</svg>';
}
/* Grilles des fondateurs (pigpen) : case 0..25 → dessin */
var X_CHEMINS = ['M4 4L15 15L26 4', 'M4 4L15 15L4 26', 'M26 4L15 15L26 26', 'M4 26L15 15L26 26'];
function pigSVG(cell){
  var i = cell, d = '', point = false, cx = 15, cy = 15;
  if(i < 18){
    if(i >= 9){ point = true; i -= 9; }
    var r = Math.floor(i / 3), c = i % 3;
    if(r > 0) d += 'M4 4H26';
    if(r < 2) d += 'M4 26H26';
    if(c > 0) d += 'M4 4V26';
    if(c < 2) d += 'M26 4V26';
  } else {
    i -= 18; if(i >= 4){ point = true; i -= 4; }
    d = X_CHEMINS[i]; cx = [15, 8, 22, 15][i]; cy = [8, 15, 15, 22][i];
  }
  return '<svg class="mjs-svg" viewBox="0 0 30 30" aria-hidden="true"><path d="' + d + '"/>' + (point ? '<circle class="p" cx="' + cx + '" cy="' + cy + '" r="3"/>' : '') + '</svg>';
}
/* Points et traits */
function morseSVG(code){ /* points et traits, centrés */
  var x = 0, parts = '';
  code.split('').forEach(function(s, k){
    if(k) x += 3.2;
    if(s === '.'){ parts += '<circle class="p" cx="' + f1(x + 2.6) + '" cy="7" r="2.6"/>'; x += 5.2; }
    else { parts += '<rect class="p" x="' + f1(x) + '" y="4.6" width="10" height="4.8" rx="2.4"/>'; x += 10; }
  });
  return '<svg class="mjs-svg mjs-morse" viewBox="' + f1(-(42 - x) / 2) + ' 0 42 14" aria-hidden="true">' + parts + '</svg>';
}
/* Petits danseurs : deux bras parmi 8 directions, rangés comme le sémaphore */
var DIRS = [[0, 1], [.71, .71], [1, 0], [.71, -.71], [0, -1], [-.71, -.71], [-1, 0], [-.71, .71]];
var POSES = [];
(function(){ for(var a = 0; a < 8; a++) for(var b = a + 1; b < 8; b++) POSES.push([a, b]); })();
function danseurSVG(k){
  var po = POSES[k];
  function bras(ox, dir){
    var v = DIRS[dir], x = ox + v[0] * 9, y = 13 + v[1] * 9;
    return '<path d="M' + ox + ' 13L' + f1(x) + ' ' + f1(y) + '"/><circle class="p" cx="' + f1(x) + '" cy="' + f1(y) + '" r="2.3"/>';
  }
  return '<svg class="mjs-svg mjs-danse" viewBox="-2 0 34 36" aria-hidden="true"><circle cx="15" cy="7" r="3.4"/>' +
    '<path d="M15 10.5V23M15 23L10.5 33M15 23L19.5 33M10.5 13H19.5"/>' + bras(10.5, po[0]) + bras(19.5, po[1]) + '</svg>';
}

/* ==========================================================
   ALPHABET — les systèmes de codage
   Chaque système : nom, ic, facteur (temps), preparer(P), code(l, P),
   glyphe(code, P), cle(P) (HTML de la clé), expl(P), et :
   table:true  → clé en tableau de paires (efface / trous / melange selon le niveau)
   sansCache   → la clé ne perd pas de lettres (sa difficulté est ailleurs)
   deductible(P) → les lettres effacées de la clé se retrouvent avec l'ordre de l'alphabet
   ========================================================== */
var SYSTEMES = {
  pigpen:{nom:'Les grilles des fondateurs', ic:'#️⃣', facteur:1.05,
    expl:function(P){ return 'Chaque lettre a la forme de sa case dans les grilles, avec ou sans point.' + (P.melange ? ' Attention : ici, les lettres ne sont pas rangées dans l\'ordre !' : ''); },
    preparer:function(P){ P.melange = P.n >= 7; P.layout = P.melange ? ordreMotCle(U.choix(MOTS_CLES)) : ABC.slice(); P.idx = {}; P.layout.forEach(function(l, c){ P.idx[l] = c; }); },
    deductible:function(P){ return !P.melange; },
    code:function(l, P){ return P.idx[l]; },
    glyphe:function(c){ return pigSVG(c); },
    cle:function(P){ return schemaPig(P); }},
  cesar:{nom:'La roue de César', ic:'🎡', facteur:.95, sansCache:true,
    expl:function(){ return 'Chaque lettre a glissé de quelques places dans l\'alphabet. Tourne la roue : la lettre du dedans cache celle du dehors.'; },
    preparer:function(P){
      P.k = U.randInt(3, 23); P.effRoue = {};
      U.melanger(plage(26)).slice(0, Math.round(U.parNiveau(P.n, -2, 10, 0, 12))).forEach(function(i){ P.effRoue[i] = 1; });
    },
    code:function(l, P){ return ABC[(ABC.indexOf(l) + P.k) % 26]; },
    glyphe:function(c){ return '<span class="mjs-lt">' + c + '</span>'; },
    cle:function(P){ return cleRoue(P); }, brancher:function(pan, P){ return brancherRoue(pan, P); }},
  symboles:{nom:'Les symboles du sorcier', ic:'🔮', facteur:1.1, table:true,
    expl:function(){ return 'Chaque dessin remplace une lettre.'; },
    preparer:function(P){ P.formes = U.melanger(plage(SYMB.length)).slice(0, 26); },
    code:function(l, P){ return P.formes[ABC.indexOf(l)]; },
    glyphe:function(c){ return symbSVG(c); }},
  nombres:{nom:'Le code des nombres', ic:'🔢', facteur:1.05, sansCache:true,
    expl:function(P){ return 'Chaque nombre cache une lettre. Les nombres suivent l\'alphabet' + (P.variante === 'inverse' ? '… peut-être à l\'envers' : '') + ' : compte !'; },
    preparer:function(P){
      var n = P.n;
      P.variante = n <= 4 ? 'simple' : n <= 7 ? U.choix(['simple', 'decale']) : U.choix(['decale', 'inverse']);
      P.depart = P.variante === 'decale' ? U.randInt(3, 9) : 1;
      P.ancres = {};
      if(n <= 2) ABC.forEach(function(l, i){ P.ancres[i] = 1; });
      else if(n <= 4) ABC.forEach(function(l, i){ if(i % 2 === 0) P.ancres[i] = 1; });
      else if(n <= 6) [0, 5, 10, 15, 20, 25].forEach(function(i){ P.ancres[i] = 1; });
      else { var d = U.randInt(0, 4); [d, d + 9 + U.randInt(0, 3), d + 18 + U.randInt(0, 3)].forEach(function(i){ P.ancres[Math.min(25, i)] = 1; }); }
    },
    num:function(i, P){ return P.variante === 'inverse' ? 26 - i : P.variante === 'decale' ? P.depart + i : i + 1; },
    code:function(l, P){ return SYSTEMES.nombres.num(ABC.indexOf(l), P); },
    glyphe:function(c){ return '<span class="mjs-nb">' + c + '</span>'; },
    cle:function(P){ return '<div class="mjs-bande">' + ABC.map(function(l, i){ return '<span class="mjs-bc"><b>' + l + '</b><i>' + (P.ancres[i] ? SYSTEMES.nombres.num(i, P) : '') + '</i></span>'; }).join('') + '</div>'; }},
  grille:{nom:'Le carré des coordonnées', ic:'🧮', facteur:1.1,
    expl:function(P){ return '2-3 veut dire : ligne 2 (chiffre orange), colonne 3 (chiffre bleu).' + (P.melange ? ' Les lettres ne sont pas dans l\'ordre !' : ''); },
    preparer:function(P){ P.melange = P.n >= 7; P.layout = P.melange ? ordreMotCle(U.choix(MOTS_CLES)) : ABC.slice(); P.idx = {}; P.layout.forEach(function(l, c){ P.idx[l] = c; }); },
    deductible:function(P){ return !P.melange; },
    code:function(l, P){ var c = P.idx[l]; return (Math.floor(c / 6) + 1) + '-' + (c % 6 + 1); },
    glyphe:function(c){ var t = String(c).split('-'); return '<span class="mjs-co"><i>' + t[0] + '</i><s>-</s><u>' + t[1] + '</u></span>'; },
    cle:function(P){ return cleCarre(P); }},
  miroir:{nom:'Le miroir de Léonard', ic:'🪞', facteur:.85, sansCache:true,
    expl:function(P){ return P.variante === 'miroir' ? 'Écrit dans un miroir : chaque lettre est retournée, et on lit de DROITE à GAUCHE !' : 'C\'est le reflet du message dans l\'eau du lavoir : chaque lettre a la tête en bas.'; },
    preparer:function(P){ P.variante = U.choix(['miroir', 'eau']); P.manuscrit = P.n >= 7; },
    code:function(l){ return l; },
    glyphe:function(c, P){ return '<span class="mjs-lt mjs-' + P.variante + (P.manuscrit ? ' mjs-manu' : '') + '">' + c + '</span>'; },
    cle:function(P){ return cleMiroir(P); }},
  morse:{nom:'Points et traits', ic:'📡', facteur:1.2, table:true,
    expl:function(){ return 'Chaque lettre est faite de points et de traits.'; },
    code:function(l){ return MORSE[l]; },
    glyphe:function(c){ return morseSVG(c); }},
  substitution:{nom:'Les lettres échangées', ic:'🔀', facteur:1.3, table:true,
    expl:function(){ return 'Chaque lettre en cache une autre. Si la clé ne dit pas tout, trouve le reste avec les mots !'; },
    preparer:function(P){ var p; do{ p = U.melanger(ABC); } while(p.some(function(x, i){ return x === ABC[i]; })); P.perm = p; },
    code:function(l, P){ return P.perm[ABC.indexOf(l)]; },
    glyphe:function(c){ return '<span class="mjs-lt mjs-sub">' + c + '</span>'; }},
  danseurs:{nom:'Les petits danseurs', ic:'💃', facteur:1.15, table:true,
    expl:function(){ return 'Chaque petit danseur fait une lettre avec ses deux bras. Regarde bien où vont ses mains.'; },
    code:function(l){ return ABC.indexOf(l); },
    glyphe:function(c){ return danseurSVG(c); }}
};
var ORDRE_SYS = Object.keys(SYSTEMES);

/* ---------- Clés ---------- */
function schemaPig(P){
  var s = '<svg class="mjs-schema" viewBox="0 0 430 112" role="img" aria-label="La clé en grilles">';
  function lettre(x, y, cell, point){
    var l = P.layout[cell], vis = !P.cachees[l];
    return (vis ? '<text x="' + x + '" y="' + y + '">' + l + '</text>' : '<text class="vide" x="' + x + '" y="' + y + '">?</text>') +
      (point ? '<circle cx="' + f1(x + 10) + '" cy="' + f1(y - 14) + '" r="2.6"/>' : '');
  }
  function grille(ox, debut, point){
    var g = '<path d="M' + (ox + 33.3) + ' 6V106M' + (ox + 66.6) + ' 6V106M' + ox + ' 39.3H' + (ox + 100) + 'M' + ox + ' 72.6H' + (ox + 100) + '"/>';
    for(var k = 0; k < 9; k++){ var r = Math.floor(k / 3), c = k % 3; g += lettre(f1(ox + 16.6 + c * 33.3), f1(6 + 22.6 + r * 33.3), debut + k, point); }
    return g;
  }
  function croix(ox, debut, point){
    var g = '<path d="M' + (ox + 10) + ' 12L' + (ox + 90) + ' 100M' + (ox + 90) + ' 12L' + (ox + 10) + ' 100"/>';
    var pos = [[50, 38], [24, 63], [76, 63], [50, 92]];
    for(var k = 0; k < 4; k++) g += lettre(ox + pos[k][0], pos[k][1], debut + k, point);
    return g;
  }
  return s + grille(4, 0, false) + grille(112, 9, true) + croix(220, 18, false) + croix(326, 22, true) + '</svg>';
}
function cleCarre(P){
  var h = '<table class="mjs-carre"><tr><th></th>';
  for(var c = 1; c <= 6; c++) h += '<th class="col">' + c + '</th>';
  h += '</tr>';
  for(var r = 0; r < 5; r++){
    h += '<tr><th class="lig">' + (r + 1) + '</th>';
    for(c = 0; c < 6; c++){
      var l = P.layout[r * 6 + c];
      h += '<td' + (!l ? ' class="orne"' : P.cachees[l] ? ' class="vide"' : '') + '>' + (!l ? '✦' : P.cachees[l] ? '' : l) + '</td>';
    }
    h += '</tr>';
  }
  return h + '</table>';
}
function cleMiroir(P){
  var sys = SYSTEMES.miroir;
  return '<p class="mjs-mir-aide">' + (P.variante === 'miroir' ? '⬅️ Commence par la case tout à DROITE.' : '🌊 Le haut et le bas sont échangés.') + '</p>' +
    '<div class="mjs-table">' + P.exemples.map(function(l){ return '<span class="mjs-paire"><span class="mjs-pg">' + sys.glyphe(l, P) + '</span><i>=</i><b>' + l + '</b></span>'; }).join('') + '</div>';
}
function cleTable(P, sys){
  var ent;
  if(P.tableMode === 'melange'){
    var vis = ABC.filter(function(l){ return P.lettresMsg[l] && !P.cachees[l]; });
    ent = U.melanger(vis.concat(P.leurres || [])).map(function(l){ return {l:l}; });
  } else {
    ent = ABC.filter(function(l){ return !(P.tableMode === 'trous' && (P.cachees[l] || P.troues[l])); })
      .map(function(l){ return {l:l, efface:P.tableMode === 'efface' && P.cachees[l]}; });
  }
  return '<div class="mjs-table' + (P.sys === 'morse' ? ' large' : '') + '">' + ent.map(function(e){
    return '<span class="mjs-paire' + (e.efface ? ' efface' : '') + '"><span class="mjs-pg">' + sys.glyphe(sys.code(e.l, P), P) + '</span><i>=</i><b>' + (e.efface ? '?' : e.l) + '</b></span>';
  }).join('') + '</div>';
}
/* Roue de César : anneau extérieur fixe (lettres vraies), disque intérieur qui tourne (lettres codées) */
function cleRoue(P){
  var st = 360 / 26, s = '<div class="mjs-roue"><button type="button" class="mjs-rbtn" data-r="-1" aria-label="Tourner vers la gauche">⟲</button>' +
    '<svg class="mjs-roue-svg" viewBox="-112 -112 224 224" role="img" aria-label="La roue de César">' +
    '<circle r="110" class="r-bord"/><circle r="106" class="r-ext"/>';
  var i, a, a2;
  for(i = 0; i < 26; i++){
    a = (i * st - 90) * Math.PI / 180; a2 = ((i + .5) * st - 90) * Math.PI / 180;
    s += '<text class="r-clair" x="' + f1(Math.cos(a) * 92) + '" y="' + f1(Math.sin(a) * 92) + '">' + ABC[i] + '</text>';
    s += '<path class="r-trait" d="M' + f1(Math.cos(a2) * 79) + ' ' + f1(Math.sin(a2) * 79) + 'L' + f1(Math.cos(a2) * 105) + ' ' + f1(Math.sin(a2) * 105) + '"/>';
  }
  s += '<g class="mjs-roue-int"><circle r="78" class="r-int"/>';
  for(i = 0; i < 26; i++){
    a = (i * st - 90) * Math.PI / 180; a2 = ((i + .5) * st - 90) * Math.PI / 180;
    s += '<path class="r-trait-int" d="M' + f1(Math.cos(a2) * 48) + ' ' + f1(Math.sin(a2) * 48) + 'L' + f1(Math.cos(a2) * 77) + ' ' + f1(Math.sin(a2) * 77) + '"/>';
    s += '<text class="r-chif' + (P.effRoue[i] ? ' eff' : '') + '" x="' + f1(Math.cos(a) * 64) + '" y="' + f1(Math.sin(a) * 64) + '">' + (P.effRoue[i] ? '·' : ABC[i]) + '</text>';
  }
  s += '</g><circle r="46" class="r-moyeu"/><text class="r-centre">✋</text></svg>' +
    '<button type="button" class="mjs-rbtn" data-r="1" aria-label="Tourner vers la droite">⟳</button></div>';
  var ch = ABC[(ABC.indexOf(P.indice) + P.k) % 26];
  return '<p class="mjs-indice">🔎 Indice : le <b>' + P.indice + '</b> s\'écrit <b>' + ch + '</b>.<span class="mjs-indice-plus"> Tourne la roue pour mettre le <b>' + ch + '</b> du dedans sous le <b>' + P.indice + '</b> du dehors.</span></p>' + s;
}
function brancherRoue(pan, P){
  var st = 360 / 26, g = pan.querySelector('.mjs-roue-int'), svg = pan.querySelector('.mjs-roue-svg');
  var txts = Array.prototype.slice.call(g.querySelectorAll('.r-chif'));
  var depart = (P.k + U.randInt(4, 21)) % 26, angle = -depart * st, drag = null;
  function poser(a, anim){
    angle = a;
    g.style.transition = anim ? '' : 'none'; g.style.transform = 'rotate(' + f2(a) + 'deg)';
    txts.forEach(function(t){ t.style.transition = anim ? '' : 'none'; t.style.transform = 'rotate(' + f2(-a) + 'deg)'; });
    pan.dataset.rot = ((Math.round(-a / st) % 26) + 26) % 26;
  }
  function caler(){ poser(Math.round(angle / st) * st, true); }
  poser(angle, false);
  pan.addEventListener('click', function(e){
    var b = e.target.closest('.mjs-rbtn'); if(!b) return;
    U.son('tic'); poser(Math.round(angle / st) * st + (+b.dataset.r) * st, true);
  });
  function ang(e){ var r = svg.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; }
  svg.addEventListener('pointerdown', function(e){ drag = {id:e.pointerId, a:ang(e)}; try{ svg.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
  svg.addEventListener('pointermove', function(e){
    if(!drag || e.pointerId !== drag.id) return;
    var a = ang(e), d = a - drag.a; if(d > 180) d -= 360; if(d < -180) d += 360;
    drag.a = a; poser(angle + d, false);
  });
  function lacher(e){ if(!drag || (e && e.pointerId !== drag.id)) return; drag = null; caler(); U.son('tic'); }
  svg.addEventListener('pointerup', lacher); svg.addEventListener('pointercancel', lacher);
  return {rot:function(){ return +pan.dataset.rot; }, tourner:function(r){ poser(-r * st, true); },
    taille:function(px){ px = Math.round(px); svg.style.width = svg.style.height = px + 'px'; svg.style.flex = '0 0 ' + px + 'px'; svg.style.maxWidth = 'none'; },
    boite:pan.querySelector('.mjs-roue')};
}

/* ---------- Dégâts du parchemin ---------- */
function blobD(R, cx, cy, rx, ry, nb, j0, j1, lisse){
  var pts = [], k;
  for(k = 0; k < nb; k++){ var a = k / nb * Math.PI * 2 + R() * .25, f = j0 + R() * (j1 - j0); pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
  if(!lisse) return 'M' + pts.map(function(p){ return f1(p[0]) + ' ' + f1(p[1]); }).join('L') + 'Z';
  function mid(a, b){ return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  var m = mid(pts[nb - 1], pts[0]), d = 'M' + f1(m[0]) + ' ' + f1(m[1]);
  for(k = 0; k < nb; k++){ var q = pts[k], m2 = mid(pts[k], pts[(k + 1) % nb]); d += 'Q' + f1(q[0]) + ' ' + f1(q[1]) + ' ' + f1(m2[0]) + ' ' + f1(m2[1]); }
  return d + 'Z';
}
function degatSVG(dg){
  var R = graine(dg.s), tot = dg.force === 'total';
  var cx = 50, cy = 50, rx = 50, ry = 50;
  if(!tot){
    if(dg.cote === 'g'){ cx = 16; rx = 36; ry = 56; }
    else if(dg.cote === 'd'){ cx = 84; rx = 36; ry = 56; }
    else if(dg.cote === 'h'){ cy = 16; rx = 56; ry = 36; }
    else { cy = 84; rx = 56; ry = 36; }
  }
  var s = '<svg class="mjs-deg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">', k;
  if(dg.type === 'tache'){
    s += '<path class="d-tache" d="' + blobD(R, cx, cy, rx, ry, 11, .82, 1.12, true) + '"/>';
    s += '<path class="d-tache2" d="' + blobD(R, cx + (R() - .5) * 12, cy + (R() - .5) * 12, rx * .5, ry * .5, 9, .75, 1.1, true) + '"/>';
    for(k = 0; k < 3; k++){ var a = R() * 6.28, r = 1.05 + R() * .2; s += '<circle class="d-tache" cx="' + f1(cx + Math.cos(a) * rx * r) + '" cy="' + f1(cy + Math.sin(a) * ry * r) + '" r="' + f1(1.8 + R() * 3.5) + '"/>'; }
  } else if(dg.type === 'brule'){
    var dt = blobD(R, cx, cy, rx * .9, ry * .9, 16, .8, 1.1, false);
    s += '<path class="d-halo" d="' + blobD(R, cx, cy, rx * 1.1, ry * 1.1, 13, .85, 1.12, true) + '"/><path class="d-trou" d="' + dt + '"/><path class="d-braise" d="' + dt + '"/>';
  } else if(dg.type === 'dechire'){
    s += '<path class="d-dech" d="' + blobD(R, cx, cy, rx, ry, 22, .74, 1.14, false) + '"/>';
  } else {
    s += '<path class="d-efface" d="' + blobD(R, cx, cy, rx, ry, 10, .86, 1.1, true) + '"/>';
  }
  return s + '</svg>';
}

/* ---------- Construction d'une partie ---------- */
function lettresDonnees(v){
  var d = {};
  sansAccents(Array.isArray(v) ? v.join('') : (v || '')).toUpperCase().split('').forEach(function(l){ if(/[A-Z]/.test(l)) d[l] = 'donnee'; });
  return d;
}
function nettoyerMessage(brut){
  return sansAccents(String(brut || '')).toUpperCase().replace(/[’`]/g, '\'').replace(/[^A-Z'\-.,!? ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function choisirSys(s){
  var liste = Array.isArray(s) ? s : (typeof s === 'string' && s ? s.split(/[\s,|]+/) : []);
  liste = liste.filter(function(x){ return SYSTEMES[x]; });
  if(liste.length === 1) return liste[0];
  return tirerSans(liste.length ? liste : ORDRE_SYS, 'sys');
}
/* Choix du système et du message, une seule fois par params (consigne, démo et jeu le partagent) */
function resoudre(p){
  if(p.__mjs) return p.__mjs;
  var n = p.niveauEffectif || p.nv || 3;
  var sys = choisirSys(p.systeme);
  var msg = nettoyerMessage(p.message);
  if(!/[A-Z]/.test(msg)) msg = U.choix(banquePour(n));
  var donnees = lettresDonnees(p.lettresDonnees);
  var nb = msg.split('').filter(function(c){ return /[A-Z]/.test(c) && !donnees[c]; }).length;
  var base = p.tempsBase === undefined ? 30 : p.tempsBase, parL = p.tempsLettre === undefined ? 8 : p.tempsLettre;
  var t = (base + nb * parL * (SYSTEMES[sys].facteur || 1)) / (p.lent || 1) + (p.tempsBonus || 0);
  var R = {sys:sys, msg:msg, n:n, temps:Math.max(20, Math.round(t / 5) * 5)};
  p.__mjs = R;
  (p.lignes || []).forEach(function(l){
    if(l.nom === 'Le code') l.val = SYSTEMES[sys].ic + ' ' + SYSTEMES[sys].nom;
    if(l.nom === 'Temps') l.val = p.sansTemps ? 'pas de sablier' : dureeTxt(R.temps);
  });
  return R;
}
/* combien d'inconnues un mot supporte encore pour être deviné (les adultes des grands niveaux devinent mieux) */
function permis(len, n){ return (len <= 2 ? 0 : len <= 4 ? 1 : len === 5 ? 1.5 : len <= 7 ? 2 : 2.5) + (len >= 4 && n >= 8 ? .5 : 0); }
/* Le message reste-t-il faisable ? On imite un joueur : un mot se devine s'il lui manque peu de lettres ;
   un mot deviné apprend ses lettres (utile quand la clé ne les donne pas). */
function resoluble(P, cachees, deduit){
  var connu = {};
  ABC.forEach(function(l){ connu[l] = deduit || !cachees[l]; });
  Object.keys(P.donnees).forEach(function(l){ connu[l] = true; });
  var fait = P.mots.map(function(){ return false; }), change = true;
  while(change){
    change = false;
    P.mots.forEach(function(m, k){
      if(fait[k]) return;
      var inc = 0;
      m.lettres.forEach(function(i){
        var c = P.cases[i]; if(c.donne) return;
        if(c.degat && c.degat.force === 'total') inc += 1;
        else if(!connu[c.ch]) inc += 1;
        else if(c.degat) inc += .5;
      });
      if(inc <= permis(m.lettres.length, P.n) + 1e-9){ fait[k] = true; change = true; m.lettres.forEach(function(i){ connu[P.cases[i].ch] = true; }); }
    });
  }
  return fait.every(Boolean);
}
function poserDegats(P, aRemplir, nDeg, nTot){
  /* par mot : au plus 1 lettre sur 3 tout à fait cachée, au plus 1 sur 2 abîmée */
  var parMot = {}, totMot = {}, choisis = [], cases = P.cases, mots = P.mots, nbTot = 0;
  var cand = U.melanger(aRemplir.filter(function(c){ return mots[c.mot].lettres.length >= 3; }));
  function peut(c){ var m = mots[c.mot], max = Math.max(1, Math.floor(m.lettres.length / 2)); return !c.degat && (parMot[c.mot] || 0) < max; }
  function peutTotal(c){ return (totMot[c.mot] || 0) < Math.max(1, Math.floor(mots[c.mot].lettres.length / 3)); }
  for(var k = 0; k < cand.length && choisis.length < nDeg; k++){
    var c = cand[k]; if(!peut(c)) continue;
    var tot = nbTot < nTot && peutTotal(c);
    c.degat = {force:tot ? 'total' : 'partiel'};
    if(tot){ nbTot++; totMot[c.mot] = (totMot[c.mot] || 0) + 1; }
    parMot[c.mot] = (parMot[c.mot] || 0) + 1; choisis.push(c);
    /* une tache ou une brûlure déborde parfois sur la lettre voisine */
    if(choisis.length < nDeg && Math.random() < .45){
      var v = cases[c.i + 1];
      if(v && v.lettre && !v.donne && v.mot === c.mot && peut(v)){ v.degat = {force:'partiel', voisin:c}; parMot[v.mot]++; choisis.push(v); }
    }
  }
  var rtl = P.variante === 'miroir';
  choisis.forEach(function(c){
    var d = c.degat; d.s = Math.floor(Math.random() * 1e9);
    if(d.voisin){ d.type = d.voisin.degat.type === 'brule' ? 'tache' : d.voisin.degat.type; d.cote = rtl ? 'd' : 'g'; delete d.voisin; return; }
    d.type = d.force === 'total' ? U.choix(['tache', 'brule', 'dechire']) : U.choix(['tache', 'dechire', 'efface', 'tache']);
    d.cote = U.choix(['g', 'd', 'h', 'b']);
  });
  /* la lettre d'où part le débordement est abîmée du côté de sa voisine */
  choisis.forEach(function(c){ var v = cases[c.i + 1]; if(v && v.degat && c.degat.force === 'partiel' && v.degat.cote === (rtl ? 'd' : 'g')) c.degat.cote = rtl ? 'g' : 'd'; });
}
function construire(R, p){
  var n = R.n, sys = SYSTEMES[R.sys];
  var P = {sys:R.sys, n:n, msg:R.msg, cachees:{}, troues:{}, leurres:[]};
  if(sys.preparer) sys.preparer(P);
  P.tableMode = n <= 3 ? 'efface' : n <= 6 ? 'trous' : 'melange';
  var cases = [], mots = [], mot = null;
  R.msg.split('').forEach(function(ch, i){
    if(ch === ' '){ mot = null; cases.push({i:i, ch:' ', espace:true}); return; }
    if(!mot){ mot = {cases:[], lettres:[]}; mots.push(mot); }
    var c = {i:i, ch:ch, lettre:/[A-Z]/.test(ch), mot:mots.length - 1};
    if(c.lettre) c.code = sys.code(ch, P);
    cases.push(c); mot.cases.push(i); if(c.lettre) mot.lettres.push(i);
  });
  P.cases = cases; P.mots = mots;
  /* lettres connues d'avance + lettres offertes (mod aide) */
  var donnees = lettresDonnees(p.lettresDonnees), distinctes = [];
  cases.forEach(function(c){ if(c.lettre && distinctes.indexOf(c.ch) < 0) distinctes.push(c.ch); });
  var libres = distinctes.filter(function(l){ return !donnees[l]; });
  U.melanger(libres).slice(0, Math.min(p.aide || 0, Math.max(0, libres.length - 1))).forEach(function(l){ donnees[l] = 'aide'; });
  cases.forEach(function(c){ if(c.lettre && donnees[c.ch]) c.donne = true; });
  P.donnees = donnees;
  P.lettresMsg = {}; distinctes.forEach(function(l){ P.lettresMsg[l] = true; });
  var restantes = distinctes.filter(function(l){ return !donnees[l]; });
  var aRemplir = cases.filter(function(c){ return c.lettre && !c.donne; });
  /* clé partielle + dégâts : on tire, on vérifie que c'est faisable, sinon on allège */
  var pCle = p.pCle === undefined ? 1 : p.pCle;
  var nCache = sys.sansCache ? 0 : Math.round(restantes.length * (1 - pCle));
  var nDeg = Math.round(aRemplir.length * (p.degats || 0)), nTot = Math.round(nDeg * (p.totale || 0));
  var deduit = sys.table ? P.tableMode === 'efface' : sys.deductible ? sys.deductible(P) : true;
  var ok = false, cachees = {}, alterne = false;
  for(var essai = 0; essai < 300 && !ok; essai++){
    /* trop dur : on allège, tour à tour la clé et les dégâts */
    if(essai && essai % 6 === 0){
      var cle = nCache > 0 && !deduit && (alterne = !alterne);
      if(cle || (nTot <= 0 && nCache > 0 && !deduit)) nCache--; else if(nTot > 0) nTot--; else if(nDeg > 0) nDeg--;
    }
    cachees = {}; U.melanger(restantes).slice(0, nCache).forEach(function(l){ cachees[l] = true; });
    cases.forEach(function(c){ delete c.degat; });
    poserDegats(P, aRemplir, nDeg, Math.min(nTot, nDeg));
    ok = resoluble(P, cachees, deduit);
  }
  if(!ok){ cases.forEach(function(c){ delete c.degat; }); cachees = {}; }
  P.cachees = cachees;
  P.deduit = deduit;
  var hors = ABC.filter(function(l){ return !P.lettresMsg[l]; });
  if(P.tableMode === 'trous') U.melanger(hors).slice(0, Math.round(Object.keys(cachees).length * 1.3) + 1).forEach(function(l){ P.troues[l] = true; });
  if(P.tableMode === 'melange') P.leurres = U.melanger(hors).slice(0, U.randInt(5, 8));
  if(R.sys === 'cesar'){
    /* l'indice : une lettre du message aux petits niveaux, une lettre absente aux grands */
    var pool = n <= 5 ? restantes : hors;
    P.indice = U.choix(pool.length ? pool : ABC);
    delete P.effRoue[(ABC.indexOf(P.indice) + P.k) % 26];
  }
  if(R.sys === 'miroir'){
    var asym = P.variante === 'miroir' ? 'BCDEFGJKLNPQRSZ' : 'AFGJKLMNPQRSTUVWY';
    P.exemples = U.melanger(asym.split('')).slice(0, n <= 3 ? 4 : n <= 6 ? 3 : 2);
  }
  return P;
}

/* ---------- Décor du parchemin ---------- */
function bordDechire(R){
  /* polygone aux bords irréguliers (haut et bas un peu mangés, un côté brûlé) */
  var pts = [], k, cote = R() < .5 ? 'g' : 'd';
  for(k = 0; k <= 20; k++) pts.push(f1(k * 5) + '% ' + f1(R() * 1.6) + '%');
  for(k = 1; k < 12; k++) pts.push(f1(100 - (cote === 'd' ? R() * 3 : R() * .8)) + '% ' + f1(k * 100 / 12) + '%');
  for(k = 20; k >= 0; k--) pts.push(f1(k * 5) + '% ' + f1(100 - R() * 1.8) + '%');
  for(k = 11; k > 0; k--) pts.push(f1(cote === 'g' ? R() * 3 : R() * .8) + '% ' + f1(k * 100 / 12) + '%');
  return {poly:'polygon(' + pts.join(',') + ')', cote:cote};
}
function decorParch(){
  var R = graine(Math.floor(Math.random() * 1e9)), b = bordDechire(R), h = '';
  for(var k = 0; k < 3; k++){
    var w = 40 + R() * 70;
    h += '<i class="mjs-deco" style="left:' + f1(R() * 85) + '%;top:' + f1(R() * 70) + '%;width:' + f1(w) + 'px;height:' + f1(w * (.8 + R() * .3)) + 'px"></i>';
  }
  return '<div class="mjs-parch-fond brule-' + b.cote + '" style="clip-path:' + b.poly + ';-webkit-clip-path:' + b.poly + '">' + h + '</div>';
}

/* ==========================================================
   ALPHABET — le mini-jeu
   ========================================================== */
MJ.enregistrer('alphabet', {
  nom:'L\'alphabet secret', role:'sage', ic:'🔣',
  SYSTEMES:ORDRE_SYS,
  consigne:function(p){
    var R = resoudre(p || {});
    return 'Déchiffre le message avec la clé. Touche une case, puis une lettre, dans l\'ordre que tu veux. ' +
      'Une lettre abîmée ? Devine-la avec le mot ! (' + SYSTEMES[R.sys].nom + ')';
  },
  reglages:function(n, mods){
    mods = mods || {};
    var coeurs = (n <= 3 ? 3 : n <= 6 ? 2 : 1) + (mods.erreurs || 0);
    var lent = mods.lent && mods.lent > 0 && mods.lent < 1 ? mods.lent : 1;
    var revele = !!mods.revele;
    var degats = U.parNiveau(n, .1, .45, .05, .55) * (revele ? .5 : 1);
    var totale = U.parNiveau(n, .15, .55, 0, .65) * (revele ? .5 : 1);
    var pCle = n <= 2 ? 1 : U.parNiveau(n, 1.05, .45, .35, 1);
    var zone = mods.zone && mods.zone > 1 ? Math.min(1.45, mods.zone) : 1;
    var p = {nv:n, coeurs:coeurs, degats:degats, totale:totale, pCle:pCle, aide:mods.aide || 0, zone:zone, revele:revele,
      tempsBase:U.parNiveau(n, 35, 18, 15), tempsLettre:U.parNiveau(n, 10.5, 4, 3.5), lent:lent, tempsBonus:mods.temps || 0,
      autoPareil:n <= 4 || revele, montrerFausses:n <= 5};
    var abime = degats < .15 ? 'un peu' : degats < .27 ? 'assez' : degats < .38 ? 'beaucoup' : 'énormément';
    p.lignes = [
      {nom:'Le code', val:'tiré au hasard'},
      {nom:'Temps', val:'environ ' + U.fmt(p.tempsLettre / lent, 0) + ' s par lettre'},
      {nom:'Essais pour valider', val:String(coeurs)},
      {nom:'Cœurs (erreurs permises)', val:(coeurs - 1) + ' ❤️'},
      {nom:'Parchemin abîmé', val:abime},
      {nom:'La clé', val:pCle >= .99 ? 'complète' : pCle >= .75 ? 'il manque quelques lettres' : 'il manque beaucoup de lettres'},
      {nom:'Lettres fausses', val:p.montrerFausses ? 'montrées en rouge' : 'seulement comptées'}
    ].concat(p.autoPareil ? [{nom:'Signes pareils', val:'remplis ensemble'}] : [])
     .concat(mods.aide ? [{nom:'Lettres offertes', val:String(mods.aide)}] : [])
     .concat(zone > 1 ? [{nom:'Cases et clavier', val:'plus grands'}] : [])
     .concat(revele ? [{nom:'Parchemin restauré', val:'moins de dégâts'}] : []);
    return p;
  },
  demo:function(el, p){
    p = p || {};
    var R = resoudre(p), sys = SYSTEMES[R.sys], P = {sys:R.sys, n:R.n, cachees:{}};
    if(sys.preparer) sys.preparer(P);
    var mot = 'CLEF'.split('');
    var cases = mot.map(function(l, i){
      var g = sys.glyphe(sys.code(l, P), P);
      return '<span class="mjs-dcase" data-k="' + i + '"><span class="mjs-g' + (i === 2 ? ' deg-total' : '') + '">' + (i === 2 ? degatSVG({force:'total', type:'tache', s:42}) : g) + '</span><b></b></span>';
    }).join('');
    var touches = ['C', 'E', 'F', 'L', 'R', 'S'].map(function(l){ return '<i data-l="' + l + '">' + l + '</i>'; }).join('');
    var ctl = demoMain(el,
      '<div class="mjs-d-alpha mjs-sys-' + R.sys + '"><div class="mjs-d-parch"><div class="mjs-d-mot' + (P.variante === 'miroir' ? ' rtl' : '') + '">' + cases + '</div></div>' +
      '<div class="mjs-d-clavier">' + touches + '<em class="mjs-d-val">✔</em></div><p class="mjs-d-leg"></p></div>',
      9000, [
        [0, function(c){ c.qa('.mjs-dcase').forEach(function(x){ x.className = 'mjs-dcase'; x.querySelector('b').textContent = ''; }); c.box.classList.remove('vu'); c.q('.mjs-d-leg').textContent = ''; c.va(50, 98); }],
        [700, function(c){ c.va(posCase(c, 1), 34); }],
        [1100, function(c){ c.tape(); c.q('[data-k="1"]').classList.add('sel'); c.q('.mjs-d-leg').textContent = '👆 Choisis la case que tu veux…'; }],
        [1800, function(c){ c.va(posTouche(c, 'L'), 72); }],
        [2200, function(c){ c.tape(); var k = c.q('[data-k="1"]'); k.classList.remove('sel'); k.querySelector('b').textContent = 'L'; c.q('.mjs-d-leg').textContent = '…puis la lettre.'; }],
        [3000, function(c){ c.va(posCase(c, 3), 34); }],
        [3400, function(c){ c.tape(); c.q('[data-k="3"]').classList.add('sel'); c.q('.mjs-d-leg').textContent = '🔀 Dans le désordre !'; }],
        [4000, function(c){ c.va(posTouche(c, 'F'), 72); }],
        [4400, function(c){ c.tape(); var k = c.q('[data-k="3"]'); k.classList.remove('sel'); k.querySelector('b').textContent = 'F'; }],
        [5000, function(c){ c.va(posCase(c, 0), 34); }],
        [5300, function(c){ c.tape(); c.q('[data-k="0"]').classList.add('sel'); }],
        [5700, function(c){ c.va(posTouche(c, 'C'), 72); }],
        [6000, function(c){ c.tape(); var k = c.q('[data-k="0"]'); k.classList.remove('sel'); k.querySelector('b').textContent = 'C'; }],
        [6500, function(c){ c.va(posCase(c, 2), 34); c.q('.mjs-d-leg').textContent = '☕ Une tache ? Devine avec le mot : CL?F…'; }],
        [6900, function(c){ c.tape(); c.q('[data-k="2"]').classList.add('sel'); }],
        [7300, function(c){ c.va(posTouche(c, 'E'), 72); }],
        [7600, function(c){ c.tape(); var k = c.q('[data-k="2"]'); k.classList.remove('sel'); k.querySelector('b').textContent = 'E'; }],
        [8000, function(c){ c.va(92, 72); }],
        [8300, function(c){ c.tape(); c.box.classList.add('vu'); c.q('.mjs-d-leg').textContent = '✔ CLEF : bravo !'; }]
      ]);
    function posCase(c, k){
      var b = c.box.getBoundingClientRect(), n = c.q('[data-k="' + k + '"]'); if(!n || !b.width) return 30 + k * 13;
      var r = n.getBoundingClientRect(); return ((r.left + r.width / 2 - b.left) / b.width) * 100;
    }
    function posTouche(c, l){
      var b = c.box.getBoundingClientRect(), n = c.q('[data-l="' + l + '"]'); if(!n || !b.width) return 50;
      var r = n.getBoundingClientRect(); return ((r.left + r.width / 2 - b.left) / b.width) * 100;
    }
    return ctl;
  },
  jouer:function(el, p, fin){
    var T = minuteurs(), fini = false, arrete = false, bloque = false, stops = [];
    var R = resoudre(p);
    var sys = SYSTEMES[R.sys], P = construire(R, p);
    var cases = P.cases, coeurs = Math.max(1, p.coeurs || 1), coeursMax = coeurs, ratees = 0;
    var zone = p.zone && p.zone > 1 ? p.zone : 1;
    var ordre = cases.filter(function(c){ return c.lettre && !c.donne; }).map(function(c){ return c.i; });
    var vals = {}, sel = -1;
    var total = R.temps, debut = Date.now();
    var rtl = P.variante === 'miroir';
    /* message, mot par mot */
    var msgHTML = P.mots.map(function(m){
      return '<span class="mjs-mot">' + m.cases.map(function(i){
        var c = cases[i];
        if(!c.lettre) return '<span class="mjs-case autre"><span class="mjs-g"></span><b class="mjs-r">' + esc(c.ch) + '</b></span>';
        var dg = c.degat, g = dg && dg.force === 'total' ? '' : sys.glyphe(c.code, P);
        return '<button type="button" class="mjs-case' + (c.donne ? ' donne plein' : '') + '" data-i="' + i + '" aria-label="Case ' + (ordre.indexOf(i) + 1) + '">' +
          '<span class="mjs-g' + (dg ? ' deg-' + dg.force + ' deg-' + dg.type : '') + '">' + g + (dg ? degatSVG(dg) : '') + '</span>' +
          '<b class="mjs-r">' + (c.donne ? c.ch : '') + '</b></button>';
      }).join('') + '</span>';
    }).join('');
    var touches = ABC.map(function(l){ return '<button type="button" class="mjs-t" data-l="' + l + '">' + l + '</button>'; }).join('') +
      '<button type="button" class="mjs-t eff" data-l="-" aria-label="Effacer la case">⌫</button>';
    el.innerHTML =
      '<div class="mjs-jeu mjs-alpha mjs-sys-' + P.sys + (P.variante ? ' mjs-var-' + P.variante : '') + (zone > 1.15 ? ' mjs-z' : '') + '" style="--z:' + f2(zone) + '">' +
      '<div class="mjs-in">' +
        '<div class="mjs-haut">' +
          /* (enquête 3, le plan des Fondateurs — Romain, 13 novembre : « pas de minuteur ») p.sansTemps : pas de sablier, on prend son temps */
          '<div class="mjs-sablier" aria-label="Temps restant"' + (p.sansTemps ? ' hidden' : '') + '><span class="mjs-sab-ic">⏳</span><span class="mjs-barre"><i></i></span><b class="mjs-sec">' + fmtTemps(total) + '</b></div>' +
          '<div class="mjs-coeurs">' + U.coeurs(coeurs - 1, coeursMax - 1) + '</div>' +
        '</div>' +
        '<div class="mjs-corps">' +
          '<div class="mjs-gauche">' +
            '<div class="mjs-defile"><div class="mjs-zp"><div class="mjs-parch">' + decorParch() + '<div class="mjs-msg' + (rtl ? ' rtl' : '') + '">' + msgHTML + '</div></div></div></div>' +
            '<div class="mjs-bas">' +
              '<p class="mjs-info">👆 Touche une case, puis une lettre.</p>' +
              '<div class="mjs-clavier">' + touches + '</div>' +
              '<button type="button" class="mjs-valider" disabled>✔ Valider le message</button>' +
            '</div>' +
          '</div>' +
          '<div class="mjs-droite"></div>' +
        '</div>' +
      '</div></div>';
    var root = el.firstChild, defile = root.querySelector('.mjs-defile'), droite = root.querySelector('.mjs-droite');
    var info = root.querySelector('.mjs-info'), btnVal = root.querySelector('.mjs-valider'), parch = root.querySelector('.mjs-parch');
    var barre = root.querySelector('.mjs-barre i'), sec = root.querySelector('.mjs-sec'), haut = root.querySelector('.mjs-haut');
    var coeursN = root.querySelectorAll('.mjs-coeurs i');
    /* la clé */
    var clePan = U.html('<section class="mjs-cle" aria-label="La clé"><h4 class="mjs-cle-titre"><span>🔑 La clé</span><b>' + sys.ic + ' ' + esc(sys.nom) + '</b></h4>' +
      '<p class="mjs-cle-expl">' + esc(sys.expl(P)) + '</p><div class="mjs-cle-corps">' + (sys.cle ? sys.cle(P) : cleTable(P, sys)) + '</div></section>');
    defile.appendChild(clePan);
    var roue = sys.brancher ? sys.brancher(clePan, P) : null;
    stops.push(observer(root, function(){
      var w = root.clientWidth, h = root.clientHeight;
      var pay = w >= 680 && h < w * .95, grand = !pay && w >= 600 && h >= 760;
      root.classList.toggle('mjs-paysage', pay); root.classList.toggle('mjs-grand', grand);
      if(pay && clePan.parentNode !== droite) droite.appendChild(clePan);
      if(!pay && clePan.parentNode !== defile) defile.appendChild(clePan);
      if(roue && roue.taille){
        /* la roue prend la place qui reste : sur téléphone, le message défile au-dessus */
        var autres = clePan.scrollHeight - roue.boite.offsetHeight, max = grand ? 340 : 300, dispo;
        if(pay) dispo = droite.clientHeight - autres - 6;
        else {
          var zp = root.querySelector('.mjs-zp'), dh = defile.clientHeight;
          dispo = dh - Math.min(zp.scrollHeight, dh * (grand ? .6 : .34)) - 10 - autres - 4;
        }
        roue.taille(Math.max(150, Math.min(max, dispo, clePan.clientWidth - 132)));
      }
    }));

    function caseN(i){ return root.querySelector('.mjs-case[data-i="' + i + '"]'); }
    function choisir(i){
      if(sel >= 0 && caseN(sel)) caseN(sel).classList.remove('sel');
      sel = i;
      if(i >= 0){ var n = caseN(i); n.classList.add('sel'); }
    }
    function suivante(apres){
      var k0 = ordre.indexOf(apres);
      for(var j = 1; j <= ordre.length; j++){ var q = ordre[(k0 + j + ordre.length) % ordre.length]; if(!vals[q]) return q; }
      return -1;
    }
    function poser(i, l){
      vals[i] = l;
      var n = caseN(i); n.querySelector('.mjs-r').textContent = l;
      n.classList.toggle('plein', !!l); n.classList.remove('faux');
      if(l){ n.classList.remove('arrive'); void n.offsetWidth; n.classList.add('arrive'); }
    }
    function majValider(){
      var pret = ordre.every(function(i){ return !!vals[i]; });
      btnVal.disabled = !pret || bloque; btnVal.classList.toggle('pret', pret && !bloque);
    }
    function dire(t, ko){ info.textContent = t; info.classList.toggle('ko', !!ko); }
    function taper(l){
      if(bloque) return;
      if(sel < 0) choisir(suivante(-1));
      if(sel < 0) return;
      var c = cases[sel];
      if(c.donne) return;
      poser(sel, l);
      /* signes pareils remplis ensemble (petits niveaux) — jamais sur une case abîmée */
      if(p.autoPareil && !c.degat) cases.forEach(function(o){ if(o.lettre && !o.donne && !o.degat && o.i !== sel && o.code === c.code) poser(o.i, l); });
      U.son('tic');
      var nx = suivante(sel);
      choisir(nx >= 0 ? nx : sel);
      majValider();
      if(btnVal.classList.contains('pret')) dire('✔ Tout est rempli : vérifie, puis valide !');
    }
    function effacer(){
      if(bloque || sel < 0 || cases[sel].donne) return;
      poser(sel, ''); U.son('clic'); majValider();
    }
    /* la règle des cœurs (mj-core.js) : cœurs = validations ratées encore permises (essais − 1) */
    function majCoeurs(){
      var cc = root.querySelector('.mjs-coeurs');
      cc.innerHTML = U.coeurs(coeurs - 1, coeursMax - 1, coeurs - 1);
      cc.classList.remove('choc'); void cc.offsetWidth; cc.classList.add('choc');
      if(coeurs === 1) U.plusDeCoeur(root);
    }
    function finir(res){
      if(fini || arrete) return;
      fini = true; bloque = true; T.tout(); nettoyer();
      fin(res);
    }
    function perdre(message, detail){
      if(bloque) return;
      bloque = true; majValider(); root.classList.add('perdu'); U.son('echec');
      T.t(function(){ finir({reussi:false, score:0, erreurs:ratees, message:message, detail:detail, systeme:P.sys}); }, 1100);
    }
    function gagner(){
      bloque = true; majValider(); choisir(-1);
      root.classList.add('gagne'); if(P.variante) root.classList.add('retourne');
      U.son('magie'); dire('✨ Le message s\'illumine !');
      if(rtl) T.t(function(){ root.querySelector('.mjs-msg').classList.remove('rtl'); }, 650);
      T.t(function(){
        finir({reussi:true, erreurs:ratees, score:Math.max(.4, 1 - .2 * ratees), message:'Message déchiffré !', detail:'« ' + P.msg + ' »', message_dechiffre:P.msg, systeme:P.sys});
      }, 2000);
    }
    function valider(){
      if(bloque) return;
      var vides = ordre.filter(function(i){ return !vals[i]; });
      if(vides.length){ dire('Il reste ' + vides.length + ' case' + (vides.length > 1 ? 's' : '') + ' vide' + (vides.length > 1 ? 's' : '') + '.', true); secoue(btnVal); return; }
      var fausses = ordre.filter(function(i){ return vals[i] !== cases[i].ch; });
      if(!fausses.length){ gagner(); return; }
      coeurs--; ratees++; majCoeurs(); U.son('ko'); U.vibrer(80); secoue(parch);
      var nb = fausses.length + ' lettre' + (fausses.length > 1 ? 's' : '');
      if(coeurs <= 0){ dire('❌ ' + nb + ' ne ' + (fausses.length > 1 ? 'vont' : 'va') + ' pas…', true); perdre('Le message reste secret…', 'Plus d\'essai : ' + nb + ' n\'' + (fausses.length > 1 ? 'étaient' : 'était') + ' pas bonne' + (fausses.length > 1 ? 's' : '') + '.'); return; }
      if(p.montrerFausses){ fausses.forEach(function(i){ caseN(i).classList.add('faux'); }); dire('❌ ' + nb + ' en rouge ne ' + (fausses.length > 1 ? 'vont' : 'va') + ' pas. Corrige et revalide !', true); }
      else dire('❌ ' + nb + ' ne ' + (fausses.length > 1 ? 'vont' : 'va') + ' pas. Cherche lesquelles !', true);
      majValider();
    }
    root.querySelector('.mjs-msg').addEventListener('click', function(e){
      var b = e.target.closest('.mjs-case[data-i]'); if(!b || bloque) return;
      var i = +b.dataset.i; if(cases[i].donne){ secoue(b); return; }
      U.son('clic'); choisir(i);
    });
    root.querySelector('.mjs-clavier').addEventListener('click', function(e){
      var t = e.target.closest('.mjs-t'); if(!t || bloque) return;
      if(t.dataset.l === '-') effacer(); else taper(t.dataset.l);
    });
    btnVal.addEventListener('click', valider);
    function clavierPhysique(e){
      if(bloque || !root.isConnected || (window.MJT && MJT.enPause())) return;   /* en pause : le clavier sert au reste du jeu (un code…) */
      var k = e.key;
      if(/^[a-zA-Z]$/.test(k)){ taper(k.toUpperCase()); e.preventDefault(); }
      else if(k === 'Backspace' || k === 'Delete'){ effacer(); e.preventDefault(); }
      else if(k === 'Enter'){ valider(); e.preventDefault(); }
      else if(k === 'ArrowRight' || k === 'ArrowLeft'){
        var d = (k === 'ArrowRight') !== rtl ? 1 : -1, j = ordre.indexOf(sel);
        choisir(ordre[(j + d + ordre.length) % ordre.length]); e.preventDefault();
      }
    }
    document.addEventListener('keydown', clavierPhysique);
    stops.push(function(){ document.removeEventListener('keydown', clavierPhysique); });
    /* sablier */
    function tic(){
      if(bloque) return;
      var reste = total - (Date.now() - debut) / 1000;
      barre.style.transform = 'scaleX(' + Math.max(0, reste / total).toFixed(4) + ')';
      sec.textContent = fmtTemps(reste);
      haut.classList.toggle('alerte', reste <= Math.min(20, total * .2));
      if(reste <= 0){ dire('⌛ Le sablier est vide !', true); perdre('Le temps est écoulé…', 'Le sablier s\'est vidé : le message reste secret.'); }
    }
    if(!p.sansTemps){ T.i(tic, 250); tic(); }
    choisir(ordre.length ? ordre[0] : -1);
    majValider();
    if(!ordre.length) T.t(gagner, 400);
    /* crochet de test */
    var crochet = {systeme:P.sys, variante:P.variante || null, message:P.msg, temps:total, coeurs:function(){ return coeurs; },
      cases:cases.filter(function(c){ return c.lettre; }).map(function(c){ return {i:c.i, l:c.ch, donne:!!c.donne, degat:c.degat ? c.degat.force + ':' + c.degat.type : null}; }),
      cachees:Object.keys(P.cachees), deduit:P.deduit, roue:roue};
    window.__mjsAlpha = crochet; root.__mjs = crochet;
    function nettoyer(){
      stops.forEach(function(f){ try{ f(); }catch(e){} }); stops = [];
      if(window.__mjsAlpha === crochet) try{ delete window.__mjsAlpha; }catch(e){ window.__mjsAlpha = null; }
    }
    return {arreter:function(){ arrete = true; bloque = true; T.tout(); nettoyer(); }};
  }
});

/* ==========================================================
   RUNES — les images à reconstituer (viewBox 0 0 100 100)
   ========================================================== */
var SYMBOLES = {
  coeur:{nom:'le Cœur de Brume', d:'M50 84 L18 50 C8 37 15 18 32 18 C42 18 48 25 50 31 C52 25 58 18 68 18 C85 18 92 37 82 50 Z M50 31 L50 84 M32 18 L50 52 L68 18 M18 50 H82'},
  corbeau:{nom:'le Corbeau', d:'M14 62 C28 40 50 32 66 36 L88 28 L74 44 C76 60 62 74 40 76 L26 90 L28 74 C18 72 14 68 14 62 Z M32 60 C46 52 58 52 68 58 M60 44 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0'},
  cle:{nom:'la clé', d:'M14 32 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 Z M24 32 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z M42 44 L84 86 M66 68 L76 58 M76 78 L86 68'},
  lune:{nom:'la lune', d:'M60 12 A36 36 0 1 0 88 70 A28 28 0 1 1 60 12 Z M74 30 L78 22 L82 30 L90 34 L82 38 L78 46 L74 38 L66 34 Z'},
  plume:{nom:'la plume', d:'M82 12 C42 22 22 52 20 88 C40 72 64 54 82 12 Z M20 88 L72 28 M38 62 L30 56 M48 50 L40 42 M58 38 L52 30 M44 62 L54 64 M54 50 L64 52'},
  pisteur:{nom:'le sceau de la Pisteuse', d:'M18 82 L80 20 M58 18 L82 18 L82 42 M18 82 L30 84 M18 82 L16 70 M26 74 L38 78 M26 74 L22 62 M8 30 a6 8 0 1 0 12 0 a6 8 0 1 0 -12 0 M29 14 a5 7 0 1 0 10 0 a5 7 0 1 0 -10 0'},
  alchimiste:{nom:'le sceau de l\'Alchimiste', d:'M38 12 H62 M44 12 V40 L22 80 Q20 88 28 88 H72 Q80 88 78 80 L56 40 V12 M30 66 H70 M39 76 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M52 70 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0'},
  barde:{nom:'le sceau de la Barde', d:'M28 18 C14 40 22 72 50 84 C78 72 86 40 72 18 M28 18 L38 30 M72 18 L62 30 M34 32 H66 M40 32 V74 M50 32 V78 M60 32 V74'},
  sage:{nom:'le sceau du Sage', d:'M10 50 C28 22 72 22 90 50 C72 78 28 78 10 50 Z M38 50 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M46 50 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z M50 10 V20 M22 18 L28 26 M78 18 L72 26'},
  sceau:{nom:'les quatre sceaux', d:'M14 50 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0 Z M50 30 L70 50 L50 70 L30 50 Z M50 14 V30 M86 50 H70 M50 86 V70 M14 50 H30'}
};
var IMAGES = {
  runes:{nom:'la pierre de runes', ic:'🔷', fond:'pierre'},
  carte:{nom:'la carte de Brumeval', ic:'🗺️', fond:'parchemin'},
  blason:{nom:'le blason des fondateurs', ic:'🛡️', fond:'pierre'},
  horloge:{nom:'l\'horloge de la mairie', ic:'🕰️', fond:'pierre'},
  /* enquête 2 (la bibliothèque des plans) : jamais tirée au hasard (special) */
  moulin:{nom:'le vieux plan du moulin', ic:'📐', fond:'parchemin', special:true},
  /* enquête 3 (la mission de fête du Sage) : jamais tirée au hasard */
  tableau:{nom:'le tableau d\'Odette', ic:'🖼️', fond:'parchemin', special:true}
};
function imagesAuHasard(){ return Object.keys(IMAGES).filter(function(k){ return !IMAGES[k].special; }); }
var PETITES_RUNES = ['M-1.5 -3V3M-1.5 -2L1.8 -3.4M-1.5 .2L1.8 -1.2', 'M-1.6 3V-3L1.6 -.8V3', 'M-1.5 -3V3M-1.5 -1.4L1.6 0L-1.5 1.4',
  'M-1.5 -3V3M-1.5 -3L1.6 -1.6M-1.5 -.6L1.6 .8', 'M-1.6 3V-3L1.6 -1.6L-1.6 0L1.6 3', 'M1.6 -3L-1.6 0L1.6 3', 'M-2.2 -3L2.2 3M2.2 -3L-2.2 3',
  'M-1.5 3V-3L1.6 -1.5L-1.5 0', 'M-1.6 -3V3M1.6 -3V3M-1.6 -.8L1.6 .8', 'M0 -3V3M-1.8 -.9L1.8 .9', 'M0 -3V3M0 0L-2.2 -2.4M0 0L2.2 -2.4',
  'M0 -3L2.2 0L0 3L-2.2 0Z', 'M-1.6 -3V3M-1.6 -3L1.6 3', 'M-2 -3H2M0 -3V3', 'M-1.8 3L0 -3L1.8 3M-1 .4H1', 'M-1.6 -3L1.6 0L-1.6 3'];
function fondPierre(u, c, seed){
  var R = graine(seed);
  var defs = '<linearGradient id="' + u + '-pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient>' +
    '<radialGradient id="' + u + '-pl" cx=".2" cy=".15" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  var g = '<rect width="100" height="100" fill="url(#' + u + '-pg)"/><rect width="100" height="100" fill="url(#' + u + '-pl)"/>', k;
  for(k = 0; k < 70; k++) g += '<circle cx="' + f1(R() * 100) + '" cy="' + f1(R() * 100) + '" r="' + f1(.2 + R() * .7) + '" fill="' + (R() < .5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.15)') + '"/>';
  var fis = '';
  for(k = 0; k < 9; k++){
    var x = R() * 100, y = R() * 100, d = 'M' + f1(x) + ' ' + f1(y);
    for(var s = 0; s < 3; s++){ x += (R() - .5) * 30; y += (R() - .5) * 30; d += 'L' + f1(x) + ' ' + f1(y); }
    fis += '<path d="' + d + '"/>';
  }
  g += '<g fill="none" stroke="rgba(10,12,30,.5)" stroke-width=".8" stroke-linecap="round">' + fis + '</g><g fill="none" stroke="rgba(255,255,255,.1)" stroke-width=".5" transform="translate(.6 .6)">' + fis + '</g>';
  return {defs:defs, g:g};
}
/* Frise dorée dont les petits triangles tournent dans le sens des aiguilles d'une montre : chaque bord a un sens */
function frise(c){
  var g = '<rect x="3" y="3" width="94" height="94" rx="4" fill="none" stroke="' + c + '" stroke-width="1.4"/><rect x="6.6" y="6.6" width="86.8" height="86.8" rx="2.5" fill="none" stroke="' + c + '" stroke-width=".5" opacity=".8"/>';
  var t = '', x, y;
  for(x = 14; x <= 86; x += 9){
    t += 'M' + f1(x - .9) + ' 4.1L' + f1(x + 1) + ' 4.8L' + f1(x - .9) + ' 5.5Z';
    t += 'M' + f1(100 - x + .9) + ' 94.5L' + f1(100 - x - 1) + ' 95.2L' + f1(100 - x + .9) + ' 95.9Z';
  }
  for(y = 14; y <= 86; y += 9){
    t += 'M94.5 ' + f1(y - .9) + 'L95.2 ' + f1(y + 1) + 'L95.9 ' + f1(y - .9) + 'Z';
    t += 'M4.1 ' + f1(100 - y + .9) + 'L4.8 ' + f1(100 - y - 1) + 'L5.5 ' + f1(100 - y + .9) + 'Z';
  }
  return g + '<path d="' + t + '" fill="' + c + '"/>';
}
function coins(c){
  return '<circle cx="10.6" cy="10.6" r="1.7" fill="' + c + '"/>' +
    '<path d="M89.4 8.6A2.1 2.1 0 1 0 89.4 12.6A1.6 1.6 0 1 1 89.4 8.6Z" fill="' + c + '"/>' +
    '<rect x="9" y="88" width="3.2" height="3.2" fill="' + c + '" transform="rotate(45 10.6 89.6)"/>' +
    '<path d="M87.6 91.4L91.4 87.6M88.9 92.6L92.6 88.9" stroke="' + c + '" stroke-width=".8" stroke-linecap="round"/>';
}
function imgRunes(u, sym){
  var F = fondPierre(u, ['#6c7299', '#454b78', '#262a4d'], hachage(sym));
  var g = F.g + frise('#c9a75a') + coins('#e8c46a');
  g += '<circle cx="50" cy="50" r="41.5" fill="none" stroke="#c9a75a" stroke-width=".8"/><circle cx="50" cy="50" r="31.5" fill="rgba(10,14,40,.28)" stroke="rgba(191,249,255,.45)" stroke-width="1"/>';
  PETITES_RUNES.forEach(function(d, i){
    var a = i * Math.PI * 2 / 16 - Math.PI / 2;
    g += '<path transform="translate(' + f1(50 + Math.cos(a) * 36.5) + ' ' + f1(50 + Math.sin(a) * 36.5) + ')" d="' + d + '" fill="none" stroke="#e8c46a" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>';
  });
  var dd = SYMBOLES[sym].d;
  g += '<g transform="translate(50 50) scale(.58) translate(-50 -50)"><path d="' + dd + '" fill="none" stroke="rgba(143,243,255,.3)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + dd + '" fill="none" stroke="#bff9ff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>';
  return {defs:F.defs, g:g};
}
function texteCarte(x, y, t, taille){ return '<text x="' + x + '" y="' + y + '" font-size="' + taille + '" text-anchor="middle" font-family="Macondo, Georgia, serif" fill="#4a3018">' + t + '</text>'; }
function imgCarte(u){
  var defs = '<linearGradient id="' + u + '-pa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8ecd0"/><stop offset=".6" stop-color="#ead39f"/><stop offset="1" stop-color="#d6b779"/></linearGradient>' +
    '<radialGradient id="' + u + '-ta" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#a0682a" stop-opacity="0"/><stop offset=".82" stop-color="#a0682a" stop-opacity=".25"/><stop offset="1" stop-color="#a0682a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + u + '-br" cx="1" cy="0" r=".5"><stop offset="0" stop-color="#4a2a0e" stop-opacity=".55"/><stop offset="1" stop-color="#4a2a0e" stop-opacity="0"/></radialGradient>';
  var g = '<rect width="100" height="100" fill="url(#' + u + '-pa)"/>';
  g += '<circle cx="72" cy="88" r="9" fill="url(#' + u + '-ta)"/><circle cx="31" cy="38" r="6" fill="url(#' + u + '-ta)"/>';
  /* champs */
  g += '<path d="M40 82h9v8h-9zM51 83h8v7h-8zM44 92h12v4.5h-12z" fill="#dcc47c" stroke="#a88a3c" stroke-width=".35"/><path d="M41 84h7M41 86h7M41 88h7M52 85h6M52 87h6M45 94h10" stroke="#a88a3c" stroke-width=".3"/>';
  /* collines */
  g += '<path d="M36 20q5 -7 10 0q4 -5 8 0M80 94q4 -6 8 0M70 96q3 -4 6 0M4 44q4 -5 8 0" fill="none" stroke="#8a6a3a" stroke-width=".7"/>';
  /* rivière */
  var riv = 'M64 -2C58 14 74 24 68 38S70 60 80 68S94 84 98 102';
  g += '<path d="' + riv + '" fill="none" stroke="#4f8fbf" stroke-width="6.5" stroke-linecap="round"/><path d="' + riv + '" fill="none" stroke="#9fd0ee" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="' + riv + '" fill="none" stroke="#e6f6ff" stroke-width=".5" stroke-dasharray="2 4"/>';
  /* route et chemin */
  var route = 'M-2 60C14 57 24 61 36 58S58 50 70 50S88 44 102 36';
  g += '<path d="' + route + '" fill="none" stroke="#a87a45" stroke-width="2.2"/><path d="' + route + '" fill="none" stroke="#efd9a6" stroke-width=".8" stroke-dasharray="2 2"/>';
  g += '<path d="M30 60C27 68 22 74 17 80" fill="none" stroke="#8a5a2a" stroke-width=".8" stroke-dasharray="1.2 1.4"/>';
  /* pont */
  g += '<g transform="translate(70 50) rotate(-8)"><rect x="-5" y="-3.2" width="10" height="6.4" rx="1" fill="#b98a52" stroke="#5a3a1a" stroke-width=".5"/><path d="M-3 -3.2V3.2M-1 -3.2V3.2M1 -3.2V3.2M3 -3.2V3.2" stroke="#7a5228" stroke-width=".35"/></g>';
  /* forêt */
  [[8, 10], [14, 8], [20, 11], [10, 16], [17, 16], [24, 15], [6, 22], [13, 22], [20, 22], [27, 21], [9, 28], [30, 9], [35, 27], [4, 34]].forEach(function(a){
    g += '<path d="M' + a[0] + ' ' + f1(a[1] - 4.2) + 'L' + f1(a[0] + 3.2) + ' ' + f1(a[1] + 1.8) + 'L' + f1(a[0] - 3.2) + ' ' + f1(a[1] + 1.8) + 'Z" fill="#5b8a4a" stroke="#2f4a2a" stroke-width=".45"/><path d="M' + a[0] + ' ' + f1(a[1] + 1.8) + 'V' + f1(a[1] + 3) + '" stroke="#5a3a1a" stroke-width=".7"/>';
  });
  /* maisons du village */
  [[27, 52], [33, 55], [39, 51], [45, 55], [31, 61], [37, 63], [43, 61], [49, 59], [24, 58], [52, 53]].forEach(function(m){
    g += '<rect x="' + (m[0] - 2) + '" y="' + (m[1] - 1) + '" width="4" height="3.4" fill="#f3e2bd" stroke="#5a3a1a" stroke-width=".4"/><path d="M' + f1(m[0] - 2.7) + ' ' + f1(m[1] - .8) + 'L' + m[0] + ' ' + f1(m[1] - 3.4) + 'L' + f1(m[0] + 2.7) + ' ' + f1(m[1] - .8) + 'Z" fill="#b5523a" stroke="#5a2a1a" stroke-width=".4"/>';
  });
  /* clocher, mairie, fontaine */
  g += '<rect x="34" y="38" width="4.4" height="9" fill="#e9d6ad" stroke="#4a3220" stroke-width=".5"/><path d="M33.4 38.2L36.2 30.5L39 38.2Z" fill="#5a6f9a" stroke="#2a3350" stroke-width=".5"/><circle cx="36.2" cy="41" r="1" fill="#e8b84a" stroke="#6a4a1a" stroke-width=".3"/>';
  g += '<rect x="43" y="44.5" width="7.5" height="5" fill="#efdcb2" stroke="#4a3220" stroke-width=".5"/><path d="M42.4 44.7L46.75 41.6L51.1 44.7Z" fill="#8a4a7a" stroke="#4a2244" stroke-width=".4"/><path d="M46.75 41.6V37.5" stroke="#4a3220" stroke-width=".4"/><path d="M46.75 37.5h2.6l-.8 .9l.8 .9h-2.6z" fill="#d23c3c"/>';
  g += '<circle cx="40" cy="57.6" r="1.6" fill="#9fd0ee" stroke="#3f6f8f" stroke-width=".4"/>';
  /* moulin (rive droite) */
  g += '<rect x="86" y="62" width="4.4" height="5.5" fill="#efe0bb" stroke="#4a3220" stroke-width=".5"/><path d="M85.6 62.2L88.2 59.4L90.8 62.2Z" fill="#9a5a3a" stroke="#4a2a1a" stroke-width=".4"/><path d="M88.2 60.6L82.6 55M88.2 60.6L93.8 55M88.2 60.6L82.6 66.2M88.2 60.6L93.8 66.2" stroke="#4a3220" stroke-width=".7"/>';
  /* lavoir, puits */
  g += '<rect x="55" y="28" width="7" height="3.6" fill="#bfe0f2" stroke="#3f6f8f" stroke-width=".45"/><path d="M54.3 28.2L58.5 25.6L62.7 28.2Z" fill="#7a6a5a" stroke="#3a2a1a" stroke-width=".4"/>';
  g += '<circle cx="22" cy="70" r="1.9" fill="#6a5a4a" stroke="#3a2a1a" stroke-width=".45"/><circle cx="22" cy="70" r=".9" fill="#2a3a5a"/><path d="M19.6 67.4H24.4M20 67.4V70M24 67.4V70" stroke="#5a3a1a" stroke-width=".45"/>';
  /* vieux chêne */
  g += '<path d="M14 92V85" stroke="#5a3a1a" stroke-width="1.6"/><circle cx="14" cy="82" r="6" fill="#4f7f3f" stroke="#2a4a22" stroke-width=".6"/><circle cx="10.5" cy="80" r="3" fill="#5f9a4a"/><circle cx="17" cy="79.5" r="3.2" fill="#5f9a4a"/>';
  /* rose des vents */
  g += '<g transform="translate(86 16)"><circle r="6.5" fill="none" stroke="#7a5a2e" stroke-width=".5"/><path d="M0 -8L1.6 -1.6L8 0L1.6 1.6L0 8L-1.6 1.6L-8 0L-1.6 -1.6Z" fill="#c9a24a" stroke="#5a3a1a" stroke-width=".45"/>' +
    '<path d="M0 -8L1.6 -1.6L0 0ZM8 0L1.6 1.6L0 0ZM0 8L-1.6 1.6L0 0ZM-8 0L-1.6 -1.6L0 0Z" fill="#7a5a2e"/>' + texteCarte(0, -9.2, 'N', 3.6) + '</g>';
  /* noms */
  g += texteCarte(38, 71.5, 'Brumeval', 5.2) + texteCarte(18, 34.5, 'Forêt', 3.8) + texteCarte(58.5, 35.5, 'Lavoir', 3) + texteCarte(88, 73, 'Moulin', 3) +
    texteCarte(16, 96.5, 'Vieux Chêne', 3.2) + texteCarte(22, 76, 'Puits', 2.8) + texteCarte(79, 41, 'Pont', 2.8);
  /* coin brûlé + cadre */
  g += '<rect x="50" y="0" width="50" height="50" fill="url(#' + u + '-br)"/>';
  g += '<rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="#6a4a22" stroke-width=".9"/><rect x="3" y="3" width="94" height="94" fill="none" stroke="#6a4a22" stroke-width=".35"/>';
  return {defs:defs, g:g};
}
function imgBlason(u){
  var F = fondPierre(u, ['#6d7898', '#454f72', '#262b4a'], 11);
  var sh = 'M24 12H76V42C76 62 63 72 50 80C37 72 24 62 24 42Z';
  var defs = F.defs + '<clipPath id="' + u + '-cl"><path d="' + sh + '"/></clipPath>';
  var g = F.g + frise('#d9b25a') + coins('#f0d27a');
  g += '<path d="' + sh + '" fill="#000" opacity=".35" transform="translate(1.2 1.6)"/>';
  g += '<g clip-path="url(#' + u + '-cl)"><rect x="24" y="12" width="26" height="30" fill="#3f9a64"/><rect x="50" y="12" width="26" height="30" fill="#7c56c4"/>' +
    '<rect x="24" y="42" width="26" height="40" fill="#c75a86"/><rect x="50" y="42" width="26" height="40" fill="#3e78c2"/>' +
    '<path d="M18 30L46 6M18 52L70 6" stroke="rgba(255,255,255,.1)" stroke-width="6"/></g>';
  var cr = 'fill="none" stroke="#fff3d6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  g += '<path d="M29 27C32 21.5 42 21.5 45 27C42 32.5 32 32.5 29 27Z" ' + cr + '/><circle cx="37" cy="27" r="2.6" fill="#fff3d6"/>';
  g += '<path d="M55.5 23.5H70.5M56.5 23.5C56.5 33 69.5 33 69.5 23.5M58.5 31L57.5 34M67.5 31L68.5 34" ' + cr + '/><circle cx="61" cy="20.3" r="1.2" fill="#fff3d6"/><circle cx="65" cy="18.6" r=".9" fill="#fff3d6"/>';
  g += '<path d="M31 50C28.5 57 31.5 66 37 66C42.5 66 45.5 57 43 50M31.5 54H42.5M34.5 54V65M37 54V66M39.5 54V65" ' + cr + '/>';
  g += '<path d="M63 48.5L65.1 53.6L70.4 53.9L66.3 57.4L67.6 62.6L63 59.7L58.4 62.6L59.7 57.4L55.6 53.9L60.9 53.6Z" fill="#fff3d6"/>';
  g += '<path d="' + sh + '" fill="none" stroke="#e8c46a" stroke-width="2.2"/><path d="M50 12V79M24 42H76" stroke="#e8c46a" stroke-width="1.4"/>';
  g += '<path d="M50 3.8C55 6.6 54.5 10 50 11.8C45.5 10 45 6.6 50 3.8ZM50 5V11.8" fill="#fff3d6" stroke="#c9a75a" stroke-width=".6"/>';
  g += '<path d="M12 81L24 77.5H76L88 81L82 86.5L88 92L75 89.5H25L12 92L18 86.5Z" fill="#efdcae" stroke="#7a5a2e" stroke-width=".7"/>' +
    '<text x="50" y="85.7" font-size="5.4" text-anchor="middle" font-family="Macondo, Georgia, serif" fill="#5a3a1a" letter-spacing=".4">ENSEMBLE</text>';
  return {defs:defs, g:g};
}
function imgHorloge(u){
  var F = fondPierre(u, ['#8f8573', '#61584b', '#3a3329'], 23);
  var defs = F.defs + '<radialGradient id="' + u + '-ca" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fdf4dc"/><stop offset=".8" stop-color="#ead39f"/><stop offset="1" stop-color="#c9a76a"/></radialGradient>';
  var g = F.g + frise('#d2a24c');
  /* coins : roue dentée, croissant de lune, feuille, clé (l'horloge est celle de l'enquête 1 : plus de corbeau, Romain, 4 novembre) */
  g += '<g fill="#e3b85e"><circle cx="11" cy="11" r="2.4"/><path d="M11 7.4V14.6M7.4 11H14.6M8.5 8.5L13.5 13.5M13.5 8.5L8.5 13.5" stroke="#e3b85e" stroke-width="1"/></g><circle cx="11" cy="11" r="1" fill="#3a3329"/>';
  g += '<path d="M91 7.2A5 5 0 1 0 91 16.8A3.9 3.9 0 1 1 91 7.2Z" fill="#e3b85e"/>';
  g += '<path d="M8 92C8 87 11 84.5 15 84.5C15 89 12.5 92 8 92ZM8 92L13 87" fill="#7cae5a" stroke="#3a5a2a" stroke-width=".5"/>';
  g += '<circle cx="87.5" cy="88.5" r="1.8" fill="none" stroke="#e3b85e" stroke-width=".9"/><path d="M88.8 89.8L93 94M91.2 92.2L92.4 91M92.2 93.2L93.4 92" stroke="#e3b85e" stroke-width=".9" stroke-linecap="round"/>';
  /* cadran */
  g += '<circle cx="50" cy="48" r="38" fill="#00000055"/><circle cx="50" cy="47" r="37" fill="url(#' + u + '-ca)" stroke="#b8862e" stroke-width="3"/><circle cx="50" cy="47" r="30.5" fill="none" stroke="#8a6a3a" stroke-width=".5"/>';
  var tk = '', k;
  for(k = 0; k < 60; k++){
    var a = k * Math.PI / 30, r0 = k % 5 ? 33.6 : 31.6;
    tk += 'M' + f1(50 + Math.sin(a) * r0) + ' ' + f1(47 - Math.cos(a) * r0) + 'L' + f1(50 + Math.sin(a) * 35.2) + ' ' + f1(47 - Math.cos(a) * 35.2);
  }
  g += '<path d="' + tk + '" stroke="#5a4020" stroke-width=".5"/>';
  for(k = 0; k < 12; k++){
    var b = k * Math.PI / 6;
    g += '<path transform="translate(' + f1(50 + Math.sin(b) * 25) + ' ' + f1(47 - Math.cos(b) * 25) + ') scale(1.05)" d="' + PETITES_RUNES[(k * 5) % 16] + '" fill="none" stroke="#3a2a1a" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  /* aiguilles : dix heures dix */
  g += '<path d="M50 47L37.5 40" stroke="#2a1d10" stroke-width="2.4" stroke-linecap="round"/><path d="M37.5 40L36 37.6L34.4 40.6Z" fill="#2a1d10"/>';
  g += '<path d="M50 47L70 35.5" stroke="#2a1d10" stroke-width="1.4" stroke-linecap="round"/><path d="M70 35.5L73.4 33.4L71.6 37Z" fill="#2a1d10"/><path d="M50 47L45 50" stroke="#2a1d10" stroke-width="1.4" stroke-linecap="round"/>';
  g += '<circle cx="50" cy="47" r="2.6" fill="#d9a441" stroke="#6a4a1a" stroke-width=".6"/>';
  /* plaque */
  g += '<rect x="36" y="87.5" width="28" height="7.5" rx="1.5" fill="#c79a45" stroke="#6a4a1a" stroke-width=".6"/><text x="50" y="93" font-size="4.4" text-anchor="middle" font-family="Macondo, Georgia, serif" fill="#3a2810">MAIRIE</text>';
  return {defs:defs, g:g};
}
/* Le vieux plan du moulin (enquête 2) : vu de dessus, à l'encre sur un parchemin. Les meules, les sacs, la roue sur la rivière,
   la cour pavée… et, derrière le mur du fond, une petite pièce oubliée, reliée par un passage en pointillés.
   Des écritures et la rose des vents : on voit toujours dans quel sens va chaque morceau. */
function imgMoulin(u){
  var E = '#4a3018', e = ' stroke="' + E + '"';
  var defs = '<linearGradient id="' + u + '-pa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e8c8"/><stop offset=".6" stop-color="#e8d09a"/><stop offset="1" stop-color="#d2b274"/></linearGradient>' +
    '<radialGradient id="' + u + '-ta" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#a0682a" stop-opacity="0"/><stop offset=".82" stop-color="#a0682a" stop-opacity=".28"/><stop offset="1" stop-color="#a0682a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + u + '-br" cx="0" cy="1" r=".55"><stop offset="0" stop-color="#4a2a0e" stop-opacity=".55"/><stop offset="1" stop-color="#4a2a0e" stop-opacity="0"/></radialGradient>' +
    '<pattern id="' + u + '-pv" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#e3c88e"/><path d="M0 2H4M2 0V2M0 4V2M4 4V2" stroke="#b08a50" stroke-width=".35"/></pattern>';
  var g = '<rect width="100" height="100" fill="url(#' + u + '-pa)"/>';
  g += '<circle cx="24" cy="18" r="7" fill="url(#' + u + '-ta)"/><circle cx="66" cy="90" r="8" fill="url(#' + u + '-ta)"/>';
  /* titre */
  g += '<path d="M22 4.5H70L72 8.5L70 12.5H22L20 8.5Z" fill="#efdcae" stroke="' + E + '" stroke-width=".6"/>' + texteCarte(46, 10.6, 'PLAN DU MOULIN', 5);
  /* la rivière à droite, et la grande roue à aubes contre le mur */
  var riv = 'M88 -2C84 20 92 34 88 52S86 82 92 102';
  g += '<path d="' + riv + '" fill="none" stroke="#4f8fbf" stroke-width="9" stroke-linecap="round"/><path d="' + riv + '" fill="none" stroke="#9fd0ee" stroke-width="5"/><path d="' + riv + '" fill="none" stroke="#e6f6ff" stroke-width=".5" stroke-dasharray="2 4"/>';
  g += '<g transform="translate(80.5 56)"><circle r="7" fill="#c99a5e"' + e + ' stroke-width=".8"/><circle r="2" fill="#8a5a2a"' + e + ' stroke-width=".5"/><path d="M0 -7V7M-7 0H7M-5 -5L5 5M5 -5L-5 5" stroke="' + E + '" stroke-width=".6"/></g>' + texteCarte(81, 46.5, 'Roue', 2.8);
  /* le bâtiment : murs épais */
  g += '<rect x="14" y="22" width="62" height="50" fill="#f3e4c0"' + e + ' stroke-width="2.4"/>';
  g += '<path d="M14 46H44M44 22V72" stroke="' + E + '" stroke-width="1.3"/>';   /* murs intérieurs */
  g += '<path d="M28 46h5M44 56v6" stroke="#f3e4c0" stroke-width="1.6"/>';      /* portes intérieures */
  /* les meules (grande salle) */
  g += '<circle cx="60" cy="47" r="10" fill="#d9cfc0"' + e + ' stroke-width=".9"/><circle cx="60" cy="47" r="2.2" fill="#8a7a6a"' + e + ' stroke-width=".5"/><path d="M60 37V57M50 47H70M53 40L67 54M67 40L53 54" stroke="#8a7a6a" stroke-width=".4"/>' + texteCarte(60, 31.5, 'Les meules', 3.2);
  g += '<path d="M60 47L76 52" stroke="' + E + '" stroke-width=".9"/>';   /* l'axe de la roue */
  /* les sacs de farine (en haut à gauche) */
  [[19, 28], [24, 27], [29, 28], [20, 34], [26, 34], [32, 33]].forEach(function(s){ g += '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="2.4" ry="2" fill="#fffaf0"' + e + ' stroke-width=".45"/>'; });
  g += texteCarte(29, 42, 'Les sacs', 3.2);
  /* l'escalier (en bas à gauche) */
  g += '<path d="M18 52h20M18 55h20M18 58h20M18 61h20M18 64h20M18 67h20" stroke="' + E + '" stroke-width=".5"/><path d="M18 52V68M38 52V68" stroke="' + E + '" stroke-width=".7"/>' + texteCarte(28, 50.6, 'Escalier', 2.6);
  /* la porte d'entrée et la cour pavée */
  g += '<path d="M34 72h8" stroke="#f3e4c0" stroke-width="2.8"/><path d="M34 72l4 -3.2M42 72l-4 -3.2" stroke="' + E + '" stroke-width=".5"/>';
  g += '<rect x="14" y="76" width="62" height="17" fill="url(#' + u + '-pv)"' + e + ' stroke-width=".7"/>' + texteCarte(45, 87.5, 'La cour', 3.6);
  /* la petite pièce sans porte, sous la grande roue (en pointillés : elle est sous terre), et le passage secret pour y entrer */
  g += '<rect x="63" y="61" width="15" height="9" fill="#ecd6a6" fill-opacity=".85" stroke="#8a2a1a" stroke-width=".8" stroke-dasharray="1.6 1"/>';
  g += texteCarte(70.5, 68.2, '?', 5).replace('fill="#4a3018"', 'fill="#8a2a1a"');
  g += '<path d="M48 58C50 66 55 68 61 66.5" fill="none" stroke="#8a2a1a" stroke-width=".9" stroke-dasharray="1.4 1.2"/><path d="M58.6 64.6L62 66.3L58.8 68.2" fill="none" stroke="#8a2a1a" stroke-width=".8" stroke-linejoin="round"/>';
  /* rose des vents, échelle */
  g += '<g transform="translate(8 92)"><circle r="4.5" fill="none" stroke="#7a5a2e" stroke-width=".45"/><path d="M0 -5.6L1.1 -1.1L5.6 0L1.1 1.1L0 5.6L-1.1 1.1L-5.6 0L-1.1 -1.1Z" fill="#c9a24a" stroke="#5a3a1a" stroke-width=".35"/>' + texteCarte(0, -6.6, 'N', 2.8) + '</g>';
  g += '<path d="M80 95H94M80 94V96M87 94.4V95.6M94 94V96" stroke="' + E + '" stroke-width=".5"/>' + texteCarte(87, 98.6, '10 pas', 2.4);
  /* une tache d'encre, un coin brûlé, le cadre */
  g += '<path d="M8 30c1.4 -1.6 3.6 -.8 3.4 1c1.4 .6 .6 2.6 -.8 2.2c-.6 1.6 -3 1 -2.6 -.6c-1.6 -.2 -1.4 -2.2 0 -2.6Z" fill="#2a1d10" opacity=".55"/>';
  g += '<rect x="0" y="50" width="50" height="50" fill="url(#' + u + '-br)"/>';
  g += '<rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="#6a4a22" stroke-width=".9"/><rect x="3" y="3" width="94" height="94" fill="none" stroke="#6a4a22" stroke-width=".35"/>';
  return {defs:defs, g:g};
}
/* Enquête 3 : le tableau d'Odette et de ses sept chats (la mission de fête du Sage, à la mairie). Une toile peinte dans un cadre doré :
   Odette au milieu (chignon gris, lunettes rondes, châle violet), sa canne aux chats gravés, et ses sept chats tout autour, chacun de sa
   couleur ; Moustache, le gros gris, sur ses genoux. Des coups de pinceau partout, pour que chaque pièce ait quelque chose à elle. */
var CHATS_TABLEAU = [
  {x:50, y:73, s:1.35, c:'#8d939c', o:'#5d636c', nom:'Moustache'},   /* le gros gris, sur ses genoux */
  {x:15, y:86, s:1, c:'#e9c48a', o:'#b48a52'},    /* Biscotte */
  {x:31, y:91, s:.9, c:'#f6f1e8', o:'#c9bfae'},   /* Pompon */
  {x:70, y:91, s:.95, c:'#e58a3a', o:'#b25a1a'},  /* Caramel */
  {x:86, y:86, s:1, c:'#2e2a33', o:'#141118'},    /* Mistigri */
  {x:13, y:58, s:.85, c:'#8a5a34', o:'#5c3a1e'},  /* Noisette, sur le rebord */
  {x:87, y:57, s:.85, c:'#c2c6cc', o:'#8d939c'}   /* Grisette */
];
function chatTableau(c, i){
  var s = c.s, q = function(v){ return f1(v); };
  var g = '<g transform="translate(' + q(c.x) + ' ' + q(c.y) + ') scale(' + q(s) + ')">';
  g += '<path d="M3.2 2.6C7.8 2 8.6 -3 6.4 -5.4" fill="none" stroke="' + c.o + '" stroke-width="1.5" stroke-linecap="round"/>';   /* la queue */
  g += '<ellipse cx="0" cy="1.2" rx="4.4" ry="3.6" fill="' + c.c + '" stroke="' + c.o + '" stroke-width=".55"/>';
  g += '<path d="M-3.6 -3.2L-3.8 -7.4L-1.2 -5.1ZM3.6 -3.2L3.8 -7.4L1.2 -5.1Z" fill="' + c.c + '" stroke="' + c.o + '" stroke-width=".5" stroke-linejoin="round"/>';
  g += '<circle cx="0" cy="-3.4" r="3.3" fill="' + c.c + '" stroke="' + c.o + '" stroke-width=".55"/>';
  var oeil = i === 4 ? '#e8d24a' : '#3a6a3a';
  g += '<circle cx="-1.2" cy="-3.7" r=".62" fill="' + oeil + '"/><circle cx="1.2" cy="-3.7" r=".62" fill="' + oeil + '"/>';
  g += '<path d="M-.5 -2.5L0 -2.1L.5 -2.5" fill="none" stroke="#c85a6a" stroke-width=".35" stroke-linecap="round"/>';
  if(i === 0) g += '<path d="M-1.4 -2.2H-4.6M-1.4 -1.8L-4.4 -1M1.4 -2.2H4.6M1.4 -1.8L4.4 -1" stroke="#f4f4f4" stroke-width=".25"/>';   /* ses moustaches */
  if(i === 2) g += '<circle cx="0" cy="-6.6" r="1.1" fill="#f6b6c8" opacity=".9"/>';   /* un petit pompon rose */
  return g + '</g>';
}
function imgTableau(u){
  var defs = '<linearGradient id="' + u + '-tf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4dca2"/><stop offset=".55" stop-color="#e7b877"/><stop offset="1" stop-color="#b98450"/></linearGradient>' +
    '<radialGradient id="' + u + '-tl" cx=".5" cy=".36" r=".5"><stop offset="0" stop-color="#fff6d8" stop-opacity=".8"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + u + '-tc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a4a9a"/><stop offset="1" stop-color="#4a2a6a"/></linearGradient>' +
    '<linearGradient id="' + u + '-to" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d77a"/><stop offset=".5" stop-color="#c9952e"/><stop offset="1" stop-color="#8a5a1a"/></linearGradient>';
  var R = graine(7177), g = '<rect width="100" height="100" fill="url(#' + u + '-tf)"/><rect width="100" height="100" fill="url(#' + u + '-tl)"/>', k;
  /* le décor peint : une fenêtre, des fleurs, le sol */
  g += '<rect x="66" y="14" width="18" height="22" rx="1.5" fill="#9fc6e6" stroke="#7a5228" stroke-width="1.2"/><path d="M75 14V36M66 25H84" stroke="#7a5228" stroke-width=".9"/><circle cx="79" cy="19" r="2.4" fill="#fff4b8"/>';
  g += '<path d="M14 18c2 -3 5 -3 6 0c3 -1 4 2 2 3.6c1.6 2 -1 4 -3 3c-1 2.4 -4.4 1.6 -4.2 -.8c-2.4 -.2 -2.6 -3.4 -.8 -5.8Z" fill="#e86a7a" opacity=".85"/><circle cx="17.6" cy="21.6" r="1.4" fill="#f6d04a"/>';
  g += '<path d="M22 30c1.4 -2 3.6 -2 4.2 0c2 -.6 2.8 1.4 1.4 2.4c1 1.4 -.8 2.8 -2.2 2c-.8 1.6 -3 1 -2.8 -.6c-1.6 -.2 -1.8 -2.2 -.6 -3.8Z" fill="#8a7ae8" opacity=".85"/>';
  g += '<path d="M16 34C18 26 20 22 18 16M24 40C25 34 25 30 24.6 34" stroke="#4a7a3a" stroke-width=".8" fill="none"/>';
  g += '<path d="M0 78C20 72 40 76 50 75S80 72 100 77V100H0Z" fill="#9a6a42" opacity=".55"/>';
  /* les coups de pinceau, partout */
  for(k = 0; k < 46; k++){
    var x = R() * 100, y = R() * 100, a = R() * 3.14, l = 2 + R() * 4;
    g += '<path d="M' + f1(x) + ' ' + f1(y) + 'l' + f1(Math.cos(a) * l) + ' ' + f1(Math.sin(a) * l) + '" stroke="' + (R() < .5 ? 'rgba(255,240,200,.35)' : 'rgba(120,70,30,.18)') + '" stroke-width="' + f1(.6 + R() * .9) + '" stroke-linecap="round"/>';
  }
  /* Odette : le châle violet, la robe, la tête, le chignon gris, les lunettes */
  g += '<path d="M30 80C30 64 38 56 50 56S70 64 70 80Z" fill="#5a7a9a" stroke="#2a3a4a" stroke-width=".7"/>';
  g += '<path d="M33 66C38 58 44 56 50 57C56 56 62 58 67 66L60 70L50 62L40 70Z" fill="url(#' + u + '-tc)" stroke="#2a1a3a" stroke-width=".6"/>';
  g += '<path d="M42 60L50 68L58 60" fill="none" stroke="#c9a0e6" stroke-width=".6" stroke-dasharray="1 1"/>';
  g += '<rect x="46.6" y="50.5" width="6.8" height="6.5" fill="#f2c8a4"/>';
  g += '<ellipse cx="50" cy="43" rx="9" ry="10" fill="#f6d2b0" stroke="#8a5a3a" stroke-width=".6"/>';
  g += '<path d="M40.6 42C40 32 46 29.5 50 29.5S60 32 59.4 42C58 36 55 34.4 50 34.4S42 36 40.6 42Z" fill="#c9c9cf" stroke="#7a7a84" stroke-width=".6"/>';
  g += '<circle cx="50" cy="27.6" r="4.4" fill="#d6d6dc" stroke="#7a7a84" stroke-width=".6"/><path d="M47 26.6c1.4 -1 4.6 -1 6 0" stroke="#9a9aa4" stroke-width=".5" fill="none"/>';
  g += '<circle cx="46" cy="43.4" r="2.6" fill="rgba(255,255,255,.25)" stroke="#5a3a2a" stroke-width=".55"/><circle cx="54" cy="43.4" r="2.6" fill="rgba(255,255,255,.25)" stroke="#5a3a2a" stroke-width=".55"/><path d="M48.6 43.2H51.4" stroke="#5a3a2a" stroke-width=".5"/>';
  g += '<circle cx="46" cy="43.6" r=".75" fill="#3a2a1e"/><circle cx="54" cy="43.6" r=".75" fill="#3a2a1e"/>';
  g += '<circle cx="44.2" cy="47.6" r="1.6" fill="#f0a0a0" opacity=".55"/><circle cx="55.8" cy="47.6" r="1.6" fill="#f0a0a0" opacity=".55"/>';
  g += '<path d="M46.6 48.8C48.4 50.6 51.6 50.6 53.4 48.8" fill="none" stroke="#9a4a3a" stroke-width=".7" stroke-linecap="round"/>';
  /* sa canne aux sept chats gravés */
  g += '<path d="M66 60L72 92" stroke="#6a3a1a" stroke-width="1.8" stroke-linecap="round"/><path d="M66 60C64 56 68 53 70.4 55.6" fill="none" stroke="#6a3a1a" stroke-width="1.8" stroke-linecap="round"/>';
  for(k = 0; k < 7; k++) g += '<circle cx="' + f1(66.9 + k * .82) + '" cy="' + f1(64.5 + k * 3.9) + '" r=".55" fill="#e8c46a"/>';
  g += '<path d="M64 66C62 64 63 62 65 62.6" stroke="#f6d2b0" stroke-width="2.2" stroke-linecap="round" fill="none"/>';   /* sa main */
  /* les sept chats */
  CHATS_TABLEAU.forEach(function(c, i){ g += chatTableau(c, i); });
  /* la signature, en bas à droite, et le cadre doré */
  g += '<text x="80" y="97" font-size="3.2" font-family="Georgia, serif" font-style="italic" fill="#5a3a1a">Odette</text>';
  g += '<rect x="1.6" y="1.6" width="96.8" height="96.8" fill="none" stroke="url(#' + u + '-to)" stroke-width="3.2"/><rect x="4" y="4" width="92" height="92" fill="none" stroke="#8a5a1a" stroke-width=".5"/>';
  g += '<circle cx="3.2" cy="3.2" r="1.6" fill="#f6d77a"/><circle cx="96.8" cy="3.2" r="1.6" fill="#f6d77a"/><circle cx="3.2" cy="96.8" r="1.6" fill="#f6d77a"/><circle cx="96.8" cy="96.8" r="1.6" fill="#f6d77a"/>';
  return {defs:defs, g:g};
}
function defsImage(u, R){
  var im = R.image === 'carte' ? imgCarte(u) : R.image === 'moulin' ? imgMoulin(u) : R.image === 'blason' ? imgBlason(u) : R.image === 'horloge' ? imgHorloge(u) : R.image === 'tableau' ? imgTableau(u) : imgRunes(u, R.symbole);
  return '<svg class="mjs-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' + im.defs + '<g id="' + u + '">' + im.g + '</g></defs></svg>';
}
function resoudreImg(p){
  if(p.__mjsImg) return p.__mjsImg;
  var im = IMAGES[p.image] ? p.image : (SYMBOLES[p.symbole] ? 'runes' : tirerSans(imagesAuHasard(), 'img'));
  var sym = SYMBOLES[p.symbole] ? p.symbole : U.choix(Object.keys(SYMBOLES));
  var R = {image:im, symbole:sym, nom:im === 'runes' ? SYMBOLES[sym].nom : IMAGES[im].nom};
  p.__mjsImg = R;
  (p.lignes || []).forEach(function(l){ if(l.nom === 'À reconstituer') l.val = IMAGES[im].ic + ' ' + R.nom; });
  return R;
}
function derangement(m){
  var a;
  do{ a = U.melanger(plage(m)); } while(a.some(function(x, i){ return x === i; }));
  return a;
}

/* ==========================================================
   RUNES — le mini-jeu
   ========================================================== */
MJ.enregistrer('runes', {
  nom:'Assembler les runes', role:'sage', ic:'🔷', minuteur:false,
  IMAGES:imagesAuHasard(),
  consigne:function(p){
    var R = resoudreImg(p || {});
    return 'Reconstitue ' + R.nom + ' ! Touche une pièce pour la tourner, fais-la glisser sur une autre pour les échanger. Tes coups sont comptés.';
  },
  reglages:function(n, mods){
    mods = mods || {};
    var moins = Math.max(0, mods.moins || 0);
    var base = n <= 2 ? 2 : n <= 4 ? 3 : n <= 7 ? 4 : 5;
    var taille = Math.max(2, base - moins);
    var fracMel = U.parNiveau(n, .5, 1, .4, 1), fracRot = U.parNiveau(n, .45, 1, .35, 1);
    var facteur = U.parNiveau(n, 1.9, 1.08, 1.05), bonus = Math.round(U.parNiveau(n, 5, 0, 0)) + 3 * (mods.erreurs || 0);
    var pouce = (mods.pouce || 0) + (n <= 2 ? 1 : 0), aide = mods.aide || 0;
    var reserve = facteur >= 1.6 ? 'beaucoup' : facteur >= 1.3 ? 'quelques-uns' : facteur >= 1.15 ? 'très peu' : 'presque aucun';
    return {taille:taille, fracMel:fracMel, fracRot:fracRot, facteur:facteur, bonus:bonus, aide:aide, pouce:pouce,
      revele:!!mods.revele, marque:n <= 4 || !!mods.revele, lignes:[
        {nom:'À reconstituer', val:'tiré au hasard'},
        {nom:'Pièces', val:taille + ' × ' + taille + (moins ? ' (moins de pièces)' : '')},
        {nom:'Pièces tournées', val:fracRot >= .95 ? 'toutes' : 'environ ' + Math.round(fracRot * 10) + ' sur 10'},
        {nom:'Coups en réserve', val:reserve + (mods.erreurs ? ' (+' + 3 * mods.erreurs + ')' : '')},
        {nom:'Sablier', val:'aucun : prends ton temps !'}
      ].concat(aide ? [{nom:'Pièces déjà posées', val:String(aide)}] : [])
       .concat(pouce ? [{nom:'Coups de pouce (2 pièces)', val:String(pouce)}] : [])
       .concat(mods.revele ? [{nom:'Image fantôme', val:'oui'}] : [])};
  },
  demo:function(el, p){
    var u = 'mjsd' + (++compteur);
    var img = '<svg class="mjs-defs" width="0" height="0" aria-hidden="true"><defs><g id="' + u + '"><rect width="100" height="100" fill="#454b78"/>' +
      '<rect x="4" y="4" width="92" height="92" rx="6" fill="none" stroke="#c9a75a" stroke-width="3"/>' +
      '<circle cx="50" cy="50" r="26" fill="none" stroke="#bff9ff" stroke-width="6"/><path d="M50 12V88M12 50H88" stroke="#bff9ff" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="14" cy="14" r="5" fill="#e8c46a"/><path d="M78 30L90 18" stroke="#e8c46a" stroke-width="5" stroke-linecap="round"/></g></defs></svg>';
    function piece(h){ var x = (h % 2) * 50, y = Math.floor(h / 2) * 50; return '<i class="mjs-dp" data-h="' + h + '"><b><svg viewBox="' + x + ' ' + y + ' 50 50"><use href="#' + u + '"/></svg></b></i>'; }
    var ctl = demoMain(el,
      img + '<div class="mjs-d-runes"><div class="mjs-d-plateau">' + [0, 1, 2, 3].map(piece).join('') + '</div><div class="mjs-d-coups">🕯️ <b>3</b> coups</div><p class="mjs-d-leg"></p></div>',
      7200, [
        [0, function(c){
          c.box.classList.remove('vu');
          placer(c, 0, 0, 270); placer(c, 1, 2, 0); placer(c, 2, 1, 0); placer(c, 3, 3, 0);
          c.q('.mjs-d-coups b').textContent = '3'; c.q('.mjs-d-leg').textContent = ''; c.va(50, 98);
          c.qa('.mjs-dp').forEach(function(x){ x.classList.remove('juste', 'glisse'); x.style.transform = ''; });
        }],
        [800, function(c){ c.va(37, 30); }],
        [1200, function(c){ c.tape(); placer(c, 0, 0, 360); c.q('[data-h="0"]').classList.add('juste'); c.q('.mjs-d-coups b').textContent = '2'; c.q('.mjs-d-leg').textContent = '👆 Touche : la pièce tourne'; }],
        [2300, function(c){ c.va(37, 68); }],
        [2700, function(c){ c.tape(); c.q('[data-h="1"]').classList.add('glisse'); }],
        [2900, function(c){ c.va(63, 30); c.q('[data-h="1"]').style.transform = 'translate(100%, -100%)'; c.q('.mjs-d-leg').textContent = '✋ Glisse : les pièces s\'échangent'; }],
        [3500, function(c){ var a = c.q('[data-h="1"]'); a.classList.remove('glisse'); a.style.transform = ''; placer(c, 1, 1, 0); placer(c, 2, 2, 0); a.classList.add('juste'); c.q('[data-h="2"]').classList.add('juste'); c.q('.mjs-d-coups b').textContent = '1'; }],
        [4300, function(c){ c.box.classList.add('vu'); c.q('.mjs-d-leg').textContent = '✨ Tout est en place, avant la fin des coups !'; c.va(50, 98); }]
      ]);
    function placer(c, h, pos, deg){ var n = c.q('[data-h="' + h + '"]'); n.style.left = (pos % 2) * 50 + '%'; n.style.top = Math.floor(pos / 2) * 50 + '%'; n.querySelector('b').style.transform = 'rotate(' + deg + 'deg)'; }
    return ctl;
  },
  jouer:function(el, p, fin){
    var T = minuteurs(), fini = false, arrete = false, bloque = false, stops = [];
    var R = resoudreImg(p);
    var k = Math.max(2, Math.min(6, p.taille || 3)), N = k * k, u = 'mjsr' + (++compteur), cell = 100 / k;
    /* pièces : posées et bloquées (aide), puis mélange (dérangement) et rotations */
    var tuiles = plage(N).map(function(h){ return {home:h, pos:h, rot:0, deg:0, fixe:false}; });
    U.melanger(plage(N)).slice(0, Math.max(0, Math.min(p.aide || 0, N - 2))).forEach(function(h){ tuiles[h].fixe = true; });
    var libres = tuiles.filter(function(t){ return !t.fixe; });
    var nMel = Math.round(libres.length * (p.fracMel === undefined ? 1 : p.fracMel));
    if(nMel < 2) nMel = libres.length >= 2 ? 2 : 0;
    var choisis = U.melanger(libres).slice(0, nMel), places = choisis.map(function(t){ return t.pos; });
    if(choisis.length >= 2){ var dr = derangement(choisis.length); choisis.forEach(function(t, i){ t.pos = places[dr[i]]; }); }
    var nRot = Math.round(libres.length * (p.fracRot === undefined ? 1 : p.fracRot));
    U.melanger(libres).slice(0, nRot).forEach(function(t){ t.rot = U.randInt(1, 3); t.deg = t.rot * 90; });
    if(libres.length && tuiles.every(function(t){ return t.pos === t.home && t.rot === 0; })){ libres[0].rot = 1; libres[0].deg = 90; }
    /* minimum de coups : quarts de tour (toujours dans le même sens) + échanges (N - nombre de cycles) */
    var rotMin = tuiles.reduce(function(s, t){ return s + (4 - t.rot) % 4; }, 0), vu = {}, cycles = 0;
    tuiles.forEach(function(t){ if(vu[t.home]) return; cycles++; var c = t; while(!vu[c.home]){ vu[c.home] = true; c = tuiles[c.pos]; } });
    var optimum = rotMin + (N - cycles);
    var coups = Math.ceil(optimum * (p.facteur || 1.3)) + (p.bonus || 0), coupsMax = coups, joues = 0;
    var pouce = p.pouce || 0;
    function tuileA(pos){ for(var i = 0; i < N; i++) if(tuiles[i].pos === pos) return tuiles[i]; return null; }
    function bien(t){ return t.pos === t.home && t.rot === 0; }
    var quad = '';
    if(p.marque || p.revele){ for(var q = 1; q < k; q++) quad += 'M' + f2(q * cell) + ' 0V100M0 ' + f2(q * cell) + 'H100'; }
    var pieces = tuiles.map(function(t){
      var hx = (t.home % k) * cell, hy = Math.floor(t.home / k) * cell;
      return '<div class="mjs-piece' + (t.fixe ? ' fixe' : '') + '" data-home="' + t.home + '"><div class="mjs-pi" style="transform:rotate(' + t.deg + 'deg)">' +
        '<svg viewBox="' + f2(hx) + ' ' + f2(hy) + ' ' + f2(cell) + ' ' + f2(cell) + '" preserveAspectRatio="none" aria-hidden="true"><use href="#' + u + '"/></svg></div>' +
        (t.fixe ? '<span class="mjs-cad">🔒</span>' : '') + '</div>';
    }).join('');
    el.innerHTML =
      '<div class="mjs-jeu mjs-runes mjs-img-' + R.image + ' mjs-fond-' + IMAGES[R.image].fond + '"><div class="mjs-in">' + defsImage(u, R) +
        '<div class="mjs-r-cote">' +
          '<div class="mjs-modele"><svg viewBox="0 0 100 100" aria-label="Modèle"><use href="#' + u + '"/>' + (quad ? '<path class="mjs-quad" d="' + quad + '"/>' : '') + '</svg><span>Modèle</span></div>' +
          '<div class="mjs-coups" role="status" aria-label="Coups restants"><span class="mjs-coups-ic">🕯️</span><b>' + coups + '</b><span class="mjs-coups-txt">coups</span>' +
            '<small>au mieux : ' + optimum + '</small><span class="mjs-coups-barre"><i></i></span></div>' +
          '<div class="mjs-r-coeurs"></div>' +
          (pouce ? '<button type="button" class="mjs-pouce">🤝 Coup de pouce <b>×' + pouce + '</b></button>' : '') +
          '<p class="mjs-r-aide">👆 Touche : tourner · ✋ Glisse : échanger</p>' +
        '</div>' +
        '<div class="mjs-r-centre"><div class="mjs-plateau" style="--k:' + k + '">' + pieces +
          (p.revele ? '<svg class="mjs-fantome" viewBox="0 0 100 100" aria-hidden="true"><use href="#' + u + '"/></svg>' : '') + '</div></div>' +
      '</div></div>';
    var root = el.firstChild, plateau = root.querySelector('.mjs-plateau'), centre = root.querySelector('.mjs-r-centre');
    var coupsN = root.querySelector('.mjs-coups b'), coupsBox = root.querySelector('.mjs-coups'), coupsBar = root.querySelector('.mjs-coups-barre i');
    var btnPouce = root.querySelector('.mjs-pouce'), modele = root.querySelector('.mjs-modele svg');
    function noeud(t){ return plateau.querySelector('.mjs-piece[data-home="' + t.home + '"]'); }
    function placer(t){ var n = noeud(t); n.style.left = f2((t.pos % k) * cell) + '%'; n.style.top = f2(Math.floor(t.pos / k) * cell) + '%'; n.style.width = n.style.height = f2(cell) + '%'; n.dataset.pos = t.pos; }
    function tourne(t){ noeud(t).querySelector('.mjs-pi').style.transform = 'rotate(' + t.deg + 'deg)'; noeud(t).dataset.rot = t.rot; }
    tuiles.forEach(function(t){ placer(t); tourne(t); if(p.marque && bien(t)) noeud(t).classList.add('bien'); });
    stops.push(observer(root, function(){
      var w = root.clientWidth, h = root.clientHeight, pay = w > h * 1.15 && w >= 560;
      root.classList.toggle('mjs-paysage', pay);
      root.classList.toggle('mjs-grand', w >= 600 && h >= 760);
      /* le modèle prend la place libre (il doit être lisible pour une carte en 25 morceaux) */
      var m = pay ? Math.max(110, Math.min(170, h * .32)) : Math.max(84, Math.min(180, h - Math.min(w - 30, 680) - 120));
      modele.style.width = modele.style.height = Math.round(m) + 'px';
      var s = Math.floor(Math.min(centre.clientWidth - 18, centre.clientHeight - 18, 680));
      if(s > 40){ plateau.style.width = plateau.style.height = s + 'px'; }
    }));
    function majCoups(){
      coupsN.textContent = Math.max(0, coups);
      coupsBar.style.transform = 'scaleX(' + Math.max(0, coups / coupsMax).toFixed(4) + ')';
      coupsBox.classList.toggle('alerte', coups <= Math.max(3, Math.round(coupsMax * .12)) && coups > 0);
      coupsBox.classList.remove('moins'); void coupsBox.offsetWidth; coupsBox.classList.add('moins');
      /* la règle des cœurs : les coups « en trop » encore permis (coups − le minimum encore nécessaire) */
      var h = coups - minRestant(), hc = root.querySelector('.mjs-r-coeurs');
      if(hc){ hc.innerHTML = U.coeurs(Math.max(0, h), Math.max(coeursR, h), h < coeursAvant ? Math.max(0, h) : undefined); }
      if(h === 0 && coeursAvant > 0) U.plusDeCoeur(root);
      coeursAvant = h;
    }
    function minRestant(){
      var rot = tuiles.reduce(function(s, t){ return s + (4 - t.rot) % 4; }, 0), vu2 = {}, cyc = 0;
      tuiles.forEach(function(t){ if(vu2[t.home]) return; cyc++; var c = t; while(!vu2[c.home]){ vu2[c.home] = true; c = tuiles[c.pos]; } });
      return rot + (N - cyc);
    }
    var coeursR = Math.max(0, coups - optimum), coeursAvant = coeursR;
    majCoups(); coupsBox.classList.remove('moins');
    function resolu(){ return tuiles.every(bien); }
    function finir(res){ if(fini || arrete) return; fini = true; bloque = true; T.tout(); nettoyer(); fin(res); }
    function gagner(){
      bloque = true; root.classList.add('complet'); clac(true); U.son('magie'); U.vibrer(40);
      T.t(function(){ finir({reussi:true, score:1, coups:joues, optimum:optimum, image:R.image, message:'Tout est en place !', detail:'Tu as reconstitué ' + R.nom + ' en ' + joues + ' coup' + (joues > 1 ? 's' : '') + '.'}); }, 1900);
    }
    function perdre(){
      bloque = true; root.classList.add('eteint'); U.son('echec');
      var nb = tuiles.filter(bien).length;
      T.t(function(){ finir({reussi:false, score:f2(nb / N * .5), coups:joues, optimum:optimum, image:R.image, message:'Tant pis…', detail:(coups > 0 ? 'Plus de cœur : il ne reste plus assez de coups. ' : 'Plus de coups : ') + R.nom + ' reste en morceaux (' + nb + ' pièce' + (nb > 1 ? 's' : '') + ' sur ' + N + ' en place).'}); }, 1100);
    }
    function verifJuste(t){
      var n = noeud(t), ok = bien(t);
      if(ok && !n.classList.contains('bien-vu')){ clac(); U.vibrer(15); n.classList.remove('juste'); void n.offsetWidth; n.classList.add('juste'); }
      n.classList.toggle('bien-vu', ok);
      n.classList.toggle('bien', ok && !!p.marque);
    }
    tuiles.forEach(function(t){ if(bien(t)) noeud(t).classList.add('bien-vu'); });
    function coup(){
      coups--; joues++; majCoups();
      if(resolu()){ gagner(); return; }
      if(coups <= 0 || coups < minRestant()) perdre();   /* plus de cœur et un coup de trop : on ne peut plus finir à temps */
    }
    function tourner(t){
      t.rot = (t.rot + 1) % 4; t.deg += 90; tourne(t); U.son('tic');
      verifJuste(t); coup();
    }
    function echanger(ta, tb, d){
      var pa = ta.pos; ta.pos = tb.pos; tb.pos = pa;
      var nd = d.nd, avant = nd.getBoundingClientRect();
      nd.classList.remove('glisse'); nd.style.transition = 'none'; nd.style.transform = '';
      placer(ta);
      var apres = nd.getBoundingClientRect();
      nd.style.transform = 'translate(' + f1(avant.left - apres.left) + 'px,' + f1(avant.top - apres.top) + 'px)';
      void nd.offsetWidth; nd.style.transition = ''; nd.style.transform = '';
      placer(tb); U.son('pas');
      verifJuste(ta); verifJuste(tb); coup();
    }
    function revenir(d){ d.nd.classList.remove('glisse'); d.nd.style.transform = ''; }
    var drag = null;
    plateau.addEventListener('pointerdown', function(e){
      if(bloque || drag) return;
      var nd = e.target.closest('.mjs-piece'); if(!nd) return;
      drag = {nd:nd, t:tuiles[+nd.dataset.home], x:e.clientX, y:e.clientY, id:e.pointerId, bouge:false};
      try{ nd.setPointerCapture(e.pointerId); }catch(er){}
      e.preventDefault();
    });
    plateau.addEventListener('pointermove', function(e){
      if(!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if(!drag.bouge && Math.hypot(dx, dy) > 10){ if(drag.t.fixe) return; drag.bouge = true; drag.nd.classList.add('glisse'); }
      if(drag.bouge) drag.nd.style.transform = 'translate(' + f1(dx) + 'px,' + f1(dy) + 'px) scale(1.06)';
    });
    plateau.addEventListener('pointerup', function(e){
      if(!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if(bloque){ revenir(d); return; }
      if(d.bouge){
        var r = plateau.getBoundingClientRect();
        var cx = Math.floor((e.clientX - r.left) / r.width * k), cy = Math.floor((e.clientY - r.top) / r.height * k);
        var cible = (cx >= 0 && cy >= 0 && cx < k && cy < k) ? tuileA(cy * k + cx) : null;
        if(cible && cible !== d.t && !cible.fixe) echanger(d.t, cible, d);
        else { revenir(d); if(cible && cible.fixe){ U.son('ko'); secoue(noeud(cible)); } }
      } else if(d.t.fixe){ secoue(d.nd); U.son('ko'); }
      else tourner(d.t);
    });
    plateau.addEventListener('pointercancel', function(){ if(drag){ revenir(drag); drag = null; } });
    if(btnPouce) btnPouce.addEventListener('click', function(){
      if(bloque || pouce <= 0) return;
      var faux = tuiles.filter(function(t){ return !t.fixe && !bien(t); });
      if(!faux.length) return;
      pouce--;
      U.melanger(faux).slice(0, 2).forEach(function(t){
        if(t.pos !== t.home){ var o = tuileA(t.home); o.pos = t.pos; t.pos = t.home; placer(o); verifJuste(o); }
        t.deg += ((4 - t.rot) % 4) * 90; t.rot = 0; t.fixe = true;
        placer(t); tourne(t);
        var n = noeud(t); n.classList.add('fixe', 'pousse'); n.classList.add('bien-vu');
        if(!n.querySelector('.mjs-cad')) n.insertAdjacentHTML('beforeend', '<span class="mjs-cad">🔒</span>');
      });
      clac(true); U.son('magie');
      btnPouce.querySelector('b').textContent = '×' + pouce;
      if(pouce <= 0) btnPouce.disabled = true;
      if(resolu()) gagner();
    });
    var crochet = {etat:function(){ return {k:k, N:N, coups:coups, coupsMax:coupsMax, optimum:optimum, image:R.image, symbole:R.symbole, pouce:pouce, joues:joues,
      tuiles:tuiles.map(function(t){ return {home:t.home, pos:t.pos, rot:t.rot, fixe:t.fixe}; })}; }};
    window.__mjsRunes = crochet; root.__mjs = crochet;
    function nettoyer(){
      stops.forEach(function(f){ try{ f(); }catch(e){} }); stops = [];
      if(window.__mjsRunes === crochet) try{ delete window.__mjsRunes; }catch(e){ window.__mjsRunes = null; }
    }
    return {arreter:function(){ arrete = true; bloque = true; T.tout(); nettoyer(); }};
  }
});

/* Accès pour le moteur et les tests */
MJ.sageCodes = {SYSTEMES:SYSTEMES, IMAGES:IMAGES, SYMBOLES:SYMBOLES, construire:construire, resoudre:resoudre, resoluble:resoluble};
})();
