"""L'endurance d'une salle du donjon, comme un iPhone (844 x 390, densité 3) : on joue au hasard pendant N tours (les héros et les bêtes
ne meurent pas : leurs points de vie sont remis), et on relève à chaque tour la mémoire du processus de la page, le nombre d'éléments
de la page, d'animations, de toiles et d'images de héros cuites. Une mémoire qui monte sans redescendre = une fuite (24 novembre,
Romain, 22 h 51 : « au bout d'un moment, ça a bugué, ça a refait redémarrer la salle »).

    python3 endurance.py DOSSIER_DU_DONJON salle [tours] [--volume]"""
import sys, time, random, subprocess
from playwright.sync_api import sync_playwright

B, S = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else 12
VOL = '&volume=1' if '--volume' in sys.argv else ''


def memoire():
    r = 0
    for l in subprocess.run(['ps', '-eo', 'rss,args'], capture_output=True, text=True).stdout.splitlines():
        if 'chrom' in l and '--type=renderer' in l:
            r += int(l.strip().split(None, 1)[0])
    return r // 1024


ETAT = """() => { var C = window.HerosVues && HerosVues.Cuit && HerosVues.Cuit.cache, n = 0;
  if(C) Object.keys(C).forEach(function(k){ Object.keys(C[k]).forEach(function(m){ n += Object.keys(C[k][m]).length; }); });
  return {noeuds: document.querySelectorAll('*').length, anims: document.getAnimations().length, toiles: document.querySelectorAll('canvas').length,
    svg: document.querySelectorAll('svg').length, cuites: n}; }"""
with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script("window.AudioContext = undefined; window.webkitAudioContext = undefined;")
    pg.goto('file://' + B + '/index.html?combat=' + S + '&graine=7&potions=toutes&objets=pisteur:fleches-argent,pisteur:fleches-lourdes' + VOL)
    rnd = random.Random(7)

    def etat():
        return pg.evaluate("() => { var e = DJ.Combat.etat(); return e ? {mode:e.mode, occupe:e.occupe, tour:e.tour} : null; }")

    def libre(max_ms=90000):
        t = 0
        while t < max_ms:
            e = etat()
            if e and ((e['mode'] == 'qui' and not e['occupe']) or e['mode'] == 'fin'):
                pg.wait_for_timeout(250); return e
            pg.wait_for_timeout(200); t += 200
        return etat()
    libre()
    t0 = time.time()
    print('  début : %d Mo' % memoire(), pg.evaluate(ETAT), flush=True)
    joues, pire = 0, 0
    while joues < N:
        e = etat()
        if not e or e['mode'] == 'fin':
            break
        pg.evaluate("""() => { var c = DJ.Combat._E().c; Object.keys(c.h).forEach(function(h){ var H = c.h[h]; H.pv = H.pvMax; H.sol = false; });
          c.b.forEach(function(m){ if(!m.mort) m.pv = Math.max(m.pv, 30); }); }""")
        choix = pg.evaluate("""() => { var E = DJ.Combat._E(), l = E.c.aJouer(), o = [];
          l.forEach(function(h){ E.c.gestes(h).forEach(function(g){ if(g.permis) o.push({h:h, g:g.geste, vise:g.vise, cibles:g.cibles || [], max:g.max || 1}); }); });
          return o; }""")
        if not choix:
            pg.wait_for_timeout(500); libre(); continue
        c = rnd.choice(choix)
        pg.tap(f'.b-heros[data-id="{c["h"]}"]', force=True); pg.wait_for_timeout(200)
        try:
            pg.eval_on_selector(f'#bande .carte[data-id="{c["g"]}"]', 'e => e.click()')
        except Exception:
            pass
        pg.wait_for_timeout(250)
        try:
            if c['vise'] in ('salle', 'equipe'):
                pg.eval_on_selector('.zone[data-type="bete"]' if c['vise'] == 'salle' else '.zone[data-type="heros"]', 'e => e.click()')
            else:
                for cible in rnd.sample(c['cibles'], min(c['max'], len(c['cibles'])) or 1):
                    if cible in ('sage', 'alchimiste', 'pisteur'):
                        pg.tap(f'.zone[data-type="heros"][data-id="{cible}"]', force=True)
                    else:
                        pg.eval_on_selector('#zone-' + cible, 'e => e.click()')
                    pg.wait_for_timeout(150)
        except Exception:
            pass
        pg.wait_for_timeout(300)
        libre()
        joues += 1
        m = memoire(); pire = max(pire, m)
        print('  %2d  %-10s %-16s %4d Mo  %s  (%.0f s)' % (joues, c['h'], c['g'][:16], m, pg.evaluate(ETAT), time.time() - t0), flush=True)
    print('  PIRE %d Mo ; fin %d Mo' % (pire, memoire()), 'erreurs', errs[:3])
    ctx.close(); nav.close()
