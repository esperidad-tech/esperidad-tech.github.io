# Assemble la maquette jouable : pieges-src.html + le moteur des héros en volume + les modèles (salle, golems, Grosbec) + les sons → pieges-alchimiste.html
import os, sys
ici = os.path.dirname(os.path.abspath(__file__))
hv = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ici, '..', '..', 'heros-vues', 'src')
s = open(os.path.join(ici, 'pieges-src.html'), encoding='utf8').read()
scripts = ''
for f in ['hv-base', 'hv-tete', 'hv-cheveux', 'hv-corps', 'hv-pantin', 'hv-poses', 'hv-positions', 'hv-donjon', 'hv-alchimiste', 'hv-attente']:
    scripts += '<script>/* moteur des héros en volume (jeu/heros-vues/src/' + f + '.js) */\n' + open(os.path.join(hv, f + '.js'), encoding='utf8').read() + '\n</script>\n'
# (version 15) les modèles du combat du Barde (modeles/ : repris tels quels) : les outils de dessin, la grande salle, le bestiaire, Grosbec
# en volume ; puis les golems de ce combat. Le bestiaire est « ouvert » ici (ses outils de peinture servent aux huit modèles de plus).
def golems_ouverts(t):
    a, b = 'return { TYPES, PAL, peindre,', 'function sol(x, r) { //'
    assert t.count(a) == 1 and t.count(b) == 1, "modeles/golems.js a changé : revoir l'ouverture"
    t = t.replace(a, 'return { PEINTRES, O_: { plaque, roc, veines, oeil, dents, pointe, fourneau, membre, coude, patte, bras, sol, glace, allure, pattes, braise, BRONZE, FER, ROC, OS, OR, NOIR }, TYPES, PAL, peindre,')
    return t.replace(b, 'function sol(x, r) { if (sol.off) return; //')
mod = os.path.join(ici, 'modeles')
for f in ['outils', 'decor', 'golems', 'grosbec']:
    t = open(os.path.join(mod, f + '.js'), encoding='utf8').read()
    if f == 'golems':
        t = golems_ouverts(t) + '\n' + open(os.path.join(ici, 'golems-alchimiste.js'), encoding='utf8').read()
    scripts += '<script>/* modèles du combat du Barde (modeles/' + f + '.js) */\n' + t + '\n</script>\n'
# les sons : le moteur de l'Atelier des sons du donjon, puis les sons du combat
sons = sys.argv[2] if len(sys.argv) > 2 else os.path.join(hv, '..', '..', 'donjon', 'essai', 'sons')
for f in ['moteur', 'bruitages', 'musiques']:
    scripts += '<script>/* Atelier des sons (jeu/donjon/essai/sons/' + f + '.js) */\n' + open(os.path.join(sons, f + '.js'), encoding='utf8').read() + '\n</script>\n'
scripts += '<script>\n' + open(os.path.join(ici, 'sons-combat.js'), encoding='utf8').read() + '\n</script>\n'
s = s.replace('<!--SCRIPTS-->', scripts)
open(os.path.join(ici, 'pieges-alchimiste.html'), 'w', encoding='utf8').write(s)
print(len(s) // 1024, 'Ko')
# (26 novembre) la page du site, dans la salle des jeux : brumeval/combat-alchimiste.html de la branche main. Le canevas claude.ai
# ajoute lui-même le début de page (doctype, charset, viewport) et une petite remise à zéro ; ici, on les écrit (body sans marge,
# [hidden] qui cache vraiment : les voiles « règles » et « fin » en ont besoin).
site = ('<!doctype html>\n<html lang="fr">\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style>\n' + s)
open(os.path.join(ici, 'combat-alchimiste.html'), 'w', encoding='utf8').write(site)
print('combat-alchimiste.html (pour le site) :', len(site) // 1024, 'Ko')
