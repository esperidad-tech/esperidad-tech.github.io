# Robot : joue « Tir à l'arc » (vise par simulation) ; captures pendant la partie et à la fin.
import sys, time
from playwright.sync_api import sync_playwright
salle, n, var, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
parties = int(sys.argv[5]) if len(sys.argv) > 5 else 1
VISE = """() => {
  var T = document.querySelector('.mja-terrain'); if(!T || !T.mjaEtat) return null;
  var E = T.mjaEtat(); if(E.enVol) return 'vol';
  var best = null;
  E.cibles.forEach(function(c, i){
    if(!c || best || c.pigeon) return;
    for(var ang = -1.48; ang < 0.1 && !best; ang += 0.012){   /* (jusqu'à l'horizontale : il y a des cibles en bas, 6 nov.) */
      for(var pu = 0.55; pu <= 0.931 && !best; pu += 0.042){
        var d = E.depart(ang), x = d.x, y = d.y, vx = Math.cos(ang) * pu * E.ARC.v, vy = Math.sin(ang) * pu * E.ARC.v, tt = E.t, h = 1/90;
        for(var k = 0; k < 220; k++){
          vx += E.ventA(tt) * h; vy += E.ARC.g * h; x += vx * h; y += vy * h; tt += h;
          if(y > 422 || x > 640) break;
          if(E.obstacle(x, y, tt) || (E.interdit && E.interdit(x, y, tt))) break;
          var q = E.posCible(i, tt), tx = q.x, ty = q.y;
          /* (les ficelles sont longues aux petits niveaux : le robot vise près du nœud, à 25 %) */
          if(c.c.mv === 'ficelle'){ tx = c.c.s.ax + (q.nx - c.c.s.ax) * 0.25; ty = c.c.s.ay + (q.ny - c.c.s.ay) * 0.25; }
          var r = c.c.mv === 'ficelle' ? 3 : (c.c.mv === 'point' ? 3 : 6);
          if(Math.hypot(x - tx, y - ty) < r){ best = [ang, pu]; break; }
        }
      }
    }
  });
  if(best){ T.mjaTirer(best[0], best[1]); return 'tir'; }
  return 'rien';
}"""
res = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for k in range(parties):
        pg = b.new_page(viewport={'width': 420, 'height': 860})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + salle + '#jeu=tir&n=' + n + ('' if var == '-' else '&v=' + var)); pg.wait_for_timeout(1200)
        pg.locator('.mj-go').first.click(); pg.wait_for_timeout(700)
        t0 = time.time(); nt = 0
        while time.time() - t0 < 90:
            if pg.locator('.mj-resultat').count(): break
            # (6 nov., 14 h 30 : le carquois vide, on ramasse les flèches tombées par terre)
            if pg.locator('.ti-ramasser:not([hidden])').count(): pg.locator('.ti-ramasser').click(force=True); pg.wait_for_timeout(1500); continue
            r = pg.evaluate(VISE)
            if r == 'tir':
                nt += 1
                if k == 0: pg.wait_for_timeout(1100); pg.screenshot(path=f"{out}-tir{nt}.png")
                pg.wait_for_timeout(900)
            else: pg.wait_for_timeout(150)
        if k == 0: pg.wait_for_timeout(100); pg.screenshot(path=f'{out}-fin.png')
        ok = pg.locator('.mj-resultat.ok').count() > 0
        det = pg.locator('.mj-resultat p.doux').first.inner_text() if pg.locator('.mj-resultat p.doux').count() else '?'
        res.append((ok, nt, round(time.time() - t0), det[:70], errs[:2]))
        pg.close()
    b.close()
for r in res: print(r)
print('réussies', sum(1 for r in res if r[0]), '/', len(res))
