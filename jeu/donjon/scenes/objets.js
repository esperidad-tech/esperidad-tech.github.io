/* objets.js — les choses à toucher des salles sans combat du donjon (Les Enquêteurs de Brumeval).
   Module autonome, sans dépendance. Les dessins viennent de scenes.js (SCENES.salle(id).elements).

   RAPIDITÉ (règle de Romain du 9 novembre ; jeu/donjon/anim/betes/CONTRAT.md §4 bis) :
     - chaque pièce est une petite image (le SVG du dessin en <img>), dessinée une fois par le navigateur ;
     - on n'anime QUE transform et opacity (Web Animations ou CSS) : la carte graphique s'en charge ;
     - aucun filtre (ni SVG, ni CSS), aucun mix-blend-mode, aucune ombre animée ; les lueurs sont des dégradés radiaux ;
     - au plus ~25 particules à la fois, retirées à la fin.

   OBJETS.creer(conteneur, def, opts) -> l'élément posé. Le conteneur est la scène (960 × 372, position relative) ;
   les positions de def sont dans ce repère. opts : {fond: url du PNG du fond (pour les découpes), planche: true (pas d'arrivée)}.

   Commun à tous :  el (la racine), zone (ce qu'on touche, ou null), def,
                    surToucher(fn)          fn(objet, evenement) quand on touche la zone
                    guider(on)              le rond jaune qui pulse (et l'élément qui respire), comme partout dans le jeu
                    briller(on)             la brillance (lueur en dégradé qui palpite + petits scintillements)
                    arreter()               coupe ses boucles ;  detruire()  le retire
   type 'objet'     prendre(vers, o) -> Promise   il saute, tourne et vole jusqu'à vers ({x, y} dans la scène, {x, y, ecran: true}
                                                   en pixels d'écran, ou un élément HTML : son centre), avec une traînée
                                                   d'étincelles ; o.onSaut(), o.onArrivee() ; à la fin il est caché
                    montrer() / cacher()    apparaître (petit bond) / disparaître
                    eteindre()              il ne brille plus et reste là, terne (l'objet qu'on n'a pas choisi)
   type 'choix'     ouvrir() -> Promise    (s'il y a un coffre) le couvercle s'ouvre, les deux objets montent et brillent
                    choisir(i, vers, o) -> Promise   options[i] s'envole (prendre), l'autre s'éteint et reste
                    options : [objet, objet] (chacun a sa zone : le moteur sait lequel on touche)
   type 'tas'       fouiller(o) -> Promise<objet|null>   le tas remue, des os volent, la trouvaille sort (o.trouve : 'page' par
                                                   défaut, ou 'morsure' : un rat surgit et mord, o.onMorsure()) ; renvoie la trouvaille
   type 'crane'     reveler() -> Promise    l'encre invisible : le contour du crâne s'allume et luit ;  etat(revele)
                    ouvrir() -> Promise     le pan de mur glisse : le passage secret (vers le feu de camp)
   type 'dalle'     marcher() -> Promise    (dalle claire) on y pose le pied : rien ne se passe, ouf
                    pieger(o) -> Promise    (dalle sombre) elle s'enfonce, des pointes et un jet de poussière jaillissent (o.onPiege())
   type 'porte'     toucher() -> Promise    le signe s'allume ;  ouvrir() -> Promise  le battant s'enfonce dans le sol
   type 'sarcophage' ouvrir() -> Promise<objet>   le couvercle glisse, l'amulette brille dedans ;  amulette : l'objet à prendre
   type 'feu'       attiser() -> Promise    il crépite plus fort (et des braises montent) ; il ondule tout seul sinon
   type 'chat'      gratter(n), seRetourner(), miauler(), revenir(), scene() -> Promise   (Moustache devant la porte)
   type 'leo'       lever(), recroqueviller(o), trembler(on) -> Promise   (Léo, coincé avec sa lanterne)
   type 'deco'      un détail d'ambiance qui bouge seul (def.anim : 'balance', 'flotte', 'pulse')
   type 'particules' de la poussière, des flocons, des spores, des lucioles, des feuilles, des gouttes, des braises

   OBJETS.pause(conteneur, oui)   met en pause (ou relance) toutes les animations d'une scène (une scène cachée ne coûte rien). */
(function(global){
'use strict';
var OBJETS = global.OBJETS = global.OBJETS || {};
if(OBJETS.creer) return;

/* ================= le CSS (une seule fois) ================= */
var CSS = [
  '.ob{position:absolute;pointer-events:none;-webkit-user-select:none;user-select:none}',
  '.ob img{position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none}',
  '.ob-p{position:absolute;will-change:transform,opacity}',
  '.ob-cache{opacity:0}',
  '.ob-zone{position:absolute;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;z-index:2}',
  '.ob-zone.ob-off{pointer-events:none}',
  /* la brillance : une lueur ronde (dégradé) qui palpite, et trois petites étoiles qui scintillent */
  '.ob-halo{position:absolute;left:50%;top:50%;width:0;height:0;opacity:0;transition:opacity .6s ease}',
  '.ob-brille>.ob-halo,.ob-brille>.ob-corps>.ob-halo{opacity:1}',
  '.ob-lueur{position:absolute;border-radius:50%;will-change:transform,opacity}',
  '.ob-brille .ob-lueur{animation:ob-pulse 2.6s ease-in-out infinite}',
  '@keyframes ob-pulse{0%,100%{transform:scale(.88);opacity:.7}50%{transform:scale(1.08);opacity:1}}',
  '.ob-st{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;opacity:0;will-change:transform,opacity;background:no-repeat center/contain}',
  '.ob-brille .ob-st{animation:ob-scint 2.4s linear infinite}',
  '@keyframes ob-scint{0%,58%,100%{transform:scale(0) rotate(0deg);opacity:0}68%{transform:scale(1) rotate(45deg);opacity:1}80%{transform:scale(.15) rotate(100deg);opacity:0}}',
  /* le rond jaune (le même que dans tout le jeu : il pulse, une onde part de lui toutes les 1,3 s) */
  '.ob-rond{position:absolute;border-radius:50%;pointer-events:none;display:none;z-index:3}',
  '.ob-guide>.ob-rond{display:block;animation:ob-arrive .24s ease-out}',
  '@keyframes ob-arrive{from{opacity:0}to{opacity:1}}',
  '.ob-anneau,.ob-onde{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;will-change:transform,opacity}',
  '.ob-anneau{border:4px solid #ffd23f;box-shadow:0 0 0 3px rgba(36,24,46,.55),0 0 16px 5px rgba(255,210,63,.65),inset 0 0 10px rgba(255,210,63,.45)}',
  '.ob-onde{border:3px solid #ffd23f;opacity:0}',
  '.ob-guide>.ob-rond>.ob-anneau{animation:ob-rpulse 1.3s ease-in-out infinite}',
  '.ob-guide>.ob-rond>.ob-onde{animation:ob-onde 1.3s ease-out infinite}',
  '@keyframes ob-rpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}',
  '@keyframes ob-onde{0%{transform:scale(1);opacity:.85}100%{transform:scale(1.45);opacity:0}}',
  '.ob-guide .ob-respire{animation:ob-respire 1.3s ease-in-out infinite}',
  '@keyframes ob-respire{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}',
  '.ob-corps,.ob-flotte,.ob-respire{position:absolute;left:0;top:0;width:100%;height:100%;will-change:transform,opacity}',
  '.ob-ombre{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.55),rgba(0,0,0,0));transition:opacity .4s}',
  /* les particules (étincelles, poussière, os…) */
  '.ob-fx{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:80}',
  '.ob-pt{position:absolute;left:0;top:0;will-change:transform,opacity;background:no-repeat center/contain;pointer-events:none}',
  '.ob-terne{opacity:.55;transition:opacity .8s}'
].join('');
function css(){
  if(document.getElementById('ob-css')) return;
  var s = document.createElement('style'); s.id = 'ob-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* ================= les petits outils ================= */
function el(tag, cls, parent){ var e = document.createElement(tag); if(cls) e.className = cls; if(parent) parent.appendChild(e); return e; }
function urlSvg(svg){ return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
function img(svg, parent){ var i = el('img', '', parent); i.alt = ''; i.draggable = false; i.decoding = 'async'; i.src = urlSvg(svg); return i; }
function boite(e, x, y, w, h){ e.style.left = x + 'px'; e.style.top = y + 'px'; if(w != null){ e.style.width = w + 'px'; e.style.height = h + 'px'; } return e; }
function fini(a){ return new Promise(function(ok){ if(!a){ ok(); return; } a.onfinish = function(){ ok(); }; a.oncancel = function(){ ok(); }; }); }
function pause(ms){ return new Promise(function(ok){ setTimeout(ok, ms); }); }
function rgba(c, a){ c = c.replace('#', ''); return 'rgba(' + parseInt(c.substr(0, 2), 16) + ',' + parseInt(c.substr(2, 2), 16) + ',' + parseInt(c.substr(4, 2), 16) + ',' + a + ')'; }
var ALEA = (function(){ var s = 1234; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
function entre(a, b){ return a + (b - a) * ALEA(); }
var ETOILE = {};
function etoile(c){
  c = c || '#ffffff';
  if(!ETOILE[c]) ETOILE[c] = 'url("' + urlSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20"><defs><radialGradient id="g"><stop offset="0" stop-color="' + c + '" stop-opacity=".9"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient></defs>' +
    '<circle r="7" fill="url(#g)"/><path d="M0 -10 L 1.6 -1.6 L 10 0 L 1.6 1.6 L 0 10 L -1.6 1.6 L -10 0 L -1.6 -1.6 Z" fill="#fff"/><path d="M0 -6 L 1 -1 L 6 0 L 1 1 L 0 6 L -1 1 L -6 0 L -1 -1 Z" fill="' + c + '"/></svg>') + '")';
  return ETOILE[c];
}
function rond(c, a){ return 'radial-gradient(closest-side,' + rgba(c, a == null ? 1 : a) + ',' + rgba(c, (a == null ? 1 : a) * 0.5) + ' 45%,' + rgba(c, 0) + ')'; }

/* le repère de la scène : un point écran -> un point de la scène (la scène peut être agrandie ou réduite) */
function echelle(c){ var r = c.getBoundingClientRect(); return {r: r, k: (r.width / (c.offsetWidth || r.width)) || 1}; }
function versScene(c, p){
  if(!p) return null;
  if(p.nodeType === 1){ var b = p.getBoundingClientRect(); p = {x: b.left + b.width / 2, y: b.top + b.height / 2, ecran: true}; }
  if(!p.ecran) return {x: p.x, y: p.y};
  var e = echelle(c); return {x: (p.x - e.r.left) / e.k, y: (p.y - e.r.top) / e.k};
}
/* le calque des particules d'une scène */
function calque(c){ var f = c.querySelector(':scope > .ob-fx'); if(!f){ f = el('div', 'ob-fx', c); } return f; }
/* une particule : (x, y) dans la scène, sz : taille, fond : image ou dégradé, kf : images clés (transform / opacity), o : timing */
function particule(c, x, y, sz, fond, kf, o){
  var p = el('i', 'ob-pt', calque(c));
  p.style.width = sz + 'px'; p.style.height = sz + 'px'; p.style.left = (x - sz / 2) + 'px'; p.style.top = (y - sz / 2) + 'px';
  if(fond.indexOf('gradient') >= 0) p.style.backgroundImage = fond; else p.style.backgroundImage = fond;
  if(o && o.rond) p.style.borderRadius = '50%';
  var a = p.animate(kf, Object.assign({fill: 'both', easing: 'ease-out'}, o || {}));
  a.onfinish = function(){ p.remove(); };
  a.oncancel = function(){ p.remove(); };
  return a;
}
function bezier(a, b, c, t){ var u = 1 - t; return {x: u * u * a.x + 2 * u * t * b.x + t * t * c.x, y: u * u * a.y + 2 * u * t * b.y + t * t * c.y}; }
function tr(x, y, r, s, sy){ return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (r || 0).toFixed(1) + 'deg) scale(' + (s == null ? 1 : s).toFixed(3) + (sy != null ? ',' + sy.toFixed(3) : '') + ')'; }

/* ================= la base commune ================= */
function Base(c, def, opts){
  css();
  this.c = c; this.def = def; this.opts = opts || {};
  this.boucles = []; this.p = {};
  if(getComputedStyle(c).position === 'static') c.style.position = 'relative';
  this.el = boite(el('div', 'ob ob-' + (def.type || 'objet'), c), def.x, def.y, def.w, def.h);
  this.el.setAttribute('data-ob', def.id || '');
  if(def.z != null) this.el.style.zIndex = def.z;
  this.zone = null;
}
Base.prototype.faireZone = function(z, parent){
  z = z || this.def.zone; if(!z) return null;
  var d = this.def, e = boite(el('div', 'ob-zone', parent || this.el), z.x - d.x, z.y - d.y, z.w, z.h);
  e.setAttribute('role', 'button'); e.setAttribute('aria-label', d.nom || d.id || '');
  this.zone = this.zone || e;
  this.faireRond(z, parent);
  return e;
};
Base.prototype.faireRond = function(z, parent){
  var d = this.def, m = 6, w = Math.max(z.w, z.h * 0.8) + m * 2, h = Math.max(z.h, z.w * 0.6) + m * 2;
  var r = boite(el('div', 'ob-rond', parent || this.el), z.x - d.x + z.w / 2 - w / 2, z.y - d.y + z.h / 2 - h / 2, w, h);
  el('div', 'ob-anneau', r); el('div', 'ob-onde', r);
  return r;
};
/* pour un élément dont le cadre coupe (overflow caché) : la zone et le rond jaune vont dans une « sœur » posée au même endroit */
Base.prototype.horsCadre = function(){
  var d = this.def, so = boite(el('div', 'ob'), d.x, d.y, d.w, d.h); so.style.zIndex = (d.z || 5) + 1;
  this.c.appendChild(so);
  [].slice.call(this.el.querySelectorAll(':scope > .ob-zone, :scope > .ob-rond')).forEach(function(z){ so.appendChild(z); });
  this.soeur = so; this.apres = (this.apres || []).concat([so]);
};
Base.prototype.cadreZones = function(){ return this.soeur || this.el; };
Base.prototype.surToucher = function(fn){ var self = this; [].forEach.call(this.cadreZones().querySelectorAll('.ob-zone'), function(z){ z.addEventListener('click', function(ev){ fn(self, ev); }); }); return this; };
Base.prototype.guider = function(on){ this.cadreZones().classList.toggle('ob-guide', !!on); return this; };
Base.prototype.briller = function(on){ this.el.classList.toggle('ob-brille', !!on); return this; };
Base.prototype.boucle = function(e, kf, o){ var a = e.animate(kf, Object.assign({iterations: Infinity, easing: 'ease-in-out'}, o)); this.boucles.push(a); return a; };
Base.prototype.arreter = function(){ this.boucles.forEach(function(a){ a.cancel(); }); this.boucles = []; return this; };
Base.prototype.detruire = function(){ this.arreter(); this.el.remove(); if(this.apres) this.apres.forEach(function(e){ e.remove(); }); };
Base.prototype.actif = function(on){ [].forEach.call(this.cadreZones().querySelectorAll('.ob-zone'), function(z){ z.classList.toggle('ob-off', !on); }); return this; };
/* les pièces dessinées (def.pieces) : chacune un <div> à sa place, avec son pivot ; « dans » : la pièce qui la porte */
Base.prototype.pieces = function(liste, parent){
  var self = this;
  (liste || []).forEach(function(q){
    var hote = q.dans ? self.p[q.dans] : (parent || self.el);
    var e = boite(el('div', 'ob-p' + (q.cache ? ' ob-cache' : ''), hote), q.x, q.y, q.w, q.h);
    e.style.transformOrigin = (q.ox == null ? q.w / 2 : q.ox) + 'px ' + (q.oy == null ? q.h / 2 : q.oy) + 'px';
    if(q.z != null) e.style.zIndex = q.z;
    if(q.svg) img(q.svg, e);
    if(q.lueur) { e.style.borderRadius = '50%'; e.style.background = rond(q.lueur, q.force == null ? 0.7 : q.force); }
    self.p[q.id] = e;
  });
};
/* une lueur ronde et ses étoiles, dans un hôte (pour la brillance) */
function faireHalo(hote, w, h, c, n){
  var halo = el('div', 'ob-halo', hote), lu = el('div', 'ob-lueur', halo);
  var lw = Math.max(70, w * 1.9), lh = Math.max(64, h * 1.6);
  boite(lu, -lw / 2, -lh / 2, lw, lh); lu.style.background = rond(c, 0.75);
  var pos = [[-0.32, -0.34], [0.36, -0.12], [-0.08, 0.3], [0.28, 0.36]];
  for(var i = 0; i < (n == null ? 3 : n); i++){ var st = el('i', 'ob-st', halo); st.style.left = (pos[i][0] * w) + 'px'; st.style.top = (pos[i][1] * h) + 'px';
    st.style.backgroundImage = etoile(i === 1 ? '#ffffff' : c); st.style.animationDelay = (i * 0.8) + 's'; }
  return halo;
}

/* ================= l'objet à prendre ================= */
function Objet(c, def, opts){
  Base.call(this, c, def, opts);
  var e = this.el, d = def;
  if(d.ombre !== false && d.sol){ this.ombre = boite(el('div', 'ob-ombre', e), d.w * 0.08, d.h - 7, d.w * 0.84, 14); }
  this.corps = el('div', 'ob-corps', e);
  this.halo = faireHalo(this.corps, d.w, d.h, d.lueur || '#ffe08a');
  this.halo.style.left = (d.w / 2) + 'px'; this.halo.style.top = (d.h * 0.5) + 'px';
  var fl = el('div', 'ob-flotte', this.corps), re = el('div', 'ob-respire', fl);
  re.style.transformOrigin = '50% 70%';
  img(d.svg, re);
  this.image = re;
  if(d.flotte) this.boucle(fl, [{transform: 'translateY(0)'}, {transform: 'translateY(-' + (d.flotte === true ? 4 : d.flotte) + 'px)'}, {transform: 'translateY(0)'}], {duration: 2400, delay: -ALEA() * 2400});
  this.faireZone();
  if(d.brille !== false) this.briller(true);
  if(d.cache) this.cacher(true);
}
Objet.prototype = Object.create(Base.prototype);
Objet.prototype.cacher = function(net){ this.el.style.opacity = 0; this.actif(false); if(net) this.el.style.visibility = 'hidden'; return this; };
Objet.prototype.montrer = function(){
  var e = this.el; e.style.visibility = ''; this.actif(true);
  var a = e.animate([{opacity: 0, transform: 'translateY(14px) scale(.6)'}, {opacity: 1, transform: 'translateY(-10px) scale(1.12)', offset: 0.6}, {opacity: 1, transform: 'none'}], {duration: 520, easing: 'ease-out'});
  e.style.opacity = 1;
  return fini(a);
};
Objet.prototype.eteindre = function(){ this.briller(false); this.guider(false); this.actif(false); this.corps.classList.add('ob-terne');
  return fini(this.corps.animate([{transform: 'none'}, {transform: 'translateY(4px) scale(.96)'}], {duration: 600, fill: 'forwards', easing: 'ease-out'})); };
Objet.prototype.prendre = function(vers, o){
  o = o || {};
  if(this.pris) return Promise.resolve();
  this.pris = true; this.guider(false); this.actif(false);
  var self = this, c = this.c, d = this.def, e = this.el;
  var p0 = {x: d.x + d.w / 2, y: d.y + d.h / 2}, p1 = versScene(c, vers) || {x: p0.x, y: -80};
  e.style.zIndex = 70;
  this.briller(false);
  if(this.ombre) this.ombre.style.opacity = 0;
  var dur = o.duree || 1200, saut = Math.min(52, 18 + d.h * 0.4), N = 14, kf = [];
  var dx = p1.x - p0.x, dy = p1.y - p0.y, sFin = o.echelleFin || Math.max(0.3, Math.min(0.6, 40 / Math.max(d.w, d.h)));
  kf.push({offset: 0, transform: tr(0, 0, 0, 1), opacity: 1});
  kf.push({offset: 0.08, transform: tr(0, 5, 0, 1.14, 0.84), opacity: 1});
  kf.push({offset: 0.22, transform: tr(0, -saut, -14, 1.3), opacity: 1});
  kf.push({offset: 0.3, transform: tr(0, -saut - 4, -10, 1.32), opacity: 1});
  var A = {x: 0, y: -saut - 4}, B = {x: dx, y: dy}, C = {x: dx * 0.42, y: Math.min(A.y, dy) - 90 - Math.abs(dx) * 0.08};
  var traine = [];
  for(var i = 1; i <= N; i++){
    var t = Math.pow(i / N, 1.35), pt = bezier(A, C, B, t), off = 0.3 + 0.7 * i / N;
    kf.push({offset: off, transform: tr(pt.x, pt.y, -10 + 380 * t, 1.32 + (sFin - 1.32) * t), opacity: t > 0.92 ? Math.max(0, 1 - (t - 0.92) / 0.08) : 1});
    if(i >= 2 && i <= N - 1 && traine.length < 12) traine.push({x: p0.x + pt.x, y: p0.y + pt.y, quand: off * dur});
  }
  var a = this.corps.animate(kf, {duration: dur, easing: 'linear', fill: 'forwards'});
  if(o.onSaut) setTimeout(o.onSaut, dur * 0.2);
  /* la traînée d'étincelles (au plus 12), chacune au moment où l'objet passe */
  var coul = d.lueur || '#ffe08a';
  traine.forEach(function(q, k){
    var sz = 12 + (k % 3) * 4;
    particule(c, q.x + entre(-6, 6), q.y + entre(-6, 6), sz, etoile(k % 2 ? '#ffffff' : coul),
      [{transform: 'scale(0) rotate(0deg)', opacity: 0}, {transform: 'scale(1) rotate(60deg)', opacity: 1, offset: 0.2}, {transform: 'translate(' + entre(-10, 10).toFixed(0) + 'px,' + entre(6, 22).toFixed(0) + 'px) scale(0) rotate(160deg)', opacity: 0}],
      {duration: 620, delay: q.quand, easing: 'ease-out'});
  });
  return fini(a).then(function(){
    /* le « pop » d'arrivée : une onde et quelques étoiles */
    particule(c, p1.x, p1.y, 60, rond(coul, 0.8), [{transform: 'scale(.2)', opacity: 1}, {transform: 'scale(1.3)', opacity: 0}], {duration: 420});
    for(var k = 0; k < 5; k++){ var an = k / 5 * Math.PI * 2 + 0.3;
      particule(c, p1.x, p1.y, 14, etoile(k % 2 ? '#ffffff' : coul), [{transform: 'translate(0,0) scale(.4)', opacity: 1}, {transform: 'translate(' + (Math.cos(an) * 34).toFixed(0) + 'px,' + (Math.sin(an) * 34).toFixed(0) + 'px) scale(0) rotate(120deg)', opacity: 0}], {duration: 520}); }
    e.style.visibility = 'hidden';
    if(o.onArrivee) o.onArrivee(self);
    return pause(80);
  });
};

/* ================= le coffre (ou le lutrin) à deux objets : on n'en prend qu'un ================= */
function Choix(c, def, opts){
  Base.call(this, c, def, opts);
  var self = this, d = def;
  this.pieces(d.pieces);
  /* les deux objets : posés dans la scène, entre l'arrière du coffre et son devant */
  this.options = (d.options || []).map(function(od){ var o = OBJETS.creer(c, Object.assign({z: (d.z || 4) + 1}, od), opts); return o; });
  if(d.devant){ this.devant = boite(el('div', 'ob ob-devant', c), d.devant.x, d.devant.y, d.devant.w, d.devant.h); this.devant.style.zIndex = (d.z || 4) + 2; img(d.devant.svg, this.devant); this.apres = [this.devant]; }
  this.ouvert = !d.ferme;
  if(d.ferme){ this.options.forEach(function(o){ o.cacher(); o.briller(false); }); this.faireZone(); }
}
Choix.prototype = Object.create(Base.prototype);
Choix.prototype.guider = function(on){ if(!this.ouvert) Base.prototype.guider.call(this, on); else this.options.forEach(function(o){ if(!o.pris) o.guider(on); }); return this; };
Choix.prototype.ouvrir = function(){
  if(this.ouvert) return Promise.resolve();
  this.ouvert = true; Base.prototype.guider.call(this, false); this.actif(false);
  var p = this.p, self = this;
  if(p.ferme) p.ferme.animate([{opacity: 1}, {opacity: 0}], {duration: 160, fill: 'forwards'});
  var a = p.ouvert ? p.ouvert.animate([{opacity: 0, transform: 'scaleY(.15)'}, {opacity: 1, transform: 'scaleY(1.08)', offset: 0.55}, {opacity: 1, transform: 'scaleY(.97)', offset: 0.8}, {opacity: 1, transform: 'scaleY(1)'}], {duration: 520, easing: 'ease-out', fill: 'forwards'}) : null;
  if(p.lueur) p.lueur.animate([{opacity: 0}, {opacity: 1}], {duration: 700, fill: 'forwards'});
  /* un nuage de poussière et des étoiles qui sortent du coffre */
  var d = this.def, cx = d.x + d.w / 2, cy = d.y + d.h * 0.3;
  for(var k = 0; k < 6; k++) particule(this.c, cx + entre(-d.w * 0.35, d.w * 0.35), cy, 18, etoile(k % 2 ? '#ffffff' : (d.lueur || '#ffe08a')),
    [{transform: 'translate(0,0) scale(.3)', opacity: 0}, {transform: 'translate(0,-20px) scale(1)', opacity: 1, offset: 0.3}, {transform: 'translate(' + entre(-20, 20).toFixed(0) + 'px,-70px) scale(0) rotate(140deg)', opacity: 0}], {duration: 900, delay: 120 + k * 60});
  return fini(a).then(function(){
    return Promise.all(self.options.map(function(o, i){ return pause(i * 140).then(function(){ o.el.style.visibility = ''; o.actif(true); o.briller(true);
      var b = o.el.animate([{opacity: 0, transform: 'translateY(30px)'}, {opacity: 1, transform: 'translateY(-8px)', offset: 0.7}, {opacity: 1, transform: 'none'}], {duration: 620, easing: 'ease-out'}); o.el.style.opacity = 1; return fini(b); }); }));
  });
};
Choix.prototype.choisir = function(i, vers, o){
  var self = this, pris = this.options[i], autre = this.options[1 - i];
  var go = this.ouvert ? Promise.resolve() : this.ouvrir();
  return go.then(function(){ self.options.forEach(function(x){ x.guider(false); }); if(autre) autre.eteindre(); return pris.prendre(vers, o); });
};
Choix.prototype.arreter = function(){ Base.prototype.arreter.call(this); this.options.forEach(function(o){ o.arreter(); }); return this; };
Choix.prototype.detruire = function(){ Base.prototype.detruire.call(this); this.options.forEach(function(o){ o.detruire(); }); };

/* ================= le tas d'os à fouiller ================= */
function Tas(c, def, opts){
  Base.call(this, c, def, opts);
  var d = def;
  this.p.rat = null;
  this.pieces(d.pieces);           /* le rat caché (derrière le tas), ses mâchoires */
  this.corps = el('div', 'ob-corps', this.el);
  this.corps.style.transformOrigin = '50% 100%';
  this.halo = faireHalo(this.corps, d.w * 0.7, d.h, d.lueur || '#e8f0c8', 2);
  this.halo.style.left = (d.w / 2) + 'px'; this.halo.style.top = (d.h * 0.45) + 'px';
  var re = el('div', 'ob-respire', this.corps); re.style.transformOrigin = '50% 90%';
  img(d.svg, re);
  this.faireZone();
  if(d.brille !== false) this.briller(true);
}
Tas.prototype = Object.create(Base.prototype);
Tas.prototype.fouiller = function(o){
  o = o || {};
  if(this.fouille) return Promise.resolve(null);
  this.fouille = true; this.guider(false); this.briller(false); this.actif(false);
  var self = this, c = this.c, d = this.def, cx = d.x + d.w / 2, top = d.y + d.h * 0.35;
  /* il remue */
  var a = this.corps.animate([{transform: 'none'}, {transform: 'rotate(-4deg) translateX(-3px)', offset: 0.12}, {transform: 'rotate(4deg) translateX(3px)', offset: 0.28}, {transform: 'rotate(-3deg) scale(1.03,.97)', offset: 0.44},
    {transform: 'rotate(3deg) translateX(2px)', offset: 0.6}, {transform: 'rotate(-1.5deg)', offset: 0.76}, {transform: 'scale(1.04,.86)'}], {duration: 900, easing: 'ease-in-out', fill: 'forwards'});
  /* de la poussière, et des os qui volent (6) */
  for(var k = 0; k < 4; k++) particule(c, cx + entre(-d.w * 0.3, d.w * 0.3), top + 10, 46, rond('#c8c0a8', 0.5), [{transform: 'scale(.3)', opacity: 0}, {transform: 'translateY(-10px) scale(1)', opacity: 0.8, offset: 0.3}, {transform: 'translateY(-34px) scale(1.7)', opacity: 0}], {duration: 1100, delay: 200 + k * 120});
  var os = d.os;
  for(var b = 0; b < 6; b++){
    var sens = b % 2 ? 1 : -1, vx = sens * entre(50, 150), h = entre(60, 110), sol = d.y + d.h + entre(-4, 14), dyF = sol - top, r = sens * entre(240, 520), pts = [];
    for(var t = 0; t <= 1.0001; t += 0.2){ var y = -h * 4 * t * (1 - t) + dyF * t * t; pts.push({offset: t * 0.7, transform: tr(vx * t, y, r * t, 1), opacity: 1}); }
    pts.push({offset: 0.85, transform: tr(vx, dyF, r, 1), opacity: 1}); pts.push({offset: 1, transform: tr(vx, dyF, r, 1), opacity: 0});
    particule(c, cx + entre(-14, 14), top, 30, 'url("' + urlSvg(os) + '")', pts, {duration: 1500, delay: 250 + b * 70, easing: 'linear'});
  }
  return fini(a).then(function(){
    if(o.trouve === 'morsure') return self.morsure(o).then(function(){ return null; });
    var td = d.trouvaille; if(!td) return null;
    var t = OBJETS.creer(c, Object.assign({}, td, {cache: true, z: (d.z || 5) + 1}), self.opts);
    t.el.style.visibility = '';
    t.actif(true);
    t.el.style.opacity = 1;
    var b2 = t.el.animate([{opacity: 0, transform: 'translateY(26px) scale(.5) rotate(-20deg)'}, {opacity: 1, transform: 'translateY(-26px) scale(1.15) rotate(6deg)', offset: 0.55}, {opacity: 1, transform: 'none'}], {duration: 700, easing: 'ease-out'});
    for(var k = 0; k < 5; k++){ var an = -Math.PI / 2 + (k - 2) * 0.5;
      particule(c, td.x + td.w / 2, td.y + td.h / 2, 16, etoile(k % 2 ? '#ffffff' : (td.lueur || '#fff6c8')), [{transform: 'scale(.3)', opacity: 0}, {transform: 'translate(' + (Math.cos(an) * 46).toFixed(0) + 'px,' + (Math.sin(an) * 46).toFixed(0) + 'px) scale(1) rotate(90deg)', opacity: 1, offset: 0.5}, {transform: 'translate(' + (Math.cos(an) * 60).toFixed(0) + 'px,' + (Math.sin(an) * 60).toFixed(0) + 'px) scale(0) rotate(180deg)', opacity: 0}], {duration: 800, delay: 200}); }
    self.trouvaille = t;
    return fini(b2).then(function(){ return t; });
  });
};
/* la morsure : un rat surgit du tas, claque des dents, et replonge */
Tas.prototype.morsure = function(o){
  var p = this.p, c = this.c, d = this.def;
  if(!p.rat) return Promise.resolve();
  p.rat.classList.remove('ob-cache');
  var a = p.rat.animate([{transform: 'translateY(40px)', opacity: 0}, {transform: 'translateY(-6px)', opacity: 1, offset: 0.14}, {transform: 'translateY(0)', opacity: 1, offset: 0.2},
    {transform: 'translate(-6px,-2px) rotate(-8deg)', offset: 0.36}, {transform: 'translate(-14px,0) rotate(-14deg) scale(1.12)', offset: 0.46}, {transform: 'translate(0,0)', offset: 0.6},
    {transform: 'translate(-14px,0) rotate(-14deg) scale(1.12)', offset: 0.7}, {transform: 'translate(0,0)', offset: 0.8}, {transform: 'translateY(46px)', opacity: 0}], {duration: 1700, easing: 'ease-in-out', fill: 'forwards'});
  if(p.machoire) p.machoire.animate([{transform: 'rotate(0)'}, {transform: 'rotate(0)', offset: 0.36}, {transform: 'rotate(26deg)', offset: 0.42}, {transform: 'rotate(0)', offset: 0.48}, {transform: 'rotate(26deg)', offset: 0.66}, {transform: 'rotate(0)', offset: 0.72}, {transform: 'rotate(0)'}], {duration: 1700, fill: 'forwards'});
  setTimeout(function(){
    if(o.onMorsure) o.onMorsure();
    particule(c, d.x + d.w * 0.3, d.y + d.h * 0.2, 120, rond('#ff3a3a', 0.6), [{transform: 'scale(.3)', opacity: 0.9}, {transform: 'scale(1.4)', opacity: 0}], {duration: 450});
    particule(c, d.x + d.w * 0.3, d.y + d.h * 0.2, 120, rond('#ff3a3a', 0.6), [{transform: 'scale(.3)', opacity: 0.9}, {transform: 'scale(1.4)', opacity: 0}], {duration: 450, delay: 480});
  }, 1700 * 0.44);
  return fini(a);
};

/* ================= le crâne gravé (le passage secret) ================= */
function Crane(c, def, opts){
  Base.call(this, c, def, opts);
  var d = def, e = this.el;
  e.style.overflow = 'hidden';
  this.pieces(d.pieces);                 /* passage (derrière), dalle (le pan de mur), contour, lueur, fissures (dans la dalle) */
  var fond = d.fond || (opts && opts.fond);
  /* le pan de mur qui glisse : un morceau du fond lui-même (rien ne se voit tant que le crâne est caché) */
  if(this.p.dalle){ var q = this.p.dalle, dx = d.x + parseFloat(q.style.left), dy = d.y + parseFloat(q.style.top);
    if(fond){ q.style.backgroundImage = 'url("' + fond + '")'; q.style.backgroundSize = '960px 372px'; q.style.backgroundPosition = (-dx) + 'px ' + (-dy) + 'px'; q.style.backgroundRepeat = 'no-repeat'; }
    else if(d.secours){ var im = img(d.secours, q); q.insertBefore(im, q.firstChild); } }
  this.revele = false;
  this.faireZone();
  this.horsCadre();
  if(d.revele) this.etat(true);
}
Crane.prototype = Object.create(Base.prototype);
Crane.prototype.etat = function(on){ this.revele = !!on; var p = this.p; [p.contour, p.lueur].forEach(function(x){ if(x){ x.classList.toggle('ob-cache', !on); x.style.opacity = on ? 1 : 0; } });
  if(on) this.boucleRevele(); return this; };
Crane.prototype.boucleRevele = function(){ if(this.bR) return; this.bR = this.boucle(this.p.contour, [{opacity: 1}, {opacity: 0.72}, {opacity: 1}], {duration: 2200}); if(this.p.lueur) this.boucle(this.p.lueur, [{transform: 'scale(.94)', opacity: 0.75}, {transform: 'scale(1.06)', opacity: 1}, {transform: 'scale(.94)', opacity: 0.75}], {duration: 2200}); };
Crane.prototype.reveler = function(){
  if(this.revele) return Promise.resolve();
  this.revele = true;
  var self = this, p = this.p, c = this.c, d = this.def, ct = d.centre || [d.w / 2, d.h / 2], R = d.rayon || 40;
  p.contour.classList.remove('ob-cache'); p.lueur && p.lueur.classList.remove('ob-cache');
  var a = p.contour.animate([{opacity: 0, transform: 'scale(.92)'}, {opacity: 0.4, offset: 0.4}, {opacity: 1, transform: 'scale(1.04)', offset: 0.8}, {opacity: 1, transform: 'scale(1)'}], {duration: 1500, easing: 'ease-out', fill: 'forwards'});
  if(p.lueur) p.lueur.animate([{opacity: 0, transform: 'scale(.4)'}, {opacity: 1, transform: 'scale(1.25)', offset: 0.7}, {opacity: 1, transform: 'scale(1)'}], {duration: 1500, fill: 'forwards'});
  /* une étincelle d'encre fait le tour du crâne (8 étoiles, l'une après l'autre) */
  for(var k = 0; k < 8; k++){ var an = -Math.PI / 2 + k / 8 * Math.PI * 2, x = d.x + ct[0] + Math.cos(an) * R, y = d.y + ct[1] + Math.sin(an) * R * 1.05;
    particule(c, x, y, 20, etoile(d.lueur || '#9ff6ff'), [{transform: 'scale(0)', opacity: 0}, {transform: 'scale(1.2) rotate(90deg)', opacity: 1, offset: 0.3}, {transform: 'scale(0) rotate(200deg)', opacity: 0}], {duration: 600, delay: k * 110}); }
  return fini(a).then(function(){ p.contour.style.opacity = 1; if(p.lueur) p.lueur.style.opacity = 1; self.boucleRevele(); });
};
Crane.prototype.ouvrir = function(){
  if(this.ouvert) return Promise.resolve();
  this.ouvert = true; this.guider(false); this.actif(false);
  var p = this.p, c = this.c, d = this.def;
  if(p.fissures){ p.fissures.classList.remove('ob-cache'); p.fissures.animate([{opacity: 0}, {opacity: 1}], {duration: 300, fill: 'forwards'}); }
  var a = p.dalle.animate([{transform: 'none'}, {transform: 'translateX(-2px)', offset: 0.06}, {transform: 'translateX(2px)', offset: 0.12}, {transform: 'translateX(-2px)', offset: 0.18}, {transform: 'translateX(1px)', offset: 0.24},
    {transform: 'translateX(0)', offset: 0.3}, {transform: 'translateX(' + (-d.w - 4) + 'px)'}], {duration: 1700, easing: 'ease-in', fill: 'forwards'});
  if(p.passage) p.passage.animate([{opacity: 0.4}, {opacity: 1}], {duration: 1700, fill: 'forwards'});
  for(var k = 0; k < 5; k++) particule(c, d.x + entre(0, d.w), d.y + d.h - 6, 50, rond('#a0a890', 0.55), [{transform: 'scale(.3)', opacity: 0}, {transform: 'translateY(-14px) scale(1)', opacity: 0.8, offset: 0.3}, {transform: 'translate(' + entre(-30, 30).toFixed(0) + 'px,-30px) scale(1.6)', opacity: 0}], {duration: 1200, delay: 500 + k * 120});
  return fini(a);
};

/* ================= une dalle du couloir (claire : sûre ; sombre : piégée) ================= */
function Dalle(c, def, opts){
  Base.call(this, c, def, opts);
  var d = def, e = this.el, fond = d.fond || (opts && opts.fond);
  var poly = 'polygon(' + d.coins.map(function(q){ return (q[0] - d.x).toFixed(1) + 'px ' + (q[1] - d.y).toFixed(1) + 'px'; }).join(',') + ')';
  this.pieces(d.pieces);               /* trou (le noir sous la dalle), pointes (cachées) */
  var pi = boite(el('div', 'ob-p', e), 0, 0, d.w, d.h);
  pi.style.clipPath = pi.style.webkitClipPath = poly;
  if(fond){ pi.style.backgroundImage = 'url("' + fond + '")'; pi.style.backgroundSize = '960px 372px'; pi.style.backgroundPosition = (-d.x) + 'px ' + (-d.y) + 'px'; }
  else pi.style.background = d.clair ? '#6a6a8a' : '#1a1626';
  var om = el('div', 'ob-p ob-cache', pi); boite(om, 0, 0, d.w, d.h); om.style.background = '#05030a';
  var lu = el('div', 'ob-p ob-cache', pi); boite(lu, 0, 0, d.w, d.h); lu.style.background = 'radial-gradient(closest-side,rgba(220,235,255,.75),rgba(220,235,255,0))';
  this.p.pierre = pi; this.p.ombre = om; this.p.eclat = lu;
  if(this.p.pointes) this.p.pointes.style.zIndex = 1;
  this.faireZone();
}
Dalle.prototype = Object.create(Base.prototype);
Dalle.prototype.briller = function(on){ var lu = this.p.eclat; lu.classList.toggle('ob-cache', !on); if(on) this.bB = this.boucle(lu, [{opacity: 0.15}, {opacity: 0.5}, {opacity: 0.15}], {duration: 1600}); else if(this.bB){ this.bB.cancel(); this.bB = null; } return this; };
Dalle.prototype.marcher = function(){
  var p = this.p; this.guider(false);
  p.eclat.classList.remove('ob-cache');
  p.eclat.animate([{opacity: 0}, {opacity: 0.8, offset: 0.3}, {opacity: 0}], {duration: 700, fill: 'forwards'});
  return fini(p.pierre.animate([{transform: 'none'}, {transform: 'translateY(3px)', offset: 0.3}, {transform: 'none'}], {duration: 380, easing: 'ease-out'}));
};
Dalle.prototype.pieger = function(o){
  o = o || {};
  var p = this.p, c = this.c, d = this.def, self = this;
  this.guider(false);
  var cx = d.x + d.w / 2, cy = d.y + d.h * 0.55;
  p.ombre.classList.remove('ob-cache');
  p.pierre.animate([{transform: 'none'}, {transform: 'translateY(9px) scale(.94)', offset: 0.25}, {transform: 'translateY(9px) scale(.94)', offset: 0.85}, {transform: 'translateY(2px) scale(.99)'}], {duration: 1800, easing: 'ease-out', fill: 'forwards'});
  p.ombre.animate([{opacity: 0}, {opacity: 0.45, offset: 0.25}, {opacity: 0.45, offset: 0.85}, {opacity: 0.1}], {duration: 1800, fill: 'forwards'});
  var a = null;
  if(p.pointes){ p.pointes.classList.remove('ob-cache');
    a = p.pointes.animate([{transform: 'scaleY(0)', opacity: 1}, {transform: 'scaleY(0)', offset: 0.18}, {transform: 'scaleY(1.15)', offset: 0.26}, {transform: 'scaleY(1)', offset: 0.32}, {transform: 'scaleY(1)', offset: 0.78}, {transform: 'scaleY(0)', opacity: 1}], {duration: 1800, easing: 'ease-out', fill: 'forwards'}); }
  setTimeout(function(){
    if(o.onPiege) o.onPiege(self);
    /* le jet de poussière (8 bouffées) */
    for(var k = 0; k < 8; k++){ var an = -Math.PI / 2 + entre(-0.9, 0.9), v = entre(40, 90);
      particule(c, cx + entre(-d.w * 0.3, d.w * 0.3), cy, entre(30, 52), rond('#b8b0c8', 0.6), [{transform: 'scale(.3)', opacity: 0.9}, {transform: 'translate(' + (Math.cos(an) * v).toFixed(0) + 'px,' + (Math.sin(an) * v).toFixed(0) + 'px) scale(1.8)', opacity: 0}], {duration: entre(700, 1100)}); }
    particule(c, cx, cy, 90, rond('#ffffff', 0.5), [{transform: 'scale(.3)', opacity: 1}, {transform: 'scale(1.2)', opacity: 0}], {duration: 260});
  }, 1800 * 0.22);
  return fini(a);
};

/* ================= une porte gravée (œil, gueule, lune) ================= */
function Porte(c, def, opts){
  Base.call(this, c, def, opts);
  this.el.style.overflow = 'hidden';
  this.pieces(def.pieces);            /* audela (la lueur derrière), battant, signe (dans le battant) */
  this.faireZone(def.zone);
  this.horsCadre();       /* la zone et le rond jaune ne sont pas coupés par le cadre de la porte */
  if(this.p.signe) this.bS = this.boucle(this.p.signe, [{opacity: 0.35}, {opacity: 0.6}, {opacity: 0.35}], {duration: 2600, delay: -ALEA() * 2600});
}
Porte.prototype = Object.create(Base.prototype);
Porte.prototype.toucher = function(){
  var p = this.p;
  if(this.bS){ this.bS.cancel(); this.bS = null; }
  p.signe.animate([{opacity: 0.4, transform: 'scale(1)'}, {opacity: 1, transform: 'scale(1.12)', offset: 0.3}, {opacity: 1, transform: 'scale(1)'}], {duration: 600, fill: 'forwards'});
  return fini(p.battant.animate([{transform: 'none'}, {transform: 'translateX(-2px)', offset: 0.25}, {transform: 'translateX(2px)', offset: 0.5}, {transform: 'none'}], {duration: 300}));
};
Porte.prototype.ouvrir = function(){
  if(this.ouvert) return Promise.resolve();
  this.ouvert = true; this.guider(false); this.actif(false);
  var p = this.p, c = this.c, d = this.def, self = this;
  return this.toucher().then(function(){
    var a = p.battant.animate([{transform: 'none'}, {transform: 'translate(-2px,1px)', offset: 0.05}, {transform: 'translate(2px,2px)', offset: 0.1}, {transform: 'translate(-1px,3px)', offset: 0.15}, {transform: 'translate(0,' + (d.h + 8) + 'px)'}], {duration: 1500, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards'});
    if(p.audela){ p.audela.classList.remove('ob-cache'); p.audela.animate([{opacity: 0}, {opacity: 1}], {duration: 1500, fill: 'forwards'}); }
    for(var k = 0; k < 7; k++) particule(c, d.x + entre(0, d.w), d.y + d.h - 4, entre(36, 56), rond('#a8a0b8', 0.55), [{transform: 'scale(.3)', opacity: 0}, {transform: 'translateY(-10px) scale(1)', opacity: 0.85, offset: 0.25}, {transform: 'translate(' + entre(-40, 40).toFixed(0) + 'px,-26px) scale(1.8)', opacity: 0}], {duration: 1300, delay: 150 + k * 140});
    return fini(a);
  });
};

/* ================= le sarcophage et l'amulette de vie ================= */
function Sarco(c, def, opts){
  Base.call(this, c, def, opts);
  this.pieces(def.pieces);     /* interieur (la lueur dorée qui monte), couvercle, cuve */
  this.amulette = OBJETS.creer(c, Object.assign({z: (def.z || 5) + 1, cache: true}, def.amulette), opts);
  this.faireZone();
}
Sarco.prototype = Object.create(Base.prototype);
Sarco.prototype.ouvrir = function(){
  if(this.ouvert) return Promise.resolve(this.amulette);
  this.ouvert = true; this.guider(false); this.actif(false);
  var p = this.p, c = this.c, d = this.def, self = this, cv = p.couvercle;
  var a = cv.animate([{transform: 'none'}, {transform: 'translateX(-3px)', offset: 0.06}, {transform: 'translateX(3px)', offset: 0.12}, {transform: 'translateX(-2px)', offset: 0.18}, {transform: 'translateX(0)', offset: 0.24},
    {transform: 'translateX(' + (d.glisse || 120) + 'px) rotate(3deg)', offset: 0.8}, {transform: 'translate(' + ((d.glisse || 120) + 14) + 'px,22px) rotate(14deg)', offset: 0.92}, {transform: 'translate(' + ((d.glisse || 120) + 14) + 'px,18px) rotate(12deg)'}], {duration: 2000, easing: 'ease-in-out', fill: 'forwards'});
  if(p.interieur){ p.interieur.classList.remove('ob-cache'); p.interieur.animate([{opacity: 0}, {opacity: 0, offset: 0.3}, {opacity: 1}], {duration: 2000, fill: 'forwards'}); }
  setTimeout(function(){ for(var k = 0; k < 6; k++) particule(c, d.x + d.w * 0.75 + entre(-60, 60), d.y + d.h * 0.42, entre(36, 54), rond('#b0a8c0', 0.55), [{transform: 'scale(.3)', opacity: 0}, {transform: 'translateY(-8px) scale(1)', opacity: 0.8, offset: 0.3}, {transform: 'translate(' + entre(-30, 30).toFixed(0) + 'px,-30px) scale(1.7)', opacity: 0}], {duration: 1200, delay: k * 90}); }, 1800);
  return fini(a).then(function(){
    var am = self.amulette; am.el.style.visibility = ''; am.actif(true);
    var b = am.el.animate([{opacity: 0, transform: 'translateY(36px) scale(.5)'}, {opacity: 1, transform: 'translateY(-10px) scale(1.15)', offset: 0.65}, {opacity: 1, transform: 'none'}], {duration: 900, easing: 'ease-out'});
    am.el.style.opacity = 1; am.briller(true);
    return fini(b).then(function(){ return am; });
  });
};
Sarco.prototype.prendre = function(vers, o){ return this.amulette.prendre(vers, o); };
Sarco.prototype.detruire = function(){ Base.prototype.detruire.call(this); this.amulette.detruire(); };

/* ================= le feu de camp ================= */
function Feu(c, def, opts){
  Base.call(this, c, def, opts);
  var d = def, p;
  this.pieces(d.pieces);      /* lueur, buches, flamme1..3, coeur */
  p = this.p;
  var B = this;
  if(p.lueur) B.boucle(p.lueur, [{opacity: 0.8, transform: 'scale(1)'}, {opacity: 1, transform: 'scale(1.04)', offset: 0.2}, {opacity: 0.85, transform: 'scale(.98)', offset: 0.45}, {opacity: 1, transform: 'scale(1.05)', offset: 0.7}, {opacity: 0.8, transform: 'scale(1)'}], {duration: 1900});
  [['flamme1', 760, 0.07, 3], ['flamme2', 610, 0.1, -4], ['flamme3', 520, 0.12, 5], ['coeur', 430, 0.06, -2]].forEach(function(f, i){
    if(!p[f[0]]) return;
    var k = f[2], r = f[3];
    B.boucle(p[f[0]], [{transform: 'scale(1,1) rotate(0deg)'}, {transform: 'scale(' + (1 - k * 0.6) + ',' + (1 + k) + ') rotate(' + r + 'deg)', offset: 0.3}, {transform: 'scale(' + (1 + k * 0.4) + ',' + (1 - k * 0.7) + ') rotate(' + (-r * 0.6) + 'deg)', offset: 0.62}, {transform: 'scale(1,1) rotate(0deg)'}],
      {duration: f[1], direction: 'alternate', delay: -i * 170});
  });
  /* les braises qui montent (8, en boucle) */
  var bx = d.x + d.w / 2, by = d.y + d.h * 0.62;
  for(var k = 0; k < 8; k++){ var dur = entre(1500, 2600), hx = entre(-30, 30), h = entre(110, 190);
    var a = particule(c, bx + entre(-26, 26), by, entre(5, 9), rond(k % 3 ? '#ffb040' : '#fff0a0', 1), [{transform: 'translate(0,0) scale(1)', opacity: 0}, {transform: 'translate(' + (hx * 0.3).toFixed(0) + 'px,-' + (h * 0.25).toFixed(0) + 'px) scale(1)', opacity: 1, offset: 0.15},
      {transform: 'translate(' + (-hx * 0.4).toFixed(0) + 'px,-' + (h * 0.6).toFixed(0) + 'px) scale(.7)', opacity: 0.8, offset: 0.6}, {transform: 'translate(' + hx.toFixed(0) + 'px,-' + h.toFixed(0) + 'px) scale(.2)', opacity: 0}], {duration: dur, delay: -k * dur / 8, iterations: Infinity, easing: 'linear', rond: true});
    this.boucles.push(a);
  }
}
Feu.prototype = Object.create(Base.prototype);
Feu.prototype.attiser = function(){
  var p = this.p, c = this.c, d = this.def, bx = d.x + d.w / 2, by = d.y + d.h * 0.6;
  var tout = this.el.animate([{transform: 'none'}, {transform: 'scale(1.06,1.18)', offset: 0.25}, {transform: 'scale(1.03,1.1)', offset: 0.7}, {transform: 'none'}], {duration: 1100, easing: 'ease-out'});
  this.el.style.transformOrigin = '50% 92%';
  for(var k = 0; k < 10; k++){ var an = -Math.PI / 2 + entre(-0.7, 0.7), v = entre(70, 150);
    particule(c, bx + entre(-14, 14), by, entre(6, 10), rond(k % 2 ? '#ffd060' : '#fff6c0', 1), [{transform: 'translate(0,0)', opacity: 1}, {transform: 'translate(' + (Math.cos(an) * v).toFixed(0) + 'px,' + (Math.sin(an) * v).toFixed(0) + 'px) scale(.3)', opacity: 0}], {duration: entre(700, 1200), rond: true}); }
  return fini(tout);
};

/* ================= Moustache, le chat d'Odette ================= */
function Chat(c, def, opts){
  Base.call(this, c, def, opts);
  this.pieces(def.pieces);   /* queue, corps, patte, tete-dos, tete-face, tete-miaou, ondes */
  this.faireZone();
  this.attendre();
}
Chat.prototype = Object.create(Base.prototype);
Chat.prototype.attendre = function(){
  var p = this.p;
  if(p.queue) this.boucle(p.queue, [{transform: 'rotate(-6deg)'}, {transform: 'rotate(12deg)'}, {transform: 'rotate(-6deg)'}], {duration: 2300});
  if(p.corps) this.boucle(p.corps, [{transform: 'scale(1,1)'}, {transform: 'scale(1.015,1.03)'}, {transform: 'scale(1,1)'}], {duration: 2600});
};
Chat.prototype.gratter = function(n){
  n = n || 4; var p = this.p, kf = [{transform: 'rotate(0deg)'}];
  for(var i = 0; i < n; i++){ kf.push({transform: 'rotate(-34deg) translateY(-4px)', offset: (i + 0.45) / n}); kf.push({transform: 'rotate(4deg) translateY(2px)', offset: (i + 0.9) / n}); }
  kf.push({transform: 'rotate(0deg)'});
  var d = this.def, c = this.c;
  for(var k = 0; k < n; k++) particule(c, d.x + d.w * (d.griffe ? d.griffe[0] : 0.7) + entre(-6, 6), d.y + d.h * (d.griffe ? d.griffe[1] : 0.2), 16, rond('#c8c0d8', 0.6), [{transform: 'scale(.3)', opacity: 0}, {transform: 'translate(' + entre(-10, 10).toFixed(0) + 'px,12px) scale(1)', opacity: 0.8, offset: 0.3}, {transform: 'translate(' + entre(-14, 14).toFixed(0) + 'px,26px) scale(.4)', opacity: 0}], {duration: 600, delay: (k + 0.5) / n * 280 * n});
  if(p['tete-dos']) p['tete-dos'].animate([{transform: 'none'}, {transform: 'rotate(4deg) translateY(1px)', offset: 0.5}, {transform: 'none'}], {duration: 280, iterations: n});
  return fini(p.patte.animate(kf, {duration: 280 * n, easing: 'ease-in-out'}));
};
Chat.prototype.seRetourner = function(){
  var p = this.p; if(this.face) return Promise.resolve(); this.face = true;
  p['tete-dos'].animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'rotate(-14deg)'}], {duration: 260, fill: 'forwards'});
  p['tete-face'].classList.remove('ob-cache');
  p.patte.animate([{transform: 'none'}, {transform: 'rotate(14deg) translateY(10px)'}], {duration: 300, fill: 'forwards'});
  return fini(p['tete-face'].animate([{opacity: 0, transform: 'rotate(16deg) translateX(10px)'}, {opacity: 1, transform: 'rotate(-4deg)', offset: 0.7}, {opacity: 1, transform: 'none'}], {duration: 420, easing: 'ease-out', fill: 'forwards'}));
};
Chat.prototype.revenir = function(){
  var p = this.p; if(!this.face) return Promise.resolve(); this.face = false;
  p['tete-face'].animate([{opacity: 1}, {opacity: 0}], {duration: 240, fill: 'forwards'});
  p.patte.animate([{transform: 'rotate(14deg) translateY(10px)'}, {transform: 'none'}], {duration: 300, fill: 'forwards'});
  return fini(p['tete-dos'].animate([{opacity: 0, transform: 'rotate(-14deg)'}, {opacity: 1, transform: 'none'}], {duration: 320, fill: 'forwards'}));
};
Chat.prototype.miauler = function(){
  var p = this.p, self = this;
  var go = this.face ? Promise.resolve() : this.seRetourner();
  return go.then(function(){
    var tm = p['tete-miaou'], tf = p['tete-face'];
    tm.classList.remove('ob-cache');
    var k = [{opacity: 0}, {opacity: 1, offset: 0.12}, {opacity: 1, offset: 0.78}, {opacity: 0}];
    tm.animate(k, {duration: 1100, fill: 'forwards'});
    tf.animate([{opacity: 1}, {opacity: 0, offset: 0.12}, {opacity: 0, offset: 0.78}, {opacity: 1}], {duration: 1100, fill: 'forwards'});
    [tm, tf].forEach(function(t){ t.animate([{transform: 'none'}, {transform: 'rotate(-10deg) translateY(-3px)', offset: 0.3}, {transform: 'rotate(-8deg) translateY(-3px)', offset: 0.75}, {transform: 'none'}], {duration: 1100, easing: 'ease-out'}); });
    if(p.ondes){ p.ondes.classList.remove('ob-cache'); p.ondes.animate([{opacity: 0, transform: 'scale(.5)'}, {opacity: 1, transform: 'scale(1)', offset: 0.35}, {opacity: 0, transform: 'scale(1.35)'}], {duration: 1000, delay: 120, fill: 'forwards'}); }
    return pause(1150);
  });
};
Chat.prototype.scene = function(){
  var self = this;
  return this.gratter(4).then(function(){ return pause(250); }).then(function(){ return self.seRetourner(); }).then(function(){ return pause(250); })
    .then(function(){ return self.miauler(); }).then(function(){ return pause(500); }).then(function(){ return self.revenir(); }).then(function(){ return self.gratter(3); });
};

/* ================= Léo, coincé avec sa lanterne ================= */
/* ses pièces : halo (derrière), leo (tout le corps : il se recroqueville) > tremble (il tremble) > corps, bras2, tete (> tete-peur), bras (> flamme) ; panier */
function Leo(c, def, opts){
  Base.call(this, c, def, opts);
  this.pieces(def.pieces);
  this.faireZone();
  var p = this.p;
  this.trembler(true);
  if(p.halo) this.boucle(p.halo, [{opacity: 0.85, transform: 'scale(1)'}, {opacity: 1, transform: 'scale(1.05)', offset: 0.3}, {opacity: 0.8, transform: 'scale(.97)', offset: 0.6}, {opacity: 1, transform: 'scale(1.03)'}], {duration: 1500, direction: 'alternate'});
  if(p.flamme) this.boucle(p.flamme, [{transform: 'scale(1,1)'}, {transform: 'scale(.9,1.12)', offset: 0.4}, {transform: 'scale(1.05,.92)', offset: 0.7}, {transform: 'scale(1,1)'}], {duration: 520, direction: 'alternate'});
  this.balancer(true);
}
Leo.prototype = Object.create(Base.prototype);
Leo.prototype.balancer = function(on){ if(this.bB){ this.bB.cancel(); this.bB = null; } if(on && this.p.bras) this.bB = this.boucle(this.p.bras, [{transform: 'rotate(-2deg)'}, {transform: 'rotate(3deg)'}, {transform: 'rotate(-2deg)'}], {duration: 1700}); };
Leo.prototype.trembler = function(on){
  if(this.bT){ this.bT.cancel(); this.bT = null; }
  if(on) this.bT = this.boucle(this.p.tremble, [{transform: 'translateX(0)'}, {transform: 'translateX(-1.4px)', offset: 0.25}, {transform: 'translateX(1.2px)', offset: 0.5}, {transform: 'translate(-0.8px,0.5px)', offset: 0.75}, {transform: 'translateX(0)'}], {duration: 300, easing: 'linear'});
  return Promise.resolve();
};
/* il lève sa lanterne vers les héros (pour voir qui est là), puis la rabaisse */
Leo.prototype.lever = function(){
  var p = this.p, self = this, T = 2200;
  this.balancer(false);
  if(p.halo) p.halo.animate([{transform: 'translate(0,0)'}, {transform: 'translate(-24px,-54px) scale(1.12)', offset: 0.3}, {transform: 'translate(-22px,-50px) scale(1.1)', offset: 0.5}, {transform: 'translate(-24px,-54px) scale(1.12)', offset: 0.75}, {transform: 'translate(0,0)'}], {duration: T, easing: 'ease-in-out', composite: 'add'});
  p.tete.animate([{transform: 'none'}, {transform: 'rotate(6deg) translateY(-2px)', offset: 0.3}, {transform: 'rotate(6deg) translateY(-2px)', offset: 0.75}, {transform: 'none'}], {duration: T, easing: 'ease-in-out'});
  if(p.lanterne) p.lanterne.animate([{transform: 'rotate(0deg)'}, {transform: 'rotate(-42deg)', offset: 0.3}, {transform: 'rotate(-49deg)', offset: 0.5}, {transform: 'rotate(-44deg)', offset: 0.75}, {transform: 'rotate(0deg)'}], {duration: T, easing: 'ease-in-out'});
  return fini(p.bras.animate([{transform: 'rotate(0deg)'}, {transform: 'rotate(50deg)', offset: 0.3}, {transform: 'rotate(45deg)', offset: 0.5}, {transform: 'rotate(50deg)', offset: 0.75}, {transform: 'rotate(0deg)'}], {duration: T, easing: 'ease-in-out'}))
    .then(function(){ self.balancer(true); });
};
/* il se recroqueville : il se tasse, ferme les yeux, cache son visage (o.rester : il reste ainsi) */
Leo.prototype.recroqueviller = function(o){
  o = o || {};
  var p = this.p, self = this, r = !!o.rester, T = r ? 900 : 2600, f = r ? 'forwards' : 'none';
  function k(a, b){ return r ? [a, b] : [a, Object.assign({offset: 0.3}, b), Object.assign({offset: 0.8}, b), a]; }
  this.balancer(false);
  if(this.recro && !r){ this.recro.forEach(function(x){ x.cancel(); }); }
  var l = [
    p.leo.animate(k({transform: 'none'}, {transform: 'translateY(10px) scale(1.04,.9)'}), {duration: T, easing: 'ease-in-out', fill: f}),
    p.tete.animate(k({transform: 'none'}, {transform: 'translate(2px,12px) rotate(-14deg)'}), {duration: T, easing: 'ease-in-out', fill: f}),
    p.bras.animate(k({transform: 'none'}, {transform: 'translate(4px,6px) rotate(-20deg)'}), {duration: T, easing: 'ease-in-out', fill: f}),
    p.bras2.animate(k({transform: 'none'}, {transform: 'translate(-2px,-4px) rotate(78deg)'}), {duration: T, easing: 'ease-in-out', fill: f})
  ];
  if(p.lanterne) l.push(p.lanterne.animate(k({transform: 'none'}, {transform: 'rotate(20deg)'}), {duration: T, easing: 'ease-in-out', fill: f}));
  if(p['tete-peur']){ p['tete-peur'].classList.remove('ob-cache'); p['tete-peur'].style.opacity = 0; l.push(p['tete-peur'].animate(k({opacity: 0}, {opacity: 1}), {duration: T, fill: f})); }
  if(p.halo) l.push(p.halo.animate(k({transform: 'translate(0,0)'}, {transform: 'translate(22px,30px)'}), {duration: T, fill: f, composite: 'add'}));
  this.recro = r ? l : null;
  return fini(l[0]).then(function(){ if(!r) self.balancer(true); });
};
/* il se redresse (après recroqueviller({rester: true})) */
Leo.prototype.redresser = function(){
  var self = this; if(!this.recro) return Promise.resolve();
  this.recro.forEach(function(a){ a.reverse(); });
  var a0 = this.recro[0]; this.recro = null;
  return fini(a0).then(function(){ self.balancer(true); });
};

/* ================= les détails d'ambiance ================= */
function Deco(c, def, opts){
  Base.call(this, c, def, opts);
  var d = def, e = this.el, a = d.amplitude || 4, dur = d.duree || 3000;
  e.style.transformOrigin = d.pivot ? d.pivot[0] + 'px ' + d.pivot[1] + 'px' : '50% 0';
  if(d.svg) img(d.svg, e);
  if(d.lueur){ e.style.borderRadius = '50%'; e.style.background = rond(d.lueur, d.force == null ? 0.6 : d.force); }
  var dl = -(d.delai == null ? ALEA() : d.delai) * dur;
  if(d.anim === 'balance') this.boucle(e, [{transform: 'rotate(-' + a + 'deg)'}, {transform: 'rotate(' + a + 'deg)'}, {transform: 'rotate(-' + a + 'deg)'}], {duration: dur, delay: dl});
  if(d.anim === 'flotte') this.boucle(e, [{transform: 'translateY(0) rotate(-2deg)'}, {transform: 'translateY(-' + a + 'px) rotate(2deg)'}, {transform: 'translateY(0) rotate(-2deg)'}], {duration: dur, delay: dl});
  if(d.anim === 'pulse') this.boucle(e, [{opacity: d.min == null ? 0.55 : d.min, transform: 'scale(.96)'}, {opacity: 1, transform: 'scale(1.04)'}, {opacity: d.min == null ? 0.55 : d.min, transform: 'scale(.96)'}], {duration: dur, delay: dl});
  if(d.anim === 'clignote') this.boucle(e, [{opacity: 1}, {opacity: 1, offset: 0.9}, {opacity: 0.2, offset: 0.95}, {opacity: 1}], {duration: dur, delay: dl, easing: 'linear'});
  if(d.zone) this.faireZone();
}
Deco.prototype = Object.create(Base.prototype);

/* des particules d'ambiance (au plus 10), qui tournent en boucle */
function Particules(c, def, opts){
  Base.call(this, c, def, opts);
  var d = def, z = d.zone || {x: d.x, y: d.y, w: d.w, h: d.h}, n = Math.min(d.n || 8, 10), self = this, col = d.couleur || '#ffffff';
  this.el.style.width = '0px'; this.el.style.height = '0px';
  var feuille = d.svg ? 'url("' + urlSvg(d.svg) + '")' : null;
  for(var i = 0; i < n; i++){
    var x = z.x + entre(0.05, 0.95) * z.w, y = z.y + entre(0, 1) * z.h, kf, dur, sz, fond = rond(col, d.force || 0.9);
    switch(d.effet){
      case 'flocons': sz = entre(4, 8); dur = entre(5000, 8000); y = z.y; kf = [{transform: 'translate(0,0)', opacity: 0}, {transform: 'translate(8px,' + (z.h * 0.3).toFixed(0) + 'px)', opacity: 1, offset: 0.2}, {transform: 'translate(-8px,' + (z.h * 0.7).toFixed(0) + 'px)', opacity: 1, offset: 0.7}, {transform: 'translate(6px,' + z.h.toFixed(0) + 'px)', opacity: 0}]; break;
      case 'spores': sz = entre(4, 7); dur = entre(6000, 9000); y = z.y + z.h; kf = [{transform: 'translate(0,0)', opacity: 0}, {transform: 'translate(10px,-' + (z.h * 0.35).toFixed(0) + 'px)', opacity: 0.9, offset: 0.3}, {transform: 'translate(-6px,-' + (z.h * 0.75).toFixed(0) + 'px)', opacity: 0.7, offset: 0.75}, {transform: 'translate(4px,-' + z.h.toFixed(0) + 'px)', opacity: 0}]; break;
      case 'lucioles': sz = entre(6, 10); dur = entre(4000, 6500); kf = [{transform: 'translate(0,0)', opacity: 0.2}, {transform: 'translate(' + entre(-30, 30).toFixed(0) + 'px,' + entre(-20, 20).toFixed(0) + 'px)', opacity: 1, offset: 0.3}, {transform: 'translate(' + entre(-30, 30).toFixed(0) + 'px,' + entre(-20, 20).toFixed(0) + 'px)', opacity: 0.3, offset: 0.6}, {transform: 'translate(' + entre(-20, 20).toFixed(0) + 'px,' + entre(-20, 20).toFixed(0) + 'px)', opacity: 1, offset: 0.8}, {transform: 'translate(0,0)', opacity: 0.2}]; break;
      case 'feuilles': sz = entre(14, 20); dur = entre(6000, 9000); y = z.y; fond = feuille || fond; kf = [{transform: 'translate(0,0) rotate(0deg)', opacity: 0}, {transform: 'translate(20px,' + (z.h * 0.25).toFixed(0) + 'px) rotate(60deg)', opacity: 1, offset: 0.15}, {transform: 'translate(-16px,' + (z.h * 0.55).toFixed(0) + 'px) rotate(-30deg)', opacity: 1, offset: 0.5}, {transform: 'translate(14px,' + (z.h * 0.85).toFixed(0) + 'px) rotate(80deg)', opacity: 1, offset: 0.85}, {transform: 'translate(0,' + z.h.toFixed(0) + 'px) rotate(20deg)', opacity: 0}]; break;
      case 'gouttes': sz = entre(4, 6); dur = entre(2600, 4200); y = z.y; kf = [{transform: 'translate(0,0) scale(1,1.4)', opacity: 0}, {transform: 'translate(0,0) scale(1,1.4)', opacity: 1, offset: 0.55}, {transform: 'translate(0,' + z.h.toFixed(0) + 'px) scale(1,1.6)', opacity: 1, offset: 0.7}, {transform: 'translate(0,' + z.h.toFixed(0) + 'px) scale(3,.4)', opacity: 0, offset: 0.76}, {transform: 'translate(0,' + z.h.toFixed(0) + 'px) scale(3,.4)', opacity: 0}]; break;
      default: /* poussière : dans un rayon de lumière, elle descend en flottant */
        sz = entre(3, 6); dur = entre(6000, 10000); kf = [{transform: 'translate(0,0)', opacity: 0}, {transform: 'translate(' + entre(-14, 14).toFixed(0) + 'px,' + entre(10, 30).toFixed(0) + 'px)', opacity: 0.9, offset: 0.35}, {transform: 'translate(' + entre(-14, 14).toFixed(0) + 'px,' + entre(40, 70).toFixed(0) + 'px)', opacity: 0.6, offset: 0.7}, {transform: 'translate(' + entre(-10, 10).toFixed(0) + 'px,' + entre(70, 100).toFixed(0) + 'px)', opacity: 0}];
    }
    var a = particule(c, x, y, sz, fond, kf, {duration: dur, delay: -entre(0, dur), iterations: Infinity, easing: 'linear', rond: !feuille || d.effet !== 'feuilles'});
    self.boucles.push(a);
  }
}
Particules.prototype = Object.create(Base.prototype);
Particules.prototype.detruire = function(){ this.arreter(); this.el.remove(); };

/* ================= l'entrée ================= */
var TYPES = {objet: Objet, choix: Choix, tas: Tas, crane: Crane, dalle: Dalle, porte: Porte, sarcophage: Sarco, feu: Feu, chat: Chat, leo: Leo, deco: Deco, particules: Particules};
OBJETS.TYPES = TYPES;
OBJETS.creer = function(conteneur, def, opts){ var T = TYPES[def.type || 'objet'] || Objet; return new T(conteneur, def, opts || {}); };
/* poser toute une salle : renvoie {id: élément} */
OBJETS.poser = function(conteneur, salle, opts){ var r = {}; (salle.elements || []).forEach(function(d){ r[d.id] = OBJETS.creer(conteneur, d, Object.assign({fond: salle.png}, opts || {})); }); return r; };
OBJETS.pause = function(conteneur, oui){
  if(!conteneur.getAnimations) return;
  conteneur.getAnimations({subtree: true}).forEach(function(a){ try { if(oui) a.pause(); else if(a.playState === 'paused') a.play(); } catch(e){} });
};
OBJETS.versScene = versScene;
})(typeof window !== 'undefined' ? window : this);
