# la planche de Grosbec : il se tourne, puis ses gestes image par image
import pathlib, sys
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'outils.js').read_text() + '\n' + (src / 'grosbec.js').read_text()
html = "<!DOCTYPE html><html><body style='margin:0;background:#0c2a36'><canvas id=c></canvas><script>" + code + r"""
function planche(mode) {
  const Z = 1.25, cw = 330, chh = 400; let poses = [];
  const G = Gros.G, P = 0.5, R = Gros.REPOS;
  if (mode === 'tour') poses = [-0.7, -0.35, 0, 0.35, 0.7].map(a => [{ cap: a * 0.7, tors: a * 0.3, tete: a * 0.5 }, {}]).concat([[{ tete: -0.75 }, {}], [{ tete: 0.75, hoche: 0.2 }, {}], [{ penche: 0.35, bas: 14 }, { colere: 1 }], [{ gx: -31, gy: -98, gz: 13, dx: 31, dy: -98, dz: 13, penche: 0.15, bas: 8, tete: 0.2 }, { fissures: 5 }], [{ gx: -27, gy: -113, gz: 15, dx: 27, dy: -113, dz: 15, go: 1, do_: 1, roulis: 0.1, bas: 11, hoche: 0.22, yeux: 0.4 }, { fissures: 5 }]]);
  else { const cles = mode === 'envoi' ? G.envoi(1, P) : mode === 'envoiG' ? G.envoi(-1, P) : mode === 'silence' ? G.silence() : G.decharge(1, P), t0 = cles[0][0], t1 = cles[cles.length - 1][0];
    for (let i = 0; i < 10; i++) { const t = t0 + (t1 - t0) * (i + 0.5) / 10; poses.push([Gros.geste(cles, t) || {}, {}, t]); } }
  const c = document.getElementById('c'); c.width = cw * 5; c.height = chh * 2; const g = c.getContext('2d');
  Gros.construire(2, Z); const t0 = performance.now();
  poses.forEach(([o, e, t], i) => { const x = (i % 5) * cw + cw / 2, y = Math.floor(i / 5) * chh + chh - 22;
    g.fillStyle = 'rgba(120,235,255,.10)'; g.beginPath(); g.arc(x, y - 190, 150, 0, 7); g.fill();
    g.save(); g.translate(x, y); g.scale(Z, Z); Gros.image(g, o, { pul: 0.5, ...e }, 1.2 + i); g.restore();
    if (t != null) { g.fillStyle = '#fff'; g.font = '14px sans-serif'; g.fillText(t.toFixed(2) + ' s', x - 150, y - 360); } });
  return Math.round((performance.now() - t0) / poses.length * 10) / 10;
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for mode in sys.argv[1:] or ['tour']:
        pg = nav.new_context(viewport={'width': 1650, 'height': 800}).new_page(); err = []
        pg.on('pageerror', lambda e: err.append(str(e))); pg.set_content(html)
        try: print(mode, pg.evaluate(f"planche('{mode}')"), 'ms par dessin', err or '')
        except Exception as e: print(mode, 'ERREUR', str(e)[:600], err)
        pg.screenshot(path=f'vues/grosbec-{mode}.png')
    nav.close()
