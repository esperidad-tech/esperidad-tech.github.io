#!/usr/bin/env python3
"""Calcule le niveau de chaque son pour qu'ils sonnent tous aussi fort sur une tablette.
Lit rendus/mesures-bruitages.json et rendus/mesures-musiques.json (rendus au niveau 1), écrit niveaux.json."""
import json, os
ICI = os.path.dirname(os.path.abspath(__file__))
b = json.load(open(os.path.join(ICI, 'rendus/mesures-bruitages.json')))
m = json.load(open(os.path.join(ICI, 'rendus/mesures-musiques.json')))
CIBLE_SFX, PIC_SFX, PIC_CHOC, CIBLE_CRIT = -15.0, 1.25, 1.7, -11.0   # bruitages : sonie momentanée maximale
CIBLE_MUS, PIC_MUS = -25.0, .8            # musiques : 90 % du temps sous cette sonie
CIBLE_SALLE = -28.0                       # le fond du donjon et chaque couleur de salle (ensemble ≈ -25)
CIBLE_ICONE = -26.0                       # le petit son quand on touche une icône : doux, on l'entend souvent
CIBLE_PAS = -27.0                         # les pas sur la carte : discrets, on les entend à chaque déplacement (Romain, 10 novembre)
CIBLE_FEU = -27.0                         # l'ambiance du feu de camp (en boucle, sous la musique du repos)
CHOCS = ('arc', 'chairF', 'bois', 'chairD', 'fuiteA', 'ratCritique',                  # des chocs très brefs : le compresseur les rattrape
         'flecheLourde', 'gardienPoing', 'gardienFin', 'bourbeSaut', 'portePierre', 'cuirCasque', 'bourbeLangue', 'roiAttaque', 'potColle', 'coffre')
COULEURS = ('donjon', 'puits', 'toiles', 'atelier', 'canaux', 'ossuaire')
import math, re
niv = {}
# 1) ce que chaque version peut atteindre sans dépasser son pic
atteint = {}
for k, r in b.items():
    plafond = PIC_CHOC if k.startswith(CHOCS) else PIC_SFX
    cible_k = CIBLE_CRIT if k.startswith('ratCritique') else (CIBLE_ICONE if k.startswith('icone') else (CIBLE_PAS if k.startswith('pasCouloir') else CIBLE_SFX))   # le critique : plus fort que tout le reste
    atteint[k] = min(cible_k, r['sonie'] + 20 * math.log10(plafond / r['pic']))
# 2) dans une même carte, toutes les versions au même niveau (sinon la plus forte paraît meilleure)
cartes = {}
for k in b: cartes.setdefault(re.sub(r'[A-D]$', '', k), []).append(k)
for c, ks in cartes.items():
    cible = max(min(atteint[k] for k in ks), min(atteint[k] for k in ks) if ks[0].startswith(('ratCritique', 'icone', 'pasCouloir')) else CIBLE_SFX - 6)
    for k in ks:
        r = b[k]; f = 10 ** ((min(cible, atteint[k]) - r['sonie']) / 20); niv[k] = f
        print('%-14s sonie %6.1f -> x%.2f  (%6.1f, pic %.2f)' % (k, r['sonie'], f, r['sonie'] + 20 * math.log10(f), r['pic'] * f))
for k, r in m.items():
    k = k[2:]
    cible = CIBLE_SALLE if re.sub(r'[A-C]$', '', k) in COULEURS else (CIBLE_FEU if k.startswith('feuCamp') else CIBLE_MUS)
    f = 10 ** ((cible - r['sonie90']) / 20)
    f = min(f, PIC_MUS / r['pic'])
    niv[k] = f
    print('%-14s sonie90 %6.1f -> x%.2f' % (k, r['sonie90'], f))
json.dump(niv, open(os.path.join(ICI, 'niveaux.json'), 'w'), indent=1)
