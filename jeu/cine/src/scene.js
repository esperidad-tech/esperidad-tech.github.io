/* scene.js — monter UNE image d'un film : la caméra, le décor, les personnages, les lumières, la poussière.
   CINE.image(nom, t) : le film « nom » à l'instant t (en secondes). Les films (films.js) ne décrivent que ce qui change. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX;
var CINE = window.CINE = {films:{}, pret:false};
var W = 1440, H = 616;

/* LES PLATEAUX : le souterrain de Léo (plateau.js, celui de toujours) et le Vieux Chêne, la nuit, dehors (plateau-chene.js :
   le film le demande par « plateau:'chene' »). Chacun est construit la première fois qu'un film en a besoin ; un seul est montré. */
var PLT = null;
CINE.plateau = function(){ return PLT; };
CINE.preparer = function(nom){
  var P = nom === 'chene' ? window.PLATEAU_CHENE : nom === 'village' ? window.PLATEAU_VILLAGE : window.PLATEAU;
  if(!P.pret){
    P.construire(document.getElementById('film'));
    /* le décor passe sous les dessins */
    var f = document.getElementById('film'); f.insertBefore(P.vue, f.firstChild);
    P.pret = true;
  }
  if(PLT !== P){ [window.PLATEAU, window.PLATEAU_CHENE, window.PLATEAU_VILLAGE].forEach(function(q){ if(q && q.vue) q.vue.style.display = q === P ? '' : 'none'; }); PLT = P; }
  CINE.pret = true;
};

/* la lumière sur un personnage : le relief (sa silhouette floutée sert de carte des hauteurs) éclairé par une lumière placée
   à l'écran (la torche, la lanterne) ; et un liseré chaud sur le bord tourné vers les torches. */
function filtreLumiere(id, l){
  var lx = l.x, ly = l.y, lz = l.z || 220, coul = l.c || '#ffe2b8', force = l.k == null ? 1 : l.k, flouH = l.h || 5;
  var rims = l.rims || [];
  var f = '<filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
    '<feGaussianBlur in="SourceAlpha" stdDeviation="' + flouH + '" result="h"/>' +
    '<feDiffuseLighting in="h" surfaceScale="' + (7 * force) + '" diffuseConstant="' + (l.dc || 1.05) + '" lighting-color="' + coul + '" result="d"><fePointLight x="' + U.r(lx) + '" y="' + U.r(ly) + '" z="' + U.r(lz) + '"/></feDiffuseLighting>' +
    '<feComposite in="d" in2="SourceAlpha" operator="in" result="d2"/>' +
    '<feBlend in="SourceGraphic" in2="d2" mode="multiply" result="o0"/>';
  var der = 'o0';
  rims.forEach(function(r, k){
    f += '<feSpecularLighting in="h" surfaceScale="' + (6 * force) + '" specularConstant="' + (r.k || .7) + '" specularExponent="' + (r.e || 14) + '" lighting-color="' + (r.c || '#ffa04a') + '" result="s' + k + '"><fePointLight x="' + U.r(r.x) + '" y="' + U.r(r.y) + '" z="' + U.r(r.z) + '"/></feSpecularLighting>' +
      '<feComposite in="s' + k + '" in2="SourceAlpha" operator="in" result="t' + k + '"/>' +
      '<feComposite in="' + der + '" in2="t' + k + '" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="o' + (k + 1) + '"/>';
    der = 'o' + (k + 1);
  });
  return f + '</filter>';
}

/* l'ombre au sol d'un personnage : une ellipse sombre, projetée sur le sol */
function ombre(x, z, rx, rz, op){
  var c = CAM.projeter(x, 0, z), a = CAM.projeter(x + rx, 0, z), b = CAM.projeter(x, 0, z + rz), b2 = CAM.projeter(x, 0, z - rz);
  var ry = Math.abs(b.y - b2.y) / 2;
  return '<ellipse cx="' + U.r(c.x) + '" cy="' + U.r(c.y) + '" rx="' + U.r(Math.abs(a.x - c.x)) + '" ry="' + U.r(Math.max(2, ry)) + '" fill="url(#ombreSol)" opacity="' + U.r(op == null ? .8 : op) + '"/>';
}

/* un acteur : {type:'leo'|'maire'|'silas'|'garde', x, z, pose, o, lum:{…}} */
function acteur(a, k, defs){
  var p = CAM.projeter(a.x, a.y || 0, a.z);
  /* un acteur « libre » : un dessin que le film fait lui-même (la fumée, un rocher, une barrière…), rangé en profondeur avec les
     personnages ; a.dessin(p, defs) rend du SVG à l'écran (p : sa place projetée) ; a.flou === false : il gère son flou lui-même */
  if(a.type === 'libre'){
    if(p.d < (a.pres || 5)) return '';
    a.proj = p;
    if(a.boite && (p.x + a.boite[0] * p.s < -80 || p.x - a.boite[0] * p.s > 1520 || p.y - a.boite[1] * p.s > 700 || p.y + 60 * p.s < -80)) return '';
    var d0 = a.dessin(p, defs) || '';
    return a.flou === false || !d0 ? d0 : FX.flouDebut(CAM.flou(p.d) + (a.flouPlus || 0)) + d0 + FX.flouFin();
  }
  if(p.d < 40) return '';
  /* (le plateau du chêne) un personnage entièrement hors de l'image n'est pas dessiné */
  if(FX.ecran && (p.x + 420 * p.s < -80 || p.x - 420 * p.s > 1520 || p.y - 760 * p.s > 700 || p.y + 40 * p.s < -80)) return '';
  var dessin = a.type === 'leo' ? LeoFace.dessin(a.pose, a.o) : Gens.dessin(a.type, a.pose, a.o);
  a.os = a.type === 'leo' ? LeoFace.dernier.os : Gens.dernier.os; a.proj = p;
  /* (le plateau du village, Bible §13.69) LES MATIÈRES : chaque pièce d'habit, la peau, les cheveux reçoivent leur grain (la laine, le lin,
     le cuir…), posé dans le repère de la pièce — il suit le bras qui bouge (effets-village.js, FV.texturer) */
  if(FX.village && window.CFXV && a.matieres !== false) dessin = window.CFXV.texturer(dessin);
  var f = CAM.flou(p.d) + (a.flouPlus || 0), id = 'lum' + k;
  var l = a.lum || {};
  /* la lumière, à l'écran : par défaut, devant lui, un peu à gauche et au-dessus (la lanterne des héros, derrière la caméra) */
  var lp = l.monde ? CAM.projeter(l.monde[0], l.monde[1], l.monde[2]) : {x:p.x + (l.dx == null ? -260 : l.dx) * p.s, y:p.y + (l.dy == null ? -560 : l.dy) * p.s};
  var rp = l.rimMonde ? CAM.projeter(l.rimMonde[0], l.rimMonde[1], l.rimMonde[2]) : {x:p.x + (l.rdx == null ? 300 : l.rdx) * p.s, y:p.y + (l.rdy == null ? -700 : l.rdy) * p.s};
  /* deux liserés chauds : les torches, derrière et sur les côtés ; ils dansent avec les flammes */
  var fl = FX.lueur(window.CINE_T || 0, 1) * (FX.flare || 1);
  var rims = (l.rims || [[-1, -.9], [1, -.9]]).map(function(r){ return {x:p.x + r[0] * 420 * p.s, y:p.y + r[1] * 600 * p.s, z:70 * Math.max(.5, p.s), k:(r[2] || .75) * fl, c:r[3]}; });
  if(l.rimsEcran) rims = rims.concat(l.rimsEcran(p));
  defs.push(filtreLumiere(id, {x:lp.x, y:lp.y, z:(l.z || 170) * Math.max(.4, p.s), c:l.c, k:l.k, dc:l.dc, h:Math.max(2, 7 * p.s), rims:rims}));
  var s = '';
  if(a.ombre !== false) s += ombre(a.x, a.z, (a.ombreR || 150) * (a.ombreK || 1), 60, a.ombreOp);
  /* (le plateau du village) L'OMBRE LONGUE du soleil bas : la silhouette du personnage, couchée sur le sol — a.ombreLongue = {vx, vz (où elle
     tombe, pour une hauteur de 1), op, flou} */
  if(FX.village && a.ombreLongue){
    var ol = a.ombreLongue, q1 = CAM.projeter(a.x + ol.vx * 100, 0, a.z + ol.vz * 100), q0 = CAM.projeter(a.x, 0, a.z), ech = p.s * (a.echelle || 1);
    s += '<g style="filter:blur(' + U.r((ol.flou == null ? 5 : ol.flou) * Math.max(.3, p.s) + f * .5) + 'px)" opacity="' + U.r(ol.op == null ? .42 : ol.op) + '"><g filter="url(#ombreNoire)"><g transform="matrix(' + U.r(ech) + ' 0 ' + U.r(-(q1.x - q0.x) / 100) + ' ' + U.r(-(q1.y - q0.y) / 100) + ' ' + U.r(q0.x) + ' ' + U.r(q0.y) + ')">' + dessin + '</g></g></g>';
  }
  if(a.dessous) s += a.dessous(p);
  s += (PLT === PLATEAU && a.z < PLATEAU.MUR_Z - 4 ? '<g clip-path="url(#archeVue)">' : FX.ecran ? '<g class="ac" data-f="' + U.r(f) + '">' : '<g>') + FX.flouDebut(f) + '<g filter="url(#' + id + ')"' + (a.op != null ? ' opacity="' + U.r(a.op) + '"' : '') + '><g transform="translate(' + U.r(p.x) + ' ' + U.r(p.y) + ') scale(' + U.r(p.s * (a.echelle || 1)) + ')">' + dessin + (a.plus ? a.plus(p) : '') + '</g></g>' + FX.flouFin() + '</g>';
  return s;
}

/* ---------------------------------------------------------------- UNE IMAGE */
CINE.image = function(nom, t){
  var F = CINE.films[nom];
  /* les films en 2D, faits de calques peints (multiplan.js : les deux descentes du donjon) : un autre banc, rien du décor en 3D */
  var calques = ['vue3d', 'vueChene', 'persos', 'lumap', 'lumieres', 'avant', 'voile'];
  if(F.rendu === 'multiplan'){
    [].forEach.call(document.getElementById('film').children, function(e){ if(e.id !== 'mp' && e.tagName !== 'svg' || calques.indexOf(e.id) >= 0) e.style.visibility = 'hidden'; });
    window.MP.montrer(); window.CINE_T = t;
    return window.MP.image(F, t);
  }
  if(window.MP){ window.MP.cacher(); [].forEach.call(document.getElementById('film').children, function(e){ e.style.visibility = ''; }); }
  CINE.preparer(F.plateau);
  window.CINE_T = t;
  var crypte = PLT === window.PLATEAU;
  FX.ecran = !crypte;
  FX.village = PLT === window.PLATEAU_VILLAGE;
  var E = F.etat(t);
  /* la caméra */
  Object.assign(CAM, {x:0, y:-300, z:1800, lacet:0, tangage:0, focus:1800, ouverture:1}, E.cam);
  /* la caméra portée : un tout petit tremblement, et les secousses */
  var tr = E.tremble || 0, port = E.portee == null ? 1 : E.portee;
  CAM.x += U.fbm(t * .6, 1, 3) * 6 * port + U.bruit(t * 28, 5) * tr;
  CAM.y += U.fbm(t * .5, 2, 3) * 4 * port + U.bruit(t * 31, 6) * tr;
  CAM.lacet += U.fbm(t * .4, 3, 2) * .002 * port;
  PLT.image(E);
  FX.flare = E.flare || 1;
  /* ce qui éclaire la poussière : les torches du souterrain, ou les lumières que le film déclare (E.sources : [[x, y, z], …]) */
  FX.sources = E.sources || PLT.TORCHES;
  var defs = [], persos = '', lum = '', avant = '';
  /* les torches (la flamme et la potence : derrière tout le monde) */
  PLT.TORCHES.forEach(function(tq, k){
    var r = FX.torche(tq[0], tq[1], tq[2], t, k, defs);
    persos += r.corps; lum += r.lum;
  });
  /* le décor devant le mur (les sacs, la meule…) */
  if(crypte && window.Accessoires) persos += Accessoires.dessin(t, E);
  /* ce que le film pose au sol (les outils tombés…) */
  if(E.sol) persos += E.sol(t);
  /* les acteurs, du plus loin au plus près */
  var acteurs = (E.acteurs || []).slice().sort(function(a, b){ return a.z - b.z; });
  if(crypte){
    /* le trou de l'arche, vu d'ici (pour ce qui est dans l'escalier) */
    var A = PLATEAU.ARCHE, r0 = (A.x1 - A.x0) / 2, cx0 = A.x0 + r0, pts = [];
    pts.push(CAM.projeter(A.x0, 30, PLATEAU.MUR_Z));
    for(var k0 = 0; k0 <= 16; k0++){ var an = Math.PI + k0 / 16 * Math.PI; pts.push(CAM.projeter(cx0 + Math.cos(an) * r0, -A.h + r0 + Math.sin(an) * r0, PLATEAU.MUR_Z)); }
    pts.push(CAM.projeter(A.x1, 30, PLATEAU.MUR_Z));
    defs.push('<clipPath id="archeVue"><polygon points="' + pts.map(function(q){ return U.r(q.x) + ',' + U.r(q.y); }).join(' ') + '"/></clipPath>');
  }
  acteurs.forEach(function(a, k){ persos += acteur(a, k, defs); });
  if(E.devant) persos += E.devant(t);
  /* la poussière dans l'air */
  if(E.poussiere !== 0) lum += FX.poussiere(t, E.poussiereBoite || [-1400, -1100, -880, 2700, -40, 1200], E.poussiere || 220, 3, E.poussiereCoul);
  if(E.lumieres) lum += E.lumieres(t);
  if(E.avant) avant += E.avant(t);
  /* le fondu (au noir, au blanc) */
  if(E.fondu) avant += '<rect width="' + W + '" height="' + H + '" fill="' + (E.fondu.c || '#000') + '" opacity="' + U.r(U.clamp(E.fondu.k, 0, 1)) + '"/>';
  var base = '<defs><radialGradient id="ombreSol"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset=".6" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    FX.defs() + LeoFace.defs() + (window.Gens ? Gens.defs() : '') + (window.Accessoires ? Accessoires.defs() : '') + (window.ObjetsCine ? ObjetsCine.defs() : '') + (F.defs ? F.defs() : '') + defs.join('') +
    (FX.village ? '<filter id="ombreNoire" x="-30%" y="-30%" width="160%" height="160%"><feColorMatrix type="matrix" values="0 0 0 0 0.03  0 0 0 0 0.03  0 0 0 0 0.08  0 0 0 1 0"/></filter>' : '') + '</defs>';
  document.getElementById('persos').innerHTML = base + persos;
  /* (le plateau du chêne) ce qui porte un filtre (un flou, une lumière) et dont RIEN n'est dans l'image est enlevé : le navigateur
     laissait sinon un carré noir dans le coin haut-gauche de l'image (un personnage tout contre la caméra, une barrière sous le cadre…) */
  if(FX.ecran) Array.prototype.forEach.call(document.querySelectorAll('#persos [filter]'), function(g){
    if(!g.isConnected) return;
    var b = g.getBoundingClientRect(), q = /^url\(#f[el](\d+)\)$/.exec(g.getAttribute('filter') || ''), m = 14 + (q ? q[1] * 1.5 : 150);
    if(b.left > W + m || b.right < -m || b.top > H + m || b.bottom < -m) g.remove();
  });
  document.getElementById('lumieres').innerHTML = '<defs>' + FX.defs() + (window.ObjetsCine ? ObjetsCine.defs() : '') + (F.defs ? F.defs() : '') + '</defs>' + lum;
  document.getElementById('avant').innerHTML = base + avant;
  /* (le plateau du village) LA CARTE DES LUMIÈRES : une couche qui MULTIPLIE toute l'image (le décor et les personnages) — l'ambiance de
     l'heure (E.ambiance : [r, v, b]) et, dedans, les endroits éclairés (E.lampes(t) : des ronds et des formes de lumière) */
  var lm = document.getElementById('lumap');
  if(lm) lm.innerHTML = FX.village && E.ambiance ? '<defs>' + FX.defs() + (F.defs ? F.defs() : '') + '</defs><rect width="' + W + '" height="' + H + '" fill="rgb(' + E.ambiance.map(Math.round).join(',') + ')"/>' + (E.lampes ? E.lampes(t) : '') : '';
  return E;
};
})();
