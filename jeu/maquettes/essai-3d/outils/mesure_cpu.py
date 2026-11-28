# mesure_cpu.py : le travail du processeur pour une image (calcul du jeu + préparation du dessin par three.js), processeur ralenti ×6
import sys, time, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=1); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): break
        time.sleep(0.5)
    time.sleep(1.5)
    pg.evaluate('window.__pilote = true; __essai.h.x = 12.6; __essai.h.y = 11.4; __essai.avancer(0.3)')
    cdp = pg.context.new_cdp_session(pg)
    mes = """(() => { const E = __essai, r = E.rendu, gl = r.getContext(); let tj = 0, tr = 0; const n = 20;
      for (let k = 0; k < n; k++) { gl.finish(); const a = performance.now(); E.etape(1/60, 300 + k / 60); const b = performance.now(); r.render(E.scene, E.cam); const c = performance.now(); tj += b - a; tr += c - b; }
      return [+(tj / n).toFixed(1), +(tr / n).toFixed(1)]; })()"""
    for scene, prep in [('repos', ''), ('chute', "window.__tirage = [[4,6],[9,4.5],[15.5,6],[6,11],[12.5,10],[17,13]]; __essai.lancerVague(); __essai.avancer(4.4)"), ('vague', "__essai.avancer(6.0)"), ('bris', "__essai.avancer(3.5)")]:
        if prep: pg.evaluate(prep)
        for rate in (1, 6):
            cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate}); j, r = pg.evaluate(mes); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
            print('%-6s processeur ÷%d : calcul du jeu %5.1f ms + préparation du dessin %5.1f ms = %5.1f ms (24 images/s : 41,7 ms au plus)' % (scene, rate, j, r, j + r))
    print(err); b.close()
