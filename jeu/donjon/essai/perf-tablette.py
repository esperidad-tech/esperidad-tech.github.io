"""Fluidité sur une « vieille tablette » : processeur ralenti x1 puis x6 (Chrome), images par seconde au repos, pendant une potion, pendant un critique. python3 perf-tablette.py"""
from playwright.sync_api import sync_playwright
import os
F = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'salle-rats.html')
MESURE = """(ms) => new Promise(ok => { var t = [], d = performance.now(); function f(x){ t.push(x); if(x - d < ms) requestAnimationFrame(f); else {
  var dt = []; for(var i = 1; i < t.length; i++) dt.push(t[i] - t[i-1]); dt.sort((a,b)=>a-b);
  ok({images: t.length, ips: Math.round(t.length / (ms / 1000)), pire: Math.round(dt[dt.length-1]), lentes: dt.filter(x => x > 50).length}); } } requestAnimationFrame(f); })"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for rate in (1, 6):
        pg = b.new_page(viewport={'width':1024,'height':768}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg.route('**/fonts.g*/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        t0 = pg.evaluate("performance.now()")
        pg.goto(F); pg.wait_for_timeout(500)
        cdp = pg.context.new_cdp_session(pg)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
        for r in ['feu','huile','baume']: pg.tap(f'.recette[data-id="{r}"] b', force=True)
        pg.tap('[data-act="descendre"]', force=True)
        pg.wait_for_function("SALLE.etat.mode === 'qui' && !SALLE.etat.occupe", timeout=30000)
        print(f'CPU x{rate}  au repos (anneaux, flottement) :', pg.evaluate(MESURE, 2000))
        pg.tap('.zone[data-type="heros"][data-id="alchimiste"]', force=True); pg.wait_for_timeout(200)
        pg.tap('.carte[data-id="p:huile"]', force=True); pg.wait_for_timeout(200)
        pg.tap('.zone[data-type="rat"][data-id="0"]', force=True)
        print(f'CPU x{rate}  potion (préparation + vol + chute) :', pg.evaluate(MESURE, 1800))
        pg.wait_for_function("SALLE.etat.mode === 'qui' && !SALLE.etat.occupe", timeout=30000)
        pg.tap('.zone[data-type="heros"][data-id="pisteur"]', force=True); pg.wait_for_timeout(200)
        pg.tap('.carte[data-id="fleche"]', force=True); pg.wait_for_timeout(200)
        pg.tap('.zone[data-type="rat"][data-id="0"]', force=True)
        print(f'CPU x{rate}  critique :', pg.evaluate(MESURE, 1600))
        pg.close()
    b.close()
