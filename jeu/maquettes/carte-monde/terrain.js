/* ==========================================================
   Brumeval — la grande carte (maquette du 12 novembre) : le terrain
   Le sol, la forêt, les eaux, les collines, les chemins et les arbres autour du village.
   Tout est en unités du grand monde (3000 × 2000) ; l'ancienne carte est posée en (1000, 320).
   ========================================================== */
'use strict';
var O = require('./outils');
var f = O.f, C = O.CONTOUR, W = O.W, H = O.H, OX = O.OX, OY = O.OY;

/* ---------- Les eaux ---------- */
/* La rivière : les mêmes points que l'ancienne carte dans le village, prolongée jusqu'au lac (nord-est) et vers le sud */
var RIVIERE = [[2150,400],[2080,378],[2020,352],[1972,362],[1940,420],[1925,500],[1945,650],[1915,820],[1925,1020],[1950,1220],[1925,1440],[1955,1740],[1975,1860],[1960,2030]];
/* Le ruisseau : il naît à la Source (nord-ouest), traverse le village (anciens points) et file au sud */
var RUISSEAU = [[800,345],[838,420],[905,520],[972,628],[1030,740],[1048,920],[1062,1080],[1082,1270],[1112,1410],[1150,1485],[1170,1610],[1180,1740],[1172,1860],[1190,2030]];
var LAC = {x:2330, y:350, rx:250, ry:140, graine:21};
var ETANG = {x:430, y:1340, rx:165, ry:105, graine:8};
var RU_ETANG = [[575,1372],[700,1420],[850,1446],[990,1426],[1106,1412]];   /* le petit ru qui sort de l'étang */
var MARAIS = {x:2480, y:1665, rx:420, ry:225, graine:5};
var MARES = [[2300,1600,95,48,3],[2540,1560,120,50,4],[2720,1690,110,56,6],[2420,1760,130,50,7],[2180,1720,70,40,9],[2640,1820,90,36,11]];
var LAC_PTS = O.tachePts(LAC.x, LAC.y, LAC.rx, LAC.ry, LAC.graine, 16, .09);
var ETANG_PTS = O.tachePts(ETANG.x, ETANG.y, ETANG.rx, ETANG.ry, ETANG.graine, 12, .13);
var MARAIS_PTS = O.tachePts(MARAIS.x, MARAIS.y, MARAIS.rx, MARAIS.ry, MARAIS.graine, 18, .12);

/* ---------- La forêt du nord : son bord (la lisière), d'est en ouest ---------- */
function lisiereAncienne(X){ var x = X - OX; return OY + 452 + 14 * Math.sin(x / 47) + 8 * Math.sin(x / 13); }
var LIS_EST = [[3000,455],[2880,465],[2760,436],[2680,450],[2600,430],[2575,385],[2330,345],[2100,368],[2112,420],[2146,480],[2172,580],[2156,680],[2096,742],[2040,772],[2000,lisiereAncienne(2000)]];
var LIS_OUEST = [[1000,lisiereAncienne(1000)],[930,768],[820,752],[700,742],[560,722],[430,702],[300,694],[180,702],[80,692],[0,700]];
function onduler(pts, graine){   /* un bord qui ondule un peu, comme celui de l'ancienne carte */
  var e = O.echantillons(pts, 25), out = [];
  for(var i = 0; i < e.length; i++){ var w = (i === 0 || i === e.length - 1) ? 0 : 1; out.push([e[i][0] + w * 6 * Math.sin(i * 1.7 + graine), e[i][1] + w * (9 * Math.sin(i * .55 + graine) + 5 * Math.sin(i * 1.9))]); }
  return out;
}
var LISIERE = (function(){
  var l = onduler(LIS_EST, 1);
  for(var X = 2000 - 25; X > 1000; X -= 25) l.push([X, lisiereAncienne(X)]);
  return l.concat(onduler(LIS_OUEST, 4));
})();
var FORET_NORD = [[0,0],[W,0]].concat(LISIERE);

/* Les petits bois (un sol sombre et des arbres) : x, y, rx, ry, graine, sombre */
var BOIS = [
  {x:118, y:1700, rx:150, ry:215, g:31, sombre:true},    /* le bois du cimetière */
  {x:330, y:1905, rx:290, ry:80, g:32, sombre:true},
  {x:150, y:1262, rx:112, ry:78, g:33},                  /* entre la porte et l'étang */
  {x:2740, y:822, rx:170, ry:150, g:34, sombre:true},    /* le bois des Os */
  {x:1255, y:1880, rx:180, ry:72, g:35},                 /* les bois du sud */
  {x:1790, y:1885, rx:150, ry:66, g:36},
  {x:905, y:1790, rx:120, ry:95, g:37},
  {x:2250, y:845, rx:118, ry:70, g:38},                  /* un bosquet sur l'autre rive */
  {x:2575, y:1345, rx:120, ry:58, g:39}
];
BOIS.forEach(function(b){ b.pts = O.tachePts(b.x, b.y, b.rx, b.ry, b.g, 12, .15); });

/* Les collines : x, y, rx, ry */
var COLLINES = [[450,892,205,148],[256,1090,128,96],[2700,1262,140,108],[705,1105,120,70],[2520,1215,140,74],[2130,905,95,58],[880,1320,105,62],[640,1500,130,70],[2255,1395,0,0]].filter(function(c){ return c[2]; });

/* Les champs : x, y, largeur, hauteur, couleur, couleur des sillons */
var CHAMPS = [[2052,1268,104,92,'#e7c766','#c7a144'],[2318,1300,170,84,'#9ccf72','#6fa850'],[1196,1770,160,84,'#e7c766','#c7a144'],[1650,1766,180,90,'#f1cf4f','#b98d1f']];

/* Les clairières dans les bois : x, y, rx, ry (les arbres s'en écartent) */
var CLAIRIERES = [[720,628,122,80],[800,338,86,62],[392,300,98,58],[266,560,112,90],[1230,208,92,66],[1652,246,92,48],[2706,812,100,78]];

/* ---------- Les chemins ---------- */
var ROUTE = 'route', SENTIER = 'sentier', PISTE = 'piste';   /* la route de terre (large), le sentier, la piste presque effacée (en tirets) */
var CHEMINS = [
  {id:'est', t:ROUTE, l:32, pts:[[1962,1065],[2060,1068],[2180,1052],[2320,1034],[2480,1048],[2640,1085],[2800,1078],[2920,1055],[3030,1040]]},
  {id:'sud', t:'rue', l:52, pts:[[1500,1740],[1500,1800],[1500,1880],[1500,2030]]},   /* la rue des Lanternes continue, toute droite, jusqu'à l'Arche */
  {id:'berge', t:SENTIER, pts:[[2012,1052],[2036,930],[2052,800],[2082,690],[2112,600],[2150,525],[2192,480],[2250,502],[2300,512]]},
  {id:'lac-manoir', t:SENTIER, pts:[[2300,512],[2400,526],[2500,540],[2556,580],[2566,690],[2572,762]]},
  {id:'roulottes', t:SENTIER, pts:[[2392,1040],[2410,1000],[2428,968]]},
  {id:'manoir', t:SENTIER, pts:[[2432,884],[2440,832],[2452,790],[2572,762],[2630,728],[2650,668]]},
  {id:'labyrinthe', t:SENTIER, pts:[[2452,790],[2442,752]]},
  {id:'bergerie', t:SENTIER, pts:[[2180,1052],[2176,1110],[2172,1150]]},
  {id:'marais', t:SENTIER, pts:[[2200,1268],[2216,1340],[2240,1430],[2270,1498]]},
  {id:'observatoire', t:SENTIER, pts:[[2640,1085],[2668,1150],[2688,1205]]},
  {id:'os', t:PISTE, pts:[[2700,1082],[2716,990],[2714,902]]},
  {id:'gue', t:SENTIER, pts:[[1222,1124],[1160,1142],[1104,1142],[1068,1140],[1016,1130],[940,1098],[850,1050],[740,995],[640,955],[560,926],[505,908]]},
  {id:'tour', t:SENTIER, pts:[[452,822],[420,770],[376,700],[326,640],[296,600]]},
  {id:'mine', t:SENTIER, pts:[[272,512],[262,440],[288,372],[334,322]]},
  {id:'bucherons', t:SENTIER, pts:[[1084,668],[1040,668],[997,655],[930,648],[840,634],[780,628]]},
  {id:'bucherons-tour', t:SENTIER, pts:[[668,618],[560,602],[450,590],[370,580],[326,574]]},
  {id:'source', t:SENTIER, pts:[[736,572],[770,484],[794,404],[800,372]]},
  {id:'etang', t:SENTIER, pts:[[472,962],[490,1060],[480,1160],[462,1232]]},
  {id:'rucher', t:SENTIER, pts:[[940,1098],[890,1130],[840,1162]]},
  {id:'pecheur', t:SENTIER, pts:[[782,1216],[712,1256],[652,1280]]},
  {id:'porte', t:PISTE, pts:[[380,940],[330,996],[290,1050],[270,1084]]},
  {id:'cimetiere', t:SENTIER, pts:[[342,1442],[316,1520],[306,1596],[312,1634]]},
  {id:'lavoir-ouest', t:SENTIER, pts:[[1112,1497],[1040,1502],[940,1520],[850,1548],[800,1562],[700,1576],[580,1592],[440,1602],[352,1616],[316,1630]]},
  {id:'rond', t:SENTIER, pts:[[1205,398],[1192,322],[1212,258],[1228,232]]},
  {id:'grotte', t:SENTIER, pts:[[1736,404],[1722,332],[1692,272],[1664,238]]},
  {id:'bois-sombre', t:PISTE, pts:[[1152,204],[1002,192],[852,206],[702,196],[562,226],[462,262]]}
];
CHEMINS.forEach(function(c){ c.l = c.l || (c.t === PISTE ? 14 : 20); c.e = O.echantillons(c.pts, 18); });
var RIV_E = O.echantillons(RIVIERE, 20), RUI_E = O.echantillons(RUISSEAU, 20), RU_E = O.echantillons(RU_ETANG, 20);

function dessinChemin(c, pv){
  if(c.t === 'rue') return '';   /* dessinée à part (rueDuSud) */
  if(c.t === ROUTE) return O.chemin(c.pts, c.l, '#c4a777', '#6b5236');
  if(c.t === PISTE) return '<path d="' + O.lisse(c.pts) + '" fill="none" stroke="#6b5236" stroke-width="' + (c.l + 4) + '" stroke-linecap="round" stroke-dasharray="4 26" opacity=".55"/>' +
    '<path d="' + O.lisse(c.pts) + '" fill="none" stroke="#c9ad7c" stroke-width="' + c.l + '" stroke-linecap="round" stroke-dasharray="4 26" opacity=".9"/>';
  return O.chemin(c.pts, c.l, '#b99a6a', '#6b5236');
}

/* ---------- Les dessins du sol ---------- */
function defs(p){
  function rad(id, stops, cx, cy, rr){ return '<radialGradient id="' + p + id + '" cx="' + (cx || '35%') + '" cy="' + (cy || '30%') + '" r="' + (rr || '75%') + '">' + stops + '</radialGradient>'; }
  function lin(id, stops){ return '<linearGradient id="' + p + id + '" x1="0" y1="0" x2="0" y2="1">' + stops + '</linearGradient>'; }
  function st(o, c, a){ return '<stop offset="' + o + '" stop-color="' + c + '"' + (a !== undefined ? ' stop-opacity="' + a + '"' : '') + '/>'; }
  var s = '';
  s += rad('s0', st(0,'#6fae95') + st(.55,'#2f6f60') + st(1,'#163f3c'));          /* les arbres du Bois Sombre */
  s += rad('s1', st(0,'#5c9a8c') + st(.55,'#275c58') + st(1,'#123338'));
  s += rad('s2', st(0,'#7fb08a') + st(.55,'#3a7052') + st(1,'#1c4636'));
  s += lin('foretS', st(0,'#173d38') + st(1,'#1f4c3f'));                           /* le sol du Bois Sombre */
  s += lin('marais', st(0,'#7d9462') + st(1,'#5f7a52'));
  s += rad('eauM', st(0,'#74a59a') + st(1,'#3a6763'), '45%', '40%', '70%');
  s += lin('roche', st(0,'#c9c2d6') + st(.6,'#9a93b0') + st(1,'#6f6888'));
  s += rad('colline', st(0,'#a6dc88') + st(.7,'#86c474') + st(1,'#6fb267'), '38%', '32%', '75%');
  s += lin('os', st(0,'#fbf5e6') + st(1,'#d9cdb2'));
  s += lin('haie', st(0,'#3f8a4c') + st(1,'#23583a'));
  s += lin('nuit', st(0,'#2c2440') + st(1,'#15101f'));
  s += rad('lacF', st(0,'#8fd0f0') + st(.6,'#4f93cf') + st(1,'#356fae'), '42%', '36%', '72%');
  s += '<pattern id="' + p + 'roseaux" width="46" height="40" patternUnits="userSpaceOnUse"><path d="M8 30 v-14 M12 30 v-18 M16 30 v-12 M34 16 v-12 M38 16 v-9" stroke="#3f5f3a" stroke-width="2.5" stroke-linecap="round" opacity=".55"/></pattern>';
  return s;
}

function colline(p, c){
  var x = c[0], y = c[1], rx = c[2], ry = c[3];
  return '<ellipse cx="' + (x + 12) + '" cy="' + (y + 14) + '" rx="' + rx + '" ry="' + ry + '" fill="#234a2c" opacity=".22"/>' +
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + p + 'colline)" stroke="#3f7a45" stroke-width="3"/>' +
    '<ellipse cx="' + f(x - rx * .08) + '" cy="' + f(y - ry * .1) + '" rx="' + f(rx * .68) + '" ry="' + f(ry * .66) + '" fill="none" stroke="#3f7a45" stroke-width="2.5" opacity=".28"/>' +
    '<ellipse cx="' + f(x - rx * .14) + '" cy="' + f(y - ry * .18) + '" rx="' + f(rx * .36) + '" ry="' + f(ry * .34) + '" fill="#c4ec9d" opacity=".35"/>';
}

/* Un rocher (une forme anguleuse) */
function rocher(p, x, y, r, graine, o){
  var rr = O.rng(graine), n = 7, pts = [];
  for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2 + rr() * .5, k = .7 + rr() * .45; pts.push(f(x + Math.cos(a) * r * k) + ' ' + f(y + Math.sin(a) * r * k * .8)); }
  return '<path d="M' + pts.join(' L') + ' Z" fill="url(#' + p + 'roche)" stroke="' + C + '" stroke-width="' + (o && o.fin ? 2 : 3) + '" stroke-linejoin="round"/>' +
    '<path d="M' + f(x - r * .4) + ' ' + f(y - r * .25) + ' l' + f(r * .35) + ' ' + f(-r * .18) + '" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>';
}
/* Une falaise : une bande de roche dentelée (de gauche à droite), avec ses stries */
function falaise(p, x0, x1, yHaut, yBas, graine){
  var r = O.rng(graine), haut = [], bas = [], s = '';
  for(var x = x0; x <= x1; x += 34){ haut.push([x, yHaut + (r() - .5) * 22]); }
  for(var xb = x1; xb >= x0; xb -= 30){ bas.push([xb, yBas + (r() - .5) * 26]); }
  var d = 'M' + haut.concat(bas).map(function(q){ return f(q[0]) + ' ' + f(q[1]); }).join(' L') + ' Z';
  s += '<path d="' + d + '" transform="translate(8 12)" fill="#0b1a10" opacity=".3"/>';
  s += '<path d="' + d + '" fill="url(#' + p + 'roche)" stroke="' + C + '" stroke-width="3.5" stroke-linejoin="round"/>';
  for(var k = x0 + 30; k < x1 - 20; k += 46){ var y0 = yHaut + 16 + r() * 14; s += '<path d="M' + f(k) + ' ' + f(y0) + ' l' + f((r() - .5) * 16) + ' ' + f((yBas - yHaut) * (.35 + r() * .3)) + '" stroke="' + C + '" stroke-width="2" opacity=".28" stroke-linecap="round"/>'; }
  return s;
}

/* Un champ : un quadrilatère un peu de travers, avec ses sillons */
function champ(x, y, w, h, fond, sillon, graine){
  var r = O.rng(graine), j = function(){ return (r() - .5) * 14; };
  var a = [x + j(), y + j()], b = [x + w + j(), y + j()], c = [x + w + j(), y + h + j()], d = [x + j(), y + h + j()];
  var s = '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(c[0]) + ' ' + f(c[1]) + ' L' + f(d[0]) + ' ' + f(d[1]) + ' Z" fill="' + fond + '" stroke="' + C + '" stroke-width="3" stroke-linejoin="round"/>';
  var n = Math.round(w / 23);
  for(var i = 1; i < n; i++){ var t = i / n; s += '<path d="M' + f(a[0] + (b[0] - a[0]) * t) + ' ' + f(a[1] + (b[1] - a[1]) * t + 5) + ' L' + f(d[0] + (c[0] - d[0]) * t) + ' ' + f(d[1] + (c[1] - d[1]) * t - 5) + '" stroke="' + sillon + '" stroke-width="5" stroke-linecap="round"/>'; }
  return s;
}

/* Le sol : tout ce qui est à plat, sous le village */
function sol(p, pv){
  var s = '';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + pv + 'herbe)"/>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + pv + 'herbeT)"/>';
  /* de grandes taches de pré, plus claires ou plus sombres, pour que l'herbe ne soit pas plate */
  [[700,1060,330,210,'#9ad67c',.22],[2400,1130,360,200,'#9ad67c',.2],[620,1560,300,150,'#3f7a45',.14],[2250,560,260,130,'#9ad67c',.2],[1500,1860,420,110,'#9ad67c',.18],[250,930,230,260,'#3f7a45',.1]].forEach(function(t, i){
    s += '<path d="' + O.tache(t[0], t[1], t[2], t[3], 60 + i, 10, .2) + '" fill="' + t[4] + '" opacity="' + t[5] + '"/>';
  });
  /* les collines */
  COLLINES.forEach(function(c){ s += colline(p, c); });
  /* le marais */
  s += '<path d="' + O.ferme(MARAIS_PTS) + '" fill="url(#' + p + 'marais)" stroke="#3b5a3c" stroke-width="4"/>';
  s += '<path d="' + O.ferme(MARAIS_PTS) + '" fill="url(#' + p + 'roseaux)"/>';
  MARES.forEach(function(m){ s += '<path d="' + O.tache(m[0], m[1], m[2], m[3], m[4], 10, .2) + '" fill="url(#' + p + 'eauM)" stroke="#274a4a" stroke-width="3"/>' +
    '<path class="ca-flot" d="M' + (m[0] - m[2] * .5) + ' ' + m[1] + ' h' + f(m[2]) + '" stroke="#d8f0e6" stroke-width="2.5" stroke-dasharray="8 22" stroke-linecap="round" opacity=".4"/>'; });
  /* le sol des forêts */
  s += '<path d="M' + FORET_NORD.map(function(q){ return f(q[0]) + ' ' + f(q[1]); }).join(' L') + ' Z" fill="url(#' + pv + 'foret)" stroke="#1b3a2a" stroke-width="4"/>';
  /* le Bois Sombre : le nord-ouest, plus noir */
  s += '<path d="' + O.tache(470, 250, 560, 330, 71, 14, .12) + '" fill="url(#' + p + 'foretS)" opacity=".8"/>';
  BOIS.forEach(function(b){ s += '<path d="' + O.ferme(b.pts) + '" fill="url(#' + (b.sombre ? p + 'foretS' : pv + 'foret') + ')" stroke="#1b3a2a" stroke-width="4"/>'; });
  CLAIRIERES.forEach(function(c, i){ s += '<path d="' + O.tache(c[0], c[1], c[2], c[3], 80 + i, 10, .12) + '" fill="#a5c98a" opacity=".72"/>'; });
  /* les eaux */
  s += O.eau(RU_ETANG, 11);
  s += O.eau(RUISSEAU, 22);
  s += O.eau(RIVIERE, 62);
  s += '<path d="' + O.ferme(LAC_PTS) + '" fill="none" stroke="#e3d3ad" stroke-width="22" opacity=".85"/>';
  s += '<path d="' + O.ferme(LAC_PTS) + '" fill="url(#' + p + 'lacF)" stroke="#2a4a6a" stroke-width="5"/>';
  [[-90,-30,150],[60,40,130],[-20,70,110],[110,-50,90]].forEach(function(q){ s += '<path class="ca-flot" d="M' + (LAC.x + q[0] - q[2] / 2) + ' ' + (LAC.y + q[1]) + ' h' + q[2] + '" stroke="#e6f6ff" stroke-width="3" stroke-dasharray="12 30" stroke-linecap="round" opacity=".5"/>'; });
  s += '<path d="' + O.ferme(ETANG_PTS) + '" fill="none" stroke="#e3d3ad" stroke-width="14" opacity=".7"/>';
  s += '<path d="' + O.ferme(ETANG_PTS) + '" fill="url(#' + pv + 'eauR)" stroke="#2a4a6a" stroke-width="4"/>';
  /* les champs */
  CHAMPS.forEach(function(c, i){ s += champ(c[0], c[1], c[2], c[3], c[4], c[5], i + 1); });
  /* les chemins */
  CHEMINS.forEach(function(c){ if(c.t !== ROUTE) s += dessinChemin(c, pv); });
  CHEMINS.forEach(function(c){ if(c.t === ROUTE) s += dessinChemin(c, pv); });
  /* la rue des Lanternes continue vers le sud : la même teinte que dans le village, et un bout creusé en rond pour épouser la fin de l'ancienne rue */
  s += '<path d="M1471 1740 A29 29 0 0 0 1529 1740 V2030 H1471 Z" fill="#7d6a4c" opacity=".85"/>';
  s += '<path d="M1500 1757 V2000" stroke="#000" stroke-width="2" stroke-dasharray="3 22" opacity=".18"/>';
  /* le gué : quatre pierres plates dans le ruisseau */
  [[1055,1138],[1065,1143],[1075,1138],[1084,1144]].forEach(function(q, i){ s += '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="7" ry="5.5" fill="url(#' + pv + 'pierre)" stroke="' + C + '" stroke-width="2"/>'; });
  /* la passerelle du chemin des bûcherons */
  s += passerelle(pv, 997, 655, 12, 46);
  return s;
}
function passerelle(pv, x, y, rot, l){
  var s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><rect x="' + (-l / 2 + 4) + '" y="-9" width="' + l + '" height="26" rx="4" fill="#0b1a10" opacity=".3"/>' +
    '<rect x="' + (-l / 2) + '" y="-13" width="' + l + '" height="26" rx="4" fill="url(#' + pv + 'bois)" stroke="' + C + '" stroke-width="3"/>';
  for(var i = 1; i < l / 9; i++) s += '<path d="M' + f(-l / 2 + i * 9) + ' -11 v22" stroke="#5a3a22" stroke-width="2" opacity=".5"/>';
  return s + '</g>';
}

/* ---------- Les arbres ---------- */
/* Où un arbre ne doit pas pousser : l'eau, les chemins, les lieux (emprises : x, y, rayon), les clairières, l'ancienne carte */
function planter(emprises, vieux){
  var liste = [], r = O.rng(20261112);
  var tous = vieux.slice();   /* les arbres de l'ancienne carte comptent pour l'espacement */
  function dansLac(x, y, m){ var dx = (x - LAC.x) / (LAC.rx + m), dy = (y - LAC.y) / (LAC.ry + m); return dx * dx + dy * dy < 1.12; }
  function dansEtang(x, y, m){ var dx = (x - ETANG.x) / (ETANG.rx + m), dy = (y - ETANG.y) / (ETANG.ry + m); return dx * dx + dy * dy < 1.15; }
  function dansMarais(x, y){ var dx = (x - MARAIS.x) / MARAIS.rx, dy = (y - MARAIS.y) / MARAIS.ry; return dx * dx + dy * dy < 1.05; }
  function libre(x, y, rad, serre){
    if(x > 968 && x < 2034 && y > 276 && y < 1742) return false;                 /* l'ancienne carte a déjà ses arbres */
    if(O.distLigne(x, y, RIV_E) < 38 + rad * .75) return false;
    if(O.distLigne(x, y, RUI_E) < 16 + rad * .8) return false;
    if(O.distLigne(x, y, RU_E) < 10 + rad * .8) return false;
    if(dansLac(x, y, 14 + rad * .6) || dansEtang(x, y, 12 + rad * .6)) return false;
    for(var i = 0; i < CHEMINS.length; i++){ var c = CHEMINS[i]; if(O.distLigne(x, y, c.e) < c.l / 2 + 6 + rad * .8) return false; }
    for(var k = 0; k < CLAIRIERES.length; k++){ var q = CLAIRIERES[k], dx = (x - q[0]) / (q[2] + rad * .3), dy = (y - q[1]) / (q[3] + rad * .3); if(dx * dx + dy * dy < 1) return false; }
    for(var e = 0; e < emprises.length; e++){ var m = emprises[e]; if(m.length === 4){ if(x > m[0] - rad && x < m[2] + rad && y > m[1] - rad && y < m[3] + rad) return false; } else if(Math.hypot(x - m[0], y - m[1]) < m[2] + rad * .6) return false; }
    for(var j = 0; j < tous.length; j++){ var a = tous[j]; if(Math.abs(a.x - x) < 90 && Math.hypot(a.x - x, a.y - y) < (rad + a.r) * serre) return false; }
    return true;
  }
  function ajouter(x, y, rad, style){ var a = {x:x, y:y, r:rad, v:Math.floor(r() * 3), style:style}; liste.push(a); tous.push(a); }
  function bordForet(x, y){ return O.distLigne(x, y, LISIERE); }
  /* la grande forêt du nord */
  for(var i = 0; i < 60000 && liste.length < 640; i++){
    var x = r() * (W + 40) - 20, y = r() * 800 - 20, rad = 25 + r() * 22;
    if(!O.dansPoly(x, y, FORET_NORD) || bordForet(x, y) < 14 + rad * .5) continue;
    var sombre = Math.hypot((x - 470) / 560, (y - 250) / 330) < 1.02 || (x > 2560 && y < 420);
    if(libre(x, y, rad, .74)) ajouter(x, y, rad, sombre ? 'sombre' : 'foret');
  }
  /* les petits bois */
  BOIS.forEach(function(b){
    var n0 = liste.length, cible = Math.round(b.rx * b.ry * Math.PI / 2700);
    for(var k = 0; k < 4000 && liste.length < n0 + cible; k++){
      var x = b.x + (r() * 2 - 1) * b.rx * 1.1, y = b.y + (r() * 2 - 1) * b.ry * 1.1, rad = 23 + r() * 20;
      if(!O.dansPoly(x, y, b.pts) || O.distLigne(x, y, b.pts.concat([b.pts[0]])) < 10 + rad * .4) continue;
      if(libre(x, y, rad, .76)) ajouter(x, y, rad, b.sombre ? 'sombre' : 'foret');
    }
  });
  /* les arbres isolés des prés */
  var n1 = liste.length;
  for(var m = 0; m < 30000 && liste.length < n1 + 150; m++){
    var px = 30 + r() * (W - 60), py = 640 + r() * (H - 670), pr = 17 + r() * 14;
    if(O.dansPoly(px, py, FORET_NORD) || bordForet(px, py) < 26 || dansMarais(px, py)) continue;
    var dansBois = false; for(var bb = 0; bb < BOIS.length; bb++) if(O.dansPoly(px, py, BOIS[bb].pts)) dansBois = true;
    if(dansBois) continue;
    if(libre(px, py, pr, 1.2)) ajouter(px, py, pr, 'pre');
  }
  return liste;
}
function arbre(p, pv, a){
  var sombre = a.style === 'sombre';
  var c = 'url(#' + (sombre ? p + 's' : pv + 'a') + a.v + ')';
  return '<ellipse cx="' + f(a.x + 7) + '" cy="' + f(a.y + 9) + '" rx="' + f(a.r) + '" ry="' + f(a.r * .9) + '" fill="#0a1a12" opacity=".28"/>' +
    '<circle cx="' + f(a.x) + '" cy="' + f(a.y) + '" r="' + f(a.r) + '" fill="' + c + '" stroke="' + C + '" stroke-width="3"/>' +
    (sombre ? '' : '<circle cx="' + f(a.x - a.r * .3) + '" cy="' + f(a.y - a.r * .34) + '" r="' + f(a.r * .36) + '" fill="#fff" opacity=".13"/>');
}

/* Les fleurs des prés (hors de l'ancienne carte) */
function fleurs(emprises){
  var r = O.rng(99), s = '', n = 0, cols = ['#ffe9a8','#ff9fc0','#cdb6ff','#ffffff','#ffd27a'];
  for(var i = 0; i < 5000 && n < 330; i++){
    var x = r() * W, y = 700 + r() * (H - 700);
    if(x > 990 && x < 2010 && y < 1730) continue;
    if(O.dansPoly(x, y, FORET_NORD) || O.distLigne(x, y, RIV_E) < 42 || O.distLigne(x, y, RUI_E) < 18) continue;
    var dx = (x - MARAIS.x) / MARAIS.rx, dy = (y - MARAIS.y) / MARAIS.ry; if(dx * dx + dy * dy < 1.05) continue;
    var ex = (x - ETANG.x) / (ETANG.rx + 10), ey = (y - ETANG.y) / (ETANG.ry + 10); if(ex * ex + ey * ey < 1.1) continue;
    var pris = false;
    for(var c = 0; c < CHEMINS.length && !pris; c++) if(O.distLigne(x, y, CHEMINS[c].e) < CHEMINS[c].l / 2 + 8) pris = true;
    for(var e = 0; e < emprises.length && !pris; e++){ var m = emprises[e]; if(m.length === 4){ if(x > m[0] && x < m[2] && y > m[1] && y < m[3]) pris = true; } else if(Math.hypot(x - m[0], y - m[1]) < m[2]) pris = true; }
    for(var b = 0; b < BOIS.length && !pris; b++) if(O.dansPoly(x, y, BOIS[b].pts)) pris = true;
    if(pris) continue;
    s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(3 + r() * 3) + '" fill="' + cols[Math.floor(r() * cols.length)] + '" opacity=".85"/>'; n++;
  }
  return s;
}

module.exports = {RIVIERE: RIVIERE, RUISSEAU: RUISSEAU, RU_ETANG: RU_ETANG, RIV_E: RIV_E, RUI_E: RUI_E, RU_E: RU_E, LAC: LAC, LAC_PTS: LAC_PTS, ETANG: ETANG, ETANG_PTS: ETANG_PTS, MARAIS: MARAIS, MARES: MARES,
  CHEMINS: CHEMINS, CHAMPS: CHAMPS, FORET_NORD: FORET_NORD, LISIERE: LISIERE, BOIS: BOIS, CLAIRIERES: CLAIRIERES, COLLINES: COLLINES,
  defs: defs, sol: sol, planter: planter, arbre: arbre, fleurs: fleurs, rocher: rocher, falaise: falaise, champ: champ, colline: colline, passerelle: passerelle};
