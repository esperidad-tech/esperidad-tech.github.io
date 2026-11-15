/* films.js — LES CINÉMATIQUES (Bible §13.45). Chacune : sa durée, ses plans (la caméra), les poses de Léo (clés + respiration),
   ses effets, ses sons (des repères pour le jeu : la vidéo est muette, le jeu joue les sons de l'Atelier à l'instant dit) et
   ses sous-titres (chacun avec son 🔊 dans le jeu).
   Romain (15 novembre, 12 h 40) : « des cinématiques de film », en 21:9 avec les bandes noires ; la caméra à la place des héros,
   face à Léo, le fond flou ; des mouvements « très humains, réalistes » ; des éclairages sympas ; pas trop longues. */
(function(){
'use strict';
var U = window.CU, FX = window.CFX, AC = window.Accessoires;
function PT_piece(m, svg){ return Pantin.piece(m, svg); }

/* ---------------------------------------------------------------- outils communs */
/* une caméra par plans : [[t début, [[t, {cam}, courbe], …]], …] ; on coupe d'un plan à l'autre (pas de glissement) */
function plans(liste){
  var P = liste.map(function(p){ return {t:p[0], piste:U.piste(p[1])}; });
  return function(t){ var c = P[0]; P.forEach(function(p){ if(t >= p.t) c = p; }); return c.piste(t); };
}
/* les secousses : [[t, force, durée], …] */
function secousses(liste, t){ var s = 0; liste.forEach(function(q){ s += Math.abs(U.secousse(t, q[0], 1, q[2], 40)) > 0 ? q[1] * Math.pow(1 - (t - q[0]) / q[2], 2) : 0; }); return s; }
function fondu(t, debut, fin, total){
  if(t < debut) return {k:1 - t / debut};
  if(t > total - fin) return {k:(t - (total - fin)) / fin};
  return null;
}

/* ---------------------------------------------------------------- LÉO : les poses de base */
var V0 = {sourcils:{f:.9, l:0, t:0}, yeux:{o:1, lx:0, ly:0, cl:0}, bouche:{o:0, w:0, c:-.3, d:0, cri:0}, nez:0, veines:0, sueur:0, rouge:0, tSueur:0};
var BASE = {w:[0, -270], r:0, t:0, tk:1, souffle:0, fl:0, balance:0,
  tete:{r:0, k:0, ht:0, x:0, y:0},
  bD:{a:14, c:-18, l1:1, l2:1, ik:0, cible:[90, -260], devant:false, fl:1}, bG:{a:14, c:-18, l1:1, l2:1, ik:0, cible:[-90, -260], devant:false, fl:1},
  jD:{p:[64, 0], g:0}, jG:{p:[-64, 0], g:0}, poingD:'poing', poingG:'poing', v:V0};

/* la respiration (il souffle fort) et les petits tremblements, par-dessus les clés */
function respire(p, t, force, freq, graine){
  var ph = Math.sin(t * Math.PI * 2 * (freq || .8));
  p.souffle = U.clamp((p.souffle || 0) + force * (.5 + .5 * ph), 0, 1.4);
  p.w = [p.w[0] + U.fbm(t * .7, graine || 1, 2) * 2 * force, p.w[1] - force * 3 * (.5 + .5 * ph)];
  p.tete = Object.assign({}, p.tete, {k:(p.tete.k || 0) - force * 2 * ph, r:(p.tete.r || 0) + U.fbm(t * .5, (graine || 1) + 4, 2) * 2});
  return p;
}
function tremble(p, t, k){
  if(!(k > 0)) return p;
  ['bD', 'bG'].forEach(function(b, i){ p[b] = Object.assign({}, p[b], {a:p[b].a + U.bruit(t * 23 + i * 5, 11 + i) * 2.4 * k, c:p[b].c + U.bruit(t * 19 + i * 3, 21 + i) * 3 * k}); });
  p.tete = Object.assign({}, p.tete, {r:p.tete.r + U.bruit(t * 27, 31) * 2.4 * k});
  p.w = [p.w[0] + U.bruit(t * 30, 41) * 1.6 * k, p.w[1]];
  return p;
}
/* les yeux qui clignent de temps en temps (jamais au même rythme) */
function cligne(t, debut){ var per = 3.1, x = ((t + (debut || 0)) % per) / per; return x > .96 ? Math.sin((x - .96) / .04 * Math.PI) : 0; }
function copie(p){ return JSON.parse(JSON.stringify(p)); }

/* il parle : la bouche s'ouvre et se ferme par syllabes (environ cinq par seconde), avec de petites pauses entre les mots */
function parle(t, t0, t1, graine){
  if(t < t0 || t > t1) return null;
  var a = t - t0, env = U.clamp(a * 6, 0, 1) * U.clamp((t1 - t) * 5, 0, 1);
  var syl = Math.abs(Math.sin(a * Math.PI * 5.2 * (1 + .12 * U.bruit(a * 1.3, graine || 1))));
  var pause = U.fbm(a * 1.6, (graine || 1) + 7, 2) < -.32 ? .15 : 1;
  return {o:(.06 + .42 * Math.pow(syl, .8)) * env * pause, w:.15 * U.bruit(a * 3.1, (graine || 1) + 3)};
}
function bouchePar(p, t, lignes){
  lignes.forEach(function(l, i){ var b = parle(t, l[0], l[1], i + 1); if(b){ p.v.bouche.o = Math.max(p.v.bouche.o * .3, b.o) * (l[2] || 1); p.v.bouche.w = (p.v.bouche.w || 0) + b.w; } });
  return p;
}
/* un point de Léo (repère du personnage) → l'écran */
function versEcran(pt, x, z){ var pr = CAM.projeter(x || 0, 0, z || 0); return [pr.x + pt[0] * pr.s, pr.y + pt[1] * pr.s, pr.s]; }

/* ======================================================================================================== */
/* FILM 1 — FIN DE LA PHASE 1 : il tombe à genoux dans sa cape noire, se relève, arrache sa cape : c'est Léo. Il hurle, il bande
   ses muscles. (Romain : « il tombe à terre en cape noire. Et là, d'un coup, il retire sa cape. Et il est énervé, il crie, il bande
   ses muscles. ») Environ 13,6 secondes. */
(function(){
var T = 13.6, RIP = 5.5, LACHE = 5.74;
var poseA = U.poses(BASE, [
  [0, {w:[0, -288], t:-3, tete:{k:-4}, bD:{a:20, c:-30}, bG:{a:18, c:-26}, poingD:'ouvert', poingG:'ouvert'}],
  [.35, {w:[14, -292], r:3, t:7, tete:{r:9, k:-6}, bD:{a:34, c:-40}, bG:{a:26, c:-30}}, 'o'],
  [.75, {w:[6, -248], r:-2, t:-4, tk:.95, tete:{r:-4, k:6}, bD:{a:22, c:-20}, bG:{a:24, c:-24}, jD:{p:[70, 0]}, jG:{p:[-60, 0]}}, 'io'],
  [1.15, {w:[0, -188], t:2, tk:.9, tete:{r:0, k:12}, jD:{p:[58, -8], g:.6}, jG:{p:[-56, -8], g:.6}, bD:{a:16, c:-10}, bG:{a:16, c:-10}}, 'i2'],
  [1.4, {w:[0, -150], tk:.86, tete:{k:16, y:4}, jD:{p:[58, -8], g:1}, jG:{p:[-56, -8], g:1}, poingG:'poing'}, 'choc'],
  [1.6, {w:[0, -144], tk:.84}, 'o'],
  [2.1, {w:[6, -142], t:4, r:2, bD:{ik:1, cible:[112, -60], a:30, c:0}, poingD:'ouvert'}, 'io'],
  [2.9, {bG:{ik:1, cible:[-78, -100]}, tete:{k:18}}, 'io'],
  [3.35, {poingD:'poing', tete:{k:6}}, 'io'],
  [3.85, {tete:{k:-2}}, 'io'],
  [4.35, {w:[6, -196], tk:.9, t:2, jD:{p:[74, 0], g:0}, bD:{ik:.6, cible:[100, -150]}}, 'io'],
  [4.95, {w:[0, -268], tk:1, t:0, r:0, jG:{p:[-64, 0], g:0}, bD:{ik:0, a:16, c:-20}, bG:{ik:0, a:16, c:-20}, tete:{k:-3, y:0}}, 'io'],
  [5.0, {bD:{devant:true}}],
  [5.38, {bD:{ik:1, cible:[24, -436]}, tete:{k:2}}, 'io'],
  [5.5, {bD:{cible:[30, -440]}, t:-2}, 'io'],
  [5.72, {bD:{cible:[300, -630]}, t:6, r:3, bG:{a:32, c:-30}, tete:{r:-6, k:-2}}, 'o'],
  [6.3, {bD:{ik:0, a:30, c:-30}, t:0, r:0, bG:{a:18, c:-22}, tete:{r:0, k:4}}, 'io'],
  [6.45, {bD:{devant:false}}],
  [6.5, {v:{sourcils:{f:1}, bouche:{c:-.5}, nez:.3}, tete:{k:2}}],
  [7.0, {tete:{k:-6}, souffle:1, v:{yeux:{o:.9}}}, 'io'],
  [7.2, {tete:{k:-10}, v:{bouche:{o:1, cri:1, w:.4, d:.5}, yeux:{o:1.2}, sourcils:{f:1}, nez:.8, veines:1, rouge:.6}}, 'o'],
  [8.4, {v:{bouche:{o:.85}}}, 'l'],
  [8.75, {tete:{k:0}, souffle:.4, v:{bouche:{o:.12, cri:0, d:.25, w:0}, yeux:{o:1}, veines:.5}}, 'io'],
  [8.9, {w:[0, -258], tk:.95, souffle:.2, bD:{a:26, c:34}, bG:{a:26, c:34}, tete:{k:5}}],
  [9.45, {w:[0, -256], bD:{a:30, c:46}, bG:{a:30, c:46}}, 'io'],
  [10.05, {w:[0, -270], tk:1, souffle:1, fl:1, bD:{a:94, c:100}, bG:{a:94, c:100}, tete:{k:-4}, v:{bouche:{o:.3, d:1, cri:.3}, veines:1}}, 'dep'],
  [11.2, {fl:1}, 'l'],
  [11.5, {w:[0, -262], tk:.96, souffle:1.3, bD:{ik:1, cible:[74, -272], devant:false}, bG:{ik:1, cible:[-74, -272], devant:false}, tete:{k:4}, v:{bouche:{o:.95, cri:1, d:.6, w:.4}}}, 'o'],
  [12.2, {fl:1}, 'l'],
  [12.8, {w:[0, -262], tk:.98, fl:.35, bD:{ik:1, cible:[54, -436], devant:true}, bG:{ik:1, cible:[-50, -420], devant:true}, tete:{k:3}, v:{bouche:{o:0, cri:0, d:.45, w:0, c:-.4}, veines:.4}}, 'io']
]);
function pose(t){
  var p = copie(poseA(t));
  if(t > 1.5 && t < 4.4) respire(p, t, U.clamp((t - 1.5) * 1.4, 0, 1) * .9, .75, 2);
  if(t > 5.8 && t < 7.0) respire(p, t, .7, .9, 3);
  if(t > 8.7) respire(p, t, .45, .7, 4);
  if(t > 7.2 && t < 8.6) tremble(p, t, .8);
  if(t > 10.05 && t < 11.0) tremble(p, t, 1.1);
  if(t > 11.45 && t < 12.3) tremble(p, t, 1.3);
  p.v.yeux.cl = cligne(t, .7);
  return p;
}
/* la cape arrachée : un tissu qui vole */
var cape = null;
function laCape(){
  if(cape) return cape;
  cape = new window.Tissu({nx:12, ny:14, t0:RIP, haut:[[-112, -442], [112, -442]], bas:[[-190, -14], [190, -14]], g:1500, sol:0,
    tenir:function(t){ if(t > LACHE) return null; var os = Pantin.os(LeoFace.D, pose(t)); var m = LeoFace.point(os, 'mainD'); return [m[0], m[1] + 10]; },
    vent:function(t){ var a = t - LACHE; return a < 0 ? [0, 0] : a < .35 ? [2600, -2600] : [1400, -400]; }});
  return cape;
}
var yeux = U.piste([[0, .9], [3.2, 1], [3.85, 1.7, 'o'], [5.5, 1.5]]);
var camera = plans([
  [0, [[0, {x:-10, y:-330, z:1650, focus:1650}], [1.6, {x:0, y:-250, z:1420, focus:1420}, 'io'], [3.4, {x:20, y:-200, z:1150, focus:1150}, 'io'], [5.0, {x:10, y:-330, z:1250, focus:1250}, 'io'], [6.5, {x:0, y:-350, z:1180, focus:1180}, 'io']]],
  [6.5, [[6.5, {x:0, y:-500, z:560, focus:560, ouverture:1.1}], [8.9, {x:0, y:-496, z:470, focus:470, ouverture:1.1}, 'l']]],
  [8.9, [[8.9, {x:0, y:-150, z:2050, focus:2050, tangage:.09}], [11.2, {x:0, y:-170, z:1850, focus:1850, tangage:.085}, 'io']]],
  [11.2, [[11.2, {x:-30, y:-330, z:1050, focus:1050, tangage:.04}], [13.6, {x:0, y:-360, z:900, focus:900, tangage:.03}, 'io']]]
]);
var SEC = [[1.4, 11, .55], [5.55, 7, .4], [7.2, 5, 1.4], [10.05, 12, .7], [11.5, 9, .6]];
CINE.films.a12 = {
  nom:'Fin de la phase 1', duree:T,
  sons:[[.62, 'cineOutils'], [.78, 'cineOutils'], [1.38, 'leoChute'], [1.45, 'cineOutils'], [1.9, 'cineSouffle'], [3.4, 'cineGrogne'], [4.3, 'cinePas'],
    [5.48, 'leoDechire'], [5.6, 'cineCape'], [7.15, 'leoHurlement'], [9.95, 'leoMuscles'], [10.05, 'cineOnde'], [11.45, 'cineGrogne'], [11.5, 'cineOnde']],
  sousTitres:[],
  etat:function(t){
    var p = pose(t), habit = t < RIP + .02 ? 'cape' : null;
    var flash = t > RIP && t < RIP + .3 ? (1 - (t - RIP) / .3) * .55 : 0;
    return {
      cam:camera(t), tremble:secousses(SEC, t), flare:(t > 7.2 && t < 8.6 ? 1.25 + .2 * U.bruit(t * 14, 3) : 1) + (t > 10.05 && t < 10.5 ? .3 : 0),
      acteurs:[{type:'leo', x:0, z:0, pose:p, o:{habit:habit, yeuxCape:yeux(t)},
        lum:{dx:-280, dy:-600, k:1.1}, ombreR:170,
        plus:t >= RIP ? function(){ return laCape().dessin(t); } : null}],
      sol:function(t){
        return AC.outil('marteau', t, {t0:.05, duree:.6, de:[110, -250, 10], vers:[190, 0, 140], r0:-20, r1:190}) +
          AC.outil('fleau', t, {t0:.15, duree:.65, de:[-110, -270, 10], vers:[-230, 0, 160], r0:30, r1:-170}) +
          AC.outil('crochet', t, {t0:1.1, duree:.38, de:[50, -190, 20], vers:[40, 0, 210], r0:10, r1:160});
      },
      devant:function(t){
        return FX.bouffee(t, 1.4, 58, 10, 12, 4, 1) + FX.bouffee(t, 1.42, -56, 10, 12, 5, 1) + FX.bouffee(t, 4.32, 74, 10, 8, 6, .7) +
          FX.bouffee(t, 10.05, 0, 0, 16, 7, 1.4) + FX.cailloux(t, 10.05, 0, 40, 18, 8) + FX.bouffee(t, 11.5, 0, 0, 12, 9, 1.2) + FX.cailloux(t, 11.5, 0, 40, 12, 10) +
          FX.plafond(t, 7.2, 9.0, 40, 11, [-800, -800, 800, 300]) + FX.plafond(t, 10.05, 12.4, 50, 12, [-900, -800, 900, 300]);
      },
      lumieres:function(t){
        var s = FX.onde(t, 10.05, 0, 0, 760) + FX.onde(t, 11.5, 0, 0, 620);
        if(flash > 0){ var c = CAM.projeter(0, -380, 0); s += '<circle cx="' + U.r(c.x) + '" cy="' + U.r(c.y) + '" r="' + U.r(900 * c.s) + '" fill="url(#haloFort)" opacity="' + U.r(flash * 1.4) + '"/>'; }
        return s;
      },
      fondu:fondu(t, .35, .5, T)
    };
  }
};
})();


/* ======================================================================================================== */
/* FILM 2 — FIN DE LA PHASE 2 : essoufflé, blessé, en colère. « Très bien… Je n'ai pas le choix. » Il sort la potion de force
   volée à Iris, l'ouvre avec les dents, la boit d'un trait : elle agit. Il se plie, sa peau rougit par à-coups, les veines vertes
   s'allument et courent sur lui, ses épaules gonflent ; il se redresse, plus grand, les yeux qui luisent, et hurle (trois ondes vertes).
   C'est le Léo de la phase 3 dessiné par l'autre conversation (Bible §13.42). Environ 14,2 secondes. */
(function(){
var T = 14.2, SORT = 7.0, BOUCHON = 8.15, CRACHE = 8.35, JETTE = 9.85, CRI = 12.5;
var VB = U.melange(V0, {sueur:1, rouge:.5}, 1);
var BASE2 = U.melange(BASE, {v:VB}, 1);
var poseB = U.poses(BASE2, [
  [0, {w:[0, -222], tk:.82, t:2, bD:{ik:1, cible:[66, -168], devant:true}, bG:{ik:1, cible:[-66, -168], devant:true}, jD:{p:[80, 0]}, jG:{p:[-80, 0]}, tete:{k:14, y:6},
       poingD:'ouvert', poingG:'ouvert', v:{sourcils:{f:.6, t:.35}, yeux:{o:.7}, bouche:{o:.35, w:.1, c:-.2}}}],
  [1.6, {tete:{k:10}}, 'io'],
  [2.05, {w:[0, -256], tk:.95, tete:{k:2, y:0}, bD:{ik:0, a:16, c:-20, devant:false}, bG:{ik:0, a:16, c:-20, devant:false}, poingD:'poing', poingG:'poing',
       v:{yeux:{o:.9}, sourcils:{f:.95, t:0}, bouche:{o:.2}}}, 'io'],
  [2.35, {bD:{ik:1, cible:[16, -446], devant:true}, tete:{k:4, r:-4}}, 'io'],
  [2.7, {bD:{cible:[118, -430]}, tete:{r:3}}, 'io'],
  [3.15, {bD:{ik:0, a:16, c:-20}, tete:{k:0, r:0}}, 'io'],
  [3.2, {bD:{devant:false}, v:{sourcils:{f:1}, bouche:{o:0, c:-.4}}}],
  [4.9, {tete:{k:1, r:-2}}, 'io'],
  [6.2, {tete:{k:4, r:3}}, 'io'],
  [6.4, {tete:{k:6, r:0, ht:.2}}],
  [6.95, {bD:{ik:1, cible:[88, -244]}, t:-4, tete:{k:10, ht:.35}, v:{yeux:{ly:.9, lx:.5}}}, 'io'],
  [7.15, {bD:{cible:[84, -262]}}, 'io'],
  [7.7, {bD:{cible:[38, -430], devant:true}, t:0, tete:{k:2, ht:0}, v:{yeux:{lx:.35, ly:.55}, sourcils:{f:.45, l:.25}}}, 'io'],
  [8.0, {bD:{cible:[14, -466]}, tete:{k:-2}, v:{yeux:{lx:0, ly:0}, bouche:{o:.25, d:.6}}}, 'io'],
  [BOUCHON, {bD:{cible:[48, -446]}, tete:{k:2, r:4}}, 'o'],
  [CRACHE, {tete:{r:-12, ht:-.45}, v:{bouche:{o:.35, d:0}}}, 'o'],
  [8.5, {tete:{r:0, ht:0}, v:{bouche:{o:0}}}, 'io'],
  [8.75, {bD:{cible:[8, -486]}, tete:{k:-16}, v:{yeux:{o:.25}, bouche:{o:.45}}}, 'io'],
  [9.6, {tete:{k:-18}}, 'l'],
  [JETTE, {bD:{ik:1, cible:[280, -430], devant:false}, tete:{k:0}, v:{yeux:{o:1}, bouche:{o:.1}}}, 'o'],
  [10.0, {bD:{ik:0, a:30, c:-24}}, 'io'],
  /* elle agit : les mains sur la poitrine, les yeux grands ouverts */
  [10.3, {w:[0, -240], tk:.82, bD:{ik:1, cible:[26, -336], devant:true}, bG:{ik:1, cible:[-34, -330], devant:true}, tete:{k:12}, poingD:'ouvert', poingG:'ouvert',
       v:{yeux:{o:1.25}, bouche:{o:.35, d:.4, cri:.2}, sourcils:{f:.6, t:.5}}}, 'o'],
  /* il se plie, les dents serrées */
  [10.95, {w:[0, -214], tk:.7, tete:{k:22, y:8}, bD:{cible:[44, -300]}, bG:{cible:[-50, -296]}, poingD:'poing', poingG:'poing',
       v:{yeux:{o:.35}, bouche:{o:.25, d:1, cri:0}, sourcils:{f:1, t:.2}, veines:1}}, 'io'],
  [11.85, {w:[0, -208], tk:.68, tete:{k:24}}, 'l'],
  /* il se redresse, plus grand… */
  [12.3, {w:[0, -262], tk:1, souffle:1.2, fl:.7, bD:{ik:0, a:62, c:40, devant:false}, bG:{ik:0, a:62, c:40, devant:false}, tete:{k:-6, y:0},
       v:{yeux:{o:1.1}, bouche:{o:.6, cri:.6, d:.4}}}, 'io'],
  /* … et hurle */
  [CRI, {w:[0, -270], fl:1, bD:{a:50, c:24}, bG:{a:50, c:24}, tete:{k:-14}, v:{bouche:{o:1, cri:1, w:.4, d:.6}}}, 'o'],
  [13.7, {w:[0, -266], tete:{k:-10}}, 'l']
]);
function pose(t){
  var p = copie(poseB(t));
  if(t < 3.2) respire(p, t, 1.15, 1.05, 5);
  if(t >= 3.2 && t < 6.4) respire(p, t, .7, .9, 6);
  if(t >= 6.4 && t < 10.2) respire(p, t, .5, .8, 7);
  if(t > 10.3) tremble(p, t, t < 12.2 ? U.clamp((t - 10.3) * 1.6, 0, 1.6) : U.lerp(1.6, .9, U.clamp((t - 12.2) / .6, 0, 1)));
  bouchePar(p, t, [[3.6, 4.6], [5.0, 6.15]]);
  if(t < 3.0) p.v.bouche.o = .3 + .25 * (.5 + .5 * Math.sin(t * Math.PI * 2 * 1.05));
  p.v.yeux.cl = t > 8.6 && t < 9.7 ? 0 : cligne(t, 1.3);
  p.v.tSueur = t;
  return p;
}
var vide = U.piste([[8.7, 0], [9.6, 1, 'l']]);
var lueurP = U.piste([[SORT, .3], [7.7, 1, 'o'], [9.6, .8], [JETTE, .6]]);
/* la forme 3 qui monte : les veines, les épaules (0 → 1) ; la peau qui rougit par à-coups, de plus en plus souvent ; il grandit un peu */
var forme = U.piste([[10.45, 0], [11.95, 1, 'io']]);
function rougit(t){ if(t < 10.85) return false; if(t >= 11.95) return true; return ((t - 10.85) * 7.5) % 1 < .15 + .8 * (t - 10.85) / 1.1; }
var grand = U.piste([[10.9, 1], [12.35, 1.07, 'io']]);
var camera = plans([
  [0, [[0, {x:0, y:-270, z:1260, focus:1260}], [3.2, {x:16, y:-300, z:1120, focus:1120}, 'io']]],
  [3.2, [[3.2, {x:0, y:-508, z:560, focus:560, ouverture:1.1}], [6.4, {x:0, y:-506, z:500, focus:500, ouverture:1.1}, 'l']]],
  [6.4, [[6.4, {x:60, y:-380, z:930, focus:930}], [8.5, {x:30, y:-420, z:820, focus:820}, 'io']]],
  [8.5, [[8.5, {x:30, y:-470, z:860, focus:860}], [10.1, {x:20, y:-470, z:780, focus:780}, 'l']]],
  [10.1, [[10.1, {x:0, y:-380, z:860, focus:860}], [11.95, {x:0, y:-372, z:760, focus:760}, 'l']]],
  [11.95, [[11.95, {x:0, y:-300, z:1580, focus:1580, tangage:.05}], [T, {x:0, y:-330, z:1400, focus:1400, tangage:.05}, 'io']]]
]);
var SEC = [[10.45, 6, 1.2], [CRI, 14, 1.2]];
CINE.films.b23 = {
  nom:'Fin de la phase 2', duree:T,
  sons:[[.1, 'cineSouffle'], [1.6, 'cineSouffle'], [2.45, 'cineEssuie'], [6.8, 'leoSac'], [BOUCHON - .03, 'leoBouchon'], [CRACHE, 'cineCrache'],
    [8.85, 'leoGlou'], [9.15, 'leoGlou'], [9.45, 'leoGlou'], [JETTE + .25, 'leoBrise'], [10.25, 'cineCoeur'], [10.45, 'leoPotion'], [10.9, 'cineCoeur'],
    [11.0, 'cineMontee'], [11.45, 'cineCoeur'], [11.98, 'leoMuscles'], [CRI - .05, 'leoHurlement'], [CRI, 'cineOnde'], [CRI + .45, 'cineOnde']],
  sousTitres:[[3.55, 4.75, 'Très bien…', 'Léo'], [4.95, 6.35, 'Je n\'ai pas le choix.', 'Léo']],
  etat:function(t){
    var p = pose(t), fio = t >= SORT && t < JETTE, k3 = forme(t), g = grand(t), rouge = rougit(t);
    var flamme = t > 10.2 ? U.clamp((t - 10.2) / 1.6, 0, 1) : 0;
    /* un point du corps, à l'écran (il a grandi : on en tient compte) */
    function ecran(pt){ var pr = CAM.projeter(0, 0, 0); return [pr.x + pt[0] * pr.s * g, pr.y + pt[1] * pr.s * g, pr.s * g]; }
    return {
      cam:camera(t), tremble:secousses(SEC, t) + (t > 10.3 && t < 12.2 ? (t - 10.3) * 2.4 : 0), flare:1 + flamme * .4,
      acteurs:[{type:'leo', x:0, z:0, pose:p, echelle:g, o:{abime:1, forme3:k3, peau3:rouge}, ombreR:170 * g,
        lum:{dx:-280, dy:-600, k:1.1, rimsEcran:function(pr){
          var r = [], s = pr.s * g;
          if(fio){ var m = LeoFace.point(LeoFace.dernier.os, 'mainD'); r.push({x:pr.x + m[0] * s, y:pr.y + (m[1] + 10) * s, z:30 * s, k:1.6 * lueurP(t), c:'#9cff5a'}); }
          if(flamme > 0){ var c = LeoFace.point(LeoFace.dernier.os, 'poitrine'); r.push({x:pr.x + c[0] * s, y:pr.y + c[1] * s, z:20 * s, k:2.2 * flamme, c:'#8dff5a'}); }
          /* sous la potion : un liseré vert, des deux côtés */
          if(k3 > 0){ r.push({x:pr.x - 380 * s, y:pr.y - 420 * s, z:60 * s, k:.9 * k3, c:'#7dff5a'}); r.push({x:pr.x + 380 * s, y:pr.y - 420 * s, z:60 * s, k:.9 * k3, c:'#7dff5a'}); }
          return r;
        }},
        plus:function(){
          var os = LeoFace.dernier.os, s = '';
          if(fio){
            var ang = t < 8.6 ? 0 : t < 9.6 ? U.lerp(0, 150, U.lisse((t - 8.6) / .35)) : 150;
            s += PT_piece(os.mD, '<g transform="translate(0 26) rotate(' + U.r(ang - U.deg(Math.atan2(os.mD[1], os.mD[0]))) + ')">' + ObjetsCine.fiole(lueurP(t), t < BOUCHON, vide(t)) + '</g>' + ObjetsCine.doigts());
          }
          return s;
        }}],
      devant:function(t){
        var s = '';
        /* le bouchon craché, la fiole jetée qui se brise (hors champ, à droite) */
        if(t > CRACHE && t < CRACHE + .7){ var a = t - CRACHE, b = versEcran([-30 - a * 520, -460 + a * a * 1600 - a * 260]); s += '<g transform="translate(' + U.r(b[0]) + ' ' + U.r(b[1]) + ') scale(' + U.r(b[2] * 1.2) + ') rotate(' + U.r(a * 900) + ')">' + ObjetsCine.bouchon() + '</g>'; }
        if(t > JETTE && t < JETTE + .4){ var a2 = t - JETTE, b2 = versEcran([280 + a2 * 1500, -430 - a2 * 300 + a2 * a2 * 1400]); s += '<g transform="translate(' + U.r(b2[0]) + ' ' + U.r(b2[1]) + ') scale(' + U.r(b2[2] * 1.3) + ') rotate(' + U.r(a2 * 1100) + ')">' + ObjetsCine.fiole(.3, false, 1) + '</g>'; }
        s += FX.bouffee(t, CRI, 0, 0, 16, 7, 1.4) + FX.cailloux(t, CRI, 0, 40, 16, 8);
        s += FX.plafond(t, CRI, 14.0, 50, 13, [-900, -800, 900, 300]);
        return s;
      },
      lumieres:function(t){
        var s = '';
        if(fio){ var m = versEcran(LeoFace.point(LeoFace.dernier.os, 'mainD')); s += ObjetsCine.lueur(m[0], m[1], 180 * m[2] * (.8 + .2 * U.bruit(t * 9, 2)), .75 * lueurP(t) * (t > 8.6 && t < 9.7 ? .55 : 1)); }
        if(flamme > 0){ var c = ecran(LeoFace.point(LeoFace.dernier.os, 'poitrine')); s += ObjetsCine.lueur(c[0], c[1], (50 + 70 * flamme) * c[2] * (.9 + .1 * U.bruit(t * 6, 3)), .3 + .3 * flamme); }
        /* les à-coups : à chaque fois que la peau rougit, une bouffée de lumière verte */
        if(rouge && t < 11.95){ var c2 = ecran(LeoFace.point(LeoFace.dernier.os, 'poitrine')); s += ObjetsCine.lueur(c2[0], c2[1], 240 * c2[2], .16); }
        /* les yeux qui luisent */
        if(k3 > .3){ ['oeilD', 'oeilG'].forEach(function(n){ var e = ecran(LeoFace.point(LeoFace.dernier.os, n)); s += ObjetsCine.lueur(e[0], e[1], 24 * e[2], (k3 - .3) * 1.1); }); }
        /* le hurlement : trois ondes vertes, au sol et dans l'air */
        s += FX.onde(t, CRI, 0, 0, 760, '#b6ff8a') + FX.onde(t, CRI + .25, 0, 0, 680, '#b6ff8a') + FX.onde(t, CRI + .5, 0, 0, 600, '#b6ff8a');
        var b = ecran(LeoFace.point(LeoFace.dernier.os, 'bouche'));
        s += FX.ondeAir(t, CRI, b[0], b[1], 420 * b[2], '#eaffc0') + FX.ondeAir(t, CRI + .22, b[0], b[1], 420 * b[2], '#eaffc0') + FX.ondeAir(t, CRI + .44, b[0], b[1], 420 * b[2], '#eaffc0');
        return s;
      },
      fondu:t < .35 ? {k:1 - t / .35} : t > T - .6 ? {k:U.clamp((t - (T - .6)) / .6, 0, 1)} : null
    };
  }
};
})();


/* ======================================================================================================== */
/* FILM 3 — LA FIN, PREMIÈRE PARTIE (dans le donjon, sur la tablette du Pisteur) : la potion ne fait plus effet. Léo, battu, à genoux,
   relève la tête, regarde les héros (la caméra) et parle — ses cinq phrases, validées par Romain le 13 novembre (Bible §13.33) ;
   triste d'abord, puis la peur quand il parle du maire. On commence sur le Léo de la phase 3 (la peau rougie, les veines vertes,
   les trois entailles de la faux) : la potion s'en va, il redevient Léo. Environ 42 secondes. */
(function(){
var T = 41.8;
var L = [
  [4.6, 7.2, 'Assez… Vous avez gagné.'],
  [7.6, 11.0, 'Meunier… Je n\'ai jamais voulu être meunier.'],
  [11.3, 15.2, 'Le maire, lui, m\'a promis autre chose. Une vraie place.'],
  [15.8, 18.7, 'C\'est lui qui a tout préparé, depuis le début :'],
  [18.9, 22.1, 'la rivière rouge, les fumigènes, la lettre.'],
  [22.4, 26.3, 'Odette, ce n\'était pas prévu. Elle a été trop curieuse.'],
  [26.9, 30.4, 'Il descend souvent, tout seul, encore plus bas.'],
  [30.7, 34.3, 'Là-dessous, il y a une ville. Une ville entière, sous Brumeval.'],
  [34.8, 37.6, 'Moi, il ne m\'a jamais laissé y aller.'],
  [37.8, 39.9, 'Personne n\'y va. Jamais.']
];
/* où la bouche bouge (un peu plus court que le sous-titre) */
var LEVRES = [[4.7, 5.5], [6.0, 7.0], [7.7, 8.4], [8.7, 10.9], [11.4, 13.4], [13.8, 15.0], [15.9, 18.6], [19.0, 22.0], [22.5, 24.2], [24.6, 26.2],
  [27.0, 30.3, .7], [30.8, 34.2, .6], [34.9, 37.5, .8], [37.9, 38.9, .7], [39.2, 39.8, .6]];
var VC = U.melange(V0, {sueur:.6, rouge:.3, sourcils:{f:.2, t:.5}, yeux:{o:.7}, bouche:{c:-.4}}, 1);
var BASEC = U.melange(BASE, {v:VC, w:[0, -140], tk:.86, jD:{p:[60, -8], g:1}, jG:{p:[-60, -8], g:1}, poingG:'ouvert', poingD:'ouvert',
  bD:{ik:1, cible:[100, -60]}, bG:{ik:1, cible:[-62, -110]}, tete:{k:16, y:6}}, 1);
var poseC = U.poses(BASEC, [
  [0, {r:-3}],
  [1.2, {r:2, w:[0, -136]}, 'io'],
  [1.9, {w:[0, -126], tk:.78, bD:{cible:[82, -40]}, bG:{cible:[-82, -40]}, tete:{k:20}}, 'i2'],
  [2.6, {r:0}, 'io'],
  [3.6, {w:[0, -150], tk:.9, bG:{cible:[-64, -116]}, tete:{k:8}}, 'io'],
  [4.4, {tete:{k:2, y:2}, v:{yeux:{ly:-.3, o:.75}}}, 'io'],
  [5.8, {v:{bouche:{c:-.25}}}, 'io'],
  [7.4, {v:{yeux:{ly:.8, o:.6}, sourcils:{t:.4, f:.4}, bouche:{c:-.5}}, tete:{k:6}}, 'io'],
  [8.6, {v:{yeux:{ly:0, o:.75}}, tete:{k:3}}, 'io'],
  [11.2, {v:{yeux:{lx:-.55, ly:-.35, o:.85}, sourcils:{l:.3, t:.3, f:0}}, tete:{ht:-.25, k:0}}, 'io'],
  [13.7, {v:{yeux:{lx:0, ly:0, o:.8}, sourcils:{l:.1, t:.65}, bouche:{c:.05}}, tete:{ht:0, k:2}}, 'io'],
  [15.6, {v:{sourcils:{f:.6, t:.1, l:0}, yeux:{o:.95}, bouche:{c:-.35}}, tete:{k:-1}}, 'io'],
  [22.3, {v:{yeux:{ly:.85, o:.65}, sourcils:{f:.1, t:.75}}, tete:{k:7}}, 'io'],
  [24.5, {v:{yeux:{ly:.1, lx:.6, o:.9}, sourcils:{t:.6, l:.3}}, tete:{k:2, ht:.15}}, 'io'],
  [26.8, {v:{yeux:{lx:0, ly:0, o:1.05}, sourcils:{l:.55, t:.5, f:0}, bouche:{c:-.3, w:-.2}}, tete:{k:0, ht:0}}, 'io'],
  [28.4, {v:{yeux:{lx:.95, o:1.15}}, tete:{ht:.45, r:3}}, 'io'],
  [30.6, {v:{yeux:{lx:0, o:1.18}, sourcils:{l:.7, t:.55}}, tete:{ht:0, r:0, k:-2}}, 'io'],
  [34.7, {v:{yeux:{ly:.7, o:.8}, sourcils:{l:.35, t:.8}}, tete:{k:6}}, 'io'],
  [37.7, {v:{yeux:{ly:0, o:.9}}, tete:{k:2}}, 'io'],
  [39.0, {v:{yeux:{o:1.12}, sourcils:{l:.6, t:.85}, bouche:{c:-.45}}, tete:{k:0}}, 'io']
]);
function pose(t){
  var p = copie(poseC(t));
  respire(p, t, t < 4.4 ? 1.1 : .55, t < 4.4 ? 1.05 : .7, 8);
  if(t > 26.8 && t < 40) tremble(p, t, .22);
  /* il secoue la tête (« jamais voulu », « personne n'y va ») ; il compte (rivière, fumigènes, lettre) */
  if(t > 8.7 && t < 10.6) p.tete.r += Math.sin((t - 8.7) * 6) * 3.5;
  if(t > 37.9 && t < 38.9) p.tete.r += Math.sin((t - 37.9) * 7) * 4;
  if(t > 19.0 && t < 22.0) p.tete.k += Math.max(0, Math.sin((t - 19.0) * Math.PI / 1.05)) * 3;
  bouchePar(p, t, LEVRES);
  p.v.yeux.cl = cligne(t, 2.2);
  p.v.tSueur = t;
  return p;
}
var camera = plans([
  [0, [[0, {x:0, y:-240, z:1250, focus:1250}], [4.4, {x:0, y:-250, z:1080, focus:1080}, 'io']]],
  [4.4, [[4.4, {x:0, y:-396, z:580, focus:580, ouverture:1.1}], [7.4, {x:0, y:-396, z:540, focus:540, ouverture:1.1}, 'l']]],
  [7.4, [[7.4, {x:-40, y:-330, z:840, focus:840}], [15.6, {x:-10, y:-340, z:740, focus:740}, 'l']]],
  [15.6, [[15.6, {x:10, y:-398, z:560, focus:560, ouverture:1.1}], [26.7, {x:0, y:-398, z:480, focus:480, ouverture:1.1}, 'l']]],
  [26.7, [[26.7, {x:60, y:-320, z:920, focus:920}], [34.6, {x:20, y:-350, z:700, focus:700}, 'io']]],
  [34.6, [[34.6, {x:0, y:-398, z:540, focus:540, ouverture:1.1}], [T, {x:0, y:-398, z:470, focus:470, ouverture:1.1}, 'l']]]
]);
var vap = U.piste([[0, 1.2], [3, .8], [7, .2], [10, 0]]);
/* la potion ne fait plus effet : au début, c'est encore le Léo de la phase 3 ; il redevient Léo en deux secondes (la peau
   par à-coups, les veines qui s'éteignent, il rapetisse) */
var forme = U.piste([[0, 1], [.5, 1], [1.9, 0, 'io']]);
var grand = U.piste([[0, 1.07], [.6, 1.07], [1.9, 1, 'io']]);
function rougit(t){ if(t < .6) return true; if(t >= 1.7) return false; return ((t - .6) * 7.5) % 1 > (t - .6) / 1.1; }
CINE.films.finLeo = {
  nom:'La fin : Léo parle', duree:T,
  sons:[[.05, 'cineSouffle'], [.6, 'cineCoeur'], [1.2, 'cineCoeur'], [1.85, 'cineChute'], [3.2, 'cineSouffle'], [28.3, 'cineCoeur']],
  sousTitres:L.map(function(l){ return [l[0], l[1], l[2], 'Léo']; }),
  etat:function(t){
    var p = pose(t), k3 = forme(t), g = grand(t);
    return {
      cam:camera(t), tremble:t > 1.85 && t < 2.3 ? 4 : 0,
      acteurs:[{type:'leo', x:0, z:0, pose:p, echelle:g, o:{abime:1, faux:false, gourde:false, forme3:k3, peau3:rougit(t), entailles:1}, ombreR:190,
        lum:{dx:-260, dy:-560, k:1.05, rimsEcran:function(pr){ var s = pr.s * g; return k3 > 0 ? [{x:pr.x - 380 * s, y:pr.y - 420 * s, z:60 * s, k:.9 * k3, c:'#7dff5a'}, {x:pr.x + 380 * s, y:pr.y - 420 * s, z:60 * s, k:.9 * k3, c:'#7dff5a'}] : []; }},
        plus:function(){ var os = LeoFace.dernier.os; return FX.vapeur(t, [Pantin.M.pt(os.buste, -40, -120), Pantin.M.pt(os.buste, 40, -120), Pantin.M.pt(os.tete, 0, -80), Pantin.M.pt(os.bD, 0, 60), Pantin.M.pt(os.bG, 0, 60)], vap(t), 5); }}],
      sol:function(t){
        /* ses affaires ne sont plus sur lui : le Pisteur a pris la faux et la gourde ; la fiole brisée traîne */
        return '';
      },
      lumieres:function(t){
        if(!(k3 > .3)) return '';
        var s = '', pr = CAM.projeter(0, 0, 0);
        ['oeilD', 'oeilG'].forEach(function(n){ var e = LeoFace.point(LeoFace.dernier.os, n); s += ObjetsCine.lueur(pr.x + e[0] * pr.s * g, pr.y + e[1] * pr.s * g, 24 * pr.s * g, (k3 - .3) * 1.1); });
        return s;
      },
      fondu:t < .6 ? {k:1 - t / .6, c:'#f4ffdc'} : t > T - .8 ? {k:(t - (T - .8)) / .8} : null
    };
  }
};
})();


/* ======================================================================================================== */
/* FILM 4 — LA FIN, DEUXIÈME PARTIE (après les accusations, sur les quatre tablettes) : on retrouve Léo à terre ; des pas ; la caméra
   tourne vers l'escalier ; le maire descend, sa lanterne levée, avec Silas et six gardes armés de lances et de boucliers ; il s'avance
   vers nous, s'arrête, et dit son texte (validé par Romain le 13 novembre, Bible §13.33) : « Que s'est-il passé ici ? Léo ! Qu'avez-vous
   fait à Léo ? » — il retire son gant : la bague en argent à tête de corbeau — « Vous êtes allés trop loin. Beaucoup trop loin. » —
   Silas : « Monsieur le maire… ? » — « Gardes ! Attrapez-les ! ». Puis le jeu montre la prison. Environ 27 secondes. */
(function(){
var T = 27.2, PE = PLATEAU.PAS_Y, PZ = PLATEAU.PAS_Z, MZ = PLATEAU.MUR_Z, N = PLATEAU.MARCHES;
var X0 = (PLATEAU.ARCHE.x0 + PLATEAU.ARCHE.x1) / 2;
/* une marche : son dessus (n = −1 : le sol, au pied de l'escalier ; n = N : le palier du haut) */
function haut(n){ return n < 0 ? 0 : -PE * (Math.min(n, N - 1) + 1); }
function prof(n){ return n < 0 ? MZ + 40 : n >= N ? MZ - N * PZ - 60 : MZ - n * PZ - PZ / 2; }
/* le trajet d'un personnage : il descend l'escalier (dps secondes par marche), puis marche jusqu'à son arrêt ; on rend sa place et
   ses pieds (dans son repère : les pieds sont à des hauteurs différentes dans l'escalier) */
function trajet(t, o){
  var ecart = o.ecart || 44, r = {x:o.x, y:0, z:prof(N), jD:{p:[ecart, 0]}, jG:{p:[-ecart, 0]}, bob:0, marche:0, phase:0};
  var a = t - o.t0;
  if(a < 0){ r.y = haut(N); r.z = prof(N); r.cache = true; return r; }
  var etapes = N + 1, dur = etapes * o.dps;
  if(a < dur){
    var k = a / o.dps, i = Math.floor(k), fr = k - i, n0 = N - i, n1 = n0 - 1;
    var e = U.COURBES.io(fr);
    r.y = U.lerp(haut(n0), haut(n1), e); r.z = U.lerp(prof(n0), prof(n1), fr);
    var dev = i % 2 ? 'D' : 'G', der = i % 2 ? 'G' : 'D';
    var lev = Math.sin(Math.PI * U.clamp(fr * 1.3, 0, 1)) * 14;
    r['j' + dev] = {p:[(dev === 'D' ? 1 : -1) * ecart, (haut(n1) - r.y) * U.lisse(fr * 1.4) - lev]};
    r['j' + der] = {p:[(der === 'D' ? 1 : -1) * ecart, haut(n0) - r.y]};
    r.bob = -Math.sin(Math.PI * fr) * 4; r.marche = 1; r.phase = i + fr;
    return r;
  }
  /* au sol : il marche jusqu'à son arrêt */
  var b = a - dur, de = [o.x, prof(-1)], vers = o.arret, dist = Math.hypot(vers[0] - de[0], vers[1] - de[1]), vit = o.vitesse || 260, tm = dist / vit;
  var kk = U.clamp(b / tm, 0, 1), ee = kk < .85 ? kk / .85 * .92 : .92 + (kk - .85) / .15 * .08;
  r.x = U.lerp(de[0], vers[0], ee); r.z = U.lerp(de[1], vers[1], ee); r.y = 0;
  if(kk < 1){
    var ph = b * (o.cadence || 2.1), j = Math.floor(ph), fr2 = ph - j, cote = j % 2 ? 'D' : 'G';
    r['j' + cote] = {p:[(cote === 'D' ? 1 : -1) * ecart, -Math.sin(Math.PI * fr2) * 16]};
    r.bob = -Math.abs(Math.sin(Math.PI * fr2)) * 5; r.marche = 1; r.phase = ph; r.balance = (cote === 'D' ? 1 : -1) * Math.sin(Math.PI * fr2);
  }
  r.arrive = kk >= 1;
  return r;
}
function poseMarche(base, tr, t){
  var p = copie(base);
  p.w = [p.w[0] + (tr.balance || 0) * 4, p.w[1] + tr.bob];
  p.jD = tr.jD; p.jG = tr.jG;
  p.r = (tr.balance || 0) * 2.2; p.t = -(tr.balance || 0) * 1.2;
  p.tete = Object.assign({}, p.tete, {r:(p.tete.r || 0) - (tr.balance || 0) * 1.5});
  return p;
}
var VM = {sourcils:{f:0, l:0, t:0}, yeux:{o:1, lx:0, ly:0, cl:0}, bouche:{o:0, w:0, c:.9, d:0, cri:0}, ht:0};
var MAIRE = {w:[0, -232], r:0, t:0, tk:1, tete:{r:0, k:0, ht:0}, bD:{a:26, c:96, l1:1, l2:1}, bG:{a:10, c:-12, l1:1, l2:1}, jD:{p:[40, 0]}, jG:{p:[-40, 0]}, poingD:'poing', poingG:'poing', v:VM};
var SILAS = {w:[0, -250], tete:{r:0, k:0, ht:0}, bD:{a:8, c:-14}, bG:{a:8, c:-14}, jD:{p:[42, 0]}, jG:{p:[-42, 0]}, poingD:'poing', poingG:'poing',
  v:{sourcils:{f:.3, l:0, t:0}, yeux:{o:1, lx:0, ly:0, cl:0}, bouche:{o:0, w:0, c:-.1}}};
var GARDE = {w:[0, -256], tete:{r:0, k:0, ht:0}, bD:{a:16, c:62}, bG:{a:6, c:-74}, jD:{p:[46, 0]}, jG:{p:[-46, 0]}, poingD:'poing', poingG:'poing',
  v:{sourcils:{f:.7, l:0, t:0}, yeux:{o:.9, lx:0, ly:0, cl:0}, bouche:{o:0, w:0, c:-.2}}};
var CHEMIN = {
  maire:{x:X0, t0:2.7, dps:.4, arret:[1380, -180], vitesse:280, cadence:1.9, ecart:40},
  silas:{x:X0 - 130, t0:3.6, dps:.38, arret:[1080, -430], vitesse:300, ecart:42},
  g0:{x:X0 - 110, t0:4.4, dps:.36, arret:[1240, -560], vitesse:320}, g1:{x:X0 + 110, t0:4.4, dps:.36, arret:[1580, -560], vitesse:320},
  g2:{x:X0 - 110, t0:5.2, dps:.36, arret:[1040, -720], vitesse:320}, g3:{x:X0 + 110, t0:5.2, dps:.36, arret:[1760, -700], vitesse:320},
  g4:{x:X0 - 110, t0:6.0, dps:.36, arret:[1400, -840], vitesse:320}, g5:{x:X0 + 110, t0:6.0, dps:.36, arret:[1900, -860], vitesse:320}
};
var LIGNES = [
  [11.0, 13.1, 'Que s\'est-il passé ici ? Léo !', 'Le maire'],
  [13.2, 14.7, 'Qu\'avez-vous fait à Léo ?', 'Le maire'],
  [18.3, 21.4, 'Vous êtes allés trop loin. Beaucoup trop loin.', 'Le maire'],
  [21.9, 23.6, 'Monsieur le maire… ?', 'Silas'],
  [24.0, 25.7, 'Gardes ! Attrapez-les !', 'Le maire']
];
var poseMaireCles = U.poses(MAIRE, [
  [10.6, {}],
  [11.0, {bD:{a:58, c:76}, tete:{ht:-.5, k:-2}, v:{yeux:{lx:-.9, o:1.15}, sourcils:{l:.85, t:.2}, bouche:{c:0, w:-.3}}}, 'io'],
  [12.2, {bD:{a:66, c:70}}, 'io'],
  [13.1, {tete:{ht:0, k:0}, v:{yeux:{lx:0, o:1.05}, sourcils:{l:.55, f:.2, t:0}}}, 'io'],
  [14.7, {}],
  [14.8, {bD:{a:10, c:-12}, bG:{a:26, c:96}, v:{sourcils:{l:0, f:.5}, yeux:{o:.55}, bouche:{c:.3, w:.2}}, tete:{k:4}}],
  [21.5, {}],
  [23.8, {tete:{k:0, ht:0}, v:{yeux:{o:.7}}}],
  [24.1, {bD:{a:76, c:-6, l1:.8, l2:.55}, poingD:'pointe', v:{sourcils:{f:1, l:0}, yeux:{o:1}, bouche:{c:-.3, cri:.4}}, tete:{k:-3}}, 'dep']
]);
function poseMaire(t){
  var tr = trajet(t, CHEMIN.maire), p = poseMarche(poseMaireCles(t), tr, t);
  if(tr.arrive) respire(p, t, .2, .6, 21);
  bouchePar(p, t, [[11.05, 12.0], [12.3, 13.0], [13.25, 14.6], [18.35, 19.6], [19.9, 21.3], [24.05, 24.7], [24.9, 25.6]]);
  p.v.yeux.cl = cligne(t, .4);
  return {tr:tr, p:p};
}
var poseSilasCles = U.poses(SILAS, [
  [21.6, {}],
  [21.9, {tete:{r:6, ht:.35, k:2}, v:{sourcils:{l:.75, t:.65, f:0}, yeux:{lx:.8, o:1.1}}, bD:{a:22, c:-58}, poingD:'ouvert'}, 'io'],
  [23.8, {}],
  [24.4, {tete:{r:-4, ht:.25}, v:{sourcils:{l:1, t:.4}, yeux:{o:1.25, lx:.6}, bouche:{o:.35}}}, 'o']
]);
function poseSilas(t){
  var tr = trajet(t, CHEMIN.silas), p = poseMarche(poseSilasCles(t), tr, t);
  if(tr.arrive) respire(p, t, .25, .7, 22);
  bouchePar(p, t, [[21.95, 23.5]]);
  p.v.yeux.cl = cligne(t, 1.7);
  return {tr:tr, p:p};
}
function poseGarde(t, k){
  var c = CHEMIN['g' + k], tr = trajet(t, c), p = poseMarche(GARDE, tr, t), charge = t > 24.9;
  if(charge){
    /* « Attrapez-les ! » : ils pointent leurs lances et avancent sur nous */
    var a = t - 24.9 - k * .06, ph = Math.max(0, a) * 2.6, j = Math.floor(ph), fr = ph - j, cote = j % 2 ? 'D' : 'G';
    p['j' + cote] = {p:[(cote === 'D' ? 1 : -1) * 46, -Math.sin(Math.PI * fr) * 18]}; p.w = [p.w[0], p.w[1] - Math.abs(Math.sin(Math.PI * fr)) * 6];
    tr.z += Math.max(0, a) * 520; tr.x += (1300 - tr.x) * U.clamp(a * .25, 0, .35);
  }
  if(tr.arrive && !charge) respire(p, t, .15, .6, 30 + k);
  p.v.yeux.cl = cligne(t, k * .7);
  return {tr:tr, p:p, lance:{bas:U.clamp((t - 24.7) / .35, 0, 1)}};
}
var POSE_LEO = U.melange(BASE, {v:U.melange(V0, {sueur:.5, sourcils:{f:.1, t:.6}, yeux:{o:.8}, bouche:{c:-.4}}, 1), w:[0, -150], tk:.9, jD:{p:[60, -8], g:1}, jG:{p:[-60, -8], g:1},
  poingG:'ouvert', poingD:'ouvert', bD:{ik:1, cible:[100, -60]}, bG:{ik:1, cible:[-64, -116]}, tete:{k:3}}, 1);
var leoCles = U.poses(POSE_LEO, [[0.9, {}], [1.5, {tete:{ht:.45, k:-1}, v:{yeux:{lx:1, o:1.15}, sourcils:{l:.7, t:.6, f:0}, bouche:{o:.2, w:-.2}}}, 'io']]);
function poseLeo(t){ var p = copie(leoCles(t)); respire(p, t, .6, .9, 9); if(t > 1.5) tremble(p, t, .3); p.v.yeux.cl = cligne(t, .2); return p; }

var camera = plans([
  [0, [[0, {x:-40, y:-300, z:1050, focus:1050}], [1.6, {x:-30, y:-300, z:1010, focus:1010}, 'l'],
       [4.8, {x:820, y:-390, z:1500, lacet:.42, focus:2900, ouverture:.9}, 'io'], [8.0, {x:860, y:-340, z:1500, lacet:.38, focus:2500, ouverture:.9}, 'io'],
       [10.9, {x:1040, y:-360, z:1320, lacet:.2, focus:1560}, 'io']]],
  [10.9, [[10.9, {x:1290, y:-390, z:560, lacet:.12, focus:760}], [14.8, {x:1310, y:-395, z:470, lacet:.1, focus:680}, 'l']]],
  [14.8, [[14.8, {x:1290, y:-390, z:560, lacet:.12, focus:760}]]],
  [18.1, [[18.1, {x:1388, y:-445, z:200, lacet:0, focus:380, ouverture:1.1}], [21.6, {x:1388, y:-445, z:170, lacet:0, focus:350, ouverture:1.1}, 'l']]],
  [21.6, [[21.6, {x:1150, y:-410, z:300, lacet:-.1, focus:730, ouverture:1.15}], [23.8, {x:1140, y:-410, z:260, lacet:-.1, focus:690, ouverture:1.15}, 'l']]],
  [23.8, [[23.8, {x:1300, y:-370, z:760, lacet:.08, focus:940}], [T, {x:1300, y:-360, z:860, lacet:.08, focus:700}, 'i2']]]
]);
var lanterne = U.piste([[2.2, 0], [2.9, 1, 'o']]);
CINE.films.finMaire = {
  nom:'La fin : le maire', duree:T,
  sons:[[.9, 'cinePasEcho'], [2.2, 'cineLanterne'], [2.7, 'cinePasEscalier'], [3.5, 'cinePasEscalier'], [4.3, 'cinePasEscalier'], [5.1, 'cinePasEscalier'], [5.9, 'cinePasEscalier'], [6.7, 'cinePasEscalier'],
    [4.4, 'cineArmure'], [5.6, 'cineArmure'], [6.8, 'cineArmure'], [8.0, 'cineArmure'], [8.2, 'cinePas'], [9.2, 'cinePas'], [10.2, 'cinePas'], [9.4, 'cineArmure'],
    [15.1, 'cineGant'], [17.3, 'cineBague'], [24.0, 'cineCoeur'], [24.8, 'cineLances'], [25.2, 'cineGardes'], [26.6, 'cineCoup']],
  sousTitres:LIGNES,
  etat:function(t){
    var acteurs = [], M1 = poseMaire(t), S1 = poseSilas(t);
    if(t < 6.5) acteurs.push({type:'leo', x:0, z:0, pose:poseLeo(t), o:{abime:1, faux:false, gourde:false, entailles:1}, ombreR:190, lum:{dx:-260, dy:-560}});
    var lm = U.clamp((t - 2.7) / .6, 0, 1);
    var maire = {type:'maire', x:M1.tr.x, y:M1.tr.y, z:M1.tr.z, pose:M1.p, o:{lanterne:t < 14.8 ? lanterne(t) : null, gants:t < 15.0 ? 1 : .5, bague:true}, op:lm, ombreR:120,
      lum:{dx:40, dy:-380, k:1.1, c:'#ffe0b0'}};
    acteurs.push(maire);
    if(t > 3.6) acteurs.push({type:'silas', x:S1.tr.x, y:S1.tr.y, z:S1.tr.z, pose:S1.p, op:U.clamp((t - 3.6) / .5, 0, 1), ombreR:120, lum:{dx:200, dy:-500}});
    for(var k = 0; k < 6; k++){
      if(t < CHEMIN['g' + k].t0) continue;
      var G1 = poseGarde(t, k);
      acteurs.push({type:'garde', x:G1.tr.x, y:G1.tr.y, z:G1.tr.z, pose:G1.p, o:{variante:k, lance:G1.lance}, op:U.clamp((t - CHEMIN['g' + k].t0) / .5, 0, 1), ombreR:130, lum:{dx:-100, dy:-520}});
    }
    var cam = camera(t);
    /* pendant la descente, le point net suit le maire */
    if(t > 4.8 && t < 10.9){ var dm = Math.hypot(M1.tr.x - cam.x, M1.tr.z - cam.z); cam = Object.assign({}, cam, {focus:U.lerp(cam.focus, dm, U.clamp((t - 4.8) / 1.2, 0, 1))}); }
    return {
      cam:cam, tremble:t > 25 ? 3 + (t - 25) * 2 : 0, poussiere:260,
      acteurs:acteurs,
      lumieres:function(){
        var s = '';
        /* la lanterne du maire : une grande lueur chaude qui le suit (avant qu'il paraisse : elle éclaire le haut de l'escalier) */
        var L1 = lanterne(t);
        if(L1 > 0 && t < 14.8){
          var hl = maire.os ? Gens.point(maire.os, 'lanterne') : [60, -330];
          if(t < 2.7) hl = [0, -60];
          var q = CAM.projeter(M1.tr.x + hl[0], M1.tr.y + hl[1], M1.tr.z);
          s += '<circle cx="' + U.r(q.x) + '" cy="' + U.r(q.y) + '" r="' + U.r(700 * q.s) + '" fill="url(#halo)" opacity="' + U.r(.9 * L1) + '"/>' +
            '<circle cx="' + U.r(q.x) + '" cy="' + U.r(q.y) + '" r="' + U.r(110 * q.s) + '" fill="url(#haloFort)" opacity="' + U.r(.9 * L1) + '"/>';
        }
        return s;
      },
      avant:function(){
        /* le gros plan des mains */
        if(t >= 14.8 && t < 18.1) return Gens.insertGants(U.clamp((t - 14.95) / 2.1, 0, 1), U.clamp((t - 17.15) / .7, 0, 1), t);
        return '';
      },
      fondu:t < .4 ? {k:1 - t / .4} : t > 26.6 ? {k:(t - 26.6) / .5} : null
    };
  }
};
})();

/* le film d'essai (pour regarder un dessin : window.ESSAI = {cam, pose, o, plus}) */
CINE.films.essai = {duree:4, etat:function(t){
  var q = window.ESSAI || {};
  return {cam:q.cam || {x:0, y:-300, z:1900, focus:1900}, acteurs:[{type:'leo', x:0, z:0, pose:U.melange(BASE, q.pose || {}, 1), o:q.o || {}}].concat(q.plus || [])};
}};
CINE.BASE = BASE;
})();
