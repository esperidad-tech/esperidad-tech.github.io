#!/usr/bin/env python3
"""La mémoire prise par les sons dans la salle des rats, comme sur l'iPhone de Romain (émulation iPhone, paysage) :
la somme (longueur × canaux × 4 octets) de tous les AudioBuffer encore vivants (après un ramasse-miettes forcé),
sur l'écran du sac (musique d'exploration), puis en combat (après les bruitages principaux, critique compris).
   flock /tmp/brumeval-pw.lock python3 memoire-son.py [--48k]"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, '..', 'salle-rats.html')
SUIVI = r"""(function(){
  var refs = []; window.__tampons = refs;
  function suivre(b){ if(b && !b.__suivi){ try{ Object.defineProperty(b, '__suivi', {value:1}); }catch(e){} refs.push(new WeakRef(b)); } return b; }
  var cb = BaseAudioContext.prototype.createBuffer;
  BaseAudioContext.prototype.createBuffer = function(){ return suivre(cb.apply(this, arguments)); };
  var sr = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function(){ var p = sr.apply(this, arguments); p.then(suivre); return p; };
  var AB = window.AudioBuffer;
  if(AB) window.AudioBuffer = function(o){ return suivre(new AB(o)); };
  window.__memoire = function(){
    if(window.gc){ window.gc(); window.gc(); }
    var total = 0, n = 0, groupes = {};
    refs.forEach(function(r){ var b = r.deref(); if(!b) return; var o = b.length * b.numberOfChannels * 4; total += o; n++;
      var k = b.sampleRate + ' Hz, ' + b.numberOfChannels + ' can., ' + (Math.round(b.duration * 10) / 10) + ' s'; groupes[k] = (groupes[k] || 0) + o; });
    var l = Object.keys(groupes).map(function(k){ return [k, Math.round(groupes[k] / 1e5) / 10]; }).sort(function(a, b){ return b[1] - a[1]; });
    return {mo: Math.round(total / 1e5) / 10, n: n, gros: l.slice(0, 10)};
  };
})();"""
def attendre_precalcul(pg, ms=90000):
    pg.wait_for_function("() => { var e = SALLE.Son.precalcul && SALLE.Son.precalcul.etat(); return !e || (!e.occupe && !e.file.length); }", timeout=ms)

with sync_playwright() as p:
    nav = p.chromium.launch(args=['--js-flags=--expose-gc', '--autoplay-policy=no-user-gesture-required'])
    ctx = nav.new_context(**p.devices['iPhone 13 landscape'])
    pg = ctx.new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/fonts.g*/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    if '--48k' in sys.argv:                 # comme l'iPhone : le contexte audio à 48 000 Hz
        pg.add_init_script("(function(){ var AC = window.AudioContext; window.AudioContext = window.webkitAudioContext = function(o){ return new AC(Object.assign({sampleRate:48000}, o || {})); }; window.AudioContext.prototype = AC.prototype; })();")
    pg.add_init_script(SUIVI)
    pg.goto(PAGE); pg.wait_for_timeout(1500)
    pg.tap('#sac .bulle .lire', force=True); pg.wait_for_timeout(500)           # le premier toucher : le son démarre
    attendre_precalcul(pg); pg.wait_for_timeout(1500)
    m = pg.evaluate('__memoire()')
    print('SAC     : %5.1f Mo dans %d tampons ; les plus gros : %s' % (m['mo'], m['n'], m['gros'][:6]))
    for r in ['feu', 'huile', 'baume']: pg.tap('.recette[data-id="%s"] b' % r, force=True); pg.wait_for_timeout(100)
    pg.tap('[data-act="descendre"]', force=True)
    pg.wait_for_function("SALLE.etat.mode === 'qui' && !SALLE.etat.occupe", timeout=60000)
    attendre_precalcul(pg)
    pg.evaluate("""() => { var C = SALLE.CHOIX_SONS; Object.keys(C).forEach(function(id, k){ if(/^(explo|combat|icone)$/.test(id)) return;
        setTimeout(function(){ if(id === 'ratCritique'){ ['avant', 'impact', 'explosion'].forEach(function(pa){ SALLE.Son.bruitage(id, {partie:pa}); }); } else SALLE.Son.bruitage(id); }, k * 150); }); }""")
    pg.wait_for_timeout(8000); attendre_precalcul(pg); pg.wait_for_timeout(1000)
    m = pg.evaluate('__memoire()')
    print('COMBAT  : %5.1f Mo dans %d tampons ; les plus gros : %s' % (m['mo'], m['n'], m['gros'][:6]))
    print('musique :', pg.evaluate('SALLE.Son.musiqueEtat().cles'), ' pré-calcul :', pg.evaluate('SALLE.Son.precalcul.etat()'))
    if err: print('ERREURS :', err[:3])
    nav.close()
