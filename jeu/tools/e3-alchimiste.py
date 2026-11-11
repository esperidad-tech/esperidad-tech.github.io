"""Enquête 3, étape 4 (Bible § 13.14) : l'Alchimiste, du matin à la nuit (Playwright).
Le matin : ses missions, l'établi dans l'atelier, le gâteau de la fête chez Gaspard, les quatre cueillettes ordinaires ; sans l'herbier,
rien à la forêt, à la clairière ni au pommier ; avec le code « L'herbier » : le pied-de-loup, « Suivre la poussière » (le moteur de la
piste, la trace 'poussiere', l'arrivée 'vesses'), le vieux pommier (le code pour le Pisteur), puis le code « Le gui » : sept plantes.
L'établi : l'explication en images et son bouton jaune, une mauvaise partie, un mauvais outil, le baume sans l'huile, puis les sept
potions, geste par geste ; le grimoire (sept pages, chaque texte avec son 🔊) ; le sac.
L'après-midi : la lettre au labo — sans le Livre d'or (« Il te faudrait d'autres écritures… »), puis avec : une mauvaise écriture, celle de
Mélusine, le pollen au microscope, l'eau chaude et l'encre de noix de galle → le code « L'écriture de Mélusine » ; le gâteau au maire.
La nuit : « 🎒 Ton sac ! », le code du sac ; un Pisteur le tape : il reçoit les sept potions (et un sac de trois potions : trois).
Enfin : pas d'établi dans l'atelier d'une enquête 2.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-alchimiste.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-alchimiste'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1; pg.wait_for_timeout(400); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle, garder=False):
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350)
    t = texte(pg)
    if not garder: fermer(pg); pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")
    return t

def lieu(pg, l):
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }")
    ev(pg, 'lieu', {'id': l}); pg.wait_for_timeout(150)
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id; })")

def cueillir(pg, l):
    lieu(pg, l)
    b = pg.locator('#voile [data-act=cueillir]')
    if not b.count(): return None
    t0 = b.first.inner_text(); b.first.click(); pg.wait_for_timeout(250); t = texte(pg); fermer(pg)
    return t0 + ' | ' + t

def debut(b, nom, role, enquete=3, vp=None):
    pg = b.new_context(viewport=vp or {'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click(f'[data-act=mode-test][data-i="{enquete}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')   # (l'enquête 2 n'a pas cette page)
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("""() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; M.lireAuto = function(){};
      var vrai = MJ.lancer;
      MJ.lancer = function(el, type, params, fin, opt){
        var c = {type:type, params:params, fin:fin, fini:false};
        c.h = vrai.call(MJ, el, type, params, function(r){ if(!c.fini){ c.fini = true; fin(r); } }, opt);
        window.__mjCourant = c; return c.h;
      };
      window.__finir = function(ok, plus){ var c = window.__mjCourant; if(!c || c.fini) return; c.fini = true; window.__mjCourant = null;
        try{ c.h && c.h.arreter && c.h.arreter(); }catch(e){}
        c.fin(Object.assign({reussi:!!ok, score:ok ? 100 : 0, essais:1, erreurs:ok ? 0 : 3, detail:''}, plus || {})); };
    }""")
    return pg

def jouer(pg, pid, reussi, capt=None, plus=None):
    pg.locator(f'#voile [data-act=point][data-id={pid}]').first.click(); pg.wait_for_timeout(300)
    verifier(pg.locator('#voile [data-act=mj-go]').count() == 1, f'{pid} : l\'explication avant le mini-jeu et son bouton jaune')
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    if capt: pg.screenshot(path=f'{OUT}/{capt}-intro.png')
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1500)
    if capt: pg.screenshot(path=f'{OUT}/{capt}.png')
    info = pg.evaluate("() => window.__mjCourant ? {type:window.__mjCourant.type, params:window.__mjCourant.params} : null")
    pg.evaluate(f"(plus) => window.__finir({'true' if reussi else 'false'}, plus)", plus); pg.wait_for_timeout(600)
    return info

# ---------- l'établi ----------
def atelier(pg):
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(900)

def signe(pg):
    return pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-et-signe'); return e ? e.textContent : ''; }")

def conteur(pg):
    return pg.evaluate("() => { var e = document.querySelector('#pl-page .pl-conteur p'); return e ? e.textContent : ''; }")

def plante(pg, k):
    pg.click(f'#pl-page [data-pl=plante][data-id={k}]'); pg.wait_for_timeout(120)

def partie(pg, pa):
    pg.evaluate("(pa) => { var g = document.querySelector('#pl-page .pl-planche .pl-pa[data-pa=' + pa + ']'); (g.querySelector('path:not(.pl-z), circle:not(.pl-z), ellipse') || g).dispatchEvent(new MouseEvent('click', {bubbles:true})); }", pa)
    pg.wait_for_timeout(120)

def outil(pg, o, t=160):
    pg.click(f'#pl-page [data-pl=outil][data-id={o}]'); pg.wait_for_timeout(t)

def etat_pl(pg):
    return pg.evaluate("() => { var P = M.P(); return {plantes:P.plantes || {}, fioles:Object.keys(P.vus).filter(function(k){ return k.indexOf('fiole:') === 0; }).map(function(k){ return k.slice(6); })}; }")

def sans_son(pg, sel):
    """les textes de plus de trois mots qui n'ont pas leur bouton 🔊 (dans sel)"""
    return pg.evaluate("""(sel) => { var r = [];
      [].forEach.call(document.querySelectorAll(sel + ' p'), function(p){
        var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
        var a = p.querySelector('.b-lire') || (p.nextElementSibling && p.nextElementSibling.classList.contains('b-lire') ? p.nextElementSibling : null);
        if(mots > 3 && !a) r.push(t.slice(0, 50)); });
      return r; }""", sel)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ======================================================================== le matin
    print('— Le matin : les missions, l\'atelier, le gâteau')
    pg = debut(b, 'Alchi', 'alchimiste')
    R = pg.evaluate("() => window.PLANTES_RECETTES")
    verifier(pg.evaluate("() => M.E().id === 3 && M.etabliDispo() && M.laboDispo()"), 'enquête 3, Alchimiste : l\'établi et le labo sont branchés')
    mi = pg.evaluate("() => M.etapesMission().map(function(m){ return m.t; })")
    verifier(len(mi) >= 4 and 'gâteau' in mi[0] and 'sept' in mi[1] and 'lettre' in mi[2] and 'sept potions' in mi[3], f'ses quatre missions ({len(mi)} lignes au Carnet)')
    atelier(pg)
    verifier(pg.evaluate("() => M.S.atelier.objets.filter(function(o){ return o.t === 'etabli'; }).length") == 1 and pg.locator('#atelier-ici .at-etabli-p').count() == 1, 'l\'établi des plantes est dans l\'atelier')
    verifier(signe(pg) == '', 'pas de signe au-dessus de l\'établi : aucune plante n\'attend')
    shot(pg, 'atelier')
    pts = lieu(pg, 'boulangerie')
    verifier(pts == ['gateau'] and 'Rien à trouver' not in texte(pg), f'la boulangerie : le gâteau de la fête (et pas de « rien à trouver ») ({pts})')
    info = jouer(pg, 'gateau', True, 'gateau', {'gateau': {'etages': 3}})
    verifier(info and info['type'] == 'gateau', 'le gâteau : le mini-jeu « gateau »')
    verifier('Sept étages' in texte(pg) and pg.evaluate("() => M.P().vus['alchimiste:boulangerie:gateau'] === 'ok' && !!M.P().gateau"), 'réussi : « Sept étages en tout ! », et le gâteau est gardé')
    fermer(pg)
    verifier(lieu(pg, 'mairie') == [], 'la mairie, le matin : rien pour l\'Alchimiste (le gâteau se porte l\'après-midi)')
    # ---------- les cueillettes ----------
    print('— Le matin : les cueillettes')
    for l, k, mot in [('lavoir', 'oseille', 'oseille'), ('potager', 'souci', 'souci'), ('herboristerie', 'melisse', 'mélisse'), ('moulin', 'lin', 'lin')]:
        t = cueillir(pg, l)
        verifier(t is not None and 'plantes' in t and mot in t and 'établi' in t and pg.evaluate(f"() => M.plantes().{k}") == 1, f'{l} : on cueille {mot}, « sur l\'établi de ton atelier » ({(t or "")[:70]})')
    lieu(pg, 'lavoir'); verifier('Déjà récolté' in texte(pg), 'le lavoir une deuxième fois ce matin : « Déjà récolté »')
    lieu(pg, 'foret'); verifier('Rien à trouver' in texte(pg) and pg.locator('#voile [data-act=cueillir]').count() == 0, 'sans l\'herbier, la forêt : « Rien à trouver »')
    verifier(lieu(pg, 'clairiere') == [] and 'Rien à trouver' in texte(pg), 'sans l\'herbier, la clairière : rien')
    verifier(lieu(pg, 'potager') == [], 'sans l\'herbier, le potager : pas de vieux pommier')
    atelier(pg)
    verifier(signe(pg) == '🌿 4 à préparer !', f'le signe au-dessus de l\'établi : « 🌿 4 à préparer ! » ({signe(pg)})')
    t = code(pg, 'info:herbier')
    verifier('herbier' in t.lower(), 'le code « L\'herbier » du Sage')
    t = cueillir(pg, 'foret')
    verifier(t is not None and 'pied-de-loup' in t and pg.evaluate("() => M.plantes().lycopode") == 1, 'avec l\'herbier, la forêt : le pied-de-loup')
    pts = lieu(pg, 'clairiere')
    verifier(pts == ['vesses'], f'la clairière : la poussière des vesses-de-loup ({pts})')
    info = jouer(pg, 'vesses', True, 'poussiere')
    verifier(info and info['type'] == 'traces' and info['params'].get('suspect') == 'poussiere' and info['params'].get('arrivee') == 'vesses', 'Suivre la poussière : le moteur de la piste, la trace « poussiere », l\'arrivée « vesses »')
    verifier('rond de boules blanches' in texte(pg) and pg.evaluate("() => M.plantes().vesse") == 1, 'réussi : le rond des vesses-de-loup, une vesse sur l\'établi')
    fermer(pg)
    pts = lieu(pg, 'potager')
    verifier(pts == ['pommier'], f'le potager : le vieux pommier ({pts})')
    pg.locator('#voile [data-act=point][data-id=pommier]').click(); pg.wait_for_timeout(250)
    verifier('trop haut' in texte(pg) and pg.evaluate("() => !!M.P().objets['_info:gui_pommier']") and pg.locator('#voile .b-donne').count() == 1, 'le gui est trop haut : le code « Le gui du pommier » pour le Pisteur')
    fermer(pg)
    t = code(pg, 'info:gui')
    verifier('établi' in t and pg.evaluate("() => M.plantes().gui") == 1, 'le code « Le gui » du Pisteur : le gui arrive sur l\'établi')
    verifier(pg.evaluate("() => ['oseille','souci','melisse','lin','lycopode','vesse','gui'].every(function(k){ return !!M.P().vus['plante:' + k]; })"), 'les sept plantes sont cueillies')
    # ======================================================================== l'établi
    print('— L\'établi des plantes')
    atelier(pg)
    verifier(signe(pg) == '🌿 7 à préparer !', f'le signe : « 🌿 7 à préparer ! » ({signe(pg)})')
    shot(pg, 'atelier-signe')
    # (au doigt : l'établi, ses trois bulles, la jaune)
    pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-et-signe'); e.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); e.dispatchEvent(new PointerEvent('pointerup', {bubbles:true})); e.click(); }"); pg.wait_for_timeout(700)
    bulles = pg.locator('#atelier-ici .at-bulle-pa')
    if bulles.count() == 0:
        pg.locator('#atelier-ici .at-et-signe').click(force=True); pg.wait_for_timeout(700); bulles = pg.locator('#atelier-ici .at-bulle-pa')
    verifier(bulles.count() == 3 and 'Préparer' in bulles.first.inner_text(), f'toucher le signe : les trois bulles de l\'établi, la jaune « 🌿 Préparer » ({bulles.count()})')
    shot(pg, 'bulles')
    if bulles.count(): bulles.first.click(force=True); pg.wait_for_timeout(600)
    if not pg.locator('#pl-page').count(): pg.evaluate("() => M.ouvrirEtabli()"); pg.wait_for_timeout(400); echecs.append('la bulle jaune n\'a pas ouvert l\'établi')
    verifier(pg.locator('#pl-page .pl-intro .b-aller').count() == 1 and pg.locator('#pl-page .pl-intro .b-lire').count() == 1 and pg.locator('#pl-page .pl-intro-img svg').count() >= 3,
             'la première fois : l\'explication en images, son 🔊 et son bouton jaune')
    shot(pg, 'etabli-intro')
    pg.click('#pl-page [data-pl=fermer-voile]'); pg.wait_for_timeout(250)
    verifier(pg.locator('#pl-page .pl-chip:not(.pl-vide)').count() == 7 and pg.locator('#pl-page .pl-outil').count() == 11 and pg.locator('#pl-page .pl-etagere .pl-fiole').count() == 7,
             'la page : sept plantes au panier, onze outils, sept fioles vides sur l\'étagère')
    verifier(pg.locator('#pl-page .pl-conteur .b-lire').count() == 1 and len(conteur(pg)) > 20, f'le conteur et son 🔊 ({conteur(pg)[:50]})')
    pg.click('#pl-page .pl-conteur .b-lire'); verifier(pg.evaluate("() => window.__lus.length") == 1, 'le 🔊 lit la phrase (jamais de lecture toute seule)')
    shot(pg, 'etabli')
    # ---------- on se trompe ----------
    outil(pg, 'couteau'); verifier('mains vides' in conteur(pg), f'un outil sans rien en main : « Tu as les mains vides ! » ({conteur(pg)[:40]})')
    plante(pg, 'lin'); partie(pg, 'tiges'); verifier('Tu tiens les tiges' in conteur(pg), f'on prend les tiges du lin ({conteur(pg)})')
    outil(pg, 'presse', 300)
    verifier('pour faire du fil' in conteur(pg) and 'Rien n\'est perdu' in conteur(pg) and pg.evaluate("() => M.plantes().lin") == 1, f'la mauvaise partie : une phrase drôle, et rien n\'est perdu ({conteur(pg)[:60]})')
    shot(pg, 'faux-partie')
    plante(pg, 'oseille'); partie(pg, 'feuilles'); outil(pg, 'mortier', 300)
    verifier('purée verte' in conteur(pg), f'le mauvais outil : sa phrase à lui ({conteur(pg)[:50]})')
    plante(pg, 'souci'); partie(pg, 'fleurs'); outil(pg, 'couteau'); outil(pg, 'marmite', 300)
    verifier('huile de lin' in conteur(pg) and 'Rien n\'est perdu' not in conteur(pg), f'le baume sans l\'huile : la marmite est sèche ({conteur(pg)[:60]})')
    outil(pg, 'feu', 300); verifier(etat_pl(pg)['fioles'] == [], 'et rien n\'est fait')
    # ---------- les sept potions, geste par geste (l'huile avant le baume) ----------
    for pid in ['huile', 'feu', 'fumigene', 'colle', 'acide', 'baume', 'coeur']:
        r = R['RE'][pid]
        plante(pg, r['plante']); partie(pg, r['partie'])
        for i, g in enumerate(r['gestes']):
            outil(pg, g['o'], 420 if i == len(r['gestes']) - 1 else 160)
            if i == 1 and pid == 'acide': shot(pg, 'acide-marmite')
        if pid == 'huile': shot(pg, 'huile-bravo')
        e = etat_pl(pg)
        verifier(pid in e['fioles'] and e['plantes'].get(r['plante']) == 0 and r['gestes'][-1]['t'][:20] in conteur(pg), f'{r["nom"]} : {len(r["gestes"])} gestes, la fiole est sur l\'étagère')
        pg.wait_for_timeout(2400)
    verifier(pg.locator('#pl-page .pl-etagere .pl-fiole.pl-pleine').count() == 7 and 'ton sac est prêt' in conteur(pg), 'les sept fioles sont pleines : « ton sac est prêt pour la nuit ! »')
    shot(pg, 'sept-potions')
    plante(pg, 'gui'); partie(pg, 'baies'); verifier('déjà dans sa fiole' in conteur(pg), 'une potion déjà faite ne se refait pas')
    # ---------- le grimoire ----------
    pg.click('#pl-page [data-pl=grimoire]'); pg.wait_for_timeout(300)
    ok = True
    for pid in R['ORDRE']:
        pg.click(f'#pl-page [data-pl=page][data-id={pid}]'); pg.wait_for_timeout(120)
        r = R['RE'][pid]
        ng = pg.locator('#pl-page .pl-page .pl-geste').count(); muets = sans_son(pg, '#pl-page .pl-page')
        if ng != len(r['gestes']) or muets or r['dit'] not in texte(pg, '#pl-page .pl-page') or pg.locator('#pl-page .pl-page-plante svg').count() != 1:
            ok = False; print('     page', pid, ng, muets)
    verifier(ok, 'le grimoire : sept pages (la plante, la partie en mots, les gestes en images), chaque texte avec son 🔊')
    shot(pg, 'grimoire')
    pg.click('#pl-page [data-pl=fermer-voile]')
    pg.click('#pl-page [data-pl=sac]'); pg.wait_for_timeout(250)
    verifier('Sept fioles' in texte(pg, '#pl-page .pl-carte') and pg.locator('#pl-page .pl-sac-code').count() == 0 and 'Cette nuit' in texte(pg, '#pl-page .pl-carte'), 'le sac, le jour : les sept fioles, pas encore de code')
    pg.click('#pl-page [data-pl=fermer-voile]'); pg.click('#pl-page [data-pl=fermer]'); pg.wait_for_timeout(700)
    verifier(pg.locator('#pl-page').count() == 0 and signe(pg) == '', 'retour à l\'atelier : plus de signe au-dessus de l\'établi')
    notes = pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).join(' | ')")
    verifier('Les sept potions de la nuit sont prêtes' in notes and 'acide' in notes, 'au Carnet : les potions prêtes')
    # ======================================================================== l'après-midi : la lettre au labo
    print('— L\'après-midi : la lettre au labo')
    code(pg, 'moment:1')
    verifier(pg.evaluate("() => M.momentId()") == 'apresmidi', 'l\'après-midi')
    t = code(pg, 'obj:lettre')
    verifier('lettre' in t.lower(), 'le code « La lettre d\'Odette »')
    F = {}
    def ouvrir():
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); M.ouvrirLabo(); }"); pg.wait_for_timeout(1800)
        f = next((x for x in pg.frames if x.parent_frame is not None), None)
        f.wait_for_function('() => !!window.__labo', timeout=8000); f.evaluate("() => { window.__labo.mimi.calme = true; }")
        f.evaluate("() => { var g = document.querySelector('.intro-go'); if(g) g.click(); }"); pg.wait_for_timeout(300)
        F['f'] = f; return f
    etat = lambda: F['f'].evaluate("() => { var S = window.__labo.etat(), d = S.dos[S.dc] || {coupes:[]}; return {mode:S.mode, sel:S.sel, dc:S.dc, tiroir:S.tiroir, trouves:S.trouves, finis:S.finis, barres:S.barres, coupes:d.coupes.map(function(c){ return c && c.t; })}; }")
    def clic(sel):
        F['f'].wait_for_function('() => !window.__labo.etat().occupe', timeout=9000)
        F['f'].click(sel, force=True)
    def bulle():
        return F['f'].evaluate("() => { var b = document.querySelector('.bulle-o'); return b ? b.textContent : ''; }")
    def viser(g):
        F['f'].evaluate("g => { var S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }", g)
        bx = F['f'].locator('#lentille').bounding_box(); S = F['f'].evaluate("() => ({cx:window.__labo.etat().cx, cy:window.__labo.etat().cy})"); k = max(1, bx['width']/560)
        pg.mouse.click(bx['x'] + bx['width']/2 + (g['x'] - S['cx'])*k, bx['y'] + bx['height']/2 + (g['y'] - S['cy'])*k)
    def prendre(z):
        for g in F['f'].evaluate("z => { var S = window.__labo.etat(); return S.dos[S.dc].items[z].filter(function(i){ return !i.pris && !(i.min > z); }).map(function(i){ return {x:i.x, y:i.y}; }); }", z):
            viser(g); pg.wait_for_timeout(950)
    def coupe(t):
        c = etat()['coupes']; clic('#coupe' + str(c.index(t))); pg.wait_for_timeout(400)
    f = ouvrir()
    verifier(f.evaluate("() => window.__labo.cuirs()") == ['lettre'] and f.locator('#gLivreDor').count() == 0, 'la lettre est sur le cuir ; pas de Livre d\'or sur la paillasse')
    shot(pg, 'labo-lettre')
    clic('#ech-lettre'); pg.wait_for_timeout(400); clic('#gLoupe'); pg.wait_for_timeout(1900)
    verifier('autres écritures' in bulle() and f.evaluate("() => document.querySelector('#bLivreDor').hidden"), f'à la loupe, sans le Livre d\'or : « Il te faudrait d\'autres écritures pour comparer… » ({bulle()[:40]})')
    shot(pg, 'loupe-sans-livre')
    clic('#tir-g .facade'); pg.wait_for_timeout(600)
    verifier(etat()['tiroir'] is None, 'les tiroirs ne s\'ouvrent pas pour une écriture')
    clic('#bFermer'); pg.wait_for_timeout(900)
    f.evaluate("() => window.__labo.quitter()"); pg.wait_for_timeout(600)
    t = code(pg, 'info:ecritures')
    verifier('Livre d\'or' in t, 'le code « Les écritures du village » du Sage')
    f = ouvrir()
    verifier(f.locator('#gLivreDor').count() == 1, 'le Livre d\'or est posé sur la paillasse')
    clic('#ech-lettre'); pg.wait_for_timeout(400); clic('#gLoupe'); pg.wait_for_timeout(1900)
    verifier(not f.evaluate("() => document.querySelector('#bLivreDor').hidden"), 'sous le verre : le bouton jaune « 📖 Le Livre d\'or »')
    shot(pg, 'loupe-lettre')
    clic('#bLivreDor'); pg.wait_for_timeout(900)
    verifier(f.locator('[data-ech^="ecritures:"]').count() == 12, 'le Livre d\'or s\'ouvre : douze écritures')
    shot(pg, 'livre-dor')
    clic('[data-ech="ecritures:victor"]'); pg.wait_for_timeout(1300); shot(pg, 'compare-victor'); pg.wait_for_timeout(1800)
    verifier(etat()['barres'].get('lettre', {}).get('ecritures:victor') and not etat()['trouves'].get('lettre'), 'Victor (deux signes sur trois) : ce n\'est pas lui, il est barré')
    clic('[data-ech="ecritures:melusine"]'); pg.wait_for_timeout(2600)
    verifier(etat()['trouves'].get('lettre') and 'Mélusine' in f.evaluate("() => document.querySelector('#ruban').textContent"), 'Mélusine : les trois signes, c\'est son écriture')
    shot(pg, 'melusine'); pg.wait_for_timeout(2200)
    clic('#bFermer'); pg.wait_for_timeout(900)
    # le microscope : les deux grains de pollen, à ×40
    clic('#ech-lettre'); pg.wait_for_timeout(400); clic('#gMicro'); pg.wait_for_timeout(1300); shot(pg, 'micro-x10'); prendre(10)
    clic('.num[data-zoom="40"]'); pg.wait_for_timeout(900); prendre(40); shot(pg, 'micro-x40')
    clic('#bFermer'); pg.wait_for_timeout(900)
    verifier('pollen_l' in etat()['coupes'], f'au microscope (×40) : les grains jaunes dans une coupelle ({etat()["coupes"]})')
    coupe('pollen_l'); pg.wait_for_timeout(300); clic('#gLoupe'); pg.wait_for_timeout(1900)
    clic('#tir-d .facade'); pg.wait_for_timeout(1300); clic('#tir-d [data-casier="grains"]'); pg.wait_for_timeout(700); clic('[data-ech="grains:pollenlav"]'); pg.wait_for_timeout(2400)
    clic('#bFermer'); pg.wait_for_timeout(900)
    verifier(etat()['trouves'].get('pollen_l'), 'le grain jaune : du pollen de lavande (les tiroirs marchent toujours pour lui)')
    # l'eau chaude : un peu d'encre
    clic('#ech-lettre'); pg.wait_for_timeout(300); clic('[data-act="goutte"][data-k="chaude"]'); pg.wait_for_timeout(1500); tb = bulle(); pg.wait_for_timeout(2200)
    verifier('eau noircie' in tb and 'encre_l' in etat()['coupes'], f'l\'eau chaude fait couler un peu d\'encre ({tb[:40]})')
    coupe('encre_l'); pg.wait_for_timeout(300); clic('#gTest'); pg.wait_for_timeout(3800)
    verifier(f.locator('[data-temoin]').count() == 10 and f.locator('[data-temoin="galle"]').count() == 1, 'le carnet de teintures a une page de plus : la noix de galle')
    clic('[data-temoin="galle"]'); pg.wait_for_timeout(2600); shot(pg, 'test-galle'); clic('#bFermer'); pg.wait_for_timeout(900)
    verifier(etat()['trouves'].get('encre_l') and etat()['finis'].get('lettre'), 'l\'encre de noix de galle : l\'analyse de la lettre est bouclée')
    shot(pg, 'labo-fini')
    f.evaluate("() => window.__labo.quitter()"); pg.wait_for_timeout(800)
    t = texte(pg)
    verifier('MÉLUSINE' in t and pg.locator('#voile .b-donne, #voile .b-code').count() >= 1 and pg.evaluate("() => !!M.P().analyses.lettre"), 'en sortant : la découverte, et le code « L\'écriture de Mélusine »')
    shot(pg, 'decouverte-ecriture')
    fermer(pg)
    notes = pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).join(' | ')")
    verifier('lavande' in notes and 'colporteurs' in notes and 'Mélusine' in notes, 'au Carnet : le pollen de lavande, l\'encre de colporteur, l\'écriture de Mélusine')
    pts = lieu(pg, 'mairie')
    verifier(pts == ['gateau'], f'la mairie, l\'après-midi : porter le gâteau au maire ({pts})')
    or0 = pg.evaluate("() => M.S.or")
    pg.locator('#voile [data-act=point][data-id=gateau]').click(); pg.wait_for_timeout(250)
    verifier('minuit pile' in texte(pg) and pg.evaluate("() => M.S.or") == or0 + 5, 'le maire : « On le coupera à minuit pile », et cinq pièces d\'or')
    fermer(pg)
    fait = pg.evaluate("() => { M.majMission(); return Object.keys(M.P().mission.faits).length; }")
    verifier(fait == 4, f'ses quatre missions sont validées ({fait})')
    # ======================================================================== la nuit : le sac
    print('— La nuit : le sac')
    code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    atelier(pg)
    verifier(signe(pg) == '🎒 Ton sac !', f'au-dessus de l\'établi : « 🎒 Ton sac ! » ({signe(pg)})')
    shot(pg, 'nuit-signe')
    pg.evaluate("() => M.ouvrirEtabli()"); pg.wait_for_timeout(400)
    verifier(pg.locator('#pl-page [data-pl=sac].pl-appel').count() == 1, 'sur l\'établi, le bouton « 🎒 Ton sac » sautille')
    pg.click('#pl-page [data-pl=sac]', force=True); pg.wait_for_timeout(250)
    verifier(pg.locator('#pl-page .pl-sac-code').count() == 1 and 'Pisteur' in texte(pg, '#pl-page .pl-carte') and not sans_son(pg, '#pl-page .pl-carte'), 'le sac, la nuit : le code pour le Pisteur, et le 🔊')
    shot(pg, 'sac')
    seq7 = pg.evaluate("() => M.code('sac:' + M.sacBits())"); bits = pg.evaluate("() => M.sacBits()")
    verifier(bits == 127 and len(seq7) == 3, f'sept potions : le sac n° 127 ({seq7})')
    pg.click('#pl-page [data-pl=fermer-voile]'); pg.click('#pl-page [data-pl=fermer]'); pg.wait_for_timeout(500)
    verifier(signe(pg) == '', 'le code est montré : le signe s\'en va')
    t = code(pg, 'sac:127')
    verifier('Pisteur' in t or 'équipier' in t, f'l\'Alchimiste ne peut pas taper son propre code de sac ({t[:50]})')
    verifier(pg.evaluate("() => { var c = M.codesEnquete(M.E()), vus = {}, n = 0; Object.keys(c.parId).forEach(function(id){ var k = c.parId[id].join('-'); if(vus[k]) n++; vus[k] = 1; }); return n; }") == 0, 'aucun code de l\'enquête 3 n\'est en double (les 128 codes du sac compris)')
    # ---------- le Pisteur tape le code ----------
    pp = debut(b, 'Pisteur', 'pisteur')
    code(pp, 'moment:1'); code(pp, 'moment:2')
    seq = pp.evaluate("() => M.code('sac:127')")
    verifier(seq == seq7, 'les deux tablettes ont le même code pour le même sac')
    t = code(pp, 'sac:127', True)
    verifier('sac de l\'Alchimiste' in t and '7 potions' in t and pp.locator('#voile .pl-fiole.pl-pleine').count() == 7 and pp.evaluate("() => (M.sacPotions() || []).join(',')") == 'feu,fumigene,huile,colle,acide,baume,coeur',
             f'le Pisteur tape le code : il reçoit le sac, sept potions ({t[:60]})')
    pp.screenshot(path=f'{OUT}/pisteur-sac.png'); fermer(pp)
    t = code(pp, 'sac:21', True)   # (feu + huile + acide : 1 + 4 + 16)
    verifier('3 potions' in t and pp.evaluate("() => (M.sacPotions() || []).join(',')") == 'feu,huile,acide', f'un sac de trois potions : feu, huile, acide ({t[:60]})')
    fermer(pp)
    pp.close()
    # ---------- téléphone couché : l'établi tient dans l'écran ----------
    pg.set_viewport_size({'width': 780, 'height': 360}); pg.wait_for_timeout(300)
    pg.evaluate("() => M.ouvrirEtabli()"); pg.wait_for_timeout(400)
    debord = pg.evaluate("() => { var r = document.querySelector('#pl-page').getBoundingClientRect(), bad = []; [].forEach.call(document.querySelectorAll('#pl-page .pl-outil, #pl-page .pl-conteur, #pl-page .pl-chip, #pl-page .pl-planche'), function(e){ var q = e.getBoundingClientRect(); if(q.bottom > r.bottom + 1 || q.right > r.right + 1 || q.width < 24 || q.height < 24) bad.push(e.className); }); return bad; }")
    verifier(debord == [], f'sur un téléphone couché (780 × 360), rien ne dépasse et tout se touche ({debord[:3]})')
    shot(pg, 'telephone')
    pg.close()
    # ======================================================================== pas d'établi ailleurs
    print('— Ailleurs : pas d\'établi')
    p2 = debut(b, 'Alchi2', 'alchimiste', 2)
    atelier(p2)
    verifier(p2.evaluate("() => M.S.atelier.objets.filter(function(o){ return o.t === 'etabli'; }).length") == 0 and p2.locator('#atelier-ici .at-etabli-p').count() == 0 and not p2.evaluate("() => M.etabliDispo()"),
             'enquête 2 : pas d\'établi des plantes dans l\'atelier')
    p2.close()
    b.close()

print()
if erreurs: print('ERREURS DE PAGE :'); [print('  ', e) for e in erreurs[:12]]
if echecs: print(f'{len(echecs)} ÉCHEC(S) :'); [print('  ✗', e) for e in echecs]
else: print('Tout est bon.')
sys.exit(1 if (echecs or erreurs) else 0)
