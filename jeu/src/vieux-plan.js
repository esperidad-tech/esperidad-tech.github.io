/* ==========================================================
   Brumeval — LE VIEUX PLAN D'ODETTE, DANS LA PAGE DU GRAND LIVRE (vieux-plan.js + vieux-plan.css) — 19 novembre
   Romain, 19 novembre, 10 h 53 : « j'aimerais bien que le grand plan soit accessible directement dans le grand livre sans passer par
   une autre interface » ; 11 h 01 : « il faut mettre moins d'indices à déchiffrer […] le NBBNBN, ça c'est bien […] la pierre de rune, elle
   peut afficher beaucoup plus de choses […] tout ce qui est important de prendre dans les salles […] dans la page principale, dans le grand
   livre […] qu'on puisse directement prendre la pierre […] les deux pierres […] les faire glisser […] la pierre de Tim, elle pourrait
   faire apparaître certaines choses, et l'autre pierre pourrait faire apparaître d'autres choses […] enlève tout ce que tu as mis là, un
   très vieux plan roulé dans un étui de cuir […] dans la marge de la main d'Odette […] la nuit, après le départ, le Pisteur a ouvert un
   passage […] que ce plan soit disponible du matin jusqu'à la nuit […] au matin, il comprend pas exactement ce que c'est. Et après, à la
   nuit, il comprend bien que c'est le donjon ».

   · LE PLAN EST LA PAGE (M.vieuxPlanHTML, appelé par la page « vieuxplan » de e3.js) : le même dessin que la tablette du Sage dans le
     donjon (donjon/pages/sage-plan.js, PLAN_SAGE.svg, chargé dans le jeu par build.py), dans un cadre de la page. Un doigt le fait
     glisser, deux doigts l'approchent (la molette aussi ; ＋ et －). Plus de fenêtre par-dessus, plus de « Refermer ».
   · AVANT LE DÉPART (le jour, ou la nuit tant que le Pisteur n'a pas donné « On va dans la crypte » : M.donjonPlanNuit) : ni noms, ni
     titre, ni crâne, ni toiles, ni tombes, ni feu de camp (PLAN_SAGE.svg({jour})). Après : le plan complet, avec les noms des salles.
   · UNE SEULE NOTE CODÉE (E.vieuxPlan.codes : les dalles, « N B B, N B N ») : la toucher ouvre, sous le plan, la loupe et la grille de
     l'alphabet ; déchiffrée (P.vus['plan:lu:dalles']), la traduction au crayon reste sur le plan.
   · L'ENCRE CACHÉE (E.vieuxPlan.encres) : on prend une pierre dans la poche, on la promène sur le plan, et l'encre de CETTE pierre
     apparaît là où elle passe (des trous dans un masque, gardés le temps de la partie : UI.vpTrous) ; quand la moitié d'une note est
     découverte, elle s'allume en entier, pour de bon (P.vus['encre:<id>']). La pierre de Tim (dès le matin) : les mécanismes ; la pierre
     de rune (la nuit, trouvée là-dessous) : ce qu'il faut prendre dans les salles.
   · Le point de vue (UI.vp : le point du plan au milieu du cadre, et le zoom) est gardé quand la page se redessine.
   Crochets des robots : window.__vp (etat, promener, toucher, vue).
   Chargé APRÈS pierres.js et descente.js (M.Pierres.pierreSVG, M.donjonPlanNuit).
   ========================================================== */
(function(){
'use strict';
var M = window.M;
if(!M || !M.UI) return;
var UI = M.UI, A = M.A, PS = window.PLAN_SAGE, C = window.CARTE_DONJON;
if(!PS || !C) return;
var U = C.util, PV = C.PLAN.vue;
var INV = '#05607c', TIM = '#9a3c08', CELL = 16, ZMAX = 2.4, POLICE = 'Macondo, Georgia, serif';
var NOMS_SIGNES = {etoile:'une étoile', lune:'une lune', oeil:'un œil', gueule:'une gueule de crapaud'};
function esc(s){ return M.esc(s); }
function lire(t){ return M.lireBtn(t); }
function f(v){ return Math.round(v * 10) / 10; }
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }
function cfg(){ var E = M.E(); return (E && E.vieuxPlan) || null; }
function encres(){ var c = cfg(); return (c && c.encres) || []; }
function codes(){ var c = cfg(); return (c && c.codes) || []; }
function dj(){ var P = M.P(); return (P && P.donjonCodes) || {}; }
function nuit(){ return !!(M.donjonPlanNuit && M.donjonPlanNuit()); }
function coinLa(){ return !!dj()['page:dechiree']; }
function pierresDe(){ var E = M.E(); return ((E && E.pierres) || []).filter(function(p){ return !p.si || M.besoinOk(p.si); }); }
function pierreSVG(id, t){ return M.Pierres && M.Pierres.pierreSVG ? M.Pierres.pierreSVG(id, t) : ''; }
function revelee(id){ var P = M.P(); return !!(P && P.vus && P.vus['encre:' + id]); }
function lu(id){ var P = M.P(); return !!(P && P.vus && P.vus['plan:lu:' + id]); }
function noteCode(id){ return C.PLAN.notes.filter(function(n){ return n.id === id; })[0] || null; }
function encre(id){ return encres().filter(function(n){ return n.id === id; })[0] || null; }
/* la boîte d'une note d'encre (pour savoir quand la pierre passe dessus, et quelle part en est découverte) */
function boite(n){
  if(n.boite) return n.boite;
  var t = n.t || 24, lw = Math.max.apply(null, n.lignes.map(function(l){ return l.length; })) * t * .5 + 30, h = n.lignes.length * t * 1.18 + 24;
  return n.boite = {x:n.x - lw / 2, y:n.y - h / 2, w:lw, h:h};
}

/* ---------- Le dessin ---------- */
var CACHE = {};
function dessin(){
  var k = nuit() ? 'nuit' : 'jour';
  if(!CACHE[k]) CACHE[k] = PS.svg({jour:k === 'jour', codes:codes()});
  return CACHE[k];
}
/* une flèche d'encre : un trait en pointillés, et sa pointe */
function fleche(a, b, c, w){
  var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), p1 = [b[0] - Math.cos(ang - .5) * 13, b[1] - Math.sin(ang - .5) * 13], p2 = [b[0] - Math.cos(ang + .5) * 13, b[1] - Math.sin(ang + .5) * 13];
  return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + '" fill="none" stroke="' + c + '" stroke-width="' + (w || 2.6) + '" stroke-dasharray="6 6" stroke-linecap="round"/>' +
    '<path d="M' + f(p1[0]) + ' ' + f(p1[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + 'L' + f(p2[0]) + ' ' + f(p2[1]) + '" fill="none" stroke="' + c + '" stroke-width="' + (w || 2.6) + '" stroke-linecap="round" stroke-linejoin="round"/>';
}
/* ce qu'une note d'encre dessine : son texte (un halo pâle autour, pour se lire sur les murs), ses petits dessins */
function dessinEncre(n){
  var c = n.pierre === 'tim' ? TIM : INV, halo = n.pierre === 'tim' ? 'rgba(255,214,150,.75)' : 'rgba(159,246,255,.6)', t = n.t || 24, s = '', b = boite(n);
  if(n.passage && C.LIEN[n.passage]){
    var pts = C.LIEN[n.passage].pts, d = U.lisse(pts);
    s += '<path d="' + d + '" fill="none" stroke="' + halo + '" stroke-width="10" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="4" stroke-dasharray=".1 11" stroke-linecap="round"/>';
    var fin = pts[pts.length - 1], av = pts[pts.length - 2];
    s += fleche([fin[0] - (fin[0] - av[0]) * .01, fin[1] - (fin[1] - av[1]) * .01], fin, c, 3);
    if(n.dessin === 'roue'){
      var r0 = pts[0], rx = r0[0] - 6, ry = r0[1] - 46, sp = '';
      for(var k = 0; k < 4; k++){ var a = k * Math.PI / 4; sp += 'M' + f(rx + Math.cos(a) * 15) + ' ' + f(ry + Math.sin(a) * 15) + 'L' + f(rx - Math.cos(a) * 15) + ' ' + f(ry - Math.sin(a) * 15); }
      s += '<circle cx="' + f(rx) + '" cy="' + f(ry) + '" r="15" fill="none" stroke="' + halo + '" stroke-width="4.6"/><circle cx="' + f(rx) + '" cy="' + f(ry) + '" r="15" fill="none" stroke="' + c + '" stroke-width="2"/>' +
        '<path d="' + sp + '" stroke="' + c + '" stroke-width="2"/>' +
        '<path d="M' + f(rx + 6) + ' ' + f(ry + 18) + ' Q' + f(rx + 20) + ' ' + f(n.y - 60) + ' ' + f(n.x - 40) + ' ' + f(n.y - 30) + '" fill="none" stroke="' + c + '" stroke-width="1.8" stroke-dasharray="5 6"/>';
    }
  }
  if(n.dessin === 'fleur'){
    var fx = b.x + 28, fy = n.y, fl = '';
    for(var j = 0; j < 6; j++){ var an = j * Math.PI / 3, cx = Math.sin(an), cy = -Math.cos(an);
      fl += 'M' + f(fx) + ' ' + f(fy) + 'L' + f(fx + cx * 15) + ' ' + f(fy + cy * 15) + 'M' + f(fx + cx * 9) + ' ' + f(fy + cy * 9) + 'l' + f(cy * 5 - cx * 4) + ' ' + f(-cx * 5 - cy * 4) + 'M' + f(fx + cx * 9) + ' ' + f(fy + cy * 9) + 'l' + f(-cy * 5 - cx * 4) + ' ' + f(cx * 5 - cy * 4); }
    s += '<path d="' + fl + '" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round"/>';
  }
  if(n.fleche) s += fleche(n.fleche[0], n.fleche[1], c);
  n.lignes.forEach(function(l, k){
    var y = n.y + (k - (n.lignes.length - 1) / 2) * t * 1.1;
    s += '<text x="' + f(n.x) + '" y="' + f(y) + '" text-anchor="middle" dominant-baseline="central" font-size="' + t + '" font-family="' + POLICE + '" fill="' + c + '" stroke="' + halo + '" stroke-width="' + f(t * .42) + '" stroke-linejoin="round" paint-order="stroke">' + esc(l) + '</text>';
  });
  return s;
}
function trou(c){ return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="url(#vp-doux)"/>'; }
function encresSVG(){
  var s = '<svg class="vp-encres" xmlns="http://www.w3.org/2000/svg" viewBox="' + [PV.x, PV.y, PV.w, PV.h].map(f).join(' ') + '" width="' + f(PV.w) + '" height="' + f(PV.h) + '" aria-hidden="true">' +
    '<defs><radialGradient id="vp-doux"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
  var g = '', T = UI.vpTrous || {};
  encres().forEach(function(n){
    var fini = revelee(n.id);
    if(!fini) s += '<mask id="vpm-' + esc(n.id) + '" maskUnits="userSpaceOnUse" x="' + f(PV.x) + '" y="' + f(PV.y) + '" width="' + f(PV.w) + '" height="' + f(PV.h) + '"><g class="vpm-g">' + (T[n.id] || []).map(trou).join('') + '</g></mask>';
    g += '<g class="vp-encre vp-' + esc(n.pierre) + (fini ? ' vp-fini' : '') + '" data-encre="' + esc(n.id) + '"' + (fini ? '' : ' mask="url(#vpm-' + esc(n.id) + ')"') + '>' + dessinEncre(n) + '</g>';
  });
  return s + '</defs>' + g + '</svg>';
}

/* ---------- Le point de vue ---------- */
/* la taille du cadre, avant qu'il soit dans la page (les mêmes règles que vieux-plan.css ; corrigée dès qu'il y est : borner) */
function cadreEstime(){
  var iw = window.innerWidth || 800, ih = window.innerHeight || 700;
  return {w:Math.min(920, iw - 34), h:iw <= 600 ? Math.max(300, ih * .54) : Math.max(240, Math.min(ih * .56, 560, iw * .6))};
}
function vue(){
  var P = M.P();
  if(UI.vp && UI.vp.e === (P && P.id)) return UI.vp;
  /* au premier regard : tout le plan sur une tablette ; sur un téléphone (étroit), le plan sur toute la hauteur du cadre, du côté de
     l'entrée — on le fait glisser pour voir le reste */
  var r = cadreEstime(), fit = Math.min(r.w / PV.w, r.h / PV.h);
  UI.vp = (window.innerWidth || 800) > 600 ? {cx:PV.x + PV.w / 2, cy:PV.y + PV.h / 2, z:fit} : {cx:1240, cy:PV.y + PV.h / 2, z:r.h / PV.h};
  UI.vp.e = P && P.id;
  bornerA(UI.vp, r.w, r.h);
  return UI.vp;
}
function transfo(V){ return 'translate3d(' + f(-(V.cx - PV.x) * V.z) + 'px,' + f(-(V.cy - PV.y) * V.z) + 'px,0) scale(' + (Math.round(V.z * 10000) / 10000) + ')'; }
function cadre(el){ return el.getBoundingClientRect(); }
/* le plan ne sort pas du cadre (et s'il est plus petit que le cadre, il reste au milieu) */
function bornerA(V, w, h){
  var fit = Math.min(w / PV.w, h / PV.h);
  V.z = borne(V.z, fit * .92, ZMAX);
  var hw = w / 2 / V.z, hh = h / 2 / V.z;
  V.cx = PV.w <= 2 * hw ? PV.x + PV.w / 2 : borne(V.cx, PV.x + hw, PV.x + PV.w - hw);
  V.cy = PV.h <= 2 * hh ? PV.y + PV.h / 2 : borne(V.cy, PV.y + hh, PV.y + PV.h - hh);
}
function borner(el){ var r = cadre(el); if(r.width) bornerA(vue(), r.width, r.height); }
function appliquer(el, anim){
  var c = el && el.querySelector('.vp-couche'); if(!c) return;
  var t0 = c.style.transform, t1 = transfo(vue());
  c.style.transform = t1;
  if(anim && c.animate && t0 && t0 !== t1) c.animate([{transform:t0}, {transform:t1}], {duration:240, easing:'ease-out'});
  nettete(c);
}
/* après un zoom : le navigateur repeint le plan net à la nouvelle taille (une fois) */
var tNet = 0;
function nettete(c){ clearTimeout(tNet); tNet = setTimeout(function(){ c.style.willChange = 'auto'; requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.style.willChange = 'transform'; }); }); }, 180); }
function versMonde(el, x, y){ var V = vue(), r = cadre(el); return {x:V.cx + (x - (r.left + r.width / 2)) / V.z, y:V.cy + (y - (r.top + r.height / 2)) / V.z}; }
/* zoomer en gardant sous le doigt (x, y : à l'écran) le même point du plan */
function zoomer(el, z, x, y, anim){
  var V = vue(), r = cadre(el); if(x === undefined){ x = r.left + r.width / 2; y = r.top + r.height / 2; }
  var w = versMonde(el, x, y);
  V.z = z; borner(el);
  V.cx = w.x - (x - (r.left + r.width / 2)) / V.z; V.cy = w.y - (y - (r.top + r.height / 2)) / V.z;
  borner(el); appliquer(el, anim);
}

/* ---------- La page ---------- */
function ditHTML(t){ return '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p>'; }
function debut(){ return 'Le vieux plan glisse sous ton doigt, et il s’approche à deux doigts.'; }
function dire(t){
  UI.vpDit = t;
  var d = document.querySelector('.vp-dit'); if(d) d.innerHTML = ditHTML(t);
}
/* le rond jaune sur une pierre de la poche : elle cache de l'encre sur ce plan, et on ne l'y a encore jamais rien réveillé */
function aEssayer(pid){
  var l = encres().filter(function(n){ return n.pierre === pid; });
  return l.length > 0 && !l.some(function(n){ return revelee(n.id); });
}
function poche(){
  var l = pierresDe();
  return '<div class="pp-poche vp-poche"><b>Dans ta poche</b><div class="pp-poche-l">' + (l.length ? l.map(function(p){
    return '<button type="button" class="pp-pierre vp-pierre' + (aEssayer(p.id) ? ' b-guide' : '') + '" data-vp-pierre="' + esc(p.id) + '">' + pierreSVG(p.id, 46) + '<span>' + esc(p.nom) + '</span></button>';
  }).join('') : '<span class="pp-vide">Rien pour l\'instant.</span>') + '</div></div>';
}
M.vieuxPlanHTML = function(){
  var V = vue(), d = dessin(), coin = coinLa(), bc = d.boiteCoin;
  /* le coin perdu vient d'être retrouvé : la première fois qu'on le voit, le conteur le dit */
  var P = M.P();
  if(coin && P && !P.vus['plan:coin:vu']){ P.vus['plan:coin:vu'] = 1; UI.vpDit = 'Le morceau perdu est revenu : ses bords se recollent tout seuls…'; M.sauver(); }
  var cls = 'vp' + (nuit() ? ' vp-nuit' : ' vp-jour') + (coin ? ' vp-coin-la' : '') + codes().filter(lu).map(function(id){ return ' vp-lu-' + id; }).join('');
  /* (au-dessus du plan : ce que dit le conteur, et la poche — la pierre se prend là et descend sur le plan, sans rien faire défiler) */
  var s = '<div class="vp-dit" aria-live="polite">' + ditHTML(UI.vpDit || debut()) + '</div>' + poche();
  s += '<div class="' + cls + '" data-vp role="img" aria-label="Le vieux plan d’Odette : des couloirs, des salles">' +
    '<div class="vp-couche" style="transform:' + transfo(V) + '">' + d.principal +
    (coin ? '<div class="vp-coin" style="left:' + f(bc.x - PV.x) + 'px;top:' + f(bc.y - PV.y) + 'px;width:' + f(bc.w) + 'px;height:' + f(bc.h) + 'px">' + d.coin + '</div>' : '') +
    encresSVG() + '</div>' +
    '<div class="vp-zoom"><button type="button" data-act="vp-zoom" data-z="1" aria-label="Plus près">＋</button><button type="button" data-act="vp-zoom" data-z="-1" aria-label="Plus loin">－</button></div></div>';
  /* (le cadre est dans la page juste après : le point de vue s'ajuste à sa vraie taille) */
  setTimeout(function(){ var el = document.querySelector('[data-vp]'); if(el){ borner(el); appliquer(el); } }, 0);
  s += '<div class="vp-loupe-ici">' + loupeHTML() + '</div>';
  return s;
};

/* ---------- L'encre cachée : la pierre passe, l'encre apparaît ---------- */
function reveler(el, pid, w, wr){
  var res = null;
  UI.vpTrous = UI.vpTrous || {}; UI.vpCases = UI.vpCases || {}; UI.vpVu = UI.vpVu || {};
  encres().forEach(function(n){
    if(n.pierre !== pid || revelee(n.id)) return;
    var b = boite(n);
    if(w.x + wr < b.x || w.x - wr > b.x + b.w || w.y + wr < b.y || w.y - wr > b.y + b.h) return;
    var l = UI.vpTrous[n.id] = UI.vpTrous[n.id] || [], der = l[l.length - 1];
    if(!der || Math.hypot(der[0] - w.x, der[1] - w.y) > wr * .3){
      var c = [f(w.x), f(w.y), f(wr)]; l.push(c);
      var g = el && el.querySelector('#vpm-' + n.id + ' .vpm-g'); if(g) g.insertAdjacentHTML('beforeend', trou(c));
    }
    /* la part découverte : les petites cases de la boîte que la pierre a survolées */
    var cs = UI.vpCases[n.id] = UI.vpCases[n.id] || {}, nx = Math.ceil(b.w / CELL), ny = Math.ceil(b.h / CELL);
    var i0 = Math.max(0, Math.floor((w.x - wr - b.x) / CELL)), i1 = Math.min(nx - 1, Math.floor((w.x + wr - b.x) / CELL)), j0 = Math.max(0, Math.floor((w.y - wr - b.y) / CELL)), j1 = Math.min(ny - 1, Math.floor((w.y + wr - b.y) / CELL));
    for(var j = j0; j <= j1; j++) for(var i = i0; i <= i1; i++){ if(Math.hypot(b.x + (i + .5) * CELL - w.x, b.y + (j + .5) * CELL - w.y) <= wr) cs[j * nx + i] = 1; }
    if(!UI.vpVu[n.id]){ UI.vpVu[n.id] = 1; res = res || {n:n, debut:true}; }
    if(Object.keys(cs).length / (nx * ny) >= .5){ finir(el, n); res = {n:n, fini:true}; }
  });
  return res;
}
function finir(el, n){
  var P = M.P(); if(!P) return;
  P.vus['encre:' + n.id] = 1; M.sauver();
  var g = el && el.querySelector('.vp-encre[data-encre="' + n.id + '"]');
  if(g){ g.removeAttribute('mask'); g.classList.add('vp-fini', 'vp-neuve'); }
  var m = el && el.querySelector('#vpm-' + n.id); if(m && m.parentNode) m.parentNode.removeChild(m);
  M.son('magie'); try{ if(navigator.vibrate) navigator.vibrate([30, 50, 90]); }catch(e){}
  var bt = document.querySelector('.vp-pierre[data-vp-pierre="' + n.pierre + '"]'); if(bt) bt.classList.remove('b-guide');
}
function texteEncre(n){ return n.lignes.join(' ').replace(/\s+/g, ' '); }

/* ---------- Toucher le plan ---------- */
function dans(p, x, y, w, h){ return p.x >= x - w / 2 && p.x <= x + w / 2 && p.y >= y - h / 2 && p.y <= y + h / 2; }
function boiteCode(n){
  var t = 12 * PS.K1, lw = Math.max.apply(null, n.lignes.map(function(m){ return PS.largeurCode(m, t); })) + 40, hh = (n.lignes.length - 1) * t * 1.45 + t + 40;
  return {w:Math.max(lw, 110), h:Math.max(hh, 90)};
}
function toucher(el, p){
  var coinOk = coinLa(), N = nuit();
  if(!coinOk && U.dansPoly(PS.bordCoin, p.x, p.y)){ dire('Un morceau du plan a été arraché… Où peut-il bien être ?'); M.son('tic'); return 'coin'; }
  var cs = codes();
  for(var i = 0; i < cs.length; i++){
    var n = noteCode(cs[i]); if(!n) continue;
    var bx = boiteCode(n);
    if(dans(p, n.x, n.y, bx.w, bx.h)){ ouvrirLoupe(n.id); return 'code:' + n.id; }
  }
  var E = encres();
  for(var k = 0; k < E.length; k++){
    var e = E[k], b = boite(e);
    if(revelee(e.id) && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h){ dire('L’encre cachée dit : « ' + texteEncre(e) + ' ».'); M.son('page'); return 'encre:' + e.id; }
  }
  for(var s = 0; s < C.PLAN.signes.length; s++){
    var sg = C.PLAN.signes[s];
    if(Math.hypot(p.x - sg.x, p.y - sg.y) < Math.max(26, sg.t * .9)){ dire(sg.porte ? 'Sur cette porte, un signe gravé : ' + NOMS_SIGNES[sg.s] + '.' : 'Pas de nom ici, juste un signe : ' + NOMS_SIGNES[sg.s] + '.'); M.son('tic'); return 'signe'; }
  }
  var id = C.lieuEn(p.x, p.y), vieux = !id && U.dansPoly(U.contourTrait(U.lissePts(C.VIEUX), 50), p.x, p.y);
  if(!N){
    if(id === 'egouts'){ dire('Un couloir qui tourne, qui tourne…'); return 'lieu'; }
    if(id === 'dalles'){ dire('Un couloir pavé de cases claires et sombres, comme un damier. Et une note codée, juste à côté.'); return 'lieu'; }
    if(id || vieux){ dire('Quelque chose était écrit ici… L’encre a tant pâli qu’on ne le lit plus.'); M.son('tic'); return 'lieu'; }
    return '';
  }
  if(id === 'galerie' || vieux){ dire('C’est écrit : « La grande galerie ». Sur ce vieux plan, elle va jusqu’à la grotte de givre.'); return 'lieu'; }
  if(id){
    var nom = C.PLAN.noms.filter(function(m){ return m.lieu === id && (!m.coin || coinOk); })[0];
    if(nom){ dire('C’est écrit : « ' + nom.l.join(' ').replace(/\s+/g, ' ') + ' ».'); return 'lieu'; }
    var sg2 = C.PLAN.signes.filter(function(m){ return m.lieu === id && !m.porte; })[0];
    if(sg2){ dire('Pas de nom ici, juste un signe : ' + NOMS_SIGNES[sg2.s] + '.'); return 'lieu'; }
    if(id === 'egouts'){ dire('Un couloir qui tourne, qui tourne…'); return 'lieu'; }
    if(id === 'dalles'){ dire('Un couloir pavé de dalles claires et sombres. Un petit crâne rouge… et une note codée, juste à côté.'); return 'lieu'; }
    if(id === 'porte4' && coinOk){ dire('Une grande porte ronde, avec quatre signes gravés.'); return 'lieu'; }
  }
  return '';
}

/* ---------- La loupe d'une note codée (sous le plan) ---------- */
function loupeHTML(){
  var L = UI.vpLoupe, n = L && noteCode(L.id); if(!n) return '';
  var deja = lu(n.id), nb = 0, saisie = deja ? n.lignes.join('').replace(/ /g, '').split('') : (L.saisie || []);
  var t = deja ? 'Tu l’as déjà déchiffrée : « ' + n.dit + ' ».' : 'Quelqu’un a écrit ces mots avec un drôle d’alphabet. Chaque signe a la forme de sa case dans la grille.';
  var s = '<div class="vp-loupe"><div class="vp-loupe-tete"><b>🔍 Une note codée</b><button type="button" class="vp-fermer" data-act="vp-loupe-fermer" aria-label="Refermer la note">✕</button></div>' +
    '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p><div class="vp-mots">';
  /* (un mot = un bloc : sur un téléphone, la ligne passe à la ligne entre deux mots, jamais au milieu d'un mot) */
  n.lignes.forEach(function(m){
    s += '<div class="vp-ligne">';
    m.split(' ').forEach(function(mot){
      s += '<span class="vp-mot">';
      mot.split('').forEach(function(ch){
        var i = nb++;
        s += '<button type="button" class="vp-l' + (!deja && i === (L.sel || 0) ? ' choisi' : '') + '" data-act="vp-l" data-i="' + i + '">' + PS.glyphes([ch], 30, '#8e2e1c') + '<b>' + esc(saisie[i] || '') + '</b></button>';
      });
      s += '</span>';
    });
    s += '</div>';
  });
  s += '</div><div class="vp-cle">' + PS.cle() + '</div>';
  if(!deja) s += '<div class="vp-clavier">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function(l){ return '<button type="button" data-act="vp-k" data-l="' + l + '">' + l + '</button>'; }).join('') +
    '<button type="button" class="vp-eff" data-act="vp-k" data-l="" aria-label="Effacer">⌫</button></div>';
  if(L.faux){ var tf = 'Hmm… ça ne veut rien dire. Regarde encore la grille.'; s += '<p class="vp-faux">' + esc(tf) + ' ' + lire(tf) + '</p>'; }
  return s + '</div>';
}
function majLoupe(){ var c = document.querySelector('.vp-loupe-ici'); if(c) c.innerHTML = loupeHTML(); }
function ouvrirLoupe(id){
  UI.vpLoupe = {id:id, sel:0, saisie:[]};
  M.son('page'); majLoupe();
  dire(lu(id) ? 'Une note codée… tu l’as déjà déchiffrée.' : 'Une note codée ! Regarde-la de près, juste en dessous.');
  var c = document.querySelector('.vp-loupe'); if(c && c.scrollIntoView) try{ c.scrollIntoView({block:'nearest', behavior:'smooth'}); }catch(e){ c.scrollIntoView(false); }
}
A['vp-loupe-fermer'] = function(){ UI.vpLoupe = null; M.son('page'); majLoupe(); };
A['vp-l'] = function(el){ if(!UI.vpLoupe) return; UI.vpLoupe.sel = +el.dataset.i; M.son('tic'); majLoupe(); };
A['vp-k'] = function(el){
  var L = UI.vpLoupe, n = L && noteCode(L.id); if(!n || lu(n.id)) return;
  var rep = n.lignes.join('').replace(/ /g, '').split(''), l = el.dataset.l || '';
  L.saisie = L.saisie || []; L.faux = false; M.son('tic');
  if(!l){ L.saisie[L.sel || 0] = ''; majLoupe(); return; }
  L.saisie[L.sel || 0] = l; if((L.sel || 0) < rep.length - 1) L.sel = (L.sel || 0) + 1;
  if(rep.every(function(x, i){ return L.saisie[i]; })){
    if(L.saisie.join('') === rep.join('')){
      var P = M.P(); P.vus['plan:lu:' + n.id] = 1; M.sauver(); M.son('ok');
      var v = document.querySelector('[data-vp]'); if(v) v.classList.add('vp-lu-' + n.id);
      dire('Déchiffré : « ' + n.dit + ' ». Le crayon l’a noté sur le plan.');
    } else { L.faux = true; M.son('ko'); }
  }
  majLoupe();
};
A['vp-zoom'] = function(el){
  var v = el.closest('[data-vp]'); if(!v) return;
  zoomer(v, vue().z * (+el.dataset.z > 0 ? 1.45 : 1 / 1.45), undefined, undefined, true); M.son('tic');
};

/* ---------- Les gestes (pris avant le livre : glisser le plan ne tourne pas la page) ---------- */
var G = null;   /* une pierre qu'on promène : {pid, pt, x0, y0, glisse, fantome, el, chemin, rien, dernier} */
var T = null;   /* le plan qu'on fait glisser ou qu'on zoome : {el, pts, pan, pinch} */
function sousPierre(x, y){ return {x:x, y:y - 74}; }   /* la pierre est dessinée au-dessus du doigt : c'est sous elle que l'encre apparaît */
function dansCadre(el, x, y){ var r = cadre(el); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
document.addEventListener('pointerdown', function(e){
  if(!e.target.closest) return;
  if(e.pointerType === 'mouse' && e.button !== 0) return;
  var b = e.target.closest('.vp-pierre');
  if(b){
    e.stopPropagation();
    G = {pid:b.dataset.vpPierre, pt:e.pointerId, x0:e.clientX, y0:e.clientY, glisse:false, fantome:null, el:document.querySelector('[data-vp]'), chemin:0, rien:false, dernier:null, vu:false};
    return;
  }
  var el = e.target.closest('[data-vp]'); if(!el) return;
  e.stopPropagation();   /* le livre ne commence pas à tourner sa page */
  if(e.target.closest('button')) return;
  if(!T || T.el !== el) T = {el:el, pts:{}};
  T.pts[e.pointerId] = {x:e.clientX, y:e.clientY};
  try{ el.setPointerCapture(e.pointerId); }catch(er){}
  var ids = Object.keys(T.pts);
  if(ids.length === 1){ var V = vue(); T.pan = {x:e.clientX, y:e.clientY, cx:V.cx, cy:V.cy, bouge:false, t:Date.now()}; T.pinch = null; }
  else if(ids.length === 2){
    var a = T.pts[ids[0]], c = T.pts[ids[1]], mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2;
    T.pinch = {d:Math.hypot(a.x - c.x, a.y - c.y) || 1, z:vue().z, w:versMonde(el, mx, my)}; T.pan = null;
  }
}, true);
document.addEventListener('pointermove', function(e){
  if(G && e.pointerId === G.pt){
    var dx = e.clientX - G.x0, dy = e.clientY - G.y0;
    if(!G.glisse){
      if(dx * dx + dy * dy < 49) return;
      G.glisse = true;
      var fa = G.fantome = document.createElement('div');
      fa.className = 'vp-fantome vp-f-' + G.pid; fa.innerHTML = pierreSVG(G.pid, 64);
      document.body.appendChild(fa);
      document.documentElement.classList.add('pp-glisse');
      if(!G.vu){ G.vu = true; var Pi = pierresDe().filter(function(p){ return p.id === G.pid; })[0]; dire((Pi ? Pi.nom : 'La pierre') + ' est dans ta main. Promène-la sur le vieux plan…'); }
    }
    e.stopPropagation(); if(e.cancelable) e.preventDefault();
    G.fantome.style.transform = 'translate(' + (e.clientX - 32) + 'px,' + (e.clientY - 104) + 'px)';
    var q = sousPierre(e.clientX, e.clientY), chaud = false;
    if(G.el && dansCadre(G.el, q.x, q.y)){
      var w = versMonde(G.el, q.x, q.y), wr = 46 / vue().z, res = null;
      /* entre deux images, on comble le trajet (pas de trous si le doigt va vite) */
      if(G.dernier){ var d = Math.hypot(w.x - G.dernier.x, w.y - G.dernier.y), nn = Math.min(30, Math.ceil(d / (wr * .5))); for(var k = 1; k < nn; k++){ var r2 = reveler(G.el, G.pid, {x:G.dernier.x + (w.x - G.dernier.x) * k / nn, y:G.dernier.y + (w.y - G.dernier.y) * k / nn}, wr); res = res || r2; } }
      res = reveler(G.el, G.pid, w, wr) || res;
      if(G.dernier) G.chemin += Math.hypot(w.x - G.dernier.x, w.y - G.dernier.y) * vue().z;
      G.dernier = w;
      chaud = encres().some(function(n){ var b = boite(n); return n.pierre === G.pid && w.x + wr > b.x && w.x - wr < b.x + b.w && w.y + wr > b.y && w.y - wr < b.y + b.h; });
      if(res && res.fini) dire('L’encre se réveille : « ' + texteEncre(res.n) + ' » !');
      else if(res && res.debut) dire('Oh ! De l’encre apparaît sous la pierre… Continue, doucement.');
      else if(!chaud && !G.rien && G.chemin > 420 && !encres().some(function(n){ return n.pierre === G.pid && UI.vpVu && UI.vpVu[n.id] && !revelee(n.id); })){
        G.rien = true;
        var reste = encres().some(function(n){ return n.pierre === G.pid && !revelee(n.id); });
        dire(reste ? 'Rien ici… La pierre reste froide. Cherche encore !' : 'Cette pierre a réveillé tout ce qu’elle savait.');
      }
    } else G.dernier = null;
    G.fantome.classList.toggle('vp-chaud', chaud);
    return;
  }
  if(!T || !T.pts[e.pointerId]) return;
  e.stopPropagation(); if(e.cancelable) e.preventDefault();
  T.pts[e.pointerId] = {x:e.clientX, y:e.clientY};
  var ids = Object.keys(T.pts), V = vue();
  if(ids.length >= 2 && T.pinch){
    var a = T.pts[ids[0]], c = T.pts[ids[1]], mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2, r = cadre(T.el);
    V.z = T.pinch.z * (Math.hypot(a.x - c.x, a.y - c.y) || 1) / T.pinch.d; borner(T.el);
    V.cx = T.pinch.w.x - (mx - (r.left + r.width / 2)) / V.z; V.cy = T.pinch.w.y - (my - (r.top + r.height / 2)) / V.z;
    borner(T.el); appliquer(T.el);
    return;
  }
  if(!T.pan) return;
  var dx2 = e.clientX - T.pan.x, dy2 = e.clientY - T.pan.y;
  if(!T.pan.bouge && Math.abs(dx2) + Math.abs(dy2) > 8){ T.pan.bouge = true; T.el.classList.add('vp-glisse'); }
  if(T.pan.bouge){ V.cx = T.pan.cx - dx2 / V.z; V.cy = T.pan.cy - dy2 / V.z; borner(T.el); appliquer(T.el); }
}, true);
var dernierTap = 0;
function fin(e, annule){
  if(G && e.pointerId === G.pt){
    var g = G; G = null;
    if(g.fantome && g.fantome.parentNode) g.fantome.parentNode.removeChild(g.fantome);
    document.documentElement.classList.remove('pp-glisse');
    e.stopPropagation();
    if(!g.glisse && !annule){
      var Pi = pierresDe().filter(function(p){ return p.id === g.pid; })[0];
      dire((Pi ? Pi.nom : 'La pierre') + ' : prends-la, et fais-la glisser sur le vieux plan !'); M.son('clic');
      var bt = document.querySelector('.vp-pierre[data-vp-pierre="' + g.pid + '"]'); if(bt && bt.animate) bt.animate([{transform:'none'}, {transform:'translateY(-8px)'}, {transform:'none'}], {duration:360});
    }
    return;
  }
  if(!T || !T.pts[e.pointerId]) return;
  e.stopPropagation();
  delete T.pts[e.pointerId];
  var ids = Object.keys(T.pts);
  if(T.pinch && ids.length < 2){ T.pinch = null; if(ids.length === 1){ var a = T.pts[ids[0]], V = vue(); T.pan = {x:a.x, y:a.y, cx:V.cx, cy:V.cy, bouge:true, t:0}; } return; }
  if(!ids.length && T.pan){
    var p = T.pan; T.pan = null; T.el.classList.remove('vp-glisse');
    if(!p.bouge && !annule && Date.now() - p.t < 600){
      var n = Date.now();
      if(n - dernierTap < 320){ dernierTap = 0; var zf = vue().z; zoomer(T.el, zf * 1.8, e.clientX, e.clientY, true); return; }
      dernierTap = n;
      toucher(T.el, versMonde(T.el, e.clientX, e.clientY));
    }
  }
}
document.addEventListener('pointerup', function(e){ fin(e, false); }, true);
document.addEventListener('pointercancel', function(e){ fin(e, true); }, true);
document.addEventListener('wheel', function(e){
  var el = e.target.closest && e.target.closest('[data-vp]'); if(!el) return;
  e.preventDefault(); e.stopPropagation();
  zoomer(el, vue().z * Math.exp(-e.deltaY * .0016), e.clientX, e.clientY, false);
}, {capture:true, passive:false});
/* (une page redessinée, ou l'écran tourné : le point de vue reste dans le plan) */
window.addEventListener('resize', function(){ var el = document.querySelector('[data-vp]'); if(el){ borner(el); appliquer(el); } });

/* pour les robots : l'état, promener une pierre le long d'une ligne (unités du plan), toucher un point du plan */
window.__vp = {
  etat:function(){ var P = M.P(); return {vue:vue(), revelees:encres().filter(function(n){ return revelee(n.id); }).map(function(n){ return n.id; }), lu:codes().filter(lu), nuit:nuit(), dit:UI.vpDit || ''}; },
  promener:function(pid, pts, wr){ var el = document.querySelector('[data-vp]'), r = null; pts.forEach(function(p){ r = reveler(el, pid, {x:p[0], y:p[1]}, wr || 40) || r; }); return r ? {id:r.n.id, fini:!!r.fini} : null; },
  toucher:function(x, y){ var el = document.querySelector('[data-vp]'); return el ? toucher(el, {x:x, y:y}) : ''; },
  encres:function(){ return encres().map(function(n){ var b = boite(n); return {id:n.id, pierre:n.pierre, x:n.x, y:n.y, b:b}; }); },
  versEcran:function(x, y){ var el = document.querySelector('[data-vp]'), V = vue(), r = cadre(el); return {x:r.left + r.width / 2 + (x - V.cx) * V.z, y:r.top + r.height / 2 + (y - V.cy) * V.z}; },
  centrer:function(x, y, z){ var el = document.querySelector('[data-vp]'), V = vue(); V.cx = x; V.cy = y; if(z) V.z = z; if(el){ borner(el); appliquer(el); } }
};
})();
