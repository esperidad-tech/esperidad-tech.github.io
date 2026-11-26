#!/usr/bin/env python3
# Fabrique phase3.html (un seul fichier) : la page (src/page.html), les règles (src/regles.js), le pilote des essais (src/pilote.js),
# le dessin (src/dessin.js), les écrans (src/ecrans.js).   python3 construire.py → phase3.html
# (La version 1, rangée dans v1/, a son propre construire.py.)
import os
ici = os.path.dirname(os.path.abspath(__file__))
lire = lambda f: open(os.path.join(ici, 'src', f), encoding='utf8').read()
s = lire('page.html')
for f in ['regles.js', 'pilote.js', 'dessin.js', 'ecrans.js']:
    s += '<script>/* ===== ' + f + ' ===== */\n' + lire(f) + '\n</script>\n'
s += '</body>\n</html>\n'
open(os.path.join(ici, 'phase3.html'), 'w', encoding='utf8').write(s)
print(len(s) // 1024, 'Ko')
