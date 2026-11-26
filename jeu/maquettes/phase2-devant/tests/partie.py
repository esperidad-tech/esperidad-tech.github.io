#!/usr/bin/env python3
"""Le robot joue des parties entières DANS LA VRAIE PAGE (règles + dessin + boutons à chaque image), en accéléré,
puis 25 s en vrai sur un téléphone ralenti 4 fois : python3 tests/partie.py"""
import pathlib, json
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
url = (ici / 'phase2-devant.html').as_uri()
robot = (ici / 'tests' / 'robot-coeur.js').read_text()
err = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.goto(url); pg.wait_for_timeout(300); pg.add_script_tag(content=robot); pg.tap('#bGo'); pg.wait_for_timeout(200)
    for vie, graine in [(1000, 1), (400, 2)]:
        r = pg.evaluate("""([vie, graine]) => {
          const P2 = __p2.P2; __p2.fige = true; __p2.nouvelle(); const S = __p2.S; S.reg.vie = vie; S.vie = S.vieMax = vie; S.reg.pisteur = 20;
          const mem = {niveau: 'bon'}, dt = 1 / 60; let n = 0, vus = {};
          while (S.phase !== 'fini' && n < 60 * 1500) {
            const e = RobotP2(S, mem, dt); P2.pas(S, dt, e);
            if (n % 3 === 0) { __p2.dessiner(); __p2.majBoutons(); }
            vus['tiers' + S.tiers + ' ' + S.phase] = 1; S.evts.forEach(x => { if (x.type === 'attaque') vus[x.quoi] = 1; });
            n++;
          }
          return {fini: S.phase === 'fini', min: (S.t / 60).toFixed(1), morts: S.stats.morts, vus: Object.keys(vus).sort()};
        }""", [vie, graine])
        print(f'vie {vie} :', json.dumps(r, ensure_ascii=False))
        pg.evaluate("__p2.fige = false"); pg.wait_for_timeout(400)
        print('  écran de fin :', 'oui' if pg.evaluate("document.getElementById('fin').classList.contains('on')") else 'NON')
        pg.tap('#bRejouer'); pg.wait_for_timeout(200)
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    pg.evaluate("""() => { __p2.nouvelle(); const S0 = __p2.S; S0.reg.pisteur = 15; const mem = {niveau: 'bon'}; window.__mes = [];
      window.__pilote = (S, dt) => RobotP2(S, mem, dt); setInterval(() => window.__mes.push(__p2.ips), 1000); }""")
    for tiers in (1, 2, 3):
        pg.evaluate(f"__p2.P2.aller(__p2.S, {tiers})"); pg.wait_for_timeout(9000)
    mes = pg.evaluate("window.__mes.slice(2)")
    print('vitesse (téléphone ralenti 4 fois, les trois tiers) : moyenne', round(sum(mes) / max(1, len(mes))), ', au pire', min(mes) if mes else '?')
    b.close()
print('erreurs :', err or 'aucune')
