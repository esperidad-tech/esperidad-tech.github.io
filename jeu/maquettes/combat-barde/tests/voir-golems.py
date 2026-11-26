# la planche du bestiaire : chaque golem, tourné des trois façons, dans ses états
import pathlib, sys
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'outils.js').read_text() + '\n' + (src / 'golems.js').read_text()
html = "<!DOCTYPE html><html><body style='margin:0;background:#16303a'><canvas id=c></canvas><script>" + code + r"""
function planche(mode) {
  const c = document.getElementById('c'), Z = 2.6; c.width = 1500; c.height = mode === 'pas' ? 1560 : 1700; const g = c.getContext('2d');
  g.fillStyle = '#1b3a45'; g.fillRect(0, 0, c.width, c.height);
  const types = ['trotteur', 'soldat', 'bouclier', 'lanceur', 'fonceur', 'danseur', 'gros']; let t0 = performance.now(), n = 0;
  types.forEach((ty, j) => {
    const cols = mode === 'pas' ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ yaw: 0, etat: 'marche', k: i % 5, pied: i >= 5 ? 1 : 0 }))
      : [{ yaw: -1, k: 2 }, { yaw: 0, k: 2 }, { yaw: 1, k: 2 }, { yaw: 1, etat: 'arme' }, { yaw: 0, etat: 'frappe' }, { yaw: -1, k: 4, pied: 1 }, ty === 'fonceur' ? { yaw: 1, etat: 'gratte', k: 1 } : ty === 'danseur' ? { yaw: 0, etat: 'tourne', k: 1 } : ty === 'bouclier' ? { yaw: 0, sansBouclier: true, k: 2 } : { yaw: 0, k: 0 }, ty === 'fonceur' ? { yaw: -1, etat: 'charge' } : { yaw: 0, gele: true, k: 2 }];
    cols.forEach((o, i) => { const x = (mode === 'pas' ? 80 : 100) + i * (mode === 'pas' ? 146 : 185), y = 190 + j * (mode === 'pas' ? 215 : 235);
      g.save(); g.translate(x, y); g.scale(Z, Z); Golems.peindre(g, ty, o); g.restore(); n++; });
  });
  return Math.round((performance.now() - t0) / n * 10) / 10;
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for mode in sys.argv[1:] or ['vues']:
        pg = nav.new_context(viewport={'width': 1500, 'height': 1700}).new_page(); err = []
        pg.on('pageerror', lambda e: err.append(str(e))); pg.set_content(html)
        print(mode, pg.evaluate(f"planche('{mode}')"), 'ms par golem', err or ''); pg.screenshot(path=f'vues/golems-{mode}.png', full_page=False)
    nav.close()
