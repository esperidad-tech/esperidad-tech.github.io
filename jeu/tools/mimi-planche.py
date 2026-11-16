"""Planche du pantin de Mimi, sans le jeu : python3 tools/mimi-planche.py <sortie.png> [poses] [v] [taille] [js qui change P : "P.lx=1"]
   Charge jeu/src/mimi-dessin.js + mimi-gestes.js (+ mimi-pantin.js s'il existe)."""
import sys, os, json
from playwright.sync_api import sync_playwright
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src') + os.sep
sortie = sys.argv[1]
poses = (sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else 'debout,assis,pain,dort,dos,dresse,tapi,mange').split(',')
vs = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else '0').split(',')]
t = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else 300
plus = sys.argv[5] if len(sys.argv) > 5 else ''
js = ''.join(open(SRC + f, encoding='utf-8').read() for f in ['mimi-dessin.js', 'mimi-pantin.js', 'mimi-gestes.js'] if os.path.exists(SRC + f))
html = '<!DOCTYPE html><meta charset="utf-8"><body style="margin:0;background:#3a2f55"><script>' + js + '</script><div id="g"></div>'
with sync_playwright() as p:
    b = p.chromium.launch()
    cols = min(len(poses), 4); rows = (len(poses) + cols - 1) // cols * len(vs)
    pg = b.new_page(viewport={'width': t * cols + 20, 'height': int(t * 0.86) * rows + 20})
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and err.append(m.text))
    pg.set_content(html)
    pg.evaluate("""([poses, vs, t, cols, plus]) => {
      const M = MimiPantin, g = document.getElementById('g');
      g.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',' + t + 'px);padding:10px';
      document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute"><defs>' + M.defs() + '</defs></svg>'); let h = '';
      vs.forEach(v => poses.forEach(po => {
        const P = M.pose(po.split('+')[0]);
        try { new Function('P', plus + ';' + (po.split('+')[1] || ''))(P); } catch(e) { console.error(e.message); }
        h += '<div style="position:relative;height:' + Math.round(t * .86) + 'px;background:linear-gradient(#4a3c6a 0 ' + (100 * (M.Y0 + 2) / M.H * (t / (t * .86)) * (M.H / M.W)).toFixed(1) + '%,#7a4f30 0)"><svg viewBox="0 0 ' + M.W + ' ' + M.H + '" width="' + t + '" style="overflow:visible;position:absolute;left:0;top:0">' + M.dessin(v, P, {}) + '</svg><span style="position:absolute;left:4px;top:2px;color:#fff;font:12px sans-serif">' + po + '</span></div>';
      }));
      g.innerHTML = h;
    }""", [poses, vs, t, cols, plus])
    pg.wait_for_timeout(150)
    pg.screenshot(path=sortie)
    print('erreurs', err)
    b.close()
