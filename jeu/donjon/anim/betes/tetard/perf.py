"""Fluidité du têtard sur une « vieille tablette » : page mobile 1024 × 768, device_scale_factor 2, processeur ralenti ×6 (CDP).
Mesure les images par seconde pendant l'attente, les actions et l'explosion.
Lancer :  flock /tmp/brumeval-pw.lock python3 perf.py  [ralenti, défaut 6]"""
import os, sys, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
RALENTI = int(sys.argv[1]) if len(sys.argv) > 1 else 6
MESURE = """(ms) => new Promise(ok => { var t = [], d = performance.now(); function f(x){ t.push(x); if(x - d < ms) requestAnimationFrame(f); else {
  var dt = []; for(var i = 1; i < t.length; i++) dt.push(t[i] - t[i-1]); dt.sort((a,b)=>a-b);
  ok({ips: Math.round(t.length / (ms / 1000)), pire: Math.round(dt[dt.length-1]), lentes: dt.filter(x => x > 25).length}); } } requestAnimationFrame(f); })"""
# (nom, étapes à lancer avant, étape mesurée, durée de la mesure en ms)
PLAN = [
    ('attente', ['attendre'], None, 3000),
    ('attaquer', [], 'attaquer', 1000),
    ('coup', [], 'touche fleche', 800),
    ('toux', [], 'touche nuage', 2500),
    ('brûlé + enragé (attente)', ['brule on', 'enrage on'], None, 2500),
    ('sur le dos', ['brule off', 'enrage off', 'dos on'], None, 2000),
    ('explosion', ['dos off'], 'exploser', 2500),
]


def main():
    res = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film=1')
        pg.wait_for_timeout(500)
        pg.evaluate("() => { window.__f = false; etape('entrer').then(() => window.__f = true); }")
        pg.wait_for_function('window.__f', timeout=30000)
        cdp = pg.context.new_cdp_session(pg)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': RALENTI})
        for nom, avant, etape, ms in PLAN:
            for e in avant:
                pg.evaluate("(e) => { window.__f = false; etape(e).then(() => window.__f = true, () => window.__f = true); }", e)
                pg.wait_for_function('window.__f', timeout=60000)
            pg.wait_for_timeout(300)
            if etape:
                pg.evaluate("(e) => { window.__f = false; etape(e).then(() => window.__f = true, () => window.__f = true); }", etape)
            r = pg.evaluate(MESURE, ms)
            if etape:
                pg.wait_for_function('window.__f', timeout=60000)
            r['nom'] = nom
            res.append(r)
            print('CPU ×%d  %-36s %3d ips   pire image %4d ms   images lentes (>25 ms) : %d' % (RALENTI, nom, r['ips'], r['pire'], r['lentes']), flush=True)
        b.close()
    print('erreurs :', errs)
    json.dump(res, open(os.path.join(ICI, 'perf.json'), 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()
