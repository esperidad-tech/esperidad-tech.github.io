"""Outils partagés des bancs d'essai des jeux d'observation (differences, double, insectes)."""
import os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.abspath(os.path.join(ICI, '..', '..', 'dist', 'salle-mini-jeux.html'))
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
TAILLES = [(390, 844), (800, 1280), (1280, 800)]

# Lance un mini-jeu dans le cadre plein écran de la salle, avec des params sur mesure,
# et enregistre chaque appel de fin dans window.__fins.
LANCER = """([type, niv, mods, extra]) => {
  const plein = document.getElementById('sl-plein');
  plein.innerHTML = '<button class="sl-quitter">← Retour</button><div class="sl-cadre"></div>';
  plein.hidden = false; document.body.classList.add('sl-bloque');
  const p = MJ.reglages(type, niv, mods || {});
  Object.assign(p, extra || {});
  window.__fins = [];
  window.__partie = MJ.lancer(plein.querySelector('.sl-cadre'), type, p, r => window.__fins.push(r), {});
  return p.lignes.map(l => l.nom + ' : ' + l.val);
}"""

def nouvelle_page(nav, w, h, erreurs):
    ctx = nav.new_context(viewport={'width': w, 'height': h}, has_touch=True)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    page = ctx.new_page()
    page.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'ERR_FAILED' not in m.text and 'fonts.g' not in m.text else None)
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.goto(URL, wait_until='domcontentloaded')
    return ctx, page

def lancer(page, jeu, niv=3, mods=None, extra=None, go=True):
    lignes = page.evaluate(LANCER, [jeu, niv, mods or {}, extra or {}])
    if go:
        page.wait_for_timeout(250)
        page.click('.mj-go')
        page.wait_for_timeout(450)
    return lignes

def etat(page):
    return page.evaluate("() => { const r = [...document.querySelectorAll('.mjo-jeu')].pop(); return r && r.mjoEtat ? r.mjoEtat() : null; }")

def attendre_resultat(page, ms=120000):
    page.wait_for_selector('.mj-resultat', timeout=ms)
    page.wait_for_timeout(300)

def continuer(page):
    page.click('.mj-continuer')
    page.wait_for_timeout(150)
    return page.evaluate('window.__fins')
