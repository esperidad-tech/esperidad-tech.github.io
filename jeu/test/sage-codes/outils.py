"""Outils communs aux bancs d'essai du Sage (alphabet + runes)."""
import os, sys, random
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))
# D'autres modules reconstruisent dist/ en même temps : on travaille sur une copie vérifiée,
# prise juste après `python3 build.py`.
import shutil, time as _t
INST = os.path.join(ICI, '.instantane')
os.makedirs(INST, exist_ok=True)
import subprocess
def _copier(nom, fin):
    for _ in range(20):
        subprocess.run([sys.executable, os.path.join(RACINE, 'build.py')], cwd=RACINE, capture_output=True)
        src = os.path.join(RACINE, 'dist', nom)
        txt = open(src, encoding='utf-8').read()
        if 'MJ.sageCodes = {' in txt and "enregistrer('runes'" in txt.split('mj-sage-codes.js ===== */')[-1] and txt.rstrip().endswith(fin):
            open(os.path.join(INST, nom), 'w', encoding='utf-8').write(txt); return
        _t.sleep(1)
    raise RuntimeError('dist/' + nom + ' incomplet : relancer python3 build.py')
_copier('salle-mini-jeux.html', '</script>')
_copier('index.html', '</html>')
SALLE = 'file://' + os.path.join(INST, 'salle-mini-jeux.html')
JEU = 'file://' + os.path.join(INST, 'index.html')
CAPT = os.path.join(ICI, 'captures')
os.makedirs(CAPT, exist_ok=True)
TAILLES = {'tab': (800, 1280), 'pay': (1280, 800), 'tel': (390, 844)}

def page(b, taille='tab', url=SALLE):
    w, h = TAILLES[taille]
    pg = b.new_context(viewport={'width': w, 'height': h}).new_page()
    pg._errs = []
    pg.on('pageerror', lambda e: pg._errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: pg._errs.append('console: ' + m.text) if m.type == 'error' else None)
    pg.goto(url)
    pg.wait_for_timeout(300)
    return pg

def forcer(pg, jeu, params=None, mods=None):
    """Patch de test : ajoute des params / mods aux réglages de la salle pour ce jeu."""
    pg.evaluate('''([jeu, params, mods]) => {
        if(!window.__regOrig) window.__regOrig = MJ.reglages;
        MJ.reglages = function(t, n, m){
            if(t === jeu && mods) m = Object.assign({}, m || {}, mods);
            const p = window.__regOrig(t, n, m);
            if(t === jeu && params) Object.assign(p, params);
            return p;
        };
    }''', [jeu, params, mods])

def restaurer(pg):
    pg.evaluate('() => { if(window.__regOrig) MJ.reglages = window.__regOrig; }')

def lancer(pg, jeu, niv, params=None, mods=None, go=True):
    if params or mods: forcer(pg, jeu, params, mods)
    pg.click('[data-niv="%d"]' % niv)
    pg.click('[data-jeu="%s"]' % jeu)
    pg.wait_for_timeout(350)
    if go:
        pg.click('.mj-go')
        hook = '__mjsAlpha' if jeu == 'alphabet' else '__mjsRunes'
        pg.wait_for_function('() => !!window.%s' % hook, timeout=8000)
        pg.wait_for_timeout(250)

def quitter(pg):
    if pg.locator('.mj-continuer').count():
        pg.locator('.mj-continuer').first.click()
    elif pg.locator('.sl-quitter').count():
        pg.locator('.sl-quitter').first.click()
    pg.wait_for_timeout(300)

def resultat(pg, t=8000):
    pg.wait_for_selector('.mj-resultat', timeout=t)
    return {'ok': pg.locator('.mj-resultat.ok').count() > 0, 'texte': pg.inner_text('.mj-resultat').replace('\n', ' | ')}

# ---------- alphabet ----------
def alpha(pg):
    return pg.evaluate('() => window.__mjsAlpha ? {systeme: __mjsAlpha.systeme, variante: __mjsAlpha.variante, message: __mjsAlpha.message, cases: __mjsAlpha.cases, coeurs: __mjsAlpha.coeurs(), temps: __mjsAlpha.temps, cachees: __mjsAlpha.cachees, deduit: __mjsAlpha.deduit} : null')

def taper(pg, i, lettre):
    pg.click('.mjs-case[data-i="%d"]' % i)
    pg.click('.mjs-t[data-l="%s"]' % lettre)

def remplir(pg, faux=0, ordre_aleatoire=True):
    """Robot qui connaît la réponse : remplit les cases (dans le désordre), avec `faux` lettres fausses."""
    a = alpha(pg)
    cases = [c for c in a['cases'] if not c['donne']]
    if ordre_aleatoire: random.shuffle(cases)
    fausses = set(c['i'] for c in cases[:faux])
    for c in cases:
        l = c['l']
        if c['i'] in fausses: l = 'Z' if l != 'Z' else 'Y'
        taper(pg, c['i'], l)
    return a, fausses
