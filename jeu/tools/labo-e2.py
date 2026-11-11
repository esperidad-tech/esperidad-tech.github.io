"""Le labo d'analyses de l'ENQUÊTE 2 dans le vrai jeu (Romain, 11 novembre : « plein d'étapes, de la vraie science » ; Bible §12.56, point 7).
Une Alchimiste en enquête 2 reçoit les six échantillons et fait tout au doigt, sur une tablette :
- la rivière (un flacon sur le cuir) : bouts de pétales (coquelicot), farine (l'iode vire au bleu-noir), vert-de-gris (flamme verte : une note),
  la daphnie à ×100, le test des couleurs (coquelicot) ;
- le lavoir : poil d'âne (une note), coton, cendre, le test des couleurs (bois de Brésil) → son code pour le Barde ;
- la poudre : poudre noire, soufre (flamme bleue), charbon, laine noire (notes), l'eau chaude → le rouge (coquelicot) ;
- le colorant : un bout de pétale, le test des couleurs ;
- puis les deux pièces (le cuir n'a que quatre places : ceux qui restent à analyser d'abord) : or, farine (pièce de la boulangerie),
  la tache rouge que l'eau chaude fait fondre (pièce du moulin) → la deuxième donne le code des pièces jumelles au Barde.
  BRUMEVAL_DIST=<dossier de build> python3 tools/labo-e2.py      (captures dans jeu/test/labo-e2/)"""
import os, json
from playwright.sync_api import sync_playwright
D = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(os.path.dirname(__file__), '..', 'dist')); URL = 'file://' + os.path.join(D, 'index.html')
ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'labo-e2'); os.makedirs(ICI, exist_ok=True)
err = []; echecs = []
def verifier(ok, quoi):
    print(('  OK  ' if ok else '  ÉCHEC ') + quoi)
    if not ok: echecs.append(quoi)
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width':1080, 'height':810}, device_scale_factor=1, has_touch=True); pg = ctx.new_page(); pg.set_default_timeout(9000)
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.A['mode-test']({dataset:{i:'2'}}); M.A['confirmer-oui'](); M.A['nouvelle-enquete'](); M.A.commencer(); }"); pg.wait_for_timeout(600)
    pg.evaluate("() => { var P = M.P(); ['eau_riviere','eau_lavoir','poudre','colorant'].forEach(function(id){ P.recus['obj:' + id] = 1; }); M.sauver(); M.render(); }"); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.P().id === 2 && M.laboDispo()"), 'Enquête 2 : le labo est branché (E.labo)')
    F = {}
    def ouvrir():
        pg.evaluate("() => { M.UI.modal = null; M.render(); M.ouvrirLabo(); }"); pg.wait_for_timeout(1800)
        f = next((x for x in pg.frames if x.parent_frame is not None), None)
        f.wait_for_function('() => !!window.__labo', timeout=8000); f.evaluate("() => { window.__labo.mimi.calme = true; }")
        # (la toute première fois : l'explication en images ; on la referme par son bouton jaune — elle est essayée dans tools/labo-guide.py)
        f.evaluate("() => { var g = document.querySelector('.intro-go'); if(g) g.click(); }"); pg.wait_for_timeout(300)
        F['f'] = f; return f
    f = ouvrir()
    etat = lambda: F['f'].evaluate("() => { var S = window.__labo.etat(), d = S.dos[S.dc] || {coupes:[]}; return {mode:S.mode, sel:S.sel, dc:S.dc, trouves:S.trouves, finis:S.finis, coupes:d.coupes.map(function(c){ return c && c.t; })}; }")
    def clic(sel):
        F['f'].wait_for_function('() => !window.__labo.etat().occupe', timeout=9000)   # (une animation en cours : on attend qu'elle finisse, comme un enfant)
        F['f'].click(sel, force=True)
    def bulle():
        return F['f'].evaluate("() => { var b = document.querySelector('.bulle-o'); return b ? b.textContent : ''; }")
    def trouver(tir, casier, bon):
        clic(f'#tir-{tir} .facade'); pg.wait_for_timeout(1300); clic(f'#tir-{tir} [data-casier="{casier}"]'); pg.wait_for_timeout(700)
        clic(f'[data-ech="{casier}:{bon}"]'); pg.wait_for_timeout(2400)
    def viser(g):
        F['f'].evaluate("g => { var S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }", g)
        bx = F['f'].locator('#lentille').bounding_box(); S = F['f'].evaluate("() => ({cx:window.__labo.etat().cx, cy:window.__labo.etat().cy})"); k = max(1, bx['width']/560)
        pg.mouse.click(bx['x'] + bx['width']/2 + (g['x'] - S['cx'])*k, bx['y'] + bx['height']/2 + (g['y'] - S['cy'])*k)
    def prendre(z):
        for g in F['f'].evaluate("z => { var S = window.__labo.etat(); return S.dos[S.dc].items[z].filter(function(i){ return !i.pris && !(i.min > z); }).map(function(i){ return {x:i.x, y:i.y}; }); }", z):
            viser(g); pg.wait_for_timeout(950)
    def micro(d, photo):
        clic(f'#ech-{d}'); pg.wait_for_timeout(400); clic('#gMicro'); pg.wait_for_timeout(1300); pg.screenshot(path=f'{ICI}/{photo}-x10.png'); prendre(10)
        clic('.num[data-zoom="40"]'); pg.wait_for_timeout(900); pg.screenshot(path=f'{ICI}/{photo}-x40.png'); prendre(40)
        clic('#zoomTxt'); pg.wait_for_timeout(900); pg.screenshot(path=f'{ICI}/{photo}-x100.png'); prendre(100)
        clic('#bFermer'); pg.wait_for_timeout(900)
    def coupe(t):
        c = etat()['coupes']; clic('#coupe' + str(c.index(t))); pg.wait_for_timeout(400)
    def loupe(cible, tir, casier, bon):
        if cible.startswith('#'): clic(cible)
        else: coupe(cible)
        pg.wait_for_timeout(300); clic('#gLoupe'); pg.wait_for_timeout(1900); trouver(tir, casier, bon); clic('#bFermer'); pg.wait_for_timeout(900)
    def goutte(cible, k, photo=None):
        if cible.startswith('#'): clic(cible)
        else: coupe(cible)
        pg.wait_for_timeout(300); clic(f'[data-act="goutte"][data-k="{k}"]'); pg.wait_for_timeout(1500); t = bulle()
        if photo: pg.screenshot(path=f'{ICI}/{photo}.png')
        pg.wait_for_timeout(1800); return t
    def flamme(cible, photo=None):
        if cible.startswith('#'): clic(cible)
        else: coupe(cible)
        pg.wait_for_timeout(300); clic('[data-act="flamme"]'); pg.wait_for_timeout(900)
        couleur = F['f'].evaluate("() => document.querySelector('#gLampe .flamme').getAttribute('class')")
        if photo: pg.screenshot(path=f'{ICI}/{photo}.png')
        pg.wait_for_timeout(1500); return couleur, bulle()
    def test(cible, temoin, photo):
        if cible.startswith('#'): clic(cible)
        else: coupe(cible)
        pg.wait_for_timeout(300); clic('#gTest'); pg.wait_for_timeout(3800); clic(f'[data-temoin="{temoin}"]'); pg.wait_for_timeout(2600); pg.screenshot(path=f'{ICI}/{photo}.png'); clic('#bFermer'); pg.wait_for_timeout(900)
    notes = lambda: pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).join(' | ')")
    verifier(F['f'].evaluate("() => window.__labo.cuirs()") == ['eau_riviere', 'eau_lavoir', 'poudre', 'colorant'], 'Quatre échantillons sur le cuir, dans l\'ordre d\'arrivée')
    pg.screenshot(path=f'{ICI}/01-cuir.png')
    verifier(F['f'].evaluate("() => document.querySelector('#gLoupe').classList.contains('non') || true") and (clic('#ech-eau_riviere') or True) and F['f'].evaluate("() => document.querySelector('#gLoupe').classList.contains('non') && document.querySelector('#gTest').classList.contains('ok')"),
             'Un flacon choisi : la loupe s\'éteint, le test des couleurs s\'allume')
    # ---------- la rivière ----------
    micro('eau_riviere', '02-riviere')
    c = etat()['coupes']; verifier('petale_r' in c and 'farine_r' in c and 'cuivre_r' in c, f'Rivière, microscope : pétale, farine, paillette verte dans les coupelles ({c})')
    verifier(F['f'].evaluate("() => window.__labo.etat().dos.eau_riviere.mite.x") > 0, 'Rivière : la daphnie nage dans la goutte (×100)')
    loupe('petale_r', 'd', 'petales', 'coquelicot'); verifier(etat()['trouves'].get('petale_r'), 'Rivière : le bout de pétale, c\'est du coquelicot (loupe)')
    t = goutte('farine_r', 'iode', '03-riviere-iode'); verifier('bleu-noir' in t, f'Rivière : l\'iode vire au bleu-noir sur les grains blancs ({t})')
    loupe('farine_r', 'd', 'grains', 'farine'); verifier(etat()['trouves'].get('farine_r'), 'Rivière : les grains blancs, c\'est de la farine (loupe)')
    cl, t = flamme('cuivre_r', '04-riviere-flamme-verte'); verifier('verte' in cl and 'verte' in t, f'Rivière : la paillette à la bougie, la flamme devient verte ({cl} ; {t})')
    test('#ech-eau_riviere', 'coquelicot', '05-riviere-test'); verifier(etat()['finis'].get('eau_riviere'), 'Rivière : le test des couleurs (coquelicot) boucle l\'analyse')
    verifier('vert-de-gris' in notes(), 'Rivière : la note du vert-de-gris au Carnet')
    # ---------- le lavoir ----------
    micro('eau_lavoir', '06-lavoir')
    c = etat()['coupes']; verifier('poils_l' in c and 'fibre_l' in c and 'cendre_l' in c, f'Lavoir, microscope : poil, fibres, cendre ({c})')
    loupe('poils_l', 'g', 'poils', 'ane'); loupe('fibre_l', 'g', 'fils', 'coton'); loupe('cendre_l', 'd', 'grains', 'cendre')
    tr = etat()['trouves']; verifier(tr.get('poils_l') and tr.get('fibre_l') and tr.get('cendre_l'), 'Lavoir : poil d\'âne, coton, cendre reconnus à la loupe')
    t = goutte('#ech-eau_lavoir', 'bicar'); verifier('violet' in t, f'Lavoir : le bicarbonate fait virer le rose au violet ({t})')
    test('#ech-eau_lavoir', 'bresil', '07-lavoir-test'); verifier(etat()['finis'].get('eau_lavoir'), 'Lavoir : le bois de Brésil boucle l\'analyse')
    verifier('âne' in notes(), 'Lavoir : la note du poil d\'âne au Carnet')
    # ---------- la poudre ----------
    loupe('#ech-poudre', 'd', 'grains', 'poudre'); verifier(etat()['trouves'].get('poudre'), 'Poudre : de la poudre noire (loupe)')
    micro('poudre', '08-poudre')
    c = etat()['coupes']; verifier('soufre_p' in c and 'charbon_p' in c and 'laine_p' in c, f'Poudre, microscope : soufre, charbon, laine noire ({c})')
    # (comme dans l'enquête 1 : une fois reconnu, un échantillon n'a plus rien à apprendre, la bougie s'éteint pour lui ; on brûle donc avant)
    cl, t = flamme('soufre_p', '09-poudre-flamme-bleue'); verifier('bleue' in cl and 'bleue' in t, f'Poudre : le soufre brûle avec une flamme bleue ({cl} ; {t})')
    loupe('soufre_p', 'd', 'grains', 'soufre'); loupe('charbon_p', 'd', 'grains', 'charbon'); loupe('laine_p', 'g', 'fils', 'feutree')
    cl, t = flamme('#ech-poudre', '10-poudre-fumee'); verifier('rouge' in t, f'Poudre à la bougie : elle fuse avec une fumée rouge ({t})')
    t = goutte('#ech-poudre', 'chaude'); verifier('rouge' in t and 'rouge_p' in etat()['coupes'], f'Poudre : l\'eau chaude en fait sortir un rouge ({t})')
    test('rouge_p', 'coquelicot', '11-poudre-test'); verifier(etat()['finis'].get('poudre'), 'Poudre : le rouge (coquelicot) boucle l\'analyse')
    n = notes(); verifier('charbon' in n and 'laine noire' in n, 'Poudre : les notes du charbon et de la laine noire au Carnet')
    # ---------- le colorant ----------
    micro('colorant', '12-colorant'); loupe('petale_c', 'd', 'petales', 'coquelicot'); test('#ech-colorant', 'coquelicot', '13-colorant-test')
    verifier(etat()['finis'].get('colorant'), 'Colorant : bout de pétale + mêmes bandes que la rivière')
    pg.screenshot(path=f'{ICI}/14-quatre-finis.png')
    clic('#bQuitter'); pg.wait_for_timeout(1300)
    vus = []
    for _ in range(6):
        m = pg.evaluate("() => M.UI.modal && {titre:M.UI.modal.titre, code:M.UI.modal.code || null}")
        if not m: break
        vus.append(m); pg.evaluate("() => M.fermer()"); pg.wait_for_timeout(900)
    verifier(len(vus) == 4 and any(v['code'] == 'info:lavoir_rose' for v in vus), f'En sortant : quatre fiches, celle du lavoir avec son code pour le Barde ({vus})')
    verifier(all(pg.evaluate(f"() => !!M.P().analyses['{d}']") for d in ['eau_riviere', 'eau_lavoir', 'poudre', 'colorant']), 'Les quatre analyses sont notées dans la partie')
    # ---------- les deux pièces ----------
    pg.evaluate("() => { var P = M.P(); P.recus['obj:piece_pain'] = 1; P.recus['obj:piece_moulin'] = 1; M.sauver(); M.render(); }"); pg.wait_for_timeout(400)
    f = ouvrir(); cu = F['f'].evaluate("() => window.__labo.cuirs()")
    verifier('piece_pain' in cu and 'piece_moulin' in cu and len(cu) == 4, f'Six reçus : les deux pièces sur le cuir (pas encore analysées), avec deux déjà finis ({cu})')
    verifier(F['f'].evaluate("() => window.__labo.etat().finis.poudre && window.__labo.etat().finis.colorant"), 'Ce qui était fini le reste (sauvegarde)')
    pg.screenshot(path=f'{ICI}/15-cuir-pieces.png')
    loupe('#ech-piece_pain', 'd', 'grains', 'or'); verifier(etat()['trouves'].get('piece_pain'), 'Pièce de la boulangerie : de l\'or (loupe)')
    micro('piece_pain', '16-piece-pain'); loupe('farine_p', 'd', 'grains', 'farine'); verifier(etat()['finis'].get('piece_pain'), 'Pièce de la boulangerie : la farine boucle l\'analyse')
    loupe('#ech-piece_moulin', 'd', 'grains', 'or'); micro('piece_moulin', '17-piece-moulin')
    t = goutte('#ech-piece_moulin', 'chaude', '18-moulin-chaude'); verifier('rouge' in t and 'rouge_m' in etat()['coupes'], f'Pièce du moulin : l\'eau chaude fait fondre la tache rouge ({t})')
    test('rouge_m', 'coquelicot', '19-moulin-test'); verifier(etat()['finis'].get('piece_moulin'), 'Pièce du moulin : le même rouge (coquelicot) boucle l\'analyse')
    clic('#bQuitter'); pg.wait_for_timeout(1300)
    vus = []
    for _ in range(4):
        m = pg.evaluate("() => M.UI.modal && {titre:M.UI.modal.titre, code:M.UI.modal.code || null, t:M.UI.modal.t || ''}")
        if not m: break
        vus.append(m); pg.screenshot(path=f'{ICI}/20-fiche-{len(vus)}.png'); pg.evaluate("() => M.fermer()"); pg.wait_for_timeout(900)
    verifier(len(vus) == 2 and not vus[0]['code'] and vus[1]['code'] == 'info:piece' and 'même petite fêlure' in vus[1]['t'], f'Les pièces : la première sans code, la deuxième raconte la comparaison et donne le code des pièces jumelles ({[(v["titre"], v["code"]) for v in vus]})')
    verifier(not err, f'Aucune erreur ({err})')
    print('ÉCHECS :', echecs); print('ERREURS :', err)
    b.close()
