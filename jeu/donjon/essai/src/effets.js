/* Les effets de la salle des rats : le critique (tout l'effet d'écran autour de l'explosion du rat), le nuage du fumigène,
   les éclaboussures, les flaques, les étincelles, les chiffres qui volent. Tout se place en coordonnées de scène (960 x 372). */
(function(){
'use strict';
var S = window.SALLE = window.SALLE || {};
var L = {};          /* les calques : fx (au-dessus des acteurs), sol (sous eux), fumee (tout devant), ecran (par-dessus la scène), monde, secousse */
function attendre(ms){ return new Promise(function(ok){ setTimeout(ok, ms / (S.vitesse || 1)); }); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function hasard(a, b){ return a + Math.random() * (b - a); }
function img(nom){ return (S.img && S.img(nom)) || ''; }
function anime(e, images, o){
  /* Web Animations : renvoie une Promise ; sans elle (vieux navigateur), on saute à la fin */
  if(e.animate){ var a = e.animate(images, o); return new Promise(function(ok){ a.onfinish = ok; a.oncancel = ok; }); }
  var f = images[images.length - 1]; for(var k in f) if(k !== 'offset' && k !== 'easing') e.style[k] = f[k];
  return attendre((o.duration || 0) + (o.delay || 0));
}
function plus(t){ return attendre(t); }

/* ---------- les particules (gouttes, éclats de verre, étincelles, touffes) ----------
   Fluidité (jeu/donjon/RAPIDITE.md) : la trajectoire (pesanteur, freinage, rebond au sol) est calculée UNE fois, à la
   création, puis jouée comme une animation (transform / opacity) : la carte graphique la déroule seule, sans aucun calcul
   sur le fil principal à chaque image. */
var PAS = 1 / 60;
function particule(e, o){
  e.style.position = 'absolute'; e.style.left = '0'; e.style.top = '0'; e.style.willChange = 'transform,opacity';
  (o.calque || L.fx).appendChild(e);
  var x = o.x, y = o.y, vx = o.vx || 0, vy = o.vy || 0, g = o.g == null ? 900 : o.g, frein = o.frein || 1, vie = o.vie || .8, rot = o.rot || 0, vr = o.vr || 0;
  var s0 = o.s0 == null ? 1 : o.s0, s1 = o.s1 == null ? 1 : o.s1, n = Math.max(6, Math.round(vie * 30)), cadence = Math.max(1, Math.round(vie / PAS / n));
  var kf = [], pas = 0, total = Math.round(vie / PAS);
  function cle(k, ang){ kf.push({offset:Math.min(1, k), transform:'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + ang.toFixed(1) + 'deg) scale(' + (s0 + (s1 - s0) * Math.min(1, k)).toFixed(2) + ')', opacity:k < .6 ? 1 : Math.max(0, 1 - (k - .6) / .4)}); }
  cle(0, o.oriente ? Math.atan2(vy, vx) * 180 / Math.PI : rot);
  for(pas = 1; pas <= total; pas++){
    vy += g * PAS; vx *= frein; vy *= frein; x += vx * PAS; y += vy * PAS; rot += vr * PAS;
    if(o.sol && y > o.sol){ y = o.sol; vy *= -.25; vx *= .6; }
    if(pas % cadence === 0 || pas === total) cle(pas / total, o.oriente ? Math.atan2(vy, vx) * 180 / Math.PI : rot);
  }
  var v = S.vitesse || 1;
  var a = e.animate(kf, {duration:vie * 1000 / v, delay:(o.delai || 0) * 1000 / v, easing:'linear', fill:'backwards'});
  a.finished.then(function(){ e.remove(); }, function(){ e.remove(); });
}

/* ---------- petits effets ---------- */
function chiffre(x, y, t, cls){
  var c = el('div', 'chiffre' + (cls ? ' ' + cls : ''), t);
  c.style.left = x + 'px'; c.style.top = y + 'px';
  L.fx.appendChild(c); setTimeout(function(){ c.remove(); }, 1300);
}
function mot(x, y, t, cls){
  var c = el('div', 'mot' + (cls ? ' ' + cls : ''), t);
  c.style.left = x + 'px'; c.style.top = y + 'px';
  L.fx.appendChild(c); setTimeout(function(){ c.remove(); }, 900);
}
function bulleTexte(x, y, html, cls){   /* un texte qui reste un peu (le bouclier qui absorbe) */
  var c = el('div', 'fx-texte' + (cls ? ' ' + cls : ''), html);
  c.style.left = x + 'px'; c.style.top = y + 'px';
  L.fx.appendChild(c);
  anime(c, [{opacity:0, transform:'translate(-50%,-30%) scale(.6)'}, {opacity:1, transform:'translate(-50%,-60%) scale(1.08)', offset:.15}, {opacity:1, transform:'translate(-50%,-70%) scale(1)', offset:.8}, {opacity:0, transform:'translate(-50%,-110%)'}], {duration:2200, easing:'ease-out'}).then(function(){ c.remove(); });
}
function eclat(x, y, taille, fond, ms){
  var c = el('div', 'eclat'); c.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + taille + 'px;height:' + taille + 'px;background:' + fond;
  L.fx.appendChild(c);
  anime(c, [{transform:'translate(-50%,-50%) scale(.2)', opacity:1}, {transform:'translate(-50%,-50%) scale(1.6)', opacity:0}], {duration:ms || 500, easing:'ease-out'}).then(function(){ c.remove(); });
}
function tremble(force, ms){
  var s = L.secousse, n = Math.round((ms || 400) / 40), images = [];
  for(var k = 0; k <= n; k++){ var f = force * (1 - k / n); images.push({transform:k === n ? 'none' : 'translate(' + hasard(-f, f).toFixed(1) + 'px,' + hasard(-f * .7, f * .7).toFixed(1) + 'px) rotate(' + hasard(-f * .05, f * .05).toFixed(2) + 'deg)'}); }
  return anime(s, images, {duration:ms || 400});
}
function onde(x, y, coul, taille, ms){
  var o = el('div', 'onde-fx'); o.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + taille + 'px;height:' + taille + 'px;margin:' + (-taille / 2) + 'px 0 0 ' + (-taille / 2) + 'px;border-color:' + coul + ';box-shadow:0 0 18px ' + coul + ',inset 0 0 18px ' + coul;
  L.fx.appendChild(o);
  return anime(o, [{transform:'scale(.08)', opacity:1}, {transform:'scale(1)', opacity:0}], {duration:ms || 520, easing:'cubic-bezier(.1,.7,.3,1)'}).then(function(){ o.remove(); });
}
function etincelles(x, y, n, couleurs, force){
  couleurs = couleurs || ['#fff6c0', '#ffd23f', '#ffb030', '#ffffff'];
  for(var k = 0; k < n; k++){
    var a = hasard(0, Math.PI * 2), v = hasard(260, 620) * (force || 1);
    var e = el('div', 'etincelle-fx'); e.style.background = couleurs[k % couleurs.length]; e.style.boxShadow = '0 0 8px ' + couleurs[k % couleurs.length];
    particule(e, {x:x, y:y, vx:Math.cos(a) * v, vy:Math.sin(a) * v - 120, g:700, frein:.985, vie:hasard(.45, .9), oriente:true, s0:1.2, s1:.4});
  }
}

/* ---------- l'éclaboussure d'une potion : verre brisé, gouttes à sa couleur, un anneau sur le sol ---------- */
function eclabousse(x, y, coul, petite){
  var k = petite ? .55 : 1;
  eclat(x, y, 170 * k, 'radial-gradient(closest-side,' + coul + ',rgba(0,0,0,0))', 420);
  var a = el('div', 'anneau-gouttes'); a.style.cssText = 'left:' + x + 'px;top:' + y + 'px;border-color:' + coul;
  L.fx.appendChild(a);
  anime(a, [{transform:'translate(-50%,-50%) scale(.2,.12)', opacity:1}, {transform:'translate(-50%,-50%) scale(1.5,.9)', opacity:0}], {duration:520, easing:'ease-out'}).then(function(){ a.remove(); });
  for(var i = 0; i < Math.round(18 * k); i++){
    var ang = hasard(-Math.PI * .95, -Math.PI * .05), v = hasard(150, 420);
    var g = el('div', 'goutte-fx'); var s = hasard(5, 12); g.style.width = s + 'px'; g.style.height = s + 'px'; g.style.background = coul; g.style.boxShadow = '0 0 6px ' + coul;
    particule(g, {x:x + hasard(-10, 10), y:y, vx:Math.cos(ang) * v, vy:Math.sin(ang) * v, g:1300, vie:hasard(.5, .8), sol:y + hasard(20, 40), s0:1, s1:.6});
  }
  if(!petite) for(var j = 0; j < 9; j++){
    var ang2 = hasard(0, Math.PI * 2), v2 = hasard(160, 380);
    var v3 = el('div', 'verre-fx');
    particule(v3, {x:x, y:y, vx:Math.cos(ang2) * v2, vy:Math.sin(ang2) * v2 - 160, g:1100, vie:hasard(.45, .75), vr:hasard(-900, 900), sol:y + 34});
  }
}

/* ---------- les flaques au sol (huile, colle) : renvoient une fonction pour les enlever ---------- */
function flaque(type, x, y, w){
  var f = el('div', 'flaque flaque-' + type);
  f.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;margin-left:' + (-w / 2) + 'px';
  if(type === 'colle') f.innerHTML = '<i class="fil" style="left:18%"></i><i class="fil" style="left:33%;animation-delay:-.5s"></i><i class="fil" style="left:52%;animation-delay:-.2s"></i><i class="fil" style="left:68%;animation-delay:-.8s"></i><i class="fil" style="left:82%;animation-delay:-.35s"></i>' +
    '<b style="left:18%;top:30%"></b><b style="left:60%;top:20%;width:9px;height:9px;animation-delay:-.6s"></b><b style="left:80%;top:48%;width:7px;height:7px;animation-delay:-1.1s"></b>';
  else f.innerHTML = '<i class="reflet" style="left:20%;width:30%"></i><i class="reflet" style="left:58%;width:16%;top:58%"></i>';
  L.sol.appendChild(f);
  anime(f, [{transform:'scale(.15,.3)', opacity:0}, {transform:'scale(1.08,1.05)', opacity:1, offset:.7}, {transform:'scale(1)', opacity:1}], {duration:600, easing:'ease-out', fill:'forwards'});
  return function(){ anime(f, [{opacity:1}, {opacity:0, transform:'scale(.9,.8)'}], {duration:1100, easing:'ease-in', fill:'forwards'}).then(function(){ f.remove(); }); };
}

/* ---------- le nuage du fumigène : de grosses volutes gris-bleu qui envahissent la salle, puis se dissipent lentement (~3 s) ---------- */
function nuage(x, y){
  var fond = el('div', 'brume-salle'); L.fumee.appendChild(fond);
  anime(fond, [{opacity:0}, {opacity:.6, offset:.15}, {opacity:.55, offset:.5}, {opacity:0}], {duration:4400, easing:'ease-in-out'}).then(function(){ fond.remove(); });
  var fins = [];
  for(var k = 0; k < 30; k++){
    var b = el('img', 'volute'); b.src = img('fumee-' + 'abc'[k % 3]); b.alt = '';
    var s = hasard(150, 300), tx = hasard(330, 990), ty = hasard(110, 350), rot = hasard(-40, 40), d = hasard(0, 220);
    if(k < 4){ tx = hasard(60, 420); ty = hasard(180, 340); }           /* quelques volutes filent jusqu'aux héros */
    b.style.cssText = 'width:' + s + 'px;height:' + s + 'px;margin:' + (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
    L.fumee.appendChild(b);
    var dx = tx - x, dy = ty - y, op = hasard(.8, .98);
    fins.push(anime(b, [
      {transform:'translate(' + x + 'px,' + y + 'px) scale(.12) rotate(0deg)', opacity:0},
      {transform:'translate(' + (x + dx * .8) + 'px,' + (y + dy * .8) + 'px) scale(.9) rotate(' + rot * .3 + 'deg)', opacity:op * (k < 4 ? .7 : 1), offset:.15},
      {transform:'translate(' + (x + dx * .97) + 'px,' + (y + dy * .97 - 10) + 'px) scale(1.08) rotate(' + rot * .55 + 'deg)', opacity:op * (k < 4 ? .7 : 1), offset:.5},
      {transform:'translate(' + (tx + hasard(-20, 20)) + 'px,' + (ty - hasard(20, 45)) + 'px) scale(1.22) rotate(' + rot * .8 + 'deg)', opacity:op * .6, offset:.72},
      {transform:'translate(' + (tx + hasard(-40, 40)) + 'px,' + (ty - hasard(50, 90)) + 'px) scale(1.4) rotate(' + rot + 'deg)', opacity:0}
    ], {duration:4200 + d, delay:d * .4, easing:'cubic-bezier(.2,.6,.4,1)'}).then((function(b){ return function(){ b.remove(); }; })(b)));
  }
  return {plein:attendre(650), fini:Promise.all(fins)};
}

/* ---------- la brume noire du critique : un GROS nuage qui reste et se dissipe lentement (2 s) ---------- */
function brumeNoire(x, y, nb){
  var fins = [];
  nb = nb || 24;
  for(var k = 0; k < nb; k++){
    var b = el('img', 'volute noire'); b.src = img('brume-' + 'ab'[k % 2]); b.alt = '';
    var s = hasard(150, 300), a = k / nb * Math.PI * 2 + hasard(-.2, .2), r = hasard(10, 105), tx = x + Math.cos(a) * r, ty = y + Math.sin(a) * r * .55, rot = hasard(-60, 60);
    b.style.cssText = 'width:' + s + 'px;height:' + s + 'px;margin:' + (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
    L.fumee.appendChild(b);
    fins.push(anime(b, [
      {transform:'translate(' + x + 'px,' + y + 'px) scale(.1)', opacity:0},
      {transform:'translate(' + tx + 'px,' + ty + 'px) scale(1) rotate(' + rot * .3 + 'deg)', opacity:1, offset:.1},
      {transform:'translate(' + tx + 'px,' + (ty - 12) + 'px) scale(1.12) rotate(' + rot * .5 + 'deg)', opacity:1, offset:.36},
      {transform:'translate(' + (tx + hasard(-20, 20)) + 'px,' + (ty - hasard(30, 60)) + 'px) scale(1.3) rotate(' + rot * .75 + 'deg)', opacity:.7, offset:.65},
      {transform:'translate(' + (tx + hasard(-40, 40)) + 'px,' + (ty - hasard(60, 120)) + 'px) scale(1.55) rotate(' + rot + 'deg)', opacity:0}
    ], {duration:hasard(3000, 3400), easing:'cubic-bezier(.15,.7,.4,1)'}).then((function(b){ return function(){ b.remove(); }; })(b)));
  }
  /* des touffes de poil et des éclats sombres qui partent en étoile */
  for(var j = 0; j < 16; j++){
    var ang = j / 16 * Math.PI * 2, v = hasard(250, 520);
    var t = el('div', 'touffe-fx'); var ts = hasard(10, 22); t.style.width = ts + 'px'; t.style.height = (ts * .6) + 'px';
    particule(t, {x:x, y:y, vx:Math.cos(ang) * v, vy:Math.sin(ang) * v - 200, g:1000, frein:.99, vie:hasard(.6, 1), vr:hasard(-700, 700), sol:356, s0:1, s1:.7});
  }
  return Promise.all(fins);
}

/* la texture de la vignette (512 px, dessinée une seule fois) : transparente au centre, sombre au bord ; affichée sur 2 400 px,
   son trou fait 150 px de rayon (0,45 r transparent, 0,6 à r, 0,93 à 1,9 r et au-delà, comme le dégradé d'avant) */
var VIGNETTE = null;
function texteVignette(){
  if(VIGNETTE) return VIGNETTE;
  try{
    var T = 512, c = document.createElement('canvas'); c.width = c.height = T;
    var g = c.getContext('2d'), k = T / 2400, r = 150 * k, gr = g.createRadialGradient(T / 2, T / 2, 0, T / 2, T / 2, T / 2);
    var f = function(d){ return Math.min(1, d / (T / 2)); };
    gr.addColorStop(0, 'rgba(5,2,10,0)'); gr.addColorStop(f(r * .45), 'rgba(5,2,10,0)'); gr.addColorStop(f(r), 'rgba(5,2,10,.6)'); gr.addColorStop(f(r * 1.9), 'rgba(5,2,10,.93)'); gr.addColorStop(1, 'rgba(5,2,10,.93)');
    g.fillStyle = gr; g.fillRect(0, 0, T, T);
    VIGNETTE = c.toDataURL('image/png');
  }catch(e){ VIGNETTE = ''; }
  return VIGNETTE;
}
/* Les rayons dorés et l'étoile du critique, « cuits » en images une fois (pendant l'écran du sac) : en CSS, le dégradé
   conique masqué (mask-image) et l'étoile découpée (clip-path) obligent la carte graphique à redessiner une surface
   cachée + un masque à CHAQUE image pendant qu'ils tournent et grossissent. En image, elle les déplace seulement.
   Même dessin : rayons tous les 18°, montée de 6° à 8,5°, descente jusqu'à 11°, couleur #ffeca0 ; fondu radial
   (opaque jusqu'à 8 %, 0,85 à 35 %, transparent au bord). Sans canvas : la version CSS (la même, en plus lourd). */
var RAYONS = null, ETOILE = null, CUITES = [];
function garder(src){ var i = new Image(); i.src = src; if(i.decode) i.decode().catch(function(){}); CUITES.push(i); return src; }
function cuireCritique(){
  if(RAYONS !== null) return;
  RAYONS = ''; ETOILE = '';
  /* et les grandes images des effets, décodées d'avance (sinon le premier critique ou le premier nuage hoquette) */
  ['choc-a', 'choc-b', 'fumee-a', 'fumee-b', 'fumee-c', 'brume-a', 'brume-b'].forEach(function(n){ var s = img(n); if(s) garder(s); });
  try{
    var T = 1024, R = T / 2, c = document.createElement('canvas'); c.width = c.height = T;
    var g = c.getContext('2d'), pas = .25;
    g.translate(R, R);
    if(g.createConicGradient){
      var cg = g.createConicGradient(-Math.PI / 2, 0, 0), J = 'rgba(255,236,150,';   /* 0° = en haut, comme conic-gradient */
      cg.addColorStop(0, J + '0)');
      for(var k = 0; k < 20; k++){ var b = k * 18; cg.addColorStop((b + 6) / 360, J + '0)'); cg.addColorStop((b + 8.5) / 360, J + '1)'); cg.addColorStop((b + 11) / 360, J + '0)'); }
      cg.addColorStop(1, J + '0)');
      g.fillStyle = cg; g.fillRect(-R, -R, T, T);
    } else for(var a = 0; a < 360; a += pas){
      var m = a % 18, al = m < 6 ? 0 : m < 8.5 ? (m - 6) / 2.5 : m < 11 ? 1 - (m - 8.5) / 2.5 : 0;
      if(al <= 0) continue;
      var a0 = (a - 90) * Math.PI / 180, a1 = (a + pas - 90) * Math.PI / 180;
      g.fillStyle = 'rgba(255,236,150,' + al.toFixed(3) + ')';
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a1); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = 'destination-in';
    var gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.08, 'rgba(0,0,0,1)'); gr.addColorStop(.35, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(-R, -R, T, T);
    var e = document.createElement('canvas'), N = 128, h = N / 2; e.width = e.height = N;
    var ge = e.getContext('2d'), ge2 = ge.createRadialGradient(h, h, 0, h, h, h);
    ge2.addColorStop(0, 'rgba(255,255,255,1)'); ge2.addColorStop(.7, 'rgba(255,255,255,0)');
    var P = [[50, 0], [58, 42], [100, 50], [58, 58], [50, 100], [42, 58], [0, 50], [42, 42]];
    ge.beginPath(); P.forEach(function(p, i){ ge[i ? 'lineTo' : 'moveTo'](p[0] * N / 100, p[1] * N / 100); }); ge.closePath();
    ge.fillStyle = ge2; ge.fill();
    if(c.toBlob){
      c.toBlob(function(b){ if(b) RAYONS = garder(URL.createObjectURL(b)); });
      e.toBlob(function(b){ if(b) ETOILE = garder(URL.createObjectURL(b)); });
    } else { RAYONS = garder(c.toDataURL('image/png')); ETOILE = garder(e.toDataURL('image/png')); }
  }catch(x){ RAYONS = ''; ETOILE = ''; }
}
/* ---------- LE CRITIQUE : tout l'effet d'écran autour de l'explosion du rat ----------
   x, y : le rat ; n : les dégâts ; exploser : une fonction qui fait éclater le rat (le module du rat) et renvoie une Promise */
function critique(x, y, n, exploser, son, o){
  son = son || function(){};
  o = o || {};
  /* l'ordre : ralenti → image de choc → « CRITIQUE ! » et le rat qui gonfle sous le choc → il éclate (o.boom) et la brume part.
     L'éclatement du module est lourd à dessiner : il doit venir APRÈS l'image de choc, sinon elle resterait figée à l'écran. */
  var boom = null;
  var E = L.ecran, monde = L.monde;
  /* 1) ralenti, vignette qui se resserre, zoom lent vers le rat */
  son('aspire');
  /* la vignette : un trou sombre qui se resserre sur le rat. Fluidité (RAPIDITE.md) : c'est une image (un dégradé dessiné une
     fois) qu'on rétrécit et qu'on fait apparaître (transform / opacity), au lieu d'un dégradé plein écran repeint à chaque image.
     Taille de l'image affichée : 2 400 px pour un trou de 150 px (le rayon r du trou est proportionnel à l'échelle). */
  var vig = el('div', 'crit-vignette'), D = 2400, R0 = 150;
  var vimg = el('img'); vimg.src = texteVignette(); vimg.alt = '';
  vimg.style.cssText = 'position:absolute;left:' + (x - D / 2) + 'px;top:' + (y - D / 2) + 'px;width:' + D + 'px;height:' + D + 'px;max-width:none;will-change:transform,opacity;opacity:0';
  vig.appendChild(vimg); E.appendChild(vig);
  function serrer(r0, r1, a0, a1, ms){
    vimg.style.transform = 'scale(' + (r1 / R0) + ')'; vimg.style.opacity = a1;
    return anime(vimg, [{transform:'scale(' + (r0 / R0) + ')', opacity:a0}, {transform:'scale(' + (r1 / R0) + ')', opacity:a1}], {duration:ms / (S.vitesse || 1), easing:'cubic-bezier(.33,1,.68,1)'});
  }
  serrer(900, 150, 0, 1, 420);
  monde.style.transformOrigin = x + 'px ' + y + 'px';
  var zoom = anime(monde, [{transform:'scale(1)'}, {transform:'scale(1.17)'}], {duration:440, easing:'cubic-bezier(.2,.8,.3,1)', fill:'forwards'});
  var lents = [];
  try{ if(document.getAnimations) document.getAnimations().forEach(function(a){
    var t = a.effect && a.effect.target;
    if(t && (t === vimg || t === monde || (o.exclure && o.exclure.contains(t)))) return;   /* le rat qui gonfle n'est pas ralenti */
    a.playbackRate = .22; lents.push(a);
  }); }catch(e){}
  return plus(420).then(function(){
    /* 2) l'image de choc : deux images très brèves, noir et blanc */
    son('boum');
    lents.forEach(function(a){ try{ a.playbackRate = 1; }catch(e){} });
    var choc = el('img', 'crit-choc'); choc.src = img('choc-a'); choc.alt = ''; choc.style.left = (x - 960) + 'px'; choc.style.top = (y - 540) + 'px'; E.appendChild(choc);
    var t0 = performance.now();
    return plus(60).then(function(){ choc.src = img('choc-b'); return plus(60); }).then(function(){ choc.remove(); (S.mesures = S.mesures || []).push(Math.round(performance.now() - t0)); });
  }).then(function(){
    /* 3) onde de choc, rayons dorés, tremblement, étincelles, « CRITIQUE ! », le chiffre, le rat qui explose, la brume */
    var rayons = RAYONS ? el('img', 'crit-rayons cuit') : el('div', 'crit-rayons'); if(RAYONS){ rayons.src = RAYONS; rayons.alt = ''; }
    rayons.style.left = x + 'px'; rayons.style.top = y + 'px'; L.fx.appendChild(rayons);
    anime(rayons, [{transform:'translate(-50%,-50%) scale(.4) rotate(0deg)', opacity:0}, {transform:'translate(-50%,-50%) scale(1.3) rotate(12deg)', opacity:1, offset:.18}, {transform:'translate(-50%,-50%) scale(1.65) rotate(40deg)', opacity:0}], {duration:1300, easing:'ease-out'}).then(function(){ rayons.remove(); });
    onde(x, y, '#fff3b0', 420, 480); setTimeout(function(){ onde(x, y, '#ffb030', 640, 700); }, 90);
    tremble(16, 560);
    etincelles(x, y, 44, null, 1.2);
    var flash = el('div', 'crit-eclair'); flash.style.left = x + 'px'; flash.style.top = y + 'px'; L.fx.appendChild(flash);
    anime(flash, [{transform:'translate(-50%,-50%) scale(.2)', opacity:1}, {transform:'translate(-50%,-50%) scale(1.4)', opacity:0}], {duration:380, easing:'ease-out'}).then(function(){ flash.remove(); });
    var t = el('div', 'crit-texte', '<i class="crit-halo"></i><b class="crit-ombre">CRITIQUE !</b><b class="crit-or">CRITIQUE !</b>' +
      (ETOILE ? '<img class="crit-etoile cuit" alt="" src="' + ETOILE + '">' : '<i class="crit-etoile"></i>'));
    t.style.left = Math.max(310, Math.min(650, x)) + 'px'; t.style.top = Math.max(110, y - 120) + 'px';
    E.appendChild(t);
    anime(t, [{transform:'translate(-50%,-50%) scale(3.4) rotate(-8deg)', opacity:0}, {transform:'translate(-50%,-50%) scale(.9) rotate(-3deg)', opacity:1, offset:.09},
      {transform:'translate(-50%,-50%) scale(1.06) rotate(-4deg)', opacity:1, offset:.16}, {transform:'translate(-50%,-50%) scale(1) rotate(-4deg)', opacity:1, offset:.75},
      {transform:'translate(-50%,-62%) scale(1.04) rotate(-4deg)', opacity:0}], {duration:1700, easing:'ease-out'}).then(function(){ t.remove(); });
    chiffre(x, y - 50, '−' + n, 'crit');
    /* le rat gonfle maintenant, puis éclate : la brume noire part avec lui */
    boom = Promise.resolve(exploser ? exploser() : null);
    Promise.race([o.boom || plus(450), plus(1200)]).then(function(){ brumeNoire(x, y, o.brume); onde(x, y, '#d8c8f0', 360, 600); tremble(10, 380); });
    return Promise.race([o.boom || plus(450), plus(1200)]).then(function(){ return plus(900); });
  }).then(function(){
    /* 4) on relâche : la vignette s'ouvre, la caméra recule */
    serrer(150, 900, 1, 0, 650).then(function(){ vig.remove(); });
    return anime(monde, [{transform:'scale(1.17)'}, {transform:'scale(1)'}], {duration:600, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards'});
  }).then(function(){
    try{ monde.getAnimations().forEach(function(a){ a.cancel(); }); }catch(e){}
    monde.style.transform = '';
  });
}

/* la fiole, la flèche, la loupe… : un vol en ligne droite ou en arc (h), avec rotation (tour) ou orienté selon la trajectoire.
   La courbe est échantillonnée une fois (24 points) puis jouée par la carte graphique (RAPIDITE.md). */
function vol(e, x0, y0, x1, y1, h, ms, tour, oriente){
  ms = ms / (S.vitesse || 1);
  var kf = [], N = 24;
  for(var i = 0; i <= N; i++){
    var k = i / N, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - h * 4 * k * (1 - k);
    var a = oriente ? Math.atan2((y1 - y0) - h * 4 * (1 - 2 * k), x1 - x0) * 180 / Math.PI : tour * k;
    kf.push({transform:'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + a.toFixed(1) + 'deg)'});
  }
  e.style.willChange = 'transform';
  e.style.transform = kf[N].transform;
  return anime(e, kf, {duration:Math.max(1, ms), easing:'linear'});
}

S.Fx = {init:function(l){ L = l; texteVignette(); }, cuire:cuireCritique, cuites:function(){ return {rayons:RAYONS, etoile:ETOILE}; }, calques:function(){ return L; }, attendre:attendre, anime:anime, particule:particule,
  chiffre:chiffre, mot:mot, bulleTexte:bulleTexte, eclat:eclat, tremble:tremble, onde:onde, etincelles:etincelles,
  eclabousse:eclabousse, flaque:flaque, nuage:nuage, brumeNoire:brumeNoire, critique:critique, vol:vol};
})();
