# Assemble la planche des personnages : personnages-src.html + le moteur des héros en volume + persos-combat.js
# → personnages-combat.html (un seul fichier, celui qui est publié en canevas). Lancer depuis ce dossier.
import os
ici = os.path.dirname(os.path.abspath(__file__))
hv = os.path.join(ici, '..', '..', 'heros-vues', 'src')
s = open(os.path.join(ici, 'personnages-src.html'), encoding='utf8').read()
scripts = ''
for f in ['hv-base.js', 'hv-tete.js', 'hv-cheveux.js', 'hv-corps.js', 'hv-pantin.js', 'hv-poses.js']:
    scripts += '<script>/* moteur des héros en volume (jeu/heros-vues/src/' + f + ') */\n' + open(os.path.join(hv, f), encoding='utf8').read() + '\n</script>\n'
scripts += '<script>\n' + open(os.path.join(ici, 'persos-combat.js'), encoding='utf8').read() + '\n</script>\n'
open(os.path.join(ici, 'personnages-combat.html'), 'w', encoding='utf8').write(s.replace('<!--SCRIPTS-->', scripts))
