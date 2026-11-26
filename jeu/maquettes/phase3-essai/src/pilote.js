/* Un pilote automatique pour MON héros (les essais seulement : node tests/regles.js, et window.__pilote dans la page).
   Il « entend » les bulles des robots (S.cris) comme un joueur, relaie ce que montre son villageois un peu après,
   court à l'endroit sûr, lève le bouclier quand on le lui crie, se soigne quand il est bas, tape avec ce qu'il sait. */
(function (G) {
'use strict';
var P3 = G.P3;
function Pilote(o) {
  o = o || {};
  this.reaction = o.reaction || 0.6;      // le temps pour comprendre une bulle ou un cri
  this.relaisDelai = o.relais || 1.0;     // le temps pour lire sa bulle et toucher le bon portrait
  this.oubli = o.oubli || 0;              // la chance de rater une bulle
  this.sait = {}; this.but = null; this.r = Math.random;
}
Pilote.prototype.manette = function (S) {
  var h = S.h, P = P3, REG = P.REG, T = S.T, self = this;
  if (S.etat !== 'combat' || S.attente > 0 || !P.vivant(S)) return {mx: 0, my: 0};
  // ce que les amis me crient
  S.cris.forEach(function (c) {
    if (!c.x || self.sait[c.x.ref + c.x.quoi] || T < c.t + self.reaction) return;
    self.sait[c.x.ref + c.x.quoi] = 1;
    if (self.r() < self.oubli) return;
    if (c.x.quoi === 'zone') self.but = {lieu: c.x.val, fin: T + 4};
    else if (c.x.quoi === 'mega') P.bouclier(S);
    else if (c.x.quoi === 'elem') self.elem = c.x.val;
    else if (c.x.quoi === 'part') P.viser(S, c.x.val);
  });
  // ce que montre mon villageois : je le relaie (et l'endroit sûr, j'y vais moi aussi)
  P.mesInfos(S).forEach(function (x) {
    if (T < x.tA + self.relaisDelai) return;
    if (x.quoi === 'zone') { if (!self.but || self.but.lieu !== x.val) self.but = {lieu: x.val, fin: T + 4}; P.relayerZone(S); }
    else if (x.cible) P.relayer(S, x.cible);
  });
  // courir à l'endroit sûr
  if (this.but && T < this.but.fin) {
    var l = REG.lieux[this.but.lieu], dx = l.x - h.x, dy = l.y + 0.8 - h.y, d = Math.hypot(dx, dy);
    if (d > 0.5) { if (d > 2.5 && h.sautT <= 0) P.sauter(S, dx / d, dy / d); return {mx: dx / d, my: dy / d}; }
  } else this.but = null;
  // se soigner, ou taper
  if (!h.lance) {
    if (h.pv <= 50) P.lancer(S, 'soin');
    else if (S.boss > 0) {
      var e = this.elem !== undefined ? this.elem : Math.floor(this.r() * (S.combat === 1 ? 2 : 3));
      P.lancer(S, P.ELEMS[e]);
    }
  }
  return {mx: 0, my: 0};
};
G.Pilote = Pilote;
if (typeof module !== 'undefined') module.exports = Pilote;
})(typeof window !== 'undefined' ? window : globalThis);
