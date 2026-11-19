/* ============ le Barde : rôle (19 novembre : seulement pour la fenêtre de sa tenue — pas de geste de combat) ============ */
ROLES.barde = {
  fab:barde,
  garde:{racine:{}, bassin:{y:6}, torse:3, tete:-4, pA:[100, 272], pB:[158, 272], mA:[176, 162], hA:6, mB:[132, 172], hB:10},
  gardeChoisi:{racine:{}, bassin:{y:2}, torse:0, tete:-8, pA:[104, 272], pB:[156, 272], mA:[182, 140], hA:-6, mB:[134, 160], hB:10},
  joie:{mA:[166, 32], hA:-20, mB:[96, 34], hB:-170, cB:-1},
  course:function(p, f){ p.brasA = -40 - 16 * Math.cos(2 * Math.PI * f); p.avantBrasA = -50; p.mainA = 40; },
  frein:function(p){ p.brasA = -96; p.avantBrasA = -10; p.mainA = 70; }
};
