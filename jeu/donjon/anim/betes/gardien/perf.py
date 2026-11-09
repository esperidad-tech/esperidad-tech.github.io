"""Fluidité du Gardien sur une « vieille tablette » : page mobile 1024 × 768, device_scale_factor 2, processeur ralenti ×6 (CDP).
    flock /tmp/brumeval-pw.lock python3 perf.py [ralenti, défaut 6]
Mesure les images par seconde pendant chaque moment de window.PERF (demo.html) : [nom, étapes mesurées, durée (ms), préparation (non mesurée)].
Objectif (CONTRAT.md §4 bis) : ≥ 50 ips à l'attente, ≥ 40 pendant les actions et l'explosion. Résultats dans perf.json."""
import os, sys, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
RALENTI = int(sys.argv[1]) if len(sys.argv) > 1 else 6
MESURE = """(ms) => new Promise(ok => { var t = [], d = performance.now(); function f(x){ t.push(x); if(x - d < ms) requestAnimationFrame(f); else {
  var dt = []; for(var i = 1; i < t.length; i++) dt.push(t[i] - t[i-1]); dt.sort((a,b)=>a-b);
  ok({ips: Math.round((t.length - 1) / ((t[t.length-1] - t[0]) / 1000)), pire: Math.round(dt[dt.length-1]), lentes: dt.filter(x => x > 34).length}); } } requestAnimationFrame(f); })"""
LANCER = "(l) => { window.__ok = false; l.reduce((p, e) => p.then(() => etape(e)), Promise.resolve()).then(() => { window.__ok = true; }, (e) => { console.error(e && e.stack || e); window.__ok = true; }); }"
res = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_FILE_NOT_FOUND' not in m.text else None)
    pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film=1')
    pg.wait_for_timeout(800)
    cdp = pg.context.new_cdp_session(pg)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': RALENTI})
    pg.wait_for_timeout(500)
    for e in pg.evaluate('PERF'):
        nom, etapes, ms = e[:3]
        if len(e) > 3 and e[3]:
            pg.evaluate(LANCER, e[3])
            pg.wait_for_function('window.__ok', timeout=60000)
            pg.wait_for_timeout(1200)
        pg.evaluate(LANCER, etapes)
        r = pg.evaluate(MESURE, ms)
        r['nom'] = nom
        res.append(r)
        print('CPU ×%d  %-30s %3d ips   pire image %4d ms   images > 34 ms : %d' % (RALENTI, nom, r['ips'], r['pire'], r['lentes']), flush=True)
        pg.wait_for_function('window.__ok', timeout=60000)
        pg.wait_for_timeout(800)
    b.close()
print('erreurs :', errs or 'aucune')
json.dump(res, open(os.path.join(ICI, 'perf.json'), 'w'), ensure_ascii=False, indent=1)
