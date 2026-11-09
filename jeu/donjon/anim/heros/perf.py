"""Fluidité des NOUVELLES animations des héros (armes, objets, réactions) sur une « vieille tablette » — voir jeu/donjon/RAPIDITE.md.

    flock /tmp/brumeval-pw.lock python3 perf.py            -> processeur ralenti x6
    flock /tmp/brumeval-pw.lock python3 perf.py 4 6        -> x4 puis x6
    ... --json f        : écrit les mesures dans un fichier
    ... --filtre mot    : seulement les moments dont le nom contient « mot »

demo.html?film (les héros sont « cuits » comme dans le jeu), page mobile 1024 x 768, device_scale_factor 2, processeur
ralenti (CDP), traçage de Chrome. Pour chaque moment, comme essai/perf-tablette.py :
  - « écran » : les images vraiment affichées (DrawFrame du compositeur) par seconde, et la pire attente entre deux ;
  - « fil principal » : ses images par seconde (Commit) et sa plus longue tâche.
Objectif (RAPIDITE.md) : >= 45 images/s « écran » pendant les actions, >= 55 au repos.
Attention : sur la machine de test (sans carte graphique), le compositeur est simulé par le processeur : les gros effets
plein écran (l'éclair de lune) y sont pessimistes."""
import os, sys, json
from collections import defaultdict
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
SORTIE = FILTRE = None
if '--json' in args:
    SORTIE = args[args.index('--json') + 1]; del args[args.index('--json'):args.index('--json') + 2]
if '--filtre' in args:
    FILTRE = args[args.index('--filtre') + 1]; del args[args.index('--filtre'):args.index('--filtre') + 2]
TAUX = [int(a) for a in args if a.isdigit()] or [6]

# (nom, code JS qui renvoie une promesse, attente après en ms) ; les noms en « _ » ne sont pas affichés (préparations)
MOMENTS = [
    ('_prepare', "(DEMO.equipe('pisteur','carquois-argent'), DEMO.equipe('alchimiste','sacoche'), DEMO.equipe('sage','cristal-lune'), ['pisteur','alchimiste','sage'].forEach(r => DEMO.h[r].equiper('amulette', true, {discret:true})), new Promise(s => setTimeout(s, 1500)))", 300),
    ('repos (équipés)', "new Promise(s => setTimeout(s, 3000))", 0),
    ('flèche d\'argent', "DEMO.go('pisteur','tirer','argent')", 500),
    ('_lourd', "DEMO.equipe('pisteur','carquois-lourd')", 300),
    ('flèche lourde (métal)', "DEMO.go('pisteur','tirer','lourde',{metal:true})", 500),
    ('flèche lourde (bois)', "DEMO.go('pisteur','tirer','lourde')", 500),
    ('flèche de givre', "DEMO.go('pisteur','tirer','givre')", 500),
    ('flèche d\'acide', "DEMO.go('pisteur','tirer','acide')", 500),
    ('flèche qui rebondit', "DEMO.go('pisteur','tirer','normale',{rebond:true, metal:true})", 900),
    ('potion de givre', "DEMO.potion('givre')", 700),
    ('potion d\'acide', "DEMO.potion('acide')", 900),
    ('potion d\'huile', "DEMO.potion('huile')", 700),
    ('potion de colle', "DEMO.potion('colle')", 700),
    ('éclair de lune (salle)', "DEMO.go('sage','eclair')", 600),
    ('_chene', "DEMO.equipe('sage','baton-chene')", 300),
    ('double bouclier', "DEMO.go('sage','double')", 400),
    ('repos, deux dômes', "new Promise(s => setTimeout(s, 2500))", 0),
    ('dômes retirés', "DEMO.retirer()", 500),
    ('brûlure froide', "DEMO.go('alchimiste','touche','froid')", 400),
    ('grouillement', "DEMO.go('pisteur','touche','grouillement')", 400),
    ('poing du Gardien', "DEMO.go('sage','touche','poing')", 400),
    ('pris dans la toile', "DEMO.go('alchimiste','entoile',true)", 0),
    ('repos, dans la toile', "new Promise(s => setTimeout(s, 3000))", 0),
    ('déchire la toile', "DEMO.go('alchimiste','entoile',false)", 400),
    ('avalé par Bourbe', "DEMO.go('pisteur','avale')", 300),
    ('recraché (bave)', "DEMO.go('pisteur','recrache')", 500),
    ('_tombe', "DEMO.go('sage','tomber').then(() => new Promise(s => setTimeout(s, 800)))", 0),
    ('relève dorée (amulette)', "DEMO.go('sage','relever',{amulette:true})", 500),
    ('repos final', "new Promise(s => setTimeout(s, 3000))", 0),
]


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
    res = defaultdict(lambda: {'draw': [], 'commit': 0, 'tache': 0.0})
    for e in evts:
        if e.get('pid') != pid:
            continue
        f = fil.get(e.get('tid'), '')
        ph = phase_de(e['ts'])
        if ph is None:
            continue
        if e.get('name') == 'DrawFrame' and f == 'Compositor':
            res[ph]['draw'].append(e['ts'] / 1000)
        if f == 'CrRendererMain' and e.get('ph') == 'X':
            if e.get('name') == 'Commit':
                res[ph]['commit'] += 1
            if e.get('name') in ('ThreadControllerImpl::RunTask', 'RunTask'):
                res[ph]['tache'] = max(res[ph]['tache'], e.get('dur', 0) / 1000.0)
    out = {}
    for i, (t, n) in enumerate(bornes):
        if n not in res:
            continue
        R = res[n]
        d = sorted(R['draw'])
        dt = [b - a for a, b in zip(d, d[1:])]
        duree = (d[-1] - d[0]) if len(d) > 1 else 0
        fin = bornes[i + 1][0] if i + 1 < len(bornes) else t
        out[n] = {'ips': round(len(dt) / (duree / 1000.0), 1) if duree else 0, 'pire': round(max(dt)) if dt else 0,
                  'n50': sum(1 for x in dt if x > 50), 'principal': round(R['commit'] / max(.001, (fin - t) / 1e6), 1), 'tache': round(R['tache'])}
    return out


def mesurer(nav, taux):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
    pg = ctx.new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film')
    pg.wait_for_function('window.PRET', timeout=60000)
    pg.wait_for_timeout(1500)
    cdp = ctx.new_cdp_session(pg)
    if taux > 1:
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': taux})
    nav.start_tracing(page=pg, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'blink.user_timing', 'toplevel'])
    for nom, js, apres in MOMENTS:
        if FILTRE and not nom.startswith('_') and FILTRE not in nom:
            continue
        pg.evaluate("(n) => performance.mark('ph:' + n)", nom)
        pg.evaluate("() => { window.__ok = false; Promise.resolve(" + js + ").then(() => { window.__ok = true; }, (e) => { console.error(e && e.stack || e); window.__ok = true; }); }")
        pg.wait_for_function('window.__ok', timeout=90000, polling=250)
        if apres:
            pg.wait_for_timeout(apres)
    pg.evaluate("() => performance.mark('ph:_fin')")
    pg.wait_for_timeout(200)
    r = analyse(json.loads(nav.stop_tracing()).get('traceEvents', []))
    ctx.close()
    return r, err


if __name__ == '__main__':
    tout = {}
    with sync_playwright() as p:
        nav = p.chromium.launch()
        for taux in TAUX:
            r, err = mesurer(nav, taux)
            tout[taux] = {'moments': r, 'erreurs': err}
            print(f'\n=== processeur ralenti x{taux}' + (f'   ERREURS : {err[:3]}' if err else ''))
            print(f'{"moment":26} | {"écran ips":>9} {"pire":>5} {">50":>4} | {"fil princ. ips":>14} {"tâche max":>9}')
            for nom, _, _ in MOMENTS:
                if nom.startswith('_') or nom not in r:
                    continue
                s = r[nom]
                print(f'{nom:26} | {s["ips"]:9} {s["pire"]:5} {s["n50"]:4} | {s["principal"]:14} {s["tache"]:9}' + ('   <-- sous 45' if s['ips'] < 45 else ''))
        nav.close()
    if SORTIE:
        with open(SORTIE, 'w') as f:
            json.dump(tout, f, indent=1, ensure_ascii=False)
