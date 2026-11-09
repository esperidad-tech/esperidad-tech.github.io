
/* ============ le moteur de poses (Web Animations API) ============ */
var EZ = {lin:'linear', o:'cubic-bezier(.2,.75,.3,1)', i:'cubic-bezier(.55,0,.85,.35)', io:'cubic-bezier(.45,0,.3,1)',
  b:'cubic-bezier(.3,1.55,.55,1)', bb:'cubic-bezier(.25,2.1,.5,1)', s:'cubic-bezier(.4,0,.2,1)', oo:'cubic-bezier(.1,.9,.2,1)'};
function J0(){ return {x:0, y:0, r:0, k:0, sx:1, sy:1}; }
function jn(v){ var o = J0(); if(typeof v === 'number') o.r = v; else for(var k in v) o[k] = v[k]; return o; }
function tf(s){ return 'translate(' + r1(s.x) + 'px,' + r1(s.y) + 'px) rotate(' + (Math.round(s.r * 100) / 100) + 'deg) skewX(' + r1(s.k) + 'deg) scale(' + (Math.round(s.sx * 1000) / 1000) + ',' + (Math.round(s.sy * 1000) / 1000) + ')'; }
function egal(a, b){ return a.x === b.x && a.y === b.y && a.r === b.r && a.k === b.k && a.sx === b.sx && a.sy === b.sy; }
var DEG = 180 / Math.PI;
function norm(a){ while(a > 180) a -= 360; while(a <= -180) a += 360; return a; }
/* deux os : épaule (ou hanche), longueurs, cible du poignet (ou de la cheville) ; sg = +1 pour un bras (le coude plie vers l'avant), -1 pour une jambe */
function ik(S, l1, l2, Tg, sg){
  var dx = Tg[0] - S[0], dy = Tg[1] - S[1], d = Math.hypot(dx, dy) || 0.01;
  var dd = Math.max(Math.abs(l1 - l2) + 0.5, Math.min(l1 + l2 - 0.05, d));
  var a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd))));
  var fT = Math.atan2(dy, dx), f1 = fT + sg * a;
  var E = [S[0] + l1 * Math.cos(f1), S[1] + l1 * Math.sin(f1)], T2 = [S[0] + dx / d * dd, S[1] + dy / d * dd];
  var f2 = Math.atan2(T2[1] - E[1], T2[0] - E[0]);
  var r1_ = f1 * DEG - 90; while(r1_ > 90) r1_ -= 360; while(r1_ <= -270) r1_ += 360;
  return [r1_, norm((f2 - f1) * DEG)];
}
/* un angle ramené au plus près d'un autre (pour tourner par le plus court chemin depuis la pose d'avant) */
function pres(v, ref){ return v + 360 * Math.round((ref - v) / 360); }
function resoudre(pose, base){
  var st = {}, k;
  for(k in base) st[k] = base[k];
  for(k in pose) if(base[k]){ st[k] = jn(pose[k]); st[k].r = pres(st[k].r, base[k].r); }
  ['A', 'B'].forEach(function(c){
    var m = pose['m' + c];
    if(m){
      var os = OS[c], s = pose['s' + c] || 1, r = ik(os.epaule, os.l1, os.l2 * s, m, pose['c' + c] || 1);
      var rb = pres(r[0], base['bras' + c].r);
      st['bras' + c] = jn(rb); st['avantBras' + c] = jn({r:r[1], sy:s});
      if(!pose['main' + c]) st['main' + c] = jn({r:pose['h' + c] !== undefined ? pres(pose['h' + c] - rb - r[1], base['main' + c].r) : 0, sy:1 / s});
    } else if(pose['h' + c] !== undefined) st['main' + c] = jn(pres(pose['h' + c] - st['bras' + c].r - st['avantBras' + c].r, base['main' + c].r));
    var p = pose['p' + c];
    if(p){
      var b = st.bassin, pv = SQ.bassin, a = -b.r / DEG, wx = p[0] - b.x - pv[0], wy = p[1] - b.y - pv[1];
      var loc = [pv[0] + wx * Math.cos(a) - wy * Math.sin(a), pv[1] + wx * Math.sin(a) + wy * Math.cos(a)];
      var j = OS['J' + c], r2 = ik(j.hanche, j.l1, j.l2, loc, pose['g' + c] || -1);
      st['cuisse' + c] = jn(r2[0]); st['tibia' + c] = jn(r2[1]);
      st['pied' + c] = jn((pose['f' + c] || 0) - b.r - r2[0] - r2[1]);
    }
  });
  return st;
}
/* une pose à mi-chemin entre deux (pour les cycles : course, rebonds) */
function melange(a, b, t){ var o = {}; for(var k in a){ o[k] = {}; for(var f in a[k]) o[k][f] = a[k][f] + (b[k][f] - a[k][f]) * t; } return o; }

/* ============ le ticker commun : tissus, cordes, bulles… ============ */
var VIVANTS = [], tickOn = false, tPrec = 0;
/* Fluidité (RAPIDITE.md) : à chaque image, on LIT d'abord toutes les positions dont on aura besoin (pour tous les héros),
   puis on écrit (tissus, corde…). Lire après avoir écrit forcerait le navigateur à tout recalculer, une fois par héros. */
var CACHE_MAT = null;
function tick(t){
  var dt = Math.min(1 / 30, Math.max(1 / 240, (t - (tPrec || t)) / 1000 || 1 / 60)); tPrec = t;
  CACHE_MAT = new Map();
  /* au repos (cuit), un héros « s'endort » : plus aucun calcul à chaque image (voir H._actif) */
  var actifs = VIVANTS.filter(function(h){ return h._actif(t); });
  actifs.forEach(function(h){ try { h._lire(); } catch(e){} });
  actifs.forEach(function(h){ try { h._pas(dt, t / 1000); } catch(e){ if(!h._err){ h._err = 1; console.error(e); } } });
  CACHE_MAT = null;
  if(actifs.length) requestAnimationFrame(tick); else tickOn = false;
}
function vivre(h){ if(VIVANTS.indexOf(h) < 0) VIVANTS.push(h); h._calmeDepuis = 0; if(h._dort) h._reveil(); if(!tickOn){ tickOn = true; tPrec = 0; requestAnimationFrame(tick); } }

/* ============ les effets : particules et projectiles (dans la scène ou autour du héros) ============ */
function div(parent, css, html){
  var e = document.createElement('div'); e.className = 'ha-p'; e.style.cssText = css || ''; if(html) e.innerHTML = html; parent.appendChild(e); return e;
}
function jouerEl(e, kfs, o, garder){
  var a = e.animate(kfs, o);
  a.finished.then(function(){ if(!garder) e.remove(); }, function(){ if(!garder) e.remove(); });
  return a.finished.catch(function(){});
}
function place(x, y, r, s){ return 'translate(' + r1(x) + 'px,' + r1(y) + 'px) translate(-50%,-50%)' + (r ? ' rotate(' + r1(r) + 'deg)' : '') + (s !== undefined ? ' scale(' + s + ')' : ''); }
/* le centre d'un élément dans le repère d'un autre (en tenant compte d'un zoom CSS du repère) */
function ou(el, ref){
  var r = el.getBoundingClientRect(), R = ref.getBoundingClientRect(), k = (R.width / (ref.offsetWidth || R.width)) || 1;
  return {x:(r.left + r.width / 2 - R.left) / k, y:(r.top + r.height / 2 - R.top) / k};
}
function alea(a, b){ return a + Math.random() * (b - a); }
/* une gerbe de particules : n, couleur, vitesse, pesanteur, taille, durée */
function gerbe(layer, x, y, o){
  o = o || {};
  var n = o.n || 12, ps = [];
  for(var i = 0; i < n; i++){
    var an = (o.angle !== undefined ? o.angle : 0) + (o.ecart !== undefined ? alea(-o.ecart, o.ecart) : alea(-180, 180));
    var v = alea(o.v0 || 60, o.v1 || 160), vx = Math.cos(an / DEG) * v, vy = Math.sin(an / DEG) * v, g = o.g === undefined ? 300 : o.g;
    var dur = alea(o.d0 || 400, o.d1 || 800), sz = alea(o.t0 || 3, o.t1 || 6), coul = o.c instanceof Array ? o.c[i % o.c.length] : (o.c || '#ffd36a');
    var forme = o.forme || 'rond';
    var css = 'width:' + sz + 'px;height:' + (forme === 'trait' ? sz * 0.35 : sz) + 'px;border-radius:' + (forme === 'carre' ? '1px' : '50%') + ';background:' + coul + ';' + (o.lueur === false ? '' : 'box-shadow:0 0 ' + (sz * 1.4) + 'px ' + coul + ';');
    if(forme === 'eclat') css = 'width:0;height:0;border-left:' + (sz * 0.45) + 'px solid transparent;border-right:' + (sz * 0.45) + 'px solid transparent;border-bottom:' + sz + 'px solid ' + coul + ';filter:drop-shadow(0 0 2px #fff8);';
    if(forme === 'html') css = 'font-size:' + sz + 'px;line-height:1;color:' + coul + ';text-shadow:0 0 6px ' + coul + ';';
    var e = div(layer, css, forme === 'html' ? o.html : '');
    var k = [], rot0 = alea(-180, 180), rotv = alea(-540, 540);
    for(var s = 0; s <= 6; s++){
      var tt = s / 6 * dur / 1000, px = x + vx * tt, py = y + vy * tt + 0.5 * g * tt * tt;
      var rr = forme === 'trait' ? Math.atan2(vy + g * tt, vx) * DEG : rot0 + rotv * tt;
      k.push({transform:place(px, py, rr, (o.s1 === undefined ? 1 : 1 + (o.s1 - 1) * s / 6)), opacity:s < 1 ? 0.2 + (o.o0 || 1) * 0.8 : (o.o0 || 1) * Math.pow(1 - s / 6, o.fondu || 0.8)});
    }
    k[0].opacity = 0;
    ps.push(jouerEl(e, k, {duration:dur, delay:(o.retard || 0) + alea(0, o.etale || 0), easing:'linear', fill:'backwards'}));
  }
  return Promise.all(ps);
}
/* un rond qui grandit et s'efface (onde, éclair, poussière) */
function onde(layer, x, y, o){
  o = o || {};
  var w = o.w || 40, h = o.h || w, e = div(layer, 'width:' + w + 'px;height:' + h + 'px;border-radius:50%;' + (o.css || ('border:' + (o.ep || 3) + 'px solid ' + (o.c || '#fff') + ';box-shadow:0 0 12px ' + (o.c || '#fff') + ', inset 0 0 8px ' + (o.c || '#fff') + ';')), o.html);
  return jouerEl(e, [{transform:place(x, y, 0, o.s0 || 0.2), opacity:o.o0 === undefined ? 1 : o.o0}, {transform:place(x, y, 0, o.s1 || 2.4), opacity:0}],
    {duration:o.d || 500, delay:o.retard || 0, easing:o.e || 'cubic-bezier(.1,.7,.3,1)', fill:'backwards'});
}
/* une petite étoile à 4 branches (scintillement) */
function etoile4(c, t){ return '<svg viewBox="-10 -10 20 20" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible;filter:drop-shadow(0 0 3px ' + c + ')"><path d="M0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="' + c + '"/><circle r="2" fill="#fff"/></svg>'; }
function etoile5(c, t){ return '<svg viewBox="-12 -12 24 24" style="width:' + t + 'px;height:' + t + 'px;display:block;overflow:visible"><path d="M0 -11 L 3.2 -3.6 L 11 -3.4 L 5 1.8 L 7 9.6 L 0 5.2 L -7 9.6 L -5 1.8 L -11 -3.4 L -3.2 -3.6 Z" fill="' + c + '" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/><path d="M-2 -5 L 0 -8" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>'; }
function scintille(layer, x, y, o){
  o = o || {};
  var ps = [];
  for(var i = 0; i < (o.n || 8); i++){
    var px = x + alea(-(o.rx || 40), o.rx || 40), py = y + alea(-(o.ry || 40), o.ry || 40), t = alea(o.t0 || 8, o.t1 || 16);
    var e = div(layer, '', etoile4(o.c instanceof Array ? o.c[i % o.c.length] : (o.c || '#ffe9a0'), t));
    ps.push(jouerEl(e, [{transform:place(px, py, 0, 0), opacity:1}, {transform:place(px, py + (o.dy || -10) * 0.5, 45, 1.2), opacity:1, offset:0.4}, {transform:place(px, py + (o.dy || -10), 90, 0), opacity:0}],
      {duration:alea(o.d0 || 450, o.d1 || 800), delay:(o.retard || 0) + alea(0, o.etale || 400), easing:'ease-out', fill:'backwards'}));
  }
  return Promise.all(ps);
}
/* un mot de bande dessinée (BONG !, −2 absorbés…) */
function mot(layer, x, y, txt, o){
  o = o || {};
  var e = div(layer, 'font:900 ' + (o.t || 30) + 'px/1 ' + (o.police || '"Trebuchet MS", "Arial Black", system-ui, sans-serif') + ';color:' + (o.c || '#ffe36a') + ';-webkit-text-stroke:' + (o.trait || 2) + 'px #24182e;paint-order:stroke fill;' +
    'text-shadow:0 3px 0 #24182e, 0 0 14px ' + (o.lueur || 'rgba(255,200,80,.7)') + ';white-space:nowrap;letter-spacing:.02em', txt);
  var r = o.r || 0;
  return jouerEl(e, [{transform:place(x, y, r, 0.2), opacity:0}, {transform:place(x, y - 6, r, 1.25), opacity:1, offset:0.15}, {transform:place(x, y - 10, r, 1), opacity:1, offset:0.3},
    {transform:place(x, y - (o.monte || 26), r, 1), opacity:1, offset:0.8}, {transform:place(x, y - (o.monte || 26) - 8, r, 0.9), opacity:0}],
    {duration:o.d || 1100, delay:o.retard || 0, easing:'ease-out', fill:'backwards'});
}
