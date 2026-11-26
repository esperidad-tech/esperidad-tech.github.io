#!/usr/bin/env python3
"""La vitesse sur une vieille tablette : Chrome SANS carte graphique, processeur ralenti.
Usage : python3 perf.py [page.html] [appareil] [ralenti] [acte] [secondes]
  appareil : iphone (390x844 x2), ipad (1024x768 x2, couché), vieil-ipad (768x1024 x1), android (800x1280 x1.5)
Rend : les images par seconde (moyenne, la pire seconde) pendant le combat, puis pendant le méga refrain."""
import sys, time, json, pathlib
from playwright.sync_api import sync_playwright

ici = pathlib.Path(__file__).resolve().parent
page = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ici.parent / 'combat-barde.html'
app = sys.argv[2] if len(sys.argv) > 2 else 'iphone'
ral = float(sys.argv[3]) if len(sys.argv) > 3 else 4
acte = int(sys.argv[4]) if len(sys.argv) > 4 else 3
dur = float(sys.argv[5]) if len(sys.argv) > 5 else 8
APP = {'iphone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
       'ipad': dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=2, has_touch=True),
       'vieil-ipad': dict(viewport={'width': 768, 'height': 1024}, device_scale_factor=1, has_touch=True),
       'android': dict(viewport={'width': 800, 'height': 1280}, device_scale_factor=1.5, has_touch=True)}
COMPTE = """() => { window.__f = { t: [] }; const f = () => { __f.t.push(performance.now()); requestAnimationFrame(f); }; requestAnimationFrame(f); }"""
LIRE = """(d) => { const t = __f.t, fin = performance.now(), deb = fin - d * 1000, x = t.filter(v => v >= deb); __f.t = [];
  if (x.length < 3) return { moy: 0, pire: 0, n: x.length };
  let pire = 1e9; for (let s = deb; s + 1000 <= fin; s += 500) { const n = x.filter(v => v >= s && v < s + 1000).length; pire = Math.min(pire, n); }
  let trou = 0; for (let i = 1; i < x.length; i++) trou = Math.max(trou, x[i] - x[i - 1]);
  return { moy: Math.round(10 * (x.length - 1) / ((x[x.length - 1] - x[0]) / 1000)) / 10, pire, trou: Math.round(trou) }; }"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required', '--disable-gpu'])
    ctx = nav.new_context(**APP[app]); pg = ctx.new_page(); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(page.as_uri() + (('?qualite=' + sys.argv[6] + (('&sans=' + sys.argv[7]) if len(sys.argv) > 7 else '')) if len(sys.argv) > 6 else '')); pg.wait_for_timeout(1200)
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': ral})
    pg.evaluate(f'__barde.nouvellePartie({acte})'); pg.evaluate('__barde.robot(true, 0.04, 0.9, 0.9)')
    pg.evaluate(COMPTE)
    pg.wait_for_timeout(5000); pg.evaluate('__f.t = []')           # le temps que les golems arrivent
    res = {}
    pg.wait_for_timeout(int(dur * 1000)); res['combat'] = pg.evaluate(LIRE, dur); e1 = pg.evaluate('__barde.etat()')
    pg.evaluate("document.getElementById('bPause').click()"); pg.wait_for_timeout(600)
    pg.evaluate("document.getElementById('bMega').click()"); pg.wait_for_timeout(7000); pg.evaluate('__f.t = []')
    pg.wait_for_timeout(int(dur * 1000)); res['mega'] = pg.evaluate(LIRE, dur); e2 = pg.evaluate('__barde.etat()')
    q = pg.evaluate('window.__barde.qualite ? __barde.qualite() : null')
    pg.screenshot(path=str(ici / f'perf-{app}.png'))
    print(f"{page.name} | {app} | ralenti x{ral:g} | acte {acte + 1} : combat {res['combat']} ({e1.get('mode')}, méga {e1.get('mega')}) ; méga refrain {res['mega']} ({e2.get('mode')}, méga {e2.get('mega')}) ; qualité {q} ; erreurs {err or 'aucune'}")
    nav.close()
