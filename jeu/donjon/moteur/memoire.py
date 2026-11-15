"""Ce que pèse un écran du donjon sur un iPhone : flock /tmp/brumeval-pw.lock python3 memoire.py [adresse…]

Romain, 15 novembre : « ça rame de partout », « ça fait que quitter sur l'iPhone ». Un iPhone ferme l'onglet quand il mange trop
de mémoire : ce robot compte ce qui la mange (RAPIDITE.md R6 et R9), en émulation iPhone couché (844 × 390, densité 3) :
  - les CALQUES de la carte graphique (CDP LayerTree) : leur nombre, et leur poids (largeur × hauteur × densité² × 4 octets) ;
  - les IMAGES décodées (chaque image distincte : largeur × hauteur × 4 octets) ;
  - les TOILES (canvas) encore vivantes ; les éléments de la page ; les animations en cours.
Sans adresse : Léo phase 1, Léo phase 2, la salle des rats (au repos, puis pendant un critique).
Une adresse = ce qui suit « index.html » (par exemple '?combat=leo&phase=2&vu=1')."""
import os, sys, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
DPR = 3
OBJETS = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes&graine=7'

PAGE_JS = """() => {
  var vu = {}, img = 0, nImg = 0, gros = [];
  function compte(src, w, h){ if(!src || vu[src] || !w) return; vu[src] = 1; nImg++; img += w * h * 4; gros.push([w * h * 4, w + '×' + h]); }
  document.querySelectorAll('img').forEach(function(i){ compte(i.currentSrc || i.src, i.naturalWidth, i.naturalHeight); });
  var toiles = 0; document.querySelectorAll('canvas').forEach(function(c){ toiles += c.width * c.height * 4; });
  gros.sort(function(a, b){ return b[0] - a[0]; });
  return {images:img, nImages:nImg, gros:gros.slice(0, 5).map(function(g){ return g[1]; }), toiles:toiles,
          noeuds:document.getElementsByTagName('*').length, anims:document.getAnimations().length,
          wc:[].filter.call(document.querySelectorAll('*'), function(e){ var w = getComputedStyle(e).willChange; return w && w !== 'auto'; }).length};
}"""


class Sonde:
    def __init__(self, nav, q):
        self.ctx = nav.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
        self.pg = self.ctx.new_page(); self.errs = []
        self.pg.on('pageerror', lambda e: self.errs.append(str(e)))
        self.pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        self.pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        self.pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
        self.cdp = self.ctx.new_cdp_session(self.pg)
        self.calques = []
        self.cdp.on('LayerTree.layerTreeDidChange', lambda e: self._note(e))
        self.pg.goto(PAGE + q)

    def _note(self, e):
        if e.get('layers') is not None:
            self.calques = e['layers']

    def releve(self):
        if not getattr(self, 'ecoute', False):
            self.ecoute = True; self.cdp.send('LayerTree.enable')       # (après le chargement : sinon, rien n'arrive)
            self.pg.wait_for_timeout(400)
        self.pg.wait_for_timeout(120)
        c = [l for l in self.calques if l.get('drawsContent')]
        poids = sum(l['width'] * l['height'] for l in c) * DPR * DPR * 4
        grand = max(c, key=lambda l: l['width'] * l['height']) if c else None
        r = self.pg.evaluate(PAGE_JS)
        r.update({'calques': len(c), 'poidsCalques': poids, 'grand': ('%d×%d' % (grand['width'], grand['height'])) if grand else '-'})
        return r

    def fermer(self):
        self.ctx.close()


def ligne(nom, r):
    print('%-34s %4d calques %6.0f Mo (le plus grand %s) | images %3d : %5.0f Mo %s | toiles %4.1f Mo | %5d éléments, %3d animations, %3d will-change' % (
        nom, r['calques'], r['poidsCalques'] / 1e6, r['grand'], r['nImages'], r['images'] / 1e6, r['gros'][:3], r['toiles'] / 1e6, r['noeuds'], r['anims'], r['wc']), flush=True)


def pire(s, duree, pas=150):
    """le pire relevé pendant « duree » millisecondes"""
    p = None
    for _ in range(max(1, duree // pas)):
        r = s.releve()
        if p is None or r['poidsCalques'] + r['images'] > p['poidsCalques'] + p['images']:
            p = r
        s.pg.wait_for_timeout(pas - 120 if pas > 120 else 10)
    return p


def leo(nav, phase):
    s = Sonde(nav, '?combat=leo&phase=%d&vu=1&%s' % (phase, OBJETS))
    s.pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
    s.pg.wait_for_timeout(1500)
    ligne('Léo phase %d, au repos' % phase, s.releve())
    ligne('Léo phase %d, 12 s de combat (pire)' % phase, pire(s, 12000))
    print('   erreurs :', s.errs or 'aucune')
    s.fermer()


def salle(nav, nom='rats'):
    s = Sonde(nav, '?combat=%s&vu=1&potions=feu,huile,baume&graine=7' % nom)
    s.pg.wait_for_function("() => window.DJ && DJ.Combat && DJ.Combat.etat && DJ.Combat.etat() && DJ.Combat.etat().libre", timeout=120000)
    s.pg.wait_for_timeout(1200)
    ligne('salle « %s », au repos' % nom, s.releve())
    print('   erreurs :', s.errs or 'aucune')
    return s


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    with sync_playwright() as p:
        nav = p.chromium.launch()
        if args:
            for q in args:
                s = Sonde(nav, q); s.pg.wait_for_timeout(6000); ligne(q[:34], s.releve()); ligne('   8 s (pire)', pire(s, 8000)); s.fermer()
        else:
            leo(nav, 1); leo(nav, 2); leo(nav, 3)
        nav.close()
