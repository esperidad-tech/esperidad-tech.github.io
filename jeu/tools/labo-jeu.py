"""Le labo d'analyses DANS le jeu (enquête 1), joué au doigt sur un téléphone couché, puis sur une tablette :
l'Alchimiste reçoit le fil, touche sa paillasse, la bulle « Analyser » : le labo s'ouvre en plein écran (un cadre, src/labo.js).
Il reconnaît le fil à la loupe (laine tricotée), prélève les grains au microscope, reconnaît la suie : l'analyse est bouclée,
le code s'écrit sur l'ardoise. Il quitte : la fiche de la découverte s'ouvre avec le vrai code, l'analyse est notée dans la partie.
Puis les poils arrivent (13 novembre : plus de plume noire) : le labo se rouvre avec deux échantillons, le fil déjà reconnu, ses coupelles gardées.
  BRUMEVAL_DIST=<dossier de build> python3 tools/labo-jeu.py [iphone|tablette]     (captures dans jeu/test/labo/)"""
import sys, os, json
from playwright.sync_api import sync_playwright
D = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(os.path.dirname(__file__), '..', 'dist')); URL = 'file://' + os.path.join(D, 'index.html')
ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'labo'); os.makedirs(ICI, exist_ok=True)
QUI = [a for a in sys.argv[1:] if a in ('iphone', 'tablette')] or ['iphone', 'tablette']
APP = {'iphone': ({'width':844, 'height':390}, True), 'tablette': ({'width':1080, 'height':810}, False)}
err = []; R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for nom in QUI:
        vp, mobile = APP[nom]
        ctx = b.new_context(viewport=vp, device_scale_factor=2, has_touch=True, is_mobile=mobile); pg = ctx.new_page(); pg.set_default_timeout(9000)
        pg.on('pageerror', lambda e: err.append(str(e)))
        pg.on('console', lambda m: err.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
        pg.goto(URL)
        pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
        pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
        o = pg.locator('[data-act=onglet]', has_text='Atelier')
        if o.count(): o.first.click()
        pg.wait_for_timeout(700)
        # hors tutoriel : on coupe le guidage pour essayer librement ; le fil arrive (comme si le Pisteur avait donné son code)
        # (le tutoriel fait attendre les échantillons dont ce n'est pas le tour : ici on dit que c'est toujours leur tour ; on essaie l'attente à la fin)
        # (le guide de la première analyse et l'explication en images sont essayés à part, tools/labo-guide.py : ici, pas de guide dans le labo)
        pg.evaluate("() => { if(window.Atelier && Atelier.guider){ Atelier.guider(null); Atelier.guider = function(){ return false; }; } M.tutoPermet = function(){ return true; }; M.tutoActif = function(){ return false; }; var P = M.P(); P.recus['obj:fil'] = true; M.sauver(); M.render(); }")
        pg.wait_for_timeout(600)
        r = {}
        # rien reçu ne s'analyse sans objet : avant le fil, la paillasse expliquait comment un objet arrive (vérifié à part, plus bas)
        def ouvrir_labo():
            pg.evaluate("() => document.querySelector('#atelier-ici [data-at=analyses]').dispatchEvent(new MouseEvent('click', {bubbles:true}))"); pg.wait_for_timeout(900)
            bg = pg.locator('.at-bulle-go').first.bounding_box(); pg.touchscreen.tap(bg['x'] + bg['width']/2, bg['y'] + bg['height']/2); pg.wait_for_timeout(1500)
            f = next((x for x in pg.frames if x.parent_frame is not None), None)
            if f: f.wait_for_function('() => !!window.__labo', timeout=8000); f.evaluate("() => { window.__labo.mimi.calme = true; var g = document.querySelector('.intro-go'); if(g) g.click(); }"); pg.wait_for_timeout(300)
            return f
        f = ouvrir_labo()
        r['cadre'] = pg.locator('#labo-cadre').count(); r['panneau'] = pg.locator('.at-f-analyses').count()
        pg.screenshot(path=f'{ICI}/{nom}-01-labo.png')
        etat = lambda: f.evaluate("() => { var S = window.__labo.etat(), d = S.dos[S.dc] || {coupes:[]}; return {mode:S.mode, sel:S.sel, dc:S.dc, trouves:S.trouves, finis:S.finis, coupes:d.coupes.map(function(c){ return c && c.t; }), cuirs:window.__labo.cuirs()}; }")
        clic = lambda sel: f.click(sel, force=True)
        r['cuirs'] = etat()['cuirs']; r['jeu'] = f.evaluate("() => document.body.classList.contains('jeu')"); r['reglages'] = f.locator('.barre-haut').is_visible(); r['quitter'] = f.locator('#bQuitter').is_visible()
        r['code'] = f.evaluate("() => JSON.stringify(window.LABO_CFG.codes)"); r['style'] = f.evaluate("() => JSON.stringify(window.LABO_CFG.style)")
        def trouver(tir, casier, bon):
            clic(f'#tir-{tir} .facade'); pg.wait_for_timeout(1300); clic(f'#tir-{tir} [data-casier="{casier}"]'); pg.wait_for_timeout(700)
            clic(f'[data-ech="{casier}:{bon}"]'); pg.wait_for_timeout(2200)
        def viser(g):
            f.evaluate("g => { var S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }", g)
            bx = f.locator('#lentille').bounding_box(); S = f.evaluate("() => ({cx:window.__labo.etat().cx, cy:window.__labo.etat().cy})"); k = max(1, bx['width']/560)
            pg.mouse.click(bx['x'] + bx['width']/2 + (g['x'] - S['cx'])*k, bx['y'] + bx['height']/2 + (g['y'] - S['cy'])*k)
        def prendre(z):
            for g in f.evaluate("z => { var S = window.__labo.etat(); return S.dos[S.dc].items[z].filter(function(i){ return !i.pris && !(i.min > z); }).map(function(i){ return {x:i.x, y:i.y}; }); }", z):
                viser(g); pg.wait_for_timeout(950)
        def coupe(t):
            c = etat()['coupes']; clic('#coupe' + str(c.index(t))); pg.wait_for_timeout(400)
        # ---------- le fil : la loupe, le microscope, la suie ----------
        clic('#ech-fil'); pg.wait_for_timeout(400); clic('#gLoupe'); pg.wait_for_timeout(1900)
        trouver('g', 'fils', 'tricot'); r['fil'] = etat()['trouves'].get('fil'); pg.wait_for_timeout(2300); pg.screenshot(path=f'{ICI}/{nom}-02-laine.png')
        r['son_savoir'] = f.locator('.savoir .b-son').count()
        if r['son_savoir']: f.locator('.savoir .b-son').first.click(force=True); pg.wait_for_timeout(300)
        r['lu'] = pg.evaluate("() => !!(window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending)) || 'pas de voix ici'")
        clic('#bFermer'); pg.wait_for_timeout(900)
        clic('#ech-fil'); pg.wait_for_timeout(300); clic('#gMicro'); pg.wait_for_timeout(1300); pg.screenshot(path=f'{ICI}/{nom}-03-micro.png')
        prendre(10); clic('.num[data-zoom="40"]'); pg.wait_for_timeout(900); prendre(40); clic('#zoomTxt'); pg.wait_for_timeout(900); prendre(100)
        clic('#bFermer'); pg.wait_for_timeout(900); r['coupes'] = etat()['coupes']
        coupe('noir'); clic('#gLoupe'); pg.wait_for_timeout(2000); trouver('d', 'grains', 'suie'); r['suie'] = etat()['trouves'].get('noir'); r['fini'] = etat()['finis'].get('fil'); pg.wait_for_timeout(2300)
        r['analyse_notee'] = pg.evaluate("() => M.P().analyses.fil || 0")       # notée dans la partie dès que le dossier est bouclé
        clic('#bSuiv'); pg.wait_for_timeout(1300); trouver('d', 'grains', 'terre'); r['terre'] = etat()['trouves'].get('brun'); pg.wait_for_timeout(2300)
        clic('#bFermer'); pg.wait_for_timeout(1000)
        r['ardoise'] = f.evaluate("() => document.querySelector('#ardoise').textContent"); r['bouton'] = f.evaluate("() => document.querySelector('#bQuitter').className + ' ' + document.querySelector('#bQuitter').textContent")
        pg.screenshot(path=f'{ICI}/{nom}-04-boucle.png')
        # ---------- on quitte : la fiche de la découverte, avec le vrai code ----------
        f.locator('#bQuitter').click(force=True); pg.wait_for_timeout(1200)
        r['cadre_apres'] = pg.locator('#labo-cadre').count(); r['modal'] = pg.evaluate("() => M.UI.modal && M.UI.modal.type"); r['titre'] = pg.evaluate("() => M.UI.modal && M.UI.modal.titre")
        r['code_fiche'] = pg.evaluate("() => { var c = document.querySelector('#voile .b-code'); return c ? [].map.call(c.querySelectorAll('.b-sym span'), function(s){ return s.textContent; }).join('') : null; }")
        r['code_attendu'] = pg.evaluate("() => M.code('info:echarpe').map(function(s){ return DONNEES.SYM[s].e; }).join('')")
        r['notes'] = pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).filter(function(t){ return /Analyse|laine|terre/.test(t); })")
        r['sauve'] = pg.evaluate("() => { var L = M.P().labo; return L ? {finis:Object.keys(L.finis), coupes:L.dos.fil.coupes.map(function(c){ return c && c.t; })} : null; }")
        pg.screenshot(path=f'{ICI}/{nom}-05-fiche.png')
        pg.evaluate("() => M.fermer()"); pg.wait_for_timeout(600)
        # ---------- les poils arrivent : le labo se rouvre, tout est resté (13 novembre : plus de plume noire, deux analyses) ----------
        pg.evaluate("() => { var P = M.P(); P.recus['obj:poils'] = true; M.sauver(); M.render(); }"); pg.wait_for_timeout(600)
        pg.screenshot(path=f'{ICI}/{nom}-06-atelier.png')
        # ---------- le tutoriel dit « les poils, plus tard » : ils attendent sur le cuir, on ne peut pas les choisir ----------
        pg.evaluate("() => { M.tutoPermet = function(n, x){ return !(n === 'analyser' && x && x.id === 'poils'); }; M.render(); }"); pg.wait_for_timeout(500)
        f = ouvrir_labo()
        r['plus_tard'] = f.evaluate("() => JSON.stringify(window.LABO_CFG.plusTard)"); clic('#ech-poils'); pg.wait_for_timeout(500)
        r['plume_refusee'] = etat()['sel'] != 'poils'; r['bulle_attente'] = f.evaluate("() => { var b = document.querySelector('.bulle-o'); return b ? b.textContent : ''; }"); pg.screenshot(path=f'{ICI}/{nom}-09-plus-tard.png')
        f.locator('#bQuitter').click(force=True); pg.wait_for_timeout(900); r['rien_de_neuf'] = pg.evaluate("() => M.UI.modal && M.UI.modal.type")
        pg.evaluate("() => { M.tutoPermet = function(){ return true; }; M.render(); }"); pg.wait_for_timeout(500)
        f = ouvrir_labo(); e2 = etat()
        r['cuirs2'] = e2['cuirs']; r['fil_garde'] = e2['finis'].get('fil'); r['dc2'] = e2['dc']
        clic('#ech-fil'); pg.wait_for_timeout(500); r['coupes_gardees'] = etat()['coupes']; pg.screenshot(path=f'{ICI}/{nom}-07-deux.png')
        clic('#ech-poils'); pg.wait_for_timeout(400); clic('#gLoupe'); pg.wait_for_timeout(1900); trouver('g', 'poils', 'chien'); pg.wait_for_timeout(2400); clic('#bFermer'); pg.wait_for_timeout(900)
        clic('#ech-poils'); pg.wait_for_timeout(300); clic('#gMicro'); pg.wait_for_timeout(1300); prendre(10); clic('.num[data-zoom="40"]'); pg.wait_for_timeout(900); prendre(40); clic('#bFermer'); pg.wait_for_timeout(900)
        coupe('feuil'); clic('#gLoupe'); pg.wait_for_timeout(2000); trouver('d', 'feuilles', 'chene'); pg.wait_for_timeout(2400); clic('#bFermer'); pg.wait_for_timeout(900)
        r['poils'] = etat()['finis'].get('poils')
        f.locator('#bQuitter').click(force=True); pg.wait_for_timeout(1200)
        r['fiche2'] = pg.evaluate("() => M.UI.modal && M.UI.modal.titre"); pg.screenshot(path=f'{ICI}/{nom}-08-fiche-poils.png')
        pg.evaluate("() => M.fermer()"); pg.wait_for_timeout(700)
        r['fiche3'] = True
        r['analyses'] = pg.evaluate("() => JSON.stringify(M.P().analyses)")
        r['ancien_bouton'] = pg.evaluate("() => { M.A.analyser({dataset:{id:'fil'}}); return !!document.getElementById('labo-cadre'); }")      # le vieux chemin ouvre le labo, jamais une analyse toute faite
        pg.evaluate("() => M.fermerLabo()"); pg.wait_for_timeout(300)
        R[nom] = r; ctx.close()
    def bon(r):
        return (r['cadre'] == 1 and r['panneau'] == 0 and r['cuirs'] == ['fil'] and r['jeu'] and not r['reglages'] and r['quitter'] and r['fil'] and r['suie'] and r['fini'] and r['analyse_notee'] >= 1
                and r['terre'] and 'aller' in r['bouton'] and r['cadre_apres'] == 0 and r['modal'] == 'decouverte' and r['code_fiche'] and r['code_fiche'] == r['code_attendu'] and r['code_attendu'] in r['ardoise'].replace(' ', '')
                and any('Analyse des poils de la fenêtre' in t for t in r['notes']) and any('terre' in t for t in r['notes']) and r['sauve'] and 'fil' in r['sauve']['finis'] and 'noir' in r['sauve']['coupes']
                and r['cuirs2'] == ['fil', 'poils'] and r['fil_garde'] and r['dc2'] == 'poils' and 'noir' in r['coupes_gardees'] and r['poils'] and r['fiche2'] and r['fiche3']
                and 'poils' in r['plus_tard'] and r['plume_refusee'] and 'Plus tard' in r['bulle_attente'] and r['rien_de_neuf'] is None
                and all(k in r['analyses'] for k in ('fil', 'poils')) and r['ancien_bouton'])
    ok = all(bon(r) for r in R.values())
    print(json.dumps(R, ensure_ascii=False)); print('ERREURS', err); print('ÉCHECS' if (err or not ok) else 'tout est bon')
    b.close()
