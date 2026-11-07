"""(débogage : le chat suit le doigt) python3 dbg_chasse.py 360x740 [--jeux]"""
import sys, os, json, time
from outils_at import *
sys.argv = [a for a in sys.argv]
JEUXF = '--jeux' in sys.argv
import essai5 as E

def sc(pg, t, B):
    pg.evaluate("banc.connue = true; banc.potions = {}; banc.enquete = 1; banc.etat = Atelier.etatNeuf(); banc.creer()"); att(pg, 500)
    ouvrir_cartons_vite(pg); att(pg, 400)
    ch = pg.evaluate("banc.etat.objets.find(o => o.t === 'chat').id")
    E.besoins(pg, ch, {'faim': 80, 'soif': 80, 'amour': 80, 'jeu': 40, 'dodo': 80})
    if JEUXF:
        pg.evaluate("banc.vue._souris()"); att(pg, 9000)
        for i in range(14):
            pg.evaluate(f"banc.vue._reveil('{ch}')"); pg.evaluate(f"banc.vue._jouer('{ch}')"); att(pg, 450)
        for q in E.JEUX:
            pg.evaluate(f"banc.vue._jouer('{ch}', '{q}')")
        att(pg, 2500)
    pg.evaluate(f"banc.vue._reveil('{ch}')"); E.en_vue(pg, ch); att(pg, 200)
    print('chat', pg.evaluate(f"banc.vue._chat('{ch}')"), 'bonheur', pg.evaluate(f"banc.vue._bonheur('{ch}')"))
    c0 = pg.evaluate(f"banc.vue._pos('{ch}')"); rc = pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] svg')"); pc = pg.evaluate("T.rect('.at-piece')")
    print('c0', c0['x'], c0['y'], 'rc', rc, 'pc', pc)
    a = pg.evaluate(f"""(() => {{ const r = document.querySelector('[data-obj="{ch}"] svg').getBoundingClientRect(), p = document.querySelector('.at-piece').getBoundingClientRect();
      for(const dy of [0.9, 0.7, 1.1, 0.5]) for(const dx of [130, -130, 180, -180, 90, -90, 230, -230]){{
        const x = r.left + r.width / 2 + dx, y = r.top + r.height * dy;
        if(x < p.left + 60 || x > p.right - 60 || y < p.top + 60 || y > p.bottom - 90) continue;
        const e = document.elementFromPoint(x, y);
        if(e && !e.closest('.at-o, .at-carton, .at-tas, [data-at], button') && e.closest('[data-surf^=sol]')) return {{x, y, dx, el:e.tagName + '.' + (e.getAttribute('class') || '') + ' ' + (e.closest('[data-surf]').getAttribute('data-surf'))}};
      }} return null; }})()""")
    print('a', a)
    if not a: return
    dirx = 1 if a['dx'] > 0 else -1
    MONDE = "(p => { const r = document.querySelector('.at-piece').getBoundingClientRect(), v = banc.vue._vb(); return {x:v.x0 + (p.x - r.left + v.pan.x) / v.k, y:v.y0 + (p.y - r.top + v.pan.y) / v.k}; })"
    print('monde du doigt', pg.evaluate(MONDE, a))
    pg.evaluate("window.__ev = []; ['pointerdown','pointermove','pointerup'].forEach(n => document.addEventListener(n, e => __ev.push(n + ' ' + e.target.tagName + '.' + (e.target.getAttribute('class')||'')), true))")
    pg.mouse.move(a['x'], a['y']); pg.mouse.down()
    pg.mouse.move(a['x'] + dirx * 14, a['y'] + 3)
    for i in range(1, 9):
        f = {'x': a['x'] + dirx * (14 + i * 6), 'y': a['y'] + 3 + i * 2}
        pg.mouse.move(f['x'], f['y'], steps=2); att(pg, 230)
        print(i, 'pos', pg.evaluate(f"(p => [Math.round(p.x), Math.round(p.y)])(banc.vue._pos('{ch}'))"), pg.evaluate(f"banc.vue._chat('{ch}').pose"), pg.evaluate(MONDE, f), pg.evaluate("banc.vue._vb().pan"))
    pg.mouse.up(); att(pg, 900)
    print('ev', pg.evaluate("__ev.slice(0, 4)"), len(pg.evaluate("__ev")))
    print('c1', pg.evaluate(f"banc.vue._pos('{ch}')")['x'], pg.evaluate(f"banc.vue._chat('{ch}')"))

lancer(sc, [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:] if not a.startswith('--')], 'dbg', 'dbg')
