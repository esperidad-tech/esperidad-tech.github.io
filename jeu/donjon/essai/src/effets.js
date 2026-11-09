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

/* ---------- les particules (gouttes, éclats de verre, étincelles, touffes) : une seule boucle ---------- */
var parts = [], tourne = false;
function boucle(t){
  var vivantes = [];
  for(var i = 0; i < parts.length; i++){
    var p = parts[i];
    if(p.t0 === null) p.t0 = t;
    var dt = Math.min(.05, (t - (p.dernier || t)) / 1000) * (S.vitesse || 1); p.dernier = t;
    var age = (t - p.t0) / 1000 * (S.vitesse || 1);
    if(age < p.delai){ vivantes.push(p); continue; }
    p.vy += p.g * dt; p.vx *= p.frein; p.vy *= p.frein; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    var k = (age - p.delai) / p.vie;
    if(p.sol && p.y > p.sol){ p.y = p.sol; p.vy *= -.25; p.vx *= .6; }
    var ang = p.oriente ? Math.atan2(p.vy, p.vx) * 180 / Math.PI : p.rot;
    p.e.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) rotate(' + ang.toFixed(1) + 'deg) scale(' + (p.s0 + (p.s1 - p.s0) * Math.min(1, k)).toFixed(2) + ')';
    p.e.style.opacity = k < .6 ? 1 : Math.max(0, 1 - (k - .6) / .4);
    if(k >= 1) p.e.remove(); else vivantes.push(p);
  }
  parts = vivantes;
  if(parts.length) requestAnimationFrame(boucle); else tourne = false;
}
function particule(e, o){
  e.style.position = 'absolute'; e.style.left = '0'; e.style.top = '0'; e.style.willChange = 'transform,opacity';
  (o.calque || L.fx).appendChild(e);
  parts.push({e:e, x:o.x, y:o.y, vx:o.vx || 0, vy:o.vy || 0, g:o.g == null ? 900 : o.g, frein:o.frein || 1, vie:o.vie || .8, delai:o.delai || 0,
    rot:o.rot || 0, vr:o.vr || 0, s0:o.s0 == null ? 1 : o.s0, s1:o.s1 == null ? 1 : o.s1, sol:o.sol, oriente:o.oriente, t0:null});
  e.style.transform = 'translate(' + o.x + 'px,' + o.y + 'px)';
  if(!tourne){ tourne = true; requestAnimationFrame(boucle); }
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
  /* la vignette : un dégradé plein écran dont le trou se resserre sur le rat (pas de grand calque à redessiner) */
  var vig = el('div', 'crit-vignette'); E.appendChild(vig);
  function trou(r, a){ vig.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px,rgba(5,2,10,0) ' + (r * .45) + 'px,rgba(5,2,10,' + (.6 * a) + ') ' + r + 'px,rgba(5,2,10,' + (.93 * a) + ') ' + (r * 1.9) + 'px)'; }
  function serrer(r0, r1, a0, a1, ms){
    return new Promise(function(ok){ var d = null; ms = ms / (S.vitesse || 1);
      function pas(t){ if(d === null) d = t; var k = Math.min(1, (t - d) / ms), e = 1 - Math.pow(1 - k, 3); trou(r0 + (r1 - r0) * e, a0 + (a1 - a0) * e); if(k < 1) requestAnimationFrame(pas); else ok(); }
      requestAnimationFrame(pas); });
  }
  serrer(900, 150, 0, 1, 420);
  monde.style.transformOrigin = x + 'px ' + y + 'px';
  var zoom = anime(monde, [{transform:'scale(1)'}, {transform:'scale(1.17)'}], {duration:440, easing:'cubic-bezier(.2,.8,.3,1)', fill:'forwards'});
  var lents = [];
  try{ if(document.getAnimations) document.getAnimations().forEach(function(a){
    var t = a.effect && a.effect.target;
    if(t && (t === vig || t === monde || (o.exclure && o.exclure.contains(t)))) return;   /* le rat qui gonfle n'est pas ralenti */
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
    var rayons = el('div', 'crit-rayons'); rayons.style.left = x + 'px'; rayons.style.top = y + 'px'; L.fx.appendChild(rayons);
    anime(rayons, [{transform:'translate(-50%,-50%) scale(.4) rotate(0deg)', opacity:0}, {transform:'translate(-50%,-50%) scale(1.3) rotate(12deg)', opacity:1, offset:.18}, {transform:'translate(-50%,-50%) scale(1.65) rotate(40deg)', opacity:0}], {duration:1300, easing:'ease-out'}).then(function(){ rayons.remove(); });
    onde(x, y, '#fff3b0', 420, 480); setTimeout(function(){ onde(x, y, '#ffb030', 640, 700); }, 90);
    tremble(16, 560);
    etincelles(x, y, 44, null, 1.2);
    var flash = el('div', 'crit-eclair'); flash.style.left = x + 'px'; flash.style.top = y + 'px'; L.fx.appendChild(flash);
    anime(flash, [{transform:'translate(-50%,-50%) scale(.2)', opacity:1}, {transform:'translate(-50%,-50%) scale(1.4)', opacity:0}], {duration:380, easing:'ease-out'}).then(function(){ flash.remove(); });
    var t = el('div', 'crit-texte', '<i class="crit-halo"></i><b class="crit-ombre">CRITIQUE !</b><b class="crit-or">CRITIQUE !</b><i class="crit-etoile"></i>');
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

/* la fiole, la flèche… : un vol en ligne droite ou en arc (h), avec rotation (tour) ou orienté selon la trajectoire */
function vol(e, x0, y0, x1, y1, h, ms, tour, oriente){
  ms = ms / (S.vitesse || 1);
  return new Promise(function(ok){
    var d = null;
    function pas(t){
      if(d === null) d = t;
      var k = Math.min(1, (t - d) / ms);
      var x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - h * 4 * k * (1 - k);
      var a = oriente ? Math.atan2((y1 - y0) - h * 4 * (1 - 2 * k), x1 - x0) * 180 / Math.PI : tour * k;
      e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + a.toFixed(1) + 'deg)';
      if(k < 1) requestAnimationFrame(pas); else ok();
    }
    requestAnimationFrame(pas);
  });
}

S.Fx = {init:function(l){ L = l; }, calques:function(){ return L; }, attendre:attendre, anime:anime, particule:particule,
  chiffre:chiffre, mot:mot, bulleTexte:bulleTexte, eclat:eclat, tremble:tremble, onde:onde, etincelles:etincelles,
  eclabousse:eclabousse, flaque:flaque, nuage:nuage, brumeNoire:brumeNoire, critique:critique, vol:vol};
})();
