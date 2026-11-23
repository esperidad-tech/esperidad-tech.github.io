/* ==========================================================
   Les héros « en volume » — LES POSITIONS DU PISTEUR (Romain, 23 novembre, 15 h 04 et 15 h 54).
   « Quand le pisteur appuie sur accroupi, on voit le personnage qui est debout […] qui s'accroupit. Et là, quand il est accroupi,
   je veux qu'il reste comme ça […] et dans cette position, je veux qu'il fasse des mouvements un peu naturels […] Il faut que le
   personnage ait de la vie. » ; « c'est jamais tout le corps qui bouge d'un coup, ça fait un peu robot ».
   Une position = une pose de base (où elle reste) + des GESTES : de petites animations, image clé par image clé, qu'elle fait de
   temps en temps (au hasard, avec un temps d'attente), puis elle revient à la pose de base.
   Un geste = [[quand (secondes depuis le début du geste), ce qui change par rapport à la pose de base], …] ; le dernier est {}
   (le retour). Entre deux images clés, une courbe douce ; deux images clés égales = elle tient la pose.
   Le pantin (hv-pantin.js) : p.position(nom) ; p.joue(geste) (ce geste-là, tout de suite).
   Chargé après hv-poses.js. Ce fichier sert aussi aux mouvements du donjon (hv-donjon.js) : HV.gesteImage, HV.tour,
   HV.regardeEtRevient, HV.flecheSortie.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, P = HV.POSES;
function avec(base, plus){ var R = {}, k; for(k in base) R[k] = base[k]; for(k in plus) R[k] = plus[k]; return R; }
HV.avec = avec;

/* ==========================================================
   LA POSE D'UN GESTE au temps u (secondes depuis son début), à partir de la pose de base.
   (Romain, 23 novembre, 15 h 54 : « c'est un peu robotique, il y a tout le corps qui bouge d'un coup […] quand on regarde à droite,
   à gauche, il y a la tête qui bouge, après les épaules, des fois il y a un pied qui part […] c'est jamais tout le corps qui bouge
   d'un coup ».) Deux choses :
   1. Entre les images clés, une COURBE DOUCE qui passe par toutes (Fritsch-Carlson : elle ne dépasse jamais, et deux images clés
      égales font un arrêt net) : le mouvement ne s'arrête plus à chaque image clé.
   2. Chaque partie du corps a son avance ou son retard (DECALE, en secondes) : la tête et le regard partent les premiers, puis les
      épaules, les mains, les hanches, et les pieds suivent. (Au début et à la fin du geste, le décalage s'efface : pas de saut.)
   ========================================================== */
var DECALE = {regX:0.12, regY:0.12, tete:0.09, hoche:0.07, pen:0.07, dos:0.03, mainG:-0.01, mainD:-0.01, coudeG:-0.01, coudeD:-0.01,
  bang:-0.04, bas:-0.04, leve:-0.05, piedG:-0.08, piedD:-0.08, genouG:-0.08, genouD:-0.08, pointeG:-0.08, pointeD:-0.08, ouvG:-0.08, ouvD:-0.08, lacetG:-0.08, lacetD:-0.08};
function pentes(T, V){
  var n = T.length, d = [], m = [], i;
  for(i = 0; i < n - 1; i++) d.push((V[i + 1] - V[i]) / ((T[i + 1] - T[i]) || 1e-6));
  m[0] = 0; m[n - 1] = 0;
  for(i = 1; i < n - 1; i++){
    if(d[i - 1] * d[i] <= 0) m[i] = 0;
    else { var h0 = T[i] - T[i - 1], h1 = T[i + 1] - T[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
  }
  return m;
}
function courbe(T, V, M, u){
  var n = T.length, k = 0;
  if(u <= T[0]) return V[0];
  if(u >= T[n - 1]) return V[n - 1];
  while(k < n - 2 && u > T[k + 1]) k++;
  var h = T[k + 1] - T[k] || 1e-6, s = (u - T[k]) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * V[k] + (s3 - 2 * s2 + s) * h * M[k] + (-2 * s3 + 3 * s2) * V[k + 1] + (s3 - s2) * h * M[k + 1];
}
HV.courbes = {pentes:pentes, courbe:courbe};
/* (les images clés d'un geste, complétées par la pose de base, une fois pour toutes par base) */
function cles(base, Gst){
  if(Gst._base === base && Gst._K) return Gst._K;
  var T = [0], Ps = [base], i;
  for(i = 0; i < Gst.length; i++){ T.push(Gst[i][0]); Ps.push(avec(base, Gst[i][1])); }
  var C = {};
  Object.keys(base).forEach(function(k){
    var b = base[k];
    if(typeof b === 'number') C[k] = {T:T, V:Ps.map(function(p){ return typeof p[k] === 'number' ? p[k] : b; })};
    else if(b instanceof Array) C[k] = b.map(function(_, j){ return {T:T, V:Ps.map(function(p){ return p[k] instanceof Array ? p[k][j] : b[j]; })}; });
  });
  Object.keys(C).forEach(function(k){ (C[k] instanceof Array ? C[k] : [C[k]]).forEach(function(c){ c.M = pentes(c.T, c.V); }); });
  Gst._base = base; Gst._K = {T:T, C:C};
  return Gst._K;
}
HV.gesteImage = function(base, Gst, u){
  var K = cles(base, Gst), fin = K.T[K.T.length - 1], R = {}, k;
  var bord = Math.max(0, Math.min(1, u / 0.3, (fin - u) / 0.3));
  for(k in base){
    var c = K.C[k];
    if(!c){ R[k] = base[k]; continue; }
    var uc = Math.max(0, Math.min(fin, u + (DECALE[k] || 0) * bord));
    R[k] = c instanceof Array ? c.map(function(cj){ return courbe(cj.T, cj.V, cj.M, uc); }) : courbe(c.T, c.V, c.M, uc);
  }
  return R;
};
HV.dureeGeste = function(Gst){ return Gst[Gst.length - 1][0]; };

/* ==========================================================
   ELLE SE TOURNE SANS ÊTRE SUR UN SOCLE (Romain, 15 h 54 : « on a l'impression qu'elle est sur un socle qui tourne ») : un tour de
   A degrés (> 0 : vers SA gauche), par étapes — 0 : la tête ; 1 : + les épaules ; 2 : + les hanches ; 3 : un pied fait un pas (celui
   du côté où elle tourne) ; 4 : l'autre pied suit, le bassin finit de tourner. pas : le pied est en l'air, à mi-chemin. Les pieds
   tournent autour du bassin ; le genou suit son pied.
   ========================================================== */
function rot(q, phi, c){ var a = phi * Math.PI / 180, x = q[0] - c[0], z = q[2] - c[2], co = Math.cos(a), si = Math.sin(a); return [c[0] + x * co + z * si, q[1], c[2] - x * si + z * co]; }
function rotV(v, phi){ return rot(v, phi, [0, 0, 0]); }
HV.rot = rot;
HV.tour = function(base, A, etape, pas){
  var b = base, R = {}, e = Math.max(0, Math.min(4, etape)), centre = [b.bas[0], 0, b.bas[2]];
  var fH = [0.75, 0.55, 0.4, 0.35, 0.25][e], fD = [0, 0.32, 0.3, 0.3, 0.22][e], fB = [0, 0, 0.28, 0.3, 0.53][e];
  R.tete = b.tete + A * fH;
  R.dos = [b.dos[0], b.dos[1], b.dos[2] + A * fD];
  R.bang = [b.bang[0], b.bang[1], b.bang[2] + A * fB];
  var un = A > 0 ? 'D' : 'G', deux = un === 'D' ? 'G' : 'D', phi = A * 0.55;
  function pose(c, part){
    var p = rot(b['pied' + c], phi * part, centre);
    /* (le pied ne se lève pas : il pivote sur sa pointe, le talon à peine décollé — Romain, 16 h 39) */
    R['pied' + c] = p; R['lacet' + c] = (b['lacet' + c] || 0) + phi * part;
    R['genou' + c] = rotV(b['genou' + c], phi * part);
    if(part < 1) R['pointe' + c] = 12;
  }
  if(e === 3) pose(un, pas ? 0.5 : 1);
  if(e === 4){ pose(un, 1); pose(deux, pas ? 0.5 : 1); }
  return R;
};
/* un aller-retour du regard : elle se tourne de A degrés (la tête, les épaules, les hanches, un pas si c'est loin), reste « tenir »
   secondes, puis revient dans l'autre ordre (la tête d'abord, le pied en dernier) → des images clés, à partir de t0.
   o.sansPas : jamais de pas (accroupie) ; o.vite : la tête part d'un coup ; o.visage : son expression pendant qu'elle regarde
   (Romain, 16 h 39 : « un peu plus d'expression de visage […] toujours un peu pareil ») ; o.lent : plus lent (1,3 par défaut —
   Romain, 16 h 39 : « on prend beaucoup plus de temps entre les animations ») */
HV.regardeEtRevient = function(b, A, tenir, t0, o){
  o = o || {};
  var T = HV.tour, L = [], t = t0 || 0, pas = Math.abs(A) > 32 && !o.sansPas, k = o.lent || 1.3, V = o.visage || {};
  L.push([t += (o.vite ? 0.12 : 0.26 * k), T(b, A, 0)]);
  L.push([t += 0.28 * k, avec(T(b, A, 1), V)]);
  if(pas){ L.push([t += 0.26 * k, avec(T(b, A, 2), V)]); L.push([t += 0.2 * k, avec(T(b, A, 3, true), V)]); L.push([t += 0.18 * k, avec(T(b, A, 3), V)]); }
  else L.push([t += 0.3 * k, avec(T(b, A, 2), V)]);
  var fin = L[L.length - 1][1];
  L.push([t += tenir, fin]);
  var r1 = avec(fin, {tete:b.tete + (fin.tete - b.tete) * 0.2});
  L.push([t += 0.3 * k, r1]);
  var r2 = avec(r1, {dos:b.dos.slice(), bang:[b.bang[0], b.bang[1], b.bang[2] + (fin.bang[2] - b.bang[2]) * 0.35]});
  L.push([t += 0.28 * k, r2]);
  if(pas){
    var un = A > 0 ? 'D' : 'G', mi = {}, c = [b.bas[0], 0, b.bas[2]], p = rot(b['pied' + un], A * 0.55 * 0.5, c);
    mi['pied' + un] = p; mi['lacet' + un] = (b['lacet' + un] || 0) + A * 0.55 * 0.5; mi['pointe' + un] = 12; mi.bang = [b.bang[0], b.bang[1], b.bang[2] + (fin.bang[2] - b.bang[2]) * 0.15];
    L.push([t += 0.22 * k, avec(r2, mi)]);
  }
  L.push([t += 0.3 * k, {}]);
  return L;
};
/* deux gestes l'un après l'autre (sans revenir tout à fait entre les deux), avec une pause */
HV.puis = function(A, B, pause){
  var fin = A[A.length - 2][0] + (pause || 0);
  return A.slice(0, -1).concat(B.map(function(x){ return [x[0] + fin, x[1]]; }));
};

/* ==========================================================
   PRENDRE UNE FLÈCHE, L'ENCOCHER, BANDER (Romain, 15 h 54 : « quand on prend une flèche, on met la main en arrière, on attrape le
   bout de la flèche et on relève très haut la main pour que la flèche elle puisse sortir du carquois […] une fois que la flèche avec
   le bras levé est sortie, hop, on vient la placer dans l'arc et là on bande l'arc en arrière […] ça fait un grand mouvement […] le
   temps qu'il fait pour lancer une flèche dans le donjon, il faut le garder ») → des images clés.
   Les temps sont ceux du tir du donjon d'aujourd'hui (heros-anime.js, H.tirer : la main au carquois 0,33 s, la flèche encochée
   0,61 s, l'arc bandé 1,01 s, il tremble, il lâche à 1,38 s, en garde à 2,24 s).
   o.tourne : de combien elle se tourne pour viser (au donjon, sa cible est à droite : elle se met de profil, en deux pas) ;
   o.lache : elle tire (sinon : elle vise, relâche doucement la corde, et range la flèche dans le carquois) ; o.base : la pose de
   départ (pour les pas) ; o.vise : ce qui change pour viser (les jambes d'une pose à genou, par exemple).
   ========================================================== */
/* (la main, dans les mesures du buste : le carquois est sur SON épaule gauche, son haut vers [46, 98, -19]) */
/* (la main va chercher la flèche PAR-DESSUS l'épaule : le coude monte, la main redescend sur les encoches, au-dessus de l'ouverture
   du carquois — avant, l'avant-bras passait à travers le carquois : Romain, 17 h 44 : « le bras, quand il prend la flèche, il passe à
   moitié à travers le carquois ». La flèche tenue part du côté du pouce : le pouce est tourné vers le fond du carquois.) */
var Q_CHERCHE = {mainD:[46, 86, -24], relD:1, coudeD:[0.5, -1, 0.2], mdirD:[0.1, 0.2, -1], pouceD:[-0.36, 0.93, 0], poingD:0.2, flecheP:1, poingG:0.8};
var Q_TIENT = avec(Q_CHERCHE, {poingD:0.95, flecheD:1});
/* (puis le bras monte TRÈS haut, presque tendu, l'épaule monte avec lui (hv-corps.js), le poing au-dessus de la tête, la flèche qui
   pend dessous : elle sort du carquois — Romain, 16 h 39 et 17 h 44 : « qu'elle lève bien le bras très haut pour sortir la flèche du
   carquois ». Le poing est tourné le pouce en bas, pour que la flèche pende.) */
var Q_HAUT = {mainD:[30, 24, -2], relD:1, coudeD:[0.9, -0.2, 0.3], mdirD:[0, -0.2, 1], pouceD:[0, 1, 0], poingD:0.95, flecheD:1, flecheP:1, hoche:-6, brasDessus:1};
/* (au donjon, vue de dos : la main monte derrière sa tête, de notre côté) */
/* (mainSurTete : son bras passe devant sa tête et sa queue de cheval, même si la main est un peu derrière — sinon, de trois quarts
   dos, le bras levé disparaît derrière la queue de cheval) */
var Q_HAUT_DOS = avec(Q_HAUT, {mainSurTete:1, mainD:[24, 22, -26], coudeD:[0.9, -0.3, -0.2], mdirD:[0.1, -0.2, -1], pouceD:[-0.2, 1, 0]});
var VISE = {mainG:[-116, 151, 5], relG:1, coudeG:[0, 0.7, -0.6], pouceG:[0, -1, 0.1], arcAxe:[0, 1, 0], arcDir:[-1, 0, 0.04], poingG:0.75,
  tete:-84, brasDessus:1, sourcils:-0.8, plisse:0.5, sourire:-0.1, largeB:0.75};
var A_ARC = avec(VISE, {mainD:[-30, 148, 34], relD:1, coudeD:[1, 0.3, -0.3], mdirD:[-0.3, 0.1, 1], pouceD:[-1, 0, 0.1], poingD:0.95, flecheD:1, flecheP:1});
/* (la main qui encoche reste juste derrière le bras de l'arc, un peu plus bas : vue de dos, elle ne dépasse plus au-dessus de
   l'épaule — Romain, 17 h 44) */
var ENCOCHE = avec(VISE, {mainD:[-74, 160, 16], relD:1, coudeD:[1, -0.2, -0.4], mdirD:[0, 0, 0], pouceD:[-1, 0, 0.1], poingD:0.9, flecheD:0, tendu:0.05});
/* (la main qui tire la corde s'ancre sous la pommette : vue de dos, elle est cachée par la tête, plus rien ne dépasse à côté du cou) */
var BANDE = avec(VISE, {mainD:[16, 120, 14], relD:1, coudeD:[1, -0.35, -0.3], mdirD:[0, 0, 0], pouceD:[-1, 0, 0.1], poingD:0.8, tendu:1, sourcils:-0.9, plisse:0.6});
var LACHE = avec(VISE, {mainD:[36, 120, -12], relD:1, coudeD:[1, -0.35, -0.3], mdirD:[0, 0, 0], pouceD:[-1, 0, 0.1], poingD:0.05, tendu:0, mainG:[-114, 146, 4], plisse:0.25, ouvre:0.2});
HV.flecheSortie = function(o){
  o = o || {};
  var b = o.base || P.repos, A = o.tourne || 0, V = o.vise || {}, c = [b.bas[0], 0, b.bas[2]];
  /* (les pas pour se mettre de profil : d'abord les épaules, puis un pied, les hanches, l'autre pied) */
  function corps(part, pieds, sur){
    /* (les épaules partent devant les hanches ; quand les pieds ont fini leurs pas, tout le corps est tourné ; sur : elle se tourne
       un peu plus que pour viser, le temps de prendre la flèche — le dos vers nous, on voit la main au carquois) */
    var As = A * (sur || 1);
    var R = {dos:[b.dos[0], b.dos[1], b.dos[2] + As * 0.45 * part * (1 - pieds)], bang:[b.bang[0], b.bang[1], b.bang[2] + As * part * (0.55 + 0.45 * pieds)]};
    if(A && pieds > 0){
      var un = A > 0 ? 'D' : 'G', deux = un === 'D' ? 'G' : 'D';
      [[un, Math.min(1, pieds * 2)], [deux, Math.max(0, pieds * 2 - 1)]].forEach(function(x){
        var p = rot(b['pied' + x[0]], A * x[1], c), leve = x[1] > 0.05 && x[1] < 0.95;
        R['pied' + x[0]] = leve ? [p[0], p[1] - 8, p[2]] : p; R['genou' + x[0]] = rotV(b['genou' + x[0]], A * x[1]);
        R['lacet' + x[0]] = (b['lacet' + x[0]] || 0) + A * x[1] * 0.9;
        if(leve) R['pointe' + x[0]] = 25;
      });
    }
    return R;
  }
  var t = o.t0 || 0, L = [];
  function k(dt, pose){ L.push([t += dt, pose]); }
  /* (quand elle doit se tourner, elle se tourne d'abord : la main qui va au carquois est alors de notre côté, on la voit) */
  /* (au donjon, elle a presque fini de se tourner quand sa main arrive au carquois : son dos est vers nous, on voit la main prendre
     la flèche et monter au-dessus de sa tête — Romain, 16 h 39 : « le mouvement du bras qui se relève, il y est pas toujours ») */
  var c1 = A ? corps(0.95, 0.55, 1.15) : corps(0.3, 0), c2 = A ? corps(1, 0.85, 1.16) : corps(0.4, 0), c3 = A ? corps(1, 1, 1.1) : corps(0.7, 0.25), c4 = A ? corps(1, 1) : corps(0.9, 0.5);
  var QH = A ? Q_HAUT_DOS : Q_HAUT;
  /* (de dos, le bras qui va au carquois passe devant la queue de cheval et le carquois : on le voit monter, ce n'est pas un poing qui
     flotte à côté de la tête) */
  var sur = A ? {mainSurTete:1} : {};
  k(0.18, avec(avec(Q_CHERCHE, sur), avec(c1, {tete:b.tete + 10})));
  k(0.15, avec(avec(Q_TIENT, sur), c2));
  /* (le bras monte, et reste un instant tout en haut : on le voit bien) */
  /* (le buste se penche un peu de l'autre côté : l'épaule gauche monte encore) */
  var ch = {dos:[c3.dos[0], c3.dos[1] - 10, c3.dos[2]]};
  k(0.13, avec(avec(avec(QH, c3), ch), V));
  k(0.05, avec(avec(avec(QH, c3), ch), avec(V, {mainD:[QH.mainD[0], QH.mainD[1] - 3, QH.mainD[2]]})));
  k(0.10, avec(avec(A_ARC, c4), V));
  k(0.05, avec(avec(ENCOCHE, corps(1, 1)), V));
  k(0.35, avec(avec(BANDE, corps(1, 1)), V));
  var VB = avec(avec(BANDE, corps(1, 1)), V);
  if(o.lache !== false){
    k(0.31, avec(VB, {mainD:[15, 121, 14]}));
    k(0.06, avec(avec(LACHE, corps(1, 1)), V));
    k(0.12, avec(avec(LACHE, corps(1, 1)), avec(V, {mainD:[40, 124, -16], sourire:0.3})));
    k(0.32, avec(avec(LACHE, corps(1, 1)), avec(V, {mainD:[40, 126, -16], sourire:0.3, poingD:0.2})));
    if(A) k(0.22, avec(avec(LACHE, corps(0.6, 0.5)), {tete:b.tete - 30, brasDessus:0}));
    k(A ? 0.2 : 0.42, {});
  } else {
    /* elle ne tire pas : elle tient la visée, puis laisse revenir la corde, reprend la flèche et la range */
    k(1.2, VB);
    k(0.5, avec(ENCOCHE, avec(corps(1, 1), avec(V, {sourcils:0.1, plisse:0.1}))));
    k(0.15, avec(A_ARC, avec(corps(1, 1), avec(V, {mainD:[-70, 150, 14], flecheD:1, sourcils:0.1, plisse:0.1}))));
    /* (pour ranger la flèche, la main ne passe plus devant son visage — Romain, 17 h 44 : « des petits bugs quand elle fait sa
       flèche » : elle redescend devant sa poitrine, la flèche debout, pendant que l'arc s'abaisse ; puis elle remonte par SON côté
       gauche, au-dessus de l'épaule, et la flèche replonge dans le carquois) */
    k(0.35, avec(corps(0.6, 0.6), {mainD:[20, 200, 50], relD:1, coudeD:[0.6, 0.6, 0.5], mdirD:[0, -1, 0.1], pouceD:[0, -1, 0.2], poingD:0.95, flecheD:1, flecheP:0.4,
      mainG:[-80, 214, 30], relG:1, tete:b.tete + 6, hoche:6, brasDessus:0}));
    k(0.35, avec(corps(0.4, 0.3), {mainD:[56, 76, 6], relD:1, coudeD:[1, 0.2, 0.2], mdirD:[0, -0.2, 1], pouceD:[0, 1, 0], poingD:0.95, flecheD:1, flecheP:1,
      tete:b.tete + 16, hoche:-4, brasDessus:0}));
    k(0.3, avec(Q_TIENT, corps(0.3, 0)));
    k(0.15, avec(Q_CHERCHE, corps(0.3, 0)));
    k(0.55, {});
  }
  return L;
};

/* ==========================================================
   LES POSES DE BASE DES POSITIONS
   ========================================================== */
/* aux aguets, prête à bondir (Romain : « plus penchée, comme s'il était prêt à partir en courant ») : les pieds écartés, les
   genoux pliés, le poids en avant, les mains prêtes ; l'arc tenu bas sur le côté, le haut un peu vers l'avant (avant, il était
   presque à plat et passait dans les jambes : Romain, 15 h 54) */
P.posAguets = avec(P.repos, {bas:[0, 48, 6], bang:[24, 0, 0], dos:[24, 0, -6], piedG:[-36, 386, 12], piedD:[34, 386, -10], ouvG:0.5, ouvD:0.5,
  genouG:[-0.5, 0, 1], genouD:[0.5, 0, 1], pointeD:10,
  mainG:[-60, 236, 30], coudeG:[-0.8, 0.3, -0.5], arcAxe:[-0.12, 0.92, -0.38], arcDir:[-0.85, 0, 0.5], poingG:0.8,
  mainD:[44, 226, 40], coudeD:[0.8, 0.3, -0.5], mdirD:[-0.2, 0.2, 1], poingD:0.35, hoche:-12,
  sourire:-0.3, largeB:0.8, sourcils:-0.5, plisse:0.2});
/* accroupie : sur la pointe des pieds, les genoux bien ouverts, l'avant-bras droit sur le genou ; l'arc debout à côté de son genou
   droit, un bout au sol */
P.posAccroupi = avec(P.accroupie, {genouG:[-0.8, -0.2, 0.7], genouD:[0.8, -0.2, 0.7], ouvG:0.9, ouvD:0.9,
  mainG:[-64, 312, 60], coudeG:[-1, 0.3, -0.2], arcAxe:[-0.06, 1, 0.06], arcDir:[-0.3, 0, 1], poingG:0.85, pouceG:[0.2, -1, 0.2]});
/* un genou à terre, au repos (Romain, 15 h 54 : « il y a un problème de perspective avec sa jambe gauche ») : les jambes de face,
   comme à l'affût (SON genou gauche au sol, SON pied droit à plat devant) ; l'arc debout à SA droite, un bout au sol, la main
   dessus ; la main gauche posée sur le genou levé */
P.posGenou = avec(P.repos, {bas:[0, 86, -12], bang:[4, 0, 0], dos:[6, 0, 0], piedD:[15, 394, -72], pointeD:88, genouD:[0.1, 0.9, 1], piedG:[-27, 386, 46], genouG:[-0.3, -0.5, 1], ouvG:0.2,
  mainG:[-62, 296, 34], relG:0, coudeG:[-1, 0.3, -0.2], poingG:0.85, arcAxe:[-0.05, 1, 0.05], arcDir:[-0.4, 0, 1],
  mainD:[-6, 308, 42], relD:0, coudeD:[1, 0.2, -0.3], mdirD:[-1, 0.4, 0.3], poingD:0.25,
  sourire:0.2, sourcils:-0.1});
/* en garde : la dague au poing (la pose « En garde ») */
P.posGarde = avec(P.combat, {});

/* ==========================================================
   LES GESTES DES POSITIONS
   ========================================================== */
var T = HV.tour, b;
/* accroupie, penchée pour toucher le sol : la main droite passe entre les genoux ouverts (avant, la cuisse rentrait dans le corps :
   Romain, 15 h 54) */
/* (Romain, 16 h 39 : « quand elle touche le sol, il y a encore un petit bug avec la jambe » — penchée trop fort, sa cuisse gauche
   passait sous le buste et la botte semblait sortir de la manche. Maintenant elle se penche moins, les genoux bien ouverts, et la
   main descend entre ses pieds, devant elle.) */
var PENCHE = {bas:[0, 116, -16], bang:[32, 0, 0], dos:[36, 0, 0], hoche:24, regY:1, relD:0, mdirD:[0, 1, 0.5], poingD:0.1, mainG:[-72, 346, 74], relG:0,
  genouG:[-1, 0, 0.2], genouD:[1, 0, 0.2], ouvG:1.3, ouvD:1.3};
/* les grands coups de dague (Romain, 15 h 54 : « il faut vraiment que le bras il parte loin du corps comme pour attaquer et faire
   des grands mouvements droite-gauche […] et de haut vers le bas aussi […] comme s'il y avait quelqu'un devant elle et qu'elle
   frappait fort »). La dague est dans SA main gauche ; la lame sort du côté du pouce. */
var ARME_D = {coudeD:[0.9, 0.4, -0.3], poingD:1, dague:1};
function coup(main, pouce, plus2){ return avec(avec(ARME_D, {mainD:main, pouceD:pouce}), plus2 || {}); }
var FENTE = {bas:[0, 34, 18], piedG:[-30, 386, 44], genouG:[-0.4, -0.2, 1]};
/* (toute une pose tournée de A degrés autour du bassin, vers SA gauche si A > 0 : les pieds, les genoux, le bassin) */
function orienter(o, A){
  var R = avec(o, {}), c = [0, 0, 0], bg = o.bang || [0, 0, 0];
  ['G', 'D'].forEach(function(k){
    if(o['pied' + k]) R['pied' + k] = rot(o['pied' + k], A, c);
    if(o['genou' + k]) R['genou' + k] = rotV(o['genou' + k], A);
    R['lacet' + k] = (o['lacet' + k] || 0) + A;
  });
  if(o.bas) R.bas = rot(o.bas, A, c);
  R.bang = [bg[0], bg[1], bg[2] + A];
  return R;
}
HV.POSITIONS = {
  /* AU REPOS : debout, elle vit ; de temps en temps elle regarde à sa droite, à sa gauche (la tête, puis les épaules, les hanches,
     un petit pas), derrière elle, ou son arc */
  /* (les attentes entre deux gestes : à peu près deux fois plus longues — Romain, 16 h 39 : « faire durer un petit peu plus de temps
     entre les mouvements. C'est valable pour toutes les positions ») */
  repos:{titre:'Au repos', base:'repos', attente:[4.5, 8], gestes:{
    /* (à droite : curieuse ; à gauche : elle voit quelque chose qui lui plaît ; derrière : un bruit, elle s'inquiète) */
    /* (quand elle se tourne vers SA droite, la main de l'arc s'écarte un peu et l'arc penche vers l'extérieur : sinon il passait derrière
       son corps — Romain, 17 h 44 : « quand elle regarde derrière elle, là, l'arc il disparaît un petit peu ») */
    droite:HV.regardeEtRevient(P.repos, -50, 1.8, 0, {visage:{sourcils:0.3, sourcilsAsym:0.5, sourire:0.6, regX:-0.3, mainG:[-62, 238, 14], arcAxe:[-0.3, 1, 0.05]}}),
    gauche:HV.regardeEtRevient(P.repos, 50, 1.8, 0, {visage:{sourire:1.2, sourcils:0.35, plisse:0.25, rougit:0.25, regX:0.3}}),
    derriere:HV.regardeEtRevient(P.repos, -95, 1.5, 0, {visage:{sourcilsIn:0.6, sourcils:0.25, ouvre:0.12, sourire:-0.1, largeB:0.7, mainG:[-62, 238, 14], arcAxe:[-0.3, 1, 0.05]}}),
    /* (son arc : elle le lève devant elle et le tourne pour voir sa courbe, pince la corde du bout des doigts, contente) */
    arc:[[0.8, {mainG:[-46, 206, 36], arcAxe:[-0.15, 1, 0.15], arcDir:[-1, 0, 0.25], hoche:14, regY:0.6, regX:-0.5, tete:-14, sourcils:0.15}],
      [1.6, {mainG:[-44, 204, 38], arcAxe:[-0.1, 1, 0.1], arcDir:[-1, 0, 0.35], hoche:12, regY:0.5, regX:-0.6, tete:-16, sourcils:0.2, sourcilsAsym:0.4}],
      [2.2, {mainG:[-44, 204, 38], arcAxe:[-0.1, 1, 0.1], arcDir:[-1, 0, 0.35], mainD:[-18, 196, 34], relD:1, coudeD:[0.9, 0.2, -0.4], mdirD:[-1, 0, 0.3], poingD:0.5, indexD:1,
        hoche:12, regY:0.4, regX:-0.6, tete:-16, sourcilsAsym:0.4}],
      [2.5, {mainG:[-44, 204, 38], arcAxe:[-0.1, 1, 0.1], arcDir:[-1, 0, 0.35], mainD:[-12, 200, 30], relD:1, coudeD:[0.9, 0.2, -0.4], mdirD:[-1, 0, 0.3], poingD:0.5, indexD:1,
        hoche:12, regY:0.4, regX:-0.6, tete:-16, sourire:1.3, sourcils:0.3}],
      [3.4, {mainG:[-46, 206, 36], arcAxe:[-0.15, 1, 0.15], arcDir:[-1, 0, 0.25], hoche:8, regY:0.2, regX:-0.3, tete:-10, sourire:1.3, sourcils:0.3, rougit:0.3}], [4.3, {}]]
  }},
  /* AUX AGUETS : prête à bondir ; elle scrute ; d'un coup la tête part (elle a vu quelque chose), les épaules suivent, les mains se
     préparent, le poids part de ce côté… puis non, elle reste */
  aguets:{titre:'Aux aguets', base:'posAguets', attente:[3.5, 6.5], gestes:{
    scrute:HV.puis(HV.regardeEtRevient(P.posAguets, -45, 1.0, 0, {visage:{plisse:0.5, sourcils:-0.75, sourcilsIn:0.2}}),
      HV.regardeEtRevient(P.posAguets, 45, 1.0, 0, {visage:{plisse:0.35, sourcils:-0.5, sourcilsAsym:0.4, bouchex:0.4}}), 0.5),
    alerteD:(b = P.posAguets, [
      [0.12, avec(T(b, -55, 0), {sourcils:0.4, plisse:-0.3, ouvre:0.15})],
      [0.34, avec(T(b, -55, 1), {sourcils:0.3, plisse:-0.3, mainD:[40, 206, 52], mainG:[-56, 220, 44]})],
      [0.55, avec(T(b, -55, 2), {bas:[-10, 54, 8], sourcils:0.1, mainD:[36, 200, 56], mainG:[-62, 214, 46]})],
      [1.4, avec(T(b, -55, 2), {bas:[-10, 54, 8], sourcils:-0.6, mainD:[36, 200, 56], mainG:[-62, 214, 46]})],
      [1.8, avec(T(b, -40, 1), {bas:[-4, 50, 6], sourcils:-0.5})],
      [2.2, avec(T(b, -20, 0), {sourcils:-0.5})], [2.7, {}]]),
    alerteG:(b = P.posAguets, [
      [0.12, avec(T(b, 55, 0), {sourcils:0.4, plisse:-0.3, ouvre:0.15})],
      [0.34, avec(T(b, 55, 1), {sourcils:0.3, plisse:-0.3, mainD:[46, 206, 52], mainG:[-50, 220, 44]})],
      [0.55, avec(T(b, 55, 2), {bas:[10, 54, 8], sourcils:0.1, mainD:[50, 200, 54], mainG:[-46, 214, 46]})],
      [1.4, avec(T(b, 55, 2), {bas:[10, 54, 8], sourcils:-0.6, mainD:[50, 200, 54], mainG:[-46, 214, 46]})],
      [1.8, avec(T(b, 40, 1), {bas:[4, 50, 6], sourcils:-0.5})],
      [2.2, avec(T(b, 20, 0), {sourcils:-0.5})], [2.7, {}]])
  }},
  /* ACCROUPI : elle s'accroupit et y reste ; elle regarde autour d'elle, pose la main au sol, lit une trace, enlève une poussière,
     se tourne pour regarder derrière elle (le haut du corps tourne, les pieds restent), bouge son arc, tire sur son baudrier */
  accroupi:{titre:'Accroupi', base:'posAccroupi', attente:[4.5, 8], gestes:{
    regarde:HV.puis(HV.regardeEtRevient(P.posAccroupi, -45, 1.3, 0, {sansPas:true, visage:{plisse:0.35, sourcils:-0.4}}),
      HV.regardeEtRevient(P.posAccroupi, 45, 1.3, 0, {sansPas:true, visage:{sourcils:0.2, sourcilsAsym:-0.4, ouvre:0.1}}), 0.6),
    /* (la main au sol : elle tâte la terre, la regarde, réfléchit — sans se presser) */
    sol:[[0.8, avec(PENCHE, {hoche:20, mainD:[8, 372, 62], poingD:0.1, sourcils:-0.2})], [1.4, avec(PENCHE, {mainD:[8, 384, 60], sourcils:-0.35, plisse:0.25})],
      [2.6, avec(PENCHE, {mainD:[8, 384, 60], sourcils:-0.4, plisse:0.3, sourire:-0.1})],
      [3.3, avec(PENCHE, {mainD:[8, 384, 60], tete:-24, regY:0.4, sourcils:0.1, sourcilsAsym:0.5, bouchex:0.4})],
      [4.3, avec(PENCHE, {mainD:[8, 384, 60], tete:-24, regY:0.4, sourcils:0.1, sourcilsAsym:0.5, bouchex:0.4})], [5.1, {}]],
    trace:[[0.9, avec(PENCHE, {mainD:[8, 384, 62], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65})],
      [1.8, avec(PENCHE, {mainD:[-4, 384, 64], indexD:1, poingD:0.2, sourcils:-0.5, largeB:0.65, plisse:0.3})],
      [2.7, avec(PENCHE, {mainD:[10, 384, 58], indexD:1, poingD:0.2, sourcils:-0.45, largeB:0.65, plisse:0.3})],
      [3.4, avec(PENCHE, {mainD:[10, 384, 58], indexD:1, poingD:0.2, hoche:14, regY:0.1, sourcils:0.4, ouvre:0.25, sourire:0.4})],
      [4.2, avec(PENCHE, {mainD:[10, 384, 58], indexD:1, poingD:0.2, hoche:12, regY:0, regX:0.4, sourcils:0.2, sourire:0.7})], [5.0, {}]],
    /* (une poussière sur son genou : agacée, elle la chasse d'une pichenette, puis vérifie) */
    /* (la poussière est sur le dessus de SON genou gauche : la main passe dessus, bien au-dessus du genou — avant, elle frottait entre
       les cuisses et passait tantôt devant, tantôt derrière : Romain, 17 h 44 : « la main elle bug, elle passe devant derrière ») */
    poussiere:(b = {relD:0, mdirD:[-0.3, 0.5, 1], pouceD:[-1, 0, 0.2], poingD:0.1, hoche:14, regY:0.6, regX:0.4, tete:10, sourire:-0.3, sourcilsIn:0.3, bouchex:-0.4},
      [[0.7, avec(b, {mainD:[58, 314, 50]})],
      [0.95, avec(b, {mainD:[74, 316, 44]})],
      [1.2, avec(b, {mainD:[58, 314, 50]})],
      [1.45, avec(b, {mainD:[74, 316, 44], sourire:-0.2})],
      [2.3, avec(b, {mainD:[64, 308, 50], poingD:0.3, hoche:12, regY:0.5, regX:0.3, sourire:0.6, sourcils:0.2, sourcilsIn:0, bouchex:0})], [3.0, {}]]),
    derriere:HV.regardeEtRevient(P.posAccroupi, -85, 1.6, 0, {sansPas:true, visage:{sourcils:0.35, sourcilsIn:0.4, ouvre:0.15, largeB:0.7}}),
    arc:[[0.9, {mainG:[-70, 300, 72], arcAxe:[-0.4, 0.85, 0.3], hoche:10, regX:-0.5, regY:0.3, tete:-10, sourcils:0.15}],
      [1.9, {mainG:[-66, 304, 70], arcAxe:[0.05, 0.9, 0.4], hoche:10, regX:-0.5, regY:0.3, tete:-10, sourcilsAsym:0.4, sourire:0.5}],
      [2.6, {mainG:[-66, 304, 70], arcAxe:[0.05, 0.9, 0.4], hoche:8, regX:-0.4, regY:0.2, tete:-8, sourire:0.9}], [3.4, {}]],
    /* (elle remonte son baudrier : un petit effort, les lèvres pincées) */
    baudrier:[[0.8, {mainD:[-8, 172, 30], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5, largeB:0.5, sourire:-0.2}],
      [1.2, {mainD:[-8, 182, 32], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:8, regY:0.5, largeB:0.4, sourire:-0.3, plisse:0.3, pen:-4}],
      [1.6, {mainD:[-8, 172, 30], relD:1, mdirD:[-0.3, -1, 0.2], poingD:0.8, hoche:6, regY:0.4, sourire:0.5, sourcils:0.2}], [2.4, {}]]
  }},
  /* UN GENOU À TERRE : au repos ; elle sort une flèche (la main derrière l'épaule, le bras levé haut, la flèche sur l'arc), bande l'arc,
     ne tire pas, relâche, range la flèche ; elle met son arc à l'horizontale et l'inspecte, le nettoie ; la main en visière */
  genou:{titre:'Un genou à terre', base:'posGenou', attente:[4.5, 8], gestes:{
    fleche:HV.flecheSortie({base:P.posGenou, lache:false, vise:{bang:[0, 0, 0], dos:[0, 0, 0]}}),
    /* (elle inspecte son arc : tenu à l'horizontale, plus haut et plus loin devant elle qu'avant — il passait derrière son genou levé :
       Romain, 16 h 39 : « il y a un petit bug là quand elle inspecte son arc avec le genou » ; la main gauche glisse sur le bois, le
       nettoie ; elle fronce les sourcils, souffle dessus, puis sourit, contente) */
    inspecte:(b = {mainG:[-24, 178, 80], relG:1, coudeG:[-0.8, 0.5, -0.4], arcAxe:[1, 0.02, 0.1], arcDir:[0, -1, 0.15], pouceG:[0, -1, 0.3], relD:1, coudeD:[0.8, 0.5, -0.4], mdirD:[1, 0, 0.1], poingD:0.2, hoche:14, regY:0.7},
      [[1.0, avec(b, {mainD:[18, 176, 84], sourcils:-0.2})],
      [1.8, avec(b, {mainD:[54, 174, 84], regX:0.5, sourcils:-0.4, plisse:0.3})],
      [2.5, avec(b, {mainD:[20, 176, 84], sourcils:-0.4, plisse:0.3, sourcilsIn:0.3})],
      [3.2, avec(b, {mainD:[56, 174, 84], regX:0.5, sourcils:-0.45, plisse:0.35, sourcilsIn:0.3})],
      /* (elle souffle sur le bois) */
      [3.6, avec(b, {mainD:[40, 180, 78], hoche:18, sourcils:0, ouvre:0.35, largeB:0.4, sourire:-0.2})],
      [4.1, avec(b, {mainD:[40, 180, 78], hoche:18, sourcils:0, ouvre:0.35, largeB:0.4, sourire:-0.2})],
      [4.8, avec(b, {mainD:[30, 316, 26], relD:0, hoche:10, regY:0.5, sourire:1.1, sourcils:0.3, rougit:0.2})], [5.8, {}]]),
    /* (la main en visière : à plat au-dessus des yeux, elle suit la tête — P.visiere, hv-corps.js ; elle scrute loin à droite, puis à
       gauche, lentement ; seuls la tête et un peu les épaules tournent) */
    visiere:(b = {visiere:1, poingD:0, brasDessus:1, plisse:0.6, sourire:-0.1, largeB:0.8, sourcils:-0.35, hoche:-4},
      [[0.8, avec(b, {tete:-8})], [1.7, avec(b, {tete:-38, dos:[6, 0, -8], regX:-0.4})], [3.2, avec(b, {tete:-40, dos:[6, 0, -8], regX:-0.5, sourcilsIn:0.3})],
        [4.2, avec(b, {tete:30, dos:[6, 0, 7], regX:0.4})], [5.6, avec(b, {tete:33, dos:[6, 0, 7], regX:0.5, plisse:0.7, sourcils:-0.5})],
        [6.3, avec(b, {tete:0, sourcils:0.1, plisse:0.3, sourire:0.2})], [7.0, {visiere:0.3, sourire:0.3}], [7.5, {}]])
  }},
  /* EN GARDE : la plupart du temps elle attend ; de temps en temps, une attaque : un grand revers de droite à gauche, un coup de
     gauche à droite, un coup de haut en bas, le bras loin du corps, un pas en avant ; une esquive ; elle range sa dague, se redresse,
     la ressort */
  garde:{titre:'En garde', base:'posGarde', attente:[4.5, 8], gestes:{
    coups:[
      /* l'élan : le bras part en travers, haut, de l'autre côté ; le corps se tord */
      [0.28, coup([-36, 150, 30], [0, -0.4, 1], {dos:[10, 0, -40], bang:[4, 0, -14], bas:[0, 28, -6], sourcils:-1, ouvre:0.1})],
      /* le revers : le bras fend l'air, tendu, devant elle, jusqu'à son côté gauche ; un pas en avant */
      [0.4, coup([20, 158, 96], [0, -0.3, 1], avec(FENTE, {dos:[14, 0, 0], bang:[8, 0, 2], ouvre:0.55}))],
      [0.5, coup([88, 172, 46], [0, -0.3, 1], avec(FENTE, {dos:[14, 0, 28], bang:[8, 0, 10], ouvre:0.5}))],
      /* le coup retour, de gauche à droite */
      [0.72, coup([92, 140, 30], [0, -0.5, 0.9], avec(FENTE, {dos:[12, 0, 30], bang:[8, 0, 10], ouvre:0.1}))],
      [0.84, coup([10, 150, 98], [0, -0.4, 1], avec(FENTE, {dos:[16, 0, 0], bang:[10, 0, 0], ouvre:0.55}))],
      [0.94, coup([-38, 176, 52], [0, -0.4, 1], avec(FENTE, {dos:[16, 0, -30], bang:[10, 0, -10], ouvre:0.5}))],
      /* le coup de haut en bas : la dague au-dessus de la tête, puis elle l'abat devant elle */
      [1.24, coup([34, 56, 16], [0, -1, 0.2], avec(FENTE, {dos:[-6, 0, 6], bang:[0, 0, 0], bas:[0, 26, 14], hoche:-8, ouvre:0.15, brasDessus:1}))],
      [1.38, coup([18, 240, 90], [0, 0.2, 1], avec(FENTE, {dos:[26, 0, 4], bang:[14, 0, 0], bas:[0, 40, 20], hoche:8, ouvre:0.7}))],
      [1.62, coup([20, 236, 86], [0, 0.2, 1], avec(FENTE, {dos:[24, 0, 4], bang:[12, 0, 0], bas:[0, 40, 20], hoche:6, ouvre:0.2}))],
      [2.3, {}]],
    /* LA FENTE (Romain, 16 h 39 : « essayer d'en faire un autre encore plus loin, comme si vraiment elle essayait d'attaquer quelqu'un
       plus loin ») : elle se ramasse, la dague en arrière ; puis un très grand pas en avant du pied gauche, la jambe de derrière
       tendue, le corps penché, le bras tendu au bout, l'épaule gauche devant ; elle crie ; elle tient, puis revient en garde. */
    /* (la fente part un peu sur SA gauche : vue de trois quarts, on la voit mieux s'allonger) */
    fente:[[0.4, coup([44, 204, -22], [0, -0.3, 1], {bas:[-4, 40, -14], bang:[4, 0, 10], dos:[6, 0, 14], piedD:[30, 386, -26], sourcils:-1, plisse:0.5, sourire:-0.4, largeB:0.6})],
      [0.62, orienter(coup([18, 150, 90], [0, -0.3, 1], {bas:[8, 62, 48], bang:[18, 0, -18], dos:[12, 0, -14], hoche:-10, piedD:[26, 386, 124], genouD:[0.2, -0.1, 1], pointeD:-10,
        piedG:[-30, 386, -44], pointeG:40, genouG:[-0.3, 0.2, 1], mainG:[-74, 196, -46], relG:1, coudeG:[-1, 0.3, 0.2], sourcils:-1, ouvre:0.7, plisse:0.3}), 36)],
      [1.0, orienter(coup([16, 152, 92], [0, -0.3, 1], {bas:[8, 64, 50], bang:[18, 0, -18], dos:[12, 0, -14], hoche:-10, piedD:[26, 386, 124], genouD:[0.2, -0.1, 1], pointeD:-10,
        piedG:[-30, 386, -44], pointeG:40, genouG:[-0.3, 0.2, 1], mainG:[-74, 196, -46], relG:1, coudeG:[-1, 0.3, 0.2], sourcils:-0.9, ouvre:0.3, plisse:0.4}), 36)],
      /* (elle se repousse sur le pied de devant et revient) */
      [1.5, orienter(coup([38, 196, 40], [0, -0.3, 1], {bas:[2, 40, 18], bang:[8, 0, -6], dos:[8, 0, -4], piedD:[28, 386, 40], pointeD:20, sourcils:-0.7, ouvre:0.1}), 16)],
      [2.2, {}]],
    esquive:[[0.3, {bas:[-20, 32, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-54, 386, 6], genouG:[-0.5, 0, 1], piedD:[12, 386, -10], mainG:[-76, 206, 10], mainD:[56, 178, 30], sourcils:0.7, sourcilsIn:0.6, ouvre:0.4, tete:18}],
      [0.8, {bas:[-20, 32, -8], bang:[-6, -12, 0], dos:[-8, -14, 0], piedG:[-54, 386, 6], genouG:[-0.5, 0, 1], piedD:[12, 386, -10], mainG:[-76, 206, 10], mainD:[56, 178, 30], sourcils:0.7, sourcilsIn:0.6, ouvre:0.4, tete:18}],
      [1.1, {bas:[18, 30, -6], bang:[-4, 10, 0], dos:[-6, 12, 0], piedD:[52, 386, -14], genouD:[0.5, 0, 1], piedG:[-12, 386, 10], mainD:[60, 182, 40], sourcils:0.5, tete:-14}],
      [1.5, {bas:[18, 30, -6], bang:[-4, 10, 0], dos:[-6, 12, 0], piedD:[52, 386, -14], genouD:[0.5, 0, 1], piedG:[-12, 386, 10], mainD:[60, 182, 40], sourcils:0.5, tete:-14}], [2.1, {}]],
    range:[[0.6, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], hoche:10, regY:0.6}], [0.8, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:0, hoche:10, regY:0.6}],
      [1.6, {bas:[0, 6, 0], bang:[0, 0, 0], dos:[4, 0, -6], mainD:[48, 240, 4], coudeD:[0.7, -0.1, -0.7], mdirD:[0, 0, 0], poingD:0.3, dague:0, sourcils:0, sourire:0.3, largeB:1, plisse:0}],
      [3.2, {bas:[0, 6, 0], bang:[0, 0, 0], dos:[4, 0, -6], mainD:[48, 240, 4], coudeD:[0.7, -0.1, -0.7], mdirD:[0, 0, 0], poingD:0.3, dague:0, sourcils:0, sourire:0.3, largeB:1, plisse:0, tete:20}],
      [3.7, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:0, hoche:6}], [3.85, {mainD:[34, 238, 12], coudeD:[0.9, 0.2, -0.5], mdirD:[0, 1, 0], dague:1, hoche:6}],
      [4.3, {}]]
  }}
};
HV.LISTE_POSITIONS = ['repos', 'aguets', 'accroupi', 'genou', 'garde'];
HV.NOMS_GESTES = {droite:'À droite', gauche:'À gauche', derriere:'Derrière elle', arc:'Son arc', scrute:'Elle scrute', alerteD:'Alerte !', alerteG:'Alerte, à gauche !',
  regarde:'Elle regarde', sol:'Main au sol', trace:'Elle lit une trace', poussiere:'Une poussière', baudrier:'Son baudrier',
  fleche:'Une flèche', inspecte:'Elle inspecte son arc', visiere:'La main en visière', coups:'Elle attaque', fente:'Elle attaque loin', esquive:'Esquive', range:'Range sa dague'};

/* ---------- Jouer : où elle en est à l'instant t (appelé par le pantin à chaque image) ---------- */
function attente(Po){ return Po.attente[0] + Math.random() * (Po.attente[1] - Po.attente[0]); }
function choisir(Po, dernier){ var n = Object.keys(Po.gestes).filter(function(g){ return g !== dernier; }); return n[Math.floor(Math.random() * n.length)]; }
HV.positionImage = function(p, base, t){
  var Po = HV.POSITIONS[p.posi];
  if(!Po) return base;
  if(!p.gest){
    if(p.prochain == null) p.prochain = t + attente(Po) * 0.6;
    var force = p.gestForce && Po.gestes[p.gestForce] ? p.gestForce : null;
    /* (p.sansHasard : elle ne fait que les gestes qu'on lui demande — les films) */
    if(force || (t >= p.prochain && !p.sansHasard)){ var nom = force || choisir(Po, p.dernier); p.gestForce = null; p.gest = {nom:nom, t0:t}; p.dernier = nom; }
  }
  if(p.gest){
    var Gst = Po.gestes[p.gest.nom], u = t - p.gest.t0;
    if(u >= Gst[Gst.length - 1][0]){ p.gest = null; p.prochain = t + attente(Po); return base; }
    return HV.gesteImage(base, Gst, u);
  }
  return base;
};
})(window);
