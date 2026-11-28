# mesure_gpu.py : le temps de dessin d'une image (dessin + attente de la fin, gl.finish), selon la finesse — sur la carte graphique logicielle
# de cette machine (bien plus lente qu'une vraie) : seuls les rapports comptent
import sys, time, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): break
        time.sleep(0.5)
    time.sleep(1.5)
    pg.evaluate('window.__pilote = true; __essai.h.x = 12.6; __essai.h.y = 11.4; __essai.avancer(0.3)')
    mes = """((pr) => { const E = __essai, r = E.rendu, gl = r.getContext(); r.setPixelRatio(pr); r.render(E.scene, E.cam); gl.finish();
      let t = 0; for (let k = 0; k < 6; k++) { E.etape(1/60, 200 + k / 60); const a = performance.now(); r.render(E.scene, E.cam); gl.finish(); t += performance.now() - a; }
      r.info.autoReset = false; r.info.reset(); r.render(E.scene, E.cam); const tri = r.info.render.triangles; r.info.autoReset = true;
      return [pr, +(t / 6).toFixed(0), tri]; })"""
    for scene, prep in [('repos', ''), ('vague', "window.__tirage = [[4,6],[9,4.5],[15.5,6],[6,11],[12.5,10],[17,13]]; __essai.lancerVague(); __essai.avancer(12.0)")]:
        if prep: pg.evaluate(prep)
        for pr in (2, 1.5, 1):
            print(scene, '— finesse ×%s : %s ms par image (triangles %s)' % tuple([pr] + pg.evaluate(mes + '(%s)' % pr)[1:]))
    print(err); b.close()
