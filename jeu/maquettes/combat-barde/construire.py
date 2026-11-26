#!/usr/bin/env python3
"""Assemble la maquette en un seul fichier : combat-barde.html"""
import pathlib
ici = pathlib.Path(__file__).resolve().parent
src = ici / 'src'
page = (src / 'page.html').read_text()
js = '\n'.join((src / f).read_text() for f in ['son.js', 'musique.js', 'outils.js', 'decor.js', 'golems.js', 'grosbec.js', 'heros-vues.js', 'barde.js', 'dessins.js', 'jeu.js'])
fin = page.rstrip()
assert fin.endswith('</div>')
html = fin + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'
(ici / 'combat-barde.html').write_text(html)
print('combat-barde.html :', len(html) // 1024, 'Ko')
