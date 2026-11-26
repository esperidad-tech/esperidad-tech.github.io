# La page du combat du Sage pour la salle des jeux du site (brumeval/combat-sage.html de la branche main) :
# la même page que la maquette, plus un bouton gris « ← La salle des jeux » dans la pause et sur l'écran de fin,
# seulement quand on vient de la salle (?depuis=salle), comme les combats du Pisteur, du Barde et de l'Alchimiste.
# Usage : python3 salle_part.py <page de la maquette> <page pour le site>
import sys
html = open(sys.argv[1], encoding='utf-8').read()
def rep(a, b):
    global html
    assert html.count(a) == 1, (a[:70], html.count(a)); html = html.replace(a, b)
BTN = 'style="background:#3a4258;border-color:#6b7590;color:#fff"'
rep('<div class="row"><button class="b yellow" id="bResume">Reprendre</button></div>', f'<div class="row"><button class="b yellow" id="bResume">Reprendre</button><button class="b" id="bSalle" hidden {BTN}>← La salle des jeux</button></div>')
rep('<div class="row"><button class="b yellow" id="bAgain">Rejouer</button></div>', f'<div class="row"><button class="b yellow" id="bAgain">Rejouer</button><button class="b" id="bSalleFin" hidden {BTN}>← La salle des jeux</button></div>')
rep("$('bAgain').onclick = start;", "$('bAgain').onclick = start;\nif (new URLSearchParams(location.search).get('depuis') === 'salle') for (const id of ['bSalle', 'bSalleFin']) { $(id).hidden = false; $(id).onclick = () => { location.href = 'salle.html'; }; }")
open(sys.argv[2], 'w', encoding='utf-8').write(html)
print('page pour la salle des jeux :', sys.argv[2], round(len(html.encode('utf-8')) / 1024), 'Ko')
