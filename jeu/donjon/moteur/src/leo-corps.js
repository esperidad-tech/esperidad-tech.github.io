/* leo-corps.js — LE NOUVEAU LÉO, torse nu (le boss final, phase 2). Bible §13.40.
   Romain, 14 novembre au soir : « Léo est hyper mal fait […] au niveau des jambes, tu m'as fait deux traits […] les rats sont
   beaucoup mieux faits que lui. Je veux qu'il en impose […] qu'on voie qu'il s'est entraîné depuis des années, qu'il est
   extrêmement musclé. » Ce fichier ne fait que DESSINER et ARTICULER Léo ; il ne décide de rien (leo-regles.js) et ne joue
   aucun son. C'est leo.js qui lui dit, à chaque image, quelle pose prendre (calée sur l'horloge des règles).

   UN VRAI PANTIN, PAS UN SVG REPEINT À CHAQUE IMAGE (jeu/donjon/RAPIDITE.md, R1 et R2).
   · Léo est découpé en PIÈCES (cuisses, tibias, bottes, bassin, buste, tête, bras, avant-bras, poings, la faux, la gourde…),
     chacune dessinée une fois en SVG, à plat, dans son repos (bras pendants, jambes droites), puis « cuite » en petite image PNG
     (LeoCorps.preparer(), pendant l'écran de passage). Chaque pièce est un <div> qu'on ne fait que DÉPLACER et TOURNER
     (transform) : la carte graphique compose, rien n'est repeint. Sans cuisson (vieux navigateur), la pièce garde son SVG.
   · Le squelette : les os (bassin, buste, tête, bras, avant-bras, mains, cuisses, tibias, pieds) ; leurs matrices sont calculées
     à chaque image (une vingtaine de multiplications) — les jambes et, si on veut, les mains, par « cinématique inverse » :
     on dit où poser le pied (ou la main), le genou (ou le coude) se plie tout seul. C'est ce qui garde les pieds plantés au sol
     quand il s'accroupit.
   · Les visages : une image par expression, posée sur la tête ; on n'en montre qu'une.
   · Habillé (la cinématique du début de la phase 2 : il arrache sa cape et sa tunique) : la capuche, la tunique, les manches
     sont des pièces de plus ; la cape est un petit îlot SVG (son tracé suit le buste).

     var C = LeoCorps.creer(parent)                    parent : un <div> de 300 × 340 (les pieds en 150, 330)
     C.poser(pose)                                      la pose de cette image (voir POSE plus bas) ; C.p : la dernière posée
     C.vers(pose, ms, courbe) -> Promise ; C.avancer(dt) (pour les cinématiques : une pose qui glisse vers une autre)
     C.visage('colere'|'cri'|'effort'|'rictus'|'souffle'|'boit'|'aah'|'ko'|'douleur')
     C.objet('faux', 'dos'|'main'|null) ; C.objet('gourde', 'ceinture'|'main'|null) ; C.objet('sifflet', 'cou'|'main') ;
     C.objet('rat', 'main'|null) ; C.habits({capuche, tunique, cape}) ; C.point(os, x, y) ; C.ancre(nom)
     LeoCorps.preparer() -> Promise (la cuisson ; une seule fois pour toutes les copies)
     LeoCorps.DESSINS (pour l'Atelier, les essais) ; LeoCorps.POSES ; LeoCorps.SQ (le squelette) */
(function(){
'use strict';
var O = '#1a0e08';
var W = 300, H = 340, PIED = 330;

/* ============================================================================ LE SQUELETTE (au repos, mesures du dessin) */
var SQ = {
  HC:[150, 198],                         /* le bassin et le buste tournent autour des hanches */
  HAr:[137, 206], HAv:[165, 208],        /* les hanches des deux jambes (Ar : celle de derrière, côté gauche de l'image) */
  CUISSE:66, TIBIA:56, SEMELLE:12,
  COU:[146, 102],
  EAr:[103, 127], EAv:[197, 129],        /* les épaules */
  BRAS:52, AVANT:50
};
SQ.GAr = [SQ.HAr[0], SQ.HAr[1] + SQ.CUISSE]; SQ.CAr = [SQ.HAr[0], SQ.GAr[1] + SQ.TIBIA];
SQ.GAv = [SQ.HAv[0], SQ.HAv[1] + SQ.CUISSE]; SQ.CAv = [SQ.HAv[0], SQ.GAv[1] + SQ.TIBIA];
SQ.KAr = [SQ.EAr[0], SQ.EAr[1] + SQ.BRAS]; SQ.PAr = [SQ.EAr[0], SQ.KAr[1] + SQ.AVANT];
SQ.KAv = [SQ.EAv[0], SQ.EAv[1] + SQ.BRAS]; SQ.PAv = [SQ.EAv[0], SQ.KAv[1] + SQ.AVANT];

/* ============================================================================ LES COULEURS */
var C = {
  peau:['#ffdcb6', '#f0ae7d', '#c97c4e', '#93512f'], rim:'#fff3df', veine:'#c98a66',
  peauS:['#e8b98f', '#cf8d5f', '#a6603a', '#743c22'],          /* le bras et la jambe de derrière, dans l'ombre */
  pant:['#6f5f50', '#4a3d33', '#2f2620'], pantS:['#5a4c40', '#3a2f27', '#241d18'],
  cuir:['#8a5a34', '#5c3a20', '#33200f'], cuirS:['#74492a', '#4a2e18', '#28180a'],
  ceint:['#4a3020', '#2a1a10'], or:['#fff0b0', '#e0b050', '#9a6a1e'],
  bande:['#fbf2dc', '#e2d2ae', '#b8a47c'],
  cheveux:['#fff0b0', '#f0c060', '#c48a30', '#8a5a1a'],
  acier:['#ffffff', '#dfe5ee', '#9aa4b4', '#5c6574'], bois:['#c08a4e', '#8a5a2e', '#55341a'],
  vert:['#eaffc0', '#9cff5c', '#3fd13a', '#1f8a2a'], verre:'#d8fff0',
  toile:['#d7b98a', '#a8865a', '#6e5232'],
  tunique:['#4a4060', '#2e2740', '#1a1526'], cape:['#2a2438', '#151120', '#0a080f'],
  rat:['#b9b2a8', '#8a8076', '#5c544c'], ratRose:'#e6a0a0'
};

/* ============================================================================ LES DÉGRADÉS (dans chaque pièce, mêmes noms) */
function lin(id, l, x1, y1, x2, y2){
  return '<linearGradient id="' + id + '" x1="' + (x1 == null ? .9 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? .1 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' +
    l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</linearGradient>';
}
function rad(id, l, cx, cy, r){
  return '<radialGradient id="' + id + '" cx="' + (cx == null ? .62 : cx) + '" cy="' + (cy == null ? .35 : cy) + '" r="' + (r == null ? .75 : r) + '">' +
    l.map(function(c, k){ return '<stop offset="' + (k / (l.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'; }).join('') + '</radialGradient>';
}
var DEFS = '<defs>' +
  lin('l2p', [C.peau[0], C.peau[1], C.peau[2]]) + lin('l2pS', [C.peauS[0], C.peauS[1], C.peauS[2]]) +
  rad('l2pr', [C.peau[0], C.peau[1], C.peau[2]], .7, .3, .8) + rad('l2prS', [C.peauS[0], C.peauS[1], C.peauS[2]], .7, .3, .8) +
  lin('l2t', C.pant) + lin('l2tS', C.pantS) + lin('l2c', C.cuir) + lin('l2cS', C.cuirS) + lin('l2ce', C.ceint, .5, 0, .5, 1) +
  lin('l2o', C.or) + lin('l2b', C.bande, .8, 0, .2, 1) + lin('l2h', C.cheveux, .8, 0, .3, 1) +
  lin('l2a', C.acier, .3, 0, .6, 1) + lin('l2bo', C.bois, 0, .5, 1, .5) + rad('l2v', C.vert, .4, .35, .8) +
  lin('l2to', C.toile) + lin('l2tu', C.tunique) + lin('l2tuS', [C.tunique[1], C.tunique[2], '#100c18']) + lin('l2ca', C.cape) +
  rad('l2ra', C.rat, .6, .3, .9) +
  '</defs>';

/* ============================================================================ LES PETITS OUTILS DE DESSIN */
function f(d, fill, w, plus){ return '<path d="' + d + '" fill="' + fill + '" stroke="' + O + '" stroke-width="' + (w == null ? 3 : w) + '" stroke-linejoin="round" stroke-linecap="round"' + (plus || '') + '/>'; }
function nu(d, fill, op){ return '<path d="' + d + '" fill="' + fill + '"' + (op != null ? ' opacity="' + op + '"' : '') + '/>'; }
function ligne(d, coul, w, op, plus){ return '<path d="' + d + '" fill="none" stroke="' + coul + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null ? ' opacity="' + op + '"' : '') + (plus || '') + '/>'; }
function ov(cx, cy, rx, ry, fill, op, rot){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (op != null ? ' opacity="' + op + '"' : '') + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '/>'; }
function rond(cx, cy, r, fill, w){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (w === 0 ? '' : ' stroke="' + O + '" stroke-width="' + (w || 2.4) + '"') + '/>'; }
/* un tracé décalé de (dx, dy) : pour dessiner le bras de derrière avec le même tracé que celui de devant */
function dec(d, dx, dy){ var k = 0; return d.replace(/-?\d+(\.\d+)?/g, function(n){ var v = +n + (k++ % 2 ? dy : dx); return String(Math.round(v * 10) / 10); }); }

/* ============================================================================ LES PIÈCES
   Chaque pièce : {os, boite:[x, y, w, h] (dans les mesures du dessin), svg:'…'}. Elles sont dessinées au repos. */
var P = {};

/* ---------- les jambes : le pantalon de meunier (toile foncée, farine), les bottes ---------- */
function cuisse(x, S){
  var g = S ? 'url(#l2tS)' : 'url(#l2t)', ombre = S ? C.pantS[2] : C.pant[2], clair = S ? C.pantS[0] : C.pant[0], s = '';
  s += f('M' + (x - 24) + ' 192 C' + (x - 28) + ' 226 ' + (x - 23) + ' 252 ' + (x - 18) + ' 277 L' + (x + 18) + ' 277 C' + (x + 22) + ' 252 ' + (x + 26) + ' 224 ' + (x + 24) + ' 192 Z', g);
  /* les plis (le pantalon est large), une couture, la farine */
  s += ligne('M' + (x - 14) + ' 224 Q' + (x - 2) + ' 232 ' + (x + 12) + ' 226 M' + (x - 15) + ' 246 Q' + (x - 4) + ' 254 ' + (x + 14) + ' 246 M' + (x - 10) + ' 262 Q' + (x + 2) + ' 266 ' + (x + 12) + ' 260', ombre, 2.4, .9);
  s += ligne('M' + (x + 10) + ' 204 C' + (x + 14) + ' 230 ' + (x + 12) + ' 256 ' + (x + 10) + ' 274', ombre, 1.6, .6, ' stroke-dasharray="3 4"');
  s += ligne('M' + (x + 16) + ' 206 C' + (x + 19) + ' 230 ' + (x + 17) + ' 254 ' + (x + 14) + ' 272', clair, 2.6, .55);
  s += ov(x - 6, 236, 7, 4, '#f4ecdc', .28, -20) + ov(x + 6, 258, 5, 3, '#f4ecdc', .22, 10);
  if(!S) s += f('M' + (x - 12) + ' 254 L' + (x + 4) + ' 252 L' + (x + 6) + ' 268 L' + (x - 10) + ' 270 Z', '#7d6a54', 1.8) + ligne('M' + (x - 10) + ' 256 l12 -1 M' + (x - 9) + ' 266 l13 -1', '#3a2c20', 1.2, .8, ' stroke-dasharray="2 2"');
  return s;
}
function tibia(x, S){
  var g = S ? 'url(#l2tS)' : 'url(#l2t)', gc = S ? 'url(#l2cS)' : 'url(#l2c)', cu = S ? C.cuirS : C.cuir, s = '', y0 = SQ.GAr[1];
  /* le bas du pantalon, bouffant, rentré dans la botte */
  s += f('M' + (x - 17) + ' ' + (y0 - 6) + ' C' + (x - 22) + ' ' + (y0 + 10) + ' ' + (x - 20) + ' ' + (y0 + 20) + ' ' + (x - 15) + ' ' + (y0 + 26) + ' L' + (x + 15) + ' ' + (y0 + 26) + ' C' + (x + 20) + ' ' + (y0 + 18) + ' ' + (x + 20) + ' ' + (y0 + 6) + ' ' + (x + 17) + ' ' + (y0 - 6) + ' Z', g);
  s += ligne('M' + (x - 12) + ' ' + (y0 + 8) + ' Q' + x + ' ' + (y0 + 14) + ' ' + (x + 12) + ' ' + (y0 + 6), S ? C.pantS[2] : C.pant[2], 2.2, .8);
  /* la tige de la botte */
  s += f('M' + (x - 15) + ' ' + (y0 + 22) + ' C' + (x - 16) + ' ' + (y0 + 36) + ' ' + (x - 14) + ' ' + (y0 + 48) + ' ' + (x - 13) + ' ' + (y0 + 60) + ' L' + (x + 12) + ' ' + (y0 + 60) + ' C' + (x + 13) + ' ' + (y0 + 46) + ' ' + (x + 15) + ' ' + (y0 + 34) + ' ' + (x + 15) + ' ' + (y0 + 22) + ' Z', gc);
  /* le revers de la botte, les lacets croisés devant (côté gauche : il regarde à gauche), un reflet */
  s += f('M' + (x - 17) + ' ' + (y0 + 20) + ' L' + (x + 17) + ' ' + (y0 + 20) + ' L' + (x + 16) + ' ' + (y0 + 30) + ' L' + (x - 16) + ' ' + (y0 + 30) + ' Z', cu[0], 2.4);
  s += ligne('M' + (x - 13) + ' ' + (y0 + 34) + ' l8 5 m-8 0 l8 -5 M' + (x - 13) + ' ' + (y0 + 43) + ' l8 5 m-8 0 l8 -5 M' + (x - 12) + ' ' + (y0 + 52) + ' l8 5 m-8 0 l8 -5', '#e8d8b8', 1.6, .85);
  s += ligne('M' + (x + 9) + ' ' + (y0 + 34) + ' C' + (x + 10) + ' ' + (y0 + 42) + ' ' + (x + 9) + ' ' + (y0 + 50) + ' ' + (x + 8) + ' ' + (y0 + 57), '#d8a878', 2.4, .5);
  return s;
}
function pied(x, S){
  var gc = S ? 'url(#l2cS)' : 'url(#l2c)', cu = S ? C.cuirS : C.cuir, a = SQ.CAr[1], s = '';
  /* la botte : le bout arrondi vers la gauche, une grosse semelle */
  s += f('M' + (x - 12) + ' ' + (a - 6) + ' C' + (x - 22) + ' ' + (a - 4) + ' ' + (x - 34) + ' ' + (a) + ' ' + (x - 36) + ' ' + (a + 6) + ' L' + (x - 35) + ' ' + (a + 10) + ' L' + (x + 15) + ' ' + (a + 10) + ' L' + (x + 14) + ' ' + (a - 6) + ' Z', gc);
  s += f('M' + (x - 37) + ' ' + (a + 7) + ' L' + (x + 16) + ' ' + (a + 7) + ' L' + (x + 16) + ' ' + (a + 12) + ' L' + (x - 35) + ' ' + (a + 12) + ' Q' + (x - 39) + ' ' + (a + 10) + ' ' + (x - 37) + ' ' + (a + 7) + ' Z', '#1e130a', 2.2);
  s += ligne('M' + (x - 30) + ' ' + (a + 1) + ' C' + (x - 24) + ' ' + (a - 3) + ' ' + (x - 16) + ' ' + (a - 4) + ' ' + (x - 10) + ' ' + (a - 3), cu[0], 2.4, .7);
  s += ligne('M' + (x + 8) + ' ' + (a + 9) + ' v3', '#5a3a20', 1.4, .8);
  return s;
}
/* (les deux jambes ont le même dessin ; celle de devant est un peu plus bas : ses hanches sont 2 plus bas) */
var dJ = SQ.HAv[1] - SQ.HAr[1];
function bas2(svg){ return '<g transform="translate(0,' + dJ + ')">' + svg + '</g>'; }
P.cuisseAr = {os:'cuisseAr', boite:[106, 186, 62, 96], svg:cuisse(SQ.HAr[0], true)};
P.tibiaAr = {os:'tibiaAr', boite:[112, 262, 50, 74], svg:tibia(SQ.HAr[0], true)};
P.piedAr = {os:'piedAr', boite:[94, 316, 64, 30], svg:pied(SQ.HAr[0], true)};
P.cuisseAv = {os:'cuisseAv', boite:[134, 186 + dJ, 62, 96], svg:bas2(cuisse(SQ.HAv[0], false))};
P.tibiaAv = {os:'tibiaAv', boite:[140, 262 + dJ, 50, 74], svg:bas2(tibia(SQ.HAv[0], false))};
P.piedAv = {os:'piedAv', boite:[122, 316 + dJ, 64, 30], svg:bas2(pied(SQ.HAv[0], false))};

/* ---------- le bassin : le haut du pantalon, la grosse ceinture de cuir et sa boucle de laiton, une corde nouée ---------- */
P.bassin = {os:'bassin', boite:[106, 184, 92, 58], svg:(function(){
  var s = '';
  s += f('M116 194 L186 194 C190 208 192 222 188 234 L156 238 L151 228 L146 238 L113 234 C109 222 111 208 116 194 Z', 'url(#l2t)');
  s += ligne('M151 214 L151 228 M122 222 Q132 228 140 224 M160 224 Q170 230 182 222', C.pant[2], 2.2, .9);
  s += ov(170, 228, 8, 4, '#f4ecdc', .25, 15);
  /* la ceinture */
  s += f('M112 190 C136 195 164 195 189 190 L190 205 C164 210 136 210 111 205 Z', 'url(#l2ce)');
  s += ligne('M115 193 C138 198 162 198 186 193 M115 202 C138 207 162 207 186 202', '#6a4a30', 1.2, .9, ' stroke-dasharray="3 3"');
  [170, 178].forEach(function(x){ s += ov(x, 197.5, 1.8, 1.4, '#120a06'); });
  /* la boucle */
  s += f('M137 190 L157 190 L157 207 L137 207 Z', 'url(#l2o)', 2.4) + f('M142 194 L152 194 L152 203 L142 203 Z', '#2a1a10', 1.6) + ligne('M139 198.5 L152 198.5', '#fff6d0', 2.2);
  s += ligne('M139 191.5 L155 191.5', '#fffbe8', 1.4, .8);
  /* la corde nouée qui pend */
  s += ligne('M118 205 C116 214 120 222 116 232 M118 205 C122 212 124 220 126 228', '#c8a868', 3.2) + ligne('M118 205 C116 214 120 222 116 232 M118 205 C122 212 124 220 126 228', '#7a5a30', 1.2, .8, ' stroke-dasharray="2 2"');
  s += rond(118, 205, 3.6, '#d8b878', 1.6);
  return s;
})()};

/* ---------- le sac à rats, à sa ceinture, derrière (il gigote : un rat dedans) ---------- */
P.sac = {os:'sac', boite:[178, 192, 50, 72], svg:(function(){
  var s = '';
  s += ligne('M196 196 L198 208', '#5a3a20', 4);
  s += f('M190 206 C184 210 182 222 184 236 C186 252 196 260 206 258 C218 256 224 244 222 230 C220 216 214 208 206 206 Z', 'url(#l2to)');
  s += f('M188 206 C194 202 204 202 210 206 L207 212 C200 210 194 210 190 212 Z', C.toile[1], 2);
  s += ligne('M192 222 Q200 226 214 220 M190 238 Q202 244 216 236', C.toile[2], 1.8, .8) + ligne('M206 214 l2 4 m1 6 l2 4 m1 6 l1 4', '#4a3420', 1.2, .8);
  /* la tête du rat qui dépasse, l'œil rouge, les moustaches ; la queue qui sort du bas */
  s += f('M196 206 C192 198 196 192 202 192 C206 192 208 196 207 202 Z', 'url(#l2ra)', 2) + rond(199, 196, 3, C.ratRose, 1.4) + rond(203, 199, 1.5, '#ff3a2a', 0);
  s += ligne('M196 202 l-8 -2 M196 203 l-8 2', '#e8e0d0', .9, .8);
  s += ligne('M212 254 C220 258 224 252 222 246', O, 4.2) + ligne('M212 254 C220 258 224 252 222 246', C.ratRose, 2.4);
  return s;
})()};

/* ---------- le buste : un dos large, des épaules énormes, les pectoraux, les abdominaux, les dentelés ;
   la bandoulière de la faux, le sifflet (pendu au cou dans une autre pièce) ; une cicatrice ---------- */
var BUSTE = 'M131 92 C130 103 126 110 118 113 C110 116 102 118 96 125 C91 132 91 142 94 152 C97 166 105 180 112 190 C116 196 118 202 119 208 L183 210 C184 200 186 194 190 187 C198 176 206 163 208 150 C210 141 210 133 206 127 C200 119 190 114 176 110 C168 107 162 102 161 92 Z';
P.torse = {os:'torse', boite:[86, 84, 130, 132], svg:(function(){
  var s = '';
  s += f(BUSTE, 'url(#l2p)');
  /* le cou (sterno-cléido) et les clavicules */
  s += ligne('M157 94 C152 102 146 110 142 117', C.peau[2], 2.6, .9) + ligne('M134 96 C136 104 138 110 140 116', C.peau[2], 1.8, .6);
  s += ligne('M118 117 C126 120 134 121 140 119 M146 119 C160 121 176 120 190 118', C.peau[3], 1.8, .55) + ligne('M120 115 C128 117 135 118 140 117 M146 117 C160 118 176 117 188 115', C.rim, 2, .6);
  /* l'ombre du côté gauche (loin de la torche), la lumière sur le flanc droit */
  s += nu('M96 125 C91 132 91 142 94 152 C97 166 105 180 112 190 C116 196 118 202 119 208 L128 208 C124 196 118 182 114 168 C110 154 108 140 112 128 Z', C.peau[3], .45);
  s += ligne('M204 132 C208 142 206 156 200 168 C196 176 192 182 188 190', C.rim, 3.2, .75);
  /* les pectoraux : celui de derrière plus étroit, celui de devant large et bombé */
  s += nu('M139 120 C126 120 108 123 101 133 C99 142 104 150 116 153 C127 155 135 151 139 145 Z', C.peau[1], .55);
  s += nu('M141 120 C160 119 190 122 202 132 C205 142 198 154 184 158 C166 162 148 158 141 146 Z', C.peau[0], .5);
  s += ligne('M100 142 C108 154 128 157 139 147', C.peau[3], 3, .95);
  s += ligne('M141 148 C152 162 184 162 201 146', C.peau[3], 3.4, .95);
  s += nu('M141 148 C152 162 184 162 201 146 C196 158 178 166 160 165 C150 164 144 158 141 148 Z', C.peau[2], .55);
  s += nu('M100 142 C108 154 128 157 139 147 C132 158 116 160 106 154 Z', C.peau[3], .4);
  s += ov(170, 132, 20, 7, C.peau[0], .7, -8) + ov(176, 129, 9, 3, '#fff', .35, -8) + ov(120, 134, 9, 4, C.peau[0], .45, 10);
  s += ligne('M140 121 L140 148', C.peau[2], 2.2, .8);
  /* les abdominaux : la ligne blanche, deux rangées de trois, la ligne des flancs */
  s += ligne('M140 152 C139 170 139 188 140 206', C.peau[3], 2.6, .85);
  s += ligne('M124 168 Q132 171 139 168 M125 182 Q132 185 139 182 M126 195 Q133 197 139 195', C.peau[3], 2.2, .8);
  s += ligne('M141 168 Q153 172 165 167 M141 182 Q153 186 166 181 M141 195 Q152 198 164 194', C.peau[3], 2.4, .85);
  s += ligne('M121 156 C118 172 120 190 125 206', C.peau[3], 2.2, .7) + ligne('M167 154 C172 170 171 188 166 206', C.peau[3], 2.6, .85);
  [[131, 161], [132, 175], [133, 189]].forEach(function(p){ s += ov(p[0], p[1], 4.5, 2.6, C.peau[0], .45); });
  [[154, 161], [155, 175], [154, 189]].forEach(function(p){ s += ov(p[0] + 2, p[1], 7, 3, C.peau[0], .7) + ov(p[0] + 4, p[1] - 1, 3, 1.2, '#fff', .35); });
  /* les dentelés (les « doigts » sur les côtes) et le grand oblique */
  s += ligne('M176 160 l12 3 M178 169 l12 3 M180 178 l10 3', C.peau[3], 2.2, .75);
  s += ligne('M176 158 l11 3 M178 167 l11 3 M180 176 l9 3', C.peau[0], 1.4, .6);
  s += nu('M167 190 C172 184 180 180 188 186 C184 196 183 202 183 210 L168 210 Z', C.peau[2], .35);
  /* une vieille cicatrice en travers du pectoral (trois points de couture) */
  s += ligne('M172 126 L188 146', '#f8d4bc', 3, .95) + ligne('M172 126 L188 146', '#b06a50', 1, .7);
  s += ligne('M174 134 l6 -3 M178 139 l6 -3 M182 144 l6 -3', '#8a4a34', 1.2, .8);
  /* la bandoulière de cuir (elle tient la faux, dans le dos) */
  s += f('M186 112 L196 118 L122 200 L112 196 Z', 'url(#l2c)', 2.4);
  s += ligne('M188 116 L117 196 M193 119 L120 199', '#c89a6a', 1, .8, ' stroke-dasharray="3 3"');
  s += f('M150 152 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z', 'none', 0) + rond(152, 154, 5.5, 'url(#l2o)', 2) + rond(152, 154, 2.4, '#3a2410', 0);
  /* la sueur qui brille (deux gouttes) */
  s += ov(196, 140, 1.6, 2.6, '#fff', .75) + ov(130, 176, 1.4, 2.2, '#fff', .6);
  return s;
})()};
/* le sifflet de laiton pendu au cou (il le prend dans la main pour siffler ses rats) */
P.siffletCou = {os:'torse', boite:[124, 96, 40, 40], svg:ligne('M132 100 C132 112 134 122 138 128 M158 100 C156 112 150 122 142 128', '#4a3020', 2) +
  f('M135 126 L147 126 L148 134 L134 134 Z', 'url(#l2o)', 1.8) + rond(141, 130, 1.6, '#3a2410', 0) + ligne('M136 127.5 L146 127.5', '#fffbe8', 1, .8)};

/* ---------- la tête : Léo, l'apprenti du meunier, de trois quarts (il regarde à gauche) ----------
   Une mâchoire carrée, le nez qui a pris des coups, une barbe de trois jours, les taches de rousseur, une cicatrice au sourcil.
   Les yeux, les sourcils et la bouche sont dans les EXPRESSIONS (une image par expression, plus bas). */
var TETE = 'M121 52 C118 58 117 63 117 66 L115 69 C113 72 110 76 108 80 C107 82 107 84 110 85 L114 86 C114 88 115 90 116 91 C115 93 115 95 116 97 C116 101 116 105 119 109 C125 114 137 115 149 112 C159 109 165 102 168 94 C173 87 177 79 178 68 C179 54 169 42 151 40 C135 38 124 43 121 52 Z';
P.tete = {os:'tete', boite:[100, 30, 86, 92], svg:(function(){
  var s = '';
  s += f(TETE, 'url(#l2pr)');
  /* l'ombre sous la mâchoire, la barbe de trois jours, les joues creusées */
  s += nu('M117 98 C116 102 117 106 119 109 C125 114 137 115 149 112 C159 109 165 102 168 94 C160 100 150 104 140 104 C130 104 122 102 117 98 Z', C.peau[2], .55);
  s += nu('M116 92 C118 100 126 108 140 109 C152 110 162 104 167 95 C163 106 152 113 140 113 C128 113 118 108 116 98 Z', '#6a4434', .35);
  for(var k = 0; k < 26; k++){ var a = k * 1.7, x = 120 + (k * 37 % 44), y = 96 + (k * 13 % 14); if(x < 164 && !(x < 130 && y < 99)) s += rond(x, y, .7, '#5a3426', 0); }
  s += ligne('M128 86 C132 92 140 94 150 92', C.peau[2], 2, .6);
  /* l'oreille (côté droit), la tempe, la nuque */
  s += f('M164 70 C171 64 180 68 179 78 C178 87 172 91 166 89', 'url(#l2pr)', 2.6) + ligne('M168 74 C173 72 175 78 172 83', C.peau[3], 1.8, .8);
  s += ligne('M174 56 C178 64 177 74 172 84', C.rim, 2.6, .7);
  /* le nez : une bosse (il a pris des coups), la narine */
  s += ligne('M117 69 C115 72 112 76 109 80', C.peau[3], 1.6, .5) + ligne('M112 83 C114 81 117 82 117 85', C.peau[3], 2, .9) + ov(112, 76, 2, 1.2, '#fff', .55);
  /* les taches de rousseur */
  [[130, 83], [134, 81], [137, 84], [141, 82], [145, 85], [123, 82], [149, 83]].forEach(function(p){ s += rond(p[0], p[1], 1.25, '#b4643c', 0); });
  /* la cicatrice au sourcil de devant */
  s += ligne('M137 58 L142 72', '#f4c8ae', 2.4, .9) + ligne('M137 58 L142 72', '#a65a42', .8, .7);
  return s;
})()};
/* les cheveux de paille, en bataille, plaqués en arrière par la sueur */
P.cheveux = {os:'tete', boite:[104, 10, 92, 70], svg:(function(){
  var s = '';
  var d = 'M117 60 C112 48 118 36 131 33 L124 20 L139 28 L141 14 L152 27 L161 15 L166 30 L180 22 L178 38 L191 38 L181 50 C183 58 181 66 178 72 C175 64 170 58 163 56 C156 52 148 52 140 54 C132 56 124 58 117 60 Z';
  s += f(d, 'url(#l2h)', 3);
  s += ligne('M124 50 C132 42 144 38 156 40 M134 46 C144 40 158 40 168 46 M148 52 C158 48 170 50 178 58', C.cheveux[3], 1.8, .7);
  s += ligne('M126 44 C132 36 140 32 150 33 M156 34 C164 32 172 34 178 40', C.cheveux[0], 2.4, .85);
  s += ligne('M163 56 C166 62 168 70 167 78', C.cheveux[2], 3.2, .9);         /* la patte, devant l'oreille */
  return s;
})()};
/* ---------- les expressions (Romain : « son visage, je veux qu'il change en fonction de ce qu'il fait ») ---------- */
function yeux(o){
  o = o || {};
  var s = '', pu = o.pupille || 0;
  /* l'œil de derrière (petit, en amande), l'œil de devant (plus grand) */
  s += f('M118 71 C120 68 125 68 127 71 C125 74 120 74 118 71 Z', '#fff', 1.8) + rond(120.5 + pu, 71, 1.9, '#2a1a10', 0);
  s += f('M131 71 C134 66 142 66 145 71 C142 75 134 76 131 71 Z', '#fff', 2) + rond(135 + pu, 71, 2.6, '#3a2a14', 0) + rond(134.2 + pu, 70, .8, '#fff', 0);
  return s;
}
function sourcils(o){
  o = o || {};
  var a = o.a == null ? 1 : o.a, s = '';
  /* (a : 1 = froncés en V, 0 = détendus, -1 = levés) */
  s += f('M113 ' + (64 - a * 1) + ' L127 ' + (67 + a * 2) + ' L127 ' + (64 + a * 2) + ' L114 ' + (61 - a * 1) + ' Z', '#9a6420', 2);
  s += f('M131 ' + (67 + a * 3) + ' L148 ' + (61 - a * 2) + ' L148 ' + (57 - a * 2) + ' L130 ' + (63 + a * 3) + ' Z', '#9a6420', 2);
  return s;
}
var V = {};
V.colere = sourcils({a:1}) + yeux({pupille:-1.5}) +
  /* les dents serrées, les lèvres retroussées */
  f('M114 92 C120 89 128 90 135 93 C132 98 120 98 114 95 Z', '#fffaf0', 2) + ligne('M119 90.5 v6 M124 90.6 v6.6 M129 91.4 v6', O, 1.1) + ligne('M114 93.5 C121 94.5 129 95 135 94.4', O, 1) +
  ligne('M119 85 C121 88 121 90 120 91', C.peau[3], 1.6, .8) + ligne('M135 93 l3 2', O, 1.8);
V.rictus = sourcils({a:1}).replace(/L148 59 L148 55/, 'L148 55 L148 51') + yeux({pupille:-1}) +
  /* un sourire mauvais, d'un seul côté */
  f('M115 93 C122 94 130 92 138 87 C136 92 132 96 125 97 C120 97 116 96 115 93 Z', '#fffaf0', 2) + ligne('M121 94.5 v2.6 M126 93.6 v3 M131 91.6 v3', O, 1) + ligne('M138 87 l3 -2', O, 1.8);
V.cri = sourcils({a:1.6}) +
  f('M118 70 C120 66 126 66 128 70 C126 74 120 74 118 70 Z', '#fff', 1.8) + rond(122, 70, 1.3, '#2a1a10', 0) +
  f('M131 70 C134 64 143 64 146 70 C143 75 134 76 131 70 Z', '#fff', 2) + rond(137, 70, 1.6, '#2a1a10', 0) +
  /* la bouche grande ouverte : les dents du haut, du bas, la langue (la mâchoire descend) */
  f('M112 88 C120 86 132 87 140 90 C141 100 136 112 124 114 C116 114 111 104 112 88 Z', '#5a1414', 2.6) +
  f('M114 89 C121 88 131 88 138 91 L137 95 C130 93 121 92 115 93 Z', '#fffaf0', 1.4) +
  f('M116 110 C120 106 130 106 134 108 C131 112 120 114 116 110 Z', '#e06a6a', 1.4) +
  f('M114 106 C120 108 128 108 135 106 L134 110 C128 111 120 111 115 109 Z', '#fffaf0', 1.2) +
  ligne('M140 92 C142 98 141 106 136 112', C.peau[3], 1.6, .7);
V.effort = sourcils({a:1.8}) +
  /* les yeux plissés, les dents serrées très fort, une veine sur la tempe, une goutte de sueur */
  ligne('M118 71 C121 73 124 73 127 71', O, 2.6) + ligne('M131 71 C135 74 140 74 145 71', O, 3) + ligne('M131 74 l3 2 M142 74 l-2 2', O, 1.2, .8) +
  f('M113 91 C121 88 130 89 138 92 C135 98 120 99 113 95 Z', '#fffaf0', 2) + ligne('M118 90 v7 M123 89.6 v8 M128 89.8 v8 M133 90.6 v7', O, 1.1) + ligne('M113 93.5 C122 95 131 95 138 94', O, 1) +
  ligne('M152 50 l-4 6 l5 3 l-4 6', '#b05a3a', 2.4) + ov(158, 62, 2.2, 3.4, '#bfe8ff', .9) + ov(157.4, 61, .8, 1.2, '#fff', 1);
V.souffle = sourcils({a:.8}) + yeux({pupille:-1}) +
  /* les joues gonflées, les lèvres en rond (le sifflet est dans sa main) */
  f('M119 82 C126 80 136 84 138 92 C138 100 130 104 122 102 C117 100 116 94 116 90 Z', 'url(#l2pr)', 2.2) + ov(128, 88, 5, 3, C.peau[0], .8) +
  f('M110 89 C113 86 117 87 117 91 C117 95 112 96 110 93 Z', '#b0503a', 1.8);
V.boit = sourcils({a:0}) +
  /* les yeux fermés (il boit, il savoure), la bouche ouverte qui reçoit la potion */
  ligne('M118 72 C121 74 124 74 127 72', O, 2.4) + ligne('M131 72 C135 75 140 75 145 72', O, 2.6) +
  f('M112 90 C118 88 126 89 131 92 C131 100 124 104 118 103 C114 102 111 96 112 90 Z', '#5a1414', 2.4) + f('M115 98 C119 96 125 97 128 99 C125 102 118 103 115 98 Z', '#3fd13a', 1.2);
V.aah = sourcils({a:-1}) +
  /* les yeux mi-clos, un grand sourire satisfait */
  f('M118 71 C120 69 125 69 127 71 C125 73 120 73 118 71 Z', '#fff', 1.6) + ligne('M117 70.5 C120 68.5 125 68.5 128 70.5', O, 2.6) + rond(121, 71.6, 1.3, '#2a1a10', 0) +
  f('M131 71 C134 68 142 68 145 71 C142 74 134 74 131 71 Z', '#fff', 1.8) + ligne('M130 71 C134 67.5 142 67.5 146 71', O, 3) + rond(136, 72, 1.8, '#2a1a10', 0) +
  f('M113 90 C121 92 131 91 139 87 C138 97 130 104 121 103 C115 102 112 96 113 90 Z', '#5a1414', 2.2) + f('M115 91 C122 93 131 92 137 89 L136 92 C130 94 122 95 116 94 Z', '#fffaf0', 1.2) +
  ligne('M139 87 C142 86 143 84 143 82', O, 1.6);
V.ko = sourcils({a:-1.4}) +
  /* les yeux en spirale, la bouche de travers, la langue */
  ligne('M122 71 m-3 0 a3 3 0 1 1 3 3 a4.5 4.5 0 1 1 -4.5 -4.5', O, 1.6) + ligne('M138 71 m-4 0 a4 4 0 1 1 4 4 a6 6 0 1 1 -6 -6', O, 1.8) +
  f('M114 94 C120 90 130 96 136 92 C134 100 124 102 116 100 Z', '#5a1414', 2) + f('M120 98 C122 104 128 106 130 100 Z', '#e06a6a', 1.4);
V.douleur = sourcils({a:1.4}) +
  ligne('M118 71 C121 73 124 73 127 71', O, 2.6) +
  f('M131 70 C134 65 142 65 145 70 C142 75 134 76 131 70 Z', '#fff', 2) + rond(137, 70, 1.5, '#2a1a10', 0) +
  f('M113 92 C121 90 130 92 137 90 C134 98 120 99 113 96 Z', '#fffaf0', 2) + ligne('M118 91 v6 M123 91 v7 M128 91 v7 M133 90.6 v6', O, 1) + ligne('M113 94 C121 95 129 94 137 93', O, 1);
Object.keys(V).forEach(function(k){ P['v-' + k] = {os:'tete', boite:[100, 44, 60, 74], svg:V[k], visage:k}; });

/* ---------- les bras : des deltoïdes énormes, le biceps devant, le triceps derrière, les veines ; des bandes aux poignets ---------- */
var BRAS_H = 'M180 120 C190 108 214 110 220 126 C224 140 222 156 217 168 C214 177 209 184 203 187 L187 187 C181 181 176 170 176 158 C176 147 178 138 180 131 C180 127 180 123 180 120 Z';
var BRAS_A = 'M182 178 C177 192 182 212 186 234 L207 234 C211 214 218 196 215 178 C210 172 188 172 182 178 Z';
function brasHaut(dx, S){
  var p = S ? C.peauS : C.peau, g = S ? 'url(#l2pS)' : 'url(#l2p)', s = '';
  s += f(dec(BRAS_H, dx, 0), g);
  /* le deltoïde (trois chefs), le creux sous lui, le biceps, le triceps */
  s += nu(dec('M180 131 C190 140 206 144 220 138 C221 146 220 152 218 156 C206 154 190 150 179 142 Z', dx, 0), p[2], .5);
  s += ligne(dec('M180 140 C190 147 206 149 220 144', dx, 0), p[3], 2.6, .9);
  s += ligne(dec('M197 114 C199 124 200 134 200 142', dx, 0), p[2], 1.8, .6);
  s += ov(186 + dx, 160, 7, 13, p[0], S ? .35 : .65, -8) + ov(184 + dx, 156, 2.6, 6, '#fff', S ? .15 : .4, -8);
  s += ligne(dec('M200 152 C198 162 196 174 194 186', dx, 0), p[3], 1.8, .7);
  s += ov(206 + dx, 124, 10, 6, p[0], S ? .3 : .6, 20);
  s += ligne(dec('M219 132 C223 146 221 160 214 174', dx, 0), C.rim, 2.6, S ? .3 : .75);
  if(!S) s += ligne(dec('M188 150 C186 160 189 170 186 180 M186 166 l-4 6', dx, 0), C.veine, 1.8, .9);
  return s;
}
function brasAvant(dx, S){
  var p = S ? C.peauS : C.peau, g = S ? 'url(#l2pS)' : 'url(#l2p)', s = '';
  s += f(dec(BRAS_A, dx, 0), g);
  s += ov(190 + dx, 192, 6, 11, p[0], S ? .3 : .6, 10) + ligne(dec('M200 180 C204 194 205 206 203 214', dx, 0), p[2], 1.8, .65);
  if(!S) s += ligne(dec('M192 188 C190 196 193 204 191 212 M191 200 l5 5', dx, 0), C.veine, 1.6, .9);
  s += ligne(dec('M213 184 C215 196 211 208 207 216', dx, 0), C.rim, 2.4, S ? .3 : .7);
  /* les bandes de toile aux poignets (il cogne fort) */
  s += f(dec('M184 214 L208 214 L207 234 L186 234 Z', dx, 0), 'url(#l2b)', 2.4);
  s += ligne(dec('M185 219 L207 221 M185 225 L207 227 M186 230 L207 231', dx, 0), C.bande[2], 1.4, .9);
  return s;
}
function poing(dx, S){
  var p = S ? C.peauS : C.peau, g = S ? 'url(#l2prS)' : 'url(#l2pr)', s = '';
  /* un gros poing fermé : les phalanges devant (à gauche), le pouce replié dessus */
  s += f(dec('M186 230 C181 236 180 248 183 256 C188 263 202 264 210 258 C215 252 215 240 211 231 Z', dx, 0), g, 3);
  s += ligne(dec('M183 240 C186 241 189 241 191 240 M182 247 C185 248 189 248 191 247 M183 254 C186 255 189 255 191 253', dx, 0), p[3], 1.8, .9);
  s += f(dec('M190 234 C198 235 205 240 206 248 C202 250 196 246 191 242 Z', dx, 0), g, 2.2);
  s += ov(204 + dx, 238, 4, 2.4, p[0], .6, 30);
  return s;
}
function main(dx, S){
  var p = S ? C.peauS : C.peau, g = S ? 'url(#l2prS)' : 'url(#l2pr)', s = '';
  /* la main ouverte, doigts écartés (pour attraper, arracher, montrer) */
  s += f(dec('M187 230 C183 238 183 246 186 252 L184 266 C184 270 189 270 190 266 L192 254 L192 270 C193 274 198 274 198 270 L198 254 L201 268 C202 272 207 271 206 267 L204 252 C208 248 211 240 210 231 Z', dx, 0), g, 2.6);
  s += f(dec('M188 236 C182 240 178 246 176 252 C175 256 179 258 181 255 C184 250 187 246 191 244 Z', dx, 0), g, 2.2);
  s += ligne(dec('M192 246 C196 247 200 247 204 245', dx, 0), p[2], 1.4, .8);
  return s;
}
var dAr = SQ.EAr[0] - SQ.EAv[0];
P.brasAv = {os:'brasAv', boite:[170, 104, 58, 90], svg:brasHaut(0, false)};
P.avantAv = {os:'avantAv', boite:[172, 168, 50, 72], svg:brasAvant(0, false)};
P.poingAv = {os:'mainAv', boite:[174, 224, 46, 46], svg:poing(0, false), main:'poing'};
P.mainAv = {os:'mainAv', boite:[170, 224, 46, 54], svg:main(0, false), main:'ouvert'};
P.brasAr = {os:'brasAr', boite:[170 + dAr, 104, 58, 90], svg:brasHaut(dAr, true)};
P.avantAr = {os:'avantAr', boite:[172 + dAr, 168, 50, 72], svg:brasAvant(dAr, true)};
P.poingAr = {os:'mainAr', boite:[174 + dAr, 224, 46, 46], svg:poing(dAr, true), main:'poing'};
P.mainAr = {os:'mainAr', boite:[170 + dAr, 224, 46, 54], svg:main(dAr, true), main:'ouvert'};

/* ---------- habillé (le début de la phase 2 : il va tout arracher) : la tunique, les manches, la capuche ---------- */
P.tunique = {os:'torse', boite:[84, 84, 134, 134], habit:'tunique', svg:(function(){
  var s = f('M129 92 C128 103 124 110 116 113 C108 116 100 118 94 125 C89 132 89 142 92 152 C95 166 103 180 110 190 C114 196 116 204 116 212 L186 212 C186 202 188 194 192 187 C200 176 208 163 210 150 C212 141 212 133 208 127 C202 119 192 114 178 110 C170 107 164 102 163 92 Z', 'url(#l2tu)');
  s += f('M131 94 L146 116 L161 94 Z', 'url(#l2p)', 2.4) + ligne('M136 100 l8 2 M139 106 l7 1 m-7 -1 l7 -6 M136 100 l8 -4', '#c8a868', 1.4, .9);
  s += ligne('M104 146 C114 160 126 168 136 172 M196 140 C190 158 176 170 160 176 M120 196 C134 200 160 200 176 194', C.tunique[2], 2.4, .9);
  s += ligne('M200 132 C204 146 200 162 192 176', '#6a5e88', 2.2, .6);
  s += ov(170, 182, 12, 6, '#f4ecdc', .18, -10) + ov(118, 168, 8, 5, '#f4ecdc', .15);
  return s;
})()};
function manche(dx, haut, S){
  var g = S ? 'url(#l2tuS)' : 'url(#l2tu)', s;
  if(haut){
    s = f(dec('M177 118 C188 104 218 106 224 124 C228 140 226 158 220 172 C216 182 210 188 202 190 L186 190 C179 183 173 170 173 157 C173 144 175 132 177 118 Z', dx, 0), g);
    s += ligne(dec('M186 150 C196 156 208 156 218 150 M190 172 C198 176 208 174 214 168', dx, 0), C.tunique[2], 2, .9);
  } else {
    s = f(dec('M179 176 C174 192 180 214 184 232 L210 232 C214 212 221 194 218 176 C212 170 186 170 179 176 Z', dx, 0), g);
    s += f(dec('M183 222 L211 222 L210 234 L184 234 Z', dx, 0), S ? C.tunique[2] : C.tunique[1], 2.2);
    s += ligne(dec('M186 196 C194 200 204 200 212 194', dx, 0), C.tunique[2], 2, .9);
  }
  return s;
}
P.mancheAv = {os:'brasAv', boite:[166, 100, 64, 96], habit:'tunique', svg:manche(0, true, false)};
P.mancheAvA = {os:'avantAv', boite:[168, 166, 56, 74], habit:'tunique', svg:manche(0, false, false)};
P.mancheAr = {os:'brasAr', boite:[166 + dAr, 100, 64, 96], habit:'tunique', svg:manche(dAr, true, true)};
P.mancheArA = {os:'avantAr', boite:[168 + dAr, 166, 56, 74], habit:'tunique', svg:manche(dAr, false, true)};
P.capuche = {os:'tete', boite:[96, 18, 104, 108], habit:'capuche', svg:(function(){
  var s = f('M106 84 C98 52 116 24 148 24 C180 24 198 50 192 86 C188 106 172 118 150 120 C130 120 114 108 106 84 Z', 'url(#l2ca)');
  s += '<ellipse cx="128" cy="80" rx="21" ry="26" fill="#07060b"/>';
  s += '<path d="M114 76 L126 80 L115 84 Z M133 80 L144 75 L143 84 Z" fill="#ffe9a0"/>';
  s += ligne('M112 50 C122 36 138 30 152 32 M170 40 C180 50 186 64 186 80', '#3a3250', 2.4, .9) + ligne('M150 116 C164 112 176 102 182 90', '#3a3250', 2, .7);
  return s;
})()};

/* ---------- ses affaires ----------
   La faux (dans le dos, puis dans ses mains), la gourde de potion de soin (verte !), le sifflet, un rat (tenu par la queue). */
/* la faux : le repère est la poignée du haut, tenue par la main de devant ; le manche descend (+y) jusqu'à la lame */
P.faux = {os:'faux', boite:[-132, -44, 150, 252], objet:'faux', svg:(function(){
  var s = '';
  s += ligne('M-2 -36 C-6 30 4 92 -1 158', O, 10) + ligne('M-2 -36 C-6 30 4 92 -1 158', 'url(#l2bo)', 6.4) + ligne('M0 -30 C-3 30 6 92 1 152', '#e2b07a', 1.4, .7);
  /* la poignée du milieu (la main de derrière la tient) */
  s += f('M1 60 L-16 56 L-17 64 L0 68 Z', 'url(#l2bo)', 2.4);
  /* la virole de fer, deux rivets */
  s += f('M-7 146 L6 146 L7 160 L-6 160 Z', '#6a7080', 2.2) + rond(-1, 150, 1.6, '#c8ccd8', 0) + rond(-1, 156, 1.6, '#c8ccd8', 0);
  /* la lame : un grand croissant d'acier, le dos sombre, le fil qui brille */
  s += f('M4 150 C-28 144 -82 152 -126 186 C-104 178 -78 172 -54 170 C-30 168 -12 166 4 166 Z', 'url(#l2a)', 2.8);
  s += ligne('M-2 152 C-34 148 -82 156 -120 182', '#5c6574', 2.2, .9);
  s += ligne('M-118 182 C-96 174 -66 168 -36 167 C-20 166 -8 165 2 164', '#ffffff', 2, .95);
  s += ligne('M-60 162 C-46 158 -30 157 -16 158', '#ffffff', 1.4, .5);
  s += '<g class="lc-eclat"><path d="M-96 176 l3 -9 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 Z" fill="#fff"/></g>';
  return s;
})()};
/* la gourde : une fiole ronde de verre, pleine d'une potion verte qui luit, un bouchon, une étiquette à croix verte */
P.gourde = {os:'gourde', boite:[-22, -42, 44, 66], objet:'gourde', svg:(function(){
  var s = '';
  s += ov(0, 6, 20, 19, '#7dff6a', .35);
  s += f('M-5 -24 L5 -24 L6 -10 C16 -6 20 2 19 10 C18 20 10 26 0 26 C-10 26 -18 20 -19 10 C-20 2 -16 -6 -6 -10 Z', C.verre, 2.6, ' fill-opacity=".55"');
  s += nu('M-17 4 C-16 -2 -10 -6 -5 -7 L5 -7 C10 -6 16 -2 17 4 C18 18 10 24 0 24 C-10 24 -18 18 -17 4 Z', 'url(#l2v)');
  s += ligne('M-15 2 C-8 -1 8 -1 15 2', '#eaffc0', 1.8, .9);
  s += rond(-6, 12, 2, '#eaffc0', 0) + rond(4, 16, 1.4, '#eaffc0', 0) + rond(8, 6, 1.1, '#eaffc0', 0);
  s += f('M-6 -2 L6 -2 L6 10 L-6 10 Z', '#fbf4e0', 1.6) + f('M-1.6 0 L1.6 0 L1.6 2.6 L4.2 2.6 L4.2 5.4 L1.6 5.4 L1.6 8 L-1.6 8 L-1.6 5.4 L-4.2 5.4 L-4.2 2.6 L-1.6 2.6 Z', '#2fb83a', 1);
  s += ov(-10, 2, 3, 7, '#fff', .7, 20) + ov(-4, -16, 1.4, 4, '#fff', .7);
  s += ligne('M-6 -14 C-14 -18 -16 -10 -12 -6', '#5a3a20', 2.4);
  s += ov(0, -24, 4.4, 1.6, '#1f8a2a', .9);
  return s;
})()};
/* son bouchon (il saute quand il ouvre la gourde) */
P.bouchon = {os:'gourde', boite:[-10, -38, 20, 18], objet:'bouchon', svg:f('M-7 -34 L7 -34 L6 -23 L-6 -23 Z', '#a8763e', 2.4) + ligne('M-6 -30 L6 -30', '#d8a868', 1.4, .8)};
P.sifflet = {os:'sifflet', boite:[-20, -14, 34, 24], objet:'sifflet', svg:f('M-16 -6 L6 -8 L8 2 L-14 4 Z', 'url(#l2o)', 2) + rond(-6, -2, 2, '#3a2410', 0) + ligne('M-14 -5 L4 -7', '#fffbe8', 1.2, .8)};
/* le rat tenu par la queue (le repère : le bout de la queue, dans son poing) */
var RAT = (function(){
  var s = '';
  s += ligne('M0 0 C8 12 -6 22 -2 40', O, 5) + ligne('M0 0 C8 12 -6 22 -2 40', C.ratRose, 2.8);
  s += f('M-2 38 C-16 40 -20 58 -16 72 C-12 84 4 86 10 74 C16 62 12 42 -2 38 Z', 'url(#l2ra)', 2.6);
  s += ligne('M-12 50 l-4 2 M-12 60 l-5 2 M8 52 l4 1 M10 62 l4 1', C.rat[2], 1.4, .8);
  s += f('M-14 70 C-18 80 -12 94 -2 98 C6 94 10 82 6 72 Z', 'url(#l2ra)', 2.4);
  s += rond(-12, 76, 4.6, C.ratRose, 1.8) + rond(6, 76, 4, C.ratRose, 1.8) + rond(-5, 86, 1.8, '#ff3a2a', 0) + rond(3, 86, 1.6, '#ff3a2a', 0);
  s += f('M-4 96 L-1 101 L2 96 Z', '#fff', 1) + rond(-1, 98, 1.6, '#e88a8a', 0);
  s += ligne('M-4 94 l-9 4 M-4 95 l-8 7 M2 94 l9 3 M2 95 l8 7', '#e8e0d0', .9, .85);
  s += f('M-16 60 l-8 6 l3 2 Z M10 60 l8 6 l-3 2 Z', C.ratRose, 1.4);
  return s;
})();
P.rat = {os:'rat', boite:[-30, -6, 54, 112], objet:'rat', svg:RAT};

/* ============================================================================ L'ORDRE D'EMPILEMENT (du fond vers l'avant) */

/* ============================================================================ LÉO SOUS LA POTION (phase 3 ; Romain, 15 novembre)
   « Ça doit être la modélisation la plus jolie de toutes […] le modèle le plus détaillé de tout le donjon. » Le même pantin, le même
   squelette, mais : la peau rougie par la potion (les couleurs changées à la cuisson : potion()), les veines qui brillent en vert,
   des trapèzes énormes, une lueur dans la poitrine, les yeux qui luisent, les cheveux dressés, la sueur, la vapeur — autant de
   pièces posées PAR-DESSUS celles du corps (elles suivent les mêmes os : aucune animation en plus). Et les TROIS ENTAILLES de la
   faux (« je veux trois traits rouges […] je veux vraiment qu'on voit qu'il saigne ») : plaie1, plaie2, plaie3. */
var POTION = [[C.peau[0], '#ffcda0'], [C.peau[1], '#ee975c'], [C.peau[2], '#c05a34'], [C.peau[3], '#762c1c'],
  [C.peauS[0], '#dc9c70'], [C.peauS[1], '#bd7044'], [C.peauS[2], '#8e4228'], [C.peauS[3], '#562014'], [C.veine, '#8dff5a']];
function potion(svg){ POTION.forEach(function(c){ svg = svg.split(c[0]).join(c[1]); }); return svg; }
function veine(d, w, op){ w = w || 1.5; op = op || 1; return ligne(d, '#3fd13a', w + 2.6, .2 * op) + ligne(d, '#a6ff6a', w, .88 * op) + ligne(d, '#f4ffdc', w * .36, .85 * op); }
function noeud(x, y, r){ return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2.4) + '" fill="#8dff5a" opacity=".3"/>' + rond(x, y, r, '#f4ffdc', 0); }
function goutte(x, y, r){ return ov(x, y, r * .7, r, '#e8f8ff', .9) + ov(x - r * .2, y - r * .3, r * .25, r * .35, '#fff', .95); }
P['p3-torse'] = {os:'torse', boite:[76, 66, 150, 156], potion:true, svg:(function(){
  var s = '';
  /* les trapèzes, énormes, qui montent jusqu'aux oreilles */
  s += f('M134 88 C122 92 108 102 96 121 C108 116 122 112 136 110 Z', 'url(#l2p)', 2.6) + f('M157 88 C172 92 190 103 205 123 C190 117 172 112 155 110 Z', 'url(#l2p)', 2.6);
  s += ligne('M130 94 C120 100 110 108 102 118 M162 94 C174 100 188 108 198 120', C.peau[3], 1.4, .55) + ligne('M133 91 C124 95 114 102 106 111 M159 91 C170 95 182 102 192 110', C.rim, 1.8, .55);
  /* la potion luit dans sa poitrine, et sur le bord de son corps (une lumière verte) */
  s += '<circle cx="147" cy="148" r="36" fill="url(#l2v)" opacity=".2"/><circle cx="147" cy="148" r="15" fill="url(#l2v)" opacity=".32"/>';
  s += ligne('M95 127 C91 134 91 143 94 152 C97 165 104 178 111 189', '#b6ff8a', 1.6, .5) + ligne('M207 150 C205 163 198 176 190 187', '#b6ff8a', 1.6, .45);
  /* les muscles, plus creusés : les pectoraux, les dentelés, les abdominaux */
  s += ligne('M110 131 C120 137 131 139 141 137 M155 137 C167 140 181 138 193 131', C.peau[3], 1.5, .5);
  s += ligne('M112 150 C116 156 118 162 118 168 M108 142 C112 150 114 156 114 162 M184 152 C182 158 181 164 182 170 M190 144 C187 152 186 158 186 164', C.peau[3], 1.3, .5);
  s += ligne('M131 166 C137 164 143 164 147 166 M152 166 C158 164 166 165 172 168 M132 181 C138 179 143 179 147 181 M152 181 C158 179 166 180 171 183 M134 195 C139 193 144 193 148 195 M153 195 C158 193 164 194 169 197', C.rim, 1.7, .55);
  /* les veines, pleines de potion : elles partent du cœur et se ramifient (fines, sinueuses) */
  s += veine('M146 150 C142 142 143 134 139 126 C137 119 141 112 140 104', 1.7) + veine('M139 126 C134 122 130 121 126 116', 1.1) + veine('M141 112 C145 108 147 104 147 99', 1);
  s += veine('M146 150 C138 150 132 144 124 144 C117 143 112 137 105 134', 1.6) + veine('M124 144 C121 150 122 156 118 162', 1.1) + veine('M112 138 C109 142 108 147 105 150', .9);
  s += veine('M148 150 C156 151 162 145 170 146 C178 146 184 139 193 137', 1.6) + veine('M170 146 C174 152 173 159 177 165', 1.1) + veine('M184 140 C188 144 192 144 196 148', .9);
  s += veine('M147 152 C145 160 149 167 147 175 C146 183 150 190 149 199', 1.5) + veine('M147 175 C141 178 138 184 132 187', 1) + veine('M148 182 C155 185 158 191 165 193', 1);
  s += noeud(146, 150, 2.2) + noeud(124, 144, 1.2) + noeud(170, 146, 1.2) + noeud(147, 175, 1.1) + noeud(139, 126, 1.1);
  /* de vieilles cicatrices, la sueur, la vapeur qui monte de ses épaules */
  s += ligne('M166 157 L181 151 M169 162 L184 156 M114 176 L124 184', '#6a2418', 1.5, .75) + ligne('M167 156 L180 151 M170 161 L183 156', '#ffd0b0', .7, .6);
  s += goutte(117, 158, 2.6) + goutte(186, 168, 2.4) + goutte(160, 191, 2.2) + goutte(133, 122, 2) + goutte(176, 126, 2);
  s += ligne('M99 110 C94 102 101 96 96 88 C93 82 97 78 95 72 M207 112 C212 104 205 98 210 90 C213 84 208 80 211 74', '#ffffff', 3.4, .22);
  return s;
})()};
P['p3-tete'] = {os:'tete', boite:[90, 0, 110, 126], potion:true, saufVisage:['ko', 'boit'], svg:(function(){
  var s = '', H1 = '#f6cf6a';
  /* les cheveux dressés (au-dessus de sa crête) */
  s += f('M127 34 L123 19 L137 29 Z', H1, 2.2) + f('M141 29 L144 14 L155 26 Z', H1, 2.2) + f('M158 28 L167 15 L170 31 Z', H1, 2.2) + f('M171 34 L183 23 L181 40 Z', H1, 2.2);
  s += ligne('M127 26 L129 31 M145 20 L146 26 M166 21 L165 27 M180 29 L178 35', '#fff6c8', 1.3, .85);
  /* les yeux qui luisent */
  s += '<circle cx="122.5" cy="71" r="8" fill="url(#l2v)" opacity=".5"/><circle cx="138" cy="71" r="10.5" fill="url(#l2v)" opacity=".55"/>';
  s += rond(120.5, 71, 1.7, '#f4ffdc', 0) + rond(135, 71, 2.3, '#f4ffdc', 0) + ligne('M127 70 L113 66 M145 70 L157 65', '#8dff5a', 1.2, .6);
  /* une veine à la tempe, la mâchoire serrée, la vapeur des naseaux */
  s += veine('M152 58 C155 62 154 67 157 71 C159 74 158 78 160 81', 1.1) + veine('M157 71 C161 71 163 73 166 73', .8);
  s += ligne('M124 96 C130 99 138 99 146 95', C.peau[3], 1.4, .5);
  s += ligne('M107 82 C101 81 97 85 92 83 M108 85 C103 87 100 91 95 91', '#ffffff', 2.6, .4);
  return s;
})()};
function vBrasH(dx, S){ var k = S ? .65 : 1; return veine(dec('M193 120 C196 128 201 134 200 143 C199 152 204 160 200 169 C198 176 197 181 197 186', dx, 0), 1.6, k) + veine(dec('M200 143 C206 146 209 152 212 157', dx, 0), 1, k) + veine(dec('M200 169 C194 171 190 176 187 180', dx, 0), .9, k) +
  ligne(dec('M183 123 C190 118 204 118 213 127 M186 172 C192 176 202 176 210 170', dx, 0), C.peau[3], 1.3, .5 * k) + ligne(dec('M211 131 C217 142 217 156 213 168', dx, 0), C.rim, 2, .5 * k) + noeud(200 + dx, 143, 1) + goutte(206 + dx, 138, 2); }
function vBrasA(dx, S){ var k = S ? .65 : 1; return veine(dec('M196 181 C194 188 198 194 196 201 C194 208 198 214 198 221', dx, 0), 1.4, k) + veine(dec('M196 201 C201 203 204 208 206 213', dx, 0), .9, k) +
  ligne(dec('M186 184 C192 180 204 180 212 186', dx, 0), C.peau[3], 1.2, .5 * k); }
P['p3-brasAv'] = {os:'brasAv', boite:[166, 100, 66, 98], potion:true, svg:vBrasH(0, false)};
P['p3-avantAv'] = {os:'avantAv', boite:[168, 164, 58, 80], potion:true, svg:vBrasA(0, false)};
P['p3-brasAr'] = {os:'brasAr', boite:[166 + dAr, 100, 66, 98], potion:true, svg:vBrasH(dAr, true)};
P['p3-avantAr'] = {os:'avantAr', boite:[168 + dAr, 164, 58, 80], potion:true, svg:vBrasA(dAr, true)};
/* les trois entailles de la faux : trois traits rouges, l'un sous l'autre, en travers du torse (comme un coup de griffes) — une
   entaille effilée aux deux bouts, la chair rouge vif entre deux lèvres sombres, et le sang qui coule */
function fuseau(x0, y0, x1, y1, e, coul, op){
  var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L * e * 2, ny = (x1 - x0) / L * e * 2;
  return '<path d="M' + x0 + ' ' + y0 + ' Q' + (mx + nx).toFixed(1) + ' ' + (my + ny).toFixed(1) + ' ' + x1 + ' ' + y1 + ' Q' + (mx - nx).toFixed(1) + ' ' + (my - ny).toFixed(1) + ' ' + x0 + ' ' + y0 + ' Z" fill="' + coul + '"' + (op != null ? ' opacity="' + op + '"' : '') + '/>';
}
function plaie(x0, y0, x1, y1, coulures){
  var s = fuseau(x0, y0, x1, y1, 4.6, '#2a0406', .92) + fuseau(x0 + 2, y0 + .8, x1 - 2, y1 - .8, 3, '#a80e18') + fuseau(x0 + 5, y0 + 2, x1 - 5, y1 - 2, 1.3, '#ff4a44') + ligne('M' + (x0 + 8) + ' ' + (y0 + 2.4) + ' L' + (x1 - 10) + ' ' + (y1 - 4.6), '#ffc0b0', .7, .7);
  coulures.forEach(function(g){ var x = x0 + (x1 - x0) * g[0], y = y0 + (y1 - y0) * g[0] + 2, l = g[1];
    s += ligne('M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' C' + (x - .8).toFixed(1) + ' ' + (y + l * .4).toFixed(1) + ' ' + (x + 1).toFixed(1) + ' ' + (y + l * .7).toFixed(1) + ' ' + x.toFixed(1) + ' ' + (y + l).toFixed(1), '#a80e18', 2.1, .95) +
      ligne('M' + (x - .5).toFixed(1) + ' ' + (y + 1.5).toFixed(1) + ' L' + (x - .3).toFixed(1) + ' ' + (y + l * .6).toFixed(1), '#ff6a5a', .7, .8) + ov(x, y + l + 1.2, 1.7, 2.5, '#c8101c'); });
  return s;
}
P.plaie1 = {os:'torse', boite:[104, 108, 90, 70], plaie:1, svg:plaie(114, 122, 172, 144, [[.25, 12], [.55, 19], [.8, 10]])};
P.plaie2 = {os:'torse', boite:[108, 132, 90, 72], plaie:2, svg:plaie(119, 146, 178, 168, [[.2, 10], [.5, 16], [.78, 12]])};
P.plaie3 = {os:'torse', boite:[114, 156, 88, 72], plaie:3, svg:plaie(125, 170, 181, 191, [[.3, 13], [.62, 17]])};
var ORDRE = ['faux@dos', 'brasAr', 'p3-brasAr', 'mancheAr', 'avantAr', 'p3-avantAr', 'mancheArA', 'poingAr', 'mainAr', 'cuisseAr', 'tibiaAr', 'piedAr', 'sac',
  'cuisseAv', 'tibiaAv', 'piedAv', 'bassin', 'gourde@ceinture', 'bouchon@ceinture', 'torse', 'p3-torse', 'plaie1', 'plaie2', 'plaie3', 'tunique', 'siffletCou',
  'tete', 'v-colere', 'v-rictus', 'v-cri', 'v-effort', 'v-souffle', 'v-boit', 'v-aah', 'v-ko', 'v-douleur', 'cheveux', 'p3-tete', 'capuche',
  'faux@main', 'brasAv', 'p3-brasAv', 'mancheAv', 'avantAv', 'p3-avantAv', 'mancheAvA', 'gourde@main', 'bouchon@main', 'rat', 'sifflet', 'poingAv', 'mainAv'];

/* ============================================================================ LES POSES
   x, y : tout le corps (y < 0 : en l'air) ; r : il bascule autour des pieds (une chute) ; bas : il plie les genoux (les hanches
   descendent, les pieds restent au sol) ; bassin, torse, tete : en degrés (+ : vers l'avant, vers les héros) ;
   bAv / bAr : [épaule, coude, poignet] en degrés (0 : le bras pend ; + : il monte vers l'avant) ;
   mAv / mAr : à la place, où mettre la main [x, y] (dans les mesures du buste au repos) — le coude se plie tout seul ;
   pAv / pAr : où poser la cheville [x, y] (le genou se plie tout seul) ; jAv / jAr : [hanche, genou] pour une jambe en l'air ;
   piedAv / piedAr : l'angle du pied ; souffle : il respire (0 à 1) ; ombre : la taille de l'ombre (sol) ;
   fa : l'angle de la faux, par rapport au buste (0 : le manche pend vers le bas ; 90 : vers l'avant ; 180 : vers le haut ;
     206 : comme dans son dos) — elle ne tourne pas avec le poignet ; fg : à quelle hauteur de son manche il la tient
     (0 : la poignée du haut ; 120 : près de la lame) ; deux : 1 = la main de derrière tient aussi la faux (sa poignée du milieu) ;
   ga : l'angle de la gourde, par rapport au buste (0 : debout ; 180 : à l'envers, il la vide dans sa bouche) ; gp : où il la tient
     (0 : par le goulot ; 1 : par le fond, le goulot vers sa bouche) ; ra : l'angle du rat qu'il tient par la queue (0 : il pend). */
var GARDE = {x:0, y:0, r:0, bas:10, bassin:3, torse:5, tete:9, bAv:[-10, 26, -6], bAr:[18, 34, 0], pAv:[200, 318], pAr:[102, 318], piedAv:0, piedAr:0, souffle:1};
var POSES = {
  garde:GARDE,
  repos:{bas:4, torse:2, tete:2, bAv:[8, 18, 0], bAr:[10, 16, 0], pAv:[186, 318], pAr:[116, 318]},
  /* un genou à terre (le genou de la jambe de devant touche le sol, son pied part en arrière) */
  genou:{bas:58, bassin:6, torse:24, tete:20, bAv:[-4, 36, 0], bAr:[40, 70, 0], jAv:[26, 116], pAr:[88, 318], piedAv:-70, souffle:2},
  aTerre:{bas:66, bassin:8, torse:44, tete:30, bAv:[30, 30, 0], bAr:[50, 24, 0], jAv:[30, 118], pAr:[84, 318], piedAv:-74, souffle:2},
  brasCroises:{bas:6, torse:-4, tete:-6, mAv:[132, 168], mAr:[176, 166], pAv:[196, 318], pAr:[106, 318]},
  rugit:{bas:6, torse:-12, tete:-22, bAv:[40, 120, 0], bAr:[60, 110, 0], pAv:[198, 318], pAr:[104, 318]},
  sonne:{bas:14, torse:14, tete:24, bAv:[6, 20, 0], bAr:[14, 16, 0], pAv:[190, 318], pAr:[112, 318]}
};
var CLES_N = ['x', 'y', 'r', 'bas', 'bassin', 'torse', 'tete', 'piedAv', 'piedAr', 'souffle', 'ombre', 'fa', 'fg', 'ga', 'gp', 'ra', 'deux'];
var CLES_T = ['bAv', 'bAr', 'mAv', 'mAr', 'pAv', 'pAr', 'jAv', 'jAr'];
/* une pose complète (ce qui manque vient de la garde) */
function complete(p){
  var o = {}, k;
  p = typeof p === 'string' ? (POSES[p] || GARDE) : (p || GARDE);
  for(k = 0; k < CLES_N.length; k++){ var c = CLES_N[k]; o[c] = p[c] != null ? p[c] : (GARDE[c] != null ? GARDE[c] : 0); }
  for(k = 0; k < CLES_T.length; k++){ var t = CLES_T[k]; o[t] = p[t] ? p[t].slice() : (GARDE[t] ? GARDE[t].slice() : null); }
  if(p.mAv) o.bAv = null; if(p.mAr) o.bAr = null;
  if(p.jAv) o.pAv = null; if(p.jAr) o.pAr = null;
  if(p.ombre == null) o.ombre = 1;
  o._c = 1;
  return o;
}
/* entre deux poses : k de 0 à 1 */
function melange(a, b, k){
  var o = {}, i;
  for(i = 0; i < CLES_N.length; i++){ var c = CLES_N[i]; o[c] = a[c] + (b[c] - a[c]) * k; }
  for(i = 0; i < CLES_T.length; i++){
    var t = CLES_T[i], A = a[t], B = b[t];
    if(A && B) o[t] = A.map(function(v, j){ return v + ((B[j] == null ? v : B[j]) - v) * k; });
    else o[t] = k < .5 ? (A && A.slice()) : (B && B.slice());
  }
  /* (un bras en angles d'un côté, en main visée de l'autre : on passe de l'un à l'autre à mi-chemin) */
  o._c = 1;
  ['Av', 'Ar'].forEach(function(s){ if(o['m' + s] && o['b' + s]){ if(k < .5) o['m' + s] = null; else o['b' + s] = null; } if(o['p' + s] && o['j' + s]){ if(k < .5) o['j' + s] = null; else o['p' + s] = null; } });
  return o;
}

/* ============================================================================ LES MATRICES [a, b, c, d, e, f] */
function mul(A, B){ return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
function T(x, y){ return [1, 0, 0, 1, x, y]; }
/* une rotation de « deg » degrés autour de (cx, cy) ; + : dans le sens des aiguilles d'une montre (vers la gauche, pour un membre qui pend) */
function R(deg, cx, cy){ var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); cx = cx || 0; cy = cy || 0; return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy]; }
function S(k, cx, cy){ return [k, 0, 0, k, cx - k * cx, cy - k * cy]; }
function ap(M, x, y){ return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; }
function inv(m){ var d = m[0] * m[3] - m[1] * m[2] || 1e-9; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d]; }
var DEG = 180 / Math.PI;
/* la cinématique inverse d'un membre à deux os : de la racine j vers la cible t ; sens : +1 = le genou en avant (vers la gauche),
   -1 = le coude en arrière. Rend [angle du premier os, angle du second] (absolus, 0 = vers le bas). */
function ik(j, t, L1, L2, sens){
  var dx = t[0] - j[0], dy = t[1] - j[1], L = Math.sqrt(dx * dx + dy * dy);
  L = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - .3, L));
  var th = Math.atan2(-dx, dy) * DEG;
  var a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L * L - L2 * L2) / (2 * L1 * L)))) * DEG;
  var k = 180 - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - L * L) / (2 * L1 * L2)))) * DEG;
  var o1 = th + sens * a;
  return [o1, o1 - sens * k];
}

/* ============================================================================ LA CUISSON (une fois pour toutes) */
var CUIT = {};                      /* nom de pièce -> url de l'image */
var IMG = {};                       /* nom de pièce -> l'image décodée (pour la peindre sur la toile) */
var cuisson = null;
/* (pour la cuisson : Cuire.image ajoute lui-même la largeur et la hauteur ; avec, l'image serait invalide) */
function svgPiece(nom, enLigne, forme){ var p = P[nom], b = p.boite, s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.join(' ') + '"' + (enLigne ? ' width="' + b[2] + '" height="' + b[3] + '"' : '') + '>' + (enLigne ? '' : DEFS) + p.svg + '</svg>'; return forme === 3 || p.potion ? potion(s) : s; }
/* les pièces qui changent de couleur sous la potion (celles qui montrent de la peau) : elles sont cuites une deuxième fois */
var CUIT3 = {};
function aDeLaPeau(nom){ var p = P[nom]; if(p.potion || p.plaie || p.habit || p.objet) return false; var s = p.svg; return s.indexOf('l2p') >= 0 || POTION.some(function(c){ return s.indexOf(c[0]) >= 0; }); }
/* sans cuisson, les pièces restent en SVG : leurs dégradés sont posés UNE fois dans la page (dans un SVG jamais caché : un dégradé
   rangé dans une pièce cachée — display:none — ne se dessinerait plus nulle part) */
function defsPage(){
  if(document.getElementById('lc-defs')) return;
  var d = document.createElement('div'); d.id = 'lc-defs'; d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">' + DEFS + '</svg>';
  document.body.appendChild(d);
}
function resolution(){
  /* (RAPIDITE.md, R1) des pixels d'écran par unité du dessin : la scène fait 960 de large, Léo y est à l'échelle ~1 */
  var dpr = window.devicePixelRatio || 1, sc = Math.min(1.6, Math.max(.6, (window.innerWidth || 960) / 960));
  return Math.max(1.4, Math.min(2.8, dpr * sc * 1.2));
}
function preparer(){
  if(cuisson) return cuisson;
  var Cu = window.Cuire, res = resolution();
  if(!Cu || !Cu.image) return (cuisson = Promise.resolve(false));
  cuisson = Promise.all(Object.keys(P).map(function(nom){
    var b = P[nom].boite;
    return Cu.image(svgPiece(nom), b[2], b[3], res).then(function(url){ if(url) CUIT[nom] = url; }).catch(function(){});
  }).concat(Object.keys(P).filter(aDeLaPeau).map(function(nom){
    var b = P[nom].boite;
    return Cu.image(svgPiece(nom, false, 3), b[2], b[3], res).then(function(url){ if(url) CUIT3[nom] = url; }).catch(function(){});
  }))).then(function(){
    /* les images décodées d'avance (RAPIDITE.md, R7) */
    return Promise.all(Object.keys(CUIT).map(function(n){ var i = new Image(); i.src = CUIT[n]; return i.decode ? i.decode().then(function(){ IMG[n] = i; }, function(){}) : new Promise(function(ok){ i.onload = function(){ IMG[n] = i; ok(); }; i.onerror = ok; }); }));
  }).then(function(){ return true; }, function(){ return false; });
  return cuisson;
}

/* ============================================================================ LE PANTIN */
var cssFait = false;
function css(){
  if(cssFait) return; cssFait = true;
  var s = document.createElement('style');
  s.textContent = '.lc{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;pointer-events:none}' +
    /* (chaque pièce sur son propre calque : la bouger ne repeint rien — RAPIDITE.md, R1, R5 ; une pièce cachée n'a pas de calque) */
    '.lc-p{position:absolute;left:0;top:0;width:1px;height:1px;transform-origin:0 0;will-change:transform}' +
    '.lc-p > img, .lc-p > svg{position:absolute;display:block;max-width:none;pointer-events:none;-webkit-user-drag:none;user-select:none}' +
    '.lc-p.cache{display:none}' +
    /* (en combat : tout Léo est peint sur UNE toile ; ses pièces ne sont plus dans la page — voir _peindre) */
    '.lc.lc-sur-toile .lc-p{display:none}' +
    '.lc-toile{position:absolute;display:block;pointer-events:none}' +
    '.lc-ombre{position:absolute;left:76px;top:' + (PIED - 9) + 'px;width:150px;height:18px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.55),rgba(0,0,0,0));transform-origin:50% 50%;will-change:transform,opacity}' +
    /* la teinte (le givre, le feu, le soin…) : une lueur de couleur posée sur lui — plus de filtre sur tout Léo, recalculé à chaque image */
    '.lc-teinte{position:absolute;left:10px;top:20px;width:280px;height:320px;border-radius:46%;pointer-events:none;opacity:0;z-index:200;transition:opacity .25s;will-change:transform,opacity}' +
    '.lc-cape{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;overflow:visible;pointer-events:none}';
  document.head.appendChild(s);
}
function Corps(parent, o){
  css();
  o = o || {};
  /* où est le pantin dans la scène (pour la toile, qui couvre toute la salle) */
  this.ox = (o.cx == null ? 815 : o.cx) - W / 2; this.oy = (o.sol == null ? 340 : o.sol) - PIED;
  var self = this, d = document.createElement('div');
  d.className = 'lc';
  parent.appendChild(d);
  this.el = d;
  this.ombreEl = document.createElement('div'); this.ombreEl.className = 'lc-ombre'; d.appendChild(this.ombreEl);
  /* la cape (habillé seulement) : un petit îlot SVG redessiné à chaque image, derrière tout */
  this.capeEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.capeEl.setAttribute('class', 'lc-cape'); this.capeEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  this.capeEl.innerHTML = '<defs>' + lin('l2caC', C.cape) + '</defs><path class="lc-cape-f" fill="url(#l2caC)" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/><path class="lc-cape-p" fill="none" stroke="#2f2840" stroke-width="2.4" stroke-linecap="round"/>';
  this.capeEl.style.display = 'none';
  d.appendChild(this.capeEl);
  this.pieces = {};
  ORDRE.forEach(function(cle, z){
    var nom = cle.split('@')[0], ou = cle.split('@')[1] || null, p = P[nom];
    var e = document.createElement('div'); e.className = 'lc-p'; e.style.zIndex = String(z + 2);
    var b = p.boite;
    var im = null;
    if(CUIT[nom]){ var i = im = document.createElement('img'); i.src = CUIT[nom]; i.alt = ''; i.style.cssText = 'left:' + b[0] + 'px;top:' + b[1] + 'px;width:' + b[2] + 'px;height:' + b[3] + 'px'; e.appendChild(i); }
    else { defsPage(); e.innerHTML = svgPiece(nom, true); var sv = e.firstChild; sv.style.left = b[0] + 'px'; sv.style.top = b[1] + 'px'; sv.style.overflow = 'visible'; }
    d.appendChild(e);
    self.pieces[cle] = {el:e, cle:cle, nom:nom, ou:ou, os:p.os, z:z + 2, vu:true, b:b, im:im};
  });
  this.liste = []; this.surToile = false; this.teinteT = null; this.flashT = 0;
  this.teinteEl = document.createElement('div'); this.teinteEl.className = 'lc-teinte'; d.appendChild(this.teinteEl);
  this.etat = {forme:2, plaies:0, visage:'colere', faux:'dos', gourde:'ceinture', bouchon:true, sifflet:'cou', rat:null, capuche:false, tunique:false, cape:false, main:{Av:'poing', Ar:'poing'}, devantAr:false};
  this.p = complete(GARDE);
  this.de = null; this.a = null; this.t = 0; this.duree = 0; this.courbe = null; this.fin = null; this.temps = 0;
  this.M = {};
  this.ech = .94;
  this.extras = {};                    /* des transformations en plus, posées par leo.js (la faux, la gourde, le rat) */
  this._maj();
  this.poser(GARDE);
}
var CP = Corps.prototype;
/* ce qui se voit : une pièce n'est montrée que si elle sert */
CP._maj = function(){
  var E = this.etat, self = this;
  Object.keys(this.pieces).forEach(function(cle){
    var q = self.pieces[cle], n = q.nom, p = P[n], vu = true;
    /* (sous la potion — phase 3 : ses veines, ses yeux qui luisent, ses entailles) */
    if(p.potion) vu = E.forme === 3 && !(p.saufVisage && p.saufVisage.indexOf(E.visage) >= 0);
    else if(p.plaie) vu = E.forme === 3 && E.plaies >= p.plaie;
    else if(p.visage) vu = p.visage === E.visage && !E.capuche;
    else if(n === 'faux') vu = E.faux === q.ou;
    else if(n === 'gourde') vu = E.gourde === q.ou;
    else if(n === 'bouchon') vu = E.gourde === q.ou && E.bouchon;
    else if(n === 'siffletCou') vu = E.sifflet === 'cou' && !E.tunique;
    else if(n === 'sifflet') vu = E.sifflet === 'main';
    else if(n === 'rat') vu = E.rat === 'main';
    else if(p.main) vu = p.main === E.main[n.slice(-2)];
    else if(p.habit) vu = !!E[p.habit];
    if(n === 'cheveux') vu = !E.capuche;
    /* (habillé : la faux et le sac à rats sont sous la cape ; le sifflet et la gourde, sous la tunique) */
    if(E.cape && (n === 'faux' && q.ou === 'dos' || n === 'sac')) vu = false;
    if(E.tunique && (n === 'gourde' || n === 'bouchon' || n === 'siffletCou')) vu = false;
    if(vu !== q.vu){ q.vu = vu; q.tr = null; q.el.classList.toggle('cache', !vu); }
  });
  /* le bras de derrière passe devant le buste quand il tient la faux avec l'autre main */
  ['brasAr', 'mancheAr', 'avantAr', 'mancheArA', 'poingAr', 'mainAr'].forEach(function(cle, k){ var q = self.pieces[cle]; q.el.style.zIndex = String(E.devantAr ? 80 + k : q.z); });
  this.capeEl.style.display = E.cape ? '' : 'none';
  /* la liste de ce qui se voit, de derrière vers devant (pour la toile) */
  this.liste = Object.keys(this.pieces).map(function(cle){ return self.pieces[cle]; }).filter(function(q){ return q.vu; })
    .map(function(q){ var k = ['brasAr', 'mancheAr', 'avantAr', 'mancheArA', 'poingAr', 'mainAr'].indexOf(q.cle); return {q:q, z:E.devantAr && k >= 0 ? 80 + k : q.z}; })
    .sort(function(a, b){ return a.z - b.z; }).map(function(x){ return x.q; });
  /* torse nu (le combat) : sur la toile ; habillé (la cinématique : la cape est un dessin vivant) : en pièces, comme avant */
  this._choisirToile(!E.cape && !E.tunique && !E.capuche);
};
/* ---------- LA TOILE (Romain, 15 novembre : « ça rame de partout », « optimisation au maximum ») ----------
   Avant : une quarantaine de pièces, chacune sur son calque, déplacées une par une à chaque image (autant de styles à recalculer
   et de calques à renvoyer à la carte graphique, 60 fois par seconde — et autant de mémoire, ce qui compte sur un iPhone).
   Maintenant, en combat : UNE toile (canvas) de la taille de la salle ; à chaque image, on y repeint les pièces (des images déjà
   prêtes) à leur place. Un seul calque, aucun style à recalculer ; la teinte (le givre, le feu, le soin) se peint sur la toile,
   sans filtre. On n'efface que le rectangle peint à l'image d'avant. */
var SCENE = [960, 372];
/* ⚠️ ESSAYÉ LE 15 NOVEMBRE, ET LAISSÉ ÉTEINT : sur la machine d'essai (sans carte graphique), la toile est DEUX FOIS PLUS LENTE que
   les pièces sur leurs calques (une toile se repeint et se renvoie en entier à chaque image ; les calques, eux, sont seulement
   déplacés). Sur une vieille tablette, ce serait pareil. LeoCorps.avecToile = true la rallume, pour comparer sur un vrai appareil. */
function LeoCorps_sansToile(){ return !(window.LeoCorps && window.LeoCorps.avecToile); }
function echelleToile(){
  var dpr = window.devicePixelRatio || 1, sc = Math.min(1.6, Math.max(.5, (window.innerWidth || 960) / 960));
  return Math.max(1, Math.min(2, dpr * sc));
}
CP._choisirToile = function(veut){
  var self = this, peut = !LeoCorps_sansToile() && Object.keys(P).every(function(n){ return !!IMG[n]; });
  var on = !!(veut && peut);
  if(on === this.surToile) return;
  this.surToile = on;
  if(on){
    if(!this.toile){
      var cv = this.toile = document.createElement('canvas'); cv.className = 'lc-toile';
      cv.style.left = (-this.ox) + 'px'; cv.style.top = (-this.oy) + 'px'; cv.style.width = SCENE[0] + 'px'; cv.style.height = SCENE[1] + 'px';
      cv.style.zIndex = '1';
      this.el.appendChild(cv);
    }
    this.kT = echelleToile();
    this.toile.width = Math.round(SCENE[0] * this.kT); this.toile.height = Math.round(SCENE[1] * this.kT);
    this.g = this.toile.getContext('2d');
    this.sale = null;
    this.toile.style.display = '';
  } else if(this.toile){
    /* (RAPIDITE.md, R9 : une toile qui ne sert plus est vidée) */
    this.toile.style.display = 'none'; this.toile.width = this.toile.height = 0; this.g = null;
    Object.keys(this.pieces).forEach(function(cle){ self.pieces[cle].tr = null; });
  }
  this.el.classList.toggle('lc-sur-toile', on);
};
var TEINTES = {gel:['#8fd8ff', .42], noirci:['#000', .78], feu:['#ff7a1a', .34], rouge:['#ff3a2a', .3], vert:['#7dff6a', .34]};
CP.teinter = function(nom){
  var T2 = this.teinteT = TEINTES[nom] || null, e = this.teinteEl;
  if(this.surToile){ e.style.opacity = '0'; this._ecrire(); return this; }
  this._bgT = T2 ? 'radial-gradient(closest-side,' + T2[0] + ' 0%,' + T2[0] + ' 40%,rgba(0,0,0,0) 100%)' : '';
  if(!this._flash) e.style.background = this._bgT;
  e.style.opacity = T2 ? String(nom === 'noirci' ? .8 : Math.min(.5, T2[1] + .08)) : '0';
  return this;
};
CP.flash = function(coul, ms){
  if(this.surToile){ this.flashFin = performance.now() + 320; return this; }
  var e = this.teinteEl, self = this, c = coul || '#fff', o = this.p;
  if(this._flash) return this;
  this._flash = true;
  try{
    e.style.background = 'radial-gradient(closest-side,' + c + ' 0%,' + c + ' 40%,rgba(255,255,255,0) 100%)';
    e.style.transform = 'translate(' + Math.round(o.x) + 'px,' + Math.round(Math.min(0, o.y)) + 'px)'; this._tt = null;
    var a = e.animate([{opacity:coul ? .7 : .85}, {opacity:0}], {duration:ms || 320, easing:'ease-out'});
    a.onfinish = a.oncancel = function(){ self._flash = false; e.style.background = self._bgT || ''; };
  }catch(x){ this._flash = false; }
  return this;
};
CP._peindre = function(){
  var g = this.g, k = this.kT, M = this.M, ox = this.ox, oy = this.oy, l = this.liste, i, q, m, b, s = this.sale;
  if(!g) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if(s) g.clearRect(s[0], s[1], s[2] - s[0], s[3] - s[1]);
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for(i = 0; i < l.length; i++){
    q = l[i]; m = M[q.cle] || M[q.os]; var im = IMG[q.nom];
    if(!m || !im) continue;
    b = q.b;
    var a = k * m[0], bb = k * m[1], c = k * m[2], d = k * m[3], e = k * (m[4] + ox), f = k * (m[5] + oy);
    g.setTransform(a, bb, c, d, e, f);
    g.drawImage(im, b[0], b[1], b[2], b[3]);
    /* le rectangle sali (les quatre coins de la pièce) */
    var X0 = b[0], Y0 = b[1], X1 = b[0] + b[2], Y1 = b[1] + b[3], px, py;
    px = a * X0 + c * Y0 + e; py = bb * X0 + d * Y0 + f; if(px < x0) x0 = px; if(px > x1) x1 = px; if(py < y0) y0 = py; if(py > y1) y1 = py;
    px = a * X1 + c * Y0 + e; py = bb * X1 + d * Y0 + f; if(px < x0) x0 = px; if(px > x1) x1 = px; if(py < y0) y0 = py; if(py > y1) y1 = py;
    px = a * X0 + c * Y1 + e; py = bb * X0 + d * Y1 + f; if(px < x0) x0 = px; if(px > x1) x1 = px; if(py < y0) y0 = py; if(py > y1) y1 = py;
    px = a * X1 + c * Y1 + e; py = bb * X1 + d * Y1 + f; if(px < x0) x0 = px; if(px > x1) x1 = px; if(py < y0) y0 = py; if(py > y1) y1 = py;
  }
  if(x1 < x0){ this.sale = null; return; }
  x0 = Math.max(0, Math.floor(x0) - 2); y0 = Math.max(0, Math.floor(y0) - 2); x1 = Math.min(this.toile.width, Math.ceil(x1) + 2); y1 = Math.min(this.toile.height, Math.ceil(y1) + 2);
  this.sale = [x0, y0, x1, y1];
  /* la teinte et l'éclair : peints par-dessus Léo, seulement là où il est (pas de filtre) */
  var T2 = this.teinteT, fl = this.flashFin ? Math.max(0, (this.flashFin - performance.now()) / 320) : 0;
  if(!fl) this.flashFin = 0;
  if((T2 || fl) && x1 > x0 && y1 > y0){
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    if(T2){ g.globalAlpha = T2[1]; g.fillStyle = T2[0]; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    if(fl){ g.globalAlpha = Math.min(.85, fl * .85); g.fillStyle = '#fff'; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
};
CP.visage = function(v){ if(V[v] && v !== this.etat.visage){ this.etat.visage = v; this._maj(); } return this; };
/* la forme : 2 = Léo torse nu ; 3 = sous la potion (plus grand, le haut du corps plus large, la peau rougie, les veines vertes) */
CP.forme = function(n){
  var self = this, E = this.etat; n = n === 3 ? 3 : 2;
  if(E.forme === n) return this;
  E.forme = n; this.ech = n === 3 ? .98 : .94;
  Object.keys(this.pieces).forEach(function(cle){ var q = self.pieces[cle], u = n === 3 ? CUIT3[q.nom] : CUIT[q.nom]; if(q.im && u && CUIT3[q.nom]) q.im.src = u; q.tr = null; });
  if(n !== 3) E.plaies = 0;
  this._maj(); this._os(this.p); this._ecrire();
  return this;
};
/* les entailles de la faux (0 à 3) */
CP.plaies = function(n){ n = Math.max(0, Math.min(3, n | 0)); if(this.etat.plaies !== n){ this.etat.plaies = n; this._maj(); } return this; };
CP.objet = function(nom, ou){ if(this.etat[nom] !== ou){ this.etat[nom] = ou; this._maj(); } return this; };
CP.main = function(cote, forme){ if(this.etat.main[cote] !== forme){ this.etat.main[cote] = forme; this._maj(); } return this; };
CP.devantAr = function(on){ on = !!on; if(this.etat.devantAr !== on){ this.etat.devantAr = on; this._maj(); } return this; };
CP.habits = function(o){ var E = this.etat; ['capuche', 'tunique', 'cape'].forEach(function(k){ if(o && o[k] != null) E[k] = !!o[k]; }); this._maj(); return this; };

/* ---------- les os : toutes les matrices de la pose ---------- */
CP._os = function(p){
  var M = this.M, ech = this.ech, t = this.temps;
  var resp = Math.sin(t * 2.2) * p.souffle;                                     /* il respire (la poitrine monte, les épaules suivent) */
  var racine = mul(T(p.x, Math.min(0, p.y)), mul(R(-p.r, 150, PIED - 6), S(ech, 150, PIED)));
  M.racine = racine;
  var bas = Math.max(0, p.bas) + Math.max(0, p.y) + resp * .8;
  var Lb = mul(T(0, bas), R(-p.bassin, SQ.HC[0], SQ.HC[1]));               /* le bassin, dans le repère de la racine */
  M.bassin = mul(racine, Lb);
  var Lt = mul(Lb, mul(R(-p.torse, SQ.HC[0], SQ.HC[1]), T(0, -resp * .6)));
  M.torse = mul(racine, Lt);
  if(this.etat.forme === 3) M.torse = mul(M.torse, S(1.07, SQ.HC[0], SQ.HC[1]));          /* (sous la potion : le haut du corps plus large) */
  M.tete = mul(M.torse, R(-p.tete + resp * .5, SQ.COU[0], SQ.COU[1]));
  /* les bras (dans le repère du buste) : celui de devant d'abord, puis la faux qu'il tient, puis celui de derrière (qui peut
     tenir la faux, lui aussi, par sa poignée du milieu : deux mains) */
  var self = this, iT = null;
  function bras(s, cible){
    var E = SQ['E' + s], K = SQ['K' + s], Pp = SQ['P' + s], a;
    var m = cible || p['m' + s];
    if(m){ var ik2 = ik(E, m, SQ.BRAS, SQ.AVANT, -1); a = [ik2[0], ik2[1] - ik2[0], m[2] || 0]; }
    else a = p['b' + s] || [0, 0, 0];
    M['bras' + s] = mul(M.torse, R(a[0], E[0], E[1]));
    M['avant' + s] = mul(M['bras' + s], R(a[1], K[0], K[1]));
    M['main' + s] = mul(M['avant' + s], R(a[2] || 0, Pp[0], Pp[1]));
  }
  bras('Av');
  /* (la faux et la gourde gardent l'angle qu'on leur donne par rapport au buste, quel que soit le poignet) */
  var lin = [M.torse[0], M.torse[1], M.torse[2], M.torse[3], 0, 0];
  function enMain(dx, dy, ang, apres){ var w = ap(M.mainAv, SQ.PAv[0] + dx, SQ.PAv[1] + dy); return mul(T(w[0], w[1]), mul(lin, mul(R(ang || 0), apres || [1, 0, 0, 1, 0, 0]))); }
  M['faux@main'] = enMain(0, 14, p.fa, T(0, -(p.fg || 0)));
  var prise = null;
  if(p.deux > .01){
    /* la poignée du milieu de la faux, ramenée dans le repère du buste au repos : c'est là que va le poignet de derrière */
    iT = inv(M.torse);
    var g = ap(M['faux@main'], -6, 62), gl = ap(iT, g[0], g[1]);
    gl = [gl[0] + 2, gl[1] - 16];
    if(p.deux < .99){
      bras('Ar');
      var w = ap(M.mainAr, SQ.PAr[0], SQ.PAr[1]), wl = ap(iT, w[0], w[1]);
      gl = [wl[0] + (gl[0] - wl[0]) * p.deux, wl[1] + (gl[1] - wl[1]) * p.deux];
    }
    prise = gl;
  }
  bras('Ar', prise);
  /* les jambes (dans le repère de la racine : les pieds restent où on les pose) */
  ['Av', 'Ar'].forEach(function(s){
    var Hh = SQ['H' + s], G = SQ['G' + s], Ch = SQ['C' + s], hip = ap(Lb, Hh[0], Hh[1]), a1, a2;
    if(p['j' + s]){ a1 = p['j' + s][0] - p.bassin; a2 = a1 - p['j' + s][1]; }
    else { var cible = p['p' + s] || [Hh[0], PIED - SQ.SEMELLE]; var r = ik(hip, [cible[0], cible[1] - Math.min(0, 0)], SQ.CUISSE, SQ.TIBIA, 1); a1 = r[0]; a2 = r[1]; }
    var gen = [hip[0] - Math.sin(a1 / DEG) * SQ.CUISSE, hip[1] + Math.cos(a1 / DEG) * SQ.CUISSE];
    var che = [gen[0] - Math.sin(a2 / DEG) * SQ.TIBIA, gen[1] + Math.cos(a2 / DEG) * SQ.TIBIA];
    M['cuisse' + s] = mul(racine, mul(T(hip[0] - Hh[0], hip[1] - Hh[1]), R(a1, Hh[0], Hh[1])));
    M['tibia' + s] = mul(racine, mul(T(gen[0] - G[0], gen[1] - G[1]), R(a2, G[0], G[1])));
    M['pied' + s] = mul(racine, mul(T(che[0] - Ch[0], che[1] - Ch[1]), R(-(p['pied' + s] || 0), Ch[0], Ch[1])));
  });
  /* le sac à rats gigote (un rat dedans) */
  M.sac = mul(M.bassin, R(Math.sin(t * 5.3) * 4 + Math.sin(t * 13) * 1.5, 196, 200));
  /* les objets : la faux (dans le dos, ou dans la main de devant), la gourde (à la ceinture, ou dans la main), le sifflet, le rat */
  var X = this.extras;
  M['faux@dos'] = mul(M.torse, mul(T(128, 216), R(206)));
  M['gourde@ceinture'] = mul(M.bassin, mul(T(180, 236), mul(R(-14 + Math.sin(t * 3) * 3), S(1.2, 0, 0))));
  M['bouchon@ceinture'] = M['gourde@ceinture'];
  /* (la gourde : son poing tient le goulot ; elle est un peu plus grosse que nature, pour qu'on la voie bien) */
  M['gourde@main'] = enMain(-4, 16, p.ga, mul(S(1.3, 0, 0), T(0, 26 - 50 * (p.gp || 0))));
  M['bouchon@main'] = M['gourde@main'];
  M.sifflet = mul(M.mainAv, mul(T(SQ.PAv[0] - 20, SQ.PAv[1] + 18), R(-30)));
  /* le rat pend par la queue, quelle que soit la main (il ne tourne qu'avec ra) */
  var qr = ap(M.mainAv, SQ.PAv[0] - 2, SQ.PAv[1] + 14);
  M.rat = mul(T(qr[0], qr[1]), mul(R((p.ra || 0) + Math.sin(t * 9) * 6), S(ech, 0, 0)));
};
CP._ecrire = function(){
  var M = this.M, self = this;
  if(this.surToile) this._peindre();
  else Object.keys(this.pieces).forEach(function(cle){
    var q = self.pieces[cle]; if(!q.vu) return;
    var m = M[cle] || M[q.os]; if(!m) return;
    /* (on n'écrit que ce qui a VRAIMENT bougé : une pièce immobile ne coûte rien. 15 novembre : au repos, Léo respire et se balance
       tout doucement — moins d'un tiers de point par image ; ses pièces ne sont réécrites que lorsqu'elles ont bougé d'au moins
       un tiers de point, ou tourné d'un quart de degré : six à dix fois moins d'écritures, et l'œil ne voit pas la différence.
       Dès qu'il bouge pour de bon, chaque image est écrite.) */
    var w = q.w;
    if(w && q.tr && Math.abs(m[4] - w[4]) < .34 && Math.abs(m[5] - w[5]) < .34 && Math.abs(m[0] - w[0]) < .0045 && Math.abs(m[1] - w[1]) < .0045 && Math.abs(m[2] - w[2]) < .0045 && Math.abs(m[3] - w[3]) < .0045) return;
    var tr = 'matrix(' + m[0].toFixed(3) + ',' + m[1].toFixed(3) + ',' + m[2].toFixed(3) + ',' + m[3].toFixed(3) + ',' + m[4].toFixed(1) + ',' + m[5].toFixed(1) + ')';
    if(tr !== q.tr){ q.tr = tr; q.w = [m[0], m[1], m[2], m[3], m[4], m[5]]; q.el.style.transform = tr; }
  });
  /* l'ombre au sol : plus petite quand il saute */
  /* (15 novembre : l'ombre a son propre calque et n'est réécrite que si elle a bougé d'un demi-point — au repos, plus jamais) */
  var o = this.p, sx = Math.max(.25, (1 - Math.max(0, -o.y) / 260) * (o.ombre || 1));
  var to = 'translate(' + (Math.round(o.x * 2) / 2) + 'px,0) scale(' + sx.toFixed(2) + ',' + sx.toFixed(2) + ')';
  if(to !== this._to){ this._to = to; this.ombreEl.style.transform = to; var op = Math.max(.2, Math.min(1, sx)).toFixed(1); if(op !== this._op){ this._op = op; this.ombreEl.style.opacity = op; } }
  if(this.teinteT && !this.surToile){ var tt = 'translate(' + Math.round(o.x) + 'px,' + Math.round(Math.min(0, o.y)) + 'px)'; if(tt !== this._tt){ this._tt = tt; this.teinteEl.style.transform = tt; } }
  if(this.etat.cape) this._cape();
};
/* la cape : ses coins du haut suivent les épaules (le buste), son ourlet traîne au sol */
CP._cape = function(){
  var M = this.M, A = ap(M.torse, 96, 124), B = ap(M.torse, 206, 126), t = this.temps, v = Math.sin(t * 1.7) * 4, sol = PIED - 2;
  var mx = (A[0] + B[0]) / 2, bl = [Math.min(A[0] - 30, mx - 92) + v, sol], br = [Math.max(B[0] + 40, mx + 98) + v * .8, sol];
  function n(q){ return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
  var d = 'M' + n(A) + ' C' + n([A[0] - 24, A[1] + 70]) + ' ' + n([bl[0] + 6, bl[1] - 60]) + ' ' + n(bl) + ' C' + n([bl[0] + 40, sol + 10]) + ' ' + n([br[0] - 44, sol + 10]) + ' ' + n(br) +
    ' C' + n([br[0] - 8, br[1] - 60]) + ' ' + n([B[0] + 30, B[1] + 70]) + ' ' + n(B) + ' Z';
  this.capeEl.querySelector('.lc-cape-f').setAttribute('d', d);
  this.capeEl.querySelector('.lc-cape-p').setAttribute('d', 'M' + n([(A[0] + bl[0]) / 2 + 8, (A[1] + sol) / 2]) + ' Q' + n([bl[0] + 30, sol - 30]) + ' ' + n([bl[0] + 34, sol - 2]) + ' M' + n([mx, (A[1] + sol) / 2 + 30]) + ' L' + n([mx + v, sol - 2]) + ' M' + n([(B[0] + br[0]) / 2 - 8, (B[1] + sol) / 2]) + ' Q' + n([br[0] - 26, sol - 30]) + ' ' + n([br[0] - 30, sol - 2]));
};
CP.poser = function(pose){
  this.duree = 0; if(this.fin){ var f0 = this.fin; this.fin = null; f0(); }
  this.p = pose && pose._c ? pose : complete(pose);
  this._os(this.p); this._ecrire();
  return this;
};
/* une pose qui glisse vers une autre (les cinématiques) */
var COURBES = {
  lin:function(t){ return t; }, o:function(t){ return 1 - Math.pow(1 - t, 3); }, i:function(t){ return t * t * t; },
  io:function(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  b:function(t){ var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
};
CP.vers = function(pose, ms, courbe){
  var self = this;
  if(this.fin){ var f0 = this.fin; this.fin = null; f0(); }
  this.de = this.p; this.a = complete(pose); this.t = 0; this.duree = Math.max(1, ms || 1) / 1000; this.courbe = COURBES[courbe || 'io'] || COURBES.io;
  return new Promise(function(ok){ self.fin = ok; });
};
CP.suite = function(l){ var self = this, pr = Promise.resolve(); l.forEach(function(x){ pr = pr.then(function(){ return self.vers(x[0], x[1], x[2]); }); }); return pr; };
CP.avancer = function(dt){
  this.temps += dt;
  if(this.duree > 0){
    this.t += dt;
    var k = Math.min(1, this.t / this.duree);
    this.p = melange(this.de, this.a, this.courbe(k));
    if(k >= 1){ this.duree = 0; this.p = this.a; if(this.fin){ var f = this.fin; this.fin = null; f(); } }
  }
  this._os(this.p); this._ecrire();
};
CP.enMouvement = function(){ return this.duree > 0; };
/* un point d'un os, dans les mesures du pantin (300 × 340) */
CP.point = function(os, x, y){ var m = this.M[os]; if(!m) return {x:x, y:y}; var q = ap(m, x, y); return {x:q[0], y:q[1]}; };
CP.arreter = function(){ this.duree = 0; if(this.fin){ var f = this.fin; this.fin = null; f(); } };

window.LeoCorps = {
  creer:function(parent, o){ return new Corps(parent, o); },
  preparer:preparer, cuit:function(){ return Object.keys(CUIT).length; },
  POSES:POSES, GARDE:GARDE, SQ:SQ, DESSINS:P, ORDRE:ORDRE, complete:complete, melange:melange, ik:ik, R:R, T:T, mul:mul, ap:ap, inv:inv, svgPiece:svgPiece, DEFS:DEFS, W:W, H:H, PIED:PIED
};
})();
