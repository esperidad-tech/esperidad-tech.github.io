# la mémoire de la page pendant une partie entière (comme pour les plantages du donjon sur iPhone) : toutes les 20 s, l'acte,
# la mémoire du programme de la page (le « renderer » de Chrome), celle de son JavaScript, les images par seconde
import pathlib, subprocess, sys, time
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri()
def rss():
    out = subprocess.run(['ps', '-eo', 'rss,args'], capture_output=True, text=True).stdout.splitlines()
    r = [int(l.split()[0]) for l in out if '--type=renderer' in l]; g = [int(l.split()[0]) for l in out if '--type=gpu-process' in l]
    return round(max(r or [0]) / 1024), round(sum(g) / 1024)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required', '--enable-precise-memory-info'])
    pg = nav.new_context(viewport={'width': 375, 'height': 667}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(4000); print('au repos (page, carte graphique) Mo :', rss(), flush=True)
    pg.evaluate('__barde.nouvellePartie(0)'); pg.evaluate('__barde.robot(true,0.05,0.85,0.85)'); t0 = time.time()
    while time.time() - t0 < 700:
        pg.wait_for_timeout(20000); e = pg.evaluate('__barde.etat()'); q = pg.evaluate('__barde.qualite()'); js = pg.evaluate('performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1')
        print(f"{int(time.time() - t0):4d}s acte {e['acte'] + 1} {e['mode']:9s} {e['sec']:3s} page {rss()[0]:5d} Mo | JS {js:4d} Mo | {q['ips']} img/s niveau {q['n']} baisses {q['baisses']} golems {q['cuits']}", flush=True)
        if e['etat'] == 'fin': break
    print('erreurs :', err or 'aucune'); nav.close()
