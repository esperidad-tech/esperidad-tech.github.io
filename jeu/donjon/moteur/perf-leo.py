"""La fluidité du combat de Léo, processeur ralenti : flock /tmp/brumeval-pw.lock python3 perf-leo.py [phase] [--taux 6] [--sans-son] [--sec 25] [--profil]

Romain, 15 novembre : « ça rame de partout ». Un robot pianote sur les icônes pendant « sec » secondes (les héros sont soignés
pour que le combat dure) ; on mesure, sur le fil principal ralenti (×6 par défaut : une vieille tablette) :
  - les images par seconde (les requestAnimationFrame servis), l'écart le plus long entre deux images, les images en retard
    (plus de 34 ms, plus de 50 ms, plus de 100 ms) ;
  - les longues tâches (plus de 50 ms) ;
  - avec --profil : où part le temps du JavaScript (les fonctions les plus chères).
--sans-son : le même combat sans le moteur de son (pour savoir ce que coûtent les sons).
Aussi : --salle rats (un combat ordinaire : l'huile puis la dague = le critique)."""
import os, sys, json
from collections import defaultdict
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
args = sys.argv[1:]


def opt(nom, defaut, typ=int):
    if nom in args:
        i = args.index(nom); v = typ(args[i + 1]); del args[i:i + 2]; return v
    return defaut


TAUX = opt('--taux', 6); SEC = opt('--sec', 25); SALLE = opt('--salle', None, str)
JS = opt('--js', None, str)
ECRAN = opt('--ecran', '1024x768x2', str)          # largeur x hauteur x densité : une petite tablette = 800x480x1
REPOS = '--repos' in args
SANS_SON = '--sans-son' in args; PROFIL = '--profil' in args
args = [a for a in args if not a.startswith('--')]
PHASE = int(args[0]) if args else 2
OBJETS = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes&graine=7'

MESURE = """() => { var f = window.__f = {n:0, pire:0, l34:0, l50:0, l100:0, t0:performance.now(), longues:0, tLongues:0, dernier:0, fin:false};
  function image(t){ if(f.fin) return; if(f.dernier){ var d = t - f.dernier; f.n++; if(d > f.pire) f.pire = d; if(d > 34) f.l34++; if(d > 50) f.l50++; if(d > 100) f.l100++; } f.dernier = t; requestAnimationFrame(image); }
  requestAnimationFrame(image);
  try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ f.longues++; f.tLongues += e.duration; }); }).observe({entryTypes:['longtask']}); }catch(e){} }"""
FIN = "() => { var f = window.__f; f.fin = true; f.sec = (performance.now() - f.t0) / 1000; return f; }"


def profil_top(prof, n=28):
    noeuds = {x['id']: x for x in prof['nodes']}
    dt = prof.get('timeDeltas') or []; ech = prof.get('samples') or []
    soi = defaultdict(float)
    for s, d in zip(ech, dt):
        cf = noeuds[s]['callFrame']
        soi[(cf.get('functionName') or '(anonyme)', os.path.basename(cf.get('url', ''))[-22:], cf.get('lineNumber', 0))] += d / 1000
    tot = sum(soi.values())
    print('   le JavaScript (temps propre, sur %.1f s de mesure) :' % (tot / 1000))
    for k, v in sorted(soi.items(), key=lambda x: -x[1])[:n]:
        print('     %6.0f ms %5.1f %%  %s  %s:%s' % (v, 100 * v / tot, k[0], k[1], k[2]))
    # le temps « avec tout ce qu'elle appelle », par fonction (une fonction n'est comptée qu'une fois par pile)
    propre = defaultdict(float)
    for s, d in zip(ech, dt):
        propre[s] += d / 1000
    parent = {}
    for x in prof['nodes']:
        for c in x.get('children', []):
            parent[c] = x['id']
    incl = defaultdict(float)
    for nid, t in propre.items():
        vus = set(); i = nid
        while i is not None:
            cf = noeuds[i]['callFrame']; k = (cf.get('functionName') or '(anonyme)', cf.get('lineNumber', 0))
            if k not in vus and cf.get('url'):
                vus.add(k); incl[k] += t
            i = parent.get(i)
    print('   avec tout ce qu\'elles appellent (les fonctions du jeu) :')
    for k, v in sorted(incl.items(), key=lambda x: -x[1])[:46]:
        print('     %6.0f ms %5.1f %%  %s :%s' % (v, 100 * v / tot, k[0], k[1]))


with sync_playwright() as p:
    nav = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    _e = [float(x) for x in ECRAN.split('x')]
    ctx = nav.new_context(viewport={'width': int(_e[0]), 'height': int(_e[1])}, device_scale_factor=_e[2], has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
    if SANS_SON:
        pg.add_init_script("window.AudioContext = undefined; window.webkitAudioContext = undefined; window.OfflineAudioContext = undefined; window.webkitOfflineAudioContext = undefined;")
    cdp = ctx.new_cdp_session(pg)
    if SALLE:
        pg.goto(PAGE + '?combat=%s&vu=1&potions=feu,huile,baume&graine=7' % SALLE)
        pg.wait_for_selector('#bande .carte', timeout=120000); pg.wait_for_timeout(2500)
        pg.touchscreen.tap(500, 300)
    else:
        pg.goto(PAGE + '?combat=leo&phase=%d&vu=1&%s' % (PHASE, OBJETS))
        pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
        pg.wait_for_timeout(2500)
        pg.touchscreen.tap(500, 300)                       # (un toucher : le son a le droit de démarrer)
    if JS:
        pg.evaluate(JS)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
    if PROFIL:
        cdp.send('Profiler.enable'); cdp.send('Profiler.setSamplingInterval', {'interval': 500}); cdp.send('Profiler.start')
    cdp.send('Performance.enable')
    m0 = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
    pg.evaluate(MESURE)
    if SALLE or REPOS:
        pg.wait_for_timeout(SEC * 1000)
    else:
        for i in range(int(SEC / .45)):
            pg.evaluate("""(i) => { var E = DJ.Leo._E(), c = E.c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; if(!S.sol && S.pv < S.pvMax * .5) S.pv = S.pvMax; });
              if(c.leo.pv < 2500 && c.phase < 3) c.leo.pv = 2500; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ c.h[h].brule = 0; });
              var l = [].filter.call(document.querySelectorAll('#bande .lb-g .carte'), function(x){ return !x.classList.contains('off'); });
              if(l.length){ var x = l[(i * 7) % l.length]; x.dispatchEvent(new Event('pointerdown', {bubbles:true})); x.click(); } }""", i)
            pg.wait_for_timeout(450)
    f = pg.evaluate(FIN)
    m1 = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
    prof = cdp.send('Profiler.stop')['profile'] if PROFIL else None
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    etat = None if SALLE else pg.evaluate("() => { var e = DJ.Leo.etat(); return {phase:e.phase, leo:e.photo.leo.pv, noeuds:document.getElementsByTagName('*').length}; }")
    print('%s, processeur ×%d%s : %.1f images/s sur %.0f s ; pire écart %.0f ms ; en retard : %d (> 34 ms), %d (> 50 ms), %d (> 100 ms) ; longues tâches : %d (%.0f ms en tout) %s' % (
        ('salle ' + SALLE) if SALLE else 'Léo phase %d' % PHASE, TAUX, ' SANS LE SON' if SANS_SON else '', f['n'] / f['sec'], f['sec'], f['pire'], f['l34'], f['l50'], f['l100'], f['longues'], f['tLongues'], etat or ''), flush=True)
    d = lambda k: m1.get(k, 0) - m0.get(k, 0)
    autre = d('TaskDuration') - d('ScriptDuration') - d('LayoutDuration') - d('RecalcStyleDuration')
    print('   le fil principal : %.1f s de travail = le JavaScript %.1f s + les styles %.1f s (%d fois) + la mise en page %.1f s (%d fois) + peindre et poser les calques %.1f s ; %d éléments, mémoire du JavaScript %.0f Mo' % (
        d('TaskDuration'), d('ScriptDuration'), d('RecalcStyleDuration'), d('RecalcStyleCount'), d('LayoutDuration'), d('LayoutCount'), autre, m1.get('Nodes', 0), m1.get('JSHeapUsedSize', 0) / 1e6), flush=True)
    if prof:
        profil_top(prof)
    print('   erreurs :', errs[:3] or 'aucune')
    nav.close()
