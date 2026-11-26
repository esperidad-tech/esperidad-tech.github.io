# peint le décor seul (téléphone et tablette) pour le regarder
import pathlib, sys
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'outils.js').read_text() + '\n' + (src / 'decor.js').read_text()
html = "<!DOCTYPE html><html><body style='margin:0;background:#000'><canvas id=c></canvas><script>" + code + r"""
function voir(W, H, K, niv, mega) {
  const cmdH = 112, L = { W, H }; L.bardeY = Math.round(H - cmdH - 46); L.bardeX = W / 2;
  L.placeY0 = Math.round(Math.max(244, Math.min(300, H * 0.31))); L.grosY = L.placeY0 + 6; L.ruelleY = Math.round((L.placeY0 + L.bardeY) / 2 - 20);
  L.gk = Math.max(0.78, Math.min(1.12, (L.grosY - 8) / 266));
  const t0 = performance.now(); const F = Decor.construire(L, W, H, K); const dt = performance.now() - t0;
  const c = document.getElementById('c'); c.width = W * K; c.height = H * K; c.style.width = W + 'px';
  const g = c.getContext('2d'); g.drawImage(F.fond, 0, 0); g.scale(K, K);
  Decor.lumieres(g, 3.3, 0.7, niv, mega, 3);
  if (mega) { Decor.spots(g, 3.3, 0.7, 1, 3, 4); Decor.faisceaux(g, 1, 3); }
  return Math.round(dt);
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for nom, W, H, K, niv, mega in [('tel', 420, 909, 2, 1, 0), ('tel-mega', 420, 909, 2, 3, 1), ('tab', 420, 677, 2, 0, 0)]:
        pg = nav.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2).new_page(); err = []
        pg.on('pageerror', lambda e: err.append(str(e))); pg.set_content(html)
        dt = pg.evaluate(f'voir({W},{H},{K},{niv},{mega})'); pg.screenshot(path=f'vues/decor-{nom}.png'); print(nom, dt, 'ms', err or '')
    nav.close()
