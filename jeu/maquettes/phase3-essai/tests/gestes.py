#!/usr/bin/env python3
"""Les vrais gestes dans la page (téléphone couché, puis tablette), et quatre tablettes calées ensemble.
   python3 tests/gestes.py  → vérifications + captures dans /tmp/p3v3
   0. (v3, v4) la mise en page : la salle sur tout l'écran ; le bouclier à gauche au-dessus du pouce, l'attaque, le soin et le saut à droite ; rien ne se chevauche
   1. mode seul, premier combat : les éclairs, ni acide ni bouclier ; le tambour ; le film d'Odette ; le bouton jaune ;
   2. deuxième combat : le pouce gauche fait courir ; toucher une partie de Grosbec la vise ; un sort se lance ; bouger le coupe ;
      le bouclier se lève ; une seule bulle à la fois ; (v4) la partie faible bouge sur Grosbec : la toucher la vise et la crie ; la méga attaque d'un ami, relayée en touchant son portrait ;
   3. une zone ratée : l'écran en noir et blanc, plus rien ; « On reprend » et le bouton jaune ;
   4. le code : mon symbole, la petite fenêtre, un faux, les bons, la fin ;
   5. quatre tablettes, le même numéro, le bouton jaune « ensemble » : même temps, chaque info sur une seule tablette, jamais chez celui qu'elle concerne."""
import os, sys, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3.html')
OUT = os.environ.get('P3_SORTIE', '/tmp/p3v4'); os.makedirs(OUT, exist_ok=True)
soucis = []
def non(c, m):
    print(('  ✓ ' if c else '  ✗ ') + m)
    if not c: soucis.append(m)
AVANCE = """(function(n){ var S=__p3.S; for (var k=0;k<n;k++) __p3.P3.pas(S,0.05,null); __p3.caler(); return S.T; })"""

with sync_playwright() as p:
    b = p.chromium.launch()
    # 0. la mise en page, sur trois écrans couchés
    for (w, h) in [(932, 430), (852, 393), (667, 375), (1180, 820), (1024, 768)]:
        c0 = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=True, is_mobile=True); q = c0.new_page()
        q.goto(PAGE); q.evaluate("localStorage.clear()"); q.reload(); q.wait_for_timeout(150)
        q.evaluate("Object.assign(__p3.reglages, {mode:'seul', debut:2})"); q.evaluate("__p3.demarrer()"); q.wait_for_timeout(2700)
        r = q.evaluate("""(function(){ var v=__p3.vue, L=__p3.P3.REG.salle, K=Dessin.K, o={};
            ['bBouclier','bAttaque','bSoin','bSaut'].forEach(function(id){ var e=document.getElementById(id).getBoundingClientRect(); o[id]={x:e.left+e.width/2, y:e.top+e.height/2, r:e.width/2, vu:e.width>0}; });
            var tete = Dessin.centrePartie(0);
            return {o:o, gauche:v.ox, droite:innerWidth-(v.ox+L.L*v.T), bas:innerHeight-(v.oy+L.P*v.T*K), haut:tete[1]-0.64*v.T, T:v.T,
              lieux:__p3.P3.REG.lieux.map(function(l){ return [Dessin.X(l.x), Dessin.Y(l.y), 1.4*v.T]; })}; })()""")
        o = r['o']; ids = list(o)
        dedans = all(b_['vu'] and b_['x'] - b_['r'] >= 0 and b_['x'] + b_['r'] <= w + 0.5 and b_['y'] - b_['r'] >= 0 and b_['y'] + b_['r'] <= h + 0.5 for b_ in o.values())
        chev = [(i, j) for k, i in enumerate(ids) for j in ids[k + 1:] if ((o[i]['x'] - o[j]['x']) ** 2 + (o[i]['y'] - o[j]['y']) ** 2) ** 0.5 < o[i]['r'] + o[j]['r']]
        cotes = o['bBouclier']['x'] < w * 0.25 and all(o[i]['x'] > w * 0.6 for i in ['bAttaque', 'bSoin', 'bSaut']) and o['bAttaque']['r'] > o['bSoin']['r']
        # les objets des endroits sûrs ne passent pas sous un bouton
        sous = [n for n, (lx, ly, rr) in zip(['lanterne', 'statue', 'fontaine'], r['lieux']) for i in ids if ((o[i]['x'] - lx) ** 2 + (o[i]['y'] - ly) ** 2) ** 0.5 < o[i]['r'] + 0.5 * r['T']]
        non(dedans and not chev and cotes and not sous, '%dx%d : bouclier à gauche ; la grosse attaque, le soin, le saut à droite ; tout dans l\'écran, rien ne se chevauche, aucun endroit sûr sous un bouton %s %s' % (w, h, chev, sous))
        couche = w / h > 1.9
        non(r['bas'] < 1 and r['haut'] > 0 and (not couche or r['gauche'] < w * 0.12), '%dx%d : la salle prend l\'écran (sol au bord du bas, marge des côtés %d px, la tête de Grosbec à %d px du haut)' % (w, h, r['gauche'], r['haut']))
        if (w, h) == (932, 430): q.screenshot(path=OUT + '/0-mise-en-page-max.png')
        c0.close()
    ctx = b.new_context(viewport={'width': 852, 'height': 393}, device_scale_factor=2, has_touch=True, is_mobile=True)
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
    non(not pg.locator('#bBouclier').is_visible() and pg.locator('#bAttaque').is_visible() and pg.locator('#bAttaque b').text_content() == '📜', 'au premier combat : pas de bouclier ; l\'attaque porte la tête de mon héros')
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
    non(pg.evaluate("__p3.S.combat") == 2 and pg.locator('#bBouclier').is_visible(), 'le deuxième combat : le bouclier arrive')
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
    pg.locator('#bAttaque').tap(force=True); pg.wait_for_timeout(300)
    non(pg.evaluate("!!__p3.S.h.lance && __p3.S.h.lance.quoi") == 'sort', 'le bouton d\'attaque la lance')
    pg.screenshot(path=OUT + '/7-sort-tel.png')
    pg.mouse.move(150, 280); pg.mouse.down(); pg.mouse.move(100, 280, steps=4); pg.wait_for_timeout(300); pg.mouse.up()
    non(pg.evaluate("__p3.S.h.lance") is None, 'bouger coupe le sort')
    pg.locator('#bBouclier').tap(force=True); pg.wait_for_timeout(100)
    non(pg.evaluate("__p3.S.h.bouclierFin > __p3.S.T"), 'le bouclier se lève')
    pg.locator('#bBouclier').tap(force=True); pg.wait_for_timeout(100)
    non(pg.evaluate("__p3.S.stats") is not None and 'non' in (pg.locator('#bBouclier').get_attribute('class') or ''), 'puis il se recharge (le bouton tremble)')
    # (v4) la partie faible bouge sur MON Grosbec : la toucher la vise et la crie aux robots
    pg.evaluate("__p3.fige = true")
    pm = None
    for k in range(1500):
        pm = pg.evaluate("(function(){ var S=__p3.S; for (var k=0;k<4;k++) __p3.P3.pas(S,0.05,null); S.h.pv=100; S.h.mort=0; var x=__p3.P3.partMontree(S); return x && !S.relais[x.ref+'part'] && S.T > x.tA + 0.3 ? x.val : null; })()")
        if pm is not None: break
    pg.evaluate("__p3.caler()"); pg.wait_for_timeout(120)
    non(pm is not None and pg.evaluate("__p3.S.bulle === null || __p3.S.bulle.x === null || __p3.S.bulle.x.quoi !== 'part' || __p3.S.bulle.type !== 'villageois'"), 'la partie faible ne passe pas par une bulle (elle bouge sur Grosbec)')
    pg.screenshot(path=OUT + '/8-partie-faible-tel.png')
    if pm is not None:
        pg.evaluate("__p3.fige = true")
        q = pg.evaluate("Dessin.centrePartie(" + str(pm) + ")"); av = pg.evaluate("__p3.S.stats.relaisFaits")
        pg.mouse.click(q[0], q[1]); pg.wait_for_timeout(60)
        non(pg.evaluate("__p3.S.cible") == pm and pg.evaluate("__p3.S.stats.relaisFaits") > av, 'toucher la partie qui bouge : je la vise, et je la crie à tous')
        pg.evaluate("__p3.fige = false")
    # la méga attaque d'un ami : la relayer en touchant son portrait (seulement celle de la bulle ; jamais deux bulles)
    pg.evaluate("__p3.fige = true")
    ami = None; deux = 0
    for k in range(3000):
        ami = pg.evaluate("(function(){ var S=__p3.S; for (var k=0;k<4;k++) __p3.P3.pas(S,0.05,null); S.h.pv=100; S.h.mort=0; S.h.bouclierFin=S.T+5; var b=S.bulle; return b && b.type==='villageois' && b.x.quoi==='mega' ? b.x.cible : null; })()")
        if k % 20 == 0: pg.evaluate("__p3.caler()"); pg.wait_for_timeout(20); deux += pg.evaluate("__p3.dctx.boites.length > 1 ? 1 : 0")
        if ami: break
    pg.evaluate("__p3.caler()"); pg.wait_for_timeout(60)
    non(deux == 0 and pg.evaluate("__p3.dctx.boites.length") == 1, 'une seule bulle à l\'écran à la fois')
    non(ami is not None and 'crie' in (pg.locator('.cadre[data-r="' + str(ami) + '"]').get_attribute('class') or ''), 'mon villageois montre la méga attaque d\'un ami : son portrait clignote (' + str(ami) + ')')
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
    non(not pg.locator('#bAttaque').is_visible(), 'mort : plus de boutons')
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
    pg.evaluate("(function(){ var S=__p3.S; S.attente = 0; S.boss = 1; S.faible = {id:-1, part:S.cible}; S.tirs.push({quoi:'sort', part:S.cible, x:S.h.x, y:S.h.y, t:__p3.P3.REG.sort.vol - 0.01}); __p3.P3.pas(S,0.02,null); __p3.caler(); })()")
    pg.evaluate("__p3.fige = false"); pg.wait_for_timeout(600)
    non(pg.evaluate("__p3.S.boss") == 0, 'ma barre de Grosbec à zéro')
    pg.screenshot(path=OUT + '/11-symbole-tel.png')
    non(pg.locator('.cadre[data-r="sage"] .sym').text_content() == pg.evaluate("__p3.S.symboles.sage"), 'mon symbole se met tout seul dans ma case')
    non(not pg.locator('#bAttaque').is_visible() or 'eteint' in (pg.locator('#bAttaque').get_attribute('class') or ''), 'mon attaque est grise')
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
    non(not pg.locator('#fin').is_visible(), 'les quatre cases justes : d\'abord, Grosbec tombe')
    pg.screenshot(path=OUT + '/13-chute-tel.png')
    pg.wait_for_timeout(2400)
    non(pg.locator('#fin').is_visible(), 'puis la fin')
    pg.screenshot(path=OUT + '/13-fin-tel.png')
    non(not errs, 'aucune erreur (téléphone) ' + str(errs[:3]))
    ctx.close()

    # 5. quatre tablettes, le même numéro, le bouton jaune ensemble
    pages, errs4 = {}, []
    tailles = {'pisteur': (852, 393), 'alchimiste': (1180, 820), 'barde': (1024, 768), 'sage': (932, 430)}
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
    non(all(len(v) == 1 for v in vus.values()) and len(vus) >= 3, 'chaque info sur une seule tablette (%d infos vues)' % len(vus))
    non(any('zone' in k for k in vus), 'la première grosse zone (à 30 s) annoncée sur une tablette')
    non(not errs4, 'aucune erreur (quatre tablettes) ' + str(errs4[:3]))
    b.close()
print('SOUCIS', len(soucis), soucis)
sys.exit(1 if soucis else 0)
