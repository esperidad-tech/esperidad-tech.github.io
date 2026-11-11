"""La fluidité et la mémoire des combats du donjon : flock /tmp/brumeval-pw.lock python3 perf.py [salle …] [--taux 4] [--json f]

Pour chaque salle (toutes par défaut), le combat est joué par l'écran, avec le processeur ralenti (×4 par défaut) :
  entree     les héros et les bêtes entrent ;
  repos      3 secondes sans rien toucher (tout le monde respire) ;
  un geste   chaque geste du scénario de la salle (le combo qui ouvre la bête, puis le coup) ;
  monstres   le tour des monstres ;
  repos-2    3 secondes au tour suivant.
Même mesure que la salle d'essai (essai/perf-tablette.py) : les images réellement affichées (DrawFrame du compositeur),
le pire écart entre deux images, et où part le temps du fil principal. Objectifs (RAPIDITE.md) : 55 images/s au repos,
45 pendant les actions.

Puis, en émulation iPhone (844 × 390, densité 3), la mémoire pendant les mêmes gestes (RAPIDITE.md R9) : le plus grand
côté « réel » d'un élément animé (jamais plus de 4 096 px) et les toiles (canvas) encore vivantes."""
import os, re, sys, json
from collections import defaultdict
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
args = sys.argv[1:]
TAUX = 4
SORTIE = None
if '--taux' in args:
    TAUX = int(args[args.index('--taux') + 1]); del args[args.index('--taux'):args.index('--taux') + 2]
if '--json' in args:
    SORTIE = args[args.index('--json') + 1]; del args[args.index('--json'):args.index('--json') + 2]
SANS_MEMOIRE = '--sans-memoire' in args
args = [a for a in args if not a.startswith('--')]
# le scénario de chaque salle : (héros, geste, cible) ; cible None = n'importe quelle bête (un geste sur toute la salle)
SCENARIOS = {
    'rats': ('feu,huile,baume', [('alchimiste', 'p:huile', 'b1'), ('pisteur', 'fleche', 'b1'), ('sage', 'oeil', None)]),
    'canaux': ('colle,feu,baume', [('alchimiste', 'louche', None), ('pisteur', 'dague', 'b2'), ('sage', 'bouclier', 'pisteur')]),
    'toiles': ('fumigene,huile,feu', [('sage', 'rune', 'b1'), ('alchimiste', 'p:fumigene', None), ('pisteur', 'fleche', 'b1')]),
    'atelier': ('acide,feu,baume', [('alchimiste', 'p:acide', 'b2'), ('sage', 'rune', 'b2'), ('pisteur', 'fleche', 'b2')]),
    'crypte': ('colle,feu,baume', [('alchimiste', 'p:colle', 'b1'), ('pisteur', 'dague', 'b1'), ('sage', 'bouclier', 'pisteur')]),
    'ossuaire': ('fumigene,colle,baume', [('alchimiste', 'p:fumigene', None), ('sage', 'bouclier', 'alchimiste'), ('pisteur', 'fleche', 'b2')]),
    'bassin': ('feu,fumigene,baume', [('sage', 'rune', 'b3'), ('alchimiste', 'p:feu', 'b3'), ('pisteur', 'fleche', 'b1')]),
}
SALLES = args or list(SCENARIOS)

# l'analyse des traces : celle de la salle d'essai (CAT, NOM_CAT, analyse)
_src = open(os.path.join(ICI, '..', 'essai', 'perf-tablette.py'), encoding='utf-8').read()
exec(_src[_src.index('CAT = {'):_src.index('def stats_raf')])
RELEVE = re.search(r'RELEVE = """(.*?)"""', open(os.path.join(ICI, '..', 'anim', 'heros', 'memoire.py'), encoding='utf-8').read(), re.S).group(1).replace('\\\\', '\\')


def ouvrir(nav, salle, iphone=False):
    if iphone:
        ctx = nav.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    else:
        ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
    pg.add_init_script("window.AudioContext = undefined; window.webkitAudioContext = undefined; window.OfflineAudioContext = undefined; window.webkitOfflineAudioContext = undefined;")
    return ctx, pg, errs


def libre(pg, s=90):
    pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=s * 1000, polling=200)


def toucher(pg, h, g, cible):
    pg.tap(f'.b-heros[data-id="{h}"]', force=True); pg.wait_for_timeout(250)
    pg.tap(f'.carte[data-id="{g}"]', force=True); pg.wait_for_timeout(250)
    sel = '.zone[data-type="bete"]' if cible is None else ('.zone[data-type="heros"][data-id="%s"]' % cible if cible in ('sage', 'alchimiste', 'pisteur') else '#zone-' + cible)
    return sel


def fluidite(nav, salle):
    sac, gestes = SCENARIOS[salle]
    ctx, pg, errs = ouvrir(nav, salle)
    pg.goto(PAGE + '?combat=' + salle + '&graine=7&sac=' + sac)
    cdp = ctx.new_cdp_session(pg)
    pg.wait_for_function("!!document.querySelector('#passage') || !!document.querySelector('#combat')", timeout=30000)
    if TAUX > 1:
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
    nav.start_tracing(page=pg, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'blink.user_timing', 'toplevel', 'v8.execute'])

    def phase(n):
        pg.evaluate("(n) => performance.mark('ph:' + n)", n)
    phase('entree'); libre(pg, 120); pg.wait_for_timeout(300)
    phase('repos'); pg.wait_for_timeout(3200)
    for h, g, c in gestes:
        try:
            sel = toucher(pg, h, g, c)
            phase(h[:4] + ' ' + g.replace('p:', ''))
            pg.eval_on_selector(sel, 'e => e.click()')
            pg.wait_for_timeout(400)
            pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && (!e.occupe || e.mode === 'monstres' || e.mode === 'fin'); })()", timeout=90000, polling=100)
        except Exception as ex:
            print('   (geste sauté :', h, g, str(ex)[:80], ')')
    if pg.evaluate("() => DJ.Combat.etat().mode") == 'monstres':
        phase('monstres'); libre(pg, 120)
    phase('repos-2'); pg.wait_for_timeout(3000)
    phase('fin')
    trace = json.loads(nav.stop_tracing())
    ctx.close()
    r = analyse(trace.get('traceEvents', trace) if isinstance(trace, dict) else trace)
    r.pop('fin', None)
    return r, errs


def memoire(nav, salle):
    sac, gestes = SCENARIOS[salle]
    ctx, pg, errs = ouvrir(nav, salle, iphone=True)
    pg.goto(PAGE + '?combat=' + salle + '&graine=7&sac=' + sac)
    libre(pg, 120); pg.wait_for_timeout(400)
    pire, toiles = {'px': 0, 'quoi': ''}, 0

    def releve():
        nonlocal pire, toiles
        r = pg.evaluate(RELEVE, 3)
        if r['pire']['px'] > pire['px']:
            pire = r['pire']
        toiles = max(toiles, r['toiles'])
    releve()
    for h, g, c in gestes:
        try:
            sel = toucher(pg, h, g, c)
            pg.eval_on_selector(sel, 'e => e.click()')
            for _ in range(200):
                releve(); pg.wait_for_timeout(70)
                if pg.evaluate("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()"):
                    break
        except Exception as ex:
            print('   (geste sauté :', h, g, str(ex)[:80], ')')
    pg.wait_for_timeout(1500)
    fin = pg.evaluate(RELEVE, 3)['toiles']
    ctx.close()
    return pire, toiles, fin, errs


res = {}
with sync_playwright() as p:
    nav = p.chromium.launch()
    for s in SALLES:
        print('—', s, '(processeur ralenti ×%d)' % TAUX, flush=True)
        try:
            r, errs = fluidite(nav, s)
        except Exception as ex:
            print('   la mesure s\'arrête :', str(ex)[:200]); continue
        res[s] = {'phases': r}
        print('   %-18s | écran : ips  pire  >50 | fil principal : ips  tâche max' % 'phase')
        for ph, v in r.items():
            e = v['ecran']
            print('   %-18s |       %5.1f %5d %4d |                %5.1f %9d' % (ph, e['ips'], e['pire'], e['n50'], v.get('ips_principal', 0), v['tache']), flush=True)
        if errs:
            print('   erreurs :', errs[:3])
        if not SANS_MEMOIRE:
            try:
                pire, toiles, fin, errs2 = memoire(nav, s)
                res[s]['memoire'] = {'calque': pire, 'toiles': toiles, 'toiles_fin': fin}
                print('   iPhone : plus grand calque réel %d px (%s)%s ; toiles %.1f Mo pendant, %.1f Mo après' % (pire['px'], pire['quoi'][:50], '  <-- PLUS DE 4 096' if pire['px'] > 4096 else '', toiles / 1e6, fin / 1e6), flush=True)
            except Exception as ex:
                print('   mémoire : la mesure s\'arrête :', str(ex)[:200])
    nav.close()
if SORTIE:
    json.dump(res, open(SORTIE, 'w'), ensure_ascii=False, indent=1)
