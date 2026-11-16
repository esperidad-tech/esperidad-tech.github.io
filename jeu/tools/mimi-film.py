"""Un film du pantin, image par image, sans le jeu : python3 tools/mimi-film.py <sortie.png> "<scénario js>" [colonnes] [taille] [v]
   Le scénario reçoit (rig, pas, photo, M) : pas(n) avance de n images (1/60 s), photo('nom') garde l'image."""
import sys, os
from playwright.sync_api import sync_playwright
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src') + os.sep
sortie, scen = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] else 6
t = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else 220
v = int(sys.argv[5]) if len(sys.argv) > 5 else 0
js = ''.join(open(SRC + f, encoding='utf-8').read() for f in ['mimi-dessin.js', 'mimi-pantin.js', 'mimi-gestes.js'])
html = '<!DOCTYPE html><meta charset="utf-8"><body style="margin:0;background:#3a2f55"><script>' + js + '</script><div id="g"></div><div id="vif" style="position:absolute;left:-999px;top:0;width:340px"></div>'
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': t * cols + 20, 'height': 900})
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and err.append(m.text))
    pg.set_content(html)
    n = pg.evaluate("""([scen, t, cols, v]) => {
      const M = MimiPantin, g = document.getElementById('g'), vif = document.getElementById('vif');
      M.figer = true;
      document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute"><defs>' + M.defs() + '</defs></svg>');
      g.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',' + t + 'px);padding:10px';
      vif.innerHTML = '<div class="at-o"><svg viewBox="0 0 ' + M.W + ' ' + M.H + '" width="340" style="overflow:visible">' + M.dessin(v, M.pose('assis'), {}) + '</svg></div>';
      const svg = vif.querySelector('svg'), rig = M.monter(svg, {pose:'assis', hote:vif.firstChild});
      let n = 0;
      const pas = k => { for(let i = 0; i < (k || 1); i++){ rig.lireClasses(); rig.dessiner(1 / 60); } };
      const photo = nom => { n++; g.insertAdjacentHTML('beforeend', '<div style="position:relative;height:' + Math.round(t * .86) + 'px;background:linear-gradient(#4a3c6a 0 ' + (100 * (M.Y0 + 2) / M.H * (M.H / M.W) / .86).toFixed(1) + '%,#7a4f30 0);overflow:hidden"><svg viewBox="0 0 ' + M.W + ' ' + M.H + '" width="' + t + '" style="overflow:visible;position:absolute;left:0;top:0">' + svg.innerHTML + '</svg><span style="position:absolute;left:4px;top:2px;color:#fff;font:11px sans-serif">' + (nom || n) + '</span></div>'); };
      try { new Function('rig', 'pas', 'photo', 'M', 'hote', scen)(rig, pas, photo, M, vif.firstChild); } catch(e) { console.error(e.message + ' ' + e.stack); }
      return n;
    }""", [scen, t, cols, v])
    rows = (n + cols - 1) // cols
    pg.set_viewport_size({'width': t * cols + 20, 'height': int(t * 0.86) * rows + 20})
    pg.wait_for_timeout(120)
    pg.screenshot(path=sortie)
    print('images', n, 'erreurs', err)
    b.close()
