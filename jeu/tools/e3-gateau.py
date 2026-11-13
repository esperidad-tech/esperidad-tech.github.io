"""Enquête 3 : le concours de gâteaux (Romain, 12 novembre, 21 h 34) — les quatre rôles font un gâteau à la boulangerie,
dix minutes, une icône 🎂 sur la carte, et le message « Attends tes amis… élisez le plus beau ».
Pour chaque rôle : l'icône sur la carte, la boulangerie, l'explication (le message), l'écran des règles, le minuteur à 10:00,
la fin (« votez pour le plus beau »), puis l'icône disparaît.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-gateau.py"""
import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-gateau'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def voile(pg):
    return pg.evaluate("() => { var v = document.querySelector('#voile:not([hidden])'); return v ? v.innerText.replace(/\\s+/g, ' ') : ''; }")

def gateau_carte(pg):
    return pg.evaluate("() => M.infosCarte().marqueurs.filter(function(m){ return m.lieu === 'boulangerie' && m.ic === '🎂'; }).length")

def role(b, r):
    print(f'— {r}')
    pg = b.new_context(viewport={'width': 1180, 'height': 820}).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'[{r}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{r}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={r}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', r.capitalize()); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(600)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      var vrai = MJ.lancer;
      MJ.lancer = function(el, type, params, fin, opt){
        var c = {type:type, params:params, fin:fin, fini:false, opt:opt};
        c.h = vrai.call(MJ, el, type, params, function(x){ if(!c.fini){ c.fini = true; fin(x); } }, opt);
        window.__mjCourant = c; return c.h;
      }; }""")
    if r == 'barde': pg.evaluate("() => { M.P().vus['marche:fini'] = 1; }")
    verifier(gateau_carte(pg) == 1, 'une icône 🎂 sur la boulangerie, sur la carte')
    pg.evaluate("() => { M.P().onglet = 'carte'; M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(500)
    verifier(pg.locator('svg text, svg tspan').filter(has_text='🎂').count() >= 1 or '🎂' in pg.locator('.b-contenu-carte, #app').first.inner_html(), 'l\'icône est dessinée sur la carte')
    pg.screenshot(path=f'{OUT}/{r}-carte.png')
    pg.evaluate("() => { M.A.lieu({dataset:{id:'boulangerie'}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(300)
    if r == 'alchimiste': bouton = pg.locator('#voile [data-act=point][data-id=gateau]')
    else: bouton = pg.locator('#voile [data-act=bonus][data-id=gateau_' + r + ']')
    verifier(bouton.count() == 1, 'la boulangerie : le gâteau à faire')
    pg.screenshot(path=f'{OUT}/{r}-boulangerie.png')
    bouton.first.click(); pg.wait_for_timeout(300)
    t = voile(pg)
    verifier('Attends tes amis' in t and 'même temps' in t and 'le plus beau' in t and 'Dix minutes' in t, f'l\'explication : le message ({t[:160]})')
    verifier(pg.locator('#voile [data-act=mj-go]').count() == 1, 'le bouton jaune avant le mini-jeu')
    pg.screenshot(path=f'{OUT}/{r}-avant.png')
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    verifier('10 minutes' in pg.locator('#mj-plein').inner_text() or 'Dix minutes' in pg.locator('#mj-plein').inner_text(), 'l\'écran des règles parle de dix minutes')
    pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(2500)
    reste = pg.evaluate("() => { var g = document.querySelector('.gt'); return g && g.__gateau ? g.__gateau.temps() : null; }")
    verifier(reste is not None and 590 <= reste <= 600, f'le minuteur part de dix minutes ({reste})')
    pg.screenshot(path=f'{OUT}/{r}-jeu.png')
    # la vraie fin : le temps tombe à zéro, le gâteau part à la fête, puis on referme
    pg.evaluate("() => document.querySelector('.gt').__gateau.temps(0.3)"); pg.wait_for_timeout(2500)
    verifier('dix minutes' in pg.inner_text('.gt-final-dit'), 'à zéro : « Les dix minutes sont passées »')
    # (13 novembre) le vote : « Vote » → les vingt bulles → sa place (1er : 5 pièces, 2e : 4, 3e : 3, 4e : 2) → « Bravo » → « Mission réussie »
    verifier(pg.locator('.gt-fete').inner_text().strip().lower().find('vote') >= 0 and pg.locator('.gt-retouche').count() == 0, 'le bouton « Vote » (et plus de « Retoucher » : le temps est fini)')
    or0 = pg.evaluate("() => M.S.or")
    pg.click('.gt-fete', force=True); pg.wait_for_timeout(600)
    verifier(pg.locator('.gt-note').count() == 20, 'le vote : vingt bulles, de 1 à 20')
    pg.click('.gt-note[data-n="15"]', force=True); pg.wait_for_timeout(500)
    verifier(pg.locator('.gt-rang').count() == 4, 'puis sa place : 1er, 2e, 3e, 4e')
    pg.click('.gt-rang[data-r="2"]', force=True); pg.wait_for_timeout(900)
    verifier('4 pièces' in pg.inner_text('#mj-plein .mj-resultat'), 'deuxième : « Tu as gagné 4 pièces d\'or »')
    pg.click('.mj-continuer', force=True); pg.wait_for_timeout(1200)
    t = voile(pg)
    verifier('Mission réussie' in t and 'grande table de la fête' in t and pg.evaluate("() => M.S.or") == or0 + 4, f'la fin : « Mission réussie… Ton gâteau part sur la grande table de la fête », + 4 pièces ({t[:160]})')
    pg.screenshot(path=f'{OUT}/{r}-fin.png')
    pg.evaluate("() => { M.UI.modal = null; M.render(); }")
    verifier(gateau_carte(pg) == 0, 'le gâteau fait : plus d\'icône 🎂 sur la carte')
    pg.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    for r in ['alchimiste', 'barde', 'pisteur', 'sage']: role(b, r)
    b.close()
print('ÉCHECS :', echecs)
print('ERREURS :', erreurs[:10])
