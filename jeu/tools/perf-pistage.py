"""La fluidité de « Suivre les traces » (mj-pistage.js), processeur ralenti (×6 par défaut : une vieille tablette).
Le Pisteur marche sans s'arrêter pendant « sec » secondes, en changeant de rue (le décor neuf se dessine en marchant), un chat passe
en courant ; on mesure les images par seconde, l'écart le plus long entre deux images, les images en retard, les longues tâches,
et ce que coûtent les morceaux du décor dessinés une fois (Blocs).
   BRUMEVAL_DIST=<dossier construit> python3 tools/perf-pistage.py [--taux 6] [--sec 14] [--ecran 1024x768x2] [--moment nuit] [--niveau 6]"""
import os, sys, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
args = sys.argv[1:]
def opt(nom, defaut, typ=int):
    if nom in args:
        i = args.index(nom); v = typ(args[i + 1]); del args[i:i + 2]; return v
    return defaut
TAUX = opt('--taux', 6); SEC = opt('--sec', 14); ECRAN = opt('--ecran', '1024x768x2', str); MOMENT = opt('--moment', 'nuit', str); NIV = opt('--niveau', 6)
w, h, d = (float(v) for v in ECRAN.split('x'))
Z = "document.querySelector('.pg').__pistage"
MESURE = """() => { var f = window.__f = {n:0, pire:0, l34:0, l50:0, l100:0, t0:performance.now(), longues:0, tLongues:0, dernier:0, fin:false};
  function image(t){ if(f.fin) return; if(f.dernier){ var d = t - f.dernier; f.n++; if(d > f.pire) f.pire = d; if(d > 34) f.l34++; if(d > 50) f.l50++; if(d > 100) f.l100++; } f.dernier = t; requestAnimationFrame(image); }
  requestAnimationFrame(image);
  try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ f.longues++; f.tLongues += e.duration; }); }).observe({entryTypes:['longtask']}); }catch(e){} }"""
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': int(w), 'height': int(h)}, device_scale_factor=d, has_touch=True)
    pg = ctx.new_page()
    pg.goto('file://' + DIST + f'/salle-mini-jeux.html#jeu=pistage&n={NIV}&v={MOMENT}'); pg.wait_for_timeout(1000)
    pg.locator('.mj-go').first.click(); pg.wait_for_timeout(4300)
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
    pg.evaluate(MESURE)
    # marcher : on tourne d'un carrefour à l'autre (des rues neuves, donc du décor neuf à dessiner)
    pas = 0
    pg.evaluate(f"() => {{ var z = {Z}, M = z.monde; z.poser(M.gx[0], M.gy[0]); }}")
    dirs = [(1, 0), (0, 1), (1, 0), (0, 1), (-1, 0), (0, -1), (1, 0), (0, 1)]
    t = 0
    while t < SEC * 1000:
        dx, dy = dirs[pas % len(dirs)]; pas += 1
        pg.evaluate(f"() => {Z}.aller({dx * 150}, {dy * 150})")
        if pas == 3: pg.evaluate(f"() => {Z}.coureur()")
        pg.wait_for_timeout(1750); t += 1750
    pg.evaluate(f"() => {Z}.aller(null)")
    f = pg.evaluate("() => { var f = window.__f; f.fin = true; f.sec = (performance.now() - f.t0) / 1000; return f; }")
    m = pg.evaluate(f"() => {Z}.mesures()")
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    print(json.dumps({'ecran': ECRAN, 'taux': TAUX, 'moment': MOMENT, 'images/s': round(f['n'] / f['sec'], 1), 'pire (ms)': round(f['pire']), '>34 ms': f['l34'], '>50 ms': f['l50'], '>100 ms': f['l100'],
      'longues taches': f['longues'], 'ms par image (decor, ce qui bouge, dessus, lumiere)': [round(m[k] / max(1, m['images']), 1) for k in ('decor', 'bouge', 'dessus', 'lumiere')], 'blocs dessines': m['blocs']['faits'], 'bloc moyen (ms)': round(m['blocs']['ms'] / max(1, m['blocs']['faits']), 1), 'bloc pire (ms)': round(m['blocs']['pire'], 1)}, ensure_ascii=False))
    b.close()
