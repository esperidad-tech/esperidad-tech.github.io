"""Le tutoriel et l'atelier : avec un Atelier.guider de remplacement (même contrat que celui de src/atelier.js),
on vérifie les cibles données à l'atelier, dans l'ordre de la trame, et l'enchaînement après 'atelier:guide-fait'.
Usage : BRUMEVAL_DIST=/chemin python3 tools/tuto-atelier.py   → « ÉCHECS : [] »"""
import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
echecs, err = [], []
def verif(ok, msg):
    print(('  OK  ' if ok else '  ✗✗ ') + msg, flush=True)
    if not ok: echecs.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844}); pg.set_default_timeout(30000)
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(URL); pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]')
    pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]'); pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.evaluate("""() => { window.__g = []; var cur = null; Atelier.guider = function(c){ cur = c; if(window.__g[window.__g.length - 1] !== c) window.__g.push(c); return true; }; Atelier.guidage = function(){ return cur; };
      window.__fait = function(c){ cur = null; document.dispatchEvent(new CustomEvent('atelier:guide-fait', {detail:{cible:c}})); }; M.render(); }""")
    def dernier(): pg.wait_for_timeout(600); return pg.evaluate('() => window.__g[window.__g.length - 1]')
    verif(dernier() == 'carton', 'au début : l\'atelier entoure un carton')
    pg.evaluate("() => { M.majMission(); M.P().mission.coches[0] = 1; M.sauver(); M.render(); }")
    verif(dernier() is None, 'atelier installé : l\'étape suivante est sur la carte, l\'atelier arrête son guidage')
    pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); M.A.lieu({dataset:{id:'lisiere'}}); M.A.cueillir({dataset:{id:'lisiere'}}); M.UI.modal = null; M.P().onglet = 'role'; M.render(); }")
    verif(dernier() == 'cueillette', 'baies cueillies, de retour dans l\'atelier : les ingrédients devant la porte')
    pg.evaluate("() => window.__fait('cueillette')"); verif(dernier() == 'rangement', '… puis le rangement')
    pg.evaluate("() => { M.S.atelier.panier = {}; window.__fait('rangement'); }"); verif(dernier() == 'grimoire', 'tout rangé : le grimoire')
    pg.evaluate("() => window.__fait('grimoire')"); verif(dernier() == 'chaudron', 'grimoire lu : le chaudron')
    pg.evaluate("() => { M.S.potions.revelatrice = 1; M.P().actions--; M.sauver(); window.__fait('chaudron'); M.render(); }"); verif(dernier() == 'potion', 'l\'encre prête : le flacon devant la porte')
    pg.evaluate("() => { M.A['donner-potion']({dataset:{id:'revelatrice'}}); M.A['potion-donnee']({dataset:{id:'revelatrice'}}); }")
    verif(dernier() is None and pg.evaluate('() => M.tutoGuide().etat') == 'attend', 'encre donnée : plus de guidage dans l\'atelier, on attend le fil du Pisteur')
    pg.evaluate("() => { M.P().recus['obj:fil'] = true; M.sauver(); M.render(); }"); verif(dernier() == 'paillasse', 'le fil reçu : la table d\'analyse')
    pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }"); verif(dernier() is None, 'sur un autre onglet : l\'atelier arrête son guidage')
    print('ÉCHECS :', echecs); print('ERREURS :', err)
    b.close()
