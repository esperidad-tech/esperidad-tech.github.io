# la planche des golems de la version 9 : chaque golem dans sa boîte (le cadre gris = la toile cuite), sous ses angles et dans ses états
import pathlib, sys
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
quoi = sys.argv[1] if len(sys.argv) > 1 else 'vues'
code = (src / 'outils.js').read_text() + '\n' + (src / 'golems.js').read_text()
html = "<!DOCTYPE html><html><body style='margin:0;background:#16303a'><canvas id=c></canvas><script>" + code + r"""
const types = ['trotteur', 'soldat', 'bouclier', 'lanceur', 'fonceur', 'danseur', 'gros'], Z = 1.5, CW = 250, CH = 300;
const COLS = { vues: [{ yaw: 0 }, { yaw: 1 }, { yaw: -1 }, { yaw: 0, etat: 'arme' }, { yaw: 0, etat: 'frappe' }, { yaw: 1, etat: 'frappe' }],
  pas: [{ k: 0, pied: 0 }, { k: 2, pied: 0 }, { k: 3, pied: 0 }, { k: 4, pied: 0 }, { k: 0, pied: 1 }, { k: 4, pied: 1, yaw: 1 }] }['""" + quoi + r"""'];
const SPEC = { bouclier: { sansBouclier: true }, fonceur: { etat: 'gratte', k: 1 }, danseur: { etat: 'tourne', k: 1 }, gros: { gele: true }, lanceur: { yaw: -1, etat: 'frappe' }, trotteur: { gele: true }, soldat: { yaw: -1, etat: 'arme' } };
const c = document.getElementById('c'); c.width = CW * 7; c.height = CH * 7; const g = c.getContext('2d'); g.fillStyle = '#1b3a45'; g.fillRect(0, 0, c.width, c.height);
Golems.regler(2);
types.forEach((ty, j) => [...COLS, SPEC[ty]].forEach((o, i) => {
  const T = Golems.TYPES[ty], [w, h, ox, oy] = T.boite, x = i * CW + CW / 2, y = j * CH + CH - 22;
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.strokeRect(x - ox * Z, y - oy * Z, w * Z, h * Z);
  Golems.dessiner(g, ty, x, y, Z, { yaw: 0, etat: 'marche', k: 2, pied: 0, ...o });
  if (!i) { g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText(T.nom, x - 110, y - CH + 40); }
}));
</script></body></html>"""
out = pathlib.Path(__file__).resolve().parent / 'vues'
(out / 'g9.html').write_text(html)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = nav.new_page(viewport={'width': 1750, 'height': 2100}); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto((out / 'g9.html').as_uri()); pg.wait_for_timeout(500); pg.screenshot(path=str(out / f'g9-{quoi}.png'), full_page=True); print('erreurs :', err or 'aucune'); nav.close()
