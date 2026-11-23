#!/usr/bin/env python3
"""Fabrique la page d'essai en un seul fichier (les six scripts dedans) : python3 construire.py → sortie/pisteuse-se-tourne.html"""
import pathlib, re
ICI = pathlib.Path(__file__).parent
SRC = ['hv-base.js', 'hv-tete.js', 'hv-cheveux.js', 'hv-corps.js', 'hv-pantin.js', 'hv-poses.js']
page = (ICI / 'essai' / 'demo.html').read_text(encoding='utf-8')
js = '\n'.join((ICI / 'src' / f).read_text(encoding='utf-8') for f in SRC)
a, b = page.index('<!--SCRIPTS-->'), page.index('<!--/SCRIPTS-->') + len('<!--/SCRIPTS-->')
page = page[:a] + '<script>\n' + js + '\n</script>' + page[b:]
(ICI / 'sortie').mkdir(exist_ok=True)
(ICI / 'sortie' / 'pisteuse-se-tourne.html').write_text(page, encoding='utf-8')
(ICI / 'sortie' / 'heros-vues.js').write_text(js, encoding='utf-8')
print('ok', len(page), 'octets')
