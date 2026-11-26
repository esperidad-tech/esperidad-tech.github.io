/* Un robot qui joue la phase 2 (dans node, sans dessin), pour régler les chiffres.
   node tests/robot.js [facon=immobile|bouton|faible] [niveau=bon|moyen] [parties=6] [pisteur=25] [vitesse=1] [symbole=0.25]
   Il réagit avec un temps de retard (niveau « bon » : 0,35 s ; « moyen » : 0,6 s et des erreurs). */
'use strict';
const path = require('path');
require(path.join(__dirname, '..', 'src', 'regles.js'));
require(path.join(__dirname, 'robot-coeur.js'));
const P2 = globalThis.P2, REG = P2.REG;

const arg = {}; process.argv.slice(2).forEach(a => { const [k, v] = a.split('='); arg[k] = v; });
const FACON = arg.facon || 'immobile', NIVEAU = arg.niveau || 'bon', N = +(arg.parties || 6);
const L = {W: 420, H: 860, solHaut: 300, solBas: 740, solG: 12, solD: 408, bossY: 170, bossTouche: 215};

function partie(graine) {
  const reg = {facon: FACON, pisteur: +(arg.pisteur || 25), vitesse: +(arg.vitesse || 1), symbole: +(arg.symbole || 0.25)};
  const S = P2.nouvelle(L, reg, graine), mem = {niveau: NIVEAU};
  const dt = 1 / 60;
  let t = 0;
  while (S.phase !== 'fini' && t < 1500) { const e = globalThis.RobotP2(S, mem, dt); P2.pas(S, dt, e); t += dt; }
  return {t, S};
}

const res = [];
for (let i = 0; i < N; i++) {
  const {t, S} = partie(1000 + i * 77);
  res.push({t, fini: S.phase === 'fini', formes: S.stats.formes.map(x => x.toFixed(0)), morts: S.stats.morts, potions: S.stats.potions,
    coups: S.stats.coups, repare: Math.round(S.stats.reparesPV), codesFaux: S.stats.mauvaisCodes});
}
console.log(`façon ${FACON}, niveau ${NIVEAU}, Pisteur ${arg.pisteur || 25} s`);
res.forEach(r => console.log(`  ${r.fini ? 'fini' : 'PAS FINI'} en ${(r.t / 60).toFixed(1)} min | formes (s) ${r.formes.join(' / ')} | morts ${r.morts} | potions ${r.potions} | réparé ${r.repare} | coups ${JSON.stringify(r.coups)}`));
