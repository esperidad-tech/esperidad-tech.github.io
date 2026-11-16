"""Les À-COUPS du combat de Léo, sort par sort : flock /tmp/brumeval-pw.lock python3 sautes-leo.py [phase] [--taux 6] [--fois 2] [--ecran 1024x768x2] [--froid] [--seul <mot>]

Romain, 15 novembre, 19 h 28 : « il y a encore des sorts qui font des sautes de FPS. Il faut bien vérifier qu'il n'y a pas de sort
qui fasse des sautes de FPS. » perf-leo.py donne des MOYENNES ; ce robot-ci cherche les IMAGES TROP LONGUES, geste par geste :
  A. chaque icône des héros, une par une, Léo tenu au repos (le calme juste avant sert de témoin) ;
  B. chaque attaque de Léo, seule ;
  C. les enchaînements qu'on joue vraiment (la parade pendant l'attaque : l'huile sous la charge, le marteau sur le cri…).
Pour chaque morceau : les images par seconde, L'IMAGE LA PLUS LONGUE (en millisecondes), le nombre d'images de plus de 100 ms,
et LES SONS FABRIQUÉS EN DIRECT pendant ce temps (un son qui n'a pas été fabriqué à l'avance coûte du temps au fil de l'écran).
--froid : en plus, les vingt premières secondes d'une phase ouverte « à froid » (ce qui se fabrique encore en fond).
--seul <mot> : seulement les morceaux dont le nom contient ce mot.  DOSSIER=<un donjon construit> : pour comparer deux versions.
Le processeur est ralenti (×6 par défaut : une vieille tablette). La machine d'essai change de vitesse d'une heure à l'autre :
seules deux mesures faites AU MÊME MOMENT se comparent (RAPIDITE.md, R15)."""
import os, sys, json, time
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.environ.get('DOSSIER') or os.path.join(ICI, 'sortie'), 'index.html')
args = sys.argv[1:]


def opt(nom, defaut, typ=int):
    if nom in args:
        i = args.index(nom); v = typ(args[i + 1]); del args[i:i + 2]; return v
    return defaut


TAUX = opt('--taux', 6); FOIS = opt('--fois', 2); ECRAN = opt('--ecran', '1024x768x2', str); SEUL = opt('--seul', None, str)
FROID = '--froid' in args; QUE_FROID = '--que-froid' in args
args = [a for a in args if not a.startswith('--')]
PHASE = int(args[0]) if args else 3
SEUIL = 100                                   # une image de plus de 100 ms (processeur ×6) = un à-coup qu'on voit

SONDE = """() => { if(window.__S) return; var S = window.__S = {images:[], sons:[], longues:[]}, d = 0;
  function image(t){ if(d) S.images.push([t, t - d]); d = t; requestAnimationFrame(image); } requestAnimationFrame(image);
  try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ S.longues.push([e.startTime, e.duration]); }); }).observe({entryTypes:['longtask']}); }catch(e){}
  /* chaque son fabriqué EN DIRECT (pas pour une fabrication à l'avance) : son nom, et le temps passé à le construire */
  var B = window.BRUITAGES || {};
  Object.keys(B).forEach(function(k){ var f = B[k]; if(typeof f !== 'function') return;
    var g = function(A){ var t0 = performance.now(), r = f.apply(this, arguments); if(A && !A.horsLigne) S.sons.push([t0, k, performance.now() - t0]); return r; };
    for(var x in f) g[x] = f[x]; B[k] = g; });
  /* (les petits sons d'avant l'Atelier — DJ.son — sont toujours faits en direct : on les compte aussi, avec un « ~ ») */
  try{ var vieux = DJ.son; DJ.son = function(n){ var t0 = performance.now(), r = vieux.apply(this, arguments), d = performance.now() - t0; if(d >= 3) S.sons.push([t0, '~' + n, d]); return r; }; }catch(e){}
  S.bilan = function(t0, t1){ var l = S.images.filter(function(i){ return i[0] > t0 && i[0] <= t1; }), d = l.map(function(i){ return i[1]; }), tot = d.reduce(function(a, b){ return a + b; }, 0);
    var tri = d.slice().sort(function(a, b){ return a - b; });
    return {n:d.length, ips:d.length ? 1000 * d.length / tot : 0, pire:d.length ? tri[tri.length - 1] : 0, med:d.length ? tri[Math.floor(d.length / 2)] : 0,
      gros:d.filter(function(x){ return x > %d; }).length, quand:l.filter(function(i){ return i[1] > %d; }).map(function(i){ return [Math.round(i[0] - t0), Math.round(i[1])]; }).slice(0, 6),
      sons:S.sons.filter(function(s){ return s[0] >= t0 - 30 && s[0] <= t1; }).map(function(s){ return [s[1], Math.round(s[2]), Math.round(s[0] - t0)]; }),
      longues:S.longues.filter(function(s){ return s[0] + s[1] >= t0 && s[0] <= t1; }).map(function(s){ return Math.round(s[1]); }).sort(function(a, b){ return b - a; }).slice(0, 4)}; };
}""" % (SEUIL, SEUIL)

# Léo tenu au repos / relâché ; les héros remis d'aplomb
TENIR = "() => { var c = DJ.Leo._E().c; if(c.leo.etape === 'repos'){ c.leo.fin = c.leo.tl + 1e6; return true; } return false; }"
ETAT = """(o) => { var E = DJ.Leo._E(), c = E.c; o = o || {};
  ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; if(S.sol && !o.garderSol){ S.sol = false; }
    if(!S.sol){ S.pv = Math.round(S.pvMax * (o.vie == null ? 1 : o.vie)); } if(!o.garderEtats){ S.brule = 0; S.saigne = false; S.etourdi = 0; S.bouclier = null; } });
  Object.keys(c.armes || {}).forEach(function(a){ if(c.armes[a] != null && c.armes[a] < 3) c.armes[a] = 3; });
  if(c.leo.pv < 1500 && c.phase === 3) c.leo.pv = 2600; if(c.phase < 3){ var PH = LeoRegles.L.PHASES[c.phase]; if(c.leo.pv < PH.a + 1200) c.leo.pv = PH.de - 200; } }"""


def attendre(pg, js, sec=40, arg=None):
    fin = time.time() + sec
    while time.time() < fin:
        if pg.evaluate(js, arg): return True
        time.sleep(.08)
    return False


def ouvrir(nav, phase):
    w, h, d = [float(x) for x in ECRAN.split('x')]
    ctx = nav.new_context(viewport={'width': int(w), 'height': int(h)}, device_scale_factor=d, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:160]) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
    cdp = ctx.new_cdp_session(pg)
    pg.goto(PAGE + '?leo=%d&graine=7' % phase)
    return ctx, pg, cdp, errs


def pret(pg):
    return pg.evaluate("() => { var S = window.SALLE && SALLE.Son, p = S && S.precalcul ? S.precalcul.etat() : {}; return !(S && S.bruitsEnCours && S.bruitsEnCours()) && !p.occupe && !(p.file || []).length; }")


def ligne(nom, b, temoin=None):
    drap = '  <<< À-COUP' if b['gros'] or (temoin and b['pire'] > max(SEUIL, 2.5 * temoin['pire'])) else ''
    sons = ', '.join('%s %d ms' % (s[0], s[1]) for s in b['sons'])
    print('  %-44s %5.1f img/s (calme %s) | pire image %4.0f ms | > %d ms : %d %s| tâches longues : %s%s%s' % (nom[:44], b['ips'], ('%.1f' % temoin['ips']) if temoin else '  - ', b['pire'], SEUIL, b['gros'],
          ('à ' + ', '.join('%d ms (%d)' % (q[0], q[1]) for q in b['quand'][:4]) + ' ') if b['quand'] else '', ', '.join(str(x) for x in b['longues']) or 'aucune', (' | EN DIRECT : ' + sons) if sons else '', drap), flush=True)
    return {'nom': nom, 'ips': b['ips'], 'pire': b['pire'], 'gros': b['gros'], 'sons': b['sons'], 'longue': max(b['longues']) if b['longues'] else 0, 'calme': temoin['ips'] if temoin else None, 'calmePire': temoin['pire'] if temoin else None}


def toucher(pg, h, g):
    c = pg.query_selector('#bande .lb-g .carte[data-h="%s"][data-id="%s"]' % (h, g))
    if not c or 'off' in (c.get_attribute('class') or ''): return False
    c.tap(force=True, timeout=3000); return True


def maintenant(pg):
    return pg.evaluate("() => performance.now()")


def mesure_geste(pg, h, g, prepa=None, nom=None):
    """une icône, Léo au repos : le calme d'abord (1,2 s), puis le geste jusqu'à sa fin + 0,7 s"""
    pg.evaluate(ETAT, prepa or {'vie': .55})
    if prepa and prepa.get('js'): pg.evaluate(prepa['js'])
    time.sleep(.5)
    t0 = maintenant(pg); time.sleep(1.2); t1 = maintenant(pg)
    temoin = pg.evaluate("(a) => window.__S.bilan(a[0], a[1])", [t0, t1])
    ta = maintenant(pg)
    if not toucher(pg, h, g): return None
    time.sleep(.25)
    attendre(pg, "(h) => !DJ.Leo._E().c.h[h].act", 12, h)
    time.sleep(.7)
    b = pg.evaluate("(a) => window.__S.bilan(a[0], a[1])", [ta, maintenant(pg)])
    return ligne(nom or (h + ' · ' + g), b, temoin)


def mesure_attaque(pg, att, parades=None, nom=None, prepa=None):
    """une attaque de Léo, du début de sa préparation à son retour au calme ; parades : [(étape, secondes après, héros, geste)]"""
    pg.evaluate(ETAT, prepa or {'vie': 1})
    attendre(pg, TENIR, 30); time.sleep(.4)
    t0 = maintenant(pg); time.sleep(1.0); t1 = maintenant(pg)
    temoin = pg.evaluate("(a) => window.__S.bilan(a[0], a[1])", [t0, t1])
    pg.evaluate("(a) => { var c = DJ.Leo._E().c, O = LeoRegles.L.ORDRE[c.phase]; c.leo.k = O.indexOf(a) - 1; c.leo.fin = c.leo.tl + .15; window.__soin = setInterval(function(){ var c = DJ.Leo._E() && DJ.Leo._E().c; if(!c) return; ['sage','alchimiste','pisteur'].forEach(function(h){ var S = c.h[h]; if(S.sol){ S.sol = false; S.pv = 1; } if(S.pv < S.pvMax * .3 && c.leo.etape !== 'porte' && c.leo.etape !== 'coups') S.pv = Math.round(S.pvMax * .6); }); }, 250); }", att)
    ta = maintenant(pg)
    if not attendre(pg, "(a) => DJ.Leo._E().c.leo.att === a", 20, att):
        pg.evaluate("() => clearInterval(window.__soin)"); print('  %-44s (l\'attaque n\'est pas partie)' % (nom or att)); return None
    faites = set()
    fin = time.time() + 40
    while time.time() < fin:
        e = pg.evaluate("() => { var Z = DJ.Leo._E().c.leo; return [Z.att, Z.etape, Z.tl]; }")
        if e[0] != att and e[1] in ('repos',): break
        for k, (etape, h, g) in enumerate(parades or []):
            if k not in faites and e[0] == att and e[1] == etape:
                if toucher(pg, h, g): faites.add(k)
        time.sleep(.06)
    pg.evaluate(TENIR)
    time.sleep(1.3)                                # (ce qui retombe après : un héros qui valdingue, des flammes, une glissade)
    pg.evaluate("() => clearInterval(window.__soin)")
    b = pg.evaluate("(a) => window.__S.bilan(a[0], a[1])", [ta, maintenant(pg)])
    return ligne((nom or ('Léo · ' + att)) + ((' (%d parade(s) sur %d)' % (len(faites), len(parades))) if parades else ''), b, temoin)


# ce qu'on joue vraiment, phase par phase : (nom, attaque, [(étape de Léo, héros, geste)])
ENCHAINE = {
    1: [('la charge + l\'huile', 'charge', [('prise', 'alchimiste', 'p:huile')]),
        ('le crochet + l\'huile (il lâche)', 'crochet', [('tient', 'alchimiste', 'p:huile')]),
        ('le crochet + le feu (BOUM)', 'crochet', [('tient', 'alchimiste', 'p:feu')]),
        ('la cape + le bâton de lune', 'cape', [('retour', 'sage', 'a:cristal-lune'), ('retour', 'sage', 'rune')]),
        ('le fléau + le bouclier jaune', 'fleau', [('prise', 'sage', 'bouclier')]),
        ('le marteau + la dague', 'marteau', [('prise', 'pisteur', 'dague')])],
    2: [('le sifflet + le fléau (les rats détalent)', 'sifflet', [('retour', 'pisteur', 'l:fleau')]),
        ('la gourde + le marteau', 'gourde', [('elan', 'pisteur', 'l:marteau')]),
        ('le saut + le bouclier jaune', 'saut', [('prise', 'sage', 'bouclier')]),
        ('la charge + l\'huile', 'charge', [('prise', 'alchimiste', 'p:huile')]),
        ('la faux + les herbes', 'faux', [('retour', 'alchimiste', 'herbes')]),
        ('le lancer de rat + la dague', 'lancer', [('retour', 'pisteur', 'dague')])],
    3: [('la rafale + le bouclier + la gourde', 'rafale', [('prise', 'sage', 'bouclier'), ('coups', 'pisteur', 'l:gourde')]),
        ('la charge + l\'huile', 'charge', [('prise', 'alchimiste', 'p:huile')]),
        ('le cri + le marteau', 'hurlement', [('prise', 'pisteur', 'l:marteau')]),
        ('il attrape + les herbes', 'attrape', [('porte', 'alchimiste', 'herbes'), ('retour', 'alchimiste', 'herbes')]),
        ('le souffle + les herbes', 'souffle', [('retour', 'alchimiste', 'herbes')]),
        ('le poing + le bouclier', 'poing3', [('prise', 'sage', 'bouclier')])]}


def phase(nav, n):
    res = []
    print('\n=== PHASE %d — processeur ×%s, écran %s%s' % (n, TAUX, ECRAN, (' — ' + os.environ['DOSSIER']) if os.environ.get('DOSSIER') else ''), flush=True)
    ctx, pg, cdp, errs = ouvrir(nav, n)
    pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
    pg.evaluate(SONDE)
    attendre(pg, TENIR, 30)
    t = time.time(); attendre(pg, "() => true") ;
    while not pret(pg) and time.time() - t < 150: time.sleep(.5)
    print('  (les sons et la musique fabriqués à l\'avance : prêts après %.0f s ; %s)' % (time.time() - t, json.dumps(pg.evaluate("() => { var S = SALLE.Son; return {bruits:S.bruitsPrets ? S.bruitsPrets() : '?', memoire:S.precalcul ? S.precalcul.memoire() : '?'}; }"))), flush=True)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
    time.sleep(1.5)
    barre = pg.evaluate("() => DJ.Leo.etat().barre.map(function(g){ return [g.heros, g.geste]; })")
    print('— A. les icônes des héros, une par une (Léo au repos)', flush=True)
    for h, g in barre:
        nom = h + ' · ' + g
        if SEUL and SEUL not in nom: continue
        for k in range(FOIS):
            prepa = {'vie': .55}
            if g == 'p:coeur':                      # (il faut un ami à terre : on le laisse tomber pour de vrai)
                pg.evaluate(ETAT, {'vie': .55}); pg.evaluate("() => { var c = DJ.Leo._E().c, S = c.h.sage; S.pv = 1; S.brule = c.t + 1e9; S.bruleT = c.t + .1; }")
                attendre(pg, "() => DJ.Leo._E().c.h.sage.sol", 8); time.sleep(1.6); prepa = {'vie': .55, 'garderSol': True}
            if g == 'oeil': pg.evaluate("() => { DJ.Leo._E().c.vu = false; }")
            r = mesure_geste(pg, h, g, prepa, nom + (' (%d)' % (k + 1) if FOIS > 1 else ''))
            if r is None: print('  %-44s (icône éteinte : pas mesurée)' % nom, flush=True); break
            res.append(r)
    print('— B. les attaques de Léo, seules', flush=True)
    ordre = pg.evaluate("() => { var O = LeoRegles.L.ORDRE[DJ.Leo._E().c.phase], l = []; O.forEach(function(a){ if(l.indexOf(a) < 0) l.push(a); }); return l; }")
    for att in ordre:
        if SEUL and SEUL not in ('Léo · ' + att): continue
        for k in range(FOIS):
            r = mesure_attaque(pg, att, nom='Léo · ' + att + (' (%d)' % (k + 1) if FOIS > 1 else ''))
            if r: res.append(r)
    print('— C. les enchaînements (la parade pendant l\'attaque)', flush=True)
    for nom, att, par in ENCHAINE.get(n, []):
        if SEUL and SEUL not in nom: continue
        r = mesure_attaque(pg, att, par, nom)
        if r: res.append(r)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    print('  erreurs :', errs[:4] or 'aucune', flush=True)
    ctx.close()
    return res


def froid(nav, n):
    """la phase ouverte à froid : ce qui se fabrique encore en fond pendant les vingt premières secondes"""
    print('\n=== PHASE %d À FROID (les 20 premières secondes, seconde par seconde) — processeur ×%s' % (n, TAUX), flush=True)
    ctx, pg, cdp, errs = ouvrir(nav, n)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': TAUX})
    pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=240000)
    pg.evaluate(SONDE)
    pg.evaluate("() => { window.__soin = setInterval(function(){ var c = DJ.Leo._E() && DJ.Leo._E().c; if(!c) return; ['sage','alchimiste','pisteur'].forEach(function(h){ var S = c.h[h]; if(S.sol){ S.sol = false; S.pv = 1; } if(S.pv < S.pvMax * .4 && c.leo.etape !== 'porte' && c.leo.etape !== 'coups') S.pv = S.pvMax; }); }, 250); }")
    for s in range(20):
        t0 = maintenant(pg); time.sleep(1.0); t1 = maintenant(pg)
        b = pg.evaluate("(a) => window.__S.bilan(a[0], a[1])", [t0, t1])
        e = pg.evaluate("() => { var S = SALLE.Son, p = S.precalcul ? S.precalcul.etat() : {}, Z = DJ.Leo._E().c.leo; return [(Z.att || '-') + ':' + Z.etape, !!(S.bruitsEnCours && S.bruitsEnCours()), !!p.occupe, (p.file || []).join(',')]; }")
        print('  %2d s  %5.1f img/s | pire %4.0f ms | > %d ms : %d | %-20s | en fond : %s%s%s' % (s + 1, b['ips'], b['pire'], SEUIL, b['gros'], e[0], 'des bruitages ' if e[1] else '', ('une musique (' + e[3] + ') ') if e[2] else '', '' if (e[1] or e[2]) else 'rien'), flush=True)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1}); ctx.close()


if __name__ == '__main__':
    with sync_playwright() as p:
        nav = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        tout = []
        if not QUE_FROID: tout = phase(nav, PHASE)
        if FROID or QUE_FROID: froid(nav, PHASE)
        nav.close()
    if tout:
        mauvais = sorted([r for r in tout if r['gros'] or (r['calmePire'] and r['pire'] > max(SEUIL, 2.5 * r['calmePire']))], key=lambda r: -r['pire'])
        print('\n=== BILAN phase %d : %d morceaux mesurés, %d avec un à-coup (une image de plus de %d ms, ou 2,5 fois le calme)' % (PHASE, len(tout), len(mauvais), SEUIL))
        for r in mauvais: print('  %-46s pire image %4.0f ms (calme %s ms) ; %d image(s) > %d ms%s' % (r['nom'][:46], r['pire'], ('%.0f' % r['calmePire']) if r['calmePire'] else '-', r['gros'], SEUIL, (' ; en direct : ' + ', '.join(sorted(set(s[0] for s in r['sons'])))) if r['sons'] else ''))
        pires = sorted([r for r in tout if r.get('longue', 0) >= 150], key=lambda r: -r['longue'])
        if pires:
            print('  les plus longues tâches du fil de l\'écran (150 ms ou plus, processeur ralenti) :')
            for r in pires[:12]: print('     %-46s %4d ms' % (r['nom'][:46], r['longue']))
        direct = {}
        for r in tout:
            for s in r['sons']: direct.setdefault(s[0], []).append(s[1])
        if direct:
            print('  les sons encore fabriqués EN DIRECT (nombre de fois, le pire temps de fabrication) :')
            for k, v in sorted(direct.items(), key=lambda x: -max(x[1])): print('     %-22s %3d fois, jusqu\'à %3d ms' % (k, len(v), max(v)))
