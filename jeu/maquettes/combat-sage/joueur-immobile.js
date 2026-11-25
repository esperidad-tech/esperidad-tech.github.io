// Le joueur qui ne fait rien : il reste planté, ne grave pas, prend la première carte si une page lui tombe dessus.
// node joueur-immobile.js parties=6 x=450 y=470 graver=0      (graver = part du temps où le jeu reste en mode « graver », de 0 à 1)
// Ce qu'on veut : il doit PERDRE vite, quel que soit « graver ». En version 19, avec graver=1, il gagnait (voir le LISEZ-MOI) ; depuis la version 20, il perd. Pour revoir l'ancien défaut : logic=./logic19.js
const A = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')));
const G = require(require('path').resolve(A.logic || __dirname + '/logic20.js'));
const N = +(A.parties || 6), X = +(A.x || 450), Y = +(A.y || 470), p = +(A.graver || 0);
let wins = 0; const fin = [], combat = [], mini = [];
for (let g = 0; g < N; g++) {
  const s = G.newGame({ seed: 100 + g }); let m = 99, n = 0;
  while (!s.over && s.realT < 900) {
    s.sage.x = X; s.sage.y = Y;
    if (s.choice) G.choose(s, s.choice.cards[0]);
    G.step(s, 1 / 30, (n++ % 100) < p * 100); m = Math.min(m, s.protection);
  }
  if (s.over === 'win') wins++; fin.push(Math.round(s.realT)); combat.push(Math.round(s.t)); mini.push(m);
}
console.log(`immobile en (${X},${Y}), mode graver ${Math.round(p * 100)} % du temps → gagnées : ${wins} sur ${N}`);
console.log(`  chronomètre à la fin (s) : ${fin.join(' ')}\n  vrai temps de combat (s) : ${combat.join(' ')}\n  protection la plus basse : ${mini.join(' ')}`);
