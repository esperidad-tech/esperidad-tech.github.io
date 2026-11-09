"""Fluidité sur une « vieille tablette » (règle de Romain du 9 novembre : « il faut que ce soit vraiment fluide »).

    flock /tmp/brumeval-pw.lock python3 perf-tablette.py                 -> salle-rats.html, processeur ralenti x4 et x6
    flock /tmp/brumeval-pw.lock python3 perf-tablette.py autre.html 4    -> une autre page, seulement x4
    ... --trace   : ajoute le traçage de Chrome (où part le temps : script, style, layout, paint, raster, composite)
    ... --json f  : écrit les mesures dans un fichier (pour comparer avant / après)
    ... --captures DOSSIER : une capture d'écran aux mêmes instants (pour comparer la qualité à l'œil)

Page mobile 1024 x 768, device_scale_factor 2, processeur ralenti (CDP Emulation.setCPUThrottlingRate).
Une boucle requestAnimationFrame note chaque image et la phase en cours ; on en tire, phase par phase :
images par seconde, pire image, nombre d'images > 33 ms et > 50 ms.
Les phases : l'entrée, l'attente (3 héros + 3 rats qui respirent), une potion lancée (Huile : le rat glisse et tombe sur le dos),
une explosion critique (flèche dans le ventre), le Sage qui étudie, le tour des rats (morsures), l'attente avec des cendres,
une flèche simple, une potion de feu (le rat brûle), le nuage du fumigène, le second tour des rats (brûlure), l'attente avec un rat qui brûle.
Toujours sous le verrou : un seul navigateur à la fois sur la machine (2 processeurs)."""
import os, sys, json, time
from collections import defaultdict
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:]]
TRACE = '--trace' in args
SORTIE = None
CAPS = None
if '--json' in args:
    SORTIE = args[args.index('--json') + 1]; del args[args.index('--json'):args.index('--json') + 2]
if '--captures' in args:
    CAPS = args[args.index('--captures') + 1]; del args[args.index('--captures'):args.index('--captures') + 2]
args = [a for a in args if not a.startswith('--')]
PAGE = next((a for a in args if a.endswith('.html')), os.path.join(ICI, 'salle-rats.html'))
TAUX = [int(a) for a in args if a.isdigit()] or [4, 6]
F = 'file://' + os.path.abspath(PAGE)

ENREG = """() => { if(window.__perf) return; var P = window.__perf = {t: [], p: [], phase: 'chargement'};
  function f(t){ P.t.push(t); P.p.push(P.phase); requestAnimationFrame(f); } requestAnimationFrame(f); }"""

# le temps du fil principal, rangé comme dans l'onglet Performance de Chrome
CAT = {
    'script': {'FunctionCall', 'EvaluateScript', 'TimerFire', 'FireAnimationFrame', 'EventDispatch', 'v8.compile', 'v8.compileModule',
               'V8.Execute', 'v8.run', 'v8.callFunction', 'RunMicrotasks', 'MinorGC', 'MajorGC', 'V8.GCScavenger', 'V8.GCFinalizeMC',
               'BlinkGC.AtomicPhase', 'ThreadState::performIdleLazySweep', 'HandlePostMessage', 'XHRReadyStateChange', 'ParseHTML',
               'v8.parseOnBackground', 'V8.GC_MC_BACKGROUND_MARKING', 'FireIdleCallback', 'TimerInstall', 'TimerRemove',
               'RequestAnimationFrame', 'CancelAnimationFrame', 'Animation', 'V8.GCIncrementalMarking', 'V8.GCCompactor'},
    'style': {'UpdateLayoutTree', 'RecalculateStyles', 'ParseAuthorStyleSheet', 'ScheduleStyleRecalculation', 'InvalidateLayout'},
    'layout': {'Layout', 'IntersectionObserverController::computeIntersections', 'ResizeObserver'},
    'paint': {'Paint', 'PaintImage', 'PrePaint', 'PaintSetup', 'Decode Image', 'Decode LazyPixelRef', 'Draw LazyPixelRef', 'Rasterize Paint',
              'GPUTask', 'ImageDecodeTask'},
    'composite': {'CompositeLayers', 'Commit', 'UpdateLayerTree', 'Layerize', 'UpdateLayer', 'ActivateLayerTree', 'DrawFrame',
                  'BeginMainThreadFrame', 'BeginFrame', 'NeedsBeginFrameChanged', 'RequestMainThreadFrame', 'SetLayerTreeId'},
}
NOM_CAT = {n: c for c, s in CAT.items() for n in s}


def analyse_trace(evts, phases):
    """le temps « propre » (self time) de chaque événement du fil principal, rangé par catégorie et par phase ;
    plus le temps de raster (fils CompositorTileWorker) et du fil compositor"""
    noms = {}
    for e in evts:
        if e.get('ph') == 'M' and e.get('name') == 'thread_name':
            noms[(e['pid'], e['tid'])] = e['args'].get('name', '')
    # le processus de la page : celui dont le fil CrRendererMain porte nos marques
    marques = sorted([e for e in evts if e.get('name', '').startswith('ph:') and e.get('ph') in ('R', 'I', 'n', 'i', 'b', 'e')], key=lambda e: e['ts'])
    if not marques:
        return {}
    pid = marques[0]['pid']
    bornes = []   # (ts, phase)
    for m in marques:
        bornes.append((m['ts'], m['name'][3:]))

    def phase_de(ts):
        p = None
        for t, n in bornes:
            if t <= ts:
                p = n
            else:
                break
        return p
    par_fil = defaultdict(list)
    for e in evts:
        if e.get('ph') == 'X' and e.get('pid') == pid and 'dur' in e:
            par_fil[e['tid']].append(e)
    res = defaultdict(lambda: defaultdict(float))
    detail = defaultdict(lambda: defaultdict(float))
    for tid, l in par_fil.items():
        fil = noms.get((pid, tid), '')
        l.sort(key=lambda e: (e['ts'], -e['dur']))
        pile = []
        soi = {}
        for e in l:
            while pile and pile[-1]['ts'] + pile[-1]['dur'] <= e['ts']:
                pile.pop()
            if pile:
                parent = pile[-1]
                soi[id(parent)] = soi.get(id(parent), parent['dur']) - min(e['dur'], parent['ts'] + parent['dur'] - e['ts'])
            pile.append(e)
        for e in l:
            ph = phase_de(e['ts'])
            if ph is None:
                continue
            s = max(0, soi.get(id(e), e['dur'])) / 1000.0
            if fil == 'CrRendererMain':
                c = NOM_CAT.get(e['name'])
                if c is None:
                    if e['name'] in ('ThreadControllerImpl::RunTask', 'RunTask', 'ThreadPool_RunTask', 'TaskGraphRunner::RunTask'):
                        continue
                    c = 'autre'
                res[ph][c] += s
                detail[ph][e['name']] += s
            elif fil.startswith('CompositorTileWorker'):
                if e['name'] in ('RasterTask', 'TaskGraphRunner::RunTask', 'ImageDecodeTask', 'RasterizerTask'):
                    res[ph]['raster'] += s
            elif fil == 'Compositor':
                if e['name'] not in ('ThreadControllerImpl::RunTask', 'RunTask'):
                    res[ph]['fil compositor'] += s
    return {ph: {'cat': dict(v), 'top': sorted(detail[ph].items(), key=lambda x: -x[1])[:8]} for ph, v in res.items()}


def stats(t, p):
    par = defaultdict(list)
    for i in range(1, len(t)):
        if p[i] == p[i - 1]:
            par[p[i]].append((t[i - 1], t[i]))
    out = {}
    for ph, l in par.items():
        dt = [b - a for a, b in l]
        if not dt:
            continue
        duree = l[-1][1] - l[0][0]
        out[ph] = {'ips': round(len(dt) / (duree / 1000.0), 1) if duree else 0, 'pire': round(max(dt)), 'n33': sum(1 for x in dt if x > 33.4),
                   'n50': sum(1 for x in dt if x > 50), 'images': len(dt), 'duree': round(duree)}
    return out


ORDRE_PH = ['entree', 'repos', 'potion-huile', 'critique', 'etude', 'tour-rats', 'repos-cendres', 'fleche', 'potion-feu', 'nuage', 'tour-rats-2', 'repos-feu']


def mesurer(nav, taux):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
    pg.goto(F)
    pg.wait_for_timeout(1500)
    pg.evaluate("() => { var s = 7; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }")
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': taux})
    if TRACE:
        nav.start_tracing(page=pg, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'toplevel', 'v8.execute'])
    pg.evaluate(ENREG)
    caps = []

    def phase(n):
        pg.evaluate("(n) => { window.__perf.phase = n; performance.mark('ph:' + n); }", n)

    def capture(n):
        if CAPS:
            os.makedirs(CAPS, exist_ok=True)
            f = os.path.join(CAPS, f'x{taux}-{n}.png')
            pg.screenshot(path=f)
            caps.append(f)

    def tap(sel):
        pg.tap(sel, force=True)

    def libre(max_s=60):
        pg.wait_for_function("(SALLE.etat.mode === 'qui' && !SALLE.etat.occupe) || !!document.querySelector('#fin')", timeout=max_s * 1000, polling=200)

    def joue(h, g, c, apres=None, caps_ms=()):
        tap(f'.zone[data-type="heros"][data-id="{h}"]'); pg.wait_for_timeout(250)
        tap(f'.carte[data-id="{g}"]'); pg.wait_for_timeout(250)
        phase(apres)
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
    phase('repos'); capture('repos')
    pg.wait_for_timeout(3000)
    joue('alchimiste', 'p:huile', 0, 'potion-huile', [('potion-vol', 1300), ('huile-dos', 3200)])
    libre()
    joue('pisteur', 'fleche', 0, 'critique', [('crit-choc', 470), ('crit-texte', 900), ('crit-brume', 1700)])
    libre()
    joue('sage', 'etudier', 1, 'etude')
    pg.wait_for_function("SALLE.etat.mode === 'rats'", timeout=60000, polling=100)
    phase('tour-rats')
    t0 = time.time()
    pg.wait_for_function("SALLE.etat.mode === 'qui' && !SALLE.etat.occupe", timeout=60000, polling=200)
    phase('repos-cendres'); capture('repos-cendres')
    pg.wait_for_timeout(3000)
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
    phase('repos-feu'); capture('repos-feu')
    pg.wait_for_timeout(3000)
    joue('alchimiste', 'p:fumigene', 1, 'nuage', [('nuage', 1800)])
    libre()
    phase('fin')
    pg.wait_for_timeout(300)
    d = pg.evaluate("() => ({t: window.__perf.t, p: window.__perf.p, dom: document.getElementsByTagName('*').length})")
    st = stats(d['t'], d['p'])
    tr = {}
    if TRACE:
        brut = nav.stop_tracing()
        tr = analyse_trace(json.loads(brut).get('traceEvents', []), st)
    ctx.close()
    return st, tr, erreurs, d['dom']


def tableau(res):
    for taux, (st, tr, err, dom) in res.items():
        print(f'\n=== processeur ralenti x{taux}   (éléments DOM à la fin : {dom}){"   ERREURS : " + str(err[:3]) if err else ""}')
        print(f'{"phase":16} {"ips":>6} {"pire":>6} {">33ms":>6} {">50ms":>6} {"images":>7}   ' + ('temps du fil principal (ms) : script / style / layout / paint / composite / autre   + raster, fil compositor' if tr else ''))
        for ph in ORDRE_PH:
            if ph not in st:
                continue
            s = st[ph]
            l = f'{ph:16} {s["ips"]:6} {s["pire"]:6} {s["n33"]:6} {s["n50"]:6} {s["images"]:7}'
            if ph in tr:
                c = tr[ph]['cat']
                l += '   ' + ' / '.join(f'{c.get(k, 0):.0f}' for k in ['script', 'style', 'layout', 'paint', 'composite', 'autre']) + f'   + {c.get("raster", 0):.0f}, {c.get("fil compositor", 0):.0f}'
            print(l)
        if tr:
            print('  les plus gros postes du fil principal :')
            for ph in ORDRE_PH:
                if ph in tr:
                    print(f'   {ph:16} ' + ', '.join(f'{n} {v:.0f}' for n, v in tr[ph]['top'][:6]))


if __name__ == '__main__':
    res = {}
    with sync_playwright() as p:
        nav = p.chromium.launch()
        for taux in TAUX:
            res[taux] = mesurer(nav, taux)
        nav.close()
    tableau(res)
    if SORTIE:
        with open(SORTIE, 'w') as f:
            json.dump({str(k): {'stats': v[0], 'trace': v[1], 'erreurs': v[2], 'dom': v[3]} for k, v in res.items()}, f, indent=1, ensure_ascii=False)
