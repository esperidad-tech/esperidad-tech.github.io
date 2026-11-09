#!/usr/bin/env python3
"""Assemble la page d'écoute autonome essai/sons-essai.html à partir de essai/sons/.
Les niveaux de chaque son (pour que tout sonne aussi fort) viennent de sons/niveaux.json,
calculé par sons/verifier.py --niveaux."""
import os, json
ICI = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(ICI, 'sons')
lire = lambda f: open(os.path.join(S, f), encoding='utf-8').read()
html = lire('page.html')
niveaux = {}
p = os.path.join(S, 'niveaux.json')
if os.path.exists(p):
    niveaux = json.load(open(p))
js = 'window.NIVEAUX = ' + json.dumps({k: round(v, 3) for k, v in sorted(niveaux.items())}, separators=(',', ':')) + ';\n'
js += '\n'.join(lire(f) for f in ['moteur.js', 'bruitages.js', 'musiques.js', 'banc.js', 'page.js'])
assert '</script' not in js.lower()
html = html.replace('/*CSS*/', lire('page.css')).replace('/*JS*/', js)
sortie = os.path.join(ICI, 'sons-essai.html')
open(sortie, 'w', encoding='utf-8').write(html)
print(sortie, os.path.getsize(sortie), 'octets', len(niveaux), 'niveaux')
