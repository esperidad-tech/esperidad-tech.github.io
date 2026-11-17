/* ==========================================================
   LES HABITS RIGOLOS DE MIMI (Romain, 17 novembre, 07 h 07 : « une vingtaine de nouveaux habits assez originaux avec des petites
   animations. Fais attention à ne pas casser les animations de Mimi à cause des habits ou à cacher certaines choses un peu trop […]
   il faut que ça soit des petits trucs rigolos, originaux. ») — DESIGN-saison1.md §12.73.

   Un habit = du SVG dessiné autour de (0, 0), LE MILIEU DE SA TÊTE, comme les accessoires d'avant (atelier.js, dessinAcc) :
   il est rangé dans le groupe de sa tête, il la suit donc partout (elle se penche, elle dort, elle court) sans rien demander au pantin.
   Ses repères : le crâne va de x = -16,5 à 16,5 et de y = -16,5 (le haut) à 16,4 (le menton) ; les oreilles montent de (±3, -13) à
   (±18, -30) ; les yeux sont en (±7,2 ; -1), larges de 11 ; le nez en (0 ; 3,5) ; la gueule de y = 6 à 15.
   Où il se met (slot) : 'tete' (entre les oreilles), 'cou' (dessiné DERRIÈRE le crâne : on n'en voit que ce qui dépasse sous le menton),
   'nez' (sur le museau ou autour des yeux : il suit son visage, et il disparaît quand on la voit de dos — data-m « face:v » et « vis »).

   Les petites animations sont du CSS (atelier.css, .mi-h-…) : elles ne touchent que des morceaux de l'habit, JAMAIS un morceau du
   pantin (aucun data-m dans un morceau animé). Elles vont par à-coups : entre deux, rien ne bouge, donc rien n'est redessiné.
   Ce qu'on a vérifié pour chacun : il ne cache ni ses yeux, ni sa gueule (le bâillement, la langue), ni ses moustaches.

   MimiPantin.HABITS : {id:{slot, nom, art (avec son article, pour le conteur), d:function(){ → le SVG }}}
   MimiPantin.habit(id) → le SVG complet de l'habit (un groupe .at-acc)
   ========================================================== */
(function(G){
'use strict';
var M = G.MimiPantin, K = '#24182e';
function P(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (w || 1.7) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function T(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (w || 1.4) + '"' + (x && x.indexOf('stroke-linecap') >= 0 ? '' : ' stroke-linecap="round"') + ' stroke-linejoin="round"' + (x || '') + '/>'; }
function C(x, y, r, f, w){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (w === 0 ? '' : ' stroke="' + K + '" stroke-width="' + (w || 1.5) + '"') + '/>'; }
function E(x, y, rx, ry, f, w, x2){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (w === 0 ? '' : ' stroke="' + K + '" stroke-width="' + (w || 1.6) + '"') + (x2 || '') + '/>'; }
/* un morceau qui bouge (une classe .mi-h-…, et parfois un petit retard pour que deux morceaux ne bougent pas ensemble) */
function A(cls, s, retard){ return '<g class="' + cls + '"' + (retard ? ' style="animation-delay:' + retard + 's"' : '') + '>' + s + '</g>'; }
function r1(v){ return Math.round(v * 10) / 10; }
/* une petite étoile à quatre branches (un éclat) */
function eclat(x, y, r, f){ return '<path d="M' + x + ',' + r1(y - r) + ' Q' + x + ',' + y + ' ' + r1(x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + r1(y + r) + ' Q' + x + ',' + y + ' ' + r1(x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + r1(y - r) + ' Z" fill="' + f + '" stroke="' + K + '" stroke-width=".5"/>'; }
/* un point de la courbe du cou (t : 0 à gauche … 1 à droite) ; bas : jusqu'où elle descend sous le menton */
function cou(t, bas){ var u = 1 - t; return [r1(u * u * -16 + t * t * 16), r1(u * u * 11 + 2 * u * t * (bas || 25) + t * t * 11)]; }
var COU = 'M-15,10 Q0,21 15,10', COU_BAS = 'M-16,11 Q0,25 16,11', BANDEAU = 'M-13,-10.5 Q0,-22.5 13,-10.5';

var H = M.HABITS = {
  /* ---------------- sur la tête ---------------- */
  helice:{slot:'tete', nom:'Casquette à hélice', art:'une casquette à hélice',
    d:function(){
      var cal = 'M-11.5,-12 C-11.5,-21 -6,-25 0,-25 C6,-25 11.5,-21 11.5,-12 Q0,-9.6 -11.5,-12 Z';
      return E(10, -12.4, 8.6, 2.6, '#e0443a') + F(cal, '#3d8ef0') +
        F('M-3.8,-24.5 Q-5.4,-18 -4.8,-10.6 Q0,-10.2 4.8,-10.6 Q5.4,-18 3.8,-24.5 Q0,-25.4 -3.8,-24.5 Z', '#ffd84a') + T(cal, K, 1.7) +
        T('M0,-25 V-29.2', K, 2.4) +
        A('mi-h-helice', E(-5.6, -29.8, 5.3, 1.9, '#e0443a', 1.3) + E(5.6, -29.8, 5.3, 1.9, '#4cbb5c', 1.3)) +
        C(0, -29.8, 1.6, '#ffd84a', 1.2);
    }},
  antennes:{slot:'tete', nom:'Antennes de Martienne', art:'des antennes de Martienne', pl:1,
    d:function(){
      var a = function(sg, col, ret){
        var d = 'M' + (sg * 6) + ',-15.6 q' + (sg * -4.4) + ',-2.6 0,-5.2 q' + (sg * 4.4) + ',-2.6 0,-5.2 q' + (sg * -3.4) + ',-2 ' + (sg * 1) + ',-4.4';
        return A('mi-h-ressort', T(d, K, 2.8) + T(d, '#d9d2e6', 1.2) + C(sg * 7.4, -33, 3.3, col) + C(sg * 7.4 - 1, -34, 0.9, '#fff', 0), ret);
      };
      return T(BANDEAU, K, 4.2) + T(BANDEAU, '#9d6ee3', 2.2) + a(-1, '#6fe08a', 0) + a(1, '#ffd84a', 0.45);
    }},
  pirate:{slot:'tete', nom:'Tricorne de pirate', art:'un tricorne de pirate',
    d:function(){
      return A('mi-h-plume', P('M11.5,-21.5 C12.5,-29.5 17.5,-34.5 23,-35.5 C22,-29.5 19,-24.5 14,-20.5 Z', '#e0443a', 1.4) + T('M13,-22 C15.6,-27.6 18.6,-31.6 21.6,-34.4', '#ffb3a8', 0.8)) +
        P('M-19,-10.5 C-17,-19 -9,-25.5 0,-26.5 C9,-25.5 17,-19 19,-10.5 Q0,-17.5 -19,-10.5 Z', '#2b2233') +
        T('M-17.4,-11.8 Q0,-18.8 17.4,-11.8', '#f5efe0', 1.5) +
        T('M-4.4,-17.4 L4.4,-22.8 M-4.4,-22.8 L4.4,-17.4', '#f5efe0', 1.3) +
        C(0, -20.6, 3, '#f5efe0', 1) + P('M-1.6,-18.4 h3.2 v1.7 h-3.2 Z', '#f5efe0', 0.8) + C(-1.1, -21, 0.8, K, 0) + C(1.1, -21, 0.8, K, 0);
    }},
  toque:{slot:'tete', nom:'Toque de grande cheffe', art:'une toque de grande cheffe',
    d:function(){
      return A('mi-h-souffle', P('M-11,-19 C-18,-23 -15,-33.5 -6.5,-31 C-4.5,-37.5 5,-37.5 6.5,-31 C15,-33.5 18,-23 11,-19 Z', '#fffdf6') + T('M-5,-21.4 q-1,-4 1,-7 M3.4,-21.4 q1,-4 -0.6,-7.4', '#d9d2c4', 1.1)) +
        P('M-10.5,-19.6 Q0,-22.2 10.5,-19.6 L10.5,-12.4 Q0,-15.6 -10.5,-12.4 Z', '#fffdf6') + T('M-10.3,-15.9 Q0,-18.9 10.3,-15.9', '#d9d2c4', 0.9);
    }},
  lapin:{slot:'tete', nom:'Oreilles de lapin', art:'des oreilles de lapin', pl:1,
    d:function(){
      var o = function(sg){
        var X = function(v){ return r1(sg * v); };
        return P('M' + X(9.5) + ',-15.5 C' + X(13) + ',-25 ' + X(11.5) + ',-38.5 ' + X(7.5) + ',-40 C' + X(3.5) + ',-38.5 ' + X(3.5) + ',-25 ' + X(4.5) + ',-16.5 Z', '#fffdf6') +
          F('M' + X(8.4) + ',-19 C' + X(10.4) + ',-26 ' + X(9.6) + ',-34.5 ' + X(7.5) + ',-36.5 C' + X(5.6) + ',-34.5 ' + X(5.4) + ',-26 ' + X(6) + ',-19 Z', '#ffb3cf');
      };
      return o(-1) + A('mi-h-oreille', o(1)) + T(BANDEAU, K, 4.2) + T(BANDEAU, '#ff9ec4', 2.2);
    }},
  aureole:{slot:'tete', nom:'Auréole de petit ange', art:'une auréole de petit ange',
    d:function(){
      return A('mi-h-flotte', '<ellipse cx="0" cy="-27" rx="11" ry="3.3" fill="none" stroke="' + K + '" stroke-width="4.4"/><ellipse cx="0" cy="-27" rx="11" ry="3.3" fill="none" stroke="#ffd84a" stroke-width="2.3"/>' + T('M-7.4,-29 Q-3,-30.7 2.4,-30.2', '#fff6c2', 0.9)) +
        A('mi-h-brille', eclat(14, -31, 2.6, '#fff6a8'), 0.5) + A('mi-h-brille', eclat(-13.4, -23.6, 2, '#fff6a8'), 1.7);
    }},
  licorne:{slot:'tete', nom:'Corne de licorne', art:'une corne de licorne',
    d:function(){
      return P('M-3.8,-15 L0.6,-39 L4.2,-15.4 Q0,-13.6 -3.8,-15 Z', '#fff1d6') +
        T('M-3,-19.6 L3.8,-21.6 M-2.2,-24.6 L3.2,-26.4 M-1.4,-29.6 L2.5,-31 M-0.6,-34 L1.7,-35', '#ffb3cf', 1.3) +
        C(-5.2, -14.4, 2.4, '#ff8fb3', 1.1) + C(5.4, -14.8, 2.4, '#b796ff', 1.1) + C(0.2, -13.2, 2.4, '#8fd0ff', 1.1) +
        C(-5.2, -14.4, 0.8, '#fff4a8', 0) + C(5.4, -14.8, 0.8, '#fff4a8', 0) + C(0.2, -13.2, 0.8, '#fff4a8', 0) +
        A('mi-h-brille', eclat(8.4, -33, 2.8, '#fff6a8')) + A('mi-h-brille', eclat(-7.6, -27, 2.2, '#ffd0ea'), 1.1) + A('mi-h-brille', eclat(7, -23, 1.8, '#c9f0ff'), 2.1);
    }},
  pompon:{slot:'tete', nom:'Bonnet à pompon', art:'un bonnet à pompon',
    d:function(){
      return A('mi-h-pompon', C(0, -31.6, 4.6, '#fffdf6', 1.6) + T('M-2,-33 l1.4,1.4 M1.6,-33.6 l-1,1.6 M0,-30.6 l1.6,0.8', '#d9d2c4', 0.9)) +
        P('M-14.5,-9.5 C-15.5,-23 -8,-29.5 0,-29.5 C8,-29.5 15.5,-23 14.5,-9.5 Q0,-14 -14.5,-9.5 Z', '#3fb7a6') +
        T('M-12.2,-18.4 l3.5,-3.4 3.5,3.4 3.5,-3.4 3.4,3.4 3.5,-3.4 3.5,3.4 3.5,-3.4', '#fffdf6', 1.5) +
        P('M-15.4,-13.2 Q0,-18 15.4,-13.2 L15,-8 Q0,-12.6 -15,-8 Z', '#fff4dc') +
        T('M-10,-10 v-4.2 M-5,-11.2 v-4.4 M0,-11.6 v-4.6 M5,-11.2 v-4.4 M10,-10 v-4.2', '#e3d3ae', 1);
    }},
  hautdeforme:{slot:'tete', nom:'Haut-de-forme au lapin', art:'un haut-de-forme de magicienne, avec son lapin',
    d:function(){
      var lapin = P('M-3.8,-36 C-5.8,-41 -5,-46 -3,-46.4 C-1.2,-46 -1,-41 -1.2,-36.4 Z', '#fffdf6', 1.2) + P('M3.8,-36 C5.8,-41 5,-46 3,-46.4 C1.2,-46 1,-41 1.2,-36.4 Z', '#fffdf6', 1.2) +
        C(0, -35, 4.4, '#fffdf6', 1.4) + C(-1.7, -35.8, 0.75, K, 0) + C(1.7, -35.8, 0.75, K, 0) + C(0, -34, 0.8, '#ff8fb3', 0);
      return E(0, -31, 9, 2.6, '#40305a') + A('mi-h-coucou', lapin) +
        P('M-9,-31 L-9,-13.5 Q0,-10.8 9,-13.5 L9,-31 Q0,-28.4 -9,-31 Z', '#2b2233') +
        P('M-9,-18.6 Q0,-15.9 9,-18.6 L9,-14.6 Q0,-11.9 -9,-14.6 Z', '#e0443a', 1.2) +
        P('M-15.5,-13.2 Q0,-8.6 15.5,-13.2 Q15.8,-11 13.8,-10.4 Q0,-6.8 -13.8,-10.4 Q-15.8,-11 -15.5,-13.2 Z', '#2b2233');
    }},
  grenouille:{slot:'tete', nom:'Grenouille-chapeau', art:'une grenouille qui se prend pour un chapeau',
    d:function(){
      return E(-6.8, -16.4, 3.5, 2.6, '#3f9e4d', 1.3) + E(6.8, -16.4, 3.5, 2.6, '#3f9e4d', 1.3) +
        E(0, -19.6, 7.6, 5.2, '#5cc76b') +
        A('mi-h-gonfle', E(0, -16.6, 3.6, 1.9, '#d8f5b0', 0.9)) +
        C(-4.2, -25, 2.9, '#5cc76b', 1.4) + C(4.2, -25, 2.9, '#5cc76b', 1.4) + C(-4.2, -25.2, 1.7, '#fff', 0) + C(4.2, -25.2, 1.7, '#fff', 0) + C(-4, -25.2, 0.9, K, 0) + C(4.4, -25.2, 0.9, K, 0) +
        T('M-3.8,-20.8 Q0,-18.9 3.8,-20.8', K, 1) +
        T('M-4.6,-15 l-1.6,1.5 M-4.6,-15 l0.2,2 M4.6,-15 l1.6,1.5 M4.6,-15 l-0.2,2', '#3f9e4d', 1.3);
    }},
  nid:{slot:'tete', nom:'Nid et son poussin', art:'un nid, avec son poussin',
    d:function(){
      var poussin = T('M0,-26 l-1,-2.2 M0,-26 l1.2,-2', '#f0b429', 1.1) + C(0, -21.6, 4.6, '#ffd84a', 1.4) + C(-1.7, -22.8, 0.75, K, 0) + C(1.7, -22.8, 0.75, K, 0) + P('M-1.5,-21.2 L0,-19 L1.5,-21.2 Z', '#ff9a3c', 0.8);
      return A('mi-h-coucou2', poussin) +
        P('M-12,-17.5 Q0,-12.5 12,-17.5 C12,-12 6,-9.4 0,-9.4 C-6,-9.4 -12,-12 -12,-17.5 Z', '#a9743a') +
        T('M-9,-15 l5,2 M-3,-12.6 l6,-1 M5,-13.4 l4,-2.4 M-6,-11.4 l4,0.6 M2,-10.8 l4,-1', '#7a4f22', 1) +
        T('M-12,-17.5 l-2.4,-1.6 M12,-17.5 l2.6,-1.2 M-7.4,-10 l-1.8,1.2', '#a9743a', 1.3);
    }},
  nuage:{slot:'tete', nom:'Petit nuage de pluie', art:'un petit nuage de pluie rien qu\'à elle',
    d:function(){
      var g = function(x, ret){ return A('mi-h-goutte', F('M' + x + ',-27.2 C' + r1(x + 1.7) + ',-24.8 ' + r1(x + 1.5) + ',-23 ' + x + ',-23 C' + r1(x - 1.5) + ',-23 ' + r1(x - 1.7) + ',-24.8 ' + x + ',-27.2 Z', '#5fb8ff', ' stroke="' + K + '" stroke-width=".6"'), ret); };
      return g(-5, 0) + g(0.6, 0.6) + g(6, 1.2) +
        P('M-9,-27 C-13.5,-27 -13.5,-33 -9,-33 C-9,-37.5 -2,-38.5 0,-35 C3,-39 10,-37 9.5,-32.6 C13.5,-32.6 13.5,-27 9.5,-27 Z', '#e9edf5') + T('M-6,-29.4 q3,1.4 6,0', '#c5cbd9', 1);
    }},
  gateau:{slot:'tete', nom:'Gâteau d\'anniversaire', art:'un gâteau d\'anniversaire, bougie comprise',
    d:function(){
      return P('M-8.5,-21 L-8.5,-12.8 Q0,-10 8.5,-12.8 L8.5,-21 Q0,-18.4 -8.5,-21 Z', '#ffb3cf') +
        C(-5.2, -14.4, 0.8, '#e0443a', 0) + C(0, -12.8, 0.8, '#3d8ef0', 0) + C(5.2, -14.4, 0.8, '#4cbb5c', 0) + C(-2.6, -13, 0.7, '#ffd84a', 0) + C(2.8, -13.2, 0.7, '#9d6ee3', 0) +
        P('M-8.5,-21 Q0,-23.6 8.5,-21 Q8.8,-18 6.4,-18.4 Q5,-15.6 3,-18 Q1.4,-15.2 -0.6,-17.8 Q-2.6,-15.4 -4.4,-18 Q-6.4,-16 -8.5,-18.6 Z', '#fffdf6', 1.4) +
        P('M-1.1,-21.8 h2.2 v-5.8 h-2.2 Z', '#8fd0ff', 1.1) + T('M-1.1,-23.6 l2.2,-1.2 M-1.1,-25.8 l2.2,-1.2', '#fff', 0.8) +
        A('mi-h-flamme', P('M0,-33 C2.2,-30.6 2,-28 0,-27.8 C-2,-28 -2.2,-30.6 0,-33 Z', '#ffb02e', 1.1) + F('M0,-30.8 C1,-29.8 0.9,-28.6 0,-28.4 C-0.9,-28.6 -1,-29.8 0,-30.8 Z', '#fff3a8'));
    }},

  /* ---------------- autour du cou (derrière le crâne : on voit ce qui dépasse sous le menton) ---------------- */
  echarpe:{slot:'cou', nom:'Écharpe rayée', art:'une écharpe rayée',
    d:function(){
      return T(COU, K, 9) + T(COU, '#e0443a', 6.2) + T(COU, '#fffdf6', 6.2, ' stroke-dasharray="3.2 4.4" stroke-linecap="butt"') +
        A('mi-h-pan', P('M6.5,15.5 L12.8,14 L15.5,27.5 L9.6,29 Z', '#e0443a', 1.5) + T('M8.2,19.4 l5.6,-1.4 M9.1,23.6 l5.6,-1.4', '#fffdf6', 2, ' stroke-linecap="butt"') + T('M10,29 l-0.4,2.4 M12.4,28.4 l0.2,2.4 M14.6,27.8 l0.8,2.2', '#e0443a', 1.3)) +
        C(9.4, 15.6, 3, '#c4332b', 1.4);
    }},
  hawai:{slot:'cou', nom:'Collier de fleurs', art:'un collier de fleurs des îles',
    d:function(){
      var cols = ['#ff8fb3', '#ffd84a', '#8fd0ff', '#fffdf6', '#b796ff', '#ff8fb3', '#ffd84a'], s = T(COU_BAS, '#4cbb5c', 2);
      cols.forEach(function(col, i){ var q = cou(0.1 + i * 0.8 / 6); s += A('mi-h-fleur', C(q[0], q[1], 3.4, col, 1.2) + C(q[0], q[1], 1.2, col === '#ffd84a' ? '#ff9a3c' : '#fff4a8', 0), r1(i * 0.16)); });
      return s;
    }},
  medaille:{slot:'cou', nom:'Médaille de championne', art:'une médaille de championne',
    d:function(){
      return A('mi-h-pendule', P('M-7.5,13 L-3.8,14.6 L0.2,23.5 L-2.6,25 Z', '#3d8ef0', 1.3) + P('M7.5,13 L3.8,14.6 L-0.2,23.5 L2.6,25 Z', '#e0443a', 1.3) +
        C(0, 27.6, 4.9, '#ffd84a', 1.6) + '<circle cx="0" cy="27.6" r="3.3" fill="none" stroke="#f0a020" stroke-width=".8"/>' +
        F('M0,24.9 l0.85,1.8 1.95,.2 -1.45,1.35 .4,1.95 -1.75,-1 -1.75,1 .4,-1.95 -1.45,-1.35 1.95,-.2 Z', '#f0a020'));
    }},
  lampions:{slot:'cou', nom:'Guirlande de lampions', art:'une guirlande de lampions',
    d:function(){
      var cols = ['#ff5d5d', '#ffd84a', '#5fd38d', '#5fb8ff', '#d28bff'], s = T(COU_BAS, K, 2.2);
      cols.forEach(function(col, i){ var q = cou(0.16 + i * 0.17); s += P('M' + r1(q[0] - 1) + ',' + r1(q[1] - 0.6) + ' h2 v1.6 h-2 Z', '#5a4630', 0.8) + A('mi-h-lampe', C(q[0], r1(q[1] + 3.4), 2.7, col, 1.1) + C(r1(q[0] - 0.8), r1(q[1] + 2.6), 0.7, '#fff', 0), r1(i * 0.35)); });
      return s;
    }},
  cravate:{slot:'cou', nom:'Cravate à pois', art:'une cravate à pois',
    d:function(){
      return T(COU, K, 6.4) + T(COU, '#fffdf6', 3.4) +
        A('mi-h-pendule', P('M-2.6,16.2 L2.6,16.2 L3.4,19.6 L-3.4,19.6 Z', '#3d6fd6', 1.3) + P('M-3,19.6 L3,19.6 L4.6,29 L0,33 L-4.6,29 Z', '#3d8ef0', 1.5) +
          C(-1, 23, 0.9, '#fff', 0) + C(1.5, 26.2, 0.9, '#fff', 0) + C(-1.4, 28.6, 0.9, '#fff', 0));
    }},

  /* ---------------- sur le museau, autour des yeux (ses yeux, sa gueule et ses moustaches restent bien visibles) ---------------- */
  lunettes:{slot:'nez', nom:'Lunettes rondes', art:'des lunettes rondes', pl:1,
    d:function(){
      var v = function(x){ return '<circle cx="' + x + '" cy="-1" r="6.9" fill="#bfe6ff" fill-opacity=".16" stroke="' + K + '" stroke-width="2.9"/><circle cx="' + x + '" cy="-1" r="6.9" fill="none" stroke="#e0443a" stroke-width="1.3"/>'; };
      return T('M-14,-2 L-17.6,-3.6 M14,-2 L17.6,-3.6', K, 2) + v(-7.2) + v(7.2) + A('mi-h-reflet', T('M-10.9,-4.2 l2.7,-2.3 M3.5,-4.2 l2.7,-2.3', '#fff', 1.3));
    }},
  nez_clown:{slot:'nez', nom:'Nez de clown', art:'un nez de clown',
    d:function(){ return A('mi-h-pouet', C(0, 3.3, 3.9, '#e0443a', 1.5) + C(-1.2, 2.1, 1.1, '#fff', 0)); }},
  masque:{slot:'nez', nom:'Masque de super-héroïne', art:'un masque de super-héroïne',
    d:function(){
      return '<path d="M-16.5,-2 C-16.5,-10.5 -4,-11 0,-6.5 C4,-11 16.5,-10.5 16.5,-2 C16.5,5.6 5,6.8 0,1.4 C-5,6.8 -16.5,5.6 -16.5,-2 Z ' +
        'M-13.6,-1 a6.4,5.9 0 1,0 12.8,0 a6.4,5.9 0 1,0 -12.8,0 Z M0.8,-1 a6.4,5.9 0 1,0 12.8,0 a6.4,5.9 0 1,0 -12.8,0 Z" fill="#7b4ac9" fill-rule="evenodd" stroke="' + K + '" stroke-width="1.5" stroke-linejoin="round"/>' +
        T('M-14.6,-5.4 Q-9,-9.6 -3,-7.4 M14.6,-5.4 Q9,-9.6 3,-7.4', '#a987e8', 1) +
        A('mi-h-brille', eclat(16, -10, 2.6, '#fff6a8'), 0.8);
    }}
};

/* Le SVG complet d'un habit (rien si on ne le connaît pas) */
M.habit = function(id){
  var h = H[id];
  if(!h) return '';
  var s = h.d();
  if(h.slot === 'nez') s = '<g data-m="face:v"><g data-m="vis">' + s + '</g></g>';
  return '<g class="at-acc at-acc-' + h.slot + ' mi-habit" data-habit="' + id + '">' + s + '</g>';
};
/* où on peut en mettre un (dans cet ordre, dans la garde-robe) */
M.HABITS_OU = [['cou', 'Autour du cou'], ['tete', 'Sur la tête'], ['nez', 'Sur le museau']];
})(window);
