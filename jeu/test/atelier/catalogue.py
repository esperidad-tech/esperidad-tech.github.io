"""Tous les objets de l'atelier posés d'un coup (contrôle visuel des dessins)."""
import os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'index.html')
def o(i, t, x, y, **kw):
    d = {"id": "o%d" % i, "t": t, "x": x, "y": y, "f": 0, "v": kw.pop('v', 0), "sur": kw.pop('sur', None)}
    d.update(kw); return d
objs = [
  o(1, 'guirlande', 215, 110), o(2, 'casier', 140, 300), o(3, 'herbes', 290, 300), o(4, 'thermometre', 340, 200),
  o(5, 'etagere', 470, 500), o(6, 'tableau', 690, 200), o(7, 'horloge', 820, 214),
  o(8, 'tapis', 480, 800, v=2), o(9, 'tonneau', 120, 700, cases=[{"e": ["baies"], "i": {"baies": 4, "miel": 2}}]),
  o(10, 'serre', 300, 640), o(11, 'athanor', 920, 820), o(12, 'etal', 500, 640),
  o(13, 'coussin', 380, 830, v=1), o(14, 'chat', 560, 820, v=2), o(15, 'tabouret', 260, 840),
  o(16, 'bougies', 0, 0, sur={"o": "cheminee", "k": 0, "dx": -80}), o(17, 'oeil_cristal', 0, 0, sur={"o": "cheminee", "k": 0, "dx": 10}),
  o(18, 'mortier', 0, 0, sur={"o": "cheminee", "k": 0, "dx": 100}), o(19, 'herbier', 0, 0, sur={"o": "etabli", "k": 0, "dx": -110}),
  o(20, 'fioles_ether', 0, 0, sur={"o": "o5", "k": 0, "dx": -40}), o(21, 'grand_grimoire', 0, 0, sur={"o": "o5", "k": 0, "dx": 50}),
  o(22, 'loupe_doree', 0, 0, sur={"o": "o5", "k": 1, "dx": -40}), o(23, 'pierre_transmu', 0, 0, sur={"o": "o5", "k": 1, "dx": 40}),
  o(24, 'chat', 0, 0, v=1, sur={"o": "o15", "k": 0, "dx": 0}), o(25, 'plante', 690, 840, v=1), o(26, 'lampe', 0, 0, on=0, sur={"o": "etabli", "k": 0, "dx": -40}),
  o(27, 'sac', 80, 840, cases=[{"e": [], "i": {"champignon": 3}}]),
]
objs[1]['cases'] = [{"e": ["eau"], "i": {"eau": 2}}, {"e": ["x-lune"], "i": {}}, {"e": ["miel", "x-coeur"], "i": {"miel": 1}}, {"e": [], "i": {}}]
etat = {"v": 1, "n": 60, "nc": 0, "cartons": [{"id": "k1", "t": "carton", "reste": ["caisse"], "ouvert": 1}, {"id": "k2", "t": "colis", "reste": ["alambic"], "ouvert": 0}],
        "objets": objs, "panier": {}, "boutique": [], "flaque": 1}
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w, h) in [(1280, 800)]:
        pg = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.goto(URL)
        pg.add_style_tag(content='#reglages{display:none!important}')
        pg.evaluate("banc.etat = " + json.dumps(etat) + "; banc.creer()")
        pg.wait_for_timeout(700)
        pg.screenshot(path=os.path.join(ICI, 'captures', f'{w}x{h}-catalogue.png'))
        el = pg.query_selector('.at-piece')
        el.screenshot(path=os.path.join(ICI, 'captures', 'catalogue-piece.png'))
        print('erreurs', errs)
    b.close()
