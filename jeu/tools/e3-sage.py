"""Enquête 3 : le Sage, le matin et l'après-midi (Playwright ; refait le 13 novembre).
Partie A : le tableau d'Odette (Assembler les runes) ; le Grand Livre sans les pages qui donnaient la solution ; le Livre d'or (le matin :
huit mots, pas de bouton ; l'après-midi : douze, le bouton jaune, le code pour l'Alchimiste) ; l'herbier ; le tableau d'enquête (quatorze
personnages, dix lieux) ; la bibliothèque et ses archives ; le plan des Fondateurs (dès le matin, sans minuteur) ; la lettre et le carnet
d'Odette (deux pages qui apparaissent avec les codes du Barde ; les écritures) ; rendre le tableau.
Partie B : le tableau raté.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-sage.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-sage'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1; pg.wait_for_timeout(400); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def modal(pg):
    return pg.evaluate("() => M.UI.modal ? JSON.parse(JSON.stringify(M.UI.modal)) : null")

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle):
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350); fermer(pg); pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")

def apresmidi(pg):
    # le Sage ne tape pas le code du moment : c'est lui qui le donne (« Passer à l'après-midi », dans son Grand Livre)
    pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)

def page(pg, pid):
    pg.evaluate(f"() => {{ M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('{pid}', true); }}"); pg.wait_for_timeout(300)
    return texte(pg, '#livre-ici .lv-page.on')

def objets(pg):
    return pg.evaluate("() => Object.keys(M.P().objets).filter(function(k){ return k.charAt(0) === '_'; })")

def lieu(pg, l):
    pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")
    ev(pg, 'lieu', {'id': l})
    b = pg.locator('#voile [data-act=explorer]')
    if b.count(): b.first.click(); pg.wait_for_timeout(200)
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return b.dataset.id; })")

def jouer(pg, pid, reussi, capt=None):
    pg.locator(f'#voile [data-act=point][data-id={pid}]').first.click(); pg.wait_for_timeout(250)
    verifier(pg.locator('#voile [data-act=mj-go]').count() == 1, f'{pid} : l\'explication avant le mini-jeu et son bouton jaune')
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1500)
    if capt: pg.screenshot(path=f'{OUT}/{capt}.png')
    info = pg.evaluate("() => window.__mjCourant ? {type:window.__mjCourant.type, params:window.__mjCourant.params} : null")
    pg.evaluate(f"() => window.__finir({'true' if reussi else 'false'})"); pg.wait_for_timeout(500)
    return info

def debut(b, nom):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Sage'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      var vrai = MJ.lancer;
      MJ.lancer = function(el, type, params, fin, opt){
        var c = {type:type, params:params, fin:fin, fini:false};
        c.h = vrai.call(MJ, el, type, params, function(r){ if(!c.fini){ c.fini = true; fin(r); } }, opt);
        window.__mjCourant = c; return c.h;
      };
      window.__finir = function(ok){ var c = window.__mjCourant; if(!c || c.fini) return; c.fini = true; window.__mjCourant = null;
        try{ c.h && c.h.arreter && c.h.arreter(); }catch(e){}
        c.fin({reussi:!!ok, score:ok ? 100 : 0, essais:1, erreurs:ok ? 0 : 3, detail:''}); };
    }""")
    return pg

with sync_playwright() as p:
    b = p.chromium.launch()
    print('— Partie A : le matin')
    pg = debut(b, 'A')
    liste = lambda: pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); return [].map.call(document.querySelectorAll('#livre-ici .lv-page'), function(x){ return x.dataset.id || ''; }); }")
    pts = lieu(pg, 'mairie')
    verifier(pts == ['tableau'], f'la mairie, le matin : le tableau (le Livre d\'or est dans le Grand Livre) ({pts})')
    shot(pg, 'A-mairie')
    info = jouer(pg, 'tableau', True, 'A-tableau-jeu')
    verifier(info and info['type'] == 'runes' and info['params'].get('image') == 'tableau', 'le tableau : Assembler les runes, avec le dessin du tableau')
    verifier('Magnifique' in texte(pg), 'réussi : « Magnifique ! On l\'accrochera au-dessus du gâteau. »')
    fermer(pg)
    L = liste()
    verifier(not any(x in L for x in ['doutes', 'fausse', 'chats', 'qui', 'vraielettre', 'carnet']) and all(x in L for x in ['tableau', 'bibliotheque']) and 'plan' not in L and 'livredor' not in L and 'herbier' not in L,
             f'le Grand Livre : plus de « Une drôle de lettre », « La lettre et le carnet », « Qui a écrit la lettre ? » ; la lettre et le carnet n\'y sont pas encore ({L})')
    # (17 novembre, le nouveau fil) le Livre d'or n'est plus dans le Grand Livre le matin : le maire le confie au Sage l'après-midi,
    # quand il rend le tableau (tools/e3-ecritures.py)
    verifier('livredor' not in liste(), 'le matin : pas de Livre d\'or dans le Grand Livre')
    # (17 novembre, étape 3) l'herbier n'est plus dans le Grand Livre dès le matin : Iris le prête au Barde (un code objet)
    verifier('herbier' not in liste(), 'le matin, sans le code du Barde : pas d\'herbier dans le Grand Livre')
    code(pg, 'obj:herbier')
    t = page(pg, 'herbier')
    verifier(pg.locator('#livre-ici .lv-page.on .lv-herbier > li').count() == 7 and pg.locator('#livre-ici .lv-page.on .lv-herbier .b-lire').count() == 14, 'l\'herbier : sept planches, « Où ? » et « Quand ? », chaque texte avec son 🔊 (12 novembre, Bible §13.26)')
    verifier('_info:herbier' not in objets(pg) and 'Rond des Sorcières' not in t and 'Cinq Pierres' not in t and 'incantations' in t and 'bruyère' in t and 'patte de loup' in t and 'épouvantail' in t and 'donjon' not in t.lower(),
             'plus de code : le Sage lit des indices (plus le nom des lieux : Bible §13.28), l\'Alchimiste cherche sur sa carte ; pas un mot du donjon')
    shot(pg, 'A-herbier')
    # les codes du Barde : des informations, plus de page qui conclut
    verifier(pg.evaluate("() => ['poste', 'chale', 'pieds_enfant'].every(function(k){ return M.E().infos[k].reserve; })") and 'doutes' not in liste(), '(17 novembre) Victor, Tim et les pieds d\'enfant : plus de codes (dits à voix haute) ; aucune page ne conclut à la place du Sage')
    # le tableau d'enquête : tous les personnages, dix lieux
    page(pg, 'tableau')
    verifier(pg.locator('#livre-ici .lv-page.on .tb-ligne').count() == 14 and pg.locator('#livre-ici .lv-page.on .tb-col').count() == 10, 'mon tableau d\'enquête : quatorze personnages, dix lieux')
    tt = texte(pg, '#livre-ici .lv-page.on')
    verifier('fond' not in tt and 'quatre signes' not in tt and 'Puits' in tt and 'Clocher' in tt, 'les lieux : « Clocher », « Puits »… rien qui désigne la réponse')
    shot(pg, 'A-tableau')
    # la bibliothèque des plans : les archives des plans des enquêtes passées, repliées
    t = page(pg, 'bibliotheque')
    verifier(pg.locator('#livre-ici .lv-page.on .lv-bib-passe').count() == 2 and 'Les vieux chemins' in t and 'Le plan du moulin' in t and 'bûcherons' not in t, 'la bibliothèque : les deux plans de l\'enquête 2, repliés')
    pg.locator('#livre-ici .lv-page.on .lv-bib-passe [data-act=bib-plier]').first.click(); pg.wait_for_timeout(300)
    verifier('bûcherons' in texte(pg, '#livre-ici .lv-page.on'), 'un plan se déplie : ce qu\'on y avait trouvé')
    # (16 novembre, Bible §13.57) plus de « plan des Fondateurs » sorti de nulle part : le papier d'Odette vient du voisin (tools/e3-secret.py)
    verifier(pg.evaluate("() => !M.E().pages.some(function(p){ return p.id === 'plan'; })") and 'papier' not in liste(), 'plus de « plan des Fondateurs » ; pas de papier d\'Odette sans le code du Barde')

    print('— Partie A : l\'après-midi')
    apresmidi(pg); pg.wait_for_timeout(2600)
    verifier(pg.evaluate("() => M.momentId()") == 'apresmidi', 'l\'après-midi')
    verifier('livredor' not in liste(), 'l\'après-midi, avant d\'avoir rendu le tableau : toujours pas de Livre d\'or')
    # la lettre et le carnet : deux pages qui apparaissent avec les codes du Barde
    code(pg, 'obj:lettre'); code(pg, 'obj:carnet')
    L = liste()
    verifier('vraielettre' in L and 'carnet' in L, f'avec les codes du Barde : deux nouvelles pages, la lettre et le carnet ({L})')
    t = page(pg, 'vraielettre')
    verifier(pg.locator('#livre-ici .lv-page.on .ec-lettre .ec-M').count() >= 2 and pg.locator('#livre-ici .lv-page.on .ec-lettre .ec-vague').count() >= 5 and pg.locator('#livre-ici .lv-page.on .ec-lettre .pt-rond').count() >= 5 and 'fausse' not in t,
             'la lettre, écrite « à la manière d\'Odette » : des « M », des « t » en vague, des ronds sur les « i » ; aucun texte ne dit qu\'elle est fausse')
    shot(pg, 'A-lettre')
    t = page(pg, 'carnet')
    verifier(pg.locator('#livre-ici .lv-page.on .ec-chat').count() == 7 and pg.locator('#livre-ici .lv-page.on .ec-chat .ch-portrait').count() == 7 and pg.locator('#livre-ici .lv-page.on .ec-chat .ch-trace').count() == 7 and pg.locator('#livre-ici .lv-page.on .ec-chat .b-lire').count() == 7,
             'le carnet d\'Odette : sept chats, chacun son dessin, sa description, sa trace, son 🔊')
    verifier(pg.locator('#livre-ici .lv-page.on .ec-carnet .ec-vague').count() == 0 and pg.locator('#livre-ici .lv-page.on .ec-carnet .pt-rond').count() == 0 and pg.locator('#livre-ici .lv-page.on .ec-carnet .ec-chaton').count() >= 1,
             'la vraie écriture d\'Odette : ni vague ni rond, et un petit chat à côté de son « O »')
    verifier('_info:six_doigts' not in objets(pg) and pg.locator('#livre-ici .lv-page.on .b-donne').count() == 0, 'plus de code « Moustache a six doigts » : le Sage le dit à voix haute')
    shot(pg, 'A-carnet')
    pts = lieu(pg, 'mairie')
    verifier('rendu' in pts and 'livredor' not in pts, 'rendre le tableau : à la mairie, l\'après-midi')
    or0 = pg.evaluate("() => M.S.or || 0")
    pg.locator('#voile [data-act=point][data-id=rendu]').click(); pg.wait_for_timeout(250)
    verifier(pg.evaluate("() => M.S.or || 0") == or0 + 5 and 'accroche sous' not in texte(pg), '5 pièces d\'or ; plus de lettre accrochée sous le tableau')
    fermer(pg)
    code(pg, 'info:aveu')
    L2 = liste()
    verifier(pg.evaluate("() => !!M.P().recus['info:aveu']") and 'livredor' in L2 and 'quiecrit' in L2, 'l\'aveu : reçu ; le tableau rendu : le Livre d\'or et « Comparer les écritures » sont dans le Grand Livre')
    pg.close()

    print('— Partie B : le tableau raté')
    pg = debut(b, 'B')
    lieu(pg, 'mairie'); jouer(pg, 'tableau', False); fermer(pg)
    apresmidi(pg); pg.wait_for_timeout(2600)
    pts = lieu(pg, 'mairie')
    verifier('rendu' not in pts and 'sanstableau' in pts, f'tableau raté : rien à rendre, mais on peut passer voir le maire ({pts})')
    or0 = pg.evaluate("() => M.S.or || 0")
    pg.locator('#voile [data-act=point][data-id=sanstableau]').click(); pg.wait_for_timeout(250)
    verifier(not pg.evaluate("() => !!M.P().recus['obj:lettre']") and pg.evaluate("() => M.S.or || 0") == or0, 'sans tableau : pas d\'or, et plus de lettre donnée par le maire')
    pg.close()
    b.close()

print()
print('Erreurs de la console :', len(erreurs))
for e in erreurs[:12]: print('  ', e)
print('Échecs :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if echecs or erreurs else 0)
