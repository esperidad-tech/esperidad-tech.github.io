/* HerosAnime — les trois héros du donjon de Brumeval, en pièces articulées et animées.
   Module autonome : aucun fichier, aucune bibliothèque. Il injecte son propre CSS.
   (Fichier assemblé par build.sh à partir de src/ : c'est src/ qu'on modifie.)

     var h = HerosAnime.creer(conteneur, 'pisteur' | 'alchimiste' | 'sage', lk)   // lk facultatif
     HerosAnime.DEFAUT, HerosAnime.AUTRES          // les apparences
     HerosAnime.grain = false                       // (avant creer) sans le grain de papier, plus léger

   Communes (Promise résolue à la fin) : h.entrer(distancePx), h.touche(), h.tomber(), h.relever(), h.joie(), h.choisi(on)
     h.attendre() : boucle d'attente (reprend seule après chaque action) ; h.arreter() ; h.detruire()
   Pisteur    : h.tirer(scene, to, 'normale'|'feu'|'huile'|'colle', {onImpact}) -> Promise à l'impact
                h.dague(scene, to, {onImpact}) -> Promise à l'impact (le geste finit ensuite)
   Alchimiste : h.preparer(couleur) ; h.lancer(scene, to, couleur, {onImpact}) -> à l'impact
                h.louche(scene) ; h.herbes(scene, to, {onImpact}) -> à l'arrivée des feuilles
   Sage       : h.sort(scene, to, {onImpact}) -> à l'impact ; h.etudier()
                var b = h.bouclier(scene, cibleConteneur)   // Promise -> objet bouclier, quand le dôme est posé
                b.absorber(2) ; b.retirer()                 // marchent aussi directement sur la Promise

   Les objets du donjon et les nouvelles réactions (CONCEPTION-DONJON.md §6 et §10 ; sources a2-objets.js, l-reactions.js, m-armes.js) :
     h.equiper(objet, on = true, {discret}) -> Promise   montre / cache l'objet sur le héros (variante dessinée d'avance, cuite)
         'carquois-argent' | 'carquois-lourd' (Pisteur, un seul à la fois), 'cristal-lune' | 'baton-chene' (Sage),
         'sacoche' (Alchimiste), 'amulette' (tous) ; h.equipe(objet) -> true / false
     Pisteur    : h.tirer(scene, to, type, {onImpact, rebond, sol})   type : 'normale', 'feu', 'huile', 'colle', 'argent', 'lourde',
                  'givre', 'acide', ou 'rebond' (= normale qui rebondit). to.metal = true : la lourde fait une gerbe d'étincelles
                  (sinon un impact sourd). {rebond:true} (n'importe quel type) : la flèche ricoche et retombe au sol (sol : y du sol,
                  par défaut to.y + 92). La lourde se bande plus lentement et l'arc recule.
     Alchimiste : h.lancer(scene, to, 'givre' | 'acide' | 'huile' | 'colle', {onImpact}) (ou une couleur, comme avant) ;
                  h.preparer('givre') accepte aussi les noms de potions.
     Sage       : h.eclairSalle(scene, {cibles:[{x,y}], onImpact}) -> à l'éclair ; h.sort(...) devient cet éclair si le cristal
                  de lune est équipé (ou avec {cristal:true} ; {cristal:false} pour la rune simple).
                  h.bouclier(scene, [cible1, cible2]) -> Promise -> [dôme1, dôme2] (chacun absorber / retirer) ;
                  b.absorber(n[, i]) et b.retirer([i]) marchent aussi sur la Promise et sur la paire (tous, ou le i-ème).
     Tous       : h.touche('froid' | 'grouillement' | 'poing') ; h.relever({amulette:true}) (relève dorée, l'amulette se brise) ;
                  h.entoile(true / false) (ligoté dans la toile, se débat ; false : il la déchire) ;
                  h.avale() (happé vers la droite, il disparaît) ; h.recrache(scene, depuis {x, y} de la scène, {onAtterrit})
                  ou h.recrache(depuisEcran) (il revient en volant, couvert de bave, et se secoue).
   Les actions passent dans une file : une à la fois, dans l'ordre d'appel.
   scene : l'élément de la scène (position relative, 960 × 540) ; to : {x, y} en pixels de la scène.

   Les dessins viennent de combat2.js (maquette 3), redécoupés en pièces : torse, tête, bras et jambes en
   2 segments, cape et pans (tissus « souples » simulés), armes. */
(function(){
'use strict';
var O = '#24182e';
var uid = 0;
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
function E(x, y, rx, ry, f, x2){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (x2 || '') + '/>'; }
/* un chemin écrit autour d'un centre (cx, cy) : chaque paire « x y » est décalée */
function T(d, cx, cy){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return (cx + +a) + ' ' + (cy + +b); }); }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
var LUNE = '#bfe8ff';
var CYAN = '#8ff3ff';
function r1(v){ return Math.round(v * 10) / 10; }

/* ---------- un dessin : ses dégradés ---------- */
function Dessin(){ this.defs = []; }
Dessin.prototype.g = function(c, fort){
  fort = fort || 1;
  var id = 'hag' + (++uid);
  this.defs.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.gh = function(c){   /* dégradé de côté, pour un membre (lumière à droite) */
  var id = 'hah' + (++uid);
  this.defs.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="' + clair(c, .22) + '"/><stop offset=".5" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .38) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.halo = function(c0, c1){
  var id = 'hal' + (++uid);
  this.defs.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.flou = function(n){
  var id = 'haf' + (++uid);
  this.defs.push('<filter id="' + id + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="' + n + '"/></filter>');
  return 'url(#' + id + ')';
};
Dessin.prototype.svg = function(corps, grain){
  var gr = 'hagr' + (++uid);
  return '<svg viewBox="0 0 250 300" preserveAspectRatio="xMidYMax meet"><defs>' + this.defs.join('') +
    '<filter id="' + gr + '" x="-60%" y="-30%" width="220%" height="160%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="g"/>' +
    '<feComposite in="g" in2="SourceAlpha" operator="in" result="m"/>' +
    '<feBlend in="m" in2="SourceGraphic" mode="soft-light"/></filter></defs>' +
    '<g class="ha-grain"' + (grain ? ' filter="url(#' + gr + ')"' : '') + '>' + corps + '</g></svg>';
};

/* ---------- le squelette commun (pose de repos : bras et jambes pendants, regard à droite) ---------- */
var SQ = {
  racine:[125, 292], bassin:[126, 170], torse:[126, 156], tete:[124, 96],
  brasA:[146, 106], avantBrasA:[146, 140], mainA:[146, 178],
  brasB:[108, 108], avantBrasB:[108, 142], mainB:[108, 180],
  cuisseA:[116, 172], tibiaA:[116, 222], piedA:[116, 272],
  cuisseB:[136, 172], tibiaB:[136, 222], piedB:[136, 272],
  yeux:[130, 61], bouche:[139, 79]
};
var OS = {
  A:{epaule:SQ.brasA, l1:34, l2:38}, B:{epaule:SQ.brasB, l1:34, l2:38},
  JA:{hanche:SQ.cuisseA, l1:50, l2:50}, JB:{hanche:SQ.cuisseB, l1:50, l2:50}
};
/* une pièce articulée : <g data-j> (la pose) qui contient <g data-i> (l'attente), même pivot */
function J(nom, contenu, x){
  var p = SQ[nom] || x, o = 'transform-origin:' + p[0] + 'px ' + p[1] + 'px';
  return '<g class="haJ" data-j="' + nom + '" style="' + o + '"><g class="haJ" data-i="' + nom + '" style="' + o + '">' + contenu + '</g></g>';
}
/* un segment de membre, vertical au repos, arrondi aux deux bouts (les jointures restent pleines) */
function seg(x, y1, y2, w1, w2, f, x2){
  var a = w1 / 2, b = w2 / 2;
  return P('M' + (x - a) + ' ' + y1 + ' A ' + a + ' ' + a + ' 0 0 1 ' + (x + a) + ' ' + y1 + ' L ' + (x + b) + ' ' + y2 + ' A ' + b + ' ' + b + ' 0 0 1 ' + (x - b) + ' ' + y2 + ' Z', f, x2);
}
function bande(x, y, w, h, f){ return P('M' + (x - w / 2) + ' ' + y + ' L ' + (x + w / 2) + ' ' + y + ' L ' + (x + w / 2 - 0.5) + ' ' + (y + h) + ' L ' + (x - w / 2 + 0.5) + ' ' + (y + h) + ' Z', f); }
function main(d, x, y, r, c){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + d.g(c) + '" stroke="' + O + '" stroke-width="3"/>' + C(x + r * 0.3, y - r * 0.35, r * 0.28, '#fff', ' opacity=".35"'); }
/* un poing qui serre un manche (pouce par-dessus) */
function poing(d, x, y, r, c){
  return main(d, x, y, r, c) + L('M' + (x - r * 0.7) + ' ' + (y - r * 0.15) + ' Q ' + x + ' ' + (y - r * 0.55) + ' ' + (x + r * 0.75) + ' ' + (y - r * 0.2), sombre(c, .45), 1.6);
}
function couture(dd, c){ return L(dd, c, 1.3, ' stroke-dasharray="3 3" opacity=".75"'); }
function rivets(pts, c){ return pts.map(function(p){ return C(p[0], p[1], 1.8, c || '#e8d08a', ' stroke="' + O + '" stroke-width="1"'); }).join(''); }
/* une botte, au bout du tibia (cheville en x, 272) : le pied pointe à droite */
function botte(d, x, c, revers){
  return P('M' + (x - 10) + ' 262 L ' + (x + 9) + ' 262 L ' + (x + 11) + ' 279 L ' + (x + 25) + ' 284 Q ' + (x + 31) + ' 292 ' + (x + 21) + ' 293 L ' + (x - 12) + ' 293 Q ' + (x - 13) + ' 284 ' + (x - 10) + ' 278 Z', d.g(c)) +
    (revers === false ? '' : P('M' + (x - 12) + ' 256 L ' + (x + 11) + ' 256 L ' + (x + 11) + ' 266 L ' + (x - 12) + ' 266 Z', d.g(clair(c, .18)))) +
    L('M' + (x - 12) + ' 293 L ' + (x + 22) + ' 293', '#2a1a10', 4) + L('M' + (x + 1) + ' 272 l 8 -2 M' + (x + 1) + ' 278 l 8 -2', clair(c, .42), 1.4);
}

/* ---------- le visage, de trois quarts, en pièces (yeux, sourcils, bouche à changer) ---------- */
function oeil(x, y, rx, ry, ir){
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff"/>' +
    '<ellipse class="ha-iris" cx="' + (x + rx * 0.18) + '" cy="' + (y + 0.8) + '" rx="' + (rx * 0.74) + '" ry="' + (ry * 0.82) + '" fill="' + ir[1] + '"/>' +
    '<ellipse cx="' + (x + rx * 0.18) + '" cy="' + (y + 2.6) + '" rx="' + (rx * 0.5) + '" ry="' + (ry * 0.36) + '" fill="' + ir[2] + '" opacity=".75"/>' +
    '<ellipse cx="' + (x + rx * 0.22) + '" cy="' + (y + 0.2) + '" rx="' + (rx * 0.36) + '" ry="' + (ry * 0.48) + '" fill="' + ir[0] + '"/>' +
    C(x - rx * 0.12, y - ry * 0.32, rx * 0.3, '#fff') + C(x + rx * 0.4, y + ry * 0.35, rx * 0.12, '#fff', ' opacity=".8"') +
    L('M' + (x - rx - 1.5) + ' ' + (y - ry * 0.55) + ' Q ' + x + ' ' + (y - ry - 2.2) + ' ' + (x + rx + 1.5) + ' ' + (y - ry * 0.45), O, 2.8);
}
function spirale(x, y, n, pas){
  pas = pas || 1;
  var s = 'M' + x + ' ' + y, r = 0.6 * pas, px = x;
  for(var k = 0; k < n; k++){ var sg = k % 2 ? -1 : 1; s += ' A ' + r1(r) + ' ' + r1(r) + ' 0 0 1 ' + r1(px + sg * 2 * r) + ' ' + y; px += sg * 2 * r; r += 0.55 * pas; }
  return s;
}
function visage(d, cx, cy, lk, opt){
  opt = opt || {};
  var pe = lk.pe, g = 'havz' + (++uid), n = [cx - 6, cy + 3], f = [cx + 17, cy + 2], s = '';
  d.defs.push('<linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + pe[2] + '"/><stop offset=".38" stop-color="' + pe[1] + '"/><stop offset="1" stop-color="' + pe[0] + '"/></linearGradient>');
  s += P(T('M-8 24 L 6 24 L 8 38 L -10 38 Z', cx, cy), pe[2]) +
    P(T('M-24 -2 C -26 -26 -6 -34 8 -32 C 24 -30 32 -16 30 0 C 30 8 28 14 24 18 C 18 27 10 31 3 31 C -9 31 -21 23 -23 11 Z', cx, cy), 'url(#' + g + ')') +
    '<ellipse cx="' + (cx + 4) + '" cy="' + (cy - 24) + '" rx="30" ry="11" fill="#1a0f26" opacity=".35" filter="' + d.flou(4) + '"/>' +
    '<ellipse cx="' + (cx - 9) + '" cy="' + (cy + 14) + '" rx="6" ry="3.4" fill="' + pe[3] + '" opacity=".45"/>' +
    '<ellipse cx="' + (cx + 22) + '" cy="' + (cy + 13) + '" rx="3.4" ry="2.4" fill="' + pe[3] + '" opacity=".35"/>';
  /* les yeux : ouverts (ils clignent), fermés de joie, serrés, en spirale, ou qui luisent */
  var cils = '';
  if(lk.fille) [[n, -1, 6.2, 7.4], [f, 1, 4.3, 7]].forEach(function(e){ cils += L('M' + (e[0][0] + e[1] * (e[2] + 1)) + ' ' + (e[0][1] - e[3] * 0.5) + ' l ' + (e[1] * 4.5) + ' -3.5', O, 2.2); });
  s += '<g data-y="ouverts"><g class="haJ ha-cligne" style="transform-origin:' + (cx + 6) + 'px ' + (cy + 3) + 'px">' + oeil(n[0], n[1], 6.2, 7.4, lk.ir) + oeil(f[0], f[1], 4.3, 7, lk.ir) + cils + '</g></g>' +
    '<g data-y="lueur" style="display:none">' + E(n[0] + 1, n[1] + 0.5, 6, 7, '#fff') + E(f[0] + 1, f[1], 4.2, 6.6, '#fff') +
      E(n[0] + 1, n[1] + 1, 4.6, 5.8, CYAN, ' filter="' + d.flou(1.4) + '"') + E(f[0] + 1, f[1] + 1, 3.2, 5.2, CYAN, ' filter="' + d.flou(1.2) + '"') +
      C(n[0], n[1] - 2, 1.8, '#fff') + C(f[0], f[1] - 2, 1.3, '#fff') + cils +
      L('M' + (n[0] - 7.7) + ' ' + (n[1] - 4) + ' Q ' + n[0] + ' ' + (n[1] - 9.6) + ' ' + (n[0] + 7.7) + ' ' + (n[1] - 3.3), O, 2.8) +
      L('M' + (f[0] - 5.8) + ' ' + (f[1] - 3.8) + ' Q ' + f[0] + ' ' + (f[1] - 9.2) + ' ' + (f[0] + 5.8) + ' ' + (f[1] - 3.2), O, 2.8) + '</g>' +
    '<g data-y="joie" style="display:none">' + L('M' + (n[0] - 7) + ' ' + (n[1] + 2) + ' Q ' + n[0] + ' ' + (n[1] - 8) + ' ' + (n[0] + 7) + ' ' + (n[1] + 2), O, 3) +
      L('M' + (f[0] - 5) + ' ' + (f[1] + 1) + ' Q ' + f[0] + ' ' + (f[1] - 7) + ' ' + (f[0] + 5) + ' ' + (f[1] + 1), O, 3) + '</g>' +
    '<g data-y="serres" style="display:none">' + L('M' + (n[0] - 7) + ' ' + (n[1] - 5) + ' L ' + (n[0] + 5) + ' ' + n[1] + ' L ' + (n[0] - 7) + ' ' + (n[1] + 5), O, 3) +
      L('M' + (f[0] + 5) + ' ' + (f[1] - 5) + ' L ' + (f[0] - 4) + ' ' + f[1] + ' L ' + (f[0] + 5) + ' ' + (f[1] + 5), O, 3) + '</g>' +
    '<g data-y="ko" style="display:none">' + E(n[0], n[1], 6.6, 7.4, '#fff') + E(f[0], f[1], 4.6, 7, '#fff') +
      L(spirale(n[0] - 0.5, n[1], 7, 1.6), O, 1.8) + L(spirale(f[0] - 0.4, f[1], 6, 1.2), O, 1.5) + '</g>';
  /* les sourcils */
  s += '<g data-s="garde">' + L(T('M-15 -8 L -1 -5', cx, cy), O, 3) + L(T('M13 -5 L 23 -9', cx, cy), O, 3) + '</g>' +
    '<g data-s="souci" style="display:none">' + L(T('M-16 -6 Q -9 -12 -1 -11', cx, cy), O, 3) + L(T('M12 -10 Q 18 -12 24 -7', cx, cy), O, 3) + '</g>' +
    '<g data-s="content" style="display:none">' + L(T('M-15 -9 Q -8 -14 -1 -9', cx, cy), O, 3) + L(T('M13 -9 Q 18 -13 23 -9', cx, cy), O, 3) + '</g>' +
    '<g data-s="colere" style="display:none">' + L(T('M-15 -11 L 0 -4', cx, cy), O, 3.4) + L(T('M12 -4 L 24 -11', cx, cy), O, 3.4) + '</g>';
  /* le nez */
  s += L(T('M25 6 L 30 12 L 25 13', cx, cy), pe[2], 2.2) + L(T('M27 4 L 29 9', cx, cy), '#fff', 1.4, ' opacity=".5"');
  /* la bouche */
  s += '<g data-b="neutre">' + L(T('M8 21 Q 14 22 20 19', cx, cy), O, 2.6) + L(T('M11 25 Q 14 26 17 25', cx, cy), pe[2], 1.6) + '</g>' +
    '<g data-b="sourire" style="display:none">' + P(T('M6 19 Q 15 26 23 18 Q 15 21 6 19 Z', cx, cy), '#fff6ee') + '</g>' +
    '<g data-b="joie" style="display:none">' + P(T('M5 17 Q 15 33 24 16 Q 15 20 5 17 Z', cx, cy), '#6a1e2a') + F(T('M10 25 Q 15 22 20 24 Q 16 29 10 25 Z', cx, cy), '#ff7a8a') + F(T('M7 18 Q 15 21 22 18 L 21 20 Q 15 22 8 20 Z', cx, cy), '#fff') + '</g>' +
    '<g data-b="grimace" style="display:none">' + P(T('M5 18 L 23 16 L 23 24 L 6 25 Z', cx, cy), '#fff') + L(T('M5 21 L 23 20 M11 17 L 11 25 M17 17 L 17 24', cx, cy), O, 1.4) + '</g>' +
    '<g data-b="o" style="display:none">' + E(cx + 15, cy + 22, 3.4, 4.2, '#5a1a24', ' stroke="' + O + '" stroke-width="2.2"') + '</g>' +
    '<g data-b="effort" style="display:none">' + P(T('M7 19 L 22 18 L 21 23 L 8 23 Z', cx, cy), '#fff') + L(T('M8 21 L 21 20.5', cx, cy), O, 1.2) + '</g>';
  if(opt.lunettes) s += '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="9.2" fill="#d8f4ff" fill-opacity=".18" stroke="#3a2a1a" stroke-width="2.2"/><circle cx="' + (f[0] + 0.5) + '" cy="' + f[1] + '" r="7.2" fill="#d8f4ff" fill-opacity=".18" stroke="#3a2a1a" stroke-width="2.2"/>' +
    L('M' + (n[0] + 9) + ' ' + (n[1] - 1) + ' L ' + (f[0] - 7) + ' ' + (f[1] - 1), '#3a2a1a', 2) +
    L('M' + (n[0] - 5) + ' ' + (n[1] - 5) + ' l 4 -2', '#fff', 1.6, ' opacity=".7"');
  return s;
}
function meche(d, cx, cy, ch){
  return P(T('M-22 -24 C -14 -12 -2 -16 2 -8 C 6 -18 14 -18 18 -10 C 20 -18 28 -20 32 -14 C 26 -30 -4 -36 -22 -24 Z', cx, cy), d.g(ch[1])) +
    L(T('M-14 -24 C -6 -24 0 -20 2 -14', cx, cy), ch[0], 2, ' opacity=".8"') + L(T('M10 -22 C 14 -20 16 -16 17 -12', cx, cy), ch[0], 1.8, ' opacity=".7"');
}
function capucheFond(d, cx, cy, col){
  return F(T('M38 -14 C 26 -44 -14 -46 -30 -24 L -22 0 C -12 -30 22 -34 40 -6 Z', cx, cy), sombre(col, .78));
}
function capuche(d, cx, cy, col, bord){
  return P(T('M36 -20 C 24 -38 -10 -40 -22 -24 C -29 -12 -29 10 -21 28 C -17 36 -15 42 -13 48 L -50 52 C -60 18 -58 -24 -40 -46 L -36 -58 L -24 -52 C -4 -62 28 -54 36 -20 Z', cx, cy), d.g(col)) +
    F(T('M-46 46 C -54 16 -52 -20 -36 -40 C -40 -14 -40 18 -30 44 Z', cx, cy), sombre(col, .3), ' opacity=".7"') +
    L(T('M36 -20 C 24 -38 -10 -40 -22 -24 C -29 -12 -29 10 -21 28', cx, cy), bord, 3) +
    L(T('M32 -24 C 20 -35 -8 -36 -19 -23 C -25 -12 -25 8 -18 24', cx, cy), bord, 1.2, ' stroke-dasharray="3 3" opacity=".7"') +
    L(T('M-40 36 C -46 10 -42 -18 -26 -40', cx, cy), sombre(col, .45), 2) + L(T('M-30 30 C -34 10 -32 -8 -24 -22', cx, cy), sombre(col, .35), 1.6) +
    L(T('M30 -34 C 24 -44 10 -50 -6 -50', cx, cy), LUNE, 2, ' opacity=".45"');
}
function col(d, cx, cy, c){
  return P(T('M-46 42 Q -4 60 36 40 L 40 52 Q -4 72 -50 56 Z', cx, cy), d.g(c)) + L(T('M-44 50 Q -4 66 38 48', cx, cy), sombre(c, .35), 1.6);
}
/* un repère invisible (pour savoir où est une main, une pointe, le cristal…) */
function rep(nom, x, y){ return '<circle data-r="' + nom + '" cx="' + x + '" cy="' + y + '" r="0.6" fill="none"/>'; }
