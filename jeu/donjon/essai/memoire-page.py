"""La mémoire de la page du donjon, comme un iPhone la voit à peu près (24 novembre au soir, les plantages : « ça redémarre presque à
toutes les salles »). Émulation iPhone (844 x 390, densité 3), puis on relève la mémoire du processus de la page (Chrome :
--type=renderer) toutes les 15 s pendant 90 s, puis après le ramasse-miettes.

    python3 memoire-page.py DOSSIER_DU_DONJON '?combat=rats&graine=7&volume=1&potions=toutes'
    python3 memoire-page.py DOSSIER_DU_DONJON '?leo=3&volume=1&graine=7'

Repères (24 novembre) : anciens héros ≈ 0,45 Go ; héros en volume avant la correction de hv-cuit.js 1,3 à 1,5 Go ; après 0,75 à 0,87 Go."""
import sys, time, subprocess
from playwright.sync_api import sync_playwright

B, Q = sys.argv[1], sys.argv[2]
LEO = 'leo=' in Q


def memoire():
    r = {'page': 0, 'gpu': 0}
    for l in subprocess.run(['ps', '-eo', 'rss,args'], capture_output=True, text=True).stdout.splitlines():
        if 'chrom' not in l:
            continue
        k = l.strip().split(None, 1)
        if '--type=renderer' in l:
            r['page'] += int(k[0])
        elif '--type=gpu-process' in l:
            r['gpu'] += int(k[0])
    return {k: '%d Mo' % (v // 1024) for k, v in r.items()}


with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script("window.AudioContext = undefined; window.webkitAudioContext = undefined;")
    pg.goto('file://' + B + '/index.html' + Q)
    if LEO:
        pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
        pg.evaluate("() => { setInterval(function(){ var E = DJ.Leo._E(); if(!E) return; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = E.c.h[h]; if(!S.sol) S.pv = S.pvMax; }); }, 60); }")
    else:
        pg.wait_for_function("(function(){ var e = window.DJ && DJ.Combat && DJ.Combat.etat(); return !!e && e.mode === 'qui'; })()", timeout=180000)
    t0 = time.time()
    for t in range(0, 91, 15):
        if t:
            pg.wait_for_timeout(15000)
        print('%3d s' % (time.time() - t0), memoire(), flush=True)
    cdp = ctx.new_cdp_session(pg)
    cdp.send('HeapProfiler.enable'); cdp.send('HeapProfiler.collectGarbage'); pg.wait_for_timeout(3000); cdp.send('HeapProfiler.collectGarbage'); pg.wait_for_timeout(3000)
    print('après le ramasse-miettes', memoire())
    ctx.close(); nav.close()
