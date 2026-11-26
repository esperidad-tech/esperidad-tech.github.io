#!/usr/bin/env python3
# Fabrique combat-pisteur.html (un seul fichier) : la page + le moteur des héros en volume + les modèles du combat du Barde (golems)
# et le cuirassé de l'Alchimiste + le réparateur (modeles/golems-pisteur.js) + le jeu.   python3 construire.py [dossier de jeu/heros-vues/src]   → combat-pisteur.html
import os, sys
ici = os.path.dirname(os.path.abspath(__file__))
hv = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ici, '..', '..', 'heros-vues', 'src')
s = open(os.path.join(ici, 'src', 'page.html'), encoding='utf8').read()
sc = ''
for f in ['hv-base', 'hv-tete', 'hv-cheveux', 'hv-corps', 'hv-pantin', 'hv-poses', 'hv-positions', 'hv-donjon']:
    sc += '<script>/* héros en volume : jeu/heros-vues/src/' + f + '.js */\n' + open(os.path.join(hv, f + '.js'), encoding='utf8').read() + '\n</script>\n'
def golems_ouverts(t):
    a, b = 'return { TYPES, PAL, peindre,', 'function sol(x, r) { //'
    assert t.count(a) == 1 and t.count(b) == 1, "modeles/golems.js a changé : revoir l'ouverture"
    t = t.replace(a, 'return { PEINTRES, O_: { plaque, roc, veines, oeil, dents, pointe, fourneau, membre, coude, patte, bras, sol, glace, allure, pattes, braise, BRONZE, FER, ROC, OS, OR, NOIR }, TYPES, PAL, peindre,')
    return t.replace(b, 'function sol(x, r) { if (sol.off) return; //')
mod = os.path.join(ici, 'src', 'modeles')
for f in ['outils', 'golems']:           # (version 9 : plus de Grosbec dans cette salle, son modèle n'est plus embarqué)
    t = open(os.path.join(mod, f + '.js'), encoding='utf8').read()
    if f == 'golems':
        t = golems_ouverts(t) + '\n' + open(os.path.join(mod, 'golems-alchimiste.js'), encoding='utf8').read()
        t += '\n/* le réparateur (combat du Pisteur, version 8) */\n' + open(os.path.join(mod, 'golems-pisteur.js'), encoding='utf8').read()
    sc += '<script>/* modèles du combat du Barde : ' + f + '.js */\n' + t + '\n</script>\n'
# le moteur de l'Atelier des sons du jeu (version 10 : les sons et la musique du combat sont fabriqués avec lui, src/son.js)
sc += '<script>/* Atelier des sons : jeu/donjon/essai/sons/moteur.js */\n' + open(os.path.join(ici, '..', '..', 'donjon', 'essai', 'sons', 'moteur.js'), encoding='utf8').read() + '\n</script>\n'
jeu = ''
for f in ['base', 'son', 'monde', 'pisteur', 'golems', 'vagues', 'sprites', 'salle', 'dessin', 'ecrans']:
    jeu += '/* ===== ' + f + '.js ===== */\n' + open(os.path.join(ici, 'src', f + '.js'), encoding='utf8').read() + '\n'
open('/tmp/p5-jeu.js', 'w', encoding='utf8').write('{\n' + jeu + '\n}')
# le décor rendu en volume (decor3d/ ; src/decor.js est fabriqué par decor3d/paquet.py)
sc += '<script>' + open(os.path.join(ici, 'src', 'decor.js'), encoding='utf8').read() + '</script>\n'
s += sc + '<script>{\n' + jeu + '\n}</script>\n</body>\n</html>\n'
open(os.path.join(ici, 'combat-pisteur.html'), 'w', encoding='utf8').write(s)
print(len(s) // 1024, 'Ko')
