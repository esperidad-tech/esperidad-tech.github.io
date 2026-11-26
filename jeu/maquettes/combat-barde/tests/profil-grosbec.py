import pathlib, sys
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'outils.js').read_text() + '\n' + (src / 'grosbec.js').read_text()
html = "<!DOCTYPE html><html><body><canvas id=c width=600 height=500></canvas><script>" + code + r"""
function mesure(Kk, gk, n) {
  Gros.construire(Kk, gk); const g = document.getElementById('c').getContext('2d');
  for (let i = 0; i < 3; i++) Gros.image(g, { cap: 0.2 }, { pul: 0.5 }, i);
  const t0 = performance.now(); for (let i = 0; i < n; i++) Gros.image(g, { cap: 0.3 * Math.sin(i), tete: 0.4 * Math.cos(i) }, { pul: 0.5, colere: 0.5, fissures: 3 }, i * 0.1);
  g.getImageData(0, 0, 1, 1); return Math.round((performance.now() - t0) / n * 100) / 100;
}
</script></body></html>"""
with sync_playwright() as p:
    for args in (['--disable-gpu'], []):
        nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=args)
        pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e))); pg.set_content(html)
        for Kk, gk in [(2, 1), (1.5, 1), (1, 1)]: print(args, 'K', Kk, 'gk', gk, ':', pg.evaluate(f'mesure({Kk},{gk},40)'), 'ms par dessin', err or '')
        nav.close()
