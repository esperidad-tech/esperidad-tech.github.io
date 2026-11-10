"""Fluidité sur une « vieille tablette » (Romain, 9 novembre : « il faut que ce soit vraiment fluide ») — voir jeu/donjon/RAPIDITE.md.

    flock /tmp/brumeval-pw.lock python3 perf-tablette.py                     -> salle-rats.html, processeur ralenti x4 et x6
    flock /tmp/brumeval-pw.lock python3 perf-tablette.py autre.html 4        -> une autre page, seulement x4
    ... --json f        : écrit les mesures dans un fichier (pour comparer avant / après)
    ... --captures DOS  : des captures aux mêmes instants (processeur normal), pour comparer la qualité à l'œil
    ... --raf           : mesure aussi au requestAnimationFrame (attention : cette boucle force une image du fil principal
                          à chaque rafraîchissement : c'est le pire cas, pour une scène que la carte graphique joue seule)
    ... --avec-son      : garde l'audio (par défaut il est coupé, pour mesurer le graphisme seul)

Page mobile 1024 x 768, device_scale_factor 2, processeur ralenti (CDP Emulation.setCPUThrottlingRate), traçage de Chrome.
Pour chaque phase, on mesure :
  - « écran » : les images réellement affichées (DrawFrame du compositeur) : images par seconde, pire écart entre deux
    images, nombre d'écarts > 33 ms et > 50 ms. C'est ce que l'œil voit.
  - « fil principal » : les images du fil principal (Commit) par seconde et sa plus longue tâche (un geste qui attend).
  - où part le temps du fil principal (ms) : script / style / layout / paint / composite (+ raster sur les fils de tuiles).
Les phases : l'entrée, l'attente (3 héros + 3 rats qui respirent), une potion lancée (Huile : le rat glisse et tombe sur
le dos), une explosion critique, le Sage qui étudie, le tour des rats, l'attente avec des cendres, une flèche simple, une
potion de feu (le rat brûle), le second tour des rats (brûlure), l'attente avec un rat qui brûle, le nuage du fumigène.
Toujours sous le verrou : un seul navigateur à la fois sur la machine (2 processeurs)."""
import os, sys, json, time
from collections import defaultdict
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
SORTIE = CAPS = None
if '--json' in args:
    SORTIE = args[args.index('--json') + 1]; del args[args.index('--json'):args.index('--json') + 2]
if '--captures' in args:
    CAPS = args[args.index('--captures') + 1]; del args[args.index('--captures'):args.index('--captures') + 2]
RAF = '--raf' in args
SON = '--avec-son' in args      # par défaut, l'audio est coupé : on mesure le graphisme seul (le son a sa propre mesure)
args = [a for a in args if not a.startswith('--')]
PAGE = next((a for a in args if a.endswith('.html')), os.path.join(ICI, 'salle-rats.html'))
TAUX = [int(a) for a in args if a.isdigit()] or [4, 6]
F = 'file://' + os.path.abspath(PAGE)

ENREG = """() => { if(window.__perf) return; var P = window.__perf = {t: [], p: [], phase: 'chargement'};
  function f(t){ P.t.push(t); P.p.push(P.phase); requestAnimationFrame(f); } requestAnimationFrame(f); }"""
CAT = {
    'script': {'FunctionCall', 'EvaluateScript', 'TimerFire', 'FireAnimationFrame', 'EventDispatch', 'v8.compile', 'V8.Execute', 'v8.run',
               'v8.callFunction', 'RunMicrotasks', 'MinorGC', 'MajorGC', 'V8.GCScavenger', 'V8.GCFinalizeMC', 'BlinkGC.AtomicPhase',
               'HandlePostMessage', 'ParseHTML', 'FireIdleCallback', 'TimerInstall', 'TimerRemove', 'RequestAnimationFrame', 'Animation'},
    'style': {'UpdateLayoutTree', 'RecalculateStyles', 'ParseAuthorStyleSheet', 'ScheduleStyleRecalculation'},
    'layout': {'Layout', 'IntersectionObserverController::computeIntersections'},
    'paint': {'Paint', 'PaintImage', 'PrePaint', 'Decode Image', 'Decode LazyPixelRef', 'Rasterize Paint'},
    'composite': {'CompositeLayers', 'Commit', 'UpdateLayerTree', 'Layerize', 'UpdateLayer'},
}
NOM_CAT = {n: c for c, s in CAT.items() for n in s}
ORDRE_PH = ['entree', 'repos', 'potion-huile', 'critique', 'etude', 'tour-rats', 'repos-cendres', 'fleche', 'potion-feu', 'tour-rats-2', 'repos-feu', 'nuage']


def analyse(evts):
    noms = {}
    for e in evts:
        if e.get('ph') == 'M' and e.get('name') == 'thread_name':
            noms[(e['pid'], e['tid'])] = e['args'].get('name', '')
    marques = sorted([e for e in evts if e.get('name', '').startswith('ph:')], key=lambda e: e['ts'])
    if not marques:
        return {}
    pid = marques[0]['pid']
    bornes = [(m['ts'], m['name'][3:]) for m in marques]

    def phase_de(ts):
        p = None
        for t, n in bornes:
            if t <= ts: p = n
            else: break
        return p
    fil = {tid: noms.get((pid, tid), '') for (p, tid) in noms if p == pid}
    res = defaultdict(lambda: {'cat': defaultdict(float), 'top': defaultdict(float), 'draw': [], 'commit': 0, 'tache': 0.0})
    par_fil = defaultdict(list)
    for e in evts:
        if e.get('pid') != pid:
            continue
        f = fil.get(e.get('tid'), '')
        if e.get('name') == 'DrawFrame' and f == 'Compositor':
            ph = phase_de(e['ts'])
            if ph: res[ph]['draw'].append(e['ts'] / 1000)
        if e.get('ph') == 'X' and 'dur' in e:
            par_fil[e['tid']].append(e)
    for tid, l in par_fil.items():
        f = fil.get(tid, '')
        l.sort(key=lambda e: (e['ts'], -e['dur']))
        pile, soi = [], {}
        for e in l:
            while pile and pile[-1]['ts'] + pile[-1]['dur'] <= e['ts']:
                pile.pop()
            if pile:
                pa = pile[-1]
                soi[id(pa)] = soi.get(id(pa), pa['dur']) - min(e['dur'], pa['ts'] + pa['dur'] - e['ts'])
            pile.append(e)
        for e in l:
            ph = phase_de(e['ts'])
            if ph is None:
                continue
            s = max(0, soi.get(id(e), e['dur'])) / 1000.0
            R = res[ph]
            if f == 'CrRendererMain':
                if e['name'] == 'Commit':
                    R['commit'] += 1
                if e['name'] in ('ThreadControllerImpl::RunTask', 'RunTask'):
                    R['tache'] = max(R['tache'], e['dur'] / 1000.0)
                    continue
                c = NOM_CAT.get(e['name'], 'autre')
                R['cat'][c] += s
                R['top'][e['name']] += s
            elif f.startswith('CompositorTileWorker') and e['name'] in ('RasterTask', 'TaskGraphRunner::RunTask', 'ImageDecodeTask'):
                R['cat']['raster'] += s
    out = {}
    for ph, R in res.items():
        d = sorted(R['draw'])
        dt = [b - a for a, b in zip(d, d[1:])]
        duree = (d[-1] - d[0]) if len(d) > 1 else 0
        ecran = {'ips': round(len(dt) / (duree / 1000.0), 1) if duree else 0, 'pire': round(max(dt)) if dt else 0,
                 'n33': sum(1 for x in dt if x > 33.4), 'n50': sum(1 for x in dt if x > 50), 'images': len(dt)}
        out[ph] = {'ecran': ecran, 'commits': R['commit'], 'tache': round(R['tache']), 'cat': {k: round(v) for k, v in R['cat'].items()},
                   'top': sorted(((k, round(v)) for k, v in R['top'].items()), key=lambda x: -x[1])[:6]}
    # la durée de chaque phase (pour les commits par seconde)
    for i, (t, n) in enumerate(bornes):
        if n in out:
            fin = bornes[i + 1][0] if i + 1 < len(bornes) else t
            out[n]['duree'] = round((fin - t) / 1000)
            out[n]['ips_principal'] = round(out[n]['commits'] / max(.001, (fin - t) / 1e6), 1)
    return out


def stats_raf(t, p):
    par = defaultdict(list)
    for i in range(1, len(t)):
        if p[i] == p[i - 1]:
            par[p[i]].append(t[i] - t[i - 1])
    return {ph: {'ips': round(len(dt) / (sum(dt) / 1000.0), 1), 'pire': round(max(dt)), 'n33': sum(1 for x in dt if x > 33.4), 'n50': sum(1 for x in dt if x > 50)}
            for ph, dt in par.items() if dt}


def mesurer(nav, taux, captures=False):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
    if not SON:
        pg.add_init_script("window.AudioContext = undefined; window.webkitAudioContext = undefined; window.OfflineAudioContext = undefined; window.webkitOfflineAudioContext = undefined;")
    pg.goto(F)
    pg.wait_for_timeout(3000)            # la cuisson des acteurs se fait pendant l'écran du sac
    pg.evaluate("() => { var s = 7; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }")
    cdp = ctx.new_cdp_session(pg)
    if taux > 1:
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': taux})
    if not captures:
        nav.start_tracing(page=pg, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'blink.user_timing', 'toplevel', 'v8.execute'])
    if RAF and not captures:
        pg.evaluate(ENREG)

    def phase(n):
        pg.evaluate("(n) => { if(window.__perf) window.__perf.phase = n; performance.mark('ph:' + n); }", n)

    def capture(n):
        if captures:
            os.makedirs(CAPS, exist_ok=True)
            pg.screenshot(path=os.path.join(CAPS, n + '.png'))

    def tap(sel):
        pg.tap(sel, force=True)

    def libre(max_s=60):
        pg.wait_for_function("(SALLE.etat.mode === 'qui' && !SALLE.etat.occupe) || !!document.querySelector('#fin')", timeout=max_s * 1000, polling=200)

    def joue(h, g, c, ph, caps_ms=()):
        tap(f'.zone[data-type="heros"][data-id="{h}"]'); pg.wait_for_timeout(250)
        tap(f'.carte[data-id="{g}"]'); pg.wait_for_timeout(250)
        phase(ph)
        tap(f'.zone[data-type="rat"][data-id="{c}"]' if isinstance(c, int) else f'.zone[data-type="heros"][data-id="{c}"]')
        t0 = time.time()
        for n, ms in caps_ms:
            reste = ms / 1000 - (time.time() - t0)
            if reste > 0:
                pg.wait_for_timeout(reste * 1000)
            capture(n)

    for r in ['huile', 'feu', 'fumigene']:
        tap(f'.recette[data-id="{r}"] b'); pg.wait_for_timeout(150)
    phase('entree')
    tap('[data-act="descendre"]')
    libre()
    pg.wait_for_timeout(300)
    phase('repos'); pg.wait_for_timeout(1500); capture('repos')
    pg.wait_for_timeout(2000)
    joue('alchimiste', 'p:huile', 0, 'potion-huile', [('potion-vol', 1300), ('huile-dos', 3200)])
    libre()
    joue('pisteur', 'fleche', 0, 'critique', [('crit-choc', 470), ('crit-texte', 900), ('crit-brume', 1700)])
    libre()
    joue('sage', 'etudier', 1, 'etude')
    pg.wait_for_function("SALLE.etat.mode === 'rats'", timeout=60000, polling=100)
    phase('tour-rats')
    pg.wait_for_function("SALLE.etat.mode === 'qui' && !SALLE.etat.occupe", timeout=60000, polling=200)
    phase('repos-cendres'); pg.wait_for_timeout(1500); capture('repos-cendres')
    pg.wait_for_timeout(1500)
    pg.evaluate("() => { window.__h = SALLE.hasard; SALLE.hasard = () => .99; }")   # pas de flèche surprise
    joue('pisteur', 'fleche', 1, 'fleche', [('fleche', 1450)])
    libre()
    pg.evaluate("() => { SALLE.hasard = window.__h; }")
    joue('alchimiste', 'p:feu', 2, 'potion-feu', [('feu', 2600)])
    libre()
    phase('attente-sage')
    tap('.zone[data-type="heros"][data-id="sage"]'); pg.wait_for_timeout(250)
    tap('.carte[data-id="bouclier"]'); pg.wait_for_timeout(250)
    tap('.zone[data-type="heros"][data-id="pisteur"]')
    pg.wait_for_function("SALLE.etat.mode === 'rats'", timeout=60000, polling=100)
    phase('tour-rats-2')
    pg.wait_for_function("SALLE.etat.mode === 'qui' && !SALLE.etat.occupe", timeout=60000, polling=200)
    phase('repos-feu'); pg.wait_for_timeout(1500); capture('repos-feu')
    pg.wait_for_timeout(1500)
    joue('alchimiste', 'p:fumigene', 1, 'nuage', [('nuage', 1800)])
    libre()
    phase('fin')
    pg.wait_for_timeout(300)
    r = {}
    if not captures:
        r = analyse(json.loads(nav.stop_tracing()).get('traceEvents', []))
        if RAF:
            d = pg.evaluate("() => ({t: window.__perf.t, p: window.__perf.p})")
            for ph, s in stats_raf(d['t'], d['p']).items():
                if ph in r: r[ph]['raf'] = s
    ctx.close()
    return r, erreurs


def tableau(res):
    for taux, (st, err) in res.items():
        print(f'\n=== processeur ralenti x{taux}{"   ERREURS : " + str(err[:3]) if err else ""}')
        print(f'{"phase":14} | {"écran : ips":>11} {"pire":>5} {">33":>4} {">50":>4} | {"fil princ.: ips":>15} {"tâche max":>9} | ms : script / style / layout / paint / composite / autre + raster' + ('   | raf ips pire' if RAF else ''))
        for ph in ORDRE_PH:
            if ph not in st:
                continue
            s = st[ph]; e = s['ecran']; c = s['cat']
            l = f'{ph:14} | {e["ips"]:11} {e["pire"]:5} {e["n33"]:4} {e["n50"]:4} | {s.get("ips_principal", 0):15} {s["tache"]:9} | ' + ' / '.join(str(c.get(k, 0)) for k in ['script', 'style', 'layout', 'paint', 'composite', 'autre']) + f' + {c.get("raster", 0)}'
            if RAF and 'raf' in s:
                l += f'   | {s["raf"]["ips"]} {s["raf"]["pire"]}'
            print(l)


if __name__ == '__main__':
    res = {}
    with sync_playwright() as p:
        nav = p.chromium.launch()
        if CAPS:
            mesurer(nav, 1, captures=True)
        for taux in TAUX:
            res[taux] = mesurer(nav, taux)
        nav.close()
    tableau(res)
    if SORTIE:
        with open(SORTIE, 'w') as f:
            json.dump({str(k): {'phases': v[0], 'erreurs': v[1]} for k, v in res.items()}, f, indent=1, ensure_ascii=False)
