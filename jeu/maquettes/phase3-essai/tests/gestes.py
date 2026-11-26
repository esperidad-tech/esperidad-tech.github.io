#!/usr/bin/env python3
"""Les vrais gestes dans la page (téléphone couché, puis tablette), et quatre tablettes calées ensemble.
   python3 tests/gestes.py  → vérifications + captures dans /tmp/p3v2
   1. mode seul, premier combat : les éclairs, ni acide ni bouclier ; le tambour ; le film d'Odette ; le bouton jaune ;
   2. deuxième combat : le pouce gauche fait courir ; toucher une partie de Grosbec la vise ; un sort se lance ; bouger le coupe ;
      le bouclier se lève ; une bulle pour un ami, relayée en touchant son portrait ;
   3. une zone ratée : l'écran en noir et blanc, plus rien ; « On reprend » et le bouton jaune ;
   4. le code : mon symbole, la petite fenêtre, un faux, les bons, la fin ;
   5. quatre tablettes, le même numéro, le bouton jaune « ensemble » : même temps, chaque info sur une seule tablette, jamais chez celui qu'elle concerne."""
import os, sys, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3.html')
OUT = os.environ.get('P3_SORTIE', '/tmp/p3v2'); os.makedirs(OUT, exist_ok=True)
soucis = []
def non(c, m):
    print(('  ✓ ' if c else '  ✗ ') + m)
    if not c: soucis.append(m)
AVANCE = """(function(n){ var S=__p3.S; for (var k=0;k<n;k++) __p3.P3.pas(S,0.05,null); __p3.caler(); return S.T; })"""

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto(PAGE); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(300)
    # 1. le départ, mode seul (par défaut), le Sage
    pg.locator('#roles button[data-r="sage"]').tap(force=True)
    pg.locator('#modes button[data-m="seul"]').tap(force=True)
    pg.screenshot(path=OUT + '/3-debut-tel.png')
    pg.locator('#bGo').tap(force=True); pg.wait_for_timeout(2600)
    S = pg.evaluate("(function(){var S=__p3.S; return {combat:S.combat, etat:S.etat, seul:S.seul, moi:S.moi};})()")
    non(S == {'combat': 1, 'etat': 'combat', 'seul': True, 'moi': 'sage'}, 'le premier combat démarre, mode seul, le Sage')
    non(not pg.locator('#bAcide').is_visible() and not pg.locator('#bBouclier').is_visible() and pg.locator('#bFeu').is_visible(), 'au premier combat : ni acide ni bouclier')
    pg.evaluate(AVANCE + "(40)"); pg.wait_for_timeout(250)
    pg.screenshot(path=OUT + '/4-combat1-tel.png')
    pg.evaluate("__p3.fige = true"); pg.evaluate(AVANCE + "(1450)"); pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(200)
    st = pg.evaluate("__p3.S.etat")
    non(st in ('film', 'go'), 'après le tambour, le film d\'Odette (' + st + ')')
    pg.evaluate("__p3.fige = true"); pg.evaluate("(function(){var S=__p3.S; S.attente = 4; })()"); pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(150)
    pg.screenshot(path=OUT + '/5-film-tel.png')
    pg.wait_for_timeout(4300)
    non(pg.locator('#bJaune').is_visible() and pg.locator('#bJaune').text_content() == 'GO', 'le bouton jaune GO après le film')
    pg.screenshot(path=OUT + '/6-go-tel.png')
    pg.locator('#bJaune').tap(force=True); pg.wait_for_timeout(2300)
    non(pg.evaluate("__p3.S.combat") == 2 and pg.locator('#bAcide').is_visible() and pg.locator('#bBouclier').is_visible(), 'le deuxième combat : l\'acide et le bouclier arrivent')
    # 2. le pouce gauche : glisser fait courir
    x0 = pg.evaluate("__p3.S.h.x")
    pg.mouse.move(150, 280); pg.mouse.down(); pg.mouse.move(210, 280, steps=4); pg.wait_for_timeout(500); pg.mouse.up()
    non(pg.evaluate("__p3.S.h.x") > x0 + 0.5, 'le pouce gauche fait courir le héros vers la droite')
    # toucher une partie de Grosbec la vise
    tete = pg.evaluate("__p3.P3 && Dessin.centrePartie(0)")
    pg.mouse.click(tete[0], tete[1]); pg.wait_for_timeout(100)
    non(pg.evaluate("__p3.S.cible") == 0, 'toucher la tête de Grosbec la vise')
    bras = pg.evaluate("Dessin.centrePartie(3)"); pg.mouse.click(bras[0], bras[1]); pg.wait_for_timeout(100)
    non(pg.evaluate("__p3.S.cible") == 3, 'toucher son bras droit le vise')
    # un sort se lance ; bouger le coupe
    pg.locator('#bFeu').tap(force=True); pg.wait_for_timeout(300)
    non(pg.evaluate("!!__p3.S.h.lance && __p3.S.h.lance.quoi") == 'feu', 'le bouton feu lance le sort')
    pg.screenshot(path=OUT + '/7-sort-tel.png')
    pg.mouse.move(150, 280); pg.mouse.down(); pg.mouse.move(100, 280, steps=4); pg.wait_for_timeout(300); pg.mouse.up()
    non(pg.evaluate("__p3.S.h.lance") is None, 'bouger coupe le sort')
    pg.locator('#bBouclier').tap(force=True); pg.wait_for_timeout(100)
    non(pg.evaluate("__p3.S.h.bouclierFin > __p3.S.T"), 'le bouclier se lève')
    pg.locator('#bBouclier').tap(force=True); pg.wait_for_timeout(100)
    non(pg.evaluate("__p3.S.stats") is not None and 'non' in (pg.locator('#bBouclier').get_attribute('class') or ''), 'puis il se recharge (le bouton tremble)')
    # une bulle pour un ami : la relayer en touchant son portrait
    pg.evaluate("__p3.fige = true")
    ami = None
    for k in range(400):
        ami = pg.evaluate("(function(){ var S=__p3.S; for (var k=0;k<4;k++) __p3.P3.pas(S,0.05,null); S.h.pv=100; var l=__p3.P3.mesInfos(S).filter(function(x){return (x.quoi==='elem'||x.quoi==='part') && x.tFin - S.T > 4 && !S.relais[x.ref+x.quoi];}); return l.length ? l[0].cible : null; })()")
        if ami: break
    pg.evaluate("__p3.caler()"); pg.wait_for_timeout(60)
    non(ami is not None and 'crie' in (pg.locator('.cadre[data-r="' + str(ami) + '"]').get_attribute('class') or ''), 'mon villageois montre une info pour un ami : son portrait clignote (' + str(ami) + ')')
    pg.screenshot(path=OUT + '/8-bulle-tel.png')
    if ami:
        avant = pg.evaluate("__p3.S.stats.relaisFaits")
        pg.locator('.cadre[data-r="' + ami + '"]').tap(force=True); pg.wait_for_timeout(100)
        non(pg.evaluate("__p3.S.stats.relaisFaits") > avant, 'toucher son portrait la lui « crie »')
    pg.evaluate("__p3.fige = false")
    # 3. une zone ratée : noir et blanc
    pg.evaluate("__p3.fige = true")
    pg.evaluate("""(function(){ var S=__p3.S, P=__p3.P3, z=P.suite(S.partie).zones.filter(function(z){return z.tA>S.T+0.5;})[0];
        while (S.T < z.tI - 0.2) { P.pas(S,0.05,null); S.h.pv=100; S.h.bouclierFin=-1; }
        var l=P.REG.lieux[(z.lieu+1)%3]; S.h.x=l.x; S.h.y=l.y+0.9; S.h.bouclierFin=-1; S.h.intouchable=0;
        for (var k=0;k<8;k++) P.pas(S,0.05,null); __p3.caler(); })()""")
    pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(250)
    non(not pg.evaluate("__p3.P3.vivant(__p3.S)") and 'mort' in (pg.locator('#c').get_attribute('class') or ''), 'une zone ratée : on tombe, l\'écran passe en noir et blanc')
    non(not pg.locator('#bFeu').is_visible(), 'mort : plus de boutons')
    pg.screenshot(path=OUT + '/9-mort-tel.png')
    T1 = pg.evaluate("__p3.S.T")
    pg.locator('#bReprise').tap(force=True); pg.wait_for_timeout(100)
    non(pg.locator('#bJaune').text_content() == '↺', '« On reprend » : le gros bouton jaune')
    pg.screenshot(path=OUT + '/10-reprise-tel.png')
    pg.locator('#bJaune').tap(force=True); pg.wait_for_timeout(100)
    T2 = pg.evaluate("__p3.S.T")
    non(pg.evaluate("__p3.P3.vivant(__p3.S)") and abs(T2 - (T1 // 30) * 30) < 0.5, 'retour au dernier point de reprise (%.1f → %.1f), vivant' % (T1, T2))
    # 4. le code
    pg.evaluate("__p3.fige = true")
    pg.evaluate("(function(){ var S=__p3.S; S.attente = 0; S.boss = 1; S.faible = {id:-1, elem:0, part:S.cible}; S.tirs.push({quoi:'feu', part:S.cible, x:S.h.x, y:S.h.y, t:0.34}); __p3.P3.pas(S,0.02,null); __p3.caler(); })()")
    pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(600)
    non(pg.evaluate("__p3.S.boss") == 0, 'ma barre de Grosbec à zéro')
    pg.screenshot(path=OUT + '/11-symbole-tel.png')
    non(pg.locator('.cadre[data-r="sage"] .sym').text_content() == pg.evaluate("__p3.S.symboles.sage"), 'mon symbole se met tout seul dans ma case')
    non(not pg.locator('#bFeu').is_visible() or 'eteint' in (pg.locator('#bFeu').get_attribute('class') or ''), 'mes sorts sont gris')
    pg.evaluate("__p3.S.relais = new Proxy({}, {get: function(){ return 1; }})")   # plus rien à relayer : le portrait ouvre la fenêtre des symboles
    syms = pg.evaluate("__p3.S.symboles")
    faux = [s for s in pg.evaluate("__p3.P3.SYMS") if s != syms['barde']][0]
    pg.locator('.cadre[data-r="barde"]').tap(force=True); pg.wait_for_timeout(100)
    non(pg.locator('#symboles').is_visible(), 'toucher le portrait d\'un ami ouvre la petite fenêtre')
    pg.screenshot(path=OUT + '/12-fenetre-tel.png')
    pg.locator('#symboles button', has_text=faux).tap(force=True); pg.wait_for_timeout(100)
    non(pg.locator('.cadre[data-r="barde"] .sym').text_content() == '', 'un faux symbole ne rentre pas')
    for ro in ['barde', 'pisteur', 'alchimiste']:
        pg.evaluate("__p3.S.h.pv = 100; __p3.S.h.mort = 0")
        pg.locator('.cadre[data-r="' + ro + '"]').tap(force=True); pg.wait_for_timeout(80)
        pg.locator('#symboles button', has_text=syms[ro]).tap(force=True); pg.wait_for_timeout(80)
    pg.wait_for_timeout(300)
    non(pg.locator('#fin').is_visible(), 'les quatre cases justes : la fin')
    pg.screenshot(path=OUT + '/13-fin-tel.png')
    non(not errs, 'aucune erreur (téléphone) ' + str(errs[:3]))
    ctx.close()

    # 5. quatre tablettes, le même numéro, le bouton jaune ensemble
    pages, errs4 = {}, []
    tailles = {'pisteur': (844, 390), 'alchimiste': (1180, 820), 'barde': (1024, 768), 'sage': (915, 412)}
    for ro, (w, h) in tailles.items():
        c2 = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=True, is_mobile=True)
        q = c2.new_page(); q.on('pageerror', lambda e, ro=ro: errs4.append(ro + ': ' + str(e)[:200]))
        q.goto(PAGE); q.evaluate("localStorage.clear()"); q.reload(); q.wait_for_timeout(200)
        q.locator('#roles button[data-r="' + ro + '"]').tap(force=True); q.locator('#modes button[data-m="quatre"]').tap(force=True)
        q.locator('#pave button', has_text='4').tap(force=True); q.locator('#pave button', has_text='7').tap(force=True)
        q.evaluate("__p3.reglages.debut = 2")
        q.locator('#bGo').tap(force=True); q.wait_for_timeout(100)
        pages[ro] = q
    non(all(q.locator('#bJaune').is_visible() for q in pages.values()), 'à quatre : le gros bouton jaune GO partout')
    pages['barde'].screenshot(path=OUT + '/14-quatre-go-tab.png')
    for q in pages.values(): q.locator('#bJaune').tap(force=True); time.sleep(0.12)
    t0 = time.time(); vus = {}; ecart = 0; mauvais = 0
    while time.time() - t0 < 38:
        etats = {ro: q.evaluate("(function(){var S=__p3.S; return {T:S.T, infos:__p3.P3.mesInfos(S).map(function(x){return x.ref+x.quoi+'>'+x.cible;})};})()") for ro, q in pages.items()}
        Ts = [e['T'] for e in etats.values()]; ecart = max(ecart, max(Ts) - min(Ts))
        for ro, e in etats.items():
            for i in e['infos']:
                vus.setdefault(i, set()).add(ro)
                if i.endswith('>' + ro): mauvais += 1
        if abs(time.time() - t0 - 33) < 0.3:
            for ro, q in pages.items(): q.screenshot(path=OUT + '/15-quatre-' + ro + '.png')
        time.sleep(0.3)
    non(ecart < 1.2, 'les quatre tablettes restent calées (écart le plus grand : %.2f s, avec les appuis à la main)' % ecart)
    non(mauvais == 0, 'jamais une info chez celui qu\'elle concerne')
    non(all(len(v) == 1 for v in vus.values()) and len(vus) > 6, 'chaque info sur une seule tablette (%d infos vues)' % len(vus))
    non(any('zone' in k for k in vus), 'la première grosse zone (à 30 s) annoncée sur une tablette')
    non(not errs4, 'aucune erreur (quatre tablettes) ' + str(errs4[:3]))
    b.close()
print('SOUCIS', len(soucis), soucis)
sys.exit(1 if soucis else 0)
