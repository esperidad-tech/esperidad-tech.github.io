/* outils.js — les petits outils des cinématiques (Bible §13.44).
   Tout ici est DÉTERMINISTE : une image ne dépend que de son temps t. C'est ce qui permet de filmer image par image
   (filmer.py) et de refaire exactement le même film. Aucune horloge, aucun Math.random. */
(function(){
'use strict';
var U = window.CU = {};

U.clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
U.lerp = function(a, b, k){ return a + (b - a) * k; };
U.inv = function(a, b, v){ return b === a ? 0 : U.clamp((v - a) / (b - a), 0, 1); };
U.lisse = function(k){ k = U.clamp(k, 0, 1); return k * k * (3 - 2 * k); };
U.tresLisse = function(k){ k = U.clamp(k, 0, 1); return k * k * k * (k * (k * 6 - 15) + 10); };

/* les courbes : un geste humain ne démarre et ne s'arrête jamais d'un coup */
U.COURBES = {
  l: function(k){ return k; },
  io: U.tresLisse,
  i: function(k){ return k * k * k; },
  o: function(k){ k = 1 - k; return 1 - k * k * k; },
  i2: function(k){ return k * k; },
  o2: function(k){ k = 1 - k; return 1 - k * k; },
  /* un mouvement qui dépasse un peu et revient (un coup, un rebond) */
  dep: function(k){ var s = 1.7; k = k - 1; return k * k * ((s + 1) * k + s) + 1; },
  /* un élan : il recule un peu avant de partir */
  elan: function(k){ var s = 1.4; return k * k * ((s + 1) * k - s); },
  /* tombe et rebondit à peine (un genou qui touche le sol) */
  choc: function(k){ if(k < .72) return (k / .72) * (k / .72); var r = (k - .72) / .28; return 1 - Math.sin(r * Math.PI) * .06; },
  pas: function(k){ return k < .5 ? 0 : 1; }
};

/* le hasard tenu par une graine (pour les particules, les textures) */
U.hasard = function(graine){
  var s = (graine >>> 0) || 1;
  return function(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; };
};
/* un bruit doux à une dimension (la main qui tremble, la caméra portée, la flamme) : valeur dans [-1, 1] */
function h1(i){ var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
U.bruit = function(t, graine){
  var g = (graine || 0) * 17.31, i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
  return U.lerp(h1(i + g), h1(i + 1 + g), u);
};
U.fbm = function(t, graine, oct){
  var v = 0, a = .5, f = 1, s = 0;
  for(var k = 0; k < (oct || 3); k++){ v += a * U.bruit(t * f, (graine || 0) + k * 7.7); s += a; a *= .5; f *= 2.03; }
  return v / s;
};
/* bruit à deux dimensions (les textures) */
function h2(x, y, g){ var v = Math.sin(x * 127.1 + y * 311.7 + g * 74.7) * 43758.5453; return v - Math.floor(v); }
U.bruit2 = function(x, y, g){
  var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  var a = h2(i, j, g), b = h2(i + 1, j, g), c = h2(i, j + 1, g), d = h2(i + 1, j + 1, g);
  return U.lerp(U.lerp(a, b, ux), U.lerp(c, d, ux), uy);
};
U.fbm2 = function(x, y, g, oct){
  var v = 0, a = .5, f = 1, s = 0;
  for(var k = 0; k < (oct || 4); k++){ v += a * U.bruit2(x * f, y * f, (g || 0) + k * 3.1); s += a; a *= .5; f *= 2.07; }
  return v / s;
};

/* UNE PISTE : des clés [[t, valeur, courbe], …] ; la valeur peut être un nombre ou un objet de nombres (une pose).
   La courbe d'une clé dit comment on ARRIVE sur elle. Entre deux clés, les objets se mélangent champ par champ. */
U.melange = function(a, b, k){
  if(typeof a === 'number') return U.lerp(a, typeof b === 'number' ? b : a, k);
  if(a === null || typeof a !== 'object') return b === undefined ? a : (k > .5 ? b : a);
  if(b !== undefined && (b === null || typeof b !== 'object')) return k > .5 ? b : a;
  var o = {}, x;
  for(x in a) o[x] = (b && x in b) ? U.melange(a[x], b[x], k) : a[x];
  if(b) for(x in b) if(!(x in o)) o[x] = b[x];
  return o;
};
U.piste = function(cles){
  return function(t){
    if(t <= cles[0][0]) return cles[0][1];
    for(var i = 1; i < cles.length; i++){
      if(t <= cles[i][0]){
        var a = cles[i - 1], b = cles[i], k = U.inv(a[0], b[0], t), c = U.COURBES[b[2] || 'io'] || U.COURBES.io;
        return U.melange(a[1], b[1], c(k));
      }
    }
    return cles[cles.length - 1][1];
  };
};
/* une pose de base + des poses clés qui ne disent que ce qui change */
U.poses = function(base, cles){
  var plein = [], cur = base;
  cles.forEach(function(c){ cur = U.melange(cur, c[1], 1); plein.push([c[0], cur, c[2]]); });
  return U.piste(plein);
};

/* un ressort amorti, calculé d'un coup pour un temps donné (une secousse, un rebond) : 0 au départ, oscille, s'éteint */
U.secousse = function(t, t0, force, duree, freq){
  if(t < t0 || t > t0 + duree) return 0;
  var k = (t - t0) / duree;
  return force * Math.sin((t - t0) * (freq || 30)) * Math.pow(1 - k, 2);
};

U.r = function(v){ return Math.round(v * 100) / 100; };
U.deg = function(r){ return r * 180 / Math.PI; };
U.rad = function(d){ return d * Math.PI / 180; };
})();
