"""Enquête 3 : LE SECRET D'ODETTE (16 novembre ; Bible §13.57 ; REFAIT LE 19 NOVEMBRE, Bible §13.75) — Playwright.
Le voisin donne le papier d'Odette au Barde (un code objet pour le Sage). Le Sage : la page n'existe pas sans le code ; l'alphabet secret ;
au dos, le plan de la maison ; la poche et la pierre de Tim, QUI SE PROMÈNE sur le papier (de vrais touchers, de vrais glisser, le doigt
posé sur le papier) : près du soleil, les mots « soleil de l'après-midi » ; près des dalles, elles s'éclairent ; AUCUN signe, aucun
numéro, aucun ordre ; « Les objets magiques » ; le tableau d'Odette à revoir. Le Pisteur : la maison d'Odette le matin (dans l'ombre,
AUCUNE aide, des dalles sans signe qu'on peut enfoncer ; on ressort sans fenêtre « Raté »), l'après-midi (le soleil allume trois dalles,
l'une après l'autre : au bout de 3 s, puis 4, puis 5 ; un mauvais ordre, elles se rallument ; le bon ordre ; le code du vieux plan ; le
paquet de la garde-robe) ; et le coup de chance du matin. Le Sage : le vieux plan, qui attend une autre pierre. Tablette et téléphone.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-secret.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-secret'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
TEL = {'width': 390, 'height': 844}
TAB = {'width': 1180, 'height': 820}

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def shot(pg, nom):
    pg.wait_for_timeout(350); pg.screenshot(path=f'{OUT}/{nom}.png')

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle):
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350); t = texte(pg); fermer(pg); pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")
    return t

def moment_suivant(pg, role):
    if role == 'sage':
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
    else:
        m = pg.evaluate("() => M.P().moment + 1")
        code(pg, 'moment:' + str(m))

def page(pg, pid):
    pg.evaluate(f"() => {{ M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('{pid}', true); }}"); pg.wait_for_timeout(300)
    return texte(pg, '#livre-ici .lv-page.on')

def pages(pg):
    return pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); return [].map.call(document.querySelectorAll('#livre-ici .lv-page'), function(x){ return x.dataset.id || ''; }); }")

def debut(b, role, vue, joueur='adulte'):
    pg = b.new_context(viewport=vue, has_touch=vue is TEL, device_scale_factor=2 if vue is TEL else 1).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]')
    pg.evaluate(f"() => {{ M.S.heros.joueur = '{joueur}'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }}")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(600)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      var vrai = MJ.lancer;
      MJ.lancer = function(el, type, params, fin, opt){
        var c = {type:type, params:params, fin:fin, fini:false, opt:opt};
        c.h = vrai.call(MJ, el, type, params, function(r){ if(!c.fini){ c.fini = true; window.__mjCourant = null; fin(r); } }, opt);
        window.__mjCourant = c; return c.h;
      };
      window.__finir = function(ok){ var c = window.__mjCourant; if(!c || c.fini) return; c.fini = true; window.__mjCourant = null;
        try{ c.h.arreter(); }catch(e){}
        c.fin({reussi:ok, score:ok ? 1 : 0, essais:1, erreurs:0, detail:''}); }; }""")
    return pg

def centre(pg, sel):
    r = pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); if(!e) return null; e.scrollIntoView({{block:'center'}}); var r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }}")
    pg.wait_for_timeout(120)
    r = pg.evaluate(f"() => {{ var r = document.querySelector('{sel}').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }}")
    return r

def toucher_plan(pg, pid, fx, fy):
    """Un vrai toucher sur le plan, à la fraction (fx, fy) du dessin."""
    r = centre(pg, f'.pp[data-pp={pid}] .pp-plan')
    pg.mouse.click(r[0] + r[2] * fx, r[1] + r[3] * fy); pg.wait_for_timeout(300)

def etat_pp(pg, pid):
    return pg.evaluate(f"() => {{ var e = document.querySelector('.pp[data-pp={pid}]'); return {{classe:e ? e.className : '', dit:e ? e.querySelector('.pp-dit').innerText.replace(/\\s+/g, ' ') : '', parle:window.__pp.etat('{pid}').parle, pose:!!(e && e.querySelector('.pp-pose'))}}; }}")

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------------------------------------------------------------- le Barde
    print('— Le Barde : le voisin et le papier d\'Odette')
    pg = debut(b, 'barde', TAB)
    Q = pg.evaluate("() => M.E().pnj.levoisin.questions.map(function(q){ return q.q; })")
    verifier(len(Q) == 5 and 'laissé quelque chose' in Q[4], f'le voisin a une cinquième question, à la fin (l\'ordre des autres ne change pas) : {Q[4]}')
    ev(pg, 'ma-debut'); fermer(pg)   # (le maire et son marché aux fleurs : plus tard)
    ev(pg, 'frapper', {'id': 'L1'}); pg.wait_for_timeout(400)
    verifier(pg.locator('#voile [data-act=question]').count() == 5, 'chez le voisin, le matin : cinq questions')
    pg.locator('#voile [data-act=question]').nth(4).click(); pg.wait_for_timeout(400)
    t = texte(pg); shot(pg, 'barde-voisin-papier')
    verifier('donne ce papier' in t and 'Le Sage saura peut-être les lire' in t, 'il donne le papier : « Si je disparais, donne ce papier à qui viendra me chercher. » — un code objet')
    verifier(pg.evaluate("() => !!M.P().objets.papier_odette && M.codesEnquete(M.E()).parId['obj:papier_odette'].length === 3"), 'le code « Le papier d\'Odette » existe (trois dessins)')
    verifier(pg.evaluate("() => M.E().objets.papier_odette.pour === 'sage' && M.E().objets.vieux_plan.pour === 'sage'"), 'les deux codes sont pour le Sage')
    pg.context.close()

    # ---------------------------------------------------------------- le Sage (téléphone, droit)
    print('— Le Sage (téléphone, écran droit) : le papier, le plan de la maison, la pierre de Tim')
    pg = debut(b, 'sage', TEL)
    L = pages(pg)
    verifier('plan' not in L and 'papier' not in L and 'vieuxplan' not in L and 'tableauodette' not in L, f'au début : ni « plan des Fondateurs », ni papier, ni vieux plan, ni tableau ({L})')
    t = page(pg, 'objets'); shot(pg, 'sage-objets')
    verifier('La pierre de Tim' in t and 'Vieux Chêne' in t, 'Les objets magiques : la pierre de Tim, et d\'où elle vient')
    t = code(pg, 'obj:papier_odette')
    verifier('papier d\'Odette' in t and 'Grand Livre' in t, 'le code du Barde : « Une nouvelle page s\'est glissée dans ton Grand Livre »')
    L = pages(pg)
    verifier('papier' in L, 'la page « Le papier d\'Odette » est apparue')
    t = page(pg, 'papier'); shot(pg, 'sage-papier-ferme')
    verifier('Quand le soleil de l\'après-midi entrera chez moi' in t and pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=papier]').count() == 1 and pg.locator('#livre-ici .lv-page.on .pp').count() == 0,
        'avant de déchiffrer : le début de la phrase, le bouton jaune, pas encore de plan')
    pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=papier]').click(); pg.wait_for_timeout(900)
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1200)
    info = pg.evaluate("() => window.__mjCourant ? {type:window.__mjCourant.type, m:window.__mjCourant.params.message, st:window.__mjCourant.params.sansTemps} : null")
    shot(pg, 'sage-papier-alphabet')
    verifier(info and info['type'] == 'alphabet' and info['m'] == 'LE CHAT QUI DORT TE MONTRERA LE CHEMIN' and info['st'], f'l\'alphabet secret, sans minuteur : {info}')
    pg.evaluate("() => window.__finir(true)"); pg.wait_for_timeout(500)
    verifier('le chat qui dort te montrera le chemin' in texte(pg), 'déchiffré : « …le chat qui dort te montrera le chemin. »')
    fermer(pg)
    t = page(pg, 'papier'); shot(pg, 'sage-papier-plan')
    verifier(pg.locator('#livre-ici .lv-page.on .pp[data-pp=maison] .pp-dessin').count() == 1 and 'Dans ta poche' in t and 'La pierre de Tim' in t, 'la page : la phrase, le plan de la maison au dos, et la poche avec la pierre de Tim')
    vis = pg.evaluate("() => { var f = document.querySelector('#livre-ici .lv-page.on .lv-feuille'), p = document.querySelector('.pp[data-pp=maison] .pp-poche').getBoundingClientRect(), r = f.getBoundingClientRect(); return [Math.round(p.bottom), Math.round(r.bottom)]; }")
    verifier(vis[0] <= vis[1] + 2, f'sur téléphone, sans faire défiler : le plan ET la poche sont à l\'écran (bas de la poche {vis[0]}, bas de la page {vis[1]})')
    verifier('lune' not in t and 'cloche' not in t and 'clé' not in t and 'signes minuscules' not in t, '(19 novembre) la page ne parle d\'aucun signe')
    larg = pg.evaluate("() => { var e = document.querySelector('.pp[data-pp=maison] .pp-plan'), r = e.getBoundingClientRect(); return [r.width, r.left, window.innerWidth]; }")
    verifier(larg[0] >= 230 and larg[1] >= 0 and larg[1] + larg[0] <= larg[2], f'sur téléphone, le plan tient dans la page (largeur {round(larg[0])} px sur {larg[2]})')
    def allume(sel):
        return pg.evaluate(f"() => {{ var e = document.querySelector('.pp[data-pp=maison] {sel}'); return e ? +getComputedStyle(e).opacity : -1; }}")
    pg.wait_for_timeout(500)
    verifier(allume('.pp-mots-soleil') == 0 and allume('.pp-dalles-or') == 0, 'avant la pierre : ni les mots du soleil, ni la lueur des dalles')
    verifier(pg.locator('.pp[data-pp=maison] .pp-dessin text').count() == 2 and pg.locator('.pp[data-pp=maison] .pp-trois-c, .pp[data-pp=maison] .pp-rang').count() == 0,
        'sur le plan : « Ma maison » et les mots cachés du soleil, rien d\'autre d\'écrit — ni signe, ni numéro')
    # toucher le plan sans pierre
    toucher_plan(pg, 'maison', .5, .2)
    e = etat_pp(pg, 'maison')
    verifier('ne dit rien de plus' in e['dit'] and not e['pose'], f'toucher le plan les mains vides : « {e["dit"][:70]} »')
    # prendre la pierre (un toucher), la poser loin, entre les deux, près des dalles, près du soleil
    r = centre(pg, '.pp[data-pp=maison] .pp-pierre[data-pp-pierre=tim]')
    pg.mouse.click(r[0] + r[2] / 2, r[1] + r[3] / 2); pg.wait_for_timeout(300)
    e = etat_pp(pg, 'maison')
    verifier('dans ta main' in e['dit'] and 'Promène-la' in e['dit'] and pg.locator('.pp[data-pp=maison] .pp-pierre.pp-main').count() == 1, 'un toucher sur la pierre : elle est « dans ta main », à promener sur le papier')
    toucher_plan(pg, 'maison', .78, .86)
    e = etat_pp(pg, 'maison'); shot(pg, 'sage-pierre-froide')
    verifier('pp-froid' in e['classe'] and 'froide' in e['dit'] and e['pose'] and not e['parle'], f'posée loin (vers la table) : « {e["dit"][:60]} »')
    toucher_plan(pg, 'maison', .30, .50)
    e = etat_pp(pg, 'maison')
    verifier('pp-froid' in e['classe'] and 'pp-tiede' not in e['classe'] and 'tiédit' not in e['dit'] and not e['parle'], f'entre le soleil et les dalles : froide — plus de « tiède », plus de « tu n\'es pas loin » (« {e["dit"][:60]} »)')
    verifier(pg.evaluate("() => M.livrePage()") == 'papier', 'le livre n\'a pas tourné de page pendant ces gestes')
    toucher_plan(pg, 'maison', .56, .485); pg.wait_for_timeout(500)
    e = etat_pp(pg, 'maison'); shot(pg, 'sage-pierre-dalles')
    verifier('pp-zone-dalles' in e['classe'] and 'les dalles s\'éclairent' in e['dit'] and allume('.pp-dalles-or') > .7 and allume('.pp-mots-soleil') == 0, f'sur les dalles : elles s\'éclairent (« {e["dit"][:70]} »)')
    verifier(pg.evaluate("() => document.querySelectorAll('.pp[data-pp=maison] .pp-dalles-or rect').length") == 10 and not any(x in e['dit'] for x in ('lune', 'cloche', 'clé', 'ordre', 'trois', '1', '2', '3')),
        'neuf dalles éclairées, toutes pareilles : aucun signe, aucun numéro, aucun ordre')
    verifier(not e['parle'] and pg.locator('.pp[data-pp=maison] .pp-poche').count() == 1 and pg.locator('.pp[data-pp=maison] button.pp-pose').count() == 1, 'la pierre reste posée et peut repartir ; la poche est toujours là ; le plan n\'a pas encore tout dit')
    toucher_plan(pg, 'maison', .09, .485); pg.wait_for_timeout(500)
    e = etat_pp(pg, 'maison'); shot(pg, 'sage-pierre-soleil')
    verifier('pp-zone-soleil' in e['classe'] and 'soleil de l\'après-midi' in e['dit'] and allume('.pp-mots-soleil') > .9 and allume('.pp-dalles-or') == 0, f'près du soleil : les mots s\'allument, les dalles s\'éteignent (« {e["dit"][:80]} »)')
    verifier(e['parle'] and pg.evaluate("() => M.P().vus['pierre:maison'] === 'ok'"), 'le soleil ET les dalles ont été vus : c\'est gardé (P.vus)')
    verifier(pg.evaluate("() => !Object.keys(M.P().objets).some(function(k){ return /maison|signes/.test(k); })"), 'aucun code : ça se dit à voix haute')
    toucher_plan(pg, 'maison', .56, .485); pg.wait_for_timeout(400)
    verifier('pp-zone-dalles' in etat_pp(pg, 'maison')['classe'], 'après, la pierre se promène encore : de retour sur les dalles, elles se rallument')
    pg.reload(); pg.wait_for_timeout(600)
    pg.evaluate("() => { var b = document.querySelector('[data-act=continuer], [data-act=reprendre]'); if(b) b.click(); }"); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => !!(M.P() && M.P().vus['pierre:maison'] === 'ok')"), 'après avoir rechargé la page : toujours là')
    pg.context.close()

    # ---------------------------------------------------------------- le Sage (tablette) : glisser la pierre ; le tableau ; le vieux plan
    print('— Le Sage (tablette) : glisser la pierre, le tableau à revoir, le vieux plan')
    pg = debut(b, 'sage', TAB)
    code(pg, 'obj:papier_odette')
    page(pg, 'papier')
    pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=papier]').click(); pg.wait_for_timeout(900)
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(900)
    pg.evaluate("() => window.__finir(true)"); pg.wait_for_timeout(400); fermer(pg)
    page(pg, 'papier')
    r = centre(pg, '.pp[data-pp=maison] .pp-pierre[data-pp-pierre=tim]')
    pl = pg.evaluate("() => { var r = document.querySelector('.pp[data-pp=maison] .pp-plan').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }")
    pg.mouse.move(r[0] + r[2] / 2, r[1] + r[3] / 2); pg.mouse.down()
    for k in range(1, 9):
        pg.mouse.move(r[0] + r[2] / 2 + (pl[0] + pl[2] * .2 - r[0] - r[2] / 2) * k / 8, r[1] + r[3] / 2 + (pl[1] + pl[3] * .2 - r[1] - r[3] / 2) * k / 8); pg.wait_for_timeout(30)
    verifier(pg.locator('.pp-fantome').count() == 1, 'glisser la pierre : elle suit le doigt')
    shot(pg, 'sage-glisser')
    pg.mouse.up(); pg.wait_for_timeout(350)
    e = etat_pp(pg, 'maison')
    verifier(e['pose'] and 'pp-froid' in e['classe'] and pg.locator('.pp-fantome').count() == 0 and pg.evaluate("() => M.livrePage()") == 'papier', 'lâchée sur le plan, en haut à gauche : posée, froide ; la page n\'a pas tourné')
    # glisser la pierre déjà posée jusqu'aux dalles : le papier réagit PENDANT qu'elle passe
    r = pg.evaluate("() => { var r = document.querySelector('.pp[data-pp=maison] button.pp-pose').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    cx, cy = pl[0] + pl[2] * .56, pl[1] + pl[3] * .485 + 10
    pg.mouse.move(r[0], r[1]); pg.mouse.down()
    for k in range(1, 9): pg.mouse.move(r[0] + (cx - r[0]) * k / 8, r[1] + (cy - r[1]) * k / 8); pg.wait_for_timeout(30)
    pg.wait_for_timeout(450)
    e = etat_pp(pg, 'maison'); shot(pg, 'sage-tab-dalles-en-glissant')
    verifier('pp-zone-dalles' in e['classe'] and 'pp-traine' in e['classe'] and 'les dalles s\'éclairent' in e['dit'] and pg.locator('.pp-fantome.pp-chaud').count() == 1,
        'la pierre glisse au-dessus des dalles, le doigt encore posé : elles s\'éclairent déjà, la phrase change, les runes rougeoient')
    pg.mouse.up(); pg.wait_for_timeout(450)
    e = etat_pp(pg, 'maison')
    verifier(e['pose'] and 'pp-zone-dalles' in e['classe'] and not e['parle'] and pg.locator('.pp-fantome').count() == 0, 'lâchée sur les dalles : elle y reste, elles restent éclairées')
    # le doigt posé sur le papier (pas sur la pierre) : la pierre vient, et on la promène jusqu'au soleil
    x0, y0 = pl[0] + pl[2] * .5, pl[1] + pl[3] * .85
    sx, sy = pl[0] + pl[2] * .09, pl[1] + pl[3] * .485 + 10
    pg.mouse.move(x0, y0); pg.mouse.down()
    for k in range(1, 5): pg.mouse.move(x0 + (pl[0] + pl[2] * .3 - x0) * k / 4, y0 + (pl[1] + pl[3] * .6 - y0) * k / 4); pg.wait_for_timeout(30)
    pg.wait_for_timeout(300)
    verifier(pg.locator('.pp-fantome').count() == 1 and 'pp-zone-' not in etat_pp(pg, 'maison')['classe'], 'un doigt posé sur le papier : la pierre vient sous le doigt ; loin de tout, rien ne s\'allume (les dalles se sont éteintes)')
    x1, y1 = pl[0] + pl[2] * .3, pl[1] + pl[3] * .6
    for k in range(1, 9): pg.mouse.move(x1 + (sx - x1) * k / 8, y1 + (sy - y1) * k / 8); pg.wait_for_timeout(30)
    pg.wait_for_timeout(450)
    e = etat_pp(pg, 'maison'); shot(pg, 'sage-tab-soleil-en-glissant')
    verifier('pp-zone-soleil' in e['classe'] and 'soleil de l\'après-midi' in e['dit'] and e['parle'], 'promenée jusqu\'au soleil : les mots « soleil de l\'après-midi » ; les deux sont vus, c\'est gardé')
    pg.mouse.up(); pg.wait_for_timeout(450)
    verifier(pg.evaluate("() => M.livrePage()") == 'papier' and etat_pp(pg, 'maison')['pose'], 'la page n\'a pas tourné ; la pierre est posée près du soleil')
    verifier(pg.evaluate("() => (M.P().carnet || []).some(function(x){ return /soleil de l.après-midi/.test(x.t) && /dalles/.test(x.t); })"), 'le Carnet garde la trouvaille : les mots du soleil, et les dalles')
    t = page(pg, 'tableau')
    verifier(pg.evaluate("() => (M.E().etapes.sage || []).some(function(x){ return /papier couvert de signes/.test(x.t); })"), 'la mission du Sage existe (elle n\'arrive qu\'avec le papier)')
    # le tableau d'Odette
    verifier('tableauodette' not in pages(pg), 'le tableau n\'est pas dans le livre avant d\'être peint')
    pg.evaluate("() => { M.P().vus['sage:mairie:tableau'] = 'ok'; M.sauver(); }")
    t = page(pg, 'tableauodette'); shot(pg, 'sage-tableau')
    verifier(pg.locator('#livre-ici .lv-page.on .pp-tableau svg').count() == 1 and 'Regarde-le bien' in t, 'peint : la page « Le tableau d\'Odette », avec le dessin')
    # le vieux plan
    verifier('vieuxplan' not in pages(pg), 'pas de vieux plan sans le code du Pisteur')
    t = code(pg, 'obj:vieux_plan')
    verifier('vieux plan' in t, 'le code du Pisteur : « Le vieux plan d\'Odette »')
    t = page(pg, 'vieuxplan'); shot(pg, 'sage-vieuxplan')
    verifier('plus un seul nom' in t and 'petite cloche' in t and 'la pierre qui les garde' in t, 'la page : des couloirs sans nom, la petite cloche, la note d\'Odette')
    verifier(not any(x in t.lower() for x in ['souterrain', 'donjon', 'crypte', 'maire', 'fondateur']), 'ni « souterrains », ni « donjon », ni « crypte », ni le maire, ni les Fondateurs')
    verifier(pg.evaluate("() => document.querySelectorAll('.pp[data-pp=vieuxplan] .pp-dessin path').length > 20"), 'le plan est dessiné (les couloirs du dessous)')
    r = centre(pg, '.pp[data-pp=vieuxplan] .pp-pierre[data-pp-pierre=tim]')
    pg.mouse.click(r[0] + r[2] / 2, r[1] + r[3] / 2); pg.wait_for_timeout(250)
    toucher_plan(pg, 'vieuxplan', .5, .5)
    e = etat_pp(pg, 'vieuxplan'); shot(pg, 'sage-vieuxplan-tim')
    verifier(not e['parle'] and 'La pierre de Tim reste froide' in e['dit'], f'la pierre de Tim sur le vieux plan : « {e["dit"][:80]} »')
    # (17 novembre, étape 4) la nuit : plus de page « Le plan des souterrains » ; le vieux plan reste muet jusqu'au départ (le code du
    # Pisteur, « On va dans la crypte ») ; alors il se regarde de tout près, depuis sa page
    pg.evaluate("() => { M.P().moment = M.E().moments.length - 1; M.sauver(); M.render(); }")
    verifier('donjon' not in pages(pg), 'la nuit : plus de page « Le plan des souterrains » arrivée toute seule')
    t = page(pg, 'vieuxplan')
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ds-plan]').count() == 0 and 'plus un seul nom' in t and 'souterrain' not in t.lower(), 'la nuit, avant le départ : le vieux plan reste muet (pas de bouton, pas un mot des souterrains)')
    code(pg, 'info:on_descend'); fermer(pg)
    t = page(pg, 'vieuxplan')
    verifier('étui de cuir' in t and 'Le Pisteur a ouvert le passage' in t and 'Fondateurs' not in t and pg.locator('#livre-ici .lv-page.on [data-act=ds-plan]').count() == 1, f'le Pisteur a ouvert le passage : le vieux plan d\'Odette se regarde de tout près ({t[-120:]})')
    shot(pg, 'sage-vieuxplan-depart')
    pg.context.close()

    # ---------------------------------------------------------------- le Pisteur
    SIG = ['lune', 'oeil', 'cloche', 'chaudron', 'lanterne', 'etoile', 'lyre', 'arbre', 'cle']   # (les noms des dalles dans le code : rien n'est dessiné)
    INDICES = ('après-midi', 'cet après', 'ordre', 'Sage', 'trois', 'Trois', 'signe', 'réessayer', 'Raté')
    def entrer(pg):
        pg.locator('#voile [data-act=point][data-id=cachette]').first.click(); pg.wait_for_timeout(300)
        if pg.locator('#voile [data-act=mj-go]').count(): pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    def dalle(pg, sg):
        q = pg.evaluate(f"() => {{ var r = document.querySelector('.in-dalle[data-k=\"{SIG.index(sg)}\"] .in-touche').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }}")
        pg.mouse.click(q[0], q[1]); pg.wait_for_timeout(160)
    for vue, nomv in ((TEL, 'tel'), (TAB, 'tab')):
        print(f'— Le Pisteur ({nomv}) : la maison d\'Odette, le matin puis l\'après-midi')
        pg = debut(b, 'pisteur', vue, 'enfant')
        bulles = pg.evaluate("() => M.bullesMaisons()")
        verifier(bulles.get('L2') == '🏠', f'le matin, une petite bulle 🏠 sur la maison d\'Odette ({bulles})')
        ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
        pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id + '|' + b.querySelector('b').textContent; })")
        verifier(pts == ['cachette|La maison d\'Odette'], f'devant chez Odette, le matin : « La maison d\'Odette », seulement ({pts})')
        pg.locator('#voile [data-act=point][data-id=cachette]').first.click(); pg.wait_for_timeout(300)
        t = texte(pg)
        verifier(pg.locator('#voile [data-act=mj-go]').count() == 1 and 'jamais fermée' in t and not any(x in t for x in INDICES), 'l\'explication, et son bouton jaune — sans aide')
        pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
        shot(pg, f'pisteur-{nomv}-matin-regles')
        t = texte(pg, '#mj-plein')
        verifier(pg.locator('#mj-plein .mj-go').count() == 1 and pg.locator('#mj-plein .in-demo').count() == 1 and 'Regarde partout' in t and not any(x in t for x in INDICES), 'les règles en images : « Regarde partout, du bout du doigt ! » — rien sur les dalles')
        pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(900)
        shot(pg, f'pisteur-{nomv}-matin')
        e = pg.evaluate("() => __interieur.etat()")
        verifier(not e['visite'] and not e['jour'] and not any(x in e['bulle'] for x in INDICES + ('soleil',)), f'le matin : dans l\'ombre, AUCUNE aide — « {e["bulle"][:70]} »')
        g = pg.evaluate("() => { var p = document.querySelector('.in-piece'), r = p.getBoundingClientRect(), c = document.querySelector('.in-sortir').getBoundingClientRect(); return {w:r.width, h:r.height, l:r.left, t:r.top, vw:innerWidth, vh:innerHeight, sb:c.bottom, grains:document.querySelectorAll('.in-grains i').length, ors:!!document.querySelector('.in-ors'), signes:document.querySelectorAll('.in-piece .in-signe, .in-piece .in-or-fixe, .in-piece [data-signe], .in-pris').length}; }")
        verifier(g['w'] > 250 and abs(g['w'] / g['h'] - .75) < .02 and g['l'] >= 0 and g['l'] + g['w'] <= g['vw'] + 1 and g['sb'] <= g['vh'] + 1, f'la pièce tient dans l\'écran, droit ({round(g["w"])} × {round(g["h"])} sur {g["vw"]} × {g["vh"]}) ; le bouton « Sortir » aussi')
        verifier(g['grains'] == 0 and not g['ors'] and g['signes'] == 0, 'dans l\'ombre : pas de poussière dorée, pas de lueur, pas un signe, pas de compteur')
        # toucher un meuble, puis des dalles
        q = pg.evaluate("() => { var r = document.querySelector('.in-regard[data-o=lit]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
        pg.mouse.click(q[0], q[1]); pg.wait_for_timeout(250)
        verifier('lit est fait' in pg.evaluate("() => __interieur.etat().bulle"), 'toucher le lit : « Le lit est fait, sans un pli… »')
        verifier(pg.locator('#mj-plein .in-bulle button').count() == 1, 'la phrase a son bouton 🔊')
        dalle(pg, 'lanterne')
        e = pg.evaluate("() => __interieur.etat()")
        verifier(e['pris'] == ['lanterne'] and pg.locator('.in-dalle.in-bas-d').count() == 1 and 'lit est fait' in e['bulle'], 'toucher une dalle, le matin : elle s\'enfonce, sans un mot')
        dalle(pg, 'oeil'); dalle(pg, 'arbre'); pg.wait_for_timeout(600)
        e = pg.evaluate("() => __interieur.etat()"); shot(pg, f'pisteur-{nomv}-matin-faux')
        verifier(e['essais'] == 1 and not e['ouvert'] and e['bulle'].startswith('Clac ! Les dalles remontent.') and not any(x in e['bulle'] for x in INDICES), f'trois dalles au hasard : « {e["bulle"][:40]} » — rien de plus')
        pg.wait_for_timeout(900)
        verifier(pg.evaluate("() => __interieur.etat().pris.length") == 0 and pg.locator('.in-dalle.in-bas-d').count() == 0 and pg.locator('.in-or.on').count() == 0, 'les dalles sont remontées ; rien ne s\'allume')
        pg.locator('#mj-plein .in-sortir').click(); pg.wait_for_timeout(500)
        t = texte(pg); shot(pg, f'pisteur-{nomv}-matin-fin')
        verifier(pg.locator('#mj-plein .mj-resultat').count() == 0 and pg.evaluate("() => (M.UI.modal || {}).type") == 'maison' and not any(x in t for x in INDICES),
            'en sortant : ni « Bravo », ni « Raté », ni « réessayer » — on est devant la porte, c\'est tout')
        verifier(pg.evaluate("() => !M.P().vus['pisteur:L2:cachette'] && !M.P().objets.vieux_plan") and pg.locator('#voile [data-act=point][data-id=cachette]:not([disabled])').count() == 1, 'rien n\'est noté, pas de plan ; la maison reste ouverte (on peut y retourner)')
        garde = pg.evaluate("() => { M.UI.modal = null; M.render(); return {n:Object.keys(M.S.garde.a).length, t:(M.UI.modal || {}).type || ''}; }")
        fermer(pg)
        verifier(pg.evaluate("() => M.bullesMaisons().L2") is None, 'plus de bulle sur la maison ce matin (elle ne dit pas « il reste quelque chose »)')
        # l'après-midi
        moment_suivant(pg, 'pisteur')
        verifier(pg.evaluate("() => M.momentId()") == 'apresmidi' and pg.evaluate("() => M.bullesMaisons().L2") == '☀️', 'l\'après-midi : une bulle ☀️ sur la maison d\'Odette')
        g0 = pg.evaluate("() => Object.keys(M.S.garde.a).length")
        verifier(g0 == garde['n'], f'la visite du matin n\'a rien donné à la garde-robe ({garde["n"]} → {g0})')
        ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
        pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id + '|' + b.querySelector('b').textContent; })")
        # (17 novembre, étape 3) les traces de Moustache se voient aussi, l'après-midi, sans code (le bol de lait de midi renversé)
        verifier(pts == ['cachette|Chez Odette, au soleil', 'traces|Les traces de Moustache'], f'devant chez Odette, l\'après-midi : « Chez Odette, au soleil », et les traces de Moustache ({pts})')
        pg.locator('#voile [data-act=point][data-id=cachette]').first.click(); pg.wait_for_timeout(300)
        t = texte(pg)
        verifier('soleil de l\'après-midi entre enfin' in t and not any(x in t for x in ('dalle', 'ordre', 'Sage', 'trois')), 'l\'explication : le soleil entre — pas un mot des dalles')
        pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
        shot(pg, f'pisteur-{nomv}-aprem-regles')
        t = texte(pg, '#mj-plein')
        verifier('Regarde partout' in t and not any(x in t for x in ('dalle', 'ordre', 'Sage', 'Trois')), 'les règles : « Regarde partout, du bout du doigt ! » — plus de « Trois dalles, dans le bon ordre »')
        pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(700)
        shot(pg, f'pisteur-{nomv}-aprem')
        g = pg.evaluate("() => { var p = document.querySelector('.in-piece'), r = p.getBoundingClientRect(), c = document.querySelector('.in-sortir').getBoundingClientRect(); return {w:r.width, h:r.height, l:r.left, vw:innerWidth, vh:innerHeight, sb:c.bottom, grains:document.querySelectorAll('.in-grains i').length, ors:document.querySelectorAll('.in-ors .in-or').length, on:document.querySelectorAll('.in-or.on').length, signes:document.querySelectorAll('.in-piece .in-signe, .in-piece .in-or-fixe, .in-piece [data-signe], .in-pris').length, dalle:document.querySelector('.in-touche').getBoundingClientRect().width, bulle:__interieur.etat().bulle}; }")
        verifier(g['grains'] >= 15 and g['ors'] == 3 and g['on'] == 0 and g['signes'] == 0, f'au soleil : la poussière danse ({g["grains"]} grains) ; en entrant, aucune dalle allumée, aucun signe')
        verifier(not any(x in g['bulle'] for x in ('dalle', 'ordre', 'Sage', 'trois', 'chat qui dort')), f'la phrase d\'entrée ne dit rien des dalles : « {g["bulle"][:60]} »')
        verifier(g['l'] + g['w'] <= g['vw'] + 1 and g['sb'] <= g['vh'] + 1 and g['dalle'] >= 30, f'tout tient dans l\'écran ; une dalle fait {round(g["dalle"])} px de large sous le doigt')
        # LE SOLEIL MONTRE L'ORDRE : rien avant 3 s, puis une dalle, une seconde plus tard une deuxième, une seconde plus tard une troisième
        def proche(l, attendu): return len(l) == len(attendu) and all(abs(a - c) <= 300 for a, c in zip(l, attendu))
        pg.wait_for_function("() => __interieur.etat().allumees.length === 1", timeout=6000)
        e1 = pg.evaluate("() => __interieur.etat()")
        pg.wait_for_function("() => __interieur.etat().allumees.length === 3", timeout=6000)
        e3 = pg.evaluate("() => __interieur.etat()"); shot(pg, f'pisteur-{nomv}-aprem-allumees')
        verifier(e1['allumees'] == ['lune'] and e3['allumees'] == ['lune', 'cloche', 'cle'] and proche(e3['temps'], [3000, 4000, 5000]),
            f'au bout de 3 s une dalle s\'allume, 1 s plus tard une deuxième, 1 s plus tard une troisième (instants mesurés : {e3["temps"]} ms)')
        verifier(pg.locator('.in-or.on').count() == 3 and pg.evaluate("() => [].map.call(document.querySelectorAll('.in-or.on'), function(e){ return +e.dataset.k; }).sort().join()") == '0,2,8', 'trois lueurs dorées, sur trois dalles — sans rien d\'écrit')
        # un mauvais ordre (les bonnes dalles, mal rangées)
        for sg in ('cle', 'lune', 'cloche'): dalle(pg, sg)
        pg.wait_for_timeout(500)
        e = pg.evaluate("() => __interieur.etat()"); shot(pg, f'pisteur-{nomv}-aprem-faux')
        verifier(e['essais'] == 1 and not e['ouvert'] and e['bulle'].startswith('Clac ! Les dalles remontent.') and 'ordre' not in e['bulle'], 'les trois bonnes dalles dans le mauvais ordre : « Clac ! Les dalles remontent. » — sans indice')
        pg.wait_for_function("() => __interieur.etat().pris.length === 0 && !document.querySelector('.in-dalle.in-bas-d')", timeout=4000)
        verifier(pg.locator('.in-or.on').count() == 0 and pg.evaluate("() => __interieur.etat().allumees.length") == 0, 'les dalles sont remontées, les lueurs éteintes')
        pg.wait_for_function("() => __interieur.etat().allumees.length === 3", timeout=6000)
        e3 = pg.evaluate("() => __interieur.etat()")
        verifier(e3['allumees'] == ['lune', 'cloche', 'cle'] and proche(e3['temps'], [1000, 2000, 3000]), f'puis le soleil les rallume, dans le même ordre, une par seconde ({e3["temps"]} ms)')
        # trois autres dalles, puis sortir sans avoir trouvé
        for sg in ('oeil', 'etoile', 'lyre'): dalle(pg, sg)
        pg.wait_for_timeout(1400)
        pg.locator('#mj-plein .in-sortir').click(); pg.wait_for_timeout(500)
        t = texte(pg)
        verifier(pg.evaluate("() => (M.UI.modal || {}).type") == 'maison' and not any(x in t for x in ('gardent leur secret', 'réessayer', 'Raté', 'ordre', 'Sage')) and pg.evaluate("() => !M.P().objets.vieux_plan && !M.P().vus['pisteur:L2:cachette']"),
            'sortir sans avoir trouvé : devant la porte, sans un mot — plus de « Les dalles gardent leur secret… Le Sage a peut-être… », pas de plan')
        verifier(pg.evaluate("() => M.bullesMaisons().L2") == '☀️', 'l\'après-midi, la bulle ☀️ reste sur la maison tant que la cachette n\'est pas trouvée')
        # y retourner, le bon ordre
        entrer(pg)
        if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(900)
        for sg in ('lune', 'cloche', 'cle'): dalle(pg, sg)
        pg.wait_for_timeout(2600)
        e = pg.evaluate("() => window.__interieur.etat()"); shot(pg, f'pisteur-{nomv}-aprem-ouvert')
        verifier(e['ouvert'], 'les trois dalles, dans l\'ordre du soleil (sans attendre qu\'il les rallume) : la dalle du milieu glisse')
        pg.wait_for_timeout(1500)
        verifier(pg.locator('#mj-plein .mj-resultat.ok').count() == 1 and 'Une cachette' in texte(pg, '#mj-plein'), 'l\'écran du mini-jeu : « Une cachette ! »')
        pg.locator('#mj-plein .mj-continuer').click(); pg.wait_for_timeout(500)
        t = texte(pg); shot(pg, f'pisteur-{nomv}-aprem-code')
        tg = pg.evaluate("() => document.body.innerText.replace(/\\s+/g, ' ')")
        verifier('Sous la dalle du milieu, un étui de cuir' in t and 'Le Sage saura le lire' in t and pg.evaluate("() => !!M.P().objets.vieux_plan"), 'la découverte : l\'étui de cuir, et le code « Le vieux plan d\'Odette »')
        fermer(pg); pg.wait_for_timeout(300)
        m = pg.evaluate("() => M.UI.modal ? JSON.parse(JSON.stringify(M.UI.modal)) : null")
        t = texte(pg); shot(pg, f'pisteur-{nomv}-aprem-garde')
        g1 = pg.evaluate("() => Object.keys(M.S.garde.a).length")
        verifier(g1 >= g0 + 2 and 'pour la cachette d\'Odette' in tg, f'la garde-robe : un paquet, « pour la cachette d\'Odette » ({g0} → {g1})')
        fermer(pg)
        pg.context.close()

    # ---------------------------------------------------------------- le coup de chance du matin
    print('— Le Pisteur : le coup de chance du matin (Romain : « s\'il a de la chance, il peut trouver […] je pense pas que ça gêne »)')
    pg = debut(b, 'pisteur', TAB, 'enfant')
    ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
    entrer(pg)
    pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(900)
    for sg in ('lune', 'cloche', 'cle'): dalle(pg, sg)
    pg.wait_for_timeout(2600); shot(pg, 'pisteur-chance-matin-ouvert')
    e = pg.evaluate("() => window.__interieur.etat()")
    verifier(e['ouvert'] and not e['jour'], 'le matin, dans l\'ombre, les trois bonnes dalles dans l\'ordre : la cachette s\'ouvre quand même')
    pg.wait_for_timeout(1500)
    pg.locator('#mj-plein .mj-continuer').click(); pg.wait_for_timeout(500)
    t = texte(pg)
    verifier('étui de cuir' in t and 'Le Sage saura le lire' in t and pg.evaluate("() => !!M.P().objets.vieux_plan && M.P().vus['pisteur:L2:cachette'] === 'ok'"), 'la découverte et le code du vieux plan, dès le matin')
    fermer(pg); pg.wait_for_timeout(300); fermer(pg)
    moment_suivant(pg, 'pisteur')
    ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
    pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id + (b.classList.contains('vu') ? ':vu' : ''); })")
    verifier(pts == ['cachette:vu', 'traces'] and pg.evaluate("() => M.bullesMaisons().L2") == '🐾', f'l\'après-midi : la cachette est déjà faite (✔), il reste les traces de Moustache ({pts})')
    pg.locator('#voile [data-act=point][data-id=cachette]').first.click(); pg.wait_for_timeout(300)
    verifier('étui de cuir' in texte(pg) and pg.locator('#voile [data-act=mj-go]').count() == 0, 'la toucher rappelle la trouvaille, sans relancer le mini-jeu')
    pg.context.close()

    # ---------------------------------------------------------------- une partie d'avant le 19 novembre
    print('— Une partie commencée avant le 19 novembre (la visite du matin était notée « pisteur:L2:maison »)')
    pg = debut(b, 'pisteur', TAB, 'enfant')
    pg.evaluate("() => { M.P().vus['pisteur:L2:maison'] = 'ok'; M.P().vus['explore:L2'] = 0; M.sauver(); M.render(); }")
    ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
    pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id + (b.classList.contains('vu') ? ':vu' : ''); })")
    verifier(pts == ['cachette'], f'le matin : la maison est là, pas « déjà faite » ({pts})')
    moment_suivant(pg, 'pisteur')
    ev(pg, 'maison', {'id': 'L2'}); pg.wait_for_timeout(300)
    pts = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id + (b.classList.contains('vu') ? ':vu' : ''); })")
    verifier(pts == ['cachette', 'traces'], f'l\'après-midi : la cachette reste à trouver ({pts})')
    pg.context.close()

    b.close()

vrais = [e for e in erreurs if 'favicon' not in e]
print('Erreurs de console :', len(vrais))
for e in vrais[:8]: print('   ', e[:300])
if echecs or vrais:
    print(f'RATÉ : {len(echecs)} vérification(s), {len(vrais)} erreur(s)'); sys.exit(1)
print('Tout est bon : le secret d\'Odette.')
