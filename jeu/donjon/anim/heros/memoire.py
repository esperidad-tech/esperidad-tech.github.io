"""La mémoire des nouvelles animations des héros sur iPhone (RAPIDITE.md R9).

    flock /tmp/brumeval-pw.lock python3 memoire.py                 -> tous les moments de perf.py
    flock /tmp/brumeval-pw.lock python3 memoire.py --filtre éclair -> seulement ceux dont le nom contient « éclair »

Émulation iPhone (844 x 390, device_scale_factor 3, mobile, tactile), demo.html?film (héros cuits). Pendant chaque moment,
toutes les 60 ms, on relève :
  - le plus grand côté « réel » d'un élément animé : sa taille x la plus grande échelle de son animation x celles de ses
    parents x 3 (la densité de l'écran) ; pour une toile (canvas), la taille de sa mémoire (largeur x hauteur de la toile).
    R9 : aucun au-delà de 4 096 px ;
  - les toiles vivantes dans la page (somme largeur x hauteur x 4 octets) : elles doivent être vidées après usage.
Ce relevé tourne sur le fil principal : il ne sert pas à mesurer la fluidité (voir perf.py)."""
import os, sys
from playwright.sync_api import sync_playwright
from perf import MOMENTS

ICI = os.path.dirname(os.path.abspath(__file__))
FILTRE = sys.argv[sys.argv.index('--filtre') + 1] if '--filtre' in sys.argv else None
DPR = 3

RELEVE = """(dpr) => {
  function echelleTf(t){
    var m = 1, r;
    if(!t || t === 'none') return 1;
    var re = /(scale[XY]?|matrix)\\(([^)]*)\\)/g;
    while((r = re.exec(t))){
      var v = r[2].split(',').map(parseFloat);
      if(r[1] === 'matrix') m *= Math.max(Math.hypot(v[0], v[1]), Math.hypot(v[2], v[3]));
      else m *= Math.max.apply(null, v.map(Math.abs));
    }
    return m;
  }
  function maxAnim(el){
    var m = 0;
    (el.getAnimations ? el.getAnimations() : []).forEach(function(a){
      if(!a.effect || !a.effect.getKeyframes) return;
      a.effect.getKeyframes().forEach(function(k){ if(k.transform) m = Math.max(m, echelleTf(k.transform)); });
    });
    return m;
  }
  function echelleParents(el){
    var s = 1;
    for(var p = el.parentElement; p && p !== document.body; p = p.parentElement){
      var a = maxAnim(p); s *= a || echelleTf(getComputedStyle(p).transform);
    }
    return s;
  }
  var pire = {px: 0, quoi: ''};
  document.getAnimations().forEach(function(a){
    var el = a.effect && a.effect.target;
    if(!el || !el.isConnected) return;
    var w, h;
    if(el.tagName === 'CANVAS'){ w = el.width; h = el.height; var px = Math.max(w, h); if(px > pire.px) pire = {px: Math.round(px), quoi: 'toile ' + w + ' x ' + h}; return; }
    w = el.offsetWidth || 0; h = el.offsetHeight || 0;
    var sv = el.querySelector && el.querySelector(':scope > svg');
    if(sv && w < 4 && h < 4){ try { var b = sv.getBBox(); w = b.width; h = b.height; } catch(e){} }
    var s = (maxAnim(el) || 1) * echelleParents(el), px2 = Math.max(w, h) * s * dpr;
    if(px2 > pire.px) pire = {px: Math.round(px2), quoi: (el.className && el.className.baseVal === undefined ? el.className : el.tagName) + ' ' + Math.round(w) + ' x ' + Math.round(h) + ' x ' + s.toFixed(2)};
  });
  var toiles = 0;
  document.querySelectorAll('canvas').forEach(function(c){ toiles += c.width * c.height * 4; });
  return {pire: pire, toiles: toiles};
}"""

res = []
with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film')
    pg.wait_for_function('window.PRET', timeout=90000)
    pg.wait_for_timeout(1000)
    for nom, js, apres in MOMENTS:
        if FILTRE and not nom.startswith('_') and FILTRE not in nom:
            continue
        pg.evaluate("() => { window.__ok = false; Promise.resolve(" + js + ").then(() => { window.__ok = true; }, (e) => { console.error(e); window.__ok = true; }); }")
        pire, toiles = {'px': 0, 'quoi': ''}, 0
        while not pg.evaluate('window.__ok'):
            r = pg.evaluate(RELEVE, DPR)
            if r['pire']['px'] > pire['px']:
                pire = r['pire']
            toiles = max(toiles, r['toiles'])
            pg.wait_for_timeout(60)
        if apres:
            pg.wait_for_timeout(apres)
        fin = pg.evaluate(RELEVE, DPR)['toiles']
        if not nom.startswith('_'):
            res.append((nom, pire, toiles, fin))
            print('%-26s  plus grand calque réel : %5d px  (%s)%s   toiles : %.1f Mo pendant, %.1f Mo après' % (nom, pire['px'], pire['quoi'], '  <-- plus de 4 096' if pire['px'] > 4096 else '', toiles / 1e6, fin / 1e6), flush=True)
    ctx.close()
    nav.close()
print('erreurs :', err or 'aucune')
print('R9 :', 'respectée' if all(r[1]['px'] <= 4096 for r in res) and all(r[3] == 0 for r in res) else 'NON RESPECTÉE')
