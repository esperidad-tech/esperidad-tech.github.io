"""Banc d'essai automatique des mini-jeux Pisteur + Alchimiste.
Usage : python3 essai.py [jeu ...]  (par défaut : tous)
Pour chaque jeu, à 390x844 (téléphone) et 800x1280 (tablette) :
  - captures intro / en cours / résultat d'une partie GAGNÉE par un petit robot
    (niveau 1 au téléphone, niveau 3 à la tablette) ;
  - une partie PERDUE (robot maladroit ou qui ne fait rien) ;
  - aucune erreur console.
Puis une capture en paysage 1280x800, un test de nettoyage (arrêt en pleine partie
et pendant la démo : plus aucun son ensuite) et une planche récapitulative.
Les robots sont dans robots.py (ils lisent l'état du jeu via terrain.mjaEtat()).
"""
import sys, os, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from robots import ROBOTS
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'index.html') + '?plein'
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
JEUX = sys.argv[1:] or ['traces','poursuite','cachette','tir','rythme','bulles','melange','temperature','loupe']
MODS_GAGNE = {'cachette': {'aide':1}}
T_JEU = {'melange':1700, 'loupe':1300, 'cachette':2200, 'traces':6500, 'poursuite':4000}
NIV_PERD = {'traces':3, 'poursuite':3, 'cachette':6, 'tir':3, 'rythme':6, 'bulles':6, 'melange':6, 'temperature':6, 'loupe':6}

def lancer_robot(page, code, arg=None):
    page.evaluate("([code, arg]) => { window.robotFini = false; (eval('(' + code + ')'))(arg).then(() => window.robotFini = true, e => { console.error('robot', e); window.robotFini = true; }); }", [code, arg])

def attendre_resultat(page, limite=300):
    t0 = time.time()
    while time.time() - t0 < limite:
        if page.evaluate("!!document.querySelector('.mj-resultat')"): return True
        page.wait_for_timeout(200)
    return False

bilan = {}
with sync_playwright() as p:
    nav = p.chromium.launch()
    # 0) « Suivre la piste » : la piste à suivre est unique sur 200 cartes par niveau
    if 'traces' in JEUX:
        pg = nav.new_page(); pg.goto(URL); pg.wait_for_timeout(200)
        for n in [1, 3, 6, 9]:
            v = pg.evaluate("([n]) => MJ.TYPES.traces.verifier(n, 200)", [n])
            ok = v['pareilleCible'] == 0 and v['fourchePareille'] == 0 and v['eventailPareil'] == 0 and v['virageDansZone'] == 0
            bilan[f'traces-cartes@{n}'] = v
            print(f"traces cartes n={n} : {v['cartes']} cartes, {v['pistes']} pistes — pareille à la cible {v['pareilleCible']}, embranchement en double {v['fourchePareille']}, éventail en double {v['eventailPareil']}, virage dans un obstacle {v['virageDansZone']}", 'OK' if ok else '⚠ ÉCHEC', flush=True)
        pg.close()
    for jeu in JEUX:
        for (w, h) in [(390, 844), (800, 1280)]:
            ctx = nav.new_context(viewport={'width':w, 'height':h}, device_scale_factor=1, has_touch=True)
            page = ctx.new_page()
            erreurs = []
            page.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
            page.on('pageerror', lambda e: erreurs.append(str(e)))
            page.goto(URL); page.wait_for_timeout(300)
            # 1) partie gagnée
            niveau = 1 if w < 500 else 3
            page.evaluate("([t,n,m]) => window.lancerJeu(t, n, m)", [jeu, niveau, MODS_GAGNE.get(jeu, {})])
            page.wait_for_timeout(1500)
            page.screenshot(path=f'{CAP}/{jeu}-{w}-1intro.png')
            page.click('.mj-go')
            lancer_robot(page, ROBOTS[jeu]['gagne'])
            page.wait_for_timeout(T_JEU.get(jeu, 3200))
            page.screenshot(path=f'{CAP}/{jeu}-{w}-2jeu.png')
            ok = attendre_resultat(page)
            page.wait_for_timeout(700)
            page.screenshot(path=f'{CAP}/{jeu}-{w}-3resultat.png')
            gagne = page.evaluate("!!document.querySelector('.mj-resultat.ok')")
            if ok: page.click('.mj-continuer')
            page.wait_for_timeout(200)
            res1 = page.evaluate("window.dernierResultat")
            # 2) partie perdue
            page.evaluate("([t,n]) => window.lancerJeu(t, n, {})", [jeu, NIV_PERD[jeu]])
            page.wait_for_timeout(400)
            page.click('.mj-go')
            page.wait_for_timeout(200)
            lancer_robot(page, ROBOTS[jeu]['perd'])
            ok2 = attendre_resultat(page)
            page.wait_for_timeout(700)
            page.screenshot(path=f'{CAP}/{jeu}-{w}-4perdu.png')
            perdu = page.evaluate("!!document.querySelector('.mj-resultat.ko')")
            bilan[f'{jeu}@{w}'] = {'gagne': gagne, 'perdu': perdu, 'erreurs': erreurs[:5], 'res': res1}
            print(jeu, w, 'GAGNE' if gagne else 'pas gagné', '| PERDU' if perdu else '| pas perdu', erreurs[:3], flush=True)
            ctx.close()
    # 3) paysage + nettoyage
    ctx = nav.new_context(viewport={'width':1280, 'height':800}, has_touch=True)
    page = ctx.new_page(); erreurs = []; sons = []
    page.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else (sons.append(m.text) if '[son]' in m.text else None))
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.goto(URL); page.wait_for_timeout(300)
    for jeu in JEUX:
        page.evaluate("([t]) => window.lancerJeu(t, 3, {})", [jeu]); page.wait_for_timeout(900)
        page.click('.mj-go'); lancer_robot(page, ROBOTS[jeu]['gagne']); page.wait_for_timeout(2600)
        page.screenshot(path=f'{CAP}/{jeu}-1280-jeu.png')
        # arrêt en pleine partie : plus de boucle, plus de son
        page.evaluate("() => { window.lancerJeu('rythme', 1, {}); document.getElementById('banc').innerHTML = ''; }")
        page.wait_for_timeout(300); sons.clear(); page.wait_for_timeout(1500)
        if sons: print('  ⚠ sons après arrêt de', jeu, sons[:3])
    # arrêt pendant une partie (via arreter) : on vérifie que fin n'est jamais appelée
    page.evaluate("""() => { window.finsAppelees = 0; const el = document.getElementById('banc'); el.innerHTML = '';
      const z = document.createElement('div'); z.style.cssText = 'width:400px;height:600px;display:flex'; el.appendChild(z);
      window.parties = ['traces','poursuite','cachette','tir','rythme','bulles','melange','temperature','loupe'].map(t => { const d = document.createElement('div'); d.style.cssText='flex:1;display:flex;flex-direction:column'; z.appendChild(d); return MJ.TYPES[t].jouer(d, MJ.reglages(t, 3, {}), () => window.finsAppelees++); }); }""")
    page.wait_for_timeout(1500)
    page.evaluate("() => window.parties.forEach(p => p.arreter())")
    sons.clear(); page.wait_for_timeout(2500)
    fins = page.evaluate("window.finsAppelees")
    print('paysage + nettoyage : erreurs', erreurs[:3], '| fins après arreter', fins, '| sons après arreter', sons[:3])
    bilan['nettoyage'] = {'erreurs': erreurs[:5], 'fins': fins, 'sons': sons[:5]}
    ctx.close(); nav.close()
json.dump(bilan, open(os.path.join(CAP, 'bilan.json'), 'w'), indent=1, ensure_ascii=False)
