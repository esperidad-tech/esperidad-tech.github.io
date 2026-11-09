/* ============ les nouvelles armes (CONCEPTION-DONJON.md §6 et §10) ============
   Tout est sans filtre ; les vols sont calculés d'avance et joués par la carte graphique (vol2), la traînée est semée
   toutes les 40 ms (pas à chaque image) ; au plus une vingtaine de particules à la fois. */

/* ---------- le Pisteur : flèches d'argent, lourdes, de givre, d'acide, et la flèche qui rebondit ---------- */
var FL2 = {argent:1, lourde:1, givre:1, acide:1};
/* le recul de l'arc (flèche lourde) : tout le corps est repoussé, un souffle d'air part de l'arc */
H._recul = function(){
  this.boite.animate([{transform:'translateX(0px)'}, {transform:'translateX(-12px)', offset:.18, easing:'cubic-bezier(.2,.8,.4,1)'}, {transform:'translateX(0px)'}], {duration:520, easing:'ease-out'});
  var p = this.rep('poignee'), F2 = this.fx;
  lueurFx(F2, p.x + 6, p.y, {c:'#ffffff', c2:'#e8e0d0', w:60, s0:.3, s1:1.6, d:320, o0:.8});
  pluie(F2, p.x + 10, p.y, {n:6, forme:'trait', c:['#ffffff', '#e8e0d0'], angle:0, ecart:40, v0:120, v1:240, g:0, t0:10, t1:18, d0:200, d1:320});
};
H._fleche2 = function(scene, n, t, to, type, opt){
  var L = couche(scene), len = Math.hypot(t.x - n.x, t.y - n.y), k = len / 124, me = this, lourd = type === 'lourde';
  var w = div(L, 'width:1px;height:1px;z-index:3');
  var coul = {argent:'rgba(225,238,255,.9)', lourde:'rgba(210,200,190,.55)', givre:'rgba(190,236,255,.85)', acide:'rgba(140,230,90,.7)', feu:'rgba(255,150,50,.75)', huile:'rgba(90,70,40,.5)', colle:'rgba(230,245,210,.7)'}[type] || 'rgba(255,250,220,.6)';
  var ep = (lourd ? 8 : 5) * k;
  var tr = div(w, 'left:' + r1(-len - 70 * k) + 'px;top:' + r1(-ep / 2) + 'px;width:' + r1(len * .9) + 'px;height:' + r1(ep) + 'px;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,0),' + coul + ')');
  tr.style.transform = 'none';
  var a = div(w, 'left:' + r1(-len - 14 * k) + 'px;top:' + r1(-16 * k) + 'px;width:' + r1(150 * k) + 'px;height:' + r1(32 * k) + 'px', FLECHE_SVG(type));
  a.style.transform = 'none';
  var dist = Math.hypot(to.x - t.x, to.y - t.y), D = Math.max(220, Math.min(560, dist / 1.5)) * (lourd ? 1.18 : 1);
  return vol2(w, t, to, {d:D, haut:dist * (lourd ? .035 : .06), pas:40, chaque:function(p, ang, u){
    var ca = Math.cos(ang / DEG), sa = Math.sin(ang / DEG), bx = p.x - ca * len * .5, by = p.y - sa * len * .5;
    if(type === 'argent'){
      pluie(L, bx + alea(-6, 6), by + alea(-4, 4), {n:1, forme:'etoile', c:['#ffffff', '#dfe7f2', '#bfd4ff'], angle:ang + 180, ecart:30, v0:5, v1:30, g:20, t0:9, t1:14, d0:380, d1:560});
      if(u > .2) pluie(L, p.x - ca * 20, p.y - sa * 20, {n:1, forme:'lueur', c:'#dfe7f2', angle:ang + 180, ecart:40, v0:10, v1:40, g:0, t0:2, t1:3, d0:260, d1:380});
    } else if(type === 'lourde'){
      pluie(L, bx, by + alea(-5, 5), {n:1, forme:'trait', c:['#ffffff', '#e8e0d0'], angle:ang + 180, ecart:6, v0:30, v1:70, g:0, t0:14, t1:24, d0:200, d1:300, o0:.8});
    } else if(type === 'givre'){
      pluie(L, bx + alea(-8, 8), by, {n:1, forme:'flocon', c:['#ffffff', '#cfefff'], angle:90, ecart:30, v0:10, v1:30, g:60, t0:8, t1:12, d0:500, d1:700});
      if(u > .15) pluie(L, p.x - ca * 10, p.y - sa * 10, {n:1, forme:'lueur', c:'#bfeaff', angle:ang + 180, ecart:30, v0:10, v1:30, g:0, t0:2, t1:3, d0:260, d1:380});
    } else if(type === 'acide'){
      if(u > .1) pluie(L, p.x - ca * 6, p.y + 4, {n:1, forme:'goutte', c:['#7ae04a', '#a6f070'], angle:90, ecart:15, v0:10, v1:40, g:700, t0:5, t1:7, d0:400, d1:550});
      if(u > .3 && Math.random() < .35) lueurFx(L, bx, by - 4, {c:'#c8e8b0', c2:'#8ab878', w:16, s0:.6, s1:2.2, dy:-10, d:600, o0:.5});
    } else if(u > .05 && Math.random() < .6) pluie(L, bx, by, {n:1, c:'#fff6d0', angle:ang + 180, ecart:20, v0:10, v1:40, g:0, t0:2, t1:3, d0:200, d1:350});
  }}).then(function(r){
    if(opt.rebond) me._rebondFleche(L, r, type, w, a, tr, k, opt, to);
    else me._impactFleche2(L, r, type, w, a, tr, k, to);
    if(opt.onImpact) try { opt.onImpact(r); } catch(e){ console.error(e); }
    return r;
  });
};
/* la flèche plantée qui vibre (plus fort, plus longtemps et plus profond pour la lourde) */
function planter(w, tr, r, lourd, k){
  tr.animate([{opacity:1}, {opacity:0}], {duration:120, fill:'forwards'});
  var ang = r.ang, ca = Math.cos(ang / DEG), sa = Math.sin(ang / DEG), x = r.x + (lourd ? ca * 10 * k : 0), y = r.y + (lourd ? sa * 10 * k : 0), A = lourd ? 1.8 : 1;
  w.animate([{transform:place(r.x, r.y, ang)}, {transform:place(x + 2, y, ang - 6 * A)}, {transform:place(x + 1, y, ang + 4 * A)}, {transform:place(x + 1, y, ang - 2.5 * A)}, {transform:place(x + 1, y, ang + 1.2 * A)}, {transform:place(x + 1, y, ang)}], {duration:lourd ? 520 : 360, fill:'forwards'});
  w.animate([{opacity:1}, {opacity:1, offset:.78}, {opacity:0}], {duration:lourd ? 1300 : 900, fill:'forwards'}).finished.then(function(){ w.remove(); });
}
/* un flocon de neige géant / un cristal de glace / une étoile d'argent (dessins d'impact) */
function floconSvg(c){
  var b = '';
  for(var i = 0; i < 6; i++) b += '<g transform="rotate(' + (i * 60) + ')"><path d="M0 0 L 0 -40 M0 -16 L -9 -25 M0 -16 L 9 -25 M0 -28 L -6 -34 M0 -28 L 6 -34" stroke="#24182e" stroke-width="6" stroke-linecap="round" opacity=".5"/><path d="M0 0 L 0 -40 M0 -16 L -9 -25 M0 -16 L 9 -25 M0 -28 L -6 -34 M0 -28 L 6 -34" stroke="' + c + '" stroke-width="3.2" stroke-linecap="round"/></g>';
  return '<svg viewBox="-46 -46 92 92" style="width:100%;height:100%;display:block;overflow:visible"><circle r="30" fill="#bfeaff" opacity=".35"/>' + b + '<circle r="6" fill="#ffffff"/></svg>';
}
function cristauxSvg(){
  var s = '';
  [[-30, 34, 9], [-12, 44, 11], [8, 40, 10], [26, 30, 8], [-48, 22, 7], [44, 20, 7]].forEach(function(c){
    s += '<g transform="rotate(' + c[0] + ')"><path d="M' + (-c[2] / 2) + ' 0 L 0 ' + (-c[1]) + ' L ' + (c[2] / 2) + ' 0 Z" fill="#e8f8ff" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/><path d="M0 ' + (-c[1] + 4) + ' L ' + (c[2] / 4) + ' -2" stroke="#ffffff" stroke-width="1.6"/><path d="M0 ' + (-c[1]) + ' L ' + (c[2] / 2) + ' 0 L 0 0 Z" fill="#9ad8ff" opacity=".45"/></g>';
  });
  return '<svg viewBox="-60 -60 120 70" style="width:100%;height:100%;display:block;overflow:visible">' + s + '</svg>';
}
function etoileArgentSvg(){
  return '<svg viewBox="-60 -60 120 120" style="width:100%;height:100%;display:block;overflow:visible"><circle r="26" fill="#eef4ff" opacity=".35"/>' +
    '<path d="M0 -58 L 8 -8 L 58 0 L 8 8 L 0 58 L -8 8 L -58 0 L -8 -8 Z" fill="#f4f8ff" stroke="#8a9ab8" stroke-width="2"/><path d="M0 -30 L 5 -5 L 30 0 L 5 5 L 0 30 L -5 5 L -30 0 L -5 -5 Z" fill="#ffffff" transform="rotate(45)"/><circle r="8" fill="#ffffff"/></svg>';
}
H._impactFleche2 = function(L, r, type, w, a, tr, k, to){
  var x = r.x, y = r.y, ang = r.ang, lourd = type === 'lourde';
  planter(w, tr, r, lourd, k);
  if(type === 'argent'){
    surgit(L, x, y, 120, 120, etoileArgentSvg(), {d:560, s1:1.5});
    lueurFx(L, x, y, {c:'#ffffff', c2:'#dfe7f2', w:90, s0:.3, s1:1.5, d:420});
    anneau(L, x, y, {c:'#e6eef8', w:60, s0:.3, s1:2.4, d:560});
    pluie(L, x, y, {n:10, forme:'etoile', c:['#ffffff', '#dfe7f2', '#bfd4ff'], v0:60, v1:180, g:120, t0:8, t1:14, d0:500, d1:850});
    pluie(L, x, y, {n:8, forme:'trait', c:['#ffffff', '#e6eef8'], angle:ang + 180, ecart:70, v0:120, v1:260, g:200, t0:8, t1:14, d0:220, d1:400});
  } else if(lourd && to && to.metal){
    /* sur du métal : une gerbe d'étincelles, CLANG ! */
    lueurFx(L, x, y, {c:'#ffffff', c2:'#ffe08a', w:100, s0:.3, s1:1.4, d:300});
    surgit(L, x, y, 90, 90, chocSvg('#fff2a0', '#ffffff'), {d:360, r:10, s1:1.3});
    pluie(L, x, y, {n:16, forme:'trait', c:['#ffffff', '#fff6c0', '#ffd36a', '#ff9a3a'], angle:ang + 180, ecart:75, v0:160, v1:380, g:700, t0:10, t1:18, d0:300, d1:600});
    pluie(L, x, y, {n:5, forme:'lueur', c:'#ffb040', angle:ang + 180, ecart:60, v0:80, v1:180, g:600, t0:2.5, t1:3.5, d0:500, d1:800});
    anneau(L, x, y, {c:'#fff6c0', w:56, s0:.3, s1:2.2, d:420});
    mot(L, x + 20, y - 40, 'CLANG !', {t:28, r:-8, c:'#e8eef8', lueur:'rgba(255,220,140,.7)', monte:26, d:950});
  } else if(lourd){
    /* sur de la chair, du bois, de la pierre : un impact sourd, de la poussière, des éclats */
    surgit(L, x, y, 70, 70, chocSvg('#e8dcc8', '#fff8ec', 8), {d:340, r:6, s1:1.2});
    for(var i = 0; i < 3; i++) lueurFx(L, x + alea(-10, 10), y + alea(-8, 8), {c:'#d8ccbc', c2:'#a89888', w:alea(36, 50), s0:.4, s1:2.2, dx:alea(-24, 4), dy:-10, d:alea(600, 800), retard:i * 40, o0:.85});
    pluie(L, x, y, {n:9, forme:'eclat', c:['#8a7a6a', '#b8a898', '#5a4a3e'], angle:ang + 180, ecart:70, v0:90, v1:200, g:700, t0:5, t1:8, d0:400, d1:650});
    anneau(L, x, y, {c:'#e8dccc', w:60, s0:.3, s1:1.8, d:420});
  } else if(type === 'givre'){
    surgit(L, x, y, 84, 84, floconSvg('#e8f8ff'), {d:640, s1:1.4});
    lueurFx(L, x, y, {c:'#ffffff', c2:'#9ad8ff', w:100, s0:.3, s1:1.5, d:480});
    anneau(L, x, y, {c:'#bfeaff', w:60, s0:.3, s1:2.4, d:600});
    pluie(L, x, y, {n:12, forme:'eclat', c:['#eaf8ff', '#bfeaff', '#7fd8ff'], v0:80, v1:220, g:500, t0:6, t1:10, d0:450, d1:750});
    pluie(L, x, y - 10, {n:5, forme:'flocon', c:['#ffffff', '#cfefff'], v0:20, v1:60, g:40, t0:10, t1:15, d0:800, d1:1200, etale:200});
    surgit(L, x, y + 8, 56, 32, cristauxSvg(), {d:1100, k:[{transform:place(x, y + 4, 0, .2), opacity:0}, {transform:place(x, y + 4, 0, 1.05), opacity:1, offset:.15}, {transform:place(x, y + 4, 0, 1), opacity:1, offset:.75}, {transform:place(x, y + 8, 0, .9), opacity:0}]});
  } else if(type === 'acide'){
    lueurFx(L, x, y, {c:'#eaffd0', c2:'#7ae04a', w:80, h:64, s0:.3, s1:1.5, d:520});
    pluie(L, x, y, {n:12, forme:'goutte', c:['#7ae04a', '#a6f070', '#5ac83a'], angle:-90, ecart:85, v0:80, v1:200, g:700, t0:5, t1:8, d0:450, d1:750});
    for(var j = 0; j < 4; j++) lueurFx(L, x + alea(-14, 14), y - 8 - j * 6, {c:'#d8ecc8', c2:'#9ab88a', w:28, s0:.5, s1:2.6, dx:alea(-10, 10), dy:-40, d:1100, retard:120 + j * 110, o0:.7});
    pluie(L, x, y, {n:5, c:'#c8ff9a', bord:true, angle:-90, ecart:40, v0:20, v1:60, g:-60, t0:3, t1:5, d0:700, d1:1000, etale:400});
  }
};
/* la flèche qui REBONDIT (ennemi immunisé) : TING, elle ricoche, tournoie, retombe au sol devant lui et y reste un instant */
H._rebondFleche = function(L, r, type, w, a, tr, k, opt, to){
  tr.animate([{opacity:1}, {opacity:0}], {duration:100, fill:'forwards'});
  var metal = to && to.metal, len = 124 * k, ca = Math.cos(r.ang / DEG), sa = Math.sin(r.ang / DEG);
  lueurFx(L, r.x, r.y, {c:'#ffffff', c2:metal ? '#ffe08a' : '#fff6d0', w:60, s0:.3, s1:1.4, d:280});
  pluie(L, r.x, r.y, {n:metal ? 12 : 8, forme:'trait', c:['#ffffff', '#fff6c0', '#ffd36a'], angle:r.ang + 180, ecart:70, v0:140, v1:300, g:500, t0:8, t1:14, d0:220, d1:420});
  mot(L, r.x + 6, r.y - 34, 'TING !', {t:20, r:-10, c:'#fff6c0', monte:20, d:800});
  /* la flèche, recentrée sur son milieu, rebondit vers l'arrière (trajectoire calculée d'avance) */
  a.style.left = r1(-len / 2 - 14 * k) + 'px';
  var x = r.x - ca * len / 2, y = r.y - sa * len / 2, sol = opt.sol !== undefined ? opt.sol : r.y + 92;
  var vx = -alea(130, 190), vy = -alea(240, 300), ang = r.ang, va = -alea(820, 1080), dt = 1 / 60, t = 0, kf = [], rebonds = 0;
  kf.push({t:0, x:x, y:y, a:ang});
  while(t < 2.2 && rebonds < 2){
    t += dt; vy += 1100 * dt; x += vx * dt; y += vy * dt; ang += va * dt;
    if(y > sol - 3){ y = sol - 3; rebonds++; vy = -vy * .28; vx *= .45; va *= .25; if(rebonds === 2){ var cible = Math.round((ang - 180) / 180) * 180 + 180; ang = cible - 5; } }
    if(Math.round(t / dt) % 3 === 0 || rebonds === 2) kf.push({t:t, x:x, y:y, a:ang});
  }
  var T = t * 1000;
  w.animate(kf.map(function(q){ return {offset:Math.min(1, q.t / t), transform:place(q.x, q.y, q.a)}; }), {duration:T, easing:'linear', fill:'forwards'});
  pluie(L, x, sol - 2, {n:4, c:['#8a8098', '#b8aec8'], angle:-90, ecart:60, v0:30, v1:80, g:300, t0:2, t1:4, d0:300, d1:500, retard:T * .8});
  w.animate([{opacity:1}, {opacity:1, offset:.7}, {opacity:0}], {duration:T + 900, fill:'forwards'}).finished.then(function(){ w.remove(); });
};

/* ---------- l'Alchimiste : potions de givre, d'acide, d'huile et de colle (lancer(scene, to, 'givre')) ---------- */
var POTIONS = {feu:'#ff7a2a', fumigene:'#aab4d2', huile:'#f2b630', colle:'#ece4d0', baume:'#5fd08a', coeur:'#ff5a7a', givre:'#7fd8ff', acide:'#7ae04a'};
var POT2 = {givre:1, acide:1, huile:1, colle:1};
var lancerBase = H.lancer, preparerBase = H.preparer;
H.lancer = function(scene, to, couleur, opt){
  if(couleur && typeof couleur === 'object'){ opt = couleur; couleur = opt.potion; }
  opt = opt || {};
  var nom = POTIONS[couleur] ? couleur : opt.potion;
  if(!nom || !POT2[nom]) return lancerBase.call(this, scene, to, POTIONS[couleur] || couleur, opt);
  var o2 = {}; for(var k in opt) o2[k] = opt[k]; o2._potion = nom;
  return lancerBase.call(this, scene, to, opt.couleur || POTIONS[nom], o2);
};
H.preparer = function(couleur){ return preparerBase.call(this, POTIONS[couleur] || couleur); };
/* une fiole qui vole sans filtre (sa lueur est un dégradé), en tournant ; la traînée dépend de la potion */
H._fioleVole2 = function(scene, a, to, c, opt){
  var L = couche(scene), nom = opt._potion, me = this;
  var e = div(L, 'width:58px;height:58px', '<div style="position:absolute;inset:0;' + tache('#ffffff', c) + ';opacity:.55"></div><div style="position:absolute;left:16px;top:13px;width:26px;height:31px">' + fioleSVG(c) + '</div>');
  var dist = Math.hypot(to.x - a.x, to.y - a.y);
  return vol2(e, a, to, {d:Math.max(420, Math.min(760, dist * 1.3)), haut:120 + dist * .26, tourne:620, r0:-20, pas:50, chaque:function(p){
    if(nom === 'givre') pluie(L, p.x, p.y, {n:1, forme:'flocon', c:['#ffffff', '#cfefff'], angle:90, ecart:40, v0:10, v1:30, g:60, t0:8, t1:11, d0:450, d1:650});
    else if(nom === 'acide'){ pluie(L, p.x, p.y + 8, {n:1, forme:'goutte', c:['#7ae04a', '#a6f070'], angle:90, ecart:20, v0:10, v1:30, g:700, t0:5, t1:7, d0:400, d1:550}); if(Math.random() < .3) lueurFx(L, p.x, p.y - 6, {c:'#d8ecc8', c2:'#9ab88a', w:16, s0:.6, s1:2, dy:-12, d:600, o0:.5}); }
    else if(nom === 'huile') pluie(L, p.x, p.y + 8, {n:1, forme:'goutte', c:['#f2b630', '#ffd870'], angle:90, ecart:20, v0:10, v1:30, g:800, t0:5, t1:7, d0:400, d1:550});
    else pluie(L, p.x, p.y, {n:1, c:'#f4f8ea', bord:true, angle:90, ecart:30, v0:10, v1:30, g:300, t0:3, t1:5, d0:400, d1:600});
  }}).then(function(r){
    e.remove();
    me._eclatPotion(L, to, nom, c);
    if(opt.onImpact) try { opt.onImpact(r); } catch(err){ console.error(err); }
    return r;
  });
};
H._eclatPotion = function(L, to, nom, c){
  var x = to.x, y = to.y;
  /* le verre qui se brise (toutes les potions) */
  pluie(L, x, y, {n:7, forme:'eclat', c:['#e8f8ff', '#bfe0f0', '#ffffff'], v0:120, v1:260, g:600, t0:6, t1:10, d0:450, d1:700});
  if(nom === 'givre'){
    lueurFx(L, x, y, {c:'#ffffff', c2:'#7fd8ff', w:130, h:110, s0:.2, s1:1.6, d:620});
    surgit(L, x, y, 110, 110, floconSvg('#e8f8ff'), {d:760, s1:1.5});
    anneau(L, x, y, {c:'#bfeaff', w:80, s0:.3, s1:2.6, d:650});
    pluie(L, x, y, {n:10, forme:'eclat', c:['#eaf8ff', '#bfeaff', '#7fd8ff'], v0:90, v1:240, g:500, t0:7, t1:11, d0:500, d1:800});
    surgit(L, x, y + 10, 80, 46, cristauxSvg(), {d:1300, k:[{transform:place(x, y + 6, 0, .2), opacity:0}, {transform:place(x, y + 6, 0, 1.08), opacity:1, offset:.14}, {transform:place(x, y + 6, 0, 1), opacity:1, offset:.78}, {transform:place(x, y + 10, 0, .9), opacity:0}]});
    for(var i = 0; i < 3; i++) lueurFx(L, x + alea(-20, 20), y - 6 - i * 8, {c:'#ffffff', c2:'#dff4ff', w:40, s0:.5, s1:2.4, dy:-20, d:1100, retard:150 + i * 120, o0:.75});
  } else if(nom === 'acide'){
    lueurFx(L, x, y, {c:'#eaffd0', c2:'#7ae04a', w:110, h:84, s0:.2, s1:1.6, d:620});
    anneau(L, x, y, {c:'#9af060', w:70, s0:.3, s1:2.4, d:560});
    pluie(L, x, y, {n:14, forme:'goutte', c:['#7ae04a', '#a6f070', '#5ac83a'], angle:-90, ecart:90, v0:90, v1:230, g:700, t0:6, t1:9, d0:500, d1:800});
    for(var j = 0; j < 4; j++) lueurFx(L, x + alea(-20, 20), y - 6 - j * 6, {c:'#d8ecc8', c2:'#9ab88a', w:36, s0:.5, s1:2.6, dx:alea(-12, 12), dy:-50, d:1300, retard:160 + j * 140, o0:.75});
    pluie(L, x, y, {n:5, c:'#c8ff9a', bord:true, angle:-90, ecart:40, v0:20, v1:60, g:-60, t0:3, t1:5, d0:700, d1:1000, etale:500});
  } else if(nom === 'huile'){
    lueurFx(L, x, y, {c:'#fff6c0', c2:'#f2b630', w:100, h:80, s0:.2, s1:1.5, d:640});
    anneau(L, x, y, {c:'#ffd870', w:60, s0:.3, s1:2.2, d:560});
    pluie(L, x, y, {n:14, forme:'goutte', c:['#f2b630', '#ffd870', '#d89a20'], angle:-90, ecart:85, v0:80, v1:210, g:900, t0:6, t1:9, d0:500, d1:800});
    pluie(L, x, y + 6, {n:3, forme:'goutte', c:'#f2b630', angle:90, ecart:10, v0:5, v1:15, g:160, t0:7, t1:9, d0:1000, d1:1300, etale:300, retard:200});
    pluie(L, x, y, {n:4, forme:'etoile', c:'#fff6c0', v0:10, v1:40, g:0, t0:8, t1:12, d0:500, d1:700, etale:300});
  } else {
    lueurFx(L, x, y, {c:'#ffffff', c2:'#ece4d0', w:100, s0:.2, s1:1.4, d:800});
    for(var f = 0; f < 7; f++){
      var an = alea(0, 360), ln = alea(26, 46), fil = div(L, 'width:' + r1(ln) + 'px;height:3px;border-radius:3px;background:#f4f8ea;transform-origin:0 50%');
      jouerEl(fil, [{transform:'translate(' + x + 'px,' + y + 'px) rotate(' + an + 'deg) scaleX(0)', opacity:1}, {transform:'translate(' + x + 'px,' + y + 'px) rotate(' + (an + 8) + 'deg) scaleX(1)', opacity:1, offset:.3},
        {transform:'translate(' + x + 'px,' + (y + 12) + 'px) rotate(' + (an + 20) + 'deg) scaleX(.9)', opacity:0}], {duration:alea(900, 1200), easing:'ease-out'});
    }
    pluie(L, x, y, {n:9, c:'#f4f8ea', bord:true, v0:40, v1:130, g:260, t0:4, t1:7, d0:700, d1:1000});
  }
};

/* ---------- le Sage : le cristal de lune (un éclair qui illumine TOUTE la salle) ---------- */
/* les images de lumière : de petits dégradés (256 px) faits une fois, que la carte graphique agrandit et estompe ;
   (iPhone : pas d'image plein écran ; le canvas est libéré tout de suite) */
var LUMIERE = {garde:[]};
function imagesLumiere(){
  if(LUMIERE.pret) return LUMIERE.pret;
  function faire(dessin){
    var c = document.createElement('canvas'); c.width = c.height = 256;
    var g = c.getContext('2d'); dessin(g); var u = c.toDataURL('image/png'); c.width = c.height = 0; return u;
  }
  try {
    LUMIERE.grand = faire(function(g){
      var r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      [[0, 'rgba(255,255,255,1)'], [.1, 'rgba(250,253,255,.96)'], [.28, 'rgba(226,242,255,.82)'], [.55, 'rgba(196,224,255,.55)'], [.8, 'rgba(170,205,255,.28)'], [1, 'rgba(160,200,255,0)']].forEach(function(s){ r.addColorStop(s[0], s[1]); });
      g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    });
    LUMIERE.rayons = faire(function(g){
      g.translate(128, 128);
      for(var i = 0; i < 18; i++){
        var a = i / 18 * Math.PI * 2 + (i % 2 ? .08 : -.05), l = i % 2 ? 92 : 126, w = i % 2 ? .05 : .085;
        for(var p = 0; p < 3; p++){
          var ww = w * (1 - p * .3), r = g.createRadialGradient(0, 0, 0, 0, 0, l);
          r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(.5, 'rgba(225,240,255,.3)'); r.addColorStop(1, 'rgba(200,225,255,0)');
          g.fillStyle = r; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - ww) * l, Math.sin(a - ww) * l); g.lineTo(Math.cos(a + ww) * l, Math.sin(a + ww) * l); g.closePath(); g.fill();
        }
      }
    });
  } catch(e){ LUMIERE.grand = LUMIERE.rayons = null; }
  LUMIERE.pret = Promise.all([LUMIERE.grand, LUMIERE.rayons].filter(Boolean).map(function(u){ var im = new Image(); im.src = u; LUMIERE.garde.push(im); return im.decode ? im.decode().catch(function(){}) : null; }));
  return LUMIERE.pret;
}
/* les images de lumière sont faites pendant la cuisson (un écran calme) */
preparer = (function(base){ return function(liste, o){ return base(liste, o).then(function(r){ return imagesLumiere().then(function(){ return r; }); }); }; })(preparer);
function lunePopSvg(){
  return '<svg viewBox="-60 -60 120 120" style="width:100%;height:100%;display:block;overflow:visible"><circle r="44" fill="#ffffff" opacity=".22"/>' +
    '<path d="' + croissant(-4, 0, 40, 18, -4, 34) + '" fill="#f4f8ff" stroke="#8aa8d8" stroke-width="3"/><path d="M0 -58 L 4 -4 L 58 0 L 4 4 L 0 58 L -4 4 L -58 0 L -4 -4 Z" fill="#ffffff" opacity=".9"/></svg>';
}
var sortBase = H.sort;
H.sort = function(scene, to, opt){
  opt = opt || {};
  if(opt.cristal || (opt.cristal !== false && this.equipe('cristal-lune'))){
    var o = {}; for(var k in opt) o[k] = opt[k];
    if(to && !o.cibles) o.cibles = [to];
    return this.eclairSalle(scene, o);
  }
  return sortBase.call(this, scene, to, opt);
};
/* le calque de lune qui grossit autour du cristal pendant qu'il se charge (il suit le bâton) */
H._luneCharge = function(){
  if(this._lc !== undefined) return this._lc;
  var r = this.reps.cristal, x = +r.getAttribute('cx'), y = +r.getAttribute('cy'), id = 'hlc' + (++uid);
  var e = this._lc = this._calqueDans(this.cristal && this.cristal.parentNode, '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#eef6ff" stop-opacity=".85"/><stop offset="1" stop-color="#bfd8ff" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="' + x + '" cy="' + y + '" r="46" fill="url(#' + id + ')"/>', [x, y]);
  return e;
};
/* (un calque dans une pièce précise) */
H._calqueDans = function(p, html, origine){
  if(!p) return null;
  var e;
  if(this.cuit && window.Cuire){ e = window.Cuire.ilot(p, html, 'ha-calque'); e.style.width = e.style.height = '1px'; }
  else { e = document.createElementNS(SVGNS, 'g'); e.setAttribute('class', 'haJ ha-calque'); e.innerHTML = html; p.appendChild(e); }
  e.style.display = 'none';
  if(origine) e.style.transformOrigin = origine[0] + 'px ' + origine[1] + 'px';
  return e;
};
H.eclairSalle = function(scene, opt){
  opt = opt || {};
  imagesLumiere();
  var me = this;
  return this._file(function(sig){
    var g = this.garde(), base = {pA:[100, 272], pB:[156, 272]}, lc = this._luneCharge();
    var leve = copie(g, copie(base, {bassin:{y:4}, torse:-4, tete:-12, mB:[150, 80], hB:0, mA:[178, 70], hA:-150}));
    var haut = copie(leve, {bassin:{y:-2}, torse:-9, tete:-18, mB:[146, 40], hB:-6, mA:[186, 56], hA:-160, sB:1.06});
    var flash = copie(haut, {torse:-12, tete:-20, mB:[146, 34]});
    this.expr('colere');
    return this.jouer([
      {d:300, p:leve, e:'io', f:function(){
        me.cristalFlash(true); me.expr('cri');
        if(lc){ montrer(lc, true); animer(lc, [{opacity:0, transform:'scale(.2)'}, {opacity:1, transform:'scale(1)', offset:.8}, {opacity:1, transform:'scale(1.25)'}], {duration:480, easing:'ease-in', fill:'forwards'}); }
        var p = me.rep('cristal');
        for(var i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2, d = 70, e = div(me.fx, 'width:14px;height:14px', FORMES.etoile(i % 2 ? '#e8f0ff' : '#ffffff', 14));
          jouerEl(e, [{transform:place(p.x + Math.cos(a) * d, p.y - 30 + Math.sin(a) * d, 0, .5), opacity:0}, {transform:place(p.x + Math.cos(a) * d * .6, p.y - 30 + Math.sin(a) * d * .6, 90, 1), opacity:1, offset:.4}, {transform:place(p.x, p.y - 40, 180, .3), opacity:0}], {duration:420, delay:i * 25, easing:'ease-in', fill:'backwards'}); }
      }},
      {d:340, p:haut, e:'b'},
      {d:140, p:flash, e:'o', f:function(){
        if(lc) animer(lc, [{opacity:1, transform:'scale(1.25)'}, {opacity:0, transform:'scale(2.2)'}], {duration:500, easing:'ease-out', fill:'forwards'}).then(function(){ montrer(lc, false); });
        sig(me._eclairSalle(scene, opt));
      }},
      {d:600, p:flash, e:'lin', f0:function(){ me.expr('savoir'); }},
      {d:440, p:g, e:'io', f:function(){ me.expr('garde'); }}
    ]);
  });
};
H._eclairSalle = function(scene, opt){
  var L = couche(scene), c = this.rep('cristal', scene), W = scene.offsetWidth || 960, Hs = scene.offsetHeight || 540;
  var S = Math.max(W, Hs) * 2.3 / 256;
  /* 1) la grande lumière (une image de 256 px que la carte graphique agrandit) */
  if(LUMIERE.grand){
    var im = div(L, 'width:256px;height:256px', '<img src="' + LUMIERE.grand + '" alt="" style="width:100%;height:100%;display:block">');
    jouerEl(im, [{transform:place(c.x, c.y, 0, S * .12), opacity:0}, {transform:place(c.x, c.y, 0, S * .85), opacity:1, offset:.06}, {transform:place(c.x, c.y, 0, S), opacity:.9, offset:.3}, {transform:place(c.x, c.y, 0, S * 1.04), opacity:0}], {duration:1500, easing:'ease-out'});
  }
  /* 2) les rayons qui tournent un peu */
  if(LUMIERE.rayons){
    var ry = div(L, 'width:256px;height:256px', '<img src="' + LUMIERE.rayons + '" alt="" style="width:100%;height:100%;display:block">');
    jouerEl(ry, [{transform:place(c.x, c.y, 0, .5), opacity:0}, {transform:place(c.x, c.y, 6, 2.6), opacity:1, offset:.15}, {transform:place(c.x, c.y, 22, 4.4), opacity:0}], {duration:1100, easing:'ease-out'});
  }
  /* 3) le croissant de lune qui jaillit du cristal, l'onde qui traverse la salle */
  surgit(L, c.x, c.y, 130, 130, lunePopSvg(), {d:800, s1:1.8});
  anneau(L, c.x, c.y, {c:'#e8f6ff', w:320, s0:.15, s1:5.5, d:1000});
  anneau(L, c.x, c.y, {c:'#ffffff', w:320, s0:.1, s1:3.6, d:800, retard:120});
  /* 4) des éclats de lune partout dans la salle */
  var n = 16;
  for(var i = 0; i < n; i++){
    var x = W * (.06 + .88 * (i / n)) + alea(-20, 20), y = Hs * alea(.12, .68), t = alea(12, 22), e = div(L, 'width:' + r1(t) + 'px;height:' + r1(t) + 'px', FORMES.etoile(i % 3 ? '#ffffff' : '#dfe8ff', t));
    jouerEl(e, [{transform:place(x, y, 0, 0), opacity:0}, {transform:place(x, y - 4, 45, 1.3), opacity:1, offset:.35}, {transform:place(x, y - 12, 90, 0), opacity:0}], {duration:alea(600, 900), delay:100 + i * 28, easing:'ease-out', fill:'backwards'});
  }
  /* 5) sur chaque cible : un éclat */
  (opt.cibles || []).forEach(function(q, k){
    lueurFx(L, q.x, q.y, {c:'#ffffff', c2:'#cfe8ff', w:120, s0:.3, s1:1.6, d:600, retard:120 + k * 60});
    pluie(L, q.x, q.y, {n:6, forme:'etoile', c:['#ffffff', '#e8f0ff'], v0:60, v1:140, g:60, t0:10, t1:15, d0:500, d1:800, retard:120 + k * 60});
  });
  if(opt.onImpact) try { opt.onImpact(c); } catch(e){ console.error(e); }
  return c;
};

/* ---------- le Sage : le bâton de chêne (le bouclier protège deux héros : bouclier(scene, [cible1, cible2])) ---------- */
var bouclierBase = H.bouclier;
H.bouclier = function(scene, cible, opt){
  if(!(cible instanceof Array) || cible.length < 2) return bouclierBase.call(this, scene, cible instanceof Array ? cible[0] : cible, opt);
  opt = opt || {};
  var me = this, L = couche(scene), domes = [], pret;
  var p = this._file(function(sig){
    var g = this.garde(), base = {pA:[102, 272], pB:[156, 272]}, fin, tous = new Promise(function(r){ fin = r; });
    var leve = copie(g, copie(base, {bassin:{y:2}, torse:-4, tete:-12, mB:[150, 74], hB:0, mA:[178, 66], hA:-160}));
    var haut = copie(leve, {bassin:{y:-2}, torse:-6, tete:-14, mB:[150, 62], mA:[184, 56]});
    this.expr('colere');
    return Promise.all([tous, this.jouer([
      {d:300, p:leve, e:'io', f:function(){
        me.cristalFlash(true); me.expr('cri'); var q = me.rep('baton-bas');
        onde(me.fx, q.x, q.y, {w:120, h:26, c:CYAN, ep:3, s0:0.2, s1:1.4, d:800});
        me._runesMontent();
        if(me.equipe('baton-chene')){
          var c = me.rep('chene');
          anneau(me.fx, q.x, q.y, {c:'#8ae07a', w:150, h:32, s0:.2, s1:1.5, d:900});
          pluie(me.fx, c.x, c.y, {n:8, forme:'feuille', c:['#6ab85a', '#5aa04a', '#8ad07a'], v0:60, v1:150, g:60, t0:16, t1:22, d0:800, d1:1200, etale:200});
        }
      }},
      {d:220, p:haut, e:'b'},
      {d:260, p:haut, e:'lin', f:function(){
        var a = me.rep('cristal', scene);
        cible.forEach(function(el, i){
          me._fil(L, scene, a, el, i).then(function(){
            domes[i] = me._dome(L, scene, el, opt);
            if(domes.filter(Boolean).length === cible.length){ var gr = groupeDomes(domes); sig(gr); fin(gr); }
          });
        });
      }},
      {d:420, p:g, e:'io', f:function(){ me.expr('content'); }},
      {d:300, p:g, e:'lin', f:function(){ me.expr('garde'); }}
    ])]).then(function(r){ return r[0]; });
  });
  pret = p;
  p.absorber = function(n, i){ return pret.then(function(b){ return b.absorber(n, i); }); };
  p.retirer = function(i){ return pret.then(function(b){ return b.retirer(i); }); };
  return p;
};
/* deux dômes : b[0], b[1] (chacun avec absorber / retirer), et b.absorber(n[, i]) / b.retirer([i]) pour tous */
function groupeDomes(liste){
  var g = liste.slice();
  function choix(i){ return i === undefined ? liste : [liste[i]]; }
  g.absorber = function(n, i){ return Promise.all(choix(i).map(function(b){ return b.absorber(n); })); };
  g.retirer = function(i){ return Promise.all(choix(i).map(function(b){ return b.retirer(); })); };
  return g;
}
/* une boule de runes qui file du cristal jusqu'au héros protégé (avant que son dôme ne se pose) */
H._fil = function(L, scene, a, el, i){
  var R = scene.getBoundingClientRect(), k = (R.width / (scene.offsetWidth || R.width)) || 1, r = el.getBoundingClientRect();
  var b = {x:(r.left - R.left) / k + r.width / k / 2, y:(r.top - R.top) / k + r.height / k * .2};
  var e = div(L, 'width:30px;height:30px;' + tache('#ffffff', '#8ff3ff'));
  return vol2(e, a, b, {d:340, haut:90 + i * 30, retard:i * 90, apparait:true, pas:40, chaque:function(p){
    pluie(L, p.x, p.y, {n:1, forme:'etoile', c:['#e8fdff', CYAN], v0:5, v1:30, g:20, t0:8, t1:12, d0:300, d1:450});
  }}).then(function(q){ e.remove(); lueurFx(L, q.x, q.y + 20, {c:'#ffffff', c2:CYAN, w:90, s0:.3, s1:1.6, d:420}); return q; });
};
