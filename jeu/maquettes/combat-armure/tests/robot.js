/* Un robot joue la phase 2 (version 2) en entier, dans node : node tests/robot.js [niveau=bon|moyen] [parties=4] [pisteur=30] [vie=1000] [saut=1.5]
   Il sert à vérifier que tout s'enchaîne et à mesurer la durée de chaque tiers. */
'use strict';
const path = require('path');
require(path.join(__dirname, '..', 'src', 'regles.js'));
require(path.join(__dirname, 'robot-coeur.js'));
const P2 = globalThis.P2;
const arg = {}; process.argv.slice(2).forEach(a => { const [k, v] = a.split('='); arg[k] = v; });
const N = +(arg.parties || 4), niveau = arg.niveau || 'bon';
function partie(graine) {
  const S = P2.nouvelle({pisteur: +(arg.pisteur || 30), vie: +(arg.vie || 1000), saut: +(arg.saut || 1.5)}, graine), mem = {niveau};
  const dt = 1 / 60; let t = 0;
  while (S.phase !== 'fini' && t < 3600) { const e = globalThis.RobotP2(S, mem, dt); P2.pas(S, dt, e); t += dt; }
  return {t, S};
}
console.log(`niveau ${niveau}, Pisteur ${arg.pisteur || 30} s, vie ${arg.vie || 1000} par tiers`);
for (let i = 0; i < N; i++) {
  const {t, S} = partie(500 + i * 91), st = S.stats;
  const tiers = st.tiers.map(x => `${Math.round(x.symbole)}+${Math.round((x.code || 0) - x.symbole)}`).join(' / ');
  const coups = Object.entries(st.coups).map(([k, v]) => k + ' ' + Math.round(v)).join(', ');
  console.log(`  ${S.phase === 'fini' ? 'fini' : 'PAS FINI (tiers ' + S.tiers + ', ' + S.phase + ', vie ' + Math.round(S.vie) + ')'} en ${(t / 60).toFixed(1)} min | tiers (combat+bulle, s) ${tiers} | morts ${st.morts} | soins ${st.soins} | glaces ${st.glaces} feux ${st.feux} coupés ${st.coupes} | orbes ${st.orbesBonnes}/${st.orbesRatees} | contres ${st.contres} | réparé ${st.reparesPV}`);
  console.log(`     coups reçus : ${coups}`);
}
