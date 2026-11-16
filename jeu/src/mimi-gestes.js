/* ==========================================================
   Mimi en pantin — 3 sur 3 : SES POSES ET SES GESTES (DESIGN-saison1.md §12.66).
   Une pose = des réglages (voir mimi-dessin.js). On ne donne que ce qui change par rapport à « debout ».
   Les réglages :
     hx, hy / sx, sy : les hanches / les épaules ; arc : le dos rond ; rh, rs : leur épaisseur ; rm, vent : le dos, le ventre ; bu : sur le dos (1)
     tx, ty, ta : la tête (par rapport aux épaules), penchée ; lx, ly : où elle regarde (-1 … 1)
     yo : yeux ouverts (1) ; yc : fermés de plaisir (1) ; pt : la paupière penchée (10 : douce ; négatif : fâchée) ; pu : pupilles (0 fente, 1 rondes) ; bo : bouche ouverte ; la : langue ;
     og, od, oa : les oreilles (tournées, aplaties) ; mo : les moustaches ; jo : les joues roses
     a1…, a2… : la patte de devant de ce côté-ci / de l'autre : x, y (le poignet), q (la main tournée), f (1 : coussinets vers nous)
     j1…, j2… : la patte de derrière : x, y (le bout du pied), p (le pied : 60 debout, 5 à plat), q (les doigts), f
     q0 : la direction de la queue à son attache (-90 : vers le haut, 180 : vers l'arrière) ; q1…q5 : comme elle s'enroule ;
     qa, qv : comme elle se balance (combien, à quelle vitesse) ; qd : la queue passe devant le corps (1)
     rx, ry, rr : tout le corps déplacé, tourné ; co : son côté (1 à droite) ; zz : les « z » du sommeil
     vue : un tour sur elle-même, en huitièmes de tour (un geste : elle court après sa queue) ; ql : la queue qui se balance sur le côté ;
     hz, sz : les hanches, les épaules décalées sur le côté (le déhanché de la marche) — ces trois-là ne se voient que dans les autres vues (mimi-vues.js)
   ========================================================== */
(function(G){
'use strict';
var M = G.MimiPantin;

var DEBOUT = {
  hx:-21, hy:-27.5, sx:19, sy:-28, arc:1, rh:12, rs:11.4, rm:1, vent:1.8, bu:0,
  tx:15, ty:-15.5, ta:0, lx:0.3, ly:0,
  yo:1, yc:0, pt:10, pu:0.35, bo:0, la:0, lt:0, og:0, od:0, oa:0, mo:0, jo:0,
  a1x:17.5, a1y:-3.5, a1q:0, a1f:0, a2x:22, a2y:-3.5, a2q:0, a2f:0,
  j1x:-19, j1y:-1.8, j1p:62, j1q:0, j1f:0, j2x:-14, j2y:-1.8, j2p:62, j2q:0, j2f:0,
  q0:-128, q1:14, q2:14, q3:12, q4:10, q5:8, qa:5, qv:0.32, qd:0,
  rx:0, ry:0, rr:0, co:1, zz:0, vue:0, ql:0, hz:0, sz:0
};
var POSES = M.POSES = {
  debout:{},
  /* assise, de profil : les fesses par terre, les pattes de devant bien droites, la queue posée derrière, le bout relevé */
  assis:{hx:-11, hy:-12.6, sx:8, sy:-32.5, arc:3.6, rh:12.4, rs:10.6, rm:1.6, vent:2.6, tx:6.5, ty:-19, lx:0.2,
    a1x:13.5, a1y:-3.5, a2x:17.5, a2y:-3.5, j1x:2, j1y:-1.8, j1p:6, j2x:6.5, j2y:-1.8, j2p:6,
    q0:162, q1:10, q2:10, q3:16, q4:22, q5:26, qa:7, qv:0.28},
  /* couchée « en pain » : les pattes rentrées sous elle, la queue le long du corps */
  pain:{hx:-15, hy:-12.4, sx:14, sy:-13.6, arc:2.6, rh:12.2, rs:11.8, rm:2.2, vent:0.6, tx:12, ty:-13.5, lx:0.15, yo:0.74, pu:0.25,
    a1x:21, a1y:-3.4, a2x:25, a2y:-3.4, j1x:-6, j1y:-1.8, j1p:4, j2x:-2, j2y:-1.8, j2p:4,
    q0:84, q1:-46, q2:-34, q3:-6, q4:-6, q5:-10, qa:2, qv:0.16, qd:1},
  /* en boule, elle dort : le dos tout rond, la tête posée sur ses pattes, la queue ramenée sous le nez */
  dort:{hx:-13, hy:-12.6, sx:11, sy:-13, arc:5.4, rh:12.4, rs:12, rm:2.6, vent:0.4, tx:15, ty:1.6, ta:14, lx:0, ly:0.2, yo:0, pu:0.2,
    a1x:21, a1y:-3.2, a2x:24, a2y:-3.2, j1x:-5, j1y:-1.8, j1p:4, j2x:-1, j2y:-1.8, j2p:4, og:-6, od:6,
    q0:82, q1:-48, q2:-30, q3:-6, q4:-8, q5:-14, qa:1.2, qv:0.12, qd:1, zz:1},
  /* sur le dos, les quatre pattes en l'air (on voit ses coussinets), la tête à l'envers qui nous regarde */
  dos:{hx:-14, hy:-11.8, sx:12, sy:-12.4, arc:-1.6, rh:12, rs:11.6, rm:1.4, vent:2.4, bu:1, tx:15, ty:-5.5, ta:76, lx:0, ly:-0.2, pu:0.8,
    a1x:8, a1y:-33, a1q:-110, a1f:1, a2x:17, a2y:-30, a2q:-70, a2f:1, j1x:-22, j1y:-31, j1p:-62, j1q:-110, j1f:1, j2x:-11, j2y:-33, j2p:-76, j2q:-100, j2f:1,
    q0:176, q1:6, q2:10, q3:18, q4:24, q5:26, qa:8, qv:0.5, jo:0.5},
  /* dressée sur ses pattes de derrière (elle fait ses griffes, elle tape une boule) */
  dresse:{hx:-5, hy:-17.5, sx:5, sy:-49, arc:-1.5, rh:12, rs:10.6, rm:1, vent:2.2, tx:6, ty:-17, ta:-6, lx:0.5, ly:-0.5,
    a1x:21, a1y:-56, a1q:-70, a2x:22, a2y:-48, a2q:-60, j1x:-3, j1y:-1.8, j1p:50, j2x:3, j2y:-1.8, j2p:50,
    q0:168, q1:8, q2:12, q3:18, q4:22, q5:24, qa:8, qv:0.6},
  /* tapie, à l'affût : le nez au ras du sol, les fesses en l'air */
  tapi:{hx:-20, hy:-19, sx:18, sy:-14, arc:1.6, rh:11.6, rs:11.2, rm:1.4, vent:0.8, tx:15, ty:-9, ta:4, lx:0.8, ly:0.1, pu:1, og:8, od:-8,
    a1x:24, a1y:-3.5, a2x:28, a2y:-3.5, j1x:-17, j1y:-1.8, j1p:34, j2x:-12, j2y:-1.8, j2p:34,
    q0:176, q1:2, q2:4, q3:6, q4:8, q5:10, qa:5, qv:1.4},
  /* le nez dans sa gamelle */
  mange:{hx:-21, hy:-24, sx:16, sy:-19, arc:1.4, tx:13, ty:-4.5, ta:28, lx:0.4, ly:0.7, yo:0.76, pu:0.3,
    a1x:19, a1y:-3.5, a2x:23, a2y:-3.5, q0:-150, q1:16, q2:14, q3:10, q4:8, q5:6, qa:4, qv:0.3}
};
/* une pose complète (une copie qu'on peut changer) */
M.pose = function(nom, plus){
  var P = {}, k, d = POSES[nom] || {};
  for(k in DEBOUT) P[k] = DEBOUT[k];
  for(k in d) P[k] = d[k];
  if(plus) for(k in plus) P[k] = plus[k];
  return P;
};
M.CLES = Object.keys(DEBOUT);

var m = M.maths, eio = m.eio, eo = m.eo, seg = m.seg, pic = m.pic, frac = m.frac, vers = m.vers, ang = m.ang, TAU = Math.PI * 2, RAD = Math.PI / 180;
function S(t, hz, ph){ return Math.sin(TAU * hz * t + (ph || 0)); }
function mont(t, d){ return eo(Math.min(1, t / d)); }              /* monte de 0 à 1 en d secondes */
function vif(x){ return (x < 0 ? -1 : 1) * Math.pow(Math.abs(x), 0.4); }   /* un demi-tour qui ne traîne pas de profil */
/* aller vers une pose (k : 0 … 1) ; la queue tourne par le plus court */
function versPose(P, nom, k){
  var T = POSES[nom], c;
  for(c in T) P[c] = c === 'q0' ? P[c] + ang(T[c] - P[c]) * k : P[c] + (T[c] - P[c]) * k;
}
/* une suite de petites mimiques tirées au hasard, jamais deux fois la même de suite : laquelle (i), depuis quand (tt), fondue (k) */
function suite(c, t, n, dmin, dmax, pause){
  var s = c.m;
  if(s.fin === undefined || t >= s.fin){
    var i; do { i = Math.floor(Math.random() * n); } while(n > 1 && i === s.i);
    s.i = c.o && c.o.i !== undefined && s.fin === undefined ? c.o.i : i;
    s.deb = t + (s.fin === undefined ? 0 : (pause || 0)); s.fin = s.deb + dmin + Math.random() * (dmax - dmin);
  }
  s.tt = Math.max(0, t - s.deb);
  s.k = t < s.deb ? 0 : Math.min(1, s.tt / 0.28, (s.fin - t) / 0.28);
  return s;
}

M.TOILETTES = 8;                  /* ses façons de faire sa toilette (le geste « toilette ») */
var TQ = M.TOILETTE_QUEUE = [26, -6, -10, -16, -24, -28];      /* sa queue ramenée devant elle, le bout relevé (elle se la lèche) */
/* ---------- Les poses composées : une pose de base, et un geste qui tourne ---------- */
M.BASES = {marche:'debout', saute:'debout', lave:'assis', tape:'assis', salut:'assis', griffe:'dresse', boule:'dresse'};
M.BOUCLES = {lave:'toilette', tape:'tape', mange:'croque', salut:'salut', griffe:'griffe', boule:'boule'};
/* ---------- Les classes posées par atelier.js → le geste qui tourne tant que la classe est là ---------- */
M.CLASSES = {'at-x-clos':'clos', 'at-x-miaou':'miaou', 'at-x-baille':'baille', 'at-x-langue':'langue', 'at-x-cligne':'cligne', 'at-x-penche':'penche',
  'at-x-oreille':'oreille', 'at-x-queue':'queue', 'at-x-eternue':'eternue', 'at-x-joue':'joue', 'at-x-content':'content', 'at-x-tete':'calinTete',
  'at-x-dosg':'calinDos', 'at-x-agace':'agace', 'at-x-attrape':'attrape', 'at-x-petrit':'petrit', 'at-x-secoue':'secoue', 'at-x-mordille':'mordille',
  'at-c-ronron':'ronron', 'at-c-tapi':'tapi', 'at-c-fesses':'fesses', 'at-c-fatigue':'fatigue', 'at-c-ronde':'ronde'};

/* ==========================================================
   La marche. Chaque patte : posée (elle recule sous le corps), puis levée (elle revient devant, en cloche).
   L : la longueur d'une foulée ; b : la part du temps où une patte est posée ; dec : le décalage des pattes (j1, a1, j2, a2).
   Au pas : les quatre pattes l'une après l'autre ; au trot : deux par deux, en diagonale ; à la course : les deux de derrière, puis les deux de devant.
   ========================================================== */
/* (16 novembre, 19 h 56, Romain : « elle fait plein de petits pas et elle va un peu trop lentement. Et quand elle court, c'est encore pire ».
   De plus grandes foulées, à la mesure de ses pattes : au pas, une foulée fait sa longueur ; au galop, trois fois plus, avec un temps en l'air.
   Une patte posée recule exactement d'autant que le corps avance (b × L) : elle ne patine plus.) */
M.ALLURES = {
  pas:{L:40, b:0.62, hav:4.4, har:3.6, bob:0.75, dec:[0, 0.25, 0.5, 0.75]},
  trot:{L:54, b:0.46, hav:6.2, har:5.2, bob:1.7, dec:[0, 0.5, 0.5, 0], bas:1},
  course:{L:120, b:0.22, hav:9, har:8, bob:3.4, dec:[0, 0.52, 0.1, 0.62], vol:1}
};
M.SEUILS = [118, 235];            /* sa vitesse (dans ses mesures à elle, par seconde) : au-delà, elle trotte ; au-delà, elle galope */
M.DUREE_VUE = 0.066;              /* un demi-tour : chaque dessin reste deux images (66 millièmes de seconde) */
M.pas = function(F, phi, w, A){
  function patte(pre, dec, arr){
    var u = frac(phi + dec), cx = F[pre + 'x'], x, lev = 0, s, sol = arr ? -1.8 : -3.5, app = A.L * A.b;      /* (app : le chemin que fait le corps pendant que la patte est posée) */
    if(u < A.b){ s = u / A.b; x = cx + app * (0.5 - s); }
    else { s = (u - A.b) / (1 - A.b); x = cx - app / 2 + app * eio(s); lev = Math.sin(Math.PI * s); }
    F[pre + 'x'] = vers(cx, x, w);
    F[pre + 'y'] = vers(F[pre + 'y'], sol - lev * (arr ? A.har : A.hav), w);
    if(arr){
      F[pre + 'p'] = vers(F[pre + 'p'], u < A.b ? 62 + 22 * seg(s, 0.6, 1) : 84 - 24 * s + 20 * Math.sin(Math.PI * s), w);
      F[pre + 'q'] = vers(F[pre + 'q'], u < A.b ? 0 : 28 * lev, w);
    } else F[pre + 'q'] = vers(F[pre + 'q'], u < A.b ? -8 * seg(s, 0.7, 1) : 42 * lev - 8 * (1 - s), w);
  }
  patte('j1', A.dec[0], 1); patte('a1', A.dec[1], 0); patte('j2', A.dec[2], 1); patte('a2', A.dec[3], 0);
  var a2 = 2 * TAU * phi, i;
  F.hy += A.bob * Math.cos(a2 + 0.6) * w; F.sy += A.bob * Math.cos(a2 + 2.3) * w;
  F.ty += A.bob * 0.6 * Math.cos(a2 + 3.8) * w; F.ta += 1.6 * Math.sin(a2 + 1) * w;
  F.hz += 1.9 * Math.sin(TAU * phi + 0.4) * w; F.sz -= 1.3 * Math.sin(TAU * phi + 0.4) * w;      /* (le déhanché : il se voit de face et de dos) */
  for(i = 1; i < 6; i++) F['q' + i] += 3.2 * Math.sin(TAU * phi - i * 0.7) * w;
  if(A.bas){ F.tx += 1.6 * w; F.ty += 1.8 * w; F.hy += 0.8 * w; F.sy += 0.8 * w; }
  if(A.vol){                                 /* la course : le dos se plie et se déplie, elle décolle entre deux foulées */
    var s2 = Math.sin(TAU * phi + 0.4);
    F.hx += 3.6 * s2 * w; F.sx -= 3.6 * s2 * w; F.arc += 3 * s2 * w; F.ry -= A.bob * (0.5 + 0.5 * Math.sin(a2 / 2 * 2 + 1.2)) * w;
    F.tx += 3 * w; F.ty += 3.4 * w; F.og -= 13 * w; F.od += 13 * w; F.oa = Math.max(F.oa, 0.45 * w); F.pu = vers(F.pu, 1, w);
    F.q0 += ang(174 - F.q0) * 0.85 * w;
    for(i = 1; i < 6; i++) F['q' + i] *= 1 - 0.6 * w;
  }
};

/* ==========================================================
   Les gestes : f(P, u, t, c). P : la pose de l'image, qu'on change ; t : les secondes depuis le début du geste ;
   u : pour un geste qui a une durée (d, en ms), l'avancement de 0 à 1 ; c.o : ses réglages ; c.m : sa mémoire.
   ent, sor : en combien de secondes il se fond dans le reste, au début et à la fin.
   ========================================================== */
var GS = M.GESTES = {
  /* --- les mimiques du visage --- */
  clos:{f:function(P){ P.yc = 1; P.jo = Math.max(P.jo, 0.5); }},
  miaou:{f:function(P, u, t){ var k = mont(t, 0.09); P.bo = Math.max(P.bo, k); P.ta -= 7 * k; P.ty -= 1.2 * k; P.yo = Math.min(P.yo, 1 - 0.35 * k); P.mo += 6 * k; }},
  baille:{ent:0.05, sor:0.25, f:function(P, u, t){ var k = eio(Math.min(1, t / 0.42)); P.bo = 1.9 * k; P.yo *= 1 - k; P.ta -= 12 * k; P.ty -= 1.6 * k; P.oa = Math.max(P.oa, 0.6 * k); P.la = 0.55 * k; P.og -= 8 * k; P.od += 8 * k; }},
  langue:{f:function(P, u, t){ P.la = 0.95 + 0.12 * S(t, 2.6); P.bo = 0; }},
  cligne:{f:function(P, u, t){ var k = t < 0.45 ? eio(t / 0.45) : t < 0.95 ? 1 : Math.max(0, 1 - (t - 0.95) / 0.5); P.yo *= 1 - k; P.jo = Math.max(P.jo, 0.4 * k); }},
  penche:{f:function(P, u, t){ var k = mont(t, 0.22); P.ta += 16 * k; P.og += 6 * k; P.tx += 1 * k; }},
  oreille:{f:function(P, u, t){ if(t < 0.84) P.od += 22 * pic(frac(t / 0.42)); if(t > 0.12 && t < 0.96) P.og -= 14 * pic(frac((t - 0.12) / 0.42)); }},
  queue:{f:function(P){ P.qa = 15; P.qv = 2.1; }},
  eternue:{ent:0.03, f:function(P, u, t){
    var a = eio(seg(t, 0, 0.2)), b = seg(t, 0.2, 0.3), c = seg(t, 0.3, 0.68), elan = a * (1 - b), coup = b * (1 - c);
    P.ta += -14 * elan + 12 * coup; P.ty += -2 * elan + 3.4 * coup; P.yo *= 1 - Math.min(1, a * 1.2) * (1 - c); P.bo = Math.max(P.bo, 0.55 * coup); P.oa = Math.max(P.oa, 0.7 * coup); P.sy += 1.5 * coup;
  }},
  joue:{f:function(P, u, t){ var k = mont(t, 0.12); P.pu = vers(P.pu, 1, k); P.og += 7 * k; P.od -= 7 * k; P.mo += 8 * k; }},
  content:{ent:0.03, f:function(P, u, t){ if(t < 0.5){ var h = pic(t / 0.5), cr = pic(t / 0.16); P.ry -= 5 * h; P.hy += 1.6 * cr; P.sy += 1.6 * cr; P.a1q += 20 * h; } if(t < 0.75) P.yc = 1; P.jo = Math.max(P.jo, 0.6); }},
  fatigue:{f:function(P){ P.yo = Math.min(P.yo, 0.55); }},
  ronde:{f:function(P){ P.vent += 3.4; P.rm += 0.8; }},
  ronron:{f:function(P, u, t){ P.ry += 0.22 * S(t, 23); P.mo += 1.4 * S(t, 23); }},
  fesses:{f:function(P, u, t){ var s = S(t, 3.3); P.hx += 1.9 * s; P.hy -= 0.9 * Math.abs(s); P.q4 += 10 * S(t, 6.6); P.q5 += 14 * S(t, 6.6); }},
  tapi:{ent:0.24, sor:0.2, f:function(P){ versPose(P, 'tapi', 1); }},
  secoue:{ent:0.04, f:function(P, u, t){ var k = Math.min(1, t / 0.1) * Math.max(0, 1 - Math.max(0, t - 0.68) / 0.22), s = S(t, 8); P.rr += 4.5 * s * k; P.ta += 11 * S(t, 8, 1) * k; P.og += 16 * s * k; P.od += 16 * s * k; if(k > 0.3) P.yc = 1; P.qa = 14; P.qv = 6; P.hx += s * k; }},

  /* --- le doigt qui la gratte --- */
  /* la tête : six mimiques qui s'enchaînent, jamais deux fois la même de suite (Romain : « qu'on prenne du plaisir à lui gratter la tête ») */
  calinTete:{f:function(P, u, t, c){
    var s = c.fixe ? {i:0, k:1, tt:0.4} : suite(c, t, 6, 1.3, 2.4), k = eio(s.k), tt = s.tt;
    P.jo = Math.max(P.jo, 0.6); P.mo += 4;
    if(s.i === 0){ P.ta += (12 + 5 * S(tt, 0.8)) * k; P.tx += 1.6 * S(tt, 0.8) * k; P.ty += k; if(k > 0.4) P.yc = 1; P.oa = Math.max(P.oa, 0.3 * k); }        /* elle se frotte la joue contre le doigt */
    else if(s.i === 1){ P.yo = vers(P.yo, 0.22 + 0.16 * S(tt, 0.35), k); P.ta += 4 * k; P.og -= 9 * k; P.od += 9 * k; }                                           /* les yeux mi-clos, lentement */
    else if(s.i === 2){ P.ty -= 3.6 * k; P.ta -= 7 * k; P.sy -= 1.4 * k; if(k > 0.4) P.yc = 1; P.oa = Math.max(P.oa, 0.25 * k); }                                 /* elle pousse la tête dans la main */
    else if(s.i === 3){ P.og -= 30 * k; P.od += 30 * k; P.oa = Math.max(P.oa, 0.5 * k); if(k > 0.4) P.yc = 1; P.jo = 1; P.ta += 3 * S(tt, 0.5) * k; }                 /* les oreilles couchées de plaisir */
    else if(s.i === 4){ P.ta -= 16 * k; P.ty -= 2 * k; if(k > 0.4) P.yc = 1; P.bo = Math.max(P.bo, 0.16 * k); }                                                   /* le menton levé */
    else { P.ta -= 13 * k; P.lx = vers(P.lx, -0.5, k); P.tx -= 1.5 * k; if(k > 0.4) P.yc = 1; }                                                                  /* la tête penchée de l'autre côté */
  }},
  petrit:{ent:0.25, sor:0.25, f:function(P, u, t){ var a = Math.max(0, S(t, 1.15)), b = Math.max(0, -S(t, 1.15)); P.a1y -= 4.4 * a; P.a1q -= 16 * a; P.a2y -= 4.4 * b; P.a2q -= 16 * b; P.yc = 1; P.ta += 5; P.ty += 1.2; P.sy += 0.6 * S(t, 2.3); }},
  /* après un long câlin : elle mordille le doigt, tout doucement, puis le lèche */
  mordille:{ent:0.12, sor:0.2, f:function(P, u, t){ var k = mont(t, 0.15), mm = t < 1.1 ? Math.max(0, S(t, 4.2)) : 0; P.ta -= 10 * k; P.ty -= 2.2 * k; P.bo = Math.max(P.bo, 0.75 * mm); P.la = t > 1.1 ? 0.9 + 0.25 * S(t, 3) : P.la; P.pu = vers(P.pu, 0.9, k); P.og += 5 * k; P.od -= 5 * k; P.yo = Math.min(P.yo, 0.8); }},
  /* le dos : elle lève les fesses, la queue toute droite frissonne */
  calinDos:{ent:0.25, sor:0.25, f:function(P, u, t){ var k = mont(t, 0.3), i; P.hy -= 3.2 * k; P.arc += 2.2 * k; P.q0 += ang(-98 - P.q0) * k; for(i = 1; i < 6; i++) P['q' + i] = vers(P['q' + i], 3, k); P.qa = 2.2; P.qv = 5.5; P.yc = 1; P.jo = Math.max(P.jo, 0.5); P.ta -= 5 * k; }},
  /* la queue : « pas la queue ! » — les oreilles en arrière, la queue fouette */
  agace:{f:function(P, u, t){ var k = mont(t, 0.12); P.og -= 34 * k; P.od += 34 * k; P.oa = Math.max(P.oa, 0.8 * k); P.pu = vers(P.pu, 0, k); P.yo = Math.min(P.yo, 1 - 0.34 * k); P.pt = vers(P.pt, -15, k); P.qa = 20; P.qv = 2.6; P.mo -= 9 * k; }},
  /* sur le dos, le ventre : elle attrape le doigt avec ses pattes de devant, et tape des pattes de derrière */
  attrape:{f:function(P, u, t){
    var k = mont(t, 0.15), s5 = S(t, 5.2);
    P.a1x = vers(P.a1x, 10 + 1.2 * S(t, 3.1), k); P.a1y = vers(P.a1y, -31 + 1.5 * S(t, 6.2), k); P.a2x = vers(P.a2x, 14 - 1.2 * S(t, 3.1), k); P.a2y = vers(P.a2y, -30 - 1.5 * S(t, 6.2), k);
    P.j1y += 5 * s5 * k; P.j1x += 3 * s5 * k; P.j2y -= 5 * s5 * k; P.j2x -= 3 * s5 * k;
    P.bo = Math.max(P.bo, 0.85 * k); P.pu = 1; P.oa = Math.max(P.oa, 0.5 * k); P.og -= 20 * k; P.od += 20 * k;
  }},

  /* --- ce qu'elle fait dans une pose (les gestes des poses composées) --- */
  /* sa toilette, assise : huit façons, l'une après l'autre, jamais deux fois la même de suite (Romain : « on peut la voir faire sa toilette,
     mais avec des vraies animations » ; puis, le 16 novembre à 22 h 22 : « il faut mettre plein d'animations sur se laver ») */
  toilette:{ent:0.2, sor:0.25, f:function(P, u, t, c){
    var s = c.fixe ? {i:0, k:1, tt:0.5} : suite(c, t, M.TOILETTES, 2.4, 3.6, 0.35), k = eio(s.k), tt = s.tt, lk = S(tt, 3.1), hx0 = P.sx + P.tx, hy0 = P.sy + P.ty, i;
    if(k <= 0) return;
    if(s.i === 0){                 /* elle se lèche la patte */
      P.ty += (4.2 + 0.8 * lk) * k; P.tx -= 3 * k; P.ta += 22 * k; P.lx = vers(P.lx, 0.8, k); P.ly = vers(P.ly, 0.5, k); P.lt = 1.8 * k;
      P.a1x = vers(P.a1x, hx0 + 11, k); P.a1y = vers(P.a1y, hy0 + 24.5, k); P.a1q = vers(P.a1q, -52, k); if(k > 0.5) P.a1f = 1;
      P.la = (0.85 + 0.3 * lk) * k; if(k > 0.5) P.yc = 1;
    } else if(s.i === 1){          /* la patte passe derrière l'oreille et redescend sur la joue */
      var p = frac(tt / 0.95), pp = eio(p);
      P.ta += 10 * k; P.ty += 2 * k;
      P.a1x = vers(P.a1x, hx0 + 10.5 - 3.5 * Math.sin(Math.PI * pp), k); P.a1y = vers(P.a1y, hy0 - 15 + 27 * pp, k); P.a1q = vers(P.a1q, -98, k);
      P.od += 28 * pic(seg(p, 0, 0.45)) * k; if(k > 0.5) P.yc = 1;
    } else if(s.i === 2){          /* elle se lèche le flanc */
      P.tx -= 15.5 * k; P.ty += (9.5 + 0.7 * lk) * k; P.ta += 40 * k; P.lx = vers(P.lx, -0.9, k); P.arc += 1.2 * k; P.sx -= 1.5 * k;
      P.la = (0.85 + 0.3 * lk) * k; if(k > 0.5) P.yc = 1;
    } else if(s.i === 3){          /* la patte de derrière en l'air */
      P.sx -= 4 * k; P.sy += 3.5 * k; P.hx -= k; P.a1x += 1.5 * k;
      P.j1x = vers(P.j1x, -4.5, k); P.j1y = vers(P.j1y, -40, k); P.j1p = vers(P.j1p, -86, k); P.j1q = vers(P.j1q, -100, k); if(k > 0.5) P.j1f = 1;
      P.tx -= 1.5 * k; P.ty += (20.5 + 0.7 * lk) * k; P.ta += 36 * k; P.lx = vers(P.lx, -0.5, k); P.la = (0.85 + 0.3 * lk) * k; if(k > 0.5) P.yc = 1;
    } else if(s.i === 4){          /* elle se lèche le poitrail : le menton rentré, à petits coups de langue */
      P.tx -= 5.5 * k; P.ty += (9.5 + 0.9 * lk) * k; P.ta += 50 * k; P.lx = vers(P.lx, 0.1, k); P.ly = vers(P.ly, 0.9, k);
      P.sy += 1.2 * k; P.arc += 0.8 * k; P.og -= 6 * k; P.od += 6 * k;
      P.la = (0.85 + 0.3 * lk) * k; if(k > 0.5) P.yc = 1;
    } else if(s.i === 5){          /* elle se débarbouille : les deux pattes de devant frottent le museau, l'une après l'autre */
      var fr = S(tt, 2.3);
      P.sy -= 2.2 * k; P.sx -= 2 * k; P.ta += (16 + 5 * fr) * k; P.ty += (4.5 + 1.5 * fr) * k; P.tx -= 1.5 * k;
      P.a1x = vers(P.a1x, hx0 + 8 + 1.2 * fr, k); P.a1y = vers(P.a1y, hy0 + 19 + 5.5 * fr, k); P.a1q = vers(P.a1q, -96, k);
      P.a2x = vers(P.a2x, hx0 + 13.5 - 1.2 * fr, k); P.a2y = vers(P.a2y, hy0 + 19 - 5.5 * fr, k); P.a2q = vers(P.a2q, -96, k);
      P.od += 12 * Math.max(0, fr) * k; P.og -= 8 * Math.max(0, -fr) * k; P.mo -= 5 * k; P.la = 0.8 * Math.max(0, fr) * k; if(k > 0.5) P.yc = 1;
    } else if(s.i === 6){          /* elle se lèche la queue : elle la ramène devant elle, la tient d'une patte, et la lisse de la langue */
      P.q0 += ang(TQ[0] - P.q0) * k; for(i = 1; i < 6; i++) P['q' + i] = vers(P['q' + i], TQ[i] + (i === 5 ? 8 * lk : 0), k);
      P.qa = vers(P.qa, 1.2, k); if(k > 0.5) P.qd = 1;
      P.sy += 4.5 * k; P.sx += 1 * k; P.arc += 1.6 * k; P.tx -= 5 * k; P.ty += (17 + 0.8 * lk) * k; P.ta += 46 * k; P.lx = vers(P.lx, 0.2, k); P.ly = vers(P.ly, 0.9, k);
      P.a1x = vers(P.a1x, 22, k); P.a1y = vers(P.a1y, -6.5, k); P.a1q = vers(P.a1q, 24, k);
      P.la = (0.85 + 0.3 * lk) * k; if(k > 0.5) P.yc = 1;
    } else {                       /* elle se gratte derrière l'oreille avec la patte de derrière, très vite… et s'arrête, l'air de rien */
      var on = tt % 1.5 < 1.05 ? 1 : 0, gr = S(tt, 7) * on;
      P.sx -= 4.5 * k; P.sy += 4 * k; P.hx -= k; P.a1x += 1.5 * k;
      P.tx -= 1 * k; P.ty += (16 + 0.7 * gr) * k; P.ta += (10 + 2.5 * gr) * k; P.lx = vers(P.lx, -0.3, k);
      P.j1x = vers(P.j1x, -11.5 + 2 * gr, k); P.j1y = vers(P.j1y, -41 - 2.5 * gr, k); P.j1p = vers(P.j1p, -84, k); P.j1q = vers(P.j1q, -70 + 30 * gr, k); if(k > 0.5) P.j1f = 1;
      P.og -= 20 * k; P.oa = Math.max(P.oa, 0.5 * k); P.od += 10 * Math.abs(gr) * k; P.mo += 4 * gr * k;
      if(k > 0.5){ if(on) P.yc = 1; else P.yo = Math.min(P.yo, 0.7); }
      for(i = 4; i < 6; i++) P['q' + i] += 6 * gr * k;
    }
  }},
  /* assise, elle tape devant elle du bout de la patte */
  tape:{ent:0.2, sor:0.2, f:function(P, u, t){
    var k = mont(t, 0.2), s = S(t, 2.6), a = Math.max(0, s);
    P.a1x = vers(P.a1x, 23 + 6 * a, k); P.a1y = vers(P.a1y, -15 - 5 * a + 3 * Math.max(0, -s), k); P.a1q = vers(P.a1q, -24 + 50 * Math.max(0, -s), k);
    P.pu = vers(P.pu, 1, k); P.lx = vers(P.lx, 0.8, k); P.ly = vers(P.ly, 0.3, k); P.ta += 5 * k; P.og += 6 * k; P.od -= 6 * k; P.sx += 1.2 * a * k;
  }},
  croque:{f:function(P, u, t){ P.ty += 1.3 * Math.abs(S(t, 2.3)); P.bo = Math.max(P.bo, 0.3 * Math.max(0, S(t, 4.6))); P.ta += 2 * S(t, 2.3); }},
  /* elle dit au revoir de la patte */
  salut:{ent:0.25, sor:0.25, f:function(P, u, t){ var k = mont(t, 0.25); P.a1x = vers(P.a1x, 31, k); P.a1y = vers(P.a1y, -38, k); P.a1q = vers(P.a1q, -70 + 24 * S(t, 2.3), k); if(k > 0.5){ P.a1f = 1; P.yc = 1; } P.ta += 8 * k; P.jo = Math.max(P.jo, 0.6); }},
  /* dressée, elle fait ses griffes : une patte descend, l'autre remonte */
  griffe:{ent:0.2, sor:0.2, f:function(P, u, t){ var k = mont(t, 0.2), s = S(t, 1.5), a = 0.5 + 0.5 * s; P.a1y += 9 * a * k; P.a2y += 9 * (1 - a) * k; P.a1q += 14 * a * k; P.a2q += 14 * (1 - a) * k; P.sy += 1.2 * s * k; P.ta -= 5 * k; P.pu = vers(P.pu, 0.7, k); }},
  /* dressée, elle tape une boule qui pend au-dessus d'elle */
  boule:{ent:0.2, sor:0.2, f:function(P, u, t){ var k = mont(t, 0.2), a = Math.max(0, S(t, 1.56)); P.a1x = vers(P.a1x, 16 + 7 * a, k); P.a1y = vers(P.a1y, -60 - 7 * a, k); P.a1q = vers(P.a1q, -92 + 40 * a, k); P.ly = vers(P.ly, -0.9, k); P.lx = vers(P.lx, 0.4, k); P.pu = vers(P.pu, 1, k); P.ta -= 8 * k; P.sy -= 2 * a * k; }},

  /* --- le saut (d'un endroit à un autre : le chat lui-même est déplacé par atelier.js, sur la même horloge : c.o.temps) --- */
  saut:{ent:0.05, sor:0.1, f:function(P, u, t, c){
    var o = c.o, T = o.temps ? o.temps() : null, pre = o.pre, vol = o.vol, i;
    if(T === null || T === undefined) T = t * 1000;
    var monte = -o.dy > 40;
    if(T < pre){                     /* elle se ramasse, vise, remue les fesses, s'écrase encore un peu… */
      var a = T / pre, cr = eio(seg(a, 0, 0.3)), wig = o.fesses ? seg(a, 0.3, 0.86) : 0, dip = eio(seg(a, 0.84, 1));
      /* (elle se ramasse pour de bon : le derrière bas, les pattes de derrière sous elle, la tête qui reste haute et fixe ce qu'elle vise) */
      P.hy += 8.5 * cr + 2.5 * dip; P.sy += 7 * cr + 1.5 * dip; P.sx += 0.5 * cr; P.hx += 2.5 * cr; P.arc += 2.2 * cr; P.ty -= 2.5 * cr;
      P.j1x += 5 * cr; P.j2x += 5 * cr; P.j1p -= 22 * cr; P.j2p -= 22 * cr;
      if(wig > 0 && wig < 1){ var sw = Math.sin(TAU * o.fesses * wig); P.hx += 2 * sw; P.hy -= Math.abs(sw); P.q4 += 12 * sw; P.q5 += 16 * sw; }
      P.pu = vers(P.pu, 1, cr); P.ly = vers(P.ly, monte ? -0.8 : 0, cr); P.lx = vers(P.lx, 0.9, cr); P.og += 7 * cr; P.od -= 7 * cr; P.ta -= (monte ? 10 : 2) * cr;
      P.q0 += ang(170 - P.q0) * cr * 0.8; P.qa = 3; P.qv = 3;
      return;
    }
    if(T < pre + vol){               /* … s'élance, s'étire en l'air, se regroupe, tend les pattes de devant */
      var v = (T - pre) / vol, dyv = o.dy - 4 * o.haut * (1 - 2 * v), pente = Math.atan2(dyv, Math.abs(o.dx) + 70) / RAD;
      var wA = 1 - seg(v, 0.12, 0.44), wC = seg(v, 0.54, 0.9), wB = Math.max(0, 1 - wA - wC), fin = eio(seg(v, 0.84, 1)), dc = o.style ? 0.06 : -0.06;
      P.rr += Math.max(-46, Math.min(46, pente * 0.9)) * (1 - fin);
      P.hx -= 2.5 * wA; P.sx += 3 * wA; P.arc += -1.6 * wA + 3 * wB + wC;
      P.j1x = -33 * wA - 11 * wB - 8 * wC; P.j1y = -12 * wA - 13 * wB - 9 * wC; P.j1p = 118 * wA + 24 * wB + 34 * wC; P.j1q = 20 * wA;
      P.j2x = P.j1x + 5 + 10 * dc * wA; P.j2y = P.j1y - 2 * wA; P.j2p = P.j1p - 8 * wA; P.j2q = P.j1q;
      P.a1x = 31 * wA + 23 * wB + (25 - 7.5 * fin) * wC; P.a1y = -22 * wA - 15 * wB + (-8 + 4.5 * fin) * wC; P.a1q = -25 * wA + 30 * wB - 10 * wC * (1 - fin);
      P.a2x = P.a1x + 4.5 - 12 * dc * wA; P.a2y = P.a1y + 1.5 * wA; P.a2q = P.a1q;
      P.ty -= 2 * wA; P.lx = 0.8; P.ly = vers(-0.3, 0.5, v); P.pu = 1; P.og -= 14; P.od += 14; P.oa = Math.max(P.oa, 0.4);
      P.q0 += ang((wC > 0.5 ? -150 : 176) - P.q0) * 0.9; for(i = 1; i < 6; i++) P['q' + i] *= 0.4;
      P.qa = 2; P.qv = 2;
      return;
    }
    var w = Math.min(1, (T - pre - vol) / o.post), pos = eio(seg(w, 0, 0.32));   /* … et se réceptionne : le devant d'abord, le derrière suit */
    P.sy += 6.5 * pic(seg(w, 0, 0.55)); P.hy += 5 * pic(seg(w, 0.1, 0.78)); P.ty += 2.5 * pic(seg(w, 0, 0.5)); P.arc += 2 * pic(seg(w, 0, 0.6));
    P.j1x = vers(-8, P.j1x, pos); P.j1y = vers(-9, P.j1y, pos); P.j1p = vers(34, P.j1p, pos);
    P.j2x = vers(-3, P.j2x, pos); P.j2y = vers(-9, P.j2y, pos); P.j2p = vers(34, P.j2p, pos);
    for(i = 1; i < 6; i++) P['q' + i] += 12 * pic(seg(w, 0, 0.7));
    P.pu = vers(1, P.pu, w); P.oa = Math.max(P.oa, 0.4 * (1 - w));
  }},

  /* --- ses jeux, sur place --- */
  /* un bond en l'air (c.o.h : la hauteur) */
  bond:{d:820, ent:0.05, sor:0.08, saute:1, f:function(P, u, t, c){
    var H = c.o.h || 17, cr = pic(seg(u, 0, 0.3)), v = seg(u, 0.24, 0.8), h = v > 0 && v < 1 ? 4 * v * (1 - v) : 0, att = pic(seg(u, 0.78, 1));
    P.hy += 6 * cr + 4 * att; P.sy += 5.5 * cr + 4.5 * att; P.arc += 1.5 * cr;
    P.ry -= H * h; P.rr -= 7 * Math.sin(TAU * v) * (h > 0 ? 1 : 0);
    var et = pic(seg(v, 0, 0.4)), gr = pic(seg(v, 0.3, 1));
    P.j1y += 4 * et - 5 * gr; P.j2y += 4 * et - 6 * gr; P.j1p += 30 * et; P.j2p += 30 * et;
    P.a1y -= 7 * h; P.a2y -= 8 * h; P.a1x += 5 * h; P.a2x += 5 * h; P.a1q -= 34 * h; P.a2q -= 34 * h;
    P.pu = vers(P.pu, 1, Math.min(1, u * 6)); P.og += 6; P.od -= 6; P.ly = vers(P.ly, -0.5, h);
    P.q0 += ang(-110 - P.q0) * h * 0.6;
  }},
  /* une galipette : un tour complet en l'air, roulée en boule */
  galipette:{d:1000, ent:0.05, sor:0.08, saute:1, f:function(P, u){
    var cr = pic(seg(u, 0, 0.26)), v = seg(u, 0.22, 0.8), h = 4 * v * (1 - v), att = pic(seg(u, 0.78, 1)), b = pic(v);
    P.hy += 6 * cr + 4 * att; P.sy += 6 * cr + 4 * att; P.ry -= 25 * h; P.rr -= 360 * eio(v);
    P.arc += 5 * b; P.hx += 5 * b; P.sx -= 5 * b; P.ty += 6 * b; P.tx -= 2 * b; P.ta += 20 * b;
    P.a1x -= 6 * b; P.a1y -= 8 * b; P.a2x -= 6 * b; P.a2y -= 8 * b; P.j1x += 8 * b; P.j1y -= 8 * b; P.j2x += 8 * b; P.j2y -= 8 * b;
    if(v > 0.1 && v < 0.9) P.yc = 1;
  }},
  /* elle s'étire : le devant par terre et les fesses en l'air (elle bâille), puis tout en longueur, une patte de derrière qui traîne */
  etire:{d:1900, ent:0.15, sor:0.2, f:function(P, u){
    var a = pic(seg(u, 0, 0.52)), b = pic(seg(u, 0.48, 1));
    P.sy += 10.5 * a; P.sx += 2.5 * a; P.hy -= 2.6 * a; P.a1x += 10 * a; P.a2x += 10 * a; P.ty += 3 * a; P.tx += 2 * a; P.ta += 8 * a; P.arc -= 2.4 * a;
    if(a > 0.35) P.yc = 1;
    P.bo = Math.max(P.bo, 1.6 * pic(seg(u, 0.1, 0.42))); P.q0 += ang(-100 - P.q0) * a * 0.7;
    P.hx += 5 * b; P.sx += 6 * b; P.sy -= 1.5 * b; P.hy += 2 * b; P.j1x -= 9 * b; P.j1p += 40 * b; P.j1q += 30 * b; P.ta -= 8 * b; P.ty -= 1.5 * b; P.oa = Math.max(P.oa, 0.4 * b);
  }},
  /* elle s'aplatit, les oreilles couchées… et surgit ! */
  cache:{d:2000, ent:0.1, sor:0.1, f:function(P, u){
    var a = eio(seg(u, 0, 0.16)) * (1 - seg(u, 0.6, 0.66)), h = pic(seg(u, 0.64, 0.86)), att = pic(seg(u, 0.84, 1));
    P.hy += 11 * a; P.sy += 13.5 * a; P.ty += 6 * a; P.tx += 2 * a; P.oa = Math.max(P.oa, 0.9 * a); P.og -= 24 * a; P.od += 24 * a; P.pu = vers(P.pu, 1, a); P.yo = vers(P.yo, 0.6, a);
    P.a1x += 6 * a; P.a2x += 6 * a; P.q0 += ang(178 - P.q0) * a; P.qa = vers(P.qa, 1, a);
    P.ry -= 13 * h; if(h > 0.2){ P.yc = 1; P.bo = Math.max(P.bo, 0.9); }
    P.a1y -= 8 * h; P.a2y -= 9 * h; P.a1q -= 40 * h; P.a2q -= 40 * h; P.hy += 3 * att; P.sy += 3 * att;
  }},
  /* elle court après sa queue : deux tours sur elle-même */
  tourne:{d:1800, ent:0.12, sor:0.14, f:function(P, u){
    var k = Math.min(1, u / 0.12, (1 - u) / 0.12), i;
    P.vue += 16 * eio(u);                            /* (deux tours sur elle-même, vue après vue) */
    P.tx -= 9 * k; P.ty += 7 * k; P.ta += 24 * k; P.lx = vers(P.lx, -0.9, k); P.arc += 3 * k; P.hx += 3 * k; P.sx -= 3 * k;
    P.q0 += ang(-50 - P.q0) * k; for(i = 1; i < 6; i++) P['q' + i] = vers(P['q' + i], 21, k);
    P.ry -= 2.5 * Math.abs(Math.sin(TAU * 4 * u)) * k; P.a1y -= 2.4 * Math.max(0, Math.sin(TAU * 8 * u)) * k; P.a2y -= 2.4 * Math.max(0, -Math.sin(TAU * 8 * u)) * k;
    P.pu = vers(P.pu, 1, k);
  }},
  /* avant de se coucher : un tour sur elle-même, le nez par terre, à petits pas */
  couche:{d:1500, ent:0.15, sor:0.15, f:function(P, u){
    var k = Math.min(1, u / 0.15, (1 - u) / 0.15), s = Math.sin(TAU * 5 * u), s2 = Math.sin(TAU * 5 * u + 1.5);
    P.vue += 8 * eio(u);                             /* (un tour sur elle-même, vue après vue) */
    P.hy += 3 * k; P.sy += 6 * k; P.ty += 7 * k; P.tx += 1.5 * k; P.ta += 14 * k; P.ly = vers(P.ly, 0.8, k); P.yo = Math.min(P.yo, 1 - 0.4 * k);
    P.a1y -= 2.2 * Math.max(0, s) * k; P.a2y -= 2.2 * Math.max(0, -s) * k; P.j1y -= 1.8 * Math.max(0, s2) * k; P.j2y -= 1.8 * Math.max(0, -s2) * k;
    P.q0 += ang(160 - P.q0) * k * 0.6;
  }},
  /* elle se roule par terre, d'un côté puis de l'autre (elle est sur le dos : la pose « dos ») */
  gigote:{ent:0.2, sor:0.2, f:function(P, u, t){ var s = S(t, 0.9); P.rr += 9 * s; P.ta += 14 * s; P.a1x += 3 * s; P.a2x += 3 * s; P.j1x -= 3 * s; P.j2x -= 3 * s; P.yc = 1; P.jo = Math.max(P.jo, 0.6); }}
};
})(window);
