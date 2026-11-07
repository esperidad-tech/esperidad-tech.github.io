"""Banc d'essai du mini-jeu « Le bon mélange » (nouvelle version, src/mj-melange.js).
Usage : python3 build.py && python3 test/melange/essai.py [390x844 800x1280 1280x800]

Passe par la salle d'entraînement (dist/salle-mini-jeux.html) : bouton [data-jeu="melange"] puis .mj-go.
Le crochet window.__melange donne la recette cible, la tolérance, la limite « recette simple »…
Vérifie, à chaque taille :
  - exacte    : la recette exacte gagne (fiole remplie) ;
  - double    : la recette ×2 → « simplifie ! » (chaudron qui tremble) → Simplifier → gagné ;
  - grosse    : une grosse recette non simplifiable → Simplifier → « Recommence avec moins d'ingrédients » → Vider ;
  - beurk     : une mauvaise couleur → « Beurk ! », un cœur de moins ;
  - plus de cœurs (niveau 10, un seul cœur) → perdu ;
  - quitter en pleine partie : fin() jamais appelé, aucune erreur ;
  - aucune erreur console.
Captures dans test/melange/captures/, planche contact dans test/melange/planche-melange.png."""
import sys, os, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))
URL = 'file://' + os.path.join(RACINE, 'dist', 'salle-mini-jeux.html')
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
TAILLES = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:]] or [(800, 1280), (1280, 800), (390, 844)]

bilan = {'ok': [], 'ko': []}
def verifie(cond, quoi):
    (bilan['ok'] if cond else bilan['ko']).append(quoi)
    print(('  ✔ ' if cond else '  ✘ ') + quoi)

def cap(pg, t, nom, el=None):
    chemin = os.path.join(CAP, f'{t[0]}x{t[1]}-{nom}.png')
    (pg.locator(el).screenshot(path=chemin) if el else pg.screenshot(path=chemin))
    return chemin

def journal(pg):
    return pg.evaluate("(JSON.parse(localStorage.getItem('brumeval-salle') || '{}').journal || []).length")

def ouvrir(pg, niv, intro=None):
    pg.goto(URL)
    pg.click(f'[data-niv="{niv}"]')
    pg.click('[data-jeu="melange"]')
    pg.wait_for_selector('.mj-go')
    pg.wait_for_timeout(300)
    if intro:
        pg.wait_for_timeout(2900)
        cap(pg, intro[0], intro[1])
    pg.click('.mj-go')
    pg.wait_for_function('window.__melange && window.__melange.recette')
    pg.wait_for_timeout(350)
    return pg.evaluate('window.__melange')

def verser(pg, comptes, pause=40):
    for id_, n in comptes.items():
        for _ in range(n):
            pg.locator(f'.mjm-pot[data-ingr="{id_}"]').click(force=True, no_wait_after=True)
            pg.wait_for_timeout(pause)

def attendre_pose(pg):
    pg.wait_for_function('window.__melange.enVol() === 0', timeout=10000)
    pg.wait_for_timeout(150)

def taper(pg, sel):
    pg.locator(sel).first.click(force=True)

def comptes(pg):
    return pg.evaluate('window.__melange.comptes()')

def continuer(pg):
    pg.wait_for_selector('.mj-continuer', timeout=10000)
    titre = pg.inner_text('.mj-resultat h2')
    ok = pg.evaluate("document.querySelector('.mj-resultat').classList.contains('ok')")
    pg.click('.mj-continuer')
    pg.wait_for_timeout(200)
    return ok, titre

def partie_exacte(pg, t):
    print('· exacte')
    M = ouvrir(pg, 3, (t, '0-consigne'))
    j0 = journal(pg)
    verifie(pg.locator('.mjm-ress').is_hidden() and pg.locator('.mjm-indice').count() == 0, f'{t}: sans aide, pas de barre de ressemblance ni d\'indice')
    if t == (800, 1280): cap(pg, t, '1-ambiance')
    if t == (1280, 800): cap(pg, t, '2-etagere', '.mjm-etag')
    verser(pg, M['recette'])
    attendre_pose(pg)
    verifie(comptes(pg) == M['recette'], f'{t}: les compteurs suivent les portions versées {M["recette"]}')
    pg.wait_for_timeout(900)
    cap(pg, t, '3-melange')
    taper(pg, '.mjm-gouter')
    pg.wait_for_timeout(1500)
    verifie(pg.evaluate("document.querySelector('.mjm').classList.contains('mjm-gagne')"), f'{t}: la recette exacte remplit la fiole')
    pg.wait_for_timeout(1000)
    cap(pg, t, '6-victoire')
    ok, titre = continuer(pg)
    verifie(ok, f'{t}: la recette exacte gagne ({titre})')
    verifie(journal(pg) == j0 + 1, f'{t}: fin() appelé une seule fois')

def partie_double(pg, t):
    print('· double')
    M = ouvrir(pg, 6)
    double = {k: 2 * v for k, v in M['recette'].items()}
    verifie(2 * M['total'] > M['limite'], f'{t}: au niveau 6, la recette ×2 ({2 * M["total"]}) dépasse la limite ({M["limite"]})')
    verser(pg, double)
    pg.wait_for_timeout(120)
    if t == (800, 1280): cap(pg, t, '3b-vol')
    attendre_pose(pg)
    coeurs0 = pg.evaluate('window.__melange.coeurs()')
    pg.wait_for_timeout(700)
    taper(pg, '.mjm-gouter')
    pg.wait_for_selector('.mjm-carte.trop', timeout=5000)
    txt = pg.inner_text('.mjm-carte')
    verifie('trop d\'ingrédients' in txt and 'simplifie' in txt, f'{t}: ×2 → « …trop d\'ingrédients : simplifie ! »')
    verifie(pg.evaluate("document.querySelector('.mjm').classList.contains('mjm-trop')"), f'{t}: le chaudron tremble')
    verifie(pg.evaluate('window.__melange.coeurs()') == coeurs0, f'{t}: « trop » ne coûte pas de cœur')
    verifie(pg.locator('.mjm-b-simplifier').count() == 1, f'{t}: le bouton Simplifier est proposé')
    pg.wait_for_timeout(400)
    cap(pg, t, '4-simplifie')
    taper(pg, '.mjm-b-simplifier')
    pg.wait_for_timeout(650)
    if t == (800, 1280): cap(pg, t, '4b-divise')
    pg.wait_for_function('window.__melange.etat() === "fini"', timeout=6000)
    verifie(comptes(pg) == M['recette'], f'{t}: Simplifier divise par 2 → {comptes(pg)}')
    ok, titre = continuer(pg)
    verifie(ok, f'{t}: ×2 puis Simplifier gagne ({titre})')

def partie_grosse(pg, t):
    print('· grosse non simplifiable')
    M = ouvrir(pg, 6)
    cand = pg.evaluate("""() => {
      const M = window.__melange, r = M.recette, ids = Object.keys(r);
      for (const k of [5, 4, 6, 3, 7]) for (const id of ids) for (const d of [1, -1]) {
        const c = {}; ids.forEach(i => c[i] = r[i] * k); c[id] += d;
        const t = Object.values(c).reduce((a, b) => a + b, 0);
        if (M.pgcd(c) === 1 && M.ecart(c) < M.tol * 0.85 && t > M.limite) return c;
      }
      return null; }""")
    verifie(cand is not None, f'{t}: une grosse recette de la bonne couleur, non simplifiable : {cand}')
    if not cand: return
    verser(pg, cand, 25)
    attendre_pose(pg)
    taper(pg, '.mjm-gouter')
    pg.wait_for_selector('.mjm-carte.trop', timeout=5000)
    taper(pg, '.mjm-b-simplifier')
    pg.wait_for_selector('.mjm-carte.recommence', timeout=5000)
    txt = pg.inner_text('.mjm-carte')
    verifie('Recommence avec moins d' in txt, f'{t}: « Recommence avec moins d\'ingrédients »')
    verifie(pg.locator('.mjm-carte .mjm-b-vider').count() == 1 and 'Vider le chaudron' in txt, f'{t}: bouton « Vider le chaudron »')
    if t == (800, 1280): cap(pg, t, '4c-recommence')
    taper(pg, '.mjm-carte .mjm-b-vider')
    pg.wait_for_timeout(300)
    verifie(comptes(pg) == {} and pg.evaluate('window.__melange.etat()') == 'joue', f'{t}: Vider le chaudron → on rejoue')
    verifie(not pg.evaluate("document.querySelector('.mjm').classList.contains('mjm-trop')"), f'{t}: le chaudron ne tremble plus')
    pg.click('.sl-quitter')

def partie_beurk(pg, t):
    print('· beurk')
    M = ouvrir(pg, 3)
    pire = pg.evaluate("""() => { const M = window.__melange; let best = null, e = -1;
      for (const id of M.etagere) { const c = {}; c[id] = 1; const x = M.ecart(c); if (x > e) { e = x; best = id; } } return [best, e, M.tol]; }""")
    verifie(pire[1] > pire[2] * 2, f'{t}: {pire[0]} seul est une couleur nettement différente ({pire[1]:.3f} > {pire[2]:.3f})')
    coeurs0 = pg.evaluate('window.__melange.coeurs()')
    verser(pg, {pire[0]: 2})
    attendre_pose(pg)
    pg.wait_for_timeout(700)
    taper(pg, '.mjm-gouter')
    pg.wait_for_selector('.mjm-carte.beurk', timeout=5000)
    txt = pg.inner_text('.mjm-carte')
    verifie('Beurk' in txt and 'goût horrible' in txt, f'{t}: « Beurk ! La potion a un goût horrible… »')
    verifie(pg.evaluate('window.__melange.coeurs()') == coeurs0 - 1, f'{t}: un cœur de moins ({coeurs0} → {coeurs0 - 1})')
    verifie(pg.locator('.mjm-coeur.perdu').count() == 1, f'{t}: le bandeau montre le cœur perdu')
    verifie(pg.is_disabled('.mjm-gouter'), f'{t}: on ne peut pas regoûter la même potion')
    pg.wait_for_timeout(450)
    cap(pg, t, '5-beurk')
    taper(pg, '.mjm-carte .mjm-b-vider')
    pg.wait_for_timeout(250)
    verifie(comptes(pg) == {} and pg.evaluate('window.__melange.etat()') == 'joue', f'{t}: après Beurk, Vider le chaudron → on rejoue')
    pg.click('.sl-quitter')

def partie_perdue(pg, t):
    print('· plus de cœurs')
    M = ouvrir(pg, 10)
    verifie(pg.evaluate('window.__melange.coeurs()') == 1, f'{t}: niveau 10 → 1 cœur')
    pire = pg.evaluate("""() => { const M = window.__melange; let best = null, e = -1;
      for (const id of M.etagere) { const c = {}; c[id] = 1; const x = M.ecart(c); if (x > e) { e = x; best = id; } } return best; }""")
    j0 = journal(pg)
    verser(pg, {pire: 1})
    attendre_pose(pg)
    taper(pg, '.mjm-gouter')
    ok, titre = continuer(pg)
    verifie(not ok, f'{t}: plus de cœurs → perdu ({titre})')
    verifie(journal(pg) == j0 + 1, f'{t}: fin() appelé une seule fois (perdu)')

def partie_quittee(pg, t):
    print('· quitter en pleine partie')
    M = ouvrir(pg, 3)
    j0 = journal(pg)
    verser(pg, {k: v * 3 for k, v in M['recette'].items()}, 10)
    pg.click('.sl-quitter')
    pg.wait_for_timeout(2500)
    verifie(journal(pg) == j0, f'{t}: après arreter(), fin() n\'est jamais appelé')
    verifie(pg.locator('.mjm').count() == 0, f'{t}: la partie est démontée')

def partie_aides(pg, t):
    print('· avec aides (revele + aide)')
    pg.goto(URL)
    lignes = pg.evaluate("MJ.reglages('melange', 3, {revele:true, aide:1}).lignes.map(l => l.nom + ' : ' + l.val)")
    verifie(any('ressemblance' in l for l in lignes) and any('brille' in l for l in lignes), f'{t}: les réglages annoncent la barre et l\'indice')
    pg.evaluate("""() => {
      const plein = document.getElementById('sl-plein');
      plein.innerHTML = '<div class="sl-cadre"></div>'; plein.hidden = false; document.body.classList.add('sl-bloque');
      window.__finAides = 0;
      window.__partieAides = MJ.lancer(plein.querySelector('.sl-cadre'), 'melange', MJ.reglages('melange', 3, {revele:true, aide:1}), () => { window.__finAides++; }, {sansIntro:true});
    }""")
    pg.wait_for_function('window.__melange && window.__melange.recette')
    M = pg.evaluate('window.__melange')
    verifie(pg.locator('.mjm-ress').is_visible() and '%' in pg.inner_text('.mjm-ress b'), f'{t}: revele → barre de ressemblance avec chiffres')
    ind = pg.evaluate("[...document.querySelectorAll('.mjm-pot.mjm-indice')].map(b => b.dataset.ingr)")
    verifie(len(ind) == 1 and ind[0] in M['recette'], f'{t}: aide → un bon ingrédient brille ({ind})')
    verser(pg, M['recette'])
    attendre_pose(pg)
    pg.wait_for_timeout(800)
    verifie(pg.evaluate("document.querySelector('.mjm-ress').classList.contains('chaud')"), f'{t}: la barre passe au vert dans la zone ({pg.inner_text(".mjm-ress b")})')
    if t == (800, 1280): cap(pg, t, '7-aides')
    pg.evaluate('window.__partieAides.arreter()')
    pg.wait_for_timeout(500)

def partie_temps(pg, t):
    print('· sablier vide')
    pg.goto(URL)
    pg.evaluate("""() => {
      const plein = document.getElementById('sl-plein');
      plein.innerHTML = '<div class="sl-cadre"></div>'; plein.hidden = false;
      window.__finsT = [];
      MJ.lancer(plein.querySelector('.sl-cadre'), 'melange', MJ.reglages('melange', 3, {temps:-237}), r => window.__finsT.push(r), {sansIntro:true});
    }""")
    pg.wait_for_selector('.mj-continuer', timeout=9000)
    ok, titre = continuer(pg)
    fins = pg.evaluate('window.__finsT')
    verifie(not ok and len(fins) == 1 and fins[0]['reussi'] is False, f'{t}: sablier vide → perdu, fin() une fois ({titre})')

def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for t in TAILLES:
            print(f'=== {t[0]}x{t[1]}')
            pg = b.new_context(viewport={'width': t[0], 'height': t[1]}, has_touch=False).new_page()
            # Google Fonts injoignable ici : on répond par une feuille vide pour ne pas polluer la console
            pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
            pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=200, body=''))
            errs = []
            pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            partie_exacte(pg, t)
            partie_double(pg, t)
            partie_grosse(pg, t)
            partie_beurk(pg, t)
            partie_perdue(pg, t)
            partie_quittee(pg, t)
            partie_aides(pg, t)
            partie_temps(pg, t)
            verifie(not errs, f'{t}: aucune erreur console' + ('' if not errs else ' : ' + ' | '.join(errs[:5])))
            pg.close()
        b.close()
    with open(os.path.join(CAP, 'bilan.json'), 'w', encoding='utf-8') as f:
        json.dump(bilan, f, ensure_ascii=False, indent=1)
    print(f"\n{len(bilan['ok'])} vérifications réussies, {len(bilan['ko'])} échouées")
    for k in bilan['ko']: print('  ✘', k)
    sys.exit(1 if bilan['ko'] else 0)

if __name__ == '__main__':
    main()
