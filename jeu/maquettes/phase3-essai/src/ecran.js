/* =====================================================================
   Phase 3, maquette rapide — L'ÉCRAN (formes simples, aucun son)
   Accueil (son héros, le numéro de partie, les réglages) → départ ensemble (GO) → le combat.
   « 👀 Robots » : quatre petites tablettes jouées par des robots, pour voir comment ça tourne.
   ===================================================================== */
(function () {
'use strict';
var P3 = window.P3, R = P3.R, ROLES = P3.ROLES, REG = P3.REG;
var app = document.getElementById('app');
var VIT_IC = { lente: '🐢', normale: '🚶', rapide: '🐇' };
var BOSS_IC = { court: 'court', normal: 'normal', long: 'long' };
var XZ = [51, 150, 249];                                   // le milieu des trois zones
var PART_XY = [[80, 148], [226, 116], [150, 106], [150, 50]]; // lanterne, corbeau, cœur, tête
var PART_R = [22, 21, 19, 26];

function h(tag, cls, html, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined && html !== null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
function sv(tag, a, parent) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
function tete(ro, cls) { return '<span class="tete ' + (cls || '') + '" style="--c:' + R[ro].c + '">' + R[ro].ic + '</span>'; }
function sym(i) { return P3.SYMB[i][1]; }
function maintenant() { return Date.now(); }
function toucher(el, fn) { el.addEventListener('pointerdown', function (ev) { ev.preventDefault(); fn(ev); }); }

/* ---------- les petits dessins des cartes ---------- */
function miniZones(z) {
  var s = '<svg viewBox="0 0 46 30">';
  for (var i = 0; i < 3; i++) s += '<rect x="' + (1 + i * 15) + '" y="4" width="13" height="22" rx="3" fill="' + (i === z ? '#ffd23f' : '#2e3a58') + '" stroke="' + (i === z ? '#fff' : '#45537a') + '" stroke-width="1.5"/>';
  return s + '</svg>';
}
function miniGrosbec(p) {
  var on = function (k) { return k === p ? '#ffd23f' : '#5b2a30'; }, st = function (k) { return k === p ? '#fff' : '#ff6a55'; };
  return '<svg viewBox="0 0 60 44">' +
    '<line x1="24" y1="17" x2="13" y2="27" stroke="' + st(0) + '" stroke-width="4" stroke-linecap="round"/>' +
    '<line x1="36" y1="17" x2="47" y2="25" stroke="' + st(1) + '" stroke-width="4" stroke-linecap="round"/>' +
    '<rect x="8" y="27" width="9" height="11" rx="2" fill="' + on(0) + '" stroke="' + st(0) + '" stroke-width="1.5"/>' +
    '<ellipse cx="49" cy="22" rx="7" ry="5" fill="' + (p === 1 ? '#ffd23f' : '#151515') + '" stroke="' + st(1) + '" stroke-width="1.5"/>' +
    '<rect x="22" y="14" width="16" height="20" rx="5" fill="#4a1820" stroke="#ff6a55" stroke-width="1.5"/>' +
    '<circle cx="30" cy="22" r="4" fill="' + on(2) + '" stroke="' + st(2) + '" stroke-width="1.5"/>' +
    '<circle cx="30" cy="8" r="6" fill="' + (p === 3 ? '#ffd23f' : '#4a1820') + '" stroke="' + st(3) + '" stroke-width="1.5"/>' +
    '</svg>';
}
function carteHTML(e) {
  var c = R[e.cible], s = '<div class="qui">' + tete(e.cible) + '<b>' + c.nom + '</b></div><div class="infos">';
  if (e.k === 'mega') s += '<div class="info"><span class="pastille" style="background:#5fb4ff">🛡️</span><b>BOUCLIER</b></div>';
  else {
    s += '<div class="info">' + miniZones(e.zone) + '<b>' + P3.ZONES[e.zone] + '</b></div>';
    if (e.elem !== null) { var el = P3.ELEMS[e.elem]; s += '<div class="info"><span class="pastille" style="background:' + el.c + '">' + el.ic + '</span><b>' + el.n + '</b></div>'; }
    if (e.part !== null) s += '<div class="info">' + miniGrosbec(e.part) + '<b>' + P3.PARTIES[e.part] + '</b></div>';
  }
  return s + '</div><div class="minuteur"><i></i></div><span class="porte"></span>';
}

/* ---------- l'arène d'une tablette ---------- */
var ARENE =
  '<svg class="arene" viewBox="0 0 300 334">' +
  '<rect x="0" y="0" width="300" height="334" rx="14" fill="#141a2b"/>' +
  '<circle cx="21" cy="12" r="7" fill="#4a1820" stroke="#ff6a55" stroke-width="2"/>' +
  '<rect class="bb-fond" x="34" y="7" width="256" height="10" rx="5"/><rect class="bb-vie" x="34" y="7" width="256" height="10" rx="5"/>' +
  '<text class="bb-sym txt" x="162" y="12.5" font-size="11"></text>' +
  '<g class="grosbec">' +
    '<rect class="gb" x="128" y="146" width="16" height="36" rx="5"/><rect class="gb" x="156" y="146" width="16" height="36" rx="5"/>' +
    '<line class="gb-bras" x1="122" y1="86" x2="80" y2="128"/><line class="gb-bras2" x1="122" y1="86" x2="80" y2="128"/>' +
    '<line class="gb-bras" x1="178" y1="86" x2="218" y2="120"/><line class="gb-bras2" x1="178" y1="86" x2="218" y2="120"/>' +
    '<rect class="gb" x="116" y="74" width="68" height="78" rx="16"/>' +
    '<circle cx="150" cy="106" r="11" fill="#ff8a3d" stroke="#ffd2a8" stroke-width="2"/>' +
    '<circle class="gb" cx="150" cy="50" r="21"/>' +
    '<circle cx="142" cy="46" r="3.2" fill="#ffd23f"/><circle cx="158" cy="46" r="3.2" fill="#ffd23f"/>' +
    '<path d="M150 53 l-8 4 l8 10 l8 -10 z" fill="#ffb03a" stroke="#7a3b00" stroke-width="1"/>' +
    '<line x1="80" y1="128" x2="80" y2="134" stroke="#c9a24a" stroke-width="2"/>' +
    '<rect x="68" y="134" width="24" height="28" rx="4" fill="#ffd23f" stroke="#a07800" stroke-width="2"/><rect x="74" y="140" width="12" height="16" rx="2" fill="#fff2b0"/>' +
    '<g transform="translate(226,110)"><path d="M-12 4 l-11 -7 l4 11 z" fill="#151515" stroke="#7d8aa8" stroke-width="1"/>' +
      '<ellipse cx="0" cy="6" rx="15" ry="10" fill="#151515" stroke="#7d8aa8" stroke-width="1.5"/><circle cx="10" cy="-4" r="7" fill="#151515" stroke="#7d8aa8" stroke-width="1.5"/>' +
      '<path d="M16 -5 l8 2 l-8 3 z" fill="#c9a24a"/><circle cx="11" cy="-6" r="1.6" fill="#ffd23f"/></g>' +
    '<circle class="mega" cx="150" cy="106" r="0" fill="#ff3b30" opacity=".85"/>' +
    '<circle class="viseur" cx="0" cy="0" r="20" visibility="hidden"/>' +
    '<rect class="part-zone" data-p="0" x="52" y="114" width="56" height="62"/>' +
    '<rect class="part-zone" data-p="1" x="196" y="90" width="64" height="50"/>' +
    '<circle class="part-zone" data-p="2" cx="150" cy="108" r="24"/>' +
    '<circle class="part-zone" data-p="3" cx="150" cy="50" r="28"/>' +
  '</g>' +
  '<g class="sol">' +
    '<rect class="zone" data-z="0" x="4" y="196" width="94" height="118" rx="10"/>' +
    '<rect class="zone" data-z="1" x="103" y="196" width="94" height="118" rx="10"/>' +
    '<rect class="zone" data-z="2" x="202" y="196" width="94" height="118" rx="10"/>' +
    '<text class="zone-txt" x="51" y="306">GAUCHE</text><text class="zone-txt" x="150" y="306">MILIEU</text><text class="zone-txt" x="249" y="306">DROITE</text>' +
    '<rect class="alerte" x="2" y="193" width="296" height="124" rx="12" visibility="hidden"/>' +
    '<rect class="alerte-barre" x="4" y="187" width="292" height="4" rx="2" fill="#ffd23f" visibility="hidden"/>' +
  '</g>' +
  '<g class="heros" transform="translate(150,256)">' +
    '<circle class="h-bouclier" r="28" fill="rgba(95,180,255,.25)" stroke="#5fb4ff" stroke-width="3" visibility="hidden"/>' +
    '<circle class="h-soin" r="24" fill="none" stroke="#5fd38a" stroke-width="5" stroke-dasharray="0 200" transform="rotate(-90)"/>' +
    '<circle class="h-corps" r="18" stroke="rgba(0,0,0,.5)" stroke-width="2"/>' +
    '<text class="h-ic txt" font-size="18" y="1"></text>' +
    '<circle class="h-elem" cx="16" cy="-15" r="6.5" stroke="#000" stroke-width="1.5" visibility="hidden"/>' +
  '</g>' +
  '<rect class="vie-fond" x="60" y="319" width="180" height="9" rx="4.5"/><rect class="vie" x="60" y="319" width="180" height="9" rx="4.5"/>' +
  '<g class="effets"></g>' +
  '<g class="grand" visibility="hidden" pointer-events="none"><rect class="grand-fond" x="0" y="0" width="300" height="334" rx="14" fill="rgba(10,12,20,.72)"/>' +
    '<text class="grand-txt txt" x="150" y="150" font-size="96"></text><text class="grand-sous txt" x="150" y="232" font-size="26" fill="#ffd23f"></text></g>' +
  '</svg>';

function Ecran(boite, P, o) {
  var self = this;
  this.P = P; this.o = o || {}; this.boite = boite; this.effets = []; this.cartesVues = {};
  boite.innerHTML = '';
  if (!this.o.mini) {
    this.haut = h('div', 'haut', null, boite);
    this.bReprendre = h('button', 'reprendre', '↺ On reprend', this.haut);
    this.ou = h('div', 'ou', '<span class="ou-t"></span><div class="prog-manche"><i></i></div>', this.haut);
    this.code = h('div', 'code', null, this.haut);
    this.cases = {};
    ROLES.forEach(function (ro) {
      var c = h('button', 'case' + (ro === P.role ? ' moi' : ''), '?', self.code);
      c.style.setProperty('--c', R[ro].c); c.dataset.r = ro; self.cases[ro] = c;
    });
  } else {
    this.nom = h('div', 'nomini', tete(P.role), boite);
  }
  this.cartes = h('div', 'cartes', null, boite);
  this.areneBoite = h('div', 'arene-boite', ARENE, boite);
  this.svg = this.areneBoite.querySelector('svg');
  var q = function (s) { return self.svg.querySelector(s); };
  this.r = { bb: q('.bb-vie'), bbSym: q('.bb-sym'), gb: this.svg.querySelectorAll('.gb, .gb-bras'), grosbec: q('.grosbec'), mega: q('.mega'), viseur: q('.viseur'),
    zones: this.svg.querySelectorAll('.zone'), alerte: q('.alerte'), alerteB: q('.alerte-barre'), heros: q('.heros'), bouclier: q('.h-bouclier'),
    soin: q('.h-soin'), corps: q('.h-corps'), ic: q('.h-ic'), elem: q('.h-elem'), vie: q('.vie'), effets: q('.effets'), grand: q('.grand'),
    grandT: q('.grand-txt'), grandS: q('.grand-sous'), grandF: q('.grand-fond') };
  this.r.corps.setAttribute('fill', R[P.role].c); this.r.ic.textContent = R[P.role].ic;
  if (!this.o.mini) {
    this.cmd = h('div', 'commandes', null, boite);
    var elems = h('div', 'elems', null, this.cmd);
    this.bElems = P3.ELEMS.map(function (el, i) {
      var b = h('button', 'elem', el.ic + '<b>' + el.n + '</b>', elems); b.style.setProperty('--c', el.c); b.dataset.e = i; return b;
    });
    var act = h('div', 'actions', null, this.cmd);
    this.bBouclier = h('button', 'act bouclier', '🛡️<b>BOUCLIER</b><span class="attente"></span>', act);
    this.bSoin = h('button', 'act soin', '<span class="prog"></span>💚<b>SOIN</b>', act);
  }
  P.joueur.surEv = function (e) { self.surEv(e); };
  if (this.o.interactif) this.brancher();
}
Ecran.prototype.brancher = function () {
  var self = this, P = this.P, J = P.joueur;
  var agir = function (fn) { var t = self.o.horloge(); fn(t); self.majCommandes(t); };
  Array.prototype.forEach.call(this.r.zones, function (z) { toucher(z, function () { agir(function (t) { J.aller(+z.dataset.z, t); }); }); });
  Array.prototype.forEach.call(this.svg.querySelectorAll('.part-zone'), function (z) { toucher(z, function () { agir(function () { J.choisirPart(+z.dataset.p); }); }); });
  this.bElems.forEach(function (b) { toucher(b, function () { agir(function () { J.choisirElem(+b.dataset.e); }); }); });
  toucher(this.bBouclier, function () { agir(function (t) { J.bouclier(t); }); });
  toucher(this.bSoin, function () { agir(function (t) { J.soigner(t); }); });
  toucher(this.bReprendre, function () { self.o.surReprendre && self.o.surReprendre(); });
  ROLES.forEach(function (ro) { if (ro !== P.role) toucher(self.cases[ro], function () { self.o.surCase && self.o.surCase(ro); }); });
};
/* ---------- les effets (des formes qui vivent un instant) ---------- */
Ecran.prototype.effet = function (dur, creer, maj) {
  var g = sv('g', {}, this.r.effets), e = { t0: maintenant(), dur: dur, g: g, maj: maj };
  creer(g); this.effets.push(e); if (maj) maj(0, g);
};
Ecran.prototype.texte = function (x, y, txt, coul, taille) {
  this.effet(800, function (g) { var t = sv('text', { x: x, y: y, class: 'txt', 'font-size': taille || 16, fill: coul }, g); t.textContent = txt; },
    function (f, g) { g.setAttribute('transform', 'translate(0,' + (-24 * f) + ')'); g.setAttribute('opacity', 1 - f * f); });
};
Ecran.prototype.herosX = function (t) {
  var J = this.P.joueur;
  if (t >= J.arrivee || J.zone === J.versZone) return XZ[J.versZone];
  var f = 1 - (J.arrivee - t) / REG.deplacement; return XZ[J.zone] + (XZ[J.versZone] - XZ[J.zone]) * Math.max(0, Math.min(1, f));
};
Ecran.prototype.surEv = function (e) {
  var self = this, J = this.P.joueur;
  if (e.type === 'tir') {
    var x0 = this.herosX(e.t), p = J.partSel, x1 = PART_XY[p][0], y1 = PART_XY[p][1], c = P3.ELEMS[J.elemSel].c, bon = e.bon;
    this.effet(260, function (g) { sv('circle', { r: 5.5, fill: c, stroke: '#fff', 'stroke-width': 1 }, g); },
      function (f, g) { g.setAttribute('transform', 'translate(' + (x0 + (x1 - x0) * f) + ',' + (238 + (y1 - 238) * f) + ')'); });
    setTimeout(function () {
      if (bon) {
        self.effet(320, function (g) { sv('circle', { cx: x1, cy: y1, r: 8, fill: 'none', stroke: c, 'stroke-width': 4 }, g); },
          function (f, g) { g.firstChild.setAttribute('r', 8 + 16 * f); g.setAttribute('opacity', 1 - f); });
        self.texte(x1 + 14, y1 - 10, '−1', '#fff', 13);
      } else self.effet(300, function (g) { var t = sv('text', { x: x1, y: y1, class: 'txt', 'font-size': 18, fill: '#8a93a8' }, g); t.textContent = '✕'; },
        function (f, g) { g.setAttribute('opacity', 1 - f); });
    }, 250);
  } else if (e.type === 'garde') {
    Array.prototype.forEach.call(this.r.gb, function (x) { x.classList.add('flash'); });
    setTimeout(function () { Array.prototype.forEach.call(self.r.gb, function (x) { x.classList.remove('flash'); }); }, 320);
  } else if (e.type === 'zone-impact') {
    [0, 1, 2].forEach(function (z) {
      if (z === e.sur) return;
      var zr = self.r.zones[z];
      self.effet(520, function (g) {
        sv('rect', { x: zr.getAttribute('x'), y: 196, width: 94, height: 118, rx: 10, fill: '#ff5548' }, g);
        for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; sv('line', { x1: XZ[z], y1: 256, x2: XZ[z] + Math.cos(a) * 40, y2: 256 + Math.sin(a) * 40, stroke: '#ffd23f', 'stroke-width': 4, 'stroke-linecap': 'round' }, g); }
      }, function (f, g) { g.setAttribute('opacity', (1 - f) * 0.85); });
    });
  } else if (e.type === 'touche') {
    var x = this.herosX(e.t);
    this.effet(450, function (g) { sv('rect', { x: 0, y: 0, width: 300, height: 334, rx: 14, fill: '#ff2a1a' }, g); }, function (f, g) { g.setAttribute('opacity', 0.4 * (1 - f)); });
    this.texte(x, 222, '−' + e.deg, '#ff7a70', 18);
  } else if (e.type === 'soin') {
    this.texte(this.herosX(e.t), 222, '+' + REG.soin, '#5fd38a', 18);
  } else if (e.type === 'mega-impact') {
    var hx = this.herosX(e.t);
    if (e.moi && e.ok) {
      this.effet(500, function (g) { sv('circle', { cx: hx, cy: 256, r: 28, fill: 'none', stroke: '#9fd2ff', 'stroke-width': 6 }, g); },
        function (f, g) { g.firstChild.setAttribute('r', 28 + 26 * f); g.setAttribute('opacity', 1 - f); });
    } else if (e.moi) {
      this.effet(420, function (g) { sv('line', { x1: 150, y1: 106, x2: hx, y2: 256, stroke: '#ff3b30', 'stroke-width': 14, 'stroke-linecap': 'round' }, g); }, function (f, g) { g.setAttribute('opacity', 1 - f); });
    } else {
      /* c'était pour un autre : la boule part vers lui (on voit après coup qui était visé) */
      var ro = e.cible;
      this.effet(700, function (g) {
        sv('circle', { r: 13, fill: '#ff3b30' }, g);
        sv('circle', { r: 11, fill: R[ro].c, cx: 16, cy: -12 }, g);
        var t = sv('text', { x: 16, y: -11, class: 'txt', 'font-size': 12 }, g); t.textContent = R[ro].ic;
      }, function (f, g) { g.setAttribute('transform', 'translate(' + (150 + 170 * f) + ',' + (106 - 140 * f) + ')'); g.setAttribute('opacity', 1 - f * 0.6); });
    }
  } else if (e.type === 'boss-mort') {
    this.symboleJusqua = maintenant() + 5000;
  }
};
/* ---------- chaque image ---------- */
Ecran.prototype.maj = function (t) {
  var P = this.P, J = P.joueur, r = this.r, now = maintenant(), self = this;
  /* le boss */
  r.bb.setAttribute('width', Math.max(0, 256 * J.boss / J.bossMax));
  r.bbSym.textContent = J.boss <= 0 ? sym(P.monSymbole()) : '';
  r.grosbec.setAttribute('opacity', J.boss <= 0 ? 0.55 : 1);
  /* la frappe qui arrive sur moi : je vois qu'elle arrive, pas où */
  var z = J.zoneEnCours;
  if (z && !J.mort) {
    var f = Math.max(0, Math.min(1, (z.tI - t) / (z.tI - z.tA)));
    r.alerte.setAttribute('visibility', 'visible'); r.alerteB.setAttribute('visibility', 'visible');
    r.alerteB.setAttribute('width', 292 * f); r.alerteB.setAttribute('x', 150 - 146 * f);
    r.alerte.setAttribute('opacity', 0.55 + 0.45 * Math.abs(Math.sin(now / 140)));
  } else { r.alerte.setAttribute('visibility', 'hidden'); r.alerteB.setAttribute('visibility', 'hidden'); }
  /* la méga attaque (sur toutes les tablettes) */
  var m = J.megaEnCours;
  if (m && !J.mort) {
    var g = Math.max(0, Math.min(1, (t - m.tA) / (m.tI - m.tA)));
    r.mega.setAttribute('r', 5 + 30 * g + 3 * Math.sin(now / 70)); r.mega.setAttribute('opacity', 0.55 + 0.4 * g);
  } else r.mega.setAttribute('r', 0);
  /* le viseur, l'élément choisi */
  if (J.partSel !== null && J.boss > 0) {
    r.viseur.setAttribute('visibility', 'visible'); r.viseur.setAttribute('cx', PART_XY[J.partSel][0]); r.viseur.setAttribute('cy', PART_XY[J.partSel][1]);
    r.viseur.setAttribute('r', PART_R[J.partSel]); r.viseur.setAttribute('stroke-dashoffset', (now / 40) % 18);
  } else r.viseur.setAttribute('visibility', 'hidden');
  if (J.elemSel !== null && J.boss > 0) { r.elem.setAttribute('visibility', 'visible'); r.elem.setAttribute('fill', P3.ELEMS[J.elemSel].c); }
  else r.elem.setAttribute('visibility', 'hidden');
  /* le héros */
  r.heros.setAttribute('transform', 'translate(' + this.herosX(t) + ',256)');
  r.bouclier.setAttribute('visibility', J.bouclierFin >= t ? 'visible' : 'hidden');
  if (J.soinDebut >= 0) { var s = Math.max(0, Math.min(1, (t - J.soinDebut) / REG.soinDuree)); r.soin.setAttribute('stroke-dasharray', (151 * s) + ' 200'); }
  else r.soin.setAttribute('stroke-dasharray', '0 200');
  r.vie.setAttribute('width', 180 * J.vie / REG.vie);
  r.vie.setAttribute('fill', J.vie > 50 ? '#5fd38a' : J.vie > 25 ? '#ffb03a' : '#ff5548');
  /* le grand dessin : tombé, ou mon symbole */
  if (J.mort) {
    r.grand.setAttribute('visibility', 'visible'); r.grandT.textContent = '💀'; r.grandS.textContent = '';
    r.grandF.setAttribute('height', 334); r.grandT.setAttribute('y', 150); r.grandT.setAttribute('font-size', 96); r.grandS.setAttribute('y', 232);
  } else if (this.symboleJusqua && now < this.symboleJusqua) {
    /* mon symbole : par-dessus Grosbec seulement, pour qu'on voie toujours le sol et qu'on puisse encore bouger */
    r.grand.setAttribute('visibility', 'visible'); r.grandT.textContent = sym(P.monSymbole()); r.grandS.textContent = '📣 ' + P3.SYMB[P.monSymbole()][2];
    r.grandF.setAttribute('height', 190); r.grandT.setAttribute('y', 92); r.grandT.setAttribute('font-size', 80); r.grandS.setAttribute('y', 165);
  }
  else r.grand.setAttribute('visibility', 'hidden');
  /* les effets */
  this.effets = this.effets.filter(function (e) {
    var f = (now - e.t0) / e.dur;
    if (f >= 1) { e.g.remove(); return false; }
    if (e.maj) e.maj(f, e.g); return true;
  });
  this.majCartes(t);
  if (!this.o.mini) this.majHaut(t), this.majCommandes(t);
};
Ecran.prototype.majCartes = function (t) {
  var self = this, l = this.P.cartes(t), vues = {}, T = this.o.table;
  l.forEach(function (e) {
    vues[e.id] = 1;
    var c = self.cartesVues[e.id];
    if (!c) { c = h('div', 'carte' + (e.k === 'mega' ? ' mega' : ''), carteHTML(e), self.cartes); c.style.setProperty('--c', R[e.cible].c); self.cartesVues[e.id] = c; }
    c.querySelector('.minuteur i').style.width = (100 * Math.max(0, Math.min(1, (e.tI - t) / (e.tI - e.tA)))) + '%';
    if (T) c.querySelector('.porte').textContent = T.cries[e.id] && T.cries[e.id] <= t ? '📣' : '';
  });
  for (var id in this.cartesVues) if (!vues[id]) { this.cartesVues[id].remove(); delete this.cartesVues[id]; }
};
Ecran.prototype.majHaut = function (t) {
  var P = this.P, J = P.joueur, self = this;
  this.ou.querySelector('.ou-t').innerHTML = 'Partie <b>' + P.partie + '</b> · Essai <b>' + P.essai + '</b> · Manche <b>' + P.m + '</b> · ' + VIT_IC[P.vitesse];
  this.ou.querySelector('.prog-manche i').style.width = (100 * Math.max(0, Math.min(1, t / P.M.D))) + '%';
  this.bReprendre.classList.toggle('appel', J.mort);
  ROLES.forEach(function (ro) {
    var c = self.cases[ro], s;
    if (ro === P.role) s = J.boss <= 0 ? P.monSymbole() : null;
    else s = P.code[ro] !== undefined ? P.code[ro] : null;
    var txt = s === null ? '?' : sym(s);
    if (c.dataset.txt !== txt) { c.textContent = txt; c.dataset.txt = txt; }
    c.classList.toggle('bon', s !== null);
    c.classList.toggle('crie', ro === P.role && s !== null);
  });
};
Ecran.prototype.majCommandes = function (t) {
  var J = this.P.joueur, sout = J.boss <= 0 || J.mort;
  this.bElems.forEach(function (b, i) { b.classList.toggle('oui', J.elemSel === i && !sout); b.disabled = sout; });
  this.bBouclier.classList.toggle('leve', J.bouclierFin >= t);
  this.bBouclier.classList.toggle('attend', J.bouclierAttente > 0 && J.bouclierFin < t);
  this.bBouclier.querySelector('.attente').textContent = J.bouclierAttente > 0 && J.bouclierFin < t ? '⏳' + J.bouclierAttente : '';
  this.bSoin.querySelector('.prog').style.width = J.soinDebut >= 0 ? (100 * Math.min(1, (t - J.soinDebut) / REG.soinDuree)) + '%' : '0';
  this.bSoin.disabled = J.mort;
  this.bBouclier.disabled = J.mort;
};

/* =====================================================================
   Les écrans
   ===================================================================== */
var E = { role: null, partie: '', vitesse: 'normale', depart: 1, bossVie: 'normal' };
try { var sauve = JSON.parse(localStorage.getItem('p3-essai') || '{}'); for (var k in sauve) if (k in E) E[k] = sauve[k]; } catch (e) {}
function garder() { try { localStorage.setItem('p3-essai', JSON.stringify(E)); } catch (e) {} }
var boucle = null;
function arreter() { if (boucle) cancelAnimationFrame(boucle); boucle = null; }
var verrou = null;
function garderEcranAllume() { try { if (navigator.wakeLock && !verrou) navigator.wakeLock.request('screen').then(function (v) { verrou = v; v.addEventListener('release', function () { verrou = null; }); }).catch(function () {}); } catch (e) {} }
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && boucle) garderEcranAllume(); });
function pleinEcran() { var d = document.documentElement; try { (d.requestFullscreen || d.webkitRequestFullscreen).call(d); } catch (e) {} }

function choix(parent, valeurs, actuel, fn) {
  var c = h('div', 'choix', null, parent);
  valeurs.forEach(function (v) {
    var b = h('button', v[0] === actuel ? 'oui' : '', v[1], c);
    toucher(b, function () { Array.prototype.forEach.call(c.children, function (x) { x.classList.remove('oui'); }); b.classList.add('oui'); fn(v[0]); });
  });
  return c;
}

function accueil() {
  arreter(); app.innerHTML = '';
  var p = h('div', 'page', null, app);
  h('div', 'titre', 'Phase 3<small>ESSAI À QUATRE TABLETTES</small>', p);
  var l = h('div', 'ligne', null, p);
  var choixH = {};
  ROLES.forEach(function (ro) {
    var b = h('button', 'heros-choix' + (E.role === ro ? ' choisi' : ''), tete(ro) + '<b>' + R[ro].nom + '</b>', l);
    choixH[ro] = b;
    toucher(b, function () { E.role = ro; garder(); for (var k in choixH) choixH[k].classList.toggle('choisi', k === ro); maj(); });
  });
  var ln = h('div', 'ligne', null, p);
  h('span', 'lbl', 'Partie', ln);
  var num = h('div', 'numero', null, ln);
  var pave = h('div', 'pave', null, p);
  '1234567890'.split('').forEach(function (d) { var b = h('button', '', d, pave); toucher(b, function () { if (E.partie.length < 3) E.partie += d; garder(); maj(); }); });
  var bEff = h('button', '', '⌫', pave); bEff.style.gridColumn = 'span 5'; bEff.style.width = 'auto';
  toucher(bEff, function () { E.partie = E.partie.slice(0, -1); garder(); maj(); });
  var lr = h('div', 'ligne', null, p);
  choix(lr, [['lente', '🐢'], ['normale', '🚶'], ['rapide', '🐇']], E.vitesse, function (v) { E.vitesse = v; garder(); });
  var cd = h('div', 'ligne', null, lr); h('span', 'lbl', 'Manche', cd);
  choix(cd, [[1, '1'], [4, '4'], [7, '7']], E.depart, function (v) { E.depart = v; garder(); });
  var cb = h('div', 'ligne', null, lr); h('span', 'lbl', 'Boss', cb);
  choix(cb, [['court', '▮'], ['normal', '▮▮'], ['long', '▮▮▮']], E.bossVie, function (v) { E.bossVie = v; garder(); });
  var lb = h('div', 'ligne', null, p);
  var pret = h('button', 'jaune', 'Prêt', lb);
  toucher(pret, function () { if (!pret.disabled) depart(); });
  var lg = h('div', 'ligne', null, p);
  toucher(h('button', 'gris', '👀 Robots', lg), function () { demo(); });
  toucher(h('button', 'gris', '⛶', lg), function () { pleinEcran(); });
  function maj() {
    num.textContent = E.partie || '—'; num.classList.toggle('vide', !E.partie);
    pret.disabled = !(E.role && E.partie);
  }
  maj();
}

/* le départ ensemble : on dit « 3, 2, 1 » et on appuie tous en même temps */
function depart() {
  var P = new P3.Partie({ partie: +E.partie, vitesse: E.vitesse, role: E.role, depart: E.depart, bossVie: E.bossVie });
  ecranGo(P, function () { jeu(P); });
}
function ecranGo(P, fn, retour) {
  arreter(); app.innerHTML = '';
  var p = h('div', 'page', null, app);
  p.style.justifyContent = 'center'; p.style.height = '100%';
  var eq = h('div', 'equipe', null, p);
  ROLES.forEach(function (ro) { h('span', ro === P.role ? 'moi' : '', tete(ro), eq); });
  h('div', 'reperes', 'Partie <b>' + P.partie + '</b> · Essai <b>' + P.essai + '</b> · Manche <b>' + P.m + '</b> · ' + VIT_IC[P.vitesse] + ' · Boss <b>' + BOSS_IC[P.bossVie] + '</b>', p);
  h('div', 'compte', '3 · 2 · 1', p);
  var go = h('button', 'jaune go', 'GO', p);
  toucher(go, function () { garderEcranAllume(); fn(maintenant()); });
  toucher(h('button', 'gris', '←', p), function () { (retour || accueil)(); });
}

function jeu(P) {
  arreter(); app.innerHTML = ''; window.__p3.P = P;
  var racine = h('div', 'jeu', null, app);
  var goMur = maintenant() + REG.lancement * 1000;
  var horloge = function () { var T = (maintenant() - goMur) / 1000; P.temps(T); return T - P.debut; };
  var voile = null, bandeauJusqua = 0, bandeauTxt = '', fini = false;
  var bandeau = h('div', 'bandeau cache', '', racine);
  function annoncer(txt, ms) { bandeauTxt = txt; bandeauJusqua = maintenant() + ms; }
  annoncer('Manche ' + P.m, 1800);
  P.surManche = function (m) { annoncer('Manche ' + m, 1500); };
  function fermer() { if (voile) { voile.remove(); voile = null; } }
  var ec = new Ecran(racine, P, {
    interactif: true, horloge: horloge,
    surReprendre: function () {
      fermer();
      voile = h('div', 'voile', null, racine);
      var f = h('div', 'fenetre', null, voile);
      toucher(h('button', 'ferme', '✕', f), fermer);
      h('div', 'titre', '↺', f);
      var k = P.mortManche || P.m, es = P.essai + 1;
      var l1 = h('div', 'pas', null, f); h('span', 'lbl', 'Manche', l1);
      var m1 = h('button', '', '−', l1), v1 = h('span', 'val', '', l1), p1 = h('button', '', '+', l1);
      var l2 = h('div', 'pas', null, f); h('span', 'lbl', 'Essai', l2);
      var m2 = h('button', '', '−', l2), v2 = h('span', 'val', '', l2), p2 = h('button', '', '+', l2);
      function maj() { v1.textContent = k; v2.textContent = es; }
      toucher(m1, function () { k = Math.max(P.depart, k - 1); maj(); }); toucher(p1, function () { k = Math.min(P.m, k + 1); maj(); });
      toucher(m2, function () { es = Math.max(1, es - 1); maj(); }); toucher(p2, function () { es++; maj(); });
      maj();
      h('div', 'compte', '3 · 2 · 1', f);
      var go = h('button', 'jaune go', 'GO', f);
      toucher(go, function () {
        fermer(); P.reprendre(k, es); goMur = maintenant() + REG.lancement * 1000;
        ec.symboleJusqua = 0; annoncer('Manche ' + P.m, 1800);
      });
    },
    surCase: function (ro) {
      fermer();
      voile = h('div', 'voile', null, racine);
      var f = h('div', 'fenetre', null, voile);
      toucher(h('button', 'ferme', '✕', f), fermer);
      h('div', '', tete(ro), f).style.fontSize = 'clamp(30px,8vmin,60px)';
      var g = h('div', 'symboles', null, f);
      P3.SYMB.forEach(function (s, i) {
        var b = h('button', '', s[1], g);
        toucher(b, function () {
          if (P.taper(ro, i)) fermer();
          else { fermer(); var c = ec.cases[ro]; c.classList.remove('faux'); void c.offsetWidth; c.classList.add('faux'); }
        });
      });
    }
  });
  function image() {
    var t = horloge();
    ec.maj(t);
    var b = maintenant() < bandeauJusqua;
    bandeau.classList.toggle('cache', !b); if (b && bandeau.textContent !== bandeauTxt) bandeau.textContent = bandeauTxt;
    if (!fini && P.victoire()) { fini = true; victoire(P); return; }
    boucle = requestAnimationFrame(image);
  }
  image();
}

function victoire(P) {
  arreter(); app.innerHTML = '';
  var p = h('div', 'page', null, app); p.style.justifyContent = 'center'; p.style.height = '100%';
  h('div', 'victoire', '✨', p);
  var eq = h('div', 'equipe', null, p);
  ROLES.forEach(function (ro) { var c = h('div', 'case bon', sym(P.symboles[ro]), eq); c.style.setProperty('--c', R[ro].c); c.insertAdjacentHTML('afterbegin', tete(ro, 'mini')); });
  h('div', 'reperes', 'Manche <b>' + P.m + '</b> · Essai <b>' + P.essai + '</b>', p);
  toucher(h('button', 'jaune', 'Rejouer', p), accueil);
}

/* ---------- les robots : quatre petites tablettes ---------- */
function demo() {
  arreter(); app.innerHTML = '';
  var racine = h('div', 'demo', null, app);
  var haut = h('div', 'demo-haut', null, racine);
  toucher(h('button', 'gris', '✕', haut), accueil);
  var ATT = { a: 1, b: 0.9, c: 0.75 }, att = 'b', vite = 1, graine = 1 + Math.floor(Math.random() * 999);
  choix(haut, [['a', '😀'], ['b', '🙂'], ['c', '😵']], att, function (v) { att = v; for (var ro in T.robots) T.robots[ro].p = ATT[att]; });
  choix(haut, [[1, '×1'], [2, '×2']], vite, function (v) { vite = v; });
  var ou = h('div', 'reperes', '', haut);
  var grille = h('div', 'demo-grille', null, racine);
  var bandeau = h('div', 'bandeau cache', '', racine);
  var T, ecrans, mortA, finA, bandeauJusqua = 0;
  function nouvelle() {
    graine++;
    T = new P3.Table({ partie: graine, graine: graine, vitesse: 'normale', depart: 1, bossVie: 'court', pTous: ATT[att] });
    T.t = -REG.lancement;
    grille.innerHTML = ''; ecrans = {};
    ROLES.forEach(function (ro) {
      var b = h('div', 'mini', null, grille); b.style.setProperty('--c', R[ro].c);
      ecrans[ro] = new Ecran(b, T.parties[ro], { mini: true, table: T });
    });
    mortA = null; finA = null;
  }
  nouvelle();
  var avant = maintenant();
  function image() {
    var now = maintenant(), dt = Math.min(0.1, (now - avant) / 1000) * vite; avant = now;
    if (finA === null) {
      var n = Math.max(1, Math.ceil(dt / 0.05));
      for (var i = 0; i < n; i++) T.pas(dt / n);
      if (T.morts().length && mortA === null) mortA = { t: now, m: T.M().m };
      if (mortA && now - mortA.t > 3000 / vite) { T.reprendre(mortA.m); mortA = null; bandeau.textContent = '↺ On reprend'; bandeauJusqua = now + 1500; ROLES.forEach(function (ro) { ecrans[ro].symboleJusqua = 0; }); }
      if (ROLES.every(function (ro) { return T.parties[ro].joueur.boss <= 0; })) { finA = now; bandeau.textContent = '✨'; bandeauJusqua = now + 3500; }
    } else if (now - finA > 4000) nouvelle();
    ROLES.forEach(function (ro) { ecrans[ro].maj(T.t); });
    var P = T.parties.sage;
    ou.innerHTML = 'Essai <b>' + P.essai + '</b> · Manche <b>' + P.m + '</b>';
    bandeau.classList.toggle('cache', now > bandeauJusqua);
    boucle = requestAnimationFrame(image);
  }
  image();
}

window.__p3 = { E: E, accueil: accueil, depart: depart, demo: demo, P3: P3 };
accueil();
})();
