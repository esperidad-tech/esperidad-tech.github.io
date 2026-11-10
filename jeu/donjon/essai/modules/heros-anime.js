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
/* ============ les objets du donjon (équipement visible) et les dessins des nouvelles réactions ============
   Deux sortes de dessins ici :
   - l'ÉQUIPEMENT (carquois d'argent ou lourd, cristal de lune, bâton de chêne, sacoche, amulette) et les FLÈCHES spéciales :
     des variantes cachées, dessinées d'avance dans le héros (<g data-eq="…" style="display:none">), à leur place dans l'ordre
     du dessin. À la cuisson (RAPIDITE.md R1), elles restent de petits îlots vectoriels (contenu fixe, sans filtre) : aucune
     image en plus en mémoire, aucun temps de cuisson en plus ; equiper() ne fait que les montrer ou les cacher ;
   - les calques des RÉACTIONS (givre, bave, toile) : de petits dessins SVG fixes, posés à la demande dans la pièce qu'ils
     suivent (cuit : un îlot, peint une fois, puis déplacé et estompé par la carte graphique). Ils ne changent jamais de forme. */

/* un chemin avec un contour d'épaisseur choisie (P() garde toujours 3) */
function Pw(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
/* une variante d'équipement, cachée au départ */
function V(nom, contenu){ return '<g data-eq="' + nom + '" style="display:none">' + contenu + '</g>'; }
/* un petit hasard qui donne toujours la même suite (les dessins restent les mêmes d'une fois sur l'autre) */
function graine(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
/* un croissant de lune : le disque (cx, cy, R) moins le disque (cx + ox, cy + oy, r) */
function croissant(cx, cy, R, ox, oy, r){
  var d = Math.hypot(ox, oy) || 1, a = (R * R - r * r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, R * R - a * a));
  var ux = ox / d, uy = oy / d, px = cx + a * ux, py = cy + a * uy;
  var i1 = [px - h * uy, py + h * ux], i2 = [px + h * uy, py - h * ux];
  return 'M' + r1(i1[0]) + ' ' + r1(i1[1]) + ' A ' + R + ' ' + R + ' 0 1 1 ' + r1(i2[0]) + ' ' + r1(i2[1]) + ' A ' + r + ' ' + r + ' 0 ' + (d < a ? 1 : 0) + ' 0 ' + r1(i1[0]) + ' ' + r1(i1[1]) + ' Z';
}
function coeurD(x, y, r){
  return 'M' + r1(x) + ' ' + r1(y + r) + ' C ' + r1(x - r * 1.7) + ' ' + r1(y - r * .1) + ' ' + r1(x - r * .95) + ' ' + r1(y - r * 1.45) + ' ' + r1(x) + ' ' + r1(y - r * .45) +
    ' C ' + r1(x + r * .95) + ' ' + r1(y - r * 1.45) + ' ' + r1(x + r * 1.7) + ' ' + r1(y - r * .1) + ' ' + r1(x) + ' ' + r1(y + r) + ' Z';
}
/* une étoile à 4 branches (scintillement fixe, dessiné) */
function eclat4(x, y, r, c){ return F('M' + x + ' ' + (y - r) + ' Q ' + (x + r * .16) + ' ' + (y - r * .16) + ' ' + (x + r) + ' ' + y + ' Q ' + (x + r * .16) + ' ' + (y + r * .16) + ' ' + x + ' ' + (y + r) + ' Q ' + (x - r * .16) + ' ' + (y + r * .16) + ' ' + (x - r) + ' ' + y + ' Q ' + (x - r * .16) + ' ' + (y - r * .16) + ' ' + x + ' ' + (y - r) + ' Z', c); }

/* ---------- l'amulette de vie (n'importe quel héros) : un médaillon d'or au cœur de rubis, sur la poitrine ---------- */
function amulette(d, cx, cy, ceinture){
  var or = '#e8c062', ch = ceinture ? 'M' + (cx - 5) + ' ' + (cy - 16) + ' L ' + cx + ' ' + (cy - 8) + ' L ' + (cx + 5) + ' ' + (cy - 16)
    : 'M' + (cx - 14) + ' ' + (cy - 19) + ' Q ' + (cx - 11) + ' ' + (cy - 6) + ' ' + cx + ' ' + (cy - 8) + ' Q ' + (cx + 11) + ' ' + (cy - 6) + ' ' + (cx + 14) + ' ' + (cy - 20);
  return V('amulette', '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="' + d.halo('#fff2b0', '#ffc850') + '" opacity=".55"/>' +
    L(ch, O, 3.4) + L(ch, or, 1.9, ' stroke-dasharray="2.4 1.5"') +
    '<circle cx="' + cx + '" cy="' + cy + '" r="8.4" fill="' + d.g('#f0c860') + '" stroke="' + O + '" stroke-width="2.4"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="none" stroke="#fff4c0" stroke-width="1" opacity=".75"/>' +
    Pw(coeurD(cx, cy + .6, 4.4), d.g('#ff4a6a'), 1.5) + C(cx - 1.7, cy - 1.2, 1.3, '#fff', ' opacity=".9"') +
    C(cx, cy - 9.4, 2.2, or, ' stroke="' + O + '" stroke-width="1.3"') + eclat4(cx + 7, cy - 7, 3.4, '#fff8d0'));
}

/* ---------- les flèches spéciales (dessinées de l'encoche (0, 0) à la pointe (124, 0)), par-dessus la flèche simple ---------- */
function flechesSpeciales(){
  /* d'argent : fût et pointe d'argent, plumes blanches, deux bagues */
  var argent = L('M0 0 L 112 0', O, 6.4) + L('M0 0 L 112 0', '#dfe7f2', 3) + L('M8 -0.8 L 104 -0.8', '#ffffff', 1.1) +
    L('M90 -3 L 90 3 M96 -3 L 96 3', '#a8b4c8', 1.6) +
    Pw('M129 0 L 109 -7.5 L 112.5 0 L 109 7.5 Z', '#eef3fb', 2.4) + L('M113 -2.4 L 124 -0.4', '#ffffff', 1.4) + F('M112.5 0 L 129 0 L 109 7.5 Z', '#b8c4d8', ' opacity=".55"') +
    Pw('M6 -1 L -8 -10 L -3 0 Z', '#f6f9ff', 2) + Pw('M6 1 L -8 10 L -3 0 Z', '#e2eaf6', 2) + L('M4 -1.5 L -5 -7 M4 1.5 L -5 7', '#a8b4c8', 1) +
    eclat4(131, -6, 4.2, '#ffffff');
  /* lourde : fût épais, grosse pointe de fer noir, plumes sombres */
  var lourde = L('M-2 0 L 108 0', O, 9.5) + L('M-2 0 L 108 0', '#6a4a2e', 6) + L('M6 -1.6 L 100 -1.6', '#a07a4a', 1.4) +
    Pw('M102 -5.2 L 111 -5.2 L 111 5.2 L 102 5.2 Z', '#3a3844', 2.2) + C(106.5, 0, 1.4, '#8a8898') +
    Pw('M134 0 L 107 -11 L 113 0 L 107 11 Z', '#2e2c36', 2.6) + F('M113 0 L 134 0 L 107 -11 Z', '#4e4c5c') + L('M116 -2.2 L 130 -0.4', '#b8b6c8', 1.4) +
    Pw('M8 -1.4 L -11 -13 L -4 0 Z', '#3a3444', 2.2) + Pw('M8 1.4 L -11 13 L -4 0 Z', '#2a2632', 2.2) + L('M5 -2 L -6 -9 M5 2 L -6 9', '#6a6478', 1.1);
  /* trempée dans le givre : la pointe gelée, des cristaux qui la hérissent, du givre sur le fût */
  var gl = '';
  [[114, -6, -60, 7], [119, -5, -35, 6], [123, 4, 40, 6], [116, 6, 70, 7], [126, -1, 0, 6], [108, -4, -100, 5]].forEach(function(c){
    var a = c[2] / DEG, l = c[3], x2 = c[0] + Math.cos(a) * l, y2 = c[1] + Math.sin(a) * l, nx = -Math.sin(a) * 1.6, ny = Math.cos(a) * 1.6;
    gl += Pw('M' + r1(c[0] + nx) + ' ' + r1(c[1] + ny) + ' L ' + r1(x2) + ' ' + r1(y2) + ' L ' + r1(c[0] - nx) + ' ' + r1(c[1] - ny) + ' Z', '#eaf8ff', 1.2);
  });
  var givre = Pw('M127 0 L 110 -7.5 L 112.5 0 L 110 7.5 Z', '#bfeaff', 2.2) + gl + C(117, -1, 2.2, '#ffffff', ' opacity=".9"') +
    L('M84 -2.6 L 88 -1 M92 2.4 L 96 0.8 M99 -2.6 L 103 -1 M88 2.6 L 91 1', '#e8f8ff', 1.6) + eclat4(128, -8, 3.6, '#ffffff');
  /* trempée dans l'acide : une goutte verte qui coule de la pointe, des bulles */
  var acide = Pw('M110 -5.5 C 116 -9 124 -6 126 0 C 124 5 120 7 116 7 C 112 7 109 3 110 -5.5 Z', '#7ae04a', 1.8) +
    Pw('M114 6 C 113 11 113 15 115.5 17.5 C 118 15 117.5 11 117 6 Z', '#7ae04a', 1.4) + Pw('M121 5 C 121 8 121 10 122.5 11.5 C 124 10 124 8 123.5 5 Z', '#62c83a', 1.2) +
    C(117, -2.2, 2, '#eaffd0', ' opacity=".95"') + C(123, 0, 1.2, '#c8ff9a') + C(112.5, 1.5, 1.1, '#c8ff9a') + C(115, 15, 1.1, '#eaffd0', ' opacity=".8"');
  return '<g data-argent style="display:none">' + argent + '</g><g data-lourde style="display:none">' + lourde + '</g>' +
    '<g data-givre style="display:none">' + givre + '</g><g data-acide style="display:none">' + acide + '</g>';
}

/* ---------- le Pisteur : les deux carquois trouvés dans la réserve ----------
   (le carquois est derrière la capuche : ce qu'on voit, ce sont les flèches qui dépassent en arrière, en haut à gauche) */
function fleDos(a, b, fut, p1, p2, k){
  var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), u = [dx / l, dy / l], n = [-u[1], u[0]];
  function q(t, m){ return r1(b[0] - u[0] * t * k + n[0] * m * k) + ' ' + r1(b[1] - u[1] * t * k + n[1] * m * k); }
  var f = 'M' + r1(a[0]) + ' ' + r1(a[1]) + ' L ' + r1(b[0]) + ' ' + r1(b[1]);
  return L(f, O, 2.2 * k + 2.2) + L(f, fut, 2.2 * k) +
    Pw('M' + q(1, 0) + ' L ' + q(14, 6.5) + ' L ' + q(16, 1) + ' Z', p1, 1.8) + Pw('M' + q(1, 0) + ' L ' + q(14, -6.5) + ' L ' + q(16, -1) + ' Z', p2, 1.8) +
    C(r1(b[0]), r1(b[1]), 1.6 * k, fut, ' stroke="' + O + '" stroke-width="1.2"');
}
function carquoisArgent(d){
  return V('carquois-argent',
    fleDos([80, 60], [47, 25], '#dfe7f2', '#f6f9ff', '#d2dcec', 1.2) + fleDos([84, 58], [57, 13], '#dfe7f2', '#e8eef8', '#f6f9ff', 1.2) + fleDos([76, 64], [39, 40], '#dfe7f2', '#f6f9ff', '#d2dcec', 1.2) +
    L('M46 30 L 52 24 M55 19 L 60 13 M38 44 L 44 38', '#ffffff', 1.2, ' opacity=".9"') +
    eclat4(38, 20, 5, '#ffffff') + eclat4(62, 4, 3.6, '#e8f6ff') + eclat4(30, 44, 3, '#ffffff') + rep('carquois', 50, 28));
}
function carquoisLourd(d){
  return V('carquois-lourd',
    fleDos([80, 60], [45, 23], '#7a5636', '#56506a', '#3e3850', 1.5) + fleDos([84, 58], [56, 11], '#7a5636', '#3e3850', '#56506a', 1.5) + fleDos([76, 64], [37, 39], '#7a5636', '#56506a', '#3e3850', 1.5) +
    L('M43 27 L 50 21 M53 15 L 58 9 M35 43 L 42 36', '#b8b2cc', 1.4) + C(45, 23, 2.4, '#b8b6c8', ' stroke="' + O + '" stroke-width="1.2"') + C(56, 11, 2.4, '#b8b6c8', ' stroke="' + O + '" stroke-width="1.2"') + C(37, 39, 2.4, '#b8b6c8', ' stroke="' + O + '" stroke-width="1.2"') +
    rep('carquois', 50, 28));
}

/* ---------- l'Alchimiste : la sacoche (une 4e place de recette), à la hanche, derrière ---------- */
function sacoche(d){
  return V('sacoche',
    /* deux courroies accrochées à la ceinture */
    L('M98 153 L 92 162 M104 155 L 101 163', O, 4.4) + L('M98 153 L 92 162 M104 155 L 101 163', '#5a361f', 2.4) +
    /* ce qui dépasse : un rouleau de recettes, un brin d'herbe, le bouchon d'une fiole */
    Pw('M77 150 L 83 148 L 86 164 L 80 166 Z', '#f6ecd2', 2) + L('M78.5 153 L 83.5 151.5', '#c8a870', 1.2) + E(80, 149, 3.2, 1.8, '#e8dcc0', ' stroke="' + O + '" stroke-width="1.4"') +
    L('M93 162 Q 92 152 97 146', '#3e7a2a', 2.2) + Pw('M97 146 Q 103 144 102 150 Q 99 151 97 146 Z', '#6ac85a', 1.4) + Pw('M94 152 Q 89 148 90 144 Q 95 146 94 152 Z', '#5ab84a', 1.4) +
    Pw('M86 156 L 92 156 L 92 162 L 86 162 Z', '#9a6a3a', 1.6) + C(89, 155, 2.4, '#ff8a3a', ' stroke="' + O + '" stroke-width="1.2"') +
    /* le sac, cousu */
    Pw('M71 162 Q 88 157 104 162 L 102 194 Q 87 200 73 194 Z', d.g('#9a6a3a'), 2.8) +
    couture('M75 168 L 75 190 M99 167 L 98 190', '#e0b484') + L('M74 194 Q 88 199 101 194', '#5e3a1e', 1.6) +
    /* le rabat, la boucle d'or */
    Pw('M70 160 Q 88 154 105 161 L 103 177 Q 87 184 72 176 Z', d.g('#7a4a26'), 2.8) + couture('M74 172 Q 88 178 100 172', '#e0b484') +
    Pw('M84 174 L 92 174 L 92 182 L 84 182 Z', '#e8c062', 2) + L('M88 174 L 88 182', O, 1.4) +
    rep('sacoche', 88, 180));
}

/* ---------- le Sage : le cristal de lune (sur la crosse) et le bâton de chêne ---------- */
function cristalLune(d, x, y, devant){
  if(!devant) return V('cristal-lune', '<circle cx="' + x + '" cy="' + y + '" r="40" fill="' + d.halo('#ffffff', '#cfdcff') + '" opacity=".7"/>');
  /* le croissant de pierre de lune qui tient le cristal (devant lui), et ses étoiles */
  var c = croissant(x - 3, y, 25, 13, -2, 21);
  return V('cristal-lune', Pw(c, d.g('#f2f4ff', 1.2), 2.8) + F(croissant(x - 3, y, 20, 11, -2, 17.5), '#c8d0f8', ' opacity=".5"') +
    L('M' + r1(x - 21) + ' ' + r1(y - 12) + ' Q ' + r1(x - 27) + ' ' + y + ' ' + r1(x - 20) + ' ' + r1(y + 13), '#ffffff', 2, ' opacity=".9"') +
    C(x - 25, y + 1, 2.6, '#ffffff', ' stroke="' + O + '" stroke-width="1.2"') + C(x - 19, y + 16, 2, '#e8ecff', ' stroke="' + O + '" stroke-width="1"') + C(x - 19, y - 15, 2, '#e8ecff', ' stroke="' + O + '" stroke-width="1"') +
    eclat4(x + 20, y - 24, 5.4, '#ffffff') + eclat4(x - 32, y - 20, 3.6, '#e8f0ff') + eclat4(x + 22, y + 18, 3.2, '#e8f0ff'));
}
function feuilleChene(x, y, a, k, c){
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + k + ')">' +
    Pw('M0 0 C 2 -3 4 -5 6 -4 C 6 -8 10 -9 11 -6 C 12 -10 16 -10 16 -6 C 19 -8 21 -5 20 -3 C 23 -2 23 0 23 0 C 23 0 23 2 20 3 C 21 5 19 8 16 6 C 16 10 12 10 11 6 C 10 9 6 8 6 4 C 4 5 2 3 0 0 Z', c || '#5aa04a', 1.6) +
    L('M0 0 L 21 0 M8 0 L 11 -4 M8 0 L 11 4 M14 0 L 16 -4 M14 0 L 16 4', '#2e6a26', 1) + '</g>';
}
function gland(x, y, a){
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (a || 0) + ')">' + L('M0 -7 L 0 -3', '#5e3a1c', 1.6) +
    Pw('M-4.6 7 C -5 13 -2 16 0 16 C 2 16 5 13 4.6 7 Z', '#c88a3a', 1.6) + C(-1.4, 10, 1.2, '#fff0c0', ' opacity=".7"') +
    Pw('M-5.5 7.5 C -6 3 -3 -2 0 -2 C 3 -2 6 3 5.5 7.5 Z', '#7a5230', 1.6) + L('M-4 3 L 4 6 M-4 6 L 3 1 M-1 0 L 4 4', '#4e321a', .9) + '</g>';
}
function batonChene(d, xb, top, bas){
  var x = xb, t = function(k){ return r1(top + k); };
  var tronc = 'M' + x + ' ' + t(14) + ' C ' + (x - 3.5) + ' ' + t(60) + ' ' + (x + 3.5) + ' ' + t(100) + ' ' + (x - 1) + ' ' + t(140) + ' C ' + (x - 4.5) + ' ' + t(180) + ' ' + (x + 3.5) + ' ' + t(214) + ' ' + x + ' ' + r1(bas - 10);
  var ecorce = '';
  [[22, -1], [40, 1.5], [58, -1.5], [78, 1], [96, 2], [118, -1], [150, 1.2], [168, -2], [196, 1.6], [214, -1], [232, 1.4]].forEach(function(e){
    var y = top + e[0]; ecorce += 'M' + r1(x + e[1] - 2) + ' ' + r1(y) + ' q 1.6 4 0 8 ';
  });
  return V('baton-chene', L(tronc, O, 13) + L(tronc, '#8a5a2e', 8.4) + L(tronc.replace(/M(\d+)/, function(m, v){ return 'M' + (+v + 2.2); }), '#b88048', 1.6, ' opacity=".75"') +
    L(ecorce, '#4e321a', 1.4) +
    E(x - 1, top + 70, 3, 4.6, '#5e3a1c', ' stroke="' + O + '" stroke-width="1.4"') + E(x + 1, top + 182, 2.6, 4, '#5e3a1c', ' stroke="' + O + '" stroke-width="1.4"') +
    /* une branche de lierre qui s'enroule, des feuilles de chêne sous la crosse et un gland */
    L('M' + (x - 5) + ' ' + t(24) + ' C ' + (x + 8) + ' ' + t(36) + ' ' + (x - 8) + ' ' + t(52) + ' ' + (x + 6) + ' ' + t(66) + ' C ' + (x + 9) + ' ' + t(70) + ' ' + (x - 7) + ' ' + t(84) + ' ' + (x + 5) + ' ' + t(98), '#3e7a2a', 2.2) +
    feuilleChene(x + 2, top + 30, -20, .62, '#6ab85a') + feuilleChene(x - 2, top + 58, 200, .55, '#5aa04a') + feuilleChene(x + 4, top + 88, -10, .5, '#6ab85a') +
    feuilleChene(x - 2, top + 16, 205, .8) + feuilleChene(x + 3, top + 18, -40, .78, '#6ab85a') + gland(x + 13, top + 26, -10) + gland(x + 4, top + 32, 12) +
    rep('chene', x, top + 40));
}

/* ============ les calques des réactions (posés à la demande dans une pièce) ============ */
/* les normales d'une ligne de points (vers le « haut » quand la ligne va de gauche à droite) */
function normales(p){
  return p.map(function(q, i){ var a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; });
}
/* une ligne de points plus serrée (chaque segment coupé en n) */
function affiner(p, n){ var r = []; for(var i = 0; i < p.length - 1; i++) for(var k = 0; k < n; k++) r.push(lerp(p[i], p[i + 1], k / n)); r.push(p[p.length - 1]); return r; }
/* une croûte de givre posée sur une ligne : piquants dessus, glaçons dessous */
function croute(pts, ep, s){
  var R = graine(s || 7), p = affiner(pts, 3), n = normales(p), haut = [], bas = [], glac = '', i;
  for(i = 0; i < p.length; i++){
    var pic = i % 2 ? ep * (.5 + R() * .5) : ep * (.05 + R() * .15);
    haut.push([p[i][0] + n[i][0] * (ep * .45 + pic), p[i][1] + n[i][1] * (ep * .45 + pic)]);
    bas.unshift([p[i][0] - n[i][0] * ep * (.5 + R() * .2), p[i][1] - n[i][1] * ep * (.5 + R() * .2)]);
  }
  for(i = 1; i < p.length - 1; i += 2 + (R() < .5 ? 1 : 0)){
    var l = ep * (.9 + R() * 1.3), b0 = [p[i][0] - n[i][0] * ep * .5, p[i][1] - n[i][1] * ep * .5];
    glac += 'M' + r1(b0[0] - 2.2) + ' ' + r1(b0[1]) + ' L ' + r1(b0[0] - n[i][0] * l) + ' ' + r1(b0[1] - n[i][1] * l) + ' L ' + r1(b0[0] + 2.2) + ' ' + r1(b0[1]) + ' Z ';
  }
  var forme = 'M' + haut.concat(bas).map(function(q){ return r1(q[0]) + ' ' + r1(q[1]); }).join(' L ') + ' Z';
  var reflet = 'M' + haut.slice(1, -1).map(function(q, k){ var j = k + 1; return r1(q[0] - n[j][0] * ep * .45) + ' ' + r1(q[1] - n[j][1] * ep * .45); }).join(' L ');
  return Pw(glac, '#dff6ff', 1.4) + Pw(forme, '#e8f8ff', 1.8) + F(forme, '#bfe8ff', ' opacity=".35"') + L(reflet, '#ffffff', 1.4, ' opacity=".9"');
}
/* le givre d'un héros (calques : épaules, capuche, bras proche), en unités du dessin */
function givreDessin(role){
  var ep = role === 'sage' ? [[90, 99], [102, 93.5], [116, 90], [130, 89.5], [143, 91.5], [154, 97.5], [160, 104]] : [[78, 101], [90, 106], [104, 110], [120, 111], [135, 108.5], [149, 103.5], [162, 97]];
  var tete = [[92, 8], [101, 4], [113, -1], [126, -1.5], [139, 1.5], [150, 9], [157, 21], [161, 34]];
  var s = croute(ep, 7, 11) + eclat4(ep[1][0], ep[1][1] - 12, 4, '#ffffff') + eclat4(ep[5][0] + 2, ep[5][1] - 11, 3.4, '#ffffff');
  return {epaules:s + '<circle cx="' + ep[3][0] + '" cy="' + (ep[3][1] - 2) + '" r="3" fill="#ffffff" opacity=".8"/>',
    tete:croute(tete, 6.5, 23) + eclat4(118, -10, 4.6, '#ffffff') + eclat4(152, 4, 3.2, '#e8f8ff'),
    bras:croute([[97, 112], [101, 105.5], [108, 102.5], [115, 104.5], [119, 110.5]], 6, 31)};
}
/* une coulée de bave gluante sur une ligne : bourrelets dessus, gouttes qui pendent dessous ; renvoie aussi le bout des gouttes */
function coulee(pts, ep, s, nGouttes){
  var R = graine(s || 5), p = affiner(pts, 2), n = normales(p), haut = [], bas = [], gouttes = [], i;
  for(i = 0; i < p.length; i++){
    var b = ep * (.35 + R() * .45);
    haut.push([p[i][0] + n[i][0] * b, p[i][1] + n[i][1] * b]);
    bas.push([p[i][0] - n[i][0] * ep * (.45 + R() * .25), p[i][1] - n[i][1] * ep * (.45 + R() * .25)]);
  }
  /* des gouttes qui pendent : on les insère dans le bord du dessous */
  var bord = [], pas = Math.max(2, Math.floor(p.length / (nGouttes || 3)));
  for(i = 0; i < bas.length; i++){
    bord.push(bas[i]);
    if(i > 0 && i < bas.length - 1 && i % pas === 1){
      var l = ep * (1.4 + R() * 1.8), q = bas[i], m = [q[0] - n[i][0] * l, q[1] - n[i][1] * l], nx = n[i][1], ny = -n[i][0], w = 3 + R() * 1.6;
      bord.push([q[0] + nx * w, q[1] + ny * w], [m[0] + nx * w * .7, m[1] + ny * w * .7], [m[0] - n[i][0] * w, m[1] - n[i][1] * w], [m[0] - nx * w * .7, m[1] - ny * w * .7], [q[0] - nx * w, q[1] - ny * w]);
      gouttes.push([m[0] - n[i][0] * w, m[1] - n[i][1] * w]);
    }
  }
  var forme = lisse(haut.concat(bord.reverse()), true);
  var reflet = lisse(haut.slice(1, -1).map(function(q, k){ var j = k + 1; return [q[0] - n[j][0] * ep * .3, q[1] - n[j][1] * ep * .3]; }), false);
  return {svg:Pw(forme, '#a6e07a', 2.2, ' fill-opacity=".9"') + F(forme, '#5ab83a', ' opacity=".25"') + L(reflet, '#eaffd0', 2, ' opacity=".9"') +
    gouttes.map(function(g){ return C(g[0] - 1, g[1] - 2.5, 1.3, '#ffffff', ' opacity=".8"'); }).join(''), gouttes:gouttes};
}
function baveDessin(role){
  var ep = role === 'sage' ? [[92, 99], [106, 92.5], [122, 89.5], [138, 90.5], [152, 96.5], [160, 104]] : [[80, 101], [94, 107], [110, 111], [126, 110.5], [142, 105.5], [158, 98]];
  var a = coulee(ep, 7.5, 17, 4), b = coulee([[94, 8], [106, 1], [120, -2], [134, -.5], [147, 6], [156, 18], [161, 32]], 8.5, 29, 4), c = coulee([[97, 111], [102, 104.5], [110, 102], [118, 106], [121, 113]], 6.5, 41, 2);
  /* une grosse goutte sur le front, qui pend devant l'œil */
  var front = Pw('M137 20 C 141 19 144 22 143 27 C 142.5 31 143.5 36 141 39 C 138.5 41 136 39 136.5 35 C 137 31 135 24 137 20 Z', '#a6e07a', 1.8, ' fill-opacity=".92"') + C(139, 24, 1.3, '#ffffff', ' opacity=".85"');
  return {epaules:a.svg, tete:b.svg + front, bras:c.svg, gouttes:{epaules:a.gouttes, tete:b.gouttes.concat([[140, 40]]), bras:c.gouttes}};
}
/* la toile d'araignée qui ligote un héros : des fils qui l'entourent, ancrés au sol et en haut ; en deux moitiés (pour la déchirer) */
function toileDessin(){
  var R = graine(53), G = ['', ''], X = 126;
  function fil(a, m, b, w){
    /* coupé en deux au milieu (de Casteljau) : chaque moitié va dans son camp */
    var p01 = lerp(a, m, .5), p12 = lerp(m, b, .5), mid = lerp(p01, p12, .5);
    var d1 = 'M' + r1(a[0]) + ' ' + r1(a[1]) + ' Q ' + r1(p01[0]) + ' ' + r1(p01[1]) + ' ' + r1(mid[0]) + ' ' + r1(mid[1]);
    var d2 = 'M' + r1(mid[0]) + ' ' + r1(mid[1]) + ' Q ' + r1(p12[0]) + ' ' + r1(p12[1]) + ' ' + r1(b[0]) + ' ' + r1(b[1]);
    var gA = a[0] < b[0] ? 0 : 1;
    G[gA] += L(d1, O, (w || 1.8) + 1.8, ' opacity=".5"') + L(d1, '#f4f8ff', w || 1.8);
    G[1 - gA] += L(d2, O, (w || 1.8) + 1.8, ' opacity=".5"') + L(d2, '#f4f8ff', w || 1.8);
  }
  /* les fils qui le ligotent (en travers du corps, des bras, des jambes) */
  [[[74, 106], [124, 132], [176, 116]], [[76, 144], [122, 118], [174, 154]], [[80, 172], [126, 196], [172, 168]], [[84, 202], [124, 180], [168, 214]],
   [[88, 236], [128, 252], [166, 230]], [[92, 262], [126, 248], [162, 266]], [[86, 86], [124, 108], [166, 84]], [[90, 54], [124, 76], [160, 52]]].forEach(function(f, i){ fil(f[0], f[1], f[2], i % 3 ? 1.7 : 2.3); });
  /* les amarres : vers le sol et vers le haut (d'où vient la toile) */
  fil([86, 250], [72, 274], [56, 294], 1.6); fil([168, 252], [182, 276], [198, 294], 1.6); fil([90, 60], [70, 20], [50, -30], 1.4); fil([162, 56], [184, 16], [206, -30], 1.4);
  /* une petite toile ronde collée sur la poitrine */
  var cx = 128, cy = 150, ray = [];
  for(var k = 0; k < 10; k++){ var an = k / 10 * Math.PI * 2 + (R() - .5) * .25, lg = 34 + R() * 12; ray.push([an, lg]);
    var b = [cx + Math.cos(an) * lg, cy + Math.sin(an) * lg], dd = 'M' + cx + ' ' + cy + ' L ' + r1(b[0]) + ' ' + r1(b[1]), g = b[0] < X ? 0 : 1;
    G[g] += L(dd, O, 3, ' opacity=".45"') + L(dd, '#f4f8ff', 1.3); }
  [.35, .6, .85].forEach(function(f){ for(var k2 = 0; k2 < ray.length; k2++){
    var r0 = ray[k2], q = ray[(k2 + 1) % ray.length], p0 = [cx + Math.cos(r0[0]) * r0[1] * f, cy + Math.sin(r0[0]) * r0[1] * f], p1 = [cx + Math.cos(q[0]) * q[1] * f, cy + Math.sin(q[0]) * q[1] * f], mm = lerp(lerp(p0, p1, .5), [cx, cy], .12);
    var dd = 'M' + r1(p0[0]) + ' ' + r1(p0[1]) + ' Q ' + r1(mm[0]) + ' ' + r1(mm[1]) + ' ' + r1(p1[0]) + ' ' + r1(p1[1]), g = mm[0] < X ? 0 : 1;
    G[g] += L(dd, O, 2.8, ' opacity=".4"') + L(dd, '#e8f0ff', 1.2);
    if(R() < .3) G[g] += C(r1(mm[0]), r1(mm[1] + 1.4), 1.8, '#f8ffe8', ' opacity=".9"');
  } });
  /* un voile de soie, des gouttes de colle */
  G[0] = '<path d="M80 92 C 70 160 76 230 92 268 L 126 262 L 126 84 Z" fill="#e8f0ff" opacity=".13"/>' + G[0];
  G[1] = '<path d="M126 84 L 126 262 L 160 268 C 176 230 182 160 172 92 Z" fill="#e8f0ff" opacity=".13"/>' + G[1];
  [[96, 120, 0], [150, 128, 1], [104, 190, 0], [146, 205, 1], [112, 246, 0], [138, 240, 1], [100, 62, 0], [152, 70, 1]].forEach(function(g){ G[g[2]] += C(g[0], g[1], 2.2, '#f8ffe8', ' stroke="' + O + '" stroke-width=".8" opacity=".95"'); });
  return G;
}

/* ---------- des morceaux communs aux trois héros ---------- */
function jambe(d, c, pant, bt, deco){
  var x = SQ['cuisse' + c][0], k = c === 'A' ? .16 : 0, p = sombre(pant, k), b = sombre(bt, k);
  return J('cuisse' + c, seg(x, 172, 224, 22, 18, d.gh(p)) + L('M' + (x + 6) + ' 180 L ' + (x + 5) + ' 218', LUNE, 1.6, ' opacity="' + (c === 'A' ? .15 : .35) + '"') +
    J('tibia' + c, seg(x, 222, 272, 18, 15, d.gh(p)) + L('M' + (x - 3) + ' 230 L ' + (x - 2) + ' 266', sombre(p, .4), 1.6) + (deco ? deco(x, k) : '') +
      J('pied' + c, botte(d, x, b) + rep('cheville' + c, x, 272) + rep('orteil' + c, x + 24, 290))));
}
function epaulette(x, y, c){ return E(x, y, 9, 8, c, ' stroke="' + O + '" stroke-width="3"'); }
/* la flèche, dessinée de l'encoche (0, 0) à la pointe (124, 0) */
function flecheDessin(){
  return '<g data-feu style="display:none">' + E(118, 0, 18, 9, '#ff9a2a', ' opacity=".45"') +
      F('M108 0 C 112 -14 124 -16 128 -26 C 132 -12 140 -8 136 0 C 132 8 114 8 108 0 Z', '#ff7a1a', ' stroke="' + O + '" stroke-width="2"') +
      F('M114 0 C 118 -8 124 -10 127 -16 C 130 -8 134 -4 131 0 C 128 4 118 4 114 0 Z', '#ffd84a') + '</g>' +
    L('M0 0 L 112 0', O, 6) + L('M0 0 L 112 0', '#d9b46a', 2.6) + L('M10 -0.6 L 100 -0.6', '#fff2c8', 1, ' opacity=".6"') +
    P('M125 0 L 110 -6.5 L 112 0 L 110 6.5 Z', '#c8d2e4', ' stroke-width="2.4"') + L('M113 -2 L 121 0', '#fff', 1.2) +
    P('M6 -1 L -7 -9 L -3 0 Z', '#e04a3a', ' stroke-width="2.2"') + P('M6 1 L -7 9 L -3 0 Z', '#e04a3a', ' stroke-width="2.2"') +
    '<g data-huile style="display:none">' + E(118, 3, 6, 4, '#2a2418', ' stroke="' + O + '" stroke-width="1.6"') + E(117, 9, 2.2, 3.4, '#3a3020') + C(116, 1, 1.4, '#c8b88a') + '</g>' +
    '<g data-colle style="display:none">' + E(117, 0, 8, 6, '#f2f6e8', ' stroke="' + O + '" stroke-width="1.6"') + L('M112 5 Q 110 12 113 16 M120 5 Q 122 11 120 14', '#e8f0d8', 1.6) + C(119, -2, 1.6, '#fff') + '</g>' +
    flechesSpeciales();
}

/* ============ le Pisteur ============ */
function pisteur(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var vert = '#3b7f54', capu = '#2d6a46', cuir = '#8e5a36', cuirF = '#5a361f', pant = '#4c3c38', bt = '#74482a';
  var B = '';
  /* couche 0 : la cape, le carquois, la queue de cheval */
  var c0 = '<g data-souple="cape"></g>' +
    P('M70 64 L 92 56 L 116 138 L 94 146 Z', d.g('#7c4a28')) + L('M80 61 L 103 141', cuirF, 2) +
    L('M73 74 L 95 66 M95 128 L 112 122', '#c9a35a', 3) + couture('M76 70 L 98 140', '#d8aa76') +
    '<g data-carquois>' + P('M70 52 L 64 42 L 76 46 Z', '#e04a3a') + P('M80 48 L 76 36 L 86 42 Z', '#f3e7cb') + P('M90 46 L 88 34 L 97 42 Z', '#e04a3a') +
    L('M72 60 L 72 50 M82 58 L 81 46 M92 56 L 92 44', '#7a5a3a', 2) + '</g>' + carquoisArgent(d) + carquoisLourd(d) +
    J('tete', '<g data-souple="queue"></g>');
  B += J('torse', c0);
  /* jambe loin */
  var genou = function(x, k){ return P('M' + (x - 10) + ' 224 L ' + (x + 10) + ' 222 L ' + (x + 11) + ' 238 L ' + (x - 9) + ' 240 Z', d.g(sombre(cuir, k))) + rivets([[x - 4, 230], [x + 5, 229]]); };
  B += jambe(d, 'A', pant, bt, genou);
  /* bras loin (derrière le corps) : il tient l'arc */
  var x = SQ.brasA[0];
  B += J('torse', J('brasA', seg(x, 106, 141, 17, 14, d.gh(vert)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', LUNE, 1.4, ' opacity=".4"') +
    J('avantBrasA', seg(x, 140, 179, 14.5, 12.5, d.gh(cuir)) + L('M' + (x - 7) + ' 150 L ' + (x + 7) + ' 150 M' + (x - 6.5) + ' 162 L ' + (x + 6.5) + ' 162', cuirF, 2) +
      J('mainA', main(d, x, 185, 8.5, pe[1])))));
  /* jambe proche */
  B += jambe(d, 'B', pant, bt, genou);
  /* la tunique sous la ceinture (tissu souple) */
  B += '<g data-souple="jupe"></g>';
  /* le corps : tunique, gilet de cuir cousu, ceinture, dague */
  B += J('torse', P('M98 98 Q 122 88 148 96 L 154 150 L 96 152 Q 92 124 98 98 Z', d.g(vert)) +
    P('M101 102 Q 124 94 147 100 L 151 148 L 99 150 Q 95 126 101 102 Z', d.g(cuir)) +
    F('M101 102 Q 106 100 112 100 L 108 150 L 99 150 Q 95 126 101 102 Z', sombre(cuir, .35), ' opacity=".8"') +
    P('M116 99 L 128 124 L 140 97 Z', d.g(vert)) + L('M120 106 L 134 110 M122 113 L 132 116 M134 106 L 121 111', '#efe0b8', 1.5) +
    couture('M105 108 Q 102 128 103 146', '#e0b484') + couture('M144 104 L 147 146', '#e0b484') +
    L('M150 101 L 153 148', LUNE, 2, ' opacity=".55"') +
    L('M106 100 L 150 146', O, 8) + L('M106 100 L 150 146', '#5e3a22', 4.5) + rivets([[114, 109], [126, 121], [138, 133]]) +
    L('M96 146 Q 124 154 154 144', O, 9) + L('M96 146 Q 124 154 154 144', '#5a361f', 5.5) + P('M119 144 L 131 144 L 131 155 L 119 155 Z', '#d9b46a') + L('M122 149 L 129 149', O, 2) +
    P('M98 152 L 114 152 L 114 168 Q 106 172 98 168 Z', d.g('#7a4a28')) + C(106, 157, 2, '#d9b46a', ' stroke="' + O + '" stroke-width="1"') +
    P('M150 152 L 168 182 L 174 179 L 156 149 Z', d.g('#4e2e18')) +
    '<g data-dague-ceinture>' + P('M144 147 L 150 137 L 155 140 L 149 150 Z', '#3a2a1a') + P('M141 148 L 156 146 L 157 151 L 142 153 Z', '#c9a35a') + '</g>' + amulette(d, 127, 115) + rep('amulette', 127, 115));
  /* devant : l'arc dans la main loin, la tête, le col */
  var arc = L('M126 103 Q 172 185 126 267', O, 11) + L('M126 103 Q 172 185 126 267', '#8a5a2e', 6) + L('M130 112 Q 166 185 130 258', '#d29a5a', 1.6) +
    P('M142 170 L 154 170 L 155 200 L 143 200 Z', d.g('#5a361f')) + L('M142 177 L 155 178 M142 185 L 155 186 M143 193 L 155 193', '#c9a35a', 1.3) +
    P('M121 98 L 129 101 L 128 109 L 122 106 Z', '#d9b46a') + P('M121 272 L 129 269 L 128 261 L 122 264 Z', '#d9b46a') +
    rep('arcH', 126, 103) + rep('arcB', 126, 267) + rep('poignee', 148, 180);
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, '#c9a35a') + rep('tete', 124, 40) + rep('teteC', 128, 60) + rep('nez', 152, 66)) + col(d, 124, 58, capu));
  B += J('torse', J('brasA', '<g class="haAv">' + seg(x, 106, 141, 17, 14, d.gh(vert)) + '</g>' +
      J('avantBrasA', '<g class="haAv">' + seg(x, 140, 179, 14.5, 12.5, d.gh(cuir)) + '</g>' +
        J('mainA', J('arc', arc, [148, 185]) + poing(d, x, 185, 8.5, pe[1])))));
  /* la corde et la flèche encochée (calculées à chaque image) */
  B += J('torse', '<path data-corde fill="none" stroke="#f3e7cb" stroke-width="1.8" stroke-linecap="round"/>' +
    '<g data-fleche style="display:none"><g data-fl>' + flecheDessin() + rep('flN', 0, 0) + rep('flP', 124, 0) + '</g></g>');
  /* bras proche : brassard, coudière ; la dague cachée dans la main */
  var xb = SQ.brasB[0];
  B += J('torse', J('brasB', seg(xb, 108, 143, 18, 15, d.gh(vert)) + L('M' + (xb + 5) + ' 112 L ' + (xb + 4) + ' 138', LUNE, 1.4, ' opacity=".45"') +
    J('avantBrasB', seg(xb, 142, 181, 15, 13, d.gh(vert)) + P('M' + (xb - 8) + ' 150 L ' + (xb + 8) + ' 150 L ' + (xb + 7.5) + ' 176 L ' + (xb - 7.5) + ' 176 Z', d.g(cuir)) +
      L('M' + (xb - 8) + ' 158 L ' + (xb + 8) + ' 158 M' + (xb - 7.5) + ' 168 L ' + (xb + 7.5) + ' 168', cuirF, 2) + couture('M' + (xb + 4) + ' 151 L ' + (xb + 4) + ' 175', '#e0b484') +
      epaulette(xb, 142, d.g(cuir)) + rivets([[xb - 2, 139], [xb + 3, 145]]) +
      J('mainB', '<g data-dague-main style="display:none">' +
          L('M' + (xb + 4) + ' 187 L ' + (xb + 44) + ' 187', O, 7) + F('M' + (xb + 6) + ' 183.5 L ' + (xb + 40) + ' 184 L ' + (xb + 48) + ' 187 L ' + (xb + 40) + ' 190 L ' + (xb + 6) + ' 190.5 Z', '#dfe6f2', ' stroke="' + O + '" stroke-width="2.4"') +
          L('M' + (xb + 9) + ' 186 L ' + (xb + 40) + ' 186', '#fff', 1.2, ' opacity=".8"') + P('M' + (xb + 3) + ' 179 L ' + (xb + 7) + ' 179 L ' + (xb + 7) + ' 195 L ' + (xb + 3) + ' 195 Z', '#c9a35a', ' stroke-width="2"') +
          L('M' + (xb - 10) + ' 187 L ' + (xb + 2) + ' 187', '#3a2a1a', 5) + rep('lame', xb + 46, 187) + '</g>' +
        poing(d, xb, 187, 8.5, pe[1]) + rep('pince', xb + 2, 184)))));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="52" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
      {nom:'cape', type:'tissu', dos:[[100, 100], [84, 152], [70, 208]], devant:[[118, 104], [108, 156], [98, 212]], k:60, c:3, g:420, vent:1,
        chemins:[{f:d.g(sombre(capu, .15)), contour:true}, {f:sombre(capu, .45), o:.7, zone:[0, .22, .06, 1]},
          {s:sombre(capu, .55), w:2, ligne:['u', .4, .1, .97]}, {s:sombre(capu, .5), w:1.6, ligne:['u', .7, .12, .98]},
          {s:'#c9a35a', w:1.4, o:.6, ligne:['v', .9, .03, .97], tirets:1}]},
      {nom:'jupe', type:'jupe', haut:[[96, 147], [153, 145]], bas:[[88, 190], [170, 188]], jambe:'cuisse', yJ:190, k:90, c:9,
        chemins:[{f:d.g(vert), contour:true}, {f:sombre(vert, .35), o:.8, zone:[0, .22, 0, 1]},
          {s:sombre(vert, .5), w:2, ligne:['u', .6, .06, .99]}, {s:clair(vert, .45), w:1.3, o:.75, ligne:['v', .86, .03, .97], tirets:1},
          {s:LUNE, w:1.8, o:.45, ligne:['u', .985, .05, .95]}]}
    ].concat(lk.fille ? [{nom:'queue', type:'meche', pts:[[98, 42], [84, 50], [74, 64], [68, 80], [64, 98]], larg:[10, 11, 10, 7, 2], k:30, c:3.6, g:500,
      f:d.g(ch[1]), traits:[[ch[0], 2.4, .8, -.25], [ch[2], 2, .6, .3]], noeud:'#2f8050'}] : []);
  return {svg:d.svg(corps, grain), souples:so};
}

/* un gant ouvert (doigts écartés), au repos les doigts pointent vers le bas */
function gantOuvert(d, x, y, c){
  var s = '';
  [[-26, 10], [-6, 12.5], [14, 11.5], [32, 9]].forEach(function(f){ s += '<g transform="rotate(' + f[0] + ' ' + x + ' ' + y + ')">' + seg(x, y + 4, y + 4 + f[1], 5, 4.2, d.gh(c)) + '</g>'; });
  s += '<g transform="rotate(-78 ' + x + ' ' + y + ')">' + seg(x, y + 2, y + 12, 5.6, 4.6, d.gh(c)) + '</g>';
  return s + main(d, x, y, 8.5, c);
}
/* une fiole tenue droite au-dessus du poing (hx, hy) ; id pour changer sa couleur */
function fioleTenue(d, hx, hy, id, coul, k){
  k = k || 1;
  var t = function(p){ return T(p.replace(/(-?\d+(?:\.\d+)?)/g, function(v){ return +v * k; }), hx, hy); };
  d.defs.push('<radialGradient id="' + id + 'h"><stop offset="0" stop-color="#fff6c0" stop-opacity=".9"/><stop offset=".4" stop-color="' + coul + '" stop-opacity=".55"/><stop offset="1" stop-color="' + coul + '" stop-opacity="0"/></radialGradient>');
  return '<g data-fiole="' + id + '">' +
    '<circle data-halo cx="' + hx + '" cy="' + (hy - 20 * k) + '" r="' + (30 * k) + '" fill="url(#' + id + 'h)" opacity=".7"/>' +
    P(t('M-6 -38 L 6 -38 L 6 -30 C 18 -26 20 -10 10 -4 C 4 0 -4 0 -10 -4 C -20 -10 -18 -26 -6 -30 Z'), '#dff4ff', ' fill-opacity=".38"') +
    '<g data-liq class="haJ" style="transform-origin:' + hx + 'px ' + (hy - 2 * k) + 'px">' + F(t('M-15 -19 C -8 -23 8 -23 15 -19 C 16 -10 10 -4 0 -3 C -10 -4 -16 -10 -15 -19 Z'), coul, ' data-coul') +
      F(t('M-12 -17 C -6 -20 6 -20 12 -17 C 10 -14 -10 -14 -12 -17 Z'), '#fff', ' opacity=".35"') + '</g>' +
    '<g data-bulles></g>' +
    L(t('M-10 -26 Q -8 -31 -2 -32'), '#fff', 2.4 * k, ' opacity=".85"') + C(hx + 8 * k, hy - 12 * k, 1.6 * k, '#fff', ' opacity=".6"') +
    P(t('M-8 -44 L 8 -44 L 8 -37 L -8 -37 Z'), '#8a5a32', ' stroke-width="' + (2.6 * k) + '"') +
    rep(id + 'bec', hx, hy - 40 * k) + rep(id + 'c', hx, hy - 16 * k) + '</g>';
}

/* ============ l'Alchimiste ============ */
function alchimiste(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var pr = '#5e3a96', capu = '#4e2f86', cuir = '#7a5232', gant = '#5a3a26', pant = '#3e3448', bt = '#6e4428', or = '#d9b46a';
  var B = '', x = SQ.brasA[0], xb = SQ.brasB[0];
  /* couche 0 : les pans de la veste, la pointe de la capuche */
  B += J('torse', '<g data-souple="pans"></g>' + J('tete', '<g data-souple="pointe"></g>'));
  var genou = function(xx, k){ return k ? '' : P('M' + (xx - 10) + ' 224 L ' + (xx + 10) + ' 222 L ' + (xx + 11) + ' 238 L ' + (xx - 9) + ' 240 Z', d.g(cuir)) + rivets([[xx - 4, 230], [xx + 5, 229]]); };
  B += jambe(d, 'A', pant, bt, genou);
  /* bras loin, derrière le corps : manche violette, revers d'or, gant ouvert */
  var brasA = function(av){
    var w = av ? function(c){ return '<g class="haAv">' + c + '</g>'; } : function(c){ return c; };
    return J('brasA', w(seg(x, 106, 141, 17.5, 15, d.gh(pr)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', LUNE, 1.4, ' opacity=".45"')) +
      J('avantBrasA', w(seg(x, 140, 179, 15, 13, d.gh(pr)) + bande(x, 166, 16, 10, or)) +
        J('mainA', av ? '<g data-louche-main style="display:none">' + L('M' + (x + 4) + ' 187 L ' + (x + 42) + ' 187', O, 7.5) + L('M' + (x + 4) + ' 187 L ' + (x + 42) + ' 187', '#a8763e', 3.6) +
            P('M' + (x + 38) + ' 183 Q ' + (x + 50) + ' 202 ' + (x + 63) + ' 183 Z', d.g('#b9c2d0')) + L('M' + (x + 44) + ' 188 Q ' + (x + 50) + ' 194 ' + (x + 56) + ' 189', '#fff', 1.4, ' opacity=".7"') + rep('louche', x + 52, 196) + '</g>' +
            '<g data-fiole-main style="display:none">' + fioleTenue(d, x, 182, 'hfA' + (++uid), '#5fd08a', 0.78) + '</g>' +
            '<g data-herbes-main style="display:none">' + C(x + 2, 178, 12, '#8aff9a', ' opacity=".35" filter="' + d.flou(3) + '"') +
              P('M' + (x - 6) + ' 180 Q ' + (x - 2) + ' 166 ' + (x + 6) + ' 170 Q ' + (x + 2) + ' 178 ' + (x - 6) + ' 180 Z', '#5fd08a', ' stroke-width="2"') +
              P('M' + (x + 2) + ' 180 Q ' + (x + 12) + ' 168 ' + (x + 14) + ' 176 Q ' + (x + 8) + ' 182 ' + (x + 2) + ' 180 Z', '#8ae07a', ' stroke-width="2"') + '</g>' +
            '<g data-gantA="tient" style="display:none">' + poing(d, x, 185, 8.5, gant) + '</g><g data-gantA="ouvert">' + gantOuvert(d, x, 185, gant) + '</g>' + rep('mainA', x, 186)
          : gantOuvert(d, x, 185, gant))));
  };
  B += J('torse', brasA(false));
  B += jambe(d, 'B', pant, bt, genou);
  /* le tablier sous la ceinture (tissu souple qui pend entre les jambes) */
  B += '<g data-souple="tablier"></g>';
  /* le corps : veste matelassée, tablier de cuir roussi, bandoulière de fioles, ceinture, sacoche, petite marmite, louche */
  var band = [[112, 112, '#ff6a2a'], [121, 125, '#9aa3c8'], [130, 139, '#5fd08a']].map(function(v, i){
    return '<g data-band="' + i + '">' + P('M' + (v[0] - 4) + ' ' + (v[1] - 2) + ' L ' + (v[0] + 4) + ' ' + (v[1] - 2) + ' L ' + (v[0] + 5) + ' ' + (v[1] + 8) + ' Q ' + v[0] + ' ' + (v[1] + 12) + ' ' + (v[0] - 5) + ' ' + (v[1] + 8) + ' Z', v[2]) +
      P('M' + (v[0] - 3) + ' ' + (v[1] - 6) + ' L ' + (v[0] + 3) + ' ' + (v[1] - 6) + ' L ' + (v[0] + 3) + ' ' + (v[1] - 2) + ' L ' + (v[0] - 3) + ' ' + (v[1] - 2) + ' Z', '#8a5a32') +
      L('M' + (v[0] - 2) + ' ' + (v[1] + 1) + ' L ' + (v[0] - 2) + ' ' + (v[1] + 6), '#fff', 1.4, ' opacity=".7"') + '</g>';
  }).join('');
  B += J('torse', P('M100 102 Q 122 90 146 100 L 148 156 L 98 158 Q 92 128 100 102 Z', d.g(pr)) +
    L('M104 112 L 138 140 M102 128 L 122 146 M116 102 L 144 126 M104 146 L 140 112 M102 132 L 128 106', sombre(pr, .35), 1.3, ' opacity=".7"') +
    P('M112 104 Q 128 99 144 104 L 148 154 L 112 156 Z', d.g(cuir)) +
    F('M112 104 Q 117 102 122 102 L 120 156 L 112 156 Z', sombre(cuir, .3), ' opacity=".8"') +
    couture('M116 108 L 116 152', '#d8b07a') + couture('M141 108 L 144 152', '#d8b07a') +
    E(124, 128, 5, 3.5, '#2a1a10', ' opacity=".3"') +
    L('M146 104 L 150 154', LUNE, 2, ' opacity=".5"') +
    L('M104 100 L 144 156', O, 9) + L('M104 100 L 144 156', '#5a361f', 5.5) + band +
    L('M98 152 Q 124 160 150 150', O, 8) + L('M98 152 Q 124 160 150 150', '#5a361f', 4.5) + P('M118 152 L 128 154 L 128 163 L 118 161 Z', or) +
    P('M100 156 L 118 158 L 116 176 Q 107 180 99 174 Z', d.g('#8a5a32')) + L('M101 162 L 117 163', '#5e3a1e', 2) + C(108, 167, 2, or, ' stroke="' + O + '" stroke-width="1"') +
    '<g data-louche-ceinture>' + L('M160 150 L 168 186', O, 6.5) + L('M160 150 L 168 186', '#a8763e', 3) + P('M162 184 Q 168 200 178 186 Z', d.g('#b9c2d0'), ' stroke-width="2.4"') + '</g>' +
    J('marmite', L('M142 154 Q 150 146 158 154', O, 2.4) + P('M137 162 L 163 162 Q 167 182 150 186 Q 133 182 137 162 Z', d.g('#4a4458')) +
      E(150, 162, 14, 4, '#2a2436', ' stroke="' + O + '" stroke-width="2.6"') + L('M137 162 Q 150 168 163 162', '#c87a3a', 2.4) +
      L('M141 168 Q 142 178 148 182', '#8a84a0', 1.6, ' opacity=".7"') + rep('marmite', 150, 174), [150, 152]) + sacoche(d) + amulette(d, 127, 174, true) + rep('amulette', 127, 174));
  /* devant : la main loin (fiole, louche, herbes), la tête, les lunettes d'alchimiste, le col */
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, or) +
      L(T('M-26 -22 C -10 -30 20 -32 36 -24', 124, 58), O, 6) + L(T('M-26 -22 C -10 -30 20 -32 36 -24', 124, 58), '#4a2e1c', 3.5) +
      [[2, -30, 8], [21, -30, 7]].map(function(g){
        var gx = 124 + g[0], gy = 58 + g[1];
        return '<circle cx="' + gx + '" cy="' + gy + '" r="' + g[2] + '" fill="' + d.g('#3fa8c8') + '" stroke="#c9a040" stroke-width="3.5"/>' +
          '<circle cx="' + gx + '" cy="' + gy + '" r="' + (g[2] + 2) + '" fill="none" stroke="' + O + '" stroke-width="1.5"/>' +
          L('M' + (gx - 3) + ' ' + (gy - 2) + ' Q ' + (gx - 1) + ' ' + (gy - 5) + ' ' + (gx + 2) + ' ' + (gy - 5), '#e8fdff', 1.8);
      }).join('') + rep('tete', 124, 40) + rep('teteC', 128, 60)) +
    col(d, 124, 58, pr));
  B += J('torse', brasA(true));
  /* le filet de potion versée (calculé à chaque image) */
  B += J('torse', '<path data-filet fill="none" stroke-linecap="round" stroke-width="4" style="display:none"/>');
  /* bras proche : la fiole qui bouillonne */
  B += J('torse', J('brasB', seg(xb, 108, 143, 18, 15.5, d.gh(pr)) + L('M' + (xb + 5) + ' 112 L ' + (xb + 4) + ' 138', LUNE, 1.4, ' opacity=".45"') +
    J('avantBrasB', seg(xb, 142, 181, 15.5, 13.5, d.gh(pr)) + bande(xb, 168, 17, 10, or) +
      J('mainB', '<g data-fiole-b>' + fioleTenue(d, xb, 184, 'hfB' + (++uid), '#ff8a3a', 1) + '</g>' + poing(d, xb, 187, 8.5, gant) + rep('pince', xb, 187)))));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="52" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
    {nom:'pans', type:'tissu', dos:[[98, 146], [84, 186], [62, 224]], devant:[[132, 150], [136, 190], [142, 228]], k:55, c:3.2, g:420, vent:0.8, onde:2.6,
      chemins:[{f:d.g(pr), contour:true}, {f:sombre(pr, .4), o:.85, zone:[0, .3, 0, 1]}, {s:sombre(pr, .45), w:1.6, ligne:['u', .5, .08, .98]},
        {s:or, w:1.4, o:.8, ligne:['v', .9, .03, .97], tirets:1}]},
    {nom:'tablier', type:'jupe', haut:[[112, 152], [149, 151]], bas:[[110, 214], [156, 212]], jambe:'cuisse', yJ:214, k:80, c:8, milieu:true,
      chemins:[{f:d.g(cuir), contour:true}, {f:sombre(cuir, .3), o:.8, zone:[0, .18, 0, 1]}, {s:'#d8b07a', w:1.3, o:.75, ligne:['u', .12, .03, .95], tirets:1},
        {s:'#d8b07a', w:1.3, o:.75, ligne:['u', .9, .03, .95], tirets:1}, {s:'#2a1a10', w:5, o:.22, ligne:['v', .55, .45, .75]}, {s:LUNE, w:1.8, o:.4, ligne:['u', .99, .05, .95]}]},
    {nom:'pointe', type:'meche', pts:[[92, 6], [78, 2], [64, 6], [54, 16], [48, 30]], larg:[14, 11, 8, 5, 2], k:34, c:3.4, g:450,
      f:d.g(capu), traits:[[sombre(capu, .45), 1.6, .8, -.15]], noeud:or, pompon:true, rNoeud:4.5}
  ];
  return {svg:d.svg(corps, grain), souples:so};
}

/* ============ le Sage : bâton de runes dans la main proche, livre à la ceinture ============ */
function livreFerme(d, x, y, or){
  return P('M' + (x - 11) + ' ' + (y - 13) + ' L ' + (x + 11) + ' ' + (y - 14) + ' L ' + (x + 12) + ' ' + (y + 13) + ' L ' + (x - 10) + ' ' + (y + 14) + ' Z', d.g('#6a3c8a')) +
    L('M' + (x - 8) + ' ' + (y - 12) + ' L ' + (x - 7) + ' ' + (y + 13), '#f6ecd2', 2.4) +
    P('M' + (x - 11) + ' ' + (y - 13) + ' l 5 0 l -5 5 Z M' + (x + 11) + ' ' + (y - 14) + ' l -5 0 l 6 5 Z', or, ' stroke-width="1.4"') +
    L('M' + (x + 1) + ' ' + (y - 4) + ' l 3 -5 l 3 5 M' + (x + 4) + ' ' + (y - 9) + ' l 0 12', CYAN, 1.6, ' opacity=".9"');
}
function sage(lk, grain){
  var d = new Dessin(), ch = lk.ch, pe = lk.pe;
  var bleu = '#2f4c9e', capu = '#2a4290', robe = '#d8caa4', or = '#e8c062', pant = '#2e2c4a', ch0 = '#5e3a1e';
  var B = '', x = SQ.brasA[0], xb = SQ.brasB[0];
  /* couche 0 : le manteau qui flotte, la tresse du dos (ou la pointe de la capuche) */
  B += J('torse', '<g data-souple="manteau"></g>' + J('tete', '<g data-souple="tresse"></g>'));
  B += jambe(d, 'A', pant, ch0);
  var manche = function(av){
    var w = av ? function(c){ return '<g class="haAv">' + c + '</g>'; } : function(c){ return c; };
    return w(seg(x, 106, 141, 18, 16, d.gh(bleu)) + L('M' + (x + 5) + ' 110 L ' + (x + 4) + ' 136', LUNE, 1.4, ' opacity=".45"'));
  };
  var avb = function(av){
    var w = av ? function(c){ return '<g class="haAv">' + c + '</g>'; } : function(c){ return c; };
    return w(P('M' + (x - 8) + ' 140 L ' + (x + 8) + ' 140 L ' + (x + 12) + ' 176 Q ' + x + ' 182 ' + (x - 12) + ' 176 Z', d.gh(bleu)) + L('M' + (x - 12) + ' 175 Q ' + x + ' 181 ' + (x + 12) + ' 175', or, 2.6));
  };
  B += J('torse', J('brasA', manche(false) + J('avantBrasA', avb(false) + J('mainA', main(d, x, 186, 8, pe[1])))));
  B += jambe(d, 'B', pant, ch0);
  /* la robe sous la ceinture (tissu souple qui suit les jambes) */
  B += '<g data-souple="robe"></g>';
  /* le corps : robe claire, pans bleus brodés, écharpe-ceinture, bourse, livre fermé, pèlerine */
  B += J('torse', P('M98 98 Q 122 88 148 98 L 152 154 L 96 154 Z', d.g(robe)) +
    P('M98 98 Q 106 96 115 98 L 112 154 L 96 154 Z', d.g(bleu)) + P('M138 96 Q 145 97 148 98 L 152 154 L 140 154 Z', d.g(bleu)) +
    L('M112 100 L 110 154', or, 2.4) + L('M140 98 L 141 154', or, 2.4) + L('M150 110 L 152 152', LUNE, 2, ' opacity=".5"') +
    '<g data-souple="echarpe"></g>' +
    L('M96 150 Q 124 158 152 148', O, 10) + L('M96 150 Q 124 158 152 148', bleu, 6) + L('M96 148 Q 124 156 152 146', or, 1.6) +
    P('M126 156 Q 136 154 142 158 Q 144 172 134 174 Q 124 172 126 156 Z', d.g('#7a4a28')) + L('M128 158 Q 134 162 140 158', or, 1.6) +
    '<g data-livre-ceinture>' + L('M146 152 L 150 160', '#5e3a1e', 2.4) + livreFerme(d, 152, 170, or) + '</g>' +
    P('M94 96 Q 122 86 152 96 L 158 128 Q 124 140 90 128 Z', d.g(bleu)) + L('M92 126 Q 124 138 156 126', or, 2.4) +
    couture('M96 120 Q 124 130 154 120', CYAN) + L('M152 98 L 157 126', LUNE, 2, ' opacity=".55"') +
    C(124, 101, 4.5, or, ' stroke="' + O + '" stroke-width="2"') + C(124, 101, 1.8, CYAN) + amulette(d, 131, 117) + rep('amulette', 131, 117));
  /* devant : la main loin (le livre ouvert), la tête */
  var livre = '<g data-livre-main style="display:none"><g transform="translate(' + x + ' 186) scale(1.3) translate(' + (-x) + ' -186)">' +
    '<ellipse data-livre-halo cx="' + x + '" cy="170" rx="40" ry="26" fill="' + d.halo('#e8fdff', '#3fd0ff') + '" opacity="0"/>' +
    P('M' + (x - 30) + ' 160 L ' + x + ' 154 L ' + (x + 30) + ' 160 L ' + (x + 30) + ' 190 L ' + x + ' 184 L ' + (x - 30) + ' 190 Z', d.g('#6a3c8a')) +
    '<g data-couv class="haJ" style="transform-origin:' + x + 'px 170px">' + P('M' + (x - 26) + ' 162 L ' + x + ' 157 L ' + x + ' 181 L ' + (x - 26) + ' 186 Z', '#f6ecd2') +
      L('M' + (x - 22) + ' 166 L ' + (x - 4) + ' 163 M' + (x - 22) + ' 171 L ' + (x - 6) + ' 168 M' + (x - 22) + ' 176 L ' + (x - 4) + ' 173', '#2ab0e0', 1.6) + '</g>' +
    P('M' + x + ' 157 L ' + (x + 26) + ' 162 L ' + (x + 26) + ' 186 L ' + x + ' 181 Z', '#fff8e6') +
    L('M' + (x + 4) + ' 163 L ' + (x + 22) + ' 166 M' + (x + 4) + ' 168 L ' + (x + 20) + ' 171 M' + (x + 4) + ' 173 L ' + (x + 22) + ' 176', '#2ab0e0', 1.6) +
    [0, 1, 2].map(function(k){ return '<path data-page="' + k + '" class="haJ" style="transform-origin:' + x + 'px 170px;opacity:0" d="M' + x + ' 157 L ' + (x + 25) + ' 161.5 L ' + (x + 25) + ' 185.5 L ' + x + ' 181 Z" fill="' + (k % 2 ? '#fffaf0' : '#f2e6c8') + '" stroke="' + O + '" stroke-width="2"/>'; }).join('') +
    '<g data-lueur-pages style="opacity:0">' + F('M' + (x - 26) + ' 162 L ' + x + ' 157 L ' + (x + 26) + ' 162 L ' + (x + 26) + ' 186 L ' + x + ' 181 L ' + (x - 26) + ' 186 Z', CYAN, ' opacity=".45" filter="' + d.flou(2.5) + '"') + '</g>' +
    rep('livre', x, 160) + '</g></g>';
  B += J('torse', J('tete', capucheFond(d, 124, 58, capu) + visage(d, 124, 58, lk, {lunettes:lk.lunettes}) + meche(d, 124, 58, ch) + capuche(d, 124, 58, capu, or) +
      '<g data-souple="tresse2"></g>' + rep('tete', 124, 40) + rep('teteC', 128, 60)));
  B += J('torse', J('brasA', manche(true) + J('avantBrasA', avb(true) + J('mainA', livre + '<g class="haAv">' + main(d, x, 186, 8, pe[1]) + '</g>'))));
  /* bras proche : le bâton de runes */
  var top = 187 - 122, bas = 187 + 132;
  var baton = L('M' + xb + ' ' + (top + 14) + ' L ' + xb + ' ' + bas, O, 10) + L('M' + xb + ' ' + (top + 14) + ' L ' + xb + ' ' + bas, '#4a3020', 6) +
    L('M' + (xb + 1.5) + ' ' + (top + 20) + ' L ' + (xb + 1.5) + ' ' + (bas - 6), '#7a5638', 1.6, ' opacity=".8"') +
    L('M' + (xb - 1) + ' ' + (top + 60) + ' l 0 14 M' + (xb - 1.5) + ' ' + (top + 150) + ' l 0 22', '#2a1a10', 1.4) +
    P('M' + (xb - 6) + ' ' + (top + 34) + ' L ' + (xb + 6) + ' ' + (top + 34) + ' L ' + (xb + 6) + ' ' + (top + 41) + ' L ' + (xb - 6) + ' ' + (top + 41) + ' Z', or, ' stroke-width="2"') +
    P('M' + (xb - 6) + ' ' + (bas - 10) + ' L ' + (xb + 6) + ' ' + (bas - 10) + ' L ' + (xb + 4) + ' ' + bas + ' L ' + (xb - 4) + ' ' + bas + ' Z', or, ' stroke-width="2"') +
    /* la tête du bâton : une crosse qui tient le cristal */
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb - 2) + ' ' + (top - 2) + ' ' + (xb - 18) + ' ' + (top - 8) + ' ' + (xb - 20) + ' ' + (top + 6) + ' C ' + (xb - 21) + ' ' + (top + 14) + ' ' + (xb - 12) + ' ' + (top + 16) + ' ' + (xb - 10) + ' ' + (top + 9), O, 10) +
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb - 2) + ' ' + (top - 2) + ' ' + (xb - 18) + ' ' + (top - 8) + ' ' + (xb - 20) + ' ' + (top + 6) + ' C ' + (xb - 21) + ' ' + (top + 14) + ' ' + (xb - 12) + ' ' + (top + 16) + ' ' + (xb - 10) + ' ' + (top + 9), '#4a3020', 6) +
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb + 4) + ' ' + (top + 2) + ' ' + (xb + 14) + ' ' + (top - 2) + ' ' + (xb + 14) + ' ' + (top - 12), O, 8) +
    L('M' + xb + ' ' + (top + 18) + ' C ' + (xb + 4) + ' ' + (top + 2) + ' ' + (xb + 14) + ' ' + (top - 2) + ' ' + (xb + 14) + ' ' + (top - 12), '#4a3020', 4.5) +
    cristalLune(d, xb + 2, top - 2) +
    '<g data-cristal class="haJ" style="transform-origin:' + (xb + 2) + 'px ' + (top - 2) + 'px">' +
      '<circle data-cr-halo cx="' + (xb + 2) + '" cy="' + (top - 2) + '" r="30" fill="' + d.halo('#e8fdff', '#3fd0ff') + '" opacity=".75"/>' +
      P('M' + (xb + 2) + ' ' + (top - 20) + ' L ' + (xb + 11) + ' ' + (top - 4) + ' L ' + (xb + 2) + ' ' + (top + 12) + ' L ' + (xb - 7) + ' ' + (top - 4) + ' Z', d.g('#5fe0ff', 1.3)) +
      F('M' + (xb + 2) + ' ' + (top - 20) + ' L ' + (xb + 11) + ' ' + (top - 4) + ' L ' + (xb + 2) + ' ' + (top - 2) + ' Z', '#e8fdff', ' opacity=".75"') +
      L('M' + (xb - 1) + ' ' + (top - 8) + ' l 3 -5 l 3 5 M' + (xb + 2) + ' ' + (top - 13) + ' l 0 12', '#fff', 1.6) +
      C(xb + 2, top - 2, 3, '#fff', ' opacity=".8"') + '</g>' + cristalLune(d, xb + 2, top - 2, true) + rep('cristal', xb + 2, top - 2) + rep('baton-bas', xb, bas);
  B += J('torse', J('brasB', seg(xb, 108, 143, 18, 16, d.gh(bleu)) + L('M' + (xb + 5) + ' 112 L ' + (xb + 4) + ' 138', LUNE, 1.4, ' opacity=".45"') +
    J('avantBrasB', P('M' + (xb - 8) + ' 142 L ' + (xb + 8) + ' 142 L ' + (xb + 12) + ' 178 Q ' + xb + ' 184 ' + (xb - 12) + ' 178 Z', d.gh(bleu)) + L('M' + (xb - 12) + ' 177 Q ' + xb + ' 183 ' + (xb + 12) + ' 177', or, 2.6) +
      J('mainB', baton + batonChene(d, xb, top, bas) + poing(d, xb, 188, 8, pe[1])))));
  var corps = '<ellipse data-ombre cx="125" cy="293" rx="56" ry="8" fill="#000" opacity=".35"/>' + J('racine', J('bassin', B));
  var so = [
    {nom:'manteau', type:'tissu', dos:[[98, 100], [74, 192], [50, 286]], devant:[[114, 102], [104, 194], [96, 288]], k:46, c:2.8, g:420, vent:1, onde:3,
      chemins:[{f:d.g(sombre(capu, .2)), contour:true}, {f:sombre(capu, .5), o:.6, zone:[0, .25, .05, 1]}, {s:sombre(capu, .55), w:1.8, ligne:['u', .45, .08, .98]},
        {s:or, w:2, o:.8, ligne:['v', .95, .02, .98]}]},
    {nom:'robe', type:'jupe', haut:[[96, 152], [152, 151]], bas:[[64, 286], [182, 284]], jambe:'tibia', yJ:268, k:70, c:7,
      chemins:[{f:d.g(robe), contour:true}, {s:sombre(robe, .3), w:2.2, ligne:['u', .42, .1, .98]}, {s:sombre(robe, .3), w:2.2, ligne:['u', .62, .15, .98]},
        {f:d.g(bleu), zone:[0, .17, 0, 1]}, {f:d.g(bleu), zone:[.84, 1, 0, 1]}, {s:or, w:2.4, ligne:['u', .17, 0, .99]}, {s:or, w:2.4, ligne:['u', .84, 0, .99]},
        {s:or, w:3, ligne:['v', .985, .01, .99]}, {s:CYAN, w:1.3, o:.75, ligne:['v', .94, .02, .98], tirets:1}, {s:LUNE, w:2, o:.5, ligne:['u', .9, .05, .95]}]},
    {nom:'echarpe', type:'meche', pts:[[102, 152], [94, 166], [86, 182], [80, 198]], larg:[10, 9, 7, 4], k:40, c:3.5, g:400, f:d.g(bleu), traits:[[or, 1.4, .9, .3]], noeud:or, pompon:true, rNoeud:4}
  ];
  if(lk.fille){
    so.push({nom:'tresse', type:'tresse', pts:[[86, 92], [82, 120], [78, 148], [74, 176]], n:6, pasT:15, k:40, c:3.4, g:450, f:d.g(ch[1]), trait:ch[0], bout:or});
    so.push({nom:'tresse2', type:'tresse', pts:[[106, 92], [105, 116], [104, 140], [103, 164]], n:5, pasT:15, k:46, c:3.6, g:450, f:d.g(ch[1]), trait:ch[0], bout:or});
  } else so.push({nom:'tresse', type:'meche', pts:[[92, 6], [78, 2], [64, 6], [54, 16], [48, 30]], larg:[14, 11, 8, 5, 2], k:34, c:3.4, g:450, f:d.g(capu), traits:[[sombre(capu, .45), 1.6, .8, -.15]], noeud:or, pompon:true, rNoeud:4.5});
  return {svg:d.svg(corps, grain), souples:so};
}

/* ============ les tissus et les cheveux souples (simulés à chaque image) ============ */
/* chaque point a un ressort vers sa place « dessinée » (qui suit le corps), l'air le freine, la pesanteur le tire */
/* la matrice d'un élément vers les pixels de la boîte du héros (cuit : calculée par cuire.js à travers les <div>) */
function mat(el){
  if(CACHE_MAT && CACHE_MAT.has(el)) return CACHE_MAT.get(el);
  var r;
  if(window.Cuire && el.closest && el.closest('.cu-vue')) r = window.Cuire.ctm(el);
  else { var m = el.getCTM(); r = m ? [m.a, m.b, m.c, m.d, m.e, m.f] : [1, 0, 0, 1, 0, 0]; }
  if(CACHE_MAT) CACHE_MAT.set(el, r);
  return r;
}
function ap(m, x, y){ return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
function inv(m){ var det = m[0] * m[3] - m[1] * m[2] || 1e-6; return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det]; }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
/* une courbe lisse (Catmull-Rom) qui passe par tous les points */
function lisse(p, ferme){
  var n = p.length; if(n < 2) return '';
  var s = 'M' + r1(p[0][0]) + ' ' + r1(p[0][1]);
  var last = ferme ? n : n - 1;
  for(var i = 0; i < last; i++){
    var p0 = p[ferme ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[ferme ? (i + 2) % n : Math.min(i + 2, n - 1)];
    s += ' C ' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + r1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + r1(p2[0]) + ' ' + r1(p2[1]);
  }
  return s + (ferme ? ' Z' : '');
}
var SVGNS = 'http://www.w3.org/2000/svg';
function nouveau(parent, tag, at){ var e = document.createElementNS(SVGNS, tag); for(var k in at) e.setAttribute(k, at[k]); parent.appendChild(e); return e; }

function Souple(h, spec){
  this.h = h; this.s = spec; this.t = Math.random() * 10;
  this.g = h.svg.querySelector('[data-souple="' + spec.nom + '"]');
  var me = this;
  if(spec.type === 'meche'){
    this.ch = [spec.pts.map(function(p){ return {r:p}; })];
    this.els = [nouveau(this.g, 'path', {fill:spec.f, stroke:O, 'stroke-width':3, 'stroke-linejoin':'round'})];
    (spec.traits || []).forEach(function(t){ me.els.push(nouveau(me.g, 'path', {fill:'none', stroke:t[0], 'stroke-width':t[1], opacity:t[2], 'stroke-linecap':'round'})); });
    if(spec.noeud) this.noeud = nouveau(this.g, 'circle', {r:spec.rNoeud || 5, fill:spec.noeud, stroke:O, 'stroke-width':2.4});
  } else if(spec.type === 'tresse'){
    this.ch = [spec.pts.map(function(p){ return {r:p}; })];
    this.els = [];
    for(var k = 0; k < spec.n; k++){
      var gg = nouveau(this.g, 'g', {});
      nouveau(gg, 'ellipse', {rx:7, ry:9, fill:spec.f, stroke:O, 'stroke-width':2.6});
      nouveau(gg, 'path', {d:'M-3 -4 q 3 3 6 0', fill:'none', stroke:spec.trait, 'stroke-width':1.6, opacity:.7});
      this.els.push(gg);
    }
    this.bout = nouveau(this.g, 'circle', {r:4, fill:spec.bout, stroke:O, 'stroke-width':2});
  } else {
    var dos = spec.dos || [spec.haut[0], lerp(spec.haut[0], spec.bas[0], .5), spec.bas[0]];
    var dev = spec.devant || [spec.haut[1], lerp(spec.haut[1], spec.bas[1], .5), spec.bas[1]];
    this.ch = [dos.map(function(p){ return {r:p}; }), dev.map(function(p){ return {r:p}; })];
    this.els = spec.chemins.map(function(c){
      var at = {fill:c.f || 'none'};
      if(c.contour){ at.stroke = O; at['stroke-width'] = 3; at['stroke-linejoin'] = 'round'; }
      if(c.s){ at.stroke = c.s; at['stroke-width'] = c.w; at['stroke-linecap'] = 'round'; }
      if(c.tirets) at['stroke-dasharray'] = '3 3';
      if(c.o) at.opacity = c.o;
      return nouveau(me.g, 'path', at);
    });
  }
  /* les longueurs de repos */
  this.ch.forEach(function(c){ for(var i = 1; i < c.length; i++) c[i].L = Math.hypot(c[i].r[0] - c[i - 1].r[0], c[i].r[1] - c[i - 1].r[1]); });
  this.init = false;
}
/* lire (avant toute écriture de l'image) les repères dont pas() aura besoin */
Souple.prototype.lire = function(){
  mat(this.g);
  if(this.s.type === 'jupe'){
    if(!this.jA){ this.jA = this.h.svg.querySelector('[data-i="' + this.s.jambe + 'A"]'); this.jB = this.h.svg.querySelector('[data-i="' + this.s.jambe + 'B"]'); }
    mat(this.jA); mat(this.jB);
  }
};
Souple.prototype.pas = function(dt, o, sol){
  var s = this.s, me = this, h = this.h;
  this.t += dt;
  var Mf = mat(this.g), M = Mf, sc = Math.hypot(M[0], M[1]);
  /* une jupe se calcule dans le repère du bassin (pas de vent de course), un tissu dans le monde */
  if(s.type === 'jupe'){ M = [1, 0, 0, 1, 0, 0]; o = [0, 0]; sc = 1; sol = 1e9; }
  var W = function(p){ var q = ap(M, p[0], p[1]); return [q[0] + o[0], q[1] + o[1]]; };
  /* la jupe : le bas suit les jambes */
  var cible = null;
  if(s.type === 'jupe'){
    if(!this.jA){ this.jA = h.svg.querySelector('[data-i="' + s.jambe + 'A"]'); this.jB = h.svg.querySelector('[data-i="' + s.jambe + 'B"]'); }
    var jA = this.jA, jB = this.jB, Mfi = inv(Mf);
    var a = ap(mat(jA), SQ.cuisseA[0], s.yJ), b = ap(mat(jB), SQ.cuisseB[0], s.yJ);
    a = ap(Mfi, a[0], a[1]); b = ap(Mfi, b[0], b[1]);
    var ar = a[0] < b[0] ? a : b, av = a[0] < b[0] ? b : a;
    if(s.milieu){ var mi = lerp(a, b, .5); ar = [mi[0] - 10, mi[1]]; av = [mi[0] + 10, mi[1]]; }
    var oa = [s.bas[0][0] - SQ.cuisseA[0], s.bas[0][1] - s.yJ], ob = [s.bas[1][0] - SQ.cuisseB[0], s.bas[1][1] - s.yJ];
    cible = [[ar[0] + oa[0], Math.max(ar[1], av[1] - 6) + oa[1]], [av[0] + ob[0], Math.max(av[1], ar[1] - 6) + ob[1]]];
  }
  var vent = (s.vent || 0) * (h._calme ? 1 : 0.5);
  this.ch.forEach(function(c, ci){
    var n = c.length - 1;
    c.forEach(function(p, i){
      var w = W(p.r);
      if(cible && i === n) w = cible[ci];
      if(cible && i > 0 && i < n){ var a0 = W(c[0].r), b0 = cible[ci]; w = [(a0[0] + b0[0]) / 2 + (ci ? 2 : -3) * sc, (a0[1] + b0[1]) / 2]; }
      if(!me.init || i === 0){ p.x = w[0]; p.y = w[1]; p.vx = 0; p.vy = 0; return; }
      var f = i / n, k = s.k * (1 - 0.45 * f), c2 = s.c * (0.7 + 0.6 * f);
      var ax = k * (w[0] - p.x) - c2 * p.vx, ay = k * (w[1] - p.y) - c2 * p.vy + (s.g || 0) * sc;
      if(vent){ ax += vent * 70 * sc * f * (Math.sin(me.t * 1.9 + i * 0.9 + ci) + 0.55 * Math.sin(me.t * 3.3 + i * 1.7)); ay += vent * 18 * sc * f * Math.sin(me.t * 2.6 + i); }
      p.vx += ax * dt; p.vy += ay * dt;
      p.px = p.x; p.py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;
    });
    /* les longueurs (un tissu ne s'étire pas ; une jupe un peu) */
    if(me.init) for(var i = 1; i <= n; i++){
      var p = c[i], q = c[i - 1], dx = p.x - q.x, dy = p.y - q.y, dd = Math.hypot(dx, dy) || 1e-3, L = p.L * sc;
      var t = s.type === 'jupe' ? (dd > L * 1.35 ? L * 1.35 : dd < L * 0.7 ? L * 0.7 : dd) : L;
      p.x = q.x + dx / dd * t; p.y = q.y + dy / dd * t;
      if(p.y > sol){ p.y = sol; p.vx *= 0.85; }
      p.vx = (p.x - p.px) / dt; p.vy = (p.y - p.py) / dt;
    }
  });
  this.init = true;
  /* retour dans le repère de la pièce, puis le dessin */
  var Mi = inv(M), loc = this.ch.map(function(c){ return c.map(function(p){ return ap(Mi, p.x - o[0], p.y - o[1]); }); });
  /* on ne redessine (et donc on ne repeint) le tissu que s'il a bougé d'au moins 0,15 unité depuis le dernier dessin */
  /* (l'ourlet d'un tissu ondule avec le temps : il est redessiné au moins 10 fois par seconde) */
  var av = this._dessine, bouge = !av || (s.type === 'tissu' && this.t - (this._tDessin || 0) > .1);
  for(var a = 0; av && !bouge && a < loc.length; a++) for(var b = 0; b < loc[a].length; b++){
    if(Math.abs(loc[a][b][0] - av[a][b][0]) > .15 || Math.abs(loc[a][b][1] - av[a][b][1]) > .15){ bouge = true; break; }
  }
  if(!bouge) return;
  this._dessine = loc; this._tDessin = this.t;
  this.dessiner(loc);
};
Souple.prototype.dessiner = function(loc){
  var s = this.s, me = this;
  if(s.type === 'meche' || s.type === 'tresse'){
    /* l'épine, échantillonnée */
    var c = loc[0], ep = [], la = [];
    for(var i = 0; i < c.length - 1; i++){
      var p0 = c[Math.max(i - 1, 0)], p1 = c[i], p2 = c[i + 1], p3 = c[Math.min(i + 2, c.length - 1)];
      for(var k = 0; k < 4; k++){
        var t = k / 4, t2 = t * t, t3 = t2 * t;
        ep.push([0, 1].map(function(j){ return 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); }));
        if(s.larg) la.push(s.larg[i] + (s.larg[i + 1] - s.larg[i]) * t);
      }
    }
    ep.push(c[c.length - 1]); if(s.larg) la.push(s.larg[s.larg.length - 1]);
    var nor = ep.map(function(p, i){ var a = ep[Math.max(i - 1, 0)], b = ep[Math.min(i + 1, ep.length - 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    if(s.type === 'meche'){
      var g = [], d = [];
      ep.forEach(function(p, i){ g.push([p[0] + nor[i][0] * la[i] / 2, p[1] + nor[i][1] * la[i] / 2]); d.unshift([p[0] - nor[i][0] * la[i] / 2, p[1] - nor[i][1] * la[i] / 2]); });
      this.els[0].setAttribute('d', lisse(g.concat(d), true));
      (s.traits || []).forEach(function(t, k){
        var pts = ep.slice(2, ep.length - 3).map(function(p, i){ var j = i + 2; return [p[0] + nor[j][0] * la[j] * t[3], p[1] + nor[j][1] * la[j] * t[3]]; });
        me.els[k + 1].setAttribute('d', lisse(pts, false));
      });
      if(this.noeud){ var ni = s.pompon ? ep.length - 1 : 2; this.noeud.setAttribute('cx', r1(ep[ni][0])); this.noeud.setAttribute('cy', r1(ep[ni][1])); }
    } else {
      /* la tresse : des maillons le long de l'épine */
      var cum = [0]; for(var i = 1; i < ep.length; i++) cum.push(cum[i - 1] + Math.hypot(ep[i][0] - ep[i - 1][0], ep[i][1] - ep[i - 1][1]));
      var tot = cum[cum.length - 1], j = 0;
      this.els.forEach(function(el, k){
        var at = Math.min(k * s.pasT, tot);
        while(j < cum.length - 2 && cum[j + 1] < at) j++;
        var u = (at - cum[j]) / ((cum[j + 1] - cum[j]) || 1), x = ep[j][0] + (ep[j + 1][0] - ep[j][0]) * u, y = ep[j][1] + (ep[j + 1][1] - ep[j][1]) * u;
        var an = Math.atan2(ep[j + 1][1] - ep[j][1], ep[j + 1][0] - ep[j][0]) * 180 / Math.PI - 90;
        el.setAttribute('transform', 'translate(' + r1(x) + ' ' + r1(y) + ') rotate(' + r1(an) + ') scale(' + (1 - k * 0.04) + ')');
      });
      var fin = Math.min(this.els.length * s.pasT - 4, tot);
      while(j < cum.length - 2 && cum[j + 1] < fin) j++;
      var u2 = (fin - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
      this.bout.setAttribute('cx', r1(ep[j][0] + (ep[j + 1][0] - ep[j][0]) * u2)); this.bout.setAttribute('cy', r1(ep[j][1] + (ep[j + 1][1] - ep[j][1]) * u2));
    }
    return;
  }
  /* un tissu : on passe de (u, v) au dessin ; u va du bord arrière au bord avant, v du haut vers le bas */
  var B = loc[0], Fv = loc[1], t = this.t;
  function bord(c, v){ var q = [2 * c[1][0] - (c[0][0] + c[2][0]) / 2, 2 * c[1][1] - (c[0][1] + c[2][1]) / 2], a = (1 - v) * (1 - v), b = 2 * v * (1 - v), e = v * v; return [a * c[0][0] + b * q[0] + e * c[2][0], a * c[0][1] + b * q[1] + e * c[2][1]]; }
  var ond = s.onde === undefined ? 2.2 : s.onde;
  function M(u, v){
    var p = lerp(bord(B, v), bord(Fv, v), u);
    if(v > 0.85){ var w = (v - 0.85) / 0.15; p[1] += w * ond * Math.sin(u * 13 + t * 4.2) ; p[0] += w * ond * 0.5 * Math.cos(u * 9 + t * 3.1); }
    return p;
  }
  function ech(a0, a1, n, f){ var r = []; for(var i = 0; i <= n; i++) r.push(f(a0 + (a1 - a0) * i / n)); return r; }
  function zone(u0, u1, v0, v1){
    return ech(v0, v1, 6, function(v){ return M(u0, v); }).concat(ech(u0, u1, 8, function(u){ return M(u, v1); }).slice(1), ech(v1, v0, 6, function(v){ return M(u1, v); }).slice(1), ech(u1, u0, 3, function(u){ return M(u, v0); }).slice(1, -1));
  }
  s.chemins.forEach(function(c, k){
    var dd;
    if(c.contour) dd = lisse(zone(0, 1, 0, 1), true);
    else if(c.zone) dd = lisse(zone(c.zone[0], c.zone[1], c.zone[2], c.zone[3]), true);
    else { var l = c.ligne; dd = lisse(l[0] === 'u' ? ech(l[2], l[3], 6, function(v){ return M(l[1], v); }) : ech(l[2], l[3], 8, function(u){ return M(u, l[1]); }), false); }
    me.els[k].setAttribute('d', dd);
  });
};

/* ============ le moteur de poses (Web Animations API) ============ */
var EZ = {lin:'linear', o:'cubic-bezier(.2,.75,.3,1)', i:'cubic-bezier(.55,0,.85,.35)', io:'cubic-bezier(.45,0,.3,1)',
  b:'cubic-bezier(.3,1.55,.55,1)', bb:'cubic-bezier(.25,2.1,.5,1)', s:'cubic-bezier(.4,0,.2,1)', oo:'cubic-bezier(.1,.9,.2,1)'};
function J0(){ return {x:0, y:0, r:0, k:0, sx:1, sy:1}; }
function jn(v){ var o = J0(); if(typeof v === 'number') o.r = v; else for(var k in v) o[k] = v[k]; return o; }
function tf(s){ return 'translate(' + r1(s.x) + 'px,' + r1(s.y) + 'px) rotate(' + (Math.round(s.r * 100) / 100) + 'deg) skewX(' + r1(s.k) + 'deg) scale(' + (Math.round(s.sx * 1000) / 1000) + ',' + (Math.round(s.sy * 1000) / 1000) + ')'; }
function egal(a, b){ return a.x === b.x && a.y === b.y && a.r === b.r && a.k === b.k && a.sx === b.sx && a.sy === b.sy; }
var DEG = 180 / Math.PI;
function norm(a){ while(a > 180) a -= 360; while(a <= -180) a += 360; return a; }
/* deux os : épaule (ou hanche), longueurs, cible du poignet (ou de la cheville) ; sg = +1 pour un bras (le coude plie vers l'avant), -1 pour une jambe */
function ik(S, l1, l2, Tg, sg){
  var dx = Tg[0] - S[0], dy = Tg[1] - S[1], d = Math.hypot(dx, dy) || 0.01;
  var dd = Math.max(Math.abs(l1 - l2) + 0.5, Math.min(l1 + l2 - 0.05, d));
  var a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd))));
  var fT = Math.atan2(dy, dx), f1 = fT + sg * a;
  var E = [S[0] + l1 * Math.cos(f1), S[1] + l1 * Math.sin(f1)], T2 = [S[0] + dx / d * dd, S[1] + dy / d * dd];
  var f2 = Math.atan2(T2[1] - E[1], T2[0] - E[0]);
  var r1_ = f1 * DEG - 90; while(r1_ > 90) r1_ -= 360; while(r1_ <= -270) r1_ += 360;
  return [r1_, norm((f2 - f1) * DEG)];
}
/* un angle ramené au plus près d'un autre (pour tourner par le plus court chemin depuis la pose d'avant) */
function pres(v, ref){ return v + 360 * Math.round((ref - v) / 360); }
function resoudre(pose, base){
  var st = {}, k;
  for(k in base) st[k] = base[k];
  for(k in pose) if(base[k]){ st[k] = jn(pose[k]); st[k].r = pres(st[k].r, base[k].r); }
  ['A', 'B'].forEach(function(c){
    var m = pose['m' + c];
    if(m){
      var os = OS[c], s = pose['s' + c] || 1, r = ik(os.epaule, os.l1, os.l2 * s, m, pose['c' + c] || 1);
      var rb = pres(r[0], base['bras' + c].r);
      st['bras' + c] = jn(rb); st['avantBras' + c] = jn({r:r[1], sy:s});
      if(!pose['main' + c]) st['main' + c] = jn({r:pose['h' + c] !== undefined ? pres(pose['h' + c] - rb - r[1], base['main' + c].r) : 0, sy:1 / s});
    } else if(pose['h' + c] !== undefined) st['main' + c] = jn(pres(pose['h' + c] - st['bras' + c].r - st['avantBras' + c].r, base['main' + c].r));
    var p = pose['p' + c];
    if(p){
      var b = st.bassin, pv = SQ.bassin, a = -b.r / DEG, wx = p[0] - b.x - pv[0], wy = p[1] - b.y - pv[1];
      var loc = [pv[0] + wx * Math.cos(a) - wy * Math.sin(a), pv[1] + wx * Math.sin(a) + wy * Math.cos(a)];
      var j = OS['J' + c], r2 = ik(j.hanche, j.l1, j.l2, loc, pose['g' + c] || -1);
      st['cuisse' + c] = jn(r2[0]); st['tibia' + c] = jn(r2[1]);
      st['pied' + c] = jn((pose['f' + c] || 0) - b.r - r2[0] - r2[1]);
    }
  });
  return st;
}
/* une pose à mi-chemin entre deux (pour les cycles : course, rebonds) */
function melange(a, b, t){ var o = {}; for(var k in a){ o[k] = {}; for(var f in a[k]) o[k][f] = a[k][f] + (b[k][f] - a[k][f]) * t; } return o; }

/* ============ le ticker commun : tissus, cordes, bulles… ============ */
var VIVANTS = [], tickOn = false, tPrec = 0;
/* Fluidité (RAPIDITE.md) : à chaque image, on LIT d'abord toutes les positions dont on aura besoin (pour tous les héros),
   puis on écrit (tissus, corde…). Lire après avoir écrit forcerait le navigateur à tout recalculer, une fois par héros. */
var CACHE_MAT = null;
function tick(t){
  var dt = Math.min(1 / 30, Math.max(1 / 240, (t - (tPrec || t)) / 1000 || 1 / 60)); tPrec = t;
  CACHE_MAT = new Map();
  /* au repos (cuit), un héros « s'endort » : plus aucun calcul à chaque image (voir H._actif) */
  var actifs = [], cordes = [];
  VIVANTS.forEach(function(h){ var a = h._actif(t); if(a === 'corde') cordes.push(h); else if(a) actifs.push(h); });
  actifs.forEach(function(h){ try { h._lire(); } catch(e){} });
  cordes.forEach(function(h){ try { h.R0.lire.call(h); } catch(e){} });
  actifs.forEach(function(h){ try { h._pas(dt, t / 1000); } catch(e){ if(!h._err){ h._err = 1; console.error(e); } } });
  cordes.forEach(function(h){ try { h.R0.pas.call(h, dt, t / 1000); } catch(e){} });
  actifs = actifs.concat(cordes);
  CACHE_MAT = null;
  if(actifs.length) requestAnimationFrame(tick); else tickOn = false;
}
function vivre(h){ if(VIVANTS.indexOf(h) < 0) VIVANTS.push(h); h._calmeDepuis = 0; if(h._dort) h._reveil(); if(!tickOn){ tickOn = true; tPrec = 0; requestAnimationFrame(tick); } }
/* relancer la boucle sans réveiller le héros (une corde tirée pendant un petit geste d'attente) */
function relancer(h){ if(VIVANTS.indexOf(h) < 0) VIVANTS.push(h); if(!tickOn){ tickOn = true; tPrec = 0; requestAnimationFrame(tick); } }

/* ============ les effets : particules et projectiles (dans la scène ou autour du héros) ============ */
function div(parent, css, html){
  var e = document.createElement('div'); e.className = 'ha-p'; e.style.cssText = css || ''; if(html) e.innerHTML = html; parent.appendChild(e); return e;
}
function jouerEl(e, kfs, o, garder){
  var a = e.animate(kfs, o);
  a.finished.then(function(){ if(!garder) e.remove(); }, function(){ if(!garder) e.remove(); });
  return a.finished.catch(function(){});
}
function place(x, y, r, s){ return 'translate(' + r1(x) + 'px,' + r1(y) + 'px) translate(-50%,-50%)' + (r ? ' rotate(' + r1(r) + 'deg)' : '') + (s !== undefined ? ' scale(' + s + ')' : ''); }
/* le centre d'un élément dans le repère d'un autre (en tenant compte d'un zoom CSS du repère) */
function ou(el, ref){
  var r = el.getBoundingClientRect(), R = ref.getBoundingClientRect(), k = (R.width / (ref.offsetWidth || R.width)) || 1;
  return {x:(r.left + r.width / 2 - R.left) / k, y:(r.top + r.height / 2 - R.top) / k};
}
function alea(a, b){ return a + Math.random() * (b - a); }
/* une gerbe de particules : n, couleur, vitesse, pesanteur, taille, durée */
function gerbe(layer, x, y, o){
  o = o || {};
  var n = o.n || 12, ps = [];
  for(var i = 0; i < n; i++){
    var an = (o.angle !== undefined ? o.angle : 0) + (o.ecart !== undefined ? alea(-o.ecart, o.ecart) : alea(-180, 180));
    var v = alea(o.v0 || 60, o.v1 || 160), vx = Math.cos(an / DEG) * v, vy = Math.sin(an / DEG) * v, g = o.g === undefined ? 300 : o.g;
    var dur = alea(o.d0 || 400, o.d1 || 800), sz = alea(o.t0 || 3, o.t1 || 6), coul = o.c instanceof Array ? o.c[i % o.c.length] : (o.c || '#ffd36a');
    var forme = o.forme || 'rond';
    var css = 'width:' + sz + 'px;height:' + (forme === 'trait' ? sz * 0.35 : sz) + 'px;border-radius:' + (forme === 'carre' ? '1px' : '50%') + ';background:' + coul + ';' + (o.lueur === false ? '' : 'box-shadow:0 0 ' + (sz * 1.4) + 'px ' + coul + ';');
    if(forme === 'eclat') css = 'width:0;height:0;border-left:' + (sz * 0.45) + 'px solid transparent;border-right:' + (sz * 0.45) + 'px solid transparent;border-bottom:' + sz + 'px solid ' + coul + ';filter:drop-shadow(0 0 2px #fff8);';
    if(forme === 'html') css = 'font-size:' + sz + 'px;line-height:1;color:' + coul + ';text-shadow:0 0 6px ' + coul + ';';
    var e = div(layer, css, forme === 'html' ? o.html : '');
    var k = [], rot0 = alea(-180, 180), rotv = alea(-540, 540);
    for(var s = 0; s <= 6; s++){
      var tt = s / 6 * dur / 1000, px = x + vx * tt, py = y + vy * tt + 0.5 * g * tt * tt;
      var rr = forme === 'trait' ? Math.atan2(vy + g * tt, vx) * DEG : rot0 + rotv * tt;
      k.push({transform:place(px, py, rr, (o.s1 === undefined ? 1 : 1 + (o.s1 - 1) * s / 6)), opacity:s < 1 ? 0.2 + (o.o0 || 1) * 0.8 : (o.o0 || 1) * Math.pow(1 - s / 6, o.fondu || 0.8)});
    }
    k[0].opacity = 0;
    ps.push(jouerEl(e, k, {duration:dur, delay:(o.retard || 0) + alea(0, o.etale || 0), easing:'linear', fill:'backwards'}));
  }
  return Promise.all(ps);
}
/* un rond qui grandit et s'efface (onde, éclair, poussière) */
function onde(layer, x, y, o){
  o = o || {};
  var w = o.w || 40, h = o.h || w, e = div(layer, 'width:' + w + 'px;height:' + h + 'px;border-radius:50%;' + (o.css || ('border:' + (o.ep || 3) + 'px solid ' + (o.c || '#fff') + ';box-shadow:0 0 12px ' + (o.c || '#fff') + ', inset 0 0 8px ' + (o.c || '#fff') + ';')), o.html);
  return jouerEl(e, [{transform:place(x, y, 0, o.s0 || 0.2), opacity:o.o0 === undefined ? 1 : o.o0}, {transform:place(x, y, 0, o.s1 || 2.4), opacity:0}],
    {duration:o.d || 500, delay:o.retard || 0, easing:o.e || 'cubic-bezier(.1,.7,.3,1)', fill:'backwards'});
}
/* une petite étoile à 4 branches (scintillement) */
function etoile4(c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible;filter:drop-shadow(0 0 3px ' + c + ')"><path d="M0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="' + c + '"/><circle r="2" fill="#fff"/></svg>'; }
function etoile5(c, t){ return '<svg viewBox="-12 -12 24 24" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible"><path d="M0 -11 L 3.2 -3.6 L 11 -3.4 L 5 1.8 L 7 9.6 L 0 5.2 L -7 9.6 L -5 1.8 L -11 -3.4 L -3.2 -3.6 Z" fill="' + c + '" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/><path d="M-2 -5 L 0 -8" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>'; }
function scintille(layer, x, y, o){
  o = o || {};
  var ps = [];
  for(var i = 0; i < (o.n || 8); i++){
    var px = x + alea(-(o.rx || 40), o.rx || 40), py = y + alea(-(o.ry || 40), o.ry || 40), t = alea(o.t0 || 8, o.t1 || 16);
    var e = div(layer, '', etoile4(o.c instanceof Array ? o.c[i % o.c.length] : (o.c || '#ffe9a0'), t));
    ps.push(jouerEl(e, [{transform:place(px, py, 0, 0), opacity:1}, {transform:place(px, py + (o.dy || -10) * 0.5, 45, 1.2), opacity:1, offset:0.4}, {transform:place(px, py + (o.dy || -10), 90, 0), opacity:0}],
      {duration:alea(o.d0 || 450, o.d1 || 800), delay:(o.retard || 0) + alea(0, o.etale || 400), easing:'ease-out', fill:'backwards'}));
  }
  return Promise.all(ps);
}
/* un mot de bande dessinée (BONG !, −2 absorbés…) */
function mot(layer, x, y, txt, o){
  o = o || {};
  var e = div(layer, 'font:900 ' + (o.t || 30) + 'px/1 ' + (o.police || '"Trebuchet MS", "Arial Black", system-ui, sans-serif') + ';color:' + (o.c || '#ffe36a') + ';-webkit-text-stroke:' + (o.trait || 2) + 'px #24182e;paint-order:stroke fill;' +
    'text-shadow:0 3px 0 #24182e, 0 0 14px ' + (o.lueur || 'rgba(255,200,80,.7)') + ';white-space:nowrap;letter-spacing:.02em', txt);
  var r = o.r || 0;
  return jouerEl(e, [{transform:place(x, y, r, 0.2), opacity:0}, {transform:place(x, y - 6, r, 1.25), opacity:1, offset:0.15}, {transform:place(x, y - 10, r, 1), opacity:1, offset:0.3},
    {transform:place(x, y - (o.monte || 26), r, 1), opacity:1, offset:0.8}, {transform:place(x, y - (o.monte || 26) - 8, r, 0.9), opacity:0}],
    {duration:o.d || 1100, delay:o.retard || 0, easing:'ease-out', fill:'backwards'});
}

/* ============ le CSS (injecté une fois) ============ */
function css(){
  if(document.getElementById('ha-css')) return;
  var st = document.createElement('style'); st.id = 'ha-css';
  st.textContent = '.ha{position:absolute;inset:0;pointer-events:none;overflow:visible}' +
    '.ha-boite{position:absolute;inset:0}.ha-boite>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block}' +
    '.ha .haJ{transform-box:view-box}.ha-fx{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:2}' +
    '.ha-p{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity}' +
    '.ha .haAv{display:none}.ha.ha-avA .haAv{display:inline}' +
    '.ha.ha-choisi .ha-boite>svg{animation:haChoisi 1.6s ease-in-out infinite}' +
    /* cuit (RAPIDITE.md) : la lueur du héros choisi est une silhouette dorée cuite, derrière lui ; elle pulse en opacité (carte graphique) */
    '.ha.ha-choisi .cu-lueur{display:block;animation:haLueur 1.6s ease-in-out infinite}@keyframes haLueur{0%,100%{opacity:.78}50%{opacity:1}}' +
    /* les tissus simulés (îlots SVG redessinés à chaque image) : chacun dans son calque ; quand le héros est choisi, un halo doré
       (il est de toute façon repeint à chaque image, le halo ne coûte qu'un petit flou sur sa surface) */
    '.ha .cu-ilot.ha-anime{will-change:transform}' +
    '.ha.ha-choisi .cu-ilot.ha-souple>svg{filter:drop-shadow(0 0 2px rgba(255,226,160,.85)) drop-shadow(0 0 6px rgba(255,190,90,.4))}' +
    /* le repos (ha-calme) : balancement des tissus, corde fixe sur l'arc, bulles et étincelles en boucle (tout en CSS) */
    '.ha.ha-calme .cu-ilot.ha-tissu{animation:haVent 2.8s ease-in-out infinite}' +
    '.ha.ha-calme .cu-ilot.ha-meche,.ha.ha-calme .cu-ilot.ha-tresse{animation:haVent2 2.4s ease-in-out infinite}' +
    '@keyframes haVent{0%,100%{transform:none}25%{transform:rotate(-1.3deg) skewX(1deg)}75%{transform:rotate(1.1deg) skewX(-1deg)}}' +
    '@keyframes haVent2{0%,100%{transform:none}25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}' +
    '.ha .ha-calme-seul{display:none}.ha.ha-calme .ha-calme-seul{display:block}.ha.ha-calme .cu-ilot.ha-trait{visibility:hidden}' +
    '.ha.ha-calme.ha-corde-vive .cu-ilot.ha-trait{visibility:visible}.ha.ha-calme.ha-corde-vive .ha-corde-fixe{display:none}' +
    '.ha .ha-bulle-boucle{animation:haBulle 1.3s ease-out infinite}.ha.ha-bout .ha-bulle-boucle{animation-duration:.5s}' +
    '@keyframes haBulle{0%{transform:translate(0,0) scale(1);opacity:0}20%{transform:translate(1px,-6px) scale(1);opacity:1}80%{transform:translate(-2px,-18px) scale(1.1);opacity:.9}100%{transform:translate(0,-28px) scale(1.4);opacity:0}}' +
    '.ha .ha-etinc-boucle{animation:haEtinc .9s ease-out infinite}' +
    '@keyframes haEtinc{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translate(2px,-22px) scale(1);opacity:0}}' +
    '@keyframes haChoisi{0%,100%{filter:drop-shadow(0 0 3px rgba(255,220,130,.7)) drop-shadow(0 0 10px rgba(255,190,90,.25))}50%{filter:drop-shadow(0 0 5px rgba(255,225,140,.95)) drop-shadow(0 0 18px rgba(255,190,90,.5))}}' +
    '@keyframes haTourne{to{transform:rotate(360deg)}}@keyframes haTourneR{to{transform:rotate(-360deg)}}' +
    '@keyframes haPulse{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1.15)}}' +
    '@keyframes haFlotte{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}' +
    '.ha-dome{position:absolute;pointer-events:none;z-index:3}' +
    '.ha-badge{position:absolute;left:50%;top:-6px;transform:translate(-50%,-100%);white-space:nowrap;font:800 13px/1 system-ui,"Segoe UI",sans-serif;color:#e8fdff;' +
    'background:linear-gradient(#1d3a5a,#10203a);border:2px solid #8ff3ff;border-radius:999px;padding:4px 9px;box-shadow:0 0 10px rgba(143,243,255,.6),0 2px 0 #24182e}';
  document.head.appendChild(st);
}
var ROLES = {};
var FX = {etoiles:function(){}};

/* ============ un héros ============ */
function Heros(cont, role, lk){
  css();
  if(!ROLES[role]) throw new Error('HerosAnime : rôle inconnu « ' + role + ' »');
  this.cont = cont; this.role = role; this.R0 = ROLES[role];
  /* l'apparence : celle donnée ; ce qui manque (peau, cheveux, yeux) vient de l'apparence par défaut */
  this.lk = fusionLk(role, lk);
  if(getComputedStyle(cont).position === 'static') cont.style.position = 'relative';
  this.racine = document.createElement('div'); this.racine.className = 'ha ha-' + role;
  this.boite = document.createElement('div'); this.boite.className = 'ha-boite';
  this.fx = document.createElement('div'); this.fx.className = 'ha-fx';
  this.racine.appendChild(this.boite); this.racine.appendChild(this.fx);
  cont.appendChild(this.racine);
  /* cuit (HerosAnime.preparer) : une copie de la version en images, dont les pièces sont des <div> que la carte graphique
     anime sans rien repeindre ; sinon, le grand SVG d'origine */
  var M = MODELES[cleModele(role, this.lk)], spec;
  if(M && M.modele){
    var cl = M.modele.cloner(this.boite, {lueur:false});     /* (la silhouette lumineuse n'est ajoutée que quand il est choisi) */
    this.cuit = true; this.svg = cl.racine; this.vue = cl.vue;
    spec = {souples:M.souples};
  } else {
    spec = this.R0.fab(this.lk, HerosAnime.grain);
    this.boite.innerHTML = spec.svg;
    this.svg = this.vue = this.boite.querySelector('svg');
  }
  var me = this;
  this.els = {}; this.elsI = {}; this.etat = {};
  /* (cuit : la silhouette lumineuse est une seconde copie des pièces ; elle reçoit les mêmes animations) */
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'); (me.els[n] = me.els[n] || []).push(e); me.etat[n] = J0(); });
  [].forEach.call(this.svg.querySelectorAll('[data-i]'), function(e){ var n = e.getAttribute('data-i'); (me.elsI[n] = me.elsI[n] || []).push(e); });
  this.reps = {};
  [].forEach.call(this.vue.querySelectorAll('[data-r]'), function(e){ var n = e.getAttribute('data-r'); if(!me.reps[n]) me.reps[n] = e; });
  this.souples = spec.souples.map(function(s){ return new Souple(me, s); });
  /* cuit : les îlots redessinés à chaque image (tissus, corde, filet) ont chacun leur calque : on ne repeint qu'eux */
  if(this.cuit){
    [].forEach.call(this.vue.querySelectorAll('[data-souple],[data-corde],[data-filet]'), function(g){
      var il = g.ownerSVGElement && g.ownerSVGElement.parentNode;
      if(il && il.classList.contains('cu-ilot')) il.classList.add('ha-anime', g.hasAttribute('data-souple') ? 'ha-souple' : 'ha-trait');
    });
    /* au repos (le héros « dort », plus aucun calcul), chaque tissu suit son membre et se balance doucement (CSS, carte graphique),
       pivot au point où il est attaché */
    this.souples.forEach(function(so, k){
      var il = so.g.ownerSVGElement && so.g.ownerSVGElement.parentNode, s = so.s;
      if(!il) return;
      var p = s.dos ? s.dos[0] : s.haut ? s.haut[0] : s.pts[0];
      il.style.transformOrigin = p[0] + 'px ' + p[1] + 'px';
      il.style.animationDuration = (2.6 + k * .37) + 's';
      il.classList.add('ha-' + s.type);
    });
  }
  this.grainG = this.svg.querySelector('.ha-grain');
  this.file = Promise.resolve(); this._nf = 0; this._gTok = 0; this._timers = [];
  this.bouche0 = this.R0.bouche || 'neutre';
  this.expr('garde');
  if(this.R0.init) this.R0.init.call(this, spec);
  if(this.cuit && this.R0.cuit) this.R0.cuit.call(this);
  this.poser(this.garde());
  vivre(this);
}
var H = Heros.prototype;

/* ============ la cuisson (voir jeu/donjon/RAPIDITE.md et anim/cuire.js) ============
   HerosAnime.preparer([{role, lk}], {res}) cuit une fois chaque héros (avec son apparence) en images ; ensuite, creer() en
   fait une copie. Le dessin fixe (grain de papier et flous compris) devient des images ; ce qui change à chaque image
   (tissus simulés, corde de l'arc, filet de potion, fioles qui changent de couleur, bulles) reste en petits îlots SVG. */
var MODELES = {};
/* l'apparence : celle donnée ; ce qui manque (peau, cheveux, yeux) vient de l'apparence par défaut */
function fusionLk(role, lk){
  var base = DEFAUT[role], r = {}, k;
  if(lk){ for(k in lk) r[k] = lk[k]; ['pe', 'ch', 'ir'].forEach(function(c){ if(!r[c]) r[c] = base[c]; }); }
  else for(k in base) r[k] = base[k];
  return r;
}
function cleModele(role, lk){ return role + '|' + JSON.stringify(lk) + '|' + (HerosAnime.grain ? 1 : 0); }
var ILOTS = '[data-souple],[data-corde],[data-filet],[data-coul],[data-halo],[data-bulles],' +
  /* les objets du donjon et les flèches spéciales (a2-objets.js) : de petits îlots vectoriels, cachés au départ ; ils ne coûtent
     ni image ni temps de cuisson, et ne sont peints qu'une fois, quand on les montre (mémoire de l'iPhone) */
  '[data-eq],[data-argent],[data-lourde],[data-givre],[data-acide]';
function preparerUn(role, lk, o){
  var l = fusionLk(role, lk), cle = cleModele(role, l);
  if(MODELES[cle]) return MODELES[cle].promesse;
  var Cu = window.Cuire;
  var spec = ROLES[role].fab(l, HerosAnime.grain), h = Cu.hote(250, 300);
  h.innerHTML = spec.svg;
  var svg = h.firstElementChild; svg.style.cssText = 'display:block;width:250px;height:300px';
  var M = MODELES[cle] = {souples:spec.souples};
  /* (pas de will-change sur les pièces : seules celles qui bougent deviennent des calques) */
  M.promesse = Cu.cuire(svg, {ilot:ILOTS, res:o.res || 2, lueur:{couleur:'#ffe2a0', couleur2:'#ffbe5a', epais:1.4, flou:2.6, large:7}})
    .then(function(m){ M.modele = m; h.remove(); return m; }, function(e){ h.remove(); delete MODELES[cle]; if(window.console) console.warn('HerosAnime.preparer', e); return null; });
  return M.promesse;
}
function preparer(liste, o){
  css();
  o = o || {};
  if(!window.Cuire || !window.Cuire.cuire) return Promise.resolve([]);
  if(!liste) liste = Object.keys(ROLES).map(function(r){ return {role:r}; });
  var res = o.res || Math.max(1, Math.min(3, (window.devicePixelRatio || 1) * 200 / 250 * 1.3));
  /* un héros après l'autre (le téléphone garde la main entre deux) */
  return liste.reduce(function(p, x){ return p.then(function(r){ return preparerUn(x.role, x.lk, {res:res}).then(function(m){ r.push(m); return r; }); }); }, Promise.resolve([]));
}
H.$ = function(sel){ return this.svg.querySelector(sel); };
H.garde = function(){ return this._choisi && this.R0.gardeChoisi ? this.R0.gardeChoisi : this.R0.garde; };
H.plus = function(ms, fn){ var me = this, id = setTimeout(function(){ me._timers.splice(me._timers.indexOf(id), 1); fn(); }, ms); this._timers.push(id); return id; };
H.att = function(ms){ var me = this; return new Promise(function(r){ me.plus(ms, r); }); };
/* le moteur : une suite de poses [{d: durée, p: pose, e: accélération, f: fonction à la fin du pas}] */
H.jouer = function(seq){
  var me = this, etats = [], base = this.etat, tps = [0], T = 0;
  seq.forEach(function(st){ var e = st.p ? resoudre(st.p, base) : base; etats.push(e); base = e; T += st.d; tps.push(T); });
  var noms = Object.keys(this.els).filter(function(n){ return etats.some(function(e){ return !egal(e[n], me.etat[n]); }); });
  noms.forEach(function(n){
    var kfs = [{offset:0, transform:tf(me.etat[n]), easing:EZ[seq[0].e || 'io'] || seq[0].e}];
    etats.forEach(function(e, i){ var nx = seq[i + 1]; kfs.push({offset:T ? tps[i + 1] / T : 1, transform:tf(e[n]), easing:nx ? (EZ[nx.e || 'io'] || nx.e) : 'linear'}); });
    me.els[n].forEach(function(el){
      var old = el._a, a = el._a = el.animate(kfs, {duration:Math.max(T, 1), fill:'forwards'});
      if(old) old.cancel();
      /* une fois finie, la pose est écrite dans le style et l'animation enlevée (moins d'animations à tenir à jour) */
      a.finished.then(function(){ if(el._a === a){ el.style.transform = kfs[kfs.length - 1].transform; a.cancel(); el._a = null; } }, function(){});
    });
  });
  seq.forEach(function(st, i){ if(st.f) me.plus(tps[i + 1], st.f); if(st.f0) me.plus(tps[i], st.f0); });
  this.etat = etats[etats.length - 1];
  return this.att(T);
};
H.poser = function(pose){
  var me = this; this.etat = resoudre(pose, this.etat);
  Object.keys(this.els).forEach(function(n){ me.els[n].forEach(function(el){ el.style.transform = tf(me.etat[n]); if(el._a){ el._a.cancel(); el._a = null; } }); });
};
/* fige la pose là où elle en est (pour interrompre un geste d'attente) */
H.capturer = function(){
  var me = this, noms = Object.keys(this.els);
  /* d'abord tout lire, ensuite tout écrire (une lecture après une écriture forcerait un recalcul des styles par pièce) */
  var lu = noms.map(function(n){ return getComputedStyle(me.els[n][0]).transform; });
  noms.forEach(function(n, i){
    var m = lu[i], s = J0();
    if(m && m !== 'none'){
      var v = m.replace(/^matrix\(|\)$/g, '').split(',').map(Number), a = v[0], b = v[1], c = v[2], d = v[3];
      var r = Math.atan2(b, a), sx = Math.hypot(a, b), sy = -c * Math.sin(r) + d * Math.cos(r), tk = (c * Math.cos(r) + d * Math.sin(r)) / (sy || 1);
      s = {x:v[4], y:v[5], r:r * DEG, k:Math.atan(tk) * DEG, sx:sx, sy:sy};
      while(s.r - me.etat[n].r > 180) s.r -= 360; while(s.r - me.etat[n].r < -180) s.r += 360;
    }
    me.etat[n] = s;
    me.els[n].forEach(function(el){ el.style.transform = tf(s); if(el._a){ el._a.cancel(); el._a = null; } });
  });
};
/* les visages */
var EXPR = {garde:['ouverts', 'garde', null], effort:['ouverts', 'colere', 'effort'], aie:['serres', 'souci', 'grimace'], ko:['ko', 'souci', 'o'],
  joie:['joie', 'content', 'joie'], cri:['ouverts', 'colere', 'joie'], savoir:['lueur', 'content', 'o'], vise:['ouverts', 'colere', 'neutre'], content:['ouverts', 'content', 'sourire'], surpris:['ouverts', 'souci', 'o']};
H.expr = function(nom){
  var e = EXPR[nom] || EXPR.garde, b = e[2] || this.bouche0, sv = this.svg;
  [['data-y', e[0]], ['data-s', e[1]], ['data-b', b]].forEach(function(p){
    [].forEach.call(sv.querySelectorAll('[' + p[0] + ']'), function(g){ g.style.display = g.getAttribute(p[0]) === p[1] ? '' : 'none'; });
  });
  this._expr = nom;
};
H.cligner = function(){
  var c = this.$('.ha-cligne'); if(!c || this._expr === 'ko') return;
  c.animate([{transform:'scaleY(1)'}, {transform:'scaleY(.08)', offset:.45}, {transform:'scaleY(.08)', offset:.55}, {transform:'scaleY(1)'}], {duration:170, easing:'ease-in-out'});
};
H.avant = function(c, on){ this.racine.classList.toggle('ha-av' + c, !!on); };
H.rep = function(nom, ref){ return ou(this.reps[nom], ref || this.fx); };

/* ============ la file des actions : une à la fois ; l'attente reprend après ============ */
H._file = function(fn){
  var me = this; this._nf++;
  return new Promise(function(res){
    me.file = me.file.then(function(){
      var fini = false, sig = function(v){ if(!fini){ fini = true; res(v); } };
      me._debut();
      return Promise.resolve().then(function(){ return fn.call(me, sig); }).catch(function(e){ console.error(e); }).then(function(v){ sig(v); me._nf--; me._fin(); });
    });
  });
};
H._debut = function(){
  this._occupe = true; vivre(this); this._idleOff(); this.avant('A', false);
  if(this._geste){ this._gTok++; this._geste = false; this.capturer(); }
};
H._fin = function(){
  var me = this;
  if(this._nf > 0) return;
  this._occupe = false;
  if(this._veut) this.plus(40, function(){ if(!me._occupe && me._veut) me._idleOn(); });
};
H.attendre = function(){ this._veut = true; vivre(this); if(!this._occupe) this._idleOn(); return this; };
H._idleOn = function(){
  if(this._idle || this._avale) return;      /* (avalé par Bourbe : on ne le voit plus, rien ne bouge) */
  this._idle = true; this._calme = true;
  var me = this, A = this._ia = [];
  function boucle(nom, k1, dur, delay){ (me.elsI[nom] || []).forEach(function(el){ A.push(el.animate([{transform:'none'}, {transform:k1}], {duration:dur, delay:delay || 0, iterations:Infinity, direction:'alternate', easing:EZ.io})); }); }
  if(this.ko){
    boucle('torse', 'scale(1.025,1.035)', 1100);
    boucle('tete', 'rotate(4deg)', 1300, 200);
  } else if(this._toile){
    /* ligoté dans la toile : il force sans arrêt (de petits efforts rapides, joués par la carte graphique) */
    boucle('torse', 'translate(1px,0px) rotate(2.4deg)', 520);
    boucle('tete', 'rotate(-5deg)', 430, 90);
    boucle('brasA', 'rotate(-4deg)', 380, 40); boucle('brasB', 'rotate(4deg)', 410, 60);
    if(this.R0.idle) this.R0.idle.call(this, A, boucle);
  } else {
    boucle('torse', 'translate(0px,-1.6px) scale(1.014,1.025)', 1400);
    boucle('tete', 'translate(0px,-1.4px) rotate(-2.4deg)', 1400, 180);
    boucle('brasA', 'rotate(-2.8deg)', 1400, 260); boucle('brasB', 'rotate(3deg)', 1400, 330);
    boucle('avantBrasA', 'rotate(-3.5deg)', 1400, 430); boucle('avantBrasB', 'rotate(-3.5deg)', 1400, 500);
    if(this.R0.idle) this.R0.idle.call(this, A, boucle);
  }
  this._clignements(); this._gestes();
};
H._idleOff = function(){
  if(!this._idle) return;
  this._idle = false; this._calme = false;
  /* d'abord tout lire, ensuite tout couper (RAPIDITE.md : lire après écrire = un recalcul des styles à chaque fois) */
  var lu = (this._ia || []).map(function(a){ var el = a.effect && a.effect.target; return [a, el, el ? getComputedStyle(el).transform : null]; });
  lu.forEach(function(l){
    var a = l[0], el = l[1], m = l[2]; a.cancel();
    if(el && m && m !== 'none') el.animate([{transform:m}, {transform:'none'}], {duration:160, easing:EZ.o});
  });
  this._ia = [];
  clearTimeout(this._tCl); clearTimeout(this._tGe);
};
H._clignements = function(){
  var me = this;
  this._tCl = setTimeout(function(){ if(!me._idle) return; me.cligner(); if(Math.random() < 0.25) setTimeout(function(){ me.cligner(); }, 240); me._clignements(); }, alea(1800, 4600));
};
H._gestes = function(){
  var me = this;
  if(!this.R0.geste || this.ko) return;
  this._tGe = setTimeout(function(){
    if(!me._idle || me._occupe) return;
    var tok = ++me._gTok; me._geste = true;
    if(!me.cuit) vivre(me);
    /* ligoté : son petit geste, c'est de se débattre */
    var geste = me._toile ? function(){ var l = me._pose_ligote(); return me.jouer(me._debat(l, 4).concat([{d:260, p:l, e:'io'}])); } : me.R0.geste;
    Promise.resolve(geste.call(me, function(){ return tok === me._gTok; })).then(function(){ if(tok === me._gTok) me._geste = false; if(me._idle) me._gestes(); });
  }, me._toile ? alea(1400, 2800) : alea(me._gestesVite ? 1500 : 3200, me._gestesVite ? 2600 : 6200));
};
/* Fluidité (RAPIDITE.md) : un héros cuit qui ne fait rien « s'endort » : plus aucune boucle à chaque image (le fil principal
   du téléphone se repose, la carte graphique joue seule la respiration, le clignement, le balancement des tissus). Il se
   réveille dès qu'il agit (action, petit geste, corde tirée, potion versée) et se rendort 1,2 s après (le tissu s'est posé). */
H._actif = function(t){
  if(!this.cuit) return true;
  var c = this.corde, corde = c && (c.mode !== 'libre' || c.fl || c.vib > .25);
  /* une vraie action : tout est recalculé (tissus compris) */
  if(this._occupe || this._verse){ this._calmeDepuis = 0; this._corde(false); if(this._dort) this._reveil(); return true; }
  /* les petits gestes d'attente ne bougent que les bras : ils se jouent sans réveiller les tissus ; seule la corde tirée
     est recalculée (et rien d'autre) */
  if(this._dort){ this._corde(corde); return corde ? 'corde' : false; }
  if(corde){ this._calmeDepuis = 0; return true; }
  if(!this._calmeDepuis) this._calmeDepuis = t;
  if(t - this._calmeDepuis < 1200) return true;          /* (le tissu finit de se poser) */
  this._endormir();
  return false;
};
H._endormir = function(){ this._dort = true; this.racine.classList.add('ha-calme'); };
H._reveil = function(){ this._dort = false; this._corde(false); this.racine.classList.remove('ha-calme'); };
/* endormi, la corde de l'arc peut quand même être tirée (petit geste) : on montre alors la corde calculée */
H._corde = function(on){ if(!!this._cordeVive !== !!on){ this._cordeVive = !!on; this.racine.classList.toggle('ha-corde-vive', !!on); } };
/* cuit : la silhouette lumineuse du héros choisi, ajoutée seulement quand il l'est (ses pièces reçoivent les mêmes animations) */
H._lueurs = function(on){
  var me = this, M = MODELES[cleModele(this.role, this.lk)];
  if(on && !this._lv && M && M.modele && M.modele.clonerLueur){
    var lv = M.modele.clonerLueur(); if(!lv) return;
    var w = document.createElement('div'); w.className = 'cu-lueur'; w.appendChild(lv);
    this.svg.appendChild(w); window.Cuire.ajuster(this.svg);
    [].forEach.call(lv.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'); if(me.els[n]){ me.els[n].push(e); e.style.transform = tf(me.etat[n]); } });
    [].forEach.call(lv.querySelectorAll('[data-i]'), function(e){ var n = e.getAttribute('data-i'); if(me.elsI[n]) me.elsI[n].push(e); });
    this._lv = w;
    if(this._reappliquer) this._reappliquer();   /* (la silhouette reprend l'équipement montré) */
  } else if(!on && this._lv){
    var w2 = this._lv, n;
    this._lv = null;
    var garder = function(e){ return !w2.contains(e); };
    for(n in this.els) this.els[n] = this.els[n].filter(garder);
    for(n in this.elsI) this.elsI[n] = this.elsI[n].filter(garder);
    [].forEach.call(w2.querySelectorAll('*'), function(e){ if(e.getAnimations) e.getAnimations().forEach(function(a){ a.cancel(); }); });
    w2.remove();
  }
};
/* 1re phase de l'image : lire tout ce dont _pas aura besoin (les matrices sont gardées jusqu'à la fin de l'image) */
H._lire = function(){
  this._bm = getComputedStyle(this.boite).transform;
  mat(this.grainG);
  this.souples.forEach(function(s){ s.lire(); });
  if(this.R0.lire) this.R0.lire.call(this);
};
H._pas = function(dt, t){
  var bm = this._bm || getComputedStyle(this.boite).transform, o = [0, 0];
  this._bm = null;
  if(bm && bm !== 'none'){ var v = bm.replace(/^matrix\(|\)$/g, '').split(','); o = [+v[4], +v[5]]; }
  var g = mat(this.grainG), sol = ap(g, 0, 294)[1];
  this.souples.forEach(function(s){ s.pas(dt, o, sol); });
  if(this.R0.pas) this.R0.pas.call(this, dt, t);
};

/* ============ les gestes communs aux trois héros ============ */
/* une image du cycle de course (f entre 0 et 1) */
function course(f, R0){
  function pied(ph){
    ph = ((ph % 1) + 1) % 1; var x, y, a = 0;
    if(ph < 0.4){ var s = ph / 0.4; x = 32 - 66 * s; y = 272; a = s < 0.15 ? -12 * (1 - s / 0.15) : 0; }
    else { var s2 = (ph - 0.4) / 0.6, e = s2 * s2 * (3 - 2 * s2); x = -34 + 66 * e - 16 * Math.sin(Math.PI * s2) * (1 - s2); y = 272 - 52 * Math.sin(Math.PI * Math.pow(s2, 0.75)); a = 28 * Math.sin(Math.PI * s2) - (s2 > 0.85 ? 12 * (s2 - 0.85) / 0.15 : 0); }
    return [x, y, a];
  }
  var b = pied(f), a = pied(f + 0.5), c2 = Math.cos(2 * Math.PI * f), c4 = Math.cos(4 * Math.PI * (f - 0.06));
  var p = {bassin:{y:6 + 6 * c4, r:2.5 * Math.sin(2 * Math.PI * f)}, torse:14 - 2 * c4, tete:-10 + 2 * c4,
    pA:[SQ.cuisseA[0] + 6 + a[0], a[1]], fA:a[2], pB:[SQ.cuisseB[0] - 6 + b[0], b[1]], fB:b[2],
    brasA:-14 - 44 * c2, avantBrasA:-88 + 18 * c2, mainA:10, brasB:-14 + 44 * c2, avantBrasB:-88 - 18 * c2, mainB:10};
  if(R0.course) R0.course(p, f);
  return p;
}
H.entrer = function(dist){
  dist = dist === undefined ? 320 : dist;
  /* il quitte tout de suite la scène (à gauche) : on ne le voit pas à sa place avant qu'il arrive */
  this.boite.style.transform = 'translateX(' + (-dist) + 'px)';
  this.souples.forEach(function(so){ so.init = false; });
  return this._file(function(){
    var me = this, D = dist, cyc = 360, n = Math.max(2, Math.round(Math.max(650, D * 0.9 / 0.46) / cyc)), tRun = n * cyc, tFr = 300, T = tRun + tFr;
    this.expr('garde');
    var seq = [], N = 10;
    this.poser(course(0, this.R0));
    for(var k = 1; k <= n * N; k++) seq.push({d:cyc / N, p:course(k / N, this.R0), e:'lin'});
    var fr = {bassin:{x:4, y:18, r:-5}, torse:-14, tete:6, pA:[94, 272], pB:[184, 272], fB:-16, brasA:-80, avantBrasA:-30, mainA:0, brasB:40, avantBrasB:-60, mainB:0};
    if(this.R0.frein) this.R0.frein(fr);
    seq.push({d:tFr * 0.5, p:fr, e:'o', f0:function(){ me._poussiere(); }});
    seq.push({d:tFr * 0.5, p:fr, e:'lin'});
    this.boite.animate([{transform:'translateX(' + (-D) + 'px)', easing:'linear'}, {transform:'translateX(' + (-D * 0.12) + 'px)', offset:tRun / T, easing:'cubic-bezier(.15,.7,.35,1)'}, {transform:'translateX(0px)', offset:(tRun + tFr * 0.8) / T}, {transform:'translateX(0px)'}],
      {duration:T});
    this.boite.style.transform = '';
    this.souples.forEach(function(so){ so.init = false; });
    return this.jouer(seq).then(function(){
      return me.jouer([{d:200, p:me._rebond(), e:'o'}, {d:380, p:me.garde(), e:'b'}]);
    });
  });
};
H._rebond = function(){ var g = this.garde(), p = {}; for(var k in g) p[k] = g[k]; p.torse = (g.torse || 0) + 9; p.tete = (g.tete || 0) - 4; p.bassin = {y:((g.bassin || {}).y || 0) + 7}; return p; };
H._poussiere = function(){
  var me = this;
  ['orteilB', 'chevilleB', 'orteilA'].forEach(function(r, i){
    var p = me.rep(r);
    for(var k = 0; k < 3; k++) onde(me.fx, p.x + alea(-10, 14), p.y + alea(-4, 2), {css:'background:radial-gradient(circle,rgba(190,180,210,.55),rgba(150,140,170,0) 70%)', w:alea(18, 30), s0:0.4, s1:alea(1.6, 2.4), d:alea(450, 650), retard:i * 60 + k * 50, o0:0.9});
    gerbe(me.fx, p.x, p.y, {n:4, c:'#8a8098', angle:-160, ecart:30, v0:40, v1:110, g:300, t0:2, t1:4, lueur:false, d0:300, d1:500});
  });
};
/* il encaisse un coup */
H.touche = function(){
  return this._file(function(){
    var me = this, g = this.garde();
    this.expr('aie');
    this._flash();
    this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(-24px)', offset:.18, easing:'cubic-bezier(.2,.8,.4,1)'}, {transform:'translateX(-5px)', offset:.7}, {transform:'translateX(0px)'}], {duration:700, easing:'ease-out'});
    var p = me.rep('tete');
    gerbe(this.fx, p.x + 30, p.y + 40, {n:7, c:['#fff', '#ffe08a'], angle:180, ecart:50, v0:120, v1:240, g:200, forme:'trait', t0:8, t1:14, d0:220, d1:380});
    gerbe(this.fx, p.x - 10, p.y - 8, {n:3, c:'#bfe8ff', angle:-120, ecart:40, v0:60, v1:110, g:400, t0:4, t1:6, d0:500, d1:700, lueur:false});
    var hit = {bassin:{x:-8, y:12, r:-4}, torse:-18, tete:-16, brasA:-30, avantBrasA:-40, brasB:40, avantBrasB:-50};
    for(var k in g) if(k.charAt(0) === 'p' || k.charAt(0) === 'f') hit[k] = g[k];
    if(this.R0.touche) this.R0.touche(hit);
    return this.jouer([{d:70, p:hit, e:'oo'}, {d:90, p:hit, e:'lin'}, {d:260, p:me._rebond(), e:'io', f0:function(){ me.expr('aie'); }}, {d:320, p:g, e:'b', f0:function(){ me.expr('garde'); me.cligner(); }}]);
  });
};
/* il tombe, sonné */
H.tomber = function(){
  return this._file(function(){
    var me = this;
    this.expr('aie');
    this._flash();
    var hit = {bassin:{x:-8, y:14}, torse:-22, tete:-18, brasA:-50, avantBrasA:-40, brasB:50, avantBrasB:-40, pA:[100, 272], pB:[164, 272]};
    var flanche = {bassin:{x:-4, y:40, r:4}, torse:16, tete:12, pA:[104, 272], pB:[156, 272], fA:0, fB:0, brasA:-20, avantBrasA:-20, brasB:14, avantBrasB:-14, mainA:0, mainB:0};
    var bascule = {racine:{x:58, y:-6, r:-46}, bassin:{x:0, y:24, r:0}, torse:-12, tete:-18, cuisseA:-56, tibiaA:80, piedA:-10, cuisseB:-70, tibiaB:96, piedB:-20, brasA:-150, avantBrasA:-30, brasB:-120, avantBrasB:-40};
    var sol = {racine:{x:127, y:-27, r:-90}, bassin:{x:0, y:0, r:0}, torse:0, tete:20, cuisseA:-28, tibiaA:46, piedA:-24, cuisseB:-58, tibiaB:92, piedB:-36, brasA:172, avantBrasA:-26, mainA:0, brasB:16, avantBrasB:-44, mainB:0};
    var rb = {}; for(var k in sol) rb[k] = sol[k]; rb.racine = {x:127, y:-38, r:-84}; rb.tete = 6; rb.cuisseA = -40; rb.tibiaA = 64; rb.cuisseB = -70; rb.tibiaB = 110; rb.brasA = 150; rb.brasB = -10;
    if(this.R0.tombe) this.R0.tombe(sol, rb);
    return this.jouer([{d:90, p:hit, e:'oo'}, {d:110, p:hit, e:'lin'}, {d:260, p:flanche, e:'io'}, {d:120, p:flanche, e:'lin'},
      {d:220, p:bascule, e:'i'}, {d:170, p:sol, e:'i', f:function(){ me._boum(); }}, {d:150, p:rb, e:'o'}, {d:240, p:sol, e:'b', f:function(){ me.expr('ko'); me.ko = true; me._etoiles(true); }}]).then(function(){ me.ko = true; });
  });
};
H._flash = function(){
  this.svg.animate([{filter:'brightness(1) drop-shadow(0 0 0 rgba(255,60,70,0))'}, {filter:'brightness(2.3) drop-shadow(0 0 2px rgba(255,255,255,.9))', offset:.1},
    {filter:'brightness(1.08) drop-shadow(0 0 7px rgba(255,50,70,.95))', offset:.3}, {filter:'brightness(1) drop-shadow(0 0 0 rgba(255,60,70,0))'}], {duration:560, easing:'ease-out'});
};
H._boum = function(){
  var p = this.rep('tete'), q = this.rep('chevilleB');
  for(var k = 0; k < 6; k++){ var x = p.x + (q.x - p.x) * k / 5; onde(this.fx, x + alea(-8, 8), q.y + 4, {css:'background:radial-gradient(circle,rgba(200,190,220,.6),rgba(150,140,170,0) 70%)', w:alea(26, 40), h:alea(14, 20), s0:0.5, s1:alea(1.8, 2.6), d:alea(500, 750), retard:k * 25}); }
  this.boite.animate([{transform:'translateY(0px)'}, {transform:'translateY(2px)', offset:.3}, {transform:'translateY(0px)'}], {duration:200});
};
H._etoiles = function(on){
  if(this._et){ var e = this._et; this._et = null; e.animate([{opacity:1}, {opacity:0, transform:'translateY(-14px) scale(.6)'}], {duration:300}).finished.then(function(){ e.remove(); }); }
  if(!on) return;
  var p = this.rep('teteC'), w = div(this.fx, 'left:' + (p.x + 4) + 'px;top:' + (p.y - 34) + 'px;width:0;height:0', '');
  w.style.transform = 'none';
  for(var k = 0; k < 4; k++){
    var s = div(w, '', etoile5(['#ffe36a', '#fff3b0', '#ffd04a', '#fff'][k], 20 - (k % 2) * 4)), kf = [];
    for(var i = 0; i <= 12; i++){ var a = (i / 12 + k / 4) * 2 * Math.PI, z = Math.sin(a); kf.push({transform:place(Math.cos(a) * 34, z * 10, i * 30, 0.75 + 0.3 * z), opacity:z < -0.3 ? 0.6 : 1, zIndex:z > 0 ? 2 : 0}); }
    s.animate(kf, {duration:1300, iterations:Infinity, easing:'linear'});
  }
  w.animate([{opacity:0}, {opacity:1}], {duration:300, fill:'backwards'});
  this._et = w;
};
/* il se relève, dans une lumière dorée */
H.relever = function(){
  return this._file(function(){
    var me = this, g = this.garde();
    this._etoiles(false);
    var W = this.fx.offsetWidth || 200, Hh = this.fx.offsetHeight || 240, cx = W / 2 - 30, sy = Hh * 293 / 300;
    var col = div(this.fx, 'width:150px;height:260px;border-radius:50% 50% 40% 40%;background:radial-gradient(ellipse at 50% 80%,rgba(255,236,160,.85),rgba(255,200,90,.35) 40%,rgba(255,190,80,0) 70%);mix-blend-mode:screen;filter:blur(2px)');
    jouerEl(col, [{transform:place(cx + 30, sy - 110, 0, 0.2), opacity:0}, {transform:place(cx + 30, sy - 120, 0, 1), opacity:1, offset:.35}, {transform:place(cx + 30, sy - 120, 0, 1.05), opacity:.9, offset:.7}, {transform:place(cx + 30, sy - 130, 0, 1.2), opacity:0}], {duration:1700, easing:'ease-out'});
    onde(this.fx, cx + 30, sy + 2, {w:150, h:34, c:'#ffd36a', ep:3, s0:0.2, s1:1.3, d:900});
    onde(this.fx, cx + 30, sy + 2, {w:150, h:34, c:'#fff0b0', ep:2, s0:0.2, s1:1.6, d:1100, retard:300});
    scintille(this.fx, cx + 30, sy - 90, {n:16, rx:60, ry:90, dy:-50, c:['#ffe9a0', '#fff', '#ffd36a'], etale:900, d0:600, d1:1000});
    gerbe(this.fx, cx + 30, sy - 10, {n:18, c:['#ffe36a', '#fff3c0'], angle:-90, ecart:40, v0:50, v1:150, g:-60, t0:3, t1:5, d0:700, d1:1200, etale:700});
    this.expr('surpris');
    var assis = {racine:{x:70, y:-10, r:-30}, bassin:{x:0, y:30, r:0}, torse:10, tete:0, cuisseA:-80, tibiaA:110, piedA:-30, cuisseB:-60, tibiaB:120, piedB:-60, brasA:-20, avantBrasA:-20, brasB:30, avantBrasB:-30, mainA:0, mainB:0};
    var genou = {racine:{x:0, y:0, r:0}, bassin:{x:0, y:48, r:0}, torse:22, tete:-10, pA:[92, 272], fA:40, pB:[160, 272], brasA:-30, avantBrasA:-50, brasB:20, avantBrasB:-40};
    var debout = {racine:{x:0, y:-12, r:0}, bassin:{y:-2}, torse:-6, tete:-10, pA:[110, 270], pB:[146, 270], brasA:-150, avantBrasA:-10, brasB:-20, avantBrasB:-30};
    if(this.R0.releve) this.R0.releve(debout);
    return this.jouer([{d:280, p:assis, e:'io', f0:function(){ me.cligner(); }}, {d:120, p:assis, e:'lin'}, {d:300, p:genou, e:'io', f:function(){ me.expr('content'); }},
      {d:240, p:debout, e:'o'}, {d:120, p:debout, e:'lin'}, {d:400, p:g, e:'b', f0:function(){ me.ko = false; }}]).then(function(){ me.ko = false; me.expr('garde'); });
  });
};
/* une petite danse de victoire */
H.joie = function(){
  return this._file(function(){
    var me = this, g = this.garde(), j = this.R0.joie || {};
    var tasse = {bassin:{y:20}, torse:10, tete:4}, haut = {racine:{y:-38}, bassin:{y:-2}, torse:-8, tete:-12, pA:[108, 262], pB:[150, 258], fA:20, fB:14};
    var tasse2 = {racine:{y:0}, bassin:{y:16}, torse:6, tete:0}, haut2 = {racine:{y:-22}, bassin:{y:0}, torse:-4, tete:-10, pA:[108, 266], pB:[150, 264], fA:12, fB:10};
    [tasse, haut, tasse2, haut2].forEach(function(p){ for(var k in g) if(!(k in p) && k !== 'racine') p[k] = g[k]; });
    [haut, haut2].forEach(function(p){ for(var k in j) p[k] = j[k]; });
    for(var k in j) tasse2[k] = j[k];
    tasse.pA = tasse2.pA = g.pA; tasse.pB = tasse2.pB = g.pB;
    var p = this.rep('tete');
    return this.jouer([{d:150, p:tasse, e:'io', f:function(){ me.expr('joie'); scintille(me.fx, p.x + 10, p.y - 10, {n:10, rx:70, ry:50, etale:500}); }},
      {d:260, p:haut, e:'o', f:function(){ gerbe(me.fx, p.x + 10, p.y - 40, {n:14, c:['#ffe36a', '#8ff3ff', '#ff8aa8', '#a6ff9a'], angle:-90, ecart:70, v0:90, v1:200, g:420, forme:'carre', t0:4, t1:7, d0:700, d1:1100}); }},
      {d:200, p:tasse2, e:'i'}, {d:220, p:haut2, e:'o'}, {d:180, p:tasse2, e:'i'}, {d:420, p:g, e:'b', f:function(){ me.expr('content'); }}]).then(function(){ return me.att(300); }).then(function(){ me.expr('garde'); });
  });
};
/* celui qui joue : plus droit, une lueur */
H.choisi = function(on){
  on = on !== false;
  if(this.cuit) this._lueurs(on);
  this.racine.classList.toggle('ha-choisi', on);
  if(!!this._choisi === on) return Promise.resolve();
  this._choisi = on;
  if(this.ko) return Promise.resolve();
  var me = this;
  return this._file(function(){ return me.jouer([{d:360, p:me.garde(), e:'b'}]); });
};
H.arreter = function(){
  this._veut = false; this._idleOff(); this._gTok++;
  this._etoiles(false);
  var i = VIVANTS.indexOf(this); if(i >= 0) VIVANTS.splice(i, 1);
  if(this.R0.arret) this.R0.arret.call(this);
};
H.detruire = function(){ this.arreter(); this.racine.remove(); };

/* ============ un projectile qui vole de a à b (en cloche si haut > 0), appelé à chaque image ============ */
function voler(el, a, b, o){
  return new Promise(function(res){
    var t0 = null, D = o.d, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 - (o.haut || 0);
    function pos(t){ var u = 1 - t; return {x:u * u * a.x + 2 * u * t * cx + t * t * b.x, y:u * u * a.y + 2 * u * t * cy + t * t * b.y}; }
    function step(now){
      if(t0 === null) t0 = now;
      var t = Math.min(1, (now - t0) / D), te = o.ease ? o.ease(t) : t, p = pos(te), q = pos(Math.min(1, te + 0.01)), r = pos(Math.max(0, te - 0.01));
      var ang = Math.atan2(q.y - r.y, q.x - r.x) * DEG;
      el.style.transform = place(p.x, p.y, o.tourne !== undefined ? (o.r0 || 0) + o.tourne * t : ang, o.s);
      if(o.chaque) o.chaque(p, ang, t);
      if(t < 1) requestAnimationFrame(step); else res({x:p.x, y:p.y, ang:ang});
    }
    requestAnimationFrame(step);
  });
}
function couche(scene){ var c = scene.querySelector(':scope > .ha-fxs'); if(!c){ c = document.createElement('div'); c.className = 'ha-fx ha-fxs'; c.style.zIndex = 5; scene.appendChild(c); } return c; }
/* les sortes de flèches (une variante dessinée pour chacune, sauf la simple) */
var TYPES_FL = ['feu', 'huile', 'colle', 'argent', 'lourde', 'givre', 'acide'];
var FLECHE_SVG = function(type){
  return '<svg viewBox="-14 -16 150 32" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible">' +
    flecheDessin().replace(/data-(\w+) style="display:none"/g, function(m, t){ return t === type ? 'data-' + t : m; }) + '</svg>';
};

ROLES.pisteur = {
  fab:pisteur,
  garde:{racine:{}, bassin:{y:8}, torse:4, tete:-4, pA:[98, 272], pB:[162, 272], mA:[190, 158], hA:16, mB:[126, 168], hB:10, arc:{}},
  gardeChoisi:{racine:{}, bassin:{y:3}, torse:0, tete:-8, pA:[104, 272], pB:[158, 272], mA:[184, 136], hA:-2, mB:[128, 160], hB:10, arc:{}},
  joie:{mA:[166, 32], hA:-20, mB:[96, 34], hB:-170, cB:-1},
  course:function(p, f){ p.brasA = -40 - 16 * Math.cos(2 * Math.PI * f); p.avantBrasA = -50; p.mainA = 40; },
  frein:function(p){ p.brasA = -96; p.avantBrasA = -10; p.mainA = 70; },
  init:function(){
    this.cordeEl = this.$('[data-corde]'); this.flG = this.$('[data-fleche]'); this.flI = this.$('[data-fl]');
    /* les repères de l'encoche et de la pointe sont dans le dessin de la flèche encochée */
    this.reps.flN = this.flI.querySelector('[data-r="flN"]'); this.reps.flP = this.flI.querySelector('[data-r="flP"]');
    this.corde = {mode:'libre', vib:0, ph:0, fl:0, blend:0};
  },
  /* cuit, au repos : la corde est un trait fixe dessiné dans l'arc (elle suit l'arc sans aucun calcul) */
  cuit:function(){ var a = this.vue.querySelector('[data-i="arc"]'); if(a) window.Cuire.ilot(a, '<path d="M126 103 L 126 267" fill="none" stroke="#f3e7cb" stroke-width="1.8" stroke-linecap="round"/>', 'ha-calme-seul ha-corde-fixe'); },
  /* (lu avant toute écriture de l'image : voir tick) */
  lire:function(){ var R = this.reps; [this.cordeEl, R.arcH, R.arcB, R.pince].forEach(mat); if(this.corde.fl) mat(R.poignee); },
  /* la corde et la flèche encochée, recalculées à chaque image */
  pas:function(dt){
    var c = this.corde, Mi = inv(mat(this.cordeEl));
    function loc(r){ var m = mat(r), cx = +r.getAttribute('cx'), cy = +r.getAttribute('cy'), p = ap(m, cx, cy); return ap(Mi, p[0], p[1]); }
    var h = loc(this.reps.arcH), b = loc(this.reps.arcB), pi = loc(this.reps.pince), d;
    if(c.mode === 'tire') d = 'M' + r1(h[0]) + ' ' + r1(h[1]) + ' L ' + r1(pi[0]) + ' ' + r1(pi[1]) + ' L ' + r1(b[0]) + ' ' + r1(b[1]);
    else {
      c.ph += dt * 2 * Math.PI * 15; c.vib *= Math.exp(-dt * 6);
      var mx = (h[0] + b[0]) / 2, my = (h[1] + b[1]) / 2, dx = b[0] - h[0], dy = b[1] - h[1], l = Math.hypot(dx, dy) || 1, o = c.vib * Math.sin(c.ph);
      d = 'M' + r1(h[0]) + ' ' + r1(h[1]) + ' Q ' + r1(mx - dy / l * o * 2) + ' ' + r1(my + dx / l * o * 2) + ' ' + r1(b[0]) + ' ' + r1(b[1]);
    }
    this.cordeEl.setAttribute('d', d);
    this.cordeEl.setAttribute('stroke-width', c.vib > 0.6 ? 1.4 : 1.8);
    if(c.fl){
      var g = loc(this.reps.poignee), mh = mat(this.reps.pince), ax = Mi[0] * mh[0] + Mi[2] * mh[1], ay = Mi[1] * mh[0] + Mi[3] * mh[1];
      var aMain = -100, aEnc = Math.atan2(g[1] - pi[1], g[0] - pi[0]) * DEG;
      var a = aMain + norm(aEnc - aMain) * c.blend;
      this.flG.style.display = '';
      if(this.cuit) this.flI.style.transform = 'translate(' + r1(pi[0]) + 'px,' + r1(pi[1]) + 'px) rotate(' + r1(a) + 'deg)';
      else this.flI.setAttribute('transform', 'translate(' + r1(pi[0]) + ' ' + r1(pi[1]) + ') rotate(' + r1(a) + ')');
    } else this.flG.style.display = 'none';
  },
  /* en attendant : il vérifie sa corde, ou jette un œil au carquois */
  geste:function(ok){
    var me = this, g = this.garde(), c = this.corde;
    if(Math.random() < 0.7){
      /* (il tire sa corde : seule la corde est recalculée à chaque image, et seulement pendant qu'elle bouge : relancer) */
      var tient = {}; for(var k in g) tient[k] = g[k];
      tient.mA = [196, 142]; tient.hA = 10; tient.tete = 6; tient.torse = 4;
      var pince = {}; for(k in tient) pince[k] = tient[k]; pince.mB = [166, 156]; pince.hB = -60; pince.sB = 1.06;
      var tire = {}; for(k in pince) tire[k] = pince[k]; tire.mB = [154, 154];
      return this.jouer([{d:380, p:tient, e:'io'}, {d:260, p:pince, e:'io'}, {d:160, p:tire, e:'io', f0:function(){ if(ok()){ c.mode = 'tire'; relancer(me); } }},
        {d:60, p:pince, e:'oo', f0:function(){ c.mode = 'libre'; c.vib = 5; relancer(me); }}, {d:420, p:pince, e:'lin'}, {d:200, p:tire, e:'io', f0:function(){ if(ok()){ c.mode = 'tire'; relancer(me); } }},
        {d:60, p:pince, e:'oo', f0:function(){ c.mode = 'libre'; c.vib = 4; relancer(me); }}, {d:300, p:pince, e:'lin', f:function(){ if(ok()) me.cligner(); }}, {d:420, p:g, e:'io'}]).then(function(){ c.mode = 'libre'; });
    }
    var regarde = {}; for(var k2 in g) regarde[k2] = g[k2];
    regarde.tete = -14; regarde.torse = -2; regarde.mB = [96, 86]; regarde.hB = -150;
    return this.jouer([{d:420, p:regarde, e:'io'}, {d:300, p:regarde, e:'lin'}, {d:420, p:g, e:'io'}]);
  },
  arret:function(){ this.corde.mode = 'libre'; }
};

/* ---------- le tir à l'arc ---------- */
H.tirer = function(scene, to, type, opt){
  if(type && typeof type === 'object'){ opt = type; type = opt.type; }
  type = type || 'normale'; opt = opt || {};
  if(type === 'rebond'){ type = 'normale'; opt.rebond = true; }
  var me = this, lourd = type === 'lourde', neuve = FL2[type] || opt.rebond;
  return this._file(function(sig){
    var c = this.corde, g = this.garde();
    var p0 = this.rep('poignee', scene), alpha = Math.max(-35, Math.min(30, Math.atan2(to.y - p0.y, to.x - p0.x) * DEG));
    var tor = 2 + alpha * 0.3, al = alpha - tor, ar = al / DEG;
    var S = SQ.brasA, bras = [S[0] + 71 * Math.cos(ar), S[1] + 71 * Math.sin(ar)];
    var base = {racine:{}, bassin:{y:9, r:-2}, pA:[96, 272], pB:[164, 272]};
    function P(o){ var p = {}; for(var k in base) p[k] = base[k]; for(k in o) p[k] = o[k]; return p; }
    var cherche = P({torse:-4, tete:-10, mA:[176, 146], hA:-10, mB:[92, 54], hB:-150, cB:1, arc:{}});
    var encoche = P({torse:tor - 2, tete:-2, mA:[S[0] + 60 * Math.cos(ar), S[1] + 6 + 60 * Math.sin(ar)], hA:al, mB:[152, 128], hB:al - 20, arc:{}});
    var bande = P({torse:tor - 3, tete:-1 + al * 0.4, mA:bras, hA:al, mB:[120, 98], sB:1.12, cB:-1, hB:al - 10, arc:{sx:1.2, sy:0.95}});
    var tremble = P({torse:tor - 3.4, tete:-1.3 + al * 0.4, mA:[bras[0] - 0.6, bras[1] + 0.4], hA:al, mB:[118, 98], sB:1.14, cB:-1, hB:al - 10, arc:{sx:1.22, sy:0.945}});
    var lache = P({bassin:{x:-2, y:10, r:-3}, torse:tor - 7, tete:-3 + al * 0.4, mA:[bras[0] - 2, bras[1] - 1], hA:al - 4, mB:[86, 92], sB:1.1, cB:-1, hB:-150, arc:{sx:0.93, sy:1.02}});
    var suite = P({torse:tor - 5, tete:-2 + al * 0.4, mA:bras, hA:al, mB:[84, 96], cB:-1, hB:-160, arc:{sx:1.03, sy:0.99}});
    if(lourd){
      /* la flèche lourde : l'arc se bande plus fort (et plus lentement), le bras tremble, puis l'arc RECULE en lâchant */
      bande = P({bassin:{y:12, r:-3}, torse:tor - 5, tete:al * 0.4, mA:bras, hA:al, mB:[112, 96], sB:1.16, cB:-1, hB:al - 10, arc:{sx:1.34, sy:0.9}});
      tremble = P({bassin:{y:12, r:-3}, torse:tor - 5.6, tete:-0.6 + al * 0.4, mA:[bras[0] - 1.2, bras[1] + 0.8], hA:al + 1.5, mB:[110, 97], sB:1.18, cB:-1, hB:al - 10, arc:{sx:1.36, sy:0.89}});
      lache = P({bassin:{x:-10, y:12, r:-7}, torse:tor - 14, tete:-8 + al * 0.4, mA:[bras[0] - 14, bras[1] - 12], hA:al - 16, mB:[78, 88], sB:1.1, cB:-1, hB:-150, arc:{sx:0.86, sy:1.05, r:-8}});
      suite = P({bassin:{x:-6, y:11, r:-5}, torse:tor - 10, tete:-4 + al * 0.4, mA:[bras[0] - 6, bras[1] - 4], hA:al - 8, mB:[82, 94], cB:-1, hB:-160, arc:{sx:1.06, sy:0.98, r:3}});
    }
    var suite2 = P({torse:tor - 5, tete:-2 + al * 0.4, mA:bras, hA:al, mB:[84, 98], cB:-1, hB:-160, arc:{}});
    this.expr('vise');
    var tween = function(ms, f){ var t0 = performance.now(); (function s(n){ var t = Math.min(1, (n - t0) / ms); f(t); if(t < 1) requestAnimationFrame(s); })(t0); };
    var vole;
    return this.jouer([
      {d:240, p:cherche, e:'io', f:function(){ c.fl = 1; c.blend = 0; me._typeFleche(type); }},
      {d:90, p:cherche, e:'lin'},
      {d:280, p:encoche, e:'io', f0:function(){ tween(240, function(t){ c.blend = t * t; }); }, f:function(){ c.mode = 'tire'; c.blend = 1; }},
      {d:lourd ? 640 : 400, p:bande, e:'cubic-bezier(.5,0,.35,1)', f0:function(){ me.expr('effort'); }}].concat(lourd ?
      [{d:90, p:tremble, e:'io'}, {d:90, p:bande, e:'io'}, {d:80, p:tremble, e:'io'}, {d:80, p:bande, e:'io'}, {d:70, p:tremble, e:'io'}] :
      [{d:110, p:tremble, e:'io'}, {d:110, p:bande, e:'io'}, {d:90, p:tremble, e:'io'}], [
      {d:60, p:lache, e:'oo', f0:function(){
        var n = me.rep('flN', scene), t = me.rep('flP', scene);
        c.mode = 'libre'; c.vib = lourd ? 14 : 9; c.fl = 0;
        vole = (neuve ? me._fleche2 : me._fleche).call(me, scene, n, t, to, type, opt).then(sig);
        if(lourd) me._recul();
      }},
      {d:lourd ? 200 : 120, p:suite, e:'o', f0:function(){ me.expr('cri'); }}, {d:200, p:suite2, e:'io'}, {d:120, p:suite2, e:'lin'},
      {d:420, p:g, e:'b', f0:function(){ me.expr('garde'); }}
    ])).then(function(){ return vole; });
  });
};
H._typeFleche = function(type){
  var sv = this.svg;
  TYPES_FL.forEach(function(t){ [].forEach.call(sv.querySelectorAll('[data-fleche] [data-' + t + ']'), function(e){ e.style.display = t === type ? '' : 'none'; }); });
};
H._fleche = function(scene, n, t, to, type, opt){
  var L = couche(scene), len = Math.hypot(t.x - n.x, t.y - n.y), k = len / 124;
  var w = div(L, 'width:0;height:0;z-index:3');
  var tr = div(w, 'left:' + (-len - 70 * k) + 'px;top:' + (-2.5 * k) + 'px;width:' + (len * 0.9) + 'px;height:' + (5 * k) + 'px;border-radius:3px;background:linear-gradient(90deg,rgba(255,255,255,0),' +
    ({feu:'rgba(255,150,50,.75)', huile:'rgba(90,70,40,.5)', colle:'rgba(230,245,210,.7)'}[type] || 'rgba(255,250,220,.6)') + ');filter:blur(1px)');
  tr.style.transform = 'none';
  var a = div(w, 'left:' + (-len - 14 * k) + 'px;top:' + (-16 * k) + 'px;width:' + (150 * k) + 'px;height:' + (32 * k) + 'px', FLECHE_SVG(type));
  a.style.transform = 'none';
  if(type === 'feu'){ var fe = a.querySelector('[data-feu]'); fe.style.transformBox = 'fill-box'; fe.style.transformOrigin = '30% 70%'; fe.animate([{transform:'scale(1,1)'}, {transform:'scale(1.25,.85)'}, {transform:'scale(.9,1.2)'}], {duration:120, iterations:Infinity, direction:'alternate'}); }
  var dist = Math.hypot(to.x - t.x, to.y - t.y), D = Math.max(220, Math.min(560, dist / 1.5)), last = 0;
  var me = this;
  return voler(w, t, to, {d:D, haut:dist * 0.06, chaque:function(p, ang, u){
    var now = performance.now(); if(now - last < 16) return; last = now;
    var bx = p.x - Math.cos(ang / DEG) * len * 0.6, by = p.y - Math.sin(ang / DEG) * len * 0.6;
    if(type === 'feu'){
      gerbe(L, p.x - Math.cos(ang / DEG) * 8, p.y - Math.sin(ang / DEG) * 8, {n:3, c:['#ffd84a', '#ff8a2a', '#ff5a1a'], angle:ang + 180, ecart:30, v0:20, v1:80, g:-160, t0:3, t1:7, d0:250, d1:500});
      if(Math.random() < 0.5) onde(L, bx, by, {css:'background:radial-gradient(circle,rgba(60,40,50,.45),rgba(60,40,50,0) 70%)', w:14, s0:0.6, s1:2.4, d:600});
    } else if(type === 'huile'){
      gerbe(L, p.x - Math.cos(ang / DEG) * 6, p.y + 4, {n:1, c:'#2a2014', angle:90, ecart:20, v0:10, v1:40, g:700, t0:4, t1:6, d0:400, d1:600, lueur:false});
      if(Math.random() < 0.4) gerbe(L, p.x, p.y + 4, {n:1, c:'#6a5a30', angle:90, ecart:10, v0:10, v1:30, g:700, t0:2, t1:3, d0:400, d1:500, lueur:false});
    } else if(type === 'colle'){
      if(Math.random() < 0.6){
        var f = div(L, 'width:' + alea(16, 26) + 'px;height:2px;border-radius:2px;background:#eef6dc;box-shadow:0 0 3px #fff');
        jouerEl(f, [{transform:place(bx, by, ang + alea(-20, 20), 1), opacity:.9}, {transform:place(bx - 6, by + 14, ang + alea(-60, 60), 0.6) + ' scaleY(1)', opacity:0}], {duration:alea(380, 600), easing:'ease-in'});
      }
      gerbe(L, p.x, p.y, {n:1, c:'#f2f8e4', angle:90, ecart:30, v0:10, v1:30, g:500, t0:3, t1:5, d0:400, d1:600});
    } else if(u > 0.05 && Math.random() < 0.6) gerbe(L, bx, by, {n:1, c:'#fff6d0', angle:ang + 180, ecart:20, v0:10, v1:40, g:0, t0:2, t1:3, d0:200, d1:350});
  }}).then(function(r){
    me._impactFleche(L, r, type, w, a, tr, k);
    if(opt.onImpact) try { opt.onImpact(r); } catch(e){ console.error(e); }
    return r;
  });
};
H._impactFleche = function(L, r, type, w, a, tr, k){
  tr.animate([{opacity:1}, {opacity:0}], {duration:120, fill:'forwards'});
  /* la flèche reste plantée un instant et vibre */
  var ang = r.ang;
  w.animate([{transform:place(r.x, r.y, ang)}, {transform:place(r.x + 2, r.y, ang - 6)}, {transform:place(r.x + 1, r.y, ang + 4)}, {transform:place(r.x + 1, r.y, ang - 2)}, {transform:place(r.x + 1, r.y, ang)}], {duration:360, fill:'forwards'});
  w.animate([{opacity:1}, {opacity:1, offset:.75}, {opacity:0}], {duration:900, fill:'forwards'}).finished.then(function(){ w.remove(); });
  if(type === 'feu'){
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#fff6c0,#ffb040 35%,rgba(255,90,20,.6) 55%,rgba(255,60,20,0) 72%)', w:70, s0:0.2, s1:1.9, d:520});
    onde(L, r.x, r.y, {w:50, c:'#ff9a3a', ep:4, s0:0.3, s1:2.6, d:500});
    gerbe(L, r.x, r.y, {n:22, c:['#ffe36a', '#ff9a2a', '#ff5a1a', '#fff'], v0:60, v1:220, g:-120, t0:4, t1:9, d0:400, d1:900});
    for(var i = 0; i < 4; i++) onde(L, r.x + alea(-14, 14), r.y - 10 - i * 8, {css:'background:radial-gradient(circle,rgba(60,40,55,.55),rgba(60,40,55,0) 70%)', w:30, s0:0.5, s1:2.6, d:900, retard:150 + i * 80});
  } else if(type === 'huile'){
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#3a2c18,#2a2010 50%,rgba(40,30,15,0) 72%)', w:56, h:40, s0:0.3, s1:1.5, d:700, o0:0.95});
    gerbe(L, r.x, r.y, {n:16, c:['#2a2014', '#4a3a20', '#6a5a30'], angle:-90, ecart:80, v0:80, v1:200, g:700, t0:4, t1:8, d0:450, d1:750, lueur:false});
    gerbe(L, r.x, r.y, {n:5, c:'#d8c890', angle:-90, ecart:80, v0:60, v1:150, g:600, t0:2, t1:3, d0:400, d1:600});
  } else if(type === 'colle'){
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#ffffff,#eef6dc 45%,rgba(220,240,200,0) 72%)', w:60, s0:0.3, s1:1.4, d:900, o0:0.95});
    for(var j = 0; j < 7; j++){
      var an = alea(0, 360), ln = alea(22, 40), f = div(L, 'width:' + ln + 'px;height:3px;border-radius:3px;background:#eef6dc;box-shadow:0 0 4px #fff;transform-origin:0 50%');
      jouerEl(f, [{transform:'translate(' + r.x + 'px,' + r.y + 'px) rotate(' + an + 'deg) scaleX(0)', opacity:1}, {transform:'translate(' + r.x + 'px,' + r.y + 'px) rotate(' + (an + 8) + 'deg) scaleX(1)', opacity:1, offset:.3},
        {transform:'translate(' + r.x + 'px,' + (r.y + 10) + 'px) rotate(' + (an + 20) + 'deg) scaleX(.9)', opacity:0}], {duration:alea(800, 1100), easing:'ease-out'});
    }
    gerbe(L, r.x, r.y, {n:10, c:'#f4faea', v0:40, v1:120, g:400, t0:3, t1:6, d0:500, d1:800});
  } else {
    onde(L, r.x, r.y, {css:'background:radial-gradient(circle,#fff,rgba(255,240,180,.6) 40%,rgba(255,240,180,0) 70%)', w:46, s0:0.2, s1:1.5, d:300});
    gerbe(L, r.x, r.y, {n:12, c:['#fff', '#ffe08a'], angle:ang + 180, ecart:70, v0:90, v1:240, g:300, forme:'trait', t0:8, t1:14, d0:220, d1:420});
  }
};

/* ---------- le coup de dague ---------- */
H.dague = function(scene, to, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde();
    var pied = this.rep('chevilleB', scene), pBoite = this.rep('chevilleB');
    var dx = Math.max(0, to.x - pied.x - 56), dy = 0;
    var dagueC = this.$('[data-dague-ceinture]'), dagueM = this.$('[data-dague-main]');
    var base = {racine:{}, pA:[98, 272], pB:[162, 272]};
    function P(o){ var p = {}; for(var k in base) p[k] = base[k]; for(var k2 in o) p[k2] = o[k2]; return p; }
    var prend = P({bassin:{y:12}, torse:10, tete:0, mA:[172, 150], hA:-4, mB:[150, 150], hB:-90, arc:{}});
    var tasse = P({bassin:{y:30, x:-4}, torse:22, tete:-8, pA:[92, 272], pB:[168, 272], mA:[150, 166], hA:-10, mB:[84, 132], hB:-170, arc:{}});
    var saute = {racine:{y:-30}, bassin:{y:-4}, torse:18, tete:-12, pA:[98, 250], fA:30, pB:[176, 246], fB:-10, mA:[130, 150], hA:-30, mB:[90, 60], cB:1, hB:-150};
    var frappe = {racine:{y:0}, bassin:{y:20, x:6}, torse:28, tete:-4, pA:[86, 272], pB:[176, 272], mA:[120, 160], hA:-20, mB:[198, 150], hB:-20, sB:1.12};
    var tient = {racine:{y:0}, bassin:{y:18, x:6}, torse:24, tete:-2, pA:[86, 272], pB:[176, 272], mA:[124, 160], hA:-20, mB:[196, 160], hB:-10, sB:1.08};
    var recule = {racine:{y:-26}, bassin:{y:-2}, torse:-12, tete:-6, pA:[92, 250], fA:20, pB:[150, 252], fB:10, mA:[176, 130], hA:-6, mB:[150, 120], hB:-40};
    var atterrit = P({bassin:{y:22}, torse:12, tete:-4, mA:[176, 150], hA:-4, mB:[150, 146], hB:-60});
    var range = P({bassin:{y:10}, torse:6, tete:-4, mA:[178, 150], hA:-4, mB:[150, 150], hB:-90});
    var tT = 0, tJ = 300;
    return this.jouer([
      {d:200, p:prend, e:'io', f:function(){ dagueC.style.display = 'none'; dagueM.style.display = ''; me.expr('colere'); }},
      {d:200, p:tasse, e:'io', f:function(){ me.expr('cri'); me.boite.animate([{transform:'translate(0px,0px)'}, {transform:'translate(' + dx + 'px,0px)'}], {duration:tJ, easing:'cubic-bezier(.3,.45,.45,1)', fill:'forwards'}); }},
      {d:tJ * 0.55, p:saute, e:'o'}, {d:tJ * 0.45, p:frappe, e:'i', f0:function(){ me.plus(tJ * 0.2, function(){ me._lame(scene, to); }); }, f:function(){
        me._impactDague(scene, to); sig(to); if(opt.onImpact) try { opt.onImpact(to); } catch(e){ console.error(e); }
      }},
      {d:180, p:tient, e:'o'},
      {d:330, p:recule, e:'o', f0:function(){ me.expr('garde'); var a = me.boite.getAnimations(); me.boite.animate([{transform:'translate(' + dx + 'px,0px)'}, {transform:'translate(0px,0px)'}], {duration:330, easing:'cubic-bezier(.3,.6,.4,1)', fill:'forwards'}).finished.then(function(){ a.concat(me.boite.getAnimations()).forEach(function(x){ x.cancel(); }); }); }},
      {d:160, p:atterrit, e:'i', f:function(){ me._poussiere(); }},
      {d:240, p:range, e:'io', f:function(){ dagueC.style.display = ''; dagueM.style.display = 'none'; }},
      {d:380, p:g, e:'b'}
    ]);
  });
};
/* le croissant de lumière de la lame */
H._lame = function(scene, to){
  var L = couche(scene), id = 'hal' + (++uid);
  var e = div(L, 'width:160px;height:160px', '<svg viewBox="-80 -80 160 160" style="width:100%;height:100%;overflow:visible"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#e8fdff"/><stop offset="1" stop-color="#8ff3ff"/></linearGradient></defs>' +
    '<path d="M-52 -46 A 70 70 0 0 1 40 50 A 62 62 0 0 0 -52 -46 Z" fill="url(#' + id + ')" style="filter:drop-shadow(0 0 6px #8ff3ff) drop-shadow(0 0 2px #fff)"/>' +
    '<path d="M-44 -40 A 62 62 0 0 1 34 44" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.12s" fill="freeze"/></path></svg>');
  jouerEl(e, [{transform:place(to.x - 8, to.y - 6, -30, 0.7), opacity:0}, {transform:place(to.x - 4, to.y - 4, 0, 1), opacity:1, offset:.25}, {transform:place(to.x, to.y, 18, 1.08), opacity:0}], {duration:360, easing:'ease-out'});
};
H._impactDague = function(scene, to){
  var L = couche(scene);
  onde(L, to.x, to.y, {css:'background:radial-gradient(circle,#fff,rgba(200,250,255,.7) 35%,rgba(150,240,255,0) 70%)', w:60, s0:0.3, s1:1.6, d:320});
  onde(L, to.x, to.y, {w:40, c:'#bff8ff', ep:3, s0:0.3, s1:2.2, d:420});
  gerbe(L, to.x, to.y, {n:14, c:['#fff', '#bff8ff', '#ffe08a'], angle:30, ecart:80, v0:120, v1:280, g:400, forme:'trait', t0:8, t1:16, d0:220, d1:420});
};

/* ============ l'Alchimiste : rôle ============ */
ROLES.alchimiste = {
  fab:alchimiste, bouche:'sourire',
  garde:{racine:{}, bassin:{y:9}, torse:6, tete:-4, pA:[96, 272], pB:[160, 272], mA:[184, 132], hA:-84, mB:[128, 138], hB:0, marmite:0},
  gardeChoisi:{racine:{}, bassin:{y:4}, torse:1, tete:-8, pA:[100, 272], pB:[156, 272], mA:[186, 124], hA:-80, mB:[130, 128], hB:0, marmite:0},
  joie:{mA:[178, 44], hA:-150, mB:[98, 30], hB:0},
  course:function(p, f){ p.brasB = -60 + 18 * Math.cos(2 * Math.PI * f); p.avantBrasB = -70; p.mainB = 130; },
  frein:function(p){ p.brasB = -20; p.avantBrasB = -100; p.mainB = 120; },
  init:function(){
    this.fioleB = this.$('[data-fiole-b] [data-fiole]'); this.fioleA = this.$('[data-fiole-main] [data-fiole]');
    this.filet = this.$('[data-filet]');
    this._couleur(this.fioleB, '#ff8a3a');
    this._bul = 0;
  },
  idle:function(A){
    var h = this._halo(this.$('[data-fiole-b] [data-halo]'));
    if(h){ h.style.transformBox = 'fill-box'; if(!this.cuit) h.style.transformOrigin = '50% 50%'; A.push(h.animate([{opacity:.45, transform:'scale(.9)'}, {opacity:.85, transform:'scale(1.08)'}], {duration:900, iterations:Infinity, direction:'alternate', easing:'ease-in-out'})); }
  },
  /* cuit, au repos : trois bulles qui montent en boucle dans la fiole (CSS), au lieu d'en fabriquer à chaque instant */
  cuit:function(){
    var g = this.fioleB && this.fioleB.querySelector('[data-bulles]'), c = this.fioleB && this.fioleB.querySelector('[data-r$="c"]');
    if(!g || !c || !g.ownerSVGElement) return;
    var hote = g.ownerSVGElement.parentNode, cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy');
    [[-4, 1.8, 0], [3, 2.2, -.45], [-1, 1.5, -.9]].forEach(function(b){
      var d = window.Cuire.ilot(hote, '<circle cx="' + (cx + b[0]) + '" cy="' + (cy + 10) + '" r="' + b[1] + '" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width=".8"/>', 'ha-calme-seul ha-bulle-boucle');
      d.style.transformOrigin = (cx + b[0]) + 'px ' + (cy + 10) + 'px'; d.style.animationDelay = b[2] + 's';
    });
  },
  lire:function(){ if(this._verse){ mat(this.filet); mat(this.reps[this.fioleA.getAttribute('data-fiole') + 'bec']); mat(this.reps[this.fioleB.getAttribute('data-fiole') + 'bec']); } },
  /* les bulles qui montent dans la fiole (tout le temps), plus fort quand il secoue */
  pas:function(dt){
    this._bul += dt * (this._bouillon || (this.ko ? 0 : 2.4));
    while(this._bul > 1){ this._bul -= 1; this._bulle(this.fioleB); }
    if(this._verse){
      var Mi = inv(mat(this.filet)), a = ou2(this.reps[this.fioleA.getAttribute('data-fiole') + 'bec'], Mi), b = ou2(this.reps[this.fioleB.getAttribute('data-fiole') + 'bec'], Mi);
      var mx = (a[0] + b[0]) / 2 - 4, my = Math.min(a[1], b[1]) - 2;
      this.filet.setAttribute('d', 'M' + r1(a[0]) + ' ' + r1(a[1]) + ' Q ' + r1(mx) + ' ' + r1(my) + ' ' + r1(b[0]) + ' ' + r1(b[1] - 4));
    }
  },
  geste:function(ok){
    var me = this, g = this.garde();
    /* (cuit et endormi : la fiole bouillonne en CSS, classe ha-bout, sans réveiller la boucle) */
    var bout = function(on){ me._bouillon = on ? 14 : 0; me.racine.classList.toggle('ha-bout', !!on); };
    var leve = {}; for(var k in g) leve[k] = g[k];
    leve.mB = [132, 108]; leve.tete = -12; leve.torse = 3;
    var s1 = {}; for(k in leve) s1[k] = leve[k]; s1.hB = -22;
    var s2 = {}; for(k in leve) s2[k] = leve[k]; s2.hB = 22;
    return this.jouer([{d:360, p:leve, e:'io', f:function(){ if(ok()){ bout(true); me.expr('content'); } }},
      {d:90, p:s1, e:'io'}, {d:110, p:s2, e:'io'}, {d:110, p:s1, e:'io'}, {d:110, p:s2, e:'io'}, {d:90, p:leve, e:'io', f:function(){ me._fumee(); }},
      {d:500, p:leve, e:'lin', f:function(){ bout(false); if(ok()) me.expr('garde'); }}, {d:420, p:g, e:'io'}]).then(function(){ bout(false); });
  }
};
function ou2(r, Mi){ var m = mat(r), p = ap(m, +r.getAttribute('cx'), +r.getAttribute('cy')); return ap(Mi, p[0], p[1]); }
/* cuit : le halo de la fiole est un petit îlot ; on anime son <div> (pivot au centre du halo) : la carte graphique s'en charge */
H._halo = function(h){
  if(!h || !this.cuit) return h;
  var d = h.ownerSVGElement && h.ownerSVGElement.parentNode;
  if(!d) return h;
  if(!d._pret){
    d._pret = 1;
    d.style.transformOrigin = h.getAttribute('cx') + 'px ' + h.getAttribute('cy') + 'px';
    d.style.opacity = h.getAttribute('opacity') || 1; h.setAttribute('opacity', 1);
    d.classList.add('ha-anime');
  }
  return d;
};
H._couleur = function(fiole, c){
  if(!fiole) return;
  fiole._c = c;
  [].forEach.call(fiole.querySelectorAll('[data-coul]'), function(e){ e.setAttribute('fill', c); });
  var id = fiole.getAttribute('data-fiole'), gr = this.svg.getElementById ? this.svg.getElementById(id + 'h') : this.svg.querySelector('#' + id + 'h');
  if(gr){ var st = gr.querySelectorAll('stop'); st[1].setAttribute('stop-color', c); st[2].setAttribute('stop-color', c); }
};
H._bulle = function(fiole, fort){
  var g = fiole.querySelector('[data-bulles]'), c = fiole.querySelector('[data-r$="c"]');
  if(!g || !c) return;
  var cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), r = alea(1.2, fort ? 3.2 : 2.4), x = cx + alea(-7, 7);
  /* cuit : chaque bulle est son propre petit <div> (rien à repeindre pendant qu'elle monte) */
  var b = this.cuit && g.ownerSVGElement ? window.Cuire.ilot(g.ownerSVGElement.parentNode, '<circle cx="' + r1(x) + '" cy="' + r1(cy + 10) + '" r="' + r1(r) + '" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-width=".8"/>')
    : nouveau(g, 'circle', {cx:x, cy:cy + 10, r:r, fill:'#fff', 'fill-opacity':.55, stroke:'#fff', 'stroke-width':.8});
  b.animate([{transform:'translate(0px,0px)', opacity:0}, {transform:'translate(' + alea(-2, 2) + 'px,-6px)', opacity:1, offset:.2}, {transform:'translate(' + alea(-3, 3) + 'px,-' + alea(14, 22) + 'px)', opacity:.9, offset:.8}, {transform:'translate(0px,-' + alea(24, 34) + 'px) scale(1.4)', opacity:0}],
    {duration:alea(700, 1100), easing:'ease-out'}).finished.then(function(){ b.remove(); });
};
H._fumee = function(){
  var p = this.rep('pince'), c = this.fioleB._c || '#ff8a3a';
  for(var k = 0; k < 4; k++) onde(this.fx, p.x + alea(-6, 6), p.y - 44 - k * 6, {css:'background:radial-gradient(circle,' + c + '88,' + c + '00 70%)', w:18, s0:0.4, s1:2.2, d:900, retard:k * 90});
};

/* ---------- préparer : il verse une fiole dans l'autre, mélange, ça s'illumine ---------- */
function copie(g, o){ var p = {}; for(var k in g) p[k] = g[k]; for(var k2 in o) p[k2] = o[k2]; return p; }
H.preparer = function(couleur){
  couleur = couleur || '#5fd08a';
  return this._file(function(){
    var me = this, g = this.garde(), band = this.$('[data-band="1"]');
    var mainF = this.$('[data-fiole-main]'), gantT = this.$('[data-gantA="tient"]'), gantO = this.$('[data-gantA="ouvert"]');
    var liqB = this.fioleB.querySelector('[data-liq]');
    this._couleur(this.fioleA, couleur);
    this.avant('A', true);
    var base = {bassin:{y:9}, pA:[98, 272], pB:[160, 272]};
    var prend = copie(g, copie(base, {torse:4, tete:2, mA:[124, 120], hA:-10, mB:[124, 142], hB:0}));
    var leve = copie(g, copie(base, {torse:2, tete:10, mA:[156, 96], hA:-20, mB:[124, 158], hB:4}));
    var verse = copie(leve, {mA:[152, 99], hA:-122, tete:12, mB:[124, 158], hB:0});
    var verse2 = copie(leve, {mA:[151, 97], hA:-130, tete:12, mB:[125, 159], hB:0});
    var jette = copie(leve, {mA:[112, 52], hA:-210, tete:4});
    var s1 = copie(leve, {mA:[170, 130], hA:-70, mB:[126, 134], hB:-26, tete:4}), s2 = copie(s1, {hB:26, mB:[129, 131]});
    var montre = copie(g, copie(base, {torse:0, tete:-6, mA:[180, 120], hA:-80, mB:[140, 122], hB:0}));
    var t0 = performance.now();
    return this.jouer([
      {d:150, p:prend, e:'io', f:function(){ band.style.display = 'none'; mainF.style.display = ''; gantT.style.display = ''; gantO.style.display = 'none'; me.expr('content'); }},
      {d:150, p:leve, e:'io'},
      {d:110, p:verse, e:'io', f:function(){
        me.filet.setAttribute('stroke', couleur); me.filet.style.display = ''; me._verse = true; me._couleur(me.fioleB, couleur);
        liqB.animate([{transform:'scaleY(.25)'}, {transform:'scaleY(1)'}], {duration:260, easing:'ease-out'});
        me.filet.animate([{strokeWidth:1}, {strokeWidth:4.5, offset:.3}, {strokeWidth:3}, {strokeWidth:1}], {duration:260});
      }},
      {d:150, p:verse2, e:'lin', f:function(){ me._verse = false; me.filet.style.display = 'none'; }},
      {d:110, p:jette, e:'o', f:function(){ mainF.style.display = 'none'; gantT.style.display = 'none'; gantO.style.display = ''; me._jetteFiole(couleur); }},
      {d:60, p:s1, e:'io', f0:function(){ me._bouillon = 30; }}, {d:60, p:s2, e:'io'}, {d:60, p:s1, e:'io'}, {d:60, p:s2, e:'io'},
      {d:140, p:montre, e:'b', f0:function(){ me.avant('A', false); me._eclatCouleur(couleur); }},
      {d:120, p:montre, e:'lin', f:function(){ me._bouillon = 0; band.style.display = ''; }},
      {d:300, p:g, e:'io', f:function(){ me.expr('garde'); }}
    ]).then(function(){ me._bouillon = 0; });
  });
};
H._jetteFiole = function(c){
  var p = this.rep('mainA'), e = div(this.fx, 'width:18px;height:22px', fioleSVG(c, true));
  var kf = []; for(var i = 0; i <= 8; i++){ var t = i / 8; kf.push({transform:place(p.x - 70 * t, p.y - 50 * t + 140 * t * t, -720 * t, 0.9), opacity:t > 0.8 ? (1 - t) * 5 : 1}); }
  jouerEl(e, kf, {duration:650, easing:'linear'});
};
H._eclatCouleur = function(c){
  var p = this.rep(this.fioleB.getAttribute('data-fiole') + 'c');
  onde(this.fx, p.x, p.y + 4, {css:'background:radial-gradient(circle,#fff 0,' + c + ' 35%,' + c + '00 70%)', w:40, s0:0.3, s1:1.5, d:480});
  gerbe(this.fx, p.x, p.y - 6, {n:12, c:[c, '#fff'], angle:-90, ecart:70, v0:40, v1:120, g:-40, t0:3, t1:5, d0:500, d1:800});
  scintille(this.fx, p.x, p.y - 10, {n:5, rx:20, ry:20, c:['#fff', c], etale:200});
  var h = this._halo(this.fioleB.querySelector('[data-halo]'));
  h.animate([{opacity:1, transform:'scale(1.35)'}, {opacity:.7, transform:'scale(1)'}], {duration:600, easing:'ease-out'});
};
/* une fiole (pour les projectiles) */
function fioleSVG(c, vide){
  return '<svg viewBox="0 0 40 48" style="width:100%;height:100%;display:block;overflow:visible">' + (vide ? '' : '<circle cx="20" cy="30" r="20" fill="' + c + '" opacity=".35"/>') +
    P('M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z', vide ? '#dff4ff' : c, vide ? ' fill-opacity=".5"' : '') + P('M13 2 L 27 2 L 27 8 L 13 8 Z', '#8a5a32') +
    (vide ? '' : F('M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z', 'rgba(0,0,0,.2)')) +
    L('M14 22 Q 15 18 19 17', '#fff', 2.4, ' opacity=".8"') + C(26, 34, 1.6, '#fff', ' opacity=".6"') + '</svg>';
}

/* ---------- lancer : élan, le bras balance, la fiole vole en tournant et se brise ---------- */
H.lancer = function(scene, to, couleur, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde(), fB = this.$('[data-fiole-b]');
    if(couleur && couleur !== this.fioleB._c) this._couleur(this.fioleB, couleur);
    var c = this.fioleB._c;
    var base = {pA:[92, 272], pB:[164, 272]};
    var elan = copie(g, copie(base, {bassin:{x:-6, y:14, r:-4}, torse:-16, tete:-8, mA:[188, 104], hA:-70, mB:[74, 74], hB:-40, cB:-1}));
    var elan2 = copie(elan, {torse:-19, mB:[70, 78], hB:-50});
    var haut = copie(g, copie(base, {bassin:{x:0, y:12, r:0}, torse:2, tete:-6, mA:[176, 140], hA:-40, mB:[112, 36], hB:20, sB:1.1}));
    var lache = copie(g, copie(base, {bassin:{x:6, y:16, r:4}, torse:18, tete:-2, mA:[150, 156], hA:-20, mB:[190, 96], hB:60, sB:1.14}));
    var suite = copie(g, copie(base, {bassin:{x:8, y:18, r:4}, torse:22, tete:0, mA:[140, 160], hA:-10, mB:[176, 168], hB:80, sB:1.05}));
    var vole;
    this.expr('vise');
    return this.jouer([
      {d:260, p:elan, e:'io'}, {d:120, p:elan2, e:'io', f:function(){ me.expr('cri'); }},
      {d:100, p:haut, e:'i'},
      {d:70, p:lache, e:'lin', f:function(){
        var a = me.rep(me.fioleB.getAttribute('data-fiole') + 'c', scene);
        fB.style.display = 'none';
        vole = me._fioleVole(scene, a, to, c, opt).then(sig);
      }},
      {d:180, p:suite, e:'o'}, {d:160, p:suite, e:'lin'},
      {d:380, p:g, e:'io', f:function(){
        me._couleur(me.fioleB, '#ff8a3a'); fB.style.display = '';
        me.fioleB.animate([{transform:'scale(0)'}, {transform:'scale(1.2)', offset:.6}, {transform:'scale(1)'}], {duration:320, easing:'ease-out'});
        me.expr('garde');
      }}
    ]).then(function(){ return vole; });
  });
};
H._fioleVole = function(scene, a, to, c, opt){
  if(opt._potion) return this._fioleVole2(scene, a, to, c, opt);     /* (givre, acide, huile, colle : sans filtre, voir m-armes.js) */
  var L = couche(scene), e = div(L, 'width:26px;height:31px;filter:drop-shadow(0 0 6px ' + c + ')', fioleSVG(c));
  var dist = Math.hypot(to.x - a.x, to.y - a.y), last = 0;
  return voler(e, a, to, {d:Math.max(420, Math.min(760, dist * 1.3)), haut:120 + dist * 0.26, tourne:620, r0:-20, chaque:function(p){
    var n = performance.now(); if(n - last < 30) return; last = n;
    gerbe(L, p.x, p.y, {n:2, c:[c, '#fff'], angle:90, ecart:90, v0:10, v1:40, g:200, t0:2.5, t1:4.5, d0:300, d1:550});
  }}).then(function(r){
    e.remove();
    onde(L, to.x, to.y, {css:'background:radial-gradient(circle,#fff 0,' + c + ' 30%,' + c + 'aa 50%,' + c + '00 72%)', w:90, h:70, s0:0.2, s1:1.7, d:600});
    onde(L, to.x, to.y, {w:60, c:c, ep:4, s0:0.3, s1:2.6, d:520});
    gerbe(L, to.x, to.y, {n:14, c:['#e8f8ff', '#bfe0f0', '#ffffff'], forme:'eclat', v0:120, v1:260, g:600, t0:6, t1:11, d0:450, d1:750, lueur:false});
    gerbe(L, to.x, to.y, {n:20, c:[c, c, '#fff'], angle:-90, ecart:100, v0:90, v1:240, g:700, t0:4, t1:8, d0:500, d1:850});
    for(var i = 0; i < 3; i++) onde(L, to.x + alea(-16, 16), to.y - 14 - i * 10, {css:'background:radial-gradient(circle,' + c + '77,' + c + '00 70%)', w:36, s0:0.5, s1:2.4, d:1000, retard:120 + i * 90});
    if(opt.onImpact) try { opt.onImpact(r); } catch(err){ console.error(err); }
    return r;
  });
};

/* ---------- la louche : BONG sur la marmite, des ondes de choc ---------- */
H.louche = function(scene){
  return this._file(function(){
    var me = this, g = this.garde();
    var lC = this.$('[data-louche-ceinture]'), lM = this.$('[data-louche-main]'), gantT = this.$('[data-gantA="tient"]'), gantO = this.$('[data-gantA="ouvert"]');
    var base = {pA:[96, 272], pB:[160, 272]};
    var prend = copie(g, copie(base, {bassin:{y:10}, torse:8, tete:2, mA:[162, 162], hA:60}));
    var arme = copie(g, copie(base, {bassin:{y:6, r:-2}, torse:-8, tete:-12, mA:[150, 46], hA:-120, mB:[120, 124], hB:0}));
    var arme2 = copie(arme, {mA:[146, 44], hA:-128, torse:-10});
    var mi = copie(g, copie(base, {bassin:{y:12}, torse:4, tete:-4, mA:[184, 70], hA:-10, mB:[120, 128], hB:0}));
    var frappe = copie(g, copie(base, {bassin:{y:16}, torse:10, tete:4, mA:[186, 118], hA:122, mB:[118, 132], hB:0, marmite:{r:0}}));
    var rebond = copie(frappe, {mA:[188, 104], hA:100, torse:6, marmite:{r:-14}});
    var tient = copie(frappe, {mA:[188, 112], hA:110, torse:6, marmite:{r:10}});
    var range = copie(prend, {marmite:{r:-4}});
    return this.jouer([
      {d:170, p:prend, e:'io', f:function(){ lC.style.display = 'none'; lM.style.display = ''; gantT.style.display = ''; gantO.style.display = 'none'; me.avant('A', true); me.expr('cri'); }},
      {d:220, p:arme, e:'io'}, {d:80, p:arme2, e:'io'},
      {d:70, p:mi, e:'i', f0:function(){ me._swoosh(); }}, {d:60, p:frappe, e:'i', f:function(){ me._bong(scene); }},
      {d:140, p:rebond, e:'o', f0:function(){ me.expr('joie'); }}, {d:120, p:tient, e:'io'}, {d:140, p:copie(tient, {marmite:{r:-6}}), e:'io'}, {d:140, p:copie(tient, {marmite:{r:3}}), e:'io'},
      {d:220, p:range, e:'io', f:function(){ lC.style.display = ''; lM.style.display = 'none'; gantT.style.display = 'none'; gantO.style.display = ''; me.avant('A', false); }},
      {d:360, p:copie(g, {marmite:{r:0}}), e:'b', f:function(){ me.expr('garde'); }}
    ]);
  });
};
H._bong = function(scene){
  var L = couche(scene), p = this.rep('marmite', scene);
  mot(L, p.x + 30, p.y - 70, 'BONG !', {t:34, r:-8, c:'#ffe36a', monte:30});
  onde(L, p.x, p.y, {css:'background:radial-gradient(circle,#fff,rgba(255,230,150,.6) 35%,rgba(255,230,150,0) 70%)', w:50, s0:0.3, s1:1.6, d:260});
  for(var i = 0; i < 4; i++){
    onde(L, p.x + 12 + i * 22, p.y - 10, {w:70, h:96, css:'border:' + (4 - i * 0.6) + 'px solid rgba(255,232,160,.9);box-shadow:0 0 8px rgba(255,210,120,.8), inset 0 0 6px rgba(255,210,120,.5);', s0:0.2, s1:1.7 + i * 0.35, d:620 + i * 90, retard:i * 100, e:'cubic-bezier(.2,.6,.4,1)'});
  }
  gerbe(L, p.x, p.y, {n:10, c:['#fff', '#ffe08a'], angle:-60, ecart:70, v0:120, v1:240, g:300, forme:'trait', t0:8, t1:14, d0:250, d1:420});
  scintille(L, p.x + 10, p.y - 30, {n:6, rx:30, ry:20, etale:200});
  this.boite.animate([{transform:'translate(0px,0px)'}, {transform:'translate(-2px,1px)'}, {transform:'translate(2px,-1px)'}, {transform:'translate(-1px,1px)'}, {transform:'translate(0px,0px)'}], {duration:220});
};

/* ---------- les herbes : une pincée de feuilles lumineuses vers un allié ---------- */
var FEUILLE = '<svg viewBox="-10 -6 20 12" style="width:100%;height:100%;display:block;overflow:visible"><path d="M-9 0 Q -2 -7 9 0 Q -2 7 -9 0 Z" fill="#7ef08a" stroke="#1e5a2a" stroke-width="1.4"/><path d="M-8 0 L 8 0 M-2 0 l 3 -3 M2 0 l 3 3" stroke="#1e7a34" stroke-width="1" fill="none"/></svg>';
H.herbes = function(scene, to, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde(), hM = this.$('[data-herbes-main]'), gantT = this.$('[data-gantA="tient"]'), gantO = this.$('[data-gantA="ouvert"]');
    var moi = this.rep('tete', scene), arriere = to.x < moi.x;
    var base = {pA:[96, 272], pB:[160, 272]};
    var prend = copie(g, copie(base, {bassin:{y:12}, torse:10, tete:6, mA:[112, 160], hA:20}));
    var elan = arriere ? copie(g, copie(base, {bassin:{y:8, r:2}, torse:6, tete:-4, mA:[180, 150], hA:-30})) : copie(g, copie(base, {bassin:{y:10}, torse:2, tete:-4, mA:[128, 156], hA:30}));
    var jet = arriere ? copie(g, copie(base, {bassin:{y:8, r:-3}, torse:-12, tete:-14, mA:[104, 46], hA:-150})) : copie(g, copie(base, {bassin:{y:12}, torse:12, tete:-6, mA:[196, 92], hA:-60, sA:1.08}));
    var suite = copie(jet, {torse:arriere ? -14 : 14});
    return this.jouer([
      {d:200, p:prend, e:'io', f:function(){ me.avant('A', true); hM.style.display = ''; gantT.style.display = ''; gantO.style.display = 'none'; var p = me.rep('mainA'); scintille(me.fx, p.x, p.y, {n:4, rx:10, ry:10, c:['#a6ff9a', '#fff'], etale:150}); me.expr('content'); }},
      {d:180, p:elan, e:'io'},
      {d:110, p:jet, e:'o', f0:function(){
        var a = me.rep('mainA', scene);
        me.plus(60, function(){ hM.style.display = 'none'; gantT.style.display = 'none'; gantO.style.display = ''; });
        me._feuilles(scene, a, to, opt).then(sig);
      }},
      {d:240, p:suite, e:'lin'}, {d:360, p:g, e:'io', f:function(){ me.avant('A', false); me.expr('garde'); }}
    ]);
  });
};
H._feuilles = function(scene, a, to, opt){
  var L = couche(scene), ps = [], dist = Math.hypot(to.x - a.x, to.y - a.y);
  for(var i = 0; i < 11; i++) (function(i){
    var e = div(L, 'width:' + alea(12, 18) + 'px;height:' + alea(8, 11) + 'px;filter:drop-shadow(0 0 4px #8aff9a) drop-shadow(0 0 1px #fff)', FEUILLE), last = 0;
    var b = {x:to.x + alea(-26, 26), y:to.y + alea(-30, 24)};
    ps.push(new Promise(function(res){ setTimeout(res, i * 45); }).then(function(){
      return voler(e, {x:a.x + alea(-12, 12), y:a.y + alea(-12, 12)}, b, {d:alea(480, 760) + dist * 0.3, haut:alea(-30, 120) + dist * 0.12, tourne:alea(-540, 540), ease:function(t){ return t + Math.sin(t * Math.PI * 2) * 0.04; }, chaque:function(p, an, t){
        var n = performance.now(); if(n - last < 50) return; last = n;
        gerbe(L, p.x, p.y, {n:1, c:['#c8ffb8', '#8aff9a'], angle:-90, ecart:180, v0:5, v1:20, g:-10, t0:2, t1:3.2, d0:300, d1:500});
      }});
    }).then(function(){ e.animate([{opacity:1}, {opacity:0}], {duration:200, fill:'forwards'}).finished.then(function(){ e.remove(); }); }));
  })(i);
  return Promise.race([ps[0], new Promise(function(r){ setTimeout(r, 2000); })]).then(function(){
    return Promise.all(ps.slice(0, 4));
  }).then(function(){
    onde(L, to.x, to.y, {css:'background:radial-gradient(circle,rgba(220,255,210,.9),rgba(120,240,140,.5) 40%,rgba(120,240,140,0) 70%)', w:90, s0:0.3, s1:1.5, d:600});
    onde(L, to.x, to.y + 30, {w:110, h:26, c:'#8aff9a', ep:3, s0:0.2, s1:1.3, d:700});
    scintille(L, to.x, to.y, {n:10, rx:40, ry:50, c:['#c8ffb8', '#fff', '#8aff9a'], dy:-40, etale:500});
    for(var k = 0; k < 5; k++) gerbe(L, to.x + alea(-30, 30), to.y + alea(-10, 30), {n:1, forme:'html', html:'+', c:'#a6ff9a', angle:-90, ecart:10, v0:40, v1:70, g:-20, t0:16, t1:22, d0:800, d1:1100, retard:k * 90, fondu:2});
    if(opt.onImpact) try { opt.onImpact(to); } catch(err){ console.error(err); }
    return to;
  });
};

/* une traînée de mouvement (arc blanc) quand la louche s'abat */
H._swoosh = function(){
  var p = this.rep('marmite'), id = 'hsw' + (++uid);
  var e = div(this.fx, 'width:90px;height:110px', '<svg viewBox="-45 -55 90 110" style="width:100%;height:100%;overflow:visible"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff6d0" stop-opacity=".8"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>' +
    '<path d="M-30 -50 A 60 60 0 0 1 20 40 A 52 52 0 0 0 -30 -50 Z" fill="url(#' + id + ')"/><path d="M-20 -46 A 56 56 0 0 1 26 30 M-36 -40 A 66 66 0 0 1 12 46" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/></svg>');
  jouerEl(e, [{transform:place(p.x + 26, p.y - 46, -20, 0.8), opacity:0}, {transform:place(p.x + 26, p.y - 44, 0, 1), opacity:1, offset:.3}, {transform:place(p.x + 24, p.y - 40, 15, 1.05), opacity:0}], {duration:260, easing:'ease-out'});
};

/* ============ le Sage : rôle ============ */
ROLES.sage = {
  fab:sage,
  garde:{racine:{}, bassin:{y:4}, torse:3, tete:-3, pA:[106, 272], pB:[152, 272], mA:[160, 172], hA:-24, mB:[150, 146], hB:0},
  gardeChoisi:{racine:{}, bassin:{y:1}, torse:-1, tete:-7, pA:[108, 272], pB:[150, 272], mA:[162, 166], hA:-30, mB:[152, 138], hB:0},
  joie:{mA:[178, 58], hA:-150, mB:[92, 36], hB:-16},
  course:function(p, f){ p.brasB = -40 + 14 * Math.cos(2 * Math.PI * f); p.avantBrasB = -50; p.mainB = 60; },
  frein:function(p){ p.brasB = -60; p.avantBrasB = -20; p.mainB = 70; },
  init:function(){
    this.cristal = this.$('[data-cristal]'); this.crHalo = this.$('[data-cr-halo]');
    this.crHalo.style.transformBox = 'fill-box'; this.crHalo.style.transformOrigin = '50% 50%';
  },
  idle:function(A){
    A.push(this.crHalo.animate([{opacity:.45, transform:'scale(.82)'}, {opacity:1, transform:'scale(1.18)'}], {duration:1100, iterations:Infinity, direction:'alternate', easing:'ease-in-out'}));
    A.push(this.cristal.animate([{transform:'scale(1)'}, {transform:'scale(1.08)'}], {duration:1100, iterations:Infinity, direction:'alternate', easing:'ease-in-out'}));
  },
  /* cuit, au repos : trois étincelles qui montent du cristal en boucle (CSS), au lieu d'en fabriquer toutes les 0,28 s */
  cuit:function(){
    var r = this.reps.cristal, c = this.cristal;
    if(!r || !c) return;
    var x = +r.getAttribute('cx'), y = +r.getAttribute('cy');
    [[-5, 2, 0, '#bff8ff'], [5, -3, -.3, '#e8fdff'], [0, 4, -.6, CYAN]].forEach(function(b){
      var d = window.Cuire.ilot(c.parentNode, '<circle cx="' + (x + b[0]) + '" cy="' + (y + b[1]) + '" r="3.4" fill="' + b[3] + '" opacity=".35"/><circle cx="' + (x + b[0]) + '" cy="' + (y + b[1]) + '" r="1.5" fill="' + b[3] + '"/>', 'ha-calme-seul ha-etinc-boucle');
      d.style.transformOrigin = (x + b[0]) + 'px ' + (y + b[1]) + 'px'; d.style.animationDelay = b[2] + 's';
    });
  },
  pas:function(dt){
    if(!this._idle || this.ko) return;
    this._sc = (this._sc || 0) + dt;
    if(this._sc > 0.28){ this._sc = 0; var p = this.rep('cristal'); gerbe(this.fx, p.x + alea(-6, 6), p.y + alea(-6, 6), {n:1, c:['#bff8ff', '#e8fdff', CYAN], angle:-90, ecart:60, v0:8, v1:24, g:-20, t0:2, t1:3.5, d0:700, d1:1100}); }
  },
  geste:function(ok){
    var me = this, g = this.garde();
    if(Math.random() < 0.55){
      /* il frappe le sol de son bâton : une onde de runes */
      var leve = {}; for(var k in g) leve[k] = g[k]; leve.mB = [152, 128]; leve.tete = -8; leve.torse = 0;
      var tape = {}; for(k in g) tape[k] = g[k]; tape.mB = [150, 150]; tape.bassin = {y:7};
      return this.jouer([{d:340, p:leve, e:'io'}, {d:110, p:tape, e:'i', f:function(){ if(!ok()) return; var p = me.rep('baton-bas'); onde(me.fx, p.x, p.y, {w:70, h:16, c:CYAN, ep:2, s0:0.2, s1:1.8, d:700}); scintille(me.fx, p.x, p.y - 8, {n:5, rx:26, ry:6, dy:-24, c:[CYAN, '#e8fdff'], etale:200}); me.cristalFlash(); }},
        {d:200, p:tape, e:'lin'}, {d:420, p:g, e:'io'}]);
    }
    /* il remonte ses lunettes / se gratte le menton, pensif */
    var pense = {}; for(var k2 in g) pense[k2] = g[k2]; pense.mA = [140, 96]; pense.hA = -170; pense.tete = -10; pense.avA = 1;
    me.avant('A', true);
    return this.jouer([{d:420, p:pense, e:'io', f:function(){ if(ok()) me.expr('content'); }}, {d:500, p:pense, e:'lin'}, {d:420, p:g, e:'io', f:function(){ me.avant('A', false); if(ok()) me.expr('garde'); }}]).then(function(){ me.avant('A', false); });
  }
};
H.cristalFlash = function(fort){
  this.crHalo.animate([{opacity:1, transform:'scale(1)'}, {opacity:1, transform:'scale(' + (fort ? 2.4 : 1.7) + ')', offset:.3}, {opacity:.6, transform:'scale(1)'}], {duration:fort ? 700 : 450, easing:'ease-out'});
};

/* des runes (petits signes gravés), en SVG pour ne dépendre d'aucune police */
var RUNES = ['M-6 8 L 0 -8 L 6 8 M-3 2 L 3 2', 'M-4 -8 L -4 8 M-4 -8 L 5 -3 L -4 2', 'M0 -8 L 0 8 M-6 -4 L 6 4 M6 -4 L -6 4', 'M-6 -6 L 6 6 M-6 6 L 6 -6 M0 -8 L 0 8', 'M-5 -8 L -5 8 M-5 0 L 5 -8 M-5 0 L 5 8', 'M0 -8 L 6 0 L 0 8 L -6 0 Z'];
function rune(i, c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible;filter:drop-shadow(0 0 3px ' + c + ') drop-shadow(0 0 6px ' + c + ')"><path d="' + RUNES[i % RUNES.length] + '" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function cercleRunes(t, id){
  var s = '<svg viewBox="-60 -60 120 120" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible;filter:drop-shadow(0 0 4px #8ff3ff) drop-shadow(0 0 10px #3fd0ff)">' +
    '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#e8fdff" stop-opacity=".55"/><stop offset=".6" stop-color="#3fd0ff" stop-opacity=".15"/><stop offset="1" stop-color="#3fd0ff" stop-opacity="0"/></radialGradient></defs>' +
    '<circle r="56" fill="url(#' + id + ')"/><circle r="50" fill="none" stroke="#bff8ff" stroke-width="2.4"/><circle r="40" fill="none" stroke="#8ff3ff" stroke-width="1.4" stroke-dasharray="4 5"/>' +
    '<g style="transform-origin:0 0;animation:haTourne 1.6s linear infinite">';
  for(var k = 0; k < 8; k++){ var a = k * 45; s += '<g transform="rotate(' + a + ') translate(0 -45) scale(.42)"><path d="' + RUNES[k % RUNES.length] + '" fill="none" stroke="#e8fdff" stroke-width="3" stroke-linecap="round"/></g>'; }
  s += '</g><g style="transform-origin:0 0;animation:haTourneR 2.4s linear infinite"><path d="M0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="none" stroke="#e8fdff" stroke-width="2"/><circle r="7" fill="#e8fdff"/></g></svg>';
  return s;
}

/* ---------- le sort : bâton en avant, cercle de runes, un éclat de lumière qui éclate en étoile ---------- */
H.sort = function(scene, to, opt){
  opt = opt || {};
  return this._file(function(sig){
    var me = this, g = this.garde();
    var c0 = this.rep('cristal', scene), alpha = Math.max(-40, Math.min(30, Math.atan2(to.y - c0.y, to.x - c0.x) * DEG));
    var base = {pA:[100, 272], pB:[160, 272]};
    var leve = copie(g, copie(base, {bassin:{y:6, r:-2}, torse:-6, tete:-10, mB:[136, 70], hB:-14, mA:[176, 120], hA:-70}));
    var pointe = copie(g, copie(base, {bassin:{x:4, y:10, r:2}, torse:6, tete:-6, mB:[176, 76], hB:28 + alpha * 0.4, sB:1.1, mA:[110, 150], hA:-10}));
    var recul = copie(pointe, {bassin:{x:-2, y:10, r:-2}, torse:0, tete:-8, mB:[166, 72], hB:14 + alpha * 0.4, sB:1.04});
    var vole, cercle;
    this.expr('colere');
    return this.jouer([
      {d:280, p:leve, e:'io', f:function(){ me.cristalFlash(true); var p = me.rep('cristal'); scintille(me.fx, p.x, p.y, {n:6, rx:18, ry:18, c:[CYAN, '#fff'], etale:150}); }},
      {d:180, p:pointe, e:'oo', f:function(){ me.expr('cri'); cercle = me._cercle(scene); }},
      {d:260, p:pointe, e:'lin', f:function(){
        var a = me.rep('cristal', scene);
        vole = me._eclair(scene, a, to, opt).then(sig);
        me.cristalFlash(true);
      }},
      {d:120, p:recul, e:'o'}, {d:300, p:recul, e:'lin', f:function(){ me.expr('garde'); }},
      {d:420, p:g, e:'io'}
    ]).then(function(){ return vole; });
  });
};
H._cercle = function(scene){
  var L = couche(scene), p = this.rep('cristal', scene), e = div(L, '', cercleRunes(62, 'hcr' + (++uid)));
  var me = this, vivant = true;
  (function suit(){ if(!vivant) return; var q = me.rep('cristal', scene); e.style.left = (q.x - p.x) + 'px'; e.style.top = (q.y - p.y) + 'px'; requestAnimationFrame(suit); })();
  return jouerEl(e, [{transform:place(p.x + 8, p.y, -90, 0), opacity:0}, {transform:place(p.x + 14, p.y, 0, 1.15), opacity:1, offset:.25}, {transform:place(p.x + 14, p.y, 40, 1), opacity:1, offset:.7}, {transform:place(p.x + 20, p.y, 90, 1.6), opacity:0}],
    {duration:820, easing:'ease-out'}).then(function(){ vivant = false; });
};
H._eclair = function(scene, a, to, opt){
  var L = couche(scene), dist = Math.hypot(to.x - a.x, to.y - a.y), ang = Math.atan2(to.y - a.y, to.x - a.x) * DEG;
  /* le rayon : un trait de lumière qui file */
  var r = div(L, 'width:' + dist + 'px;height:10px;border-radius:6px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(143,243,255,0),rgba(191,248,255,.9) 70%,#fff);filter:blur(1px);box-shadow:0 0 14px #3fd0ff');
  jouerEl(r, [{transform:'translate(' + a.x + 'px,' + (a.y - 5) + 'px) rotate(' + ang + 'deg) scaleX(0) scaleY(1)', opacity:1}, {transform:'translate(' + a.x + 'px,' + (a.y - 5) + 'px) rotate(' + ang + 'deg) scaleX(1) scaleY(1)', opacity:1, offset:.45},
    {transform:'translate(' + a.x + 'px,' + (a.y - 5) + 'px) rotate(' + ang + 'deg) scaleX(1) scaleY(.15)', opacity:0}], {duration:420, easing:'ease-out'});
  var o = div(L, 'width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#fff 0,#fff 30%,#bff8ff 50%,rgba(63,208,255,0) 72%);box-shadow:0 0 18px #8ff3ff,0 0 34px #3fd0ff');
  var last = 0;
  return voler(o, a, to, {d:Math.max(150, Math.min(240, dist * 0.35)), haut:dist * 0.06, chaque:function(p){
    var n = performance.now(); if(n - last < 14) return; last = n;
    gerbe(L, p.x, p.y, {n:2, c:['#e8fdff', CYAN, '#fff'], angle:ang + 180, ecart:40, v0:20, v1:90, g:0, t0:2.5, t1:4.5, d0:250, d1:450});
  }}).then(function(res){
    o.remove();
    var st = div(L, 'width:120px;height:120px', '<svg viewBox="-60 -60 120 120" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 6px #8ff3ff) drop-shadow(0 0 16px #3fd0ff)"><path d="M0 -58 L 9 -9 L 58 0 L 9 9 L 0 58 L -9 9 L -58 0 L -9 -9 Z" fill="#e8fdff"/><path d="M0 -34 L 6 -6 L 34 0 L 6 6 L 0 34 L -6 6 L -34 0 L -6 -6 Z" fill="#fff" transform="rotate(45)"/><circle r="10" fill="#fff"/></svg>');
    jouerEl(st, [{transform:place(to.x, to.y, 0, 0.1), opacity:1}, {transform:place(to.x, to.y, 20, 1.1), opacity:1, offset:.3}, {transform:place(to.x, to.y, 45, 1.4), opacity:0}], {duration:560, easing:'ease-out'});
    onde(L, to.x, to.y, {css:'background:radial-gradient(circle,#fff,rgba(191,248,255,.7) 35%,rgba(63,208,255,0) 70%)', w:80, s0:0.3, s1:1.6, d:420});
    onde(L, to.x, to.y, {w:60, c:CYAN, ep:3, s0:0.3, s1:2.8, d:600});
    gerbe(L, to.x, to.y, {n:16, c:['#fff', CYAN, '#bff8ff'], v0:100, v1:260, g:60, forme:'trait', t0:8, t1:16, d0:300, d1:550});
    scintille(L, to.x, to.y, {n:8, rx:50, ry:40, c:['#e8fdff', CYAN], etale:300});
    if(opt.onImpact) try { opt.onImpact(res); } catch(err){ console.error(err); }
    return res;
  });
};

/* ---------- le bouclier : runes qui montent, un dôme de runes sur l'allié ---------- */
H.bouclier = function(scene, cible, opt){
  opt = opt || {};
  var me = this, L = couche(scene), bq = {}, pret;
  var p = this._file(function(sig){
    var g = this.garde(), base = {pA:[102, 272], pB:[156, 272]};
    var leve = copie(g, copie(base, {bassin:{y:2}, torse:-4, tete:-12, mB:[150, 74], hB:0, mA:[178, 66], hA:-160}));
    var haut = copie(leve, {bassin:{y:-2}, torse:-6, tete:-14, mB:[150, 66], mA:[180, 60]});
    this.expr('colere');
    return this.jouer([
      {d:300, p:leve, e:'io', f:function(){ me.cristalFlash(true); me.expr('cri'); var q = me.rep('baton-bas'); onde(me.fx, q.x, q.y, {w:120, h:26, c:CYAN, ep:3, s0:0.2, s1:1.4, d:800}); me._runesMontent(); }},
      {d:200, p:haut, e:'b'},
      {d:260, p:haut, e:'lin', f:function(){ bq = me._dome(L, scene, cible, opt); sig(bq); }},
      {d:420, p:g, e:'io', f:function(){ me.expr('content'); }},
      {d:300, p:g, e:'lin', f:function(){ me.expr('garde'); }}
    ]);
  });
  pret = p;
  p.absorber = function(n){ return pret.then(function(b){ return b.absorber(n); }); };
  p.retirer = function(){ return pret.then(function(b){ return b.retirer(); }); };
  return p;
};
H._runesMontent = function(){
  var q = this.rep('baton-bas'), me = this;
  for(var k = 0; k < 9; k++) (function(k){
    var x = q.x - 70 + k * 16 + alea(-6, 6), e = div(me.fx, '', rune(k, k % 2 ? CYAN : '#e8fdff', alea(12, 18)));
    jouerEl(e, [{transform:place(x, q.y, 0, 0.4), opacity:0}, {transform:place(x + alea(-6, 6), q.y - 40, 0, 1), opacity:1, offset:.25}, {transform:place(x + alea(-10, 10), q.y - 150 - alea(0, 40), 0, 0.8), opacity:0}],
      {duration:alea(800, 1100), delay:k * 40, easing:'ease-out', fill:'backwards'});
  })(k);
};
/* la forme du dôme, en pixels de sa boîte (w × h) */
function domeChemin(w, h){
  function X(x){ return r1((x + 55) * w / 110); } function Y(y){ return r1(y * h / 104); }
  return 'M' + X(-50) + ' ' + Y(100) + ' C ' + X(-50) + ' ' + Y(30) + ' ' + X(-28) + ' ' + Y(4) + ' ' + X(0) + ' ' + Y(4) + ' C ' + X(28) + ' ' + Y(4) + ' ' + X(50) + ' ' + Y(30) + ' ' + X(50) + ' ' + Y(100) + ' Z';
}
H._dome = function(L, scene, cible, opt){
  var R = scene.getBoundingClientRect(), k = (R.width / (scene.offsetWidth || R.width)) || 1, r = cible.getBoundingClientRect();
  var w = r.width / k * 0.95, h = r.height / k * 0.92, x = (r.left - R.left) / k + r.width / k / 2, yb = (r.bottom - R.top) / k - 4;
  var id = 'hdm' + (++uid);
  var e = document.createElement('div'); e.className = 'ha-dome';
  e.style.cssText = 'left:' + (x - w / 2) + 'px;top:' + (yb - h) + 'px;width:' + w + 'px;height:' + h + 'px;transform-origin:50% 100%';
  var mot6 = '';
  for(var i = 0; i < 10; i++){ var a = Math.PI * (0.08 + 0.84 * i / 9), rx = Math.cos(a) * 46, ry = -Math.sin(a) * 92; mot6 += '<g transform="translate(' + r1(rx) + ' ' + r1(ry + 100) + ') scale(.38)"><path d="' + RUNES[i % RUNES.length] + '" fill="none" stroke="#e8fdff" stroke-width="3.4" stroke-linecap="round"/></g>'; }
  e.innerHTML = '<svg viewBox="-55 0 110 104" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">' +
    '<defs><radialGradient id="' + id + '" cx=".5" cy=".95" r=".9"><stop offset="0" stop-color="#3fd0ff" stop-opacity=".05"/><stop offset=".7" stop-color="#8ff3ff" stop-opacity=".18"/><stop offset="1" stop-color="#e8fdff" stop-opacity=".55"/></radialGradient>' +
    '<pattern id="' + id + 'p" width="12" height="10.4" patternUnits="userSpaceOnUse"><path d="M3 0 L 9 0 L 12 5.2 L 9 10.4 L 3 10.4 L 0 5.2 Z" fill="none" stroke="#bff8ff" stroke-width=".5" opacity=".55"/></pattern></defs>' +
    '<path d="M-50 100 C -50 30 -28 4 0 4 C 28 4 50 30 50 100 Z" fill="url(#' + id + ')"/>' +
    '<path d="M-50 100 C -50 30 -28 4 0 4 C 28 4 50 30 50 100" fill="none" stroke="#bff8ff" stroke-width="2" style="filter:drop-shadow(0 0 3px #8ff3ff)"/>' +
    '<path d="M-36 30 C -26 14 -14 9 -4 8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>' +
    '<g opacity=".85">' + mot6 + '</g>' +
    '<ellipse cx="0" cy="100" rx="52" ry="6" fill="none" stroke="#8ff3ff" stroke-width="2" stroke-dasharray="5 4" style="filter:drop-shadow(0 0 4px #3fd0ff)"/></svg>' +
    /* le motif d'hexagones qui défile (RAPIDITE.md) : un calque à part, animé en entier ; le dôme, lui, n'est jamais repeint */
    '<div class="ha-hexs" style="position:absolute;inset:0;overflow:hidden;-webkit-clip-path:path(\'' + domeChemin(w, h) + '\');clip-path:path(\'' + domeChemin(w, h) + '\')">' +
    '<svg viewBox="-55 0 110 114.4" preserveAspectRatio="none" class="ha-hex" style="position:absolute;left:0;top:0;width:100%;height:' + r1(h * 1.1) + 'px;overflow:visible;will-change:transform">' +
    '<rect x="-55" y="0" width="110" height="114.4" fill="url(#' + id + 'p)" opacity=".7"/></svg></div>' +
    '<div class="ha-badge">🛡️ −50 % · 1 tour</div>';
  L.appendChild(e);
  var svg = e.querySelector('svg');
  e.animate([{transform:'scale(.2,0)', opacity:0}, {transform:'scale(1.08,1.1)', opacity:1, offset:.6}, {transform:'scale(.97,.96)', offset:.8}, {transform:'scale(1,1)', opacity:1}], {duration:520, easing:'ease-out'});
  var vit = svg.animate([{opacity:.85}, {opacity:1}], {duration:900, iterations:Infinity, direction:'alternate', easing:'ease-in-out'});
  var hex = e.querySelector('.ha-hex'); hex.animate([{transform:'translateY(0px)'}, {transform:'translateY(' + r1(-10.4 * h / 104) + 'px)'}], {duration:1600, iterations:Infinity});
  scintille(L, x, yb - h * 0.5, {n:12, rx:w * 0.45, ry:h * 0.45, c:['#e8fdff', CYAN], etale:400});
  onde(L, x, yb, {w:w * 1.1, h:20, c:CYAN, ep:3, s0:0.3, s1:1.3, d:700});
  var fini = false;
  return {
    el:e,
    absorber:function(n){
      if(fini) return Promise.resolve();
      svg.animate([{filter:'brightness(2.2)'}, {filter:'brightness(1)'}], {duration:420, easing:'ease-out'});
      e.animate([{transform:'scale(1,1)'}, {transform:'scale(1.06,.95)', offset:.25}, {transform:'scale(.98,1.03)', offset:.6}, {transform:'scale(1,1)'}], {duration:420});
      onde(L, x, yb - h * 0.55, {css:'background:radial-gradient(circle,rgba(232,253,255,.8),rgba(143,243,255,0) 70%)', w:w * 0.7, s0:0.3, s1:1.5, d:450});
      gerbe(L, x, yb - h * 0.6, {n:10, c:['#fff', CYAN], v0:60, v1:140, g:100, t0:3, t1:5, d0:300, d1:550});
      return mot(L, x, yb - h - 14, '−' + n + ' absorbé' + (n > 1 ? 's' : ''), {t:22, c:'#bff8ff', lueur:'rgba(63,208,255,.8)', monte:30, d:1300});
    },
    retirer:function(){
      if(fini) return Promise.resolve(); fini = true;
      gerbe(L, x, yb - h * 0.5, {n:22, c:['#e8fdff', '#bff8ff', CYAN], forme:'eclat', v0:80, v1:220, g:500, t0:7, t1:13, d0:500, d1:850, lueur:false});
      scintille(L, x, yb - h * 0.5, {n:8, rx:w * 0.4, ry:h * 0.4, c:['#e8fdff', CYAN], etale:200});
      vit.cancel();
      return e.animate([{transform:'scale(1,1)', opacity:1, filter:'brightness(1)'}, {transform:'scale(1.06,1.04)', opacity:1, filter:'brightness(2)', offset:.25}, {transform:'scale(1.15,.7)', opacity:0, filter:'brightness(1)'}], {duration:380, easing:'ease-in', fill:'forwards'})
        .finished.then(function(){ e.remove(); });
    }
  };
};

/* ---------- étudier : le livre de la ceinture s'ouvre, les pages tournent, une idée s'allume ---------- */
H.etudier = function(){
  return this._file(function(){
    var me = this, g = this.garde(), lC = this.$('[data-livre-ceinture]'), lM = this.$('[data-livre-main]');
    var couv = lM.querySelector('[data-couv]'), pages = lM.querySelectorAll('[data-page]'), lueur = lM.querySelector('[data-lueur-pages]'), halo = lM.querySelector('[data-livre-halo]');
    var base = {pA:[106, 272], pB:[152, 272]};
    var prend = copie(g, copie(base, {bassin:{y:7}, torse:8, tete:6, mA:[150, 156], hA:0}));
    var lit = copie(g, copie(base, {bassin:{y:4}, torse:2, tete:12, mA:[170, 124], hA:0, mB:[128, 150], hB:-14}));
    var lit2 = copie(lit, {tete:9, torse:1, mA:[171, 121]});
    var eureka = copie(g, copie(base, {bassin:{y:0}, torse:-6, tete:-12, mA:[174, 112], hA:0, mB:[132, 138], hB:-10}));
    return this.jouer([
      {d:200, p:prend, e:'io', f:function(){ me.avant('A', true); lC.style.display = 'none'; lM.style.display = ''; couv.style.transform = 'scaleX(0)'; pages.forEach(function(pg){ pg.style.opacity = 0; }); }},
      {d:260, p:lit, e:'io', f:function(){
        me.expr('surpris');
        couv.animate([{transform:'scaleX(0)'}, {transform:'scaleX(1.1)', offset:.7}, {transform:'scaleX(1)'}], {duration:240, easing:'ease-out', fill:'forwards'}).finished.then(function(){ couv.style.transform = 'none'; });
        [].forEach.call(pages, function(pg, i){
          pg.animate([{transform:'scaleX(1)', opacity:1}, {transform:'scaleX(.15) skewY(-6deg)', opacity:1, offset:.45}, {transform:'scaleX(-1)', opacity:1, offset:.9}, {transform:'scaleX(-1)', opacity:0}], {duration:300, delay:240 + i * 170, easing:'ease-in-out', fill:'backwards'});
        });
      }},
      {d:300, p:lit2, e:'io', f:function(){ me.expr('savoir'); lueur.animate([{opacity:0}, {opacity:1}], {duration:300, fill:'forwards'}); halo.animate([{opacity:0}, {opacity:.95}], {duration:300, fill:'forwards'}); me._runesLivre(); }},
      {d:320, p:lit, e:'io'},
      {d:200, p:eureka, e:'b', f0:function(){ me._idee(); me.cristalFlash(true); }},
      {d:380, p:eureka, e:'lin'},
      {d:200, p:prend, e:'io', f0:function(){ me.expr('content'); couv.animate([{transform:'scaleX(1)'}, {transform:'scaleX(0)'}], {duration:160, fill:'forwards'}); lueur.animate([{opacity:1}, {opacity:0}], {duration:160, fill:'forwards'}); halo.animate([{opacity:.95}, {opacity:0}], {duration:160, fill:'forwards'}); },
        f:function(){ lC.style.display = ''; lM.style.display = 'none'; me.avant('A', false); }},
      {d:360, p:g, e:'io', f:function(){ me.expr('garde'); }}
    ]);
  });
};
H._runesLivre = function(){
  var p = this.rep('livre'), me = this;
  for(var k = 0; k < 8; k++){ var e = div(me.fx, '', rune(k + 2, k % 2 ? CYAN : '#e8fdff', alea(9, 14))), x = p.x + alea(-24, 24);
    jouerEl(e, [{transform:place(x, p.y, 0, 0.3), opacity:0}, {transform:place(x + alea(-8, 8), p.y - 30, 0, 1), opacity:1, offset:.3}, {transform:place(x + alea(-16, 16), p.y - 80, 0, 0.7), opacity:0}], {duration:alea(700, 1000), delay:k * 70, easing:'ease-out', fill:'backwards'}); }
};
H._idee = function(){
  var p = this.rep('tete'), id = 'hid' + (++uid);
  var e = div(this.fx, 'width:46px;height:56px', '<svg viewBox="-23 -30 46 56" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 6px #8ff3ff) drop-shadow(0 0 14px #3fd0ff)">' +
    '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#bff8ff"/><stop offset="1" stop-color="#3fd0ff"/></radialGradient></defs>' +
    '<path d="M0 -26 C 14 -26 20 -14 18 -4 C 16 4 10 8 9 14 L -9 14 C -10 8 -16 4 -18 -4 C -20 -14 -14 -26 0 -26 Z" fill="url(#' + id + ')" stroke="#24182e" stroke-width="2.6"/>' +
    '<path d="M-8 16 L 8 16 M-7 20 L 7 20 M-4 24 L 4 24" stroke="#e8c062" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M0 -18 L 0 0" stroke="#24182e" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="7" r="2.8" fill="#24182e"/>' +
    '<path d="M-26 -18 l -6 -4 M26 -18 l 6 -4 M-28 -2 l -7 0 M28 -2 l 7 0 M0 -32 l 0 -6" stroke="#bff8ff" stroke-width="2.4" stroke-linecap="round"/></svg>');
  scintille(this.fx, p.x + 4, p.y - 44, {n:7, rx:30, ry:24, c:['#e8fdff', CYAN], etale:300});
  return jouerEl(e, [{transform:place(p.x + 4, p.y - 26, -20, 0), opacity:0}, {transform:place(p.x + 4, p.y - 52, 8, 1.25), opacity:1, offset:.25}, {transform:place(p.x + 4, p.y - 48, -4, 1), opacity:1, offset:.4},
    {transform:place(p.x + 4, p.y - 54, 2, 1), opacity:1, offset:.8}, {transform:place(p.x + 4, p.y - 64, 0, .8), opacity:0}], {duration:1300, easing:'ease-out'});
};
/* ============ des effets sans aucun filtre (RAPIDITE.md R2 et R7) ============
   Chaque particule est un petit <div> (un dégradé ou un petit dessin SVG, peint une fois) dont la trajectoire est calculée
   d'avance et jouée par la carte graphique (transform et opacity). Pas de box-shadow, pas de drop-shadow. */
function transp(c){ return 'rgba(' + hx(c).join(',') + ',0)'; }
function tache(c, c2){ return 'border-radius:50%;background:radial-gradient(closest-side,' + c + ' 0,' + (c2 || c) + ' 42%,' + transp(c2 || c) + ' 100%)'; }
var FORMES = {
  etoile:function(c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + r1(t) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><circle r="7.5" fill="' + c + '" opacity=".3"/><path d="M0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="' + c + '"/><circle r="2" fill="#fff"/></svg>'; },
  goutte:function(c, t){ return '<svg viewBox="-6 -9 12 15" style="width:' + r1(t) + 'px;height:' + r1(t * 1.25) + 'px;display:block;overflow:visible"><path d="M0 -8 C 3 -3 5 0 5 2.5 C 5 5.5 2.6 6.5 0 6.5 C -2.6 6.5 -5 5.5 -5 2.5 C -5 0 -3 -3 0 -8 Z" fill="' + c + '" stroke="#24182e" stroke-width="1.3"/><circle cx="-1.6" cy="2" r="1.3" fill="#fff" opacity=".75"/></svg>'; },
  eclat:function(c, t){ return '<svg viewBox="-6 -8 12 16" style="width:' + r1(t * .75) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><path d="M0 -8 L 5 3 L -1 8 L -5 1 Z" fill="' + c + '" stroke="#24182e" stroke-width="1.1" stroke-linejoin="round"/><path d="M-1 -4 L 1.5 2" stroke="#fff" stroke-width="1.2" opacity=".8"/></svg>'; },
  flocon:function(c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + r1(t) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><path d="M0 -9 L 0 9 M-7.8 -4.5 L 7.8 4.5 M-7.8 4.5 L 7.8 -4.5 M-2.5 -7 L 0 -5 L 2.5 -7 M-2.5 7 L 0 5 L 2.5 7" stroke="#24182e" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".55"/><path d="M0 -9 L 0 9 M-7.8 -4.5 L 7.8 4.5 M-7.8 4.5 L 7.8 -4.5 M-2.5 -7 L 0 -5 L 2.5 -7 M-2.5 7 L 0 5 L 2.5 7" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>'; },
  paillette:function(c, t){ return '<svg viewBox="-6 -6 12 12" style="width:' + r1(t) + 'px;height:' + r1(t) + 'px;display:block;overflow:visible"><path d="M0 -6 L 3.4 0 L 0 6 L -3.4 0 Z" fill="' + c + '" stroke="#7a5418" stroke-width=".9"/><path d="M0 -6 L 3.4 0 L 0 0 Z" fill="#fff" opacity=".55"/></svg>'; },
  feuille:function(c, t){ return '<svg viewBox="-2 -10 26 20" style="width:' + r1(t) + 'px;height:' + r1(t * .8) + 'px;display:block;overflow:visible">' + feuilleChene(0, 0, 0, 1, c) + '</svg>'; }
};
/* une gerbe de particules : n, c (couleur ou liste), forme (rond, lueur, trait, etoile, goutte, eclat, flocon, paillette, feuille),
   angle et ecart (degrés), v0 / v1 (vitesse), g (pesanteur), t0 / t1 (taille), d0 / d1 (durée), retard, etale */
function pluie(layer, x, y, o){
  o = o || {};
  var n = o.n || 10, ps = [];
  for(var i = 0; i < n; i++){
    var an = (o.angle || 0) + (o.ecart !== undefined ? alea(-o.ecart, o.ecart) : alea(-180, 180));
    var v = alea(o.v0 || 60, o.v1 || 160), vx = Math.cos(an / DEG) * v, vy = Math.sin(an / DEG) * v, g = o.g === undefined ? 300 : o.g;
    var dur = alea(o.d0 || 400, o.d1 || 800), sz = alea(o.t0 || 3, o.t1 || 6), c = o.c instanceof Array ? o.c[i % o.c.length] : (o.c || '#ffffff');
    var f = o.forme || 'rond', css = 'width:' + r1(sz) + 'px;height:' + r1(sz) + 'px;', html = '';
    if(f === 'trait') css = 'width:' + r1(sz) + 'px;height:' + r1(Math.max(1.6, sz * .26)) + 'px;border-radius:2px;background:' + c;
    else if(f === 'lueur') css = 'width:' + r1(sz * 2.4) + 'px;height:' + r1(sz * 2.4) + 'px;' + tache('#ffffff', c);
    else if(f === 'rond') css += 'border-radius:50%;background:' + c + (o.bord ? ';border:1px solid #24182e' : '');
    else html = FORMES[f](c, sz);
    var e = div(layer, css, html), k = [], rot0 = alea(-180, 180), rotv = o.tourne === undefined ? alea(-540, 540) : o.tourne;
    for(var s = 0; s <= 6; s++){
      var tt = s / 6 * dur / 1000, px = x + vx * tt, py = y + vy * tt + 0.5 * g * tt * tt;
      var rr = f === 'trait' ? Math.atan2(vy + g * tt, vx) * DEG : f === 'goutte' ? Math.atan2(vy + g * tt, vx) * DEG - 90 : rot0 + rotv * tt;
      k.push({transform:place(px, py, rr, o.s1 === undefined ? 1 : 1 + (o.s1 - 1) * s / 6), opacity:s === 0 ? 0 : Math.pow(1 - s / 6, o.fondu || 0.8) * (o.o0 || 1)});
    }
    k[1].opacity = Math.max(k[1].opacity, .9 * (o.o0 || 1));
    ps.push(jouerEl(e, k, {duration:dur, delay:(o.retard || 0) + alea(0, o.etale || 0), easing:'linear', fill:'backwards'}));
  }
  return Promise.all(ps);
}
/* une tache de lumière (un dégradé) qui grandit et s'efface */
function lueurFx(layer, x, y, o){
  o = o || {};
  var w = o.w || 60, h = o.h || w, e = div(layer, 'width:' + w + 'px;height:' + h + 'px;' + tache(o.c || '#ffffff', o.c2 || o.c || '#ffffff'));
  var k = o.k || [{transform:place(x, y, 0, o.s0 || .3), opacity:o.o0 === undefined ? 1 : o.o0}, {transform:place(x + (o.dx || 0), y + (o.dy || 0), 0, o.s1 || 1.6), opacity:0}];
  return jouerEl(e, k, {duration:o.d || 500, delay:o.retard || 0, easing:o.e || 'cubic-bezier(.1,.7,.3,1)', fill:'backwards'});
}
/* un anneau (un dégradé en couronne, peint une fois) qui s'élargit */
function anneau(layer, x, y, o){
  o = o || {};
  var w = o.w || 60, h = o.h || w, c = o.c || '#ffffff';
  var e = div(layer, 'width:' + w + 'px;height:' + h + 'px;border-radius:50%;background:radial-gradient(closest-side,' + transp(c) + ' 62%,' + c + ' 80%,' + transp(c) + ' 100%)');
  return jouerEl(e, [{transform:place(x, y, 0, o.s0 || .2), opacity:o.o0 === undefined ? 1 : o.o0}, {transform:place(x, y, 0, o.s1 || 2.2), opacity:0}], {duration:o.d || 600, delay:o.retard || 0, easing:'cubic-bezier(.1,.7,.3,1)', fill:'backwards'});
}
/* un dessin (SVG) qui surgit et s'efface : o.k = images clés, sinon un « pop » */
function surgit(layer, x, y, w, h, svg, o){
  o = o || {};
  var e = div(layer, 'width:' + w + 'px;height:' + h + 'px', svg), r = o.r || 0;
  return jouerEl(e, o.k || [{transform:place(x, y, r - 20, .2), opacity:0}, {transform:place(x, y, r, 1.15), opacity:1, offset:.25}, {transform:place(x, y, r + 6, 1), opacity:1, offset:.6}, {transform:place(x, y, r + 14, o.s1 || 1.25), opacity:0}],
    {duration:o.d || 600, delay:o.retard || 0, easing:o.e || 'ease-out', fill:'backwards'});
}
/* une étoile de choc de bande dessinée */
function chocSvg(c1, c2, n){
  n = n || 10;
  var p = '', q = '';
  for(var i = 0; i < n * 2; i++){ var a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 22 : 48 - (i % 4 ? 8 : 0), r2 = i % 2 ? 12 : 30 - (i % 4 ? 5 : 0);
    p += (i ? ' L ' : 'M') + r1(Math.cos(a) * r) + ' ' + r1(Math.sin(a) * r); q += (i ? ' L ' : 'M') + r1(Math.cos(a) * r2) + ' ' + r1(Math.sin(a) * r2); }
  return '<svg viewBox="-50 -50 100 100" style="width:100%;height:100%;display:block;overflow:visible"><path d="' + p + ' Z" fill="' + c1 + '" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/><path d="' + q + ' Z" fill="' + c2 + '"/></svg>';
}
/* un vol calculé d'avance (en cloche si haut > 0) : joué par la carte graphique ; o.chaque(p, angle, u) est appelé tous les
   o.pas ms (pour semer une traînée), sans boucle à chaque image */
function vol2(el, a, b, o){
  var D = o.d, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 - (o.haut || 0), N = o.n || 18, kf = [];
  function pos(t){ var u = 1 - t; return {x:u * u * a.x + 2 * u * t * cx + t * t * b.x, y:u * u * a.y + 2 * u * t * cy + t * t * b.y}; }
  function etat(t){ var te = o.ease ? o.ease(t) : t, p = pos(te), q = pos(Math.min(1, te + .01)), r = pos(Math.max(0, te - .01)); p.ang = Math.atan2(q.y - r.y, q.x - r.x) * DEG; p.r = o.tourne !== undefined ? (o.r0 || 0) + o.tourne * t : p.ang; return p; }
  for(var i = 0; i <= N; i++){ var p = etat(i / N); kf.push({offset:i / N, transform:place(p.x, p.y, p.r, o.s), opacity:1}); }
  if(o.apparait) kf[0].opacity = 0;
  var anim = el.animate(kf, {duration:D, delay:o.retard || 0, easing:'linear', fill:'both'});
  if(o.chaque){ var t0 = performance.now() + (o.retard || 0), pas = o.pas || 45;
    (function tic(){ var u = (performance.now() - t0) / D; if(u >= 1) return; if(u >= 0){ var q = etat(u); o.chaque(q, q.ang, u); } setTimeout(tic, pas); })(); }
  function fin(){ var q = etat(1); return {x:q.x, y:q.y, ang:q.ang}; }
  return anim.finished.then(fin, fin);
}
/* une suite de points (unités de la boîte) passée en courbe douce (Catmull-Rom), échantillonnée en n points */
function courbe(p, n){
  var r = [], seg = p.length - 1;
  for(var i = 0; i <= n; i++){
    var t = i / n * seg, k = Math.min(seg - 1, Math.floor(t)), u = t - k, p0 = p[Math.max(0, k - 1)], p1 = p[k], p2 = p[k + 1], p3 = p[Math.min(p.length - 1, k + 2)], u2 = u * u, u3 = u2 * u;
    r.push([0, 1].map(function(j){ return 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3); }));
  }
  return r;
}

/* ============ la place des choses dans la boîte du héros ============ */
/* (une seule lecture au début de chaque geste) les unités du dessin (250 × 300, pieds en bas) vers les pixels de la boîte */
H._mesure = function(){ this._W = this.fx.offsetWidth || 200; this._H = this.fx.offsetHeight || 240; };
H._px = function(x, y){
  if(!this._W) this._mesure();
  var s = Math.min(this._W / 250, this._H / 300);
  return {x:(this._W - 250 * s) / 2 + x * s, y:this._H - 300 * s + y * s, s:s};
};
/* un point {x, y} de la scène (ou de l'écran si pas de scène) vers les pixels de la boîte du héros */
H._versBoite = function(scene, p){
  var R = this.boite.getBoundingClientRect(), k = (R.width / (this.boite.offsetWidth || R.width)) || 1, cx = p.x, cy = p.y;
  if(scene){ var S = scene.getBoundingClientRect(), ks = (S.width / (scene.offsetWidth || S.width)) || 1; cx = S.left + p.x * ks; cy = S.top + p.y * ks; }
  return {x:(cx - R.left) / k, y:(cy - R.top) / k};
};

/* ============ l'équipement visible : h.equiper(objet, on) ============ */
var OBJETS = {'carquois-argent':'pisteur', 'carquois-lourd':'pisteur', 'cristal-lune':'sage', 'baton-chene':'sage', 'sacoche':'alchimiste', 'amulette':null};
var ALIAS_OBJ = {argent:'carquois-argent', 'fleches-argent':'carquois-argent', lourd:'carquois-lourd', lourde:'carquois-lourd', 'fleches-lourdes':'carquois-lourd',
  cristal:'cristal-lune', lune:'cristal-lune', chene:'baton-chene', 'baton':'baton-chene'};
H.equiper = function(objet, on, opt){
  if(on && typeof on === 'object'){ opt = on; on = true; }
  objet = ALIAS_OBJ[objet] || objet; on = on !== false; opt = opt || {};
  this.eq = this.eq || {};
  if(!(objet in OBJETS) || (OBJETS[objet] && OBJETS[objet] !== this.role)){ if(window.console) console.warn('HerosAnime.equiper : « ' + objet + ' » ne va pas au ' + this.role); return Promise.resolve(false); }
  /* un seul carquois à la fois */
  if(on && objet === 'carquois-argent' && this.eq['carquois-lourd']) this._eq('carquois-lourd', false);
  if(on && objet === 'carquois-lourd' && this.eq['carquois-argent']) this._eq('carquois-argent', false);
  var avant = !!this.eq[objet];
  this._eq(objet, on);
  if(on && !avant && !opt.discret) this._eclatObjet(objet);
  return Promise.resolve(true);
};
H.equipe = function(objet){ return !!(this.eq && this.eq[ALIAS_OBJ[objet] || objet]); };
/* montrer / cacher la variante dessinée (dans la vue ET dans la silhouette lumineuse du héros choisi) */
H._eq = function(objet, on){
  this.eq = this.eq || {};
  this.eq[objet] = !!on;
  [].forEach.call(this.svg.querySelectorAll('[data-eq="' + objet + '"]'), function(e){ e.style.display = on ? '' : 'none'; });
  if(objet.indexOf('carquois') === 0){
    var normal = !this.eq['carquois-argent'] && !this.eq['carquois-lourd'];
    [].forEach.call(this.svg.querySelectorAll('[data-carquois]'), function(e){ e.style.display = normal ? '' : 'none'; });
  }
};
/* (après l'ajout de la silhouette lumineuse : elle reprend l'équipement) */
H._reappliquer = function(){ for(var k in (this.eq || {})) if(this.eq[k]) this._eq(k, true); };
H._eclatObjet = function(objet){
  var r = this.vue.querySelector('[data-eq="' + objet + '"] [data-r]') || this.reps[{'cristal-lune':'cristal', amulette:'amulette'}[objet]] || this.reps.teteC;
  var p = ou(r, this.fx), c = {'carquois-argent':['#ffffff', '#dfe7f2', '#bfd4ff'], 'cristal-lune':['#ffffff', '#e8eeff', '#bfe8ff'], 'baton-chene':['#c8ff9a', '#6ab85a', '#fff6c0']}[objet] || ['#fff6c0', '#ffd36a', '#ffffff'];
  lueurFx(this.fx, p.x, p.y, {c:'#ffffff', c2:c[1], w:56, s0:.3, s1:1.4, d:460});
  anneau(this.fx, p.x, p.y, {c:c[1], w:44, s0:.3, s1:2, d:560});
  pluie(this.fx, p.x, p.y, {n:7, forme:'etoile', c:c, v0:20, v1:70, g:-30, t0:8, t1:14, d0:500, d1:800, etale:200});
};

/* ============ les calques des réactions (givre, bave, toile) ============ */
/* la pièce qui porte un calque : « epaules » (le torse de la tête), « tete », « bras » (le bras proche), sinon la vue entière */
H._piece = function(quoi){
  var v = this.vue, y = v.querySelector('[data-y="ouverts"]');
  if(quoi === 'epaules') return y && y.closest('[data-i="torse"]');
  if(quoi === 'tete') return y && y.closest('[data-i="tete"]');
  if(quoi === 'bras') return v.querySelector('[data-i="brasB"]');
  return v;
};
/* un calque fixe (unités du dessin) : cuit, un îlot (un petit SVG peint une fois, qui suit la pièce) ; sinon un <g> */
H._calque = function(quoi, html, origine){
  var p = this._piece(quoi), e;
  if(!p) return null;
  if(this.cuit && window.Cuire){ e = window.Cuire.ilot(p, html, 'ha-calque'); e.style.width = e.style.height = '1px'; }   /* (1 px : RAPIDITE.md R5) */
  else { e = document.createElementNS(SVGNS, 'g'); e.setAttribute('class', 'haJ ha-calque'); e.innerHTML = html; p.appendChild(e); }
  e.style.display = 'none';
  if(origine) e.style.transformOrigin = origine[0] + 'px ' + origine[1] + 'px';
  return e;
};
var ORIG = {epaules:[120, 104], tete:[128, 14], bras:[108, 108]};
H._calques = function(type){
  this._cq = this._cq || {};
  if(this._cq[type]) return this._cq[type];
  var D = type === 'givre' ? givreDessin(this.role) : baveDessin(this.role), me = this, r = {gouttes:D.gouttes || {}};
  ['epaules', 'tete', 'bras'].forEach(function(q){ r[q] = me._calque(q, D[q], ORIG[q]); });
  return (this._cq[type] = r);
};
function montrer(el, on){ if(el){ if(el._a){ el._a.cancel(); el._a = null; } el.style.display = on ? '' : 'none'; el.style.opacity = ''; } }
function animer(el, kf, o){ if(!el) return Promise.resolve(); if(el._a) el._a.cancel(); var a = el._a = el.animate(kf, o); return a.finished.then(function(){ if(el._a === a) el._a = null; }, function(){}); }

/* ============ h.touche(type) : les nouvelles réactions ============ */
var toucheBase = H.touche;
H.touche = function(type, opt){
  if(type === 'froid') return this._froid(opt || {});
  if(type === 'grouillement') return this._grouillement(opt || {});
  if(type === 'poing') return this._poing(opt || {});
  return toucheBase.call(this, type, opt);
};
function copieP(g, o){ var p = {}, k; for(k in g) p[k] = g[k]; for(k in o) p[k] = o[k]; return p; }
/* une flamme (pour la brûlure froide, bleue) */
function flammeSvg(c1, c2, c3){
  var d = 'M0 -40 C 8 -24 22 -16 22 2 C 22 16 12 24 0 24 C -12 24 -22 16 -22 2 C -22 -10 -12 -14 -10 -26 C -6 -18 -4 -14 -2 -12 C 2 -22 2 -30 0 -40 Z';
  return '<svg viewBox="-30 -44 60 72" style="width:100%;height:100%;display:block;overflow:visible"><path d="' + d + '" fill="' + c1 + '" stroke="#24182e" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M0 -14 C 6 -4 12 2 12 10 C 12 18 6 21 0 21 C -6 21 -12 18 -12 10 C -12 2 -4 -2 0 -14 Z" fill="' + c2 + '"/><path d="M0 2 C 3 7 6 10 6 14 C 6 18 3 19 0 19 C -3 19 -6 18 -6 14 C -6 10 -2 8 0 2 Z" fill="' + c3 + '"/></svg>';
}

/* ---------- la brûlure froide (feu follet) : éclat bleu, il se recroqueville et grelotte, du givre sur les épaules ---------- */
H._froid = function(o){
  return this._file(function(){
    this._mesure();
    var me = this, g = this.garde(), C = this._calques('givre');
    var poi = this._px(136, 146), bou = this._px(150, 84), F2 = this.fx;
    this.expr('surpris');
    /* l'éclat : une tache blanche et bleue, une flamme bleue qui lèche, des éclats de glace */
    lueurFx(F2, poi.x, poi.y, {c:'#ffffff', c2:'#5fc8ff', w:120, s0:.3, s1:1.5, d:520});
    anneau(F2, poi.x, poi.y, {c:'#9ad8ff', w:90, s0:.3, s1:2.1, d:620});
    surgit(F2, poi.x + 10, poi.y - 6, 48, 58, flammeSvg('#5fc8ff', '#bff0ff', '#ffffff'), {d:640, k:[{transform:place(poi.x + 10, poi.y + 4, 0, .3), opacity:0}, {transform:place(poi.x + 10, poi.y - 6, -8, 1.15), opacity:1, offset:.2}, {transform:place(poi.x + 6, poi.y - 10, 6, .95), opacity:1, offset:.5}, {transform:place(poi.x + 2, poi.y - 22, -4, .5), opacity:0}]});
    pluie(F2, poi.x, poi.y, {n:10, forme:'eclat', c:['#eaf8ff', '#bfeaff', '#7fd8ff'], angle:-120, ecart:80, v0:80, v1:200, g:520, t0:6, t1:10, d0:420, d1:700});
    pluie(F2, poi.x, poi.y - 20, {n:5, forme:'flocon', c:['#ffffff', '#cfefff'], v0:20, v1:60, g:40, t0:10, t1:15, d0:800, d1:1200, etale:300});
    this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(-16px)', offset:.12, easing:'cubic-bezier(.2,.8,.4,1)'}, {transform:'translateX(-10px)', offset:.3},
      {transform:'translateX(-12.5px)', offset:.36}, {transform:'translateX(-7.5px)', offset:.42}, {transform:'translateX(-12px)', offset:.48}, {transform:'translateX(-8px)', offset:.54},
      {transform:'translateX(-11px)', offset:.6}, {transform:'translateX(-8.5px)', offset:.66}, {transform:'translateX(-10.5px)', offset:.72}, {transform:'translateX(-9px)', offset:.78}, {transform:'translateX(0px)'}], {duration:1500, easing:'linear'});
    /* il se recroqueville, les bras serrés autour du corps, et grelotte */
    var b0 = (g.bassin && g.bassin.y) || 0;
    var hit = {bassin:{x:-6, y:b0 + 6}, torse:-12, tete:-14, mA:[188, 120], hA:-40, mB:[78, 116], hB:-140, pA:g.pA, pB:g.pB};
    var brr = {bassin:{y:b0 + 12}, torse:12, tete:12, mA:[124, 134], mB:[150, 130], cB:1, pA:[112, 272], pB:[146, 272]};
    var brr2 = copieP(brr, {torse:15, tete:9, mA:[126, 132], mB:[148, 133]});
    var seq = [{d:70, p:hit, e:'oo'}, {d:110, p:hit, e:'lin'}, {d:220, p:brr, e:'o', f0:function(){
      me.expr('aie');
      ['epaules', 'tete', 'bras'].forEach(function(q, i){ var e = C[q]; montrer(e, true); animer(e, [{opacity:0, transform:'scale(.6)'}, {opacity:1, transform:'scale(1.08)', offset:.6}, {opacity:1, transform:'scale(1)'}], {duration:300, delay:i * 60, easing:'ease-out', fill:'backwards'}); });
    }}];
    for(var i = 0; i < 7; i++) seq.push({d:80, p:i % 2 ? brr : brr2, e:'io'});
    seq.push({d:380, p:g, e:'b', f0:function(){ me.expr('garde'); me.cligner(); }});
    /* la buée qui sort de la bouche (deux petits nuages) */
    [380, 700].forEach(function(t){ lueurFx(F2, bou.x, bou.y, {c:'#ffffff', c2:'#dff4ff', w:24, s0:.4, s1:2.2, dx:18, dy:-12, d:800, retard:t, o0:.85}); });
    /* le givre fond ensuite, doucement (sans bloquer le jeu) ; un nouveau coup de froid repart de zéro */
    var tok = this._givreTok = (this._givreTok || 0) + 1;
    this.plus(2600, function(){
      if(tok !== me._givreTok) return;
      ['epaules', 'tete', 'bras'].forEach(function(q){ var e = C[q]; animer(e, [{opacity:1}, {opacity:0}], {duration:900, easing:'ease-in', fill:'forwards'}).then(function(){ if(e && !e._a) montrer(e, false); }); });
      var a = me._px(100, 112), b = me._px(150, 106);
      pluie(me.fx, a.x, a.y, {n:2, forme:'goutte', c:'#bfeaff', angle:90, ecart:10, v0:5, v1:20, g:300, t0:5, t1:6, d0:700, d1:900, etale:500});
      pluie(me.fx, b.x, b.y, {n:2, forme:'goutte', c:'#bfeaff', angle:90, ecart:10, v0:5, v1:20, g:300, t0:5, t1:6, d0:700, d1:900, etale:500, retard:200});
    });
    return this.jouer(seq);
  });
};

/* ---------- le grouillement (Roi des rats) : trois rats lui courent dessus, il saute, il se débat ---------- */
var RAT_SVG = '<svg viewBox="-34 -16 62 28" style="width:100%;height:100%;display:block;overflow:visible">' +
  '<path d="M-20 2 C -28 2 -32 -4 -34 -10" fill="none" stroke="#24182e" stroke-width="3.6" stroke-linecap="round"/><path d="M-20 2 C -28 2 -32 -4 -34 -10" fill="none" stroke="#d89a9a" stroke-width="1.8" stroke-linecap="round"/>' +
  '<path d="M-12 7 L -15 11 M-4 7 L -2 11 M6 6 L 4 10 M12 5 L 15 9" stroke="#24182e" stroke-width="2.6" stroke-linecap="round"/>' +
  '<path d="M-22 1 C -22 -8 -10 -12 2 -10 C 10 -9 14 -6 18 -4 C 22 -3 27 -1 27 2 C 27 4 23 5 19 5 C 14 7 6 8 -2 8 C -14 8 -22 7 -22 1 Z" fill="#8a7482" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M-18 4 C -10 7 4 7 12 4 C 6 6 -8 7 -18 4 Z" fill="#c8b4be"/><path d="M-16 -3 C -10 -9 2 -9 10 -6" fill="none" stroke="#c0aab8" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>' +
  '<path d="M9 -7 C 8 -14 15 -15 15 -9 Z" fill="#c88a92" stroke="#24182e" stroke-width="1.6"/><circle cx="27" cy="1.6" r="2" fill="#ff9aa8" stroke="#24182e" stroke-width="1"/>' +
  '<circle cx="18" cy="-2.6" r="2" fill="#ffd21e"/><circle cx="18.6" cy="-3.2" r=".7" fill="#fff"/><path d="M26 3 L 33 1 M26 3.5 L 32 5" stroke="#24182e" stroke-width=".8"/></svg>';
H._ratCourt = function(pts, delai, D){
  var me = this, s = this._px(0, 0).s;
  var p = courbe(pts.map(function(q){ var r = me._px(q[0], q[1]); return [r.x, r.y]; }), 26), kf = [], ang0 = null;
  for(var i = 0; i < p.length; i++){
    var a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG, gauche = b[0] - a[0] < 0;
    if(ang0 !== null){ while(an - ang0 > 180) an -= 360; while(an - ang0 < -180) an += 360; }
    ang0 = an;
    /* il trottine (petits bonds) ; quand il court vers la gauche, il est retourné (le ventre reste contre le héros) */
    var bond = i % 2 ? -2.4 * s : 0;
    kf.push({offset:i / (p.length - 1), transform:'translate(' + r1(p[i][0]) + 'px,' + r1(p[i][1] + bond) + 'px) translate(-50%,-80%) rotate(' + r1(an) + 'deg) scale(1,' + (gauche ? -1 : 1) + ')', opacity:i === 0 || i === p.length - 1 ? 0 : 1});
  }
  var e = div(this.fx, 'width:' + r1(68 * s) + 'px;height:' + r1(30 * s) + 'px;z-index:4;transform-origin:50% 80%', RAT_SVG);
  return jouerEl(e, kf, {duration:D, delay:delai, easing:'linear', fill:'backwards'});
};
H._grouillement = function(o){
  return this._file(function(){
    var me = this, g = this.garde();
    this._mesure();
    this.expr('surpris');
    this._ratCourt([[262, 292], [196, 290], [164, 250], [156, 200], [146, 150], [134, 108], [128, 62], [120, 18], [92, 30], [78, 86], [70, 150], [58, 230], [36, 292], [-40, 294]], 0, 1500);
    this._ratCourt([[270, 280], [206, 288], [176, 236], [178, 182], [152, 140], [104, 132], [74, 172], [52, 244], [20, 292], [-50, 294]], 280, 1350);
    this._ratCourt([[256, 293], [186, 290], [158, 226], [146, 150], [136, 74], [146, 16], [196, -20], [244, 120], [270, 290], [330, 292]], 560, 1400);
    var b0 = (g.bassin && g.bassin.y) || 0;
    var sur = {racine:{y:-18}, bassin:{y:b0}, torse:-10, tete:-14, mA:[186, 70], hA:-110, mB:[92, 64], hB:-160, cB:1, pA:[104, 256], fA:30, pB:[160, 272]};
    var bas = {racine:{y:0}, bassin:{y:b0 + 18, x:4}, torse:22, tete:12, mA:[168, 200], hA:40, mB:[150, 214], hB:60, pA:[98, 272], pB:[168, 260], fB:24};
    var tete = {racine:{y:-12}, bassin:{y:b0 + 4}, torse:-6, tete:18, mA:[160, 40], hA:-150, mB:[104, 30], hB:-120, cB:1, pA:[110, 272], pB:[150, 262], fB:16};
    var dos = {racine:{y:0}, bassin:{y:b0 + 10, x:-4}, torse:-16, tete:-20, mA:[120, 120], hA:-150, mB:[70, 120], hB:-170, cB:1, pA:[96, 272], pB:[160, 272]};
    return this.jouer([
      {d:120, p:sur, e:'oo', f:function(){ me.expr('aie'); }}, {d:160, p:bas, e:'io'}, {d:150, p:tete, e:'o'}, {d:140, p:sur, e:'io'},
      {d:150, p:dos, e:'io', f0:function(){ me.expr('surpris'); }}, {d:150, p:bas, e:'io', f0:function(){ me.expr('aie'); }}, {d:140, p:tete, e:'o'}, {d:150, p:dos, e:'io'},
      {d:150, p:sur, e:'io'}, {d:150, p:bas, e:'io'}, {d:140, p:tete, e:'o'},
      {d:200, p:copieP(g, {torse:(g.torse || 0) + 6, tete:-10}), e:'io', f0:function(){
        me.expr('colere');
        var a = me._px(124, 120), b = me._px(130, 40);
        pluie(me.fx, a.x, a.y, {n:6, c:['#5e4c56', '#8a7884'], v0:40, v1:110, g:200, t0:3, t1:5, d0:500, d1:800});
        pluie(me.fx, b.x, b.y, {n:4, c:['#5e4c56', '#8a7884'], v0:40, v1:100, g:200, t0:3, t1:5, d0:500, d1:800});
      }},
      {d:360, p:g, e:'b', f:function(){ me.expr('garde'); me.cligner(); }}
    ]);
  });
};

/* ---------- le poing du Gardien : un gros coup, il recule en glissant, puis revient ---------- */
H._poing = function(o){
  return this._file(function(){
    var me = this, g = this.garde(), F2 = this.fx;
    this._mesure();
    var poi = this._px(150, 140), s = this._px(0, 0).s, D = 1700;
    this.expr('aie');
    surgit(F2, poi.x + 8, poi.y, 110, 110, chocSvg('#fff2a0', '#ffffff'), {d:420, r:12, s1:1.4});
    lueurFx(F2, poi.x, poi.y, {c:'#ffffff', c2:'#ffb0a0', w:130, s0:.3, s1:1.4, d:380});
    pluie(F2, poi.x, poi.y, {n:12, forme:'trait', c:['#ffffff', '#ffe08a'], angle:180, ecart:55, v0:180, v1:320, g:200, t0:10, t1:18, d0:240, d1:420});
    /* il est projeté en arrière et glisse sur le sol (la boîte recule ; la poussière reste où elle naît) */
    var X1 = -64, X2 = -90;
    this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(' + X1 + 'px)', offset:.1, easing:'cubic-bezier(.15,.6,.4,1)'}, {transform:'translateX(' + X2 + 'px)', offset:.32, easing:'ease-out'},
      {transform:'translateX(' + X2 + 'px)', offset:.56}, {transform:'translateX(0px)', offset:.9, easing:'cubic-bezier(.45,0,.3,1)'}, {transform:'translateX(0px)'}], {duration:D});
    var pied = this._px(150, 292);
    [[.06, X1 * .6], [.12, X1], [.2, (X1 + X2) / 2], [.28, X2 + 4]].forEach(function(q, i){
      lueurFx(F2, pied.x + q[1] + 6, pied.y - 4, {c:'#d8d0e4', c2:'#a89cb8', w:36, h:22, s0:.4, s1:2.2, dx:18, dy:-8, d:700, retard:q[0] * D, o0:.8});
      pluie(F2, pied.x + q[1], pied.y - 2, {n:3, c:['#8a8098', '#b8aec8'], angle:-30, ecart:30, v0:40, v1:110, g:300, t0:2, t1:4, d0:300, d1:500, retard:q[0] * D});
    });
    var b0 = (g.bassin && g.bassin.y) || 0;
    var plie = {racine:{y:0}, bassin:{x:-8, y:b0 + 16, r:-4}, torse:26, tete:16, mA:[204, 150], hA:10, mB:[176, 176], hB:20, pA:[82, 272], pB:[170, 272], fB:-6};
    var glisse = copieP(plie, {torse:20, tete:8, bassin:{x:-4, y:b0 + 20, r:-6}, mA:[196, 170], mB:[60, 140], hB:-150, cB:-1, pA:[84, 272], pB:[176, 272], fB:-14});
    var sonne = {racine:{y:0}, bassin:{y:b0 + 6}, torse:6, tete:-12, mA:[176, 150], mB:[120, 150], pA:[100, 272], pB:[158, 272]};
    var sonne2 = copieP(sonne, {tete:12, torse:2});
    var pas1 = copieP(g, {racine:{y:-6}, pA:[110, 262], fA:16}), pas2 = copieP(g, {racine:{y:-6}, pB:[150, 262], fB:16});
    return this.jouer([
      {d:80, p:plie, e:'oo'}, {d:340, p:glisse, e:'o'}, {d:160, p:glisse, e:'lin'},
      {d:220, p:sonne, e:'io', f0:function(){ me.expr('ko'); }}, {d:150, p:sonne2, e:'io'}, {d:140, p:sonne, e:'io', f:function(){ me.expr('colere'); }},
      {d:150, p:pas1, e:'io'}, {d:150, p:pas2, e:'io'}, {d:140, p:pas1, e:'io'},
      {d:300, p:g, e:'b', f:function(){ me.expr('garde'); me.cligner(); }}
    ]);
  });
};

/* ============ h.relever({amulette:true}) : l'amulette de vie le relève (éclat d'or, elle se brise en paillettes) ============ */
var releverBase = H.relever;
H.relever = function(opt){
  if(opt && opt.amulette) return this._releverAmulette(opt);
  return releverBase.call(this, opt);
};
H._releverAmulette = function(o){
  return this._file(function(){
    var me = this, g = this.garde(), F2 = this.fx;
    this._mesure();
    this._etoiles(false);
    if(!this.equipe('amulette')) this._eq('amulette', true);   /* (on la voit même si le moteur ne l'avait pas montrée) */
    var A = ou(this.reps.amulette, F2), W = this._W, Hh = this._H, cx = W / 2, sol = this._px(0, 293).y;
    /* deux battements de cœur dorés sur l'amulette */
    lueurFx(F2, A.x, A.y, {c:'#fff6c0', c2:'#ffc850', w:90, d:760, k:[{transform:place(A.x, A.y, 0, .2), opacity:0}, {transform:place(A.x, A.y, 0, .9), opacity:1, offset:.18}, {transform:place(A.x, A.y, 0, .55), opacity:.7, offset:.38},
      {transform:place(A.x, A.y, 0, 1.15), opacity:1, offset:.6}, {transform:place(A.x, A.y, 0, .7), opacity:.8, offset:.85}, {transform:place(A.x, A.y, 0, 1.4), opacity:1}]});
    var coeur = '<svg viewBox="-12 -12 24 24" style="width:100%;height:100%;display:block;overflow:visible"><path d="' + coeurD(0, 1, 8) + '" fill="#ff4a6a" stroke="#24182e" stroke-width="2"/><circle cx="-3" cy="-2" r="2" fill="#fff" opacity=".8"/></svg>';
    [0, 330].forEach(function(t){ surgit(F2, A.x + 2, A.y - 26, 22, 22, coeur, {d:420, retard:t, k:[{transform:place(A.x + 2, A.y - 14, 0, .3), opacity:0}, {transform:place(A.x + 2, A.y - 26, 0, 1.2), opacity:1, offset:.35}, {transform:place(A.x + 2, A.y - 36, 0, 1), opacity:0}]}); });
    /* l'éclat d'or : l'amulette se brise en paillettes */
    this.plus(720, function(){
      me._eq('amulette', false);
      lueurFx(F2, A.x, A.y, {c:'#ffffff', c2:'#ffd36a', w:220, s0:.2, s1:1.5, d:700});
      surgit(F2, A.x, A.y, 150, 150, chocSvg('#ffe680', '#fff8d8', 12), {d:640, s1:1.5});
      anneau(F2, A.x, A.y, {c:'#ffd36a', w:90, s0:.2, s1:2.6, d:700});
      anneau(F2, A.x, A.y, {c:'#fff2b0', w:90, s0:.2, s1:3.2, d:900, retard:140});
      pluie(F2, A.x, A.y, {n:14, forme:'paillette', c:['#ffe680', '#ffd36a', '#fff6c0'], v0:80, v1:220, g:260, t0:5, t1:9, d0:700, d1:1200});
      pluie(F2, A.x, A.y, {n:6, forme:'eclat', c:['#f0c860', '#ffe08a'], v0:100, v1:200, g:600, t0:6, t1:9, d0:500, d1:800});
      me.expr('surpris');
    });
    /* la colonne de lumière dorée (un dégradé, sans flou ni mélange) et des étoiles qui montent */
    var col = div(F2, 'width:150px;height:260px;border-radius:50% 50% 40% 40%;background:radial-gradient(ellipse at 50% 80%,rgba(255,240,170,.85),rgba(255,205,100,.38) 40%,rgba(255,190,80,0) 70%)');
    jouerEl(col, [{transform:place(cx, sol - 110, 0, .2), opacity:0}, {transform:place(cx, sol - 120, 0, 1), opacity:1, offset:.35}, {transform:place(cx, sol - 124, 0, 1.06), opacity:.9, offset:.7}, {transform:place(cx, sol - 134, 0, 1.2), opacity:0}], {duration:1500, delay:700, easing:'ease-out', fill:'backwards'});
    anneau(F2, cx, sol, {c:'#ffd36a', w:150, h:34, s0:.2, s1:1.3, d:900, retard:760});
    pluie(F2, cx, sol - 20, {n:12, forme:'etoile', c:['#fff6c0', '#ffe680', '#ffffff'], angle:-90, ecart:40, v0:60, v1:170, g:-40, t0:8, t1:14, d0:800, d1:1200, etale:700, retard:760});
    var assis = {racine:{x:70, y:-10, r:-30}, bassin:{x:0, y:30, r:0}, torse:10, tete:0, cuisseA:-80, tibiaA:110, piedA:-30, cuisseB:-60, tibiaB:120, piedB:-60, brasA:-20, avantBrasA:-20, brasB:30, avantBrasB:-30, mainA:0, mainB:0};
    var genou = {racine:{x:0, y:0, r:0}, bassin:{x:0, y:48, r:0}, torse:22, tete:-10, pA:[92, 272], fA:40, pB:[160, 272], brasA:-30, avantBrasA:-50, brasB:20, avantBrasB:-40};
    var saut = {racine:{x:0, y:-34, r:0}, bassin:{y:-4}, torse:-8, tete:-14, pA:[108, 258], fA:20, pB:[150, 262], fB:14, brasA:-160, avantBrasA:-8, brasB:-150, avantBrasB:-10};
    var fier = copieP(g, {racine:{y:0}, torse:-4, tete:-10});
    if(this.R0.releve) this.R0.releve(saut);
    return this.jouer([{d:700, p:{}, e:'lin'}, {d:220, p:assis, e:'io'}, {d:200, p:genou, e:'io', f:function(){ me.expr('joie'); }},
      {d:220, p:saut, e:'o'}, {d:160, p:saut, e:'lin'}, {d:260, p:fier, e:'i', f0:function(){ me.ko = false; }, f:function(){ me._poussiere(); }}, {d:300, p:fier, e:'lin'},
      {d:300, p:g, e:'b'}]).then(function(){ me.ko = false; me.expr('garde'); });
  });
};

/* ============ h.entoile(on) : pris dans la toile d'araignée (il se débat) ; entoile(false) la déchire ============ */
H._toiles = function(){
  if(this._tl) return this._tl;
  var G = toileDessin();
  return (this._tl = [this._calque('toile', G[0], [86, 170]), this._calque('toile', G[1], [166, 170])]);
};
H.entoile = function(on){
  on = on !== false;
  /* (l'état voulu est noté tout de suite : entoile(true) puis entoile(false) aussitôt font bien les deux, dans l'ordre) */
  if(on === !!this._toileV) return Promise.resolve();
  this._toileV = on;
  return on ? this._entoiler() : this._dechirer();
};
H._pose_ligote = function(){
  var g = this.garde(), b0 = (g.bassin && g.bassin.y) || 0;
  return copieP(g, {bassin:{y:b0 + 6}, torse:(g.torse || 0) + 6, tete:-8, mA:[154, 150], mB:[110, 156], cB:1, pA:[114, 272], pB:[144, 272]});
};
H._entoiler = function(){
  return this._file(function(){
    var me = this, T = this._toiles(), lig = this._pose_ligote();
    this._toile = true;
    this.expr('surpris');
    T.forEach(function(e, i){ montrer(e, true); animer(e, [{opacity:0, transform:'scale(.4) rotate(' + (i ? 20 : -20) + 'deg)'}, {opacity:1, transform:'scale(1.06)', offset:.6}, {opacity:1, transform:'scale(1)'}], {duration:360, delay:i * 70, easing:'cubic-bezier(.2,.8,.3,1)', fill:'backwards'}); });
    var c = this._px(126, 160);
    pluie(this.fx, c.x, c.y, {n:8, c:'#f4f8ff', bord:true, v0:60, v1:140, g:300, t0:3, t1:5, d0:400, d1:600});
    return this.jouer([{d:240, p:lig, e:'oo'}].concat(this._debat(lig, 3), [{d:240, p:lig, e:'io', f:function(){ me.expr('effort'); }}]));
  });
};
/* il se débat dans la toile (n secousses) ; la toile tire avec lui */
H._debat = function(lig, n){
  var me = this, seq = [], T = this._tl || [];
  for(var i = 0; i < n; i++){
    var s = i % 2 ? 1 : -1;
    seq.push({d:120, p:copieP(lig, {torse:lig.torse + 7 * s, tete:lig.tete - 10 * s, bassin:{x:3 * s, y:lig.bassin.y}, mA:[158 + 4 * s, 146], mB:[106 - 4 * s, 150]}), e:'io', f0:i ? null : function(){
      T.forEach(function(e, k){ animer(e, [{transform:'scale(1)'}, {transform:'scale(1.04,.98) rotate(' + (k ? 2 : -2) + 'deg)'}, {transform:'scale(.99,1.02) rotate(' + (k ? -1 : 1) + 'deg)'}, {transform:'scale(1)'}], {duration:120 * n, easing:'ease-in-out'}); });
    }});
  }
  return seq;
};
H._dechirer = function(){
  return this._file(function(){
    var me = this, T = this._toiles(), g = this.garde(), lig = this._pose_ligote(), b0 = (g.bassin && g.bassin.y) || 0;
    this.expr('effort');
    var tasse = copieP(lig, {bassin:{y:b0 + 18}, torse:lig.torse + 8, tete:4, mA:[150, 156], mB:[114, 160]});
    var force = copieP(tasse, {torse:lig.torse + 10});
    var ouvre = copieP(g, {racine:{y:-14}, bassin:{y:b0}, torse:-8, tete:-12, mA:[200, 90], hA:-60, mB:[60, 92], hB:-160, cB:-1, pA:[92, 266], pB:[168, 266]});
    return this.jouer([{d:220, p:tasse, e:'io'}, {d:70, p:force, e:'io'}, {d:70, p:tasse, e:'io'}, {d:70, p:force, e:'io'},
      {d:120, p:ouvre, e:'oo', f0:function(){
        me.expr('cri');
        T.forEach(function(e, i){ var s = i ? 1 : -1;
          animer(e, [{opacity:1, transform:'translate(0px,0px) rotate(0deg) scale(1)'}, {opacity:1, transform:'translate(' + (26 * s) + 'px,-10px) rotate(' + (18 * s) + 'deg) scale(1.02)', offset:.3}, {opacity:0, transform:'translate(' + (70 * s) + 'px,-24px) rotate(' + (42 * s) + 'deg) scale(.86)'}],
            {duration:520, easing:'cubic-bezier(.2,.7,.4,1)', fill:'forwards'}).then(function(){ montrer(e, false); e.style.transform = ''; }); });
        var c = me._px(126, 160);
        pluie(me.fx, c.x, c.y, {n:12, forme:'trait', c:['#f4f8ff', '#e8f0ff'], v0:140, v1:300, g:400, t0:12, t1:22, d0:400, d1:700});
        pluie(me.fx, c.x, c.y - 20, {n:6, c:'#f8ffe8', bord:true, v0:80, v1:200, g:500, t0:3, t1:5, d0:500, d1:800});
        anneau(me.fx, c.x, c.y, {c:'#f4f8ff', w:120, s0:.3, s1:1.8, d:500});
      }},
      {d:300, p:ouvre, e:'lin', f0:function(){ me._toile = false; }}, {d:380, p:g, e:'b', f0:function(){ me.expr('content'); }, f:function(){ me.expr('garde'); }}]).then(function(){ me._toile = false; });
  });
};

/* ============ Bourbe : h.avale() (happé par la langue) et h.recrache(scene, depuis) (il revient couvert de bave) ============ */
H.avale = function(opt){
  opt = opt || {};
  return this._file(function(){
    var me = this, g = this.garde();
    this._mesure();
    this._etoiles(false);
    var p = this._px(146, 150), D = opt.d || 460, dx = opt.dx || 170;
    this.expr('surpris');
    /* le bout de la langue colle à la poitrine (dans la boîte : il part avec lui) */
    var gl = div(this.boite, 'width:46px;height:40px;z-index:5', '<svg viewBox="-24 -20 48 40" style="width:100%;height:100%;display:block;overflow:visible"><path d="M-14 -6 C -18 -16 -2 -20 8 -16 C 20 -14 24 -2 18 8 C 12 18 -6 18 -12 10 C -18 4 -16 0 -14 -6 Z" fill="#d98aa4" stroke="#24182e" stroke-width="2.4"/><ellipse cx="-2" cy="-8" rx="7" ry="3.5" fill="#fff" opacity=".7"/><path d="M-6 14 C -7 20 -5 24 -3 25 C -1 23 -1 19 -2 14 Z" fill="#d98aa4" stroke="#24182e" stroke-width="1.6"/></svg>');
    jouerEl(gl, [{transform:place(p.x, p.y, 0, .3), opacity:0}, {transform:place(p.x, p.y, 0, 1.1), opacity:1, offset:.2}, {transform:place(p.x, p.y, 0, 1), opacity:1}], {duration:D, easing:'ease-out'});
    pluie(this.fx, p.x, p.y, {n:6, forme:'goutte', c:['#d98aa4', '#e8f4ff'], angle:-90, ecart:70, v0:60, v1:140, g:600, t0:5, t1:7, d0:400, d1:600});
    var tire = copieP(g, {racine:{y:-6}, bassin:{x:10}, torse:24, tete:16, mA:[120, 120], hA:-150, mB:[60, 100], hB:-170, cB:-1, pA:[96, 262], fA:30, pB:[150, 272]});
    var happe = {racine:{y:-30}, bassin:{x:16, y:10}, torse:30, tete:24, mA:[100, 90], hA:-160, mB:[50, 80], hB:-170, cB:-1, pA:[80, 240], fA:50, pB:[110, 250], fB:40};
    var a = this.boite.animate([{transform:'translate(0px,0px)', opacity:1}, {transform:'translate(14px,-4px) rotate(4deg)', opacity:1, offset:.22, easing:'cubic-bezier(.6,0,.9,.4)'},
      {transform:'translate(' + dx + 'px,-46px) rotate(30deg) scale(.42)', opacity:0}], {duration:D, fill:'forwards'});
    this.jouer([{d:D * .22, p:tire, e:'oo'}, {d:D * .78, p:happe, e:'i'}]);
    return a.finished.then(function(){
      me._avale = true;
      me.boite.style.opacity = '0'; me.boite.style.transform = ''; a.cancel();
      me._idleOff();
      me.poser(g);
    });
  });
};
H.recrache = function(scene, depuis, opt){
  /* recrache(point) : point en pixels de l'écran (comme bete.ancre('bouche')) ; recrache(scene, point) : en pixels de la scène */
  if(scene && scene.x !== undefined){ opt = depuis; depuis = scene; scene = null; }
  opt = opt || {};
  return this._file(function(){
    this._mesure();
    var me = this, g = this.garde(), F2 = this.fx, c0 = this._px(125, 160), dep = depuis ? this._versBoite(scene, depuis) : {x:c0.x + 360, y:c0.y - 60};
    var C = this._calques('bave');
    var ox = dep.x - c0.x, oy = dep.y - c0.y, D = opt.d || 720, N = 16, kf = [], hautV = Math.max(70, Math.abs(ox) * .28);
    /* le vol : une cloche, il tourne en boule */
    for(var i = 0; i <= N; i++){
      var t = i / N, u = 1 - t, mx = ox / 2, my = Math.min(oy, 0) / 2 - hautV, x = u * u * ox + 2 * u * t * mx, y = u * u * oy + 2 * u * t * my;
      kf.push({offset:t, transform:'translate(' + r1(x) + 'px,' + r1(y) + 'px) rotate(' + r1(-540 * u) + 'deg) scale(' + (.62 + .38 * t).toFixed(3) + ')', opacity:1});
    }
    this.boite.style.opacity = ''; this._avale = false;
    var b0 = (g.bassin && g.bassin.y) || 0;
    var boule = {racine:{y:-30}, bassin:{y:b0 + 30}, torse:34, tete:24, pA:[118, 226], fA:40, pB:[150, 222], fB:40, mA:[160, 204], hA:60, mB:[136, 206], hB:60, cB:1};
    var splat = {racine:{y:0}, bassin:{y:b0 + 34, x:-4}, torse:22, tete:14, pA:[88, 272], pB:[172, 272], mA:[200, 176], hA:20, mB:[58, 180], hB:-160, cB:-1};
    var beurk = copieP(g, {bassin:{y:b0 + 10}, torse:10, tete:14, mA:[176, 168], mB:[96, 170]});
    var se1 = copieP(beurk, {torse:-6, tete:-22, bassin:{y:b0 + 8, r:-4}, mA:[196, 130], mB:[70, 120], cB:-1}), se2 = copieP(beurk, {torse:20, tete:24, bassin:{y:b0 + 8, r:4}, mA:[160, 120], mB:[110, 110], cB:1});
    this.poser(boule);
    this.boite.animate(kf, {duration:D, easing:'linear'});
    var pied = this._px(126, 292), atterrit = function(){
      me.expr('aie');
      ['epaules', 'tete', 'bras'].forEach(function(q, k){ montrer(C[q], true); animer(C[q], [{opacity:0, transform:'scale(.5)'}, {opacity:1, transform:'scale(1.12)', offset:.5}, {opacity:1, transform:'scale(1)'}], {duration:280, delay:k * 40, easing:'ease-out', fill:'backwards'}); });
      /* la flaque de bave sous ses pieds, des éclaboussures */
      surgit(F2, pied.x, pied.y + 2, 150, 26, '<svg viewBox="-75 -13 150 26" style="width:100%;height:100%;display:block;overflow:visible"><path d="M-66 2 C -70 -8 -40 -11 -10 -10 C 20 -12 64 -9 68 0 C 70 8 40 11 0 10 C -36 11 -62 10 -66 2 Z" fill="#a6e07a" fill-opacity=".85" stroke="#3e7a2a" stroke-width="2"/><ellipse cx="-20" cy="-4" rx="18" ry="3" fill="#eaffd0" opacity=".8"/></svg>',
        {d:2200, k:[{transform:place(pied.x, pied.y + 2, 0, .2) + ' scaleY(.5)', opacity:0}, {transform:place(pied.x, pied.y + 2, 0, 1.05), opacity:1, offset:.08}, {transform:place(pied.x, pied.y + 2, 0, 1), opacity:1, offset:.7}, {transform:place(pied.x, pied.y + 2, 0, 1.1), opacity:0}]});
      pluie(F2, pied.x, pied.y - 6, {n:14, forme:'goutte', c:['#a6e07a', '#c8f0a0', '#7ac85a'], angle:-90, ecart:75, v0:90, v1:220, g:700, t0:6, t1:9, d0:500, d1:800});
      if(opt.onAtterrit) try { opt.onAtterrit(); } catch(e){ console.error(e); }
    };
    var goutter = function(){
      /* la bave dégouline (on lit les points d'abord, on crée les gouttes ensuite) */
      var pts = [];
      ['tete', 'epaules', 'bras'].forEach(function(q){ (C.gouttes[q] || []).slice(0, 2).forEach(function(p){ var r = me._px(p[0], p[1]); pts.push(r); }); });
      pts.forEach(function(r, k){ pluie(F2, r.x, r.y, {n:1, forme:'goutte', c:'#a6e07a', angle:90, ecart:5, v0:5, v1:20, g:420, t0:6, t1:7, d0:700, d1:900, retard:k * 70}); });
    };
    var secoue = function(){
      ['epaules', 'tete', 'bras'].forEach(function(q){ animer(C[q], [{opacity:1, transform:'scale(1) rotate(0deg)'}, {opacity:.9, transform:'scale(1.03) rotate(-3deg)', offset:.2}, {opacity:.75, transform:'scale(.98) rotate(3deg)', offset:.45}, {opacity:0, transform:'scale(.9) rotate(0deg)'}],
        {duration:620, easing:'ease-in', fill:'forwards'}).then(function(){ if(!C[q]._a) montrer(C[q], false); }); });
      var a = me._px(126, 20), b = me._px(124, 106);
      pluie(F2, a.x, a.y, {n:9, forme:'goutte', c:['#a6e07a', '#c8f0a0'], angle:-90, ecart:85, v0:140, v1:260, g:800, t0:6, t1:9, d0:550, d1:850, etale:300});
      pluie(F2, b.x, b.y, {n:8, forme:'goutte', c:['#a6e07a', '#7ac85a'], angle:-90, ecart:85, v0:120, v1:240, g:800, t0:5, t1:8, d0:550, d1:850, etale:300});
    };
    var seq = [{d:D, p:boule, e:'lin'}, {d:110, p:splat, e:'oo', f0:atterrit}, {d:240, p:splat, e:'lin'}, {d:260, p:beurk, e:'io', f0:function(){ me.expr('surpris'); goutter(); }},
      {d:300, p:beurk, e:'lin', f0:function(){ me.expr('aie'); }}];
    for(var k = 0; k < 6; k++) seq.push({d:95, p:k % 2 ? se2 : se1, e:'io', f0:k ? null : secoue});
    seq.push({d:380, p:g, e:'b', f0:function(){ me.expr('content'); }, f:function(){ me.expr('garde'); me.cligner(); }});
    return this.jouer(seq);
  });
};
/* ============ les nouvelles armes (CONCEPTION-DONJON.md §6 et §10) ============
   Tout est sans filtre ; les vols sont calculés d'avance et joués par la carte graphique (vol2), la traînée est semée
   toutes les 40 ms (pas à chaque image) ; au plus une vingtaine de particules à la fois. */

/* ---------- le Pisteur : flèches d'argent, lourdes, de givre, d'acide, et la flèche qui rebondit ---------- */
var FL2 = {argent:1, lourde:1, givre:1, acide:1};
/* le recul de l'arc (flèche lourde) : tout le corps est repoussé, un souffle d'air part de l'arc */
H._recul = function(){
  this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(-12px)', offset:.18, easing:'cubic-bezier(.2,.8,.4,1)'}, {transform:'translateX(0px)'}], {duration:520, easing:'ease-out'});
  var p = this.rep('poignee'), F2 = this.fx;
  lueurFx(F2, p.x + 6, p.y, {c:'#ffffff', c2:'#e8e0d0', w:60, s0:.3, s1:1.6, d:320, o0:.8});
  pluie(F2, p.x + 10, p.y, {n:6, forme:'trait', c:['#ffffff', '#e8e0d0'], angle:0, ecart:40, v0:120, v1:240, g:0, t0:10, t1:18, d0:200, d1:320});
};
H._fleche2 = function(scene, n, t, to, type, opt){
  var L = couche(scene), len = Math.hypot(t.x - n.x, t.y - n.y), k = len / 124, me = this, lourd = type === 'lourde';
  var w = div(L, 'width:1px;height:1px;z-index:3');
  var coul = {argent:'rgba(225,238,255,.9)', lourde:'rgba(210,200,190,.55)', givre:'rgba(190,236,255,.85)', acide:'rgba(140,230,90,.7)', feu:'rgba(255,150,50,.75)', huile:'rgba(90,70,40,.5)', colle:'rgba(230,245,210,.7)'}[type] || 'rgba(255,250,220,.6)';
  var ep = (lourd ? 8 : 5) * k;
  var tr = div(w, 'left:' + r1(-len - 70 * k) + 'px;top:' + r1(-ep / 2) + 'px;width:' + r1(len * .9) + 'px;height:' + r1(ep) + 'px;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,0),' + coul + ')');
  tr.style.transform = 'none';
  var a = div(w, 'left:' + r1(-len - 14 * k) + 'px;top:' + r1(-16 * k) + 'px;width:' + r1(150 * k) + 'px;height:' + r1(32 * k) + 'px', FLECHE_SVG(type));
  a.style.transform = 'none';
  var dist = Math.hypot(to.x - t.x, to.y - t.y), D = Math.max(220, Math.min(560, dist / 1.5)) * (lourd ? 1.18 : 1);
  return vol2(w, t, to, {d:D, haut:dist * (lourd ? .035 : .06), pas:40, chaque:function(p, ang, u){
    var ca = Math.cos(ang / DEG), sa = Math.sin(ang / DEG), bx = p.x - ca * len * .5, by = p.y - sa * len * .5;
    if(type === 'argent'){
      pluie(L, bx + alea(-6, 6), by + alea(-4, 4), {n:1, forme:'etoile', c:['#ffffff', '#dfe7f2', '#bfd4ff'], angle:ang + 180, ecart:30, v0:5, v1:30, g:20, t0:9, t1:14, d0:380, d1:560});
      if(u > .2) pluie(L, p.x - ca * 20, p.y - sa * 20, {n:1, forme:'lueur', c:'#dfe7f2', angle:ang + 180, ecart:40, v0:10, v1:40, g:0, t0:2, t1:3, d0:260, d1:380});
    } else if(type === 'lourde'){
      pluie(L, bx, by + alea(-5, 5), {n:1, forme:'trait', c:['#ffffff', '#e8e0d0'], angle:ang + 180, ecart:6, v0:30, v1:70, g:0, t0:14, t1:24, d0:200, d1:300, o0:.8});
    } else if(type === 'givre'){
      pluie(L, bx + alea(-8, 8), by, {n:1, forme:'flocon', c:['#ffffff', '#cfefff'], angle:90, ecart:30, v0:10, v1:30, g:60, t0:8, t1:12, d0:500, d1:700});
      if(u > .15) pluie(L, p.x - ca * 10, p.y - sa * 10, {n:1, forme:'lueur', c:'#bfeaff', angle:ang + 180, ecart:30, v0:10, v1:30, g:0, t0:2, t1:3, d0:260, d1:380});
    } else if(type === 'acide'){
      if(u > .1) pluie(L, p.x - ca * 6, p.y + 4, {n:1, forme:'goutte', c:['#7ae04a', '#a6f070'], angle:90, ecart:15, v0:10, v1:40, g:700, t0:5, t1:7, d0:400, d1:550});
      if(u > .3 && Math.random() < .35) lueurFx(L, bx, by - 4, {c:'#c8e8b0', c2:'#8ab878', w:16, s0:.6, s1:2.2, dy:-10, d:600, o0:.5});
    } else if(type === 'feu') pluie(L, p.x - ca * 8, p.y - sa * 8, {n:2, forme:'lueur', c:['#ffd84a', '#ff8a2a'], angle:ang + 180, ecart:30, v0:20, v1:70, g:-160, t0:2.5, t1:4, d0:250, d1:450});
    else if(type === 'huile') pluie(L, p.x - ca * 6, p.y + 4, {n:1, forme:'goutte', c:'#3a3020', angle:90, ecart:20, v0:10, v1:40, g:700, t0:5, t1:6, d0:400, d1:550});
    else if(type === 'colle') pluie(L, p.x, p.y, {n:1, c:'#f2f8e4', bord:true, angle:90, ecart:30, v0:10, v1:30, g:500, t0:3, t1:5, d0:400, d1:600});
    else if(u > .05 && Math.random() < .6) pluie(L, bx, by, {n:1, c:'#fff6d0', angle:ang + 180, ecart:20, v0:10, v1:40, g:0, t0:2, t1:3, d0:200, d1:350});
  }}).then(function(r){
    if(opt.rebond) me._rebondFleche(L, r, type, w, a, tr, k, opt, to);
    else me._impactFleche2(L, r, type, w, a, tr, k, to);
    if(opt.onImpact) try { opt.onImpact(r); } catch(e){ console.error(e); }
    return r;
  });
};
/* la flèche plantée qui vibre (plus fort, plus longtemps et plus profond pour la lourde) */
function planter(w, tr, r, lourd, k){
  tr.animate([{opacity:1}, {opacity:0}], {duration:120, fill:'forwards'});
  var ang = r.ang, ca = Math.cos(ang / DEG), sa = Math.sin(ang / DEG), x = r.x + (lourd ? ca * 10 * k : 0), y = r.y + (lourd ? sa * 10 * k : 0), A = lourd ? 1.8 : 1;
  w.animate([{transform:place(r.x, r.y, ang)}, {transform:place(x + 2, y, ang - 6 * A)}, {transform:place(x + 1, y, ang + 4 * A)}, {transform:place(x + 1, y, ang - 2.5 * A)}, {transform:place(x + 1, y, ang + 1.2 * A)}, {transform:place(x + 1, y, ang)}], {duration:lourd ? 520 : 360, fill:'forwards'});
  w.animate([{opacity:1}, {opacity:1, offset:.78}, {opacity:0}], {duration:lourd ? 1300 : 900, fill:'forwards'}).finished.then(function(){ w.remove(); });
}
/* un flocon de neige géant / un cristal de glace / une étoile d'argent (dessins d'impact) */
function floconSvg(c){
  var b = '';
  for(var i = 0; i < 6; i++) b += '<g transform="rotate(' + (i * 60) + ')"><path d="M0 0 L 0 -40 M0 -16 L -9 -25 M0 -16 L 9 -25 M0 -28 L -6 -34 M0 -28 L 6 -34" stroke="#24182e" stroke-width="6" stroke-linecap="round" opacity=".5"/><path d="M0 0 L 0 -40 M0 -16 L -9 -25 M0 -16 L 9 -25 M0 -28 L -6 -34 M0 -28 L 6 -34" stroke="' + c + '" stroke-width="3.2" stroke-linecap="round"/></g>';
  return '<svg viewBox="-46 -46 92 92" style="width:100%;height:100%;display:block;overflow:visible"><circle r="30" fill="#bfeaff" opacity=".35"/>' + b + '<circle r="6" fill="#ffffff"/></svg>';
}
function cristauxSvg(){
  var s = '';
  [[-30, 34, 9], [-12, 44, 11], [8, 40, 10], [26, 30, 8], [-48, 22, 7], [44, 20, 7]].forEach(function(c){
    s += '<g transform="rotate(' + c[0] + ')"><path d="M' + (-c[2] / 2) + ' 0 L 0 ' + (-c[1]) + ' L ' + (c[2] / 2) + ' 0 Z" fill="#e8f8ff" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/><path d="M0 ' + (-c[1] + 4) + ' L ' + (c[2] / 4) + ' -2" stroke="#ffffff" stroke-width="1.6"/><path d="M0 ' + (-c[1]) + ' L ' + (c[2] / 2) + ' 0 L 0 0 Z" fill="#9ad8ff" opacity=".45"/></g>';
  });
  return '<svg viewBox="-60 -60 120 70" style="width:100%;height:100%;display:block;overflow:visible">' + s + '</svg>';
}
function etoileArgentSvg(){
  return '<svg viewBox="-60 -60 120 120" style="width:100%;height:100%;display:block;overflow:visible"><circle r="26" fill="#eef4ff" opacity=".35"/>' +
    '<path d="M0 -58 L 8 -8 L 58 0 L 8 8 L 0 58 L -8 8 L -58 0 L -8 -8 Z" fill="#f4f8ff" stroke="#8a9ab8" stroke-width="2"/><path d="M0 -30 L 5 -5 L 30 0 L 5 5 L 0 30 L -5 5 L -30 0 L -5 -5 Z" fill="#ffffff" transform="rotate(45)"/><circle r="8" fill="#ffffff"/></svg>';
}
H._impactFleche2 = function(L, r, type, w, a, tr, k, to){
  var x = r.x, y = r.y, ang = r.ang, lourd = type === 'lourde';
  planter(w, tr, r, lourd, k);
  if(type === 'argent'){
    surgit(L, x, y, 120, 120, etoileArgentSvg(), {d:560, s1:1.5});
    lueurFx(L, x, y, {c:'#ffffff', c2:'#dfe7f2', w:90, s0:.3, s1:1.5, d:420});
    anneau(L, x, y, {c:'#e6eef8', w:60, s0:.3, s1:2.4, d:560});
    pluie(L, x, y, {n:10, forme:'etoile', c:['#ffffff', '#dfe7f2', '#bfd4ff'], v0:60, v1:180, g:120, t0:8, t1:14, d0:500, d1:850});
    pluie(L, x, y, {n:8, forme:'trait', c:['#ffffff', '#e6eef8'], angle:ang + 180, ecart:70, v0:120, v1:260, g:200, t0:8, t1:14, d0:220, d1:400});
  } else if(lourd && to && to.metal){
    /* sur du métal : une gerbe d'étincelles, CLANG ! */
    lueurFx(L, x, y, {c:'#ffffff', c2:'#ffe08a', w:100, s0:.3, s1:1.4, d:300});
    surgit(L, x, y, 90, 90, chocSvg('#fff2a0', '#ffffff'), {d:360, r:10, s1:1.3});
    pluie(L, x, y, {n:16, forme:'trait', c:['#ffffff', '#fff6c0', '#ffd36a', '#ff9a3a'], angle:ang + 180, ecart:75, v0:160, v1:380, g:700, t0:10, t1:18, d0:300, d1:600});
    pluie(L, x, y, {n:5, forme:'lueur', c:'#ffb040', angle:ang + 180, ecart:60, v0:80, v1:180, g:600, t0:2.5, t1:3.5, d0:500, d1:800});
    anneau(L, x, y, {c:'#fff6c0', w:56, s0:.3, s1:2.2, d:420});
    mot(L, x + 20, y - 40, 'CLANG !', {t:28, r:-8, c:'#e8eef8', lueur:'rgba(255,220,140,.7)', monte:26, d:950});
  } else if(lourd){
    /* sur de la chair, du bois, de la pierre : un impact sourd, de la poussière, des éclats */
    surgit(L, x, y, 70, 70, chocSvg('#e8dcc8', '#fff8ec', 8), {d:340, r:6, s1:1.2});
    for(var i = 0; i < 3; i++) lueurFx(L, x + alea(-10, 10), y + alea(-8, 8), {c:'#d8ccbc', c2:'#a89888', w:alea(36, 50), s0:.4, s1:2.2, dx:alea(-24, 4), dy:-10, d:alea(600, 800), retard:i * 40, o0:.85});
    pluie(L, x, y, {n:9, forme:'eclat', c:['#8a7a6a', '#b8a898', '#5a4a3e'], angle:ang + 180, ecart:70, v0:90, v1:200, g:700, t0:5, t1:8, d0:400, d1:650});
    anneau(L, x, y, {c:'#e8dccc', w:60, s0:.3, s1:1.8, d:420});
  } else if(type === 'givre'){
    surgit(L, x, y, 84, 84, floconSvg('#e8f8ff'), {d:640, s1:1.4});
    lueurFx(L, x, y, {c:'#ffffff', c2:'#9ad8ff', w:100, s0:.3, s1:1.5, d:480});
    anneau(L, x, y, {c:'#bfeaff', w:60, s0:.3, s1:2.4, d:600});
    pluie(L, x, y, {n:12, forme:'eclat', c:['#eaf8ff', '#bfeaff', '#7fd8ff'], v0:80, v1:220, g:500, t0:6, t1:10, d0:450, d1:750});
    pluie(L, x, y - 10, {n:5, forme:'flocon', c:['#ffffff', '#cfefff'], v0:20, v1:60, g:40, t0:10, t1:15, d0:800, d1:1200, etale:200});
    surgit(L, x, y + 8, 56, 32, cristauxSvg(), {d:1100, k:[{transform:place(x, y + 4, 0, .2), opacity:0}, {transform:place(x, y + 4, 0, 1.05), opacity:1, offset:.15}, {transform:place(x, y + 4, 0, 1), opacity:1, offset:.75}, {transform:place(x, y + 8, 0, .9), opacity:0}]});
  } else if(type === 'acide'){
    lueurFx(L, x, y, {c:'#eaffd0', c2:'#7ae04a', w:80, h:64, s0:.3, s1:1.5, d:520});
    pluie(L, x, y, {n:12, forme:'goutte', c:['#7ae04a', '#a6f070', '#5ac83a'], angle:-90, ecart:85, v0:80, v1:200, g:700, t0:5, t1:8, d0:450, d1:750});
    for(var j = 0; j < 4; j++) lueurFx(L, x + alea(-14, 14), y - 8 - j * 6, {c:'#d8ecc8', c2:'#9ab88a', w:28, s0:.5, s1:2.6, dx:alea(-10, 10), dy:-40, d:1100, retard:120 + j * 110, o0:.7});
    pluie(L, x, y, {n:5, c:'#c8ff9a', bord:true, angle:-90, ecart:40, v0:20, v1:60, g:-60, t0:3, t1:5, d0:700, d1:1000, etale:400});
  }
};
/* la flèche qui REBONDIT (ennemi immunisé) : TING, elle ricoche, tournoie, retombe au sol devant lui et y reste un instant */
H._rebondFleche = function(L, r, type, w, a, tr, k, opt, to){
  tr.animate([{opacity:1}, {opacity:0}], {duration:100, fill:'forwards'});
  var metal = to && to.metal, len = 124 * k, ca = Math.cos(r.ang / DEG), sa = Math.sin(r.ang / DEG);
  lueurFx(L, r.x, r.y, {c:'#ffffff', c2:metal ? '#ffe08a' : '#fff6d0', w:60, s0:.3, s1:1.4, d:280});
  pluie(L, r.x, r.y, {n:metal ? 12 : 8, forme:'trait', c:['#ffffff', '#fff6c0', '#ffd36a'], angle:r.ang + 180, ecart:70, v0:140, v1:300, g:500, t0:8, t1:14, d0:220, d1:420});
  mot(L, r.x + 6, r.y - 34, 'TING !', {t:20, r:-10, c:'#fff6c0', monte:20, d:800});
  /* la flèche, recentrée sur son milieu, rebondit vers l'arrière (trajectoire calculée d'avance) */
  a.style.left = r1(-len / 2 - 14 * k) + 'px';
  var x = r.x - ca * len / 2, y = r.y - sa * len / 2, sol = opt.sol !== undefined ? opt.sol : r.y + 92;
  var vx = -alea(130, 190), vy = -alea(240, 300), ang = r.ang, va = -alea(820, 1080), dt = 1 / 60, t = 0, kf = [], rebonds = 0;
  kf.push({t:0, x:x, y:y, a:ang});
  while(t < 2.2 && rebonds < 2){
    t += dt; vy += 1100 * dt; x += vx * dt; y += vy * dt; ang += va * dt;
    if(y > sol - 3){ y = sol - 3; rebonds++; vy = -vy * .28; vx *= .45; va *= .25; if(rebonds === 2){ var cible = Math.round((ang - 180) / 180) * 180 + 180; ang = cible - 5; } }
    if(Math.round(t / dt) % 3 === 0 || rebonds === 2) kf.push({t:t, x:x, y:y, a:ang});
  }
  var T = t * 1000;
  w.animate(kf.map(function(q){ return {offset:Math.min(1, q.t / t), transform:place(q.x, q.y, q.a)}; }), {duration:T, easing:'linear', fill:'forwards'});
  pluie(L, x, sol - 2, {n:4, c:['#8a8098', '#b8aec8'], angle:-90, ecart:60, v0:30, v1:80, g:300, t0:2, t1:4, d0:300, d1:500, retard:T * .8});
  w.animate([{opacity:1}, {opacity:1, offset:.7}, {opacity:0}], {duration:T + 900, fill:'forwards'}).finished.then(function(){ w.remove(); });
};

/* ---------- l'Alchimiste : potions de givre, d'acide, d'huile et de colle (lancer(scene, to, 'givre')) ---------- */
var POTIONS = {feu:'#ff7a2a', fumigene:'#aab4d2', huile:'#f2b630', colle:'#ece4d0', baume:'#5fd08a', coeur:'#ff5a7a', givre:'#7fd8ff', acide:'#7ae04a'};
var POT2 = {givre:1, acide:1, huile:1, colle:1};
var lancerBase = H.lancer, preparerBase = H.preparer;
H.lancer = function(scene, to, couleur, opt){
  if(couleur && typeof couleur === 'object'){ opt = couleur; couleur = opt.potion; }
  opt = opt || {};
  var nom = POTIONS[couleur] ? couleur : opt.potion;
  if(!nom || !POT2[nom]) return lancerBase.call(this, scene, to, POTIONS[couleur] || couleur, opt);
  var o2 = {}; for(var k in opt) o2[k] = opt[k]; o2._potion = nom;
  return lancerBase.call(this, scene, to, opt.couleur || POTIONS[nom], o2);
};
H.preparer = function(couleur){ return preparerBase.call(this, POTIONS[couleur] || couleur); };
/* une fiole qui vole sans filtre (sa lueur est un dégradé), en tournant ; la traînée dépend de la potion */
H._fioleVole2 = function(scene, a, to, c, opt){
  var L = couche(scene), nom = opt._potion, me = this;
  var e = div(L, 'width:58px;height:58px', '<div style="position:absolute;inset:0;' + tache('#ffffff', c) + ';opacity:.55"></div><div style="position:absolute;left:16px;top:13px;width:26px;height:31px">' + fioleSVG(c) + '</div>');
  var dist = Math.hypot(to.x - a.x, to.y - a.y);
  return vol2(e, a, to, {d:Math.max(420, Math.min(760, dist * 1.3)), haut:120 + dist * .26, tourne:620, r0:-20, pas:50, chaque:function(p){
    if(nom === 'givre') pluie(L, p.x, p.y, {n:1, forme:'flocon', c:['#ffffff', '#cfefff'], angle:90, ecart:40, v0:10, v1:30, g:60, t0:8, t1:11, d0:450, d1:650});
    else if(nom === 'acide'){ pluie(L, p.x, p.y + 8, {n:1, forme:'goutte', c:['#7ae04a', '#a6f070'], angle:90, ecart:20, v0:10, v1:30, g:700, t0:5, t1:7, d0:400, d1:550}); if(Math.random() < .3) lueurFx(L, p.x, p.y - 6, {c:'#d8ecc8', c2:'#9ab88a', w:16, s0:.6, s1:2, dy:-12, d:600, o0:.5}); }
    else if(nom === 'huile') pluie(L, p.x, p.y + 8, {n:1, forme:'goutte', c:['#f2b630', '#ffd870'], angle:90, ecart:20, v0:10, v1:30, g:800, t0:5, t1:7, d0:400, d1:550});
    else pluie(L, p.x, p.y, {n:1, c:'#f4f8ea', bord:true, angle:90, ecart:30, v0:10, v1:30, g:300, t0:3, t1:5, d0:400, d1:600});
  }}).then(function(r){
    e.remove();
    me._eclatPotion(L, to, nom, c);
    if(opt.onImpact) try { opt.onImpact(r); } catch(err){ console.error(err); }
    return r;
  });
};
H._eclatPotion = function(L, to, nom, c){
  var x = to.x, y = to.y;
  /* le verre qui se brise (toutes les potions) */
  pluie(L, x, y, {n:7, forme:'eclat', c:['#e8f8ff', '#bfe0f0', '#ffffff'], v0:120, v1:260, g:600, t0:6, t1:10, d0:450, d1:700});
  if(nom === 'givre'){
    lueurFx(L, x, y, {c:'#ffffff', c2:'#7fd8ff', w:130, h:110, s0:.2, s1:1.6, d:620});
    surgit(L, x, y, 110, 110, floconSvg('#e8f8ff'), {d:760, s1:1.5});
    anneau(L, x, y, {c:'#bfeaff', w:80, s0:.3, s1:2.6, d:650});
    pluie(L, x, y, {n:10, forme:'eclat', c:['#eaf8ff', '#bfeaff', '#7fd8ff'], v0:90, v1:240, g:500, t0:7, t1:11, d0:500, d1:800});
    surgit(L, x, y + 10, 80, 46, cristauxSvg(), {d:1300, k:[{transform:place(x, y + 6, 0, .2), opacity:0}, {transform:place(x, y + 6, 0, 1.08), opacity:1, offset:.14}, {transform:place(x, y + 6, 0, 1), opacity:1, offset:.78}, {transform:place(x, y + 10, 0, .9), opacity:0}]});
    for(var i = 0; i < 3; i++) lueurFx(L, x + alea(-20, 20), y - 6 - i * 8, {c:'#ffffff', c2:'#dff4ff', w:40, s0:.5, s1:2.4, dy:-20, d:1100, retard:150 + i * 120, o0:.75});
  } else if(nom === 'acide'){
    lueurFx(L, x, y, {c:'#eaffd0', c2:'#7ae04a', w:110, h:84, s0:.2, s1:1.6, d:620});
    anneau(L, x, y, {c:'#9af060', w:70, s0:.3, s1:2.4, d:560});
    pluie(L, x, y, {n:14, forme:'goutte', c:['#7ae04a', '#a6f070', '#5ac83a'], angle:-90, ecart:90, v0:90, v1:230, g:700, t0:6, t1:9, d0:500, d1:800});
    for(var j = 0; j < 4; j++) lueurFx(L, x + alea(-20, 20), y - 6 - j * 6, {c:'#d8ecc8', c2:'#9ab88a', w:36, s0:.5, s1:2.6, dx:alea(-12, 12), dy:-50, d:1300, retard:160 + j * 140, o0:.75});
    pluie(L, x, y, {n:5, c:'#c8ff9a', bord:true, angle:-90, ecart:40, v0:20, v1:60, g:-60, t0:3, t1:5, d0:700, d1:1000, etale:500});
  } else if(nom === 'huile'){
    lueurFx(L, x, y, {c:'#fff6c0', c2:'#f2b630', w:100, h:80, s0:.2, s1:1.5, d:640});
    anneau(L, x, y, {c:'#ffd870', w:60, s0:.3, s1:2.2, d:560});
    pluie(L, x, y, {n:14, forme:'goutte', c:['#f2b630', '#ffd870', '#d89a20'], angle:-90, ecart:85, v0:80, v1:210, g:900, t0:6, t1:9, d0:500, d1:800});
    pluie(L, x, y + 6, {n:3, forme:'goutte', c:'#f2b630', angle:90, ecart:10, v0:5, v1:15, g:160, t0:7, t1:9, d0:1000, d1:1300, etale:300, retard:200});
    pluie(L, x, y, {n:4, forme:'etoile', c:'#fff6c0', v0:10, v1:40, g:0, t0:8, t1:12, d0:500, d1:700, etale:300});
  } else {
    lueurFx(L, x, y, {c:'#ffffff', c2:'#ece4d0', w:100, s0:.2, s1:1.4, d:800});
    for(var f = 0; f < 7; f++){
      var an = alea(0, 360), ln = alea(26, 46), fil = div(L, 'width:' + r1(ln) + 'px;height:3px;border-radius:3px;background:#f4f8ea;transform-origin:0 50%');
      jouerEl(fil, [{transform:'translate(' + x + 'px,' + y + 'px) rotate(' + an + 'deg) scaleX(0)', opacity:1}, {transform:'translate(' + x + 'px,' + y + 'px) rotate(' + (an + 8) + 'deg) scaleX(1)', opacity:1, offset:.3},
        {transform:'translate(' + x + 'px,' + (y + 12) + 'px) rotate(' + (an + 20) + 'deg) scaleX(.9)', opacity:0}], {duration:alea(900, 1200), easing:'ease-out'});
    }
    pluie(L, x, y, {n:9, c:'#f4f8ea', bord:true, v0:40, v1:130, g:260, t0:4, t1:7, d0:700, d1:1000});
  }
};

/* ---------- le Sage : le cristal de lune (un éclair qui illumine TOUTE la salle) ---------- */
/* les images de lumière : de petits dégradés (256 px) faits une fois, que la carte graphique agrandit et estompe ;
   (iPhone : pas d'image plein écran ; le canvas est libéré tout de suite) */
var LUMIERE = {garde:[]};
function imagesLumiere(){
  if(LUMIERE.pret) return LUMIERE.pret;
  function faire(dessin){
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d'); dessin(g); var u = c.toDataURL('image/png'); c.width = c.height = 0; return u;
  }
  try {
    LUMIERE.grand = faire(function(g){
      var r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      [[0, 'rgba(255,255,255,1)'], [.1, 'rgba(250,253,255,.96)'], [.28, 'rgba(226,242,255,.82)'], [.55, 'rgba(196,224,255,.55)'], [.8, 'rgba(170,205,255,.28)'], [1, 'rgba(160,200,255,0)']].forEach(function(s){ r.addColorStop(s[0], s[1]); });
      g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    });
    LUMIERE.rayons = faire(function(g){
      g.translate(128, 128);
      for(var i = 0; i < 18; i++){
        var a = i / 18 * Math.PI * 2 + (i % 2 ? .08 : -.05), l = i % 2 ? 92 : 126, w = i % 2 ? .05 : .085;
        for(var p = 0; p < 3; p++){
          var ww = w * (1 - p * .3), r = g.createRadialGradient(0, 0, 0, 0, 0, l);
          r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(.5, 'rgba(225,240,255,.3)'); r.addColorStop(1, 'rgba(200,225,255,0)');
          g.fillStyle = r; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - ww) * l, Math.sin(a - ww) * l); g.lineTo(Math.cos(a + ww) * l, Math.sin(a + ww) * l); g.closePath(); g.fill();
        }
      }
    });
  } catch(e){ LUMIERE.grand = LUMIERE.rayons = null; }
  LUMIERE.pret = Promise.all([LUMIERE.grand, LUMIERE.rayons].filter(Boolean).map(function(u){ var im = new Image(); im.src = u; LUMIERE.garde.push(im); return im.decode ? im.decode().catch(function(){}) : null; }));
  return LUMIERE.pret;
}
/* les images de lumière sont faites pendant la cuisson (un écran calme) */
preparer = (function(base){ return function(liste, o){ return base(liste, o).then(function(r){ return imagesLumiere().then(function(){ return r; }); }); }; })(preparer);
function lunePopSvg(){
  return '<svg viewBox="-60 -60 120 120" style="width:100%;height:100%;display:block;overflow:visible"><circle r="44" fill="#ffffff" opacity=".22"/>' +
    '<path d="' + croissant(-4, 0, 40, 18, -4, 34) + '" fill="#f4f8ff" stroke="#8aa8d8" stroke-width="3"/><path d="M0 -58 L 4 -4 L 58 0 L 4 4 L 0 58 L -4 4 L -58 0 L -4 -4 Z" fill="#ffffff" opacity=".9"/></svg>';
}
var sortBase = H.sort;
H.sort = function(scene, to, opt){
  opt = opt || {};
  if(opt.cristal || (opt.cristal !== false && this.equipe('cristal-lune'))){
    var o = {}; for(var k in opt) o[k] = opt[k];
    if(to && !o.cibles) o.cibles = [to];
    return this.eclairSalle(scene, o);
  }
  return sortBase.call(this, scene, to, opt);
};
/* le calque de lune qui grossit autour du cristal pendant qu'il se charge (il suit le bâton) */
H._luneCharge = function(){
  if(this._lc !== undefined) return this._lc;
  var r = this.reps.cristal, x = +r.getAttribute('cx'), y = +r.getAttribute('cy'), id = 'hlc' + (++uid);
  var e = this._lc = this._calqueDans(this.cristal && this.cristal.parentNode, '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#eef6ff" stop-opacity=".85"/><stop offset="1" stop-color="#bfd8ff" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="' + x + '" cy="' + y + '" r="46" fill="url(#' + id + ')"/>', [x, y]);
  return e;
};
/* (un calque dans une pièce précise) */
H._calqueDans = function(p, html, origine){
  if(!p) return null;
  var e;
  if(this.cuit && window.Cuire){ e = window.Cuire.ilot(p, html, 'ha-calque'); e.style.width = e.style.height = '1px'; }
  else { e = document.createElementNS(SVGNS, 'g'); e.setAttribute('class', 'haJ ha-calque'); e.innerHTML = html; p.appendChild(e); }
  e.style.display = 'none';
  if(origine) e.style.transformOrigin = origine[0] + 'px ' + origine[1] + 'px';
  return e;
};
H.eclairSalle = function(scene, opt){
  opt = opt || {};
  imagesLumiere();
  var me = this;
  return this._file(function(sig){
    var g = this.garde(), base = {pA:[100, 272], pB:[156, 272]}, lc = this._luneCharge();
    var leve = copie(g, copie(base, {bassin:{y:4}, torse:-4, tete:-12, mB:[150, 80], hB:0, mA:[178, 70], hA:-150}));
    var haut = copie(leve, {bassin:{y:-2}, torse:-9, tete:-18, mB:[146, 40], hB:-6, mA:[186, 56], hA:-160, sB:1.06});
    var flash = copie(haut, {torse:-12, tete:-20, mB:[146, 34]});
    this.expr('colere');
    return this.jouer([
      {d:300, p:leve, e:'io', f:function(){
        me.cristalFlash(true); me.expr('cri');
        if(lc){ montrer(lc, true); animer(lc, [{opacity:0, transform:'scale(.2)'}, {opacity:1, transform:'scale(1)', offset:.8}, {opacity:1, transform:'scale(1.25)'}], {duration:480, easing:'ease-in', fill:'forwards'}); }
        var p = me.rep('cristal');
        for(var i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2, d = 70, e = div(me.fx, 'width:14px;height:14px', FORMES.etoile(i % 2 ? '#e8f0ff' : '#ffffff', 14));
          jouerEl(e, [{transform:place(p.x + Math.cos(a) * d, p.y - 30 + Math.sin(a) * d, 0, .5), opacity:0}, {transform:place(p.x + Math.cos(a) * d * .6, p.y - 30 + Math.sin(a) * d * .6, 90, 1), opacity:1, offset:.4}, {transform:place(p.x, p.y - 40, 180, .3), opacity:0}], {duration:420, delay:i * 25, easing:'ease-in', fill:'backwards'}); }
      }},
      {d:340, p:haut, e:'b'},
      {d:140, p:flash, e:'o', f:function(){
        if(lc) animer(lc, [{opacity:1, transform:'scale(1.25)'}, {opacity:0, transform:'scale(2.2)'}], {duration:500, easing:'ease-out', fill:'forwards'}).then(function(){ montrer(lc, false); });
        sig(me._eclairSalle(scene, opt));
      }},
      {d:600, p:flash, e:'lin', f0:function(){ me.expr('savoir'); }},
      {d:440, p:g, e:'io', f:function(){ me.expr('garde'); }}
    ]);
  });
};
H._eclairSalle = function(scene, opt){
  var L = couche(scene), c = this.rep('cristal', scene), W = scene.offsetWidth || 960, Hs = scene.offsetHeight || 540;
  var S = Math.max(W, Hs) * 2.3 / 256;
  /* 1) la grande lumière (une image de 256 px que la carte graphique agrandit) */
  if(LUMIERE.grand){
    var im = div(L, 'width:256px;height:256px', '<img src="' + LUMIERE.grand + '" alt="" style="width:100%;height:100%;display:block">');
    jouerEl(im, [{transform:place(c.x, c.y, 0, S * .12), opacity:0}, {transform:place(c.x, c.y, 0, S * .85), opacity:1, offset:.06}, {transform:place(c.x, c.y, 0, S), opacity:.9, offset:.3}, {transform:place(c.x, c.y, 0, S * 1.04), opacity:0}], {duration:1500, easing:'ease-out'});
  }
  /* 2) les rayons qui tournent un peu */
  if(LUMIERE.rayons){
    var ry = div(L, 'width:256px;height:256px', '<img src="' + LUMIERE.rayons + '" alt="" style="width:100%;height:100%;display:block">');
    jouerEl(ry, [{transform:place(c.x, c.y, 0, .5), opacity:0}, {transform:place(c.x, c.y, 6, 2.6), opacity:1, offset:.15}, {transform:place(c.x, c.y, 22, 4.4), opacity:0}], {duration:1100, easing:'ease-out'});
  }
  /* 3) le croissant de lune qui jaillit du cristal, l'onde qui traverse la salle */
  surgit(L, c.x, c.y, 130, 130, lunePopSvg(), {d:800, s1:1.8});
  anneau(L, c.x, c.y, {c:'#e8f6ff', w:320, s0:.15, s1:5.5, d:1000});
  anneau(L, c.x, c.y, {c:'#ffffff', w:320, s0:.1, s1:3.6, d:800, retard:120});
  /* 4) des éclats de lune partout dans la salle */
  var n = 16;
  for(var i = 0; i < n; i++){
    var x = W * (.06 + .88 * (i / n)) + alea(-20, 20), y = Hs * alea(.12, .68), t = alea(12, 22), e = div(L, 'width:' + r1(t) + 'px;height:' + r1(t) + 'px', FORMES.etoile(i % 3 ? '#ffffff' : '#dfe8ff', t));
    jouerEl(e, [{transform:place(x, y, 0, 0), opacity:0}, {transform:place(x, y - 4, 45, 1.3), opacity:1, offset:.35}, {transform:place(x, y - 12, 90, 0), opacity:0}], {duration:alea(600, 900), delay:100 + i * 28, easing:'ease-out', fill:'backwards'});
  }
  /* 5) sur chaque cible : un éclat */
  (opt.cibles || []).forEach(function(q, k){
    lueurFx(L, q.x, q.y, {c:'#ffffff', c2:'#cfe8ff', w:120, s0:.3, s1:1.6, d:600, retard:120 + k * 60});
    pluie(L, q.x, q.y, {n:6, forme:'etoile', c:['#ffffff', '#e8f0ff'], v0:60, v1:140, g:60, t0:10, t1:15, d0:500, d1:800, retard:120 + k * 60});
  });
  if(opt.onImpact) try { opt.onImpact(c); } catch(e){ console.error(e); }
  return c;
};

/* ---------- le Sage : le bâton de chêne (le bouclier protège deux héros : bouclier(scene, [cible1, cible2])) ---------- */
var bouclierBase = H.bouclier;
H.bouclier = function(scene, cible, opt){
  if(!(cible instanceof Array) || cible.length < 2) return bouclierBase.call(this, scene, cible instanceof Array ? cible[0] : cible, opt);
  opt = opt || {};
  var me = this, L = couche(scene), domes = [], pret;
  var p = this._file(function(sig){
    var g = this.garde(), base = {pA:[102, 272], pB:[156, 272]}, fin, tous = new Promise(function(r){ fin = r; });
    var leve = copie(g, copie(base, {bassin:{y:2}, torse:-4, tete:-12, mB:[150, 74], hB:0, mA:[178, 66], hA:-160}));
    var haut = copie(leve, {bassin:{y:-2}, torse:-6, tete:-14, mB:[150, 62], mA:[184, 56]});
    this.expr('colere');
    return Promise.all([tous, this.jouer([
      {d:300, p:leve, e:'io', f:function(){
        me.cristalFlash(true); me.expr('cri'); var q = me.rep('baton-bas');
        anneau(me.fx, q.x, q.y, {w:130, h:28, c:CYAN, s0:0.2, s1:1.4, d:800});
        me._runesMontent();
        if(me.equipe('baton-chene')){
          var c = me.rep('chene');
          anneau(me.fx, q.x, q.y, {c:'#8ae07a', w:150, h:32, s0:.2, s1:1.5, d:900});
          pluie(me.fx, c.x, c.y, {n:8, forme:'feuille', c:['#6ab85a', '#5aa04a', '#8ad07a'], v0:60, v1:150, g:60, t0:16, t1:22, d0:800, d1:1200, etale:200});
        }
      }},
      {d:220, p:haut, e:'b'},
      {d:260, p:haut, e:'lin', f:function(){
        var a = me.rep('cristal', scene);
        cible.forEach(function(el, i){
          me._fil(L, scene, a, el, i).then(function(){
            domes[i] = me._dome(L, scene, el, opt);
            if(domes.filter(Boolean).length === cible.length){ var gr = groupeDomes(domes); sig(gr); fin(gr); }
          });
        });
      }},
      {d:420, p:g, e:'io', f:function(){ me.expr('content'); }},
      {d:300, p:g, e:'lin', f:function(){ me.expr('garde'); }}
    ])]).then(function(r){ return r[0]; });
  });
  pret = p;
  p.absorber = function(n, i){ return pret.then(function(b){ return b.absorber(n, i); }); };
  p.retirer = function(i){ return pret.then(function(b){ return b.retirer(i); }); };
  return p;
};
/* deux dômes : b[0], b[1] (chacun avec absorber / retirer), et b.absorber(n[, i]) / b.retirer([i]) pour tous */
function groupeDomes(liste){
  var g = liste.slice();
  function choix(i){ return i === undefined ? liste : [liste[i]]; }
  g.absorber = function(n, i){ return Promise.all(choix(i).map(function(b){ return b.absorber(n); })); };
  g.retirer = function(i){ return Promise.all(choix(i).map(function(b){ return b.retirer(); })); };
  return g;
}
/* une boule de runes qui file du cristal jusqu'au héros protégé (avant que son dôme ne se pose) */
H._fil = function(L, scene, a, el, i){
  var R = scene.getBoundingClientRect(), k = (R.width / (scene.offsetWidth || R.width)) || 1, r = el.getBoundingClientRect();
  var b = {x:(r.left - R.left) / k + r.width / k / 2, y:(r.top - R.top) / k + r.height / k * .2};
  var e = div(L, 'width:30px;height:30px;' + tache('#ffffff', '#8ff3ff'));
  return vol2(e, a, b, {d:340, haut:90 + i * 30, retard:i * 90, apparait:true, pas:40, chaque:function(p){
    pluie(L, p.x, p.y, {n:1, forme:'etoile', c:['#e8fdff', CYAN], v0:5, v1:30, g:20, t0:8, t1:12, d0:300, d1:450});
  }}).then(function(q){ e.remove(); lueurFx(L, q.x, q.y + 20, {c:'#ffffff', c2:CYAN, w:90, s0:.3, s1:1.6, d:420}); return q; });
};

/* ============ les apparences (Persos.defaut du jeu) ============ */
var PE = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], p2:['#ffe7d2', '#efb88e', '#d9976d', '#ff877a'], p3:['#f8d8b0', '#dea575', '#c48652', '#f2786a'],
  p4:['#eec899', '#c7935c', '#a77441', '#e4685a'], p5:['#d29d6f', '#a06840', '#80502d', '#d65a50'], p6:['#ad774e', '#6f4428', '#55331c', '#c84c4a']};
var CH = {brun:['#d39654', '#7c4624', '#3a1e0e'], noir:['#6b7096', '#272840', '#0e0e1a'], blond:['#fff4c2', '#f0c95a', '#a8781c'], roux:['#ffb886', '#dc622a', '#7a2a0e'], rose:['#ffd6ea', '#f07aab', '#932659'], chatain:['#e6bb85', '#a06f40', '#4c2d14']};
var YX = {vert:['#0a3a22', '#1f9150', '#86ffbd'], bleu:['#0a1f4a', '#2f6fd0', '#a6dcff'], marron:['#2a1206', '#7a4420', '#e0a876'], ambre:['#3a1a02', '#c47a10', '#ffd98a'], gris:['#1e2430', '#5f6f86', '#d6e2f0']};
var DEFAUT = {pisteur:{fille:true, pe:PE.p1, ch:CH.roux, ir:YX.vert}, alchimiste:{fille:false, pe:PE.p4, ch:CH.noir, ir:YX.ambre}, sage:{fille:true, pe:PE.p5, ch:CH.noir, ir:YX.ambre, lunettes:true}};
var AUTRES = {pisteur:{fille:false, pe:PE.p6, ch:CH.noir, ir:YX.marron}, alchimiste:{fille:true, pe:PE.p2, ch:CH.blond, ir:YX.bleu}, sage:{fille:false, pe:PE.p3, ch:CH.chatain, ir:YX.gris}};

var HerosAnime = {
  creer:function(conteneur, role, lk){ return new Heros(conteneur, role, lk); },
  /* cuire les héros une fois (Promise), pendant un écran calme : ensuite, creer() en fait des copies fluides (RAPIDITE.md) */
  preparer:preparer,
  DEFAUT:DEFAUT, AUTRES:AUTRES, PEAUX:PE, CHEVEUX:CH, YEUX:YX,
  /* les objets (equiper), les sortes de flèches (tirer), les potions par leur nom (lancer, preparer), les réactions (touche) */
  OBJETS:Object.keys(OBJETS), FLECHES:['normale', 'rebond'].concat(TYPES_FL), POTIONS:POTIONS, REACTIONS:['froid', 'grouillement', 'poing'],
  grain:true
};
window.HerosAnime = HerosAnime;
})();
