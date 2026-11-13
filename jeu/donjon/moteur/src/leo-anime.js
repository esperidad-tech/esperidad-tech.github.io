/* leo-anime.js — LE DESSIN DE LÉO, le boss final (Bible §13.33, Romain, 13 novembre : « grand, musclé, une cape noire — skin à
   refaire »). Un pantin en SVG : jambes, torse, tête, deux bras (le bras de devant a un coude et tient l'arme). Aucun son, aucune
   règle : leo.js lui dit quoi faire.

   TROIS TENUES : 1. la cape noire, le capuchon baissé sur le visage (on ne voit que deux yeux) ; 2. torse nu, en colère (la cape
   arrachée : c'est là qu'on reconnaît Léo, ses cheveux de paille et ses taches de rousseur) ; 3. la potion : une grosse bête verte.

     var A = LeoAnime.creer(parent, {x:815, sol:340})      parent : la scène (960 × 372)
     A.tenue(1|2|3) ; A.arme(nom|null) ; A.visage('colere'|'cri'|'ko'|'boit')
     A.vers(pose, ms[, courbe]) -> Promise                 pose : un nom de POSES, ou un objet {torse, tete, brasG, avantG, brasD, jG, jD, y, x, r}
     A.suite([[pose, ms, courbe], …]) -> Promise
     A.avancer(dt)                                          à chaque image (dt en secondes)
     A.ancre('tete'|'centre'|'pieds'|'main'|'haut')         un point de Léo, dans la scène
     A.teinte('gel'|'noirci'|'feu'|null) ; A.voile(0..1)    (voile : 0 = on le voit, 1 = caché dans sa farine)
     A.arreter() */
(function(){
'use strict';
var O = '#1a0e08';
var W = 300, H = 340, PIED = 330;
var HANCHE = [150, 212], COU = [147, 114], EPG = [116, 130], EPD = [186, 130], BRAS = 46, AVANT = 44;

var POSES = {
  garde:{torse:5, tete:0, brasG:22, avantG:62, brasD:-18, jG:0, jD:0, y:0, x:0, r:0},
  montre:{torse:-2, tete:-4, brasG:78, avantG:28, brasD:-24, y:0},              /* il prend son arme et la montre */
  leve:{torse:-14, tete:-8, brasG:184, avantG:34, brasD:-46, jG:8, jD:-6, y:0},        /* l'arme levée au-dessus de la tête */
  frappe:{torse:32, tete:12, brasG:64, avantG:6, brasD:36, jG:-16, jD:14, y:12},       /* le coup tombe */
  gratte:{torse:30, tete:16, brasG:-28, avantG:70, brasD:-58, jG:14, jD:-18, y:14},    /* il gratte le sol, tête baissée */
  court:{torse:40, tete:8, brasG:-56, avantG:80, brasD:66, jG:-30, jD:28, y:10},
  glisse:{torse:-30, tete:-20, brasG:150, avantG:20, brasD:-150, jG:60, jD:40, y:-40, r:46},      /* les pieds partent en avant */
  auSol:{torse:-6, tete:-12, brasG:120, avantG:30, brasD:-120, jG:26, jD:8, y:0, r:86},            /* sur le dos */
  boit:{torse:-16, tete:-30, brasG:148, avantG:112, brasD:-10, y:0},
  siffle:{torse:-6, tete:-10, brasG:118, avantG:128, brasD:-20, y:0},
  capeA:{torse:-12, tete:-6, brasG:-70, avantG:20, brasD:-110, y:0},
  capeB:{torse:22, tete:8, brasG:130, avantG:8, brasD:50, y:6},
  rugit:{torse:-20, tete:-26, brasG:-50, avantG:40, brasD:-60, jG:-8, jD:10, y:4},
  poingA:{torse:-10, tete:-4, brasG:-30, avantG:120, brasD:-30, y:2},
  poingB:{torse:26, tete:8, brasG:92, avantG:2, brasD:-66, jG:-18, jD:12, y:6},
  fauxA:{torse:-22, tete:-10, brasG:-66, avantG:36, brasD:-80, jG:8, jD:-6, y:2},
  fauxB:{torse:30, tete:10, brasG:126, avantG:10, brasD:40, jG:-16, jD:12, y:10},
  accroupi:{torse:26, tete:10, brasG:-20, avantG:70, brasD:-40, jG:-34, jD:30, y:34},
  enLair:{torse:-10, tete:-10, brasG:170, avantG:20, brasD:-160, jG:20, jD:-20, y:-150},
  sonne:{torse:18, tete:22, brasG:8, avantG:20, brasD:10, y:8},
  tient:{torse:8, tete:4, brasG:86, avantG:40, brasD:-20, y:0},
  souffle:{torse:22, tete:6, brasG:-40, avantG:60, brasD:-56, jG:-10, jD:10, y:6},
  genou:{torse:36, tete:26, brasG:20, avantG:20, brasD:14, jG:-40, jD:30, y:44},             /* battu : un genou à terre */
  aTerre:{torse:44, tete:30, brasG:40, avantG:30, brasD:20, jG:-46, jD:38, y:62}
};
var CLES = ['torse', 'tete', 'brasG', 'avantG', 'brasD', 'jG', 'jD', 'y', 'x', 'r'];
var COURBES = {
  lin:function(t){ return t; }, o:function(t){ return 1 - Math.pow(1 - t, 3); }, i:function(t){ return t * t * t; },
  io:function(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  b:function(t){ var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
};

/* ---------- les couleurs des trois tenues ---------- */
var TENUES = {
  1:{peau:['#2a2438', '#1c1826', '#120f1a'], bras:'#1c1826', torse:'#1c1826', jambe:'#241c18', botte:'#120c08', ech:.9, gros:22},
  2:{peau:['#ffe0c6', '#efb88e', '#d08e62'], bras:'#efb88e', torse:'#efb88e', jambe:'#6a4a32', botte:'#3a2414', ech:.9, gros:25},
  3:{peau:['#cfe6a8', '#93b872', '#5c8648'], bras:'#93b872', torse:'#93b872', jambe:'#4a3a2a', botte:'#22160c', ech:1.12, gros:31}
};
function trait(d, c, w, plus){ return '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="' + (w + 5) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (plus || '') + '/>'; }
function forme(d, c, w){ return '<path d="' + d + '" fill="' + c + '" stroke="' + O + '" stroke-width="' + (w || 3) + '" stroke-linejoin="round"/>'; }
function rond(x, y, r, c, w){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"' + (w === 0 ? '' : ' stroke="' + O + '" stroke-width="' + (w || 3) + '"') + '/>'; }

/* ---------- les armes (la main est en 0,0 ; l'arme prolonge l'avant-bras, vers le bas) ---------- */
var ARMES = {
  fleau:function(){
    return trait('M0 -14 L0 56', '#8a5a2e', 7) + '<path d="M0 58 l5 9 l-6 8 l6 8" fill="none" stroke="#9aa0ad" stroke-width="3.4" stroke-linecap="round"/>' +
      '<g class="la-battant">' + trait('M2 86 L10 136', '#6a4222', 10) + rond(4, 96, 3, '#c9ccd6', 1.4) + rond(8, 120, 3, '#c9ccd6', 1.4) + '</g>';
  },
  marteau:function(){ return trait('M0 -16 L0 78', '#8a5a2e', 8) + forme('M-30 70 L30 70 L34 108 L-34 108 Z', '#7a4e28') + '<path d="M-28 82 L28 82 M-30 96 L30 96" stroke="#4a2e16" stroke-width="2.4"/>' + forme('M-34 70 L34 70 L34 76 L-34 76 Z', '#9aa0ad', 2); },
  meule:function(){
    var s = rond(0, -6, 46, '#e3bb55') + '<circle cx="0" cy="-6" r="30" fill="none" stroke="#b8862e" stroke-width="3"/><circle cx="0" cy="-6" r="14" fill="none" stroke="#b8862e" stroke-width="3"/>';
    for(var k = 0; k < 10; k++){ var a = k * Math.PI / 5; s += '<path d="M' + (Math.cos(a) * 16).toFixed(1) + ' ' + (-6 + Math.sin(a) * 16).toFixed(1) + ' L' + (Math.cos(a) * 44).toFixed(1) + ' ' + (-6 + Math.sin(a) * 44).toFixed(1) + '" stroke="#c9972f" stroke-width="2"/>'; }
    return s;
  },
  crochet:function(){ return trait('M0 -12 L0 40', '#8a5a2e', 7) + '<path d="M0 40 C0 74 34 78 36 52 C36 44 30 40 26 44" fill="none" stroke="' + O + '" stroke-width="10" stroke-linecap="round"/><path d="M0 40 C0 74 34 78 36 52 C36 44 30 40 26 44" fill="none" stroke="#b9bec9" stroke-width="5.4" stroke-linecap="round"/>'; },
  faux:function(){ return trait('M0 -40 L0 120', '#8a5a2e', 7) + forme('M-2 112 C-40 100 -84 112 -104 142 C-78 126 -40 124 -2 128 Z', '#cfd4de', 2.6) + '<path d="M-10 118 C-44 110 -76 120 -94 136" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>'; },
  gourde:function(){ return forme('M-10 6 C-22 14 -22 44 0 48 C22 44 22 14 10 6 L8 -6 L-8 -6 Z', '#8a5a34') + forme('M-7 -14 L7 -14 L8 -6 L-8 -6 Z', '#c9972f', 2) + '<path d="M-12 24 Q0 30 12 24" fill="none" stroke="#5a3a1e" stroke-width="2.4"/>' + rond(0, 30, 5, '#7ad06a', 1.6); },
  sifflet:function(){ return forme('M-4 -4 L16 -8 L18 4 L-2 8 Z', '#c9ccd6', 2); },
  rat:function(){ return forme('M-16 4 C-18 -12 8 -16 16 -4 C22 4 12 14 -4 14 C-12 14 -16 10 -16 4 Z', '#7d7468', 2.4) + rond(12, -2, 2, '#1a0e08', 0) + '<path d="M-16 6 q-12 4 -16 -6" fill="none" stroke="#c98a8a" stroke-width="2.4" stroke-linecap="round"/>'; }
};

/* ---------- la tête ---------- */
function teteSVG(n){
  var T = TENUES[n], pe = T.peau, s = '';
  if(n === 1){
    /* le capuchon : on ne voit que deux yeux, dans l'ombre */
    s += forme('M110 104 C100 60 122 34 148 34 C176 34 196 58 188 106 C176 120 124 120 110 104 Z', '#17131f');
    s += '<path d="M116 100 C108 66 126 46 146 46" fill="none" stroke="#2f2840" stroke-width="3" stroke-linecap="round"/>';
    s += '<ellipse cx="136" cy="84" rx="19" ry="23" fill="#07060b"/>';
    s += '<g class="la-yeux"><path d="M121 80 L133 84 L122 88 Z" fill="#ffe9a0"/><path d="M140 84 L151 80 L150 88 Z" fill="#ffe9a0"/></g>';
    s += '<path d="M150 112 C160 122 176 120 184 110" fill="none" stroke="#2f2840" stroke-width="2.4" stroke-linecap="round"/>';
    return s;
  }
  /* le cou, le visage de trois quarts (il regarde à gauche, vers les héros) */
  s += forme('M138 100 L160 100 L164 124 L134 124 Z', pe[1]);
  s += forme('M112 82 C108 54 126 40 146 40 C168 40 180 56 178 80 C176 100 162 112 144 112 C126 112 114 100 112 82 Z', pe[n === 3 ? 1 : 0]);
  s += '<ellipse cx="124" cy="92" rx="7" ry="4" fill="' + (n === 3 ? '#5c8648' : '#ff877a') + '" opacity=".5"/>';
  if(n === 2) [[120, 86], [125, 84], [129, 88], [156, 88], [161, 86]].forEach(function(t){ s += '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="1.3" fill="#b8704a"/>'; });
  /* les sourcils froncés, les yeux */
  s += '<path d="M114 66 L132 74 M146 74 L164 64" stroke="' + O + '" stroke-width="4.6" stroke-linecap="round"/>';
  s += '<g class="la-yeux">' + (n === 3
    ? '<path d="M117 76 L132 80 L119 85 Z" fill="#ffe14a" stroke="' + O + '" stroke-width="1.6"/><path d="M146 80 L161 75 L159 85 Z" fill="#ffe14a" stroke="' + O + '" stroke-width="1.6"/><circle cx="124" cy="80" r="1.6" fill="#b3261e"/><circle cx="153" cy="80" r="1.6" fill="#b3261e"/>'
    : '<ellipse cx="124" cy="80" rx="6" ry="5" fill="#fff" stroke="' + O + '" stroke-width="2"/><ellipse cx="153" cy="80" rx="5.4" ry="5" fill="#fff" stroke="' + O + '" stroke-width="2"/><circle cx="122" cy="80.5" r="2.2" fill="#3a2a1a"/><circle cx="151" cy="80.5" r="2.2" fill="#3a2a1a"/>') + '</g>';
  s += '<g class="la-ko" style="display:none"><path d="M118 75 l12 10 m0 -10 l-12 10 M147 75 l12 10 m0 -10 l-12 10" stroke="' + O + '" stroke-width="3.4" stroke-linecap="round"/></g>';
  /* la bouche : les dents serrées, ou grande ouverte */
  s += '<g class="la-bouche">' + forme('M122 97 Q136 92 150 98 Q136 104 122 97 Z', '#fff', 2.2) + '<path d="M129 95 v6 M136 94 v8 M143 95 v6" stroke="' + O + '" stroke-width="1.2"/></g>';
  s += '<g class="la-cri" style="display:none">' + forme('M120 94 Q136 88 152 96 Q150 112 134 112 Q122 110 120 94 Z', '#5a1616', 2.4) + '<path d="M124 96 L130 101 L136 95 L142 101 L148 97" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></g>';
  if(n === 3) s += forme('M124 100 L127 90 L131 100 Z', '#fff', 1.6) + forme('M142 100 L146 90 L149 100 Z', '#fff', 1.6);
  s += '<path d="M110 86 C106 90 108 96 112 96" fill="none" stroke="' + pe[2] + '" stroke-width="2.4"/>';
  /* les cheveux de paille, en bataille (verdis par la potion) */
  var ch = n === 3 ? '#b7a13e' : '#e8b858';
  s += forme('M110 72 C102 48 118 30 140 30 C156 24 178 32 182 50 C186 62 184 74 180 80 C178 68 172 62 164 60 C160 66 152 66 148 60 C142 66 134 68 128 64 C122 70 116 74 110 72 Z', ch);
  s += '<path d="M118 44 Q130 34 144 36 M150 36 Q164 38 172 50" fill="none" stroke="#fff0c0" stroke-width="2" opacity=".7"/><path d="M110 72 l-8 6 M182 50 l8 -6 M126 32 l-4 -8 M150 28 l2 -9 M170 36 l7 -7" stroke="' + (n === 3 ? '#8a7a26' : '#c8902a') + '" stroke-width="3" stroke-linecap="round"/>';
  return s;
}
/* ---------- le torse ---------- */
function torseSVG(n){
  var T = TENUES[n], s = '';
  if(n === 1){
    s += forme('M104 126 C100 108 200 108 196 126 L186 208 C172 218 128 218 118 208 Z', '#1c1826');
    /* la pèlerine sur les épaules, et la farine dessus (c'est un meunier) */
    s += forme('M96 124 C118 104 184 104 206 124 C212 146 206 158 200 166 C172 152 130 152 102 166 C94 156 90 144 96 124 Z', '#17131f');
    s += '<path d="M106 150 C128 140 172 140 196 150" fill="none" stroke="#2f2840" stroke-width="2.4"/>';
    [[112, 138, 7, 3], [186, 142, 6, 3], [150, 132, 5, 2]].forEach(function(f){ s += '<ellipse cx="' + f[0] + '" cy="' + f[1] + '" rx="' + f[2] + '" ry="' + f[3] + '" fill="#fff" opacity=".4"/>'; });
    return s;
  }
  var pe = T.peau, gros = n === 3 ? 10 : 0;
  s += forme('M' + (100 - gros) + ' 128 C' + (96 - gros) + ' 106 ' + (204 + gros) + ' 106 ' + (200 + gros) + ' 128 L184 204 C170 214 130 214 120 204 Z', pe[1]);
  /* les muscles : deux pectoraux, le ventre */
  s += '<path d="M112 140 C122 158 146 158 150 142 C154 158 180 158 190 140" fill="none" stroke="' + pe[2] + '" stroke-width="3.4" stroke-linecap="round"/>';
  s += '<path d="M150 150 V200 M132 168 Q150 174 168 168 M134 184 Q150 190 166 184" fill="none" stroke="' + pe[2] + '" stroke-width="2.6" stroke-linecap="round"/>';
  s += '<path d="M108 128 C120 116 140 114 150 122" fill="none" stroke="' + pe[0] + '" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
  if(n === 3) s += '<path d="M120 132 l8 12 l-4 10 M182 134 l-8 10 l6 12 M160 120 l4 10" fill="none" stroke="#6a4a9a" stroke-width="2" opacity=".7"/>';
  /* la ceinture */
  s += '<path d="M119 204 L185 204" stroke="' + O + '" stroke-width="13" stroke-linecap="round"/><path d="M119 204 L185 204" stroke="#4a2e1a" stroke-width="8" stroke-linecap="round"/>' + '<rect x="144" y="198" width="14" height="12" fill="#d9b46a" stroke="' + O + '" stroke-width="1.8"/>';
  /* (tenue 2) ce qui reste de la cape, pendu à la ceinture */
  if(n === 2) s += forme('M176 206 L196 208 L204 262 L192 248 L186 266 L178 244 Z', '#17131f', 2.4);
  return s;
}
function jambeSVG(n, devant){
  var T = TENUES[n], x = devant ? 138 : 162, k = devant ? -1 : 1, c = devant ? T.jambe : assombrir(T.jambe);
  return trait('M' + x + ' 214 L' + (x + k * 6) + ' 268 L' + (x + k * 8) + ' 312', c, n === 3 ? 27 : 23) + forme('M' + (x + k * 8 - 16) + ' 306 L' + (x + k * 8 + 14) + ' 306 L' + (x + k * 8 + 14) + ' 330 L' + (x + k * 8 - 28) + ' 330 Q' + (x + k * 8 - 30) + ' 318 ' + (x + k * 8 - 16) + ' 314 Z', T.botte);
}
function assombrir(c){ var n = parseInt(c.slice(1), 16), r = (n >> 16) * .78 | 0, g = ((n >> 8) & 255) * .78 | 0, b = (n & 255) * .78 | 0; return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
function mainSVG(n){ var T = TENUES[n]; return rond(0, 0, n === 3 ? 13 : 10.5, n === 1 ? '#efb88e' : T.peau[1]); }

function Leo(parent, o){
  o = o || {};
  this.cx = o.x == null ? 815 : o.x; this.sol = o.sol == null ? 340 : o.sol;
  var d = document.createElement('div');
  d.className = 'leo-anime';
  d.style.cssText = 'position:absolute;left:' + (this.cx - W / 2) + 'px;top:' + (this.sol - PIED) + 'px;width:' + W + 'px;height:' + H + 'px;pointer-events:none;will-change:transform,opacity';
  parent.appendChild(d);
  this.el = d;
  this.p = {}; this.de = {}; this.a = {}; this.t = 0; this.duree = 0; this.courbe = COURBES.io; this.fin = null; this.temps = 0; this._arme = null; this._voile = 0;
  for(var k = 0; k < CLES.length; k++) this.p[CLES[k]] = POSES.garde[CLES[k]] || 0;
  this.tenue(o.tenue || 1);
}
var P = Leo.prototype;
P.tenue = function(n){
  var T = TENUES[n] || TENUES[1], s;
  this.n = n; this.T = T;
  s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" style="overflow:visible;position:absolute;left:0;top:0"><g class="la-ech"><g class="la-tout">';
  s += '<ellipse class="la-ombre" cx="150" cy="330" rx="74" ry="9" fill="#000" opacity=".4"/>';
  if(n === 1) s += '<g class="la-cape">' + forme('M98 122 C70 190 62 266 54 324 C92 334 208 334 250 324 C240 266 232 190 204 122 Z', '#120f1a') +
    '<path d="M92 190 C88 240 84 290 82 322 M210 190 C216 240 222 290 226 322 M150 220 V326" fill="none" stroke="#2a2438" stroke-width="2.6"/>' +
    '<path d="M58 316 Q100 326 150 322 T246 316" fill="none" stroke="#fff" stroke-width="5" opacity=".28" stroke-linecap="round"/></g>';
  s += '<g class="la-jD">' + jambeSVG(n, false) + '</g><g class="la-jG">' + jambeSVG(n, true) + '</g>';
  s += '<g class="la-torse"><g class="la-brasD">' + trait('M' + EPD[0] + ' ' + EPD[1] + ' L' + (EPD[0] + 4) + ' ' + (EPD[1] + BRAS) + ' L' + (EPD[0] - 6) + ' ' + (EPD[1] + BRAS + AVANT - 6), assombrir(T.bras), T.gros - 2) +
    '<g transform="translate(' + (EPD[0] - 6) + ',' + (EPD[1] + BRAS + AVANT - 6) + ')">' + mainSVG(n) + '</g></g>';
  s += torseSVG(n) + '<g class="la-tete">' + teteSVG(n) + '</g>';
  s += '<g class="la-brasG">' + trait('M' + EPG[0] + ' ' + EPG[1] + ' L' + EPG[0] + ' ' + (EPG[1] + BRAS), T.bras, T.gros) +
    (n > 1 ? '<ellipse cx="' + (EPG[0] - 3) + '" cy="' + (EPG[1] + 20) + '" rx="' + (T.gros * .42) + '" ry="15" fill="' + T.peau[0] + '" opacity=".55"/>' : '') +
    '<g class="la-avantG"><g class="la-arme"></g>' + trait('M' + EPG[0] + ' ' + (EPG[1] + BRAS) + ' L' + EPG[0] + ' ' + (EPG[1] + BRAS + AVANT), T.bras, T.gros - 2) +
    '<g transform="translate(' + EPG[0] + ',' + (EPG[1] + BRAS + AVANT) + ')">' + mainSVG(n) + '</g></g></g>';
  s += '</g></g></g></svg>';
  this.el.innerHTML = s;
  var self = this;
  this.g = {};
  ['ech', 'tout', 'jD', 'jG', 'torse', 'brasD', 'tete', 'brasG', 'avantG', 'arme', 'cape', 'ombre'].forEach(function(k){ self.g[k] = self.el.querySelector('.la-' + k); });
  this.arme(this._arme);
  this.visage('colere');
  this._poser();
  return this;
};
P.arme = function(nom){
  this._arme = nom || null;
  var g = this.g.arme; if(!g) return this;
  g.innerHTML = nom && ARMES[nom] ? ARMES[nom]() : '';
  g.setAttribute('transform', 'translate(' + EPG[0] + ',' + (EPG[1] + BRAS + AVANT) + ')' + (nom === 'meule' ? ' translate(0,30)' : ''));
  return this;
};
P.visage = function(v){
  var e = this.el, cri = v === 'cri' || v === 'boit', q = function(c){ return e.querySelector(c); };
  if(q('.la-cri')) q('.la-cri').style.display = cri ? '' : 'none';
  if(q('.la-bouche')) q('.la-bouche').style.display = cri ? 'none' : '';
  if(q('.la-ko')) q('.la-ko').style.display = v === 'ko' ? '' : 'none';
  if(q('.la-yeux')) q('.la-yeux').style.display = v === 'ko' ? 'none' : '';
  return this;
};
function poseDe(x){ return typeof x === 'string' ? POSES[x] || POSES.garde : x || POSES.garde; }
P.vers = function(pose, ms, courbe){
  var self = this, c = poseDe(pose), G = POSES.garde;
  if(this.fin){ var f = this.fin; this.fin = null; f(); }
  CLES.forEach(function(k){ self.de[k] = self.p[k]; self.a[k] = c[k] != null ? c[k] : (k === 'x' ? self.p.x : G[k] || 0); });
  this.t = 0; this.duree = Math.max(1, ms || 1) / 1000; this.courbe = COURBES[courbe || 'io'] || COURBES.io;
  return new Promise(function(ok){ self.fin = ok; });
};
P.suite = function(l){ var self = this, p = Promise.resolve(); l.forEach(function(x){ p = p.then(function(){ return self.vers(x[0], x[1], x[2]); }); }); return p; };
P.avancer = function(dt){
  this.temps += dt;
  if(this.duree > 0){
    this.t += dt;
    var k = Math.min(1, this.t / this.duree), e = this.courbe(k), self = this;
    CLES.forEach(function(c){ self.p[c] = self.de[c] + (self.a[c] - self.de[c]) * e; });
    if(k >= 1){ this.duree = 0; if(this.fin){ var f = this.fin; this.fin = null; f(); } }
  }
  this._poser();
};
function rot(a, c){ return 'rotate(' + a.toFixed(2) + ' ' + c[0] + ' ' + c[1] + ')'; }
P._poser = function(){
  var p = this.p, g = this.g, T = this.T, souffle = Math.sin(this.temps * 2.4) * 1.6, calme = Math.abs(p.r) < 20 ? 1 : 0;
  if(!g.tout) return;
  g.ech.setAttribute('transform', 'translate(150 ' + PIED + ') scale(' + T.ech + ') translate(-150 ' + (-PIED) + ')');
  /* y < 0 : tout le corps monte (un saut) ; y > 0 : il plie les genoux (le torse descend, les jambes se tassent) */
  var haut = Math.min(0, p.y), bas = Math.max(0, p.y) + souffle * calme, tasse = Math.max(.3, (116 - Math.max(0, bas)) / 116);
  g.tout.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + haut.toFixed(1) + ') ' + rot(p.r, [150, PIED - 8]));
  /* (il regarde à gauche : se pencher en avant, c'est tourner dans l'autre sens que les aiguilles ; les bras gardent leur angle) */
  g.torse.setAttribute('transform', 'translate(0 ' + bas.toFixed(1) + ') ' + rot(-p.torse, HANCHE));
  g.tete.setAttribute('transform', rot(-p.tete, COU));
  g.brasG.setAttribute('transform', rot(p.brasG + p.torse, EPG));
  g.avantG.setAttribute('transform', rot(p.avantG, [EPG[0], EPG[1] + BRAS]));
  g.brasD.setAttribute('transform', rot(p.brasD + p.torse, EPD));
  var jt = ' translate(0 ' + PIED + ') scale(1 ' + tasse.toFixed(3) + ') translate(0 ' + (-PIED) + ') ';
  g.jG.setAttribute('transform', jt + rot(p.jG, [138, 214]));
  g.jD.setAttribute('transform', jt + rot(p.jD, [162, 214]));
  if(g.cape) g.cape.setAttribute('transform', 'translate(0 ' + (bas * .4).toFixed(1) + ') skewX(' + (p.torse * .25 + Math.sin(this.temps * 1.7) * 1.2).toFixed(2) + ')');
  if(g.ombre) g.ombre.setAttribute('opacity', p.y < -20 ? .18 : .4);
};
/* un point de Léo dans la scène */
P.ancre = function(nom){
  var e = this.T.ech, x = this.cx + this.p.x * e, s = this.sol, h = 280 * e;
  if(nom === 'pieds') return {x:x, y:s};
  if(nom === 'tete') return {x:x - (8 + this.p.torse * 1.2) * e, y:s - h * .86 + this.p.y * e};
  if(nom === 'haut') return {x:x, y:s - h - 4 + this.p.y * e};
  if(nom === 'main') return {x:x - 70 * e, y:s - h * .5 + this.p.y * e};
  return {x:x, y:s - h * .5 + this.p.y * e};
};
P.teinte = function(nom){
  var f = {gel:'hue-rotate(160deg) saturate(.7) brightness(1.25)', noirci:'brightness(.25) contrast(1.2)', feu:'sepia(.6) saturate(2.4) hue-rotate(-20deg) brightness(1.1)', rouge:'saturate(1.5) brightness(1.05) drop-shadow(0 0 8px rgba(255,60,40,.8))'}[nom] || '';
  this.el.style.filter = f; return this;
};
P.voile = function(v){ this._voile = v; this.el.style.opacity = String(1 - Math.max(0, Math.min(1, v)) * .82); return this; };
P.eclair = function(){ try{ this.el.animate([{filter:'brightness(1)'}, {filter:'brightness(2.6)', offset:.15}, {filter:'brightness(1)'}], {duration:320}); }catch(e){} return this; };
P.arreter = function(){ this.duree = 0; if(this.fin){ var f = this.fin; this.fin = null; f(); } };

window.LeoAnime = {creer:function(parent, o){ return new Leo(parent, o); }, POSES:POSES, ARMES:ARMES, TENUES:TENUES};
})();
