/* ==========================================================
   Brumeval — les petites scènes animées sous les textes de fin d'enquête (Romain, 5 novembre, 9 h 37 ; DESIGN 12.21).
   E.fin.illus = [une scène par texte, dans l'ordre de E.fin.slides] ; moteur-ecrans.js (vueFin) met M.illustration(id) sous le texte.
   Même façon que la scène du rassemblement (regles.js) : un décor en SVG (320 × 200), des personnages en entier
   (Persos.pnj(id, {pied:true}), les héros en entier : le vrai héros de la tablette, un héros ordinaire pour les autres rôles),
   des boucles en CSS (illus-fin.css, préfixe .sf-). Aucun son, rien ne se lit tout seul.
   Enquête 1 : e1-course, e1-remonte, e1-pardon, e1-courant, e1-maire, e1-fete, e1-ragots, e1-planches.
   Enquête 2 : e2-aveu, e2-prison, e2-riviere, e2-chat, e2-equipe (rien sous « À suivre… »).
   Enquête 3 : e3-porte, e3-minuit, e3-leo (trois variantes : P.fin.variante), e3-bague, e3-gardes ; puis le cachot (moteur-ecrans.js).
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
/* ---------- Les décors de la fin de l'enquête 2 (Romain, 11 novembre, 8 h 11) ---------- */
/* le bureau du maire, au petit matin : la porte à gauche, la fenêtre où le soleil se lève, son portrait au mur, le plancher.
   Le grand bureau est posé par-dessus les personnages (bureauHTML) : on ne voit le maire que de la taille à la tête. */
function bureauMaire(){
  var id = 'sfa' + (++n);
  var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb98a"/><stop offset="1" stop-color="#bfe2f6"/></linearGradient></defs>';
  s += '<rect width="320" height="200" fill="#e2c9a0"/>' +
    '<g stroke="#c9ad80" stroke-width="1.2" opacity=".7"><path d="M0 30 H320 M0 64 H320"/></g>' +
    '<rect x="0" y="112" width="320" height="62" fill="#a8784c"/><g stroke="#8a5c36" stroke-width="1.6"><path d="M0 112 H320"/><path d="M40 112 v62 M96 112 v62 M152 112 v62 M208 112 v62 M264 112 v62"/></g>' +
    '<rect x="0" y="172" width="320" height="28" fill="#8a5a36"/><g stroke="#6e4426" stroke-width="1.4"><path d="M0 172 H320 M0 186 H320"/><path d="M60 172 v14 M150 186 v14 M230 172 v14 M300 186 v14"/></g>';
  /* la porte (Bastien et Silas sortent par là) */
  s += '<g stroke="' + O + '" stroke-width="2.5" stroke-linejoin="round"><rect x="8" y="62" width="40" height="110" fill="#7a4e2c"/><rect x="14" y="70" width="28" height="40" fill="#8a5c36"/><rect x="14" y="118" width="28" height="44" fill="#8a5c36"/></g><circle cx="41" cy="118" r="2.6" fill="#ffd23f" stroke="' + O + '" stroke-width="1.2"/>';
  /* la fenêtre : le soleil se lève */
  s += '<rect x="112" y="22" width="70" height="62" fill="url(#' + id + ')" stroke="' + O + '" stroke-width="3"/>' +
    '<circle class="sf-soleil" cx="147" cy="84" r="14" fill="#fff1b8"/><path d="M112 70 Q 140 64 182 72 V84 H112 Z" fill="#7aa858"/>' +
    '<path d="M147 22 V84 M112 52 H182" stroke="#6e4426" stroke-width="3"/><rect x="108" y="82" width="78" height="6" fill="#8a5c36" stroke="' + O + '" stroke-width="2"/>';
  /* le portrait du maire, dans son grand cadre doré */
  s += '<rect x="238" y="18" width="46" height="56" fill="#3a5a8a" stroke="#c8962a" stroke-width="5"/><rect x="238" y="18" width="46" height="56" fill="none" stroke="' + O + '" stroke-width="1.6"/>' +
    '<circle cx="261" cy="40" r="9" fill="#f2c9a0" stroke="' + O + '" stroke-width="1.4"/><path d="M247 74 Q 249 54 261 52 Q 273 54 275 74 Z" fill="#2f2a52" stroke="' + O + '" stroke-width="1.4"/><path d="M256 56 L 261 68 L 266 56" fill="#e5484d"/>';
  return s;
}
/* le grand bureau du maire (par-dessus le maire), ses papiers, la pièce d'or posée dessus (o.piece) */
function bureauHTML(o){
  o = o || {};
  return '<b class="sf-bureau"><i></i></b>' +
    '<b class="sf-papiers">' + [0, 1, 2].map(function(i){ return '<i style="--i:' + i + '"></i>'; }).join('') + '</b>' +
    (o.piece ? '<b class="sf-piece"></b>' : '');
}
/* la rivière, le lendemain : elle redevient claire (sf-eau), le petit lavoir sur la rive */
function riviere(){
  var s = ciel('jour');
  s += '<path d="M0 104 Q 70 86 150 100 T 320 94 V140 H0 Z" fill="#7aa858"/><path d="M0 118 Q 100 108 200 118 T 320 114 V140 H0 Z" fill="#66924a"/>';
  s += '<path class="sf-eau" d="M0 128 Q 80 120 160 130 T 320 126 L 320 160 Q 240 168 160 158 T 0 162 Z" stroke="' + O + '" stroke-width="2.5"/>';
  s += '<g class="sf-rides" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"><path d="M40 140 q 6 -3 12 0"/><path d="M120 146 q 6 -3 12 0"/><path d="M210 140 q 6 -3 12 0"/><path d="M276 148 q 6 -3 12 0"/></g>';
  s += '<path d="M0 158 Q 80 166 160 156 T 320 158 V200 H0 Z" fill="#7aa858" stroke="' + O + '" stroke-width="2.5"/>';
  /* le lavoir : une dalle de pierre au bord de l'eau, un petit toit sur deux poteaux */
  s += '<g stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="150" width="62" height="10" fill="#b8b4c8"/><path d="M10 150 V112 M60 150 V112" stroke-width="3.4"/>' +
    '<path d="M0 116 L 35 96 L 70 116 Z" fill="#b5652e"/></g>';
  s += '<g fill="#ffd23f" stroke="' + O + '" stroke-width="1"><circle cx="300" cy="176" r="2.6"/><circle cx="252" cy="186" r="2.2"/><circle cx="110" cy="182" r="2.4"/></g>';
  return s;
}
/* les gros rochers qui bouchent le trou du Vieux Chêne ; o.lueur : une lueur bleue entre les pierres, et l'air froid qui en sort */
function rochers(o){
  o = o || {};
  var s = '<g transform="translate(208 192) scale(1.5) translate(-208 -190)">';
  if(o.lueur) s += '<ellipse class="sf-lueur-bleue" cx="208" cy="176" rx="14" ry="10" fill="#5ab8e0"/>';
  s += '<g stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round">' +
    '<path d="M176 188 C 170 172 178 158 194 158 C 206 158 212 170 210 188 Z" fill="#8a8698"/>' +
    '<path d="M206 188 C 204 166 216 154 232 158 C 246 162 248 178 242 188 Z" fill="#9a96a8"/>' +
    '<path d="M190 166 C 190 152 204 146 214 150 C 224 154 224 166 216 172 C 206 176 192 176 190 166 Z" fill="#a8a4b8"/>' +
    '<path d="M238 190 C 238 182 246 178 252 182 C 256 186 254 190 252 190 Z" fill="#7a7688"/></g>' +
    '<g stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".45"><path d="M182 166 q 6 -4 12 -2"/><path d="M216 166 q 6 -4 12 -1"/><path d="M198 156 q 6 -3 10 -1"/></g>';
  if(o.lueur) [0, 1.2, 2.4].forEach(function(d, i){ s += '<path class="sf-souffle" style="animation-delay:' + d + 's" d="M' + (200 + i * 8) + ' 168 q -4 -6 0 -12 t 0 -12" stroke="#dff6ff" stroke-width="2" fill="none" stroke-linecap="round"/>'; });
  return s + '</g>';
}
/* la barrière du maire : le chemin du Vieux Chêne est fermé */
function barriere(){
  return '<g transform="translate(-72 0)" stroke="' + O + '" stroke-width="2" stroke-linejoin="round"><path d="M112 190 V160 M152 190 V160" stroke-width="3.4" stroke="#6e4426"/>' +
    '<rect x="104" y="162" width="56" height="9" fill="#ffffff"/><path d="M110 162 l-6 9 M124 162 l-6 9 M138 162 l-6 9 M152 162 l-6 9 M160 166 l-4 5" stroke="#e5484d" stroke-width="5"/>' +
    '<rect x="104" y="162" width="56" height="9" fill="none"/></g>';
}
/* un des chats d'Odette, roux et rayé, assis de profil (il regarde vers la droite) : la queue bouge, une patte gratte la pierre */
var CHAT = '<svg viewBox="-30 -42 62 60" aria-hidden="true" focusable="false"><g stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">' +
  '<g class="sf-chat-queue"><path d="M-14 14 C -30 12 -30 -6 -22 -12" stroke="' + O + '" stroke-width="7" fill="none"/><path d="M-14 14 C -30 12 -30 -6 -22 -12" stroke="#f0a24a" stroke-width="3.6" fill="none"/></g>' +
  '<path d="M-16 16 C -18 -2 -8 -12 4 -10 C 13 -8 15 4 12 16 Z" fill="#f0a24a"/>' +
  '<path d="M-10 -2 q 4 4 2 10 M-4 -8 q 4 6 2 12" stroke="#c8702a" fill="none"/>' +
  '<g class="sf-chat-patte"><path d="M9 2 L 9 14 Q 12 17 15 14 L 15 2 Z" fill="#f0a24a"/></g>' +
  '<path d="M1 -26 L 2 -36 L 9 -28 Z M11 -28 L 17 -36 L 18 -25 Z" fill="#f0a24a"/>' +
  '<circle cx="9" cy="-19" r="10" fill="#f0a24a"/><path d="M1 -24 q 3 2 6 0" stroke="#c8702a" fill="none"/></g>' +
  '<ellipse cx="13" cy="-20" rx="1.6" ry="2.4" fill="' + O + '"/><path d="M18 -16 l2 1 l-2 1 Z" fill="#e8737a"/><path d="M17 -14 l6 -1 M17 -13 l6 1" stroke="' + O + '" stroke-width=".8"/></svg>';
function chat(cls, st, dedans){ return '<span class="sf-chat' + (cls ? ' ' + cls : '') + '"' + (st ? ' style="' + st + '"' : '') + '>' + CHAT + (dedans || '') + '</span>'; }

/* ---------- Enquête 3, la fin : la crypte des Fondateurs, les gardes ---------- */
/* les quatre signes des Fondateurs (comme sur la porte du donjon, jeu/donjon/scenes/scenes.js) : l'œil, le chaudron, la lyre, l'étoile */
function signes4(cx, cy, k, c){
  return '<g class="sf-signes" transform="translate(' + cx + ' ' + cy + ') scale(' + k + ')" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M-26 -16 Q -17 -25 -8 -16 Q -17 -7 -26 -16 Z"/><circle cx="-17" cy="-16" r="2.4" fill="' + c + '" stroke="none"/>' +
    '<path d="M8 -22 Q 8 -8 18 -8 Q 28 -8 28 -22 Z M6 -22 L 30 -22 M12 -6 L 10 -2 M24 -6 L 26 -2"/>' +
    '<path d="M-26 8 Q -26 26 -17 26 Q -8 26 -8 8 M-22 12 L -22 24 M-17 12 L -17 24 M-12 12 L -12 24 M-28 8 L -24 6 M-6 8 L -10 6"/>' +
    '<path d="M18 4 L 21 12 L 29 12 L 23 17 L 25 25 L 18 20 L 11 25 L 13 17 L 7 12 L 15 12 Z"/></g>';
}
/* la crypte : un mur de grosses pierres, des voûtes sombres, des dalles ; o.escalier : l'escalier qui remonte, à droite (o.lueur : des
   lanternes arrivent d'en haut) ; o.porte : la grande porte ronde aux quatre signes, sa petite trappe, la lumière chaude dessous */
function crypte(o){
  o = o || {};
  var id = 'sfy' + (++n);
  var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a2e"/><stop offset="1" stop-color="#34344e"/></linearGradient>' +
    '<radialGradient id="' + id + 'h"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>' +
    '<rect width="320" height="200" fill="url(#' + id + ')"/>';
  /* les pierres du mur */
  s += '<g stroke="#12121e" stroke-width="1.4" fill="none" opacity=".8"><path d="M0 24 H320 M0 52 H320 M0 80 H320 M0 108 H320 M0 136 H320"/>' +
    '<path d="M30 0 v24 M96 0 v24 M168 0 v24 M236 0 v24 M296 0 v24 M62 24 v28 M134 24 v28 M204 24 v28 M270 24 v28 M26 52 v28 M100 52 v28 M172 52 v28 M240 52 v28 M300 52 v28 M64 80 v28 M136 80 v28 M206 80 v28 M272 80 v28 M28 108 v28 M98 108 v28 M170 108 v28 M238 108 v28 M298 108 v28"/></g>';
  if(o.porte){
    /* le cadre de pierre et le battant */
    s += '<path d="M92 160 V 84 A 68 68 0 0 1 228 84 V 160" fill="none" stroke="' + O + '" stroke-width="22"/><path d="M92 160 V 84 A 68 68 0 0 1 228 84 V 160" fill="none" stroke="#5a6080" stroke-width="16"/>' +
      '<path d="M100 160 V 84 A 60 60 0 0 1 220 84 V 160 Z" fill="#2c3048" stroke="' + O + '" stroke-width="3"/><path d="M160 26 V160" stroke="#12121e" stroke-width="2"/>' +
      '<g fill="#3c3c4a" stroke="' + O + '" stroke-width="2"><rect x="101" y="128" width="118" height="9"/></g>' +
      '<g fill="#7a7a8a"><circle cx="112" cy="132.5" r="1.8"/><circle cx="136" cy="132.5" r="1.8"/><circle cx="184" cy="132.5" r="1.8"/><circle cx="208" cy="132.5" r="1.8"/></g>';
    /* le sceau rond et ses quatre signes, qui luisent */
    s += '<circle class="sf-sceau-halo" cx="160" cy="84" r="42" fill="#7ff0ff"/><circle cx="160" cy="84" r="33" fill="#343a58" stroke="' + O + '" stroke-width="3"/><circle cx="160" cy="84" r="28" fill="none" stroke="#5a6080" stroke-width="2"/>' +
      '<path d="M134 84 H186 M160 58 V110" stroke="#5a6080" stroke-width="1.6"/>' + signes4(160, 84, .78, '#9ff6ff');
    /* la petite trappe, et la lumière chaude sous la porte */
    s += '<rect x="150" y="140" width="22" height="20" fill="#6a4a2e" stroke="' + O + '" stroke-width="2.4"/><path d="M161 140 v20" stroke="#2a1a0c" stroke-width="1.4"/>' +
      '<ellipse class="sf-chaud" cx="160" cy="161" rx="70" ry="9" fill="url(#' + id + 'h)"/><rect class="sf-chaud" x="102" y="158" width="116" height="3" fill="#ffc070"/>';
  } else {
    /* trois voûtes sombres */
    [[14, 92], [108, 92], [202, o.escalier ? 0 : 92]].forEach(function(v){
      if(!v[1]) return;
      s += '<path d="M' + v[0] + ' 150 V 86 Q ' + (v[0] + v[1] / 2) + ' 26 ' + (v[0] + v[1]) + ' 86 V 150 Z" fill="#15152a" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M' + (v[0] - 5) + ' 150 V 86 Q ' + (v[0] + v[1] / 2) + ' 18 ' + (v[0] + v[1] + 5) + ' 86 V 150" fill="none" stroke="#5a5a78" stroke-width="3" opacity=".7"/>';
    });
  }
  /* les dalles */
  s += '<rect x="0" y="150" width="320" height="50" fill="#4a4a62"/><path d="M0 150 H320" stroke="' + O + '" stroke-width="3"/>' +
    '<g stroke="#32324a" stroke-width="1.6" fill="none"><path d="M0 166 H320 M0 184 H320"/><path d="M40 150 v16 M110 150 v16 M180 150 v16 M250 150 v16 M74 166 v18 M146 166 v18 M216 166 v18 M288 166 v18 M36 184 v16 M112 184 v16 M184 184 v16 M254 184 v16"/></g>';
  if(o.escalier){
    /* l'escalier de pierre, qui remonte vers le clocher (à droite) */
    if(o.lueur) s += '<ellipse class="sf-lueur-esc" cx="300" cy="54" rx="64" ry="58" fill="url(#' + id + 'h)"/>';
    s += '<path d="M218 150 V 44 Q 268 6 322 30 V 150 Z" fill="#101020" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>';
    var m = '';
    for(var i = 0; i < 7; i++){ var x = 222 + i * 14, y = 150 - (i + 1) * 13; m += '<path d="M' + x + ' ' + (y + 13) + ' V ' + y + ' H 324 V ' + (y + 13) + ' Z" fill="' + (i % 2 ? '#56566e' : '#4c4c64') + '" stroke="' + O + '" stroke-width="2"/>'; }
    s += m;
  }
  return s;
}
/* un garde de la mairie : un casque, une cape sombre, une pique (une silhouette simple : on ne les connaît pas) */
var GARDE = '<svg viewBox="-30 -124 60 126" aria-hidden="true" focusable="false"><g stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">' +
  '<path d="M20 -118 V 0" stroke="#6a5a3a" stroke-width="4"/><path d="M20 -124 L 14 -108 H 26 Z" fill="#c8ccdc"/>' +
  '<path d="M-18 0 C -20 -40 -18 -66 -11 -76 H 11 C 18 -66 20 -40 18 0 Z" fill="#2c2a48"/><path d="M-11 -76 C -4 -70 4 -70 11 -76" fill="#3c3a5e"/>' +
  '<path d="M-17 -38 H 17" stroke="#8a7a4a" stroke-width="3.4"/><circle cx="0" cy="-90" r="12.5" fill="#e2c09a"/>' +
  '<path d="M-15 -92 C -15 -112 15 -112 15 -92 Z" fill="#9a9eb4"/><path d="M-17 -92 H 17" stroke-width="3.4"/><path d="M0 -110 V -116" stroke-width="3"/>' +
  '<path d="M-6 -84 h 3 M4 -84 h 3" stroke-width="2.2"/><path d="M-4 -80 h 8" stroke-width="1.8"/></g></svg>';
function garde(o){ return '<span class="sf-garde' + (o.cls ? ' ' + o.cls : '') + '" style="--x:' + o.x + '%' + (o.st ? ';' + o.st : '') + '">' + GARDE + '</span>'; }

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
  },
  /* ---------- Les scènes de la fin de l'enquête 2 (Romain, 11 novembre, 8 h 11) ---------- */
  /* 1. Au petit matin, chez le maire : Bastien baisse la tête et avoue ; la pièce d'or est sur le bureau */
  'e2-aveu':function(){
    var s = decor(bureauMaire());
    [['pisteur', 8], ['alchimiste', 18], ['barde', 28], ['sage', 38]].forEach(function(r){ s += perso(heros(r[0]), {x:r[1], h:36}); });
    s += perso(pnj('bastien', {humeur:'peur'}), {x:54, h:42, cls:'sf-sanglot', dedans:bulle('C\'est moi…', 'sf-b-moi') + bulle('Un homme en cape noire m\'a payé !', 'sf-b-cape')});
    s += perso(pnj('grosbec'), {x:81, h:44});
    s += bureauHTML({piece:true});
    return scene('aveu', 'Au petit matin, chez le maire : Bastien baisse la tête et avoue qu\'un homme en cape noire l\'a payé.', s);
  },
  /* 2. Le maire tape sur la table : « En prison ! » ; Silas emmène Bastien ; « L'affaire est close ! », et les papiers filent dans le tiroir */
  'e2-prison':function(){
    var s = decor(bureauMaire());
    s += perso(pnj('silas'), {x:36, h:44, cls:'sf-emmene'});
    s += perso(pnj('bastien', {humeur:'peur'}), {x:50, h:42, cls:'sf-emmene', st:'animation-delay:.15s'});
    s += perso(pnj('grosbec'), {x:81, h:44, cls:'sf-tape', dedans:bulle('En prison !', 'sf-b-prison sf-d') + bulle('L\'affaire est close !', 'sf-b-close sf-d')});
    s += bureauHTML() + '<em class="sf-bam"><i></i><i></i><i></i></em>';
    return scene('prison', 'Le maire tape sur la table et envoie Bastien en prison ; puis il range très vite ses papiers : l\'affaire est close.', s);
  },
  /* 3. Le lendemain, la rivière redevient claire ; les poissons sautent, Mélusine chante… mais tout le monde parle d'Odette */
  'e2-riviere':function(){
    var s = decor(riviere());
    s += perso(pnj('melusine'), {x:20, h:42, dedans:'<em class="sf-note">♪</em><em class="sf-note" style="animation-delay:.8s;left:70%">♫</em><em class="sf-note" style="animation-delay:1.6s;left:40%">♪</em>'});
    [44, 56, 64].forEach(function(x, i){ s += '<span class="sf-poisson" style="left:' + x + '%;animation-delay:' + (i * 1.7).toFixed(1) + 's"><svg viewBox="-14 -8 28 16" aria-hidden="true" focusable="false"><path d="M-10 0 C -6 -7 6 -7 9 0 C 6 7 -6 7 -10 0 Z M9 0 L 14 -6 L 14 6 Z" fill="#f2a33a" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="-5" cy="-1.5" r="1.4" fill="' + O + '"/></svg></span>'; });
    s += perso(pnj('gaspard'), {x:76, h:42, dedans:bulle('Et Odette ?', 'sf-b-odette sf-d')});
    s += perso(pnj('margot'), {x:90, h:42, dedans:bulle('Personne ne l\'a revue…', 'sf-b-revue sf-d')});
    return scene('riviere', 'Le lendemain, la rivière redevient claire et les poissons sautent ; mais au village, on se demande où est Odette.', s);
  },
  /* 4. Au Vieux Chêne, derrière la barrière du maire : un chat d'Odette, assis devant les rochers, miaule et gratte la pierre */
  'e2-chat':function(){
    var s = decor(ciel('soir') + collines(false) + chene({}) + rochers() + barriere());
    s += chat('', 'left:50%', bulle('Miaou…', 'sf-b-miaou'));
    return scene('chat-odette', 'Au Vieux Chêne, un des chats d\'Odette est assis devant les gros rochers ; il miaule et gratte la pierre.', s);
  },
  /* 5. Les quatre enquêteurs se regardent ; entre les rochers, une lueur bleue et un souffle froid : « Allons voir ! » */
  'e2-equipe':function(){
    var s = decor(ciel('nuit') + collines(true) + chene({}) + rochers({lueur:true}));
    [['pisteur', 10], ['alchimiste', 22], ['barde', 34], ['sage', 46]].forEach(function(r, i){
      s += perso(heros(r[0]), {x:r[1], h:38, cls:'sf-hoche', st:'animation-delay:' + (i * .45).toFixed(2) + 's', dedans:r[0] === 'pisteur' ? bulle('Allons voir !', 'sf-b-allons sf-g') : ''});
    });
    s += chat('sf-chat-petit', 'left:78%');
    return scene('equipe', 'Les quatre enquêteurs se regardent, devant les rochers du Vieux Chêne ; entre les pierres, une lueur bleue et un souffle froid.', s);
  },
  /* ---------- Les scènes de la fin de l'enquête 3 (étape 7 ; E3-dialogues-et-trame.md §4.8) : minuit dans la crypte ---------- */
  /* 1. La porte aux quatre signes : Moustache gratte, une lumière chaude filtre dessous, une voix répond */
  'e3-porte':function(){
    var s = decor(crypte({porte:true}));
    s += chat('sf-chat-gris', 'left:38%', bulle('Miaou…', 'sf-b-miaou'));   /* (Moustache, le gros gris d'Odette) */
    s += '<em class="sf-bulle sf-b-voix" style="left:60%;bottom:44%">Moustache ? C\'est toi ?</em>';
    return scene('e3-porte', 'La grande porte ronde aux quatre signes : Moustache gratte au bas de la porte, et une voix lui répond de l\'autre côté.', s);
  },
  /* 2. Des lanternes descendent l'escalier — le maire, Silas, deux gardes. (12 novembre au soir ; Romain, 19 h 32 : « enlève cette histoire
     de minuit, définitivement » : plus de « DONG… » ni de « Minuit sonne » ; la scène garde son nom de code, e3-minuit) */
  'e3-minuit':function(){
    var s = decor(crypte({escalier:true, lueur:true}));
    [['pisteur', 9], ['alchimiste', 20], ['barde', 31], ['sage', 42]].forEach(function(r, i){ s += perso(heros(r[0]), {x:r[1], h:36, cls:'sf-sursaut', st:'animation-delay:' + (i * .12).toFixed(2) + 's'}); });
    s += garde({x:94, cls:'sf-descend', st:'animation-delay:.5s'}) + garde({x:85, cls:'sf-descend', st:'animation-delay:.35s'});
    s += perso(pnj('silas'), {x:75, h:42, cls:'sf-descend', st:'animation-delay:.2s'});
    s += perso(pnj('grosbec'), {x:63, h:44, cls:'sf-descend', dedans:lanterne('', '--lx:8%;--ly:52%;--w:26%')});
    return scene('e3-minuit', 'Dans la crypte, le maire descend l\'escalier, une lanterne à la main, avec Silas et deux gardes.', s);
  },
  /* 3. Le maire et Léo : selon ce que Léo a dit au Barde (P.fin.variante : 2, il a tout dit ; 1, à moitié ; 0, il n'est pas là) */
  'e3-leo':function(){
    var P = M.P(), v = (P && P.fin && P.fin.variante) || 0, s = decor(crypte({escalier:true}));
    if(v === 2){
      s += perso(pnj('leo', {humeur:'peur'}), {x:30, h:40, cls:'sf-sanglot'});
      s += perso(pnj('grosbec'), {x:62, h:44, dedans:lanterne('', '--lx:8%;--ly:52%;--w:26%') + bulle('Toi…', 'sf-b-tot') + bulle('Tu as beaucoup trop parlé.', 'sf-b-tard')});
    } else if(v === 1){
      s += perso(pnj('leo', {humeur:'peur'}), {x:30, h:40, cls:'sf-file'});
      s += perso(pnj('grosbec'), {x:62, h:44, dedans:lanterne('', '--lx:8%;--ly:52%;--w:26%') + bulle('Léo. Rentre au moulin.', 'sf-b-tot') + bulle('Tout de suite.', 'sf-b-tard')});
    } else {
      [['pisteur', 9], ['alchimiste', 20], ['barde', 31], ['sage', 42]].forEach(function(r){ s += perso(heros(r[0]), {x:r[1], h:36}); });
      s += perso(pnj('grosbec'), {x:66, h:44, dedans:lanterne('sf-leve', '--lx:8%;--ly:46%;--w:26%') + bulle('Tiens, tiens…', 'sf-b-tot sf-d') + bulle('Nos petits enquêteurs !', 'sf-b-tard sf-d')});
    }
    s += perso(pnj('silas'), {x:78, h:42}) + garde({x:91});
    return scene('e3-leo', v === 2 ? 'Le maire regarde Léo, longtemps.' : v === 1 ? 'Le maire renvoie Léo au moulin ; Léo file sans un mot.' : 'Le maire lève sa lanterne vers les quatre enquêteurs.', s);
  },
  /* 4. Il retire ses gants gris : à son doigt, une bague en argent à tête de corbeau */
  'e3-bague':function(){
    var g = 'sfb' + (++n);
    var d = '<defs><radialGradient id="' + g + '"><stop offset="0" stop-color="#fff6c0" stop-opacity=".9"/><stop offset=".5" stop-color="#ffd76a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="320" height="200" fill="#1c1a30"/><circle cx="160" cy="96" r="120" fill="url(#' + g + ')" opacity=".55"/>';
    /* la manche et la main du maire, de près */
    d += '<g transform="translate(-58 -44) scale(1.3)"><g stroke="' + O + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M-10 150 L 96 116 L 112 168 L -10 214 Z" fill="#3a2f5e"/><path d="M92 112 L 116 106 L 132 168 L 108 176 Z" fill="#f4ead2"/>' +
      '<path d="M116 108 C 150 92 184 90 206 100 C 232 96 262 100 272 110 C 278 118 270 126 258 124 L 226 122 C 250 128 268 134 266 144 C 264 152 250 152 238 148 L 210 142 C 226 150 236 158 232 166 C 228 172 216 170 206 164 L 182 152 C 170 164 150 172 132 166 Z" fill="#e8c4a0"/>' +
      '<path d="M150 104 C 156 88 172 78 186 84 C 192 88 190 96 182 98 L 168 106" fill="#e8c4a0"/>' +
      '<path d="M226 122 L 204 120 M210 142 L 190 136" fill="none" stroke-width="1.8"/></g>';
    /* la bague : un anneau d'argent autour du doigt, et dessus une tête de corbeau (le bec vers la droite, un œil rouge) */
    d += '<g class="sf-bague"><path d="M229 101 C 224 106 224 120 230 125" fill="none" stroke="' + O + '" stroke-width="7.5" stroke-linecap="round"/><path d="M229 101 C 224 106 224 120 230 125" fill="none" stroke="#dfe3ee" stroke-width="4.2" stroke-linecap="round"/>' +
      '<g transform="translate(232 93)" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round"><path d="M-13 6 C -17 -6 -8 -17 5 -15 C 11 -14 15 -11 17 -8 L 33 -3 L 17 2 C 14 8 6 12 -3 11 C -8 10 -11 9 -13 6 Z" fill="#b9bfd2"/>' +
      '<path d="M17 -8 L 33 -3 L 17 2 Z" fill="#6a6f86"/><path d="M-12 -4 C -8 -12 -2 -15 5 -15 C 0 -11 -4 -7 -6 -1 Z" fill="#8d93aa" stroke="none"/>' +
      '<circle cx="7" cy="-6" r="2.8" fill="#e5484d" stroke-width="1.1"/><circle cx="7.8" cy="-6.8" r=".9" fill="#fff" stroke="none"/><path d="M-9 5 q 4 -3 9 -1" fill="none" stroke-width="1.1" stroke="#6a6f86"/></g></g></g>';
    d += '<g class="sf-eclat" fill="#fffbe0"><path d="M268 58 l 3 7.5 7.5 3 -7.5 3 -3 7.5 -3 -7.5 -7.5 -3 7.5 -3 Z"/></g><g class="sf-eclat" fill="#fffbe0" style="animation-delay:.9s"><path d="M222 70 l 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/></g>';
    /* le gant gris, qui tombe */
    d += '<g class="sf-gant" stroke="' + O + '" stroke-width="2.4" stroke-linejoin="round"><path d="M0 0 C -6 -14 -4 -30 2 -34 C 6 -36 9 -32 9 -26 L 10 -40 C 11 -46 18 -46 18 -40 L 18 -28 L 21 -42 C 23 -47 29 -45 28 -39 L 26 -26 L 30 -36 C 33 -40 38 -37 36 -32 L 30 -14 C 30 -6 26 0 20 2 Z" fill="#9a98a6"/><path d="M2 2 L 20 4 L 20 12 L 1 10 Z" fill="#7c7a88"/></g>';
    var s = decor(d);
    s += '<em class="sf-bulle sf-b-long" style="left:30%;bottom:78%">Beaucoup trop loin.</em>';
    return scene('e3-bague', 'Le maire a retiré ses gants gris : à son doigt brille une bague en argent à tête de corbeau.', s);
  },
  /* 5. Silas, bouche bée ; « Gardes ! Enfermez-les ! » : les deux gardes avancent vers les quatre enquêteurs */
  'e3-gardes':function(){
    var s = decor(crypte({escalier:true}));
    [['pisteur', 9], ['alchimiste', 19], ['barde', 29], ['sage', 39]].forEach(function(r, i){ s += perso(heros(r[0]), {x:r[1], h:36, cls:'sf-recule', st:'animation-delay:' + (i * .1).toFixed(2) + 's'}); });
    s += garde({x:94, cls:'sf-avance', st:'--vers:48%'}) + garde({x:85, cls:'sf-avance', st:'--vers:56%;animation-delay:.25s'});
    s += perso(pnj('silas', {humeur:'peur'}), {x:75, h:42, dedans:bulle('Monsieur le maire… ?', 'sf-b-tot sf-d')});
    s += perso(pnj('grosbec'), {x:63, h:44, cls:'sf-tape', dedans:bulle('Gardes ! Enfermez-les !', 'sf-b-tard')});
    return scene('e3-gardes', 'Silas reste bouche bée. Le maire appelle ses gardes : ils avancent vers les quatre enquêteurs.', s);
  },
  /* ---------- Enquête 3 : le marché aux fleurs (marche.js) ----------
     L'étape 2 du marchandage de Fortuné (Bible § 13.6 bis, point 7) : Fortuné penché sur sa carriole, la bâche soulevée, des bouquets
     en papier, et une vieille lanterne de cuivre cabossée qui dépasse et brille. Aucun texte ne la décrit : c'est au Barde de la voir. */
  'e3-carriole':function(){
    var g = 'sfk' + (++n);
    var d = ciel('jour');
    /* les maisons de la place, au fond, et les pavés */
    d += '<g stroke="' + O + '" stroke-width="2.2" stroke-linejoin="round" opacity=".9">' +
      '<path d="M-6 132 L -6 84 L 26 62 L 58 84 L 58 132 Z" fill="#d9b48c"/><path d="M58 132 L 58 92 L 88 72 L 118 92 L 118 132 Z" fill="#c4bcd8"/>' +
      '<path d="M214 132 L 214 86 L 246 64 L 278 86 L 278 132 Z" fill="#e0c79a"/><path d="M278 132 L 278 96 L 302 80 L 326 96 L 326 132 Z" fill="#cfa98a"/></g>' +
      '<g fill="#7a5a3a" opacity=".55"><rect x="14" y="98" width="12" height="14" rx="2"/><rect x="80" y="102" width="12" height="14" rx="2"/><rect x="238" y="98" width="12" height="14" rx="2"/></g>';
    d += '<rect x="0" y="130" width="320" height="70" fill="#cdb894"/><g fill="none" stroke="#a8946e" stroke-width="1.6" opacity=".8">' +
      '<path d="M0 146 H320 M0 164 H320 M0 182 H320"/><path d="M20 130 v16 M70 130 v16 M120 130 v16 M170 130 v16 M220 130 v16 M270 130 v16 M45 146 v18 M95 146 v18 M145 146 v18 M195 146 v18 M245 146 v18 M295 146 v18 M20 164 v18 M70 164 v18 M120 164 v18 M170 164 v18 M220 164 v18 M270 164 v18"/></g>';
    /* la carriole : deux roues, la caisse, les brancards */
    function roue(x){ return '<g transform="translate(' + x + ' 160)"><circle r="25" fill="#8a5a36" stroke="' + O + '" stroke-width="3"/><circle r="18" fill="#cdb894" stroke="' + O + '" stroke-width="2"/>' +
      '<g stroke="#8a5a36" stroke-width="4" stroke-linecap="round"><path d="M0 -18 V18 M-18 0 H18 M-13 -13 L13 13 M-13 13 L13 -13"/></g><circle r="5" fill="#5a3a22" stroke="' + O + '" stroke-width="2"/></g>'; }
    d += '<ellipse cx="208" cy="188" rx="104" ry="7" fill="#000" opacity=".16"/>';
    d += '<path d="M120 138 L 84 150" stroke="' + O + '" stroke-width="7" stroke-linecap="round"/><path d="M120 138 L 84 150" stroke="#8a5a36" stroke-width="4" stroke-linecap="round"/>';
    /* l'intérieur, sous la bâche soulevée (à gauche) */
    d += '<path d="M118 122 L 118 82 Q 150 66 184 80 L 184 122 Z" fill="#4a3324"/>';
    /* trois bouquets en papier */
    function bouquet(x, y, c1, c2){ return '<g transform="translate(' + x + ' ' + y + ')" stroke="' + O + '" stroke-width="1.5" stroke-linejoin="round"><path d="M-5 16 L 5 16 L 9 2 L -9 2 Z" fill="#f4ead2"/>' +
      '<circle cx="-6" cy="-2" r="6" fill="' + c1 + '"/><circle cx="6" cy="-3" r="6" fill="' + c2 + '"/><circle cx="0" cy="-9" r="6" fill="' + c1 + '"/>' +
      '<g fill="none" stroke-width="1"><path d="M-8 -2 q 2 -3 4 0 M4 -3 q 2 -3 4 0 M-2 -9 q 2 -3 4 0"/></g></g>'; }
    d += bouquet(131, 104, '#ff8fb0', '#ffd24a') + bouquet(149, 108, '#8fd0ff', '#ff8fb0');
    /* la vieille lanterne de cuivre, cabossée, qui dépasse et brille */
    d += '<defs><radialGradient id="' + g + '"><stop offset="0" stop-color="#fff6c0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd76a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient></defs>';
    d += '<circle class="ma-lueur" cx="171" cy="97" r="26" fill="url(#' + g + ')"/>';
    d += '<g transform="translate(171 98) rotate(-12)" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round">' +
      '<path d="M-4 -19 a4 4 0 1 1 8 0" fill="none" stroke="#7a4a22" stroke-width="2.2"/>' +
      '<path d="M-8 -19 L 8 -19 L 6.5 -13 L -6 -12 Z" fill="#c8763a"/>' +
      '<path d="M-7 -12 L 6.5 -13 L 9 7 L 2 9 L -8.5 7.5 L -6 -2 Z" fill="#ffe9a0"/>' +
      '<path d="M-2.5 -12.6 L -3 8 M2.5 -12.8 L 3.4 8.6" stroke="#b8632a" stroke-width="1.4"/>' +
      '<path d="M-10 7.5 L 10 7 L 8 13 L -1 12 L -7.5 13.5 Z" fill="#c8763a"/>' +
      '<path d="M3 -17 l 3 1 M-5 10.5 l 3 .8" stroke="#8a4a1c" stroke-width="1.2" fill="none"/><circle cx="0" cy="-3" r="3.4" fill="#fff6c0" stroke="none"/></g>';
    d += '<g class="ma-eclat" fill="#fffbe0" stroke="none"><path d="M186 82 l 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/></g>';
    /* la caisse, par-dessus */
    d += '<path d="M112 120 L 304 120 L 296 150 L 120 150 Z" fill="#a8784c" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/><g stroke="#8a5c36" stroke-width="1.6"><path d="M116 130 H300 M118 140 H298"/></g>';
    /* la bâche : fermée à droite, soulevée à gauche (le pan relevé) */
    d += '<path d="M184 122 C 186 76 292 70 302 122 Z" fill="#efe4c8" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g fill="none" stroke="#cdbf9c" stroke-width="1.6"><path d="M210 120 C 212 92 228 80 240 78 M250 120 C 252 96 262 84 272 82"/></g>' +
      '<path d="M184 82 Q 150 64 116 80 L 104 58 Q 150 38 196 62 Z" fill="#e2d5b4" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M112 74 Q 150 54 190 72" fill="none" stroke="#c9ba94" stroke-width="1.6"/>';
    d += roue(150) + roue(268);
    var s = decor(d);
    /* Fortuné, penché vers sa carriole */
    s += perso(pnj('fortune'), {x:21, h:60, cls:'sf-penche', st:'--b:5%'});
    return scene('carriole', 'Fortuné soulève la bâche de sa carriole.', s);
  }
};
var il0 = M.illustration;
M.illustration = function(id){
  if(SCENES[id]){ try{ return SCENES[id](); }catch(e){ console.error(e); return ''; } }
  return il0 ? il0(id) : '';
};
M.scenesFin = SCENES;
})();
