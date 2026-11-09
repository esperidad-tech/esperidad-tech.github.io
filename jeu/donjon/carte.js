/* carte.js — LA carte du donjon du chemin long (Les Enquêteurs de Brumeval, enquête 3).
   Une seule géométrie pour la carte du Pisteur (avec la brume) ET le plan des Fondateurs du Sage.
   Reprise de la maquette v2 validée par Romain (maquettes/explo/donjon.js, 8 novembre : « l'esthétique est nickel »),
   mise en accord avec CONCEPTION-DONJON.md §7 et avec les ids des décors (decors/) et des scènes (scenes/).

   Repère : la carte entière fait 2 400 × 1 500 unités ; l'entrée (le fond du puits) est au milieu (1 200, 750).
   L'écran du Pisteur en montre environ 960 de large (1 unité ≈ 1 px d'une tablette de 960 px).

   ================================ L'API (window.CARTE_DONJON) ================================
   Les données
     W, H, MUR, SOL                 2400, 1500, épaisseur des murs (11), largeur des couloirs (24)
     LIEUX[id]                      {id, nom, ic, type, x, y, d (contour SVG), poly (contour en points), boite {x,y,w,h},
                                     couloir (true : un lieu-couloir, dessiné comme un trait de largeur l, avec pts),
                                     decor (id dans decors/ : salle de combat), scene (id dans scenes/ : salle sans combat),
                                     signe ('etoile' | 'lune' | 'oeil' | 'gueule' : gravé au mur, et écrit au lieu du nom sur le plan),
                                     codes [ids de donjon-codes.js trouvés ici], objets [ids des objets à toucher], monstres, …}
       types : 'depart', 'combat', 'objets', 'curiosite', 'piege', 'enigme', 'repos', 'scene', 'fin'
       drapeaux : culDeSac, boucle (les égouts), elite, boss, choix (deux objets, on n'en prend qu'un)
     ORDRE                          les lieux dans l'ordre du chemin long
     LIENS[]                        {id, de, a, pts, l (largeur), porte ('oeil'|'gueule'|'lune'), secret, bouche, salle (lieu-couloir), court}
                                    'J' = l'embranchement à la sortie est de la cave aux toiles (CARTE_DONJON.J)
     J, SECRET, VIEUX               l'embranchement ; le passage secret (cul-de-sac éboulé → feu de camp) ; le vieux passage du plan
     ETIQ[id]                       où poser l'étiquette d'un lieu sur la carte du Pisteur
     SIGNES[type]                   le dessin d'un signe (chemin SVG centré, ~17 de large) ; SIGNES_MUR[id] : où il est gravé
     PLAN                           le plan des Fondateurs (la tablette du Sage) : cadre du parchemin, coin déchiré, titre, rose,
                                    noms à la plume, signes, NOTES (codées, encre invisible, piège, passage bloqué, Bourbe)
     PIGPEN(n)                      le dessin d'une lettre des « grilles des fondateurs » (A = 0 … Z = 25), comme le mini-jeu du Sage
   Le graphe
     liens(id)                      les liens d'un lieu (ou de 'J'), passage secret compris
     voisins(id, {secret})          [{lieu, lien, porte}] ; le passage secret seulement avec {secret:true}
     chemin(a, b, {secret})         la suite de lieux la plus courte de a à b (null si impossible)
     lieuEn(x, y)                   l'id du lieu sous le point (salles, puis lieux-couloirs), ou null
     trace(idLien, depuis, t0, t1)  les points d'un couloir (lissé), parcouru depuis le lieu « depuis », de la fraction t0 à t1
     pointSur(idLien, t, depuis)    {x, y, ang} à la fraction t d'un couloir
     longueur(idLien)
   Le dessin (canvas, sans aucun filtre)
     dessiner(ctx, {echelle, zone, etats})       peint la carte (fond rocheux, murs, sols, couloirs, décor, lumières)
                                    de la zone {x,y,w,h} (unités) dans ctx (ctx de zone.w × échelle px) ; etats[id] = 'vu' : décor « après »
     rendre(canvas, {echelle, zone, centre, etats, fin})   la même chose en morceaux de 512 px, un par tâche (jamais de longue
                                    tâche), en commençant près de « centre » ; rend {arreter(), redessiner(zone)}
     EMPREINTE                      la zone utile (tout le donjon et une marge) : la carte du Pisteur n'a besoin que d'elle
     pionSVG(dir)                   les trois héros vus du dessus (SVG, pour une <img>) ; roseSVG() la rose des vents
   La brume
     brume(canvas, {echelle})       la brume de Brumeval sur toute la carte (canvas basse définition, étiré par le navigateur) ;
                                    rend {decouvrir(id, {anim}), decouvrirLien(id, t0, t1, depuis), estVu(id), etat(), restaurer(etat),
                                    trous[] (pour les tests)}. decouvrir(lieu) ouvre le lieu et le début (45 %) de ses couloirs.
   La vue toute faite (ce que le moteur peut reprendre tel quel)
     vue(el, {zoom, etats, brume:etat, surToucher(x, y, idLieu)})
                                    la carte + la brume + les étiquettes + le pion, qu'on fait glisser au doigt (avec élan) ;
                                    rend {decouvrir, centrer(id | {x,y}, {anim}), pion(x, y, dir), deplacer(idLien, depuis) (Promise),
                                    sorties([{lien, depuis, t}], surSortie), etat(), z, detruire()}
   Règles de rapidité (RAPIDITE.md) : la carte est peinte UNE fois (en morceaux) ; glisser = un seul transform sur la couche ;
   au repos, aucune boucle ; la brume se lève par un fondu (opacity) joué par la carte graphique. */
(function(global){
'use strict';
var W = 2400, H = 1500, MUR = 11, SOL = 24, K = 1.2;
var O = '#24182e';
var PI = Math.PI;

/* ======================================================================
   1. Petits outils
   ====================================================================== */
function f(n){ return Math.round(n * 10) / 10; }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * t))); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rgba(c, a){ var A = hx(c); return 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + a + ')'; }

/* ---------- les formes : un chemin SVG (d) ET un contour en points (poly), dans le sens des aiguilles d'une montre ---------- */
function rrD(x, y, w, h, r){ var x0 = x - w / 2, y0 = y - h / 2;
  return 'M' + f(x0 + r) + ' ' + f(y0) + ' H' + f(x0 + w - r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0 + w) + ' ' + f(y0 + r) + ' V' + f(y0 + h - r) +
    ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0 + w - r) + ' ' + f(y0 + h) + ' H' + f(x0 + r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0) + ' ' + f(y0 + h - r) +
    ' V' + f(y0 + r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x0 + r) + ' ' + f(y0) + ' Z'; }
function rrPoly(x, y, w, h, r){
  var x0 = x - w / 2, y0 = y - h / 2, x1 = x + w / 2, y1 = y + h / 2, pts = [];
  function arc(cx, cy, a0){ for(var k = 0; k <= 6; k++){ var a = (a0 + k * 15) * PI / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }
  arc(x1 - r, y0 + r, -90); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, 90); arc(x0 + r, y0 + r, 180);
  return pts;
}
function cercleD(x, y, r){ return 'M' + f(x - r) + ' ' + f(y) + ' A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(x + r) + ' ' + f(y) + ' A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(x - r) + ' ' + f(y) + ' Z'; }
function cerclePoly(x, y, r){ var pts = []; for(var k = 0; k < 48; k++){ var a = PI + k / 48 * 2 * PI; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return pts; }
function octoPts(x, y, w, h, c){ var x0 = x - w / 2, y0 = y - h / 2, x1 = x + w / 2, y1 = y + h / 2;
  return [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]]; }
function polyD(pts, ferme){ return 'M' + pts.map(function(p){ return f(p[0]) + ' ' + f(p[1]); }).join(' L') + (ferme === false ? '' : ' Z'); }
/* une courbe fermée douce qui passe par des points (Catmull-Rom) */
function blobD(pts){
  var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for(var i = 0; i < n; i++){
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d + ' Z';
}
function bez(a, b, c, d, t){ var u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; }
function blobPoly(pts){
  var n = pts.length, out = [];
  for(var i = 0; i < n; i++){
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for(var k = 0; k < 8; k++) out.push(bez(p1, c1, c2, p2, k / 8));
  }
  return out;
}
/* une courbe ouverte douce (les couloirs) : le chemin SVG, et ses points */
function lisse(pts){
  if(pts.length === 2) return 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]) + ' L' + f(pts[1][0]) + ' ' + f(pts[1][1]);
  var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]), n = pts.length;
  for(var i = 0; i < n - 1; i++){
    var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
  }
  return d;
}
function lissePts(pts, nseg){
  nseg = nseg || 12;
  if(pts.length === 2){ var o = []; for(var k = 0; k <= nseg; k++){ var t = k / nseg; o.push([pts[0][0] + (pts[1][0] - pts[0][0]) * t, pts[0][1] + (pts[1][1] - pts[0][1]) * t]); } return o; }
  var n = pts.length, out = [pts[0].slice()];
  for(var i = 0; i < n - 1; i++){
    var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for(var k2 = 1; k2 <= nseg; k2++) out.push(bez(p1, c1, c2, p2, k2 / nseg));
  }
  return out;
}
function aire(poly){ var s = 0; for(var i = 0; i < poly.length; i++){ var a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function horaire(poly){ return aire(poly) >= 0 ? poly : poly.slice().reverse(); }   /* y vers le bas : aire > 0 = sens des aiguilles */
function boite(poly, marge){ var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(function(p){ x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
  marge = marge || 0; return {x:x0 - marge, y:y0 - marge, w:x1 - x0 + 2 * marge, h:y1 - y0 + 2 * marge}; }
function dansPoly(poly, x, y){
  var dedans = false;
  for(var i = 0, j = poly.length - 1; i < poly.length; j = i++){
    var a = poly[i], b = poly[j];
    if(((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) dedans = !dedans;
  }
  return dedans;
}
/* des points régulièrement espacés le long d'une ligne (avec la direction) */
function leLong(pts, pas, ferme, decal){
  var seg = [], L = 0, n = pts.length, m = ferme ? n : n - 1;
  for(var i = 0; i < m; i++){ var a = pts[i], b = pts[(i + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, l, L]); L += l; }
  var k = Math.max(2, Math.round(L / pas)), out = [], j = 0;
  for(var q = 0; q < k; q++){
    var t = (q + (decal === undefined ? .5 : decal)) * L / k;
    while(j < seg.length - 1 && seg[j][3] + seg[j][2] < t) j++;
    var s = seg[j], u = s[2] ? (t - s[3]) / s[2] : 0;
    out.push({x:s[0][0] + (s[1][0] - s[0][0]) * u, y:s[0][1] + (s[1][1] - s[0][1]) * u, ang:Math.atan2(s[1][1] - s[0][1], s[1][0] - s[0][0])});
  }
  return out;
}
/* une ligne et ses longueurs cumulées (pour aller à une fraction de sa longueur) */
function mesure(pts){ var c = [0]; for(var i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return {pts:pts, cum:c, L:c[c.length - 1]}; }
function aFraction(m, t){
  var d = Math.max(0, Math.min(1, t)) * m.L, c = m.cum, i = 1;
  while(i < c.length - 1 && c[i] < d) i++;
  var a = m.pts[i - 1], b = m.pts[i], u = (c[i] - c[i - 1]) ? (d - c[i - 1]) / (c[i] - c[i - 1]) : 0;
  return {x:a[0] + (b[0] - a[0]) * u, y:a[1] + (b[1] - a[1]) * u, ang:Math.atan2(b[1] - a[1], b[0] - a[0]), i:i};
}
function morceau(m, t0, t1){
  if(t1 < t0){ var r = morceau(m, t1, t0); return r.reverse(); }
  var a = aFraction(m, t0), b = aFraction(m, t1), out = [[a.x, a.y]];
  for(var i = a.i; i < b.i; i++) out.push(m.pts[i].slice());
  out.push([b.x, b.y]);
  return out;
}
/* le contour d'un couloir (un trait de largeur l, bouts ronds), en polygone dans le sens des aiguilles d'une montre */
function contourTrait(pts, l){
  var hw = l / 2, g = [], d = [], n = pts.length;
  for(var i = 0; i < n; i++){
    var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], ln = Math.hypot(tx, ty) || 1;
    tx /= ln; ty /= ln;
    g.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]); d.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]);
  }
  var out = g.slice();
  function bout(p, q, sens){ var a0 = Math.atan2(q[1] - p[1], q[0] - p[0]); for(var k = 1; k < 8; k++){ var a = a0 + sens * k / 8 * PI; out.push([p[0] + Math.cos(a) * hw, p[1] + Math.sin(a) * hw]); } }
  bout(pts[n - 1], g[n - 1], 1);
  for(var j = n - 1; j >= 0; j--) out.push(d[j]);
  bout(pts[0], d[0], 1);
  return horaire(out);
}

/* ======================================================================
   2. La géométrie (maquette v2) — les salles de la version 1 servent de modèles, agrandies de K
   ====================================================================== */
var V1 = {
  puits:{x:88, y:180, f:function(x, y, k){ return {t:'cercle', x:x, y:y, r:52 * k}; }},
  rats:{x:285, y:190, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:128 * k, h:88 * k, r:12 * k}; }},
  reserve:{x:285, y:76, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:100 * k, h:70 * k, r:10 * k}; }},
  canaux:{x:285, y:338, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:170 * k, h:112 * k, r:14 * k}; }},
  givre:{x:90, y:342, pts:[[30, 334], [40, 304], [72, 292], [112, 296], [142, 313], [151, 344], [138, 377], [104, 392], [62, 390], [35, 370]]},
  toiles:{x:470, y:332, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:124 * k, h:100 * k, r:18 * k}; }},
  eboulis:{x:566, y:452, pts:[[516, 442], [530, 421], [562, 416], [598, 421], [618, 440], [613, 468], [586, 487], [546, 488], [520, 470]]},
  atelier:{x:640, y:190, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:148 * k, h:100 * k, r:12 * k}; }},
  bibliotheque:{x:640, y:72, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:132 * k, h:70 * k, r:12 * k}; }},
  ossuaire:{x:838, y:180, f:function(x, y, k){ return {t:'octo', x:x, y:y, w:116 * k, h:92 * k, c:24 * k}; }},
  camp:{x:765, y:300, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:84 * k, h:72 * k, r:28 * k}; }},
  bassin:{x:760, y:445, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:160 * k, h:96 * k, r:40 * k}; }},
  porte4:{x:905, y:445, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:76 * k, h:80 * k, r:10 * k}; }},
  leo:{x:905, y:322, f:function(x, y, k){ return {t:'rr', x:x, y:y, w:76 * k, h:76 * k, r:12 * k}; }}
};
function forme(fo){
  if(fo.t === 'rr') return {d:rrD(fo.x, fo.y, fo.w, fo.h, fo.r), poly:rrPoly(fo.x, fo.y, fo.w, fo.h, fo.r)};
  if(fo.t === 'cercle') return {d:cercleD(fo.x, fo.y, fo.r), poly:cerclePoly(fo.x, fo.y, fo.r)};
  if(fo.t === 'octo'){ var p = octoPts(fo.x, fo.y, fo.w, fo.h, fo.c); return {d:polyD(p), poly:p}; }
  if(fo.t === 'blob') return {d:blobD(fo.pts), poly:horaire(blobPoly(fo.pts))};
  return null;
}
function modele(id, x, y){
  var v = V1[id];
  if(v.pts) return {t:'blob', pts:v.pts.map(function(p){ return [x + (p[0] - v.x) * K, y + (p[1] - v.y) * K]; })};
  return v.f(x, y, K);
}

var LIEUX = {}, ORDRE = [];
function lieu(id, o){
  o.id = id;
  if(o.v1) o.forme = modele(id, o.x, o.y);
  if(o.forme){ var g = forme(o.forme); o.d = g.d; o.poly = g.poly; o.boite = boite(g.poly); }
  LIEUX[id] = o; ORDRE.push(id);
}
/* dans l'ordre du chemin long (CONCEPTION §7) */
lieu('puits',        {nom:'Le fond du puits', ic:'🪢', type:'depart', x:1200, y:750, v1:1, scene:'puits', sauvegarde:true});
lieu('galerie',      {nom:'La galerie effondrée', ic:'🪨', type:'objets', culDeSac:true, x:990, y:755, forme:{t:'rr', x:990, y:755, w:150, h:64, r:14}, scene:'galerie', objets:['bourse']});
lieu('aeration',     {nom:'Le puits d’aération', ic:'🌬️', type:'objets', culDeSac:true, x:1200, y:560, forme:{t:'cercle', x:1200, y:560, r:46}, scene:'aeration', signe:'etoile', objets:['sacoche', 'herbes'], codes:['plante:lumiere']});
lieu('rats',         {nom:'La salle des rats', ic:'🐀', type:'combat', x:1440, y:752, v1:1, decor:'rats', monstres:['rat', 'rat', 'rat']});
lieu('reserve',      {nom:'La réserve', ic:'📦', type:'objets', choix:true, culDeSac:true, x:1455, y:610, v1:1, scene:'reserve', objets:['fleches-argent', 'fleches-lourdes']});
lieu('canaux',       {nom:'Les canaux de la ville d’avant', ic:'💧', type:'combat', x:1440, y:925, v1:1, decor:'canaux', monstres:['chauvesouris', 'chauvesouris', 'rat']});
lieu('egouts',       {nom:'Les égouts tournants', ic:'🌀', type:'combat', boucle:true, x:1440, y:1110, couloir:true, l:26,
  pts:[[1385, 988], [1378, 1050], [1336, 1105], [1352, 1172], [1420, 1212], [1502, 1196], [1546, 1130], [1520, 1062], [1500, 990]], decor:'egouts', monstres:['rat']});
lieu('givre',        {nom:'La grotte de la fleur de givre', ic:'❄️', type:'objets', culDeSac:true, x:1000, y:1010, v1:1, scene:'givre', objets:['fleur-givre'], codes:['plante:givre']});
lieu('toiles',       {nom:'La cave aux toiles', ic:'🕸️', type:'combat', x:1700, y:925, v1:1, decor:'toiles', signe:'lune', monstres:['araignee', 'feufollet', 'feufollet']});
lieu('eboulis',      {nom:'Le cul-de-sac éboulé', ic:'🦴', type:'curiosite', culDeSac:true, x:1835, y:1095, v1:1, scene:'eboulis', objets:['tas-os', 'crane'], codes:['page:blanche']});
lieu('dalles',       {nom:'Le couloir aux dalles', ic:'⚠️', type:'piege', x:1866, y:838, couloir:true, l:32, pts:[[1840, 915], [1866, 838], [1890, 754]], scene:'dalles'});
lieu('atelier',      {nom:'L’atelier des Fondateurs', ic:'⚙️', type:'combat', elite:true, x:1920, y:700, v1:1, decor:'atelier', monstres:['gardien', 'ratcuir']});
lieu('bibliotheque', {nom:'La bibliothèque engloutie', ic:'📚', type:'objets', choix:true, culDeSac:true, x:1920, y:560, v1:1, scene:'bibliotheque', objets:['page-dechiree', 'page-blanche', 'cristal-lune', 'baton-chene'], codes:['page:dechiree', 'page:blanche']});
lieu('portes',       {nom:'La salle aux trois portes', ic:'🚪', type:'enigme', x:2135, y:700, forme:{t:'rr', x:2135, y:700, w:130, h:120, r:12}, scene:'portes'});
lieu('crypte',       {nom:'La fausse crypte', ic:'⚰️', type:'combat', culDeSac:true, x:2300, y:700, forme:{t:'rr', x:2300, y:700, w:100, h:90, r:10}, decor:'crypte', scene:'crypte-sarco', signe:'gueule', objets:['amulette'], monstres:['chauvesouris', 'chauvesouris']});
lieu('ossuaire',     {nom:'L’ossuaire', ic:'💀', type:'combat', elite:true, x:2135, y:905, v1:1, decor:'ossuaire', signe:'oeil', monstres:['roirats', 'feufollet', 'feufollet']});
lieu('camp',         {nom:'Le feu de camp', ic:'🔥', type:'repos', x:2135, y:1080, v1:1, scene:'camp'});
lieu('bassin',       {nom:'Le grand bassin', ic:'🐸', type:'combat', boss:true, x:2100, y:1255, v1:1, decor:'bassin', monstres:['bourbe', 'tetard', 'tetard']});
lieu('porte4',       {nom:'La porte aux quatre signes', ic:'🗝️', type:'scene', x:2290, y:1255, v1:1, scene:'porte4', codes:['porte:odette']});
lieu('leo',          {nom:'La dernière salle', ic:'🏮', type:'fin', culDeSac:true, x:2290, y:1095, v1:1, scene:'leo', codes:['leo:attrape']});
/* les lieux-couloirs : leur trait, et un contour pour les toucher */
ORDRE.forEach(function(k){ var o = LIEUX[k]; if(o.couloir){ o.d = lisse(o.pts); o.ligne = lissePts(o.pts, 14); o.poly = contourTrait(o.ligne, o.l + 2 * MUR); o.boite = boite(o.poly); } });

var J = {x:1840, y:925, r:20};     /* l'embranchement, à la sortie est de la cave aux toiles */
var LIENS = [
  {id:'cE', de:'puits', a:'rats', pts:[[1258, 750], [1310, 751], [1368, 752]]},
  {id:'cO', de:'puits', a:'galerie', pts:[[1142, 751], [1102, 753], [1060, 755]]},
  {id:'cN', de:'puits', a:'aeration', pts:[[1200, 694], [1200, 650], [1200, 602]]},
  {id:'c2', de:'rats', a:'reserve', pts:[[1455, 703], [1455, 648]]},
  {id:'c3', de:'rats', a:'canaux', pts:[[1405, 800], [1405, 862]]},
  {id:'c4', de:'canaux', a:'givre', pts:[[1342, 950], [1230, 958], [1140, 985], [1066, 1004]]},
  {id:'c5', de:'canaux', a:'toiles', pts:[[1538, 940], [1585, 935], [1630, 930]]},
  {id:'c6', de:'toiles', a:'J', pts:[[1770, 925], [1840, 925]], court:true},
  {id:'c8', de:'J', a:'eboulis', pts:[[1840, 940], [1842, 1000], [1836, 1056]]},
  {id:'c9', de:'atelier', a:'bibliotheque', pts:[[1920, 644], [1920, 598]]},
  {id:'c10', de:'atelier', a:'portes', pts:[[2005, 700], [2040, 700], [2074, 700]]},
  {id:'pOeil', de:'portes', a:'ossuaire', pts:[[2135, 756], [2135, 800], [2135, 854]], porte:'oeil'},
  {id:'pGueule', de:'portes', a:'crypte', pts:[[2196, 700], [2225, 700], [2254, 700]], porte:'gueule'},
  /* la porte de la lune ramène à la cave ; de la cave, ce couloir finit sur la porte fermée (sinon on éviterait l'atelier) */
  {id:'pLune', de:'portes', a:'toiles', pts:[[2135, 644], [2138, 560], [2110, 470], [2000, 452], [1850, 452], [1760, 462], [1724, 540], [1716, 680], [1700, 800], [1690, 869]], porte:'lune', sensUnique:true},
  {id:'c11', de:'ossuaire', a:'camp', pts:[[2135, 958], [2135, 1000], [2135, 1040]]},
  {id:'c12', de:'camp', a:'bassin', pts:[[2128, 1120], [2118, 1160], [2108, 1202]]},
  {id:'c13', de:'bassin', a:'porte4', pts:[[2192, 1255], [2220, 1255], [2248, 1255]]},
  {id:'c14', de:'porte4', a:'leo', pts:[[2290, 1210], [2290, 1175], [2290, 1138]]}
];
LIENS.push({id:'dalles', de:'J', a:'atelier', pts:LIEUX.dalles.pts, l:LIEUX.dalles.l, salle:'dalles'});
LIENS.push({id:'egouts', de:'canaux', a:'canaux', pts:LIEUX.egouts.pts, l:LIEUX.egouts.l, salle:'egouts', boucle:true});
/* le vieux passage : le plan du Sage le dessine de la galerie jusqu'à la grotte de givre ; aujourd'hui il est bouché.
   Dans le donjon, il n'en reste qu'un bout, côté grotte, qui finit sur des éboulis. */
var VIEUX = [[921, 762], [872, 790], [846, 860], [856, 935], [890, 985], [934, 1006]];
LIENS.push({id:'vieux', de:'givre', a:null, pts:[[934, 1006], [896, 990], [866, 960], [852, 912]], bouche:true});
/* le passage secret : du cul-de-sac éboulé au feu de camp. Seule l'encre invisible du plan le montre ; dans le donjon,
   il s'ouvre quand on appuie sur le crâne gravé (scenes : crâne → 'camp') */
var SECRET = [[1892, 1096], [1950, 1092], [2005, 1086], [2088, 1082]];
LIENS.push({id:'secret', de:'eboulis', a:'camp', pts:SECRET, secret:true, l:20});
var LIEN = {};
LIENS.forEach(function(c){
  c.l = c.l || SOL;
  c.ligne = lissePts(c.pts, 14);
  c.m = mesure(c.ligne);
  c.poly = contourTrait(c.ligne, c.l);
  c.boite = boite(c.poly, MUR + 4);
  LIEN[c.id] = c;
});

/* où poser les étiquettes sur la carte du Pisteur */
var ETIQ = {
  puits:[1200, 834], galerie:[1000, 706], aeration:[1200, 498], rats:[1492, 822], reserve:[1330, 612], canaux:[1232, 905], givre:[1000, 1090],
  toiles:[1700, 1014], dalles:[1955, 862], egouts:[1440, 1252], eboulis:[1835, 1160], atelier:[2008, 784], bibliotheque:[1920, 494], portes:[2262, 778],
  crypte:[2300, 638], ossuaire:[2262, 905], camp:[2010, 1030], bassin:[2100, 1334], porte4:[2290, 1336], leo:[2290, 1008]
};
/* les signes : sur le mur dans le donjon, et à la place du nom sur le plan du Sage */
var SIGNES = {
  oeil:'M-8 0 Q 0 -7.5 8 0 Q 0 7.5 -8 0 Z M0 -2.6 A2.6 2.6 0 1 1 0 2.6 A2.6 2.6 0 1 1 0 -2.6 Z',
  lune:'M2.5 -8 A8 8 0 1 0 2.5 8 A6 6 0 1 1 2.5 -8 Z',
  gueule:'M-8.5 -.5 Q 0 9.5 8.5 -.5 Q 0 3 -8.5 -.5 Z M-7.6 -1.5 A2.6 2.6 0 1 1 -2.4 -1.5 M2.4 -1.5 A2.6 2.6 0 1 1 7.6 -1.5',
  etoile:'M0 -8.5 L 2.4 -2.8 L 8.4 -2.6 L 3.8 1.2 L 5.3 7.2 L 0 3.8 L -5.3 7.2 L -3.8 1.2 L -8.4 -2.6 L -2.4 -2.8 Z'
};
var SIGNES_MUR = {aeration:[1200, 512], toiles:[1700, 990], crypte:[2354, 700], ossuaire:[2061, 905]};

/* la zone utile : tout ce qui est dessiné, plus une marge (la carte du Pisteur ne peint que ça ; le reste n'est que brume) */
var EMPREINTE = (function(){
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  function b(q){ x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x + q.w); y1 = Math.max(y1, q.y + q.h); }
  ORDRE.forEach(function(k){ b(LIEUX[k].boite); }); LIENS.forEach(function(c){ b(c.boite); });
  var m = 90; x0 = Math.floor((x0 - m) / 10) * 10; y0 = Math.floor((y0 - m) / 10) * 10; x1 = Math.ceil((x1 + m) / 10) * 10; y1 = Math.ceil((y1 + m) / 10) * 10;
  return {x:Math.max(0, x0), y:Math.max(0, y0), w:Math.min(W, x1) - Math.max(0, x0), h:Math.min(H, y1) - Math.max(0, y0)};
})();

/* ======================================================================
   3. Le graphe
   ====================================================================== */
function liens(id){ return LIENS.filter(function(c){ return c.de === id || c.a === id; }); }
function autreBout(c, id){ return c.de === id ? c.a : c.de; }
function voisins(id, o){
  o = o || {};
  var out = [];
  liens(id).forEach(function(c){
    if(c.secret && !o.secret) return;
    if(c.bouche) return;
    if(c.boucle){ out.push({lieu:c.salle, lien:c.id, porte:null}); return; }
    /* une porte qui ne s'ouvre que d'un côté (la lune : de la salle aux trois portes vers la cave, pas l'inverse) */
    if(c.sensUnique && c.a === id){ if(!o.sansFermees) out.push({lieu:c.de, lien:c.id, porte:c.porte || null, fermee:true}); return; }
    if(c.salle && c.salle !== id){ out.push({lieu:c.salle, lien:c.id, porte:null}); return; }
    var b = autreBout(c, id);
    if(b === 'J'){ liens('J').forEach(function(c2){ if(c2 !== c) out.push({lieu:c2.salle || autreBout(c2, 'J'), lien:c2.id, via:c.id, porte:null}); }); return; }
    out.push({lieu:b, lien:c.id, porte:c.porte || null});
  });
  /* un lieu-couloir : ses deux bouts */
  var L = LIEUX[id];
  if(L && L.couloir){
    var c0 = LIEN[id];
    if(c0.boucle) out.push({lieu:c0.de, lien:c0.id, porte:null});
    else [c0.de, c0.a].forEach(function(b){
      if(b === 'J') liens('J').forEach(function(c2){ if(c2 !== c0) out.push({lieu:autreBout(c2, 'J'), lien:c2.id, via:c0.id, porte:null}); });
      else out.push({lieu:b, lien:c0.id, porte:null});
    });
  }
  /* sans doublon */
  var vu = {};
  return out.filter(function(v){ var k = v.lieu + '|' + v.lien; if(vu[k] || v.lieu === id && !L.couloir) return false; vu[k] = 1; return true; });
}
function chemin(a, b, o){
  if(a === b) return [a];
  var avant = {}, file = [a]; avant[a] = null;
  while(file.length){
    var x = file.shift();
    var vs = voisins(x, o);
    for(var i = 0; i < vs.length; i++){
      if(vs[i].fermee) continue;
      var y = vs[i].lieu;
      if(y in avant) continue;
      avant[y] = x;
      if(y === b){ var r = [b]; while(avant[r[0]] !== null) r.unshift(avant[r[0]]); return r; }
      file.push(y);
    }
  }
  return null;
}
var CTXT = null;
function lieuEn(x, y){
  for(var i = 0; i < ORDRE.length; i++){ var o = LIEUX[ORDRE[i]]; if(!o.couloir && dansPoly(o.poly, x, y)) return o.id; }
  for(var j = 0; j < ORDRE.length; j++){ var o2 = LIEUX[ORDRE[j]]; if(o2.couloir && dansPoly(o2.poly, x, y)) return o2.id; }
  return null;
}
function trace(id, depuis, t0, t1){
  var c = LIEN[id]; if(!c) return [];
  t0 = t0 == null ? 0 : t0; t1 = t1 == null ? 1 : t1;
  var inverse = depuis && c.a === depuis && c.de !== depuis;
  return inverse ? morceau(c.m, 1 - t0, 1 - t1) : morceau(c.m, t0, t1);
}
function pointSur(id, t, depuis){
  var c = LIEN[id]; if(!c) return null;
  var inverse = depuis && c.a === depuis && c.de !== depuis, p = aFraction(c.m, inverse ? 1 - t : t);
  if(inverse) p.ang += PI;
  return {x:p.x, y:p.y, ang:p.ang};
}

/* ======================================================================
   4. Le plan des Fondateurs (la tablette du Sage) : les données
   Repère : les mêmes unités que la carte. Le parchemin va de (712, 404) à (2413, 1346).
   ====================================================================== */
/* (sx, sy) de la maquette du plan (écran 960 × 540) → unités de la carte */
var SC = .556;
function px(sx){ return f((sx - 36.5) / SC + 765); } function py(sy){ return f((sy - 22) / SC + 429); } function pt(t){ return f(t / SC); }
var DECH_E = [[703, 548], [708, 512], [701, 476], [710, 446], [736, 433], [770, 437], [806, 430], [838, 428], [846, 402], [842, 372], [858, 358], [890, 362], [925, 354], [968, 350], [968, 548]];
var PLAN = {
  vue:{x:px(0), y:py(0), w:pt(960), h:pt(540)},            /* tout le plan (le parchemin et la table autour) */
  cadre:{x:px(7), y:py(8), w:pt(946), h:pt(524)},           /* le parchemin */
  dechire:DECH_E.map(function(p){ return [px(p[0]), py(p[1])]; }),   /* le coin arraché (bassin, porte, dernière salle) */
  titre:{x:px(143), y:py(47), t:'Le plan des Fondateurs', sous:'relevé de la ville d’avant', sy:py(77)},
  rose:{x:px(894), y:py(74), r:pt(24)},
  /* les noms à la plume (les salles à signe n'ont pas de nom : leur signe suffit) */
  noms:[
    {lieu:'puits', x:1200, y:838, l:['Le fond du puits'], t:24},
    {lieu:'galerie', x:990, y:755, l:['La grande', 'galerie'], t:20},
    {lieu:'rats', x:1440, y:752, l:['La salle', 'des rats'], t:24},
    {lieu:'reserve', x:1455, y:610, l:['La réserve'], t:22},
    {lieu:'canaux', x:1372, y:905, l:['Les canaux', 'de la ville', 'd’avant'], t:20},
    {lieu:'givre', x:1000, y:1100, l:['La grotte de la', 'fleur de givre'], t:24},
    {lieu:'atelier', x:1920, y:700, l:['L’atelier des', 'Fondateurs'], t:22},
    {lieu:'bibliotheque', x:1920, y:568, l:['La bibliothèque', 'engloutie'], t:21},
    {lieu:'portes', x:2135, y:700, l:['La salle aux', 'trois portes'], t:19},
    {lieu:'camp', x:2135, y:1080, l:['Le feu', 'de camp'], t:20},
    {lieu:'eboulis', x:1800, y:1170, l:['Le cul-de-sac éboulé'], t:22},
    /* sur le coin déchiré */
    {lieu:'bassin', x:2100, y:1330, l:['Le grand bassin'], t:20, coin:true},
    {lieu:'leo', x:2290, y:1077, l:['La dernière', 'salle'], t:17, coin:true}
  ],
  /* les signes au lieu des noms, et les mêmes sur les trois portes */
  signes:[
    {lieu:'aeration', s:'etoile', x:1200, y:554, t:31}, {lieu:'toiles', s:'lune', x:1700, y:925, t:36},
    {lieu:'ossuaire', s:'oeil', x:2135, y:905, t:36}, {lieu:'crypte', s:'gueule', x:2300, y:712, t:32},
    {lieu:'portes', s:'lune', x:2135, y:626, t:16, porte:'pLune'}, {lieu:'portes', s:'gueule', x:2214, y:700, t:16, porte:'pGueule'}, {lieu:'portes', s:'oeil', x:2135, y:774, t:16, porte:'pOeil'}
  ],
  /* LES NOTES. type : 'code' (alphabet secret : les grilles des fondateurs), 'encre' (encre invisible : la rune de lumière du Sage
     la révèle), 'piege' (à l'encre rouge), 'coin' (sur la page déchirée, complétée par le code page:dechiree).
     x, y : le centre ; lignes : le texte (en MAJUSCULES pour les notes codées : les espaces restent des espaces) */
  notes:[
    {id:'est', type:'code', x:px(178), y:py(128), lignes:['VA A L EST'], pres:'puits', dit:'Va à l’est'},
    {id:'oeil', type:'code', x:px(886), y:py(230), lignes:['PRENDS', 'L OEIL'], pres:'portes', dit:'Prends l’œil'},
    {id:'rond', type:'code', x:px(270), y:py(428), lignes:['ON TOURNE', 'EN ROND'], pres:'egouts', dit:'On tourne en rond'},
    {id:'crane', type:'encre', x:1930, y:1028, lignes:['appuie sur', 'le crâne'], pres:'eboulis', passage:true,
      boite:{x:1840, y:990, w:300, h:130}},
    {id:'fleur', type:'encre', x:905, y:1185, lignes:['ici pousse la fleur', 'qui ne fond jamais'], pres:'givre',
      boite:{x:755, y:1145, w:300, h:85}},
    {id:'dalles', type:'piege', x:px(718), y:py(236), lignes:['seulement les', 'dalles claires'], pres:'dalles', crane:{x:px(678), y:py(234)}},
    {id:'bourbe', type:'coin', x:2100, y:1236, lignes:['Ici dort Bourbe.', 'Chut… pas de bruit !'], pres:'bassin'}
  ],
  /* le passage bloqué : le vieux plan dessine la grande galerie intacte jusqu'à la grotte de givre ; dans le donjon, elle est
     effondrée (le Pisteur ne voit que des éboulis) : il faut se parler */
  passages:[{id:'vieux', pts:VIEUX, de:'galerie', a:'givre', bloque:true}]
};
/* les grilles des fondateurs (pigpen) : la même chose que le mini-jeu « L'alphabet secret » (mj-sage-codes.js, pigSVG) */
var X_CHEMINS = ['M4 4L15 15L26 4', 'M4 4L15 15L4 26', 'M26 4L15 15L26 26', 'M4 26L15 15L26 26'];
function PIGPEN(cell){
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
  return {d:d, p:point ? [cx, cy] : null};
}

/* ======================================================================
   5. Le dessin de la carte du Pisteur (canvas 2D, sans aucun filtre)
   Tout se dessine en unités de la carte : le contexte est déjà mis à l'échelle. Les flous de la maquette deviennent des
   ombres portées (shadowBlur, déplacées hors de vue), les dégradés des formes restent des dégradés.
   ====================================================================== */
var X = null, ECH = 1;            /* le contexte en cours et son échelle (px par unité) */
function pa(d){ return new Path2D(d); }
function remplir(p, c, a){ X.globalAlpha = a == null ? 1 : a; X.fillStyle = c; X.fill(p); X.globalAlpha = 1; }
function tracer(p, c, w, a, tirets){ X.globalAlpha = a == null ? 1 : a; X.strokeStyle = c; X.lineWidth = w; X.lineCap = 'round'; X.lineJoin = 'round';
  if(tirets) X.setLineDash(tirets); X.stroke(p); if(tirets) X.setLineDash([]); X.globalAlpha = 1; }
function P(d, fl, sw){ var p = pa(d); remplir(p, fl); tracer(p, O, sw || 1.4); }
function L(d, c, w, a, tirets){ tracer(pa(d), c, w, a, tirets); }
function F(d, c, a){ remplir(pa(d), c, a); }
function C(x, y, r, fl, a, sc, sw){ X.beginPath(); X.arc(x, y, Math.max(.01, r), 0, 2 * PI);
  if(fl){ X.globalAlpha = a == null ? 1 : a; X.fillStyle = fl; X.fill(); X.globalAlpha = 1; }
  if(sc){ X.strokeStyle = sc; X.lineWidth = sw || 1; X.stroke(); } }
function El(x, y, rx, ry, fl, a, sc, sw){ X.beginPath(); X.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), 0, 0, 2 * PI);
  X.globalAlpha = a == null ? 1 : a; X.fillStyle = fl; X.fill(); X.globalAlpha = 1; if(sc){ X.strokeStyle = sc; X.lineWidth = sw || 1; X.stroke(); } }
function Rt(x, y, w, h, r, fl, a, sc, sw){ X.beginPath(); if(r && X.roundRect) X.roundRect(x, y, w, h, r); else X.rect(x, y, w, h);
  if(fl){ X.globalAlpha = a == null ? 1 : a; X.fillStyle = fl; X.fill(); X.globalAlpha = 1; } if(sc){ X.strokeStyle = sc; X.lineWidth = sw || 1; X.stroke(); } }
function G(x, y, a, s, fn){ X.save(); X.translate(x, y); if(a) X.rotate(a * PI / 180); if(s && s !== 1) X.scale(s, s); fn(); X.restore(); }
/* le dégradé des formes de la maquette : clair en haut à droite, sombre en bas à gauche, sur la boîte donnée */
function grad(c, x0, y0, x1, y1, fort){ fort = fort || 1; var g = X.createLinearGradient(x1, y0, x0, y1);
  g.addColorStop(0, clair(c, .28 * fort)); g.addColorStop(.45, c); g.addColorStop(1, sombre(c, .45 * fort)); return g; }
function gr(c, r, fort){ return grad(c, -r, -r, r, r, fort); }
function lum(x, y, r, c, o){ var g = X.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, 1)); g.addColorStop(.3, rgba(c, .55)); g.addColorStop(.65, rgba(c, .18)); g.addColorStop(1, rgba(c, 0));
  X.globalAlpha = o == null ? 1 : o; X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, 2 * PI); X.fill(); X.globalAlpha = 1; }
/* un flou : la forme est peinte hors de vue, seule son ombre (floue) revient à sa place */
var LOIN = 4000;
function flou(n, couleur, fn){
  X.save(); X.shadowColor = couleur; X.shadowBlur = n * 2 * ECH; X.shadowOffsetX = LOIN * ECH; X.shadowOffsetY = 0;
  X.translate(-LOIN, 0); X.fillStyle = '#000'; X.strokeStyle = '#000'; fn(); X.restore();
}

/* ---------- petits objets (les mêmes que la maquette) ---------- */
function colonne(x, y, r){
  El(x + 3, y + 4, r + 2, r + 1, '#000', .38);
  C(x, y, r + 2, grad('#4d4366', x - r, y - r, x + r, y + r), 1, O, 1.5);
  C(x, y, r - 1, grad('#6a5e86', x - r, y - r, x + r, y + r), 1, O, 1);
  C(x + r * .3, y - r * .35, r * .32, '#fff', .14);
  L('M' + f(x - r * .4) + ' ' + f(y + r * .1) + ' l' + f(r * .3) + ' ' + f(r * .25), O, .8, .6);
}
function os(x, y, a, l, c){
  c = c || '#e6dcc2';
  G(x, y, a, 1, function(){
    L('M' + f(-l / 2) + ' 0 H' + f(l / 2), O, 3.6);
    C(-l / 2, -1.1, 1.6, O); C(-l / 2, 1.1, 1.6, O); C(l / 2, -1.1, 1.6, O); C(l / 2, 1.1, 1.6, O);
    L('M' + f(-l / 2) + ' 0 H' + f(l / 2), c, 1.8);
    C(-l / 2, -1.1, .9, c); C(-l / 2, 1.1, .9, c); C(l / 2, -1.1, .9, c); C(l / 2, 1.1, .9, c);
  });
}
function crane(x, y, a, s){
  G(x, y, a, s || 1, function(){
    var p = pa('M-4 -3 C -4 -6 4 -6 4 -3 L 3.4 3 C 2 5 -2 5 -3.4 3 Z'); remplir(p, '#e6dcc2'); tracer(p, O, 1);
    C(-1.6, 1, 1.1, '#2a1c26'); C(1.6, 1, 1.1, '#2a1c26'); C(-1, -3.4, 1, '#fff', .35);
  });
}
function craneRat(x, y, a){
  G(x, y, a, 1, function(){
    var p = pa('M-3 -2.4 C 1 -3 4 -1.4 6 0 C 4 1.4 1 3 -3 2.4 C -4.6 1.6 -4.6 -1.6 -3 -2.4 Z'); remplir(p, '#e3d8bc'); tracer(p, O, .9);
    C(0, -1, .7, '#2a1c26'); C(0, 1, .7, '#2a1c26');
  });
}
function tonneau(x, y, r){
  El(x + 2, y + 3, r, r, '#000', .35);
  C(x, y, r, grad('#7a4e2e', x - r, y - r, x + r, y + r), 1, O, 1.4);
  C(x, y, r - 2.2, null, 1, '#3a2a2a', 1.6);
  L('M' + f(x - r + 3) + ' ' + f(y - 2) + ' H' + f(x + r - 3) + ' M' + f(x - r + 3) + ' ' + f(y + 2) + ' H' + f(x + r - 3), '#4e321c', .8);
  C(x + r * .35, y - r * .4, r * .25, '#fff', .15);
}
function caisse(x, y, w, h, a){
  G(x, y, a, 1, function(){
    Rt(-w / 2 + 2, -h / 2 + 3, w, h, 0, '#000', .35);
    Rt(-w / 2, -h / 2, w, h, 1.5, grad('#8a5e34', -w / 2, -h / 2, w / 2, h / 2), 1, O, 1.4);
    L('M' + f(-w / 2 + 2) + ' ' + f(-h / 2 + 2) + ' L' + f(w / 2 - 2) + ' ' + f(h / 2 - 2), '#5a3a1e', 1.6);
    L('M' + f(-w / 2) + ' ' + f(-h / 6) + ' H' + f(w / 2) + ' M' + f(-w / 2) + ' ' + f(h / 6) + ' H' + f(w / 2), '#5a3a1e', .7);
  });
}
function sac(x, y, a){
  G(x, y, a, 1, function(){
    El(2, 3, 7, 6, '#000', .32);
    P('M-6 -1 C -7 -6 6 -7 7 -1 C 8 5 -7 6 -6 -1 Z', grad('#a8916a', -7, -7, 8, 6));
    L('M-1 -5 L 1 -2', '#5a4430', 1.2); C(2, -3, 1.5, '#fff', .18);
  });
}
function coffre(x, y, ouvert){
  G(x, y, 0, 1, function(){
    Rt(-9, -3, 20, 14, 0, '#000', .4);
    if(ouvert){
      Rt(-10, -14, 20, 9, 2.5, grad('#7a4a28', -10, -14, 10, -5), 1, O, 1.3); Rt(-8, -12.5, 16, 6, 1, '#6a1e24');
      L('M-6 -14 V-5 M6 -14 V-5', '#e0b85a', 1.4);
      Rt(-10, -6, 20, 13, 2, grad('#8a5a30', -10, -6, 10, 7), 1, O, 1.3); Rt(-8, -4.5, 16, 10, 1, '#2a0e14'); Rt(-8, -4.5, 16, 3, 0, '#7a2a2e', .8);
      L('M-10 1 H-8 M8 1 H10', '#e0b85a', 1.6);
    } else {
      Rt(-10, -7, 20, 14, 3, grad('#8a5a30', -10, -7, 10, 7), 1, O, 1.3);
      L('M-5 -7 V7 M5 -7 V7', '#c9a35a', 1.6); Rt(-2, -2, 4, 4, 0, '#e8c062', 1, O, .8);
    }
    L('M-10 -6 V6', '#c9a35a', 1.4, .9); L('M10 -6 V6', '#c9a35a', 1.4, .9);
  });
}
function piece(x, y){ C(x, y, 1.6, '#f0c860', 1, O, .6); C(x - .4, y - .5, .5, '#fff8d0'); }
function eboulis(x, y, r, seed, c){
  var R = rng(seed), n = Math.round(r * 1.2);
  c = c || '#5a5070';
  for(var i = 0; i < n; i++){
    var a = R() * PI * 2, d = Math.sqrt(R()) * r, qx = x + Math.cos(a) * d, qy = y + Math.sin(a) * d * .8, t = 1.6 + R() * (r / 4 + 1.5) * (1 - d / r * .5);
    var pts = []; for(var k = 0; k < 6; k++){ var b = k / 6 * PI * 2 + R() * .5; pts.push([qx + Math.cos(b) * t * (.7 + R() * .5), qy + Math.sin(b) * t * (.7 + R() * .5)]); }
    F(polyD(pts.map(function(p){ return [p[0] + 1.5, p[1] + 2]; })), '#000', .4);
    var col = mix(c, R() < .5 ? '#7a6f94' : '#3e3550', R() * .6);
    var p = pa(polyD(pts)); remplir(p, grad(col, qx - t, qy - t, qx + t, qy + t)); tracer(p, O, 1);
  }
}
function mousse(x, y, r, seed, c){
  var R = rng(seed);
  c = c || '#3d6a3e';
  for(var i = 0; i < r * 1.4; i++){ var a = R() * 6.283, d = Math.sqrt(R()) * r; C(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, 1.2 + R() * 2.6, R() < .5 ? c : clair(c, .15), .45 + R() * .4); }
}
function racine(pts, w){ var d = lisse(pts); L(d, O, w + 1.6); L(d, '#6a4a30', w); L(d, '#9a7450', w * .35, .6); }
function champis(x, y, n, seed){
  var R = rng(seed), q = [];
  for(var i = 0; i < n; i++){ var a = R() * 6.283, d = R() * 7; q.push([x + Math.cos(a) * d, y + Math.sin(a) * d, 1.4 + R() * 2.2]); }
  return {b:function(){ q.forEach(function(c){ C(c[0] + .8, c[1] + 1.2, c[2], '#000', .5); C(c[0], c[1], c[2], '#2b7f7a', 1, O, .8); }); },
    e:function(){ lum(x, y, 16, '#5fffd0', .55); q.forEach(function(c){ C(c[0], c[1], c[2] * .8, '#7ff5d8', .85); C(c[0] - c[2] * .3, c[1] - c[2] * .3, c[2] * .35, '#e8fff8'); }); },
    l:[x, y, 46, '#4fffc8', .55]};
}
var GLYPHES = ['M5 0 V12 M5 3 L9 0 M5 6 L9 3', 'M2 0 V12 M2 1 L8 4 L2 8', 'M5 0 V12 M1 4 L5 0 L9 4', 'M1 0 L9 12 M9 0 L1 12', 'M5 0 L9 6 L5 12 L1 6 Z',
  'M2 0 V12 M8 0 V12 M2 6 L8 6', 'M2 12 V0 L8 6 L8 0', 'M5 12 V0 M1 8 L5 4 L9 8', 'M1 0 L5 5 L9 0 M5 5 V12', 'M3 0 L7 3 L3 6 L7 9 L3 12'];
function rune(x, y, s, k, a){
  var g = pa(GLYPHES[k % GLYPHES.length]);
  G(x, y, a || 0, s || 1, function(){ X.translate(-5, -6); tracer(g, '#4fe0ff', 5.2, .16); tracer(g, '#4fe0ff', 3.4, .3); tracer(g, '#bff9ff', 1.3); });
}
function toile(x, y, R0, a0, a1, dechire, seed){
  var n = 6, s = '', fils = [];
  for(var i = 0; i < n; i++){ var a = a0 + (a1 - a0) * i / (n - 1); fils.push(a); if(!(dechire && i === 3)) s += 'M' + f(x) + ' ' + f(y) + ' L' + f(x + Math.cos(a) * R0) + ' ' + f(y + Math.sin(a) * R0) + ' '; }
  for(var r = R0 * .22; r < R0; r += R0 * .16){
    for(var i2 = 0; i2 < n - 1; i2++){
      if(dechire && (i2 === 2 || i2 === 3) && r > R0 * .45) continue;
      var aa = fils[i2], bb = fils[i2 + 1], am = (aa + bb) / 2, rm = r * .86;
      s += 'M' + f(x + Math.cos(aa) * r) + ' ' + f(y + Math.sin(aa) * r) + ' Q' + f(x + Math.cos(am) * rm) + ' ' + f(y + Math.sin(am) * rm) + ' ' + f(x + Math.cos(bb) * r) + ' ' + f(y + Math.sin(bb) * r) + ' ';
    }
  }
  if(dechire){ var am2 = fils[3]; s += 'M' + f(x + Math.cos(am2) * R0 * .5) + ' ' + f(y + Math.sin(am2) * R0 * .5) + ' q' + f(Math.cos(am2 + .6) * 6) + ' ' + f(Math.sin(am2 + .6) * 6 + 5) + ' ' + f(Math.cos(am2 + .3) * 4) + ' 10'; }
  var p = pa(s);
  X.save(); X.translate(1, 1.5); tracer(p, '#000', 1.6, .35); X.restore(); tracer(p, '#e8e4f4', .7, .62);
}
function torche(x, y, a){
  var r = a * PI / 180, fx = x + Math.cos(r) * 9, fy = y + Math.sin(r) * 9, Re = rng(Math.round(x * 7 + y)), et = [];
  for(var k = 0; k < 5; k++){ var ea = r + (Re() - .5) * 2.2, ed = 6 + Re() * 13; et.push([fx + Math.cos(ea) * ed, fy + Math.sin(ea) * ed, .5 + Re() * .6, Re() < .5 ? '#ffd27a' : '#ff9a3a', .5 + Re() * .5]); }
  return {b:function(){ G(x, y, a, 1, function(){ Rt(-3, -3, 5, 6, 1, '#2a2430', 1, O, 1); L('M0 0 L 8 0', O, 3.6); L('M0 0 L 8 0', '#7a4a28', 2); }); },
    e:function(){ lum(fx, fy, 26, '#ff9a3a', .7); C(fx, fy, 4.6, '#ff7a1a', .95); C(fx + .4, fy - .4, 3, '#ffc94a'); C(fx + .6, fy - .6, 1.5, '#fff6d0');
      et.forEach(function(q){ C(q[0], q[1], q[2], q[3], q[4]); }); },
    l:[fx, fy, 92, '#ffa04a', .95]};
}
function bougie(x, y){
  return {b:function(){ C(x + .8, y + 1, 2.4, '#000', .4); C(x, y, 2.2, '#efe2c0', 1, O, .8); },
    e:function(){ lum(x, y - 1, 10, '#ffb04a', .8); C(x, y - .5, 1.3, '#ffe08a'); C(x, y - .6, .6, '#fff'); }, l:[x, y, 34, '#ffaa50', .55]};
}
function flaque(x, y, rx, ry, a){
  G(x, y, a || 0, 1, function(){ El(0, 0, rx, ry, '#141e34', 1, '#0a0814', 1); El(rx * .2, -ry * .2, rx * .45, ry * .3, '#4a6aa0', .35); });
}
function engrenage(x, y, r, n, a, c){
  var pts = [];
  for(var i = 0; i < n * 4; i++){ var t = i / (n * 4) * PI * 2 + (a || 0), r2 = (i % 4 < 2) ? r : r * .8; pts.push([x + Math.cos(t) * r2, y + Math.sin(t) * r2]); }
  F(polyD(pts.map(function(p){ return [p[0] + 2, p[1] + 3]; })), '#000', .45);
  var p = pa(polyD(pts)); remplir(p, grad(c || '#8a6a3e', x - r, y - r, x + r, y + r)); tracer(p, O, 1.3);
  C(x, y, r * .55, null, 1, rgba(O, .7), 1); C(x, y, r * .22, '#2a2030', 1, O, 1); C(x + r * .3, y - r * .35, r * .18, '#fff', .2);
}
function signeMur(type, x, y, s){
  var g = pa(SIGNES[type]);
  return {b:function(){ G(x, y, 0, s, function(){ C(1.5, 2, 11.5, '#000', .5); C(0, 0, 11.5, gr('#6e6488', 11.5), 1, O, 1.4); C(0, 0, 9, null, 1, '#3a3250', .8); tracer(g, '#1a1426', 2.6); }); },
    e:function(){ G(x, y, 0, s, function(){ tracer(g, '#4fe0ff', 5.4, .18); tracer(g, '#4fe0ff', 3.6, .3); tracer(g, '#c8faff', 1.3); }); },
    l:[x, y, 34, '#5fe8ff', .55]};
}
/* là où un couloir passe le mur d'une salle (depuis le début, ou depuis la fin) */
function seuil(c, k, fin){
  var r = LIEUX[k]; if(!r || r.couloir) return null;
  for(var t = 0; t <= 1; t += .01){ var tt = fin ? 1 - t : t, a = aFraction(c.m, tt); if(!dansPoly(r.poly, a.x, a.y)) return {x:a.x, y:a.y, ang:a.ang}; }
  return null;
}
function porteSignee(c, type){
  var q = seuil(c, 'portes', 0), a = q.ang * 180 / PI, w = c.l + 10, sg = signeMur(type, q.x - Math.cos(q.ang) * 4, q.y - Math.sin(q.ang) * 4, .82);
  return {b:function(){
      G(q.x, q.y, a, 1, function(){ Rt(-6, -w / 2 + 2, 11, w, 0, '#000', .5); Rt(-5, -w / 2, 10, w, 2, grad('#7a5230', -5, -w / 2, 5, w / 2), 1, O, 1.4);
        L('M-5 ' + f(-w / 4) + ' H5 M-5 ' + f(w / 4) + ' H5', '#3a3044', 2.2); L('M0 ' + f(-w / 2 + 2) + ' V' + f(w / 2 - 2), '#4e3420', .7); });
      sg.b(); },
    e:sg.e, l:sg.l};
}

/* ---------- le décor de chaque lieu : {b (sous la lumière), e (ce qui brille), l (sources de lumière)} ---------- */
function Deco(){ this.b = []; this.e = []; this.l = []; }
Deco.prototype.add = function(o){ if(o.b) this.b.push(o.b); if(o.e) this.e.push(o.e); if(o.l) this.l.push(o.l); return this; };
Deco.prototype.B = function(fn){ this.b.push(fn); return this; };
Deco.prototype.E = function(fn){ this.e.push(fn); return this; };

/* les salles de la version 1 : dessinées dans leurs anciennes coordonnées, puis posées et agrandies de K */
function decoV1(id, vu){
  var D = new Deco();
  switch(id){
  case 'puits':
    D.B(function(){
      mousse(60, 140, 12, 3); mousse(122, 214, 10, 4); mousse(50, 212, 9, 8, '#355f40');
      racine([[58, 136], [62, 146], [58, 156], [63, 164]], 2.2); racine([[114, 138], [110, 147], [117, 154]], 1.6);
      eboulis(118, 146, 8, 4); eboulis(64, 224, 6, 9); flaque(124, 186, 6, 4, 70);
      G(112, 214, 30, 1, function(){ P('M-6 -5 L 6 -5 L 5 6 L -5 6 Z', grad('#6a4628', -6, -5, 6, 6), 1.2); El(0, -5, 6, 2, '#1a1018', 1, O, 1); L('M-6 -1 H6 M-5.5 3 H5.5', '#9a8a7a', .9); });
      var spi = [], cx0 = 64, cy0 = 200;
      for(var k = 0; k <= 40; k++){ var u = k / 40, a = u * PI * 2 * 2.6, r2 = 9.5 - u * 7; spi.push([cx0 + Math.cos(a) * r2, cy0 + Math.sin(a) * r2 * .78]); }
      var dsp = lisse(spi), dc = 'M73.5 199 C 76 188 74 172 72 161';
      El(66, 203, 12, 9, '#000', .32);
      [dsp, dc].forEach(function(d){ L(d, O, 4); L(d, '#c9a46a', 2.4); L(d, '#7a5a34', 2.4, 1, [1, 2.2]); });
      C(72, 160, 2.6, '#d9b47a', 1, O, 1.2);
    });
    D.E(function(){
      X.save(); X.globalCompositeOperation = 'screen';
      lum(72, 160, 48, '#bfe4ff', .55); C(72, 160, 27, '#d8eeff', .2); C(72, 160, 18, '#eef8ff', .12);
      X.restore();
      C(72, 160, 27, null, 1, 'rgba(234,246,255,.3)', 1.4);
      var Rm = rng(4); for(var k2 = 0; k2 < 22; k2++){ var a2 = Rm() * 6.283, d2 = Math.sqrt(Rm()) * 28; C(72 + Math.cos(a2) * d2, 160 + Math.sin(a2) * d2, .5 + Rm() * .9, '#f2faff', .45 + Rm() * .5); }
    });
    D.l.push([72, 160, 76, '#a8d4ff', 1.25]);
    D.add(champis(58, 216, 5, 7)).add(champis(124, 148, 3, 12));
    break;
  case 'rats':
    D.add(torche(256, 141, 90)).add(torche(340, 214, 180));
    D.B(function(){
      caisse(232, 166, 13, 11, 12); caisse(240, 154, 9, 8, -20); sac(332, 160, 30); eboulis(330, 222, 6, 31);
      F('M318 146 a6 4 0 0 1 12 0 Z', '#07040a'); F('M221 228 a4 6 0 0 1 0 -12 Z', '#07040a');
      mousse(232, 222, 8, 21); flaque(296, 214, 7, 3.5, -10);
      var Rp = rng(57);
      for(var k9 = 0; k9 < 70; k9++){ var cxp = k9 < 40 ? 238 : 330, cyp = k9 < 40 ? 168 : 214, a9 = Rp() * 6.283, d9 = Math.sqrt(Rp()) * (k9 < 40 ? 16 : 11), x9 = cxp + Math.cos(a9) * d9, y9 = cyp + Math.sin(a9) * d9 * .8, b9 = Rp() * 3.14;
        L('M' + f(x9) + ' ' + f(y9) + ' l' + f(Math.cos(b9) * 4) + ' ' + f(Math.sin(b9) * 4), Rp() < .5 ? '#a8925a' : '#7a6838', .8, .8); }
      racine([[300, 146], [302, 156], [296, 164], [300, 172]], 1.6); racine([[349, 176], [340, 178], [334, 186]], 1.4);
      if(vu){ os(268, 185, 20, 9); os(274, 190, -40, 7); craneRat(262, 194, 160); os(306, 178, 70, 8); craneRat(314, 186, -30); os(292, 200, 10, 6); os(248, 208, -60, 7); craneRat(300, 170, 200); }
    });
    break;
  case 'reserve':
    D.B(function(){
      tonneau(250, 58, 8); tonneau(264, 52, 6.5); tonneau(248, 76, 6); caisse(320, 56, 14, 12, 8); caisse(322, 70, 10, 9, -12); sac(318, 95, -20); sac(244, 96, 40);
      toile(237, 43, 16, 0, PI / 2, false, 4);
      G(287, 72, 0, 1.45, function(){ coffre(0, 0, vu); });
      if(vu){ piece(270, 84); piece(303, 86); piece(298, 92); piece(276, 92); }
    });
    if(vu) D.E(function(){ lum(287, 72, 18, '#ffcf6a', .45); });
    D.add(bougie(330, 86));
    break;
  case 'canaux':
    D.B(function(){ colonne(218, 302, 6); colonne(218, 374, 6); });
    D.add(torche(226, 282, 90));
    D.E(function(){ G(240, 314, 8, 1, function(){ Rt(-13, -11, 26, 22, 0, '#bfe2ff', .13); [-6.5, 0, 6.5].forEach(function(gx){ Rt(gx - 2.6, -9, 5.2, 18, 0, '#cfeaff', .14); }); }); });
    D.l.push([240, 314, 44, '#9fcaff', .7]);
    D.B(function(){
      Rt(288, 270, 24, 136, 0, '#0a1426'); L('M288 270 V406 M312 270 V406', '#8a84a6', 2.4); L('M287 270 V406 M313 270 V406', O, .8);
      Rt(286, 276, 28, 7, 0, '#07040a'); L('M290 276 V283 M296 276 V283 M302 276 V283 M308 276 V283', '#6a6488', 1.4);
      Rt(286, 393, 28, 7, 0, '#07040a'); L('M290 393 V400 M296 393 V400 M302 393 V400 M308 393 V400', '#6a6488', 1.4);
    });
    D.E(function(){
      Rt(290, 276, 20, 124, 0, '#1f7ad0', .42);
      var Rw = rng(8); for(var k3 = 0; k3 < 14; k3++){ var yy = 280 + k3 * 8.6 + Rw() * 3; L('M' + f(292 + Rw() * 4) + ' ' + f(yy) + ' q4 -2 8 0 t6 0', '#9fe6ff', .8, .35 + Rw() * .4); }
      lum(300, 300, 30, '#3fb0ff', .6); lum(300, 380, 30, '#3fb0ff', .6);
      /* le pont passe au-dessus de l'eau */
      Rt(284, 347, 38, 20, 0, '#000', .4);
      for(var k5 = 0; k5 < 7; k5++) Rt(281 + k5 * 5.4, 343, 5, 19, 1, ['#8a5e34', '#7a5230', '#946a3c'][k5 % 3], 1, O, .9);
      L('M280 342 H319 M280 363 H319', '#5a3a1e', 2.4); C(281, 342, 1.8, '#3a2618'); C(318, 342, 1.8, '#3a2618'); C(281, 363, 1.8, '#3a2618'); C(318, 363, 1.8, '#3a2618');
      rune(206, 338, .9, 2); rune(366, 318, .9, 6); rune(350, 286, .8, 1); rune(368, 390, .8, 4);
    });
    for(var k4 = 0; k4 < 4; k4++) D.l.push([300, 290 + k4 * 30, 52, '#3a9cff', .7]);
    D.l.push([206, 338, 30, '#5fe8ff', .7]); D.l.push([366, 318, 30, '#5fe8ff', .7]);
    D.B(function(){
      mousse(352, 302, 8, 41, '#2e5a48'); mousse(232, 388, 9, 44, '#2e5a48');
      if(vu){ os(343, 334, 30, 7); os(350, 340, -50, 6); G(352, 375, 20, 1, function(){ P('M0 0 L 8 -4 L 6 0 L 9 3 L 0 0 Z', '#3a3448', .8); }); os(236, 352, -10, 6); }
    });
    break;
  case 'givre':
    D.B(function(){
      L('M48 330 q10 -14 26 -8 t30 4', '#dff4ff', 5, .18);
      var Rg = rng(51);
      [[40, 320, 30], [60, 300, 70], [128, 312, 140], [140, 372, 200], [118, 385, 250], [52, 382, 300], [42, 370, 330]].forEach(function(c){
        for(var k = 0; k < 3; k++){ var a = (c[2] + (k - 1) * 22) * PI / 180, lg = 7 + Rg() * 8;
          G(c[0], c[1], a * 180 / PI + 180, 1, function(){ var p = pa('M0 -2.2 L ' + f(lg) + ' -1.2 L ' + f(lg + 3) + ' 0 L ' + f(lg) + ' 1.2 L 0 2.2 Z'); remplir(p, '#bfe8ff', .95); tracer(p, O, .9, .95); L('M1 -1 L ' + f(lg) + ' -.4', '#fff', .7, .8); }); }
      });
      eboulis(130, 375, 5, 61, '#56607a');
    });
    D.E(function(){
      lum(92, 342, 40, '#cfefff', .75);
      G(92, 342, 0, 1, function(){ for(var k6 = 0; k6 < 6; k6++) G(0, 0, k6 * 60, 1, function(){ P('M0 0 C 2 -3 2 -8 0 -10 C -2 -8 -2 -3 0 0 Z', '#eaf8ff', .6); }); C(0, 0, 2.2, '#9fe8ff'); });
      L('M92 352 q-4 6 -2 12 M92 352 q4 5 9 6', '#6ab0a0', 1.2);
    });
    D.l.push([92, 342, 80, '#bfe6ff', 1]);
    break;
  case 'toiles':
    D.B(function(){
      toile(412, 286, 34, 0, PI / 2, vu, 3); toile(528, 286, 30, PI / 2, PI, vu, 5); toile(412, 378, 26, -PI / 2, 0, false, 7); toile(528, 378, 22, PI, PI * 1.5, vu, 9);
      [[424, 302, 20], [431, 313, -10], [500, 370, 60]].forEach(function(c){ G(c[0], c[1], c[2], 1, function(){ El(1, 1.5, 3.6, 5.2, '#000', .4); El(0, 0, 3.4, 5, '#e6e0ee', 1, O, .9); L('M-3 -1 q3 1 6 0 M-3 1.5 q3 1 6 0', '#a8a0b8', .6); }); });
      eboulis(520, 300, 6, 71); mousse(430, 372, 8, 73, '#2e5a48'); racine([[500, 382], [496, 372], [502, 364]], 1.4); mousse(520, 360, 7, 77, '#2e5a48');
      if(vu){
        G(470, 338, 25, 1, function(){ El(1.5, 2, 8, 6, '#000', .45);
          for(var k7 = 0; k7 < 8; k7++){ var a2 = (k7 / 8) * 6.283 + .2; L('M0 0 L ' + f(Math.cos(a2) * 8) + ' ' + f(Math.sin(a2) * 8) + ' l' + f(Math.cos(a2 + 1.6) * 3) + ' ' + f(Math.sin(a2 + 1.6) * 3), '#2a1e24', 1.4); }
          El(0, 0, 6, 4.6, '#4a3428', 1, O, 1); El(-5.5, 0, 3, 2.6, '#3a2a22', 1, O, .9); C(-6.5, -1, .6, '#ff9a5a'); C(-6.5, 1, .6, '#ff9a5a'); });
        os(492, 322, 40, 6); os(448, 346, -20, 5);
      }
    });
    D.add(torche(505, 282, 90)).add(champis(424, 360, 6, 13)).add(champis(516, 306, 5, 19)).add(champis(496, 302, 3, 23));
    break;
  case 'eboulis':
    D.B(function(){
      eboulis(598, 446, 14, 81); eboulis(536, 468, 9, 83); eboulis(540, 440, 7, 85);
      racine([[548, 418], [552, 428], [546, 436]], 1.8); racine([[612, 456], [602, 462], [598, 470]], 1.6);
      var Ro = rng(91); for(var k8 = 0; k8 < 9; k8++) os(566 + (Ro() - .5) * 14, 462 + (Ro() - .5) * 9, Ro() * 180, 5 + Ro() * 4);
      crane(566, 458, 15, 1.1); crane(575, 466, -30, .9);
    });
    D.E(function(){ lum(574, 446, 22, '#a8d0ff', .4); });
    D.l.push([574, 446, 40, '#9ac4ff', .55]);
    break;
  case 'atelier':
    D.B(function(){
      colonne(584, 152, 6); colonne(696, 152, 6); colonne(584, 228, 6); colonne(696, 228, 6);
      engrenage(604, 186, 13, 9, .2, '#8a6a3e'); engrenage(621, 200, 8, 7, .5, '#7a6a5e'); engrenage(683, 210, 10, 8, .1, '#8a6a3e');
      G(652, 154, 0, 1, function(){ Rt(-15, -2, 34, 11, 0, '#000', .4); Rt(-17, -5, 34, 11, 1.5, grad('#7a5230', -17, -5, 17, 6), 1, O, 1.2); L('M-12 -1 l5 3 M2 -2 h8 M-3 2 l4 -3', '#c8c0d0', 1.1); });
      G(668, 226, 0, 1, function(){ Rt(-12, -2, 28, 10, 0, '#000', .4); Rt(-14, -5, 28, 10, 1.5, grad('#7a5230', -14, -5, 14, 5), 1, O, 1.2); C(-6, 0, 2.4, '#a88a5a', 1, O, .8); L('M2 -2 h8', '#c8c0d0', 1.1); });
    });
    D.E(function(){ C(648, 192, 15, null, 1, 'rgba(127,240,255,.75)', 1.2); C(648, 192, 10, null, 1, 'rgba(127,240,255,.5)', .7); rune(648, 192, .8, 4); rune(633, 180, .55, 1); rune(663, 204, .55, 7); });
    D.l.push([648, 192, 50, '#5fe8ff', .8]);
    D.add(torche(690, 140, 90));
    break;
  case 'bibliotheque':
    D.B(function(){
      var Rb = rng(101), cl = ['#8a3a3a', '#3a5a8a', '#6a7a3a', '#8a6a2a', '#5a3a7a'];
      Rt(580, 40, 120, 9, 0, '#3a2418', 1, O, 1);
      for(var x = 582; x < 698; x += 3.4) Rt(x, 41, 3, 5 + Rb() * 3, 0, cl[Math.floor(Rb() * 5)], 1, O, .4);
      F('M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80 L 704 104 L 576 104 Z', '#0e1a2e', .9);
      G(612, 90, 20, 1, function(){ Rt(-5, -4, 10, 8, 0, '#6a2a2a', 1, O, .8); }); G(676, 96, -30, 1, function(){ Rt(-4, -3, 8, 6, 0, '#3a4a7a', 1, O, .8); });
    });
    D.E(function(){ L('M576 70 C 600 60 640 64 660 76 C 680 88 700 86 704 80', '#6ab8ff', 1, .5); lum(690, 62, 12, '#ffd36a', .9); G(690, 62, -10, 1, function(){ Rt(-4, -5, 8, 10, 0, '#f3e7cb', 1, O, .8); }); });
    D.l.push([690, 62, 40, '#ffcf70', .7]); D.l.push([640, 90, 60, '#3a8cff', .5]);
    break;
  case 'ossuaire':
    D.B(function(){
      [[806, 140], [870, 140], [806, 220], [870, 220]].forEach(function(p, k){ Rt(p[0] - 8, p[1] - 5, 16, 10, 3, '#120a18'); crane(p[0] - 3, p[1], k * 40, .8); crane(p[0] + 4, p[1] + 1, -k * 30, .7); });
      G(838, 180, 0, 1, function(){ Rt(-18, -6, 40, 18, 3, '#000', .45); Rt(-20, -9, 40, 18, 3, grad('#5e5478', -20, -9, 20, 9), 1, O, 1.2); L('M-16 -5 H16 M-16 5 H16', '#3a3248', .8); crane(0, 0, 0, 1); });
      [[787, 156], [787, 204], [889, 156], [889, 204]].forEach(function(p, k){ Rt(p[0] - 5, p[1] - 8, 10, 16, 3, '#120a18'); crane(p[0], p[1] - 3, k * 50 + 90, .75); crane(p[0] + 1, p[1] + 4, -k * 40 + 90, .65); });
    });
    D.add(bougie(806, 176)).add(bougie(872, 194)).add(bougie(812, 196));
    break;
  case 'camp':
    D.B(function(){
      G(765, 300, 0, 1, function(){ for(var k = 0; k < 9; k++){ var a = k / 9 * 6.283; C(Math.cos(a) * 11, Math.sin(a) * 9, 3, '#5a5068', 1, O, .9); } L('M-7 -4 L 7 4 M-7 4 L 7 -4', '#4a2e1a', 3.6); });
      G(740, 284, 30, 1, function(){ Rt(-9, -4, 18, 8, 4, '#5a4a6a', 1, O, 1); }); G(790, 316, -20, 1, function(){ Rt(-9, -4, 18, 8, 4, '#6a4a3a', 1, O, 1); });
    });
    D.E(function(){ lum(765, 300, 30, '#ff8a2a', .9); C(765, 300, 6, '#ff7a1a'); C(766, 299, 3.6, '#ffc94a'); C(766, 299, 1.6, '#fff6d0'); });
    D.l.push([765, 300, 90, '#ff9a3a', 1]);
    break;
  case 'bassin':
    D.B(function(){
      var d0 = rrD(760, 450, 134, 70, 32), d1 = rrD(760, 448, 134, 70, 32);
      F(d0, '#000', .45); var p = pa(d1); remplir(p, '#08161a'); tracer(p, '#5e567a', 4); tracer(p, O, 1);
      [[722, 436, 6, 20], [796, 462, 5, 200], [776, 428, 4.5, 120], [742, 470, 3.5, 300]].forEach(function(q){ G(q[0], q[1], q[3], 1, function(){ P('M0 0 L ' + q[2] + ' -1.5 A' + q[2] + ' ' + q[2] + ' 0 1 1 ' + q[2] + ' 1.5 Z', '#3e7a3a', .9); L('M0 0 L ' + f(-q[2] * .6) + ' ' + f(-q[2] * .3), '#2a5a2a', .6); }); });
      G(808, 430, 0, 1, function(){ C(0, 0, 2.6, '#f3f0ff', 1, O, .7); C(0, 0, 1, '#ffd36a'); });
      L('M694 424 l-3 -8 M698 424 l1 -9 M702 425 l4 -7', '#5a7a3a', 1.2); L('M824 472 l3 -8 M828 474 l-1 -9', '#5a7a3a', 1.2);
    });
    D.E(function(){ F(rrD(760, 450, 124, 60, 28), '#1d5a50', .28); L('M712 438 q10 -3 20 0 t20 0 M770 462 q8 -3 16 0 t16 0 M736 470 q6 -2 12 0', '#7fd8c8', .8, .45); });
    D.l.push([760, 448, 70, '#2a8a7a', .5]);
    break;
  case 'porte4':
    var sg4 = function(){
      G(895, 401, 0, 1, function(){ L('M-4 0 Q 0 -3.5 4 0 Q 0 3.5 -4 0 Z', '#bff9ff', 1); C(0, 0, 1.1, '#bff9ff'); });
      G(915, 401, 0, 1, function(){ L('M-4 -1.5 H4 Q 4 4 0 4 Q -4 4 -4 -1.5 Z M-2 -3 q1 -1.5 0 -3 M1.5 -3 q1 -1.5 0 -3', '#bff9ff', 1); });
      G(895, 420, 0, 1, function(){ L('M-3.5 -4 Q -4.5 3 0 4 Q 4.5 3 3.5 -4 M-1.2 -2 V3 M1.2 -2 V3', '#bff9ff', 1); });
      G(915, 420, 0, 1, function(){ L('M0 -4.5 L 1.3 -1.4 L 4.4 -1.4 L 1.9 .6 L 2.8 3.8 L 0 1.9 L -2.8 3.8 L -1.9 .6 L -4.4 -1.4 L -1.3 -1.4 Z', '#bff9ff', .9); });
    };
    D.B(function(){
      G(905, 410, 0, 1, function(){ C(2, 3, 23, '#000', .45); C(0, 0, 23, gr('#6a6080', 23), 1, O, 1.6); C(0, 0, 18, null, 1, '#3a3248', 1); L('M-18 0 H18 M0 -18 V18', '#3a3248', .8); });
      G(906, 440, 0, 1, function(){ El(1, 1.5, 5, 6.5, '#000', .4); El(0, 0, 4.4, 6, gr('#8a8a96', 6), 1, O, .9); C(0, -6, 3.3, gr('#9a9aa6', 3.3), 1, O, .9);
        P('M-2.6 -8 L -2 -10.6 L -.6 -8.6 M2.6 -8 L 2 -10.6 L .6 -8.6', '#9a9aa6', .7); L('M0 6 Q 5 9 7 5', '#8a8a96', 1.6); L('M-1.6 -10 l-1.5 -2 M1.6 -10 l1.5 -2', '#c8c8d0', .6); });
    });
    D.E(function(){ X.save(); X.globalAlpha = .35; X.lineWidth = 3; sg4(); X.restore(); sg4(); });
    D.l.push([905, 410, 44, '#5fe8ff', .7]);
    break;
  case 'leo':
    D.add(bougie(920, 312));
    D.B(function(){ G(892, 330, 10, 1, function(){ Rt(-12, -7, 24, 14, 5, '#8a7a4a', 1, O, 1); }); });
    break;
  }
  return D;
}
function decoNeuf(id, vu){
  var D = new Deco();
  switch(id){
  case 'galerie':
    D.B(function(){
      colonne(1050, 736, 6.5); colonne(1050, 774, 6.5); colonne(1008, 736, 6.5);
      L('M1040 760 l-14 4 l-9 -6 l-12 5 M1010 790 l6 -9', '#0c0812', 1.2, .8);
      var Rb = rng(215);
      [[930, 742, 15], [928, 770, 14], [948, 756, 13], [942, 732, 9], [954, 778, 9], [966, 744, 8], [916, 756, 10]].forEach(function(q){
        var pts = []; for(var k = 0; k < 7; k++){ var a2 = k / 7 * 6.283 + Rb(); pts.push([q[0] + Math.cos(a2) * q[2] * (.75 + Rb() * .35), q[1] + Math.sin(a2) * q[2] * (.75 + Rb() * .35)]); }
        F(polyD(pts.map(function(p){ return [p[0] + 3, p[1] + 4]; })), '#000', .5);
        var p = pa(polyD(pts)); remplir(p, grad(mix('#6a6088', '#3e3550', Rb() * .5), q[0] - q[2], q[1] - q[2], q[0] + q[2], q[1] + q[2])); tracer(p, O, 1.4);
        L('M' + f(q[0] - q[2] * .4) + ' ' + f(q[1] - q[2] * .1) + ' l' + f(q[2] * .5) + ' ' + f(q[2] * .3), '#2a2238', 1);
      });
      eboulis(980, 750, 8, 203); eboulis(978, 734, 4, 207); os(984, 770, 30, 6); os(990, 764, -50, 5);
      G(974, 774, -12, 1.4, function(){ El(2, 3, 8, 6, '#000', .4); P('M-7 1 C -8 -6 7 -7 7 0 C 8 7 -7 8 -7 1 Z', grad('#9a6a38', -8, -7, 8, 8), 1.2); L('M-3 -5 Q 0 -2 3 -5', '#e0b85a', 1.6); P('M-2 -6 L 0 -9 L 2 -6', '#7a4a28', .8); });
      piece(990, 784); piece(996, 777); piece(984, 790); piece(1000, 787); piece(962, 786);
      mousse(1054, 784, 6, 213); racine([[934, 723], [938, 731], [933, 738]], 1.6);
    });
    D.E(function(){ lum(980, 778, 22, '#ffd36a', .8); G(970, 766, 0, 1, function(){ F('M0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z', '#fff6d0'); }); C(996, 777, .9, '#fff6d0');
      lum(944, 752, 26, '#bfe2ff', .6); C(944, 750, 1.6, '#eef8ff', .8); });
    D.add(torche(1036, 723, 90));
    D.l.push([944, 752, 64, '#9ac4ff', .8]);
    break;
  case 'aeration':
    D.B(function(){
      mousse(1172, 532, 9, 221); mousse(1232, 588, 8, 223, '#355f40'); racine([[1186, 516], [1190, 528], [1184, 538]], 1.6); racine([[1228, 522], [1222, 532], [1226, 542]], 1.4);
      flaque(1176, 586, 7, 4, 20); eboulis(1236, 552, 5, 225);
    });
    D.E(function(){
      X.save(); X.globalCompositeOperation = 'screen'; lum(1200, 554, 44, '#bfe4ff', .55); Rt(1178, 532, 44, 44, 3, '#d8eeff', .18); X.restore();
      for(var gx = -22; gx <= 22; gx += 8.8) L('M' + (1200 + gx) + ' 532 V576', '#0a0814', 2.4, .55);
      for(var gy = -22; gy <= 22; gy += 8.8) L('M1178 ' + (554 + gy) + ' H1222', '#0a0814', 2.4, .55);
    });
    D.l.push([1200, 554, 78, '#a8d4ff', 1.2]);
    (function(){
      var Rh = rng(227), tiges = [];
      for(var k = 0; k < 9; k++){ var a3 = -PI / 2 + (k - 4) * .32 + (Rh() - .5) * .2, lg = 9 + Rh() * 7, x0 = 1214 + (Rh() - .5) * 6, y0 = 584;
        tiges.push([x0, y0, x0 + Math.cos(a3 + .5) * lg * .5, y0 + Math.sin(a3 + .5) * lg * .5, x0 + Math.cos(a3) * lg, y0 + Math.sin(a3) * lg]); }
      D.B(function(){ El(1216, 586, 10, 4, '#000', .4); tiges.forEach(function(t){ var d = 'M' + f(t[0]) + ' ' + f(t[1]) + ' Q' + f(t[2]) + ' ' + f(t[3]) + ' ' + f(t[4]) + ' ' + f(t[5]); L(d, O, 3.2); L(d, '#3a9a6a', 1.8); }); });
      D.E(function(){ lum(1214, 576, 22, '#5fffc0', .8); tiges.forEach(function(t){ C(t[4], t[5], 1.9, '#9fffd8'); C(t[4], t[5], .8, '#f0fff8'); }); });
    })();
    D.l.push([1214, 578, 46, '#4fffb8', .7]);
    break;
  case 'portes':
    D.E(function(){ C(2135, 700, 30, null, 1, 'rgba(127,240,255,.5)', 1.1); X.setLineDash([3, 4]); C(2135, 700, 22, null, 1, 'rgba(127,240,255,.35)', .7); X.setLineDash([]);
      rune(2135, 700, .9, 4); rune(2112, 688, .55, 2); rune(2158, 712, .55, 6); });
    D.B(function(){ C(2135, 700, 30, '#2a2236', .5); eboulis(2186, 748, 5, 231); mousse(2084, 750, 6, 233, '#2e5a48'); });
    D.add(torche(2072, 664, 0)).add(torche(2072, 736, 0));
    LIENS.forEach(function(c){ if(c.porte) D.add(porteSignee(c, c.porte)); });
    D.l.push([2135, 700, 46, '#5fe8ff', .6]);
    break;
  case 'crypte':
    D.B(function(){
      G(2296, 700, 0, 1, function(){ Rt(-22, -8, 48, 22, 3, '#000', .45); Rt(-24, -11, 48, 22, 3, grad('#5a5272', -24, -11, 24, 11), 1, O, 1.3); Rt(-20, -7, 40, 14, 2, '#0c0812'); });
      G(2302, 688, 14, 1, function(){ Rt(-22, -6, 48, 16, 3, '#000', .35); Rt(-24, -9, 48, 16, 3, grad('#6a6288', -24, -9, 24, 7), 1, O, 1.3); L('M-18 -1 H18', '#3a3250', 1); });
      toile(2252, 657, 22, 0, PI / 2, false, 31); toile(2348, 743, 20, PI, PI * 1.5, false, 33); os(2268, 728, 30, 7); os(2276, 734, -40, 6); crane(2266, 736, 60, .9); eboulis(2340, 664, 5, 235);
      if(!vu) G(2283, 704, 0, 1, function(){ L('M-6 -4 Q 0 3 6 -4', '#c9a35a', 1.1); P('M0 -1 L 3.4 2.6 L 0 6.4 L -3.4 2.6 Z', '#d8303e', 1.2); C(-1, 1.6, .9, '#ffd0d0'); });
    });
    D.E(function(){ lum(2354, 700, 24, '#6fff9a', .35); if(!vu){ lum(2283, 706, 12, '#ff6a6a', .6); lum(2283, 706, 6, '#ffd36a', .5); } });
    break;
  case 'egouts':
    var dE = LIEUX.egouts.d;
    D.B(function(){
      L(dE, '#07040a', 12); L(dE, '#0b1626', 9);
      mousse(1340, 1140, 8, 241, '#2e5a48'); mousse(1528, 1100, 7, 243, '#2e5a48'); racine([[1410, 1228], [1416, 1218], [1410, 1208]], 1.4);
      [.3, .6].forEach(function(t){ var q = pointSur('egouts', t); G(q.x, q.y, q.ang * 180 / PI, 1, function(){ Rt(-4, -7, 8, 14, 0, '#1a1426', 1, O, .8); L('M-4 -3 H4 M-4 0 H4 M-4 3 H4', '#5a5478', 1); }); });
    });
    D.E(function(){ L(dE, '#1f7ad0', 6, .32); L(dE, '#9fe6ff', .8, .4, [3, 9]); });
    [.2, .5, .8].forEach(function(t){ var q = pointSur('egouts', t); D.l.push([q.x, q.y, 40, '#3a8cff', .45]); });
    break;
  }
  return D;
}
var DECO_CACHE = {};
function deco(id, vu){
  var k = id + (vu ? '+' : '');
  if(DECO_CACHE[k]) return DECO_CACHE[k];
  var S = LIEUX[id], D;
  if(V1[id]){
    var d1 = decoV1(id, vu), v = V1[id];
    var tr = function(fn){ return function(){ X.save(); X.translate(S.x, S.y); X.scale(K, K); X.translate(-v.x, -v.y); fn(); X.restore(); }; };
    D = new Deco(); D.b = d1.b.map(tr); D.e = d1.e.map(tr);
    D.l = d1.l.map(function(q){ return [S.x + (q[0] - v.x) * K, S.y + (q[1] - v.y) * K, q[2] * K, q[3], q[4]]; });
  } else D = decoNeuf(id, vu);
  if(S.signe){ var p = SIGNES_MUR[id]; D.add(signeMur(S.signe, p[0], p[1], 1)); }
  /* la boîte où ce décor peut peindre (ses lumières comprises) */
  var b = S.boite, x0 = b.x - 40, y0 = b.y - 40, x1 = b.x + b.w + 40, y1 = b.y + b.h + 40;
  D.l.forEach(function(q){ x0 = Math.min(x0, q[0] - q[2]); y0 = Math.min(y0, q[1] - q[2]); x1 = Math.max(x1, q[0] + q[2]); y1 = Math.max(y1, q[1] + q[2]); });
  if(id === 'portes'){ x0 -= 20; y0 -= 20; x1 += 20; y1 += 20; }
  D.boite = {x:x0, y:y0, w:x1 - x0, h:y1 - y0};
  return (DECO_CACHE[k] = D);
}
function vieux(){ eboulis(852, 910, 17, 251, '#5e5478'); eboulis(862, 928, 9, 253); }

/* ---------- les motifs (sols, grain, roche) : de petites tuiles faites une fois à l'échelle voulue ---------- */
var MOTIFS = {};
function tuile(w, h, s, fn){
  var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
  var x = c.getContext('2d'), ancien = X; X = x; x.scale(c.width / w, c.height / h); fn(x); X = ancien; return c;
}
function motif(nom, s){
  var k = nom + '@' + s; if(MOTIFS[k]) return MOTIFS[k];
  var c, rot = 0, w = 40, h = 40;
  if(nom === 'dalle') c = tuile(40, 40, s, function(x){
    var R = rng(11), cols = ['#4d4466', '#463e5e', '#544a6e', '#423a58', '#4a4262'];
    x.fillStyle = '#221b30'; x.fillRect(0, 0, 40, 40);
    [[0, 0, 15, 12], [15, 0, 11, 12], [26, 0, 14, 12], [0, 12, 9, 14], [9, 12, 17, 14], [26, 12, 14, 14], [0, 26, 13, 14], [13, 26, 13, 14], [26, 26, 14, 14]].forEach(function(d){
      Rt(d[0] + .7, d[1] + .7, d[2] - 1.4, d[3] - 1.4, 1.6, cols[Math.floor(R() * cols.length)]);
      L('M' + (d[0] + 1.5) + ' ' + (d[1] + d[3] - 1.2) + ' H' + (d[0] + d[2] - 1.2) + ' V' + (d[1] + 1.5), '#000', .8, .25);
      L('M' + (d[0] + 1.2) + ' ' + (d[1] + d[3] - 2) + ' V' + (d[1] + 1.2) + ' H' + (d[0] + d[2] - 2), '#fff', .6, .08);
    });
    for(var i = 0; i < 18; i++) C(R() * 40, R() * 40, .3 + R() * .6, R() < .5 ? '#1a1424' : '#6a6088', .6);
  });
  else if(nom === 'dalle2'){ w = h = 22; rot = -18; c = tuile(22, 22, s, function(x){
    x.fillStyle = '#211a2e'; x.fillRect(0, 0, 22, 22);
    for(var a = 0; a < 2; a++) for(var b = 0; b < 2; b++) Rt(a * 11 + .8, b * 11 + .8, 9.4, 9.4, 1, ['#8e86aa', '#3c3652', '#423b58', '#857da2'][a * 2 + b]);
  }); }
  else if(nom === 'paves'){ w = h = 30; c = tuile(30, 30, s, function(x){
    var R = rng(9); x.fillStyle = '#2a2338'; x.fillRect(0, 0, 30, 30);
    for(var k = 0; k < 26; k++){ var qx = R() * 30, qy = R() * 30, r = 2.4 + R() * 2.6, col = ['#4a4462', '#544c6c', '#433c58'][k % 3];
      [-30, 0, 30].forEach(function(dx){ [-30, 0, 30].forEach(function(dy){ C(qx + dx, qy + dy, r, col); }); }); }
  }); }
  else if(nom === 'planches'){ w = 34; h = 36; c = tuile(34, 36, s, function(x){
    var R = rng(29), bois = ['#5e4432', '#543c2c', '#664a36', '#4e3828'];
    x.fillStyle = '#22160f'; x.fillRect(0, 0, 34, 36);
    for(var y5 = 0; y5 < 4; y5++){ var dec = (y5 % 2) * 17; for(var x5 = -1; x5 < 2; x5++){ var xx = x5 * 34 + dec; Rt(xx + .6, y5 * 9 + .6, 32.8, 7.8, 1, bois[Math.floor(R() * 4)]); C(xx + 3, y5 * 9 + 4.5, .7, '#2a1c14'); C(xx + 30, y5 * 9 + 4.5, .7, '#2a1c14'); } }
  }); }
  else if(nom === 'terre'){ w = h = 36; c = tuile(36, 36, s, function(x){
    var R = rng(17); x.fillStyle = '#332c3e'; x.fillRect(0, 0, 36, 36);
    for(var k2 = 0; k2 < 40; k2++){ var qx = R() * 36, qy = R() * 36, r = .6 + R() * 1.8, col = ['#4a4258', '#3a3346', '#554c66', '#2c2638'][k2 % 4];
      [-36, 0, 36].forEach(function(dx){ [-36, 0, 36].forEach(function(dy){ C(qx + dx, qy + dy, r, col); }); }); }
  }); }
  else if(nom === 'grain' || nom === 'roche'){
    /* un bruit qui se répète sans couture (bruit de valeurs, plusieurs octaves) */
    w = h = nom === 'grain' ? 64 : 320;
    var N = nom === 'grain' ? 64 : 160, oct = nom === 'grain' ? [[64, .45], [32, .3], [16, .25]] : [[4, .4], [8, .28], [16, .18], [32, .14]];
    var val = bruit(N, oct, nom === 'grain' ? 3 : 4);
    var im = document.createElement('canvas'); im.width = im.height = N;
    var ix = im.getContext('2d'), d = ix.createImageData(N, N);
    for(var i = 0; i < N * N; i++){
      var n = val[i];
      if(nom === 'grain'){ var t = n > .5 ? 255 : 0, a = Math.abs(n - .5) * 2; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = t; d.data[i * 4 + 3] = Math.round(a * a * 150); }
      else { d.data[i * 4] = Math.round((.22 * n + .01) * 255); d.data[i * 4 + 1] = Math.round((.18 * n + .005) * 255); d.data[i * 4 + 2] = Math.round((.3 * n + .02) * 255); d.data[i * 4 + 3] = 255; }
    }
    ix.putImageData(d, 0, 0);
    c = tuile(w, h, s, function(x){ x.imageSmoothingEnabled = nom !== 'grain'; x.drawImage(im, 0, 0, w, h); });
  }
  var pat = X.createPattern(c, 'repeat');
  if(pat && pat.setTransform && typeof DOMMatrix !== 'undefined'){
    var m = new DOMMatrix(); if(rot) m = m.rotate(rot); m = m.scale(w / c.width, h / c.height); pat.setTransform(m);
  }
  return (MOTIFS[k] = pat);
}
/* un bruit de valeurs périodique (N × N), somme d'octaves [[cellules, poids]] */
function bruit(N, oct, graine){
  var R = rng(graine * 977 + N), out = new Float32Array(N * N), tot = 0;
  oct.forEach(function(o){
    var g = o[0], w = o[1], grille = []; for(var i = 0; i < g * g; i++) grille.push(R());
    tot += w;
    for(var y = 0; y < N; y++) for(var x = 0; x < N; x++){
      var fx = x / N * g, fy = y / N * g, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      var a = grille[(y0 % g) * g + (x0 % g)], b = grille[(y0 % g) * g + ((x0 + 1) % g)], c = grille[((y0 + 1) % g) * g + (x0 % g)], d = grille[((y0 + 1) % g) * g + ((x0 + 1) % g)];
      out[y * N + x] += w * (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty);
    }
  });
  for(var k = 0; k < N * N; k++) out[k] /= tot;
  return out;
}

/* ---------- la structure : murs de pierre, sols, couloirs (et leurs chemins tout faits) ---------- */
var STRUCT = null;
function structure(){
  if(STRUCT) return STRUCT;
  var salles = ORDRE.filter(function(k){ return !LIEUX[k].couloir; }).map(function(k){ return LIEUX[k]; });
  var cou = LIENS.filter(function(c){ return !c.secret; });
  var sol = salles.map(function(r){ return r.d; }).concat(cou.map(function(c){ return polyD(c.poly); })).concat([cercleD(J.x, J.y, J.r)]).join(' ');
  /* les pierres des murs : le long des salles (vers l'extérieur) et des deux côtés des couloirs */
  var R = rng(23), teintes = ['#4e4466', '#574c72', '#463d5c', '#5f547c', '#4a4060', '#3f3752'], pierres = [];
  function bloc(x, y, a, lg, ep){ pierres.push([x, y, a, lg, ep, teintes[Math.floor(R() * teintes.length)]]); }
  salles.forEach(function(r){
    leLong(r.poly, 12.5, true).forEach(function(p){ var nx = Math.sin(p.ang), ny = -Math.cos(p.ang); bloc(p.x + nx * MUR / 2, p.y + ny * MUR / 2, p.ang, 10.5 + R() * 3.8, MUR - 1.6); });
  });
  cou.forEach(function(c){
    var lw = c.l / 2 + MUR / 2;
    leLong(c.ligne, 12, false, 0).forEach(function(p){ var nx = -Math.sin(p.ang), ny = Math.cos(p.ang);
      bloc(p.x + nx * lw, p.y + ny * lw, p.ang, 10 + R() * 3.8, MUR - 1.6); bloc(p.x - nx * lw, p.y - ny * lw, p.ang, 10 + R() * 3.8, MUR - 1.6); });
  });
  leLong(cerclePoly(J.x, J.y, J.r), 11, true).forEach(function(p){ var nx = Math.sin(p.ang), ny = -Math.cos(p.ang); bloc(p.x + nx * MUR / 2, p.y + ny * MUR / 2, p.ang, 10, MUR - 1.6); });
  /* les seuils : deux grosses pierres de chaque côté des portes */
  var seuils = [];
  cou.forEach(function(c){ [c.de, c.a].forEach(function(k, fin){ var q = seuil(c, k, fin); if(!q) return; var nx = -Math.sin(q.ang), ny = Math.cos(q.ang), lw = c.l / 2 + 3.5;
    [1, -1].forEach(function(sg){ seuils.push([q.x + nx * lw * sg, q.y + ny * lw * sg, q.ang]); }); }); });
  return (STRUCT = {salles:salles, cou:cou, sol:sol, pierres:pierres, seuils:seuils});
}
function solDe(id){ return id === 'reserve' ? 'planches' : (id === 'puits' || id === 'aeration') ? 'paves' : (id === 'eboulis' || id === 'givre') ? 'terre' : 'dalle'; }
function coupe(b, z, m){ m = m || 0; return b.x - m < z.x + z.w && b.x + b.w + m > z.x && b.y - m < z.y + z.h && b.y + b.h + m > z.y; }

/* les toiles de travail (une seule fois chacune) */
var TRAV = {};
function travail(nom, w, h){ var c = TRAV[nom]; if(!c){ c = TRAV[nom] = document.createElement('canvas'); } if(c.width !== w || c.height !== h){ c.width = w; c.height = h; } return c; }

/* peint la zone z (en unités) dans ctx (qui fait z.w × s sur z.h × s pixels) */
function dessiner(ctx, o){
  o = o || {};
  var s = o.echelle || 1, z = o.zone || {x:0, y:0, w:W, h:H}, etats = o.etats || {};
  var cw = ctx.canvas.width, ch = ctx.canvas.height, S = structure();
  var monde = function(c){ c.setTransform(s, 0, 0, s, -z.x * s, -z.y * s); };
  var ancien = X, ancienE = ECH; X = ctx; ECH = s;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = '#100b16'; ctx.fillRect(0, 0, cw, ch);
  monde(ctx);
  /* 1. la roche */
  ctx.fillStyle = motif('roche', s); ctx.fillRect(z.x, z.y, z.w, z.h);
  /* 2. le contour sombre, puis la bande des murs */
  var salles = S.salles.filter(function(r){ return coupe(r.boite, z, MUR + 30); }), cou = S.cou.filter(function(c){ return coupe(c.boite, z, 30); });
  var jIci = coupe({x:J.x - 40, y:J.y - 40, w:80, h:80}, z);
  function formes(ep, couleur, motifMur){
    ctx.fillStyle = couleur; ctx.strokeStyle = couleur; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    salles.forEach(function(r){ var p = pa(r.d); ctx.fill(p); if(ep){ ctx.lineWidth = ep; ctx.stroke(p); } });
    cou.forEach(function(c){ ctx.lineWidth = c.l + ep; ctx.stroke(pa(lisse(c.pts))); });
    if(jIci){ ctx.beginPath(); ctx.arc(J.x, J.y, J.r + ep / 2, 0, 2 * PI); ctx.fill(); }
  }
  formes(2 * MUR + 5, '#0a0710');
  formes(2 * MUR, '#2a2238');
  S.pierres.forEach(function(q){
    if(q[0] < z.x - 20 || q[0] > z.x + z.w + 20 || q[1] < z.y - 20 || q[1] > z.y + z.h + 20) return;
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]);
    Rt(-q[3] / 2, -q[4] / 2, q[3], q[4], 2.2, q[5], 1, '#120c1a', 1.1); ctx.restore();
  });
  ctx.globalAlpha = .5; formes(2 * MUR, motif('grain', s)); ctx.globalAlpha = 1;
  /* 3. le bord du sol, puis le sol */
  formes(3, '#120c1a');
  cou.forEach(function(c){ ctx.lineWidth = c.l; ctx.strokeStyle = motif(c.salle === 'dalles' ? 'dalle2' : 'dalle', s); ctx.lineCap = c.salle === 'dalles' ? 'butt' : 'round'; ctx.stroke(pa(lisse(c.pts))); });
  ctx.lineCap = 'round';
  if(jIci){ ctx.fillStyle = motif('dalle', s); ctx.beginPath(); ctx.arc(J.x, J.y, J.r, 0, 2 * PI); ctx.fill(); }
  salles.forEach(function(r){ ctx.fillStyle = motif(solDe(r.id), s); ctx.fill(pa(r.d)); });
  S.seuils.forEach(function(q){ if(q[0] < z.x - 10 || q[0] > z.x + z.w + 10 || q[1] < z.y - 10 || q[1] > z.y + z.h + 10) return;
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]); Rt(-5, -5, 10, 10, 2, grad('#6a5e88', -5, -5, 5, 5), 1, '#120c1a', 1.2); ctx.restore(); });
  /* 4. l'ombre des murs sur le sol (un flou du « hors sol », gardé dans le sol), et le grain du sol */
  var solP = pa(S.sol), t1 = travail('ombre', cw, ch), x1 = t1.getContext('2d');
  x1.setTransform(1, 0, 0, 1, 0, 0); x1.globalCompositeOperation = 'source-over'; x1.clearRect(0, 0, cw, ch);
  x1.fillStyle = '#07040c'; x1.fillRect(0, 0, cw, ch); monde(x1); x1.globalCompositeOperation = 'destination-out'; x1.fill(solP); x1.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.clip(solP); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowColor = 'rgba(7,4,12,.85)'; ctx.shadowBlur = 9 * 2 * s; ctx.shadowOffsetX = cw + 50; ctx.drawImage(t1, -(cw + 50), 0);
  ctx.restore();
  ctx.save(); ctx.clip(solP); ctx.globalAlpha = .45; ctx.fillStyle = motif('grain', s); ctx.fillRect(z.x, z.y, z.w, z.h); ctx.restore();
  /* 5. le décor, sous la lumière */
  var decos = ORDRE.map(function(k){ return deco(k, etats[k] === 'vu'); }).filter(function(D){ return coupe(D.boite, z); });
  decos.forEach(function(D){ D.b.forEach(function(fn){ fn(); }); });
  if(coupe({x:820, y:880, w:70, h:70}, z)) vieux();
  /* 6. la lumière : l'ambiance sombre, les salles éclairées doucement, et les sources (multipliée par-dessus) */
  var t2 = travail('lumiere', cw, ch), x2 = t2.getContext('2d');
  x2.setTransform(1, 0, 0, 1, 0, 0); x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1; x2.fillStyle = '#2a2440'; x2.fillRect(0, 0, cw, ch);
  monde(x2); X = x2; x2.globalCompositeOperation = 'screen';
  flou(10, 'rgba(110,102,152,.9)', function(){ salles.forEach(function(r){ X.fill(pa(r.d)); }); });
  flou(8, 'rgba(94,86,136,1)', function(){ X.lineCap = 'round'; X.lineJoin = 'round'; cou.forEach(function(c){ X.lineWidth = 30; X.stroke(pa(lisse(c.pts))); }); });
  var lumieres = []; decos.forEach(function(D){ lumieres = lumieres.concat(D.l); });
  ORDRE.forEach(function(k){ var D = deco(k, etats[k] === 'vu'); if(decos.indexOf(D) < 0) D.l.forEach(function(q){ if(coupe({x:q[0] - q[2], y:q[1] - q[2], w:2 * q[2], h:2 * q[2]}, z)) lumieres.push(q); }); });
  lumieres.forEach(function(q){ lum(q[0], q[1], q[2], q[3], q[4]); });
  X = ctx;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(t2, 0, 0); ctx.restore();
  /* 7. ce qui brille, puis la lueur douce des sources */
  decos.forEach(function(D){ D.e.forEach(function(fn){ fn(); }); });
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  lumieres.forEach(function(q){ lum(q[0], q[1], q[2] * .7, q[3], q[4] * .22); });
  ctx.restore();
  ctx.restore();
  X = ancien; ECH = ancienE;
}

/* la carte peinte en morceaux de 512 px, un par tâche, en commençant près du centre demandé */
function rendre(canvas, o){
  o = o || {};
  var s = o.echelle || 1, z = o.zone || EMPREINTE, MG = 40, CH = 512;
  var cw = Math.round(z.w * s), chh = Math.round(z.h * s);
  if(canvas.width !== cw || canvas.height !== chh){ canvas.width = cw; canvas.height = chh; }
  var ctx = canvas.getContext('2d'), file = [], arret = false, timer = null;
  function planifier(zw){
    for(var y = 0; y < chh; y += CH) for(var x = 0; x < cw; x += CH){
      var w = Math.min(CH, cw - x), h = Math.min(CH, chh - y);
      var wz = {x:z.x + x / s, y:z.y + y / s, w:w / s, h:h / s};
      if(zw && !coupe(wz, zw)) continue;
      if(file.some(function(m){ return m.x === x && m.y === y; })) continue;
      file.push({x:x, y:y, w:w, h:h, cx:wz.x + wz.w / 2, cy:wz.y + wz.h / 2});
    }
    var c = o.centre || {x:z.x + z.w / 2, y:z.y + z.h / 2};
    file.sort(function(a, b){ return Math.hypot(a.cx - c.x, a.cy - c.y) - Math.hypot(b.cx - c.x, b.cy - c.y); });
  }
  function un(){
    timer = null;
    if(arret) return;
    var m = file.shift();
    if(!m){ if(o.fin) o.fin(); return; }
    var t = travail('morceau', m.w + 2 * MG, m.h + 2 * MG), tx = t.getContext('2d');
    dessiner(tx, {echelle:s, zone:{x:z.x + (m.x - MG) / s, y:z.y + (m.y - MG) / s, w:(m.w + 2 * MG) / s, h:(m.h + 2 * MG) / s}, etats:o.etats});
    ctx.drawImage(t, MG, MG, m.w, m.h, m.x, m.y, m.w, m.h);
    if(o.morceau) o.morceau(m, file.length);
    timer = setTimeout(un, 0);
  }
  planifier(null);
  timer = setTimeout(un, 0);
  return {
    arreter:function(){ arret = true; if(timer) clearTimeout(timer); },
    redessiner:function(zw, etats){ if(etats) o.etats = etats; planifier(zw); if(!timer && !arret) timer = setTimeout(un, 0); },
    reste:function(){ return file.length; },
    /* tout de suite (pour les tests et les captures) */
    finir:function(){ while(file.length){ if(timer){ clearTimeout(timer); timer = null; } un(); } if(timer){ clearTimeout(timer); timer = null; } if(o.fin) o.fin(); }
  };
}

/* ======================================================================
   6. La brume de Brumeval
   Un canvas de basse définition (0,5 px par unité) sur toute la carte, que le navigateur étire : ses bords restent doux.
   On y fait des trous (gomme floue) là où l'équipe est passée. Pour lever la brume d'un lieu en douceur, on garde deux
   copies de la zone AVANT (dont une à moitié ouverte) que la vue estompe l'une après l'autre (opacity : carte graphique).
   ====================================================================== */
function peindreBrume(ctx, fs){
  var cw = ctx.canvas.width, ch = ctx.canvas.height, ancien = X, ancienE = ECH; X = ctx; ECH = fs;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  /* 1. le corps : un nuage doux, gris-violet, avec des bancs plus clairs (deux bruits, étirés) */
  var N = 96, nx = 160, ny = 100, a = bruit(N, [[3, .45], [6, .3], [12, .17], [24, .08]], 7), b = bruit(N, [[2, .5], [5, .35], [10, .15]], 33);
  var im = document.createElement('canvas'); im.width = nx; im.height = ny;
  var ix = im.getContext('2d'), d = ix.createImageData(nx, ny);
  var bas = hx('#1c1830'), mil = hx('#423c62'), haut = hx('#6a6290'), banc = hx('#9a92c0');
  for(var y = 0; y < ny; y++) for(var x = 0; x < nx; x++){
    var i = y * nx + x, u = a[(Math.floor(y / ny * N) % N) * N + Math.floor(x / nx * N) % N], v = b[(Math.floor(y / ny * N * .7) % N) * N + Math.floor(x / nx * N * .7) % N];
    u = Math.max(0, Math.min(1, (u - .5) * 2.2 + .5));
    var c0 = u < .5 ? bas : mil, c1 = u < .5 ? mil : haut, t = u < .5 ? u * 2 : (u - .5) * 2;
    var k = Math.max(0, Math.min(.55, (v - .56) * 3));
    for(var j = 0; j < 3; j++){ var c = c0[j] + (c1[j] - c0[j]) * t; d.data[i * 4 + j] = Math.round(c + (banc[j] - c) * k); }
    /* plus sombre vers les bords de la carte */
    var bx = Math.min(x, nx - 1 - x) / (nx * .14), by = Math.min(y, ny - 1 - y) / (ny * .16), e = Math.min(1, Math.min(bx, by));
    for(var j2 = 0; j2 < 3; j2++) d.data[i * 4 + j2] = Math.round(d.data[i * 4 + j2] * (.55 + .45 * e));
    d.data[i * 4 + 3] = 255;
  }
  ix.putImageData(d, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(im, 0, 0, cw, ch);
  /* 2. les volutes : des enroulements dessinés, doux (trois passes : l'ombre, le clair, le fil) */
  ctx.setTransform(fs, 0, 0, fs, 0, 0);
  var R = rng(7), groupes = [[], [], []];
  for(var q = 0; q < 230; q++){
    var x0 = -80 + R() * (W + 160), y0 = -20 + R() * (H + 40), L0 = 90 + R() * 170, sens = R() < .5 ? 1 : -1, r0 = 11 + R() * 20, amp = 6 + R() * 16, ph = R() * 6.28, pente = (R() - .5) * .35;
    var w = 7 + R() * 12, o = .07 + R() * .09, pts = [];
    for(var k2 = 0; k2 <= 12; k2++){ var tt = k2 / 12; pts.push([x0 + L0 * tt, y0 + L0 * tt * pente + Math.sin(ph + tt * 3) * amp]); }
    var fin = pts[12], a0 = Math.atan2(pts[12][1] - pts[11][1], pts[12][0] - pts[11][0]) - sens * PI / 2, cx = fin[0] - Math.cos(a0) * r0, cy = fin[1] - Math.sin(a0) * r0;
    for(var k3 = 1; k3 <= 18; k3++){ var uu = k3 / 18, aa = a0 + sens * uu * PI * 1.65, rr2 = r0 * (1 - uu * .55); pts.push([cx + Math.cos(aa) * rr2, cy + Math.sin(aa) * rr2]); }
    groupes[o < .1 ? 0 : o < .13 ? 1 : 2].push({d:lisse(pts), w:w, o:o});
  }
  groupes.forEach(function(gp){
    if(!gp.length) return;
    var om = gp.reduce(function(s2, v2){ return s2 + v2.o; }, 0) / gp.length;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    flou(6, rgba('#08050e', Math.min(1, om * 1.8)), function(){ gp.forEach(function(v2){ X.save(); X.translate(2, v2.w * .55); X.lineWidth = v2.w + 6; X.stroke(pa(v2.d)); X.restore(); }); });
    flou(3.5, rgba('#9c94c0', om), function(){ gp.forEach(function(v2){ X.lineWidth = v2.w; X.stroke(pa(v2.d)); }); });
    ctx.globalAlpha = Math.min(1, om * 1.1); ctx.strokeStyle = '#d6d0f0'; ctx.lineWidth = 1.6;
    gp.forEach(function(v2){ ctx.save(); ctx.translate(0, -v2.w * .38); ctx.stroke(pa(v2.d)); ctx.restore(); });
    ctx.globalAlpha = 1;
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  X = ancien; ECH = ancienE;
}
/* les petites bosses du bord d'un trou (pour que la brume ne suive pas le mur au cordeau) */
function bosses(id, poly, n){
  var R = rng(id.split('').reduce(function(s, c){ return s * 31 + c.charCodeAt(0) & 65535; }, 7)), out = [], pas = Math.max(1, Math.floor(poly.length / n));
  for(var i = 0; i < poly.length; i += pas){ var p = poly[i]; out.push([p[0] + (R() - .5) * 30, p[1] + (R() - .5) * 30, 16 + R() * 20]); }
  return out;
}
function brume(canvas, o){
  o = o || {};
  var fs = o.echelle || .5, cw = Math.round(W * fs), ch = Math.round(H * fs);
  canvas.width = cw; canvas.height = ch;
  var ctx = canvas.getContext('2d');
  var vierge = document.createElement('canvas'); vierge.width = cw; vierge.height = ch;
  peindreBrume(vierge.getContext('2d'), fs);
  ctx.drawImage(vierge, 0, 0);
  var etat = {lieux:{}, liens:{}, j:false};
  /* les formes des trous, en unités : {type:'lieu'|'lien'|'j', ...} */
  function formesDe(id){ var l = LIEUX[id]; return l ? [{type:'lieu', id:id}] : []; }
  function peindreTrou(c, f2, k){
    /* c : contexte (en px de brume) ; k : 0..1, la taille du trou (1 = complet) */
    var ancien = X, ancienE = ECH; X = c; ECH = fs;
    c.save(); c.setTransform(fs, 0, 0, fs, 0, 0); c.globalCompositeOperation = 'destination-out';
    var flouU = 13;
    if(f2.type === 'lieu'){
      var L = LIEUX[f2.id];
      if(L.couloir){
        flou(flouU, '#000', function(){ X.lineCap = 'round'; X.lineJoin = 'round'; X.lineWidth = (L.l + 2 * MUR + 26) * (k < 1 ? .6 + .4 * k : 1);
          var pts = k < 1 ? morceau(LIEN[f2.id].m, .5 - k / 2, .5 + k / 2) : L.ligne; X.stroke(pa(polyD(pts, false))); });
      } else {
        flou(flouU, '#000', function(){
          X.save(); X.translate(L.x, L.y); X.scale(k, k); X.translate(-L.x, -L.y);
          var p = pa(L.d); X.fill(p); X.lineWidth = 2 * MUR + 34; X.lineJoin = 'round'; X.stroke(p);
          bosses(f2.id, L.poly, 10).forEach(function(q){ X.beginPath(); X.arc(q[0], q[1], q[2], 0, 2 * PI); X.fill(); });
          X.restore();
        });
      }
    } else if(f2.type === 'lien'){
      var c2 = LIEN[f2.id], t0 = f2.t0, t1 = f2.t0 + (f2.t1 - f2.t0) * k;
      if(t1 - t0 > .001) flou(flouU, '#000', function(){ X.lineCap = 'round'; X.lineJoin = 'round'; X.lineWidth = c2.l + 2 * MUR + 26; X.stroke(pa(polyD(morceau(c2.m, t0, t1), false))); });
    } else if(f2.type === 'j'){
      flou(flouU, '#000', function(){ X.beginPath(); X.arc(J.x, J.y, (J.r + MUR + 18) * k, 0, 2 * PI); X.fill(); });
    }
    c.restore(); X = ancien; ECH = ancienE;
  }
  function boiteDe(f2){
    var m = 60;
    if(f2.type === 'lieu') return boite(LIEUX[f2.id].poly, m + 20);
    if(f2.type === 'lien') return boite(morceau(LIEN[f2.id].m, f2.t0, f2.t1), m + LIEN[f2.id].l);
    return {x:J.x - 80, y:J.y - 80, w:160, h:160};
  }
  /* ajoute un morceau de couloir [t0, t1] (dans le sens de/a) ; rend la forme nouvelle, ou null si déjà vu */
  function ajouterLien(id, t0, t1){
    var c2 = LIEN[id]; if(!c2) return null;
    if(t1 < t0){ var t = t0; t0 = t1; t1 = t; }
    var l = etat.liens[id] || (etat.liens[id] = []);
    var deja = l.some(function(m){ return m[0] <= t0 + .001 && m[1] >= t1 - .001; });
    if(deja) return null;
    l.push([t0, t1]);
    /* on fusionne */
    l.sort(function(p, q){ return p[0] - q[0]; });
    var r = [l[0]]; for(var i = 1; i < l.length; i++){ var dr = r[r.length - 1]; if(l[i][0] <= dr[1] + .001) dr[1] = Math.max(dr[1], l[i][1]); else r.push(l[i]); }
    etat.liens[id] = r;
    return {type:'lien', id:id, t0:t0, t1:t1};
  }
  /* ce qu'ouvre la découverte d'un lieu : le lieu, le début de ses couloirs (45 %), et l'embranchement s'il touche */
  function aOuvrir(id){
    var out = [];
    if(id === 'J'){
      if(!etat.j){ etat.j = true; out.push({type:'j'}); }
      liens('J').forEach(function(c2){ var f3 = c2.de === 'J' ? ajouterLien(c2.id, 0, .45) : ajouterLien(c2.id, .55, 1); if(f3) out.push(f3); });
      return out;
    }
    var L = LIEUX[id]; if(!L) return out;
    if(!etat.lieux[id]){ etat.lieux[id] = true; out.push({type:'lieu', id:id}); }
    if(L.couloir){ var f4 = ajouterLien(id, 0, 1); if(f4) out.push(f4); }
    liens(id).forEach(function(c2){
      if(c2.secret || c2.salle === id) return;
      var tout = c2.court || c2.bouche || (c2.de === id ? etat.lieux[c2.a] : etat.lieux[c2.de]);
      if(c2.boucle){ [ajouterLien(c2.id, 0, .1), ajouterLien(c2.id, .9, 1)].forEach(function(f5){ if(f5) out.push(f5); }); return; }
      var f6 = c2.de === id ? ajouterLien(c2.id, 0, tout ? 1 : .45) : ajouterLien(c2.id, tout ? 0 : .55, 1);
      if(f6) out.push(f6);
      if(c2.court && (c2.de === 'J' || c2.a === 'J')) out = out.concat(aOuvrir('J'));
    });
    return out;
  }
  function decouvrir(id, opt){
    opt = opt || {};
    var nouveau = typeof id === 'object' ? [id] : aOuvrir(id);
    if(!nouveau.length) return null;
    var zone = null;
    nouveau.forEach(function(f2){ var b = boiteDe(f2); zone = zone ? {x:Math.min(zone.x, b.x), y:Math.min(zone.y, b.y), w:Math.max(zone.x + zone.w, b.x + b.w) - Math.min(zone.x, b.x), h:Math.max(zone.y + zone.h, b.y + b.h) - Math.min(zone.y, b.y)} : b; });
    var res = {formes:nouveau, zone:zone};
    if(opt.anim){
      /* deux copies de la zone, AVANT : entière, et à moitié ouverte */
      var px0 = Math.max(0, Math.floor(zone.x * fs)), py0 = Math.max(0, Math.floor(zone.y * fs)), pw = Math.min(cw - px0, Math.ceil(zone.w * fs)), ph = Math.min(ch - py0, Math.ceil(zone.h * fs));
      var A = document.createElement('canvas'), B = document.createElement('canvas');
      A.width = B.width = pw; A.height = B.height = ph;
      A.getContext('2d').drawImage(canvas, px0, py0, pw, ph, 0, 0, pw, ph);
      var bx = B.getContext('2d'); bx.drawImage(canvas, px0, py0, pw, ph, 0, 0, pw, ph);
      bx.translate(-px0, -py0);
      nouveau.forEach(function(f2){ var t = bx.getTransform ? bx.getTransform() : null; peindreTrouDecale(bx, f2, .45, px0, py0); });
      res.avant = [A, B]; res.px = {x:px0 / fs, y:py0 / fs, w:pw / fs, h:ph / fs};
    }
    nouveau.forEach(function(f2){ peindreTrou(ctx, f2, 1); });
    return res;
  }
  function peindreTrouDecale(c, f2, k, dx, dy){
    /* comme peindreTrou, mais dans une petite toile qui commence en (dx, dy) px */
    var ancien = X, ancienE = ECH; X = c; ECH = fs;
    var tmp = {setTransform:null};
    c.save(); c.setTransform(1, 0, 0, 1, -dx, -dy);
    var vrai = c.setTransform; c.setTransform = function(a, b2, c3, d, e, g){ vrai.call(c, a, b2, c3, d, e - dx, g - dy); };
    peindreTrou(c, f2, k);
    c.setTransform = vrai; c.restore(); X = ancien; ECH = ancienE;
  }
  function toutRepeindre(){
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, cw, ch); ctx.drawImage(vierge, 0, 0);
    Object.keys(etat.lieux).forEach(function(k){ peindreTrou(ctx, {type:'lieu', id:k}, 1); });
    Object.keys(etat.liens).forEach(function(k){ etat.liens[k].forEach(function(m){ peindreTrou(ctx, {type:'lien', id:k, t0:m[0], t1:m[1]}, 1); }); });
    if(etat.j) peindreTrou(ctx, {type:'j'}, 1);
  }
  return {
    canvas:canvas, echelle:fs,
    decouvrir:decouvrir,
    decouvrirLien:function(id, t0, t1, depuis, opt){
      var c2 = LIEN[id]; if(!c2) return null;
      if(depuis && c2.a === depuis && c2.de !== depuis){ var a0 = 1 - t1, a1 = 1 - t0; t0 = a0; t1 = a1; }
      var f2 = ajouterLien(id, t0, t1); return f2 ? decouvrir(f2, opt) : null;
    },
    estVu:function(id){ return !!etat.lieux[id]; },
    etat:function(){ return JSON.parse(JSON.stringify(etat)); },
    restaurer:function(e){ etat = {lieux:Object.assign({}, e && e.lieux), liens:JSON.parse(JSON.stringify((e && e.liens) || {})), j:!!(e && e.j)}; toutRepeindre(); },
    oublier:function(){ etat = {lieux:{}, liens:{}, j:false}; toutRepeindre(); }
  };
}

/* ======================================================================
   7. Le pion des héros (vu du dessus) et la rose des vents : de petits SVG pour des <img> (aucun filtre)
   ====================================================================== */
var ROLES = {pisteur:['#3b8f5a', '#6fd08e'], alchimiste:['#6a3fb0', '#b48cf0'], sage:['#2f55b0', '#7fa8ff']};
function svgGrad(defs, c, fort){ fort = fort || 1; var id = 'g' + defs.length; defs.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .28 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .45 * fort) + '"/></linearGradient>'); return 'url(#' + id + ')'; }
function sL(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
function sC(x, y, r, fl, x2){ return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fl + '"' + (x2 || '') + '/>'; }
function silhouette(defs, role, x, y, a){
  var c = ROLES[role][0], cl = ROLES[role][1], s = '';
  s += '<ellipse cx="1.5" cy="4" rx="10.5" ry="9.5" fill="#000" opacity=".45"/>';
  if(role === 'pisteur') s += sL('M-6 -11 Q -13.5 -6 -11 3', O, 3.8) + sL('M-6 -11 Q -13.5 -6 -11 3', '#c08a44', 2.1) + sL('M-6 -11 L -11 3', '#f3e7cb', .6);
  if(role === 'sage') s += sL('M7.5 -13 L 8.5 6', O, 3.4) + sL('M7.5 -13 L 8.5 6', '#9a7a4a', 1.8);
  s += '<path d="M-6.5 -5 C -9.5 -2 -11 6 -9.5 10.5 C -6 13.5 6 13.5 9.5 10.5 C 11 6 9.5 -2 6.5 -5 C 3.5 -7.5 -3.5 -7.5 -6.5 -5 Z" fill="' + svgGrad(defs, c) + '" stroke="' + O + '" stroke-width="1.7" stroke-linejoin="round"/>';
  s += sL('M-4.5 1 Q -5.5 7 -4.5 11.6 M4.5 1 Q 5.5 7 4.5 11.6', sombre(c, .5), 1);
  if(role === 'pisteur') s += '<rect x="2.6" y="1" width="3.6" height="9" rx="1" fill="#7a4a28" stroke="' + O + '" stroke-width=".9" transform="rotate(16 4.4 5.5)"/>' + sC(3.6, 1.2, 1.1, '#e04a3a') + sC(5.8, 1.8, 1.1, '#f3e7cb');
  s += sC(-5.4, -7.2, 1.9, '#e0a878', ' stroke="' + O + '" stroke-width="1"') + sC(5.4, -7.2, 1.9, '#e0a878', ' stroke="' + O + '" stroke-width="1"');
  s += '<path d="M-3.2 -1 L 0 6.5 L 3.2 -1 Z" fill="' + sombre(c, .15) + '" stroke="' + O + '" stroke-width="1.2" stroke-linejoin="round"/>';
  s += '<circle cx="0" cy="-3" r="5.8" fill="' + svgGrad(defs, cl, .8) + '" stroke="' + O + '" stroke-width="1.7"/>';
  s += '<path d="M-3.8 -7.4 Q 0 -9.6 3.8 -7.4 Q 0 -6.2 -3.8 -7.4 Z" fill="' + sombre(c, .65) + '"/>' + sC(1.6, -4.6, 1.7, '#fff', ' opacity=".4"');
  if(role === 'alchimiste') s += sC(5.6, -10.5, 6, '#ff8a2a', ' opacity=".35"') + sC(5.6, -10.5, 2.8, '#ff7a2a', ' stroke="' + O + '" stroke-width="1"') + sC(5, -11.2, 1, '#ffe0a0');
  if(role === 'sage') s += sC(7.5, -14, 7, '#9ff4ff', ' opacity=".4"') + sC(7.5, -14, 2.4, '#e8fdff', ' stroke="#2a6a8a" stroke-width=".7"');
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')">' + s + '</g>';
}
/* les trois héros en triangle, tournés vers dir (degrés, 0 = est) ; viewBox -30 -30 60 60 */
function pionSVG(dir){
  dir = dir || 0;
  var defs = [], r = dir * PI / 180, cs = Math.cos(r), sn = Math.sin(r), s = '';
  function rot(qx, qy){ return [qx * cs - qy * sn, qx * sn + qy * cs]; }
  var pos = {pisteur:rot(11, 0), alchimiste:rot(-7, -10.5), sage:rot(-7, 10.5)};
  ['alchimiste', 'sage', 'pisteur'].forEach(function(k){ s += silhouette(defs, k, pos[k][0], pos[k][1], dir + 90); });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 60" width="120" height="120"><defs>' + defs.join('') + '</defs>' + s + '</svg>';
}
function roseSVG(){
  var ENC = '#3b2414', ROU = '#8e2e1c', s = '<circle r="28" fill="#000" opacity=".45" transform="translate(1 2)"/><circle r="28" fill="#e2cc9c" stroke="' + O + '" stroke-width="2.5"/><circle r="24.5" fill="none" stroke="#7a5a36" stroke-width=".8"/>';
  for(var k = 0; k < 32; k++){ var a = k / 32 * 6.283; s += sL('M' + f(Math.cos(a) * 21.5) + ' ' + f(Math.sin(a) * 21.5) + ' L' + f(Math.cos(a) * (k % 4 ? 23 : 24.5)) + ' ' + f(Math.sin(a) * (k % 4 ? 23 : 24.5)), ENC, .6); }
  for(var k2 = 7; k2 >= 0; k2--){
    var a2 = k2 / 8 * 6.283 - PI / 2, lg = k2 % 2 ? 9 : (k2 === 0 ? 8 : 17), la = k2 % 2 ? 1.6 : 2.7;
    var qx = Math.cos(a2) * lg, qy = Math.sin(a2) * lg + 4, gx = Math.cos(a2 - PI / 2) * la, gy = Math.sin(a2 - PI / 2) * la + 4, dx = Math.cos(a2 + PI / 2) * la, dy = Math.sin(a2 + PI / 2) * la + 4;
    s += '<path d="M0 4 L' + f(gx) + ' ' + f(gy) + ' L' + f(qx) + ' ' + f(qy) + ' Z" fill="' + (k2 === 0 ? ROU : ENC) + '"/><path d="M0 4 L' + f(dx) + ' ' + f(dy) + ' L' + f(qx) + ' ' + f(qy) + ' Z" fill="#f2e4c0" stroke="' + ENC + '" stroke-width=".6"/>';
  }
  s += sC(0, 4, 1.6, ENC) + '<text x="0" y="-12.5" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="700" font-family="Macondo, Georgia, serif" stroke="#e2cc9c" stroke-width="2.6" paint-order="stroke" fill="' + ROU + '">N</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-31 -31 62 62" width="124" height="124">' + s + '</svg>';
}
function svgURL(svg){ return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

/* ======================================================================
   8. La vue toute faite : la carte, la brume, les étiquettes, le pion, les sorties ; on la fait glisser au doigt
   ====================================================================== */
var CSS_VUE = '.cd-vue{position:relative;overflow:hidden;touch-action:none;background:#0b0810;-webkit-user-select:none;user-select:none;cursor:grab}' +
  '.cd-vue.glisse{cursor:grabbing}' +
  '.cd-couche{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}' +
  '.cd-couche canvas,.cd-couche img{position:absolute;display:block;pointer-events:none}' +
  '.cd-patch{position:absolute;pointer-events:none}' +
  '.cd-etiq{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;white-space:nowrap;padding:3px 11px 3px 8px;border-radius:12px;' +
    'background:#f6ead0;color:#35281b;border:2px solid #24182e;box-shadow:0 2px 0 rgba(0,0,0,.45);font:700 13px/1.15 Andika,"Trebuchet MS",system-ui,sans-serif;pointer-events:none;opacity:0;transition:opacity .6s}' +
  '.cd-etiq.vu{opacity:1}.cd-etiq i{font-style:normal;font-size:13px}' +
  '.cd-pion{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none}' +
  '.cd-pion>*{position:absolute;left:0;top:0;pointer-events:none}' +
  '.cd-halo{width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;background:radial-gradient(circle,rgba(200,246,255,.32),rgba(159,240,255,.12) 45%,rgba(159,240,255,0) 70%)}' +
  '.cd-anneau{width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;border:3px solid #ffd36a;box-shadow:0 0 0 2px #24182e,inset 0 0 0 2px #24182e,0 0 14px rgba(255,176,64,.55);animation:cd-anneau 1.8s ease-in-out infinite}' +
  '.cd-onde{width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;border:2px solid #ffd36a;opacity:0;animation:cd-onde 1.8s ease-out infinite}' +
  '.cd-heros{width:60px;height:60px;margin:-30px 0 0 -30px}' +
  '@keyframes cd-anneau{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}' +
  '@keyframes cd-onde{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.5);opacity:0}}' +
  '.cd-sortie{position:absolute;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;border:0;padding:0;background:radial-gradient(circle,rgba(255,207,106,.55),rgba(255,207,106,0) 70%);cursor:pointer;touch-action:manipulation}' +
  '.cd-sortie b{position:absolute;inset:7px;border-radius:50%;border:2px solid rgba(255,211,106,.6);display:grid;place-items:center;color:#fff0b8;font:900 20px/1 system-ui;text-shadow:0 0 3px #24182e,0 0 3px #24182e;animation:cd-sortie 1.6s ease-in-out infinite}' +
  '@keyframes cd-sortie{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}' +
  '@media (prefers-reduced-motion: reduce){.cd-anneau,.cd-onde,.cd-sortie b{animation:none}}';
function injecterCSS(){ if(document.getElementById('cd-style')) return; var st = document.createElement('style'); st.id = 'cd-style'; st.textContent = CSS_VUE; document.head.appendChild(st); }
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }

function vue(el, o){
  o = o || {};
  injecterCSS();
  var dpr = window.devicePixelRatio || 1;
  var z = o.zoom || borne((el.clientWidth || 960) / 960, .7, 1.4);
  var E = EMPREINTE;
  el.classList.add('cd-vue'); el.innerHTML = '';
  var couche = document.createElement('div'); couche.className = 'cd-couche'; el.appendChild(couche);
  var carte = document.createElement('canvas'); carte.className = 'cd-carte'; couche.appendChild(carte);
  var brumeC = document.createElement('canvas'); brumeC.className = 'cd-brume'; couche.appendChild(brumeC);
  var patchs = document.createElement('div'); couche.appendChild(patchs);
  var etiqs = document.createElement('div'); couche.appendChild(etiqs);
  var sortiesEl = document.createElement('div'); couche.appendChild(sortiesEl);
  var pionEl = document.createElement('div'); pionEl.className = 'cd-pion';
  pionEl.innerHTML = '<div class="cd-halo"></div><div class="cd-onde"></div><div class="cd-anneau"></div><img class="cd-heros" alt="">';
  couche.appendChild(pionEl);
  var imgHeros = pionEl.querySelector('.cd-heros'), dirPion = null;
  var etats = o.etats || {};
  /* la carte, peinte en morceaux (rien de long d'un coup) */
  var s = o.echelle || borne(Math.round(z * dpr * 4) / 4, 1, 2);
  var depart = o.centre || {x:LIEUX.puits.x, y:LIEUX.puits.y};
  var rd = rendre(carte, {echelle:s, zone:E, centre:depart, etats:etats, fin:o.pret});
  var B = brume(brumeC, {echelle:o.echelleBrume || .5});
  if(o.brume) B.restaurer(o.brume);
  /* les étiquettes */
  var etiq = {};
  ORDRE.forEach(function(k){
    var L = LIEUX[k], p = ETIQ[k]; if(!p) return;
    var e = document.createElement('div'); e.className = 'cd-etiq'; e.dataset.lieu = k;
    e.innerHTML = '<i aria-hidden="true">' + L.ic + '</i><span>' + L.nom + '</span>';
    etiqs.appendChild(e); etiq[k] = e;
  });
  function majEtiquettes(){ ORDRE.forEach(function(k){ if(etiq[k]) etiq[k].classList.toggle('vu', B.estVu(k)); }); }
  function placer(){
    carte.style.left = E.x * z + 'px'; carte.style.top = E.y * z + 'px'; carte.style.width = E.w * z + 'px'; carte.style.height = E.h * z + 'px';
    brumeC.style.left = '0px'; brumeC.style.top = '0px'; brumeC.style.width = W * z + 'px'; brumeC.style.height = H * z + 'px';
    ORDRE.forEach(function(k){ var e = etiq[k], p = ETIQ[k]; if(e){ e.style.left = p[0] * z + 'px'; e.style.top = p[1] * z + 'px'; } });
    var t = Math.max(.75, Math.min(1.25, z));
    pionEl.style.setProperty('--k', t);
    [].forEach.call(pionEl.children, function(c){ c.style.scale = ''; });
    pionEl.firstChild.style.transform = '';
    posePion();
    majSorties();
  }
  /* --- la position (glisser) --- */
  var tx = 0, ty = 0, raf = 0, anim = null, elan = 0;
  function vw(){ return el.clientWidth; } function vh(){ return el.clientHeight; }
  function bornerT(){ tx = borne(tx, Math.min(0, vw() - W * z), 0); ty = borne(ty, Math.min(0, vh() - H * z), 0); }
  function poser(){ raf = 0; couche.style.transform = 'translate3d(' + Math.round(tx * 10) / 10 + 'px,' + Math.round(ty * 10) / 10 + 'px,0)'; }
  function demander(){ if(!raf) raf = requestAnimationFrame(poser); }
  function arreterAnim(){
    if(elan){ cancelAnimationFrame(elan); elan = 0; }
    if(anim){
      var m = getComputedStyle(couche).transform;
      if(m && m !== 'none'){ var v = m.match(/-?[\d.e]+/g).map(Number); if(v.length >= 6){ tx = v[v.length === 6 ? 4 : 12]; ty = v[v.length === 6 ? 5 : 13]; } }
      anim.cancel(); anim = null; poser();
    }
  }
  function centrer(cible, opt){
    opt = opt || {};
    var p = typeof cible === 'string' ? (LIEUX[cible] || (cible === 'J' ? J : null)) : cible;
    if(!p) return Promise.resolve();
    arreterAnim();
    var x0 = tx, y0 = ty;
    tx = vw() / 2 - p.x * z; ty = vh() / 2 - p.y * z; bornerT();
    if(!opt.anim || (Math.abs(tx - x0) < 1 && Math.abs(ty - y0) < 1) || !couche.animate){ poser(); return Promise.resolve(); }
    var de = 'translate3d(' + x0 + 'px,' + y0 + 'px,0)', a = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
    poser();
    anim = couche.animate([{transform:de}, {transform:a}], {duration:opt.duree || 700, easing:'cubic-bezier(.3,.7,.3,1)'});
    var mon = anim;
    return new Promise(function(ok){ mon.onfinish = function(){ if(anim === mon) anim = null; ok(); }; mon.oncancel = function(){ ok(); }; });
  }
  /* glisser au doigt, avec un peu d'élan au lâcher */
  var doigt = null;
  function bas(e){
    if(doigt || (e.target.closest && e.target.closest('button'))) return;
    arreterAnim();
    doigt = {id:e.pointerId, x:e.clientX, y:e.clientY, tx:tx, ty:ty, t:performance.now(), bouge:false, hist:[[performance.now(), e.clientX, e.clientY]]};
    try{ el.setPointerCapture(e.pointerId); }catch(er){}
  }
  function bouge(e){
    if(!doigt || e.pointerId !== doigt.id) return;
    var dx = e.clientX - doigt.x, dy = e.clientY - doigt.y;
    if(!doigt.bouge && Math.abs(dx) + Math.abs(dy) > 8){ doigt.bouge = true; el.classList.add('glisse'); }
    if(!doigt.bouge) return;
    tx = doigt.tx + dx; ty = doigt.ty + dy; bornerT(); demander();
    var n = performance.now(); doigt.hist.push([n, e.clientX, e.clientY]); while(doigt.hist.length > 6) doigt.hist.shift();
  }
  function haut(e){
    if(!doigt || e.pointerId !== doigt.id) return;
    var d = doigt; doigt = null; el.classList.remove('glisse');
    if(!d.bouge){
      var r = el.getBoundingClientRect(), wx = (e.clientX - r.left - tx) / z, wy = (e.clientY - r.top - ty) / z;
      if(o.surToucher) o.surToucher(wx, wy, lieuEn(wx, wy));
      return;
    }
    var h = d.hist, a = h[0], b = h[h.length - 1], dt = b[0] - a[0];
    if(dt <= 0 || performance.now() - b[0] > 80) return;
    var vx = (b[1] - a[1]) / dt, vy = (b[2] - a[2]) / dt, t0 = performance.now();
    function pas(t){
      var k = Math.exp(-(t - t0) / 260), ux = vx * k, uy = vy * k;
      tx += ux * 16; ty += uy * 16; bornerT(); poser();
      if(Math.hypot(ux, uy) > .03 && t - t0 < 900) elan = requestAnimationFrame(pas); else elan = 0;
    }
    elan = requestAnimationFrame(pas);
  }
  el.addEventListener('pointerdown', bas);
  el.addEventListener('pointermove', bouge);
  el.addEventListener('pointerup', haut);
  el.addEventListener('pointercancel', function(e){ if(doigt && e.pointerId === doigt.id){ doigt = null; el.classList.remove('glisse'); } });
  /* --- la brume qui se lève --- */
  function decouvrir(id, opt){
    opt = opt || {};
    var r = B.decouvrir(id, {anim:opt.anim !== false});
    majEtiquettes();
    if(!r || !r.avant) return Promise.resolve(r);
    var P = r.px, cA = r.avant[0], cB = r.avant[1];
    [cB, cA].forEach(function(c){ c.className = 'cd-patch'; c.style.left = P.x * z + 'px'; c.style.top = P.y * z + 'px'; c.style.width = P.w * z + 'px'; c.style.height = P.h * z + 'px'; patchs.appendChild(c); });
    if(!cA.animate){ cA.remove(); cB.remove(); return Promise.resolve(r); }
    var d = opt.duree || 1500;
    var a1 = cA.animate([{opacity:1}, {opacity:0}], {duration:d * .45, easing:'ease-in', fill:'forwards'});
    var a2 = cB.animate([{opacity:1, transform:'scale(1)'}, {opacity:0, transform:'scale(1.04)'}], {duration:d * .7, delay:d * .3, easing:'ease-out', fill:'forwards'});
    return new Promise(function(ok){ a2.onfinish = function(){ cA.remove(); cB.remove(); ok(r); }; });
  }
  /* --- le pion --- */
  var pion = {x:depart.x, y:depart.y, dir:0};
  function posePion(){ pionEl.style.transform = 'translate3d(' + pion.x * z + 'px,' + pion.y * z + 'px,0)'; }
  function orienter(dir){
    var d = Math.round(((dir % 360) + 360) % 360 / 15) * 15;
    if(d === dirPion) return; dirPion = d; imgHeros.src = svgURL(pionSVG(d));
  }
  function deplacer(id, depuis, opt){
    opt = opt || {};
    var pts = trace(id, depuis, opt.t0, opt.t1); if(pts.length < 2) return Promise.resolve();
    /* du centre du lieu jusqu'au début du couloir ; et, au bout, jusqu'au centre du lieu d'arrivée (opt.vers) */
    if(opt.depuisPion !== false && Math.hypot(pts[0][0] - pion.x, pts[0][1] - pion.y) > 2) pts.unshift([pion.x, pion.y]);
    if(opt.vers){
      var V = typeof opt.vers === 'string' ? (LIEUX[opt.vers] || (opt.vers === 'J' ? J : null)) : opt.vers;
      var estCouloir = typeof opt.vers === 'string' && LIEUX[opt.vers] && LIEUX[opt.vers].couloir;
      if(V && !estCouloir) pts.push([V.x, V.y]);
    }
    var m = mesure(pts), n = Math.max(2, Math.round(m.L / 18)), kf = [];
    for(var i = 0; i <= n; i++){ var q = aFraction(m, i / n); kf.push({transform:'translate3d(' + f(q.x * z) + 'px,' + f(q.y * z) + 'px,0)', offset:i / n}); }
    var fin = aFraction(m, 1), deb = aFraction(m, 0);
    orienter(Math.atan2(fin.y - deb.y, fin.x - deb.x) * 180 / PI);
    pion.x = fin.x; pion.y = fin.y;
    var duree = opt.duree || Math.max(500, m.L * 4.2);
    if(opt.suivre !== false) centrer({x:fin.x, y:fin.y}, {anim:true, duree:duree});
    if(!pionEl.animate){ posePion(); return Promise.resolve(); }
    var a = pionEl.animate(kf, {duration:duree, easing:'ease-in-out'});
    posePion();
    return new Promise(function(ok){ a.onfinish = function(){ ok(); }; a.oncancel = function(){ ok(); }; });
  }
  /* --- les sorties (des chevrons dorés au début des couloirs) --- */
  var sorties = [], surSortie = null;
  function majSorties(){
    sortiesEl.innerHTML = '';
    sorties.forEach(function(q, i){
      var p = pointSur(q.lien, q.t == null ? .42 : q.t, q.depuis); if(!p) return;
      var b = document.createElement('button'); b.className = 'cd-sortie'; b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', q.nom || 'Aller par là');
      b.style.left = p.x * z + 'px'; b.style.top = p.y * z + 'px';
      b.innerHTML = '<b style="rotate:' + Math.round(p.ang * 180 / PI) + 'deg">»</b>';
      b.addEventListener('click', function(ev){ ev.stopPropagation(); if(surSortie) surSortie(q); });
      sortiesEl.appendChild(b);
    });
  }
  placer(); majEtiquettes(); orienter(o.dir || 0);
  centrer(depart);
  var aRedim = function(){
    var zn = o.zoom || borne((el.clientWidth || 960) / 960, .7, 1.4);
    if(Math.abs(zn - z) > .001){ var cx = (vw() / 2 - tx) / z, cy = (vh() / 2 - ty) / z; z = zn; placer(); centrer({x:cx, y:cy}); }
    else { bornerT(); poser(); }
  };
  window.addEventListener('resize', aRedim);
  return {
    get z(){ return z; },
    brume:B, rendu:rd, el:el, couche:couche,
    decouvrir:decouvrir,
    decouvrirLien:function(id, t0, t1, depuis){ var r = B.decouvrirLien(id, t0, t1, depuis, {anim:false}); majEtiquettes(); return r; },
    centrer:centrer,
    pion:function(x, y, dir){ if(typeof x === 'string'){ var L = LIEUX[x]; pion.x = L.x; pion.y = L.y; } else { pion.x = x; pion.y = y; } if(dir != null) orienter(dir); posePion(); },
    deplacer:deplacer,
    sorties:function(liste, fn){ sorties = liste || []; surSortie = fn || null; majSorties(); },
    redessiner:function(id, nouveauxEtats){ if(nouveauxEtats) etats = nouveauxEtats; var D = deco(id, etats[id] === 'vu'); rd.redessiner(D.boite, etats); },
    position:function(){ return {tx:tx, ty:ty, z:z}; },
    etat:function(){ return {brume:B.etat(), pion:{x:pion.x, y:pion.y, dir:dirPion}}; },
    detruire:function(){ rd.arreter(); arreterAnim(); window.removeEventListener('resize', aRedim); el.innerHTML = ''; el.classList.remove('cd-vue'); }
  };
}

global.CARTE_DONJON = {
  W:W, H:H, MUR:MUR, SOL:SOL,
  LIEUX:LIEUX, ORDRE:ORDRE, LIENS:LIENS, LIEN:LIEN, J:J, SECRET:SECRET, VIEUX:VIEUX, ETIQ:ETIQ, SIGNES:SIGNES, SIGNES_MUR:SIGNES_MUR,
  EMPREINTE:EMPREINTE, PLAN:PLAN, PIGPEN:PIGPEN, ROLES:ROLES,
  liens:liens, voisins:voisins, chemin:chemin, lieuEn:lieuEn, trace:trace, pointSur:pointSur,
  longueur:function(id){ return LIEN[id] ? LIEN[id].m.L : 0; },
  dessiner:dessiner, rendre:rendre, brume:brume, vue:vue,
  pionSVG:pionSVG, roseSVG:roseSVG, svgURL:svgURL,
  /* des outils de géométrie, pour le plan du Sage */
  util:{f:f, rng:rng, mix:mix, clair:clair, sombre:sombre, lisse:lisse, lissePts:lissePts, polyD:polyD, rrD:rrD, cercleD:cercleD, blobD:blobD,
    dansPoly:dansPoly, boite:boite, leLong:leLong, mesure:mesure, aFraction:aFraction, morceau:morceau, contourTrait:contourTrait, V1:V1, K:K, seuil:seuil}
};
})(typeof window !== 'undefined' ? window : this);
