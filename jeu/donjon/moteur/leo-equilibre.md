# Le combat de Léo — la difficulté, par la simulation

> Écrit par `node leo-sim.js 400 --md`, avec les règles de `src/leo-regles.js`. 400 parties par ligne. Ne pas corriger à la main.

Chaque phase est un combat à part : on y entre avec toute sa vie (310 points pour les trois héros), et une défaite ramène au début de la phase.

| Phase | Joueur | Phase gagnée | Durée | Vie restante | Héros au sol à la fin | Deux au sol ou plus | Chutes par essai | Quand il perd : au bout de | … et il restait à Léo |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Rapide | 95 % | 84 s | 228 | 0.2 | 1 % | 0.6 | 90 s | 1030 PV |
| 1 | Moyen | 7 % | 173 s | 123 | 0.6 | 8 % | 4.4 | 92 s | 2101 PV |
| 1 | Lent | 0 % | — | — | — | — | 4.0 | 54 s | 3527 PV |
| 2 | Rapide | 62 % | 132 s | 247 | 0.0 | 0 % | 1.7 | 218 s | 1301 PV |
| 2 | Moyen | 0 % | — | — | — | — | 3.5 | 31 s | 2945 PV |
| 2 | Lent | 0 % | — | — | — | — | 3.1 | 23 s | 2965 PV |
| 3 | Rapide | 39 % | 108 s | 132 | 0.6 | 15 % | 3.6 | 73 s | 1041 PV |
| 3 | Moyen | 0 % | — | — | — | — | 3.8 | 32 s | 2503 PV |
| 3 | Lent | 0 % | — | — | — | — | 3.2 | 25 s | 2834 PV |

- **Rapide** (il se décide en 0.3 s, 0.28 s par toucher, une étourderie sur 33) : les trois phases d'affilée sans tomber 23 % des fois ; essais par phase : 1.1, 1.6, 2.6.
- **Moyen** (il se décide en 0.65 s, 0.45 s par toucher, une étourderie sur 10) : les trois phases d'affilée sans tomber 0 % des fois ; essais par phase : 15.4, ∞, ∞.
- **Lent** (il se décide en 1.1 s, 0.7 s par toucher, une étourderie sur 5) : les trois phases d'affilée sans tomber 0 % des fois ; essais par phase : ∞, ∞, ∞.
