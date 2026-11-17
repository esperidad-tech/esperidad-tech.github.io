"""Les films des héros sur « Choisis ton rôle » (Bible §12.72 ; Romain, 17 novembre : « Les 4 cinématiques, tu les mets en jeu au moment
de choisir les héros. Je veux qu'on voit les 4 films avec un joli petit icône et que ça aide à faire son choix au début »).
  - quatre pastilles jaunes « ▶ Le film », une par héros, sous le texte, dans la carte, sans rien cacher ; deux héros par rangée ;
  - toucher une pastille : le film du héros (avec « Passer ➜ »), et le héros n'est PAS choisi ; à la fin, retour au choix, ✓ sur la pastille ;
  - toucher la carte choisit toujours le héros ; « ← Retour » : les ✓ sont toujours là ;
  - un téléphone debout, un téléphone couché ; sans les films (fiche vide) : l'écran d'avant ; un film absent : retour au choix, sans ✓.
   BRUMEVAL_DIST=<dossier construit> python3 tools/films-heros.py"""
import sys, os, shutil
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html'); SORTIE = os.path.join(ICI, '..', 'cine', 'sortie')
OUT = os.path.join(ICI, '..', 'test', 'films-heros'); os.makedirs(OUT, exist_ok=True)
ROLES = ['pisteur', 'alchimiste', 'barde', 'sage']; FILMS = {r: 'heros' + r.capitalize() for r in ROLES}
erreurs, echecs = [], []
def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)
def page(b, w=1180, h=820):
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True).new_page(); pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append('PAGEERROR ' + str(e)))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL); pg.wait_for_timeout(900)
    pg.click('[data-act=creer]'); pg.wait_for_timeout(600); pg.evaluate("() => window.scrollTo(0, 0)")
    return pg
MESURE = """() => [].map.call(document.querySelectorAll('.b-role-case'), function(c){
  var b = c.getBoundingClientRect(), f = c.querySelector('.b-role-film'), t = c.querySelector('.b-role-txt'), p = t.querySelector('p'), fb = f && f.getBoundingClientRect(), pb = p.getBoundingClientRect(), s = f && getComputedStyle(f);
  return {r:c.dataset.r, x:Math.round(b.left), w:b.width, film:!!f, dedans:fb ? fb.left >= b.left && fb.right <= b.right && fb.top >= b.top && fb.bottom <= b.bottom : false,
    sous:fb ? fb.top - pb.bottom : -99, gauche:fb ? Math.abs(fb.left - t.getBoundingClientRect().left) : 99, haut:fb ? fb.height : 0,
    jaune:s ? /255, 224, 138|232, 169, 58/.test(s.backgroundImage) : false, noir:s ? s.color : '', mots:f ? f.textContent.trim().split(/\\s+/).length : 0}; })"""
def regarder(pg, r, jusqu_au_bout=True):
    """touche la pastille du héros r : le film joue ; on va à la fin (ou « Passer ➜ ») ; on revient au choix"""
    pg.tap('.b-role-film[data-r=%s]' % r); pg.wait_for_selector('.cine-ecran video', timeout=15000)
    pg.wait_for_function("() => { var v = document.querySelector('.cine-ecran video'); return v && v.currentTime > .8; }", timeout=25000)
    e = pg.evaluate("() => ({src:document.querySelector('.cine-ecran video').src, passer:!!document.querySelector('[data-cine=passer]'), etape:M.UI.creaEtape, role:M.UI.crea && M.UI.crea.role || null, ecran:M.UI.ecran})")
    if jusqu_au_bout:
        pg.evaluate("() => { var v = document.querySelector('.cine-ecran video'); v.play(); v.currentTime = v.duration - .3; }")
    else:
        pg.tap('[data-cine=passer]', force=True)
    pg.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=15000); pg.wait_for_timeout(250)
    return e
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    os.makedirs(os.path.join(DIST, 'cine'), exist_ok=True)
    for f in FILMS.values():
        for x in ('.mp4', '.mp3'): shutil.copy(os.path.join(SORTIE, f + x), os.path.join(DIST, 'cine', f + x))
    print('— 1. Une tablette : l\'écran du choix')
    pg = page(b)
    infos = pg.evaluate("() => Object.keys(window.CINE_INFOS || {}).filter(function(k){ return /^heros/.test(k); }).map(function(k){ return [k, CINE_INFOS[k].duree, CINE_INFOS[k].piste]; })")
    verifier(len(infos) == 4 and all(d <= 30 and pi for _, d, pi in infos), f'la fiche des films connaît les quatre films des héros, 30 secondes au plus, avec leur bande-son ({infos})')
    m = pg.evaluate(MESURE)
    verifier([x['r'] for x in m] == ROLES and all(x['film'] for x in m), 'quatre héros, chacun avec sa pastille « ▶ Le film »')
    verifier(all(x['dedans'] and x['sous'] >= 2 and x['gauche'] < 2 for x in m), f'chaque pastille est dans sa carte, sous le texte, alignée sur lui, sans rien cacher ({[(x["r"], round(x["sous"])) for x in m]})')
    verifier(all(x['jaune'] and x['noir'] in ('rgb(17, 17, 17)', 'rgb(0, 0, 0)') and x['haut'] >= 40 and x['mots'] <= 3 for x in m), f'jaune à lettres noires, assez grande pour un doigt, pas de long texte ({m[0]["noir"]}, {m[0]["haut"]} px)')
    verifier(len(set(x['x'] for x in m)) == 2, 'deux héros par rangée')
    pg.screenshot(path=os.path.join(OUT, '1-choix-tablette.png'))
    print('— 2. Regarder un film ne choisit pas le héros')
    e = regarder(pg, 'barde')
    verifier('herosBarde.mp4' in e['src'] and e['passer'], f'la pastille du Barde : son film, avec « Passer ➜ » ({e["src"][-24:]})')
    verifier(e['etape'] == 1 and e['role'] is None and e['ecran'] == 'creation', 'pendant le film, le héros n\'est pas choisi')
    r = pg.evaluate("() => ({etape:M.UI.creaEtape, role:M.UI.crea.role || null, vu:!!document.querySelector('.b-role-film[data-r=barde] .b-film-vu'), autres:document.querySelectorAll('.b-film-vu').length, revu:!!document.querySelector('.b-role-case.revu[data-r=barde]')})")
    verifier(r['etape'] == 1 and r['role'] is None and r['vu'] and r['autres'] == 1 and r['revu'], f'à la fin : retour au choix, rien de choisi, ✓ sur la pastille du Barde, sa carte s\'allume ({r})')
    pg.screenshot(path=os.path.join(OUT, '2-retour-du-film.png'))
    for x in ('pisteur', 'alchimiste', 'sage'):
        e = regarder(pg, x, jusqu_au_bout=False)
        verifier(FILMS[x] + '.mp4' in e['src'] and e['role'] is None, f'la pastille {x} : son film ; « Passer ➜ » ramène au choix')
    verifier(pg.locator('.b-film-vu').count() == 4, 'les quatre films vus : quatre ✓')
    pg.screenshot(path=os.path.join(OUT, '3-quatre-vus.png'))
    print('— 3. La carte choisit toujours le héros')
    pg.tap('.b-role[data-r=sage]'); pg.wait_for_timeout(400)
    verifier(pg.evaluate("() => M.UI.creaEtape === 2 && M.UI.crea.role === 'sage'"), 'toucher la carte du Sage : on passe à son apparence')
    pg.click('[data-act=crea-retour]'); pg.wait_for_timeout(400)
    verifier(pg.locator('.b-role-film').count() == 4 and pg.locator('.b-film-vu').count() == 4 and pg.locator('.b-role.choisi[data-r=sage]').count() == 1, '« ← Retour » : les pastilles et leurs ✓ sont là, le Sage est en avant')
    pg.click('.b-role[data-r=sage]'); pg.wait_for_timeout(300); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Noé'); pg.click('[data-act=crea-fin]'); pg.wait_for_timeout(900)
    verifier(pg.evaluate("() => !!(M.S.heros && M.S.heros.role === 'sage' && M.S.heros.nom === 'Noé')"), 'le héros se crée comme avant')
    print('— 4. Un téléphone debout, un téléphone couché')
    for w, h, nom in ((390, 780, 'telephone'), (844, 390, 'telephone-couche'), (320, 640, 'petit-telephone')):
        q = page(b, w, h); m = q.evaluate(MESURE)
        verifier(all(x['film'] and x['dedans'] and x['sous'] >= 2 for x in m) and all(x['x'] >= 0 and x['x'] + x['w'] <= w + 1 for x in m), f'{nom} : les quatre pastilles dans leurs cartes, rien ne dépasse de l\'écran')
        q.screenshot(path=os.path.join(OUT, '4-%s.png' % nom), full_page=True)
        if nom == 'telephone':
            e = regarder(q, 'sage', jusqu_au_bout=False)
            vis = q.evaluate("() => { var f = document.querySelector('.b-role-film[data-r=sage]').getBoundingClientRect(); return f.top >= 0 && f.bottom <= innerHeight; }")
            verifier('herosSage.mp4' in e['src'] and vis, 'téléphone : le film du Sage ; au retour, sa pastille est à l\'écran')
    print('— 5. Sans les films ; un film qui n\'arrive pas')
    z = page(b)
    z.evaluate("() => { ['herosPisteur', 'herosAlchimiste', 'herosBarde', 'herosSage'].forEach(function(k){ delete CINE_INFOS[k]; }); M.render(); }"); z.wait_for_timeout(300)
    verifier(z.locator('.b-role-film').count() == 0 and z.locator('.b-roles.avec-films').count() == 0 and z.locator('.b-role[data-act=crea-role]').count() == 4, 'sans les films : l\'écran d\'avant, les quatre héros, aucune pastille')
    os.remove(os.path.join(DIST, 'cine', 'herosAlchimiste.mp4'))
    s = page(b); s.tap('.b-role-film[data-r=alchimiste]')
    s.wait_for_function("() => !document.querySelector('.cine-ecran')", timeout=30000); s.wait_for_timeout(300)
    verifier(s.evaluate("() => M.UI.creaEtape === 1 && !M.UI.crea.role && !document.querySelector('.b-film-vu')"), 'le film de l\'Alchimiste n\'arrive pas : retour au choix, sans ✓')
    shutil.copy(os.path.join(SORTIE, 'herosAlchimiste.mp4'), os.path.join(DIST, 'cine', 'herosAlchimiste.mp4'))
    b.close()
print('\nerreurs :', erreurs[:5]); print('ÉCHECS :', echecs) if echecs else print('tout est bon')
sys.exit(1 if echecs or erreurs else 0)
