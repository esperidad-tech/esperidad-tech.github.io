"""Banc d'essai automatique des mini-jeux Barde + Sage.
Usage : python3 essai.py [jeu ...]   (captures dans test/mj-b/captures/)"""
import os, sys, time, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'index.html') + ('?persos=1' if os.environ.get('PERSOS') else '')
SORTIE = os.path.join(ICI, 'captures')
os.makedirs(SORTIE, exist_ok=True)
JEUX = sys.argv[1:] or ['mensonge', 'ordre', 'ragots', 'alphabet', 'plans', 'grille', 'runes']
TAILLES = {'tel': (390, 844), 'tab': (800, 1280)}
erreurs = []

def attendre_resultat(page, t=30):
    page.wait_for_selector('.mj-resultat', timeout=t * 1000)

def lancer(page, jeu, niv, mods=None):
    page.evaluate('([j,n,m]) => lancer(j, n, m)', [jeu, niv, mods or {}])
    page.wait_for_timeout(700)

def go(page):
    page.click('.mj-go')
    page.wait_for_timeout(400)

def gagner(page, jeu):
    if jeu == 'mensonge':
        page.evaluate('''() => new Promise(res => {
            const fait = {};
            const iv = setInterval(() => {
                const r = document.querySelector('.mjb-mensonge');
                if (document.querySelector('.mj-resultat') || !r) { clearInterval(iv); res(); return; }
                const ph = r.dataset.phrase;
                if (r.dataset.ment === '1' && !fait[ph]) { fait[ph] = 1; setTimeout(() => document.querySelector('.mjb-accuse').click(), 700); }
            }, 100);
        })''')
    elif jeu == 'ordre':
        while True:
            ks = page.eval_on_selector_all('.mjb-carte:not(.part)', 'els => els.map(e => +e.dataset.k)')
            bons = sorted(k for k in ks if k >= 0)
            if not bons: break
            page.click('.mjb-carte[data-k="%d"]:not(.part)' % bons[0])
            page.wait_for_timeout(450)
    elif jeu == 'ragots':
        for _ in range(12):
            if page.query_selector('.mjb-fin-ragots'): break
            page.wait_for_timeout(200)
            v = page.eval_on_selector('.mjb-ragots', 'r => r.dataset.vrai')
            page.click('.mjb-vrai' if v == '1' else '.mjb-faux')
            page.wait_for_timeout(1500)
        page.click('.mjb-fin-ragots')
    elif jeu == 'alphabet':
        for _ in range(60):
            cur = page.eval_on_selector('.mjb-alphabet', 'r => r.dataset.cur')
            if not cur or page.query_selector('.mjb-alphabet.gagne'): break
            page.click('.mjb-touche[data-l="%s"]' % cur)
            page.wait_for_timeout(120)
    elif jeu == 'plans':
        r = int(float(page.eval_on_selector('.mjb-plans', 'r => r.dataset.r')))
        while r % 360 != 0:
            page.click('[data-rot="%d"]' % (-15 if r > 0 else 15))
            r += -15 if r > 0 else 15
        dx = float(page.eval_on_selector('.mjb-plans', 'r => r.dataset.dx'))
        dy = float(page.eval_on_selector('.mjb-plans', 'r => r.dataset.dy'))
        box = page.query_selector('.mjb-plans-svg').bounding_box()
        k = box['width'] / 300
        cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
        page.mouse.move(cx, cy); page.mouse.down()
        page.mouse.move(cx - dx * k / 2, cy - dy * k / 2, steps=6)
        page.mouse.move(cx - dx * k, cy - dy * k, steps=6)
        page.mouse.up()
        page.wait_for_timeout(300)
        page.click('.mjb-poser')
    elif jeu == 'grille':
        sol = json.loads(page.eval_on_selector('.mjb-grille', 'r => r.dataset.sol'))
        for r, c in enumerate(sol):
            for _ in range(3):
                t = page.inner_text('.mjb-cellule[data-r="%d"][data-c="%d"]' % (r, c))
                if t.strip() == '✓': break
                page.click('.mjb-cellule[data-r="%d"][data-c="%d"]' % (r, c))
                page.wait_for_timeout(80)
        page.click('.mjb-valider')
    elif jeu == 'runes':
        for _ in range(40):
            infos = page.eval_on_selector_all('.mjb-tuile', 'els => els.map(e => [+e.dataset.pos, +e.dataset.home])')
            mal = [(p, h) for p, h in infos if p != h]
            if not mal: break
            p, h = mal[0]
            q = [pp for pp, hh in infos if hh == p][0]
            a = page.query_selector('.mjb-tuile[data-pos="%d"]' % q).bounding_box()
            b = page.query_selector('.mjb-tuile[data-pos="%d"]' % p).bounding_box()
            page.mouse.move(a['x'] + a['width'] / 2, a['y'] + a['height'] / 2); page.mouse.down()
            page.mouse.move(a['x'] + a['width'] / 2 + 20, a['y'] + a['height'] / 2 + 5, steps=3)
            page.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2, steps=8)
            page.mouse.up(); page.wait_for_timeout(150)
        for _ in range(80):
            rots = page.eval_on_selector_all('.mjb-tuile', 'els => els.map(e => [+e.dataset.pos, +e.dataset.rot, e.classList.contains("fixe")])')
            todo = [p for p, r, f in rots if r != 0 and not f]
            if not todo or page.query_selector('.mjb-runes.gagne'): break
            page.click('.mjb-tuile[data-pos="%d"]' % todo[0])
            page.wait_for_timeout(90)

def perdre(page, jeu):
    if jeu == 'mensonge':
        page.evaluate('''() => new Promise(res => {
            const iv = setInterval(() => {
                const r = document.querySelector('.mjb-mensonge');
                if (document.querySelector('.mj-resultat') || !r) { clearInterval(iv); res(); return; }
                if (r.dataset.ment === '0') document.querySelector('.mjb-accuse').click();
            }, 400);
        })''')
    elif jeu == 'ordre':
        for _ in range(10):
            if page.query_selector('.mj-resultat'): break
            ks = page.eval_on_selector_all('.mjb-carte:not(.part)', 'els => els.map(e => +e.dataset.k)')
            bons = sorted(k for k in ks if k >= 0)
            faux = [k for k in ks if k != bons[0]]
            page.click('.mjb-carte[data-k="%d"]:not(.part)' % faux[0]); page.wait_for_timeout(1000)
    elif jeu == 'ragots':
        for _ in range(12):
            if page.query_selector('.mjb-fin-ragots'): break
            page.wait_for_timeout(200)
            v = page.eval_on_selector('.mjb-ragots', 'r => r.dataset.vrai')
            page.click('.mjb-faux' if v == '1' else '.mjb-vrai'); page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(SORTIE, '_recap.png'))
        page.click('.mjb-fin-ragots')
    elif jeu == 'alphabet':
        for _ in range(20):
            if page.query_selector('.mj-resultat'): break
            cur = page.eval_on_selector('.mjb-alphabet', 'r => r.dataset.cur')
            mauvaise = 'Z' if cur != 'Z' else 'A'
            page.click('.mjb-touche[data-l="%s"]' % mauvaise); page.wait_for_timeout(800)
    elif jeu == 'plans':
        for _ in range(10):
            if page.query_selector('.mj-resultat'): break
            page.click('.mjb-poser'); page.wait_for_timeout(900)
    elif jeu == 'grille':
        for _ in range(10):
            if page.query_selector('.mj-resultat'): break
            page.click('.mjb-valider'); page.wait_for_timeout(900)
    elif jeu == 'runes':
        for _ in range(80):
            if page.query_selector('.mj-resultat') or page.query_selector('.mjb-runes.eteint'): break
            page.click('.mjb-tuile:not(.fixe)'); page.wait_for_timeout(60)

with sync_playwright() as p:
    nav = p.chromium.launch()
    for nom, (w, h) in TAILLES.items():
        ctx = nav.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=False)
        page = ctx.new_page()
        page.on('console', lambda m: erreurs.append((nom, m.text)) if m.type == 'error' else None)
        page.on('pageerror', lambda e: erreurs.append((nom, str(e))))
        page.goto(URL)
        page.wait_for_timeout(500)
        for jeu in JEUX:
            niv = 6 if nom == 'tab' else 2
            lancer(page, jeu, niv)
            page.wait_for_timeout(1500)
            page.screenshot(path=os.path.join(SORTIE, '%s-%s-1intro.png' % (nom, jeu)))
            go(page)
            page.wait_for_timeout(2600 if jeu == 'mensonge' else 600)
            page.screenshot(path=os.path.join(SORTIE, '%s-%s-2jeu.png' % (nom, jeu)))
            t0 = time.time()
            gagner(page, jeu)
            try:
                attendre_resultat(page, 40)
            except Exception as e:
                erreurs.append((nom, '%s : pas de résultat après victoire (%s)' % (jeu, e)))
            page.wait_for_timeout(700)
            page.screenshot(path=os.path.join(SORTIE, '%s-%s-3gagne.png' % (nom, jeu)))
            ok = page.query_selector('.mj-resultat.ok') is not None
            if not ok: erreurs.append((nom, '%s : la partie gagnante est marquée perdue' % jeu))
            page.click('.mj-continuer'); page.wait_for_timeout(200)
            fins = page.evaluate('() => window.__fins.length')
            # partie perdue, niveau 8
            lancer(page, jeu, 8)
            go(page)
            perdre(page, jeu)
            try:
                attendre_resultat(page, 60)
            except Exception as e:
                erreurs.append((nom, '%s : pas de résultat après défaite (%s)' % (jeu, e)))
            page.wait_for_timeout(500)
            if page.query_selector('.mj-resultat.ok'): erreurs.append((nom, '%s : la partie perdante est marquée gagnée' % jeu))
            page.screenshot(path=os.path.join(SORTIE, '%s-%s-4perdu.png' % (nom, jeu)))
            page.click('.mj-continuer'); page.wait_for_timeout(200)
            fins2 = page.evaluate('() => window.__fins.length')
            if fins2 != fins + 1: erreurs.append((nom, '%s : fin appelée %d fois' % (jeu, fins2 - fins)))
            print(nom, jeu, 'ok', round(time.time() - t0, 1), 's', flush=True)
        ctx.close()
    nav.close()
print('ERREURS :', json.dumps(erreurs, ensure_ascii=False, indent=1))
