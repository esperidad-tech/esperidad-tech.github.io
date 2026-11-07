# Les outils de la page « La lettre d'Odette » (enquête 3)

Dézipper dans le dossier de travail, puis lancer les commandes depuis ce dossier (voir `PASSATION-E3.md`, « Régénérer la page »). Python 3 avec le module `markdown`, Node et Playwright (préinstallés dans les sessions).

| Fichier | Ce qu'il fait |
| --- | --- |
| `page-gen/avant.html` | La page du Barde d'origine (le matin écrit à la main, avec les données du matin : villageois, Fortuné, écoutes du matin, objets, talents). On repart toujours d'une copie de ce fichier. |
| `page-gen/decode.py` | Décode l'export markdown du document (le résultat de l'outil d'export est en base64). |
| `page-gen/gen.py` | Lit l'export du document et fabrique `gen-data.js` : les villageois de l'après-midi, les écoutes de l'après-midi, les occupés, la nuit, la trame. |
| `page-gen/patch.py` | Applique ces données à la page du Barde : onglets Trame / Matin / Après-midi / Nuit, corrections de textes du matin. |
| `page-gen/merge.py` | Réunit la page du Barde et la page des trois autres rôles en une seule page à onglets. |
| `page-gen/check-fusion.js` | Test rapide : chaque onglet s'affiche seul, pas d'erreur, pas de défilement de côté à 390 px. |
| `roles/roles-enquete3.html` | La page des trois autres rôles : les actions (`ACTIONS`), les codes du Barde pour les schémas (`BARDE`), les schémas (`CHAINES`). C'est là qu'on modifie le Pisteur, l'Alchimiste et le Sage (à la main). |
| `roles-en-md.js` | Sort la page des rôles en markdown (`node roles-en-md.js $PWD/roles/roles-enquete3.html sortie.md`). |
| `duree/extraire.js`, `duree/calcul.py` | Le calcul de la durée de l'enquête (lecture, mini-jeux, choix, par rôle et par moment). Les hypothèses sont en tête de `calcul.py`. |
| `export/doc.md` | Le dernier export du document (6 novembre, 2 h). |

Attention : le matin de l'onglet Barde vient de `avant.html`, pas du document. Une correction des dialogues du matin se fait dans le document ET dans `avant.html` (ou par un remplacement ajouté à `patch.py`, comme ceux du 6 novembre).
