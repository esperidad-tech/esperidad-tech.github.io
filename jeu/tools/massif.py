"""Le mini-jeu de la piste du massif (enquête 1, Bible §12.53), DANS le jeu : un robot suit les petites traces jusqu'au bout.
Vérifie : les arrivées de l'histoire (l'entrée de la forêt pour la bonne piste, le potager pour les bottes), qu'aucune autre piste
n'entre dans la forêt (toutes les autres arrivées sont en ville, avant la lisière), aucune erreur de page, la partie gagnée.
Captures dans jeu/test/massif/ (départ, mélange des traces, approche de la forêt, arrivée, fin).
Usage : BRUMEVAL_DIST=<dossier construit> python3 tools/massif.py   (NB=6 : plus de parties ; VUE=1180x820 : un autre écran ; NIV=10 : un autre niveau)"""
import os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'massif'); os.makedirs(OUT, exist_ok=True)
# (les paramètres du massif sont lus dans le jeu lui-même : E.lieux.mairie.pisteur.points[massif].params)
echecs = []
VW, VH = [int(v) for v in os.environ.get('VUE', '400x860').split('x')]
NIV = int(os.environ.get('NIV', '1'))
SUF = '' if (VW, VH, NIV) == (400, 860, 1) else f'-{VW}x{VH}-n{NIV}'
with sync_playwright() as p:
    b = p.chromium.launch()
    for essai in range(int(os.environ.get("NB", "3"))):
        pg = b.new_page(viewport={'width': VW, 'height': VH}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + IDX); pg.wait_for_timeout(700)
        pg.evaluate("""() => { var pt = null;
          try{ pt = window.ENQUETES[1].lieux.mairie.pisteur.points.filter(function(x){ return x.id === 'massif'; })[0]; }catch(e){}
          var pl = document.getElementById('mj-plein'); pl.hidden = false; var prm = MJ.reglages('traces', NIV, {}, {brut:true}); Object.assign(prm, pt ? pt.params : {});
          window.__prm = prm; window.__res = null; MJ.lancer(pl, 'traces', prm, function(r){ window.__res = r; }, {titre:'Le massif de fleurs'}); }""".replace('NIV', str(NIV)))
        prm = pg.evaluate('() => window.__prm')
        if not prm.get('compagnon'): echecs.append('les paramètres du massif ne sont pas trouvés (compagnon absent)')
        pg.wait_for_timeout(1200); pg.locator('.mj-go').first.click(force=True); pg.wait_for_timeout(1300)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, f'depart{SUF}.png'))
        arr = pg.evaluate("""() => [].map.call(document.querySelectorAll('.mja-arrivee'), function(g){ return g.innerHTML.indexOf('#12241a') >= 0 ? 'foret' : g.innerHTML.indexOf('#b4e69a') >= 0 ? 'potager' : 'autre'; })""")
        if arr[:2] != ['foret', 'potager']: echecs.append(f'arrivées inattendues : {arr}')
        if arr.count('foret') != 1: echecs.append(f'il faut une seule entrée de forêt : {arr}')
        # aucune autre piste n'entre dans la forêt : toutes les autres arrivées sont en ville, au moins 150 avant la bonne
        ds = pg.evaluate("""() => { var L = document.querySelector('.mja-terrain').mjaEtat().L; return {L:L, d:[].map.call(document.querySelectorAll('.mja-arrivee'), function(g){ return -parseFloat(g.getAttribute('transform').split(',')[1]); })}; }""")
        loin = [round(d) for d in ds['d'][1:] if d > ds['L'] - 149]
        if abs(ds['d'][0] - ds['L']) > 1 or loin: echecs.append(f'partie {essai + 1} : une arrivée dans la forêt ou trop près (L = {round(ds["L"])}) : {loin}')
        pg.wait_for_timeout(2000)
        gagne, vu, vuA, vuF = None, False, False, False
        for k in range(1600):
            r = pg.evaluate("""() => { var t = document.querySelector('.mja-terrain'); var bravo = document.querySelector('.mj-resultat, .mj-fin'); if(!t || !t.mjaEtat) return {fin:true};
              var E = t.mjaEtat(); if(E.phase === 'fin') return {fin:true}; var d = Math.min(E.pd + 34, E.L); t.mjaViserMonde(E.cible(d), d); return {pd:E.pd, L:E.L}; }""")
            if r.get('fin'): break
            if not vu and r.get('pd', 0) > 70 and essai == 0: pg.screenshot(path=os.path.join(OUT, f'melange{SUF}.png')); vu = True
            if not vuA and r.get('pd', 0) > r.get('L', 1e9) - 300 and essai < 2: pg.screenshot(path=os.path.join(OUT, f'approche-{essai + 1}{SUF}.png')); vuA = True
            if not vuF and r.get('pd', 0) > r.get('L', 1e9) - 45 and essai < 2: pg.screenshot(path=os.path.join(OUT, f'arrivee-{essai + 1}{SUF}.png')); vuF = True
            pg.wait_for_timeout(60)
        if essai < 2: pg.wait_for_timeout(1700); pg.screenshot(path=os.path.join(OUT, f'entree-{essai + 1}{SUF}.png'))   # la vue est remontée : on voit le début de la forêt
        pg.wait_for_timeout(1800 if essai < 2 else 3500)   # (l'écran de résultat arrive 2,7 s après l'entrée dans la forêt)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, f'fin{SUF}.png'))
        txt = pg.evaluate("() => document.getElementById('mj-plein').innerText")
        gagne = 'bonne piste jusqu' in txt   # (le mot de victoire change : Bravo, Superbe, Réussi…)
        if not gagne:
            echecs.append(f'partie {essai + 1} : pas gagnée en suivant les petites traces — {" ".join(txt.split())[:160]}')
            pg.screenshot(path=os.path.join(OUT, f'rate-{essai + 1}.png'))
        if errs: echecs.append(f'erreurs de page : {errs[:2]}')
        print(f'  partie {essai + 1} : arrivées {arr[:2]}, gagnée : {gagne}')
        pg.close()
    b.close()
print('ÉCHECS :', echecs)
