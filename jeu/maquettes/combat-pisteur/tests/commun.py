# Ce qui sert à tous les essais : ouvrir la page (combat-pisteur.html, à côté de ce dossier) et attendre qu'elle soit prête.
import os, time
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'combat-pisteur.html')
SORTIE = os.environ.get('P5_SORTIE', '/tmp/p5')
os.makedirs(SORTIE, exist_ok=True)

def ouvrir(p, w=844, h=390, dpr=2, args=None, ralenti=0, suffixe=''):
    b = p.chromium.launch(args=args or [])
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, has_touch=True, is_mobile=True)
    pg = ctx.new_page()
    if ralenti:
        ctx.new_cdp_session(pg).send('Emulation.setCPUThrottlingRate', {'rate': ralenti})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:500]))
    pg.on('console', lambda m: errs.append('console:' + m.text[:300]) if m.type == 'error' and 'ERR_' not in m.text else None)
    t0 = time.time()
    pg.goto(PAGE + suffixe)
    for k in range(800):
        time.sleep(0.25)
        if pg.evaluate("window.__pt?__pt.etat().prepare:0") >= 3:
            break
    return b, pg, errs, time.time() - t0
