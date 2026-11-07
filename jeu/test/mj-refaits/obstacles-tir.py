import sys, json
from playwright.sync_api import sync_playwright
salle, n, var = sys.argv[1:4]
# (6 nov., 12 h 49 : la pancarte est retirée ; les cibles changent de place à chaque partie, et l'archer tire aussi à
#  l'horizontale ; on note aussi la cible la plus gênée de chaque partie)
# (16 h 14 : seulement le seau, l'échafaudage — chacun sur le clocher ou sur la maison — et le grand arbre)
COMBOS = [[], ['seau@maison'], ['seau@clocher'], ['echafaudage@maison'], ['echafaudage@clocher'], ['platane'], ['seau@maison', 'echafaudage@clocher', 'platane'], ['seau@clocher', 'echafaudage@maison', 'platane']]
MESURE = """() => { var T = document.querySelector('.mja-terrain'), E = T.mjaEtat(), ok = 0, sans = 0, pire = 1;
  E.cibles.forEach(function(c, i){ if(!c) return; var ok0 = ok, sans0 = sans;
    for(var ang = -1.5; ang < 0.1; ang += 0.02) for(var pu = 0.5; pu <= 1.001; pu += 0.04){   /* (14 h 57 : à fond aussi, les cibles sont hautes) */
      var d = E.depart(ang), x = d.x, y = d.y, vx = Math.cos(ang) * pu * E.ARC.v, vy = Math.sin(ang) * pu * E.ARC.v, tt = E.t, h = 1/90, bl = false;
      for(var k = 0; k < 220; k++){ vx += E.ventA(tt) * h; vy += E.ARC.g * h; x += vx * h; y += vy * h; tt += h; if(y > 422 || x > 640) break; if(!bl && E.obstacle(x, y, tt)) bl = true;
        var q = E.posCible(i, tt), tx = q.x, ty = q.y; if(c.c.mv === 'ficelle'){ tx = c.c.s.ax + (q.nx - c.c.s.ax) * 0.3; ty = c.c.s.ay + (q.ny - c.c.s.ay) * 0.3; }
        if(Math.hypot(x - tx, y - ty) < 8){ sans++; if(!bl) ok++; break; } } }
    if(sans > sans0) pire = Math.min(pire, (ok - ok0) / (sans - sans0)); });
  return [ok, sans, pire]; }"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 420, 'height': 860})
    for combo in COMBOS:
        tot = [0, 0]; pires = []
        for essai in range(6):
            pg.goto('about:blank'); pg.goto('file://' + salle); pg.wait_for_timeout(700)
            pg.evaluate("""(a) => { var el = document.createElement('div'); el.id = 'essai'; el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000'; document.body.appendChild(el);
              var p = MJ.reglages('tir', a.n, {}); if(a.v) p.decor = a.v; p.obstaclesForces = a.o; p.oiseaux = 0; p.grands = false; p.perche = 0; MJ.lancer(el, 'tir', p, function(){}); }""", {'n': int(n), 'v': None if var == '-' else var, 'o': combo})
            pg.wait_for_timeout(500); pg.locator('#essai .mj-go').first.click(); pg.wait_for_timeout(900)
            r = pg.evaluate(MESURE); tot[0] += r[0]; tot[1] += r[1]; pires.append(round(100 * r[2]))
        print(combo or ['(aucun)'], 'atteint', tot[0], '/', tot[1], f'({round(100 * tot[0] / max(1, tot[1]))} %)', 'cible la plus gênée :', pires)
    b.close()
