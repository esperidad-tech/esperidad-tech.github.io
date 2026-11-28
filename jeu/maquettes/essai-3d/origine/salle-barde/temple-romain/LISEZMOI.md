# La salle du Barde, version « temple de Romain » (28 novembre après-midi)

- `debout-9x16.jpg` — **la base** (2160 × 3840) : l'image de Romain (Higgsfield, job `769703f7-7bd0-449a-9e5e-207d691eb486`).
  Tout le reste se cale dessus, au pixel près.
- `large-romain-21x9.jpg` — l'image large de Romain (4384 × 1872, job `5e18b93a-e702-4770-a6ea-af52363c0863`, faite avant :
  l'image debout est son milieu, redessiné à peine).
- `large-16x9.jpg` — **la salle large du jeu** (3822 × 2150). L'image debout y est recollée **telle quelle**, réduite à 0,56 :
  **x = 1306, largeur 1210, toute la hauteur**. Les côtés viennent de l'image large de Romain, recalée (homographie puis flot
  optique près des coutures, fondu de 60 px dans le bord de l'image debout). Le haut des côtés (ciel de la grotte, cristaux)
  et un bout de sol en bas à droite manquaient : bouchés par Nano Banana 2.1 en mode masque (job
  `40e64923-0d9b-4450-845f-155c346a78a8`, 2 crédits), collés seulement dans les trous.

Les outils : `essai-3d/outils/salle-large/` — `caler_romain.py` (homographie), `assembler_large.py` (assemblage et coutures),
`boucher_trous.py` (collage du remplissage dans les trous). Écarté : l'agrandissement de l'image debout par Higgsfield
(job `538fe3a4-7bcd-493b-b74c-3f4b2af090ee`) : côtés inventés, moins beaux que ceux de Romain.
