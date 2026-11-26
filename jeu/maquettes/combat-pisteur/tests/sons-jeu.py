# Les sons dans le vrai jeu (version 10) : on lance une vague, le Pisteur (invincible) reste planté au milieu des golems pendant
# une demi-minute de temps réel, et on regarde ce qui a sonné, si la musique tourne, et si un son a raté.
#   python3 tests/sons-jeu.py [vague] [secondes] [cache]
import sys, os, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from commun import ouvrir
v = int(sys.argv[1]) if len(sys.argv) > 1 else 5
sec = float(sys.argv[2]) if len(sys.argv) > 2 else 30
cache = len(sys.argv) > 3 and sys.argv[3] == 'cache'       # (caché : le Pisteur reste dans l'ombre, sous la cape : on écoute la patrouille)
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p, 844, 390, 1, suffixe='?extrait=non')
    pg.tap('#btnGo', force=True); time.sleep(0.5)
    pg.evaluate("__pt.invincible(true);__pt.demarrer(%d);__pt.ev('P.x=13;P.y=9;P.lx=13;P.ly=9')" % (v - 1))
    if cache: pg.evaluate("__pt.ev('P.ombre=true;P.capeT=999')")
    t0 = time.time(); vus = []
    while time.time() - t0 < sec:
        time.sleep(3); vus.append(pg.evaluate("__son.etat()"))
    j = pg.evaluate("__son.joues"); e = pg.evaluate("__son.erreurs")
    print('vague', v, '·', int(sec), 's ·', sum(j.values()), 'sons joués :', json.dumps(dict(sorted(j.items(), key=lambda q: -q[1])), ensure_ascii=False))
    print('état du son :', vus[-1], '· la boule a roulé :', any(q['boule'] for q in vus))
    print('RATÉS', e); print('ERREURS', errs[:5]); b.close()
