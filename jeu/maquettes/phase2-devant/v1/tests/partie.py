#!/usr/bin/env python3
"""Le robot joue des parties entières DANS LA VRAIE PAGE (règles + dessin + boutons, à chaque image) :
   python3 tests/partie.py           -> une partie par façon de taper (en accéléré), puis 25 s en vrai sur un téléphone ralenti 4 fois
Vérifie : aucune erreur de la page, la partie va au bout, l'écran de fin s'affiche ; mesure les images par seconde."""
import sys, pathlib, json
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
url = (ici / 'phase2-devant.html').as_uri()
robot = (ici / 'tests' / 'robot-coeur.js').read_text()
out = pathlib.Path('/tmp/p2-partie'); out.mkdir(exist_ok=True)
IPHONE = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
erreurs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(**IPHONE); pg = ctx.new_page()
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
    pg.goto(url); pg.wait_for_timeout(300)
    pg.add_script_tag(content=robot)
    pg.tap('#bGo'); pg.wait_for_timeout(200)
    for facon in ['immobile', 'bouton', 'faible']:
        r = pg.evaluate("""(facon) => {
          const P2 = __p2.P2; __p2.fige = true; __p2.nouvelle(); const S = __p2.S; S.reg.facon = facon; S.reg.pisteur = 10;
          const mem = {niveau: 'moyen'}, dt = 1/60; let n = 0, vus = {};
          while (S.phase !== 'fini' && n < 60*900) {
            const e = RobotP2(S, mem, dt); P2.pas(S, dt, e);
            if (n % 2 === 0) { __p2.dessiner(); __p2.majBoutons(); }
            vus[S.phase + S.forme] = 1; if (S.att) vus[S.att.type] = 1;
            n++;
          }
          return {fini: S.phase === 'fini', t: Math.round(S.t), formes: S.stats.formes.map(Math.round), morts: S.stats.morts, vus: Object.keys(vus).sort()};
        }""", facon)
        print(facon, json.dumps(r, ensure_ascii=False))
        pg.evaluate("__p2.fige = false"); pg.wait_for_timeout(400)
        fin = pg.evaluate("document.getElementById('fin').classList.contains('on')")
        print('  écran de fin :', 'oui' if fin else 'NON')
        pg.screenshot(path=str(out / f'fin-{facon}.png'))
        pg.tap('#bRejouer'); pg.wait_for_timeout(200)
    # en vrai, téléphone ralenti 4 fois : le robot joue au rythme de la page
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    pg.evaluate("""() => { __p2.nouvelle(); const S0 = __p2.S; S0.reg.pisteur = 10; const mem = {niveau: 'bon'}; window.__mes = [];
      let av = performance.now();
      setInterval(() => { const S = __p2.S, t = performance.now(); RobotP2(S, mem, (t - av) / 1000); av = t; }, 16);
      setInterval(() => window.__mes.push(__p2.ips), 1000); }""")
    pg.wait_for_timeout(25000)
    mes = pg.evaluate("window.__mes.slice(2)")
    etat = pg.evaluate("({phase: __p2.S.phase, forme: __p2.S.forme, t: Math.round(__p2.S.t)})")
    print('vitesse (téléphone ralenti 4 fois) : moyenne', round(sum(mes) / max(1, len(mes))), 'au pire', min(mes) if mes else '?', '|', etat)
    pg.screenshot(path=str(out / 'en-vrai.png'))
    b.close()
print('erreurs :', erreurs or 'aucune')
