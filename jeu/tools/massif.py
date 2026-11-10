"""Le mini-jeu de la piste du massif (enquête 1, Bible §12.53), DANS le jeu : un robot suit les petites traces jusqu'au bout.
Vérifie : les arrivées de l'histoire (la gouttière pour la bonne piste, le potager pour les bottes), aucune erreur de page, la partie gagnée.
Captures dans jeu/test/massif/ (départ, mélange des traces, fin).
Usage : BRUMEVAL_DIST=<dossier construit> python3 tools/massif.py"""
import os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'massif'); os.makedirs(OUT, exist_ok=True)
# (les paramètres du massif sont lus dans le jeu lui-même : E.lieux.mairie.pisteur.points[massif].params)
echecs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for essai in range(int(os.environ.get("NB", "3"))):
        pg = b.new_page(viewport={'width': 400, 'height': 860}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + IDX); pg.wait_for_timeout(700)
        pg.evaluate("""() => { var pt = null;
          try{ pt = window.ENQUETES[1].lieux.mairie.pisteur.points.filter(function(x){ return x.id === 'massif'; })[0]; }catch(e){}
          var pl = document.getElementById('mj-plein'); pl.hidden = false; var prm = MJ.reglages('traces', 1, {}, {brut:true}); Object.assign(prm, pt ? pt.params : {});
          window.__prm = prm; window.__res = null; MJ.lancer(pl, 'traces', prm, function(r){ window.__res = r; }, {titre:'Le massif de fleurs'}); }""")
        prm = pg.evaluate('() => window.__prm')
        if not prm.get('compagnon'): echecs.append('les paramètres du massif ne sont pas trouvés (compagnon absent)')
        pg.wait_for_timeout(1200); pg.locator('.mj-go').first.click(force=True); pg.wait_for_timeout(1300)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, 'depart.png'))
        arr = pg.evaluate("""() => [].map.call(document.querySelectorAll('.mja-arrivee'), function(g){ return g.innerHTML.indexOf('#9aa3b5') >= 0 ? 'gouttiere' : g.innerHTML.indexOf('#b4e69a') >= 0 ? 'potager' : 'autre'; })""")
        if arr[:2] != ['gouttiere', 'potager']: echecs.append(f'arrivées inattendues : {arr}')
        pg.wait_for_timeout(2000)
        gagne, vu = None, False
        for k in range(1200):
            r = pg.evaluate("""() => { var t = document.querySelector('.mja-terrain'); var bravo = document.querySelector('.mj-resultat, .mj-fin'); if(!t || !t.mjaEtat) return {fin:true};
              var E = t.mjaEtat(); if(E.phase === 'fin') return {fin:true}; var d = Math.min(E.pd + 34, E.L); t.mjaViserMonde(E.cible(d), d); return {pd:E.pd}; }""")
            if r.get('fin'): break
            if not vu and r.get('pd', 0) > 70 and essai == 0: pg.screenshot(path=os.path.join(OUT, 'melange.png')); vu = True
            pg.wait_for_timeout(60)
        pg.wait_for_timeout(1800)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, 'fin.png'))
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
