"""Quitter le chaudron ne coûte pas les ingrédients (Romain, 14 novembre, 16 h 56 ; atelier.js : noterVerses, rendreQuittes, rendreVerses).
L'Alchimiste de l'enquête 2 range les ingrédients de la potion de vérité, ouvre le chaudron, en verse (le crochet onVerse du mini-jeu), puis :
  1. la page se recharge (l'appli fermée, la tablette qui plante) : à la réouverture de l'atelier, les ingrédients sont revenus ;
  2. il abandonne (🏳️ deux fois) : ils reviennent tout de suite ;
  3. il met le chaudron en pause (un autre onglet) : rien ne revient (la préparation continue), puis la page se recharge : ils reviennent.
Et le filet de l'enquête 1 : un lieu déjà cueilli se recueille tant qu'il manque à l'Alchimiste ce qu'une recette demande d'ici (M.dejaCueilli).
   BRUMEVAL_DIST=<dossier construit> python3 tools/chaudron-quitter.py"""
import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def creer(b, enq):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}).new_page(); pg.set_default_timeout(8000)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alchimiste'); pg.click('[data-act=crea-fin]')
    if enq > 1:
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click(f'[data-act=mode-test][data-i="{enq}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(500)
    for _ in range(5):
        for sel in ['[data-act=lettre-suite]', '[data-act=commencer]']:
            if pg.locator(sel).count():
                try: pg.click(sel, force=True)
                except Exception: pass
        pg.wait_for_timeout(400)
    return pg

def stock(pg): return pg.evaluate("() => JSON.stringify(Atelier.compter(M.S.atelier))")

def preparer(pg):
    """range de quoi faire la recette (et un de plus), ouvre le chaudron et verse tout ce que demande la recette"""
    rid = pg.evaluate("() => M.recettesConnues()[0]")
    besoin = pg.evaluate(f"() => DONNEES.RECETTES['{rid}'].ingr")
    pg.evaluate("""(b) => { var S = M.S; S.fioles = 3; M.P().tutoCueillette = 'fini'; var fx = S.atelier.objets.filter(o => o.cases && o.cases.length)[0];
      b.forEach((x, i) => { fx.cases[i].i[x[0]] = (fx.cases[i].i[x[0]] || 0) + x[1] + 1; }); M.UI.modal = null; M.P().onglet = 'role'; M.sauver(); M.render(); }""", besoin)
    pg.wait_for_timeout(1500)
    avant = stock(pg)
    pg.evaluate("() => { if(MJ.__l0) return; MJ.__l0 = MJ.lancer; MJ.lancer = function(el, type, p){ if(type === 'chaudron') window.__p = p; return MJ.__l0.apply(this, arguments); }; }")
    pg.locator('#atelier-ici [data-obj=ch]').first.click(); pg.wait_for_timeout(700)
    pg.locator('#atelier-ici .at-bulle-pa', has_text='Préparer').first.click(force=True); pg.wait_for_timeout(700)
    pg.locator(f'#atelier-ici .at-ch-go[data-r="{rid}"]').first.click(force=True); pg.wait_for_timeout(1200)
    verifier(pg.evaluate("() => !!document.querySelector('.at-mj') && !!window.__p"), 'le chaudron est ouvert (' + rid + ')')
    for x in besoin:
        for k in range(x[1]): pg.evaluate(f"() => window.__p.onVerse('{x[0]}')")
    pendant = stock(pg)
    verifier(pendant != avant and pg.evaluate("() => (M.S.atelier.verses || []).length") == sum(x[1] for x in besoin), 'versés : ils sortent des rangements, et sont notés dans la sauvegarde')
    return avant

def rouvrir(pg):
    pg.reload(); pg.wait_for_timeout(2500)
    pg.evaluate("() => { M.UI.ecran = 'enquete'; M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1500)

with sync_playwright() as p:
    b = p.chromium.launch()
    print('— 1. la page se recharge pendant la préparation')
    pg = creer(b, 2); avant = preparer(pg); rouvrir(pg)
    verifier(stock(pg) == avant and not pg.evaluate("() => M.S.atelier.verses"), 'à la réouverture, les ingrédients sont revenus')
    pg.context.close()
    print('— 2. 🏳️ abandonner')
    pg = creer(b, 2); avant = preparer(pg)
    ab = pg.locator('.at-mj-abandon'); ab.click(force=True); pg.wait_for_timeout(300); ab.click(force=True); pg.wait_for_timeout(1200)
    verifier(stock(pg) == avant and not pg.evaluate("() => M.S.atelier.verses") and not pg.locator('.at-mj').count(), 'abandonné : les ingrédients reviennent tout de suite')
    pg.context.close()
    print('— 3. la pause, puis la page qui se recharge')
    pg = creer(b, 2); avant = preparer(pg)
    # (23 novembre : le chaudron prend tout l'écran, les onglets sont dessous → on sort par ⏸️, puis on change d'onglet)
    pg.click('#atelier-ici .at-mj .mj-btn-pause', force=True); pg.wait_for_timeout(500)
    pg.click('[data-act=onglet][data-o=carte]', force=True); pg.wait_for_timeout(700)
    verifier(pg.evaluate("() => !!M.mjPause") and stock(pg) != avant, 'en pause : la préparation attend, rien ne revient')
    rouvrir(pg)
    verifier(stock(pg) == avant, 'rechargée pendant la pause : les ingrédients sont revenus')
    pg.context.close()
    print('— 4. enquête 1 : le filet de la cueillette')
    pg = creer(b, 1)
    r = pg.evaluate("""() => { var P = M.P(); P.vus['cueilli:lisiere'] = P.moment; var r = [M.dejaCueilli('lisiere')];
      Atelier.ajouter(M.S.atelier, 'baies', 3); r.push(M.dejaCueilli('lisiere')); P.vus['cueilli:potager'] = P.moment; r.push(M.dejaCueilli('potager')); return r; }""")
    verifier(r == [False, True, True], 'lisière déjà cueillie, sans baies : on peut y retourner ; avec 3 baies, non ; le potager (sans minimum), non')
    pg.context.close()
    b.close()
print('\nErreurs JS :', len(erreurs))
for e in erreurs[:10]: print('  ', e[:300])
print('Vérifications ratées :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if erreurs or echecs else 0)
