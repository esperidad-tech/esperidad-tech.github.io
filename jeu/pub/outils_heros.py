"""Les outils des quatre films des héros (jeu/pub/, 17 novembre) : ceux de la pub (outils.py), plus
   · filmer2 : filmer au ralenti PENDANT que le robot joue (des gestes à des instants du jeu) ;
   · planche : une planche d'images d'un plan, pour le regarder ;
   · la salle des mini-jeux, le jeu, le donjon."""
import os, sys, time, shutil, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from outils import *
J = 'file://' + DIST + '/index.html'; SA = 'file://' + DIST + '/salle-mini-jeux.html'
ZONE = """() => { var best = null; document.querySelectorAll('canvas, svg, div').forEach(function(e){ var r = e.getBoundingClientRect(); if(r.top >= 100 && r.bottom <= innerHeight + 2 && r.width >= 600 && r.height >= 250){ var a = r.width * r.height; if(!best || a > best.a) best = {a:a, x:r.x, y:r.y, width:r.width, height:r.height}; } }); return best; }"""
def cadre(z, ratio=1440 / 616., haut=.5):
    """le plus grand rectangle au bon format dans la zone (haut : 0 = collé en haut, .5 = au milieu, 1 = en bas)"""
    w, h = z['width'], z['height']
    if w / h > ratio: nw = h * ratio; return {'x': z['x'] + (w - nw) / 2, 'y': z['y'], 'width': nw, 'height': h}
    nh = w / ratio; return {'x': z['x'], 'y': z['y'] + (h - nh) * haut, 'width': w, 'height': nh}
def filmer2(pg, nom, duree, clip=None, gestes=(), qualite=92, chaque=None):
    """comme filmer, mais le robot joue pendant qu'on filme : gestes = [(instant du jeu en secondes, fonction(pg)), …]"""
    d = os.path.join(PLANS, nom); shutil.rmtree(d, ignore_errors=True); os.makedirs(d + '/brut')
    k = pg._k; t0 = time.time(); prises = []; reste = sorted(gestes, key=lambda g: g[0]); perdu = 0.0
    while True:
        t = (time.time() - t0 - perdu) * k
        while reste and reste[0][0] <= t:
            g = reste.pop(0); g[1](pg)
        if chaque: chaque(pg, t)
        t = (time.time() - t0 - perdu) * k
        if t > duree: break
        f = '%s/brut/%05d.jpg' % (d, len(prises)); pg.screenshot(path=f, type='jpeg', quality=qualite, **({'clip': clip} if clip else {})); prises.append((t, f))
    n = int(duree * 30)
    for i in range(n):
        t = i / 30.0; j = min(range(len(prises)), key=lambda q: abs(prises[q][0] - t)); shutil.copy(prises[j][1], '%s/%04d.jpg' % (d, i))
    shutil.rmtree(d + '/brut'); print(nom, ':', len(prises), 'photos →', n, 'images', flush=True)
    return n
def planche(nom, pas=6, larg=360, cols=6, sortie=None):
    from PIL import Image
    d = os.path.join(PLANS, nom); fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg'))[::pas]
    ims = [Image.open(os.path.join(d, f)).convert('RGB') for f in fs]; r = [im.resize((larg, int(im.height * larg / im.width))) for im in ims]
    h = max(i.height for i in r); rows = (len(r) + cols - 1) // cols; c = Image.new('RGB', (larg * cols + 3 * (cols - 1), h * rows + 3 * (rows - 1)), (255, 0, 255))
    for i, im in enumerate(r): c.paste(im, ((i % cols) * (larg + 3), (i // cols) * (h + 3)))
    sortie = sortie or '/tmp/pub/vues/planche-%s.jpg' % nom; os.makedirs(os.path.dirname(sortie), exist_ok=True); c.save(sortie, quality=80); print(sortie, c.size, len(fs), 'vignettes'); return sortie
def salle(b, h, l=1000, ht=640, dsf=1.5, ralenti=True, attente=3500):
    """ouvre un mini-jeu de la salle et touche le bouton jaune ; rend la page"""
    q = page(b, l, ht, dsf, ralenti=ralenti); q.goto(SA + h); q.wait_for_timeout(1000); q.locator('.mj-go').first.click(force=True); q.wait_for_timeout(attente)
    return q
if __name__ == '__main__':
    for n in sys.argv[1:]: planche(n)

# ------------------------------------------------------------------ dans le vrai jeu (index.html#test) : un héros, une enquête, un moment
import json as _json
def jeu(b, role, n=3, moment=0, l=1100, h=720, dsf=1.6, ralenti=None, nom=None, tactile=False):
    """un héros tout neuf du rôle demandé, dans l'enquête n (mode test), au moment donné (0 : le matin) ; les mini-jeux gardent leur « fin »
       (window.__finir(true) les fait réussir d'un coup)"""
    pg = page(b, l, h, dsf, ralenti=ralenti, tactile=tactile)
    pg.errs = []; pg.on('pageerror', lambda e: pg.errs.append(str(e)))
    heros(pg, nom or {'pisteur': 'Zoé', 'alchimiste': 'Tom', 'barde': 'Inès', 'sage': 'Noé'}[role], role, J + '#test'); enquete(pg, n, moment)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      var vrai = MJ.lancer;
      MJ.lancer = function(el, type, params, fin, opt){
        var c = {type:type, params:params, fin:fin, fini:false, opt:opt};
        c.h = vrai.call(MJ, el, type, params, function(r){ if(!c.fini){ c.fini = true; window.__mjCourant = null; fin(r); } }, opt);
        window.__mjCourant = c; return c.h;
      };
      window.__finir = function(ok){ var c = window.__mjCourant; if(!c || c.fini) return; c.fini = true; window.__mjCourant = null;
        try{ c.h.arreter(); }catch(e){}
        c.fin({reussi:ok, score:ok ? 1 : 0, essais:1, erreurs:0, detail:''}); }; }""")
    return pg
def ev(pg, act, data=None):
    pg.evaluate("([a, d]) => { M.A[a]({dataset:d, closest:function(){ return null; }}); }", [act, data or {}]); pg.wait_for_timeout(150)
def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)
def onglet(pg, o):
    pg.evaluate("(o) => { M.UI.modal = null; M.P().onglet = o; M.render(); }", o); pg.wait_for_timeout(300)
def taper(pg, cle):
    """tape un code dans l'onglet Code (comme un joueur : les trois dessins)"""
    seq = pg.evaluate("(c) => M.code(c)", cle); onglet(pg, 'code')
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350)
def lieu(pg, l):
    onglet(pg, 'carte'); ev(pg, 'lieu', {'id': l})
    b = pg.locator('#voile [data-act=explorer]')
    if b.count(): b.first.click(); pg.wait_for_timeout(200)
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id; })")
def boite(pg, sel, cadre_=None):
    return pg.evaluate("(s) => { var e = document.querySelector(s); if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.x, y:r.y, width:r.width, height:r.height}; }", sel)
def vue(pg, nom):
    os.makedirs('/tmp/pub/vues', exist_ok=True); pg.screenshot(path='/tmp/pub/vues/%s.jpg' % nom, type='jpeg', quality=80)
