/* plateau.js — le souterrain de Léo, en vraie profondeur (des plans en 3D, CSS), et la caméra.
   Le monde : x vers la droite, y vers le BAS (le sol est en y = 0), z vers la caméra. Léo est en (0, 0, 0), face à nous.
   Le mur du fond est en z = −900 ; à droite, dans ce mur, une grande arche et l'escalier qui monte vers le village
   (c'est par là que le maire descend, dans la fin).

   Deux couches : le décor (des plans texturés, posés en 3D par le navigateur) et, par-dessus, les personnages, les torches, les
   lumières et la poussière, dessinés en SVG à leur place projetée (CAM.projeter) — net à tous les zooms.
   La profondeur de champ : chaque plan est flouté selon sa distance au point net de la caméra (CAM.flou). */
(function(){
'use strict';
var U = window.CU, T = window.CT;
var W = 1440, H = 616;
var P = 1600;                         /* la focale (la perspective CSS) : un objectif un peu long, comme au cinéma */
var MUR_Z = -900, MUR_X0 = -1600, MUR_X1 = 2800, MUR_H = 1300, PROCHE = 1400;
var ARCHE = {x0:1450, x1:2150, h:1000};
var MARCHES = 13, PAS_Z = 62, PAS_Y = 40;
var FOND_Z = MUR_Z - MARCHES * PAS_Z - 140, CAGE_Z = (MUR_Z + FOND_Z) / 2;
var TORCHES = [[-450, -620, MUR_Z + 14], [450, -620, MUR_Z + 14], [1300, -640, MUR_Z + 14], [2300, -640, MUR_Z + 14],
               [ARCHE.x0 + 14, -800, CAGE_Z], [ARCHE.x1 - 14, -800, CAGE_Z], [MUR_X1 - 16, -640, -150], [MUR_X1 - 16, -640, 650]];

var CAM = window.CAM = {x:0, y:-300, z:1800, lacet:0, tangage:0, focus:1800, ouverture:1, W:W, H:H, P:P};

/* où tombe un point du monde sur l'écran (la même mathématique que le CSS) ; s = l'échelle à cette distance */
CAM.vue = function(x, y, z){
  var c = CAM, vx = x - c.x, vy = y - c.y, vz = z - c.z;
  var cl = Math.cos(c.lacet), sl = Math.sin(c.lacet), ct = Math.cos(c.tangage), st = Math.sin(c.tangage);
  var x1 = vx * cl + vz * sl, z1 = -vx * sl + vz * cl;
  var y2 = vy * ct - z1 * st, z2 = vy * st + z1 * ct;
  return {x:x1, y:y2, z:z2};
};
CAM.projeter = function(x, y, z){
  var v = CAM.vue(x, y, z), d = -v.z;
  if(d < 5) d = 5;
  var s = P / d;
  return {x:W / 2 + v.x * s, y:H / 2 + v.y * s, s:s, d:d};
};
/* le flou (en pixels d'écran) d'une chose à la distance d : nul au point net */
CAM.flou = function(d){
  var k = 21000 * CAM.ouverture * Math.abs(1 / CAM.focus - 1 / Math.max(d, 10));
  return U.clamp(k, 0, 46);
};
CAM.transformCSS = function(){
  var c = CAM;
  return 'translateZ(' + P + 'px) rotateX(' + U.r(U.deg(c.tangage)) + 'deg) rotateY(' + U.r(U.deg(c.lacet)) + 'deg) translate3d(' + U.r(-c.x) + 'px,' + U.r(-c.y) + 'px,' + U.r(-c.z) + 'px)';
};

/* ====================================================================== LE DÉCOR (construit une fois) */
var PL = [];                          /* les plans : {el, cx, cy, cz (leur milieu, pour le flou)} */
function plan(parent, url, w, h, tr, milieu, o){
  var d = document.createElement('div');
  d.className = 'pl';
  d.style.cssText = 'position:absolute;left:0;top:0;width:' + w + 'px;height:' + h + 'px;transform-origin:0 0;transform:' + tr + ';backface-visibility:hidden;' +
    (url ? 'background-image:url(' + url + ');background-size:' + (o && o.bs ? o.bs : '100% 100%') + ';' + (o && o.bp ? 'background-position:' + o.bp + ';' : '') : '') + (o && o.css ? o.css : '');
  parent.appendChild(d);
  PL.push({el:d, m:milieu, flouMax:o && o.flouMax});
  return d;
}
var PLATEAU = window.PLATEAU = {TORCHES:TORCHES, ARCHE:ARCHE, MUR_Z:MUR_Z, MARCHES:MARCHES, PAS_Z:PAS_Z, PAS_Y:PAS_Y};

PLATEAU.construire = function(racine){
  var vue = document.createElement('div');
  vue.id = 'vue3d';
  vue.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;perspective:' + P + 'px;perspective-origin:50% 50%;overflow:hidden;background:#050407';
  var monde = document.createElement('div');
  monde.id = 'monde';
  monde.style.cssText = 'position:absolute;left:' + W / 2 + 'px;top:' + H / 2 + 'px;width:0;height:0;transform-style:preserve-3d';
  vue.appendChild(monde); racine.appendChild(vue);
  PLATEAU.monde = monde;

  /* le mur du fond, avec la grande arche */
  var mw = MUR_X1 - MUR_X0;
  var mur = T.mur({w:mw, h:MUR_H, graine:7, torches:TORCHES.filter(function(t){ return t[2] > MUR_Z; }).map(function(t){ return [t[0] - MUR_X0, MUR_H + t[1]]; }),
    arche:{x:ARCHE.x0 - MUR_X0, w:ARCHE.x1 - ARCHE.x0, h:ARCHE.h}});
  plan(monde, mur.toDataURL(), mw, MUR_H, 'translate3d(' + MUR_X0 + 'px,' + (-MUR_H) + 'px,' + MUR_Z + 'px)', [600, -500, MUR_Z]);

  /* le sol, en bandes (le flou change avec la distance) */
  var sd = PROCHE - (-1900), sol = T.sol({w:mw, d:sd, graine:5, echelle:.55,
    farine:[[1600 - 300, 1900 + MUR_Z + 260, 260], [1600 + 120, 1900 + 60, 300], [1600 - 900, 1900 + MUR_Z + 200, 200]],
    paille:[[1600 - 700, 1900 + MUR_Z + 160, 160, 260], [1600 + 600, 1900 + MUR_Z + 120, 120, 200], [1600 - 60, 1900 + 40, 60, 300]],
    lumieres:TORCHES.filter(function(t){ return t[2] > MUR_Z; }).map(function(t){ return [t[0] - MUR_X0, 1900 + MUR_Z + 30, 520, .4]; })
      .concat([[ARCHE.x0 - MUR_X0 + 350, 1900 + MUR_Z - 300, 500, .25]])}).toDataURL();
  var bandes = 9, bz = sd / bandes;
  for(var b = 0; b < bandes; b++){
    var z0 = -1900 + b * bz;
    plan(monde, sol, mw, bz + 2, 'translate3d(' + MUR_X0 + 'px,0px,' + (z0 - 1) + 'px) rotateX(90deg)', [600, 0, z0 + bz / 2],
      {bs:mw + 'px ' + sd + 'px', bp:'0px ' + (-(b * bz)) + 'px'});
  }
  /* les murs de côté (à peine vus, ils ferment la salle) */
  var cote = T.mur({w:PROCHE - MUR_Z, h:MUR_H, graine:21, torches:[]}).toDataURL();
  plan(monde, cote, PROCHE - MUR_Z, MUR_H, 'translate3d(' + MUR_X0 + 'px,' + (-MUR_H) + 'px,' + PROCHE + 'px) rotateY(90deg)', [MUR_X0, -500, 200]);
  var coteD = T.mur({w:PROCHE - MUR_Z, h:MUR_H, graine:23, torches:[[-150 - MUR_Z, MUR_H - 640], [650 - MUR_Z, MUR_H - 640]]}).toDataURL();
  plan(monde, coteD, PROCHE - MUR_Z, MUR_H, 'translate3d(' + MUR_X1 + 'px,' + (-MUR_H) + 'px,' + MUR_Z + 'px) rotateY(-90deg)', [MUR_X1, -500, 200]);

  /* L'ESCALIER, derrière l'arche : les marches montent en s'éloignant ; deux murs de côté ; en haut, une porte noire */
  var aw = ARCHE.x1 - ARCHE.x0, fondZ = FOND_Z;
  var pierreMarche = T.mur({w:aw, h:PAS_Y * 3, graine:31, torches:[]}).toDataURL();
  var dessus = T.sol({w:aw, d:PAS_Z * 2, graine:33, echelle:1}).toDataURL();
  for(var i = 0; i < MARCHES; i++){
    var zf = MUR_Z - i * PAS_Z, yh = -PAS_Y * (i + 1);
    /* la contremarche (face à nous) */
    plan(monde, pierreMarche, aw, PAS_Y, 'translate3d(' + ARCHE.x0 + 'px,' + yh + 'px,' + zf + 'px)', [ARCHE.x0 + aw / 2, yh, zf], {bs:aw + 'px ' + (PAS_Y * 3) + 'px', css:'filter:brightness(' + (1.25 - i * .03) + ')'});
    /* le dessus de la marche */
    plan(monde, dessus, aw, PAS_Z, 'translate3d(' + ARCHE.x0 + 'px,' + yh + 'px,' + (zf - PAS_Z) + 'px) rotateX(90deg)', [ARCHE.x0 + aw / 2, yh, zf - PAS_Z / 2], {css:'filter:brightness(' + (1.35 - i * .035) + ')'});
  }
  /* le palier du haut */
  plan(monde, dessus, aw, 142, 'translate3d(' + ARCHE.x0 + 'px,' + (-PAS_Y * MARCHES) + 'px,' + FOND_Z + 'px) rotateX(90deg)', [ARCHE.x0 + aw / 2, -PAS_Y * MARCHES, fondZ], {css:'filter:brightness(.4)'});
  var lc = MUR_Z - fondZ + 10;
  var cage = T.mur({w:lc, h:MUR_H, graine:41, torches:[[lc / 2, MUR_H - 800]]}).toDataURL();
  plan(monde, cage, lc, MUR_H, 'translate3d(' + ARCHE.x0 + 'px,' + (-MUR_H) + 'px,' + (MUR_Z + 2) + 'px) rotateY(90deg)', [ARCHE.x0, -500, (MUR_Z + fondZ) / 2]);
  plan(monde, cage, lc, MUR_H, 'translate3d(' + ARCHE.x1 + 'px,' + (-MUR_H) + 'px,' + fondZ + 'px) rotateY(-90deg)', [ARCHE.x1, -500, (MUR_Z + fondZ) / 2]);
  /* le mur du haut de l'escalier, avec sa porte noire (le maire en sortira, sa lanterne d'abord) */
  var fond = T.mur({w:aw, h:MUR_H, graine:47, torches:[], arche:{x:aw / 2 - 150, w:300, h:560 + 500}}).toDataURL();
  plan(monde, fond, aw, MUR_H, 'translate3d(' + ARCHE.x0 + 'px,' + (-MUR_H) + 'px,' + fondZ + 'px)', [ARCHE.x0 + aw / 2, -700, fondZ], {css:'filter:brightness(.55)'});
  PLATEAU.fondZ = fondZ;
};

/* à chaque image : la caméra, et le flou de chaque plan selon sa distance */
PLATEAU.image = function(){
  PLATEAU.monde.style.transform = CAM.transformCSS();
  PL.forEach(function(p){
    var pr = CAM.projeter(p.m[0], p.m[1], p.m[2]), f = CAM.flou(pr.d);
    /* le flou CSS est appliqué AVANT la perspective : on le ramène en unités du plan */
    var loc = f / Math.max(pr.s, .05);
    var base = p.el.style.filter.replace(/blur\([^)]*\)/, '').trim();
    p.el.style.filter = (base + (loc > .3 ? ' blur(' + U.r(loc) + 'px)' : '')).trim();
  });
};

/* la marche n (0 = la plus basse) : où poser le pied (le milieu de son dessus) */
PLATEAU.marche = function(n){
  return {y:-PAS_Y * (n + 1), z:MUR_Z - n * PAS_Z - PAS_Z / 2};
};
})();
