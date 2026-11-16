"""Mimi en gros plan dans le vrai jeu : python3 tools/mimi-gros.py <dist> <sortie.png> "<scénario python>" [iphone]
   Le scénario dispose de : pg, cid, V, js(code) (évalue dans la page), photo(nom) (un gros plan autour de Mimi), attendre(ms), calme(pose)."""
import sys, os, io
from playwright.sync_api import sync_playwright
from PIL import Image
dist, sortie, scen = sys.argv[1], sys.argv[2], sys.argv[3]
TEL = 'iphone' in sys.argv
URL = 'file://' + os.path.join(dist, 'index.html') + '#test'
V = "Atelier._vue()"
ims = []
with sync_playwright() as p:
    b = p.chromium.launch()
    vp = {'width': 390, 'height': 844} if TEL else {'width': 1180, 'height': 820}
    pg = b.new_context(viewport=vp, has_touch=True, device_scale_factor=3).new_page()
    pg.set_default_timeout(9000)
    err = []
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: err.append(f'PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Lia'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { M.lire = function(){}; M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    for i in range(90):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(200)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    for i in range(30):
        pg.evaluate("() => { var c = document.querySelector('#atelier-ici .at-coin'); if(c) c.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(300)
        k = pg.evaluate("""() => { var l = [].slice.call(document.querySelectorAll('#atelier-ici [data-res]')); var b = l.filter(function(x){ return /Gamelle|Litière|Distributeur|Panier/.test(x.textContent); })[0];
          if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return b.textContent; } return null; }""")
        pg.wait_for_timeout(350)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
        if not k: break
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0] || {}).id || null")
    def js(code): return pg.evaluate("() => { var a = " + V + ", cid = '" + cid + "'; " + code + " }")
    def attendre(ms): pg.wait_for_timeout(ms)
    def calme(pose='assis'):
        js(f"a._finJouet(); a._reveil(cid); a._dehors(cid); a._pose(cid, '{pose}'); var p = a._pos(cid); if(p) a._voir(p.x, p.y - 60);"); pg.wait_for_timeout(700)
    def photo(nom='', m=1.0):
        r = pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); if(!d) return null; var r = d.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }}")
        if not r: return
        mx, my = r[2] * 0.75 * m, r[3] * 0.8 * m
        x, y = max(0, r[0] - mx), max(0, r[1] - my); w, h = min(vp['width'] - x, r[2] + 2 * mx), min(vp['height'] - y, r[3] + my * 1.4)
        im = Image.open(io.BytesIO(pg.screenshot(clip={'x': x, 'y': y, 'width': w, 'height': h}))).convert('RGB')
        ims.append((nom, im))
    exec(scen)
    print('erreurs', err[:5])
    b.close()
if ims:
    T = 300; cols = min(5, len(ims)); rows = (len(ims) + cols - 1) // cols
    pl = Image.new('RGB', (T * cols, T * rows), '#111')
    for i, (nom, im) in enumerate(ims):
        k = min(T / im.width, T / im.height); im2 = im.resize((int(im.width * k), int(im.height * k)))
        pl.paste(im2, ((i % cols) * T + (T - im2.width) // 2, (i // cols) * T + (T - im2.height) // 2))
    pl.save(sortie); print(len(ims), 'images', pl.size)
