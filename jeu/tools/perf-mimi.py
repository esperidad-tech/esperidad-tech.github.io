"""La fluidité de Mimi (le pantin, mimi-pantin.js) dans l'atelier, processeur ralenti (×6 par défaut : une vieille tablette).
On mesure les images par seconde, l'écart le plus long entre deux images et les images en retard, dans quatre situations :
au calme (assise), en marche (elle court en rond), en jeu (un bond, une galipette, elle s'étire), sous le doigt (un câlin sur la tête).
   BRUMEVAL_DIST=<dossier construit> python3 tools/perf-mimi.py [--taux 6] [--ecran 1024x768x2]
(sous le verrou des robots : flock /tmp/brumeval-pw.lock …)"""
import os, sys, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
args = sys.argv[1:]
def opt(nom, defaut, typ=int):
    if nom in args:
        i = args.index(nom); v = typ(args[i + 1]); del args[i:i + 2]; return v
    return defaut
TAUX = opt('--taux', 6); ECRAN = opt('--ecran', '1024x768x2', str)
w, h, d = (float(v) for v in ECRAN.split('x'))
V = "Atelier._vue()"
MESURE = """() => { var f = window.__f = {n:0, pire:0, l34:0, l50:0, l100:0, t0:performance.now(), dernier:0, fin:false};
  function image(t){ if(f.fin) return; if(f.dernier){ var d = t - f.dernier; f.n++; if(d > f.pire) f.pire = d; if(d > 34) f.l34++; if(d > 50) f.l50++; if(d > 100) f.l100++; } f.dernier = t; requestAnimationFrame(image); }
  requestAnimationFrame(image); }"""
FIN = "() => { var f = window.__f; f.fin = true; var s = (performance.now() - f.t0) / 1000; return {ips:Math.round(f.n / s * 10) / 10, pire:Math.round(f.pire), plus34:f.l34, plus50:f.l50, plus100:f.l100, images:f.n}; }"
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': int(w), 'height': int(h)}, device_scale_factor=d, has_touch=True)
    pg = ctx.new_page(); pg.set_default_timeout(9000)
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto('file://' + DIST + '/index.html#test')
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
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0] || {}).id || null")
    def js(code): return pg.evaluate("() => { var a = " + V + ", cid = '" + cid + "'; " + code + " }")
    def calme(pose='assis'):
        js(f"a._finJouet(); a._reveil(cid); a._dehors(cid); a._pose(cid, '{pose}'); var p = a._pos(cid); if(p) a._voir(p.x, p.y - 60);"); pg.wait_for_timeout(600)
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
    res = {}
    calme(); pg.wait_for_timeout(800)
    pg.evaluate(MESURE); pg.wait_for_timeout(4000); res['au calme'] = pg.evaluate(FIN)
    calme(); pg.evaluate(MESURE)
    for i in range(2): js("a._jouer(cid, 'rond')"); pg.wait_for_timeout(2600); js("a._pose(cid, 'assis')")
    res['en marche'] = pg.evaluate(FIN)
    calme(); pg.evaluate(MESURE)
    for jeu, ms in [('bondir', 1700), ('galipette', 1400), ('etire', 2100), ('saut', 1100)]:
        js("a._pose(cid, 'assis')"); js(f"a._jouer(cid, '{jeu}')"); pg.wait_for_timeout(ms)
    res['en jeu'] = pg.evaluate(FIN)
    calme()
    r = pg.evaluate(f"() => {{ var a = {V}; if(a._ptChat) return a._ptChat('{cid}', 'tete'); var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]').getBoundingClientRect(); return [d.left + d.width * .6, d.top + d.height * .35]; }}")
    pg.evaluate(MESURE)
    pg.mouse.move(r[0], r[1]); pg.mouse.down()
    for i in range(30): pg.mouse.move(r[0] + (3 if i % 2 else -3), r[1] + (2 if i % 2 else -2)); pg.wait_for_timeout(100)
    pg.mouse.up()
    res['sous le doigt'] = pg.evaluate(FIN)
    print(json.dumps({'ecran': ECRAN, 'taux': TAUX, 'mesures': res}, ensure_ascii=False, indent=1))
    print('ERREURS', err)
    b.close()
