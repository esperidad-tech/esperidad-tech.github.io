#!/usr/bin/env python3
"""Assemble la maquette en un seul fichier : phase2-devant.html (c'est aussi l'index.html de la page Claude)."""
import pathlib
ici = pathlib.Path(__file__).resolve().parent
src = ici / 'src'
page = (src / 'page.html').read_text()
js = '\n'.join((src / f).read_text() for f in ['regles.js', 'dessin.js', 'ecrans.js'])
html = page.rstrip() + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'
(ici / 'phase2-devant.html').write_text(html)
print('phase2-devant.html :', len(html) // 1024, 'Ko')
