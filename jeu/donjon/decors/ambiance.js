/* ambiance.js — les petites animations d'ambiance des décors de combat (Les Enquêteurs de Brumeval)

     var a = AMBIANCE.canaux(conteneur);   // ajoute une couche animée par-dessus le décor (sous les personnages)
     a.arreter();                          // arrête tout et retire la couche
     AMBIANCE.ids                          // ['canaux', 'toiles', 'atelier', 'ossuaire', 'bassin', 'egouts', 'crypte']

   Règles de rapidité (Romain, 9 novembre : « tout doit être parfaitement fluide, même sur une vieille tablette ») :
   - au plus 15 éléments par salle, de simples <i> (dégradés CSS ou petit SVG fixe dedans) ;
   - animés UNIQUEMENT en transform et opacity (Web Animations API) : la carte graphique s'en charge, rien n'est repeint ;
   - aucun filtre, aucun flou, aucun mélange de couleurs ;
   - pas de will-change (RAPIDITE.md, R6) : chaque animation transform / opacity crée elle-même son calque ;
   - aucune boucle requestAnimationFrame, et la liste des animations est gardée ici (jamais getAnimations()) ;
   - arreter() annule toutes les animations et retire la couche.
   Le décor (png/ ou webp/) est une grande image : la décoder d'avance (img.decode()) pendant un écran calme (R7).
   La couche fait 960 × 372 (la scène du combat) ; si le conteneur a une autre largeur, elle est mise à l'échelle une fois.
   Les positions suivent les dessins de decors.js (DECORS.REPERES). Si l'appareil demande moins d'animations
   (prefers-reduced-motion), rien n'est ajouté. */
(function(global){
'use strict';
var W = 960, H = 372, NUM = 0;

function rgba(c, a){ c = c.replace('#', ''); return 'rgba(' + [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }).join(',') + ',' + a + ')'; }

function Couche(conteneur, id){
  var c = document.createElement('div');
  c.className = 'amb amb-' + id;
  c.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;overflow:hidden;pointer-events:none;transform-origin:0 0';
  var lw = conteneur.clientWidth;
  if(lw && Math.abs(lw - W) > 1) c.style.transform = 'scale(' + (lw / W) + ')';
  conteneur.appendChild(c);
  this.el = c; this.anims = []; this.n = 0;
}
/* un élément : position, taille, style (et un petit dessin fixe dedans) */
Couche.prototype.i = function(x, y, w, h, style, html){
  if(++this.n > 15) throw new Error('ambiance : plus de 15 éléments');
  var d = document.createElement('i');
  d.style.cssText = 'position:absolute;display:block;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;opacity:0;' + (style || '');
  if(html) d.innerHTML = html;
  this.el.appendChild(d);
  return d;
};
Couche.prototype.anim = function(d, kf, o){
  var a = d.animate(kf, Object.assign({duration: 3000, iterations: Infinity, easing: 'ease-in-out'}, o));
  this.anims.push(a);
  return a;
};
/* une lueur ronde (dégradé radial), qui respire */
Couche.prototype.lueur = function(x, y, w, h, c, o0, o1, dur, delai, s0, s1){
  var d = this.i(x - w / 2, y - h / 2, w, h, 'border-radius:50%;background:radial-gradient(closest-side,' + rgba(c, .9) + ',' + rgba(c, .35) + ' 45%,' + rgba(c, 0) + ')');
  this.anim(d, [{opacity: o0, transform: 'scale(' + (s0 || 1) + ')'}, {opacity: o1, transform: 'scale(' + (s1 || 1) + ')'}], {duration: dur, delay: delai || 0, direction: 'alternate'});
  return d;
};
/* un grain de poussière (ou une spore) qui flotte en descendant doucement */
Couche.prototype.grain = function(x, y, r, c, dx, dy, dur, delai){
  var d = this.i(x - r, y - r, r * 2, r * 2, 'border-radius:50%;background:radial-gradient(closest-side,' + rgba(c, 1) + ',' + rgba(c, 0) + ')');
  this.anim(d, [{opacity: 0, transform: 'translate(0,0)'}, {offset: .25, opacity: .9}, {offset: .75, opacity: .7}, {opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px)'}], {duration: dur, delay: delai || 0, easing: 'linear'});
  return d;
};
/* un rai de lumière qui respire (un polygone fixe dans un SVG ; seule l'opacité bouge) */
Couche.prototype.rai = function(pts, c, o0, o1, dur){
  /* le calque n'a que la taille du rai (pas toute la scène) : moins de mémoire sur la tablette */
  var id = 'amb-g' + (++NUM), xy = pts.split(' ').map(function(p){ return p.split(',').map(Number); });
  var x0 = Math.min.apply(null, xy.map(function(p){ return p[0]; })), x1 = Math.max.apply(null, xy.map(function(p){ return p[0]; }));
  var y0 = Math.min.apply(null, xy.map(function(p){ return p[1]; })), y1 = Math.max.apply(null, xy.map(function(p){ return p[1]; }));
  var w = x1 - x0, h = y1 - y0;
  var d = this.i(x0, y0, w, h, '', '<svg width="' + w + '" height="' + h + '" viewBox="' + x0 + ' ' + y0 + ' ' + w + ' ' + h + '" style="display:block"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity=".55"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs><polygon points="' + pts + '" fill="url(#' + id + ')"/></svg>');
  this.anim(d, [{opacity: o0}, {opacity: o1}], {duration: dur, direction: 'alternate'});
  return d;
};
/* une goutte qui tombe de (x, y0) à (x, y1), puis un rond dans l'eau ; une chute toutes les « dur » ms */
Couche.prototype.goutte = function(x, y0, y1, c, dur, delai, rond){
  var g = this.i(x - 2, y0, 4, 7, 'border-radius:50% 50% 50% 50% / 65% 65% 35% 35%;background:' + rgba(c, .85));
  var t = Math.min(.3, Math.sqrt((y1 - y0) / 980) * 1000 / dur * 1.3);   /* la durée de la chute (gravité, un peu ralentie) */
  this.anim(g, [{offset: 0, transform: 'translateY(0)', opacity: 0}, {offset: .5, transform: 'translateY(0)', opacity: 0}, {offset: .52, transform: 'translateY(0)', opacity: .85, easing: 'cubic-bezier(.4,0,1,1)'},
    {offset: .52 + t, transform: 'translateY(' + (y1 - y0 - 4) + 'px)', opacity: .85}, {offset: .53 + t, transform: 'translateY(' + (y1 - y0 - 4) + 'px)', opacity: 0}, {offset: 1, transform: 'translateY(' + (y1 - y0 - 4) + 'px)', opacity: 0}],
    {duration: dur, delay: delai || 0, easing: 'linear'});
  if(rond){
    var r = this.i(x - 14, y1 - 3.5, 28, 7, 'border-radius:50%;border:1.5px solid ' + rgba(c, .8) + ';box-sizing:border-box');
    this.anim(r, [{offset: 0, transform: 'scale(.2)', opacity: 0}, {offset: .53 + t, transform: 'scale(.2)', opacity: 0}, {offset: .55 + t, transform: 'scale(.3)', opacity: .9}, {offset: Math.min(1, .8 + t), transform: 'scale(1.7)', opacity: 0}, {offset: 1, transform: 'scale(1.7)', opacity: 0}],
      {duration: dur, delay: delai || 0, easing: 'linear'});
  }
};
/* un reflet sur l'eau qui ondule */
Couche.prototype.reflet = function(x, y, w, c, dur, delai){
  var d = this.i(x, y, w, 2, 'border-radius:2px;background:' + rgba(c, .9));
  this.anim(d, [{opacity: .1, transform: 'translateX(0) scaleX(.5)'}, {opacity: .7, transform: 'translateX(5px) scaleX(1.15)'}, {opacity: .15, transform: 'translateX(10px) scaleX(.6)'}], {duration: dur, delay: delai || 0, direction: 'alternate'});
};
/* une luciole qui se promène */
Couche.prototype.luciole = function(x, y, c, chemin, dur, delai){
  var d = this.i(x - 6, y - 6, 12, 12, 'border-radius:50%;background:radial-gradient(closest-side,' + rgba('#ffffff', 1) + ',' + rgba(c, .8) + ' 30%,' + rgba(c, 0) + ')');
  var kf = chemin.map(function(p, k){ return {transform: 'translate(' + p[0] + 'px,' + p[1] + 'px)', opacity: k % 2 ? .3 : .95}; });
  kf.push({transform: 'translate(0,0)', opacity: .95});
  kf[0].transform = 'translate(0,0)';
  this.anim(d, kf, {duration: dur, delay: delai || 0});
};
Couche.prototype.arreter = function(){
  this.anims.forEach(function(a){ try { a.cancel(); } catch(e){} });
  this.anims = [];
  if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
};

function moinsDeMouvement(){ try { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } }

var SALLES = {
  /* l'eau du canal qui ondule, deux gouttes de la voûte, une feuille qui dérive, le rai de la grille qui respire */
  canaux: function(a){
    a.rai('604,0 646,0 760,340 530,340', '#d8fff0', .1, .55, 4200);
    [[560, 361, 26, 0], [622, 365, 20, 900], [690, 360, 30, 1700], [300, 366, 22, 600]].forEach(function(r){ a.reflet(r[0], r[1], r[2], '#c8fff0', 2800 + r[3], r[3]); });
    a.goutte(300, 0, 360, '#c8fff0', 5200, 0, true);
    a.goutte(862, 0, 362, '#c8fff0', 6400, 2300, true);
    var f = a.i(-24, 358, 14, 7, 'opacity:1', '<svg width="14" height="7" viewBox="0 0 14 7" style="display:block"><path d="M1 3.5 C 4 0 10 0 13 3.5 C 10 7 4 7 1 3.5 Z" fill="#3a7a40" stroke="#24182e" stroke-width="1"/><path d="M2 3.5 H 12" stroke="#7ab070" stroke-width=".8"/></svg>');
    a.anim(f, [{transform: 'translate(0,0) rotate(-8deg)'}, {transform: 'translate(250px,-1px) rotate(6deg)'}, {transform: 'translate(500px,1px) rotate(-6deg)'}, {transform: 'translate(750px,-1px) rotate(5deg)'}, {transform: 'translate(1010px,0) rotate(-8deg)'}], {duration: 42000, easing: 'linear'});
    a.grain(612, 120, 1.6, '#e8fff8', 24, 130, 9000, 0);
    a.grain(640, 60, 1.3, '#e8fff8', 30, 150, 11000, 4000);
  },
  /* les œufs et le cristal qui palpitent, un petit cocon qui se balance, des spores, la rosée qui scintille */
  toiles: function(a){
    a.rai('630,0 652,0 740,340 560,340', '#efe6ff', .1, .45, 4600);
    a.lueur(52, 320, 120, 84, '#c088ff', .15, .7, 3200, 0, .95, 1.05);
    a.lueur(906, 318, 120, 84, '#c088ff', .15, .7, 3600, 1300, .95, 1.05);
    a.lueur(470, 318, 90, 64, '#c8a8ff', .2, .8, 2400, 500, .9, 1.08);
    var c = a.i(414, 0, 12, 74, 'opacity:1;transform-origin:50% 0', '<svg width="12" height="74" viewBox="0 0 12 74" style="display:block"><path d="M6 0 V 46" stroke="#ddd4ee" stroke-width="1" opacity=".6"/><path d="M6 46 C 11 49 11 68 6 72 C 1 68 1 49 6 46 Z" fill="#c4bcd0" stroke="#24182e" stroke-width="1.6"/><path d="M3 54 Q 6 56 9 54 M3 60 Q 6 62 9 60 M3.5 66 Q 6 68 8.5 66" stroke="#8a8098" stroke-width="1" fill="none"/></svg>');
    a.anim(c, [{transform: 'rotate(-7deg)'}, {transform: 'rotate(7deg)'}], {duration: 3400, direction: 'alternate'});
    a.grain(640, 90, 1.5, '#f4eeff', -20, 160, 10000, 0);
    a.grain(660, 40, 1.2, '#f4eeff', 16, 180, 12000, 3500);
    a.grain(600, 200, 1.4, '#f4eeff', 24, 110, 9000, 7000);
    [[176, 112, 0], [800, 92, 2100], [520, 60, 3900]].forEach(function(e){
      var d = a.i(e[0] - 4, e[1] - 4, 8, 8, 'border-radius:50%;background:radial-gradient(closest-side,#fff,rgba(255,255,255,0))');
      a.anim(d, [{offset: 0, opacity: 0, transform: 'scale(.3)'}, {offset: .85, opacity: 0, transform: 'scale(.3)'}, {offset: .92, opacity: 1, transform: 'scale(1.3)'}, {offset: 1, opacity: 0, transform: 'scale(.3)'}], {duration: 5200, delay: e[2], easing: 'linear'});
    });
  },
  /* les runes du sceau et du pilier qui palpitent (une vague qui monte), de la vapeur à la vanne, la poussière du rai */
  atelier: function(a){
    a.rai('392,66 418,66 520,340 352,340', '#ffd8a0', .15, .5, 3800);
    a.lueur(330, 64, 96, 96, '#7ff0ff', .05, .5, 3000, 0, .92, 1.06);
    [[470, 260, 0], [470, 200, 400], [470, 140, 800]].forEach(function(r){ a.lueur(r[0], r[1], 46, 46, '#7ff0ff', .05, .75, 1600, r[2], .9, 1.1); });
    a.lueur(405, 66, 70, 62, '#ffc070', .3, .7, 2600, 300);
    a.lueur(34, 326, 40, 34, '#ffa030', .15, .85, 1900, 0, .85, 1.1);
    [0, 1700].forEach(function(t){
      var d = a.i(930, 214, 28, 28, 'border-radius:50%;background:radial-gradient(closest-side,rgba(240,232,220,.55),rgba(240,232,220,0))');
      a.anim(d, [{transform: 'translate(0,0) scale(.4)', opacity: 0}, {offset: .2, opacity: .6}, {transform: 'translate(-26px,-64px) scale(1.7)', opacity: 0}], {duration: 3400, delay: t, easing: 'ease-out'});
    });
    a.grain(404, 110, 1.6, '#ffe8c0', 18, 150, 8000, 0);
    a.grain(420, 160, 1.3, '#ffe8c0', 30, 130, 9500, 3000);
    a.grain(396, 220, 1.5, '#ffe8c0', 22, 100, 7000, 5500);
  },
  /* les bougies qui vacillent, la poussière dorée, et parfois… les yeux d'un crâne qui luisent un instant */
  ossuaire: function(a){
    a.rai('462,0 500,0 580,340 400,340', '#fff0d4', .1, .45, 4400);
    [[146, 71, 0], [750, 71, 400], [932, 71, 900]].forEach(function(b){
      var d = a.i(b[0] - 20, b[1] - 18, 40, 36, 'border-radius:50%;background:radial-gradient(closest-side,rgba(255,200,120,.75),rgba(255,180,90,.25) 45%,rgba(255,180,90,0))');
      a.anim(d, [{opacity: .55, transform: 'scale(1)'}, {opacity: .95, transform: 'scale(1.1)'}, {opacity: .65, transform: 'scale(.95)'}, {opacity: .9, transform: 'scale(1.06)'}, {opacity: .6, transform: 'scale(1)'}], {duration: 1500 + b[2] / 3, delay: b[2], easing: 'linear'});
    });
    [[470, 60, 0], [490, 140, 2500], [460, 200, 5000], [500, 30, 7000]].forEach(function(g){ a.grain(g[0], g[1], 1.5, '#ffe8b8', 20, 120, 10000, g[2]); });
    [[224, 72, 0], [736, 72, 6500]].forEach(function(y){
      var d = a.i(y[0] - 8, y[1] - 3, 16, 6, 'background:radial-gradient(circle at 25% 50%,rgba(255,226,140,.95) 0,rgba(255,226,140,0) 3px),radial-gradient(circle at 75% 50%,rgba(255,226,140,.95) 0,rgba(255,226,140,0) 3px)');
      a.anim(d, [{offset: 0, opacity: 0}, {offset: .82, opacity: 0}, {offset: .86, opacity: .9}, {offset: .93, opacity: .9}, {offset: .97, opacity: 0}, {offset: 1, opacity: 0}], {duration: 13000, delay: y[2], easing: 'linear'});
    });
  },
  /* le lotus qui luit, deux gouttes et leurs ronds, des reflets d'argent, des lucioles, la poussière du grand rai */
  bassin: function(a){
    a.rai('650,0 760,0 900,330 540,330', '#dff2ff', .12, .5, 5200);
    a.lueur(504, 252, 96, 50, '#ffc8e0', .25, .85, 3400, 0, .92, 1.08);
    a.goutte(514, 64, 300, '#dff2ff', 4800, 0, true);
    a.goutte(944, 72, 286, '#dff2ff', 6200, 2600, true);
    [[450, 256, 18, 0], [470, 282, 24, 800], [920, 300, 22, 1500], [690, 304, 34, 400]].forEach(function(r){ a.reflet(r[0], r[1], r[2], '#e8f4ff', 3000 + r[3], r[3]); });
    a.luciole(478, 210, '#c8ffdc', [[0, 0], [16, -20], [34, -6], [18, 14], [-6, 8]], 8000, 0);
    a.luciole(300, 170, '#c8ffdc', [[0, 0], [-18, 12], [-30, -10], [-8, -24], [10, -8]], 9500, 1500);
    a.luciole(910, 214, '#c8ffdc', [[0, 0], [-20, -16], [-6, -34], [14, -18], [6, 6]], 8800, 3000);
    a.grain(700, 60, 1.6, '#f4fbff', -20, 160, 9000, 0);
    a.grain(740, 120, 1.4, '#f4fbff', 26, 150, 11000, 4000);
  },
  /* le filet d'eau qui scintille et ses gouttes, le courant de la rigole, la flèche phosphorescente, une goutte de boue */
  egouts: function(a){
    a.rai('640,0 668,0 760,340 590,340', '#f0ffc8', .1, .45, 4000);
    var f = a.i(468, 146, 3, 206, 'background:linear-gradient(rgba(232,255,224,.7),rgba(232,255,224,.3))');
    a.anim(f, [{opacity: .2}, {opacity: .65}], {duration: 600, direction: 'alternate'});
    [0, 550].forEach(function(t){
      var d = a.i(467.5, 146, 5, 7, 'border-radius:50% 50% 50% 50% / 65% 65% 35% 35%;background:rgba(232,255,224,.85)');
      a.anim(d, [{transform: 'translateY(0)', opacity: 0}, {offset: .1, opacity: .9}, {offset: .95, opacity: .9}, {transform: 'translateY(206px)', opacity: 0}], {duration: 1100, delay: t, easing: 'cubic-bezier(.4,0,1,1)'});
    });
    var r = a.i(458, 356, 24, 6, 'border-radius:50%;border:1.5px solid rgba(232,255,224,.8);box-sizing:border-box');
    a.anim(r, [{transform: 'scale(.3)', opacity: .9}, {transform: 'scale(1.5)', opacity: 0}], {duration: 550, easing: 'ease-out'});
    [[40, 355, 0], [380, 359, 1300], [700, 356, 2500]].forEach(function(c){
      var d = a.i(c[0], c[1], 22, 2, 'border-radius:2px;background:rgba(200,224,140,.8)');
      a.anim(d, [{transform: 'translateX(0)', opacity: 0}, {offset: .2, opacity: .6}, {offset: .8, opacity: .6}, {transform: 'translateX(220px)', opacity: 0}], {duration: 3800, delay: c[2], easing: 'linear'});
    });
    a.lueur(700, 150, 130, 56, '#d4ff6a', .1, .7, 2600);
    a.goutte(622, 116, 340, '#d4ff6a', 5600, 1200, false);
  },
  /* la poussière dorée qui tombe dans le rai, la lumière qui respire, un éclat d'or sur le couvercle */
  crypte: function(a){
    a.rai('470,0 502,0 576,304 396,304', '#fff0d0', .12, .5, 5000);
    a.lueur(480, 258, 170, 34, '#fff0d0', .25, .6, 4600, 800);
    [[478, 30, 0, 14], [490, 90, 1800, -18], [470, 150, 3600, 20], [500, 40, 5200, -10], [484, 200, 6800, 16], [466, 110, 8400, -22], [496, 160, 2700, 12]].forEach(function(g){ a.grain(g[0], g[1], 1.5, '#ffe8c0', g[3], 90, 11000, g[2]); });
    var e = a.i(501, 242, 14, 14, '', '<svg width="14" height="14" viewBox="0 0 14 14" style="display:block"><path d="M7 0 L 8 6 L 14 7 L 8 8 L 7 14 L 6 8 L 0 7 L 6 6 Z" fill="#fff4c8"/></svg>');
    a.anim(e, [{offset: 0, opacity: 0, transform: 'scale(.3) rotate(0deg)'}, {offset: .78, opacity: 0, transform: 'scale(.3) rotate(0deg)'}, {offset: .86, opacity: 1, transform: 'scale(1.2) rotate(45deg)'}, {offset: .94, opacity: 0, transform: 'scale(.3) rotate(90deg)'}, {offset: 1, opacity: 0, transform: 'scale(.3) rotate(90deg)'}], {duration: 6500, delay: 1500, easing: 'linear'});
  }
};

var AMBIANCE = {ids: Object.keys(SALLES)};
Object.keys(SALLES).forEach(function(id){
  AMBIANCE[id] = function(conteneur){
    if(moinsDeMouvement()) return {arreter: function(){}, elements: 0};
    var a = new Couche(conteneur, id);
    SALLES[id](a);
    return {arreter: function(){ a.arreter(); }, elements: a.n, couche: a.el};
  };
});
global.AMBIANCE = AMBIANCE;
})(typeof window !== 'undefined' ? window : this);
