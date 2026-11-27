#!/usr/bin/env python3
# Fabrique combat-armure.html (un seul fichier) : la page + le moteur des héros en volume + l'armure de Grosbec (combat du Barde)
# + le réparateur (combat du Pisteur) + le moteur des sons + le décor rendu en volume + le jeu.   python3 construire.py
import os
ici = os.path.dirname(os.path.abspath(__file__))
hv = os.path.join(ici, '..', '..', 'heros-vues', 'src')
s = open(os.path.join(ici, 'src', 'page.html'), encoding='utf8').read()
sc = ''
for f in ['hv-base', 'hv-tete', 'hv-cheveux', 'hv-corps', 'hv-pantin', 'hv-poses', 'hv-positions', 'hv-donjon', 'hv-alchimiste', 'hv-sage']:
    sc += '<script>/* héros en volume : jeu/heros-vues/src/' + f + '.js */\n' + open(os.path.join(hv, f + '.js'), encoding='utf8').read() + '\n</script>\n'
def golems_ouverts(t):   # (comme combat-pisteur/construire.py)
    a, b = 'return { TYPES, PAL, peindre,', 'function sol(x, r) { //'
    assert t.count(a) == 1 and t.count(b) == 1, "modeles/golems.js a changé : revoir l'ouverture"
    t = t.replace(a, 'return { PEINTRES, O_: { plaque, roc, veines, oeil, dents, pointe, fourneau, membre, coude, patte, bras, sol, glace, allure, pattes, braise, BRONZE, FER, ROC, OS, OR, NOIR }, TYPES, PAL, peindre,')
    return t.replace(b, 'function sol(x, r) { if (sol.off) return; //')
mod = os.path.join(ici, 'src', 'modeles')
t = open(os.path.join(mod, 'outils.js'), encoding='utf8').read()
sc += '<script>/* outils de dessin (combat du Barde) */\n' + t + '\n</script>\n'
t = golems_ouverts(open(os.path.join(mod, 'golems.js'), encoding='utf8').read()) + '\n' + open(os.path.join(mod, 'golems-pisteur.js'), encoding='utf8').read()
sc += '<script>/* les golems du combat du Barde + le réparateur du combat du Pisteur */\n' + t + '\n</script>\n'
sc += '<script>/* Grosbec en armure (combat du Barde) */\n' + open(os.path.join(mod, 'grosbec.js'), encoding='utf8').read() + '\n</script>\n'
sc += '<script>/* Atelier des sons : jeu/donjon/essai/sons/moteur.js */\n' + open(os.path.join(ici, '..', '..', 'donjon', 'essai', 'sons', 'moteur.js'), encoding='utf8').read() + '\n</script>\n'
sc += '<script>' + open(os.path.join(ici, 'src', 'decor.js'), encoding='utf8').read() + '</script>\n'
sc += '<script>/* les règles */\n' + open(os.path.join(ici, 'src', 'regles.js'), encoding='utf8').read() + '\n</script>\n'
jeu = ''
for f in ['base', 'heros', 'golems-cuits', 'armure', 'vfx', 'son', 'dessin', 'ecrans']:
    jeu += '/* ===== ' + f + '.js ===== */\n' + open(os.path.join(ici, 'src', f + '.js'), encoding='utf8').read() + '\n'
s = s.replace('</body>', sc + '<script>{\n' + jeu + '\n}</script>\n</body>')
open(os.path.join(ici, 'combat-armure.html'), 'w', encoding='utf8').write(s)
print(len(s) // 1024, 'Ko')
