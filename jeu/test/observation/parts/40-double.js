
/* ==========================================================
   LE DOUBLE (Alchimiste) — façon Dobble.
   Deux cartes rondes : la carte du chaudron (en haut / à gauche) et
   ta carte. Elles ont TOUJOURS exactement un symbole en commun (plan
   projectif d'ordre q : q = 5 → 31 cartes de 6 symboles ; q = 7 →
   57 cartes de 8 symboles). Toucher ce symbole (sur l'une ou l'autre
   carte) : ta carte part sur le chaudron, une nouvelle arrive.
   Une erreur : la carte tremble et le sablier perd quelques secondes.
   Mods : zone (symboles plus gros, touche plus large), temps (+N s),
   lent (sablier plus long), erreurs (+N boucliers : une erreur gratuite),
   aide (N indices 💡 : le symbole commun brille), revele (il brille tout
   seul après 3 secondes), facile (cœur).
   ========================================================== */
var SYM = [];
function S(id, f, c, art){ SYM.push({id:id, f:f, c:c, art:art}); }
var FAMILLES = {fiole:'#9d6ee3', plante:'#4fbf6a', ciel:'#f6d23a', bete:'#c98a4a', objet:'#3f7fe0', pierre:'#3fd0c8', feu:'#f08a3c'};
var VR = '#eaf6ff';
S('fiole', 'fiole', '#9d6ee3', function(c){ var b = 'M-5,-22 L5,-22 L5,-10 C15,-6 18,2 16,9 C13,19 -13,19 -16,9 C-18,2 -15,-6 -5,-10 Z'; return Pa(b, VR) + Pa('M-16.5,4 C-6,0 6,8 16.5,4 C15,15 8,18 0,18 C-8,18 -15,15 -16.5,4 Z', c, 0) + Pa(b, 'none') + Re(-6, -27, 12, 6, 2, '#c07a3e', 2) + Br('M-11,-2 C-13,3 -12,8 -10,11', 2.2); });
S('eprouvette', 'fiole', '#4fbf6a', function(c){ return '<g transform="rotate(-18)">' + Pa('M-6,-22 L6,-22 L6,16 C6,24 -6,24 -6,16 Z', VR) + Pa('M-6,0 L6,0 L6,16 C6,24 -6,24 -6,16 Z', c, 0) + Pa('M-6,-22 L6,-22 L6,16 C6,24 -6,24 -6,16 Z', 'none') + Re(-8.5, -25, 17, 4, 2, '#d8ecff', 2) + Ci(-1, -6, 2, c, 1.2) + Ci(2, -12, 1.5, c, 1.2) + '</g>'; });
S('bouteille', 'fiole', '#3f7fe0', function(c){ return Pa('M-4,-22 L4,-22 L4,-11 C12,-7 12,-3 12,1 L12,18 C12,21 10,22 8,22 L-8,22 C-10,22 -12,21 -12,18 L-12,1 C-12,-3 -12,-7 -4,-11 Z', c) + Om('M4,-11 C12,-7 12,-3 12,1 L12,18 C12,21 10,22 8,22 L5,22 C7,10 7,-2 4,-11 Z', 0.25) + Re(-9, 3, 18, 10, 2, '#f3e7cb', 1.6) + Re(-5, -27, 10, 6, 2, '#c07a3e', 2) + Br('M-8,-1 V16', 2.2, 0.4); });
S('bocal', 'fiole', '#f08a3c', function(c){ return Re(-15, -12, 30, 33, 8, VR) + Pa('M-13,0 C-6,-3 6,3 13,0 L13,14 C13,18 11,19 8,19 L-8,19 C-11,19 -13,18 -13,14 Z', c, 0) + Re(-15, -12, 30, 33, 8, 'none') + Re(-17, -21, 34, 10, 3, '#c98450') + Br('M-10,-6 V12', 2, 0.5); });
S('chaudron', 'objet', '#4fbf6a', function(c){ return Tr('M-13,15 L-16,22 M13,15 L16,22', K, 3.6) + Pa('M-20,-6 C-22,12 -10,19 0,19 C10,19 22,12 20,-6 Z', '#3a3352') + Br('M-14,0 C-13,8 -9,12 -4,14', 2, 0.35) + El(0, -6, 22, 6, '#2b2540') + El(0, -6, 18, 4, c, 0) + Ci(-6, -10, 3, clair(c, 0.4), 1.4) + Ci(6, -13, 3.6, clair(c, 0.4), 1.4); });
S('mortier', 'objet', '#9a94b8', function(c){ return Pa('M2,-4 L14,-24 C16,-27 20,-25 18,-22 L8,-2 Z', '#d8c8b0') + Pa('M-19,-4 C-19,12 -10,19 0,19 C10,19 19,12 19,-4 Z', c) + Om('M19,-4 C19,12 10,19 0,19 C8,14 11,6 11,-4 Z', 0.22) + El(0, -4, 19, 5, fonce(c, 0.25)); });
S('sablier', 'objet', '#f6d23a', function(c){ var v = 'M-10,-18 C-10,-6 -2,-4 -2,0 C-2,4 -10,6 -10,18 L10,18 C10,6 2,4 2,0 C2,-4 10,-6 10,-18 Z'; return Pa(v, VR) + Pa('M-8,17 C-7,10 -3,7 0,6 C3,7 7,10 8,17 Z', c, 0) + Pa('M-7,-15 L7,-15 C6,-10 3,-6 0,-4 C-3,-6 -6,-10 -7,-15 Z', c, 0) + Pa(v, 'none') + Re(-15, -24, 30, 6, 2.5, '#a8743f') + Re(-15, 18, 30, 6, 2.5, '#a8743f'); });
S('feuille', 'plante', '#4fbf6a', function(c){ return Pa('M-18,18 C-22,-6 -4,-22 20,-20 C22,4 6,20 -18,18 Z', c) + Tr('M-18,18 C-6,6 6,-6 16,-16', fonce(c, 0.35), 2) + Tr('M-6,6 L-8,-6 M2,-2 L10,0 M4,-4 L2,-14', fonce(c, 0.35), 1.4); });
S('trefle', 'plante', '#2f9e44', function(c){ var s = Tr('M0,4 C2,12 4,18 8,22', '#2a6a2a', 2.6); [-90, 30, 150].forEach(function(a){ s += '<g transform="rotate(' + a + ') translate(10,0)">' + Pa('M-9,0 C-9,-9 0,-11 2,-4 C4,-11 13,-9 11,0 C9,6 2,9 1,10 C0,9 -9,6 -9,0 Z', c, 2, ' transform="rotate(90)"') + '</g>'; }); return s; });
S('champignon', 'plante', '#e5484d', function(c){ return Pa('M-7,20 C-7,10 -6,2 -5,-2 L5,-2 C6,2 7,10 7,20 Z', '#fff4dc') + Pa('M-22,0 C-22,-24 22,-24 22,0 C14,4 -14,4 -22,0 Z', c) + Ci(-10, -10, 4, '#ffffff', 1.4) + Ci(5, -14, 3.4, '#ffffff', 1.4) + Ci(13, -5, 3, '#ffffff', 1.4); });
S('fleur', 'plante', '#ef7fa8', function(c){ var s = ''; for(var k = 0; k < 6; k++){ var a = k * 60; s += El(0, -12, 7, 11, c, 2, ' transform="rotate(' + a + ')"'); } return s + Ci(0, 0, 7, '#f6d23a', 2); });
S('lavande', 'plante', '#9d6ee3', function(c){ var s = Tr('M0,24 V-12', '#3f8a4a', 2.6) + Pa('M0,14 C-8,6 -14,8 -14,12 C-10,14 -4,14 0,14 Z', '#4fbf6a', 1.6); for(var k = 0; k < 6; k++) s += El(k % 2 ? 4 : -4, -20 + k * 5.5, 4.6, 5.2, k % 2 ? c : fonce(c, 0.15), 1.5); return s; });
S('baies', 'plante', '#7d3aa8', function(c){ return Pa('M2,-14 C10,-24 20,-20 20,-14 C12,-10 6,-11 2,-14 Z', '#4fbf6a', 1.6) + Tr('M2,-14 L-2,-4 M2,-14 L8,-2', '#3f7a3a', 1.8) + Ci(-7, 2, 8, c, 2) + Ci(9, 4, 8, c, 2) + Ci(1, 14, 8, c, 2) + Ci(-9, 0, 2, '#ffffff', 0, ' opacity=".7"') + Ci(7, 2, 2, '#ffffff', 0, ' opacity=".7"') + Ci(-1, 12, 2, '#ffffff', 0, ' opacity=".7"'); });
S('gland', 'plante', '#a8743f', function(c){ return Pa('M-12,-4 C-12,10 -6,20 0,22 C6,20 12,10 12,-4 Z', c) + Pa('M-16,-4 C-16,-16 16,-16 16,-4 C10,0 -10,0 -16,-4 Z', '#6b4a2a') + Tr('M-10,-8 L-4,-13 M-4,-6 L4,-14 M4,-6 L10,-11', '#4a2e1a', 1.4) + Tr('M0,-14 V-20', '#4a2e1a', 2.4) + Br('M-7,2 C-7,8 -5,13 -2,16', 1.8, 0.45); });
S('pomme', 'plante', '#e5484d', function(c){ return Pa('M0,-12 C-6,-20 -21,-18 -20,-2 C-19,12 -8,20 0,16 C8,20 19,12 20,-2 C21,-18 6,-20 0,-12 Z', c) + Tr('M0,-12 L2,-21', '#5e3a1e', 2.4) + Pa('M2,-18 C8,-26 16,-22 16,-19 C10,-15 6,-15 2,-18 Z', '#4fbf6a', 1.6) + Br('M-13,-6 C-13,-10 -10,-12 -7,-12', 2.2, 0.6); });
S('cristal', 'pierre', '#3fd0c8', function(c){ return Pa('M0,-24 L12,-12 L12,14 L0,24 L-12,14 L-12,-12 Z', c) + Pa('M0,-24 L12,-12 L12,14 L0,24 Z', fonce(c, 0.25), 0) + Pa('M0,-24 L12,-12 L12,14 L0,24 L-12,14 L-12,-12 Z', 'none') + Tr('M-12,-12 L0,-4 L12,-12 M0,-4 V24', K, 1.4, 0.5) + Br('M-7,-10 L-7,8', 2.2); });
S('diamant', 'pierre', '#8ff3ff', function(c){ return Pa('M-21,-6 L-11,-18 L11,-18 L21,-6 L0,21 Z', c) + Tr('M-21,-6 H21 M-11,-18 L-6,-6 L0,21 L6,-6 L11,-18 M-6,-6 L0,-18 L6,-6', K, 1.4, 0.6) + Pa('M11,-18 L21,-6 L0,21 L6,-6 Z', fonce(c, 0.2), 0, ' opacity=".5"') + Br('M-14,-9 L-9,-15', 2.2); });
S('lune', 'ciel', '#f6d23a', function(c){ return Pa('M6,-22 C-12,-22 -22,-6 -18,8 C-14,20 0,24 10,20 C-4,16 -10,4 -8,-6 C-6,-14 0,-20 6,-22 Z', c) + Ci(-10, 4, 2, fonce(c, 0.25), 0) + Ci(-6, 12, 1.5, fonce(c, 0.25), 0); });
S('etoile', 'ciel', '#f6d23a', function(c){ var d = ''; for(var k = 0; k < 10; k++){ var a = k * Math.PI / 5 - Math.PI / 2, r = k % 2 ? 9.5 : 23; d += (k ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r + 2) + ' '; } return Pa(d + 'Z', c) + Br('M-6,-4 L-2,-12', 2, 0.6); });
S('soleil', 'ciel', '#f08a3c', function(c){ var s = ''; for(var k = 0; k < 8; k++) s += Pa('M-4,-14 L0,-24 L4,-14 Z', clair(c, 0.2), 1.8, ' transform="rotate(' + k * 45 + ')"'); return s + Ci(0, 0, 13, c, 2.4) + Ci(-4, -3, 1.6, K, 0) + Ci(4, -3, 1.6, K, 0) + Tr('M-5,4 C-2,7 2,7 5,4', K, 1.6); });
S('eclair', 'ciel', '#f6d23a', function(c){ return Pa('M4,-24 L-14,4 L-2,4 L-8,24 L14,-6 L2,-6 L10,-24 Z', c); });
S('flamme', 'feu', '#f08a3c', function(c){ return Pa('M0,-24 C10,-12 18,-4 16,8 C14,18 6,22 0,22 C-6,22 -14,18 -16,8 C-18,-4 -8,-6 -6,-16 C-2,-10 -2,-6 0,-4 C2,-12 0,-18 0,-24 Z', c) + Pa('M0,4 C6,8 8,12 6,16 C4,20 -4,20 -6,16 C-8,12 -4,8 0,4 Z', '#ffe36a', 1.6); });
S('goutte', 'ciel', '#3f7fe0', function(c){ return Pa('M0,-24 C8,-10 16,-2 16,8 C16,18 8,23 0,23 C-8,23 -16,18 -16,8 C-16,-2 -8,-10 0,-24 Z', c) + Br('M-8,6 C-8,12 -5,15 -2,16', 2.4, 0.6); });
S('flocon', 'ciel', '#8ff3ff', function(c){ var d = ''; for(var k = 0; k < 6; k++){ var a = k * Math.PI / 3, x = Math.cos(a) * 22, y = Math.sin(a) * 22, x2 = Math.cos(a) * 13, y2 = Math.sin(a) * 13; d += 'M0,0 L' + f1(x) + ',' + f1(y) + ' M' + f1(x2) + ',' + f1(y2) + ' L' + f1(x2 + Math.cos(a + 0.8) * 7) + ',' + f1(y2 + Math.sin(a + 0.8) * 7) + ' M' + f1(x2) + ',' + f1(y2) + ' L' + f1(x2 + Math.cos(a - 0.8) * 7) + ',' + f1(y2 + Math.sin(a - 0.8) * 7) + ' '; } return Tr(d, K, 7) + Tr(d, c, 3.6) + Ci(0, 0, 4, c, 2); });
S('nuage', 'ciel', '#c9d3ff', function(c){ return Pa('M-18,12 C-26,12 -26,0 -18,-1 C-18,-12 -4,-16 2,-8 C6,-16 20,-14 18,-2 C26,-2 26,12 18,12 Z', c) + Br('M-14,4 C-14,0 -12,-2 -9,-3', 2, 0.6); });
S('corbeau', 'bete', '#3a3352', function(c){ return Pa('M-20,8 L-26,14 L-22,2 Z', c, 2) + Pa('M-20,6 C-18,-8 -2,-12 8,-8 C12,-14 20,-14 22,-8 L28,-6 L22,-3 C20,6 8,14 -4,14 C-10,14 -16,12 -20,6 Z', c) + Pa('M-12,0 C-6,6 6,6 10,2 C4,-2 -6,-4 -12,0 Z', clair(c, 0.2), 1.6) + Ci(15, -9, 1.8, '#ffffff', 0) + Tr('M-2,14 L-4,22 M4,13 L4,22', '#f6a23a', 2); });
S('chat', 'bete', '#f2a65a', function(c){ return Pa('M-18,-6 L-16,-24 L-6,-14 Z', c) + Pa('M18,-6 L16,-24 L6,-14 Z', c) + Ci(0, 2, 18, c) + El(-7, -1, 3, 4, '#3a3352', 0) + El(7, -1, 3, 4, '#3a3352', 0) + Pa('M-3,6 L3,6 L0,9 Z', '#ff9fb8', 1.4) + Tr('M-8,10 h-12 M-8,12 l-11,4 M8,10 h12 M8,12 l11,4', K, 1.2, 0.7); });
S('hibou', 'bete', '#a8743f', function(c){ return Pa('M-16,-14 L-12,-24 L-6,-17 L6,-17 L12,-24 L16,-14 C20,0 18,20 0,22 C-18,20 -20,0 -16,-14 Z', c) + El(0, 10, 9, 10, clair(c, 0.35), 0) + Ci(-7, -8, 7, '#ffffff', 2) + Ci(7, -8, 7, '#ffffff', 2) + Ci(-7, -8, 3, K, 0) + Ci(7, -8, 3, K, 0) + Pa('M-3,-2 L3,-2 L0,4 Z', '#f6a23a', 1.4); });
S('grenouille', 'bete', '#4fbf6a', function(c){ return El(0, 6, 20, 15, c) + Ci(-10, -10, 7, c) + Ci(10, -10, 7, c) + Ci(-10, -10, 4, '#ffffff', 1.4) + Ci(10, -10, 4, '#ffffff', 1.4) + Ci(-10, -10, 2, K, 0) + Ci(10, -10, 2, K, 0) + Tr('M-9,6 C-4,11 4,11 9,6', K, 1.8) + Ci(-6, 2, 1.4, fonce(c, 0.3), 0) + Ci(6, 2, 1.4, fonce(c, 0.3), 0); });
S('araignee', 'bete', '#3a3352', function(c){ return Tr('M-6,-2 C-14,-12 -20,-10 -24,-4 M-6,2 C-16,-2 -22,4 -24,10 M-5,6 C-12,8 -16,16 -16,22 M6,-2 C14,-12 20,-10 24,-4 M6,2 C16,-2 22,4 24,10 M5,6 C12,8 16,16 16,22 M-4,-6 C-8,-16 -14,-20 -18,-22 M4,-6 C8,-16 14,-20 18,-22', K, 2.4) + Ci(0, 6, 10, c) + Ci(0, -8, 6, c) + Ci(-2.4, -9, 1.6, '#ffffff', 0) + Ci(2.4, -9, 1.6, '#ffffff', 0) + Pa('M-3,2 L3,2 L0,8 Z', '#e5484d', 0); });
S('escargot', 'bete', '#f08a3c', function(c){ return Pa('M-24,16 C-24,10 -20,8 -16,8 L-16,-2 C-16,-6 -11,-6 -11,-2 L-11,10 L16,10 C22,12 24,16 24,16 Z', '#e0cfa8', 2) + Tr('M-15,-3 L-18,-12 M-12,-3 L-11,-12', K, 1.6) + Ci(-18, -12, 2, K, 0) + Ci(-11, -12, 2, K, 0) + Ci(4, -2, 14, c) + Tr('M4,-2 C4,-6 9,-6 9,-2 C9,4 0,4 -1,-2 C-2,-10 10,-13 13,-5', fonce(c, 0.45), 2); });
S('papillon', 'bete', '#3f7fe0', function(c){ return Pa('M0,-2 C-8,-18 -26,-20 -22,-4 C-20,4 -8,2 0,0 Z', c) + Pa('M0,-2 C8,-18 26,-20 22,-4 C20,4 8,2 0,0 Z', c) + Pa('M0,2 C-8,6 -18,12 -12,20 C-6,22 -2,12 0,4 Z', clair(c, 0.35)) + Pa('M0,2 C8,6 18,12 12,20 C6,22 2,12 0,4 Z', clair(c, 0.35)) + El(0, 2, 3, 12, '#3a3352', 1.6) + Tr('M-1,-9 C-3,-16 -7,-19 -9,-20 M1,-9 C3,-16 7,-19 9,-20', K, 1.4) + Ci(-13, -9, 3, '#ffffff', 1.2) + Ci(13, -9, 3, '#ffffff', 1.2); });
S('serpent', 'bete', '#4fbf6a', function(c){ var d = 'M-20,18 C-4,22 8,14 0,6 C-8,-2 -8,-12 4,-16 C10,-18 14,-14 16,-12'; return Tr(d, K, 11) + Tr(d, c, 7) + Tr(d, clair(c, 0.4), 2, 0.6) + El(18, -12, 7, 5, c, 2, ' transform="rotate(-20 18 -12)"') + Ci(19, -14, 1.4, K, 0) + Tr('M24,-14 L29,-16 M24,-14 L29,-12', '#e5484d', 1.4); });
S('poisson', 'bete', '#3fd0c8', function(c){ return Pa('M14,0 L26,-12 L24,0 L26,12 Z', fonce(c, 0.15)) + Pa('M-24,0 C-16,-14 4,-16 16,0 C4,16 -16,14 -24,0 Z', c) + Ci(-14, -3, 2.4, '#ffffff', 1.2) + Ci(-14, -3, 1, K, 0) + Tr('M-4,-9 C0,-4 0,4 -4,9', fonce(c, 0.35), 1.6) + Pa('M-2,-12 C2,-20 8,-18 10,-8 Z', fonce(c, 0.15), 1.6); });
S('chauvesouris', 'bete', '#6b3f8a', function(c){ return Pa('M0,-6 C-6,-10 -14,-14 -26,-8 C-22,-4 -22,2 -20,6 C-16,2 -12,4 -10,8 C-6,4 -2,6 0,10 C2,6 6,4 10,8 C12,4 16,2 20,6 C22,2 22,-4 26,-8 C14,-14 6,-10 0,-6 Z', c) + Pa('M-5,-6 L-6,-14 L-2,-9 L2,-9 L6,-14 L5,-6 C5,0 -5,0 -5,-6 Z', c, 2) + Ci(-2.2, -5, 1.2, '#ffd36a', 0) + Ci(2.2, -5, 1.2, '#ffd36a', 0); });
S('cle', 'objet', '#f6d23a', function(c){ return '<g transform="rotate(-35)">' + Tr('M-4,0 L24,0 M18,0 V8 M12,0 V6', K, 7.5) + Tr('M-4,0 L24,0 M18,0 V8 M12,0 V6', c, 4) + Ci(-12, 0, 10, c, 2.4) + Ci(-12, 0, 4, '#2b2540', 2) + '</g>'; });
S('oeil', 'objet', '#3f7fe0', function(c){ return Pa('M-24,0 C-12,-16 12,-16 24,0 C12,16 -12,16 -24,0 Z', '#ffffff') + Ci(0, 0, 9, c, 2) + Ci(0, 0, 4, K, 0) + Ci(-3, -3, 2, '#ffffff', 0) + Tr('M-16,-12 l-3,-5 M0,-15 v-6 M16,-12 l3,-5', K, 2); });
S('bougie', 'objet', '#ef7fa8', function(c){ return Pa('M0,-24 C6,-16 6,-12 0,-8 C-6,-12 -6,-16 0,-24 Z', '#ffd36a', 1.6, ' stroke="#e8693c"') + Re(-7, -6, 14, 24, 3, c) + Pa('M-7,-6 C-7,0 -3,0 -3,4 L-3,-6 Z', clair(c, 0.45), 1.2) + El(0, 20, 15, 4, '#d6a24a'); });
S('livre', 'objet', '#e5484d', function(c){ return Re(-17, -21, 34, 42, 3, c) + Re(-14, -21, 4, 42, 1, fonce(c, 0.3), 1.6) + Re(-4, -10, 16, 16, 3, '#f6d23a', 1.8) + Ci(4, -2, 3.4, '#8ff3ff', 1.4) + Tr('M15,-18 V18', '#f3e7cb', 2, 0.7); });
S('plume', 'objet', '#3fd0c8', function(c){ return Pa('M-16,22 C-12,6 0,-14 18,-24 C16,-6 4,12 -12,18 Z', c) + Tr('M-16,22 L16,-20', K, 1.6) + Tr('M-4,6 L-10,2 M2,-2 L-4,-6 M8,-10 L2,-14 M-6,10 L0,14 M0,2 L6,6 M6,-6 L12,-2', fonce(c, 0.35), 1.4); });
S('cloche', 'objet', '#f6d23a', function(c){ return Pa('M-16,12 C-14,10 -12,6 -12,-4 C-12,-14 -6,-18 0,-18 C6,-18 12,-14 12,-4 C12,6 14,10 16,12 Z', c) + Re(-18, 11, 36, 5, 2, fonce(c, 0.15), 2) + Ci(0, 19, 4, fonce(c, 0.2), 2) + Ci(0, -21, 3, 'none', 2) + Br('M-7,-8 C-7,-2 -7,4 -8,8', 2, 0.6); });
S('couronne', 'objet', '#f6d23a', function(c){ return Pa('M-20,14 L-22,-12 L-11,-2 L0,-18 L11,-2 L22,-12 L20,14 Z', c) + Re(-20, 10, 40, 7, 2, fonce(c, 0.15), 2) + Ci(-22, -14, 3, '#e5484d', 1.4) + Ci(0, -20, 3, '#3f7fe0', 1.4) + Ci(22, -14, 3, '#4fbf6a', 1.4) + Ci(0, 4, 3.4, '#e5484d', 1.4); });
S('anneau', 'pierre', '#f6d23a', function(c){ return Ci(0, 6, 15, 'none', 9) + Ci(0, 6, 15, 'none', 0, ' stroke="' + c + '" stroke-width="5"') + Pa('M-8,-10 L0,-22 L8,-10 L0,-4 Z', '#e5484d', 2) + Tr('M-8,-10 H8', K, 1.2, 0.6); });
S('coeur', 'objet', '#e5484d', function(c){ return Pa('M0,20 C-14,10 -22,2 -22,-8 C-22,-16 -16,-21 -10,-21 C-5,-21 -2,-18 0,-14 C2,-18 5,-21 10,-21 C16,-21 22,-16 22,-8 C22,2 14,10 0,20 Z', c) + Br('M-14,-12 C-14,-15 -12,-17 -9,-17', 2.4, 0.6); });
S('lanterne', 'objet', '#f08a3c', function(c){ return Ci(0, -21, 3.4, 'none', 2) + Pa('M-10,-16 L10,-16 L13,-12 L-13,-12 Z', '#3a3352') + Re(-11, -12, 22, 26, 3, c) + Tr('M-4,-12 V14 M4,-12 V14', '#3a3352', 2.2) + Pa('M-13,14 L13,14 L10,20 L-10,20 Z', '#3a3352') + Pa('M0,-6 C4,-2 4,3 0,6 C-4,3 -4,-2 0,-6 Z', '#fff7d0', 1.2); });
S('parchemin', 'objet', '#f3e7cb', function(c){ return Pa('M-16,-16 L16,-16 L16,16 L-16,16 Z', c) + El(-16, 0, 4, 17, clair(c, 0.2), 2) + El(16, 0, 4, 17, mel(c, '#c9a874', 0.4), 2) + Tr('M-9,-8 H9 M-9,-2 H9 M-9,4 H6 M-9,10 H3', '#8a6a4a', 1.6) + Ci(8, 10, 4, '#e5484d', 1.4); });
S('loupe', 'objet', '#3fd0c8', function(c){ return Tr('M8,8 L22,22', K, 8) + Tr('M8,8 L22,22', '#a8743f', 4.4) + Ci(-4, -4, 15, clair(c, 0.55), 2.6) + Ci(-4, -4, 15, 'none', 0, ' stroke="' + c + '" stroke-width="3"') + Br('M-12,-8 C-12,-12 -9,-14 -6,-15', 2.2, 0.8); });
S('chapeau', 'objet', '#6b3f8a', function(c){ return El(0, 16, 24, 6, fonce(c, 0.2)) + Pa('M-14,16 L-4,-12 C-2,-18 4,-24 14,-22 C8,-20 6,-14 6,-8 L14,16 Z', c) + Re(-13, 8, 26, 6, 2, '#f6d23a', 1.8) + etincelle(0, -2, 4, '#f6d23a'); });
S('balai', 'objet', '#a8743f', function(c){ return '<g transform="rotate(30)">' + Tr('M0,-26 V6', K, 6) + Tr('M0,-26 V6', c, 3) + Pa('M-4,4 L4,4 L12,24 L-12,24 Z', '#e8c25a') + Tr('M-6,12 L-8,24 M0,10 V24 M6,12 L8,24', '#b8862e', 1.4) + Re(-5, 2, 10, 5, 1.5, '#e5484d', 1.6) + '</g>'; });
S('boule', 'pierre', '#9d6ee3', function(c){ return Pa('M-14,22 L-10,12 L10,12 L14,22 Z', '#a8743f') + Ci(0, -4, 17, clair(c, 0.3)) + Ci(0, -4, 17, 'none', 0, ' fill="' + c + '" opacity=".35"') + etincelle(-4, -8, 6, '#ffffff') + Br('M-10,-12 C-10,-16 -7,-18 -4,-19', 2.2, 0.7); });
S('fer', 'objet', '#8a8aa0', function(c){ return Tr('M-14,18 L-16,4 C-18,-14 -8,-22 0,-22 C8,-22 18,-14 16,4 L14,18', K, 11) + Tr('M-14,18 L-16,4 C-18,-14 -8,-22 0,-22 C8,-22 18,-14 16,4 L14,18', c, 7) + Ci(-14, 2, 1.4, K, 0) + Ci(-10, -12, 1.4, K, 0) + Ci(14, 2, 1.4, K, 0) + Ci(10, -12, 1.4, K, 0); });
S('citrouille', 'plante', '#f08a3c', function(c){ return El(-9, 4, 11, 16, c) + El(9, 4, 11, 16, c) + El(0, 4, 9, 17, clair(c, 0.12)) + Re(-2.5, -18, 5, 8, 1.5, '#5e7a2a', 1.8) + Tr('M2,-16 C8,-22 12,-16 8,-14', '#4f9a5c', 1.6); });
S('oeuf', 'bete', '#f3e7cb', function(c){ return Pa('M0,-22 C10,-22 17,-4 17,6 C17,16 9,22 0,22 C-9,22 -17,16 -17,6 C-17,-4 -10,-22 0,-22 Z', c) + Ci(-5, -6, 3, '#4fbf6a', 1.2) + Ci(6, 4, 3.6, '#3f7fe0', 1.2) + Ci(-6, 12, 2.4, '#e5484d', 1.2) + Br('M-9,-6 C-10,-2 -10,2 -9,6', 1.8, 0.6); });
S('coquillage', 'bete', '#ef7fa8', function(c){ return Pa('M-22,4 C-22,-14 22,-14 22,4 L4,18 L-4,18 Z', c) + Tr('M0,18 L0,-10 M0,18 L-12,-8 M0,18 L12,-8 M0,18 L-19,-2 M0,18 L19,-2', fonce(c, 0.3), 1.6) + Re(-6, 16, 12, 6, 2, fonce(c, 0.15), 1.8); });
S('spirale', 'ciel', '#9d6ee3', function(c){ var d = 'M0,0 C0,-4 5,-4 5,0 C5,6 -6,7 -7,0 C-8,-9 6,-12 10,-4 C15,6 4,16 -6,14 C-16,12 -20,0 -16,-9 C-12,-18 0,-22 10,-18'; return Tr(d, K, 7.5) + Tr(d, c, 4); });
S('engrenage', 'objet', '#d6a24a', function(c){ return Pa(engrenagePath(8, 23, 17), c) + Ci(0, 0, 7, '#3a3352', 2) + Ci(0, 0, 11, 'none', 1.4); });
S('bourse', 'objet', '#a8743f', function(c){ return Pa('M-16,20 C-24,6 -16,-6 -6,-10 L-8,-16 L8,-16 L6,-10 C16,-6 24,6 16,20 Z', c) + Tr('M-8,-11 C-3,-8 3,-8 8,-11', '#f6d23a', 2.2) + Ci(10, 14, 6, '#f6d23a', 1.8) + Tr('M8,12 h4', '#b8862e', 1.2) + Br('M-12,4 C-13,9 -12,13 -10,16', 2, 0.4); });
var DISTINCTS = ['fiole', 'chaudron', 'sablier', 'feuille', 'champignon', 'fleur', 'baies', 'pomme', 'cristal', 'lune', 'etoile', 'soleil', 'eclair', 'flamme', 'goutte', 'flocon',
  'corbeau', 'chat', 'hibou', 'grenouille', 'araignee', 'escargot', 'papillon', 'poisson', 'cle', 'oeil', 'livre', 'plume', 'couronne', 'coeur', 'citrouille'];
var SYM_ID = {}; SYM.forEach(function(s, i){ SYM_ID[s.id] = i; });

/* Plan projectif d'ordre q (q premier) : q²+q+1 cartes de q+1 symboles, deux cartes ont toujours exactement un symbole commun. */
function planProjectif(q){
  var cartes = [], m, b, x, c;
  for(m = 0; m < q; m++) for(b = 0; b < q; b++){
    c = [];
    for(x = 0; x < q; x++) c.push(x * q + ((m * x + b) % q));
    c.push(q * q + m); cartes.push(c);
  }
  for(x = 0; x < q; x++){ c = []; for(var y = 0; y < q; y++) c.push(x * q + y); c.push(q * q + q); cartes.push(c); }
  c = []; for(m = 0; m < q; m++) c.push(q * q + m); c.push(q * q + q); cartes.push(c);
  return cartes;
}
function communs(a, b){ return a.filter(function(x){ return b.indexOf(x) >= 0; }); }
/* Paquet de cartes d'une partie : chaque point du plan reçoit un symbole. */
function paquet(q, ressemblance){
  var nb = q * q + q + 1, ids;
  if(nb === SYM.length) ids = SYM.map(function(s){ return s.id; });
  else if(ressemblance === 'distincts') ids = DISTINCTS.slice(0, nb);
  else ids = U.melanger(SYM.map(function(s){ return s.id; })).slice(0, nb);
  ids = U.melanger(ids);
  return U.melanger(planProjectif(q).map(function(c){ return U.melanger(c.map(function(pt){ return ids[pt]; })); }));
}
/* Place les symboles d'une carte (rayon 100) sans qu'ils se chevauchent. */
function disposerCarte(nb, varTaille, rot, zone){
  var base = (nb <= 6 ? 30 : 25) * Math.min(1.12, zone || 1), pts = [], a0 = Math.random() * Math.PI * 2, R = 94;
  pts.push({x:U.rand(-6, 6), y:U.rand(-6, 6)});
  for(var i = 1; i < nb; i++){ var a = a0 + i * 2 * Math.PI / (nb - 1) + U.rand(-0.15, 0.15); pts.push({x:Math.cos(a) * 60, y:Math.sin(a) * 60}); }
  pts.forEach(function(p){ p.r = base * U.rand(1 - varTaille, 1 + varTaille * 0.55); p.rot = rot >= 180 ? U.rand(0, 360) : U.rand(-rot, rot); });
  for(var essai = 0; essai < 6; essai++){
    for(var it = 0; it < 120; it++){
      for(var a1 = 0; a1 < nb; a1++){
        var p = pts[a1];
        for(var b1 = a1 + 1; b1 < nb; b1++){
          var o = pts[b1], dx = o.x - p.x, dy = o.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, mini = p.r + o.r + 3;
          if(d < mini){ var k = (mini - d) / 2 / d; p.x -= dx * k; p.y -= dy * k; o.x += dx * k; o.y += dy * k; }
        }
        var dc = Math.sqrt(p.x * p.x + p.y * p.y), lim = R - p.r;
        if(dc > lim){ p.x *= lim / dc; p.y *= lim / dc; }
      }
    }
    var ok = true;
    for(a1 = 0; a1 < nb && ok; a1++) for(b1 = a1 + 1; b1 < nb; b1++){ var q1 = pts[a1], q2 = pts[b1]; if(Math.hypot(q1.x - q2.x, q1.y - q2.y) < q1.r + q2.r - 1){ ok = false; break; } }
    if(ok) break;
    pts.forEach(function(p){ p.r *= 0.94; });
  }
  return pts;
}
function couleurSym(s, mode){ return mode === 'familles' ? FAMILLES[s.f] : s.c; }
function carteSVG(ids, pts, mode, cls){
  var s = '<g class="mjo-carte ' + (cls || '') + '">' + Ci(3, 6, 100, '#0a0612', 0, ' opacity=".35"') + Ci(0, 0, 100, cls === 'pile' ? '#fbf1d8' : '#f4f0ff', 4) +
    Ci(0, 0, 92, 'none', 0, ' stroke="' + (cls === 'pile' ? '#e0b860' : '#b8a0f0') + '" stroke-width="3"') + Ci(0, 0, 96.5, 'none', 0, ' stroke="#ffffff" stroke-width="1.6" opacity=".7"');
  ids.forEach(function(id, k){
    var sy = SYM[SYM_ID[id]], p = pts[k];
    s += '<g class="mjo-sym" data-k="' + k + '" data-id="' + id + '" transform="translate(' + f1(p.x) + ',' + f1(p.y) + ')"><circle class="mjo-sym-halo" r="' + f1(p.r + 4) + '"/>' +
      '<g transform="rotate(' + f1(p.rot) + ') scale(' + e2(p.r / 25) + ')">' + sy.art(couleurSym(sy, mode)) + '</g></g>';
  });
  return s + '</g>';
}
function reglagesDouble(n, mods){
  mods = mods || {};
  var p = {};
  p.q = n <= 4 ? 5 : 7;
  p.symboles = p.q + 1;
  p.manches = entier(n, {1:6, 3:8, 6:10, 10:12});
  p.duree = Math.round(courbe(n, {1:100, 3:95, 6:90, 10:75, 12:68}) / (mods.lent || 1) + (mods.temps || 0));
  p.penalite = Math.round(courbe(n, {1:2, 6:3, 10:4}) * 2) / 2;
  p.boucliers = Math.max(0, Math.round(mods.erreurs || 0));
  p.rotation = courbe(n, {1:20, 3:70, 5:180});
  p.tailles = courbe(n, {1:0.06, 3:0.16, 6:0.28, 10:0.4});
  p.ressemblance = n <= 3 ? 'distincts' : (n <= 6 ? 'meles' : 'familles');
  p.zone = mods.zone || 1;
  p.indices = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  p.lignes = [
    {nom:'Symboles sur chaque carte', val:String(p.symboles)},
    {nom:'Paires à trouver', val:p.manches + ' paires'},
    {nom:'Le sablier', val:txtDuree(p.duree)},
    {nom:'Une erreur', val:'tu perds ' + U.fmt(p.penalite, 1) + ' secondes'},
    {nom:'Les symboles', val:p.ressemblance === 'distincts' ? 'tous très différents' : (p.ressemblance === 'meles' ? 'certains se ressemblent' : 'mêmes couleurs par famille 🎨')},
    {nom:'Ils sont tournés', val:p.rotation < 40 ? 'un tout petit peu' : (p.rotation < 180 ? 'un peu' : 'dans tous les sens 🔄')},
    {nom:'Leurs tailles', val:p.tailles < 0.12 ? 'presque pareilles' : (p.tailles < 0.3 ? 'un peu variées' : 'très variées')}
  ];
  if(p.boucliers) p.lignes.push({nom:'Boucliers 🛡️', val:p.boucliers + ' erreur' + (p.boucliers > 1 ? 's' : '') + ' sans perdre de temps'});
  if(p.zone > 1) p.lignes.push({nom:'Symboles', val:'plus gros'});
  if(p.indices) p.lignes.push({nom:'Indices 💡', val:String(p.indices)});
  if(p.revele) p.lignes.push({nom:'Le bon symbole brille', val:'après 3 secondes ✨'});
  return p;
}

MJ.enregistrer('double', {
  nom:'Le double', role:'alchimiste', ic:'🃏',
  consigne:'Un seul symbole est sur les DEUX cartes. Trouve-le vite et touche-le !',
  minuteur:true,
  reglages: reglagesDouble,
  plan: planProjectif,
  symboles: SYM,
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#5a3a22" opacity=".6"/>');
    var A = ['lune', 'pomme', 'cle', 'flamme'], B = ['etoile', 'cle', 'feuille', 'goutte'];
    var pa = [{x:0, y:0, r:24, rot:0}, {x:-34, y:-30, r:20, rot:-20}, {x:36, y:28, r:22, rot:30}, {x:30, y:-34, r:18, rot:10}];
    var pb = [{x:-32, y:-30, r:20, rot:15}, {x:8, y:30, r:24, rot:-40}, {x:34, y:-26, r:20, rot:0}, {x:-34, y:30, r:18, rot:20}];
    d.contenu.innerHTML = '<g transform="translate(78,86) scale(.72)">' + carteSVG(A, pa, 'propres', 'pile') + '</g><g transform="translate(222,86) scale(.72)">' + carteSVG(B, pb, 'propres', 'joueur') + '</g>';
    var syms = d.contenu.querySelectorAll('.mjo-sym[data-id="cle"]');
    return scenario(d.svg, [
      [10, function(){ syms.forEach(function(s){ s.classList.remove('trouve'); }); d.vers(262, 160, 0); }],
      [500, function(){ d.vers(228, 112, 800); }],
      [900, function(){ d.tape(); syms.forEach(function(s){ s.classList.add('trouve'); }); U.son('ok'); }],
      [1300, function(){}]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var q = p.q || 5, mode = p.ressemblance === 'familles' ? 'familles' : 'propres';
    var cartes = paquet(q, p.ressemblance), idx = 2;
    var racine = U.html('<div class="mjo-jeu mjo-double"><div class="mjo-table" aria-hidden="true"><i class="mjo-bougie-t"></i></div></div>');
    el.appendChild(racine);
    var hud = creerHud(racine);
    var manches = Math.min(p.manches || 8, cartes.length - 1), trouvees = 0, erreurs = 0, restant = p.duree || 90, fini = false, verrou = true, tPaire = 0, indices = p.indices || 0;
    var boucliers = p.boucliers || 0, bouclMax = boucliers;
    if(bouclMax) hud.vies(boucliers, bouclMax, true);
    hud.prog(0, manches); hud.temps(1);
    var aire = U.html('<div class="mjo-db-aire"><svg class="mjo-db-svg" preserveAspectRatio="xMidYMid meet"><g class="mjo-db-cartes"></g><g class="mjo-db-fx"></g></svg></div>');
    racine.appendChild(aire);
    var bas = null;
    if(indices){ bas = U.html('<div class="mjo-bas"><button class="btn magie mjo-indice" type="button">💡 × ' + indices + '</button></div>'); racine.appendChild(bas); }
    var svg = aire.querySelector('svg'), calque = svg.querySelector('.mjo-db-cartes'), fx = svg.querySelector('.mjo-db-fx');
    var vertical = true, POS = {pile:{x:0, y:-108}, joueur:{x:0, y:108}};
    function disposer(){
      var r = aire.getBoundingClientRect(); if(!r.width || !r.height) return;
      vertical = r.height >= r.width * 0.9;
      POS = vertical ? {pile:{x:0, y:-108}, joueur:{x:0, y:108}} : {pile:{x:-112, y:0}, joueur:{x:112, y:0}};
      svg.setAttribute('viewBox', vertical ? '-112 -222 224 444' : '-226 -106 452 212');
      [A, B].forEach(function(c){ if(c) c.g.setAttribute('transform', 'translate(' + POS[c.role].x + ',' + POS[c.role].y + ')'); });
    }
    var A = null, B = null;
    function creer(ids, role){
      var pts = disposerCarte(ids.length, p.tailles || 0.1, p.rotation || 30, p.zone || 1);
      var g = svgNoeud('g', {transform:'translate(' + POS[role].x + ',' + POS[role].y + ')'}, calque);
      g.innerHTML = carteSVG(ids, pts, mode, role);
      return {ids:ids, pts:pts, g:g, role:role, inner:g.firstChild};
    }
    disposer();
    A = creer(cartes[0], 'pile'); B = creer(cartes[1], 'joueur');
    relancer(B.inner, 'arrive');
    P.apres(380, function(){ verrou = false; });
    P.observe(aire, disposer);
    function commun(){ return communs(A.ids, B.ids)[0]; }
    function symboleSous(pt){
      var best = null, bd = 1e9;
      [A, B].forEach(function(c){
        var lx = pt.x - POS[c.role].x, ly = pt.y - POS[c.role].y;
        if(lx * lx + ly * ly > 104 * 104) return;
        c.pts.forEach(function(q2, k){ var d = Math.hypot(lx - q2.x, ly - q2.y); if(d <= q2.r * (p.zone || 1) + 6 && d - q2.r < bd){ bd = d - q2.r; best = {carte:c, k:k, id:c.ids[k]}; } });
      });
      return best;
    }
    function nSym(c, id){ return c.g.querySelector('.mjo-sym[data-id="' + id + '"]'); }
    function briller(cls, on){ var id = commun(); [A, B].forEach(function(c){ var s = nSym(c, id); if(s) s.classList.toggle(cls, on !== false); }); }
    function suivante(){
      verrou = true;
      var id = commun();
      briller('trouve');
      var sa = nSym(A, id), sb = nSym(B, id);
      if(sa && sb){
        var ka = A.pts[A.ids.indexOf(id)], kb = B.pts[B.ids.indexOf(id)];
        var l = svgNoeud('path', {'class':'mjo-lien', d:'M' + f1(POS.pile.x + ka.x) + ',' + f1(POS.pile.y + ka.y) + ' L' + f1(POS.joueur.x + kb.x) + ',' + f1(POS.joueur.y + kb.y), pathLength:'100'}, fx);
        P.apres(700, function(){ retirer(l); });
      }
      if(trouvees >= manches){
        fini = true;
        annonce(racine, 'Bravo !', 1300);
        P.finir({reussi:true, score:1, erreurs:erreurs, detail:manches + ' paires trouvées' + (erreurs ? ' (' + erreurs + ' erreur' + (erreurs > 1 ? 's' : '') + ').' : ', sans une erreur !')}, 1100);
        return;
      }
      P.apres(520, function(){
        var vieux = A;
        B.inner.style.transition = 'transform .38s cubic-bezier(.4,.1,.3,1)';
        B.inner.style.transform = 'translate(' + (POS.pile.x - POS.joueur.x) + 'px,' + (POS.pile.y - POS.joueur.y) + 'px)';
        vieux.inner.classList.add('part');
        P.apres(400, function(){
          retirer(vieux.g);
          A = B; A.role = 'pile'; A.inner.style.transition = 'none'; A.inner.style.transform = '';
          A.g.setAttribute('transform', 'translate(' + POS.pile.x + ',' + POS.pile.y + ')');
          A.inner.classList.remove('joueur'); A.inner.classList.add('pile');
          var fond = A.inner.querySelectorAll('circle'); if(fond[1]) fond[1].setAttribute('fill', '#fbf1d8'); if(fond[2]) fond[2].setAttribute('stroke', '#e0b860');
          A.g.querySelectorAll('.mjo-sym').forEach(function(s){ s.classList.remove('trouve', 'revele', 'indice'); });
          B = creer(cartes[idx++], 'joueur');
          relancer(B.inner, 'arrive');
          tPaire = 0;
          P.apres(330, function(){ verrou = false; });
        });
      });
    }
    function toucher(pt){
      if(fini || verrou) return;
      var s = symboleSous(pt);
      if(!s) return;
      if(s.id === commun()){
        trouvees++; P.sons.ding(); U.vibrer(15);
        hud.prog(trouvees, manches);
        suivante();
        return;
      }
      erreurs++;
      verrou = true;
      var n2 = nSym(s.carte, s.id); if(n2) relancer(n2, 'faux');
      relancer(s.carte.inner, 'tremble');
      U.son('ko'); U.vibrer(40);
      var q2 = s.carte.pts[s.k], e = versEcran(svg, POS[s.carte.role].x + q2.x, POS[s.carte.role].y + q2.y), r = racine.getBoundingClientRect();
      if(boucliers > 0){ boucliers--; hud.perdVie(boucliers, bouclMax, true); flotter(racine, (e.x - r.left) / r.width * 100, (e.y - r.top) / r.height * 100, '🛡️', 'ok'); }
      else { restant -= p.penalite || 3; hud.moins(); flotter(racine, (e.x - r.left) / r.width * 100, (e.y - r.top) / r.height * 100, '−' + U.fmt(p.penalite || 3, 1) + ' s', 'ko'); }
      P.apres(600, function(){ if(!fini) verrou = false; });
    }
    P.ecoute(svg, 'pointerdown', function(e){ if(fini) return; e.preventDefault(); toucher(ptSVG(svg, e)); });
    var bi = bas && bas.querySelector('.mjo-indice');
    if(bi) P.ecoute(bi, 'click', function(){ if(fini || verrou || indices <= 0) return; indices--; bi.textContent = '💡 × ' + indices; if(!indices) bi.disabled = true; P.sons.pop(); briller('indice'); });
    racine.mjoEtat = function(){
      var id = commun();
      function pos(c){ return c.ids.map(function(x, k){ var q2 = c.pts[k], e = versEcran(svg, POS[c.role].x + q2.x, POS[c.role].y + q2.y); return {id:x, x:e.x, y:e.y}; }); }
      return {jeu:'double', q:q, pile:A.ids.slice(), carte:B.ids.slice(), commun:id, nbCommuns:communs(A.ids, B.ids).length, verrou:verrou, trouvees:trouvees, manches:manches, restant:restant, erreurs:erreurs, posPile:pos(A), posCarte:pos(B)};
    };
    P.boucle(function(dt){
      if(fini) return false;
      if(!verrou){ restant -= dt; tPaire += dt; if(p.revele && tPaire > 3) briller('revele'); }
      hud.temps(restant / (p.duree || 90));
      if(restant <= 0){
        fini = true; briller('revele');
        P.finir({reussi:false, score:trouvees / manches, erreurs:erreurs, detail:'Le sablier est vide… ' + trouvees + ' paire' + (trouvees > 1 ? 's' : '') + ' sur ' + manches + '.'}, 1500);
        return false;
      }
    });
    return {arreter: P.arreter};
  }
});
