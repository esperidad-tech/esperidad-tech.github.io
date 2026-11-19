"""Ce que coûte un critique qui tue, à l'instant du coup, bête par bête (19 novembre, Bible §13.82 : « fais attention aux FPS »).

    flock /tmp/brumeval-pw.lock python3 cout-critique.py [--taux 4] [--build DOSSIER]

Dans un vrai combat, processeur ralenti (×4 par défaut : une vieille tablette), on fait éclater chaque bête (acteur.exploser)
et on mesure, en millisecondes depuis l'appel :
  - « pose du BOUM » : le temps que le module met à poser son explosion (le travail du fil principal à l'instant du coup —
    c'est le retard entre le coup de dague et la fumée) ;
  - « 1re image » : quand l'écran a montré la première image d'après ;
  - « fumée partie » : quand la Promise de exploser() se termine (c'est ce que le combat attend pour reprendre).
Mesuré le 19 novembre, ×4 — avant : 527 à 1 044 ms jusqu'au BOUM (la bête enflait), la fumée partie à 3,9 – 6,5 s ;
après : 30 à 130 ms (la mesure bouge d'un essai à l'autre), la fumée partie à 1,0 – 1,9 s. Le rat : 75 ms de travail avant,
50 environ après (plus de gonflement à fabriquer).
--build : un autre donjon construit que sortie/ (pour comparer avec une version d'avant)."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
TAUX = int(args[args.index('--taux') + 1]) if '--taux' in args else 4
BUILD = args[args.index('--build') + 1] if '--build' in args else os.path.join(ICI, 'sortie')
PAGE = 'file://' + os.path.join(BUILD, 'index.html')
SALLES = [('rats', 'feu,huile,baume'), ('crypte', 'colle,feu,baume'), ('toiles', 'fumigene,huile,feu'), ('atelier', 'acide,feu,baume'), ('ossuaire', 'fumigene,colle,baume'), ('bassin', 'feu,fumigene,baume')]
LIBRE = "(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()"
MESURE = """async () => {
  var E = DJ.Combat._E(), res = [], fx = document.querySelector('#fx');
  var ids = Object.keys(E.A.b);
  for(var k = 0; k < ids.length; k++){
    var a = E.A.b[ids[k]]; if(!a || a.mort) continue;
    await new Promise(function(ok){ requestAnimationFrame(function(){ setTimeout(ok, 350); }); });
    var t0 = performance.now(), p;
    try{ p = a.acteur.exploser(fx, a.rat ? {impact:0, eclat:0, leger:!!SALLE.critLeger} : undefined); }catch(e){ res.push([a.module, 'ERREUR ' + e.message]); continue; }
    a.mort = true;
    await Promise.resolve(p && p.boom); await null; await null;
    var t1 = performance.now();
    await new Promise(function(ok){ requestAnimationFrame(function(){ requestAnimationFrame(ok); }); });
    var t2 = performance.now();
    var fin = await Promise.race([Promise.resolve(p).then(function(){ return performance.now(); }), new Promise(function(ok){ setTimeout(function(){ ok(-1); }, 8000); })]);
    res.push([a.module, Math.round(t1 - t0), Math.round(t2 - t0), fin < 0 ? -1 : Math.round(fin - t0)]);
  }
  return res;
}"""
ERREURS = []
with sync_playwright() as p:
    nav = p.chromium.launch()
    vus = {}
    print('— le critique qui tue, à l\'instant du coup (processeur ralenti ×%d)' % TAUX, flush=True)
    for salle, sac in SALLES:
        ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        pg.add_init_script("window.AudioContext = undefined; window.webkitAudioContext = undefined; window.OfflineAudioContext = undefined; window.webkitOfflineAudioContext = undefined;")
        pg.goto(PAGE + '?combat=' + salle + '&graine=7&sac=' + sac)
        pg.wait_for_function(LIBRE, timeout=120000, polling=200); pg.wait_for_timeout(600)
        cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
        for r in pg.evaluate(MESURE):
            if r[0] in vus:
                continue
            vus[r[0]] = r
            if len(r) < 4:
                ERREURS.append(r); print('  %-15s %s' % (r[0], r[1]), flush=True); continue
            print('  %-15s pose du BOUM : %4d ms | 1re image : %4d ms | fumée partie : %5d ms' % (r[0], r[1], r[2], r[3]), flush=True)
        ERREURS += errs
        ctx.close()
    nav.close()
if ERREURS:
    print('ERREURS :', ERREURS[:4])
sys.exit(1 if ERREURS else 0)
