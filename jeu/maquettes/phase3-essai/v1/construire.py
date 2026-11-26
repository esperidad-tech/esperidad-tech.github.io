#!/usr/bin/env python3
# Fabrique phase3-essai.html (un seul fichier, rien d'autre à côté) : la page (src/page.html), le moteur (src/moteur.js), l'écran (src/ecran.js).
#   python3 construire.py   → phase3-essai.html
import os
ici = os.path.dirname(os.path.abspath(__file__))
lire = lambda f: open(os.path.join(ici, 'src', f), encoding='utf8').read()
s = lire('page.html')
for f in ['moteur.js', 'ecran.js']:
    s += '<script>/* ===== ' + f + ' ===== */\n' + lire(f) + '\n</script>\n'
s += '</body>\n</html>\n'
open(os.path.join(ici, 'phase3-essai.html'), 'w', encoding='utf8').write(s)
print(len(s) // 1024, 'Ko')
