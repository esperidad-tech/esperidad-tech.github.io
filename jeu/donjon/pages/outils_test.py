"""Outils communs aux tests des pages du donjon (test-carte.py, test-sage.py, test-alchimiste.py).
Toujours lancer sous le verrou :  flock /tmp/brumeval-pw.lock python3 test-sage.py  (un seul navigateur à la fois)."""
import os, json, time
from collections import defaultdict

DONJON = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPTURES = os.path.join(DONJON, 'pages', 'captures')
APPAREILS = {
    'tablette': dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=2, has_touch=True, is_mobile=True),
    'iphone': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, has_touch=True, is_mobile=True),
}
# la voix est espionnée (elle ne doit JAMAIS parler toute seule) ; pas de son pendant les tests
INIT = """window.__parle = 0;
try{ speechSynthesis.speak = function(){ window.__parle++; }; speechSynthesis.cancel = function(){}; }catch(e){}
window.AudioContext = undefined; window.webkitAudioContext = undefined;"""


class Bilan:
    def __init__(self, nom):
        self.nom, self.ok_n, self.ko = nom, 0, []

    def ok(self, cond, msg):
        if cond:
            self.ok_n += 1
            print('  ✓', msg)
        else:
            self.ko.append(msg)
            print('  ✗', msg)
        return cond

    def fin(self):
        print('\n%s : %d vérifications réussies, %d échecs' % (self.nom, self.ok_n, len(self.ko)))
        for k in self.ko:
            print('   ÉCHEC :', k)
        return 1 if self.ko else 0


def contexte(nav, appareil):
    ctx = nav.new_context(**APPAREILS[appareil])
    ctx.add_init_script(INIT)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    return ctx


def page(ctx, fichier):
    pg = ctx.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.on('console', lambda m: erreurs.append('console: ' + m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(DONJON, fichier))
    return pg, erreurs


def capture(pg, nom):
    os.makedirs(CAPTURES, exist_ok=True)
    p = os.path.join(CAPTURES, nom + '.png')
    pg.screenshot(path=p)
    return p


# chaque texte de plus de 3 mots a son 🔊 (les boutons et les dessins SVG ne comptent pas ; les étiquettes de la carte
# du Pisteur se lisent en touchant le lieu : le conteur dit son nom avec 🔊)
JS_LIRE = """() => {
  var mauvais = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while(w.nextNode()){
    var n = w.currentNode, t = n.nodeValue.replace(/\\s+/g, ' ').trim(); if(!t) continue;
    var e = n.parentElement; if(!e || e.closest('script,style,svg,button,#tourne[hidden],[hidden],.cd-etiq')) continue;
    var r = e.getBoundingClientRect(); if(!r.width || !r.height) continue;
    var cs = getComputedStyle(e); if(cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    var mots = t.split(' ').filter(function(m){ return /[A-Za-zÀ-ÿ]/.test(m); });
    if(mots.length <= 3) continue;
    var a = e.closest('.dit,.bulle,.titre,[data-lu]');
    if(!a || !a.querySelector('[data-lire]')) mauvais.push(t.slice(0, 60));
  }
  return mauvais;
}"""
# les cibles à toucher font au moins 44 × 44 px
JS_CIBLES = """() => {
  var petites = [];
  document.querySelectorAll('button, [role=button], a[href]').forEach(function(b){
    if(b.closest('[hidden]')) return;
    var r = b.getBoundingClientRect(); if(!r.width || !r.height) return;
    var cs = getComputedStyle(b); if(cs.visibility === 'hidden' || cs.display === 'none') return;
    if(r.width < 43.5 || r.height < 43.5) petites.push((b.id || b.className || b.textContent).toString().slice(0, 30) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return petites;
}"""
JS_COTE = """() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth, x: window.scrollX})"""


def regles(b, pg, ou):
    """les règles de Romain, vérifiées sur l'écran tel qu'il est"""
    m = pg.evaluate(JS_LIRE)
    b.ok(not m, ou + ' : chaque texte de plus de 3 mots a son 🔊' + ('' if not m else ' — sans 🔊 : ' + ' | '.join(m[:4])))
    p = pg.evaluate(JS_CIBLES)
    b.ok(not p, ou + ' : cibles ≥ 44 px' + ('' if not p else ' — trop petites : ' + ', '.join(p[:5])))
    c = pg.evaluate(JS_COTE)
    b.ok(c['sw'] <= c['cw'] + 1 and c['bw'] <= c['cw'] + 1 and c['x'] == 0, ou + ' : pas de défilement de côté (%d / %d)' % (c['sw'], c['cw']))


def muet(b, pg, ou):
    b.ok(pg.evaluate('window.__parle') == 0, ou + ' : aucune lecture vocale toute seule')


# ---------------- la fluidité : glisser au doigt (souris), processeur ralenti ----------------
CATS = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'blink.user_timing', 'toplevel']


def analyse(evts):
    noms = {}
    for e in evts:
        if e.get('ph') == 'M' and e.get('name') == 'thread_name':
            noms[(e['pid'], e['tid'])] = e['args'].get('name', '')
    marques = {e['name']: e for e in evts if e.get('name') in ('ph:glisse', 'ph:fin')}
    if len(marques) < 2:
        return None
    pid, t0, t1 = marques['ph:glisse']['pid'], marques['ph:glisse']['ts'], marques['ph:fin']['ts']
    draws = sorted(e['ts'] / 1000.0 for e in evts if e.get('name') == 'DrawFrame' and e.get('pid') == pid and t0 <= e['ts'] <= t1 and noms.get((pid, e['tid'])) == 'Compositor')
    tache = 0
    for e in evts:
        if e.get('pid') == pid and e.get('ph') == 'X' and t0 <= e.get('ts', 0) <= t1 and noms.get((pid, e['tid'])) == 'CrRendererMain' and e.get('name') in ('ThreadControllerImpl::RunTask', 'RunTask'):
            tache = max(tache, e.get('dur', 0) / 1000.0)
    dt = [b - a for a, b in zip(draws, draws[1:])]
    duree = (draws[-1] - draws[0]) / 1000.0 if len(draws) > 1 else 0
    return {'ips': round(len(dt) / duree, 1) if duree else 0, 'pire': round(max(dt)) if dt else 0,
            'n33': sum(1 for x in dt if x > 33.4), 'n50': sum(1 for x in dt if x > 50), 'tache': round(tache), 'images': len(dt)}


def mesurer_glisse(nav, ctx, pg, taux, x, y, ax=180, ay=110, duree=2.4, rune=None):
    """glisse le doigt (souris) en boucle autour de (x, y) pendant « duree » secondes, processeur ralenti « taux » fois"""
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': taux})
    nav.start_tracing(page=pg, categories=CATS)
    pg.mouse.move(rune[0] if rune else x, rune[1] if rune else y)
    pg.mouse.down()
    pg.evaluate("performance.mark('ph:glisse')")
    t0, i = time.time(), 0
    while time.time() - t0 < duree:
        pg.mouse.move(x + ax * __import__('math').sin(i * .06), y + ay * __import__('math').sin(i * .041))
        i += 1
    pg.evaluate("performance.mark('ph:fin')")
    pg.mouse.up()
    data = nav.stop_tracing()
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    cdp.detach()
    r = analyse(json.loads(data)['traceEvents'])
    if r:
        r['mouvements'] = i
    return r
