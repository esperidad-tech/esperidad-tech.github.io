#!/usr/bin/env python3
"""L'essai de la Pisteuse en volume DANS LE DONJON (Romain, 23 novembre, 18 h 51).

    python3 jeu/donjon/moteur/construire.py            (d'abord : le donjon tel qu'il est)
    python3 jeu/heros-vues/donjon/construire-essai.py  → jeu/heros-vues/sortie/donjon-essai/index.html

Le donjon n'est pas touché : on copie sa construction (jeu/donjon/moteur/sortie/) et on glisse en tête de la page les héros en
volume (src/*.js) et l'adaptateur (donjon/hv-adaptateur.js), qui remplace le Pisteur par la Pisteuse en volume.
Dans la copie seulement, deux nombres du combat sont recalés sur ses gestes (pour que les sons tombent juste) :
le lâcher de la flèche (1,38 s au lieu de 1,32) et le coup de dague (0,54 s au lieu de 0,70).
Pour voir un combat : index.html?combat=rats&nouveau=1 (avec &vitesse=3 : plus vite)."""
import pathlib, shutil

ICI = pathlib.Path(__file__).resolve().parent
HV = ICI.parent
DONJON = HV.parent / 'donjon' / 'moteur' / 'sortie'
SORTIE = HV / 'sortie' / 'donjon-essai'
SRC = ['hv-base.js', 'hv-tete.js', 'hv-cheveux.js', 'hv-corps.js', 'hv-pantin.js', 'hv-poses.js', 'hv-positions.js', 'hv-donjon.js']

if not (DONJON / 'index.html').exists():
    raise SystemExit('Le donjon n\'est pas construit : python3 jeu/donjon/moteur/construire.py')
# (on vide le dossier sans l'enlever : une page servie depuis lui — filmer-essai.py — continue de marcher)
SORTIE.mkdir(parents=True, exist_ok=True)
for f in SORTIE.iterdir():
    shutil.rmtree(f) if f.is_dir() else f.unlink()
shutil.copytree(DONJON, SORTIE, dirs_exist_ok=True)

page = (SORTIE / 'index.html').read_text(encoding='utf-8')
js = '\n'.join((HV / 'src' / f).read_text(encoding='utf-8') for f in SRC)
js += '\n' + (ICI / 'hv-adaptateur.js').read_text(encoding='utf-8')
# (les deux nombres du combat, dans la copie seulement)
AVANT, APRES = 'var LACHER = 1.32, LAME = .70;', 'var LACHER = 1.38, LAME = .54;'
assert page.count(AVANT) == 1, 'le combat a changé : retrouver LACHER et LAME dans combat.js'
page = page.replace(AVANT, APRES)
# (en tête de page : avant tous les scripts du donjon)
i = page.index('<head>') + len('<head>')
page = page[:i] + '\n<script>/* LES HÉROS EN VOLUME (essai) */\n' + js.replace('</script', '<\\/script') + '\n</script>' + page[i:]
(SORTIE / 'index.html').write_text(page, encoding='utf-8')
for f in ('alchimiste.html', 'sage.html', 'tenue.html'):
    if (SORTIE / f).exists():
        (SORTIE / f).unlink()
print('ok', SORTIE / 'index.html', len(page) // 1024, 'Ko')
