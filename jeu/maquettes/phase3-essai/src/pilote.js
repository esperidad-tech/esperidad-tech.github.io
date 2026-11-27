/* Un pilote automatique pour MON héros (les essais seulement : node tests/regles.js, et window.__pilote dans la page).
   Il « entend » les bulles des robots (S.cris) comme un joueur, relaie ce que montre son villageois un peu après,
   court à l'endroit sûr, lève le bouclier quand on le lui crie, se soigne quand il est bas.
   (v4) Il ne tape que quand il connaît la partie faible : quand il la voit bouger sur Grosbec (il la touche : ça la crie aux robots),
   ou quand un robot la lui crie ; dès qu'une attaque rebondit, il l'oublie ; au bout de 10 s sans rien savoir, il tente au hasard. */
(function (G) {
'use strict';
var P3 = G.P3;
function Pilote(o) {
  o = o || {};
  this.reaction = o.reaction || 0.6;      // le temps pour comprendre une bulle ou un cri
  this.relaisDelai = o.relais || 1.0;     // le temps pour voir la partie bouger, ou lire sa bulle, et toucher
  this.oubli = o.oubli || 0;              // la chance de rater une bulle
  this.sait = {}; this.but = null; this.r = Math.random; this.connue = false; this.rebonds = 0; this.depuis = 0;
}
Pilote.prototype.manette = function (S) {
  var h = S.h, P = P3, REG = P.REG, T = S.T, self = this;
  if (S.etat !== 'combat' || S.attente > 0 || !P.vivant(S)) return {mx: 0, my: 0};
  if (S.stats.rebonds > this.rebonds) { this.rebonds = S.stats.rebonds; this.connue = false; this.depuis = T; }   // ça a rebondi : la faiblesse a changé
  // (v4) la partie qui bouge sur MON Grosbec : je la touche (je vise, et je la crie)
  var pm = P.partMontree(S);
  if (pm && T >= pm.tA + this.relaisDelai && !this.sait['p' + pm.ref]) {
    this.sait['p' + pm.ref] = 1;
    if (this.r() >= this.oubli) { P.viser(S, pm.val); this.connue = true; }
  }
  // (v3) il ne voit qu'une bulle à la fois, comme le joueur
  var bu = S.bulle;
  if (bu && T >= bu.debut + (bu.type === 'ami' ? this.reaction : this.relaisDelai) && !this.sait[bu.cle]) {
    this.sait[bu.cle] = 1;
    if (this.r() >= this.oubli) {
      var x = bu.x;
      if (bu.type === 'ami' && x) {
        if (x.quoi === 'zone') this.but = {lieu: x.val, fin: T + 6};
        else if (x.quoi === 'mega') P.bouclier(S);
        else if (x.quoi === 'part') { P.viser(S, x.val); this.connue = true; }
      } else if (bu.type === 'villageois') {
        if (x.quoi === 'zone') { this.but = {lieu: x.val, fin: T + 6}; P.relayerZone(S); }
        else P.relayer(S, x.cible);
      }
    }
  }
  // courir à l'endroit sûr
  if (this.but && T < this.but.fin) {
    var l = REG.lieux[this.but.lieu], dx = l.x - h.x, dy = l.y + 0.8 - h.y, d = Math.hypot(dx, dy);
    if (d > 0.5) { if (d > 2.5 && h.sautT <= 0) P.sauter(S, dx / d, dy / d); return {mx: dx / d, my: dy / d}; }
  } else this.but = null;
  // se soigner, ou taper
  if (!h.lance) {
    if (h.pv <= 50) P.lancer(S, 'soin');
    else if (S.combat === 1) { if (h.pv > 75 && this.r() < 0.02) P.lancer(S, 'sort'); }
    else if (S.boss > 0) {
      if (!this.connue && T - this.depuis > 10) { P.viser(S, Math.floor(this.r() * 6)); this.connue = true; }   // il tente au hasard
      if (this.connue) P.lancer(S, 'sort');
    }
  }
  return {mx: 0, my: 0};
};
G.Pilote = Pilote;
if (typeof module !== 'undefined') module.exports = Pilote;
})(typeof window !== 'undefined' ? window : globalThis);
