"""Enquête 3 : LA PINCÉE DU SAC ÉVENTRÉ (17 novembre, étape 3 du nouveau fil ; Bible §13.59) — Playwright.
L'Alchimiste, le matin : à la boulangerie, « Les sacs éventrés » (une icône sur sa carte) ; la pincée de farine arrive sur sa paillasse,
sans code. Au labo, au doigt : sur le cuir, un petit tas ; à la loupe, le casier des poils a gagné un rat (un mauvais poil d'abord, puis
le bon) ; au microscope, la miette noire (×10) et le brin vert qui brille (trop petit à ×10, pris à ×40) ; chacun reconnu à la loupe : la
terre de cave (casier des grains), la mousse lumineuse (casier des feuilles). En sortant : « Ces rats-là vivent sous terre ! Dis-le à tes
amis ! », sans code et sans « souterrain ». Les analyses des enquêtes 1 et 2 ne gagnent ni rat ni terre de cave. Tablette et téléphone.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-labo-sac.py"""
import sys, os
ICI = os.path.dirname(os.path.abspath(__file__))
# (les mêmes gestes de départ que le robot du secret d'Odette : ouvrir une partie de l'enquête 3 pour un rôle)
exec(open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split('with sync_playwright() as p:')[0].replace("'e3-secret')", "'e3-labo-sac')"))

def labo(pg, role_vue):
    F = {}
    def ouvrir():
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); M.ouvrirLabo(); }"); pg.wait_for_timeout(1800)
        f = next((x for x in pg.frames if x.parent_frame is not None), None)
        f.wait_for_function('() => !!window.__labo', timeout=8000); f.evaluate("() => { window.__labo.mimi.calme = true; }")
        f.evaluate("() => { var g = document.querySelector('.intro-go'); if(g) g.click(); }"); pg.wait_for_timeout(300)
        F['f'] = f; return f
    etat = lambda: F['f'].evaluate("() => { var S = window.__labo.etat(), d = S.dos[S.dc] || {coupes:[]}; return {mode:S.mode, sel:S.sel, dc:S.dc, tiroir:S.tiroir, casier:S.casier, zoom:S.zoom, trouves:S.trouves, finis:S.finis, barres:S.barres, coupes:d.coupes.map(function(c){ return c && c.t; })}; }")
    def clic(sel):
        F['f'].wait_for_function('() => !window.__labo.etat().occupe', timeout=9000)
        F['f'].click(sel, force=True)
    def bulle():
        return F['f'].evaluate("() => { var b = document.querySelector('.bulle-o'); return b ? b.textContent : ''; }")
    def viser(g):
        F['f'].evaluate("g => { var S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }", g)
        bx = F['f'].locator('#lentille').bounding_box(); S = F['f'].evaluate("() => ({cx:window.__labo.etat().cx, cy:window.__labo.etat().cy})"); k = max(1, bx['width']/560)
        pg.mouse.click(bx['x'] + bx['width']/2 + (g['x'] - S['cx'])*k, bx['y'] + bx['height']/2 + (g['y'] - S['cy'])*k)
    def items(z, tous=False):
        return F['f'].evaluate("a => { var S = window.__labo.etat(); return S.dos[S.dc].items[a[0]].filter(function(i){ return !i.pris && (a[1] || !(i.min > a[0])); }).map(function(i){ return {x:i.x, y:i.y, t:i.t, min:i.min || 0}; }); }", [z, tous])
    def coupe(t):
        c = etat()['coupes']; clic('#coupe' + str(c.index(t))); pg.wait_for_timeout(400)
    def casier(tir, k):
        """ouvrir un tiroir de la paillasse (g ou d) et un de ses casiers ; rend les noms des échantillons étalés"""
        clic(f'#tir-{tir} .facade'); pg.wait_for_timeout(900)
        clic(f'[data-casier="{k}"]'); pg.wait_for_timeout(700)
        return F['f'].evaluate("() => [].map.call(document.querySelectorAll('.ech[data-ech]'), function(b){ return b.dataset.ech; })")
    return F, ouvrir, etat, clic, bulle, viser, items, coupe, casier

with sync_playwright() as p:
    b = p.chromium.launch()
    VUES = (('tablette', TAB), ('telephone', {'width': 844, 'height': 390}))
    if os.environ.get('UNE_VUE'): VUES = VUES[:1]
    for nom_vue, vue in VUES:
        print(f'— L\'Alchimiste, {nom_vue}')
        pg = debut(b, 'alchimiste', vue)
        pg.on('pageerror', lambda e: print('     PAGEERROR', (getattr(e, 'stack', None) or str(e))[:900]))
        # ---------- chez Gaspard
        mq = lambda: pg.evaluate("() => M.infosCarte().marqueurs.filter(function(q){ return q.lieu === 'boulangerie'; }).map(function(q){ return q.ic; }).join('')")
        verifier('🌾' in mq() and '🎂' in mq(), f'sur sa carte, à la boulangerie : le gâteau et les sacs éventrés ({mq()})')
        ev(pg, 'lieu', {'id': 'boulangerie'}); pg.wait_for_timeout(300)
        pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile .b-point[data-act=point]'), function(x){ return x.dataset.id; })")
        verifier(pts == ['gateau', 'sac'], f'la boulangerie, le matin : le gâteau, et les sacs éventrés ({pts})')
        verifier(pg.evaluate("() => !M.P().recus['obj:sac_farine']"), 'rien sur la paillasse avant')
        pg.locator('#voile .b-point[data-act=point][data-id=sac]').first.click(force=True); pg.wait_for_timeout(400)
        t = texte(pg)
        verifier('rats grands comme des chats' in t and 'ta paillasse' in t and pg.locator('#voile .b-donne, #voile .b-code').count() == 0 and pg.locator('#voile .b-lire').count() >= 1, f'« Les sacs éventrés » : un drôle de poil, une miette noire, un brin vert… sans code, avec son 🔊 ({t[:70]})')
        verifier(pg.evaluate("() => !!M.P().recus['obj:sac_farine'] && !M.P().objets.sac_farine && !M.P().objets['_obj:sac_farine']"), 'la pincée est sur la paillasse (reçue), et il n\'a aucun code à donner')
        if vue is TAB: shot(pg, 'sacs-eventres')
        fermer(pg)
        verifier('🌾' not in mq(), 'ramassé : l\'icône des sacs quitte la carte')
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(700)
        sp = pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-pa-signe:not(.at-et-signe)'); return e ? e.textContent : ''; }")
        verifier('analyser' in sp.lower(), f'au-dessus de la paillasse : « À analyser ! » ({sp})')
        # ---------- au labo
        F, ouvrir, etat, clic, bulle, viser, items, coupe, casier = labo(pg, vue)
        f = ouvrir()
        verifier(f.evaluate("() => window.__labo.cuirs()") == ['sac_farine'], f'sur le cuir : la pincée du sac éventré ({f.evaluate("() => window.__labo.cuirs()")})')
        shot(pg, f'{nom_vue}-1-cuir')
        clic('#ech-sac_farine'); pg.wait_for_timeout(400)
        verifier(f.evaluate("() => !document.querySelector('#gLoupe').classList.contains('non') && !document.querySelector('#gMicro').classList.contains('non')"), 'la loupe et le microscope sont allumés pour elle')
        # la loupe : le casier des poils a gagné un rat ; un mauvais poil d'abord
        clic('#gLoupe'); pg.wait_for_timeout(1900)
        shot(pg, f'{nom_vue}-2-loupe')
        l = casier('g', 'poils')
        verifier('poils:rat' in l and 'poils:souris' in l, f'le casier des poils a gagné un rat ({len(l)} poils)')
        shot(pg, f'{nom_vue}-3-casier-poils')
        clic('[data-ech="poils:souris"]'); pg.wait_for_timeout(2600)
        verifier(not etat()['trouves'].get('sac_farine') and (etat()['barres'].get('sac_farine') or {}).get('poils:souris'), 'la souris : ce n\'est pas elle (barrée)')
        clic('[data-ech="poils:rat"]'); pg.wait_for_timeout(2800)
        verifier(etat()['trouves'].get('sac_farine') and not etat()['finis'].get('sac_farine'), 'le rat : reconnu ; l\'analyse n\'est pas bouclée (il reste la terre et la mousse)')
        pg.wait_for_timeout(2200)
        tb = f.evaluate("() => { var e = document.querySelector('#hudBoite .savoir'); return e ? e.textContent : ''; }")
        verifier('trois fois plus gros' in tb and f.locator('#hudBoite .savoir .lire, #hudBoite .savoir button').count() >= 1, f'ce que la loupe apprend : « Mais celui-ci est trois fois plus gros que la normale ! », avec son 🔊 ({tb[:70]})')
        shot(pg, f'{nom_vue}-4-rat')
        clic('#bFermer'); pg.wait_for_timeout(1000)
        # le microscope : la miette noire à ×10 ; le brin vert, trop petit à ×10, pris à ×40
        clic('#ech-sac_farine'); pg.wait_for_timeout(300); clic('#gMicro'); pg.wait_for_timeout(2200)
        verifier(etat()['mode'] == 'micro' and etat()['zoom'] == 10, 'le microscope, ×10')
        shot(pg, f'{nom_vue}-5-micro10')
        i10 = items(10, True)
        verifier(sorted(x['t'] for x in i10) == ['mousse_g', 'terre_g', 'terre_g'] and [x['min'] for x in i10 if x['t'] == 'mousse_g'] == [40], f'à ×10 : deux miettes noires, et le brin vert (trop petit) ({[x["t"] for x in i10]})')
        g = [x for x in i10 if x['t'] == 'mousse_g'][0]; viser(g); pg.wait_for_timeout(900)
        verifier('mousse_g' not in etat()['coupes'], 'le brin vert, à ×10 : trop petit pour la pince')
        g = [x for x in i10 if x['t'] == 'terre_g'][0]; viser(g); pg.wait_for_timeout(1100)
        verifier(etat()['coupes'].count('terre_g') == 1, f'la miette noire : dans une coupelle ({etat()["coupes"]})')
        clic('#zoomTxt'); pg.wait_for_timeout(1500)
        verifier(etat()['zoom'] == 40, '×40')
        shot(pg, f'{nom_vue}-6-micro40')
        g = [x for x in items(40) if x['t'] == 'mousse_g'][0]; viser(g); pg.wait_for_timeout(1100)
        verifier(etat()['coupes'].count('mousse_g') == 1, f'le brin vert, à ×40 : dans une coupelle ({etat()["coupes"]})')
        clic('#zoomTxt'); pg.wait_for_timeout(1500)
        verifier(etat()['zoom'] == 100, '×100')
        shot(pg, f'{nom_vue}-7-micro100')
        clic('#bFermer'); pg.wait_for_timeout(1000)
        # chacun à la loupe : la terre de cave (les grains), la mousse lumineuse (les feuilles)
        coupe('terre_g'); pg.wait_for_timeout(300); clic('#gLoupe'); pg.wait_for_timeout(1900)
        l = casier('d', 'grains')
        verifier('grains:terrecave' in l and 'grains:terre' in l, 'le casier des grains a gagné une terre de cave, à côté de la terre de jardin')
        shot(pg, f'{nom_vue}-8-casier-grains')
        clic('[data-ech="grains:terrecave"]'); pg.wait_for_timeout(2800)
        verifier(etat()['trouves'].get('terre_g'), 'la miette noire : une terre de cave')
        clic('#bFermer'); pg.wait_for_timeout(1000)
        coupe('mousse_g'); pg.wait_for_timeout(300); clic('#gLoupe'); pg.wait_for_timeout(1900)
        l = casier('d', 'feuilles')
        verifier('feuilles:mousselum' in l, 'le casier des feuilles a gagné la mousse lumineuse')
        shot(pg, f'{nom_vue}-9-casier-feuilles')
        clic('[data-ech="feuilles:mousselum"]'); pg.wait_for_timeout(2800)
        verifier(etat()['trouves'].get('mousse_g') and etat()['finis'].get('sac_farine'), 'le brin vert : la mousse lumineuse — l\'analyse est bouclée')
        clic('#bFermer'); pg.wait_for_timeout(1000)
        shot(pg, f'{nom_vue}-10-fini')
        f.evaluate("() => window.__labo.quitter()"); pg.wait_for_timeout(900)
        t = texte(pg)
        verifier('poil de rat' in t and 'terre de cave' in t and 'mousse lumineuse' in t and 'vivent sous terre' in t and 'Dis-le à tes amis' in t, f'en sortant : un poil de rat énorme, une terre de cave, la mousse lumineuse — « Ces rats-là vivent sous terre ! Dis-le à tes amis ! » ({t[:60]})')
        verifier(pg.locator('#voile .b-donne, #voile .b-code').count() == 0 and not any(x in t.lower() for x in ('souterrain', 'donjon', 'crypte')) and pg.locator('#voile .b-lire').count() >= 1, 'sans code, sans « souterrain », avec son 🔊')
        shot(pg, f'{nom_vue}-11-fiche')
        fermer(pg)
        verifier(pg.evaluate("() => !!M.P().analyses.sac_farine") and 'vivent sous terre' in pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).join(' | ')"), 'l\'analyse est faite, et notée au Carnet')
        pg.close()
    # ---------- les enquêtes 1 et 2 : leurs casiers ne gagnent rien
    print('— Le labo, hors de l\'enquête 3')
    pg = b.new_context(viewport=TAB).new_page(); pg.set_default_timeout(8000)
    pg.on('pageerror', lambda e: erreurs.append(f'[labo seul] PAGEERROR {e}'))
    pg.goto(URL.replace('index.html#test', 'labo.html'))
    try:
        pg.wait_for_function('() => !!window.__labo', timeout=8000)
        L = pg.evaluate("() => { var l = [], LI = window.__labo.listes(); ['facile', 'difficile'].forEach(function(nv){ ['poils', 'grains', 'feuilles'].forEach(function(k){ (LI[nv][k] || []).forEach(function(x){ l.push(x); }); }); }); return l; }")
        verifier(L is not None and 'rat' not in L and 'terrecave' not in L and 'mousselum' not in L, f'sans la pincée sur le cuir : ni rat, ni terre de cave, ni mousse dans les casiers ({None if L is None else len(L)})')
    except Exception as e:
        verifier(False, f'le labo seul ne s\'ouvre pas ({e})')
    b.close()

vrais = [e for e in erreurs if 'favicon' not in e]
print('Erreurs de console :', len(vrais))
for e in vrais[:8]: print('   ', e[:300])
if echecs or vrais:
    print(f'RATÉ : {len(echecs)} vérification(s), {len(vrais)} erreur(s)'); sys.exit(1)
print('Tout est bon : la pincée du sac éventré.')
