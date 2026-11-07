/* ==========================================================
   Brumeval — les petites scènes animées sous les textes de fin d'enquête (Romain, 5 novembre, 9 h 37 ; DESIGN 12.21).
   E.fin.illus = [une scène par texte, dans l'ordre de E.fin.slides] ; moteur-ecrans.js (vueFin) met M.illustration(id) sous le texte.
   Même façon que la scène du rassemblement (regles.js) : un décor en SVG (320 × 200), des personnages en entier
   (Persos.pnj(id, {pied:true}), les héros en entier : le vrai héros de la tablette, un héros ordinaire pour les autres rôles),
   des boucles en CSS (illus-fin.css, préfixe .sf-). Aucun son, rien ne se lit tout seul.
   Enquête 1 : e1-course, e1-remonte, e1-pardon, e1-courant, e1-maire, e1-fete, e1-ragots, e1-planches.
   Chargé après regles.js : il complète M.illustration.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.illustration) return;
var n = 0;
var HAUT = 353;   /* la hauteur du dessin d'un villageois adulte en entier (persos.js) */
var O = '#24182e';

/* ---------- Les personnages ---------- */
function forme(s, w0, h0){ var m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(s || ''), w = m ? +m[1] : w0, h = m ? +m[2] : h0; return {ar:w / h, h:h}; }
function pnj(id, opts){
  try{
    if(window.Persos && Persos.PNJ && Persos.PNJ[id]){
      var s = Persos.pnj(id, Object.assign({anime:false, pied:true, id:'sf' + (++n)}, opts || {})), f = forme(s, 200, HAUT);
      if(s) return {h:s, ar:f.ar, k:f.h / HAUT};
    }
  }catch(e){}
  return {h:'<b>' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</b>', ar:.57, k:1};
}
var SEXE = {pisteur:'f', alchimiste:'f', barde:'m', sage:'m'};
function heros(role){
  try{
    if(window.Persos && Persos.heros){
      var h = M.role() === role && M.heroObj ? M.heroObj() : (Persos.defaut ? Persos.defaut(role, SEXE[role]) : null);
      if(h){ var s = Persos.heros(h, {vue:'pied', anime:false, fond:false, id:'sfh' + (++n)}), f = forme(s, 300, 440); if(s) return {h:s, ar:f.ar, k:1.16}; }
    }
  }catch(e){}
  return {h:'<b>' + ((D.ROLES[role] || {}).ic || '🙂') + '</b>', ar:.57, k:1};
}
/* un personnage posé dans la scène : o = {x : le milieu de ses pieds (%), h : la hauteur d'un adulte (% de l'image),
   cls : ses classes (son mouvement), st : du style en plus, dedans : ce qu'il porte (lanterne, larmes, bulle…)} */
function perso(p, o){
  var H = o.h || 44;
  return '<span class="sf-gens' + (o.cls ? ' ' + o.cls : '') + '" style="--x:' + o.x + '%;--h:' + (H * p.k).toFixed(1) + '%;--ar:' + p.ar.toFixed(3) + (o.st ? ';' + o.st : '') + '"><i>' + p.h + '</i>' + (o.dedans || '') + '</span>';
}
function bulle(t, cls){ return '<em class="sf-bulle' + (cls ? ' ' + cls : '') + '">' + M.esc(t) + '</em>'; }

/* ---------- Les objets ---------- */
var LANTERNE = '<svg viewBox="-12 -20 24 36" aria-hidden="true" focusable="false"><path d="M-3.5 -15 a3.5 3.5 0 1 1 7 0" fill="none" stroke="#7a5a1a" stroke-width="2"/>' +
  '<path d="M-7 -15 L 7 -15 L 5 -10 L -5 -10 Z" fill="#e8b23a" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/>' +
  '<path d="M-6 -10 L 6 -10 L 7.5 8 L -7.5 8 Z" fill="#fff4b8" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/>' +
  '<path d="M-2.2 -10 L -2.6 8 M2.2 -10 L 2.6 8" stroke="#c8902a" stroke-width="1.2"/><circle cx="0" cy="-1" r="3.6" fill="#ffc21f"/>' +
  '<path d="M-8.5 8 L 8.5 8 L 6 13 L -6 13 Z" fill="#e8b23a" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
/* la Lanterne d'Or, avec son halo qui respire ; st : sa place (--lx, --ly sur un personnage ; left, bottom dans la scène) */
function lanterne(cls, st){ return '<b class="sf-lanterne' + (cls ? ' ' + cls : '') + '"' + (st ? ' style="' + st + '"' : '') + '><s></s>' + LANTERNE + '</b>'; }
/* Pirate, le chien de Tim (blanc, les oreilles et une tache noires), la queue qui remue */
var CHIEN = '<svg viewBox="-20 -16 40 44" aria-hidden="true" focusable="false">' +
  '<path class="sf-queue" d="M11 18 q 11 -3 9 -15" stroke="' + O + '" stroke-width="4.4" fill="none" stroke-linecap="round"/><path class="sf-queue" d="M11 18 q 11 -3 9 -15" stroke="#fafafa" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<g stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round"><path d="M-14 24 C -18 6 -10 -4 0 -4 C 10 -4 18 6 14 24 Z" fill="#fafafa"/>' +
  '<path d="M-12 -2 C -20 -4 -22 8 -16 14 L -10 6 Z M12 -2 C 20 -4 22 8 16 14 L 10 6 Z" fill="#2a2430"/><circle cx="0" cy="-2" r="11" fill="#fafafa"/></g>' +
  '<path d="M2 -12 C 10 -12 12 -4 8 2 C 4 -2 2 -6 2 -12 Z" fill="#2a2430"/><circle cx="-4" cy="-3" r="1.8" fill="' + O + '"/><circle cx="5" cy="-3" r="1.8" fill="#fff"/><circle cx="5" cy="-3" r="1.2" fill="' + O + '"/>' +
  '<ellipse cx="0" cy="3" rx="2.6" ry="1.8" fill="' + O + '"/><path d="M-2 7 q 2 3 4 0" fill="#e8737a"/>' +
  '<path d="M-9 24 v-6 M9 24 v-6" stroke="' + O + '" stroke-width="1.4"/></svg>';
function chien(cls, st, dedans){ return '<span class="sf-chien' + (cls ? ' ' + cls : '') + '"' + (st ? ' style="' + st + '"' : '') + '>' + CHIEN + (dedans || '') + '</span>'; }

/* ---------- Les décors (320 × 200) ---------- */
function ciel(t){
  var g = {apresmidi:['#ffb36b', '#ffe8b4'], soir:['#3a2a6e', '#f08a64'], nuit:['#121736', '#3a3f78'], jour:['#8fcdf6', '#e6f5ff']}[t] || ['#8fcdf6', '#e6f5ff'];
  var id = 'sfc' + (++n);
  var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + g[0] + '"/><stop offset="1" stop-color="' + g[1] + '"/></linearGradient></defs><rect width="320" height="200" fill="url(#' + id + ')"/>';
  if(t === 'apresmidi') s += '<circle cx="56" cy="52" r="28" fill="#fff6d8" opacity=".35"/><circle cx="56" cy="52" r="16" fill="#fff3c4"/>';
  if(t === 'jour') s += '<circle cx="272" cy="38" r="15" fill="#fff8d0"/><g fill="#ffffff" opacity=".9"><ellipse cx="70" cy="34" rx="26" ry="9"/><ellipse cx="88" cy="28" rx="16" ry="9"/><ellipse cx="150" cy="22" rx="20" ry="7"/></g>';
  if(t === 'soir' || t === 'nuit') s += '<g fill="#fff4cf"><circle cx="110" cy="22" r="1.6"/><circle cx="150" cy="14" r="1.2"/><circle cx="270" cy="20" r="1.6"/><circle cx="300" cy="52" r="1.1"/><circle cx="20" cy="40" r="1.2"/><circle cx="196" cy="10" r="1"/></g>';
  if(t === 'nuit') s += '<circle cx="58" cy="40" r="15" fill="#fff4cf"/><circle cx="64" cy="36" r="13" fill="#1a2046"/>';
  return s;
}
function collines(nuit){
  var a = nuit ? '#3f5c48' : '#7aa858', b = nuit ? '#33503c' : '#66924a', r = nuit ? '#8a7a62' : '#c9b08a';
  return '<path d="M0 132 Q 60 104 130 124 T 320 116 V200 H0 Z" fill="' + a + '"/><path d="M0 150 Q 90 136 180 148 T 320 144 V200 H0 Z" fill="' + b + '"/>' +
    '<path d="M-10 196 Q 90 180 182 178" stroke="' + r + '" stroke-width="16" fill="none" stroke-linecap="round" opacity=".85"/>';
}
/* le Vieux Chêne ; o.trou : le trou devant ses racines, o.lueur : la lueur dorée au fond, o.corde, o.buisson */
function chene(o){
  o = o || {};
  var id = 'sfr' + (++n);
  var s = '<defs><linearGradient id="' + id + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd23f" stop-opacity=".75"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></linearGradient></defs>';
  s += '<path d="M190 162 C 192 140 194 118 192 96 L 222 96 C 220 118 222 140 226 162 C 234 166 240 168 244 172 L 170 172 C 176 168 182 166 190 162 Z" fill="#7a4e2c" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M200 110 q 4 20 0 44 M214 104 q -4 26 2 52" stroke="#5e3a1e" stroke-width="2.5" fill="none"/>' +
    '<g stroke="' + O + '" stroke-width="3"><circle cx="176" cy="74" r="30" fill="#2f6b3a"/><circle cx="240" cy="72" r="32" fill="#2f6b3a"/><circle cx="208" cy="48" r="36" fill="#3a7d44"/><circle cx="206" cy="86" r="26" fill="#2a5e33"/></g>' +
    '<circle cx="196" cy="40" r="9" fill="#4f9a55"/><circle cx="246" cy="62" r="7" fill="#4f9a55"/>' +
    '<path d="M172 172 q -12 6 -18 14 M244 172 q 12 6 16 14 M186 171 q -4 8 -10 12" stroke="#5e3a1e" stroke-width="4" fill="none" stroke-linecap="round"/>';
  if(o.corde) s += '<path d="M200 60 q 14 -6 13 6" stroke="#b08850" stroke-width="3.4" fill="none"/><path d="M213 66 L 213 186" stroke="#c8a060" stroke-width="2.6"/><path d="M213 66 L 213 186" stroke="#8a6a3a" stroke-width="1" stroke-dasharray="3 4"/>';
  if(o.trou){
    if(o.lueur) s += '<path class="sf-rayon" d="M186 184 L 230 184 L 246 108 L 170 108 Z" fill="url(#' + id + ')"/>';
    s += '<ellipse cx="208" cy="184" rx="29" ry="8" fill="#140c1c" stroke="' + O + '" stroke-width="3"/>';
    if(o.lueur) s += '<ellipse class="sf-lueur" cx="208" cy="184.5" rx="19" ry="4.6" fill="#ffd23f"/>' +
      [[200, 0], [214, .7], [207, 1.4], [220, 2.1]].map(function(e){ return '<circle class="sf-etincelle" cx="' + e[0] + '" cy="180" r="1.8" fill="#fff3a0" style="animation-delay:' + e[1] + 's"/>'; }).join('');
  }
  if(o.buisson) s += '<path d="M262 186 C 254 174 262 160 276 162 C 282 150 304 152 306 166 C 318 168 318 186 304 188 Z" fill="#2f7a4c" stroke="' + O + '" stroke-width="3"/><circle cx="276" cy="172" r="2.6" fill="#e5484d"/><circle cx="294" cy="168" r="2.6" fill="#e5484d"/>';
  return s;
}
/* la place des Lanternes : des maisons au fond, les pavés, la fontaine, la guirlande de lampions (o.allumes : déjà tous allumés) */
var LAMPIONS = [[38, 46], [79, 56], [120, 57], [160, 52], [200, 44], [241, 38], [282, 33]];
var COULEURS_LAMPIONS = ['#e5484d', '#f2a33a', '#ffd23f', '#e5484d', '#f2a33a', '#ffd23f', '#e5484d'];
function place(nuit, o){
  o = o || {};
  var s = ciel(nuit ? 'nuit' : 'soir');
  /* les maisons du fond, fenêtres allumées */
  s += '<g stroke="' + O + '" stroke-width="2.5" stroke-linejoin="round">' +
    '<path d="M-6 128 L -6 74 L 30 50 L 66 74 L 66 128 Z" fill="#b98a6a"/><path d="M-12 76 L 30 46 L 72 76" fill="none" stroke-width="4"/>' +
    '<path d="M70 128 L 70 86 L 104 64 L 138 86 L 138 128 Z" fill="#a8a0c8"/>' +
    '<path d="M186 128 L 186 80 L 222 58 L 258 80 L 258 128 Z" fill="#c8a878"/>' +
    '<path d="M262 128 L 262 70 L 296 48 L 330 70 L 330 128 Z" fill="#9ab08a"/></g>' +
    '<g fill="#ffe28a" stroke="' + O + '" stroke-width="1.6"><rect x="12" y="88" width="12" height="14"/><rect x="36" y="88" width="12" height="14"/><rect x="88" y="96" width="12" height="12"/><rect x="110" y="96" width="12" height="12"/><rect x="204" y="92" width="12" height="13"/><rect x="228" y="92" width="12" height="13"/><rect x="280" y="84" width="12" height="13"/><rect x="302" y="84" width="12" height="13"/></g>';
  /* le sol pavé */
  s += '<rect x="0" y="126" width="320" height="74" fill="' + (nuit ? '#7a7286' : '#d2bc94') + '"/>' +
    '<g stroke="' + (nuit ? '#5e586c' : '#b59c74') + '" stroke-width="1.4" fill="none"><path d="M0 142 H320 M0 160 H320 M0 180 H320"/><path d="M20 126 v16 M60 142 v18 M100 126 v16 M140 160 v20 M180 142 v18 M220 126 v16 M260 160 v20 M300 142 v18 M40 180 v20 M120 180 v20 M200 180 v20 M280 180 v20"/></g>';
  /* la fontaine */
  /* (la fontaine est au fond de la place : les villageois et le maire se tiennent devant) */
  s += '<g transform="translate(160 148) scale(.7) translate(-160 -170)"><g stroke="' + O + '" stroke-width="2.5"><ellipse cx="160" cy="170" rx="50" ry="13" fill="#a8a4b8"/><ellipse cx="160" cy="167" rx="42" ry="9" fill="#5fb0e0"/>' +
    '<rect x="154" y="138" width="12" height="30" fill="#b8b4c8"/><ellipse cx="160" cy="138" rx="18" ry="5" fill="#a8a4b8"/></g>' +
    '<g class="sf-jets" stroke="#bfe8ff" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M160 134 q -16 -14 -24 20"/><path d="M160 134 q 16 -14 24 20"/></g></g>';
  /* la guirlande de lampions */
  s += '<path d="M-4 30 Q 80 70 160 52 T 324 30" stroke="#4a3022" stroke-width="2" fill="none"/>';
  LAMPIONS.forEach(function(p, i){
    var d = Math.abs(i - 3) * .55;   /* (ils s'allument du milieu vers les bords : la Lanterne d'Or est au milieu) */
    s += '<g class="sf-lampion' + (o.allumes ? ' sf-allume' : '') + '" style="animation-delay:' + (o.allumes ? (i * .37).toFixed(2) : (1.4 + d).toFixed(2)) + 's">' +
      '<path d="M' + p[0] + ' ' + (p[1] - 1) + ' v4" stroke="#4a3022" stroke-width="1.4"/>' +
      '<ellipse class="sf-feu-halo" cx="' + p[0] + '" cy="' + (p[1] + 11) + '" rx="15" ry="15" fill="#ffd86a"/>' +
      '<ellipse cx="' + p[0] + '" cy="' + (p[1] + 11) + '" rx="7" ry="8.5" fill="' + COULEURS_LAMPIONS[i] + '" stroke="' + O + '" stroke-width="1.6"/>' +
      '<ellipse class="sf-feu" cx="' + p[0] + '" cy="' + (p[1] + 11) + '" rx="4" ry="5.5" fill="#fff6b0"/>' +
      '<path d="M' + (p[0] - 4) + ' ' + (p[1] + 3) + ' h8 M' + (p[0] - 4) + ' ' + (p[1] + 19) + ' h8" stroke="' + O + '" stroke-width="1.6"/></g>';
  });
  return s;
}
/* sous la terre, en coupe : le pied du chêne, le trou qui descend, un vieux passage tout au fond, et le courant d'air qui remonte */
function coupe(){
  var id = 'sft' + (++n);
  var s = ciel('apresmidi');
  s += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5c36"/><stop offset=".5" stop-color="#5a3a24"/><stop offset="1" stop-color="#2e1d16"/></linearGradient></defs>';
  s += '<rect x="0" y="50" width="320" height="150" fill="url(#' + id + ')"/>' +
    '<g stroke="#3a2618" stroke-width="1.6" fill="none" opacity=".6"><path d="M0 84 Q 80 76 160 86 T 320 80"/><path d="M0 120 Q 90 112 180 122 T 320 116"/></g>' +
    '<g fill="#9a8a80" stroke="' + O + '" stroke-width="1.6"><ellipse cx="30" cy="100" rx="9" ry="6"/><ellipse cx="250" cy="96" rx="11" ry="7"/><ellipse cx="290" cy="150" rx="8" ry="5"/><ellipse cx="226" cy="170" rx="10" ry="6"/></g>';
  /* l'herbe, le pied du chêne et ses racines */
  s += '<path d="M0 46 H320 V54 H0 Z" fill="#6fa04e" stroke="' + O + '" stroke-width="2.5"/>' +
    '<path d="M150 0 L 190 0 C 190 22 194 36 204 46 L 136 46 C 146 36 150 22 150 0 Z" fill="#7a4e2c" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M142 50 q -26 10 -44 30 M200 50 q 30 8 50 26 M146 52 q -10 20 -30 34 M196 54 q 12 22 34 34 M188 54 q 0 30 14 52" stroke="#6a4226" stroke-width="5" fill="none" stroke-linecap="round"/>';
  /* le trou qui descend, puis le vieux passage vers la gauche, avec sa voûte de pierres */
  s += '<path d="M206 46 L 230 46 L 232 188 L 66 188 L 66 148 L 204 148 Z" fill="#170e16" stroke="' + O + '" stroke-width="2.5" stroke-linejoin="round"/>' +   /* (le trou s'ouvre juste à côté du pied du chêne) */
    '<path d="M44 192 L 44 160 Q 44 132 70 132 Q 96 132 96 160 L 96 192" fill="none" stroke="#8a8698" stroke-width="9"/>' +
    '<path d="M44 192 L 44 160 Q 44 132 70 132 Q 96 132 96 160 L 96 192" fill="none" stroke="' + O + '" stroke-width="1.6" stroke-dasharray="7 3"/>' +
    '<path d="M50 192 L 50 162 Q 50 140 70 140 Q 90 140 90 162 L 90 192 Z" fill="#05030a"/>' +
    '<ellipse class="sf-lueur-bleue" cx="70" cy="172" rx="14" ry="16" fill="#5ab8e0"/>';
  /* le courant d'air froid : des volutes qui sortent du passage, filent dans le tunnel et remontent jusqu'au chêne */
  [0, .6, 1.2, 1.8, 2.4, 3.0].forEach(function(d, i){
    var y = 160 + (i % 3) * 8;
    s += '<path class="sf-vent" style="animation-delay:' + d + 's" d="M68 ' + y + ' q 6 -5 12 0 t 12 0 t 12 0" stroke="#dff6ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  });
  s += '<path class="sf-feuille" d="M212 44 q 6 -8 12 0 q -6 8 -12 0 Z" fill="#5aa04a" stroke="' + O + '" stroke-width="1.2"/>';
  return s;
}
function decor(inner){ return '<svg class="rs-decor" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
function scene(cls, label, inner){ return '<div class="rs-scene sf-scene sf-' + cls + '" role="img" aria-label="' + M.esc(label) + '">' + inner + '</div>'; }

/* ---------- Les scènes de la fin de l'enquête 1 ---------- */
var SCENES = {
  /* 1. Toute l'équipe court jusqu'au Vieux Chêne (suivie du village), la lueur dorée brille au fond du trou */
  'e1-course':function(){
    var s = decor(ciel('apresmidi') + collines(false) + chene({trou:true, lueur:true}));
    [['pisteur', 54], ['alchimiste', 44], ['barde', 34], ['sage', 24]].forEach(function(r, i){
      s += perso(heros(r[0]), {x:r[1], h:40, cls:'sf-court', st:'animation-delay:' + (i * .18).toFixed(2) + 's'});
    });
    s += perso(pnj('gaspard'), {x:12, h:40, cls:'sf-court', st:'animation-delay:.8s', dedans:lanterne('', '--lx:84%;--ly:66%')});
    return scene('course', 'Toute l\'équipe court jusqu\'au Vieux Chêne ; au fond du trou, une lueur dorée brille.', s);
  },
  /* 2. Gaspard descend au bout de la corde et remonte Tim, la Lanterne serrée contre lui ; Pirate jaillit du buisson et lui saute dans les bras */
  'e1-remonte':function(){
    var s = decor(ciel('apresmidi') + collines(false) + chene({trou:true, lueur:true, corde:true, buisson:true}));
    s += perso(pnj('melusine'), {x:10, h:42, cls:'sf-hop'});
    s += perso(pnj('victor'), {x:22, h:42, cls:'sf-hop', st:'animation-delay:.15s'});
    /* tout ce qui est dans le trou disparaît sous le bord (le cadre s'arrête au bord du trou) */
    s += '<div class="sf-trou-clip">' +
      perso(pnj('gaspard'), {x:62, h:42, cls:'sf-gaspard-corde'}) +
      perso(pnj('tim', {sans:['pirate']}), {x:70, h:42, cls:'sf-tim-sort', dedans:lanterne('', '--lx:72%;--ly:70%;--w:30%')}) + '</div>';
    s += chien('sf-chien-saute', '', '<em class="sf-coeur">♥</em>');
    return scene('remonte', 'Gaspard remonte Tim du trou, la Lanterne d\'Or contre lui ; son chien Pirate lui saute dans les bras.', s);
  },
  /* 3. Tim pleure de joie : « Pardon ! » ; Pirate saute autour de lui */
  'e1-pardon':function(){
    var s = decor(ciel('apresmidi') + collines(false) + chene({trou:true}));
    s += perso(pnj('gaspard'), {x:80, h:44});
    s += perso(pnj('tim', {sans:['pirate']}), {x:44, h:50, cls:'sf-sanglot', dedans:lanterne('', '--lx:73%;--ly:71%;--w:30%') +
      '<u class="sf-larme" style="left:42%"></u><u class="sf-larme" style="left:58%;animation-delay:.7s"></u>' + bulle('Pardon !', 'sf-b-pardon')});
    s += chien('sf-chien-joie', 'left:64%');
    return scene('pardon', 'Tim pleure de joie et demande pardon ; Pirate saute autour de lui.', s);
  },
  /* 4. Au fond du trou, un courant d'air froid souffle, comme si un passage s'enfonçait sous la terre */
  'e1-courant':function(){
    return scene('courant', 'Sous le Vieux Chêne, en coupe : le trou descend jusqu\'à un vieux passage, et un courant d\'air froid remonte.', decor(coupe()));
  },
  /* 5. Le maire arrive en courant et serre la Lanterne contre lui, très fort */
  'e1-maire':function(){
    var s = decor(ciel('apresmidi') + collines(false) + chene({trou:true}));
    s += chien('', 'left:16%');
    s += perso(pnj('tim', {sans:['pirate']}), {x:30, h:42, dedans:lanterne('sf-lant-tim', '--lx:74%;--ly:71%;--w:30%')});
    s += perso(pnj('grosbec'), {x:52, h:44, cls:'sf-maire-arrive'});
    s += lanterne('sf-lant-vol', '') + '<em class="sf-serre"><i></i><i></i></em>';
    return scene('maire', 'Le maire arrive en courant, prend la Lanterne d\'Or et la serre très fort contre lui.', s);
  },
  /* 6. Le soir, la Lanterne d'Or allume toutes les lanternes ; le maire : « Quelle équipe ! » */
  'e1-fete':function(){
    var s = decor(place(false));
    s += perso(pnj('gaspard'), {x:13, h:40, cls:'sf-hop'});
    s += perso(pnj('melusine'), {x:27, h:40, cls:'sf-hop', st:'animation-delay:.2s'});
    s += perso(pnj('odette'), {x:77, h:40, cls:'sf-hop', st:'animation-delay:.1s'});
    s += perso(pnj('victor'), {x:90, h:40, cls:'sf-hop', st:'animation-delay:.3s'});
    s += perso(pnj('grosbec'), {x:59, h:44, dedans:lanterne('sf-lant-haut', '--lx:86%;--ly:26%;--w:30%') + bulle('Quelle équipe !', 'sf-b-equipe')});
    return scene('fete', 'Le soir, la Lanterne d\'Or allume les lampions de la place ; le maire remercie l\'équipe.', s);
  },
  /* 7. Pendant la fête, tout le monde ne parle que du trou */
  'e1-ragots':function(){
    var s = decor(place(true, {allumes:true}));
    s += perso(pnj('margot'), {x:11, h:40, dedans:bulle('Ce trou… d\'où vient-il ?', 'sf-b1 sf-g')});
    s += perso(pnj('gaspard'), {x:25, h:40, dedans:bulle('Personne ne sait !', 'sf-b2 sf-g')});
    s += perso(pnj('melusine'), {x:74, h:40, dedans:bulle('Et cet air froid… brrr !', 'sf-b3 sf-d')});
    s += perso(pnj('basile'), {x:88, h:40, dedans:bulle('Mystère…', 'sf-b4 sf-d')});
    return scene('ragots', 'La nuit, pendant la fête, les villageois se demandent d\'où vient le trou.', s);
  },
  /* 8. Le maire regarde longtemps le trou ; le lendemain, il le fait couvrir de grosses planches */
  'e1-planches':function(){
    var s = decor(ciel('jour') + collines(false) + chene({trou:true}));
    s += '<div class="sf-nuit"><svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><circle cx="58" cy="40" r="15" fill="#fff4cf"/><circle cx="64" cy="36" r="13" fill="#1a2046"/>' +
      '<g fill="#fff4cf"><circle cx="110" cy="22" r="1.6"/><circle cx="150" cy="14" r="1.2"/><circle cx="270" cy="20" r="1.6"/><circle cx="300" cy="52" r="1.1"/></g></svg></div>';
    [0, 1, 2].forEach(function(i){ s += '<b class="sf-planche" style="--i:' + i + ';animation-delay:' + (i * .5).toFixed(1) + 's"></b>'; });
    s += perso(pnj('grosbec'), {x:42, h:44, dedans:bulle('…', 'sf-b-rien') + bulle('C\'est bien trop dangereux !', 'sf-b-danger')});
    return scene('planches', 'La nuit, le maire regarde longtemps le trou ; le lendemain, il le fait couvrir de grosses planches.', s);
  }
};
var il0 = M.illustration;
M.illustration = function(id){
  if(SCENES[id]){ try{ return SCENES[id](); }catch(e){ console.error(e); return ''; } }
  return il0 ? il0(id) : '';
};
M.scenesFin = SCENES;
})();
