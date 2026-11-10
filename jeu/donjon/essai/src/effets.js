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

/* Le halo et l'étoile de « CRITIQUE ! », « cuits » en petites images une fois (pendant l'écran du sac) : un dégradé
   repeint dans un calque qui arrive agrandi, ou une étoile découpée (clip-path), coûteraient à chaque image ; en image,
   la carte graphique les déplace seulement. (Les rayons plein écran, la vignette et l'image de choc ont été retirés le
   9 novembre à 16 h 37 : Romain veut un critique qui reste AUTOUR DU RAT.) */
var ETOILE = null, HALO = null, CUITES = [];
function garder(src){ var i = new Image(); i.src = src; if(i.decode) i.decode().catch(function(){}); CUITES.push(i); return src; }
/* une toile -> une image ; la toile est vidée tout de suite (largeur 0) : sur iPhone, Safari compte la mémoire de TOUTES
   les toiles encore vivantes (limite totale de quelques centaines de Mo), même celles qui attendent d'être jetées */
function enImage(cv, ok){
  function vider(){ cv.width = cv.height = 0; }
  try{
    if(cv.toBlob) cv.toBlob(function(b){ if(b) ok(garder(URL.createObjectURL(b))); vider(); });
    else { ok(garder(cv.toDataURL('image/png'))); vider(); }
  }catch(x){ vider(); }
}
function cuireCritique(){
  if(ETOILE !== null) return;
  ETOILE = ''; HALO = '';
  try{
    /* le halo doré derrière « CRITIQUE ! » (dégradé radial doux) : une petite image, sur son propre calque */
    var hc = document.createElement('canvas'); hc.width = 320; hc.height = 120;
    var hg = hc.getContext('2d'); hg.setTransform(160, 0, 0, 60, 160, 60);
    var hr = hg.createRadialGradient(0, 0, 0, 0, 0, 1); hr.addColorStop(0, 'rgba(255,200,60,.55)'); hr.addColorStop(1, 'rgba(255,200,60,0)');
    hg.fillStyle = hr; hg.fillRect(-1, -1, 2, 2);
    enImage(hc, function(u){ HALO = u; });
  }catch(x){ HALO = ''; }
  try{
    var e = document.createElement('canvas'), N = 128, h = N / 2; e.width = e.height = N;
    var ge = e.getContext('2d'), ge2 = ge.createRadialGradient(h, h, 0, h, h, h);
    ge2.addColorStop(0, 'rgba(255,255,255,1)'); ge2.addColorStop(.7, 'rgba(255,255,255,0)');
    var P = [[50, 0], [58, 42], [100, 50], [58, 58], [50, 100], [42, 58], [0, 50], [42, 42]];
    ge.beginPath(); P.forEach(function(p, i){ ge[i ? 'lineTo' : 'moveTo'](p[0] * N / 100, p[1] * N / 100); }); ge.closePath();
    ge.fillStyle = ge2; ge.fill();
    enImage(e, function(u){ ETOILE = u; });
  }catch(x){ ETOILE = ''; }
}
/* ---------- LE CRITIQUE : autour du rat seulement ----------
   x, y : le rat ; n : les dégâts ; exploser : une fonction qui fait éclater le rat (le module du rat) et renvoie une Promise */
function critique(x, y, n, exploser, son, o){
  son = son || function(){};
  o = o || {};
  /* Romain, 9 novembre, 16 h 37 : « il faut rester LOCALISÉ ; tu fais trembler l'écran si tu veux ; de la FUMÉE NOIRE ;
     les MEMBRES du rat éclatent sur le côté, la fumée cache ; pas tout l'écran ; un gros CRITIQUE ». Donc rien ne couvre
     l'écran (ni voile sombre, ni image de choc, ni rayons, ni ralenti général) ; tout se passe autour du rat :
       0 ms        la flèche frappe : le temps se suspend sur LUI (il se fige, gonfle, tremble) — le son « aspire » ;
       CRIT_IMPACT la fumée noire l'enveloppe — l'impact, un petit tremblement, le gros « CRITIQUE ! », le chiffre ;
       CRIT_ECLAT  ses membres jaillissent sur les côtés et retombent dans la fumée — l'explosion, un dernier petit tremblement ;
       puis        la fumée se dissipe lentement et laisse les cendres et les os (≈ 2,5 s en tout).
     Les instants des sons sont ceux de l'atelier des sons (l'impact 0,42 s après l'aspiration, l'explosion 0,6 s après). */
  var v = S.vitesse || 1;
  son('aspire');
  /* le module du rat fait le reste autour de lui (exploser renvoie une Promise : la fumée dissipée) */
  var fin = Promise.resolve(exploser ? exploser({impact:CRIT_IMPACT / v, eclat:CRIT_ECLAT / v}) : null);
  return plus(CRIT_IMPACT).then(function(){
    son('boum');
    tremble(7, 300);
    texteCritique(x, y);
    chiffre(x - 140, y, '−' + n, 'crit');           /* à côté de la fumée, sous « CRITIQUE ! » (il monte sans le toucher) */
    if(o.brume) brumeNoire(x, y, o.brume);          /* sans le module du rat (images fixes) : sa fumée à lui */
    return plus(CRIT_ECLAT - CRIT_IMPACT);
  }).then(function(){
    son('explosion');
    tremble(5, 240);
    return Promise.race([fin, plus(2000)]);
  });
}
var CRIT_IMPACT = 420, CRIT_ECLAT = 1020;
/* le gros « CRITIQUE ! » (Romain l'aime) : il claque au-dessus du rat, dans la moitié droite de la scène, puis s'envole */
function texteCritique(x, y){
  var t = el('div', 'crit-texte', (HALO ? '<img class="crit-halo cuit" alt="" src="' + HALO + '">' : '<i class="crit-halo"></i>') + '<b class="crit-ombre">CRITIQUE !</b><b class="crit-or">CRITIQUE !</b>' +
    (ETOILE ? '<img class="crit-etoile cuit" alt="" src="' + ETOILE + '">' : '<i class="crit-etoile"></i>'));
  t.style.left = '720px'; t.style.top = Math.max(88, y - 190) + 'px';      /* au milieu de la moitié droite (il y tient en entier), au-dessus du chiffre */
  L.ecran.appendChild(t);
  return anime(t, [{transform:'translate(-50%,-50%) scale(1.9) rotate(-8deg)', opacity:0}, {transform:'translate(-50%,-50%) scale(.92) rotate(-3deg)', opacity:1, offset:.08},
    {transform:'translate(-50%,-50%) scale(1.05) rotate(-4deg)', opacity:1, offset:.14}, {transform:'translate(-50%,-50%) scale(1) rotate(-4deg)', opacity:1, offset:.78},
    {transform:'translate(-50%,-62%) scale(1.03) rotate(-4deg)', opacity:0}], {duration:2100, easing:'ease-out'}).then(function(){ t.remove(); });
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

S.Fx = {init:function(l){ L = l; }, cuire:cuireCritique, cuites:function(){ return {etoile:ETOILE, halo:HALO}; }, calques:function(){ return L; }, attendre:attendre, anime:anime, particule:particule,
  chiffre:chiffre, mot:mot, bulleTexte:bulleTexte, eclat:eclat, tremble:tremble, onde:onde, etincelles:etincelles,
  eclabousse:eclabousse, flaque:flaque, nuage:nuage, brumeNoire:brumeNoire, critique:critique, vol:vol};
})();
