# Assemble la maquette jouable : pieges-src.html + le moteur des héros en volume + persos-combat.js → pieges-alchimiste.html
import os, sys
ici = os.path.dirname(os.path.abspath(__file__))
hv = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ici, '..', '..', 'heros-vues', 'src')
s = open(os.path.join(ici, 'pieges-src.html'), encoding='utf8').read()
scripts = ''
for f in ['hv-base', 'hv-tete', 'hv-cheveux', 'hv-corps', 'hv-pantin', 'hv-poses', 'hv-positions', 'hv-donjon', 'hv-alchimiste', 'hv-attente']:
    scripts += '<script>/* moteur des héros en volume (jeu/heros-vues/src/' + f + '.js) */\n' + open(os.path.join(hv, f + '.js'), encoding='utf8').read() + '\n</script>\n'
scripts += '<script>\n' + open(os.path.join(ici, 'persos-combat.js'), encoding='utf8').read() + '\n</script>\n'
# les sons : le moteur de l'Atelier des sons du donjon, puis les sons du combat
sons = sys.argv[2] if len(sys.argv) > 2 else os.path.join(hv, '..', '..', 'donjon', 'essai', 'sons')
for f in ['moteur', 'bruitages', 'musiques']:
    scripts += '<script>/* Atelier des sons (jeu/donjon/essai/sons/' + f + '.js) */\n' + open(os.path.join(sons, f + '.js'), encoding='utf8').read() + '\n</script>\n'
scripts += '<script>\n' + open(os.path.join(ici, 'sons-combat.js'), encoding='utf8').read() + '\n</script>\n'
s = s.replace('<!--SCRIPTS-->', scripts)
open(os.path.join(ici, 'pieges-alchimiste.html'), 'w', encoding='utf8').write(s)
print(len(s) // 1024, 'Ko')
