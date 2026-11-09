#!/usr/bin/env python3
"""Ce que coûte le son dans la salle des rats, processeur ralenti x6 (comme un vieux téléphone) :
  1) le fil principal (là où tournent aussi les animations) : temps occupé par seconde et images par seconde,
     sans musique, puis avec chaque musique (exploration A/B/C, combat A/B + le puits) ;
  2) le pic au déclenchement de chaque bruitage (le temps pour fabriquer ses nœuds) ;
  3) le calcul du son lui-même (fil audio) : combien de temps il faut pour fabriquer 20 s de chaque musique hors ligne.
     python3 perf-son.py [--rapide]   (à lancer avec flock /tmp/brumeval-pw.lock)"""
import os, sys, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, '..', 'salle-rats.html')
RAPIDE = '--rapide' in sys.argv
DUREE = 4000 if RAPIDE else 8000
IMAGES = """(ms) => new Promise(ok => { var t = [], d = performance.now(); function f(x){ t.push(x); if(x - d < ms) requestAnimationFrame(f); else {
  var dt = []; for(var i = 1; i < t.length; i++) dt.push(t[i] - t[i-1]); dt.sort((a,b)=>a-b);
  ok({ips: Math.round(t.length / (ms / 1000)), pire: Math.round(dt[dt.length-1] || 0), lentes: dt.filter(x => x > 50).length}); } } requestAnimationFrame(f); })"""

def metriques(cdp):
    return {m['name']: m['value'] for m in cdp.send('Performance.getMetrics')['metrics']}

with sync_playwright() as p:
    nav = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=1)
    pg.route('**/fonts.g*/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    cdp = pg.context.new_cdp_session(pg)
    cdp.send('Performance.enable')
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 6})          # ralenti dès l'ouverture : on mesure aussi le pré-calcul au chargement
    pg.goto(PAGE)
    precalcul = pg.evaluate("!!(SALLE.Son.precalcul)")
    if precalcul:
        r = pg.evaluate("""() => new Promise(ok => { var d = performance.now(); (function f(){ var e = SALLE.Son.precalcul.etat();
            if(e.musiques.length >= 3 && !e.occupe) ok({s: Math.round((performance.now() - d) / 100) / 10, e: e}); else setTimeout(f, 100); })(); })""")
        print('— 0) le pré-calcul au chargement (x6) : exploration + combat + le puits prêts en %.1f s' % r['s'])
        m0 = metriques(cdp)
        r = pg.evaluate("""() => new Promise(ok => { var d = performance.now(); SALLE.Son.precalcul.tout().then(function(x){ ok({ms: Math.round(performance.now() - d), x: x}); }); })""")
        m1 = metriques(cdp)
        print('  puis les bruitages lourds du combat : %.1f s de plus, fil principal occupé %.0f ms ; plus longue tâche du pré-calcul %s ms ; mémoire %s Mo (%s musiques, %s bruitages)' % (
            r['ms'] / 1000, (m1['TaskDuration'] - m0['TaskDuration']) * 1000, r['x']['pireTache'], r['x']['memoire'], r['x']['musiques'], r['x']['bruitages']))
    else:
        pg.wait_for_timeout(800)
    pg.evaluate("SALLE.Son.demarrer()"); pg.wait_for_timeout(300)
    print('— 1) fil principal, processeur x6, %d s par mesure' % (DUREE / 1000))
    res = {}
    for nom, js in [('sans musique', "SALLE.Son.musique(null)"),
                    ('exploration A', "SALLE.CHOIX_SONS.explo = ['A']; SALLE.Son.musique('explo')"),
                    ('exploration B', "SALLE.CHOIX_SONS.explo = ['B']; SALLE.Son.musique(null); SALLE.Son.musique('explo')"),
                    ('exploration C', "SALLE.CHOIX_SONS.explo = ['C']; SALLE.Son.musique(null); SALLE.Son.musique('explo')"),
                    ('combat A + le puits', "SALLE.CHOIX_SONS.combat = ['A']; SALLE.Son.musique('combat')"),
                    ('combat B + le puits', "SALLE.CHOIX_SONS.combat = ['B']; SALLE.Son.musique(null); SALLE.Son.musique('combat')")]:
        pg.evaluate(js); pg.wait_for_timeout(3500)          # le fondu d'entrée, puis on mesure
        m0 = metriques(cdp)
        im = pg.evaluate(IMAGES, DUREE)
        m1 = metriques(cdp)
        occ = (m1['TaskDuration'] - m0['TaskDuration']) / (DUREE / 1000) * 100
        scr = (m1['ScriptDuration'] - m0['ScriptDuration']) / (DUREE / 1000) * 100
        res[nom] = {'occupe': occ, 'script': scr, 'images': im}
        print('  %-22s fil principal occupé %5.1f %% (scripts %4.1f %%)  %3d images/s, pire image %4d ms, %d images lentes' % (nom, occ, scr, im['ips'], im['pire'], im['lentes']))
    pg.evaluate("SALLE.Son.musique(null)"); pg.wait_for_timeout(3500)
    print('— 2) pic au déclenchement des bruitages (x6) : le temps pour fabriquer le son')
    pics = pg.evaluate("""() => { var C = SALLE.CHOIX_SONS, r = [];
      Object.keys(C).forEach(function(id){ if(/^(explo|combat)$/.test(id)) return; C[id].forEach(function(v){
        var parts = id === 'ratCritique' ? ['avant', 'impact', 'explosion'] : [null];
        parts.forEach(function(pa){ var d = performance.now(); SALLE.Son.bruitage(id, {version:v, partie:pa || undefined}); r.push([id + v + (pa ? ':' + pa : ''), Math.round((performance.now() - d) * 10) / 10]); });
      }); }); return r; }""")
    pics.sort(key=lambda x: -x[1])
    print('  les plus lourds :', ', '.join('%s %.0f ms' % (k, v) for k, v in pics[:8]))
    print('  moyenne %.1f ms, %d bruitages' % (sum(v for k, v in pics) / max(1, len(pics)), len(pics)))
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    pg.wait_for_timeout(5000)
    print('— 3) le calcul du son (fil audio, hors ligne, processeur normal) : temps pour fabriquer 20 s')
    cal = pg.evaluate("""async () => { var r = [];
      for(var k of ['exploA', 'exploB', 'exploC', 'combatA', 'combatB', 'puits']){
        var sr = 44100, off = new OfflineAudioContext(2, sr * 20, sr), A = Moteur(off, {horsLigne:true, brut:true, volume:1}), P = A.prise(0, 1, 'mus');
        var n = 0; ['createOscillator', 'createBufferSource', 'createBiquadFilter', 'createGain'].forEach(function(nm){ var o = off[nm].bind(off); off[nm] = function(){ n++; return o(); }; });
        var I = MUSIQUES[k](A, P); I.pas(20);
        var d = performance.now(); await off.startRendering(); r.push([k, Math.round(performance.now() - d), n]);
      } return r; }""")
    for k, ms, n in cal:
        print('  %-8s %5d ms pour 20 s  (%4.1f %% du temps réel sur ce processeur), %5d nœuds créés' % (k, ms, ms / 200, n))
    lec = pg.evaluate("""async () => { var r = [];
      for(var cas of ['moteur seul (réverbérations, sans son)', 'une boucle pré-calculée', 'deux boucles (combat + puits)']){
        var sr = 44100, off = new OfflineAudioContext(2, sr * 20, sr), A = Moteur(off, {horsLigne:true, brut:true, volume:1});
        var nb = cas.indexOf('deux') === 0 ? 2 : (cas.indexOf('une') === 0 ? 1 : 0);
        for(var i = 0; i < nb; i++){ var b = off.createBuffer(2, 22050 * 30, 22050); for(var c = 0; c < 2; c++){ var d = b.getChannelData(c); for(var j = 0; j < d.length; j++) d[j] = Math.random() * .1; }
          var s = off.createBufferSource(); s.buffer = b; s.loop = true; s.connect(A.mus); s.start(0); }
        var t = performance.now(); await off.startRendering(); r.push([cas, Math.round(performance.now() - t)]);
      } return r; }""")
    for cas, ms in lec:
        print('  %-40s %5d ms pour 20 s  (%4.1f %%)' % (cas, ms, ms / 200))
    if erreurs: print('ERREURS JS :', erreurs)
    nav.close()
