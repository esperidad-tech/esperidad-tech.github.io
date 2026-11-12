"""L'établi des plantes, tout seul (la page dist/etabli.html, la « maquette ») : un robot joue les sept recettes au doigt, pour de vrai
(Playwright), en suivant les données (src/plantes-donnees.js) : la bonne partie, puis chaque étape. Il vérifie aussi :
 - les gestes faux : une mauvaise partie (la plante revient entière), un mauvais outil (ce qui se passe pour de vrai, rien n'est perdu),
   un outil touché les mains vides, l'huile de lin vide tant qu'elle n'est pas faite ;
 - le feu : une allumette sans bûche, une bûche (petit feu), deux (grand feu), le foyer plein, une bûche qu'on retire ;
 - l'eau et l'huile qui ne se mélangent pas ;
 - le grimoire : sept pages, chaque texte de plus de trois mots avec son 🔊, la recette en phrases (jamais d'image d'outil) ;
 - la tringle (une plante pendue qu'on décroche), l'étagère des potions tout en haut, le panneau du feu, « EAU », « Huile » ;
 - la carte « C'est vrai ! » de chaque potion ; après la septième, le code pour le Pisteur (plus de sac) ;
 - les 5 formes d'établi × 8 couleurs : la scène se dessine sans erreur ;
 - un téléphone couché (780 × 360) : tout tient dans l'écran et tout se touche.
   BRUMEVAL_DIST=<dossier construit> python3 tools/etabli.py"""
import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'etabli.html')
OUT = os.path.join(ICI, '..', 'test', 'etabli'); os.makedirs(OUT, exist_ok=True)
echecs, erreurs = [], []

def ok(c, quoi):
    print(('  ✓ ' if c else '  ✗ ') + quoi)
    if not c: echecs.append(quoi)

def page(b, w, h, vite=True):
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True, reduced_motion='reduce' if vite else 'no-preference').new_page()
    pg.set_default_timeout(9000)
    pg.on('pageerror', lambda e: erreurs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and 'fonts' not in m.text else None)
    pg.goto(URL); pg.wait_for_timeout(700)
    return pg

class Robot:
    def __init__(self, pg): self.pg = pg
    def libre(self):
        for _ in range(150):
            if self.pg.evaluate("() => window.__etabli.libre()"): return True
            self.pg.wait_for_timeout(60)
        return False
    def toucher(self, sel):
        q = self.pg.evaluate("(s) => { var e = document.querySelector(s); if(!e) return null; var r = e.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }", sel)
        assert q, 'introuvable : ' + sel
        self.pg.touchscreen.tap(q[0], q[1]); self.pg.wait_for_timeout(70); self.libre()
    def outil(self, o): self.toucher('#g-' + o + ' > rect[fill=transparent]')
    def etat(self):
        return self.pg.evaluate("() => { var S = window.__etabli.etat(); return {plante:S.plante, partie:S.partie, n:S.n, ou:S.ou, pos:S.pos, m:S.m && S.m.nom, H:S.H, feux:S.feux, liq:S.liq, faites:Object.keys(S.faites), mode:S.mode}; }")
    def texte(self): return self.pg.evaluate("() => window.__etabli.texte()")
    def plante(self, k, pa):
        if self.pg.evaluate("(k) => !!document.querySelector('#pendue-' + k)", k):
            self.toucher('#pendue-' + k + ' > rect[fill=transparent]'); self.pg.wait_for_timeout(200)
        self.toucher('#plante-' + k + ' .prise'); self.pg.wait_for_timeout(120)
        q = self.pg.evaluate("""(pa) => { var g = document.querySelector('.plante.zoom .pl-pa[data-pa=' + pa + ']'); if(!g) return null; var r = g.getBoundingClientRect();
          for(var i = 6; i >= 1; i--) for(var a = 0; a < 12; a++){ var d = (6 - i)/6, x = r.left + r.width/2 + Math.cos(a/12*6.283)*r.width/2*d, y = r.top + r.height/2 + Math.sin(a/12*6.283)*r.height/2*d, el = document.elementFromPoint(x, y);
            if(el && el.closest('.pl-pa') && el.closest('.pl-pa').getAttribute('data-pa') === pa) return [x, y]; }
          return null; }""", pa)
        assert q, f'la partie {pa} de {k} ne se touche pas'
        self.pg.touchscreen.tap(q[0], q[1]); self.pg.wait_for_timeout(120)
    def fermer(self):
        if self.etat()['mode']: self.toucher('#bFermer'); self.pg.wait_for_timeout(120)
    def sans_son(self, sel):
        return self.pg.evaluate("""(sel) => { var r = [];
          [].forEach.call(document.querySelectorAll(sel + ' p, ' + sel + ' figcaption span'), function(p){
            var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
            var lg = p.closest('.lg, figcaption, .code, .ruban-p');
            if(mots > 3 && !(lg && lg.querySelector('.b-son'))) r.push(t.slice(0, 50)); });
          return r; }""", sel)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = page(b, 1180, 820); r = Robot(pg)
    D = pg.evaluate("() => window.PLANTES_DONNEES"); RE = D['RE']
    print('— La scène')
    # (pour l'essai : la tringle porte d'abord le lin, le pied-de-loup et la vesse-de-loup ; les quatre autres attendent)
    pg.evaluate("() => { var S = window.__etabli.etat(); S.dispo = {lin:1, lycopode:1, vesse:1}; S.stock = ['gui', 'oseille', 'souci', 'melisse']; S.posee = null; window.__etabli.redessiner(); }")
    ok(pg.locator('#scene .outil').count() >= 9 and pg.locator('#etagere-plantes .pendue').count() == 3 and pg.locator('#portique [id^=potion-]').count() == 7 and pg.locator('#g-sac').count() == 0,
       f'neuf outils, trois plantes pendues à la tringle de droite (pas une de plus), sept flacons vides sur l\'étagère des potions, plus de sac')
    haut = pg.evaluate("""() => { var R = function(s){ var r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
      return {pot:R('#potion-feu'), cu:R('#cuillere'), li:R('#gLivre > rect[fill=transparent]'), pr:R('#g-presse > rect[fill=transparent]'), tr:R('#etagere-plantes'), se:R('#g-sechoir > rect[fill=transparent]'), pe:R('#pendues'), sc:R('#scene')}; }""")
    ok(haut['pot'][3] <= haut['cu'][1] + 3 and haut['pot'][3] <= haut['li'][1] + 3 and haut['pot'][1] >= haut['sc'][1] + (haut['sc'][3] - haut['sc'][1])*.08,
       f'l\'étagère des potions : juste au-dessus de la cuillère et du grimoire, et loin du haut de l\'écran ({haut["pot"]}, cuillère {haut["cu"][1]}, livre {haut["li"][1]})')
    ok(haut['pe'][0] >= haut['pr'][2] - 2 and haut['pe'][3] <= haut['se'][1] + 6,
       f'l\'étagère des plantes : à droite du pressoir, et les plantes pendent au-dessus de « On laisse sécher » ({haut["tr"]}, pressoir {haut["pr"][2]}, plantes {haut["pe"][3]}, séchoir {haut["se"][1]})')
    ordre = pg.evaluate("() => { var a = document.querySelector('#pendues'), b = document.querySelector('#g-sechoir'); return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }")
    ok(ordre, 'les plantes pendues (et leurs ronds jaunes) sont dessinées avant l\'écriteau « On laisse sécher » : elles passent derrière')
    pied = pg.evaluate("""() => { var p = document.querySelector('#g-buches .pan-feu').getBoundingClientRect(), b = document.querySelector('#g-buches .leve').getBoundingClientRect(), a = document.querySelector('#g-alambic').getBoundingClientRect(); return [Math.round(p.bottom), Math.round(b.top), Math.round(b.right), Math.round(a.left)]; }""")
    ok(pied[0] > pied[1] + 30, f'le panneau du feu a un pied qui descend jusque sur la table, entre les bûches et l\'alambic ({pied})')
    ok(pg.locator('#scene .plante .corps').count() == 0, 'le linge est vide tant qu\'on n\'a rien décroché')
    r.toucher('#pendue-vesse > rect[fill=transparent]'); pg.wait_for_timeout(450)
    ok(pg.locator('#pendue-vesse').count() == 0 and pg.locator('#plante-vesse .corps').count() == 1 and r.etat()['plante'] is None, 'on touche la vesse-de-loup pendue : elle vient sur le linge')
    r.toucher('#pendue-lin > rect[fill=transparent]'); pg.wait_for_timeout(450)
    grand = pg.evaluate("""() => { var c = document.querySelector('#plante-lin .corps').getBoundingClientRect(), l = document.querySelector('#linge').getBoundingClientRect(); return [Math.round(c.width), Math.round(c.height), Math.round(l.width), Math.round(l.height), c.left >= l.left - 2 && c.right <= l.right + 2 && c.top >= l.top - 2 && c.bottom <= l.bottom + 2]; }""")
    ok(pg.locator('#scene .plante .corps').count() == 1 and pg.locator('#pendue-vesse').count() == 1 and pg.locator('#pendue-lin').count() == 0, 'on touche le lin : la vesse-de-loup retourne se pendre, une seule plante sur le linge')
    ok(grand[4] and grand[1] >= grand[3]*.6, f'elle est en grand, et ne dépasse pas du linge ({grand})')
    t = pg.evaluate("() => document.querySelector('#g-buches .pan-feu').textContent + ' | ' + document.querySelector('#g-cruche').textContent + ' | ' + document.querySelector('#g-huilier').textContent")
    ok('feu doux' in t and 'feu fort' in t and 'EAU' in t and 'Huile' in t and 'vide' in t, f'le panneau du feu, « EAU » sur la cruche, « Huile » et « vide » sur la bouteille ({t})')
    pg.screenshot(path=f'{OUT}/01-scene.png')
    print('— Les gestes faux')
    r.outil('planche'); ok(len(r.texte()) > 12 and r.etat()['ou'] is None, f'un outil touché les mains vides : il dit à quoi il sert ({r.texte()[:50]})')
    ok(pg.locator('#calque .bulle-o .b-son').count() == 1, 'la phrase a son 🔊')
    r.plante('lin', 'fleurs'); pg.screenshot(path=f'{OUT}/02-partie.png'); ok(r.etat()['partie'] == 'fleurs', 'le lin : on prend les fleurs bleues (la mauvaise partie)')
    r.outil('tamis'); r.outil('tamis'); ok('fleurs bleues' in r.texte() and r.etat()['partie'] is None, f'la mauvaise partie : la phrase de la plante, et elle revient entière ({r.texte()[:50]})')
    r.plante('lin', 'graines'); r.outil('mortier'); r.outil('mortier'); ok('farine' in r.texte() and r.etat()['n'] == 0 and r.etat()['ou'] == 'mortier', f'le mauvais outil : ce qui se passe pour de vrai, et rien n\'est perdu ({r.texte()[:50]})')
    r.outil('presse'); r.outil('presse'); ok('trier' in r.texte() and r.etat()['n'] == 0, f'le pressoir trop tôt ({r.texte()[:50]})')
    r.outil('huilier'); ok('Vide' in r.texte() and r.etat()['H'] is None, f'l\'huile de lin est vide tant que la potion n\'est pas faite ({r.texte()[:40]})')
    pg.screenshot(path=f'{OUT}/02-faux.png')
    print('— Le feu')
    r.outil('allumettes'); r.outil('marmite'); ok('rien à brûler' in r.texte() and not r.etat()['feux']['marmite']['allume'], f'une allumette sans bûche : pas de feu ({r.texte()[:50]})')
    r.outil('buches'); r.outil('marmite'); ok(r.etat()['feux']['marmite']['b'] == 1 and 'feu doux' in r.texte(), f'une bûche : un feu doux ({r.texte()})')
    r.outil('buches'); r.outil('marmite'); ok(r.etat()['feux']['marmite']['b'] == 2 and 'feu fort' in r.texte(), f'deux bûches : un feu fort ({r.texte()})')
    r.outil('buches'); r.outil('marmite'); ok(r.etat()['feux']['marmite']['b'] == 2 and 'plein' in r.texte(), f'trois : le foyer est plein ({r.texte()})')
    r.toucher('[data-act=foyer][data-o=marmite]'); ok(r.etat()['feux']['marmite']['b'] == 1, f'toucher le foyer éteint : on retire une bûche ({r.texte()})')
    r.toucher('[data-act=foyer][data-o=marmite]'); ok(r.etat()['feux']['marmite']['b'] == 0, 'et encore une : plus de bois')
    r.outil('cruche'); r.outil('marmite'); ok(r.etat()['liq']['marmite'] == 'eau', f'la cruche : de l\'eau dans la marmite ({r.texte()})')
    print('— Les sept potions')
    for pid in ['huile', 'feu', 'fumigene', 'colle', 'acide', 'baume', 'coeur']:
        rc = RE[pid]; k = rc['plante']
        if pid == 'huile':
            # la marmite a gardé son eau : on finit d'abord ce qu'on tient (les graines sont au pressoir)
            pass
        s = r.etat()
        if s['plante'] != k or s['partie'] != rc['partie']: r.plante(k, rc['partie'])
        for i, e in enumerate(rc['etapes']):
            o = e['o']
            if e.get('verse'):
                r.outil('cruche'); r.outil(o)
            else:
                if r.etat()['ou'] != o: r.outil(o)
                if o in ('marmite', 'alambic'):
                    liq = r.etat()['liq'].get(o)
                    if e.get('liq') == 'eau' and liq != 'eau': r.outil('cruche'); r.outil(o)
                    if e.get('liq') == 'huile' and liq != 'huile': r.outil('huilier'); r.outil(o)
                    for _ in range(e.get('feu', 0) - (r.etat()['feux'][o]['b'] or 0)): r.outil('buches'); r.outil(o)
                    if e.get('feu', 0) and not r.etat()['feux'][o]['allume']: r.outil('allumettes'); r.outil(o)
                if o not in ('filtre', 'sechoir', 'fiole'): r.outil(o)
            pg.wait_for_timeout(60)
            s = r.etat()
            if i < len(rc['etapes']) - 1: ok(s['n'] == i + 1 and s['m'] == e['m'], f'{pid} : étape {i + 1} ({o}) → {e["m"]}   « {r.texte()[:46]} »')
        for _ in range(40):
            if r.etat()['mode'] == 'prete': break
            pg.wait_for_timeout(100)
        s = r.etat(); carte = pg.evaluate("() => { var c = document.querySelector('.carte.prete'); return c ? c.innerText.replace(/\\s+/g, ' ') : ''; }")
        ok(pid in s['faites'] and s['mode'] == 'prete' and "C'est vrai" in carte and r.sans_son('.carte.prete') == [], f'{pid} : la potion est sur l\'étagère, et sa carte « C\'est vrai ! » avec ses 🔊 ({carte[:44]})')
        if pid == 'acide': pg.screenshot(path=f'{OUT}/03-prete.png')
        if pid == 'huile':
            ok('vide' not in pg.evaluate("() => document.querySelector('#g-huilier').textContent"), 'l\'huile est faite : la bouteille n\'est plus « vide »')
            # le grimoire se remplit au fur et à mesure : en maquette tout est cueilli, sept signets
        r.toucher('.carte.prete .b-jaune'); pg.wait_for_timeout(200)
        if pid != 'coeur': ok(r.etat()['mode'] is None, f'{pid} : « Continuer » referme la carte')
    carte = pg.evaluate("() => { var c = document.querySelector('.carte'); return c ? c.innerText.replace(/\\s+/g, ' ') : ''; }")
    ok(r.etat()['mode'] == 'sac' and pg.locator('#sacCode').count() == 1 and pg.locator('.carte .rang .pleine').count() == 7 and 'Pisteur' in carte and r.sans_son('.carte') == [] and pg.locator('.carte [data-donjon]').count() == 0,
       f'la septième potion : la carte du code pour le Pisteur s\'ouvre toute seule, avec ses 🔊 ({carte[:60]})')
    pg.screenshot(path=f'{OUT}/06-code.png')
    r.fermer()
    ok(len(r.etat()['faites']) == 7 and pg.locator('#portique [id^=potion-].pleine').count() == 7 and pg.locator('#scene .pendue').count() == 0 and pg.locator('#scene .plante .corps').count() == 0,
       'les sept potions sont faites : sept flacons pleins sur l\'étagère, plus une plante sur la tringle ni sur le linge')
    r.toucher('#potion-colle > rect[fill=transparent]'); pg.wait_for_timeout(200)
    ok(r.etat()['mode'] == 'sac' and pg.locator('#sacCode').count() == 1, 'toucher l\'étagère des potions : on revoit le code')
    r.fermer()
    pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/04-sept.png')
    print('— Le grimoire')
    r.toucher('#gLivre > rect[fill=transparent]'); pg.wait_for_timeout(200)
    bon = r.etat()['mode'] == 'livre'
    for pid in D['ORDRE']:
        pg.locator(f'.livre .signet[data-page={pid}]').click(force=True); pg.wait_for_timeout(120)
        rc = RE[pid]; t = pg.evaluate("() => document.querySelector('#pagesLivre').innerText.replace(/\\s+/g, ' ')")
        muets = r.sans_son('#pagesLivre'); images = pg.locator('#pagesLivre .page.d svg').count()
        if muets or rc['recette'][0][:18] not in t or "C'est vrai" not in t or pg.locator('#pagesLivre .planche-b svg').count() != 1 or images != 1 or rc['sert'][:20] in t or 'donjon' in t.lower() or 'monstre' in t.lower():
            bon = False; print('     page', pid, muets, images, t[:80])
    ok(bon, 'le grimoire : sept pages (la plante dessinée, où elle pousse, la partie, la recette en phrases, « C\'est vrai ! »), chaque texte avec son 🔊 ; rien sur ce à quoi sert la potion, pas un mot du donjon')
    pg.screenshot(path=f'{OUT}/05-grimoire.png')
    r.fermer()
    pg.close()

    print('— Glisser-déposer')
    pg = page(b, 1180, 820); r = Robot(pg)
    def glisser(de, vers):
        a = pg.evaluate("(s) => { var q = document.querySelector(s).getBoundingClientRect(); return [q.left + q.width/2, q.top + q.height/2]; }", de)
        z = pg.evaluate("(s) => { var q = document.querySelector(s).getBoundingClientRect(); return [q.left + q.width/2, q.top + q.height/2]; }", vers)
        pg.mouse.move(a[0], a[1]); pg.mouse.down(); pg.mouse.move((a[0] + z[0])/2, (a[1] + z[1])/2, steps=6); pg.mouse.move(z[0], z[1], steps=6)
        fant = pg.locator('#vol > g').count(); pg.mouse.up(); pg.wait_for_timeout(120); r.libre(); return fant
    f1 = glisser('#g-buches > rect[fill=transparent]', '[data-act=foyer][data-o=marmite]')
    ok(f1 == 1 and r.etat()['feux']['marmite']['b'] == 1 and r.etat()['H'] is None, f'on glisse une bûche jusque sous la marmite : elle y est ({r.texte()})')
    glisser('#g-buches > rect[fill=transparent]', '#g-alambic > rect[fill=transparent]')
    glisser('#g-buches > rect[fill=transparent]', '#g-alambic > rect[fill=transparent]')
    ok(r.etat()['feux']['alambic']['b'] == 2, f'deux bûches glissées dans l\'alambic : feu fort ({r.texte()})')
    glisser('#g-cruche > rect[fill=transparent]', '#g-marmite > rect[fill=transparent]')
    ok(r.etat()['liq']['marmite'] == 'eau', f'on glisse la cruche sur la marmite : de l\'eau dedans ({r.texte()})')
    glisser('#g-cruche > rect[fill=transparent]', '#linge')
    ok(r.etat()['liq']['alambic'] is None and r.etat()['H'] is None, 'lâchée à côté : rien ne se passe, elle retourne à sa place')
    glisser('#g-huilier > rect[fill=transparent]', '#g-marmite > rect[fill=transparent]')
    ok('Vide' in r.texte() and r.etat()['liq']['marmite'] == 'eau', f'la bouteille d\'huile vide ne se glisse pas : elle le dit ({r.texte()[:40]})')
    r.outil('buches'); r.outil('marmite')
    ok(r.etat()['feux']['marmite']['b'] == 2, 'et toucher puis toucher marche toujours : une deuxième bûche sous la marmite')
    pg.close()

    print('— Les 5 formes × 8 couleurs, les 5 murs × 8 couleurs')
    pg = page(b, 1180, 820)
    n = pg.evaluate("""() => { var n = 0, b = ['stPaF', 'stPaT', 'stMurF', 'stMurT'].map(function(i){ return document.getElementById(i); }), vus = {};
      if(b.some(function(x){ return !x; })) return -1;
      for(var f = 0; f < 5; f++){
        for(var t = 0; t < 8; t++){
          var st = window.__etabli.style; vus[st.paF + '-' + st.paT] = 1;
          if(document.querySelectorAll('#scene .outil').length >= 9 && document.querySelectorAll('#scene .pendue').length === 3) n++;
          b[1].click(); b[3].click(); }
        b[0].click(); b[2].click(); }
      return Object.keys(vus).length === 40 ? n : -Object.keys(vus).length; }""")
    ok(n == 40 and not erreurs, f'les 40 établis (5 formes × 8 couleurs) se dessinent, sans erreur ({n})')
    pg.screenshot(path=f'{OUT}/07-autre-style.png')
    pg.close()

    print('— Le grimoire se remplit au fur et à mesure')
    pg = page(b, 1180, 820); r = Robot(pg)
    pg.evaluate("() => { var S = window.__etabli.etat(); Object.keys(S.dispo).forEach(function(k){ S.dispo[k] = 0; }); S.trouvees = {}; S.stock = []; }")
    r.toucher('#gLivre > rect[fill=transparent]'); pg.wait_for_timeout(200)
    t = pg.evaluate("() => document.querySelector('#pagesLivre').innerText.replace(/\\s+/g, ' ')")
    ok(pg.locator('.livre .signet').count() == 0 and 'attend tes cueillettes' in t and r.sans_son('#pagesLivre') == [], f'aucune plante trouvée : le grimoire est vide, et le dit ({t[:50]})')
    r.fermer()
    pg.evaluate("() => { var S = window.__etabli.etat(); S.dispo.lin = 1; S.dispo.gui = 1; }")
    r.toucher('#gLivre > rect[fill=transparent]'); pg.wait_for_timeout(200)
    noms = pg.evaluate("() => [].map.call(document.querySelectorAll('.livre .signet'), function(b){ return b.dataset.page; }).join(',')")
    ok(noms == 'huile,colle', f'deux plantes trouvées (le lin, le gui) : deux pages, deux signets ({noms})')
    r.fermer(); pg.close()

    print('— Un téléphone couché (780 × 360)')
    pg = page(b, 780, 360); r = Robot(pg)
    bad = pg.evaluate("""() => { var W = innerWidth, H = innerHeight, bad = [];
      [].forEach.call(document.querySelectorAll('#scene .outil > rect[fill=transparent], #scene .pendue > rect[fill=transparent], #scene .potion > rect[fill=transparent], #scene .porte > rect[fill=transparent], #gLivre > rect[fill=transparent]'), function(e){
        var q = e.getBoundingClientRect(), id = (e.closest('[id]') || e).id;
        if(q.left < -1 || q.top < -1 || q.right > W + 1 || q.bottom > H + 1) bad.push(id + ' dépasse');
        else if(q.width < 24 || q.height < 24) bad.push(id + ' trop petit ' + Math.round(q.width) + '×' + Math.round(q.height)); });
      return bad; }""")
    ok(bad == [], f'tout tient dans l\'écran et tout se touche ({bad[:4]})')
    r.plante('melisse', 'feuilles'); r.outil('planche'); r.outil('planche')
    ok(r.etat()['n'] == 1 and len(r.texte()) > 10, f'on y joue : la mélisse hachée ({r.texte()[:50]})')
    q = pg.evaluate("() => { var b = document.querySelector('#calque .bulle-o'); if(!b) return null; var r = b.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, innerWidth, innerHeight]; }")
    ok(q and q[0] >= -1 and q[1] >= -1 and q[2] <= q[4] + 1 and q[3] <= q[5] + 1, f'la bulle ne sort pas de l\'écran ({[round(x) for x in q] if q else None})')
    pg.screenshot(path=f'{OUT}/08-telephone.png')
    r.toucher('#gLivre > rect[fill=transparent]'); pg.wait_for_timeout(250)
    q = pg.evaluate("() => { var b = document.querySelector('.livre'); if(!b) return null; var r = b.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, innerWidth, innerHeight]; }")
    ok(q and q[0] >= -1 and q[1] >= -1 and q[2] <= q[4] + 1 and q[3] <= q[5] + 1, f'le grimoire tient dans l\'écran ({[round(x) for x in q] if q else None})')
    pg.screenshot(path=f'{OUT}/09-telephone-livre.png')
    pg.close()
    b.close()

print('\n'.join(erreurs) or 'aucune erreur de console')
print('ÉCHECS :', echecs if echecs else 'aucun')
sys.exit(1 if echecs or erreurs else 0)
