"""Le mini-jeu des empreintes du jardin d'Iris (enquête 3, Bible §13.51), DANS le jeu : un robot suit les petites empreintes jusqu'au bout.
Vérifie : les arrivées de l'histoire (la rue des Lanternes pour la bonne piste, les plates-bandes pour les sabots d'Iris), le niveau 7,
la consigne du lieu (« les sabots d'Iris »), aucune erreur de page, la partie gagnée. Le même robot que tools/massif.py (enquête 1).
Captures dans jeu/test/jardin/ (départ, mélange des traces, arrivée, fin).
Usage : BRUMEVAL_DIST=<dossier construit> python3 tools/jardin.py   (NB=6 : plus de parties ; VUE=1180x820 : un autre écran)"""
import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'jardin'); os.makedirs(OUT, exist_ok=True)
echecs = []
VW, VH = [int(v) for v in os.environ.get('VUE', '400x860').split('x')]
SUF = '' if (VW, VH) == (400, 860) else f'-{VW}x{VH}'
with sync_playwright() as p:
    b = p.chromium.launch()
    for essai in range(int(os.environ.get('NB', '3'))):
        pg = b.new_page(viewport={'width': VW, 'height': VH}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + IDX); pg.wait_for_timeout(700)
        # (les paramètres sont lus dans le jeu lui-même : E.lieux.herboristerie.pisteur.points[jardin])
        pt = pg.evaluate("""() => { var pt = null;
          try{ pt = window.ENQUETES[3].lieux.herboristerie.pisteur.points.filter(function(x){ return x.id === 'jardin'; })[0]; }catch(e){}
          if(!pt) return null;
          var pl = document.getElementById('mj-plein'); pl.hidden = false; var prm = MJ.reglages('traces', pt.mjNiveauFixe, {}, {brut:true}); Object.assign(prm, pt.params);
          window.__prm = prm; window.__res = null; MJ.lancer(pl, 'traces', prm, function(r){ window.__res = r; }, {titre:pt.nom});
          return {niveau:pt.mjNiveauFixe, infini:!!pt.essaisInfinis, donne:pt.donne, moments:pt.moments, consigne:MJ.TYPES.traces.consigne(prm)}; }""")
        if not pt: echecs.append('le point « jardin » de l\'herboristerie n\'existe pas'); pg.close(); break
        if essai == 0:
            if pt['niveau'] != 7 or not pt['infini'] or pt['donne'] != 'info:pieds_enfant' or pt['moments'] != ['matin', 'apresmidi']: echecs.append(f'le point a changé : {pt}')
            if 'sabots d\'Iris' not in pt['consigne'] or 'bottes' in pt['consigne']: echecs.append(f'la consigne ne parle pas des sabots d\'Iris : {pt["consigne"]}')
        pg.wait_for_timeout(1200)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, f'regles{SUF}.png'))
        pg.locator('.mj-go').first.click(force=True); pg.wait_for_timeout(1300)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, f'depart{SUF}.png'))
        arr = pg.evaluate("""() => [].map.call(document.querySelectorAll('.mja-arrivee'), function(g){ return g.innerHTML.indexOf('#ffd27a') >= 0 && g.innerHTML.indexOf('#8c8aa0') >= 0 ? 'lanterne' : g.innerHTML.indexOf('#b4e69a') >= 0 ? 'potager' : 'autre'; })""")
        if arr[:2] != ['lanterne', 'potager']: echecs.append(f'arrivées inattendues : {arr}')
        if arr.count('lanterne') != 1: echecs.append(f'il faut une seule rue des Lanternes : {arr}')
        pg.wait_for_timeout(2000)
        vu, vuF = False, False
        for k in range(2400):
            r = pg.evaluate("""() => { var t = document.querySelector('.mja-terrain'); if(!t || !t.mjaEtat) return {fin:true};
              var E = t.mjaEtat(); if(E.phase === 'fin') return {fin:true}; var d = Math.min(E.pd + 34, E.L); t.mjaViserMonde(E.cible(d), d); return {pd:E.pd, L:E.L}; }""")
            if r.get('fin'): break
            if not vu and r.get('pd', 0) > 70 and essai == 0: pg.screenshot(path=os.path.join(OUT, f'melange{SUF}.png')); vu = True
            if not vuF and r.get('pd', 0) > r.get('L', 1e9) - 60 and essai < 2: pg.screenshot(path=os.path.join(OUT, f'arrivee-{essai + 1}{SUF}.png')); vuF = True
            pg.wait_for_timeout(60)
        pg.wait_for_timeout(700)
        if essai < 2: pg.screenshot(path=os.path.join(OUT, f'entree-{essai + 1}{SUF}.png'))
        pg.wait_for_timeout(2000)
        if essai == 0: pg.screenshot(path=os.path.join(OUT, f'fin{SUF}.png'))
        txt = pg.evaluate("() => document.getElementById('mj-plein').innerText")
        gagne = 'bonne piste jusqu' in txt
        if not gagne:
            echecs.append(f'partie {essai + 1} : pas gagnée en suivant les petites empreintes — {" ".join(txt.split())[:160]}')
            pg.screenshot(path=os.path.join(OUT, f'rate-{essai + 1}.png'))
        if errs: echecs.append(f'erreurs de page : {errs[:2]}')
        print(f'  partie {essai + 1} : arrivées {arr[:2]}, gagnée : {gagne}')
        pg.close()
    b.close()
print('ÉCHECS :', echecs)
raise SystemExit(1 if echecs else 0)
