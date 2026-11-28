# mesure_ips.py : ce que coûte une image — lumières, ombres, dessins, triangles ; le temps du calcul du jeu (processeur ralenti ×4 et ×6)
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
    stats = """(() => { const E = __essai, r = E.rendu, L = { point: 0, spot: 0, dir: 0, ombres: 0 }; E.scene.traverse(o => { if (o.isPointLight) L.point++; if (o.isSpotLight) L.spot++; if (o.isDirectionalLight) L.dir++; if (o.isLight && o.castShadow) L.ombres++; });
      r.info.autoReset = false; r.info.reset(); r.render(E.scene, E.cam); const i = r.info;
      let ombreTri = 0; E.scene.traverse(o => { if (o.isMesh && o.castShadow && o.geometry) ombreTri += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
      r.info.autoReset = true;
      return { lumieres: L, dessins: i.render.calls, triangles: i.render.triangles, trianglesQuiFontOmbre: Math.round(ombreTri), programmes: i.programs.length, textures: i.memory.textures, ecran: [r.domElement.width, r.domElement.height], ratio: r.getPixelRatio() }; })()"""
    print('repos', json.dumps(pg.evaluate(stats)))
    cdp = pg.context.new_cdp_session(pg)
    def temps(nom):
        res = {}
        for rate in (1, 4, 6):
            cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
            r = pg.evaluate("""(() => { const E = __essai; let tE = 0, n = 60; const t0 = performance.now(); for (let k = 0; k < n; k++) { const a = performance.now(); E.etape(1/60, 100 + k/60); tE += performance.now() - a; } return +(tE / n).toFixed(2); })()""")
            res['x%d' % rate] = r
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
        print(nom, 'calcul du jeu par image (ms) :', res)
    temps('repos')
    pg.evaluate('window.__tirage = [[4,6],[9,4.5],[15.5,6],[6,11],[12.5,10],[17,13]]; __essai.lancerVague(); __essai.avancer(5.0)')
    print('cristaux qui tombent', json.dumps(pg.evaluate(stats))); temps('chute')
    pg.evaluate('__essai.avancer(7.0)')
    print('vague', json.dumps(pg.evaluate(stats))); temps('vague')
    print(err); b.close()
