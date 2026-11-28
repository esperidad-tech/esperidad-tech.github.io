# Combat du Barde en 3D (phase 1 de l'enquête 10, refaite en 3D)

**En ligne, hors du jeu** : https://claude.ai/artifact/1tBtSsyA66eRcizBJN1bae (version `1795881350-d5e4`, 28 novembre, vers 17 h 15).
Go de Romain (16 h 28, par écrit) : « Allez, vas-y, tu peux lancer tout le chantier. » Avant (à la voix) : la caméra sur son image du
temple, Grosbec devant la porte blanche, les portails rouges sur le parvis, Grosbec qui tend la main vers le portail, qui bat la mesure,
les coups reçus, les notes du luth comme projectiles, le bras levé du Barde au refrain.

## Ce que montre le 2ᵉ essai (démonstration : le Barde joue tout seul ; rien du vrai jeu n'est branché)

- **La salle** : le temple de Romain (`essai-3d/origine/salle-barde/temple-romain/`, voir son `LISEZMOI.md`). Debout (téléphone) :
  l'image debout. Plus large (tablette, couché, ordinateur) : la salle large, dont le milieu **est** l'image debout (recollée telle
  quelle, x = 1306, largeur 1210, toute la hauteur) : le combat reste au milieu, les côtés remplissent l'écran, rien ne bouge
  quand on tourne l'écran.
- **La caméra** (`outils/camera_temple.py`) : le point de fuite des dalles (122 traits trouvés sur la salle large, où l'on voit les
  deux bords du parvis) et la grille des dalles (cases carrées : colonnes tous les 0,0712, rangées tous les 1,17e-5 en 1/(v − v_h)) :
  f = 5856 px sur l'image debout (champ vertical 36,3°), pente 15,8°, lacet −1,3°, hauteur 9 m. Le Barde (1,5 m) en (1080, 3150)
  mesure 428 px. Le palier de la porte : 1,71 m (16 marches de 10,7 cm).
- **Les places** : le Barde en bas, au milieu, de dos. **Grosbec** (son modèle actuel, `essai-3d/site/armure.json` → `grosbec.json`,
  3,6 m, **sans y toucher** : une autre conversation le refait en pièces rigides) sur le palier, 1,3 m devant la porte blanche.
  **Quatre portails rouges** : deux « portes » (4,5 m devant le Barde, 2,4 m de côté) et deux « chutes » (2,4 m devant, 2,7 m de
  côté), comme les portes et les chutes du jeu en 2D, ramenées aux pas des golems 3D (un rôdeur avance de 0,29 m par temps, un
  colosse de 0,43 m tous les deux temps) : environ dix pas jusqu'au Barde, comme dans le jeu, sans que les pieds glissent.
- **Grosbec** : il bat la mesure (buste et tête sur chaque temps) ; un temps avant qu'un portail s'ouvre, **il tend le bras de ce
  côté** (la main gauche de l'écran pour le portail de gauche) ; **au refrain il subit** : les mains sur le casque, il recule, il
  chancelle (gestes faits par le code sur son squelette ; à refaire sur son nouveau modèle).
- **Les portails** : ils s'entrouvrent un temps avant, s'ouvrent sur le temps fort (un éclair, un son), un golem en sort (rouge
  sombre, il grandit et s'allume) ; parfois un deuxième, à côté, le temps d'après ; ils se referment deux temps plus tard ; au
  refrain, ils faiblissent. **Pas de portail pendant le refrain** (Romain : le refrain récompense).
- **Les golems** : ils marchent sur le temps (pieds posés sur les temps, comme au 1ᵉʳ essai), s'arrêtent sur un arc devant le Barde
  (les gros plus loin), frappent sur un temps (le Barde recule d'un pas, lueur rouge) ; le bélier fonce tête baissée les trois
  derniers mètres. Touchés : une lueur, le **coup reçu** ; à 0 pv (ceux du jeu : rôdeur 1, faucheur 2, porte-dalle 2, bélier 3,
  colosse 5) : **la mort**, puis ils s'enfoncent dans le sol en braises rouges.
- **Le Barde** : il tient le luth pour jouer (le luth et les mains de l'essai 3D : `guider`, `orienter`), gratte deux fois par temps,
  bat la mesure de la tête ; **la note part du luth** sur le temps, sa main droite se tend vers la cible (« et hop ») : la note verte
  de l'essai, sa portée qui ondule derrière, de petites notes ; elle frappe le golem le plus proche à portée (3,3 m). Il rate exprès
  un temps sur quatre (et 20 % des autres) pour qu'on voie les golems frapper.
- **Le refrain** : une entrée d'une mesure, puis 8 mesures de combat et **4 mesures de refrain**, en boucle (dans le vrai jeu, le
  refrain se gagne). Une onde dorée part du Barde ; **il lève le bras droit, le poing qui cogne sur chaque temps, et danse** ; ses
  notes sont dorées et frappent deux fois plus fort ; des accords (la, sol, fa, mi).
- **Les sons** (faits par la page) : la batterie, les pas (plus lourds pour les gros), la note (une corde pincée), le coup (métal),
  la mort (un éboulement), le portail (un souffle grave). Rien ne parle.

## Les mouvements des golems (Higgsfield, « 3d_rigging » + bibliothèque, 8 crédits chacun : 120 crédits)

| Golem | Coup reçu | Attaque | Mort |
|---|---|---|---|
| rôdeur | Hit_Reaction (178) | Weapon_Combo (199) | Knock_Down (187) |
| faucheur | Hit_Reaction_to_Waist (171) | Heavy_Hammer_Swing (128) | Shot_and_Fall_Backward (183) |
| porte-dalle | Hit_Reaction_1 (179) | Attack (4) | dying_backwards (189) |
| colosse | Gunshot_Reaction (177) | Charged_Ground_Slam (127) | Fall_Dead_from_Abdominal_Injury (188) |
| bélier | Hit_Reaction (178) | **charge** : Male_Head_Down_Charge (512) | Knock_Down_1 (190) |

Choisis sur les aperçus de la bibliothèque (planches d'images : `cdn.meshy.ai/.../preview/biped/<nom>.gif`). Recalés sur chaque
squelette (`essai-3d/outils/recaler.mjs`), gardés sans maillage (`outils.mjs anim`) : `essai-3d/origine/golems/glb/<nom>-<coup|attaque|charge|mort>.glb`.
La charge du bélier : on enlève l'avancée du bassin dans le film (c'est le jeu qui le déplace). **Sept des quinze demandes avaient
échoué** quand on donnait la hauteur du golem : refaites sans hauteur, elles passent (squelette de 1,70 m, `recaler.mjs` remet à
l'échelle) ; les échecs n'ont rien coûté. Les jobs : `claude/golems-elyra-higgsfield.md` (projet).

## Refaire la page

```
cd jeu/maquettes/essai-3d/outils && npm install
for n in rodeur faucheur porte-dalle colosse belier faux dalle; do node alleger.mjs ../origine/golems/glb/$n-base.glb /tmp/legers/$n.glb 512; done
../../combat-barde-3d/outils/construire.sh /tmp/legers
```
`construire.sh` refait `site/` : le moteur (`src/main.js` → `site/combat3d.js`), les deux images de la salle (debout 1440 × 2560,
large 2866 × 1612), les modèles et tous les mouvements en `.json` (la page Claude ne sert pas les `.glb`), le Barde de l'essai 3D,
Grosbec (`armure.json` de l'essai). 25 Mo en tout.

**Essais sans écran** (`outils/essais/`, servir `site/` sur le port 8811) : `film.js <nom> <largeur> <hauteur> <temps,temps…>` (des
photos à ces instants ; le temps avance à la main, `window.essai.avancer`), `gros-plan.js` (un rectangle de l'écran en grand),
`vrai.js` (le bouton ▶, 8 s en vrai temps, les erreurs). Le hasard est rejouable (graine 7) : les essais voient toujours la même partie.

## Pas fait, la suite

- **Brancher le vrai jeu du Barde** (`combat-barde/src/jeu.js`, façon de jouer gelée) : les boutons, les vagues, les ferveurs et le
  méga refrain gagné, le porte-dalle qui renvoie les notes, la repousse, le stop, la vague ; poser ses positions 2D sur le sol 3D.
- **Grosbec** : ses gestes sur son nouveau modèle (pièces rigides, l'autre conversation) ; sa voix (« Allez, allez ! »).
- Le tourbillon et le frondeur (sans squelette) : à animer par le code.
- Pas vérifié sur un vrai téléphone (25 Mo à charger ; 13 lampes).
