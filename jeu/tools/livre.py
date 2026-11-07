"""Test du Grand Livre du Sage (livre.js) avec Playwright.
Usage : BRUMEVAL_DIST=/chemin python3 tools/livre.py
- E1, E2, E3 : on tourne toutes les pages en glissant au doigt (vrais événements tactiles), à la souris, avec les coins ‹ ›,
  le clavier et le sommaire ; les captures de chaque page vont dans test/livre/ (téléphones 360×740 et 390×844) ;
- le tableau d'enquête : toucher une case ne redessine rien (même nœud <main>, même livre, aucune transition), et c'est sauvé ;
  plus de mode d'emploi ni de légende, « Tout effacer » est là ;
- le bandeau du Sage : plus de ⏭️ ni de ⚖️, seulement ☰ ;
- la page des codes des moments : un code par moment (seulement les dessins, sans leur nom), sans texte d'explication en haut,
  des cadres tous pareils (même taille, logo et code au même endroit), « Passer » fait passer le moment ;
- la page « 💡 Donner une action » (après les codes) : le bouton de la réserve du Sage, qui n'est plus dans son Carnet
  (enquêtes 2 et 3 seulement : l'enquête 1 n'a plus de points d'action, donc ni cette page ni réserve, E.sansActions) ;
- le pavé de l'onglet Code : seulement les dessins (le nom dans aria-label) ;
- la page blanche : rien d'écrit ; l'encre (code de la potion tapé dans l'onglet Code) la fait parler : le plan de la forêt et son code ;
- la mission « Lis la recette » se valide en montrant la page des recettes ;
- l'accusation depuis la dernière page ;
- la mise en page à 360×740, 390×844, 844×390, 800×1280 et 1280×800 (le livre remplit l'écran entre le bandeau et les onglets) ;
- une vieille sauvegarde se charge."""
import os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'livre')
os.makedirs(OUT, exist_ok=True)
TAILLES = [(360, 740), (390, 844), (844, 390), (800, 1280), (1280, 800)]
erreurs, echecs = [], []

def verif(cond, msg):
    print(('  ok   ' if cond else '  ÉCHEC ') + msg)
    if not cond: echecs.append(msg)

def ev(pg, js):
    return pg.evaluate(js)

def sage(b, W, H, n=1):
    ctx = b.new_context(viewport={'width': W, 'height': H}, has_touch=True)
    pg = ctx.new_page()
    pg.set_default_timeout(15000)
    pg.on('console', lambda m: erreurs.append(f'[{W}x{H}] {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{W}x{H}] PAGEERROR {e}'))
    pg.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste d'autres systèmes : l'enquête 1 sans le tutoriel guidé (tools/tuto.py teste le tutoriel)
    pg.goto(URL, wait_until='domcontentloaded')
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', 'Romain'); pg.click('[data-act=crea-fin]')
    if n > 1:
        # (l'accueil d'un héros débutant n'a plus de bouton Réglages, Romain 4 novembre : on ouvre les Réglages directement pour le Mode test)
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click(f'[data-act=mode-test][data-i="{n}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.wait_for_selector('#livre-ici')
    pg.wait_for_timeout(200)
    return ctx, pg

def page_id(pg): return ev(pg, '() => M.livrePage()')
def pages(pg): return ev(pg, "() => Array.from(document.querySelectorAll('.lv-page')).map(function(s){ return s.dataset.id; })")
def attendre_tour(pg): pg.wait_for_function('() => !document.querySelector(".lv.lv-tourne")', timeout=4000); pg.wait_for_timeout(60)

def glisser_doigt(pg, cdp, x0, x1, y, pas=10):
    """Un vrai glisser au doigt (événements tactiles du navigateur)."""
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y}]})
    for k in range(1, pas + 1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * k / pas, 'y': y + k * 0.6}]})
        pg.wait_for_timeout(16)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    attendre_tour(pg)

def glisser_souris(pg, x0, x1, y, pause=12):
    pg.mouse.move(x0, y); pg.mouse.down()
    for k in range(1, 13): pg.mouse.move(x0 + (x1 - x0) * k / 12, y); pg.wait_for_timeout(pause)
    pg.mouse.up(); attendre_tour(pg)

def taper_code(pg, seq):
    pg.click('[data-act=onglet][data-o=code]')
    for s in seq: pg.click(f'#app [data-act=sym][data-s={s}]')
    pg.wait_for_timeout(450)

def fermer(pg):
    pg.wait_for_timeout(100)
    ev(pg, '() => { if(M.UI.modal) M.fermer(); }')
    pg.wait_for_timeout(120)

def mise_en_page(pg, W, H, quoi):
    m = ev(pg, """() => { var l = document.getElementById('livre-ici').getBoundingClientRect(), h = document.querySelector('.b-entete').getBoundingClientRect(),
      n = document.querySelector('.b-onglets').getBoundingClientRect(), num = document.querySelector('.lv-num').getBoundingClientRect(), c = document.querySelector('.lv-coin.d');
      var cr = c && !c.hidden ? c.getBoundingClientRect() : null;
      return {haut:l.top, bas:l.bottom, gauche:l.left, droite:l.right, entete:h.bottom, nav:n.top, large:document.documentElement.scrollWidth, defile:window.scrollY,
        num:[num.left, num.right, num.top, num.bottom], coin:cr ? [cr.right, cr.bottom] : null}; }""")
    verif(abs(m['haut'] - m['entete']) <= 2 and abs(m['bas'] - m['nav']) <= 2 and m['gauche'] <= 0.5 and m['droite'] >= W - 0.5,
          f'{W}×{H} {quoi} : le livre remplit l\'écran entre le bandeau et les onglets ({m["haut"]:.0f}→{m["bas"]:.0f}, bandeau {m["entete"]:.0f}, onglets {m["nav"]:.0f})')
    verif(m['large'] <= W, f'{W}×{H} {quoi} : pas de défilement de côté (largeur {m["large"]})')
    verif(m['num'][0] >= 0 and m['num'][1] <= W and m['num'][3] <= m['nav'] + 1, f'{W}×{H} {quoi} : « n / N » bien visible')
    if m['coin']: verif(m['coin'][0] <= W + 0.5 and m['coin'][1] <= m['nav'] + 1, f'{W}×{H} {quoi} : le coin corné est dans l\'écran')

with sync_playwright() as p:
    b = p.chromium.launch()

    # ===== 1. Enquête 1 au téléphone : tout le parcours =====
    print('— Enquête 1 (390×844)')
    ctx, S = sage(b, 390, 844, 1)
    cdp = ctx.new_cdp_session(S)
    verif(S.locator('.b-entete [data-act=moment-suivant]').count() == 0 and S.locator('.b-entete [data-act=accuser]').count() == 0, 'Bandeau du Sage : plus de ⏭️ ni de ⚖️')
    verif(S.locator('.b-entete [data-act=menu-enquete]').count() == 1, 'Bandeau du Sage : le menu ☰ est là')
    verif(S.locator('.b-livre-onglets').count() == 0, 'Plus d\'onglets en haut du Grand Livre')
    L = pages(S)
    # l'enquête 1 n'a pas de points d'action (E.sansActions) : pas de page « 💡 Donner une action »
    verif(L == ['tableau', 'habitants', 'recettes', 'mystere', 'fondateurs', 'codes', 'accusation'], f'E1 : les 7 pages dans l\'ordre, sans « Donner une action » ({L})')
    verif(' '.join(S.inner_text('.lv-num').replace('\xa0', ' ').split()).endswith('1 / 7'), f'Numéro de page « 1 / 7 » ({S.inner_text(".lv-num")!r})')
    cz = ev(S, "() => { var c = document.querySelector('.lv-coin.d'), r = c.getBoundingClientRect(), a = getComputedStyle(c, '::after'); return [r.width, r.height, parseFloat(a.width), parseFloat(a.height)]; }")
    verif(cz[0] >= 48 and cz[1] >= 48 and cz[2] <= 30 and cz[3] <= 30, f'Coin corné : petit et discret ({cz[2]:.0f} px) mais 48 px à toucher ({cz[0]:.0f}×{cz[1]:.0f})')
    # l'indice : le coin se soulève tout seul au premier livre
    try:
        S.wait_for_function("() => document.getAnimations().some(function(a){ return a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('lv-coin'); })", timeout=4000)
        coin = True
    except Exception:
        coin = False
    verif(coin, 'Premier livre : le coin de la page se soulève tout seul')
    S.wait_for_timeout(500)
    S.screenshot(path=f'{OUT}/e1-indice-coin.png')
    # --- le tableau d'enquête : toucher ne redessine rien ---
    txt = S.inner_text('.lv-page.on')
    verif('Touche une case' not in txt and 'pas possible' not in txt and S.locator('.tb-aide, .tb-legende').count() == 0, 'Tableau : plus de mode d\'emploi ni de légende')
    verif(S.is_visible('.lv-page.on [data-act=tab-effacer]'), 'Tableau : « 🧽 Tout effacer » est là')
    ev(S, """() => { window.__main = document.querySelector('main.b-contenu'); window.__livre = document.getElementById('livre-ici'); window.__rendus = 0;
      var r = M.render; M.render = function(){ window.__rendus++; return r.apply(this, arguments); };
      window.__trans = 0; new MutationObserver(function(){ if(document.getElementById('transition').classList.contains('on')) window.__trans++; }).observe(document.getElementById('transition'), {attributes:true});
      window.__classes = []; new MutationObserver(function(l){ l.forEach(function(x){ window.__classes.push(x.target.className); }); }).observe(document.querySelector('main.b-contenu'), {attributes:true, attributeFilter:['class']}); }""")
    k = ev(S, "() => document.querySelector('.lv-page.on [data-act=tab-case]').dataset.k")
    cell = f'.lv-page.on [data-act=tab-case][data-k="{k}"]'
    S.click(cell); S.wait_for_timeout(120)
    verif('tb-x' in S.get_attribute(cell, 'class') and S.inner_text(cell).strip() == '✗', 'Tableau : une touche → ✗')
    S.click(cell); S.wait_for_timeout(120)
    verif('tb-v' in S.get_attribute(cell, 'class') and S.inner_text(cell).strip() == '✓', 'Tableau : deux touches → ✓')
    S.click('.lv-page.on [data-act=tab-tete][data-d=qui][data-id=gaspard]'); S.wait_for_timeout(120)
    S.click('.lv-page.on [data-act=tab-tete][data-d=ou][data-id=puits]'); S.wait_for_timeout(120)
    grises = ev(S, "() => document.querySelectorAll('.lv-page.on .tb-case.tb-grise').length")
    verif(grises == 6 + 4 - 1, f'Tableau : barrer Gaspard et le Puits grise sa ligne et sa colonne sur place ({grises} cases)')
    st = ev(S, """() => ({meme:document.querySelector('main.b-contenu') === window.__main, livre:document.getElementById('livre-ici') === window.__livre, rendus:window.__rendus,
      trans:window.__trans, classes:window.__classes.slice(), anim:getComputedStyle(document.querySelector('main.b-contenu')).animationName,
      sauve:JSON.parse(localStorage.getItem('brumeval-v2-' + (M.emplacement() || 1)) || localStorage.getItem(Object.keys(localStorage).filter(function(x){ return /brumeval/.test(x) && /\\d$/.test(x); })[0]) || '{}')})""")
    verif(st['meme'] and st['livre'] and st['rendus'] == 0, f'Tableau : aucune touche ne redessine la page (même <main>, même livre, {st["rendus"]} rendu)')
    verif(st['trans'] == 0 and not st['classes'] and st['anim'] == 'none', f'Tableau : aucune classe de transition, aucun fondu ({st["trans"]}, {st["classes"]}, animation {st["anim"]})')
    sv = (st['sauve'].get('e') or {}).get('tableau') or {}
    verif(sv.get('cases', {}).get(k) == 'v' and sv.get('dims', {}).get('qui', {}).get('gaspard') == 'x' and sv.get('dims', {}).get('ou', {}).get('puits') == 'x', f'Tableau : les marques sont sauvées ({json.dumps(sv)[:120]})')
    # glisser sur le tableau tourne la page, sans cocher de case
    avant = ev(S, "() => JSON.stringify(M.P().tableau)")
    box = S.locator(f'.lv-page.on [data-act=tab-case]').nth(5).bounding_box()
    glisser_doigt(S, cdp, box['x'] + box['width'] - 4, 40, box['y'] + box['height'] / 2)
    verif(page_id(S) == 'habitants', f'Glisser au doigt vers la gauche (sur le tableau) → page 2 ({page_id(S)})')
    verif(ev(S, "() => JSON.stringify(M.P().tableau)") == avant, 'Glisser sur une case ne la coche pas')
    verif(ev(S, '() => !!M.S.options.livreTourne'), 'Après le premier tour de page, plus d\'indice')
    # --- le son : une page de papier synthétisée (WebAudio), qui respecte « Sons » coupé ---
    son = ev(S, """() => { var l = [], s = M.son, C = window.AudioContext || window.webkitAudioContext, o = C.prototype.createBufferSource, n = 0;
      M.son = function(t){ l.push(t); return s.apply(this, arguments); };
      C.prototype.createBufferSource = function(){ n++; return o.apply(this, arguments); };
      M.livreAller('recettes', false); var avec = n;
      M.S.options.son = false; s('feuille'); var sans = n - avec; M.S.options.son = true;
      M.son = s; C.prototype.createBufferSource = o; return {sons:l, avec:avec, sans:sans}; }""")
    attendre_tour(S)
    verif('feuille' in son['sons'] and 'page' not in son['sons'] and son['avec'] >= 3, f'Tourner une page : le son de papier (souffle, froissement, page posée) ({son})')
    verif(son['sans'] == 0, 'Sons coupés : la page tourne sans bruit')
    S.evaluate("() => M.livreAller('habitants', true)"); S.wait_for_timeout(100)
    # --- tourner toutes les pages : doigt, souris, coins, clavier ; captures ---
    vus = ['tableau']
    S.screenshot(path=f'{OUT}/e1-390-02-habitants.png'); vus.append(page_id(S))
    glisser_souris(S, 330, 60, 420); S.screenshot(path=f'{OUT}/e1-390-03-recettes.png'); vus.append(page_id(S))
    S.click('.lv-coin.d'); attendre_tour(S); S.screenshot(path=f'{OUT}/e1-390-04-page-blanche.png'); vus.append(page_id(S))
    S.keyboard.press('ArrowRight'); attendre_tour(S); S.screenshot(path=f'{OUT}/e1-390-05-fondateurs.png'); vus.append(page_id(S))
    S.evaluate("() => document.querySelector('.lv-page.on .lv-feuille').scrollTo(0, 99999)"); S.wait_for_timeout(100); S.screenshot(path=f'{OUT}/e1-390-05b-fondateurs-fin.png')
    glisser_doigt(S, cdp, 340, 30, 500); S.screenshot(path=f'{OUT}/e1-390-06-codes.png'); vus.append(page_id(S))
    glisser_doigt(S, cdp, 340, 30, 500); S.screenshot(path=f'{OUT}/e1-390-07-accusation.png'); vus.append(page_id(S))
    verif(vus == L, f'Toutes les pages tournées une à une, dans l\'ordre ({vus})')
    verif(S.locator('.lv-coin.d').is_hidden(), 'Dernière page : plus de coin « page suivante »')
    glisser_doigt(S, cdp, 340, 30, 500)
    verif(page_id(S) == 'accusation', 'Dernière page : glisser plus loin ne fait rien (la page rebondit)')
    # retour en arrière
    glisser_doigt(S, cdp, 30, 350, 500)
    verif(page_id(S) == 'codes', f'Glisser vers la droite → page précédente ({page_id(S)})')
    S.click('.lv-coin.g'); attendre_tour(S)
    verif(page_id(S) == 'fondateurs', 'Coin ‹ → page précédente')
    S.keyboard.press('ArrowLeft'); attendre_tour(S)
    verif(page_id(S) == 'mystere', 'Flèche ← du clavier → page précédente (la page blanche)')
    # un petit glisser qui ne va pas assez loin : la page revient
    glisser_souris(S, 300, 250, 400, pause=35)   # lent et court : ce n'est pas un vrai tour de page
    verif(page_id(S) == 'mystere', 'Un glisser trop court : la page retombe à sa place')
    # le sommaire
    S.click('.lv-num'); S.wait_for_timeout(150)
    verif(S.is_visible('.lv-sommaire') and S.locator('.lv-sommaire button').count() == 7, 'Toucher « n / N » ouvre le sommaire (7 pages)')
    verif('Donner une action' not in S.inner_text('.lv-sommaire'), 'E1 (sans points d\'action) : le sommaire n\'a pas de page « Donner une action »')
    S.screenshot(path=f'{OUT}/e1-390-sommaire.png')
    S.click('.lv-sommaire [data-i="1"]'); attendre_tour(S)
    verif(page_id(S) == 'habitants' and S.is_hidden('.lv-sommaire'), 'Sommaire : toucher une page y va')
    # les autres touches fréquentes du Sage : le Carnet (habitant qui s'ouvre, mission cochée) et le pavé de code ne font plus de fondu
    S.click('[data-act=onglet][data-o=carnet]'); S.wait_for_timeout(500)
    verif(S.locator('#app [data-act=reserve]').count() == 0, 'Carnet du Sage : plus de « 💡 Donner une action » (c\'est une page du Grand Livre)')
    a1 = 'none'
    if S.locator('[data-act=carnet-pnj]').count():   # le Carnet du Sage n'a plus forcément les visages des habitants (carnet.js)
        S.click('[data-act=carnet-pnj]'); S.wait_for_timeout(60)
        a1 = ev(S, "() => getComputedStyle(document.querySelector('main.b-contenu')).animationName")
    S.click('[data-act=mission-coche]'); S.wait_for_timeout(60)
    a2 = ev(S, "() => [getComputedStyle(document.querySelector('main.b-contenu')).animationName].concat(Array.from(document.querySelectorAll('main .b-notes li')).map(function(li){ return getComputedStyle(li).animationName; }))")
    S.click('[data-act=onglet][data-o=code]'); S.wait_for_timeout(500)
    pave = ev(S, """() => { var b = Array.from(document.querySelectorAll('#app .b-pave [data-act=sym]'));
      return {n:b.length, small:document.querySelectorAll('#app .b-pave small').length, lettres:b.filter(function(x){ return /[A-Za-zÀ-ÿ]/.test(x.innerText); }).length,
        noms:b.every(function(x){ return x.getAttribute('aria-label') === DONNEES.SYM[x.dataset.s].n; })}; }""")
    verif(pave['n'] == 12 and pave['small'] == 0 and pave['lettres'] == 0 and pave['noms'], f'Pavé du code : 12 dessins sans leur nom écrit, le nom dans aria-label ({pave})')
    S.click('#app [data-act=sym][data-s]'); S.wait_for_timeout(60)
    a3 = ev(S, "() => getComputedStyle(document.querySelector('main.b-contenu')).animationName")
    S.click('#app [data-act=sym-efface]')
    verif(a1 == 'none' and all(x == 'none' for x in a2) and a3 == 'none', f'Carnet et pavé de code : toucher ne fait plus clignoter la page ({a1}, {a2[:3]}, {a3})')
    S.click('[data-act=onglet][data-o=role]'); S.wait_for_timeout(200)
    verif(page_id(S) == 'habitants', 'Retour au Grand Livre : à la même page')
    # la mission « Lis la recette » (page montrée)
    m = ev(S, "() => { var L = M.etapesMission(), i = L.map(function(e){ return JSON.stringify(e.fait || ''); }).indexOf(JSON.stringify([{lu:'recettes'}])); M.majMission(); return [i, i >= 0 && !!M.P().mission.faits[i], !!M.P().vus['page:recettes']]; }")
    verif(m[2] and (m[0] < 0 or m[1]), f'Mission « Lis à l\'Alchimiste la recette » validée en montrant la page ({m})')
    # --- les recettes ---
    S.evaluate("() => M.livreAller('recettes', true)"); S.wait_for_timeout(100)
    rec = S.inner_text('.lv-page.on')
    verif('Encre révélatrice' in rec and 'Eau de la fontaine' in rec and '×2' in rec and 'puis' not in rec and 'zone' not in rec.lower(), 'Recettes : nom, ingrédients et quantités, sans le pas-à-pas ni la zone du chaudron')
    verif('page blanche' in rec.lower(), 'Recettes : l\'encre révélatrice montre qu\'elle fait parler la page blanche')
    verif(S.locator('.lv-page.on .lv-recette').count() >= 4 and S.locator('.lv-page.on .lv-fiole svg').count() >= 4, f'Recettes : une carte avec sa fiole par potion connue ({S.locator(".lv-page.on .lv-recette").count()})')
    S.click('.lv-page.on .lv-vers'); attendre_tour(S)
    verif(page_id(S) == 'mystere', 'Recettes : le raccourci mène à la page blanche')
    # --- la page blanche ---
    verif(S.inner_text('.lv-page.on').strip() == '' and S.is_visible('.lv-page.on .lv-blanc'), f'Page blanche : pas un mot ({S.inner_text(".lv-page.on")[:40]!r})')
    S.click('.lv-page.on .lv-blanc'); S.wait_for_timeout(300)
    verif(not ev(S, '() => !!M.UI.modal') and not ev(S, '() => !!M.P().pages.mystere'), 'Page blanche sans encre : rien ne s\'ouvre (les reflets frémissent)')
    seq = ev(S, "() => M.code('pot:revelatrice')")
    taper_code(S, seq); fermer(S)
    verif(ev(S, '() => M.P().potions.revelatrice') == 1, 'Le code de l\'encre est reçu')
    S.click('[data-act=onglet][data-o=role]'); S.wait_for_timeout(200)
    verif(page_id(S) == 'mystere' and S.locator('.lv-page.on .lv-blanc.pret').count() == 1, 'Retour au livre : à la même page, qui brille plus fort')
    S.screenshot(path=f'{OUT}/e1-390-04b-page-blanche-prete.png')
    # le tutoriel (12.2) : avec l'encre, la page blanche se révèle par le mini-jeu « Les runes » (réussi ici)
    ev(S, "() => { window.__mj = []; MJ.lancer = function(el, type, params, fin){ window.__mj.push([type, params.image, params.niveauEffectif]); setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 30); return {arreter:function(){}}; }; }")
    S.click('.lv-page.on .lv-blanc'); S.wait_for_timeout(600)
    verif(ev(S, "() => window.__mj") == [['runes', 'carte', 1]], f'Avec l\'encre, la page blanche lance « Les runes » (le plan à reconstituer, niveau 1) ({ev(S, "() => window.__mj")})')
    verif(ev(S, "() => M.UI.modal && M.UI.modal.type") == 'decouverte' and ev(S, '() => !!M.P().pages.mystere'), 'Runes réussies : la page blanche parle (découverte)')
    verif(ev(S, "() => !!M.P().objets['_info:carte'] && (M.P().potions.revelatrice || 0) === 0"), 'Le plan de la forêt est trouvé, l\'encre est utilisée')
    fermer(S); S.wait_for_timeout(2400)
    verif(S.locator('.lv-page.on .lv-carte-foret').count() == 1 and S.locator('.lv-page.on .b-code').count() == 1, 'La page montre le plan de la forêt et son code')
    seq_carte = ev(S, "() => M.code('info:carte').join(',')")
    affiche = ev(S, "() => Array.from(document.querySelectorAll('.lv-page.on .b-code .b-sym')).map(function(x){ return x.getAttribute('aria-label'); }).join(',')")
    verif(affiche == ev(S, "() => M.code('info:carte').map(function(s){ return DONNEES.SYM[s].n; }).join(',')"), f'Le code affiché est celui du plan ({affiche})')
    verif(ev(S, "() => { var c = document.querySelector('.lv-page.on .b-code'); return !c.querySelector('small') && !/[A-Za-zÀ-ÿ]/.test(c.innerText); }"), 'Le code du plan : seulement les dessins, sans leur nom écrit')
    S.screenshot(path=f'{OUT}/e1-390-04c-plan-de-la-foret.png')
    # --- les codes des moments ---
    S.evaluate("() => M.livreAller('codes', true)"); S.wait_for_timeout(100)
    lignes = S.locator('.lv-page.on .lv-mo').count()
    codes_ok = ev(S, """() => { var E = M.E(); return E.moments.every(function(m, i){ if(!i) return true; var li = document.querySelectorAll('.lv-page.on .lv-mo')[i];
      return Array.from(li.querySelectorAll('.b-sym')).map(function(x){ return x.getAttribute('aria-label'); }).join(',') === M.code('moment:' + i).map(function(s){ return DONNEES.SYM[s].n; }).join(','); }); }""")
    verif(lignes == 3 and codes_ok, f'Codes des moments : matin, après-midi, soir, chacun avec son code ({lignes})')
    sans = ev(S, """() => { var p = document.querySelector('.lv-page.on'), t = p.querySelector('.lv-moments').innerText;
      return {intro:p.querySelectorAll('.lv-intro').length, small:p.querySelectorAll('.lv-moments small').length,
        noms:Object.keys(DONNEES.SYM).map(function(k){ return DONNEES.SYM[k].n; }).filter(function(n){ return t.indexOf(n) >= 0; })}; }""")
    verif(sans['intro'] == 0 and sans['small'] == 0 and not sans['noms'], f'Codes des moments : pas de texte d\'explication en haut, pas de nom écrit sous les dessins ({sans})')
    def harmonie(pg, quoi):
        """Tous les cadres de la même taille ; le logo, le nom et les trois dessins au même endroit (et de la même taille) dans chaque cadre."""
        h = ev(pg, """() => Array.from(document.querySelectorAll('.lv-page.on .lv-mo')).map(function(li){ var r = li.getBoundingClientRect();
          function rel(el){ if(!el) return null; var b = el.getBoundingClientRect(); return [Math.round(b.left - r.left), Math.round(b.top - r.top), Math.round(b.width), Math.round(b.height)]; }
          return {taille:[Math.round(r.width), Math.round(r.height)], ic:rel(li.querySelector('.lv-mo-ic')), nom:rel(li.querySelector('.lv-mo-tete b')), plateau:rel(li.querySelector('.lv-mo-code')),
            sym:Array.from(li.querySelectorAll('.b-sym')).map(rel)}; })""")
        tailles = set(tuple(x['taille']) for x in h); ics = set(tuple(x['ic']) for x in h); plateaux = set(tuple(x['plateau']) for x in h)
        noms_y = set(x['nom'][1] for x in h); syms = [tuple(map(tuple, x['sym'])) for x in h if x['sym']]
        verif(len(tailles) == 1 and len(ics) == 1 and len(plateaux) == 1 and len(noms_y) == 1 and len(set(syms)) == 1 and all(len(s) == 3 for s in syms),
              f'{quoi} : les cadres des moments sont tous pareils (taille {tailles}, logo {ics}, plateau {plateaux}, dessins {set(syms)})')
    harmonie(S, '390×844 matin')
    S.click('.lv-page.on [data-act=moment-suivant]'); S.wait_for_timeout(200)
    verif(ev(S, "() => M.UI.modal && M.UI.modal.type") == 'moment', '« Passer à l\'après-midi » montre le code en grand')
    S.click('#voile [data-act=passer-moment]'); S.wait_for_timeout(2500)
    verif(ev(S, '() => M.P().moment') == 1 and page_id(S) == 'codes', 'Le Sage passe à l\'après-midi, le livre reste à la page des codes')
    verif('maintenant' in S.get_attribute('.lv-page.on .lv-mo:nth-child(2)', 'class') and 'suivant' in S.get_attribute('.lv-page.on .lv-mo:nth-child(3)', 'class'), 'Codes : l\'après-midi est « maintenant », le soir est « le prochain »')
    verif('Passer au soir' in S.inner_text('.lv-page.on [data-act=moment-suivant]'), f'Le bouton dit maintenant « Passer au soir » ({S.inner_text(".lv-page.on [data-act=moment-suivant]")!r})')
    harmonie(S, '390×844 après-midi')
    S.screenshot(path=f'{OUT}/e1-390-06b-codes-apres-midi.png')
    # --- l'enquête 1 n'a pas de points d'action : ni page « 💡 Donner une action », ni réserve (la page est testée dans l'enquête 2, plus bas) ---
    verif(S.locator('.lv-page[data-id=actions]').count() == 0 and S.locator('#app [data-act=reserve]').count() == 0 and ev(S, '() => M.sansActions()'),
          'E1 (sans points d\'action) : ni page « Donner une action » ni bouton de réserve')
    ev(S, "() => { M.A['passer-moment'](); }"); S.wait_for_timeout(2400)
    verif(S.locator('.lv-page.on .lv-fin-jour').count() == 1 and S.locator('.lv-page.on [data-act=moment-suivant]').count() == 0, 'Dernier moment : « accuse ! » et un lien vers l\'accusation')
    S.click('.lv-page.on .lv-fin-jour [data-lv=aller]'); attendre_tour(S)
    verif(page_id(S) == 'accusation', 'Le lien mène à la page de l\'accusation')
    # --- l'accusation ---
    verif('raye' in (S.get_attribute('.lv-page.on .lv-suspect:nth-child(1)', 'class') or ''), 'Accusation : Gaspard, barré dans le tableau, est grisé')
    S.click('.lv-page.on [data-act=accuser]'); S.wait_for_timeout(200)
    verif(ev(S, "() => M.UI.modal && M.UI.modal.type") == 'accusation', 'Le bouton « Accuser » de la dernière page ouvre l\'accusation')
    S.click('#voile [data-act=acc-choix][data-k=qui][data-v=tim]'); S.wait_for_timeout(40)
    verif(ev(S, "() => getComputedStyle(document.querySelector('#voile .b-feuille')).animationName") == 'none', 'Accusation : passer de QUI à OÙ ne refait pas monter la fenêtre')
    S.click('#voile [data-act=acc-choix][data-k=ou][data-v=chene]'); S.click('#voile [data-act=acc-valider]'); S.wait_for_timeout(300)
    verif(ev(S, "() => M.UI.modal && M.UI.modal.type") == 'victoire', 'Accusation juste → victoire')
    ctx.close()

    # ===== 2. Enquête 2 (la rivière rouge, § 12.11) : toutes les pages au doigt =====
    # (La nouvelle enquête 2 n'a pas de points d'action, comme l'enquête 1, et l'enquête 3 est « en cours d'écriture » :
    #  la page « 💡 Donner une action » et la réserve du Sage n'ont plus d'enquête où se tester ; l'ancienne lettre blanche du Corbeau n'existe plus.)
    for n, nb in ((2, 9),):
        for (W, H) in ((390, 844), (360, 740)):
            print(f'— Enquête {n} ({W}×{H})')
            ctx, S = sage(b, W, H, n)
            cdp = ctx.new_cdp_session(S)
            L = pages(S)
            verif(len(L) == nb and L[0] == 'tableau' and L[-2:] == ['codes', 'accusation'] and 'fondateurs' in L and 'actions' not in L, f'E{n} : {nb} pages, tableau en premier, codes puis accusation à la fin, pas de « donner une action » ({L})')
            vus = [page_id(S)]
            S.screenshot(path=f'{OUT}/e{n}-{W}-01-{vus[0]}.png')
            for i in range(1, len(L)):
                glisser_doigt(S, cdp, W - 30, 25, int(H * 0.55))
                vus.append(page_id(S))
                S.screenshot(path=f'{OUT}/e{n}-{W}-{i + 1:02d}-{vus[-1]}.png')
            verif(vus == L, f'E{n} {W}×{H} : toutes les pages tournées au doigt, dans l\'ordre')
            mise_en_page(S, W, H, f'E{n}')
            if n == 2 and W == 390:
                S.evaluate("() => M.livreAller('codes', true)"); S.wait_for_timeout(100)
                verif(S.locator('.lv-page.on .lv-mo').count() == 3, 'E2 : trois moments (matin, après-midi, nuit)')
                harmonie(S, 'E2 390×844 (trois moments)')
                S.evaluate("() => M.livreAller('recettes', true)"); S.wait_for_timeout(100)
                verif('vérité' in S.inner_text('.lv-page.on'), 'E2 : la potion de vérité est dans les recettes')
                S.evaluate("() => M.livreAller('accusation', true)"); S.wait_for_timeout(100)
                verif(S.locator('.lv-page.on .lv-questions li').count() == 3 and S.locator('.lv-page.on .lv-verrou-acc').count() == 1, 'E2 : l\'accusation montre QUI, OÙ, POURQUOI, et ce qui reste à éclaircir')
                mise_en_page(S, W, H, 'E2 accusation')
            ctx.close()

    # ===== 3. Mise en page à toutes les tailles =====
    for (W, H) in TAILLES:
        print(f'— Mise en page {W}×{H}')
        ctx, S = sage(b, W, H, 1)
        mise_en_page(S, W, H, 'tableau')
        S.screenshot(path=f'{OUT}/taille-{W}x{H}-tableau.png')
        for pid in ('recettes', 'fondateurs', 'codes', 'accusation'):   # (enquête 1 : pas de page « Donner une action »)
            S.evaluate(f"() => M.livreAller('{pid}', true)"); S.wait_for_timeout(120)
            mise_en_page(S, W, H, pid)
            if pid == 'codes': harmonie(S, f'{W}×{H}')
            S.screenshot(path=f'{OUT}/taille-{W}x{H}-{pid}.png')
        # le bouton Accuser se trouve en faisant défiler la page, et marche
        S.locator('.lv-page.on [data-act=accuser]').scroll_into_view_if_needed()
        bb = S.locator('.lv-page.on [data-act=accuser]').bounding_box()
        nav = ev(S, "() => document.querySelector('.b-onglets').getBoundingClientRect().top")
        verif(bb and bb['y'] + bb['height'] <= nav + 1, f'{W}×{H} : le bouton « Accuser » est atteignable')
        S.click('.lv-page.on [data-act=accuser]'); S.wait_for_timeout(150)
        verif(ev(S, "() => M.UI.modal && M.UI.modal.type") == 'accusation', f'{W}×{H} : accusation depuis la dernière page')
        fermer(S)
        verif(page_id(S) == 'accusation', f'{W}×{H} : après la fenêtre, le livre est resté à la même page')
        # au doigt, à cette taille aussi
        cdp = ctx.new_cdp_session(S)
        glisser_doigt(S, cdp, 30, W - 20, int(H * 0.5))
        verif(page_id(S) == 'codes', f'{W}×{H} : glisser au doigt tourne la page')
        ctx.close()

    # ===== 4. Une vieille sauvegarde (avant le livre) se charge =====
    print('— Vieille sauvegarde')
    ctx, S = sage(b, 390, 844, 1)
    ev(S, """() => { var S = M.S; delete S.options.livreTourne; S.e.onglet = 'role'; S.e.tableau = {surs:{basile:1}}; S.e.raye = ['victor']; delete S.e.vus['page:recettes']; M.sauver(); }""")
    S.reload(wait_until='domcontentloaded'); S.wait_for_timeout(300)
    if S.is_visible('[data-act=reprendre]'): S.click('[data-act=reprendre]')
    S.wait_for_selector('#livre-ici'); S.wait_for_timeout(200)
    verif(page_id(S) == 'tableau' and S.locator('.lv-page.on .tb-ligne.tb-v[data-id=basile]').count() == 1 and S.locator('.lv-page.on .tb-ligne.tb-x[data-id=victor]').count() == 1,
          'Vieille sauvegarde : le livre s\'ouvre, le tableau reprend les anciennes marques')
    ctx.close()

    print('ÉCHECS :', echecs)
    print('ERREURS :', erreurs + echecs)
    b.close()
