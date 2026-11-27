# La vitesse (images par seconde) sur un téléphone ralenti 4 fois, seconde par seconde, avec ce qui se passe.  python3 tests/vitesse.py [tiers] [secondes]
import pathlib, json, sys
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
url = (ici / 'combat-armure.html').as_uri(); robot = (ici / 'tests' / 'robot-coeur.js').read_text()
tiers = int(sys.argv[1]) if len(sys.argv) > 1 else 1; sec = int(sys.argv[2]) if len(sys.argv) > 2 else 40
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url + '?finesse=' + (sys.argv[3] if len(sys.argv) > 3 else '0')); pg.wait_for_function('window.__p2&&window.__p2.pret', timeout=90000); pg.add_script_tag(content=robot)
    pg.evaluate("localStorage.removeItem('armure_finesse')")
    pg.tap('#bGo'); pg.wait_for_timeout(300)
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    pg.evaluate(f"""() => {{ const S0 = __p2.S; S0.reg.pisteur = 15; if({tiers}>1)__p2.P2.aller(S0,{tiers}); const mem = {{niveau: 'bon'}}; window.__mes = [];
      window.__pilote = (S, dt) => RobotP2(S, mem, dt);
      setInterval(() => {{ const S=__p2.S; window.__mes.push([__p2.ips, S.vague?'V':'', S.crepite?'C':'', S.ombres.length?'O':'', S.danse?'D':'', S.rayon?'R':'', __p2.FX.n, S.colonnes.length]); }}, 1000); }}""")
    pg.wait_for_timeout(sec * 1000)
    m = pg.evaluate("window.__mes")
    print(' '.join(f"{x[0]}{''.join(x[1:6])}" for x in m))
    print('particules max', max(x[6] for x in m), '· moyenne', round(sum(x[0] for x in m[2:]) / max(1, len(m) - 2)), '· au pire', min(x[0] for x in m[2:]), '· finesse', pg.evaluate('localStorage.getItem("armure_finesse")'))
    print('erreurs :', err or 'aucune')
    b.close()
