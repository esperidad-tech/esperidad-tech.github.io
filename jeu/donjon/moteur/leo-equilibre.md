# Le combat de Léo — la difficulté, par la simulation

> Écrit par `node leo-sim.js 400 --md`, avec les règles de `src/leo-regles.js`. 400 parties par ligne. Ne pas corriger à la main.

Chaque phase est un combat à part : on y entre avec toute sa vie (310 points pour les trois héros), et une défaite ramène au début de la phase.

| Phase | Joueur | Phase gagnée | Durée | Vie restante | Héros au sol à la fin | Deux au sol ou plus | Chutes par essai | Quand il perd : au bout de | … et il restait à Léo |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Rapide | 100 % | 65 s | 247 | 0.1 | 0 % | 0.1 | — | — |
| 1 | Moyen | 96 % | 93 s | 238 | 0.1 | 1 % | 0.4 | 103 s | 947 PV |
| 1 | Lent | 64 % | 147 s | 184 | 0.3 | 2 % | 2.1 | 112 s | 1457 PV |
| 2 | Rapide | 100 % | 94 s | 260 | 0.0 | 0 % | 0.0 | 69 s | 1070 PV |
| 2 | Moyen | 0 % | — | — | — | — | 3.8 | 125 s | 2646 PV |
| 2 | Lent | 0 % | — | — | — | — | 3.4 | 35 s | 2881 PV |
| 3 | Rapide | 100 % | 105 s | 286 | 0.0 | 0 % | 0.0 | — | — |
| 3 | Moyen | 90 % | 109 s | 205 | 0.2 | 4 % | 0.9 | 84 s | 735 PV |
| 3 | Lent | 2 % | 114 s | 43 | 1.3 | 67 % | 3.8 | 45 s | 2218 PV |

- **Rapide** (il se décide en 0.3 s, 0.28 s par toucher, une étourderie sur 33) : les trois phases d'affilée sans tomber 100 % des fois ; essais par phase : 1.0, 1.0, 1.0.
- **Moyen** (il se décide en 0.65 s, 0.45 s par toucher, une étourderie sur 10) : les trois phases d'affilée sans tomber 0 % des fois ; essais par phase : 1.0, ∞, 1.1.
- **Lent** (il se décide en 1.1 s, 0.7 s par toucher, une étourderie sur 5) : les trois phases d'affilée sans tomber 0 % des fois ; essais par phase : 1.6, ∞, 44.4.
