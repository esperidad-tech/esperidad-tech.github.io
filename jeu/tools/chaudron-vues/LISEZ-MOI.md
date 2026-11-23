# Les outils de capture du chaudron (23 novembre)

Pour REGARDER le chaudron sans jouer une enquête (Playwright ; un seul à la fois). `<dist>` : le dossier construit, chemin complet.

- `python3 voir.py <dist> <préfixe> [tablette telephone ipad paysage se ordi] [stock='{"eau":3,…}'] [h=<chaleur>] [buches=<n>] [niveau=<n>]` : ouvre le chaudron de l'atelier (enquête 2, l'encre au niveau 1) et le photographie à chaque taille (`<préfixe>-<taille>-intro.png` : l'image d'explication ; `<préfixe>-<taille>.png` : le jeu).
- `python3 zones.py <dist>` : une planche des six zones de chaleur (`zones.png`).
- `python3 fins.py <dist> <préfixe> [tailles] [salle=1]` : les trois fins (explosion, gel, réussite) ; avec `salle=1`, le chaudron dans la salle des mini-jeux.
- `python3 atelier.py <dist> <préfixe> [tailles] [glisse=1] [bulles=1]` : l'atelier (le chaudron scellé dans le foyer) ; `glisse=1` essaie de le déplacer (il ne doit pas bouger) ; `bulles=1` ouvre ses bulles.

Les captures s'écrivent dans ce dossier (ne pas les enregistrer dans git). `BRUMEVAL_POLICES=<fichier.css>` : les vraies polices du jeu, si on les a sous la main (sans ça, les noms écrits à la main sont un peu plus larges qu'en vrai).
