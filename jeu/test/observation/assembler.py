"""Assemble src/mj-observation.js depuis test/observation/parts/*.js (ordre alphabétique)."""
import os, glob
ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.abspath(os.path.join(ICI, '..', '..', 'src', 'mj-observation.js'))
morceaux = sorted(glob.glob(os.path.join(ICI, 'parts', '*.js')))
with open(SRC, 'w', encoding='utf-8') as f:
    f.write('\n'.join(open(m, encoding='utf-8').read().rstrip() + '\n' for m in morceaux))
print('src/mj-observation.js', sum(1 for _ in open(SRC, encoding='utf-8')), 'lignes')
